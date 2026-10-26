import { readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const catalogPath = new URL("../src/features/rules/catalog.ts", import.meta.url);
const outputPath = new URL("../docs/ZASADY_DO_AKTUALIZACJI.md", import.meta.url);

let source = await readFile(catalogPath, "utf8");
source = ts.transpileModule(source.replace(/export const /g, "const "), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText.replace(/export \{\};\s*$/, "");

const { categories, rules } = new Function(
  `${source}\nreturn { categories, rules };`,
)();
const verifiedOn = "2026-10-26";
const contentVersion = "PFP/FIPJP-2026-10-26";

const rulesByCategory = new Map(
  categories.map((category) => [
    category.id,
    rules.filter((rule) => rule.category === category.id),
  ]),
);

const markdown = [
  "# Zasady do aktualizacji",
  "",
  `Wersja treści: ${contentVersion}. Data ostatniej weryfikacji: ${verifiedOn}.`,
  "",
  "Każda mini-sekcja zachowuje aktualny tytuł, krótką odpowiedź, wyjaśnienie, zalecane działanie i podstawę źródłową.",
  "",
  ...categories.flatMap((category) => {
    const categoryRules = rulesByCategory.get(category.id) ?? [];
    if (categoryRules.length === 0) return [];

    return [
      `## ${category.title}`,
      "",
      category.description,
      "",
      ...categoryRules.flatMap((rule) => [
        `### ${rule.title}`,
        "",
        `**Krótka odpowiedź:** ${rule.shortAnswer}`,
        "",
        `**Wyjaśnienie:** ${rule.explanation}`,
        "",
        `**Co zrobić:** ${rule.action}`,
        "",
        `**Podstawa:** ${rule.sourceDocument}, ${rule.sourceArticle} (${rule.sourceDate}).`,
        "",
      ]),
    ];
  }),
].join("\n");

await writeFile(outputPath, `${markdown}\n`, "utf8");
