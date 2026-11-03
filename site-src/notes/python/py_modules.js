// notes/python/py_modules.js — Modules, Packages & Environments
Object.assign(TOPIC_CONTENT, {
  "py_modules": `<main>
<h1>Modules, Packages &amp; Environments</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Modules, Packages &amp; Environments</span></div>
  <p class="lead">Small scripts fit in one file, but real programs do not. A <strong>module</strong> is a Python file that other files can import, a <strong>package</strong> is a folder of modules that works as one unit, and an <strong>environment</strong> is the set of third-party libraries a Python interpreter can see. Understanding all three is what separates "it works on my laptop" from a project that teammates can install, tests can import, and a server can run. It also explains a family of confusing errors: a file that hides a real library, "attempted relative import with no known parent package", "partially initialized module", and "No module named pandas" right after installing pandas. Our running example is <code>chaistall</code>, the chai stall's order importer from the <a class="xref" data-note="py_exceptions">Exceptions</a> and <a class="xref" data-note="py_files">Files</a> notes: we split it into modules, watch exactly what <code>import</code> does with them, turn them into a package, give it its own isolated environment with pinned dependencies, and finally make it an installable command. Long folder names are shortened to <code>~/chaistall</code>.</p>

  <h2 id="pmo-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Modules, Packages &amp; Environments</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">import</div>
        <ul>
          <li>Module = one .py file = one namespace</li>
          <li>Check <code>sys.modules</code> → search <code>sys.path</code> → run once → cache</li>
          <li>The script's folder is searched first: <code>csv.py</code> hides the real csv</li>
          <li><code>from m import x</code> copies a name; <code>import m</code> looks it up later</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Packages</div>
        <ul>
          <li>Folder + <code>__init__.py</code> (runs on first import)</li>
          <li><code>__main__.py</code> runs with <code>python -m pkg</code></li>
          <li><code>if __name__ == "__main__":</code> keeps files importable</li>
          <li>Relative imports need <code>python -m</code>, not a file path</li>
          <li>Circular imports → "partially initialized module"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Environments</div>
        <ul>
          <li><code>python -m venv .venv</code>: own site-packages</li>
          <li>Activation only changes <code>PATH</code></li>
          <li>"No module named X" after installing → wrong interpreter</li>
          <li>Use <code>python -m pip</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dependencies</div>
        <ul>
          <li>requirements = what you want; lock = exactly what you got</li>
          <li><code>~=2.2</code> means &gt;=2.2, &lt;3</li>
          <li><code>pyproject.toml</code> + <code>[project.scripts]</code> → a command</li>
          <li><code>pip install -e .</code>; Poetry / uv manage the lock</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pmo-split"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Modules and Namespaces</span><span class="rm-sub">splitting a program into files</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-import"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How import Works</span><span class="rm-sub">search, create, run once, cache</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-styles"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Import Styles</span><span class="rm-sub">which names an import creates</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-main"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">if __name__ == "__main__"</span><span class="rm-sub">files that can be run and imported</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pkg"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Packages</span><span class="rm-sub">__init__.py, __main__.py, public API</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-rel"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Relative vs Absolute Imports</span><span class="rm-sub">the dots, and running with -m</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-circ"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Circular Imports</span><span class="rm-sub">two modules waiting for each other</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-venv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Virtual Environments</span><span class="rm-sub">one set of libraries per project</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pip"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">pip, Requirements and Pinning</span><span class="rm-sub">recording exactly what to install</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-pyproject"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">pyproject.toml, Entry Points and Poetry</span><span class="rm-sub">an installable project with its own command</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">import and environment bugs</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, rules, specifiers, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pmo-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on imports and environments</span></div></div>
    </div>
  </div>

  <h2 id="pmo-split"><span class="num">01</span>Modules and Namespaces</h2>
  <p>The chai stall's importer does several different jobs: it defines its error types, checks and converts each row, reads the CSV file, writes a JSON summary and a Parquet archive, and handles the command line. Written as one file it would be a few hundred lines in which everything can see everything else. Such a file is hard to read, hard to test one part at a time (you cannot test row parsing without also loading pandas), and hard for two people to edit at once. The answer is to split the program into files, one per responsibility.</p>
  <p>In Python each such file is a <strong>module</strong>: any <code>.py</code> file whose contents another file can use by writing <code>import</code>. You already use modules all the time; <code>import json</code> loads the standard library's <code>json</code> module, and your own files work in exactly the same way. Each module has its own <strong>namespace</strong>, which is simply the set of names (functions, classes, variables) defined at its top level. Think of a large kitchen divided into stations, each with its own labelled drawers: the pastry station and the grill station can both have a drawer labelled "knives" without any confusion, because you always say which station you mean. In the same way, <code>storage.log</code> and <code>cli.log</code> can both exist, because each <code>log</code> lives in its own module's namespace. Here is the importer split by job:</p>
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
  25 chaistall/errors.py
  19 chaistall/parse.py
  24 chaistall/report.py
  23 chaistall/storage.py
 141 total</div>
  <p>The whole program is about 140 lines in seven small files, each readable on one screen. A test can now write <code>from chaistall.parse import parse_row</code> and check row parsing without touching files or pandas. The folder <code>chaistall/</code> that holds the modules is a <strong>package</strong> (section 05), and the outer folder with <code>pyproject.toml</code> is the project (section 10). A <strong>library</strong> is the informal word for one or more packages distributed together, such as pandas from PyPI. Splitting by responsibility, not by size, matters: files named <code>part1.py</code> and <code>part2.py</code> end up needing each other in both directions, which leads to the circular-import trouble of section 07.</p>

  <h2 id="pmo-import"><span class="num">02</span>How import Works</h2>
  <p>Almost every import problem becomes easy to understand once you know exactly what the <code>import</code> statement does, so this section takes it apart. The first fact is that a module, once imported, is an ordinary Python object of type <code>module</code>, and the names defined in the file become its attributes:</p>
  <div class="fx" data-lang="py">import json
import chaistall.errors as errors

print(type(json).__name__, json.__name__)
print(json.__file__, "-&gt;", json.dumps([1, 2]))
print(errors.__name__, "|", errors.__file__)
print([n for n in dir(errors) if not n.startswith("_")])</div>
  <div class="fx" data-lang="text">module json
/usr/local/lib/python3.13/json/__init__.py -&gt; [1, 2]
chaistall.errors | ~/chaistall/chaistall/errors.py
['BadNumberError', 'BadRowError', 'ChaiStallError', 'MissingValueError', 'TooManyBadRowsError']</div>
  <p><code>import json</code> bound the name <code>json</code> to a module object, built from the file shown, and <code>json.dumps</code> is simply an attribute of that object. Our own <code>chaistall.errors</code> module works identically: its <code>__file__</code> is our <code>errors.py</code>, and <code>dir()</code> lists the classes we defined there. Now, how did Python find those files, and what did it do with them?</p>
  <p>The first step is the search. Python keeps a list of folders to look in, <code>sys.path</code>, and checks them in order, taking the <em>first</em> match. It works like a librarian looking for a book: first the shelf right next to the desk, then the main collection, then the special collections, stopping at the first copy found. Here is the list, printed by a script in the project folder:</p>
  <div class="fx" data-lang="py">import sys
for i, folder in enumerate(sys.path):               # searched in this order
    print(i, folder)
import json, yaml, chaistall
for mod in (json, yaml, chaistall):
    print(f"{mod.__name__:10} found in {mod.__file__}")</div>
  <div class="fx" data-lang="text">0 ~/chaistall
1 /usr/local/lib/python313.zip
2 /usr/local/lib/python3.13
3 /usr/local/lib/python3.13/lib-dynload
4 /root/.local/lib/python3.13/site-packages
5 /usr/local/lib/python3.13/site-packages
6 /usr/lib/python3/dist-packages
json       found in /usr/local/lib/python3.13/json/__init__.py
yaml       found in /root/.local/lib/python3.13/site-packages/yaml/__init__.py
chaistall  found in ~/chaistall/chaistall/__init__.py</div>
  <p>Entry 0 is the folder containing the script you ran (for <code>python -m</code> or <code>-c</code> it is the current folder). Next come any folders listed in the <code>PYTHONPATH</code> environment variable (none here), then the standard library folders, and last the <strong>site-packages</strong> folders, where <code>pip</code> installs third-party packages. The second half shows where each module was found: <code>json</code> in the standard library, <code>yaml</code> in a site-packages folder, and <code>chaistall</code> in the project folder, entry 0.</p>
  <p>The second step is creating and running the module. When the file is found, Python creates an empty module object, <strong>stores it in a dictionary called <code>sys.modules</code></strong>, and then <strong>runs the file from top to bottom</strong>. Each <code>def</code>, <code>class</code> and assignment it executes adds a name to the module's namespace. Finally the name is bound in the importing file. If the same module is imported again, anywhere in the program, Python finds it already in <code>sys.modules</code> and simply reuses it without running anything. To watch this happen, the next run uses a copy of the package in which every file starts with a <code>print("  running chaistall/&lt;file&gt;")</code> line:</p>
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
  <p>Follow the trace. <code>import chaistall</code> ran <code>__init__.py</code> (a package's own code, section 05). Its imports ran <code>errors.py</code> and then <code>storage.py</code>; <code>storage.py</code> in turn needed <code>errors</code>, which was already cached and did not run again, and <code>parse.py</code>, which ran for the first time. The second <code>import chaistall</code> and the <code>from chaistall.errors import ...</code> printed nothing at all: both found what they needed in <code>sys.modules</code>. <code>report.py</code> and <code>cli.py</code> never ran, because nothing imported them. The last line shows the consequence that matters most in practice: every importer receives the <em>same</em> object, so <code>chaistall.errors.BadRowError is BadRowError</code> is <code>True</code>. That is why an <code>except BadRowError</code> written in one module catches the exception raised in another.</p>
  <div class="flow"><span>import x</span><span>in sys.modules? → reuse it</span><span>else search sys.path in order</span><span>create module, add to sys.modules</span><span>run the file top to bottom once</span><span>bind the name x</span></div>
  <p>Two practical lessons follow. First, because a module's top-level code runs at import time, putting slow work there (loading a model, reading a big file) makes every <code>import</code>, and every test that imports it, slow; such work belongs inside functions. (The <code>__pycache__</code> folders you see next to your files hold compiled bytecode so Python can skip re-compiling a file, not re-running it.) Second, because the script's own folder is searched first, a file of yours with the same name as a real module wins. Here a scratch file accidentally saved as <code>csv.py</code> sits next to a script that uses the real csv module:</p>
  <div class="fx" data-lang="text">$ ls
csv.py	import_orders.py  orders.csv
$ python3 import_orders.py
this is MY csv.py, not the standard library's
Traceback (most recent call last):
  File "~/chaistall/shadow/import_orders.py", line 3, in &lt;module&gt;
    rows = list(csv.DictReader(f))
                ^^^^^^^^^^^^^^
AttributeError: module 'csv' has no attribute 'DictReader' (consider renaming '~/chaistall/shadow/csv.py' since it has the same name as the standard library module named 'csv' and prevents importing that standard library module)</div>
  <p><code>import csv</code> found the local <code>csv.py</code> first, ran it (printing its message), and bound <em>that</em> module to the name <code>csv</code>. It has no <code>DictReader</code>, hence the <code>AttributeError</code>. Python 3.13 even names the cause in the message. This is called <strong>shadowing</strong>, and it is why you should never name your files <code>csv.py</code>, <code>json.py</code>, <code>random.py</code>, <code>pandas.py</code>, <code>test.py</code> or after any library you use.</p>

  <h2 id="pmo-styles"><span class="num">03</span>Import Styles</h2>
  <p>Python offers several ways to write an import. Every one of them loads and runs the module in exactly the way just described; they differ only in which name, or names, they create in <em>your</em> file. It is like borrowing from a neighbour: you can borrow the whole toolbox and say "the toolbox's hammer" each time, or take just the hammer and put it in your own drawer.</p>
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
  <p><code>import json</code> creates the one name <code>json</code>, and you write <code>json.dumps</code>, which tells every reader where <code>dumps</code> came from; this is the default style. <code>import datetime as dt</code> does the same under a shorter alias, used for long names and by convention for some libraries (<code>import pandas as pd</code>). <code>from collections import Counter</code> copies just one name into your file, convenient for names you use often. The fourth style, the <strong>star import</strong> <code>from os import *</code>, copies every public name of the module into your file, and the output shows why it is dangerous: before it, <code>open</code> was the built-in <code>open</code> (from the <code>_io</code> module); after it, <code>open</code> was silently replaced by the low-level <code>os.open</code>, which takes different arguments. Nothing warned us; the next call simply failed. Star imports make it impossible to tell where a name came from and should not appear in real code.</p>
  <table class="tbl">
    <tr><th>style</th><th>creates the name</th><th>use when</th></tr>
    <tr><td><code>import json</code></td><td><code>json</code></td><td>default; <code>json.dumps</code> shows where it came from</td></tr>
    <tr><td><code>import datetime as dt</code></td><td><code>dt</code></td><td>long names, or conventions (<code>import pandas as pd</code>)</td></tr>
    <tr><td><code>from collections import Counter</code></td><td><code>Counter</code></td><td>a few names used often</td></tr>
    <tr><td><code>from os import *</code></td><td>everything in <code>os.__all__</code></td><td>never in real code</td></tr>
  </table>
  <p>The difference between <code>import module</code> and <code>from module import name</code> goes deeper than typing. <code>from ... import</code> copies the object the name refers to <em>at that moment</em>, while <code>module.name</code> is looked up fresh every time it is used. The next example uses a tiny module, <code>counter.py</code>, and the standard <code>importlib</code> module, which can re-run a module (<code>reload</code>) and import a module whose name is held in a string (<code>import_module</code>):</p>
  <div class="fx" data-lang="py">print("counter.py runs")
count = 0</div>
  <div class="fx" data-lang="py">import importlib
import counter
import counter                       # second import: the file does not run again
counter.count += 5
from counter import count            # copies the current value into a local name
print("count via from-import:", count)
importlib.reload(counter)            # runs the file again
print("after reload:", counter.count, "| stale copy:", count)
mod = importlib.import_module("json")     # import by a name held in a string
print(mod.dumps({"ok": True}))</div>
  <div class="fx" data-lang="text">counter.py runs
count via from-import: 5
counter.py runs
after reload: 0 | stale copy: 5
{"ok": true}</div>
  <p>Two imports of <code>counter</code> printed "counter.py runs" only once, as section 02 predicts. After <code>counter.count += 5</code>, <code>from counter import count</code> copied the value 5 into a local name. <code>importlib.reload</code> then ran the file again, so the module's <code>count</code> went back to 0, but the local copy still held 5: it is a separate name pointing at the old value. This is also why, when testing with mocks, you must patch a name in the module where it is <em>used</em>, not where it was defined (see <a class="xref" data-note="py_mocking">Mocks &amp; Test Doubles</a>). <code>importlib.import_module("json")</code> is how plugin systems and configurable back ends load a module chosen at run time.</p>

  <h2 id="pmo-main"><span class="num">04</span>if __name__ == "__main__"</h2>
  <p>Section 02 showed that importing a file runs it. That creates a problem for any file that is meant to be both a program you run and a module others import. If its top level starts the work (reads files, prints a report), then a test that merely imports one of its functions starts the work too. Python solves this with a special variable that every module has, <code>__name__</code>. When a file is imported, <code>__name__</code> is the module's name, such as <code>"shop_tools"</code>. When a file is the program Python was asked to run, its <code>__name__</code> is set to the string <code>"__main__"</code> instead. So the test <code>if __name__ == "__main__":</code> means "only if I am the program being run". It is like a recipe card with a note saying "if you are cooking this dish on its own, serve with rice"; when the recipe is used as part of a bigger meal, the note is skipped.</p>
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
  <p>Run directly, the file's <code>__name__</code> was <code>'__main__'</code>, so the self-test ran. Imported by <code>use_tools.py</code>, its <code>__name__</code> was <code>'shop_tools'</code>: the top-level <code>print</code> still ran (it is outside the guard), but the self-test did not. The block under the test is called the <strong>main guard</strong>. The importer's command-line module ends the same way. All its logic is in a <code>main()</code> function that returns an exit code, and only the guard actually calls it:</p>
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
  <p><code>main(argv=None)</code> parses the arguments, does the work, and returns 0 for success, 1 if the import failed and 2 for a missing file; because it accepts <code>argv</code>, a test can call <code>main(["data/x.csv"])</code> directly. <code>raise SystemExit(main())</code>, equivalent to <code>sys.exit(main())</code>, hands the returned number to the operating system as the exit code. (argparse and exit codes are covered in <a class="xref" data-note="py_io">Input, Output &amp; Command-Line Programs</a>.) The guard is not optional when you use <a class="xref" data-note="py_multiprocessing">multiprocessing</a> with the "spawn" start method, the default on Windows and macOS: each worker process imports your main file, and without the guard every worker would start the whole program again.</p>

  <h2 id="pmo-pkg"><span class="num">05</span>Packages</h2>
  <p>Seven separate modules in a folder are better than one big file, but they still need to be treated as one unit: imported under one name, given one version number, and offered to users through a small, stable set of names. A <strong>package</strong> is exactly that: a folder of modules that can itself be imported, with dotted names for the modules inside it, such as <code>chaistall.parse</code>. A regular package is marked by a file called <code>__init__.py</code> in the folder. When the package is imported for the first time, <code>__init__.py</code> runs (you saw this in the trace in section 02), and the names it defines become the package's own names. That makes it the natural place for the version number and for the few names users actually need:</p>
  <div class="fx" data-lang="py">"""chaistall: import one day of orders."""
__version__ = "0.1.0"

from .errors import ChaiStallError, BadRowError   # re-export the public API
from .storage import read_orders</div>
  <p>Because <code>__init__.py</code> imports <code>read_orders</code> and the main exception classes, users can write <code>chaistall.read_orders(...)</code> and <code>except chaistall.ChaiStallError</code> without knowing which internal file each one lives in. This is called <strong>re-exporting</strong>, and it defines the package's <strong>public API</strong>: the names users are promised. A shop works the same way: customers deal with the front counter, and the shop can rearrange its storeroom without the customers ever noticing. If <code>read_orders</code> later moves to a different module, only this file changes. Keep <code>__init__.py</code> light, though: everything it imports is paid for by everyone who imports anything from the package. That is why pandas is imported inside <code>write_archive</code> rather than at the top of <code>report.py</code>, so that importing <code>chaistall.errors</code> in a test never loads pandas.</p>
  <p>A package can also contain a <code>__main__.py</code> file, which is what runs when you execute the package itself with <code>python -m chaistall</code>. Ours just calls the command-line entry point:</p>
  <div class="fx" data-lang="py">from .cli import main

raise SystemExit(main())</div>
  <p>A folder without <code>__init__.py</code> can still be imported, as a so-called <strong>namespace package</strong>, a feature meant for splitting one package across several folders. Ordinary projects should include <code>__init__.py</code>; it makes the intent clear and gives you a place for the public API.</p>

  <h2 id="pmo-rel"><span class="num">06</span>Relative vs Absolute Imports</h2>
  <p>Inside the package, modules import each other. <code>cli.py</code> could write <code>from chaistall.storage import read_orders</code>, which is an <strong>absolute import</strong>: the full dotted path from the top-level package. It can also write <code>from .storage import read_orders</code>, which is a <strong>relative import</strong>: the leading dot means "from this same package", and two dots would mean "from the parent package". Relative imports are like giving directions from where you are standing ("the room next door") instead of a full postal address; they keep working if the whole building is renamed, which is why they are popular inside packages.</p>
  <table class="tbl">
    <tr><th>in file</th><th>relative</th><th>absolute equivalent</th></tr>
    <tr><td><code>chaistall/storage.py</code></td><td><code>from .parse import parse_row</code></td><td><code>from chaistall.parse import parse_row</code></td></tr>
    <tr><td><code>chaistall/cli.py</code></td><td><code>from . import __version__</code></td><td><code>from chaistall import __version__</code></td></tr>
    <tr><td><code>chaistall/io/csv_in.py</code> (nested)</td><td><code>from ..errors import BadRowError</code></td><td><code>from chaistall.errors import BadRowError</code></td></tr>
  </table>
  <p>But "where you are standing" has to be known. Python works out what the dots refer to from a module attribute called <code>__package__</code>, and that attribute is only set when the file was imported <em>as part of its package</em>. Look at three ways of starting the command-line module:</p>
  <div class="fx" data-lang="text">$ python3 chaistall/cli.py data/orders_2026-10-19.csv
Traceback (most recent call last):
  File "~/chaistall/chaistall/cli.py", line 7, in &lt;module&gt;
    from . import __version__
ImportError: attempted relative import with no known parent package
$ python3 -m chaistall.cli --help
usage: chaistall [-h] [--out OUT] csv

positional arguments:
  csv         orders_YYYY-MM-DD.csv

options:
  -h, --help  show this help message and exit
  --out OUT   output folder
$ python3 -m chaistall --help | head -1
usage: chaistall [-h] [--out OUT] csv</div>
  <p>Run by its file path, <code>cli.py</code> is just a top-level script called <code>__main__</code> that belongs to no package, so the dot in <code>from . import __version__</code> has nothing to refer to, and Python raises "attempted relative import with no known parent package". Run with <code>python -m chaistall.cli</code>, Python imports the package first and then runs the module inside it, so the relative imports work and the help screen appears. <code>python -m chaistall</code> runs the package's <code>__main__.py</code>, with the same result. The rule is therefore: run files that live inside a package with <code>python -m package.module</code>, from the project folder (which <code>-m</code> puts first on <code>sys.path</code>). Installing the package, as in section 10, removes even that restriction. Do not "fix" the error by adding <code>sys.path.insert(0, "..")</code> lines to your code; that hides the real problem and breaks in other folders. PEP 8, Python's style guide, recommends absolute imports in general and accepts explicit relative imports inside packages.</p>

  <h2 id="pmo-circ"><span class="num">07</span>Circular Imports</h2>
  <p>Suppose <code>storage.py</code> needs a function from <code>report.py</code>, and <code>report.py</code> needs a function from <code>storage.py</code>. Each module imports the other at its top. This is a <strong>circular import</strong>, and it fails in a way that looks mysterious until you remember the order of steps from section 02: a module is placed in <code>sys.modules</code> <em>before</em> its code runs. Here is a minimal version, with a print at the start and end of each module:</p>
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
ImportError: cannot import name 'read_orders' from partially initialized module 'chaistall.storage' (most likely due to a circular import) (~/chaistall/circ/chaistall/storage.py)</div>
  <p>Trace it step by step. Importing <code>storage</code> creates an empty module, caches it, and starts running it: "storage.py: start". Its second line imports <code>report</code>, so <code>storage</code> pauses there and <code>report</code> starts running: "report.py: start". <code>report</code>'s second line asks for the name <code>read_orders</code> from <code>storage</code>. Python finds <code>storage</code> in <code>sys.modules</code>, but it is only half-run: it is still paused at its own line 2 and has not yet reached <code>def read_orders</code>. The name does not exist yet, so the import fails with "cannot import name 'read_orders' from partially initialized module". It is like two people each waiting at a door for the other to go through first.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
<defs><marker id="pmo-a7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="220" height="110" rx="8" class="fb sb"/><text x="130" y="40" text-anchor="middle" font-size="12" font-weight="700">storage.py (running)</text>
<text x="34" y="62" font-size="11">1 print start ✓</text><text x="34" y="80" font-size="11" class="tr">2 from .report import … ⏸</text><text x="34" y="98" font-size="11" class="tm">4 def read_orders  (not yet)</text>
<rect x="360" y="20" width="220" height="110" rx="8" class="fv"/><text x="470" y="40" text-anchor="middle" font-size="12" font-weight="700">report.py (running)</text>
<text x="374" y="62" font-size="11">1 print start ✓</text><text x="374" y="80" font-size="11" class="tr">2 from .storage import</text><text x="374" y="96" font-size="11" class="tr">   read_orders ✗</text>
<path d="M240,78 L358,64" fill="none" stroke="currentColor" marker-end="url(#pmo-a7)"/><path d="M360,90 L242,100" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pmo-a7)"/>
<text x="300" y="140" text-anchor="middle" class="tm" font-size="10.5">report asks storage for a name storage has not defined yet</text>
</svg><figcaption>A cycle at import time: storage is paused at line 2 waiting for report, and report asks storage for a name that is defined only further down.</figcaption></figure>
  <p>In the figure, the solid arrow is <code>storage</code>'s import of <code>report</code>, made while <code>storage</code> has only run its first line. The dashed arrow is <code>report</code> reaching back for <code>read_orders</code>, which <code>storage</code> would only define at line 4. There are three ways out. The quickest is to import the <em>module</em> rather than the name: <code>from . import storage</code> only needs the module object, which exists (half-run is fine), and <code>storage.read_orders</code> is looked up later, when the function is actually called, by which time <code>storage</code> has finished running:</p>
  <div class="fx" data-lang="py">print("report.py: start")
from . import storage                 # import the MODULE, not the name

def summarise(good):
    return {"orders": len(good), "revenue": sum(o["amount"] for o in good)}

def summarise_file(path):
    return summarise(storage.read_orders(path))
print("report.py: end")</div>
  <div class="fx" data-lang="py">try:
    from chaistall.storage import read_and_summarise
    print(read_and_summarise("data/orders_2026-10-19.csv"))
except ImportError as e:
    print("ImportError:", e)</div>
  <div class="fx" data-lang="text">storage.py: start
report.py: start
report.py: end
storage.py: end
{'orders': 1, 'revenue': 40}</div>
  <p>Now both modules run to the end (<code>report</code> finishes inside <code>storage</code>'s import), and the call works. A second quick fix is to move the import inside the function that needs it, so it happens at call time. But the real fix is structural. A cycle usually means two responsibilities are tangled: move the shared piece into a third, lower-level module that both can import, or move the function that needs both up into a higher layer (here, <code>read_and_summarise</code> belongs in <code>cli.py</code>). The actual <code>chaistall</code> package avoids the problem entirely because its imports flow in one direction only: <code>cli</code> → <code>report</code> and <code>storage</code> → <code>parse</code> → <code>errors</code>. Treat a circular import as a design warning, not something to paper over; the error often appears far from the cause and can depend on which module happens to be imported first.</p>

  <h2 id="pmo-venv"><span class="num">08</span>Virtual Environments</h2>
  <p>So far we have only imported our own code and the standard library. Real projects also depend on third-party packages such as pandas, installed with <code>pip</code> into a site-packages folder. The trouble is that a Python installation has only one such folder, shared by everything that uses that interpreter. If an old project needs pandas 2 and the chai stall needs pandas 3, they cannot both be installed there; upgrading for one breaks the other. Installing into the operating system's own Python can even break system tools that rely on particular versions.</p>
  <p>A <strong>virtual environment</strong> (venv) solves this by giving each project its own private site-packages folder. It is a folder, usually called <code>.venv</code> inside the project, containing a link to a Python interpreter and an initially <em>empty</em> site-packages. When you run the venv's <code>python</code>, that private folder is on <code>sys.path</code> instead of the system's. Think of it as each project getting its own toolbox: what you put in one never appears in another. <strong>Activating</strong> a venv (<code>source .venv/bin/activate</code>, or <code>.venv\\Scripts\\activate</code> on Windows) does surprisingly little: it just puts <code>.venv/bin</code> at the front of the shell's <code>PATH</code>, so that typing <code>python</code> or <code>pip</code> finds the venv's copies first. Here is the whole cycle:</p>
  <div class="fx" data-lang="text">$ python3 -c "import yaml; print('system python has yaml', yaml.__version__)"
system python has yaml 6.0.3
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
/usr/local/bin/python3
$ cat .venv/pyvenv.cfg
home = /usr/local/bin
include-system-site-packages = false
version = 3.13.18
executable = /usr/local/bin/python3.13
command = /usr/local/bin/python3 -m venv ~/chaistall/.venv</div>
  <p>The system Python had PyYAML 6.0.3. After creating and activating the venv, <code>which python</code> pointed inside <code>.venv</code>, and <code>sys.prefix != sys.base_prefix</code> printed <code>True</code>, the standard way for code to check that it is running in a venv. <code>import yaml</code> then failed: the system's packages are invisible inside the venv, which is exactly the isolation we wanted. <code>pip install</code> put PyYAML 6.0.2 into the venv's own site-packages, as its path shows, and <code>pip freeze</code>, which lists every installed package with its exact version, shows that it is the only package there. After <code>deactivate</code>, <code>python3</code> is the system one again. The small <code>pyvenv.cfg</code> file is what makes the folder a venv: it records which interpreter it was created from and that system packages are not included. Environments are disposable: never commit <code>.venv</code> to git; rebuild it from a list of requirements (next section).</p>
  <p>The most common environment bug follows directly from this: running the right code with the wrong Python. Every Python installation and every venv has its own packages, so "I installed it" only helps if you run the same interpreter you installed into. Here the system <code>python3</code>, which has pandas but not pyarrow, runs the importer:</p>
  <div class="fx" data-lang="text">$ which python3
/usr/local/bin/python3
$ python3 -c "import pandas; print('pandas', pandas.__version__)"
pandas 3.0.5
$ python3 -m chaistall data/orders_2026-10-19.csv --out out 2&gt;&amp;1 | grep -m1 '^ImportError'
ImportError: Unable to find a usable engine; tried using: 'pyarrow', 'fastparquet'.</div>
  <p>pandas imported fine, the program ran until it tried to write Parquet, and then failed because pyarrow is missing from <em>this</em> interpreter, even if it is installed in some venv. When you see "No module named ..." or a missing-engine error for something you know you installed, check which interpreter is running with <code>which python</code> or <code>python -c "import sys; print(sys.executable)"</code>, and install with <code>python -m pip install ...</code>, which guarantees that pip belongs to that same interpreter. In Jupyter, the notebook's kernel may be yet another interpreter. A venv isolates Python packages only; the operating system and system libraries are shared, which is what <a class="xref" data-note="se_docker">Docker</a> adds. conda environments work like venvs but can also install non-Python libraries such as CUDA.</p>

  <h2 id="pmo-pip"><span class="num">09</span>pip, Requirements and Pinning</h2>
  <p><code>pip install pandas</code> today and the same command in six months will install different versions, and a teammate's laptop or a production server needs the same libraries you developed against. So a project must <em>record</em> what it needs, precisely enough to rebuild the environment. <strong>pip</strong> installs packages from PyPI, the Python Package Index, together with their <strong>transitive dependencies</strong>: the packages your packages need. There are two different lists you might write down, and they answer different questions. A shopping list says "milk, bread, about this much"; a receipt says exactly which brand, size and price you came home with. In Python, the shopping list is a <strong>requirements file</strong> and the receipt is a <strong>lock file</strong>:</p>
  <div class="fx" data-lang="text">$ source .venv/bin/activate
$ printf "pandas&gt;=2.2\\npyarrow&gt;=15\\npyyaml\\n" &gt; requirements.txt
$ cat requirements.txt
pandas&gt;=2.2
pyarrow&gt;=15
pyyaml
$ pip install -q -r requirements.txt
$ pip freeze &gt; requirements-lock.txt
$ cat requirements-lock.txt
numpy==2.5.4
pandas==3.1.0
pyarrow==26.0.0
python-dateutil==4.0.0
PyYAML==6.0.2
tzdata==2026.6
$ deactivate
$ python3 -m venv .venv-teammate
$ .venv-teammate/bin/pip install -q -r requirements-lock.txt
$ diff &lt;(.venv/bin/pip freeze) &lt;(.venv-teammate/bin/pip freeze) &amp;&amp; echo "identical environments"
identical environments</div>
  <p><code>requirements.txt</code> lists the three packages the importer uses directly, with acceptable version ranges. Installing them also pulled in numpy, python-dateutil and tzdata, which pandas needs. <code>pip freeze</code> then wrote every installed package at its exact version, six lines with <code>==</code>: a simple lock. To prove the point, a fresh "teammate" venv was built from the lock, and comparing the two environments showed they are identical. A venv built from the loose requirements file would instead get whatever versions are newest on the day, which is how "it worked yesterday" bugs are born.</p>
  <p>Fixing a dependency to one exact version with <code>==</code> is called <strong>pinning</strong>. Requirements files usually use ranges instead, written with <strong>version specifiers</strong>. The <code>packaging</code> library, which pip itself uses, can show which versions each specifier accepts:</p>
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
    <tr><td><code>==2.2.3</code></td><td>exactly this version</td><td>lock files, deployed applications</td></tr>
    <tr><td><code>&gt;=2.2</code></td><td>this or anything newer, forever</td><td>risky: includes the next major version</td></tr>
    <tr><td><code>&gt;=2.2,&lt;3</code></td><td>at least 2.2, below 3</td><td>libraries: "works with 2.x from 2.2 on"</td></tr>
    <tr><td><code>~=2.2</code></td><td>"compatible release", same as <code>&gt;=2.2,&lt;3</code></td><td>short form of the line above</td></tr>
    <tr><td><code>~=2.2.0</code></td><td><code>&gt;=2.2.0,&lt;2.3</code></td><td>bug-fix updates only</td></tr>
  </table>
  <p>Why stop below 3? Most Python packages follow <strong>semantic versioning</strong>, where a version is MAJOR.MINOR.PATCH: a new PATCH only fixes bugs, a new MINOR adds features without breaking existing code, and a new MAJOR may break your code. <code>&gt;=2.2</code> accepted 3.0.0 and 3.0.6 in the output above, which could break a project written for pandas 2. Two habits follow. Pinning only your direct dependencies is not enough for reproducibility, because transitive packages like numpy still drift; you need the full lock. And writing <code>pip freeze &gt; requirements.txt</code> as your only file mixes "what we need" with "what happened to be installed"; keep both lists, or let a tool such as Poetry or uv maintain them for you.</p>

  <h2 id="pmo-pyproject"><span class="num">10</span>pyproject.toml, Entry Points and Poetry</h2>
  <p>Our importer still has to be run as <code>python -m chaistall</code> from inside the project folder. We would like to install it like any other library, with its dependencies, and get a real command, <code>chaistall</code>, that can be typed from any folder. For that, the project needs a <code>pyproject.toml</code> file, the standard description of a Python project. It is written in TOML, a simple configuration format, and holds the project's name and version, the Python versions it supports, its dependencies, the commands it provides, and which <strong>build backend</strong> (the tool that turns the folder into an installable package) to use. Think of it as the label and ingredients list on a packaged product.</p>
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
  <p>The <code>[project]</code> table holds the metadata and the dependency ranges from the previous section. The <code>[project.scripts]</code> table declares an <strong>entry point</strong>: a command named <code>chaistall</code> that should call the function <code>main</code> in the module <code>chaistall.cli</code>. <code>[build-system]</code> says that setuptools builds the package. The last table tells setuptools that only the <code>chaistall</code> folder is code; without it, setuptools sees two top-level folders, <code>chaistall</code> and <code>data</code>, and refuses to guess which is the package. (Putting the package inside a <code>src/</code> folder is a common layout that avoids this.) Now we install the project into its venv:</p>
  <div class="fx" data-lang="text">$ source .venv/bin/activate
$ pip install -q -e .
$ pip freeze
# Editable install with no version control (chaistall==0.1.0)
-e ~/chaistall
numpy==2.5.4
pandas==3.1.0
pyarrow==26.0.0
python-dateutil==4.0.0
PyYAML==6.0.2
tzdata==2026.6
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
orders_2026-10-19.parquet  summary_2026-10-19.json</div>
  <p><code>pip install -e .</code> read <code>pyproject.toml</code>, installed the dependencies, and installed the project itself in <strong>editable</strong> mode (<code>-e</code>): instead of copying the code into site-packages, the venv points at the project folder, so edits to the source take effect immediately without reinstalling. <code>pip freeze</code> now lists the project too. pip also generated a small script, <code>.venv/bin/chaistall</code>; reading it shows that it does exactly what the entry point declared: import <code>main</code> from <code>chaistall.cli</code> and call <code>sys.exit(main())</code>. So <code>chaistall</code> is now an ordinary command. It printed its help, imported the day with exit code 0, reported a missing file with exit code 2, and wrote the JSON summary and the Parquet archive into <code>out/</code>. Editable installs are also the standard way to make tests and notebooks import your package properly, instead of relying on the current folder.</p>
  <p>Managing a venv, <code>pyproject.toml</code> and a lock file by hand is repetitive, so tools combine the three. <strong>Poetry</strong>, and the newer and much faster <strong>uv</strong>, create the venv, edit <code>pyproject.toml</code> when you add a dependency, resolve compatible versions, and maintain a proper lock file with exact versions and file hashes. Here Poetry adds pytest as a development tool, on a copy of the project:</p>
  <div class="fx" data-lang="text">$ poetry add --group dev pytest
Creating virtualenv chaistall in ~/chaistall/.venv
Using version ^9.2.0 for pytest

Updating dependencies
Resolving dependencies...

Package operations: 10 installs, 0 updates, 0 removals

  - Installing tzdata (2026.6)
  - Installing iniconfig (2.3.1)
  - Installing numpy (2.5.4)
  - Installing packaging (26.3)
  - Installing pluggy (1.7.0)
  - Installing pygments (2.21.0)
  - Installing python-dateutil (4.0.0)
  - Installing pytest (9.2.0)
  - Installing pyarrow (26.0.0)
  - Installing pandas (3.1.0)

Writing lock file
$ tail -4 pyproject.toml
[dependency-groups]
dev = [
    "pytest (&gt;=9.2.0,&lt;10.0.0)"
]
$ grep -c '^\\[\\[package\\]\\]' poetry.lock
21
$ grep -A1 '^name = "pandas"' poetry.lock
name = "pandas"
version = "2.3.3"
--
name = "pandas"
version = "3.1.0"
$ poetry install
Installing dependencies from lock file

No dependencies to install or update

Installing the current project: chaistall (0.1.0)
$ poetry run chaistall --help | head -1
usage: chaistall [-h] [--out OUT] csv</div>
  <p><code>poetry add --group dev pytest</code> created the venv, resolved versions, installed everything, recorded pytest in a <em>dev</em> dependency group (needed to develop the project, not to use it), and wrote <code>poetry.lock</code>. The lock has 21 entries, more than the ten packages installed, because it covers every Python version that <code>requires-python = "&gt;=3.10"</code> allows: it lists pandas 2.3.3 for Python 3.10 (pandas 3 needs a newer Python) and pandas 3.1.0 for newer versions. On any other machine, <code>poetry install</code> recreates exactly this environment from the lock, and <code>poetry run</code> runs a command inside it. uv's equivalents are <code>uv add</code>, <code>uv.lock</code>, <code>uv sync</code> and <code>uv run</code>.</p>
  <table class="tbl">
    <tr><th></th><th>requirements.txt</th><th>pyproject.toml</th><th>lock file (poetry.lock, uv.lock, frozen list)</th></tr>
    <tr><td>Written by</td><td>you</td><td>you (or <code>poetry add</code>)</td><td>the tool, never by hand</td></tr>
    <tr><td>Contains</td><td>direct dependencies, ranges</td><td>metadata, direct dependencies, scripts, build backend</td><td>every package, exact versions (and hashes)</td></tr>
    <tr><td>Answers</td><td>what to install</td><td>what this project is and needs</td><td>exactly what was installed</td></tr>
    <tr><td>Commit to git?</td><td>yes</td><td>yes</td><td>yes for applications; libraries publish ranges only</td></tr>
  </table>
  <p>The last row needs a word of explanation. An application, such as our importer or a web service, is the final product, so it should commit its lock and always run with exactly the tested versions. A library is installed <em>alongside</em> other libraries in someone else's environment, so it must publish ranges; if every library pinned exact versions, no two could ever be installed together. To publish a package to PyPI, <code>python -m build</code> produces a wheel (<code>.whl</code>), the standard ready-to-install archive.</p>

  <h2 id="pmo-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Nearly every import and environment mistake on this page comes down to Python finding something other than what you expected. The most common is naming a file after a library, which section 02 demonstrated: a local <code>csv.py</code>, <code>json.py</code>, <code>random.py</code>, <code>pandas.py</code> or <code>test.py</code> hides the real module, because the script's folder is searched first. Rename the file and delete any stale <code>__pycache__</code> folder next to it. The second is running the wrong interpreter (section 08): "No module named X" right after installing X almost always means pip and python belong to different environments; check <code>sys.executable</code> and use <code>python -m pip</code>.</p>
  <p>Inside packages, running a file by its path breaks relative imports with "no known parent package"; run it as <code>python -m package.module</code> from the project folder, or install the package. Circular imports produce "partially initialized module"; keep imports flowing in one direction, import modules rather than names, or move the import into the function. Leaving out the main guard means that importing the module, in a test or in a multiprocessing worker, runs the whole program. Star imports silently overwrite names, as <code>from os import *</code> did to <code>open</code>. And heavy work at module level, such as loading a model or a large file, slows down every import and every test.</p>
  <p>On the environment side, installing packages into the system Python (especially with <code>sudo pip install</code>) can break operating-system tools and other projects; many Linux distributions now refuse with an "externally-managed-environment" error. Use one venv per project. Pinning only direct dependencies, or not committing the lock file of an application, lets transitive packages drift so that rebuilds differ. Editing a lock file by hand defeats its purpose; change dependencies through the tool. And committing <code>.venv</code> to git adds hundreds of megabytes of machine-specific files; commit the files that rebuild it instead.</p>

  <h2 id="pmo-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Module</b>: a <code>.py</code> file; once imported, a module object whose attributes are its top-level names (its <b>namespace</b>).</li>
    <li><b>Package</b>: a folder of modules with <code>__init__.py</code>; <code>__main__.py</code> runs with <code>python -m pkg</code>.</li>
    <li><b>sys.path</b>: folders searched in order: script's folder (or current folder for <code>-m</code>/<code>-c</code>), <code>PYTHONPATH</code>, standard library, site-packages.</li>
    <li><b>sys.modules</b>: cache of loaded modules; a module's code runs once per process.</li>
    <li><b>Shadowing</b>: a local file named like a real module hides it.</li>
    <li><b>Main guard</b>: <code>if __name__ == "__main__":</code> runs only when the file is the program.</li>
    <li><b>Relative import</b>: <code>from .m import x</code>; needs <code>__package__</code>, so fails when the file is run by path.</li>
    <li><b>Circular import</b>: modules importing each other at top level; one sees the other half-run.</li>
    <li><b>Virtual environment</b>: private site-packages per project; activation only changes <code>PATH</code>.</li>
    <li><b>Lock file</b>: every package at an exact version (plus hashes); <b>pinning</b> = <code>==</code>.</li>
    <li><b>Entry point</b>: <code>[project.scripts] cmd = "pkg.module:func"</code> → an installed command.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import json                       # binds json
import datetime as dt             # binds dt
from collections import Counter   # binds Counter (a copy of the binding)
from .parse import parse_row      # relative, inside a package
from . import storage             # import the module: safe in cycles
importlib.reload(module); importlib.import_module("json")

def main(argv=None) -&gt; int: ...
if __name__ == "__main__":
    raise SystemExit(main())</div>
  <div class="fx" data-lang="text">python -m venv .venv &amp;&amp; source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
python -m pip install -r requirements.txt            # or: pip install -e .
pip freeze &gt; requirements-lock.txt
python -c "import sys; print(sys.executable, sys.prefix != sys.base_prefix)"
python -m package.module                             # run a file inside a package
poetry add pandas / poetry install / poetry run cmd  # uv add / uv sync / uv run</div>
  <h3>Version specifiers</h3>
  <table class="tbl">
    <tr><th>specifier</th><th>allows</th></tr>
    <tr><td><code>==2.2.3</code></td><td>exactly 2.2.3</td></tr>
    <tr><td><code>&gt;=2.2,&lt;3</code> / <code>~=2.2</code></td><td>2.2 ≤ v &lt; 3</td></tr>
    <tr><td><code>~=2.2.0</code></td><td>2.2.0 ≤ v &lt; 2.3</td></tr>
    <tr><td><code>&gt;=2.2</code></td><td>anything from 2.2, including 3.x</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Library-named files shadow real modules.</li>
    <li>Top-level code runs at import time; keep it light.</li>
    <li><code>from m import x</code> does not see later changes to <code>m.x</code>.</li>
    <li><code>python pkg/mod.py</code> breaks relative imports; use <code>python -m pkg.mod</code>.</li>
    <li>No main guard → program runs on import (tests, multiprocessing spawn).</li>
    <li>"No module named X" after installing → wrong interpreter; use <code>python -m pip</code>.</li>
    <li>Commit the lock for applications; never commit <code>.venv</code>; never edit a lock by hand.</li>
  </ul>

  <h2 id="pmo-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a module, a package and a library?</summary><div class="qa-body">A module is a single <code>.py</code> file that becomes a module object when imported. A package is a folder of modules, normally with <code>__init__.py</code>, imported as a unit with dotted names such as <code>chaistall.parse</code>. "Library" is an informal word for one or more packages distributed together, for example installed from PyPI with pip.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens step by step when Python executes <code>import x</code>?</summary><div class="qa-body">It checks <code>sys.modules</code>; if <code>x</code> is there, it simply binds the name. Otherwise it searches the folders in <code>sys.path</code> in order for <code>x.py</code> or a package folder <code>x/</code>, creates a module object, stores it in <code>sys.modules</code>, runs the module's code from top to bottom in that namespace, and binds <code>x</code> in the importing file. For a package it runs <code>__init__.py</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If two files both import the same module, how many times does its code run?</summary><div class="qa-body">Once per process. The first import runs it and caches the module in <code>sys.modules</code>; every later import, anywhere, reuses the same object, so module-level state is shared. <code>importlib.reload</code> forces a re-run, but names copied earlier with <code>from m import x</code> keep the old objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>sys.path</code>, and how can you change where Python looks for modules?</summary><div class="qa-body">It is the list of folders Python searches, in order: the running script's folder (or the current folder for <code>-m</code> and <code>-c</code>), folders from the <code>PYTHONPATH</code> environment variable, the standard library, then site-packages. You can set <code>PYTHONPATH</code> or append to <code>sys.path</code>, but installing your package with <code>pip install -e .</code> is the clean solution.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a file called <code>csv.py</code> in your project break your code?</summary><div class="qa-body">The script's own folder is the first entry in <code>sys.path</code>, so <code>import csv</code> finds your file before the standard library's module. Your file has none of the real module's names, so code fails with errors like <code>module 'csv' has no attribute 'DictReader'</code>. Rename the file and delete its <code>__pycache__</code> entry.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>import module</code> and <code>from module import name</code>?</summary><div class="qa-body">Both load and run the module the same way. <code>import module</code> binds the module object, and <code>module.name</code> is looked up each time it is used, so you always see the current value. <code>from module import name</code> binds the object <code>name</code> refers to at that moment; later rebinding inside the module is not seen. This matters for circular imports and for mocking, where you patch the name in the module that uses it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>from module import *</code> discouraged?</summary><div class="qa-body">It copies an unknown set of names into your namespace and silently overwrites existing ones; <code>from os import *</code> replaces the built-in <code>open</code> with <code>os.open</code>. It also hides where each name came from and confuses linters. A module can limit what <code>*</code> exports with <code>__all__</code>, but explicit imports are still better.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>if __name__ == "__main__":</code> do, and why is it needed?</summary><div class="qa-body">The block runs only when the file is executed as the program, because then its <code>__name__</code> is <code>"__main__"</code>; when imported, <code>__name__</code> is the module's name. It lets a file be imported by tests and other code without side effects, and it is required with multiprocessing's spawn start method, which imports the main module in each worker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__init__.py</code> for? Is it still required?</summary><div class="qa-body">It marks a folder as a regular package and runs when the package is first imported. It typically holds <code>__version__</code> and re-exports the public API (<code>from .storage import read_orders</code>), so users need not know the internal layout. Since Python 3.3 a folder without it can be imported as a namespace package, but that feature is for packages split across folders; ordinary projects should keep <code>__init__.py</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>python script.py</code> and <code>python -m package.module</code>?</summary><div class="qa-body"><code>python script.py</code> runs the file as a standalone script: <code>sys.path[0]</code> is the script's folder and the file belongs to no package, so relative imports fail. <code>python -m package.module</code> finds the module through <code>sys.path</code> (the current folder first), imports its package, then runs it as <code>__main__</code>, so relative imports work. <code>python -m pkg</code> runs <code>pkg/__main__.py</code>, and <code>python -m pip</code> guarantees pip belongs to that interpreter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"ImportError: attempted relative import with no known parent package": what causes it and how do you fix it?</summary><div class="qa-body">A file that uses <code>from .x import y</code> was run by its path, so its <code>__package__</code> is empty and the dot cannot be resolved. Run it as <code>python -m package.module</code> from the project folder, switch to absolute imports, or install the package and use its entry point. Do not patch <code>sys.path</code> in code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What causes a circular import error, and how do you fix it?</summary><div class="qa-body">Module A imports B at top level while B imports A. A is cached in <code>sys.modules</code> before it finishes running, so B receives a partially initialized A, and <code>from A import f</code> fails if <code>f</code> is defined below A's import line. The best fix is restructuring so imports flow one way (move shared code into a lower module, or the code that needs both into a higher one). Quick fixes are <code>import A</code> and using <code>A.f</code> at call time, or importing inside the function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a virtual environment, and how does it work?</summary><div class="qa-body">It isolates each project's packages, so conflicting versions never clash and the system Python stays untouched, and it makes dependencies explicit and rebuildable. A venv is a folder with a <code>pyvenv.cfg</code>, a link to a base interpreter and its own site-packages; running its <code>python</code> sets <code>sys.prefix</code> to the venv. Activation only puts the venv's <code>bin</code> folder first on <code>PATH</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You installed pandas but still get <code>ModuleNotFoundError</code>. What do you check?</summary><div class="qa-body">Which interpreter is actually running: <code>which python</code>, <code>python -c "import sys; print(sys.executable)"</code>, and in Jupyter the kernel's interpreter. pip and python often belong to different environments, so activate the venv and install with <code>python -m pip install pandas</code>. Also check for a local file called <code>pandas.py</code> shadowing the real one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>requirements.txt vs a lock file: which gives reproducible builds?</summary><div class="qa-body">The lock file, because it pins every package in the dependency tree, including transitive ones, to exact versions (with hashes in poetry.lock and uv.lock). A typical requirements.txt lists only direct dependencies with ranges, so packages such as numpy can drift between installs. Applications commit the lock; libraries publish ranges so they can be installed alongside other packages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>pandas~=2.2</code> allow, and why not just write <code>pandas&gt;=2.2</code>?</summary><div class="qa-body"><code>~=2.2</code> is the compatible-release operator and means <code>&gt;=2.2, &lt;3</code>. <code>&gt;=2.2</code> also accepts pandas 3.x, a new major version that may contain breaking changes under semantic versioning. <code>~=2.2.0</code> is narrower still: <code>&gt;=2.2.0, &lt;2.3</code>, bug fixes only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>pyproject.toml</code>, and how do you make a project install a command-line tool?</summary><div class="qa-body">It is the standard project file: <code>[project]</code> holds metadata and dependencies, <code>[build-system]</code> names the build backend, and tools such as pytest, ruff and mypy keep their settings there too. An entry in <code>[project.scripts]</code>, such as <code>chaistall = "chaistall.cli:main"</code>, makes pip generate a <code>chaistall</code> executable in the environment's bin folder that imports <code>main</code> and calls <code>sys.exit(main())</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>pip install -e .</code> do?</summary><div class="qa-body">It installs the project in the current folder in editable (development) mode: its dependencies are installed, the package becomes importable from anywhere by pointing at your source folder, so edits apply without reinstalling, and its console scripts are created. It is the standard setup so that tests and notebooks import the package instead of relying on the current folder.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pip + venv vs Poetry/uv vs conda: when would you use each?</summary><div class="qa-body">pip with venv is built in and fine for simple projects, together with a frozen lock. Poetry and uv manage <code>pyproject.toml</code>, dependency resolution, the venv and a hashed lock file in one tool; uv is much faster and can also install Python versions. conda manages environments that include non-Python binaries such as CUDA or GDAL, common in scientific and GPU work. For operating-system-level reproducibility, put the environment in a Docker image.</div></details>
</main>
`
});
