# GraphCognitio Frontend (MVP)

Frontend React + TypeScript para o GraphCognitio, com estética Frutiger Aero e foco em performance.

## Stack

- React + TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS + CSS custom (Frutiger Aero)
- React Flow (`@xyflow/react`) para `/graph/:rootId`

## Environment

Use `.env.example`:

```bash
cp .env.example .env
```

Variável obrigatória:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Observações:

- `VITE_API_BASE_URL` é configuração pública de frontend e será embutida no bundle
- nunca coloque secrets, tokens privados ou credenciais em variáveis `VITE_*`
- para deploy, gere o build com a URL pública correta da API

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Rotas

- `/login`
- `/register`
- `/feed`
- `/post/:id`
- `/graph/:rootId`

## Integração com backend

Contratos usados exatamente como confirmados:

- `POST /auth/register`
- `POST /auth/login`
- `GET /feed?cursor=&limit=20`
- `GET /posts/{id}`
- `POST /posts/{id}/reply`
- `GET /graphs/conversation/{rootId}?depth=&limit=`

Configuração aplicada:

- token em `localStorage`
- interceptor `Authorization: Bearer <token>`
- em `401`: limpeza de sessão e redirecionamento para `/login`

## Principais entregas

### 1) Auth

- telas de login e cadastro conectadas ao backend
- persistência de sessão local
- proteção de rotas privadas

### 2) Feed canvas custom (sem React Flow)

- plano 2D com pan infinito
- zoom com wheel (`0.5` a `2.0`)
- cards de posts raiz como nós visuais
- carregamento progressivo via cursor (`nextCursor`)
- busca incremental ao chegar perto das bordas do mundo carregado

### 3) Performance no feed

- virtualização espacial (somente nós visíveis + buffer)
- limite alvo de nós renderizados por zoom
- hard cap de 220 nós no DOM
- câmera com `requestAnimationFrame`
- transformações GPU (`translate3d` + `scale`)
- deduplicação por `post.id`
- posicionamento determinístico por hash de `post.id` + espiral + ocupação de células

### 4) Post detail + reply

- busca de detalhe por id
- envio de reply com limite de 500 chars no form
- ação “Open graph” quando post é raiz

### 5) Graph com React Flow

- primeira carga com `depth=2` e `limit=120`
- side panel com preview do nó
- ação “Expand” incrementa `depth` em `+1` e mantém `limit`
- minimap, controls, pan e zoom

### 6) Estética Frutiger Aero

- gradientes aqua/sky + vinheta
- glassmorphism com blur, highlights e reflexo
- botões gel/gloss
- bolhas decorativas
- peixes decorativos em SVG inline
- partículas em canvas (com fallback para reduced motion)

## Acessibilidade e UX

- foco visível em elementos interativos
- `aria-label` em botões de ícone
- suporte a `prefers-reduced-motion`
- modo degradado automático em dispositivos de menor capacidade (menos partículas/efeitos)

## Estrutura de pastas

```text
src/
  api/
  app/
  components/
    decor/
    layout/
    ui/
  features/
    auth/
    feed/
    graph/
    post/
  hooks/
  styles/
```

## Screenshots

Sugestão de capturas para documentação do portfólio:

- Login (Frutiger Aero)
- Register (Frutiger Aero)
- Feed canvas em zoom 1.0
- Feed canvas com pan + painel lateral aberto
- Graph view com side panel e ação Expand
