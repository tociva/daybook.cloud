# daybook.cloud

Website contents for daybook.cloud.

# Daybook.Cloud Build System - Header/Footer Partials

This build system uses a partial-based architecture to keep the shared header and footer DRY while generating complete static HTML pages.

## How It Works

### 1. Partials

The shared document shell lives in `partials/`:

- `partials/top-section.html` contains the document opening, `<head>`, and `<header>`.
- `partials/bottom-section.html` contains the `<footer>` and closing document tags.

Update these files once, and all generated pages inherit the shared layout.

### 2. Content Files

Create page sources with a `.htm` extension. Each source file declares metadata and wraps its page body between Daybook markers:

```html
<!-- title: Your Page Title -->
<!-- description: Your page description for meta tags. -->

<!-- daybook top section -->

<main>
  <!-- Page content here -->
</main>

<!-- daybook bottom section -->
```

### 3. Token Replacement

The top partial contains placeholder tokens that are replaced for each generated page:

- `<!-- daybook-page-title -->` is replaced with the page `title`.
- `<!-- daybook-page-description -->` is replaced with the page `description`.
- `<!-- daybook-page-canonical -->` is replaced with the generated canonical URL under `https://daybook.cloud/`.

If a page does not specify a title or description, Daybook.Cloud defaults are used.

### 4. Generate HTML Files

Run the build script:

```bash
node html.mjs
```

The script:

- Scans `.htm` files outside skipped directories.
- Extracts metadata and body content.
- Combines the top partial, page body, and bottom partial.
- Generates missing `.html` files.
- Skips existing `.html` files by design.

To regenerate tracked output files, delete the stale `.html` files first and run `node html.mjs`.

## Setup

Expected structure:

```text
daybook.cloud/
├── partials/
│   ├── top-section.html
│   └── bottom-section.html
├── html.mjs
├── index.htm
├── features.htm
├── services.htm
├── security.htm
├── about.htm
└── contact.htm
```

Start a local static server:

```bash
python3 -m http.server
```

Then open `http://127.0.0.1:8000/`.

## Skipped Directories

The build skips:

- `node_modules/`
- `.git/`
- `dist/`
- `.cache/`
- `.vercel/`
- `partials/`

## Quick Reference

| File | Purpose |
|------|---------|
| `partials/top-section.html` | Shared head and header |
| `partials/bottom-section.html` | Shared footer and closing tags |
| `html.mjs` | Static HTML generator |
| `*.htm` | Source content files |
| `*.html` | Generated static output |
