<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-codenews-blue mb-2">
          Sistema de Senhas
        </h1>
        <p class="text-gray-600">
          Selecione o tipo de atendimento
        </p>
      </div>
      
      <!-- Password Selection Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">
          Escolha sua prioridade
        </h2>
        
        <!-- Priority Buttons -->
        <div class="space-y-4 mb-8">
          <!-- Normal Priority -->
          <button
            @click="selectPriority('normal')"
            :class="[
              'w-full p-6 rounded-xl border-2 transition-all duration-300 text-left',
              selectedPriority === 'normal' 
                ? 'border-codenews-blue bg-blue-50 shadow-lg transform scale-105' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            ]"
          >
            <div class="flex items-center">
              <div class="text-3xl mr-4">👤</div>
              <div>
                <div class="font-semibold text-lg text-gray-800">Atendimento Normal</div>
                <div class="text-sm text-gray-600">Por ordem de chegada</div>
              </div>
            </div>
          </button>
          
          <!-- Preferential Priority -->
          <button
            @click="selectPriority('preferential')"
            :class="[
              'w-full p-6 rounded-xl border-2 transition-all duration-300 text-left',
              selectedPriority === 'preferential' 
                ? 'border-codenews-green bg-green-50 shadow-lg transform scale-105' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            ]"
          >
            <div class="flex items-center">
              <div class="text-3xl mr-4">⭐</div>
              <div>
                <div class="font-semibold text-lg text-gray-800">Atendimento Preferencial</div>
                <div class="text-sm text-gray-600">Idosos, gestantes, deficientes</div>
              </div>
            </div>
          </button>
        </div>
        
        <!-- Generate Button -->
        <button
          @click="generatePassword"
          :disabled="!selectedPriority || isGenerating"
          :class="[
            'w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300',
            selectedPriority && !isGenerating
              ? 'bg-codenews-blue text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <span v-if="isGenerating" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Gerando senha...
          </span>
          <span v-else>Gerar Senha</span>
        </button>
      </div>
      
      <!-- Generated Password Modal -->
      <div v-if="generatedPassword" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
          <div class="mb-6">
            <div class="text-green-500 text-6xl mb-4">✓</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Senha Gerada!</h3>
          </div>
          
          <div class="mb-6">
            <div class="text-5xl font-bold text-codenews-blue mb-2">
              {{ generatedPassword.number }}
            </div>
            <div class="text-lg text-gray-600">
              <span :class="generatedPassword.priority === 'preferential' ? 'text-codenews-green font-semibold' : 'text-gray-700'">
                {{ generatedPassword.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
              </span>
            </div>
            <div class="text-sm text-gray-500 mt-2">
              {{ formatTime(generatedPassword.createdAt) }}
            </div>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="text-blue-800 text-sm">
              <strong>Aguarde sua chamada!</strong><br>
              Acompanhe o painel de chamadas.
            </p>
          </div>
          
          <div class="space-y-3">
            <button
              @click="viewPanel"
              class="w-full bg-codenews-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              Ver Painel de Chamadas
            </button>
            <button
              @click="generateAnother"
              class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200"
            >
              Gerar Nova Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useQueueStore } from '@/stores/queue'

export default {
  name: 'PasswordSelection',
  
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
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const password = this.queueStore.generatePassword(this.selectedPriority)
        this.generatedPassword = password
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
    
    viewPanel() {
      this.$router.push('/panel')
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

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>