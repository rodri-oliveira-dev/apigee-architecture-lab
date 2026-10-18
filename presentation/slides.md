<!-- .slide: class="title-slide" data-timing="60" -->

<div class="eyebrow">ARQUITETURA DE APIs · LABORATÓRIO DECLARATIVO</div>

# Google Cloud<br><span>Apigee</span>

## Do proxy mínimo à governança aplicada

<div class="title-meta">
  <span>Desenvolvedores + arquitetos</span>
  <span>25–30 minutos</span>
</div>

<div class="navigation-hint" aria-label="Atalhos da apresentação">
  <span><kbd>←</kbd><kbd>→</kbd> navegar</span>
  <span><kbd>O</kbd> visão geral</span>
  <span><kbd>S</kbd> notas</span>
</div>

Notas:
**Mensagem principal:** Esta sessão conecta conceitos de API Management a bundles XML reais e verificáveis.

**Abertura:** Olá! Hoje eu quero mostrar o Apigee por um ângulo bastante concreto: como decisões de arquitetura aparecem em arquivos que conseguimos ler, versionar e revisar.

**Explicação principal:** Vamos evoluir uma API fictícia de pedidos do proxy mínimo até controles de acesso, tráfego, JWT, reuso e tratamento de falhas. O foco é a configuração declarativa do runtime; não vamos provisionar Google Cloud nem apresentar este laboratório como uma solução pronta para produção.

**Contexto arquitetural:** A proposta é aproximar duas perspectivas: para quem desenvolve, onde cada policy executa; para quem arquiteta, quais dependências e limites essa escolha cria.

**Arquivos demonstrados:** `README.md`, `examples/` e `presentation/slides.md`.

**Transição:** Antes de entrar no problema das APIs, quero me apresentar rapidamente e explicar de onde vem esse recorte.

---

<!-- .slide: class="about-slide" data-timing="60" -->

<div class="eyebrow">QUEM CONDUZ ESTA CONVERSA</div>

## Sobre mim

<div class="about-layout">
  <img class="about-photo" src="https://rodri-oliveira-dev.github.io/assets/profile/rodrigo-about.webp" alt="Retrato de Rodrigo de Oliveira" width="320" height="428" decoding="async">
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

**Abertura:** Eu sou o Rodrigo de Oliveira, arquiteto de software, e trabalho há mais de 20 anos com o desenvolvimento e a evolução de sistemas corporativos.

**Explicação principal:** Minha trajetória passa por .NET, automação, aplicações backend, integrações e sistemas distribuídos. Hoje participo do desenho e revisão de soluções, da definição de padrões técnicos e do acompanhamento da implementação com os times de engenharia. Esse olhar para as fronteiras entre sistemas é a origem do recorte prático desta apresentação.

**Contexto arquitetural:** Fora do código, sou estudante de Filosofia e gosto de leitura, café, jogos retrô e de estar com minha família e meus gatos. Acredito que boas perguntas importam tanto quanto boas respostas. Isso também vale para arquitetura: antes de escolher uma ferramenta, é preciso entender o problema que ela resolve.

**Arquivos demonstrados:** Nenhum; foto, descrição profissional e interesses foram adaptados do meu portfólio público, disponível no próprio slide.

**Transição:** Para responder à pergunta sobre o problema que o gateway resolve, vamos começar pelo que acontece quando uma API cresce e deixa de ser apenas uma URL.

---

<!-- .slide: data-timing="110" -->

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

**Abertura:** Pensem em uma API de pedidos que começou com um consumidor e um backend. O caminho parecia simples até surgirem outros canais, parceiros e requisitos de segurança.

**Explicação principal:** Agora precisamos identificar a aplicação, talvez o usuário, proteger o backend contra rajadas, controlar consumo e manter um contrato estável enquanto o sistema interno muda. Se cada backend resolver isso de um jeito, criamos duplicação e respostas inconsistentes.

**Contexto arquitetural:** Uma fronteira administrada concentra preocupações transversais sem transformar o gateway no dono da regra de negócio. Isso melhora governança e desacoplamento, mas também exige clareza sobre o que pertence ao runtime e o que pertence ao ciclo de vida da API.

