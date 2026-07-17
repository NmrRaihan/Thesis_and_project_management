// Simplified Database Service - LocalStorage Only
import { base44 } from '../api/base44Client';
import logger from '../utils/logger';

class DatabaseService {
  constructor() {
    // Always use localStorage
    logger.info('DatabaseService', 'Initialized (localStorage only)');
  }

  // Student methods
  async getStudents() {
    return await base44.entities.Student.list();
  }

  async getAvailableStudentsForInvitation(currentStudent) {
    const allStudents = await base44.entities.Student.list();
    return allStudents.filter(student => 
      student.student_id !== currentStudent?.student_id &&
      !student.group_id && 
      student.status === 'active'
    );
  }

  async createStudent(studentData) {
    return await base44.entities.Student.create(studentData);
  }

  async updateStudent(id, studentData) {
    return await base44.entities.Student.update(id, studentData);
  }

  async getStudentById(id) {
    return await base44.entities.Student.findById(id);
  }

  async filterStudents(criteria) {
    return await base44.entities.Student.filter(criteria);
  }

  // Teacher methods
  async getTeachers() {
    return await base44.entities.Teacher.list();
  }

  async createTeacher(teacherData) {
    return await base44.entities.Teacher.create(teacherData);
  }

  async updateTeacher(id, teacherData) {
    return await base44.entities.Teacher.update(id, teacherData);
  }

  async getTeacherById(id) {
    return await base44.entities.Teacher.findById(id);
  }

  async filterTeachers(criteria) {
    return await base44.entities.Teacher.filter(criteria);
  }

  // Admin methods
  async getAdmins() {
    return await base44.entities.Admin.list();
  }

  async createAdmin(adminData) {
    return await base44.entities.Admin.create(adminData);
  }

  // Generic methods for other entities
  async getEntity(entityName, criteria = null) {
    const entity = base44.entities[entityName];
    if (entity) {
      if (criteria) {
        return await entity.filter(criteria);
      }
      return await entity.list();
    }
    return [];
  }

  async createEntity(entityName, data) {
    const entity = base44.entities[entityName];
    if (entity) {
      return await entity.create(data);
    }
    throw new Error(`Entity ${entityName} not found`);
  }

  async updateEntity(entityName, id, data) {
    const entity = base44.entities[entityName];
    if (entity) {
      return await entity.update(id, data);
    }
    throw new Error(`Entity ${entityName} not found`);
  }

  async deleteEntity(entityName, id) {
    const entity = base44.entities[entityName];
    if (entity) {
      return await entity.delete(id);
    }
    throw new Error(`Entity ${entityName} not found`);
  }
}

// Create singleton instance
const db = new DatabaseService();

