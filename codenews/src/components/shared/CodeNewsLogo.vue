<template>
  <div class="codenews-logo" :class="sizeClass">
    <img 
      src="/logo-codenews.png" 
      alt="CodeNews" 
      :class="imageClass"
      loading="lazy"
    />
    <span v-if="showText" class="logo-text">CodeNews</span>
  </div>
</template>

<script>
export default {
  name: 'CodeNewsLogo',
  props: {
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
    },
    showText: {
      type: Boolean,
      default: true
    },
    variant: {
      type: String,
      default: 'horizontal',
      validator: (value) => ['horizontal', 'vertical', 'icon-only'].includes(value)
    }
  },
  computed: {
    sizeClass() {
      const sizes = {
        small: 'logo-small',
        medium: 'logo-medium', 
        large: 'logo-large',
        xl: 'logo-xl'
      }
      return `logo-${this.variant} ${sizes[this.size]}`
    },
    imageClass() {
      return {
        'logo-image': true,
        'rounded-lg': this.size !== 'small'
      }
    }
  }
}
</script>

<style scoped>
.codenews-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-vertical {
  flex-direction: column;
  text-align: center;
  gap: 0.5rem;
}

.logo-icon-only {
  gap: 0;
}

.logo-icon-only .logo-text {
  display: none;
}

.logo-image {
  object-fit: contain;
  transition: transform 0.2s ease;
}

.logo-image:hover {
  transform: scale(1.05);
}

.logo-text {
  font-weight: 700;
  color: var(--codenews-primary);
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.025em;
}

/* Tamanhos */
.logo-small .logo-image {
  height: 24px;
  width: auto;
}

.logo-small .logo-text {
  font-size: 1rem;
}

.logo-medium .logo-image {
  height: 32px;
  width: auto;
}

.logo-medium .logo-text {
  font-size: 1.25rem;
}

.logo-large .logo-image {
  height: 48px;
  width: auto;
}

.logo-large .logo-text {
  font-size: 1.5rem;
}

.logo-xl .logo-image {
  height: 64px;
  width: auto;
}

.logo-xl .logo-text {
  font-size: 2rem;
}

/* Responsividade */
@media (max-width: 640px) {
  .logo-large .logo-image,
  .logo-xl .logo-image {
    height: 40px;
  }
  
  .logo-large .logo-text,
  .logo-xl .logo-text {
    font-size: 1.25rem;
  }
}
</style>