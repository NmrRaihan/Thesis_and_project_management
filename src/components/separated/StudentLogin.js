// src/components/separated/StudentLogin.js

// State variables
let loading = false;
let showPassword = false;
let formData = {
  student_id: '',
  password: ''
};

// DOM elements
let studentIdInput;
let passwordInput;
let togglePasswordBtn;
let loginForm;
let loginButton;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  studentIdInput = document.getElementById('student_id');
  passwordInput = document.getElementById('password');
  togglePasswordBtn = document.getElementById('togglePassword');
  loginForm = document.getElementById('loginForm');
  loginButton = document.getElementById('loginButton');
  
  // Add event listeners
  if (studentIdInput) {
    studentIdInput.addEventListener('input', (e) => {
      formData.student_id = e.target.value;
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      formData.password = e.target.value;
    });
  }
  
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleSubmit);
  }
});

// Toggle password visibility
function togglePasswordVisibility() {
  showPassword = !showPassword;
  if (passwordInput) {
    passwordInput.type = showPassword ? 'text' : 'password';
  }
  
  // Update eye icon
  const eyeIcon = togglePasswordBtn.querySelector('.eye-icon');
  if (eyeIcon) {
    eyeIcon.innerHTML = showPassword ? 
      `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>` :
      `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  }
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  if (loading) return;
  
  setLoading(true);
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation
    if (!formData.student_id) {
      showError('Please enter your student ID');
      return;
    }
    
    if (!formData.password) {
      showError('Please enter your password');
      return;
    }
    
    // Simulate successful login
    showSuccess('Welcome back!');
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = '/studentdashboard';
    }, 1500);
  } catch (error) {
    console.error('Login error:', error);
    showError('Login failed. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
}

// Set loading state
function setLoading(isLoading) {
  loading = isLoading;
  
  if (loginButton) {
    if (loading) {
      loginButton.disabled = true;
      const buttonText = loginButton.querySelector('.button-text');
      if (buttonText) {
        buttonText.textContent = 'Signing in...';
      }
      
      // Add spinner
      const arrowIcon = loginButton.querySelector('.arrow-icon');
      if (arrowIcon) {
        arrowIcon.outerHTML = '<div class="spinner"></div>';
      }
    } else {
      loginButton.disabled = false;
      const buttonText = loginButton.querySelector('.button-text');
      if (buttonText) {
        buttonText.textContent = 'Sign In';
      }
      
      // Restore arrow icon
      const spinner = loginButton.querySelector('.spinner');
      if (spinner) {
        spinner.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>`;
      }
    }
  }
}

// Show error message
function showError(message) {
  // In a real implementation, you would show this in the UI
  console.error(message);
  alert(message); // Simple alert for demo purposes
}

// Show success message
function showSuccess(message) {
  // In a real implementation, you would show this in the UI
  console.log(message);
  alert(message); // Simple alert for demo purposes
}

// Export functions for potential use by other components
export { 
  togglePasswordVisibility, 
  handleSubmit, 
  setLoading, 
  showError, 
  showSuccess 
};