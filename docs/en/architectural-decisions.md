# Architecture decisions

1. **Independent, progressive bundles.** Each stage stands alone; limited bundle repetition preserves portability and makes the teaching diff clear.
2. **Named TargetEndpoint.** The RouteRule does not embed a URL, so target connection and policies can evolve without changing the public interface.
3. **`.invalid` domains.** The repository never points to production or pretends to provide a working backend.
4. **Fail closed.** Security policies use `continueOnError="false"`; failures stop the normal flow.
5. **JWKS from a private variable.** No keys or tokens enter Git. Runtime provisioning and rotation remain explicit dependencies.
6. **Small Shared Flow.** Only context enrichment is reused. JWT verification stays in the proxy so issuer/audience remain visible API-contract decisions.
7. **Dependency-free validator.** `xml.etree.ElementTree` keeps local and CI execution simple; semantic limits are documented.
8. **Least-privilege CI.** The workflow only reads contents, receives no credentials, and performs no deployment.
