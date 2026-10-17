# Apresentação técnica — Google Cloud Apigee

Apresentação em português brasileiro, com 12 slides e duração planejada de 25 a 30 minutos. Usa o Reveal.js oficial e os plugins nativos Markdown, Highlight e Notes. Trechos XML e diagramas são gerados a partir dos exemplos e da documentação do repositório.

## Pré-requisitos

- Node.js 22.13 ou mais recente;
- npm 10 ou mais recente;
- Chromium baixado automaticamente pela dependência do Mermaid CLI.

## Executar localmente

Na raiz do repositório:

```bash
npm ci --prefix presentation
npm start --prefix presentation
```

Abra <http://127.0.0.1:8000>. Use as setas para navegar, `F` para tela cheia, `O` para visão geral e `S` para abrir as notas do apresentador. O servidor HTTP é necessário porque os slides usam um arquivo Markdown externo.

Uma porta alternativa pode ser informada após `--`:

```bash
npm start --prefix presentation -- --port=8080
```

## Gerar e validar a versão estática

```bash
npm run build --prefix presentation
npm run validate --prefix presentation
```

O build gera `presentation/dist/`, uma pasta autocontida para servir por HTTP. O diretório não é versionado. Ele contém Reveal.js, plugins, estilos, Markdown final e SVGs locais. Para distribuição, compacte a pasta `dist/` completa; abrir apenas `index.html` diretamente via `file://` não suporta Markdown externo nem notas de forma confiável.

Por padrão, os links “Ver código” usam a URL do remote `origin` e a branch Git atual. Em CI ou builds de distribuição, esses valores podem ser definidos explicitamente:

```bash
PRESENTATION_REPOSITORY_URL=https://github.com/owner/repository \
PRESENTATION_GITHUB_REF=main \
npm run build --prefix presentation
```

No PowerShell:

```powershell
$env:PRESENTATION_GITHUB_REF = "main"
npm run build --prefix presentation
```

## Como a geração evita divergências

O arquivo `slides.md` é o template editorial. As diretivas `xml`, `mermaid` e `github` são resolvidas por `scripts/build.mjs`:

- trechos XML são lidos diretamente dos bundles em `examples/`;
- blocos Mermaid são extraídos da documentação e renderizados como SVG local;
- links de código são construídos a partir do remote e da referência Git configurados;
- o resultado final é gravado somente em `dist/`.

`npm run validate` confirma a quantidade de slides, notas, trechos XML, arquivos referenciados, SVGs e recursos do Reveal.js. A validação é estática e não substitui uma revisão visual em navegador.

## Arquivos principais

- `index.html`: inicialização 16:9 do Reveal.js e plugins oficiais;
- `slides.md`: conteúdo e notas do apresentador;
- `assets/styles/theme.css`: tema escuro e componentes visuais;
- `scripts/build.mjs`: extração de fontes, diagramas e empacotamento;
- `scripts/validate.mjs`: verificação da distribuição estática;
- `scripts/serve.mjs`: servidor HTTP local sem dependência adicional.
