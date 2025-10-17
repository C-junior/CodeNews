<script setup>
import { RouterView } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from './stores/auth.js'
import { useAdminStore } from './stores/admin.js'
import { useSystemStore } from './stores/system.js'
import NotificationSystem from './components/shared/NotificationSystem.vue'
import ErrorBoundary from './components/shared/ErrorBoundary.vue'

// Initialize stores on app mount
onMounted(() => {
  const authStore = useAuthStore()
  const adminStore = useAdminStore()
  const systemStore = useSystemStore()

  // Load authentication state
  authStore.checkAuth()
  
  // Initialize admin store
  adminStore.initialize()
  
  // Initialize system integration and start synchronization
  systemStore.initialize()
})

// Cleanup on app unmount
onBeforeUnmount(() => {
  const systemStore = useSystemStore()
  systemStore.cleanup()
})
</script>

<template>
  <div id="app">
    <ErrorBoundary>
      <RouterView />
      <NotificationSystem />
    </ErrorBoundary>
  </div>
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
