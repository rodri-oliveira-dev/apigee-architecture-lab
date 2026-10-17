# Architecture and execution model

## Overview

The lab separates the public contract, gateway processing, and target connection. Apigee does not replace the backend; it provides a management and policy-enforcement layer.

```mermaid
flowchart LR
    U[Consumer] -->|HTTPS| G[Environment group / hostname]
    G --> P[ProxyEndpoint]
    P -->|RouteRule| T[TargetEndpoint]
    T -.-> B[Fictitious backend]
    P --- C[Security and traffic policies]
```

## Message lifecycle

On the request path, execution crosses the ProxyEndpoint and TargetEndpoint before reaching the backend. Response segments run in the reverse direction. Within a segment, Steps run in declaration order; an error with `continueOnError="false"` leaves the normal pipeline.

```mermaid
sequenceDiagram
    participant App
    participant PE as ProxyEndpoint
    participant TE as TargetEndpoint
    participant API as Backend
    App->>PE: request
    PE->>PE: PreFlow → Conditional Flow → PostFlow
    PE->>TE: RouteRule
    TE->>TE: PreFlow → Conditional Flow → PostFlow
    TE->>API: request
    API-->>TE: response
    TE->>TE: PostFlow → Conditional Flow → PreFlow
    TE-->>PE: response
    PE->>PE: PostFlow → Conditional Flow → PreFlow
    PE-->>App: response
```

```mermaid
flowchart LR
    A[PreFlow<br/>always] --> B{Flow condition}
    B -->|true| C[Conditional Flow]
    B -->|false| D[PostFlow]
    C --> D
```

## Design progression

- **Basic:** explicit boundary and routing.
- **Intermediate:** application authentication, capacity protection, consumption governance, and enrichment.
- **Advanced:** JWT identity, reusable composition, and an error contract.

Policies are configuration, not substitutes for architecture decisions. Limits, ordering, conditions, identity, sensitive data, and observability need explicit criteria. Shared Flows reduce duplication but introduce deployment and versioning dependencies between artifacts.

## Lab boundary

The bundles follow the documented layout and are checked for relationships the repository can prove. The platform must still validate schemas, policy availability, runtime variables, organization/environment resources, connectivity, and distributed behavior.

References: [proxy structure](https://cloud.google.com/apigee/docs/api-platform/fundamentals/structure-api-proxies), [flow configuration](https://cloud.google.com/apigee/docs/api-platform/reference/flow-configuration-reference), and [flow variables](https://cloud.google.com/apigee/docs/api-platform/fundamentals/introduction-flow-variables).
