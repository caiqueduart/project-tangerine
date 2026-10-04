# Backend Tangerine

API NestJS com PostgreSQL e TypeORM, integrada ao workspace `@repo/shared`.

## Desenvolvimento

Todos os comandos abaixo são executados na raiz do monorepo.

Instale as dependências:

```sh
npm ci
```

Suba o banco de desenvolvimento com Docker (requer Docker Desktop). Ele usa o `docker-compose.yml` da raiz, expõe o
PostgreSQL na porta `5433` do computador e guarda os dados no volume `tangerine-db-data`:

```sh
npm run db:up
```

A porta `5433` evita conflito com um PostgreSQL instalado diretamente no Windows, que costuma ocupar a `5432`.

Copie `.env.example` para `.env` neste diretório; os dados do banco já correspondem ao container. Preencha `JWT_SECRET`
e as variáveis `SYSTEM_ADMIN_*`, não defina `DATABASE_URL` e nunca aponte o ambiente local para o banco de produção.
Mantenha `DATABASE_SYNCHRONIZE=false`: alterações de schema devem sempre gerar uma migration.

Na primeira execução, aplique as migrations e crie o administrador inicial:

```sh
npm run migration:run --workspace backend
npm run bootstrap:admin --workspace backend
```

Depois, suba backend e frontend juntos. O comando compila o `@repo/shared` antes de iniciar os servidores:

```sh
npm run dev
```

A API responde em `http://localhost:3000`, sem prefixo por padrão. Para parar o banco, use `npm run db:down`; os dados
permanecem no volume. Para apagar os dados locais, use `docker compose down -v`.

### Migrations

Ao alterar uma entidade, gere e aplique a migration correspondente:

```sh
npm run migration:generate --workspace backend -- src/database/migrations/NomeDaMudanca
npm run migration:run --workspace backend
```

### Variáveis relevantes

- `PROVISIONAL_PASSWORD_TTL_HOURS`: validade da senha provisória, em horas. O padrão é `72`.
- `JWT_TTL` e `JWT_REFRESH_TTL`: duração, em segundos, do access token e do refresh token.

O login aceita até cinco tentativas por minuto para o mesmo telefone ou e-mail e vinte por minuto por IP. O controle é
feito em memória, o que atende a uma única instância da API.

## Verificação

```sh
npm run build -- --filter=backend
npm run test --workspace backend -- --runInBand
```

## Produção

O [Blueprint do Render](render.yaml) compila o backend e o pacote compartilhado, aplica as migrations a cada start
(`migration:run:prod`) e inicia a API com o prefixo `/api`. Em produção, `NODE_ENV=production` exige TLS no banco,
origens HTTPS em `CORS_ORIGINS`, segredos JWT com pelo menos 32 caracteres e proíbe `DATABASE_SYNCHRONIZE`.

Migrations e bootstrap possuem comandos `:prod` que executam JavaScript compilado e dispensam `ts-node`, como
`npm run bootstrap:admin:prod --workspace backend` para criar o administrador inicial no banco de produção.
