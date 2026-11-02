# Cenários HTTP ilustrativos — Apigee Architecture Lab

> **Não são testes reais de execução.** O projeto não provisiona Apigee, API products, apps, credenciais, JWKS ou backend. Os exemplos usam o domínio reservado `api.example.invalid`: comandos `curl` abaixo são apenas modelos para discussão, **não devem ser executados contra um serviço real**. As respostas representam o que a configuração pretende fazer *sob pré-condições explícitas*, não resultados capturados.

## Matriz de entrada, policy e saída

| Cenário | Entrada HTTP | Controle | Resultado ilustrativo | XML |
|---|---|---|---|---|
| Básico | `GET /lab/v1/orders-basic/` | BasePath → RouteRule → TargetEndpoint | Encaminha ao target fictício; **não há 200 demonstrado** | [ProxyEndpoint](../../examples/01-basic/apiproxy/proxies/default.xml) |
| Chave inválida | `GET /lab/v1/orders-intermediate/` com `x-api-key` inválida | VerifyAPIKey | `401` padrão para `InvalidApiKey`; corpo do runtime não customizado | [VerifyAPIKey](../../examples/02-intermediate/apiproxy/policies/verify-api-key.xml) |
| Chave válida | Mesmo caminho com consumer key válida | VerifyAPIKey → remoção da chave → SpikeArrest → Quota | Header `x-api-key` removido; limites `10ps` por proxy e `100/min` por chave | [PreFlow](../../examples/02-intermediate/apiproxy/proxies/default.xml) |
| Rajada | Chave válida, excesso no SpikeArrest | SpikeArrest | `429` em `SpikeArrestViolation`, **se** esse controle for excedido | [SpikeArrest](../../examples/02-intermediate/apiproxy/policies/spike-arrest.xml) |
| Consumo | Chave válida, quota esgotada | Quota | `429` em `QuotaViolation`, **se** a requisição alcançar essa policy | [Quota](../../examples/02-intermediate/apiproxy/policies/quota.xml) |
| Token inválido | `GET /lab/v1/orders-advanced/` com bearer inválido | VerifyJWT → FaultRule | `401` com JSON definido em `assign-auth-fault.xml` | [FaultRule](../../examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml) |
| Target indisponível | JWT válido, falha de conexão | DefaultFaultRule no TargetEndpoint | `502` com JSON definido em `assign-target-fault.xml` | [TargetEndpoint](../../examples/03-advanced/orders-advanced/apiproxy/targets/default.xml) |
| Backend responde 404 | JWT válido, **backend real hipotético** | `success.codes` + sanitização | Mantém `404` e substitui o corpo por mensagem neutra | [Sanitização](../../examples/03-advanced/orders-advanced/apiproxy/policies/sanitize-backend-error.xml) |
| Falha interna | Falha não tratada no ProxyEndpoint | DefaultFaultRule do proxy | `500` e corpo neutro | [FaultRule padrão](../../examples/03-advanced/orders-advanced/apiproxy/policies/assign-default-fault.xml) |

## 1. Proxy básico: não inventar um 200

```http
GET /lab/v1/orders-basic/ HTTP/1.1
Host: api.example.invalid
```

O `BasePath` aceita esse caminho e a `RouteRule` referencia o TargetEndpoint `default`. O destino é `orders-backend.example.invalid`. Sem backend real, não existe resposta HTTP de sucesso de negócio observada.

## 2. Intermediário: autenticação, proteção e consumo

Requisição com credencial inválida:

```bash
# Ilustração, não executar contra .invalid
curl -i 'https://api.example.invalid/lab/v1/orders-intermediate/' \
  -H 'x-api-key: CHAVE_INVALIDA'
```

Se o proxy estivesse implantado e `VerifyAPIKey` encontrasse uma chave inválida, ocorreria uma falha `InvalidApiKey` com status padrão `401`, segundo a documentação da policy. **As próximas policies não executam**, inclusive SpikeArrest. O corpo exato da resposta não está customizado nesse módulo.

Requisição com credencial hipoteticamente válida:

```http
GET /lab/v1/orders-intermediate/ HTTP/1.1
Host: api.example.invalid
x-api-key: CHAVE_REGISTRADA_EM_APP_E_PRODUTO
```

