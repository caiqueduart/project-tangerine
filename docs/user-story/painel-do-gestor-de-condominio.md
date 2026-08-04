# Histórias de Usuário

## Épico: Painel administrativo do gestor de condomínio

### US-GES-001 - Acessar o painel administrativo do condomínio

Como gestor de condomínio, quero acessar uma área administrativa adicional para gerenciar o condomínio ao qual minha permissão está vinculada.

Precondições:

- O usuário deve estar autenticado.
- O usuário deve possuir permissão administrativa ativa no condomínio acessado.

Critérios de aceite:

- O sistema deve exibir uma opção clara para acessar o painel administrativo quando o usuário possuir permissão de gestor.
- O gestor que também for morador deve continuar conseguindo acessar o espaço do morador e os dados da própria casa.
- O painel deve identificar claramente o condomínio que está sendo administrado.
- O sistema deve restringir consultas e ações administrativas ao condomínio da permissão utilizada.
- O sistema deve bloquear o acesso de moradores sem permissão administrativa.
- Caso a permissão seja removida, o usuário deve perder o acesso administrativo sem perder seu acesso de morador.
- Caso a sessão esteja inválida ou expirada, o sistema deve impedir o acesso e direcionar o usuário para a tela de login.

### US-GES-002 - Visualizar o resumo administrativo do condomínio [IDEAÇÃO]

Como gestor de condomínio, quero visualizar um resumo operacional para identificar rapidamente as situações que exigem atenção.

Precondições:

- O gestor deve atender às precondições da US-GES-001.

Critérios de aceite:

- O resumo deve apresentar, no mínimo, a quantidade de casas, moradores ativos e solicitações de cadastro pendentes.
- O resumo deve apresentar as contribuições abertas e os respectivos prazos.
- O resumo deve destacar contribuições que possuam casas com pagamento pendente.
- O resumo deve apresentar os comprovantes enviados recentemente.
- O gestor deve conseguir acessar a área relacionada a partir de cada informação resumida.
- Quando não houver pendências, o sistema deve apresentar uma mensagem simples, sem deixar a área em branco.
- O resumo não deve apresentar dados pertencentes a outro condomínio.

### US-GES-003 - Consultar as casas do condomínio

Como gestor de condomínio, quero consultar as casas cadastradas para acompanhar sua identificação e seus moradores.

Precondições:

- O gestor deve atender às precondições da US-GES-001.

Critérios de aceite:

- O sistema deve listar somente casas do condomínio administrado.
- Para cada casa, o sistema deve apresentar, no mínimo, sua identificação e a quantidade de moradores vinculados.
- O gestor deve conseguir localizar uma casa por sua identificação.
- O gestor deve conseguir acessar os detalhes de uma casa listada.
- Quando não houver casas cadastradas, o sistema deve apresentar uma mensagem simples e uma opção para cadastrar a primeira casa.

### US-GES-004 - Cadastrar uma casa

Como gestor de condomínio, quero cadastrar uma casa para permitir o vínculo de moradores e sua participação nas contribuições.

Precondições:

- O gestor deve atender às precondições da US-GES-001.

Critérios de aceite:

- O gestor deve informar uma identificação para a casa.
- A identificação da casa deve ser única dentro do condomínio.
- A mesma identificação pode existir em condomínios diferentes.
- O sistema deve validar os campos obrigatórios antes de concluir o cadastro.
- Após o cadastro, a casa deve ficar disponível para consulta e para novos vínculos de moradores no mesmo condomínio.
- Uma falha no cadastro não deve produzir uma casa parcialmente registrada.

### US-GES-005 - Editar uma casa

Como gestor de condomínio, quero corrigir a identificação de uma casa para manter o cadastro do condomínio atualizado.

Precondições:

- O gestor deve atender às precondições da US-GES-001.
- A casa deve pertencer ao condomínio administrado.

Critérios de aceite:

- O gestor deve conseguir alterar a identificação da casa.
- O sistema deve continuar exigindo que a identificação seja única dentro do condomínio.
- A alteração não deve remover moradores, comprovantes, pagamentos ou contribuições relacionados à casa.
- O sistema deve registrar quem realizou a alteração e quando ela ocorreu.
- O gestor não deve conseguir editar uma casa pertencente a outro condomínio.

### US-GES-006 - Consultar os moradores do condomínio

