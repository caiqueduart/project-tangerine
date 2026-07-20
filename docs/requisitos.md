# Requisitos do Sistema

## Produto

Plataforma de gestão para o Condomínio Corumbá II, voltada ao controle de contribuições, comprovantes e prestação de contas.

O sistema deve substituir controles informais feitos em grupo de WhatsApp por um processo simples, transparente e acessível pelo celular.

## Atores

### Morador

Usuário vinculado a uma casa do condomínio.

Responsabilidades e acessos:

- Consultar informações da própria casa.
- Consultar contribuições pendentes e pagas.
- Enviar comprovantes de pagamento em nome da casa.
- Acompanhar contribuições, pagamentos e prestação de contas.

### Morador com acesso administrativo

Morador vinculado a uma casa que possui permissões administrativas adicionais.

Responsabilidades e acessos:

- Acessar as informações da própria casa como qualquer outro morador.
- Acessar uma área administrativa adicional.
- Gerenciar casas, moradores, contribuições, comprovantes e prestação de contas.

### Administrador do sistema

Pessoa responsável pela configuração geral do sistema e pela concessão ou remoção de permissões administrativas para moradores. Não representa uma casa nas contribuições, exceto se também estiver cadastrado como morador.

Responsabilidades e acessos:

- Acessar todas as áreas do sistema.
- Executar todas as funcionalidades administrativas, incluindo criar, abrir, finalizar e cancelar contribuições.
- Conceder permissão administrativa a moradores.
- Remover permissão administrativa de moradores.
- Gerenciar usuários e permissões.
- Apoiar manutenção operacional do sistema.

## Requisitos Funcionais

### RF-001 - Cadastro de casas

O sistema deve permitir cadastrar casas do condomínio com uma identificação única, como número ou nome.

### RF-002 - Cadastro de moradores

O sistema deve permitir cadastrar moradores com, no mínimo, nome, telefone, e-mail e casa vinculada.

### RF-003 - Vínculo entre morador e casa

O sistema deve vincular todo morador a uma casa antes que ele possa acessar as áreas internas.

### RF-004 - Múltiplos moradores por casa

O sistema deve permitir que uma casa tenha mais de um morador usuário.

### RF-005 - Responsáveis da casa

O sistema deve permitir marcar um ou mais moradores como responsáveis por uma casa, sem limite de responsáveis por casa.

### RF-006 - Desativação de moradores

O sistema deve permitir desativar moradores vinculados a uma casa, impedindo novo acesso sem apagar o histórico já registrado.

### RF-007 - Login

O sistema deve permitir login com telefone ou e-mail.

### RF-008 - Senha individual

O sistema deve manter senha individual para cada usuário.

### RF-009 - Acesso ao painel do morador

Após login bem-sucedido, o sistema deve permitir que o morador acesse o painel com informações da própria casa.

### RF-010 - Permissão administrativa

O sistema deve permitir que o administrador do sistema conceda permissão administrativa a moradores específicos.

### RF-011 - Área administrativa

O sistema deve disponibilizar a área administrativa do condomínio apenas para moradores com permissão administrativa e para administradores do sistema.

### RF-012 - Controle de acesso

O sistema deve bloquear telas e ações administrativas para moradores sem permissão administrativa.

### RF-013 - Alteração de senha

O sistema deve permitir que o usuário autenticado altere sua senha informando a senha atual.

### RF-014 - Recuperação de senha

O sistema deve permitir redefinição de senha por administrador do sistema ou por convite temporário enviado ao telefone ou e-mail do usuário.

### RF-015 - Solicitação de recuperação de senha

O sistema deve permitir que o usuário solicite recuperação de senha informando telefone ou e-mail cadastrado.

### RF-016 - Encerramento de sessão

O sistema deve permitir que o usuário encerre sua sessão e retorne à tela de login.

### RF-017 - Sessão autenticada

O sistema deve manter sessão autenticada por período definido e exigir novo login quando a sessão expirar.

### RF-018 - Criação de contribuição

O sistema deve permitir que morador com acesso administrativo ou administrador do sistema crie contribuições para casas do condomínio.

### RF-019 - Dados da contribuição

O sistema deve registrar, para cada contribuição, título, descrição, valor total, valor por casa, prazo de pagamento, casas participantes e status. (Comentário: o campo "tipo" foi removido porque não haverá separação entre vaquinha e despesa fixa.)

### RF-020 - Anexos da contribuição

