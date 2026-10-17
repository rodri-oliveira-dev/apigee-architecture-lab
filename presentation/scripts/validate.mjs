import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const presentationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(presentationRoot, "dist");
const failures = [];

function read(path) {
  if (!existsSync(path)) {
    failures.push(`arquivo ausente: ${path}`);
    return "";
  }
  if (statSync(path).size === 0) failures.push(`arquivo vazio: ${path}`);
  return readFileSync(path, "utf8");
}

function checkLocalReferences(content, base, sourceName) {
  const references = [
    ...content.matchAll(/(?:src|href)="([^"#]+)"/g),
    ...content.matchAll(/!?\[[^\]]*]\(([^)#]+)(?:#[^)]+)?\)/g)
  ];
  for (const match of references) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|data:)/.test(reference)) continue;
    const target = resolve(base, decodeURIComponent(reference.split("?")[0]));
    if (!existsSync(target)) failures.push(`${sourceName}: referência local quebrada: ${reference}`);
    else if (statSync(target).isFile() && statSync(target).size === 0) failures.push(`${sourceName}: recurso vazio: ${reference}`);
  }
}

const indexPath = resolve(outputRoot, "index.html");
const slidesPath = resolve(outputRoot, "slides.md");
const index = read(indexPath);
const slides = read(slidesPath);
const theme = read(resolve(outputRoot, "assets", "styles", "theme.css"));
checkLocalReferences(index, outputRoot, "index.html");
checkLocalReferences(slides, outputRoot, "slides.md");

const slideCount = slides ? slides.split(/^---$/m).length : 0;
if (slideCount !== 12) failures.push(`quantidade de slides esperada: 12; encontrada: ${slideCount}`);
if ((slides.match(/^Notas?:$/gm) ?? []).length !== slideCount) failures.push("cada slide deve possuir notas do apresentador");
if (/\{\{(?:xml|mermaid|github):/.test(slides)) failures.push("diretivas de geração não resolvidas");
if (!slides.includes('class="language-xml"')) failures.push("nenhum trecho XML com destaque de sintaxe");
if (!theme.includes(".reveal-viewport")) failures.push("tema não sobrescreve o viewport padrão do Reveal.js");
if (!index.includes('slideNumber: "c/t"')) failures.push("numeração de slides não configurada");

for (const name of ["architecture.svg", "execution-flow.svg", "advanced-flow.svg"]) {
  const path = resolve(outputRoot, "assets", "diagrams", name);
  const svg = read(path);
  if (svg && !/<svg[\s>]/.test(svg)) failures.push(`${name}: conteúdo SVG inválido`);
}

for (const name of ["reveal.js", "markdown.js", "highlight.js", "notes.js", "reveal.css", "monokai.css"]) {
  read(resolve(outputRoot, "vendor", "reveal", name));
}

if (failures.length) {
  console.error("Validação da apresentação falhou:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`Apresentação válida: ${slideCount} slides, referências locais e recursos estáticos íntegros.`);
