// notes/python/py_values.js — Values, Types & Variables
Object.assign(TOPIC_CONTENT, {
  "py_values": `<main>
<h1>Values, Types &amp; Variables</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Values, Types &amp; Variables</span></div>
  <p class="lead">Every program works with data: prices, names, quantities, yes/no answers. This page is about how Python represents that data, what kinds of data there are, and what a variable really is. That last question matters more than it sounds. Most people picture a variable as a box holding a value, and that picture causes the classic Python bugs: a "copied" list that changes behind your back, <code>is</code> used where <code>==</code> was meant, a column of numbers from a file that turns out to be text, and money that drifts by a fraction of a paisa because of how computers store decimals. We will use one running example throughout, the bill for a table at a chai stall that sells masala chai for ₹30, samosas for ₹15, vada pav for ₹20 and cold coffee for ₹90. The table orders 2 chai, 3 samosas and 1 cold coffee, gets 10% off because the bill is at least ₹150, and pays 5% tax.</p>

  <h2 id="pv-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Values, Types &amp; Variables</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Objects and types</div>
        <ul>
          <li>Every value is an <b>object</b>: type + identity + value</li>
          <li><b>int</b> (any size), <b>float</b> (binary, approximate), <b>bool</b> (a kind of int), <b>str</b>, <b>None</b></li>
          <li>Strong typing: <code>"2" + 3</code> → TypeError</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Names</div>
        <ul>
          <li>A variable is a <b>name</b> pointing at an object, not a box</li>
          <li><code>b = a</code> gives a second name, never a copy</li>
          <li><code>==</code> same value; <code>is</code> same object</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mutability</div>
        <ul>
          <li><b>Immutable</b>: int, float, str, tuple → "changes" make new objects</li>
          <li><b>Mutable</b>: list, dict, set → edited in place, seen by every name</li>
          <li>Only immutable (hashable) values can be dict keys</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li><code>0.1 + 0.2 != 0.3</code>; <code>round(52.5) == 52</code>; use Decimal for money</li>
          <li><code>bool("False")</code> is True</li>
          <li><code>-7 // 2 == -4</code>; <code>x or default</code> also replaces 0</li>
          <li>numpy/pandas: <code>&amp;</code> with brackets, not <code>and</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pv-values"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Values and Objects</span><span class="rm-sub">literals, expressions, type, identity, value</span></div></div>
      <div class="rm-item rm-done" data-target="pv-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Basic Types</span><span class="rm-sub">int, float, bool, str, None, bytes</span></div></div>
      <div class="rm-item rm-done" data-target="pv-names"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Variables Are Names</span><span class="rm-sub">binding, rebinding, naming rules</span></div></div>
      <div class="rm-item rm-done" data-target="pv-is"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Equality and Identity</span><span class="rm-sub">== versus is</span></div></div>
      <div class="rm-item rm-done" data-target="pv-mut"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Mutable and Immutable Objects</span><span class="rm-sub">editing in place, copies, dict keys</span></div></div>
      <div class="rm-item rm-done" data-target="pv-conv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Converting Between Types</span><span class="rm-sub">int(), float(), str() and their rules</span></div></div>
      <div class="rm-item rm-done" data-target="pv-float"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Floats, Rounding and Decimal</span><span class="rm-sub">why 0.1 + 0.2 is not 0.3</span></div></div>
      <div class="rm-item rm-done" data-target="pv-truth"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Truthiness</span><span class="rm-sub">which values count as true or false</span></div></div>
      <div class="rm-item rm-done" data-target="pv-ops"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Arithmetic and Comparison Operators</span><span class="rm-sub">/, //, %, precedence, chains</span></div></div>
      <div class="rm-item rm-done" data-target="pv-logic"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Logical, Membership and Bitwise Operators</span><span class="rm-sub">and/or, in, &amp; for arrays</span></div></div>
      <div class="rm-item rm-done" data-target="pv-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">aliasing, text as numbers, float equality</span></div></div>
      <div class="rm-item rm-done" data-target="pv-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">types, rules and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pv-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">mutability, copying, floats, operators</span></div></div>
    </div>
  </div>

  <h2 id="pv-values"><span class="num">01</span>Values and Objects</h2>
  <p>A <strong>value</strong> is a single piece of data: the number 30, the text "masala chai", the answer "yes". When you write a value directly into your code, like <code>30</code> or <code>"masala chai"</code>, it is called a <strong>literal</strong>, because you are literally writing the value itself. The built-in function <code>print()</code> shows values on the screen, so it is the easiest way to look at them:</p>
  <div class="fx" data-lang="py">print(30)                         # the price of a masala chai
print(15, 20, 90)                 # samosa, vada pav, cold coffee
print("masala chai")              # a piece of text
print(17.5)                       # a number with a decimal point
print(True, None)                 # a yes/no answer, and "nothing yet"
print(2 * 30 + 3 * 15 + 1 * 90)   # an expression: Python works out the value</div>
  <div class="fx" data-lang="text">30
15 20 90
masala chai
17.5
True None
195</div>
  <p>Each line prints the values it was given. Text is written between quotes, and the quotes are not part of the text, which is why "masala chai" prints without them. <code>True</code> is Python's "yes", and <code>None</code> is a special value meaning "nothing here yet". The last line is different: <code>2 * 30 + 3 * 15 + 1 * 90</code> is not a single value but an <strong>expression</strong>, a piece of code that Python <em>evaluates</em>, that is, works out, to produce a value. Here it works out our table's bill before discount, 195.</p>
  <p>Inside the computer, every value lives in memory as an <strong>object</strong>. An object is a piece of data that also knows what kind of thing it is. Every object has exactly three properties. Its <strong>type</strong> says what kind of thing it is (a whole number, some text) and therefore which operations make sense on it. Its <strong>identity</strong> says which particular object it is, as distinct from every other object, even one that looks identical. Its <strong>value</strong> is the data it holds. Think of a packet of biscuits on a shop shelf. Its type is the category printed on the box, "biscuits", which tells you what you can do with it (eat it, not wash with it). Its identity is the serial number stamped on that one packet: two packets of the same biscuits are still two different packets. Its value is what is inside. Python lets you ask an object for all three:</p>
  <div class="fx" data-lang="py">item = "samosa"
print(type(item))                 # 1. what kind of object: its type
print(id(item))                   # 2. which object: its identity
print(item)                       # 3. what it holds: its value
print(len(item), item.upper(), item + "s")</div>
  <div class="fx" data-lang="text">&lt;class 'str'&gt;
140142661977744
samosa
6 SAMOSA samosas</div>
  <p><code>type(item)</code> reports <code>&lt;class 'str'&gt;</code>: the object is a string, Python's type for text ("class" is Python's word for a type). <code>id(item)</code> reports a long number that is the object's identity; in CPython it is the object's address in memory, so you will see a different number on your machine and on every run. What matters about the id is that one object keeps the same id for its whole life, so two names with equal ids refer to one and the same object. The last line uses three things that the str type allows: <code>len</code> counts its characters (6), <code>.upper()</code> gives a capitalised copy, and <code>+</code> joins text. These operations work because the object is a string; a number does not have <code>.upper()</code>. That is the practical meaning of "the type decides what you can do".</p>
  <p>The type and the identity of an object never change. Whether its value can change depends on the type, which turns out to be one of the most important facts about Python, and has its own section later. One small warning about ids: do not write one down and expect to see it again, because Python may reuse the number for a new object after the old one has been freed.</p>

  <h2 id="pv-types"><span class="num">02</span>The Basic Types</h2>
  <p>Python has a handful of basic types that you will use in every program. Each exists because it represents a different kind of real-world information. A quantity of samosas is a whole number, so it is an <strong>int</strong> (integer). A tax amount like 8.775 needs a decimal point, so it is a <strong>float</strong> (short for "floating-point number", the computer's way of storing decimals). The answer to "does this table get a discount?" is yes or no, so it is a <strong>bool</strong> (Boolean, after the mathematician George Boole), which has exactly two values, <code>True</code> and <code>False</code>. A name like "masala chai" is text, so it is a <strong>str</strong> (string, as in a string of characters). And "the discount has not been decided yet" is represented by <code>None</code>, the only value of the type <strong>NoneType</strong>.</p>
  <p>The type of the values decides what an operation means. Read the code below, and notice especially that the same <code>*</code> symbol does two different jobs:</p>
  <div class="fx" data-lang="py">print(type(30), type(17.5), type("30"), type(True), type(None))
qty, price = 3, 15
print(qty * price)                # int * int: multiplication
print("15" * 3)                   # str * int: repeat the text
print(7 / 2, 6 / 2)               # / always gives a float
print(2 ** 100)                   # ints never overflow
print(True + True, isinstance(True, int))</div>
  <div class="fx" data-lang="text">&lt;class 'int'&gt; &lt;class 'float'&gt; &lt;class 'str'&gt; &lt;class 'bool'&gt; &lt;class 'NoneType'&gt;
45
151515
3.5 3.0
1267650600228229401496703205376
2 True</div>
  <p>The first line confirms the five types. Then <code>qty * price</code> multiplies two ints to get 45, but <code>"15" * 3</code> repeats the text three times to get "151515". Python chose the meaning from the type of the values: number times number is multiplication, text times number is repetition. Division with <code>/</code> always produces a float, even when the answer is whole, so <code>6 / 2</code> is <code>3.0</code> (whole-number division is <code>//</code>, covered with the operators). <code>2 ** 100</code> (two to the power 100) is printed exactly, all 31 digits: Python's ints grow as large as memory allows and never "overflow", unlike integers in C or Java, which have a fixed size. The last line reveals a surprise: <code>True + True</code> is 2, and <code>isinstance(True, int)</code> says a bool <em>is</em> an int. In Python, <code>True</code> behaves as 1 and <code>False</code> as 0, which is why <code>sum([True, False, True])</code> counts the Trues.</p>
  <p>One rule about types prevents a great many bugs. Everything that comes into a program from outside, whether typed by a user with <code>input()</code>, read from a file, or sent by a web form, arrives as <em>text</em>, even if it looks like a number. Python will not quietly treat text as a number for you:</p>
  <div class="fx" data-lang="py">qty_text = "2"                    # what a form, a file or input() gives you
print(qty_text + "3")             # text + text = joined text
print(int(qty_text) + 3)          # convert first, then do arithmetic
try:
    print(qty_text + 3)           # text + number: Python refuses to guess
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">23
5
TypeError: can only concatenate str (not "int") to str</div>
  <p>The first line joins two pieces of text, so "2" + "3" is "23", silently wrong if you meant to add. The second converts the text to an int first with <code>int()</code>, and gets the intended 5. The third tries to add text to a number and Python raises a <code>TypeError</code> instead of guessing whether you wanted "23" or 5. This refusal to mix unrelated types is called <strong>strong typing</strong>. Some languages, such as JavaScript, would quietly produce "23"; Python's choice means the mistake shows up as an error instead of a wrong bill.</p>
  <p><code>None</code> deserves a closer look, because you will meet it constantly. Sometimes a name must exist before its real value is known, such as a discount that has not been decided yet. <code>None</code> is Python's marker for "no value". There is exactly one <code>None</code> object in a program, so the correct way to test for it is <code>is None</code>. You will also meet <code>None</code> without asking for it:</p>
  <div class="fx" data-lang="py">discount = None                   # "not decided yet"
print(discount, type(discount).__name__, discount is None)
result = print("printing returns nothing...")
print(result)</div>
  <div class="fx" data-lang="text">None NoneType True
printing returns nothing...
None</div>
  <p>The first line shows <code>None</code>, its type <code>NoneType</code>, and that <code>discount is None</code> is True. The second part is a trap that catches every beginner. <code>print</code> shows text on the screen, but it gives back nothing, so the value stored in <code>result</code> is <code>None</code>. Any function that does not explicitly hand back a value gives <code>None</code>, which you will see again in <a class="xref" data-note="py_functions">Functions</a>.</p>
  <p>Finally, there is a type you meet as soon as you read files or talk to the network. A <code>str</code> holds text for humans, and can contain any character from any language. But files and networks can only carry raw numbers between 0 and 255, called <strong>bytes</strong>. The rule for turning text into bytes is called an <strong>encoding</strong>, and UTF-8 is the standard one. <code>.encode()</code> turns text into bytes and <code>.decode()</code> turns bytes back into text:</p>
  <div class="fx" data-lang="py">s = "café"
b = s.encode("utf-8")             # text -&gt; bytes
print(len(s), len(b), b)
print(b.decode("utf-8"))          # bytes -&gt; text</div>
  <div class="fx" data-lang="text">4 5 b'caf\\xc3\\xa9'
café</div>
  <p>"café" has 4 characters, but its bytes object has 5 bytes, because UTF-8 needs two bytes for "é" (they show as <code>\\xc3\\xa9</code>, written in hexadecimal). Decoding gets the original text back. You rarely handle bytes directly until you work with files and web requests, which <a class="xref" data-note="py_files">Files &amp; Data Formats</a> picks up.</p>

  <h2 id="pv-names"><span class="num">03</span>Variables Are Names</h2>
  <p>In school maths, <code>x = 5</code> means "x is 5", and many people picture a variable as a labelled box with the value inside. In Python that picture is wrong, and believing it causes real bugs, so it is worth replacing carefully. In Python the value is an object that lives somewhere in memory on its own. A <strong>variable</strong> is just a <strong>name</strong> that refers to an object. The name does not contain the value; it points at it. The line <code>price_chai = 30</code> is best read from right to left: "take the object 30, and attach the name <code>price_chai</code> to it". Attaching a name to an object is called <strong>binding</strong>, and the pointing is called a <strong>reference</strong>.</p>
  <p>The right everyday picture is a luggage tag, or a sticky note. A tag is tied onto a suitcase; it is not the suitcase. Two tags can be tied to the same suitcase. Moving one tag to a different suitcase does not move the suitcase and does not affect the other tag. Let us test this picture:</p>
  <div class="fx" data-lang="py">price_chai = 30
old_price = price_chai            # a second name for the same object 30
print(price_chai, old_price, id(price_chai) == id(old_price))
price_chai = 35                   # the price goes up: move ONE name
print(price_chai, old_price, id(price_chai) == id(old_price))</div>
  <div class="fx" data-lang="text">30 30 True
35 30 False</div>
  <p>After <code>old_price = price_chai</code>, both names print 30 and their ids are equal: there is one object, 30, with two names tied to it. The line did not copy anything; it looked up what <code>price_chai</code> pointed at and tied a second name to that same object. Then <code>price_chai = 35</code> moved the name <code>price_chai</code> to a different object, 35. Moving a name like this is called <strong>rebinding</strong>. The name <code>old_price</code> was not touched and still points at 30, and the ids are no longer equal. The general rule is simple and has no exceptions: <strong>assignment never copies an object and never changes one; it only attaches a name</strong>.</p>
  <p>With numbers this makes little practical difference, but it becomes very important with objects that can be changed, such as lists, which is the subject of section 05. First, a few practical rules about names themselves, shown in code:</p>
  <div class="fx" data-lang="py">chai, samosa = 30, 15             # two names in one line
print(chai, samosa)
chai, samosa = samosa, chai       # swap without a temporary name
print(chai, samosa)

thing = 30
print(type(thing).__name__)
thing = "thirty"                  # the same name can refer to any type
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
  <p>Python lets you bind several names at once, <code>chai, samosa = 30, 15</code>, and the same feature swaps two values in one line without a temporary variable, which is why the second line prints 15 and 30. The middle part shows that a name has no type of its own: <code>thing</code> first refers to an int and then to a str, and Python is happy, because the type belongs to the object, not to the name. This is what <strong>dynamic typing</strong> means. The last part tries three illegal names. A name may contain letters, digits and underscores but may not start with a digit; it may not be a <strong>keyword</strong>, one of Python's reserved words such as <code>if</code>, <code>for</code>, <code>class</code> or <code>def</code>; and it may not contain spaces. Names are case-sensitive, so <code>Price</code> and <code>price</code> are different names. By convention (PEP 8), ordinary names are written in <code>snake_case</code> and constants that should never change, such as <code>GST_RATE = 0.05</code>, in <code>UPPER_CASE</code>.</p>

  <h2 id="pv-is"><span class="num">04</span>Equality and Identity</h2>
  <p>Once you know that names point to objects, a natural question appears: when are two names "the same"? There are two different questions you might mean. Do the two objects hold equal values? Or are the two names pointing at the very same object? Python has a separate operator for each. <code>a == b</code> asks about <strong>equality</strong>: do they hold the same value? <code>a is b</code> asks about <strong>identity</strong>: are they the same object, with the same id? Think of two people who both own the same model of phone. Their phones are equal (same model, same colour), but they are not the same phone. If one person borrows the other's phone, though, there is only one phone with two people using it.</p>
  <div class="fx" data-lang="py">order = ["chai", "samosa"]
kitchen = order                   # same list, second name
fresh = ["chai", "samosa"]        # a separate list with equal contents
print(order == kitchen, order is kitchen)
print(order == fresh, order is fresh)</div>
  <div class="fx" data-lang="text">True True
True False</div>
  <p><code>kitchen = order</code> tied a second name to the same list, so <code>order == kitchen</code> and <code>order is kitchen</code> are both True. <code>fresh</code> is a separately built list with the same contents, so <code>order == fresh</code> is True (equal values) but <code>order is fresh</code> is False (two different objects). Behind the scenes, <code>==</code> asks the object how it defines equality (through a special method called <code>__eq__</code>), while <code>is</code> simply compares ids.</p>
  <p>This leads to a trap that causes bugs that come and go. To save memory, CPython keeps a single shared object for each small integer from −5 to 256, and reuses it every time that number is needed. Larger numbers are created fresh each time:</p>
  <div class="fx" data-lang="py">x = int("1000"); y = int("1000")
print(x == y, x is y)             # equal values, two objects
s = int("7"); t = int("7")
print(s == t, s is t)             # small ints are shared: an implementation detail
coupon = None
print(coupon is None)</div>
  <div class="fx" data-lang="text">True False
True True
True</div>
  <p>Two separately created 1000s are equal but are two objects, so <code>is</code> says False. Two separately created 7s are the <em>same</em> object, because 7 is in the shared range, so <code>is</code> says True. This is a memory-saving detail of one implementation, not a rule of the language, so code that uses <code>is</code> to compare numbers or strings may work in testing and fail in production with different values. The rule is: use <code>==</code> to compare values, and use <code>is</code> only to ask "is this the very same object", which in everyday code mostly means <code>x is None</code>. That is the right style for <code>None</code> because there is only one <code>None</code> object and nothing can pretend to be it, whereas a class can redefine what <code>==</code> means.</p>

  <h2 id="pv-mut"><span class="num">05</span>Mutable and Immutable Objects</h2>
  <p>Here is the problem this section solves. A waiter writes an order as a list, and hands the "same" order to the kitchen. Later the waiter adds a cold coffee. Does the kitchen's order change? With what we know about names, we can predict the answer, but we need one more idea to explain it fully. A <strong>list</strong> is an ordered collection of values written with square brackets, like <code>["chai", "samosa"]</code> (lists have their own note, <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>). Unlike a number, a list can be changed after it is created: you can add to it, remove from it and replace its items. Changing an object itself, rather than moving a name, is called <strong>mutating</strong> it.</p>
  <div class="fx" data-lang="py">order = ["chai", "chai", "samosa"]
kitchen = order                   # the kitchen gets the SAME order slip
order.append("cold coffee")       # mutate: change the list itself
print(kitchen)
order = ["vada pav"]              # rebind: move the name order to a new list
print(order)
print(kitchen)</div>
  <div class="fx" data-lang="text">['chai', 'chai', 'samosa', 'cold coffee']
['vada pav']
['chai', 'chai', 'samosa', 'cold coffee']</div>
  <p>Follow it step by step. <code>kitchen = order</code> ties a second name to the same list. <code>order.append("cold coffee")</code> mutates that list, adding an item to the end, and because <code>kitchen</code> points at the same list, printing <code>kitchen</code> shows the cold coffee too. Then <code>order = ["vada pav"]</code> does something completely different: it builds a brand-new list and moves the name <code>order</code> onto it. That is rebinding, and it does not touch the old list at all, so <code>kitchen</code> still shows the four-item order. The figure shows the two moments side by side.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="pv-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="18" class="tm">after kitchen = order ; order.append(...)</text>
    <rect x="10" y="40" width="64" height="26" rx="5" class="fb sb"/><text x="20" y="58">order</text>
    <rect x="10" y="96" width="64" height="26" rx="5" class="fb sb"/><text x="16" y="114">kitchen</text>
    <rect x="120" y="62" width="170" height="36" rx="6" class="fg sg"/><text x="128" y="85" font-size="11">[chai, chai, samosa, coffee]</text>
    <line x1="74" y1="53" x2="118" y2="74" stroke="currentColor" marker-end="url(#pv-ah)"/>
    <line x1="74" y1="109" x2="118" y2="88" stroke="currentColor" marker-end="url(#pv-ah)"/>
    <text x="320" y="18" class="tm">after order = ["vada pav"]</text>
    <rect x="320" y="40" width="64" height="26" rx="5" class="fb sb"/><text x="330" y="58">order</text>
    <rect x="320" y="96" width="64" height="26" rx="5" class="fb sb"/><text x="326" y="114">kitchen</text>
    <rect x="430" y="30" width="100" height="34" rx="6" class="fv"/><text x="440" y="52">[vada pav]</text>
    <rect x="420" y="96" width="170" height="34" rx="6" class="fg sg"/><text x="428" y="118" font-size="11">[chai, chai, samosa, coffee]</text>
    <line x1="384" y1="53" x2="428" y2="48" stroke="currentColor" marker-end="url(#pv-ah)"/>
    <line x1="384" y1="109" x2="418" y2="112" stroke="currentColor" marker-end="url(#pv-ah)"/>
    <text x="10" y="160" class="tg">mutation: both names see it</text>
    <text x="320" y="160" class="tb">rebinding: only order moves</text>
  </svg><figcaption>On the left, two names share one list, so a change made through either is seen through both. On the right, order has been moved to a new list and kitchen still points at the old one.</figcaption></figure>
  <p>Objects that can be changed in place are called <strong>mutable</strong> ("able to change"): lists, dictionaries and sets are mutable. Objects that can never change are called <strong>immutable</strong>: ints, floats, bools, strings, tuples and <code>None</code> are immutable. An everyday comparison: an immutable object is like a printed receipt, and to "change" the amount you must print a new receipt; a mutable object is like the waiter's order pad, where you keep writing new lines on the same pad. The difference shows up clearly in what happens to the id when we "add" to each kind:</p>
  <div class="fx" data-lang="py">total = 60
before = id(total)
total += 45                       # ints cannot change: a NEW object 105
print(total, id(total) == before)

order = ["chai"]
before = id(order)
order.append("samosa")            # lists can change: same object, edited
print(order, id(order) == before)
order += ["cold coffee"]          # += on a list also edits in place
print(order, id(order) == before)
order = order + ["vada pav"]      # x = x + [...] builds a NEW list
print(order, id(order) == before)</div>
  <div class="fx" data-lang="text">105 False
['chai', 'samosa'] True
['chai', 'samosa', 'cold coffee'] True
['chai', 'samosa', 'cold coffee', 'vada pav'] False</div>
  <p>For the int, <code>total += 45</code> could not change the object 60, because ints are immutable. Python computed 60 + 45, made a new object 105, and moved the name, so the id changed (<code>False</code>). For the list, <code>append</code> edited the same object (<code>True</code>). The next two lines look like the same arithmetic but behave differently: on a list, <code>order += [...]</code> extends the list in place (same id), whereas <code>order = order + [...]</code> builds a new list with <code>+</code> and then rebinds the name to it (new id). The difference only matters when another name shares the list, but then it matters a lot: anyone sharing the list sees the effect of <code>+=</code> but not of <code>= ... +</code>.</p>
  <p>So when you really want an independent list, you must make a copy explicitly:</p>
  <div class="fx" data-lang="py">cart = ["chai", "samosa"]
my_cart = cart                    # same list, two names
my_cart.append("vada pav")
print(cart)

copy_cart = cart.copy()           # a real second list
copy_cart.append("cold coffee")
print(cart)
print(copy_cart)</div>
  <div class="fx" data-lang="text">['chai', 'samosa', 'vada pav']
['chai', 'samosa', 'vada pav']
['chai', 'samosa', 'vada pav', 'cold coffee']</div>
  <p><code>my_cart = cart</code> is just a second name, so appending vada pav through <code>my_cart</code> changes <code>cart</code> too. <code>cart.copy()</code> builds a genuinely new list with the same items, so appending cold coffee to the copy leaves the original alone. (<code>list(cart)</code> and <code>cart[:]</code> make the same kind of copy.) One subtlety: these copies are <strong>shallow</strong>. They create a new outer list, but if the items inside are themselves lists, the inner lists are shared; <code>copy.deepcopy</code> copies everything all the way down, as the Common Mistakes section shows.</p>
  <p>Immutability explains another everyday surprise. Because strings are immutable, string methods never change the string; they return a new one, which you must keep:</p>
  <div class="fx" data-lang="py">item = "samosa"
item.upper()                      # makes a NEW string; nobody keeps it
print(item)
item = item.upper()               # keep the new string by moving the name
print(item)</div>
  <div class="fx" data-lang="text">samosa
SAMOSA</div>
  <p>The first <code>item.upper()</code> created "SAMOSA" and threw it away, because nothing was bound to it, so <code>item</code> still prints "samosa". Binding the result, <code>item = item.upper()</code>, moves the name to the new string.</p>
  <p>Why have immutable types at all, when mutable ones are so convenient? One important reason is lookup tables. A <strong>dictionary</strong> (dict) maps keys to values, like a menu mapping item names to prices. To find a key quickly, the dict computes a number from the key called its <strong>hash</strong> and files the entry under that number, a bit like a library shelving a book by a code computed from its title. If a key could change after being filed, its hash would change and the dict would look in the wrong place and lose it. So only objects whose value can never change are allowed as keys; such objects are called <strong>hashable</strong>:</p>
  <div class="fx" data-lang="py">prices = {("chai", "large"): 40, "samosa": 15}   # tuple and str keys: fine
print(prices[("chai", "large")])
try:
    bad = {["chai", "large"]: 40}                # a list cannot be a key
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">40
TypeError: unhashable type: 'list'</div>
  <p>A tuple (an immutable sequence written with round brackets) and a string work as keys, and the lookup finds 40. A list, which could change, is refused with "unhashable type". Immutability has one limit worth knowing, because interviewers love it: it is only one level deep. A tuple cannot swap its items for other objects, but if one of its items is a list, that list can still change:</p>
  <div class="fx" data-lang="py">t = (["chai"], 30)
t[0].append("samosa")             # the list inside the tuple can change
print(t)
try:
    t[0] += ["vada pav"]          # list grows, THEN storing into the tuple fails
except TypeError as e:
    print("TypeError:", e)
print(t)</div>
  <div class="fx" data-lang="text">(['chai', 'samosa'], 30)
TypeError: 'tuple' object does not support item assignment
(['chai', 'samosa', 'vada pav'], 30)</div>
  <p>Appending to the list inside the tuple works, because the tuple still holds the same list object; only the list's contents changed. The <code>+=</code> line is the famous puzzle. It runs in two steps: first the list extends itself in place (which succeeds), then Python tries to store the result back into slot 0 of the tuple (which fails, because tuples cannot be changed). So you get an error <em>and</em> a changed list, as the final print shows. A tuple containing a list is also not hashable, so it cannot be a dict key.</p>

  <h2 id="pv-conv"><span class="num">06</span>Converting Between Types</h2>
  <p>Data constantly arrives as the wrong type: quantities as text from a form, a float that must become a whole number of rupees, a number that must be shown inside a sentence. Since Python will not mix types silently, you convert explicitly, by calling the type as if it were a function: <code>int(x)</code>, <code>float(x)</code>, <code>str(x)</code>, <code>bool(x)</code>, <code>list(x)</code>, <code>tuple(x)</code>. Each of these builds a <em>new</em> object of the target type from the old value; the original is unchanged. The conversions are easy, but each has rules that can surprise you:</p>
  <div class="fx" data-lang="py">print(int("2"), float("17.5"), str(30) + " rupees", float(30))
print(int(17.9), int(-17.9))      # int() cuts off the decimal part
try:
    int("3.5")                    # text that is not a whole number
except ValueError as e:
    print("ValueError:", e)
print(int(float("3.5")))          # two steps: text -&gt; float -&gt; int
print(list("chai"), tuple([30, 15]), str([30, 15]))</div>
  <div class="fx" data-lang="text">2 17.5 30 rupees 30.0
17 -17
ValueError: invalid literal for int() with base 10: '3.5'
3
['c', 'h', 'a', 'i'] (30, 15) [30, 15]</div>
  <p>The first line shows the ordinary cases: text of a whole number becomes an int, text of a decimal becomes a float, a number becomes text so it can be joined to " rupees", and an int becomes a float. The second line shows that converting a float to an int <em>cuts off</em> the decimal part rather than rounding: 17.9 becomes 17, and −17.9 becomes −17 (the cut is always toward zero). The third shows that <code>int()</code> applied to text accepts only whole-number text, so <code>int("3.5")</code> raises a <code>ValueError</code>: the type is right (it is text) but the value is not acceptable. The fix is to go through a float first, as the fourth line does. The last line shows conversions between collections: a string is a sequence of characters, so <code>list("chai")</code> splits it into four letters, while <code>str([30, 15])</code> gives the text that looks like the list.</p>
  <p>Python does convert automatically in one place: arithmetic between ints and floats. <code>195 * 0.9</code> just works and gives a float, because every int can be represented as a float without confusion. It never converts automatically between text and numbers, because there the right answer is ambiguous.</p>

  <h2 id="pv-float"><span class="num">07</span>Floats, Rounding and Decimal</h2>
  <p>Floats are how computers store numbers with decimal points, and they come with a surprise that has cost real companies real money. Try a sum any child can do:</p>
  <div class="fx" data-lang="py">print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(f"{0.1:.20f}")              # what is really stored for 0.1
import math
print(math.isclose(0.1 + 0.2, 0.3))</div>
  <div class="fx" data-lang="text">0.30000000000000004
False
0.10000000000000000555
True</div>
  <p>0.1 + 0.2 prints as 0.30000000000000004, and so it is not equal to 0.3. The reason is that floats are stored in binary (base 2), using only 0s and 1s, and most decimal fractions, including 0.1, have no exact binary form. The computer stores the nearest binary fraction it can, which is very slightly off; the third line prints 0.1 to 20 decimal places and reveals that what is really stored is a tiny bit more than 0.1. Two tiny errors add up to a result that is not exactly 0.3. The same thing happens in decimal: try writing 1/3 as a decimal and you must stop somewhere, 0.3333, so three of them add up to 0.9999 instead of 1. Computers have the same problem with 0.1 in binary. The practical rule: never compare floats with <code>==</code>. Ask whether they are close enough with <code>math.isclose</code>, as the last line does (or <code>np.isclose</code> for numpy arrays).</p>
  <p>Rounding has its own surprise. Python's <code>round()</code> uses <strong>banker's rounding</strong>, also called "round half to even": when a number is exactly halfway between two whole numbers, it rounds to the <em>even</em> one. The reason is fairness over many numbers: always rounding halves up pushes totals slightly upward, while rounding to even sends half of them up and half down, so the errors cancel out. Our stall has three bills: Asha's 184.275, Ben's 73.5 and Chen's 52.5.</p>
  <div class="fx" data-lang="py">print(round(184.275), round(73.5), round(52.5))   # halves go to the EVEN number
print(round(2.5), round(3.5), round(-2.5))
print(round(2.675, 2))            # 2.675 is stored as 2.67499999...</div>
  <div class="fx" data-lang="text">184 74 52
2 4 -2
2.67</div>
  <p>184.275 is not a half, so it rounds normally to 184. 73.5 rounds to 74 (74 is even). But 52.5 rounds to 52, not 53 as a shopkeeper would expect, because 52 is the even neighbour. The second line shows the same rule on 2.5, 3.5 and −2.5. The third line combines both surprises: <code>round(2.675, 2)</code> gives 2.67 rather than 2.68, because 2.675 cannot be stored exactly and is really 2.67499999..., which is below the half.</p>
  <p>For money, where every paisa must be exact and rounding must follow the rules a business uses, Python provides the <code>Decimal</code> type in the <code>decimal</code> module. A <code>Decimal</code> stores numbers in base 10, the way we write them, so 0.1 is exactly 0.1, and you can choose the rounding rule:</p>
  <div class="fx" data-lang="py">from decimal import Decimal, ROUND_HALF_UP
print(Decimal("0.1") + Decimal("0.2"))
print(Decimal("52.5").quantize(Decimal("1"), rounding=ROUND_HALF_UP))
print(Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
print(Decimal(0.1))               # built from a float: the float's error comes along</div>
  <div class="fx" data-lang="text">0.3
53
2.68
0.1000000000000000055511151231257827021181583404541015625</div>
  <p><code>Decimal("0.1") + Decimal("0.2")</code> is exactly 0.3. <code>quantize</code> rounds to a given number of places using the rule you name, so with <code>ROUND_HALF_UP</code> 52.5 becomes 53 and 2.675 becomes 2.68, the way a till expects. The last line shows the one rule for using Decimal correctly: build it from <em>text</em>, not from a float. <code>Decimal(0.1)</code> faithfully copies the float's binary error, all 55 digits of it. The other common approach for money is to store whole paise as ints, which are always exact.</p>

  <h2 id="pv-truth"><span class="num">08</span>Truthiness</h2>
  <p>Programs constantly ask yes/no questions: is the order empty? did the customer enter a name? Python lets you ask any value "do you count as true?", and statements like <code>if</code> and <code>while</code> ask this automatically about whatever you give them. The answer is called the value's <strong>truthiness</strong>, and <code>bool(x)</code> shows it. The rule is short: <strong>zero and empty count as false, everything else counts as true</strong>. Values that count as false are called <strong>falsy</strong>, and all others <strong>truthy</strong>. Think of a shelf: an empty shelf means "nothing here", and a shelf with anything on it, even one item, means "something here".</p>
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
  <p>The number 0 and 0.0 are falsy and 195 is truthy. The empty string <code>""</code>, the empty list <code>[]</code>, the empty dict <code>{}</code> and <code>None</code> are falsy, while a list with one item is truthy. The two surprises are <code>"False"</code> and <code>" "</code> (a single space), which are both truthy. They are non-empty text, and <code>bool()</code> never reads the words; it only checks whether the text is empty. This catches people out when a form or a configuration file sends the word "False":</p>
  <div class="fx" data-lang="py">answer = "False"                  # read from a form
print(bool(answer))               # non-empty text is always True
print(answer.strip().lower() in {"1", "true", "yes"})</div>
  <div class="fx" data-lang="text">True
False</div>
  <p><code>bool(answer)</code> is True even though the text says "False". To interpret a yes/no answer written as text, compare the text itself, as the last line does: strip spaces, lowercase it, and check whether it is one of the words that mean yes. Truthiness is used heavily in conditions, such as <code>if order:</code> to mean "if the order is not empty", which <a class="xref" data-note="py_control">Decisions &amp; Loops</a> builds on.</p>

  <h2 id="pv-ops"><span class="num">09</span>Arithmetic and Comparison Operators</h2>
  <p>An <strong>operator</strong> is a symbol that takes values and produces a new value, such as <code>+</code> for adding or <code>&lt;</code> for comparing. Most arithmetic operators behave as in school maths: <code>+</code>, <code>-</code>, <code>*</code>, and <code>**</code> for powers. Division comes in three forms, and the easiest way to understand them is sharing 17 laddoos among 5 children. <code>/</code> is true division and gives the exact share, 3.4. <code>//</code> is <strong>floor division</strong>: it gives the whole number of laddoos each child gets, 3, by rounding the answer down. <code>%</code> is the <strong>remainder</strong> (also called <strong>modulo</strong>): the laddoos left over, 2. The built-in <code>divmod</code> gives both at once.</p>
  <div class="fx" data-lang="py">laddoos, kids = 17, 5
print(laddoos / kids)             # exact share
print(laddoos // kids)            # whole laddoos each
print(laddoos % kids)             # left over
print(divmod(laddoos, kids))      # both at once
paid, bill = 200, 184
change = paid - bill
print(change // 10, "ten-rupee note(s) and", change % 10, "rupees in coins")</div>
  <div class="fx" data-lang="text">3.4
3
2
(3, 2)
1 ten-rupee note(s) and 6 rupees in coins</div>
  <p>The same pair is useful for splitting any amount into units. A customer pays ₹200 for a ₹184 bill, so the change is 16: <code>16 // 10</code> gives one ten-rupee note and <code>16 % 10</code> leaves 6 rupees in coins.</p>
  <p>With negative numbers, <code>//</code> and <code>%</code> surprise people coming from other languages. "Floor" means rounding <em>down</em>, toward minus infinity, not toward zero. For positive numbers the two are the same, but −7 / 2 is −3.5, and rounding down gives −4, not −3. Python then defines <code>%</code> so that one rule always holds: <code>b * (a // b) + a % b == a</code>. With a = −7 and b = 2, that forces the remainder to be 1, because 2 × (−4) + 1 = −7.</p>
  <div class="fx" data-lang="py">print(-7 // 2, -7 % 2)
print(int(-7 / 2))                # int() cuts toward zero: a different answer
a, b = -7, 2
print(b * (a // b) + a % b == a)  # the rule that ties // and % together
minutes = -30
print(minutes % 60)               # clock arithmetic stays in 0..59</div>
  <div class="fx" data-lang="text">-4 1
-3
True
30</div>
  <p><code>-7 // 2</code> is −4 and <code>-7 % 2</code> is 1. Converting with <code>int(-7 / 2)</code> gives −3 instead, because <code>int()</code> cuts toward zero, so it is not the same as <code>//</code> for negative numbers. The third line checks the rule. The last line shows why Python chose this design: the remainder always takes the sign of the divisor, so <code>x % 60</code> is always between 0 and 59. "30 minutes before the hour" correctly comes out as minute 30, which is exactly what clocks and calendars need. C and Java would give −30.</p>
  <p>When an expression has several operators, Python applies them in a fixed order called <strong>precedence</strong>, which mostly matches school maths: powers first, then multiplication and division, then addition and subtraction, then comparisons, then <code>not</code>, <code>and</code>, <code>or</code>. Brackets override everything. There are two surprises, both about <code>**</code>:</p>
  <div class="fx" data-lang="py">print(2 + 3 * 15, (2 + 3) * 15)
print(2 ** 3 ** 2, (2 ** 3) ** 2) # ** groups from the right
print(-2 ** 2, (-2) ** 2)         # ** binds tighter than the minus sign
print(10 - 4 - 3)                 # the others group from the left</div>
  <div class="fx" data-lang="text">47 75
512 64
-4 4
3</div>
  <p><code>2 + 3 * 15</code> is 47 because multiplication goes first; brackets make it 75. <code>2 ** 3 ** 2</code> is 512, not 64, because a chain of powers is worked out from the right: 3 ** 2 = 9 first, then 2 ** 9. And <code>-2 ** 2</code> is −4, because the power is applied before the minus sign; you need <code>(-2) ** 2</code> to get 4. Other operators of equal precedence go from left to right, so <code>10 - 4 - 3</code> is 3. When in doubt, add brackets; they cost nothing and make the meaning obvious to readers.</p>
  <p>A very common pattern is updating a variable using its own value, such as adding each item to a running total. Python has shortcuts for this called <strong>augmented assignment</strong>: <code>total += 60</code> means <code>total = total + 60</code>, and there are matching forms <code>-=</code>, <code>*=</code>, <code>/=</code>, <code>//=</code> and <code>%=</code>. Here is our table's whole bill built up step by step:</p>
  <div class="fx" data-lang="py">total = 0
total += 60                       # same as total = total + 60
total += 45
total += 90
print(total)
total -= 19.5                     # the 10% discount
total *= 1.05                     # 5% tax
print(total, round(total))</div>
  <div class="fx" data-lang="text">195
184.275 184</div>
  <p>Three additions give the subtotal 195. Subtracting the 10% discount of 19.5 and multiplying by 1.05 for tax gives 184.275, which rounds to a bill of ₹184. Remember from section 05 that for an int each step creates a new object and moves the name, while for a list <code>+=</code> edits in place.</p>
  <p>Comparison operators, <code>==</code>, <code>!=</code> (not equal), <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> and <code>&gt;=</code>, produce a bool. Python allows them to be chained as in maths, so <code>150 &lt;= subtotal &lt; 300</code> means "subtotal is at least 150 and less than 300":</p>
  <div class="fx" data-lang="py">subtotal = 195
print(subtotal &gt;= 150, subtotal == 70, subtotal != 70)
print(150 &lt;= subtotal &lt; 300)      # chained, like maths
print("chai" == "Chai", "Chai" &lt; "chai", "apple" &lt; "banana")
print(3 == 3.0, "3" == 3)</div>
  <div class="fx" data-lang="text">True False True
True
False True True
True False</div>
  <p>The first two lines are ordinary comparisons and a chain. The third shows how text is compared: character by character, using each character's code number, so "chai" and "Chai" are not equal, and every capital letter comes before every lowercase letter, which is why "Chai" &lt; "chai" is True. The last line contains a quiet trap: <code>3 == 3.0</code> is True, because numbers compare by value across int and float, but <code>"3" == 3</code> is simply False. Text is never equal to a number, and comparing them raises no error, so a bug where a number was read as text can hide for a long time.</p>
  <p>To finish, here is the whole bill in one place, as a single calculation that uses most of the types on this page:</p>
  <div class="fx" data-lang="py">chai, samosa, coffee = 30, 15, 90
subtotal = 2 * chai + 3 * samosa + 1 * coffee
eligible = subtotal &gt;= 150                # a bool
discount = subtotal * 0.10 * eligible     # True counts as 1
after = subtotal - discount
tax = after * 0.05
print(subtotal, eligible, discount, after, tax)
print(type(subtotal).__name__, type(eligible).__name__, type(after).__name__)
print(after + tax, round(after + tax))</div>
  <div class="fx" data-lang="text">195 True 19.5 175.5 8.775
int bool float
184.275 184</div>
  <p>The subtotal is an int, because int arithmetic stays int. <code>subtotal &gt;= 150</code> produces a bool. Multiplying by <code>0.10</code> turns the result into a float, and multiplying by the bool <code>True</code> works because True counts as 1. The final <code>round()</code> with no second argument returns an int, 184. The trick of multiplying by a bool is legal but hard to read, and it cannot express a rule with three tiers. Choosing between actions properly needs <code>if/elif/else</code>, and applying a step to every line of an order needs a loop, both covered in <a class="xref" data-note="py_control">Decisions &amp; Loops</a>.</p>

  <h2 id="pv-logic"><span class="num">10</span>Logical, Membership and Bitwise Operators</h2>
  <p>Real rules combine conditions: "at least ₹150 <em>and</em> a member", "a member <em>or</em> a festival day". Python's logical operators are the words <code>and</code>, <code>or</code> and <code>not</code>. <code>and</code> is true only if both sides are true, <code>or</code> is true if at least one side is, and <code>not</code> flips true to false. Two details make Python's version more powerful than it first looks. First, Python stops evaluating as soon as the answer is known, which is called <strong>short-circuit evaluation</strong>: if the left side of <code>and</code> is false the whole thing must be false, so the right side is never even run. Second, the result is not always <code>True</code> or <code>False</code>; it is the actual value where Python stopped. Think of asking friends one by one for a pen: with <code>or</code>, the first friend who has one ends the search and you get <em>that</em> pen; with <code>and</code>, like a series of checks at a gate, the first failed check stops you, and that failure is what you are told.</p>
  <div class="fx" data-lang="py">subtotal, is_member = 195, False
print(subtotal &gt;= 150 and is_member)
print(subtotal &gt;= 150 or is_member)
print(not is_member)
print(0 or "default", 5 and "yes", [] and 1 / 0)
name = ""
print(name or "Guest")
coupon = None
print(coupon is not None and coupon.startswith("CHAI"))
qty = 0
print(qty or 1)                   # trap: 0 is a real quantity, but falsy</div>
  <div class="fx" data-lang="text">False
True
True
default yes []
Guest
False
1</div>
  <p>The first three lines are ordinary logic: the bill qualifies but the customer is not a member, so <code>and</code> gives False, <code>or</code> gives True, and <code>not is_member</code> is True. The fourth line shows the "returns the value it stopped at" rule: <code>0 or "default"</code> skips the falsy 0 and returns "default"; <code>5 and "yes"</code> finds 5 truthy, so it must look at the right side and returns "yes"; and <code>[] and 1 / 0</code> stops at the falsy empty list and returns it, so the division by zero is never attempted. Two everyday idioms come from this. <code>name or "Guest"</code> supplies a default when the name is empty. <code>coupon is not None and coupon.startswith("CHAI")</code> is a guard: the method is called only when it is safe, because when coupon is None the right side never runs. The last line is the trap: <code>qty or 1</code> is meant to replace a missing quantity, but it also replaces a genuine 0, because 0 is falsy. When 0 is a valid value, write <code>qty if qty is not None else 1</code> instead (that "conditional expression" is explained in <a class="xref" data-note="py_control">Decisions &amp; Loops</a>).</p>
  <p>The <strong>membership</strong> operators <code>in</code> and <code>not in</code> ask "is this inside that?". What "inside" means depends on the container: for a list, is it one of the items; for text, is it a substring; for a dict, is it one of the <em>keys</em>.</p>
  <div class="fx" data-lang="py">menu = ["masala chai", "samosa", "vada pav", "cold coffee"]
print("samosa" in menu, "dosa" not in menu)
print("chai" in "masala chai")            # text: is it a substring?
prices = {"samosa": 15, "vada pav": 20}
print("samosa" in prices, 15 in prices)   # dict: checks KEYS only
print(15 in prices.values())</div>
  <div class="fx" data-lang="text">True True
True
True False
True</div>
  <p>"samosa" is on the menu and "dosa" is not. "chai" is found inside the text "masala chai". With the price dict, "samosa" is found because it is a key, but 15 is not, because <code>in</code> checks only keys; to search the prices, ask <code>prices.values()</code>. Membership also has a speed difference that matters enormously in real work. A list is checked item by item, so the time grows with its length; this is written <strong>O(n)</strong>, read "order n". A set or dict uses the hash to jump straight to the answer, taking about the same time however large it is; this is written <strong>O(1)</strong>. Here is the difference for a million customer ids (timings approximate):</p>
  <div class="fx" data-lang="py">import time
ids_list = list(range(1_000_000))
ids_set = set(ids_list)
t0 = time.perf_counter()
for _ in range(100):
    999_999 in ids_list           # checks items one by one
t1 = time.perf_counter()
for _ in range(100):
    999_999 in ids_set            # jumps straight to the answer
t2 = time.perf_counter()
print(f"list: {t1 - t0:.3f} s   set: {t2 - t1:.6f} s")</div>
  <div class="fx" data-lang="text">list: 0.509 s   set: 0.000009 s</div>
  <p>A hundred lookups in the list took a sizeable fraction of a second, because each one walked through up to a million items; the same lookups in a set took a few microseconds. If your code repeatedly asks "is this id in that collection?", turning the collection into a set first is one of the cheapest big speed-ups in Python (more in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>).</p>
  <p>Finally, the <strong>bitwise</strong> operators work on the binary digits of integers, one position at a time: <code>&amp;</code> (and), <code>|</code> (or), <code>^</code> (exclusive or), <code>~</code> (not), and <code>&lt;&lt;</code> and <code>&gt;&gt;</code> (shift left and right). For example, 5 is 101 in binary and 3 is 011; keeping only the positions where both have a 1 gives 001, so <code>5 &amp; 3</code> is 1:</p>
  <div class="fx" data-lang="py">print(5 &amp; 3, 5 | 3, 5 ^ 3, ~5)
print(bin(5), bin(3), bin(5 &amp; 3))</div>
  <div class="fx" data-lang="text">1 7 6 -6
0b101 0b11 0b1</div>
  <p>You will rarely need these for integers, but you will need <code>&amp;</code>, <code>|</code> and <code>~</code> constantly in data work, for a reason that confuses everybody the first time. In numpy and pandas, a comparison on a whole array gives a whole array of True/False values, one per element. <code>and</code> needs a single True or False, so it cannot work with an array; <code>&amp;</code> works element by element:</p>
  <div class="fx" data-lang="py">import numpy as np
bills = np.array([184, 74, 52, 310])
print(bills &gt; 60)
print((bills &gt; 60) &amp; (bills &lt; 300))
try:
    bills &gt; 60 and bills &lt; 300
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">[ True  True False  True]
[ True  True False False]
ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()</div>
  <p><code>bills &gt; 60</code> gives one answer per bill. <code>(bills &gt; 60) &amp; (bills &lt; 300)</code> combines the two arrays position by position, keeping only the bills between 60 and 300. Using <code>and</code> raises "The truth value of an array with more than one element is ambiguous", because Python cannot turn four answers into one. The brackets around each comparison are essential, because <code>&amp;</code> has higher precedence than <code>&gt;</code>; without them, Python would try to work out <code>60 &amp; bills</code> first.</p>

  <h2 id="pv-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common mistake of all is writing <code>b = a</code> and believing you have a copy. You have a second name for the same object, so if the object is mutable, a change through one name appears through the other. The fix is <code>a.copy()</code>, but even that has a subtlety when the list contains other lists:</p>
  <div class="fx" data-lang="py">orders = [["chai"], ["samosa"]]
backup = orders.copy()            # shallow: a new outer list, same inner lists
orders[0].append("vada pav")
print(backup)
import copy
orders = [["chai"], ["samosa"]]
backup = copy.deepcopy(orders)    # copies the inner lists too
orders[0].append("vada pav")
print(backup)</div>
  <div class="fx" data-lang="text">[['chai', 'vada pav'], ['samosa']]
[['chai'], ['samosa']]</div>
  <p>The first <code>backup</code> was made with <code>.copy()</code>, which is shallow: the outer list is new, but its two inner lists are the same objects as in <code>orders</code>. So appending vada pav to <code>orders[0]</code> shows up in <code>backup</code> too. <code>copy.deepcopy</code> copies the inner lists as well, so the second backup is unaffected. Use a deep copy whenever you need an independent copy of nested data.</p>
  <p>Several other mistakes on this page share a pattern: Python does something reasonable that is not what you meant, and raises no error. Calling <code>s.upper()</code> and expecting <code>s</code> to change does nothing, because strings are immutable; write <code>s = s.upper()</code>. Doing arithmetic on text read from input or files gives <code>"2" + "3" == "23"</code>; convert at the boundary with <code>int()</code> or <code>float()</code>. Comparing <code>"3" == 3</code> is quietly False. Comparing floats with <code>==</code> fails on values like <code>0.1 + 0.2</code>; use <code>math.isclose</code>, and use <code>Decimal</code> built from strings, or whole paise, for money. Expecting <code>round(52.5)</code> to be 53 fails because of banker's rounding; use <code>Decimal.quantize</code> with <code>ROUND_HALF_UP</code> when a business rule demands it.</p>
  <p>A third group is about operators. <code>-7 // 2</code> is −4, not −3, because floor division rounds down. <code>x or default</code> replaces any falsy value, including a valid 0 or empty string; use <code>x if x is not None else default</code>. Using <code>is</code> to compare numbers or strings (<code>x is 1000</code>) works or fails depending on caching; Python even warns about it with a SyntaxWarning, and the fix is always <code>==</code>. Testing a text flag with <code>if flag:</code> treats "False" as true. And in pandas, <code>df[df.a &gt; 1 and df.b &lt; 5]</code> raises the "truth value is ambiguous" error; write <code>df[(df.a &gt; 1) &amp; (df.b &lt; 5)]</code>.</p>
  <p>Finally, trying to use a list as a dict key or a set item raises <code>TypeError: unhashable type: 'list'</code>; use a tuple instead, since a tuple of immutable values is hashable.</p>

  <h2 id="pv-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Value</b>: one piece of data. <b>Literal</b>: a value written in code. <b>Expression</b>: code that evaluates to a value.</li>
    <li><b>Object</b>: a value in memory with a <b>type</b> (<code>type(x)</code>, never changes), an <b>identity</b> (<code>id(x)</code>, never changes) and a <b>value</b>.</li>
    <li><b>Variable</b>: a name bound to an object. <b>Binding</b>: attaching a name. <b>Rebinding</b>: moving a name. <b>Mutating</b>: changing the object itself.</li>
    <li><b>Mutable</b>: can change in place (list, dict, set). <b>Immutable</b>: cannot (int, float, bool, str, bytes, tuple, frozenset, None).</li>
    <li><b>Hashable</b>: has a fixed hash, so can be a dict key or set item (immutable values).</li>
    <li><b>Truthiness</b>: zero, empty and None are falsy; everything else is truthy.</li>
    <li><b>Dynamic typing</b>: types belong to objects. <b>Strong typing</b>: no silent conversion between text and numbers.</li>
  </ul>
  <h3>Basic types</h3>
  <table class="tbl">
    <tr><th>Type</th><th>Holds</th><th>Remember</th></tr>
    <tr><td><code>int</code></td><td>whole numbers</td><td>any size, never overflows</td></tr>
    <tr><td><code>float</code></td><td>decimals (binary)</td><td><code>/</code> always gives a float; <code>0.1 + 0.2 != 0.3</code></td></tr>
    <tr><td><code>bool</code></td><td><code>True</code> / <code>False</code></td><td>a kind of int: <code>True + True == 2</code></td></tr>
    <tr><td><code>str</code></td><td>text</td><td>immutable; methods return new strings</td></tr>
    <tr><td><code>bytes</code></td><td>raw 0–255</td><td><code>s.encode("utf-8")</code> ↔ <code>b.decode("utf-8")</code></td></tr>
    <tr><td><code>NoneType</code></td><td><code>None</code></td><td>"no value"; test with <code>is None</code></td></tr>
  </table>
  <h3>Names, identity and copies</h3>
  <ul>
    <li><code>b = a</code> never copies. <code>a == b</code>: equal values. <code>a is b</code>: same object. Use <code>is</code> only for <code>None</code> and "same object" questions.</li>
    <li>CPython shares ints −5…256, so <code>is</code> can look like <code>==</code> by accident.</li>
    <li>On an int, <code>x += 1</code> makes a new object. On a list, <code>x += [...]</code> edits in place; <code>x = x + [...]</code> makes a new list.</li>
    <li>Shallow copy: <code>a.copy()</code>, <code>list(a)</code>, <code>a[:]</code> (inner objects shared). Deep copy: <code>copy.deepcopy(a)</code>.</li>
    <li>A tuple holding a list: the list can change; <code>t[0] += [x]</code> changes it <em>and</em> raises TypeError.</li>
  </ul>
  <h3>Conversion and numbers</h3>
  <table class="tbl">
    <tr><th>Expression</th><th>Result</th><th>Why</th></tr>
    <tr><td><code>int(17.9)</code>, <code>int(-17.9)</code></td><td>17, −17</td><td>cuts toward zero</td></tr>
    <tr><td><code>int("3.5")</code></td><td>ValueError</td><td>needs whole-number text; use <code>int(float(s))</code></td></tr>
    <tr><td><code>round(52.5)</code>, <code>round(73.5)</code></td><td>52, 74</td><td>halves go to the even number</td></tr>
    <tr><td><code>round(2.675, 2)</code></td><td>2.67</td><td>stored as 2.67499…</td></tr>
    <tr><td><code>Decimal("0.1") + Decimal("0.2")</code></td><td>0.3</td><td>exact base 10; build from text</td></tr>
    <tr><td><code>bool("False")</code></td><td>True</td><td>non-empty text</td></tr>
  </table>
  <h3>Operators</h3>
  <table class="tbl">
    <tr><th>Operator</th><th>Rule</th><th>Example</th></tr>
    <tr><td><code>/ // %</code></td><td>true division; floor (toward −∞); remainder with sign of divisor</td><td><code>-7 // 2 == -4</code>, <code>-7 % 2 == 1</code></td></tr>
    <tr><td><code>**</code></td><td>right to left; tighter than unary minus</td><td><code>2 ** 3 ** 2 == 512</code>, <code>-2 ** 2 == -4</code></td></tr>
    <tr><td>comparisons</td><td>chain like maths</td><td><code>150 &lt;= s &lt; 300</code></td></tr>
    <tr><td><code>and</code> / <code>or</code></td><td>short-circuit; return an operand</td><td><code>"" or "Guest"</code> → "Guest"</td></tr>
    <tr><td><code>in</code></td><td>list O(n); set/dict O(1); dict checks keys</td><td><code>15 in {"samosa": 15}</code> → False</td></tr>
    <tr><td><code>&amp; | ~</code></td><td>bitwise; element-wise in numpy/pandas</td><td><code>(df.a &gt; 1) &amp; (df.b &lt; 5)</code></td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li><code>b = a</code> is not a copy; <code>.copy()</code> is shallow.</li>
    <li>Outside data is text: <code>"2" + "3" == "23"</code>; <code>"3" == 3</code> is False.</li>
    <li>Compare floats with <code>math.isclose</code>; money in <code>Decimal</code> or integer paise.</li>
    <li><code>x or default</code> replaces 0 and "" too.</li>
    <li>Lists cannot be dict keys; use tuples.</li>
  </ul>

  <h2 id="pv-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does "everything in Python is an object" mean?</summary><div class="qa-body">Every value, including numbers, strings, lists, functions, classes and modules, is an object in memory with a type, an identity and a value. Variables are names that refer to these objects. That is why you can call methods on a number, pass functions as arguments, and why assignment never copies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a variable in Python? Is it a box holding a value?</summary><div class="qa-body">No. A variable is a name bound to an object; the object lives separately in memory. <code>b = a</code> binds a second name to the same object rather than copying it, and <code>a = 5</code> later just moves the name <code>a</code> to a different object. A luggage tag is a better picture than a box.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>is</code> and <code>==</code>?</summary><div class="qa-body"><code>==</code> compares values, by calling the object's <code>__eq__</code> method. <code>is</code> checks whether both names refer to the same object, that is, the same id. <code>[1, 2] == [1, 2]</code> is True but <code>[1, 2] is [1, 2]</code> is False. Use <code>is</code> for <code>None</code>, because a class can redefine <code>==</code> but nothing can fake identity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can <code>a is b</code> be True for 256 but False for 1000?</summary><div class="qa-body">CPython creates the small integers from −5 to 256 once and reuses them, so any two 256s are the same object. Larger integers created separately are separate objects. This is an implementation detail, not a language rule, so <code>is</code> must never be used to compare numbers or strings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which types are mutable and which immutable, and why does it matter?</summary><div class="qa-body">Immutable: int, float, bool, str, bytes, tuple, frozenset, None. Mutable: list, dict, set, bytearray and most objects of your own classes. It matters for aliasing (a change through one name is seen through every other name for a mutable object), for hashing (only immutable values can be dict keys and set items), and for functions, which can change a list you pass in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>a = [1, 2]; b = a; b += [3]; print(a)</code>. And with <code>b = b + [3]</code>?</summary><div class="qa-body"><code>[1, 2, 3]</code>, because on a list <code>+=</code> extends the same object in place, and <code>a</code> refers to that object. With <code>b = b + [3]</code>, <code>+</code> builds a new list and only <code>b</code> is moved to it, so <code>a</code> stays <code>[1, 2]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a shallow copy and a deep copy?</summary><div class="qa-body">A shallow copy (<code>x.copy()</code>, <code>list(x)</code>, <code>x[:]</code>, <code>copy.copy(x)</code>) builds a new outer container, but its items are the same objects as in the original, so nested lists are shared. A deep copy (<code>copy.deepcopy(x)</code>) copies the nested objects too, all the way down, so the copy is completely independent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a tuple be a dict key but a list cannot?</summary><div class="qa-body">Dicts and sets find entries by their hash, and a key's hash must never change while it is stored. Lists can change, so they are not hashable and raise <code>TypeError: unhashable type: 'list'</code>. A tuple is hashable only if everything inside it is hashable, so <code>(1, [2])</code> cannot be a key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you modify a tuple?</summary><div class="qa-body">You cannot replace its items, but a mutable item inside it can change: <code>t = ([1], 2); t[0].append(3)</code> works. The classic trick: <code>t[0] += [4]</code> extends the inner list and then raises TypeError, because the augmented assignment tries to store the result back into the tuple. You end up with an error and a changed list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>0.1 + 0.2 != 0.3</code>, and how do you handle it?</summary><div class="qa-body">Floats are stored in binary, and 0.1 and 0.2 have no exact binary form, so each is stored with a tiny error and the sum is 0.30000000000000004. Compare floats with a tolerance using <code>math.isclose</code> or <code>np.isclose</code>. For money, use <code>decimal.Decimal</code> built from strings, or store whole paise or cents as integers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>round(2.5)</code>, <code>round(3.5)</code> and <code>round(2.675, 2)</code> return?</summary><div class="qa-body">2, 4 and 2.67. Python rounds exact halves to the nearest even number (banker's rounding) so that rounding errors cancel out over many values. 2.675 is actually stored as 2.67499…, so it is not a half at all and rounds down. For shop-style rounding use <code>Decimal(...).quantize(..., rounding=ROUND_HALF_UP)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>print(-7 // 2, -7 % 2, int(-7 / 2))</code> print?</summary><div class="qa-body"><code>-4 1 -3</code>. <code>//</code> rounds down toward minus infinity; <code>%</code> is defined so that <code>b * (a // b) + a % b == a</code>, which makes the remainder take the sign of the divisor; and <code>int()</code> cuts toward zero. C and Java truncate instead, giving −3 and −1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which values are falsy? What is <code>bool("False")</code>?</summary><div class="qa-body"><code>False</code>, <code>None</code>, numeric zeros such as 0 and 0.0, and empty containers: <code>""</code>, <code>[]</code>, <code>()</code>, <code>{}</code>, <code>set()</code>, <code>range(0)</code>. Everything else is truthy. <code>bool("False")</code> is True because it is non-empty text; to read a yes/no answer from text, compare it, for example <code>s.lower() in {"1", "true", "yes"}</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>print(0 or "x", [] and 5, 3 and 4, None or 0)</code> print?</summary><div class="qa-body"><code>x [] 4 0</code>. <code>a or b</code> returns a if a is truthy, otherwise b; <code>a and b</code> returns a if a is falsy, otherwise b. They short-circuit, so the right side may never run, and they return one of the operands rather than necessarily True or False.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python statically or dynamically typed? Strongly or weakly?</summary><div class="qa-body">Dynamically typed: types belong to objects and are checked when code runs, and a name can be rebound to any type. Strongly typed: operations between incompatible types raise an error instead of converting silently, so <code>"2" + 3</code> is a TypeError rather than JavaScript's <code>"23"</code>. Type hints add optional static checking through tools like mypy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a Python int overflow?</summary><div class="qa-body">No. Python's int has arbitrary precision, so <code>2 ** 100</code> is exact and still an int. The cost is speed and memory per number, which is one reason numpy uses fixed-size types such as <code>int64</code>; those can overflow, silently wrapping around inside arrays.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>bool</code> a subclass of <code>int</code>, and where is that useful or dangerous?</summary><div class="qa-body">For historical compatibility, <code>True</code> equals 1 and <code>False</code> equals 0. It is useful for counting: <code>sum(x &gt; 0 for x in xs)</code> counts matches, and <code>mask.mean()</code> in numpy gives a proportion. It is dangerous in validation, since <code>isinstance(True, int)</code> is True, and in dicts, where <code>{1: "a", True: "b"}</code> has only one key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>df[df.a &gt; 1 and df.b &lt; 5]</code> raise an error, and what is the fix?</summary><div class="qa-body"><code>and</code> needs a single True or False, but <code>df.a &gt; 1</code> is a whole column of answers, so pandas raises "the truth value of a Series is ambiguous". Use the element-wise operator with brackets: <code>df[(df.a &gt; 1) &amp; (df.b &lt; 5)]</code>. The brackets are needed because <code>&amp;</code> binds more tightly than <code>&gt;</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>str</code> and <code>bytes</code>?</summary><div class="qa-body"><code>str</code> is text, a sequence of Unicode characters; <code>bytes</code> is a sequence of raw numbers from 0 to 255. Converting needs an encoding: <code>"café".encode("utf-8")</code> gives 5 bytes for 4 characters, and <code>.decode("utf-8")</code> reverses it. Using the wrong encoding raises <code>UnicodeDecodeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>x in container</code> cost for a list, a set and a dict?</summary><div class="qa-body">For a list or tuple it is O(n): Python compares the item with each element in turn. For a set or dict it is O(1) on average, because the hash leads straight to the right place; a dict tests its keys, not its values. Converting a large list to a set before a loop of lookups is one of the cheapest big speed-ups in Python.</div></details>
</main>
`
});
