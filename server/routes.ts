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
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
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

  // Login route
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
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
      const patient = await storage.updatePatient(parseInt(id), req.body);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      res.json(patient);
    } catch (error) {
      res.status(400).json({ message: 'Invalid patient data', error });
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
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
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
  app.get('/api/messages/user/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getUserMessages(parseInt(userId));
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
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
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
      const requestData = insertSupportRequestSchema.parse(req.body);
      const request = await storage.createSupportRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
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
