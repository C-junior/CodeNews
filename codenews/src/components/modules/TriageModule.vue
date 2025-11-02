<template>
  <div>
    <h1 class="text-3xl font-bold text-codenews-blue mb-8">
      Módulo de Triagem
    </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Patient List Section -->
        <div :class="[
          'bg-white rounded-lg shadow-md p-6',
          showVitalSignsForm ? 'lg:col-span-1' : 'lg:col-span-2'
        ]">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">
              Pacientes para Triagem
            </h2>
            <div class="text-sm text-gray-600">
              Total: <span class="font-semibold">{{ receptionPatients.length }}</span>
            </div>
          </div>

          <!-- Patient Cards -->
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div v-if="receptionPatients.length === 0" class="text-center py-12 text-gray-500">
              <div class="text-6xl mb-4">🏥</div>
              <div class="text-lg font-medium mb-2">Nenhum paciente aguardando triagem</div>
              <div class="text-sm">Os pacientes aparecerão aqui após passarem pelo acolhimento</div>
            </div>
            
            <div
              v-for="patient in receptionPatients"
              :key="patient.id"
              :class="[
                'border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg',
                selectedPatient?.id === patient.id
                  ? 'border-codenews-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
              @click="selectPatient(patient)"
            >
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
                  
                  <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span class="font-medium">CPF:</span>
                      {{ formatCpf(patient.cpf) || 'Não informado' }}
                    </div>
                    <div>
                      <span class="font-medium">Cadastrado:</span>
                      {{ formatTime(patient.registeredAt) }}
                    </div>
                  </div>
                  
                  <!-- CID will be added during triage process, not displayed here -->
                  
                  <!-- Risk Classification based on CID -->
                  <div v-if="patient.cid" class="mt-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-600">Risco por CID:</span>
                      <span :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getRiskClassColor(getCidRiskClassification(patient.cid))
                      ]">
                        {{ getRiskClassLabel(getCidRiskClassification(patient.cid)) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Existing Triage Info -->
                  <div v-if="getPatientTriage(patient.id)" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div class="text-sm text-yellow-800">
                      <span class="font-medium">⚠️ Triagem em andamento</span>
                      - Classificação atual: 
                      <span :class="[
                        'px-1 py-0.5 rounded text-xs font-medium ml-1',
                        getRiskClassColor(getPatientTriage(patient.id).riskClassification)
                      ]">
                        {{ getRiskClassLabel(getPatientTriage(patient.id).riskClassification) }}
                      </span>
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
        <div v-if="!showVitalSignsForm" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Paciente Selecionado
          </h2>
          
          <div v-if="!selectedPatient" class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">👆</div>
            <div>Selecione um paciente da lista para iniciar a triagem</div>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Patient Basic Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">Informações Básicas</h3>
              <div class="space-y-2 text-sm">
                <div><span class="font-medium">Nome:</span> {{ selectedPatient.name }}</div>
                <div><span class="font-medium">CPF:</span> {{ formatCpf(selectedPatient.cpf) || 'Não informado' }}</div>
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
            
            <!-- CID Risk Classification -->
            <div v-if="selectedPatient.cid" class="bg-blue-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">Classificação por CID</h3>
              <div class="flex items-center space-x-2">
                <span :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  getRiskClassColor(getCidRiskClassification(selectedPatient.cid))
                ]">
                  {{ getRiskClassLabel(getCidRiskClassification(selectedPatient.cid)) }}
                </span>
              </div>
              <div class="text-xs text-gray-600 mt-2">
                Baseado no código CID: {{ selectedPatient.cid }}
              </div>
            </div>
            
            <!-- Existing Triage Status -->
            <div v-if="selectedPatientTriage" class="bg-yellow-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">Status da Triagem</h3>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="font-medium">Status:</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium ml-1',
                    selectedPatientTriage.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ selectedPatientTriage.completed ? 'Concluída' : 'Em andamento' }}
                  </span>
                </div>
                <div>
                  <span class="font-medium">Classificação:</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium ml-1',
                    getRiskClassColor(selectedPatientTriage.riskClassification)
                  ]">
                    {{ getRiskClassLabel(selectedPatientTriage.riskClassification) }}
                  </span>
                </div>
                <div><span class="font-medium">Iniciada:</span> {{ formatDateTime(selectedPatientTriage.createdAt) }}</div>
              </div>
            </div>
            
            <!-- Action Button -->
            <div class="pt-4">
              <button
                @click="startTriage"
                :disabled="isStartingTriage"
                :class="[
                  'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200',
                  !isStartingTriage
                    ? 'bg-codenews-blue text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                <span v-if="isStartingTriage">Carregando...</span>
                <span v-else-if="selectedPatientTriage && !selectedPatientTriage.completed">
                  Continuar Triagem
                </span>
                <span v-else-if="selectedPatientTriage && selectedPatientTriage.completed">
                  Revisar Triagem
                </span>
                <span v-else>Iniciar Triagem</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Vital Signs Form -->
        <div v-if="showVitalSignsForm" class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">
              Sinais Vitais - {{ selectedPatient.name }}
            </h2>
            <button
              @click="cancelTriage"
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
              <!-- CID and risk classification will be determined during triage -->
            </div>
          </div>

          <!-- Vital Signs Form -->
          <form @submit.prevent="saveTriage" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Blood Pressure -->
              <div>
                <label for="bloodPressure" class="block text-sm font-medium text-gray-700 mb-2">
                  Pressão Arterial (mmHg) *
                </label>
                <input
                  id="bloodPressure"
                  v-model="triageForm.vitalSigns.bloodPressure"
                  type="text"
                  required
                  placeholder="Ex: 120/80"
                  pattern="^\d{2,3}\/\d{2,3}$"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                    triageForm.errors.bloodPressure 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  ]"
                  @input="validateBloodPressure"
                />
                <div v-if="triageForm.errors.bloodPressure" class="text-red-600 text-sm mt-1">
                  {{ triageForm.errors.bloodPressure }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Formato: sistólica/diastólica (ex: 120/80)
                </div>
              </div>

              <!-- Heart Rate -->
              <div>
                <label for="heartRate" class="block text-sm font-medium text-gray-700 mb-2">
                  Frequência Cardíaca (bpm) *
                </label>
                <input
                  id="heartRate"
                  v-model.number="triageForm.vitalSigns.heartRate"
                  type="number"
                  required
                  min="30"
                  max="200"
                  placeholder="Ex: 72"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                    triageForm.errors.heartRate 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  ]"
                  @input="validateHeartRate"
                />
                <div v-if="triageForm.errors.heartRate" class="text-red-600 text-sm mt-1">
                  {{ triageForm.errors.heartRate }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Batimentos por minuto (30-200)
                </div>
              </div>

              <!-- Temperature -->
              <div>
                <label for="temperature" class="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura (°C) *
                </label>
                <input
                  id="temperature"
                  v-model.number="triageForm.vitalSigns.temperature"
                  type="number"
                  step="0.1"
                  required
                  min="30"
                  max="45"
                  placeholder="Ex: 36.5"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                    triageForm.errors.temperature 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  ]"
                  @input="validateTemperature"
                />
                <div v-if="triageForm.errors.temperature" class="text-red-600 text-sm mt-1">
                  {{ triageForm.errors.temperature }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Graus Celsius (30.0-45.0)
                </div>
              </div>

              <!-- Weight -->
              <div>
                <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  id="weight"
                  v-model.number="triageForm.vitalSigns.weight"
                  type="number"
                  step="0.1"
                  min="1"
                  max="300"
                  placeholder="Ex: 70.5"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                    triageForm.errors.weight 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  ]"
                  @input="validateWeight"
                />
                <div v-if="triageForm.errors.weight" class="text-red-600 text-sm mt-1">
                  {{ triageForm.errors.weight }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Quilogramas (opcional)
                </div>
              </div>
            </div>

            <!-- Risk Classification Display -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-3">Classificação de Risco</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-600 mb-1">Baseado no CID:</div>
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    getRiskClassColor(getCidRiskClassification(selectedPatient.cid))
                  ]">
                    {{ getRiskClassLabel(getCidRiskClassification(selectedPatient.cid)) }}
                  </span>
                </div>
                <div>
                  <div class="text-sm text-gray-600 mb-1">Classificação Final:</div>
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    getRiskClassColor(finalRiskClassification)
                  ]">
                    {{ getRiskClassLabel(finalRiskClassification) }}
                  </span>
                </div>
              </div>
              <div v-if="riskEscalationReason" class="mt-3 text-sm text-orange-700 bg-orange-50 p-2 rounded">
                <strong>⚠️ Risco elevado:</strong> {{ riskEscalationReason }}
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Observações Adicionais
              </label>
              <textarea
                id="notes"
                v-model="triageForm.notes"
                rows="3"
                placeholder="Observações sobre o estado do paciente, sintomas adicionais, etc."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-4 pt-4">
              <button
                type="button"
                @click="cancelTriage"
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
                <span v-else>Salvar Triagem</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-codenews-blue">{{ receptionPatients.length }}</div>
          <div class="text-sm text-gray-600">Aguardando Triagem</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ inProgressTriages }}</div>
          <div class="text-sm text-gray-600">Triagens em Andamento</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-codenews-green">{{ completedTriages }}</div>
          <div class="text-sm text-gray-600">Triagens Concluídas</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ highRiskCount }}</div>
          <div class="text-sm text-gray-600">Alto Risco/Emergência</div>
        </div>
      </div>
  </div>
