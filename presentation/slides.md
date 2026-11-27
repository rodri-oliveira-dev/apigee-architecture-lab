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
**Mensagem principal:** Esta sessão torna decisões de API Management concretas ao acompanhá-las em bundles XML reais e verificáveis.

**Abertura:** Olá! Quero começar com uma pergunta simples: quando dizemos que uma API está bem gerenciada, onde essa intenção aparece de verdade? Hoje vamos procurá-la em um lugar bastante concreto: nos arquivos que conseguimos ler, versionar e revisar. [pausa breve]

**Explicação principal:** Vamos acompanhar uma API fictícia de pedidos. Ela começa como um proxy mínimo e, aos poucos, recebe controles de acesso, tráfego, JWT, reuso e tratamento de falhas. O foco está na configuração declarativa do runtime. Não vamos provisionar o Google Cloud, e este laboratório não pretende ser uma receita pronta para produção.

**Contexto arquitetural:** Quero aproximar duas perspectivas que às vezes ficam separadas. Para quem desenvolve, importa saber onde cada policy executa. Para quem desenha a arquitetura, importa enxergar as dependências, os limites e o custo operacional de cada escolha.

**Arquivos demonstrados:** `README.md`, `examples/` e `presentation/slides.md`.

**Transição:** Antes de seguir essa API, vale explicar rapidamente de onde vem o olhar que vou usar nesta conversa.

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
**Mensagem principal:** Minha experiência com software corporativo e sistemas distribuídos orienta uma leitura prática, e não promocional, do Apigee.

**Abertura:** Eu sou Rodrigo de Oliveira. Trabalho com desenvolvimento e arquitetura de software há mais de 20 anos, principalmente em sistemas corporativos.

**Explicação principal:** Minha trajetória passa por .NET, backend, integrações e sistemas distribuídos. Hoje atuo no desenho de soluções, em revisões técnicas e na definição de padrões com times de engenharia. É desse lugar que proponho olhar para o Apigee: como uma fronteira entre sistemas e responsabilidades, não apenas como um produto com uma lista de recursos.

**Contexto arquitetural:** Fora do trabalho, gosto de filosofia, leitura, jogos retrô, um bom café e tempo com minha família e meus gatos. Agora podemos voltar a um problema que provavelmente é familiar para muita gente aqui.

**Arquivos demonstrados:** Nenhum; foto, descrição profissional e interesses foram adaptados do meu portfólio público, disponível no próprio slide.

**Transição:** Se essa fronteira fica entre tantos sistemas e interesses, por que apenas rotear chamadas deixa de ser suficiente?

---

<!-- .slide: data-timing="90" -->

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

**Abertura:** Pensem numa API de pedidos que nasceu para atender um único consumidor e um único backend. No início, o desenho cabe quase inteiro numa seta. Então chegam o aplicativo móvel, um parceiro, um novo canal e requisitos de segurança.

**Explicação principal:** De repente, precisamos identificar a aplicação, talvez também o usuário, proteger o backend contra rajadas, controlar consumo e manter o contrato estável enquanto o sistema interno evolui. A pergunta deixa de ser apenas “para onde essa chamada vai?” e passa a ser “quais garantias acompanham essa chamada?”. Se cada backend responder por conta própria, repetimos controles e produzimos comportamentos diferentes para o mesmo problema.

**Contexto arquitetural:** Uma fronteira administrada pode concentrar preocupações transversais sem transformar o gateway no dono da regra de negócio. Esse limite é importante. Centralizar tudo seria tão problemático quanto duplicar tudo. A arquitetura precisa decidir o que pertence ao runtime e o que pertence ao ciclo de vida mais amplo da API.

**Arquivos demonstrados:** `README.md`, seção “API Gateway e API Management”.

**Transição:** Essa diferença entre acompanhar uma chamada e cuidar da API ao longo do tempo nos leva a dois termos que costumam ser misturados.

---

<!-- .slide: data-timing="100" -->

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

