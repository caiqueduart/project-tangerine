# Histórias de Usuário

## Épico: Painel do administrador do sistema

### US-SIS-001 - Acessar o painel do administrador do sistema

Como administrador do sistema, quero acessar uma área exclusiva para gerenciar os condomínios e os acessos administrativos da plataforma.

Precondições:

- O usuário deve estar autenticado.
- O usuário deve possuir permissão ativa de administrador do sistema.

Critérios de aceite:

- O sistema deve direcionar o administrador do sistema para uma área distinta dos espaços de morador e de gestor de condomínio.
- O painel deve permitir acesso às funcionalidades de gestão geral da plataforma.
- A permissão de administrador do sistema não deve vincular automaticamente o usuário a uma casa.
- O administrador do sistema somente deve acessar o espaço do morador quando possuir também um vínculo residencial ativo.
- O sistema deve bloquear o acesso de gestores de condomínio e moradores sem a permissão necessária.
- Caso a sessão esteja inválida ou expirada, o sistema deve impedir o acesso e direcionar o usuário para a tela de login.

### US-SIS-002 - Visualizar o resumo da plataforma

Como administrador do sistema, quero visualizar um resumo da plataforma para identificar rapidamente condomínios e acessos que exigem atenção.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O resumo deve apresentar, no mínimo, a quantidade de condomínios, casas e usuários cadastrados.
- O sistema deve diferenciar condomínios ativos e inativos.
- O resumo deve indicar condomínios sem gestor ativo.
- O resumo deve apresentar solicitações de cadastro pendentes separadas por condomínio.
- O administrador deve conseguir acessar o contexto relacionado a partir de cada informação resumida.
- Quando não houver pendências, o sistema deve apresentar uma mensagem simples, sem deixar a área em branco.

### US-SIS-003 - Consultar condomínios cadastrados

Como administrador do sistema, quero consultar os condomínios cadastrados para acompanhar sua situação e acessar sua gestão.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O sistema deve listar todos os condomínios cadastrados na plataforma.
- Para cada condomínio, o sistema deve apresentar, no mínimo, nome, identificador de acesso, situação, quantidade de casas e quantidade de usuários.
- O administrador deve conseguir localizar um condomínio por nome ou identificador de acesso.
- O administrador deve conseguir diferenciar condomínios ativos e inativos.
- O administrador deve conseguir acessar os detalhes de um condomínio listado.
- Quando não houver condomínios, o sistema deve apresentar uma mensagem simples e uma opção para cadastrar o primeiro condomínio.

### US-SIS-004 - Cadastrar um condomínio

Como administrador do sistema, quero cadastrar um condomínio para iniciar sua configuração na plataforma.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O administrador deve informar o nome e o identificador de acesso do condomínio (slug).
- O identificador de acesso deve ser único na plataforma.
- O sistema deve validar os campos obrigatórios antes de concluir o cadastro.
- O condomínio deve ser criado sem moradores, gestores, ou casas vinculados automaticamente.
- Após o cadastro, o administrador deve conseguir acessar os detalhes do condomínio e continuar sua configuração.
- Uma falha no cadastro não deve produzir um condomínio parcialmente registrado.
- O sistema deve registrar quem criou o condomínio e quando a criação ocorreu.

### US-SIS-005 - Consultar os detalhes de um condomínio

Como administrador do sistema, quero consultar os detalhes de um condomínio para acompanhar sua configuração e sua estrutura de acesso.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O sistema deve apresentar, no mínimo, nome, identificador de acesso e situação do condomínio.
- O sistema deve apresentar as casas, os usuários e os gestores vinculados ao condomínio.
- O sistema deve diferenciar moradores, gestores ativos e usuários inativos.
- O administrador deve conseguir acessar os detalhes de uma casa ou de um usuário a partir do condomínio.
- O contexto do condomínio selecionado deve permanecer claramente identificado durante a navegação.
- O sistema não deve misturar casas, usuários, contribuições ou documentos de condomínios diferentes.

### US-SIS-006 - Editar os dados de um condomínio

Como administrador do sistema, quero editar os dados de um condomínio para manter sua identificação atualizada.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O administrador deve conseguir alterar o nome e o identificador de acesso do condomínio.
- O identificador de acesso deve continuar sendo único na plataforma.
- A alteração não deve remover casas, usuários, contribuições ou documentos relacionados ao condomínio.
- O sistema deve registrar os dados alterados, o administrador responsável e a data e hora da ação.
- Uma falha na alteração não deve deixar o condomínio com dados parcialmente atualizados.

### US-SIS-007 - Ativar e inativar um condomínio

Como administrador do sistema, quero controlar a situação de um condomínio para impedir ou restabelecer o acesso à sua área quando necessário.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O administrador deve conseguir ativar ou inativar um condomínio.
- O sistema deve solicitar confirmação antes de inativar o condomínio.
- Usuários vinculados a um condomínio inativo não devem conseguir acessar suas áreas internas nesse condomínio.
- A inativação não deve apagar casas, usuários, contribuições, comprovantes ou documentos.
- A reativação deve restabelecer o acesso dos usuários que continuarem ativos e autorizados.
- O sistema deve registrar a ação, o administrador responsável e a data e hora.

### US-SIS-008 - Cadastrar as casas iniciais de um condomínio

Como administrador do sistema, quero cadastrar as casas iniciais de um condomínio para preparar sua estrutura antes da entrada dos moradores.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.
- O condomínio deve estar cadastrado.

Critérios de aceite:

