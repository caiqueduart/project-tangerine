# Histórias de Usuário

## Épico: Autenticação e acesso

### US-AUT-001 - Acessar o sistema como morador

Como morador vinculado a uma casa, quero acessar o sistema com minhas credenciais para consultar as informações e pendências da minha casa.

Critérios de aceite:

- O morador deve conseguir informar telefone ou e-mail cadastrado.
- O morador deve informar uma senha válida.
- Ao autenticar com sucesso, o sistema deve direcionar o morador para o painel do morador.
- O sistema deve carregar apenas as informações permitidas para a casa vinculada ao morador.
- Caso as credenciais estejam incorretas, o sistema deve exibir uma mensagem simples, sem informar se o erro foi no telefone, no e-mail ou na senha.

### US-AUT-002 - Acessar área administrativa do condomínio

Como morador com acesso administrativo, quero acessar uma área adicional de administração para gerenciar casas, moradores, contribuições e comprovantes.

Critérios de aceite:

- O morador com acesso administrativo deve conseguir fazer login com uma conta vinculada à sua casa.
- Ao autenticar com sucesso, o sistema deve permitir acesso ao painel do morador com as informações da própria casa.
- O sistema deve exibir uma opção de acesso à área administrativa quando o usuário possuir permissão administrativa.
- A área administrativa deve liberar apenas funcionalidades compatíveis com essa permissão.
- Ações administrativas, como criar contribuição ou visualizar comprovantes de outras casas, não devem estar disponíveis para moradores sem permissão administrativa.

### US-AUT-003 - Diferenciar permissões de acesso

Como responsável pela gestão do sistema, quero que cada usuário tenha permissões de acesso adequadas para garantir que cada pessoa veja apenas o que lhe compete.

Critérios de aceite:

- Todo morador deve estar vinculado a uma casa.
- O sistema deve permitir que o administrador do sistema conceda permissão administrativa a moradores específicos.
- As permissões do usuário devem ser validadas após o login.
- Moradores sem permissão administrativa devem visualizar dados e pendências da própria casa.
- Moradores com permissão administrativa devem visualizar dados e pendências da própria casa e também dados gerais do condomínio na área administrativa.
- Administradores do sistema devem acessar funcionalidades de gestão geral, usuários e permissões.
- Tentativas de acessar telas ou ações sem permissão devem ser bloqueadas.

### US-AUT-004 - Solicitar cadastro de morador

Como futuro morador usuário, quero solicitar meu cadastro informando meus dados e minha casa para que meu acesso seja liberado pela administração.

Critérios de aceite:

- O usuário deve conseguir informar nome, telefone, e-mail, senha e selecionar uma casa já cadastrada.
- O usuário deve conseguir indicar se é responsável pela residência selecionada.
- O sistema deve registrar a solicitação com status pendente.
- O sistema não deve liberar acesso antes da aprovação da solicitação.
- O sistema não deve permitir cadastrar dois usuários com o mesmo telefone ou e-mail.

### US-AUT-005 - Aprovar cadastro de morador

Como morador com acesso administrativo, quero aprovar o cadastro solicitado por um morador para que ele consiga entrar no sistema.

Critérios de aceite:

- O morador com acesso administrativo deve conseguir aprovar solicitação de cadastro de morador.
- O administrador do sistema também deve conseguir aprovar solicitação de cadastro de morador.
- A aprovação deve vincular o morador à casa selecionada.
- A aprovação deve permitir manter ou remover a indicação de responsável pela residência.
- Após a aprovação, o morador deve conseguir acessar o sistema com o telefone ou e-mail e a senha informados na solicitação.
- O morador deve ficar vinculado a uma casa antes de acessar o sistema.
- O sistema não deve permitir cadastrar dois usuários com o mesmo telefone ou e-mail.

### US-AUT-006 - Alterar senha

Como usuário autenticado, quero alterar minha senha para manter meu acesso seguro.

Critérios de aceite:

- O usuário deve conseguir acessar uma opção de alteração de senha após estar logado.
- O sistema deve solicitar a senha atual antes de permitir a alteração.
- A nova senha deve ser confirmada pelo usuário.
- O sistema deve impedir alteração quando a senha atual estiver incorreta.
- Após a alteração, a nova senha deve ser usada no próximo login.

### US-AUT-007 - Recuperar senha

Como usuário que esqueceu a senha, quero recuperar ou redefinir meu acesso para conseguir voltar a usar o sistema sem depender de mensagens no grupo de WhatsApp.

Critérios de aceite:

- O usuário deve conseguir solicitar recuperação de senha informando telefone ou e-mail cadastrado.
- O sistema deve orientar o usuário com uma mensagem simples, mesmo quando o identificador não for encontrado.
- O sistema deve permitir redefinir a senha por convite temporário enviado ao telefone ou e-mail do usuário.
- O acesso anterior deve deixar de funcionar após a redefinição da senha.

### US-AUT-008 - Encerrar sessão

Como usuário autenticado, quero sair da minha conta para evitar que outras pessoas acessem minhas informações no mesmo celular.

Critérios de aceite:

- O sistema deve exibir uma opção clara para sair da conta.
- Ao sair, o usuário deve voltar para a tela de login.
- Após encerrar a sessão, o sistema não deve permitir acesso às áreas internas sem novo login.

### US-AUT-009 - Manter sessão ativa com segurança

Como usuário frequente, quero permanecer conectado por um período adequado para não precisar digitar a senha toda vez que abrir o sistema no celular.

Critérios de aceite:

- O sistema pode manter a sessão ativa por um período definido.
- O usuário deve ser solicitado a fazer login novamente quando a sessão expirar.
- O sistema deve proteger áreas internas caso a sessão esteja inválida ou expirada.
