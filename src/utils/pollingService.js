/**
 * Real-time Polling Utility for Admin Panel
 * Provides automatic data refresh capabilities with intelligent interval management
 */

class PollingService {
  constructor() {
    this.polls = new Map(); // Store active polls by key
    this.defaultInterval = 5000; // Default 5 seconds
    this.minInterval = 2000; // Minimum 2 seconds
    this.maxInterval = 30000; // Maximum 30 seconds
  }

  /**
   * Start polling for data updates
   * @param {string} key - Unique identifier for this poll
   * @param {Function} callback - Function to call on each poll
   * @param {number} interval - Polling interval in milliseconds
   * @param {boolean} immediate - Whether to execute immediately on start
   */
  start(key, callback, interval = this.defaultInterval, immediate = true) {
    // Validate interval
    const safeInterval = Math.max(this.minInterval, Math.min(interval, this.maxInterval));

    // Clear existing poll if any
    this.stop(key);

    // Execute immediately if requested
    if (immediate) {
      callback();
    }

    // Set up interval
    const intervalId = setInterval(() => {
      callback();
    }, safeInterval);

    // Store poll information
    this.polls.set(key, {
      intervalId,
      callback,
      interval: safeInterval,
      startTime: Date.now(),
      lastExecution: immediate ? Date.now() : null
    });

    console.log(`[Polling] Started: ${key} (interval: ${safeInterval}ms)`);
  }

  /**
   * Stop polling for a specific key
   * @param {string} key - Unique identifier for the poll to stop
   */
  stop(key) {
    const poll = this.polls.get(key);
    if (poll) {
      clearInterval(poll.intervalId);
      this.polls.delete(key);
      console.log(`[Polling] Stopped: ${key}`);
    }
  }

  /**
   * Stop all active polls
   */
  stopAll() {
    this.polls.forEach((poll, key) => {
      clearInterval(poll.intervalId);
      console.log(`[Polling] Stopped: ${key}`);
    });
    this.polls.clear();
    console.log('[Polling] All polls stopped');
  }

  /**
   * Check if a poll is currently running
   * @param {string} key - Unique identifier to check
   * @returns {boolean} True if poll is active
   */
  isActive(key) {
    return this.polls.has(key);
  }

  /**
   * Get information about a running poll
   * @param {string} key - Unique identifier to check
   * @returns {Object|null} Poll information or null if not found
   */
  getInfo(key) {
    const poll = this.polls.get(key);
    if (!poll) return null;

    return {
      key,
      interval: poll.interval,
      startTime: poll.startTime,
      lastExecution: poll.lastExecution,
      duration: Date.now() - poll.startTime
    };
  }

  /**
   * Update polling interval dynamically
   * @param {string} key - Unique identifier for the poll
   * @param {number} newInterval - New interval in milliseconds
   */
  updateInterval(key, newInterval) {
    const poll = this.polls.get(key);
    if (!poll) {
      console.warn(`[Polling] Cannot update interval: ${key} not found`);
      return;
    }

    // Restart poll with new interval
    this.start(key, poll.callback, newInterval, false);
    console.log(`[Polling] Updated interval for ${key}: ${newInterval}ms`);
  }

  /**
   * Pause polling temporarily (without losing state)
   * @param {string} key - Unique identifier for the poll
   */
  pause(key) {
    const poll = this.polls.get(key);
    if (!poll) return;

    clearInterval(poll.intervalId);
    poll.paused = true;
    console.log(`[Polling] Paused: ${key}`);
  }

  /**
   * Resume paused polling
   * @param {string} key - Unique identifier for the poll
   */
  resume(key) {
    const poll = this.polls.get(key);
    if (!poll || !poll.paused) return;

    const intervalId = setInterval(() => {
      poll.callback();
    }, poll.interval);

    poll.intervalId = intervalId;
    poll.paused = false;
    console.log(`[Polling] Resumed: ${key}`);
  }

  /**
   * Get all active polls
   * @returns {Array} Array of active poll keys
   */
  getActivePolls() {
    return Array.from(this.polls.keys());
  }

  /**
   * Get polling statistics
   * @returns {Object} Statistics about all polls
   */
  getStats() {
    const stats = {
      totalActive: this.polls.size,
      polls: []
    };

    this.polls.forEach((poll, key) => {
      stats.polls.push({
        key,
        interval: poll.interval,
        uptime: Date.now() - poll.startTime,
        lastExecution: poll.lastExecution
      });
    });

    return stats;
  }
}

// Create singleton instance
const pollingService = new PollingService();

// Custom hook for React components
export const usePolling = () => {
  const startPoll = (key, callback, interval, immediate) => {
    pollingService.start(key, callback, interval, immediate);
  };

  const stopPoll = (key) => {
    pollingService.stop(key);
  };

  const stopAllPolls = () => {
    pollingService.stopAll();
  };

  const isPollActive = (key) => {
    pollingService.isActive(key);
  };

  const updatePollInterval = (key, newInterval) => {
    pollingService.updateInterval(key, newInterval);
  };

  const getPollInfo = (key) => {
    pollingService.getInfo(key);
  };

  return {
    startPoll,
    stopPoll,
    stopAllPolls,
    isPollActive,
    updatePollInterval,
    getPollInfo,
    getActivePolls: () => pollingService.getActivePolls(),
    getStats: () => pollingService.getStats()
  };
};

export default pollingService;
