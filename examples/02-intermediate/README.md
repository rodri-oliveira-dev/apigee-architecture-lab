# 02 — Controles intermediários / Intermediate controls

## Português

**Problema:** impedir acesso anônimo, controlar rajadas, limitar consumo por aplicação e propagar correlação. O exemplo acrescenta um fluxo condicional para `GET /` como marcador estrutural: seus blocos `Request` e `Response` estão vazios, portanto ele não executa lógica de negócio. O objetivo é mostrar onde Steps específicos da operação poderiam ser anexados.

**Responsabilidade dos arquivos:** o descritor `orders-intermediate.xml` nomeia o bundle; o ProxyEndpoint ordena policies e declara o Conditional Flow; o TargetEndpoint contém o destino fictício. Em `policies/`, `verify-api-key.xml` lê `x-api-key`; `spike-arrest.xml` limita o proxy a `10ps` com contagem efetiva regional (`UseEffectiveCount=true`), sem identificador por cliente; `quota.xml` limita cada `client_id` verificado a 100 chamadas por minuto; `assign-correlation-id.xml` envia o `messageid` ao backend.

```mermaid
flowchart TD
    A[Request PreFlow] --> K[1. VerifyAPIKey]
    K --> S[2. SpikeArrest]
    S --> Q[3. Quota por client_id]
    Q --> C[4. AssignMessage: correlation ID]
    C --> D{GET e path /?}
    D -->|sim| F[Conditional Flow list-orders]
    D -->|não| P[PostFlow]
    F --> P
    P --> R[RouteRule]
```

```mermaid
sequenceDiagram
    participant C as Consumidor
    participant A as Apigee
    participant M as Metadados de app/produto
    C->>A: GET / + x-api-key
    A->>M: VerifyAPIKey
    alt chave válida e autorizada
        M-->>A: client_id
        A->>A: SpikeArrest → Quota → AssignMessage
        A-->>C: encaminha/responde
    else ausente, inválida ou não autorizada
        A-->>C: falha da policy, pipeline normal é interrompido
    end
```

**Comportamento e dependências:** a configuração é analisável estaticamente, mas `VerifyAPIKey` só funciona com API product, developer app e chave associados ao proxy/recurso. A Quota depende do `client_id` produzido pela policy anterior. SpikeArrest protege o proxy contra rajadas com uma janela deslizante regional; Quota governa o consumo de cada aplicação em uma janela móvel. Não são controles equivalentes.

**Boas práticas:** autenticar antes de contabilizar a quota por consumidor; dimensionar limites com testes; não usar `messageid` como identificador de negócio; definir respostas de erro consistentes (introduzidas no módulo 03). `Distributed` e `Synchronous` dão contagem coordenada, mas a sincronização por chamada pode reduzir throughput e deve ser uma escolha consciente. O backend continua deliberadamente ausente.

## English

**Problem:** block anonymous access, control bursts, cap per-application consumption, and propagate correlation. A Conditional Flow for `GET /` acts as a structural marker: its `Request` and `Response` blocks are empty, so it executes no business behavior. It only shows where operation-specific Steps could be attached.

The ProxyEndpoint executes `VerifyAPIKey → SpikeArrest → Quota → AssignMessage`; its XML also declares the conditional flow and routing. Individual files under `policies/` keep each concern explicit, while the TargetEndpoint remains fictitious.

The bundle is statically checkable, but runtime API-key verification requires an API product, developer app, and issued key. Quota consumes the verified `client_id`. With `UseEffectiveCount=true`, SpikeArrest uses a regional sliding window for the whole proxy because no client identifier is configured; Quota governs each application's rolling-window consumption. Synchronous distributed quota counting favors strictness but may reduce throughput. Authenticate before per-consumer accounting, size limits from evidence, and do not treat `messageid` as a business identifier.

[Verify API Key](https://cloud.google.com/apigee/docs/api-platform/reference/policies/verify-api-key-policy) · [Spike Arrest](https://cloud.google.com/apigee/docs/api-platform/reference/policies/spike-arrest-policy) · [Quota](https://cloud.google.com/apigee/docs/api-platform/reference/policies/quota-policy) · [Assign Message](https://cloud.google.com/apigee/docs/api-platform/reference/policies/assign-message-policy)
