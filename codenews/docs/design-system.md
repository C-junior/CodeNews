# Design System - CodeNews

## Paleta de Cores

### Cores Principais

- **Azul Primário**: `#1E40AF`
  - Uso: Botões principais, links, elementos de destaque
  - Classes Tailwind: `primary`, `bg-primary`, `text-primary`, `border-primary`
  - Variável CSS: `--codenews-primary`

- **Verde Secundário**: `#16A34A`
  - Uso: Indicadores de sucesso, botões secundários, status positivos
  - Classes Tailwind: `secondary`, `bg-secondary`, `text-secondary`
  - Variável CSS: `--codenews-secondary`

- **Branco**: `#FFFFFF`
  - Uso: Fundos principais, texto em elementos escuros
  - Classes Tailwind: `codenews-white`
  - Variável CSS: `--codenews-white`

- **Cinza Claro**: `#F8FAFC`
  - Uso: Fundos secundários, áreas de conteúdo
  - Classes Tailwind: `neutral-50`, `codenews-gray`
  - Variável CSS: `--codenews-gray`

### Variações de Cores

#### Azul Primário (Primary)
- `primary-50`: `#EFF6FF`
- `primary-100`: `#DBEAFE`
- `primary-200`: `#BFDBFE`
- `primary-300`: `#93C5FD`
- `primary-400`: `#60A5FA`
- `primary-500`: `#3B82F6`
- `primary-600`: `#1E40AF` (cor principal)
- `primary-700`: `#1E3A8A`
- `primary-800`: `#1E3A8A`
- `primary-900`: `#1E3A8A`

#### Verde Secundário (Secondary)
- `secondary-50`: `#F0FDF4`
- `secondary-100`: `#DCFCE7`
- `secondary-200`: `#BBF7D0`
- `secondary-300`: `#86EFAC`
- `secondary-400`: `#4ADE80`
- `secondary-500`: `#22C55E`
- `secondary-600`: `#16A34A` (cor principal)
- `secondary-700`: `#15803D`
- `secondary-800`: `#166534`
- `secondary-900`: `#14532D`

#### Tons de Cinza (Neutral)
- `neutral-50`: `#F8FAFC`
- `neutral-100`: `#F1F5F9`
- `neutral-200`: `#E2E8F0`
- `neutral-300`: `#CBD5E1`
- `neutral-400`: `#94A3B8`
- `neutral-500`: `#64748B`
- `neutral-600`: `#475569`
- `neutral-700`: `#334155`
- `neutral-800`: `#1E293B`
- `neutral-900`: `#0F172A`

### Cores de Estado

- **Sucesso**: `#16A34A` (Verde secundário)
- **Aviso**: `#F59E0B`
- **Erro**: `#EF4444`
- **Informação**: `#1E40AF` (Azul primário)

## Componentes

### Logo
- Componente: `CodeNewsLogo.vue`
- Localização da imagem: `/public/logo-codenews.png`
- Tamanhos disponíveis: `small`, `medium`, `large`, `xl`
- Variantes: `horizontal`, `vertical`, `icon-only`

### Classes Utilitárias

#### Botões
- `.btn-primary`: Botão principal (azul)
- `.btn-secondary`: Botão secundário (verde)
- `.btn-outline`: Botão com borda

#### Formulários
- `.input-field`: Campo de entrada padrão
- `.card`: Cartão com sombra e borda

#### Texto
- `.text-primary`: Texto azul primário
- `.text-secondary`: Texto verde secundário

## Uso

### Em Templates Vue
```vue
<template>
  <!-- Usando classes Tailwind -->
  <button class="btn-primary">Botão Principal</button>
  <div class="bg-primary text-white p-4">Conteúdo</div>
  
  <!-- Usando componente de logo -->
  <CodeNewsLogo size="medium" />
</template>
```

### Em CSS
```css
/* Usando variáveis CSS */
.custom-element {
  background-color: var(--codenews-primary);
  color: var(--codenews-white);
}
```

### Configuração Tailwind
As cores estão configuradas no arquivo `tailwind.config.js` e podem ser usadas com as classes padrão do Tailwind:

```javascript
// Exemplo de uso das cores configuradas
bg-primary-500
text-secondary-600
border-neutral-200
```

## Acessibilidade

- Todas as cores atendem aos padrões de contraste WCAG 2.1
- Focus states são claramente definidos com a cor primária
- Cores de estado seguem convenções universais (verde = sucesso, vermelho = erro)

## Modo Escuro

O sistema suporta modo escuro através de variáveis CSS que se adaptam automaticamente:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--codenews-gray-900);
    --color-text: var(--codenews-gray-200);
  }
}
```