**Arquivos demonstrados:** `README.md`, seção “API Gateway e API Management”.

**Transição:** Essa distinção nos leva diretamente à diferença entre executar uma chamada e governar uma API ao longo do tempo.

---

<!-- .slide: data-timing="120" -->

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

**Abertura:** Aqui vale separar dois termos que muitas vezes aparecem como sinônimos, mas representam escopos diferentes.

**Explicação principal:** O gateway está no caminho da chamada: recebe a requisição, aplica as policies configuradas e decide o roteamento. API Management é mais amplo e inclui produtos de API, publicação, onboarding de aplicações, analytics, governança e ciclo de vida. O Apigee reúne essas capacidades, mas os XMLs deste repositório demonstram principalmente o runtime.

**Contexto arquitetural:** Essa separação evita uma expectativa perigosa: instalar um gateway não cria governança automaticamente. Produtos, responsabilidades, observabilidade e processos de mudança continuam sendo decisões organizacionais.

**Arquivos demonstrados:** `README.md` e `README.en.md`, seção de gateway versus management.

**Transição:** Com o escopo alinhado, podemos enxergar onde o proxy entra entre o consumidor e o backend.

---

<!-- .slide: data-timing="140" -->

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

**Explicação principal:** O hostname associado ao environment group recebe a conexão. O ProxyEndpoint representa a interface voltada ao consumidor e executa seus flows. A RouteRule seleciona um TargetEndpoint, que encapsula a conexão com o backend. Policies entram nesses pipelines como Steps configurados.

**Contexto arquitetural:** Separar a interface pública da conexão de destino permite evoluir URL, TLS ou configuração do backend com menor impacto sobre consumidores. Isso é desacoplamento de contrato, não ausência de dependências.

**Demonstração:** Abra `docs/pt-br/architecture.md` e mostre o primeiro Mermaid. Aponte que `orders-backend.example.invalid` é intencionalmente fictício; não existe integração funcional nem necessidade de autenticação GCP para ver os slides.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** Agora vamos abrir essa fronteira e localizar as peças que formam um bundle implantável.

---

<!-- .slide: data-timing="130" -->

## Anatomia do API Proxy

<div class="split split-45">
<div>

```text
apiproxy/
├── orders-basic.xml
├── proxies/
│   └── default.xml
├── targets/
│   └── default.xml
└── policies/       # quando necessário
```

</div>
<div class="stack-cards">
  <div><strong>ProxyEndpoint</strong><span>interface, flows e RouteRule</span></div>
  <div><strong>TargetEndpoint</strong><span>conexão e flows de destino</span></div>
  <div><strong>Policies</strong><span>unidades anexadas por Steps</span></div>
</div>
</div>

<div class="source-line"><code>examples/01-basic/apiproxy/</code> · {{github:examples/01-basic/apiproxy/orders-basic.xml|Ver descritor}}</div>

Notas:
**Mensagem principal:** Diretórios, descritores e nomes formam o artefato declarativo que o Apigee importa e implanta.

**Abertura:** No repositório, essa arquitetura aparece como uma estrutura pequena e deliberadamente explícita.

**Explicação principal:** O descritor raiz identifica o proxy e declara seus endpoints e policies. `proxies/default.xml` define a interface e o roteamento; `targets/default.xml` define o destino. Policies ficam em arquivos próprios e só executam quando um Step as referencia.

**Contexto arquitetural:** A separação favorece revisão e manutenção: conseguimos discutir contrato, destino e controles individualmente. Ao mesmo tempo, os nomes viram ligações formais entre arquivos e precisam permanecer coerentes.

**Demonstração:** Abra `examples/01-basic/apiproxy/`. Mostre que o módulo básico não possui diretório de policies: ele expõe o esqueleto mínimo antes de acrescentarmos comportamento.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/orders-basic.xml`, `examples/01-basic/apiproxy/proxies/default.xml` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** A estrutura fica mais clara quando seguimos uma referência concreta de um XML ao outro.

---

<!-- .slide: data-timing="130" -->

## XMLs se conectam por nome

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

**Demonstração:** O trecho na tela é extraído de `examples/01-basic/apiproxy/proxies/default.xml` durante o build. Abra também o TargetEndpoint e compare `name="default"`.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/proxies/default.xml`, `examples/01-basic/apiproxy/targets/default.xml` e `scripts/validate_bundles.py`.

