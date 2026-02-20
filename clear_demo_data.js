// Simple script to clear all localStorage data
console.log('Clearing all localStorage data...');

// Clear all entity data from localStorage
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('entity_')) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`Removed: ${key}`);
});

console.log('All demo data has been cleared!');
console.log(`Cleared ${keysToRemove.length} entity storage entries.`);