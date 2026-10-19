// notes/python/py_strings.js — Strings
Object.assign(TOPIC_CONTENT, {
  "py_strings": `<main>
<h1>Strings</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Strings</span></div>
  <p class="lead">Data rarely arrives as neat tuples and dicts. It arrives as text: a WhatsApp message, a log line, a CSV row, "Asha: 2 masala chai ₹40". A Python string is a sequence of characters that cannot change, so everything you learnt about sequences (indexing, slicing, <code>in</code>, loops) works on it unchanged. This note builds on that: string methods that cut a line into parts, f-strings and format specs that print a receipt, why <code>+</code> in a loop is slow and <code>join</code> is not, what Unicode, code points and bytes are (traced byte by byte on "chai ₹"), and a light introduction to regular expressions for lines too messy for <code>split</code>. The running example is the same Chai Corner morning as the rest of the group, now as the six raw text lines the orders came from; the last section turns them into the list, tuples, dict, set and Counter of the earlier notes. Run on Python 3.13.</p>

  <h2 id="pst-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pst-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="120" y="6" width="400" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Fundamentals · Values &amp; Types · Control Flow · Functions</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pst-ga)"/>
<line x1="320" y1="100" x2="110" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pst-ga)"/>
<line x1="320" y1="100" x2="320" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pst-ga)"/>
<line x1="320" y1="100" x2="530" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pst-ga)"/>
<line x1="200" y1="152" x2="228" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pst-ga)"/>
<line x1="410" y1="152" x2="438" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pst-ga)"/>
<rect x="210" y="62" width="220" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="400">Python Collections: the map</text>
<text x="320" y="94" text-anchor="middle" class="tm" font-size="10">which container, and why</text>
<rect x="20" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="149" text-anchor="middle" font-size="12" font-weight="400">Lists &amp; Tuples</text>
<text x="110" y="164" text-anchor="middle" class="tm" font-size="10">order · fixed records</text>
<rect x="230" y="132" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="149" text-anchor="middle" font-size="12" font-weight="400">Dicts &amp; Sets</text>
<text x="320" y="164" text-anchor="middle" class="tm" font-size="10">lookup by key · unique</text>
<rect x="440" y="132" width="180" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="530" y="149" text-anchor="middle" font-size="12" font-weight="700">Strings</text>
<text x="530" y="164" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · text is a sequence too</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pst-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Iterators &amp; Generators · OOP · DSA: Arrays, Hashing · Pandas</text>
</svg><figcaption>The Python Collections group. Read the map first, then left to right: each note answers a question the one before could not. The dotted arrows are the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a></b><span>We looked prices up by name, counted with Counter and grouped with defaultdict, always starting from a ready-made list of order tuples. Two things were taken for granted: that names like "samosa" are values we can hash and compare, and that someone had already turned the stall's text into tuples. <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> gave us indexing and slicing, which strings reuse exactly; <a class="xref" data-note="py_values">Values &amp; Types</a> introduced <code>str</code> as an immutable type.</span></li>
    <li><b>This note adds: text as data</b><span>How to take text apart (slicing, methods, regex), how to put it together (join, f-strings), and how text becomes bytes on disk and on the network (Unicode, UTF-8).</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></b><span>Reading a file line by line is iteration; the group map <a class="xref" data-note="py_ds">Python Collections</a> ties all four notes together. Further on: <a class="xref" data-note="dsa_arrays">Arrays &amp; Strings</a> (two pointers, sliding windows on strings), <a class="xref" data-note="da_pandas">Pandas</a> (the <code>.str</code> accessor applies these same methods to a whole column), and <a class="xref" data-note="nlp">NLP Foundations</a> (tokenising text).</span></li>
  </ol>

  <h2 id="pst-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers come from the running example.</p>
  <ol class="story">
    <li><b>str as an immutable sequence</b><span>Q: what is "Asha: 2 masala chai ₹40" to Python? → 23 characters in order: <code>line[0]</code> is "A", <code>"chai" in line</code> is True. It cannot change: <code>line[0] = "a"</code> raises TypeError; <code>upper()</code> returns a new string. How do we cut out the parts?</span></li>
    <li><b>Slicing</b><span>Q: how do we take a piece? → The list rules: <code>line[:4]</code> "Asha", <code>line[8:19]</code> "masala chai". But positions change from line to line ("Ben" has 3 letters)…</span></li>
    <li><b>Methods</b><span>Q: how do we cut by content, not position? → <code>split(": ")</code>, <code>split()</code>, <code>strip</code>, <code>join</code>, <code>find</code>, <code>replace</code>: the line becomes ("Asha", "masala chai", 2, 40); all six sum to ₹230. Now how do we print a neat receipt?</span></li>
    <li><b>f-strings &amp; format specs</b><span>Q: how do we put values into text, aligned and rounded? → <code>f"{who:&lt;10}{rs:&gt;6}{rs/230:&gt;8.1%}"</code>: Ben 85 37.0%. But building a long text piece by piece with <code>+</code>…</span></li>
    <li><b>join vs + in a loop</b><span>Q: why is <code>s = s + piece</code> slow? → Each <code>+</code> copies the whole string so far: 6 names → 97 characters written instead of 27; 20,000 pieces → about 20 ms vs about 0.2 ms. And so far every character was plain English…</span></li>
    <li><b>Unicode, bytes, encodings</b><span>Q: what is "₹", and why is "chai ₹" 6 characters but 8 bytes? → Each character is a code point (₹ = U+20B9 = 8377); UTF-8 stores it as 3 bytes E2 82 B9. Decode with the wrong codec and you get "chai â‚¹". Finally, real order lines are messy: "Ben : 3 samosa", "asha:1 ginger chai  ₹25"…</span></li>
    <li><b>Regular expressions</b><span>Q: how do we describe the <em>shape</em> of a line instead of its exact characters? → <code>(\\w+)\\s*:\\s*(\\d+)\\s+(.+?)\\s+₹\\s*(\\d+)</code> parses all six messy lines; <code>findall</code>, groups, <code>sub</code>. Then the stall's whole day closes in one script: text → tuples → dict → set → Counter.</span></li>
  </ol>

  <h2 id="pst-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Strings</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Sequence of characters</div>
        <ul>
          <li><b>str</b> — ordered, immutable; a character is a 1-length str</li>
          <li>Index, slice, <code>len</code>, <code>in</code> (substring!), loop: same rules as lists</li>
          <li><code>line[:4]</code> Asha · <code>line[8:19]</code> masala chai · <code>[::-1]</code> reverse</li>
          <li>⚠ <code>s[0] = "a"</code> → TypeError; methods return NEW strings</li>
          <li>💡 a printed receipt: read it, copy it, never edit it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Methods</div>
        <ul>
          <li><b>split(sep)</b> / <b>split()</b> (any whitespace) → list</li>
          <li><b>sep.join(list)</b> → str (the inverse of split)</li>
          <li><b>strip/lstrip/rstrip</b>(chars), <b>removeprefix</b></li>
          <li><b>find</b> → −1 if missing; <b>index</b> raises ValueError</li>
          <li><b>replace</b>, <b>startswith/endswith</b>, <b>count</b>, <b>partition</b></li>
          <li><b>lower/upper/title</b>, <b>isdigit</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">f-strings</div>
        <ul>
          <li><code>f"{expr:spec}"</code>: any expression, then a format rule</li>
          <li><code>.2f</code> decimals · <code>.1%</code> percent · <code>,</code> <code>_</code> thousands</li>
          <li><code>&lt; &gt; ^</code> + width align · <code>03d</code> zero-pad · <code>x b e</code></li>
          <li><code>{x=}</code> debug · <code>{s!r}</code> repr</li>
          <li>Receipt: <code>{who:&lt;10}{rs:&gt;6}</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Building text</div>
        <ul>
          <li><code>s = s + x</code> copies all of s each time → O(n²)</li>
          <li>6 names: 97 characters written vs 27 with join</li>
          <li><code>"".join(parts)</code>: measure once, write once → O(n)</li>
          <li>Measured: 20,000 pieces ~20 ms vs ~0.2 ms</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Unicode &amp; bytes</div>
        <ul>
          <li><b>Code point</b>: a number per character; ₹ = U+20B9 = 8377</li>
          <li><b>UTF-8</b>: 1–4 bytes per character; ₹ → E2 82 B9</li>
          <li>"chai ₹": len 6 characters, 8 bytes</li>
          <li><code>encode</code> str → bytes; <code>decode</code> bytes → str</li>
          <li>⚠ wrong codec → mojibake "chai â‚¹"; pass <code>encoding="utf-8"</code></li>
          <li>⚠ é can be 1 or 2 code points → <code>normalize("NFC")</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regex</div>
        <ul>
          <li>Describe a <b>shape</b>: <code>\\d</code> digit, <code>\\w</code> word char, <code>\\s</code> space</li>
          <li><code>+ * ? {m,n}</code> how many; <code>( )</code> capture; <code>(?P&lt;name&gt;…)</code></li>
          <li><b>search</b> anywhere · <b>match</b> at start · <b>fullmatch</b> whole</li>
          <li><b>findall</b> (groups only if any) · <b>sub</b> replace · <b>compile</b></li>
          <li>Always raw strings <code>r"\\d"</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pst-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pst-seq"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Text Is a Sequence</span><span class="rm-sub">Immutable characters in order</span></div></div>
      <div class="rm-item rm-done" data-target="pst-slice"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Slicing Text</span><span class="rm-sub">One order line traced</span></div></div>
      <div class="rm-item rm-done" data-target="pst-methods"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">String Methods</span><span class="rm-sub">split, strip, join, find, replace</span></div></div>
      <div class="rm-item rm-done" data-target="pst-fmt"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">f-strings &amp; Format Specs</span><span class="rm-sub">A receipt</span></div></div>
      <div class="rm-item rm-done" data-target="pst-join"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Why + in a Loop Is Slow</span><span class="rm-sub">join, counted and measured</span></div></div>
      <div class="rm-item rm-done" data-target="pst-uni"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Unicode, Bytes &amp; Encodings</span><span class="rm-sub">"chai ₹" byte by byte</span></div></div>
      <div class="rm-item rm-done" data-target="pst-re"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Regex: a Light Intro</span><span class="rm-sub">Parsing messy lines</span></div></div>
      <div class="rm-item rm-done" data-target="pst-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Hands-on: Close the Day</span><span class="rm-sub">Text → every collection</span></div></div>
      <div class="rm-item rm-done" data-target="pst-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pst-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="pst-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pst-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pst-seq"><span class="num">01</span>Text Is a Sequence</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The previous notes started from a tidy list of tuples. But Chai Corner's orders come in as text messages on the stall's phone. Before we can split them apart, what <em>is</em> a piece of text to Python, and which of the list tools already work on it?</p>
  </div>
  <h3>The running example</h3>
  <p>The six orders of the morning, exactly as typed by the helper (in section 07 we meet the messier real version):</p>
  <div class="fx" data-lang="py">LINES = [
    "Asha: 2 masala chai ₹40",
    "Ben: 3 samosa ₹45",
    "Asha: 1 ginger chai ₹25",
    "Chen: 1 masala chai ₹20",
    "Dia: 2 bun maska ₹60",
    "Ben: 2 masala chai ₹40",
]
line = LINES[0]
print(line, type(line), len(line))
print(line[0], line[6], line[-3], line[-1])      # one character = a string of length 1
print("chai" in line, "samosa" in line)           # substring test
for ch in line[:4]:                               # a string is iterable
    print(ch, end=" ")</div>
  <div class="fx" data-lang="text">Asha: 2 masala chai ₹40 &lt;class 'str'&gt; 23
A 2 ₹ 0
True False
A s h a </div>
  <p>A <strong>string</strong> (<code>str</code>) is a sequence of characters in order. Everything from <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> section 02 applies: the line has 23 characters; <code>line[0]</code> is "A", <code>line[6]</code> is "2", <code>line[-3]</code> is "₹" (one character, even though it is not on an English keyboard), <code>line[-1]</code> is "0". There is no separate "character" type: one character is a string of length 1. <code>in</code> on strings checks for a <em>substring</em> ("chai" anywhere inside), not just one item. And a <code>for</code> loop visits the characters one by one.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A string is a row of letter tiles glued onto a strip, like a shop's name board. You can read any tile, read a stretch, look for a word; to "change" the board you make a new one.</p></div>
  <h3>Immutable: every change makes a new string</h3>
  <div class="fx" data-lang="py">line = "Asha: 2 masala chai ₹40"
try:
    line[0] = "a"
except TypeError as e:
    print("TypeError:", e)
shout = line.upper()            # a NEW string; line is untouched
print(shout)
print(line)
before = id(line)
line = line + "!"               # "changing" = building a new object and moving the name
print(id(line) == before, line)</div>
  <div class="fx" data-lang="text">TypeError: 'str' object does not support item assignment
ASHA: 2 MASALA CHAI ₹40
Asha: 2 masala chai ₹40
False Asha: 2 masala chai ₹40!</div>
  <p>Assigning to a position raises TypeError, exactly as for a tuple. <code>upper()</code> did not change <code>line</code>; it returned a new string. Even <code>line = line + "!"</code> does not change the old string: it builds a new object (different <code>id</code>) and moves the name <code>line</code> to it, the "names are tags" idea from <a class="xref" data-note="py_fundamentals">Python Fundamentals</a>. Immutability is also why strings can be dict keys and set items (<a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>).</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>str</strong> is an immutable sequence of Unicode code points (section 06). It supports indexing, slicing, <code>len</code>, <code>in</code> (substring test), iteration, <code>+</code> (concatenation) and <code>*</code> (repetition); all methods return new objects.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>line.upper()</code> on its own line does nothing useful: the result is thrown away. Write <code>line = line.upper()</code>. (The opposite of the list trap, where <code>q = q.sort()</code> loses the list.)</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Slicing Text.</b> We can read one character. To get the customer, the item or the amount we need whole stretches of the line.</div>

  <h2 id="pst-slice"><span class="num">02</span>Slicing Text</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Asha" is the first four characters; "masala chai" sits somewhere in the middle; the amount is at the end. How do we cut those stretches out?</p>
  </div>
  <p>Exactly as with lists: <code>s[start:stop:step]</code>, stop not included, negative positions from the end. Here are the positions of our line:</p>
  <table class="tbl">
    <tr><th>char</th><td>A</td><td>s</td><td>h</td><td>a</td><td>:</td><td>␣</td><td>2</td><td>␣</td><td>m</td><td>…</td><td>i</td><td>␣</td><td>₹</td><td>4</td><td>0</td></tr>
    <tr><th>index</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>…</td><td>18</td><td>19</td><td>20</td><td>21</td><td>22</td></tr>
    <tr><th>negative</th><td>−23</td><td>−22</td><td>−21</td><td>−20</td><td>−19</td><td>−18</td><td>−17</td><td>−16</td><td>−15</td><td>…</td><td>−5</td><td>−4</td><td>−3</td><td>−2</td><td>−1</td></tr>
  </table>
  <p>By hand: <code>[:4]</code> = cuts 0 to 4 = "Asha"; <code>[6]</code> = "2"; <code>[8:19]</code> = "masala chai" (m at 8, the final i at 18, so stop at 19); <code>[-2:]</code> = "40".</p>
  <div class="fx" data-lang="py">line = "Asha: 2 masala chai ₹40"
print(line[:4], "|", line[6], "|", line[8:19], "|", line[-2:])
print(line[::-1])
colon = line.find(":")
print(colon, line[:colon], "|", line[colon + 2:])</div>
  <div class="fx" data-lang="text">Asha | 2 | masala chai | 40
04₹ iahc alasam 2 :ahsA
4 Asha | 2 masala chai ₹40</div>
  <p>The hand trace matches. <code>[::-1]</code> reverses the text. The last line shows the problem: the slice positions only work for Asha. Ben's line has its colon at position 3, not 4, so we first <code>find(":")</code> and slice relative to it: name is everything before the colon, the rest starts 2 characters after it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Cutting a ribbon at numbered marks. It works perfectly for one ribbon; for the next ribbon you first have to find where the knot is.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>For a str, <code>s[i]</code> returns a 1-character string and <code>s[a:b:c]</code> a new string, with the same index and clamping rules as every sequence (IndexError for a bad index, never for a slice).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Hard-coded positions break as soon as the data varies ("Ben" is shorter than "Asha"). Slice by positions only for fixed-width formats (dates "2024-05-01"[:4]); otherwise cut by content (next section).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: String Methods.</b> We need to cut by <em>what</em> the text contains (the colon, the spaces, the ₹), not by where it happens to sit.</div>

  <h2 id="pst-methods"><span class="num">03</span>String Methods: split, strip, join, find, replace</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each line has the shape "name: qty item ₹amount". How do we turn it into the tuple ("Asha", "masala chai", 2, 40) whatever the length of each part?</p>
  </div>
  <h3>Parsing one line, step by step</h3>
  <div class="fx" data-lang="py">line = "Asha: 2 masala chai ₹40"
name, rest = line.split(": ")            # split on ": " -&gt; exactly two pieces here
print(repr(name), repr(rest))
words = rest.split()                     # no argument: split on any run of spaces
print(words)
qty = int(words[0])                      # text "2" -&gt; number 2
amount = int(words[-1].lstrip("₹"))      # strip the rupee sign from the LEFT
item = " ".join(words[1:-1])             # glue the middle words back with spaces
print((name, item, qty, amount))
print(repr("  Ben  \\n".strip()), repr("--chai--".strip("-")), repr("₹45".removeprefix("₹")))</div>
  <div class="fx" data-lang="text">'Asha' '2 masala chai ₹40'
['2', 'masala', 'chai', '₹40']
('Asha', 'masala chai', 2, 40)
'Ben' 'chai' '45'</div>
  <table class="tbl">
    <tr><th>step</th><th>call</th><th>result</th></tr>
    <tr><td>1</td><td><code>line.split(": ")</code></td><td>['Asha', '2 masala chai ₹40'] → name, rest</td></tr>
    <tr><td>2</td><td><code>rest.split()</code> (no argument = any whitespace)</td><td>['2', 'masala', 'chai', '₹40']</td></tr>
    <tr><td>3</td><td><code>int(words[0])</code></td><td>2 (text → number)</td></tr>
    <tr><td>4</td><td><code>words[-1].lstrip("₹")</code> then <code>int</code></td><td>"40" → 40</td></tr>
    <tr><td>5</td><td><code>" ".join(words[1:-1])</code></td><td>"masala chai" (the middle words glued back)</td></tr>
  </table>
  <p><code>split</code> and <code>join</code> are inverses: split turns a string into a list at a separator, join glues a list of strings into one string with the separator between. Note the order: <code>separator.join(list)</code>. <code>strip()</code> removes whitespace (or given characters) from both ends; <code>lstrip</code>/<code>rstrip</code> one end; <code>removeprefix</code> removes an exact prefix once.</p>
  <h3>The other everyday methods</h3>
  <div class="fx" data-lang="py">line = "Ben: 3 samosa ₹45"
print(line.find("samosa"), line.find("vada"))          # -1 when missing
try:
    line.index("vada")                                 # index RAISES when missing
except ValueError as e:
    print("ValueError:", e)
print(line.replace("samosa", "vada pav"))
print(line.startswith("Ben"), line.endswith("₹45"), line.count("a"))
print(line.partition(": "))                            # always 3 parts
print("asha".title(), "MASALA chai".lower(), "3".isdigit(), "₹45".isdigit())
print(line.split(" ", 1), "a,b,,c".split(","))</div>
  <div class="fx" data-lang="text">7 -1
ValueError: substring not found
Ben: 3 vada pav ₹45
True True 2
('Ben', ': ', '3 samosa ₹45')
Asha masala chai True False
['Ben:', '3 samosa ₹45'] ['a', 'b', '', 'c']</div>
  <ul>
    <li><code>find</code> returns the position of the first match (7) or −1; <code>index</code> does the same but raises ValueError when missing.</li>
    <li><code>replace(old, new)</code> replaces every occurrence (returns a new string).</li>
    <li><code>startswith</code>/<code>endswith</code> test the ends; <code>count</code> counts non-overlapping occurrences ("a" twice in "Ben: 3 samosa ₹45").</li>
    <li><code>partition(sep)</code> always returns 3 parts (before, sep, after), handy when the separator might be missing.</li>
    <li><code>title</code>, <code>lower</code>, <code>upper</code> change case; <code>isdigit</code> tests "all digits" ("₹45" is not).</li>
    <li><code>split(" ", 1)</code> splits at most once; <code>split(",")</code> keeps empty pieces between two commas, <code>split()</code> without an argument never does.</li>
  </ul>
  <h3>All six lines</h3>
  <div class="fx" data-lang="py">def parse(line):
    name, rest = line.split(": ")
    words = rest.split()
    return name, " ".join(words[1:-1]), int(words[0]), int(words[-1].lstrip("₹"))
orders = [parse(l) for l in LINES]
for o in orders:
    print(o)
print(sum(o[3] for o in orders))</div>
  <div class="fx" data-lang="text">('Asha', 'masala chai', 2, 40)
('Ben', 'samosa', 3, 45)
('Asha', 'ginger chai', 1, 25)
('Chen', 'masala chai', 1, 20)
('Dia', 'bun maska', 2, 60)
('Ben', 'masala chai', 2, 40)
230</div>
  <p>A comprehension (<a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>, section 04) applies <code>parse</code> to every line, giving the list of order tuples the other notes started from, plus the amount. The amounts add up to ₹230, matching the bills computed from the menu dict in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> (65 + 85 + 20 + 60).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>split</code> is tearing a perforated sheet of tickets at every perforation; <code>join</code> is taping a stack of tickets back into one strip, with a piece of tape (the separator) between each pair.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>str.split(sep=None, maxsplit=-1)</code>: list of pieces; with sep=None splits on runs of whitespace and drops empty pieces. <code>sep.join(iterable_of_str)</code>: one string with sep between items (every item must be a str). <code>str.find(sub)</code> → index or −1; <code>str.index(sub)</code> → index or ValueError.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>",".join([1, 2, 3])</code> raises TypeError: join needs strings. Use <code>",".join(map(str, nums))</code>. And <code>if s.find("x"):</code> is wrong: find returns 0 (falsy) for a match at the start and −1 (truthy) for "not found". Use <code>if "x" in s</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: f-strings &amp; Format Specs.</b> We can take text apart. The owner also wants text <em>out</em>: a receipt with names aligned, rupees right-aligned, shares as percentages.</div>

  <h2 id="pst-fmt"><span class="num">04</span>f-strings &amp; Format Specs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gluing <code>"Bill for " + name + ": " + str(amount)</code> is clumsy, needs <code>str()</code> everywhere, and cannot align columns or round numbers. How do we put values into text neatly?</p>
  </div>
  <p>An <strong>f-string</strong> has an <code>f</code> before the quotes; anything inside <code>{ }</code> is a Python expression whose value is inserted. After a colon you can add a <strong>format spec</strong>, a short rule like "2 decimals" or "right-align in 6 spaces".</p>
  <div class="fx" data-lang="py">name, item, qty, amount = "Asha", "masala chai", 2, 40
print("Bill for " + name + ": " + str(qty) + " x " + item + " = Rs " + str(amount))  # clumsy
print(f"Bill for {name}: {qty} x {item} = Rs {amount}")
print(f"{name.upper()} owes {qty * 20 + 25} rupees")    # any expression inside { }
print(f"{amount / 3:.2f} | {amount:5d} | {amount:&lt;5}| {name:&gt;6}| {name:^8}|")</div>
  <div class="fx" data-lang="text">Bill for Asha: 2 x masala chai = Rs 40
Bill for Asha: 2 x masala chai = Rs 40
ASHA owes 65 rupees
13.33 |    40 | 40   |   Asha|   Asha  |</div>
  <p>The first two lines print the same text; the f-string needs no <code>+</code> and no <code>str()</code>. Any expression works inside the braces (Asha's 2 × 20 + 25 = 65). Last line, spec by spec: <code>.2f</code> → 40/3 with 2 decimals, 13.33; <code>5d</code> → integer in a field 5 wide, right-aligned for numbers; <code>&lt;5</code> left-align; <code>&gt;6</code> right-align; <code>^8</code> centre.</p>
  <table class="tbl">
    <tr><th>Spec</th><th>Code</th><th>Gives</th></tr>
    <tr><td>Decimals / width</td><td><code>{x:.2f}</code> / <code>{x:8.3f}</code></td><td>13.33 / width 8, 3 decimals</td></tr>
    <tr><td>Percent</td><td><code>{share:.1%}</code></td><td>85/230 → 37.0%</td></tr>
    <tr><td>Thousands</td><td><code>{n:,}</code> / <code>{n:_}</code></td><td>1,234,567 / 1_234_567</td></tr>
    <tr><td>Align</td><td><code>{name:&gt;6}</code> <code>&lt;</code> <code>^</code></td><td>right / left / centre</td></tr>
    <tr><td>Zero-pad, hex, binary, scientific</td><td><code>{7:03d} {255:x} {255:b} {x:e}</code></td><td>007 ff 11111111 2.300000e+02</td></tr>
    <tr><td>Debug, repr</td><td><code>{total=}</code>, <code>{name!r}</code></td><td>total=230, 'Asha'</td></tr>
  </table>
  <div class="fx" data-lang="py">total, share, n = 230, 85 / 230, 1234567
print(f"{share:.1%} {n:,} {n:_} {7:03d} {255:x} {255:b} {total:e}")
print(f"{name!r} {total=} {share=:.3f}")</div>
  <div class="fx" data-lang="text">37.0% 1,234,567 1_234_567 007 ff 11111111 2.300000e+02
'Asha' total=230 share=0.370</div>
  <h3>The receipt</h3>
  <div class="fx" data-lang="py">bills = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
print(f"{'customer':&lt;10}{'Rs':&gt;6}{'share':&gt;8}")
for who, rs in bills.items():
    print(f"{who:&lt;10}{rs:&gt;6}{rs / 230:&gt;8.1%}")
print(f"{'TOTAL':&lt;10}{sum(bills.values()):&gt;6}")</div>
  <div class="fx" data-lang="text">customer      Rs   share
Asha          65   28.3%
Ben           85   37.0%
Chen          20    8.7%
Dia           60   26.1%
TOTAL        230</div>
  <p>Each row uses the same widths (10 left-aligned, 6 and 8 right-aligned), so the columns line up. The shares come from the bills dict: 65/230 = 28.3%, 85/230 = 37.0%, 20/230 = 8.7%, 60/230 = 26.1%. Note <code>'customer'</code> inside the f-string uses single quotes, because the f-string itself uses double quotes.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pre-printed bill book: the blanks are the braces, and the format spec is the instruction printed under each blank ("amount, 2 decimals, right side").</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>f-string</strong> (formatted string literal) <code>f"…{expr!conv:spec}…"</code> evaluates each <code>expr</code> at run time, optionally converts it (<code>!r</code> repr, <code>!s</code> str), and formats it with the format-spec mini-language <code>[[fill]align][sign][width][,|_][.precision][type]</code>. <code>{expr=}</code> also prints the expression text.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Format money for display only: compute with numbers, format at the end. <code>f"{0.1 + 0.2:.2f}"</code> shows 0.30 but the float is still 0.30000000000000004; for real money use integers (paise) or <code>decimal.Decimal</code>. And never build SQL or shell commands with f-strings from user input (injection).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Why + in a Loop Is Slow.</b> A receipt for 6 customers is fine. A day's report of 20,000 lines built piece by piece with <code>+</code> gets mysteriously slow. Why, if strings are so simple?</div>

  <h2 id="pst-join"><span class="num">05</span>Why "+" in a Loop Is Slow (and join Is Not)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Immutability has a cost we have not counted yet. If a string can never grow, what actually happens each time we write <code>s = s + piece</code> in a loop?</p>
  </div>
  <h3>Counted by hand</h3>
  <p>Because the old string cannot be extended, <code>s + piece</code> allocates a brand-new string and copies every character of <code>s</code> into it, then the piece. Build "Asha,Ben,Asha,Chen,Dia,Ben," that way and count the characters written:</p>
  <div class="fx" data-lang="py">pieces = ["Asha", "Ben", "Asha", "Chen", "Dia", "Ben"]
s, copied = "", 0
for p in pieces:
    s = s + p + ","                 # builds a new string each time
    copied += len(s)                # every character of the new string is written
    print(f"{s:30} length {len(s):2}  copied so far {copied}")
print(",".join(pieces), "&lt;- join writes", len(",".join(pieces)), "characters once")</div>
  <div class="fx" data-lang="text">Asha,                          length  5  copied so far 5
Asha,Ben,                      length  9  copied so far 14
Asha,Ben,Asha,                 length 14  copied so far 28
Asha,Ben,Asha,Chen,            length 19  copied so far 47
Asha,Ben,Asha,Chen,Dia,        length 23  copied so far 70
Asha,Ben,Asha,Chen,Dia,Ben,    length 27  copied so far 97
Asha,Ben,Asha,Chen,Dia,Ben &lt;- join writes 26 characters once</div>
  <p>5 + 9 + 14 + 19 + 23 + 27 = 97 characters written to produce a 27-character result. The pieces keep getting re-copied: Asha's name is copied six times. With n pieces of similar length k, the total is about k(1 + 2 + … + n) = k·n(n+1)/2, which grows like n²: O(n²). <code>",".join(pieces)</code> first adds up the lengths, allocates the result once, and copies each piece once: 26 characters, O(n).</p>
  <h3>Measured</h3>
  <div class="fx" data-lang="py">import timeit
words = ["x"] * 20000
def concat():
    s = ""
    for w in words:
        s = s + w + ","          # copies the growing string each time
    return s
def join():
    return ",".join(words)       # one pass, one allocation
print(concat()[:-1] == join())
print(f"concat {timeit.timeit(concat, number=50) * 20:.2f} ms, join {timeit.timeit(join, number=50) * 20:.2f} ms")</div>
  <div class="fx" data-lang="text">True
concat 18.44 ms, join 0.17 ms</div>
  <p>Same text (the concat version has one extra trailing comma, removed for the comparison), and join is roughly a hundred times faster at 20,000 pieces; the gap widens as n grows. (CPython sometimes cheats and extends <code>s += x</code> in place when nothing else refers to s; do not rely on it, other Pythons do not.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Writing a growing list of names on a whiteboard that cannot be erased or extended: for every new name you fetch a new, bigger board and copy all the old names first. join is measuring the final list first and writing it once on a board of the right size.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Repeated concatenation of immutable sequences in a loop costs O(n²) in total; collecting the parts in a list (O(1) amortised append) and calling <code>"".join(parts)</code> once costs O(total length). The same applies to tuples (<code>t = t + (x,)</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The slow version still gives the right answer, so the bug only shows on big inputs. In a loop that builds text, append pieces to a list and join at the end; for files, write each piece directly (<code>f.write</code>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Unicode, Bytes &amp; Encodings.</b> We have treated every character as one simple thing. But "₹" is not on a typewriter, and the order file on disk is just bytes. How does "chai ₹" become bytes, and why does it sometimes come back as "chai â‚¹"?</div>

  <h2 id="pst-uni"><span class="num">06</span>Unicode, Bytes &amp; Encodings</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A disk, a network socket and a CSV file store only bytes, numbers from 0 to 255. There are far more than 256 characters in the world (₹, é, हिंदी, ☕). So what is a character to Python, and how does it travel as bytes?</p>
  </div>
  <h3>Plain words</h3>
  <ul>
    <li><strong>Unicode</strong> is one world-wide list that gives every character a number, its <strong>code point</strong>, written U+ and hex: "c" is U+0063 (99), "₹" is U+20B9 (8377). A Python <code>str</code> is a sequence of code points.</li>
    <li>An <strong>encoding</strong> is a rule for turning code points into bytes and back. <strong>UTF-8</strong> is the standard: 1 byte for English letters, 2 to 4 bytes for everything else.</li>
    <li><code>str.encode("utf-8")</code> goes str → bytes; <code>bytes.decode("utf-8")</code> goes bytes → str.</li>
  </ul>
  <div class="flow"><span>str "chai ₹" (6 code points)</span><span>.encode("utf-8")</span><span>bytes b'chai \\xe2\\x82\\xb9' (8 bytes)</span><span>.decode("utf-8")</span><span>str again</span></div>
  <h3>"chai ₹", character by character</h3>
  <div class="fx" data-lang="py">s = "chai ₹"
print(len(s))
for ch in s:
    b = ch.encode("utf-8")
    print(f"{ch!r:5} code point {ord(ch):5} = U+{ord(ch):04X}  utf-8 bytes {b.hex(' '):9} ({len(b)} byte{'s' if len(b) &gt; 1 else ''})")</div>
  <div class="fx" data-lang="text">6
'c'   code point    99 = U+0063  utf-8 bytes 63        (1 byte)
'h'   code point   104 = U+0068  utf-8 bytes 68        (1 byte)
'a'   code point    97 = U+0061  utf-8 bytes 61        (1 byte)
'i'   code point   105 = U+0069  utf-8 bytes 69        (1 byte)
' '   code point    32 = U+0020  utf-8 bytes 20        (1 byte)
'₹'   code point  8377 = U+20B9  utf-8 bytes e2 82 b9  (3 bytes)</div>
  <p>Five ASCII characters (code points below 128) take 1 byte each, the same number as their code point. ₹ (8377) needs 3 bytes. So the string has 6 characters but 8 bytes:</p>
  <div class="fx" data-lang="py">s = "chai ₹"
data = s.encode("utf-8")            # str -&gt; bytes
print(data, type(data), len(data))
print(data.decode("utf-8"))         # bytes -&gt; str
print(list(data))                   # bytes are just numbers 0-255
print(f"{0x20B9:016b}", "-&gt;", " ".join(f"{b:08b}" for b in "₹".encode()))
print(chr(8377), ord("₹"), "₹")</div>
  <div class="fx" data-lang="text">b'chai \\xe2\\x82\\xb9' &lt;class 'bytes'&gt; 8
chai ₹
[99, 104, 97, 105, 32, 226, 130, 185]
0010000010111001 -&gt; 11100010 10000010 10111001
₹ 8377 ₹</div>
  <h3>How UTF-8 packs ₹ into 3 bytes (by hand)</h3>
  <p>U+20B9 in 16 bits is <code>0010 0000 1011 1001</code>. A code point between U+0800 and U+FFFF uses the 3-byte pattern <code>1110xxxx 10xxxxxx 10xxxxxx</code>: split the 16 bits as 4 + 6 + 6, <code>0010</code> | <code>000010</code> | <code>111001</code>, and drop them into the x's:</p>
  <table class="tbl">
    <tr><th>byte</th><th>pattern</th><th>bits filled in</th><th>hex</th><th>decimal</th></tr>
    <tr><td>1</td><td>1110xxxx</td><td>1110 0010</td><td>E2</td><td>226</td></tr>
    <tr><td>2</td><td>10xxxxxx</td><td>10 000010</td><td>82</td><td>130</td></tr>
    <tr><td>3</td><td>10xxxxxx</td><td>10 111001</td><td>B9</td><td>185</td></tr>
  </table>
  <p>That is exactly the output: <code>e2 82 b9</code>, or 226, 130, 185 in <code>list(data)</code>. The leading bits are a signal: a byte starting with 0 is a whole ASCII character, one starting with 1110 says "I am the first of 3", and 10 marks a continuation byte. That is how a decoder knows where each character starts.</p>
  <h3>When encodings go wrong</h3>
  <div class="fx" data-lang="py">s = "chai ₹"
try:
    s.encode("ascii")
except UnicodeEncodeError as e:
    print("UnicodeEncodeError:", e.reason)
print(s.encode("ascii", errors="replace"), s.encode("ascii", errors="ignore"))
raw = s.encode("utf-8")
print(raw.decode("cp1252"))         # wrong codec (Windows-1252): mojibake, no error!
try:
    raw.decode("ascii")
except UnicodeDecodeError as e:
    print("UnicodeDecodeError:", e.reason)
print(len(s.encode("utf-16")), len(s.encode("utf-32")))</div>
  <div class="fx" data-lang="text">UnicodeEncodeError: ordinal not in range(128)
b'chai ?' b'chai '
chai â‚¹
UnicodeDecodeError: ordinal not in range(128)
14 28</div>
  <ul>
    <li>ASCII only knows 128 characters, so encoding ₹ fails: "ordinal not in range(128)". <code>errors="replace"</code> writes "?", <code>errors="ignore"</code> silently drops it (data loss).</li>
    <li>Decoding UTF-8 bytes with the wrong codec, Windows-1252 here, does <em>not</em> raise: each of the 3 bytes becomes its own character, E2 → â, 82 → ‚, B9 → ¹. That garbage, "chai â‚¹", is called <strong>mojibake</strong>. When you see it, the bytes were UTF-8 and were read with the wrong codec.</li>
    <li>UTF-16 and UTF-32 use 2 or 4 bytes per character here, plus a 2- or 4-byte byte-order mark (BOM): 2 + 6 × 2 = 14 and 4 + 6 × 4 = 28.</li>
  </ul>
  <h3>Files: say the encoding</h3>
  <div class="fx" data-lang="py">with open("orders.txt", "w", encoding="utf-8") as f:
    f.write("Asha: 2 masala chai ₹40\\n")
with open("orders.txt", "rb") as f:
    print(f.read())
with open("orders.txt", encoding="utf-8") as f:
    print(f.read().strip())
with open("orders.txt", encoding="cp1252", errors="replace") as f:
    print(f.read().strip())</div>
  <div class="fx" data-lang="text">b'Asha: 2 masala chai \\xe2\\x82\\xb940\\n'
Asha: 2 masala chai ₹40
Asha: 2 masala chai â‚¹40</div>
  <p>Written with <code>encoding="utf-8"</code>, the file holds the 3 bytes of ₹. Read back as UTF-8 it is correct; read as cp1252 (the default on many Windows machines) the same bytes become mojibake. Always pass <code>encoding="utf-8"</code> to <code>open()</code>, and <code>"utf-8-sig"</code> for CSVs saved by Excel (they start with a BOM).</p>
  <h3>One character, two spellings: normalisation</h3>
  <div class="fx" data-lang="py">import unicodedata
a = "café"                          # é as ONE code point (U+00E9)
b = "café"                    # e + COMBINING ACUTE ACCENT (two code points)
print(a, b, a == b, len(a), len(b))
print(unicodedata.normalize("NFC", b) == a)</div>
  <div class="fx" data-lang="text">café café False 4 5
True</div>
  <p>"é" can be one code point (U+00E9) or "e" plus a combining accent (U+0301). They look identical but compare unequal and have different lengths. <code>unicodedata.normalize("NFC", s)</code> converts to the composed form, so normalise text before comparing, deduplicating or using it as a dict key.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Code points are the words of a message; an encoding is the alphabet of the telegraph used to send it. Send in Morse, read as semaphore, and you get nonsense, though every signal arrived.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Code point</strong>: the integer Unicode assigns to a character (0 to 0x10FFFF); <code>ord(ch)</code> and <code>chr(n)</code> convert. <strong>Encoding</strong>: a reversible map from code points to bytes; UTF-8 uses 1 byte for U+0000–U+007F, 2 for up to U+07FF, 3 for up to U+FFFF, 4 above. <strong>bytes</strong>: an immutable sequence of integers 0–255.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>len(s)</code> counts code points, not bytes and not what a reader sees as "letters": "chai ₹" is 6 code points and 8 UTF-8 bytes, and an emoji with a skin-tone modifier is 2 code points. Limits like "max 255 bytes" must be checked on <code>len(s.encode())</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Regex: a Light Intro.</b> Our <code>split(": ")</code> parser assumed perfectly typed lines. The helper on a busy morning types "Ben : 3 samosa", "asha:1 ginger chai  ₹25" and "₹ 60". How do we parse lines whose spacing varies?</div>

  <h2 id="pst-re"><span class="num">07</span>Regular Expressions: a Light Intro</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Here are the real lines. <code>split(": ")</code> breaks on three of them: a space before the colon, no space after it, a space after ₹. We cannot list every possible spacing. We need to describe the <em>shape</em> of a line: "a word, maybe spaces, a colon, maybe spaces, a number, …".</p>
  </div>
  <div class="fx" data-lang="py">RAW = [
    "Asha: 2 masala chai ₹40",
    "Ben : 3 samosa ₹45",
    "asha:1 ginger chai  ₹25",
    "Chen: 1 masala chai ₹20",
    "Dia: 2 bun maska ₹ 60",
    "Ben: 2 masala chai ₹40",
]
for l in RAW:
    print(repr(l), "-&gt;", l.split(": "))</div>
  <div class="fx" data-lang="text">'Asha: 2 masala chai ₹40' -&gt; ['Asha', '2 masala chai ₹40']
'Ben : 3 samosa ₹45' -&gt; ['Ben ', '3 samosa ₹45']
'asha:1 ginger chai  ₹25' -&gt; ['asha:1 ginger chai  ₹25']
'Chen: 1 masala chai ₹20' -&gt; ['Chen', '1 masala chai ₹20']
'Dia: 2 bun maska ₹ 60' -&gt; ['Dia', '2 bun maska ₹ 60']
'Ben: 2 masala chai ₹40' -&gt; ['Ben', '2 masala chai ₹40']</div>
  <p>"Ben " keeps a trailing space, "asha:1 …" does not split at all, and "₹ 60" would make <code>int</code> fail later.</p>
  <h3>Plain words</h3>
  <p>A <strong>regular expression</strong> (regex) is a small language for describing the shape of text. <code>\\d</code> means "one digit", <code>+</code> means "one or more of the previous thing", so <code>\\d+</code> means "a run of digits". The <code>re</code> module finds text that fits a shape.</p>
  <table class="tbl">
    <tr><th>Token</th><th>Matches</th><th>Token</th><th>Matches</th></tr>
    <tr><td><code>\\d \\w \\s</code></td><td>digit, word character (letter/digit/_), whitespace</td><td><code>+ * ?</code></td><td>1 or more, 0 or more, 0 or 1 (add <code>?</code> for the shortest match)</td></tr>
    <tr><td><code>.</code></td><td>any character except newline</td><td><code>{2,4}</code> <code>{6}</code></td><td>2 to 4 times, exactly 6</td></tr>
    <tr><td><code>^ $</code></td><td>start, end of the text</td><td><code>[A-Z]</code> <code>[^,]</code></td><td>one of these characters / any but these</td></tr>
    <tr><td><code>( )</code></td><td>capture group: the part you want back</td><td><code>(?P&lt;name&gt;…)</code></td><td>named group</td></tr>
    <tr><td><code>\\b</code></td><td>word boundary</td><td><code>a|b</code></td><td>a or b</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Telling a helper "find every 10-digit number starting with 9" in a register, instead of naming each phone number. A regex is that description written in a compact code.</p></div>
  <h3>search, findall and groups</h3>
  <div class="fx" data-lang="py">import re
text = "Ben : 3 samosa ₹45"
m = re.search(r"\\d+", text)            # first run of 1 or more digits
print(m.group(), m.start(), m.end())
print(re.findall(r"\\d+", text))        # every run of digits
print(re.findall(r"₹\\s*(\\d+)", "Dia: 2 bun maska ₹ 60"))   # group: only the part in ( )</div>
  <div class="fx" data-lang="text">3 6 7
['3', '45']
['60']</div>
  <p><code>re.search</code> returns a <em>match object</em> for the first place the shape fits: "3" at positions 6 to 7. <code>findall</code> returns every match as a list of strings: the quantity 3 and the amount 45. When the pattern has a group <code>( )</code>, findall returns only the group: <code>₹\\s*(\\d+)</code> means "₹, any spaces, then capture the digits", so "₹ 60" gives just "60".</p>
  <h3>One pattern for the whole line</h3>
  <p>Read the pattern piece by piece against "Ben : 3 samosa ₹45":</p>
  <table class="tbl">
    <tr><th>piece</th><th>meaning</th><th>matches</th></tr>
    <tr><td><code>^\\s*</code></td><td>start, optional spaces</td><td>(nothing)</td></tr>
    <tr><td><code>(\\w+)</code></td><td>group 1: the name</td><td>Ben</td></tr>
    <tr><td><code>\\s*:\\s*</code></td><td>colon with optional spaces around it</td><td>" : "</td></tr>
    <tr><td><code>(\\d+)</code></td><td>group 2: quantity</td><td>3</td></tr>
    <tr><td><code>\\s+(.+?)\\s+</code></td><td>group 3: the item, as short as possible, between spaces</td><td>samosa</td></tr>
    <tr><td><code>₹\\s*(\\d+)\\s*$</code></td><td>₹, optional spaces, group 4: amount, then the end</td><td>45</td></tr>
  </table>
  <div class="fx" data-lang="py">import re
pat = re.compile(r"^\\s*(\\w+)\\s*:\\s*(\\d+)\\s+(.+?)\\s+₹\\s*(\\d+)\\s*$")
for l in RAW:
    m = pat.search(l)
    print(m.groups())</div>
  <div class="fx" data-lang="text">('Asha', '2', 'masala chai', '40')
('Ben', '3', 'samosa', '45')
('asha', '1', 'ginger chai', '25')
('Chen', '1', 'masala chai', '20')
('Dia', '2', 'bun maska', '60')
('Ben', '2', 'masala chai', '40')</div>
  <p>All six lines parse, including the three that broke <code>split</code>. <code>.groups()</code> returns a tuple of the captured strings, ready to unpack. Note "asha" is still lowercase and the numbers are still text; the hands-on section cleans both.</p>
  <h3>Named groups</h3>
  <div class="fx" data-lang="py">pat = re.compile(r"^\\s*(?P&lt;name&gt;\\w+)\\s*:\\s*(?P&lt;qty&gt;\\d+)\\s+(?P&lt;item&gt;.+?)\\s+₹\\s*(?P&lt;amount&gt;\\d+)\\s*$")
m = pat.search("Dia: 2 bun maska ₹ 60")
print(m.group("name"), m.group("item"), int(m.group("qty")) * 30 == int(m.group("amount")))
print(m.groupdict())</div>
  <div class="fx" data-lang="text">Dia bun maska True
{'name': 'Dia', 'qty': '2', 'item': 'bun maska', 'amount': '60'}</div>
  <p><code>(?P&lt;name&gt;…)</code> gives a group a name, so <code>m.group("item")</code> (or <code>m["item"]</code>) reads better than <code>m.group(3)</code>, and <code>groupdict()</code> returns a dict. The check confirms Dia's line: 2 bun maska × ₹30 = ₹60.</p>
  <h3>match vs search vs fullmatch, and sub</h3>
  <div class="fx" data-lang="py">print(re.match(r"\\d+", "Ben : 3 samosa"))          # match only tries position 0
print(re.search(r"\\d+", "Ben : 3 samosa").group())  # search scans
print(bool(re.fullmatch(r"\\d{10}", "9876543210")), bool(re.fullmatch(r"\\d{10}", "98765 43210")))
print(re.sub(r"\\s+", " ", "asha:1 ginger chai  ₹25"))     # squeeze runs of spaces
print(re.sub(r"\\s*:\\s*", ": ", "Ben : 3 samosa ₹45"))      # normalise the colon
print(re.sub(r"₹\\s*(\\d+)", r"Rs \\1", "Dia: 2 bun maska ₹ 60"))   # \\1 = group 1</div>
  <div class="fx" data-lang="text">None
3
True False
asha:1 ginger chai ₹25
Ben: 3 samosa ₹45
Dia: 2 bun maska Rs 60</div>
  <ul>
    <li><code>re.match</code> only tries at position 0, so it returns None for "Ben : 3 samosa" (the digit is not at the start); <code>search</code> scans and finds 3.</li>
    <li><code>fullmatch</code> requires the <em>whole</em> string to fit: right for validation (a 10-digit phone number; the version with a space fails).</li>
    <li><code>re.sub(pattern, replacement, text)</code> replaces every match: squeeze runs of spaces to one, normalise the colon, or rewrite "₹ 60" as "Rs 60" where <code>\\1</code> in the replacement means "whatever group 1 captured".</li>
  </ul>
  <h3>Raw strings</h3>
  <div class="fx" data-lang="py">print(len("\\b"), len(r"\\b"), repr("\\b"), repr(r"\\b"))
print(re.findall("\\bchai\\b", "masala chai"), re.findall(r"\\bchai\\b", "masala chai"))</div>
  <div class="fx" data-lang="text">1 2 '\\x08' '\\\\b'
[] ['chai']</div>
  <p>In a normal string <code>"\\b"</code> is one character, the backspace control code (0x08), so the pattern <code>"\\bchai\\b"</code> looks for backspaces and finds nothing. In a <strong>raw string</strong> <code>r"\\b"</code> the backslash stays a backslash, and the regex engine sees "word boundary". Always write patterns as raw strings.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>regular expression</strong> is a pattern describing a set of strings. <code>re.search(p, s)</code> → first match object or None; <code>re.match</code> anchors at the start; <code>re.fullmatch</code> anchors at both ends; <code>re.findall</code> → list of matches (or of group tuples); <code>re.sub(p, repl, s)</code> → new string; <code>re.compile(p)</code> → reusable pattern object. A match object offers <code>group()</code>, <code>groups()</code>, <code>groupdict()</code>, <code>start()</code>, <code>end()</code>, <code>span()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Greedy <code>.+</code> grabs as much as it can, so <code>(.+)\\s+₹</code> would work here but <code>"(.+),"</code> on "a,b,c" captures "a,b". Use the lazy <code>.+?</code> or a class like <code>[^,]+</code>. And do not use regex where a method is clearer: <code>s.startswith("Ben")</code> beats <code>re.match("Ben", s)</code>. Regex is for shapes; HTML and JSON have real parsers.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Hands-on: Close the Day.</b> Each tool works alone. The stall's real job is one pipeline: raw text in, every collection of this group filled, a checked receipt out.</div>

  <h2 id="pst-build"><span class="num">08</span>Hands-on: Close the Day</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have built the same numbers four times in four notes: the order list, the menu dict, the customer set, the Counter and the bills. Can one short script take the messy text lines and produce all of them, checking every amount against the menu on the way?</p>
  </div>
  <p>The plan, one container per job, exactly as the map note <a class="xref" data-note="py_ds">Python Collections</a> laid out: regex to parse each line (str) → a tuple per order in a list → prices from the menu dict to check the typed amount → a set of customers → a Counter of items sold → a defaultdict of bills → an f-string receipt.</p>
  <div class="fx" data-lang="py">import re
from collections import Counter, defaultdict
menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
pat = re.compile(r"^\\s*(?P&lt;name&gt;\\w+)\\s*:\\s*(?P&lt;qty&gt;\\d+)\\s+(?P&lt;item&gt;.+?)\\s+₹\\s*(?P&lt;amount&gt;\\d+)\\s*$")

orders, problems = [], []
for l in RAW:
    m = pat.search(l)
    if not m:
        problems.append(l); continue
    name, item = m["name"].title(), " ".join(m["item"].lower().split())
    qty, amount = int(m["qty"]), int(m["amount"])
    if qty * menu[item] != amount:                       # cross-check with the dict
        problems.append(l)
    orders.append((name, item, qty))                     # list of tuples

customers = {name for name, _, _ in orders}              # set
sold = Counter()                                         # Counter
bill = defaultdict(int)                                  # defaultdict
for name, item, qty in orders:
    sold[item] += qty
    bill[name] += qty * menu[item]

print(f"{len(orders)} orders, {len(customers)} customers, problems: {problems}")
print("top seller:", sold.most_common(1))
print(f"{'customer':&lt;9}{'Rs':&gt;5}")
for who in sorted(bill, key=bill.get, reverse=True):
    print(f"{who:&lt;9}{bill[who]:&gt;5}")
print(f"{'TOTAL':&lt;9}{sum(bill.values()):&gt;5}")</div>
  <div class="fx" data-lang="text">6 orders, 4 customers, problems: []
top seller: [('masala chai', 5)]
customer    Rs
Ben         85
Asha        65
Dia         60
Chen        20
TOTAL      230</div>
  <p>Reading the output: all 6 lines parsed, 4 distinct customers, and no problems (every typed amount equals qty × menu price). Masala chai is the top seller with 5 cups. The receipt lists Ben ₹85, Asha ₹65, Dia ₹60, Chen ₹20, total ₹230, the same numbers as in every other note of the group, now computed from raw text. Cleaning matters: "asha" became "Asha" through <code>title()</code>, otherwise the set would have counted 5 customers and Asha's bill would be split in two.</p>
  <p><strong>Extend it:</strong> add a line "Esha: 2 vada pav ₹36" and see the <code>KeyError</code> from <code>menu[item]</code>; change it to <code>menu.get(item)</code> and report unknown items in <code>problems</code> instead.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Closing the till at night: read the order slips (text), file each as a record (tuple), price it from the board (dict), note who came (set), tally the items (Counter), total each tab (defaultdict) and print the day's sheet (f-string).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Parsing</strong>: turning text into structured values (here, str → tuple of str and int). <strong>Validation</strong>: checking the parsed values against known facts (amount = qty × price). Always do both before analysing data.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Not normalising text (case, spaces, Unicode form) before using it as a key splits one entity into several ("asha" vs "Asha", "bun  maska" vs "bun maska", "café" vs "café"). Normalise first, then count.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture and one table to hold every string idea together.</div>

  <h2 id="pst-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sequence rules, methods, f-strings, join, Unicode, regex: how is each one built on the others?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<defs><marker id="pst-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="220" y="8" width="220" height="44" rx="7" class="fb sb"/><text x="330" y="27" text-anchor="middle" font-size="11.5" font-weight="700">str = immutable sequence</text><text x="330" y="43" text-anchor="middle" class="tm" font-size="10">of Unicode code points</text>
<line x1="260" y1="52" x2="100" y2="88" stroke="currentColor" marker-end="url(#pst-a9)"/><line x1="330" y1="52" x2="330" y2="88" stroke="currentColor" marker-end="url(#pst-a9)"/><line x1="400" y1="52" x2="560" y2="88" stroke="currentColor" marker-end="url(#pst-a9)"/>
<rect x="10" y="90" width="180" height="44" rx="7" class="ft st"/><text x="100" y="109" text-anchor="middle" font-size="11.5" font-weight="700">index &amp; slice</text><text x="100" y="125" text-anchor="middle" class="tm" font-size="10">same as list/tuple</text>
<rect x="240" y="90" width="180" height="44" rx="7" class="fr sr"/><text x="330" y="109" text-anchor="middle" font-size="11.5" font-weight="700">immutable</text><text x="330" y="125" text-anchor="middle" class="tm" font-size="10">new string every time</text>
<rect x="470" y="90" width="180" height="44" rx="7" class="ft st"/><text x="560" y="109" text-anchor="middle" font-size="11.5" font-weight="700">code points → bytes</text><text x="560" y="125" text-anchor="middle" class="tm" font-size="10">UTF-8: ₹ = E2 82 B9</text>
<line x1="100" y1="134" x2="100" y2="168" stroke="currentColor" marker-end="url(#pst-a9)"/><line x1="300" y1="134" x2="230" y2="168" stroke="currentColor" marker-end="url(#pst-a9)"/><line x1="360" y1="134" x2="420" y2="168" stroke="currentColor" marker-end="url(#pst-a9)"/><line x1="330" y1="134" x2="330" y2="168" stroke="currentColor" marker-end="url(#pst-a9)"/>
<rect x="10" y="170" width="170" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="95" y="189" text-anchor="middle" font-size="11" font-weight="700">methods: cut by content</text><text x="95" y="205" text-anchor="middle" class="tm" font-size="10">split · strip · find · replace</text>
<rect x="190" y="170" width="90" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="235" y="189" text-anchor="middle" font-size="11" font-weight="700">hashable</text><text x="235" y="205" text-anchor="middle" class="tm" font-size="10">dict keys</text>
<rect x="290" y="170" width="90" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="335" y="189" text-anchor="middle" font-size="11" font-weight="700">join, not +</text><text x="335" y="205" text-anchor="middle" class="tm" font-size="10">O(n) vs O(n²)</text>
<rect x="390" y="170" width="120" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="450" y="189" text-anchor="middle" font-size="11" font-weight="700">f-strings</text><text x="450" y="205" text-anchor="middle" class="tm" font-size="10">values → text</text>
<line x1="95" y1="214" x2="150" y2="236" stroke="currentColor" marker-end="url(#pst-a9)"/>
<rect x="150" y="226" width="250" height="40" rx="7" class="fg sg"/><text x="275" y="244" text-anchor="middle" font-size="11" font-weight="700">regex: cut by shape</text><text x="275" y="259" text-anchor="middle" class="tm" font-size="10">when the content varies</text>
<line x1="560" y1="134" x2="560" y2="226" stroke="currentColor" marker-end="url(#pst-a9)"/>
<rect x="430" y="228" width="220" height="38" rx="7" class="fr sr"/><text x="540" y="251" text-anchor="middle" font-size="11">wrong codec → mojibake</text>
</svg><figcaption>One object, an immutable sequence of code points, explains the whole note. "Sequence" gives indexing and slicing; "immutable" gives new strings from every method, hashability, and the cost of +; "code points" gives Unicode and encodings. Methods cut by content; regex cuts by shape when content varies.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Chai Corner's order lines</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On our lines</th><th>Use when</th></tr>
    <tr><td>str as sequence</td><td>list/tuple rules</td><td>what is text?</td><td>len 23; <code>"chai" in line</code></td><td>always</td></tr>
    <tr><td>Immutability</td><td>like tuples</td><td>can it change?</td><td><code>line[0] = "a"</code> → TypeError</td><td>reason for keys and for join</td></tr>
    <tr><td>Slicing</td><td>cuts between characters</td><td>fixed positions</td><td><code>[:4]</code> Asha, <code>[8:19]</code> masala chai</td><td>fixed-width formats</td></tr>
    <tr><td>Methods</td><td>sequence + search</td><td>cut by content</td><td>("Asha", "masala chai", 2, 40); total 230</td><td>clean, regular text</td></tr>
    <tr><td>f-strings</td><td>expressions + format specs</td><td>values into text</td><td>Ben 85 37.0%</td><td>any output</td></tr>
    <tr><td>join vs +</td><td>immutability</td><td>building text fast</td><td>97 chars copied vs 26; ~20 ms vs ~0.2 ms</td><td>text built in a loop</td></tr>
    <tr><td>Unicode/UTF-8</td><td>code points + bytes</td><td>text ↔ bytes</td><td>"chai ₹": 6 chars, 8 bytes</td><td>files, network, APIs</td></tr>
    <tr><td>Normalisation</td><td>Unicode equivalence</td><td>same-looking text equal?</td><td>café 4 vs 5 code points</td><td>before comparing/keys</td></tr>
    <tr><td>Regex</td><td>a pattern language</td><td>cut by shape</td><td>all 6 messy lines parsed</td><td>varying spacing/format</td></tr>
    <tr><td>Close the day</td><td>everything above + all collections</td><td>text → data</td><td>4 customers, top masala chai 5, ₹230</td><td>any real data pipeline</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a string is an immutable sequence of code points.</strong> "Sequence" means every list skill works; "immutable" means every operation makes a new string (so join beats +, and strings make good keys); "code points" means characters are numbers that must be encoded into bytes with an agreed rule.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes</b>, then back to the group map <a class="xref" data-note="py_ds">Python Collections</a> to see all four notes side by side, and on to <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, where reading a file line by line becomes a lazy stream.</div>

  <h2 id="pst-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which string habits cause real bugs, and what does each look like?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting that methods return new strings</span><p><code>s.strip()</code> alone does nothing to s. Write <code>s = s.strip()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: + in a loop</span><p>O(n²) copying. Collect parts in a list and <code>"".join(parts)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: find in an if</span><p><code>if s.find(x):</code> is True for "not found" (−1) and False for "found at 0". Use <code>in</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: join with non-strings</span><p><code>",".join([1, 2])</code> → TypeError. Use <code>map(str, …)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: no encoding when opening files</span><p>The default codec depends on the machine; UTF-8 text read as cp1252 becomes "â‚¹". Always <code>open(path, encoding="utf-8")</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: len is not bytes</span><p>"chai ₹" is 6 characters, 8 UTF-8 bytes. Check byte limits on <code>len(s.encode())</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: not normalising before comparing</span><p>Case, extra spaces and Unicode forms make equal-looking strings unequal ("asha" vs "Asha"; café 4 vs 5 code points). <code>strip</code>, <code>lower</code>/<code>title</code>, <code>" ".join(s.split())</code>, NFC.</p></div>
  <div class="callout trap"><span class="label">Trap: regex without a raw string</span><p><code>"\\b"</code> is a backspace. Use <code>r"\\b"</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: re.match when you meant search</span><p>match only tries position 0. Use search to scan, fullmatch to validate.</p></div>
  <div class="callout trap"><span class="label">Trap: greedy .*</span><p><code>(.+),</code> captures up to the <em>last</em> comma. Use <code>.+?</code> or <code>[^,]+</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page.</div>

  <h2 id="pst-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: six order lines, "Asha: 2 masala chai ₹40", "Ben: 3 samosa ₹45", "Asha: 1 ginger chai ₹25", "Chen: 1 masala chai ₹20", "Dia: 2 bun maska ₹60", "Ben: 2 masala chai ₹40"; the messy versions "Ben : 3 samosa ₹45", "asha:1 ginger chai  ₹25", "Dia: 2 bun maska ₹ 60".</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>str sequence</td><td>what is text?</td><td>23 characters; <code>line[-3]</code> = ₹</td><td>need stretches</td></tr>
    <tr><td>Slicing</td><td>take a piece?</td><td><code>[:4]</code> Asha; <code>[8:19]</code> masala chai</td><td>positions vary per line</td></tr>
    <tr><td>Methods</td><td>cut by content?</td><td>("Asha", "masala chai", 2, 40); sum ₹230</td><td>need neat output</td></tr>
    <tr><td>f-strings</td><td>values into text?</td><td>Ben 85 37.0%</td><td>building long text is slow</td></tr>
    <tr><td>join vs +</td><td>why is + slow?</td><td>97 vs 26 characters written</td><td>what is ₹ in bytes?</td></tr>
    <tr><td>Unicode/UTF-8</td><td>text ↔ bytes?</td><td>₹ U+20B9 → E2 82 B9; 6 chars 8 bytes</td><td>messy lines break split</td></tr>
    <tr><td>Regex</td><td>parse by shape?</td><td>all 6 messy lines → groups</td><td>→ close the day</td></tr>
  </table>
  <h3>Rules and syntax</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Notes</th></tr>
    <tr><td>split / join</td><td><code>s.split(sep)</code> → list; <code>sep.join(list_of_str)</code> → str</td><td><code>split()</code> = any whitespace, no empty pieces</td></tr>
    <tr><td>find / index</td><td>position or −1 / position or ValueError</td><td>test presence with <code>in</code></td></tr>
    <tr><td>strip family</td><td><code>strip(chars)</code>, <code>lstrip</code>, <code>rstrip</code>, <code>removeprefix</code></td><td>chars = a set of characters, not a word</td></tr>
    <tr><td>Format spec</td><td><code>{x:[fill][align][width][,][.prec][type]}</code></td><td><code>.2f</code>, <code>.1%</code>, <code>&gt;6</code>, <code>,</code>, <code>03d</code>, <code>=</code>, <code>!r</code></td></tr>
    <tr><td>Concatenation cost</td><td>n pieces of length k with +: ≈ k·n(n+1)/2 copies</td><td>join: ≈ k·n</td></tr>
    <tr><td>UTF-8 sizes</td><td>1 byte ≤ U+007F, 2 ≤ U+07FF, 3 ≤ U+FFFF, 4 above</td><td>3-byte pattern 1110xxxx 10xxxxxx 10xxxxxx</td></tr>
    <tr><td>encode / decode</td><td>str → bytes / bytes → str</td><td>always name the codec</td></tr>
    <tr><td>Regex tokens</td><td><code>\\d \\w \\s . + * ? {m,n} ^ $ [ ] ( ) (?P&lt;n&gt;…) \\b</code></td><td>raw strings <code>r"…"</code></td></tr>
    <tr><td>re functions</td><td>search · match · fullmatch · findall · sub · compile</td><td>findall returns groups if any</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use methods</b><p>Regular text with fixed separators: CSV-like lines, "key: value", trimming, case changes.</p><small>Clearer and faster than regex</small></div>
    <div><b>Use regex</b><p>Text whose spacing or format varies, extracting all numbers/emails/PINs, validation with fullmatch.</p><small>Not for HTML/JSON: use a parser</small></div>
    <div><b>Use join</b><p>Any text built from many pieces, especially in a loop.</p><small>Pieces must be strings</small></div>
    <div><b>Name the encoding</b><p>Every file open, every bytes ↔ str boundary: <code>encoding="utf-8"</code> (Excel CSV: utf-8-sig).</p><small>Mojibake "â‚¹" = UTF-8 read as cp1252</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Methods return new strings; + in loops is O(n²); <code>if s.find(x)</code>; join needs strings; open() without encoding; len counts code points, not bytes; normalise case/spaces/NFC before comparing; raw strings for regex; match vs search; greedy .*.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>"Asha: 2 masala chai ₹40"[8:19]</code>?</td><td>'masala chai'</td></tr>
    <tr><td><code>"2 masala chai ₹40".split()</code>?</td><td>['2', 'masala', 'chai', '₹40']</td></tr>
    <tr><td><code>f"{85/230:.1%}"</code>?</td><td>'37.0%'</td></tr>
    <tr><td>Bytes in "chai ₹" as UTF-8, and why?</td><td>8: five ASCII bytes + 3 for ₹ (U+20B9 → E2 82 B9)</td></tr>
    <tr><td><code>re.findall(r"₹\\s*(\\d+)", "Dia: 2 bun maska ₹ 60")</code>?</td><td>['60'] (only the group)</td></tr>
  </table>

  <h2 id="pst-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why are Python strings immutable, and what does that buy us?</summary><div class="qa-body">Safety and hashing: a string can be shared by many names without anyone changing it underneath the others, and its hash never changes, so strings can be dict keys and set items. The price: every "change" builds a new string, so concatenating in a loop is O(n²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is building a string with <code>+=</code> in a loop slow? Fix?</summary><div class="qa-body">Each + makes a new string and copies everything so far: 6 names gave 97 characters written for a 27-character result; in general ≈ k·n(n+1)/2, O(n²). Append pieces to a list and <code>"".join(parts)</code> once: O(n). Measured: about 20 ms vs about 0.2 ms for 20,000 pieces.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>find</code> vs <code>index</code>?</summary><div class="qa-body">Both return the first position of a substring. find returns −1 when it is missing; index raises ValueError. Because −1 is truthy and 0 is falsy, never use find's result directly in an if; use <code>in</code> to test presence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a character, a code point and a byte?</summary><div class="qa-body">A code point is the number Unicode gives a character (₹ = U+20B9 = 8377); a Python str is a sequence of code points. Bytes are 0–255 values on disk or the network; an encoding maps code points to bytes. In UTF-8 ₹ is 3 bytes E2 82 B9, so "chai ₹" is 6 code points and 8 bytes. (What a reader sees as one "letter" can be several code points, e.g. e + combining accent.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A CSV shows <code>â‚¹</code> instead of <code>₹</code>. What happened?</summary><div class="qa-body">UTF-8 bytes (E2 82 B9) were decoded as Windows-1252: each byte became its own character (â, ‚, ¹): mojibake. Read with <code>encoding="utf-8"</code> (or "utf-8-sig" for Excel files with a BOM). Decode at the edges of your program, work in str inside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Encode ₹ (U+20B9) in UTF-8 by hand.</summary><div class="qa-body">U+20B9 = 0010 0000 1011 1001, in the 3-byte range. Pattern 1110xxxx 10xxxxxx 10xxxxxx; split the bits 4 + 6 + 6: 0010 | 000010 | 111001 → 11100010 10000010 10111001 = E2 82 B9.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>re.match</code> vs <code>re.search</code> vs <code>re.fullmatch</code>?</summary><div class="qa-body">match tries only at position 0 (None for "Ben : 3 samosa" when looking for digits); search scans for the first hit; fullmatch needs the entire string to match (validation). findall returns all matches, or only the groups if the pattern has groups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why write regex patterns as raw strings?</summary><div class="qa-body">Python processes backslash escapes in normal strings before the regex engine sees them: "\\b" becomes the backspace character, so "\\bchai\\b" finds nothing. In r"\\bchai\\b" the backslashes reach the engine, which reads \\b as a word boundary.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Format 1234567 with thousands separators, 0.37 as a percent with one decimal, and "Ben" right-aligned in 6 spaces.</summary><div class="qa-body"><code>f"{1234567:,}"</code> → 1,234,567; <code>f"{0.37:.1%}"</code> → 37.0%; <code>f"{'Ben':&gt;6}"</code> → '   Ben'.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does "strings are immutable" explain both "strings can be dict keys" and "join beats +"?</summary><div class="qa-body">Immutability means the hash of a string never changes, which is exactly the condition for being a dict key or set item (Dicts &amp; Sets). It also means a string cannot grow in place, so every + must allocate and copy, which makes repeated + quadratic and join (one allocation) linear. Same property, two consequences, just like tuples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in the close-the-day script if you skip normalisation?</summary><div class="qa-body">"asha" and "Asha" are different strings, so different hashes and different keys: the customer set would hold 5 names, Asha's bill would be split into ₹40 and ₹25, and the Counter could split items like "bun  maska" (two spaces). Text must be cleaned before it becomes a key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is slicing a string exactly like slicing a list?</summary><div class="qa-body">Both are sequences: ordered, indexed from 0, with the same <code>[start:stop:step]</code> protocol. Python implements indexing and slicing once per sequence type with the same rules (negative indices, clamped slices, stop excluded). That is why Lists &amp; Tuples comes first: strings reuse it unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use regex?</summary><div class="qa-body">When a method says it more clearly (startswith, split, in), when the format has a real parser (JSON, HTML, CSV with quoted fields: json, html.parser, csv), and when the pattern becomes unreadable. Regex is for shapes in short, irregular text.</div></details>
</main>
`
});
