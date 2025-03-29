import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSymptomSchema, 
  insertTriggerSchema, 
  insertCommonSymptomSchema,
  insertMedicationSchema,
  insertUserProfileSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { createObjectCsvWriter } from "csv-writer";
import { join } from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Get all symptoms
  app.get("/api/symptoms", async (_req: Request, res: Response) => {
    try {
      const symptoms = await storage.getSymptoms();
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  // Get symptom by ID
  app.get("/api/symptoms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid symptom ID" });
      }
      
      const symptom = await storage.getSymptomById(id);
      if (!symptom) {
        return res.status(404).json({ message: "Symptom not found" });
      }
      
      res.json(symptom);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptom" });
    }
  });

  // Get symptoms by date range
  app.get("/api/symptoms/range", async (req: Request, res: Response) => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date range provided" });
      }
      
      const symptoms = await storage.getSymptomsByDateRange(startDate, endDate);
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptoms by date range" });
    }
  });

  // Add a new symptom
  app.post("/api/symptoms", async (req: Request, res: Response) => {
    try {
      const symptomData = insertSymptomSchema.parse(req.body);
      const symptom = await storage.insertSymptom(symptomData);
      res.status(201).json(symptom);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to add symptom" });
    }
  });

  // Delete a symptom
  app.delete("/api/symptoms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid symptom ID" });
      }
      
      const success = await storage.deleteSymptom(id);
      if (!success) {
        return res.status(404).json({ message: "Symptom not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete symptom" });
    }
  });

  // Get all triggers
  app.get("/api/triggers", async (_req: Request, res: Response) => {
    try {
      const triggers = await storage.getTriggers();
      res.json(triggers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch triggers" });
    }
  });

  // Add a new trigger
  app.post("/api/triggers", async (req: Request, res: Response) => {
    try {
      const triggerData = insertTriggerSchema.parse(req.body);
      const trigger = await storage.insertTrigger(triggerData);
      res.status(201).json(trigger);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to add trigger" });
    }
  });

  // Get all common symptoms
  app.get("/api/common-symptoms", async (_req: Request, res: Response) => {
    try {
      const symptoms = await storage.getCommonSymptoms();
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch common symptoms" });
    }
  });

  // Add a new common symptom
  app.post("/api/common-symptoms", async (req: Request, res: Response) => {
    try {
      const symptomData = insertCommonSymptomSchema.parse(req.body);
      const symptom = await storage.insertCommonSymptom(symptomData);
      res.status(201).json(symptom);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to add common symptom" });
    }
  });
  
  // Export symptoms as CSV
  app.get("/api/export/csv", async (_req: Request, res: Response) => {
    try {
      const symptoms = await storage.getSymptoms();
      
      if (symptoms.length === 0) {
        return res.status(404).json({ message: "No symptoms to export" });
      }
      
      const tempDir = join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const csvFilePath = join(tempDir, 'symptoms_export.csv');
      
      const csvWriter = createObjectCsvWriter({
        path: csvFilePath,
        header: [
          { id: 'id', title: 'ID' },
          { id: 'name', title: 'Symptom' },
          { id: 'severity', title: 'Severity (1-10)' },
          { id: 'duration', title: 'Duration' },
          { id: 'durationType', title: 'Duration Type' },
          { id: 'date', title: 'Date' },
          { id: 'triggers', title: 'Triggers' },
          { id: 'notes', title: 'Notes' },
          { id: 'reliefMethods', title: 'Relief Methods' },
          { id: 'reliefEffectiveness', title: 'Relief Effectiveness' }
        ]
      });
      
      // Format the data for CSV export
      const records = symptoms.map(symptom => ({
        ...symptom,
        date: new Date(symptom.date).toLocaleString(),
        triggers: Array.isArray(symptom.triggers) ? symptom.triggers.join(', ') : '',
        reliefMethods: Array.isArray(symptom.reliefMethods) ? symptom.reliefMethods.join(', ') : ''
      }));
      
      await csvWriter.writeRecords(records as any);
      
      res.download(csvFilePath, 'symptoms_export.csv', (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up the temp file after sending
        fs.unlinkSync(csvFilePath);
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export symptoms" });
    }
  });
  
  // Medication routes
  
  // Get all medications
  app.get("/api/medications", async (_req: Request, res: Response) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });
  
  // Get active medications
  app.get("/api/medications/active", async (_req: Request, res: Response) => {
    try {
      const medications = await storage.getActiveMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active medications" });
    }
  });
  
  // Get medication by ID
  app.get("/api/medications/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medication ID" });
      }
      
      const medication = await storage.getMedicationById(id);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });
  
  // Add a new medication
  app.post("/api/medications", async (req: Request, res: Response) => {
    try {
      const medicationData = insertMedicationSchema.parse(req.body);
      const medication = await storage.insertMedication(medicationData);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to add medication" });
    }
  });
  
  // Update a medication
  app.patch("/api/medications/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medication ID" });
      }
      
      // Validate update data
      const updateData = insertMedicationSchema.partial().parse(req.body);
      
      const updatedMedication = await storage.updateMedication(id, updateData);
      if (!updatedMedication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(updatedMedication);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update medication" });
    }
  });
  
  // Delete a medication
  app.delete("/api/medications/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medication ID" });
      }
      
      const success = await storage.deleteMedication(id);
      if (!success) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });
  
  // User profile routes
  
  // Get user profile
  app.get("/api/profile", async (_req: Request, res: Response) => {
    try {
      const profile = await storage.getUserProfile();
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  
  // Update user profile
  app.patch("/api/profile", async (req: Request, res: Response) => {
    try {
      // Validate update data
      const updateData = insertUserProfileSchema.partial().parse(req.body);
      
      const updatedProfile = await storage.updateUserProfile(updateData);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
