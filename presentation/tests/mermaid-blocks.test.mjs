import assert from "node:assert/strict";
import test from "node:test";
import { mermaidBlocksFromMarkdown } from "../scripts/mermaid-blocks.mjs";

test("extracts an unindented Mermaid fence", () => {
  const blocks = mermaidBlocksFromMarkdown("before\n```mermaid\nflowchart LR\nA --> B\n```\nafter");
  assert.deepEqual(blocks, [{ line: 2, source: "flowchart LR\nA --> B" }]);
});

for (const spaces of [1, 2, 3]) {
  test(`extracts and normalizes a Mermaid fence indented by ${spaces} space(s)`, () => {
    const indent = " ".repeat(spaces);
    const markdown = `${indent}\`\`\`mermaid\n${indent}flowchart LR\n${indent}    A --> B\n${indent}\`\`\``;
    const blocks = mermaidBlocksFromMarkdown(markdown);
    assert.deepEqual(blocks, [{ line: 1, source: "flowchart LR\n    A --> B" }]);
  });
}

test("supports tilde fences and a longer closing fence", () => {
  const blocks = mermaidBlocksFromMarkdown("~~~mermaid\nflowchart TD\nA --> B\n~~~~");
  assert.deepEqual(blocks, [{ line: 1, source: "flowchart TD\nA --> B" }]);
});

test("removes up to the opening fence indentation from content", () => {
  const blocks = mermaidBlocksFromMarkdown("   ```mermaid\n flowchart LR\n   A --> B\n   ```");
  assert.deepEqual(blocks, [{ line: 1, source: "flowchart LR\nA --> B" }]);
});

test("does not treat a four-space-indented code block as a fenced Mermaid block", () => {
  assert.deepEqual(mermaidBlocksFromMarkdown("    ```mermaid\n    invalid\n    ```"), []);
});

test("reports an unclosed Mermaid fence with its source line", () => {
  assert.throws(
    () => mermaidBlocksFromMarkdown("text\n  ```mermaid\n  flowchart LR"),
    /linha 2 não foi fechado/
  );
});
