---
name: pedagogical-review
description: Review and evolve the Apigee presentation for practitioners, preserving technical accuracy, progressive learning, storytelling, timing, and evidence boundaries.
---

# Pedagogical review of the Apigee architecture lab

Use when changing slides, notes, examples, learning objectives, diagrams, or the presentation guide.

## Audience and structure

- Assume developers and architects already use Apigee. Refresh fundamentals briefly; do not teach HTTP or cloud basics unless needed.
- Keep the fictitious orders API as the narrative thread: basic model, intermediate behavior and trade-offs, advanced trust and failure boundaries, then deployment and governance. Explain independent bundles; never imply cumulative implementation.
- Keep the 16-slide, 28-minute contract unless an explicitly approved change also updates all time and slide-count validations. Open Q&A is outside that duration.
- For each concept, connect a realistic problem, the actual configuration, its expected behavior, a trade-off, and a practical takeaway. Use short prediction questions inside the allotted time; leave extended debate for Q&A.
- Separate essential oral content from optional depth in the notes; avoid overloading projected slides.

## Technical and editorial review

- Verify assertions against the actual XML and official Apigee documentation; distinguish client application credentials from user identity, rate versus quota, authentication versus authorization, and proxy versus target faults.
- Identify trust boundaries, security assumptions, operational dependencies, and limits. Never describe illustrative HTTP outcomes or static checks as runtime evidence.
- Preserve the no-infrastructure, no-credentials, no-deployment scope. Do not introduce costs, real endpoints, or secret material.
- Maintain Portuguese and English documentation parity and avoid duplicating generated content. Edit presentation/slides.md as the source of truth; regenerate docs/pt-br/speaker-script.md using the existing generator.
- Align both presentation guides, visible timing, notes, and demo allocations. Ensure code and diagram directives still reference the correct source files.

## Validation before review

Run the existing local checks where available:

```bash
python scripts/validate_bundles.py
python -m unittest discover -s tests -v
npm ci --prefix presentation
npm run validate:mermaid --prefix presentation
npm run generate:speaker-script --prefix presentation
npm run build --prefix presentation
npm run validate --prefix presentation
```

Run the existing visual validation with the server started, and rehearse the 28-minute session. Report checks actually run, pending checks, and the limits of static validation. Do not claim visual or runtime validation that has not occurred.
