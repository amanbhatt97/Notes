// notes/python/py_files.js — Files & Data Formats
Object.assign(TOPIC_CONTENT, {
  "py_files": `<main>
<h1>Files &amp; Data Formats</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Files &amp; Data Formats</span></div>
  <p class="lead">Everything a program keeps in variables disappears the moment it ends; files are how data gets into a program from outside and how results survive until tomorrow or reach another program. Working with files has two layers. The lower layer is about getting bytes in and out safely: naming the file, choosing the right mode so you do not empty it by accident, decoding the bytes with the right encoding, reading big files without running out of memory, and always closing them. The upper layer is about <em>formats</em>, the agreements about what the bytes mean: CSV for spreadsheets, JSON for APIs, YAML for settings, pickle for Python-only caches and Parquet for large tables. Our running example is one day of orders from a chai stall, a 351-byte CSV file with six good rows and three bad ones. We will read it, clean it, and save the results in every format, so you can see what each one keeps, loses and costs. Parquet examples were run with pandas 3.1 and pyarrow 26 installed in a virtual environment.</p>

  <h2 id="pfl-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Files &amp; Data Formats</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Getting at files</div>
        <ul>
          <li><code>Path("data") / "x.csv"</code> builds paths safely</li>
          <li>Modes: r (default), w (empties!), a, x, plus b for bytes</li>
          <li>Writes are buffered until flush or close</li>
          <li><code>with open(...)</code> always closes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bytes and text</div>
        <ul>
          <li>Disks hold bytes; text mode encodes and decodes</li>
          <li>Always pass <code>encoding="utf-8"</code> (<code>"utf-8-sig"</code> for Excel)</li>
          <li>Wrong encoding: mojibake or <code>UnicodeDecodeError</code></li>
          <li><code>for line in f</code>: constant memory, one pass</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Text formats</div>
        <ul>
          <li>CSV: tables, all strings; use the csv module, <code>newline=""</code></li>
          <li>JSON: nested data; tuple → list, int key → str, no dates</li>
          <li>YAML: human-edited config; <code>safe_load</code>; NO → False</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Binary formats</div>
        <ul>
          <li>pickle: any Python object, but loading can run code</li>
          <li>Parquet: typed columns, compressed, read only what you need</li>
          <li>Choose by reader, shape, size and trust</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pfl-path"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Files and Paths</span><span class="rm-sub">why files exist and how to name them</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-open"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">open() and File Modes</span><span class="rm-sub">reading, writing, appending, buffering</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-enc"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Text, Bytes and Encodings</span><span class="rm-sub">how characters become bytes and back</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-lazy"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Reading Large Files Line by Line</span><span class="rm-sub">file objects as iterators, memory measured</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-with"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Closing Files with with</span><span class="rm-sub">no leaked files, even after an error</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-csv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">CSV</span><span class="rm-sub">tables as text, quoting, reading and writing</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-json"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">JSON</span><span class="rm-sub">nested data, and what changes on the way</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-pickle"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">pickle</span><span class="rm-sub">exact Python objects, and the security hole</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-yaml"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">YAML for Configuration</span><span class="rm-sub">settings people edit, and its surprises</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-parquet"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Parquet</span><span class="rm-sub">columnar files for big tables</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-choose"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Choosing a File Format</span><span class="rm-sub">the same data in five formats</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">emptied files, closed files, half-written files</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">modes, encodings, formats, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pfl-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on files</span></div></div>
    </div>
  </div>

  <h2 id="pfl-path"><span class="num">01</span>Files and Paths</h2>
  <p>A running program keeps its variables in <strong>memory</strong> (RAM). Memory is fast, but it belongs to one running program and is wiped when that program ends. Two runs of Python share nothing:</p>
  <div class="fx" data-lang="text">$ python3 -c "revenue = 230; print('run 1: revenue =', revenue)"
run 1: revenue = 230
$ python3 -c "print('run 2: revenue =', revenue)"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    print('run 2: revenue =', revenue)
                              ^^^^^^^
NameError: name 'revenue' is not defined. Did you mean: 'reversed'?</div>
  <p>The first run knew that revenue was 230; the second run has never heard of it. If the chai stall's daily total is to be seen tomorrow, by a dashboard, by the accountant's spreadsheet or by another script, it has to be written somewhere that outlives the program. That is what a <strong>file</strong> is: a named sequence of bytes that the operating system keeps on disk. It survives the program, survives a reboot, and can be read by any other program. Keeping data beyond the life of the program that made it is called <strong>persistence</strong>. A file is like a notebook left on the shelf: the person who wrote in it can go home, and someone else can pick it up the next day. A <strong>format</strong>, such as CSV or JSON, is the agreement about how to read what is written in the notebook.</p>
  <p>Most examples on this page read this file, <code>data/orders_2026-10-19.csv</code>. Notice two things: Ben's note contains a comma, so it is wrapped in double quotes, and the last three rows contain bad values (a word for a quantity, a missing price, a negative quantity).</p>
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
  <p>Before you can open a file you have to name it, and the name is a <strong>path</strong>: the list of folders leading to the file, ending with the file's name. A <strong>relative</strong> path such as <code>data/orders_2026-10-19.csv</code> starts from the program's current working folder; an <strong>absolute</strong> path starts from the top of the file system, such as <code>/home/asha/chaistall/data/...</code>. Building paths by joining strings is error-prone: it is easy to forget a separator, and Windows uses <code>\\</code> where Linux and macOS use <code>/</code>. The standard library's <strong>pathlib</strong> solves this by turning a path into an object, <code>Path</code>, that knows how to join itself with <code>/</code> and can tell you its parts. Think of it as the difference between writing an address as one long scribble and filling in a form with separate boxes for street, city and postcode.</p>
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
  <p>The first line shows the problem: gluing two strings produced <code>dataorders_2026-10-19.csv</code>, with no error, just the name of a file that does not exist. With <code>Path</code>, the <code>/</code> operator joined the parts correctly. The next lines take the path apart: <code>.name</code> is the full file name, <code>.stem</code> the name without its extension, <code>.suffix</code> the extension and <code>.parent</code> the folder. <code>.exists()</code> and <code>.stat().st_size</code> asked the operating system about the real file (it is 351 bytes). <code>with_suffix</code> built the name of a matching Parquet file, and <code>removeprefix</code> pulled the date out of the name. <code>glob("orders_*.csv")</code> listed every matching file in the folder, here two days of orders. <code>mkdir(parents=True, exist_ok=True)</code> created the <code>out/archive</code> folder, including <code>out</code> if it was missing, without complaining if it already existed. Finally <code>resolve()</code> turned the relative path into an absolute one.</p>
  <p>One warning about relative paths: they are relative to the folder you were in when you <em>started</em> the program, not the folder the script is stored in. A script that works when run from its own folder can fail when a scheduler starts it from somewhere else. Real tools take paths as command-line arguments (see <a class="xref" data-note="py_io">Input, Output &amp; Command-Line Programs</a>) or build them from <code>Path(__file__).parent</code>, the folder containing the script.</p>

  <h2 id="pfl-open"><span class="num">02</span>open() and File Modes</h2>
  <p>To read or write a file, a program asks the operating system for access with the built-in <strong>open</strong> function. It returns a <strong>file object</strong>, a Python object connected to the file, with methods such as <code>read</code>, <code>write</code> and <code>close</code>. The second argument to <code>open</code> is the <strong>mode</strong>, which declares what you intend to do. The mode matters more than it looks, because one of them destroys data:</p>
  <table class="tbl">
    <tr><th>mode</th><th>meaning</th><th>if the file is missing</th><th>if the file exists</th></tr>
    <tr><td><code>"r"</code> (default)</td><td>read</td><td>FileNotFoundError</td><td>read from the start</td></tr>
    <tr><td><code>"w"</code></td><td>write</td><td>creates it</td><td><strong>empties it first</strong></td></tr>
    <tr><td><code>"a"</code></td><td>append</td><td>creates it</td><td>writes go at the end</td></tr>
    <tr><td><code>"x"</code></td><td>exclusive create</td><td>creates it</td><td>FileExistsError</td></tr>
    <tr><td>add <code>"b"</code></td><td>binary: bytes, no decoding</td><td colspan="2">e.g. <code>"rb"</code>, <code>"wb"</code> (section 03)</td></tr>
    <tr><td>add <code>"+"</code></td><td>read and write</td><td colspan="2">rarely needed, e.g. <code>"r+"</code></td></tr>
  </table>
  <p>Think of the modes as instructions to a clerk handling a register. "r" means "let me read it". "w" means "give me a blank register with this name", and if one already exists, its pages are torn out. "a" means "let me add entries at the end". "x" means "start a new register, but refuse if one with that name already exists". Here is each one used on an import log:</p>
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
    print("r -&gt;", e)</div>
  <div class="fx" data-lang="text">2026-10-19 import started
2026-10-19 6 orders, Rs 230, 3 rejected
---
2026-10-20 import started
---
x -&gt; FileExistsError
r -&gt; [Errno 2] No such file or directory: 'out/no_such_day.csv'</div>
  <p><code>"w"</code> created the log with one line, and <code>"a"</code> added a second line at the end. Then <code>"w"</code> was used again for the next day, and both of yesterday's lines were gone: opening with <code>"w"</code> empties the file immediately, before you write anything. <code>"x"</code> refused to touch the existing log and raised <code>FileExistsError</code>, which makes it the right mode for archives that must never be overwritten. And reading a file that does not exist raised <code>FileNotFoundError</code>. (The <code>with</code> statement used here closes the file at the end of the block; section 05 explains it.)</p>
  <p>There is one more thing to know about writing. When you call <code>f.write</code>, the text does not go to the disk straight away. It goes into a <strong>buffer</strong>, an area of memory that collects writes so they can be sent to the disk in large, efficient chunks, much as a shop collects letters in a sack before taking them to the post office. The buffer is written out when it fills up, when you call <code>f.flush()</code>, or when the file is closed:</p>
  <div class="fx" data-lang="py">from pathlib import Path

f = open("out/unsaved.txt", "w", encoding="utf-8")
f.write("6 orders, Rs 230\\n")
print("size on disk before close:", Path("out/unsaved.txt").stat().st_size)
f.close()
print("size on disk after close: ", Path("out/unsaved.txt").stat().st_size)</div>
  <div class="fx" data-lang="text">size on disk before close: 0
size on disk after close:  17</div>
  <p>After <code>write</code>, the file on disk was still 0 bytes long; the 17 characters were sitting in the buffer. Only <code>close()</code> pushed them to the file. This is why a file that is never closed can lose its last writes, for example if the program crashes. (Even after <code>close</code>, the operating system may keep the data in its own cache for a moment; <code>os.fsync</code> forces it onto the physical disk, which matters for files that must survive a power cut.)</p>

  <h2 id="pfl-enc"><span class="num">03</span>Text, Bytes and Encodings</h2>
  <p>A disk does not store letters. It stores <strong>bytes</strong>, numbers from 0 to 255. Python strings, on the other hand, hold characters, including ones like "₹" and "é". Something has to translate between the two, and that translation is called an <strong>encoding</strong>: a rule that says which bytes represent which character. Turning characters into bytes is <em>encoding</em>, and turning bytes back into characters is <em>decoding</em>. Think of it like Morse code: the sender and the receiver must use the same code table, or the message comes out as nonsense.</p>
  <p>When you open a file in <strong>text mode</strong> (<code>"r"</code>, <code>"w"</code>), Python does this translation for you, using the encoding you pass with <code>encoding=</code>, so you read and write <code>str</code>. In <strong>binary mode</strong> (<code>"rb"</code>, <code>"wb"</code>) there is no translation at all and you read and write raw <code>bytes</code>. Text formats such as CSV, JSON and YAML are opened in text mode; pickle, Parquet and images are binary. Here a receipt line is written as text and read back as bytes:</p>
  <div class="fx" data-lang="py">line = "Asha: 2 masala chai ₹40\\n"
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
  <p>The line has 24 characters, but the file holds 26 bytes. The encoding used was <strong>UTF-8</strong>, today's standard for files and the web, which can represent every character in every language. It uses one byte for each plain English letter, digit and symbol, and more bytes for other characters: "₹" took three, <code>\\xe2\\x82\\xb9</code>. Decoding those three bytes with UTF-8 gave "₹40" back. So the same file has two views: a <code>str</code> in text mode and <code>bytes</code> in binary mode, and <code>len()</code> of the text is not the size of the file. (More on how UTF-8 works in <a class="xref" data-note="py_strings">Strings</a>.)</p>
  <p>What happens if the reader uses a different rule from the writer? Older encodings such as <code>cp1252</code> (common on Windows) and <code>ascii</code> only know a few hundred characters or fewer. Here the same UTF-8 receipt is decoded four ways:</p>
  <div class="fx" data-lang="py">import locale
from pathlib import Path

p = Path("out/receipt.txt")                          # written as UTF-8 above
print("default here:", locale.getpreferredencoding(False))
print("utf-8 :", p.read_text(encoding="utf-8"), end="")
print("cp1252:", p.read_text(encoding="cp1252"), end="")       # wrong rule: mojibake
try:
    p.read_text(encoding="ascii")
except UnicodeDecodeError as e:
    print("ascii : UnicodeDecodeError:", e)
print("ascii+replace:", p.read_text(encoding="ascii", errors="replace"), end="")</div>
  <div class="fx" data-lang="text">default here: UTF-8
utf-8 : Asha: 2 masala chai ₹40
cp1252: Asha: 2 masala chai â‚¹40
ascii : UnicodeDecodeError: 'ascii' codec can't decode byte 0xe2 in position 20: ordinal not in range(128)
ascii+replace: Asha: 2 masala chai ���40</div>
  <p>With UTF-8, the line reads correctly. With cp1252, there is no error at all, but each of the three bytes of "₹" was decoded as a separate character, giving "â‚¹". This garbage is called <strong>mojibake</strong> (Japanese for "character transformation"), and it is dangerous precisely because nothing fails; the wrong text flows on into your reports. ASCII only knows bytes up to 127, so it raised a <code>UnicodeDecodeError</code> at byte <code>0xe2</code>. Passing <code>errors="replace"</code> hides the error by substituting "�", but the data is lost.</p>
  <p>The first line of output explains why this bites people. Without an <code>encoding=</code> argument, Python uses the operating system's default, which is UTF-8 on Linux and macOS but often cp1252 on Windows. Code that never mentions an encoding works on your laptop and produces mojibake or crashes on a colleague's machine. The rule is simple: in text mode, always write <code>encoding="utf-8"</code>. (Python 3.15 makes UTF-8 the default everywhere; today you can opt in with <code>python -X utf8</code>.)</p>
  <p>There is one special case you will meet with spreadsheets. When Excel saves "CSV UTF-8", it puts three invisible bytes at the very start of the file, called a <strong>BOM</strong> (byte order mark), to announce that the file is UTF-8:</p>
  <div class="fx" data-lang="py">import csv
from pathlib import Path

Path("out/from_excel.csv").write_text("order_id,customer\\n1,Asha\\n", encoding="utf-8-sig")
print(Path("out/from_excel.csv").read_bytes()[:12])
with open("out/from_excel.csv", newline="", encoding="utf-8") as f:
    print(next(csv.DictReader(f)))
with open("out/from_excel.csv", newline="", encoding="utf-8-sig") as f:
    print(next(csv.DictReader(f)))</div>
  <div class="fx" data-lang="text">b'\\xef\\xbb\\xbforder_id,'
{'\\ufefforder_id': '1', 'customer': 'Asha'}
{'order_id': '1', 'customer': 'Asha'}</div>
  <p>The raw bytes begin with <code>\\xef\\xbb\\xbf</code>, the BOM. Read with plain <code>"utf-8"</code>, the BOM becomes an invisible character <code>\\ufeff</code> glued to the first column name, so the key is <code>'\\ufefforder_id'</code> and <code>row["order_id"]</code> would raise a <code>KeyError</code> even though the header clearly says "order_id". The encoding <code>"utf-8-sig"</code> strips a BOM if there is one, and the key comes out clean. Use it for any CSV that may have come from Excel.</p>

  <h2 id="pfl-lazy"><span class="num">04</span>Reading Large Files Line by Line</h2>
  <p>The simplest way to read a file is <code>f.read()</code>, which returns the whole file as one string. That is fine for our 351-byte sheet, but a year of logs or a full data export can be many gigabytes, bigger than the computer's memory. Reading it all at once then fails, or slows the machine to a crawl. You would not photocopy an entire encyclopedia to look something up on each page; you would turn the pages one at a time.</p>
  <p>Python's file objects support exactly this. A text file object is an <strong>iterator</strong> over its lines: each time you ask it for the next item, it reads just enough of the file to return one more line. A <code>for</code> loop asks for the next item automatically, so <code>for line in f</code> holds only one line (plus a small buffer) in memory at a time. (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> explains the iterator protocol in detail.)</p>
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
  <p>The first line confirms that the file object is its own iterator. <code>next(f)</code> read exactly one line, the header, including its trailing <code>"\\n"</code>; every line keeps its newline, which is why the loop strips it before printing. The <code>for</code> loop then continued from line 2, because the file object remembers its position. And after the loop, <code>list(f)</code> was empty: a file iterator goes through the file once, and when it reaches the end it is used up. To read again, open the file again or call <code>f.seek(0)</code> to go back to the start.</p>
  <p>How much difference does this make? The program below writes a million order lines, about 36 MB, then measures the peak memory used by <code>read()</code> and by a loop, using the standard <code>tracemalloc</code> module, which tracks memory allocated by Python:</p>
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
  <p><code>read()</code> peaked at about 72 MB, twice the file size, because the bytes and the decoded string both existed for a moment. The loop peaked at about 0.02 MB, and it would stay at that level for a 50 GB file, because it never holds more than one line. Both counted the same 1,000,001 lines.</p>
  <table class="tbl">
    <tr><th>call</th><th>returns</th><th>memory used</th></tr>
    <tr><td><code>f.read()</code></td><td>the whole file as one string</td><td>grows with the file</td></tr>
    <tr><td><code>f.read(n)</code></td><td>the next n characters (bytes in binary mode)</td><td>n</td></tr>
    <tr><td><code>f.readline()</code></td><td>the next line, <code>""</code> at the end of the file</td><td>one line</td></tr>
    <tr><td><code>f.readlines()</code> / <code>list(f)</code></td><td>a list of all lines</td><td>grows with the file</td></tr>
    <tr><td><code>for line in f</code></td><td>one line per loop</td><td>one line</td></tr>
  </table>
  <p>So use <code>read()</code>, <code>readlines()</code> and <code>list(f)</code> only on files you know are small, and iterate over everything else. Binary files have no lines; to process a large one, read fixed-size chunks with <code>f.read(1_048_576)</code> in a loop until it returns empty bytes.</p>

  <h2 id="pfl-with"><span class="num">05</span>Closing Files with with</h2>
  <p>Every file you open uses an operating-system resource called a <strong>file handle</strong>, and there is a limit to how many a program may hold. Closing a file returns the handle and, as section 02 showed, writes out the buffer. The obvious approach is to call <code>f.close()</code> at the end, but an exception in the middle skips that line, as the first half of this program shows:</p>
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
  <p>In the first half, the loop raised a <code>ValueError</code> at Esha's row, the error was handled, and the file was still open afterwards (<code>closed</code> is <code>False</code>): the handle leaked. In a long-running service this happens on every bad file, until the program fails with "Too many open files". The second half uses a <strong>with</strong> statement instead. <code>with open(...) as g:</code> opens the file, runs the indented block, and closes the file when the block is left for <em>any</em> reason, including an exception. That is why <code>g.closed</code> is <code>True</code> even though the block ended with an error.</p>
  <p>This works because a file object is a <strong>context manager</strong>: an object that knows how to set something up at the start of a <code>with</code> block and tidy it up at the end. It is like a hotel room door that locks itself when it closes behind you; you do not have to remember. Writing <code>with open(path) as f:</code> is equivalent to opening the file and closing it in a <code>finally</code> block, just shorter and impossible to forget. Several files can share one statement: <code>with open(src) as fin, open(dst, "w") as fout:</code>. (<a class="xref" data-note="py_context">Context Managers</a> shows how to write your own.) From here on, every example opens files with <code>with</code>.</p>

  <h2 id="pfl-csv"><span class="num">06</span>CSV</h2>
  <p>With the mechanics in place, we can turn to formats. <strong>CSV</strong> (comma-separated values) stores a table as plain text: a header line with the column names, then one line per row, with the values separated by commas. It is what spreadsheets export, what many systems produce, and what our order sheet is. The format has one complication. If a value itself contains a comma, a double quote or a line break, the value is wrapped in double quotes, and any double quote inside it is written twice (<code>""</code>). Ben's note, <code>"extra chutney, no onion"</code>, is quoted for exactly this reason. That rule is why splitting each line at commas, the obvious approach, is wrong:</p>
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
  <p>Splitting Ben's line at commas gave 8 pieces for 7 columns: the note was cut in two, the quote marks stayed attached, and if this were a longer table every later column would be shifted by one. The standard <strong>csv</strong> module implements the quoting rules, and <code>csv.reader</code> returned the correct 7 fields. <code>csv.DictReader</code> goes one step further: it uses the header line as keys, so each row becomes a dictionary and you can write <code>row["qty"]</code> instead of remembering that quantity is column 4. It read 9 rows, and Ben's note came through intact.</p>
  <p>The last line shows CSV's biggest limitation: it has no types. Every value is a string, so the quantity is <code>'2'</code>, not 2, and an empty cell, like Farid's missing price, is the empty string <code>''</code>. Converting and validating values is always your job. Writing works the same way in reverse, with <code>csv.DictWriter</code>, and it takes care of quoting automatically:</p>
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
  <p>The first reason needed no quotes and got none. The second contained a comma, so it was quoted. The third contained a comma and double quotes, so it was quoted and each inner quote was doubled. Reading the file back restored the exact original text, although the line number came back as the string <code>'10'</code>. Notice the <code>newline=""</code> argument in every <code>open</code> for CSV: the csv module handles line endings itself, and without this argument Windows ends up with a blank line after every row, and line breaks inside quoted values can be mangled.</p>
  <p>Putting the pieces together gives a complete, robust reader. This is the <code>read_orders</code> function of the <code>chaistall</code> package (the package structure is explained in <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>). It uses a path, <code>with</code>, UTF-8, <code>newline=""</code>, the lazy <code>DictReader</code>, file line numbers that start at 2 because line 1 is the header, and the <code>BadRowError</code> exceptions from <a class="xref" data-note="py_exceptions">Exceptions &amp; Error Handling</a> to skip bad rows while remembering why. If more than half the rows are bad, the file itself is probably wrong, so it gives up:</p>
  <div class="fx" data-lang="py">"""chaistall/storage.py: read the day's CSV; skip bad rows but remember why."""
import csv
import logging

from .errors import BadRowError, TooManyBadRowsError
from .parse import parse_row

log = logging.getLogger(__name__)


def read_orders(path, max_bad_share=0.5):
    good, rejected = [], []
    with open(path, newline="", encoding="utf-8") as f:
        for line, row in enumerate(csv.DictReader(f), start=2):   # line 1 is the header
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
  <p>The three bad rows were logged as warnings with their line numbers and reasons, the six good ones were converted (Ben's row now has the integers 3 and 15 and a computed amount of 45), and the revenue is the correct 230. Every later section starts from these <code>good</code> and <code>rejected</code> lists.</p>

  <h2 id="pfl-json"><span class="num">07</span>JSON</h2>
  <p>CSV is good for flat tables, but our day's summary is not a table: it has a date, a few totals, a breakdown by item and by customer, and a list of rejected rows. It is <em>nested</em> data, dictionaries inside dictionaries. <strong>JSON</strong> (JavaScript Object Notation) is the standard text format for such data. It has objects (<code>{"key": value}</code>, like Python dicts), arrays (like lists), strings, numbers, <code>true</code>/<code>false</code> and <code>null</code>. It is easy for people to read, every programming language can parse it, and almost every web API speaks it.</p>
  <p>Python's <strong>json</strong> module converts between Python objects and JSON text. A memory aid for its four main functions: the ones ending in <strong>s</strong> work with <strong>s</strong>trings (<code>dumps</code>, <code>loads</code>), and the ones without work with files (<code>dump</code>, <code>load</code>). The <code>summarise</code> function in <code>chaistall/report.py</code> builds the summary dictionary:</p>
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
  <p>The first attempt failed: JSON has no date type, so <code>dumps</code> raised a <code>TypeError</code> for the <code>date</code> object. The <code>default=str</code> argument fixes that by telling <code>json</code> "for any object you do not understand, store <code>str(obj)</code> instead". The file was then written and read back: revenue and the per-customer totals arrived intact, and <code>dumps</code> produced a JSON string. But look at the date: it came back as the <em>string</em> <code>'2026-10-19'</code>, not a <code>date</code>. That is why <code>back == summary</code> is <code>False</code>. JSON is a translation into a smaller vocabulary, like translating a poem into a language with fewer words: the meaning survives, but some details have to be rewritten. With <code>indent=2</code> the file is pleasant to read:</p>
  <div class="fx" data-lang="text">$ head -12 out/summary_2026-10-19.json
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
    "Asha": 65,</div>
  <p>Which details change? The program below sends one value of each awkward type through a round trip:</p>
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
  <table class="tbl">
    <tr><th>Python value</th><th>written as</th><th>comes back as</th><th>what to do</th></tr>
    <tr><td>tuple <code>("Asha", 2)</code></td><td>array</td><td><strong>list</strong></td><td>convert after loading</td></tr>
    <tr><td>int key <code>{8: ...}</code></td><td>string key <code>"8"</code></td><td><strong>str</strong> key</td><td>convert keys after loading</td></tr>
    <tr><td>None / True</td><td>null / true</td><td>None / True</td><td>nothing</td></tr>
    <tr><td>"₹40"</td><td><code>"\\u20b940"</code></td><td>"₹40"</td><td><code>ensure_ascii=False</code> keeps ₹ readable</td></tr>
    <tr><td>float("nan")</td><td><code>NaN</code> (not valid JSON)</td><td>nan, in Python only</td><td><code>allow_nan=False</code>; write null instead</td></tr>
    <tr><td>set, date, Decimal</td><td>TypeError</td><td>nothing</td><td>a <code>default=</code> function, or convert first</td></tr>
  </table>
  <p>The NaN row deserves a second look. Python happily writes <code>NaN</code> and reads it back, but the JSON standard has no such value, so a JavaScript client or a strict parser will reject the <em>whole</em> document. <code>allow_nan=False</code> turns that into an error at write time, where you can fix it. For full control over unknown types, pass your own function as <code>default</code>. It is called for every object <code>json</code> cannot handle and must return something it can, or raise <code>TypeError</code>:</p>
  <div class="fx" data-lang="py">import json
from datetime import date, datetime

def to_json(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"cannot serialise {type(obj).__name__}")

text = json.dumps({"day": date(2026, 10, 19), "tags": {"b", "a"}}, default=to_json)
print(text)
back = json.loads(text)
print(date.fromisoformat(back["day"]))              # turning it back is your job</div>
  <div class="fx" data-lang="text">{"day": "2026-10-19", "tags": ["a", "b"]}
2026-10-19</div>
  <p>The date was written in the standard ISO format and the set as a sorted list. Turning them back into a <code>date</code> and a set after loading is up to you, as the last line shows with <code>date.fromisoformat</code>.</p>
  <p>A JSON file normally holds one document, which has to be read entirely before it can be used. For long streams of records, such as logs or event data, the common variant is <strong>JSON Lines</strong>: one JSON object per line, which can be read lazily with the line-by-line loop from section 04:</p>
  <div class="fx" data-lang="py">import json

with open("out/orders.jsonl", "w", encoding="utf-8") as f:
    for o in [{"customer": "Asha", "qty": 2}, {"customer": "Ben", "qty": 3}]:
        f.write(json.dumps(o) + "\\n")              # one JSON object per line
with open("out/orders.jsonl", encoding="utf-8") as f:
    print(sum(json.loads(line)["qty"] for line in f))   # read lazily, line by line</div>
  <div class="fx" data-lang="text">5</div>

  <h2 id="pfl-pickle"><span class="num">08</span>pickle</h2>
  <p>JSON could not store our date, set or tuple without help. Sometimes you want to save a Python object <em>exactly</em> as it is and load it back later in Python, for example to cache an expensive result between runs. <strong>pickle</strong> is the standard-library module for this. "Pickling" an object turns it into bytes that record how to rebuild it, and "unpickling" rebuilds it. It handles almost anything: dates, tuples, sets, your own classes, even trained machine-learning models. Pickle files are binary, so they are opened with <code>"wb"</code> and <code>"rb"</code>.</p>
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
with open("out/day_cache.pkl", "rb") as f:
    print(f.read()[:20])                            # not text</div>
  <div class="fx" data-lang="text">True
date tuple
b'\\x80\\x04\\x95\\x08\\x02\\x00\\x00\\x00\\x00\\x00\\x00}\\x94(\\x8c\\x03day\\x94'</div>
  <p>The round trip was exact: <code>back == cache</code> is <code>True</code>, and the date and the tuple came back as a <code>date</code> and a <code>tuple</code>, which JSON could not manage. The first bytes of the file show that it is not text at all. This is the right tool when the only program that will ever read the file is your own Python code. It is a dangerous tool in every other case, for two reasons.</p>
  <p>The first reason is fragility. A pickle does not contain your class's code, only its <em>name</em> and where to find it. Here one program saves an <code>Order</code> object and a second program, which does not define <code>Order</code>, tries to load it:</p>
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
  <p>Loading failed because the pickle said "rebuild an <code>Order</code> from the module <code>__main__</code>", and this program's <code>__main__</code> has no <code>Order</code>. The same failure happens when you rename or move a class, or when a library you pickled objects from changes its internals in a new version. Pickles are therefore unsuitable for long-term storage.</p>
  <p>The second reason is far more serious. Because a pickle contains instructions for rebuilding an object, it can contain the instruction "to rebuild me, call this function with these arguments", and that function can be <em>anything</em>. A class controls this with a special method called <code>__reduce__</code>. Here is what an attacker could send you:</p>
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
  <p>Simply <em>loading</em> 80 harmless-looking bytes ran a shell command. A real attacker would delete files or steal credentials instead of printing a message. Unpickling untrusted data is like plugging in a USB stick you found in the car park: the danger is not in what you do with it afterwards, it is in plugging it in at all. So never unpickle data from anyone you do not fully trust: downloads, uploads, emails, or "model files" from the internet. This applies to <code>joblib.load</code> and full-pickle <code>torch.load</code> too, since both use pickle inside. Use JSON or Parquet for data, and safe formats such as safetensors or ONNX for model weights. A few things cannot be pickled at all, such as lambdas, open files, sockets and locks.</p>

  <h2 id="pfl-yaml"><span class="num">09</span>YAML for Configuration</h2>
  <p>Some files are written by people rather than programs: the stall's menu prices, the threshold for rejecting a file, the days it is open. These settings should not live in the code, because changing a price should not require a programmer. JSON could hold them, but it is fussy to edit by hand (every string needs quotes, no trailing commas) and it does not allow comments. <strong>YAML</strong> is a text format designed for human-edited configuration: nesting is shown by indentation, values are written <code>key: value</code>, lists use <code>-</code> or <code>[...]</code>, and <code>#</code> starts a comment. It is the usual format for CI pipelines, Docker Compose, Kubernetes and machine-learning training configs. Python reads it with the third-party PyYAML package (<code>pip install pyyaml</code>, imported as <code>yaml</code>). Here is the stall's settings file:</p>
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
  <p>Most of it worked as hoped: the menu became a dictionary, the threshold a float and the open days a list. But two values are surprising. The outlet code <code>NO</code>, meant as "North Office", became <code>False</code>, and the schema version <code>1.10</code> became the float <code>1.1</code>. PyYAML follows version 1.1 of the YAML rules, in which <code>yes</code>, <code>no</code>, <code>on</code> and <code>off</code> are booleans; this is known as "the Norway problem", because the country code for Norway is NO. And anything that looks like a number is read as one, so a version string loses its trailing zero. The fix is simply to put quotes around such values, as the third line shows.</p>
  <p>The last line is about safety. YAML has a feature called tags that can ask the loader to construct arbitrary Python objects, including calling functions, which is the same danger as pickle. <code>yaml.safe_load</code> only builds plain types (dicts, lists, strings, numbers, booleans, dates and <code>None</code>) and refused the malicious tag. Always use <code>safe_load</code> and <code>safe_dump</code>. YAML is meant for small, hand-edited files, not for data. A simpler alternative for configuration is TOML, which Python can read with the built-in <code>tomllib</code> module and which is used by <code>pyproject.toml</code>.</p>

  <h2 id="pfl-parquet"><span class="num">10</span>Parquet</h2>
  <p>Now imagine the chai stall becomes a chain of thirty outlets, and a year of orders is a million rows. CSV starts to hurt in three ways. Every number has to be parsed from text on every read, which is slow. Types are lost, so one bad cell can turn a whole column into text. And to answer a question about one column, such as total quantity sold, a reader must still read every byte of every row. <strong>Parquet</strong> is a binary file format built for large tables that fixes all three. Its key idea is to store the table <em>column by column</em> rather than row by row; this is called a <strong>columnar</strong> format.</p>
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
</svg><figcaption>Row-oriented text (CSV) versus column-oriented binary (Parquet).</figcaption></figure>
  <p>On the left, CSV keeps each order together on one line, so the quantities are scattered across the whole file and can only be found by reading everything. On the right, Parquet keeps all customers together, all items together and all quantities together, each column with a declared type such as <code>int64</code>. A question about quantity reads only the highlighted <code>qty</code> block. Because similar values sit side by side, each column also compresses very well (an item column with four distinct names can be stored as a small dictionary plus codes). Parquet also stores the minimum and maximum of each column for each chunk of rows, so a reader looking for, say, outlet 7 can skip chunks that cannot contain it. A library catalogue works the same way: if you want every book by one author, you go to the author index, not along every shelf.</p>
  <p>In Python, Parquet is usually used through pandas (or polars, DuckDB or Spark), and pandas needs an <strong>engine</strong> library, normally <strong>pyarrow</strong>, to read and write it. Without one, it fails immediately:</p>
  <div class="fx" data-lang="py">import pandas as pd                                  # installed, but pyarrow is not
try:
    pd.DataFrame({"qty": [2, 3]}).to_parquet("out/x.parquet")
except ImportError as e:
    print("ImportError:", str(e).splitlines()[0])</div>
  <div class="fx" data-lang="text">ImportError: Unable to find a usable engine; tried using: 'pyarrow', 'fastparquet'.</div>
  <p>The remaining examples were run in a virtual environment with <code>pip install pandas pyarrow</code> (see <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a> for how environments work). Here the six good orders are saved as Parquet, read back, read partially, and compared with reading the CSV directly in pandas:</p>
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
  <p>The table came back with its types: quantity, price and amount are <code>int64</code>, with no parsing needed. The partial read asked for only two columns and only the masala chai rows, and the reader applied the filter itself, giving three rows. The last line shows the CSV problem in pandas: because one cell in the CSV's quantity column says "two", pandas guessed the whole column was text. With Parquet, the type is written in the file, so there is no guessing. To see the size and speed difference, here is a year of synthetic orders, a million rows (timings are approximate and vary by machine):</p>
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
read all: csv 0.06s, parquet 0.24s; one parquet column 0.008s</div>
  <p>The Parquet file is about four times smaller than the CSV. Reading the entire table is not where Parquet shines: both full reads took a fraction of a second here, and which one wins depends on the machine and the data. Reading <em>one column</em> is where it shines: under a hundredth of a second, because the other four columns were never touched. That is the typical analytics query, which is why Parquet is the standard file format for data lakes, Spark and machine-learning datasets, often as a folder of files split by a column such as date. Its limits are the mirror image of CSV's strengths: you cannot open it in a text editor, it carries a fixed overhead that makes it larger than CSV for tiny tables, and a file cannot be appended to, so new data goes into new files, for example one per day.</p>

  <h2 id="pfl-choose"><span class="num">11</span>Choosing a File Format</h2>
  <p>Every format so far has kept something and lost something. To see them side by side, the program below saves the same six orders, each with a <code>date</code> column, in all five formats, loads them back, and reports the file size and the types that came back:</p>
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
with open("out/c.json", encoding="utf-8") as f:
    back_json = json.load(f)
with open("out/c.yaml", "w", encoding="utf-8") as f:
    yaml.safe_dump(rows, f)
with open("out/c.yaml", encoding="utf-8") as f:
    back_yaml = yaml.safe_load(f)
with open("out/c.pkl", "wb") as f:
    pickle.dump(rows, f)
with open("out/c.pkl", "rb") as f:
    back_pkl = pickle.load(f)
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
  <p>CSV is the smallest, but everything came back as a string, even the quantity. JSON kept the integer quantity but turned the date into a string. YAML and pickle kept both. Parquet also kept both, but at 2,747 bytes for six rows it is the largest, because every file carries its schema and statistics; that fixed cost only pays off on large tables like the million-row example. No format wins everywhere, so the choice depends on four questions: <em>who reads it</em> (a person, a program in another language, or only your own Python), <em>what shape</em> it has (flat table, nested data or arbitrary objects), <em>how big</em> it is, and <em>whether you trust its source</em>.</p>
  <table class="tbl">
    <tr><th>format</th><th>human-readable?</th><th>keeps types?</th><th>fast and small at scale?</th><th>safe to load from strangers?</th><th>best for</th></tr>
    <tr><td>CSV</td><td>yes (and Excel)</td><td>no, all text</td><td>no</td><td>yes</td><td>small flat tables, exchange with people and spreadsheets</td></tr>
    <tr><td>JSON</td><td>yes</td><td>partly (no dates, sets, tuples)</td><td>no</td><td>yes</td><td>nested data, APIs, summaries</td></tr>
    <tr><td>YAML</td><td>yes, with comments</td><td>partly (has dates; NO and 1.10 traps)</td><td>no</td><td>with <code>safe_load</code> only</td><td>human-edited configuration</td></tr>
    <tr><td>pickle</td><td>no</td><td>exactly, any object</td><td>fair</td><td><strong>no</strong></td><td>short-lived caches between your own Python programs</td></tr>
    <tr><td>Parquet</td><td>no</td><td>yes (typed columns)</td><td>yes (columnar, compressed)</td><td>yes</td><td>big tables, archives, analytics</td></tr>
  </table>

  <h2 id="pfl-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most destructive file mistake takes one character. Opening a file with <code>"w"</code> when you meant to read it empties the file at once, before your code has read a single line:</p>
  <div class="fx" data-lang="py">from pathlib import Path

src = Path("out/orders_copy.csv")
print("before:", src.stat().st_size, "bytes")
with open(src, "w", encoding="utf-8") as f:        # meant "r": the file is emptied at once
    pass
print("after: ", src.stat().st_size, "bytes")</div>
  <div class="fx" data-lang="text">before: 351 bytes
after:  0 bytes</div>
  <p>351 bytes became 0 the moment <code>open</code> ran; there was no <code>write</code> at all. Open inputs with <code>"r"</code> (the default), write outputs to a different file, and use <code>"x"</code> for files that must never be overwritten.</p>
  <p>A subtler mistake combines lazy reading with <code>with</code>. A function that opens a file in a <code>with</code> block and <em>returns</em> a lazy generator over its lines looks fine, but the file is closed the moment the function returns, before anyone has read a line:</p>
  <div class="fx" data-lang="py">def lines(path):
    with open(path, encoding="utf-8") as f:
        return (line.strip() for line in f)        # lazy: nothing read yet

try:
    for line in lines("data/orders_2026-10-19.csv"):
        print(line)
except ValueError as e:
    print("ValueError:", e)

def lines_fixed(path):
    with open(path, encoding="utf-8") as f:
        yield from (line.strip() for line in f)    # the file stays open while we yield

print(sum(1 for _ in lines_fixed("data/orders_2026-10-19.csv")), "lines")</div>
  <div class="fx" data-lang="text">ValueError: I/O operation on closed file.
10 lines</div>
  <p>The caller's loop failed with "I/O operation on closed file". The fix is to make the function itself a generator with <code>yield from</code>, so the <code>with</code> block stays open while the caller is still consuming lines; the fixed version counted all 10 lines.</p>
  <p>A third mistake is leaving half-written files behind. If a program crashes in the middle of writing a summary, the file is left truncated, and the next job may read it as if it were complete. The safe pattern is to write to a temporary file in the same folder and then rename it over the target with <code>os.replace</code>, which on the same file system happens in a single step: readers see either the old file or the new one, never half of one.</p>
  <div class="fx" data-lang="py">import json, os, tempfile
from pathlib import Path

def write_json_atomic(obj, path):
    path = Path(path)
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")   # same folder as the target
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(obj, f)
        f.flush()
        os.fsync(f.fileno())                        # make sure the bytes reached the disk
    os.replace(tmp, path)                           # atomic: old file or new file, never half

write_json_atomic({"date": "2026-10-19", "revenue": 230}, "out/summary.json")
print(Path("out/summary.json").read_text(encoding="utf-8"))</div>
  <div class="fx" data-lang="text">{"date": "2026-10-19", "revenue": 230}</div>
  <p>The rest of the common mistakes have been demonstrated earlier on this page. Leaving out <code>encoding=</code> gives code that works on Linux and produces mojibake or <code>UnicodeDecodeError</code> on Windows. Opening files without <code>with</code> leaks handles on errors and can lose buffered writes. Calling <code>read()</code> on a big file uses memory in proportion to its size; iterate instead. Splitting CSV lines at commas breaks quoted values; use the csv module with <code>newline=""</code>. Trusting CSV types is a mistake because everything is a string and pandas guesses; convert explicitly or pass <code>dtype=</code>. Assuming a JSON round trip returns the same object ignores tuples becoming lists, integer keys becoming strings and dates needing <code>default=</code>. Loading pickles from untrusted sources runs arbitrary code. And <code>yaml.load</code> or unquoted <code>NO</code> and <code>1.10</code> in YAML give unsafe loading and wrong types.</p>

  <h2 id="pfl-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Persistence</b>: data outliving the program; a <b>file</b> is a named sequence of bytes; a <b>format</b> says what the bytes mean.</li>
    <li><b>Path</b>: relative (from the starting folder) or absolute (from the root); <code>pathlib.Path</code>.</li>
    <li><b>Mode</b>: r read, w empty and write, a append, x create only, b binary, + read and write.</li>
    <li><b>Buffer</b>: writes are collected in memory until <code>flush()</code> or <code>close()</code>.</li>
    <li><b>Encoding</b>: the rule mapping characters to bytes; UTF-8 is the standard; wrong rule → <b>mojibake</b> or <code>UnicodeDecodeError</code>.</li>
    <li><b>BOM</b>: 3 bytes Excel puts at the start of UTF-8 CSVs; use <code>"utf-8-sig"</code>.</li>
    <li><b>Context manager</b>: object used with <code>with</code> that sets up and always tidies up; files close themselves.</li>
    <li><b>Columnar format</b>: stores each column together (Parquet); read only needed columns.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from pathlib import Path
src = Path("data") / "orders.csv"            # .name .stem .suffix .parent .exists()
Path("out").mkdir(parents=True, exist_ok=True)

with open(src, encoding="utf-8") as f:       # text, read
    for line in f: ...                       # lazy, one pass, keeps "\\n"
with open("out/log.txt", "a", encoding="utf-8") as f:
    f.write("line\\n")
with open("out/cache.pkl", "rb") as f: ...   # binary

with open(src, newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))           # all values are str
with open(dst, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["line", "reason"])
    w.writeheader(); w.writerows(rows)

json.dump(obj, f, indent=2, ensure_ascii=False, default=str); json.load(f)
json.dumps(obj); json.loads(text)            # the "s" = string
pickle.dump(obj, f); pickle.load(f)          # only trusted data!
cfg = yaml.safe_load(text)
df.to_parquet(p, index=False); pd.read_parquet(p, columns=[...], filters=[...])</div>
  <h3>Reading calls</h3>
  <table class="tbl">
    <tr><th>call</th><th>memory</th><th>note</th></tr>
    <tr><td><code>for line in f</code></td><td>one line</td><td>lazy, single pass</td></tr>
    <tr><td><code>f.readline()</code></td><td>one line</td><td><code>""</code> at end of file</td></tr>
    <tr><td><code>f.read()</code>, <code>readlines()</code>, <code>list(f)</code></td><td>whole file</td><td>small files only</td></tr>
    <tr><td><code>f.read(n)</code></td><td>n</td><td>chunks for binary files</td></tr>
  </table>
  <h3>Formats</h3>
  <table class="tbl">
    <tr><th>need</th><th>format</th><th>watch out for</th></tr>
    <tr><td>table for people or Excel</td><td>CSV</td><td>all strings; quoting; BOM</td></tr>
    <tr><td>nested data, APIs, other languages</td><td>JSON (JSON Lines for streams)</td><td>tuple → list, int key → str, no dates, NaN</td></tr>
    <tr><td>human-edited config</td><td>YAML / TOML</td><td><code>safe_load</code>; NO → False, 1.10 → 1.1</td></tr>
    <tr><td>big table for analytics or ML</td><td>Parquet</td><td>needs pyarrow; not human-readable</td></tr>
    <tr><td>exact Python object, own use only</td><td>pickle</td><td>loading runs code; class must exist</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li><code>"w"</code> empties the file the moment it is opened.</li>
    <li>No <code>encoding=</code> → platform-dependent bugs.</li>
    <li><code>len(text)</code> is not the file size: "₹" is 3 bytes in UTF-8.</li>
    <li>A file iterator is used up after one loop; reopen or <code>seek(0)</code>.</li>
    <li>Returning a generator from inside <code>with</code> → "I/O operation on closed file".</li>
    <li><code>split(",")</code> is not CSV; open CSVs with <code>newline=""</code>.</li>
    <li>Never unpickle untrusted data; never <code>yaml.load</code> untrusted YAML.</li>
    <li>Safe writes: temporary file in the same folder, then <code>os.replace</code>.</li>
  </ul>

  <h2 id="pfl-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between modes "r", "w", "a" and "x"?</summary><div class="qa-body">"r" reads and requires the file to exist. "w" creates the file, or empties an existing one immediately, and then writes. "a" creates the file if needed and adds writes at the end. "x" creates a new file and raises <code>FileExistsError</code> if it already exists. Add "b" for binary and "+" for reading and writing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>with open(...)</code>? What happens if you never close a file?</summary><div class="qa-body"><code>with</code> closes the file on every path out of the block, including exceptions; it is shorthand for try/finally. An unclosed file leaks an operating-system handle, eventually causing "Too many open files", and may lose buffered writes. CPython often closes it when the object is garbage-collected, but that is an implementation detail and not guaranteed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>read()</code>, <code>readline()</code>, <code>readlines()</code> and iterating over a file?</summary><div class="qa-body"><code>read()</code> returns the whole file as one string; <code>readline()</code> returns the next line, or <code>""</code> at the end; <code>readlines()</code> returns a list of all lines. Iterating with <code>for line in f</code> yields one line at a time with constant memory. Only iteration and <code>readline()</code> are safe on files larger than memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you process a 20 GB log file in Python?</summary><div class="qa-body">Open it with an explicit encoding and iterate line by line, keeping only running totals, so memory stays constant (about 0.02 MB in the measurement on this page, versus 72 MB for <code>read()</code> on a 36 MB file). For a CSV that size, use <code>pd.read_csv</code> with <code>chunksize</code>, <code>usecols</code> and <code>dtype</code>, or convert it once to Parquet. For parallelism, split the work by file or byte range across processes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between text mode and binary mode?</summary><div class="qa-body">Text mode reads and writes <code>str</code>, encoding and decoding with the file's encoding and translating line endings. Binary mode reads and writes <code>bytes</code> with no conversion. Use binary for pickle, Parquet, images, and whenever you need the exact bytes, such as hashing a file.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>print(len("₹40"), len("₹40".encode("utf-8")))</code> print?</summary><div class="qa-body"><code>3 5</code>. The string has three characters; in UTF-8 "₹" takes three bytes and each digit one. File sizes are measured in bytes, so they are generally not equal to <code>len()</code> of the text.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is mojibake, and why should you always pass <code>encoding=</code>?</summary><div class="qa-body">Mojibake is garbled text produced by decoding bytes with the wrong encoding; for example UTF-8 "₹" read as cp1252 becomes "â‚¹", with no error raised. Without <code>encoding=</code>, Python uses the platform's default, UTF-8 on Linux and macOS but often cp1252 on Windows, so the same code behaves differently on different machines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A CSV exported from Excel gives <code>KeyError: 'order_id'</code> although the header says order_id. Why?</summary><div class="qa-body">Excel's "CSV UTF-8" starts with a byte order mark. Decoded as plain "utf-8", it becomes the invisible character <code>\\ufeff</code> at the start of the first column name, so the real key is <code>'\\ufefforder_id'</code>. Open the file with <code>encoding="utf-8-sig"</code>, which strips the BOM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not parse CSV with <code>line.split(",")</code>, and why open CSV files with <code>newline=""</code>?</summary><div class="qa-body">Values can contain commas, quotes or line breaks, which CSV protects with double quotes; <code>split</code> cuts <code>"extra chutney, no onion"</code> into two fields and shifts every later column. The csv module implements the quoting rules. <code>newline=""</code> lets the csv module handle line endings itself, so line breaks inside quoted values survive and Windows does not get blank rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>json.dump</code> and <code>json.dumps</code>, and what changes in a JSON round trip?</summary><div class="qa-body"><code>dump</code> and <code>load</code> work with file objects; <code>dumps</code> and <code>loads</code> work with strings. In a round trip, tuples become lists, non-string dictionary keys become strings, and NaN is written as a non-standard token. Sets, dates, <code>Decimal</code> and NumPy numbers raise <code>TypeError</code> unless you convert them or pass <code>default=</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you serialise a <code>datetime</code> or a custom object to JSON?</summary><div class="qa-body">Pass a function as <code>default</code>; json calls it for every object it cannot handle, and it must return something serialisable or raise <code>TypeError</code>. For dates, return <code>obj.isoformat()</code>; for sets, a sorted list. Alternatives are subclassing <code>json.JSONEncoder</code> or converting to plain dicts first (<code>dataclasses.asdict</code>, pydantic's <code>model_dump</code>). Loading requires parsing the values back, for example with <code>date.fromisoformat</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pickle vs JSON: when would you use each?</summary><div class="qa-body">JSON is text, language-neutral, human-readable and safe to load, but supports only basic types. pickle stores almost any Python object exactly, but it is Python-only, depends on class names and library versions, and is unsafe to load from untrusted sources. Use JSON for exchange and storage, and pickle only for short-lived caches between your own Python programs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is it safe to load a pickled model someone sent you?</summary><div class="qa-body">No. Unpickling calls whatever function the pickle names through <code>__reduce__</code>; on this page an 80-byte pickle ran a shell command just by being loaded. The same applies to <code>joblib.load</code> and full-pickle <code>torch.load</code>. Load only pickles you created or fully trust, and share model weights in safe formats such as safetensors or ONNX.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why <code>yaml.safe_load</code>, and what are YAML's type surprises?</summary><div class="qa-body"><code>safe_load</code> builds only plain types; the full loader can construct arbitrary Python objects from tags such as <code>!!python/object/apply:os.system</code>, which allows code execution. Under the YAML 1.1 rules PyYAML follows, unquoted <code>NO</code>, <code>yes</code>, <code>on</code> and <code>off</code> become booleans and <code>1.10</code> becomes the float 1.1. Quote such values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a columnar format, and why is Parquet preferred over CSV for analytics?</summary><div class="qa-body">A columnar format stores all values of a column together. Analytics queries usually touch a few columns, so a reader can skip the rest, and per-chunk minimum and maximum statistics let it skip rows too. Similar values side by side compress well (24.8 MB of CSV became 5.7 MB of Parquet on this page), and columns are typed, so there is no re-parsing and no "one bad cell turns the column into text". CSV remains better for small files people will open.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a large CSV with pandas without running out of memory?</summary><div class="qa-body">Read only the columns you need with <code>usecols</code>, give compact types with <code>dtype</code> (for example <code>"int32"</code>, or <code>"category"</code> for repeated strings), and process the file in pieces with <code>chunksize</code>, which returns an iterator of DataFrames:<div class="fx" data-lang="py">total = 0
for chunk in pd.read_csv("big.csv", usecols=["qty"], dtype={"qty": "int32"}, chunksize=100_000):
    total += chunk["qty"].sum()</div>Better still, convert it to Parquet once, or use a streaming engine such as polars or DuckDB.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a file so that readers never see a half-written version?</summary><div class="qa-body">Write to a temporary file in the same folder, flush it and call <code>os.fsync</code>, then rename it over the target with <code>os.replace(tmp, path)</code>. The rename is atomic on the same file system, so readers see either the old complete file or the new complete file, never a partial one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does looping over a file a second time give nothing?</summary><div class="qa-body">A file object is its own iterator and remembers its position; after the first loop it is at the end of the file, so a second loop or <code>list(f)</code> yields nothing. Reopen the file or call <code>f.seek(0)</code>. A related trap is returning a generator over <code>f</code> from inside a <code>with</code> block, which fails with "I/O operation on closed file".</div></details>
</main>
`
});
