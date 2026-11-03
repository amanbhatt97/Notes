// notes/python/py_modules.js — Modules, Packages & Environments
Object.assign(TOPIC_CONTENT, {
  "py_modules": `<main>
<h1>Modules, Packages &amp; Environments</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Modules, Packages &amp; Environments</span></div>
  <p class="lead">A module is a <code>.py</code> file you can import; a package is a folder of modules; an environment is the set of third-party libraries your interpreter can see. Without modules, a growing script becomes one file nobody can test piece by piece; without understanding <code>import</code>, you hit shadowed modules, "attempted relative import with no known parent package" and circular-import errors; without isolated, pinned environments, code that works on your laptop fails on a teammate's machine or in production because a library version differs. Every DS/ML and backend project relies on all three: importable packages for tests, <code>venv</code>/Poetry/uv for dependencies, and <code>pyproject.toml</code> to make a project installable with its own command. Commands and code were run on Python 3.13, pip 24 and Poetry 2.4.3; long folder names are shortened to <code>~/chaistall</code>.</p>

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
          <li><code>__main__.py</code> → <code>python -m pkg</code></li>
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
          <li><code>[project.scripts] cmd = "pkg.cli:main"</code></li>
          <li><code>pip install -e .</code> = editable install + command</li>
          <li>Poetry/uv: <code>add</code>, lock file, <code>install</code>, <code>run</code></li>
          <li>Commit the lock for apps; libraries publish ranges</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pmo-split"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Modules and Namespaces</span><span class="rm-sub">Splitting a program by responsibility</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-import"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How import Works</span><span class="rm-sub">sys.path, sys.modules, run once</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-styles"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Import Styles</span><span class="rm-sub">as, from, star imports, reload</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-main"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">if __name__ == "__main__"</span><span class="rm-sub">Importable and runnable files</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pkg"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Packages, __init__.py, __main__.py</span><span class="rm-sub">Public API, python -m</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-rel"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Relative vs Absolute Imports</span><span class="rm-sub">Dots, -m, no known parent</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-circ"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Circular Imports</span><span class="rm-sub">Partially initialized modules, fixes</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-venv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Virtual Environments</span><span class="rm-sub">venv, activation, wrong interpreter</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pip"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">pip, requirements.txt, Pinning</span><span class="rm-sub">Freeze, locks, version specifiers</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pyproject"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">pyproject.toml, Entry Points, Poetry</span><span class="rm-sub">Installable command, lock files</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Import and environment bugs</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Syntax, rules and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Basic to advanced, with answers</span></div></div>
    </div>
  </div>

  <h2 id="pmo-split"><span class="num">01</span>Modules and Namespaces</h2>
  <p>A <strong>module</strong> is a <code>.py</code> file. Its top-level names (functions, classes, variables) form its <strong>namespace</strong>, and another file gets them with <code>import</code>. Splitting a program into modules by responsibility makes each part readable on one screen, testable alone, and reusable. <code>import json</code> loads a standard-library module; your own files work exactly the same way. A CSV importer split one job per module (the exceptions, parser, reader and writers come from <a class="xref" data-note="py_exceptions">Exceptions</a> and <a class="xref" data-note="py_files">Files</a>):</p>
  <div class="fx" data-lang="text">~/chaistall/                      ← the project folder
├── pyproject.toml                ← describes the project (section 10)
├── data/orders_2026-10-19.csv    ← input (not code)
└── chaistall/                    ← the package (section 05)
    ├── __init__.py               ← runs on "import chaistall"; public API
    ├── __main__.py               ← "python -m chaistall" starts here
    ├── errors.py                 ← exception classes
    ├── parse.py                  ← to_int, parse_row
    ├── storage.py                ← read_orders: CSV → rows
    ├── report.py                 ← summarise, JSON, Parquet
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
  <p>144 lines in seven files. A test can do <code>from chaistall.parse import parse_row</code> without touching files or pandas, and names do not collide: <code>storage.log</code> and <code>cli.log</code> live in different namespaces.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>module</strong> is a file of Python code; once imported it is a module object whose attributes are the file's top-level names. A <strong>package</strong> is a folder of modules (section 05). A <strong>library</strong> is informal: one or more packages distributed together (e.g. on PyPI).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Splitting by size ("part1.py, part2.py") instead of by job gives modules that all import each other (section 07). Split by responsibility.</p></div>

  <h2 id="pmo-import"><span class="num">02</span>How import Works: sys.path, sys.modules, Run Once</h2>
  <p>Knowing exactly what <code>import</code> does explains most import bugs: why a local file can hide a library, why module code runs only once, and why circular imports fail.</p>
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
  <p><code>import json</code> binds the name <code>json</code> to an object of type <code>module</code>, built from <code>json/__init__.py</code>; <code>json.dumps</code> is an attribute of it. <code>dir()</code> lists a module's names.</p>
  <h3>Step 1: search sys.path</h3>
  <p>For a module not loaded yet, Python looks through the folders in <code>sys.path</code>, in order, and takes the <em>first</em> match. Printed from a script in the project folder, inside the project's virtual environment:</p>
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
  <p>Entry 0 is the folder of the script you ran (the current folder for <code>python -m</code> or <code>-c</code>), then any <code>PYTHONPATH</code> folders, then the standard library, then the environment's <code>site-packages</code>, where pip installs.</p>
  <h3>Step 2: create, cache, run once</h3>
  <p>When found, Python creates an empty module object, <strong>stores it in <code>sys.modules</code></strong>, then <strong>runs the file top to bottom</strong>; each <code>def</code>, <code>class</code> and assignment fills the namespace. Traced with a <code>print("  running chaistall/&lt;file&gt;")</code> at the top of each file:</p>
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
  <p><code>import chaistall</code> ran <code>__init__.py</code>, whose imports ran <code>errors.py</code> and <code>storage.py</code>, whose imports needed <code>errors</code> (cached, not re-run) and <code>parse.py</code>. The second import printed nothing: both hits came from <code>sys.modules</code>. <code>report.py</code> and <code>cli.py</code> never ran because nothing imported them. Every importer shares one object (<code>is</code> is True), which is why <code>except BadRowError</code> in one module matches what another module raised.</p>
  <div class="flow"><span>import x</span><span>in sys.modules? → reuse it</span><span>else search sys.path in order</span><span>create module, add to sys.modules</span><span>run the file top to bottom once</span><span>bind the name x</span></div>
  <h3>Shadowing a standard module</h3>
  <p>Because the script's folder comes first, a local file named like a real module wins. A scratch file saved as <code>csv.py</code> next to the script:</p>
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
  <p>Python 3.13 names the cause in the message. Never name files <code>csv.py</code>, <code>json.py</code>, <code>random.py</code>, <code>pandas.py</code>, <code>test.py</code> or any library's name.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>import x</code>: if <code>"x"</code> is in <code>sys.modules</code>, bind that object; otherwise find <code>x</code> on <code>sys.path</code> (first match wins), create a module object, store it in <code>sys.modules["x"]</code>, execute its code, bind the name. A module's code runs once per process. Compiled bytecode is cached in <code>__pycache__/*.cpython-313.pyc</code> to skip re-compiling, not re-running.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Top-level code runs at import time. Loading a model or a big file at module level makes every <code>import</code> (and every test) slow. Put it in functions.</p></div>

  <h2 id="pmo-styles"><span class="num">03</span>Import Styles</h2>
  <p>Every import style loads the module the same way; they differ only in which names they create in <em>your</em> namespace.</p>
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
  <p><code>from os import *</code> copied every public name of <code>os</code>, including the low-level <code>os.open</code>, which silently replaced the built-in <code>open</code>. Nothing warned.</p>
  <table class="tbl">
    <tr><th>style</th><th>creates the name</th><th>use when</th></tr>
    <tr><td><code>import json</code></td><td><code>json</code></td><td>default; <code>json.dumps</code> says where it came from</td></tr>
    <tr><td><code>import datetime as dt</code></td><td><code>dt</code></td><td>long names, or conventions (<code>import pandas as pd</code>)</td></tr>
    <tr><td><code>from collections import Counter</code></td><td><code>Counter</code></td><td>a few names used often</td></tr>
    <tr><td><code>from os import *</code></td><td>everything in <code>os.__all__</code></td><td>never in real code</td></tr>
  </table>
  <h3>from-import copies a binding; reload re-runs a module</h3>
  <div class="fx" data-lang="py"># counter.py contains:  print("counter.py runs"); count = 0
import importlib
import counter
import counter
counter.count += 5
from counter import count
print("count via from-import:", count)
importlib.reload(counter)
print("after reload:", counter.count, "| stale copy:", count)
mod = importlib.import_module("json")     # import by a name held in a string
print(mod.dumps({"ok": True}))</div>
  <div class="fx" data-lang="text">counter.py runs
count via from-import: 5
counter.py runs
after reload: 0 | stale copy: 5
{"ok": true}</div>
  <p>Two imports ran the file once. <code>from counter import count</code> bound a local name to the current value; <code>importlib.reload</code> re-ran the file (the module's <code>count</code> is 0 again) but the local copy still holds 5. <code>importlib.import_module</code> imports by a string name, used for plugins and configurable back ends.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>import a.b</code> binds <code>a</code>; <code>import a.b as c</code> binds <code>c</code> to <code>a.b</code>; <code>from a.b import n</code> binds <code>n</code>; <code>from m import *</code> binds every name in <code>m.__all__</code> (or every name not starting with <code>_</code>). <code>__all__</code> declares the public API for star imports.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>from module import name</code> copies the <em>current</em> object. If the module later rebinds <code>name</code>, your copy does not change. This is also why mocking must patch the name where it is <em>used</em> (see <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>).</p></div>

  <h2 id="pmo-main"><span class="num">04</span>if __name__ == "__main__"</h2>
  <p>Since importing a file runs it, a file that does work at top level would start that work whenever a test imports it. Every module has a variable <code>__name__</code>: the module name when imported, <code>"__main__"</code> when it is the program being run. So <code>if __name__ == "__main__":</code> means "only when I am the program".</p>
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
  <p>Imported, the top-level <code>print</code> still ran but the guarded self-test did not. A CLI module ends the same way, with the logic in a <code>main()</code> function that returns an exit code:</p>
  <div class="fx" data-lang="py">"""chaistall/cli.py: command-line entry point."""
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
  <p><code>main(argv=None)</code> parses arguments, returns 0 / 1 / 2 as the process exit code, and accepts <code>argv</code> so a test can call <code>main(["data/x.csv"])</code>. <code>raise SystemExit(main())</code> hands the code to the OS. argparse and exit codes in depth: <a class="xref" data-note="py_io">Input, Output &amp; CLI Programs</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>__name__</code> is <code>"__main__"</code> for the module Python was asked to run (by path, <code>-m</code>, or <code>-c</code>) and the dotted module name otherwise. The <strong>main guard</strong> keeps program-only code out of imports.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Without the guard, importing the module in a test, or by <a class="xref" data-note="py_multiprocessing">multiprocessing</a> with the spawn start method (which re-imports your main file in each worker), runs the whole program again. Keep logic in functions; call them under the guard.</p></div>

  <h2 id="pmo-pkg"><span class="num">05</span>Packages, __init__.py and __main__.py</h2>
  <p>A <strong>package</strong> is a folder of modules that is itself importable, so related modules become one unit with a small public surface. A regular package contains <code>__init__.py</code>: it runs on the first import of the package (seen in the trace above) and its names become the package's names. Use it for the version and the few names users need:</p>
  <div class="fx" data-lang="py">"""chaistall: import one day of orders."""
__version__ = "0.1.0"

from .errors import ChaiStallError, BadRowError   # re-export the public API
from .storage import read_orders</div>
  <p>Users write <code>chaistall.read_orders(…)</code> and <code>except chaistall.ChaiStallError</code> without knowing the internal layout, so <code>read_orders</code> can move later without breaking them. <code>__main__.py</code> is what <code>python -m chaistall</code> runs:</p>
  <div class="fx" data-lang="py">from .cli import main

raise SystemExit(main())</div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>regular package</strong> is a directory with <code>__init__.py</code>; importing it executes that file, and submodules become attributes once imported (<code>chaistall.errors</code>). <code>__main__.py</code> is executed by <code>python -m package</code>. A directory without <code>__init__.py</code> is still importable as a <strong>namespace package</strong> (PEP 420, for splitting one package across folders), but normal projects should include <code>__init__.py</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Heavy imports in <code>__init__.py</code> (pandas, a model) are paid by everyone who imports anything from the package, even <code>chaistall.errors</code>. Keep it light; here pandas is imported inside <code>write_archive</code>.</p></div>

  <h2 id="pmo-rel"><span class="num">06</span>Relative vs Absolute Imports</h2>
  <p>A <strong>relative import</strong> names a module by its position in the current package: <code>.</code> is "this package", <code>..</code> the parent. <code>from .parse import parse_row</code> in <code>storage.py</code> means "from the sibling module <code>parse</code>", so the package can be renamed or vendored without editing every import. Python resolves the dots from the module's <code>__package__</code>, which is set only when the file was imported <em>as part of the package</em>. Three ways to start the importer:</p>
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
  <p>Run by path, the file is just <code>__main__</code> with no package, so the relative import fails. <code>python -m chaistall.cli</code> imports the package first, so the dots resolve; <code>python -m chaistall</code> runs <code>__main__.py</code>. Both <code>-m</code> forms need the project folder on <code>sys.path</code> (the current folder, for <code>-m</code>); installing the package (section 10) removes that restriction.</p>
  <table class="tbl">
    <tr><th>in file</th><th>relative</th><th>absolute equivalent</th></tr>
    <tr><td><code>chaistall/storage.py</code></td><td><code>from .parse import parse_row</code></td><td><code>from chaistall.parse import parse_row</code></td></tr>
    <tr><td><code>chaistall/cli.py</code></td><td><code>from . import __version__</code></td><td><code>from chaistall import __version__</code></td></tr>
    <tr><td><code>chaistall/io/csv_in.py</code> (nested)</td><td><code>from ..errors import BadRowError</code></td><td><code>from chaistall.errors import BadRowError</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>Relative imports resolve against the current module's <code>__package__</code>; they work only in a module loaded as part of a package (via <code>import</code> or <code>python -m pkg.mod</code>), never in a file run by path. Absolute imports work anywhere the top-level package is on <code>sys.path</code>. PEP 8 recommends absolute imports, with explicit relative imports acceptable inside packages.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Fixing" the ImportError with <code>sys.path.insert(0, "..")</code> hacks. Run modules with <code>python -m package.module</code> from the project root, or install the package.</p></div>

  <h2 id="pmo-circ"><span class="num">07</span>Circular Imports</h2>
  <p>A circular import happens when two modules import each other at top level. Because a module is placed in <code>sys.modules</code> <em>before</em> its code runs, the second module receives a half-run first module. A minimal reproduction, with a print at the start and end of each module:</p>
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
  <p>(1) Importing <code>storage</code> caches an empty module and starts running it. (2) Its line 2 imports <code>report</code>, which starts running. (3) <code>report</code> asks for <code>read_orders</code> from <code>storage</code>, which is in <code>sys.modules</code> but stopped at line 2 and has not reached <code>def read_orders</code>. The name does not exist yet, so the import fails.</p>
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
    <li><strong>Import the module, not the name.</strong> <code>from . import storage</code> needs only the (partial) module object; <code>storage.read_orders</code> is looked up when the function is <em>called</em>, after storage has finished.</li>
    <li><strong>Move the shared piece</strong> into a third module both can import, or move the function that needs both up into a higher layer (here, <code>cli.py</code>). This is the real fix: a cycle usually signals mixed responsibilities.</li>
    <li><strong>Import inside the function</strong> that needs it, so the import happens at call time.</li>
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
  <p>Both modules finish (report inside storage's import) and the call works. A layered design avoids the problem entirely: imports flow one way, cli → report/storage → parse → errors.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>circular import</strong> is a cycle in the import graph. The second module in the cycle receives a <strong>partially initialized</strong> module: <code>from m import name</code> fails if <code>name</code> is defined after the cycle point, while <code>import m</code> succeeds and defers attribute lookup.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The error appears far from the cause and can depend on import order (a test that imports <code>report</code> first may fail differently). Treat a cycle as a design smell, not something to paper over.</p></div>

  <h2 id="pmo-venv"><span class="num">08</span>Virtual Environments</h2>
  <p>Third-party packages install into a <code>site-packages</code> folder shared by everything using that interpreter, so project A's pandas 2 and project B's pandas 3 cannot coexist, and system tools may break. A <strong>virtual environment</strong> (venv) is a folder with a link to a Python interpreter plus its <em>own, empty</em> <code>site-packages</code>. Using the venv's <code>python</code> puts that folder, not the system's, on <code>sys.path</code>. <strong>Activating</strong> (<code>source .venv/bin/activate</code>) only puts <code>.venv/bin</code> first on the shell's <code>PATH</code>, so <code>python</code> and <code>pip</code> mean the venv's.</p>
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
  <p>Inside the venv the system's PyYAML is invisible (isolation), <code>sys.prefix != sys.base_prefix</code> confirms you are in a venv, and <code>pip install</code> writes into the venv's own site-packages. The venv itself is described by a small <code>pyvenv.cfg</code> file:</p>
  <div class="fx" data-lang="text">home = /usr/local/bin
include-system-site-packages = false
version = 3.13.18
executable = /usr/local/bin/python3.13</div>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
<rect x="10" y="10" width="250" height="104" rx="8" class="fb sb"/><text x="22" y="32" font-size="12" font-weight="700">old-report/.venv</text>
<text x="22" y="54" class="tm" font-size="11">python 3.13</text><text x="22" y="74" font-size="11">pandas 2.2.3</text><text x="22" y="94" font-size="11">no pyarrow</text>
<rect x="300" y="10" width="250" height="104" rx="8" class="fg sg"/><text x="312" y="32" font-size="12" font-weight="700">chaistall/.venv</text>
<text x="312" y="54" class="tm" font-size="11">python 3.13</text><text x="312" y="74" font-size="11">pandas 3.0.6 · pyarrow 26.0.0</text><text x="312" y="94" font-size="11">PyYAML 6.0.2</text>
<rect x="130" y="126" width="300" height="26" rx="6" class="fs" stroke="currentColor"/><text x="280" y="144" text-anchor="middle" class="tm" font-size="11">system Python: the OS's packages, leave alone</text>
</svg><figcaption>Each project has its own site-packages; versions never clash, and the system Python stays untouched.</figcaption></figure>
  <h3>The wrong-interpreter bug</h3>
  <p>The most common environment bug is the right code on the wrong Python. After <code>deactivate</code>, the system <code>python3</code> has pandas but not pyarrow:</p>
  <div class="fx" data-lang="text">$ deactivate 2&gt;/dev/null; which python3
/usr/bin/python3
$ python3 -m chaistall data/orders_2026-10-19.csv --out out
WARNING chaistall.storage: skipped line 8, qty: 'two' is not a whole number
WARNING chaistall.storage: skipped line 9, price: is empty
WARNING chaistall.storage: skipped line 10, qty: -1 must be positive
Traceback (most recent call last):
  ... (frames inside pandas trimmed) ...
ImportError: Unable to find a usable engine; tried using: 'pyarrow', 'fastparquet'.</div>
  <p>When you see "No module named …" for something you <em>know</em> you installed, check <code>which python</code> / <code>sys.executable</code>, and install with <code>python -m pip</code> so pip matches the interpreter.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>python -m venv DIR</code> creates an isolated environment with its own <code>site-packages</code> and scripts folder (<code>bin/</code>, or <code>Scripts\\</code> on Windows). Activation prepends it to <code>PATH</code>; calling <code>DIR/bin/python</code> directly works without activation. Environments are disposable: never commit <code>.venv</code>; rebuild it from a lock file. conda environments do the same and can also install non-Python libraries (CUDA, MKL).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>sudo pip install</code> into the system Python can break OS tools (many distributions now refuse: "externally-managed-environment"). A venv does not isolate system libraries or the OS itself; that is what <a class="xref" data-note="se_docker">Docker</a> adds.</p></div>

  <h2 id="pmo-pip"><span class="num">09</span>pip, requirements.txt and Version Pinning</h2>
  <p>"pip install pandas" today and in six months give different versions, so the project must record what it needs precisely enough to rebuild. <strong>pip</strong> installs packages from PyPI together with their <strong>transitive dependencies</strong>; <code>pip freeze</code> prints every installed package at its exact version. Two lists answer different questions:</p>
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
  <p><code>requirements.txt</code> lists three direct dependencies with ranges. Installing them pulled in numpy, python-dateutil and six, so the frozen list has six exact pins: a <strong>lock</strong>. A fresh venv installed from the lock is identical; one installed from the loose file gets whatever is newest that day.</p>
  <h3>Version specifiers</h3>
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
    <tr><th>specifier</th><th>means</th><th>use for</th></tr>
    <tr><td><code>==2.2.3</code></td><td>exactly this</td><td>lock files, deployed apps</td></tr>
    <tr><td><code>&gt;=2.2</code></td><td>this or newer, forever</td><td>risky: includes the next major version</td></tr>
    <tr><td><code>&gt;=2.2,&lt;3</code></td><td>at least 2.2, below 3</td><td>libraries: "works with 2.x from 2.2"</td></tr>
    <tr><td><code>~=2.2</code></td><td>compatible release = <code>&gt;=2.2,&lt;3</code></td><td>short form of the line above</td></tr>
    <tr><td><code>~=2.2.0</code></td><td><code>&gt;=2.2.0,&lt;2.3</code></td><td>bug-fix updates only</td></tr>
  </table>
  <p><strong>Semantic versioning</strong>, MAJOR.MINOR.PATCH: a new MAJOR may break your code, MINOR adds features, PATCH fixes bugs; hence upper bounds at the next major.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>requirements file</strong> lists direct dependencies, usually with ranges. A <strong>lock</strong> lists every package in the dependency tree at an exact version (real lock files also store hashes). <strong>Pinning</strong> = fixing a version with <code>==</code>. <code>pip install -r file</code> installs a list; <code>pip install --require-hashes</code> verifies downloads.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Pinning only direct dependencies is not reproducible: transitive packages drift. And <code>pip freeze &gt; requirements.txt</code> as your only file mixes "what we need" with "what happened to be installed"; keep both lists, or let Poetry/uv manage them.</p></div>

  <h2 id="pmo-pyproject"><span class="num">10</span>pyproject.toml, Entry Points and Poetry</h2>
  <p>To install your own project like any library, with its dependencies and a command you can type from any folder, it needs a <code>pyproject.toml</code>: the standard project file, in TOML, holding name, version, supported Python, dependencies, commands, and the <strong>build backend</strong> that turns the folder into an installable package.</p>
  <div class="fx" data-lang="text">[project]
name = "chaistall"
version = "0.1.0"
description = "Import one day of orders"
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
  <p><code>[project]</code> holds metadata and dependency ranges. <code>[project.scripts]</code> declares an <strong>entry point</strong>: a command <code>chaistall</code> that calls <code>main</code> in <code>chaistall.cli</code>. <code>[build-system]</code> names the build tool. The last line is needed because, without it, setuptools found two top-level folders (<code>data</code> and <code>chaistall</code>) and refused to guess ("Multiple top-level packages discovered in a flat-layout"); a <code>src/</code> layout avoids this.</p>
  <h3>Editable install and the generated command</h3>
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
  <p><code>pip install -e .</code> read pyproject.toml, installed the dependencies and registered the package in <strong>editable</strong> mode: the venv points at the source folder, so edits apply without reinstalling. pip also generated <code>.venv/bin/chaistall</code>, a tiny script that imports <code>main</code> and calls <code>sys.exit(main())</code>. The command now works from any folder, with exit code 0 on success and 2 for a missing file.</p>
  <h3>Poetry (and uv): pyproject plus a lock file</h3>
  <p><strong>Poetry</strong> and the newer, much faster <strong>uv</strong> manage the cycle: create the venv, edit pyproject.toml when you add a dependency, and maintain a lock file with exact versions and hashes. Run on a copy of the project:</p>
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
  <p>pytest went into a <em>dev</em> dependency group (needed to develop, not to use). The lock has 20 entries, more than were installed, because it covers every Python version allowed by <code>requires-python = "&gt;=3.10"</code>: pandas 2.3.3 for Python 3.10 (pandas 3 needs 3.11+) and 3.0.6 for newer. <code>poetry install</code> recreates the environment from the lock on any machine. The uv equivalents are <code>uv add</code>, <code>uv.lock</code>, <code>uv sync</code>, <code>uv run</code>.</p>
  <table class="tbl">
    <tr><th></th><th>requirements.txt</th><th>pyproject.toml</th><th>lock file (poetry.lock, uv.lock, frozen list)</th></tr>
    <tr><td>Written by</td><td>you</td><td>you (or <code>poetry add</code>)</td><td>the tool; never by hand</td></tr>
    <tr><td>Contains</td><td>direct deps, ranges</td><td>metadata, direct deps, scripts, build backend</td><td>every package, exact versions (+ hashes)</td></tr>
    <tr><td>Answers</td><td>what to install</td><td>what this project is and needs</td><td>exactly what was installed</td></tr>
    <tr><td>Commit to git?</td><td>yes</td><td>yes</td><td>yes for apps/pipelines; libraries publish ranges only</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><code>pyproject.toml</code> declares metadata (<code>[project]</code>), dependencies, console scripts (<code>[project.scripts] name = "module:function"</code>) and the build system. <code>pip install -e .</code> installs in editable mode and creates the scripts; <code>python -m build</code> produces a wheel (<code>.whl</code>) and sdist for publishing. Poetry/uv add resolution, a lock file and environment management.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Editing a lock file by hand, or not committing it, brings back "works on my machine". Change dependencies through the tool and commit pyproject.toml and the lock together.</p></div>

  <h2 id="pmo-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: naming a file like a library</span><p>csv.py, json.py, random.py, pandas.py, test.py hide the real module (sys.path[0] comes first). Rename, and delete the stale <code>__pycache__</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: running package files by path</span><p><code>python pkg/mod.py</code> breaks relative imports. Use <code>python -m pkg.mod</code> from the project root, or install the package.</p></div>
  <div class="callout trap"><span class="label">Trap: no main guard</span><p>Importing the module (tests, multiprocessing) runs the program.</p></div>
  <div class="callout trap"><span class="label">Trap: star imports</span><p>Silent name clashes (<code>open</code> replaced by <code>os.open</code>).</p></div>
  <div class="callout trap"><span class="label">Trap: circular imports</span><p>"partially initialized module". Keep the import graph one-way; import modules, not names; or import inside functions.</p></div>
  <div class="callout trap"><span class="label">Trap: heavy work at import time</span><p>Loading models or data at module top level slows every import and every test.</p></div>
  <div class="callout trap"><span class="label">Trap: installing into the system Python</span><p>Breaks OS tools and other projects; one venv per project.</p></div>
  <div class="callout trap"><span class="label">Trap: the wrong interpreter</span><p>"No module named X" right after installing X: check <code>which python</code> / <code>sys.executable</code>; use <code>python -m pip</code>. In Jupyter, the kernel may be a different interpreter from your shell.</p></div>
  <div class="callout trap"><span class="label">Trap: unpinned or half-pinned dependencies</span><p>Transitive packages drift; rebuilds differ. Keep a lock and commit it for apps.</p></div>
  <div class="callout trap"><span class="label">Trap: committing .venv</span><p>Environments are machine-specific and huge; commit the files that rebuild them.</p></div>

  <h2 id="pmo-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Modules and import</h3>
  <ul>
    <li><strong>Module</strong> = .py file = namespace (module object). <strong>Package</strong> = folder with <code>__init__.py</code>.</li>
    <li><code>import x</code>: <code>sys.modules</code> hit → reuse; else search <code>sys.path</code> (script folder / cwd, PYTHONPATH, stdlib, site-packages), first match wins → create, cache in <code>sys.modules</code>, run once, bind name.</li>
    <li>Module code runs once per process; <code>importlib.reload(m)</code> re-runs it; <code>importlib.import_module("name")</code> imports by string.</li>
    <li><code>__pycache__/*.pyc</code> caches bytecode (skips compiling, not running).</li>
    <li>Local <code>csv.py</code> shadows the stdlib <code>csv</code>.</li>
  </ul>
  <h3>Import styles</h3>
  <table class="tbl">
    <tr><th>statement</th><th>binds</th></tr>
    <tr><td><code>import a.b</code></td><td><code>a</code> (use <code>a.b.x</code>)</td></tr>
    <tr><td><code>import a.b as c</code></td><td><code>c</code> = module <code>a.b</code></td></tr>
    <tr><td><code>from a.b import x</code></td><td><code>x</code> (a copy of the binding)</td></tr>
    <tr><td><code>from a import *</code></td><td>names in <code>a.__all__</code> or all non-<code>_</code> names — avoid</td></tr>
  </table>
  <h3>__main__, packages, relative imports</h3>
  <ul>
    <li><code>__name__ == "__main__"</code> only in the module being run (path, <code>-m</code>, <code>-c</code>).</li>
    <li><code>__init__.py</code>: runs on first import; version + public re-exports; keep light. <code>__main__.py</code>: run by <code>python -m pkg</code>.</li>
    <li>Relative: <code>from .m import n</code>, <code>from . import m</code>, <code>from ..m import n</code>; need <code>__package__</code> → fail when the file is run by path ("no known parent package"). Use <code>python -m pkg.mod</code>.</li>
  </ul>
  <h3>Circular imports</h3>
  <ul>
    <li>Cause: a module is cached before it runs, so the other side sees it half-initialized → "cannot import name … from partially initialized module".</li>
    <li>Fixes: restructure (one-way layers, shared code down / combining code up); <code>import m</code> and use <code>m.name</code> at call time; import inside the function.</li>
  </ul>
  <h3>Environments and dependencies</h3>
  <div class="fx" data-lang="text">python -m venv .venv && source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
python -m pip install -r requirements.txt            # or: pip install -e .
pip freeze &gt; requirements-lock.txt
python -c "import sys; print(sys.executable, sys.prefix != sys.base_prefix)"</div>
  <table class="tbl">
    <tr><th>specifier</th><th>allows</th></tr>
    <tr><td><code>==2.2.3</code></td><td>exactly 2.2.3</td></tr>
    <tr><td><code>&gt;=2.2,&lt;3</code> / <code>~=2.2</code></td><td>2.2 ≤ v &lt; 3</td></tr>
    <tr><td><code>~=2.2.0</code></td><td>2.2.0 ≤ v &lt; 2.3</td></tr>
  </table>
  <ul>
    <li>requirements.txt = direct deps (ranges); lock = full tree, exact pins (+ hashes); commit the lock for apps, publish ranges for libraries.</li>
    <li><code>pyproject.toml</code>: <code>[project]</code> name, version, requires-python, dependencies; <code>[project.scripts] cmd = "pkg.module:func"</code>; <code>[build-system]</code>.</li>
    <li><code>pip install -e .</code> = editable install + console scripts. Poetry: <code>add</code>, <code>install</code>, <code>run</code>, <code>poetry.lock</code>; uv: <code>add</code>, <code>sync</code>, <code>run</code>, <code>uv.lock</code>.</li>
    <li>venv isolates Python packages only; Docker isolates the OS too.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Library-named files shadow real modules.</li>
    <li>No main guard → program runs on import (tests, multiprocessing spawn).</li>
    <li><code>from os import *</code> replaced <code>open</code>.</li>
    <li><code>from m import x</code> does not see later rebinding of <code>m.x</code>.</li>
    <li>"No module named X" after installing → wrong interpreter; use <code>python -m pip</code>.</li>
    <li>Never commit <code>.venv</code>; never edit a lock by hand.</li>
  </ul>

  <h2 id="pmo-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a module, a package and a library?</summary><div class="qa-body">A module is a single <code>.py</code> file (or compiled extension) that becomes a module object when imported. A package is a directory of modules, normally with <code>__init__.py</code>, importable as a unit with dotted names (<code>chaistall.parse</code>). "Library" is informal: one or more packages distributed together, e.g. installed from PyPI with pip.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens step by step when Python executes <code>import x</code>?</summary><div class="qa-body">It checks <code>sys.modules</code>; if <code>x</code> is there, it just binds the name. Otherwise it searches <code>sys.path</code> in order for <code>x.py</code> or a package <code>x/</code>, creates a module object, inserts it into <code>sys.modules</code>, executes the module's code top to bottom in that namespace, and binds <code>x</code> in the importing scope. For a package it runs <code>__init__.py</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If two files both import the same module, how many times does its code run?</summary><div class="qa-body">Once per process. The first import runs it and caches the module in <code>sys.modules</code>; later imports anywhere reuse the same object, so module-level state is shared (which is why a module works as a simple singleton). <code>importlib.reload</code> forces a re-run, but names copied earlier with <code>from m import x</code> keep the old objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>sys.path</code> and how can you change where Python looks for modules?</summary><div class="qa-body">A list of directories searched in order: the running script's directory (or the current directory for <code>-m</code>/<code>-c</code>), entries from the <code>PYTHONPATH</code> environment variable, the standard library, then site-packages. Prefer installing your package (<code>pip install -e .</code>) over setting PYTHONPATH or doing <code>sys.path.append</code> in code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>import module</code> and <code>from module import name</code>?</summary><div class="qa-body">Both load and run the module the same way. <code>import module</code> binds the module object; you access <code>module.name</code> at use time, so you always see the current value. <code>from module import name</code> binds the object <code>name</code> refers to right now; later rebinding inside the module is not seen. This matters for circular imports and for mocking, where you must patch the name in the module that uses it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>from module import *</code> discouraged?</summary><div class="qa-body">It dumps unknown names into your namespace, silently overwriting existing ones (<code>from os import *</code> replaces the built-in <code>open</code> with <code>os.open</code>), makes it unclear where a name came from, and confuses linters. A module can limit what <code>*</code> exports with <code>__all__</code>, but explicit imports are still better.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>if __name__ == "__main__":</code> do, and why is it needed?</summary><div class="qa-body">The block runs only when the file is executed as the program (its <code>__name__</code> is <code>"__main__"</code>), not when imported (then <code>__name__</code> is the module name). It keeps a module importable by tests and other code without side effects, and it is required with multiprocessing's spawn start method, which re-imports the main module in each worker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__init__.py</code> for? Is it still required?</summary><div class="qa-body">It marks a regular package and runs on the package's first import; typical content is <code>__version__</code> and re-exports of the public API (<code>from .storage import read_orders</code>), so users need not know the internal layout. Since Python 3.3 a folder without it can be imported as a namespace package, but that is meant for packages split across directories; ordinary projects should keep <code>__init__.py</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>python script.py</code> and <code>python -m package.module</code>?</summary><div class="qa-body"><code>python script.py</code> runs the file as a top-level script: <code>sys.path[0]</code> is the script's folder and the file has no package, so relative imports fail. <code>python -m package.module</code> finds the module on <code>sys.path</code> (the current folder first), imports its parent package, then runs it as <code>__main__</code>, so relative imports work. <code>python -m pkg</code> runs <code>pkg/__main__.py</code>; <code>python -m pip</code> guarantees pip belongs to that interpreter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"ImportError: attempted relative import with no known parent package": cause and fix?</summary><div class="qa-body">A file using <code>from .x import y</code> was run by path, so its <code>__package__</code> is empty and the dots cannot be resolved. Run it as <code>python -m package.module</code> from the project root, switch to absolute imports, or install the package and use its entry point. Do not hack <code>sys.path</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What causes a circular import error, and how do you fix it?</summary><div class="qa-body">Module A imports B at top level while B imports A. A is cached in <code>sys.modules</code> before it finishes running, so B gets a partially initialized A, and <code>from A import f</code> fails if <code>f</code> is defined below A's import line. Best fix: restructure into one-way layers (move shared code into a lower module, or the function that needs both into a higher one). Quick fixes: <code>import A</code> and use <code>A.f</code> at call time, or import inside the function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a virtual environment, and how does it work?</summary><div class="qa-body">Isolation: each project gets its own site-packages, so conflicting versions never clash and the system Python stays untouched; it also makes dependencies explicit and rebuildable. A venv is a folder with a <code>pyvenv.cfg</code>, links to a base interpreter and its own <code>site-packages</code>; running its <code>python</code> sets <code>sys.prefix</code> to the venv. Activation only prepends <code>.venv/bin</code> to <code>PATH</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You installed pandas but still get <code>ModuleNotFoundError</code>. What do you check?</summary><div class="qa-body">Which interpreter is running: <code>which python</code>, <code>python -c "import sys; print(sys.executable)"</code>, and the Jupyter kernel's interpreter. pip and python often belong to different environments; activate the venv and install with <code>python -m pip install pandas</code>. Also check for a local file named <code>pandas.py</code> shadowing it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>requirements.txt vs a lock file: which gives reproducible builds?</summary><div class="qa-body">The lock file: it pins every package in the dependency tree, including transitive ones, to exact versions (with hashes in poetry.lock/uv.lock). A typical requirements.txt lists direct dependencies with ranges, so numpy or dateutil can drift between installs. Applications commit the lock; libraries publish ranges so they can coexist with other packages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>pandas~=2.2</code> allow, and why not just write <code>pandas&gt;=2.2</code>?</summary><div class="qa-body"><code>~=2.2</code> is the compatible-release operator: <code>&gt;=2.2, &lt;3</code>. <code>&gt;=2.2</code> also accepts pandas 3.x, a major version that may contain breaking changes under semantic versioning. <code>~=2.2.0</code> is narrower: <code>&gt;=2.2.0, &lt;2.3</code> (patches only).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>pyproject.toml</code>, and how do you make a project install a command-line tool?</summary><div class="qa-body">The standard project file (PEP 517/518/621): <code>[project]</code> metadata and dependencies, <code>[build-system]</code> backend, and tool settings (pytest, ruff, mypy). A <code>[project.scripts]</code> entry such as <code>chaistall = "chaistall.cli:main"</code> makes pip generate a <code>chaistall</code> executable in the environment's bin folder that imports <code>main</code> and calls <code>sys.exit(main())</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>pip install -e .</code> do?</summary><div class="qa-body">Installs the project in the current folder in editable (development) mode: its dependencies are installed, the package becomes importable from anywhere by pointing at your source tree (edits apply without reinstalling), and console scripts are created. It is the standard setup so that tests and notebooks import the package instead of relying on the current directory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pip + venv vs Poetry/uv vs conda: when would you use each?</summary><div class="qa-body">pip + venv is built in and fine for simple projects (with a frozen lock). Poetry and uv manage pyproject.toml, dependency resolution, the venv and a hashed lock file in one tool; uv is much faster and also installs Python versions. conda manages environments that include non-Python binaries (CUDA, MKL, GDAL), common in scientific and GPU work. For OS-level reproducibility, put the environment in a Docker image.</div></details>
</main>
`
});
