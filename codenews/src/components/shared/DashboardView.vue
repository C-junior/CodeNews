<template>
  <div class="space-y-6">
    <!-- Dashboard Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-semibold text-gray-900">Dashboard</h2>
      <button
        @click="refreshMetrics"
        class="bg-codenews-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Atualizar
      </button>
    </div>

    <!-- Main Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Patients Waiting -->
      <div class="bg-white overflow-hidden shadow-md rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Pacientes Aguardando
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ metrics.patientsWaiting }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Patients in Reception -->
      <div class="bg-white overflow-hidden shadow-md rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Em Acolhimento
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ metrics.patientsInReception }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Patients in Triage -->
      <div class="bg-white overflow-hidden shadow-md rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Em Triagem
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ metrics.patientsInTriage }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Patients in Care -->
      <div class="bg-white overflow-hidden shadow-md rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Em Atendimento
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ metrics.patientsInCare }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Completed -->
      <div class="bg-white overflow-hidden shadow-md rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Atendimentos Finalizados
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ metrics.totalCompleted }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Appointments -->
      <div class="bg-white overflow-hidden shadow-md rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total de Consultas
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ metrics.totalAppointments }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Queue Status -->
      <div class="bg-white overflow-hidden shadow-md rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Senhas Geradas
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ metrics.totalPasswordsGenerated || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Priority Distribution -->
      <div class="bg-white shadow-md rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Distribuição por Prioridade</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Normal</span>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.priority?.normal || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Preferencial</span>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.priority?.preferential || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Classification -->
      <div class="bg-white shadow-md rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Classificação de Risco</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-gray-600">Emergência</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.risk?.emergency || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-gray-600">Alto</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.risk?.high || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-gray-600">Médio</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.risk?.medium || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-gray-600">Baixo</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.risk?.low || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Outcomes and Users -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Outcomes Distribution -->
      <div class="bg-white shadow-md rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Desfechos dos Atendimentos</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Alta</span>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.outcomes?.discharge || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Encaminhamento</span>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.outcomes?.referral || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Internação</span>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.outcomes?.hospitalization || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Summary -->
      <div class="bg-white shadow-md rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Usuários do Sistema</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Total de Usuários</span>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.users?.total || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Usuários Ativos</span>
              <span class="text-sm font-semibold text-gray-900">{{ detailedMetrics.users?.active || 0 }}</span>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="text-xs font-medium text-gray-500 mb-2">Por Perfil:</div>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-gray-600">Administradores</span>
                  <span class="font-medium">{{ detailedMetrics.users?.byRole?.admin || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Acolhimento</span>
                  <span class="font-medium">{{ detailedMetrics.users?.byRole?.reception || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Triagem</span>
                  <span class="font-medium">{{ detailedMetrics.users?.byRole?.triage || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Atendimento</span>
                  <span class="font-medium">{{ detailedMetrics.users?.byRole?.care || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '../../stores/admin.js'

export default {
  name: 'DashboardView',
  setup() {
    const adminStore = useAdminStore()
    
    const metrics = computed(() => adminStore.currentMetrics)
    const detailedMetrics = ref({})

    const refreshMetrics = () => {
      adminStore.calculateMetrics()
      detailedMetrics.value = adminStore.getDetailedMetrics()
    }

    onMounted(() => {
      refreshMetrics()
      
      // Auto-refresh metrics every 30 seconds
      const interval = setInterval(refreshMetrics, 30000)
      
      // Cleanup interval on component unmount
      return () => clearInterval(interval)
    })

    return {
      adminStore,
      metrics,
      detailedMetrics,
      refreshMetrics
    }
  }
}
</script>