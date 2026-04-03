/**
 * Database Error Handling Utilities
 * Specialized error handlers for database operations
 */

import { AppError, ErrorTypes, ErrorSeverity, handleError } from './errorHandler';

/**
 * Handle database operation errors
 */
export function handleDatabaseError(error, operation = 'database operation') {
  const dbError = new AppError(
    `Failed to ${operation}: ${error.message}`,
    ErrorTypes.DATABASE,
    ErrorSeverity.HIGH,
    {
      originalError: error,
      operation,
      timestamp: new Date().toISOString()
    }
  );

  return handleError(dbError, 'DatabaseOperation', {
    showToast: true,
    log: true,
    metadata: { operation }
  });
}

/**
 * Handle entity not found error
 */
export function handleEntityNotFound(entityType, entityId) {
  const error = new AppError(
    `${entityType} not found`,
    ErrorTypes.NOT_FOUND,
    ErrorSeverity.LOW,
    { entityType, entityId }
  );

  return handleError(error, 'EntityNotFound', {
    showToast: true,
    metadata: { entityType, entityId }
  });
}

/**
 * Handle duplicate entry error
 */
export function handleDuplicateEntry(field, value) {
  const error = new AppError(
    `A record with this ${field} already exists`,
    ErrorTypes.VALIDATION,
    ErrorSeverity.MEDIUM,
    { field, value }
  );

  return handleError(error, 'DuplicateEntry', {
    showToast: true,
    metadata: { field, value }
  });
}

/**
 * Handle validation error from database
 */
export function handleDatabaseValidationError(validationErrors, operation = 'operation') {
  const errorMessages = validationErrors.map(err => err.message).join(', ');
  
  const error = new AppError(
    `Validation failed for ${operation}: ${errorMessages}`,
    ErrorTypes.VALIDATION,
    ErrorSeverity.MEDIUM,
    { validationErrors }
  );

  return handleError(error, 'DatabaseValidation', {
    showToast: true,
    metadata: { validationErrors }
  });
}

/**
 * Wrap database operation with error handling
 */
export async function withDatabaseHandling(operationFn, context = 'database operation') {
  try {
    return await operationFn();
  } catch (error) {
    throw handleDatabaseError(error, context);
  }
}

/**
 * Check if error is a database connection error
 */
export function isDatabaseConnectionError(error) {
  const connectionErrorPatterns = [
    'connection',
    'connect',
    'timeout',
    'ECONNREFUSED',
    'network'
  ];

  const message = (error.message || '').toLowerCase();
  return connectionErrorPatterns.some(pattern => message.includes(pattern));
}

/**
 * Get user-friendly database error message
 */
export function getDatabaseErrorMessage(error) {
  if (isDatabaseConnectionError(error)) {
    return 'Unable to connect to the database. Please check your connection and try again.';
  }

  if (error.code === 11000) { // MongoDB duplicate key error
    const field = Object.keys(error.keyPattern || {})[0];
    return `A record with this ${field} already exists.`;
  }

  if (error.name === 'ValidationError') {
    return 'The data provided is invalid. Please check your input.';
  }

  if (error.name === 'CastError') {
    return 'Invalid data format. Please check your input.';
  }

  return 'A database error occurred. Please try again.';
}

export default {
  handleDatabaseError,
  handleEntityNotFound,
  handleDuplicateEntry,
  handleDatabaseValidationError,
  withDatabaseHandling,
  isDatabaseConnectionError,
  getDatabaseErrorMessage
};
