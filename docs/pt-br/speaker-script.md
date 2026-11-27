# Roteiro de fala — Google Cloud Apigee

> Documento gerado a partir das notas de `presentation/slides.md`. Não edite este arquivo manualmente; execute `npm run generate:speaker-script --prefix presentation`.

A exposição planejada dura 28 minutos. O slide de perguntas fica fora desse tempo.

## 1. Google Cloud Apigee

**Tempo estimado:** 1 min

**Mensagem principal:** Esta sessão usa bundles XML reais para revisitar fundamentos e tornar decisões de arquitetura do Apigee concretas e discutíveis.

**Fala sugerida:**

Olá! Quero começar com uma pergunta simples: quando dizemos que uma API está bem gerenciada, onde essa intenção aparece de verdade? Como vocês já trabalham com Apigee, não vamos começar do zero. Vamos investigar decisões que parecem simples até uma falha acontecer. [pausa breve]

Vamos acompanhar exemplos independentes de uma API fictícia de pedidos, do proxy mínimo aos controles de tráfego, JWT, reuso e tratamento de falhas. Ao final, quero que vocês consigam explicar a ordem dos flows, justificar a posição e o escopo dos controles e identificar riscos de confiança e implantação. Os exemplos aumentam em complexidade conceitual; não são versões cumulativas nem uma solução pronta para produção.

A conversa parte de bundles XML versionados e aproxima duas perspectivas: onde cada policy executa e quais dependências, limites e custos operacionais essa escolha cria. Não há provisionamento GCP nem execução de chamadas no runtime Apigee.

**Arquivos demonstrados:** `README.md`, `examples/` e `presentation/slides.md`.

**Transição:** Antes de seguir essa API, vale explicar rapidamente de onde vem o olhar que vou usar nesta conversa.

## 2. Sobre mim

**Tempo estimado:** 45 s

**Mensagem principal:** Minha experiência com software corporativo e sistemas distribuídos orienta uma leitura prática, e não promocional, do Apigee.

**Fala sugerida:**

Eu sou Rodrigo de Oliveira. Trabalho com desenvolvimento e arquitetura de software há mais de 20 anos, principalmente em sistemas corporativos.

Minha trajetória passa por .NET, backend, integrações e sistemas distribuídos. Hoje atuo no desenho de soluções, em revisões técnicas e na definição de padrões com times de engenharia. É desse lugar que proponho olhar para o Apigee: como uma fronteira entre sistemas e responsabilidades, não apenas como um produto com uma lista de recursos.

Fora do trabalho, gosto de filosofia, leitura, jogos retrô, um bom café e tempo com minha família e meus gatos. Agora podemos voltar a um problema que provavelmente é familiar para muita gente aqui.

**Arquivos demonstrados:** Nenhum; foto, descrição profissional e interesses foram adaptados do meu portfólio público, disponível no próprio slide.

**Transição:** Se essa fronteira fica entre tantos sistemas e interesses, por que apenas rotear chamadas deixa de ser suficiente?

## 3. APIs crescem. A complexidade também.

**Tempo estimado:** 45 s

**Mensagem principal:** O crescimento das APIs transforma segurança, capacidade e evolução em responsabilidades arquiteturais compartilhadas.

**Fala sugerida:**

Pensem numa API de pedidos que nasceu para um consumidor e um backend. No início, o desenho cabe quase inteiro numa seta. Então chegam novos canais, parceiros, mais tráfego e exigências de segurança. Qual desses desafios já aparece nas revisões de vocês?

O contrato precisa continuar estável enquanto crescem os controles de acesso, consumo e consistência. A pergunta deixa de ser apenas “para onde essa chamada vai?” e passa a ser “quais garantias acompanham essa chamada?”. O objetivo é revisar as escolhas feitas nessa fronteira, sem transferir para ela a regra de negócio.

Uma fronteira administrada pode concentrar preocupações transversais sem transformar o gateway no dono da regra de negócio. Esse limite é importante. Centralizar tudo seria tão problemático quanto duplicar tudo. A arquitetura precisa decidir o que pertence ao runtime e o que pertence ao ciclo de vida mais amplo da API.

**Arquivos demonstrados:** `README.md`, seção “API Gateway e API Management”.

**Transição:** Essa diferença entre acompanhar uma chamada e cuidar da API ao longo do tempo nos leva a dois termos que costumam ser misturados.

