/**
 * Notification utilities for user feedback
 * Standardized toast messages for common scenarios
 */

/**
 * Show conflict warning when question is updated by another admin
 */
export function showConflictWarning(
  questionTitle: string,
  actorEmail: string,
  onViewChanges: () => void,
  onKeep: () => void,
  onRefresh: () => void
) {
  const toast = useToast()
  
  toast.add({
    id: `conflict-${Date.now()}`,
    title: 'Question Updated by Another Admin',
    description: `"${questionTitle}" was modified by ${actorEmail} while you were editing.`,
    color: 'amber',
    timeout: 0, // Don't auto-dismiss
    icon: 'i-heroicons-exclamation-triangle',
    actions: [
      {
        label: 'View Changes',
        click: onViewChanges,
      },
      {
        label: 'Keep Mine',
        click: onKeep,
      },
      {
        label: 'Use Theirs',
        click: onRefresh,
      },
    ],
  })
}

/**
 * Show error message for failed optimistic update
 */
export function showOptimisticError(
  message: string,
  onRetry?: () => void
) {
  const toast = useToast()
  
  const actions: any[] = []
  
  if (onRetry) {
    actions.push({
      label: 'Retry',
      click: onRetry,
    })
  }
  
  actions.push({
    label: 'Dismiss',
  })
  
  toast.add({
    title: 'Save Failed',
    description: message,
    color: 'red',
    timeout: 5000,
    icon: 'i-heroicons-x-circle',
    actions,
  })
}

/**
 * Show success message for successful save
 */
export function showSaveSuccess(message: string = 'Changes saved') {
  const toast = useToast()
  
  toast.add({
    title: 'Saved',
    description: message,
    color: 'green',
    timeout: 2000,
    icon: 'i-heroicons-check-circle',
  })
}

/**
 * Show WebSocket connection status change
 */
export function showConnectionStatus(
  status: 'connected' | 'disconnected' | 'error',
  message?: string
) {
  const toast = useToast()
  
  const config: Record<typeof status, any> = {
    connected: {
      title: 'Connected',
      description: message || 'Real-time updates active',
      color: 'green',
      timeout: 3000,
      icon: 'i-heroicons-check-circle',
    },
    disconnected: {
      title: 'Disconnected',
      description: message || 'Real-time updates paused',
      color: 'gray',
      timeout: 4000,
      icon: 'i-heroicons-wifi',
    },
    error: {
      title: 'Connection Error',
      description: message || 'Unable to connect for real-time updates',
      color: 'red',
      timeout: 6000,
      icon: 'i-heroicons-exclamation-circle',
    },
  }
  
  toast.add(config[status])
}

/**
 * Show notification for question created by another admin
 */
export function showQuestionCreated(questionTitle: string, actorEmail?: string) {
  const toast = useToast()
  
  toast.add({
    title: 'Question Added',
    description: actorEmail 
      ? `"${questionTitle}" was added by ${actorEmail}`
      : `"${questionTitle}" was added`,
    color: 'blue',
    timeout: 4000,
    icon: 'i-heroicons-plus-circle',
  })
}

/**
 * Show notification for question deleted by another admin
 */
export function showQuestionDeleted(
  questionTitle: string,
  actorEmail?: string,
  wasEditing: boolean = false
) {
  const toast = useToast()
  
  toast.add({
    title: 'Question Deleted',
    description: wasEditing
      ? `"${questionTitle}" was deleted by ${actorEmail || 'another admin'} while you were editing it.`
      : `"${questionTitle}" was deleted`,
    color: wasEditing ? 'red' : 'orange',
    timeout: wasEditing ? 6000 : 4000,
    icon: 'i-heroicons-trash',
  })
}

/**
 * Show notification for retrying save
 */
export function showRetrying(attempt: number, maxAttempts: number) {
  const toast = useToast()
  
  toast.add({
    title: 'Retrying...',
    description: `Attempting to save (${attempt}/${maxAttempts})`,
    color: 'blue',
    timeout: 2000,
    icon: 'i-heroicons-arrow-path',
  })
}
