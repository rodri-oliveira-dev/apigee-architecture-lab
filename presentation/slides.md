<!-- .slide: class="title-slide" data-timing="60" -->

<div class="eyebrow">ARQUITETURA DE APIs · LABORATÓRIO DECLARATIVO</div>

# Google Cloud<br><span>Apigee</span>

## Do proxy mínimo à governança aplicada

<div class="title-meta">
  <span>Para quem já trabalha com Apigee</span>
  <span>28 minutos + perguntas</span>
</div>

<div class="navigation-hint" aria-label="Atalhos da apresentação">
  <span><kbd>←</kbd><kbd>→</kbd> navegar</span>
  <span><kbd>O</kbd> visão geral</span>
  <span><kbd>S</kbd> notas</span>
</div>

Notas:
**Mensagem principal:** Revisitar fundamentos, aprofundar o comportamento das policies e avaliar decisões de arquitetura que aparecem no cotidiano de quem trabalha com Apigee.

**Abertura:** Olá! Como vocês já trabalham com Apigee, não vamos começar do zero. Vamos usar uma API de pedidos para revisar o modelo mental e investigar decisões que parecem simples até uma falha acontecer.

**Explicação principal:** Ao final, quero que vocês consigam explicar a ordem dos flows, justificar a posição e o escopo dos controles de tráfego, e identificar riscos de confiança, reuso e tratamento de falhas. Os exemplos são independentes e aumentam em complexidade conceitual; não são versões cumulativas nem uma solução pronta para produção.

**Contexto arquitetural:** A sessão é uma conversa técnica baseada em bundles XML versionados. Não há provisionamento GCP nem execução de chamadas no runtime Apigee.

**Arquivos demonstrados:** `README.md`, `examples/` e `presentation/slides.md`.

**Transição:** Antes de entrar no problema das APIs, quero me apresentar rapidamente e explicar de onde vem esse recorte.

---

<!-- .slide: class="about-slide" data-timing="45" -->

<div class="eyebrow">QUEM CONDUZ ESTA CONVERSA</div>

## Sobre mim

<div class="about-layout">
  <img class="about-photo" src="assets/images/rodrigo-about.webp" alt="Retrato de Rodrigo de Oliveira" width="320" height="428" decoding="async">
  <div class="about-intro">
    <h3>Rodrigo de Oliveira</h3>
    <p class="about-role">Arquiteto de Software · .NET · Sistemas Distribuídos · Cloud</p>
    <p class="about-bio">Há mais de 20 anos trabalho com desenvolvimento e evolução de sistemas corporativos, especialmente aplicações backend, integrações e sistemas distribuídos.</p>
    <p class="about-bio">Hoje atuo no desenho e revisão de soluções, na definição de padrões técnicos e junto aos times de engenharia.</p>
    <p class="about-personal"><strong>Além do código:</strong> Filosofia, leitura, um bom café, jogos retrô e momentos com minha família e meus gatos.</p>
  </div>
</div>

<div class="profile-links">
  <a href="https://rodri-oliveira-dev.github.io/" target="_blank" rel="noopener noreferrer">Portfólio</a>
  <a href="https://www.linkedin.com/in/rodri-oliveira-dev" target="_blank" rel="noopener noreferrer">LinkedIn</a>
  <a href="https://github.com/rodri-oliveira-dev" target="_blank" rel="noopener noreferrer">GitHub</a>
</div>

Notas:
**Mensagem principal:** Mais de 20 anos de experiência em software e sistemas distribuídos orientam minha leitura prática do Apigee e da governança de APIs.

**Abertura:** Sou Rodrigo de Oliveira, arquiteto de software, com mais de 20 anos de experiência em sistemas corporativos.

**Explicação principal:** Minha trajetória passa por .NET, backend, integrações e sistemas distribuídos. Hoje trabalho com desenho de soluções, revisão técnica e padrões de engenharia. É desse ponto de vista que proponho olhar para o Apigee: uma fronteira entre sistemas, não apenas um produto.

**Contexto arquitetural:** Fora do trabalho, gosto de filosofia, leitura, jogos retrô e de estar com minha família e meus gatos.

**Arquivos demonstrados:** Nenhum; foto, descrição profissional e interesses foram adaptados do meu portfólio público, disponível no próprio slide.