**Transição:** Depois de saber como os arquivos se ligam, precisamos entender quando cada trecho executa.

---

<!-- .slide: data-timing="180" -->

## O ciclo de execução dos Flows

<div class="diagram-frame flow-diagram">
  {{mermaid:docs/pt-br/architecture.md|2|message-lifecycle|Request e response entre ProxyEndpoint e TargetEndpoint}}
</div>

<div class="flow-notes">
  <span><b>Request:</b> ProxyEndpoint → TargetEndpoint</span>
  <span><b>Response:</b> TargetEndpoint → ProxyEndpoint</span>
  <span><b>Dentro de cada endpoint:</b> Pre → Conditional → Post</span>
</div>

<div class="source-line"><code>docs/pt-br/architecture.md</code> · {{github:docs/pt-br/architecture.md|Ver sequência completa}}</div>

Notas:
**Mensagem principal:** A resposta inverte a passagem entre endpoints, mas nunca inverte a ordem interna PreFlow, Conditional Flow e PostFlow.

**Abertura:** Este é o detalhe de execução mais importante da sessão, porque duas ordens diferentes precisam ser lidas ao mesmo tempo.

**Explicação principal:** Na ida, a mensagem percorre o ProxyEndpoint e depois o TargetEndpoint. Na volta, ela entra primeiro no pipeline de response do TargetEndpoint e só então no response do ProxyEndpoint. Dentro de qualquer um desses pipelines, tanto no request quanto no response, a ordem é sempre PreFlow, o primeiro Conditional Flow compatível e PostFlow. Dentro de cada Flow, os Steps executam na ordem declarada.

**Contexto arquitetural:** A posição determina qual mensagem e qual contexto uma policy enxerga. Confundir a inversão entre endpoints com a ordem interna pode colocar transformação, logging ou tratamento no ponto errado.

