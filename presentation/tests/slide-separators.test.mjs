import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const markdown = readFileSync(new URL("../slides.md", import.meta.url), "utf8");
const separator = index.match(/data-separator="([^"]+)"/)?.[1];

test("Reveal.js reconhece todos os slides definidos no Markdown", () => {
  assert.ok(separator, "data-separator deve estar presente no HTML");
  const expectedCount = markdown.split(/^---$/m).length;
  const renderedCount = markdown.split(new RegExp(separator, "gm")).length;
  assert.equal(expectedCount, 14);
  assert.equal(renderedCount, expectedCount, "todos os separadores devem seguir o padrão do Reveal.js");
});

test("um separador sem linha em branco antes não pode passar despercebido", () => {
  assert.ok(separator);
  const revealSeparator = new RegExp(separator, "gm");
  assert.equal("Notas finais\n---\nPróximo slide".split(revealSeparator).length, 1);
  assert.equal("Notas finais\n\n---\nPróximo slide".split(revealSeparator).length, 2);
});