**Transição:** Agora, por que essa fronteira precisa ser administrada?

---

<!-- .slide: data-timing="45" -->

## APIs crescem. A complexidade também.

<div class="problem-grid">
  <div class="problem-card"><span>01</span><strong>Segurança</strong><small>Quem chama? Em nome de quem?</small></div>
  <div class="problem-card"><span>02</span><strong>Capacidade</strong><small>Como controlar rajadas e consumo?</small></div>
  <div class="problem-card"><span>03</span><strong>Consistência</strong><small>Como evitar controles diferentes por API?</small></div>
  <div class="problem-card"><span>04</span><strong>Evolução</strong><small>Como mudar o backend sem quebrar clientes?</small></div>
</div>

<p class="takeaway">A fronteira da API precisa ser <strong>administrada</strong>, não apenas roteada.</p>

Notas:
**Mensagem principal:** O crescimento das APIs transforma segurança, capacidade e evolução em responsabilidades arquiteturais compartilhadas.

**Abertura:** Vocês provavelmente reconhecem esses problemas: a API de pedidos ganha consumidores, tráfego e exigências de segurança. Qual desses desafios já aparece nas nossas revisões de código?

**Explicação principal:** O mesmo contrato precisa continuar estável enquanto crescem os controles de acesso, consumo e consistência. O objetivo é revisar as escolhas que fazemos na fronteira, não transferir a regra de negócio para ela.

**Contexto arquitetural:** Uma fronteira administrada concentra preocupações transversais sem transformar o gateway no dono da regra de negócio. Isso melhora governança e desacoplamento, mas também exige clareza sobre o que pertence ao runtime e o que pertence ao ciclo de vida da API.

**Arquivos demonstrados:** `README.md`, seção “API Gateway e API Management”.

**Transição:** Essa distinção nos leva diretamente à diferença entre executar uma chamada e governar uma API ao longo do tempo.

---

<!-- .slide: data-timing="40" -->

## Gateway executa. Management governa.

<div class="compare">
  <div class="compare-card accent-cyan">
    <span class="kicker">API GATEWAY</span>
    <h3>No caminho da chamada</h3>
    <p>Recebe, aplica controles e roteia o tráfego.</p>
  </div>
  <div class="plus">+</div>
  <div class="compare-card accent-violet">
    <span class="kicker">API MANAGEMENT</span>
    <h3>Ao redor do ciclo de vida</h3>
    <p>Produtos, publicação, analytics, governança e evolução.</p>
  </div>
</div>

<p class="takeaway"><strong>Apigee combina os dois.</strong> O laboratório focaliza a configuração declarativa do runtime.</p>

Notas:
**Mensagem principal:** O gateway é uma parte do API Management; não devemos atribuir ao componente de execução toda a capacidade da plataforma.

**Abertura:** Relembremos uma distinção que faz diferença nas responsabilidades dos times.

**Explicação principal:** O gateway recebe, aplica policies e roteia. API Management inclui também produtos, publicação, onboarding, analytics e ciclo de vida. Ter um proxy não significa que a API já está governada.

**Contexto arquitetural:** Essa separação evita uma expectativa perigosa: instalar um gateway não cria governança automaticamente. Produtos, responsabilidades, observabilidade e processos de mudança continuam sendo decisões organizacionais.

**Arquivos demonstrados:** `README.md` e `README.en.md`, seção de gateway versus management.

**Transição:** Com o escopo alinhado, podemos enxergar onde o proxy entra entre o consumidor e o backend.

---

<!-- .slide: data-timing="45" -->

## Uma fronteira entre consumidor e backend

<div class="diagram-frame architecture-diagram">
  {{mermaid:docs/pt-br/architecture.md|1|architecture|Consumidor, Apigee e backend}}
</div>

<div class="legend-row">
  <span><b>Contrato</b> voltado ao consumidor</span>
  <span><b>Policies</b> no pipeline</span>
  <span><b>Target</b> desacoplado</span>
</div>

<div class="source-line">Fonte: <code>docs/pt-br/architecture.md</code> · {{github:docs/pt-br/architecture.md|Ver documentação}}</div>

Notas:
**Mensagem principal:** O API Proxy cria uma fronteira programável sem substituir o backend nem esconder as dependências do ambiente.

**Abertura:** Vamos acompanhar uma chamada de pedidos da esquerda para a direita.