**Abertura:** Gateway e API Management aparecem muitas vezes como sinônimos. Eles se relacionam, mas não têm o mesmo alcance.

**Explicação principal:** O gateway participa do caminho da chamada. Ele recebe a requisição, aplica as policies configuradas e decide o roteamento. API Management olha também para o que existe ao redor desse caminho: produtos de API, publicação, onboarding de aplicações, analytics, governança e evolução. O Apigee reúne essas capacidades, mas os XMLs deste laboratório mostram principalmente o runtime.

**Contexto arquitetural:** Por que insistir nessa separação? Porque colocar um gateway no ambiente não cria governança por si só. Ainda precisamos definir produtos, responsabilidades, observabilidade e processos de mudança. A ferramenta oferece mecanismos; a organização continua responsável pelas decisões.

**Arquivos demonstrados:** `README.md` e `README.en.md`, seção de gateway versus management.

**Transição:** Com esse escopo claro, podemos voltar à nossa chamada e localizar o papel específico do proxy entre consumidor e backend.

---

<!-- .slide: data-timing="110" -->

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

**Abertura:** Vamos seguir uma chamada de pedidos da esquerda para a direita. O desenho é simples, mas cada bloco responde a uma pergunta diferente.

**Explicação principal:** Primeiro, o hostname associado ao environment group recebe a conexão. O ProxyEndpoint representa a interface voltada ao consumidor e executa seus flows. Depois, uma RouteRule escolhe um TargetEndpoint, que encapsula a conexão com o backend. As policies participam desses pipelines como Steps configurados. Percebam que o proxy não substitui o backend. Ele organiza a passagem até ele.

**Contexto arquitetural:** Separar interface pública e conexão de destino permite mudar URL, TLS ou configuração do backend com menos impacto sobre os consumidores. Mas desacoplamento não significa ausência de dependências. O ambiente, o target e as credenciais continuam existindo; apenas deixamos essas relações explícitas no lugar adequado.

**Demonstração:** Percorra o Mermaid da esquerda para a direita. Ao chegar ao target, mencione que `orders-backend.example.invalid` é intencionalmente fictício. O slide e os XMLs podem ser estudados sem autenticação no Google Cloud; não há uma integração funcional escondida por trás do exemplo.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** O diagrama mostra responsabilidades. Para entender como elas se tornam configuração, precisamos abrir essa caixa e olhar o bundle.

---

<!-- .slide: data-timing="120" -->

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

**Abertura:** No repositório, aquela arquitetura aparece como uma árvore pequena e deliberadamente explícita. Vamos localizar cada responsabilidade antes de acrescentar comportamento.

**Explicação principal:** O descritor na raiz identifica o proxy. Em `proxies/default.xml` ficam a interface e o roteamento. Em `targets/default.xml`, a conexão de destino. A pasta `policies/` só é necessária quando existem policies, e `resources/` aparece quando usamos scripts, JARs ou XSLT. As listas `Policies`, `ProxyEndpoints` e `TargetEndpoints` do descritor são metadados opcionais, muitas vezes gerados pela interface do Apigee.

**Contexto arquitetural:** Há dois cuidados aqui. Primeiro, `manifests/` não faz parte da estrutura padrão de bundle documentada pelo Apigee, então não criamos uma pasta artificial. Segundo, esta é a estrutura tradicional de um bundle XML do Apigee, não um modelo universal para gateways. O laboratório privilegia XMLs versionados, embora a plataforma também permita autoria pela interface e por APIs.

