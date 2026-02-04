// Node.js compatible database service for terminal scripts
// This simulates localStorage using a file-based approach

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store the database file
const DB_FILE_PATH = path.join(__dirname, '..', '..', 'database.json');

// Load database from file
const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Could not load database file, starting fresh:', error.message);
  }
  return {};
};

// Load localStorage data
const loadLocalStorage = () => {
  try {
    const localStoragePath = path.join(__dirname, '..', '..', 'localStorage.json');
    if (fs.existsSync(localStoragePath)) {
      const data = fs.readFileSync(localStoragePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Could not load localStorage file:', error.message);
  }
  return {};
};

// Save database to file
const saveDatabase = (db) => {
  try {
    // Separate localStorage data from entity data
    const localStorageKeys = ['thesisHubAdmins'];
    const localStorageData = {};
    const entityData = {...db}; // Copy all data initially
    
    // Extract localStorage-specific data
    for (const key of localStorageKeys) {
      if (db[key]) {
        localStorageData[key] = db[key];
      }
    }
    
    // Save entity data to database file (including admin data for browser access)
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(entityData, null, 2));
    
    // Save localStorage data to localStorage file
    const localStoragePath = path.join(__dirname, '..', '..', 'localStorage.json');
    fs.writeFileSync(localStoragePath, JSON.stringify(localStorageData, null, 2));
  } catch (error) {
    console.error('Failed to save database:', error.message);
  }
};

// Initialize database
let database = loadDatabase();

// Load localStorage data and merge with database
const localStorageData = loadLocalStorage();
Object.assign(database, localStorageData);

// Entity Manager for Node.js
class NodeEntityManager {
  constructor(entityName) {
    this.entityName = entityName;
    this.storageKey = `entity_${entityName}`;
  }

  getAll() {
    return database[this.storageKey] || [];
  }

  save(items) {
    database[this.storageKey] = items;
    saveDatabase(database);
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

// Create entities
const nodeDb = {
  entities: {
    Student: new NodeEntityManager('Student'),
    Teacher: new NodeEntityManager('Teacher'),
    StudentGroup: new NodeEntityManager('StudentGroup'),
    GroupInvitation: new NodeEntityManager('GroupInvitation'),
    Proposal: new NodeEntityManager('Proposal'),
    Message: new NodeEntityManager('Message'),
    Meeting: new NodeEntityManager('Meeting'),
    Task: new NodeEntityManager('Task'),
    SharedFile: new NodeEntityManager('SharedFile'),
    WeeklyProgress: new NodeEntityManager('WeeklyProgress'),
    SupervisionRequest: new NodeEntityManager('SupervisionRequest'),
    Admin: new NodeEntityManager('Admin'),
  },
  
  // Helper functions
  clearAllData: async () => {
    database = {};
    saveDatabase(database);
    console.log('Cleared all database data');
  },
  
  getAllData: async () => {
    return database;
  }
};

export { nodeDb as db };