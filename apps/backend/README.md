# Backend Tangerine

API NestJS com PostgreSQL e TypeORM, integrada ao workspace `@repo/shared`.

## Desenvolvimento

Na raiz do monorepo, instale as dependências e compile o pacote compartilhado:

```sh
npm ci
npm run build --workspace @repo/shared
```

Suba o banco de desenvolvimento com Docker (requer Docker Desktop). Ele usa o `docker-compose.yml` da raiz e guarda os dados no volume `tangerine-db-data`:

```sh
npm run db:up
```

Copie `.env.example` para `.env` neste diretório; os dados do banco já correspondem ao container. Preencha `JWT_SECRET`, sem `DATABASE_URL`, e nunca aponte o ambiente local para o banco de produção. Mantenha `DATABASE_SYNCHRONIZE=false` e aplique as migrations antes de iniciar:

```sh
npm run migration:run --workspace backend
npm run bootstrap:admin --workspace backend
npm run dev
```

`bootstrap:admin` cria o administrador inicial com as variáveis `SYSTEM_ADMIN_*` do `.env`. Para parar o banco, use `npm run db:down`; os dados permanecem no volume.

Os comandos acima são executados na raiz do monorepo. As rotas locais usam `http://localhost:3000`, sem prefixo por padrão.

## Verificação

```sh
npm run build -- --filter=backend
npm run test --workspace backend -- --runInBand
```

## Produção

Consulte o [guia de deploy no Render com Supabase](deploy-backend.md) para configuração, migrations, criação do administrador, integração `/api`, backup e rollback.

O [Blueprint do Render](render.yaml) compila o backend e o pacote compartilhado. Migrations e bootstrap possuem comandos `:prod` que executam JavaScript compilado e dispensam `ts-node`.
