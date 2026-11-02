import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const slides = readFileSync(new URL("../slides.md", import.meta.url), "utf8");
const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");

test("Open Graph e Twitter Card têm imagem e metadados explícitos", () => {
  for (const attr of [
    'property="og:title"', 'property="og:description"', 'property="og:image"',
    'property="og:image:alt"', 'property="og:image:width"',
    'property="og:image:height"', 'name="twitter:card"', 'rel="canonical"'
  ]) assert.ok(html.includes(attr), attr);
  assert.ok(html.includes("assets/images/social-preview.png"));
});
test("fotografia é local no pacote gerado", () => {
  assert.ok(slides.includes('src="assets/images/rodrigo-about.webp"'));
  assert.ok(!slides.includes('src="https://rodri-oliveira-dev.github.io/assets/profile/'));
  assert.ok(build.includes('writeFileSync(join(imagesRoot, "rodrigo-about.webp"), portrait)'));
});
test("scroll view é ativada em telas estreitas sem perder canvas 16:9", () => {
  assert.ok(html.includes('scrollActivationWidth: 768'));
  assert.ok(html.includes('width: 1280'));
  assert.ok(html.includes('height: 720'));
});