- O administrador deve conseguir cadastrar uma casa individualmente.
- O administrador deve conseguir cadastrar várias casas em uma única operação.
- Cada casa deve possuir uma identificação única dentro do condomínio.
- A mesma identificação pode existir em condomínios diferentes.
- O sistema deve indicar identificações inválidas ou duplicadas antes de concluir o cadastro em lote.
- Nenhuma casa deve ser vinculada a outro condomínio por engano.
- Após o cadastro, as casas devem ficar disponíveis para vínculos de moradores no condomínio correto.

### US-SIS-009 - Designar um gestor de condomínio

Como administrador do sistema, quero conceder permissão de gestor a um usuário para delegar a administração operacional de um condomínio.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.
- O usuário e o condomínio devem estar cadastrados e ativos.

Critérios de aceite:

- O administrador deve conseguir selecionar o usuário e o condomínio da permissão.
- A permissão deve valer somente para o condomínio selecionado.
- O sistema deve permitir mais de um gestor ativo no mesmo condomínio.
- A permissão de gestor não deve tornar o usuário responsável por uma casa automaticamente.
- Após a concessão, o usuário deve conseguir acessar o painel administrativo do condomínio.
- O sistema deve registrar o usuário afetado, o administrador responsável e a data e hora da concessão.
- O sistema não deve criar permissões duplicadas para o mesmo usuário no mesmo condomínio.

### US-SIS-010 - Remover a permissão de um gestor

Como administrador do sistema, quero remover a permissão de gestor para revogar um acesso administrativo que não deve mais existir.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.
- O usuário deve possuir permissão de gestor no condomínio selecionado.

Critérios de aceite:

- O administrador deve conseguir remover a permissão de gestor de um condomínio específico.
- A remoção deve impedir novas ações administrativas no condomínio.
- A remoção não deve apagar ações ou registros históricos realizados pelo gestor.
- Quando o usuário também for morador, seu acesso à própria casa deve ser preservado.
- Uma permissão do mesmo usuário em outro condomínio não deve ser afetada.
- O sistema deve registrar o usuário afetado, o administrador responsável e a data e hora da remoção.

### US-SIS-011 - Consultar usuários da plataforma

Como administrador do sistema, quero consultar os usuários da plataforma para apoiar a gestão de acessos e vínculos.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O sistema deve listar os usuários cadastrados na plataforma.
- Para cada usuário, o sistema deve apresentar, no mínimo, nome, situação e vínculos com condomínios e casas.
- O sistema deve indicar quando o usuário possui permissão de gestor ou de administrador do sistema.
- O administrador deve conseguir localizar usuários por nome, telefone ou e-mail.
- O administrador deve conseguir acessar os detalhes de um usuário listado.
- Dados pessoais devem ser exibidos apenas na medida necessária para a gestão operacional.

### US-SIS-012 - Desativar e reativar um usuário

Como administrador do sistema, quero desativar ou reativar um usuário para controlar seu acesso à plataforma.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O administrador deve conseguir desativar um usuário sem apagar seu cadastro.
- O usuário desativado não deve conseguir iniciar uma nova sessão em nenhum condomínio.
- A desativação não deve apagar vínculos, comprovantes, pagamentos nem registros históricos.
- O administrador deve conseguir reativar o usuário quando seus vínculos continuarem válidos.
- O sistema deve solicitar confirmação antes da desativação.
- O sistema deve impedir que o administrador desative a própria conta durante a sessão atual.
- O sistema deve registrar a ação, o administrador responsável e a data e hora.

### US-SIS-013 - Apoiar a recuperação de acesso de um usuário

Como administrador do sistema, quero iniciar a recuperação de acesso de um usuário para ajudá-lo sem conhecer ou definir sua senha.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O administrador deve conseguir iniciar o envio de um convite temporário de redefinição para o telefone ou e-mail cadastrado.
- O sistema não deve exibir a senha atual do usuário.
- O convite deve possuir validade limitada e deixar de funcionar após o uso.
- Um novo convite deve invalidar os convites anteriores ainda não utilizados.
- O sistema deve registrar quem iniciou a recuperação e quando a ação ocorreu.
- Uma falha no envio deve ser informada sem alterar a senha ou bloquear o acesso atual do usuário.

### US-SIS-014 - Consultar o histórico de ações administrativas

Como administrador do sistema, quero consultar o histórico de ações administrativas para investigar alterações e manter a rastreabilidade da plataforma.

Precondições:

- O administrador deve atender às precondições da US-SIS-001.

Critérios de aceite:

- O sistema deve registrar, no mínimo, criação e alteração de condomínios, mudanças de situação e concessão ou remoção de permissões.
- Cada registro deve identificar a ação, o alvo afetado, o responsável e a data e hora.
- O administrador deve conseguir consultar o histórico de um condomínio ou usuário específico.
- Registros históricos não devem ser alterados quando um usuário, casa ou condomínio for inativado.
- O histórico deve respeitar a ordem cronológica e não deve permitir edição manual.

### US-SIS-015 - Garantir o isolamento entre condomínios [IDEAÇÃO]

Como administrador do sistema, quero que os dados de cada condomínio permaneçam isolados para impedir acessos indevidos entre diferentes comunidades.

Critérios de aceite:

- Toda casa deve pertencer a exatamente um condomínio.
- Todo vínculo de morador deve identificar a casa e, por consequência, o condomínio ao qual pertence.
- Toda permissão de gestor deve identificar explicitamente o condomínio em que é válida.
- Gestores e moradores não devem consultar ou alterar dados de outro condomínio sem uma permissão correspondente.
- O isolamento deve ser validado tanto na navegação quanto nas operações realizadas pelo sistema.
- Alterar identificadores enviados pelo cliente não deve permitir acesso a outro condomínio.
- O administrador do sistema deve acessar dados entre condomínios somente pelas funcionalidades exclusivas do seu painel.
