// notes/python/py_modules.js — Modules, Packages & Environments
Object.assign(TOPIC_CONTENT, {
  "py_modules": `<main>
<h1>Modules, Packages &amp; Environments</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Modules, Packages &amp; Environments</span></div>
  <p class="lead">The importer from the last two notes works, but it is one growing script on one laptop. This note turns it into code that can be split, reused and installed anywhere: what <code>import</code> really does (the search path, the <code>sys.modules</code> cache, why a module runs only once, traced), the import styles, <code>if __name__ == "__main__"</code>, packages and <code>__init__.py</code>, relative imports, the circular-import trap reproduced and fixed, and then the environment around the code: virtual environments, pip and <code>requirements.txt</code>, version pinning, <code>pyproject.toml</code> with a command-line entry point, and Poetry's lock file. The running example ends here: the small package <code>chaistall/</code> and its command <code>chaistall data/orders_2026-10-19.csv</code>, which turns Monday's messy sheet into ₹230, three rejections, a JSON summary and a Parquet archive. Every command and code block was really run (Python 3.13, pip 24, Poetry 2.4.3) and its output is shown; long folder names are shortened to <code>~/chaistall</code>.</p>

  <h2 id="pmo-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 190" width="640">
<defs><marker id="pmo-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="200" y="8" width="240" height="36" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="31" text-anchor="middle" font-size="12">Programs Meet the Real World: the map</text>
<line x1="320" y1="44" x2="110" y2="74" stroke="currentColor" stroke-opacity="0.45"/><line x1="320" y1="44" x2="320" y2="74" stroke="currentColor" stroke-opacity="0.45"/><line x1="320" y1="44" x2="530" y2="74" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="20" y="76" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="95" text-anchor="middle" font-size="12">Exceptions</text><text x="110" y="111" text-anchor="middle" class="tm" font-size="10">errors.py, parse.py</text>
<rect x="230" y="76" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="95" text-anchor="middle" font-size="12">Files &amp; Data Formats</text><text x="320" y="111" text-anchor="middle" class="tm" font-size="10">storage.py, report.py</text>
<rect x="440" y="76" width="180" height="44" rx="7" class="fg sg" stroke-width="2.5"/><text x="530" y="95" text-anchor="middle" font-size="12" font-weight="700">Modules &amp; Environments</text><text x="530" y="111" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · package + venv</text>
<line x1="200" y1="98" x2="228" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pmo-a0)"/><line x1="410" y1="98" x2="438" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pmo-a0)"/>
<text x="320" y="150" text-anchor="middle" class="tm" font-size="10.5">this note assembles chaistall/: __init__.py, __main__.py, cli.py + pyproject.toml, a venv and a lock</text>
<text x="320" y="168" text-anchor="middle" class="tm" font-size="10.5">leads to: Testing (tests import the package) · Docker (ship the whole environment) · OOP</text>
</svg><figcaption>The "Programs Meet the Real World" group. You are on the last note; the first two wrote the modules this one assembles.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_exceptions">Exceptions</a> and <a class="xref" data-note="py_files">Files &amp; Data Formats</a></b><span>Those notes wrote the importer's pieces: the exception family and <code>parse_row</code>, then <code>read_orders</code>, the JSON summary and the Parquet archive. Left open: the pieces are growing, a test should be able to use <code>parse_row</code> without starting the import, and Parquet failed in the system Python because pyarrow was missing. You also need <a class="xref" data-note="py_functions">Functions</a> (names and scope).</span></li>
    <li><b>This note adds: code organisation and reproducible installs</b><span>Modules and <code>import</code>, packages, <code>__main__</code>, relative and circular imports, virtual environments, pip, requirements files, pinning, <code>pyproject.toml</code>, entry points, Poetry.</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="py_testing">Testing &amp; Debugging</a> (pytest imports your package, which only works because of this note), <a class="xref" data-note="py_oop">OOP</a> (classes live in modules too), <a class="xref" data-note="se_linux">Linux &amp; Terminal</a> (PATH, <code>which</code>, shells), and <a class="xref" data-note="se_docker">Docker</a>, which packages not only the Python libraries but the whole operating system around them.</span></li>
  </ol>

  <h2 id="pmo-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next. The running example: the 144-line importer split into the <code>chaistall/</code> package.</p>
  <ol class="story">
    <li><b>Modules</b><span>Q: how do we split a growing program into files? → Each <code>.py</code> file is a module; <code>import</code> gives you its names. The importer becomes errors, parse, storage, report and cli. But what exactly happens when Python meets <code>import</code>?</span></li>
    <li><b>What import does</b><span>Q: where does Python find a module, and what does it do with it? → Searches the folders in <code>sys.path</code> in order, runs the file top to bottom <em>once</em>, caches it in <code>sys.modules</code>. Traced: four files ran once, report.py and cli.py never ran. Trap: a local <code>csv.py</code> hid the real csv. But there are several ways to write an import…</span></li>
    <li><b>Import styles</b><span>Q: <code>import x</code>, <code>import x as y</code>, <code>from x import a</code>, <code>from x import *</code>, which one? → Prefer the explicit ones; <code>from os import *</code> silently replaced the built-in <code>open</code>. But importing a file runs it: will importing the CLI start an import?</span></li>
    <li><b>__name__ == "__main__"</b><span>Q: how can one file be both importable and runnable? → <code>__name__</code> is <code>"__main__"</code> only when the file is run directly; the guard keeps script code from running on import. But our modules live in one folder that must act as a unit…</span></li>
    <li><b>Packages and __init__.py</b><span>Q: how do several modules become one installable thing? → A folder with <code>__init__.py</code> (runs on first import, defines the public API: <code>chaistall.read_orders</code>, <code>__version__</code>) and <code>__main__.py</code> (makes <code>python -m chaistall</code> work). But how do modules inside it refer to each other?</span></li>
    <li><b>Relative imports</b><span>Q: how does storage.py import parse.py without hard-coding the package name? → <code>from .parse import parse_row</code>. Only works when the file is loaded as part of the package: <code>python chaistall/cli.py</code> fails, <code>python -m chaistall.cli</code> works. And when two modules import each other?</span></li>
    <li><b>Circular imports</b><span>Q: what if storage imports report and report imports storage? → "cannot import name 'read_orders' from partially initialized module". Fix by importing the module, moving code, or importing inside the function. Now the code is organised, but where do pandas and pyarrow come from?</span></li>
    <li><b>Virtual environments</b><span>Q: how do projects get their own libraries without breaking each other? → <code>python -m venv .venv</code>: a private folder of packages; the fresh venv had no yaml although the system Python did. But how do we fill it, and tell a teammate what to install?</span></li>
    <li><b>pip, requirements.txt, pinning</b><span>Q: how do we install and record dependencies? → <code>pip install</code>, <code>pip freeze</code>; a loose <code>requirements.txt</code> (3 lines) vs an exact lock (6 pinned lines) that rebuilt an identical environment. But our own package and its command are still not installable…</span></li>
    <li><b>pyproject.toml, entry points, Poetry</b><span>Q: how does the project describe itself, install its own command, and lock everything? → <code>pyproject.toml</code> with <code>[project.scripts]</code>; <code>pip install -e .</code> created the <code>chaistall</code> command; Poetry wrote a 20-package lock with hashes.</span></li>
  </ol>

  <h2 id="pmo-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Modules, Packages &amp; Environments</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Modules &amp; import</div>
        <ul>
          <li>Module = one .py file = one namespace</li>
          <li>import: check <code>sys.modules</code> → search <code>sys.path</code> → run once → cache</li>
          <li><code>sys.path[0]</code> = script's folder → local files win</li>
          <li>⚠ a file named csv.py / json.py hides the real one</li>
          <li>💡 a library: borrow the book once, keep it on your desk</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Styles &amp; __main__</div>
        <ul>
          <li><code>import x</code> · <code>import x as y</code> · <code>from x import a</code></li>
          <li>⚠ <code>from x import *</code>: <code>from os import *</code> replaced open</li>
          <li><code>__name__</code>: "__main__" when run, module name when imported</li>
          <li><code>if __name__ == "__main__":</code> keeps scripts importable</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Packages</div>
        <ul>
          <li>Folder + <code>__init__.py</code> (runs on first import, public API)</li>
          <li><code>__main__.py</code> → <code>python -m chaistall</code></li>
          <li>Relative: <code>from .parse import parse_row</code>, <code>from . import x</code></li>
          <li>Run inside-package files with <code>python -m pkg.mod</code></li>
          <li>⚠ circular import → partially initialized module</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Virtual environments</div>
        <ul>
          <li><code>python -m venv .venv</code>; <code>source .venv/bin/activate</code></li>
          <li>Own site-packages; system packages invisible</li>
          <li>Check: <code>which python</code>, <code>sys.prefix != sys.base_prefix</code></li>
          <li>⚠ wrong interpreter → "no module named …"</li>
          <li>💡 a separate tiffin box per project</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">pip &amp; pinning</div>
        <ul>
          <li><code>pip install</code>, <code>pip freeze</code>, <code>-r requirements.txt</code></li>
          <li>requirements = what you want (ranges)</li>
          <li>lock = exactly what you got (all packages, pins, hashes)</li>
          <li><code>==</code> exact · <code>&gt;=,&lt;</code> range · <code>~=2.2</code> = &gt;=2.2,&lt;3</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">pyproject &amp; Poetry</div>
        <ul>
          <li><code>pyproject.toml</code>: name, version, dependencies, scripts</li>
          <li><code>[project.scripts] chaistall = "chaistall.cli:main"</code></li>
          <li><code>pip install -e .</code> = editable install + command</li>
          <li>Poetry: <code>poetry add</code>, <code>poetry.lock</code>, <code>poetry install</code></li>
          <li>Commit the lock for apps; libraries publish ranges</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pmo-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-split"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Split the Code</span><span class="rm-sub">Modules</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-import"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">What import Does</span><span class="rm-sub">sys.path, sys.modules, once</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-styles"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Import Styles</span><span class="rm-sub">And the star trap</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-main"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">__name__ == "__main__"</span><span class="rm-sub">Importable and runnable</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pkg"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Packages &amp; __init__.py</span><span class="rm-sub">And __main__.py</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-rel"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Relative Imports</span><span class="rm-sub">from .x import y</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-circ"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Circular Imports</span><span class="rm-sub">Reproduced and fixed</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-venv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Virtual Environments</span><span class="rm-sub">One per project</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pip"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">pip &amp; requirements.txt</span><span class="rm-sub">Pinning versions</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pyproject"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">pyproject, Entry Points, Poetry</span><span class="rm-sub">Install the command; lock</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">And their fixes</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pmo-split"><span class="num">01</span>Why Split the Code: Modules</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The importer now has an exception family, a row parser, a CSV reader, a summary writer, a Parquet writer and a command-line interface. In one file that is 140+ lines, and a test that only wants <code>parse_row</code> would have to run the whole import. How do we split a program so its parts can be read, tested and reused separately?</p>
  </div>
  <p>A <strong>module</strong> is simply a <code>.py</code> file. Its top-level names (functions, classes, variables) form its <strong>namespace</strong>, and another file gets them with <code>import</code>. You have used modules all along: <code>import json</code>, <code>import csv</code>, <code>from pathlib import Path</code> load files that ship with Python. Your own files work exactly the same way. Split by responsibility, one job per module, the importer looks like this:</p>
  <div class="fx" data-lang="text">~/chaistall/                      ← the project folder
├── pyproject.toml                ← describes the project (section 10)
├── data/orders_2026-10-19.csv    ← input (not code)
└── chaistall/                    ← the package (section 05)
    ├── __init__.py               ← runs on "import chaistall"; public API
    ├── __main__.py               ← "python -m chaistall" starts here
    ├── errors.py                 ← ChaiStallError family   (Exceptions note)
    ├── parse.py                  ← to_int, parse_row        (Exceptions note)
    ├── storage.py                ← read_orders: CSV → rows  (Files note)
    ├── report.py                 ← summarise, JSON, Parquet (Files note)
    └── cli.py                    ← argparse, logging, exit codes</div>
  <div class="fx" data-lang="text">$ wc -l chaistall/*.py
   5 chaistall/__init__.py
   3 chaistall/__main__.py
  42 chaistall/cli.py
  26 chaistall/errors.py
  21 chaistall/parse.py
  24 chaistall/report.py
  23 chaistall/storage.py
 144 total</div>
  <p>144 lines in seven files of 3 to 42 lines each. Each file can be read on one screen, tested alone (<code>from chaistall.parse import parse_row</code> needs neither files nor pandas), and changed without scrolling past unrelated code. Names no longer collide: <code>storage.log</code> and <code>cli.log</code> are two different loggers in two namespaces.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A kitchen: each drawer (module) holds one kind of tool; the cupboard (package) holds related drawers. You open the drawer you need, not the whole kitchen, and two drawers can each have a "spoon" without confusion.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>module</strong> is a file of Python code; when imported it becomes a module object whose attributes are the file's top-level names. A <strong>package</strong> is a folder of modules (section 05). Importing gives access to another module's namespace as <code>module.name</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Splitting by size ("part1.py, part2.py") instead of by job gives modules that all import each other (section 07). Split by responsibility: errors, parsing, reading, reporting, interface.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: What import Does.</b> We will write <code>import chaistall</code> and <code>from .parse import parse_row</code>. What does Python actually do at that line, and how does it find the file?</div>

  <h2 id="pmo-import"><span class="num">02</span>What import Does: Search Path, Cache, Run Once</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>import json</code> works without telling Python where json lives, and <code>import chaistall</code> works only from certain folders. Where does Python look, what does it do with the file, and what happens on the second import?</p>
  </div>
  <h3>A module is an object</h3>
  <div class="fx" data-lang="py">import json
import chaistall.errors as errors
print(type(json).__name__, json.__name__)
print(json.__file__.split("/")[-2:], "-&gt;", json.dumps([1, 2]))
print(errors.__name__, "|", errors.__file__.split("py_io/")[-1])
print([n for n in dir(errors) if not n.startswith("_")])</div>
  <div class="fx" data-lang="text">module json
['json', '__init__.py'] -&gt; [1, 2]
chaistall.errors | proj/chaistall/errors.py
['BadNumberError', 'BadRowError', 'ChaiStallError', 'MissingValueError', 'TooManyBadRowsError']</div>
  <p><code>import json</code> created a name <code>json</code> bound to an object of type <code>module</code>, built from the file <code>json/__init__.py</code> in the standard library; <code>json.dumps</code> is an attribute of it. <code>import chaistall.errors as errors</code> loaded our own file, and <code>dir()</code> lists its public names: the five exception classes from the Exceptions note.</p>
  <h3>Step 1: the search path</h3>
  <p>For a module not loaded yet, Python looks through a list of folders, <code>sys.path</code>, in order, and takes the <em>first</em> match. Here it is, printed from a script in the project folder, run with the project's virtual environment (section 08):</p>
  <div class="fx" data-lang="py">import sys
for i, folder in enumerate(sys.path):               # searched in this order
    print(i, folder)
import json, yaml, chaistall
for mod in (json, yaml, chaistall):
    print(f"{mod.__name__:10} found in {mod.__file__}")</div>
  <div class="fx" data-lang="text">0 ~/chaistall
1 /usr/lib/python313.zip
2 /usr/lib/python3.13
3 /usr/lib/python3.13/lib-dynload
4 ~/chaistall/.venv/lib/python3.13/site-packages
json       found in /usr/lib/python3.13/json/__init__.py
yaml       found in ~/chaistall/.venv/lib/python3.13/site-packages/yaml/__init__.py
chaistall  found in ~/chaistall/chaistall/__init__.py</div>
  <p>Entry 0 is the folder of the script you ran (here the project folder; it would be the current folder for <code>python -m</code> or <code>python -c</code>). Then the standard library (entries 1–3), then the environment's <code>site-packages</code>, where pip installs things (entry 4). So <code>json</code> came from the standard library, <code>yaml</code> from the venv's site-packages, and <code>chaistall</code> from entry 0, because the script sits next to the <code>chaistall/</code> folder.</p>
  <h3>Step 2: run once, then cache</h3>
  <p>When the module is found, Python creates an empty module object, <strong>puts it in the dict <code>sys.modules</code></strong>, and then <strong>runs the file from top to bottom</strong>; every <code>def</code>, <code>class</code> and assignment fills the namespace. To watch this, we used a copy of the package with one line, <code>print("  running chaistall/&lt;file&gt;")</code>, added at the top of each file:</p>
  <div class="fx" data-lang="py">import sys
print("main: before import")
import chaistall
print("main: after first import")
import chaistall                                  # second time: nothing runs
from chaistall.errors import BadRowError          # already loaded: nothing runs
print("cached:", sorted(m for m in sys.modules if m.startswith("chaistall")))
print(chaistall.errors.BadRowError is BadRowError, chaistall.read_orders.__module__)</div>
  <div class="fx" data-lang="text">main: before import
  running chaistall/__init__.py
  running chaistall/errors.py
  running chaistall/storage.py
  running chaistall/parse.py
main: after first import
cached: ['chaistall', 'chaistall.errors', 'chaistall.parse', 'chaistall.storage']
True chaistall.storage</div>
  <p>Trace it against the package. <code>import chaistall</code> ran <code>__init__.py</code>, whose line <code>from .errors import …</code> ran <code>errors.py</code>, then <code>from .storage import read_orders</code> ran <code>storage.py</code>, whose own imports needed <code>errors</code> (already in the cache, so not run again) and <code>parse.py</code> (run now). The second <code>import chaistall</code> and the <code>from chaistall.errors import …</code> printed nothing: both found their modules in <code>sys.modules</code>. And <code>report.py</code>, <code>cli.py</code> and <code>__main__.py</code> never ran, because nothing imported them yet; pandas was never loaded either (<code>report.write_archive</code> imports it inside the function, on purpose). The last line shows there is one shared object: <code>chaistall.errors.BadRowError is BadRowError</code>.</p>
  <div class="flow"><span>import x</span><span>in sys.modules? → reuse it</span><span>else search sys.path in order</span><span>create module, add to sys.modules</span><span>run the file top to bottom once</span><span>bind the name x</span></div>
  <h3>The shadowing trap, reproduced</h3>
  <p>Because the script's own folder comes first in <code>sys.path</code>, a file you create there with the name of a real module wins. Someone saved a scratch file as <code>csv.py</code> next to their importer:</p>
  <div class="fx" data-lang="py">print("this is MY csv.py, not the standard library's")</div>
  <div class="fx" data-lang="py">import csv
with open("orders.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))</div>
  <div class="fx" data-lang="text">this is MY csv.py, not the standard library's
Traceback (most recent call last):
  File "shadow/import_orders.py", line 3, in &lt;module&gt;
    rows = list(csv.DictReader(f))
                ^^^^^^^^^^^^^^
AttributeError: module 'csv' has no attribute 'DictReader' (consider renaming 'shadow/csv.py' since it has the same name as the standard library module named 'csv' and prevents importing that standard library module)</div>
  <p><code>import csv</code> loaded the local <code>csv.py</code> (its print ran), which has no <code>DictReader</code>. Python 3.13 even names the cause in the error. The fix is to rename the file; never name your files <code>csv.py</code>, <code>json.py</code>, <code>random.py</code>, <code>pandas.py</code>, <code>test.py</code> or any other library's name.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A library: the first time you ask for a book, the librarian searches the shelves in a fixed order (your desk first, then the reference room, then the stacks), and the book is placed on your desk. Every later request for that title is answered from your desk, without searching or re-printing it. And if a different book with the same title is lying on your desk, that is the one you get.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>import x</code>: if <code>"x"</code> is in <code>sys.modules</code>, bind that object; otherwise find <code>x</code> on <code>sys.path</code> (first match wins), create a module object, store it in <code>sys.modules["x"]</code>, execute the module's code in its namespace, and bind the name. A module's code runs once per process (<code>importlib.reload</code> forces a re-run).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Top-level code in a module runs at import time. Slow work (loading a model, reading a big file) at the top of a module makes every <code>import</code> slow, including in tests. Put it in functions.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Import Styles.</b> We used <code>import x</code>, <code>import x as y</code> and <code>from x import a</code> without comparing them. Which to use, and is there a style to avoid?</div>

  <h2 id="pmo-styles"><span class="num">03</span>Import Styles</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every import style loads the module the same way (section 02); they differ only in which names they create in <em>your</em> file. Does that difference matter?</p>
  </div>
  <div class="fx" data-lang="py">import json                         # 1. the module; use json.dumps
import datetime as dt               # 2. a shorter alias
from collections import Counter     # 3. one name, used bare
from chaistall.errors import BadRowError, ChaiStallError
print(json.dumps({"qty": 2}), dt.date(2026, 10, 19), Counter("chai")["a"])
print(issubclass(BadRowError, ChaiStallError))

print(open.__module__)              # _io: the built-in open
from os import *                    # 4. star import: everything in os.__all__
print(open.__module__)              # posix: silently replaced by os.open!
try:
    open("data.csv")
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">{"qty": 2} 2026-10-19 1
True
_io
posix
TypeError: open() missing required argument 'flags' (pos 2)</div>
  <p>Styles 1–3 behave as expected: <code>json.dumps</code> through the module name, <code>dt</code> as an alias, <code>Counter</code> pulled out as a bare name, and our own classes from <code>chaistall.errors</code>. Then the star import: <code>from os import *</code> copied every public name of <code>os</code> into our file, and one of them is <code>os.open</code>, a low-level function that needs a <code>flags</code> argument. It silently replaced the built-in <code>open</code> (its module changed from <code>_io</code> to <code>posix</code>), so <code>open("data.csv")</code> now fails with a confusing <code>TypeError</code>. Nothing warned us.</p>
  <table class="tbl">
    <tr><th>style</th><th>creates the name</th><th>use when</th></tr>
    <tr><td><code>import json</code></td><td><code>json</code></td><td>default; <code>json.dumps</code> says where it came from</td></tr>
    <tr><td><code>import datetime as dt</code></td><td><code>dt</code></td><td>long names, or conventions (<code>import pandas as pd</code>)</td></tr>
    <tr><td><code>from collections import Counter</code></td><td><code>Counter</code></td><td>a few names used often</td></tr>
    <tr><td><code>from os import *</code></td><td>everything in <code>os.__all__</code></td><td>never in real code (fine in a quick interactive session)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>import json</code> is keeping the toolbox labelled "json" on the shelf; <code>from json import dumps</code> is taking one tool out; <code>from os import *</code> is tipping the whole box onto your workbench, where an "open" wrench lands on top of your own "open" wrench.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>import a.b</code> binds <code>a</code>; <code>import a.b as c</code> binds <code>c</code> to <code>a.b</code>; <code>from a.b import n</code> binds <code>n</code>; <code>from m import *</code> binds every name in <code>m.__all__</code> (or every name not starting with <code>_</code>). A module's <code>__all__</code> list declares its public API for star imports.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>from module import name</code> copies the <em>current</em> object into your namespace. If the module later rebinds <code>name</code> (or is reloaded), your copy does not change. This detail is also behind the circular-import fix in section 07.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: __name__ == "__main__".</b> Importing a module runs it. Our <code>cli.py</code> starts an import when run. Will a test that imports <code>cli</code> accidentally import a day of orders?</div>

  <h2 id="pmo-main"><span class="num">04</span>if __name__ == "__main__"</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A file can be used two ways: run as a program (<code>python shop_tools.py</code>), or imported by another file. We want the "program" part (start the import, print a self-test) only in the first case. How can a file know which case it is in?</p>
  </div>
  <p>Every module has a variable <code>__name__</code>. When a file is imported, <code>__name__</code> is its module name (<code>"shop_tools"</code>, <code>"chaistall.cli"</code>). When a file is the program you started, Python names it <code>"__main__"</code> instead. So <code>if __name__ == "__main__":</code> means "only when I am the program".</p>
  <div class="fx" data-lang="py">def rupees(n):
    return f"Rs {n:,}"

print("shop_tools loaded, __name__ =", repr(__name__))
if __name__ == "__main__":
    print("self-test:", rupees(230))</div>
  <div class="fx" data-lang="py">import shop_tools
print(shop_tools.rupees(1250))</div>
  <div class="fx" data-lang="text">$ python3 shop_tools.py
shop_tools loaded, __name__ = '__main__'
self-test: Rs 230
$ python3 use_tools.py
shop_tools loaded, __name__ = 'shop_tools'
Rs 1,250</div>
  <p>Run directly, <code>__name__</code> was <code>'__main__'</code>, so the self-test ran. Imported, it was <code>'shop_tools'</code>: the top-level <code>print</code> still ran (importing runs the file), but the guarded self-test did not, and the caller just used <code>rupees</code>. The importer's <code>cli.py</code> ends the same way: its <code>main()</code> runs only when the file is the program.</p>
  <div class="fx" data-lang="py">"""Command-line entry point: chaistall data/orders_2026-10-19.csv"""
import argparse
import logging
from datetime import date
from pathlib import Path

from . import __version__
from .errors import ChaiStallError
from .report import summarise, write_archive, write_summary
from .storage import read_orders

log = logging.getLogger("chaistall")


def main(argv=None):
    p = argparse.ArgumentParser(prog="chaistall")
    p.add_argument("csv", help="orders_YYYY-MM-DD.csv")
    p.add_argument("--out", default="out", help="output folder")
    args = p.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    src, out = Path(args.csv), Path(args.out)
    try:
        good, rejected = read_orders(src)
    except FileNotFoundError:
        log.error("no such file: %s", src)
        return 2
    except ChaiStallError:
        log.exception("import failed")
        return 1
    day = date.fromisoformat(src.stem.removeprefix("orders_"))
    out.mkdir(parents=True, exist_ok=True)
    summary = summarise(day, good, rejected)
    write_summary(summary, out / f"summary_{day}.json")
    write_archive(good, out / f"orders_{day}.parquet")
    log.info("chaistall %s: %d orders, Rs %d, %d rejected",
             __version__, summary["orders"], summary["revenue"], len(rejected))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())</div>
  <p>Before the code: <code>main(argv=None)</code> reads the command-line arguments with <code>argparse</code> (a CSV path and an optional <code>--out</code> folder), sets up logging once, and returns an <strong>exit code</strong>: 0 for success, 2 for "no such file", 1 for any other <code>ChaiStallError</code> (logged with its traceback). This uses every idea from the Exceptions note: specific catching, a file-level <code>FileNotFoundError</code> handled once, and <code>log.exception</code>. After: <code>raise SystemExit(main())</code> hands the code to the operating system, where shell scripts and schedulers can test it. Taking <code>argv</code> as a parameter lets a test call <code>main(["data/x.csv"])</code> directly.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cook's recipe card with a note at the bottom: "if you are the head chef today, also start the service". A cook who just borrows the card to make chutney ignores the note.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>__name__</code> is the module's name; it is <code>"__main__"</code> for the module Python was asked to run (by path, <code>-m</code>, or <code>-c</code>). The <strong>main guard</strong> <code>if __name__ == "__main__":</code> keeps program-only code out of imports.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Without the guard, importing the module for a test, or by <a class="xref" data-note="py_concurrency">multiprocessing</a> (which re-imports your main file in worker processes), runs the whole program again. Keep logic in functions; call them under the guard.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Packages &amp; __init__.py.</b> Seven files in a folder are not yet one thing. How does <code>import chaistall</code> work for a folder, and what decides what <code>chaistall.</code> offers?</div>

  <h2 id="pmo-pkg"><span class="num">05</span>Packages &amp; __init__.py</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our modules belong together. We want <code>import chaistall</code> to give a small, clear set of names, <code>python -m chaistall</code> to start the importer, and the inner files to be free to change. What turns a folder into that?</p>
  </div>
  <p>A <strong>package</strong> is a folder of modules that is itself importable. A regular package has a file <code>__init__.py</code>: it runs on the first <code>import chaistall</code> (we saw it in the trace) and its names become the package's names. Use it to declare the <strong>public API</strong>: the version and the few names users should need.</p>
  <div class="fx" data-lang="py">"""chaistall: import one day of Chai Corner orders."""
__version__ = "0.1.0"

from .errors import ChaiStallError, BadRowError   # re-export the public API
from .storage import read_orders</div>
  <p>After this, users write <code>chaistall.read_orders(…)</code> and <code>except chaistall.ChaiStallError</code>, and never need to know that <code>read_orders</code> lives in <code>storage.py</code>; we can move it later without breaking them. Submodules are also attributes after they are imported: <code>chaistall.errors</code>, <code>chaistall.storage</code>.</p>
  <p>A second special file, <code>__main__.py</code>, is what runs for <code>python -m chaistall</code>:</p>
  <div class="fx" data-lang="py">from .cli import main

raise SystemExit(main())</div>
  <p>Three lines: import <code>main</code> from the CLI module and exit with its code. (No main guard is needed, because this file exists only to be run.) The runs in section 06 use it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant: the kitchen has many stations (modules), but customers see one menu (<code>__init__.py</code>) and one front door (<code>__main__.py</code>). The kitchen can be rearranged without reprinting the menu.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>regular package</strong> is a directory containing <code>__init__.py</code>; importing the package executes it, and the package's attributes are its names plus imported submodules. <code>__main__.py</code> is executed by <code>python -m package</code>. A directory without <code>__init__.py</code> can still be imported as a <strong>namespace package</strong> (used to spread one package across folders), but normal projects should include <code>__init__.py</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Heavy imports in <code>__init__.py</code> (pandas, a model) are paid by everyone who imports anything from the package, even <code>chaistall.errors</code>. Keep <code>__init__.py</code> light; here pandas is imported only inside <code>write_archive</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Relative Imports.</b> Inside the package, <code>storage.py</code> must import <code>parse.py</code>. Should it write <code>import chaistall.parse</code>, hard-coding the package's name?</div>

  <h2 id="pmo-rel"><span class="num">06</span>Relative Imports</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If the package is renamed (or vendored inside another project), every <code>import chaistall.x</code> inside it breaks. How can modules of one package refer to their siblings by position, and when does that stop working?</p>
  </div>
  <p>A <strong>relative import</strong> names a module by its position relative to the current module's package: <code>.</code> means "this package", <code>..</code> "the parent package". <code>from .parse import parse_row</code> in <code>storage.py</code> means "from the module <code>parse</code> in my own package". <code>from . import __version__</code> in <code>cli.py</code> means "from my package's <code>__init__</code>". To resolve the dots, Python needs to know which package the file belongs to, which it knows only when the file was imported <em>as part of the package</em>. Three ways to start the importer:</p>
  <div class="fx" data-lang="text">$ source .venv/bin/activate
$ python chaistall/cli.py data/orders_2026-10-19.csv
Traceback (most recent call last):
  File "~/chaistall/chaistall/cli.py", line 7, in &lt;module&gt;
    from . import __version__
ImportError: attempted relative import with no known parent package
$ python -m chaistall.cli data/orders_2026-10-19.csv --out out
WARNING chaistall.storage: skipped line 8, qty: 'two' is not a whole number
WARNING chaistall.storage: skipped line 9, price: is empty
WARNING chaistall.storage: skipped line 10, qty: -1 must be positive
INFO chaistall: chaistall 0.1.0: 6 orders, Rs 230, 3 rejected
$ python -m chaistall data/orders_2026-10-19.csv --out out
WARNING chaistall.storage: skipped line 8, qty: 'two' is not a whole number
WARNING chaistall.storage: skipped line 9, price: is empty
WARNING chaistall.storage: skipped line 10, qty: -1 must be positive
INFO chaistall: chaistall 0.1.0: 6 orders, Rs 230, 3 rejected</div>
  <p>Run as a plain file path (<code>python chaistall/cli.py</code>), the file is just "__main__" with no package, so <code>from . import __version__</code> fails: "attempted relative import with no known parent package". Run as a module of the package (<code>python -m chaistall.cli</code>), Python imports <code>chaistall</code> first, so the dots resolve and the import works: 6 orders, ₹230, 3 rejected. <code>python -m chaistall</code> runs the package's <code>__main__.py</code> and gives the same result. Both <code>-m</code> forms must be started from the project folder, so that <code>chaistall/</code> is on <code>sys.path</code> (entry 0 is the current folder for <code>-m</code>); section 10 removes that restriction by installing the package.</p>
  <table class="tbl">
    <tr><th>in file</th><th>relative</th><th>absolute equivalent</th></tr>
    <tr><td><code>chaistall/storage.py</code></td><td><code>from .parse import parse_row</code></td><td><code>from chaistall.parse import parse_row</code></td></tr>
    <tr><td><code>chaistall/cli.py</code></td><td><code>from . import __version__</code></td><td><code>from chaistall import __version__</code></td></tr>
    <tr><td><code>chaistall/io/csv_in.py</code> (if nested)</td><td><code>from ..errors import BadRowError</code></td><td><code>from chaistall.errors import BadRowError</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>"The flat next door" (relative) only makes sense once you know which building you are in. Dropped in the street with no building (run as a plain file), "next door" means nothing; the full postal address (absolute import) works from anywhere the city map (sys.path) covers.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Relative imports (<code>from .m import n</code>, <code>from .. import m</code>) resolve against the current module's <code>__package__</code>. They work only inside a package loaded as a package (via <code>import</code> or <code>python -m pkg.mod</code>), never in a file run by path. Absolute imports work anywhere the top-level package is on <code>sys.path</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Fixing" the ImportError by adding <code>sys.path.insert(0, "..")</code> hacks to files. Run modules with <code>python -m package.module</code> from the project root, or install the package (section 10).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Circular Imports.</b> Imports form a graph between modules. What if two modules need each other?</div>

  <h2 id="pmo-circ"><span class="num">07</span>The Circular-Import Trap</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Suppose we add convenience functions: <code>storage.read_and_summarise</code> (needs <code>report.summarise</code>) and <code>report.summarise_file</code> (needs <code>storage.read_orders</code>). Each module imports the other at the top. Given "run once, cache first" from section 02, what happens?</p>
  </div>
  <p>A small copy of the package, with a print at the start and end of each module:</p>
  <div class="fx" data-lang="py">print("storage.py: start")
from .report import summarise          # storage needs report...

def read_orders(path):
    return [{"customer": "Asha", "amount": 40}]

def read_and_summarise(path):
    return summarise(read_orders(path))
print("storage.py: end")</div>
  <div class="fx" data-lang="py">print("report.py: start")
from .storage import read_orders       # ...and report needs storage

def summarise(good):
    return {"orders": len(good), "revenue": sum(o["amount"] for o in good)}

def summarise_file(path):
    return summarise(read_orders(path))
print("report.py: end")</div>
  <div class="fx" data-lang="py">try:
    from chaistall.storage import read_and_summarise
    print(read_and_summarise("data/orders_2026-10-19.csv"))
except ImportError as e:
    print("ImportError:", e)</div>
  <div class="fx" data-lang="text">storage.py: start
report.py: start
ImportError: cannot import name 'read_orders' from partially initialized module 'chaistall.storage' (most likely due to a circular import) (chaistall/storage.py)</div>
  <p>Trace it with the import steps. (1) <code>main</code> imports <code>chaistall.storage</code>: an empty module object is put in <code>sys.modules</code> and storage.py starts running ("storage.py: start"). (2) Its line 2 imports <code>report</code>, which starts running ("report.py: start"). (3) report's line 2 asks for <code>read_orders</code> from storage. storage <em>is</em> in <code>sys.modules</code>, so it is not run again, but it is only <strong>partially initialized</strong>: it stopped at its line 2 and has not reached <code>def read_orders</code> yet. The name does not exist, so the import fails. Neither "end" line ever printed.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
<defs><marker id="pmo-a7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="220" height="110" rx="8" class="fb sb"/><text x="130" y="40" text-anchor="middle" font-size="12" font-weight="700">storage.py (running)</text>
<text x="34" y="62" font-size="11">1 print start ✓</text><text x="34" y="80" font-size="11" class="tr">2 from .report import … ⏸</text><text x="34" y="98" font-size="11" class="tm">4 def read_orders  (not yet)</text>
<rect x="360" y="20" width="220" height="110" rx="8" class="fv"/><text x="470" y="40" text-anchor="middle" font-size="12" font-weight="700">report.py (running)</text>
<text x="374" y="62" font-size="11">1 print start ✓</text><text x="374" y="80" font-size="11" class="tr">2 from .storage import</text><text x="374" y="96" font-size="11" class="tr">   read_orders ✗</text>
<path d="M240,78 L358,64" fill="none" stroke="currentColor" marker-end="url(#pmo-a7)"/><path d="M360,90 L242,100" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pmo-a7)"/>
<text x="300" y="140" text-anchor="middle" class="tm" font-size="10.5">report asks storage for a name storage has not defined yet</text>
</svg><figcaption>A cycle at import time: each module is waiting for the other to finish running its top level.</figcaption></figure>
  <h3>Three fixes</h3>
  <ol>
    <li><strong>Import the module, not the name.</strong> <code>from . import storage</code> needs only the (partial) module object, which exists; the name <code>storage.read_orders</code> is looked up later, when the function is <em>called</em>, by which time storage has finished. This is the fix shown below.</li>
    <li><strong>Move the shared piece</strong> into a third module both can import (the cleanest fix when the cycle shows a design mix-up: here, both "convenience" functions belong in <code>cli.py</code>, which imports both modules and is imported by neither).</li>
    <li><strong>Import inside the function</strong> that needs it, so the import happens at call time (like <code>write_archive</code>'s <code>import pandas</code>).</li>
  </ol>
  <div class="fx" data-lang="py">print("report.py: start")
from . import storage                 # import the MODULE, not the name

def summarise(good):
    return {"orders": len(good), "revenue": sum(o["amount"] for o in good)}

def summarise_file(path):
    return summarise(storage.read_orders(path))
print("report.py: end")</div>
  <div class="fx" data-lang="text">storage.py: start
report.py: start
report.py: end
storage.py: end
{'orders': 1, 'revenue': 40}</div>
  <p>Now both modules reach their "end" lines, nested in the order the trace predicts (report finishes inside storage's import), and the call works. The real <code>chaistall</code> avoids the cycle altogether with fix 2: imports flow one way, cli → report/storage → parse → errors.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two new colleagues each refusing to fill in their joining form until they can copy the other's employee number. Fix: each writes down "ask Ben later" (import the module, look up the name later), or HR issues both numbers first (move the shared part).</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>circular import</strong> is a cycle in the module import graph. Because a module is placed in <code>sys.modules</code> before its code runs, the second module in the cycle receives a <strong>partially initialized</strong> module; <code>from m import name</code> fails if <code>name</code> is defined after the cycle point, while <code>import m</code> / <code>from pkg import m</code> succeeds.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The error appears far from the cause and can change when you reorder imports or add a test that imports modules in a different order. Keep the import graph one-directional (a layered design) and treat a cycle as a design smell.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Virtual Environments.</b> Our own code is now organised. But <code>report.py</code> needs pandas and pyarrow, which are not our code, and the system Python did not have pyarrow (Files note). Where should third-party libraries live?</div>

  <h2 id="pmo-venv"><span class="num">08</span>Virtual Environments</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Third-party libraries are installed into a <code>site-packages</code> folder that every program using that Python shares. Project A needs pandas 2, the importer needs pandas 3, and the operating system's own tools may depend on the system's versions. How do projects get their own libraries without breaking each other?</p>
  </div>
  <p>A <strong>virtual environment</strong> (venv) is a folder containing a link to a Python interpreter plus its <em>own, empty</em> <code>site-packages</code>. When you use the venv's <code>python</code>, its <code>sys.path</code> contains the standard library and the venv's site-packages, but not the system's. <strong>Activating</strong> it (<code>source .venv/bin/activate</code>) only puts <code>.venv/bin</code> first on the shell's <code>PATH</code>, so that <code>python</code> and <code>pip</code> mean the venv's ones.</p>
  <div class="fx" data-lang="text">$ python3 -c "import yaml; print('system python has yaml', yaml.__version__)"
system python has yaml 6.0.1
$ python3 -m venv .venv
$ source .venv/bin/activate
$ which python
~/chaistall/.venv/bin/python
$ python -c "import sys; print(sys.prefix != sys.base_prefix)"
True
$ python -c "import yaml"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    import yaml
ModuleNotFoundError: No module named 'yaml'
$ pip install -q "pyyaml==6.0.2"
$ python -c "import yaml; print(yaml.__version__, yaml.__file__)"
6.0.2 ~/chaistall/.venv/lib/python3.13/site-packages/yaml/__init__.py
$ pip freeze
PyYAML==6.0.2
$ deactivate
$ which python3
/usr/bin/python3</div>
  <p>Step by step: the system Python has PyYAML 6.0.1. <code>python -m venv .venv</code> created the environment. After activation, <code>which python</code> points inside <code>.venv</code>, and <code>sys.prefix != sys.base_prefix</code> is True, the standard test for "am I in a venv?". <code>import yaml</code> now <em>fails</em>: the system's packages are invisible here, which is exactly the isolation we want. <code>pip install</code> put PyYAML 6.0.2 into the venv's own site-packages (the file path shows it), and <code>pip freeze</code> lists only what is in this environment. <code>deactivate</code> returns the shell to the system Python.</p>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
<rect x="10" y="10" width="250" height="104" rx="8" class="fb sb"/><text x="22" y="32" font-size="12" font-weight="700">old-report/.venv</text>
<text x="22" y="54" class="tm" font-size="11">python 3.13</text><text x="22" y="74" font-size="11">pandas 2.2.3</text><text x="22" y="94" font-size="11">no pyarrow</text>
<rect x="300" y="10" width="250" height="104" rx="8" class="fg sg"/><text x="312" y="32" font-size="12" font-weight="700">chaistall/.venv</text>
<text x="312" y="54" class="tm" font-size="11">python 3.13</text><text x="312" y="74" font-size="11">pandas 3.0.6 · pyarrow 26.0.0</text><text x="312" y="94" font-size="11">PyYAML 6.0.2</text>
<rect x="130" y="126" width="300" height="26" rx="6" class="fs" stroke="currentColor"/><text x="280" y="144" text-anchor="middle" class="tm" font-size="11">system Python: the OS's packages, leave alone</text>
</svg><figcaption>Each project has its own site-packages; versions never clash, and the system Python stays untouched.</figcaption></figure>
  <h3>The wrong-interpreter trap</h3>
  <p>The most common environment bug is running the right code with the wrong Python. After <code>deactivate</code>, the same command uses the system <code>python3</code>, which has pandas but not pyarrow:</p>
  <div class="fx" data-lang="text">$ deactivate 2&gt;/dev/null; which python3
/usr/bin/python3
$ python3 -m chaistall data/orders_2026-10-19.csv --out out
WARNING chaistall.storage: skipped line 8, qty: 'two' is not a whole number
WARNING chaistall.storage: skipped line 9, price: is empty
WARNING chaistall.storage: skipped line 10, qty: -1 must be positive
Traceback (most recent call last):
  ... (frames inside pandas trimmed) ...
ImportError: Unable to find a usable engine; tried using: 'pyarrow', 'fastparquet'.</div>
  <p>The import got all the way to writing the archive and then failed, exactly like the Files note's first Parquet attempt. When you see "No module named …" or "unable to find a usable engine" for something you <em>know</em> you installed, first check <code>which python</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Separate tiffin boxes for each person: your dal never mixes with someone else's sabzi. The wrong-interpreter bug is opening your colleague's tiffin and wondering where your dal went.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>python -m venv DIR</code> creates an isolated environment with its own <code>site-packages</code> and scripts folder (<code>bin/</code>, or <code>Scripts\\</code> on Windows). Activation prepends that folder to <code>PATH</code>; you can also call <code>DIR/bin/python</code> directly. Environments are disposable: never commit <code>.venv</code> to git; rebuild it from a requirements or lock file.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>sudo pip install</code> into the system Python can break operating-system tools that depend on specific versions (many Linux distributions now refuse it: "externally-managed-environment"). One venv per project, always. A venv does not isolate non-Python things (system libraries, the OS itself); that is what <a class="xref" data-note="se_docker">Docker</a> adds.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: pip &amp; requirements.txt.</b> The venv is empty and private. How do we fill it with the right versions, and give a teammate (or a server) a file that recreates it?</div>

  <h2 id="pmo-pip"><span class="num">09</span>pip, requirements.txt &amp; Version Pinning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"pip install pandas" today and "pip install pandas" in six months give different versions. Our teammate's laptop and the night server must run exactly what we tested. How do we write down what the project needs, precisely enough to rebuild it?</p>
  </div>
  <p><strong>pip</strong> downloads packages from PyPI (the Python Package Index) and installs them, together with the packages <em>they</em> need (<strong>transitive dependencies</strong>). <code>pip freeze</code> prints every installed package with its exact version, in a format pip can read back. Two kinds of list are useful, and they answer different questions:</p>
  <div class="fx" data-lang="text">$ source .venv/bin/activate
$ printf "pandas&gt;=2.2\\npyarrow&gt;=15\\npyyaml\\n" &gt; requirements.txt
$ cat requirements.txt
pandas&gt;=2.2
pyarrow&gt;=15
pyyaml
$ pip freeze --exclude-editable &gt; requirements-lock.txt
$ cat requirements-lock.txt
numpy==2.5.4
pandas==3.0.6
pyarrow==26.0.0
python-dateutil==2.9.0.post0
PyYAML==6.0.2
six==1.17.0
$ deactivate
$ python3 -m venv .venv-teammate
$ .venv-teammate/bin/pip install -q -r requirements-lock.txt
$ diff &lt;(.venv/bin/pip freeze --exclude-editable) &lt;(.venv-teammate/bin/pip freeze) &amp;&amp; echo "identical environments"
identical environments</div>
  <p>Read it. <code>requirements.txt</code> is what <em>we</em> asked for: three direct dependencies with loose ranges ("pandas 2.2 or newer"). Installing those pulled in numpy, python-dateutil and six as well, so the frozen list has six lines, every one pinned with <code>==</code>. That frozen list (here <code>requirements-lock.txt</code>) is a <strong>lock</strong>: a teammate who creates a fresh venv and installs from it gets an environment that <code>diff</code> reports as <strong>identical</strong>. Installing from the loose file instead would give whatever versions are newest on that day.</p>
  <h3>Version specifiers, tested</h3>
  <p>Which pandas versions does each specifier allow? Checked with the <code>packaging</code> library (the one pip itself uses), against six real pandas versions:</p>
  <div class="fx" data-lang="py">from packaging.specifiers import SpecifierSet

versions = ["2.1.4", "2.2.0", "2.2.3", "2.3.1", "3.0.0", "3.0.6"]
for spec in ["==2.2.3", "&gt;=2.2", "&gt;=2.2,&lt;3", "~=2.2", "~=2.2.0"]:
    ok = [v for v in versions if v in SpecifierSet(spec)]
    print(f"pandas{spec:10} -&gt; {ok}")</div>
  <div class="fx" data-lang="text">pandas==2.2.3    -&gt; ['2.2.3']
pandas&gt;=2.2      -&gt; ['2.2.0', '2.2.3', '2.3.1', '3.0.0', '3.0.6']
pandas&gt;=2.2,&lt;3   -&gt; ['2.2.0', '2.2.3', '2.3.1']
pandas~=2.2      -&gt; ['2.2.0', '2.2.3', '2.3.1']
pandas~=2.2.0    -&gt; ['2.2.0', '2.2.3']</div>
  <table class="tbl">
    <tr><th>specifier</th><th>means</th><th>allowed here</th><th>use for</th></tr>
    <tr><td><code>==2.2.3</code></td><td>exactly this</td><td>2.2.3</td><td>lock files, apps you deploy</td></tr>
    <tr><td><code>&gt;=2.2</code></td><td>this or newer, forever</td><td>2.2.0 … 3.0.6</td><td>risky: includes the next major version</td></tr>
    <tr><td><code>&gt;=2.2,&lt;3</code></td><td>at least 2.2, below 3</td><td>2.2.0, 2.2.3, 2.3.1</td><td>libraries: "works with pandas 2.x from 2.2"</td></tr>
    <tr><td><code>~=2.2</code></td><td>"compatible release" = &gt;=2.2, &lt;3</td><td>same as above</td><td>short form of the line above</td></tr>
    <tr><td><code>~=2.2.0</code></td><td>&gt;=2.2.0, &lt;2.3</td><td>2.2.0, 2.2.3</td><td>bug-fix updates only</td></tr>
  </table>
  <p>Versions usually follow <strong>semantic versioning</strong>, MAJOR.MINOR.PATCH: a new MAJOR (pandas 2 → 3) may break your code; MINOR adds features; PATCH fixes bugs. That is why the upper bound sits at the next major version.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>requirements.txt</code> is the shopping list: "rice, about 5 kg, any good brand". The lock is the bill: "India Gate Basmati, 5 kg, batch 2291". Give someone the bill and they buy exactly the same thing.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>pip install pkg</code> / <code>-r file</code> installs packages and their dependencies into the current environment. A <strong>requirements file</strong> lists direct dependencies, usually with ranges. A <strong>lock</strong> lists every package in the dependency tree at an exact version (and, in real lock files, file hashes). <strong>Pinning</strong> = fixing a version with <code>==</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Pinning only your direct dependencies is not reproducible: numpy, dateutil and six drift underneath. And <code>pip freeze &gt; requirements.txt</code> as your only file mixes "what we need" with "what happened to be installed"; keep both lists (or let a tool like Poetry or uv keep them).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: pyproject.toml, Entry Points &amp; Poetry.</b> We can install other people's packages. Our own package still runs only from its folder with <code>python -m</code>, and its dependencies are in a separate text file. How does a project describe itself, so it can be installed like pandas?</div>

  <h2 id="pmo-pyproject"><span class="num">10</span>pyproject.toml, Entry Points &amp; Poetry</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want to type <code>chaistall data/orders_2026-10-19.csv</code> from any folder, have pip install pandas and pyarrow automatically along with it, and have one file that says what the project is. Where does that information go?</p>
  </div>
  <p><code>pyproject.toml</code> is the standard file at the root of a Python project. It is written in TOML (a simple <code>key = value</code> format with <code>[sections]</code>) and says: the project's name and version, the Python versions it supports, its dependencies, the commands it provides, and which <strong>build backend</strong> turns the folder into an installable package (here setuptools).</p>
  <div class="fx" data-lang="text">[project]
name = "chaistall"
version = "0.1.0"
description = "Import one day of Chai Corner orders"
requires-python = "&gt;=3.10"
dependencies = [
    "pandas&gt;=2.2",
    "pyarrow&gt;=15",
]

[project.scripts]
chaistall = "chaistall.cli:main"

[build-system]
requires = ["setuptools&gt;=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools]
packages = ["chaistall"]          # only this folder is code (not data/)</div>
  <p>Section by section: <code>[project]</code> holds the metadata and the dependency <em>ranges</em> (what we need, like requirements.txt). <code>[project.scripts]</code> declares an <strong>entry point</strong>: a command named <code>chaistall</code> that calls the function <code>main</code> in module <code>chaistall.cli</code>. <code>[build-system]</code> names the build tool. The last line exists because of a real error during this note's run: without it, setuptools found two top-level folders (<code>data</code> and <code>chaistall</code>) and refused to guess which one is code ("Multiple top-level packages discovered in a flat-layout").</p>
  <h3>Installing our own package</h3>
  <div class="fx" data-lang="text">$ source .venv/bin/activate
$ pip install -q -e .
$ pip freeze
# Editable install with no version control (chaistall==0.1.0)
-e ~/chaistall
numpy==2.5.4
pandas==3.0.6
pyarrow==26.0.0
python-dateutil==2.9.0.post0
PyYAML==6.0.2
six==1.17.0
$ which chaistall
~/chaistall/.venv/bin/chaistall
$ cat .venv/bin/chaistall
#!~/chaistall/.venv/bin/python3
import sys
from chaistall.cli import main
if __name__ == '__main__':
    sys.argv[0] = sys.argv[0].removesuffix('.exe')
    sys.exit(main())
$ chaistall --help
usage: chaistall [-h] [--out OUT] csv

positional arguments:
  csv         orders_YYYY-MM-DD.csv

options:
  -h, --help  show this help message and exit
  --out OUT   output folder
$ chaistall data/orders_2026-10-19.csv --out out; echo "exit code $?"
WARNING chaistall.storage: skipped line 8, qty: 'two' is not a whole number
WARNING chaistall.storage: skipped line 9, price: is empty
WARNING chaistall.storage: skipped line 10, qty: -1 must be positive
INFO chaistall: chaistall 0.1.0: 6 orders, Rs 230, 3 rejected
exit code 0
$ chaistall data/orders_2026-10-20.csv; echo "exit code $?"
ERROR chaistall: no such file: data/orders_2026-10-20.csv
exit code 2
$ ls out
orders_2026-10-19.parquet
summary_2026-10-19.json</div>
  <p><code>pip install -e .</code> ("editable" install of the current folder) read pyproject.toml, installed pandas and pyarrow with their dependencies, and registered our package. "Editable" means the venv points at our source folder, so edits take effect without reinstalling (the freeze line <code>-e ~/chaistall</code> shows it). pip also generated a small script, <code>.venv/bin/chaistall</code>, which is exactly the three steps you would write by hand: <code>from chaistall.cli import main</code>, then <code>sys.exit(main())</code>. Now <code>chaistall --help</code> works, the full import gives 6 orders, ₹230, 3 rejected with exit code 0, a missing day gives a clean one-line error with exit code 2, and <code>out/</code> holds the JSON summary and the Parquet archive. This is the finished running example.</p>
  <h3>Poetry: the same, plus a lock file</h3>
  <p><strong>Poetry</strong> (and the newer, faster <strong>uv</strong>) manage the whole cycle: they create the venv, edit pyproject.toml when you add a dependency, and keep a lock file with every package's exact version and file hashes. Run on a copy of the project:</p>
  <div class="fx" data-lang="text">$ poetry add --group dev pytest
Creating virtualenv chaistall in ~/chaistall/.venv
Using version ^9.1.1 for pytest

Updating dependencies
Resolving dependencies...

Package operations: 10 installs, 0 updates, 0 removals

  - Installing six (1.17.0)
  - Installing iniconfig (2.3.1)
  - Installing numpy (2.5.4)
  - Installing packaging (26.3)
  - Installing pluggy (1.7.0)
  - Installing pygments (2.21.0)
  - Installing python-dateutil (2.9.0.post0)
  - Installing pandas (3.0.6)
  - Installing pyarrow (26.0.0)
  - Installing pytest (9.1.1)

Writing lock file
$ tail -4 pyproject.toml
[dependency-groups]
dev = [
    "pytest (&gt;=9.1.1,&lt;10.0.0)"
]
$ grep -c '^\\[\\[package\\]\\]' poetry.lock
20
$ grep -A1 '^name = "pandas"' poetry.lock
name = "pandas"
version = "2.3.3"
--
name = "pandas"
version = "3.0.6"
$ poetry install
Installing dependencies from lock file

No dependencies to install or update

Installing the current project: chaistall (0.1.0)
$ poetry run chaistall --help | head -1
usage: chaistall [-h] [--out OUT] csv</div>
  <p><code>poetry add --group dev pytest</code> created a venv, resolved the dependencies, installed 10 packages, added pytest to a <em>dev</em> group in pyproject.toml (needed for development, not for users) and wrote <code>poetry.lock</code>. The lock has 20 package entries, more than were installed, because it covers every Python version the project allows (<code>requires-python = "&gt;=3.10"</code>): it holds pandas 2.3.3 for Python 3.10 (pandas 3 needs 3.11+) and pandas 3.0.6 for newer versions. <code>poetry install</code> on any machine recreates the environment from the lock and installs the project itself, after which <code>poetry run chaistall</code> works.</p>
  <table class="tbl">
    <tr><th></th><th>requirements.txt</th><th>pyproject.toml</th><th>lock file (poetry.lock, uv.lock, frozen list)</th></tr>
    <tr><td>Written by</td><td>you</td><td>you (or <code>poetry add</code>)</td><td>the tool; never by hand</td></tr>
    <tr><td>Contains</td><td>direct deps, ranges</td><td>metadata, direct deps, scripts, build backend</td><td>every package, exact versions (+ hashes)</td></tr>
    <tr><td>Answers</td><td>what to install</td><td>what this project is and needs</td><td>exactly what was installed</td></tr>
    <tr><td>Commit to git?</td><td>yes</td><td>yes</td><td>yes for apps/pipelines; libraries publish ranges only</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>pyproject.toml is the stall's registration certificate plus its standing order ("milk: about 20 litres a day from a good dairy"); the lock file is this week's delivery note with batch numbers; the entry point is the signboard that tells customers which counter to go to.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>pyproject.toml</code> declares a project's metadata (<code>[project]</code>), dependencies, console scripts (<code>[project.scripts] name = "module:function"</code>), and build system. <code>pip install -e .</code> installs it in editable mode and creates the scripts. Poetry/uv add dependency resolution, a lock file, and environment management (<code>poetry add</code>, <code>poetry install</code>, <code>poetry run</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Editing a lock file by hand, or forgetting to commit it, brings back "works on my machine". Change dependencies through the tool (<code>poetry add</code>, <code>uv add</code>) and commit pyproject.toml and the lock together.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> From one script to an installed command: which piece solved which problem?</div>

  <h2 id="pmo-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ten ideas, two layers (organising our code, and the environment around it). How do they fit into one picture of what happens when someone types <code>chaistall data/orders_2026-10-19.csv</code>?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="pmo-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="640" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="28" text-anchor="middle" font-size="11.5" font-weight="700">$ chaistall data/orders_2026-10-19.csv</text><text x="330" y="43" text-anchor="middle" class="tm" font-size="10">shell finds .venv/bin/chaistall on PATH (08 venv activated) · created by 10 [project.scripts]</text>
<line x1="330" y1="50" x2="330" y2="70" stroke="currentColor" marker-end="url(#pmo-a9)"/>
<rect x="150" y="72" width="360" height="40" rx="7" class="fb sb"/><text x="330" y="90" text-anchor="middle" font-size="11.5" font-weight="700">from chaistall.cli import main → sys.exit(main())</text><text x="330" y="105" text-anchor="middle" class="tm" font-size="10">02 import: sys.path → venv site-packages / editable source · 05 __init__ runs once</text>
<line x1="330" y1="112" x2="330" y2="132" stroke="currentColor" marker-end="url(#pmo-a9)"/>
<rect x="150" y="134" width="360" height="40" rx="7" class="fg sg"/><text x="330" y="152" text-anchor="middle" font-size="11.5" font-weight="700">cli.py: from .storage / .report / .errors</text><text x="330" y="167" text-anchor="middle" class="tm" font-size="10">06 relative imports · 07 one-way graph, no cycles · 04 main guard</text>
<line x1="230" y1="174" x2="120" y2="204" stroke="currentColor" marker-end="url(#pmo-a9)"/><line x1="330" y1="174" x2="330" y2="204" stroke="currentColor" marker-end="url(#pmo-a9)"/><line x1="430" y1="174" x2="540" y2="204" stroke="currentColor" marker-end="url(#pmo-a9)"/>
<rect x="20" y="206" width="200" height="40" rx="7" class="ft st"/><text x="120" y="224" text-anchor="middle" font-size="11">storage → parse → errors</text><text x="120" y="239" text-anchor="middle" class="tm" font-size="10">Exceptions + Files notes</text>
<rect x="230" y="206" width="200" height="40" rx="7" class="ft st"/><text x="330" y="224" text-anchor="middle" font-size="11">report → pandas, pyarrow</text><text x="330" y="239" text-anchor="middle" class="tm" font-size="10">09 pinned in the venv</text>
<rect x="440" y="206" width="200" height="40" rx="7" class="ft st"/><text x="540" y="224" text-anchor="middle" font-size="11">exit code 0 / 1 / 2</text><text x="540" y="239" text-anchor="middle" class="tm" font-size="10">₹230 · JSON · Parquet</text>
<text x="330" y="276" text-anchor="middle" class="tm" font-size="10.5">reproducible because pyproject.toml + lock rebuild the same venv anywhere (09, 10)</text>
</svg><figcaption>One command, every layer: the environment provides the interpreter, libraries and the command; the import system finds and runs each module once; the package's one-way imports keep it loadable.</figcaption></figure>
  <table class="tbl"><caption>Every idea on the chaistall project</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Module</td><td>a .py file</td><td>split a program?</td><td>7 files, 3–42 lines, 144 total</td><td>one job per file</td></tr>
    <tr><td>import mechanics</td><td>modules + sys.path + sys.modules</td><td>find, run, reuse?</td><td>4 files ran once; report/cli never</td><td>always (know it to debug)</td></tr>
    <tr><td>Import styles</td><td>import</td><td>which names appear?</td><td><code>from os import *</code> replaced open</td><td>explicit styles only</td></tr>
    <tr><td>__main__ guard</td><td><code>__name__</code></td><td>importable and runnable?</td><td>'__main__' vs 'shop_tools'</td><td>every runnable module</td></tr>
    <tr><td>Package, __init__, __main__</td><td>folder of modules</td><td>one unit, public API?</td><td><code>chaistall.read_orders</code>, <code>python -m chaistall</code></td><td>more than one module</td></tr>
    <tr><td>Relative import</td><td>package</td><td>siblings without the name?</td><td>cli.py by path: ImportError; -m: ₹230</td><td>inside packages</td></tr>
    <tr><td>Circular import</td><td>import + cache</td><td>what if modules need each other?</td><td>"partially initialized module"</td><td>avoid; fix by design</td></tr>
    <tr><td>venv</td><td>a private site-packages</td><td>libraries per project?</td><td>fresh venv: no yaml; system: no pyarrow</td><td>every project</td></tr>
    <tr><td>pip + requirements + pins</td><td>venv</td><td>install and record versions?</td><td>3 loose lines → 6 pinned; identical rebuild</td><td>every project</td></tr>
    <tr><td>pyproject + entry point + Poetry</td><td>all of the above</td><td>installable command, locked deps?</td><td><code>chaistall</code> command; 20-entry lock</td><td>anything shared or deployed</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>import finds a module on sys.path, runs it once and caches it; packages and relative imports organise <em>our</em> modules, and a virtual environment plus a lock file decide exactly which <em>other people's</em> modules are on that path.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The bugs that come from getting a layer wrong.</div>

  <h2 id="pmo-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which import and environment habits produce "works on my machine", mysterious ImportErrors, or slow imports, and how do you recognise each one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: naming a file like a library</span><p>csv.py, json.py, random.py, pandas.py, test.py hide the real module (sys.path[0] comes first). Rename, and delete the stale <code>__pycache__</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: running package files by path</span><p><code>python pkg/mod.py</code> breaks relative imports. Use <code>python -m pkg.mod</code> from the project root, or install the package.</p></div>
  <div class="callout trap"><span class="label">Trap: no main guard</span><p>Importing the module (tests, multiprocessing) runs the program.</p></div>
  <div class="callout trap"><span class="label">Trap: star imports</span><p>Silent name clashes (<code>open</code> replaced by <code>os.open</code>).</p></div>
  <div class="callout trap"><span class="label">Trap: circular imports</span><p>"partially initialized module". Keep the import graph one-way; import modules, not names; or import inside functions.</p></div>
  <div class="callout trap"><span class="label">Trap: heavy work at import time</span><p>Loading models or data at module top level slows every import and every test. Do it in functions.</p></div>
  <div class="callout trap"><span class="label">Trap: installing into the system Python</span><p>Breaks OS tools and other projects; one venv per project.</p></div>
  <div class="callout trap"><span class="label">Trap: the wrong interpreter</span><p>"No module named X" right after installing X: check <code>which python</code> / <code>sys.executable</code>; use <code>python -m pip</code> so pip matches the python.</p></div>
  <div class="callout trap"><span class="label">Trap: unpinned or half-pinned dependencies</span><p>Transitive packages drift; rebuilds differ. Keep a lock (frozen list, poetry.lock, uv.lock) and commit it for apps.</p></div>
  <div class="callout trap"><span class="label">Trap: committing .venv</span><p>Environments are machine-specific and huge; commit the files that rebuild them instead.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="pmo-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: the <code>chaistall/</code> package (7 files, 144 lines: <code>__init__, __main__, errors, parse, storage, report, cli</code>) with <code>pyproject.toml</code>; <code>chaistall data/orders_2026-10-19.csv</code> → 6 orders, ₹230, 3 rejected, exit code 0; missing file → exit code 2.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On our project</th><th>Weakness → next</th></tr>
    <tr><td>Modules</td><td>split the program?</td><td>7 one-job files</td><td>what does import do?</td></tr>
    <tr><td>import mechanics</td><td>find, run, reuse?</td><td>sys.path order; ran once; csv.py shadow</td><td>which style?</td></tr>
    <tr><td>Styles</td><td>which names appear?</td><td>star import replaced open</td><td>import runs the file</td></tr>
    <tr><td>__main__ guard</td><td>importable + runnable?</td><td>self-test only when run</td><td>files must form a unit</td></tr>
    <tr><td>Packages</td><td>one unit + API?</td><td>__init__ re-exports; python -m chaistall</td><td>siblings importing siblings</td></tr>
    <tr><td>Relative imports</td><td>refer to siblings?</td><td>by path fails; -m works</td><td>mutual imports</td></tr>
    <tr><td>Circular imports</td><td>modules needing each other?</td><td>partially initialized; import the module</td><td>where do libraries live?</td></tr>
    <tr><td>venv</td><td>per-project libraries?</td><td>no yaml in fresh venv</td><td>how to fill/record it?</td></tr>
    <tr><td>pip + pins</td><td>install + reproduce?</td><td>3 loose → 6 pinned; identical</td><td>our own package?</td></tr>
    <tr><td>pyproject + Poetry</td><td>installable command + lock?</td><td><code>chaistall</code> command; 20-entry lock</td><td>→ Testing, Docker</td></tr>
  </table>
  <h3>Definitions and syntax</h3>
  <ul>
    <li><strong>Module</strong> = .py file = namespace. <strong>Package</strong> = folder with <code>__init__.py</code> (runs on first import) and optionally <code>__main__.py</code> (runs for <code>python -m pkg</code>).</li>
    <li><code>import x</code>: <code>sys.modules</code> hit → reuse; else search <code>sys.path</code> (script folder, stdlib, site-packages), first match wins → create, cache, run once.</li>
    <li>Styles: <code>import x</code>, <code>import x as y</code>, <code>from x import a</code>; avoid <code>from x import *</code>; <code>__all__</code> lists the public names.</li>
    <li><code>if __name__ == "__main__":</code> — true only for the module being run.</li>
    <li>Relative: <code>from .m import n</code>, <code>from . import m</code>, <code>from ..m import n</code>; only inside a package loaded as one; run with <code>python -m pkg.mod</code>.</li>
    <li>Circular import → "cannot import name … from partially initialized module"; fix: import the module, move shared code, or import in the function.</li>
    <li><code>python -m venv .venv</code>; <code>source .venv/bin/activate</code> (Windows <code>.venv\\Scripts\\activate</code>); <code>deactivate</code>; in a venv <code>sys.prefix != sys.base_prefix</code>.</li>
    <li><code>python -m pip install pkg</code>, <code>-r requirements.txt</code>, <code>-e .</code>; <code>pip freeze</code>.</li>
    <li>Specifiers: <code>==</code> exact; <code>&gt;=a,&lt;b</code> range; <code>~=2.2</code> = <code>&gt;=2.2,&lt;3</code>; <code>~=2.2.0</code> = <code>&gt;=2.2.0,&lt;2.3</code>. SemVer MAJOR.MINOR.PATCH.</li>
    <li><code>pyproject.toml</code>: <code>[project]</code> name, version, requires-python, dependencies; <code>[project.scripts] cmd = "pkg.module:func"</code>; <code>[build-system]</code>.</li>
    <li>Poetry: <code>poetry add [--group dev] pkg</code>, <code>poetry install</code>, <code>poetry run cmd</code>, <code>poetry.lock</code>.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>A package</b><p>As soon as there are two or more related modules or anything to share.</p><small>Keep __init__.py light</small></div>
    <div><b>Relative imports</b><p>Inside a package, between siblings.</p><small>Not in scripts run by path</small></div>
    <div><b>venv</b><p>Every project, even small ones.</p><small>Not committed to git; does not isolate the OS (Docker does)</small></div>
    <div><b>requirements.txt</b><p>Simple projects; what you directly need.</p><small>Not reproducible alone: add a lock</small></div>
    <div><b>Lock file</b><p>Apps, pipelines, anything deployed.</p><small>Never edited by hand</small></div>
    <div><b>pyproject + entry point</b><p>Anything installed or shared; gives a real command.</p><small>Declare packages explicitly in a flat layout</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Library-named files (csv.py); running package files by path; no main guard; star imports; circular imports; heavy import-time work; system-Python installs; wrong interpreter; unpinned transitive deps; committing .venv.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>You import a module twice. How many times does its code run?</td><td>Once; the second import reuses <code>sys.modules</code></td></tr>
    <tr><td>Why did <code>import csv</code> load the wrong file?</td><td>A local csv.py; the script's folder is first on sys.path</td></tr>
    <tr><td>Why does <code>python chaistall/cli.py</code> fail but <code>python -m chaistall.cli</code> work?</td><td>Relative imports need the package context that -m provides</td></tr>
    <tr><td>What does <code>~=2.2</code> allow?</td><td>&gt;=2.2 and &lt;3</td></tr>
    <tr><td>Which line of pyproject.toml creates the <code>chaistall</code> command?</td><td><code>[project.scripts] chaistall = "chaistall.cli:main"</code></td></tr>
  </table>

  <h2 id="pmo-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What happens step by step when Python executes <code>import chaistall</code>?</summary><div class="qa-body">Check <code>sys.modules</code>; if absent, search the folders of <code>sys.path</code> in order for <code>chaistall</code> (a package folder), create a module object, store it in <code>sys.modules</code>, run <code>chaistall/__init__.py</code> top to bottom (which imports errors and storage, which import parse), then bind the name <code>chaistall</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__init__.py</code> for?</summary><div class="qa-body">It marks a regular package, runs on the package's first import, and defines the package's namespace: typically the version and re-exports of the public API (<code>from .storage import read_orders</code>), so users need not know the internal layout.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>if __name__ == "__main__":</code> do?</summary><div class="qa-body">The block runs only when the file is the program being run (its <code>__name__</code> is "__main__"), not when imported (then <code>__name__</code> is the module name). It keeps modules importable by tests and other code without side effects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"attempted relative import with no known parent package": cause and fix?</summary><div class="qa-body">A file using <code>from .x import y</code> was run by path, so Python does not know its package. Run it as <code>python -m package.module</code> from the project root, or install the package and use its entry point.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you fix a circular import?</summary><div class="qa-body">Best: restructure so imports go one way (move the shared code to a lower module, or the convenience function to a higher one like cli). Quick fixes: <code>from . import module</code> and use <code>module.name</code> at call time, or import inside the function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a virtual environment?</summary><div class="qa-body">Isolation: each project gets its own site-packages, so pandas 2 for one project and pandas 3 for another never clash, and the system Python (and OS tools) stay untouched. It also makes the dependency list explicit and rebuildable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>requirements.txt vs a lock file: which gives reproducible builds?</summary><div class="qa-body">The lock: every package in the tree at an exact version (with hashes in poetry.lock/uv.lock). requirements.txt usually lists direct deps with ranges, so versions drift. Here a 6-line frozen lock rebuilt an identical venv.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>pip install -e .</code> do?</summary><div class="qa-body">Installs the project in the current folder in editable mode: dependencies from pyproject.toml are installed, the package is importable from anywhere (pointing at your source, so edits apply immediately), and <code>[project.scripts]</code> commands are created in the venv's bin folder.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"I installed pandas but get ModuleNotFoundError." First check?</summary><div class="qa-body">Which interpreter is running: <code>which python</code> / <code>import sys; print(sys.executable)</code>. pip and python may belong to different environments; use <code>python -m pip install …</code> and activate the venv.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did the Exceptions note's error classes need this note to become useful to others?</summary><div class="qa-body">Callers can only write <code>except chaistall.BadRowError</code> if they can import it. Putting the family in <code>chaistall/errors.py</code> and re-exporting it from <code>__init__.py</code> gives one shared class object (the trace showed <code>chaistall.errors.BadRowError is BadRowError</code>), which is what makes <code>except</code> match across modules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do "a module runs once" and "circular imports" relate?</summary><div class="qa-body">Because a module is cached in <code>sys.modules</code> <em>before</em> it runs, the second module in a cycle receives the half-run first module instead of running it again (which would loop forever). The cache prevents infinite recursion but exposes names that do not exist yet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you organise the package perfectly but skip the environment layer?</summary><div class="qa-body">The code runs only where the right libraries happen to be installed: the system python3 had pandas but not pyarrow, so the import reached the archive and died. A teammate gets different versions. venv + lock fix both; Docker extends the same idea to the OS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does this note make testing possible?</summary><div class="qa-body">pytest imports your code. That needs an importable package (on sys.path via an editable install), no side effects on import (main guard, light <code>__init__</code>), functions that take arguments (<code>main(argv)</code>), and a pinned environment so tests behave the same in CI (<a class="xref" data-note="py_testing">Testing &amp; Debugging</a>).</div></details>
</main>
`
});
