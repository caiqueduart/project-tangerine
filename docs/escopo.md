# Plataforma de gestão para o condomínio Corumbá II

## Contexto

Atualmente, o Condomínio Corumbá II não possui uma gestão formal: não há interfone, síndico(a) eleito(a) nem um conjunto de regras claras (incluindo regras que permitam aplicar multas em caso de descumprimento).

Na prática, os moradores se organizam de forma pontual. Sempre que surge uma necessidade (por exemplo, conserto do portão, pintura ou limpeza), o grupo combina uma **vaquinha** para reunir o valor necessário.

Normalmente, uma pessoa mais proativa assume a frente dessas demandas, exercendo informalmente o papel de “sindicância” não remunerada. Essa pessoa:

- Coleta as contribuições dos moradores.
- Realiza os orçamentos.
- Executa o que foi combinado (contratando serviços, comprando materiais, etc.).

Todo o planejamento e prestação de contas acontecem em um grupo de WhatsApp. Por lá, um objetivo é proposto, os orçamentos são compartilhados, o valor é dividido por casa (atualmente são 15 casas) e inicia-se o pedido de contribuição.

Como os gastos são de benefício comum, a contribuição de todas as 15 casas é obrigatória. Contudo, em casos raros de inadimplência, o condomínio adota duas saídas práticas que o sistema deve suportar:

- O serviço é cancelado.
- Um terceiro custeia o valor faltante.

Para controlar quem já contribuiu, é mantida uma lista com marcações (check). Quando uma casa paga, envia no grupo uma cópia da lista atualizada e anexa o comprovante. Após as contribuições necessárias, a execução do serviço é iniciada.

O perfil socioeconômico dos moradores está majoritariamente nas classes D e E. É esperado que, em alguns casos, nem todas as casas participem de uma vaquinha específica, embora isso não seja frequente, pode ocorrer.

Além disso, existem despesas fixas do condomínio (como limpeza mensal e a conta de energia). Todos os meses os moradores contribuem com um valor para cobrir esses custos.

## Escopo do Projeto

O objetivo inicial da plataforma é substituir o controle informal feito pelo WhatsApp por um sistema simples, transparente e acessível, permitindo que os moradores acompanhem contribuições, pagamentos feitos por fora, comprovantes e prestação de contas do condomínio.

O sistema deve priorizar clareza, baixo atrito de uso e funcionamento em celular, considerando que boa parte dos moradores pode ter pouca familiaridade com sistemas mais complexos.

## Perfis de Usuário

### Morador

Usuário vinculado a uma casa do condomínio. Pode visualizar contribuições, enviar comprovantes, acompanhar pagamentos e consultar a prestação de contas.

Principais permissões:

- Acessar o sistema com login e senha.
- Consultar dados da própria casa.
- Enviar comprovantes de pagamento em nome da casa.
- Ver quais contribuições estão pendentes ou pagas.
- Acompanhar contribuições e prestação de contas.

### Morador com acesso administrativo

Morador vinculado a uma casa que também possui permissões especiais para organizar as demandas financeiras do condomínio, mesmo que a função de síndico ou administrador ainda seja informal.

Esse usuário continua sendo um morador e, portanto, também deve conseguir visualizar as informações, pendências e comprovantes da própria casa. O acesso administrativo funciona como uma área adicional do sistema, liberada apenas para moradores autorizados.

Principais permissões:

- Acessar as informações da própria casa como qualquer outro morador.
- Cadastrar casas e aprovar registro de moradores.
- Criar contribuições.
- Repetir contribuições em outros meses.
- Definir valores, prazos, descrição e anexos de cada contribuição.
- Visualizar pagamentos enviados por todas as casas.
- Acompanhar inadimplência.
- Registrar gastos realizados.
- Finalizar, cancelar ou marcar uma contribuição como custeada por terceiro.

### Administrador do sistema

Pessoa responsável pela configuração geral do sistema e pela gestão de usuários e permissões.

O administrador do sistema não representa uma casa nas contribuições, exceto se também estiver cadastrado como morador vinculado a uma casa.

