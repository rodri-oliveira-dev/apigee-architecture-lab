import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMermaid } from "@mermaid-js/mermaid-cli";
import puppeteer from "puppeteer";

const presentationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(presentationRoot, "..");
const ignoredDirectories = new Set([".git", "dist", "node_modules"]);
const puppeteerConfig = JSON.parse(
  readFileSync(join(presentationRoot, "puppeteer-config.json"), "utf8")
);
puppeteerConfig.headless = "shell";

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !ignoredDirectories.has(entry.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(path);
      return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
    });
}

function mermaidBlocks(path) {
  const lines = readFileSync(path, "utf8").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let current = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!current && /^```mermaid\s*$/.test(line)) {
      current = { line: index + 1, content: [] };
      continue;
    }
    if (current && /^```\s*$/.test(line)) {
      blocks.push({ line: current.line, source: current.content.join("\n") });
      current = null;
      continue;
    }
    if (current) current.content.push(line);
  }

  if (current) {
    throw new Error(`bloco Mermaid iniciado na linha ${current.line} não foi fechado`);
  }
  return blocks;
}

function conciseError(error) {
  const message = error?.message ?? String(error);
  return message.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

const failures = [];
const diagrams = [];

for (const path of markdownFiles(repositoryRoot).sort()) {
  const repositoryPath = relative(repositoryRoot, path).split(sep).join("/");
  let blocks;
  try {
    blocks = mermaidBlocks(path);
  } catch (error) {
    failures.push(`MERMAID001 ${repositoryPath}: ${conciseError(error)}`);
    continue;
  }

  for (let index = 0; index < blocks.length; index += 1) {
    diagrams.push({ ...blocks[index], block: index + 1, path: repositoryPath });
  }
}

let cursor = 0;
const browser = await puppeteer.launch(puppeteerConfig);

async function validateNextDiagram() {
  while (cursor < diagrams.length) {
    const diagram = diagrams[cursor];
    cursor += 1;
    try {
      await renderMermaid(browser, diagram.source, "svg", {
        backgroundColor: "transparent",
        fontEmbed: false
      });
    } catch (error) {
      failures.push(
        `MERMAID002 ${diagram.path}:${diagram.line} (bloco ${diagram.block}): ${conciseError(error)}`
      );
    }
  }
}

try {
  await validateNextDiagram();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Validação Mermaid falhou (${failures.length} erro(s)):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  `Validação Mermaid aprovada: ${diagrams.length} diagrama(s) renderizado(s) a partir de arquivos Markdown.`
);