A cadeia do `PreFlow` valida a consumer key, remove `x-api-key` antes do target, aplica SpikeArrest de `10ps` ao proxy, aplica Quota de `100/min` por consumer key e adiciona `x-correlation-id` a partir de `messageid`. Se a chamada for `GET /`, o Conditional Flow acrescenta `x-api-operation: list-orders` **na requisição ao backend**, não na resposta ao cliente.

A Quota usa `verifyapikey.verify-api-key.client_id`. Chaves diferentes da mesma aplicação possuem contadores distintos neste desenho. Se SpikeArrest rejeitar uma requisição, Quota não é alcançada. O inverso não vale: uma chave inválida é rejeitada **antes** do SpikeArrest. Não há limitação antecipada de tentativas inválidas por essa policy.

**Violação de limites:** SpikeArrest e Quota podem retornar `429 Too Many Requests`. Isso não significa que a 11ª chamada no mesmo segundo, ou a 101ª no mesmo minuto, necessariamente será rejeitada: importam janela, distribuição do tráfego, configuração e ordem de execução. O laboratório não customiza os payloads dessas falhas.

## 3. Avançado: JWT e falhas categorizadas

```bash
# JWT inválido (exemplo hipotético)
curl -i 'https://api.example.invalid/lab/v1/orders-advanced/' \
  -H 'Authorization: Bearer TOKEN_INVALIDO'
```

**Pré-condições:** proxy e Shared Flow implantados no mesmo environment; JWKS confiável presente em `private.orders.jwks`. Se `VerifyJWT` sinalizar `JWT.failed`, o proxy tem configurado:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error":"unauthorized","message":"A valid bearer token is required."}
```

A variável `JWT.failed` não significa exclusivamente assinatura inválida. Problemas operacionais de JWKS/configuração também podem ativá-la; produção deve diferenciá-los e monitorá-los.

Com JWT válido, `Authorization` é removido e o Shared Flow propaga apenas `x-authenticated-subject` para o target.

### Sem resposta do target: 502 configurado

Em caso de falha de conectividade tratada pela `DefaultFaultRule` do TargetEndpoint:

```http
HTTP/1.1 502 Bad Gateway
Content-Type: application/json

{"error":"bad_gateway","message":"The backend is temporarily unavailable."}
```

### Backend real hipotético responde 404: status preservado

O target deste repositório é fictício. **Somente se um backend funcional fosse configurado** e retornasse HTTP 404, a configuração de `success.codes` permitiria seguir pelo response flow, com payload sanitizado:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error":"backend_error","message":"The backend could not complete the request."}
```

Isso também vale para outras respostas HTTP 4xx/5xx sob as condições do fluxo. Não confundir respostas HTTP do backend com falhas de transporte.

### Falha interna do proxy: 500 configurado

A `DefaultFaultRule` do ProxyEndpoint usa:

```json
{"error":"gateway_error","message":"The request could not be processed."}
```

## Demonstração offline reproduzível

```bash
python scripts/demo_http_scenarios.py
python scripts/validate_bundles.py
```

O primeiro comando **lê os XMLs e imprime uma interpretação didática dos cenários**. Não envia HTTP, não emula o Apigee e não comprova comportamento distribuído. O segundo valida estrutura e referências estáticas dos bundles. Os testes unitários verificam a correspondência entre taxas, caminhos e respostas declaradas.

Para uma validação real, implante os bundles e recursos dependentes num ambiente de testes Apigee, associe credenciais, configure JWKS e backend alcançável e use ferramentas de depuração e observabilidade. Não provoque testes de carga em produção para demonstrar `429`.

## Referências oficiais

- [Verify API Key](https://cloud.google.com/apigee/docs/api-platform/reference/policies/verify-api-key-policy)
- [SpikeArrest](https://cloud.google.com/apigee/docs/api-platform/reference/policies/spike-arrest-policy)
- [Quota](https://cloud.google.com/apigee/docs/api-platform/reference/policies/quota-policy)
- [VerifyJWT](https://cloud.google.com/apigee/docs/api-platform/reference/policies/verify-jwt-policy)
- [Tratamento de falhas](https://cloud.google.com/apigee/docs/api-platform/fundamentals/fault-handling)
