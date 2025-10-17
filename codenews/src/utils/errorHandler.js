/**
 * Error handling utilities for CodeNews system
 * Provides centralized error handling and user feedback
 */

// Error types
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  STORAGE: 'storage',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SYSTEM: 'system'
}

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * Custom error class for CodeNews application
 */
export class CodeNewsError extends Error {
  constructor(message, type = ERROR_TYPES.SYSTEM, severity = ERROR_SEVERITY.MEDIUM, details = null) {
    super(message)
    this.name = 'CodeNewsError'
    this.type = type
    this.severity = severity
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

/**
 * Handles localStorage errors
 */
export function handleStorageError(error, operation = 'operação') {
  console.error(`Storage error during ${operation}:`, error)
  
  if (error.name === 'QuotaExceededError') {
    return new CodeNewsError(
      'Espaço de armazenamento esgotado. Limpe alguns dados antigos.',
      ERROR_TYPES.STORAGE,
      ERROR_SEVERITY.HIGH,
      { originalError: error, operation }
    )
  }
  
  return new CodeNewsError(
    `Erro ao ${operation}. Verifique se o navegador permite armazenamento local.`,
    ERROR_TYPES.STORAGE,
    ERROR_SEVERITY.MEDIUM,
    { originalError: error, operation }
  )
}

/**
 * Handles validation errors
 */
export function handleValidationError(validationErrors, context = 'formulário') {
  const errorCount = Object.keys(validationErrors).length
  const message = errorCount === 1 
    ? 'Corrija o erro no formulário'
    : `Corrija os ${errorCount} erros no formulário`
  
  return new CodeNewsError(
    message,
    ERROR_TYPES.VALIDATION,
    ERROR_SEVERITY.LOW,
    { validationErrors, context }
  )
}

/**
 * Handles data not found errors
 */
export function handleNotFoundError(resource, id = null) {
  const message = id 
    ? `${resource} com ID ${id} não encontrado`
    : `${resource} não encontrado`
  
  return new CodeNewsError(
    message,
    ERROR_TYPES.NOT_FOUND,
    ERROR_SEVERITY.MEDIUM,
    { resource, id }
  )
}

/**
 * Handles permission errors
 */
export function handlePermissionError(action, resource = null) {
  const message = resource 
    ? `Sem permissão para ${action} ${resource}`
    : `Sem permissão para ${action}`
  
  return new CodeNewsError(
    message,
    ERROR_TYPES.PERMISSION,
    ERROR_SEVERITY.HIGH,
    { action, resource }
  )
}

/**
 * Generic error handler that categorizes unknown errors
 */
export function handleGenericError(error, context = 'operação') {
  console.error(`Error in ${context}:`, error)
  
  // If it's already a CodeNewsError, return as is
  if (error instanceof CodeNewsError) {
    return error
  }
  
  // Handle specific error types
  if (error.name === 'QuotaExceededError') {
    return handleStorageError(error, context)
  }
  
  if (error.message && error.message.includes('permission')) {
    return handlePermissionError(context)
  }
  
  if (error.message && error.message.includes('not found')) {
    return handleNotFoundError(context)
  }
  
  // Generic system error
  return new CodeNewsError(
    `Erro interno durante ${context}. Tente novamente.`,
    ERROR_TYPES.SYSTEM,
    ERROR_SEVERITY.MEDIUM,
    { originalError: error, context }
  )
}

/**
 * Logs errors for debugging
 */
export function logError(error, context = 'unknown') {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    type: error.type || 'unknown',
    severity: error.severity || ERROR_SEVERITY.MEDIUM,
    stack: error.stack,
    details: error.details
  }
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 CodeNews Error - ${context}`)
    console.error('Message:', error.message)
    console.error('Type:', error.type)
    console.error('Severity:', error.severity)
    if (error.details) {
      console.error('Details:', error.details)
    }
    console.error('Stack:', error.stack)
    console.groupEnd()
  }
  
  // In production, you might want to send to an error tracking service
  // Example: sendToErrorTrackingService(logData)
  
  return logData
}

/**
 * Creates user-friendly error messages
 */
export function createUserMessage(error) {
  if (error instanceof CodeNewsError) {
    return error.message
  }
  
  // Fallback for unknown errors
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

/**
 * Determines if an error should be shown to the user
 */
export function shouldShowToUser(error) {
  if (error instanceof CodeNewsError) {
    return error.severity !== ERROR_SEVERITY.LOW
  }
  
  return true // Show unknown errors by default
}

/**
 * Creates a safe error handler for async operations
 */
export function createSafeHandler(asyncFn, context = 'operação') {
  return async (...args) => {
    try {
      return await asyncFn(...args)
    } catch (error) {
      const handledError = handleGenericError(error, context)
      logError(handledError, context)
      throw handledError
    }
  }
}

/**
 * Retry mechanism for failed operations
 */
export async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      // Don't retry validation or permission errors
      if (error instanceof CodeNewsError && 
          (error.type === ERROR_TYPES.VALIDATION || error.type === ERROR_TYPES.PERMISSION)) {
        break
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError
}

/**
 * Fallback data providers for when data is not found
 */
export const FALLBACK_DATA = {
  patient: {
    id: null,
    name: 'Paciente não encontrado',
    cid: '',
    priority: 'normal',
    status: 'unknown',
    registeredAt: new Date().toISOString()
  },
  
  user: {
    id: null,
    name: 'Usuário não encontrado',
    username: 'unknown',
    role: 'unknown',
    active: false
  },
  
  triage: {
    id: null,
    patientId: null,
    vitalSigns: {
      bloodPressure: 'N/A',
      heartRate: null,
      temperature: null,
      weight: null
    },
    riskClassification: 'unknown',
    notes: '',
    completed: false,
    createdAt: new Date().toISOString()
  },
  
  appointment: {
    id: null,
    patientId: null,
    diagnosis: 'Não disponível',
    outcome: 'unknown',
    notes: '',
    createdAt: new Date().toISOString(),
    completedAt: null
  }
}

/**
 * Gets fallback data when original data is not found
 */
export function getFallbackData(dataType, customData = {}) {
  const fallback = FALLBACK_DATA[dataType]
  if (!fallback) {
    console.warn(`No fallback data defined for type: ${dataType}`)
    return null
  }
  
  return { ...fallback, ...customData }
}

/**
 * Safe data getter with fallback
 */
export function safeGet(data, fallbackType, customFallback = {}) {
  if (data && typeof data === 'object' && data.id) {
    return data
  }
  
  return getFallbackData(fallbackType, customFallback)
}

/**
 * Validates localStorage availability
 */
export function validateStorageAvailability() {
  try {
    const testKey = '__codenews_storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    throw handleStorageError(error, 'teste de disponibilidade')
  }
}

/**
 * Safe localStorage operations
 */
export const safeStorage = {
  getItem(key, fallback = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch (error) {
      logError(handleStorageError(error, 'leitura'), `localStorage.getItem(${key})`)
      return fallback
    }
  },
  
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      const handledError = handleStorageError(error, 'escrita')
      logError(handledError, `localStorage.setItem(${key})`)
      throw handledError
    }
  },
  
  removeItem(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      logError(handleStorageError(error, 'remoção'), `localStorage.removeItem(${key})`)
      return false
    }
  }
}