Principais permissões:

- Acessar as áreas de gestão geral do sistema.
- Executar todas as funcionalidades administrativas do sistema, incluindo criar, abrir, finalizar e cancelar contribuições.
- Conceder permissão administrativa a moradores.
- Remover permissão administrativa de moradores.
- Gerenciar usuários e permissões.
- Apoiar manutenção operacional do sistema.

## Módulos do Sistema

### 1. Cadastro de casas e moradores

O sistema deve permitir o cadastro das 15 casas do condomínio e dos moradores vinculados a cada uma delas.

Funcionalidades previstas:

- Cadastro de casa com número ou identificação.
- Cadastro de um ou mais moradores por casa.
- Definição de um ou mais responsáveis por casa.
- Cadastro de telefone, e-mail, nome e dados básicos de acesso para moradores.
- Solicitação de cadastro por morador, selecionando uma casa já cadastrada.
- Indicação, no cadastro, de que o morador é responsável pela residência.
- Aprovação ou rejeição de solicitação de cadastro pela administração.
- Desativação de moradores.

Regras importantes:

- Uma casa pode ter mais de um morador usuário.
- Uma casa pode ter mais de um morador responsável, sem limite máximo.
- Um morador sempre atua em nome de uma casa.
- Pagamentos e pendências devem ser associados à casa, não ao morador que enviou o comprovante.
- Moradores vinculados à mesma casa veem os mesmos dados da casa.

### 2. Autenticação e acesso

O sistema deve permitir que moradores acessem suas áreas de forma segura. Alguns moradores podem possuir permissões administrativas adicionais.

Funcionalidades previstas:

- Login com telefone ou e-mail.
- Senha individual por morador.
- Recuperação ou alteração de senha.
- Diferenciação entre acesso comum de morador e permissões administrativas adicionais.
- Encerramento de sessão.

Para o MVP, pode ser adotado um fluxo simples de convite para criação ou redefinição de senha enviado ao telefone ou e-mail do usuário.

### 3. Contribuições

Este módulo concentra as contribuições do condomínio.

Não haverá separação entre vaquinha pontual e despesa fixa. Tudo será tratado como contribuição. Quando uma contribuição precisar ocorrer novamente em outro mês, o sistema deve permitir repetir a contribuição anterior e ajustar os dados antes de confirmar. (Comentário: isso reduz complexidade para moradores e para a administração.)

Funcionalidades previstas:

- Criação de contribuição por morador com acesso administrativo.
- Repetição de contribuição em outro mês.
- Título, descrição, valor total, valor por casa e prazo de pagamento.
- Possibilidade de anexar orçamentos, fotos, recibos ou documentos.
- Definição das casas participantes (todas por padrão).
- Status geral da contribuição: aberta, finalizada ou cancelada.
- Status da casa na contribuição: pendente ou pago.
- Listagem das casas pagantes e pendentes (visível apenas para moradores com acesso administrativo).
- Resumo público de participação para moradores sem acesso administrativo, como 10/15 casas contribuíram.

Regras importantes:

- Por padrão, todas as 15 casas participam das contribuições comuns.
- O valor por casa deve ser igual para todas as casas participantes.
- O morador com acesso administrativo pode remover casas específicas de uma contribuição quando houver uma justificativa.
- O sistema deve registrar quando uma contribuição for cancelada por falta de pagamento.
- O sistema deve registrar quando um terceiro cobrir o valor faltante.
- O custeio por terceiro deve registrar um valor específico.
- Após o primeiro pagamento, o valor total, o valor por casa e as casas participantes não podem ser alterados.
- Após o primeiro pagamento, informações que não alteram o valor por casa podem continuar editáveis, como título, descrição, prazo, anexos e observações.
- Qualquer morador com acesso administrativo ou administrador do sistema pode finalizar ou cancelar uma contribuição.
- Uma contribuição finalizada pode voltar ao status aberta mediante registro de motivo.
- Uma contribuição cancelada não pode voltar ao status aberta.
- Uma contribuição somente pode ser finalizada quando a gestão informar que o serviço foi pago e houver pelo menos um documento de prestação de contas anexado.
- O pagamento de todas as casas participantes, isoladamente, não finaliza a contribuição.

