# Plano de finalização — administração do sistema e autenticação

## Objetivo

Encerrar as lacunas de segurança e configuração que ainda afetam os fluxos de autenticação e o painel do administrador do
sistema. Este plano contém somente trabalho pendente; funcionalidades já implementadas não permanecem como checklist.

## 1. Validar a sessão nas rotas administrativas

Alinhar o `adminGuard` aos demais guards autenticados: validar o access token antes de liberar a rota e, quando ele estiver
ausente ou expirado, tentar renovar a sessão pelo refresh token.

Se a renovação falhar, limpar a sessão local e redirecionar para o login administrativo preservando o `returnUrl`. Manter
os redirecionamentos atuais para primeiro acesso e para o espaço residencial quando o usuário não for administrador do
sistema.

Adicionar somente os testes do guard necessários para cobrir access token válido, renovação bem-sucedida e falha na
renovação.

## 2. Proteger o login contra tentativas excessivas

Aplicar limitação de tentativas ao endpoint público de login, com respostas que não permitam descobrir se o telefone ou e-mail está cadastrado.

## Fora deste plano

- recuperação de senha por convite, pois depende da definição de um canal de entrega; continua como requisito de produto e
  deve ser tratada em um ciclo próprio;
- auditoria genérica de condomínios e casas; a auditoria de usuários, senhas e permissões já existente atende ao escopo de
  autenticação deste ciclo;
- navegação e painel administrativo do gestor de condomínio, que pertencem ao ciclo funcional do gestor;
- infraestrutura para invalidar refresh tokens antes da expiração, inclusive após alteração de senha ou logout, além de
  lista de sessões e gestão de dispositivos;
- roteiro e2e completo e validação visual de todas as páginas e breakpoints.
