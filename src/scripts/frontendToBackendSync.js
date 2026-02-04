// Script to synchronize frontend localStorage data to backend
// Run this in the browser console on your frontend application

async function syncFrontendToBackend() {
  console.log('🚀 Starting frontend to backend synchronization...\n');
  
  // 1. Export frontend data
  console.log('1. Exporting frontend data...');
  const frontendData = {};
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('entity_')) {
      try {
        frontendData[key] = JSON.parse(localStorage.getItem(key));
        console.log(`   ✓ ${key}: ${frontendData[key].length} records`);
      } catch (e) {
        console.error(`   ❌ Error parsing ${key}:`, e);
      }
    }
  });
  
  // 2. Display what we're going to sync
  console.log('\n2. Data to be synchronized:');
  Object.keys(frontendData).forEach(key => {
    const entityName = key.replace('entity_', '');
    console.log(`   ${entityName}: ${frontendData[key].length} records`);
  });
  
  // 3. Prepare data for backend API
  console.log('\n3. Preparing data for backend import...');
  
  // Transform data to match backend expectations
  const syncData = {
    students: frontendData['entity_Student'] || [],
    teachers: frontendData['entity_Teacher'] || [],
    groups: frontendData['entity_StudentGroup'] || [],
    proposals: frontendData['entity_Proposal'] || [],
    messages: frontendData['entity_Message'] || [],
    meetings: frontendData['entity_Meeting'] || [],
    tasks: frontendData['entity_Task'] || [],
    files: frontendData['entity_SharedFile'] || [],
    progress: frontendData['entity_WeeklyProgress'] || [],
    requests: frontendData['entity_SupervisionRequest'] || [],
    invitations: frontendData['entity_GroupInvitation'] || []
  };
  
  // 4. Send to backend sync endpoint (you'll need to implement this)
  try {
    console.log('\n4. Sending data to backend...');
    
    const response = await fetch('http://localhost:5000/api/sync/frontend-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Synchronization successful!');
      console.log('Response:', result);
    } else {
      const error = await response.json();
      console.log('❌ Synchronization failed:', error.message);
      
      // Fallback: Show data that would be sent
      console.log('\n📋 Data that would be synchronized:');
      console.log(JSON.stringify(syncData, null, 2));
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('\n📋 Data that would be synchronized:');
    console.log(JSON.stringify(syncData, null, 2));
  }
  
  return syncData;
}

// Alternative: Export data as JSON file
function exportFrontendDataToFile() {
  console.log('Exporting frontend data to file...');
  
  const frontendData = {};
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('entity_')) {
      try {
        frontendData[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        console.error(`Error parsing ${key}:`, e);
      }
    }
  });
  
  const jsonString = JSON.stringify(frontendData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'frontend-data-export.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ Data exported to frontend-data-export.json');
  console.log('You can import this file to the backend manually.');
  
  return frontendData;
}

// Display current frontend data
function showFrontendData() {
  console.log('=== CURRENT FRONTEND DATA ===\n');
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('entity_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const entityName = key.replace('entity_', '');
        console.log(`📁 ${entityName.toUpperCase()}: ${data.length} records`);
        
        if (data.length > 0) {
          console.log('   Sample records:');
          data.slice(0, 3).forEach((item, index) => {
            if (entityName === 'Student') {
              console.log(`     ${index + 1}. ${item.full_name} (${item.student_id})`);
            } else if (entityName === 'Teacher') {
              console.log(`     ${index + 1}. ${item.full_name} (${item.teacher_id})`);
            } else if (entityName === 'StudentGroup') {
              console.log(`     ${index + 1}. ${item.group_name || 'Unnamed Group'}`);
            } else {
              console.log(`     ${index + 1}. ${item.id || 'No ID'}`);
            }
          });
          if (data.length > 3) {
            console.log(`     ... and ${data.length - 3} more`);
          }
        }
        console.log('');
      } catch (e) {
        console.error(`Error parsing ${key}:`, e);
      }
    }
  });
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.syncFrontendToBackend = syncFrontendToBackend;
  window.exportFrontendDataToFile = exportFrontendDataToFile;
  window.showFrontendData = showFrontendData;
  
  console.log('🔧 Frontend sync utilities loaded!');
  console.log('Available commands:');
  console.log('- showFrontendData()          // Display current frontend data');
  console.log('- syncFrontendToBackend()     // Sync data to backend');
  console.log('- exportFrontendDataToFile()  // Export data to JSON file');
}

// For immediate execution when script loads
console.log('🚀 Frontend-Backend Sync Tools Ready!');
console.log('Run showFrontendData() to see what data exists in your frontend.');