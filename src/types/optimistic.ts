/**
 * Status of an optimistic operation
 */
export type OptimisticStatus = 'pending' | 'retrying' | 'success' | 'error'

/**
 * Type of optimistic operation
 */
export type OptimisticOperationType = 'create' | 'update' | 'delete' | 'reorder'

/**
 * Optimistic operation with retry logic
 */
export interface OptimisticOperation<T> {
  /** Unique operation ID */
  id: string
  /** Type of operation */
  type: OptimisticOperationType
  /** Current data state */
  data: T
  /** Current status */
  status: OptimisticStatus
  /** Number of retry attempts */
  retryCount: number
  /** Maximum retry attempts before rollback */
  maxRetries: number
  /** Original data for rollback */
  originalData?: T
  /** Error from last attempt */
  error?: Error
  /** Timestamp when operation was created */
  timestamp: number
  /** Timestamp of last retry */
  lastRetry?: number
}

/**
 * Optimistic operation queue manager interface
 */
export interface OptimisticQueue<T = any> {
  /** All operations in the queue */
  operations: Map<string, OptimisticOperation<T>>
  
  /** Add operation to queue */
  add(operation: OptimisticOperation<T>): void
  
  /** Remove operation from queue */
  remove(id: string): void
  
  /** Retry a failed operation */
  retry(id: string): Promise<void>
  
  /** Rollback operation and restore original data */
  rollback(id: string): void
  
  /** Clear all operations */
  clear(): void
  
  /** Get operation by ID */
  get(id: string): OptimisticOperation<T> | undefined
  
  /** Check if operation exists */
  has(id: string): boolean
}

/**
 * Options for creating an optimistic operation
 */
export interface CreateOptimisticOperationOptions<T> {
  type: OptimisticOperationType
  data: T
  originalData?: T
  maxRetries?: number
}

/**
 * Result of an optimistic operation
 */
export interface OptimisticResult<T> {
  success: boolean
  data?: T
  error?: Error
}
