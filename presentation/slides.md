<!-- .slide: class="title-slide" data-timing="90" -->

<div class="eyebrow">ARQUITETURA DE APIs · LABORATÓRIO DECLARATIVO</div>

# Google Cloud<br><span>Apigee</span>

## Do proxy mínimo à governança aplicada

<div class="title-meta">
  <span>Desenvolvedores + arquitetos</span>
  <span>25–30 minutos</span>
</div>

Notas:
Abra alinhando o escopo: a sessão mostra como decisões arquiteturais aparecem em bundles XML reais. Não é uma demonstração de provisionamento nem um guia de produção. Antecipe a progressão básico → intermediário → avançado e indique que todo exemplo está no repositório.

---

<!-- .slide: data-timing="120" -->

## APIs crescem. A complexidade também.

<div class="problem-grid">
  <div class="problem-card"><span>01</span><strong>Segurança</strong><small>Quem chama? Em nome de quem?</small></div>
  <div class="problem-card"><span>02</span><strong>Capacidade</strong><small>Como absorver picos e limitar consumo?</small></div>
  <div class="problem-card"><span>03</span><strong>Consistência</strong><small>Como evitar controles diferentes por API?</small></div>
  <div class="problem-card"><span>04</span><strong>Evolução</strong><small>Como mudar o backend sem quebrar clientes?</small></div>
</div>

<p class="takeaway">A fronteira da API precisa ser <strong>administrada</strong>, não apenas roteada.</p>

Notas:
Use um cenário simples de pedidos: vários consumidores, um backend em evolução e exigências distintas de acesso. Para desenvolvedores, destaque a redução de código transversal. Para arquitetos, destaque governança, produto e ciclo de vida. Transição: onde essa fronteira administrada vive?

---

<!-- .slide: data-timing="135" -->

## Gateway executa. Management governa.

<div class="compare">
  <div class="compare-card accent-cyan">
    <span class="kicker">API GATEWAY</span>
    <h3>No caminho da chamada</h3>
    <p>Recebe, autentica, controla tráfego e roteia.</p>
  </div>
  <div class="plus">+</div>
  <div class="compare-card accent-violet">
    <span class="kicker">API MANAGEMENT</span>
    <h3>Ao redor do ciclo de vida</h3>
    <p>Produtos, publicação, analytics, governança e evolução.</p>
  </div>
</div>

<p class="takeaway"><strong>Apigee combina os dois.</strong> Este laboratório focaliza a configuração declarativa do runtime.</p>

Notas:
Evite reduzir Apigee a um reverse proxy. O runtime materializa policies e roteamento; a camada de gestão relaciona APIs a produtos, apps, consumidores e observabilidade. O repositório prova somente o que é local e estático. Referência: README principal, seção “API Gateway e API Management”.

---

<!-- .slide: data-timing="150" -->

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
Percorra da esquerda para a direita. O environment group/hostname resolve a entrada; ProxyEndpoint define a interface; RouteRule escolhe o TargetEndpoint; o target encapsula a conexão. O backend fictício usa domínio `.invalid`, portanto a apresentação é independente de GCP e não sugere uma integração funcional.

---

<!-- .slide: data-timing="150" -->

## O bundle é o artefato implantável

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
Mostre que diretórios e nomes também são contrato. O descritor lista endpoints e policies; arquivos em `proxies/`, `targets/` e `policies/` compõem o bundle. No módulo básico não há policies: isso torna visível o esqueleto mínimo antes de adicionar controles.

---

<!-- .slide: data-timing="150" -->

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
O trecho é extraído do XML original no build. Destaque `BasePath` e a referência `default`: ela deve corresponder ao atributo `name` do TargetEndpoint. Essa indireção permite mudar URL, TLS ou policies do destino sem alterar a interface pública. A validação local verifica essa integridade referencial.

---

<!-- .slide: data-timing="165" -->

## A posição define quando a policy atua

<div class="diagram-frame flow-diagram">
  {{mermaid:docs/pt-br/architecture.md|3|execution-flow|PreFlow, fluxo condicional e PostFlow}}
</div>

<div class="flow-notes">
  <span><b>PreFlow</b> transversal</span>
  <span><b>Conditional Flow</b> por operação</span>
  <span><b>PostFlow</b> fechamento comum</span>
</div>

<div class="source-line"><code>examples/02-intermediate/apiproxy/proxies/default.xml</code> · {{github:examples/02-intermediate/apiproxy/proxies/default.xml|Ver fluxo real}}</div>

Notas:
No request, os segmentos seguem ProxyEndpoint → TargetEndpoint → backend; na resposta, a ordem dos segmentos é invertida. Dentro de cada segmento, Steps executam na ordem declarada. No exemplo, o Conditional Flow `list-orders` corresponde apenas a GET no path `/`. Transição: agora veja como a ordem cria dependências entre policies.

---

<!-- .slide: data-timing="195" -->

