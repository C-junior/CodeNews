/**
 * Global notification utilities for CodeNews system
 * Provides easy-to-use notification functions throughout the app
 */

/**
 * Dispatches a custom notification event
 */
function dispatchNotification(notification) {
  const event = new CustomEvent('codenews-notification', {
    detail: notification
  })
  window.dispatchEvent(event)
}

/**
 * Shows a success notification
 */
export function notifySuccess(title, message = '', options = {}) {
  dispatchNotification({
    type: 'success',
    title,
    message,
    ...options
  })
}

/**
 * Shows an error notification
 */
export function notifyError(title, message = '', options = {}) {
  dispatchNotification({
    type: 'error',
    title,
    message,
    duration: 8000, // Errors stay longer
    ...options
  })
}

/**
 * Shows a warning notification
 */
export function notifyWarning(title, message = '', options = {}) {
  dispatchNotification({
    type: 'warning',
    title,
    message,
    duration: 6000,
    ...options
  })
}

/**
 * Shows an info notification
 */
export function notifyInfo(title, message = '', options = {}) {
  dispatchNotification({
    type: 'info',
    title,
    message,
    ...options
  })
}

/**
 * Shows a validation error notification
 */
export function notifyValidationError(errors) {
  const errorCount = Object.keys(errors).length
  const title = errorCount === 1 ? 'Erro de validação' : 'Erros de validação'
  const message = errorCount === 1 
    ? 'Corrija o erro no formulário'
    : `Corrija os ${errorCount} erros no formulário`
  
  notifyError(title, message, { duration: 6000 })
}

/**
 * Shows a save success notification
 */
export function notifySaveSuccess(itemName = 'item') {
  notifySuccess('Salvo com sucesso', `${itemName} foi salvo com sucesso`)
}

/**
 * Shows a delete success notification
 */
export function notifyDeleteSuccess(itemName = 'item') {
  notifySuccess('Excluído com sucesso', `${itemName} foi excluído com sucesso`)
}

/**
 * Shows a generic operation success notification
 */
export function notifyOperationSuccess(operation, itemName = '') {
  const message = itemName ? `${itemName} ${operation} com sucesso` : `${operation} realizada com sucesso`
  notifySuccess('Operação concluída', message)
}

/**
 * Shows a network error notification
 */
export function notifyNetworkError() {
  notifyError(
    'Erro de conexão',
    'Verifique sua conexão com a internet e tente novamente',
    { duration: 10000 }
  )
}

/**
 * Shows a storage error notification
 */
export function notifyStorageError() {
  notifyError(
    'Erro de armazenamento',
    'Não foi possível salvar os dados. Verifique o espaço disponível.',
    { duration: 10000 }
  )
}

/**
 * Shows a permission error notification
 */
export function notifyPermissionError(action = 'realizar esta ação') {
  notifyError(
    'Acesso negado',
    `Você não tem permissão para ${action}`,
    { duration: 8000 }
  )
}

/**
 * Shows a data not found notification
 */
export function notifyNotFound(itemName = 'item') {
  notifyWarning(
    'Não encontrado',
    `${itemName} não foi encontrado`,
    { duration: 6000 }
  )
}

/**
 * Shows a loading notification (persistent until manually removed)
 */
export function notifyLoading(title, message = 'Aguarde...') {
  return dispatchNotification({
    type: 'info',
    title,
    message,
    persistent: true,
    duration: 0
  })
}

/**
 * Clears all notifications
 */
export function clearAllNotifications() {
  if (window.CodeNewsNotifications) {
    window.CodeNewsNotifications.clear()
  }
}

/**
 * Notification helper for form operations
 */
