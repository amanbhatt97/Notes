// notes/python/py_files.js — Files & Data Formats
Object.assign(TOPIC_CONTENT, {
  "py_files": `<main>
<h1>Files &amp; Data Formats</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Files &amp; Data Formats</span></div>
  <p class="lead">Everything a program computes lives in memory and disappears when the program ends. Files are how data arrives from the outside world and how results survive until tomorrow. This note builds file handling one need at a time: naming files with <code>pathlib</code>, <code>open()</code> and its modes, text vs binary, encodings (why "₹" can turn into "â‚¹"), reading huge files line by line, <code>with</code> to guarantee closing, and then the formats data really comes in: CSV (and its quoting trap), JSON (and what it cannot store), pickle (and why loading one can run code), YAML for settings, and Parquet for big typed tables. It ends with a table for choosing a format. The running example continues from <a class="xref" data-note="py_exceptions">Exceptions</a>: Chai Corner's Monday sheet, now as a real CSV file on disk, which the importer turns into a JSON summary and a Parquet archive. Every code block was run (Python 3.13; Parquet in a virtual environment with pandas 3.0.6 and pyarrow 26) and its real output is shown.</p>

  <h2 id="pfl-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 190" width="640">
<defs><marker id="pfl-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="200" y="8" width="240" height="36" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="31" text-anchor="middle" font-size="12">Programs Meet the Real World: the map</text>
<line x1="320" y1="44" x2="110" y2="74" stroke="currentColor" stroke-opacity="0.45"/><line x1="320" y1="44" x2="320" y2="74" stroke="currentColor" stroke-opacity="0.45"/><line x1="320" y1="44" x2="530" y2="74" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="20" y="76" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="95" text-anchor="middle" font-size="12">Exceptions</text><text x="110" y="111" text-anchor="middle" class="tm" font-size="10">things go wrong at runtime</text>
<rect x="230" y="76" width="180" height="44" rx="7" class="fg sg" stroke-width="2.5"/><text x="320" y="95" text-anchor="middle" font-size="12" font-weight="700">Files &amp; Data Formats</text><text x="320" y="111" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · data must last</text>
<rect x="440" y="76" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="530" y="95" text-anchor="middle" font-size="12">Modules &amp; Environments</text><text x="530" y="111" text-anchor="middle" class="tm" font-size="10">code must be split and shared</text>
<line x1="200" y1="98" x2="228" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pfl-a0)"/><line x1="410" y1="98" x2="438" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pfl-a0)"/>
<text x="320" y="150" text-anchor="middle" class="tm" font-size="10.5">this note writes chaistall's storage.py (read the CSV) and report.py (JSON summary, Parquet archive)</text>
<text x="320" y="168" text-anchor="middle" class="tm" font-size="10.5">side trips: Strings (encodings) · Iterators (lazy lines) · Context Managers (with) · Pandas</text>
</svg><figcaption>The "Programs Meet the Real World" group. You are on the middle note.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_exceptions">Exceptions &amp; Error Handling</a></b><span>There the nine rows sat in a Python list, and we learnt to turn bad rows into precise <code>BadRowError</code>s instead of crashes: ₹230 from 6 good orders, rejections on file lines 8, 9 and 10. Left open: real rows come from a file, and the results must still exist tomorrow. You also need <a class="xref" data-note="py_strings">Strings</a> (text vs bytes) and <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> (rows are dicts).</span></li>
    <li><b>This note adds: getting data in and out</b><span>Paths, <code>open</code> and modes, text vs binary, encodings, lazy line-by-line reading, <code>with</code>, and five formats (CSV, JSON, pickle, YAML, Parquet) with a decision table.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a></b><span>The reading and writing code becomes <code>chaistall/storage.py</code> and <code>chaistall/report.py</code> of a real package, and Parquet's need for <code>pyarrow</code> is the first reason we need a virtual environment. Deeper: <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> (why a file is an iterator), <a class="xref" data-note="py_context">Context Managers</a> (how <code>with</code> works inside), <a class="xref" data-note="da_pandas">Pandas</a> (read_csv, read_parquet at scale), and <a class="xref" data-note="se_linux">Linux &amp; Terminal</a> (paths and permissions from the shell).</span></li>
  </ol>

  <h2 id="pfl-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next. Numbers come from the running example: <code>data/orders_2026-10-19.csv</code>, 351 bytes, 9 order rows.</p>
  <ol class="story">
    <li><b>Files</b><span>Q: how does data outlive the program? → Write it to a file on disk. A variable from run 1 does not exist in run 2. But to use a file we must first name and find it…</span></li>
    <li><b>pathlib</b><span>Q: how do we name files reliably? → <code>Path("data") / "orders_2026-10-19.csv"</code>; it knows its <code>.stem</code> (the date is in it), finds every day with <code>glob</code>. But a path is only an address; how do we read and write what is there?</span></li>
    <li><b>open() and modes</b><span>Q: how do we read or write, and what happens to what is already there? → <code>"r"</code>, <code>"w"</code> (empties first!), <code>"a"</code>, <code>"x"</code>. Writes wait in a buffer: 0 bytes on disk until <code>close()</code>, then 17. But what exactly lands on disk: characters?</span></li>
    <li><b>Text vs binary</b><span>Q: what is really stored? → Bytes. "Asha: 2 masala chai ₹40\\n" is 24 characters but 26 bytes, because ₹ takes 3. So who decides which bytes mean which character?</span></li>
    <li><b>Encodings</b><span>Q: how do bytes become characters? → An encoding; always say <code>encoding="utf-8"</code>. The wrong one gives "â‚¹40" or a UnicodeDecodeError, and Excel's hidden BOM renames the first column. But <code>read()</code> pulls the whole file into memory…</span></li>
    <li><b>Lazy line-by-line reading</b><span>Q: what if the file is bigger than memory? → Loop over the file object: a 36 MB file peaked at 71.8 MB with <code>read()</code> and 0.022 MB line by line. But if a bad row raises in the middle of that loop, who closes the file?</span></li>
    <li><b>with</b><span>Q: how do we guarantee the file is closed? → <code>with open(…) as f:</code> closes it on every path (closed? True vs False). But cutting each line at commas breaks Ben's note "extra chutney, no onion"…</span></li>
    <li><b>CSV</b><span>Q: how do we read a table correctly? → The <code>csv</code> module understands quotes: 7 fields, not 8. <code>DictReader</code> + <code>parse_row</code>: 6 good, 3 rejected, ₹230. Everything arrives as text. Now the nested results (per item, per customer, rejections) must be saved for the owner's dashboard…</span></li>
    <li><b>JSON</b><span>Q: how do we save nested results any program can read? → <code>json.dump</code>; a <code>date</code> fails until <code>default=str</code>; tuples come back as lists, int keys as strings, sets fail. But sometimes we want an exact Python snapshot, types and all…</span></li>
    <li><b>pickle</b><span>Q: how do we save any Python object exactly? → <code>pickle.dump</code>: dates and tuples survive. But loading needs the same classes, and loading an untrusted pickle ran a shell command. Settings like <code>max_bad_share</code> are another kind of data: humans edit them…</span></li>
    <li><b>YAML</b><span>Q: where do human-edited settings go? → A YAML config read with <code>yaml.safe_load</code>. Trap: <code>NO</code> became False and <code>1.10</code> became 1.1. And the archive of every order, every day, for a year?</span></li>
    <li><b>Parquet</b><span>Q: how do we store big typed tables compactly and read them fast? → Column by column, compressed, typed: 24.8 MB of CSV became 5.7 MB, and one column reads in about 0.008 s. Needs pyarrow installed. Five formats now; which one when?</span></li>
    <li><b>Choosing a format</b><span>Q: which format for which job? → Ask four questions: human-readable? keeps types? fast and small? safe to load from strangers? The importer reads CSV, writes JSON for people and dashboards, Parquet for the archive, YAML for settings, and never pickles anything it receives.</span></li>
  </ol>

  <h2 id="pfl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Files &amp; Data Formats</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Paths &amp; open</div>
        <ul>
          <li><code>Path("data") / "x.csv"</code>; <code>.name .stem .suffix .parent</code></li>
          <li><code>glob</code>, <code>mkdir(parents=True, exist_ok=True)</code>, <code>exists</code></li>
          <li>Modes: r (default), w (empties!), a (append), x (create only), b (binary)</li>
          <li>Writes are buffered until flush/close</li>
          <li>💡 a path is an address, open() is the door</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bytes &amp; encodings</div>
        <ul>
          <li>Disk holds bytes; text mode decodes/encodes for you</li>
          <li>₹ = 3 bytes in UTF-8 (e2 82 b9)</li>
          <li>Always <code>encoding="utf-8"</code>; Excel CSV → <code>"utf-8-sig"</code></li>
          <li>⚠ wrong encoding: mojibake or UnicodeDecodeError</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading safely</div>
        <ul>
          <li><code>for line in f</code>: one line at a time, tiny memory</li>
          <li>A file is an iterator: one pass only</li>
          <li><code>with open(...)</code> = try/finally close</li>
          <li>⚠ <code>f.read()</code> on a 20 GB file</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CSV &amp; JSON</div>
        <ul>
          <li>csv.reader/DictReader understand quotes; open with <code>newline=""</code></li>
          <li>⚠ <code>line.split(",")</code> breaks quoted commas</li>
          <li>CSV gives only strings → parse yourself</li>
          <li>json dump/load (file) vs dumps/loads (string)</li>
          <li>⚠ tuple→list, int key→str, date/set/Decimal → TypeError</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">pickle &amp; YAML</div>
        <ul>
          <li>pickle: any Python object, exact; binary mode</li>
          <li>⚠ loading can run code; needs the same classes/versions</li>
          <li>YAML: human-edited config; <code>yaml.safe_load</code></li>
          <li>⚠ YAML 1.1: NO → False, 1.10 → 1.1; quote them</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Parquet &amp; choosing</div>
        <ul>
          <li>Columnar, typed, compressed; needs pyarrow</li>
          <li>Read only some columns / filtered rows</li>
          <li>24.8 MB CSV → 5.7 MB; one column ~0.008 s</li>
          <li>Choose by: readable? typed? fast/small? safe?</li>
          <li>Chai Corner: CSV in → JSON + Parquet out, YAML settings</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pfl-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Files</span><span class="rm-sub">Data that outlives the program</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-path"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Paths with pathlib</span><span class="rm-sub">Naming and finding files</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-open"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">open() and Modes</span><span class="rm-sub">r, w, a, x, buffering</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-bin"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Text vs Binary</span><span class="rm-sub">Characters vs bytes</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-enc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Encodings</span><span class="rm-sub">UTF-8, mojibake, BOM</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-lazy"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Reading Lazily</span><span class="rm-sub">Line by line</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-with"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">with</span><span class="rm-sub">Always close</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-csv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">CSV</span><span class="rm-sub">The quoting trap</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-json"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">JSON</span><span class="rm-sub">What can't be saved</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-pickle"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">pickle</span><span class="rm-sub">Exact, and unsafe</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-yaml"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">YAML</span><span class="rm-sub">Settings files</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-parquet"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Parquet</span><span class="rm-sub">Big typed tables</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-choose"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Choosing a Format</span><span class="rm-sub">Four questions</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">And their fixes</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pfl-why"><span class="num">01</span>Why Files: Data That Outlives the Program</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In <a class="xref" data-note="py_exceptions">Exceptions</a> the importer computed ₹230 and three rejections, from rows typed into the code. Where do real rows come from, and where do the results go so that they still exist after the program ends?</p>
  </div>
  <p>A running program keeps its variables in <strong>memory</strong> (RAM). Memory is fast, but it belongs to one running program and is emptied when the program ends. Two runs of Python, one after the other, share nothing:</p>
  <div class="fx" data-lang="text">$ python3 -c "revenue = 230; print('run 1: revenue =', revenue)"
run 1: revenue = 230
$ python3 -c "print('run 2: revenue =', revenue)"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    print('run 2: revenue =', revenue)
                              ^^^^^^^
NameError: name 'revenue' is not defined. Did you mean: 'reversed'?</div>
  <p>A <strong>file</strong> is a named sequence of bytes kept on disk by the operating system. It survives the program, a reboot, and can be read by other programs (Excel, a dashboard, a colleague's script). Every exchange of data between programs, and between today and tomorrow, goes through files (or databases, which are files managed by a server).</p>
  <h3>The running example on disk</h3>
  <p>The helper exports Monday's sheet as <code>data/orders_2026-10-19.csv</code>. This is the exact file (351 bytes) the rest of the note reads. Compared with the list in the Exceptions note it has three extra columns: <code>order_id</code>, <code>time</code>, and a free-text <code>note</code>; Ben's note contains a comma, so the spreadsheet wrapped it in double quotes.</p>
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
  <p>The goal of this note, by the end: read this file safely, skip the three bad rows with the exceptions we already have, and write two outputs, <code>out/summary_2026-10-19.json</code> (for the owner's dashboard) and <code>out/orders_2026-10-19.parquet</code> (the archive), with settings coming from a YAML file.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Memory is the chalk slate at the counter: quick to write on, wiped every night. A file is the ledger book on the shelf: slower to open, but tomorrow's helper can read it.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Persistence</strong> means data outliving the process that created it. A <strong>file</strong> is a named sequence of bytes stored by the operating system's file system; a <strong>format</strong> (CSV, JSON, Parquet …) is an agreement about what those bytes mean.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A result that is only printed is not saved. "It printed ₹230 last night" helps nobody if the terminal was closed; write results to a file.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Paths with pathlib.</b> Before we can open the sheet we must name it correctly, on every operating system, and find all the days' files.</div>

  <h2 id="pfl-path"><span class="num">02</span>Paths with pathlib</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A file's address is a <strong>path</strong> like <code>data/orders_2026-10-19.csv</code>. Building it by gluing strings is fragile. How do we name files reliably, pull information (like the date) out of their names, and find all of them?</p>
  </div>
  <p>A path is a list of folder names ending in a file name. A <strong>relative</strong> path (<code>data/orders.csv</code>) starts from the folder the program was started in (the current working directory); an <strong>absolute</strong> path starts from the root (<code>/home/asha/…</code> or <code>C:\\…</code>). The <code>pathlib</code> module turns a path into an object: <code>/</code> joins parts with the right separator for the OS, and the object knows its own name, extension and folder.</p>
  <div class="fx" data-lang="py">from pathlib import Path

print("data" + "orders_2026-10-19.csv")            # gluing strings: slash forgotten
data = Path("data")
src = data / "orders_2026-10-19.csv"               # / joins correctly on every OS
print(src)
print(src.name, "|", src.stem, "|", src.suffix, "|", src.parent)
print(src.exists(), src.stat().st_size, "bytes")
print(src.with_suffix(".parquet").name, "|", src.stem.removeprefix("orders_"))
print(sorted(p.name for p in data.glob("orders_*.csv")))
out = Path("out") / "archive"
out.mkdir(parents=True, exist_ok=True)              # make missing parents, no error if present
print(out, out.is_dir())
print(src.resolve().is_absolute())</div>
  <div class="fx" data-lang="text">dataorders_2026-10-19.csv
data/orders_2026-10-19.csv
orders_2026-10-19.csv | orders_2026-10-19 | .csv | data
True 351 bytes
orders_2026-10-19.parquet | 2026-10-19
['orders_2026-10-18.csv', 'orders_2026-10-19.csv']
out/archive True
True</div>
  <p>Line by line: gluing strings forgot the slash and produced the wrong name <code>dataorders_…</code> (no error, just a file that does not exist). With <code>Path</code>, <code>data / "orders_2026-10-19.csv"</code> is correct. <code>.name</code> is the file name, <code>.stem</code> the name without extension, <code>.suffix</code> the extension, <code>.parent</code> the folder. The file exists and has 351 bytes. <code>with_suffix</code> builds the archive's name, and <code>stem.removeprefix("orders_")</code> extracts the date "2026-10-19", which is exactly how the importer knows which day it is. <code>glob("orders_*.csv")</code> found both Sunday's and Monday's sheets. <code>mkdir(parents=True, exist_ok=True)</code> made <code>out/archive</code> and its parent, and would not complain if they existed. <code>resolve()</code> turns a relative path into an absolute one.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A path is a postal address: country / city / street / house. pathlib is the post office's address form, with a separate box for each part, instead of one line of handwriting where a missing comma sends the letter to the wrong city.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>pathlib.Path</code> represents a file-system path. <code>p / "x"</code> joins; <code>.name .stem .suffix .parent</code> split; <code>.exists() .is_dir() .stat()</code> ask the OS; <code>.glob(pattern)</code> / <code>.rglob(pattern)</code> list matches (rglob also in sub-folders); <code>.mkdir(parents=True, exist_ok=True)</code> creates folders; <code>.read_text()/.write_text()</code> are one-line read/write helpers.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Relative paths depend on where you <em>start</em> the program, not where the script is. <code>python chaistall/cli.py</code> from the project folder and from your home folder look for <code>data/…</code> in different places. In real tools, take paths as command-line arguments (the importer does) or build them from <code>Path(__file__).parent</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: open() and Modes.</b> A path only names a file. How do we actually read from it and write to it, and what happens to what the file already contains?</div>

  <h2 id="pfl-open"><span class="num">03</span>open() and Modes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The importer must read the sheet and write an import log. Reading must not change the file, and writing must not destroy yesterday's log by accident. How do we tell Python our intention?</p>
  </div>
  <p><code>open(path, mode, encoding=…)</code> asks the operating system for a connection to a file and returns a <strong>file object</strong> with methods like <code>read</code>, <code>write</code> and <code>close</code>. The <strong>mode</strong> declares the intention, and the OS enforces it:</p>
  <table class="tbl">
    <tr><th>mode</th><th>meaning</th><th>file missing</th><th>file exists</th></tr>
    <tr><td><code>"r"</code> (default)</td><td>read</td><td>FileNotFoundError</td><td>read from the start</td></tr>
    <tr><td><code>"w"</code></td><td>write</td><td>creates it</td><td><strong>empties it first</strong></td></tr>
    <tr><td><code>"a"</code></td><td>append</td><td>creates it</td><td>writes go at the end</td></tr>
    <tr><td><code>"x"</code></td><td>exclusive create</td><td>creates it</td><td>FileExistsError</td></tr>
    <tr><td>add <code>"b"</code></td><td>binary: bytes, no decoding</td><td colspan="2">e.g. <code>"rb"</code>, <code>"wb"</code> (section 04)</td></tr>
    <tr><td>add <code>"+"</code></td><td>read and write</td><td colspan="2">rarely needed; e.g. <code>"r+"</code></td></tr>
  </table>
  <div class="fx" data-lang="py">from pathlib import Path

log = Path("out/import_log.txt")
with open(log, "w", encoding="utf-8") as f:        # w: create, or EMPTY then write
    f.write("2026-10-19 import started\\n")
with open(log, "a", encoding="utf-8") as f:        # a: add at the end
    f.write("2026-10-19 6 orders, Rs 230, 3 rejected\\n")
print(log.read_text(encoding="utf-8"), end="")
print("---")
with open(log, "w", encoding="utf-8") as f:        # w again: yesterday's lines are gone
    f.write("2026-10-20 import started\\n")
print(log.read_text(encoding="utf-8"), end="")
print("---")
try:
    open(log, "x")                                 # x: create only, never overwrite
except FileExistsError as e:
    print("x -&gt;", type(e).__name__)
try:
    open("out/no_such_day.csv")                    # r (default): must exist
except FileNotFoundError as e:
    print("r -&gt;", e)

f = open("out/unsaved.txt", "w", encoding="utf-8")
f.write("6 orders, Rs 230\\n")
print("size on disk before close:", Path("out/unsaved.txt").stat().st_size)
f.close()
print("size on disk after close: ", Path("out/unsaved.txt").stat().st_size)</div>
  <div class="fx" data-lang="text">2026-10-19 import started
2026-10-19 6 orders, Rs 230, 3 rejected
---
2026-10-20 import started
---
x -&gt; FileExistsError
r -&gt; [Errno 2] No such file or directory: 'out/no_such_day.csv'
size on disk before close: 0
size on disk after close:  17</div>
  <p>Trace it. <code>"w"</code> created the log with one line; <code>"a"</code> added a second line after it. Opening with <code>"w"</code> again (the next day's run) wiped both lines before writing: yesterday's log is gone. <code>"x"</code> refused because the file exists (useful for "never overwrite an archive"). Reading a missing file raised <code>FileNotFoundError</code>, the error the finished importer turns into exit code 2.</p>
  <p>The last four lines show <strong>buffering</strong>. <code>f.write</code> put 17 characters into a buffer in memory, and the file on disk still had 0 bytes. Only <code>close()</code> (or <code>flush()</code>) pushed them to disk. Writing to disk in big chunks is much faster than byte by byte, but it means: a file that is never closed may never receive its last writes.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>"w"</code> is tearing all the pages out of the ledger and starting fresh; <code>"a"</code> is turning to the next blank page. The buffer is the waiter's notepad: orders reach the kitchen only when the waiter walks over (close/flush).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>open(file, mode="r", encoding=None, newline=None)</code> returns a file object. Text modes return <code>str</code> and need an encoding; binary modes (<code>"b"</code>) return <code>bytes</code>. Data written is buffered until <code>flush()</code> or <code>close()</code>. Every opened file must be closed.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>open(path, "w")</code> on the file you meant to read empties it instantly, before you read a single line. Open input files with <code>"r"</code> (the default) and output files under a different name.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Text vs Binary.</b> We wrote "characters" and the disk reported "bytes". Are they the same thing?</div>

  <h2 id="pfl-bin"><span class="num">04</span>Text vs Binary</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Files on disk hold bytes (numbers 0–255). Python strings hold characters, including "₹" and "é" and "😀", far more than 256 kinds. So what exactly does writing text put on the disk?</p>
  </div>
  <p>In <strong>text mode</strong> (<code>"r"</code>, <code>"w"</code>) Python converts for you: characters are <em>encoded</em> into bytes on the way out and bytes are <em>decoded</em> into characters on the way in. In <strong>binary mode</strong> (<code>"rb"</code>, <code>"wb"</code>) there is no conversion: you get the raw <code>bytes</code>. Text files (CSV, JSON, YAML) are usually opened in text mode; pickles, Parquet files and images are binary.</p>
  <div class="fx" data-lang="py">from pathlib import Path

line = "Asha: 2 masala chai ₹40\\n"
with open("out/receipt.txt", "w", encoding="utf-8") as f:
    n = f.write(line)
print("characters written:", n)
with open("out/receipt.txt", "rb") as f:            # b: give me the raw bytes
    raw = f.read()
print("bytes on disk:", len(raw))
print(raw)
print(raw[-6:-1], "-&gt;", raw[-6:-1].decode("utf-8"))
print(type(line).__name__, type(raw).__name__)</div>
  <div class="fx" data-lang="text">characters written: 24
bytes on disk: 26
b'Asha: 2 masala chai \\xe2\\x82\\xb940\\n'
b'\\xe2\\x82\\xb940' -&gt; ₹40
str bytes</div>
  <p>We wrote 24 characters, but the file has 26 bytes. Reading it back in binary mode shows why: every ASCII character (letters, digits, space, colon, the newline <code>\\n</code>) is one byte, but "₹" became three bytes, <code>\\xe2\\x82\\xb9</code>. The last five bytes (<code>\\xe2\\x82\\xb940</code>) decode back to "₹40". Same file, two views: <code>str</code> in text mode, <code>bytes</code> in binary mode. (The byte-by-byte rules are traced in <a class="xref" data-note="py_strings">Strings</a>, "Unicode, Bytes &amp; Encodings".)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Text mode is a translator who reads the bytes aloud as words. Binary mode hands you the raw sheet of numbers. Most of the time you want the translator; for photos, pickles and Parquet there are no words to read.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>bytes</code> is an immutable sequence of integers 0–255; <code>str</code> is a sequence of Unicode characters. <code>s.encode(enc)</code> turns str into bytes; <code>b.decode(enc)</code> turns bytes into str. Text-mode files do this automatically with the file's <code>encoding</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Opening a binary file (pickle, Parquet, an image) in text mode fails with a decode error or corrupts it on write. And <code>len(text)</code> is not the file size: 24 characters, 26 bytes.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Encodings.</b> The translation between characters and bytes followed a rule (₹ → e2 82 b9). Who chooses that rule, and what happens if the reader uses a different one?</div>

  <h2 id="pfl-enc"><span class="num">05</span>Encodings</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The writer turned ₹ into three bytes using one rule. If the reader decodes those bytes with a different rule, what does the owner see on the dashboard?</p>
  </div>
  <p>An <strong>encoding</strong> is the rule mapping characters to bytes. <strong>UTF-8</strong> can encode every character and is the standard for files and the web. Older encodings (Windows <code>cp1252</code>, <code>latin-1</code>, <code>ascii</code>) cover only a few hundred characters. If you do not pass <code>encoding=</code>, Python uses the operating system's default, which is UTF-8 on Linux and macOS but often cp1252 on Windows. Here is the receipt from section 04 decoded four ways:</p>
  <div class="fx" data-lang="py">import csv, locale
from pathlib import Path

p = Path("out/receipt.txt")                          # written as UTF-8 above
print("default here:", locale.getpreferredencoding(False))
print("utf-8 :", p.read_text(encoding="utf-8"), end="")
print("cp1252:", p.read_text(encoding="cp1252"), end="")       # wrong key: mojibake
try:
    p.read_text(encoding="ascii")
except UnicodeDecodeError as e:
    print("ascii : UnicodeDecodeError:", e)
print("ascii+replace:", p.read_text(encoding="ascii", errors="replace"), end="")

Path("out/from_excel.csv").write_text("order_id,customer\\n1,Asha\\n", encoding="utf-8-sig")
with open("out/from_excel.csv", newline="", encoding="utf-8") as f:
    print(next(csv.DictReader(f)))
with open("out/from_excel.csv", newline="", encoding="utf-8-sig") as f:
    print(next(csv.DictReader(f)))</div>
  <div class="fx" data-lang="text">default here: utf-8
utf-8 : Asha: 2 masala chai ₹40
cp1252: Asha: 2 masala chai â‚¹40
ascii : UnicodeDecodeError: 'ascii' codec can't decode byte 0xe2 in position 20: ordinal not in range(128)
ascii+replace: Asha: 2 masala chai ���40
{'\\ufefforder_id': '1', 'customer': 'Asha'}
{'order_id': '1', 'customer': 'Asha'}</div>
  <p>Read the results. With the right key (utf-8) the text is perfect. With cp1252 there is no error at all, but each of ₹'s three bytes became its own character, "â‚¹": this garbage is called <strong>mojibake</strong>, and because nothing fails it can reach a report unnoticed. ASCII knows only 128 characters, so byte 0xe2 at position 20 raised <code>UnicodeDecodeError</code>. <code>errors="replace"</code> avoids the error but puts "�" marks where data was lost.</p>
  <p>The last two lines are a trap that hits almost everyone who receives CSVs from Excel. "CSV UTF-8" in Excel writes three invisible bytes at the start of the file, a <strong>BOM</strong> (byte order mark). Read with plain <code>"utf-8"</code>, the BOM becomes the character <code>\\ufeff</code> glued to the first column name, so <code>row["order_id"]</code> raises <code>KeyError</code> although the header clearly says order_id. The encoding <code>"utf-8-sig"</code> removes the BOM if present.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A message in a cipher. With the right key (utf-8) you read it; with the wrong key (cp1252) you read confident nonsense; with a key that has no symbol for a byte (ascii) you are stuck.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>encoding</strong> maps characters to byte sequences. UTF-8 uses 1 byte for ASCII and 2–4 bytes for others. <code>open(…, encoding="utf-8")</code> fixes the rule; <code>errors="strict"</code> (default) raises <code>UnicodeDecodeError</code> on invalid bytes, <code>"replace"</code> substitutes "�". <code>"utf-8-sig"</code> also strips a leading BOM.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Code without <code>encoding=</code> works on your laptop and breaks on a colleague's Windows machine. Always write <code>encoding="utf-8"</code> in text mode (use <code>"utf-8-sig"</code> for Excel CSVs).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Lazily.</b> So far we used <code>read_text()</code> / <code>read()</code>, which load the whole file into one string. Monday's sheet is 351 bytes; the chain's yearly log is gigabytes.</div>

  <h2 id="pfl-lazy"><span class="num">06</span>Reading Line by Line, Lazily</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>f.read()</code> builds one string the size of the whole file. What happens when the file is bigger than the memory we can spare, and how do we process it anyway?</p>
  </div>
  <p>A text file object is an <strong>iterator</strong> over its lines: each <code>next(f)</code> reads just enough of the file to return the next line, and a <code>for line in f</code> loop does that repeatedly. Only one line (plus a small buffer) is in memory at a time. This "produce the next item only when asked" behaviour is called <strong>lazy</strong> evaluation; <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> explains the mechanism in full.</p>
  <div class="fx" data-lang="py">from pathlib import Path

src = Path("data/orders_2026-10-19.csv")
with open(src, encoding="utf-8") as f:
    print(type(f).__name__, iter(f) is f)           # a file is its own iterator
    header = next(f)                                # one line per next()
    print(repr(header))
    for n, line in enumerate(f, start=2):           # the loop continues from line 2
        if n &lt;= 3 or n &gt;= 9:
            print(n, line.rstrip("\\n"))
    print("lines after the loop:", list(f))         # one pass only: nothing left</div>
  <div class="fx" data-lang="text">TextIOWrapper True
'order_id,time,customer,item,qty,price,note\\n'
2 1,08:05,Asha,masala chai,2,20,
3 2,08:12,Ben,samosa,3,15,"extra chutney, no onion"
9 8,09:10,Farid,cold coffee,1,,
10 9,09:20,Gita,masala chai,-1,20,refund?
lines after the loop: []</div>
  <p>Before: <code>iter(f) is f</code> confirms the file is its own iterator. <code>next(f)</code> returned the header line (with its <code>\\n</code>). The loop then <em>continued from line 2</em>, because the file remembers its position; we printed only some lines to keep the output short. After the loop, <code>list(f)</code> is empty: the iterator is used up. A file can be read once per open; to read it again, open it again (or <code>f.seek(0)</code>).</p>
  <h3>The same idea at scale</h3>
  <p>Now a year of a busy chain: a million order lines. We measure the peak memory Python used while counting the lines, first with <code>read()</code>, then with a loop:</p>
  <div class="fx" data-lang="py">import tracemalloc
from pathlib import Path

big = Path("out/big_orders.csv")                    # a year of a busy chain, say
with open(big, "w", encoding="utf-8") as f:
    f.write("order_id,time,customer,item,qty,price,note\\n")
    for i in range(1_000_000):
        f.write(f"{i},08:05,Asha,masala chai,2,20,\\n")
print(round(big.stat().st_size / 1e6, 1), "MB on disk")

tracemalloc.start()
with open(big, encoding="utf-8") as f:
    text = f.read()                                 # everything at once
    n_all = text.count("\\n")
del text
peak_all = tracemalloc.get_traced_memory()[1]
tracemalloc.reset_peak()
n_lazy = 0
with open(big, encoding="utf-8") as f:
    for line in f:                                  # one line at a time
        n_lazy += 1
peak_lazy = tracemalloc.get_traced_memory()[1]
print(f"read(): {n_all} lines, peak {peak_all / 1e6:.1f} MB")
print(f"loop  : {n_lazy} lines, peak {peak_lazy / 1e6:.3f} MB")
big.unlink()</div>
  <div class="fx" data-lang="text">35.9 MB on disk
read(): 1000001 lines, peak 71.8 MB
loop  : 1000001 lines, peak 0.022 MB</div>
  <p>Same file, same answer (1,000,001 lines including the header). <code>read()</code> peaked at 71.8 MB, about twice the 35.9 MB on disk, because the whole text had to be decoded into one string. The loop peaked at 0.022 MB, a few thousand times less, and would stay that small for a 50 GB file.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>read()</code> is photocopying the whole ledger before reading it. Looping over the file is reading it page by page with a bookmark.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Iterating a text file yields one line per step, including its trailing <code>"\\n"</code> (strip it with <code>line.rstrip("\\n")</code>). Memory use is independent of file size. The file object keeps a position, so iteration is single-pass.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>f.read()</code>, <code>f.readlines()</code> and <code>list(f)</code> all load everything. Use them only on files you know are small; for logs and data dumps, loop.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: with.</b> Our loops may raise <code>BadRowError</code> or <code>UnicodeDecodeError</code> half-way through a file. When the loop is abandoned, the file object is still open. Who closes it?</div>

  <h2 id="pfl-with"><span class="num">07</span>with: Closing Files Even When Things Fail</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We saw in section 03 that unclosed files may lose their last writes, and in <a class="xref" data-note="py_exceptions">Exceptions</a> that an error unwinds out of a function, skipping the rest of it, including a <code>f.close()</code> at the bottom. How do we close the file on every path?</p>
  </div>
  <p>We already know one answer: <code>finally</code> runs on every path. <code>with open(…) as f:</code> is the short, standard way of writing "open, run the block, and close in a finally". The file object is a <strong>context manager</strong>: an object that knows how to set itself up and clean itself up (<a class="xref" data-note="py_context">Context Managers</a> shows how to write your own).</p>
  <div class="fx" data-lang="py">src = "data/orders_2026-10-19.csv"

f = open(src, encoding="utf-8")                     # no with
try:
    for line in f:
        if ",two," in line:
            raise ValueError("bad row: " + line.strip())
except ValueError as e:
    print(e)
print("without with, closed?", f.closed)            # still open: leaked

try:
    with open(src, encoding="utf-8") as g:
        for line in g:
            if ",two," in line:
                raise ValueError("bad row: " + line.strip())
except ValueError as e:
    print(e)
print("with with,    closed?", g.closed)            # closed on the way out
f.close()</div>
  <div class="fx" data-lang="text">bad row: 7,09:03,Esha,samosa,two,15,
without with, closed? False
bad row: 7,09:03,Esha,samosa,two,15,
with with,    closed? True</div>
  <p>Both versions hit Esha's row and raised. Without <code>with</code>, the error skipped any cleanup and the file stayed open (<code>closed? False</code>), leaking one OS file handle per failed run; after a few thousand, the program fails with "too many open files". With <code>with</code>, the file was closed on the way out (<code>closed? True</code>), even though the block ended in an exception. Every file in the rest of this note, and in the package, is opened with <code>with</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A shop door with a spring: however you leave (calmly, or running from a fire), it closes behind you. <code>f.close()</code> at the bottom of the code is a door you have to remember to pull shut.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>with EXPR as name: BLOCK</code> calls <code>EXPR.__enter__()</code>, binds the result to <code>name</code>, runs <code>BLOCK</code>, and then always calls <code>__exit__</code>, which for files closes them. For a file it is equivalent to <code>f = open(…); try: BLOCK finally: f.close()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Returning a lazy generator over <code>f</code> from inside a <code>with</code> block: the file is closed as soon as the function returns, and the caller's loop fails with "I/O operation on closed file" (traced in <a class="xref" data-note="py_iterators">Iterators</a>, Common Mistakes).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: CSV.</b> We can read lines safely. But a line is not a row: Ben's line has 8 commas and 7 columns. How do we split a table correctly?</div>

  <h2 id="pfl-csv"><span class="num">08</span>CSV: Tables as Text (and the Quoting Trap)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A CSV line looks like values separated by commas, so <code>line.split(",")</code> seems enough. Ben's note is "extra chutney, no onion". What happens to a value that contains the separator?</p>
  </div>
  <p><strong>CSV</strong> (comma-separated values) stores a table as text: the first line is usually the header, then one line per row, values separated by commas. When a value contains a comma, a quote or a newline, the writer wraps it in double quotes, and a double quote inside is written twice (<code>""</code>). The <code>csv</code> module implements these rules; <code>str.split</code> does not.</p>
  <div class="fx" data-lang="py">import csv
from pathlib import Path

src = Path("data/orders_2026-10-19.csv")
lines = src.read_text(encoding="utf-8").splitlines()
print(lines[2])
naive = lines[2].split(",")
print(len(naive), naive)                            # 8 pieces for 7 columns!
proper = next(csv.reader([lines[2]]))
print(len(proper), proper)                          # the quotes are understood

with open(src, newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))                  # header row -&gt; dict keys
print(len(rows), "rows")
print(rows[1])
print(repr(rows[0]["qty"]), repr(rows[7]["price"]))  # everything is text; empty = ''</div>
  <div class="fx" data-lang="text">2,08:12,Ben,samosa,3,15,"extra chutney, no onion"
8 ['2', '08:12', 'Ben', 'samosa', '3', '15', '"extra chutney', ' no onion"']
7 ['2', '08:12', 'Ben', 'samosa', '3', '15', 'extra chutney, no onion']
9 rows
{'order_id': '2', 'time': '08:12', 'customer': 'Ben', 'item': 'samosa', 'qty': '3', 'price': '15', 'note': 'extra chutney, no onion'}
'2' ''</div>
  <p>The naive split gave 8 pieces for a 7-column table: the note was cut in two, and both halves kept a stray quote. Every column after it would be shifted by one. <code>csv.reader</code> returned 7 fields with the quotes removed. <code>csv.DictReader</code> uses the header as keys, so each row is a dict like <code>row["qty"]</code>: exactly the shape our <code>parse_row</code> expects. Notice the last line: <code>'2'</code> is a string and Farid's price is <code>''</code>. A CSV file has no types; every value is text, and an empty cell is an empty string. Turning text into numbers, and complaining when it cannot, is <code>parse_row</code>'s job from the Exceptions note.</p>
  <h3>Writing CSV: let the module quote</h3>
  <div class="fx" data-lang="py">import csv
from pathlib import Path

rejected = [
    {"line": 8, "reason": "qty 'two' is not a whole number"},
    {"line": 9, "reason": "price is empty, ask Farid"},           # a comma
    {"line": 10, "reason": 'qty -1, note says "refund?"'},        # comma and quotes
]
with open("out/rejected.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["line", "reason"])
    w.writeheader()
    w.writerows(rejected)
print(Path("out/rejected.csv").read_text(encoding="utf-8"))

with open("out/rejected.csv", newline="", encoding="utf-8") as f:
    back = list(csv.DictReader(f))
print(back[2])</div>
  <div class="fx" data-lang="text">line,reason
8,qty 'two' is not a whole number
9,"price is empty, ask Farid"
10,"qty -1, note says ""refund?"""

{'line': '10', 'reason': 'qty -1, note says "refund?"'}</div>
  <p>The writer quoted only the values that needed it: line 9's reason has a comma; line 10's has a comma and quotes, so it was wrapped and each inner <code>"</code> doubled. Reading it back restored the exact text. If we had built lines with f-strings, line 9 would have become three columns. Note <code>newline=""</code> when opening CSV files: the csv module handles line endings itself, and without it, Windows gets an extra blank line after every row.</p>
  <h3>The importer's reader: chaistall/storage.py</h3>
  <p>Now everything meets: a path, <code>with</code>, UTF-8, <code>newline=""</code>, lazy <code>DictReader</code> (it reads one line at a time too), the line number of each row (<code>enumerate(…, start=2)</code>, because line 1 is the header), and the <code>BadRowError</code> family from the previous note. If more than half the rows are bad, the whole file is suspect and <code>TooManyBadRowsError</code> is raised.</p>
  <div class="fx" data-lang="py">"""Read the day's CSV; skip bad rows but remember why."""
import csv
import logging

from .errors import BadRowError, TooManyBadRowsError
from .parse import parse_row

log = logging.getLogger(__name__)


def read_orders(path, max_bad_share=0.5):
    good, rejected = [], []
    with open(path, newline="", encoding="utf-8") as f:
        for line, row in enumerate(csv.DictReader(f), start=2):
            try:
                good.append(parse_row(row, line))
            except BadRowError as e:
                rejected.append({"line": e.line, "field": e.field, "reason": str(e)})
                log.warning("skipped %s", e)
    total = len(good) + len(rejected)
    if total and len(rejected) / total &gt; max_bad_share:
        raise TooManyBadRowsError(f"{len(rejected)} of {total} rows are bad")
    return good, rejected</div>
  <div class="fx" data-lang="py">import logging
from chaistall.storage import read_orders

logging.basicConfig(level=logging.WARNING, format="%(levelname)s %(name)s: %(message)s")
good, rejected = read_orders("data/orders_2026-10-19.csv")
print(len(good), "good,", len(rejected), "rejected, revenue", sum(o["amount"] for o in good))
print(good[1])</div>
  <div class="fx" data-lang="text">WARNING chaistall.storage: skipped line 8, qty: 'two' is not a whole number
WARNING chaistall.storage: skipped line 9, price: is empty
WARNING chaistall.storage: skipped line 10, qty: -1 must be positive
6 good, 3 rejected, revenue 230
{'order_id': '2', 'time': '08:12', 'customer': 'Ben', 'item': 'samosa', 'qty': 3, 'price': 15, 'note': 'extra chutney, no onion', 'amount': 45}</div>
  <p>The same numbers as the by-hand table in the Exceptions note: 6 good orders, ₹230, three rejections at file lines 8, 9 and 10, now read from the real file. Ben's order kept his whole note, and its qty and price are real integers.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>CSV is a marksheet photocopied as plain text: rows and columns survive, but the photocopy does not know that the marks column holds numbers.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>csv.reader(f)</code> yields each row as a list of strings; <code>csv.DictReader(f)</code> yields dicts keyed by the header; <code>csv.writer</code>/<code>csv.DictWriter</code> write rows, quoting as needed. Open CSV files with <code>newline=""</code> and an explicit encoding. CSV has no types, no nesting and no standard for missing values.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>line.split(",")</code> and <code>",".join(values)</code> are not CSV. They break on the first value containing a comma or quote. Always use the csv module (or pandas). And remember <code>pd.read_csv</code> <em>guesses</em> types: a column with one "two" in it stays text (section 12 shows it).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: JSON.</b> The results are not a flat table: a total, a dict per item, a dict per customer, a list of rejections. CSV cannot hold that shape. How do we save nested results so a dashboard (in any language) can read them?</div>

  <h2 id="pfl-json"><span class="num">09</span>JSON: Nested Data Any Program Can Read</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The owner's dashboard is a web page written in JavaScript. It needs the day's summary: revenue, cups per item, bill per customer, and the rejected lines. Which format holds nested dicts and lists, is readable by every language, and still readable by a human?</p>
  </div>
  <p><strong>JSON</strong> (JavaScript Object Notation) writes data almost the way Python writes dicts and lists: objects <code>{"key": value}</code>, arrays <code>[…]</code>, strings, numbers, <code>true/false</code>, <code>null</code>. The <code>json</code> module converts both ways. Memory aid: the functions with an <strong>s</strong> work on <strong>s</strong>trings (<code>dumps</code>, <code>loads</code>); without it, on files (<code>dump</code>, <code>load</code>). The importer's <code>report.py</code>:</p>
  <div class="fx" data-lang="py">"""Summarise good orders; write the JSON summary and the Parquet archive."""
import json
from collections import Counter


def summarise(day, good, rejected):
    by_item, by_customer = Counter(), Counter()
    for o in good:
        by_item[o["item"]] += o["qty"]
        by_customer[o["customer"]] += o["amount"]
    return {"date": day, "orders": len(good),
            "revenue": sum(o["amount"] for o in good),
            "by_item": dict(by_item), "by_customer": dict(by_customer),
            "rejected": rejected}


def write_summary(summary, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False, default=str)


def write_archive(good, path):
    import pandas as pd                  # heavy import, only when needed
    pd.DataFrame(good).to_parquet(path, index=False)</div>
  <div class="fx" data-lang="py">import json, logging
from datetime import date
from chaistall.storage import read_orders
from chaistall.report import summarise

logging.disable(logging.WARNING)                    # warnings were shown above
good, rejected = read_orders("data/orders_2026-10-19.csv")
summary = summarise(date(2026, 10, 19), good, rejected)
try:
    json.dumps(summary)
except TypeError as e:
    print("TypeError:", e)

with open("out/summary_2026-10-19.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2, default=str)   # dump -&gt; file; default for unknown types
with open("out/summary_2026-10-19.json", encoding="utf-8") as f:
    back = json.load(f)                             # load &lt;- file
print(back["date"], type(back["date"]).__name__, back["revenue"], back["by_customer"])
print(json.dumps(back["by_item"]))                  # dumps -&gt; str (the "s")
print(back == summary)</div>
  <div class="fx" data-lang="text">TypeError: Object of type date is not JSON serializable
2026-10-19 str 230 {'Asha': 65, 'Ben': 85, 'Chen': 20, 'Dia': 60}
{"masala chai": 5, "samosa": 3, "ginger chai": 1, "bun maska": 2}
False</div>
  <p>The first try failed: JSON has no date type, and <code>json.dumps</code> refuses objects it does not know. <code>default=str</code> says "for anything unknown, store <code>str(obj)</code>", so the date was written as <code>"2026-10-19"</code>. Reading back gives the same revenue (230) and the same bills as the Collections note (Asha 65, Ben 85, Chen 20, Dia 60). But the date came back as a <code>str</code>, not a <code>date</code>, so <code>back == summary</code> is <code>False</code>. JSON is a translation, not a copy. (The finished importer's JSON file is shown in <a class="xref" data-note="py_io">the map</a>.)</p>
  <h3>What JSON cannot store, tested</h3>
  <div class="fx" data-lang="py">import json
from datetime import date
from decimal import Decimal

tests = {
    "tuple":   ("Asha", 2),
    "int key": {8: "two"},
    "None":    None,
    "rupee":   "₹40",
    "nan":     float("nan"),
    "set":     {"Asha", "Ben"},
    "date":    date(2026, 10, 19),
    "Decimal": Decimal("20.50"),
}
for name, value in tests.items():
    try:
        text = json.dumps(value)
        print(f"{name:8} -&gt; {text:20} -&gt; back as {json.loads(text)!r}")
    except TypeError as e:
        print(f"{name:8} -&gt; TypeError: {e}")
print(json.dumps("₹40", ensure_ascii=False))
try:
    json.dumps(float("nan"), allow_nan=False)
except ValueError as e:
    print("allow_nan=False -&gt;", e)</div>
  <div class="fx" data-lang="text">tuple    -&gt; ["Asha", 2]          -&gt; back as ['Asha', 2]
int key  -&gt; {"8": "two"}         -&gt; back as {'8': 'two'}
None     -&gt; null                 -&gt; back as None
rupee    -&gt; "\\u20b940"           -&gt; back as '₹40'
nan      -&gt; NaN                  -&gt; back as nan
set      -&gt; TypeError: Object of type set is not JSON serializable
date     -&gt; TypeError: Object of type date is not JSON serializable
Decimal  -&gt; TypeError: Object of type Decimal is not JSON serializable
"₹40"
allow_nan=False -&gt; Out of range float values are not JSON compliant: nan</div>
  <table class="tbl"><caption>Python → JSON → Python</caption>
    <tr><th>Python value</th><th>JSON text</th><th>comes back as</th><th>fix</th></tr>
    <tr><td>tuple <code>("Asha", 2)</code></td><td>array</td><td><strong>list</strong></td><td>convert after loading if you need a tuple</td></tr>
    <tr><td>int key <code>{8: …}</code></td><td>string key <code>"8"</code></td><td><strong>str</strong> key</td><td>convert keys after loading</td></tr>
    <tr><td>None / True</td><td>null / true</td><td>None / True</td><td>—</td></tr>
    <tr><td>"₹40"</td><td><code>"\\u20b940"</code></td><td>"₹40"</td><td><code>ensure_ascii=False</code> to keep ₹ readable</td></tr>
    <tr><td>float("nan")</td><td><code>NaN</code> (not valid JSON!)</td><td>nan in Python only</td><td><code>allow_nan=False</code> to forbid; use null</td></tr>
    <tr><td>set, date, Decimal</td><td>— TypeError</td><td>—</td><td><code>default=str</code>, or convert (list, isoformat, str)</td></tr>
  </table>
  <p>The NaN line deserves attention: Python wrote <code>NaN</code>, which Python itself reads back, but the JSON standard has no NaN, so a JavaScript dashboard or a strict parser rejects the whole file. <code>allow_nan=False</code> turns that into an immediate error at write time.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>JSON is a food-delivery order slip: items inside the order, add-ons inside items, readable by any restaurant's system. But it only has boxes for text, numbers, yes/no and lists; a "date" or a "set" must be written in as text.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>json.dump(obj, f)</code> / <code>json.dumps(obj)</code> serialise dicts, lists, str, int, float, bool and None to JSON text; <code>json.load(f)</code> / <code>json.loads(s)</code> parse it back. Useful options: <code>indent=2</code>, <code>ensure_ascii=False</code>, <code>default=func</code> for unknown types, <code>allow_nan=False</code>, <code>sort_keys=True</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Assuming a JSON round trip gives the same object. Tuples become lists, int keys become strings, dates become strings (with <code>default=str</code>), and numpy numbers fail. Convert explicitly at the boundary.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: pickle.</b> Sometimes the reader is our own Python program, and we want back <em>exactly</em> what we saved: real dates, tuples, our own objects. JSON cannot do that.</div>

  <h2 id="pfl-pickle"><span class="num">10</span>pickle: Exact Python Objects (and the Security Trap)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Re-parsing the CSV on every run is wasteful when another Python step just wants yesterday's parsed orders, with real <code>date</code> objects and tuples intact. How do we save a Python object exactly as it is?</p>
  </div>
  <p><strong>pickle</strong> turns (almost) any Python object into bytes and back: dicts, lists, dates, tuples, sets, objects of your own classes, trained models. Saving an object to bytes is called <strong>serialising</strong> it. Because the result is bytes, open the file in binary mode (<code>"wb"</code>, <code>"rb"</code>).</p>
  <div class="fx" data-lang="py">import logging, pickle
from datetime import date
from chaistall.storage import read_orders

logging.disable(logging.WARNING)
good, rejected = read_orders("data/orders_2026-10-19.csv")
cache = {"day": date(2026, 10, 19), "good": good, "lines_rejected": (8, 9, 10)}

with open("out/day_cache.pkl", "wb") as f:          # binary mode: pickle is bytes
    pickle.dump(cache, f)
with open("out/day_cache.pkl", "rb") as f:
    back = pickle.load(f)
print(back == cache)                                # exact round trip
print(type(back["day"]).__name__, type(back["lines_rejected"]).__name__)
print(open("out/day_cache.pkl", "rb").read()[:20])  # not text</div>
  <div class="fx" data-lang="text">True
date tuple
b'\\x80\\x04\\x95\\x08\\x02\\x00\\x00\\x00\\x00\\x00\\x00}\\x94(\\x8c\\x03day\\x94'</div>
  <p>An exact round trip: <code>back == cache</code> is True, the date is still a <code>date</code>, the tuple still a <code>tuple</code>. The first bytes of the file show it is not text at all. That is the good side. Now two problems.</p>
  <h3>Problem 1: the class must exist when loading</h3>
  <div class="fx" data-lang="py">import pickle
from dataclasses import dataclass

@dataclass
class Order:
    customer: str
    qty: int

with open("out/order.pkl", "wb") as f:
    pickle.dump(Order("Asha", 2), f)
print("saved", Order("Asha", 2))</div>
  <div class="fx" data-lang="text">saved Order(customer='Asha', qty=2)</div>
  <div class="fx" data-lang="py">import pickle
with open("out/order.pkl", "rb") as f:
    print(pickle.load(f))                           # this program has no Order class</div>
  <div class="fx" data-lang="text">Traceback (most recent call last):
  File "pickle_load_elsewhere.py", line 3, in &lt;module&gt;
    print(pickle.load(f))                           # this program has no Order class
          ~~~~~~~~~~~^^^
AttributeError: Can't get attribute 'Order' on &lt;module '__main__' from 'pickle_load_elsewhere.py'&gt;</div>
  <p>A pickle does not contain the class's code, only its name ("Order in module __main__"). The loading program has no such class, so loading fails. The same happens when you rename or move a class, or upgrade a library whose internals changed: old pickles stop loading.</p>
  <h3>Problem 2: loading a pickle can run any code</h3>
  <div class="fx" data-lang="py">import pickle

class Evil:                                         # what an attacker would send
    def __reduce__(self):                           # "to rebuild me, call this"
        import os
        return (os.system, ("echo PWNED: this shell command ran on load",))

payload = pickle.dumps(Evil())
print(len(payload), "bytes, looks harmless")
pickle.loads(payload)                               # just LOADING runs it</div>
  <div class="fx" data-lang="text">80 bytes, looks harmless
PWNED: this shell command ran on load</div>
  <p>A pickle can say "to rebuild me, call this function with these arguments", and the special method <code>__reduce__</code> lets the object choose <em>any</em> function, here <code>os.system</code>. The 80 harmless-looking bytes ran a shell command the moment they were loaded. A real attacker would not print "PWNED"; they would delete files or steal keys.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Pickle is freezing a cooked meal: reheat it later exactly as it was, but only in the same kitchen (the same classes). And a frozen parcel from a stranger might contain instructions the oven obeys on its own.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>pickle.dump(obj, f)</code> / <code>pickle.load(f)</code> (binary files) and <code>dumps</code>/<code>loads</code> (bytes) serialise Python objects exactly, by recording how to rebuild them. Loading imports the named classes and calls the recorded functions. <code>joblib</code> (often used for scikit-learn models) uses pickle inside.</p></div>
  <div class="callout trap"><span class="label">Trap: security</span><p>Never <code>pickle.load</code> data from an untrusted source (downloads, user uploads, emails), and never use pickle as a format for exchange or long-term storage. Use JSON or Parquet for data, and safe formats (e.g. safetensors, ONNX) for model weights.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: YAML.</b> We have formats for data and for Python objects. The importer also has <em>settings</em> (the menu, the bad-row threshold) that the owner should edit without touching code. Which format suits files written by humans?</div>

  <h2 id="pfl-yaml"><span class="num">11</span>YAML: Settings Files for Humans</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>max_bad_share=0.5</code> is hard-coded in <code>read_orders</code>. Next month the owner wants 0.4, and the menu prices change. Editing Python for that is risky. Where should human-edited settings live?</p>
  </div>
  <p><strong>YAML</strong> is a text format designed for humans to write: nesting by indentation (like Python), <code>key: value</code> pairs, lists with <code>-</code> or <code>[…]</code>, and <code># comments</code> (JSON has none). It is the usual format for configuration files (CI pipelines, Docker Compose, Kubernetes, ML training settings). It is not in the standard library: <code>pip install pyyaml</code>, imported as <code>yaml</code>. It is installed here (PyYAML 6.0.1 in the system Python; the next note installs it into a virtual environment). The settings file:</p>
  <div class="fx" data-lang="text"># Chai Corner importer settings
outlet: Chai Corner
outlet_code: NO            # "North Office"
max_bad_share: 0.5
schema_version: 1.10
open_days: [mon, tue, wed, thu, fri, sat]
menu:
  masala chai: 20
  ginger chai: 25
  samosa: 15
  bun maska: 30</div>
  <div class="fx" data-lang="py">from pathlib import Path
import yaml

cfg = yaml.safe_load(Path("chaistall.yaml").read_text(encoding="utf-8"))
print(cfg["menu"]["samosa"], cfg["max_bad_share"], cfg["open_days"][:2])
print(repr(cfg["outlet_code"]), repr(cfg["schema_version"]))      # surprise!
print(yaml.safe_load('outlet_code: "NO"\\nschema_version: "1.10"'))
print(yaml.safe_dump({"max_bad_share": 0.4, "open_days": ["mon", "sat"]}, sort_keys=False), end="")
try:
    yaml.safe_load("!!python/object/apply:os.system ['echo PWNED']")
except yaml.YAMLError as e:
    print("safe_load refused:", type(e).__name__)</div>
  <div class="fx" data-lang="text">15 0.5 ['mon', 'tue']
False 1.1
{'outlet_code': 'NO', 'schema_version': '1.10'}
max_bad_share: 0.4
open_days:
- mon
- sat
safe_load refused: ConstructorError</div>
  <p>The useful part worked: the menu is a dict (samosa 15), the threshold a float (0.5), the days a list. Then two surprises on line 2 of the output. <code>outlet_code: NO</code> became <code>False</code>: PyYAML follows YAML 1.1, where yes/no/on/off are booleans (the famous "Norway problem"). And <code>schema_version: 1.10</code> became the float <code>1.1</code>, losing the zero. Quoting fixes both. <code>safe_dump</code> writes YAML back. Finally, YAML has tags that can construct arbitrary Python objects (the same danger as pickle); <code>safe_load</code> refuses them with a <code>ConstructorError</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A YAML config is the laminated card on the stall's wall listing prices and opening days: the owner can change it with a marker, and the helper reads it each morning. Nobody rewires the till to change a price.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>yaml.safe_load(text_or_file)</code> parses YAML into dicts, lists, str, int, float, bool, None (and dates); <code>yaml.safe_dump(obj)</code> writes it. "Safe" means only plain types are constructed. Plain <code>yaml.load</code> with an unsafe loader can build any object.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Unquoted <code>NO</code>, <code>yes</code>, <code>off</code> become booleans and <code>1.10</code> becomes 1.1; quote codes and versions. Always <code>safe_load</code>. And YAML is for small human-edited files, not for data.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Parquet.</b> The archive will hold every order of every day across many outlets: millions of rows, analysed with pandas. CSV loses types and is slow to parse; JSON is even bigger. Is there a format built for big tables?</div>

  <h2 id="pfl-parquet"><span class="num">12</span>Parquet: Big Typed Tables</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A year of orders for a 30-outlet chain is a million rows. The analyst usually needs one or two columns ("how many cups?"). CSV forces reading and parsing every byte of every row, and gives back text. Can a file keep types, be small, and let us read just one column?</p>
  </div>
  <p><strong>Parquet</strong> is a binary file format that stores a table <em>column by column</em>: all order_ids together, then all items, then all quantities. Each column records its type (int64, string, date …) and is compressed; similar values side by side compress very well. A reader can fetch only the columns it needs, and skip chunks of rows using min/max statistics stored in the file. Python reads and writes it through pandas with the <strong>pyarrow</strong> library.</p>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
<text x="10" y="16" class="tm" font-size="11">CSV: row by row, all text</text>
<rect x="10" y="26" width="230" height="22" class="fs" stroke="currentColor"/><text x="16" y="42" font-size="11">1,Asha,masala chai,2,20</text>
<rect x="10" y="50" width="230" height="22" class="fs" stroke="currentColor"/><text x="16" y="66" font-size="11">2,Ben,samosa,3,15</text>
<rect x="10" y="74" width="230" height="22" class="fs" stroke="currentColor"/><text x="16" y="90" font-size="11">3,Asha,ginger chai,1,25</text>
<text x="10" y="120" class="tr" font-size="11">need qty? read and parse every byte</text>
<text x="290" y="16" class="tm" font-size="11">Parquet: column chunks, typed</text>
<rect x="290" y="26" width="80" height="70" class="fb sb"/><text x="296" y="44" font-size="11">customer</text><text x="296" y="62" class="tm" font-size="10">string</text><text x="296" y="80" class="tm" font-size="10">Asha Ben …</text>
<rect x="375" y="26" width="80" height="70" class="fv"/><text x="381" y="44" font-size="11">item</text><text x="381" y="62" class="tm" font-size="10">dictionary</text><text x="381" y="80" class="tm" font-size="10">mc sa gc</text>
<rect x="460" y="26" width="90" height="70" class="fg sg" stroke-width="3"/><text x="466" y="44" font-size="11">qty</text><text x="466" y="62" class="tm" font-size="10">int64</text><text x="466" y="80" class="tm" font-size="10">2 3 1 …</text>
<text x="290" y="120" class="tg" font-size="11">read just this column</text>
<text x="290" y="140" class="tm" font-size="10.5">+ min/max stats per chunk → skip rows</text>
</svg><figcaption>Row-oriented text (CSV) vs column-oriented binary (Parquet).</figcaption></figure>
  <h3>Parquet needs an engine: an environment question</h3>
  <p>pandas is installed in the system Python here, but pyarrow is not. Writing Parquet there fails, and the message says why:</p>
  <div class="fx" data-lang="py">import pandas as pd
pd.DataFrame({"qty": [2, 3]}).to_parquet("out/x.parquet")</div>
  <div class="fx" data-lang="text">Traceback (most recent call last):
  File "no_engine.py", line 2, in &lt;module&gt;
    pd.DataFrame({"qty": [2, 3]}).to_parquet("out/x.parquet")
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^
  ... (frames inside pandas trimmed) ...
ImportError: Unable to find a usable engine; tried using: 'pyarrow', 'fastparquet'.
A suitable version of pyarrow or fastparquet is required for parquet support.
Trying to import the above resulted in these errors:
 - \`Import pyarrow\` failed. pyarrow is required for parquet support. Use pip or conda to install the pyarrow package.
 - \`Import fastparquet\` failed. fastparquet is required for parquet support. Use pip or conda to install the fastparquet package.</div>
  <p>So the Parquet examples below were run in a <strong>virtual environment</strong> with pandas 3.0.6 and pyarrow 26.0.0 installed (<code>python -m venv .venv</code>, <code>pip install pandas pyarrow</code>). Why a separate environment, and how to make one that a teammate can rebuild exactly, is the subject of <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>; this failure is the first reason we need it.</p>
  <h3>The archive of Monday's orders</h3>
  <div class="fx" data-lang="py">import logging
import pandas as pd
from chaistall.storage import read_orders

logging.disable(logging.WARNING)
good, rejected = read_orders("data/orders_2026-10-19.csv")
df = pd.DataFrame(good)
df.to_parquet("out/orders_2026-10-19.parquet", index=False)

back = pd.read_parquet("out/orders_2026-10-19.parquet")
print(back[["customer", "item", "qty", "amount"]])
print(back.dtypes[["qty", "price", "amount"]].to_dict())
part = pd.read_parquet("out/orders_2026-10-19.parquet",
                       columns=["customer", "amount"],
                       filters=[("item", "==", "masala chai")])
print(part)
csv_again = pd.read_csv("data/orders_2026-10-19.csv")
print(csv_again["qty"].dtype, "&lt;- the CSV column has 'two' in it, so pandas keeps text")</div>
  <div class="fx" data-lang="text">  customer         item  qty  amount
0     Asha  masala chai    2      40
1      Ben       samosa    3      45
2     Asha  ginger chai    1      25
3     Chen  masala chai    1      20
4      Dia    bun maska    2      60
5      Ben  masala chai    2      40
{'qty': dtype('int64'), 'price': dtype('int64'), 'amount': dtype('int64')}
  customer  amount
0     Asha      40
1     Chen      20
2      Ben      40
str &lt;- the CSV column has 'two' in it, so pandas keeps text</div>
  <p>The six good orders were written and read back with their types: qty, price and amount are <code>int64</code>, no re-parsing needed. The second read asked for only two columns and only the masala chai rows (<code>filters</code>), and got Asha 40, Chen 20, Ben 40, which match the table in the Exceptions note. The last line shows the CSV problem from section 08 in pandas: because one qty cell says "two", <code>read_csv</code> kept the whole qty column as text.</p>
  <h3>The same idea at scale</h3>
  <div class="fx" data-lang="py">import os, time
import numpy as np, pandas as pd

rng = np.random.default_rng(0)
n = 1_000_000                                       # a year of a 30-outlet chain
items = np.array(["masala chai", "ginger chai", "samosa", "bun maska"])
df = pd.DataFrame({"order_id": np.arange(n),
                   "outlet": rng.integers(1, 31, n),
                   "item": items[rng.integers(0, 4, n)],
                   "qty": rng.integers(1, 5, n),
                   "price": rng.choice([15, 20, 25, 30], n)})
df.to_csv("out/year.csv", index=False)
df.to_parquet("out/year.parquet", index=False)
for f in ["out/year.csv", "out/year.parquet"]:
    print(f"{f:17} {os.path.getsize(f) / 1e6:5.1f} MB")
t = time.perf_counter(); pd.read_csv("out/year.csv"); a = time.perf_counter() - t
t = time.perf_counter(); pd.read_parquet("out/year.parquet"); b = time.perf_counter() - t
t = time.perf_counter(); pd.read_parquet("out/year.parquet", columns=["qty"]); c = time.perf_counter() - t
print(f"read all: csv {a:.2f}s, parquet {b:.2f}s; one parquet column {c:.3f}s")
os.remove("out/year.csv"); os.remove("out/year.parquet")</div>
  <div class="fx" data-lang="text">out/year.csv       24.8 MB
out/year.parquet    5.7 MB
read all: csv 0.46s, parquet 0.37s; one parquet column 0.008s</div>
  <p>A million rows: 24.8 MB as CSV, 5.7 MB as Parquet (about 4× smaller). Reading everything was somewhat faster from Parquet in this run (timings vary from run to run and machine to machine), but the decisive number is the last one: reading only the qty column took under a hundredth of a second, because the other columns were never touched. In the archive's real use, "one or two columns of a big table", that is the win.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school keeps one register per subject. To get everyone's maths marks you open only the maths register, instead of every student's whole report card.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Parquet</strong> is a columnar, typed, compressed binary table format. In pandas: <code>df.to_parquet(path, index=False)</code> and <code>pd.read_parquet(path, columns=[…], filters=[(col, op, value)])</code>; it needs an engine, <code>pyarrow</code> (or <code>fastparquet</code>). It is the standard file format for data lakes, Spark and ML datasets.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Parquet is not for tiny files or for humans: you cannot open it in a text editor, and for six rows it is bigger than CSV (section 13 measures it). Appending one row means rewriting the file (or writing a new file per day, as the importer does).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing a Format.</b> Five formats, each with a strength and a trap. Given a new job, which one?</div>

  <h2 id="pfl-choose"><span class="num">13</span>Choosing a Format</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We met CSV, JSON, pickle, YAML and Parquet one at a time, each answering one need. Side by side on the same data, how do they compare, and what questions decide the choice?</p>
  </div>
  <p>The same six good orders (with a <code>date</code> column added) saved in every format and loaded back, run in the virtual environment:</p>
  <div class="fx" data-lang="py">import csv, json, logging, os, pickle
from datetime import date
import pandas as pd, yaml
from chaistall.storage import read_orders

logging.disable(logging.WARNING)
good, _ = read_orders("data/orders_2026-10-19.csv")
rows = [{"day": date(2026, 10, 19), "customer": o["customer"],
         "item": o["item"], "qty": o["qty"]} for o in good]

with open("out/c.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
with open("out/c.csv", newline="", encoding="utf-8") as f:
    back_csv = list(csv.DictReader(f))
with open("out/c.json", "w", encoding="utf-8") as f:
    json.dump(rows, f, default=str)
back_json = json.load(open("out/c.json", encoding="utf-8"))
with open("out/c.yaml", "w", encoding="utf-8") as f:
    yaml.safe_dump(rows, f)
back_yaml = yaml.safe_load(open("out/c.yaml", encoding="utf-8"))
with open("out/c.pkl", "wb") as f:
    pickle.dump(rows, f)
back_pkl = pickle.load(open("out/c.pkl", "rb"))
pd.DataFrame(rows).to_parquet("out/c.parquet", index=False)
back_pq = pd.read_parquet("out/c.parquet").to_dict("records")

print(f"{'format':8} {'bytes':&gt;6}  qty back as   day back as")
for name, ext, back in [("csv", "csv", back_csv), ("json", "json", back_json),
                        ("yaml", "yaml", back_yaml), ("pickle", "pkl", back_pkl),
                        ("parquet", "parquet", back_pq)]:
    r = back[0]
    print(f"{name:8} {os.path.getsize('out/c.' + ext):6}  {type(r['qty']).__name__:12} {type(r['day']).__name__}")</div>
  <div class="fx" data-lang="text">format    bytes  qty back as   day back as
csv         199  str          str
json        446  int          str
yaml        374  int          date
pickle      334  int          date
parquet    2747  int          date</div>
  <p>CSV is the smallest here and gives back only strings. JSON keeps the numbers but turns the date into a string. YAML and pickle keep both (YAML has a date type). Parquet keeps everything but is by far the largest for six rows (2,747 bytes): its schema and statistics are a fixed overhead that only pays off on large tables, where it was 4× <em>smaller</em> than CSV (section 12).</p>
  <table class="tbl"><caption>The four questions</caption>
    <tr><th>format</th><th>human-readable?</th><th>keeps types?</th><th>fast &amp; small at scale?</th><th>safe to load from strangers?</th><th>best for</th></tr>
    <tr><td>CSV</td><td>yes (and Excel)</td><td>no, all text</td><td>no</td><td>yes</td><td>small flat tables, exchange with people and spreadsheets</td></tr>
    <tr><td>JSON</td><td>yes</td><td>partly (no dates, sets, tuples)</td><td>no</td><td>yes</td><td>nested data, APIs, summaries for dashboards</td></tr>
    <tr><td>YAML</td><td>yes, with comments</td><td>partly (has dates; NO/1.10 traps)</td><td>no</td><td>with <code>safe_load</code> only</td><td>human-edited configuration</td></tr>
    <tr><td>pickle</td><td>no</td><td>exactly, any object</td><td>fair</td><td><strong>no</strong></td><td>short-lived caches between your own Python programs</td></tr>
    <tr><td>Parquet</td><td>no</td><td>yes (typed columns)</td><td>yes (columnar, compressed)</td><td>yes</td><td>big tables, archives, analytics</td></tr>
  </table>
  <div class="flow"><span>a person edits it?</span><span>YAML (settings) / CSV (tables)</span><span>nested, other programs read it?</span><span>JSON</span><span>big table for analysis?</span><span>Parquet</span><span>exact Python object, your own use only?</span><span>pickle</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Containers for food: a glass jar (CSV/JSON: see-through, anyone can open), a labelled recipe card (YAML), a vacuum-packed crate (Parquet: compact, needs a tool to open), and a sealed home-made tiffin (pickle: perfect for you, never accept one from a stranger).</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Choose a format by its <strong>reader</strong> (human, another language, your own Python), its <strong>shape</strong> (flat table, nested, object), its <strong>size</strong>, and its <strong>trust boundary</strong> (does it cross from someone you do not control?).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using the format you know for everything: pickles as an exchange format (unsafe, version-fragile), CSV for a year of data (slow, untyped), JSON for configs that need comments (it has none).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture of the whole path from the helper's sheet to the owner's dashboard and the archive.</div>

  <h2 id="pfl-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Thirteen ideas. Which builds on which, and where does each act in the importer?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<defs><marker id="pfl-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="150" height="50" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="40" text-anchor="middle" font-size="11.5" font-weight="700">orders_…csv</text><text x="85" y="56" text-anchor="middle" class="tm" font-size="10">bytes on disk, UTF-8</text>
<rect x="200" y="20" width="200" height="50" rx="7" class="fb sb"/><text x="300" y="40" text-anchor="middle" font-size="11.5" font-weight="700">Path + with open("r", utf-8)</text><text x="300" y="56" text-anchor="middle" class="tm" font-size="10">02 · 03 · 04 · 05 · 07</text>
<rect x="440" y="20" width="210" height="50" rx="7" class="fb sb"/><text x="545" y="40" text-anchor="middle" font-size="11.5" font-weight="700">csv.DictReader, line by line</text><text x="545" y="56" text-anchor="middle" class="tm" font-size="10">06 lazy · 08 quoting · text only</text>
<line x1="160" y1="45" x2="198" y2="45" stroke="currentColor" marker-end="url(#pfl-a9)"/><line x1="400" y1="45" x2="438" y2="45" stroke="currentColor" marker-end="url(#pfl-a9)"/>
<line x1="545" y1="70" x2="545" y2="102" stroke="currentColor" marker-end="url(#pfl-a9)"/>
<rect x="400" y="104" width="250" height="50" rx="7" class="fg sg"/><text x="525" y="124" text-anchor="middle" font-size="11.5" font-weight="700">parse_row (Exceptions note)</text><text x="525" y="140" text-anchor="middle" class="tm" font-size="10">6 good, ₹230 · 3 BadRowErrors</text>
<rect x="110" y="104" width="240" height="50" rx="7" class="fv"/><text x="230" y="124" text-anchor="middle" font-size="11.5" font-weight="700">chaistall.yaml → safe_load</text><text x="230" y="140" text-anchor="middle" class="tm" font-size="10">11 settings: menu, max_bad_share</text>
<line x1="350" y1="129" x2="398" y2="129" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pfl-a9)"/>
<line x1="470" y1="154" x2="140" y2="196" stroke="currentColor" marker-end="url(#pfl-a9)"/><line x1="525" y1="154" x2="345" y2="196" stroke="currentColor" marker-end="url(#pfl-a9)"/><line x1="580" y1="154" x2="560" y2="196" stroke="currentColor" marker-end="url(#pfl-a9)"/>
<rect x="20" y="198" width="200" height="54" rx="7" class="ft st"/><text x="120" y="218" text-anchor="middle" font-size="11.5" font-weight="700">summary.json</text><text x="120" y="234" text-anchor="middle" class="tm" font-size="10">09 nested, any language</text><text x="120" y="247" text-anchor="middle" class="tm" font-size="10">default=str for the date</text>
<rect x="240" y="198" width="210" height="54" rx="7" class="ft st"/><text x="345" y="218" text-anchor="middle" font-size="11.5" font-weight="700">orders.parquet</text><text x="345" y="234" text-anchor="middle" class="tm" font-size="10">12 typed, columnar archive</text><text x="345" y="247" text-anchor="middle" class="tm" font-size="10">needs pyarrow (environments)</text>
<rect x="470" y="198" width="180" height="54" rx="7" class="fr sr"/><text x="560" y="218" text-anchor="middle" font-size="11.5" font-weight="700">day_cache.pkl</text><text x="560" y="234" text-anchor="middle" class="tm" font-size="10">10 own use only</text><text x="560" y="247" text-anchor="middle" class="tm" font-size="10">never load a stranger's</text>
</svg><figcaption>From bytes on disk to typed outputs. The reading side is layered: path → open (mode, encoding) → text lines → CSV rows → parsed orders. The writing side picks a format per reader.</figcaption></figure>
  <table class="tbl"><caption>Every idea on Monday's file</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Files</td><td>the OS file system</td><td>data that outlives the run?</td><td>run 2: NameError for revenue</td><td>every result worth keeping</td></tr>
    <tr><td>pathlib</td><td>strings → objects</td><td>name and find files?</td><td>stem → "2026-10-19"; glob → 2 days</td><td>every path</td></tr>
    <tr><td>open + modes</td><td>a path</td><td>read/write; protect existing data?</td><td>"w" wiped the log; 0 → 17 bytes on close</td><td>r for input, w/a/x for output</td></tr>
    <tr><td>Text vs binary</td><td>open</td><td>what is stored?</td><td>24 chars → 26 bytes</td><td>text for CSV/JSON/YAML, b for pickle/Parquet</td></tr>
    <tr><td>Encodings</td><td>text mode</td><td>which bytes mean which char?</td><td>cp1252 → "â‚¹40"; BOM → '\\ufefforder_id'</td><td>always encoding="utf-8"</td></tr>
    <tr><td>Lazy lines</td><td>file = iterator</td><td>files bigger than memory?</td><td>71.8 MB vs 0.022 MB peak</td><td>any big file</td></tr>
    <tr><td>with</td><td>try/finally</td><td>always close?</td><td>closed? False vs True after an error</td><td>every open</td></tr>
    <tr><td>CSV</td><td>lines + quoting rules</td><td>read a table correctly?</td><td>8 vs 7 fields; 6 good, ₹230</td><td>flat tables, spreadsheets</td></tr>
    <tr><td>JSON</td><td>text, nested</td><td>nested results for anyone?</td><td>date → "2026-10-19" (str)</td><td>summaries, APIs</td></tr>
    <tr><td>pickle</td><td>binary, Python-only</td><td>exact objects?</td><td>back == cache True; PWNED on load</td><td>own short-lived caches</td></tr>
    <tr><td>YAML</td><td>text, for humans</td><td>editable settings?</td><td>NO → False, 1.10 → 1.1</td><td>config files</td></tr>
    <tr><td>Parquet</td><td>binary, columnar</td><td>big typed tables?</td><td>24.8 → 5.7 MB; one column ~0.008 s</td><td>archives, analytics</td></tr>
    <tr><td>Choosing</td><td>all of the above</td><td>which format when?</td><td>CSV in; JSON + Parquet out; YAML settings</td><td>every new output</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a file is just bytes; the mode and encoding turn bytes into text, and the format turns text (or bytes) into structure, so choose each layer on purpose and close the file on every path.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The bugs that come from getting one of those layers wrong.</div>

  <h2 id="pfl-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which file-handling habits lose data or produce silent garbage, and what does each look like?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "w" on the wrong file</span><p>Empties it before you read a byte. Read with "r", write to a new name; use "x" for files that must never be overwritten.</p></div>
  <div class="callout trap"><span class="label">Trap: no encoding</span><p>Works on Linux, mojibake or UnicodeDecodeError on Windows. Always <code>encoding="utf-8"</code> ("utf-8-sig" for Excel CSVs).</p></div>
  <div class="callout trap"><span class="label">Trap: no with</span><p>Leaked handles on errors; buffered writes never reach disk.</p></div>
  <div class="callout trap"><span class="label">Trap: read() on big files</span><p>Memory grows with the file; loop over lines instead.</p></div>
  <div class="callout trap"><span class="label">Trap: split(",") for CSV</span><p>Breaks on quoted commas and shifts every later column. Use the csv module; open with <code>newline=""</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting CSV types</span><p>Everything is a string; pandas guesses, and one bad cell turns a column into text. Parse and validate explicitly.</p></div>
  <div class="callout trap"><span class="label">Trap: JSON round-trip assumptions</span><p>Tuples → lists, int keys → strings, dates need <code>default=</code>, NaN is not valid JSON.</p></div>
  <div class="callout trap"><span class="label">Trap: loading untrusted pickles</span><p>Runs arbitrary code. Pickle only for your own short-lived caches.</p></div>
  <div class="callout trap"><span class="label">Trap: yaml.load and unquoted NO / 1.10</span><p>Use <code>safe_load</code>; quote codes and versions.</p></div>
  <div class="callout trap"><span class="label">Trap: relative paths</span><p>They depend on the folder you start in. Take paths as arguments or build from <code>Path(__file__).parent</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="pfl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: <code>data/orders_2026-10-19.csv</code> (351 bytes, header + 9 rows; Ben's note "extra chutney, no onion" is quoted). <code>read_orders</code> → 6 good orders, ₹230, rejected lines 8, 9, 10. Outputs: <code>out/summary_2026-10-19.json</code>, <code>out/orders_2026-10-19.parquet</code>; settings in <code>chaistall.yaml</code>.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Files</td><td>outlive the program?</td><td>run 2 has no revenue</td><td>must name the file</td></tr>
    <tr><td>pathlib</td><td>name/find files?</td><td>stem → date; glob → 2 days</td><td>a name doesn't open it</td></tr>
    <tr><td>open + modes</td><td>read/write safely?</td><td>"w" wiped the log; buffer 0 → 17 B</td><td>chars or bytes?</td></tr>
    <tr><td>Text vs binary</td><td>what is stored?</td><td>24 chars = 26 bytes</td><td>which rule?</td></tr>
    <tr><td>Encodings</td><td>bytes ↔ chars?</td><td>â‚¹ / UnicodeDecodeError / BOM</td><td>read() loads everything</td></tr>
    <tr><td>Lazy lines</td><td>huge files?</td><td>71.8 MB vs 0.022 MB</td><td>errors leave files open</td></tr>
    <tr><td>with</td><td>always close?</td><td>closed? True</td><td>commas inside values</td></tr>
    <tr><td>CSV</td><td>read tables?</td><td>7 fields not 8; ₹230</td><td>flat, untyped</td></tr>
    <tr><td>JSON</td><td>nested for anyone?</td><td>date → str</td><td>not exact</td></tr>
    <tr><td>pickle</td><td>exact objects?</td><td>round trip True; PWNED</td><td>unsafe; settings?</td></tr>
    <tr><td>YAML</td><td>human settings?</td><td>NO → False, 1.10 → 1.1</td><td>big tables?</td></tr>
    <tr><td>Parquet</td><td>big typed tables?</td><td>24.8 → 5.7 MB; 1 column fast</td><td>which when?</td></tr>
    <tr><td>Choosing</td><td>which format?</td><td>CSV in; JSON, Parquet out</td><td>→ next note: package it</td></tr>
  </table>
  <h3>Definitions and syntax</h3>
  <ul>
    <li><code>Path("data") / "x.csv"</code>; <code>.name .stem .suffix .parent</code>; <code>.glob("*.csv")</code>; <code>.mkdir(parents=True, exist_ok=True)</code>.</li>
    <li><code>open(path, mode, encoding="utf-8", newline=…)</code>; modes r / w (truncates) / a / x (+b binary); writes are buffered until close/flush.</li>
    <li><code>str.encode(enc)</code> → bytes; <code>bytes.decode(enc)</code> → str; ₹ = <code>e2 82 b9</code> in UTF-8; "utf-8-sig" strips Excel's BOM.</li>
    <li><code>for line in f:</code> lazy, single pass; <code>line.rstrip("\\n")</code>.</li>
    <li><code>with open(…) as f:</code> = open + try/finally close.</li>
    <li><code>csv.reader</code> → lists, <code>csv.DictReader</code> → dicts (all str); <code>csv.DictWriter(f, fieldnames=…)</code>, <code>writeheader</code>, <code>writerows</code>; quotes <code>"…"</code> and doubles inner quotes.</li>
    <li><code>json.dump/load</code> (files), <code>dumps/loads</code> (strings); <code>indent</code>, <code>ensure_ascii=False</code>, <code>default=str</code>, <code>allow_nan=False</code>.</li>
    <li><code>pickle.dump/load</code> in <code>"wb"/"rb"</code>; exact; needs the classes; can execute code.</li>
    <li><code>yaml.safe_load / safe_dump</code>; quote NO, yes, 1.10.</li>
    <li><code>df.to_parquet(p, index=False)</code>; <code>pd.read_parquet(p, columns=[…], filters=[…])</code>; needs pyarrow.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>CSV</b><p>Small flat tables, spreadsheets, hand-offs to people.</p><small>Not for types, nesting or big data</small></div>
    <div><b>JSON</b><p>Nested results, APIs, dashboards, any language.</p><small>Not exact: dates, tuples, sets change or fail</small></div>
    <div><b>YAML</b><p>Settings that humans edit, with comments.</p><small>Not for data; always safe_load</small></div>
    <div><b>pickle</b><p>Your own short-lived caches of Python objects.</p><small>Never from strangers; not for long-term storage</small></div>
    <div><b>Parquet</b><p>Big typed tables, archives, analytics, column reads.</p><small>Not for tiny files or human reading</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>"w" truncates; missing encoding; no <code>with</code>; <code>read()</code> on big files; <code>split(",")</code> for CSV; CSV has no types; JSON round-trip changes types, NaN invalid; untrusted pickles run code; <code>yaml.load</code>, NO → False; relative paths depend on the start folder.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why is "Asha: 2 masala chai ₹40\\n" 24 characters but 26 bytes?</td><td>₹ takes 3 bytes in UTF-8</td></tr>
    <tr><td>How many fields does <code>split(",")</code> give for Ben's line, and how many are right?</td><td>8; 7 (the quoted note contains a comma)</td></tr>
    <tr><td>What does the summary's date come back as after a JSON round trip?</td><td>a str, "2026-10-19"</td></tr>
    <tr><td>Why open a pickle with "rb"?</td><td>It is bytes, not text</td></tr>
    <tr><td>Why did writing Parquet fail in the system Python?</td><td>No engine (pyarrow) installed there; use a venv with pyarrow</td></tr>
  </table>

  <h2 id="pfl-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between modes "w", "a" and "x"?</summary><div class="qa-body">"w" creates or empties the file, then writes; "a" creates or appends at the end; "x" creates only, raising FileExistsError if the file exists. Add "b" for binary.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>with open(...)</code>?</summary><div class="qa-body">It closes the file on every path, including when an exception is raised inside the block, so handles do not leak and buffered writes are flushed. It is shorthand for open + try/finally close.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you process a 20 GB log file?</summary><div class="qa-body">Iterate over the open file (<code>for line in f</code>), which reads one line at a time; memory stays tiny (0.022 MB for a 36 MB file here) regardless of size. Never <code>read()</code> or <code>readlines()</code> it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A CSV from Excel gives <code>KeyError: 'order_id'</code> although the header shows order_id. Why?</summary><div class="qa-body">Excel's "CSV UTF-8" starts with a BOM; read as "utf-8" it becomes <code>\\ufeff</code> glued to the first column name. Open with <code>encoding="utf-8-sig"</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not parse CSV with <code>line.split(",")</code>?</summary><div class="qa-body">Values may contain commas, quotes or newlines, which CSV protects with quotes. split cut Ben's note into two fields (8 instead of 7). The csv module implements the quoting rules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What changes in a JSON round trip?</summary><div class="qa-body">Tuples become lists, non-string keys become strings, dates/sets/Decimal fail unless converted (<code>default=str</code>), and NaN is written as the non-standard <code>NaN</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is it safe to load a pickled model someone emailed you?</summary><div class="qa-body">No. Unpickling can call any function via <code>__reduce__</code>; the demo ran a shell command just by loading 80 bytes. Load pickles only from trusted sources; exchange data as JSON/Parquet and weights in safe formats.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why <code>yaml.safe_load</code>, and what are YAML's type surprises?</summary><div class="qa-body">safe_load builds only plain types; unsafe loaders can build arbitrary objects. Surprises (YAML 1.1): NO/yes/on/off → booleans, 1.10 → 1.1. Quote such values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CSV vs Parquet for a 10 GB training set?</summary><div class="qa-body">Parquet: columnar (read only needed columns), compressed (24.8 → 5.7 MB here), typed (no re-parsing, no "two" turning a column into text), with statistics for skipping rows. CSV only for small hand-offs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does reading a file need everything from the Exceptions note?</summary><div class="qa-body">Files add failures the program cannot prevent: missing files (FileNotFoundError), wrong encodings (UnicodeDecodeError), bad rows (our BadRowError). <code>with</code> is <code>finally</code> in disguise, row-level <code>try</code> keeps the good rows, and file-level errors are caught once at the top of the CLI.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you get the encoding layer wrong but the CSV layer right?</summary><div class="qa-body">The csv module works on characters, so it faithfully parses whatever the decoder produced: "â‚¹40" mojibake, or a first column named "\\ufefforder_id". The layers stack: bytes → (encoding) → text → (csv) → rows; a mistake low down poisons everything above it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is a file object an iterator, and what does that cost you?</summary><div class="qa-body">So that <code>for line in f</code> reads lazily, one line per <code>next()</code> (<a class="xref" data-note="py_iterators">Iterators</a>). The cost: it is single-pass (list(f) after the loop was empty) and it holds an open OS handle, which is why lazy reading and <code>with</code> go together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the Parquet section lead straight into the Modules &amp; Environments note?</summary><div class="qa-body">Parquet needs pyarrow, which the system Python did not have (ImportError: no usable engine). Installing it globally risks breaking other projects and cannot be reproduced by a teammate; a virtual environment plus a pinned requirements/lock file solves both, which is the next note's subject.</div></details>
</main>
`
});
