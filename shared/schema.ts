import { pgTable, text, serial, integer, boolean, date, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base Users table - could be patients or medical staff
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("patient"), // 'patient', 'doctor', 'admin'
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Patient specific information
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dateOfBirth: date("date_of_birth"),
  insuranceNumber: text("insurance_number"),
  address: text("address"),
  phone: text("phone"),
  emergencyContact: text("emergency_contact"),
  amputationType: text("amputation_type"), // e.g., "Below Knee", "Above Knee"
  amputationDate: date("amputation_date"),
  prostheticType: text("prosthetic_type"),
  prostheticSerialNumber: text("prosthetic_serial_number"),
  suralisSerialNumber: text("suralis_serial_number"), // Suralis sensory feedback system
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true
});

// Medical staff information (doctors, nurses, etc.)
export const medicalStaff = pgTable("medical_staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialization: text("specialization"),
  licenseNumber: text("license_number"),
  availability: json("availability"),
});

export const insertMedicalStaffSchema = createInsertSchema(medicalStaff).omit({
  id: true
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => medicalStaff.id),
  dateTime: timestamp("date_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'cancelled'
  notes: text("notes"),
  fee: real("fee"),
  feePaid: boolean("fee_paid").default(false),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true
});

// Health Metrics
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  recordDate: timestamp("record_date").notNull(),
  mobilityScore: integer("mobility_score"), // 0-100
  phantomPainScore: integer("phantom_pain_score"), // 0-10
  sensorSensitivity: integer("sensor_sensitivity"), // percentage
  stepCount: integer("step_count"),
  gaitStability: integer("gait_stability"), // percentage
  notes: text("notes"),
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true
});

// Prescriptions
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => medicalStaff.id),
  medicationName: text("medication_name"),
  dosage: text("dosage"),
  frequency: text("frequency"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  purpose: text("purpose"),
  refillsRemaining: integer("refills_remaining"),
  notes: text("notes"),
  type: text("type").notNull(), // 'medication', 'physical_therapy', 'device_maintenance'
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true
});

// Device Alerts
export const deviceAlerts = pgTable("device_alerts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  timestamp: timestamp("timestamp").notNull(),
  alertType: text("alert_type").notNull(), // 'calibration', 'maintenance', 'error'
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'low', 'medium', 'high'
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  resolutionNotes: text("resolution_notes"),
});

export const insertDeviceAlertSchema = createInsertSchema(deviceAlerts).omit({
  id: true
});

// Activity Updates
export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  timestamp: timestamp("timestamp").notNull(),
  type: text("type").notNull(), // 'doctor_feedback', 'prescription_update', 'system_calibration'
  content: text("content").notNull(),
  sourceId: integer("source_id"), // ID of related appointment, prescription, etc.
  sourceType: text("source_type"), // 'appointment', 'prescription', 'device_alert'
  sourceName: text("source_name"), // Name of the doctor, system, etc.
  sourceImage: text("source_image"), // Profile image or icon
});

export const insertUpdateSchema = createInsertSchema(updates).omit({
  id: true
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true
});

// Support Requests
export const supportRequests = pgTable("support_requests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  timestamp: timestamp("timestamp").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  assignedToId: integer("assigned_to_id").references(() => medicalStaff.id),
  resolutionNotes: text("resolution_notes"),
});

export const insertSupportRequestSchema = createInsertSchema(supportRequests).omit({
  id: true
});

// Exporting types for use in frontend and backend
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type MedicalStaff = typeof medicalStaff.$inferSelect;
export type InsertMedicalStaff = z.infer<typeof insertMedicalStaffSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type DeviceAlert = typeof deviceAlerts.$inferSelect;
export type InsertDeviceAlert = z.infer<typeof insertDeviceAlertSchema>;

export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type SupportRequest = typeof supportRequests.$inferSelect;
export type InsertSupportRequest = z.infer<typeof insertSupportRequestSchema>;
