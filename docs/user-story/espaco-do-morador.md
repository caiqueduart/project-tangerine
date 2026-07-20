# Histórias de Usuário

## Épico: Espaço do morador

### US-MOR-001 - Acessar o espaço do morador

Como morador vinculado a uma casa, quero acessar o espaço do morador após a autenticação para consultar as informações da minha residência.

Precondições:

- O usuário deve estar autenticado.
- O cadastro do morador deve estar ativo e vinculado a uma casa.

Critérios de aceite:

- Após autenticar-se, o morador deve ser direcionado ao espaço do morador.
- O espaço deve identificar claramente o condomínio e a casa à qual o morador está vinculado.
- Moradores vinculados à mesma casa devem acessar as mesmas informações financeiras da residência.
- O espaço não deve exibir opções de criação, edição, cancelamento, finalização ou administração de contribuições.
- O morador não deve conseguir acessar dados de outras casas.
- O administrador do sistema somente deve acessar o espaço quando também possuir cadastro ativo de morador vinculado a uma casa.
- Caso a sessão esteja inválida ou expirada, o sistema deve impedir o acesso e direcionar o usuário para a tela de login.

### US-MOR-002 - Visualizar o resumo da própria casa

Como morador, quero visualizar um resumo a situação da minha casa para identificar rapidamente se existem contribuições pendentes.

Precondições:

- O morador deve atender às precondições da US-MOR-001.

Critérios de aceite:

- O resumo deve apresentar as contribuições abertas das quais a casa participa e que estão com status de pagamento pendente para a casa.
- Para cada pendência, o sistema deve apresentar, no mínimo, título, valor atribuído à casa e prazo.
- O resumo deve permitir que o morador acesse a contribuição apresentada.
- Quando não houver contribuições pendentes, o sistema deve informar claramente que a casa está em dia.
- O resumo deve apresentar comunicados recentes da gestão quando existirem.
- Quando não houver contribuições pendentes nem comunicados, o sistema deve apresentar uma mensagem simples, sem deixar a área em branco.
- O resumo não deve identificar quais outras casas estão pendentes ou pagas.

### US-MOR-003 - Consultar contribuições da casa

Como morador, quero consultar as contribuições das quais minha casa participa para acompanhar sua situação e o pagamento da residência.

Precondições:

- O morador deve atender às precondições da US-MOR-001.

Critérios de aceite:

- O sistema deve listar somente contribuições das quais a casa do morador participa.
- O morador deve conseguir consultar contribuições abertas, finalizadas e canceladas.
- Para cada contribuição, o sistema deve apresentar, no mínimo, título, valor atribuído à casa, prazo, status geral da contribuição e status de pagamento da casa.
- O status geral da contribuição deve ser aberta, finalizada ou cancelada.
- O status de pagamento da casa deve ser pendente enquanto nenhum comprovante tiver sido enviado e pago após o envio de pelo menos um comprovante.
- O status geral da contribuição deve ser apresentado separadamente do status de pagamento da casa.
- O morador deve conseguir acessar os detalhes de uma contribuição listada.
- Quando não houver contribuições para exibir, o sistema deve apresentar uma mensagem simples, sem deixar a área em branco.
- A listagem não deve identificar quais outras casas estão pendentes ou pagas.

### US-MOR-004 - Consultar detalhes de uma contribuição

Como morador, quero consultar os detalhes de uma contribuição da qual minha casa participa para compreender o objetivo, os valores, os prazos e o andamento coletivo.

Precondições:

- O morador deve atender às precondições da US-MOR-001.
- A casa do morador deve participar da contribuição consultada.

Critérios de aceite:

- O sistema deve apresentar, no mínimo, título, descrição, valor atribuído à casa e prazo da contribuição.
- O sistema deve apresentar separadamente o status geral da contribuição e o status de pagamento da casa.
- O sistema deve apresentar o resumo de participação, informando a quantidade de casas pagas em relação ao total de casas participantes.
- O resumo de participação não deve identificar quais casas estão pendentes ou pagas.
- O morador deve conseguir consultar os comprovantes enviados em nome da própria casa para a contribuição.
- O morador deve conseguir consultar os documentos de prestação de contas disponibilizados para a contribuição.
- Quando não houver comprovante da casa, o sistema deve informar claramente que nenhum comprovante foi enviado.
- Quando não houver documento de prestação de contas, o sistema deve informar claramente que nenhum documento está disponível.
- O sistema deve impedir a consulta quando a casa do morador não participar da contribuição.

