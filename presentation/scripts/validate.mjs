import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const presentationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(presentationRoot, "..");
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
if (slideCount !== 14) failures.push(`quantidade de slides esperada: 14; encontrada: ${slideCount}`);
const separator = index.match(/data-separator="([^"]+)"/)?.[1];
if (!separator) {
  failures.push("data-separator não configurado no Reveal.js");
} else {
  // O parser Markdown do Reveal.js exige o mesmo padrão configurado no HTML.
  // Um separador reconhecido por /^---$/m pode não ser interpretado pelo Reveal.js.
  const renderedSlideCount = slides ? slides.split(new RegExp(separator, "gm")).length : 0;
  if (renderedSlideCount !== slideCount) {
    failures.push(`Reveal.js reconhece ${renderedSlideCount} slides, mas o Markdown declara ${slideCount}; verifique as linhas em branco antes de ---`);
  }
}
if ((slides.match(/^Notas?:$/gm) ?? []).length !== slideCount) failures.push("cada slide deve possuir notas do apresentador");
for (const label of ["Mensagem principal", "Abertura", "Explicação principal", "Arquivos demonstrados", "Transição"]) {
  if ((slides.match(new RegExp(`\\*\\*${label}:\\*\\*`, "g")) ?? []).length !== slideCount) {
    failures.push(`cada slide deve possuir o campo de notas "${label}"`);
  }
}
const timings = [...slides.matchAll(/data-timing="(\d+)"/g)].map((match) => Number(match[1]));
if (timings.length !== slideCount) failures.push("cada slide deve possuir data-timing");
if (timings.slice(0, -1).reduce((total, value) => total + value, 0) !== 1680) failures.push("a exposição deve totalizar 1680 segundos");
if (timings.at(-1) !== 0) failures.push("o slide de perguntas deve ficar fora do tempo de exposição");
if (/\{\{(?:xml|mermaid|github):/.test(slides)) failures.push("diretivas de geração não resolvidas");
if (!slides.includes('class="language-xml"')) failures.push("nenhum trecho XML com destaque de sintaxe");
if (!theme.includes(".reveal-viewport")) failures.push("tema não sobrescreve o viewport padrão do Reveal.js");
if (!index.includes('slideNumber: "c/t"')) failures.push("numeração de slides não configurada");
if (!index.includes("totalTime: 1680")) failures.push("tempo total do Reveal.js deve ser 1680 segundos");
if (!index.includes('data-separator-notes="^Notas?:"') || !index.includes("RevealNotes")) {
  failures.push("Speaker View e separador de notas não estão configurados");
}

for (const name of ["architecture.svg", "message-lifecycle.svg", "advanced-flow.svg"]) {
  const path = resolve(outputRoot, "assets", "diagrams", name);
  const svg = read(path);
  if (svg && !/<svg[\s>]/.test(svg)) failures.push(`${name}: conteúdo SVG inválido`);
}

const workspacePath = resolve(repositoryRoot, "apigee-architecture-lab.code-workspace");
const workspaceSource = read(workspacePath);
if (workspaceSource) {
  try {
    const workspace = JSON.parse(workspaceSource);
    const tasks = workspace.tasks?.tasks ?? [];
    const labels = new Set(tasks.map((task) => task.label));
    const expectedTasks = [
      "Presentation: Install Dependencies",
      "Presentation: Build",
      "Presentation: Start",
      "Presentation: Validate",
      "Apigee: Validate Bundles",
      "Tests: Run Unit Tests",
      "Quality: Validate All"
    ];
    for (const label of expectedTasks) if (!labels.has(label)) failures.push(`workspace: task ausente: ${label}`);
    const quality = tasks.find((task) => task.label === "Quality: Validate All");
    const expectedOrder = [
      "Apigee: Validate Bundles",
      "Tests: Run Unit Tests",
      "Presentation: Validate Mermaid",
      "Presentation: Build",
      "Presentation: Validate"
    ];
    if (quality?.dependsOrder !== "sequence" || JSON.stringify(quality?.dependsOn) !== JSON.stringify(expectedOrder)) {
      failures.push("workspace: Quality: Validate All não preserva a sequência esperada");
    }
    const start = tasks.find((task) => task.label === "Presentation: Start");
    if (!start?.isBackground || start?.problemMatcher?.background?.endsPattern !== "^Apresentação disponível em http://127\\.0\\.0\\.1:8000$") {
      failures.push("workspace: task Start não detecta a prontidão do servidor");
    }
    const launch = workspace.launch?.configurations?.find((item) => item.name === "Presentation: Open in Browser");
    if (launch?.url !== "http://127.0.0.1:8000" || launch?.preLaunchTask !== "Presentation: Start") {
      failures.push("workspace: configuração de navegador inválida");
    }
  } catch (error) {
    failures.push(`workspace inválido: ${error.message}`);
  }
}

for (const name of ["reveal.js", "markdown.js", "highlight.js", "notes.js", "reveal.css", "monokai.css"]) {
  read(resolve(outputRoot, "vendor", "reveal", name));
}

if (failures.length) {
  console.error("Validação da apresentação falhou:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`Apresentação válida: ${slideCount} slides, referências locais e recursos estáticos íntegros.`);
