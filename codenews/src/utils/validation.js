/**
 * Validation utilities for CodeNews system
 * Provides centralized validation functions and error messages
 */

// Common validation patterns
export const VALIDATION_PATTERNS = {
  // Blood pressure format: 120/80
  BLOOD_PRESSURE: /^\d{2,3}\/\d{2,3}$/,
  // CID format: Letter + numbers + optional decimal (J06.9, I21)
  CID: /^[A-Z]\d{1,2}(\.\d)?$/,
  // Username: alphanumeric, underscore, dash (3-20 chars)
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  // Name: letters, spaces, accents (2-50 chars)
  NAME: /^[a-zA-ZÀ-ÿ\s]{2,50}$/
}

// Validation ranges
export const VALIDATION_RANGES = {
  HEART_RATE: { min: 30, max: 200 },
  TEMPERATURE: { min: 30.0, max: 45.0 },
  WEIGHT: { min: 1, max: 300 },
  BLOOD_PRESSURE_SYSTOLIC: { min: 60, max: 250 },
  BLOOD_PRESSURE_DIASTOLIC: { min: 30, max: 150 }
}

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  INVALID_FORMAT: 'Formato inválido',
  TOO_SHORT: 'Muito curto',
  TOO_LONG: 'Muito longo',
  OUT_OF_RANGE: 'Valor fora do intervalo permitido',
  INVALID_EMAIL: 'Email inválido',
  PASSWORDS_DONT_MATCH: 'Senhas não coincidem',
  USERNAME_EXISTS: 'Nome de usuário já existe',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  STORAGE_ERROR: 'Erro ao salvar dados. Verifique o espaço disponível.',
  DATA_NOT_FOUND: 'Dados não encontrados',
  PERMISSION_DENIED: 'Acesso negado'
}

/**
 * Validates required fields
 */