### US-MOR-005 - Enviar comprovante de pagamento da casa

Como morador, quero enviar um comprovante de pagamento em nome da minha casa para registrar sua participação em uma contribuição.

Precondições:

- O morador deve atender às precondições da US-MOR-001.
- A contribuição não deve estar cancelada.

Critérios de aceite:

- O sistema deve permitir o envio de comprovante nos formatos JPG, PNG ou PDF.
- O morador pode informar uma observação opcional.
- O campo para upload de arquivo comprovante é obrigatório.
- O sistema deve validar os campos obrigatórios, e o formato do arquivo antes do envio.
- Enquanto o envio estiver em processamento, o sistema deve informar o andamento e impedir envios duplicados.
- Após o envio bem-sucedido, o sistema deve confirmar o registro do comprovante.
- Após o envio de pelo menos um comprovante, o status de pagamento da casa deve ser pago.
- O sistema deve registrar o usuário que enviou o comprovante e a data e hora do envio.
- O sistema não deve validar automaticamente o conteúdo nem o valor apresentado no arquivo.
- O sistema não deve exigir aprovação ou rejeição do comprovante para marcar a casa como paga.
- Em caso de falha, o sistema deve informar o erro e permitir uma nova tentativa sem perder desnecessariamente os dados informados.
- O sistema não deve aceitar comprovantes para uma contribuição cancelada.

### US-MOR-006 - Consultar comprovantes da própria casa

Como morador, quero consultar os comprovantes enviados em nome da minha casa para acompanhar o histórico de pagamentos da residência.

Precondições:

- O morador deve atender às precondições da US-MOR-001.

Critérios de aceite:

- O sistema deve listar somente comprovantes enviados em nome da casa do morador.
- Para cada comprovante, o sistema deve apresentar, no mínimo, a contribuição relacionada, o nome do arquivo, o valor pago, a data do pagamento, o usuário que enviou e a data e hora do envio.
- O morador deve conseguir visualizar ou baixar o arquivo do comprovante.
- O morador deve conseguir acessar a contribuição relacionada ao comprovante.
- Moradores vinculados à mesma casa devem visualizar o mesmo histórico de comprovantes.
- Quando não houver comprovantes, o sistema deve apresentar uma mensagem simples, sem deixar a área em branco.
- O sistema deve impedir o acesso a comprovantes de outras casas.

### US-MOR-007 - Consultar prestação de contas

Como morador, quero consultar os documentos de prestação de contas das contribuições das quais minha casa participa para acompanhar a aplicação do dinheiro arrecadado.

Precondições:

- O morador deve atender às precondições da US-MOR-001.
- A casa do morador deve participar da contribuição relacionada à prestação de contas.

Critérios de aceite:

- O sistema deve listar os documentos de prestação de contas relacionados à contribuição.
- Para cada documento, o sistema deve apresentar, no mínimo, nome do arquivo e data de envio.
- O morador deve conseguir visualizar ou baixar o documento.
- O sistema deve permitir a consulta dos documentos tanto para contribuições abertas quanto para contribuições finalizadas.
- Quando não houver documentos, o sistema deve apresentar uma mensagem simples, sem deixar a área em branco.
- O sistema não deve ler, interpretar ou validar automaticamente o conteúdo dos documentos.
- O sistema deve impedir o acesso a documentos de contribuições das quais a casa do morador não participa.

### US-MOR-008 - Consultar comunicados da gestão

Como morador, quero consultar os comunicados da gestão para acompanhar avisos relacionados ao condomínio.

Precondições:

- O morador deve atender às precondições da US-MOR-001.

Critérios de aceite:

- O sistema deve listar os comunicados disponibilizados pela gestão.
- Para cada comunicado, o sistema deve apresentar, no mínimo, conteúdo e data de publicação.
- O sistema deve indicar quando houver comunicado novo ou ainda não lido.
- O morador deve conseguir acessar o conteúdo completo do comunicado quando ele não couber na listagem.
- Quando não houver comunicados, o sistema deve apresentar uma mensagem simples, sem deixar a área em branco.
