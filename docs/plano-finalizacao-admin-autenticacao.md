# Plano de finalização — administração do sistema e autenticação

## Objetivo

Concluir o ciclo de autenticação e de gestão do administrador do sistema com controle de acesso seguro, gestão de
condomínios, casas, usuários e gestores, recuperação de senha, auditoria e preparação mínima para implantação.

Não fazem parte deste ciclo:

- dashboards e indicadores gerenciais;
- funcionalidades operacionais de contribuições, pagamentos e prestação de contas;
- automação do envio de senhas provisórias por WhatsApp ou e-mail.

## 1. Corrigir autorização e isolamento de dados

Aplicar `PermissionsGuard` e `RequirePermissions` em todos os endpoints de condomínio e casa. Cada operação deve exigir
a permissão correspondente (`READ`, `CREATE`, `UPDATE` ou `DELETE`) e receber o ator autenticado no service.

Além da permissão por papel, validar o escopo do recurso segundo a [planilha de funcionalidades](https://docs.google.com/spreadsheets/d/1BsBoko7RExSn8EGWaLGqOZoBRThxvNyVBf2JtxA-Vkc/edit?usp=sharing)

Adicionar testes de controller e service cobrindo morador sem permissão, gestor no próprio condomínio, gestor em outro
condomínio e administrador do sistema.

## 2. Separar papel global e permissão de gestor

Substituir o uso de `User.role` como representação única de acesso por uma estrutura que diferencie:

- papel global de administrador do sistema;
- vínculo residencial do usuário com uma casa;
- permissão de gestor vinculada explicitamente a usuário e condomínio.

Criar uma entidade de permissão de gestor com, no mínimo, usuário, condomínio, situação e dados de criação/revogação.
A permissão não deve depender da casa do usuário, não deve ser duplicada e deve permitir mais de um gestor por
condomínio.

Atualizar o payload da sessão e as políticas para considerar as permissões ativas. No frontend, substituir a alteração
genérica de papel pelos fluxos explícitos de conceder e remover gestor e habilitar a aba de gestores nos detalhes do
condomínio.

## 3. Aplicar a situação do condomínio ao acesso

Impedir que usuários vinculados a um condomínio inativo acessem sua área interna. A regra deve ser aplicada no backend
durante login, renovação de sessão e operações contextualizadas, sem bloquear o administrador do sistema em seu painel.

A consulta pública por slug deve informar uma resposta adequada para condomínio inativo, sem apresentar a tela normal
de login. Ao reativar o condomínio, usuários ainda ativos e autorizados devem voltar a acessar normalmente.

## 4. Implementar recuperação de senha

Criar o fluxo completo para usuários ativos:

1. solicitação por telefone ou e-mail, sempre com resposta genérica;
2. geração de token aleatório, armazenando somente seu hash;
3. convite com validade limitada e uso único;
4. redefinição com confirmação e as regras normais de senha;
5. invalidação dos convites anteriores após nova solicitação ou uso bem-sucedido;
6. registro de auditoria sem senha, hash ou token em texto puro.

Disponibilizar também, nos detalhes do usuário, a ação administrativa de iniciar o mesmo convite, sem gerar senha
provisória e sem alterar a situação do usuário para pendente. Definir um serviço de entrega desacoplado e documentar o
canal habilitado no ambiente.

No frontend, criar as páginas de solicitação e redefinição, ligar o botão “Esqueci minha senha” e tratar convite inválido,
expirado ou já utilizado.

## 5. Completar vínculo residencial e responsáveis

Adicionar ao vínculo de morador a indicação de responsável pela residência. Incluir o campo no banco, DTOs, respostas,
formulários de criação e edição e detalhes de usuário e casa.

Permitir múltiplos responsáveis na mesma casa. Alterar essa indicação não deve conceder permissão de gestor nem afetar
históricos financeiros.

## 6. Completar a auditoria administrativa

Adotar um histórico imutável capaz de identificar ação, tipo e ID do alvo, condomínio relacionado, ator e data. Registrar
ao menos:

- criação, edição, ativação e inativação de condomínio;
- criação e edição de casa;
- criação, edição, ativação e inativação de usuário;
- alteração e recuperação de senha, sem dados sensíveis;
- concessão e remoção de permissão de gestor ou administrador do sistema.

## 7. Ajustar navegação e validação de sessão

Fazer o `adminGuard` validar o access token e tentar o refresh antes de liberar a área administrativa. Sessão ausente,
expirada ou inválida deve ser limpa e redirecionada ao login correto.

No login de condomínio, validar que a conta possui vínculo ou permissão naquele contexto. O login administrativo deve
continuar aceitando somente administradores do sistema. Após conceder uma permissão de gestor, disponibilizar ao menos o
acesso autenticado e a troca entre espaço residencial e administrativo; o conteúdo operacional do gestor será tratado
em seu próprio ciclo.

Adicionar limitação de tentativas nos endpoints públicos de autenticação e revisar a estratégia de renovação e revogação
de refresh tokens, inclusive após recuperação de senha.

## 8. Preparar banco e configuração de implantação

Criar migrations para o estado atual e para as novas entidades, desabilitando `synchronize` em produção. Corrigir a
conversão de variáveis booleanas, pois `Boolean('false')` resulta em `true`.

Também devem ser adicionados:

- `.env.example` sem segredos;
- validação obrigatória das variáveis de banco e JWT;
- URL da API e origens CORS configuráveis por ambiente;
- procedimento seguro e idempotente para criar o primeiro administrador do sistema;
- instruções de instalação, migração, inicialização e recuperação operacional.

**Concluído quando:** um ambiente vazio pode ser configurado e iniciado sem edição manual do banco ou do código.

## 9. Testes e aceite final

Adicionar testes unitários e de integração para permissões, isolamento, inativação de condomínio, concessão e revogação
de gestor, primeiro acesso, alteração e recuperação de senha. No frontend, cobrir guards e os principais fluxos de
formulário.

Executar um roteiro e2e com os perfis de administrador do sistema, gestor, morador, usuário pendente e usuário inativo.
Validar também navegação mobile e desktop, mensagens sem enumeração de contas e tentativa de acesso por IDs de outro
condomínio.

Antes de encerrar o ciclo, executar:

- testes do backend e frontend;
- build dos dois workspaces e da raiz;
- `git diff --check`;
- migrações em um banco vazio e em uma cópia de dados de desenvolvimento.

## Ordem de execução

1. Autorização e isolamento.
2. Modelo de permissões de gestor e migrations.
3. Bloqueio por situação do condomínio.
4. Recuperação de senha e ajustes de sessão.
5. Responsáveis pela residência.
6. Auditoria administrativa.
7. Configuração de implantação, testes e aceite final.

