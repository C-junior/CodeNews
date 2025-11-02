import { defineStore } from 'pinia'
import { handleGenericError, logError, safeStorage } from '../utils/errorHandler.js'

export const useQueueStore = defineStore('queue', {
  state: () => ({
    passwords: [],
    currentPassword: null,
    queue: [],
    counters: {
      preferential: 0,
      normal: 0
    }
  }),

  getters: {
    waitingQueue: (state) => {
      return state.passwords
        .filter(p => p.status === 'waiting')
        .sort((a, b) => {
          // Preferential passwords have priority
          if (a.priority === 'preferential' && b.priority === 'normal') return -1
          if (a.priority === 'normal' && b.priority === 'preferential') return 1
          // Same priority, sort by creation time
          return new Date(a.createdAt) - new Date(b.createdAt)
        })
    },

    nextInQueue: (state) => {
      const waiting = state.passwords.filter(p => p.status === 'waiting')
      if (waiting.length === 0) return null
      
      // Find next preferential password first
      const nextPreferential = waiting.find(p => p.priority === 'preferential')
      if (nextPreferential) return nextPreferential
      
      // Otherwise return next normal password
      return waiting.find(p => p.priority === 'normal')
    }
  },

  actions: {
    generatePassword(priority = 'normal', patientId = null) {
      try {
        // Validate priority
        if (!['normal', 'preferential'].includes(priority)) {
          throw new Error(`Prioridade inválida: ${priority}`)
        }

        // Increment counter for the priority type
        this.counters[priority]++
        
        // Generate password number based on priority
        const prefix = priority === 'preferential' ? 'P' : 'N'
        const number = `${prefix}${this.counters[priority].toString().padStart(3, '0')}`
        
        // Create password object
        const password = {
          id: `pwd_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          number,
          patientId,
          priority,
          status: 'waiting', // 'waiting', 'called', 'completed'
          createdAt: new Date().toISOString(),
          calledAt: null
        }
        
        // Add to passwords array
        this.passwords.push(password)
        
        // Save to localStorage
        this.saveToStorage()
        
        return password
      } catch (error) {
        const handledError = handleGenericError(error, 'gerar senha')
        logError(handledError, 'QueueStore.generatePassword')
        throw handledError
      }
    },

    callNext() {
      try {
        const nextPassword = this.nextInQueue
        if (!nextPassword) {
          throw new Error('Nenhuma senha na fila para chamar')
        }
        
        // Update current password
        if (this.currentPassword) {
          this.currentPassword.status = 'completed'
        }
        
        // Set new current password
        nextPassword.status = 'called'
        nextPassword.calledAt = new Date().toISOString()
        this.currentPassword = nextPassword
        
        // Save to localStorage
        this.saveToStorage()
        
        return nextPassword
      } catch (error) {
        const handledError = handleGenericError(error, 'chamar próxima senha')
        logError(handledError, 'QueueStore.callNext')
        throw handledError
      }
    },

    updatePasswordStatus(passwordId, status) {
      try {
        if (!passwordId) {
          throw new Error('ID da senha é obrigatório')
        }

        const password = this.passwords.find(p => p.id === passwordId)
        if (!password) {
          throw new Error(`Senha com ID ${passwordId} não encontrada`)
        }

        password.status = status
        if (status === 'called') {
          password.calledAt = new Date().toISOString()
          this.currentPassword = password
        }
        this.saveToStorage()
        
        return password
      } catch (error) {
        const handledError = handleGenericError(error, 'atualizar status da senha')
        logError(handledError, 'QueueStore.updatePasswordStatus')
        throw handledError
      }
    },
    
    updatePasswordPatientId(passwordId, patientId) {
      try {
        if (!passwordId) {
          throw new Error('ID da senha é obrigatório')
        }

        const password = this.passwords.find(p => p.id === passwordId)
        if (!password) {
          throw new Error(`Senha com ID ${passwordId} não encontrada`)
        }

        password.patientId = patientId
        this.saveToStorage()
        
        return password
      } catch (error) {
        const handledError = handleGenericError(error, 'atualizar ID do paciente na senha')
        logError(handledError, 'QueueStore.updatePasswordPatientId')
        throw handledError
      }
    },

    resetQueue() {
      this.passwords = []
      this.currentPassword = null
      this.counters = { preferential: 0, normal: 0 }
      this.saveToStorage()
    },

    saveToStorage() {
      try {
        safeStorage.setItem('codenews_queue', {
          passwords: this.passwords,
          currentPassword: this.currentPassword,
          counters: this.counters
        })
      } catch (error) {
        const handledError = handleGenericError(error, 'salvar dados da fila')
        logError(handledError, 'QueueStore.saveToStorage')
        throw handledError
      }
    },

    loadFromStorage() {
      try {
        const data = safeStorage.getItem('codenews_queue', {
          passwords: [],
          currentPassword: null,
          counters: { preferential: 0, normal: 0 }
        })
        
        // Validate loaded data structure
        if (Array.isArray(data.passwords)) {
          this.passwords = data.passwords.filter(password => 
            password && 
            password.id && 
            password.number && 
            typeof password.status === 'string'
          )
        } else {
          this.passwords = []
        }
        
        this.currentPassword = data.currentPassword || null
        this.counters = data.counters || { preferential: 0, normal: 0 }
      } catch (error) {
        const handledError = handleGenericError(error, 'carregar dados da fila')
        logError(handledError, 'QueueStore.loadFromStorage')
        
        // Reset to default state on error
        this.passwords = []
        this.currentPassword = null
        this.counters = { preferential: 0, normal: 0 }
      }
    }
  }
})