## 4. Gateway executa. Management governa.

**Tempo estimado:** 40 s

**Mensagem principal:** O gateway é uma parte do API Management; não devemos atribuir ao componente de execução toda a capacidade da plataforma.

**Fala sugerida:**

Gateway e API Management aparecem muitas vezes como sinônimos. Eles se relacionam, mas não têm o mesmo alcance.

O gateway participa do caminho da chamada. Ele recebe a requisição, aplica as policies configuradas e decide o roteamento. API Management olha também para o que existe ao redor desse caminho: produtos de API, publicação, onboarding de aplicações, analytics, governança e evolução. O Apigee reúne essas capacidades, mas os XMLs deste laboratório mostram principalmente o runtime.

Por que insistir nessa separação? Porque colocar um gateway no ambiente não cria governança por si só. Ainda precisamos definir produtos, responsabilidades, observabilidade e processos de mudança. A ferramenta oferece mecanismos; a organização continua responsável pelas decisões.

**Arquivos demonstrados:** `README.md` e `README.en.md`, seção de gateway versus management.

**Transição:** Com esse escopo claro, podemos voltar à nossa chamada e localizar o papel específico do proxy entre consumidor e backend.

## 5. Uma fronteira entre consumidor e backend

**Tempo estimado:** 45 s

**Mensagem principal:** O API Proxy cria uma fronteira programável sem substituir o backend nem esconder as dependências do ambiente.

**Fala sugerida:**

Vamos seguir uma chamada de pedidos da esquerda para a direita. O desenho é simples, mas cada bloco responde a uma pergunta diferente.

Primeiro, o hostname associado ao environment group recebe a conexão. O ProxyEndpoint representa a interface voltada ao consumidor e executa seus flows. Depois, uma RouteRule escolhe um TargetEndpoint, que encapsula a conexão com o backend. As policies participam desses pipelines como Steps configurados. Percebam que o proxy não substitui o backend. Ele organiza a passagem até ele.

Separar interface pública e conexão de destino permite mudar URL, TLS ou configuração do backend com menos impacto sobre os consumidores. Mas desacoplamento não significa ausência de dependências. O ambiente, o target e as credenciais continuam existindo; apenas deixamos essas relações explícitas no lugar adequado.

Percorra o Mermaid da esquerda para a direita. Ao chegar ao target, mencione que o destino `.invalid` é fictício. Use apenas o diagrama projetado e deixe os arquivos para consulta posterior.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** O diagrama mostra responsabilidades. Para entender como elas se tornam configuração, precisamos abrir essa caixa e olhar o bundle.

## 6. Anatomia de um API Proxy no Apigee

**Tempo estimado:** 45 s

**Mensagem principal:** Esta árvore é um exemplo de bundle XML tradicional do Apigee, não uma estrutura universal de API Gateways.

**Fala sugerida:**

No repositório, aquela arquitetura aparece como uma árvore pequena e deliberadamente explícita. Vamos localizar cada responsabilidade antes de acrescentar comportamento.

Revisão rápida: o descritor identifica o proxy, `proxies/` guarda a interface e o roteamento, e `targets/` guarda o destino. `policies/` e `resources/` aparecem quando necessários. As listas do descritor são metadados opcionais. Esta é a árvore de um bundle XML tradicional do Apigee.

Há dois cuidados aqui. Primeiro, `manifests/` não faz parte da estrutura padrão de bundle documentada pelo Apigee, então não criamos uma pasta artificial. Segundo, esta é a estrutura tradicional de um bundle XML do Apigee, não um modelo universal para gateways. O laboratório privilegia XMLs versionados, embora a plataforma também permita autoria pela interface e por APIs.