export function validateRequired(value, fieldName = 'Campo') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} é obrigatório`
  }
  return null
}

/**
 * Validates string length
 */
export function validateLength(value, min = 0, max = Infinity, fieldName = 'Campo') {
  if (!value) return null
  
  const length = value.toString().length
  if (length < min) {
    return `${fieldName} deve ter pelo menos ${min} caracteres`
  }
  if (length > max) {
    return `${fieldName} deve ter no máximo ${max} caracteres`
  }
  return null
}

/**
 * Validates numeric range
 */
export function validateRange(value, min, max, fieldName = 'Valor') {
  if (value === null || value === undefined || value === '') return null
  
  const numValue = Number(value)
  if (isNaN(numValue)) {
    return `${fieldName} deve ser um número válido`
  }
  if (numValue < min || numValue > max) {
    return `${fieldName} deve estar entre ${min} e ${max}`
  }
  return null
}

/**
 * Validates pattern match
 */
export function validatePattern(value, pattern, fieldName = 'Campo', customMessage = null) {
  if (!value) return null
  
  if (!pattern.test(value)) {
    return customMessage || `${fieldName} tem formato inválido`
  }
  return null
}

/**
 * Validates username
 */
export function validateUsername(username) {
  const errors = []
  
  const requiredError = validateRequired(username, 'Nome de usuário')
  if (requiredError) return requiredError
  
  const lengthError = validateLength(username, 3, 20, 'Nome de usuário')
  if (lengthError) return lengthError
  
  const patternError = validatePattern(
    username, 
    VALIDATION_PATTERNS.USERNAME, 
    'Nome de usuário',
    'Nome de usuário deve conter apenas letras, números, _ ou -'
  )
  if (patternError) return patternError
  
  return null
}

/**
 * Validates password
 */
export function validatePassword(password, isRequired = true) {
  if (!isRequired && !password) return null
  
  const requiredError = validateRequired(password, 'Senha')
  if (requiredError) return requiredError
  
  const lengthError = validateLength(password, 6, 50, 'Senha')
  if (lengthError) return lengthError
  
  return null
}

/**
 * Validates patient name
 */
export function validatePatientName(name) {
  const requiredError = validateRequired(name, 'Nome')
  if (requiredError) return requiredError
  
  const lengthError = validateLength(name, 2, 50, 'Nome')
  if (lengthError) return lengthError
  
  const patternError = validatePattern(
    name, 
    VALIDATION_PATTERNS.NAME, 
    'Nome',
    'Nome deve conter apenas letras e espaços'
  )
  if (patternError) return patternError
  
  return null
}

/**
 * Validates CID code
 */
export function validateCid(cid) {
  if (!cid) return null // CID is optional
  
  const patternError = validatePattern(
    cid.toUpperCase(), 
    VALIDATION_PATTERNS.CID, 
    'CID',
    'CID deve seguir o formato: letra + números (ex: J06.9, I21)'
  )
  if (patternError) return patternError
  
  return null
}

/**
 * Validates blood pressure
 */
export function validateBloodPressure(bloodPressure) {
  const requiredError = validateRequired(bloodPressure, 'Pressão arterial')
  if (requiredError) return requiredError
  
  const patternError = validatePattern(
    bloodPressure, 
    VALIDATION_PATTERNS.BLOOD_PRESSURE, 
    'Pressão arterial',
    'Pressão arterial deve seguir o formato: sistólica/diastólica (ex: 120/80)'
  )
  if (patternError) return patternError
  
  // Validate systolic and diastolic values
  const match = bloodPressure.match(/(\d+)\/(\d+)/)
  if (match) {
    const systolic = parseInt(match[1])
    const diastolic = parseInt(match[2])
    
    const systolicError = validateRange(
      systolic, 
      VALIDATION_RANGES.BLOOD_PRESSURE_SYSTOLIC.min, 
      VALIDATION_RANGES.BLOOD_PRESSURE_SYSTOLIC.max, 
      'Pressão sistólica'
    )
    if (systolicError) return systolicError
    
    const diastolicError = validateRange(
      diastolic, 
      VALIDATION_RANGES.BLOOD_PRESSURE_DIASTOLIC.min, 
      VALIDATION_RANGES.BLOOD_PRESSURE_DIASTOLIC.max, 
      'Pressão diastólica'
    )
    if (diastolicError) return diastolicError
    
    if (systolic <= diastolic) {
      return 'Pressão sistólica deve ser maior que a diastólica'
    }
  }
  
  return null
}

/**
 * Validates heart rate
 */
export function validateHeartRate(heartRate) {
  const requiredError = validateRequired(heartRate, 'Frequência cardíaca')
  if (requiredError) return requiredError
  
  return validateRange(
    heartRate, 
    VALIDATION_RANGES.HEART_RATE.min, 
    VALIDATION_RANGES.HEART_RATE.max, 
    'Frequência cardíaca'
  )
}

/**
 * Validates temperature
 */
export function validateTemperature(temperature) {
  const requiredError = validateRequired(temperature, 'Temperatura')
  if (requiredError) return requiredError
  
  return validateRange(
    temperature, 
    VALIDATION_RANGES.TEMPERATURE.min, 
    VALIDATION_RANGES.TEMPERATURE.max, 
    'Temperatura'
  )
}

/**
 * Validates weight
 */
export function validateWeight(weight) {
  if (!weight) return null // Weight is optional
  
  return validateRange(
    weight, 
    VALIDATION_RANGES.WEIGHT.min, 
    VALIDATION_RANGES.WEIGHT.max, 
    'Peso'
  )
}

/**
 * Validates diagnosis text
 */
export function validateDiagnosis(diagnosis) {
  const requiredError = validateRequired(diagnosis, 'Diagnóstico')
  if (requiredError) return requiredError
  
  const lengthError = validateLength(diagnosis, 10, 500, 'Diagnóstico')
  if (lengthError) return lengthError
  
  return null
}

/**
 * Validates form data using validation rules
 */
export function validateForm(formData, validationRules) {
  const errors = {}
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field]
    
    for (const rule of rules) {
      const error = rule(value)
      if (error) {
        errors[field] = error
        break // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Creates a debounced validation function
 */
export function createDebouncedValidator(validationFn, delay = 300) {
  let timeoutId = null
  
  return function(value, callback) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      const error = validationFn(value)
      callback(error)
    }, delay)
  }
}

/**
 * Sanitizes input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validates and sanitizes form data
 */
export function validateAndSanitizeForm(formData, validationRules) {
  // First sanitize all string inputs
  const sanitizedData = {}
  for (const [key, value] of Object.entries(formData)) {
    sanitizedData[key] = sanitizeInput(value)
  }
  
  // Then validate
  const validation = validateForm(sanitizedData, validationRules)
  
  return {
    ...validation,
    sanitizedData
  }
}