#!/usr/bin/env python3
"""
build.py — bundles the modular source files into a single deployable index.html

Source layout:
  shell.html        HTML skeleton with __CSS__, __DATA__, __NOTES__, __APP__ placeholders
  styles.css        all CSS
  data.js           CATEGORIES + ROADMAP_PHASES + SYLLABUS
  notes/*.js        per-phase TOPIC_CONTENT entries (Object.assign into TOPIC_CONTENT)
  app.js            all functions + boot sequence

Output:
  ../index.html     single self-contained file for GitHub Pages

Run:  python build.py
"""
import os, glob, sys, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))

def read(path):
    with open(os.path.join(HERE, path), encoding='utf-8') as f:
        return f.read()

def main():
    # 1. Load the shell template
    shell = read('shell.html')

    # 2. CSS
    css = read('styles.css')

    # 3. Data consts
    data = read('data.js')

    # 4. Notes — TOPIC_CONTENT must be declared before the per-phase files assign into it.
    #    Load phase files in a stable order.
    note_order = ['python', 'ml', 'dl', 'genai', 'dsa']
    note_files = []
    for name in note_order:
        p = os.path.join('notes', f'{name}.js')
        if os.path.exists(os.path.join(HERE, p)):
            note_files.append(p)
    # include any extra note files not in the explicit order (e.g. new phases)
    for p in sorted(glob.glob(os.path.join(HERE, 'notes', '*.js'))):
        rel = os.path.relpath(p, HERE)
        if rel not in note_files:
            note_files.append(rel)

    notes_js = 'const TOPIC_CONTENT = {};\n'
    for p in note_files:
        notes_js += '\n' + read(p) + '\n'

    # 5. App logic
    app = read('app.js')

    # 6. Assemble
    out = shell
    out = out.replace('/* __CSS__ */', css)
    out = out.replace('/* __DATA__ */', data)
    out = out.replace('/* __NOTES__ */', notes_js)
    out = out.replace('/* __APP__ */', app)

    # 7. Validate the combined JS with node --check (if node is available)
    js_start = out.find('<script>') + len('<script>')
    js_end = out.rfind('</script>')
    js = out[js_start:js_end]
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
            f.write(js)
            tmp = f.name
        r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True, timeout=60)
        os.unlink(tmp)
        if r.returncode != 0:
            print("✗ JS validation FAILED — build aborted:")
            print(r.stderr[:1000])
            sys.exit(1)
        print("✓ JS validation passed (node --check)")
    except FileNotFoundError:
        print("⚠ node not found — skipping JS validation")

    # 8. Write output
    out_path = os.path.join(HERE, '..', 'index.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(out)
    print(f"✓ Built index.html  ({len(out)/1024:.1f} KB)")
    print(f"  {len(note_files)} note files: {[os.path.basename(p) for p in note_files]}")

if __name__ == '__main__':
    main()