## Autenticar antes de contabilizar

<div class="split policy-slide">
<div>

{{xml:examples/02-intermediate/apiproxy/policies/verify-api-key.xml|2:5|1|3}}

<div class="source-line"><code>verify-api-key.xml</code> · {{github:examples/02-intermediate/apiproxy/policies/verify-api-key.xml|Ver código}}</div>

</div>
<div>

{{xml:examples/02-intermediate/apiproxy/policies/quota.xml|2:10|3-8}}

<div class="source-line"><code>quota.xml</code> · {{github:examples/02-intermediate/apiproxy/policies/quota.xml|Ver código}}</div>

</div>
</div>

<div class="pipeline"><b>VerifyAPIKey</b><i>→</i><span>SpikeArrest</span><i>→</i><span>Quota por <code>client_id</code></span><i>→</i><span>correlation ID</span></div>

Notas:
API key identifica a aplicação, não necessariamente o usuário. VerifyAPIKey depende de API product, developer app e chave configurados no Apigee. A policy produz `client_id`, consumido pela Quota; por isso a ordem importa. SpikeArrest suaviza rajadas, enquanto Quota governa consumo por janela. Os limites são didáticos, não dimensionamento de produção.

---

<!-- .slide: data-timing="210" -->

## Confiança, reuso e falhas explícitas

<div class="split advanced-slide">
<div class="diagram-frame">
  {{mermaid:examples/03-advanced/README.md|1|advanced-flow|JWT e Shared Flow no módulo avançado}}
</div>
<div>

{{xml:examples/03-advanced/orders-advanced/apiproxy/policies/verify-jwt.xml|2:11|3-4|5-9}}

<div class="source-line"><code>verify-jwt.xml</code> · {{github:examples/03-advanced/orders-advanced/apiproxy/policies/verify-jwt.xml|Ver código completo}}</div>

</div>
</div>

<div class="advanced-pills"><span>JWKS privado</span><span>FlowCallout</span><span>FaultRule → 401</span><span>fallback → 500</span></div>

Notas:
Assinatura válida não basta: issuer, audience, expiração e claims também delimitam confiança. O JWKS vem de `private.orders.jwks`; obtenção e rotação estão fora do laboratório. Depois do JWT, o FlowCallout invoca `orders-security-shared`, que propaga o subject. `JWT.failed` direciona falhas conhecidas para 401; DefaultFaultRules evitam vazamento de detalhes. O Shared Flow deve ser implantado antes do proxy consumidor.

---

<!-- .slide: data-timing="150" -->

## Guardrails arquiteturais

<div class="guardrails">
  <div><span>01</span><strong>Falhar fechado</strong><small><code>continueOnError="false"</code> em segurança</small></div>
  <div><span>02</span><strong>Separar contratos</strong><small>interface pública ≠ conexão de destino</small></div>
  <div><span>03</span><strong>Reusar com critério</strong><small>Shared Flow pequeno, versionado e implantável</small></div>
  <div><span>04</span><strong>Provar só o provável</strong><small>CI estática ≠ validação de runtime</small></div>
</div>

<p class="takeaway">Policies são configuração. <strong>Decisões continuam sendo arquitetura.</strong></p>

<div class="source-line"><code>docs/pt-br/architectural-decisions.md</code> · {{github:docs/pt-br/architectural-decisions.md|Ver decisões}}</div>

Notas:
Conecte os quatro guardrails aos arquivos vistos. Segurança interrompe o fluxo normal; targets nomeados isolam mudança; Shared Flows reduzem divergência mas criam dependência de rollout; o validador encontra inconsistências locais, não substitui import/deploy, Debug, testes de falha ou observabilidade.

---

<!-- .slide: data-timing="180" -->

## Demonstração: siga a evolução

<div class="demo-path">
  <div><span>01</span><strong>Básico</strong><small>fronteira + RouteRule</small></div>
  <i>→</i>
  <div><span>02</span><strong>Intermediário</strong><small>API key + tráfego</small></div>
  <i>→</i>
  <div><span>03</span><strong>Avançado</strong><small>JWT + reuso + falhas</small></div>
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
Para uma demo ao vivo, compare primeiro os `proxies/default.xml` dos módulos 01 e 02. Em seguida abra o PreFlow intermediário, `quota.xml` e os dois bundles do módulo 03. Finalize executando validador e testes. Os links abrem a referência da branch configurada; os caminhos continuam visíveis mesmo sem GitHub.

---

<!-- .slide: class="closing-slide" data-timing="135" -->

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
Recapitule em uma frase: Apigee cria uma fronteira programável, mas a qualidade dessa fronteira depende da ordem das policies, dos contratos e dos guardrails escolhidos. Convide o público a explorar os módulos na sequência e encerre explicitando os limites: sem GCP provisionado, backend, credenciais ou deploy. Reserve perguntas para depois dos 25–30 minutos.
