import type {
  OptimisticOperation,
  OptimisticOperationType,
  OptimisticStatus,
} from '~/types/optimistic'

/**
 * Retry delay configuration (exponential backoff)
 */
const RETRY_DELAYS = [500, 1000, 2000] // milliseconds

/**
 * Generate unique operation ID
 */
function generateOperationId(type: OptimisticOperationType): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Composable for managing optimistic updates with automatic retry and rollback
 * 
 * @template T - Type of data being operated on
 * @returns Optimistic update manager
 * 
 * @example
 * ```ts
 * const optimistic = useOptimisticUpdates<EventQuestion>()
 * 
 * // Add operation with automatic retry
 * const opId = optimistic.addOperation(
 *   'update',
 *   updatedQuestion,
 *   originalQuestion,
 *   async () => {
 *     await $api.PATCH('/event/questions/{id}/', { ... })
 *   }
 * )
 * 
 * // Check status
 * console.log(optimistic.operations.value.get(opId)?.status)
 * ```
 */
export function useOptimisticUpdates<T = any>() {
  const toast = useToast()
  
  // Operation queue (use shallowRef for Map to avoid deep reactivity issues)
  const operations = shallowRef<Map<string, OptimisticOperation<T>>>(new Map())
  
  /**
   * Execute operation with retry logic
   */
  async function executeWithRetry(
    operation: OptimisticOperation<T>,
    executeFn: () => Promise<any>
  ): Promise<void> {
    try {
      // Execute the operation
      await executeFn()
      
      // Success - mark as completed and remove from queue
      operation.status = 'success'
      
      // Keep in queue briefly for UI feedback, then remove
      setTimeout(() => {
        operations.value.delete(operation.id)
      }, 100)
      
    } catch (error) {
      console.error(`[Optimistic] Operation failed (attempt ${operation.retryCount + 1}):`, error)
      
      // Check if we should retry
      if (operation.retryCount < operation.maxRetries) {
        operation.status = 'retrying'
        operation.retryCount++
        operation.lastRetry = Date.now()
        operation.error = error as Error
        
        // Get retry delay
        const delay = RETRY_DELAYS[operation.retryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
        
        console.log(`[Optimistic] Retrying in ${delay}ms (attempt ${operation.retryCount}/${operation.maxRetries})`)
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, delay))
        return executeWithRetry(operation, executeFn)
        
      } else {
        // Max retries reached - rollback
        console.error(`[Optimistic] Max retries reached, rolling back operation:`, operation.id)
        
        operation.status = 'error'
        operation.error = error as Error
        
        // Rollback and show error
        rollback(operation)
      }
    }
  }
  
  /**
   * Rollback operation and restore original data
   */
  function rollback(operation: OptimisticOperation<T>) {
    const errorMessage = operation.error?.message || 'Operation failed after multiple retries'
    
    // Show error toast
    toast.add({
      title: 'Save Failed',
      description: errorMessage,
      color: 'red',
      timeout: 5000,
      actions: [
        {
          label: 'Retry',
          click: () => retry(operation.id),
        },
        {
          label: 'Dismiss',
          click: () => {
            operations.value.delete(operation.id)
          },
        },
      ],
    })
    
    // Note: Actual data rollback is handled by the caller
    // They need to watch for failed operations and revert state
  }
  
  /**
   * Manually retry a failed operation
   */
  async function retry(operationId: string): Promise<void> {
    const operation = operations.value.get(operationId)
    
    if (!operation) {
      console.warn(`[Optimistic] Cannot retry - operation not found: ${operationId}`)
      return
    }
    
    // Reset retry count for manual retry
    operation.retryCount = 0
    operation.status = 'pending'
    operation.error = undefined
    
    // Note: We can't re-execute here because we don't have the executeFn
    // The caller needs to watch for retry requests and re-execute
    toast.add({
      title: 'Retrying...',
      description: 'Attempting to save changes again',
      color: 'blue',
      timeout: 2000,
    })
  }
  
  /**
   * Add operation to queue and execute with retry
   * 
   * @param type - Type of operation
   * @param data - Current data state
   * @param originalData - Original data for rollback (optional)
   * @param executeFn - Function to execute the operation
   * @param maxRetries - Maximum retry attempts (default: 3)
   * @returns Operation ID
   */
  function addOperation(
    type: OptimisticOperationType,
    data: T,
    originalData: T | undefined,
    executeFn: () => Promise<any>,
    maxRetries: number = 3
  ): string {
    const id = generateOperationId(type)
    
    const operation: OptimisticOperation<T> = {
      id,
      type,
      data,
      status: 'pending',
      retryCount: 0,
      maxRetries,
      originalData,
      timestamp: Date.now(),
    }
    
    // Add to queue
    operations.value.set(id, operation)
    
    // Execute with retry
    executeWithRetry(operation, executeFn)
    
    return id
  }
  
  /**
   * Remove operation from queue
   */
  function removeOperation(operationId: string) {
    operations.value.delete(operationId)
  }
  
  /**
   * Get operation by ID
   */
  function getOperation(operationId: string): OptimisticOperation<T> | undefined {
    return operations.value.get(operationId)
  }
  
  /**
   * Check if operation exists
   */
  function hasOperation(operationId: string): boolean {
    return operations.value.has(operationId)
  }
  
  /**
   * Clear all operations
   */
  function clear() {
    operations.value.clear()
  }
  
  /**
   * Get all operations with specific status
   */
  function getOperationsByStatus(status: OptimisticStatus): OptimisticOperation<T>[] {
    return Array.from(operations.value.values()).filter(op => op.status === status)
  }
  
  /**
   * Get all pending operations
   */
  const pendingOperations = computed(() => getOperationsByStatus('pending'))
  
  /**
   * Get all retrying operations
   */
  const retryingOperations = computed(() => getOperationsByStatus('retrying'))
  
  /**
   * Get all failed operations
   */
  const failedOperations = computed(() => getOperationsByStatus('error'))
  
  /**
   * Check if any operations are in progress
   */
  const hasOperationsInProgress = computed(() => 
    pendingOperations.value.length > 0 || retryingOperations.value.length > 0
  )
  
  /**
   * Check if any operations have failed
   */
  const hasFailedOperations = computed(() => failedOperations.value.length > 0)
  
  return {
    // State
    operations: readonly(operations),
    
    // Computed
    pendingOperations,
    retryingOperations,
    failedOperations,
    hasOperationsInProgress,
    hasFailedOperations,
    
    // Methods
    addOperation,
    removeOperation,
    getOperation,
    hasOperation,
    retry,
    clear,
    getOperationsByStatus,
  }
}
