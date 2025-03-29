import { 
  type Symptom, type InsertSymptom,
  type Trigger, type InsertTrigger,
  type CommonSymptom, type InsertCommonSymptom,
  type Medication, type InsertMedication,
  type UserProfile, type InsertUserProfile,
  type SaltIntake, type InsertSaltIntake,
  type SaltRecommendation, type InsertSaltRecommendation
} from "@shared/schema";

export interface IStorage {
  // Symptom operations
  getSymptoms(): Promise<Symptom[]>;
  getSymptomById(id: number): Promise<Symptom | undefined>;
  getSymptomsByDateRange(startDate: Date, endDate: Date): Promise<Symptom[]>;
  insertSymptom(symptom: InsertSymptom): Promise<Symptom>;
  deleteSymptom(id: number): Promise<boolean>;
  
  // Trigger operations
  getTriggers(): Promise<Trigger[]>;
  getTriggerById(id: number): Promise<Trigger | undefined>;
  insertTrigger(trigger: InsertTrigger): Promise<Trigger>;
  
  // Common symptom operations
  getCommonSymptoms(): Promise<CommonSymptom[]>;
  insertCommonSymptom(symptom: InsertCommonSymptom): Promise<CommonSymptom>;
  
  // Medication operations
  getMedications(): Promise<Medication[]>;
  getMedicationById(id: number): Promise<Medication | undefined>;
  getActiveMedications(): Promise<Medication[]>;
  insertMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  
  // User profile operations
  getUserProfile(): Promise<UserProfile | undefined>;
  updateUserProfile(profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Salt intake operations
  getSaltIntakes(): Promise<SaltIntake[]>;
  getSaltIntakeById(id: number): Promise<SaltIntake | undefined>;
  getSaltIntakesByDateRange(startDate: Date, endDate: Date): Promise<SaltIntake[]>;
  insertSaltIntake(intake: InsertSaltIntake): Promise<SaltIntake>;
  deleteSaltIntake(id: number): Promise<boolean>;
  
  // Salt recommendation operations
  getSaltRecommendation(): Promise<SaltRecommendation | undefined>;
  updateSaltRecommendation(recommendation: Partial<InsertSaltRecommendation>): Promise<SaltRecommendation>;
}

export class MemStorage implements IStorage {
  private symptoms: Map<number, Symptom>;
  private triggers: Map<number, Trigger>;
  private commonSymptoms: Map<number, CommonSymptom>;
  private medications: Map<number, Medication>;
  private saltIntakes: Map<number, SaltIntake>;
  private saltRecommendation: SaltRecommendation | undefined;
  private userProfile: UserProfile | undefined;
  private symptomId: number;
  private triggerId: number;
  private commonSymptomId: number;
  private medicationId: number;
  private saltIntakeId: number;

  constructor() {
    this.symptoms = new Map();
    this.triggers = new Map();
    this.commonSymptoms = new Map();
    this.medications = new Map();
    this.saltIntakes = new Map();
    this.symptomId = 1;
    this.triggerId = 1;
    this.commonSymptomId = 1;
    this.medicationId = 1;
    this.saltIntakeId = 1;
    
    // Initialize with some common triggers
    this.insertTrigger({ name: "Stress" });
    this.insertTrigger({ name: "Lack of sleep" });
    this.insertTrigger({ name: "Food sensitivity" });
    this.insertTrigger({ name: "Exercise" });
    this.insertTrigger({ name: "Weather change" });
    
    // Initialize with some common symptoms
    this.insertCommonSymptom({ name: "Headache" });
    this.insertCommonSymptom({ name: "Nausea" });
    this.insertCommonSymptom({ name: "Fatigue" });
    this.insertCommonSymptom({ name: "Dizziness" });
    this.insertCommonSymptom({ name: "Joint Pain" });
    this.insertCommonSymptom({ name: "Fever" });
    this.insertCommonSymptom({ name: "Chest Pain" });
    this.insertCommonSymptom({ name: "Anxiety" });
  }

