# Validação estática

Execute na raiz, com Python 3.11+:

```bash
python scripts/validate_bundles.py
python -m unittest discover -s tests -v
```

## O que é verificado

O script percorre todos os `apiproxy/` e `sharedflowbundle/`, analisa cada XML com a biblioteca padrão e falha com código, caminho e mensagem quando encontra:

- XML não bem formado;
- descritor raiz ou endpoint obrigatório ausente;
- policy sem nome, nome divergente do arquivo ou nome duplicado;
- Step apontando para policy inexistente no bundle;
- RouteRule apontando para TargetEndpoint inexistente;
- FlowCallout apontando para Shared Flow ausente no repositório;
- documentação obrigatória ausente ou vazia.

O workflow `.github/workflows/validate.yml` executa as mesmas verificações e os testes em pushes para `main` e Pull Requests destinados a `main`, com somente `contents: read` e sem segredos.

## O que não é verificado

O validador não contém o schema privado/completo da plataforma e não prova que o bundle será importado ou implantado. Ele também não valida expressões de condição, compatibilidade de policies com uma organização, recursos externos, valores de variáveis, credenciais, DNS/TLS, produtos/apps ou comportamento de quota distribuída.

Antes de produção, use import/deploy em um environment não produtivo, Debug, testes funcionais e de falha, revisão de segurança e observabilidade. A validação estática é uma barreira rápida para inconsistências verificáveis, não certificação Apigee.
