// Hybrid database service - automatically switches between localStorage and backend
import { db as hybridDb } from './hybridDatabaseService.js';

// Use hybrid database service
export const db = hybridDb;

// Helper function to clear all data (for testing purposes)
export const clearAllData = async () => {
  // Clear all localStorage keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('entity_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('Cleared all database data from localStorage');
};

// Helper function to get all data for inspection
export const getAllData = async () => {
  // Get all localStorage data
  const allData = {};
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('entity_')) {
      try {
        allData[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        console.error(`Error parsing data for key ${key}:`, e);
      }
    }
  });
  return allData;
};