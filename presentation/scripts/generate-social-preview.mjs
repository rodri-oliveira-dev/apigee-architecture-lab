import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import puppeteer from "puppeteer";

// Prévia Open Graph gerada localmente (nenhuma fonte ou imagem remota).
const root = resolve(process.argv[2] ?? ".");
const output = join(root, "assets", "images", "social-preview.png");
mkdirSync(join(root, "assets", "images"), { recursive: true });
const pageHtml = [
  "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'>",
  "<style>*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px}",
  "body{background:radial-gradient(circle at 88% 12%,#1c4560 0,transparent 45%),linear-gradient(130deg,#071019,#0d2536);color:#eef6fb;font-family:Arial,Helvetica,sans-serif;overflow:hidden}",
  ".eyebrow{position:absolute;left:74px;top:70px;color:#36d7e7;font-size:23px;font-weight:700;letter-spacing:4px}",
  "h1{position:absolute;left:72px;top:125px;margin:0;font-size:76px;line-height:1.12;letter-spacing:-2px}",
  "h1 strong{font-size:98px;color:#36d7e7}p{position:absolute;left:77px;top:351px;font-size:29px;color:#c4dae7}",
  ".pill{position:absolute;top:436px;padding:17px 23px;background:#152d3e;border:1px solid #3f6174;border-radius:13px;font-size:19px;font-weight:bold}",
  ".footer{position:absolute;left:77px;bottom:48px;color:#9cb0c0;font-size:18px;letter-spacing:1px}",
  ".panel{position:absolute;top:158px;left:835px;width:275px;padding:26px 23px;background:#102a3b;border:1px solid #517589;border-radius:24px}",
  ".node{padding:17px 9px;text-align:center;border:1px solid #36d7e7;border-radius:13px;font-size:20px;color:#e6faff}",
  ".node:last-child{border-color:#9b7cff;color:#ede8ff}.arrow{text-align:center;color:#36d7e7;font-size:36px;padding:7px}",
  "</style></head><body>",
  "<div class='eyebrow'>ARQUITETURA DE APIs · LABORATÓRIO</div>",
  "<h1>Google Cloud<br><strong>Apigee</strong></h1>",
  "<p>Do proxy mínimo à governança aplicada</p>",
  "<div class='pill' style='left:77px'>API Gateway</div>",
  "<div class='pill' style='left:275px'>Segurança</div>",
  "<div class='pill' style='left:448px'>Governança</div>",
  "<div class='panel'><div class='node'>ProxyEndpoint</div><div class='arrow'>↓</div><div class='node'>TargetEndpoint</div></div>",
  "<div class='footer'>APIGEE ARCHITECTURE LAB &nbsp; · &nbsp; RODRIGO DE OLIVEIRA</div>",
  "</body></html>"
].join("");
const browser = await puppeteer.launch({
  headless: "shell",
  args: process.env.CI === "true" ? ["--no-sandbox", "--disable-setuid-sandbox"] : []
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(pageHtml, { waitUntil: "load" });
  await page.screenshot({ path: output, type: "png" });
} finally {
  await browser.close();
}
console.log("Prévia Open Graph gerada: " + output);