O sistema deve permitir anexar arquivos de apoio à contribuição, como orçamentos, fotos, recibos ou documentos.

### RF-021 - Casas participantes

O sistema deve permitir definir quais casas participam de cada contribuição.

### RF-022 - Valor igual por casa

O sistema deve calcular a contribuição com o mesmo valor para todas as casas participantes.

### RF-023 - Repetição de contribuição

O sistema deve permitir repetir uma contribuição em outro mês, reaproveitando dados da contribuição original e permitindo ajustes antes da confirmação. (Comentário: isto cobre despesas recorrentes sem criar um segundo tipo de contribuição.)

### RF-024 - Listagem de pagantes e pendentes

O sistema deve permitir que moradores com acesso administrativo e administradores do sistema visualizem casas pagantes e pendentes por contribuição.

### RF-025 - Cancelamento de contribuição

O sistema deve permitir registrar o cancelamento de uma contribuição.

### RF-026 - Custeio por terceiro

O sistema deve permitir registrar quando um terceiro cobrir um valor específico faltante de uma contribuição.

### RF-027 - Envio de comprovante

O sistema deve permitir que morador envie comprovante de pagamento em nome da casa vinculada.

### RF-028 - Dados do pagamento

O sistema deve registrar valor pago, data do pagamento, comprovante, observação opcional, usuário que enviou e data de envio.

### RF-029 - Formatos de comprovante

O sistema deve aceitar comprovantes em formatos comuns, como JPG, PNG e PDF.

### RF-030 - Baixa automática por comprovante

Enquanto uma casa não tiver enviado nenhum comprovante para uma contribuição, o sistema deve apresentar o status de pagamento da casa como pendente. Ao enviar pelo menos um comprovante, o sistema deve marcar a casa como paga na contribuição correspondente. (Comentário: não haverá fluxo de aprovação ou rejeição de comprovante no MVP.)

### RF-031 - Histórico de comprovantes

O sistema deve manter histórico de comprovantes enviados por contribuição e por casa.

### RF-032 - Consulta de comprovantes

O sistema deve permitir que moradores com acesso administrativo e administradores do sistema visualizem os comprovantes enviados.

### RF-033 - Registro documental de prestação de contas

O sistema deve permitir registrar documentos de prestação de contas relacionados a uma contribuição.

### RF-034 - Múltiplos documentos por contribuição

O sistema deve permitir anexar mais de um documento de prestação de contas por contribuição.

### RF-035 - Anexos de prestação de contas

O sistema deve permitir anexar notas fiscais, recibos, fotos ou documentos de execução do serviço.

### RF-036 - Consulta de prestação de contas

O sistema deve permitir que moradores consultem os documentos de prestação de contas enviados pela gestão.

### RF-037 - Painel do morador

O painel do morador deve exibir contribuições pendentes da casa, contribuições pagas, contribuições em aberto e comunicados da gestão, quando existirem.

### RF-038 - Área administrativa

A área administrativa deve exibir contribuições abertas, casas pendentes, comprovantes enviados e alertas de prazo.

### RF-039 - Resumo público de participação

O sistema deve permitir que moradores sem permissão administrativa visualizem apenas o resumo de participação da contribuição, como quantidade de casas pagas sobre o total de casas participantes.

### RF-040 - Visão administrativa de pendências

O sistema deve permitir que apenas moradores com acesso administrativo e administradores do sistema visualizem quais casas ainda não pagaram uma contribuição.

### RF-041 - Status da contribuição

O sistema deve controlar o status geral da contribuição como aberta, finalizada ou cancelada. Esse status é independente do status de pagamento de cada casa, que deve ser pendente ou pago.

### RF-042 - Bloqueio de alteração financeira

Após o primeiro pagamento de uma contribuição, o sistema deve bloquear alterações em valor total, valor por casa e casas participantes.

### RF-044 - Reabertura de contribuição finalizada

O sistema deve permitir que moradores com acesso administrativo e administradores do sistema alterem uma contribuição finalizada para aberta mediante registro obrigatório de motivo.

### RF-046 - Acesso do administrador do sistema

O sistema deve permitir que o administrador do sistema acesse e execute todas as funcionalidades do sistema, incluindo gestão geral, usuários, permissões, casas, contribuições, comprovantes, prestação de contas e configurações operacionais.

### RF-047 - Remoção de permissão administrativa

