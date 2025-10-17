# Documento de Design - Sistema de Atendimento Médico

## Visão Geral

O sistema "CodeNews" será desenvolvido como uma Single Page Application (SPA) em Vue.js 3 com JavaScript vanilla. A arquitetura prioriza simplicidade e funcionalidade, utilizando armazenamento local para dados e estado reativo do Vue para gerenciamento de interface.

## Arquitetura

### Estrutura Geral
- **Frontend**: Vue.js 3 com Composition API
- **Build Tool**: Vite para desenvolvimento e build
- **Roteamento**: Vue Router para navegação entre módulos
- **Estado**: Pinia para gerenciamento de estado global
- **Armazenamento**: LocalStorage para persistência de dados
- **Estilização**: Tailwind CSS para estilização rápida e consistente

### Fluxo de Dados
```
Componentes Vue ↔ Stores (Pinia) ↔ LocalStorage
```

## Componentes e Interfaces

### 1. Estrutura de Componentes

#### Componentes de Layout
- `AppLayout.vue` - Layout principal com navegação
- `LoginLayout.vue` - Layout para tela de login
- `PatientLayout.vue` - Layout para módulo do paciente

#### Componentes de Módulos
- `LoginModule.vue` - Autenticação
- `PatientModule.vue` - Emissão de senhas e painel
- `ReceptionModule.vue` - Acolhimento
- `TriageModule.vue` - Triagem
- `CareModule.vue` - Atendimento médico
- `AdminModule.vue` - Gestão e dashboard

#### Componentes Compartilhados
- `QueuePanel.vue` - Painel de chamadas
- `PatientForm.vue` - Formulário de cadastro
- `UserForm.vue` - Formulário de usuários
- `Dashboard.vue` - Métricas básicas

### 2. Roteamento

```javascript
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginModule },
  { path: '/patient', component: PatientModule },
  { path: '/reception', component: ReceptionModule, meta: { requiresAuth: true, role: 'reception' } },
  { path: '/triage', component: TriageModule, meta: { requiresAuth: true, role: 'triage' } },
  { path: '/care', component: CareModule, meta: { requiresAuth: true, role: 'care' } },
  { path: '/admin', component: AdminModule, meta: { requiresAuth: true, role: 'admin' } }
]
```

## Modelos de Dados

### 1. Usuário
```javascript
{
  id: String,
  username: String,
  password: String, // Hash simples
  role: String, // 'reception', 'triage', 'care', 'admin'
  name: String,
  active: Boolean
}
```

### 2. Paciente
```javascript
{
  id: String,
  name: String,
  cid: String, // Código CID para classificação de risco
  priority: String, // 'normal', 'preferential'
  registeredAt: Date,
  status: String // 'waiting', 'reception', 'triage', 'care', 'completed'
}
```

### 3. Senha
```javascript
{
  id: String,
  number: String, // Formato: P001, N001
  patientId: String,
  priority: String,
  status: String, // 'waiting', 'called', 'completed'
  createdAt: Date,
  calledAt: Date
}
```

### 4. Triagem
```javascript
{
  id: String,
  patientId: String,
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number
  },
  riskClassification: String, // Baseado no CID: 'low', 'medium', 'high', 'emergency'
  notes: String,
  createdAt: Date
}
```

### 5. Atendimento
```javascript
{
  id: String,
  patientId: String,
  diagnosis: String,
  outcome: String, // 'discharge', 'referral', 'hospitalization'
  notes: String,
  createdAt: Date,
  completedAt: Date
}
```

## Gerenciamento de Estado

### Stores (Pinia)

#### 1. AuthStore
```javascript
{
  state: {
    currentUser: null,
    isAuthenticated: false
  },
  actions: {
    login(username, password),
    logout(),
    checkAuth()
  }
}
```

#### 2. QueueStore
```javascript
{
  state: {
    passwords: [],
    currentPassword: null,
    queue: []
  },
  actions: {
    generatePassword(priority),
    callNext(),
    updatePasswordStatus()
  }
}
```

#### 3. PatientStore
```javascript
{
  state: {
    patients: [],
    currentPatient: null
  },
  actions: {
    registerPatient(data),
    updatePatient(id, data),
    getPatientsByStatus(status)
  }
}
```

