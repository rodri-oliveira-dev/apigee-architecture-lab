# Guia da apresentação — 28 minutos + perguntas

A apresentação executável em [`presentation/`](../../presentation/README.md) tem 14 slides e atende desenvolvedores e arquitetos. A exposição planejada soma 28 minutos; perguntas começam somente no último slide e ficam fora desse tempo.

## Fonte de verdade

O conteúdo visual e as notas ficam em `presentation/slides.md`. O roteiro imprimível [`speaker-script.md`](speaker-script.md) é gerado dessas notas:

```bash
npm run generate:speaker-script --prefix presentation
```

Não edite o roteiro gerado manualmente. `npm run build --prefix presentation` e `npm run validate --prefix presentation` falham quando ele diverge da fonte.

## Progressão e tempo

| # | Slide | Tempo |
|---:|---|---:|
| 1 | Google Cloud Apigee | 1 min |
| 2 | Sobre mim | 1 min |
| 3 | APIs crescem. A complexidade também. | 1 min 50 s |
| 4 | Gateway executa. Management governa. | 2 min |
| 5 | Uma fronteira entre consumidor e backend | 2 min 20 s |
| 6 | Anatomia do API Proxy | 2 min 10 s |
| 7 | XMLs se conectam por nome | 2 min 10 s |
| 8 | O ciclo de execução dos Flows | 3 min |
| 9 | Autenticar antes de contabilizar | 3 min |
| 10 | Confiança, reuso e falhas explícitas | 3 min |
| 11 | Guardrails arquiteturais | 2 min |
| 12 | Demonstração: siga a evolução | 3 min |
| 13 | Conclusão | 1 min 30 s |
| 14 | Perguntas? | fora da exposição |

## Pontos técnicos que não podem ser abreviados

- No request, o endpoint de proxy precede o target; na response, o TargetEndpoint precede o ProxyEndpoint.
- Dentro de cada pipeline de request ou response, a ordem é sempre `PreFlow → Conditional Flow → PostFlow`.
- O `list-orders` intermediário executa somente uma `AssignMessage` que adiciona `x-api-operation`; não implementa lógica de negócio.
- A API key é a credencial da aplicação. `client_id` contém a consumer key, enquanto os metadados de aplicação ficam em variáveis próprias; autenticação do usuário exige outro mecanismo.
- Com `UseEffectiveCount=true`, o SpikeArrest do laboratório usa janela deslizante regional para o proxy; a Quota usa a consumer key validada e uma janela móvel por credencial.
- `x-api-key` é removido após a validação e não chega ao backend.
- O JWT é validado antes da remoção do header `Authorization`; o backend recebe somente o subject necessário ao exemplo.
- O proxy avançado depende de JWKS privado e do Shared Flow implantado antes, no mesmo environment.
- FaultRules são específicas ao endpoint da falha. O exemplo separa JWT (401), falha interna do proxy (500), conectividade com target (502) e resposta HTTP do backend (status preservado, corpo sanitizado).
- Validação estática não substitui importação, deploy, Debug e testes de runtime no Apigee.

## Ensaio e Speaker View

Inicie a apresentação e pressione `S`. Cada slide possui notas próprias com mensagem, abertura, explicação, contexto, demonstração, arquivos e transição. O navegador deve permitir pop-ups para abrir o Speaker View. As notas ficam em elementos próprios do Reveal.js e não aparecem na tela projetada.

Use o slide 12 para a demonstração ao vivo. Antes de apresentar, deixe quatro pontos já abertos no editor: `examples/01-basic/apiproxy/proxies/default.xml`; o `PreFlow` e o `list-orders` intermediários; `verify-jwt.xml` ao lado do Shared Flow; e um terminal na raiz. Mostre um ponto por módulo e então execute o validador, sem navegar pelos READMEs durante a demo.

## Referências oficiais

- [Execução dos Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/what-are-flows)
- [Configuração de API Proxy](https://cloud.google.com/apigee/docs/api-platform/reference/api-proxy-configuration-reference)
- [Shared Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/shared-flows)
- [Tratamento de falhas](https://cloud.google.com/apigee/docs/api-platform/fundamentals/fault-handling)
