import { defineStore } from 'pinia'
import { useAdminStore } from './admin.js'
import { handleGenericError, logError, safeStorage } from '../utils/errorHandler.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    isAuthenticated: false
  }),

  actions: {
    login(username, password) {
      try {
        // Input validation
        if (!username || !password) {
          return { success: false, error: 'Usuário e senha são obrigatórios' }
        }

        // Get admin store to access users
        const adminStore = useAdminStore()
        
        // Ensure users are loaded
        if (adminStore.users.length === 0) {
          adminStore.loadUsersFromStorage()
        }
        
        // Find user with matching credentials
        const user = adminStore.users.find(u => 
          u.username === username.trim() && 
          u.password === password && 
          u.active
        )
        
        if (user) {
          // Remove password from user object for security
          const { password: _, ...userWithoutPassword } = user
          this.currentUser = userWithoutPassword
          this.isAuthenticated = true
          
          // Persist authentication state safely
          safeStorage.setItem('currentUser', userWithoutPassword)
          safeStorage.setItem('isAuthenticated', true)
          
          return { success: true, user: userWithoutPassword }
        } else {
          return { success: false, error: 'Credenciais inválidas' }
        }
      } catch (error) {
        const handledError = handleGenericError(error, 'login')
        logError(handledError, 'AuthStore.login')
        return { success: false, error: handledError.message }
      }
    },

    logout() {
      try {
        this.currentUser = null
        this.isAuthenticated = false
        
        // Clear localStorage safely
        safeStorage.removeItem('currentUser')
        safeStorage.removeItem('isAuthenticated')
      } catch (error) {
        const handledError = handleGenericError(error, 'logout')
        logError(handledError, 'AuthStore.logout')
        // Continue with logout even if storage fails
        this.currentUser = null
        this.isAuthenticated = false
      }
    },

    checkAuth() {
      try {
        // Check if user is authenticated from localStorage
        const storedUser = safeStorage.getItem('currentUser')
        const storedAuth = safeStorage.getItem('isAuthenticated')
        
        if (storedUser && storedAuth === true) {
          // Validate stored user data
          if (storedUser.id && storedUser.username && storedUser.role) {
            this.currentUser = storedUser
            this.isAuthenticated = true
            return true
          }
        }
        
        // Clear invalid data
        this.logout()
        return false
      } catch (error) {
        const handledError = handleGenericError(error, 'verificação de autenticação')
        logError(handledError, 'AuthStore.checkAuth')
        
        // Clear potentially corrupted data
        this.logout()
        return false
      }
    }
  }
})