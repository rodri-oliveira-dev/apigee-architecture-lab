"""Consistência estática dos cenários HTTP. Não testa runtime Apigee."""
import subprocess
import sys
import unittest
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from demo_http_scenarios import read_config, render  # noqa: E402


class TestHttpScenarios(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = read_config()
        cls.docs = (ROOT / "docs/pt-br/http-scenarios.md").read_text(encoding="utf-8")

    def test_paths_and_policy_order(self):
        config = self.config
        self.assertEqual(config["basic_path"], "/lab/v1/orders-basic")
        self.assertEqual(config["intermediate_path"], "/lab/v1/orders-intermediate")
        self.assertEqual(config["advanced_path"], "/lab/v1/orders-advanced")
        self.assertEqual(config["intermediate_steps"], [
            "verify-api-key", "remove-api-key", "spike-arrest", "quota", "assign-correlation-id"
        ])

    def test_limits_are_read_from_real_xml(self):
        cfg = self.config
        self.assertEqual(cfg["spike_rate"], "10ps")
        self.assertEqual(cfg["quota_limit"], 100)
        self.assertEqual(cfg["quota_interval"], "1")
        self.assertEqual(cfg["quota_unit"], "minute")
        self.assertEqual(cfg["quota_identifier"], "verifyapikey.verify-api-key.client_id")
        self.assertIn("SpikeArrest 10ps", render(cfg))
        self.assertIn("Quota 100/1 minute", render(cfg))

    def test_explicit_statuses_and_payloads(self):
        expected = {
            "assign-auth-fault": (401, "unauthorized"),
            "assign-target-fault": (502, "bad_gateway"),
            "assign-default-fault": (500, "gateway_error"),
        }
        for policy, (status, error) in expected.items():
            with self.subTest(policy=policy):
                self.assertEqual(self.config["faults"][policy]["status"], status)
                self.assertEqual(self.config["faults"][policy]["body"]["error"], error)

    def test_sanitization_does_not_override_http_status(self):
        target = ET.parse(
            ROOT / "examples/03-advanced/orders-advanced/apiproxy/targets/default.xml"
        ).getroot()
        self.assertIn("4xx", self.config["success_codes"])
        self.assertIn("5xx", self.config["success_codes"])
        step = target.find("PreFlow/Response/Step")
        self.assertEqual(step.findtext("Name"), "sanitize-backend-error")
        self.assertIn("response.status.code", step.findtext("Condition"))
        sanitizer = ET.parse(
            ROOT / "examples/03-advanced/orders-advanced/apiproxy/policies/sanitize-backend-error.xml"
        ).getroot()
        self.assertIsNone(sanitizer.find("Set/StatusCode"))

    def test_docs_explicitly_disclaim_runtime(self):
        self.assertIn("Não são testes reais de execução", self.docs)
        self.assertIn("api.example.invalid", self.docs)
        self.assertIn("não emula o Apigee", self.docs)
        for code in ("401", "429", "502", "404", "500"):
            self.assertIn(code, self.docs)

    def test_offline_cli_output(self):
        result = subprocess.run(
            [sys.executable, "scripts/demo_http_scenarios.py"],
            cwd=ROOT, text=True, capture_output=True, check=True, timeout=10
        )
        self.assertIn("SEM REDE / SEM APIGEE", result.stdout)
        self.assertIn("JWT.failed", result.stdout)
        self.assertIn("HTTP 429", result.stdout)


if __name__ == "__main__":
    unittest.main()