**Demonstração:** Abra `examples/01-basic/apiproxy/` e deixe a audiência comparar a árvore real com o slide. Chame atenção para a ausência de `policies/`: no módulo básico, queremos ver o esqueleto antes de adicionar controles.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/orders-basic.xml`, `examples/01-basic/apiproxy/proxies/default.xml` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** Conhecer as pastas ajuda, mas o ponto mais interessante está nas referências que conectam um XML ao outro.

---

<!-- .slide: data-timing="110" -->

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

**Abertura:** Neste trecho curto convivem duas decisões: como o consumidor chama a API e para onde o proxy encaminha a mensagem. Vale não confundir as duas.

**Explicação principal:** O `BasePath` participa do contrato público. Já a RouteRule aponta para o TargetEndpoint chamado `default`, e esse nome precisa corresponder ao atributo `name` no XML do target. Parece apenas uma referência, mas ela cria uma separação útil: o consumidor conhece o caminho público; a conexão com o backend fica encapsulada no target.

**Contexto arquitetural:** Referências por nome ajudam no desacoplamento, mas também abrem espaço para erros silenciosos de digitação. Como fazemos esse erro aparecer cedo? Neste repositório, um script verifica RouteRules, Steps e FlowCallouts. É uma validação útil, mas deliberadamente menor que a validação completa da plataforma.

**Demonstração:** Explique que o build extrai o trecho diretamente do XML, evitando uma cópia desatualizada no slide. Em seguida, abra o TargetEndpoint e compare os dois usos de `default`. [pausa para a audiência localizar os nomes]

**Arquivos demonstrados:** `examples/01-basic/apiproxy/proxies/default.xml`, `examples/01-basic/apiproxy/targets/default.xml` e `scripts/validate_bundles.py`.

**Transição:** Já sabemos onde a configuração está e como as referências se ligam. Falta a pergunta que mais afeta o comportamento: em que momento cada trecho executa?

---

<!-- .slide: data-timing="150" -->

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

**Abertura:** Este diagrama costuma ficar mais simples quando o lemos em duas camadas: primeiro entre os endpoints; depois, dentro de cada endpoint.

**Explicação principal:** No request, passamos primeiro pelo ProxyEndpoint e depois pelo TargetEndpoint. Na response, o caminho entre eles se inverte. Agora vem o detalhe que merece ênfase: dentro de cada pipeline, a ordem continua sendo PreFlow, primeiro Conditional Flow compatível e PostFlow. Não invertemos essa sequência interna só porque a mensagem está voltando. E, dentro de um flow, os Steps executam na ordem declarada.

**Contexto arquitetural:** A posição de uma policy muda o contexto disponível e, portanto, pode mudar o resultado. Também há uma saída lateral importante: quando uma falha interrompe o fluxo normal, a execução segue para o tratamento de erros. Ela não continua inocentemente pelos próximos Steps.

**Demonstração:** Siga as setas sem tentar explicar todos os blocos ao mesmo tempo. Depois abra `list-orders` no proxy intermediário. Mostre que o Conditional Flow de `GET /` apenas adiciona `x-api-operation`; ele não implementa regra de negócio.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/02-intermediate/apiproxy/proxies/default.xml`.

**Transição:** Se posição e ordem alteram o comportamento, a sequência de policies do módulo intermediário deixa de ser um detalhe de implementação.

---

<!-- .slide: data-timing="140" -->

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

**Abertura:** Quando alguém diz “precisamos limitar a API”, a primeira pergunta deveria ser: limitar o quê? Uma rajada e o consumo acumulado não são o mesmo problema.

**Explicação principal:** A sequência começa com `VerifyAPIKey`, que valida `x-api-key` e disponibiliza as variáveis associadas à credencial. Em seguida, removemos esse header para não repassá-lo ao backend. O `SpikeArrest` controla rajadas do proxy a `10ps`, usando contagem efetiva e janela deslizante regional. A `Quota` controla outra dimensão: até 100 chamadas por minuto para cada consumer key, em janela móvel. Por fim, adicionamos correlação.

**Contexto arquitetural:** Há um trade-off visível na ordem. Como a verificação vem antes do `SpikeArrest`, uma chave inválida falha antes de chegar a esse controle. Portanto, ele não limita essas tentativas neste desenho. Antecipar a proteção exigiria outro arranjo e mudaria o que conseguimos usar como identificador. Aqui, `client_id` contém a própria consumer key, não o identificador lógico da aplicação; duas chaves mantêm contadores distintos. As taxas são didáticas, não recomendações de capacidade.

