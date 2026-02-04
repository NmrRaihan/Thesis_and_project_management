// src/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with clsx and merges Tailwind CSS classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a URL path from a page name by converting it to lowercase.
 * This is used to map page names to React Router paths (e.g., 'StudentLogin' -> '/studentlogin').
 * @param {string} pageName 
 * @returns {string} The path URL
 */
export const createPageUrl = (pageName) => `/${pageName.toLowerCase()}`;

/**
 * Generate random student/teacher ID
 */
export const generateId = (prefix) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format date
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format time
 */
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Format function compatible with date-fns
 */
export const format = (date, formatStr) => {
  if (!date) return '';
  const d = new Date(date);
  
  // Handle common format strings
  const formats = {
    'PPP': d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    'PPp': d.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    'p': d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    'PP': d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    'MMM d, yyyy': d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    'h:mm a': d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
  
  return formats[formatStr] || d.toLocaleDateString('en-US');
};

/**
 * Get start of week
 */
export const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

/**
 * Get end of week
 */
export const endOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day);
  return new Date(d.setDate(diff));
};

/**
 * Add days to date
 */
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};