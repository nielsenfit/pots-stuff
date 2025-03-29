import localforage from 'localforage';
import { Symptom } from '@shared/schema';

// Configure localforage
localforage.config({
  name: 'symptom-tracker',
  version: 1.0,
  storeName: 'symptoms',
  description: 'Storage for symptom tracking data'
});

// Define keys for data types
export const STORAGE_KEYS = {
  SYMPTOMS: 'symptoms',
  TRIGGERS: 'triggers',
  COMMON_SYMPTOMS: 'common_symptoms',
  LAST_SYNC: 'last_sync'
};

// Helper functions for symptom data
export async function storeSymptom(symptom: Symptom): Promise<void> {
  try {
    const symptoms = await getSymptoms();
    symptoms.push(symptom);
    await localforage.setItem(STORAGE_KEYS.SYMPTOMS, symptoms);
  } catch (error) {
    console.error('Error storing symptom:', error);
    throw error;
  }
}

export async function getSymptoms(): Promise<Symptom[]> {
  try {
    const symptoms = await localforage.getItem<Symptom[]>(STORAGE_KEYS.SYMPTOMS);
    return symptoms || [];
  } catch (error) {
    console.error('Error getting symptoms:', error);
    return [];
  }
}

export async function clearSymptoms(): Promise<void> {
  try {
    await localforage.setItem(STORAGE_KEYS.SYMPTOMS, []);
  } catch (error) {
    console.error('Error clearing symptoms:', error);
    throw error;
  }
}

// Function to sync data with server
export async function syncWithServer(): Promise<boolean> {
  try {
    const symptoms = await getSymptoms();
    
    // If we have offline symptoms, try to send them to the server
    if (symptoms.length > 0) {
      // Here we would normally send them to the server
      // For now, we'll just mark them as synced
      await localforage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error syncing with server:', error);
    return false;
  }
}

export default localforage;