**Demonstração:** Abra `docs/pt-br/architecture.md` e siga as setas do segundo Mermaid. Depois abra `examples/02-intermediate/apiproxy/proxies/default.xml`: o flow `list-orders` casa com `GET /` e executa somente a policy declarativa que adiciona `x-api-operation`. Ele demonstra a posição do Conditional Flow sem levar regra de negócio ao gateway.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/02-intermediate/apiproxy/proxies/default.xml`.

**Transição:** Com a ordem correta, podemos analisar por que a cadeia de segurança e tráfego foi declarada exatamente nessa sequência.

---

<!-- .slide: data-timing="180" -->

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

Notas:
**Mensagem principal:** A ordem das policies valida a credencial, reduz sua exposição e só então aplica os controles que dependem do contexto verificado.

**Abertura:** No módulo intermediário, a sequência não é estética; uma policy produz o contexto que a seguinte consome.

**Explicação principal:** `VerifyAPIKey` lê `x-api-key`, valida a credencial emitida para uma aplicação e produz metadados. Aqui, `client_id` é a própria consumer key, não o ID lógico da aplicação. Eu removo o header logo depois da validação; as variáveis verificadas continuam disponíveis. `SpikeArrest` controla rajadas para o proxy, a Quota limita cada chave a cem chamadas por minuto e a última policy adiciona correlação.

**Contexto arquitetural:** API key depende de API product, developer app e chave no plano de gestão. Duas chaves da mesma app — inclusive durante rotação — acumulam quotas separadas neste desenho. Os números são didáticos e precisam de testes de capacidade e contrato de produto antes de qualquer uso real.

**Demonstração:** Abra o `PreFlow` em `examples/02-intermediate/apiproxy/proxies/default.xml` e percorra os cinco Steps. Mostre `remove-api-key.xml`, compare o `Identifier` de `quota.xml` e finalize no Conditional Flow, que acrescenta apenas `x-api-operation: list-orders` em `GET /`.

**Arquivos demonstrados:** `examples/02-intermediate/apiproxy/proxies/default.xml`, `verify-api-key.xml`, `remove-api-key.xml`, `quota.xml` e `assign-list-orders-context.xml`.

**Transição:** No módulo avançado, a mesma ideia de cadeia passa a combinar identidade assinada, reuso e um contrato explícito de falhas.

---

<!-- .slide: data-timing="180" -->

## Confiança, reuso e falhas explícitas

<div class="split advanced-slide">
<div class="diagram-frame">
  {{mermaid:examples/03-advanced/README.md|1|advanced-flow|JWT e Shared Flow no módulo avançado}}
</div>
<div class="responsibility-stack">
  <div><span>CONFIANÇA</span><strong>VerifyJWT</strong><small>validar claims e remover o bearer token</small></div>
  <div><span>REUSO</span><strong>FlowCallout</strong><small>Shared Flow propaga o subject validado</small></div>
  <div><span>FALHAS</span><strong>Responder por categoria</strong><small>JWT 401 · proxy 500 · conexão 502 · backend preservado</small></div>
</div>
</div>

<div class="source-line"><code>examples/03-advanced/</code> · {{github:examples/03-advanced/README.md|Ver implementação e limites}}</div>

Notas:
**Mensagem principal:** O fluxo avançado separa três responsabilidades: validar confiança, reutilizar contexto e responder conforme a origem da falha.

**Abertura:** O módulo avançado troca a identidade de aplicação por um token assinado e acrescenta duas preocupações: compartilhar comportamento e responder com segurança quando algo falha.

**Explicação principal:** `VerifyJWT` valida RS256 usando o JWKS de `private.orders.jwks`, exige os claims declarados e compara issuer e audience. Depois da validação, o header `Authorization` é removido. O `FlowCallout` chama `orders-security-shared`, que copia somente o subject validado para o request do target. No erro, eu separo categorias: `JWT.failed` leva a 401, outra falha local do proxy usa 500, falta de resposta do target usa 502 e uma resposta 4xx/5xx do backend mantém o status com corpo neutro.

**Contexto arquitetural:** `JWT.failed` cobre todas as falhas de runtime de policies JWT, inclusive categorias ligadas a chave ou configuração; não é sinônimo apenas de assinatura inválida. O agrupamento em 401 mantém o exemplo pequeno, mas produção deve monitorar e separar falhas operacionais. O Shared Flow precisa estar implantado antes do proxy no mesmo environment.

**Demonstração:** Mostre somente a cadeia `verify-jwt → remove-authorization → call-shared-security` no PreFlow e o único Step do Shared Flow. Deixe a matriz de falhas nas notas; se perguntarem, abra `targets/default.xml` para mostrar `success.codes`, sanitização do payload e o fallback 502.

**Arquivos demonstrados:** `examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml`, `verify-jwt.xml`, `targets/default.xml` e `examples/03-advanced/orders-security-shared/sharedflowbundle/`.

**Transição:** Esses exemplos técnicos podem ser resumidos em poucos guardrails para orientar decisões maiores de arquitetura.

---

<!-- .slide: data-timing="120" -->

## Guardrails arquiteturais

<div class="guardrails">
  <div><span>01</span><strong>Falhar fechado</strong><small><code>continueOnError="false"</code> em segurança</small></div>
  <div><span>02</span><strong>Separar contratos</strong><small>interface pública ≠ conexão de destino</small></div>
  <div><span>03</span><strong>Reusar com critério</strong><small>Shared Flow pequeno e implantável</small></div>
  <div><span>04</span><strong>Provar só o provável</strong><small>CI estática ≠ validação de runtime</small></div>
</div>

<p class="takeaway">Policies são configuração. <strong>Decisões continuam sendo arquitetura.</strong></p>

<div class="source-line"><code>docs/pt-br/architectural-decisions.md</code> · {{github:docs/pt-br/architectural-decisions.md|Ver decisões}}</div>

Notas:
**Mensagem principal:** Guardrails tornam as decisões revisáveis, mas não removem a necessidade de contexto, testes e operação.

**Abertura:** Se eu tivesse de levar somente quatro critérios deste laboratório para uma revisão arquitetural, seriam estes.

**Explicação principal:** Segurança crítica interrompe o pipeline normal. ProxyEndpoint e TargetEndpoint mantêm contratos distintos. Shared Flow deve reutilizar apenas o que é realmente comum, porque também cria uma dependência de rollout. E a automação precisa declarar honestamente seu alcance.

**Contexto arquitetural:** O valor desses guardrails está na manutenção: eles reduzem acoplamento e variação acidental sem transformar uma escolha local em regra universal. Produção ainda exige threat modeling, capacidade, observabilidade, versionamento e estratégia de recuperação.

**Demonstração:** Abra `docs/pt-br/architectural-decisions.md` e relacione cada decisão aos XMLs vistos. Destaque também `docs/pt-br/validation.md`: XML bem formado e referências corretas não provam importação, deploy ou comportamento distribuído.

**Arquivos demonstrados:** `docs/pt-br/architectural-decisions.md` e `docs/pt-br/validation.md`.

**Transição:** Vamos fechar o percurso navegando pelos três módulos e executando exatamente o que o repositório consegue validar.

---

<!-- .slide: data-timing="180" -->

## Demonstração: siga a evolução

<div class="demo-path">
  <div><span>01 · 35 s</span><strong>Básico</strong><small>ProxyEndpoint + RouteRule</small></div>
  <i>→</i>
  <div><span>02 · 55 s</span><strong>Intermediário</strong><small>ordem das policies</small></div>
  <i>→</i>
  <div><span>03 · 50 s</span><strong>Avançado</strong><small>JWT + Shared Flow</small></div>
</div>

```bash
python scripts/validate_bundles.py
python -m unittest discover -s tests -v
```

<div class="repo-links">
  {{github:examples/01-basic/README.md|Abrir 01 — Básico}}
  {{github:examples/02-intermediate/README.md|Abrir 02 — Intermediário}}
  {{github:examples/03-advanced/README.md|Abrir 03 — Avançado}}
</div>

Notas:
**Mensagem principal:** O repositório foi organizado para que a evolução arquitetural possa ser comparada e validada sem depender de um ambiente Apigee.

**Abertura:** Na demonstração, eu sigo sempre a mesma trilha para não transformar a navegação em uma caça a arquivos.

**Explicação principal:** Primeiro mostro no ProxyEndpoint básico onde ficam PreFlow, PostFlow e RouteRule. Depois percorro a sequência intermediária, destacando remoção da chave, Quota por credencial e o Step do Conditional Flow. No avançado, mostro `VerifyJWT`, `FlowCallout` e o único Step compartilhado. Reservo os quarenta segundos finais para o validador e os testes.

**Contexto arquitetural:** A saída prova estrutura XML, nomes, Steps, RouteRules, FlowCallouts e documentação obrigatória. Ela não valida expressions, schemas internos, produtos, credenciais, DNS, TLS, importação, deploy nem comportamento de runtime.

**Demonstração:** Antes da sessão, deixe os quatro pontos já abertos e o terminal na raiz. Siga os tempos exibidos sem abrir READMEs. Execute os dois comandos da tela nos quarenta segundos finais; as validações completas da apresentação ficam preparadas previamente e documentadas no repositório.

**Arquivos demonstrados:** `examples/01-basic/`, `examples/02-intermediate/`, `examples/03-advanced/`, `scripts/validate_bundles.py` e `tests/`.

**Transição:** Depois de percorrer código e validações, podemos resumir o que realmente torna essa fronteira sustentável.

---

<!-- .slide: class="closing-slide" data-timing="90" -->

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

**Abertura:** Para concluir, eu resumiria a sessão em uma ideia: uma API bem gerenciada deixa as decisões importantes visíveis.

**Explicação principal:** Vimos a separação entre interface e destino, a ordem real dos flows, as dependências entre policies e os cuidados com JWT, Shared Flows e falhas. Também vimos que o laboratório é uma ferramenta educacional e estática, não uma certificação de produção.

**Contexto arquitetural:** O próximo passo responsável seria validar os bundles em um environment não produtivo, testar sucessos e falhas, observar capacidade e fechar as lacunas operacionais de chaves, logs e rollout.

**Arquivos demonstrados:** `README.md`, `docs/pt-br/` e `examples/`.

**Transição:** Com a exposição encerrada, vamos abrir a conversa para perguntas.

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
