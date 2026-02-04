// src/components/separated/Home.js

// Feature data
const features = [
  {
    icon: 'users',
    title: 'Team Formation',
    description: 'Form groups with up to 3 members for collaborative thesis or project work'
  },
  {
    icon: 'message',
    title: 'Real-time Communication',
    description: 'Built-in chat for team discussions and teacher-student communication'
  },
  {
    icon: 'file',
    title: 'AI-Powered Proposals',
    description: 'Generate and refine research proposals with AI assistance'
  },
  {
    icon: 'book',
    title: 'Smart Matching',
    description: 'Get matched with supervisors based on your research interests'
  },
];

// How it works data
const howItWorks = [
  { step: '01', title: 'Register', desc: 'Create your student or teacher account' },
  { step: '02', title: 'Form Team', desc: 'Invite partners to join your research group' },
  { step: '03', title: 'Create Proposal', desc: 'Generate AI-powered research proposals' },
  { step: '04', title: 'Get Supervised', desc: 'Connect with matching supervisors' },
];

// Icon mapping
const icons = {
  users: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `,
  message: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `,
  file: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
  `,
  book: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
    </svg>
  `
};

// Populate features
function populateFeatures() {
  const featuresGrid = document.querySelector('.features-grid');
  if (!featuresGrid) return;
  
  featuresGrid.innerHTML = features.map(feature => `
    <div class="feature-card">
      <div class="feature-icon">
        ${icons[feature.icon] || ''}
      </div>
      <h3 class="feature-title">${feature.title}</h3>
      <p class="feature-description">${feature.description}</p>
    </div>
  `).join('');
}

// Populate steps
function populateSteps() {
  const stepsGrid = document.querySelector('.steps-grid');
  if (!stepsGrid) return;
  
  stepsGrid.innerHTML = howItWorks.map(step => `
    <div class="step-item">
      <div class="step-number">${step.step}</div>
      <h3 class="step-title">${step.title}</h3>
      <p class="step-description">${step.desc}</p>
    </div>
  `).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  populateFeatures();
  populateSteps();
});

export { features, howItWorks, icons };