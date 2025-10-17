<template>
  <div class="space-y-6">
    <!-- Header with Add User Button -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-semibold text-gray-900">Gestão de Usuários</h2>
      <button
        @click="openUserModal()"
        class="bg-codenews-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Adicionar Usuário
      </button>
    </div>

    <!-- Users List -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Lista de Usuários</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perfil
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in adminStore.users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.username }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadgeClass(user.role)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ user.active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="openUserModal(user)"
                  class="text-codenews-blue hover:text-blue-700"
                >
                  Editar
                </button>
                <button
                  @click="toggleUserStatus(user)"
                  :class="user.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'"
                >
                  {{ user.active ? 'Desativar' : 'Ativar' }}
                </button>
                <button
                  @click="confirmDeleteUser(user)"
                  class="text-red-600 hover:text-red-700"
                  :disabled="user.id === currentUser?.id"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Modal -->
    <div v-if="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingUser ? 'Editar Usuário' : 'Adicionar Usuário' }}
          </h3>
          
          <form @submit.prevent="saveUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                v-model="userForm.name"
                type="text"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-codenews-blue focus:border-transparent',
                  userForm.errors?.name ? 'border-red-300' : 'border-gray-300'
                ]"
                placeholder="Nome completo"
                @blur="validateName"
              />
              <div v-if="userForm.errors?.name" class="text-red-600 text-sm mt-1">
                {{ userForm.errors.name }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <input
                v-model="userForm.username"
                type="text"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-codenews-blue focus:border-transparent',
                  userForm.errors?.username ? 'border-red-300' : 'border-gray-300'
                ]"
                placeholder="Nome de usuário"
                @blur="validateUsername"
              />
              <div v-if="userForm.errors?.username" class="text-red-600 text-sm mt-1">
                {{ userForm.errors.username }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                v-model="userForm.password"
                type="password"
                :required="!editingUser"
                :class="[
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-codenews-blue focus:border-transparent',
                  userForm.errors?.password ? 'border-red-300' : 'border-gray-300'
                ]"
                :placeholder="editingUser ? 'Deixe em branco para manter a senha atual' : 'Senha'"
                @blur="validatePassword"
              />
              <div v-if="userForm.errors?.password" class="text-red-600 text-sm mt-1">
                {{ userForm.errors.password }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select
                v-model="userForm.role"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-codenews-blue focus:border-transparent',
                  userForm.errors?.role ? 'border-red-300' : 'border-gray-300'
                ]"
                @change="validateRole"
              >
                <option value="">Selecione um perfil</option>
                <option value="admin">Administrador</option>
                <option value="reception">Acolhimento</option>
                <option value="triage">Triagem</option>
                <option value="care">Atendimento</option>
              </select>
              <div v-if="userForm.errors?.role" class="text-red-600 text-sm mt-1">
                {{ userForm.errors.role }}
              </div>
            </div>
            
            <div class="flex items-center">
              <input
                v-model="userForm.active"
                type="checkbox"
                id="userActive"
                class="h-4 w-4 text-codenews-blue focus:ring-codenews-blue border-gray-300 rounded"
              />
              <label for="userActive" class="ml-2 block text-sm text-gray-900">
                Usuário ativo
              </label>
            </div>

            <!-- Error Message -->
            <div v-if="userError" class="text-red-600 text-sm">
              {{ userError }}
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeUserModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-codenews-blue rounded-md hover:bg-blue-700"
              >
                {{ editingUser ? 'Salvar' : 'Adicionar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
          <p class="text-sm text-gray-500 mb-6">
            Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.name }}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          
          <div class="flex justify-center space-x-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              @click="deleteUser"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useAdminStore } from '../../stores/admin.js'
import { useAuthStore } from '../../stores/auth.js'
import { validateUsername, validatePassword, validatePatientName } from '../../utils/validation.js'
import { userNotifications, formNotifications } from '../../utils/notifications.js'
import { handleGenericError, logError } from '../../utils/errorHandler.js'