Aponte a árvore no slide; não abra arquivos nesta etapa.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/orders-basic.xml`, `examples/01-basic/apiproxy/proxies/default.xml` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** Conhecer as pastas ajuda, mas o ponto mais interessante está nas referências que conectam um XML ao outro.

## 7. Como os XMLs de um proxy Apigee se relacionam

**Tempo estimado:** 50 s

**Mensagem principal:** A configuração é declarativa, mas possui dependências referenciais que o repositório consegue validar estaticamente.

**Fala sugerida:**

Neste trecho curto convivem duas decisões: como o consumidor chama a API e para onde o proxy encaminha a mensagem. Vale não confundir as duas.

O `BasePath` participa do contrato público. Já a RouteRule aponta para o TargetEndpoint chamado `default`, e esse nome precisa corresponder ao atributo `name` no XML do target. Parece apenas uma referência, mas ela cria uma separação útil: o consumidor conhece o caminho público; a conexão com o backend fica encapsulada no target.

Referências por nome ajudam no desacoplamento, mas também abrem espaço para erros silenciosos de digitação. Como fazemos esse erro aparecer cedo? Neste repositório, um script verifica RouteRules, Steps e FlowCallouts. É uma validação útil, mas deliberadamente menor que a validação completa da plataforma.

Explique que o build extrai o trecho diretamente do XML. No código projetado, mostre que o nome da RouteRule deve corresponder ao TargetEndpoint. A comparação completa fica disponível no link. [pausa breve]

**Arquivos demonstrados:** `examples/01-basic/apiproxy/proxies/default.xml`, `examples/01-basic/apiproxy/targets/default.xml` e `scripts/validate_bundles.py`.

**Transição:** Já sabemos onde a configuração está e como as referências se ligam. Falta a pergunta que mais afeta o comportamento: em que momento cada trecho executa?

## 8. Ciclo de execução dos Flows no Apigee

**Tempo estimado:** 1 min 30 s

**Mensagem principal:** A resposta percorre os endpoints em ordem inversa, mas a execução interna continua PreFlow, primeiro Conditional Flow compatível e PostFlow.

**Fala sugerida:**

Na volta do backend, a ordem PreFlow, Conditional Flow e PostFlow também se inverte? Pensem por alguns segundos. Depois vamos ler o diagrama em duas camadas: entre os endpoints e dentro de cada endpoint.

No request, passamos primeiro pelo ProxyEndpoint e depois pelo TargetEndpoint. Na response, o caminho entre eles se inverte. Agora vem o detalhe que merece ênfase: dentro de cada pipeline, a ordem continua sendo PreFlow, primeiro Conditional Flow compatível e PostFlow. Não invertemos essa sequência interna só porque a mensagem está voltando. E, dentro de um flow, os Steps executam na ordem declarada.

A posição de uma policy muda o contexto disponível e, portanto, pode mudar o resultado. Também há uma saída lateral importante: quando uma falha interrompe o fluxo normal, a execução segue para o tratamento de erros. Ela não continua inocentemente pelos próximos Steps.

Resposta: não. Só a ordem entre endpoints se inverte. Use o diagrama e destaque a primeira condição compatível; o exemplo list-orders acrescenta contexto técnico apenas ao GET /.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/02-intermediate/apiproxy/proxies/default.xml`.

**Transição:** Com o modelo mental alinhado, vamos questionar decisões do pipeline intermediário.

## 9. Autenticar, minimizar e contabilizar

**Tempo estimado:** 3 min 30 s

**Mensagem principal:** SpikeArrest limita rajadas; Quota controla consumo por credencial. A ordem das policies define quais chamadas chegam a cada controle.

**Fala sugerida:**

Uma chave inválida chega ao SpikeArrest neste pipeline? E duas chaves da mesma aplicação compartilham a mesma quota? Façam uma previsão antes de olharmos o XML.

A sequência começa com `VerifyAPIKey`, que valida `x-api-key` e disponibiliza as variáveis associadas à credencial. Em seguida, removemos esse header para não repassá-lo ao backend. O `SpikeArrest` controla rajadas do proxy a `10ps`, usando contagem efetiva e janela deslizante regional. A `Quota` controla outra dimensão: até 100 chamadas por minuto para cada consumer key, em janela móvel. Por fim, adicionamos correlação.

Há um trade-off visível na ordem. Como a verificação vem antes do `SpikeArrest`, uma chave inválida falha antes de chegar a esse controle. Portanto, ele não limita essas tentativas neste desenho. Antecipar a proteção exigiria outro arranjo e mudaria o que conseguimos usar como identificador. Aqui, `client_id` contém a própria consumer key, não o identificador lógico da aplicação; duas chaves mantêm contadores distintos. As taxas são didáticas, não recomendações de capacidade.

A resposta é não nos dois casos. Mostre o PreFlow e o Identifier da Quota. Compare a ordem atual com um controle de borda anterior à autenticação, sem propor uma ordem universal: proteger capacidade cedo e contabilizar somente credenciais válidas são objetivos distintos. Uma rotação de chave cria outro contador neste exemplo. Reserve uma pausa curta para a audiência justificar a escolha.

