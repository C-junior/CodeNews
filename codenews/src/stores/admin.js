import { defineStore } from 'pinia'
import { usePatientStore } from './patient.js'
import { useCareStore } from './care.js'
import { useQueueStore } from './queue.js'
import { useTriageStore } from './triage.js'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    metrics: {
      patientsWaiting: 0,
      patientsInReception: 0,
      patientsInTriage: 0,
      patientsInCare: 0,
      totalCompleted: 0,
      totalAppointments: 0
    }
  }),

  getters: {
    activeUsers: (state) => {
      return state.users.filter(user => user.active)
    },

    getUsersByRole: (state) => (role) => {
      return state.users.filter(user => user.role === role)
    },

    getUserById: (state) => (userId) => {
      return state.users.find(user => user.id === userId)
    },

    // Real-time metrics calculations
    currentMetrics: (state) => {
      const patientStore = usePatientStore()
      const careStore = useCareStore()
      const queueStore = useQueueStore()

      return {
        patientsWaiting: patientStore.waitingPatients.length,
        patientsInReception: patientStore.receptionPatients.length,
        patientsInTriage: patientStore.triagePatients.length,
        patientsInCare: patientStore.carePatients.length,
        totalCompleted: patientStore.completedPatients.length,
        totalAppointments: careStore.completedAppointments.length,
        totalInQueue: queueStore.queue.length,
        totalPasswordsGenerated: queueStore.passwords.length
      }
    }
  },

  actions: {
    // User CRUD operations
    createUser(userData) {
      // Validate required fields
      if (!userData.username || !userData.password || !userData.role || !userData.name) {
        throw new Error('Todos os campos são obrigatórios')
      }

      // Check if username already exists
      if (this.users.find(user => user.username === userData.username)) {
        throw new Error('Nome de usuário já existe')
      }

      // Create user object
      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        username: userData.username,
        password: userData.password, // In a real app, this should be hashed
        role: userData.role, // 'reception', 'triage', 'care', 'admin'
        name: userData.name,
        active: userData.active !== undefined ? userData.active : true,
        createdAt: new Date().toISOString()
      }

      // Add to users array
      this.users.push(user)

      // Save to localStorage
      this.saveUsersToStorage()

      return user
    },

    updateUser(userId, updateData) {
      const userIndex = this.users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado')
      }

      // If updating username, check for duplicates
      if (updateData.username && updateData.username !== this.users[userIndex].username) {
        if (this.users.find(user => user.username === updateData.username && user.id !== userId)) {
          throw new Error('Nome de usuário já existe')
        }
      }

      // Update user data
      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      }

      // Save to localStorage
      this.saveUsersToStorage()

      return this.users[userIndex]
    },

    deleteUser(userId) {
      const userIndex = this.users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado')
      }

      // Remove user from array
      const deletedUser = this.users.splice(userIndex, 1)[0]

      // Save to localStorage
      this.saveUsersToStorage()

      return deletedUser
    },

    toggleUserStatus(userId) {
      const user = this.getUserById(userId)
      
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      return this.updateUser(userId, { active: !user.active })
    },

    // Metrics calculation
    calculateMetrics() {
      const patientStore = usePatientStore()
      const careStore = useCareStore()
      const queueStore = useQueueStore()

      this.metrics = {
        patientsWaiting: patientStore.waitingPatients.length,
        patientsInReception: patientStore.receptionPatients.length,
        patientsInTriage: patientStore.triagePatients.length,
        patientsInCare: patientStore.carePatients.length,
        totalCompleted: patientStore.completedPatients.length,
        totalAppointments: careStore.completedAppointments.length,
        totalInQueue: queueStore.queue.length,
        totalPasswordsGenerated: queueStore.passwords.length
      }

      return this.metrics
    },

    // Get detailed metrics for dashboard
    getDetailedMetrics() {
      const patientStore = usePatientStore()
      const careStore = useCareStore()
      const triageStore = useTriageStore()
      const queueStore = useQueueStore()

      // Calculate metrics by priority
      const priorityMetrics = {
        normal: patientStore.patients.filter(p => p.priority === 'normal').length,
        preferential: patientStore.patients.filter(p => p.priority === 'preferential').length
      }

      // Calculate metrics by risk classification
      const riskMetrics = {
        emergency: triageStore.triages.filter(t => t.riskClassification === 'emergency').length,
        high: triageStore.triages.filter(t => t.riskClassification === 'high').length,
        medium: triageStore.triages.filter(t => t.riskClassification === 'medium').length,
        low: triageStore.triages.filter(t => t.riskClassification === 'low').length
      }

      // Calculate outcome metrics
      const outcomeMetrics = {
        discharge: careStore.appointments.filter(a => a.outcome === 'discharge').length,
        referral: careStore.appointments.filter(a => a.outcome === 'referral').length,
        hospitalization: careStore.appointments.filter(a => a.outcome === 'hospitalization').length
      }

      return {
        basic: this.calculateMetrics(),
        priority: priorityMetrics,
        risk: riskMetrics,
        outcomes: outcomeMetrics,
        users: {
          total: this.users.length,
          active: this.activeUsers.length,
          byRole: {
            admin: this.getUsersByRole('admin').length,
            reception: this.getUsersByRole('reception').length,
            triage: this.getUsersByRole('triage').length,
            care: this.getUsersByRole('care').length
          }
        }
      }
    },

    // Storage operations
    saveUsersToStorage() {
      try {
        localStorage.setItem('users', JSON.stringify(this.users))
      } catch (error) {
        console.error('Error saving users to localStorage:', error)
      }
    },

    loadUsersFromStorage() {
      try {
        const storedUsers = localStorage.getItem('users')
        
        if (storedUsers) {
          this.users = JSON.parse(storedUsers)
        } else {
          // Initialize with default users if none exist
          this.initializeDefaultUsers()
        }
      } catch (error) {
        console.error('Error loading users from localStorage:', error)
        // Initialize with default users on error
        this.initializeDefaultUsers()
      }
    },

    initializeDefaultUsers() {
      // Default users for initial setup
      const defaultUsers = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          name: 'Administrador',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          username: 'acolhimento',
          password: 'acol123',
          role: 'reception',
          name: 'Profissional de Acolhimento',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          username: 'triagem',
          password: 'tri123',
          role: 'triage',
          name: 'Profissional de Triagem',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          username: 'medico',
          password: 'med123',
          role: 'care',
          name: 'Médico',
          active: true,
          createdAt: new Date().toISOString()
        }
      ]
      
      this.users = defaultUsers
      this.saveUsersToStorage()
    },

    // Initialize store
    initialize() {
      this.loadUsersFromStorage()
      this.calculateMetrics()
    }
  }
})