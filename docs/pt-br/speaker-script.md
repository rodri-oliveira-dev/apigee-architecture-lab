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

**Tempo estimado:** 1 min

**Mensagem principal:** Mais de 20 anos de experiência em software e sistemas distribuídos orientam minha leitura prática do Apigee e da governança de APIs.

**Fala sugerida:**

Sou Rodrigo de Oliveira, arquiteto de software, com mais de 20 anos de experiência em sistemas corporativos.

Minha trajetória passa por .NET, backend, integrações e sistemas distribuídos. Hoje trabalho com desenho de soluções, revisão técnica e padrões de engenharia. É desse ponto de vista que proponho olhar para o Apigee: uma fronteira entre sistemas, não apenas um produto.

Fora do trabalho, gosto de filosofia, leitura, jogos retrô e de estar com minha família e meus gatos.

**Arquivos demonstrados:** Nenhum; foto, descrição profissional e interesses foram adaptados do meu portfólio público, disponível no próprio slide.

**Transição:** Agora, por que essa fronteira precisa ser administrada?

## 3. APIs crescem. A complexidade também.

**Tempo estimado:** 1 min 50 s

**Mensagem principal:** O crescimento das APIs transforma segurança, capacidade e evolução em responsabilidades arquiteturais compartilhadas.

**Fala sugerida:**

Pensem em uma API de pedidos que começou com um consumidor e um backend. O caminho parecia simples até surgirem outros canais, parceiros e requisitos de segurança.

Agora precisamos identificar a aplicação, talvez o usuário, proteger o backend contra rajadas, controlar consumo e manter um contrato estável enquanto o sistema interno muda. Se cada backend resolver isso de um jeito, criamos duplicação e respostas inconsistentes.

Uma fronteira administrada concentra preocupações transversais sem transformar o gateway no dono da regra de negócio. Isso melhora governança e desacoplamento, mas também exige clareza sobre o que pertence ao runtime e o que pertence ao ciclo de vida da API.

**Arquivos demonstrados:** `README.md`, seção “API Gateway e API Management”.

**Transição:** Essa distinção nos leva diretamente à diferença entre executar uma chamada e governar uma API ao longo do tempo.

## 4. Gateway executa. Management governa.

**Tempo estimado:** 2 min

**Mensagem principal:** O gateway é uma parte do API Management; não devemos atribuir ao componente de execução toda a capacidade da plataforma.

**Fala sugerida:**

Aqui vale separar dois termos que muitas vezes aparecem como sinônimos, mas representam escopos diferentes.

O gateway está no caminho da chamada: recebe a requisição, aplica as policies configuradas e decide o roteamento. API Management é mais amplo e inclui produtos de API, publicação, onboarding de aplicações, analytics, governança e ciclo de vida. O Apigee reúne essas capacidades, mas os XMLs deste repositório demonstram principalmente o runtime.

Essa separação evita uma expectativa perigosa: instalar um gateway não cria governança automaticamente. Produtos, responsabilidades, observabilidade e processos de mudança continuam sendo decisões organizacionais.

**Arquivos demonstrados:** `README.md` e `README.en.md`, seção de gateway versus management.

**Transição:** Com o escopo alinhado, podemos enxergar onde o proxy entra entre o consumidor e o backend.

## 5. Uma fronteira entre consumidor e backend

**Tempo estimado:** 2 min 20 s

**Mensagem principal:** O API Proxy cria uma fronteira programável sem substituir o backend nem esconder as dependências do ambiente.

**Fala sugerida:**

Vamos acompanhar uma chamada de pedidos da esquerda para a direita.

O hostname associado ao environment group recebe a conexão. O ProxyEndpoint representa a interface voltada ao consumidor e executa seus flows. A RouteRule seleciona um TargetEndpoint, que encapsula a conexão com o backend. Policies entram nesses pipelines como Steps configurados.

Separar a interface pública da conexão de destino permite evoluir URL, TLS ou configuração do backend com menor impacto sobre consumidores. Isso é desacoplamento de contrato, não ausência de dependências.

Abra `docs/pt-br/architecture.md` e mostre o primeiro Mermaid. Aponte que `orders-backend.example.invalid` é intencionalmente fictício; não existe integração funcional nem necessidade de autenticação GCP para ver os slides.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** Agora vamos abrir essa fronteira e localizar as peças que formam um bundle implantável.

## 6. Anatomia do API Proxy

**Tempo estimado:** 2 min 10 s

**Mensagem principal:** Diretórios, descritores e nomes formam o artefato declarativo que o Apigee importa e implanta.

**Fala sugerida:**

No repositório, essa arquitetura aparece como uma estrutura pequena e deliberadamente explícita.

O descritor raiz identifica o proxy e declara seus endpoints e policies. `proxies/default.xml` define a interface e o roteamento; `targets/default.xml` define o destino. Policies ficam em arquivos próprios e só executam quando um Step as referencia.