**Arquivos demonstrados:** `examples/02-intermediate/apiproxy/proxies/default.xml`, `verify-api-key.xml`, `remove-api-key.xml`, `quota.xml` e `assign-list-orders-context.xml`.

**Transição:** Além de controlar quem chama e quanto consome, precisamos decidir para onde encaminhar uma chamada sem alterar o contrato público.

## 10. KVM e múltiplos TargetEndpoints

**Tempo estimado:** 3 min 30 s

**Mensagem principal:** Uma KVM pode externalizar configuração; RouteRules ordenadas selecionam TargetEndpoints sem alterar o contrato público.

**Fala sugerida:**

Se a KVM contiver um valor inesperado, queremos encaminhar ao backend padrão ou sinalizar uma falha? A extensão independente `orders-routing` demonstra a segunda escolha, mantendo o mesmo contrato público.

`get-backend-region` lê a chave não sensível `backend-region` da KVM de environment `orders-routing-config` e coloca o valor em `private.lab.backend.region`. Antes de rotear, validamos a configuração. Se a leitura falhar, a entrada estiver ausente ou o valor não for `primary` nem `secondary`, uma RaiseFault encerra o caminho normal de forma controlada. Só depois dessa validação o AssignMessage adiciona contexto técnico. A RouteRule condicional de `secondary` vem primeiro; a regra sem condição para `primary` fecha a lista como fallback.

RouteRules são avaliadas de cima para baixo, e a primeira compatível vence. Sem a validação anterior, um valor incorreto poderia cair silenciosamente no fallback. A KVM e sua entrada não nascem com o bundle; são dependências do environment. No Apigee atual, as entradas de KVM são criptografadas, e o prefixo `private.` evita que o valor apareça em claro nas sessões de Debug. Ainda assim, uma KVM não é obrigatória para esse desenho nem substitui automaticamente um cofre de segredos.

Peça que prevejam o resultado de primary, secondary e um valor inválido. Mostre as RouteRules: secondary escolhe o destino alternativo, primary usa o fallback e valor inválido interrompe antes do roteamento. Discuta quem governa alterações da KVM e por que fallback não deve mascarar configuração incorreta.

**Arquivos demonstrados:** `examples/02-intermediate/orders-routing/apiproxy/` e `examples/02-intermediate/README.md`.

**Transição:** Escolher o destino resolve uma parte da integração. No módulo avançado, a pergunta muda: em quem confiamos, que informação encaminhamos e como falhamos quando algo dá errado?

## 11. Confiança, reuso e falhas explícitas

**Tempo estimado:** 4 min 30 s

**Mensagem principal:** O caminho principal valida o JWT, remove o bearer token e reutiliza apenas o contexto necessário; falhas exigem tratamento específico.

**Fala sugerida:**

Se o gateway valida o token e envia somente o subject, o que impede uma chamada direta ao backend de forjar esse header? Esse é o problema de confiança que precisamos resolver além da policy.

`VerifyJWT` valida RS256, issuer, audience e os claims exigidos usando o JWKS em `private.orders.jwks`. Depois da validação, retiramos `Authorization`. Por quê? Porque o backend deste exemplo não precisa receber o bearer token inteiro. O `FlowCallout` invoca `orders-security-shared`, e o Shared Flow propaga apenas o subject já validado. Isso reduz a informação encaminhada e deixa explícito quem é responsável por confiar no token.

Validar assinatura, issuer e audience não substitui autorização por operação ou recurso. O Shared Flow usa Set em AssignMessage para substituir qualquer valor recebido em `x-authenticated-subject` pelo subject validado no caminho normal após VerifyJWT. Isso não impede acesso direto ao backend: restrições de acesso e autenticação entre serviços adequadas ao threat model são necessárias para confiar na origem e integridade do contexto, mas não estão implementadas no laboratório. Shared Flow reduz duplicação, mas amplia o raio de impacto de uma mudança e exige gestão de compatibilidade e implantação prévia no mesmo environment. JWT.failed agrupa falhas do token e falhas operacionais de chave/configuração em 401 no exemplo; produção deve distingui-las e monitorá-las. Outras falhas locais usam 500; falhas de conexão sem resposta HTTP usam 502; respostas HTTP 4xx/5xx preservam status e recebem corpo sanitizado. Nenhum desses controles adicionais de produção é implantado pelo laboratório.

