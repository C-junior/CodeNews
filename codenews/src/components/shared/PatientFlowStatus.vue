<template>
  <div v-if="flowStatus" class="bg-white rounded-lg shadow-md p-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Status do Fluxo</h3>
    
    <!-- Patient Info -->
    <div class="mb-4 p-3 bg-gray-50 rounded-lg">
      <div class="text-sm text-gray-600 mb-1">Paciente</div>
      <div class="font-semibold">{{ flowStatus.patient.name }}</div>
      <div class="text-sm text-gray-600">
        CID: {{ flowStatus.patient.cid || 'N/A' }} | 
        Prioridade: {{ flowStatus.patient.priority === 'preferential' ? 'Preferencial' : 'Normal' }}
      </div>
    </div>

    <!-- Flow Progress -->
    <div class="space-y-3">
      <!-- Password/Queue Status -->
      <div class="flex items-center space-x-3">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
          getStepStatus('password') === 'completed' ? 'bg-green-500 text-white' :
          getStepStatus('password') === 'current' ? 'bg-blue-500 text-white' :
          'bg-gray-300 text-gray-600'
        ]">
          1
        </div>
        <div class="flex-1">
          <div class="font-medium">Senha Gerada</div>
          <div class="text-sm text-gray-600">
            {{ flowStatus.password ? flowStatus.password.number : 'Não gerada' }}
            <span v-if="flowStatus.password && flowStatus.password.status === 'called'" class="text-blue-600 ml-2">
              (Chamada)
            </span>
          </div>
        </div>
      </div>

      <!-- Reception Status -->
      <div class="flex items-center space-x-3">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
          getStepStatus('reception') === 'completed' ? 'bg-green-500 text-white' :
          getStepStatus('reception') === 'current' ? 'bg-yellow-500 text-white' :
          'bg-gray-300 text-gray-600'
        ]">
          2
        </div>
        <div class="flex-1">
          <div class="font-medium">Acolhimento</div>
          <div class="text-sm text-gray-600">
            {{ getStepStatus('reception') === 'completed' ? 'Concluído' :
               getStepStatus('reception') === 'current' ? 'Em andamento' : 'Aguardando' }}
          </div>
        </div>
      </div>

      <!-- Triage Status -->
      <div class="flex items-center space-x-3">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
          getStepStatus('triage') === 'completed' ? 'bg-green-500 text-white' :
          getStepStatus('triage') === 'current' ? 'bg-orange-500 text-white' :
          'bg-gray-300 text-gray-600'
        ]">
          3
        </div>
        <div class="flex-1">
          <div class="font-medium">Triagem</div>
          <div class="text-sm text-gray-600">
            {{ getStepStatus('triage') === 'completed' ? 'Concluída' :
               getStepStatus('triage') === 'current' ? 'Em andamento' : 'Aguardando' }}
            <span v-if="flowStatus.triage && flowStatus.triage.riskClassification" :class="[
              'ml-2 px-2 py-1 rounded-full text-xs font-medium',
              getRiskClassColor(flowStatus.triage.riskClassification)
            ]">
              {{ getRiskClassLabel(flowStatus.triage.riskClassification) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Care Status -->
      <div class="flex items-center space-x-3">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
          getStepStatus('care') === 'completed' ? 'bg-green-500 text-white' :
          getStepStatus('care') === 'current' ? 'bg-purple-500 text-white' :
          'bg-gray-300 text-gray-600'
        ]">
          4
        </div>
        <div class="flex-1">
          <div class="font-medium">Atendimento Médico</div>
          <div class="text-sm text-gray-600">
            {{ getStepStatus('care') === 'completed' ? 'Concluído' :
               getStepStatus('care') === 'current' ? 'Em andamento' : 'Aguardando' }}
            <span v-if="flowStatus.appointment && flowStatus.appointment.outcome" class="ml-2 text-blue-600">
              ({{ getOutcomeLabel(flowStatus.appointment.outcome) }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Timestamps -->
    <div v-if="showTimestamps" class="mt-4 pt-3 border-t text-xs text-gray-500 space-y-1">
      <div v-if="flowStatus.patient.registeredAt">
        Cadastrado: {{ formatDateTime(flowStatus.patient.registeredAt) }}
      </div>
      <div v-if="flowStatus.password && flowStatus.password.calledAt">
        Chamado: {{ formatDateTime(flowStatus.password.calledAt) }}
      </div>
      <div v-if="flowStatus.triage && flowStatus.triage.createdAt">
        Triagem: {{ formatDateTime(flowStatus.triage.createdAt) }}
      </div>
      <div v-if="flowStatus.appointment && flowStatus.appointment.completedAt">
        Finalizado: {{ formatDateTime(flowStatus.appointment.completedAt) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PatientFlowStatus',
  
  props: {
    flowStatus: {
      type: Object,
      required: true
    },
    showTimestamps: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    getStepStatus(step) {
      if (!this.flowStatus || !this.flowStatus.patient) return 'pending'
      
      const currentStatus = this.flowStatus.patient.status
      
      switch (step) {
        case 'password':
          return this.flowStatus.password ? 'completed' : 'pending'
        
        case 'reception':
          if (currentStatus === 'reception') return 'current'
          if (['triage', 'care', 'completed'].includes(currentStatus)) return 'completed'
          return 'pending'
        
        case 'triage':
          if (currentStatus === 'triage') return 'current'
          if (['care', 'completed'].includes(currentStatus)) return 'completed'
          return 'pending'
        
        case 'care':
          if (currentStatus === 'care') return 'current'
          if (currentStatus === 'completed') return 'completed'
          return 'pending'
        
        default:
          return 'pending'
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
        'low': 'Baixo',
        'medium': 'Médio',
        'high': 'Alto',
        'emergency': 'Emergência'
      }
      return labels[riskClass] || labels.low
    },
    
    getOutcomeLabel(outcome) {
      const labels = {
        'discharge': 'Alta',
        'referral': 'Encaminhamento',
        'hospitalization': 'Internação'
      }
      return labels[outcome] || outcome
    },
    
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>