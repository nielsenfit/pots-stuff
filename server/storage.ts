import { 
  type Symptom, type InsertSymptom,
  type Trigger, type InsertTrigger,
  type CommonSymptom, type InsertCommonSymptom
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
}

export class MemStorage implements IStorage {
  private symptoms: Map<number, Symptom>;
  private triggers: Map<number, Trigger>;
  private commonSymptoms: Map<number, CommonSymptom>;
  private symptomId: number;
  private triggerId: number;
  private commonSymptomId: number;

  constructor() {
    this.symptoms = new Map();
    this.triggers = new Map();
    this.commonSymptoms = new Map();
    this.symptomId = 1;
    this.triggerId = 1;
    this.commonSymptomId = 1;
    
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
    const newSymptom: Symptom = { ...symptom, id };
    this.symptoms.set(id, newSymptom);
    return newSymptom;
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
}

export const storage = new MemStorage();