A separação favorece revisão e manutenção: conseguimos discutir contrato, destino e controles individualmente. Ao mesmo tempo, os nomes viram ligações formais entre arquivos e precisam permanecer coerentes.

Abra `examples/01-basic/apiproxy/`. Mostre que o módulo básico não possui diretório de policies: ele expõe o esqueleto mínimo antes de acrescentarmos comportamento.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/orders-basic.xml`, `examples/01-basic/apiproxy/proxies/default.xml` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** A estrutura fica mais clara quando seguimos uma referência concreta de um XML ao outro.

## 7. XMLs se conectam por nome

**Tempo estimado:** 2 min 10 s

**Mensagem principal:** A configuração é declarativa, mas possui dependências referenciais que o repositório consegue validar estaticamente.

**Fala sugerida:**

Neste trecho curto existem duas decisões diferentes: como o consumidor chama a API e para onde o proxy encaminha a mensagem.

`BasePath` participa do contrato público. A RouteRule aponta para o TargetEndpoint chamado `default`; esse valor precisa corresponder ao atributo `name` no XML do target. É essa indireção que mantém a URL do backend fora da interface pública.

Referências por nome ajudam no desacoplamento, mas falhas de digitação só aparecem cedo se forem validadas. O script local verifica essa relação, além de Steps e FlowCallouts, sem alegar equivalência ao schema completo da plataforma.

O trecho na tela é extraído de `examples/01-basic/apiproxy/proxies/default.xml` durante o build. Abra também o TargetEndpoint e compare `name="default"`.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/proxies/default.xml`, `examples/01-basic/apiproxy/targets/default.xml` e `scripts/validate_bundles.py`.

**Transição:** Depois de saber como os arquivos se ligam, precisamos entender quando cada trecho executa.

## 8. O ciclo de execução dos Flows

**Tempo estimado:** 3 min

**Mensagem principal:** A resposta percorre os endpoints em ordem inversa, mas a execução interna continua PreFlow, primeiro Conditional Flow compatível e PostFlow.

**Fala sugerida:**

Leia o diagrama em duas camadas: entre os endpoints e dentro de cada endpoint.

No request, o ProxyEndpoint executa antes do TargetEndpoint. No response, a ordem entre eles se inverte. Dentro de cada pipeline, em qualquer sentido, a sequência continua PreFlow, primeiro Conditional Flow compatível e PostFlow. Cada flow executa seus Steps na ordem declarada.

A posição determina quais variáveis estão disponíveis. Não devemos inverter a ordem interna na resposta; e uma falha que interrompe a execução normal segue para tratamento de erros, não para os próximos Steps.

