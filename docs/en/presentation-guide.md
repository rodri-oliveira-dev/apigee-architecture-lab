# Presentation guide — 28 minutes + questions

The executable Brazilian Portuguese deck under [`presentation/`](../../presentation/README.md) has 14 slides for developers and architects. The planned talk takes 28 minutes; Q&A starts on the final slide and is not part of that duration.

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
6. API Proxy anatomy
7. XML references between components
8. Flow execution lifecycle
9. Policies and traffic control
10. JWT, Shared Flows, and faults
11. Architecture guardrails
12. Repository demonstration
13. Conclusions
14. Questions

## Technical points to preserve

- A request crosses ProxyEndpoint before TargetEndpoint; a response crosses TargetEndpoint before ProxyEndpoint.
- Inside every request or response pipeline, execution remains `PreFlow → Conditional Flow → PostFlow`.
- The intermediate `list-orders` flow has empty `Request` and `Response` blocks. It demonstrates structure and executes no business behavior.
- An API key identifies a client application, not necessarily an end user.
- With `UseEffectiveCount=true`, the lab's SpikeArrest uses a regional sliding window for the proxy. Quota consumes the verified `client_id` and applies a per-application rolling window.
- Runtime requires trusted private JWKS and deployment of the Shared Flow before its consuming proxy in the same environment.
- FaultRules belong to the endpoint where the fault occurs; DefaultFaultRule is the fallback when no specific rule executes.
- Static validation cannot replace Apigee import, deployment, Debug, or runtime testing.

## Rehearsal and Speaker View

Start the deck and press `S`. Every slide has its own notes. The browser must allow pop-ups for Speaker View. Reveal.js keeps those notes out of the projected slide.

## Official references

- [Flow execution](https://cloud.google.com/apigee/docs/api-platform/fundamentals/what-are-flows)
- [API proxy configuration](https://cloud.google.com/apigee/docs/api-platform/reference/api-proxy-configuration-reference)
- [Shared Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/shared-flows)
- [Fault handling](https://cloud.google.com/apigee/docs/api-platform/fundamentals/fault-handling)
