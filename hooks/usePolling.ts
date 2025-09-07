import { useEffect, useRef, useCallback } from 'react';

interface PollingOptions {
  baseInterval?: number;  // Base interval in milliseconds (default: 10000)
  maxJitter?: number;     // Maximum jitter in milliseconds (default: 5000)
  enabled?: boolean;      // Whether polling is enabled (default: true)
  runImmediately?: boolean; // Run callback immediately on start (default: false)
  backoffIncrement?: number; // How much to increase interval after each successful check (default: 5000)
  maxInterval?: number;   // Maximum interval before reset ~5min (default: 300000)
  maxIntervalJitter?: number; // Jitter around max interval ±1min (default: 60000)
}

interface NetworkInfo {
  isOnline: boolean;
  isSlowConnection: boolean;
}

export function usePolling(
  callback: () => void | Promise<void> | boolean | Promise<boolean>,
  options: PollingOptions = {}
) {
  const {
    baseInterval = 10000,
    maxJitter = 5000,
    enabled = true,
    runImmediately = false,
    backoffIncrement = 5000,
    maxInterval = 300000, // 5 minutes
    maxIntervalJitter = 60000 // ±1 minute
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const isRunningRef = useRef(false);
  const currentIntervalRef = useRef(baseInterval);

  // Keep callback reference current
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Get network status (React Native compatible - simplified version)
  const getNetworkInfo = useCallback((): NetworkInfo => {
    // For React Native, we'll assume online unless we detect otherwise
    // This could be enhanced with @react-native-async-storage/async-storage later
    return { isOnline: true, isSlowConnection: false };
  }, []);

  // Generate jittered interval with current backoff
  const getJitteredInterval = useCallback(() => {
    const currentInterval = currentIntervalRef.current;
    
    // Check if we need to reset (around maxInterval with jitter)
    const resetThreshold = maxInterval + (Math.random() - 0.5) * 2 * maxIntervalJitter;
    if (currentInterval >= resetThreshold) {
      console.log(`🔄 Progressive backoff reset: ${Math.round(currentInterval/1000)}s → ${Math.round(baseInterval/1000)}s`);
      currentIntervalRef.current = baseInterval;
    }
    
    const jitter = (Math.random() - 0.5) * 2 * maxJitter;
    return currentIntervalRef.current + jitter;
  }, [baseInterval, maxJitter, maxInterval, maxIntervalJitter]);

  // Increase backoff interval after successful poll
  const increaseBackoff = useCallback(() => {
    const newInterval = Math.min(currentIntervalRef.current + backoffIncrement, maxInterval);
    if (newInterval !== currentIntervalRef.current) {
      console.log(`📈 Progressive backoff: ${Math.round(currentIntervalRef.current/1000)}s → ${Math.round(newInterval/1000)}s`);
      currentIntervalRef.current = newInterval;
    }
  }, [backoffIncrement, maxInterval]);

  // Reset backoff interval when updates are found
  const resetBackoff = useCallback(() => {
    if (currentIntervalRef.current !== baseInterval) {
      console.log(`⚡ Activity detected - resetting backoff: ${Math.round(currentIntervalRef.current/1000)}s → ${Math.round(baseInterval/1000)}s`);
      currentIntervalRef.current = baseInterval;
    }
  }, [baseInterval]);

  // Should we skip this polling cycle?
  const shouldSkipPolling = useCallback(() => {
    if (!enabled) return true;
    
    const networkInfo = getNetworkInfo();
    return !networkInfo.isOnline || networkInfo.isSlowConnection;
  }, [enabled, getNetworkInfo]);

  // Clear any existing timeout
  const clearPollingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Schedule next poll
  const scheduleNextPoll = useCallback((hadUpdates: boolean = false) => {
    clearPollingTimeout();
    
    if (!enabled) return;
    
    // Handle backoff logic
    if (hadUpdates) {
      resetBackoff();
    } else {
      increaseBackoff();
    }
    
    const nextInterval = getJitteredInterval();
    const nextPollTime = new Date(Date.now() + nextInterval).toLocaleTimeString();
    console.log(`⏰ Next background poll scheduled in ${Math.round(nextInterval/1000)}s (at ${nextPollTime})`);
    
    timeoutRef.current = setTimeout(async () => {
      if (shouldSkipPolling()) {
        console.log('⏸️ Skipping background poll - network conditions not suitable');
        scheduleNextPoll(false);
        return;
      }
      
      // Prevent overlapping calls
      if (isRunningRef.current) {
        console.log('⏸️ Skipping background poll - previous poll still running');
        scheduleNextPoll(false);
        return;
      }
      
      try {
        isRunningRef.current = true;
        const result = await callbackRef.current();
        
        // Check if callback indicates updates were found (if it returns a boolean)
        const foundUpdates = result === true;
        
        console.log(`✅ Background poll completed successfully${foundUpdates ? ' (updates found)' : ' (no updates)'}`);
        scheduleNextPoll(foundUpdates);
      } catch (error) {
        console.error('❌ Polling callback error:', error);
        scheduleNextPoll(false);
      } finally {
        isRunningRef.current = false;
      }
    }, nextInterval);
  }, [enabled, getJitteredInterval, shouldSkipPolling, clearPollingTimeout, resetBackoff, increaseBackoff]);

  // Start polling
  const startPolling = useCallback(() => {
    if (runImmediately && !shouldSkipPolling()) {
      // Run immediately, then schedule next
      callbackRef.current();
    }
    scheduleNextPoll(false);
  }, [runImmediately, shouldSkipPolling, scheduleNextPoll]);

  // Stop polling
  const stopPolling = useCallback(() => {
    clearPollingTimeout();
    isRunningRef.current = false;
  }, [clearPollingTimeout]);

  // Start polling when enabled, stop when disabled
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    startPolling,
    stopPolling,
    isRunning: isRunningRef.current
  };
}