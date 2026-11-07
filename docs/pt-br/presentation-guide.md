# Guia da apresentação — 28 minutos + perguntas

A apresentação executável em [`presentation/`](../../presentation/README.md) tem 16 slides e atende desenvolvedores e arquitetos. A exposição planejada soma 28 minutos; perguntas começam somente no último slide e ficam fora desse tempo.

## Fonte de verdade

O conteúdo visual e as notas ficam em `presentation/slides.md`. O roteiro imprimível [`speaker-script.md`](speaker-script.md) é gerado dessas notas:

```bash
npm run generate:speaker-script --prefix presentation
```

Não edite o roteiro gerado manualmente. `npm run build --prefix presentation` e `npm run validate --prefix presentation` falham quando ele diverge da fonte.

## Progressão e tempo

| # | Slide | Tempo |
|---:|---|---:|
| 1 | Google Cloud Apigee | 1 min |
| 2 | Sobre mim | 45 s |
| 3 | APIs crescem. A complexidade também. | 1 min 30 s |
| 4 | Gateway executa. Management governa. | 1 min 40 s |
| 5 | Uma fronteira entre consumidor e backend | 1 min 50 s |
| 6 | Anatomia de um API Proxy no Apigee | 2 min |
| 7 | Como os XMLs de um proxy Apigee se relacionam | 1 min 50 s |
| 8 | Ciclo de execução dos Flows no Apigee | 2 min 30 s |
| 9 | Autenticar, minimizar e contabilizar | 2 min 20 s |
| 10 | KVM e múltiplos TargetEndpoints | 2 min 30 s |
| 11 | Confiança, reuso e falhas explícitas | 2 min 30 s |
| 12 | Terraform no ciclo de implantação | 2 min 20 s |
| 13 | Guardrails arquiteturais | 1 min 30 s |
| 14 | Demonstração: siga a evolução | 2 min 30 s |
| 15 | Conclusão | 1 min 15 s |
| 16 | Perguntas? | fora da exposição |

## Pontos técnicos que não podem ser abreviados

- No request, o endpoint de proxy precede o target; na response, o TargetEndpoint precede o ProxyEndpoint.
- Dentro de cada pipeline de request ou response, a ordem é sempre `PreFlow → Conditional Flow → PostFlow`.
- A árvore mostrada é a estrutura tradicional de bundle XML do Apigee, não uma estrutura universal de gateways; `manifests/` não é um diretório padrão documentado e XML não é a única experiência de autoria da plataforma.
- O `list-orders` intermediário executa somente uma `AssignMessage` que adiciona `x-api-operation`; não implementa lógica de negócio.
- A API key é a credencial da aplicação. `client_id` contém a consumer key, enquanto os metadados de aplicação ficam em variáveis próprias; autenticação do usuário exige outro mecanismo.
- Com `UseEffectiveCount=true`, SpikeArrest limita rajadas do proxy a `10ps` com janela deslizante regional; Quota limita consumo a 100/min por consumer key em janela móvel.
- `x-api-key` é removido após a validação e não chega ao backend. Como o SpikeArrest está depois de VerifyAPIKey, chaves inválidas são rejeitadas antes de alcançar essa policy; proteção antecipada exige outro desenho.
- A extensão `orders-routing` exige uma KVM existente, valida `backend-region`, usa `private.` e só então executa AssignMessage e RouteRules. A rota condicional vem antes do fallback sem condição.
- O JWT é validado antes da remoção do header `Authorization`; o backend recebe somente o subject necessário ao exemplo.
- O proxy avançado depende de JWKS privado e do Shared Flow implantado antes, no mesmo environment.
- FaultRules pertencem ao endpoint da falha. O laboratório agrupa `JWT.failed` em 401, inclusive erros operacionais que requerem monitoramento separado em produção; proxy 500, conectividade 502 e backend com status preservado e corpo sanitizado.
- Validação estática não substitui importação, deploy, Debug e testes de runtime no Apigee.
- Terraform é apresentado apenas como ciclo: bundle versionado, recursos oficiais de importação/deployment, dependências por environment e cuidados com estado remoto.

## Ritmo sugerido

Os tempos indicam uma **janela para explicação, demonstração e transição**, não uma meta de palavras. Nas notas, **Abertura** e **Explicação principal** formam a fala essencial. **Contexto arquitetural** é material de aprofundamento seletivo; **Demonstração** orienta a navegação e não precisa ser lida integralmente.

- Slide 2: apresentação pessoal breve, em 45 segundos, sem ler toda a biografia.
- Slide 8: começar pela ordem entre endpoints; depois explicar PreFlow, Conditional Flow e PostFlow.
- Slide 9: distinguir rajadas de consumo e explicar a consequência da verificação da chave antes do SpikeArrest.
- Slide 10: seguir KVM → validação → AssignMessage → RouteRules e enfatizar que a plataforma não é executada localmente.
- Slide 11: priorizar a cadeia JWT → remoção do bearer → FlowCallout; falhas detalhadas ficam nas notas.
- Slide 12: manter Terraform conceitual; não abrir um treinamento de HCL.
- Slide 14: aproximadamente 30 s básico, 45 s intermediário, 40 s avançado e 35 s de demonstração offline e validação. O [guia HTTP](http-scenarios.md) separa status configurado de resultado observado.

## Ensaio e Speaker View

Inicie a apresentação e pressione `S`. Cada slide possui notas próprias com mensagem, abertura, explicação, contexto, demonstração, arquivos e transição. O navegador deve permitir pop-ups para abrir o Speaker View. As notas ficam em elementos próprios do Reveal.js e não aparecem na tela projetada.

Use o slide 14 para uma **demonstração offline**, sem afirmar que houve uma chamada real ao gateway. Antes da sessão, deixe abertos o [guia de cenários HTTP](http-scenarios.md), o ProxyEndpoint básico, o PreFlow intermediário e as FaultRules do avançado. No terminal, execute `python scripts/demo_http_scenarios.py` e depois `python scripts/validate_bundles.py`. O primeiro lê XMLs para apresentar resultados **condicionais**; não envia HTTP, não emula Apigee e não prova comportamento do runtime. Não execute `curl` para `.invalid` nem gere tráfego de carga.

## Referências oficiais

- [Execução dos Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/what-are-flows)
- [Configuração de API Proxy](https://cloud.google.com/apigee/docs/api-platform/reference/api-proxy-configuration-reference)
- [Shared Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/shared-flows)
- [Tratamento de falhas](https://cloud.google.com/apigee/docs/api-platform/fundamentals/fault-handling)
- [SpikeArrest](https://cloud.google.com/apigee/docs/api-platform/reference/policies/spike-arrest-policy)
- [Quota](https://cloud.google.com/apigee/docs/api-platform/reference/policies/quota-policy)
- [KeyValueMapOperations](https://cloud.google.com/apigee/docs/api-platform/reference/policies/key-value-map-operations-policy)
- [Rotas](https://cloud.google.com/apigee/docs/api-platform/fundamentals/understanding-routes)
- [Terraform `google_apigee_api`](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/apigee_api)
