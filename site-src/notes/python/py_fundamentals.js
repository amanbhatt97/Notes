// notes/python/py_fundamentals.js — Python Fundamentals
Object.assign(TOPIC_CONTENT, {
  "py_fundamentals": `<main>
  <h1>Python Fundamentals</h1>
  <p class="lead">This note covers the basic rules that every Python program follows: how variables work, which values can change, the main data types, operators, if/for/while, functions, and where a name is visible. Every "strange" Python bug in an interview or at work comes back to one of these rules. Code here was run on Python 3.13.</p>

  <h2 id="pf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Python Fundamentals</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Names &amp; references</div>
        <ul>
          <li><b>Variable</b> — a name tag stuck on an object, not a box that holds a value</li>
          <li>💡 like a luggage tag: two tags can hang on one bag</li>
          <li><b>b = a</b> — copies the tag, not the object; both names share one object</li>
          <li><b>id(x)</b> — the object's identity (memory address in CPython)</li>
          <li><b>==</b> same value (calls <code>__eq__</code>); <b>is</b> same object (same id)</li>
          <li><b>Mutate vs rebind</b> — <code>a.append()</code> changes the shared object; <code>a = [...]</code> moves only the tag <code>a</code></li>
          <li>⚠ <b>Small-int cache</b> (−5…256) makes <code>is</code> look like <code>==</code>. Never rely on it. Use <code>is</code> only for <code>None</code>/<code>True</code>/<code>False</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mutable vs immutable</div>
        <ul>
          <li><b>Immutable</b> — int, float, bool, str, bytes, tuple, frozenset; a "change" makes a new object</li>
          <li><b>Mutable</b> — list, dict, set, bytearray; changed in place, id stays the same</li>
          <li>💡 sealed envelope vs open notebook</li>
          <li><b>Why it matters</b> — sharing bugs; only immutables can be dict keys; safe to pass around</li>
          <li><b>Real copy</b> — <code>lst.copy()</code> gives a second list; <code>b = a</code> does not</li>
          <li><b>+=</b> — new object for str/tuple, same object for list</li>
          <li>⚠ <b>Tuple of lists</b> — tuple is fixed but the list inside can change; <code>t[0] += [5]</code> changes it AND raises</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core types</div>
        <ul>
          <li><b>int</b> — any size, never overflows (but slower than numpy int64)</li>
          <li><b>float</b> — 64-bit binary number; ⚠ <code>0.1 + 0.2 != 0.3</code> → use <code>math.isclose</code>, <code>Decimal</code> for money</li>
          <li><b>bool</b> — a kind of int: <code>True + True == 2</code>, so <code>sum(mask)</code> counts Trues</li>
          <li><b>round()</b> — halves go to the even number: <code>round(2.5) == 2</code></li>
          <li><b>str</b> = text (Unicode); <b>bytes</b> = raw 0–255 values; <code>encode</code>/<code>decode</code> between them</li>
          <li><b>Conversion</b> — <code>int(3.9)</code> → 3 (cuts, no rounding); ⚠ <code>int("3.9")</code> errors; ⚠ <code>bool("False")</code> is True</li>
          <li><b>Falsy</b> — 0, 0.0, "", [], {}, set(), None, False</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Operators</div>
        <ul>
          <li><b>/</b> always gives float; <b>//</b> rounds down toward −∞: <code>-7 // 2 == -4</code>; <b>%</b> = remainder</li>
          <li><b>Chaining</b> — <code>1 &lt; x &lt; 10</code> works like maths</li>
          <li><b>and/or</b> stop early and return one of the operands: <code>0 or "default"</code> → "default"</li>
          <li><b>in</b> — slow O(n) on a list, fast O(1) on set/dict</li>
          <li><b>Bitwise</b> &amp; | ^ ~ &lt;&lt; &gt;&gt;; <code>~x == -(x+1)</code></li>
          <li>⚠ numpy/pandas filters need <code>&amp;</code> + brackets, not <code>and</code></li>
          <li><b>Walrus :=</b> — assign and use a value in one expression</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Control flow</div>
        <ul>
          <li><b>if/elif/else</b> — first true branch runs, rest skipped</li>
          <li><b>Ternary</b> — <code>"pass" if s &gt;= 60 else "fail"</code></li>
          <li><b>for</b> works on anything iterable; use <code>enumerate</code>, <code>zip</code>, <code>.items()</code></li>
          <li><b>loop-else</b> — else runs only if no <code>break</code> happened; read it as "nobreak"</li>
          <li><b>match/case</b> (3.10+) — matches the shape of data: literals, <code>|</code>, dict/list shapes, <code>*rest</code>, <code>if</code> guards, <code>_</code></li>
          <li>⚠ a bare name in <code>case x:</code> catches everything; compare constants with dotted names</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Functions &amp; params</div>
        <ul>
          <li><b>Order</b> — <code>def f(pos_only, /, normal, *args, kw_only, **kwargs)</code></li>
          <li><b>*args</b> → tuple of extras; <b>**kwargs</b> → dict of extras; <code>f(*lst, **d)</code> unpacks</li>
          <li><b>Keyword-only</b> (after <code>*</code>) — forces clear calls: <code>fit(X, epochs=5)</code></li>
          <li>⚠ <b>Mutable default</b> — <code>def f(x=[])</code> is built once and shared by every call → use <code>None</code></li>
          <li><b>First-class</b> — functions are objects: pass them, return them, store them</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursion &amp; lambda</div>
        <ul>
          <li><b>Recursion</b> — base case + a smaller call; default limit 1000 → <code>RecursionError</code></li>
          <li>💡 asking "what is my position?" down a queue</li>
          <li><b>No tail-call optimisation</b> — very deep recursion → write a loop</li>
          <li><b>@lru_cache</b> — remember answers so repeated sub-problems run once (fib)</li>
          <li><b>lambda</b> — one-line function with no name; for <code>key=</code>, <code>map</code></li>
          <li>⚠ <b>Late binding</b> — <code>[lambda: i for i in ...]</code> all see the last i; fix <code>lambda i=i: i</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scope (LEGB)</div>
        <ul>
          <li><b>Lookup</b> — Local → Enclosing → Global → Built-in; first match wins</li>
          <li><b>Assignment</b> anywhere in a function makes the name local for the whole function</li>
          <li>⚠ <code>count += 1</code> on a global → <code>UnboundLocalError</code></li>
          <li><b>global</b> rebinds a module name; <b>nonlocal</b> rebinds the outer function's name</li>
          <li><b>Closure</b> — inner function remembers outer variables (counters, decorators)</li>
          <li>💡 looking for keys: your room, then the house, then the street</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pf-names"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Names &amp; References</span><span class="rm-sub">Labels, id(), is vs ==</span></div></div>
      <div class="rm-item rm-done" data-target="pf-mut"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Mutable vs Immutable</span><span class="rm-sub">Change in place or copy</span></div></div>
      <div class="rm-item rm-done" data-target="pf-types"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Core Types</span><span class="rm-sub">Numbers, bools, str, bytes</span></div></div>
      <div class="rm-item rm-done" data-target="pf-ops"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Operators</span><span class="rm-sub">Floor, short-circuit, bits</span></div></div>
      <div class="rm-item rm-done" data-target="pf-flow"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Control Flow</span><span class="rm-sub">loop-else, match/case</span></div></div>
      <div class="rm-item rm-done" data-target="pf-func"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Function Parameters</span><span class="rm-sub">*args, kw-only, defaults</span></div></div>
      <div class="rm-item rm-done" data-target="pf-rec"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Recursion &amp; Lambda</span><span class="rm-sub">Base cases, late binding</span></div></div>
      <div class="rm-item rm-done" data-target="pf-scope"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Scope: LEGB</span><span class="rm-sub">global, nonlocal, closures</span></div></div>
      <div class="rm-item rm-done" data-target="pf-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Hands-on</span><span class="rm-sub">An event router</span></div></div>
      <div class="rm-item rm-done" data-target="pf-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <div class="callout intu"><span class="label">Why this note</span><p>Python is the main language of data science. pandas, numpy, scikit-learn and PyTorch are all Python. Interviews often start with short "what does this print?" questions about these basics. At work, the same basics explain bugs like "my list changed by itself" or "my function remembers old values". Each section below uses only ideas from the sections before it.</p></div>

  <h2 id="pf-names"><span class="num">01</span>Names &amp; References</h2>
  <p>In school maths, <code>x = 5</code> means "x is 5". Many people imagine a variable as a box with the value inside. In Python that picture is wrong, and it causes real bugs.</p>
  <p>In Python, every value (a number, a list, a piece of text) is an <strong>object</strong> — a thing stored somewhere in memory. A variable is only a <strong>name</strong> that points to an object. The name does not hold the value. It is a label stuck on it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A variable is a luggage tag, not the suitcase. Two tags can hang on one suitcase. Moving a tag to another bag does not move the suitcase.</p></div>
  <p>Start with numbers. <code>y = x</code> makes <code>y</code> point to the same object as <code>x</code>. Then <code>x = 6</code> moves only the tag <code>x</code> to a new object. <code>y</code> still points at 5.</p>
  <div class="fx" data-lang="py">x = 5
y = x          # y points to the same 5
x = 6          # x now points to a new object 6
print(x, y)</div>
  <div class="fx" data-lang="text">6 5</div>
  <p>With a list, something new can happen. You can change the list itself (add an item) without moving any tag. This is called <strong>mutating</strong> it. Moving a tag to a different object is called <strong>rebinding</strong>. Look at the picture: on the left, both tags point to one list, so a change shows through both names. On the right, <code>a</code> was moved to a new list, and <code>b</code> stayed.</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
    <defs><marker id="pf-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="18" class="tm">after b = a ; a.append(4)</text>
    <rect x="20" y="40" width="40" height="26" rx="5" class="fb sb"/><text x="35" y="58">a</text>
    <rect x="20" y="96" width="40" height="26" rx="5" class="fb sb"/><text x="35" y="114">b</text>
    <rect x="130" y="62" width="120" height="36" rx="6" class="fg sg"/><text x="142" y="85">[1, 2, 3, 4]</text>
    <line x1="60" y1="53" x2="128" y2="74" stroke="currentColor" marker-end="url(#pf-ah)"/>
    <line x1="60" y1="109" x2="128" y2="88" stroke="currentColor" marker-end="url(#pf-ah)"/>
    <text x="300" y="18" class="tm">after a = [99]  (rebind)</text>
    <rect x="300" y="40" width="40" height="26" rx="5" class="fb sb"/><text x="315" y="58">a</text>
    <rect x="300" y="96" width="40" height="26" rx="5" class="fb sb"/><text x="315" y="114">b</text>
    <rect x="420" y="30" width="80" height="34" rx="6" class="fv"/><text x="440" y="52">[99]</text>
    <rect x="410" y="96" width="120" height="34" rx="6" class="fg sg"/><text x="422" y="118">[1, 2, 3, 4]</text>
    <line x1="340" y1="53" x2="418" y2="48" stroke="currentColor" marker-end="url(#pf-ah)"/>
    <line x1="340" y1="109" x2="408" y2="112" stroke="currentColor" marker-end="url(#pf-ah)"/>
    <text x="20" y="160" class="tg">mutation: both names see it</text>
    <text x="300" y="160" class="tb">rebinding: only a moves</text>
  </svg><figcaption>Assignment never copies. It sticks one more name tag on the same object.</figcaption></figure>
  <p>The code below does exactly what the picture shows. <code>id(x)</code> gives a number that identifies the object (in CPython, the normal Python, it is the memory address). Same id means same object.</p>
  <div class="fx" data-lang="py">a = [1, 2, 3]
b = a                  # second name, same object
print(a is b, id(a) == id(b))
a.append(4)            # mutate: both names see it
print(b)
a = [99]               # rebind: only a moves
print(b)
c = [1, 2, 3, 4]
print(b == c, b is c)  # equal values, different objects</div>
  <div class="fx" data-lang="text">True True
[1, 2, 3, 4]
[1, 2, 3, 4]
True False</div>
  <p>The last line shows two different questions you can ask about two names. <code>==</code> asks "do they hold the same value?" (it calls the object's <code>__eq__</code> method — the method that defines "equal"). <code>is</code> asks "are they the very same object?". Two identical-looking marksheets are <code>==</code>. Only your own marksheet <code>is</code> your marksheet.</p>
  <table class="tbl">
    <tr><th>Check</th><th>Asks</th><th>Use for</th></tr>
    <tr><td><code>a == b</code></td><td>Same value? (calls <code>__eq__</code>)</td><td>Almost everything</td></tr>
    <tr><td><code>a is b</code></td><td>Same object? (same <code>id</code>)</td><td><code>x is None</code>, sentinels</td></tr>
  </table>
  <div class="fx" data-lang="py">x = int("1000"); y = int("1000")
print(x == y, x is y)          # 1000 not cached
s = int("7"); t = int("7")
print(s is t)                  # -5..256 cached: implementation detail</div>
  <div class="fx" data-lang="text">True False
True</div>
  <div class="callout trap"><span class="label">Trap</span><p>CPython keeps one shared copy of small ints (−5…256) and some strings. So <code>is</code> sometimes "works" for values by luck. Use <code>==</code> for values. Use <code>is</code> only for <code>None</code>, <code>True</code>, <code>False</code>.</p></div>

  <h2 id="pf-mut"><span class="num">02</span>Mutable vs Immutable</h2>
  <p>Section 01 showed that a list can be changed in place. Can a number or a string be changed in place too? No. Python splits objects into two kinds.</p>
  <ul>
    <li><strong>Mutable</strong> — "can change". The same object can be edited in place. Lists, dicts and sets are mutable.</li>
    <li><strong>Immutable</strong> — "can never change". Any "change" builds a brand-new object. Numbers, strings and tuples are immutable.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Immutable is a sealed envelope: to change the letter, you make a new envelope. Mutable is an open notebook: same notebook, new pages.</p></div>
  <p>A small kirana example. You and your brother share one shopping list. If he adds "ghee" to it, you see "ghee" too, because there is only one list. If you want your own list, make a real copy with <code>.copy()</code>.</p>
  <div class="fx" data-lang="py">cart = ["rice", "dal"]
my_cart = cart            # same list, two names
my_cart.append("ghee")
print(cart)
copy_cart = cart.copy()   # a real second list
copy_cart.append("salt")
print(cart, copy_cart)</div>
  <div class="fx" data-lang="text">['rice', 'dal', 'ghee']
['rice', 'dal', 'ghee'] ['rice', 'dal', 'ghee', 'salt']</div>
  <p>Strings are immutable, so string methods never change the string. They return a new one. If you do not save it, it is lost.</p>
  <div class="fx" data-lang="py">name = "ravi"
name.upper()          # makes a NEW string, nobody keeps it
print(name)
name = name.upper()   # keep the new string
print(name)</div>
  <div class="fx" data-lang="text">ravi
RAVI</div>
  <p>The picture shows the difference. For the string, <code>+=</code> built a new object and moved the tag. For the list, <code>+=</code> edited the same object.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="pf-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="18" class="tr">immutable: s += "!"</text>
    <rect x="10" y="40" width="34" height="24" rx="5" class="fb sb"/><text x="22" y="57">s</text>
    <rect x="110" y="30" width="110" height="30" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="122" y="50" class="tm">"hi" id=A</text>
    <rect x="110" y="80" width="110" height="30" rx="6" class="fg sg"/><text x="122" y="100">"hi!" id=B</text>
    <line x1="44" y1="54" x2="108" y2="90" stroke="currentColor" marker-end="url(#pf-ah2)"/>
    <text x="10" y="135" class="tm">new object, tag moved</text>
    <text x="300" y="18" class="tg">mutable: L += [2]</text>
    <rect x="300" y="55" width="34" height="24" rx="5" class="fb sb"/><text x="312" y="72">L</text>
    <rect x="400" y="50" width="130" height="34" rx="6" class="fg sg"/><text x="412" y="72">[1, 2] id=C</text>
    <line x1="334" y1="67" x2="398" y2="67" stroke="currentColor" marker-end="url(#pf-ah2)"/>
    <text x="300" y="135" class="tm">same object, contents changed</text>
  </svg><figcaption>Immutable "changes" create a new object. Mutable changes edit the same one.</figcaption></figure>
  <p>Why does Python need both kinds? Lists must change cheaply, or every append would copy the whole list. Dict keys must never change, or the dict would lose track of where it stored them. An object that can be a dict key is called <strong>hashable</strong> — Python can compute a fixed "address number" (a hash) for it. Immutable objects are hashable; lists and dicts are not.</p>
  <div class="cards">
    <div><b>Immutable</b><p>int, float, bool, str, bytes, tuple, frozenset</p><small>Hashable → dict keys, set items; safe to share</small></div>
    <div><b>Mutable</b><p>list, dict, set, bytearray, most class objects</p><small>Edited in place → watch for shared names</small></div>
  </div>
  <div class="callout pred"><span class="label">Predict the output</span><p>A tuple holds a list. Can you change it?</p></div>
  <div class="fx" data-lang="py">t = ([1], 2)
t[0].append(9)          # the list inside is mutable
print(t)
try:
    t[0] += [5]         # list.__iadd__ runs, THEN tuple item assignment fails
except TypeError as e:
    print("TypeError:", e)
print(t)</div>
  <div class="fx" data-lang="text">([1, 9], 2)
TypeError: 'tuple' object does not support item assignment
([1, 9, 5], 2)</div>
  <p>What happened in the last two lines: <code>t[0] += [5]</code> is two steps. Step 1, the list adds 5 to itself (this works). Step 2, Python tries to put the list back into slot 0 of the tuple (this fails, because tuples cannot change). So you get an error and a changed list.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Immutability is only one level deep. The tuple cannot swap its items, but a list inside it can still change. Such a tuple also cannot be a dict key.</p></div>

  <h2 id="pf-types"><span class="num">03</span>Core Types &amp; Conversion</h2>
  <p>A <strong>type</strong> tells Python what kind of value something is, and so what you can do with it. You can add two numbers. You can make text uppercase. You cannot make a number uppercase. <code>type(x)</code> tells you the type.</p>
  <div class="fx" data-lang="py">print(type(5), type(5.0), type("5"), type(True), type(None))
marks = "87"
print(marks + "3", int(marks) + 3)</div>
  <div class="fx" data-lang="text">&lt;class 'int'&gt; &lt;class 'float'&gt; &lt;class 'str'&gt; &lt;class 'bool'&gt; &lt;class 'NoneType'&gt;
873 90</div>
  <p>The second line is a common first bug. Data read from a form or a file comes as text. <code>"87" + "3"</code> joins text and gives <code>"873"</code>. Convert to <code>int</code> first to do maths.</p>
  <table class="tbl">
    <tr><th>Type</th><th>What it is</th><th>Gotcha</th></tr>
    <tr><td><code>int</code></td><td>Whole number of any size</td><td>No overflow, but ~50× slower than numpy int64</td></tr>
    <tr><td><code>float</code></td><td>64-bit binary fraction (IEEE 754)</td><td>0.1 has no exact binary form</td></tr>
    <tr><td><code>bool</code></td><td>A kind of int (True = 1)</td><td><code>sum(mask)</code> counts Trues</td></tr>
    <tr><td><code>str</code></td><td>Unchangeable sequence of Unicode characters</td><td><code>len</code> counts characters, not bytes</td></tr>
    <tr><td><code>bytes</code></td><td>Unchangeable sequence of 0–255 values</td><td>Files, network, hashing; <code>str.encode()</code></td></tr>
  </table>
  <p><strong>Why floats look wrong.</strong> A float is a number with a decimal point. The computer stores it in base 2 (only 0s and 1s). Most decimals like 0.1 cannot be written exactly in base 2, so a tiny error appears at the end.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Write 1/3 in decimal: 0.3333… You must stop somewhere, so 1/3 + 1/3 + 1/3 gives 0.9999, not 1. Computers have the same problem with 0.1 in binary.</p></div>
  <div class="fx" data-lang="py">print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
import math
from decimal import Decimal
print(math.isclose(0.1 + 0.2, 0.3))
print(Decimal("0.1") + Decimal("0.2"))
print(2 ** 100)                  # ints never overflow
print(True + True, isinstance(True, int))
print(round(2.5), round(3.5))    # banker's rounding</div>
  <div class="fx" data-lang="text">0.30000000000000004
False
True
0.3
1267650600228229401496703205376
2 True
2 4</div>
  <p>Line by line: <code>math.isclose</code> asks "are these nearly equal?", which is the right question for floats. <code>Decimal</code> stores numbers in base 10, like we write them, so 0.1 + 0.2 is exactly 0.3. <code>True + True</code> is 2 because a bool is secretly the int 1 or 0. <code>round</code> uses <strong>banker's rounding</strong>: an exact half goes to the nearest even number, so over many numbers the rounding errors cancel.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Never compare floats with <code>==</code>. Use <code>math.isclose</code> / <code>np.isclose</code>. For money (like a UPI balance) use <code>Decimal</code> built from strings. <code>round()</code> sends halves to the even number.</p></div>
  <p><strong>str vs bytes.</strong> <code>str</code> is text for humans, like "café". But files and the network only carry raw numbers 0–255, called <code>bytes</code>. <strong>Encoding</strong> is the rule that turns text into bytes; UTF-8 is the common one. <code>encode</code> turns text into bytes; <code>decode</code> turns bytes back. The "é" needs two bytes in UTF-8, so the text has 4 characters but 5 bytes.</p>
  <div class="fx" data-lang="py">s = "café"
b = s.encode("utf-8")
print(len(s), len(b), b)
print(b.decode("utf-8"))
print(int("42"), int(3.9), int(-3.9), float("1e-3"))
print(bool("False"), bool(""), bool([]), bool(0.0))
print(str(42) + "!", list("abc"), tuple([1, 2]))
try:
    int("3.9")
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">4 5 b'caf\\xc3\\xa9'
café
42 3 -3 0.001
True False False False
42! ['a', 'b', 'c'] (1, 2)
ValueError: invalid literal for int() with base 10: '3.9'</div>
  <ul>
    <li><code>int()</code> cuts toward zero. It does not round. So <code>int(3.9)</code> is 3 and <code>int(-3.9)</code> is -3.</li>
    <li><strong>Truthy / falsy</strong>: every value counts as True or False in an <code>if</code>. Empty or zero things are <strong>falsy</strong>: 0, 0.0, "", [], {}, set(), None, False. Everything else is <strong>truthy</strong>.</li>
    <li><code>bool(x)</code> only checks "empty or not". Any non-empty string is True, even <code>"False"</code>. Read flags with <code>s.lower() in {"1", "true", "yes"}</code>.</li>
  </ul>

  <h2 id="pf-ops"><span class="num">04</span>Operators</h2>
  <p>An <strong>operator</strong> is a symbol that does a job on values: <code>+</code> adds, <code>&lt;</code> compares, <code>and</code> combines conditions. Most work like school maths. The surprises are in division, <code>and</code>/<code>or</code>, and arrays.</p>
  <p><strong>Three kinds of division.</strong> You have 17 laddoos and 5 kids. <code>/</code> gives the exact share (3.4). <code>//</code> gives whole laddoos per kid (3) — this is <strong>floor division</strong>, it rounds down. <code>%</code> gives the laddoos left over (2) — this is the <strong>remainder</strong> or <strong>modulo</strong>.</p>
  <div class="fx" data-lang="py">laddoos, kids = 17, 5
print(laddoos / kids)    # exact share
print(laddoos // kids)   # whole laddoos each
print(laddoos % kids)    # left over</div>
  <div class="fx" data-lang="text">3.4
3
2</div>
  <table class="tbl">
    <tr><th>Kind</th><th>Operators</th><th>Remember</th></tr>
    <tr><td>Arithmetic</td><td><code>+ - * / // % **</code></td><td><code>/</code> → float; <code>//</code> rounds down toward −∞</td></tr>
    <tr><td>Comparison</td><td><code>== != &lt; &lt;= &gt; &gt;=</code></td><td>Chains: <code>1 &lt; x &lt; 10</code></td></tr>
    <tr><td>Logical</td><td><code>and or not</code></td><td>Stop early, return an operand</td></tr>
    <tr><td>Membership</td><td><code>in, not in</code></td><td>list O(n), set/dict O(1)</td></tr>
    <tr><td>Identity</td><td><code>is, is not</code></td><td>Same object</td></tr>
    <tr><td>Bitwise</td><td><code>&amp; | ^ ~ &lt;&lt; &gt;&gt;</code></td><td>Flags, masks; <code>~x = -(x+1)</code></td></tr>
    <tr><td>Assignment</td><td><code>= += -= *= :=</code></td><td>Walrus assigns inside an expression</td></tr>
  </table>
  <p>Two words in the table need meaning. <strong>O(n)</strong> means "time grows with the number of items": <code>in</code> on a list checks items one by one. <strong>O(1)</strong> means "same time no matter how many items": a set or dict jumps straight to the answer. <strong>Bitwise</strong> operators work on the 0s and 1s of a number, one position at a time.</p>
  <p><strong>Short-circuit.</strong> <code>and</code>/<code>or</code> stop as soon as the answer is known. They return the value they stopped at, which is not always True/False.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>or</code> is like asking friends for a pen: the first one who has it ends the search. <code>and</code> is like a checklist at a gate: the first failed check stops you.</p></div>
  <div class="fx" data-lang="py">print(7 / 2, 7 // 2, -7 // 2, -7 % 2, 2 ** 10)
print(1 &lt; 5 &lt; 10, 3 == 3.0)
print(0 or "default", 5 and "yes", 5 or "never", [] and 1/0)
print(3 in [1, 2, 3], "py" in "python", "a" in {"a": 1})
print(5 &amp; 3, 5 | 3, 5 ^ 3, ~5, 5 &lt;&lt; 1, 5 &gt;&gt; 1)
print(bin(5), bin(3), bin(5 &amp; 3))
data = [3, 8, 1, 9]
if (n := len(data)) &gt; 3:
    print(f"{n} items")</div>
  <div class="fx" data-lang="text">3.5 3 -4 1 1024
True True
default yes 5 []
True True True
1 7 6 -6 10 2
0b101 0b11 0b1
4 items</div>
  <ul>
    <li><code>-7 // 2</code> is -4, not -3. "Round down" means toward minus infinity, and -4 is below -3.5.</li>
    <li><code>[] and 1/0</code> never divides. <code>[]</code> is falsy, so <code>and</code> stops there and returns it. <code>"a" in dict</code> checks keys only.</li>
    <li><code>5 &amp; 3</code>: 5 is <code>101</code> in binary, 3 is <code>011</code>. Keep only positions where both are 1 → <code>001</code> = 1.</li>
    <li><code>:=</code> is the <strong>walrus operator</strong>. It saves a value into a name and uses it in the same line. Here <code>n</code> gets the length and is compared with 3.</li>
  </ul>
  <p>In data work you filter arrays: "ages above 18 and below 65". A numpy array holds many values, so each comparison gives many True/False values, one per element. <code>and</code> wants a single True/False, so it fails. Use <code>&amp;</code>, which works element by element.</p>
  <div class="fx" data-lang="py">import numpy as np
age = np.array([15, 25, 40, 70])
print((age &gt; 18) &amp; (age &lt; 65))
age &gt; 18 and age &lt; 65</div>
  <div class="fx" data-lang="text">[False  True  True False]
Traceback (most recent call last): ...
ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>and</code> needs one True/False, but an array has many. In numpy and pandas use <code>&amp;</code> <code>|</code> <code>~</code> for element-wise logic. Put brackets around each condition, because <code>&amp;</code> runs before <code>&gt;</code>.</p></div>

  <h2 id="pf-flow"><span class="num">05</span>Control Flow</h2>
  <p>A program normally runs top to bottom, line by line. <strong>Control flow</strong> is how you change that: skip lines (<code>if</code>), repeat lines (<code>for</code>, <code>while</code>), or stop early (<code>break</code>). Python uses indentation (the spaces at the start of a line) to show which lines belong inside an <code>if</code> or a loop.</p>
  <div class="flow"><span>if / elif / else</span><span>for x in iterable</span><span>while cond</span><span>break / continue</span><span>loop-else</span><span>match / case</span></div>
  <p>The basics in one example. <code>if/elif/else</code> picks the first true branch. <code>for</code> walks over items. <code>enumerate</code> also gives the position. <code>zip</code> walks two lists side by side. <code>while</code> repeats as long as a condition is true. An <strong>iterable</strong> is anything you can loop over: a list, a string, a dict, a file.</p>
  <div class="fx" data-lang="py">marks = 72
if marks &gt;= 90:
    grade = "A"
elif marks &gt;= 60:
    grade = "B"
else:
    grade = "C"
print(grade)

names = ["Asha", "Ben"]
scores = [88, 75]
for i, n in enumerate(names):
    print(i, n)
for n, s in zip(names, scores):
    print(n, s)

balance = 100
while balance &gt;= 30:
    balance -= 30        # buy a 30-rupee samosa plate
print("left:", balance)</div>
  <div class="fx" data-lang="text">B
0 Asha
1 Ben
Asha 88
Ben 75
left: 10</div>
  <p><code>break</code> leaves the loop at once. <code>continue</code> skips to the next round. Python has one rare extra: a loop can have an <code>else</code>.</p>
  <p><strong>loop-else</strong> runs only when the loop finishes without <code>break</code>. It removes the need for a <code>found = False</code> flag in search code.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>You search your school bag for a pen. Found it → stop (break). Checked every pocket and nothing → "else: borrow one".</p></div>
  <figure class="viz"><svg viewBox="0 0 520 150" width="520">
    <defs><marker id="pf-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="55" width="124" height="36" rx="6" class="fb sb"/><text x="20" y="77">for x in items</text>
    <rect x="190" y="10" width="130" height="36" rx="6" class="fr sr"/><text x="204" y="32">hit break</text>
    <rect x="190" y="100" width="130" height="36" rx="6" class="fg sg"/><text x="200" y="122">ran to the end</text>
    <rect x="390" y="10" width="120" height="36" rx="6" class="fs" stroke="currentColor"/><text x="402" y="32">skip else</text>
    <rect x="390" y="100" width="120" height="36" rx="6" class="fg sg"/><text x="402" y="122">run else:</text>
    <line x1="134" y1="68" x2="188" y2="32" stroke="currentColor" marker-end="url(#pf-ah3)"/>
    <line x1="134" y1="80" x2="188" y2="116" stroke="currentColor" marker-end="url(#pf-ah3)"/>
    <line x1="320" y1="28" x2="388" y2="28" stroke="currentColor" marker-end="url(#pf-ah3)"/>
    <line x1="320" y1="118" x2="388" y2="118" stroke="currentColor" marker-end="url(#pf-ah3)"/>
  </svg><figcaption>The loop's else means "no break happened". Read it as "nobreak".</figcaption></figure>
  <div class="fx" data-lang="py">def find(items, target):
    for i, x in enumerate(items):
        if x == target:
            print("found at", i)
            break
    else:                      # runs only if no break
        print("not found")
find([4, 7, 9], 7)
find([4, 7, 9], 5)</div>
  <div class="fx" data-lang="text">found at 1
not found</div>
  <p><strong>match/case</strong> (Python 3.10+) is a smarter <code>if/elif</code>. It checks the <em>shape</em> of data, not only its value: "is this a dict with an <code>action</code> key?", "is this a list of two items?". It also pulls pieces out into names in the same step. Each <code>case</code> is a <strong>pattern</strong> — a template the data must fit. The first pattern that fits wins. <code>_</code> fits anything, so it is the default.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A post office sorting counter: "is it a parcel with a PIN code? a letter? anything else?" Each packet goes to the first slot it fits, and the clerk reads the PIN off it.</p></div>
  <div class="fx" data-lang="py">def handle(cmd):
    match cmd:
        case "quit" | "exit":                          # OR of literals
            return "bye"
        case {"action": "train", "epochs": int(n)} if n &gt; 0:   # dict shape + type + guard
            return f"train {n} epochs"
        case [x, y]:                                   # any 2-item sequence
            return f"point {x},{y}"
        case [first, *rest]:
            return f"first={first} rest={rest}"
        case _:                                        # default
            return "unknown"
for c in ["exit", {"action": "train", "epochs": 5}, (3, 4), [1, 2, 3], 42]:
    print(handle(c))</div>
  <div class="fx" data-lang="text">bye
train 5 epochs
point 3,4
first=1 rest=[2, 3]
unknown</div>
  <p>Reading the patterns: <code>|</code> means "or". <code>int(n)</code> means "must be an int; call it n". <code>if n &gt; 0</code> after a pattern is a <strong>guard</strong> — an extra condition. <code>*rest</code> collects all remaining items into a list.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>case LIMIT:</code> with a bare name does not compare with <code>LIMIT</code>. It catches the value into a new variable and always matches. Compare constants with dotted names (<code>case Color.RED:</code>) or a guard. Dict patterns match if the listed keys exist (extra keys are fine). Strings never match list patterns.</p></div>

  <h2 id="pf-func"><span class="num">06</span>Function Parameters</h2>
  <p>A <strong>function</strong> is a named, reusable block of code. You write it once with <code>def</code> and call it many times. The names in brackets in the <code>def</code> line are <strong>parameters</strong> — the inputs it expects. The actual values you pass in a call are <strong>arguments</strong>. A parameter can have a <strong>default</strong> — a value used when the caller gives nothing.</p>
  <p>You can pass an argument in two ways. <strong>By position</strong>: first value to first parameter. <strong>By keyword</strong>: write the name, so order does not matter.</p>
  <div class="fx" data-lang="py">def greet(name, greeting="Namaste"):
    return f"{greeting}, {name}!"
print(greet("Asha"))                       # by position, default used
print(greet("Ben", "Hello"))               # by position
print(greet(greeting="Vanakkam", name="Chen"))  # by name, any order</div>
  <div class="fx" data-lang="text">Namaste, Asha!
Hello, Ben!
Vanakkam, Chen!</div>
  <p>Python also lets you control <em>how</em> callers may pass each value. Good choices make calls hard to get wrong. The picture shows all five kinds of parameters, in the only order Python allows.</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <text x="10" y="20">def f(a, /, b, *args, key, **kwargs)</text>
    <rect x="10" y="38" width="90" height="34" rx="5" class="fv"/><text x="20" y="60">a</text>
    <rect x="105" y="38" width="110" height="34" rx="5" class="fb sb"/><text x="115" y="60">b</text>
    <rect x="220" y="38" width="110" height="34" rx="5" class="ft st"/><text x="230" y="60">*args</text>
    <rect x="335" y="38" width="120" height="34" rx="5" class="fg sg"/><text x="345" y="60">key</text>
    <rect x="460" y="38" width="130" height="34" rx="5" class="fs" stroke="currentColor"/><text x="470" y="60">**kwargs</text>
    <text x="10" y="92" class="tm">positional</text><text x="10" y="105" class="tm">only</text>
    <text x="105" y="92" class="tm">positional</text><text x="105" y="105" class="tm">or keyword</text>
    <text x="220" y="92" class="tm">extra args</text><text x="220" y="105" class="tm">→ tuple</text>
    <text x="335" y="92" class="tm">keyword-only</text><text x="335" y="105" class="tm">(after *)</text>
    <text x="460" y="92" class="tm">extra kwargs</text><text x="460" y="105" class="tm">→ dict</text>
  </svg><figcaption>Parameters always come in this left-to-right order. / and * are markers, not parameters.</figcaption></figure>
  <ul>
    <li><strong>Positional-only</strong> (before <code>/</code>) — must be passed by position.</li>
    <li><strong>Normal</strong> — position or keyword, caller's choice.</li>
    <li><strong>*args</strong> — collects any extra positional values into a tuple.</li>
    <li><strong>Keyword-only</strong> (after <code>*</code> or <code>*args</code>) — must be passed by name.</li>
    <li><strong>**kwargs</strong> — collects any extra <code>name=value</code> pairs into a dict.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>An exam form: some boxes are filled in fixed order (roll number, name), some must be labelled ("Category: ___"), and a "remarks" box takes anything extra. <code>*args</code> and <code>**kwargs</code> are the remarks box.</p></div>
  <div class="fx" data-lang="py">def f(a, b=2, *args, scale=1.0, **kwargs):
    print(a, b, args, scale, kwargs)
f(1)
f(1, 3, 4, 5, scale=0.5, lr=0.01)

def fit(X, /, *, epochs=10):       # X positional-only, epochs keyword-only
    return f"{len(X)} rows, {epochs} epochs"
print(fit([1, 2, 3], epochs=5))
try:
    fit([1, 2, 3], 5)              # positional epochs not allowed
except TypeError as e:
    print("TypeError:", e)

nums = [1, 2, 3]
cfg = {"scale": 2.0, "lr": 0.1}
f(*nums, **cfg)                    # unpack at the call site</div>
  <div class="fx" data-lang="text">1 2 () 1.0 {}
1 3 (4, 5) 0.5 {'lr': 0.01}
3 rows, 5 epochs
TypeError: fit() takes 1 positional argument but 2 were given
1 2 (3,) 2.0 {'lr': 0.1}</div>
  <p>In the second call, 1 and 3 fill <code>a</code> and <code>b</code>. The extra 4 and 5 go into <code>args</code>. <code>lr=0.01</code> has no matching parameter, so it goes into <code>kwargs</code>. In the last call, <code>*nums</code> spreads the list out as separate values, and <code>**cfg</code> spreads the dict out as <code>name=value</code> pairs. This is called <strong>unpacking</strong>.</p>
  <p>Keyword-only params make calls easy to read: <code>train(model, epochs=5)</code> instead of a mystery <code>5</code>. That is why sklearn uses them.</p>
  <div class="callout pred"><span class="label">Predict the output</span><p>What do the two calls print?</p></div>
  <div class="fx" data-lang="py">def add_item(item, lst=[]):        # default built ONCE, at def time
    lst.append(item)
    return lst
print(add_item(1), add_item(2))
print(add_item.__defaults__)

def add_item_ok(item, lst=None):   # None sentinel
    if lst is None:
        lst = []                   # fresh list per call
    lst.append(item)
    return lst
print(add_item_ok(1), add_item_ok(2))</div>
  <div class="fx" data-lang="text">[1, 2] [1, 2]
([1, 2],)
[1] [2]</div>
  <div class="callout trap"><span class="label">Trap</span><p>Default values are built once, when <code>def</code> runs, and stored on the function. So a list default is one shared list for every call. Both prints show <code>[1, 2]</code> because both calls return that same list. Use <code>None</code> and create the list inside. A value like <code>None</code> used to mean "nothing was passed" is called a <strong>sentinel</strong>.</p></div>
  <p>One more idea: functions are <strong>first-class</strong> objects. Like a list or a number, a function can be stored in a variable, put in a dict, passed into another function, or returned. You will see this in <code>sorted(key=...)</code> below and in the hands-on router.</p>

  <h2 id="pf-rec"><span class="num">07</span>Recursion &amp; Lambda</h2>
  <p>Some problems contain smaller copies of themselves. A folder contains folders. A family tree contains smaller family trees. A <strong>recursive</strong> function solves such a problem by calling itself on the smaller copy. It must stop at a <strong>base case</strong> — a case small enough to answer directly. Without a base case it would call itself forever.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>In a long queue you ask "what is my position?" to the person ahead. They ask the person ahead of them, and so on. The first person says "1" (base case). Each answer comes back +1.</p></div>
  <p>A tiny example: a countdown. <code>countdown(3)</code> prints 3 and hands the smaller job <code>countdown(2)</code> to itself. At 0 it stops.</p>
  <div class="fx" data-lang="py">def countdown(n):
    if n == 0:            # base case: stop here
        print("Go!")
        return
    print(n)
    countdown(n - 1)      # smaller problem
countdown(3)</div>
  <div class="fx" data-lang="text">3
2
1
Go!</div>
  <p>Factorial is the classic example: 3! = 3 × 2 × 1. The picture shows how Python handles <code>fact(3)</code>. Calls go down, each one waiting for the answer from below. The base case answers 1, and the answers come back up, getting multiplied on the way.</p>
  <figure class="viz"><svg viewBox="0 0 520 190" width="520">
    <defs><marker id="pf-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" class="tm">calls go down</text>
    <text x="380" y="16" class="tm">answers come up</text>
    <rect x="120" y="26" width="200" height="30" rx="6" class="fb sb"/><text x="132" y="46">fact(3) = 3 * fact(2)</text>
    <rect x="120" y="74" width="200" height="30" rx="6" class="fb sb"/><text x="132" y="94">fact(2) = 2 * fact(1)</text>
    <rect x="120" y="122" width="200" height="30" rx="6" class="fg sg"/><text x="132" y="142">fact(1) = 1  (base)</text>
    <line x1="160" y1="56" x2="160" y2="72" stroke="currentColor" marker-end="url(#pf-ah4)"/>
    <line x1="160" y1="104" x2="160" y2="120" stroke="currentColor" marker-end="url(#pf-ah4)"/>
    <line x1="290" y1="120" x2="290" y2="106" stroke="currentColor" marker-end="url(#pf-ah4)"/>
    <line x1="290" y1="72" x2="290" y2="58" stroke="currentColor" marker-end="url(#pf-ah4)"/>
    <text x="340" y="142" class="tg">returns 1</text>
    <text x="340" y="94" class="tg">returns 2*1 = 2</text>
    <text x="340" y="46" class="tg">returns 3*2 = 6</text>
    <text x="60" y="178" class="tm">each waiting call uses memory: too deep → RecursionError</text>
  </svg><figcaption>Each call waits for the one below it. The base case starts the answers coming back.</figcaption></figure>
  <div class="flow"><span>fact(3)</span><span>3 * fact(2)</span><span>2 * fact(1)</span><span>base: 1</span><span>unwind → 6</span></div>
  <p>Every waiting call takes some memory (a "frame" on the <strong>call stack</strong> — the pile of calls not yet finished). Python stops you at about 1000 waiting calls, to protect itself.</p>
  <div class="fx" data-lang="py">import sys
from functools import lru_cache
def fact(n):
    return 1 if n &lt;= 1 else n * fact(n - 1)   # base case + smaller step
print(fact(5))
print(sys.getrecursionlimit())
try:
    fact(5000)
except RecursionError as e:
    print("RecursionError:", e)

@lru_cache(maxsize=None)            # memoise: each n computed once
def fib(n):
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)
print(fib(80))</div>
  <div class="fx" data-lang="text">120
1000
RecursionError: maximum recursion depth exceeded
23416728348467685</div>
  <p>The last part uses <code>@lru_cache</code>. Plain <code>fib(n)</code> asks for <code>fib(n-1)</code> and <code>fib(n-2)</code>, and those ask again, so the same small values get computed millions of times. <code>@lru_cache</code> saves each answer the first time and reuses it. Saving answers to reuse later is called <strong>memoisation</strong>. With it, <code>fib(80)</code> is instant.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Python keeps every call open in memory and has no tail-call optimisation (some languages reuse the frame for a final self-call; Python does not). For depth in the thousands, use a loop or your own stack (a list). Do not just raise the limit.</p></div>
  <p>A <strong>lambda</strong> is a one-line function with no name. <code>lambda p: p[1]</code> means "take p, give back p[1]". It is handy when a function wants another small function as input, like <code>sorted(key=...)</code>. Use <code>def</code> for anything you would name or test.</p>
  <div class="fx" data-lang="py">people = [("Asha", 31), ("Ben", 25), ("Chen", 40)]
print(sorted(people, key=lambda p: p[1]))
print(list(map(lambda x: x * 2, [1, 2, 3])))
fs = [lambda: i for i in range(3)]
print([g() for g in fs])                    # late binding
fs = [lambda i=i: i for i in range(3)]      # default freezes current i
print([g() for g in fs])</div>
  <div class="fx" data-lang="text">[('Ben', 25), ('Asha', 31), ('Chen', 40)]
[2, 4, 6]
[2, 2, 2]
[0, 1, 2]</div>
  <div class="callout trap"><span class="label">Trap</span><p>A lambda reads outside variables when it is <em>called</em>, not when it is made. This is called <strong>late binding</strong>. All three lambdas read <code>i</code> after the loop ended, so all see 2. <code>i=i</code> freezes the value at creation, because defaults are built at creation time (section 06).</p></div>

  <h2 id="pf-scope"><span class="num">08</span>Scope: the LEGB Rule</h2>
  <p>Two functions in a big project might both use a variable called <code>total</code>. If they shared it, one would overwrite the other. So Python gives each function its own private names. <strong>Scope</strong> is the area of code where a name can be seen.</p>
  <p>A name created inside a function is <strong>local</strong>: it exists only while that function runs. A name created at the top of the file is <strong>global</strong>: every function can read it.</p>
  <div class="fx" data-lang="py">rate = 18                 # global
def price_with_gst(price):
    tax = price * rate / 100   # tax is local; rate is read from global
    return price + tax
print(price_with_gst(100))
try:
    print(tax)
except NameError as e:
    print("NameError:", e)</div>
  <div class="fx" data-lang="text">118.0
NameError: name 'tax' is not defined</div>
  <p>When Python meets a name, it searches four places, from inside to outside, and uses the first match. The first letters spell <strong>LEGB</strong>: Local, Enclosing (an outer function, if this function is inside another), Global, Built-in (names Python gives you, like <code>len</code> and <code>print</code>).</p>
  <figure class="viz"><svg viewBox="0 0 440 190" width="440">
    <rect x="5" y="5" width="430" height="180" rx="10" class="fs" stroke="currentColor"/><text x="15" y="24">B  built-in: len, print, sum</text>
    <rect x="25" y="34" width="390" height="140" rx="10" class="fv"/><text x="35" y="53">G  module globals: x = "global"</text>
    <rect x="45" y="63" width="350" height="100" rx="10" class="ft st"/><text x="55" y="82">E  outer(): x = "enclosing"</text>
    <rect x="65" y="92" width="310" height="60" rx="10" class="fb sb"/><text x="75" y="113">L  inner(): looks here first</text>
    <text x="75" y="136">miss → go one box out</text>
  </svg><figcaption>Lookup walks outward: Local → Enclosing → Global → Built-in. First match wins.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>Looking for your keys: your room first, then the house, then the street, then lost-and-found.</p></div>
  <p>Reading an outer name is free. <em>Changing</em> what an outer name points to needs permission: <code>global x</code> for a top-of-file name, <code>nonlocal x</code> for an outer function's name. A <strong>closure</strong> is an inner function that remembers variables from the outer function, even after the outer one has returned. <code>nonlocal</code> lets it change them.</p>
  <div class="fx" data-lang="py">x = "global"
def outer():
    x = "enclosing"
    def inner():
        nonlocal x                 # rebind outer's x
        x = "changed by inner"
    inner()
    print(x)
outer()
print(x)

count = 0
def bump():
    count += 1                     # assignment makes count LOCAL
try:
    bump()
except UnboundLocalError as e:
    print("UnboundLocalError:", e)

def bump_ok():
    global count
    count += 1
bump_ok(); print(count)

def make_counter():                # closure: step remembers n
    n = 0
    def step():
        nonlocal n
        n += 1
        return n
    return step
c = make_counter()
print(c(), c(), c())</div>
  <div class="fx" data-lang="text">changed by inner
global
UnboundLocalError: cannot access local variable 'count' where it is not associated with a value
1
1 2 3</div>
  <p>The counter is the key example. <code>make_counter</code> finished long ago, but <code>step</code> still remembers its own <code>n</code> and adds 1 each call. Decorators (in the Advanced note) are built on this.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Python fixes scope before running. If a function assigns to a name anywhere, that name is local in the whole function. Reading a global is fine. Rebinding it needs <code>global</code>. Changing it in place (<code>items.append</code>) needs nothing. Returning values is better than <code>global</code>.</p></div>

  <h2 id="pf-build"><span class="num">09</span>Hands-on: An Event Router</h2>
  <p>An app receives "events" — small dicts like a click or a key press — and must decide what to do with each. This router uses ideas from every section: a <code>None</code> default, a keyword-only flag, <code>**kwargs</code>, lambdas and <code>match</code> guards. Predict each line, then run it.</p>
  <div class="fx" data-lang="py">def route(event, handlers=None, *, verbose=False, **meta):
    handlers = handlers if handlers is not None else {}
    match event:
        case {"type": "click", "x": int(x), "y": int(y)}:
            out = f"click at ({x},{y})"
        case {"type": "key", "key": str(k)} if len(k) == 1:
            out = f"key {k!r}"
        case {"type": t}:
            out = handlers.get(t, lambda: f"no handler for {t}")()
        case _:
            out = "malformed"
    if verbose:
        out += f" {meta}"
    return out

print(route({"type": "click", "x": 3, "y": 4}))
print(route({"type": "key", "key": "q"}, verbose=True, user="asha"))
print(route({"type": "scroll"}, {"scroll": lambda: "scrolled"}))
print(route({"type": "resize"}))
print(route([1, 2]))</div>
  <div class="fx" data-lang="text">click at (3,4)
key 'q' {'user': 'asha'}
scrolled
no handler for resize
malformed</div>
  <p>Line 3 finds a handler function in the dict and calls it. Line 4 finds none, so <code>.get</code> returns the default lambda, which is then called. Line 5 is a list, not a dict, so only <code>_</code> fits.</p>
  <p><strong>Extend it:</strong> add a <code>"batch"</code> case that matches <code>{"type": "batch", "events": [*evs]}</code> and routes each event recursively.</p>

  <h2 id="pf-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>is</code> and <code>==</code>?</summary><div class="qa-body"><code>==</code> compares values (calls <code>__eq__</code>). <code>is</code> checks if both names point to the same object (same <code>id</code>). <code>[1,2] == [1,2]</code> is True; <code>[1,2] is [1,2]</code> is False. Use <code>is</code> for <code>None</code>, because a class can change what <code>==</code> means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Mutable vs immutable: examples, and why it matters.</summary><div class="qa-body">Mutable (list, dict, set) change in place and keep their id. Immutable (int, float, str, tuple) make a new object on every "change". It matters for: (1) sharing — two names on one mutable object see each other's edits; (2) hashing — only immutables can be dict keys / set items; (3) safety — immutables are safe to pass around and across threads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>After <code>a = [1]; b = a; b.append(2)</code>, what is <code>a</code>? How do you avoid it?</summary><div class="qa-body"><code>[1, 2]</code>. <code>b = a</code> only adds a second name to the same list. To get an independent list, copy it: <code>b = a.copy()</code> (or <code>list(a)</code>, <code>a[:]</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the mutable default argument trap and its fix.</summary><div class="qa-body">Defaults are built once, when <code>def</code> runs, and stored in <code>f.__defaults__</code>. <code>def f(lst=[])</code> shares one list across all calls, so appends pile up. Fix: <code>lst=None</code>, then <code>if lst is None: lst = []</code> inside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>print(0.1 + 0.2 == 0.3, round(2.5), -7 // 2)</code></summary><div class="qa-body"><code>False 2 -4</code>. Floats are binary approximations. <code>round</code> sends halves to the even number. <code>//</code> rounds down toward −∞.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does short-circuit evaluation return, and where is it useful?</summary><div class="qa-body"><code>A and B</code> returns A if A is falsy, else B. <code>A or B</code> returns A if A is truthy, else B. The right side may never run. Uses: <code>name = given or "default"</code>, <code>obj and obj.method()</code>, skipping a costly check. Careful: <code>x or default</code> also replaces valid falsy values like 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the <code>else</code> of a <code>for</code> loop run?</summary><div class="qa-body">Only when the loop ends without <code>break</code> (also when the iterable is empty). Typical use: search — <code>break</code> when found, <code>else</code> handles "not found" without a flag variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>*args</code> and <code>**kwargs</code> become inside the function?</summary><div class="qa-body"><code>args</code> is a tuple of extra positional arguments. <code>kwargs</code> is a dict of extra keyword arguments. At a call, <code>f(*lst)</code> and <code>f(**d)</code> unpack. The names are just habit; the stars matter. Order: <code>a, /, b, *args, kw, **kwargs</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why would you make a parameter keyword-only?</summary><div class="qa-body">Clear and safe calls: callers must write <code>fit(X, epochs=5)</code>, so arguments cannot be swapped by position. You can also reorder or add parameters later without breaking old calls. Put a bare <code>*</code> before them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain LEGB, <code>global</code> and <code>nonlocal</code>.</summary><div class="qa-body">Lookup order: Local → Enclosing function → Global (module) → Built-in; first match wins. Assigning to a name makes it local to the function. <code>global x</code> lets a function rebind the module-level x. <code>nonlocal x</code> rebinds the nearest outer function's x (used in closures).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>count += 1</code> inside a function raise <code>UnboundLocalError</code> when <code>count</code> is global?</summary><div class="qa-body">The assignment makes <code>count</code> local for the whole function, decided before the code runs. So the read on the right side finds a local with no value yet. Fix with <code>global count</code>, or better, pass it in and return the new value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>fs = [lambda: i for i in range(3)]; print([f() for f in fs])</code></summary><div class="qa-body"><code>[2, 2, 2]</code>. Each lambda reads <code>i</code> when called, after the loop finished. Fix: <code>lambda i=i: i</code> or <code>functools.partial</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your recursive tree walk crashes with <code>RecursionError</code> on deep data. Options?</summary><div class="qa-body">Python's default depth limit is about 1000, with no tail-call optimisation. Best fix: rewrite as a loop with your own stack (a list). Raising <code>sys.setrecursionlimit</code> is a stopgap and can crash Python. If sub-problems repeat, add <code>@lru_cache</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>df[df.a &gt; 1 and df.b &lt; 5]</code> fail?</summary><div class="qa-body"><code>and</code> needs one True/False for the whole Series, which is unclear → ValueError. Use element-wise <code>(df.a &gt; 1) &amp; (df.b &lt; 5)</code>. Brackets are needed because <code>&amp;</code> runs before comparisons.</div></details>
</main>`
});
