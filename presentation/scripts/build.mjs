import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const presentationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(presentationRoot, "..");
const outputRoot = join(presentationRoot, "dist");
const diagramsRoot = join(outputRoot, "assets", "diagrams");
const revealRoot = join(presentationRoot, "node_modules", "reveal.js");

function readUtf8(path) {
  return readFileSync(path, "utf8").replace(/\r\n/g, "\n");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function repositoryUrl() {
  const configured = process.env.PRESENTATION_REPOSITORY_URL;
  if (configured) return configured.replace(/\.git$/, "");
  try {
    return execFileSync("git", ["remote", "get-url", "origin"], { cwd: repositoryRoot, encoding: "utf8" })
      .trim()
      .replace(/^git@github\.com:/, "https://github.com/")
      .replace(/\.git$/, "");
  } catch {
    return "https://github.com/rodri-oliveira-dev/apigee-architecture-lab";
  }
}

function repositoryRef() {
  if (process.env.PRESENTATION_GITHUB_REF) return process.env.PRESENTATION_GITHUB_REF;
  try {
    return execFileSync("git", ["branch", "--show-current"], { cwd: repositoryRoot, encoding: "utf8" }).trim() || "main";
  } catch {
    return "main";
  }
}

function safeRepositoryPath(value) {
  const resolved = resolve(repositoryRoot, value);
  const prefix = repositoryRoot.endsWith(sep) ? repositoryRoot : `${repositoryRoot}${sep}`;
  if (!resolved.startsWith(prefix) || !existsSync(resolved)) {
    throw new Error(`Referência fora do repositório ou inexistente: ${value}`);
  }
  return resolved;
}

function extractMermaid(sourcePath, index) {
  const markdown = readUtf8(safeRepositoryPath(sourcePath));
  const blocks = [...markdown.matchAll(/```mermaid\s*\n([\s\S]*?)```/g)];
  const selected = blocks[index - 1];
  if (!selected) throw new Error(`Diagrama Mermaid ${index} não encontrado em ${sourcePath}`);
  return selected[1].trimEnd();
}

function renderDiagram(sourcePath, index, name, alt) {
  const definition = extractMermaid(sourcePath, Number(index));
  const sourceOutput = join(diagramsRoot, `${name}.mmd`);
  const svgOutput = join(diagramsRoot, `${name}.svg`);
  writeFileSync(sourceOutput, `${definition}\n`, "utf8");

  const executable = join(presentationRoot, "node_modules", "@mermaid-js", "mermaid-cli", "src", "cli.js");
  execFileSync(process.execPath, [executable,
    "--input", sourceOutput,
    "--output", svgOutput,
    "--configFile", join(presentationRoot, "mermaid-config.json"),
    "--puppeteerConfigFile", join(presentationRoot, "puppeteer-config.json"),
    "--backgroundColor", "transparent",
    "--size", "1100",
    "--quiet"
  ], { stdio: "inherit" });

  return `<img src="assets/diagrams/${name}.svg" alt="${escapeHtml(alt)}">`;
}

function extractXml(sourcePath, range, highlights) {
  const [start, end] = range.split(":").map(Number);
  const lines = readUtf8(safeRepositoryPath(sourcePath)).split("\n");
  if (!start || !end || start > end || end > lines.length) {
    throw new Error(`Intervalo inválido ${range} em ${sourcePath}`);
  }
  const snippet = escapeHtml(lines.slice(start - 1, end).join("\n"));
  return `<pre><code class="language-xml" data-line-numbers="${escapeHtml(highlights)}">${snippet}</code></pre>`;
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(diagramsRoot, { recursive: true });
mkdirSync(join(outputRoot, "assets", "styles"), { recursive: true });
mkdirSync(join(outputRoot, "vendor", "reveal"), { recursive: true });

copyFileSync(join(presentationRoot, "index.html"), join(outputRoot, "index.html"));
copyFileSync(join(presentationRoot, "assets", "styles", "theme.css"), join(outputRoot, "assets", "styles", "theme.css"));
copyFileSync(join(revealRoot, "dist", "reveal.js"), join(outputRoot, "vendor", "reveal", "reveal.js"));
copyFileSync(join(revealRoot, "dist", "reveal.css"), join(outputRoot, "vendor", "reveal", "reveal.css"));
copyFileSync(join(revealRoot, "dist", "plugin", "markdown.js"), join(outputRoot, "vendor", "reveal", "markdown.js"));
copyFileSync(join(revealRoot, "dist", "plugin", "highlight.js"), join(outputRoot, "vendor", "reveal", "highlight.js"));
copyFileSync(join(revealRoot, "dist", "plugin", "highlight", "monokai.css"), join(outputRoot, "vendor", "reveal", "monokai.css"));
copyFileSync(join(revealRoot, "dist", "plugin", "notes.js"), join(outputRoot, "vendor", "reveal", "notes.js"));

const baseUrl = repositoryUrl();
const ref = repositoryRef();
let slides = readUtf8(join(presentationRoot, "slides.md"));

slides = slides.replace(/\{\{xml:([^|}]+)\|([^|}]+)\|([^}]+)}}/g, (_, path, range, highlights) =>
  extractXml(path, range, highlights)
);
slides = slides.replace(/\{\{mermaid:([^|}]+)\|([^|}]+)\|([^|}]+)\|([^}]+)}}/g, (_, path, index, name, alt) =>
  renderDiagram(path, index, name, alt)
);
slides = slides.replace(/\{\{github:([^|}]+)\|([^}]+)}}/g, (_, path, label) => {
  safeRepositoryPath(path);
  const url = `${baseUrl}/blob/${encodeURIComponent(ref).replace(/%2F/g, "/")}/${path.replace(/\\/g, "/")}`;
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
});

if (/\{\{(?:xml|mermaid|github):/.test(slides)) {
  throw new Error("O build terminou com diretivas não resolvidas em slides.md");
}

writeFileSync(join(outputRoot, "slides.md"), slides, "utf8");
console.log(`Apresentação gerada em ${relative(repositoryRoot, outputRoot)} (ref: ${ref}).`);
