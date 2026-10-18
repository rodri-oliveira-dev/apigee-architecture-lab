import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const presentationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(presentationRoot, "..");
const slidesPath = resolve(presentationRoot, "slides.md");
const outputPath = resolve(repositoryRoot, "docs", "pt-br", "speaker-script.md");
const checkOnly = process.argv.includes("--check");

function cleanInline(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function field(notes, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = notes.match(new RegExp(`\\*\\*${escaped}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*[^*]+:\\*\\*|$)`));
  return match?.[1].trim() ?? "";
}

function duration(seconds) {
  const total = Number(seconds);
  if (total === 0) return "fora do tempo de exposição";
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  if (!remainder) return `${minutes} min`;
  return minutes ? `${minutes} min ${remainder} s` : `${remainder} s`;
}

const source = readFileSync(slidesPath, "utf8").replace(/\r\n/g, "\n");
const slides = source.split(/^---$/m).map((slide) => slide.trim()).filter(Boolean);
const sections = slides.map((slide, index) => {
  const timing = slide.match(/data-timing="(\d+)"/)?.[1];
  const markdownTitle = slide.match(/^#{1,2}\s+(.+)$/m)?.[1];
  const htmlTitle = slide.match(/<h2>([\s\S]*?)<\/h2>/i)?.[1];
  const title = cleanInline(markdownTitle ?? htmlTitle ?? `Slide ${index + 1}`);
  const notes = slide.split(/^Notas:\s*$/m)[1]?.trim() ?? "";
  const message = field(notes, "Mensagem principal");
  const speechParts = [
    field(notes, "Abertura"),
    field(notes, "Explicação principal"),
    field(notes, "Contexto arquitetural"),
    field(notes, "Demonstração")
  ].filter(Boolean);
  const files = field(notes, "Arquivos demonstrados");
  const transition = field(notes, "Transição");

  if (!timing || !message || !speechParts.length || !files || !transition) {
    throw new Error(`Slide ${index + 1} (${title}) não possui todos os campos obrigatórios nas notas.`);
  }

  return [
    `## ${index + 1}. ${title}`,
    "",
    `**Tempo estimado:** ${duration(timing)}`,
    "",
    `**Mensagem principal:** ${message}`,
    "",
    "**Fala sugerida:**",
    "",
    speechParts.join("\n\n"),
    "",
    `**Arquivos demonstrados:** ${files}`,
    "",
    `**Transição:** ${transition}`
  ].join("\n");
});

const output = [
  "# Roteiro de fala — Google Cloud Apigee",
  "",
  "> Documento gerado a partir das notas de `presentation/slides.md`. Não edite este arquivo manualmente; execute `npm run generate:speaker-script --prefix presentation`.",
  "",
  "A exposição planejada dura 28 minutos. O slide de perguntas fica fora desse tempo.",
  "",
  ...sections.flatMap((section) => [section, ""])
].join("\n").trimEnd() + "\n";

if (checkOnly) {
  const current = existsSync(outputPath) ? readFileSync(outputPath, "utf8").replace(/\r\n/g, "\n") : "";
  if (current !== output) {
    console.error("O roteiro está desatualizado. Execute: npm run generate:speaker-script --prefix presentation");
    process.exit(1);
  }
  console.log(`Roteiro sincronizado com ${slides.length} slides.`);
} else {
  writeFileSync(outputPath, output, "utf8");
  console.log(`Roteiro gerado com ${slides.length} slides em docs/pt-br/speaker-script.md.`);
}