// Export with consistent API
export const databaseService = {
  entities: {
    Student: {
      list: () => db.getStudents(),
      filter: (criteria) => db.filterStudents(criteria),
      findById: (id) => db.getStudentById(id),
      create: (data) => db.createStudent(data),
      update: (id, data) => db.updateStudent(id, data),
      delete: (id) => db.deleteEntity('Student', id),
      getAvailableForInvitation: (currentStudent) => db.getAvailableStudentsForInvitation(currentStudent)
    },
    Teacher: {
      list: () => db.getTeachers(),
      filter: (criteria) => db.filterTeachers(criteria),
      findById: (id) => db.getTeacherById(id),
      create: (data) => db.createTeacher(data),
      update: (id, data) => db.updateTeacher(id, data),
      delete: (id) => db.deleteEntity('Teacher', id)
    },
    Admin: {
      list: () => db.getAdmins(),
      filter: (criteria) => db.getEntity('Admin', criteria),
      findById: (id) => db.getEntity('Admin').then(admins => admins.find(a => a.id === id)),
      create: (data) => db.createAdmin(data),
      update: (id, data) => db.updateEntity('Admin', id, data),
      delete: (id) => db.deleteEntity('Admin', id)
    },
    StudentGroup: {
      list: () => db.getEntity('StudentGroup'),
      filter: (criteria) => db.getEntity('StudentGroup', criteria),
      findById: (id) => db.getEntity('StudentGroup').then(groups => groups.find(g => g.id === id)),
      create: (data) => db.createEntity('StudentGroup', data),
      update: (id, data) => db.updateEntity('StudentGroup', id, data),
      delete: (id) => db.deleteEntity('StudentGroup', id)
    },
    Proposal: {
      list: () => db.getEntity('Proposal'),
      filter: (criteria) => db.getEntity('Proposal', criteria),
      findById: (id) => db.getEntity('Proposal').then(proposals => proposals.find(p => p.id === id)),
      create: (data) => db.createEntity('Proposal', data),
      update: (id, data) => db.updateEntity('Proposal', id, data),
      delete: (id) => db.deleteEntity('Proposal', id)
    },
    Message: {
      list: () => db.getEntity('Message'),
      filter: (criteria) => db.getEntity('Message', criteria),
      findById: (id) => db.getEntity('Message').then(messages => messages.find(m => m.id === id)),
      create: (data) => db.createEntity('Message', data),
      update: (id, data) => db.updateEntity('Message', id, data),
      delete: (id) => db.deleteEntity('Message', id)
    },
    Meeting: {
      list: () => db.getEntity('Meeting'),
      filter: (criteria) => db.getEntity('Meeting', criteria),
      findById: (id) => db.getEntity('Meeting').then(meetings => meetings.find(m => m.id === id)),
      create: (data) => db.createEntity('Meeting', data),
      update: (id, data) => db.updateEntity('Meeting', id, data),
      delete: (id) => db.deleteEntity('Meeting', id)
    },
    Task: {
      list: () => db.getEntity('Task'),
      filter: (criteria) => db.getEntity('Task', criteria),
      findById: (id) => db.getEntity('Task').then(tasks => tasks.find(t => t.id === id)),
      create: (data) => db.createEntity('Task', data),
      update: (id, data) => db.updateEntity('Task', id, data),
      delete: (id) => db.deleteEntity('Task', id)
    },
    SharedFile: {
      list: () => db.getEntity('SharedFile'),
      filter: (criteria) => db.getEntity('SharedFile', criteria),
      findById: (id) => db.getEntity('SharedFile').then(files => files.find(f => f.id === id)),
      create: (data) => db.createEntity('SharedFile', data),
      update: (id, data) => db.updateEntity('SharedFile', id, data),
      delete: (id) => db.deleteEntity('SharedFile', id)
    },
    WeeklyProgress: {
      list: () => db.getEntity('WeeklyProgress'),
      filter: (criteria) => db.getEntity('WeeklyProgress', criteria),
      findById: (id) => db.getEntity('WeeklyProgress').then(progress => progress.find(p => p.id === id)),
      create: (data) => db.createEntity('WeeklyProgress', data),
      update: (id, data) => db.updateEntity('WeeklyProgress', id, data),
      delete: (id) => db.deleteEntity('WeeklyProgress', id)
    },
    SupervisionRequest: {
      list: () => db.getEntity('SupervisionRequest'),
      filter: (criteria) => db.getEntity('SupervisionRequest', criteria),
      findById: (id) => db.getEntity('SupervisionRequest').then(requests => requests.find(r => r.id === id)),
      create: (data) => db.createEntity('SupervisionRequest', data),
      update: (id, data) => db.updateEntity('SupervisionRequest', id, data),
      delete: (id) => db.deleteEntity('SupervisionRequest', id)
    },
    GroupInvitation: {
      list: () => db.getEntity('GroupInvitation'),
      filter: (criteria) => db.getEntity('GroupInvitation', criteria),
      findById: (id) => db.getEntity('GroupInvitation').then(invites => invites.find(i => i.id === id)),
      create: (data) => db.createEntity('GroupInvitation', data),
      update: (id, data) => db.updateEntity('GroupInvitation', id, data),
      delete: (id) => db.deleteEntity('GroupInvitation', id)
    },
    ThesisCompletionRequest: {
      list: () => db.getEntity('ThesisCompletionRequest'),
      filter: (criteria) => db.getEntity('ThesisCompletionRequest', criteria),
      findById: (id) => db.getEntity('ThesisCompletionRequest').then(requests => requests.find(r => r.id === id)),
      create: (data) => db.createEntity('ThesisCompletionRequest', data),
      update: (id, data) => db.updateEntity('ThesisCompletionRequest', id, data),
      delete: (id) => db.deleteEntity('ThesisCompletionRequest', id)
    },
    DefenseRegistration: {
      list: () => db.getEntity('DefenseRegistration'),
      filter: (criteria) => db.getEntity('DefenseRegistration', criteria),
      findById: (id) => db.getEntity('DefenseRegistration').then(items => items.find(i => i.id === id)),
      create: (data) => db.createEntity('DefenseRegistration', data),
      update: (id, data) => db.updateEntity('DefenseRegistration', id, data),
      delete: (id) => db.deleteEntity('DefenseRegistration', id)
    }
  }
};

export default db;
