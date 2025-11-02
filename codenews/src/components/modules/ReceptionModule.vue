<template>
  <div>
    <h1 class="text-2xl lg:text-3xl font-bold text-codenews-blue mb-6 lg:mb-8">
      Módulo de Acolhimento
    </h1>

    <!-- Queue View - Initial State -->
    <div v-if="currentView === 'queue'" class="space-y-6">
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

      <!-- Statistics Section -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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

    <!-- Patient Management View - After calling password -->
    <div v-if="currentView === 'patients'" class="space-y-6">
      <!-- Header with back button -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl lg:text-2xl font-semibold text-gray-800">
          Pacientes
        </h2>
        <button
          @click="backToQueue"
          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Voltar para Fila
        </button>
      </div>

      <!-- Current Password Info -->
      <div v-if="currentPassword" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="text-center">
          <div class="text-sm text-blue-600 font-medium mb-1">SENHA CHAMADA</div>
          <div class="text-2xl font-bold text-codenews-blue mb-1">
            {{ currentPassword.number }}
          </div>
          <div class="text-sm text-blue-700">
            Prioridade: {{ currentPassword.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
          </div>
        </div>
      </div>

      <!-- Patient Search and Registration -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <!-- Search Section -->
        <div class="mb-6">
          <div class="flex flex-col sm:flex-row gap-4 mb-4">
            <div class="flex-1">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar paciente por nome ou CPF..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="searchPatients"
              />
            </div>
            <button
              @click="showRegistrationForm = true"
              class="px-6 py-3 bg-codenews-blue text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Cadastrar Paciente
            </button>
          </div>
        </div>

        <!-- Patient List/Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">CPF</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="displayedPatients.length === 0">
                <td colspan="3" class="px-4 py-8 text-center text-gray-500">
                  {{ searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado' }}
                </td>
              </tr>
              <tr v-for="patient in displayedPatients" :key="patient.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">{{ patient.name }}</div>
                </td>
                <td class="px-4 py-3 text-gray-600">
                  {{ formatCpfDisplay(patient.cpf) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-center space-x-2">
                    <button
                      @click="editPatient(patient)"
                      class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      @click="sendPatientToTriage(patient)"
                      class="px-3 py-1 text-sm bg-codenews-green text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Enviar para Triagem
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Patient Registration Modal -->
    <div v-if="showRegistrationForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ editingPatient ? 'Editar Paciente' : 'Cadastrar Novo Paciente' }}
          </h3>
          <button
            @click="closeRegistrationForm"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="savePatient" class="space-y-4">
          <!-- Patient Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              v-model="patientForm.name"
              type="text"
              required
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                patientForm.errors.name 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              ]"
              placeholder="Nome do paciente"
            />
            <div v-if="patientForm.errors.name" class="text-red-600 text-xs mt-1">
              {{ patientForm.errors.name }}
            </div>
          </div>

          <!-- Patient CPF -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              CPF *
            </label>
            <input
              v-model="patientForm.cpf"
              type="text"
              required
              maxlength="14"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                patientForm.errors.cpf 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              ]"
              placeholder="XXX.XXX.XXX-XX"
              @input="formatCpf"
            />
            <div v-if="patientForm.errors.cpf" class="text-red-600 text-xs mt-1">
              {{ patientForm.errors.cpf }}
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeRegistrationForm"
              class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isRegistering || !isFormValid"
              :class="[
                'flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200',
                isFormValid && !isRegistering
                  ? 'bg-codenews-green text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              <span v-if="isRegistering">Salvando...</span>
              <span v-else>{{ editingPatient ? 'Salvar' : 'Cadastrar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>


  </div>
</template>

<script>
import { useQueueStore } from '@/stores/queue'
import { usePatientStore } from '@/stores/patient'
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import { validatePatientName, validateCpf } from '@/utils/validation'
import { patientNotifications, medicalNotifications, notifyError, notifyWarning } from '@/utils/notifications'
import { handleGenericError, logError } from '@/utils/errorHandler'

export default {
  name: 'ReceptionModule',
  
  data() {
    return {
      currentView: 'queue', // 'queue' or 'patients'
      isCalling: false,
      isRegistering: false,
      registrationSuccess: null,
      showRegistrationForm: false,
      editingPatient: null,
      patientForm: {
        name: '',
        cpf: '',
        errors: {}
      },
      searchTerm: '',
      searchResults: []
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
    

    
    isFormValid() {
      return this.patientForm.name.trim().length >= 2 && 
             this.patientForm.cpf.length === 14 &&  // Formatted CPF length
             Object.keys(this.patientForm.errors).length === 0
    },
    
    displayedPatients() {
      if (!this.searchTerm.trim()) {
        // Show all patients when no search term
        return this.patientStore.patients.slice(0, 20) // Limit to first 20 for performance
      }
      return this.searchResults
    },
    

  },
  
  mounted() {
    // Load existing data when component mounts
    this.queueStore.loadFromStorage()
    this.patientStore.loadFromStorage()
    
    // Create test data if no patients exist (for development)
    if (this.patientStore.patients.length === 0) {
      this.createTestData()
    }
    
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
          
          // Switch to patient management view
          this.currentView = 'patients'
          
          // Reset search
          this.resetSearch()
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

    backToQueue() {
      this.currentView = 'queue'
      this.resetSearch()
      this.closeRegistrationForm()
    },

    resetSearch() {
      this.searchTerm = ''
      this.searchResults = []
    },
    
    formatTime(isoString) {
      if (!isoString) return ''
      const date = new Date(isoString)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    

    
    searchPatients() {
      if (!this.searchTerm.trim()) {
        this.searchResults = [];
        return;
      }
      
      const term = this.searchTerm.trim().toLowerCase();
      const cleanSearchTerm = this.searchTerm.replace(/\D/g, ''); // Remove non-digits for CPF search
      
      // Search both by name and CPF
      this.searchResults = this.patientStore.patients.filter(patient => {
        const matchesName = patient.name && patient.name.toLowerCase().includes(term);
        const matchesCpf = patient.cpf && patient.cpf.includes(cleanSearchTerm);
        return matchesName || matchesCpf;
      }).slice(0, 10); // Limit to first 10 results
      
      console.log('Busca realizada:', { term, cleanSearchTerm, results: this.searchResults.length });
    },
    
    editPatient(patient) {
      this.editingPatient = patient
      this.patientForm = {
        name: patient.name,
        cpf: this.formatCpfDisplay(patient.cpf),
        errors: {}
      }
      this.showRegistrationForm = true
    },

    closeRegistrationForm() {
      this.showRegistrationForm = false
      this.editingPatient = null
      this.resetForm()
    },

    async sendPatientToTriage(patient) {
      try {
        // Link patient to current password if not already linked
        if (this.currentPassword && !this.currentPassword.patientId) {
          this.queueStore.updatePasswordPatientId(this.currentPassword.id, patient.id)
        }

        // Update patient status to reception first, then triage
        this.systemStore.processPatientFlow(patient.id, 'waiting', 'reception')
        
        // Wait a moment for the state to update, then send to triage
        setTimeout(() => {
          this.systemStore.transitionPatientToTriage(patient.id)
        }, 100)
        
        // Show success notification
        patientNotifications.statusChanged(patient.name, 'triage')
        
        // Go back to queue view
        this.backToQueue()
        
      } catch (error) {
        const handledError = handleGenericError(error, 'enviar paciente para triagem')
        logError(handledError, 'ReceptionModule.sendPatientToTriage')
        notifyError('Erro no encaminhamento', handledError.message)
      }
    },
    
    validateForm() {
      const errors = {}
      
      // Validate name using utility function
      const nameError = validatePatientName(this.patientForm.name)
      if (nameError) {
        errors.name = nameError
      }
      
      // Validate CPF using utility function
      const cpfError = validateCpf(this.patientForm.cpf);
      if (cpfError) {
        errors.cpf = cpfError
      }
      
      this.patientForm.errors = errors
      return Object.keys(errors).length === 0
    },
    

    
    // CPF validation and formatting methods
    formatCpf(event) {
      let value = event.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.substring(0, 11);
      
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
      }
      
      this.patientForm.cpf = value;
    },

    validateCpf() {
      const error = validateCpf(this.patientForm.cpf);
      
      if (error) {
        this.patientForm.errors.cpf = error;
        return false;
      }
      
      // Clear error if valid
      if (this.patientForm.errors.cpf) {
        delete this.patientForm.errors.cpf;
        this.patientForm.errors = { ...this.patientForm.errors };
      }
      
      return true;
    },
    

    
    async savePatient() {
      if (!this.validateForm() || this.isRegistering) return
      
      this.isRegistering = true
      
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 300))
        
        if (this.editingPatient) {
          // Update existing patient
          const updatedPatient = this.patientStore.updatePatient(this.editingPatient.id, {
            name: this.patientForm.name.trim(),
            cpf: this.patientForm.cpf.replace(/\D/g, '') // Store only numbers
          })
          
          // Show success notification
          patientNotifications.updated(updatedPatient.name)
        } else {
          // Register new patient
          const patient = this.patientStore.registerPatient({
            name: this.patientForm.name.trim(),
            cpf: this.patientForm.cpf.replace(/\D/g, ''), // Store only numbers
            cid: '', // CID will be added in triage
            priority: this.currentPassword ? this.currentPassword.priority : 'normal'
          })
          
          // Show success notification
          patientNotifications.registered(patient.name)
        }
        
        // Close form and refresh search
        this.closeRegistrationForm()
        this.searchPatients()
        
      } catch (error) {
        const handledError = handleGenericError(error, this.editingPatient ? 'atualizar paciente' : 'cadastrar paciente')
        logError(handledError, 'ReceptionModule.savePatient')
        notifyError('Erro no cadastro', handledError.message)
      } finally {
        this.isRegistering = false
      }
    },
    
    resetForm() {
      this.patientForm = {
        name: '',
        cpf: '',
        errors: {}
      }
    },

    formatCpfDisplay(cpf) {
      if (!cpf || cpf.length !== 11) return cpf
      
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    },

    formatCpfForValidation(cpf) {
      // Format CPF to the expected format for validation (XXX.XXX.XXX-XX)
      if (cpf.length === 11) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return cpf;
    },

    createTestData() {
      // Create some test patients for development
      try {
        const testPatients = [
          { name: 'João Silva', cpf: '12345678901' },
          { name: 'Maria Santos', cpf: '98765432100' },
          { name: 'Pedro Oliveira', cpf: '11122233344' },
          { name: 'Ana Costa', cpf: '55566677788' }
        ]

        testPatients.forEach(patientData => {
          this.patientStore.registerPatient({
            name: patientData.name,
            cpf: patientData.cpf,
            cid: '',
            priority: 'normal'
          })
        })

        // Create some test passwords
        this.queueStore.generatePassword('normal')
        this.queueStore.generatePassword('preferential')
        this.queueStore.generatePassword('normal')

        console.log('Dados de teste criados com sucesso')
      } catch (error) {
        console.error('Erro ao criar dados de teste:', error)
      }
    }
    

  }
}
</script>