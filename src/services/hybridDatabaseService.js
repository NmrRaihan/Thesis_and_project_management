// Hybrid Database Service - Can use either localStorage or backend API
import { base44 } from '../api/base44Client';
import backendAPI from '../api/backendAPI';

class HybridDatabaseService {
  constructor() {
    // Check if backend is available
    this.useBackend = false;
    this.checkBackendConnection();
  }

  async checkBackendConnection() {
    try {
      // Test if backend is running
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        this.useBackend = true;
        console.log('✅ Backend connected successfully');
      } else {
        console.log('❌ Backend not available, using localStorage');
      }
    } catch (error) {
      console.log('❌ Backend not available, using localStorage:', error.message);
    }
  }

  // Student methods
  async getStudents() {
    if (this.useBackend) {
      try {
        const response = await backendAPI.getStudents();
        return response.students || [];
      } catch (error) {
        console.error('Backend fetch failed, falling back to localStorage:', error);
        return await base44.entities.Student.list();
      }
    }
    return await base44.entities.Student.list();
  }

  async createStudent(studentData) {
    if (this.useBackend) {
      try {
        const response = await backendAPI.createStudent(studentData);
        return response.student;
      } catch (error) {
        console.error('Backend create failed, falling back to localStorage:', error);
        return await base44.entities.Student.create(studentData);
      }
    }
    return await base44.entities.Student.create(studentData);
  }

  async updateStudent(id, studentData) {
    if (this.useBackend) {
      try {
        const response = await backendAPI.updateStudent(id, studentData);
        return response.student;
      } catch (error) {
        console.error('Backend update failed, falling back to localStorage:', error);
        return await base44.entities.Student.update(id, studentData);
      }
    }
    return await base44.entities.Student.update(id, studentData);
  }

  async getStudentById(id) {
    if (this.useBackend) {
      try {
        const response = await backendAPI.getStudentById(id);
        return response.student;
      } catch (error) {
        console.error('Backend fetch failed, falling back to localStorage:', error);
        return await base44.entities.Student.findById(id);
      }
    }
    return await base44.entities.Student.findById(id);
  }

  async filterStudents(criteria) {
    if (this.useBackend) {
      try {
        const students = await this.getStudents();
        return students.filter(student => {
          return Object.keys(criteria).every(key => student[key] === criteria[key]);
        });
      } catch (error) {
        console.error('Backend filter failed, falling back to localStorage:', error);
        return await base44.entities.Student.filter(criteria);
      }
    }
    return await base44.entities.Student.filter(criteria);
  }

  // Teacher methods
  async getTeachers() {
    if (this.useBackend) {
      try {
        const response = await backendAPI.getTeachers();
        return response.teachers || [];
      } catch (error) {
        console.error('Backend fetch failed, falling back to localStorage:', error);
        return await base44.entities.Teacher.list();
      }
    }
    return await base44.entities.Teacher.list();
  }

  async createTeacher(teacherData) {
    if (this.useBackend) {
      try {
        const response = await backendAPI.createTeacher(teacherData);
        return response.teacher;
      } catch (error) {
        console.error('Backend create failed, falling back to localStorage:', error);
        return await base44.entities.Teacher.create(teacherData);
      }
    }
    return await base44.entities.Teacher.create(teacherData);
  }

  async updateTeacher(id, teacherData) {
    if (this.useBackend) {
      try {
        const response = await backendAPI.updateTeacher(id, teacherData);
        return response.teacher;
      } catch (error) {
        console.error('Backend update failed, falling back to localStorage:', error);
        return await base44.entities.Teacher.update(id, teacherData);
      }
    }
    return await base44.entities.Teacher.update(id, teacherData);
  }

  async getTeacherById(id) {
    if (this.useBackend) {
      try {
        const response = await backendAPI.getTeacherById(id);
        return response.teacher;
      } catch (error) {
        console.error('Backend fetch failed, falling back to localStorage:', error);
        return await base44.entities.Teacher.findById(id);
      }
    }
    return await base44.entities.Teacher.findById(id);
  }

  async filterTeachers(criteria) {
    if (this.useBackend) {
      try {
        const teachers = await this.getTeachers();
        return teachers.filter(teacher => {
          return Object.keys(criteria).every(key => teacher[key] === criteria[key]);
        });
      } catch (error) {
        console.error('Backend filter failed, falling back to localStorage:', error);
        return await base44.entities.Teacher.filter(criteria);
      }
    }
    return await base44.entities.Teacher.filter(criteria);
  }

  // Admin methods
  async getAdmins() {
    if (this.useBackend) {
      try {
        const response = await backendAPI.getAdmins();
        return response.admins || [];
      } catch (error) {
        console.error('Backend fetch failed, falling back to localStorage:', error);
        return await base44.entities.Admin.list();
      }
    }
    return await base44.entities.Admin.list();
  }

  async createAdmin(adminData) {
    if (this.useBackend) {
      try {
        const response = await backendAPI.createAdmin(adminData);
        return response.admin;
      } catch (error) {
        console.error('Backend create failed, falling back to localStorage:', error);
        return await base44.entities.Admin.create(adminData);
      }
    }
    return await base44.entities.Admin.create(adminData);
  }

  // Generic methods for other entities
  async getEntity(entityName, criteria = null) {
    if (this.useBackend) {
      try {
        // For entities not yet implemented in backend, fall back to localStorage
        if (entityName === 'StudentGroup') {
          return await base44.entities.StudentGroup.list();
        } else if (entityName === 'Proposal') {
          return await base44.entities.Proposal.list();
        } else if (entityName === 'Message') {
          return await base44.entities.Message.list();
        } else if (entityName === 'Meeting') {
          return await base44.entities.Meeting.list();
        } else if (entityName === 'Task') {
          return await base44.entities.Task.list();
        } else if (entityName === 'SharedFile') {
          return await base44.entities.SharedFile.list();
        } else if (entityName === 'WeeklyProgress') {
          return await base44.entities.WeeklyProgress.list();
        } else if (entityName === 'SupervisionRequest') {
          return await base44.entities.SupervisionRequest.list();
        } else if (entityName === 'GroupInvitation') {
          return await base44.entities.GroupInvitation.list();
        }
      } catch (error) {
        console.error(`Backend fetch failed for ${entityName}, falling back to localStorage:`, error);
      }
    }
    
    // Fallback to localStorage
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
    if (this.useBackend) {
      // For now, most entities still use localStorage
      // Future: implement backend endpoints for all entities
    }
    
    const entity = base44.entities[entityName];
    if (entity) {
      return await entity.create(data);
    }
    throw new Error(`Entity ${entityName} not found`);
  }

  async updateEntity(entityName, id, data) {
    if (this.useBackend) {
      // For now, most entities still use localStorage
      // Future: implement backend endpoints for all entities
    }
    
    const entity = base44.entities[entityName];
    if (entity) {
      return await entity.update(id, data);
    }
    throw new Error(`Entity ${entityName} not found`);
  }

  async deleteEntity(entityName, id) {
    if (this.useBackend) {
      // For now, most entities still use localStorage
      // Future: implement backend endpoints for all entities
    }
    
    const entity = base44.entities[entityName];
    if (entity) {
      return await entity.delete(id);
    }
    throw new Error(`Entity ${entityName} not found`);
  }
}

