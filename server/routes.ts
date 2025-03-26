import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema, insertPatientSchema, insertMedicalStaffSchema,
  insertAppointmentSchema, insertHealthMetricSchema, insertPrescriptionSchema,
  insertDeviceAlertSchema, insertUpdateSchema, insertMessageSchema,
  insertSupportRequestSchema
} from "@shared/schema";
import session from 'express-session';
import MemoryStore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// Set up authentication
const configureAuth = (app: Express) => {
  const SessionStore = MemoryStore(session);

  app.use(session({
    secret: 'saphenus-medical-pms-secret',
    resave: true,
    saveUninitialized: true,
    cookie: { 
      secure: false, // Set to false even in production for development
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: false, // Allow JavaScript access to cookies
      sameSite: 'lax' // Less restrictive SameSite policy
    },
    store: new SessionStore({
      checkPeriod: 24 * 60 * 60 * 1000 // Prune expired entries every 24h
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      // In a real app, you'd use proper password hashing
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Login route with proper session handling
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) { 
        return res.status(401).json({ message: 'Invalid credentials' }); 
      }
      req.login(user, (err) => {
        if (err) { return next(err); }
        return res.json(user);
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });

  // Get current authenticated user
  app.get('/api/auth/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json(req.user);
  });
};

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Middleware to check if user is a patient
const isPatient = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && (req.user as any).role === 'patient') {
    return next();
  }
  res.status(403).json({ message: 'Access denied' });
};

// Middleware to check if user is a doctor or admin
const isDoctor = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && (req.user as any).role === 'doctor') {
    return next();
  }
  res.status(403).json({ message: 'Access denied' });
};

// User routes
const setupUserRoutes = (app: Express) => {
  // Get users by role
  app.get('/api/users/role/:role', isAuthenticated, async (req, res) => {
    try {
      const { role } = req.params;
      const users = await storage.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get users', error });
    }
  });

  // Get current user's patient or medical staff record
  app.get('/api/users/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const role = (req.user as any).role;
      
      if (role === 'patient') {
        const patient = await storage.getPatientByUserId(userId);
        res.json(patient);
      } else if (role === 'doctor') {
        const medicalStaff = await storage.getMedicalStaffByUserId(userId);
        res.json(medicalStaff);
      } else {
        res.status(400).json({ message: 'Unknown role' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile', error });
    }
  });
  
  // Update user data 
  app.patch('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      
      // Get existing user
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // For security, ensure a user can only modify their own data
      const currentUserId = (req.user as any).id;
      if (userId !== currentUserId && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this user' });
      }
      
      console.log('Updating user data:', req.body);
      
      // Update the user object with the provided fields
      const updatedUser = {
        ...existingUser,
        ...req.body
      };
      
      // Ensure we don't accidentally change sensitive fields like role or username
      updatedUser.role = existingUser.role;
      updatedUser.username = existingUser.username;
      
      // Save and return the updated user
      // Since we don't have an updateUser method, we'll use a workaround to update just the user object
      // This is less than ideal but works for demo purposes
      storage.users.set(userId, updatedUser);
      
      console.log('User updated successfully:', updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      res.status(500).json({ message: 'Failed to update user', error });
    }
  });

  // Create a new user and associated profile
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body.user);
      const user = await storage.createUser(userData);

      if (userData.role === 'patient' && req.body.patient) {
        const patientData = insertPatientSchema.parse({
          ...req.body.patient,
          userId: user.id
        });
        const patient = await storage.createPatient(patientData);
        res.status(201).json({ user, patient });
      } else if (userData.role === 'doctor' && req.body.medicalStaff) {
        const medicalStaffData = insertMedicalStaffSchema.parse({
          ...req.body.medicalStaff,
          userId: user.id
        });
        const medicalStaff = await storage.createMedicalStaff(medicalStaffData);
        res.status(201).json({ user, medicalStaff });
      } else {
        res.status(201).json({ user });
      }
    } catch (error) {
      res.status(400).json({ message: 'Invalid data', error });
    }
  });
};

