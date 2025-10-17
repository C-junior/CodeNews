<template>
  <div>
    <h1 class="text-2xl lg:text-3xl font-bold text-codenews-blue mb-6 lg:mb-8">
      Módulo de Acolhimento
    </h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <!-- Queue Management Section -->
        <div class="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 space-y-3 sm:space-y-0">
            <h2 class="text-xl lg:text-2xl font-semibold text-gray-800">
              Fila de Espera
            </h2>
            <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div class="text-sm text-gray-600 text-center sm:text-left">
                Total na fila: <span class="font-semibold">{{ waitingQueue.length }}</span>
              </div>
              <button
                @click="callNext"
                :disabled="!nextInQueue || isCalling"
                :class="[
                  'px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold transition-all duration-200 touch-manipulation',
                  nextInQueue && !isCalling
                    ? 'bg-codenews-blue text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                <span v-if="isCalling" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chamando...
                </span>
                <span v-else>Chamar Próximo</span>
              </button>
            </div>
          </div>

          <!-- Current Password Display -->
          <div v-if="currentPassword" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="text-center">
              <div class="text-sm text-blue-600 font-medium mb-1">SENHA ATUAL</div>
              <div class="text-3xl font-bold text-codenews-blue mb-2">
                {{ currentPassword.number }}
              </div>
              <div class="text-sm text-blue-700">
                Prioridade: {{ currentPassword.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
              </div>
              <div class="text-xs text-blue-600 mt-1">
                Chamada às {{ formatTime(currentPassword.calledAt) }}
              </div>
              
              <!-- Patient Action for Current Password -->
              <div v-if="currentPassword.patientId" class="mt-4 pt-3 border-t border-blue-200">
                <div class="text-sm text-blue-700 mb-2">
                  Paciente: {{ getCurrentPatientName() }}
                </div>
                <button
                  @click="sendToTriage(currentPassword.patientId)"
                  :disabled="!canSendCurrentToTriage()"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    canSendCurrentToTriage()
                      ? 'bg-codenews-green text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  ]"
                >
                  Enviar para Triagem
                </button>
              </div>
            </div>
          </div>

          <!-- Queue List -->
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div v-if="waitingQueue.length === 0" class="text-center py-8 text-gray-500">
              <div class="text-4xl mb-2">📋</div>
              <div>Nenhuma senha na fila</div>
            </div>
            
            <div
              v-for="(password, index) in waitingQueue"
              :key="password.id"
              :class="[
                'flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200',
                password.priority === 'preferential'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50',
                index === 0 ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
              ]"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    password.priority === 'preferential'
                      ? 'bg-codenews-green text-white'
                      : 'bg-gray-400 text-white'
                  ]">
                    {{ index + 1 }}
                  </div>
                </div>
                
                <div>
                  <div class="text-xl font-bold text-gray-800">
                    {{ password.number }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ password.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
                  </div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-sm text-gray-500">
                  {{ formatTime(password.createdAt) }}
                </div>
                <div v-if="index === 0" class="text-xs text-blue-600 font-medium mt-1">
                  PRÓXIMO
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Patient Registration Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">
            Cadastro Rápido de Paciente
          </h2>
          
          <div class="text-sm text-gray-600 mb-4">
            Use este formulário para cadastrar pacientes que não possuem registro no sistema.
          </div>

          <!-- Patient Registration Form -->
          <form @submit.prevent="registerPatient" class="space-y-4">
            <!-- Patient Name -->
            <div>
              <label for="patientName" class="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                id="patientName"
                v-model="patientForm.name"
                type="text"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                  patientForm.errors.name 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                ]"
                placeholder="Digite o nome completo do paciente"
              />
              <div v-if="patientForm.errors.name" class="text-red-600 text-sm mt-1">
                {{ patientForm.errors.name }}
              </div>
            </div>

            <!-- CID Code -->
            <div>
              <label for="patientCid" class="block text-sm font-medium text-gray-700 mb-2">
                Código CID (opcional)
              </label>
              <input
                id="patientCid"
                v-model="patientForm.cid"
                type="text"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                  patientForm.errors.cid 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                ]"
                placeholder="Ex: J06.9, I21, R50"
                @input="onCidChange"
              />
              <div v-if="patientForm.errors.cid" class="text-red-600 text-sm mt-1">
                {{ patientForm.errors.cid }}
              </div>
              
              <!-- Risk Classification Display -->
              <div v-if="patientForm.cid && riskClassification" class="mt-2">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">Classificação de Risco:</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getRiskClassColor(riskClassification)
                  ]">
                    {{ getRiskClassLabel(riskClassification) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Priority Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Prioridade *
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="patientForm.priority = 'normal'"
                  :class="[
                    'p-3 rounded-lg border-2 transition-all duration-200 text-center',
                    patientForm.priority === 'normal' 
                      ? 'border-codenews-blue bg-blue-50 text-codenews-blue' 
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  ]"
                >
                  <div class="text-lg mb-1">👤</div>
                  <div class="font-medium text-sm">Normal</div>
                </button>
                
                <button
                  type="button"
                  @click="patientForm.priority = 'preferential'"
                  :class="[
                    'p-3 rounded-lg border-2 transition-all duration-200 text-center',
                    patientForm.priority === 'preferential' 
                      ? 'border-codenews-green bg-green-50 text-codenews-green' 
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  ]"
                >
                  <div class="text-lg mb-1">⭐</div>
                  <div class="font-medium text-sm">Preferencial</div>
                </button>
              </div>
              <div v-if="patientForm.errors.priority" class="text-red-600 text-sm mt-1">
                {{ patientForm.errors.priority }}
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-4">
              <button
                type="submit"
                :disabled="isRegistering || !isFormValid"
                :class="[
                  'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200',
                  isFormValid && !isRegistering
                    ? 'bg-codenews-green text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                <span v-if="isRegistering">Cadastrando...</span>
                <span v-else>Cadastrar Paciente</span>
              </button>
            </div>
          </form>

          <!-- Success Message -->
          <div v-if="registrationSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <div class="text-green-600 mr-2">✅</div>
              <div class="text-green-800">
                <div class="font-medium">Paciente cadastrado com sucesso!</div>
                <div class="text-sm">{{ registrationSuccess.name }} foi adicionado ao sistema.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-codenews-blue">{{ totalPasswords }}</div>
          <div class="text-sm text-gray-600">Total de Senhas</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-codenews-green">{{ preferentialCount }}</div>
          <div class="text-sm text-gray-600">Preferenciais</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-gray-600">{{ normalCount }}</div>
          <div class="text-sm text-gray-600">Normais</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-orange-600">{{ waitingQueue.length }}</div>
          <div class="text-sm text-gray-600">Aguardando</div>
        </div>
      </div>
  </div>
