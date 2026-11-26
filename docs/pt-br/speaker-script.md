# Roteiro de fala — Google Cloud Apigee

> Documento gerado a partir das notas de `presentation/slides.md`. Não edite este arquivo manualmente; execute `npm run generate:speaker-script --prefix presentation`.

A exposição planejada dura 28 minutos. O slide de perguntas fica fora desse tempo.

## 1. Google Cloud Apigee

**Tempo estimado:** 1 min

**Mensagem principal:** Revisitar fundamentos, aprofundar o comportamento das policies e avaliar decisões de arquitetura que aparecem no cotidiano de quem trabalha com Apigee.

**Fala sugerida:**

Olá! Como vocês já trabalham com Apigee, não vamos começar do zero. Vamos usar uma API de pedidos para revisar o modelo mental e investigar decisões que parecem simples até uma falha acontecer.

Ao final, quero que vocês consigam explicar a ordem dos flows, justificar a posição e o escopo dos controles de tráfego, e identificar riscos de confiança, reuso e tratamento de falhas. Os exemplos são independentes e aumentam em complexidade conceitual; não são versões cumulativas nem uma solução pronta para produção.

A sessão é uma conversa técnica baseada em bundles XML versionados. Não há provisionamento GCP nem execução de chamadas no runtime Apigee.

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

**Tempo estimado:** 45 s

**Mensagem principal:** O crescimento das APIs transforma segurança, capacidade e evolução em responsabilidades arquiteturais compartilhadas.

**Fala sugerida:**

Vocês provavelmente reconhecem esses problemas: a API de pedidos ganha consumidores, tráfego e exigências de segurança. Qual desses desafios já aparece nas nossas revisões de código?

O mesmo contrato precisa continuar estável enquanto crescem os controles de acesso, consumo e consistência. O objetivo é revisar as escolhas que fazemos na fronteira, não transferir a regra de negócio para ela.

Uma fronteira administrada concentra preocupações transversais sem transformar o gateway no dono da regra de negócio. Isso melhora governança e desacoplamento, mas também exige clareza sobre o que pertence ao runtime e o que pertence ao ciclo de vida da API.

**Arquivos demonstrados:** `README.md`, seção “API Gateway e API Management”.

**Transição:** Essa distinção nos leva diretamente à diferença entre executar uma chamada e governar uma API ao longo do tempo.

## 4. Gateway executa. Management governa.

**Tempo estimado:** 40 s

**Mensagem principal:** O gateway é uma parte do API Management; não devemos atribuir ao componente de execução toda a capacidade da plataforma.

**Fala sugerida:**

Relembremos uma distinção que faz diferença nas responsabilidades dos times.

O gateway recebe, aplica policies e roteia. API Management inclui também produtos, publicação, onboarding, analytics e ciclo de vida. Ter um proxy não significa que a API já está governada.

Essa separação evita uma expectativa perigosa: instalar um gateway não cria governança automaticamente. Produtos, responsabilidades, observabilidade e processos de mudança continuam sendo decisões organizacionais.

**Arquivos demonstrados:** `README.md` e `README.en.md`, seção de gateway versus management.

**Transição:** Com o escopo alinhado, podemos enxergar onde o proxy entra entre o consumidor e o backend.

## 5. Uma fronteira entre consumidor e backend

**Tempo estimado:** 45 s

**Mensagem principal:** O API Proxy cria uma fronteira programável sem substituir o backend nem esconder as dependências do ambiente.

**Fala sugerida:**

Vamos acompanhar uma chamada de pedidos da esquerda para a direita.

Sigam a requisição: hostname associado ao environment group, ProxyEndpoint, RouteRule, TargetEndpoint, backend. O contrato público e a conexão de saída têm responsabilidades distintas.

Separar a interface pública da conexão de destino permite evoluir URL, TLS ou configuração do backend com menor impacto sobre consumidores. Isso é desacoplamento de contrato, não ausência de dependências.

Use o diagrama projetado; o destino .invalid é fictício. Deixe os arquivos para consulta posterior.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** Agora vamos abrir essa fronteira e localizar as peças que formam um bundle implantável.

## 6. Anatomia de um API Proxy no Apigee

**Tempo estimado:** 45 s

**Mensagem principal:** Esta árvore é um exemplo de bundle XML tradicional do Apigee, não uma estrutura universal de API Gateways.

**Fala sugerida:**

No repositório, essa arquitetura aparece como uma estrutura pequena e deliberadamente explícita.

Revisão rápida: descritor identifica o proxy, proxies/ guarda a interface, targets/ guarda o destino, policies/ e resources/ aparecem quando necessários. As listas do descritor são metadados opcionais. A árvore é a de um bundle XML tradicional.

