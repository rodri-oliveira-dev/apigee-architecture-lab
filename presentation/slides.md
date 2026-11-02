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

**Abertura:** Sou Rodrigo de Oliveira, arquiteto de software, com mais de 20 anos de experiência em sistemas corporativos.

**Explicação principal:** Minha trajetória passa por .NET, backend, integrações e sistemas distribuídos. Hoje trabalho com desenho de soluções, revisão técnica e padrões de engenharia. É desse ponto de vista que proponho olhar para o Apigee: uma fronteira entre sistemas, não apenas um produto.

**Contexto arquitetural:** Fora do trabalho, gosto de filosofia, leitura, jogos retrô e de estar com minha família e meus gatos.

**Arquivos demonstrados:** Nenhum; foto, descrição profissional e interesses foram adaptados do meu portfólio público, disponível no próprio slide.

**Transição:** Agora, por que essa fronteira precisa ser administrada?

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
  <span><b>Ordem interna:</b> PreFlow → Conditional → PostFlow</span>
</div>

<div class="source-line"><code>docs/pt-br/architecture.md</code> · {{github:docs/pt-br/architecture.md|Ver sequência completa}}</div>

Notas:
**Mensagem principal:** A resposta percorre os endpoints em ordem inversa, mas a execução interna continua PreFlow, primeiro Conditional Flow compatível e PostFlow.

**Abertura:** Leia o diagrama em duas camadas: entre os endpoints e dentro de cada endpoint.

**Explicação principal:** No request, o ProxyEndpoint executa antes do TargetEndpoint. No response, a ordem entre eles se inverte. Dentro de cada pipeline, em qualquer sentido, a sequência continua PreFlow, primeiro Conditional Flow compatível e PostFlow. Cada flow executa seus Steps na ordem declarada.

**Contexto arquitetural:** A posição determina quais variáveis estão disponíveis. Não devemos inverter a ordem interna na resposta; e uma falha que interrompe a execução normal segue para tratamento de erros, não para os próximos Steps.