**Explicação principal:** Sigam a requisição: hostname associado ao environment group, ProxyEndpoint, RouteRule, TargetEndpoint, backend. O contrato público e a conexão de saída têm responsabilidades distintas.

**Contexto arquitetural:** Separar a interface pública da conexão de destino permite evoluir URL, TLS ou configuração do backend com menor impacto sobre consumidores. Isso é desacoplamento de contrato, não ausência de dependências.

**Demonstração:** Use o diagrama projetado; o destino .invalid é fictício. Deixe os arquivos para consulta posterior.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** Agora vamos abrir essa fronteira e localizar as peças que formam um bundle implantável.

---

<!-- .slide: data-timing="45" -->

## Anatomia de um API Proxy no Apigee

<div class="split split-45">
<div>

```text
apiproxy/
├── orders-basic.xml # configuração-base
├── proxies/
│   └── default.xml
├── targets/
│   └── default.xml
├── policies/        # quando houver policies
└── resources/       # scripts/JAR/XSLT, se usados
```

</div>
<div class="stack-cards">
  <div><strong>Necessário aqui</strong><span>descritor + ProxyEndpoint + TargetEndpoint</span></div>
  <div><strong>Conforme o desenho</strong><span>policies e resources referenciados</span></div>
  <div><strong>Metadados</strong><span>listas do descritor podem ser geradas pela UI</span></div>
</div>
</div>

<div class="source-line"><code>examples/01-basic/apiproxy/</code> · {{github:examples/01-basic/apiproxy/orders-basic.xml|Ver descritor}}</div>

Notas:
**Mensagem principal:** Esta árvore é um exemplo de bundle XML tradicional do Apigee, não uma estrutura universal de API Gateways.

**Abertura:** No repositório, essa arquitetura aparece como uma estrutura pequena e deliberadamente explícita.

**Explicação principal:** Revisão rápida: descritor identifica o proxy, proxies/ guarda a interface, targets/ guarda o destino, policies/ e resources/ aparecem quando necessários. As listas do descritor são metadados opcionais. A árvore é a de um bundle XML tradicional.

**Contexto arquitetural:** `manifests/` não é um diretório padrão da estrutura de bundle documentada pelo Apigee; por isso não adicionamos um diretório artificial. O laboratório escolhe arquivos XML versionados, mas proxies também podem ser criados e editados pela UI ou APIs da plataforma. A estrutura mostrada não deve ser generalizada para outros gateways.

**Demonstração:** Aponte a árvore no slide; não abra arquivos nesta etapa.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/orders-basic.xml`, `examples/01-basic/apiproxy/proxies/default.xml` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** A estrutura fica mais clara quando seguimos uma referência concreta de um XML ao outro.

---

<!-- .slide: data-timing="50" -->

## Como os XMLs de um proxy Apigee se relacionam

<div class="split code-and-model">
<div>

{{xml:examples/01-basic/apiproxy/proxies/default.xml|13:18|2|4-5}}

<div class="source-line"><code>proxies/default.xml</code> · {{github:examples/01-basic/apiproxy/proxies/default.xml|Ver código completo}}</div>

</div>
<div class="relation-model">
  <div><span>BasePath</span><b>contrato público</b></div>
  <i>↓</i>
  <div><span>RouteRule</span><b>referência por nome</b></div>
  <i>↓</i>
  <div><span>TargetEndpoint</span><b>destino encapsulado</b></div>
</div>
</div>

Notas:
**Mensagem principal:** A configuração é declarativa, mas possui dependências referenciais que o repositório consegue validar estaticamente.

**Abertura:** Neste trecho curto existem duas decisões diferentes: como o consumidor chama a API e para onde o proxy encaminha a mensagem.

**Explicação principal:** `BasePath` participa do contrato público. A RouteRule aponta para o TargetEndpoint chamado `default`; esse valor precisa corresponder ao atributo `name` no XML do target. É essa indireção que mantém a URL do backend fora da interface pública.

**Contexto arquitetural:** Referências por nome ajudam no desacoplamento, mas falhas de digitação só aparecem cedo se forem validadas. O script local verifica essa relação, além de Steps e FlowCallouts, sem alegar equivalência ao schema completo da plataforma.

**Demonstração:** Use o XML já projetado: o nome referenciado em RouteRule deve corresponder ao TargetEndpoint. A comparação completa fica disponível no link.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/proxies/default.xml`, `examples/01-basic/apiproxy/targets/default.xml` e `scripts/validate_bundles.py`.

