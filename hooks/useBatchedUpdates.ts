import { useCallback, useRef } from 'react';

interface BatchConfig {
  batchSize: number;        // How many items per batch
  batchDelay: number;       // Delay between batches (ms)
  priority: 'high' | 'low'; // Priority level
}

interface BatchItem {
  id: string;
  priority: 'high' | 'low';
  callback: () => Promise<void>;
  retryCount: number;
}

const DEFAULT_HIGH_PRIORITY_CONFIG: BatchConfig = {
  batchSize: 3,
  batchDelay: 1000, // 1 second between batches
  priority: 'high'
};

const DEFAULT_LOW_PRIORITY_CONFIG: BatchConfig = {
  batchSize: 2,
  batchDelay: 5000, // 5 seconds between batches  
  priority: 'low'
};

export function useBatchedUpdates() {
  const queueRef = useRef<BatchItem[]>([]);
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add item to batch queue
  const addToBatch = useCallback((
    id: string,
    callback: () => Promise<void>,
    priority: 'high' | 'low' = 'low'
  ) => {
    // Remove existing item with same ID if it exists
    queueRef.current = queueRef.current.filter(item => item.id !== id);
    
    // Add new item
    queueRef.current.push({
      id,
      priority,
      callback,
      retryCount: 0
    });
    
    // Sort queue by priority (high first)
    queueRef.current.sort((a, b) => {
      if (a.priority === 'high' && b.priority === 'low') return -1;
      if (a.priority === 'low' && b.priority === 'high') return 1;
      return 0;
    });
    
    // Start processing if not already running
    if (!isProcessingRef.current) {
      processQueue();
    }
  }, []);

  // Process the queue in batches
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }
    
    isProcessingRef.current = true;
    
    while (queueRef.current.length > 0) {
      // Determine batch config based on next item's priority
      const nextPriority = queueRef.current[0]?.priority || 'low';
      const config = nextPriority === 'high' 
        ? DEFAULT_HIGH_PRIORITY_CONFIG 
        : DEFAULT_LOW_PRIORITY_CONFIG;
      
      // Get batch of items with same priority
      const batch: BatchItem[] = [];
      for (let i = 0; i < Math.min(config.batchSize, queueRef.current.length); i++) {
        if (queueRef.current[i].priority === nextPriority) {
          batch.push(queueRef.current[i]);
        }
      }
      
      // Remove batched items from queue
      queueRef.current = queueRef.current.filter(item => 
        !batch.some(batchItem => batchItem.id === item.id)
      );
      
      // Process batch
      await processBatch(batch);
      
      // Wait between batches if more items remain
      if (queueRef.current.length > 0) {
        await new Promise(resolve => {
          timeoutRef.current = setTimeout(resolve, config.batchDelay);
        });
      }
    }
    
    isProcessingRef.current = false;
  }, []);

  // Process a single batch
  const processBatch = useCallback(async (batch: BatchItem[]) => {
    const promises = batch.map(async (item) => {
      try {
        await item.callback();
        return { id: item.id, success: true };
      } catch (error) {
        console.error(`Batch item ${item.id} failed:`, error);
        
        // Retry logic for failed items
        if (item.retryCount < 2) { // Max 2 retries
          item.retryCount++;
          queueRef.current.push(item); // Add back to queue for retry
        }
        
        return { id: item.id, success: false, error };
      }
    });
    
    // Wait for all batch items to complete
    await Promise.allSettled(promises);
  }, []);

  // Clear the queue and stop processing
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    isProcessingRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Get current queue status
  const getQueueStatus = useCallback(() => {
    const high = queueRef.current.filter(item => item.priority === 'high').length;
    const low = queueRef.current.filter(item => item.priority === 'low').length;
    
    return {
      total: queueRef.current.length,
      highPriority: high,
      lowPriority: low,
      isProcessing: isProcessingRef.current
    };
  }, []);

  return {
    addToBatch,
    clearQueue,
    getQueueStatus,
    isProcessing: () => isProcessingRef.current
  };
}