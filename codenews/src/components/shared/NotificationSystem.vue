<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
          getNotificationClasses(notification.type)
        ]"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="getIcon(notification.type)" :class="getIconClasses(notification.type)" />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p :class="['text-sm font-medium', getTitleClasses(notification.type)]">
                {{ notification.title }}
              </p>
              <p v-if="notification.message" :class="['mt-1 text-sm', getMessageClasses(notification.type)]">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                :class="[
                  'bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  getFocusClasses(notification.type)
                ]"
              >
                <span class="sr-only">Fechar</span>
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

// Simple icons as inline SVG components
const CheckCircleIcon = {
  template: `
    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const ExclamationTriangleIcon = {
  template: `
    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  `
}

const XCircleIcon = {
  template: `
    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const InformationCircleIcon = {
  template: `
    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  `
}

const XMarkIcon = {
  template: `
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `
}

export default {
  name: 'NotificationSystem',
  components: {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    XMarkIcon
  },
  setup() {
    const notifications = ref([])
    let notificationId = 0

    const addNotification = (notification) => {
      const id = ++notificationId
      const newNotification = {
        id,
        type: notification.type || 'info',
        title: notification.title || 'Notificação',
        message: notification.message || '',
        duration: notification.duration || 5000,
        persistent: notification.persistent || false
      }

      notifications.value.push(newNotification)

      // Auto-remove after duration (unless persistent)
      if (!newNotification.persistent && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, newNotification.duration)
      }

      return id
    }

    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    }

    const clearAll = () => {
      notifications.value = []
    }

    // Notification type helpers
    const showSuccess = (title, message, options = {}) => {
      return addNotification({ type: 'success', title, message, ...options })
    }

    const showError = (title, message, options = {}) => {
      return addNotification({ type: 'error', title, message, duration: 8000, ...options })
    }

    const showWarning = (title, message, options = {}) => {
      return addNotification({ type: 'warning', title, message, duration: 6000, ...options })
    }

    const showInfo = (title, message, options = {}) => {
      return addNotification({ type: 'info', title, message, ...options })
    }

    // Style helpers
    const getNotificationClasses = (type) => {
      const classes = {
        success: 'border-l-4 border-green-400',
        error: 'border-l-4 border-red-400',
        warning: 'border-l-4 border-yellow-400',
        info: 'border-l-4 border-blue-400'
      }
      return classes[type] || classes.info
    }

    const getIcon = (type) => {
      const icons = {
        success: 'CheckCircleIcon',
        error: 'XCircleIcon',
        warning: 'ExclamationTriangleIcon',
        info: 'InformationCircleIcon'
      }
      return icons[type] || icons.info
    }

    const getIconClasses = (type) => {
      const classes = {
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400'
      }
      return classes[type] || classes.info
    }

    const getTitleClasses = (type) => {
      const classes = {
        success: 'text-green-800',
        error: 'text-red-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800'
      }
      return classes[type] || classes.info
    }

    const getMessageClasses = (type) => {
      const classes = {
        success: 'text-green-700',
        error: 'text-red-700',
        warning: 'text-yellow-700',
        info: 'text-blue-700'
      }
      return classes[type] || classes.info
    }

    const getFocusClasses = (type) => {
      const classes = {
        success: 'focus:ring-green-500',
        error: 'focus:ring-red-500',
        warning: 'focus:ring-yellow-500',
        info: 'focus:ring-blue-500'
      }
      return classes[type] || classes.info
    }

    // Global event listeners for notifications
    const handleGlobalNotification = (event) => {
      addNotification(event.detail)
    }

    onMounted(() => {
      window.addEventListener('codenews-notification', handleGlobalNotification)
      
      // Expose notification methods globally
      window.CodeNewsNotifications = {
        success: showSuccess,
        error: showError,
        warning: showWarning,
        info: showInfo,
        clear: clearAll
      }
    })

    onUnmounted(() => {
      window.removeEventListener('codenews-notification', handleGlobalNotification)
      delete window.CodeNewsNotifications
    })

    return {
      notifications,
      addNotification,
      removeNotification,
      clearAll,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      getNotificationClasses,
      getIcon,
      getIconClasses,
      getTitleClasses,
      getMessageClasses,
      getFocusClasses
    }
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>