  // Symptom operations
  async getSymptoms(): Promise<Symptom[]> {
    return Array.from(this.symptoms.values());
  }

  async getSymptomById(id: number): Promise<Symptom | undefined> {
    return this.symptoms.get(id);
  }

  async getSymptomsByDateRange(startDate: Date, endDate: Date): Promise<Symptom[]> {
    return Array.from(this.symptoms.values()).filter(
      symptom => {
        const symptomDate = new Date(symptom.date);
        return symptomDate >= startDate && symptomDate <= endDate;
      }
    );
  }

  async insertSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const id = this.symptomId++;
    // Ensure all fields have proper types
    const processedSymptom = {
      ...symptom,
      id,
      date: symptom.date || new Date(),
      triggers: Array.isArray(symptom.triggers) ? symptom.triggers : [],
      notes: symptom.notes || null,
      reliefMethods: Array.isArray(symptom.reliefMethods) ? symptom.reliefMethods : [],
      reliefEffectiveness: symptom.reliefEffectiveness || null
    };
    
    this.symptoms.set(id, processedSymptom);
    return processedSymptom;
  }

  async deleteSymptom(id: number): Promise<boolean> {
    return this.symptoms.delete(id);
  }
  
  // Trigger operations
  async getTriggers(): Promise<Trigger[]> {
    return Array.from(this.triggers.values());
  }

  async getTriggerById(id: number): Promise<Trigger | undefined> {
    return this.triggers.get(id);
  }

  async insertTrigger(trigger: InsertTrigger): Promise<Trigger> {
    // Check if trigger already exists to avoid duplicates
    const existingTrigger = Array.from(this.triggers.values()).find(
      t => t.name.toLowerCase() === trigger.name.toLowerCase()
    );
    
    if (existingTrigger) {
      return existingTrigger;
    }
    
    const id = this.triggerId++;
    const newTrigger: Trigger = { ...trigger, id };
    this.triggers.set(id, newTrigger);
    return newTrigger;
  }
  
  // Common symptom operations
  async getCommonSymptoms(): Promise<CommonSymptom[]> {
    return Array.from(this.commonSymptoms.values());
  }

  async insertCommonSymptom(symptom: InsertCommonSymptom): Promise<CommonSymptom> {
    // Check if symptom already exists to avoid duplicates
    const existingSymptom = Array.from(this.commonSymptoms.values()).find(
      s => s.name.toLowerCase() === symptom.name.toLowerCase()
    );
    
    if (existingSymptom) {
      return existingSymptom;
    }
    
    const id = this.commonSymptomId++;
    const newSymptom: CommonSymptom = { ...symptom, id };
    this.commonSymptoms.set(id, newSymptom);
    return newSymptom;
  }
  
