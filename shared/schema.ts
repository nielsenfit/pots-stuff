import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
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

// Define symptom severity levels for categorization
export const SEVERITY_LEVELS = {
  LOW: { min: 1, max: 3, label: "Mild" },
  MEDIUM: { min: 4, max: 7, label: "Moderate" },
  HIGH: { min: 8, max: 10, label: "Severe" }
};
