import { defineStore } from 'pinia'

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
      // Increment counter for the priority type
      this.counters[priority]++
      
      // Generate password number based on priority
      const prefix = priority === 'preferential' ? 'P' : 'N'
      const number = `${prefix}${this.counters[priority].toString().padStart(3, '0')}`
      
      // Create password object
      const password = {
        id: `pwd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    },

    callNext() {
      const nextPassword = this.nextInQueue
      if (!nextPassword) return null
      
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
    },

    updatePasswordStatus(passwordId, status) {
      const password = this.passwords.find(p => p.id === passwordId)
      if (password) {
        password.status = status
        if (status === 'called') {
          password.calledAt = new Date().toISOString()
          this.currentPassword = password
        }
        this.saveToStorage()
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
        localStorage.setItem('codenews_queue', JSON.stringify({
          passwords: this.passwords,
          currentPassword: this.currentPassword,
          counters: this.counters
        }))
      } catch (error) {
        console.error('Error saving queue to localStorage:', error)
      }
    },

    loadFromStorage() {
      try {
        const stored = localStorage.getItem('codenews_queue')
        if (stored) {
          const data = JSON.parse(stored)
          this.passwords = data.passwords || []
          this.currentPassword = data.currentPassword || null
          this.counters = data.counters || { preferential: 0, normal: 0 }
        }
      } catch (error) {
        console.error('Error loading queue from localStorage:', error)
        // Reset to default state on error
        this.passwords = []
        this.currentPassword = null
        this.counters = { preferential: 0, normal: 0 }
      }
    }
  }
})