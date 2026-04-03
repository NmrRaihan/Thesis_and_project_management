// Form Validation Utilities

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string, strength: 'weak' | 'medium' | 'strong' }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required', strength: 'none' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters', strength: 'weak' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const requirementsMet = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  if (requirementsMet < 3) {
    return { 
      valid: false, 
      message: 'Password must include uppercase, lowercase, number, and special character',
      strength: 'weak'
    };
  }

  const strength = requirementsMet === 4 ? 'strong' : 'medium';
  return { valid: true, message: '', strength };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateUsername = (username) => {
  if (!username || username.trim().length === 0) {
    return { valid: false, message: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }

  if (username.length > 50) {
    return { valid: false, message: 'Username must be less than 50 characters' };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate student/teacher ID
 * @param {string} id - ID to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateId = (id, type = 'ID') => {
  if (!id || id.trim().length === 0) {
    return { valid: false, message: `${type} is required` };
  }

  if (id.length < 3) {
    return { valid: false, message: `${type} must be at least 3 characters` };
  }

  if (id.length > 20) {
    return { valid: false, message: `${type} must be less than 20 characters` };
  }

  return { valid: true, message: '' };
};

/**
 * Validate full name
 * @param {string} fullName - Full name to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim().length === 0) {
    return { valid: false, message: 'Full name is required' };
  }

  if (fullName.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }

  if (fullName.length > 100) {
    return { valid: false, message: 'Name must be less than 100 characters' };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(fullName)) {
    return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate department
 * @param {string} department - Department to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateDepartment = (department) => {
  if (!department || department.trim().length === 0) {
    return { valid: false, message: 'Department is required' };
  }

  if (department.length < 2) {
    return { valid: false, message: 'Department name must be at least 2 characters' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate phone number (optional field)
 * @param {string} phone - Phone number to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  // If empty, it's valid (assuming optional)
  if (!phone || phone.trim().length === 0) {
    return { valid: true, message: '' };
  }

  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { valid: false, message: `${fieldName} is required` };
  }

  return { valid: true, message: '' };
};

/**
 * Validate minLength
 * @param {string} value - Value to validate
 * @param {number} min - Minimum length
 * @param {string} fieldName - Name of the field
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateMinLength = (value, min, fieldName = 'This field') => {
  if (!value || value.length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters` };
  }

  return { valid: true, message: '' };
};

/**
 * Validate maxLength
 * @param {string} value - Value to validate
 * @param {number} max - Maximum length
 * @param {string} fieldName - Name of the field
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateMaxLength = (value, max, fieldName = 'This field') => {
  if (value && value.length > max) {
    return { valid: false, message: `${fieldName} must be less than ${max} characters` };
  }

  return { valid: true, message: '' };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateUrl = (url) => {
  if (!url || url.trim().length === 0) {
    return { valid: true, message: '' }; // Optional field
  }

  try {
    new URL(url);
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: 'Please enter a valid URL' };
  }
};

// Export all validators as a single object for convenience
export const validators = {
  email: validateEmail,
  password: validatePassword,
  passwordConfirmation: validatePasswordConfirmation,
  username: validateUsername,
  id: validateId,
  fullName: validateFullName,
  department: validateDepartment,
  phone: validatePhone,
  required: validateRequired,
  minLength: validateMinLength,
  maxLength: validateMaxLength,
  url: validateUrl
};
