#!/usr/bin/env python3
"""Leitura didática dos XMLs do laboratório, sem requests nem emulação do Apigee."""
from __future__ import annotations

import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def parse(path: str) -> ET.Element:
    return ET.parse(ROOT / path).getroot()


def read_config() -> dict:
    basic = parse("examples/01-basic/apiproxy/proxies/default.xml")
    intermediate = parse("examples/02-intermediate/apiproxy/proxies/default.xml")
    advanced = parse("examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml")
    spike = parse("examples/02-intermediate/apiproxy/policies/spike-arrest.xml")
    quota = parse("examples/02-intermediate/apiproxy/policies/quota.xml")
    target = parse("examples/03-advanced/orders-advanced/apiproxy/targets/default.xml")
    faults = {}
    for name in ("assign-auth-fault", "assign-target-fault", "assign-default-fault"):
        policy = parse("examples/03-advanced/orders-advanced/apiproxy/policies/" + name + ".xml")
        faults[name] = {
            "status": int(policy.findtext("Set/StatusCode")),
            "body": json.loads(policy.findtext("Set/Payload")),
        }
    return {
        "basic_path": basic.findtext("HTTPProxyConnection/BasePath"),
        "intermediate_path": intermediate.findtext("HTTPProxyConnection/BasePath"),
        "advanced_path": advanced.findtext("HTTPProxyConnection/BasePath"),
        "intermediate_steps": [
            step.findtext("Name") for step in intermediate.findall("PreFlow/Request/Step")
        ],
        "spike_rate": spike.findtext("Rate"),
        "quota_limit": int(quota.find("Allow").get("count")),
        "quota_interval": quota.findtext("Interval"),
        "quota_unit": quota.findtext("TimeUnit"),
        "quota_identifier": quota.find("Identifier").get("ref"),
        "success_codes": target.findtext(
            "HTTPTargetConnection/Properties/Property[@name='success.codes']"
        ),
        "faults": faults,
    }


def render(config: dict) -> str:
    steps = config["intermediate_steps"]
    valid_order = steps.index("verify-api-key") < steps.index("spike-arrest")
    faults = config["faults"]
    return "\n".join([
        "APIGEE ARCHITECTURE LAB — CENÁRIOS HTTP ILUSTRATIVOS",
        "SEM REDE / SEM APIGEE / SEM BACKEND. NÃO SÃO RESPOSTAS OBSERVADAS.",
        "",
        "01 GET " + config["basic_path"] + "/",
        "   BasePath → RouteRule → TargetEndpoint; resposta de negócio NÃO demonstrada.",
        "02 GET " + config["intermediate_path"] + "/ com API key inválida",
        "   VerifyAPIKey → falha padrão HTTP 401 (InvalidApiKey; depende de runtime).",
        "   SpikeArrest não executa nesta falha." if valid_order else
        "   ATENÇÃO: ordem de policies diferente da documentada.",
        "03 GET " + config["intermediate_path"] + "/ com API key válida",
        "   SpikeArrest " + config["spike_rate"] + " (rajadas) → Quota " +
        str(config["quota_limit"]) + "/" + config["quota_interval"] +
        " " + config["quota_unit"] + " por consumer key.",
        "   GET / → x-api-operation: list-orders na requisição ao backend.",
        "04 Taxa ou quota excedida (se a policy for alcançada)",
        "   SpikeArrestViolation / QuotaViolation → HTTP 429 condicional.",
        "05 GET " + config["advanced_path"] + "/ com JWT inválido",
        "   JWT.failed → " + str(faults["assign-auth-fault"]["status"]) +
        " / " + faults["assign-auth-fault"]["body"]["error"] + " (configurado).",
        "06 JWT válido; falha de conexão ao target",
        "   DefaultFaultRule target → " + str(faults["assign-target-fault"]["status"]) +
        " / " + faults["assign-target-fault"]["body"]["error"] + " (condicional).",
        "07 Backend real hipotético retorna HTTP 404",
        "   success.codes: " + config["success_codes"] +
        " → mantém 404 com payload sanitizado.",
        "08 Falha não tratada no ProxyEndpoint",
        "   DefaultFaultRule proxy → " + str(faults["assign-default-fault"]["status"]) +
        " / " + faults["assign-default-fault"]["body"]["error"] + ".",
        "",
        "Explicação e pré-condições: docs/pt-br/http-scenarios.md",
        "Validação estrutural: python scripts/validate_bundles.py",
    ])


def main() -> None:
    print(render(read_config()))


if __name__ == "__main__":
    main()