export default {
  name: 'UserManagement',
  setup() {
    const adminStore = useAdminStore()
    const authStore = useAuthStore()
    
    const showUserModal = ref(false)
    const showDeleteModal = ref(false)
    const editingUser = ref(null)
    const userToDelete = ref(null)
    const userError = ref('')
    
    const userForm = reactive({
      name: '',
      username: '',
      password: '',
      role: '',
      active: true,
      errors: {}
    })

    const currentUser = authStore.currentUser

    const openUserModal = (user = null) => {
      editingUser.value = user
      userError.value = ''
      
      if (user) {
        // Editing existing user
        userForm.name = user.name
        userForm.username = user.username
        userForm.password = ''
        userForm.role = user.role
        userForm.active = user.active
      } else {
        // Adding new user
        userForm.name = ''
        userForm.username = ''
        userForm.password = ''
        userForm.role = ''
        userForm.active = true
      }
      
      // Reset errors
      userForm.errors = {}
      
      showUserModal.value = true
    }

    const closeUserModal = () => {
      showUserModal.value = false
      editingUser.value = null
      userError.value = ''
      userForm.errors = {}
    }

    // Validation methods
    const validateName = () => {
      const error = validatePatientName(userForm.name)
      if (error) {
        userForm.errors.name = error
      } else {
        delete userForm.errors.name
      }
    }

    const validateUsernameField = () => {
      const error = validateUsername(userForm.username)
      if (error) {
        userForm.errors.username = error
      } else {
        // Check if username already exists (only for new users or when changing username)
        const existingUser = adminStore.users.find(u => 
          u.username === userForm.username && 
          (!editingUser.value || u.id !== editingUser.value.id)
        )
        if (existingUser) {
          userForm.errors.username = 'Nome de usuário já existe'
        } else {
          delete userForm.errors.username
        }
      }
    }

    const validatePasswordField = () => {
      const isRequired = !editingUser.value
      const error = validatePassword(userForm.password, isRequired)
      if (error) {
        userForm.errors.password = error
      } else {
        delete userForm.errors.password
      }
    }

    const validateRole = () => {
      if (!userForm.role) {
        userForm.errors.role = 'Selecione um perfil'
      } else {
        delete userForm.errors.role
      }
    }

    const validateForm = () => {
      validateName()
      validateUsernameField()
      validatePasswordField()
      validateRole()
      
      return Object.keys(userForm.errors).length === 0
    }

    const saveUser = async () => {
      try {
        userError.value = ''
        
        if (!validateForm()) {
          formNotifications.validationErrors(userForm.errors, 'usuário')
          return
        }
        
        if (editingUser.value) {
          // Update existing user
          const updateData = {
            name: userForm.name.trim(),
            username: userForm.username.trim(),
            role: userForm.role,
            active: userForm.active
          }
          
          // Only update password if provided
          if (userForm.password.trim()) {
            updateData.password = userForm.password
          }
          
          adminStore.updateUser(editingUser.value.id, updateData)
          userNotifications.updated(userForm.name)
        } else {
          // Create new user
          adminStore.createUser({
            name: userForm.name.trim(),
            username: userForm.username.trim(),
            password: userForm.password,
            role: userForm.role,
            active: userForm.active
          })
          userNotifications.created(userForm.name)
        }
        
        closeUserModal()
      } catch (error) {
        const handledError = handleGenericError(error, 'salvar usuário')
        logError(handledError, 'UserManagement.saveUser')
        userError.value = handledError.message
        formNotifications.saveError('usuário', handledError)
      }
    }

    const toggleUserStatus = async (user) => {
      try {
        adminStore.toggleUserStatus(user.id)
        const action = user.active ? 'desativado' : 'ativado'
        userNotifications.updated(`${user.name} foi ${action}`)
      } catch (error) {
        const handledError = handleGenericError(error, 'alterar status do usuário')
        logError(handledError, 'UserManagement.toggleUserStatus')
        userNotifications.permissionDenied('alterar status do usuário')
      }
    }

    const confirmDeleteUser = (user) => {
      userToDelete.value = user
      showDeleteModal.value = true
    }

    const deleteUser = async () => {
      try {
        const userName = userToDelete.value.name
        adminStore.deleteUser(userToDelete.value.id)
        userNotifications.deleted(userName)
        showDeleteModal.value = false
        userToDelete.value = null
      } catch (error) {
        const handledError = handleGenericError(error, 'excluir usuário')
        logError(handledError, 'UserManagement.deleteUser')
        userNotifications.permissionDenied('excluir usuário')
      }
    }

    const getRoleLabel = (role) => {
      const roleLabels = {
        admin: 'Administrador',
        reception: 'Acolhimento',
        triage: 'Triagem',
        care: 'Atendimento'
      }
      return roleLabels[role] || role
    }

    const getRoleBadgeClass = (role) => {
      const roleClasses = {
        admin: 'bg-purple-100 text-purple-800',
        reception: 'bg-blue-100 text-blue-800',
        triage: 'bg-yellow-100 text-yellow-800',
        care: 'bg-green-100 text-green-800'
      }
      return roleClasses[role] || 'bg-gray-100 text-gray-800'
    }

    return {
      adminStore,
      currentUser,
      showUserModal,
      showDeleteModal,
      editingUser,
      userToDelete,
      userError,
      userForm,
      openUserModal,
      closeUserModal,
      validateName,
      validateUsername: validateUsernameField,
      validatePassword: validatePasswordField,
      validateRole,
      saveUser,
      toggleUserStatus,
      confirmDeleteUser,
      deleteUser,
      getRoleLabel,
      getRoleBadgeClass
    }
  }
}
</script>