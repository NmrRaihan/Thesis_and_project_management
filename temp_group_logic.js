// Temporary file to demonstrate the updated group creation logic
// This shows how the group creation should work with explicit leader assignment

const createGroupWithLeader = async (currentUser) => {
  // Generate unique group ID
  const groupId = `GRP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // Create group with explicit leader
  const newGroup = await db.entities.StudentGroup.create({
    group_id: groupId,
    group_name: `${currentUser.full_name}'s Group`,
    leader_student_id: currentUser.student_id,
    members: [{
      student_id: currentUser.student_id,
      role: 'leader'
    }],
    status: 'forming'
  });
  
  // Update student record
  await db.entities.Student.update(currentUser.id, { 
    group_id: newGroup.id,
    is_group_admin: 1
  });
  
  return newGroup;
};