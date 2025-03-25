import {
  User, InsertUser, users,
  Patient, InsertPatient, patients,
  MedicalStaff, InsertMedicalStaff, medicalStaff,
  Appointment, InsertAppointment, appointments,
  HealthMetric, InsertHealthMetric, healthMetrics,
  Prescription, InsertPrescription, prescriptions,
  DeviceAlert, InsertDeviceAlert, deviceAlerts,
  Update, InsertUpdate, updates,
  Message, InsertMessage, messages,
  SupportRequest, InsertSupportRequest, supportRequests
} from "@shared/schema";

// Storage interface with all CRUD methods
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByUserId(userId: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<Patient>): Promise<Patient | undefined>;

  // Medical staff operations
  getMedicalStaff(id: number): Promise<MedicalStaff | undefined>;
  getMedicalStaffByUserId(userId: number): Promise<MedicalStaff | undefined>;
  getDoctors(): Promise<(MedicalStaff & { user: User })[]>;
  createMedicalStaff(staff: InsertMedicalStaff): Promise<MedicalStaff>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getPatientAppointments(patientId: number): Promise<(Appointment & { doctor: User })[]>;
  getDoctorAppointments(doctorId: number): Promise<(Appointment & { patient: User })[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Health metrics operations
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  getPatientHealthMetrics(patientId: number): Promise<HealthMetric[]>;
  getLatestPatientHealthMetrics(patientId: number): Promise<HealthMetric | undefined>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  
  // Prescription operations
  getPrescription(id: number): Promise<Prescription | undefined>;
  getPatientPrescriptions(patientId: number): Promise<(Prescription & { doctor: User })[]>;
  getActivePatientPrescriptions(patientId: number): Promise<(Prescription & { doctor: User })[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<Prescription>): Promise<Prescription | undefined>;
  
  // Device alert operations
  getDeviceAlert(id: number): Promise<DeviceAlert | undefined>;
  getPatientDeviceAlerts(patientId: number): Promise<DeviceAlert[]>;
  getUnreadPatientDeviceAlerts(patientId: number): Promise<DeviceAlert[]>;
  createDeviceAlert(alert: InsertDeviceAlert): Promise<DeviceAlert>;
  markDeviceAlertAsRead(id: number): Promise<DeviceAlert | undefined>;
  resolveDeviceAlert(id: number, notes: string): Promise<DeviceAlert | undefined>;
  
  // Update operations
  getUpdate(id: number): Promise<Update | undefined>;
  getPatientUpdates(patientId: number): Promise<Update[]>;
  createUpdate(update: InsertUpdate): Promise<Update>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getUserMessages(userId: number): Promise<(Message & { sender: User, receiver: User })[]>;
  getConversation(user1Id: number, user2Id: number): Promise<(Message & { sender: User, receiver: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Support request operations
  getSupportRequest(id: number): Promise<SupportRequest | undefined>;
  getPatientSupportRequests(patientId: number): Promise<SupportRequest[]>;
  getOpenSupportRequests(): Promise<(SupportRequest & { patient: Patient, assignedTo?: MedicalStaff })[]>;
  createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest>;
  updateSupportRequestStatus(id: number, status: string, notes?: string): Promise<SupportRequest | undefined>;
  assignSupportRequest(id: number, staffId: number): Promise<SupportRequest | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private medicalStaff: Map<number, MedicalStaff>;
  private appointments: Map<number, Appointment>;
  private healthMetrics: Map<number, HealthMetric>;
  private prescriptions: Map<number, Prescription>;
  private deviceAlerts: Map<number, DeviceAlert>;
  private updates: Map<number, Update>;
  private messages: Map<number, Message>;
  private supportRequests: Map<number, SupportRequest>;
  
  private currentIds: {
    user: number;
    patient: number;
    medicalStaff: number;
    appointment: number;
    healthMetric: number;
    prescription: number;
    deviceAlert: number;
    update: number;
    message: number;
    supportRequest: number;
  };

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.medicalStaff = new Map();
    this.appointments = new Map();
    this.healthMetrics = new Map();
    this.prescriptions = new Map();
    this.deviceAlerts = new Map();
    this.updates = new Map();
    this.messages = new Map();
    this.supportRequests = new Map();
    
    this.currentIds = {
      user: 1,
      patient: 1,
      medicalStaff: 1,
      appointment: 1,
      healthMetric: 1,
      prescription: 1,
      deviceAlert: 1,
      update: 1,
      message: 1,
      supportRequest: 1
    };
    
    // Initialize some test data
    this.initializeTestData();
  }

  private initializeTestData() {
    // Create initial users (doctors and a patient)
    const patientUser = this.createUser({
      username: "anna.wagner",
      password: "password",
      email: "anna@example.com",
      firstName: "Anna",
      lastName: "Wagner",
      role: "patient"
    });
    
    const doctorUser = this.createUser({
      username: "dr.mueller",
      password: "password",
      email: "mueller@saphenus.com",
      firstName: "Andreas",
      lastName: "Müller",
      role: "doctor"
    });
    
    // Create patient record
    const anna = this.createPatient({
      userId: patientUser.id,
      dateOfBirth: new Date("1985-06-15"),
      insuranceNumber: "AT1234567890",
      address: "Hauptstrasse 1, 1010 Vienna, Austria",
      phone: "+43 1 123456789",
      emergencyContact: "Michael Wagner, +43 1 987654321",
      amputationType: "Below Knee",
      amputationDate: new Date("2022-01-10"),
      prostheticType: "Standard Lower Limb Prosthesis",
      prostheticSerialNumber: "PLM-2022-001",
      suralisSerialNumber: "SRL-2022-001"
    });
    
    // Create doctor record
    const doctor = this.createMedicalStaff({
      userId: doctorUser.id,
      specialization: "Orthopedic Surgeon",
      licenseNumber: "MD-AT-12345",
      availability: {
        monday: ["09:00-12:00", "13:00-17:00"],
        tuesday: ["09:00-12:00", "13:00-17:00"],
        wednesday: ["09:00-12:00", "13:00-17:00"],
        thursday: ["09:00-12:00", "13:00-17:00"],
        friday: ["09:00-12:00", "13:00-15:00"]
      }
    });
    
    // Create health metrics for the patient
    const currentDate = new Date();
    
    // Add 6 months of health metrics data
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Mobility score gradually improving
      const mobilityScore = 65 + (i * 3);
      
      // Phantom pain score gradually decreasing
      const phantomPainScore = Math.max(2, 8 - i);
      
      this.createHealthMetric({
        patientId: anna.id,
        recordDate: date,
        mobilityScore,
        phantomPainScore,
        sensorSensitivity: 75 + (i * 1),
        stepCount: 3000 + (i * 500),
        gaitStability: 70 + (i * 2),
        notes: i === 0 ? "Latest assessment shows significant improvement" : undefined
      });
    }
    
    // Add appointments
    this.createAppointment({
      patientId: anna.id,
      doctorId: doctor.id,
      dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5, 14, 30),
      duration: 30,
      purpose: "Routine Check-up",
      status: "scheduled",
      notes: "Follow-up on recent calibration",
      fee: 120.00,
      feePaid: false
    });
    
    this.createAppointment({
      patientId: anna.id,
      doctorId: doctor.id,
      dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 12, 10, 0),
      duration: 45,
      purpose: "Sensor Calibration",
      status: "scheduled",
      notes: "Suralis System Maintenance",
      fee: 150.00,
      feePaid: false
    });
    
    // Add active prescriptions
    this.createPrescription({
      patientId: anna.id,
      doctorId: doctor.id,
      medicationName: "Gabapentin",
      dosage: "300mg",
      frequency: "1 capsule three times daily",
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 15),
      isActive: true,
      purpose: "For phantom limb pain management",
      refillsRemaining: 2,
      notes: null,
      type: "medication"
    });
    
    this.createPrescription({
      patientId: anna.id,
      doctorId: doctor.id,
      medicationName: "Physical Therapy",
      dosage: "45 minutes",
      frequency: "3 sessions per week",
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1),
      isActive: true,
      purpose: "For gait training and mobility improvement",
      refillsRemaining: 12,
      notes: null,
      type: "physical_therapy"
    });
    
    // Add device alerts
    this.createDeviceAlert({
      patientId: anna.id,
      timestamp: new Date(),
      alertType: "calibration",
      message: "Your Suralis sensory feedback system needs a calibration. Please schedule an appointment with Dr. Müller.",
      severity: "medium",
      isRead: false,
      isResolved: false,
      resolutionNotes: null
    });
    
    this.createDeviceAlert({
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1),
      alertType: "maintenance",
      message: "Battery level is low (15%). Please charge your device as soon as possible.",
      severity: "low",
      isRead: false,
      isResolved: false,
      resolutionNotes: null
    });
    
    // Add activity updates
    this.createUpdate({
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 3, 10, 23),
      type: "doctor_feedback",
      content: "Your mobility score has improved significantly. The adjustments we made to your Suralis system are working well.",
      sourceId: doctor.id,
      sourceType: "medical_staff",
      sourceName: "Dr. Andreas Müller",
      sourceImage: null
    });
    
    this.createUpdate({
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 5, 14, 45),
      type: "prescription_update",
      content: "Your pain medication prescription has been updated. Please check the Prescriptions section for details.",
      sourceId: null,
      sourceType: "system",
      sourceName: "Prescription Updated",
      sourceImage: null
    });
    
    this.createUpdate({
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 12, 9, 30),
      type: "system_calibration",
      content: "Your Suralis system has been successfully calibrated. Sensitivity has been adjusted to 78%.",
      sourceId: null,
      sourceType: "system",
      sourceName: "System Calibration Complete",
      sourceImage: null
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByUserId(userId: number): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(patient => patient.userId === userId);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = this.currentIds.patient++;
    const newPatient: Patient = { ...patient, id };
    this.patients.set(id, newPatient);
    return newPatient;
  }

  async updatePatient(id: number, patientUpdate: Partial<Patient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...patientUpdate };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  // Medical staff operations
  async getMedicalStaff(id: number): Promise<MedicalStaff | undefined> {
    return this.medicalStaff.get(id);
  }

  async getMedicalStaffByUserId(userId: number): Promise<MedicalStaff | undefined> {
    return Array.from(this.medicalStaff.values()).find(staff => staff.userId === userId);
  }

  async getDoctors(): Promise<(MedicalStaff & { user: User })[]> {
    const doctors: (MedicalStaff & { user: User })[] = [];
    
    for (const staff of this.medicalStaff.values()) {
      const user = this.users.get(staff.userId);
      if (user && user.role === 'doctor') {
        doctors.push({ ...staff, user });
      }
    }
    
    return doctors;
  }

  async createMedicalStaff(staff: InsertMedicalStaff): Promise<MedicalStaff> {
    const id = this.currentIds.medicalStaff++;
    const newStaff: MedicalStaff = { ...staff, id };
    this.medicalStaff.set(id, newStaff);
    return newStaff;
  }

  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getPatientAppointments(patientId: number): Promise<(Appointment & { doctor: User })[]> {
    const patientAppointments = Array.from(this.appointments.values())
      .filter(appointment => appointment.patientId === patientId);
    
    return Promise.all(patientAppointments.map(async (appointment) => {
      const medStaff = await this.getMedicalStaff(appointment.doctorId);
      const doctor = medStaff ? await this.getUser(medStaff.userId) : undefined;
      return {
        ...appointment,
        doctor: doctor!
      };
    }));
  }

  async getDoctorAppointments(doctorId: number): Promise<(Appointment & { patient: User })[]> {
    const doctorAppointments = Array.from(this.appointments.values())
      .filter(appointment => appointment.doctorId === doctorId);
    
    return Promise.all(doctorAppointments.map(async (appointment) => {
      const patientRecord = await this.getPatient(appointment.patientId);
      const patient = patientRecord ? await this.getUser(patientRecord.userId) : undefined;
      return {
        ...appointment,
        patient: patient!
      };
    }));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentIds.appointment++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentUpdate };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Health metrics operations
  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.get(id);
  }

  async getPatientHealthMetrics(patientId: number): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values())
      .filter(metric => metric.patientId === patientId)
      .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
  }

  async getLatestPatientHealthMetrics(patientId: number): Promise<HealthMetric | undefined> {
    const metrics = await this.getPatientHealthMetrics(patientId);
    return metrics.length > 0 ? metrics[metrics.length - 1] : undefined;
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.currentIds.healthMetric++;
    const newMetric: HealthMetric = { ...metric, id };
    this.healthMetrics.set(id, newMetric);
    return newMetric;
  }

  // Prescription operations
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async getPatientPrescriptions(patientId: number): Promise<(Prescription & { doctor: User })[]> {
    const patientPrescriptions = Array.from(this.prescriptions.values())
      .filter(prescription => prescription.patientId === patientId);
    
    return Promise.all(patientPrescriptions.map(async (prescription) => {
      const medStaff = await this.getMedicalStaff(prescription.doctorId);
      const doctor = medStaff ? await this.getUser(medStaff.userId) : undefined;
      return {
        ...prescription,
        doctor: doctor!
      };
    }));
  }

  async getActivePatientPrescriptions(patientId: number): Promise<(Prescription & { doctor: User })[]> {
    const allPrescriptions = await this.getPatientPrescriptions(patientId);
    return allPrescriptions.filter(prescription => prescription.isActive);
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const id = this.currentIds.prescription++;
    const newPrescription: Prescription = { ...prescription, id };
    this.prescriptions.set(id, newPrescription);
    return newPrescription;
  }

  async updatePrescription(id: number, prescriptionUpdate: Partial<Prescription>): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;
    
    const updatedPrescription = { ...prescription, ...prescriptionUpdate };
    this.prescriptions.set(id, updatedPrescription);
    return updatedPrescription;
  }

  // Device alert operations
  async getDeviceAlert(id: number): Promise<DeviceAlert | undefined> {
    return this.deviceAlerts.get(id);
  }

  async getPatientDeviceAlerts(patientId: number): Promise<DeviceAlert[]> {
    return Array.from(this.deviceAlerts.values())
      .filter(alert => alert.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getUnreadPatientDeviceAlerts(patientId: number): Promise<DeviceAlert[]> {
    const alerts = await this.getPatientDeviceAlerts(patientId);
    return alerts.filter(alert => !alert.isRead);
  }

  async createDeviceAlert(alert: InsertDeviceAlert): Promise<DeviceAlert> {
    const id = this.currentIds.deviceAlert++;
    const newAlert: DeviceAlert = { ...alert, id };
    this.deviceAlerts.set(id, newAlert);
    return newAlert;
  }

  async markDeviceAlertAsRead(id: number): Promise<DeviceAlert | undefined> {
    const alert = this.deviceAlerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, isRead: true };
    this.deviceAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async resolveDeviceAlert(id: number, notes: string): Promise<DeviceAlert | undefined> {
    const alert = this.deviceAlerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { 
      ...alert, 
      isResolved: true, 
      isRead: true,
      resolutionNotes: notes 
    };
    this.deviceAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Update operations
  async getUpdate(id: number): Promise<Update | undefined> {
    return this.updates.get(id);
  }

  async getPatientUpdates(patientId: number): Promise<Update[]> {
    return Array.from(this.updates.values())
      .filter(update => update.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createUpdate(update: InsertUpdate): Promise<Update> {
    const id = this.currentIds.update++;
    const newUpdate: Update = { ...update, id };
    this.updates.set(id, newUpdate);
    return newUpdate;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getUserMessages(userId: number): Promise<(Message & { sender: User, receiver: User })[]> {
    const userMessages = Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId);
    
    return Promise.all(userMessages.map(async (message) => {
      const sender = await this.getUser(message.senderId);
      const receiver = await this.getUser(message.receiverId);
      return {
        ...message,
        sender: sender!,
        receiver: receiver!
      };
    }));
  }

  async getConversation(user1Id: number, user2Id: number): Promise<(Message & { sender: User, receiver: User })[]> {
    const conversationMessages = Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return Promise.all(conversationMessages.map(async (message) => {
      const sender = await this.getUser(message.senderId);
      const receiver = await this.getUser(message.receiverId);
      return {
        ...message,
        sender: sender!,
        receiver: receiver!
      };
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const newMessage: Message = { ...message, id };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Support request operations
  async getSupportRequest(id: number): Promise<SupportRequest | undefined> {
    return this.supportRequests.get(id);
  }

  async getPatientSupportRequests(patientId: number): Promise<SupportRequest[]> {
    return Array.from(this.supportRequests.values())
      .filter(request => request.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getOpenSupportRequests(): Promise<(SupportRequest & { patient: Patient, assignedTo?: MedicalStaff })[]> {
    const openRequests = Array.from(this.supportRequests.values())
      .filter(request => request.status !== 'closed' && request.status !== 'resolved');
    
    return Promise.all(openRequests.map(async (request) => {
      const patient = await this.getPatient(request.patientId);
      const assignedTo = request.assignedToId ? await this.getMedicalStaff(request.assignedToId) : undefined;
      
      return {
        ...request,
        patient: patient!,
        assignedTo
      };
    }));
  }

  async createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest> {
    const id = this.currentIds.supportRequest++;
    const newRequest: SupportRequest = { ...request, id };
    this.supportRequests.set(id, newRequest);
    return newRequest;
  }

  async updateSupportRequestStatus(id: number, status: string, notes?: string): Promise<SupportRequest | undefined> {
    const request = this.supportRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      status,
      resolutionNotes: notes !== undefined ? notes : request.resolutionNotes
    };
    this.supportRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async assignSupportRequest(id: number, staffId: number): Promise<SupportRequest | undefined> {
    const request = this.supportRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      assignedToId: staffId,
      status: request.status === 'open' ? 'in_progress' : request.status
    };
    this.supportRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
