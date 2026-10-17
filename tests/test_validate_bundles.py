from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

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


if __name__ == "__main__":
    unittest.main()
