// notes/python/py_fundamentals.js — Python Fundamentals
Object.assign(TOPIC_CONTENT, {
  "py_fundamentals": `<main>
  <h1>Python Fundamentals</h1>
  <p class="lead">The mental model under every Python program: names point to objects, some objects can change and some can't, and functions decide which names they can see. Get this right and half of all "weird Python bugs" stop being weird. Everything here was run on Python 3.13.</p>

  <h2 id="pf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Python Fundamentals</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Names &amp; references</div>
        <ul>
          <li><b>Variable</b> — a name tag pointing to an object, not a box holding a value</li>
          <li><b>b = a</b> — copies the reference; both names share one object</li>
          <li><b>id(x)</b> — object identity (memory address in CPython)</li>
          <li><b>==</b> value equality (<code>__eq__</code>); <b>is</b> same object (same id)</li>
          <li><b>Mutate vs rebind</b> — <code>a.append()</code> changes the shared object; <code>a = [...]</code> moves only <code>a</code></li>
          <li>⚠ <b>Small-int cache</b> (−5…256) makes <code>is</code> look like <code>==</code> — never rely on it; use <code>is</code> only for <code>None</code>/<code>True</code>/<code>False</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mutable vs immutable</div>
        <ul>
          <li><b>Immutable</b> — int, float, bool, str, bytes, tuple, frozenset; "change" = new object</li>
          <li><b>Mutable</b> — list, dict, set, bytearray; changed in place, id stays</li>
          <li>💡 sealed envelope vs open notebook</li>
          <li><b>Why it matters</b> — aliasing bugs, only immutables are hashable (dict keys), safe to share</li>
          <li><b>+=</b> — new object for str/tuple, in-place for list</li>
          <li>⚠ <b>Tuple of lists</b> — tuple fixed, inner list still mutable; <code>t[0] += [5]</code> mutates AND raises</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core types</div>
        <ul>
          <li><b>int</b> — arbitrary precision, never overflows (slow vs numpy int64)</li>
          <li><b>float</b> — 64-bit IEEE 754; ⚠ <code>0.1 + 0.2 != 0.3</code> → <code>math.isclose</code>, <code>Decimal</code> for money</li>
          <li><b>bool</b> — subclass of int: <code>True + True == 2</code></li>
          <li><b>round()</b> — banker's rounding: <code>round(2.5) == 2</code></li>
          <li><b>str</b> = Unicode text; <b>bytes</b> = raw bytes; <code>encode</code>/<code>decode</code> between them</li>
          <li><b>Conversion</b> — <code>int(3.9)</code> → 3 (truncates); ⚠ <code>int("3.9")</code> errors; ⚠ <code>bool("False")</code> is True</li>
          <li><b>Falsy</b> — 0, 0.0, "", [], {}, set(), None, False</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Operators</div>
        <ul>
          <li><b>/</b> always float; <b>//</b> floors toward −∞: <code>-7 // 2 == -4</code></li>
          <li><b>Chaining</b> — <code>1 &lt; x &lt; 10</code></li>
          <li><b>and/or</b> short-circuit and return an operand: <code>0 or "default"</code> → "default"</li>
          <li><b>in</b> — O(n) on list, O(1) on set/dict</li>
          <li><b>Bitwise</b> &amp; | ^ ~ &lt;&lt; &gt;&gt;; <code>~x == -(x+1)</code></li>
          <li>⚠ numpy/pandas masks need <code>&amp;</code> + parentheses, not <code>and</code></li>
          <li><b>Walrus :=</b> — assign inside an expression</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Control flow</div>
        <ul>
          <li><b>Ternary</b> — <code>"pass" if s &gt;= 60 else "fail"</code></li>
          <li><b>for</b> over any iterable; <code>enumerate</code>, <code>zip</code>, <code>.items()</code></li>
          <li><b>loop-else</b> — else runs only if no <code>break</code>; search pattern</li>
          <li><b>match/case</b> (3.10+) — structural: literals, <code>|</code>, dict/list shapes, <code>*rest</code>, guards <code>if</code>, <code>_</code></li>
          <li>⚠ bare name in <code>case x:</code> captures anything; compare constants via dotted names</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Functions &amp; params</div>
        <ul>
          <li><b>Order</b> — <code>def f(pos_only, /, normal, *args, kw_only, **kwargs)</code></li>
          <li><b>*args</b> → tuple; <b>**kwargs</b> → dict; <code>f(*lst, **d)</code> unpacks</li>
          <li><b>Keyword-only</b> (after <code>*</code>) — forces readable calls: <code>fit(X, epochs=5)</code></li>
          <li>⚠ <b>Mutable default</b> — <code>def f(x=[])</code> built once, shared by every call → use <code>None</code></li>
          <li><b>First-class</b> — functions are objects: pass, return, store</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursion &amp; lambda</div>
        <ul>
          <li><b>Recursion</b> — base case + smaller step; default limit 1000 → <code>RecursionError</code></li>
          <li><b>No tail-call optimisation</b> — deep recursion → use a loop</li>
          <li><b>@lru_cache</b> — memoise overlapping subproblems (fib)</li>
          <li><b>lambda</b> — one-expression anonymous function; for <code>key=</code>, <code>map</code></li>
          <li>⚠ <b>Late binding</b> — <code>[lambda: i for i in ...]</code> all see last i; fix <code>lambda i=i: i</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scope (LEGB)</div>
        <ul>
          <li><b>Lookup</b> — Local → Enclosing → Global → Built-in, first hit wins</li>
          <li><b>Assignment</b> anywhere in a function makes the name local for the whole function</li>
          <li>⚠ <code>count += 1</code> on a global → <code>UnboundLocalError</code></li>
          <li><b>global</b> rebinds module name; <b>nonlocal</b> rebinds enclosing function's name</li>
          <li><b>Closure</b> — inner function remembers enclosing variables (counters, decorators)</li>
          <li>💡 nested rooms: look in your room, then the house, then the street</li>
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

  <h2 id="pf-names"><span class="num">01</span>Names &amp; References</h2>
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
  </svg><figcaption>Assignment never copies. It sticks another name tag on the same object.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A variable is a luggage tag, not a suitcase. Two tags can hang on one suitcase; moving a tag doesn't move the suitcase.</p></div>
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
  <div class="callout trap"><span class="label">Trap</span><p>CPython caches ints −5…256 and some strings, and merges equal constants in one file, so <code>is</code> sometimes "works" for values. It's an accident. Use <code>==</code> for values; <code>is</code> only for <code>None</code>, <code>True</code>, <code>False</code>.</p></div>

  <h2 id="pf-mut"><span class="num">02</span>Mutable vs Immutable</h2>
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
  </svg><figcaption>Immutable "changes" create a new object; mutable changes edit the existing one.</figcaption></figure>
  <div class="cards">
    <div><b>Immutable</b><p>int, float, bool, str, bytes, tuple, frozenset</p><small>Hashable → dict keys, set items; safe to share</small></div>
    <div><b>Mutable</b><p>list, dict, set, bytearray, most class instances</p><small>Edit in place → watch for aliasing</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Immutable = a sealed envelope: to change the letter you make a new envelope. Mutable = an open notebook: same notebook, new pages.</p></div>
  <div class="callout pred"><span class="label">Predict the output</span><p>A tuple holding a list. Can you change it?</p></div>
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
  <div class="callout trap"><span class="label">Trap</span><p>Immutability is shallow. The tuple can't swap its items, but a list inside it can still change. Such a tuple is also unhashable.</p></div>

  <h2 id="pf-types"><span class="num">03</span>Core Types &amp; Conversion</h2>
  <table class="tbl">
    <tr><th>Type</th><th>What it is</th><th>Gotcha</th></tr>
    <tr><td><code>int</code></td><td>Arbitrary precision; grows as needed</td><td>No overflow, but ~50× slower than numpy int64</td></tr>
    <tr><td><code>float</code></td><td>64-bit IEEE 754 binary fraction</td><td>0.1 has no exact binary form</td></tr>
    <tr><td><code>bool</code></td><td>Subclass of int (True = 1)</td><td><code>sum(mask)</code> counts Trues</td></tr>
    <tr><td><code>str</code></td><td>Immutable sequence of Unicode code points</td><td><code>len</code> counts characters, not bytes</td></tr>
    <tr><td><code>bytes</code></td><td>Immutable sequence of 0–255 values</td><td>Files, network, hashing; <code>str.encode()</code></td></tr>
  </table>
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
  <div class="callout trap"><span class="label">Trap</span><p>Never compare floats with <code>==</code>. Use <code>math.isclose</code> / <code>np.isclose</code>, and <code>Decimal</code> (built from strings) for money. <code>round()</code> rounds halves to even.</p></div>
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
    <li><code>int()</code> truncates toward zero; it does not round.</li>
    <li><code>bool(x)</code> tests emptiness, not meaning: any non-empty string is True. Parse flags with <code>s.lower() in {"1", "true", "yes"}</code>.</li>
  </ul>

  <h2 id="pf-ops"><span class="num">04</span>Operators</h2>
  <table class="tbl">
    <tr><th>Kind</th><th>Operators</th><th>Remember</th></tr>
    <tr><td>Arithmetic</td><td><code>+ - * / // % **</code></td><td><code>/</code> → float; <code>//</code> floors toward −∞</td></tr>
    <tr><td>Comparison</td><td><code>== != &lt; &lt;= &gt; &gt;=</code></td><td>Chains: <code>1 &lt; x &lt; 10</code></td></tr>
    <tr><td>Logical</td><td><code>and or not</code></td><td>Short-circuit, return an operand</td></tr>
    <tr><td>Membership</td><td><code>in, not in</code></td><td>list O(n), set/dict O(1)</td></tr>
    <tr><td>Identity</td><td><code>is, is not</code></td><td>Same object</td></tr>
    <tr><td>Bitwise</td><td><code>&amp; | ^ ~ &lt;&lt; &gt;&gt;</code></td><td>Flags, masks; <code>~x = -(x+1)</code></td></tr>
    <tr><td>Assignment</td><td><code>= += -= *= :=</code></td><td>Walrus assigns inside an expression</td></tr>
  </table>
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
  <p><code>[] and 1/0</code> never divides: <code>[]</code> is falsy, so <code>and</code> stops and returns it. <code>"a" in dict</code> checks keys only.</p>
  <div class="fx" data-lang="py">import numpy as np
age = np.array([15, 25, 40, 70])
print((age &gt; 18) &amp; (age &lt; 65))
age &gt; 18 and age &lt; 65</div>
  <div class="fx" data-lang="text">[False  True  True False]
Traceback (most recent call last): ...
ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()</div>
  <div class="callout trap"><span class="label">Trap</span><p>In numpy and pandas, element-wise logic uses <code>&amp;</code> <code>|</code> <code>~</code>, and each condition needs parentheses because <code>&amp;</code> binds tighter than <code>&gt;</code>.</p></div>

  <h2 id="pf-flow"><span class="num">05</span>Control Flow</h2>
  <div class="flow"><span>if / elif / else</span><span>for x in iterable</span><span>while cond</span><span>break / continue</span><span>loop-else</span><span>match / case</span></div>
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
  </svg><figcaption>The loop's else means "no break happened" — read it as "nobreak".</figcaption></figure>
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
  <p><strong>match/case</strong> (3.10+) matches the <em>shape</em> of data, not just values, and pulls pieces out into names.</p>
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
  <div class="callout trap"><span class="label">Trap</span><p><code>case LIMIT:</code> with a bare name doesn't compare to <code>LIMIT</code>; it captures the value into a new variable and always matches. Compare constants with dotted names (<code>case Color.RED:</code>) or a guard. Dict patterns match if the listed keys exist (extra keys are fine), and strings never match sequence patterns.</p></div>

  <h2 id="pf-func"><span class="num">06</span>Function Parameters</h2>
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
  <p>Keyword-only params make call sites self-documenting (<code>train(model, epochs=5)</code> vs a mystery <code>5</code>), which is why sklearn uses them.</p>
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
  <div class="callout trap"><span class="label">Trap</span><p>Defaults are evaluated once when <code>def</code> runs and stored on the function. A mutable default is shared by every call. (Both prints show <code>[1, 2]</code> because both calls return the same list.)</p></div>

  <h2 id="pf-rec"><span class="num">07</span>Recursion &amp; Lambda</h2>
  <div class="flow"><span>fact(3)</span><span>3 * fact(2)</span><span>2 * fact(1)</span><span>base: 1</span><span>unwind → 6</span></div>
  <p>A recursive function solves a smaller copy of the same problem until it hits a <strong>base case</strong>. Natural for trees, nested JSON, divide and conquer.</p>
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
  <div class="callout trap"><span class="label">Trap</span><p>Python has no tail-call optimisation and each frame costs memory. For depth in the thousands, rewrite as a loop or explicit stack instead of raising the limit.</p></div>
  <p>A <strong>lambda</strong> is a one-expression function with no name. Use it for short <code>key=</code> functions; use <code>def</code> for anything you'd name or test.</p>
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
  <div class="callout trap"><span class="label">Trap</span><p>Closures look variables up when called, not when created. All three lambdas read <code>i</code> after the loop ended (2).</p></div>

  <h2 id="pf-scope"><span class="num">08</span>Scope: the LEGB Rule</h2>
  <figure class="viz"><svg viewBox="0 0 440 190" width="440">
    <rect x="5" y="5" width="430" height="180" rx="10" class="fs" stroke="currentColor"/><text x="15" y="24">B  built-in: len, print, sum</text>
    <rect x="25" y="34" width="390" height="140" rx="10" class="fv"/><text x="35" y="53">G  module globals: x = "global"</text>
    <rect x="45" y="63" width="350" height="100" rx="10" class="ft st"/><text x="55" y="82">E  outer(): x = "enclosing"</text>
    <rect x="65" y="92" width="310" height="60" rx="10" class="fb sb"/><text x="75" y="113">L  inner(): looks here first</text>
    <text x="75" y="136">miss → go one box out</text>
  </svg><figcaption>Name lookup walks outward: Local → Enclosing → Global → Built-in. First match wins.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>Looking for your keys: your room first, then the house, then the street, then lost-and-found.</p></div>
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
  <div class="callout trap"><span class="label">Trap</span><p>Python decides scope at compile time: any assignment to a name inside a function makes it local everywhere in that function. Reading a global is fine; rebinding it needs <code>global</code>. Mutating it (<code>items.append</code>) needs nothing. Prefer returning values over <code>global</code>.</p></div>

  <h2 id="pf-build"><span class="num">09</span>Hands-on: An Event Router</h2>
  <p>Combines a <code>None</code> default, keyword-only flag, <code>**kwargs</code>, lambdas and <code>match</code> guards. Predict each line, then run it.</p>
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
  <p><strong>Extend it:</strong> add a <code>"batch"</code> case that matches <code>{"type": "batch", "events": [*evs]}</code> and routes each event recursively.</p>

  <h2 id="pf-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>is</code> and <code>==</code>?</summary><div class="qa-body"><code>==</code> compares values via <code>__eq__</code>; <code>is</code> checks whether both names point to the same object (same <code>id</code>). <code>[1,2] == [1,2]</code> is True, <code>[1,2] is [1,2]</code> is False. Use <code>is</code> for <code>None</code> because <code>__eq__</code> can be overridden.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Mutable vs immutable: examples, and why it matters.</summary><div class="qa-body">Mutable (list, dict, set) change in place and keep their id; immutable (int, float, str, tuple) create a new object on every "change". It matters for (1) aliasing — two names on one mutable object see each other's edits; (2) hashing — only immutables can be dict keys / set items; (3) sharing — immutables are safe to pass around and across threads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the mutable default argument trap and its fix.</summary><div class="qa-body">Defaults are evaluated once at <code>def</code> time and stored in <code>f.__defaults__</code>. <code>def f(lst=[])</code> shares one list across all calls, so appends accumulate. Fix: <code>lst=None</code>, then <code>if lst is None: lst = []</code> inside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>print(0.1 + 0.2 == 0.3, round(2.5), -7 // 2)</code></summary><div class="qa-body"><code>False 2 -4</code>. Floats are binary approximations; <code>round</code> uses banker's rounding (half to even); <code>//</code> floors toward −∞.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does short-circuit evaluation return, and where is it useful?</summary><div class="qa-body"><code>A and B</code> returns A if A is falsy, else B. <code>A or B</code> returns A if A is truthy, else B. The right side may never run. Uses: <code>name = given or "default"</code>, <code>obj and obj.method()</code>, skipping an expensive check. Careful: <code>x or default</code> also replaces valid falsy values like 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the <code>else</code> of a <code>for</code> loop run?</summary><div class="qa-body">Only when the loop finishes without <code>break</code> (including when the iterable is empty). Typical use: search — <code>break</code> on found, <code>else</code> handles "not found" without a flag variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>*args</code> and <code>**kwargs</code> become inside the function?</summary><div class="qa-body"><code>args</code> is a tuple of extra positional arguments, <code>kwargs</code> a dict of extra keyword arguments. At a call site, <code>f(*lst)</code> and <code>f(**d)</code> unpack. The names are convention; the stars matter. Order: <code>a, /, b, *args, kw, **kwargs</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why would you make a parameter keyword-only?</summary><div class="qa-body">Readability and safety: callers must write <code>fit(X, epochs=5)</code>, so arguments can't be swapped by position and you can reorder or add parameters later without breaking calls. Put a bare <code>*</code> before them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain LEGB, <code>global</code> and <code>nonlocal</code>.</summary><div class="qa-body">Name lookup order: Local → Enclosing function → Global (module) → Built-in; first match wins. Assigning to a name makes it local to the function. <code>global x</code> lets a function rebind the module-level x; <code>nonlocal x</code> rebinds the nearest enclosing function's x (used in closures).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>count += 1</code> inside a function raise <code>UnboundLocalError</code> when <code>count</code> is global?</summary><div class="qa-body">The assignment makes <code>count</code> local for the whole function at compile time, so the read on the right side looks up an unassigned local. Fix with <code>global count</code>, or better, pass it in and return the new value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>fs = [lambda: i for i in range(3)]; print([f() for f in fs])</code></summary><div class="qa-body"><code>[2, 2, 2]</code>. Closures read <code>i</code> when called, after the loop finished. Fix: <code>lambda i=i: i</code> or <code>functools.partial</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your recursive tree walk crashes with <code>RecursionError</code> on deep data. Options?</summary><div class="qa-body">Python has a default depth limit of ~1000 and no tail-call optimisation. Rewrite iteratively with an explicit stack (list) — the robust fix. Raising <code>sys.setrecursionlimit</code> is a stopgap and can crash the interpreter. If subproblems repeat, add <code>@lru_cache</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>df[df.a &gt; 1 and df.b &lt; 5]</code> fail?</summary><div class="qa-body"><code>and</code> needs one True/False for the whole Series, which is ambiguous → ValueError. Use element-wise <code>(df.a &gt; 1) &amp; (df.b &lt; 5)</code>, with parentheses because <code>&amp;</code> binds tighter than comparisons.</div></details>
</main>`
});