### 4. Pagamentos e comprovantes

O sistema deve permitir que um morador envie o comprovante de pagamento de uma contribuição em nome da sua casa.

Funcionalidades previstas:

- Upload de imagem ou PDF do comprovante.
- Registro do valor pago.
- Registro da data do pagamento.
- Campo opcional para observação.
- Status da casa na contribuição: pendente enquanto nenhum comprovante tiver sido enviado e pago após o envio de pelo menos um comprovante.
- Visualização do comprovante pelo morador com acesso administrativo.
- Histórico de comprovantes enviados por contribuição.

Regras importantes:

- O envio do comprovante deve marcar automaticamente a casa como paga. (Comentário: não haverá aprovação ou rejeição de comprovante no MVP.)
- O sistema não validará automaticamente o valor apresentado no comprovante.
- O sistema deve manter rastreabilidade mínima: quem enviou e quando enviou.

### 5. Prestação de contas documental

O sistema deve permitir que a gestão do condomínio compartilhe documentos de prestação de contas com os moradores.

A prestação de contas será feita pelo próprio morador com acesso administrativo ou administrador do sistema, por meio de upload de documentos. O sistema não deve controlar caixa, saldo bancário, conta bancária ou valor real disponível para o condomínio.

Funcionalidades previstas:

- Upload de notas fiscais, recibos, fotos ou documentos de execução do serviço.
- Upload de mais de um documento de prestação de contas por contribuição.
- Consulta dos documentos de prestação de contas pelos moradores.

Informações úteis para moradores:

- Quais documentos de prestação de contas foram enviados.
- Quando os documentos foram enviados.
- A qual contribuição os documentos estão vinculados.

Regras importantes:

- O sistema apenas armazena e exibe os documentos enviados.
- Pelo menos um documento de prestação de contas deve estar anexado para que a contribuição possa ser finalizada.
- O sistema não lê, interpreta ou valida automaticamente comprovantes, notas fiscais ou recibos.
- O sistema não monitora contas bancárias.
- O sistema não calcula caixa real do condomínio.

### 6. Painel do morador

Área inicial do morador após o login.

Deve mostrar de forma simples:

- Contribuições pendentes da casa.
- Contribuições já pagas.
- Contribuições em aberto.
- Resumo de participação das contribuições, sem identificar casas pendentes.
- Comunicados ou observações da gestão do condomínio, se existirem.

### 7. Área administrativa

Área adicional disponível apenas para moradores com permissão administrativa.

O morador com acesso administrativo também deve manter acesso ao painel do morador, com as informações da sua própria casa. A área administrativa não substitui o painel do morador; ela complementa o acesso desse usuário.

Deve mostrar:

- Contribuições abertas.
- Casas pendentes por contribuição.
- Comprovantes enviados.
- Alertas de prazo ou inadimplência.

## Fora do Escopo Inicial

Para manter o MVP simples, os seguintes itens ficam fora do escopo inicial:

- Pagamento online integrado com cartão, Pix automático ou boleto.
- Aplicação automática de multas.
- Assembleia digital com votação formal.
- Gestão jurídica completa do condomínio.
- Chat interno substituindo o WhatsApp.
- Aplicativo mobile nativo publicado em loja.
- Integração bancária automática.
- Notificações automáticas por WhatsApp.
- Controle de caixa ou saldo bancário do condomínio.
- Leitura automática de comprovantes, notas fiscais ou recibos.

Esses pontos podem ser avaliados em versões futuras, depois que o controle básico de contribuições, comprovantes e prestação de contas estiver funcionando.

## Questões em Aberto

- Quem será o morador com acesso administrativo inicial do sistema?
- Haverá mais de um morador com acesso administrativo?
- O condomínio pretende formalizar síndico, regras e multas em uma fase futura?