**Demonstração:** No PreFlow, percorra a sequência da esquerda para a direita. Abra a taxa em `spike-arrest.xml` e o `Identifier` em `quota.xml`. Faça a comparação em uma frase: um protege contra rajadas; o outro contabiliza consumo por credencial.

**Arquivos demonstrados:** `examples/02-intermediate/apiproxy/proxies/default.xml`, `verify-api-key.xml`, `remove-api-key.xml`, `quota.xml` e `assign-list-orders-context.xml`.

**Transição:** Até aqui, o destino era fixo. E se quisermos escolher entre dois backends sem alterar o contrato público nem enterrar a decisão no código?

---

<!-- .slide: data-timing="150" -->

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

**Abertura:** Esta extensão é independente do proxy intermediário principal. O consumidor continua usando o mesmo `BasePath`, enquanto o proxy escolhe entre dois backends fictícios.

**Explicação principal:** `get-backend-region` lê a chave não sensível `backend-region` da KVM de environment `orders-routing-config` e coloca o valor em `private.lab.backend.region`. Antes de rotear, validamos a configuração. Se a leitura falhar, a entrada estiver ausente ou o valor não for `primary` nem `secondary`, uma RaiseFault encerra o caminho normal de forma controlada. Só depois dessa validação o AssignMessage adiciona contexto técnico. A RouteRule condicional de `secondary` vem primeiro; a regra sem condição para `primary` fecha a lista como fallback.

**Contexto arquitetural:** RouteRules são avaliadas de cima para baixo, e a primeira compatível vence. Sem a validação anterior, um valor incorreto poderia cair silenciosamente no fallback. A KVM e sua entrada não nascem com o bundle; são dependências do environment. No Apigee atual, as entradas de KVM são criptografadas, e o prefixo `private.` evita que o valor apareça em claro nas sessões de Debug. Ainda assim, uma KVM não é obrigatória para esse desenho nem substitui automaticamente um cofre de segredos.

**Demonstração:** Compare `primary.xml` e `secondary.xml`, depois volte às RouteRules. Aponte a condição opcional do Step de AssignMessage e destaque o efeito arquitetural: os hostnames mudam, mas não vazam para o contrato público.

**Arquivos demonstrados:** `examples/02-intermediate/orders-routing/apiproxy/` e `examples/02-intermediate/README.md`.

**Transição:** Escolher o destino resolve uma parte da integração. No módulo avançado, a pergunta muda: em quem confiamos, que informação encaminhamos e como falhamos quando algo dá errado?

---

<!-- .slide: data-timing="150" -->

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

**Abertura:** No módulo avançado, quero acompanhar duas coisas: como a confiança é estabelecida e quanto dessa identidade realmente precisa chegar ao backend.

**Explicação principal:** `VerifyJWT` valida RS256, issuer, audience e os claims exigidos usando o JWKS em `private.orders.jwks`. Depois da validação, retiramos `Authorization`. Por quê? Porque o backend deste exemplo não precisa receber o bearer token inteiro. O `FlowCallout` invoca `orders-security-shared`, e o Shared Flow propaga apenas o subject já validado. Isso reduz a informação encaminhada e deixa explícito quem é responsável por confiar no token.

**Contexto arquitetural:** O caminho de erro merece tanto cuidado quanto o caminho feliz. `JWT.failed` pode representar um token inválido, mas também um problema operacional de chave ou configuração. O laboratório simplifica todos esses casos em 401; em produção, falhas de JWKS precisam ser distinguidas e monitoradas. Outras falhas locais usam 500, conectividade com o target usa 502, e respostas 4xx ou 5xx do backend preservam o status com corpo sanitizado. Há ainda uma dependência de implantação: o Shared Flow precisa existir antes, no mesmo environment.

**Demonstração:** Siga apenas o caminho principal no diagrama: `verify-jwt → remove-authorization → call-shared-security`. Não tente narrar toda a matriz de falhas no slide; use-a para responder perguntas. Abra `targets/default.xml` apenas se houver dúvida sobre falhas do target.

