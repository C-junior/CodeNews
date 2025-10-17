<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with Logo -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-3 lg:py-4">
        <div class="flex items-center">
          <div class="w-6 h-6 lg:w-8 lg:h-8 bg-codenews-blue rounded-lg mr-2 lg:mr-3"></div>
          <h1 class="text-lg lg:text-xl font-bold text-codenews-blue">CodeNews</h1>
          <span class="ml-2 text-xs lg:text-sm text-gray-600 hidden sm:inline">Sistema de Atendimento Médico</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-4 lg:py-8">
      <div class="transition-opacity duration-300">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
// Simple layout for login and patient modules
</script>