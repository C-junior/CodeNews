<template>
  <div>
    <h1 class="text-3xl font-bold text-codenews-blue mb-8">
      Módulo Administrativo
    </h1>

    <!-- Navigation Tabs -->
    <div class="mb-8">
      <nav class="flex space-x-8">
        <button
          @click="activeTab = 'dashboard'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'dashboard'
              ? 'border-codenews-blue text-codenews-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Dashboard
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'users'
              ? 'border-codenews-blue text-codenews-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Gestão de Usuários
        </button>
        <button
          @click="activeTab = 'system'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'system'
              ? 'border-codenews-blue text-codenews-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Sistema
        </button>
      </nav>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <DashboardView />
    </div>

    <!-- Users Management Tab -->
    <div v-if="activeTab === 'users'" class="space-y-6">
      <UserManagement />
    </div>

    <!-- System Integration Tab -->
    <div v-if="activeTab === 'system'" class="space-y-6">
      <SystemIntegrationTest />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin.js'
import DashboardView from '../shared/DashboardView.vue'
import SystemIntegrationTest from '../shared/SystemIntegrationTest.vue'
import UserManagement from '../shared/UserManagement.vue'

export default {
  name: 'AdminModule',
  components: {
    DashboardView,
    UserManagement,
    SystemIntegrationTest
  },
  setup() {
    const adminStore = useAdminStore()
    const activeTab = ref('dashboard')

    onMounted(() => {
      // Initialize admin store
      adminStore.initialize()
    })

    return {
      activeTab,
      adminStore
    }
  }
}
</script>