**Arquivos demonstrados:** `examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml`, `verify-jwt.xml`, `targets/default.xml` e `examples/03-advanced/orders-security-shared/sharedflowbundle/`.

**Transição:** O desenho pode estar correto no repositório e ainda falhar na entrega. Shared Flow, KVM, proxy e environment precisam chegar ao lugar certo, na ordem certa.

---

<!-- .slide: data-timing="140" -->

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

**Abertura:** Infrastructure as Code entra aqui como parte do ciclo de entrega, não como substituto para um bundle bem definido.

**Explicação principal:** O pipeline parte de um bundle que já pode ser revisado e validado. Ele gera um ZIP determinístico, registra hash e versão, usa `google_apigee_api` para importar a configuração e `google_apigee_api_deployment` para associar a revisão a um environment. A implantação não termina no momento em que o recurso é criado. Precisamos aguardar, com timeout, a revisão chegar a `READY` antes dos testes. Módulos reutilizáveis podem reduzir repetição, desde que não escondam entradas e dependências importantes.

**Contexto arquitetural:** Shared Flow, KVM e environment criam relações de ordem. Como o deployment é eventualmente consistente, o readiness check consulta a revisão específica, avança em `READY`, falha em `ERROR` e encerra ao atingir o limite. Só depois entram Debug e testes de runtime em ambiente não produtivo. O estado remoto também é parte da arquitetura: requer criptografia, mínimo privilégio, locking, recuperação e cuidado com outputs. Este laboratório descreve o ciclo, mas não inclui credenciais, interfaces privadas, backend de estado ou Terraform executável.

**Demonstração:** Percorra o Mermaid como uma linha do tempo, do bundle aos testes. Abra a documentação do provider apenas se houver pergunta. Os nomes dos dois recursos são oficiais; já a estratégia de módulos depende do contexto de cada organização.

**Arquivos demonstrados:** `docs/pt-br/deployment-lifecycle.md` e `docs/en/deployment-lifecycle.md`.

**Transição:** Depois de percorrer runtime e entrega, podemos condensar o raciocínio em perguntas úteis para uma revisão arquitetural.

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

**Abertura:** Se eu tivesse poucos minutos para revisar uma integração como esta, começaria por quatro critérios.

**Explicação principal:** Primeiro: uma policy de segurança interrompe o caminho normal quando falha? Segundo: o contrato público está separado da conexão com o target? Terceiro: o reuso em Shared Flow compensa a nova dependência de implantação? E quarto: os testes deixam claro o que realmente verificam? Essas perguntas tornam as decisões discutíveis e revisáveis.

**Contexto arquitetural:** Guardrails são limites para a conversa, não respostas universais. Eles não substituem threat modeling, planejamento de capacidade, observabilidade nem estratégia de recuperação. O contexto ainda decide o desenho final.

**Demonstração:** Relacione cada critério a uma decisão já vista. Use `docs/pt-br/architectural-decisions.md` para aprofundar escolhas e `docs/pt-br/validation.md` para mostrar os limites da validação local.

**Arquivos demonstrados:** `docs/pt-br/architectural-decisions.md` e `docs/pt-br/validation.md`.

**Transição:** Esses critérios ficam mais concretos quando observamos a evolução completa, do proxy mínimo ao tratamento explícito de falhas.

---

<!-- .slide: data-timing="150" -->

## Demonstração: siga a evolução

<div class="demo-path">
  <div><span>01 · 30 s</span><strong>Básico</strong><small>BasePath + RouteRule</small></div>
  <i>→</i>
  <div><span>02 · 45 s</span><strong>Intermediário</strong><small>chave inválida → 401</small></div>
  <i>→</i>
  <div><span>03 · 40 s</span><strong>Avançado</strong><small>JWT 401 · target 502</small></div>
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

**Abertura:** Agora vamos fazer o caminho inverso da teoria: partir de três requisições hipotéticas e localizar, nos XMLs, as decisões que influenciam cada resultado.

