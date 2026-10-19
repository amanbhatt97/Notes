// notes/python/py_io.js — Programs Meet the Real World: the map
Object.assign(TOPIC_CONTENT, {
  "py_io": `<main>
<h1>Programs Meet the Real World: the map</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>the map</span></div>
  <p class="lead">Start here. Until now our programs ran on clean values typed into the code, printed an answer, and forgot everything. Real programs meet three hard facts: <strong>things go wrong while they run</strong> (a quantity typed as "two"), <strong>data must outlive the program</strong> (the input arrives as a file and the results must still exist tomorrow), and <strong>code must be split and shared</strong> (it grows past one file and must run on someone else's machine with the same libraries). Each fact is answered by one note: <a class="xref" data-note="py_exceptions">Exceptions &amp; Error Handling</a>, <a class="xref" data-note="py_files">Files &amp; Data Formats</a>, and <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>. This page tells that story as a chain of needs, follows one running example through all three notes (a small importer for Chai Corner's daily orders, called <code>chaistall</code>), gives the reading order, and ends with a revision sheet. Run on Python 3.13.</p>

  <h2 id="pio-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pio-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="120" y="6" width="400" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Fundamentals · Functions · Collections (lists, dicts, strings)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pio-ga)"/>
<rect x="190" y="62" width="260" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="700">Programs Meet the Real World: the map</text>
<text x="320" y="94" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · why each note exists</text>
<line x1="320" y1="102" x2="110" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pio-ga)"/>
<line x1="320" y1="102" x2="320" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pio-ga)"/>
<line x1="320" y1="102" x2="530" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pio-ga)"/>
<line x1="200" y1="152" x2="228" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pio-ga)"/>
<line x1="410" y1="152" x2="438" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pio-ga)"/>
<rect x="20" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="149" text-anchor="middle" font-size="12">Exceptions</text>
<text x="110" y="164" text-anchor="middle" class="tm" font-size="10">things go wrong at runtime</text>
<rect x="230" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="149" text-anchor="middle" font-size="12">Files &amp; Data Formats</text>
<text x="320" y="164" text-anchor="middle" class="tm" font-size="10">data must outlive the program</text>
<rect x="440" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="149" text-anchor="middle" font-size="12">Modules &amp; Environments</text>
<text x="530" y="164" text-anchor="middle" class="tm" font-size="10">code must be split and shared</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pio-ga)"/>
<rect x="40" y="210" width="560" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Context Managers · Iterators · Testing · OOP · Pandas · Linux · Docker</text>
</svg><figcaption>The "Programs Meet the Real World" group. Read the map first, then left to right: each note answers a need the one before could not. Dotted arrows are the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_fundamentals">Python Fundamentals</a> and <a class="xref" data-note="py_ds">Python Collections</a></b><span>You can write values, conditions, loops and functions (<a class="xref" data-note="py_values">Values &amp; Types</a>, <a class="xref" data-note="py_control">Control Flow</a>, <a class="xref" data-note="py_functions">Functions</a>), and hold data in lists, dicts and strings. The Collections group computed Chai Corner's morning: six orders, bills Asha ₹65, Ben ₹85, Chen ₹20, Dia ₹60, total ₹230. Left open: those orders were typed into the code, perfectly clean, and the answer vanished when the program ended.</span></li>
    <li><b>This page adds: the map of the group</b><span>Why each of the three notes exists (the need chain), the running example that connects them, the reading order, and how the pieces fit into one small real program. No topic is taught in full here; each note does that.</span></li>
    <li><b>Leads to: the three notes, then beyond</b><span><a class="xref" data-note="py_exceptions">Exceptions</a> → <a class="xref" data-note="py_files">Files &amp; Data Formats</a> → <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>. After the group: <a class="xref" data-note="py_context">Context Managers</a> (how <code>with</code> works), <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> (why files are read lazily), <a class="xref" data-note="py_testing">Testing &amp; Debugging</a> (testing the package), <a class="xref" data-note="py_oop">OOP</a> (exception classes are classes), <a class="xref" data-note="da_pandas">Pandas</a> (CSV and Parquet at scale), <a class="xref" data-note="se_linux">Linux &amp; Terminal</a> and <a class="xref" data-note="se_docker">Docker</a> (running it on a server).</span></li>
  </ol>

  <h2 id="pio-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole group as one chain of needs. Each idea answers the question above it; its weakness raises the next question. Numbers come from the running example (section 01). If you can retell this list in your own words, you know how the group fits together.</p>
  <ol class="story">
    <li><b>A clean program</b><span>Q: what is Monday's revenue? → Loop over the orders, multiply qty × price, add: ₹230. But Monday's real sheet has 9 rows, and one says qty "two"…</span></li>
    <li><b>Exceptions</b><span>Q: what happens when a value is bad while the program runs? → Python raises an exception: <code>int("two")</code> stopped the program after the total had reached ₹230, and the answer was lost. With <code>try/except</code> per row, our own <code>raise</code> for qty −1, and a custom <code>BadRowError</code> family, the importer keeps 6 good orders (₹230) and reports lines 8, 9, 10 precisely. <a class="xref" data-note="py_exceptions">Exceptions</a> But the rows still live inside the code, and the answer disappears at exit…</span></li>
    <li><b>Files</b><span>Q: how does data come in from outside and outlive the program? → Files: <code>pathlib</code> to name them, <code>open</code> with the right mode and <code>encoding="utf-8"</code>, line-by-line reading, <code>with</code> to always close. A variable from run 1 does not exist in run 2; a file does. <a class="xref" data-note="py_files">Files</a> But bytes on disk are not a table…</span></li>
    <li><b>Data formats</b><span>Q: which format for which data? → CSV for the input sheet (the <code>csv</code> module handles Ben's quoted comma), JSON for the nested summary (dates need <code>default=str</code>), Parquet for the typed archive (24.8 MB of CSV → 5.7 MB), YAML for settings, pickle only for your own caches (loading one can run code). <a class="xref" data-note="py_files">Files</a> But the importer is now 144 lines doing five different jobs…</span></li>
    <li><b>Modules and packages</b><span>Q: how do we split code so its parts can be read, tested and reused? → Modules (one job per file) in a package <code>chaistall/</code>; <code>import</code> finds each on <code>sys.path</code>, runs it once and caches it; <code>__name__ == "__main__"</code> keeps scripts importable; relative imports and no cycles. <a class="xref" data-note="py_modules">Modules</a> But Parquet needs pyarrow, which the system Python did not have…</span></li>
    <li><b>Environments</b><span>Q: how does the program get exactly the libraries it needs, on any machine? → A virtual environment per project, <code>pip</code>, a pinned lock (6 exact lines rebuilt an identical environment), and <code>pyproject.toml</code> with an entry point, so <code>chaistall data/orders_2026-10-19.csv</code> works as a command. <a class="xref" data-note="py_modules">Modules</a></span></li>
  </ol>

  <h2 id="pio-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Programs Meet the Real World</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Need 1: things go wrong</div>
        <ul>
          <li>Exception = an error raised while running; traceback read bottom-up</li>
          <li>try / except / else / finally; catch specific types</li>
          <li><code>raise</code>, custom hierarchy, <code>raise … from e</code></li>
          <li><code>log.exception</code>; assert ≠ validation; ExceptionGroup</li>
          <li>Chai Corner: ₹230 kept, lines 8, 9, 10 rejected</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Need 2: data must last</div>
        <ul>
          <li>pathlib; open modes (w empties!); text vs bytes; UTF-8</li>
          <li>Loop over lines (lazy); <code>with</code> always closes</li>
          <li>CSV (quotes, all strings) · JSON (nested, loses types)</li>
          <li>pickle (exact, unsafe) · YAML (settings) · Parquet (big, typed)</li>
          <li>Chai Corner: CSV in → JSON summary + Parquet archive</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Need 3: split and share</div>
        <ul>
          <li>Module = file; package = folder + <code>__init__.py</code></li>
          <li>import: sys.path → run once → sys.modules</li>
          <li><code>__main__</code> guard; relative imports; avoid cycles</li>
          <li>venv per project; pip; lock file; pyproject + entry point</li>
          <li>Chai Corner: <code>chaistall/</code>, 7 files, one command</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How they meet</div>
        <ul>
          <li><code>with</code> = <code>finally</code> for files</li>
          <li>File errors (missing, encoding) caught once at the top; row errors per row</li>
          <li>Exception classes live in <code>errors.py</code>, shared by import</li>
          <li>Parquet's pyarrow → the first reason for a venv</li>
          <li>💡 a stall that survives bad orders, keeps a ledger, and trains new staff from one manual</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pio-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The group as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pio-day"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Monday at Chai Corner</span><span class="rm-sub">The running example</span></div></div>
      <div class="rm-item rm-done" data-target="pio-chain"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Need Chain</span><span class="rm-sub">Why each note exists</span></div></div>
      <div class="rm-item rm-done" data-target="pio-read"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Reading Order</span><span class="rm-sub">The three notes and after</span></div></div>
      <div class="rm-item rm-done" data-target="pio-connect"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pio-traps"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Across the group</span></div></div>
      <div class="rm-item rm-done" data-target="pio-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The group in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pio-qa"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pio-day"><span class="num">01</span>Monday at Chai Corner: the Running Example</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the Collections group, the morning's six orders were clean tuples in the code. What does the same day look like when it comes from the real world, and what should a real program produce from it?</p>
  </div>
  <h3>The input: a messy CSV</h3>
  <p>Every evening the helper exports the day's sheet. Monday 2026-10-19 has 9 orders: the same six as the Collections morning (₹230), plus three that a tired helper typed badly. Line 1 is the header, so the orders are on file lines 2–10.</p>
  <div class="fx" data-lang="text">order_id,time,customer,item,qty,price,note
1,08:05,Asha,masala chai,2,20,
2,08:12,Ben,samosa,3,15,"extra chutney, no onion"
3,08:20,Asha,ginger chai,1,25,
4,08:31,Chen,masala chai,1,20,less sugar
5,08:40,Dia,bun maska,2,30,
6,08:52,Ben,masala chai,2,20,
7,09:03,Esha,samosa,two,15,
8,09:10,Farid,cold coffee,1,,
9,09:20,Gita,masala chai,-1,20,refund?</div>
  <table class="tbl"><caption>What is wrong with it</caption>
    <tr><th>file line</th><th>problem</th><th>which note handles it</th></tr>
    <tr><td>3</td><td>Ben's note contains a comma, so it is quoted</td><td>Files (CSV quoting)</td></tr>
    <tr><td>8</td><td>Esha's qty is the word "two"</td><td>Exceptions (<code>BadNumberError</code>)</td></tr>
    <tr><td>9</td><td>Farid's price is empty</td><td>Exceptions (<code>MissingValueError</code>)</td></tr>
    <tr><td>10</td><td>Gita's qty is −1 (Python accepts it; the stall does not)</td><td>Exceptions (our own <code>raise</code>)</td></tr>
  </table>
  <h3>The owner's questions</h3>
  <ul>
    <li>What was Monday's revenue, per item and per customer, and which rows must the helper fix? (a JSON summary)</li>
    <li>Can the analyst query a year of these days quickly? (a Parquet archive)</li>
    <li>Can the importer run every night on the server, with the same libraries as on the laptop, with one command? (a package in a virtual environment)</li>
  </ul>
  <h3>The finished importer, run once</h3>
  <p>This is where the group ends: the package <code>chaistall</code>, installed in a virtual environment, run as a command. Do not worry about every detail yet; each line is explained in one of the three notes.</p>
  <div class="fx" data-lang="text">$ source .venv/bin/activate
$ chaistall data/orders_2026-10-19.csv --out out; echo "exit code $?"
WARNING chaistall.storage: skipped line 8, qty: 'two' is not a whole number
WARNING chaistall.storage: skipped line 9, price: is empty
WARNING chaistall.storage: skipped line 10, qty: -1 must be positive
INFO chaistall: chaistall 0.1.0: 6 orders, Rs 230, 3 rejected
exit code 0
$ ls out
orders_2026-10-19.parquet
summary_2026-10-19.json
$ cat out/summary_2026-10-19.json
{
  "date": "2026-10-19",
  "orders": 6,
  "revenue": 230,
  "by_item": {
    "masala chai": 5,
    "samosa": 3,
    "ginger chai": 1,
    "bun maska": 2
  },
  "by_customer": {
    "Asha": 65,
    "Ben": 85,
    "Chen": 20,
    "Dia": 60
  },
  "rejected": [
    {
      "line": 8,
      "field": "qty",
      "reason": "line 8, qty: 'two' is not a whole number"
    },
    {
      "line": 9,
      "field": "price",
      "reason": "line 9, price: is empty"
    },
    {
      "line": 10,
      "field": "qty",
      "reason": "line 10, qty: -1 must be positive"
    }
  ]
}</div>
  <p>Reading the output: three WARNING lines name the bad rows by file line and field (Exceptions note); the INFO line reports 6 orders and ₹230, the same total as the Collections map; exit code 0 means success. The <code>out</code> folder holds the two outputs (Files note), and the JSON summary shows the bills Asha 65, Ben 85, Chen 20, Dia 60, the cups per item (masala chai 5 = 2 + 1 + 2), and the three rejections. The command itself exists because of the package and its <code>pyproject.toml</code> (Modules note).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The stall grows up: it learns to deal with wrong orders without shutting down (exceptions), keeps a ledger that outlives each day (files and formats), and writes a staff manual and keeps a standard kit, so any new branch runs the same way (modules, packages, environments).</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>running example</strong> of this group is <code>chaistall</code>: an importer that reads <code>data/orders_YYYY-MM-DD.csv</code>, rejects bad rows with custom exceptions, and writes <code>out/summary_YYYY-MM-DD.json</code> and <code>out/orders_YYYY-MM-DD.parquet</code>; it is a package of seven modules with a command-line entry point.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Notebook code that worked on yesterday's clean extract is not a program. "It ran once" says nothing about bad rows, missing files, another machine, or tomorrow.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Need Chain.</b> We saw the destination. Why exactly these three notes, in this order, and what fails if one is skipped?</div>

  <h2 id="pio-chain"><span class="num">02</span>The Need Chain: Why Each Note Exists</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Exceptions, files and packages are often taught as three unrelated chapters. The better question is: which problem does each one solve that we could not solve before? Walk the chain on the stall's data, one failure at a time.</p>
  </div>
  <h3>Need 1: things go wrong at runtime → Exceptions</h3>
  <p>The obvious loop over Monday's rows (here typed into the code as text, as a file would deliver them):</p>
  <div class="fx" data-lang="py">from rows import ROWS
total = 0
for row in ROWS:
    total += int(row["qty"]) * int(row["price"])
    print("so far:", total)
print("revenue:", total)</div>
  <div class="fx" data-lang="text">so far: 40
so far: 85
so far: 110
so far: 130
so far: 190
so far: 230
Traceback (most recent call last):
  File "total.py", line 4, in &lt;module&gt;
    total += int(row["qty"]) * int(row["price"])
             ~~~^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'two'</div>
  <p>The total reached the correct ₹230, then Esha's "two" stopped the program and the result was never printed. One bad value cost the whole day. <a class="xref" data-note="py_exceptions">Exceptions &amp; Error Handling</a> teaches how to read that traceback, catch the error per row, raise our own error for −1 (which Python accepts), and name every failure (<code>BadRowError</code> with <code>.line</code> and <code>.field</code>). <em>New weakness:</em> the rows are typed into the code, and the answer is gone when the program ends.</p>
  <h3>Need 2: data must outlive the program → Files &amp; Data Formats</h3>
  <div class="fx" data-lang="text">$ python3 -c "revenue = 230; print('run 1: revenue =', revenue)"
run 1: revenue = 230
$ python3 -c "print('run 2: revenue =', revenue)"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    print('run 2: revenue =', revenue)
                              ^^^^^^^
NameError: name 'revenue' is not defined. Did you mean: 'reversed'?</div>
  <p>Memory belongs to one run. Input must come from a file the helper wrote, and results must go to files the owner's dashboard and the analyst can read later. <a class="xref" data-note="py_files">Files &amp; Data Formats</a> teaches paths, modes, encodings, lazy reading, <code>with</code>, and the five formats with a table for choosing. <em>New weakness:</em> the importer now has errors, parsing, reading, reporting and a command line, 144 lines doing five jobs; and the Parquet writer failed in the system Python because a library (pyarrow) was missing.</p>
  <h3>Need 3: code must be split and shared → Modules, Packages &amp; Environments</h3>
  <div class="fx" data-lang="text">$ deactivate 2&gt;/dev/null; which python3
/usr/bin/python3
$ python3 -m chaistall data/orders_2026-10-19.csv --out out
WARNING chaistall.storage: skipped line 8, qty: 'two' is not a whole number
WARNING chaistall.storage: skipped line 9, price: is empty
WARNING chaistall.storage: skipped line 10, qty: -1 must be positive
Traceback (most recent call last):
  ... (frames inside pandas trimmed) ...
ImportError: Unable to find a usable engine; tried using: 'pyarrow', 'fastparquet'.</div>
  <p>Same code, wrong Python: the system interpreter lacks pyarrow, so the run dies at the archive. And one big file cannot be tested piece by piece. <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a> splits the code into the <code>chaistall/</code> package (seven one-job modules), explains exactly what <code>import</code> does, and gives the project its own virtual environment, pinned dependencies and an installable command.</p>
  <div class="flow"><span>clean program</span><span>exceptions: survive bad values</span><span>files: data in and out</span><span>formats: the right shape for each reader</span><span>modules &amp; packages: split the code</span><span>environments: same libraries everywhere</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A stall that grows: first the owner learns not to close the shop over one wrong order (exceptions), then starts a ledger (files), then keeps separate books for daily totals, the stock archive and the price card (formats), then writes a manual split into chapters (modules) and a standard kit list (environment) so the second branch runs identically.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The chain in one line each. <strong>Exception</strong>: an object raised when an operation fails at runtime, handled with <code>try/except</code>. <strong>File</strong>: named bytes on disk, read and written with <code>open</code>. <strong>Format</strong>: an agreement on what those bytes mean (CSV, JSON, YAML, pickle, Parquet). <strong>Module/package</strong>: a file/folder of code loaded with <code>import</code>. <strong>Environment</strong>: an isolated set of installed libraries, recorded in a lock file.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The needs overlap, and skipping one shows up in the next: file reading without exceptions crashes on the first bad row; packages without environments work only on your laptop; formats chosen without thinking about the reader (pickle for a dashboard) fail at the boundary.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Order.</b> Where is each topic taught in full, and in which order should we read?</div>

  <h2 id="pio-read"><span class="num">03</span>Reading Order: The Three Notes and After</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each need has far more to it than this map shows. Which note teaches what, and why in this order?</p>
  </div>
  <h3>1. Exceptions &amp; Error Handling</h3>
  <p><a class="xref" data-note="py_exceptions">Exceptions &amp; Error Handling</a> works on the 9 rows held in a list: a traceback read line by line, the call stack unwinding traced through <code>to_int → parse_row → import_day → main</code>, where to catch (₹210 vs None), <code>try/except/else/finally</code> on every path, specific vs broad catching and the bare-except trap (revenue ₹0, Ctrl+C swallowed), <code>raise</code>, the <code>ChaiStallError</code> hierarchy (₹230; lines 8, 9, 10), chaining with <code>raise … from</code>, EAFP vs LBYL, <code>logging.exception</code>, <code>assert</code> vs <code>raise</code> (<code>-O</code> removes asserts), and <code>ExceptionGroup</code>. Read it first: files and packages both produce exceptions, and <code>with</code> is <code>finally</code> in disguise.</p>
  <h3>2. Files &amp; Data Formats</h3>
  <p><a class="xref" data-note="py_files">Files &amp; Data Formats</a> reads the same rows from the real CSV: <code>pathlib</code>, open modes (w empties, writes are buffered), text vs binary (24 characters = 26 bytes because of ₹), encodings (mojibake, Excel's BOM), lazy reading (71.8 MB vs 0.022 MB), <code>with</code>, CSV and its quoting trap, JSON and what it cannot store, pickle and its security trap, YAML (NO → False), Parquet (in a venv with pyarrow), and a table for choosing a format. It needs exceptions for missing files, bad encodings and bad rows.</p>
  <h3>3. Modules, Packages &amp; Environments</h3>
  <p><a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a> assembles the pieces into <code>chaistall/</code>: what <code>import</code> does (sys.path, sys.modules, run once, traced), import styles, the <code>__main__</code> guard, packages and <code>__init__.py</code>, relative imports, the circular-import trap reproduced and fixed, virtual environments, pip and requirements.txt, version pinning, <code>pyproject.toml</code> with an entry point, and Poetry's lock. It needs the modules the first two notes wrote.</p>
  <h3>After the group</h3>
  <ul>
    <li><a class="xref" data-note="py_context">Context Managers</a>: how <code>with</code> works (<code>__enter__</code>/<code>__exit__</code>), and how to write your own for locks, transactions and timers.</li>
    <li><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>: why a file is an iterator, and how to build lazy pipelines over huge files.</li>
    <li><a class="xref" data-note="py_testing">Testing &amp; Debugging</a>: testing <code>parse_row</code> with pytest, checking that the right exceptions are raised, logging configuration.</li>
    <li><a class="xref" data-note="py_oop">OOP</a>: exception hierarchies are class hierarchies; inheritance explains <code>except Parent</code>.</li>
    <li><a class="xref" data-note="da_pandas">Pandas</a>: <code>read_csv</code>, <code>to_parquet</code> and friends at scale.</li>
    <li><a class="xref" data-note="se_linux">Linux &amp; Terminal</a> and <a class="xref" data-note="se_docker">Docker</a>: paths, PATH and permissions on a server; packaging the whole environment, OS included.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Learning to run a kitchen: first what to do when something burns (exceptions), then how to store food so it lasts (files and formats), then how to write the recipe book and stock list so another kitchen can cook the same dishes (modules and environments).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Reading order</strong>: py_io (this map) → py_exceptions → py_files → py_modules → then py_context, py_iterators, py_testing. Each note's first section says what it needs from the one before.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Reading Files first leaves every <code>try/except</code> and <code>with</code> as magic words; reading Modules first gives you a package with nothing robust to put in it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture and one table to hold the whole group together.</div>

  <h2 id="pio-connect"><span class="num">04</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Three notes, one program. Which note wrote which part of <code>chaistall</code>, and where do the ideas depend on each other?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="pio-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="640" height="276" rx="10" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.45"/>
<text x="24" y="30" class="tm" font-size="10.5">.venv: Python 3.13 + pandas + pyarrow, pinned by a lock (Modules note)</text>
<rect x="30" y="40" width="600" height="230" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.6"/>
<text x="44" y="60" class="tm" font-size="10.5">package chaistall/  (Modules note: __init__, __main__, cli, imports)</text>
<rect x="50" y="74" width="170" height="54" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="135" y="95" text-anchor="middle" font-size="11.5" font-weight="700">cli.py</text><text x="135" y="111" text-anchor="middle" class="tm" font-size="10">args, logging, exit codes</text>
<rect x="250" y="74" width="170" height="54" rx="7" class="fb sb"/><text x="335" y="95" text-anchor="middle" font-size="11.5" font-weight="700">storage.py</text><text x="335" y="111" text-anchor="middle" class="tm" font-size="10">CSV in, with, utf-8 (Files)</text>
<rect x="450" y="74" width="160" height="54" rx="7" class="fb sb"/><text x="530" y="95" text-anchor="middle" font-size="11.5" font-weight="700">report.py</text><text x="530" y="111" text-anchor="middle" class="tm" font-size="10">JSON, Parquet (Files)</text>
<rect x="250" y="170" width="170" height="54" rx="7" class="fr sr"/><text x="335" y="191" text-anchor="middle" font-size="11.5" font-weight="700">parse.py</text><text x="335" y="207" text-anchor="middle" class="tm" font-size="10">raise … from (Exceptions)</text>
<rect x="450" y="170" width="160" height="54" rx="7" class="fr sr"/><text x="530" y="191" text-anchor="middle" font-size="11.5" font-weight="700">errors.py</text><text x="530" y="207" text-anchor="middle" class="tm" font-size="10">ChaiStallError family</text>
<line x1="220" y1="101" x2="248" y2="101" stroke="currentColor" marker-end="url(#pio-a9)"/>
<path d="M135,128 C135,150 520,150 528,128" fill="none" stroke="currentColor" marker-end="url(#pio-a9)"/>
<line x1="335" y1="128" x2="335" y2="168" stroke="currentColor" marker-end="url(#pio-a9)"/>
<line x1="420" y1="197" x2="448" y2="197" stroke="currentColor" marker-end="url(#pio-a9)"/>
<path d="M400,128 C440,150 480,150 500,168" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pio-a9)"/>
<text x="60" y="200" class="tm" font-size="10">imports flow one way:</text><text x="60" y="215" class="tm" font-size="10">cli → storage/report →</text><text x="60" y="230" class="tm" font-size="10">parse → errors (no cycles)</text>
<text x="60" y="258" class="tm" font-size="10">bad row → BadRowError caught per row in storage · missing file → caught once in cli (exit 2)</text>
</svg><figcaption>The three notes as layers of one program: the environment (outer box) supplies the libraries; the package organises the modules; the modules use files and formats; exceptions flow up from parse to storage (per row) and to cli (per file).</figcaption></figure>
  <table class="tbl"><caption>Every note on Monday 2026-10-19</caption>
    <tr><th>Note / idea</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Exceptions</td><td>functions, classes</td><td>survive and report bad values?</td><td>crash at "two" → ₹230 kept; lines 8, 9, 10 rejected</td><td>any code touching outside data</td></tr>
    <tr><td>Files</td><td>exceptions (with = finally)</td><td>data in from outside, results that last?</td><td>351-byte CSV read safely; run 2 sees the file, not the variable</td><td>every input and output</td></tr>
    <tr><td>Formats</td><td>files + strings + dicts</td><td>which shape for which reader?</td><td>CSV in; JSON summary; Parquet archive; YAML settings</td><td>every time data crosses a boundary</td></tr>
    <tr><td>Modules &amp; packages</td><td>files of code + import</td><td>split, test and reuse code?</td><td>7 modules, 144 lines; one-way imports</td><td>as soon as there are two jobs</td></tr>
    <tr><td>Environments</td><td>packages + pip</td><td>same libraries everywhere?</td><td>system python3: no pyarrow; venv + lock: identical; <code>chaistall</code> command</td><td>every project</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the group: <strong>a real program must survive bad input (exceptions), exchange data through files in the right format (files and formats), and be organised and installed so it runs the same anywhere (modules and environments)</strong>, and each layer relies on the one before it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The habits that break real programs across all three notes.</div>

  <h2 id="pio-traps"><span class="num">05</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mistakes from the three notes cause the most damage in real jobs, and which note fixes each?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: bare except / except Exception: pass</span><p>Silent wrong answers (₹0) and Ctrl+C swallowed. Catch specific types; log the rest. (Exceptions)</p></div>
  <div class="callout trap"><span class="label">Trap: one try around the whole job</span><p>One bad row loses the day. Catch per row. (Exceptions)</p></div>
  <div class="callout trap"><span class="label">Trap: assert for validation</span><p>Removed by <code>python -O</code>. Use raise. (Exceptions)</p></div>
  <div class="callout trap"><span class="label">Trap: no encoding, no with</span><p>Mojibake on Windows; leaked handles and lost writes on errors. (Files)</p></div>
  <div class="callout trap"><span class="label">Trap: split(",") for CSV</span><p>Ben's quoted comma breaks every later column. Use the csv module. (Files)</p></div>
  <div class="callout trap"><span class="label">Trap: loading untrusted pickles</span><p>Runs arbitrary code. (Files)</p></div>
  <div class="callout trap"><span class="label">Trap: a file named csv.py</span><p>Hides the real module. (Modules)</p></div>
  <div class="callout trap"><span class="label">Trap: running package files by path</span><p>Relative imports fail; use <code>python -m</code> or install. (Modules)</p></div>
  <div class="callout trap"><span class="label">Trap: global installs and no lock</span><p>"Works on my machine". One venv per project, pinned. (Modules)</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole group on one page.</div>

  <h2 id="pio-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole group on one sheet. Running example: Chai Corner, Monday 2026-10-19, <code>data/orders_2026-10-19.csv</code>, 9 rows on file lines 2–10. Good: Asha 2 masala chai ₹40, Ben 3 samosa ₹45, Asha 1 ginger chai ₹25, Chen 1 masala chai ₹20, Dia 2 bun maska ₹60, Ben 2 masala chai ₹40 → <strong>₹230</strong>. Bad: line 8 Esha qty "two", line 9 Farid price empty, line 10 Gita qty −1. Output: <code>out/summary_2026-10-19.json</code> (bills Asha 65, Ben 85, Chen 20, Dia 60) and <code>out/orders_2026-10-19.parquet</code>, from the command <code>chaistall data/orders_2026-10-19.csv</code>.</p>
  <h3>The need chain</h3>
  <table class="tbl">
    <tr><th>Need</th><th>Answered by</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>a value is bad at runtime</td><td>Exceptions: try/except, raise, custom classes, chaining, logging</td><td>₹230 kept; lines 8, 9, 10 rejected</td><td>rows inside the code; answer lost at exit</td></tr>
    <tr><td>data must come in and last</td><td>Files: pathlib, open, encoding, lazy reading, with</td><td>CSV read safely, closed on errors</td><td>bytes are not structure</td></tr>
    <tr><td>the right shape for each reader</td><td>Formats: CSV, JSON, YAML, pickle, Parquet</td><td>JSON summary, Parquet archive</td><td>144 lines, five jobs, missing pyarrow</td></tr>
    <tr><td>split and reuse code</td><td>Modules &amp; packages: import, __main__, relative imports</td><td><code>chaistall/</code>, 7 modules</td><td>libraries differ per machine</td></tr>
    <tr><td>same libraries everywhere</td><td>Environments: venv, pip, lock, pyproject, entry point</td><td>identical rebuild; <code>chaistall</code> command</td><td>→ Testing, Docker</td></tr>
  </table>
  <h3>One line per key idea</h3>
  <ul>
    <li>Traceback: read the last line first (type and message), then the line above it (where).</li>
    <li><code>try / except T / else / finally</code>: except on matching error, else on success, finally always.</li>
    <li>Raise your own errors for rules Python does not know; one base class per project; <code>raise … from e</code> keeps the cause.</li>
    <li><code>with open(path, "r", encoding="utf-8") as f: for line in f: …</code> is the safe, lazy, closing way to read.</li>
    <li>CSV: csv module, all strings. JSON: nested, loses some types. YAML: settings, <code>safe_load</code>. pickle: exact, unsafe. Parquet: big, typed, columnar.</li>
    <li><code>import</code>: sys.path search, run once, cache in sys.modules; <code>if __name__ == "__main__":</code>; <code>python -m pkg.mod</code>.</li>
    <li><code>python -m venv .venv</code>, <code>pip install -e .</code>, commit pyproject.toml + lock.</li>
  </ul>
  <h3>When to use which note</h3>
  <div class="cards">
    <div><b>Exceptions</b><p>Any time your code touches data or systems you do not control.</p><small>Not for normal control flow you can test with an if</small></div>
    <div><b>Files &amp; formats</b><p>Every input and output; choose the format by its reader.</p><small>Never pickle for exchange</small></div>
    <div><b>Modules &amp; packages</b><p>As soon as code has two jobs or one test.</p><small>Avoid cycles and library-named files</small></div>
    <div><b>Environments</b><p>Every project, from the first pip install.</p><small>Never install into the system Python</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Bare except; one giant try; assert for validation; no encoding; no with; split(",") for CSV; untrusted pickles; yaml.load; csv.py shadowing; running package files by path; circular imports; global installs; no lock file.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why did the first loop never print ₹230?</td><td><code>int("two")</code> raised ValueError and nobody caught it</td></tr>
    <tr><td>Which rows are rejected, and why is −1 rejected at all?</td><td>Lines 8, 9, 10; −1 by our own <code>raise</code>, since Python accepts it</td></tr>
    <tr><td>Which format does the dashboard read, and which the analyst?</td><td>JSON summary; Parquet archive</td></tr>
    <tr><td>Why did the import fail in the system python3?</td><td>No pyarrow there; the venv has it</td></tr>
    <tr><td>Reading order of the group?</td><td>This map → Exceptions → Files &amp; Data Formats → Modules, Packages &amp; Environments</td></tr>
  </table>

  <h2 id="pio-qa"><span class="num">06</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are the three "real world" needs, and which note answers each?</summary><div class="qa-body">Things go wrong at runtime (Exceptions); data must come from and outlive the program (Files &amp; Data Formats); code must be split and run the same elsewhere (Modules, Packages &amp; Environments).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the finished <code>chaistall</code> importer do with Monday's sheet?</summary><div class="qa-body">Reads the 9 rows, rejects lines 8 ("two"), 9 (empty price) and 10 (−1) with named exceptions, and writes a JSON summary (6 orders, ₹230, bills per customer, the rejections) and a Parquet archive of the 6 good orders. Exit code 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which format would you use for: (a) the helper's daily sheet, (b) the dashboard's summary, (c) a year of orders for analysis, (d) the bad-row threshold, (e) a cache between two of your own Python steps?</summary><div class="qa-body">(a) CSV; (b) JSON; (c) Parquet; (d) YAML; (e) pickle (only because it never leaves your control).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must Exceptions come before Files?</summary><div class="qa-body">Files are where the outside world enters, so they bring errors you cannot prevent: missing files, wrong encodings, bad rows. Handling them needs try/except and custom errors, and <code>with</code> is <code>finally</code> written short. Without exceptions, file code either crashes on the first bad row or hides problems.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the Files note lead to environments?</summary><div class="qa-body">Writing Parquet needs pyarrow, which the system Python lacked (ImportError: no usable engine). Installing libraries per project, and recording their exact versions so a teammate or server gets the same ones, is what virtual environments and lock files do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do modules make exceptions more useful?</summary><div class="qa-body">The exception family lives in <code>chaistall/errors.py</code>; every module imports the same class objects (imports run once and are cached), so <code>except BadRowError</code> in storage.py catches what parse.py raises, and users can write <code>except chaistall.ChaiStallError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip one note?</summary><div class="qa-body">Skip Exceptions: one bad row loses the day, or a bare except reports ₹0. Skip Files: the program cannot read the sheet safely or keep results (mojibake, split commas, unsafe pickles). Skip Modules: a 144-line script nobody can test or install, that works only where the right libraries happen to be.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where should a missing file be caught, and where a bad row?</summary><div class="qa-body">A bad row inside the row loop (lose one row, keep going). A missing file once at the top of the program (cli.py turns it into a clear message and exit code 2), because nothing can continue without the file.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What comes after this group?</summary><div class="qa-body">Context Managers (how <code>with</code> works and writing your own), Iterators &amp; Generators (lazy pipelines over files), Testing &amp; Debugging (pytest on the package), plus Pandas for data at scale and Linux/Docker for running the importer on a server.</div></details>
</main>
`
});