</template>

<script>
import { useQueueStore } from '@/stores/queue'
import { usePatientStore } from '@/stores/patient'
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import { validatePatientName, validateCid } from '@/utils/validation'
import { patientNotifications, medicalNotifications, notifyError, notifyWarning } from '@/utils/notifications'
import { handleGenericError, logError, safeGet, getFallbackData } from '@/utils/errorHandler'

export default {
  name: 'ReceptionModule',
  
  data() {
    return {
      isCalling: false,
      isRegistering: false,
      registrationSuccess: null,
      patientForm: {
        name: '',
        cid: '',
        priority: 'normal',
        errors: {}
      }
    }
  },
  
  setup() {
    const queueStore = useQueueStore()
    const patientStore = usePatientStore()
    const authStore = useAuthStore()
    const systemStore = useSystemStore()
    
    return { 
      queueStore,
      patientStore,
      authStore,
      systemStore
    }
  },
  
  computed: {
    waitingQueue() {
      return this.queueStore.waitingQueue
    },
    
    nextInQueue() {
      return this.queueStore.nextInQueue
    },
    
    currentPassword() {
      return this.queueStore.currentPassword
    },
    
    totalPasswords() {
      return this.queueStore.passwords.length
    },
    
    preferentialCount() {
      return this.queueStore.passwords.filter(p => p.priority === 'preferential').length
    },
    
    normalCount() {
      return this.queueStore.passwords.filter(p => p.priority === 'normal').length
    },
    
    riskClassification() {
      if (!this.patientForm.cid) return null
      return this.patientStore.classifyRiskByCid(this.patientForm.cid)
    },
    
    isFormValid() {
      return this.patientForm.name.trim().length >= 2 && 
             this.patientForm.priority &&
             Object.keys(this.patientForm.errors).length === 0
    }
  },
  
  mounted() {
    // Load existing data when component mounts
    this.queueStore.loadFromStorage()
    this.patientStore.loadFromStorage()
    
    // Auto-refresh queue every 5 seconds
    this.refreshInterval = setInterval(() => {
      this.queueStore.loadFromStorage()
    }, 5000)
  },
  
  beforeUnmount() {
    // Clear interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  
  methods: {
    async callNext() {
      if (!this.nextInQueue || this.isCalling) return
      
      this.isCalling = true
      
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Call next password in queue
        const calledPassword = this.queueStore.callNext()
        
        if (calledPassword) {
          // Show notification
          medicalNotifications.passwordCalled(calledPassword.number)
          
          // Update patient status if they have a patient record
          if (calledPassword.patientId) {
            // Use system store to handle the flow transition
            this.systemStore.processPatientFlow(calledPassword.patientId, 'waiting', 'reception')
          }
        } else {
          notifyWarning('Nenhuma senha', 'Não há senhas na fila para chamar')
        }
        
      } catch (error) {
        const handledError = handleGenericError(error, 'chamar próxima senha')
        logError(handledError, 'ReceptionModule.callNext')
        notifyError('Erro ao chamar senha', handledError.message)
      } finally {
        this.isCalling = false
      }
    },
    
    formatTime(isoString) {
      if (!isoString) return ''
      const date = new Date(isoString)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    
    validateForm() {
      const errors = {}
      
      // Validate name using utility function
      const nameError = validatePatientName(this.patientForm.name)
      if (nameError) {
        errors.name = nameError
      }
      
      // Validate CID format using utility function
      const cidError = validateCid(this.patientForm.cid)
      if (cidError) {
        errors.cid = cidError
      }
      
      // Validate priority
      if (!this.patientForm.priority) {
        errors.priority = 'Selecione uma prioridade'
      }
      
      this.patientForm.errors = errors
      return Object.keys(errors).length === 0
    },
    
    isValidCidFormat(cid) {
      // Basic CID format validation (letter + numbers + optional decimal)
      const cidPattern = /^[A-Z]\d{1,2}(\.\d)?$/
      return cidPattern.test(cid.toUpperCase())
    },
    
    onCidChange() {
      // Clear CID error when user types
      if (this.patientForm.errors.cid) {
        delete this.patientForm.errors.cid
        this.patientForm.errors = { ...this.patientForm.errors }
      }
      
      // Convert to uppercase for consistency
      this.patientForm.cid = this.patientForm.cid.toUpperCase()
    },
    
    async registerPatient() {
      if (!this.validateForm() || this.isRegistering) return
      
      this.isRegistering = true
      this.registrationSuccess = null
      
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Register patient
        const patient = this.patientStore.registerPatient({
          name: this.patientForm.name.trim(),
          cid: this.patientForm.cid.trim().toUpperCase(),
          priority: this.patientForm.priority
        })
        
        // Generate password for the patient
        const password = this.queueStore.generatePassword(this.patientForm.priority, patient.id)
        
        // Show success notification
        patientNotifications.registered(patient.name)
        
        // Show success message
        this.registrationSuccess = {
          name: patient.name,
          password: password.number
        }
        
        // Reset form
        this.resetForm()
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.registrationSuccess = null
        }, 5000)
        
      } catch (error) {
        const handledError = handleGenericError(error, 'cadastrar paciente')
        logError(handledError, 'ReceptionModule.registerPatient')
        notifyError('Erro no cadastro', handledError.message)
      } finally {
        this.isRegistering = false
      }
    },
    
    resetForm() {
      this.patientForm = {
        name: '',
        cid: '',
        priority: 'normal',
        errors: {}
      }
    },
    
    getRiskClassColor(riskClass) {
      const colors = {
        emergency: 'bg-red-100 text-red-800',
        high: 'bg-orange-100 text-orange-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
      }
      return colors[riskClass] || 'bg-gray-100 text-gray-800'
    },
    
    getRiskClassLabel(riskClass) {
      const labels = {
        emergency: 'EMERGÊNCIA',
        high: 'ALTO RISCO',
        medium: 'MÉDIO RISCO',
        low: 'BAIXO RISCO'
      }
      return labels[riskClass] || 'NÃO CLASSIFICADO'
    },

    getCurrentPatientName() {
      if (!this.currentPassword || !this.currentPassword.patientId) return 'N/A'
      const patient = this.patientStore.getPatientById(this.currentPassword.patientId)
      const safePatient = safeGet(patient, 'patient', { name: 'Paciente não encontrado' })
      return safePatient.name
    },

    canSendCurrentToTriage() {
      if (!this.currentPassword || !this.currentPassword.patientId) return false
      const patient = this.patientStore.getPatientById(this.currentPassword.patientId)
      return patient && patient.status === 'reception' && patient.name && patient.cid
    },

    async sendToTriage(patientId) {
      try {
        // Use system store to transition patient to triage
        this.systemStore.transitionPatientToTriage(patientId)
        
        // Get patient info for notification
        const patient = this.patientStore.getPatientById(patientId)
        const safePatient = safeGet(patient, 'patient', { name: 'Paciente' })
        
        // Show success notification
        patientNotifications.statusChanged(safePatient.name, 'triage')
        
        // Refresh data
        this.queueStore.loadFromStorage()
        this.patientStore.loadFromStorage()
        
      } catch (error) {
        const handledError = handleGenericError(error, 'enviar paciente para triagem')
        logError(handledError, 'ReceptionModule.sendToTriage')
        notifyError('Erro no encaminhamento', handledError.message)
      }
    }
  }
}
</script>