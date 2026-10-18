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
| 10 | Confiança, reuso e falhas explícitas | 3 min 20 s |
| 11 | Guardrails arquiteturais | 2 min |
| 12 | Demonstração: siga a evolução | 2 min 40 s |
| 13 | Conclusão | 1 min 30 s |
| 14 | Perguntas? | fora da exposição |

## Pontos técnicos que não podem ser abreviados

- No request, o endpoint de proxy precede o target; na response, o TargetEndpoint precede o ProxyEndpoint.
- Dentro de cada pipeline de request ou response, a ordem é sempre `PreFlow → Conditional Flow → PostFlow`.
- O `list-orders` intermediário tem `Request` e `Response` vazios: demonstra estrutura, mas não executa lógica de negócio.
- API key identifica a aplicação; autenticação do usuário exige outro mecanismo.
- Com `UseEffectiveCount=true`, o SpikeArrest do laboratório usa janela deslizante regional para o proxy; a Quota usa o `client_id` validado e uma janela móvel por aplicação.
- O proxy avançado depende de JWKS privado e do Shared Flow implantado antes, no mesmo environment.
- FaultRules são específicas ao endpoint da falha; DefaultFaultRule é fallback quando nenhuma regra específica executa.
- Validação estática não substitui importação, deploy, Debug e testes de runtime no Apigee.

## Ensaio e Speaker View

Inicie a apresentação e pressione `S`. Cada slide possui notas próprias com mensagem, abertura, explicação, contexto, demonstração, arquivos e transição. O navegador deve permitir pop-ups para abrir o Speaker View. As notas ficam em elementos próprios do Reveal.js e não aparecem na tela projetada.

Use o slide 12 para a demonstração ao vivo. Mantenha os arquivos já abertos no editor e execute os comandos a partir da raiz para reduzir troca de contexto.

## Referências oficiais

- [Execução dos Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/what-are-flows)
- [Configuração de API Proxy](https://cloud.google.com/apigee/docs/api-platform/reference/api-proxy-configuration-reference)
- [Shared Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/shared-flows)
- [Tratamento de falhas](https://cloud.google.com/apigee/docs/api-platform/fundamentals/fault-handling)
