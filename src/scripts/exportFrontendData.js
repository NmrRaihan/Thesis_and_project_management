// Script to export all frontend localStorage data
export const exportAllFrontendData = () => {
  const allData = {};
  
  // Get all localStorage keys that start with 'entity_'
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

// Function to display the data in a readable format
export const displayFrontendData = () => {
  const data = exportAllFrontendData();
  
  console.log('=== FRONTEND DATA EXPORT ===\n');
  
  Object.keys(data).forEach(entityKey => {
    const entityName = entityKey.replace('entity_', '');
    console.log(`📁 ${entityName.toUpperCase()}:`);
    console.log(`   Count: ${data[entityKey].length}`);
    
    if (data[entityKey].length > 0) {
      console.log('   Records:');
      data[entityKey].forEach((item, index) => {
        if (entityName === 'Student') {
          console.log(`     ${index + 1}. ${item.full_name} (${item.student_id}) - ${item.email}`);
        } else if (entityName === 'Teacher') {
          console.log(`     ${index + 1}. ${item.full_name} (${item.teacher_id}) - ${item.email}`);
        } else if (entityName === 'StudentGroup') {
          console.log(`     ${index + 1}. ${item.group_name || 'Unnamed Group'} - ${item.member_ids?.length || 0} members`);
        } else {
          console.log(`     ${index + 1}. ${item.id} - ${JSON.stringify(item).substring(0, 100)}...`);
        }
      });
    }
    console.log('');
  });
  
  return data;
};

// Export as JSON file
export const exportToFrontendFile = () => {
  const data = exportAllFrontendData();
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'frontend-data-export.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ Frontend data exported to frontend-data-export.json');
  return data;
};

// Run automatically when script is loaded
if (typeof window !== 'undefined') {
  console.log('Frontend data export utilities loaded. Use:');
  console.log('- displayFrontendData() to view data in console');
  console.log('- exportToFrontendFile() to download JSON file');
}