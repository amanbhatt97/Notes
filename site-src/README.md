# DS · ML Interview Notes — source

The live site is a **single `index.html` at the repo root**, but you never edit that
file directly. It is **generated** from the modular source files in this `site-src/`
folder by `build.py`, and GitHub Actions runs that build automatically on every push.

## Why it works this way

The site is one big file (~1.4 MB). Editing it directly is error-prone — a bad edit
can corrupt the whole page. Splitting it into small source files means an edit to one
note can only break that note's file, and `build.py` validates the combined JavaScript
before it ever ships.

## Repo layout

```
index.html            ← GENERATED. Do not edit. Overwritten by every build.
.github/workflows/
    deploy.yml         ← GitHub Actions: builds + deploys on push to main
site-src/
    build.py           ← the bundler. Concatenates everything into ../index.html
    shell.html         ← HTML skeleton with placeholders
    styles.css         ← all CSS
    data.js            ← CATEGORIES + ROADMAP_PHASES + SYLLABUS (the roadmap data)
    app.js             ← all functions + the boot sequence
    notes/
        python.js      ← TOPIC_CONTENT entries for the Python phase
        ml.js          ← Machine Learning notes
        dl.js          ← Deep Learning notes
        genai.js       ← Generative AI notes
        dsa.js         ← DSA notes
    README.md          ← this file
```

## How to edit

- **Change a note's content** → edit the relevant file in `notes/`. Each note is a
  key in an `Object.assign(TOPIC_CONTENT, { ... })` call.
- **Add a brand-new note** → add a key to the appropriate `notes/*.js` file, then add
  a matching entry (with `"note": "your_key"`) in the SYLLABUS array inside `data.js`
  so it shows up in the home-page roadmap.
- **Change the roadmap / syllabus** → edit `data.js`.
- **Change styling** → edit `styles.css`.
- **Change app behaviour** → edit `app.js`.

## How to deploy

Just push to `main`:

```
git add .
git commit -m "your message"
git push
```

GitHub Actions then:
1. Runs `python build.py`, which validates the combined JS with `node --check`
   and writes `index.html` at the repo root.
2. Publishes the result to GitHub Pages.

If the JS is broken, the build **fails and nothing deploys** — the previous live
version stays up. Check the **Actions** tab for build status.

## Building locally (optional)

You don't have to, but if you want to preview before pushing:

```
cd site-src
python build.py      # writes ../index.html
```

Then open `index.html` in a browser.
