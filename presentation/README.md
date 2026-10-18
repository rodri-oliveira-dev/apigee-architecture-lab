# Apresentação técnica — Google Cloud Apigee

Apresentação em português brasileiro, com 14 slides e 28 minutos de exposição, seguidos por perguntas. Usa o Reveal.js oficial e os plugins nativos Markdown, Highlight e Notes. Trechos XML e diagramas são gerados a partir dos exemplos e da documentação do repositório.

## Pré-requisitos

- Node.js 22.13 ou mais recente;
- npm 10 ou mais recente;
- Python 3.11 ou mais recente para validar os bundles;
- Chromium baixado automaticamente pela dependência do Mermaid CLI.

## Executar localmente

Na raiz do repositório:

```bash
npm ci --prefix presentation
npm start --prefix presentation
```

Abra <http://127.0.0.1:8000>. Use as setas para navegar, `F` para tela cheia, `O` para visão geral e `S` para abrir o Speaker View. Permita pop-ups para que a janela de notas seja criada. As notas pertencem a cada slide e não aparecem na tela projetada. O servidor HTTP é necessário porque os slides usam um arquivo Markdown externo.

Uma porta alternativa pode ser informada após `--`:

```bash
npm start --prefix presentation -- --port=8080
```

## Gerar e validar a versão estática

```bash
npm run validate:mermaid --prefix presentation
npm run generate:speaker-script --prefix presentation
npm run build --prefix presentation
npm run validate --prefix presentation
```

O build gera `presentation/dist/`, uma pasta estática para servir por HTTP. Seus recursos são locais, exceto a foto do slide “Sobre mim”, obtida do portfólio público e que requer conexão para ser exibida. O diretório não é versionado. Ele contém Reveal.js, plugins, estilos, Markdown final e SVGs locais. Para distribuição, compacte a pasta `dist/` completa; abrir apenas `index.html` diretamente via `file://` não suporta Markdown externo nem notas de forma confiável.

## Publicação no GitHub Pages

O workflow `.github/workflows/publish-presentation.yml` publica `presentation/dist/` em:

<https://rodri-oliveira-dev.github.io/apigee-architecture-lab/>

O deploy ocorre após pushes na branch `main` que alterem a apresentação, os exemplos utilizados ou a documentação Mermaid de origem. Também pode ser iniciado por `workflow_dispatch` na aba Actions. Pull Requests não publicam: eles executam somente o workflow de validação.

O workflow utiliza o ambiente `github-pages`, empacota apenas a distribuição estática e não armazena o conteúdo gerado em uma branch adicional.

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

`npm run validate:mermaid` testa o parser e renderiza todos os blocos Mermaid encontrados nos arquivos Markdown, inclusive cercas com até três espaços de indentação, informando arquivo, linha e bloco em caso de erro. `npm run generate:speaker-script` gera `docs/pt-br/speaker-script.md` a partir das notas, que são a única fonte editorial da fala. Build e validação falham se o roteiro estiver desatualizado. `npm run validate` confirma quantidade e tempos dos slides, estrutura das notas, trechos XML, arquivos referenciados, SVGs, workspace e recursos do Reveal.js. Essas verificações não substituem uma revisão visual em navegador.

Com o servidor local em execução, `npm run validate:visual --prefix presentation` percorre os 14 slides em Chromium a 1920×1080, detecta overflow e notas visíveis e grava capturas temporárias em `presentation/dist/visual-check/`.

## VS Code Workspace

Abra `apigee-architecture-lab.code-workspace` pelo menu **File > Open Workspace from File**. O workspace recomenda extensões para XML, Markdown e Mermaid e disponibiliza as tasks de instalação, build, servidor, validações individuais e `Quality: Validate All`.

A configuração de execução **Presentation: Open in Browser** inicia a task de servidor, aguarda a mensagem real de prontidão e abre <http://127.0.0.1:8000> em um navegador Chromium compatível com o debugger do VS Code. Se Chrome/Chromium não estiver disponível, execute **Presentation: Start** e abra o endereço manualmente. Interrompa o servidor pelo botão de encerramento da task no terminal.

## Arquivos principais

- `index.html`: inicialização 16:9 do Reveal.js e plugins oficiais;
- `slides.md`: conteúdo e notas do apresentador;
- `assets/styles/theme.css`: tema escuro e componentes visuais;
- `scripts/build.mjs`: extração de fontes, diagramas e empacotamento;
- `scripts/generate-speaker-script.mjs`: geração e verificação do roteiro de fala;
- `scripts/validate.mjs`: verificação da distribuição estática;
- `scripts/visual-check.mjs`: inspeção automatizada em navegador a 1920×1080;
- `scripts/serve.mjs`: servidor HTTP local sem dependência adicional.