Como gestor de condomínio, quero consultar os moradores para acompanhar seus vínculos e suas situações de acesso.

Precondições:

- O gestor deve atender às precondições da US-GES-001.

Critérios de aceite:

- O sistema deve listar somente moradores vinculados a casas do condomínio administrado.
- Para cada morador, o sistema deve apresentar, no mínimo, nome, casa, situação do acesso e indicação de responsável pela residência.
- O gestor deve conseguir localizar moradores por nome, telefone, e-mail ou identificação da casa.
- O gestor deve conseguir acessar os detalhes de um morador listado.
- O sistema deve diferenciar moradores ativos, inativos e com solicitação pendente.
- Quando não houver moradores, o sistema deve apresentar uma mensagem simples, sem deixar a área em branco.

### US-GES-007 - Cadastrar e vincular um morador

Como gestor de condomínio, quero cadastrar um morador e vinculá-lo a uma casa para liberar seu acesso ao sistema.

Precondições:

- O gestor deve atender às precondições da US-GES-001.
- A casa selecionada deve pertencer ao condomínio administrado.

Critérios de aceite:

- O gestor deve conseguir informar nome, telefone, e-mail e casa do morador.
- O gestor deve conseguir indicar se o morador é responsável pela residência.
- O sistema não deve permitir duplicidade de telefone ou e-mail.
- O morador deve estar vinculado a uma casa antes de ter o acesso liberado.
- O cadastro não deve conceder automaticamente permissão administrativa ao morador.
- O sistema deve fornecer um fluxo seguro para definição ou criação da senha do morador.
- O gestor não deve conseguir vincular o morador a uma casa de outro condomínio.

### US-GES-008 - Analisar solicitações de cadastro

Como gestor de condomínio, quero aprovar ou rejeitar solicitações de cadastro para impedir vínculos indevidos com as casas do condomínio.

Precondições:

- O gestor deve atender às precondições da US-GES-001.

Critérios de aceite:

- O sistema deve listar somente solicitações relacionadas a casas do condomínio administrado.
- O gestor deve conseguir consultar os dados informados e a casa selecionada antes de decidir.
- O gestor deve conseguir manter ou remover a indicação de responsável pela residência durante a aprovação.
- A aprovação deve ativar o vínculo do morador com a casa selecionada.
- A rejeição não deve liberar acesso às áreas internas.
- O sistema deve registrar a decisão, o gestor responsável e a data e hora da ação.
- Uma solicitação já decidida não deve ser processada novamente.

### US-GES-009 - Gerenciar responsáveis de uma casa

Como gestor de condomínio, quero definir os responsáveis de uma casa para manter corretamente os papéis dos moradores da residência.

Precondições:

- O gestor deve atender às precondições da US-GES-001.
- O morador e a casa devem pertencer ao condomínio administrado.

Critérios de aceite:

- O gestor deve conseguir atribuir ou remover a indicação de responsável de um morador vinculado à casa.
- Uma casa deve poder possuir mais de um morador responsável.
- A indicação de responsável não deve conceder permissão administrativa no condomínio.
- A alteração não deve mudar o histórico de pagamentos ou comprovantes da casa.
- O sistema deve registrar quem realizou a alteração e quando ela ocorreu.

### US-GES-010 - Desativar e reativar o acesso de um morador

Como gestor de condomínio, quero desativar ou reativar o acesso de um morador para controlar quem pode acessar os dados da residência.

Precondições:

- O gestor deve atender às precondições da US-GES-001.
- O morador deve possuir vínculo com uma casa do condomínio administrado.

Critérios de aceite:

- O gestor deve conseguir desativar o acesso de um morador sem apagar seu cadastro.
- O morador desativado não deve conseguir iniciar uma nova sessão.
- A desativação não deve apagar comprovantes, pagamentos nem registros históricos do morador.
- O gestor deve conseguir reativar o acesso quando o vínculo continuar válido.
- O sistema deve registrar a ação, o gestor responsável e a data e hora.
- O gestor não deve conseguir alterar o acesso de usuários sem vínculo com o condomínio administrado.

### US-GES-011 - Criar uma contribuição

Como gestor de condomínio, quero criar uma contribuição para organizar uma arrecadação entre as casas participantes.

Precondições:

- O gestor deve atender às precondições da US-GES-001.