export const formNotifications = {
  /**
   * Shows validation errors for a form
   */
  validationErrors(errors, formName = 'formulário') {
    const errorMessages = Object.values(errors).filter(Boolean)
    if (errorMessages.length === 0) return
    
    const title = `Erro no ${formName}`
    const message = errorMessages.length === 1 
      ? errorMessages[0]
      : `${errorMessages.length} erros encontrados`
    
    notifyError(title, message, { duration: 6000 })
  },
  
  /**
   * Shows save success for a form
   */
  saveSuccess(formName = 'formulário') {
    notifySuccess('Salvo com sucesso', `${formName} foi salvo com sucesso`)
  },
  
  /**
   * Shows save error for a form
   */
  saveError(formName = 'formulário', error = null) {
    const message = error ? error.message : `Erro ao salvar ${formName}`
    notifyError('Erro ao salvar', message, { duration: 8000 })
  }
}

/**
 * Notification helper for patient operations
 */
export const patientNotifications = {
  registered(patientName) {
    notifySuccess('Paciente cadastrado', `${patientName} foi cadastrado com sucesso`)
  },
  
  updated(patientName) {
    notifySuccess('Paciente atualizado', `Dados de ${patientName} foram atualizados`)
  },
  
  deleted(patientName) {
    notifySuccess('Paciente excluído', `${patientName} foi excluído do sistema`)
  },
  
  statusChanged(patientName, newStatus) {
    const statusLabels = {
      waiting: 'aguardando',
      reception: 'acolhimento',
      triage: 'triagem',
      care: 'atendimento',
      completed: 'concluído'
    }
    
    const statusLabel = statusLabels[newStatus] || newStatus
    notifyInfo('Status atualizado', `${patientName} está agora em ${statusLabel}`)
  },
  
  notFound(patientId) {
    notifyWarning('Paciente não encontrado', `Paciente com ID ${patientId} não foi encontrado`)
  }
}

/**
 * Notification helper for user operations
 */
export const userNotifications = {
  loginSuccess(userName) {
    notifySuccess('Login realizado', `Bem-vindo, ${userName}!`)
  },
  
  loginError() {
    notifyError('Erro de login', 'Credenciais inválidas. Verifique usuário e senha.')
  },
  
  logoutSuccess() {
    notifyInfo('Logout realizado', 'Você foi desconectado com sucesso')
  },
  
  created(userName) {
    notifySuccess('Usuário criado', `Usuário ${userName} foi criado com sucesso`)
  },
  
  updated(userName) {
    notifySuccess('Usuário atualizado', `Dados de ${userName} foram atualizados`)
  },
  
  deleted(userName) {
    notifySuccess('Usuário excluído', `Usuário ${userName} foi excluído`)
  },
  
  permissionDenied(action) {
    notifyPermissionError(action)
  }
}

/**
 * Notification helper for medical operations
 */
export const medicalNotifications = {
  triageCompleted(patientName, riskLevel) {
    const riskLabels = {
      low: 'Baixo Risco',
      medium: 'Risco Médio',
      high: 'Alto Risco',
      emergency: 'Emergência'
    }
    
    const riskLabel = riskLabels[riskLevel] || riskLevel
    notifySuccess(
      'Triagem concluída',
      `Triagem de ${patientName} concluída - ${riskLabel}`
    )
  },
  
  careCompleted(patientName, outcome) {
    const outcomeLabels = {
      discharge: 'Alta médica',
      referral: 'Encaminhamento',
      hospitalization: 'Internação'
    }
    
    const outcomeLabel = outcomeLabels[outcome] || outcome
    notifySuccess(
      'Atendimento concluído',
      `${patientName} - ${outcomeLabel}`
    )
  },
  
  passwordCalled(passwordNumber) {
    notifyInfo('Senha chamada', `Senha ${passwordNumber} foi chamada`)
  }
}

/**
 * Notification helper for system operations
 */
export const systemNotifications = {
  dataLoaded() {
    notifyInfo('Dados carregados', 'Sistema atualizado com sucesso')
  },
  
  dataLoadError() {
    notifyError('Erro ao carregar dados', 'Não foi possível carregar os dados do sistema')
  },
  
  backupCreated() {
    notifySuccess('Backup criado', 'Backup dos dados foi criado com sucesso')
  },
  
  dataRestored() {
    notifySuccess('Dados restaurados', 'Dados foram restaurados com sucesso')
  }
}