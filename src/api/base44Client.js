// Mock database client using localStorage
export class EntityManager {
  constructor(entityName) {
    this.entityName = entityName;
    this.storageKey = `entity_${entityName}`;
  }

  getAll() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  save(items) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  async list() {
    return this.getAll();
  }

  async filter(criteria) {
    const items = this.getAll();
    return items.filter(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  async findById(id) {
    const items = this.getAll();
    return items.find(item => item.id === id);
  }

  async create(data) {
    const items = this.getAll();
    const newItem = {
      id: this.generateId(),
      created_at: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    this.save(items);
    return newItem;
  }

  async update(id, updates) {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
      this.save(items);
      return items[index];
    }
    return null;
  }

  async delete(id) {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    this.save(filtered);
    return true;
  }

  generateId() {
    return `${this.entityName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Base44 Client
export const base44 = {
  entities: {
    Student: new EntityManager('Student'),
    Teacher: new EntityManager('Teacher'),
    StudentGroup: new EntityManager('StudentGroup'),
    GroupInvitation: new EntityManager('GroupInvitation'),
    Proposal: new EntityManager('Proposal'),
    Message: new EntityManager('Message'),
    Meeting: new EntityManager('Meeting'),
    Task: new EntityManager('Task'),
    SharedFile: new EntityManager('SharedFile'),
    WeeklyProgress: new EntityManager('WeeklyProgress'),
    SupervisionRequest: new EntityManager('SupervisionRequest'),
    Admin: new EntityManager('Admin'),
  }
};

// Initialize with some sample data if empty
const initializeSampleData = () => {
  // Add sample teachers
  const teachers = base44.entities.Teacher.getAll();
  if (teachers.length === 0) {
    const sampleTeachers = [
      {
        teacher_id: 'T001',
        password_hash: 'password123',
        full_name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        department: 'Computer Science',
        research_field: 'Artificial Intelligence, Machine Learning',
        publications: 25,
        max_students: 10,
        current_students: 3,
        profile_photo: '',
        acceptance_criteria: 'Minimum GPA 3.5, Strong programming background'
      },
      {
        teacher_id: 'T002',
        password_hash: 'password123',
        full_name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        department: 'Computer Science',
        research_field: 'Cybersecurity, Network Security',
        publications: 18,
        max_students: 8,
        current_students: 2,
        profile_photo: '',
        acceptance_criteria: 'Interest in security, Good analytical skills'
      },
      {
        teacher_id: 'T003',
        password_hash: 'password123',
        full_name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        department: 'Computer Science',
        research_field: 'Data Science, Big Data Analytics',
        publications: 30,
        max_students: 12,
        current_students: 5,
        profile_photo: '',
        acceptance_criteria: 'Strong mathematics background, Python proficiency'
      }
    ];

    sampleTeachers.forEach(teacher => {
      base44.entities.Teacher.create(teacher);
    });
  }
};

// Call initialization
if (typeof window !== 'undefined') {
  initializeSampleData();
}
