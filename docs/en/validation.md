# Static validation

Run from the repository root with Python 3.11+:

```bash
python scripts/validate_bundles.py
python -m unittest discover -s tests -v
```

## What is checked

The script discovers every `apiproxy/` and `sharedflowbundle/`, parses XML with the Python standard library, and reports a code, path, and clear message for malformed XML; missing descriptors/endpoints; missing, duplicate, or file-mismatched policy names; unresolved Step policies; unresolved RouteRule targets; unresolved FlowCallout bundles; and missing required documentation.

`.github/workflows/validate.yml` runs the same validation and unit tests on pushes to `main` and pull requests targeting `main`. It has only `contents: read` permission and uses no secrets.

The presentation has an additional reproducible validation path:

```bash
npm ci --prefix presentation
npm run build --prefix presentation
npm run validate --prefix presentation
```

It checks diagram generation, slide and note counts, XML excerpts, local references, and the integrity of packaged static assets.

## What is not checked

The validator does not embed Apigee's full internal schema and cannot prove that a bundle will import or deploy. It does not validate condition expressions, organization-specific policy availability, external resources, runtime variable values, credentials, DNS/TLS, products/apps, or distributed quota behavior.

Before production, import and deploy to a non-production environment, use Debug, run functional and failure tests, and complete security and observability reviews. Static validation is a fast guardrail for provable inconsistencies, not Apigee certification.
