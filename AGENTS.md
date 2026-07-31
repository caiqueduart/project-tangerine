# AGENTS.md

## Escopo

Estas instruções valem para todo o repositório. Antes de alterar qualquer arquivo, leia o código próximo e preserve as convenções já adotadas. Instruções específicas fornecidas pelo usuário sempre têm precedência sobre este documento.

## Princípios de trabalho

- Faça alterações pequenas, focadas e compatíveis com a arquitetura existente.
- Não altere arquivos, comportamentos ou estilos fora do escopo solicitado.
- Não invente APIs, rotas, dados de domínio ou páginas que ainda não existem.
- Reutilize componentes, tokens, mixins, funções e configurações existentes antes de criar novos equivalentes.
- Evite abstrações prematuras. Extraia algo quando houver responsabilidade própria, reutilização real ou ganho claro de legibilidade.
- Preserve alterações existentes no worktree que não pertençam à tarefa.
- Ao implementar um design, trate o Figma como referência visual e comportamental. Adapte o resultado ao Angular e às convenções deste projeto; não copie código gerado literalmente.
- A flexibilidade pode ser uma opção, sempre pergunte antes de fazer qualquer coisa do que está listado acima.

## HTML e semântica

- Escolha tags HTML pelo significado e pela estrutura do conteúdo, nunca pela aparência padrão do navegador.
- Não use `b`, `strong`, `small`, `i` ou outras tags apenas para aplicar peso, tamanho ou estilo visual.
- Defina peso, tamanho, cor e demais características visuais exclusivamente no SCSS.
- Use elementos interativos semanticamente corretos: `button` para ações, `a` para navegação e controles Material quando seu comportamento ou acessibilidade forem úteis.
- A área clicável deve corresponder somente ao controle pretendido. Não envolva conteúdo estático em botões ou links para facilitar o layout.
- Inclua nomes acessíveis em controles cujo propósito não seja evidente pelo texto visível.
- Mantenha uma linha em branco entre blocos relevantes do template para favorecer a leitura.

## Angular e TypeScript

- Use componentes standalone e declare dependências no array `imports` do componente.
- Prefira `inject()` para injeção de dependências, seguindo o padrão atual do projeto.
- Use signals para estado local reativo quando forem adequados.
- Mantenha propriedades imutáveis como `readonly` quando não precisarem ser reatribuídas.
- Mantenha interfaces locais próximas de seu uso quando não forem compartilhadas.
- Componentes devem ter responsabilidade clara e se possível, burros.
- Conteúdo que aparece tanto em menu quanto em bottom sheet deve ser um componente reutilizável, sem duplicação de template.

## Angular Material

- Utilize Angular Material sempre que ele fornecer comportamento, acessibilidade ou integração útil.
- Não dependa da estrutura interna renderizada pelos componentes Material.
- Não use `::ng-deep`.
- Não use `!important` para vencer estilos do Material.
- Quando uma customização for realmente global e válida para todas as ocorrências, coloque-a em `_material-overwrites.scss`.
- Customizações específicas de um componente devem permanecer no SCSS desse componente.
- Prefira APIs públicas, tokens, mixins e classes de painel fornecidas pelo Material.

## SCSS e estilos

- Use classes no padrão BEM para componentes e blocos visuais.
- Use nesting do SCSS quando ele melhorar a leitura e produzir o seletor pretendido.
- Remova propriedades redundantes, valores padrão desnecessários e dimensões que o próprio conteúdo ou layout já resolvem.
- Prefira propriedades concisas, como `inset`, quando expressarem melhor a intenção.
- Use tokens CSS da paleta para cores semânticas. Não crie cores avulsas sem necessidade de design.
- Reutilize mixins de `_mixins.scss` para superfícies compartilhadas.
- Reutilize funções de `_functions.scss`.
- Nos componentes, todo `font-size` originado em pixels deve usar `pxToRem()`.
- Use unidades relativas para tipografia e preserve pixels onde representam medidas físicas do layout definidas pelo design.
- Não aplique estilos por meio de tags cuja escolha tenha sido motivada apenas pela aparência.
- Reutilize os breakpoints e limites globais de `_variables.scss`; não repita esses valores diretamente nos componentes.

## Layout e responsividade

- Desenvolva mobile first.
- Preserve as medidas e hierarquia visual dos frames mobile do Figma.
- Projete o comportamento desktop de maneira coerente, sem simplesmente ampliar o layout mobile.
- Barras inferiores podem se transformar em navegação lateral no desktop quando esse for o padrão definido.
- Bottom sheets mobile devem se transformar em menus ou overlays flutuantes adequados no desktop.
- Evite conteúdo encoberto por barras fixas; reserve o espaçamento necessário no container principal.
- Use a escala padrão de breakpoints definida em `_variables.scss`: `sm` em `640px`, `md` em `768px`, `lg` em `1024px`, `xl` em `1280px` e `2xl` em `1536px`.
- Declare os valores dos breakpoints em pixels.
- Use `$breakpoint-compact-height` em `800px` para adaptações relacionadas à altura reduzida da viewport.
- Importe e reutilize os tokens `$breakpoint-sm`, `$breakpoint-md`, `$breakpoint-lg`, `$breakpoint-xl` e `$breakpoint-2xl`; não declare breakpoints avulsos diretamente nos componentes.
- Use a sintaxe moderna de intervalos nas media queries, como `(width >= $breakpoint-md)` e `(width < $breakpoint-sm)`.
- Use `$system-container-max-width`, definido em `1280px`, como limite de largura do container principal do sistema.

## Organização de arquivos

- Mantenha classe TypeScript, template HTML e SCSS no mesmo diretório do componente.
- Dê nomes de arquivos e seletores que expressem a responsabilidade do componente.
- Mantenha configurações de rota centralizadas nos arquivos de configuração existentes.
- Coloque estilos globais apenas em `src/styles` e apenas quando forem realmente compartilhados.
- Não mova arquivos apenas por preferência pessoal; faça isso quando a organização resultante representar melhor a responsabilidade do código.

## Formatação

- Siga `.prettierrc`: aspas simples, trailing commas, largura de 120 caracteres e indentação de quatro espaços.
- Formate somente os arquivos afetados pela tarefa sempre que possível.
- Não reformate arquivos não relacionados.

## Verificação

- Após alterações no frontend, execute `npm run build --workspace frontend`.
- Em alterações que cruzem workspaces, execute também `npm run build` na raiz quando for viável.
- Execute testes relevantes quando existirem ou quando o comportamento alterado tiver cobertura.
- Execute `git diff --check` antes de concluir.
- Verifique que a compilação não introduziu erros nem novos avisos.
- Para mudanças visuais relevantes, valide os breakpoints mobile e desktop em proporção ao risco da alteração.

## Comunicação

- Responda em português, salvo pedido em contrário.
- Seja direto e explique decisões apenas quando elas ajudarem a entender impacto ou trade-offs.
- Ao finalizar, informe o que mudou, quais validações foram executadas e qualquer limitação real ainda existente.
