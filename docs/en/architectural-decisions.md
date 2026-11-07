# Architecture decisions

1. **Independent, progressive bundles.** Each stage stands alone; limited bundle repetition preserves portability and makes the teaching diff clear.
2. **Named TargetEndpoint.** The RouteRule does not embed a URL, so target connection and policies can evolve without changing the public interface.
3. **`.invalid` domains.** The repository never points to production or pretends to provide a working backend.
4. **Fail closed.** Security policies use `continueOnError="false"`; failures stop the normal flow.
5. **JWKS from a private variable.** No keys or tokens enter Git. Runtime provisioning and rotation remain explicit dependencies.
6. **Small Shared Flow.** Only context enrichment is reused. JWT verification stays in the proxy so issuer/audience remain visible API-contract decisions.
7. **Dependency-free validator.** `xml.etree.ElementTree` keeps local and CI execution simple; semantic limits are documented.
8. **Least-privilege CI.** The workflow only reads contents, receives no credentials, and performs no deployment.
9. **Credentials removed after validation.** `x-api-key` and the bearer token authenticate at the edge but are not backend contracts in this lab.
10. **Quota by consumer key.** The verified `client_id` is the presented key, so different credentials have independent counters; this is not application-level aggregation.
11. **Backend status preserved.** HTTP 4xx/5xx responses keep their status and receive a neutral payload, while connectivity failures return 502 and unexpected proxy failures return 500.
12. **Observable conditional flow.** `GET /` adds only `x-api-operation: list-orders`, demonstrating conditional execution without moving business logic to the gateway.
13. **Independent intermediate extension.** KVM and multiple targets live in `orders-routing`, preserving the basic proxy and the primary authentication/traffic example.
14. **Validated external configuration.** The non-sensitive KVM entry uses a `private.` variable, is not initialized by the bundle, and must match an allowlist before enrichment or routing.
15. **Fallback only after validation.** The conditional RouteRule precedes the unconditional primary rule. Missing or unknown configuration fails explicitly instead of selecting a backend by accident.
16. **Terraform as lifecycle context.** Documentation names only public Google provider resources and separates bundle, import, deployment, and remote state. It invents no private module interface and runs no infrastructure.
