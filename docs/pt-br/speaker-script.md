# Roteiro de fala — Google Cloud Apigee

> Documento gerado a partir das notas de `presentation/slides.md`. Não edite este arquivo manualmente; execute `npm run generate:speaker-script --prefix presentation`.

A exposição planejada dura 28 minutos. O slide de perguntas fica fora desse tempo.

## 1. Google Cloud Apigee

**Tempo estimado:** 1 min

**Mensagem principal:** Esta sessão conecta conceitos de API Management a bundles XML reais e verificáveis.

**Fala sugerida:**

Olá! Hoje eu quero mostrar o Apigee por um ângulo bastante concreto: como decisões de arquitetura aparecem em arquivos que conseguimos ler, versionar e revisar.

Vamos evoluir uma API fictícia de pedidos do proxy mínimo até controles de acesso, tráfego, JWT, reuso e tratamento de falhas. O foco é a configuração declarativa do runtime; não vamos provisionar Google Cloud nem apresentar este laboratório como uma solução pronta para produção.

A proposta é aproximar duas perspectivas: para quem desenvolve, onde cada policy executa; para quem arquiteta, quais dependências e limites essa escolha cria.

**Arquivos demonstrados:** `README.md`, `examples/` e `presentation/slides.md`.

**Transição:** Antes de entrar no problema das APIs, quero me apresentar rapidamente e explicar de onde vem esse recorte.

## 2. Sobre mim

**Tempo estimado:** 45 s

**Mensagem principal:** Mais de 20 anos de experiência em software e sistemas distribuídos orientam minha leitura prática do Apigee e da governança de APIs.

**Fala sugerida:**

Sou Rodrigo de Oliveira, arquiteto de software, com mais de 20 anos de experiência em sistemas corporativos.

Minha trajetória passa por .NET, backend, integrações e sistemas distribuídos. Hoje trabalho com desenho de soluções, revisão técnica e padrões de engenharia. É desse ponto de vista que proponho olhar para o Apigee: uma fronteira entre sistemas, não apenas um produto.

Fora do trabalho, gosto de filosofia, leitura, jogos retrô e de estar com minha família e meus gatos.

**Arquivos demonstrados:** Nenhum; foto, descrição profissional e interesses foram adaptados do meu portfólio público, disponível no próprio slide.

**Transição:** Agora, por que essa fronteira precisa ser administrada?

## 3. APIs crescem. A complexidade também.

**Tempo estimado:** 1 min 30 s

**Mensagem principal:** O crescimento das APIs transforma segurança, capacidade e evolução em responsabilidades arquiteturais compartilhadas.

**Fala sugerida:**

Pensem em uma API de pedidos que começou com um consumidor e um backend. O caminho parecia simples até surgirem outros canais, parceiros e requisitos de segurança.

Agora precisamos identificar a aplicação, talvez o usuário, proteger o backend contra rajadas, controlar consumo e manter um contrato estável enquanto o sistema interno muda. Se cada backend resolver isso de um jeito, criamos duplicação e respostas inconsistentes.

Uma fronteira administrada concentra preocupações transversais sem transformar o gateway no dono da regra de negócio. Isso melhora governança e desacoplamento, mas também exige clareza sobre o que pertence ao runtime e o que pertence ao ciclo de vida da API.

**Arquivos demonstrados:** `README.md`, seção “API Gateway e API Management”.

**Transição:** Essa distinção nos leva diretamente à diferença entre executar uma chamada e governar uma API ao longo do tempo.

## 4. Gateway executa. Management governa.

**Tempo estimado:** 1 min 40 s

**Mensagem principal:** O gateway é uma parte do API Management; não devemos atribuir ao componente de execução toda a capacidade da plataforma.

**Fala sugerida:**

Aqui vale separar dois termos que muitas vezes aparecem como sinônimos, mas representam escopos diferentes.

O gateway está no caminho da chamada: recebe a requisição, aplica as policies configuradas e decide o roteamento. API Management é mais amplo e inclui produtos de API, publicação, onboarding de aplicações, analytics, governança e ciclo de vida. O Apigee reúne essas capacidades, mas os XMLs deste repositório demonstram principalmente o runtime.