**Explicação principal:** No básico, procuramos o `BasePath` e a RouteRule que levam ao backend fictício. No intermediário, uma chave inválida provoca a falha padrão de `VerifyAPIKey`; com uma chave válida, `SpikeArrest` e `Quota` passam a participar do caminho e podem produzir 429. No avançado, a FaultRule transforma `JWT.failed` em 401, enquanto uma falha de conexão com o target resulta em 502. O demonstrador offline apenas lê essas configurações. Ele não envia requisições HTTP.

**Contexto arquitetural:** Aqui é importante separar evidência de expectativa. Os XMLs permitem explicar o resultado configurado, mas o comportamento observado depende do runtime e de recursos externos. Não mostramos HTTP 200 porque o backend é fictício. O demonstrador não emula o Apigee, e o validador confirma somente XML e referências locais.

**Demonstração:** Deixe `docs/pt-br/http-scenarios.md` e os ProxyEndpoints abertos antes da apresentação. Use cerca de 30 segundos no básico, 45 no intermediário e 40 no avançado. Nos 35 segundos finais, execute os dois comandos do slide e diga em voz alta o que cada um comprova. Deixe o backend 404 sanitizado para perguntas. Não execute `curl` para `.invalid`. Se a troca de janelas atrasar, preserve o básico e o avançado; abrevie a navegação do intermediário, sem cortar a distinção entre `SpikeArrest` e `Quota`.

**Arquivos demonstrados:** `docs/pt-br/http-scenarios.md`, `scripts/demo_http_scenarios.py`, `scripts/validate_bundles.py`, `examples/01-basic/`, `examples/02-intermediate/` e `examples/03-advanced/`.

**Transição:** Depois de seguir a mesma ideia do contrato até a falha, podemos voltar à pergunta da abertura: onde a intenção arquitetural aparece de verdade?

---

<!-- .slide: class="closing-slide" data-timing="75" -->

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

**Abertura:** No começo, eu perguntei onde conseguimos enxergar a intenção de uma API bem gerenciada. A resposta que este laboratório propõe é: nas decisões que deixamos visíveis.

**Explicação principal:** Vimos essa intenção na separação entre interface e destino, na ordem dos flows e na forma como segurança, limites, reuso e falhas aparecem em XMLs versionáveis. Tornar essas escolhas explícitas permite revisá-las, testá-las e discordar delas com evidência. Mas o laboratório demonstra configuração declarativa; ele não garante comportamento produtivo.

**Contexto arquitetural:** Em uma implantação real, o próximo passo seria levar as hipóteses para um ambiente de teste: exercitar sucesso e falha, medir limites e definir operação de chaves, logs e rollout. Talvez essa seja a reflexão mais útil para levar daqui: uma boa arquitetura não é a que esconde a complexidade, mas a que torna suas decisões e limites compreensíveis para quem precisa operá-la. [pausa]

**Arquivos demonstrados:** `README.md`, `docs/pt-br/` e `examples/`.

**Transição:** Obrigado por acompanharem esse percurso. Agora quero ouvir as perguntas e os cenários de vocês.

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

**Abertura:** Obrigado! Agora quero ouvir as perguntas e, se fizer sentido, os cenários que vocês encontram no dia a dia.

**Explicação principal:** Se precisarmos de um ponto de partida, algumas perguntas costumam abrir boas discussões: quando usar API key ou JWT? Onde posicionar uma policy? Como versionar Shared Flows? Qual é a diferença prática entre `SpikeArrest` e `Quota`? E o que só pode ser validado dentro do Apigee?

**Contexto arquitetural:** Ao responder, separe o que o laboratório comprova daquilo que depende de topologia, licenciamento, volume, threat model ou processos da organização. Quando faltar contexto, explicite a hipótese. Isso preserva a precisão sem transformar o exemplo em receita universal.

**Arquivos demonstrados:** `README.md` e o repositório público indicado na tela.

**Transição:** Ao encerrar, agradeça e indique o repositório para quem quiser reproduzir o percurso ou continuar a discussão.
