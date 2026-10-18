# Decisões arquiteturais

1. **Bundles independentes e progressivos.** Cada estágio pode ser estudado isoladamente; repetições pequenas nos bundles preservam portabilidade e tornam o diff didático.
2. **TargetEndpoint nomeado.** A URL não fica na RouteRule, permitindo evoluir conexão e políticas de destino sem alterar a interface pública.
3. **Domínios `.invalid`.** O repositório nunca aponta para produção nem finge oferecer backend funcional.
4. **Falha fechada.** Policies de segurança usam `continueOnError="false"`; falhas interrompem o fluxo normal.
5. **JWKS por variável privada.** Nenhuma chave ou token entra no Git. O provisionamento e a rotação são dependências explícitas do runtime.
6. **Shared Flow pequeno.** O exemplo reutiliza somente enriquecimento de contexto. A verificação JWT permanece no proxy para manter issuer/audience visíveis no contrato da API.
7. **Validador sem dependências.** `xml.etree.ElementTree` mantém execução local e CI simples; o limite semântico é documentado.
8. **CI de mínimo privilégio.** O workflow lê conteúdo, não recebe credenciais e não faz deploy.
9. **Credenciais removidas após validação.** `x-api-key` e o bearer token autenticam a chamada na borda, mas não fazem parte dos contratos dos backends deste laboratório; policies `AssignMessage` os removem antes do roteamento.
10. **Quota por consumer key.** O `client_id` de `VerifyAPIKey` é a chave apresentada. A escolha mantém o exemplo simples e gera contadores separados para credenciais diferentes, inclusive durante rotação; não representa agregação por aplicação.
11. **Status do backend preservado.** Respostas HTTP 4xx/5xx seguem o response flow, conservam seu status e recebem payload neutro. Falha de conectividade é diferente e retorna 502; falha interna inesperada do proxy retorna 500.
12. **Conditional Flow observável.** `GET /` adiciona apenas `x-api-operation: list-orders`, mostrando execução condicional sem deslocar lógica de negócio para o gateway.
