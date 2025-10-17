import { defineStore } from 'pinia'
import { useQueueStore } from './queue'
import { usePatientStore } from './patient'
import { useTriageStore } from './triage'
import { useCareStore } from './care'

export const useSystemStore = defineStore('system', {
  state: () => ({
    isInitialized: false,
    syncInterval: null
  }),

  actions: {
    // Initialize system and start synchronization
    initialize() {
      if (this.isInitialized) return

      console.log('🚀 Inicializando sistema...')

      try {
        // Load all stores from storage
        const queueStore = useQueueStore()
        const patientStore = usePatientStore()
        const triageStore = useTriageStore()
        const careStore = useCareStore()

        console.log('📦 Carregando stores...')
        queueStore.loadFromStorage()
        patientStore.loadFromStorage()
        triageStore.loadFromStorage()
        careStore.loadFromStorage()

        console.log('✅ Stores carregados')

        // Start periodic synchronization
        this.startSync()
        
        this.isInitialized = true
        console.log('✅ Sistema inicializado com sucesso')
      } catch (error) {
        console.error('❌ Erro na inicialização do sistema:', error)
        throw error
      }
    },

    // Start periodic synchronization between modules
    startSync() {
      if (this.syncInterval) return

      // Sync every 2 seconds to keep all modules updated
      this.syncInterval = setInterval(() => {
        this.syncSystemState()
      }, 2000)
    },

    // Stop synchronization
    stopSync() {
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
        this.syncInterval = null
      }
    },

    // Synchronize state across all modules
    syncSystemState() {
      const queueStore = useQueueStore()
      const patientStore = usePatientStore()
      const triageStore = useTriageStore()
      const careStore = useCareStore()

      // Reload data from storage to catch updates from other modules
      queueStore.loadFromStorage()
      patientStore.loadFromStorage()
      triageStore.loadFromStorage()
      careStore.loadFromStorage()

      // Process automatic status transitions
      this.processStatusTransitions()
    },

    // Process automatic status transitions based on system flow
    processStatusTransitions() {
      const queueStore = useQueueStore()
      const patientStore = usePatientStore()
      const triageStore = useTriageStore()
      const careStore = useCareStore()

      // 1. Sync patients called in queue to reception status
      const calledPasswords = queueStore.passwords.filter(p => p.status === 'called' && p.patientId)
      calledPasswords.forEach(password => {
        const patient = patientStore.getPatientById(password.patientId)
        if (patient && patient.status === 'waiting') {
          patientStore.updatePatientStatus(patient.id, 'reception')
        }
      })

      // 2. Move patients from reception to triage when they have completed registration
      const receptionPatients = patientStore.receptionPatients
      receptionPatients.forEach(patient => {
        // Check if patient has been processed in reception (has basic data and password was called)
        if (patient.name && patient.cid) {
          const password = queueStore.passwords.find(p => p.patientId === patient.id)
          if (password && password.status === 'called') {
            // Move to triage queue - this should be done manually by reception staff
            // We don't auto-transition here to maintain control
          }
        }
      })

      // 3. Move patients from triage to care when triage is completed
      const triagePatients = patientStore.triagePatients
      triagePatients.forEach(patient => {
        const triage = triageStore.getTriageByPatientId(patient.id)
        if (triage && triage.completed) {
          // Auto-transition to care when triage is completed
          patientStore.updatePatientStatus(patient.id, 'care')
        }
      })

      // 4. Complete patients when care is finished
      const carePatients = patientStore.carePatients
      carePatients.forEach(patient => {
        const appointment = careStore.getAppointmentByPatientId(patient.id)
        if (appointment && appointment.completedAt) {
          // Mark patient as completed
          patientStore.updatePatientStatus(patient.id, 'completed')
          
          // Also mark their password as completed
          const password = queueStore.passwords.find(p => p.patientId === patient.id)
          if (password && password.status !== 'completed') {
            queueStore.updatePasswordStatus(password.id, 'completed')
          }
        }
      })

      // 5. Update queue panel with current status
      this.updateQueuePanel()
    },

    // Update queue panel to reflect current system state
    updateQueuePanel() {
      const queueStore = useQueueStore()
      const patientStore = usePatientStore()

      // Ensure queue reflects current patient statuses
      queueStore.passwords.forEach(password => {
        if (password.patientId) {
          const patient = patientStore.getPatientById(password.patientId)
          if (patient && patient.status === 'completed' && password.status !== 'completed') {
            queueStore.updatePasswordStatus(password.id, 'completed')
          }
        }
      })
    },

    // Handle patient flow from password generation to completion
    processPatientFlow(patientId, _fromStatus, toStatus) {
      const patientStore = usePatientStore()
      const triageStore = useTriageStore()
      const careStore = useCareStore()
      const queueStore = useQueueStore()

      console.log(`Processing patient flow: ${patientId} from ${_fromStatus} to ${toStatus}`)

      // Update patient status
      patientStore.updatePatientStatus(patientId, toStatus)

      // Handle specific transitions
      switch (toStatus) {
        case 'reception':
          // Patient has been called from queue
          const password = queueStore.passwords.find(p => p.patientId === patientId)
          if (password && password.status !== 'called') {
            queueStore.updatePasswordStatus(password.id, 'called')
          }
          break

        case 'triage':
          // Initialize triage record if it doesn't exist
          if (!triageStore.getTriageByPatientId(patientId)) {
            const patient = patientStore.getPatientById(patientId)
            const cidRisk = patientStore.classifyRiskByCid(patient?.cid)
            
            triageStore.createTriage({
              patientId,
              riskClassification: cidRisk,
              vitalSigns: {
                bloodPressure: '',
                heartRate: null,
                temperature: null,
                weight: null
              },
              notes: '',
              completed: false
            })
          }
          break

        case 'care':
          // Ensure triage is completed before moving to care
          const triage = triageStore.getTriageByPatientId(patientId)
          if (triage && !triage.completed) {
            triageStore.completeTriage(triage.id)
          }

          // Initialize care record if it doesn't exist
          if (!careStore.getAppointmentByPatientId(patientId)) {
            careStore.createAppointment({
              patientId,
              diagnosis: '',
              outcome: '',
              notes: ''
            })
          }
          break

        case 'completed':
          // Ensure all records are properly completed
          const patientTriage = triageStore.getTriageByPatientId(patientId)
          if (patientTriage && !patientTriage.completed) {
            triageStore.completeTriage(patientTriage.id)
          }

          const appointment = careStore.getAppointmentByPatientId(patientId)
          if (appointment && !appointment.completedAt) {
            careStore.completeAppointment(appointment.id, {
              diagnosis: appointment.diagnosis || 'Atendimento concluído',
              outcome: appointment.outcome || 'discharge'
            })
          }

          // Mark password as completed
          const patientPassword = queueStore.passwords.find(p => p.patientId === patientId)
          if (patientPassword && patientPassword.status !== 'completed') {
            queueStore.updatePasswordStatus(patientPassword.id, 'completed')
          }
          break
      }

      // Trigger synchronization
      this.syncSystemState()
    },

    // Get system statistics
    getSystemStats() {
      const queueStore = useQueueStore()
      const patientStore = usePatientStore()
      const triageStore = useTriageStore()
      const careStore = useCareStore()

      return {
        queue: {
          waiting: queueStore.waitingQueue.length,
          current: queueStore.currentPassword?.number || 'Nenhuma',
          total: queueStore.passwords.length
        },
        patients: {
          waiting: patientStore.waitingPatients.length,
          reception: patientStore.receptionPatients.length,
          triage: patientStore.triagePatients.length,
          care: patientStore.carePatients.length,
          completed: patientStore.completedPatients.length,
          total: patientStore.patients.length
        },
        triage: {
          pending: triageStore.triages.filter(t => !t.completed).length,
          completed: triageStore.completedTriages.length,
          emergency: triageStore.getTriagesByRisk('emergency').length,
          high: triageStore.getTriagesByRisk('high').length
        },
        care: {
          active: careStore.activeAppointments.length,
          completed: careStore.completedAppointments.length,
          discharge: careStore.getAppointmentsByOutcome('discharge').length,
          referral: careStore.getAppointmentsByOutcome('referral').length,
          hospitalization: careStore.getAppointmentsByOutcome('hospitalization').length
        }
      }
    },

    // Reset entire system (for testing/demo purposes)
    resetSystem() {
      const queueStore = useQueueStore()
      const patientStore = usePatientStore()
      const triageStore = useTriageStore()
      const careStore = useCareStore()

      // Reset all stores
      queueStore.resetQueue()
      patientStore.patients = []
      patientStore.currentPatient = null
      triageStore.triages = []
      triageStore.currentTriage = null
      careStore.appointments = []
      careStore.currentAppointment = null

      // Save empty state
      queueStore.saveToStorage()
      patientStore.saveToStorage()
      triageStore.saveToStorage()
      careStore.saveToStorage()

      // Restart sync
      this.syncSystemState()
    },

    // Manual transition methods for module interactions
    transitionPatientToTriage(patientId) {
      this.processPatientFlow(patientId, 'reception', 'triage')
    },

    transitionPatientToCare(patientId) {
      this.processPatientFlow(patientId, 'triage', 'care')
    },

    completePatientFlow(patientId) {
      this.processPatientFlow(patientId, 'care', 'completed')
    },

    // Get patient flow status for UI display
    getPatientFlowStatus(patientId) {
      const patientStore = usePatientStore()
      const triageStore = useTriageStore()
      const careStore = useCareStore()
      const queueStore = useQueueStore()

      const patient = patientStore.getPatientById(patientId)
      if (!patient) return null

      const password = queueStore.passwords.find(p => p.patientId === patientId)
      const triage = triageStore.getTriageByPatientId(patientId)
      const appointment = careStore.getAppointmentByPatientId(patientId)

      return {
        patient,
        password,
        triage,
        appointment,
        currentStatus: patient.status,
        canTransition: this.canTransitionPatient(patient, triage, appointment)
      }
    },

    // Check if patient can transition to next status
    canTransitionPatient(patient, triage, appointment) {
      switch (patient.status) {
        case 'waiting':
          return false // Must be called first
        case 'reception':
          return patient.name && patient.cid // Has basic registration
        case 'triage':
          return triage && triage.completed // Triage is completed
        case 'care':
          return appointment && appointment.completedAt // Care is completed
        case 'completed':
          return false // Already completed
        default:
          return false
      }
    },

    // Cleanup when store is destroyed
    cleanup() {
      this.stopSync()
      this.isInitialized = false
    }
  }
})