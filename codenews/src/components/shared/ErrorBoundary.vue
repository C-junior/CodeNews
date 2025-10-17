<template>
  <div v-if="hasError" class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <div class="text-center">
        <!-- Error Icon -->
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <!-- Error Title -->
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Oops! Algo deu errado
        </h3>
        
        <!-- Error Message -->
        <p class="text-sm text-gray-600 mb-6">
          {{ errorMessage }}
        </p>
        
        <!-- Error Details (only in development) -->
        <div v-if="showDetails && errorDetails" class="mb-6 p-3 bg-gray-100 rounded-lg text-left">
          <details>
            <summary class="text-sm font-medium text-gray-700 cursor-pointer">
              Detalhes técnicos
            </summary>
            <pre class="mt-2 text-xs text-gray-600 whitespace-pre-wrap">{{ errorDetails }}</pre>
          </details>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="retry"
            class="flex-1 bg-codenews-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
          <button
            @click="goHome"
            class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Ir para Início
          </button>
        </div>
        
        <!-- Report Error -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">
            Se o problema persistir, entre em contato com o suporte técnico.
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Normal content when no error -->
  <slot v-else />
</template>

<script>
import { ref, onErrorCaptured, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logError, handleGenericError } from '../../utils/errorHandler.js'
import { notifyError } from '../../utils/notifications.js'

export default {
  name: 'ErrorBoundary',
  props: {
    fallbackMessage: {
      type: String,
      default: 'Ocorreu um erro inesperado. Tente recarregar a página.'
    },
    showDetails: {
      type: Boolean,
      default: process.env.NODE_ENV === 'development'
    }
  },
  setup(props) {
    const router = useRouter()
    const hasError = ref(false)
    const errorMessage = ref(props.fallbackMessage)
    const errorDetails = ref('')
    const originalError = ref(null)

    // Capture Vue errors
    onErrorCaptured((error, instance, info) => {
      handleError(error, `Vue Error in ${info}`)
      return false // Prevent error from propagating
    })

    // Capture global JavaScript errors
    onMounted(() => {
      window.addEventListener('error', (event) => {
        handleError(event.error, 'Global JavaScript Error')
      })

      window.addEventListener('unhandledrejection', (event) => {
        handleError(event.reason, 'Unhandled Promise Rejection')
      })
    })

    const handleError = (error, context = 'Unknown Error') => {
      try {
        originalError.value = error
        hasError.value = true

        // Handle the error using our error handler
        const handledError = handleGenericError(error, context)
        logError(handledError, 'ErrorBoundary')

        // Set user-friendly message
        errorMessage.value = handledError.message || props.fallbackMessage

        // Set technical details for development
        if (props.showDetails) {
          errorDetails.value = `
Context: ${context}
Message: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace available'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
          `.trim()
        }

        // Show notification
        notifyError('Erro do Sistema', 'Um erro inesperado ocorreu. Verifique os detalhes.', {
          persistent: true
        })

      } catch (handlingError) {
        // Fallback if error handling itself fails
        console.error('Error in error handler:', handlingError)
        hasError.value = true
        errorMessage.value = 'Erro crítico do sistema. Recarregue a página.'
      }
    }

    const retry = () => {
      try {
        hasError.value = false
        errorMessage.value = props.fallbackMessage
        errorDetails.value = ''
        originalError.value = null
        
        // Force component re-render
        window.location.reload()
      } catch (error) {
        console.error('Error during retry:', error)
        window.location.reload()
      }
    }

    const goHome = () => {
      try {
        hasError.value = false
        router.push('/')
      } catch (error) {
        console.error('Error navigating home:', error)
        window.location.href = '/'
      }
    }

    // Expose method to manually trigger error boundary
    const triggerError = (error, context) => {
      handleError(error, context)
    }

    return {
      hasError,
      errorMessage,
      errorDetails,
      retry,
      goHome,
      triggerError
    }
  }
}
</script>

<style scoped>
/* Ensure error boundary takes full height */
.min-h-screen {
  min-height: 100vh;
}

/* Style for error details */
details summary {
  outline: none;
}

details[open] summary {
  margin-bottom: 0.5rem;
}

pre {
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
}
</style>