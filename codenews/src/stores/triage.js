import { defineStore } from 'pinia'

export const useTriageStore = defineStore('triage', {
  state: () => ({
    triages: [],
    currentTriage: null
  }),

  getters: {
    getTriageByPatientId: (state) => (patientId) => {
      return state.triages.find(triage => triage.patientId === patientId)
    },

    getTriagesByRisk: (state) => (riskLevel) => {
      return state.triages.filter(triage => triage.riskClassification === riskLevel)
    },

    completedTriages: (state) => {
      return state.triages.filter(triage => triage.completed)
    }
  },

  actions: {
    createTriage(triageData) {
      // Create triage object with required fields
      const triage = {
        id: `triage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        patientId: triageData.patientId,
        vitalSigns: {
          bloodPressure: triageData.vitalSigns?.bloodPressure || '',
          heartRate: triageData.vitalSigns?.heartRate || null,
          temperature: triageData.vitalSigns?.temperature || null,
          weight: triageData.vitalSigns?.weight || null
        },
        riskClassification: triageData.riskClassification || 'low',
        notes: triageData.notes || '',
        completed: false,
        createdAt: new Date().toISOString()
      }

      // Add to triages array
      this.triages.push(triage)

      // Save to localStorage
      this.saveToStorage()

      return triage
    },

    updateTriage(triageId, updateData) {
      const triageIndex = this.triages.findIndex(t => t.id === triageId)
      
      if (triageIndex !== -1) {
        // Update triage data
        this.triages[triageIndex] = {
          ...this.triages[triageIndex],
          ...updateData
        }

        // Save to localStorage
        this.saveToStorage()

        return this.triages[triageIndex]
      }

      return null
    },

    completeTriage(triageId) {
      return this.updateTriage(triageId, { 
        completed: true,
        completedAt: new Date().toISOString()
      })
    },

    getTriageById(triageId) {
      return this.triages.find(t => t.id === triageId)
    },

    setCurrentTriage(triage) {
      this.currentTriage = triage
    },

    clearCurrentTriage() {
      this.currentTriage = null
    },

    // Register vital signs for a patient
    registerVitalSigns(patientId, vitalSigns) {
      // Check if triage already exists for this patient
      let existingTriage = this.getTriageByPatientId(patientId)
      
      if (existingTriage) {
        // Update existing triage
        return this.updateTriage(existingTriage.id, {
          vitalSigns: {
            ...existingTriage.vitalSigns,
            ...vitalSigns
          }
        })
      } else {
        // Create new triage
        return this.createTriage({
          patientId,
          vitalSigns
        })
      }
    },

    // Classify risk based on vital signs and CID
    classifyRisk(vitalSigns, cidRisk = 'low') {
      let riskLevel = cidRisk // Start with CID-based risk

      // Check vital signs for risk escalation
      if (vitalSigns.heartRate) {
        if (vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50) {
          riskLevel = this.escalateRisk(riskLevel, 'high')
        } else if (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60) {
          riskLevel = this.escalateRisk(riskLevel, 'medium')
        }
      }

      if (vitalSigns.temperature) {
        if (vitalSigns.temperature > 39 || vitalSigns.temperature < 35) {
          riskLevel = this.escalateRisk(riskLevel, 'high')
        } else if (vitalSigns.temperature > 38 || vitalSigns.temperature < 36) {
          riskLevel = this.escalateRisk(riskLevel, 'medium')
        }
      }

      // Blood pressure analysis (systolic/diastolic)
      if (vitalSigns.bloodPressure) {
        const bpMatch = vitalSigns.bloodPressure.match(/(\d+)\/(\d+)/)
        if (bpMatch) {
          const systolic = parseInt(bpMatch[1])
          const diastolic = parseInt(bpMatch[2])
          
          if (systolic > 180 || systolic < 90 || diastolic > 110 || diastolic < 60) {
            riskLevel = this.escalateRisk(riskLevel, 'high')
          } else if (systolic > 140 || systolic < 100 || diastolic > 90 || diastolic < 70) {
            riskLevel = this.escalateRisk(riskLevel, 'medium')
          }
        }
      }

      return riskLevel
    },

    // Helper function to escalate risk level
    escalateRisk(currentRisk, newRisk) {
      const riskLevels = ['low', 'medium', 'high', 'emergency']
      const currentIndex = riskLevels.indexOf(currentRisk)
      const newIndex = riskLevels.indexOf(newRisk)
      
      return newIndex > currentIndex ? newRisk : currentRisk
    },

    saveToStorage() {
      try {
        localStorage.setItem('codenews_triages', JSON.stringify({
          triages: this.triages,
          currentTriage: this.currentTriage
        }))
      } catch (error) {
        console.error('Error saving triages to localStorage:', error)
      }
    },

    loadFromStorage() {
      try {
        const stored = localStorage.getItem('codenews_triages')
        if (stored) {
          const data = JSON.parse(stored)
          this.triages = data.triages || []
          this.currentTriage = data.currentTriage || null
        }
      } catch (error) {
        console.error('Error loading triages from localStorage:', error)
        // Reset to default state on error
        this.triages = []
        this.currentTriage = null
      }
    }
  }
})