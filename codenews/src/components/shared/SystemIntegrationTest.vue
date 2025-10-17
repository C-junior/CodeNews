<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Teste de Integração do Sistema</h3>
    
    <div class="space-y-4">
      <!-- Test Controls -->
      <div class="flex space-x-2">
        <button
          @click="createTestPatient"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Criar Paciente Teste
        </button>
        <button
          @click="callNextPatient"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Chamar Próximo
        </button>
        <button
          @click="resetSystem"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Resetar Sistema
        </button>
      </div>

      <!-- System Status -->
      <div v-if="systemStats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-3 rounded">
          <div class="text-lg font-bold text-blue-600">{{ systemStats.patients.waiting }}</div>
          <div class="text-sm text-gray-600">Aguardando</div>
        </div>
        <div class="bg-yellow-50 p-3 rounded">
          <div class="text-lg font-bold text-yellow-600">{{ systemStats.patients.reception }}</div>
          <div class="text-sm text-gray-600">Acolhimento</div>
        </div>
        <div class="bg-orange-50 p-3 rounded">
          <div class="text-lg font-bold text-orange-600">{{ systemStats.patients.triage }}</div>
          <div class="text-sm text-gray-600">Triagem</div>
        </div>
        <div class="bg-purple-50 p-3 rounded">
          <div class="text-lg font-bold text-purple-600">{{ systemStats.patients.care }}</div>
          <div class="text-sm text-gray-600">Atendimento</div>
        </div>
      </div>

      <!-- Test Results -->
      <div v-if="testResults.length > 0" class="mt-4">
        <h4 class="font-medium text-gray-800 mb-2">Resultados dos Testes:</h4>
        <div class="space-y-1 text-sm">
          <div
            v-for="(result, index) in testResults"
            :key="index"
            :class="[
              'p-2 rounded',
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            ]"
          >
            {{ result.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSystemStore } from '@/stores/system'
import { useQueueStore } from '@/stores/queue'
import { usePatientStore } from '@/stores/patient'

export default {
  name: 'SystemIntegrationTest',
  
  data() {
    return {
      systemStats: null,
      testResults: [],
      testPatientCounter: 0
    }
  },
  
  setup() {
    const systemStore = useSystemStore()
    const queueStore = useQueueStore()
    const patientStore = usePatientStore()
    
    return { systemStore, queueStore, patientStore }
  },
  
  mounted() {
    this.updateStats()
    
    // Update stats every 2 seconds
    this.statsInterval = setInterval(() => {
      this.updateStats()
    }, 2000)
  },
  
  beforeUnmount() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }
  },
  
  methods: {
    updateStats() {
      try {
        this.systemStats = this.systemStore.getSystemStats()
      } catch (error) {
        console.error('Error updating stats:', error)
      }
    },
    
    createTestPatient() {
      try {
        this.testPatientCounter++
        
        // Create test patient
        const patient = this.patientStore.registerPatient({
          name: `Paciente Teste ${this.testPatientCounter}`,
          cid: 'J06.9',
          priority: Math.random() > 0.7 ? 'preferential' : 'normal'
        })
        
        // Generate password
        const password = this.queueStore.generatePassword(patient.priority, patient.id)
        
        this.addTestResult(true, `Paciente criado: ${patient.name} - Senha: ${password.number}`)
        this.updateStats()
        
      } catch (error) {
        this.addTestResult(false, `Erro ao criar paciente: ${error.message}`)
      }
    },
    
    callNextPatient() {
      try {
        const nextPassword = this.queueStore.nextInQueue
        if (!nextPassword) {
          this.addTestResult(false, 'Nenhuma senha na fila para chamar')
          return
        }
        
        // Call next password
        const calledPassword = this.queueStore.callNext()
        
        if (calledPassword && calledPassword.patientId) {
          // Use system store to process flow
          this.systemStore.processPatientFlow(calledPassword.patientId, 'waiting', 'reception')
          this.addTestResult(true, `Senha chamada: ${calledPassword.number} - Paciente movido para acolhimento`)
        } else {
          this.addTestResult(true, `Senha chamada: ${calledPassword.number} - Sem paciente associado`)
        }
        
        this.updateStats()
        
      } catch (error) {
        this.addTestResult(false, `Erro ao chamar próximo: ${error.message}`)
      }
    },
    
    resetSystem() {
      try {
        this.systemStore.resetSystem()
        this.testResults = []
        this.testPatientCounter = 0
        this.addTestResult(true, 'Sistema resetado com sucesso')
        this.updateStats()
      } catch (error) {
        this.addTestResult(false, `Erro ao resetar sistema: ${error.message}`)
      }
    },
    
    addTestResult(success, message) {
      this.testResults.unshift({
        success,
        message,
        timestamp: new Date().toLocaleTimeString()
      })
      
      // Keep only last 10 results
      if (this.testResults.length > 10) {
        this.testResults = this.testResults.slice(0, 10)
      }
    }
  }
}
</script>