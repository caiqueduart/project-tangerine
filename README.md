# Project Tangerine

Plataforma de gestão de condomínios voltada ao controle de contribuições, comprovantes e prestação de contas, em
substituição aos controles informais feitos em grupos de WhatsApp.

## Estrutura

- `apps/backend`: API NestJS com PostgreSQL e TypeORM. Veja o [README do backend](apps/backend/README.md).
- `apps/frontend`: aplicação Angular. Veja o [README do frontend](apps/frontend/README.md).
- `packages/shared`: enums e contratos compartilhados entre backend e frontend.
- `docs`: escopo, requisitos e histórias de usuário.

## Primeiros passos

Requisitos: Node.js 20 ou superior, npm 11 e Docker Desktop.

```sh
npm ci
npm run db:up
```

Copie `apps/backend/.env.example` para `apps/backend/.env` e preencha `JWT_SECRET` e as variáveis `SYSTEM_ADMIN_*`. Na
primeira execução, prepare o banco local:

```sh
npm run migration:run --workspace backend
npm run bootstrap:admin --workspace backend
```

Depois, suba backend e frontend:

```sh
npm run dev
```

O frontend fica em `http://localhost:4200` e a API em `http://localhost:3000`.

## Scripts da raiz

- `npm run dev`: compila o `@repo/shared` e sobe backend e frontend em modo de desenvolvimento.
- `npm run db:up` e `npm run db:down`: sobem e param o PostgreSQL de desenvolvimento no Docker (porta `5433`).
- `npm run build`: compila todos os workspaces.
- `npm run lint` e `npm run check-types`: executam lint e checagem de tipos nos workspaces.

## Documentação

- [Escopo](docs/escopo.md)
- [Requisitos](docs/requisitos.md)
- [Histórias de usuário](docs/user-story)
- [Convenções para agentes e contribuidores](AGENTS.md)
