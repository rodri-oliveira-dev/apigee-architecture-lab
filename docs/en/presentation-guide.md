# Presentation guide — 28 minutes + questions

The executable Brazilian Portuguese deck under [`presentation/`](../../presentation/README.md) has 16 slides for developers and architects. The planned talk takes 28 minutes; Q&A starts on the final slide and is not part of that duration.

## Sources of truth

Visual content and speaker notes live in `presentation/slides.md`. The printable Portuguese [`speaker-script.md`](../pt-br/speaker-script.md) is generated from those notes:

```bash
npm run generate:speaker-script --prefix presentation
```

Do not edit the generated script manually. Presentation build and validation fail when it differs from its source.

## Sequence

1. Google Cloud Apigee
2. About the speaker
3. The API problem
4. API Gateway versus API Management
5. Overall architecture
6. Anatomy of an API Proxy in Apigee
7. How an Apigee proxy's XML files relate
8. Apigee Flow execution lifecycle
9. Policies and traffic control
10. KVM and multiple TargetEndpoints
11. JWT, Shared Flows, and faults
12. Terraform deployment lifecycle
13. Architecture guardrails
14. Repository demonstration
15. Conclusions
16. Questions

## Technical points to preserve

- A request crosses ProxyEndpoint before TargetEndpoint; a response crosses TargetEndpoint before ProxyEndpoint.
- Inside every request or response pipeline, execution remains `PreFlow → Conditional Flow → PostFlow`.
- The tree is a traditional Apigee XML bundle, not a universal gateway layout. `manifests/` is not a documented standard directory, and XML is not the platform's only authoring experience.
- The intermediate `list-orders` flow runs one AssignMessage to add technical context; it executes no business logic.
- An API key identifies a client application, not necessarily an end user. Quota uses the verified consumer key, so different keys have separate counters.
- With `UseEffectiveCount=true`, the lab's SpikeArrest uses a regional sliding window for the proxy. Quota applies a rolling window per consumer key.
- The `orders-routing` extension reads a pre-existing environment KVM into a private variable, validates it, enriches the request, and evaluates the conditional route before the unconditional fallback.
- Runtime requires trusted private JWKS and deployment of the Shared Flow before its consuming proxy in the same environment.
- FaultRules belong to the endpoint where the fault occurs; DefaultFaultRule is the fallback when no specific rule executes.
- Static validation cannot replace Apigee import, deployment, Debug, or runtime testing.
- Terraform remains conceptual: versioned bundle, official import/deployment resources, dependencies, environment promotion, and protected remote state.

## Rehearsal and Speaker View

Start the deck and press `S`. Every slide has its own notes. The browser must allow pop-ups for Speaker View. Reveal.js keeps those notes out of the projected slide.

## Official references

- [Flow execution](https://cloud.google.com/apigee/docs/api-platform/fundamentals/what-are-flows)
- [API proxy configuration](https://cloud.google.com/apigee/docs/api-platform/reference/api-proxy-configuration-reference)
- [Shared Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/shared-flows)
- [Fault handling](https://cloud.google.com/apigee/docs/api-platform/fundamentals/fault-handling)
- [KeyValueMapOperations](https://cloud.google.com/apigee/docs/api-platform/reference/policies/key-value-map-operations-policy)
- [Routes](https://cloud.google.com/apigee/docs/api-platform/fundamentals/understanding-routes)
- [Terraform `google_apigee_api`](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/apigee_api)
