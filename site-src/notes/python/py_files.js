// notes/python/py_files.js — Files & Data Formats
Object.assign(TOPIC_CONTENT, {
  "py_files": `<main>
<h1>Files &amp; Data Formats</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Files &amp; Data Formats</span></div>
  <p class="lead">Variables live in memory and vanish when the process exits; files are how data enters a program and how results survive until the next run or reach another program. Getting the layers right matters: the wrong mode silently empties a file, a missing <code>encoding=</code> turns "₹" into "â‚¹" on Windows, <code>read()</code> on a 20 GB log exhausts memory, and <code>split(",")</code> corrupts any CSV with a quoted comma. On top of raw files sit the data formats you meet daily in DS/ML and backend work: CSV for spreadsheets, JSON for APIs and summaries, YAML for configs, pickle for Python-only caches (and its security hole), and Parquet for large typed tables. Code was run on Python 3.13; Parquet examples in a virtual environment with pandas 3.0.6 and pyarrow 26.</p>

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
          <li><code>for line in f</code>: one line at a time, constant memory</li>
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
          <li>1M rows: 24.8 MB CSV → 5.7 MB; one column ~0.008 s</li>
          <li>Choose by: readable? typed? fast/small? safe?</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pfl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Files and Persistence</span><span class="rm-sub">Memory vs disk, the sample CSV</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-path"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Paths with pathlib</span><span class="rm-sub">Join, split, glob, mkdir</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-open"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">open() and File Modes</span><span class="rm-sub">r, w, a, x and buffering</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-bin"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Text vs Binary Mode</span><span class="rm-sub">str vs bytes, encode/decode</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-enc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Encodings</span><span class="rm-sub">UTF-8, mojibake, the BOM</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-lazy"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Reading Large Files Line by Line</span><span class="rm-sub">File iterators, memory measured</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-with"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">with: Closing Files Reliably</span><span class="rm-sub">Context manager vs leaked handle</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-csv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">CSV and the csv Module</span><span class="rm-sub">Quoting, DictReader, DictWriter</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-json"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">JSON</span><span class="rm-sub">dump/load and type changes</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-pickle"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">pickle</span><span class="rm-sub">Exact objects, code execution risk</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-yaml"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">YAML for Configuration</span><span class="rm-sub">safe_load and type surprises</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-parquet"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Parquet: Columnar Files</span><span class="rm-sub">Typed, compressed, column reads</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-choose"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Choosing a File Format</span><span class="rm-sub">Five formats compared</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">File-handling bugs and fixes</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Syntax, tables and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Basic to advanced, with answers</span></div></div>
    </div>
  </div>

  <h2 id="pfl-why"><span class="num">01</span>Files and Persistence</h2>
  <p>A running program keeps its variables in <strong>memory</strong>, which belongs to one process and is emptied when it exits. Two runs share nothing:</p>
  <div class="fx" data-lang="text">$ python3 -c "revenue = 230; print('run 1: revenue =', revenue)"
run 1: revenue = 230
$ python3 -c "print('run 2: revenue =', revenue)"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    print('run 2: revenue =', revenue)
                              ^^^^^^^
NameError: name 'revenue' is not defined. Did you mean: 'reversed'?</div>
  <p>A <strong>file</strong> is a named sequence of bytes kept by the operating system. It survives the process and a reboot, and other programs (Excel, a dashboard, another script) can read it. Most examples below read this 351-byte order sheet, <code>data/orders_2026-10-19.csv</code>; note that Ben's note contains a comma and is therefore quoted, and the last three rows hold bad values.</p>
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
  <div class="callout def"><span class="label">Definition</span><p><strong>Persistence</strong> means data outliving the process that created it. A <strong>file</strong> is a named sequence of bytes in the file system; a <strong>format</strong> (CSV, JSON, Parquet …) is an agreement about what those bytes mean.</p></div>

  <h2 id="pfl-path"><span class="num">02</span>Paths with pathlib</h2>
  <p>A <strong>path</strong> names a file. Building paths by gluing strings is fragile (forgotten separators, <code>/</code> vs <code>\\</code>), so <code>pathlib.Path</code> turns a path into an object: <code>/</code> joins parts with the right separator for the OS, and the object knows its name, extension and folder. A <strong>relative</strong> path starts from the current working directory; an <strong>absolute</strong> path starts from the root.</p>
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
  <p>String gluing produced <code>dataorders_…</code> with no error, just a file that does not exist. <code>.name</code>, <code>.stem</code>, <code>.suffix</code> and <code>.parent</code> split the path; <code>with_suffix</code> swaps the extension; <code>glob</code> lists matching files; <code>mkdir(parents=True, exist_ok=True)</code> creates the folder and its parents and does not complain if they exist; <code>resolve()</code> makes the path absolute.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>pathlib.Path</code> represents a file-system path. <code>p / "x"</code> joins; <code>.name .stem .suffix .parent</code> split; <code>.exists() .is_file() .is_dir() .stat()</code> ask the OS; <code>.glob(pattern)</code> / <code>.rglob(pattern)</code> list matches (rglob recursively); <code>.mkdir(parents=True, exist_ok=True)</code> creates folders; <code>.read_text()</code> / <code>.write_text()</code> are one-line helpers; <code>.unlink()</code> deletes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Relative paths depend on where you <em>start</em> the program, not where the script is. In real tools, take paths as command-line arguments or build them from <code>Path(__file__).parent</code>.</p></div>

  <h2 id="pfl-open"><span class="num">03</span>open() and File Modes</h2>
  <p><code>open(path, mode, encoding=…)</code> asks the OS for a connection to a file and returns a <strong>file object</strong> with <code>read</code>, <code>write</code> and <code>close</code>. The <strong>mode</strong> declares intent, and getting it wrong can destroy data:</p>
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
  <p><code>"w"</code> created the log; <code>"a"</code> appended; <code>"w"</code> again wiped both lines. <code>"x"</code> refused an existing file (good for archives that must never be overwritten), and reading a missing file raised <code>FileNotFoundError</code>.</p>
  <p>The last lines show <strong>buffering</strong>: <code>f.write</code> put 17 characters into an in-memory buffer and the file on disk still had 0 bytes until <code>close()</code> (or <code>flush()</code>). Writing in large chunks is much faster, but a file that is never closed may never receive its last writes.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>open(file, mode="r", encoding=None, newline=None)</code> returns a file object. Text modes return <code>str</code> and use an encoding; binary modes (<code>"b"</code>) return <code>bytes</code>. Writes are buffered until <code>flush()</code> or <code>close()</code> (and even then the OS may cache them; <code>os.fsync</code> forces them to the device). Every opened file must be closed.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>open(path, "w")</code> on the file you meant to read empties it before you read a single line. Open inputs with <code>"r"</code> and write outputs under a different name.</p></div>

  <h2 id="pfl-bin"><span class="num">04</span>Text vs Binary Mode</h2>
  <p>Disks store bytes (0–255), while Python strings hold Unicode characters. In <strong>text mode</strong> (<code>"r"</code>, <code>"w"</code>) Python <em>encodes</em> characters to bytes on write and <em>decodes</em> bytes to characters on read. In <strong>binary mode</strong> (<code>"rb"</code>, <code>"wb"</code>) there is no conversion and you get raw <code>bytes</code>. CSV, JSON and YAML are text; pickle, Parquet and images are binary.</p>
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
  <p>24 characters became 26 bytes: every ASCII character is one byte in UTF-8, but "₹" is three (<code>\\xe2\\x82\\xb9</code>). Same file, two views: <code>str</code> in text mode, <code>bytes</code> in binary mode. Details of UTF-8: <a class="xref" data-note="py_strings">Strings</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>bytes</code> is an immutable sequence of integers 0–255; <code>str</code> is a sequence of Unicode code points. <code>s.encode(enc)</code> → bytes; <code>b.decode(enc)</code> → str. Text-mode files do this automatically with their <code>encoding</code>, and also translate newlines (<code>\\r\\n</code> ↔ <code>\\n</code>) unless <code>newline=""</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Opening a binary file (pickle, Parquet, image) in text mode fails with a decode error or corrupts it on write. And <code>len(text)</code> is not the file size.</p></div>

  <h2 id="pfl-enc"><span class="num">05</span>Encodings: UTF-8, Mojibake and the BOM</h2>
  <p>An <strong>encoding</strong> is the rule mapping characters to bytes; the reader must use the same rule as the writer. <strong>UTF-8</strong> encodes every character and is the standard for files and the web; legacy encodings (<code>cp1252</code>, <code>latin-1</code>, <code>ascii</code>) cover a few hundred. Without <code>encoding=</code>, Python uses the OS default: UTF-8 on Linux and macOS, often cp1252 on Windows. The receipt above decoded four ways:</p>
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
  <p>cp1252 raises no error but turns each of ₹'s three bytes into its own character, "â‚¹": <strong>mojibake</strong>, dangerous precisely because nothing fails. ASCII cannot decode byte 0xe2 and raises <code>UnicodeDecodeError</code>; <code>errors="replace"</code> hides the error but loses data ("�").</p>
  <p>The last two lines are the Excel trap. "CSV UTF-8" from Excel starts with a 3-byte <strong>BOM</strong> (byte order mark). Read as plain <code>"utf-8"</code>, it becomes <code>\\ufeff</code> glued to the first column name, so <code>row["order_id"]</code> raises <code>KeyError</code>. <code>"utf-8-sig"</code> strips the BOM if present.</p>
  <div class="callout def"><span class="label">Definition</span><p>UTF-8 uses 1 byte for ASCII and 2–4 bytes for other characters. <code>errors="strict"</code> (default) raises on invalid bytes; <code>"replace"</code> substitutes "�"; <code>"ignore"</code> drops them. <code>"utf-8-sig"</code> also strips a leading BOM. Python 3.15 makes UTF-8 the default everywhere (UTF-8 mode, <code>python -X utf8</code> today).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Code without <code>encoding=</code> works on your laptop and breaks on a Windows colleague's machine. Always write <code>encoding="utf-8"</code> in text mode (<code>"utf-8-sig"</code> for Excel CSVs).</p></div>

  <h2 id="pfl-lazy"><span class="num">06</span>Reading Large Files Line by Line</h2>
  <p><code>f.read()</code> builds one string the size of the whole file, which fails once files exceed available memory. A text file object is an <strong>iterator</strong> over its lines: each <code>next(f)</code> reads just enough to return one line, so <code>for line in f</code> keeps only one line plus a small buffer in memory (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> covers the protocol).</p>
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
  <p>The file is its own iterator, remembers its position (the loop continued after the header), and is single-pass: after the loop, <code>list(f)</code> is empty. To read again, reopen or <code>f.seek(0)</code>. Each line keeps its trailing <code>"\\n"</code>.</p>
  <h3>Memory: read() vs iteration, measured</h3>
  <div class="fx" data-lang="py">import tracemalloc
from pathlib import Path

big = Path("out/big_orders.csv")                    # a million order lines
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
  <p><code>read()</code> peaked at about twice the file size (decoding builds the whole string); the loop peaked at 0.022 MB and would stay there for a 50 GB file.</p>
  <table class="tbl">
    <tr><th>call</th><th>returns</th><th>memory</th></tr>
    <tr><td><code>f.read()</code></td><td>whole file as one str</td><td>O(file)</td></tr>
    <tr><td><code>f.read(n)</code></td><td>next n characters (bytes in "b" mode)</td><td>O(n)</td></tr>
    <tr><td><code>f.readline()</code></td><td>next line, <code>""</code> at end of file</td><td>O(line)</td></tr>
    <tr><td><code>f.readlines()</code> / <code>list(f)</code></td><td>list of all lines</td><td>O(file)</td></tr>
    <tr><td><code>for line in f</code></td><td>one line per iteration</td><td>O(line)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p><code>f.read()</code>, <code>f.readlines()</code> and <code>list(f)</code> all load everything. Use them only on files you know are small; for logs and data dumps, iterate. Binary files without lines: read fixed-size chunks with <code>f.read(1 &lt;&lt; 20)</code> in a loop.</p></div>

  <h2 id="pfl-with"><span class="num">07</span>with: Closing Files Reliably</h2>
  <p>An exception raised mid-loop skips any <code>f.close()</code> at the bottom of the code, leaking the OS file handle and possibly losing buffered writes. <code>with open(…) as f:</code> is the standard shorthand for "open, run the block, close in a <code>finally</code>". The file object is a <strong>context manager</strong> (<a class="xref" data-note="py_context">Context Managers</a> shows how to write your own).</p>
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
  <p>Without <code>with</code>, the file stayed open after the error; repeat that in a long-running service and it eventually fails with "Too many open files". With <code>with</code>, it was closed even though the block ended in an exception. Several files can share one statement: <code>with open(a) as src, open(b, "w") as dst:</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>with EXPR as name: BLOCK</code> calls <code>EXPR.__enter__()</code>, binds the result to <code>name</code>, runs <code>BLOCK</code>, then always calls <code>__exit__</code>, which for files closes them. Equivalent to <code>f = open(…); try: BLOCK finally: f.close()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Returning a lazy generator over <code>f</code> from inside a <code>with</code> block: the file is closed when the function returns, and the caller's loop fails with "I/O operation on closed file". Yield from inside the <code>with</code> instead (see <a class="xref" data-note="py_iterators">Iterators</a>).</p></div>

  <h2 id="pfl-csv"><span class="num">08</span>CSV and the csv Module</h2>
  <p><strong>CSV</strong> stores a table as text: a header line, then one line per row, values separated by commas. A value containing a comma, quote or newline is wrapped in double quotes, and inner quotes are doubled (<code>""</code>). The <code>csv</code> module implements these rules; <code>str.split</code> does not.</p>
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
  <p>The naive split gave 8 pieces for 7 columns, cutting the note in two and shifting every later column. <code>csv.reader</code> returned 7 fields; <code>csv.DictReader</code> keys each row by the header. Every value is a <code>str</code> and an empty cell is <code>''</code>: CSV has no types, so converting and validating is your job (see <a class="xref" data-note="py_exceptions">Exceptions</a> for a per-row validator).</p>
  <h3>Writing CSV</h3>
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
  <p>The writer quoted only values that needed it and doubled inner quotes; reading back restored the exact text (but <code>line</code> came back as the string <code>'10'</code>). Open CSV files with <code>newline=""</code>: the csv module handles line endings itself, and without it Windows gets a blank line after every row.</p>
  <h3>A complete CSV reader with per-row validation</h3>
  <p>Combining a path, <code>with</code>, UTF-8, <code>newline=""</code>, the lazy <code>DictReader</code>, file line numbers (<code>start=2</code>, since line 1 is the header) and the <code>BadRowError</code> classes from <a class="xref" data-note="py_exceptions">Exceptions</a>; if more than half the rows are bad, the file itself is suspect:</p>
  <div class="fx" data-lang="py">"""chaistall/storage.py: read the day's CSV; skip bad rows but remember why."""
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
  <div class="callout def"><span class="label">Definition</span><p><code>csv.reader(f)</code> yields each row as a list of strings; <code>csv.DictReader(f)</code> yields dicts keyed by the header; <code>csv.writer</code> / <code>csv.DictWriter</code> write rows, quoting as needed. Options: <code>delimiter=";"</code> or <code>"\\t"</code>, <code>quotechar</code>, <code>quoting=csv.QUOTE_ALL</code>. CSV has no types, no nesting and no standard for missing values.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>line.split(",")</code> and <code>",".join(values)</code> are not CSV. And <code>pd.read_csv</code> <em>guesses</em> types: one "two" in a column keeps the whole column as text (section 12 shows it).</p></div>

  <h2 id="pfl-json"><span class="num">09</span>JSON</h2>
  <p><strong>JSON</strong> holds nested data (objects <code>{"key": value}</code>, arrays, strings, numbers, <code>true/false</code>, <code>null</code>), is readable by every language and by humans, and is the format of web APIs. The <code>json</code> module converts both ways. Memory aid: functions with an <strong>s</strong> work on <strong>s</strong>trings (<code>dumps</code>, <code>loads</code>); without it, on files (<code>dump</code>, <code>load</code>).</p>
  <div class="fx" data-lang="py">"""chaistall/report.py: summarise good orders; write the JSON summary and the Parquet archive."""
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
  <p>JSON has no date type, so <code>dumps</code> refused it; <code>default=str</code> stores <code>str(obj)</code> for unknown types. The date comes back as a <code>str</code>, so <code>back == summary</code> is <code>False</code>: JSON is a translation, not a copy.</p>
  <h3>What JSON changes or cannot store</h3>
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
    <tr><td>tuple <code>("Asha", 2)</code></td><td>array</td><td><strong>list</strong></td><td>convert after loading</td></tr>
    <tr><td>int key <code>{8: …}</code></td><td>string key <code>"8"</code></td><td><strong>str</strong> key</td><td>convert keys after loading</td></tr>
    <tr><td>None / True</td><td>null / true</td><td>None / True</td><td>—</td></tr>
    <tr><td>"₹40"</td><td><code>"\\u20b940"</code></td><td>"₹40"</td><td><code>ensure_ascii=False</code> to keep ₹ readable</td></tr>
    <tr><td>float("nan")</td><td><code>NaN</code> (not valid JSON!)</td><td>nan in Python only</td><td><code>allow_nan=False</code>; write null</td></tr>
    <tr><td>set, date, Decimal</td><td>— TypeError</td><td>—</td><td><code>default=</code> function, or convert first</td></tr>
  </table>
  <p>Python writes <code>NaN</code> and reads it back, but the JSON standard has no NaN, so a JavaScript client or strict parser rejects the whole document; <code>allow_nan=False</code> makes that an error at write time. For full control over unknown types pass a function as <code>default</code>:</p>
  <div class="fx" data-lang="py">import json
from datetime import date, datetime

def to_json(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"cannot serialise {type(obj).__name__}")

print(json.dumps({"day": date(2026, 10, 19), "tags": {"b", "a"}}, default=to_json))</div>
  <div class="fx" data-lang="text">{"day": "2026-10-19", "tags": ["a", "b"]}</div>
  <div class="callout def"><span class="label">Definition</span><p><code>json.dump(obj, f)</code> / <code>json.dumps(obj)</code> serialise dict, list, tuple, str, int, float, bool and None; <code>json.load(f)</code> / <code>json.loads(s)</code> parse. Options: <code>indent=2</code>, <code>ensure_ascii=False</code>, <code>default=func</code>, <code>allow_nan=False</code>, <code>sort_keys=True</code>. One JSON document per file; for large record streams use <strong>JSON Lines</strong> (one object per line, read lazily).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Assuming a JSON round trip returns the same object: tuples → lists, int keys → strings, dates → strings, numpy numbers fail. Convert explicitly at the boundary.</p></div>

  <h2 id="pfl-pickle"><span class="num">10</span>pickle</h2>
  <p><strong>pickle</strong> serialises (almost) any Python object to bytes and back exactly: dates, tuples, sets, your own classes, trained models. It is the right tool when the only reader is your own Python code, and a dangerous one otherwise. Files are binary (<code>"wb"</code>, <code>"rb"</code>).</p>
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
  <h3>The class must exist when loading</h3>
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
  <p>A pickle stores the class's <em>name</em> ("Order in module __main__"), not its code. Renaming or moving a class, or upgrading a library whose internals changed, breaks old pickles.</p>
  <h3>Loading a pickle can run any code</h3>
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
  <p>A pickle can say "to rebuild me, call this function with these arguments", and <code>__reduce__</code> lets the object pick <em>any</em> function, here <code>os.system</code>. Loading 80 bytes ran a shell command.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>pickle.dump(obj, f)</code> / <code>pickle.load(f)</code> (binary files) and <code>dumps</code> / <code>loads</code> (bytes) record how to rebuild an object; loading imports the named classes and calls the recorded functions. Lambdas, open files, sockets and locks cannot be pickled. <code>joblib</code> (scikit-learn models) and <code>torch.save</code> use pickle inside.</p></div>
  <div class="callout trap"><span class="label">Trap: security</span><p>Never unpickle data from an untrusted source (downloads, uploads, emails), and do not use pickle for exchange or long-term storage. Use JSON or Parquet for data and safe formats (safetensors, ONNX) for model weights.</p></div>

  <h2 id="pfl-yaml"><span class="num">11</span>YAML for Configuration</h2>
  <p>Settings that humans edit (thresholds, menus, hyper-parameters) should not live in code. <strong>YAML</strong> is a text format designed for that: nesting by indentation, <code>key: value</code>, lists with <code>-</code> or <code>[…]</code>, and <code># comments</code> (JSON has none). It is the usual format for CI pipelines, Docker Compose, Kubernetes and ML training configs. It needs <code>pip install pyyaml</code>, imported as <code>yaml</code>. A settings file:</p>
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
  <p>The menu is a dict, the threshold a float, the days a list. Two surprises: <code>NO</code> became <code>False</code> (PyYAML follows YAML 1.1, where yes/no/on/off are booleans: the "Norway problem"), and <code>1.10</code> became the float <code>1.1</code>. Quoting fixes both. YAML tags can construct arbitrary Python objects, the same danger as pickle; <code>safe_load</code> refuses them.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>yaml.safe_load(text_or_file)</code> parses YAML into dict, list, str, int, float, bool, None and dates; <code>yaml.safe_dump(obj)</code> writes it. "Safe" means only plain types are built. <code>yaml.load</code> with an unsafe loader can build any object. Alternatives for config: TOML (<code>tomllib</code> in the standard library, read-only) and environment variables.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Unquoted <code>NO</code>, <code>yes</code>, <code>off</code> become booleans and <code>1.10</code> becomes 1.1; quote codes and versions. Always <code>safe_load</code>. YAML is for small human-edited files, not data.</p></div>

  <h2 id="pfl-parquet"><span class="num">12</span>Parquet: Columnar Files</h2>
  <p>For large tables CSV is slow to parse, loses types and forces reading every byte even when you need one column. <strong>Parquet</strong> is a binary format that stores a table <em>column by column</em>; each column records its type (int64, string, date …) and is compressed, and per-chunk min/max statistics let readers skip rows. A reader fetches only the columns it needs. In Python it is used through pandas (or polars, Spark, DuckDB) with the <strong>pyarrow</strong> engine.</p>
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
  <h3>Parquet needs an engine</h3>
  <p>With pandas installed but no pyarrow, writing Parquet fails:</p>
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
  <p>The examples below were run in a virtual environment with <code>pip install pandas pyarrow</code>; see <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a> for venvs and pinning.</p>
  <h3>Writing, reading, selecting columns and filtering</h3>
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
  <p>Types survive the round trip (<code>int64</code>, no re-parsing). <code>columns=</code> reads only two columns and <code>filters=</code> pushes the row filter into the reader. The last line shows the CSV problem in pandas: one "two" keeps the whole qty column as text.</p>
  <h3>Size and speed at a million rows</h3>
  <div class="fx" data-lang="py">import os, time
import numpy as np, pandas as pd

rng = np.random.default_rng(0)
n = 1_000_000
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
  <p>About 4× smaller. Reading everything was only somewhat faster here (timings vary by machine), but reading one column took under a hundredth of a second because the other columns were never touched: the typical analytics query.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Parquet</strong> is a columnar, typed, compressed binary table format. In pandas: <code>df.to_parquet(path, index=False)</code> and <code>pd.read_parquet(path, columns=[…], filters=[(col, op, value)])</code>; needs <code>pyarrow</code> (or <code>fastparquet</code>). It is the standard file format for data lakes, Spark and ML datasets; a directory of Parquet files partitioned by a column (e.g. <code>date=2026-10-19/</code>) is a common dataset layout.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Parquet is not for tiny files or humans: you cannot open it in a text editor, and for six rows it is bigger than CSV (section 13). Files are immutable: appending a row means writing a new file (e.g. one per day).</p></div>

  <h2 id="pfl-choose"><span class="num">13</span>Choosing a File Format</h2>
  <p>The same six orders (with a <code>date</code> column) saved in every format and loaded back, run in the virtual environment:</p>
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
  <p>CSV returns only strings; JSON keeps numbers but not dates; YAML and pickle keep both; Parquet keeps everything but has a fixed schema/statistics overhead (2,747 bytes for six rows) that pays off only on large tables.</p>
  <table class="tbl"><caption>Format comparison</caption>
    <tr><th>format</th><th>human-readable?</th><th>keeps types?</th><th>fast &amp; small at scale?</th><th>safe to load from strangers?</th><th>best for</th></tr>
    <tr><td>CSV</td><td>yes (and Excel)</td><td>no, all text</td><td>no</td><td>yes</td><td>small flat tables, exchange with people and spreadsheets</td></tr>
    <tr><td>JSON</td><td>yes</td><td>partly (no dates, sets, tuples)</td><td>no</td><td>yes</td><td>nested data, APIs, summaries</td></tr>
    <tr><td>YAML</td><td>yes, with comments</td><td>partly (has dates; NO/1.10 traps)</td><td>no</td><td>with <code>safe_load</code> only</td><td>human-edited configuration</td></tr>
    <tr><td>pickle</td><td>no</td><td>exactly, any object</td><td>fair</td><td><strong>no</strong></td><td>short-lived caches between your own Python programs</td></tr>
    <tr><td>Parquet</td><td>no</td><td>yes (typed columns)</td><td>yes (columnar, compressed)</td><td>yes</td><td>big tables, archives, analytics</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>Choose a format by its <strong>reader</strong> (human, another language, your own Python), its <strong>shape</strong> (flat table, nested, object), its <strong>size</strong>, and its <strong>trust boundary</strong> (does it come from someone you do not control?).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using one format for everything: pickles for exchange (unsafe, version-fragile), CSV for a year of data (slow, untyped), JSON for configs that need comments.</p></div>

  <h2 id="pfl-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: "w" on the wrong file</span><p>Empties it before you read a byte. Read with "r", write to a new name; use "x" for files that must never be overwritten.</p></div>
  <div class="callout trap"><span class="label">Trap: no encoding</span><p>Works on Linux, mojibake or UnicodeDecodeError on Windows. Always <code>encoding="utf-8"</code> ("utf-8-sig" for Excel CSVs).</p></div>
  <div class="callout trap"><span class="label">Trap: no with</span><p>Leaked handles on errors; buffered writes never reach disk.</p></div>
  <div class="callout trap"><span class="label">Trap: read() on big files</span><p>Memory grows with the file; iterate over lines instead.</p></div>
  <div class="callout trap"><span class="label">Trap: split(",") for CSV</span><p>Breaks on quoted commas and shifts every later column. Use the csv module; open with <code>newline=""</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting CSV types</span><p>Everything is a string; pandas guesses, and one bad cell turns a column into text. Parse and validate explicitly, or pass <code>dtype=</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: JSON round-trip assumptions</span><p>Tuples → lists, int keys → strings, dates need <code>default=</code>, NaN is not valid JSON.</p></div>
  <div class="callout trap"><span class="label">Trap: loading untrusted pickles</span><p>Runs arbitrary code. Pickle only for your own short-lived caches.</p></div>
  <div class="callout trap"><span class="label">Trap: yaml.load and unquoted NO / 1.10</span><p>Use <code>safe_load</code>; quote codes and versions.</p></div>
  <div class="callout trap"><span class="label">Trap: half-written output files</span><p>A crash mid-write leaves a truncated file that the next job reads as valid. Write to a temporary file in the same folder, then <code>os.replace(tmp, path)</code>, which is atomic.</p></div>
  <div class="callout trap"><span class="label">Trap: relative paths</span><p>They depend on the folder you start in. Take paths as arguments or build from <code>Path(__file__).parent</code>.</p></div>

  <h2 id="pfl-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Paths and open()</h3>
  <ul>
    <li><code>Path("data") / "x.csv"</code>; <code>.name .stem .suffix .parent</code>; <code>.glob("*.csv")</code>, <code>.rglob</code>; <code>.mkdir(parents=True, exist_ok=True)</code>; <code>.read_text(encoding=…)</code>.</li>
    <li><code>open(path, mode, encoding="utf-8", newline=…)</code>. Modes: <code>r</code> read (must exist) · <code>w</code> truncate/create · <code>a</code> append · <code>x</code> create, fail if exists · <code>b</code> binary · <code>+</code> read/write.</li>
    <li>Writes are buffered: data reaches the file on <code>flush()</code>/<code>close()</code>; <code>os.fsync</code> forces it to disk.</li>
  </ul>
  <h3>Text, bytes, encodings</h3>
  <ul>
    <li>Text mode: <code>str</code>, encodes/decodes with <code>encoding</code>. Binary mode: raw <code>bytes</code>.</li>
    <li><code>"₹40"</code>: 3 characters, 5 bytes in UTF-8 (₹ = <code>e2 82 b9</code>).</li>
    <li>Wrong decoder → mojibake ("â‚¹") or <code>UnicodeDecodeError</code>. Excel BOM → <code>\\ufeff</code> in first header; use <code>"utf-8-sig"</code>.</li>
    <li>Default encoding is platform-dependent (cp1252 on many Windows setups) → always pass it.</li>
  </ul>
  <h3>Reading and closing</h3>
  <table class="tbl">
    <tr><th>call</th><th>memory</th><th>note</th></tr>
    <tr><td><code>for line in f</code></td><td>O(line)</td><td>lazy, single pass, keeps <code>\\n</code></td></tr>
    <tr><td><code>f.readline()</code></td><td>O(line)</td><td><code>""</code> at EOF</td></tr>
    <tr><td><code>f.read()</code>, <code>readlines()</code>, <code>list(f)</code></td><td>O(file)</td><td>small files only</td></tr>
    <tr><td><code>f.read(n)</code></td><td>O(n)</td><td>chunks for binary files</td></tr>
  </table>
  <p><code>with open(…) as f:</code> = open + <code>try/finally: f.close()</code>; closes even on exceptions.</p>
  <h3>CSV</h3>
  <ul>
    <li><code>csv.reader</code> → lists, <code>csv.DictReader</code> → dicts, all <code>str</code>; empty cell = <code>''</code>.</li>
    <li><code>csv.DictWriter(f, fieldnames=…)</code>, <code>writeheader()</code>, <code>writerows()</code>; quotes values with <code>,</code> <code>"</code> or newline, doubles inner quotes.</li>
    <li>Always <code>newline=""</code> and an explicit encoding.</li>
  </ul>
  <h3>JSON</h3>
  <ul>
    <li><code>dump/load</code> = file, <code>dumps/loads</code> = string. Options: <code>indent</code>, <code>ensure_ascii=False</code>, <code>default=</code>, <code>allow_nan=False</code>, <code>sort_keys</code>.</li>
    <li>tuple → list; int key → str; set/date/Decimal → TypeError unless <code>default=</code>; NaN written as invalid <code>NaN</code>.</li>
  </ul>
  <h3>pickle and YAML</h3>
  <ul>
    <li>pickle: <code>"wb"/"rb"</code>; exact for any object; needs the same classes on load; <strong>loading can execute code</strong>; no lambdas/files/locks.</li>
    <li>YAML: <code>yaml.safe_load</code> / <code>safe_dump</code>; comments allowed; NO/yes/off → bool, 1.10 → 1.1 unless quoted.</li>
  </ul>
  <h3>Parquet and format choice</h3>
  <ul>
    <li>Columnar, typed, compressed, column pruning + row-group statistics; <code>df.to_parquet(p, index=False)</code>, <code>pd.read_parquet(p, columns=[…], filters=[…])</code>; needs pyarrow.</li>
    <li>1M rows: CSV 24.8 MB vs Parquet 5.7 MB; one column ≈ 0.008 s.</li>
  </ul>
  <table class="tbl">
    <tr><th>need</th><th>format</th></tr>
    <tr><td>table for people / Excel</td><td>CSV</td></tr>
    <tr><td>nested data, API, other languages</td><td>JSON (JSON Lines for streams)</td></tr>
    <tr><td>human-edited config</td><td>YAML / TOML</td></tr>
    <tr><td>big table for analytics / ML</td><td>Parquet</td></tr>
    <tr><td>exact Python object, own use only</td><td>pickle</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li><code>"w"</code> truncates immediately.</li>
    <li>No <code>encoding=</code> → platform-dependent bugs.</li>
    <li><code>split(",")</code> is not CSV; CSV has no types.</li>
    <li>A file iterator is exhausted after one loop.</li>
    <li>Returning a generator from inside <code>with</code> → "I/O operation on closed file".</li>
    <li>Never unpickle untrusted data; never <code>yaml.load</code> untrusted YAML.</li>
    <li>Atomic writes: temp file + <code>os.replace</code>.</li>
  </ul>

  <h2 id="pfl-qa"><span class="num">15</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between modes "r", "w", "a" and "x"?</summary><div class="qa-body">"r" reads and requires the file to exist. "w" creates the file or <em>empties</em> an existing one, then writes. "a" creates or appends at the end. "x" creates only and raises <code>FileExistsError</code> if it exists. Add "b" for binary and "+" for read/write.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>with open(...)</code>? What happens if you never close a file?</summary><div class="qa-body"><code>with</code> closes the file on every path, including exceptions; it is shorthand for try/finally. An unclosed file leaks an OS handle (eventually "Too many open files") and may lose buffered writes. CPython often closes it when the object is garbage-collected, with a <code>ResourceWarning</code>, but that is an implementation detail and not guaranteed on PyPy or at interpreter exit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>read()</code>, <code>readline()</code>, <code>readlines()</code> and iterating over a file?</summary><div class="qa-body"><code>read()</code> returns the whole file as one string; <code>readline()</code> returns the next line (<code>""</code> at end of file); <code>readlines()</code> returns a list of all lines. Iterating (<code>for line in f</code>) yields one line at a time with constant memory. Only iteration and <code>readline()</code> are safe on files larger than memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you process a 20 GB log file in Python?</summary><div class="qa-body">Open it with an explicit encoding and iterate line by line, keeping only running aggregates: memory stays constant (0.022 MB for a 36 MB file in the measurement above, versus 71.8 MB for <code>read()</code>). For a CSV of that size use <code>pd.read_csv(..., chunksize=…, usecols=[…], dtype=…)</code> or convert it once to Parquet; for parallelism split by byte ranges or use multiprocessing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between text mode and binary mode?</summary><div class="qa-body">Text mode returns and accepts <code>str</code>, encoding/decoding with the file's encoding and translating newlines. Binary mode returns and accepts <code>bytes</code> with no conversion. Use binary for pickle, Parquet, images, and when you need exact bytes (hashing, network transfer).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>print(len("₹40"), len("₹40".encode("utf-8")))</code></summary><div class="qa-body"><code>3 5</code>. The string has three characters; in UTF-8 "₹" takes three bytes and each digit one. File sizes are in bytes, so they are not equal to <code>len()</code> of the text.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is mojibake, and why should you always pass <code>encoding=</code>?</summary><div class="qa-body">Mojibake is garbage text produced by decoding bytes with the wrong encoding, e.g. UTF-8 "₹" read as cp1252 becomes "â‚¹", with no error raised. Without <code>encoding=</code>, Python uses the platform default (UTF-8 on Linux/macOS, often cp1252 on Windows), so the same code behaves differently across machines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A CSV exported from Excel gives <code>KeyError: 'order_id'</code> although the header clearly says order_id. Why?</summary><div class="qa-body">Excel's "CSV UTF-8" starts with a byte order mark. Decoded as plain "utf-8" it becomes the character <code>\\ufeff</code> at the start of the first column name, so the key is really <code>'\\ufefforder_id'</code>. Open with <code>encoding="utf-8-sig"</code>, which strips it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not parse CSV with <code>line.split(",")</code>, and why open CSV files with <code>newline=""</code>?</summary><div class="qa-body">Values may contain commas, quotes or newlines, which CSV protects with quotes; <code>split</code> cuts <code>"extra chutney, no onion"</code> into two fields and shifts every later column. The csv module implements the quoting rules. <code>newline=""</code> lets the csv module handle line endings itself, so quoted newlines are preserved and Windows does not get blank rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>json.dump</code> and <code>json.dumps</code>, and what changes in a JSON round trip?</summary><div class="qa-body"><code>dump</code>/<code>load</code> work with file objects; <code>dumps</code>/<code>loads</code> with strings. In a round trip tuples become lists, non-string keys become strings, and <code>NaN</code> is written as a non-standard token; sets, dates, <code>Decimal</code> and numpy scalars raise <code>TypeError</code> unless you convert them or pass <code>default=</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you serialise a <code>datetime</code> or a custom object to JSON?</summary><div class="qa-body">Pass a function as <code>default</code>, called for any object json cannot handle:<div class="fx" data-lang="py">def to_json(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"cannot serialise {type(obj).__name__}")

json.dumps({"day": date(2026, 10, 19), "tags": {"b", "a"}}, default=to_json)
# '{"day": "2026-10-19", "tags": ["a", "b"]}'</div>Alternatively subclass <code>json.JSONEncoder</code> and override <code>default</code>, or convert to dicts first (<code>dataclasses.asdict</code>, pydantic's <code>model_dump_json</code>). Loading needs explicit parsing back (<code>date.fromisoformat</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pickle vs JSON: when would you use each?</summary><div class="qa-body">JSON is text, language-neutral, safe to load and human-readable, but supports only basic types. pickle stores almost any Python object exactly, but is Python-only, tied to class names and library versions, and unsafe to load from untrusted sources. Use JSON for exchange and storage; pickle only for short-lived caches between your own Python processes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is it safe to load a pickled model someone sent you?</summary><div class="qa-body">No. Unpickling calls whatever function the pickle names via <code>__reduce__</code>; an 80-byte payload ran a shell command on load in the example above. The same applies to <code>joblib.load</code> and <code>torch.load</code> with full unpickling. Load only trusted pickles; share weights in safe formats (safetensors, ONNX) and data as Parquet/JSON.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why <code>yaml.safe_load</code>, and what are YAML's type surprises?</summary><div class="qa-body"><code>safe_load</code> constructs only plain types; unsafe loaders can construct arbitrary Python objects from tags like <code>!!python/object/apply:os.system</code>. Type surprises in YAML 1.1 (PyYAML): <code>NO</code>, <code>yes</code>, <code>on</code>, <code>off</code> become booleans and <code>1.10</code> becomes the float 1.1. Quote such values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a columnar format, and why is Parquet preferred over CSV for analytics?</summary><div class="qa-body">A columnar format stores all values of a column together. Analytics queries usually touch a few columns, so a reader can skip the rest (column pruning) and skip row groups using min/max statistics (predicate pushdown). Similar values side by side compress well (24.8 MB CSV → 5.7 MB here), and columns are typed, so no re-parsing and no "one bad cell turns the column into text". CSV remains better for small hand-offs to people.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a large CSV with pandas without running out of memory?</summary><div class="qa-body">Read only needed columns (<code>usecols</code>), give compact dtypes (<code>dtype={"qty": "int32"}</code>, <code>category</code> for repeated strings), and process in chunks:<div class="fx" data-lang="py">total = 0
for chunk in pd.read_csv("big.csv", usecols=["qty"], dtype={"qty": "int32"}, chunksize=100_000):
    total += chunk["qty"].sum()</div>Better still, convert to Parquet once, or use a lazy engine (polars, DuckDB) that streams the file.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a file so readers never see a half-written version?</summary><div class="qa-body">Write to a temporary file in the same directory, flush and <code>os.fsync</code> it, then <code>os.replace(tmp, path)</code>. The rename is atomic on the same file system, so readers see either the old file or the complete new one:<div class="fx" data-lang="py">fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
with os.fdopen(fd, "w", encoding="utf-8") as f:
    f.write(text); f.flush(); os.fsync(f.fileno())
os.replace(tmp, path)</div></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does iterating over a file a second time give nothing?</summary><div class="qa-body">A file object is its own iterator and keeps a current position; after the first loop it is at end of file, so a second loop (or <code>list(f)</code>) yields nothing. Reopen the file or call <code>f.seek(0)</code>. Related trap: returning a generator over <code>f</code> from inside a <code>with</code> block fails with "I/O operation on closed file", because the file closes when the function returns.</div></details>
</main>
`
});
