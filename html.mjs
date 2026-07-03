#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PARTIALS_DIR = path.join(ROOT, "partials");

const TOP_PATH = path.join(PARTIALS_DIR, "top-section.html");
const BOTTOM_PATH = path.join(PARTIALS_DIR, "bottom-section.html");

const START_MARKER = "<!-- daybook top section -->";
const END_MARKER = "<!-- daybook bottom section -->";

const TITLE_TOKEN = "<!-- daybook-page-title -->";
const DESC_TOKEN = "<!-- daybook-page-description -->";
const CANONICAL_TOKEN = "<!-- daybook-page-canonical -->";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".cache", ".vercel", "partials"]);

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, out);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".htm")) out.push(full);
  }
  return out;
}

function extractMeta(src) {
  const title = src.match(/<!--\s*title:\s*(.*?)\s*-->/)?.[1]?.trim() || null;
  const description =
    src.match(/<!--\s*description:\s*(.*?)\s*-->/)?.[1]?.trim() || null;

  return { title, description };
}

function stripMetaComments(src) {
  // Remove only our meta comments; keep other HTML comments if you want.
  return src
    .replace(/<!--\s*title:\s*.*?-->\s*\n?/g, "")
    .replace(/<!--\s*description:\s*.*?-->\s*\n?/g, "");
}

function ensureTokensExist(top) {
  if (!top.includes(TITLE_TOKEN)) {
    throw new Error(`Missing ${TITLE_TOKEN} token in partials/top-section.html`);
  }
  if (!top.includes(DESC_TOKEN)) {
    throw new Error(`Missing ${DESC_TOKEN} token in partials/top-section.html`);
  }
  if (!top.includes(CANONICAL_TOKEN)) {
    throw new Error(`Missing ${CANONICAL_TOKEN} token in partials/top-section.html`);
  }
}

function canonicalFor(outPath) {
  const rel = path.relative(ROOT, outPath).split(path.sep).join("/");
  if (rel === "index.html") return "https://daybook.cloud/";
  return `https://daybook.cloud/${rel}`;
}

function generateOne(filePath, topBase, bottomBase) {
  const outPath = filePath.replace(/\.htm$/, ".html");

  // Only generate if not present (your requirement)
  if (fs.existsSync(outPath)) return null;

  const src = read(filePath);

  if (!src.includes(START_MARKER) || !src.includes(END_MARKER)) {
    throw new Error(
      `Missing markers in ${path.relative(ROOT, filePath)}\n` +
        `Expected:\n  ${START_MARKER}\n  ${END_MARKER}`
    );
  }

  const meta = extractMeta(src);

  const body = stripMetaComments(src)
    .replace(START_MARKER, "")
    .replace(END_MARKER, "")
    .trim();

  // If a page doesn't specify title/description, fall back to sane defaults
  const title =
    meta.title || "Daybook.Cloud - Simple Bookkeeping and Finance Management";
  const description =
    meta.description ||
    "Daybook.Cloud helps businesses manage bookkeeping, invoices, ledgers, branches, financial years, reports, and daily finance workflows.";
  const canonical = canonicalFor(outPath);

  const top = topBase
    .split(TITLE_TOKEN)
    .join(title)
    .split(DESC_TOKEN)
    .join(description)
    .split(CANONICAL_TOKEN)
    .join(canonical);
  const html = `${top}\n${body}\n${bottomBase}\n`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf8");

  return outPath;
}

function main() {
  const topBase = read(TOP_PATH).trim();
  const bottomBase = read(BOTTOM_PATH).trim();

  ensureTokensExist(topBase);

  const files = walk(ROOT).filter((f) => !f.startsWith(PARTIALS_DIR));

  let count = 0;
  for (const f of files) {
    const out = generateOne(f, topBase, bottomBase);
    if (out) {
      console.log("Generated:", path.relative(ROOT, out));
      count++;
    }
  }

  console.log(count ? `Done. ${count} file(s) generated.` : "No new files to generate.");
}

main();
