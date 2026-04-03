/**
 * Centralized Error Handling System for Admin Panel
 * Provides consistent error management, logging, and user feedback
 */

import { toast } from 'sonner';

// Error types enumeration
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  DATABASE: 'DATABASE_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',           // Minor issues, non-blocking
  MEDIUM: 'medium',     // Significant but manageable
  HIGH: 'high',         // Critical issues requiring attention
  CRITICAL: 'critical'  // System-wide failures
};

/**
 * Custom Error Class with extended information
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  // Convert to plain object
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  // Get user-friendly message
  getUserMessage() {
    return getErrorMessage(this.type, this.message);
  }
}

/**
 * Get user-friendly error message based on type
 */
export function getErrorMessage(type, defaultMessage = 'An error occurred') {
  const messages = {
    [ErrorTypes.VALIDATION]: 'Please check your input and try again',
    [ErrorTypes.NETWORK]: 'Network error. Please check your connection',
    [ErrorTypes.AUTHENTICATION]: 'Please log in to continue',
    [ErrorTypes.AUTHORIZATION]: 'You do not have permission to perform this action',
    [ErrorTypes.NOT_FOUND]: 'The requested resource was not found',
    [ErrorTypes.SERVER]: 'Server error. Please try again later',
    [ErrorTypes.DATABASE]: 'Database error. Please contact support',
    [ErrorTypes.UNKNOWN]: defaultMessage
  };

  return messages[type] || defaultMessage;
}

/**
 * Log error to console with context
 */
export function logError(error, context = 'Unknown', metadata = {}) {
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
    error: error instanceof AppError ? error.toJSON() : {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    metadata,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Console logging with color coding based on severity
  const severity = error.severity || ErrorSeverity.MEDIUM;
  const color = getSeverityColor(severity);
  
  console.group(`%c[${context}] Error (${severity})`, `color: ${color}; font-weight: bold;`);
  console.error('Error:', errorData);
  console.log('Full Error Object:', error);
  console.groupEnd();

  // In production, you might send this to an error tracking service
  // sendToErrorTracking(errorData);

  return errorData;
}

/**
 * Get color based on severity
 */
function getSeverityColor(severity) {
  const colors = {
    [ErrorSeverity.LOW]: '#3b82f6',       // blue
    [ErrorSeverity.MEDIUM]: '#f59e0b',    // amber
    [ErrorSeverity.HIGH]: '#ef4444',      // red
    [ErrorSeverity.CRITICAL]: '#7c3aed'   // purple
  };
  return colors[severity] || colors[ErrorSeverity.MEDIUM];
}

/**
 * Display error toast notification
 */
export function showErrorToast(error, options = {}) {
  const {
    duration = 5000,
    showUserMessage = true,
    showTechnicalDetails = false
  } = options;

  const userMessage = error instanceof AppError 
    ? error.getUserMessage() 
    : getErrorMessage(error.type, error.message);

  const technicalDetails = showTechnicalDetails && error.stack 
    ? `\n\nTechnical Details:\n${error.message}`
    : '';

  toast.error(userMessage + technicalDetails, {
    duration,
    description: error.details?.description || '',
    position: 'top-right'
  });
}

/**
 * Handle error with appropriate actions
 */
export function handleError(error, context = 'Unknown', options = {}) {
  const {
    log = true,
    showToast = true,
    rethrow = false,
    fallbackAction = null,
    metadata = {}
  } = options;

  // Ensure we have an AppError
  const appError = error instanceof AppError 
    ? error 
    : new AppError(
        error.message || 'An unexpected error occurred',
        determineErrorType(error),
        determineErrorSeverity(error),
        { originalError: error, ...metadata }
      );

  // Log the error
  if (log) {
    logError(appError, context, metadata);
  }

  // Show toast notification
  if (showToast) {
    showErrorToast(appError, options);
  }

  // Execute fallback action if provided
  if (fallbackAction && typeof fallbackAction === 'function') {
    try {
      fallbackAction(appError);
    } catch (fallbackError) {
      console.error('Fallback action failed:', fallbackError);
    }
  }

  // Re-throw if needed
  if (rethrow) {
    throw appError;
  }

  return appError;
}

/**
 * Determine error type from error object or message
 */
export function determineErrorType(error) {
  if (!error) return ErrorTypes.UNKNOWN;

  const message = error.message || '';
  const status = error.status || error.response?.status;

  // Network errors
  if (message.includes('network') || message.includes('fetch') || !navigator.onLine) {
    return ErrorTypes.NETWORK;
  }

  // Authentication errors
  if (status === 401 || message.includes('authentication') || message.includes('unauthorized')) {
    return ErrorTypes.AUTHENTICATION;
  }

  // Authorization errors
  if (status === 403 || message.includes('permission') || message.includes('forbidden')) {
    return ErrorTypes.AUTHORIZATION;
  }

  // Not found errors
  if (status === 404 || message.includes('not found')) {
    return ErrorTypes.NOT_FOUND;
  }

  // Validation errors
  if (status === 400 || message.includes('validation') || message.includes('invalid')) {
    return ErrorTypes.VALIDATION;
  }

  // Server errors
  if (status >= 500 && status < 600) {
    return ErrorTypes.SERVER;
  }

  // Database errors
  if (message.includes('database') || message.includes('mongo') || message.includes('mongoose')) {
    return ErrorTypes.DATABASE;
  }

  return ErrorTypes.UNKNOWN;
}

/**
 * Determine error severity from error type
 */
export function determineErrorSeverity(error) {
  const type = determineErrorType(error);

  const severityMap = {
    [ErrorTypes.VALIDATION]: ErrorSeverity.LOW,
    [ErrorTypes.NOT_FOUND]: ErrorSeverity.LOW,
    [ErrorTypes.NETWORK]: ErrorSeverity.MEDIUM,
    [ErrorTypes.AUTHENTICATION]: ErrorSeverity.MEDIUM,
    [ErrorTypes.AUTHORIZATION]: ErrorSeverity.HIGH,
    [ErrorTypes.DATABASE]: ErrorSeverity.HIGH,
    [ErrorTypes.SERVER]: ErrorSeverity.HIGH,
    [ErrorTypes.UNKNOWN]: ErrorSeverity.MEDIUM
  };

  return severityMap[type] || ErrorSeverity.MEDIUM;
}

/**
 * Async error handler wrapper
 */
export function asyncHandler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, fn.name || 'AsyncOperation');
      throw error;
    }
  };
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff(
  operation,
  options = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry = null
  } = options;

  let delay = initialDelay;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Call onRetry callback if provided
        if (onRetry) {
          onRetry(error, attempt, maxRetries);
        }

        // Wait before next attempt
        await new Promise(resolve => 
          setTimeout(resolve, Math.min(delay, maxDelay))
        );

        // Increase delay for next attempt
        delay *= backoffFactor;
      }
    }
  }

  // All retries failed
  throw lastError;
}