**Transição:** Depois de saber como os arquivos se ligam, precisamos entender quando cada trecho executa.

---

<!-- .slide: data-timing="90" -->

## Ciclo de execução dos Flows no Apigee

<div class="diagram-frame flow-diagram">
  {{mermaid:docs/pt-br/architecture.md|2|message-lifecycle|Request e response entre ProxyEndpoint e TargetEndpoint}}
</div>

<div class="flow-notes">
  <span><b>Request:</b> ProxyEndpoint → TargetEndpoint</span>
  <span><b>Response:</b> TargetEndpoint → ProxyEndpoint</span>
  <span><b>Ordem interna:</b> PreFlow → Conditional → PostFlow</span>
</div>

<div class="source-line"><code>docs/pt-br/architecture.md</code> · {{github:docs/pt-br/architecture.md|Ver sequência completa}}</div>

Notas:
**Mensagem principal:** A resposta percorre os endpoints em ordem inversa, mas a execução interna continua PreFlow, primeiro Conditional Flow compatível e PostFlow.

**Abertura:** Na volta do backend, a ordem PreFlow, Conditional Flow e PostFlow também se inverte? Pensem por alguns segundos antes de seguir as setas.

**Explicação principal:** No request, o ProxyEndpoint executa antes do TargetEndpoint. No response, a ordem entre eles se inverte. Dentro de cada pipeline, em qualquer sentido, a sequência continua PreFlow, primeiro Conditional Flow compatível e PostFlow. Cada flow executa seus Steps na ordem declarada.

**Contexto arquitetural:** A posição determina quais variáveis estão disponíveis. Não devemos inverter a ordem interna na resposta; e uma falha que interrompe a execução normal segue para tratamento de erros, não para os próximos Steps.