  // Medication operations
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }
  
  async getMedicationById(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }
  
  async getActiveMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      medication => medication.active
    );
  }
  
  async insertMedication(medication: InsertMedication): Promise<Medication> {
    const id = this.medicationId++;
    
    // Ensure all required fields are set with correct types
    const processedMedication = {
      ...medication,
      id,
      startDate: medication.startDate || new Date(),
      endDate: medication.endDate || null,
      notes: medication.notes || null,
      timeOfDay: Array.isArray(medication.timeOfDay) ? medication.timeOfDay : [],
      active: medication.active !== undefined ? medication.active : true,
      reminderEnabled: medication.reminderEnabled !== undefined ? medication.reminderEnabled : false,
      reminderTimes: Array.isArray(medication.reminderTimes) ? medication.reminderTimes : []
    };
    
    this.medications.set(id, processedMedication);
    return processedMedication;
  }
  
  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    const existingMedication = this.medications.get(id);
    
    if (!existingMedication) {
      return undefined;
    }
    
    // Ensure array fields are properly handled
    const processedUpdate = { ...medication };
    if (medication.timeOfDay) {
      processedUpdate.timeOfDay = Array.isArray(medication.timeOfDay) ? medication.timeOfDay : [];
    }
    if (medication.reminderTimes) {
      processedUpdate.reminderTimes = Array.isArray(medication.reminderTimes) ? medication.reminderTimes : [];
    }
    
    const updatedMedication: Medication = { ...existingMedication, ...processedUpdate };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }
  
  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }
  
  // User profile operations
  async getUserProfile(): Promise<UserProfile | undefined> {
    return this.userProfile;
  }
  
  async updateUserProfile(profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    // Process health conditions to ensure they're properly typed as string[]
    const processedProfile = { ...profile };
    if (profile.healthConditions) {
      processedProfile.healthConditions = Array.isArray(profile.healthConditions) 
        ? profile.healthConditions 
        : [];
    }
    
    if (!this.userProfile) {
      // Create a new profile with defaults if none exists
      this.userProfile = {
        id: 1,
        name: null,
        email: null,
        diagnosisDate: null,
        healthConditions: [],
        emergencyContact: null,
        emergencyPhone: null,
        doctorName: null,
        doctorPhone: null,
        reminderPreference: "app",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...processedProfile
      };
    } else {
      // Update existing profile
      this.userProfile = {
        ...this.userProfile,
        ...processedProfile,
        updatedAt: new Date()
      };
    }
    
    return this.userProfile;
  }
  
  // Salt intake operations
  async getSaltIntakes(): Promise<SaltIntake[]> {
    return Array.from(this.saltIntakes.values());
  }
  
  async getSaltIntakeById(id: number): Promise<SaltIntake | undefined> {
    return this.saltIntakes.get(id);
  }
  
  async getSaltIntakesByDateRange(startDate: Date, endDate: Date): Promise<SaltIntake[]> {
    return Array.from(this.saltIntakes.values()).filter(
      intake => {
        const intakeDate = new Date(intake.date);
        return intakeDate >= startDate && intakeDate <= endDate;
      }
    );
  }
  
  async insertSaltIntake(intake: InsertSaltIntake): Promise<SaltIntake> {
    const id = this.saltIntakeId++;
    
    // Ensure all fields have proper types
    const processedIntake = {
      ...intake,
      id,
      date: intake.date || new Date(),
      notes: intake.notes || null
    };
    
    this.saltIntakes.set(id, processedIntake);
    return processedIntake;
  }
  
  async deleteSaltIntake(id: number): Promise<boolean> {
    return this.saltIntakes.delete(id);
  }
  
  // Salt recommendation operations
  async getSaltRecommendation(): Promise<SaltRecommendation | undefined> {
    return this.saltRecommendation;
  }
  
  async updateSaltRecommendation(recommendation: Partial<InsertSaltRecommendation>): Promise<SaltRecommendation> {
    // Process recommended sources to ensure they're properly typed as string[]
    const processedRecommendation = { ...recommendation };
    if (recommendation.recommendedSources) {
      processedRecommendation.recommendedSources = Array.isArray(recommendation.recommendedSources) 
        ? recommendation.recommendedSources 
        : [];
    }
    
    if (!this.saltRecommendation) {
      // Create a new recommendation with defaults if none exists
      this.saltRecommendation = {
        id: 1,
        userId: 1,
        dailyTarget: recommendation.dailyTarget || 3.0, // Default 3g daily target 
        maxSingleDose: recommendation.maxSingleDose || 1.0, // Default 1g per dose
        minDailyAmount: recommendation.minDailyAmount || 2.0, // Default 2g minimum
        recommendedSources: processedRecommendation.recommendedSources || [],
        doctorNotes: recommendation.doctorNotes || null,
        updatedAt: new Date()
      };
    } else {
      // Update existing recommendation
      this.saltRecommendation = {
        ...this.saltRecommendation,
        ...processedRecommendation,
        updatedAt: new Date()
      };
    }
    
    return this.saltRecommendation;
  }
}

export const storage = new MemStorage();
