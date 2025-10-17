# Sistema de Senhas - CodeNews

## Fluxo Implementado

O sistema agora possui duas telas principais para o fluxo de senhas:

### 1. Tela de Seleção de Senha (`/password-selection`)
- Interface simples e intuitiva para o paciente
- Duas opções de prioridade:
  - **Normal**: Atendimento por ordem de chegada
  - **Preferencial**: Para idosos, gestantes, deficientes
- Geração automática de senha com numeração sequencial
- Modal de confirmação com a senha gerada

### 2. Tela de Painel/Telão (`/panel`)
- Painel em tela cheia para exibição pública
- Mostra a senha atual sendo chamada em destaque
- Lista das próximas 5 senhas na fila
- Estatísticas em tempo real
- Atualização automática a cada 3 segundos
- Botão para chamar próxima senha (simulação)

## Como Usar

### Para Pacientes:
1. Acesse `/password-selection`
2. Escolha entre atendimento Normal ou Preferencial
3. Clique em "Gerar Senha"
4. Anote sua senha e acompanhe o painel

### Para Operadores:
1. Acesse `/panel` para visualizar o painel de chamadas
2. Use o botão "Chamar Próxima Senha" para avançar na fila
3. O sistema prioriza automaticamente senhas preferenciais

## Funcionalidades

### Sistema de Prioridades
- Senhas preferenciais (P001, P002...) têm prioridade sobre normais
- Senhas normais (N001, N002...) são chamadas por ordem de chegada
- Algoritmo inteligente de ordenação da fila

### Persistência de Dados
- Dados salvos no localStorage do navegador
- Sincronização automática entre abas
- Recuperação de estado ao recarregar a página

### Interface Responsiva
- Funciona em dispositivos móveis e desktop
- Tela de seleção otimizada para touch
- Painel otimizado para exibição em TVs/monitores grandes

### Navegação
- Menu superior para alternar entre telas
- Botões de ação contextuais
- Rotas diretas para cada funcionalidade

## Rotas Disponíveis

- `/` - Redireciona para seleção de senha
- `/password-selection` - Tela de geração de senhas
- `/panel` - Painel de chamadas (telão)
- `/login` - Acesso ao sistema completo
- `/patient` - Módulo original do paciente (mantido)

## Tecnologias

- Vue.js 3 com Composition API
- Pinia para gerenciamento de estado
- Tailwind CSS para estilização
- Vue Router para navegação
- LocalStorage para persistência

## Próximos Passos

O sistema está pronto para uso básico. Possíveis melhorias:

1. **Integração com Hardware**:
   - Impressora de senhas
   - Display LED para chamadas
   - Som/campainha para alertas

2. **Funcionalidades Avançadas**:
   - Tempo médio de espera
   - Notificações push
   - Relatórios de atendimento

3. **Integração com Sistema Completo**:
   - Conexão com módulos de acolhimento
   - Sincronização com cadastro de pacientes
   - Fluxo completo até atendimento médico

## Demonstração

Para testar o sistema:

1. Execute `npm run dev` no diretório `codenews`
2. Acesse `http://localhost:5173`
3. Gere algumas senhas na tela de seleção
4. Visualize e gerencie no painel de chamadas
5. Teste a priorização de senhas preferenciais