**Demonstração:** Siga as setas em `docs/pt-br/architecture.md`. Depois mostre `list-orders` no proxy intermediário: o Conditional Flow de `GET /` apenas adiciona `x-api-operation`, sem lógica de negócio.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/02-intermediate/apiproxy/proxies/default.xml`.

**Transição:** Com isso em mente, vamos analisar a sequência das policies.

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

<div class="flow-notes"><span><b>SpikeArrest:</b> 10ps por proxy (rajadas)</span><span><b>Quota:</b> 100/min por chave (consumo)</span></div>

Notas:
**Mensagem principal:** SpikeArrest limita rajadas; Quota controla consumo por credencial. A ordem das policies define quais chamadas chegam a cada controle.

**Abertura:** SpikeArrest e Quota resolvem problemas diferentes. E a ordem das policies importa.

**Explicação principal:** `VerifyAPIKey` valida `x-api-key` e disponibiliza variáveis da chave. Removemos o header antes do roteamento. Depois, `SpikeArrest` limita rajadas do proxy a `10ps` em janela deslizante regional; `Quota` permite 100 chamadas por minuto para cada consumer key, em janela móvel. Por último, adicionamos correlação.

**Contexto arquitetural:** Aqui, `client_id` contém a própria chave, não o identificador lógico da aplicação: duas chaves têm contadores distintos. Como a verificação vem antes do SpikeArrest, chaves inválidas falham antes de alcançar essa policy. Portanto, ela não limita essas tentativas neste desenho. Proteger a borda antes da verificação exigiria outro controle. Os números são didáticos.

**Demonstração:** Mostre o PreFlow intermediário, a taxa em `spike-arrest.xml` e o `Identifier` em `quota.xml`. Compare proteção contra rajadas com governança de consumo; a seguir, aponte o Conditional Flow `list-orders`.

**Arquivos demonstrados:** `examples/02-intermediate/apiproxy/proxies/default.xml`, `verify-api-key.xml`, `remove-api-key.xml`, `quota.xml` e `assign-list-orders-context.xml`.

**Transição:** No avançado, acrescentamos identidade assinada e reuso.

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
</div>
</div>

<p class="takeaway">JWT, proxy, transporte e backend <strong>não falham da mesma forma</strong>.</p>

<div class="source-line"><code>examples/03-advanced/</code> · {{github:examples/03-advanced/README.md|Ver implementação e limites}}</div>

Notas:
**Mensagem principal:** O caminho principal valida o JWT, remove o bearer token e reutiliza apenas o contexto necessário; falhas exigem tratamento específico.

**Abertura:** No avançado, o foco é a cadeia de confiança e o que enviamos ao backend.

**Explicação principal:** `VerifyJWT` verifica RS256, issuer, audience e os claims exigidos usando o JWKS em `private.orders.jwks`. Depois retiramos `Authorization`. O `FlowCallout` invoca `orders-security-shared`, que propaga apenas o subject validado.

**Contexto arquitetural:** `JWT.failed` pode indicar erro do token ou problema operacional de chave/configuração. Este exemplo simplifica tudo em 401; produção precisa distinguir e monitorar falhas de JWKS. Outras falhas locais do proxy usam 500; falhas de conexão ao target, 502; respostas HTTP 4xx/5xx do backend preservam o status e recebem corpo sanitizado. O Shared Flow precisa estar implantado primeiro no mesmo environment.

**Demonstração:** Mostre `verify-jwt → remove-authorization → call-shared-security`. Deixe a matriz de falhas nas notas e abra `targets/default.xml` somente se surgir dúvida.

**Arquivos demonstrados:** `examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml`, `verify-jwt.xml`, `targets/default.xml` e `examples/03-advanced/orders-security-shared/sharedflowbundle/`.

**Transição:** Essas escolhas nos levam aos guardrails de arquitetura.

---

<!-- .slide: data-timing="120" -->

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

**Abertura:** Quatro critérios ajudam a revisar esta integração.

**Explicação principal:** Policies de segurança devem interromper a execução normal ao falhar. Interface pública e conexão com o target têm responsabilidades diferentes. Shared Flow reduz duplicação, mas cria dependência de implantação. E os testes precisam declarar claramente o que conseguem validar.

**Contexto arquitetural:** Esses critérios ajudam a revisar decisões, não substituem threat modeling, capacidade, observabilidade ou uma estratégia de recuperação.

**Demonstração:** Relacione os critérios com `docs/pt-br/architectural-decisions.md` e os limites com `docs/pt-br/validation.md`.

**Arquivos demonstrados:** `docs/pt-br/architectural-decisions.md` e `docs/pt-br/validation.md`.

**Transição:** Vamos encerrar com uma trilha curta pelos três módulos.

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

**Abertura:** A demonstração acompanha a evolução do código, sem procurar arquivos durante a fala.

**Explicação principal:** No básico, BasePath e RouteRule. No intermediário, a ordem das policies, a Quota por chave e o Conditional Flow. No avançado, VerifyJWT e FlowCallout. Encerramos com os validadores estáticos mostrados no slide.

**Contexto arquitetural:** Passar na validação comprova estrutura e referências locais; não comprova schema completo, credenciais, conectividade, produtos ou runtime Apigee.

**Demonstração:** Deixe as telas preparadas. Reserve cerca de 35 s ao básico, 55 s ao intermediário, 50 s ao avançado e 40 s aos comandos, com transições.

**Arquivos demonstrados:** `examples/01-basic/`, `examples/02-intermediate/`, `examples/03-advanced/`, `scripts/validate_bundles.py` e `tests/`.

**Transição:** Agora podemos resumir o que aprendemos.

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

**Abertura:** Uma API bem gerenciada deixa decisões importantes visíveis.

**Explicação principal:** Vimos a fronteira entre interface e destino, a ordem dos flows e como segurança, limites e reuso aparecem em XMLs versionáveis. O laboratório demonstra configuração declarativa, não garante comportamento produtivo.

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
