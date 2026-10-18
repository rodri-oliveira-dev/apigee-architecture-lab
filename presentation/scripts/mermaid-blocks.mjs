import { readFileSync } from "node:fs";

function removeFenceIndent(line, indent) {
  let removable = 0;
  while (removable < indent.length && line[removable] === " ") removable += 1;
  return line.slice(removable);
}

export function mermaidBlocksFromMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let current = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!current) {
      const opening = line.match(/^( {0,3})(`{3,}|~{3,})[ \t]*mermaid[ \t]*$/i);
      if (opening) {
        current = {
          content: [],
          fenceCharacter: opening[2][0],
          fenceLength: opening[2].length,
          indent: opening[1],
          line: index + 1
        };
      }
      continue;
    }

    const closing = line.match(/^( {0,3})(`{3,}|~{3,})[ \t]*$/);
    const closesCurrentFence = closing
      && closing[2][0] === current.fenceCharacter
      && closing[2].length >= current.fenceLength;
    if (closesCurrentFence) {
      blocks.push({ line: current.line, source: current.content.join("\n") });
      current = null;
      continue;
    }

    current.content.push(removeFenceIndent(line, current.indent));
  }

  if (current) {
    throw new Error(`bloco Mermaid iniciado na linha ${current.line} não foi fechado`);
  }
  return blocks;
}

export function mermaidBlocks(path) {
  return mermaidBlocksFromMarkdown(readFileSync(path, "utf8"));
}