Critérios de aceite:

- O gestor deve informar título, descrição, valor total, prazo e casas participantes.
- Por padrão, o sistema deve selecionar todas as casas do condomínio.
- O sistema deve calcular um valor igual para cada casa participante.
- O gestor deve conseguir remover casas antes da criação mediante justificativa.
- A contribuição deve ser criada com status aberta.
- O gestor deve conseguir anexar documentos de apoio.
- A contribuição não deve incluir casas de outro condomínio.
- Uma falha na criação não deve produzir uma contribuição parcialmente registrada.

### US-GES-012 - Gerenciar uma contribuição

Como gestor de condomínio, quero editar, repetir, finalizar ou cancelar uma contribuição para acompanhar todo o seu ciclo de vida.

Precondições:

- O gestor deve atender às precondições da US-GES-001.
- A contribuição deve pertencer ao condomínio administrado.

Critérios de aceite:

- Antes do primeiro pagamento, o gestor deve conseguir alterar os dados e as casas participantes da contribuição.
- Após o primeiro pagamento, o sistema deve bloquear alterações no valor total, no valor por casa e nas casas participantes.
- O gestor deve conseguir repetir uma contribuição, criando uma nova contribuição sem alterar a original.
- O gestor deve conseguir cancelar uma contribuição aberta.
- Uma contribuição cancelada não deve aceitar novos comprovantes nem voltar ao status aberta.
- O gestor somente deve conseguir finalizar uma contribuição quando o serviço estiver marcado como pago e houver ao menos um documento de prestação de contas.
- O gestor deve conseguir reabrir uma contribuição finalizada mediante registro obrigatório do motivo.
- O sistema deve registrar as mudanças de status, o responsável e a data e hora de cada ação.

### US-GES-013 - Acompanhar pagamentos e comprovantes

Como gestor de condomínio, quero acompanhar os pagamentos das casas e consultar seus comprovantes para identificar as pendências de uma contribuição.

Precondições:

- O gestor deve atender às precondições da US-GES-001.

Critérios de aceite:

- O sistema deve apresentar as casas pagas e pendentes de cada contribuição do condomínio.
- O gestor deve conseguir consultar o histórico de comprovantes por contribuição e por casa.
- Para cada comprovante, o sistema deve apresentar, no mínimo, arquivo, valor informado, data do pagamento, usuário que enviou e data e hora do envio.
- O gestor deve conseguir visualizar ou baixar o comprovante.
- O sistema deve marcar a casa como paga após o envio de pelo menos um comprovante, sem exigir aprovação.
- O sistema não deve interpretar nem validar automaticamente o conteúdo do comprovante.
- O gestor não deve conseguir consultar comprovantes de outro condomínio.

### US-GES-014 - Registrar a prestação de contas

Como gestor de condomínio, quero anexar documentos de prestação de contas para demonstrar aos moradores como a contribuição foi utilizada.

Precondições:

- O gestor deve atender às precondições da US-GES-001.
- A contribuição deve pertencer ao condomínio administrado.

Critérios de aceite:

- O gestor deve conseguir anexar mais de um documento a uma contribuição.
- O sistema deve aceitar notas fiscais, recibos, fotos ou documentos relacionados à execução do serviço.
- O sistema deve registrar quem enviou cada documento e a data e hora do envio.
- Os moradores das casas participantes devem conseguir consultar os documentos anexados.
- O sistema não deve ler, interpretar ou validar automaticamente o conteúdo dos documentos.
- O sistema não deve permitir a finalização da contribuição sem ao menos um documento de prestação de contas.

### US-GES-015 - Publicar comunicados para os moradores [IDEAÇÃO]

Como gestor de condomínio, quero publicar comunicados para compartilhar avisos com os moradores do condomínio.

Precondições:

- O gestor deve atender às precondições da US-GES-001.

Critérios de aceite:

- O gestor deve conseguir informar o conteúdo do comunicado.
- O sistema deve registrar o autor e a data e hora da publicação.
- O comunicado deve ser exibido somente aos moradores do mesmo condomínio.
- O gestor deve conseguir consultar os comunicados já publicados.
- O gestor não deve conseguir publicar ou alterar comunicados de outro condomínio.
- Uma falha na publicação não deve exibir um comunicado incompleto aos moradores.
