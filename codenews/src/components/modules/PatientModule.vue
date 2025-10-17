<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-4 lg:py-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-codenews-blue mb-6 lg:mb-8 text-center">
        Sistema de Senhas - CodeNews
      </h1>
      
      <!-- Password Generation Section -->
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-4 lg:p-8 mb-6 lg:mb-8">
          <h2 class="text-xl lg:text-2xl font-semibold text-gray-800 mb-4 lg:mb-6 text-center">
            Emitir Nova Senha
          </h2>
          
          <!-- Priority Selection -->
          <div class="mb-6 lg:mb-8">
            <h3 class="text-base lg:text-lg font-medium text-gray-700 mb-3 lg:mb-4 text-center">
              Selecione sua prioridade:
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <!-- Normal Priority Button -->
              <button
                @click="selectPriority('normal')"
                :class="[
                  'p-4 lg:p-6 rounded-lg border-2 transition-all duration-200 text-center touch-manipulation',
                  selectedPriority === 'normal' 
                    ? 'border-codenews-blue bg-blue-50 text-codenews-blue transform scale-105' 
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:shadow-md'
                ]"
              >
                <div class="text-xl lg:text-2xl mb-1 lg:mb-2">👤</div>
                <div class="font-semibold text-base lg:text-lg">Normal</div>
                <div class="text-xs lg:text-sm opacity-75">Atendimento por ordem de chegada</div>
              </button>
              
              <!-- Preferential Priority Button -->
              <button
                @click="selectPriority('preferential')"
                :class="[
                  'p-4 lg:p-6 rounded-lg border-2 transition-all duration-200 text-center touch-manipulation',
                  selectedPriority === 'preferential' 
                    ? 'border-codenews-green bg-green-50 text-codenews-green transform scale-105' 
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:shadow-md'
                ]"
              >
                <div class="text-xl lg:text-2xl mb-1 lg:mb-2">⭐</div>
                <div class="font-semibold text-base lg:text-lg">Preferencial</div>
                <div class="text-xs lg:text-sm opacity-75">Idosos, gestantes, deficientes</div>
              </button>
            </div>
          </div>
          
          <!-- Generate Password Button -->
          <div class="text-center">
            <button
              @click="generatePassword"
              :disabled="!selectedPriority || isGenerating"
              :class="[
                'px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-semibold text-base lg:text-lg transition-all duration-200 touch-manipulation min-w-[140px]',
                selectedPriority && !isGenerating
                  ? 'bg-codenews-blue text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              <span v-if="isGenerating" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
              </span>
              <span v-else>Gerar Senha</span>
            </button>
          </div>
        </div>
        
        <!-- Generated Password Display -->
        <div v-if="generatedPassword" class="bg-white rounded-lg shadow-md p-4 lg:p-8 text-center transition-all duration-500 transform animate-fade-in">
          <h3 class="text-lg lg:text-xl font-semibold text-gray-800 mb-3 lg:mb-4">
            Sua senha foi gerada!
          </h3>
          
          <div class="mb-4 lg:mb-6">
            <div class="text-4xl lg:text-6xl font-bold text-codenews-blue mb-2 animate-pulse-once">
              {{ generatedPassword.number }}
            </div>
            <div class="text-base lg:text-lg text-gray-600">
              Prioridade: 
              <span :class="generatedPassword.priority === 'preferential' ? 'text-codenews-green font-semibold' : 'text-gray-700 font-semibold'">
                {{ generatedPassword.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
              </span>
            </div>
            <div class="text-xs lg:text-sm text-gray-500 mt-1 lg:mt-2">
              Gerada em: {{ formatTime(generatedPassword.createdAt) }}
            </div>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 mb-3 lg:mb-4">
            <p class="text-blue-800 text-xs lg:text-sm">
              <strong>Aguarde sua chamada!</strong><br>
              Acompanhe o painel de chamadas abaixo para saber quando será sua vez.
            </p>
          </div>
          
          <button
            @click="generateAnother"
            class="bg-gray-600 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 touch-manipulation"
          >
            Gerar Nova Senha
          </button>
        </div>
        
        <!-- Queue Panel -->
        <QueuePanel />
      </div>
    </div>
  </div>
</template>

<script>
import { useQueueStore } from '@/stores/queue'
import QueuePanel from '@/components/shared/QueuePanel.vue'

export default {
  name: 'PatientModule',
  
  components: {
    QueuePanel
  },
  
  data() {
    return {
      selectedPriority: null,
      generatedPassword: null,
      isGenerating: false
    }
  },
  
  setup() {
    const queueStore = useQueueStore()
    return { queueStore }
  },
  
  mounted() {
    // Load existing queue data when component mounts
    this.queueStore.loadFromStorage()
  },
  
  methods: {
    selectPriority(priority) {
      this.selectedPriority = priority
    },
    
    async generatePassword() {
      if (!this.selectedPriority || this.isGenerating) return
      
      this.isGenerating = true
      
      try {
        // Simulate a brief loading state for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Generate password using the queue store
        const password = this.queueStore.generatePassword(this.selectedPriority)
        
        this.generatedPassword = password
        
        // Reset selection for next generation
        this.selectedPriority = null
        
      } catch (error) {
        console.error('Error generating password:', error)
        alert('Erro ao gerar senha. Tente novamente.')
      } finally {
        this.isGenerating = false
      }
    },
    
    generateAnother() {
      this.generatedPassword = null
      this.selectedPriority = null
    },
    
    formatTime(isoString) {
      const date = new Date(isoString)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }
}
</script>