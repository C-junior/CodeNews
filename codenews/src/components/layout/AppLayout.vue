<template>
  <div class="min-h-screen bg-neutral-50 flex">
    <!-- Mobile Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="closeMobileMenu"
    ></div>

    <!-- Sidebar Navigation -->
    <div :class="[
      'bg-white shadow-lg transition-transform duration-300 ease-in-out z-50',
      'lg:relative lg:translate-x-0',
      isMobileMenuOpen 
        ? 'fixed inset-y-0 left-0 w-64 translate-x-0' 
        : 'fixed inset-y-0 left-0 w-64 -translate-x-full lg:w-64'
    ]">
      <div class="p-4 lg:p-6 h-full overflow-y-auto">
        <!-- Mobile Close Button -->
        <div class="flex justify-between items-center mb-6 lg:mb-8">
          <CodeNewsLogo :size="isMobile ? 'small' : 'medium'" />
          <button 
            @click="closeMobileMenu"
            class="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-600"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- User Info -->
        <div class="mb-6 lg:mb-8 p-3 lg:p-4 bg-neutral-50 rounded-lg">
          <div class="text-xs lg:text-sm text-neutral-600">Usuário</div>
          <div class="font-medium text-sm lg:text-base truncate">{{ authStore.currentUser?.name || authStore.currentUser?.username }}</div>
          <div class="text-xs text-neutral-500 capitalize">{{ getRoleLabel(authStore.currentUser?.role) }}</div>
        </div>

        <!-- Navigation Menu -->
        <nav class="space-y-1 lg:space-y-2">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            @click="closeMobileMenu"
            :class="[
              'flex items-center px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium rounded-lg transition-all duration-200',
              $route.path === item.path
                ? 'bg-primary text-white shadow-md'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </router-link>
        </nav>

        <!-- Logout Button -->
        <div class="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-neutral-200">
          <button
            @click="handleLogout"
            class="flex items-center w-full px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
          >
            <LogoutIcon class="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span class="truncate">Sair</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar with Breadcrumbs -->
      <header class="bg-white shadow-sm border-b border-neutral-200">
        <div class="px-4 lg:px-6 py-3 lg:py-4">
          <div class="flex items-center justify-between">
            <!-- Mobile Menu Button -->
            <button 
              @click="openMobileMenu"
              class="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <Bars3Icon class="w-5 h-5" />
            </button>

            <!-- Breadcrumbs -->
            <nav class="flex items-center space-x-2 text-sm text-neutral-600">
              <router-link to="/" class="hover:text-primary transition-colors hidden sm:block">Início</router-link>
              <ChevronRightIcon class="w-4 h-4 hidden sm:block" />
              <span class="text-neutral-900 font-medium">{{ currentModuleLabel }}</span>
            </nav>

            <!-- User info for mobile -->
            <div class="lg:hidden text-xs text-neutral-600">
              {{ authStore.currentUser?.name || authStore.currentUser?.username }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <div class="transition-opacity duration-300" :class="{ 'opacity-50': isLoading }">
          <router-view />
        </div>
        
        <!-- Global Loading Overlay -->
        <LoadingSpinner 
          v-if="isLoading" 
          :show="isLoading" 
          :overlay="true" 
          :text="loadingText"
          size="large"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import CodeNewsLogo from '@/components/shared/CodeNewsLogo.vue'

// Icons (using simple SVG icons for now)

const UsersIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>`
}

const ClipboardIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>`
}

const HeartIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>`
}

const CogIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
}

const LogoutIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`
}

const ChevronRightIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`
}

const XMarkIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
}

const Bars3Icon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`
}

const router = useRouter()
const authStore = useAuthStore()

// Mobile menu state
const isMobileMenuOpen = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const isMobile = computed(() => window.innerWidth < 1024)

// Mobile menu functions
const openMobileMenu = () => {
  isMobileMenuOpen.value = true
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Close mobile menu on route change
router.afterEach(() => {
  closeMobileMenu()
})

// Close mobile menu on window resize to desktop
const handleResize = () => {
  if (window.innerWidth >= 1024) { // lg breakpoint
    closeMobileMenu()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Navigation items based on user role
const navigationItems = computed(() => {
  const userRole = authStore.currentUser?.role
  const items = []

  // Admin can access all modules
  if (userRole === 'admin') {
    items.push(
      { path: '/admin', label: 'Administração', icon: CogIcon },
      { path: '/reception', label: 'Acolhimento', icon: UsersIcon },
      { path: '/triage', label: 'Triagem', icon: ClipboardIcon },
      { path: '/care', label: 'Atendimento', icon: HeartIcon }
    )
  } else {
    // Role-specific navigation
    switch (userRole) {
      case 'reception':
        items.push({ path: '/reception', label: 'Acolhimento', icon: UsersIcon })
        break
      case 'triage':
        items.push({ path: '/triage', label: 'Triagem', icon: ClipboardIcon })
        break
      case 'care':
        items.push({ path: '/care', label: 'Atendimento', icon: HeartIcon })
        break
    }
  }

  return items
})

// Current module label for breadcrumbs
const currentModuleLabel = computed(() => {
  const currentPath = router.currentRoute.value.path
  const moduleLabels = {
    '/admin': 'Administração',
    '/reception': 'Acolhimento',
    '/triage': 'Triagem',
    '/care': 'Atendimento Médico'
  }
  return moduleLabels[currentPath] || 'Sistema'
})

// Role label helper
const getRoleLabel = (role) => {
  const roleLabels = {
    'admin': 'Administrador',
    'reception': 'Acolhimento',
    'triage': 'Triagem',
    'care': 'Médico'
  }
  return roleLabels[role] || role
}

// Logout handler
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>