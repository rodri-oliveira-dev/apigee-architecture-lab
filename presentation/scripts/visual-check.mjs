import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const presentationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(presentationRoot, "dist", "visual-check");
const url = process.env.PRESENTATION_URL ?? "http://127.0.0.1:8000";
// Limites em pixels efetivos depois que o Reveal.js escala a tela de 1280x720.
const viewports = [
  { width: 1920, height: 1080, primaryMinPx: 15, secondaryMinPx: 12 },
  { width: 1366, height: 768, primaryMinPx: 12, secondaryMinPx: 10 },
  { width: 1280, height: 720, primaryMinPx: 11, secondaryMinPx: 10 },
  { width: 1024, height: 768, primaryMinPx: 10, secondaryMinPx: 8 }
];

mkdirSync(outputRoot, { recursive: true });
const failures = [];
const results = [];
// GitHub-hosted runners não oferecem o sandbox de namespaces necessário ao Chromium.
// Desabilite-o somente no ambiente efêmero de CI, nunca na execução local.
const browser = await puppeteer.launch({
  headless: "shell",
  args: process.env.CI === "true" ? ["--no-sandbox", "--disable-setuid-sandbox"] : []
});
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  await page.setViewport({ width: viewports[0].width, height: viewports[0].height, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForFunction(() => globalThis.Reveal?.isReady());
  await page.evaluate(() => Reveal.configure({ transition: "none", backgroundTransition: "none" }));
  const slideCount = await page.evaluate(() => Reveal.getTotalSlides());
  if (slideCount !== 14) failures.push("Reveal.js renderizou " + slideCount + " slides; esperados: 14");

  // Testa notas uma vez; não devem ser exibidas na projeção.
  try {
    const popupPromise = new Promise((resolvePopup, rejectPopup) => {
      const timeout = setTimeout(() => rejectPopup(new Error("Speaker View não abriu após pressionar S")), 10000);
      page.once("popup", (popup) => {
        clearTimeout(timeout);
        resolvePopup(popup);
      });
    });
    await page.keyboard.press("s");
    const speakerView = await popupPromise;
    try {
      await speakerView.waitForSelector(".speaker-controls-notes", { timeout: 10000 });
      await speakerView.waitForFunction(
        () => document.querySelector(".speaker-controls-notes")?.textContent.includes("Mensagem principal"),
        { timeout: 10000 }
      );
    } finally {
      await speakerView.close();
    }
  } catch (error) {
    failures.push("Speaker View: " + error.message);
  }

  for (const viewport of viewports) {
    const viewportId = viewport.width + "x" + viewport.height;
    const screenshotDir = join(outputRoot, viewportId);
    mkdirSync(screenshotDir, { recursive: true });
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });
    await page.evaluate(() => Reveal.layout());

    for (let index = 0; index < slideCount; index += 1) {
      await page.evaluate((slideIndex) => Reveal.slide(slideIndex), index);
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      // Aguarda imagens locais para não sinalizar falsos erros de carregamento.
      await page.evaluate(async () => {
        const active = document.querySelector(".reveal .slides section.present");
        const images = [...active.querySelectorAll("img")].filter((img) => {
          const src = new URL(img.src, location.href);
          return src.origin === location.origin;
        });
        await Promise.all(images.map((img) => img.decode().catch(() => {})));
      });
      const metrics = await page.evaluate((limits) => {
        const slide = document.querySelector(".reveal .slides section.present");
        if (!slide) return { error: "slide ativo não encontrado" };
        const slideRect = slide.getBoundingClientRect();
        const scale = Reveal.getScale();
        const visible = [...slide.querySelectorAll("*")].filter((element) => {
          const style = getComputedStyle(element);
          return !element.closest("aside.notes") &&
            style.display !== "none" && style.visibility !== "hidden" &&
            Number(style.opacity) > 0;
        });
        const outside = visible.filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 &&
            (rect.left < slideRect.left - 2 || rect.right > slideRect.right + 2 ||
             rect.top < slideRect.top - 2 || rect.bottom > slideRect.bottom + 2);
        });
        const isVisibleText = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return !element.closest("aside.notes") && style.display !== "none" &&
            style.visibility !== "hidden" && Number(style.opacity) > 0 &&
            rect.width > 0 && rect.height > 0 && element.textContent.trim().length > 0;
        };
        const primary = "h1,h2,h3,.about-bio,.about-role,.problem-card strong,.compare-card p,.stack-cards strong,.responsibility-stack strong,.guardrails strong,.takeaway,.questions-content p";
        const secondary = ".eyebrow,.source-line,.legend-row span,.flow-notes span,.problem-card small,.guardrails small,.responsibility-stack small,.responsibility-stack span,.pipeline span,.pipeline b,.demo-path span,.demo-path small,.repo-links a,.profile-links a,.references span,.references a,.question-link a";
        const undersized = [];
        for (const [selector, minimum] of [[primary, limits.primaryMinPx], [secondary, limits.secondaryMinPx]]) {
          for (const element of slide.querySelectorAll(selector)) {
            if (!isVisibleText(element)) continue;
            const actualSize = parseFloat(getComputedStyle(element).fontSize) * scale;
            if (actualSize + 0.15 < minimum) {
              undersized.push({
                element: element.tagName.toLowerCase(),
                text: element.textContent.trim().replace(/\s+/g, " ").slice(0, 55),
                px: Number(actualSize.toFixed(1)),
                minPx: minimum
              });
            }
          }
        }
        const clipped = visible.filter((element) => {
          const style = getComputedStyle(element);
          return (style.overflowX === "hidden" || style.overflowX === "clip") &&
            element.scrollWidth > element.clientWidth + 2;
        });
        const missingLocalImages = [...slide.querySelectorAll("img")].filter((img) => {
          const src = new URL(img.src, location.href);
          return src.origin === location.origin && (!img.complete || img.naturalWidth === 0);
        });
        return {
          scale: Number(scale.toFixed(3)),
          horizontalOverflow: slide.scrollWidth > slide.clientWidth + 2,
          verticalOverflow: slide.scrollHeight > slide.clientHeight + 8,
          outside: outside.slice(0, 5).map((element) => element.tagName.toLowerCase()),
          clipped: clipped.slice(0, 5).map((element) => element.tagName.toLowerCase()),
          undersized: undersized.slice(0, 5),
          missingLocalImages: missingLocalImages.map((img) => img.getAttribute("src")),
          notesVisible: [...slide.querySelectorAll("aside.notes")].some((note) => getComputedStyle(note).display !== "none")
        };
      }, viewport);

      const issues = [
        metrics.error,
        metrics.horizontalOverflow && "overflow horizontal",
        metrics.verticalOverflow && "overflow vertical",
        metrics.outside?.length && "elementos fora do slide: " + metrics.outside.join(", "),
        metrics.clipped?.length && "conteúdo truncado: " + metrics.clipped.join(", "),
        metrics.undersized?.length && "texto pequeno: " + JSON.stringify(metrics.undersized),
        metrics.missingLocalImages?.length && "imagens locais inválidas: " + metrics.missingLocalImages.join(", "),
        metrics.notesVisible && "notas visíveis"
      ].filter(Boolean);
      results.push({ viewport: viewportId, slide: index + 1, ...metrics, issues });
      if (issues.length) failures.push(viewportId + " / slide " + (index + 1) + ": " + issues.join("; "));
      await page.screenshot({ path: join(screenshotDir, "slide-" + String(index + 1).padStart(2, "0") + ".png") });
    }
    console.log("Inspeção " + viewportId + ": " + slideCount + " slides verificados.");
  }

  // Valide um carregamento real em mobile, não somente o resize de um deck desktop.
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await mobilePage.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForFunction(() => globalThis.Reveal?.isReady());
  const mobile = await mobilePage.evaluate(() => ({
    configuredWidth: Reveal.getConfig().scrollActivationWidth,
    configuredView: Reveal.getConfig().view,
    scrollView: Reveal.scrollView?.isActive?.() ?? null,
    slides: Reveal.getTotalSlides(),
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    classes: document.querySelector(".reveal")?.className
  }));
  console.log("Mobile 390x844: " + JSON.stringify(mobile));
  const mobileIssues = [];
  if (mobile.configuredWidth !== 768 || mobile.scrollView !== true) {
    mobileIssues.push("modo de rolagem inativo");
  }
  if (mobile.documentWidth > mobile.viewportWidth + 1) {
    mobileIssues.push("overflow horizontal no documento");
  }
  if (mobile.slides !== 14) mobileIssues.push("contagem de slides divergente");
  results.push({ viewport: "390x844", ...mobile, issues: mobileIssues });
  if (mobileIssues.length) {
    failures.push("390x844: " + mobileIssues.join("; ") + " " + JSON.stringify(mobile));
  }
  await mobilePage.screenshot({ path: join(outputRoot, "mobile-390x844.png") });
  await mobilePage.close();
} finally {
  await browser.close();
  writeFileSync(join(outputRoot, "report.json"), JSON.stringify({
    url, expectedSlides: 14, viewports, failures, results
  }, null, 2) + "\n");
}

if (failures.length) {
  console.error("Inspeção visual encontrou " + failures.length + " problema(s):\n- " + failures.join("\n- "));
  process.exitCode = 1;
} else {
  console.log("Inspeção visual aprovada: 14 slides em " + viewports.length + " resoluções, Speaker View, cortes e legibilidade.");
}
