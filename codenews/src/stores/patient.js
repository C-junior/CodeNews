import { defineStore } from 'pinia'
import { handleGenericError, logError, safeStorage, handleNotFoundError } from '../utils/errorHandler.js'
import { validatePatientName, validateCid } from '../utils/validation.js'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patients: [],
    currentPatient: null
  }),

  getters: {
    getPatientsByStatus: (state) => (status) => {
      return state.patients.filter(patient => patient.status === status)
    },

    waitingPatients: (state) => {
      return state.patients.filter(patient => patient.status === 'waiting')
    },

    receptionPatients: (state) => {
      return state.patients.filter(patient => patient.status === 'reception')
    },

    triagePatients: (state) => {
      return state.patients.filter(patient => patient.status === 'triage')
    },

    carePatients: (state) => {
      return state.patients.filter(patient => patient.status === 'care')
    },

    completedPatients: (state) => {
      return state.patients.filter(patient => patient.status === 'completed')
    }
  },

  actions: {
    registerPatient(patientData) {
      try {
        // Validate input data
        const nameError = validatePatientName(patientData.name)
        if (nameError) {
          throw new Error(nameError)
        }

        // CPF validation
        if (!patientData.cpf || patientData.cpf.length !== 11) {
          throw new Error('CPF é obrigatório e deve ter 11 dígitos')
        }

        const cidError = validateCid(patientData.cid)
        if (cidError) {
          throw new Error(cidError)
        }

        // Create patient object with required fields
        const patient = {
          id: `patient_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: patientData.name.trim(),
          cpf: patientData.cpf, // Store only numbers
          cid: patientData.cid ? patientData.cid.trim().toUpperCase() : '', // Will be set in triage
          priority: patientData.priority || 'normal', // Priority will be set based on password called
          registeredAt: new Date().toISOString(),
          status: 'waiting' // 'waiting', 'reception', 'triage', 'care', 'completed'
        }

        // Add to patients array
        this.patients.push(patient)

        // Save to localStorage
        this.saveToStorage()

        return patient
      } catch (error) {
        const handledError = handleGenericError(error, 'cadastrar paciente')
        logError(handledError, 'PatientStore.registerPatient')
        throw handledError
      }
    },

    updatePatient(patientId, updateData) {
      try {
        if (!patientId) {
          throw new Error('ID do paciente é obrigatório')
        }

        const patientIndex = this.patients.findIndex(p => p.id === patientId)
        
        if (patientIndex !== -1) {
          // Validate update data if name or CID are being updated
          if (updateData.name) {
            const nameError = validatePatientName(updateData.name)
            if (nameError) {
              throw new Error(nameError)
            }
            updateData.name = updateData.name.trim()
          }

          if (updateData.cid !== undefined) {
            const cidError = validateCid(updateData.cid)
            if (cidError) {
              throw new Error(cidError)
            }
            updateData.cid = updateData.cid ? updateData.cid.trim().toUpperCase() : ''
          }

          // Update patient data
          this.patients[patientIndex] = {
            ...this.patients[patientIndex],
            ...updateData
          }

          // Save to localStorage
          this.saveToStorage()

          return this.patients[patientIndex]
        }

        throw handleNotFoundError('Paciente', patientId)
      } catch (error) {
        const handledError = handleGenericError(error, 'atualizar paciente')
        logError(handledError, 'PatientStore.updatePatient')
        throw handledError
      }
    },

    updatePatientStatus(patientId, newStatus) {
      return this.updatePatient(patientId, { status: newStatus })
    },

    deletePatient(patientId) {
      try {
        if (!patientId) {
          throw new Error('ID do paciente é obrigatório')
        }

        const patientIndex = this.patients.findIndex(p => p.id === patientId)
        
        if (patientIndex !== -1) {
          const deletedPatient = this.patients[patientIndex]
          
          // Remove patient from array
          this.patients.splice(patientIndex, 1)
          
          // Save to localStorage
          this.saveToStorage()
          
          return deletedPatient
        }

        throw handleNotFoundError('Paciente', patientId)
      } catch (error) {
        const handledError = handleGenericError(error, 'excluir paciente')
        logError(handledError, 'PatientStore.deletePatient')
        throw handledError
      }
    },

    getPatientById(patientId) {
      try {
        if (!patientId) {
          return null
        }
        
        const patient = this.patients.find(p => p.id === patientId)
        return patient || null
      } catch (error) {
        logError(handleGenericError(error, 'buscar paciente'), 'PatientStore.getPatientById')
        return null
      }
    },

    setCurrentPatient(patient) {
      this.currentPatient = patient
    },

    clearCurrentPatient() {
      this.currentPatient = null
    },

    // Classification of risk based on CID codes
    classifyRiskByCid(cid) {
      if (!cid) return 'low'

      // Emergency CIDs (Red - Critical)
      const emergencyCids = [
        'I21', // Acute myocardial infarction
        'I46', // Cardiac arrest
        'R06.0', // Dyspnea
        'R57', // Shock
        'T78.2' // Anaphylactic shock
      ]

      // High priority CIDs (Orange)
      const highPriorityCids = [
        'I20', // Angina pectoris
        'J44.1', // Acute exacerbation of COPD
        'N17', // Acute kidney failure
        'K92.2' // Gastrointestinal hemorrhage
      ]

      // Medium priority CIDs (Yellow)
      const mediumPriorityCids = [
        'J06.9', // Acute upper respiratory infection
        'K59.0', // Constipation
        'M79.3', // Panniculitis
        'R50' // Fever
      ]

      // Check CID classification
      if (emergencyCids.includes(cid)) return 'emergency'
      if (highPriorityCids.includes(cid)) return 'high'
      if (mediumPriorityCids.includes(cid)) return 'medium'
      
      return 'low' // Default for unmapped CIDs
    },

    saveToStorage() {
      try {
        safeStorage.setItem('codenews_patients', {
          patients: this.patients,
          currentPatient: this.currentPatient
        })
      } catch (error) {
        const handledError = handleGenericError(error, 'salvar dados de pacientes')
        logError(handledError, 'PatientStore.saveToStorage')
        throw handledError
      }
    },

    loadFromStorage() {
      try {
        const data = safeStorage.getItem('codenews_patients', {
          patients: [],
          currentPatient: null
        })
        
        // Validate loaded data structure
        if (Array.isArray(data.patients)) {
          this.patients = data.patients.filter(patient => 
            patient && 
            patient.id && 
            patient.name && 
            typeof patient.status === 'string'
          ).map(patient => {
            // Ensure CPF field exists for existing patients (even if empty)
            if (!patient.hasOwnProperty('cpf')) {
              patient.cpf = ''
            }
            return patient
          })
        } else {
          this.patients = []
        }
        
        this.currentPatient = data.currentPatient || null
      } catch (error) {
        const handledError = handleGenericError(error, 'carregar dados de pacientes')
        logError(handledError, 'PatientStore.loadFromStorage')
        
        // Reset to default state on error
        this.patients = []
        this.currentPatient = null
      }
    }
  }
})