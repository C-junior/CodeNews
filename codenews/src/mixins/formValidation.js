/**
 * Form validation mixin for Vue components
 * Provides common validation functionality and error handling
 */

import { reactive, computed } from 'vue'
import { validateForm } from '../utils/validation.js'
import { formNotifications } from '../utils/notifications.js'

export function useFormValidation(initialData = {}, validationRules = {}) {
  // Form data
  const formData = reactive({ ...initialData })
  
  // Form errors
  const formErrors = reactive({})
  
  // Loading state
  const isSubmitting = reactive({ value: false })
  
  // Validation state
  const isValid = computed(() => {
    return Object.keys(formErrors).length === 0
  })
  
  // Validate a single field
  const validateField = (fieldName, value = null) => {
    const fieldValue = value !== null ? value : formData[fieldName]
    const fieldRules = validationRules[fieldName]
    
    if (!fieldRules) {
      delete formErrors[fieldName]
      return true
    }
    
    // Run validation rules for this field
    for (const rule of fieldRules) {
      const error = rule(fieldValue)
      if (error) {
        formErrors[fieldName] = error
        return false
      }
    }
    
    // No errors found
    delete formErrors[fieldName]
    return true
  }
  
  // Validate all fields
  const validateAllFields = () => {
    const validation = validateForm(formData, validationRules)
    
    // Clear existing errors
    Object.keys(formErrors).forEach(key => {
      delete formErrors[key]
    })
    
    // Set new errors
    Object.assign(formErrors, validation.errors)
    
    return validation.isValid
  }
  
  // Clear all errors
  const clearErrors = () => {
    Object.keys(formErrors).forEach(key => {
      delete formErrors[key]
    })
  }
  
  // Clear specific field error
  const clearFieldError = (fieldName) => {
    delete formErrors[fieldName]
  }
  
  // Reset form to initial state
  const resetForm = (newInitialData = null) => {
    const dataToUse = newInitialData || initialData
    
    // Reset form data
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })
    Object.assign(formData, { ...dataToUse })
    
    // Clear errors
    clearErrors()
    
    // Reset submitting state
    isSubmitting.value = false
  }
  
  // Set form data
  const setFormData = (newData) => {
    Object.assign(formData, newData)
  }
  
  // Set form errors
  const setFormErrors = (errors) => {
    clearErrors()
    Object.assign(formErrors, errors)
  }
  
  // Handle form submission with validation
  const handleSubmit = async (submitFn, options = {}) => {
    const {
      validateBeforeSubmit = true,
      showValidationErrors = true,
      resetOnSuccess = false,
      formName = 'formulário'
    } = options
    
    // Prevent double submission
    if (isSubmitting.value) {
      return { success: false, error: 'Submissão em andamento' }
    }
    
    try {
      // Validate form if required
      if (validateBeforeSubmit && !validateAllFields()) {
        if (showValidationErrors) {
          formNotifications.validationErrors(formErrors, formName)
        }
        return { success: false, error: 'Erro de validação', errors: formErrors }
      }
      
      // Set submitting state
      isSubmitting.value = true
      
      // Call submit function
      const result = await submitFn(formData)
      
      // Reset form if successful and requested
      if (result && result.success && resetOnSuccess) {
        resetForm()
      }
      
      return result || { success: true }
      
    } catch (error) {
      return { success: false, error: error.message || 'Erro ao enviar formulário' }
    } finally {
      isSubmitting.value = false
    }
  }
  
  // Create field validation handler for input events
  const createFieldValidator = (fieldName, debounceMs = 300) => {
    let timeoutId = null
    
    return (value) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        validateField(fieldName, value)
      }, debounceMs)
    }
  }
  
  // Get field error message
  const getFieldError = (fieldName) => {
    return formErrors[fieldName] || null
  }
  
  // Check if field has error
  const hasFieldError = (fieldName) => {
    return !!formErrors[fieldName]
  }
  
  // Get field CSS classes for styling
  const getFieldClasses = (fieldName, baseClasses = '', errorClasses = 'border-red-300') => {
    return hasFieldError(fieldName) 
      ? `${baseClasses} ${errorClasses}`.trim()
      : baseClasses
  }
  
  return {
    // Data
    formData,
    formErrors,
    isSubmitting: computed(() => isSubmitting.value),
    isValid,
    
    // Methods
    validateField,
    validateAllFields,
    clearErrors,
    clearFieldError,
    resetForm,
    setFormData,
    setFormErrors,
    handleSubmit,
    createFieldValidator,
    getFieldError,
    hasFieldError,
    getFieldClasses
  }
}

/**
 * Composable for common form patterns
 */
export function useCommonFormPatterns() {
  // Create a debounced input handler
  const createDebouncedHandler = (handler, delay = 300) => {
    let timeoutId = null
    
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => handler(...args), delay)
    }
  }
  
  // Create a loading state manager
  const createLoadingState = () => {
    const loading = reactive({ value: false })
    
    const withLoading = async (asyncFn) => {
      if (loading.value) return
      
      loading.value = true
      try {
        return await asyncFn()
      } finally {
        loading.value = false
      }
    }
    
    return {
      loading: computed(() => loading.value),
      withLoading
    }
  }
  
  // Create a success/error message handler
  const createMessageHandler = () => {
    const message = reactive({ 
      text: '', 
      type: 'info', // 'success', 'error', 'warning', 'info'
      show: false 
    })
    
    const showMessage = (text, type = 'info', duration = 5000) => {
      message.text = text
      message.type = type
      message.show = true
      
      if (duration > 0) {
        setTimeout(() => {
          message.show = false
        }, duration)
      }
    }
    
    const hideMessage = () => {
      message.show = false
    }
    
    return {
      message: computed(() => ({ ...message })),
      showMessage,
      hideMessage,
      showSuccess: (text, duration) => showMessage(text, 'success', duration),
      showError: (text, duration) => showMessage(text, 'error', duration),
      showWarning: (text, duration) => showMessage(text, 'warning', duration),
      showInfo: (text, duration) => showMessage(text, 'info', duration)
    }
  }
  
  return {
    createDebouncedHandler,
    createLoadingState,
    createMessageHandler
  }
}