Mostre a cadeia verify-jwt, remove-authorization e call-shared-security. Pergunte como diferenciar um token inválido de uma indisponibilidade operacional de JWKS e uma falha de transporte de um 404 retornado pelo backend. Aponte a separação entre FaultRules do proxy e do target; não trate o 401 didático como contrato universal.

**Arquivos demonstrados:** `examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml`, `verify-jwt.xml`, `targets/default.xml` e `examples/03-advanced/orders-security-shared/sharedflowbundle/`.

**Transição:** O desenho pode estar correto no repositório e ainda falhar na entrega. Shared Flow, KVM, proxy e environment precisam chegar ao lugar certo, na ordem certa.

## 12. Terraform no ciclo de implantação

**Tempo estimado:** 2 min

**Mensagem principal:** O bundle versionado é um artefato; Terraform pode importar sua revisão e implantá-la por environment sem misturar todas as responsabilidades.

**Fala sugerida:**

Uma alteração de Shared Flow pode afetar vários proxies. Como promover revisões e testar dependências sem transformar o deploy em tentativa e erro?

O pipeline parte de um bundle que já pode ser revisado e validado. Ele gera um ZIP determinístico, registra hash e versão, usa `google_apigee_api` para importar a configuração e `google_apigee_api_deployment` para associar a revisão a um environment. A implantação não termina no momento em que o recurso é criado. Precisamos aguardar, com timeout, a revisão chegar a `READY` antes dos testes. Módulos reutilizáveis podem reduzir repetição, desde que não escondam entradas e dependências importantes.

Shared Flow, KVM e environment criam relações de ordem. Como o deployment é eventualmente consistente, o readiness check consulta a revisão específica, avança em `READY`, falha em `ERROR` e encerra ao atingir o limite. Só depois entram Debug e testes de runtime em ambiente não produtivo. O estado remoto também é parte da arquitetura: requer criptografia, mínimo privilégio, locking, recuperação e cuidado com outputs. Este laboratório descreve o ciclo, mas não inclui credenciais, interfaces privadas, backend de estado ou Terraform executável.

Use o diagrama para destacar revisão, dependências, readiness e testes; não abra HCL. O laboratório não cria recursos nem executa Terraform.

**Arquivos demonstrados:** `docs/pt-br/deployment-lifecycle.md` e `docs/en/deployment-lifecycle.md`.

**Transição:** Depois de percorrer runtime e entrega, podemos condensar o raciocínio em perguntas úteis para uma revisão arquitetural.

## 13. Guardrails arquiteturais

**Tempo estimado:** 1 min 30 s

**Mensagem principal:** Guardrails tornam as decisões revisáveis, mas não removem a necessidade de contexto, testes e operação.

**Fala sugerida:**

Transformem os quatro critérios em perguntas de revisão de PR: onde a falha interrompe o fluxo, quem possui o contrato, quem depende do reuso e qual evidência o teste fornece?

Primeiro: uma policy de segurança interrompe o caminho normal quando falha? Segundo: o contrato público está separado da conexão com o target? Terceiro: o reuso em Shared Flow compensa a nova dependência de implantação? E quarto: os testes deixam claro o que realmente verificam? Essas perguntas tornam as decisões discutíveis e revisáveis.

Guardrails são limites para a conversa, não respostas universais. Eles não substituem threat modeling, planejamento de capacidade, observabilidade nem estratégia de recuperação. O contexto ainda decide o desenho final.

Relacione cada critério a uma decisão já vista. Use `docs/pt-br/architectural-decisions.md` para aprofundar escolhas e `docs/pt-br/validation.md` para mostrar os limites da validação local.

**Arquivos demonstrados:** `docs/pt-br/architectural-decisions.md` e `docs/pt-br/validation.md`.

**Transição:** Esses critérios ficam mais concretos quando observamos a evolução completa, do proxy mínimo ao tratamento explícito de falhas.

## 14. Demonstração: siga a evolução

**Tempo estimado:** 4 min

**Mensagem principal:** O roteiro offline relaciona requisições HTTP, policies e resultados condicionais sem simular o Apigee.

**Fala sugerida:**

Vamos fazer o caminho inverso da teoria e consolidar com três previsões: qual destino é selecionado, qual controle não é alcançado e qual categoria de falha deve ser tratada.

