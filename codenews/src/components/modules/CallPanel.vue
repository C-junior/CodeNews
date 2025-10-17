<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
    <!-- Header -->
    <div class="bg-black bg-opacity-30 p-4 lg:p-6">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl lg:text-3xl font-bold">Painel de Chamadas - CodeNews</h1>
        <div class="text-right">
          <div class="text-lg lg:text-xl font-semibold">{{ currentTime }}</div>
          <div class="text-sm lg:text-base opacity-75">{{ currentDate }}</div>
        </div>
      </div>
    </div>

    <div class="container mx-auto p-4 lg:p-8">
      <!-- Current Password Display -->
      <div class="mb-8 lg:mb-12">
        <div class="text-center mb-4 lg:mb-6">
          <h2 class="text-2xl lg:text-3xl font-semibold opacity-90">SENHA ATUAL</h2>
        </div>
        
        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 text-center border border-white border-opacity-20">
          <div v-if="currentPassword" class="animate-pulse-slow">
            <div class="text-8xl lg:text-9xl font-bold mb-4 lg:mb-6 text-yellow-300 drop-shadow-lg">
              {{ currentPassword.number }}
            </div>
            <div class="text-2xl lg:text-3xl font-semibold mb-2 lg:mb-4">
              <span :class="currentPassword.priority === 'preferential' ? 'text-green-300' : 'text-blue-300'">
                {{ currentPassword.priority === 'preferential' ? 'PREFERENCIAL' : 'NORMAL' }}
              </span>
            </div>
            <div class="text-lg lg:text-xl opacity-75">
              Chamada às {{ formatTime(currentPassword.calledAt) }}
            </div>
          </div>
          
          <div v-else class="opacity-60">
            <div class="text-6xl lg:text-8xl font-bold mb-4 lg:mb-6 text-gray-300">---</div>
            <div class="text-xl lg:text-2xl">Aguardando primeira chamada</div>
          </div>
        </div>
      </div>

      <!-- Next Passwords Queue -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- Next Passwords -->
        <div>
          <div class="text-center mb-4 lg:mb-6">
            <h3 class="text-xl lg:text-2xl font-semibold opacity-90">PRÓXIMAS SENHAS</h3>
          </div>
          
          <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white border-opacity-20">
            <div v-if="nextPasswords.length > 0" class="space-y-3 lg:space-y-4">
              <div 
                v-for="(password, index) in nextPasswords.slice(0, 5)" 
                :key="password.id"
                :class="[
                  'flex justify-between items-center p-4 lg:p-5 rounded-xl transition-all duration-300',
                  index === 0 
                    ? 'bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-50 transform scale-105' 
                    : 'bg-white bg-opacity-5 border border-white border-opacity-10'
                ]"
              >
                <div class="flex items-center space-x-3 lg:space-x-4">
                  <div :class="[
                    'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-bold',
                    index === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'
                  ]">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <div class="text-2xl lg:text-3xl font-bold">{{ password.number }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div :class="[
                    'text-sm lg:text-base font-semibold mb-1',
                    password.priority === 'preferential' ? 'text-green-300' : 'text-blue-300'
                  ]">
                    {{ password.priority === 'preferential' ? 'PREF.' : 'NORMAL' }}
                  </div>
                  <div class="text-xs lg:text-sm opacity-75">
                    {{ formatTime(password.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8 lg:py-12 opacity-60">
              <div class="text-xl lg:text-2xl mb-2">Nenhuma senha na fila</div>
              <div class="text-sm lg:text-base">Aguardando novos pacientes</div>
            </div>
          </div>
        </div>

        <!-- Statistics and Status -->
        <div>
          <div class="text-center mb-4 lg:mb-6">
            <h3 class="text-xl lg:text-2xl font-semibold opacity-90">ESTATÍSTICAS</h3>
          </div>
          
          <div class="space-y-4 lg:space-y-6">
            <!-- Queue Stats -->
            <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white border-opacity-20">
              <div class="grid grid-cols-2 gap-4 lg:gap-6">
                <div class="text-center">
                  <div class="text-4xl lg:text-5xl font-bold text-blue-300 mb-2">{{ totalWaiting }}</div>
                  <div class="text-sm lg:text-base opacity-75">Na Fila</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl lg:text-5xl font-bold text-green-300 mb-2">{{ totalCompleted }}</div>
                  <div class="text-sm lg:text-base opacity-75">Atendidas</div>
                </div>
              </div>
            </div>

            <!-- System Flow -->
            <div v-if="systemStats" class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white border-opacity-20">
              <h4 class="text-lg font-semibold mb-4 text-center opacity-90">FLUXO DO SISTEMA</h4>
              <div class="grid grid-cols-2 gap-3 lg:gap-4">
                <div class="text-center p-3 lg:p-4 bg-yellow-500 bg-opacity-20 rounded-xl border border-yellow-400 border-opacity-30">
                  <div class="text-2xl lg:text-3xl font-bold text-yellow-300">{{ systemStats.patients.reception }}</div>
                  <div class="text-xs lg:text-sm opacity-75">Acolhimento</div>
                </div>
                <div class="text-center p-3 lg:p-4 bg-orange-500 bg-opacity-20 rounded-xl border border-orange-400 border-opacity-30">
                  <div class="text-2xl lg:text-3xl font-bold text-orange-300">{{ systemStats.patients.triage }}</div>
                  <div class="text-xs lg:text-sm opacity-75">Triagem</div>
                </div>
                <div class="text-center p-3 lg:p-4 bg-purple-500 bg-opacity-20 rounded-xl border border-purple-400 border-opacity-30">
                  <div class="text-2xl lg:text-3xl font-bold text-purple-300">{{ systemStats.patients.care }}</div>
                  <div class="text-xs lg:text-sm opacity-75">Atendimento</div>
                </div>
                <div class="text-center p-3 lg:p-4 bg-gray-500 bg-opacity-20 rounded-xl border border-gray-400 border-opacity-30">
                  <div class="text-2xl lg:text-3xl font-bold text-gray-300">{{ systemStats.patients.completed }}</div>
                  <div class="text-xs lg:text-sm opacity-75">Concluídos</div>
                </div>
              </div>
            </div>

            <!-- Auto-refresh Status -->
            <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white border-opacity-20">
              <div class="flex items-center justify-center space-x-2">
                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-sm lg:text-base opacity-75">Atualização automática ativa</span>
              </div>
              <div class="text-center text-xs opacity-60 mt-2">
                Última atualização: {{ lastUpdate }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="mt-8 lg:mt-12 text-center space-x-4">
        <button
          @click="callNext"
          :disabled="nextPasswords.length === 0"
          :class="[
            'px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30',
            nextPasswords.length > 0
              ? 'bg-green-500 bg-opacity-80 hover:bg-opacity-90 text-white'
              : 'bg-gray-500 bg-opacity-50 text-gray-300 cursor-not-allowed'
          ]"
        >
          Chamar Próxima Senha
        </button>
        
        <button
          @click="goToPasswordSelection"
          class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
        >
          Gerar Nova Senha
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useQueueStore } from '@/stores/queue'
import { useSystemStore } from '@/stores/system'

export default {
  name: 'CallPanel',
  
  data() {
    return {
      refreshInterval: null,
      timeInterval: null,
      systemStats: null,
      currentTime: '',
      currentDate: '',
      lastUpdate: ''
    }
  },
  
  setup() {
    const queueStore = useQueueStore()
    const systemStore = useSystemStore()
    return { queueStore, systemStore }
  },
  
  computed: {
    currentPassword() {
      return this.queueStore.currentPassword
    },
    
    nextPasswords() {
      return this.queueStore.waitingQueue
    },
    
    totalWaiting() {
      return this.queueStore.passwords.filter(p => p.status === 'waiting').length
    },
    
    totalCompleted() {
      return this.queueStore.passwords.filter(p => p.status === 'completed').length
    }
  },
  
  mounted() {
    this.updateTime()
    this.queueStore.loadFromStorage()
    this.updateSystemStats()
    this.updateLastUpdate()
    
    // Update time every second
    this.timeInterval = setInterval(() => {
      this.updateTime()
    }, 1000)
    
    // Auto-refresh data every 3 seconds
    this.refreshInterval = setInterval(() => {
      this.queueStore.loadFromStorage()
      this.updateSystemStats()
      this.updateLastUpdate()
    }, 3000)
  },
  
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  },
  
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
      this.currentDate = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    updateLastUpdate() {
      const now = new Date()
      this.lastUpdate = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    updateSystemStats() {
      try {
        this.systemStats = this.systemStore.getSystemStats()
      } catch (error) {
        console.error('Error updating system stats:', error)
        this.systemStats = null
      }
    },
    
    formatTime(isoString) {
      if (!isoString) return '--:--'
      const date = new Date(isoString)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    
    callNext() {
      try {
        this.queueStore.callNext()
        this.updateLastUpdate()
      } catch (error) {
        console.error('Erro ao chamar próxima senha:', error)
      }
    },
    
    goToPasswordSelection() {
      this.$router.push('/password-selection')
    }
  }
}
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>