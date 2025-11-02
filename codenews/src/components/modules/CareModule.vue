<template>
  <div>
    <h1 class="text-3xl font-bold text-codenews-blue mb-8">
      Módulo de Atendimento Médico
    </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Patient List Section -->
        <div :class="[
          'bg-white rounded-lg shadow-md p-6',
          showCareForm ? 'lg:col-span-1' : 'lg:col-span-2'
        ]">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">
              Pacientes Triados
            </h2>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-600">
                Total: <span class="font-semibold">{{ triagedPatients.length }}</span>
              </div>
              <div class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                📋 Ordenado por risco
              </div>
            </div>
          </div>

          <!-- Risk Priority Legend -->
          <div class="mb-4 p-3 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium text-gray-700 mb-2">Prioridade de Atendimento:</div>
            <div class="flex flex-wrap gap-2 text-xs">
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Emergência</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Alto Risco</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Médio Risco</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Baixo Risco</span>
              </div>
            </div>
          </div>

          <!-- Patient Cards -->
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div v-if="triagedPatients.length === 0" class="text-center py-12 text-gray-500">
              <div class="text-6xl mb-4">🩺</div>
              <div class="text-lg font-medium mb-2">Nenhum paciente aguardando atendimento</div>
              <div class="text-sm">Os pacientes aparecerão aqui após passarem pela triagem</div>
            </div>
            
            <div
              v-for="(patient, index) in sortedTriagedPatients"
              :key="patient.id"
              :class="[
                'border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg relative',
                selectedPatient?.id === patient.id
                  ? 'border-codenews-blue bg-blue-50'
                  : getRiskBorderClass(getPatientTriage(patient.id)?.riskClassification)
              ]"
              @click="selectPatient(patient)"
            >
              <!-- Priority Indicator -->
              <div class="absolute top-2 right-2 flex items-center space-x-1">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  getRiskIndicatorColor(getPatientTriage(patient.id)?.riskClassification)
                ]"></div>
                <span class="text-xs font-bold text-gray-600">#{{ index + 1 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-800">
                      {{ patient.name }}
                    </h3>
                    <span :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      patient.priority === 'preferential'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    ]">
                      {{ patient.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                    <div>
                      <span class="font-medium">CID:</span>
                      {{ patient.cid || 'Não informado' }}
                    </div>
                    <div>
                      <span class="font-medium">Cadastrado:</span>
                      {{ formatTime(patient.registeredAt) }}
                    </div>
                  </div>
                  
                  <!-- Triage Info -->
                  <div v-if="getPatientTriage(patient.id)" class="mb-2">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-600">Risco:</span>
                        <span :class="[
                          'px-3 py-1 rounded-full text-xs font-bold',
                          getRiskClassColor(getPatientTriage(patient.id).riskClassification)
                        ]">
                          {{ getRiskClassLabel(getPatientTriage(patient.id).riskClassification) }}
                        </span>
                      </div>
                      <div v-if="getPatientTriage(patient.id).riskClassification === 'emergency'" class="text-red-600 text-xs font-bold animate-pulse">
                        🚨 URGENTE
                      </div>
                      <div v-else-if="getPatientTriage(patient.id).riskClassification === 'high'" class="text-orange-600 text-xs font-bold">
                        ⚠️ PRIORITÁRIO
                      </div>
                    </div>
                    
                    <!-- Vital Signs Summary -->
                    <div class="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <div class="grid grid-cols-2 gap-2">
                        <div>PA: {{ getPatientTriage(patient.id).vitalSigns.bloodPressure || 'N/A' }}</div>
                        <div>FC: {{ getPatientTriage(patient.id).vitalSigns.heartRate || 'N/A' }} bpm</div>
                        <div>Temp: {{ getPatientTriage(patient.id).vitalSigns.temperature || 'N/A' }}°C</div>
                        <div>Peso: {{ getPatientTriage(patient.id).vitalSigns.weight || 'N/A' }} kg</div>
                      </div>
                    </div>

                    <!-- Waiting Time Alert for Critical Cases -->
                    <div v-if="shouldShowWaitingAlert(patient)" class="mt-2 text-xs bg-red-100 text-red-800 p-2 rounded border border-red-200">
                      <div class="flex items-center space-x-1">
                        <span>⏰</span>
                        <span class="font-bold">Aguardando há {{ getWaitingTime(patient) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Existing Care Info -->
                  <div v-if="getPatientCare(patient.id)" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div class="text-sm text-yellow-800">
                      <span class="font-medium">⚠️ Atendimento em andamento</span>
                      <div v-if="getPatientCare(patient.id).completedAt" class="text-green-800">
                        ✅ Concluído em {{ formatTime(getPatientCare(patient.id).completedAt) }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-col items-end space-y-2">
                  <div :class="[
                    'w-3 h-3 rounded-full',
                    selectedPatient?.id === patient.id ? 'bg-codenews-blue' : 'bg-gray-300'
                  ]"></div>
                  
                  <div class="text-xs text-gray-500 text-right">
                    Clique para<br>selecionar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Patient Info -->
        <div v-if="!showCareForm" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Paciente Selecionado
          </h2>
          
          <div v-if="!selectedPatient" class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">👆</div>
            <div>Selecione um paciente da lista para iniciar o atendimento</div>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Patient Basic Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">Informações Básicas</h3>
              <div class="space-y-2 text-sm">
                <div><span class="font-medium">Nome:</span> {{ selectedPatient.name }}</div>
              <div><span class="font-medium">CPF:</span> {{ formatCpf(selectedPatient.cpf) || 'Não informado' }}</div>
              <div><span class="font-medium">Prioridade:</span> 
                {{ selectedPatient.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
              </div>
                <div><span class="font-medium">CID:</span> {{ selectedPatient.cid || 'Não informado' }}</div>
                <div><span class="font-medium">Prioridade:</span> 
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium ml-1',
                    selectedPatient.priority === 'preferential'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ selectedPatient.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
                  </span>
                </div>
                <div><span class="font-medium">Cadastrado:</span> {{ formatDateTime(selectedPatient.registeredAt) }}</div>
              </div>
            </div>
            
            <!-- Triage Data -->
            <div v-if="selectedPatientTriage" class="bg-blue-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">Dados da Triagem</h3>
              <div class="space-y-2 text-sm">
                <div class="flex items-center space-x-2">
                  <span class="font-medium">Classificação de Risco:</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getRiskClassColor(selectedPatientTriage.riskClassification)
                  ]">
                    {{ getRiskClassLabel(selectedPatientTriage.riskClassification) }}
                  </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mt-3">
                  <div><span class="font-medium">Pressão Arterial:</span> {{ selectedPatientTriage.vitalSigns.bloodPressure || 'N/A' }}</div>
                  <div><span class="font-medium">Freq. Cardíaca:</span> {{ selectedPatientTriage.vitalSigns.heartRate || 'N/A' }} bpm</div>
                  <div><span class="font-medium">Temperatura:</span> {{ selectedPatientTriage.vitalSigns.temperature || 'N/A' }}°C</div>
                  <div><span class="font-medium">Peso:</span> {{ selectedPatientTriage.vitalSigns.weight || 'N/A' }} kg</div>
                </div>
                
                <div v-if="selectedPatientTriage.notes" class="mt-3">
                  <span class="font-medium">Observações da Triagem:</span>
                  <div class="text-gray-700 bg-white p-2 rounded mt-1">{{ selectedPatientTriage.notes }}</div>
                </div>
                
                <div><span class="font-medium">Triagem realizada:</span> {{ formatDateTime(selectedPatientTriage.createdAt) }}</div>
              </div>
            </div>
            
            <!-- Existing Care Status -->
            <div v-if="selectedPatientCare" class="bg-green-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">Status do Atendimento</h3>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="font-medium">Status:</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium ml-1',
                    selectedPatientCare.completedAt ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ selectedPatientCare.completedAt ? 'Concluído' : 'Em andamento' }}
                  </span>
                </div>
                <div v-if="selectedPatientCare.diagnosis">
                  <span class="font-medium">Diagnóstico:</span> {{ selectedPatientCare.diagnosis }}
                </div>
                <div v-if="selectedPatientCare.outcome">
                  <span class="font-medium">Desfecho:</span> {{ getOutcomeLabel(selectedPatientCare.outcome) }}
                </div>
                <div><span class="font-medium">Iniciado:</span> {{ formatDateTime(selectedPatientCare.createdAt) }}</div>
                <div v-if="selectedPatientCare.completedAt">
                  <span class="font-medium">Concluído:</span> {{ formatDateTime(selectedPatientCare.completedAt) }}
                </div>
              </div>
            </div>
            
            <!-- Action Button -->
            <div class="pt-4">
              <button
                @click="startCare"
                :disabled="isStartingCare"
                :class="[
                  'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200',
                  !isStartingCare
                    ? 'bg-codenews-blue text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                <span v-if="isStartingCare">Carregando...</span>
                <span v-else-if="selectedPatientCare && !selectedPatientCare.completedAt">
                  Continuar Atendimento
                </span>
                <span v-else-if="selectedPatientCare && selectedPatientCare.completedAt">
                  Revisar Atendimento
                </span>
                <span v-else>Iniciar Atendimento</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Care Form -->
        <div v-if="showCareForm" class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">
              Atendimento Médico - {{ selectedPatient.name }}
            </h2>
            <button
              @click="cancelCare"
              class="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ✕ Cancelar
            </button>
          </div>

          <!-- Patient Summary -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span class="font-medium">Paciente:</span> {{ selectedPatient.name }}</div>
              <div><span class="font-medium">CPF:</span> {{ formatCpf(selectedPatient.cpf) || 'N/A' }}</div>
              <div><span class="font-medium">Prioridade:</span> 
                {{ selectedPatient.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
              </div>
              <div><span class="font-medium">CID:</span> {{ selectedPatient.cid || 'N/A' }}</div>
              <div><span class="font-medium">Risco:</span> 
                <span v-if="selectedPatientTriage" :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getRiskClassColor(selectedPatientTriage.riskClassification)
                ]">
                  {{ getRiskClassLabel(selectedPatientTriage.riskClassification) }}
                </span>
                <span v-else>N/A</span>
              </div>
              <div><span class="font-medium">Triagem:</span> {{ selectedPatientTriage ? formatTime(selectedPatientTriage.createdAt) : 'N/A' }}</div>
            </div>
          </div>

          <!-- Care Form -->
          <form @submit.prevent="saveCare" class="space-y-6">
            <!-- Diagnosis -->
            <div>
              <label for="diagnosis" class="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico *
              </label>
              <textarea
                id="diagnosis"
                v-model="careForm.diagnosis"
                rows="4"
                required
                placeholder="Descreva o diagnóstico médico do paciente..."
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                  careForm.errors.diagnosis 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                ]"
                @input="validateDiagnosis"
              ></textarea>
              <div v-if="careForm.errors.diagnosis" class="text-red-600 text-sm mt-1">
                {{ careForm.errors.diagnosis }}
              </div>
            </div>

            <!-- Outcome -->
            <div>
              <label for="outcome" class="block text-sm font-medium text-gray-700 mb-2">
                Desfecho do Atendimento *
              </label>
              <select
                id="outcome"
                v-model="careForm.outcome"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                  careForm.errors.outcome 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                ]"
                @change="validateOutcome"
              >
                <option value="">Selecione o desfecho...</option>
                <option value="discharge">Alta Médica</option>
                <option value="referral">Encaminhamento</option>
                <option value="hospitalization">Internação</option>
              </select>
              <div v-if="careForm.errors.outcome" class="text-red-600 text-sm mt-1">
                {{ careForm.errors.outcome }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Selecione o resultado final do atendimento
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Observações Adicionais
              </label>
              <textarea
                id="notes"
                v-model="careForm.notes"
                rows="3"
                placeholder="Observações sobre o atendimento, medicações prescritas, orientações ao paciente, etc."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-4 pt-4">
              <button
                type="button"
                @click="cancelCare"
                class="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSaving || !isFormValid"
                :class="[
                  'flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200',
                  isFormValid && !isSaving
                    ? 'bg-codenews-green text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                <span v-if="isSaving">Salvando...</span>
                <span v-else>Finalizar Atendimento</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4">
        <!-- Risk Distribution -->
        <div class="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-red-500">
          <div class="text-2xl font-bold text-red-600">{{ emergencyCount }}</div>
          <div class="text-xs text-gray-600">Emergência</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-orange-500">
          <div class="text-2xl font-bold text-orange-600">{{ highRiskCount }}</div>
          <div class="text-xs text-gray-600">Alto Risco</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-yellow-500">
          <div class="text-2xl font-bold text-yellow-600">{{ mediumRiskCount }}</div>
          <div class="text-xs text-gray-600">Médio Risco</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-green-500">
          <div class="text-2xl font-bold text-green-600">{{ lowRiskCount }}</div>
          <div class="text-xs text-gray-600">Baixo Risco</div>
        </div>
        
        <!-- General Stats -->
        <div class="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-blue-500">
          <div class="text-2xl font-bold text-blue-600">{{ activeAppointments }}</div>
          <div class="text-xs text-gray-600">Em Atendimento</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-gray-500">
          <div class="text-2xl font-bold text-gray-600">{{ completedAppointments }}</div>
          <div class="text-xs text-gray-600">Concluídos</div>
        </div>
      </div>
  </div>
</template>

<script>
import { usePatientStore } from '@/stores/patient'
import { useTriageStore } from '@/stores/triage'
import { useCareStore } from '@/stores/care'
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import { validateDiagnosis } from '@/utils/validation'
import { medicalNotifications, notifyError, notifyWarning } from '@/utils/notifications'
import { handleGenericError, logError, safeGet } from '@/utils/errorHandler'

export default {
  name: 'CareModule',
  
  data() {
    return {
      selectedPatient: null,
      isStartingCare: false,
      showCareForm: false,
      isSaving: false,
      careForm: {
        diagnosis: '',
        outcome: '',
        notes: '',
        errors: {}
      }
    }
  },
  
  setup() {
    const patientStore = usePatientStore()
    const triageStore = useTriageStore()
    const careStore = useCareStore()
    const authStore = useAuthStore()
    const systemStore = useSystemStore()
    
    return { 
      patientStore,
      triageStore,
      careStore,
      authStore,
      systemStore
    }
  },
  
  computed: {
    triagedPatients() {
      return this.patientStore.getPatientsByStatus('triage')
    },
    
    sortedTriagedPatients() {
      // Sort by risk classification priority (emergency > high > medium > low)
      const riskPriority = { 'emergency': 4, 'high': 3, 'medium': 2, 'low': 1 }
      
      return [...this.triagedPatients].sort((a, b) => {
        const aTriage = this.getPatientTriage(a.id)
        const bTriage = this.getPatientTriage(b.id)
        const aRisk = aTriage?.riskClassification || 'low'
        const bRisk = bTriage?.riskClassification || 'low'
        
        // First sort by risk priority (highest risk first)
        const riskDiff = (riskPriority[bRisk] || 1) - (riskPriority[aRisk] || 1)
        if (riskDiff !== 0) return riskDiff
        
        // For same risk level, prioritize by preferential status
        if (a.priority === 'preferential' && b.priority !== 'preferential') return -1
        if (b.priority === 'preferential' && a.priority !== 'preferential') return 1
        
        // For same risk and priority, sort by triage completion time (older first)
        const aTriageTime = aTriage?.createdAt || a.registeredAt
        const bTriageTime = bTriage?.createdAt || b.registeredAt
        return new Date(aTriageTime) - new Date(bTriageTime)
      })
    },
    
    selectedPatientTriage() {
      if (!this.selectedPatient) return null
      return this.triageStore.getTriageByPatientId(this.selectedPatient.id)
    },
    
    selectedPatientCare() {
      if (!this.selectedPatient) return null
      return this.careStore.getAppointmentByPatientId(this.selectedPatient.id)
    },
    
    activeAppointments() {
      return this.careStore.activeAppointments.length
    },
    
    completedAppointments() {
      return this.careStore.completedAppointments.length
    },
    
    emergencyCount() {
      return this.triagedPatients.filter(patient => {
        const triage = this.getPatientTriage(patient.id)
        return triage && triage.riskClassification === 'emergency'
      }).length
    },

    highRiskCount() {
      return this.triagedPatients.filter(patient => {
        const triage = this.getPatientTriage(patient.id)
        return triage && triage.riskClassification === 'high'
      }).length
    },

    mediumRiskCount() {
      return this.triagedPatients.filter(patient => {
        const triage = this.getPatientTriage(patient.id)
        return triage && triage.riskClassification === 'medium'
      }).length
    },

    lowRiskCount() {
      return this.triagedPatients.filter(patient => {
        const triage = this.getPatientTriage(patient.id)
        return triage && triage.riskClassification === 'low'
      }).length
    },
    
    isFormValid() {
      const { diagnosis, outcome } = this.careForm
      return diagnosis.trim() && 
             outcome && 
             Object.keys(this.careForm.errors).length === 0
    }
  },
  
  mounted() {
    // Load existing data when component mounts
    this.patientStore.loadFromStorage()
    this.triageStore.loadFromStorage()
    this.careStore.loadFromStorage()
    
    // Auto-refresh data every 10 seconds
    this.refreshInterval = setInterval(() => {
      this.patientStore.loadFromStorage()
      this.triageStore.loadFromStorage()
      this.careStore.loadFromStorage()
    }, 10000)
  },
  
  beforeUnmount() {
    // Clear interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  
  methods: {
    selectPatient(patient) {
      this.selectedPatient = patient
    },
    
    async startCare() {
      if (!this.selectedPatient || this.isStartingCare) return
      
      this.isStartingCare = true
      
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Load existing care data if available
        const existingCare = this.selectedPatientCare
        if (existingCare) {
          this.careForm.diagnosis = existingCare.diagnosis || ''
          this.careForm.outcome = existingCare.outcome || ''
          this.careForm.notes = existingCare.notes || ''
        } else {
          this.resetCareForm()
        }
        
        // Show care form
        this.showCareForm = true
        
      } catch (error) {
        console.error('Error starting care:', error)
        alert('Erro ao iniciar atendimento. Tente novamente.')
      } finally {
        this.isStartingCare = false
      }
    },
    
    cancelCare() {
      this.showCareForm = false
      this.resetCareForm()
    },
    
    resetCareForm() {
      this.careForm = {
        diagnosis: '',
        outcome: '',
        notes: '',
        errors: {}
      }
    },
    
    async saveCare() {
      if (!this.isFormValid || this.isSaving) return
      
      this.isSaving = true
      
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Create or update care record
        const existingCare = this.selectedPatientCare
        let care
        
        if (existingCare && !existingCare.completedAt) {
          // Complete existing care
          care = this.careStore.completeAppointment(existingCare.id, {
            diagnosis: this.careForm.diagnosis.trim(),
            outcome: this.careForm.outcome,
            notes: this.careForm.notes.trim()
          })
        } else {
          // Create new care record and complete it immediately
          care = this.careStore.createAppointment({
            patientId: this.selectedPatient.id,
            diagnosis: this.careForm.diagnosis.trim(),
            outcome: this.careForm.outcome,
            notes: this.careForm.notes.trim()
          })
          
          // Complete the appointment
          care = this.careStore.completeAppointment(care.id, {})
        }
        
        // Use system store to complete patient flow
        this.systemStore.completePatientFlow(this.selectedPatient.id)
        
        // Show success notification
        medicalNotifications.careCompleted(this.selectedPatient.name, this.careForm.outcome)
        
        // Reset form and hide it
        this.showCareForm = false
        this.resetCareForm()
        
        // Refresh selected patient data
        this.selectedPatient = this.patientStore.getPatientById(this.selectedPatient.id)
        
      } catch (error) {
        const handledError = handleGenericError(error, 'salvar atendimento')
        logError(handledError, 'CareModule.saveCare')
        notifyError('Erro no atendimento', handledError.message)
      } finally {
        this.isSaving = false
      }
    },
    
    validateDiagnosis() {
      const diagnosis = this.careForm.diagnosis.trim()
      delete this.careForm.errors.diagnosis
      
      const error = validateDiagnosis(diagnosis)
      if (error) {
        this.careForm.errors.diagnosis = error
      }
      
      this.careForm.errors = { ...this.careForm.errors }
    },
    
    validateOutcome() {
      const outcome = this.careForm.outcome
      delete this.careForm.errors.outcome
      
      if (!outcome) {
        this.careForm.errors.outcome = 'Selecione um desfecho'
      }
      
      this.careForm.errors = { ...this.careForm.errors }
    },
    
    getPatientTriage(patientId) {
      try {
        const triage = this.triageStore.getTriageByPatientId(patientId)
        return safeGet(triage, 'triage')
      } catch (error) {
        logError(handleGenericError(error, 'buscar triagem do paciente'), 'CareModule.getPatientTriage')
        return null
      }
    },
    
    getPatientCare(patientId) {
      try {
        const care = this.careStore.getAppointmentByPatientId(patientId)
        return safeGet(care, 'appointment')
      } catch (error) {
        logError(handleGenericError(error, 'buscar atendimento do paciente'), 'CareModule.getPatientCare')
        return null
      }
    },
    
    getRiskClassColor(riskClass) {
      const colors = {
        'low': 'bg-green-100 text-green-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-orange-100 text-orange-800',
        'emergency': 'bg-red-100 text-red-800'
      }
      return colors[riskClass] || colors.low
    },
    
    getRiskClassLabel(riskClass) {
      const labels = {
        'low': 'Baixo Risco',
        'medium': 'Risco Médio',
        'high': 'Alto Risco',
        'emergency': 'Emergência'
      }
      return labels[riskClass] || labels.low
    },
    
    getOutcomeLabel(outcome) {
      const labels = {
        'discharge': 'Alta Médica',
        'referral': 'Encaminhamento',
        'hospitalization': 'Internação'
      }
      return labels[outcome] || outcome
    },
    
    formatTime(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatCpf(cpf) {
      if (!cpf || cpf.length !== 11) return cpf
      
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    },

    getRiskBorderClass(riskClass) {
      const classes = {
        'emergency': 'border-red-300 bg-red-50 hover:border-red-400',
        'high': 'border-orange-300 bg-orange-50 hover:border-orange-400',
        'medium': 'border-yellow-300 bg-yellow-50 hover:border-yellow-400',
        'low': 'border-green-300 bg-green-50 hover:border-green-400'
      }
      return classes[riskClass] || 'border-gray-200 hover:border-gray-300'
    },

    getRiskIndicatorColor(riskClass) {
      const colors = {
        'emergency': 'bg-red-500',
        'high': 'bg-orange-500',
        'medium': 'bg-yellow-500',
        'low': 'bg-green-500'
      }
      return colors[riskClass] || 'bg-gray-400'
    },

    shouldShowWaitingAlert(patient) {
      const triage = this.getPatientTriage(patient.id)
      if (!triage) return false
      
      const riskClass = triage.riskClassification
      const waitingMinutes = this.getWaitingMinutes(patient)
      
      // Show alert based on risk level and waiting time
      const thresholds = {
        'emergency': 5,   // 5 minutes
        'high': 15,       // 15 minutes
        'medium': 30,     // 30 minutes
        'low': 60         // 60 minutes
      }
      
      return waitingMinutes > (thresholds[riskClass] || 60)
    },

    getWaitingMinutes(patient) {
      const triage = this.getPatientTriage(patient.id)
      const startTime = triage?.createdAt || patient.registeredAt
      const now = new Date()
      const start = new Date(startTime)
      return Math.floor((now - start) / (1000 * 60))
    },

    getWaitingTime(patient) {
      const minutes = this.getWaitingMinutes(patient)
      
      if (minutes < 60) {
        return `${minutes} min`
      } else {
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}min`
      }
    }
  }
}
</script>