Essa separação evita uma expectativa perigosa: instalar um gateway não cria governança automaticamente. Produtos, responsabilidades, observabilidade e processos de mudança continuam sendo decisões organizacionais.

**Arquivos demonstrados:** `README.md` e `README.en.md`, seção de gateway versus management.

**Transição:** Com o escopo alinhado, podemos enxergar onde o proxy entra entre o consumidor e o backend.

## 5. Uma fronteira entre consumidor e backend

**Tempo estimado:** 1 min 50 s

**Mensagem principal:** O API Proxy cria uma fronteira programável sem substituir o backend nem esconder as dependências do ambiente.

**Fala sugerida:**

Vamos acompanhar uma chamada de pedidos da esquerda para a direita.

O hostname associado ao environment group recebe a conexão. O ProxyEndpoint representa a interface voltada ao consumidor e executa seus flows. A RouteRule seleciona um TargetEndpoint, que encapsula a conexão com o backend. Policies entram nesses pipelines como Steps configurados.

Separar a interface pública da conexão de destino permite evoluir URL, TLS ou configuração do backend com menor impacto sobre consumidores. Isso é desacoplamento de contrato, não ausência de dependências.

Abra `docs/pt-br/architecture.md` e mostre o primeiro Mermaid. Aponte que `orders-backend.example.invalid` é intencionalmente fictício; não existe integração funcional nem necessidade de autenticação GCP para ver os slides.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** Agora vamos abrir essa fronteira e localizar as peças que formam um bundle implantável.

## 6. Anatomia de um API Proxy no Apigee

**Tempo estimado:** 2 min

**Mensagem principal:** Esta árvore é um exemplo de bundle XML tradicional do Apigee, não uma estrutura universal de API Gateways.

**Fala sugerida:**

No repositório, essa arquitetura aparece como uma estrutura pequena e deliberadamente explícita.

O descritor raiz identifica o proxy. `proxies/default.xml` define a interface e o roteamento; `targets/default.xml` define o destino. `policies/` só é necessário quando há policies, e `resources/` aparece quando scripts, JARs ou XSLT são usados. As listas `Policies`, `ProxyEndpoints` e `TargetEndpoints` no descritor são metadados opcionais, frequentemente gerados pela UI.

`manifests/` não é um diretório padrão da estrutura de bundle documentada pelo Apigee; por isso não adicionamos um diretório artificial. O laboratório escolhe arquivos XML versionados, mas proxies também podem ser criados e editados pela UI ou APIs da plataforma. A estrutura mostrada não deve ser generalizada para outros gateways.

Abra `examples/01-basic/apiproxy/`. Mostre que o módulo básico não possui diretório de policies: ele expõe o esqueleto mínimo antes de acrescentarmos comportamento.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/orders-basic.xml`, `examples/01-basic/apiproxy/proxies/default.xml` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** A estrutura fica mais clara quando seguimos uma referência concreta de um XML ao outro.

## 7. Como os XMLs de um proxy Apigee se relacionam

**Tempo estimado:** 1 min 50 s

**Mensagem principal:** A configuração é declarativa, mas possui dependências referenciais que o repositório consegue validar estaticamente.

**Fala sugerida:**

Neste trecho curto existem duas decisões diferentes: como o consumidor chama a API e para onde o proxy encaminha a mensagem.

`BasePath` participa do contrato público. A RouteRule aponta para o TargetEndpoint chamado `default`; esse valor precisa corresponder ao atributo `name` no XML do target. É essa indireção que mantém a URL do backend fora da interface pública.

Referências por nome ajudam no desacoplamento, mas falhas de digitação só aparecem cedo se forem validadas. O script local verifica essa relação, além de Steps e FlowCallouts, sem alegar equivalência ao schema completo da plataforma.

O trecho na tela é extraído de `examples/01-basic/apiproxy/proxies/default.xml` durante o build. Abra também o TargetEndpoint e compare `name="default"`.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/proxies/default.xml`, `examples/01-basic/apiproxy/targets/default.xml` e `scripts/validate_bundles.py`.

