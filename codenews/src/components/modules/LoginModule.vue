<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full space-y-6 lg:space-y-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-codenews-blue rounded-xl mx-auto mb-4 flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-2xl lg:text-3xl font-extrabold text-gray-900">
          Sistema CodeNews
        </h2>
        <p class="mt-2 text-sm lg:text-base text-gray-600">
          Faça login para acessar o sistema
        </p>
      </div>

      <form class="bg-white rounded-lg shadow-md p-6 lg:p-8 space-y-4 lg:space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <input id="username" v-model="form.username" name="username" type="text" required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-codenews-blue focus:border-codenews-blue transition-all duration-200 text-base"
              :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.username }" 
              placeholder="Digite seu usuário" />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input id="password" v-model="form.password" name="password" type="password" required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-codenews-blue focus:border-codenews-blue transition-all duration-200 text-base"
              :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.password }" 
              placeholder="Digite sua senha" />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="loginError" class="rounded-md bg-red-50 border border-red-200 p-4 transition-all duration-300">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-sm font-medium text-red-800">
              {{ loginError }}
            </h3>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-codenews-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-codenews-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 touch-manipulation">
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
            </span>
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>
      </form>

      <!-- Demo credentials info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-800 mb-2 flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Credenciais de demonstração:
        </h4>
        <div class="text-xs lg:text-sm text-blue-700 space-y-1">
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>Acolhimento:</strong> acolhimento / acol123</p>
          <p><strong>Triagem:</strong> triagem / tri123</p>
          <p><strong>Médico:</strong> medico / med123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateUsername, validatePassword } from '@/utils/validation'
import { userNotifications } from '@/utils/notifications'
import { handleGenericError, logError } from '@/utils/errorHandler'

export default {
  name: 'LoginModule',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = reactive({
      username: '',
      password: ''
    })

    const errors = reactive({
      username: '',
      password: ''
    })

    const loginError = ref('')
    const isLoading = ref(false)

    const validateForm = () => {
      // Reset errors
      errors.username = ''
      errors.password = ''

      let isValid = true

      // Validate username
      const usernameError = validateUsername(form.username)
      if (usernameError) {
        errors.username = usernameError
        isValid = false
      }

      // Validate password
      const passwordError = validatePassword(form.password, true)
      if (passwordError) {
        errors.password = passwordError
        isValid = false
      }

      return isValid
    }

    const handleLogin = async () => {
      loginError.value = ''

      if (!validateForm()) {
        return
      }

      isLoading.value = true

      try {
        // Simulate API delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))

        const result = authStore.login(form.username, form.password)

        if (result.success) {
          // Show success notification
          userNotifications.loginSuccess(result.user.name)
          
          // Redirect based on user role
          const userRole = result.user.role
          switch (userRole) {
            case 'admin':
              router.push('/admin')
              break
            case 'reception':
              router.push('/reception')
              break
            case 'triage':
              router.push('/triage')
              break
            case 'care':
              router.push('/care')
              break
            default:
              router.push('/admin')
          }
        } else {
          loginError.value = result.error
          userNotifications.loginError()
        }
      } catch (error) {
        const handledError = handleGenericError(error, 'login')
        logError(handledError, 'LoginModule.handleLogin')
        loginError.value = handledError.message
        userNotifications.loginError()
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      errors,
      loginError,
      isLoading,
      handleLogin
    }
  }
}
</script>