</template>

<script>
import { usePatientStore } from '@/stores/patient'
import { useTriageStore } from '@/stores/triage'
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import { validateBloodPressure, validateHeartRate, validateTemperature, validateWeight } from '@/utils/validation'
import { medicalNotifications, notifyError, notifyWarning } from '@/utils/notifications'
import { handleGenericError, logError, safeGet } from '@/utils/errorHandler'

export default {
  name: 'TriageModule',
  
  data() {
    return {
      selectedPatient: null,
      isStartingTriage: false,
      showVitalSignsForm: false,
      isSaving: false,
      triageForm: {
        vitalSigns: {
          bloodPressure: '',
          heartRate: null,
          temperature: null,
          weight: null
        },
        notes: '',
        errors: {}
      },
      riskEscalationReason: ''
    }
  },
  
  setup() {
    const patientStore = usePatientStore()
    const triageStore = useTriageStore()
    const authStore = useAuthStore()
    const systemStore = useSystemStore()
    
    return { 
      patientStore,
      triageStore,
      authStore,
      systemStore
    }
  },
  
  computed: {
    receptionPatients() {
      return this.patientStore.receptionPatients
    },
    
    selectedPatientTriage() {
      if (!this.selectedPatient) return null
      return this.triageStore.getTriageByPatientId(this.selectedPatient.id)
    },
    
    inProgressTriages() {
      return this.triageStore.triages.filter(t => !t.completed).length
    },
    
    completedTriages() {
      return this.triageStore.triages.filter(t => t.completed).length
    },
    
    highRiskCount() {
      return this.triageStore.triages.filter(t => 
        t.riskClassification === 'high' || t.riskClassification === 'emergency'
      ).length
    },
    
    finalRiskClassification() {
      if (!this.selectedPatient) return 'low'
      
      const cidRisk = this.getCidRiskClassification(this.selectedPatient.cid)
      return this.triageStore.classifyRisk(this.triageForm.vitalSigns, cidRisk)
    },
    
    isFormValid() {
      const { bloodPressure, heartRate, temperature } = this.triageForm.vitalSigns
      return bloodPressure && 
             heartRate && 
             temperature && 
             Object.keys(this.triageForm.errors).length === 0
    }
  },
  
  mounted() {
    // Load existing data when component mounts
    this.patientStore.loadFromStorage()
    this.triageStore.loadFromStorage()
    
    // Auto-refresh data every 10 seconds
    this.refreshInterval = setInterval(() => {
      this.patientStore.loadFromStorage()
      this.triageStore.loadFromStorage()
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
    
    async startTriage() {
      if (!this.selectedPatient || this.isStartingTriage) return
      
      this.isStartingTriage = true
      
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Load existing triage data if available
        const existingTriage = this.selectedPatientTriage
        if (existingTriage) {
          this.triageForm.vitalSigns = { ...existingTriage.vitalSigns }
          this.triageForm.notes = existingTriage.notes || ''
        } else {
          this.resetTriageForm()
        }
        
        // Show vital signs form
        this.showVitalSignsForm = true
        
      } catch (error) {
        console.error('Error starting triage:', error)
        alert('Erro ao iniciar triagem. Tente novamente.')
      } finally {
        this.isStartingTriage = false
      }
    },
    
    cancelTriage() {
      this.showVitalSignsForm = false
      this.resetTriageForm()
    },
    
    resetTriageForm() {
      this.triageForm = {
        vitalSigns: {
          bloodPressure: '',
          heartRate: null,
          temperature: null,
          weight: null
        },
        notes: '',
        errors: {}
      }
      this.riskEscalationReason = ''
    },
    
    async saveTriage() {
      if (!this.isFormValid || this.isSaving) return
      
      this.isSaving = true
      
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const finalRisk = this.finalRiskClassification
        const cidRisk = this.getCidRiskClassification(this.selectedPatient.cid)
        
        // Generate risk escalation reason if risk was elevated
        this.generateRiskEscalationReason(cidRisk, finalRisk)
        
        // Create or update triage
        const existingTriage = this.selectedPatientTriage
        let triage
        
        if (existingTriage) {
          // Update existing triage
          triage = this.triageStore.updateTriage(existingTriage.id, {
            vitalSigns: { ...this.triageForm.vitalSigns },
            riskClassification: finalRisk,
            notes: this.triageForm.notes,
            completed: true
          })
        } else {
          // Create new triage
          triage = this.triageStore.createTriage({
            patientId: this.selectedPatient.id,
            vitalSigns: { ...this.triageForm.vitalSigns },
            riskClassification: finalRisk,
            notes: this.triageForm.notes,
            completed: true
          })
        }
        
        // Use system store to transition patient to care (triage completed)
        this.systemStore.transitionPatientToCare(this.selectedPatient.id)
        
        // Show success notification
        medicalNotifications.triageCompleted(this.selectedPatient.name, finalRisk)
        
        // Reset form and hide it
        this.showVitalSignsForm = false
        this.resetTriageForm()
        
        // Refresh selected patient data
        this.selectedPatient = this.patientStore.getPatientById(this.selectedPatient.id)
        
      } catch (error) {
        const handledError = handleGenericError(error, 'salvar triagem')
        logError(handledError, 'TriageModule.saveTriage')
        notifyError('Erro na triagem', handledError.message)
      } finally {
        this.isSaving = false
      }
    },
    
    generateRiskEscalationReason(originalRisk, finalRisk) {
      const riskLevels = ['low', 'medium', 'high', 'emergency']
      const originalIndex = riskLevels.indexOf(originalRisk)
      const finalIndex = riskLevels.indexOf(finalRisk)
      
      if (finalIndex > originalIndex) {
        const reasons = []
        const { bloodPressure, heartRate, temperature } = this.triageForm.vitalSigns
        
        // Check heart rate
        if (heartRate > 120) reasons.push('Taquicardia (FC > 120 bpm)')
        else if (heartRate < 50) reasons.push('Bradicardia (FC < 50 bpm)')
        else if (heartRate > 100) reasons.push('FC elevada (> 100 bpm)')
        else if (heartRate < 60) reasons.push('FC baixa (< 60 bpm)')
        
        // Check temperature
        if (temperature > 39) reasons.push('Febre alta (> 39°C)')
        else if (temperature < 35) reasons.push('Hipotermia (< 35°C)')
        else if (temperature > 38) reasons.push('Febre (> 38°C)')
        else if (temperature < 36) reasons.push('Temperatura baixa (< 36°C)')
        
        // Check blood pressure
        if (bloodPressure) {
          const bpMatch = bloodPressure.match(/(\d+)\/(\d+)/)
          if (bpMatch) {
            const systolic = parseInt(bpMatch[1])
            const diastolic = parseInt(bpMatch[2])
            
            if (systolic > 180) reasons.push('Hipertensão severa (PAS > 180 mmHg)')
            else if (systolic < 90) reasons.push('Hipotensão (PAS < 90 mmHg)')
            else if (diastolic > 110) reasons.push('Hipertensão diastólica severa (PAD > 110 mmHg)')
            else if (diastolic < 60) reasons.push('Hipotensão diastólica (PAD < 60 mmHg)')
            else if (systolic > 140) reasons.push('Hipertensão (PAS > 140 mmHg)')
            else if (diastolic > 90) reasons.push('Hipertensão diastólica (PAD > 90 mmHg)')
          }
        }
        
        this.riskEscalationReason = reasons.join(', ')
      } else {
        this.riskEscalationReason = ''
      }
    },
    
    validateBloodPressure() {
      const bp = this.triageForm.vitalSigns.bloodPressure
      delete this.triageForm.errors.bloodPressure
      
      const error = validateBloodPressure(bp)
      if (error) {
        this.triageForm.errors.bloodPressure = error
      }
      
      this.triageForm.errors = { ...this.triageForm.errors }
    },
    
    validateHeartRate() {
      const hr = this.triageForm.vitalSigns.heartRate
      delete this.triageForm.errors.heartRate
      
      const error = validateHeartRate(hr)
      if (error) {
        this.triageForm.errors.heartRate = error
      }
      
      this.triageForm.errors = { ...this.triageForm.errors }
    },
    
    validateTemperature() {
      const temp = this.triageForm.vitalSigns.temperature
      delete this.triageForm.errors.temperature
      
      const error = validateTemperature(temp)
      if (error) {
        this.triageForm.errors.temperature = error
      }
      
      this.triageForm.errors = { ...this.triageForm.errors }
    },
    
    validateWeight() {
      const weight = this.triageForm.vitalSigns.weight
      delete this.triageForm.errors.weight
      
      const error = validateWeight(weight)
      if (error) {
        this.triageForm.errors.weight = error
      }
      
      this.triageForm.errors = { ...this.triageForm.errors }
    },
    
    getPatientTriage(patientId) {
      try {
        return this.triageStore.getTriageByPatientId(patientId)
      } catch (error) {
        logError(handleGenericError(error, 'buscar triagem do paciente'), 'TriageModule.getPatientTriage')
        return null
      }
    },
    
    getCidRiskClassification(cid) {
      return this.patientStore.classifyRiskByCid(cid)
    },
    
    formatTime(isoString) {
      if (!isoString) return ''
      const date = new Date(isoString)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    
    formatDateTime(isoString) {
      if (!isoString) return ''
      const date = new Date(isoString)
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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
    
    formatCpf(cpf) {
      if (!cpf || cpf.length !== 11) return cpf
      
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
  }
}
</script>