O sistema deve permitir que o administrador do sistema remova a permissão administrativa de um morador.

### RF-048 - Auditoria de permissões

O sistema deve registrar quando uma permissão administrativa for concedida ou removida, incluindo usuário afetado, responsável pela ação e data da alteração.

### RF-049 - Solicitação de cadastro

O sistema deve permitir que uma pessoa solicite cadastro informando nome, telefone, e-mail, casa já cadastrada e senha.

### RF-050 - Indicação de responsável no cadastro

O sistema deve permitir que a pessoa marque, na solicitação de cadastro, que é responsável pela residência selecionada.

### RF-051 - Aprovação de cadastro

O sistema deve permitir que administrador do sistema ou morador com acesso administrativo aprove ou rejeite solicitações de cadastro antes de liberar acesso. (Comentário: este ponto reduz o risco de alguém se vincular à casa errada.)

## Regras de Negócio

### RN-001 - Morador sempre pertence a uma casa

Todo morador do sistema deve estar vinculado a uma casa. Permissões administrativas do condomínio são adicionais e não substituem o acesso de morador.

### RN-002 - Administração como permissão adicional

Moradores com acesso administrativo devem continuar acessando os dados da própria casa e também podem acessar a área administrativa.

### RN-003 - Pagamentos pertencem à casa

Pagamentos, pendências e comprovantes devem ser associados à casa, não ao morador que enviou o comprovante.

### RN-004 - Dados compartilhados por casa

Moradores vinculados à mesma casa devem visualizar os mesmos dados da casa e podem enviar comprovantes em nome da casa.

### RN-005 - Participação padrão

Por padrão, todas as 15 casas participam das contribuições comuns.

### RN-006 - Valor igual entre casas

O valor por casa deve ser igual para todas as casas participantes de uma contribuição.

### RN-007 - Remoção de casa participante

Uma casa só deve ser removida de uma contribuição quando houver justificativa registrada.

### RN-008 - Status de pagamento da casa

Uma casa deve permanecer com status pendente enquanto não tiver enviado nenhum comprovante para a contribuição. O envio de pelo menos um comprovante deve marcar a casa como paga na contribuição correspondente.

### RN-009 - Valor do comprovante não validado

O sistema não deve validar automaticamente o valor contido no comprovante enviado.

### RN-010 - Sem aprovação de comprovante

O sistema não deve exigir aprovação ou rejeição de comprovantes para confirmar pagamento no MVP. (Comentário: isso simplifica o uso, mas mantém risco de comprovante incorreto; a conferência pode ser feita manualmente fora do fluxo de aprovação.)

### RN-011 - Status aberta

Toda contribuição recém-criada deve iniciar com status aberta.

### RN-012 - Identificador único

O sistema não deve permitir duplicidade de telefone ou e-mail cadastrados.

### RN-013 - Rastreabilidade mínima

O sistema deve registrar quem enviou comprovante e quando enviou.

### RN-014 - Administrador do sistema não substitui morador

O administrador do sistema não deve ser tratado automaticamente como morador de uma casa. Para participar de contribuições como morador, ele deve possuir cadastro de morador vinculado a uma casa.

### RN-015 - Gestão de permissões restrita

Somente o administrador do sistema deve conceder ou remover permissão administrativa de moradores.

### RN-016 - Aprovação de cadastro por qualquer admin

Qualquer morador com acesso administrativo ou administrador do sistema pode aprovar ou rejeitar solicitações de cadastro de moradores.

### RN-017 - Contribuição sem tipo

O sistema deve tratar toda arrecadação como contribuição, sem classificar contribuições por tipo fixo, recorrente, vaquinha ou despesa mensal.

### RN-018 - Repetição não altera contribuição original

Ao repetir uma contribuição em outro mês, o sistema deve criar uma nova contribuição baseada na anterior, sem alterar a contribuição original.

### RN-019 - Login não deve expor existência de conta

Em caso de credenciais inválidas ou solicitação de recuperação, o sistema deve exibir mensagem genérica sem informar se telefone ou e-mail existem no cadastro.

### RN-020 - Finalização da contribuição

Uma contribuição somente pode ser marcada como finalizada quando a gestão informar que o serviço foi pago e houver pelo menos um documento de prestação de contas anexado à contribuição. O pagamento de todas as casas participantes, isoladamente, não finaliza a contribuição.

### RN-021 - Cancelamento da contribuição

