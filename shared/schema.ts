import { pgTable, text, serial, integer, timestamp, json, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the symptoms table
export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  severity: integer("severity").notNull(), // 1-10 scale
  duration: integer("duration").notNull(), // in minutes
  durationType: text("duration_type").notNull(), // "minutes", "hours", "days"
  date: timestamp("date").notNull().defaultNow(),
  triggers: json("triggers").$type<string[]>().default([]),
  notes: text("notes"),
  reliefMethods: json("relief_methods").$type<string[]>().default([]),
  reliefEffectiveness: integer("relief_effectiveness"), // 1-10 scale, optional
});

// Define the triggers table for common triggers
export const triggers = pgTable("triggers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Define the common symptoms table
export const commonSymptoms = pgTable("common_symptoms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Define insert schemas
export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
});

export const insertTriggerSchema = createInsertSchema(triggers).omit({
  id: true,
});

export const insertCommonSymptomSchema = createInsertSchema(commonSymptoms).omit({
  id: true,
});

// Define types
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;

export type InsertTrigger = z.infer<typeof insertTriggerSchema>;
export type Trigger = typeof triggers.$inferSelect;

export type InsertCommonSymptom = z.infer<typeof insertCommonSymptomSchema>;
export type CommonSymptom = typeof commonSymptoms.$inferSelect;

// Define the medications table
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(), // e.g., "10mg"
  frequency: text("frequency").notNull(), // e.g., "twice daily"
  timeOfDay: json("time_of_day").$type<string[]>().default([]), // e.g., ["morning", "evening"]
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"), // Optional end date
  notes: text("notes"),
  active: boolean("active").default(true),
  reminderEnabled: boolean("reminder_enabled").default(false),
  reminderTimes: json("reminder_times").$type<string[]>().default([]), // Times for reminders
});

// Define the user profile table
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  diagnosisDate: timestamp("diagnosis_date"),
  healthConditions: json("health_conditions").$type<string[]>().default([]),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  doctorName: text("doctor_name"),
  doctorPhone: text("doctor_phone"),
  reminderPreference: text("reminder_preference").default("app"), // "app", "email", etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define insert schemas for new tables
export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Define types for new tables
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Define medication frequency types
export const MEDICATION_FREQUENCY = {
  ONCE_DAILY: "Once daily",
  TWICE_DAILY: "Twice daily",
  THREE_TIMES_DAILY: "Three times daily",
  FOUR_TIMES_DAILY: "Four times daily",
  EVERY_OTHER_DAY: "Every other day",
  WEEKLY: "Weekly",
  AS_NEEDED: "As needed",
  CUSTOM: "Custom"
};

// Define times of day
export const TIMES_OF_DAY = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  NIGHT: "Night",
  BEFORE_MEAL: "Before meal",
  WITH_MEAL: "With meal",
  AFTER_MEAL: "After meal"
};

// Define reminder preferences
export const REMINDER_PREFERENCES = {
  APP: "app",
  EMAIL: "email",
  BOTH: "both",
  NONE: "none"
};

// Define symptom severity levels for categorization
export const SEVERITY_LEVELS = {
  LOW: { min: 1, max: 3, label: "Mild" },
  MEDIUM: { min: 4, max: 7, label: "Moderate" },
  HIGH: { min: 8, max: 10, label: "Severe" }
};

// Define the salt intake tracking table
export const saltIntakes = pgTable("salt_intakes", {
  id: serial("id").primaryKey(),
  amount: real("amount").notNull(), // in grams
  date: timestamp("date").notNull().defaultNow(),
  source: text("source").notNull(), // e.g., "Salt tablet", "Food", "Electrolyte drink"
  notes: text("notes"),
});

// Define user salt intake targets/recommendations table
export const saltRecommendations = pgTable("salt_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1), // Default to primary user
  dailyTarget: real("daily_target").notNull(), // in grams
  maxSingleDose: real("max_single_dose"), // in grams
  minDailyAmount: real("min_daily_amount"), // in grams
  recommendedSources: json("recommended_sources").$type<string[]>().default([]),
  doctorNotes: text("doctor_notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define insert schemas for salt tracking
export const insertSaltIntakeSchema = createInsertSchema(saltIntakes).omit({
  id: true,
});

export const insertSaltRecommendationSchema = createInsertSchema(saltRecommendations).omit({
  id: true,
  updatedAt: true,
});

// Define types for salt tracking
export type InsertSaltIntake = z.infer<typeof insertSaltIntakeSchema>;
export type SaltIntake = typeof saltIntakes.$inferSelect;

export type InsertSaltRecommendation = z.infer<typeof insertSaltRecommendationSchema>;
export type SaltRecommendation = typeof saltRecommendations.$inferSelect;

// Define common salt sources for tracking
export const SALT_SOURCES = {
  SALT_TABLET: "Salt tablet",
  ELECTROLYTE_DRINK: "Electrolyte drink",
  FOOD: "Food item",
  SALT_STICK: "Salt stick",
  SALT_SUPPLEMENTS: "Salt supplement",
  TABLE_SALT: "Added table salt",
  OTHER: "Other source"
};
