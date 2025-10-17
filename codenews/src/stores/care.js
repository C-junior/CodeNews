import { defineStore } from 'pinia'

export const useCareStore = defineStore('care', {
  state: () => ({
    appointments: [],
    currentAppointment: null
  }),

  getters: {
    getAppointmentByPatientId: (state) => (patientId) => {
      return state.appointments.find(appointment => appointment.patientId === patientId)
    },

    getAppointmentsByOutcome: (state) => (outcome) => {
      return state.appointments.filter(appointment => appointment.outcome === outcome)
    },

    completedAppointments: (state) => {
      return state.appointments.filter(appointment => appointment.completedAt)
    },

    activeAppointments: (state) => {
      return state.appointments.filter(appointment => !appointment.completedAt)
    }
  },

  actions: {
    createAppointment(appointmentData) {
      // Create appointment object with required fields
      const appointment = {
        id: `appointment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        patientId: appointmentData.patientId,
        diagnosis: appointmentData.diagnosis || '',
        outcome: appointmentData.outcome || '', // 'discharge', 'referral', 'hospitalization'
        notes: appointmentData.notes || '',
        createdAt: new Date().toISOString(),
        completedAt: null
      }

      // Add to appointments array
      this.appointments.push(appointment)

      // Save to localStorage
      this.saveToStorage()

      return appointment
    },

    updateAppointment(appointmentId, updateData) {
      const appointmentIndex = this.appointments.findIndex(a => a.id === appointmentId)
      
      if (appointmentIndex !== -1) {
        // Update appointment data
        this.appointments[appointmentIndex] = {
          ...this.appointments[appointmentIndex],
          ...updateData
        }

        // Save to localStorage
        this.saveToStorage()

        return this.appointments[appointmentIndex]
      }

      return null
    },

    completeAppointment(appointmentId, completionData) {
      const completionUpdate = {
        ...completionData,
        completedAt: new Date().toISOString()
      }

      return this.updateAppointment(appointmentId, completionUpdate)
    },

    getAppointmentById(appointmentId) {
      return this.appointments.find(a => a.id === appointmentId)
    },

    setCurrentAppointment(appointment) {
      this.currentAppointment = appointment
    },

    clearCurrentAppointment() {
      this.currentAppointment = null
    },

    // Register diagnosis and outcome for a patient
    registerCare(patientId, careData) {
      // Check if appointment already exists for this patient
      let existingAppointment = this.getAppointmentByPatientId(patientId)
      
      if (existingAppointment && !existingAppointment.completedAt) {
        // Update existing active appointment
        return this.updateAppointment(existingAppointment.id, careData)
      } else {
        // Create new appointment
        return this.createAppointment({
          patientId,
          ...careData
        })
      }
    },

    // Finalize appointment with diagnosis and outcome
    finalizeAppointment(patientId, finalData) {
      const appointment = this.getAppointmentByPatientId(patientId)
      
      if (appointment && !appointment.completedAt) {
        return this.completeAppointment(appointment.id, finalData)
      }

      return null
    },

    saveToStorage() {
      try {
        localStorage.setItem('codenews_appointments', JSON.stringify({
          appointments: this.appointments,
          currentAppointment: this.currentAppointment
        }))
      } catch (error) {
        console.error('Error saving appointments to localStorage:', error)
      }
    },

    loadFromStorage() {
      try {
        const stored = localStorage.getItem('codenews_appointments')
        if (stored) {
          const data = JSON.parse(stored)
          this.appointments = data.appointments || []
          this.currentAppointment = data.currentAppointment || null
        }
      } catch (error) {
        console.error('Error loading appointments from localStorage:', error)
        // Reset to default state on error
        this.appointments = []
        this.currentAppointment = null
      }
    }
  }
})