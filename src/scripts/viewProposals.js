// Script to view all student group proposals
import { db } from './nodeDatabaseService.js';

console.log('=== Student Group Proposals ===\n');

try {
  console.log('Fetching proposal data...\n');
  
  // Get all proposals
  const proposals = await db.entities.Proposal.list();
  
  if (proposals.length === 0) {
    console.log('No proposals found in the database.');
    console.log('Students need to create groups and submit proposals through the web interface.');
  } else {
    console.log(`Found ${proposals.length} proposal(s):\n`);
    
    for (const [index, proposal] of proposals.entries()) {
      console.log(`--- Proposal ${index + 1} ---`);
      console.log(`ID: ${proposal.id}`);
      console.log(`Title: ${proposal.title || 'No title'}`);
      console.log(`Status: ${proposal.status || 'draft'}`);
      console.log(`Project Type: ${proposal.project_type || 'thesis'}`);
      console.log(`Field: ${proposal.field || 'Not specified'}`);
      
      // Get the group information
      if (proposal.group_id) {
        const groups = await db.entities.StudentGroup.filter({ id: proposal.group_id });
        if (groups.length > 0) {
          const group = groups[0];
          console.log(`Group Name: ${group.name || 'Unnamed Group'}`);
          console.log(`Group ID: ${group.id}`);
          
          // Get group members
          const students = await db.entities.Student.filter({ group_id: group.id });
          if (students.length > 0) {
            console.log(`Group Members: ${students.map(s => s.full_name).join(', ')}`);
          }
        }
      }
      
      console.log(`Submitted: ${proposal.created_at ? new Date(proposal.created_at).toLocaleString() : 'Unknown'}`);
      
      if (proposal.description) {
        console.log(`Description: ${proposal.description.substring(0, 100)}${proposal.description.length > 100 ? '...' : ''}`);
      }
      
      if (proposal.keywords && proposal.keywords.length > 0) {
        console.log(`Keywords: ${proposal.keywords.join(', ')}`);
      }
      
      console.log('');
    }
  }
  
} catch (error) {
  console.error('❌ Failed to fetch proposal data:', error.message);
  process.exit(1);
}