/**
 * Check if user is online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Create offline error handler
 */
export function handleOfflineError() {
  const error = new AppError(
    'No internet connection. Please check your network and try again.',
    ErrorTypes.NETWORK,
    ErrorSeverity.MEDIUM
  );
  
  handleError(error, 'OfflineCheck', { showToast: true });
  return error;
}

/**
 * Error boundary helper for React components
 */
export function createErrorBoundary(fallbackUI = null) {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      handleError(error, 'ReactErrorBoundary', {
        metadata: { componentStack: errorInfo.componentStack }
      });
    }

    render() {
      if (this.state.hasError) {
        if (fallbackUI) {
          return fallbackUI(this.state.error);
        }
        
        return (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-200">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
            >
              Reload Page
            </button>
          </div>
        );
      }

      return this.props.children;
    }
  };
}

/**
 * Batch error handler for multiple operations
 */
export async function handleBatchOperations(
  operations,
  options = {}
) {
  const {
    stopOnError = false,
    collectErrors = true,
    showSummary = true
  } = options;

  const results = [];
  const errors = [];

  for (let i = 0; i < operations.length; i++) {
    try {
      const result = await operations[i]();
      results.push({ success: true, result, index: i });
    } catch (error) {
      const appError = handleError(error, `BatchOperation[${i}]`, {
        showToast: !collectErrors // Show individual toasts unless collecting
      });

      if (collectErrors) {
        errors.push({ error: appError, index: i });
      }

      if (stopOnError) {
        break;
      }
    }
  }

  // Show summary if multiple errors collected
  if (showSummary && errors.length > 1) {
    toast.error(`${errors.length} operations failed`, {
      description: `${results.length} succeeded, ${errors.length} failed`
    });
  }

  return {
    results,
    errors,
    total: operations.length,
    successCount: results.length,
    failureCount: errors.length
  };
}

// Default export
export default {
  AppError,
  ErrorTypes,
  ErrorSeverity,
  handleError,
  showErrorToast,
  logError,
  asyncHandler,
  retryWithBackoff,
  isOnline,
  handleOfflineError,
  handleBatchOperations,
  determineErrorType,
  determineErrorSeverity
};
