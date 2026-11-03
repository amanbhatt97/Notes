// notes/python/py_values.js — Values, Types & Variables
Object.assign(TOPIC_CONTENT, {
  "py_values": `<main>
<h1>Values, Types &amp; Variables</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Values, Types &amp; Variables</span></div>
  <p class="lead">Every Python value is an <strong>object</strong> with a type, and every variable is a <strong>name bound to an object</strong>, not a box holding a copy. Getting this model wrong is the root of the classic bugs: a "copied" list that changes behind your back, <code>is</code> used where <code>==</code> was meant, a CSV column of numbers that is really text, money that drifts because floats are binary. This note covers objects and identity, the built-in scalar types, names and aliasing, mutability and hashability, type conversion (with the float, rounding and truthiness traps), and every operator family, including the element-wise operators you need for numpy and pandas filters. Code here was run on Python 3.13.</p>

  <h2 id="pv-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Values, Types &amp; Variables</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Objects</div>
        <ul>
          <li>Every value is an <b>object</b>: <b>type</b> (what kind) + <b>identity</b> (<code>id()</code>, which one) + <b>value</b></li>
          <li>Literals: <code>30</code>, <code>17.5</code>, <code>"samosa"</code>, <code>True</code>, <code>None</code></li>
          <li>Everything is an object: numbers, strings, functions, classes</li>
          <li><code>type(x)</code>, <code>id(x)</code>, <code>isinstance(x, T)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core types</div>
        <ul>
          <li><b>int</b> any size, never overflows; <b>float</b> 64-bit binary fraction</li>
          <li><b>bool</b> is a kind of int: <code>True + True == 2</code></li>
          <li><b>str</b> text (Unicode); <b>bytes</b> raw 0–255; <code>encode</code>/<code>decode</code></li>
          <li><b>None</b> = "no value yet"; test with <code>is None</code></li>
          <li>⚠ <code>"2" + 3</code> → TypeError; <code>"2" + "3"</code> → "23"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Names are labels</div>
        <ul>
          <li><code>price = 30</code> sticks the label <i>price</i> on the object 30</li>
          <li>💡 sticky note / luggage tag: two tags can hang on one bag</li>
          <li><code>b = a</code> copies the label, never the object</li>
          <li><b>Rebind</b> (<code>a = …</code>) moves one label; <b>mutate</b> (<code>a.append</code>) changes the shared object</li>
          <li><code>==</code> same value; <code>is</code> same object (same <code>id</code>)</li>
          <li>⚠ small-int cache −5…256 makes <code>is</code> look like <code>==</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mutable vs immutable</div>
        <ul>
          <li><b>Immutable</b>: int, float, bool, str, bytes, tuple, frozenset → "change" = new object, new id</li>
          <li><b>Mutable</b>: list, dict, set → edited in place, same id</li>
          <li><code>total += 45</code> on an int: new object; <code>order += [...]</code> on a list: same object</li>
          <li>Only hashable (immutable) values can be dict keys / set items</li>
          <li>⚠ a tuple holding a list: the list can still change</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Conversion &amp; its traps</div>
        <ul>
          <li><code>int("2")</code>, <code>float("17.5")</code>, <code>str(30)</code></li>
          <li><code>int(17.9)</code> → 17 (cuts toward zero); ⚠ <code>int("3.5")</code> → ValueError</li>
          <li>⚠ <code>0.1 + 0.2 == 0.3</code> is False → <code>math.isclose</code>, <code>Decimal</code> for money</li>
          <li>⚠ <code>round(52.5)</code> → 52 (halves go to even)</li>
          <li>Falsy: 0, 0.0, "", [], {}, set(), None, False; ⚠ <code>bool("False")</code> is True</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Operators</div>
        <ul>
          <li><code>/</code> float · <code>//</code> floor (toward −∞) · <code>%</code> remainder · <code>**</code> power</li>
          <li>⚠ <code>-7 // 2 == -4</code>, <code>-7 % 2 == 1</code>; rule: <code>b*(a//b) + a%b == a</code></li>
          <li>Comparison chains: <code>150 &lt;= 195 &lt; 300</code></li>
          <li><code>and</code>/<code>or</code> short-circuit and return an operand: <code>"" or "Guest"</code></li>
          <li><code>in</code>: list O(n), set/dict O(1), dict checks keys</li>
          <li>⚠ numpy/pandas: <code>&amp;</code> with brackets, not <code>and</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pv-values"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Objects: Type, Identity and Value</span><span class="rm-sub">type(), id(), literals</span></div></div>
      <div class="rm-item rm-done" data-target="pv-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Built-in Scalar Types</span><span class="rm-sub">int, float, bool, str, bytes, None</span></div></div>
      <div class="rm-item rm-done" data-target="pv-names"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Names, Assignment and Aliasing</span><span class="rm-sub">binding, rebinding, is vs ==</span></div></div>
      <div class="rm-item rm-done" data-target="pv-mut"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Mutable vs Immutable Types</span><span class="rm-sub">in-place edits, copies, hashability</span></div></div>
      <div class="rm-item rm-done" data-target="pv-conv"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Type Conversion and Its Traps</span><span class="rm-sub">floats, round(), Decimal, truthiness</span></div></div>
      <div class="rm-item rm-done" data-target="pv-ops"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Operators and Precedence</span><span class="rm-sub">// and %, and/or, in, bitwise</span></div></div>
      <div class="rm-item rm-done" data-target="pv-bill"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Worked Example: Types in One Expression</span><span class="rm-sub">int, float and bool mixed</span></div></div>
      <div class="rm-item rm-done" data-target="pv-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">aliasing, floats, text-as-number</span></div></div>
      <div class="rm-item rm-done" data-target="pv-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Condensed notes for revision</span></div></div>
      <div class="rm-item rm-done" data-target="pv-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Mutability, copying, floats, operators</span></div></div>
    </div>
  </div>

  <h2 id="pv-values"><span class="num">01</span>Objects: Type, Identity and Value</h2>
  <h3>Values and Literals</h3>
  <p>A <strong>value</strong> is one piece of data: the number 30, the text "masala chai". When you type a value straight into code, it is called a <strong>literal</strong>. <code>print()</code> shows values on the screen.</p>
  <div class="fx" data-lang="py">print(30)                      # the price of a masala chai
print(15, 20, 90)              # samosa, vada pav, cold coffee
print("masala chai")           # a piece of text
print(17.5)                    # a number with a decimal point
print(True, None)              # a yes/no answer, and "nothing yet"
print(2 * 30 + 3 * 15 + 1 * 90)   # an expression: 2 chai + 3 samosa + 1 cold coffee</div>
  <div class="fx" data-lang="text">30
15 20 90
masala chai
17.5
True None
195</div>
  <p>The last line is an <strong>expression</strong>: Python evaluates 2 × 30 + 3 × 15 + 1 × 90 to a new value, 195. <code>None</code> is a real value meaning "nothing here (yet)".</p>
  <p>Inside Python, every value lives in memory as an <strong>object</strong>: a block of memory that knows what kind of thing it is. Every object carries exactly three facts:</p>
  <table class="tbl"><caption>The three facts every object has, for the object "samosa"</caption>
    <tr><th>Fact</th><th>Asks</th><th>How to see it</th><th>For "samosa"</th><th>Can it change?</th></tr>
    <tr><td><b>Type</b></td><td>What kind of thing is it? What can it do?</td><td><code>type(x)</code></td><td><code>str</code> (text)</td><td>Never</td></tr>
    <tr><td><b>Identity</b></td><td>Which object is it, exactly?</td><td><code>id(x)</code></td><td>a long number (its address in memory)</td><td>Never</td></tr>
    <tr><td><b>Value</b></td><td>What does it hold?</td><td><code>print(x)</code></td><td>the letters s-a-m-o-s-a</td><td>Only for mutable types</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Think of a product on a shop shelf. Its <b>type</b> is the category printed on the box ("biscuits", "soap"), which decides what you can do with it (eat it, wash with it). Its <b>identity</b> is the unique barcode serial on that one packet: two identical packets have different serials. Its <b>value</b> is what is inside.</p></div>
  <p>The code asks the object "samosa" for its three facts, and then uses two things its type allows (<code>len</code> counts letters, <code>.upper()</code> gives capitals, <code>+</code> joins text).</p>
  <div class="fx" data-lang="py">item = "samosa"
print(type(item))     # 1. what kind of object: its type
print(id(item))       # 2. which object: its identity (a number)
print(item)           # 3. what it holds: its value
print(len(item), item.upper(), item + "s")</div>
  <div class="fx" data-lang="text">&lt;class 'str'&gt;
140001891281024
samosa
6 SAMOSA samosas</div>
  <p>The id number will be different on your machine and on every run: it is just where the object happened to be placed in memory. What matters is that one object keeps one id for its whole life, so <em>equal ids mean the same object</em>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>object</strong> is a piece of data in memory. Every object has a <strong>type</strong> (fixed; decides which operations work), an <strong>identity</strong> (fixed; <code>id()</code>, in CPython its memory address) and a <strong>value</strong>. In Python, everything is an object: numbers, text, lists, even functions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not write down an id and expect to see it again. Ids are only meaningful while the object is alive, and Python may reuse the number for a new object after the old one is gone. Compare ids, or better, use <code>is</code>.</p></div>

  <h2 id="pv-types"><span class="num">02</span>Built-in Scalar Types</h2>
  <p>A <strong>type</strong> tells Python what kind of value something is, and so what you can do with it. You can add two numbers. You can make text uppercase. You cannot make a number uppercase. Python has five types you will use in every program:</p>
  <table class="tbl"><caption>The five basic types</caption>
    <tr><th>Type</th><th>What it is</th><th>Example</th><th>What it can do</th><th>Gotcha</th></tr>
    <tr><td><code>int</code></td><td>A whole number, any size</td><td>price 30, quantity 3</td><td>+ − × ÷, compare</td><td>Never overflows, but slower than numpy's int64</td></tr>
    <tr><td><code>float</code></td><td>A number with a decimal point (64-bit binary)</td><td>discount 19.5, tax 8.775</td><td>maths, compare</td><td>0.1 has no exact binary form</td></tr>
    <tr><td><code>bool</code></td><td>Yes/no: <code>True</code> or <code>False</code></td><td>"gets a discount?" → True</td><td><code>and</code>, <code>or</code>, <code>not</code>, decisions</td><td>It is secretly an int: True = 1, False = 0</td></tr>
    <tr><td><code>str</code></td><td>Text: a sequence of Unicode characters</td><td>"masala chai"</td><td>join, repeat, <code>.upper()</code>, search</td><td><code>"30"</code> is text, not a number</td></tr>
    <tr><td><code>NoneType</code></td><td>The single value <code>None</code>: "nothing / not yet"</td><td>discount not decided yet</td><td>be tested with <code>is None</code></td><td>Functions with no <code>return</code> give None</td></tr>
  </table>
  <p>Read the code below line by line before looking at the output. The same operator <code>*</code> means "multiply" for two ints but "repeat" for text and an int. The type of the left value decides.</p>
  <div class="fx" data-lang="py">print(type(30), type(17.5), type("30"), type(True), type(None))
qty = 3
price = 15
print(qty * price)        # int * int: maths
print("15" * 3)           # str * int: repeat the text
print(7 / 2, 6 / 2)       # / always gives a float
print(2 ** 100)           # ints never overflow
print(True + True, isinstance(True, int))</div>
  <div class="fx" data-lang="text">&lt;class 'int'&gt; &lt;class 'float'&gt; &lt;class 'str'&gt; &lt;class 'bool'&gt; &lt;class 'NoneType'&gt;
45
151515
3.5 3.0
1267650600228229401496703205376
2 True</div>
  <ul>
    <li><code>&lt;class 'int'&gt;</code> is how Python names a type. "Class" is Python's word for a type (you will build your own in <a class="xref" data-note="py_oop">OOP</a>).</li>
    <li><code>"15" * 3</code> gives <code>151515</code>: the text repeated three times, not 45.</li>
    <li><code>/</code> always gives a float, even for 6 / 2 = 3.0. (Whole-number division is <code>//</code>.)</li>
    <li><code>2 ** 100</code> is a 31-digit number, printed exactly. Python ints grow as large as memory allows.</li>
    <li><code>True + True</code> is 2, and <code>isinstance(True, int)</code> says a bool <em>is</em> an int. That is why <code>sum([True, False, True])</code> counts the Trues (2).</li>
  </ul>
  <h3>Strong Typing: str + int Raises TypeError</h3>
  <p>Everything that comes from outside the program (a form, a file, <code>input()</code>, a CSV column read without a parser) arrives as <strong>text</strong>. Python will not silently treat it as a number.</p>
  <div class="fx" data-lang="py">qty_text = "2"            # what a form, a file or input() gives you: text
print(qty_text + "3")     # text + text = joined text
print(int(qty_text) + 3)  # convert first, then do maths
try:
    print(qty_text + 3)   # text + number: Python refuses to guess
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">23
5
TypeError: can only concatenate str (not "int") to str</div>
  <p>Line 1: two texts joined, "2" + "3" = "23", silently wrong. Line 2: convert with <code>int()</code> first, then add: 5. Line 3: text + number is refused with a <code>TypeError</code>, because Python will not guess whether you meant "23" or 5. This refusal is called <strong>strong typing</strong>: Python never quietly changes a type for you (JavaScript would give "23").</p>
  <h3>None</h3>
  <p>Sometimes a name must exist before its value is known. Python's marker for "no value" is the special object <code>None</code>. It is the only value of its type, so we test for it with <code>is None</code>.</p>
  <div class="fx" data-lang="py">discount = None                     # "not decided yet"
print(discount, type(discount).__name__, discount is None)
result = print("printing returns nothing...")
print(result)                       # ...so result is None</div>
  <div class="fx" data-lang="text">None NoneType True
printing returns nothing...
None</div>
  <p>The second half shows where beginners meet <code>None</code> without asking for it: <code>print</code> shows text on the screen but gives back nothing, so <code>result</code> is <code>None</code>. You will meet this again as "the function that returns None" in <a class="xref" data-note="py_functions">Functions</a>.</p>
  <h3>str vs bytes</h3>
  <p><code>str</code> is text for humans, like "café". But files and the network only carry raw numbers 0–255, called <code>bytes</code>. <strong>Encoding</strong> is the rule that turns text into bytes; UTF-8 is the common one. <code>encode</code> turns text into bytes; <code>decode</code> turns bytes back. The "é" needs two bytes in UTF-8, so the text has 4 characters but 5 bytes.</p>
  <div class="fx" data-lang="py">s = "café"
b = s.encode("utf-8")
print(len(s), len(b), b)
print(b.decode("utf-8"))</div>
  <div class="fx" data-lang="text">4 5 b'caf\\xc3\\xa9'
café</div>
  <p>You rarely touch bytes directly until you read files or call web APIs; <a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a> picks this up.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>type</strong> (class) defines a set of values and the operations allowed on them. The basic built-in types are <code>int</code>, <code>float</code>, <code>bool</code> (a subtype of int), <code>str</code>, <code>bytes</code> and <code>NoneType</code>. <code>type(x)</code> returns the type; <code>isinstance(x, T)</code> asks "is x a T (or a subtype of T)?". Python is <strong>strongly typed</strong> (no silent conversions between unrelated types) and <strong>dynamically typed</strong> (types belong to objects, not to names).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Data read from outside is text. <code>"2" + "3"</code> is "23" and <code>"15" * 3</code> is "151515" with no error at all. Convert at the boundary: <code>qty = int(qty_text)</code> as soon as the text arrives.</p></div>

  <h2 id="pv-names"><span class="num">03</span>Names, Assignment and Aliasing</h2>
  <p>In school maths, <code>x = 5</code> means "x is 5". Many people imagine a variable as a box with the value inside. In Python that picture is wrong, and it causes real bugs.</p>
  <p>In Python, the value is an object somewhere in memory. A variable is only a <strong>name</strong> that points to an object. The name does not hold the value; it is a label stuck on it. <code>price_chai = 30</code> is read right to left: "make (or find) the object 30, then stick the label <i>price_chai</i> on it." This pointing is called a <strong>reference</strong>, and attaching a name is called <strong>binding</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A variable is a sticky note (or a luggage tag), not a box. Two sticky notes can be stuck on one jar. Moving a note to another jar does not move the jar, and does not affect the other note.</p></div>
  <h3>Rebinding a Name</h3>
  <p>Bind a second name to the same int, then rebind the first name. The table shows what each name points at after each line.</p>
  <table class="tbl"><caption>Trace: names → objects after each line</caption>
    <tr><th>Step</th><th>Line</th><th>What Python does</th><th>price_chai →</th><th>old_price →</th></tr>
    <tr><td>1</td><td><code>price_chai = 30</code></td><td>object 30; stick label <i>price_chai</i> on it</td><td>30</td><td>(no such name)</td></tr>
    <tr><td>2</td><td><code>old_price = price_chai</code></td><td>look up what price_chai points at (30); stick a second label on the <b>same</b> object</td><td>30</td><td>30 (same object)</td></tr>
    <tr><td>3</td><td><code>price_chai = 35</code></td><td>object 35; <b>move</b> the label price_chai to it</td><td>35</td><td>30 (unchanged)</td></tr>
  </table>
  <div class="fx" data-lang="py">price_chai = 30
old_price = price_chai        # a second label on the same object 30
print(price_chai is old_price, id(price_chai) == id(old_price))
price_chai = 35               # the price goes up: move ONE label
print(price_chai, old_price)
print(id(price_chai) == id(old_price))</div>
  <div class="fx" data-lang="text">True True
35 30
False</div>
  <p>After step 2, <code>is</code> is True and the ids are equal: one object, two labels. After step 3 the ids differ: <code>price_chai</code> moved, <code>old_price</code> did not. Assignment never copies an object and never changes one; it only moves a label.</p>
  <h3>Mutating vs Rebinding</h3>
  <p>With a list (an ordered collection, written with square brackets; full story in <a class="xref" data-note="py_ds">Data Structures</a>), something new can happen. You can change the list itself, for example add an item, without moving any label. This is called <strong>mutating</strong> it. Moving a label to a different object is called <strong>rebinding</strong>. Here two names share one list:</p>
  <table class="tbl"><caption>Trace: mutate vs rebind</caption>
    <tr><th>Step</th><th>Line</th><th>Kind</th><th>order →</th><th>kitchen →</th></tr>
    <tr><td>1</td><td><code>order = ["chai", "chai", "samosa"]</code></td><td>bind</td><td>list L1</td><td>—</td></tr>
    <tr><td>2</td><td><code>kitchen = order</code></td><td>bind (same object)</td><td>L1</td><td>L1</td></tr>
    <tr><td>3</td><td><code>order.append("cold coffee")</code></td><td><b>mutate</b> L1</td><td>L1 = [chai, chai, samosa, cold coffee]</td><td>L1 (sees the change)</td></tr>
    <tr><td>4</td><td><code>order = ["vada pav"]</code></td><td><b>rebind</b> order</td><td>new list L2</td><td>L1 (unchanged)</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="pv-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="18" class="tm">after step 3: kitchen = order ; order.append(...)</text>
    <rect x="10" y="40" width="64" height="26" rx="5" class="fb sb"/><text x="20" y="58">order</text>
    <rect x="10" y="96" width="64" height="26" rx="5" class="fb sb"/><text x="16" y="114">kitchen</text>
    <rect x="120" y="62" width="170" height="36" rx="6" class="fg sg"/><text x="128" y="85" font-size="11">[chai, chai, samosa, coffee]</text>
    <line x1="74" y1="53" x2="118" y2="74" stroke="currentColor" marker-end="url(#pv-ah)"/>
    <line x1="74" y1="109" x2="118" y2="88" stroke="currentColor" marker-end="url(#pv-ah)"/>
    <text x="320" y="18" class="tm">after step 4: order = ["vada pav"]</text>
    <rect x="320" y="40" width="64" height="26" rx="5" class="fb sb"/><text x="330" y="58">order</text>
    <rect x="320" y="96" width="64" height="26" rx="5" class="fb sb"/><text x="326" y="114">kitchen</text>
    <rect x="430" y="30" width="100" height="34" rx="6" class="fv"/><text x="440" y="52">[vada pav]</text>
    <rect x="420" y="96" width="170" height="34" rx="6" class="fg sg"/><text x="428" y="118" font-size="11">[chai, chai, samosa, coffee]</text>
    <line x1="384" y1="53" x2="428" y2="48" stroke="currentColor" marker-end="url(#pv-ah)"/>
    <line x1="384" y1="109" x2="418" y2="112" stroke="currentColor" marker-end="url(#pv-ah)"/>
    <text x="10" y="160" class="tg">mutation: both names see it</text>
    <text x="320" y="160" class="tb">rebinding: only order moves</text>
  </svg><figcaption>Assignment never copies. It sticks one more label on the same object.</figcaption></figure>
  <div class="fx" data-lang="py">order = ["chai", "chai", "samosa"]
kitchen = order                  # the kitchen gets the SAME slip
print(order is kitchen, id(order) == id(kitchen))
order.append("cold coffee")      # mutate: both names see it
print(kitchen)
order = ["vada pav"]             # rebind: only the label order moves
print(kitchen)
fresh = ["chai", "chai", "samosa", "cold coffee"]
print(kitchen == fresh, kitchen is fresh)   # equal values, different objects</div>
  <div class="fx" data-lang="text">True True
['chai', 'chai', 'samosa', 'cold coffee']
['chai', 'chai', 'samosa', 'cold coffee']
True False</div>
  <p>The last line asks two different questions about two names. <code>==</code> asks "do they hold the same value?" (it calls the object's <code>__eq__</code> method, the method that defines "equal"). <code>is</code> asks "are they the very same object?". <code>kitchen</code> and <code>fresh</code> hold equal values but are two different list objects.</p>
  <h3><code>==</code> vs <code>is</code></h3>
  <table class="tbl">
    <tr><th>Check</th><th>Asks</th><th>Use for</th></tr>
    <tr><td><code>a == b</code></td><td>Same value? (calls <code>__eq__</code>)</td><td>Almost everything</td></tr>
    <tr><td><code>a is b</code></td><td>Same object? (same <code>id</code>)</td><td><code>x is None</code>, "is this the very same list?"</td></tr>
  </table>
  <div class="fx" data-lang="py">x = int("1000"); y = int("1000")
print(x == y, x is y)          # 1000 is not cached
s = int("7"); t = int("7")
print(s is t)                  # -5..256 are cached: an implementation detail
coupon = None
print(coupon is None, coupon == None)</div>
  <div class="fx" data-lang="text">True False
True
True True</div>
  <p>Line 1: two separately made 1000s are equal but not the same object. Line 2: two separately made 7s <em>are</em> the same object, because CPython keeps one shared copy of every small int from −5 to 256 to save memory. That is a speed trick of one implementation, not a rule of the language. Line 3: for <code>None</code> both work, but <code>is None</code> is the correct style, because a class can redefine <code>==</code> while nothing can fake identity.</p>
  <h3>Rules for names</h3>
  <ul>
    <li>Letters, digits and <code>_</code>; must not start with a digit; case matters (<code>Price</code> ≠ <code>price</code>).</li>
    <li>Cannot be a <strong>keyword</strong> (a word Python reserves: <code>if</code>, <code>for</code>, <code>class</code>, <code>def</code>, <code>None</code>, …).</li>
    <li>Style (PEP 8): <code>snake_case</code> for variables, <code>UPPER_CASE</code> for constants like <code>GST_RATE = 0.05</code>.</li>
    <li>Several names in one line: <code>chai, samosa = 30, 15</code>. Swapping needs no temporary name: <code>a, b = b, a</code>.</li>
  </ul>
  <div class="fx" data-lang="py">chai, samosa = 30, 15          # two names in one line
print(chai, samosa)
chai, samosa = samosa, chai    # swap without a temporary name
print(chai, samosa)
thing = 30
print(type(thing).__name__)
thing = "thirty"               # the same name can label any type
print(type(thing).__name__)
for bad in ["2nd_price = 5", "class = 5", "cold coffee = 90"]:
    try:
        compile(bad, "&lt;bad&gt;", "exec")
    except SyntaxError as e:
        print(repr(bad), "-&gt;", "SyntaxError:", e.msg)</div>
  <div class="fx" data-lang="text">30 15
15 30
int
str
'2nd_price = 5' -&gt; SyntaxError: invalid decimal literal
'class = 5' -&gt; SyntaxError: invalid syntax
'cold coffee = 90' -&gt; SyntaxError: invalid syntax</div>
  <p>The middle part shows <strong>dynamic typing</strong>: the name <code>thing</code> first labels an int, then a str. The type belongs to the object, not to the name; a name is just a label and can be moved to any object. The last part tries three bad names and shows the error Python gives for each.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>variable</strong> (name) is a reference to an object. <strong>Assignment</strong> <code>name = expression</code> evaluates the right side to an object and binds the name to it; it never copies. <strong>Rebinding</strong> moves a name to another object; <strong>mutating</strong> changes an object in place, visible through every name bound to it. Several names bound to one object are <strong>aliases</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>b = a</code> does not make a copy. If the object is mutable, a change through <code>b</code> shows through <code>a</code>. And <code>is</code> sometimes "works" for values by luck (small ints, some short strings). Use <code>==</code> for values; use <code>is</code> only for <code>None</code>, <code>True</code>, <code>False</code> and "same object" questions.</p></div>

  <h2 id="pv-mut"><span class="num">04</span>Mutable vs Immutable Types</h2>
  <p>Whether a change made through one name is visible through another depends on one property of the object's type: can it be modified in place? Python splits objects into two kinds.</p>
  <ul>
    <li><strong>Mutable</strong> — "can change". The same object can be edited in place; its id stays the same. Lists, dicts and sets are mutable.</li>
    <li><strong>Immutable</strong> — "can never change". Any "change" builds a brand-new object, and the name is moved to it; the id changes. Numbers, strings, tuples and bools are immutable.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Immutable is a printed receipt: to "change" the amount you print a new receipt and throw the label onto it. Mutable is the waiter's order pad: same pad, new lines written on it.</p></div>
  <h3>Immutable: += on an int</h3>
  <p>A running total starts at 60; then 45 is added.</p>
  <table class="tbl"><caption>Trace: total += 45 on an int</caption>
    <tr><th>Step</th><th>Line</th><th>Objects in memory</th><th>total →</th><th>Same id as before?</th></tr>
    <tr><td>1</td><td><code>total = 60</code></td><td>60</td><td>60</td><td>—</td></tr>
    <tr><td>2</td><td><code>total += 45</code></td><td>60 (untouched), 105 (new)</td><td>105</td><td><b>No</b>: a new object</td></tr>
  </table>
  <div class="fx" data-lang="py">total = 60
before = id(total)
total += 45                       # ints are immutable: a NEW object 105
print(total, id(total) == before)</div>
  <div class="fx" data-lang="text">105 False</div>
  <p>The object 60 was never edited; it cannot be. Python computed 60 + 45, made a new object 105, and moved the label. Any other name still pointing at 60 would still see 60.</p>
  <h3>Mutable: append, += and + on a list</h3>
  <table class="tbl"><caption>Trace: three ways to grow an order list</caption>
    <tr><th>Step</th><th>Line</th><th>order holds</th><th>Same id as the start?</th><th>Why</th></tr>
    <tr><td>1</td><td><code>order = ["chai"]</code></td><td>[chai]</td><td>— (start)</td><td></td></tr>
    <tr><td>2</td><td><code>order.append("samosa")</code></td><td>[chai, samosa]</td><td><b>Yes</b></td><td>a method that edits in place</td></tr>
    <tr><td>3</td><td><code>order += ["cold coffee"]</code></td><td>[chai, samosa, cold coffee]</td><td><b>Yes</b></td><td>for lists, += extends in place</td></tr>
    <tr><td>4</td><td><code>order = order + ["vada pav"]</code></td><td>[…, vada pav]</td><td><b>No</b></td><td><code>+</code> builds a new list; <code>=</code> rebinds</td></tr>
  </table>
  <div class="fx" data-lang="py">order = ["chai"]
before = id(order)
order.append("samosa")            # lists are mutable: same object, edited
print(order, id(order) == before)
order += ["cold coffee"]          # += on a list also edits in place
print(order, id(order) == before)
order = order + ["vada pav"]      # x = x + [...] builds a NEW list
print(order, id(order) == before)</div>
  <div class="fx" data-lang="text">['chai', 'samosa'] True
['chai', 'samosa', 'cold coffee'] True
['chai', 'samosa', 'cold coffee', 'vada pav'] False</div>
  <p>Steps 3 and 4 look like the same maths but are not: <code>+=</code> on a list edits the list (anyone sharing it sees the change), while <code>x = x + [...]</code> makes a fresh list. For an int, both forms make a new object, because an int cannot be edited.</p>
  <h3>Aliasing and .copy()</h3>
  <p>Two names on one list see each other's edits. For an independent list, make a real copy with <code>.copy()</code> (or <code>list(x)</code>, <code>x[:]</code>).</p>
  <div class="fx" data-lang="py">cart = ["chai", "samosa"]
my_cart = cart            # same list, two names
my_cart.append("vada pav")
print(cart)
copy_cart = cart.copy()   # a real second list
copy_cart.append("cold coffee")
print(cart, copy_cart)</div>
  <div class="fx" data-lang="text">['chai', 'samosa', 'vada pav']
['chai', 'samosa', 'vada pav'] ['chai', 'samosa', 'vada pav', 'cold coffee']</div>
  <p>Strings are immutable, so string methods never change the string. They return a new one. If you do not keep it by binding a name to it, it is lost.</p>
  <div class="fx" data-lang="py">item = "samosa"
item.upper()           # makes a NEW string; nobody keeps it
print(item)
item = item.upper()    # keep the new string by moving the label
print(item)</div>
  <div class="fx" data-lang="text">samosa
SAMOSA</div>
  <p>The picture shows the difference for <code>+=</code>. For the string, <code>+=</code> built a new object and moved the label. For the list, <code>+=</code> edited the same object.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="pv-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="18" class="tr">immutable: s += "!"</text>
    <rect x="10" y="40" width="34" height="24" rx="5" class="fb sb"/><text x="22" y="57">s</text>
    <rect x="110" y="30" width="110" height="30" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="122" y="50" class="tm">"hi" id=A</text>
    <rect x="110" y="80" width="110" height="30" rx="6" class="fg sg"/><text x="122" y="100">"hi!" id=B</text>
    <line x1="44" y1="54" x2="108" y2="90" stroke="currentColor" marker-end="url(#pv-ah2)"/>
    <text x="10" y="135" class="tm">new object, label moved</text>
    <text x="300" y="18" class="tg">mutable: L += [2]</text>
    <rect x="300" y="55" width="34" height="24" rx="5" class="fb sb"/><text x="312" y="72">L</text>
    <rect x="400" y="50" width="130" height="34" rx="6" class="fg sg"/><text x="412" y="72">[1, 2] id=C</text>
    <line x1="334" y1="67" x2="398" y2="67" stroke="currentColor" marker-end="url(#pv-ah2)"/>
    <text x="300" y="135" class="tm">same object, contents changed</text>
  </svg><figcaption>Immutable "changes" create a new object. Mutable changes edit the same one.</figcaption></figure>
  <h3>Hashability: Why Dict Keys Must Be Immutable</h3>
  <p>Lists must change cheaply, or every append would copy the whole list. But some values must <em>never</em> change. A dict (a lookup table, like the menu: name → price) files each key by a fixed number computed from it, called its <strong>hash</strong>. If a key could change after being filed, the dict would look in the wrong place and lose it. So only objects whose value can never change are <strong>hashable</strong> and allowed as dict keys and set items.</p>
  <div class="fx" data-lang="py">prices = {("chai", "large"): 40, "samosa": 15}   # tuple and str keys: fine
print(prices[("chai", "large")], hash("samosa") == hash("samosa"))
try:
    bad = {["chai", "large"]: 40}                # a list cannot be a key
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">40 True
TypeError: unhashable type: 'list'</div>
  <div class="cards">
    <div><b>Immutable</b><p>int, float, bool, str, bytes, tuple, frozenset, None</p><small>Hashable → dict keys, set items; safe to share between names</small></div>
    <div><b>Mutable</b><p>list, dict, set, bytearray, most objects of your own classes</p><small>Edited in place → watch for shared names</small></div>
  </div>
  <div class="callout pred"><span class="label">Predict the output</span><p>A tuple (an immutable sequence, written with round brackets) holds a list. Can you change it?</p></div>
  <div class="fx" data-lang="py">t = (["chai"], 30)
t[0].append("samosa")          # the list inside is mutable
print(t)
try:
    t[0] += ["vada pav"]       # list grows, THEN tuple item assignment fails
except TypeError as e:
    print("TypeError:", e)
print(t)</div>
  <div class="fx" data-lang="text">(['chai', 'samosa'], 30)
TypeError: 'tuple' object does not support item assignment
(['chai', 'samosa', 'vada pav'], 30)</div>
  <p>What happened in the last two lines: <code>t[0] += ["vada pav"]</code> is two steps. Step 1, the list extends itself (this works, lists are mutable). Step 2, Python tries to put the list back into slot 0 of the tuple (this fails, because tuples cannot change). So you get an error <em>and</em> a changed list.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>An object is <strong>mutable</strong> if its value can change while its identity stays the same (list, dict, set, bytearray); otherwise it is <strong>immutable</strong> (int, float, bool, str, bytes, tuple, frozenset, None). Operations that "modify" an immutable object return a new object. An object is <strong>hashable</strong> if it has a hash that never changes during its lifetime; only hashable objects can be dict keys or set items.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Immutability is only one level deep. A tuple cannot swap its items, but a list inside it can still change, and such a tuple cannot be a dict key. And <code>b = a</code> plus <code>b.append(...)</code> changes <code>a</code>'s list; copy first (<code>a.copy()</code>; nested data needs <code>copy.deepcopy</code>, see <a class="xref" data-note="py_ds">Data Structures</a>).</p></div>

  <h2 id="pv-conv"><span class="num">05</span>Type Conversion and Its Traps</h2>
  <p>Data arrives as the wrong type all the time: numbers as text from forms and files, floats that must become whole amounts, flags sent as the string "False". Conversion is easy; the traps are in what it silently does.</p>
  <p>To convert, call the type like a function: <code>int(x)</code>, <code>float(x)</code>, <code>str(x)</code>, <code>bool(x)</code>, <code>list(x)</code>, <code>tuple(x)</code>. Each builds a <em>new</em> object of that type from the old one. Python never does it for you between text and numbers, but it does mix int and float automatically in maths (<code>195 * 0.9</code> is a float).</p>
  <div class="fx" data-lang="py">print(int("2"), float("17.5"), str(30) + " rupees", float(30))
print(int(17.9), int(-17.9))          # int() cuts toward zero
try:
    int("3.5")                        # text that is not a whole number
except ValueError as e:
    print("ValueError:", e)
print(int(float("3.5")), round(float("3.5")))
print(list("chai"), tuple([30, 15]), str([30, 15]))</div>
  <div class="fx" data-lang="text">2 17.5 30 rupees 30.0
17 -17
ValueError: invalid literal for int() with base 10: '3.5'
3 4
['c', 'h', 'a', 'i'] (30, 15) [30, 15]</div>
  <table class="tbl"><caption>What each conversion did</caption>
    <tr><th>Call</th><th>Result</th><th>Rule</th></tr>
    <tr><td><code>int("2")</code></td><td>2</td><td>text of a whole number → int</td></tr>
    <tr><td><code>float("17.5")</code></td><td>17.5</td><td>text of a decimal → float</td></tr>
    <tr><td><code>str(30) + " rupees"</code></td><td>"30 rupees"</td><td>anything → its text form</td></tr>
    <tr><td><code>int(17.9)</code>, <code>int(-17.9)</code></td><td>17, −17</td><td>float → int <b>cuts toward zero</b>; it does not round</td></tr>
    <tr><td><code>int("3.5")</code></td><td>ValueError</td><td><code>int()</code> on text accepts only whole-number text</td></tr>
    <tr><td><code>int(float("3.5"))</code></td><td>3</td><td>two steps: text → float → int (cut)</td></tr>
    <tr><td><code>list("chai")</code></td><td>['c','h','a','i']</td><td>a string is a sequence of characters</td></tr>
  </table>
  <h3>Floating-Point Precision</h3>
  <p>A float is stored in base 2 (only 0s and 1s). Most decimals, like 0.1, cannot be written exactly in base 2, so the computer stores the nearest binary fraction and a tiny error appears at the end.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Write 1/3 in decimal: 0.3333… You must stop somewhere, so 1/3 + 1/3 + 1/3 written that way gives 0.9999, not 1. Computers have the same problem with 0.1 in binary.</p></div>
  <div class="fx" data-lang="py">print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
import math
print(math.isclose(0.1 + 0.2, 0.3))
print(1.1 + 2.2, 0.1 * 3)
print(f"{0.1:.20f}")             # what is really stored for 0.1</div>
  <div class="fx" data-lang="text">0.30000000000000004
False
True
3.3000000000000003 0.30000000000000004
0.10000000000000000555</div>
  <p>The last line prints 0.1 to 20 places: the stored number is slightly more than 0.1. Two such errors add up to 0.30000000000000004, which is not equal to the (also slightly wrong) 0.3. <code>math.isclose</code> asks "are these nearly equal?", which is the right question for floats.</p>
  <h3>round(): Banker's Rounding and Decimal</h3>
  <p>Python's <code>round()</code> uses <strong>banker's rounding</strong> (round half to even): an exact half goes to the nearest <em>even</em> number, so that over many numbers the rounding errors cancel instead of always pushing up. Three bills after a 10%-at-₹150 discount and 5% tax:</p>
  <table class="tbl"><caption>Three bills before rounding</caption>
    <tr><th>Bill</th><th>Subtotal</th><th>After discount</th><th>+ 5% GST</th><th><code>round()</code></th><th>"School" rounding (half up)</th></tr>
    <tr><td>A</td><td>195</td><td>175.5</td><td>184.275</td><td>184</td><td>184</td></tr>
    <tr><td>B</td><td>70</td><td>70</td><td>73.5</td><td>74 (74 is even)</td><td>74</td></tr>
    <tr><td>C</td><td>50</td><td>50</td><td>52.5</td><td><b>52</b> (52 is even)</td><td><b>53</b></td></tr>
  </table>
  <div class="fx" data-lang="py">print(round(184.275), round(73.5), round(52.5))   # halves go to the EVEN number
print(round(2.5), round(3.5), round(-2.5))
print(round(2.675, 2))           # 2.675 is stored as 2.67499999...
from decimal import Decimal, ROUND_HALF_UP
print(Decimal("0.1") + Decimal("0.2"))
print(Decimal("52.5").quantize(Decimal("1"), rounding=ROUND_HALF_UP))
print(Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
print(Decimal(0.1))              # built from a float: the error comes along</div>
  <div class="fx" data-lang="text">184 74 52
2 4 -2
2.67
0.3
53
2.68
0.1000000000000000055511151231257827021181583404541015625</div>
  <p>Line by line: 52.5 rounds to 52, not 53. <code>round(2.675, 2)</code> gives 2.67 because 2.675 is really stored as 2.67499999…, so even "half up" logic would see less than a half. <code>Decimal</code> stores numbers in base 10, the way we write them: <code>Decimal("0.1") + Decimal("0.2")</code> is exactly 0.3, and <code>quantize(..., ROUND_HALF_UP)</code> rounds the way a till expects (52.5 → 53). The last line shows why Decimal must be built from <em>text</em>: built from the float 0.1, it faithfully copies the float's error.</p>
  <h3>Truthiness: bool() of Any Value</h3>
  <p>Every value can be asked "are you true?" with <code>bool(x)</code>, and <code>if</code>/<code>while</code> ask this automatically. The rule is simple: <strong>empty or zero is False, everything else is True</strong>.</p>
  <div class="fx" data-lang="py">for v in [0, 195, 0.0, "", "False", " ", [], ["chai"], {}, None]:
    print(repr(v), "-&gt;", bool(v))</div>
  <div class="fx" data-lang="text">0 -&gt; False
195 -&gt; True
0.0 -&gt; False
'' -&gt; False
'False' -&gt; True
' ' -&gt; True
[] -&gt; False
['chai'] -&gt; True
{} -&gt; False
None -&gt; False</div>
  <p>The surprise is <code>"False"</code> → True and <code>" "</code> (one space) → True: both are non-empty text. <code>bool()</code> never reads the words. When a form sends "False", compare the text instead:</p>
  <div class="fx" data-lang="py">answer = "False"                     # read from a form
print(bool(answer))                  # non-empty text is always True
print(answer.strip().lower() in {"1", "true", "yes"})</div>
  <div class="fx" data-lang="text">True
False</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Type conversion</strong> builds a new object of the target type: <code>int(x)</code> (from float: truncate toward zero; from str: whole-number text only), <code>float(x)</code>, <code>str(x)</code>, <code>bool(x)</code>. <strong>Truthiness</strong>: <code>bool(x)</code> is False for <code>False</code>, <code>None</code>, numeric zero (0, 0.0) and empty containers ("", [], {}, set(), ()), True otherwise. Floats are IEEE-754 binary64 approximations; <code>round()</code> rounds half to even.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Never compare floats with <code>==</code>; use <code>math.isclose</code> (<code>np.isclose</code> for arrays). For money use <code>Decimal</code> built from strings, or count in whole paise as ints. Remember <code>round(52.5) == 52</code>, <code>int(17.9) == 17</code>, <code>int("3.5")</code> fails, and <code>bool("False")</code> is True.</p></div>

  <h2 id="pv-ops"><span class="num">06</span>Operators and Precedence</h2>
  <p>An <strong>operator</strong> is a symbol that does a job on values and gives back a new value: <code>+</code> adds, <code>&lt;</code> compares, <code>and</code> combines conditions. A piece of code that produces a value, like <code>2 * 30 + 45</code>, is called an <strong>expression</strong>. Most operators work like school maths. The surprises are in division, negatives, <code>and</code>/<code>or</code>, and arrays.</p>
  <table class="tbl">
    <tr><th>Kind</th><th>Operators</th><th>Remember</th></tr>
    <tr><td>Arithmetic</td><td><code>+ - * / // % **</code></td><td><code>/</code> → float; <code>//</code> rounds down toward −∞</td></tr>
    <tr><td>Assignment</td><td><code>= += -= *= /= //= %=</code></td><td><code>x += 1</code> means <code>x = x + 1</code> (in place for lists)</td></tr>
    <tr><td>Comparison</td><td><code>== != &lt; &lt;= &gt; &gt;=</code></td><td>Gives a bool; chains: <code>150 &lt;= x &lt; 300</code></td></tr>
    <tr><td>Logical</td><td><code>and or not</code></td><td>Stop early, return an operand</td></tr>
    <tr><td>Identity</td><td><code>is, is not</code></td><td>Same object</td></tr>
    <tr><td>Membership</td><td><code>in, not in</code></td><td>list O(n), set/dict O(1); dict checks keys</td></tr>
    <tr><td>Bitwise</td><td><code>&amp; | ^ ~ &lt;&lt; &gt;&gt;</code></td><td>Work on binary digits; element-wise in numpy</td></tr>
  </table>
  <h3>Arithmetic: /, // and %</h3>
  <p>17 laddoos shared by 5 kids: <code>/</code> gives the exact share (3.4). <code>//</code> gives whole laddoos per kid (3); this is <strong>floor division</strong>, it rounds down. <code>%</code> gives the laddoos left over (2); this is the <strong>remainder</strong> or <strong>modulo</strong>. <code>divmod</code> gives both at once.</p>
  <div class="fx" data-lang="py">laddoos, kids = 17, 5
print(laddoos / kids)    # exact share
print(laddoos // kids)   # whole laddoos each
print(laddoos % kids)    # left over
print(divmod(laddoos, kids))</div>
  <div class="fx" data-lang="text">3.4
3
2
(3, 2)</div>
  <p>The same pair splits an amount into units, e.g. change from ₹200 for a ₹184 bill:</p>
  <div class="fx" data-lang="py">paid, bill = 200, 184
change = paid - bill
print(f"change {change}: {change // 10} ten-rupee note(s) and {change % 10} rupees in coins")</div>
  <div class="fx" data-lang="text">change 16: 1 ten-rupee note(s) and 6 rupees in coins</div>
  <h3><code>//</code> and <code>%</code> with Negative Numbers</h3>
  <p>"Floor" means "round <em>down</em>, toward minus infinity", not "toward zero". For positives these agree; for negatives they do not. And <code>%</code> is defined so that this rule always holds: <strong>b × (a // b) + a % b == a</strong>.</p>
  <table class="tbl"><caption>By hand, using the rule</caption>
    <tr><th>a, b</th><th>a / b</th><th>a // b (round down)</th><th>a % b = a − b × (a // b)</th><th>check</th></tr>
    <tr><td>17, 5</td><td>3.4</td><td>3</td><td>17 − 15 = 2</td><td>5×3 + 2 = 17</td></tr>
    <tr><td>−7, 2</td><td>−3.5</td><td><b>−4</b> (below −3.5)</td><td>−7 − (−8) = <b>1</b></td><td>2×(−4) + 1 = −7</td></tr>
    <tr><td>7, −2</td><td>−3.5</td><td>−4</td><td>7 − 8 = −1</td><td>−2×(−4) − 1 = 7</td></tr>
  </table>
  <div class="fx" data-lang="py">print(-7 // 2, -7 % 2)
print(7 // -2, 7 % -2)
print(int(-7 / 2))                   # cutting toward zero is different
a, b = -7, 2
print(b * (a // b) + a % b == a)     # the rule that ties // and % together
minutes = -30
print(minutes % 60)                  # clock arithmetic stays in 0..59</div>
  <div class="fx" data-lang="text">-4 1
-4 -1
-3
True
30</div>
  <p><code>int(-7 / 2)</code> is −3: <code>int()</code> cuts toward zero, so it is <em>not</em> the same as <code>//</code> for negatives. The useful consequence: the sign of <code>a % b</code> follows <code>b</code>, so <code>x % 60</code> is always in 0…59. "30 minutes before 00:00" is minute 30 of the previous hour. C and Java give −30 here; Python's choice is the one clocks and calendars need.</p>
  <h3>Order of operations</h3>
  <p>Python follows school order: <code>**</code> first, then <code>* / // %</code>, then <code>+ -</code>, then comparisons, then <code>not</code>, <code>and</code>, <code>or</code>. Brackets override everything. Two surprises: <code>**</code> groups from the right, and it binds tighter than a leading minus.</p>
  <div class="fx" data-lang="py">print(2 + 3 * 15, (2 + 3) * 15)
print(2 ** 3 ** 2, (2 ** 3) ** 2)    # ** groups from the right
print(-2 ** 2, (-2) ** 2)            # ** binds tighter than the minus sign
print(10 - 4 - 3, 100 / 10 / 5)      # the rest group from the left</div>
  <div class="fx" data-lang="text">47 75
512 64
-4 4
3 2.0</div>
  <h3>Augmented assignment</h3>
  <p><code>total += 60</code> is short for <code>total = total + 60</code>. It reads the old value, computes, and rebinds (for ints, a new object each time). A running total grows line by line, then a discount and tax are applied with <code>-=</code> and <code>*=</code>.</p>
  <div class="fx" data-lang="py">total = 0
total += 60      # same as total = total + 60
total += 45
total += 90
print(total)
total -= 19.5
total *= 1.05
print(total)</div>
  <div class="fx" data-lang="text">195
184.275</div>
  <h3>Comparison</h3>
  <p>Comparisons give a bool. They can be chained like in maths: <code>150 &lt;= 195 &lt; 300</code> means <code>150 &lt;= 195 and 195 &lt; 300</code>. Text compares letter by letter by character code, so all capitals come before all lowercase letters.</p>
  <div class="fx" data-lang="py">print(195 &gt;= 150, 70 &gt;= 150, 195 != 70)
print(150 &lt;= 195 &lt; 300)              # chained, like maths
print("chai" == "Chai", "Chai" &lt; "chai", "apple" &lt; "banana")
print(3 == 3.0, "3" == 3)</div>
  <div class="fx" data-lang="text">True False True
True
False True True
True False</div>
  <p>Note <code>3 == 3.0</code> is True (numbers compare by value across int/float) but <code>"3" == 3</code> is simply False (text is never equal to a number; no error, so the bug hides).</p>
  <h3>Logical operators and short-circuit</h3>
  <p><code>and</code> is true only if both sides are; <code>or</code> if at least one is; <code>not</code> flips. The important detail: Python <strong>stops as soon as the answer is known</strong> (short-circuit), and returns <em>the value it stopped at</em>, which is not always True/False.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>or</code> is like asking friends for a pen: the first one who has it ends the search, and you get <em>that</em> pen. <code>and</code> is like the checks at a gate: the first failed check stops you, and that failure is what you are told.</p></div>
  <table class="tbl"><caption>Trace: what each expression evaluates, and what it returns</caption>
    <tr><th>Expression</th><th>Left side</th><th>Truthy?</th><th>Right side evaluated?</th><th>Returns</th></tr>
    <tr><td><code>195 &gt;= 150 and is_member</code></td><td>True</td><td>yes</td><td>yes (and needs both)</td><td>False (the right side)</td></tr>
    <tr><td><code>195 &gt;= 150 or is_member</code></td><td>True</td><td>yes</td><td><b>no</b> (answer known)</td><td>True (the left side)</td></tr>
    <tr><td><code>0 or "default"</code></td><td>0</td><td>no</td><td>yes</td><td>"default"</td></tr>
    <tr><td><code>5 and "yes"</code></td><td>5</td><td>yes</td><td>yes</td><td>"yes"</td></tr>
    <tr><td><code>[] and 1 / 0</code></td><td>[]</td><td>no</td><td><b>no</b>, so no ZeroDivisionError</td><td>[]</td></tr>
    <tr><td><code>coupon is not None and coupon.startswith(...)</code></td><td>False</td><td>no</td><td><b>no</b>, so no error on None</td><td>False</td></tr>
  </table>
  <div class="fx" data-lang="py">subtotal, is_member = 195, False
print(subtotal &gt;= 150 and is_member)
print(subtotal &gt;= 150 or is_member)
print(not is_member)
print(0 or "default", 5 and "yes", 5 or "never", [] and 1 / 0)
name = ""
print(name or "Guest")
coupon = None
print(coupon is not None and coupon.startswith("CHAI"))   # right side never runs
qty = 0
print(qty or 1)                      # trap: 0 is a real quantity, but falsy</div>
  <div class="fx" data-lang="text">False
True
True
default yes 5 []
Guest
False
1</div>
  <p>Two everyday uses: a default (<code>name or "Guest"</code>) and a guard (<code>coupon is not None and coupon.startswith("CHAI")</code>: the method is only called when it is safe). The last line is the trap: <code>qty or 1</code> also replaces a genuine 0, because 0 is falsy. When 0 is a valid value, write <code>qty if qty is not None else 1</code> (a conditional expression, see <a class="xref" data-note="py_control">Decisions &amp; Loops</a>).</p>
  <h3>Identity and membership</h3>
  <p><code>is</code> / <code>is not</code> test "same object". <code>in</code> / <code>not in</code> test "is it inside?": for a list, is it one of the items; for text, is it a substring; for a dict, is it one of the <em>keys</em>.</p>
  <div class="fx" data-lang="py">a = ["chai"]
b = ["chai"]
c = a
print(a == b, a is b, a is c)
print(a is not b)</div>
  <div class="fx" data-lang="text">True False True
True</div>
  <div class="fx" data-lang="py">menu = ["masala chai", "samosa", "vada pav", "cold coffee"]
print("samosa" in menu, "dosa" not in menu)
print("chai" in "masala chai")            # substring check for text
prices = {"samosa": 15, "vada pav": 20}
print("samosa" in prices, 15 in prices)   # dict: checks KEYS only
print(15 in prices.values())</div>
  <div class="fx" data-lang="text">True True
True
True False
True</div>
  <p>Speed differs: <code>in</code> on a list checks items one by one, so the time grows with the number of items, written <strong>O(n)</strong>. A set or dict jumps straight to the answer using the hash, the same time no matter how many items, written <strong>O(1)</strong>. For 4 items it does not matter; for a million customer ids it decides whether your code takes a second or an hour (details in <a class="xref" data-note="py_ds">Data Structures</a>).</p>
  <h3>Bitwise operators (brief)</h3>
  <p><strong>Bitwise</strong> operators work on the binary digits of integers, one position at a time. <code>5 &amp; 3</code>: 5 is <code>101</code>, 3 is <code>011</code>; keep positions where both are 1 → <code>001</code> = 1. <code>~x</code> is <code>-(x+1)</code>. You need them for flags and masks, and, much more often, for filters in numpy and pandas.</p>
  <div class="fx" data-lang="py">print(5 &amp; 3, 5 | 3, 5 ^ 3, ~5, 5 &lt;&lt; 1, 5 &gt;&gt; 1)
print(bin(5), bin(3), bin(5 &amp; 3))</div>
  <div class="fx" data-lang="text">1 7 6 -6 10 2
0b101 0b11 0b1</div>
  <p>In data work you filter arrays: "bills above 60 and below 300". A numpy array holds many values, so each comparison gives many True/False values, one per element. <code>and</code> wants a single True/False, so it fails. <code>&amp;</code> works element by element.</p>
  <div class="fx" data-lang="py">import numpy as np
bills = np.array([184, 74, 52, 310])
print((bills &gt; 60) &amp; (bills &lt; 300))
try:
    bills &gt; 60 and bills &lt; 300
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">[ True  True False False]
ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>expression</strong> is code that evaluates to a value; an <strong>operator</strong> combines values into a new value. Floor division satisfies <code>b * (a // b) + a % b == a</code> with <code>a // b = ⌊a / b⌋</code>. <code>x and y</code> returns x if x is falsy, else y; <code>x or y</code> returns x if x is truthy, else y; the right operand is evaluated only when needed (<strong>short-circuit</strong>). Comparisons chain: <code>a &lt; b &lt; c</code> ≡ <code>a &lt; b and b &lt; c</code> (b evaluated once).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>-7 // 2</code> is −4, not −3. <code>x or default</code> also replaces 0 and "". <code>"3" == 3</code> is False without an error. In numpy and pandas use <code>&amp;</code> <code>|</code> <code>~</code> for element-wise logic, with brackets around each condition, because <code>&amp;</code> binds tighter than <code>&gt;</code>.</p></div>

  <h2 id="pv-bill"><span class="num">07</span>Worked Example: Types in One Expression</h2>
  <p>One calculation that mixes every type above: ints combined into a subtotal, a comparison producing a bool, the bool used as a number (True is 1), int × float promoting to float, and <code>round</code> back to an int. Rule: 10% off at ₹150 or more, then 5% tax.</p>
  <div class="fx" data-lang="py">chai, samosa, coffee = 30, 15, 90          # values with names
subtotal = 2 * chai + 3 * samosa + 1 * coffee
eligible = subtotal &gt;= 150                 # a bool
discount = subtotal * 0.10 * eligible      # True counts as 1, False as 0
after = subtotal - discount
tax = after * 0.05
print(subtotal, eligible, discount, after, tax)
print(after + tax, round(after + tax))</div>
  <div class="fx" data-lang="text">195 True 19.5 175.5 8.775
184.275 184</div>
  <table class="tbl"><caption>Type of each intermediate value</caption>
    <tr><th>Name</th><th>Value</th><th>Type</th><th>Why</th></tr>
    <tr><td>subtotal</td><td>195</td><td>int</td><td>int * int + int stays int</td></tr>
    <tr><td>eligible</td><td>True</td><td>bool</td><td>comparison operators return bool</td></tr>
    <tr><td>discount</td><td>19.5</td><td>float</td><td>int × float → float; × bool (True = 1)</td></tr>
    <tr><td>after, tax</td><td>175.5, 8.775</td><td>float</td><td>float arithmetic</td></tr>
    <tr><td>total</td><td>184</td><td>int</td><td><code>round(x)</code> with no ndigits returns int</td></tr>
  </table>
  <p>It works, but <code>subtotal * 0.10 * eligible</code> only works because <code>bool</code> is a subclass of <code>int</code>. A rule with three tiers cannot be written this way: choosing between actions needs <code>if/elif/else</code>, and applying one step to every line of an order needs a loop (both in <a class="xref" data-note="py_control">Decisions &amp; Loops</a>).</p>
  <div class="callout trap"><span class="label">Trap</span><p>Clever arithmetic with bools (<code>price * is_member</code>) is legal but unreadable and breaks as soon as the rule has three cases. Use it only for counting (<code>sum(flags)</code>). Decisions belong in <code>if</code>.</p></div>

  <h2 id="pv-traps"><span class="num">08</span>Common Mistakes</h2>
  <table class="tbl">
    <tr><th>Mistake</th><th>What happens</th><th>Fix</th></tr>
    <tr><td><code>b = a</code> "to make a copy"</td><td>Both names share one list; edits leak</td><td><code>b = a.copy()</code> (deep data: <code>copy.deepcopy</code>)</td></tr>
    <tr><td>Calling <code>s.upper()</code> and expecting s to change</td><td>Strings are immutable; the result is thrown away</td><td><code>s = s.upper()</code></td></tr>
    <tr><td>Doing maths on text from input/files</td><td><code>"2" + "3"</code> = "23"; <code>"2" + 3</code> TypeError</td><td>Convert at the boundary: <code>int(text)</code></td></tr>
    <tr><td><code>int("3.5")</code></td><td>ValueError</td><td><code>int(float("3.5"))</code> or <code>round(float(...))</code></td></tr>
    <tr><td><code>0.1 + 0.2 == 0.3</code></td><td>False</td><td><code>math.isclose</code>; Decimal from strings for money</td></tr>
    <tr><td>Expecting <code>round(52.5)</code> = 53</td><td>Gives 52 (half to even)</td><td><code>Decimal(...).quantize(..., ROUND_HALF_UP)</code></td></tr>
    <tr><td><code>if flag_text:</code> with "False"</td><td>Non-empty text is truthy</td><td><code>flag_text.lower() in {"1", "true", "yes"}</code></td></tr>
    <tr><td><code>x is 1000</code> / <code>s is "chai"</code></td><td>Works or fails depending on caching</td><td><code>==</code> for values</td></tr>
    <tr><td><code>-7 // 2</code> expected −3</td><td>−4 (floor toward −∞)</td><td><code>int(-7 / 2)</code> to cut toward zero</td></tr>
    <tr><td><code>qty or 1</code> when 0 is valid</td><td>0 replaced by 1</td><td><code>qty if qty is not None else 1</code></td></tr>
    <tr><td><code>df[df.a &gt; 1 and df.b &lt; 5]</code></td><td>ValueError: truth value ambiguous</td><td><code>(df.a &gt; 1) &amp; (df.b &lt; 5)</code></td></tr>
    <tr><td>Using a list as a dict key</td><td>TypeError: unhashable</td><td>Use a tuple</td></tr>
  </table>

  <h2 id="pv-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Objects</h3>
  <ul>
    <li>Every value is an object with a <b>type</b> (fixed, <code>type(x)</code>), an <b>identity</b> (fixed, <code>id(x)</code>; memory address in CPython) and a <b>value</b>.</li>
    <li><code>isinstance(x, T)</code> also accepts subclasses: <code>isinstance(True, int)</code> is True.</li>
    <li>Python is <b>dynamically typed</b> (types live on objects; a name can be rebound to any type) and <b>strongly typed</b> (<code>"2" + 3</code> → TypeError, no silent coercion).</li>
  </ul>
  <h3>Built-in scalar types</h3>
  <table class="tbl">
    <tr><th>Type</th><th>Key facts</th></tr>
    <tr><td><code>int</code></td><td>arbitrary precision, never overflows (<code>2**100</code> is exact)</td></tr>
    <tr><td><code>float</code></td><td>IEEE-754 64-bit; <code>/</code> always returns float; <code>0.1 + 0.2 != 0.3</code></td></tr>
    <tr><td><code>bool</code></td><td>subclass of int: <code>True + True == 2</code>, <code>sum(flags)</code> counts Trues</td></tr>
    <tr><td><code>str</code> / <code>bytes</code></td><td>Unicode text vs raw 0–255; <code>s.encode("utf-8")</code> ↔ <code>b.decode("utf-8")</code></td></tr>
    <tr><td><code>None</code></td><td>sole value of NoneType; functions without <code>return</code> give None; test with <code>is None</code></td></tr>
  </table>
  <h3>Names and aliasing</h3>
  <ul>
    <li><code>name = expr</code> binds a name to an object; it <b>never copies</b>. <code>b = a</code> makes an alias.</li>
    <li><b>Rebind</b> (<code>a = …</code>) moves one name. <b>Mutate</b> (<code>a.append(…)</code>) changes the object; every alias sees it.</li>
    <li><code>==</code> compares values (<code>__eq__</code>); <code>is</code> compares identity. Use <code>is</code> only for <code>None</code>/<code>True</code>/<code>False</code>/sentinels.</li>
    <li>CPython caches ints −5…256 and interns some strings, so <code>is</code> can look like <code>==</code> by accident.</li>
    <li>Names: letters, digits, <code>_</code>, no leading digit, no keywords; <code>snake_case</code>, <code>UPPER_CASE</code> constants. Swap: <code>a, b = b, a</code>.</li>
  </ul>
  <h3>Mutability and hashing</h3>
  <table class="tbl">
    <tr><th>Immutable (hashable if contents are)</th><th>Mutable (unhashable)</th></tr>
    <tr><td>int, float, bool, complex, str, bytes, tuple, frozenset, None</td><td>list, dict, set, bytearray, most user objects with state</td></tr>
  </table>
  <ul>
    <li>On an int/str, <code>x += 1</code> builds a new object (new id). On a list, <code>x += [...]</code> extends in place (same id); <code>x = x + [...]</code> builds a new list.</li>
    <li>String methods return new strings: <code>s = s.upper()</code>.</li>
    <li>Dict keys and set items must be hashable: the hash must never change while stored.</li>
    <li>A tuple holding a list is not hashable, and its list can still change. <code>t[0] += [x]</code> mutates the list <em>and</em> raises TypeError.</li>
    <li>Copies: <code>a.copy()</code> / <code>list(a)</code> / <code>a[:]</code> are shallow (inner objects shared); <code>copy.deepcopy(a)</code> copies recursively.</li>
  </ul>
  <h3>Conversion</h3>
  <table class="tbl">
    <tr><th>Call</th><th>Result</th><th>Rule</th></tr>
    <tr><td><code>int(17.9)</code>, <code>int(-17.9)</code></td><td>17, −17</td><td>truncates toward zero</td></tr>
    <tr><td><code>int("3.5")</code></td><td>ValueError</td><td>str → int needs whole-number text; use <code>int(float(s))</code></td></tr>
    <tr><td><code>round(52.5)</code>, <code>round(53.5)</code></td><td>52, 54</td><td>half to even; returns int when ndigits omitted</td></tr>
    <tr><td><code>round(2.675, 2)</code></td><td>2.67</td><td>2.675 is stored as 2.67499…</td></tr>
    <tr><td><code>Decimal("0.1") + Decimal("0.2")</code></td><td>0.3</td><td>exact base 10; build from strings, not floats</td></tr>
    <tr><td><code>bool("False")</code>, <code>bool(" ")</code></td><td>True, True</td><td>non-empty string is truthy</td></tr>
  </table>
  <p>Falsy: <code>False</code>, <code>None</code>, <code>0</code>, <code>0.0</code>, <code>""</code>, <code>[]</code>, <code>()</code>, <code>{}</code>, <code>set()</code>, <code>range(0)</code>. Everything else is truthy. Compare floats with <code>math.isclose</code> / <code>np.isclose</code>; store money as <code>Decimal</code> or integer paise.</p>
  <h3>Operators</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Behaviour</th><th>Example</th></tr>
    <tr><td>Floor division</td><td>rounds toward −∞</td><td><code>-7 // 2 == -4</code></td></tr>
    <tr><td>Modulo</td><td><code>a % b == a - b*(a//b)</code>; sign follows b</td><td><code>-7 % 2 == 1</code>, <code>-30 % 60 == 30</code></td></tr>
    <tr><td><code>and</code> / <code>or</code></td><td>short-circuit; return an operand, not a bool</td><td><code>"" or "Guest"</code> → "Guest"; <code>0 and 1/0</code> → 0</td></tr>
    <tr><td>Chained comparison</td><td><code>a &lt; b &lt; c</code> ≡ <code>a &lt; b and b &lt; c</code>, b evaluated once</td><td><code>150 &lt;= 195 &lt; 300</code></td></tr>
    <tr><td><code>in</code></td><td>list/tuple O(n); set/dict O(1) average; dict tests keys</td><td><code>15 in {"samosa": 15}</code> → False</td></tr>
    <tr><td>Precedence</td><td><code>**</code> &gt; unary − &gt; <code>* / // %</code> &gt; <code>+ -</code> &gt; <code>&amp;</code> &gt; <code>|</code> &gt; comparisons &gt; not &gt; and &gt; or</td><td><code>-2 ** 2 == -4</code>; <code>2 ** 3 ** 2 == 512</code></td></tr>
    <tr><td>numpy / pandas</td><td><code>&amp; | ~</code> element-wise, with brackets</td><td><code>(df.a &gt; 1) &amp; (df.b &lt; 5)</code></td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li><code>b = a</code> is not a copy; shallow copies share nested objects.</li>
    <li>Text from input/files must be converted: <code>"2" + "3" == "23"</code>, <code>"3" == 3</code> is False with no error.</li>
    <li><code>0.1 + 0.2 != 0.3</code>; <code>round(2.5) == 2</code>; <code>int(-3.9) == -3</code> but <code>-7 // 2 == -4</code>.</li>
    <li><code>x or default</code> also replaces valid falsy values like 0; use <code>x if x is not None else default</code>.</li>
    <li><code>and</code>/<code>or</code>/<code>not</code> on arrays raise "truth value … is ambiguous".</li>
  </ul>

  <h2 id="pv-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does "everything in Python is an object" mean?</summary><div class="qa-body">Every value (ints, strings, lists, functions, classes, modules) is a heap object with a type, an identity and a value. Variables are names that reference objects. That is why you can pass a function as an argument, call methods on an int (<code>(5).bit_length()</code>), and why assignment never copies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>is</code> and <code>==</code>?</summary><div class="qa-body"><code>==</code> compares values by calling <code>__eq__</code>; <code>is</code> checks whether both names reference the same object (same <code>id</code>). <code>[1, 2] == [1, 2]</code> is True, <code>[1, 2] is [1, 2]</code> is False. Use <code>is</code> for <code>None</code> and other singletons, because a class can redefine <code>==</code> but cannot fake identity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can <code>a is b</code> be True for <code>256</code> but False for <code>1000</code>?</summary><div class="qa-body">CPython pre-allocates the small ints −5 to 256 and reuses them, and interns some strings. Larger ints created separately are distinct objects. It is an implementation detail, not a language rule, so never use <code>is</code> to compare numbers or strings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Mutable vs immutable types: which are which, and why does it matter?</summary><div class="qa-body">Immutable: int, float, bool, str, bytes, tuple, frozenset, None. Mutable: list, dict, set, bytearray. It matters for aliasing (a change through one name is visible through every alias of a mutable object), for hashing (only immutable values can be dict keys and set items), and for function arguments (a function can mutate a list you pass in).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>a = [1, 2]; b = a; b += [3]; print(a)</code>. And with <code>b = b + [3]</code>?</summary><div class="qa-body"><code>[1, 2, 3]</code>: for lists <code>+=</code> extends the same object in place, and <code>a</code> is an alias. With <code>b = b + [3]</code>, <code>+</code> builds a new list and rebinds only <code>b</code>, so <code>a</code> stays <code>[1, 2]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python pass-by-value or pass-by-reference?</summary><div class="qa-body">Neither exactly: it is "pass by object reference" (call by sharing). The parameter becomes a new name bound to the caller's object. Mutating it (<code>cart.append(x)</code>) is visible to the caller; rebinding it (<code>cart = []</code>) only moves the local name and the caller sees nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shallow copy vs deep copy?</summary><div class="qa-body">A shallow copy (<code>x.copy()</code>, <code>list(x)</code>, <code>x[:]</code>, <code>copy.copy</code>) makes a new outer container whose elements are the same objects. A deep copy (<code>copy.deepcopy</code>) recursively copies the elements too.
  <div class="fx" data-lang="py">import copy
orders = [["chai"], ["samosa"]]
shallow = orders.copy()
deep = copy.deepcopy(orders)
orders[0].append("vada pav")
print(shallow, deep)</div>
  <div class="fx" data-lang="text">[['chai', 'vada pav'], ['samosa']] [['chai'], ['samosa']]</div></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a tuple be a dict key but a list cannot?</summary><div class="qa-body">Dicts and sets locate entries by hash. A key's hash must never change while it is stored, so only hashable (effectively immutable) objects are allowed. A list can change, so it has no <code>__hash__</code> and raises <code>TypeError: unhashable type: 'list'</code>. A tuple is hashable only if all its items are: <code>(1, [2])</code> is not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you modify a tuple?</summary><div class="qa-body">You cannot rebind its slots, but mutable objects inside it can change: <code>t = ([1], 2); t[0].append(3)</code> works. The classic trick question: <code>t[0] += [4]</code> extends the list <em>and then</em> raises TypeError, because the augmented assignment tries to store the result back into the tuple slot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>0.1 + 0.2 != 0.3</code>, and how do you handle it?</summary><div class="qa-body">Floats are binary (IEEE-754 double); 0.1 and 0.2 have no exact binary representation, so the sum is 0.30000000000000004. Compare with a tolerance (<code>math.isclose</code>, <code>np.isclose</code>). For money use <code>decimal.Decimal</code> constructed from strings, or integers in the smallest unit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>round(2.5)</code>, <code>round(3.5)</code> and <code>round(2.675, 2)</code> return?</summary><div class="qa-body"><code>2</code>, <code>4</code>, <code>2.67</code>. Python rounds exact halves to the even neighbour (banker's rounding) to avoid systematic bias. 2.675 is actually stored as 2.67499…, so it is not a half at all. For half-up rounding use <code>Decimal(...).quantize(..., rounding=ROUND_HALF_UP)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>print(-7 // 2, -7 % 2, int(-7 / 2))</code> print?</summary><div class="qa-body"><code>-4 1 -3</code>. <code>//</code> floors toward −∞; <code>%</code> is defined so that <code>b * (a // b) + a % b == a</code>, so its sign follows the divisor; <code>int()</code> truncates toward zero. C and Java truncate, giving −3 and −1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which values are falsy? What is <code>bool("False")</code>?</summary><div class="qa-body"><code>False</code>, <code>None</code>, numeric zeros, and empty containers/strings (<code>""</code>, <code>[]</code>, <code>()</code>, <code>{}</code>, <code>set()</code>, <code>range(0)</code>). Objects can define <code>__bool__</code> or <code>__len__</code>. <code>bool("False")</code> is True: any non-empty string is truthy, so parse flags explicitly (<code>s.lower() in {"1", "true", "yes"}</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>print(0 or "x", [] and 5, 3 and 4, None or 0)</code> print?</summary><div class="qa-body"><code>x [] 4 0</code>. <code>a or b</code> returns a if a is truthy, else b; <code>a and b</code> returns a if a is falsy, else b. They short-circuit, so the right side may never be evaluated, and they return operands, not necessarily bools.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python statically or dynamically typed? Strongly or weakly?</summary><div class="qa-body">Dynamically typed: types belong to objects and are checked at run time; a name can be rebound to any type. Strongly typed: operations between incompatible types raise instead of silently converting (<code>"2" + 3</code> is a TypeError, unlike JavaScript's <code>"23"</code>). Type hints add optional static checking via tools like mypy, but the interpreter does not enforce them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a Python int overflow?</summary><div class="qa-body">No. <code>int</code> is arbitrary precision; <code>2**64</code> is exact and its type is still <code>int</code>. The cost is speed and memory per number, which is one reason numpy uses fixed-width <code>int64</code> (which <em>can</em> overflow, silently wrapping in arrays).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>bool</code> a subclass of <code>int</code>, and where is that useful?</summary><div class="qa-body">For historical compatibility (Python had no bool before 2.3) <code>True == 1</code> and <code>False == 0</code>. Useful: <code>sum(x &gt; 0 for x in xs)</code> counts matches, and <code>mask.mean()</code> in numpy gives a proportion. A trap: <code>{1: "a", True: "b"}</code> has one key, and <code>isinstance(True, int)</code> is True when validating input.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>df[df.a &gt; 1 and df.b &lt; 5]</code> raise, and what is the fix?</summary><div class="qa-body"><code>and</code> needs a single truth value for the whole Series, which is ambiguous, so pandas raises ValueError. Use element-wise operators with brackets: <code>df[(df.a &gt; 1) &amp; (df.b &lt; 5)]</code>. The brackets are required because <code>&amp;</code> binds tighter than <code>&gt;</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>str</code> and <code>bytes</code>?</summary><div class="qa-body"><code>str</code> is a sequence of Unicode code points; <code>bytes</code> is a sequence of integers 0–255. Converting needs an encoding: <code>"café".encode("utf-8")</code> gives 5 bytes for 4 characters, and <code>.decode("utf-8")</code> reverses it. Files opened in text mode, sockets and HTTP bodies are where the boundary shows up; a wrong codec raises <code>UnicodeDecodeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Membership test <code>x in container</code>: what is its cost for a list, a set and a dict?</summary><div class="qa-body">List and tuple: O(n), a linear scan comparing with <code>==</code>. Set and dict: O(1) on average, using the hash to jump to a bucket (dict tests keys, not values). Converting a large lookup list to a set before a loop is one of the cheapest big speedups in Python.</div></details>

</main>
`
});
