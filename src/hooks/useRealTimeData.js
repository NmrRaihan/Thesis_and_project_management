/**
 * Custom React Hook for Real-time Data Polling
 * Simplifies integration of polling into React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import pollingService from '../utils/pollingService';

/**
 * useRealTimeData - Custom hook for real-time data polling
 * 
 * @param {string} key - Unique identifier for this data stream
 * @param {Function} fetchData - Async function to fetch data
 * @param {number} interval - Polling interval in milliseconds (default: 5000)
 * @param {boolean} enabled - Whether polling should be active (default: true)
 * @param {Object} options - Additional options
 * @returns {Object} { data, loading, error, refresh, isPolling }
 */
export const useRealTimeData = (
  key,
  fetchData,
  interval = 5000,
  enabled = true,
  options = {}
) => {
  const {
    onError,
    onSuccess,
    immediate = true,
    retryOnError = true,
    maxRetries = 3
  } = options;

  // State management using refs to avoid re-renders
  const dataRef = useRef(null);
  const loadingRef = useRef(false);
  const errorRef = useRef(null);
  const retryCountRef = useRef(0);
  const componentMountedRef = useRef(true);

  // Force update to trigger re-render
  const [, forceUpdate] = useState({});

  // Initialize state
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    pollCount: 0
  });

  // Fetch data wrapper
  const executeFetch = useCallback(async () => {
    if (!componentMountedRef.current) return;

    loadingRef.current = true;
    forceUpdate({}); // Trigger re-render

    try {
      const result = await fetchData();
      
      if (componentMountedRef.current) {
        dataRef.current = result;
        errorRef.current = null;
        retryCountRef.current = 0;
        
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          lastUpdated: new Date(),
          pollCount: prev.pollCount + 1
        }));

        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      if (componentMountedRef.current) {
        errorRef.current = err;
        
        // Handle retry logic
        if (retryOnError && retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          console.log(`[useRealTimeData] Retry ${retryCountRef.current}/${maxRetries} for ${key}`);
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err
          }));

          if (onError) {
            onError(err);
          }
        }
      }
    } finally {
      if (componentMountedRef.current) {
        loadingRef.current = false;
        forceUpdate({}); // Trigger re-render
      }
    }
  }, [key, fetchData, onSuccess, onError, retryOnError, maxRetries]);

  // Start/stop polling based on enabled state
  useEffect(() => {
    componentMountedRef.current = true;

    if (enabled) {
      // Start polling
      pollingService.start(key, executeFetch, interval, immediate);
    } else {
      // Stop polling
      pollingService.stop(key);
    }

    // Cleanup on unmount
    return () => {
      componentMountedRef.current = false;
      pollingService.stop(key);
    };
  }, [enabled, key, interval, immediate, executeFetch]);

  // Manual refresh function
  const refresh = useCallback(() => {
    return executeFetch();
  }, [executeFetch]);

  // Update interval dynamically
  const updateInterval = useCallback((newInterval) => {
    pollingService.updateInterval(key, newInterval);
  }, [key]);

  // Pause polling temporarily
  const pause = useCallback(() => {
    pollingService.pause(key);
  }, [key]);

  // Resume paused polling
  const resume = useCallback(() => {
    pollingService.resume(key);
  }, [key]);

  return {
    data: state.data,
    loading: state.loading || loadingRef.current,
    error: state.error || errorRef.current,
    refresh,
    isPolling: pollingService.isActive(key),
    lastUpdated: state.lastUpdated,
    pollCount: state.pollCount,
    updateInterval,
    pause,
    resume,
    pollingInfo: pollingService.getInfo(key)
  };
};

/**
 * useMultiSourcePolling - Hook for polling multiple data sources
 * 
 * @param {Array} sources - Array of { key, fetchFn, interval } objects
 * @param {boolean} enabled - Whether polling should be active
 * @returns {Object} { data, loading, error, refreshAll }
 */
export const useMultiSourcePolling = (sources, enabled = true) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!enabled) {
      // Stop all polls if disabled
      sources.forEach(source => pollingService.stop(source.key));
      return;
    }

    // Set up polling for each source
    sources.forEach(source => {
      const { key, fetchFn, interval = 5000 } = source;

      pollingService.start(key, async () => {
        try {
          setLoading(prev => ({ ...prev, [key]: true }));
          const result = await fetchFn();
          
          setData(prev => ({ ...prev, [key]: result }));
          setErrors(prev => ({ ...prev, [key]: null }));
        } catch (err) {
          setErrors(prev => ({ ...prev, [key]: err }));
        } finally {
          setLoading(prev => ({ ...prev, [key]: false }));
        }
      }, interval, true);
    });

    // Cleanup
    return () => {
      sources.forEach(source => pollingService.stop(source.key));
    };
  }, [JSON.stringify(sources), enabled]);

  const refreshAll = useCallback(async () => {
    const promises = sources.map(async source => {
      try {
        const result = await source.fetchFn();
        setData(prev => ({ ...prev, [source.key]: result }));
        return { key: source.key, success: true };
      } catch (err) {
        setErrors(prev => ({ ...prev, [source.key]: err }));
        return { key: source.key, success: false, error: err };
      }
    });

    return Promise.all(promises);
  }, [sources]);

  return {
    data,
    loading,
    errors,
    refreshAll
  };
};

// Helper hook for admin dashboard specific polling
export const useAdminDashboardPolling = (refreshCallback, interval = 5000) => {
  return useRealTimeData(
    'admin-dashboard',
    refreshCallback,
    interval,
    true,
    {
      immediate: true,
      retryOnError: true,
      maxRetries: 3,
      onError: (error) => {
        console.error('[AdminDashboard] Polling error:', error);
      }
    }
  );
};