**Demonstração:** Resposta: não. Só a ordem entre endpoints se inverte. Use o diagrama e destaque a primeira condição compatível; o exemplo list-orders acrescenta contexto técnico apenas ao GET /.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/02-intermediate/apiproxy/proxies/default.xml`.

**Transição:** Com o modelo mental alinhado, vamos questionar decisões do pipeline intermediário.

---

<!-- .slide: data-timing="210" -->

## Autenticar, minimizar e contabilizar

<div class="split policy-slide">
<div>

{{xml:examples/02-intermediate/apiproxy/policies/verify-api-key.xml|3:4|3-4}}

<div class="source-line"><code>verify-api-key.xml</code> · {{github:examples/02-intermediate/apiproxy/policies/verify-api-key.xml|Ver código}}</div>

</div>
<div>

{{xml:examples/02-intermediate/apiproxy/policies/quota.xml|3:8|3-8}}

<div class="source-line"><code>quota.xml</code> · {{github:examples/02-intermediate/apiproxy/policies/quota.xml|Ver código}}</div>

</div>
</div>

<div class="pipeline"><b>Validar chave</b><i>→</i><span>remover <code>x-api-key</code></span><i>→</i><span>SpikeArrest</span><i>→</i><span>Quota por chave</span><i>→</i><span>correlação</span></div>

<div class="flow-notes"><span><b>SpikeArrest:</b> 10ps por proxy (rajadas)</span><span><b>Quota:</b> 100/min por chave (consumo)</span></div>

Notas:
**Mensagem principal:** SpikeArrest limita rajadas; Quota controla consumo por credencial. A ordem das policies define quais chamadas chegam a cada controle.

**Abertura:** Uma chave inválida chega ao SpikeArrest neste pipeline? E duas chaves da mesma aplicação compartilham a mesma quota? Façam uma previsão antes de olharmos o XML.

**Explicação principal:** `VerifyAPIKey` valida `x-api-key` e disponibiliza variáveis da chave. Removemos o header antes do roteamento. Depois, `SpikeArrest` limita rajadas do proxy a `10ps` em janela deslizante regional; `Quota` permite 100 chamadas por minuto para cada consumer key, em janela móvel. Por último, adicionamos correlação.

**Contexto arquitetural:** Aqui, `client_id` contém a própria chave, não o identificador lógico da aplicação: duas chaves têm contadores distintos. Como a verificação vem antes do SpikeArrest, chaves inválidas falham antes de alcançar essa policy. Portanto, ela não limita essas tentativas neste desenho. Proteger a borda antes da verificação exigiria outro controle. Os números são didáticos.

**Demonstração:** A resposta é não nos dois casos. Mostre o PreFlow e o Identifier da Quota. Compare a ordem atual com um controle de borda anterior à autenticação, sem propor uma ordem universal: proteger capacidade cedo e contabilizar somente credenciais válidas são objetivos distintos. Uma rotação de chave cria outro contador neste exemplo. Reserve uma pausa curta para a audiência justificar a escolha.

**Arquivos demonstrados:** `examples/02-intermediate/apiproxy/proxies/default.xml`, `verify-api-key.xml`, `remove-api-key.xml`, `quota.xml` e `assign-list-orders-context.xml`.

**Transição:** Além de controlar quem chama e quanto consome, precisamos decidir para onde encaminhar uma chamada sem alterar o contrato público.

---

<!-- .slide: data-timing="210" -->

## KVM e múltiplos TargetEndpoints

<div class="split policy-slide">
<div>

{{xml:examples/02-intermediate/orders-routing/apiproxy/policies/get-backend-region.xml|3:10|2|3-7}}

<div class="source-line"><code>get-backend-region.xml</code> · {{github:examples/02-intermediate/orders-routing/apiproxy/policies/get-backend-region.xml|Ver KVM policy}}</div>

</div>
<div>

{{xml:examples/02-intermediate/orders-routing/apiproxy/proxies/default.xml|21:27|3|1-3,5-6}}

<div class="source-line"><code>proxies/default.xml</code> · {{github:examples/02-intermediate/orders-routing/apiproxy/proxies/default.xml|Ver RouteRules}}</div>

</div>
</div>

<div class="pipeline"><b>KVM → variável privada</b><i>→</i><span>validar configuração</span><i>→</i><span>AssignMessage</span><i>→</i><span>secondary ou fallback primary</span></div>

Notas:
**Mensagem principal:** Uma KVM pode externalizar configuração; RouteRules ordenadas selecionam TargetEndpoints sem alterar o contrato público.

**Abertura:** Se a configuração da KVM contiver um valor inesperado, queremos encaminhar ao backend padrão ou sinalizar uma falha? Neste cenário, a extensão orders-routing demonstra a segunda escolha; é um bundle independente.

**Explicação principal:** `get-backend-region` lê a chave não sensível `backend-region` da KVM de environment `orders-routing-config` para `private.lab.backend.region`. A leitura continua somente até uma RaiseFault controlada quando a KVM/entrada falha, está ausente ou contém valor diferente de `primary` e `secondary`. Só então AssignMessage adiciona o contexto técnico. A RouteRule condicional para `secondary` vem primeiro; a regra sem condição para `primary` é o fallback final.

**Contexto arquitetural:** RouteRules são avaliadas de cima para baixo e a primeira compatível vence. A validação anterior impede que uma configuração inválida caia silenciosamente no fallback. A KVM e a entrada não são criadas pelo bundle; sem uma organização e um environment provisionados, este repositório só valida a estrutura. No Apigee atual, KVMs são criptografadas, e `private.` impede exposição do valor em Debug. KVM não é obrigatória nem substitui um cofre de segredos.

**Demonstração:** Peça que prevejam o resultado de primary, secondary e um valor inválido. Mostre as RouteRules: secondary escolhe o destino alternativo, primary usa o fallback e valor inválido interrompe antes do roteamento. Discuta quem governa alterações da KVM e por que fallback não deve mascarar configuração incorreta.

**Arquivos demonstrados:** `examples/02-intermediate/orders-routing/apiproxy/` e `examples/02-intermediate/README.md`.

**Transição:** Com configuração e roteamento explícitos, avançamos para identidade assinada, reuso e tratamento de falhas.

---

<!-- .slide: data-timing="270" -->

## Confiança, reuso e falhas explícitas

<div class="split advanced-slide">
<div class="diagram-frame">
  {{mermaid:examples/03-advanced/README.md|1|advanced-flow|JWT e Shared Flow no módulo avançado}}
</div>
<div class="responsibility-stack">
  <div><span>CONFIANÇA</span><strong>VerifyJWT</strong><small>validar claims e remover o bearer token</small></div>
  <div><span>REUSO</span><strong>FlowCallout</strong><small>Shared Flow propaga o subject validado</small></div>
</div>
</div>

<p class="takeaway">JWT, proxy, transporte e backend <strong>não falham da mesma forma</strong>.</p>

<div class="source-line"><code>examples/03-advanced/</code> · {{github:examples/03-advanced/README.md|Ver implementação e limites}}</div>

Notas:
**Mensagem principal:** O caminho principal valida o JWT, remove o bearer token e reutiliza apenas o contexto necessário; falhas exigem tratamento específico.

**Abertura:** Se o gateway valida o token e envia somente o subject, o que impede uma chamada direta ao backend de forjar esse header? Esse é o problema de confiança que precisamos resolver além da policy.

**Explicação principal:** `VerifyJWT` verifica RS256, issuer, audience e os claims exigidos usando o JWKS em `private.orders.jwks`. Depois retiramos `Authorization`. O `FlowCallout` invoca `orders-security-shared`, que propaga apenas o subject validado.

**Contexto arquitetural:** Validar assinatura, issuer e audience não substitui autorização por operação ou recurso. O Shared Flow usa Set em AssignMessage para substituir qualquer valor recebido em `x-authenticated-subject` pelo subject validado no caminho normal após VerifyJWT. Isso não impede acesso direto ao backend: restrições de acesso e autenticação entre serviços adequadas ao threat model são necessárias para confiar na origem e integridade do contexto, mas não estão implementadas no laboratório. Shared Flow reduz duplicação, mas amplia o raio de impacto de uma mudança e exige gestão de compatibilidade e implantação prévia no mesmo environment. JWT.failed agrupa falhas do token e falhas operacionais de chave/configuração em 401 no exemplo; produção deve distingui-las e monitorá-las. Outras falhas locais usam 500; falhas de conexão sem resposta HTTP usam 502; respostas HTTP 4xx/5xx preservam status e recebem corpo sanitizado. Nenhum desses controles adicionais de produção é implantado pelo laboratório.

**Demonstração:** Mostre a cadeia verify-jwt, remove-authorization e call-shared-security. Pergunte como diferenciar um token inválido de uma indisponibilidade operacional de JWKS e uma falha de transporte de um 404 retornado pelo backend. Aponte a separação entre FaultRules do proxy e do target; não trate o 401 didático como contrato universal.

**Arquivos demonstrados:** `examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml`, `verify-jwt.xml`, `targets/default.xml` e `examples/03-advanced/orders-security-shared/sharedflowbundle/`.

**Transição:** Esses artefatos precisam chegar aos environments com dependências e versões controladas.

---

<!-- .slide: data-timing="120" -->

## Terraform no ciclo de implantação

<div class="diagram-frame flow-diagram">
  {{mermaid:docs/pt-br/deployment-lifecycle.md|1|deployment-lifecycle|Validação, importação e implantação do bundle por ambiente}}
</div>

<div class="flow-notes">
  <span><b>Bundle:</b> comportamento do proxy</span>
  <span><b>Terraform:</b> recursos e dependências</span>
  <span><b>Estado remoto:</b> acesso, locking e recuperação</span>
</div>

<div class="source-line"><code>docs/pt-br/deployment-lifecycle.md</code> · {{github:docs/pt-br/deployment-lifecycle.md|Ver ciclo completo}}</div>

Notas:
**Mensagem principal:** O bundle versionado é um artefato; Terraform pode importar sua revisão e implantá-la por environment sem misturar todas as responsabilidades.

**Abertura:** Uma alteração de Shared Flow pode afetar vários proxies. Como promover revisões e testar dependências sem transformar o deploy em tentativa e erro?

**Explicação principal:** Um pipeline gera um ZIP determinístico, registra hash e versão, usa o recurso oficial `google_apigee_api` para importar a configuração e `google_apigee_api_deployment` para associar a revisão a um environment. Depois, aguarda com timeout até o status da revisão ficar `READY` antes dos testes. Módulos reutilizáveis podem reduzir repetição, desde que entradas e dependências permaneçam explícitas.

**Contexto arquitetural:** Shared Flow, KVM e environment podem criar ordem de implantação. Como o deployment é eventualmente consistente, o readiness check consulta a revisão específica, avança em `READY`, falha em `ERROR` e termina ao atingir o limite; só então começam Debug e testes de runtime num environment não produtivo. Estado remoto exige criptografia, mínimo privilégio, locking, recuperação e cuidado com outputs. O laboratório não inclui interfaces privadas, credenciais, backend de estado ou código Terraform executável.

**Demonstração:** Use o diagrama para destacar revisão, dependências, readiness e testes; não abra HCL. O laboratório não cria recursos nem executa Terraform.

**Arquivos demonstrados:** `docs/pt-br/deployment-lifecycle.md` e `docs/en/deployment-lifecycle.md`.

**Transição:** Agora podemos condensar essas decisões em guardrails de revisão.

---

<!-- .slide: data-timing="90" -->

## Guardrails arquiteturais

<div class="guardrails">
  <div><span>01</span><strong>Falhar fechado</strong><small><code>continueOnError="false"</code> em segurança</small></div>
  <div><span>02</span><strong>Separar contratos</strong><small>interface pública ≠ conexão de destino</small></div>
  <div><span>03</span><strong>Reusar com critério</strong><small>Shared Flow pequeno e implantável</small></div>
  <div><span>04</span><strong>Validar o verificável</strong><small>CI estática ≠ validação de runtime</small></div>
</div>

<p class="takeaway">Policies são configuração. <strong>Decisões continuam sendo arquitetura.</strong></p>

<div class="source-line"><code>docs/pt-br/architectural-decisions.md</code> · {{github:docs/pt-br/architectural-decisions.md|Ver decisões}}</div>

Notas:
**Mensagem principal:** Guardrails tornam as decisões revisáveis, mas não removem a necessidade de contexto, testes e operação.

**Abertura:** Transformem os quatro critérios em perguntas de revisão de PR: onde a falha interrompe o fluxo, quem possui o contrato, quem depende do reuso e qual evidência o teste fornece?

**Explicação principal:** Policies de segurança devem interromper a execução normal ao falhar. Interface pública e conexão com o target têm responsabilidades diferentes. Shared Flow reduz duplicação, mas cria dependência de implantação. E os testes precisam declarar claramente o que conseguem validar.

**Contexto arquitetural:** Esses critérios ajudam a revisar decisões, não substituem threat modeling, capacidade, observabilidade ou uma estratégia de recuperação.

**Demonstração:** Relacione os critérios com `docs/pt-br/architectural-decisions.md` e os limites com `docs/pt-br/validation.md`.

**Arquivos demonstrados:** `docs/pt-br/architectural-decisions.md` e `docs/pt-br/validation.md`.

**Transição:** Vamos encerrar com uma trilha curta pelos três módulos.

---

<!-- .slide: data-timing="240" -->

## Demonstração: siga a evolução

<div class="demo-path">
  <div><span>01 · 30 s</span><strong>Básico</strong><small>BasePath + RouteRule</small></div>
  <i>→</i>
  <div><span>02 · 75 s</span><strong>Intermediário</strong><small>chave inválida → falha</small></div>
  <i>→</i>
  <div><span>03 · 90 s</span><strong>Avançado</strong><small>JWT 401 · target 502</small></div>
</div>

```bash
python scripts/demo_http_scenarios.py
python scripts/validate_bundles.py
```

<div class="repo-links">
  {{github:examples/01-basic/README.md|Abrir 01 — Básico}}
  {{github:examples/02-intermediate/README.md|Abrir 02 — Intermediário}}
  {{github:examples/03-advanced/README.md|Abrir 03 — Avançado}}
  {{github:docs/pt-br/http-scenarios.md|Cenários HTTP}}
</div>

Notas:
**Mensagem principal:** O roteiro offline relaciona requisições HTTP, policies e resultados condicionais sem simular o Apigee.

**Abertura:** Vamos consolidar com três previsões: qual destino é selecionado, qual controle não é alcançado e qual categoria de falha deve ser tratada.

**Explicação principal:** No básico, o BasePath e a RouteRule mostram o caminho até um backend fictício. No intermediário, a chave inválida gera uma falha padrão da VerifyAPIKey; com chave válida, SpikeArrest e Quota passam a controlar o tráfego. No avançado, a FaultRule configura JWT.failed como 401 e a falha de conexão ao target como 502. O demonstrador offline lê essas configurações, sem emitir requisições HTTP.

**Contexto arquitetural:** Os resultados dependem do runtime e de recursos externos. Não mostramos HTTP 200 porque o backend é fictício. O código offline não é um emulador Apigee; o validador confirma apenas XML e referências locais.

**Demonstração:** Deixe abertos docs/pt-br/http-scenarios.md e os ProxyEndpoints. Use 30 segundos para BasePath e RouteRule; 75 segundos para a chave inválida, quota por chave e 429 condicionais; 90 segundos para JWT.failed → 401, target sem resposta → 502 e backend 404 sanitizado. Use os 45 segundos finais para os dois comandos. Peça previsões antes de revelar o comportamento configurado. Se o terminal atrasar, use o guia de cenários já aberto. Não execute curl para .invalid.

**Arquivos demonstrados:** `docs/pt-br/http-scenarios.md`, `scripts/demo_http_scenarios.py`, `scripts/validate_bundles.py`, `examples/01-basic/`, `examples/02-intermediate/` e `examples/03-advanced/`.

**Transição:** Agora podemos resumir o que aprendemos.

---

<!-- .slide: class="closing-slide" data-timing="120" -->

<div class="eyebrow">PRINCIPAIS APRENDIZADOS</div>

## Uma API bem gerenciada torna<br>decisões <span>explícitas</span>.

<div class="closing-points">
  <span>Fronteira desacoplada</span>
  <span>Pipeline intencional</span>
  <span>Segurança verificável</span>
  <span>Governança evolutiva</span>
</div>

<div class="references">
  <strong>Continue no repositório</strong>
  <span><code>README.md</code> · <code>docs/pt-br/</code> · <code>examples/</code></span>
  {{github:README.md|Abrir laboratório no GitHub}}
</div>

Notas:
**Mensagem principal:** Apigee torna a fronteira programável; qualidade vem da intenção explícita, das dependências visíveis e da validação proporcional ao risco.

**Abertura:** Para concluir, pensem em um proxy que vocês mantêm hoje: qual decisão de pipeline, segurança ou tratamento de falha merece ser revisitada?

**Explicação principal:** Retomem os três objetivos: explicar a ordem dos flows; justificar a posição e o escopo dos controles; identificar riscos de confiança, reuso e falhas. Cada um deve conseguir apontar uma decisão concreta no próprio contexto. Os exemplos são configuração declarativa e evidência estática, não garantia de comportamento produtivo.

**Contexto arquitetural:** Em uma implantação real, o próximo passo seria testar sucessos e falhas num ambiente de teste, medir limites e definir operação de chaves, logs e rollout.

**Arquivos demonstrados:** `README.md`, `docs/pt-br/` e `examples/`.

**Transição:** Obrigado! Vamos às perguntas.

---

<!-- .slide: class="questions-slide" data-timing="0" -->

<div class="questions-content">
  <div class="eyebrow">CONVERSA ABERTA</div>
  <h2>Perguntas<span>?</span></h2>
  <p>Vamos conversar sobre arquitetura, APIs e Apigee.</p>
  <div class="question-link">{{github:README.md|github.com/rodri-oliveira-dev/apigee-architecture-lab}}</div>
</div>

Notas:
**Mensagem principal:** O tempo de perguntas começa agora e não faz parte dos 28 minutos de exposição.

**Abertura:** Obrigado por acompanharem até aqui. Agora eu quero ouvir as perguntas e também os cenários que vocês encontram no dia a dia.

**Explicação principal:** Se for útil para começar, dúvidas frequentes são: quando usar API key ou JWT; onde posicionar uma policy; como versionar Shared Flows; qual a diferença prática entre SpikeArrest e Quota; e o que ainda precisa ser validado dentro do Apigee.

**Contexto arquitetural:** Ao responder, eu separo o que o exemplo comprova do que depende de topologia, licenciamento, volume, threat model ou processos da organização. Se uma resposta exigir mais contexto, prefiro explicitar a hipótese em vez de transformar o laboratório em receita universal.

**Arquivos demonstrados:** `README.md` e o repositório público indicado na tela.

**Transição:** Encerrar agradecendo e convidando o público a continuar a discussão pelo repositório.
