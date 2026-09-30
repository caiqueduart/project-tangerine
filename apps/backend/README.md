# Backend Tangerine

API NestJS com PostgreSQL e TypeORM, integrada ao workspace `@repo/shared`.

## Desenvolvimento

Na raiz do monorepo, instale as dependências e compile o pacote compartilhado:

```sh
npm ci
npm run build --workspace @repo/shared
```

Copie `.env.example` para `.env` neste diretório e preencha as credenciais do PostgreSQL e `JWT_SECRET`. Em banco vazio, mantenha `DATABASE_SYNCHRONIZE=false` e aplique as migrations antes de iniciar:

```sh
npm run migration:run --workspace backend
npm run start:dev --workspace backend
```

Os comandos acima são executados na raiz do monorepo. As rotas locais usam `http://localhost:3000`, sem prefixo por padrão.

## Verificação

```sh
npm run build -- --filter=backend
npm run test --workspace backend -- --runInBand
```

## Produção

Consulte o [guia de deploy no Render com Supabase](deploy-backend.md) para configuração, migrations, criação do administrador, integração `/api`, backup e rollback.

O [Blueprint do Render](render.yaml) compila o backend e o pacote compartilhado. Migrations e bootstrap possuem comandos `:prod` que executam JavaScript compilado e dispensam `ts-node`.
