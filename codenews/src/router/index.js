import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import SimpleLayout from '@/components/layout/SimpleLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/password-selection'
    },
    // Routes with simple layout (no sidebar)
    {
      path: '/login',
      name: 'login',
      component: SimpleLayout,
      children: [
        {
          path: '',
          component: () => import('../components/modules/LoginModule.vue')
        }
      ]
    },
    {
      path: '/patient',
      name: 'patient',
      component: SimpleLayout,
      children: [
        {
          path: '',
          component: () => import('../components/modules/PatientModule.vue')
        }
      ]
    },
    {
      path: '/password-selection',
      name: 'password-selection',
      component: SimpleLayout,
      children: [
        {
          path: '',
          component: () => import('../components/modules/PasswordSelection.vue')
        }
      ]
    },
    {
      path: '/panel',
      name: 'panel',
      component: SimpleLayout,
      children: [
        {
          path: '',
          component: () => import('../components/modules/CallPanel.vue')
        }
      ]
    },
    // Routes with app layout (with sidebar navigation)
    {
      path: '/reception',
      name: 'reception',
      component: AppLayout,
      meta: { requiresAuth: true, role: 'reception' },
      children: [
        {
          path: '',
          component: () => import('../components/modules/ReceptionModule.vue')
        }
      ]
    },
    {
      path: '/triage',
      name: 'triage',
      component: AppLayout,
      meta: { requiresAuth: true, role: 'triage' },
      children: [
        {
          path: '',
          component: () => import('../components/modules/TriageModule.vue')
        }
      ]
    },
    {
      path: '/care',
      name: 'care',
      component: AppLayout,
      meta: { requiresAuth: true, role: 'care' },
      children: [
        {
          path: '',
          component: () => import('../components/modules/CareModule.vue')
        }
      ]
    },
    {
      path: '/admin',
      name: 'admin',
      component: AppLayout,
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          component: () => import('../components/modules/AdminModule.vue')
        }
      ]
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check authentication status from localStorage
  authStore.checkAuth()
  
  // If going to login and already authenticated, redirect to appropriate module
  if (to.name === 'login' && authStore.isAuthenticated) {
    const userRole = authStore.currentUser?.role
    switch (userRole) {
      case 'admin':
        next('/admin')
        break
      case 'reception':
        next('/reception')
        break
      case 'triage':
        next('/triage')
        break
      case 'care':
        next('/care')
        break
      default:
        next('/admin')
    }
    return
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Not authenticated, redirect to login
      next('/login')
      return
    }
    
    // Check role-based access
    if (to.meta.role) {
      const userRole = authStore.currentUser?.role
      
      // Admin can access all routes
      if (userRole === 'admin') {
        next()
        return
      }
      
      // Check if user has the required role
      if (userRole !== to.meta.role) {
        // User doesn't have permission, redirect to their appropriate module
        switch (userRole) {
          case 'reception':
            next('/reception')
            break
          case 'triage':
            next('/triage')
            break
          case 'care':
            next('/care')
            break
          default:
            next('/login')
        }
        return
      }
    }
  }
  
  // All checks passed, proceed to route
  next()
})

export default router