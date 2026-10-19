// notes/python/py_values.js — Values, Types & Variables
Object.assign(TOPIC_CONTENT, {
  "py_values": `<main>
<h1>Values, Types &amp; Variables</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Values, Types &amp; Variables</span></div>
  <p class="lead">Every Python program, from a two-line script to scikit-learn, is made of the same raw material: <strong>values</strong> (numbers, text, yes/no answers) that have a <strong>type</strong>, held by <strong>names</strong>, and combined with <strong>operators</strong>. This note builds all of it on one story, the bill for one order at Chai Corner, a small chai stall: what a value really is, the five basic types, why a variable is a label and not a box, which values can change in place, how to convert between types (and the traps: 0.1 + 0.2, <code>int("3.5")</code>, <code>bool("False")</code>), and every kind of operator. By the end we can compute the bill as one expression, and we will see exactly why we need the next note. Code here was run on Python 3.13.</p>

  <h2 id="pv-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="pv-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="230" y="8" width="200" height="36" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="31" text-anchor="middle" font-size="12">Python Basics: the Map</text>
<line x1="330" y1="44" x2="100" y2="80" stroke="currentColor" marker-end="url(#pv-a0)"/>
<rect x="15" y="82" width="170" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="100" y="103" text-anchor="middle" font-size="12.5" font-weight="700">Values, Types &amp; Variables</text><text x="100" y="121" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<line x1="185" y1="107" x2="243" y2="107" stroke="currentColor" marker-end="url(#pv-a0)"/>
<rect x="245" y="82" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="103" text-anchor="middle" font-size="12">Decisions &amp; Loops</text><text x="330" y="121" text-anchor="middle" class="tm" font-size="10">choose and repeat</text>
<line x1="415" y1="107" x2="473" y2="107" stroke="currentColor" marker-end="url(#pv-a0)"/>
<rect x="475" y="82" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="103" text-anchor="middle" font-size="12">Functions</text><text x="560" y="121" text-anchor="middle" class="tm" font-size="10">name and reuse</text>
<text x="330" y="160" text-anchor="middle" class="tm" font-size="10.5">then: Data Structures · Exceptions &amp; Files · OOP · Iterators · Decorators · Context Managers</text>
</svg><figcaption>The first concept note of Python Basics. Everything later stands on values, names and operators.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_fundamentals">Python Basics: the Map</a></b><span>The map showed that a program is built in four layers: values, names, decisions and repetition, functions. It introduced Chai Corner and Asha's order (2 masala chai, 3 samosas, 1 cold coffee). Left open: what exactly is a "value" inside Python, and how does a name hold one?</span></li>
    <li><b>This note adds: the raw material</b><span>Values as objects with a type, an identity and a value; names as labels on objects; mutable vs immutable objects; conversion between types; and operators to combine values into new values. Result: Asha's subtotal 195 and her bill ₹184, computed as one expression.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_control">Decisions &amp; Loops</a></b><span>With only values and operators, the discount needs a trick (multiplying by a bool), and three tables need three copies of the same code. The next note adds <code>if</code> to choose and <code>for</code> to repeat. Later, <a class="xref" data-note="py_ds">Data Structures</a> goes deep on lists, dicts, sets and copying.</span></li>
  </ol>

  <h2 id="pv-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Values (objects)</b><span>Q: how does the computer hold "30 rupees" or "samosa"? → As an object in memory with three facts: a type, an identity, a value. But what can we do with each one?</span></li>
    <li><b>Types</b><span>Q: what can a value do? → Its type decides: <code>int</code> 30 can be multiplied, <code>str</code> "30" can be joined, <code>bool</code> answers yes/no, <code>None</code> means "nothing yet". But a value we cannot refer to again is useless…</span></li>
    <li><b>Names (variables)</b><span>Q: how do we keep a value to use later? → Stick a name on it: <code>price_chai = 30</code>. A name is a label, not a box. But if two labels sit on one object, can a change through one surprise the other?</span></li>
    <li><b>Mutable vs immutable</b><span>Q: which objects can change in place? → Lists, dicts, sets can (both labels see it); ints, floats, str, tuples cannot (a "change" makes a new object). But values often arrive as the wrong type, like the text "2"…</span></li>
    <li><b>Type conversion</b><span>Q: how do we turn "2" into 2, or 175.5 into a whole rupee amount? → <code>int()</code>, <code>float()</code>, <code>str()</code>, <code>round()</code>, <code>bool()</code>, each with a trap: <code>int("3.5")</code> fails, 0.1 + 0.2 is not 0.3, <code>round(52.5)</code> is 52. Now we have the right values; how do we combine them?</span></li>
    <li><b>Operators</b><span>Q: how do we compute new values from old ones? → Arithmetic (<code>2 * 30 + 3 * 15 + 90</code> = 195), comparison (<code>195 &gt;= 150</code>), logical (<code>and</code>/<code>or</code> stop early), identity (<code>is</code>), membership (<code>in</code>). The bill is now one expression: ₹184. But the discount needed a trick, and three tables need three copies…</span></li>
    <li><b>Next note</b><span>Q: how does a program choose and repeat? → <a class="xref" data-note="py_control">Decisions &amp; Loops</a>.</span></li>
  </ol>

  <h2 id="pv-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Values, Types &amp; Variables</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Values are objects</div>
        <ul>
          <li>Every value is an <b>object</b>: <b>type</b> (what kind) + <b>identity</b> (<code>id()</code>, which one) + <b>value</b></li>
          <li>Literals: <code>30</code>, <code>17.5</code>, <code>"samosa"</code>, <code>True</code>, <code>None</code></li>
          <li>Running example: chai 30, samosa 15, vada pav 20, cold coffee 90</li>
          <li>Asha's order: 2 chai + 3 samosa + 1 cold coffee = <b>195</b></li>
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
      <div class="rm-item rm-done" data-target="pv-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pv-values"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Values Are Objects</span><span class="rm-sub">Chai Corner's prices</span></div></div>
      <div class="rm-item rm-done" data-target="pv-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Types</span><span class="rm-sub">int, float, bool, str, None</span></div></div>
      <div class="rm-item rm-done" data-target="pv-names"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Names Are Labels</span><span class="rm-sub">References, id(), is vs ==</span></div></div>
      <div class="rm-item rm-done" data-target="pv-mut"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Mutable vs Immutable</span><span class="rm-sub">Traced with a list and an int</span></div></div>
      <div class="rm-item rm-done" data-target="pv-conv"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Type Conversion &amp; Traps</span><span class="rm-sub">Floats, rounding, truthiness</span></div></div>
      <div class="rm-item rm-done" data-target="pv-ops"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Operators</span><span class="rm-sub">Arithmetic to membership</span></div></div>
      <div class="rm-item rm-done" data-target="pv-bill"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Bill as One Expression</span><span class="rm-sub">And where it gets stuck</span></div></div>
      <div class="rm-item rm-done" data-target="pv-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pv-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Bugs in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="pv-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pv-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pv-values"><span class="num">01</span>Values Are Objects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want the computer to work out a bill. Before it can add anything, it must <em>hold</em> things: the number 30, the word "samosa", the answer "yes, this customer gets a discount". What is such a thing inside Python, and what does Python know about it?</p>
  </div>
  <h3>The running example</h3>
  <p>Chai Corner is a small stall. Its whole menu fits on a board. Every note in Python Basics uses this menu and the three orders below, so each new idea is computed on numbers you have already seen.</p>
  <table class="tbl out"><caption>Chai Corner menu (₹)</caption>
    <tr><th>Item</th><td>masala chai</td><td>samosa</td><td>vada pav</td><td>cold coffee</td></tr>
    <tr><th>Price</th><td>30</td><td>15</td><td>20</td><td>90</td></tr>
  </table>
  <table class="tbl out"><caption>Three tables, three orders</caption>
    <tr><th>Table</th><th>Customer</th><th>Order</th><th>Subtotal</th></tr>
    <tr><td>1</td><td>Asha</td><td>2 masala chai, 3 samosa, 1 cold coffee</td><td>2×30 + 3×15 + 1×90 = <b>195</b></td></tr>
    <tr><td>2</td><td>Ben</td><td>1 masala chai, 2 vada pav</td><td>30 + 2×20 = <b>70</b></td></tr>
    <tr><td>3</td><td>Chen</td><td>2 samosa, 1 vada pav</td><td>2×15 + 20 = <b>50</b></td></tr>
  </table>
  <p>The stall's two rules: a subtotal of ₹150 or more gets <b>10% off</b>, and every bill adds <b>5% GST</b> (tax) on the amount after discount, rounded to whole rupees. By hand for Asha: 195 − 19.5 = 175.5; tax 175.5 × 0.05 = 8.775; total 184.275 → <b>₹184</b>. In this note we teach Python to do exactly that.</p>
  <h3>What a value is</h3>
  <p>A <strong>value</strong> is one piece of data: the number 30, the text "masala chai". When you type a value straight into code, it is called a <strong>literal</strong>. <code>print()</code> shows values on the screen.</p>
  <div class="fx" data-lang="py">print(30)                      # the price of a masala chai
print(15, 20, 90)              # samosa, vada pav, cold coffee
print("masala chai")           # a piece of text
print(17.5)                    # a number with a decimal point
print(True, None)              # a yes/no answer, and "nothing yet"
print(2 * 30 + 3 * 15 + 1 * 90)   # Asha's order, worked out</div>
  <div class="fx" data-lang="text">30
15 20 90
masala chai
17.5
True None
195</div>
  <p>The last line is already a tiny program: Python computed 2 × 30 + 3 × 15 + 1 × 90 and printed 195, Asha's subtotal. Notice <code>None</code>: it is a real value meaning "nothing here (yet)".</p>
  <p>Inside Python, every value lives in memory as an <strong>object</strong>. "Object" sounds advanced, but it only means "a thing Python keeps in memory, that knows what kind of thing it is". Every object carries exactly three facts:</p>
  <table class="tbl"><caption>The three facts every object has, for the object "samosa"</caption>
    <tr><th>Fact</th><th>Asks</th><th>How to see it</th><th>For "samosa"</th><th>Can it change?</th></tr>
    <tr><td><b>Type</b></td><td>What kind of thing is it? What can it do?</td><td><code>type(x)</code></td><td><code>str</code> (text)</td><td>Never</td></tr>
    <tr><td><b>Identity</b></td><td>Which object is it, exactly?</td><td><code>id(x)</code></td><td>a long number (its address in memory)</td><td>Never</td></tr>
    <tr><td><b>Value</b></td><td>What does it hold?</td><td><code>print(x)</code></td><td>the letters s-a-m-o-s-a</td><td>Only for mutable types (section 04)</td></tr>
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
  <p>The id number will be different on your machine and on every run: it is just where the object happened to be placed in memory. What matters is that one object keeps one id for its whole life, so <em>equal ids mean the same object</em>. We will use that in section 03.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>object</strong> is a piece of data in memory. Every object has a <strong>type</strong> (fixed; decides which operations work), an <strong>identity</strong> (fixed; <code>id()</code>, in CPython its memory address) and a <strong>value</strong>. In Python, everything is an object: numbers, text, lists, even functions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not write down an id and expect to see it again. Ids are only meaningful while the object is alive, and Python may reuse the number for a new object after the old one is gone. Compare ids, or better, use <code>is</code> (section 03).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Types.</b> Every object has a type, and the type decides what it can do. What are the basic types, and what does each one allow?</div>

  <h2 id="pv-types"><span class="num">02</span>Types: What a Value Can Do</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>30 and "30" print the same, but are they the same thing? Can we multiply "30" by 2? Why did "samosa" have <code>.upper()</code>? We need to know the basic kinds of values and the rules each kind follows.</p>
  </div>
  <p>A <strong>type</strong> tells Python what kind of value something is, and so what you can do with it. You can add two numbers. You can make text uppercase. You cannot make a number uppercase. Python has five types you will use in every program:</p>
  <table class="tbl"><caption>The five basic types, on Chai Corner</caption>
    <tr><th>Type</th><th>What it is</th><th>Chai Corner example</th><th>What it can do</th><th>Gotcha</th></tr>
    <tr><td><code>int</code></td><td>A whole number, any size</td><td>price 30, quantity 3</td><td>+ − × ÷, compare</td><td>Never overflows, but slower than numpy's int64</td></tr>
    <tr><td><code>float</code></td><td>A number with a decimal point (64-bit binary)</td><td>discount 19.5, tax 8.775</td><td>maths, compare</td><td>0.1 has no exact binary form (section 05)</td></tr>
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
    <li><code>/</code> always gives a float, even for 6 / 2 = 3.0. (Whole-number division is <code>//</code>, section 06.)</li>
    <li><code>2 ** 100</code> is a 31-digit number, printed exactly. Python ints grow as large as memory allows.</li>
    <li><code>True + True</code> is 2, and <code>isinstance(True, int)</code> says a bool <em>is</em> an int. That is why <code>sum([True, False, True])</code> counts the Trues (2).</li>
  </ul>
  <h3>The first real bug: text that looks like a number</h3>
  <p>Everything that comes from outside the program (a form, a file, <code>input()</code>, a CSV column) arrives as <strong>text</strong>. A waiter's tablet sends the quantity "2". Watch what happens.</p>
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
  <h3>None: a value meaning "no value"</h3>
  <p>Sometimes a name must exist before we know its value: the discount is not decided until we know the subtotal. Python's answer is the special value <code>None</code>. It is the only value of its type, so we test for it with <code>is None</code>.</p>
  <div class="fx" data-lang="py">discount = None                     # "not decided yet"
print(discount, type(discount).__name__, discount is None)
result = print("printing returns nothing...")
print(result)                       # ...so result is None</div>
  <div class="fx" data-lang="text">None NoneType True
printing returns nothing...
None</div>
  <p>The second half shows where beginners meet <code>None</code> without asking for it: <code>print</code> shows text on the screen but gives back nothing, so <code>result</code> is <code>None</code>. You will meet this again as "the function that returns None" in <a class="xref" data-note="py_functions">Functions</a>.</p>
  <h3>Text vs bytes</h3>
  <p><code>str</code> is text for humans, like "café". But files and the network only carry raw numbers 0–255, called <code>bytes</code>. <strong>Encoding</strong> is the rule that turns text into bytes; UTF-8 is the common one. <code>encode</code> turns text into bytes; <code>decode</code> turns bytes back. The "é" needs two bytes in UTF-8, so the text has 4 characters but 5 bytes.</p>
  <div class="fx" data-lang="py">s = "café"
b = s.encode("utf-8")
print(len(s), len(b), b)
print(b.decode("utf-8"))</div>
  <div class="fx" data-lang="text">4 5 b'caf\\xc3\\xa9'
café</div>
  <p>You rarely touch bytes directly until you read files or call web APIs; <a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a> picks this up.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>type</strong> (class) defines a set of values and the operations allowed on them. The basic built-in types are <code>int</code>, <code>float</code>, <code>bool</code> (a subtype of int), <code>str</code>, <code>bytes</code> and <code>NoneType</code>. <code>type(x)</code> returns the type; <code>isinstance(x, T)</code> asks "is x a T (or a subtype of T)?". Python is <strong>strongly typed</strong> (no silent conversions between unrelated types) and <strong>dynamically typed</strong> (types belong to objects, not to names; see section 03).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Data read from outside is text. <code>"2" + "3"</code> is "23" and <code>"15" * 3</code> is "151515" with no error at all. Convert at the boundary: <code>qty = int(qty_text)</code> as soon as the text arrives.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Names.</b> We can make values, but each one disappears after its line. To use the price of chai in ten places, we need a way to refer to the same value again.</div>

  <h2 id="pv-names"><span class="num">03</span>Names Are Labels</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We keep typing 30 for chai. If the price changes, we must find every 30 in the program. We want to write the value once and refer to it by a name. But what exactly happens when we write <code>price_chai = 30</code>, and what happens when two names refer to one value?</p>
  </div>
  <p>In school maths, <code>x = 5</code> means "x is 5". Many people imagine a variable as a box with the value inside. In Python that picture is wrong, and it causes real bugs.</p>
  <p>In Python, the value is an object somewhere in memory (section 01). A variable is only a <strong>name</strong> that points to an object. The name does not hold the value; it is a label stuck on it. <code>price_chai = 30</code> is read right to left: "make (or find) the object 30, then stick the label <i>price_chai</i> on it." This pointing is called a <strong>reference</strong>, and attaching a name is called <strong>binding</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A variable is a sticky note (or a luggage tag), not a box. Two sticky notes can be stuck on one jar. Moving a note to another jar does not move the jar, and does not affect the other note.</p></div>
  <h3>Traced: a price change</h3>
  <p>Chai costs 30. We save the old price under a second name, then raise chai to 35. Does the old price change too? Trace it before running anything. The right column is what the "sticky notes" point at after each line.</p>
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
  <p>After step 2, <code>is</code> is True and the ids are equal: one object, two labels. After step 3 the ids differ: <code>price_chai</code> moved, <code>old_price</code> did not. Assignment never copies an object and never changes one; it only moves a label. This is the single most important sentence of the note.</p>
  <h3>Traced: one order slip, two names</h3>
  <p>With a list (an ordered collection, written with square brackets; full story in <a class="xref" data-note="py_ds">Data Structures</a>), something new can happen. You can change the list itself, for example add an item, without moving any label. This is called <strong>mutating</strong> it. Moving a label to a different object is called <strong>rebinding</strong>. The waiter writes Asha's order and hands the kitchen the <em>same</em> slip.</p>
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
  <p>The last line asks two different questions about two names. <code>==</code> asks "do they hold the same value?" (it calls the object's <code>__eq__</code> method, the method that defines "equal"). <code>is</code> asks "are they the very same object?". The kitchen's slip and a freshly written slip with the same items are <code>==</code>, but only the waiter's own slip <code>is</code> the kitchen's slip.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Mutable vs Immutable.</b> The slip changed in place but the price 30 never did; raising the price needed a new object. Which objects can be changed in place, which cannot, and why does Python need both kinds?</div>

  <h2 id="pv-mut"><span class="num">04</span>Mutable vs Immutable</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 03 showed that a list can be changed in place while two names share it. When we write <code>total += 45</code> on a running total, is the total changed in place too? If not, why do lists and ints behave differently?</p>
  </div>
  <p>Python splits objects into two kinds.</p>
  <ul>
    <li><strong>Mutable</strong> — "can change". The same object can be edited in place; its id stays the same. Lists, dicts and sets are mutable.</li>
    <li><strong>Immutable</strong> — "can never change". Any "change" builds a brand-new object, and the name is moved to it; the id changes. Numbers, strings, tuples and bools are immutable.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Immutable is a printed receipt: to "change" the amount you print a new receipt and throw the label onto it. Mutable is the waiter's order pad: same pad, new lines written on it.</p></div>
  <h3>Traced with an int</h3>
  <p>The till keeps a running total. After the chai line it is 60; then we add the samosas (45).</p>
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
  <h3>Traced with a list</h3>
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
  <h3>Why it matters: sharing</h3>
  <p>You and your brother share one shopping list. If he adds "vada pav", you see it too, because there is only one list. If you want your own list, make a real copy with <code>.copy()</code>.</p>
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
  <h3>Why Python needs both kinds</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Type Conversion.</b> We now know what values are and how names hold them. But values often arrive as the wrong type (the tablet sends "2"), and the bill must turn 184.275 into whole rupees. How do we convert, and what goes wrong?</div>

  <h2 id="pv-conv"><span class="num">05</span>Type Conversion and Its Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The tablet sends the quantity as "2". The tax makes 184.275, but customers pay whole rupees. A form sends "False" for "member?". We need to turn values of one type into another type, and we need to know where that silently goes wrong.</p>
  </div>
  <p>To convert, call the type like a function: <code>int(x)</code>, <code>float(x)</code>, <code>str(x)</code>, <code>bool(x)</code>, <code>list(x)</code>, <code>tuple(x)</code>. Each builds a <em>new</em> object of that type from the old one. Python never does it for you between text and numbers (section 02), but it does mix int and float automatically in maths (<code>195 * 0.9</code> is a float).</p>
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
  <h3>Trap 1: floats are not exact</h3>
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
  <h3>Trap 2: rounding halves</h3>
  <p>Our bills end in .275, .5 and .5. Python's <code>round()</code> uses <strong>banker's rounding</strong>: an exact half goes to the nearest <em>even</em> number, so that over many numbers the rounding errors cancel instead of always pushing up. On Chai Corner's three tables:</p>
  <table class="tbl"><caption>The three bills before rounding</caption>
    <tr><th>Table</th><th>Subtotal</th><th>After discount</th><th>+ 5% GST</th><th><code>round()</code></th><th>"School" rounding (half up)</th></tr>
    <tr><td>Asha</td><td>195</td><td>175.5</td><td>184.275</td><td>184</td><td>184</td></tr>
    <tr><td>Ben</td><td>70</td><td>70</td><td>73.5</td><td>74 (74 is even)</td><td>74</td></tr>
    <tr><td>Chen</td><td>50</td><td>50</td><td>52.5</td><td><b>52</b> (52 is even)</td><td><b>53</b></td></tr>
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
  <p>Line by line: Chen's 52.5 rounds to 52, not 53. <code>round(2.675, 2)</code> gives 2.67 because 2.675 is really stored as 2.67499999…, so even "half up" logic would see less than a half. <code>Decimal</code> stores numbers in base 10, the way we write them: <code>Decimal("0.1") + Decimal("0.2")</code> is exactly 0.3, and <code>quantize(..., ROUND_HALF_UP)</code> rounds the way a shop expects (52.5 → 53). The last line shows why Decimal must be built from <em>text</em>: built from the float 0.1, it faithfully copies the float's error.</p>
  <h3>Trap 3: truthiness</h3>
  <p>Every value can be asked "are you true?" with <code>bool(x)</code>, and <code>if</code> asks this automatically (next note). The rule is simple: <strong>empty or zero is False, everything else is True</strong>.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Operators.</b> We have the right values in the right types, held by names. Now we must combine them: multiply, add, compare with 150, and combine conditions. What exactly does each operator do, especially with negatives and with <code>and</code>/<code>or</code>?</div>

  <h2 id="pv-ops"><span class="num">06</span>Operators</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have prices, quantities and rules. To get a bill we must build new values from old ones: 2 × 30, 60 + 45 + 90, "is 195 at least 150?", "is the item on the menu?". Which symbols does Python give us, and where do they surprise people?</p>
  </div>
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
  <h3>Arithmetic: three kinds of division</h3>
  <p>You have 17 laddoos and 5 kids. <code>/</code> gives the exact share (3.4). <code>//</code> gives whole laddoos per kid (3); this is <strong>floor division</strong>, it rounds down. <code>%</code> gives the laddoos left over (2); this is the <strong>remainder</strong> or <strong>modulo</strong>. <code>divmod</code> gives both at once.</p>
  <div class="fx" data-lang="py">laddoos, kids = 17, 5
print(laddoos / kids)    # exact share
print(laddoos // kids)   # whole laddoos each
print(laddoos % kids)    # left over
print(divmod(laddoos, kids))</div>
  <div class="fx" data-lang="text">3.4
3
2
(3, 2)</div>
  <p>The same pair at the till: Asha pays ₹200 for a ₹184 bill. How many ten-rupee notes and how many rupees in coins go back?</p>
  <div class="fx" data-lang="py">paid, bill = 200, 184
change = paid - bill
print(f"change {change}: {change // 10} ten-rupee note(s) and {change % 10} rupees in coins")</div>
  <div class="fx" data-lang="text">change 16: 1 ten-rupee note(s) and 6 rupees in coins</div>
  <h3>Traced: <code>//</code> and <code>%</code> on negatives</h3>
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
  <p><code>int(-7 / 2)</code> is −3: <code>int()</code> cuts toward zero (section 05), so it is <em>not</em> the same as <code>//</code> for negatives. The useful consequence: the sign of <code>a % b</code> follows <code>b</code>, so <code>x % 60</code> is always in 0…59. "30 minutes before 00:00" is minute 30 of the previous hour. C and Java give −30 here; Python's choice is the one clocks and calendars need.</p>
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
  <p><code>total += 60</code> is short for <code>total = total + 60</code>. It reads the old value, computes, and rebinds (for ints, a new object each time, section 04). Here the running total for Asha grows line by line, then the discount and the tax are applied with <code>-=</code> and <code>*=</code>.</p>
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
  <p>Two everyday uses: a default (<code>name or "Guest"</code>) and a guard (<code>coupon is not None and coupon.startswith("CHAI")</code>: the method is only called when it is safe). The last line is the trap: <code>qty or 1</code> also replaces a genuine 0, because 0 is falsy. When 0 is a valid value, write <code>qty if qty is not None else 1</code> (a conditional expression, next note).</p>
  <h3>Identity and membership</h3>
  <p><code>is</code> / <code>is not</code> test "same object" (section 03). <code>in</code> / <code>not in</code> test "is it inside?": for a list, is it one of the items; for text, is it a substring; for a dict, is it one of the <em>keys</em>.</p>
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
  <p>Speed differs: <code>in</code> on a list checks items one by one, so the time grows with the number of items, written <strong>O(n)</strong>. A set or dict jumps straight to the answer using the hash (section 04), the same time no matter how many items, written <strong>O(1)</strong>. For a 4-item menu it does not matter; for a million customer ids it decides whether your code takes a second or an hour (details in <a class="xref" data-note="py_ds">Data Structures</a>).</p>
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
  <div class="bridge"><b>What this still can't tell us → next: The Bill as One Expression.</b> We have every operator we need. Can we compute Asha's whole bill with values, names and operators alone, and where does that approach break?</div>

  <h2 id="pv-bill"><span class="num">07</span>The Bill as One Expression</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section gave us one piece: values, types, names, conversion, operators. Do they add up to a working bill for Asha? And is anything still missing?</p>
  </div>
  <p>Here is everything from this note in one block. Read it as a chain: values (01) get names (03); operators (06) build the subtotal; a comparison makes a bool; the bool is used as a number (section 02: True is 1); float maths (05) gives the tax; <code>round</code> (05) gives whole rupees.</p>
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
  <table class="tbl"><caption>Every number in the bill, and the concept that made it</caption>
    <tr><th>Name</th><th>Value</th><th>Type</th><th>Made by</th><th>Section</th></tr>
    <tr><td>chai, samosa, coffee</td><td>30, 15, 90</td><td>int</td><td>literals + names</td><td>01, 03</td></tr>
    <tr><td>subtotal</td><td>195</td><td>int</td><td><code>*</code> and <code>+</code>, order of operations</td><td>06</td></tr>
    <tr><td>eligible</td><td>True</td><td>bool</td><td>comparison <code>&gt;=</code></td><td>06</td></tr>
    <tr><td>discount</td><td>19.5</td><td>float</td><td>int × float × bool (True = 1)</td><td>02, 05</td></tr>
    <tr><td>after</td><td>175.5</td><td>float</td><td><code>-</code></td><td>06</td></tr>
    <tr><td>tax</td><td>8.775</td><td>float</td><td><code>*</code> with 0.05</td><td>06</td></tr>
    <tr><td>total</td><td>184</td><td>int</td><td><code>round()</code> (half to even)</td><td>05</td></tr>
  </table>
  <p>It works: ₹184, the same as by hand. But look honestly at two weak spots:</p>
  <ul>
    <li><b>The discount is a trick.</b> <code>subtotal * 0.10 * eligible</code> works only because True happens to equal 1. A real rule ("10% if ≥ 150, 15% if ≥ 300, members always 5%") cannot be written this way. The program needs to <em>choose</em> what to do.</li>
    <li><b>The order is hard-coded.</b> "2 chai, 3 samosa, 1 coffee" is typed into the expression. Ben's order needs a new expression, Chen's another. An order with 12 lines needs a 12-term expression. The program needs to <em>repeat</em> one step for every line of any order.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Clever arithmetic with bools (<code>price * is_member</code>) is legal but unreadable and breaks as soon as the rule has three cases. Use it only for counting (<code>sum(flags)</code>). Decisions belong in <code>if</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="py_control">Decisions &amp; Loops</a>.</b> Values and operators compute one fixed bill. To choose a discount and to walk through any order line by line, a program needs <code>if</code> and <code>for</code>. First, this note's concepts in one picture.</div>

  <h2 id="pv-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Objects, types, names, mutability, conversion, operators: six separate topics, or one system? How does each one depend on the ones before it?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="pv-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="10" width="180" height="46" rx="7" class="fb sb"/><text x="340" y="30" text-anchor="middle" font-size="12" font-weight="700">object</text><text x="340" y="46" text-anchor="middle" class="tm" font-size="10">type · identity · value</text>
<line x1="290" y1="56" x2="130" y2="92" stroke="currentColor" marker-end="url(#pv-a9)"/><line x1="340" y1="56" x2="340" y2="92" stroke="currentColor" marker-end="url(#pv-a9)"/><line x1="390" y1="56" x2="550" y2="92" stroke="currentColor" marker-end="url(#pv-a9)"/>
<rect x="30" y="94" width="200" height="46" rx="7" class="ft st"/><text x="130" y="114" text-anchor="middle" font-size="12" font-weight="700">type</text><text x="130" y="130" text-anchor="middle" class="tm" font-size="10">int 30 · str "30" · bool · None</text>
<rect x="250" y="94" width="180" height="46" rx="7" class="ft st"/><text x="340" y="114" text-anchor="middle" font-size="12" font-weight="700">identity → names</text><text x="340" y="130" text-anchor="middle" class="tm" font-size="10">labels; is vs ==; aliases</text>
<rect x="450" y="94" width="200" height="46" rx="7" class="ft st"/><text x="550" y="114" text-anchor="middle" font-size="12" font-weight="700">value → mutability</text><text x="550" y="130" text-anchor="middle" class="tm" font-size="10">can the value change in place?</text>
<line x1="130" y1="140" x2="130" y2="176" stroke="currentColor" marker-end="url(#pv-a9)"/><line x1="340" y1="140" x2="490" y2="176" stroke="currentColor" marker-end="url(#pv-a9)"/><line x1="550" y1="140" x2="550" y2="176" stroke="currentColor" marker-end="url(#pv-a9)"/>
<rect x="30" y="178" width="200" height="46" rx="7" class="fg sg"/><text x="130" y="198" text-anchor="middle" font-size="12" font-weight="700">conversion</text><text x="130" y="214" text-anchor="middle" class="tm" font-size="10">int("2") · round(184.275) = 184</text>
<rect x="420" y="178" width="230" height="46" rx="7" class="fr sr"/><text x="535" y="198" text-anchor="middle" font-size="12" font-weight="700">sharing bugs · hashability</text><text x="535" y="214" text-anchor="middle" class="tm" font-size="10">kitchen sees the append; only immutables as keys</text>
<line x1="130" y1="224" x2="270" y2="250" stroke="currentColor" marker-end="url(#pv-a9)"/><line x1="340" y1="140" x2="340" y2="248" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pv-a9)"/>
<rect x="200" y="250" width="280" height="44" rx="7" class="fg sg"/><text x="340" y="269" text-anchor="middle" font-size="12" font-weight="700">operators → expressions</text><text x="340" y="285" text-anchor="middle" class="tm" font-size="10">2*30 + 3*15 + 90 = 195 → bill ₹184</text>
</svg><figcaption>Everything grows from one idea: a value is an object with a type, an identity and a value. The type decides conversions and operators; the identity is what names point at (and what <code>is</code> compares); whether the value can change decides sharing bugs and which objects can be dict keys.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Chai Corner</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the running example</th><th>Use / watch for</th></tr>
    <tr><td>Object</td><td>—</td><td>how is a value held?</td><td>"samosa": type str, an id, value s-a-m-o-s-a</td><td>everything is one</td></tr>
    <tr><td>Type</td><td>object's first fact</td><td>what can it do?</td><td>30 * 3 = 90 but "30" * 3 = "303030"</td><td>convert outside data at once</td></tr>
    <tr><td>Name</td><td>object's identity</td><td>how do we reuse a value?</td><td>price_chai → 30; old_price → same 30</td><td>assignment never copies</td></tr>
    <tr><td>== vs is</td><td>value vs identity</td><td>same value or same object?</td><td>kitchen == fresh, kitchen is not fresh</td><td><code>is</code> only for None and same-object checks</td></tr>
    <tr><td>Mutability</td><td>can the value change?</td><td>does a change show through other names?</td><td>append: same id; total += 45: new id (105)</td><td>copy before editing shared lists</td></tr>
    <tr><td>Hashable</td><td>immutability</td><td>can it be a dict key?</td><td>("chai", "large") yes, ["chai", "large"] no</td><td>dict keys, set items</td></tr>
    <tr><td>Conversion</td><td>types</td><td>how to get the right type?</td><td>int("2") = 2; round(52.5) = 52</td><td>int("3.5") fails; floats inexact</td></tr>
    <tr><td>Truthiness</td><td>conversion to bool</td><td>is it "empty"?</td><td>bool(195) True, bool("False") True</td><td>compare text flags explicitly</td></tr>
    <tr><td>Arithmetic</td><td>int/float types</td><td>how to compute?</td><td>195; change 16 = 1 note + 6 coins</td><td>// and % on negatives</td></tr>
    <tr><td>Comparison / logical</td><td>bool</td><td>is a rule met?</td><td>195 &gt;= 150 → True</td><td>short-circuit returns an operand</td></tr>
    <tr><td>Membership</td><td>containers, hashing</td><td>is it inside?</td><td>"samosa" in menu → True</td><td>list O(n), set/dict O(1)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a name is a label on an object, and the object's type decides what operators can do with it.</strong> Labels explain aliasing and <code>is</code>; types explain conversions and every operator's behaviour; mutability explains which "changes" are visible through other labels.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing how the pieces fit is half the job; the other half is knowing where people usually go wrong with them.</div>

  <h2 id="pv-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which of these ideas cause the most real bugs and interview mistakes, and what is the one-line fix for each?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page for revision.</div>

  <h2 id="pv-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Chai Corner menu chai 30, samosa 15, vada pav 20, cold coffee 90. Asha orders 2 chai, 3 samosa, 1 cold coffee. Rules: 10% off at ₹150+, then 5% GST, round to rupees.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on Chai Corner</th><th>Weakness → next</th></tr>
    <tr><td>Object</td><td>how is a value held?</td><td>"samosa": type str, an id, its letters</td><td>what can it do?</td></tr>
    <tr><td>Type</td><td>what can a value do?</td><td>30 * 3 = 90; "15" * 3 = "151515"</td><td>can't refer to it again</td></tr>
    <tr><td>Name</td><td>how to reuse a value?</td><td>price_chai = 30; old_price shares it</td><td>shared changes?</td></tr>
    <tr><td>Mutability</td><td>which objects change in place?</td><td>append keeps id; total += 45 → new 105</td><td>wrong types arrive</td></tr>
    <tr><td>Conversion</td><td>how to change type?</td><td>int("2") = 2; round(184.275) = 184; round(52.5) = 52</td><td>need to combine values</td></tr>
    <tr><td>Operators</td><td>how to compute new values?</td><td>2*30 + 3*15 + 90 = 195 → ₹184</td><td>can't choose or repeat → <a class="xref" data-note="py_control">Decisions &amp; Loops</a></td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>Object</b>: data in memory with a fixed type, a fixed identity (<code>id</code>) and a value.</li>
    <li><b>Variable / name</b>: a label bound to an object. Assignment binds; it never copies.</li>
    <li><b>Rebind</b>: move a name to another object (<code>a = ...</code>). <b>Mutate</b>: change the object itself (<code>a.append(...)</code>); visible through all aliases.</li>
    <li><b>Mutable</b>: list, dict, set. <b>Immutable</b>: int, float, bool, str, bytes, tuple, frozenset, None.</li>
    <li><b>Hashable</b>: has a hash that never changes; required for dict keys and set items.</li>
    <li><b>Truthiness</b>: False, None, 0, 0.0, "", [], {}, set(), () are falsy; everything else truthy.</li>
    <li><b>Short-circuit</b>: <code>and</code>/<code>or</code> stop once the answer is known and return the operand they stopped at.</li>
  </ul>
  <h3>Rules and formulas</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Formula / behaviour</th><th>Example</th></tr>
    <tr><td>Floor division</td><td><code>a // b = ⌊a / b⌋</code> (toward −∞)</td><td><code>-7 // 2 = -4</code></td></tr>
    <tr><td>Remainder</td><td><code>a % b = a − b·(a // b)</code>; sign follows b</td><td><code>-7 % 2 = 1</code>, <code>-30 % 60 = 30</code></td></tr>
    <tr><td>int() from float</td><td>truncate toward zero</td><td><code>int(-17.9) = -17</code></td></tr>
    <tr><td>round()</td><td>half to even</td><td><code>round(52.5) = 52</code>, <code>round(73.5) = 74</code></td></tr>
    <tr><td>and / or</td><td><code>x and y</code>: x if falsy else y; <code>x or y</code>: x if truthy else y</td><td><code>"" or "Guest"</code> → "Guest"</td></tr>
    <tr><td>Chained comparison</td><td><code>a &lt; b &lt; c</code> = <code>a &lt; b and b &lt; c</code></td><td><code>150 &lt;= 195 &lt; 300</code> → True</td></tr>
    <tr><td>Precedence</td><td><code>**</code> &gt; unary − &gt; <code>* / // %</code> &gt; <code>+ -</code> &gt; comparisons &gt; not &gt; and &gt; or</td><td><code>-2 ** 2 = -4</code></td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Asha</th><th>Ben</th><th>Chen</th></tr>
    <tr><td>Subtotal</td><td>195</td><td>70</td><td>50</td></tr>
    <tr><td>Discount (10% if ≥ 150)</td><td>19.5</td><td>0</td><td>0</td></tr>
    <tr><td>After discount</td><td>175.5</td><td>70</td><td>50</td></tr>
    <tr><td>GST 5%</td><td>8.775</td><td>3.5</td><td>2.5</td></tr>
    <tr><td>Before rounding</td><td>184.275</td><td>73.5</td><td>52.5</td></tr>
    <tr><td><code>round()</code></td><td>184</td><td>74</td><td>52 (half-up: 53)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b><code>==</code></b><p>Comparing values: numbers, text, lists.</p><small>Never for floats: math.isclose</small></div>
    <div><b><code>is</code></b><p><code>x is None</code>, and "is this the very same object?"</p><small>Never for numbers or strings</small></div>
    <div><b>float</b><p>Measurements, maths, ML features.</p><small>Not for money: Decimal from text, or int paise</small></div>
    <div><b>tuple vs list</b><p>Tuple for fixed records and dict keys; list for a collection that grows.</p><small>A tuple holding a list is not hashable</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p><code>b = a</code> is not a copy; string methods return new strings; text from outside must be converted; <code>int("3.5")</code> fails; <code>0.1 + 0.2 != 0.3</code>; <code>round(52.5) == 52</code>; <code>bool("False")</code> is True; <code>-7 // 2 == -4</code>; <code>x or default</code> eats 0; <code>and</code> fails on arrays.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>a = [1]; b = a; b.append(2); print(a)</code>?</td><td><code>[1, 2]</code>: one list, two names</td></tr>
    <tr><td><code>print(int(-17.9), -17 // 5, -17 % 5)</code>?</td><td><code>-17 -4 3</code></td></tr>
    <tr><td><code>print(round(52.5), round(53.5))</code>?</td><td><code>52 54</code> (half to even)</td></tr>
    <tr><td><code>print("" or "Guest", 0 and 1/0, bool("0"))</code>?</td><td><code>Guest 0 True</code></td></tr>
    <tr><td>Why can a tuple be a dict key but not a list?</td><td>Keys need a hash that never changes; tuples are immutable, lists are not</td></tr>
  </table>

  <h2 id="pv-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What three things does every Python object have?</summary><div class="qa-body">A type (what kind of object, fixed), an identity (which object, fixed; <code>id()</code>, the memory address in CPython) and a value (what it holds; changeable only for mutable types). For "samosa": str, some id, the six letters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>is</code> and <code>==</code>?</summary><div class="qa-body"><code>==</code> compares values (calls <code>__eq__</code>). <code>is</code> checks if both names point to the same object (same <code>id</code>). <code>[1,2] == [1,2]</code> is True; <code>[1,2] is [1,2]</code> is False. Use <code>is</code> for <code>None</code>, because a class can change what <code>==</code> means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Mutable vs immutable: examples, and why it matters.</summary><div class="qa-body">Mutable (list, dict, set) change in place and keep their id. Immutable (int, float, str, tuple) make a new object on every "change". It matters for: (1) sharing — two names on one mutable object see each other's edits; (2) hashing — only immutables can be dict keys / set items; (3) safety — immutables are safe to pass around.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>After <code>a = [1]; b = a; b.append(2)</code>, what is <code>a</code>? How do you avoid it?</summary><div class="qa-body"><code>[1, 2]</code>. <code>b = a</code> only adds a second name to the same list. To get an independent list, copy it: <code>b = a.copy()</code> (or <code>list(a)</code>, <code>a[:]</code>); for nested lists, <code>copy.deepcopy</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>total = 60; t2 = total; total += 45</code>. What is t2, and why is this different from the list case?</summary><div class="qa-body">t2 is still 60. Ints are immutable, so <code>+=</code> builds a new object 105 and moves only the label <code>total</code>. With a list, <code>+=</code> extends the same object, so every alias sees the change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>print(0.1 + 0.2 == 0.3, round(2.5), -7 // 2)</code></summary><div class="qa-body"><code>False 2 -4</code>. Floats are binary approximations. <code>round</code> sends halves to the even number. <code>//</code> rounds down toward −∞.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should a shop store and round money in Python?</summary><div class="qa-body">Not in floats. Use <code>Decimal</code> built from strings (<code>Decimal("175.5")</code>) and <code>quantize(Decimal("1"), rounding=ROUND_HALF_UP)</code>, or count whole paise as ints. Plain <code>round(52.5)</code> gives 52 and <code>round(2.675, 2)</code> gives 2.67.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>int("3.5")</code> fail while <code>int(3.5)</code> works?</summary><div class="qa-body"><code>int()</code> on text only parses whole-number text. On a float it truncates toward zero. Use <code>int(float("3.5"))</code> (3) or <code>round(float("3.5"))</code> (4).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does short-circuit evaluation return, and where is it useful?</summary><div class="qa-body"><code>A and B</code> returns A if A is falsy, else B. <code>A or B</code> returns A if A is truthy, else B. The right side may never run. Uses: <code>name = given or "Guest"</code>, <code>obj is not None and obj.method()</code>. Careful: <code>x or default</code> also replaces valid falsy values like 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>df[df.a &gt; 1 and df.b &lt; 5]</code> fail?</summary><div class="qa-body"><code>and</code> needs one True/False for the whole Series, which is ambiguous → ValueError. Use element-wise <code>(df.a &gt; 1) &amp; (df.b &lt; 5)</code>. Brackets are needed because <code>&amp;</code> binds tighter than comparisons.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does "names are labels" explain both the aliasing bug and why <code>is</code> exists?</summary><div class="qa-body">Because a name stores a reference, not a value, two names can reference one object (aliasing). Then "same value?" and "same object?" become different questions, so Python needs both <code>==</code> and <code>is</code>. If variables were boxes holding copies, neither the bug nor <code>is</code> would exist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must dict keys be immutable? What breaks if you skip that rule?</summary><div class="qa-body">A dict files each key under its hash. If a key's value could change, its hash would change, and the dict would look in the wrong slot: the entry would be lost or duplicated. So Python only accepts hashable (immutable) keys; a list key raises TypeError.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: in our bill, <code>discount = subtotal * 0.10 * eligible</code> works. Why is it still the wrong tool, and what replaces it?</summary><div class="qa-body">It works only because bool is an int (True = 1). A rule with three or more cases (15% at ₹300, member discounts) cannot be expressed this way, and readers must decode it. The program needs to choose between actions: <code>if/elif/else</code>, the first topic of <a class="xref" data-note="py_control">Decisions &amp; Loops</a>.</div></details>
</main>
`
});
