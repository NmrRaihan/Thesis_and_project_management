# System Requirements Implementation Plan

## Phase 1: Entity Schema Updates

### Task 1.1: Update Student Entity
- **File**: `src/Entities/Student.json`
- Add `semester` field with enum: `["Spring", "Summer", "Fall"]`
- Required field for new registrations

### Task 1.2: Create ThesisCompletionRequest Entity
- **File**: `src/Entities/ThesisCompletionRequest.json` (new)
- Fields:
  - `request_id`, `student_id`, `group_id`, `proposal_id`
  - `status`: `["pending_teacher", "teacher_approved", "teacher_rejected", "pending_admin", "admin_approved", "admin_rejected", "completed"]`
  - `teacher_feedback`, `admin_feedback`
  - `requested_at`, `teacher_reviewed_at`, `admin_reviewed_at`

---

## Phase 2: Student Registration - Semester Selection

### Task 2.1: Update StudentRegister.jsx
- **File**: `src/Pages/StudentRegister.jsx`
- Add semester dropdown (Spring, Summer, Fall)
- Add validation for semester selection
- Include semester in form submission

---

## Phase 3: Group Creation - Remove Admin Approval

### Task 3.1: Update CreateGroupRequest.jsx
- **File**: `src/Pages/CreateGroupRequest.jsx`
- Remove pending status flow
- Directly create StudentGroup with status "active"
- Display "Group Created" success message
- Auto-assign student as group leader

---

## Phase 4: Teacher-Student Visibility Rules

### Task 4.1: Update Student Views
- **Files**: `src/Pages/SuggestedTeachers.jsx`, `src/Pages/SelectPartners.jsx`
- Remove display of teacher's current student count/groups
- Students only see teacher's research field and topics

### Task 4.2: Update Teacher Dashboard
- **File**: `src/Pages/TeacherDashboard.jsx`
- Show total students connected
- Show total groups assigned
- Keep max_students editable by admin only

### Task 4.3: Admin Teacher Management
- **File**: `src/Pages/AdminTeacherDetail.jsx` or `AdminTeacherList.jsx`
- Allow admin to set/edit `max_students` per teacher

---

## Phase 5: Admin Panel Enhancements

### Task 5.1: Add Semester Filter to Admin Sidebar
- **File**: `src/components/dashboard/Sidebar.jsx`
- Add "Students by Semester" navigation item

### Task 5.2: Create Semester-wise Student List Page
- **File**: `src/Pages/AdminSemesterStudents.jsx` (new)
- Filter students by semester (Spring, Summer, Fall)
- Table view with student details

### Task 5.3: Update AdminDashboard.jsx
- **File**: `src/Pages/AdminDashboard.jsx`
- Add semester distribution stats

---

## Phase 6: Thesis/Project Completion Workflow

### Task 6.1: Add Completion Request to Student Sidebar
- **File**: `src/components/dashboard/Sidebar.jsx`
- Add "Thesis Completion Request" for supervised students

### Task 6.2: Create Student Completion Request Page
- **File**: `src/Pages/ThesisCompletionRequest.jsx` (new)
- Form for students to submit completion request
- Show status of request

### Task 6.3: Create Teacher Review Page
- **File**: `src/Pages/TeacherCompletionReview.jsx` (new)
- List pending completion requests
- Approve/Reject with feedback

### Task 6.4: Create Admin Completion Review Page
- **File**: `src/Pages/AdminCompletionReview.jsx` (new)
- List teacher-approved requests
- Final approve/reject

### Task 6.5: Create Thesis Complete List Page
- **File**: `src/Pages/AdminThesisCompleteList.jsx` (new)
- Display all completed thesis/projects
- Table with student, group, teacher, date

---

## Phase 7: Thesis Proposal Approval System

### Task 7.1: Update Proposal Workflow
- **File**: `src/Pages/CreateProposal.jsx`, `AdminProposalManagement.jsx`
- Ensure admin approval flow for proposals

### Task 7.2: Add Approved Proposal List to Admin Sidebar
- **File**: `src/components/dashboard/Sidebar.jsx`
- Add "Approved Proposals" navigation item

### Task 7.3: Create Approved Proposal List Page
- **File**: `src/Pages/AdminApprovedProposals.jsx` (new)
- Table/sheet view of approved proposals
- Student name, group, proposal title, field, approved date

---

## Phase 8: Routing Updates

### Task 8.1: Update main.jsx Routes
- **File**: `src/main.jsx`
- Add routes for all new pages

---

## Implementation Order

1. Entity Schema Updates (Phase 1)
2. Student Registration Semester (Phase 2)
3. Group Creation Flow (Phase 3)
4. Teacher Visibility Rules (Phase 4)
5. Admin Panel Enhancements (Phase 5)
6. Thesis Completion Workflow (Phase 6)
7. Proposal Approval System (Phase 7)
8. Routing Updates (Phase 8)

## Estimated Changes

- **New Files**: 6 pages + 1 entity = 7 files
- **Modified Files**: ~10 existing files
- **Total Lines**: ~2000-3000 lines of code