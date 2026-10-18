import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const presentationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(presentationRoot, "dist", "visual-check");
const url = process.env.PRESENTATION_URL ?? "http://127.0.0.1:8000";
mkdirSync(outputRoot, { recursive: true });

const browser = await puppeteer.launch({ headless: "shell" });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.waitForFunction(() => globalThis.Reveal?.isReady());
await page.evaluate(() => Reveal.configure({ transition: "none", backgroundTransition: "none" }));

const slideCount = await page.evaluate(() => Reveal.getTotalSlides());
const failures = [];

try {
  const popupPromise = new Promise((resolvePopup, rejectPopup) => {
    const timeout = setTimeout(() => rejectPopup(new Error("Speaker View não abriu após pressionar S")), 5000);
    page.once("popup", (popup) => {
      clearTimeout(timeout);
      resolvePopup(popup);
    });
  });
  await page.keyboard.press("s");
  const speakerView = await popupPromise;
  await speakerView.waitForSelector(".speaker-controls-notes", { timeout: 5000 });
  await speakerView.waitForFunction(
    () => document.querySelector(".speaker-controls-notes")?.textContent.includes("Mensagem principal"),
    { timeout: 5000 }
  );
  await speakerView.close();
} catch (error) {
  failures.push(`Speaker View: ${error.message}`);
}

for (let index = 0; index < slideCount; index += 1) {
  await page.evaluate((slideIndex) => Reveal.slide(slideIndex), index);
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 80));
  const metrics = await page.evaluate(() => {
    const slide = document.querySelector(".reveal .slides section.present");
    const notes = [...slide.querySelectorAll("aside.notes")];
    const slideRect = slide.getBoundingClientRect();
    const visible = [...slide.querySelectorAll("*")].filter((element) => {
      const style = getComputedStyle(element);
      return !element.closest("aside.notes") && style.display !== "none" && style.visibility !== "hidden";
    });
    const outside = visible.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (
        rect.left < slideRect.left - 2 || rect.right > slideRect.right + 2 ||
        rect.top < slideRect.top - 2 || rect.bottom > slideRect.bottom + 2
      );
    });
    return {
      horizontalOverflow: slide.scrollWidth > slide.clientWidth + 2,
      verticalOverflow: slide.scrollHeight > slide.clientHeight + 8,
      dimensions: `${slide.scrollWidth}x${slide.scrollHeight}/${slide.clientWidth}x${slide.clientHeight}`,
      outside: outside.slice(0, 5).map((element) => element.tagName.toLowerCase() + (element.className ? `.${String(element.className).split(" ").join(".")}` : "")),
      notesVisible: notes.some((note) => getComputedStyle(note).display !== "none")
    };
  });
  if (metrics.horizontalOverflow || metrics.verticalOverflow || metrics.outside.length || metrics.notesVisible) {
    failures.push(`slide ${index + 1}: ${JSON.stringify(metrics)}`);
  }
  await page.screenshot({ path: join(outputRoot, `slide-${String(index + 1).padStart(2, "0")}.png`) });
}

await browser.close();

if (failures.length) {
  console.error(`Inspeção visual encontrou ${failures.length} problema(s):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Inspeção visual aprovada: ${slideCount} slides em 1920x1080; capturas em presentation/dist/visual-check/.`);
