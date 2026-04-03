// Centralized Logging Service
// Prevents console.log pollution in production while maintaining debug capability

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    this.enabled = true;
  }

  /**
   * Log debug information (only in development)
   */
  debug(context, message, data = null) {
    if (!this.isDevelopment || !this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [DEBUG] [${context}] ${message}`, data || '');
  }

  /**
   * Log general information
   */
  info(context, message, data = null) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}] [INFO] [${context}] ${message}`, data || '');
  }

  /**
   * Log warnings (always shown)
   */
  warn(context, message, error = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [${context}] ${message}`, error || '');
  }

  /**
   * Log errors (always shown)
   */
  error(context, message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${context}] ${message}`, error || '');
  }

  /**
   * Log success messages
   */
  success(context, message) {
    if (!this.isDevelopment || !this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [SUCCESS] [${context}] ${message}`);
  }

  /**
   * Enable logging
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable logging (for production)
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Check if logging is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

// Create singleton instance
const logger = new Logger();

// Export for use in components
export default logger;

// Also export for direct import
export { Logger };