// Patient routes
const setupPatientRoutes = (app: Express) => {
  // Get all doctors
  app.get('/api/doctors', isAuthenticated, async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get doctors', error });
    }
  });
  
  // Update patient
  app.patch('/api/patients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Updating patient with ID:', id, 'Data:', req.body);
      
      // Clean up the data to handle null/undefined values properly
      const cleanedData: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(req.body)) {
        // Convert empty strings to null for database compatibility
        cleanedData[key] = value === "" ? null : value;
      }
      
      const patient = await storage.updatePatient(parseInt(id), cleanedData);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      console.log('Patient updated successfully:', patient);
      res.json(patient);
    } catch (error) {
      console.error('Failed to update patient:', error);
      res.status(400).json({ message: 'Invalid patient data', error });
    }
  });
  
  // Download patient data as CSV
  app.get('/api/patients/download-data', isAuthenticated, async (req, res) => {
    try {
      // Get the authenticated user's ID from the request
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Get the patient record for this user
      const patient = await storage.getPatientByUserId(userId);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      
      // Get all relevant patient data
      const metrics = await storage.getPatientHealthMetrics(patient.id);
      const appointments = await storage.getPatientAppointments(patient.id);
      const prescriptions = await storage.getPatientPrescriptions(patient.id);
      const alerts = await storage.getPatientDeviceAlerts(patient.id);
      const updates = await storage.getPatientUpdates(patient.id);
      
      // Get user data for patient details
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Generate CSV content
      let csvContent = "Saphenus Medical Technology - Patient Data Export\n";
      csvContent += `Generated on: ${new Date().toISOString()}\n\n`;
      
      // Patient Profile
      csvContent += "PATIENT INFORMATION\n";
      csvContent += `Patient ID,User ID,First Name,Last Name,Date of Birth,Insurance Number,Address,Phone,Emergency Contact\n`;
      csvContent += `${patient.id},${patient.userId},${user.firstName},${user.lastName},${patient.dateOfBirth || ''},${patient.insuranceNumber || ''},${patient.address || ''},${patient.phone || ''},${patient.emergencyContact || ''}\n\n`;
      
      // Amputation & Prosthetic Info
      csvContent += "AMPUTATION & PROSTHETIC INFORMATION\n";
      csvContent += `Amputation Type,Amputation Date,Prosthetic Type,Prosthetic Serial Number,Suralis Serial Number\n`;
      csvContent += `${patient.amputationType || ''},${patient.amputationDate || ''},${patient.prostheticType || ''},${patient.prostheticSerialNumber || ''},${patient.suralisSerialNumber || ''}\n\n`;
      
      // Health Metrics
      csvContent += "HEALTH METRICS\n";
      csvContent += "ID,Record Date,Mobility Score,Phantom Pain Score,Sensor Sensitivity,Step Count,Gait Stability,Notes\n";
      metrics.forEach(metric => {
        csvContent += `${metric.id},${metric.recordDate},${metric.mobilityScore},${metric.phantomPainScore},${metric.sensorSensitivity},${metric.stepCount},${metric.gaitStability},${metric.notes || ''}\n`;
      });
      csvContent += "\n";
      
      // Appointments
      csvContent += "APPOINTMENTS\n";
      csvContent += "ID,Doctor,Date & Time,Status,Purpose,Duration,Notes,Fee,Paid\n";
      appointments.forEach(appointment => {
        const doctorName = appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '';
        csvContent += `${appointment.id},${doctorName},${appointment.dateTime},${appointment.status},${appointment.purpose || ''},${appointment.duration || ''},${appointment.notes || ''},${appointment.fee || ''},${appointment.feePaid || ''}\n`;
      });
      csvContent += "\n";
      
      // Prescriptions
      csvContent += "PRESCRIPTIONS\n";
      csvContent += "ID,Doctor,Medication Name,Dosage,Frequency,Start Date,End Date,Active,Type,Purpose,Notes\n";
      prescriptions.forEach(prescription => {
        const doctorName = prescription.doctor ? `${prescription.doctor.firstName} ${prescription.doctor.lastName}` : '';
        csvContent += `${prescription.id},${doctorName},${prescription.medicationName || ''},${prescription.dosage || ''},${prescription.frequency || ''},${prescription.startDate},${prescription.endDate || ''},${prescription.isActive || ''},${prescription.type},${prescription.purpose || ''},${prescription.notes || ''}\n`;
      });
      csvContent += "\n";
      
      // Device Alerts
      csvContent += "DEVICE ALERTS\n";
      csvContent += "ID,Timestamp,Alert Type,Message,Severity,Is Read,Is Resolved,Resolution Notes\n";
      alerts.forEach(alert => {
        csvContent += `${alert.id},${alert.timestamp},${alert.alertType},${alert.message},${alert.severity},${alert.isRead},${alert.isResolved},${alert.resolutionNotes || ''}\n`;
      });
      csvContent += "\n";
      
      // Updates
      csvContent += "MEDICAL UPDATES\n";
      csvContent += "ID,Timestamp,Type,Content,Source Type,Source Name\n";
      updates.forEach(update => {
        csvContent += `${update.id},${update.timestamp},${update.type},${update.content},${update.sourceType || ''},${update.sourceName || ''}\n`;
      });
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="patient_data_${patient.id}_${new Date().toISOString().split('T')[0]}.csv"`);
      
      // Send the CSV data
      return res.send(csvContent);
    } catch (error) {
      console.error('Error downloading patient data:', error);
      return res.status(500).json({ message: 'Error generating patient data export' });
    }
  });
};

// Appointment routes
const setupAppointmentRoutes = (app: Express) => {
  // Get patient's appointments
  app.get('/api/appointments/patient/:patientId', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const appointments = await storage.getPatientAppointments(parseInt(patientId));
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get appointments', error });
    }
  });

  // Get doctor's appointments
  app.get('/api/appointments/doctor/:doctorId', isAuthenticated, async (req, res) => {
    try {
      const { doctorId } = req.params;
      const appointments = await storage.getDoctorAppointments(parseInt(doctorId));
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get appointments', error });
    }
  });

  // Create a new appointment
  app.post('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      console.log("Appointment creation - body:", req.body);
      // Use a more flexible schema to handle Date objects
      const appointmentData = {
        patientId: Number(req.body.patientId),
        doctorId: Number(req.body.doctorId),
        dateTime: new Date(req.body.dateTime),
        duration: Number(req.body.duration),
        purpose: String(req.body.purpose),
        status: req.body.status || 'scheduled',
        notes: req.body.notes || null,
        fee: req.body.fee !== undefined ? Number(req.body.fee) : null,
        feePaid: req.body.feePaid !== undefined ? Boolean(req.body.feePaid) : false
      };
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Appointment creation error:", error);
      res.status(400).json({ message: 'Invalid appointment data', error });
    }
  });

  // Update an appointment
  app.patch('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await storage.updateAppointment(parseInt(id), req.body);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: 'Invalid appointment data', error });
    }
  });

  // Delete an appointment
  app.delete('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAppointment(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete appointment', error });
    }
  });
};

// Health metrics routes
const setupHealthMetricsRoutes = (app: Express) => {
  // Get patient's health metrics
  app.get('/api/health-metrics/patient/:patientId', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const metrics = await storage.getPatientHealthMetrics(parseInt(patientId));
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get health metrics', error });
    }
  });

  // Get patient's latest health metrics
  app.get('/api/health-metrics/patient/:patientId/latest', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const metrics = await storage.getLatestPatientHealthMetrics(parseInt(patientId));
      if (!metrics) {
        return res.status(404).json({ message: 'No health metrics found' });
      }
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get latest health metrics', error });
    }
  });

  // Create new health metrics
  app.post('/api/health-metrics', isAuthenticated, async (req, res) => {
    try {
      const metricData = insertHealthMetricSchema.parse(req.body);
      const metric = await storage.createHealthMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ message: 'Invalid health metric data', error });
    }
  });
};

// Prescription routes
const setupPrescriptionRoutes = (app: Express) => {
  // Get patient's prescriptions
  app.get('/api/prescriptions/patient/:patientId', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const prescriptions = await storage.getPatientPrescriptions(parseInt(patientId));
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get prescriptions', error });
    }
  });

  // Get patient's active prescriptions
  app.get('/api/prescriptions/patient/:patientId/active', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const prescriptions = await storage.getActivePatientPrescriptions(parseInt(patientId));
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get active prescriptions', error });
    }
  });

  // Create a new prescription
  app.post('/api/prescriptions', isDoctor, async (req, res) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json(prescription);
    } catch (error) {
      res.status(400).json({ message: 'Invalid prescription data', error });
    }
  });

  // Update a prescription
  app.patch('/api/prescriptions/:id', isDoctor, async (req, res) => {
    try {
      const { id } = req.params;
      const prescription = await storage.updatePrescription(parseInt(id), req.body);
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      res.json(prescription);
    } catch (error) {
      res.status(400).json({ message: 'Invalid prescription data', error });
    }
  });
  
  // Request prescription refill
  app.post('/api/prescriptions/:id/refill', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const prescriptionId = parseInt(id);
      
      // Get the prescription
      const prescription = await storage.getPrescription(prescriptionId);
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      
      // Check if it's active
      if (!prescription.isActive) {
        return res.status(400).json({ message: 'Cannot refill inactive prescription' });
      }
      
      // Handle refill logic - in a real system, this would create a notification for the doctor
      // For now, we'll just update the prescription with a note about the refill request
      const updatedPrescription = await storage.updatePrescription(prescriptionId, {
        notes: prescription.notes 
          ? `${prescription.notes}\nRefill requested on ${new Date().toISOString().split('T')[0]}`
          : `Refill requested on ${new Date().toISOString().split('T')[0]}`
      });
      
      // Create an update to record this event
      await storage.createUpdate({
        patientId: prescription.patientId,
        type: 'prescription_refill',
        content: `Refill requested for ${prescription.medicationName}`,
        sourceType: 'prescription',
        sourceId: prescription.id,
        sourceName: 'Patient Request',
        timestamp: new Date()
      });
      
      res.json(updatedPrescription);
    } catch (error) {
      console.error("Prescription refill error:", error);
      res.status(500).json({ message: 'Failed to request prescription refill', error });
    }
  });
};

// Device alert routes
const setupDeviceAlertRoutes = (app: Express) => {
  // Get patient's device alerts
  app.get('/api/device-alerts/patient/:patientId', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const alerts = await storage.getPatientDeviceAlerts(parseInt(patientId));
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get device alerts', error });
    }
  });

  // Get patient's unread device alerts
  app.get('/api/device-alerts/patient/:patientId/unread', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const alerts = await storage.getUnreadPatientDeviceAlerts(parseInt(patientId));
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get unread device alerts', error });
    }
  });

  // Create a new device alert
  app.post('/api/device-alerts', async (req, res) => {
    try {
      const alertData = insertDeviceAlertSchema.parse(req.body);
      const alert = await storage.createDeviceAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: 'Invalid device alert data', error });
    }
  });

  // Mark a device alert as read
  app.patch('/api/device-alerts/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.markDeviceAlertAsRead(parseInt(id));
      if (!alert) {
        return res.status(404).json({ message: 'Device alert not found' });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark device alert as read', error });
    }
  });

  // Resolve a device alert
  app.patch('/api/device-alerts/:id/resolve', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const alert = await storage.resolveDeviceAlert(parseInt(id), notes || '');
      if (!alert) {
        return res.status(404).json({ message: 'Device alert not found' });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: 'Failed to resolve device alert', error });
    }
  });
};

// Update routes
const setupUpdateRoutes = (app: Express) => {
  // Get patient's updates
  app.get('/api/updates/patient/:patientId', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const updates = await storage.getPatientUpdates(parseInt(patientId));
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get updates', error });
    }
  });

  // Create a new update
  app.post('/api/updates', isAuthenticated, async (req, res) => {
    try {
      const updateData = insertUpdateSchema.parse(req.body);
      const update = await storage.createUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      res.status(400).json({ message: 'Invalid update data', error });
    }
  });
};

// Message routes
const setupMessageRoutes = (app: Express) => {
  // Get user's messages
  app.get('/api/messages/user/:userId?', isAuthenticated, async (req, res) => {
    try {
      // If userId is not provided in URL, use the current user's ID
      const userId = req.params.userId || (req.user as any)?.id;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const messages = await storage.getUserMessages(parseInt(userId.toString()));
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get messages', error });
    }
  });

  // Get conversation between two users
  app.get('/api/messages/conversation/:user1Id/:user2Id', isAuthenticated, async (req, res) => {
    try {
      const { user1Id, user2Id } = req.params;
      const messages = await storage.getConversation(parseInt(user1Id), parseInt(user2Id));
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get conversation', error });
    }
  });

  // Create a new message
  app.post('/api/messages', isAuthenticated, async (req, res) => {
    try {
      console.log('Received message data:', req.body);
      
      // Ensure timestamp is a valid Date object on the server side
      const messageData = {
        ...req.body,
        timestamp: new Date(req.body.timestamp)
      };
      
      // Parse with schema
      const validMessageData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validMessageData);
      
      console.log('Message created successfully:', message);
      res.status(201).json(message);
    } catch (error) {
      console.error('Failed to create message:', error);
      res.status(400).json({ message: 'Invalid message data', error });
    }
  });

  // Mark a message as read
  app.patch('/api/messages/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const message = await storage.markMessageAsRead(parseInt(id));
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark message as read', error });
    }
  });
};

// Simple test route for debugging
const setupTestRoutes = (app: Express) => {
  // Basic route for testing server connectivity - no authentication required
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running properly', timestamp: new Date().toISOString() });
  });
};

// Support request routes
const setupSupportRequestRoutes = (app: Express) => {
  // Get patient's support requests
  app.get('/api/support-requests/patient/:patientId', isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const requests = await storage.getPatientSupportRequests(parseInt(patientId));
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get support requests', error });
    }
  });

  // Get open support requests (for doctors/admins)
  app.get('/api/support-requests/open', isDoctor, async (req, res) => {
    try {
      const requests = await storage.getOpenSupportRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get open support requests', error });
    }
  });

  // Create a new support request
  app.post('/api/support-requests', isPatient, async (req, res) => {
    try {
      console.log('Received support request data:', req.body);
      
      // Ensure timestamp is a valid Date object on the server side
      const requestData = {
        ...req.body,
        timestamp: new Date(req.body.timestamp)
      };
      
      // Parse with schema
      const validRequestData = insertSupportRequestSchema.parse(requestData);
      const request = await storage.createSupportRequest(validRequestData);
      
      console.log('Support request created successfully:', request);
      res.status(201).json(request);
    } catch (error) {
      console.error('Failed to create support request:', error);
      res.status(400).json({ message: 'Invalid support request data', error });
    }
  });

  // Update support request status
  app.patch('/api/support-requests/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const request = await storage.updateSupportRequestStatus(parseInt(id), status, notes);
      if (!request) {
        return res.status(404).json({ message: 'Support request not found' });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update support request status', error });
    }
  });

  // Assign a support request to a medical staff
  app.patch('/api/support-requests/:id/assign', isDoctor, async (req, res) => {
    try {
      const { id } = req.params;
      const { staffId } = req.body;
      const request = await storage.assignSupportRequest(parseInt(id), parseInt(staffId));
      if (!request) {
        return res.status(404).json({ message: 'Support request not found' });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Failed to assign support request', error });
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up API routes
  app.use('/api', (req, res, next) => {
    res.header('Cache-Control', 'no-store');
    next();
  });

  // Configure authentication
  configureAuth(app);
  
  // Set up test routes first to ensure they're available even if other routes have issues
  setupTestRoutes(app);
  
  // Add a health check route for API testing but don't interfere with frontend routing
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Saphenus Medical Technology - Patient Management System Server is running!'
    });
  });
  
  // Set up all routes
  setupUserRoutes(app);
  setupPatientRoutes(app);
  setupAppointmentRoutes(app);
  setupHealthMetricsRoutes(app);
  setupPrescriptionRoutes(app);
  setupDeviceAlertRoutes(app);
  setupUpdateRoutes(app);
  setupMessageRoutes(app);
  setupSupportRequestRoutes(app);

  return httpServer;
}
