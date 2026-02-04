// Script to clear all data
import { clearAllData } from './services/databaseService.js';

console.log('Clearing all data...');

try {
  await clearAllData();
  console.log('All data cleared successfully!');
} catch (error) {
  console.error('Failed to clear data:', error);
}