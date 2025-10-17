<template>
  <div v-if="show" :class="containerClasses">
    <div class="flex flex-col items-center justify-center space-y-4">
      <!-- Spinner -->
      <div :class="spinnerClasses">
        <svg class="animate-spin h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </div>
      
      <!-- Loading Text -->
      <div v-if="text" :class="textClasses">
        {{ text }}
      </div>
      
      <!-- Progress Bar (optional) -->
      <div v-if="showProgress && progress !== null" class="w-full max-w-xs">
        <div class="bg-gray-200 rounded-full h-2">
          <div 
            class="bg-codenews-blue h-2 rounded-full transition-all duration-300"
            :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
          ></div>
        </div>
        <div class="text-xs text-gray-500 mt-1 text-center">
          {{ Math.round(progress) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    overlay: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: null,
      validator: (value) => value === null || (value >= 0 && value <= 100)
    },
    showProgress: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerClasses() {
      const base = 'flex items-center justify-center'
      
      if (this.overlay) {
        return `${base} fixed inset-0 bg-black bg-opacity-50 z-50`
      }
      
      return `${base} p-4`
    },
    
    spinnerClasses() {
      const base = 'text-codenews-blue'
      
      const sizes = {
        small: 'h-6 w-6',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
      }
      
      return `${base} ${sizes[this.size]}`
    },
    
    textClasses() {
      const base = 'text-gray-600 font-medium'
      
      const sizes = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg'
      }
      
      return `${base} ${sizes[this.size]}`
    }
  }
}
</script>

<style scoped>
/* Ensure overlay covers everything */
.fixed.inset-0 {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* Smooth animation for progress bar */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>