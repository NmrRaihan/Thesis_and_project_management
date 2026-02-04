// Script to list all data
import { getAllData } from './services/databaseService.js';

console.log('Listing all data...');

try {
  const allData = await getAllData();
  console.log('All data:');
  console.log(JSON.stringify(allData, null, 2));
} catch (error) {
  console.error('Failed to list data:', error);
}