#### 4. TriageStore
```javascript
{
  state: {
    triages: []
  },
  actions: {
    createTriage(data),
    updateTriage(id, data)
  }
}
```

#### 5. CareStore
```javascript
{
  state: {
    appointments: []
  },
  actions: {
    createAppointment(data),
    completeAppointment(id, data)
  }
}
```

## Tratamento de Erros

### Estratégias de Erro
1. **Validação de Formulários**: Validação client-side com feedback visual
2. **Erros de Autenticação**: Mensagens claras na tela de login
3. **Dados Não Encontrados**: Fallbacks e mensagens informativas
4. **Armazenamento Local**: Verificação de disponibilidade e limites

### Implementação
- Try-catch em operações críticas
- Toast notifications para feedback ao usuário
- Estados de loading durante operações
- Validação de dados antes de armazenamento

## Estratégia de Testes

Como especificado, o sistema não incluirá testes automatizados. O foco será em:
- Validação manual durante desenvolvimento
- Testes de usabilidade básicos
- Verificação de fluxos principais

## Interface do Usuário

### 1. Design System CodeNews
- **Paleta de Cores**: 
  - Azul primário: #1E40AF (baseado na imagem)
  - Verde secundário: #16A34A (baseado na imagem)
  - Branco: #FFFFFF
  - Cinza claro: #F8FAFC
- **Tipografia**: Tailwind CSS default (Inter/system fonts)
- **Ícones**: Heroicons ou similar
- **Layout**: Responsivo com Tailwind CSS classes

### 2. Componentes de UI (Tailwind CSS)
- **Botões**: Classes Tailwind com variações de cor (blue-600, green-600)
- **Formulários**: Inputs com border-gray-300, focus:border-blue-500
- **Cards**: bg-white shadow-md rounded-lg
- **Tabelas**: Striped com hover effects
- **Modais**: Overlay com backdrop-blur

### 3. Navegação
- Menu lateral para módulos (usuários autenticados)
- Breadcrumbs para orientação
- Botões de ação contextuais
- Logout visível em todas as telas

## Fluxo de Telas

### 1. Fluxo de Autenticação
```
Login → Verificação de Credenciais → Redirecionamento por Perfil
```

### 2. Fluxo do Paciente
```
Seleção de Prioridade → Geração de Senha → Visualização do Painel
```

### 3. Fluxo de Acolhimento
```
Visualização da Fila → Chamada do Próximo → Cadastro (se necessário) → Encaminhamento
```

### 4. Fluxo de Triagem
```
Lista de Pacientes → Seleção → Registro de Sinais Vitais → Classificação de Risco → Encaminhamento
```

### 5. Fluxo de Atendimento
```
Lista de Pacientes Triados → Seleção → Visualização da Triagem → Registro de Diagnóstico → Finalização
```

## Considerações de Performance

### Otimizações Básicas
- Lazy loading de componentes por rota
- Computed properties para dados derivados
- Debounce em campos de busca
- Paginação em listas grandes
- Cleanup de watchers e listeners

### Limitações do LocalStorage
- Limite de ~5MB por domínio
- Estratégia de limpeza de dados antigos
- Backup/restore de dados críticos
- Monitoramento de uso de espaço
## C
onfiguração do Projeto

### 1. Estrutura de Arquivos
```
codenews/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── modules/
│   │   └── shared/
│   ├── stores/
│   ├── router/
│   ├── assets/
│   ├── styles/
│   └── main.js
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### 2. Dependências Principais
```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "@vitejs/plugin-vue": "^4.3.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 3. Configuração Tailwind
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        'codenews-blue': '#1E40AF',
        'codenews-green': '#16A34A'
      }
    }
  }
}
```

## Cadastro Simplificado de Paciente

### Formulário MVP
```javascript
// PatientForm.vue
{
  name: String, // Nome completo do paciente
  cid: String   // Código CID para classificação automática de risco
}
```

### Classificação de Risco por CID
- **Emergency (Vermelho)**: CIDs críticos (ex: I21 - Infarto)
- **High (Laranja)**: CIDs de alta prioridade
- **Medium (Amarelo)**: CIDs de prioridade média
- **Low (Verde)**: CIDs de baixa prioridade
- **Default**: Classificação manual se CID não mapeado