Siga as setas em `docs/pt-br/architecture.md`. Depois mostre `list-orders` no proxy intermediário: o Conditional Flow de `GET /` apenas adiciona `x-api-operation`, sem lógica de negócio.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/02-intermediate/apiproxy/proxies/default.xml`.

**Transição:** Com isso em mente, vamos analisar a sequência das policies.

## 9. Autenticar, minimizar e contabilizar

**Tempo estimado:** 3 min

**Mensagem principal:** SpikeArrest limita rajadas; Quota controla consumo por credencial. A ordem das policies define quais chamadas chegam a cada controle.

**Fala sugerida:**

SpikeArrest e Quota resolvem problemas diferentes. E a ordem das policies importa.

`VerifyAPIKey` valida `x-api-key` e disponibiliza variáveis da chave. Removemos o header antes do roteamento. Depois, `SpikeArrest` limita rajadas do proxy a `10ps` em janela deslizante regional; `Quota` permite 100 chamadas por minuto para cada consumer key, em janela móvel. Por último, adicionamos correlação.

Aqui, `client_id` contém a própria chave, não o identificador lógico da aplicação: duas chaves têm contadores distintos. Como a verificação vem antes do SpikeArrest, chaves inválidas falham antes de alcançar essa policy. Portanto, ela não limita essas tentativas neste desenho. Proteger a borda antes da verificação exigiria outro controle. Os números são didáticos.

Mostre o PreFlow intermediário, a taxa em `spike-arrest.xml` e o `Identifier` em `quota.xml`. Compare proteção contra rajadas com governança de consumo; a seguir, aponte o Conditional Flow `list-orders`.

**Arquivos demonstrados:** `examples/02-intermediate/apiproxy/proxies/default.xml`, `verify-api-key.xml`, `remove-api-key.xml`, `quota.xml` e `assign-list-orders-context.xml`.

**Transição:** No avançado, acrescentamos identidade assinada e reuso.

## 10. Confiança, reuso e falhas explícitas

**Tempo estimado:** 3 min

**Mensagem principal:** O caminho principal valida o JWT, remove o bearer token e reutiliza apenas o contexto necessário; falhas exigem tratamento específico.

**Fala sugerida:**

No avançado, o foco é a cadeia de confiança e o que enviamos ao backend.

`VerifyJWT` verifica RS256, issuer, audience e os claims exigidos usando o JWKS em `private.orders.jwks`. Depois retiramos `Authorization`. O `FlowCallout` invoca `orders-security-shared`, que propaga apenas o subject validado.

`JWT.failed` pode indicar erro do token ou problema operacional de chave/configuração. Este exemplo simplifica tudo em 401; produção precisa distinguir e monitorar falhas de JWKS. Outras falhas locais do proxy usam 500; falhas de conexão ao target, 502; respostas HTTP 4xx/5xx do backend preservam o status e recebem corpo sanitizado. O Shared Flow precisa estar implantado primeiro no mesmo environment.

Mostre `verify-jwt → remove-authorization → call-shared-security`. Deixe a matriz de falhas nas notas e abra `targets/default.xml` somente se surgir dúvida.

**Arquivos demonstrados:** `examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml`, `verify-jwt.xml`, `targets/default.xml` e `examples/03-advanced/orders-security-shared/sharedflowbundle/`.

**Transição:** Essas escolhas nos levam aos guardrails de arquitetura.

## 11. Guardrails arquiteturais

**Tempo estimado:** 2 min

**Mensagem principal:** Guardrails tornam as decisões revisáveis, mas não removem a necessidade de contexto, testes e operação.

**Fala sugerida:**

Quatro critérios ajudam a revisar esta integração.

Policies de segurança devem interromper a execução normal ao falhar. Interface pública e conexão com o target têm responsabilidades diferentes. Shared Flow reduz duplicação, mas cria dependência de implantação. E os testes precisam declarar claramente o que conseguem validar.

Esses critérios ajudam a revisar decisões, não substituem threat modeling, capacidade, observabilidade ou uma estratégia de recuperação.

Relacione os critérios com `docs/pt-br/architectural-decisions.md` e os limites com `docs/pt-br/validation.md`.

**Arquivos demonstrados:** `docs/pt-br/architectural-decisions.md` e `docs/pt-br/validation.md`.

**Transição:** Vamos encerrar com uma trilha curta pelos três módulos.

## 12. Demonstração: siga a evolução

**Tempo estimado:** 3 min

**Mensagem principal:** O repositório foi organizado para que a evolução arquitetural possa ser comparada e validada sem depender de um ambiente Apigee.

**Fala sugerida:**

A demonstração acompanha a evolução do código, sem procurar arquivos durante a fala.

No básico, BasePath e RouteRule. No intermediário, a ordem das policies, a Quota por chave e o Conditional Flow. No avançado, VerifyJWT e FlowCallout. Encerramos com os validadores estáticos mostrados no slide.

Passar na validação comprova estrutura e referências locais; não comprova schema completo, credenciais, conectividade, produtos ou runtime Apigee.

Deixe as telas preparadas. Reserve cerca de 35 s ao básico, 55 s ao intermediário, 50 s ao avançado e 40 s aos comandos, com transições.

**Arquivos demonstrados:** `examples/01-basic/`, `examples/02-intermediate/`, `examples/03-advanced/`, `scripts/validate_bundles.py` e `tests/`.

**Transição:** Agora podemos resumir o que aprendemos.

## 13. Uma API bem gerenciada torna decisões explícitas.

**Tempo estimado:** 1 min 30 s

**Mensagem principal:** Apigee torna a fronteira programável; qualidade vem da intenção explícita, das dependências visíveis e da validação proporcional ao risco.

**Fala sugerida:**

Uma API bem gerenciada deixa decisões importantes visíveis.

Vimos a fronteira entre interface e destino, a ordem dos flows e como segurança, limites e reuso aparecem em XMLs versionáveis. O laboratório demonstra configuração declarativa, não garante comportamento produtivo.

Em uma implantação real, o próximo passo seria testar sucessos e falhas num ambiente de teste, medir limites e definir operação de chaves, logs e rollout.

**Arquivos demonstrados:** `README.md`, `docs/pt-br/` e `examples/`.

**Transição:** Obrigado! Vamos às perguntas.

## 14. Perguntas?

**Tempo estimado:** fora do tempo de exposição

**Mensagem principal:** O tempo de perguntas começa agora e não faz parte dos 28 minutos de exposição.

**Fala sugerida:**

Obrigado por acompanharem até aqui. Agora eu quero ouvir as perguntas e também os cenários que vocês encontram no dia a dia.

Se for útil para começar, dúvidas frequentes são: quando usar API key ou JWT; onde posicionar uma policy; como versionar Shared Flows; qual a diferença prática entre SpikeArrest e Quota; e o que ainda precisa ser validado dentro do Apigee.

Ao responder, eu separo o que o exemplo comprova do que depende de topologia, licenciamento, volume, threat model ou processos da organização. Se uma resposta exigir mais contexto, prefiro explicitar a hipótese em vez de transformar o laboratório em receita universal.

**Arquivos demonstrados:** `README.md` e o repositório público indicado na tela.

**Transição:** Encerrar agradecendo e convidando o público a continuar a discussão pelo repositório.
