# Arquitetura e modelo de execução

## Visão geral

O laboratório separa contrato público, processamento do gateway e conexão de destino. O Apigee não substitui o backend: ele forma uma camada de gestão e aplicação de políticas.

```mermaid
flowchart LR
    U[Consumidor] -->|HTTPS| G[Environment group / hostname]
    G --> P[ProxyEndpoint]
    P -->|RouteRule| T[TargetEndpoint]
    T -.-> B[Backend fictício]
    P --- C[Policies: segurança e tráfego]
```

## Ciclo de uma mensagem

No request, o fluxo atravessa ProxyEndpoint e TargetEndpoint antes do backend. Na resposta, a travessia entre endpoints ocorre no sentido inverso: primeiro o TargetEndpoint e depois o ProxyEndpoint. Em cada pipeline de request ou response, porém, a ordem interna permanece `PreFlow → Conditional Flow → PostFlow`. Somente o primeiro Conditional Flow cuja condição for verdadeira executa em cada segmento. Dentro de cada Flow, os Steps executam na ordem declarada; um erro com `continueOnError="false"` abandona o pipeline normal.

```mermaid
flowchart TB
    subgraph RES[Response]
        direction RL
        B2[Backend] --> TS["TargetEndpoint<br/>Pre → Conditional → Post"]
        TS --> PS["ProxyEndpoint<br/>Pre → Conditional → Post"]
        PS --> A2[Consumidor]
    end
    subgraph REQ[Request]
        direction LR
        A[Consumidor] --> PR["ProxyEndpoint<br/>Pre → Conditional → Post"]
        PR -->|RouteRule| TR["TargetEndpoint<br/>Pre → Conditional → Post"]
        TR --> B[Backend]
    end
```

```mermaid
flowchart LR
    A[PreFlow<br/>sempre] --> B{Condição do Flow}
    B -->|verdadeira| C[Conditional Flow]
    B -->|falsa| D[PostFlow]
    C --> D
```

## Progressão do desenho

- **Básico:** fronteira e roteamento explícitos.
- **Intermediário:** autenticação de aplicação, proteção de capacidade, governança de consumo e enriquecimento.
- **Avançado:** identidade por JWT, composição reutilizável e contrato de erros.

Policies são configuração, não substitutos automáticos para decisões arquiteturais. Limites, ordem, condições, identidade, dados sensíveis e observabilidade precisam de critérios próprios. Shared Flows reduzem duplicação, mas criam uma dependência de deploy e versionamento entre artefatos.

## Fronteira do laboratório

Os bundles seguem a estrutura documentada e são verificados por relações que o repositório consegue provar. A plataforma ainda deve validar schemas, disponibilidade de policies/licenças, variáveis em runtime, recursos de organização/environment, conectividade e comportamento distribuído.

Referências: [estrutura de proxies](https://cloud.google.com/apigee/docs/api-platform/fundamentals/structure-api-proxies), [ordem de execução dos flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/what-are-flows), [configuração de proxies](https://cloud.google.com/apigee/docs/api-platform/reference/api-proxy-configuration-reference) e [variáveis de flow](https://cloud.google.com/apigee/docs/api-platform/fundamentals/introduction-flow-variables).