// Create singleton instance
const hybridDB = new HybridDatabaseService();

// Export entities with hybrid functionality
export const db = {
  entities: {
    Student: {
      list: () => hybridDB.getStudents(),
      filter: (criteria) => hybridDB.filterStudents(criteria),
      findById: (id) => hybridDB.getStudentById(id),
      create: (data) => hybridDB.createStudent(data),
      update: (id, data) => hybridDB.updateStudent(id, data),
      delete: (id) => hybridDB.deleteEntity('Student', id)
    },
    Teacher: {
      list: () => hybridDB.getTeachers(),
      filter: (criteria) => hybridDB.filterTeachers(criteria),
      findById: (id) => hybridDB.getTeacherById(id),
      create: (data) => hybridDB.createTeacher(data),
      update: (id, data) => hybridDB.updateTeacher(id, data),
      delete: (id) => hybridDB.deleteEntity('Teacher', id)
    },
    Admin: {
      list: () => hybridDB.getAdmins(),
      filter: (criteria) => hybridDB.getEntity('Admin', criteria),
      findById: (id) => hybridDB.getEntity('Admin').then(admins => admins.find(a => a.id === id)),
      create: (data) => hybridDB.createAdmin(data),
      update: (id, data) => hybridDB.updateEntity('Admin', id, data),
      delete: (id) => hybridDB.deleteEntity('Admin', id)
    },
    StudentGroup: {
      list: () => hybridDB.getEntity('StudentGroup'),
      filter: (criteria) => hybridDB.getEntity('StudentGroup', criteria),
      findById: (id) => hybridDB.getEntity('StudentGroup').then(groups => groups.find(g => g.id === id)),
      create: (data) => hybridDB.createEntity('StudentGroup', data),
      update: (id, data) => hybridDB.updateEntity('StudentGroup', id, data),
      delete: (id) => hybridDB.deleteEntity('StudentGroup', id)
    },
    Proposal: {
      list: () => hybridDB.getEntity('Proposal'),
      filter: (criteria) => hybridDB.getEntity('Proposal', criteria),
      findById: (id) => hybridDB.getEntity('Proposal').then(proposals => proposals.find(p => p.id === id)),
      create: (data) => hybridDB.createEntity('Proposal', data),
      update: (id, data) => hybridDB.updateEntity('Proposal', id, data),
      delete: (id) => hybridDB.deleteEntity('Proposal', id)
    },
    Message: {
      list: () => hybridDB.getEntity('Message'),
      filter: (criteria) => hybridDB.getEntity('Message', criteria),
      findById: (id) => hybridDB.getEntity('Message').then(messages => messages.find(m => m.id === id)),
      create: (data) => hybridDB.createEntity('Message', data),
      update: (id, data) => hybridDB.updateEntity('Message', id, data),
      delete: (id) => hybridDB.deleteEntity('Message', id)
    },
    Meeting: {
      list: () => hybridDB.getEntity('Meeting'),
      filter: (criteria) => hybridDB.getEntity('Meeting', criteria),
      findById: (id) => hybridDB.getEntity('Meeting').then(meetings => meetings.find(m => m.id === id)),
      create: (data) => hybridDB.createEntity('Meeting', data),
      update: (id, data) => hybridDB.updateEntity('Meeting', id, data),
      delete: (id) => hybridDB.deleteEntity('Meeting', id)
    },
    Task: {
      list: () => hybridDB.getEntity('Task'),
      filter: (criteria) => hybridDB.getEntity('Task', criteria),
      findById: (id) => hybridDB.getEntity('Task').then(tasks => tasks.find(t => t.id === id)),
      create: (data) => hybridDB.createEntity('Task', data),
      update: (id, data) => hybridDB.updateEntity('Task', id, data),
      delete: (id) => hybridDB.deleteEntity('Task', id)
    },
    SharedFile: {
      list: () => hybridDB.getEntity('SharedFile'),
      filter: (criteria) => hybridDB.getEntity('SharedFile', criteria),
      findById: (id) => hybridDB.getEntity('SharedFile').then(files => files.find(f => f.id === id)),
      create: (data) => hybridDB.createEntity('SharedFile', data),
      update: (id, data) => hybridDB.updateEntity('SharedFile', id, data),
      delete: (id) => hybridDB.deleteEntity('SharedFile', id)
    },
    WeeklyProgress: {
      list: () => hybridDB.getEntity('WeeklyProgress'),
      filter: (criteria) => hybridDB.getEntity('WeeklyProgress', criteria),
      findById: (id) => hybridDB.getEntity('WeeklyProgress').then(progress => progress.find(p => p.id === id)),
      create: (data) => hybridDB.createEntity('WeeklyProgress', data),
      update: (id, data) => hybridDB.updateEntity('WeeklyProgress', id, data),
      delete: (id) => hybridDB.deleteEntity('WeeklyProgress', id)
    },
    SupervisionRequest: {
      list: () => hybridDB.getEntity('SupervisionRequest'),
      filter: (criteria) => hybridDB.getEntity('SupervisionRequest', criteria),
      findById: (id) => hybridDB.getEntity('SupervisionRequest').then(requests => requests.find(r => r.id === id)),
      create: (data) => hybridDB.createEntity('SupervisionRequest', data),
      update: (id, data) => hybridDB.updateEntity('SupervisionRequest', id, data),
      delete: (id) => hybridDB.deleteEntity('SupervisionRequest', id)
    },
    GroupInvitation: {
      list: () => hybridDB.getEntity('GroupInvitation'),
      filter: (criteria) => hybridDB.getEntity('GroupInvitation', criteria),
      findById: (id) => hybridDB.getEntity('GroupInvitation').then(invites => invites.find(i => i.id === id)),
      create: (data) => hybridDB.createEntity('GroupInvitation', data),
      update: (id, data) => hybridDB.updateEntity('GroupInvitation', id, data),
      delete: (id) => hybridDB.deleteEntity('GroupInvitation', id)
    }
  }
};

export default hybridDB;