`manifests/` não é um diretório padrão da estrutura de bundle documentada pelo Apigee; por isso não adicionamos um diretório artificial. O laboratório escolhe arquivos XML versionados, mas proxies também podem ser criados e editados pela UI ou APIs da plataforma. A estrutura mostrada não deve ser generalizada para outros gateways.

Aponte a árvore no slide; não abra arquivos nesta etapa.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/orders-basic.xml`, `examples/01-basic/apiproxy/proxies/default.xml` e `examples/01-basic/apiproxy/targets/default.xml`.

**Transição:** A estrutura fica mais clara quando seguimos uma referência concreta de um XML ao outro.

## 7. Como os XMLs de um proxy Apigee se relacionam

**Tempo estimado:** 50 s

**Mensagem principal:** A configuração é declarativa, mas possui dependências referenciais que o repositório consegue validar estaticamente.

**Fala sugerida:**

Neste trecho curto existem duas decisões diferentes: como o consumidor chama a API e para onde o proxy encaminha a mensagem.

`BasePath` participa do contrato público. A RouteRule aponta para o TargetEndpoint chamado `default`; esse valor precisa corresponder ao atributo `name` no XML do target. É essa indireção que mantém a URL do backend fora da interface pública.

Referências por nome ajudam no desacoplamento, mas falhas de digitação só aparecem cedo se forem validadas. O script local verifica essa relação, além de Steps e FlowCallouts, sem alegar equivalência ao schema completo da plataforma.

Use o XML já projetado: o nome referenciado em RouteRule deve corresponder ao TargetEndpoint. A comparação completa fica disponível no link.

**Arquivos demonstrados:** `examples/01-basic/apiproxy/proxies/default.xml`, `examples/01-basic/apiproxy/targets/default.xml` e `scripts/validate_bundles.py`.

**Transição:** Depois de saber como os arquivos se ligam, precisamos entender quando cada trecho executa.

## 8. Ciclo de execução dos Flows no Apigee

**Tempo estimado:** 1 min 30 s

**Mensagem principal:** A resposta percorre os endpoints em ordem inversa, mas a execução interna continua PreFlow, primeiro Conditional Flow compatível e PostFlow.

**Fala sugerida:**

Na volta do backend, a ordem PreFlow, Conditional Flow e PostFlow também se inverte? Pensem por alguns segundos antes de seguir as setas.

No request, o ProxyEndpoint executa antes do TargetEndpoint. No response, a ordem entre eles se inverte. Dentro de cada pipeline, em qualquer sentido, a sequência continua PreFlow, primeiro Conditional Flow compatível e PostFlow. Cada flow executa seus Steps na ordem declarada.

A posição determina quais variáveis estão disponíveis. Não devemos inverter a ordem interna na resposta; e uma falha que interrompe a execução normal segue para tratamento de erros, não para os próximos Steps.

Resposta: não. Só a ordem entre endpoints se inverte. Use o diagrama e destaque a primeira condição compatível; o exemplo list-orders acrescenta contexto técnico apenas ao GET /.

**Arquivos demonstrados:** `docs/pt-br/architecture.md` e `examples/02-intermediate/apiproxy/proxies/default.xml`.

**Transição:** Com o modelo mental alinhado, vamos questionar decisões do pipeline intermediário.

## 9. Autenticar, minimizar e contabilizar

**Tempo estimado:** 3 min 30 s

**Mensagem principal:** SpikeArrest limita rajadas; Quota controla consumo por credencial. A ordem das policies define quais chamadas chegam a cada controle.

**Fala sugerida:**

Uma chave inválida chega ao SpikeArrest neste pipeline? E duas chaves da mesma aplicação compartilham a mesma quota? Façam uma previsão antes de olharmos o XML.

`VerifyAPIKey` valida `x-api-key` e disponibiliza variáveis da chave. Removemos o header antes do roteamento. Depois, `SpikeArrest` limita rajadas do proxy a `10ps` em janela deslizante regional; `Quota` permite 100 chamadas por minuto para cada consumer key, em janela móvel. Por último, adicionamos correlação.

Aqui, `client_id` contém a própria chave, não o identificador lógico da aplicação: duas chaves têm contadores distintos. Como a verificação vem antes do SpikeArrest, chaves inválidas falham antes de alcançar essa policy. Portanto, ela não limita essas tentativas neste desenho. Proteger a borda antes da verificação exigiria outro controle. Os números são didáticos.

A resposta é não nos dois casos. Mostre o PreFlow e o Identifier da Quota. Compare a ordem atual com um controle de borda anterior à autenticação, sem propor uma ordem universal: proteger capacidade cedo e contabilizar somente credenciais válidas são objetivos distintos. Uma rotação de chave cria outro contador neste exemplo. Reserve uma pausa curta para a audiência justificar a escolha.

**Arquivos demonstrados:** `examples/02-intermediate/apiproxy/proxies/default.xml`, `verify-api-key.xml`, `remove-api-key.xml`, `quota.xml` e `assign-list-orders-context.xml`.

**Transição:** Além de controlar quem chama e quanto consome, precisamos decidir para onde encaminhar uma chamada sem alterar o contrato público.

## 10. KVM e múltiplos TargetEndpoints

**Tempo estimado:** 3 min 30 s

**Mensagem principal:** Uma KVM pode externalizar configuração; RouteRules ordenadas selecionam TargetEndpoints sem alterar o contrato público.

**Fala sugerida:**

Se a configuração da KVM contiver um valor inesperado, queremos encaminhar ao backend padrão ou sinalizar uma falha? Neste cenário, a extensão orders-routing demonstra a segunda escolha; é um bundle independente.

`get-backend-region` lê a chave não sensível `backend-region` da KVM de environment `orders-routing-config` para `private.lab.backend.region`. A leitura continua somente até uma RaiseFault controlada quando a KVM/entrada falha, está ausente ou contém valor diferente de `primary` e `secondary`. Só então AssignMessage adiciona o contexto técnico. A RouteRule condicional para `secondary` vem primeiro; a regra sem condição para `primary` é o fallback final.

RouteRules são avaliadas de cima para baixo e a primeira compatível vence. A validação anterior impede que uma configuração inválida caia silenciosamente no fallback. A KVM e a entrada não são criadas pelo bundle; sem uma organização e um environment provisionados, este repositório só valida a estrutura. No Apigee atual, KVMs são criptografadas, e `private.` impede exposição do valor em Debug. KVM não é obrigatória nem substitui um cofre de segredos.

Peça que prevejam o resultado de primary, secondary e um valor inválido. Mostre as RouteRules: secondary escolhe o destino alternativo, primary usa o fallback e valor inválido interrompe antes do roteamento. Discuta quem governa alterações da KVM e por que fallback não deve mascarar configuração incorreta.

**Arquivos demonstrados:** `examples/02-intermediate/orders-routing/apiproxy/` e `examples/02-intermediate/README.md`.

**Transição:** Com configuração e roteamento explícitos, avançamos para identidade assinada, reuso e tratamento de falhas.

## 11. Confiança, reuso e falhas explícitas

**Tempo estimado:** 4 min 30 s

**Mensagem principal:** O caminho principal valida o JWT, remove o bearer token e reutiliza apenas o contexto necessário; falhas exigem tratamento específico.

**Fala sugerida:**

Se o gateway valida o token e envia somente o subject, o que impede uma chamada direta ao backend de forjar esse header? Esse é o problema de confiança que precisamos resolver além da policy.

`VerifyJWT` verifica RS256, issuer, audience e os claims exigidos usando o JWKS em `private.orders.jwks`. Depois retiramos `Authorization`. O `FlowCallout` invoca `orders-security-shared`, que propaga apenas o subject validado.

Validar assinatura, issuer e audience não substitui autorização por operação ou recurso. O Shared Flow usa Set em AssignMessage para substituir qualquer valor recebido em `x-authenticated-subject` pelo subject validado no caminho normal após VerifyJWT. Isso não impede acesso direto ao backend: restrições de acesso e autenticação entre serviços adequadas ao threat model são necessárias para confiar na origem e integridade do contexto, mas não estão implementadas no laboratório. Shared Flow reduz duplicação, mas amplia o raio de impacto de uma mudança e exige gestão de compatibilidade e implantação prévia no mesmo environment. JWT.failed agrupa falhas do token e falhas operacionais de chave/configuração em 401 no exemplo; produção deve distingui-las e monitorá-las. Outras falhas locais usam 500; falhas de conexão sem resposta HTTP usam 502; respostas HTTP 4xx/5xx preservam status e recebem corpo sanitizado. Nenhum desses controles adicionais de produção é implantado pelo laboratório.

Mostre a cadeia verify-jwt, remove-authorization e call-shared-security. Pergunte como diferenciar um token inválido de uma indisponibilidade operacional de JWKS e uma falha de transporte de um 404 retornado pelo backend. Aponte a separação entre FaultRules do proxy e do target; não trate o 401 didático como contrato universal.

**Arquivos demonstrados:** `examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml`, `verify-jwt.xml`, `targets/default.xml` e `examples/03-advanced/orders-security-shared/sharedflowbundle/`.

**Transição:** Esses artefatos precisam chegar aos environments com dependências e versões controladas.

## 12. Terraform no ciclo de implantação

**Tempo estimado:** 2 min

**Mensagem principal:** O bundle versionado é um artefato; Terraform pode importar sua revisão e implantá-la por environment sem misturar todas as responsabilidades.

**Fala sugerida:**

Uma alteração de Shared Flow pode afetar vários proxies. Como promover revisões e testar dependências sem transformar o deploy em tentativa e erro?

Um pipeline gera um ZIP determinístico, registra hash e versão, usa o recurso oficial `google_apigee_api` para importar a configuração e `google_apigee_api_deployment` para associar a revisão a um environment. Depois, aguarda com timeout até o status da revisão ficar `READY` antes dos testes. Módulos reutilizáveis podem reduzir repetição, desde que entradas e dependências permaneçam explícitas.

Shared Flow, KVM e environment podem criar ordem de implantação. Como o deployment é eventualmente consistente, o readiness check consulta a revisão específica, avança em `READY`, falha em `ERROR` e termina ao atingir o limite; só então começam Debug e testes de runtime num environment não produtivo. Estado remoto exige criptografia, mínimo privilégio, locking, recuperação e cuidado com outputs. O laboratório não inclui interfaces privadas, credenciais, backend de estado ou código Terraform executável.

Use o diagrama para destacar revisão, dependências, readiness e testes; não abra HCL. O laboratório não cria recursos nem executa Terraform.

**Arquivos demonstrados:** `docs/pt-br/deployment-lifecycle.md` e `docs/en/deployment-lifecycle.md`.

**Transição:** Agora podemos condensar essas decisões em guardrails de revisão.

## 13. Guardrails arquiteturais

**Tempo estimado:** 1 min 30 s

**Mensagem principal:** Guardrails tornam as decisões revisáveis, mas não removem a necessidade de contexto, testes e operação.

**Fala sugerida:**

Transformem os quatro critérios em perguntas de revisão de PR: onde a falha interrompe o fluxo, quem possui o contrato, quem depende do reuso e qual evidência o teste fornece?

Policies de segurança devem interromper a execução normal ao falhar. Interface pública e conexão com o target têm responsabilidades diferentes. Shared Flow reduz duplicação, mas cria dependência de implantação. E os testes precisam declarar claramente o que conseguem validar.

Esses critérios ajudam a revisar decisões, não substituem threat modeling, capacidade, observabilidade ou uma estratégia de recuperação.

Relacione os critérios com `docs/pt-br/architectural-decisions.md` e os limites com `docs/pt-br/validation.md`.

**Arquivos demonstrados:** `docs/pt-br/architectural-decisions.md` e `docs/pt-br/validation.md`.

**Transição:** Vamos encerrar com uma trilha curta pelos três módulos.

## 14. Demonstração: siga a evolução

**Tempo estimado:** 4 min

**Mensagem principal:** O roteiro offline relaciona requisições HTTP, policies e resultados condicionais sem simular o Apigee.

**Fala sugerida:**

Vamos consolidar com três previsões: qual destino é selecionado, qual controle não é alcançado e qual categoria de falha deve ser tratada.

No básico, o BasePath e a RouteRule mostram o caminho até um backend fictício. No intermediário, a chave inválida gera uma falha padrão da VerifyAPIKey; com chave válida, SpikeArrest e Quota passam a controlar o tráfego. No avançado, a FaultRule configura JWT.failed como 401 e a falha de conexão ao target como 502. O demonstrador offline lê essas configurações, sem emitir requisições HTTP.

Os resultados dependem do runtime e de recursos externos. Não mostramos HTTP 200 porque o backend é fictício. O código offline não é um emulador Apigee; o validador confirma apenas XML e referências locais.

Deixe abertos docs/pt-br/http-scenarios.md e os ProxyEndpoints. Use 30 segundos para BasePath e RouteRule; 75 segundos para a chave inválida, quota por chave e 429 condicionais; 90 segundos para JWT.failed → 401, target sem resposta → 502 e backend 404 sanitizado. Use os 45 segundos finais para os dois comandos. Peça previsões antes de revelar o comportamento configurado. Se o terminal atrasar, use o guia de cenários já aberto. Não execute curl para .invalid.

**Arquivos demonstrados:** `docs/pt-br/http-scenarios.md`, `scripts/demo_http_scenarios.py`, `scripts/validate_bundles.py`, `examples/01-basic/`, `examples/02-intermediate/` e `examples/03-advanced/`.

**Transição:** Agora podemos resumir o que aprendemos.

## 15. Uma API bem gerenciada torna decisões explícitas.

**Tempo estimado:** 2 min

**Mensagem principal:** Apigee torna a fronteira programável; qualidade vem da intenção explícita, das dependências visíveis e da validação proporcional ao risco.

**Fala sugerida:**

Para concluir, pensem em um proxy que vocês mantêm hoje: qual decisão de pipeline, segurança ou tratamento de falha merece ser revisitada?

Retomem os três objetivos: explicar a ordem dos flows; justificar a posição e o escopo dos controles; identificar riscos de confiança, reuso e falhas. Cada um deve conseguir apontar uma decisão concreta no próprio contexto. Os exemplos são configuração declarativa e evidência estática, não garantia de comportamento produtivo.

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
