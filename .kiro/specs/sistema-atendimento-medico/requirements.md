# Documento de Requisitos - Sistema de Atendimento Médico

## Introdução

Este documento define os requisitos para um sistema de gestão de atendimentos médicos MVP (Minimum Viable Product) desenvolvido em Vue.js. O sistema gerencia o fluxo completo de pacientes desde a emissão de senhas até o atendimento médico, passando por acolhimento e triagem. O foco é simplicidade e funcionalidade essencial, sem testes automatizados ou complexidades desnecessárias.

## Requisitos

### Requisito 1 - Módulo de Autenticação

**História do Usuário:** Como um profissional de saúde, eu quero fazer login no sistema com usuário e senha, para que eu possa acessar as funcionalidades específicas do meu perfil.

#### Critérios de Aceitação

1. QUANDO um usuário acessa a tela de login ENTÃO o sistema DEVE exibir campos para usuário e senha
2. QUANDO um usuário insere credenciais válidas ENTÃO o sistema DEVE autenticar e redirecionar para o módulo apropriado
3. QUANDO um usuário insere credenciais inválidas ENTÃO o sistema DEVE exibir mensagem de erro
4. QUANDO um usuário está autenticado ENTÃO o sistema DEVE manter a sessão ativa durante o uso

### Requisito 2 - Módulo do Paciente

**História do Usuário:** Como um paciente, eu quero emitir uma senha e visualizar o painel de chamadas, para que eu possa aguardar meu atendimento de forma organizada.

#### Critérios de Aceitação

1. QUANDO um paciente acessa o módulo ENTÃO o sistema DEVE permitir seleção de prioridade (normal/preferencial)
2. QUANDO um paciente seleciona a prioridade ENTÃO o sistema DEVE gerar uma senha única
3. QUANDO uma senha é gerada ENTÃO o sistema DEVE exibir a senha no painel de chamadas
4. QUANDO há chamadas ativas ENTÃO o sistema DEVE mostrar a senha atual e as próximas na fila

### Requisito 3 - Módulo de Acolhimento

**História do Usuário:** Como um profissional de acolhimento, eu quero visualizar a fila de espera e chamar o próximo paciente, para que eu possa gerenciar o fluxo de atendimento eficientemente.

#### Critérios de Aceitação

1. QUANDO acesso o módulo de acolhimento ENTÃO o sistema DEVE exibir a fila de espera por senha
2. QUANDO clico em "chamar próximo" ENTÃO o sistema DEVE avançar para a próxima senha da fila
3. QUANDO um paciente não tem cadastro ENTÃO o sistema DEVE permitir cadastro simplificado
4. QUANDO um paciente é chamado ENTÃO o sistema DEVE atualizar o painel de chamadas

### Requisito 4 - Módulo de Triagem

**História do Usuário:** Como um profissional de triagem, eu quero visualizar pacientes vindos do acolhimento e registrar sinais vitais, para que eu possa classificar o risco e priorizar atendimentos.

#### Critérios de Aceitação

1. QUANDO acesso o módulo de triagem ENTÃO o sistema DEVE exibir pacientes vindos do acolhimento
2. QUANDO seleciono um paciente ENTÃO o sistema DEVE permitir registro de sinais vitais básicos
3. QUANDO registro sinais vitais ENTÃO o sistema DEVE permitir classificação de risco
4. QUANDO completo a triagem ENTÃO o sistema DEVE encaminhar o paciente para atendimento

### Requisito 5 - Módulo de Atendimento

**História do Usuário:** Como um médico, eu quero visualizar pacientes triados e registrar diagnóstico, para que eu possa completar o atendimento médico.

#### Critérios de Aceitação

1. QUANDO acesso o módulo de atendimento ENTÃO o sistema DEVE exibir pacientes triados
2. QUANDO seleciono um paciente ENTÃO o sistema DEVE mostrar dados da triagem
3. QUANDO atendo um paciente ENTÃO o sistema DEVE permitir registro simples de diagnóstico
4. QUANDO completo o atendimento ENTÃO o sistema DEVE permitir registro do desfecho

### Requisito 6 - Módulo de Gestão/Admin

**História do Usuário:** Como um administrador, eu quero gerenciar usuários e visualizar dashboard básico, para que eu possa monitorar o sistema e controlar acessos.

#### Critérios de Aceitação

1. QUANDO acesso o módulo admin ENTÃO o sistema DEVE permitir cadastro de novos usuários
2. QUANDO gerencio usuários ENTÃO o sistema DEVE permitir edição de dados e permissões
3. QUANDO acesso o dashboard ENTÃO o sistema DEVE exibir número de pacientes em espera
4. QUANDO visualizo métricas ENTÃO o sistema DEVE mostrar número de pacientes atendidos

### Requisito 7 - Sistema de Permissões

**História do Usuário:** Como um usuário do sistema, eu quero ter acesso apenas às funcionalidades do meu perfil, para que o sistema mantenha segurança e organização.

#### Critérios de Aceitação

1. QUANDO um usuário de acolhimento faz login ENTÃO o sistema DEVE permitir acesso à fila e cadastro de pacientes
2. QUANDO um usuário de triagem faz login ENTÃO o sistema DEVE permitir registro de triagem e sinais vitais
3. QUANDO um usuário de atendimento faz login ENTÃO o sistema DEVE permitir registro de atendimento e desfecho
4. QUANDO um gestor/admin faz login ENTÃO o sistema DEVE permitir acesso ao dashboard e cadastro de usuários

### Requisito 8 - Fluxo Principal do Sistema

**História do Usuário:** Como um usuário do sistema, eu quero que o fluxo de atendimento seja claro e sequencial, para que os pacientes sejam atendidos de forma organizada.

#### Critérios de Aceitação

1. QUANDO um paciente inicia o processo ENTÃO o sistema DEVE seguir: Login → Emissão de senha → Acolhimento → Triagem → Atendimento médico
2. QUANDO um paciente avança no fluxo ENTÃO o sistema DEVE atualizar seu status automaticamente
3. QUANDO há mudança de status ENTÃO o sistema DEVE refletir nos painéis correspondentes
4. QUANDO o fluxo é completado ENTÃO o sistema DEVE registrar o atendimento como finalizado
