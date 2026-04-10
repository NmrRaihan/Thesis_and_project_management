/**
 * Script to clean up duplicate group invitations
 * Keeps only the most recent invitation per (from_student, to_student, group) combination
 */

const base44 = require('./src/api/base44Client').base44;

async function cleanupDuplicateInvitations() {
  console.log('🧹 Starting invitation cleanup...\n');
  
  // Get all invitations
  const allInvitations = await base44.entities.GroupInvitation.list();
  console.log(`Total invitations found: ${allInvitations.length}\n`);
  
  // Group invitations by unique key: from_student_id + to_student_id + group_id
  const invitationGroups = new Map();
  
  for (const invite of allInvitations) {
    const key = `${invite.from_student_id}_${invite.to_student_id}_${invite.group_id}`;
    
    if (!invitationGroups.has(key)) {
      invitationGroups.set(key, []);
    }
    invitationGroups.get(key).push(invite);
  }
  
  console.log(`Unique invitation combinations: ${invitationGroups.size}\n`);
  
  let deletedCount = 0;
  let keptCount = 0;
  
  // For each group, keep only the most recent one
  for (const [key, invites] of invitationGroups.entries()) {
    if (invites.length > 1) {
      console.log(`Found ${invites.length} duplicates for: ${key}`);
      
      // Sort by created_at (newest first)
      invites.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Keep the first (most recent), delete the rest
      const toKeep = invites[0];
      const toDelete = invites.slice(1);
      
      console.log(`  ✓ Keeping: ${toKeep.id} (${toKeep.status}) - ${toKeep.created_at}`);
      
      for (const invite of toDelete) {
        console.log(`  🗑️  Deleting: ${invite.id} (${invite.status}) - ${invite.created_at}`);
        await base44.entities.GroupInvitation.delete(invite.id);
        deletedCount++;
      }
      
      keptCount++;
      console.log('');
    }
  }
  
  console.log('\n✅ Cleanup Complete!');
  console.log(`   Kept: ${keptCount} invitation groups`);
  console.log(`   Deleted: ${deletedCount} duplicate invitations`);
  console.log(`   Remaining total: ${allInvitations.length - deletedCount}\n`);
}

// Run the cleanup
if (typeof window === 'undefined') {
  // Running in Node.js
  cleanupDuplicateInvitations().catch(console.error);
} else {
  // Running in browser
  console.log('Run this in browser console:');
  console.log('cleanupDuplicateInvitations()');
  window.cleanupDuplicateInvitations = cleanupDuplicateInvitations;
}

module.exports = { cleanupDuplicateInvitations };

