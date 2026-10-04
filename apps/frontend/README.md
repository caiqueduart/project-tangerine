# Frontend Tangerine

Aplicação Angular com Angular Material, integrada ao workspace `@repo/shared`.

## Desenvolvimento

Na raiz do monorepo, suba backend e frontend juntos:

```sh
npm run dev
```

Para subir somente o frontend:

```sh
npm run dev --workspace frontend
```

A aplicação fica em `http://localhost:4200` e consome a API em `http://localhost:3000`, definida em
`src/environments/environment.ts`. Em produção, a API é acessada pelo caminho relativo `/api`.

As áreas principais são:

- `/admin`: painel do administrador do sistema.
- `/<identificador-do-condominio>`: login e espaço do morador de cada condomínio.

## Verificação

```sh
npm run build --workspace frontend
npm run test --workspace frontend -- --watch=false
```

As convenções de código, estilos e layout estão no [AGENTS.md](../../AGENTS.md) da raiz.
