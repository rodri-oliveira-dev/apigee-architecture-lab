#!/usr/bin/env python3
"""Static, dependency-free checks for the educational Apigee bundles.

These checks intentionally do not claim schema or runtime equivalence with Apigee.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path
import xml.etree.ElementTree as ET


BUNDLE_KINDS = {
    "apiproxy": ("APIProxy", "proxies", "ProxyEndpoint"),
    "sharedflowbundle": ("SharedFlowBundle", "sharedflows", "SharedFlow"),
}

REQUIRED_DOCS = (
    "README.md",
    "README.en.md",
    "docs/pt-br/architecture.md",
    "docs/pt-br/validation.md",
    "docs/pt-br/presentation-guide.md",
    "docs/pt-br/speaker-script.md",
    "docs/en/architecture.md",
    "docs/en/validation.md",
    "docs/en/presentation-guide.md",
    "examples/01-basic/README.md",
    "examples/02-intermediate/README.md",
    "examples/03-advanced/README.md",
)


@dataclass(frozen=True, order=True)
class Finding:
    code: str
    path: Path
    message: str

    def render(self, root: Path) -> str:
        try:
            display = self.path.relative_to(root)
        except ValueError:
            display = self.path
        return f"ERROR [{self.code}] {display}: {self.message}"


def parse_xml(path: Path, findings: list[Finding]) -> ET.Element | None:
    try:
        return ET.parse(path).getroot()
    except (ET.ParseError, OSError) as exc:
        findings.append(Finding("XML001", path, f"invalid XML: {exc}"))
        return None


def discover_bundles(examples_root: Path) -> list[Path]:
    return sorted(
        path
        for path in examples_root.rglob("*")
        if path.is_dir() and path.name in BUNDLE_KINDS
    )


def validate_bundle(bundle: Path, shared_flow_names: set[str]) -> list[Finding]:
    findings: list[Finding] = []
    descriptor_tag, endpoint_dir_name, endpoint_tag = BUNDLE_KINDS[bundle.name]
    xml_files = sorted(bundle.rglob("*.xml"))
    parsed = {path: parse_xml(path, findings) for path in xml_files}

    descriptors = [
        path for path in bundle.glob("*.xml")
        if parsed.get(path) is not None and parsed[path].tag == descriptor_tag
    ]
    if len(descriptors) != 1:
        findings.append(Finding(
            "BUNDLE001", bundle,
            f"expected exactly one top-level {descriptor_tag} descriptor; found {len(descriptors)}",
        ))

    if bundle.name == "sharedflowbundle" and len(descriptors) == 1:
        descriptor = parsed[descriptors[0]]
        declared = {
            (node.text or "").strip()
            for node in descriptor.findall("./SharedFlows/SharedFlow")
            if (node.text or "").strip()
        }
        if not declared:
            findings.append(Finding(
                "BUNDLE003", descriptors[0],
                "SharedFlowBundle must declare one SharedFlows/SharedFlow entry",
            ))

    endpoint_dir = bundle / endpoint_dir_name
    endpoint_roots = [
        (path, parsed.get(path)) for path in sorted(endpoint_dir.glob("*.xml"))
    ] if endpoint_dir.is_dir() else []
    valid_endpoints = [(path, root) for path, root in endpoint_roots if root is not None and root.tag == endpoint_tag]
    if not valid_endpoints:
        findings.append(Finding(
            "BUNDLE002", endpoint_dir,
            f"at least one {endpoint_tag} file is required",
        ))

    policy_dir = bundle / "policies"
    policy_names: dict[str, Path] = {}
    policy_roots: list[tuple[Path, ET.Element]] = []
    if policy_dir.is_dir():
        for path in sorted(policy_dir.glob("*.xml")):
            root = parsed.get(path)
            if root is None:
                continue
            policy_roots.append((path, root))
            name = root.get("name")
            if not name:
                findings.append(Finding("POLICY001", path, "policy has no name attribute"))
                continue
            if name != path.stem:
                findings.append(Finding(
                    "POLICY002", path,
                    f"policy name '{name}' must match file name '{path.stem}'",
                ))
            if name in policy_names:
                findings.append(Finding(
                    "POLICY003", path,
                    f"duplicate policy name '{name}' (first declared in {policy_names[name].name})",
                ))
            else:
                policy_names[name] = path

    for endpoint_path, endpoint_root in valid_endpoints:
        for name_node in endpoint_root.findall(".//Step/Name"):
            reference = (name_node.text or "").strip()
            if reference and reference not in policy_names:
                findings.append(Finding(
                    "STEP001", endpoint_path,
                    f"Step references missing policy '{reference}'",
                ))

    if bundle.name == "apiproxy":
        target_dir = bundle / "targets"
        targets: set[str] = set()
        valid_targets: list[tuple[Path, ET.Element]] = []
        if not target_dir.is_dir():
            findings.append(Finding("ROUTE001", target_dir, "targets directory is required by this lab"))
        else:
            for path in sorted(target_dir.glob("*.xml")):
                root = parsed.get(path)
                if root is not None and root.tag == "TargetEndpoint" and root.get("name"):
                    targets.add(root.get("name", ""))
                    valid_targets.append((path, root))
        for target_path, target_root in valid_targets:
            for name_node in target_root.findall(".//Step/Name"):
                reference = (name_node.text or "").strip()
                if reference and reference not in policy_names:
                    findings.append(Finding(
                        "STEP001", target_path,
                        f"Step references missing policy '{reference}'",
                    ))
        for proxy_path, proxy_root in valid_endpoints:
            route_rules = proxy_root.findall("./RouteRule")
            if not route_rules:
                findings.append(Finding("ROUTE002", proxy_path, "at least one RouteRule is required by this lab"))
            for target_node in proxy_root.findall("./RouteRule/TargetEndpoint"):
                reference = (target_node.text or "").strip()
                if reference not in targets:
                    findings.append(Finding(
                        "ROUTE003", proxy_path,
                        f"RouteRule references missing TargetEndpoint '{reference}'",
                    ))

        for policy_path, policy_root in policy_roots:
            if policy_root.tag == "FlowCallout":
                shared = policy_root.findtext("SharedFlowBundle", default="").strip()
                if not shared:
                    findings.append(Finding("FLOW001", policy_path, "FlowCallout has no SharedFlowBundle"))
                elif shared not in shared_flow_names:
                    findings.append(Finding(
                        "FLOW002", policy_path,
                        f"FlowCallout references unknown shared flow bundle '{shared}'",
                    ))

    return findings


def collect_shared_flow_names(bundles: list[Path]) -> set[str]:
    names: set[str] = set()
    for bundle in bundles:
        if bundle.name != "sharedflowbundle":
            continue
        for descriptor in bundle.glob("*.xml"):
            try:
                root = ET.parse(descriptor).getroot()
            except (ET.ParseError, OSError):
                continue
            if root.tag == "SharedFlowBundle" and root.get("name"):
                names.add(root.get("name", ""))
    return names


def validate_repository(root: Path, check_docs: bool = True) -> list[Finding]:
    root = root.resolve()
    examples_root = root / "examples"
    findings: list[Finding] = []
    bundles = discover_bundles(examples_root) if examples_root.is_dir() else []
    if not bundles:
        findings.append(Finding("REPO001", examples_root, "no apiproxy or sharedflowbundle directories found"))
    shared_flow_names = collect_shared_flow_names(bundles)
    for bundle in bundles:
        findings.extend(validate_bundle(bundle, shared_flow_names))
    if check_docs:
        for relative_path in REQUIRED_DOCS:
            path = root / relative_path
            if not path.is_file() or not path.read_text(encoding="utf-8").strip():
                findings.append(Finding("DOC001", path, "required non-empty documentation file is missing"))
    return sorted(set(findings))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate the lab's Apigee bundles and documentation.")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--skip-docs", action="store_true", help="skip required documentation checks")
    args = parser.parse_args(argv)

    findings = validate_repository(args.root, check_docs=not args.skip_docs)
    if findings:
        for finding in findings:
            print(finding.render(args.root.resolve()))
        print(f"Validation failed with {len(findings)} error(s).")
        return 1
    bundles = discover_bundles(args.root.resolve() / "examples")
    print(f"Validation passed: {len(bundles)} bundle(s), no statically verifiable errors.")
    print("Note: static checks do not replace import, deployment, or runtime validation in Apigee.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
