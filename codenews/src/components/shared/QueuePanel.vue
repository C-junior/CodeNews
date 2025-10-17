<template>
  <div class="bg-white rounded-lg shadow-md p-4 lg:p-6">
    <h3 class="text-lg lg:text-xl font-semibold text-gray-800 mb-4 lg:mb-6 text-center">
      Painel de Chamadas
    </h3>
    
    <!-- Current Password Display -->
    <div class="mb-6 lg:mb-8">
      <div class="text-center">
        <div class="text-xs lg:text-sm text-gray-600 mb-2">SENHA ATUAL</div>
        <div v-if="currentPassword" class="bg-codenews-blue text-white rounded-lg p-4 lg:p-6 transition-all duration-300">
          <div class="text-3xl lg:text-4xl font-bold mb-1 lg:mb-2">
            {{ currentPassword.number }}
          </div>
          <div class="text-base lg:text-lg">
            {{ currentPassword.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
          </div>
          <div class="text-xs lg:text-sm opacity-90 mt-1 lg:mt-2">
            Chamada às {{ formatTime(currentPassword.calledAt) }}
          </div>
        </div>
        <div v-else class="bg-gray-200 text-gray-600 rounded-lg p-4 lg:p-6">
          <div class="text-xl lg:text-2xl font-bold mb-1 lg:mb-2">---</div>
          <div class="text-base lg:text-lg">Aguardando primeira chamada</div>
        </div>
      </div>
    </div>
    
    <!-- Next Passwords in Queue -->
    <div class="mb-4 lg:mb-6">
      <div class="text-center mb-3 lg:mb-4">
        <div class="text-xs lg:text-sm text-gray-600 mb-2">PRÓXIMAS SENHAS</div>
      </div>
      
      <div v-if="nextPasswords.length > 0" class="space-y-2">
        <div 
          v-for="(password, index) in nextPasswords.slice(0, 3)" 
          :key="password.id"
          :class="[
            'flex justify-between items-center p-2 lg:p-3 rounded-lg border transition-all duration-200',
            index === 0 ? 'border-yellow-300 bg-yellow-50 transform scale-105' : 'border-gray-200 bg-gray-50'
          ]"
        >
          <div class="flex items-center space-x-2 lg:space-x-3">
            <div :class="[
              'w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-semibold',
              index === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-400 text-white'
            ]">
              {{ index + 1 }}
            </div>
            <div>
              <div class="font-semibold text-base lg:text-lg">{{ password.number }}</div>
            </div>
          </div>
          <div class="text-right">
            <div :class="[
              'text-xs lg:text-sm font-medium',
              password.priority === 'preferential' ? 'text-codenews-green' : 'text-gray-600'
            ]">
              {{ password.priority === 'preferential' ? 'Pref.' : 'Normal' }}
            </div>
            <div class="text-xs text-gray-500 hidden sm:block">
              {{ formatTime(password.createdAt) }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center text-gray-500 py-6 lg:py-8">
        <div class="text-base lg:text-lg">Nenhuma senha na fila</div>
        <div class="text-xs lg:text-sm">Aguardando novos pacientes</div>
      </div>
    </div>
    
    <!-- Queue Statistics -->
    <div class="border-t pt-3 lg:pt-4">
      <div class="grid grid-cols-2 gap-2 lg:gap-4 text-center mb-3 lg:mb-4">
        <div class="bg-blue-50 rounded-lg p-2 lg:p-3 transition-all duration-200 hover:bg-blue-100">
          <div class="text-xl lg:text-2xl font-bold text-codenews-blue">{{ totalWaiting }}</div>
          <div class="text-xs lg:text-sm text-gray-600">Na Fila</div>
        </div>
        <div class="bg-green-50 rounded-lg p-2 lg:p-3 transition-all duration-200 hover:bg-green-100">
          <div class="text-xl lg:text-2xl font-bold text-codenews-green">{{ totalCompleted }}</div>
          <div class="text-xs lg:text-sm text-gray-600">Atendidas</div>
        </div>
      </div>
      
      <!-- System Flow Status -->
      <div v-if="systemStats" class="grid grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-2 text-xs">
        <div class="bg-yellow-50 rounded p-1.5 lg:p-2 text-center transition-all duration-200 hover:bg-yellow-100">
          <div class="font-bold text-yellow-700">{{ systemStats.patients.reception }}</div>
          <div class="text-yellow-600 text-xs">Acolhimento</div>
        </div>
        <div class="bg-orange-50 rounded p-1.5 lg:p-2 text-center transition-all duration-200 hover:bg-orange-100">
          <div class="font-bold text-orange-700">{{ systemStats.patients.triage }}</div>
          <div class="text-orange-600 text-xs">Triagem</div>
        </div>
        <div class="bg-purple-50 rounded p-1.5 lg:p-2 text-center transition-all duration-200 hover:bg-purple-100">
          <div class="font-bold text-purple-700">{{ systemStats.patients.care }}</div>
          <div class="text-purple-600 text-xs">Atendimento</div>
        </div>
        <div class="bg-gray-50 rounded p-1.5 lg:p-2 text-center transition-all duration-200 hover:bg-gray-100">
          <div class="font-bold text-gray-700">{{ systemStats.patients.completed }}</div>
          <div class="text-gray-600 text-xs">Concluídos</div>
        </div>
      </div>
    </div>
    
    <!-- Auto-refresh indicator -->
    <div class="text-center mt-4">
      <div class="text-xs text-gray-500 flex items-center justify-center space-x-1">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Atualização automática ativa</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useQueueStore } from '@/stores/queue'
import { useSystemStore } from '@/stores/system'

export default {
  name: 'QueuePanel',
  
  data() {
    return {
      refreshInterval: null,
      systemStats: null
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
    // Load queue data from storage
    this.queueStore.loadFromStorage()
    this.updateSystemStats()
    
    // Set up auto-refresh every 5 seconds
    this.refreshInterval = setInterval(() => {
      this.queueStore.loadFromStorage()
      this.updateSystemStats()
    }, 5000)
  },
  
  beforeUnmount() {
    // Clean up interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  
  methods: {
    formatTime(isoString) {
      if (!isoString) return '--:--'
      const date = new Date(isoString)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },

    updateSystemStats() {
      try {
        this.systemStats = this.systemStore.getSystemStats()
      } catch (error) {
        console.error('Error updating system stats:', error)
        this.systemStats = null
      }
    }
  }
}
</script>