Uma contribuição cancelada não deve aceitar novos comprovantes e não pode voltar ao status aberta.

### RN-023 - Privacidade de inadimplência

Somente moradores com acesso administrativo e administradores do sistema devem visualizar quais casas estão pendentes. Moradores sem permissão administrativa devem visualizar apenas o resumo de participação.

### RN-024 - Campos financeiros bloqueados após pagamento

Após o primeiro pagamento, valor total, valor por casa e casas participantes não devem ser alterados.

### RN-025 - Campos editáveis após pagamento

Após o primeiro pagamento, informações que não alteram o valor por casa podem continuar editáveis, como título, descrição, prazo, anexos e observações.

### RN-026 - Responsáveis da casa

Uma casa pode ter mais de um morador responsável, sem limite máximo de responsáveis.

### RN-027 - Atribuição de responsável

Qualquer morador com acesso administrativo ou administrador do sistema pode atribuir ou remover a marcação de responsável de uma casa.

### RN-028 - Indicação de responsável no cadastro

Quando um morador solicitar cadastro marcando que é responsável pela residência, essa indicação deve ser considerada na aprovação do cadastro.

### RN-029 - Casa selecionada no cadastro

Na solicitação de cadastro, o morador deve selecionar uma casa já cadastrada.

### RN-031 - Reabertura de contribuição exige motivo

Quando uma contribuição finalizada voltar ao status aberta, o sistema deve exigir o registro do motivo.

### RN-032 - Finalização por qualquer administrador

Qualquer morador com acesso administrativo ou administrador do sistema pode marcar uma contribuição como finalizada, desde que as condições de finalização sejam atendidas.

### RN-033 - Cancelamento por qualquer admin

Qualquer morador com acesso administrativo ou administrador do sistema pode cancelar uma contribuição.

### RN-034 - Prestação de contas obrigatória para finalização

Uma contribuição não pode ser marcada como finalizada sem pelo menos um documento de prestação de contas anexado.

### RN-035 - Prestação de contas documental

A prestação de contas consiste no envio de documentos pela gestão, como notas fiscais, recibos, fotos ou documentos relacionados à execução do serviço.

### RN-036 - Sistema não controla caixa

O sistema não deve controlar caixa, saldo bancário, conta bancária ou valor real disponível na conta do condomínio.

### RN-037 - Sistema não interpreta documentos

O sistema deve armazenar comprovantes e documentos de prestação de contas, sem ler, interpretar ou validar automaticamente o conteúdo desses arquivos.

### RN-038 - Registro documental por qualquer admin

Qualquer morador com acesso administrativo ou administrador do sistema pode anexar documentos de prestação de contas.

## Requisitos Não Funcionais

### RNF-001 - Usabilidade móvel

O sistema deve ser fácil de usar em celular.

### RNF-002 - Linguagem simples

O sistema deve usar linguagem simples e direta, evitando termos técnicos para o morador.

### RNF-003 - Baixo atrito de uso

Os fluxos principais devem exigir o menor número possível de etapas para moradores.

### RNF-004 - Baixo consumo de dados

O sistema deve evitar consumo desnecessário de dados móveis.

### RNF-005 - Segurança de acesso

O sistema deve proteger áreas internas contra acesso sem sessão válida ou sem permissão adequada.

### RNF-006 - Auditoria básica

O sistema deve manter histórico das ações principais para apoiar conferência e prestação de contas.

### RNF-007 - Escalabilidade inicial

O sistema deve atender inicialmente 15 casas, sem impedir crescimento futuro do condomínio e inclusão de outros condomínios.

### RNF-008 - Privacidade

O sistema deve respeitar privacidade, consentimento e boas práticas de uso dos telefones e e-mails cadastrados.

## Fora do Escopo do MVP

- Pagamento online integrado com cartão, Pix automático ou boleto.
- Aplicação automática de multas.
- Assembleia digital com votação formal.
- Gestão jurídica completa do condomínio.
- Chat interno substituindo o WhatsApp.
- Aplicativo mobile nativo publicado em loja.
- Integração bancária automática.
- Aprovação ou rejeição de comprovante de pagamento.
- Notificações automáticas por WhatsApp.
- Controle de caixa ou saldo bancário do condomínio.
- Leitura automática de comprovantes, notas fiscais ou recibos.

## Questões Pendentes

- Definir quem será o primeiro administrador do sistema.
- Definir quem será o primeiro morador com acesso administrativo.


