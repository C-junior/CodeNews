<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full space-y-6 lg:space-y-8">
      <div class="text-center">
        <div class="mb-6">
          <CodeNewsLogo size="large" variant="vertical" />
        </div>
        <h2 class="text-2xl lg:text-3xl font-extrabold text-neutral-900">
          Sistema de Atendimento Médico
        </h2>
        <p class="mt-2 text-sm lg:text-base text-neutral-600">
          Faça login para acessar o sistema
        </p>
      </div>

      <form class="bg-white rounded-lg shadow-md p-6 lg:p-8 space-y-4 lg:space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-neutral-700 mb-1">Usuário</label>
            <input id="username" v-model="form.username" name="username" type="text" required
              class="input-field"
              :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.username }" 
              placeholder="Digite seu usuário" />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-neutral-700 mb-1">Senha</label>
            <input id="password" v-model="form.password" name="password" type="password" required
              class="input-field"
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
            class="btn-primary w-full py-3 text-base transform hover:scale-105 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative">
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
      <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-primary-800 mb-2 flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Credenciais de demonstração:
        </h4>
        <div class="text-xs lg:text-sm text-primary-700 space-y-1">
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
import CodeNewsLogo from '@/components/shared/CodeNewsLogo.vue'

export default {
  name: 'LoginModule',
  components: {
    CodeNewsLogo
  },
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