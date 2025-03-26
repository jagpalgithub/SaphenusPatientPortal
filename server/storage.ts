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
    
    // Initialize with synchronous methods to avoid Promise issues in constructor
    this.initializeTestDataSync();
  }

  // This is a synchronous version of our initialization function to avoid Promise issues
  private initializeTestDataSync() {
    // Create users
    const adminUser: User = {
      id: this.currentIds.user++,
      username: "admin",
      password: "admin",
      email: "admin@saphenus.com",
      firstName: "Admin",
      lastName: "User",
      role: "patient",
      profileImage: null
    };
    
    this.users.set(adminUser.id, adminUser);
    
    // Create admin patient record
    const adminPatient: Patient = {
      id: this.currentIds.patient++,
      userId: adminUser.id,
      dateOfBirth: "1980-01-01",
      insuranceNumber: "AT9876543210",
      address: "Kärntner Straße 10, 1010 Vienna, Austria",
      phone: "+43 664 9876543",
      emergencyContact: "Hospital Emergency, +43 1 40400",
      amputationType: "Below Knee - Left Leg",
      amputationDate: "2022-05-15",
      prostheticType: "Suralis-Enhanced Lower Limb Prosthesis",
      prostheticSerialNumber: "SR-PLM-2022-0046",
      suralisSerialNumber: "SRL-V2-2022-A046"
    };
    this.patients.set(adminPatient.id, adminPatient);
    
    // Add basic health metrics for admin user
    const adminMetric: HealthMetric = {
      id: this.currentIds.healthMetric++,
      patientId: adminPatient.id,
      recordDate: new Date(),
      mobilityScore: 85,
      phantomPainScore: 2,
      sensorSensitivity: 90,
      stepCount: 6500,
      gaitStability: 88,
      notes: "Initial assessment for admin user"
    };
    this.healthMetrics.set(adminMetric.id, adminMetric);
    
    const patientUser: User = {
      id: this.currentIds.user++,
      username: "anna.wagner",
      password: "password",
      email: "anna@example.com",
      firstName: "Anna",
      lastName: "Wagner",
      role: "patient",
      profileImage: null
    };
    this.users.set(patientUser.id, patientUser);
    
    const doctorUser: User = {
      id: this.currentIds.user++,
      username: "dr.mueller",
      password: "password",
      email: "mueller@saphenus.com",
      firstName: "Andreas",
      lastName: "Müller",
      role: "doctor",
      profileImage: null
    };
    this.users.set(doctorUser.id, doctorUser);
    
    const nurseUser: User = {
      id: this.currentIds.user++,
      username: "nurse.schmidt",
      password: "password",
      email: "schmidt@saphenus.com",
      firstName: "Eva",
      lastName: "Schmidt",
      role: "doctor", // Using doctor role for access control
      profileImage: null
    };
    this.users.set(nurseUser.id, nurseUser);
    
    const technicianUser: User = {
      id: this.currentIds.user++,
      username: "tech.gruber",
      password: "password",
      email: "gruber@saphenus.com",
      firstName: "Thomas",
      lastName: "Gruber",
      role: "doctor", // Using doctor role for access control
      profileImage: null
    };
    this.users.set(technicianUser.id, technicianUser);
    
    // Create patient record
    const anna: Patient = {
      id: this.currentIds.patient++,
      userId: patientUser.id,
      dateOfBirth: "1985-06-15",
      insuranceNumber: "AT1234567890",
      address: "Rotenturmstraße 15/8, 1010 Vienna, Austria",
      phone: "+43 664 1234567",
      emergencyContact: "Michael Wagner (Husband), +43 664 7654321",
      amputationType: "Below Knee - Right Leg",
      amputationDate: "2022-01-10",
      prostheticType: "Suralis-Enhanced Lower Limb Prosthesis",
      prostheticSerialNumber: "SR-PLM-2022-0045",
      suralisSerialNumber: "SRL-V2-2022-A045"
    };
    this.patients.set(anna.id, anna);
    
    // Create medical staff records
    const doctor: MedicalStaff = {
      id: this.currentIds.medicalStaff++,
      userId: doctorUser.id,
      specialization: "Orthopedic Surgeon & Prosthetics Specialist",
      licenseNumber: "MD-AT-12345",
      availability: {
        monday: ["09:00-12:00", "13:00-17:00"],
        tuesday: ["09:00-12:00", "13:00-17:00"],
        wednesday: ["09:00-12:00", "13:00-17:00"],
        thursday: ["09:00-12:00", "13:00-17:00"],
        friday: ["09:00-12:00", "13:00-15:00"]
      }
    };
    this.medicalStaff.set(doctor.id, doctor);
    
    const nurse: MedicalStaff = {
      id: this.currentIds.medicalStaff++,
      userId: nurseUser.id,
      specialization: "Rehabilitation Nurse",
      licenseNumber: "RN-AT-54321",
      availability: {
        monday: ["08:00-16:00"],
        tuesday: ["08:00-16:00"],
        wednesday: ["08:00-16:00"],
        thursday: ["08:00-16:00"],
        friday: ["08:00-16:00"]
      }
    };
    this.medicalStaff.set(nurse.id, nurse);
    
    const technician: MedicalStaff = {
      id: this.currentIds.medicalStaff++,
      userId: technicianUser.id,
      specialization: "Suralis System Technician",
      licenseNumber: "TECH-SAP-4578",
      availability: {
        monday: ["10:00-18:00"],
        wednesday: ["10:00-18:00"],
        friday: ["10:00-18:00"]
      }
    };
    this.medicalStaff.set(technician.id, technician);
    
    const currentDate = new Date();
    
    // Add 6 months of health metrics data with realistic trends
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Mobility score gradually improving (0-100 scale)
      const mobilityScore = Math.min(95, 65 + (i * 5));
      
      // Phantom pain score gradually decreasing (0-10 scale, 0 is no pain)
      const phantomPainScore = Math.max(1, 8 - i);
      
      // Sensor sensitivity gradually improving (0-100 scale)
      const sensorSensitivity = Math.min(98, 75 + (i * 4));
      
      // Step count increasing as patient becomes more mobile
      const stepCount = 3000 + (i * 800);
      
      // Gait stability improving (0-100 scale)
      const gaitStability = Math.min(95, 70 + (i * 4));
      
      const notes = i === 0 
        ? "Latest assessment shows significant improvement in all metrics. Patient reports much better quality of life with improved gait stability and tactile feedback."
        : i === 1 
          ? "Suralis system recalibrated to increase sensitivity. Patient reports improved sensation."
          : i === 3
            ? "Patient experienced some phantom pain after extended walking."
            : null;
      
      const metric: HealthMetric = {
        id: this.currentIds.healthMetric++,
        patientId: anna.id,
        recordDate: date,
        mobilityScore,
        phantomPainScore,
        sensorSensitivity,
        stepCount,
        gaitStability,
        notes
      };
      this.healthMetrics.set(metric.id, metric);
    }
    
    // Add past, current, and future appointments
    const twoMonthsAgo = new Date(currentDate);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
    
    const pastAppointment1: Appointment = {
      id: this.currentIds.appointment++,
      patientId: anna.id,
      doctorId: doctor.id,
      dateTime: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 15, 10, 30),
      duration: 60,
      purpose: "Initial Suralis System Assessment",
      status: "completed",
      notes: "Patient adjusting well to the new sensory feedback system. Recommended physical therapy.",
      fee: 200.00,
      feePaid: true
    };
    this.appointments.set(pastAppointment1.id, pastAppointment1);
    
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    
    const pastAppointment2: Appointment = {
      id: this.currentIds.appointment++,
      patientId: anna.id,
      doctorId: technician.id,
      dateTime: new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth(), 10, 14, 0),
      duration: 45,
      purpose: "Suralis System Calibration",
      status: "completed",
      notes: "Adjusted sensitivity parameters. Patient reported immediate improvement in tactile sensation.",
      fee: 150.00,
      feePaid: true
    };
    this.appointments.set(pastAppointment2.id, pastAppointment2);
    
    // Current/upcoming appointments
    const upcomingAppointment1: Appointment = {
      id: this.currentIds.appointment++,
      patientId: anna.id,
      doctorId: doctor.id,
      dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5, 14, 30),
      duration: 30,
      purpose: "Routine Check-up",
      status: "scheduled",
      notes: "Follow-up on recent calibration and review latest metrics data",
      fee: 120.00,
      feePaid: false
    };
    this.appointments.set(upcomingAppointment1.id, upcomingAppointment1);
    
    const upcomingAppointment2: Appointment = {
      id: this.currentIds.appointment++,
      patientId: anna.id,
      doctorId: technician.id,
      dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 12, 10, 0),
      duration: 45,
      purpose: "Sensor Calibration & Firmware Update",
      status: "scheduled",
      notes: "Scheduled maintenance and update to latest Suralis system firmware",
      fee: 150.00,
      feePaid: false
    };
    this.appointments.set(upcomingAppointment2.id, upcomingAppointment2);
    
    // Add active prescriptions
    const prescription1: Prescription = {
      id: this.currentIds.prescription++,
      patientId: anna.id,
      doctorId: doctor.id,
      medicationName: "Gabapentin",
      dosage: "300mg",
      frequency: "1 capsule three times daily",
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15).toISOString().split('T')[0],
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 15).toISOString().split('T')[0],
      isActive: true,
      purpose: "For phantom limb pain management",
      refillsRemaining: 2,
      notes: null,
      type: "medication"
    };
    this.prescriptions.set(prescription1.id, prescription1);
    
    const prescription2: Prescription = {
      id: this.currentIds.prescription++,
      patientId: anna.id,
      doctorId: doctor.id,
      medicationName: "Physical Therapy",
      dosage: "45 minutes",
      frequency: "3 sessions per week",
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1).toISOString().split('T')[0],
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1).toISOString().split('T')[0],
      isActive: true,
      purpose: "For gait training and mobility improvement",
      refillsRemaining: 12,
      notes: null,
      type: "physical_therapy"
    };
    this.prescriptions.set(prescription2.id, prescription2);
    
    // Add device alerts
    const alert1: DeviceAlert = {
      id: this.currentIds.deviceAlert++,
      patientId: anna.id,
      timestamp: new Date(),
      alertType: "calibration",
      message: "Your Suralis sensory feedback system needs a calibration. Please schedule an appointment with Dr. Müller.",
      severity: "medium",
      isRead: false,
      isResolved: false,
      resolutionNotes: null
    };
    this.deviceAlerts.set(alert1.id, alert1);
    
    const alert2: DeviceAlert = {
      id: this.currentIds.deviceAlert++,
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1),
      alertType: "maintenance",
      message: "Battery level is low (15%). Please charge your device as soon as possible.",
      severity: "low",
      isRead: false,
      isResolved: false,
      resolutionNotes: null
    };
    this.deviceAlerts.set(alert2.id, alert2);
    
    // Add activity updates
    const update1: Update = {
      id: this.currentIds.update++,
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 3, 10, 23),
      type: "doctor_feedback",
      content: "Your mobility score has improved significantly. The adjustments we made to your Suralis system are working well.",
      sourceId: doctor.id,
      sourceType: "medical_staff",
      sourceName: "Dr. Andreas Müller",
      sourceImage: null
    };
    this.updates.set(update1.id, update1);
    
    const update2: Update = {
      id: this.currentIds.update++,
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 5, 14, 45),
      type: "prescription_update",
      content: "Your pain medication prescription has been updated. Please check the Prescriptions section for details.",
      sourceId: null,
      sourceType: "system",
      sourceName: "Prescription Updated",
      sourceImage: null
    };
    this.updates.set(update2.id, update2);
    
    const update3: Update = {
      id: this.currentIds.update++,
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 12, 9, 30),
      type: "system_calibration",
      content: "Your Suralis system has been successfully calibrated. Sensitivity has been adjusted to 78%.",
      sourceId: null,
      sourceType: "system",
      sourceName: "System Calibration Complete",
      sourceImage: null
    };
    this.updates.set(update3.id, update3);
    
    const update4: Update = {
      id: this.currentIds.update++,
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 16, 15),
      type: "achievement",
      content: "Congratulations! You've reached 7,000 steps in a day - a new personal record since your amputation.",
      sourceId: null,
      sourceType: "system",
      sourceName: "Achievement Unlocked",
      sourceImage: null
    };
    this.updates.set(update4.id, update4);
    
    // Add messages between Anna and her doctor
    const message1: Message = {
      id: this.currentIds.message++,
      senderId: patientUser.id,
      receiverId: doctorUser.id,
      content: "Dr. Müller, I've been experiencing some tingling sensations in my residual limb after walking for more than 20 minutes. Is this normal with the Suralis system?",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 15, 23),
      isRead: true
    };
    this.messages.set(message1.id, message1);
    
    const message2: Message = {
      id: this.currentIds.message++,
      senderId: doctorUser.id,
      receiverId: patientUser.id,
      content: "Hello Anna, this is normal as your nerves adjust to the new sensory input. It indicates the system is working properly. If the sensation becomes uncomfortable or painful, please let me know immediately.",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 16, 45),
      isRead: true
    };
    this.messages.set(message2.id, message2);
    
    const message3: Message = {
      id: this.currentIds.message++,
      senderId: patientUser.id,
      receiverId: doctorUser.id,
      content: "Thank you for the quick response! That's reassuring. The sensations aren't painful, just surprising sometimes. I'm really happy with how much more I can feel with the prosthetic now.",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 17, 20),
      isRead: true
    };
    this.messages.set(message3.id, message3);
    
    const message4: Message = {
      id: this.currentIds.message++,
      senderId: doctorUser.id,
      receiverId: patientUser.id,
      content: "That's excellent news, Anna! The Suralis system's ability to restore sensory feedback is truly remarkable. Remember to complete your daily calibration exercises in the app to keep improving your sensitivity.",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 9, 15),
      isRead: false
    };
    this.messages.set(message4.id, message4);
    
    // Messages with the technician
    const message5: Message = {
      id: this.currentIds.message++,
      senderId: patientUser.id,
      receiverId: technicianUser.id,
      content: "Hello Mr. Gruber, I noticed the battery on my Suralis device is draining faster than usual. Is there something I should check?",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 3, 11, 10),
      isRead: true
    };
    this.messages.set(message5.id, message5);
    
    const message6: Message = {
      id: this.currentIds.message++,
      senderId: technicianUser.id,
      receiverId: patientUser.id,
      content: "Hi Anna, check if any background apps are running that might be accessing the Suralis system continuously. Also, make sure you're using the official charger provided. If the issue persists, we should look at the device during your next appointment.",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 3, 13, 45),
      isRead: true
    };
    this.messages.set(message6.id, message6);
    
    // Add support requests
    const supportRequest1: SupportRequest = {
      id: this.currentIds.supportRequest++,
      patientId: anna.id,
      subject: "Problems pairing Suralis app with new smartphone",
      description: "I recently switched from an Android phone to an iPhone and I'm having trouble connecting the Suralis app to my prosthetic. The app doesn't seem to recognize the device.",
      status: "open",
      priority: "medium",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 4, 14, 30),
      assignedToId: null,
      resolutionNotes: null
    };
    this.supportRequests.set(supportRequest1.id, supportRequest1);
    
    const supportRequest2: SupportRequest = {
      id: this.currentIds.supportRequest++,
      patientId: anna.id,
      subject: "Request for additional Suralis charging cables",
      description: "I would like to purchase an additional charging cable for my office. Is this possible?",
      status: "resolved",
      priority: "low",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 15, 9, 45),
      assignedToId: technician.id,
      resolutionNotes: "Additional charging cable sent to patient's address. Invoice included in package."
    };
    this.supportRequests.set(supportRequest2.id, supportRequest2);
  }
  
  // Keeping this for reference, not used anymore as we're using the sync version
  private async initializeTestData() {
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
    
    const nurseUser = this.createUser({
      username: "nurse.schmidt",
      password: "password",
      email: "schmidt@saphenus.com",
      firstName: "Eva",
      lastName: "Schmidt",
      role: "doctor" // Using doctor role for access control
    });
    
    const technicianUser = this.createUser({
      username: "tech.gruber",
      password: "password",
      email: "gruber@saphenus.com",
      firstName: "Thomas",
      lastName: "Gruber",
      role: "doctor" // Using doctor role for access control
    });
    
    // Create patient record for Anna Wagner
    const anna = this.createPatient({
      userId: patientUser.id,
      dateOfBirth: new Date("1985-06-15"),
      insuranceNumber: "AT1234567890",
      address: "Rotenturmstraße 15/8, 1010 Vienna, Austria",
      phone: "+43 664 1234567",
      emergencyContact: "Michael Wagner (Husband), +43 664 7654321",
      amputationType: "Below Knee - Right Leg",
      amputationDate: new Date("2022-01-10"),
      prostheticType: "Suralis-Enhanced Lower Limb Prosthesis",
      prostheticSerialNumber: "SR-PLM-2022-0045",
      suralisSerialNumber: "SRL-V2-2022-A045"
    });
    
    // Create medical staff records
    const doctor = this.createMedicalStaff({
      userId: doctorUser.id,
      specialization: "Orthopedic Surgeon & Prosthetics Specialist",
      licenseNumber: "MD-AT-12345",
      availability: {
        monday: ["09:00-12:00", "13:00-17:00"],
        tuesday: ["09:00-12:00", "13:00-17:00"],
        wednesday: ["09:00-12:00", "13:00-17:00"],
        thursday: ["09:00-12:00", "13:00-17:00"],
        friday: ["09:00-12:00", "13:00-15:00"]
      }
    });
    
    const nurse = this.createMedicalStaff({
      userId: nurseUser.id,
      specialization: "Rehabilitation Nurse",
      licenseNumber: "RN-AT-54321",
      availability: {
        monday: ["08:00-16:00"],
        tuesday: ["08:00-16:00"],
        wednesday: ["08:00-16:00"],
        thursday: ["08:00-16:00"],
        friday: ["08:00-16:00"]
      }
    });
    
    const technician = this.createMedicalStaff({
      userId: technicianUser.id,
      specialization: "Suralis System Technician",
      licenseNumber: "TECH-SAP-4578",
      availability: {
        monday: ["10:00-18:00"],
        wednesday: ["10:00-18:00"],
        friday: ["10:00-18:00"]
      }
    });
    
    // Create health metrics for the patient
    const currentDate = new Date();
    
    // Add 6 months of health metrics data with realistic trends
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Mobility score gradually improving (0-100 scale)
      const mobilityScore = Math.min(95, 65 + (i * 5));
      
      // Phantom pain score gradually decreasing (0-10 scale, 0 is no pain)
      const phantomPainScore = Math.max(1, 8 - i);
      
      // Sensor sensitivity gradually improving (0-100 scale)
      const sensorSensitivity = Math.min(98, 75 + (i * 4));
      
      // Step count increasing as patient becomes more mobile
      const stepCount = 3000 + (i * 800);
      
      // Gait stability improving (0-100 scale)
      const gaitStability = Math.min(95, 70 + (i * 4));
      
      const notes = i === 0 
        ? "Latest assessment shows significant improvement in all metrics. Patient reports much better quality of life with improved gait stability and tactile feedback."
        : i === 1 
          ? "Suralis system recalibrated to increase sensitivity. Patient reports improved sensation."
          : i === 3
            ? "Patient experienced some phantom pain after extended walking."
            : undefined;
      
      this.createHealthMetric({
        patientId: anna.id,
        recordDate: date,
        mobilityScore,
        phantomPainScore,
        sensorSensitivity,
        stepCount,
        gaitStability,
        notes
      });
    }
    
    // Add past, current, and future appointments
    
    // Past appointments
    const twoMonthsAgo = new Date(currentDate);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
    
    this.createAppointment({
      patientId: anna.id,
      doctorId: doctor.id,
      dateTime: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 15, 10, 30),
      duration: 60,
      purpose: "Initial Suralis System Assessment",
      status: "completed",
      notes: "Patient adjusting well to the new sensory feedback system. Recommended physical therapy.",
      fee: 200.00,
      feePaid: true
    });
    
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    
    this.createAppointment({
      patientId: anna.id,
      doctorId: technician.id,
      dateTime: new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth(), 10, 14, 0),
      duration: 45,
      purpose: "Suralis System Calibration",
      status: "completed",
      notes: "Adjusted sensitivity parameters. Patient reported immediate improvement in tactile sensation.",
      fee: 150.00,
      feePaid: true
    });
    
    // Current/upcoming appointments
    this.createAppointment({
      patientId: anna.id,
      doctorId: doctor.id,
      dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5, 14, 30),
      duration: 30,
      purpose: "Routine Check-up",
      status: "scheduled",
      notes: "Follow-up on recent calibration and review latest metrics data",
      fee: 120.00,
      feePaid: false
    });
    
    this.createAppointment({
      patientId: anna.id,
      doctorId: technician.id,
      dateTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 12, 10, 0),
      duration: 45,
      purpose: "Sensor Calibration & Firmware Update",
      status: "scheduled",
      notes: "Scheduled maintenance and update to latest Suralis system firmware",
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
    
    this.createUpdate({
      patientId: anna.id,
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 16, 15),
      type: "achievement",
      content: "Congratulations! You've reached 7,000 steps in a day - a new personal record since your amputation.",
      sourceId: null,
      sourceType: "system",
      sourceName: "Achievement Unlocked",
      sourceImage: null
    });
    
    // Add messages between Anna and her doctor
    this.createMessage({
      senderId: patientUser.id,
      receiverId: doctorUser.id,
      content: "Dr. Müller, I've been experiencing some tingling sensations in my residual limb after walking for more than 20 minutes. Is this normal with the Suralis system?",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 15, 23),
      isRead: true
    });
    
    this.createMessage({
      senderId: doctorUser.id,
      receiverId: patientUser.id,
      content: "Hello Anna, this is normal as your nerves adjust to the new sensory input. It indicates the system is working properly. If the sensation becomes uncomfortable or painful, please let me know immediately.",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 16, 45),
      isRead: true
    });
    
    this.createMessage({
      senderId: patientUser.id,
      receiverId: doctorUser.id,
      content: "Thank you for the quick response! That's reassuring. The sensations aren't painful, just surprising sometimes. I'm really happy with how much more I can feel with the prosthetic now.",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 17, 20),
      isRead: true
    });
    
    this.createMessage({
      senderId: doctorUser.id,
      receiverId: patientUser.id,
      content: "That's excellent news, Anna! The Suralis system's ability to restore sensory feedback is truly remarkable. Remember to complete your daily calibration exercises in the app to keep improving your sensitivity.",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 9, 15),
      isRead: false
    });
    
    // Messages with the technician
    this.createMessage({
      senderId: patientUser.id,
      receiverId: technicianUser.id,
      content: "Hello Mr. Gruber, I noticed the battery on my Suralis device is draining faster than usual. Is there something I should check?",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 3, 11, 10),
      isRead: true
    });
    
    this.createMessage({
      senderId: technicianUser.id,
      receiverId: patientUser.id,
      content: "Hi Anna, check if any background apps are running that might be accessing the Suralis system continuously. Also, make sure you're using the official charger provided. If the issue persists, we should look at the device during your next appointment.",
      timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 3, 13, 45),
      isRead: true
    });
    
    // Add support requests
    this.createSupportRequest({
      patientId: anna.id,
      issue: "Problems pairing Suralis app with new smartphone",
      description: "I recently switched from an Android phone to an iPhone and I'm having trouble connecting the Suralis app to my prosthetic. The app doesn't seem to recognize the device.",
      status: "open",
      priority: "medium",
      createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 4, 14, 30),
      assignedToId: null,
      notes: null
    });
    
    this.createSupportRequest({
      patientId: anna.id,
      issue: "Request for additional Suralis charging cables",
      description: "I would like to purchase an additional charging cable for my office. Is this possible?",
      status: "resolved",
      priority: "low",
      createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 15, 9, 45),
      assignedToId: technician.id,
      notes: "Additional charging cable sent to patient's address. Invoice included in package."
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
    
    // Create a clean update object with validated fields
    const cleanUpdate: Partial<Patient> = {};
    
    // Process each field in the update
    Object.entries(patientUpdate).forEach(([key, value]) => {
      // Only include keys that exist in the patient object
      if (key in patient) {
        // Safely handle the update
        cleanUpdate[key as keyof Patient] = value;
      }
    });
    
    const updatedPatient = { ...patient, ...cleanUpdate };
    this.patients.set(id, updatedPatient);
    console.log(`Patient ${id} updated successfully:`, updatedPatient);
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