**Transição:** Depois de saber como os arquivos se ligam, precisamos entender quando cada trecho executa.

## 8. Ciclo de execução dos Flows no Apigee

**Tempo estimado:** 2 min 30 s

**Mensagem principal:** A resposta percorre os endpoints em ordem inversa, mas a execução interna continua PreFlow, primeiro Conditional Flow compatível e PostFlow.

**Fala sugerida:**

Leia o diagrama em duas camadas: entre os endpoints e dentro de cada endpoint.

No request, o ProxyEndpoint executa antes do TargetEndpoint. No response, a ordem entre eles se inverte. Dentro de cada pipeline, em qualquer sentido, a sequência continua PreFlow, primeiro Conditional Flow compatível e PostFlow. Cada flow executa seus Steps na ordem declarada.

A posição determina quais variáveis estão disponíveis. Não devemos inverter a ordem interna na resposta; e uma falha que interrompe a execução normal segue para tratamento de erros, não para os próximos Steps.

Siga as setas em `docs/pt-br/architecture.md`. Depois mostre `list-orders` no proxy intermediário: o Conditional Flow de `GET /` apenas adiciona `x-api-operation`, sem lógica de negócio.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/02-intermediate/apiproxy/proxies/default.xml`.

**Transição:** Com isso em mente, vamos analisar a sequência das policies.

## 9. Autenticar, minimizar e contabilizar

**Tempo estimado:** 2 min 20 s

**Mensagem principal:** SpikeArrest limita rajadas; Quota controla consumo por credencial. A ordem das policies define quais chamadas chegam a cada controle.

**Fala sugerida:**

SpikeArrest e Quota resolvem problemas diferentes. E a ordem das policies importa.

`VerifyAPIKey` valida `x-api-key` e disponibiliza variáveis da chave. Removemos o header antes do roteamento. Depois, `SpikeArrest` limita rajadas do proxy a `10ps` em janela deslizante regional; `Quota` permite 100 chamadas por minuto para cada consumer key, em janela móvel. Por último, adicionamos correlação.

Aqui, `client_id` contém a própria chave, não o identificador lógico da aplicação: duas chaves têm contadores distintos. Como a verificação vem antes do SpikeArrest, chaves inválidas falham antes de alcançar essa policy. Portanto, ela não limita essas tentativas neste desenho. Proteger a borda antes da verificação exigiria outro controle. Os números são didáticos.

Mostre o PreFlow intermediário, a taxa em `spike-arrest.xml` e o `Identifier` em `quota.xml`. Compare proteção contra rajadas com governança de consumo; a seguir, aponte o Conditional Flow `list-orders`.

**Arquivos demonstrados:** `examples/02-intermediate/apiproxy/proxies/default.xml`, `verify-api-key.xml`, `remove-api-key.xml`, `quota.xml` e `assign-list-orders-context.xml`.

**Transição:** Antes do avançado, vamos externalizar uma decisão não sensível e usá-la para escolher entre dois destinos.

## 10. KVM e múltiplos TargetEndpoints

**Tempo estimado:** 2 min 30 s

**Mensagem principal:** Uma KVM pode externalizar configuração; RouteRules ordenadas selecionam TargetEndpoints sem alterar o contrato público.

**Fala sugerida:**

Esta extensão é independente do proxy intermediário principal e mantém o BasePath estável enquanto escolhe um backend fictício.

`get-backend-region` lê a chave não sensível `backend-region` da KVM de environment `orders-routing-config` para `private.lab.backend.region`. A leitura continua somente até uma RaiseFault controlada quando a KVM/entrada falha, está ausente ou contém valor diferente de `primary` e `secondary`. Só então AssignMessage adiciona o contexto técnico. A RouteRule condicional para `secondary` vem primeiro; a regra sem condição para `primary` é o fallback final.

RouteRules são avaliadas de cima para baixo e a primeira compatível vence. A validação anterior impede que uma configuração inválida caia silenciosamente no fallback. A KVM e a entrada não são criadas pelo bundle; sem uma organização e um environment provisionados, este repositório só valida a estrutura. No Apigee atual, KVMs são criptografadas, e `private.` impede exposição do valor em Debug. KVM não é obrigatória nem substitui um cofre de segredos.

Compare os TargetEndpoints `primary.xml` e `secondary.xml`. Mostre a condição opcional do Step de AssignMessage e destaque que nenhum hostname aparece no contrato público.

**Arquivos demonstrados:** `examples/02-intermediate/orders-routing/apiproxy/` e `examples/02-intermediate/README.md`.

**Transição:** Com configuração e roteamento explícitos, avançamos para identidade assinada, reuso e tratamento de falhas.

## 11. Confiança, reuso e falhas explícitas

**Tempo estimado:** 2 min 30 s

**Mensagem principal:** O caminho principal valida o JWT, remove o bearer token e reutiliza apenas o contexto necessário; falhas exigem tratamento específico.

**Fala sugerida:**

No avançado, o foco é a cadeia de confiança e o que enviamos ao backend.

`VerifyJWT` verifica RS256, issuer, audience e os claims exigidos usando o JWKS em `private.orders.jwks`. Depois retiramos `Authorization`. O `FlowCallout` invoca `orders-security-shared`, que propaga apenas o subject validado.

`JWT.failed` pode indicar erro do token ou problema operacional de chave/configuração. Este exemplo simplifica tudo em 401; produção precisa distinguir e monitorar falhas de JWKS. Outras falhas locais do proxy usam 500; falhas de conexão ao target, 502; respostas HTTP 4xx/5xx do backend preservam o status e recebem corpo sanitizado. O Shared Flow precisa estar implantado primeiro no mesmo environment.

Mostre `verify-jwt → remove-authorization → call-shared-security`. Deixe a matriz de falhas nas notas e abra `targets/default.xml` somente se surgir dúvida.

**Arquivos demonstrados:** `examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml`, `verify-jwt.xml`, `targets/default.xml` e `examples/03-advanced/orders-security-shared/sharedflowbundle/`.

**Transição:** Esses artefatos precisam chegar aos environments com dependências e versões controladas.

## 12. Terraform no ciclo de implantação

**Tempo estimado:** 2 min 20 s

**Mensagem principal:** O bundle versionado é um artefato; Terraform pode importar sua revisão e implantá-la por environment sem misturar todas as responsabilidades.

**Fala sugerida:**

Infrastructure as Code entra depois que o bundle já pode ser revisado e validado.

Um pipeline gera um ZIP determinístico, registra hash e versão, usa o recurso oficial `google_apigee_api` para importar a configuração e `google_apigee_api_deployment` para associar a revisão a um environment. Módulos reutilizáveis podem reduzir repetição, desde que entradas e dependências permaneçam explícitas.

Shared Flow, KVM e environment podem criar ordem de implantação. Validação estática vem antes do deploy; importação, Debug e testes de runtime acontecem num environment não produtivo. Estado remoto exige criptografia, mínimo privilégio, locking, recuperação e cuidado com outputs. O laboratório não inclui interfaces privadas, credenciais, backend de estado ou código Terraform executável.

Mostre o Mermaid e abra a documentação apenas se houver pergunta sobre provider. Destaque que os nomes dos dois recursos são públicos e oficialmente documentados; a estratégia de módulos é uma decisão de cada organização.

**Arquivos demonstrados:** `docs/pt-br/deployment-lifecycle.md` e `docs/en/deployment-lifecycle.md`.

**Transição:** Agora podemos condensar essas decisões em guardrails de revisão.

## 13. Guardrails arquiteturais

**Tempo estimado:** 1 min 30 s

**Mensagem principal:** Guardrails tornam as decisões revisáveis, mas não removem a necessidade de contexto, testes e operação.

**Fala sugerida:**

Quatro critérios ajudam a revisar esta integração.

Policies de segurança devem interromper a execução normal ao falhar. Interface pública e conexão com o target têm responsabilidades diferentes. Shared Flow reduz duplicação, mas cria dependência de implantação. E os testes precisam declarar claramente o que conseguem validar.

Esses critérios ajudam a revisar decisões, não substituem threat modeling, capacidade, observabilidade ou uma estratégia de recuperação.

Relacione os critérios com `docs/pt-br/architectural-decisions.md` e os limites com `docs/pt-br/validation.md`.

**Arquivos demonstrados:** `docs/pt-br/architectural-decisions.md` e `docs/pt-br/validation.md`.

**Transição:** Vamos encerrar com uma trilha curta pelos três módulos.

## 14. Demonstração: siga a evolução

**Tempo estimado:** 2 min 30 s

**Mensagem principal:** O roteiro offline relaciona requisições HTTP, policies e resultados condicionais sem simular o Apigee.

**Fala sugerida:**

Vamos percorrer três requisições hipotéticas e localizar nos XMLs as decisões que influenciam o resultado.

No básico, o BasePath e a RouteRule mostram o caminho até um backend fictício. No intermediário, a chave inválida gera uma falha padrão da VerifyAPIKey; com chave válida, SpikeArrest e Quota passam a controlar o tráfego. No avançado, a FaultRule configura JWT.failed como 401 e a falha de conexão ao target como 502. O demonstrador offline lê essas configurações, sem emitir requisições HTTP.

Os resultados dependem do runtime e de recursos externos. Não mostramos HTTP 200 porque o backend é fictício. O código offline não é um emulador Apigee; o validador confirma apenas XML e referências locais.

Deixe abertos `docs/pt-br/http-scenarios.md` e os ProxyEndpoints. Reserve 30 segundos para BasePath e RouteRule, 45 segundos para a chave inválida e os limites condicionais 429, e 40 segundos para JWT.failed → 401 e falha do target → 502. Nos 35 segundos finais, execute os comandos do slide. O cenário de backend 404 sanitizado fica para perguntas. Não execute `curl` para `.invalid`.

**Arquivos demonstrados:** `docs/pt-br/http-scenarios.md`, `scripts/demo_http_scenarios.py`, `scripts/validate_bundles.py`, `examples/01-basic/`, `examples/02-intermediate/` e `examples/03-advanced/`.

**Transição:** Agora podemos resumir o que aprendemos.

## 15. Uma API bem gerenciada torna decisões explícitas.

**Tempo estimado:** 1 min 15 s

**Mensagem principal:** Apigee torna a fronteira programável; qualidade vem da intenção explícita, das dependências visíveis e da validação proporcional ao risco.

**Fala sugerida:**

Uma API bem gerenciada deixa decisões importantes visíveis.

Vimos a fronteira entre interface e destino, a ordem dos flows e como segurança, limites e reuso aparecem em XMLs versionáveis. O laboratório demonstra configuração declarativa, não garante comportamento produtivo.

Em uma implantação real, o próximo passo seria testar sucessos e falhas num ambiente de teste, medir limites e definir operação de chaves, logs e rollout.

**Arquivos demonstrados:** `README.md`, `docs/pt-br/` e `examples/`.

**Transição:** Obrigado! Vamos às perguntas.

## 16. Perguntas?

**Tempo estimado:** fora do tempo de exposição

**Mensagem principal:** O tempo de perguntas começa agora e não faz parte dos 28 minutos de exposição.

**Fala sugerida:**

Obrigado por acompanharem até aqui. Agora eu quero ouvir as perguntas e também os cenários que vocês encontram no dia a dia.

Se for útil para começar, dúvidas frequentes são: quando usar API key ou JWT; onde posicionar uma policy; como versionar Shared Flows; qual a diferença prática entre SpikeArrest e Quota; e o que ainda precisa ser validado dentro do Apigee.

Ao responder, eu separo o que o exemplo comprova do que depende de topologia, licenciamento, volume, threat model ou processos da organização. Se uma resposta exigir mais contexto, prefiro explicitar a hipótese em vez de transformar o laboratório em receita universal.

**Arquivos demonstrados:** `README.md` e o repositório público indicado na tela.

**Transição:** Encerrar agradecendo e convidando o público a continuar a discussão pelo repositório.
