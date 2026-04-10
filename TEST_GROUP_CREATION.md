# Quick Test Guide - Group Creation & Messaging

## 🎯 Testing Objective
Verify that after creating a group and friends accepting invitations, everyone can message each other and see all members.

## 📋 Prerequisites
- Development server running (`npm run dev`)
- At least 2-3 student accounts created

## 🚀 Step-by-Step Test

### Phase 1: Create Group (Student A - Leader)

1. **Login as Student A**
   - Go to `/student/login`
   - Enter credentials for Student A

2. **Create a Group**
   - Click on "Select Partners" from dashboard
   - Click "Create Group" button
   - You should see: ✅ "Group created successfully! You are now the group leader."

3. **Invite Student B**
   - Search for Student B in the student list
   - Click "Invite to Group"
   - You should see: ✅ "Invitation sent to [Student B Name]"

4. **Verify Your Dashboard**
   - Go back to Dashboard
   - Check "Your Group" section
   - You should see yourself listed as Leader 👑

---

### Phase 2: Accept Invitation (Student B)

1. **Logout Student A, Login as Student B**
   - Use Student B credentials

2. **Check Invitations**
   - Go to "Group Invitations" or check dashboard
   - You should see: ⏳ Pending invitation from Student A

3. **Accept the Invitation**
   - Click "Accept" button
   - You should see: ✅ "Joined group successfully!"
   - Redirected to dashboard

4. **Verify Dashboard**
   - Check "Your Group" section
   - You should see:
     - Student A as Leader 👑
     - Yourself as Member
     - Total: 2/3 members

5. **Try Group Chat**
   - Click "Group Chat" from navigation
   - You should see:
     - Student A in members list (top right avatars)
     - Chat interface loaded
     - Send a test message: "Hello from Student B!"

---

### Phase 3: Verify Messaging (Back to Student A)

1. **Logout Student B, Login as Student A**

2. **Check Dashboard**
   - You should see:
     - Student B now listed in "Your Group"
     - Member count: 2/3 or 3/3

3. **Open Group Chat**
   - Click "Group Chat"
   - You should see:
     - Both members visible (Student A & B)
     - Message from Student B visible
     - Reply with: "Welcome Student B!"

---

### Phase 4: Add Third Member (Optional - Student C)

1. **Student A invites Student C**
   - Go to "Invite Students"
   - Search and invite Student C
   - Send invitation

2. **Student C accepts**
   - Login as Student C
   - Accept invitation
   - Check dashboard

3. **All Members Verify**
   - Login as any member (A, B, or C)
   - Dashboard should show all 3 members
   - Group chat should have all 3 members
   - Everyone can message each other

---

## ✅ Success Criteria

### After Accepting Invitation:
- [ ] Member appears in dashboard "Your Group" section
- [ ] Member count is accurate (2/3 or 3/3)
- [ ] Leader badge/crown visible on correct person
- [ ] All members can access Group Chat
- [ ] All members visible in chat header (avatars)
- [ ] Messages can be sent and received by all members
- [ ] Real-time updates working (messages appear within 5 seconds)

### Visual Checks:

**Dashboard - Your Group Section:**
```
┌─────────────────────────────────────┐
│ Your Group                    2/3   │
├─────────────────────────────────────┤
│ 👤 Student A (Leader) 👑           │
│ 👤 Student B (Member)              │
└─────────────────────────────────────┘
```

**Group Chat Header:**
```
┌─────────────────────────────────────┐
│ 💬 Group Chat          2 members    │
│ [Avatar A] [Avatar B]               │
└─────────────────────────────────────┘
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Member Not Showing in Dashboard
**Solution**: Refresh the page (F5). The data should load from database.

### Issue 2: Chat Shows "No Group Yet"
**Possible Causes**:
- `group_id` not set in student record
- Group not created properly

**Solution**: 
1. Check browser console (F12) for errors
2. Verify in localStorage that `currentUser.group_id` exists

### Issue 3: Can't Send Messages
**Check**:
- Are you logged in as the correct user?
- Is `group_id` present in your user data?
- Is the group chat loading all members?

### Issue 4: Only See Yourself in Members List
**Solution**: 
- The member who accepted might not have been added to group's `members` array
- This should be fixed with the new code - try again with fresh accounts

---

## 🔍 Debugging Tips

### Check Browser Console
Press F12 and look for:
- Red errors (critical issues)
- Yellow warnings (potential problems)

### Check LocalStorage
Open DevTools → Application → Local Storage
Look for:
- `currentUser` → Should have `group_id` and `is_group_admin`
- `userType` → Should be "student"

### Check Database
If you have access to the backend:
```javascript
// Check group
db.StudentGroup.findOne({ leader_student_id: "STU_XXX" })

// Check members
db.Student.find({ group_id: "GRP_XXX" })
```

---

## 📊 Expected Data Structure

### StudentGroup Document:
```json
{
  "group_id": "GRP_1234567890_abcde",
  "group_name": "John Doe's Group",
  "leader_student_id": "STU_001",
  "members": [
    {
      "student_id": "STU_001",
      "full_name": "John Doe",
      "role": "leader"
    },
    {
      "student_id": "STU_002",
      "full_name": "Jane Smith",
      "role": "member"
    }
  ],
  "status": "forming"
}
```

### Student Document (after joining):
```json
{
  "student_id": "STU_002",
  "full_name": "Jane Smith",
  "group_id": "GRP_1234567890_abcde",
  "group_name": "John Doe's Group",
  "is_group_admin": false
}
```

### GroupInvitation Document:
```json
{
  "from_student_id": "STU_001",
  "to_student_id": "STU_002",
  "group_id": "GRP_1234567890_abcde",
  "status": "accepted"
}
```

---

## 🎉 Final Verification

If everything works:
1. ✅ All members can see each other in dashboard
2. ✅ All members can access group chat
3. ✅ Messages are visible to all members
4. ✅ Member count is accurate
5. ✅ Roles (leader/member) are correctly assigned

**Congratulations!** The group creation process is working correctly! 🎊

---

## 📝 Notes

- Maximum group size: 3 members (1 leader + 2 members)
- Each student can only accept ONE invitation
- Once in a group, student cannot join another group
- Leader has `is_group_admin: true`, members have `false`
- Group status starts as "forming", changes to "active" when supervisor assigned