No básico, procuramos o `BasePath` e a RouteRule que levam ao backend fictício. No intermediário, uma chave inválida provoca a falha padrão de `VerifyAPIKey`; com uma chave válida, `SpikeArrest` e `Quota` passam a participar do caminho e podem produzir 429. No avançado, a FaultRule transforma `JWT.failed` em 401, enquanto uma falha de conexão com o target resulta em 502. O demonstrador offline apenas lê essas configurações. Ele não envia requisições HTTP.

Aqui é importante separar evidência de expectativa. Os XMLs permitem explicar o resultado configurado, mas o comportamento observado depende do runtime e de recursos externos. Não mostramos HTTP 200 porque o backend é fictício. O demonstrador não emula o Apigee, e o validador confirma somente XML e referências locais.

Deixe abertos docs/pt-br/http-scenarios.md e os ProxyEndpoints. Use 30 segundos para BasePath e RouteRule; 75 segundos para a chave inválida, quota por chave e 429 condicionais; 90 segundos para JWT.failed → 401, target sem resposta → 502 e backend 404 sanitizado. Use os 45 segundos finais para os dois comandos. Peça previsões antes de revelar o comportamento configurado. Se o terminal atrasar, use o guia de cenários já aberto. Não execute curl para .invalid.

**Arquivos demonstrados:** `docs/pt-br/http-scenarios.md`, `scripts/demo_http_scenarios.py`, `scripts/validate_bundles.py`, `examples/01-basic/`, `examples/02-intermediate/` e `examples/03-advanced/`.

**Transição:** Depois de seguir a mesma ideia do contrato até a falha, podemos voltar à pergunta da abertura: onde a intenção arquitetural aparece de verdade?

## 15. Uma API bem gerenciada torna decisões explícitas.

**Tempo estimado:** 2 min

**Mensagem principal:** Apigee torna a fronteira programável; qualidade vem da intenção explícita, das dependências visíveis e da validação proporcional ao risco.

**Fala sugerida:**

No começo, eu perguntei onde enxergamos a intenção de uma API bem gerenciada. Para concluir, pensem em um proxy que vocês mantêm hoje: qual decisão de pipeline, segurança ou tratamento de falha merece ser revisitada?

Vimos essa intenção na ordem dos flows, na posição e no escopo dos controles e nos riscos de confiança, reuso e falhas. Tornar essas escolhas explícitas permite revisá-las e discordar delas com evidência. Cada pessoa deve conseguir apontar uma decisão concreta no próprio contexto. Os exemplos são configuração declarativa e evidência estática, não garantia de comportamento produtivo.

Em uma implantação real, o próximo passo seria levar as hipóteses para um ambiente de teste: exercitar sucesso e falha, medir limites e definir operação de chaves, logs e rollout. Talvez essa seja a reflexão mais útil para levar daqui: uma boa arquitetura não é a que esconde a complexidade, mas a que torna suas decisões e limites compreensíveis para quem precisa operá-la. [pausa]

**Arquivos demonstrados:** `README.md`, `docs/pt-br/` e `examples/`.

**Transição:** Obrigado por acompanharem esse percurso. Agora quero ouvir as perguntas e os cenários de vocês.

## 16. Perguntas?

**Tempo estimado:** fora do tempo de exposição

**Mensagem principal:** O tempo de perguntas começa agora e não faz parte dos 28 minutos de exposição.

**Fala sugerida:**

Obrigado! Agora quero ouvir as perguntas e, se fizer sentido, os cenários que vocês encontram no dia a dia.

Se precisarmos de um ponto de partida, algumas perguntas costumam abrir boas discussões: quando usar API key ou JWT? Onde posicionar uma policy? Como versionar Shared Flows? Qual é a diferença prática entre `SpikeArrest` e `Quota`? E o que só pode ser validado dentro do Apigee?

Ao responder, separe o que o laboratório comprova daquilo que depende de topologia, licenciamento, volume, threat model ou processos da organização. Quando faltar contexto, explicite a hipótese. Isso preserva a precisão sem transformar o exemplo em receita universal.

**Arquivos demonstrados:** `README.md` e o repositório público indicado na tela.

**Transição:** Ao encerrar, agradeça e indique o repositório para quem quiser reproduzir o percurso ou continuar a discussão.
