from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
import xml.etree.ElementTree as ET

from scripts.validate_bundles import validate_repository


DESCRIPTOR = '<APIProxy revision="1" name="sample"/>'
PROXY = '''<ProxyEndpoint name="default">
  <PreFlow name="PreFlow"><Request><Step><Name>check-key</Name></Step></Request><Response/></PreFlow>
  <Flows/><PostFlow name="PostFlow"><Request/><Response/></PostFlow>
  <HTTPProxyConnection><BasePath>/sample</BasePath></HTTPProxyConnection>
  <RouteRule name="default"><TargetEndpoint>default</TargetEndpoint></RouteRule>
</ProxyEndpoint>'''
TARGET = '''<TargetEndpoint name="default">
  <PreFlow name="PreFlow"><Request/><Response/></PreFlow><Flows/>
  <PostFlow name="PostFlow"><Request/><Response/></PostFlow>
  <HTTPTargetConnection><URL>https://example.invalid</URL></HTTPTargetConnection>
</TargetEndpoint>'''
POLICY = '<VerifyAPIKey name="check-key"><APIKey ref="request.header.x-api-key"/></VerifyAPIKey>'


class ValidatorTests(unittest.TestCase):
    def make_bundle(self, root: Path) -> Path:
        bundle = root / "examples" / "sample" / "apiproxy"
        (bundle / "proxies").mkdir(parents=True)
        (bundle / "targets").mkdir()
        (bundle / "policies").mkdir()
        (bundle / "sample.xml").write_text(DESCRIPTOR, encoding="utf-8")
        (bundle / "proxies" / "default.xml").write_text(PROXY, encoding="utf-8")
        (bundle / "targets" / "default.xml").write_text(TARGET, encoding="utf-8")
        (bundle / "policies" / "check-key.xml").write_text(POLICY, encoding="utf-8")
        return bundle

    def codes(self, root: Path) -> list[str]:
        return [item.code for item in validate_repository(root, check_docs=False)]

    def test_accepts_consistent_bundle(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_bundle(root)
            self.assertEqual([], self.codes(root))

    def test_reports_malformed_xml(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = self.make_bundle(root)
            (bundle / "policies" / "check-key.xml").write_text("<VerifyAPIKey>", encoding="utf-8")
            self.assertIn("XML001", self.codes(root))

    def test_reports_missing_step_policy(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = self.make_bundle(root)
            (bundle / "policies" / "check-key.xml").unlink()
            self.assertIn("STEP001", self.codes(root))

    def test_reports_missing_route_target(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = self.make_bundle(root)
            (bundle / "targets" / "default.xml").write_text(TARGET.replace('name="default"', 'name="other"'), encoding="utf-8")
            self.assertIn("ROUTE003", self.codes(root))

    def test_reports_missing_policy_referenced_by_target_step(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = self.make_bundle(root)
            target_with_step = TARGET.replace(
                '<Request/>',
                '<Request><Step><Name>missing-target-policy</Name></Step></Request>',
                1,
            )
            (bundle / "targets" / "default.xml").write_text(target_with_step, encoding="utf-8")
            self.assertIn("STEP001", self.codes(root))

    def test_reports_policy_filename_mismatch(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = self.make_bundle(root)
            policy = bundle / "policies" / "check-key.xml"
            policy.write_text(POLICY.replace('name="check-key"', 'name="different"'), encoding="utf-8")
            self.assertIn("POLICY002", self.codes(root))

    def test_reports_unknown_flow_callout_bundle(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = self.make_bundle(root)
            callout = '<FlowCallout name="call-missing"><SharedFlowBundle>missing</SharedFlowBundle></FlowCallout>'
            (bundle / "policies" / "call-missing.xml").write_text(callout, encoding="utf-8")
            self.assertIn("FLOW002", self.codes(root))

    def test_reports_missing_required_document(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_bundle(root)
            self.assertIn("DOC001", [item.code for item in validate_repository(root)])


class IntermediateBundleContractTests(unittest.TestCase):
    root = Path(__file__).resolve().parents[1]
    bundle = root / "examples/02-intermediate/apiproxy"

    def test_api_key_is_verified_then_removed_before_traffic_policies(self):
        proxy = ET.parse(self.bundle / "proxies/default.xml").getroot()
        steps = [node.text for node in proxy.findall("./PreFlow/Request/Step/Name")]
        self.assertEqual(
            [
                "verify-api-key",
                "remove-api-key",
                "spike-arrest",
                "quota",
                "assign-correlation-id",
            ],
            steps,
        )

        removal = ET.parse(self.bundle / "policies/remove-api-key.xml").getroot()
        self.assertEqual("x-api-key", removal.find("./Remove/Headers/Header").get("name"))

    def test_quota_is_partitioned_by_verified_consumer_key(self):
        quota = ET.parse(self.bundle / "policies/quota.xml").getroot()
        self.assertEqual(
            "verifyapikey.verify-api-key.client_id",
            quota.find("Identifier").get("ref"),
        )

    def test_list_orders_conditional_flow_executes_safe_declarative_step(self):
        proxy = ET.parse(self.bundle / "proxies/default.xml").getroot()
        flow = proxy.find("./Flows/Flow[@name='list-orders']")
        self.assertEqual("assign-list-orders-context", flow.findtext("./Request/Step/Name"))
        self.assertEqual(
            '(proxy.pathsuffix = "/") and (request.verb = "GET")',
            flow.findtext("Condition"),
        )


class AdvancedBundleContractTests(unittest.TestCase):
    root = Path(__file__).resolve().parents[1]
    bundle = root / "examples/03-advanced/orders-advanced/apiproxy"

    def test_bearer_token_is_verified_then_removed_before_shared_flow(self):
        proxy = ET.parse(self.bundle / "proxies/default.xml").getroot()
        steps = [node.text for node in proxy.findall("./PreFlow/Request/Step/Name")]
        self.assertEqual(
            ["verify-jwt", "remove-authorization", "call-shared-security"],
            steps,
        )
        removal = ET.parse(self.bundle / "policies/remove-authorization.xml").getroot()
        self.assertEqual("Authorization", removal.find("./Remove/Headers/Header").get("name"))

    def test_all_jwt_policy_failures_use_authentication_fault(self):
        proxy = ET.parse(
            self.root / "examples/03-advanced/orders-advanced/apiproxy/proxies/default.xml"
        ).getroot()
        condition = proxy.findtext("./FaultRules/FaultRule[@name='jwt-fault']/Condition")
        self.assertEqual("JWT.failed = true", condition)

    def test_target_connection_errors_use_safe_bad_gateway_fault(self):
        target = ET.parse(
            self.root / "examples/03-advanced/orders-advanced/apiproxy/targets/default.xml"
        ).getroot()
        policy = target.findtext("./DefaultFaultRule/Step/Name")
        self.assertEqual("assign-target-fault", policy)
        target_fault = ET.parse(
            self.root / "examples/03-advanced/orders-advanced/apiproxy/policies/assign-target-fault.xml"
        ).getroot()
        self.assertEqual("502", target_fault.findtext("./Set/StatusCode"))

    def test_backend_http_errors_keep_status_and_sanitize_payload(self):
        target = ET.parse(
            self.root / "examples/03-advanced/orders-advanced/apiproxy/targets/default.xml"
        ).getroot()
        self.assertEqual(
            "1xx,2xx,3xx,4xx,5xx",
            target.findtext("./HTTPTargetConnection/Properties/Property[@name='success.codes']"),
        )
        step = target.find("./PreFlow/Response/Step")
        self.assertEqual("sanitize-backend-error", step.findtext("Name"))
        self.assertEqual("response.status.code >= 400", step.findtext("Condition"))

        sanitizer = ET.parse(
            self.root / "examples/03-advanced/orders-advanced/apiproxy/policies/sanitize-backend-error.xml"
        ).getroot()
        self.assertIsNone(sanitizer.find("./Set/StatusCode"))
        self.assertNotIn("fault.", sanitizer.findtext("./Set/Payload"))


if __name__ == "__main__":
    unittest.main()
