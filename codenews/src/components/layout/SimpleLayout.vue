<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with Logo and Navigation -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-3 lg:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-6 h-6 lg:w-8 lg:h-8 bg-codenews-blue rounded-lg mr-2 lg:mr-3"></div>
            <h1 class="text-lg lg:text-xl font-bold text-codenews-blue">CodeNews</h1>
            <span class="ml-2 text-xs lg:text-sm text-gray-600 hidden sm:inline">Sistema de Atendimento Médico</span>
          </div>
          
          <!-- Navigation Menu -->
          <nav class="flex items-center space-x-2 lg:space-x-4">
            <router-link
              to="/password-selection"
              class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-codenews-blue hover:bg-blue-50 rounded-lg transition-all duration-200"
              :class="{ 'text-codenews-blue bg-blue-50': $route.path === '/password-selection' }"
            >
              Gerar Senha
            </router-link>
            <router-link
              to="/panel"
              class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-codenews-blue hover:bg-blue-50 rounded-lg transition-all duration-200"
              :class="{ 'text-codenews-blue bg-blue-50': $route.path === '/panel' }"
            >
              Painel
            </router-link>
            <router-link
              to="/login"
              class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-codenews-blue hover:bg-blue-50 rounded-lg transition-all duration-200"
              :class="{ 'text-codenews-blue bg-blue-50': $route.path === '/login' }"
            >
              Sistema
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="transition-opacity duration-300">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// Simple layout for login and patient modules
</script>