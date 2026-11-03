// notes/python/py_dunder.js — Dunder Methods & the Data Model
Object.assign(TOPIC_CONTENT, {
  "py_dunder": `<main>
<h1>Dunder Methods &amp; the Data Model</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Dunder Methods &amp; the Data Model</span></div>
  <p class="lead">Python's syntax is a set of hooks: <code>len(x)</code> runs <code>type(x).__len__(x)</code>, <code>a + b</code> runs <code>__add__</code>, <code>for</code> runs <code>__iter__</code>, <code>with</code> runs <code>__enter__</code> and <code>__exit__</code>. These double-underscore ("dunder") methods, together with their rules, are the <strong>data model</strong>. A class that defines none of them prints as <code>&lt;__main__.Money object at 0x…&gt;</code>, compares by identity, cannot go in a set once it defines <code>==</code>, and raises <code>TypeError</code> on <code>+</code>, <code>&lt;</code>, <code>sum()</code> and <code>len()</code>. Implementing the right hooks is how NumPy arrays add element-wise, how pandas supports <code>df["col"]</code> and <code>len(df)</code>, and how a PyTorch model is called as <code>model(x)</code>; the hash/equality contract and <code>NotImplemented</code> are standard interview material. Code here was run on Python 3.13.</p>

  <h2 id="pd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dunder Methods</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The data model</div>
        <ul>
          <li><b>Dunder</b> = <b>d</b>ouble <b>under</b>score hook that syntax calls</li>
          <li><code>len(x)</code> → <code>type(x).__len__(x)</code>; <code>a + b</code> → <code>type(a).__add__(a, b)</code></li>
          <li>Looked up on the <b>type</b>, not the instance (instance <code>__len__</code> ignored)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Printing</div>
        <ul>
          <li><code>__repr__</code> — developers; unambiguous, ideally rebuilds the object</li>
          <li><code>__str__</code> — users; <code>print</code>, <code>str()</code>, f-strings</li>
          <li>str falls back to repr, not the reverse; containers show repr</li>
          <li>Write <code>__repr__</code> first; <code>{m!r}</code> in f-strings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Equality &amp; hashing</div>
        <ul>
          <li><code>__eq__</code> — <code>==</code> by value; default compares identity</li>
          <li>Defining <code>__eq__</code> sets <code>__hash__ = None</code> → unhashable</li>
          <li>Rule: <code>a == b</code> ⇒ <code>hash(a) == hash(b)</code>; hash the same fields</li>
          <li>⚠ Mutating an object inside a set or dict loses it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ordering</div>
        <ul>
          <li><code>__lt__</code> enough for <code>sorted</code>, <code>min</code>, <code>max</code></li>
          <li><code>a &gt; b</code> falls back to <code>b &lt; a</code>; <code>&lt;=</code> does not</li>
          <li><code>@total_ordering</code> — writes the rest from <code>__eq__</code> + one</li>
          <li>Different currencies → refuse to compare</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Arithmetic</div>
        <ul>
          <li><code>__add__ __sub__ __mul__ __neg__ __abs__ __bool__</code></li>
          <li>Return a NEW object; keep value types immutable</li>
          <li><code>NotImplemented</code> → Python tries <code>other.__radd__(self)</code>, then TypeError</li>
          <li><code>__radd__</code> handling 0 makes <code>sum()</code> work</li>
          <li>No <code>__iadd__</code> → <code>x += y</code> becomes <code>x = x + y</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Containers</div>
        <ul>
          <li><code>__len__</code> (also drives <code>bool</code>), <code>__getitem__</code> (index + slice)</li>
          <li><code>__contains__</code> for <code>in</code>; <code>__iter__</code> for <code>for</code> (a generator is easiest)</li>
          <li>Fallbacks: only <code>__getitem__</code> → iteration and <code>in</code> still work, slowly</li>
          <li><code>collections.abc.Sequence</code> fills in the rest from <code>__len__</code> + <code>__getitem__</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Call &amp; with</div>
        <ul>
          <li><code>__call__</code> — <code>obj(args)</code>; a function with settings and memory</li>
          <li>PyTorch <code>model(x)</code> is <code>__call__</code> → <code>forward</code></li>
          <li><code>__enter__</code> / <code>__exit__(exc_type, exc, tb)</code> — setup and guaranteed cleanup</li>
          <li><code>__exit__</code> returning True swallows the error; usually return False</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pd-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Data Model</span><span class="rm-sub">syntax → type(x).__op__(x)</span></div></div>
      <div class="rm-item rm-done" data-target="pd-repr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">__repr__ and __str__</span><span class="rm-sub">developer vs user text, fallback</span></div></div>
      <div class="rm-item rm-done" data-target="pd-eq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">__eq__ and __hash__</span><span class="rm-sub">value equality, hash contract</span></div></div>
      <div class="rm-item rm-done" data-target="pd-order"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Ordering</span><span class="rm-sub">__lt__, reflection, total_ordering</span></div></div>
      <div class="rm-item rm-done" data-target="pd-arith"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Arithmetic Operators</span><span class="rm-sub">__add__, __radd__, NotImplemented, +=</span></div></div>
      <div class="rm-item rm-done" data-target="pd-container"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Container Protocol</span><span class="rm-sub">__len__, __getitem__, __contains__, __iter__</span></div></div>
      <div class="rm-item rm-done" data-target="pd-call"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Callable Objects: __call__</span><span class="rm-sub">functions with state</span></div></div>
      <div class="rm-item rm-done" data-target="pd-with"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Context Managers: __enter__ and __exit__</span><span class="rm-sub">setup, rollback, suppression</span></div></div>
      <div class="rm-item rm-done" data-target="pd-example"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Worked Example: a Complete Money Class</span><span class="rm-sub">all hooks in one class</span></div></div>
      <div class="rm-item rm-done" data-target="pd-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">hash, NotImplemented, truthiness</span></div></div>
      <div class="rm-item rm-done" data-target="pd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">hook table, rules, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pd-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">repr, hash, operators, protocols</span></div></div>
    </div>
  </div>

  <h2 id="pd-model"><span class="num">01</span>The Data Model: How Syntax Becomes Method Calls</h2>
  <p>Operators, <code>print</code>, <code>len</code> and <code>for</code> work on a user-defined class only if it implements the matching special methods. A money type shows why you would want them: floats cannot represent most decimal amounts exactly.</p>
  <h3>Why a Money type: float rounding error</h3>
  <div class="fx" data-lang="py">print(0.1 + 0.2, 0.1 + 0.2 == 0.3)
balance = 0.0
for _ in range(10):                # ten cashback credits of 10 paise each
    balance += 0.10
print(balance, balance == 1.0)</div>
  <div class="fx" data-lang="text">0.30000000000000004 False
0.9999999999999999 False</div>
  <p>A float is stored in binary, and 0.1 has no exact binary form (like 1/3 has no exact decimal form). The tiny errors show up immediately: 0.1 + 0.2 is not 0.3, and ten cashback credits of 10 paise make 0.9999999999999999, not 1. For money that is unacceptable (see <a class="xref" data-note="py_values">Values &amp; Types</a> for how floats are stored). The standard fix is to store <strong>whole paise as an int</strong>, which is exact. So we make a <code>Money</code> type:</p>
  <div class="fx" data-lang="py">class Money:                       # a first try: data only, no dunder methods
    def __init__(self, paise, currency="INR"):
        self.paise = paise         # whole paise, an exact int
        self.currency = currency

a, b = Money(12000), Money(12000)  # two objects, both ₹120.00
print(a)
print(a == b)
for expr in ("a + b", "a &lt; b", "sum([a, b])", "len(a)"):
    try:
        eval(expr)
    except TypeError as e:
        print(f"{expr:12} -&gt; TypeError: {e}")</div>
  <div class="fx" data-lang="text">&lt;__main__.Money object at 0x7f5462c6b0e0&gt;
False
a + b        -&gt; TypeError: unsupported operand type(s) for +: 'Money' and 'Money'
a &lt; b        -&gt; TypeError: '&lt;' not supported between instances of 'Money' and 'Money'
sum([a, b])  -&gt; TypeError: unsupported operand type(s) for +: 'int' and 'Money'
len(a)       -&gt; TypeError: object of type 'Money' has no len()</div>
  <p>After the code. The data is right, but nothing else works. <code>print</code> shows the class name and a memory address. Two ₹120 objects are not <code>==</code>, because by default <code>==</code> asks "are these the same object?". <code>+</code>, <code>&lt;</code>, <code>sum</code> and <code>len</code> all raise TypeError. (<code>eval</code> just runs each expression written as text, so the loop can try four of them.) Python simply does not know what these operations mean for a Money.</p>
  <h3>Every piece of syntax is a method call</h3>
  <p>In plain words: Python's syntax is a thin layer over method calls with special names that start and end with two underscores, called <strong>dunder methods</strong> (also "magic" or "special" methods). <code>3 + 4</code> is really <code>int.__add__(3, 4)</code>. The set of these hooks, and the rules for using them, is called the <strong>Python data model</strong>. You already met <code>__init__</code>: it is the hook behind <code>Money(...)</code>.</p>
  <div class="fx" data-lang="py">print(3 + 4, int.__add__(3, 4), type(3).__add__(3, 4))
words = ["deposit", "withdraw"]
print(len(words), type(words).__len__(words))
print("withdraw" in words, type(words).__contains__(words, "withdraw"))
print(words[1], type(words).__getitem__(words, 1))</div>
  <div class="fx" data-lang="text">7 7 7
2 2
True True
withdraw withdraw</div>
  <p>Each pair of results is equal: the syntax on the left of every <code>print</code> is the method call on the right. Notice the form: <code>type(x).__len__(x)</code>, the same desugaring as <code>obj.method()</code> → <code>Class.method(obj)</code> in <a class="xref" data-note="py_classes">Classes &amp; Objects</a>.</p>
  <table class="tbl">
    <tr><th>You write</th><th>Python calls</th><th>You write</th><th>Python calls</th></tr>
    <tr><td><code>print(m)</code>, <code>str(m)</code></td><td><code>__str__</code></td><td><code>repr(m)</code>, the shell</td><td><code>__repr__</code></td></tr>
    <tr><td><code>a == b</code></td><td><code>__eq__</code></td><td><code>hash(a)</code>, set, dict key</td><td><code>__hash__</code></td></tr>
    <tr><td><code>a &lt; b</code></td><td><code>__lt__</code></td><td><code>a + b</code> / <code>b + a</code></td><td><code>__add__</code> / <code>__radd__</code></td></tr>
    <tr><td><code>a * 3</code> / <code>3 * a</code></td><td><code>__mul__</code> / <code>__rmul__</code></td><td><code>-a</code>, <code>abs(a)</code>, <code>bool(a)</code></td><td><code>__neg__</code>, <code>__abs__</code>, <code>__bool__</code></td></tr>
    <tr><td><code>len(s)</code></td><td><code>__len__</code></td><td><code>s[0]</code>, <code>s[1:]</code></td><td><code>__getitem__</code></td></tr>
    <tr><td><code>x in s</code></td><td><code>__contains__</code></td><td><code>for x in s</code></td><td><code>__iter__</code></td></tr>
    <tr><td><code>f(x)</code></td><td><code>__call__</code></td><td><code>with c:</code></td><td><code>__enter__</code> / <code>__exit__</code></td></tr>
  </table>
  <h3>Looked up on the type, not the object</h3>
  <p>One detail matters for everything that follows: Python looks dunder methods up on the object's <strong>class</strong>, skipping the object's own attributes.</p>
  <div class="fx" data-lang="py">class Statement:
    def __init__(self, rows):
        self.rows = rows
    def __len__(self):
        return len(self.rows)

s = Statement(["open", "deposit", "withdraw"])
print(len(s), type(s).__len__(s))
s.__len__ = lambda: 99             # put a __len__ on the INSTANCE only
print(len(s), s.__len__())         # len() ignores it: it asks the TYPE</div>
  <div class="fx" data-lang="text">3 3
3 99</div>
  <p><code>len(s)</code> gave 3 both times. After a <code>__len__</code> was stuck on the instance, calling it directly gives 99, but <code>len(s)</code> still gives 3, because <code>len</code> runs <code>type(s).__len__(s)</code>. This is why dunder methods are always defined in the class body, and why it makes them fast: Python can find them without searching the instance.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>data model</strong> is Python's protocol of special methods (<code>__name__</code>) through which built-in syntax and functions operate on objects. For an operation on <code>x</code>, the interpreter calls the method found on <code>type(x)</code> (implicit special-method lookup bypasses the instance): <code>len(x)</code> ≡ <code>type(x).__len__(x)</code>. Implementing these methods is called <strong>operator overloading</strong> when it gives operators a meaning for a new type.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not call dunder methods yourself in normal code (<code>m.__add__(n)</code>): you skip the fallbacks Python adds (reflected operands, <code>NotImplemented</code> handling). Write <code>m + n</code>. And never invent your own <code>__names__</code>: that namespace is reserved for Python.</p></div>

  <h2 id="pd-repr"><span class="num">02</span>__repr__ and __str__</h2>
  <p>In plain words: Python has two text forms for every object. <code>__repr__</code> ("representation") is for developers: exact and unambiguous, ideally valid Python that rebuilds the object. <code>__str__</code> is for end users: friendly and readable. <code>print()</code>, <code>str()</code> and f-strings use <code>__str__</code>; <code>repr()</code>, the interactive shell, the debugger and <em>items inside lists and dicts</em> use <code>__repr__</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cheque. The words "One thousand two hundred fifty rupees" are for people (<code>__str__</code>); the MICR code line along the bottom is for the machine and must be exact (<code>__repr__</code>).</p></div>
  <p>The Money below stores paise (<code>Decimal</code> converts text like <code>"1250.5"</code> exactly, without going through a float). A helper <code>_text</code> turns 125050 paise into <code>"1,250.50"</code> using <code>divmod</code> (quotient and remainder by 100).</p>
  <div class="fx" data-lang="py">from decimal import Decimal

class Money:
    def __init__(self, rupees=0, currency="INR"):
        self.paise = int(Decimal(str(rupees)) * 100)   # "120.50" -&gt; 12050, exact
        self.currency = currency

    def _text(self):                                   # 12050 -&gt; "120.50"
        sign = "-" if self.paise &lt; 0 else ""
        rupees, paise = divmod(abs(self.paise), 100)
        return f"{sign}{rupees:,}.{paise:02d}"

    def __repr__(self):                                # for developers: unambiguous
        return f"Money('{self._text().replace(',', '')}', '{self.currency}')"

    def __str__(self):                                 # for users: friendly
        return f"₹{self._text()}" if self.currency == "INR" else f"{self._text()} {self.currency}"

m = Money("1250.5")
print(m)                       # print -&gt; str() -&gt; __str__
print(repr(m))                 # repr() -&gt; __repr__
print([m, Money(30)])          # containers show their items with repr
print(f"balance {m} | debug {m!r}")
print(Money(-30.5), Money(20, "USD"))</div>
  <div class="fx" data-lang="text">₹1,250.50
Money('1250.50', 'INR')
[Money('1250.50', 'INR'), Money('30.00', 'INR')]
balance ₹1,250.50 | debug Money('1250.50', 'INR')
₹-30.50 20.00 USD</div>
  <p>After the code. <code>print(m)</code> used <code>__str__</code>: <code>₹1,250.50</code>. <code>repr(m)</code> gave <code>Money('1250.50', 'INR')</code>, which you could paste into Python. Inside a list, Python used <code>__repr__</code> for each item, which is why debugging lists of objects needs a good repr. In an f-string, <code>{m}</code> uses str and <code>{m!r}</code> uses repr. Negative amounts and other currencies also print sensibly.</p>
  <div class="fx" data-lang="py">class OnlyRepr:
    def __repr__(self):
        return "OnlyRepr()"

class OnlyStr:
    def __str__(self):
        return "friendly text"

print(OnlyRepr(), str(OnlyRepr()))      # str() falls back to __repr__
print([OnlyStr()])                      # but repr() does NOT fall back to __str__</div>
  <div class="fx" data-lang="text">OnlyRepr() OnlyRepr()
[&lt;__main__.OnlyStr object at 0x7f5462c6bb60&gt;]</div>
  <p>The fallback runs one way only. A class with only <code>__repr__</code> prints fine everywhere, because <code>str()</code> falls back to <code>__repr__</code>. A class with only <code>__str__</code> still shows a memory address inside a list, because <code>repr()</code> never falls back to <code>__str__</code>. Hence the rule: always write <code>__repr__</code>; add <code>__str__</code> only when users need a different, friendlier text. (Dataclasses write a <code>__repr__</code> for you, as seen in <a class="xref" data-note="py_classes">Classes &amp; Objects</a>.)</p>
  <div class="callout def"><span class="label">Definition</span><p><code>object.__repr__(self)</code> returns the "official" string, used by <code>repr()</code> and container displays; by convention it looks like a valid expression recreating the object. <code>object.__str__(self)</code> returns the "informal" string, used by <code>str()</code>, <code>print()</code> and <code>format()</code>; its default calls <code>__repr__</code>. (<code>__format__</code> additionally handles format specs like <code>f"{m:&gt;10}"</code>.)</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Both must return a <code>str</code>; returning anything else raises TypeError when Python calls them. And keep <code>__repr__</code> free of side effects and cheap: debuggers and loggers call it often, sometimes on half-built objects.</p></div>

  <h2 id="pd-eq"><span class="num">03</span>Equality and Hashing: __eq__ and __hash__</h2>
  <p>In plain words: <code>__eq__</code> decides what <code>==</code> means. Without it, <code>==</code> falls back to <code>is</code> (same object). A value type such as Money should compare by value: same paise and same currency. If the other object is not a Money, return <code>NotImplemented</code>, a special value meaning "I don't know how to compare with that; ask the other side".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two ₹500 notes with different serial numbers. As objects they are different notes (<code>is</code> is False); as money they are equal (<code>==</code> is True).</p></div>
  <p>To avoid retyping the whole class, each section below <em>extends</em> the previous Money with <code>class Money(Money)</code> (inheritance; see <a class="xref" data-note="py_inheritance">Inheritance</a>). The worked example at the end has the finished class in one place.</p>
  <div class="fx" data-lang="py">class Money(Money):                     # extend the Money above with ==
    def __eq__(self, other):
        if not isinstance(other, Money):
            return NotImplemented       # "I don't know how to compare with that"
        return (self.paise, self.currency) == (other.paise, other.currency)

a, b = Money("120"), Money("120.00")
print(a == b, a is b, a != Money(50))
print(a == 120, Money(10, "USD") == Money(10))
print(Money.__hash__)
try:
    {a}
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">True False True
False False
None
TypeError: unhashable type: 'Money'</div>
  <p>After the code. ₹120 equals ₹120.00 by value, and they are still two objects (<code>is</code> False). <code>!=</code> works too: Python derives it from <code>__eq__</code>. <code>a == 120</code> is False: our <code>__eq__</code> returned NotImplemented, <code>int</code> also said NotImplemented, so Python fell back to identity. Different currencies are not equal. Then the surprise: <code>Money.__hash__</code> is <code>None</code>, and putting a Money in a set raises "unhashable type".</p>
  <h3>Why defining __eq__ removes hashing</h3>
  <p>A set or dict finds an item in two steps: first it computes <code>hash(x)</code>, a number that picks a bucket; then it uses <code>==</code> to compare with the few items in that bucket. This only works if <strong>equal objects always have equal hashes</strong>. The default hash comes from the object's identity, so two equal Money objects would get different hashes and land in different buckets. To stop that silent bug, Python sets <code>__hash__ = None</code> as soon as a class defines <code>__eq__</code>. Here is what would happen if it didn't:</p>
  <div class="fx" data-lang="py">class BadMoney:                         # equal by value, but keeps the identity hash
    def __init__(self, paise):
        self.paise = paise
    def __eq__(self, other):
        return self.paise == other.paise
    __hash__ = object.__hash__          # forcing the default back: a bad idea

x, y = BadMoney(12000), BadMoney(12000)
print(x == y, hash(x) == hash(y))
print(len({x, y}))                      # two "equal" items in one set!</div>
  <div class="fx" data-lang="text">True False
2</div>
  <p><code>x == y</code> is True, but their hashes differ, so the set never compares them and keeps both: a set with two "equal" items, exactly the bug Python's rule prevents. The fix is a <code>__hash__</code> built from the same fields <code>__eq__</code> compares:</p>
  <div class="fx" data-lang="py">class Money(Money):
    def __hash__(self):                 # equal Money -&gt; equal hash
        return hash((self.paise, self.currency))

a, b = Money("120"), Money("120.00")
print(hash(a) == hash(b), len({a, b, Money(50)}))
notes = {Money(500): 2, Money(100): 3}  # Money as dict keys
print(notes[Money("500.00")])</div>
  <div class="fx" data-lang="text">True 2
2</div>
  <p>Equal amounts now hash equally; the set holds 2 distinct amounts (₹120 and ₹50), and <code>Money("500.00")</code> finds the key <code>Money(500)</code> in the notes dict.</p>
  <h3>Hashable objects must not change</h3>
  <div class="fx" data-lang="py">wallet = {a}
a.paise = 99                            # mutate an object that is inside a set
print(a in wallet, Money("0.99") in wallet, wallet)</div>
  <div class="fx" data-lang="text">False False {Money('0.99', 'INR')}</div>
  <p>After changing <code>a.paise</code> while <code>a</code> sat inside a set, the set can no longer find it: it looks in the bucket for the new hash, while the object sits in the bucket of the old hash. Even an object equal to its new value is not found. Rule: only objects whose compared fields never change should be hashable. Money's arithmetic methods (next sections) always return new objects and never changes <code>paise</code>, so Money is used as an immutable value; a <code>@dataclass(frozen=True)</code> enforces that automatically.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>__eq__(self, other)</code> implements <code>==</code> (and, inverted, <code>!=</code>); return <code>NotImplemented</code> for unsupported types. <code>__hash__(self)</code> returns an int used by sets and dicts. Contract: <code>a == b</code> ⇒ <code>hash(a) == hash(b)</code>, and the hash must not change while the object is in a container. A class that defines <code>__eq__</code> without <code>__hash__</code> gets <code>__hash__ = None</code> (unhashable).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Never hash a field that <code>__eq__</code> ignores, and never make a mutable object hashable by value. The usual safe recipe is <code>hash(tuple of the compared fields)</code> on an immutable object.</p></div>

  <h2 id="pd-order"><span class="num">04</span>Ordering: __lt__ and functools.total_ordering</h2>
  <p>In plain words: <code>__lt__</code> ("less than") implements <code>&lt;</code>. <code>sorted</code>, <code>min</code> and <code>max</code> only ever use <code>&lt;</code>, so it alone is enough for them. Comparing ₹ with $ makes no sense, so that raises an error; comparing with a non-Money returns <code>NotImplemented</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Arranging people by height needs only one question, "is A shorter than B?". Everything else ("taller", "at least as tall") can be worked out from that question and "same height".</p></div>
  <div class="fx" data-lang="py">class Money(Money):
    def __lt__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        if self.currency != other.currency:
            raise ValueError(f"cannot compare {self.currency} with {other.currency}")
        return self.paise &lt; other.paise

bills = [Money(120), Money(30), Money("50.5")]
print(sorted(bills), max(bills))
print(Money(30) &lt; Money(50), Money(50) &gt; Money(30))   # &gt; works: Python tries 30 &lt; 50
try:
    Money(30) &lt;= Money(50)
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">[Money('30.00', 'INR'), Money('50.50', 'INR'), Money('120.00', 'INR')] ₹120.00
True True
TypeError: '&lt;=' not supported between instances of 'Money' and 'Money'</div>
  <p>After the code. Sorting and <code>max</code> worked with just <code>__lt__</code>. <code>Money(50) &gt; Money(30)</code> also worked, although we never wrote <code>__gt__</code>: Python first tries <code>a.__gt__(b)</code>, gets NotImplemented, then tries the <em>reflected</em> <code>b.__lt__(a)</code>, i.e. 30 &lt; 50. But <code>&lt;=</code> has no reflection that our class supports (its mirror is <code>&gt;=</code>), so it fails. The standard library fills the gap:</p>
  <div class="fx" data-lang="py">from functools import total_ordering

@total_ordering                         # writes &lt;=, &gt;, &gt;= from __lt__ and __eq__
class Money(Money):
    pass

print(Money(30) &lt;= Money(50), Money(50) &gt;= Money(50), Money(30) &gt; Money(50))
try:
    Money(10, "USD") &lt; Money(10)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">True True False
ValueError: cannot compare USD with INR</div>
  <p><code>@functools.total_ordering</code> took our <code>__lt__</code> and <code>__eq__</code> and wrote <code>__le__</code>, <code>__gt__</code> and <code>__ge__</code> (for example <code>a &lt;= b</code> as <code>a &lt; b or a == b</code>). All three now answer correctly, and the currency check still protects us.</p>
  <div class="callout def"><span class="label">Definition</span><p>The rich comparison methods <code>__lt__</code>, <code>__le__</code>, <code>__gt__</code>, <code>__ge__</code> implement <code>&lt; &lt;= &gt; &gt;=</code>. Reflection pairs: <code>&lt;</code>/<code>&gt;</code> and <code>&lt;=</code>/<code>&gt;=</code>. <code>functools.total_ordering</code> derives the missing ones from <code>__eq__</code> plus one of them. <code>@dataclass(order=True)</code> generates all four by comparing fields as tuples.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Ordering must be consistent with equality: if neither <code>a &lt; b</code> nor <code>b &lt; a</code>, then <code>a == b</code> should be True, or sorting gives odd results. Money compares only paise for order, and paise plus currency for equality, which is why cross-currency ordering is refused rather than guessed.</p></div>

  <h2 id="pd-arith"><span class="num">05</span>Arithmetic Operators: __add__, __radd__ and NotImplemented</h2>
  <p>In plain words: <code>a + b</code> calls <code>a.__add__(b)</code>; <code>a - b</code> calls <code>__sub__</code>; <code>a * 3</code> calls <code>__mul__</code>. Each should return a <strong>new</strong> Money and leave both operands unchanged, the way <code>3 + 4</code> does not change 3. When <code>a</code> doesn't know how to handle <code>b</code>, it returns <code>NotImplemented</code>, and Python gives <code>b</code> a turn with its <strong>reflected</strong> method: <code>b.__radd__(a)</code>. That second chance is what makes <code>3 * m</code> and <code>sum()</code> work.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A shop that takes payment in two currencies. The first cashier says "I only handle rupees" (<code>NotImplemented</code>), so the customer goes to the second counter (<code>__radd__</code>). Only if both counters refuse is the customer turned away (<code>TypeError</code>).</p></div>
  <div class="fx" data-lang="py">@total_ordering
class Money(Money):
    @classmethod
    def _from_paise(cls, paise, currency):
        m = cls(0, currency)
        m.paise = paise
        return m

    def _check(self, other):
        if self.currency != other.currency:
            raise ValueError(f"cannot mix {self.currency} and {other.currency}")

    def __add__(self, other):                       # self + other
        if not isinstance(other, Money):
            return NotImplemented
        self._check(other)
        return Money._from_paise(self.paise + other.paise, self.currency)   # a NEW object

    def __sub__(self, other):                       # self - other
        if not isinstance(other, Money):
            return NotImplemented
        self._check(other)
        return Money._from_paise(self.paise - other.paise, self.currency)

    def __mul__(self, k):                           # self * number
        if not isinstance(k, (int, float, Decimal)):
            return NotImplemented
        return Money._from_paise(round(self.paise * k), self.currency)

    __rmul__ = __mul__                              # number * self

    def __radd__(self, other):                      # other + self, when other gave up
        if other == 0:                              # sum() starts from 0
            return self
        return NotImplemented

    def __neg__(self):
        return Money._from_paise(-self.paise, self.currency)

    def __abs__(self):
        return Money._from_paise(abs(self.paise), self.currency)

    def __bool__(self):                             # Money(0) is "empty"
        return self.paise != 0

print(Money("0.1") + Money("0.2"), Money("0.1") + Money("0.2") == Money("0.3"))
cashback = [Money("0.10")] * 10
print(sum(cashback), sum(cashback) == Money(1))
asha = Money(100) + Money(50) - Money(30)
print(asha, asha * 0.01, 3 * Money(10), -Money(30), abs(Money(-40)))
print(bool(Money(0)), bool(asha))</div>
  <div class="fx" data-lang="text">₹0.30 True
₹1.00 True
₹120.00 ₹1.20 ₹30.00 ₹-30.00 ₹40.00
False True</div>
  <p>After the code, line by line. ₹0.10 + ₹0.20 is exactly ₹0.30 and equals it: the float problem from the start is gone, because 10 + 20 paise is integer arithmetic. Ten ₹0.10 credits sum to exactly ₹1.00. Asha's 100 + 50 − 30 is ₹120.00; 1% interest is ₹1.20; <code>3 * Money(10)</code> worked through <code>__rmul__</code>; <code>-</code> and <code>abs</code> work; ₹0 is falsy, ₹120 is truthy.</p>
  <h3>The NotImplemented hand-off, traced</h3>
  <table class="tbl">
    <tr><th>Expression</th><th>1st try</th><th>2nd try (reflected)</th><th>Result</th></tr>
    <tr><td><code>Money(10) + Money(20)</code></td><td><code>Money.__add__</code> → ₹30</td><td>(not needed)</td><td>₹30.00</td></tr>
    <tr><td><code>3 * Money(10)</code></td><td><code>int.__mul__(3, m)</code> → NotImplemented</td><td><code>Money.__rmul__(m, 3)</code> → ₹30</td><td>₹30.00</td></tr>
    <tr><td><code>sum([m1, m2])</code> = <code>0 + m1 + m2</code></td><td><code>int.__add__(0, m1)</code> → NotImplemented</td><td><code>m1.__radd__(0)</code> → m1 (0 is "nothing")</td><td>then <code>m1 + m2</code> normally</td></tr>
    <tr><td><code>Money(10) + 5</code></td><td><code>Money.__add__</code> → NotImplemented</td><td><code>int.__radd__(5, m)</code> → NotImplemented</td><td>TypeError</td></tr>
  </table>
  <p>The third row explains why <code>sum()</code> needs <code>__radd__</code>: it starts from the integer 0, and <code>0 + Money</code> must be handled by Money's reflected method. The last row is a clean failure:</p>
  <div class="fx" data-lang="py">for expr in ("Money(10) + 5", "Money(10, 'USD') + Money(10)"):
    try:
        eval(expr)
    except (TypeError, ValueError) as e:
        print(f"{expr:28} -&gt; {type(e).__name__}: {e}")</div>
  <div class="fx" data-lang="text">Money(10) + 5                -&gt; TypeError: unsupported operand type(s) for +: 'Money' and 'int'
Money(10, 'USD') + Money(10) -&gt; ValueError: cannot mix USD and INR</div>
  <p>Adding a plain number is refused with Python's own clear TypeError (we returned NotImplemented and let Python finish), while adding dollars to rupees is a value problem, so we raise ValueError ourselves.</p>
  <h3>What += does without __iadd__</h3>
  <div class="fx" data-lang="py">balance = Money(120)
before = id(balance)
balance += Money(50)                   # no __iadd__: Python runs balance = balance + Money(50)
print(balance, id(balance) == before)</div>
  <div class="fx" data-lang="text">₹170.00 False</div>
  <p>The balance became ₹170.00, and <code>id</code> changed: since Money has no <code>__iadd__</code> (in-place add), Python ran <code>balance = balance + Money(50)</code>, building a new object and rebinding the name. For an immutable value type that is exactly right. Lists do define <code>__iadd__</code>, which is why <code>lst += [x]</code> changes the list in place (see <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>).</p>
  <div class="callout def"><span class="label">Definition</span><p>Binary operator <code>a op b</code>: Python calls <code>type(a).__op__(a, b)</code>; if that is missing or returns <code>NotImplemented</code>, it calls <code>type(b).__rop__(b, a)</code> (tried first if <code>b</code>'s type is a subclass of <code>a</code>'s); if both fail, <code>TypeError</code>. Augmented <code>a op= b</code> tries <code>__iop__</code>, then falls back to <code>a = a op b</code>. Unary: <code>__neg__</code>, <code>__pos__</code>, <code>__abs__</code>; truth: <code>__bool__</code> (else <code>__len__</code>, else always True).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Return <code>NotImplemented</code>, do not <code>raise NotImplementedError</code> and do not return <code>None</code>: raising blocks the reflected try, and <code>None</code> would be taken as the actual result. And do not let <code>__add__</code> change <code>self</code>: a value that changes under you breaks hashing and surprises every other name pointing at it.</p></div>

  <h2 id="pd-container"><span class="num">06</span>Container Protocol: __len__, __getitem__, __contains__, __iter__</h2>
  <p>In plain words: four hooks make a container. <code>__len__</code> answers <code>len(st)</code> (and <code>bool(st)</code> when there is no <code>__bool__</code>). <code>__getitem__</code> answers <code>st[i]</code>, and receives a <code>slice</code> object for <code>st[1:]</code>. <code>__contains__</code> answers <code>x in st</code>. <code>__iter__</code> answers <code>for t in st</code> by returning an iterator.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A passbook. You can ask how many lines it has, read line 3, read lines 2 onwards, ask "is there any withdrawal?", and read it line by line, but you cannot tear lines out. You choose which questions the passbook answers.</p></div>
  <h3>The old fallback: __getitem__ alone</h3>
  <p>Before writing all four, see how far one goes. This class has only <code>__getitem__</code>, and prints every call:</p>
  <div class="fx" data-lang="py">class OldStatement:
    def __init__(self, rows):
        self._rows = rows
    def __getitem__(self, i):
        print(f"  __getitem__({i})")
        return self._rows[i]           # raises IndexError past the end

st = OldStatement(["open", "deposit", "withdraw"])
print("for loop:")
for row in st:
    print("  got", row)
print("'deposit' in st:", "deposit" in st)</div>
  <div class="fx" data-lang="text">for loop:
  __getitem__(0)
  got open
  __getitem__(1)
  got deposit
  __getitem__(2)
  got withdraw
  __getitem__(3)
  __getitem__(0)
  __getitem__(1)
'deposit' in st: True</div>
  <p>The <code>for</code> loop worked: with no <code>__iter__</code>, Python called <code>__getitem__(0)</code>, <code>(1)</code>, <code>(2)</code>, and stopped when <code>(3)</code> raised IndexError. <code>in</code> worked the same way, scanning from 0 until it found "deposit" at index 1. Handy, but slow and implicit; the full protocol is clearer.</p>
  <h3>The full Statement</h3>
  <p>Each row is a frozen <code>Transaction</code> dataclass (from <a class="xref" data-note="py_classes">Classes &amp; Objects</a>) holding a Money. <code>__iter__</code> is written as a <strong>generator</strong>, a function with <code>yield</code> that produces items one at a time; <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> explains exactly how. <code>__contains__</code> is given our own meaning: "is there a transaction of this kind?".</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass

@dataclass(frozen=True)
class Transaction:
    kind: str
    amount: Money

    def signed(self):
        return -self.amount if self.kind == "withdraw" else self.amount

class Statement:
    def __init__(self, owner, rows=()):
        self.owner = owner
        self._rows = list(rows)

    def add(self, kind, rupees):
        self._rows.append(Transaction(kind, Money(rupees)))

    def __len__(self):                          # len(st), and bool(st) when no __bool__
        return len(self._rows)

    def __getitem__(self, i):                   # st[0], st[-1], st[1:]
        if isinstance(i, slice):
            return Statement(self.owner, self._rows[i])   # a slice is a Statement too
        return self._rows[i]

    def __contains__(self, kind):               # "withdraw" in st
        return any(t.kind == kind for t in self._rows)

    def __iter__(self):                         # for t in st  (a generator: see Iterators)
        for t in self._rows:
            yield t

    def __repr__(self):
        return f"Statement({self.owner!r}, {len(self)} rows)"

    def balance(self):
        return sum(t.signed() for t in self)    # sum() works thanks to __radd__

st = Statement("Asha")
st.add("open", 100); st.add("deposit", 50); st.add("withdraw", 30)
print(st, len(st), bool(st), bool(Statement("Ben")))
print(st[0])
print(st[-1].kind, st[-1].amount)
print(st[1:], [t.kind for t in st[1:]])
print("withdraw" in st, "interest" in st)
for t in st:
    print(f"  {t.kind:9} {str(t.signed()):&gt;9}")
print("balance:", st.balance())
print(list(reversed(st))[0].kind)          # reversed() uses __len__ + __getitem__</div>
  <div class="fx" data-lang="text">Statement('Asha', 3 rows) 3 True False
Transaction(kind='open', amount=Money('100.00', 'INR'))
withdraw ₹30.00
Statement('Asha', 2 rows) ['deposit', 'withdraw']
True False
  open        ₹100.00
  deposit      ₹50.00
  withdraw    ₹-30.00
balance: ₹120.00
withdraw</div>
  <p>After the code. <code>len</code> is 3, a non-empty statement is truthy and Ben's empty one falsy (via <code>__len__</code>). <code>st[0]</code> is the opening transaction, <code>st[-1]</code> the withdrawal (negative indexes work because we pass the index to the inner list). <code>st[1:]</code> is a new two-row Statement, not a bare list, because <code>__getitem__</code> checks for a slice. <code>"withdraw" in st</code> is True, <code>"interest" in st</code> False. The <code>for</code> loop used <code>__iter__</code>, and the balance, <code>sum</code> of signed amounts, is ₹120.00. <code>reversed()</code> worked from <code>__len__</code> and <code>__getitem__</code> alone.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>sequence/container protocol</strong>: <code>__len__</code> (non-negative int), <code>__getitem__(key)</code> (int or <code>slice</code>; raise <code>IndexError</code>/<code>KeyError</code> when missing), <code>__contains__(item)</code> (else Python iterates), <code>__iter__</code> (returns an iterator; else Python falls back to <code>__getitem__</code> from 0), <code>__reversed__</code> (else <code>__len__</code> + <code>__getitem__</code>). <code>collections.abc.Sequence</code> provides most of these from <code>__len__</code> and <code>__getitem__</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>__len__</code> also decides truthiness: a container with 0 items is falsy, so <code>if st:</code> means "is it non-empty?", not "does it exist?". Test <code>if st is not None:</code> when that is what you mean. And <code>__getitem__</code> must raise <code>IndexError</code> at the end, or the fallback loop never stops.</p></div>

  <h2 id="pd-call"><span class="num">07</span>Callable Objects: __call__</h2>
  <p>In plain words: if a class defines <code>__call__</code>, its objects can be called with parentheses like functions: <code>obj(x)</code> runs <code>type(obj).__call__(obj, x)</code>. The object keeps attributes between calls, so it is "a function with memory and settings".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A toll booth. You hand it a vehicle and get a charge back, like a function. But the booth also has a price list (settings) and a counter of vehicles passed today (state).</p></div>
  <div class="fx" data-lang="py">class OverdraftFee:
    def __init__(self, fee):
        self.fee = Money(fee)
        self.times_charged = 0                  # state that lives between calls

    def __call__(self, balance):                # fee_rule(balance)
        if balance &lt; Money(0):
            self.times_charged += 1
            return self.fee
        return Money(0)

fee_rule = OverdraftFee(10)
print(callable(fee_rule), callable(Money(1)))
for bal in (Money(50), Money(-30), Money(-40)):
    print(f"balance {str(bal):&gt;8} -&gt; fee {fee_rule(bal)}")
print("charged", fee_rule.times_charged, "times")</div>
  <div class="fx" data-lang="text">True False
balance   ₹50.00 -&gt; fee ₹0.00
balance  ₹-30.00 -&gt; fee ₹10.00
balance  ₹-40.00 -&gt; fee ₹10.00
charged 2 times</div>
  <p>After the code. <code>callable(fee_rule)</code> is True and a Money is not callable. ₹50 owes no fee; ₹−30 and ₹−40 each owe ₹10 (the comparison uses Money's <code>__lt__</code>), and the rule remembers it charged 2 times. A closure (an inner function remembering outer variables, see <a class="xref" data-note="py_functions">Functions</a>) can do the same; a class with <code>__call__</code> is the better choice when there are several settings, several methods, or the state should be inspected from outside. Classes with <code>__call__</code> are also how class-based <a class="xref" data-note="py_decorators">decorators</a> work, and why a PyTorch model is used as <code>model(x)</code>: <code>nn.Module.__call__</code> runs hooks and then your <code>forward</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>__call__(self, *args, **kwargs)</code> makes instances callable: <code>obj(args)</code> ≡ <code>type(obj).__call__(obj, args)</code>. <code>callable(x)</code> reports whether <code>x</code> can be called. Functions, classes (calling a class runs <code>type.__call__</code>, which runs <code>__new__</code> and <code>__init__</code>) and bound methods are all callables.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not turn every object into a callable. If an object has one obvious action and you want to pass it where functions are expected, <code>__call__</code> is natural. If it has several actions, named methods (<code>rule.fee(balance)</code>) read better.</p></div>

  <h2 id="pd-with"><span class="num">08</span>Context Managers: __enter__ and __exit__</h2>
  <p>In plain words: the <code>with</code> statement works with any object that has two dunder methods. <code>with obj:</code> calls <code>obj.__enter__()</code> before the block, and <code>obj.__exit__(exc_type, exc, tb)</code> after it, <em>always</em>, whether the block finished normally or raised. If it raised, the three arguments describe the exception; otherwise they are all <code>None</code>. If <code>__exit__</code> returns True the exception is swallowed; returning False (or None) lets it continue.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank's double-entry ledger with a supervisor. Before the transfer the supervisor photographs both balances (<code>__enter__</code>). Afterwards she either signs off (<code>__exit__</code>, no error) or, if anything went wrong, restores both balances from the photo (<code>__exit__</code>, with error).</p></div>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, rupees):
        self.owner, self.balance = owner, Money(rupees)
    def deposit(self, m):
        self.balance = self.balance + m
    def withdraw(self, m):
        if m &gt; self.balance:
            raise ValueError(f"{self.owner}: insufficient funds")
        self.balance = self.balance - m

class Atomic:
    """with Atomic(a, b): ...  -&gt; all changes happen, or none."""
    def __init__(self, *accounts):
        self.accounts = accounts
    def __enter__(self):
        self.saved = [acc.balance for acc in self.accounts]     # snapshot
        print("  enter: saved", [str(m) for m in self.saved])
        return self
    def __exit__(self, exc_type, exc, tb):
        if exc_type is not None:                                 # the block raised
            for acc, m in zip(self.accounts, self.saved):
                acc.balance = m                                  # roll back
            print(f"  exit: rolled back after {exc_type.__name__}: {exc}")
        else:
            print("  exit: committed")
        return False                                             # do not hide the error

asha, ben = Account("Asha", 120), Account("Ben", 50)
for amount in (Money(100), Money(200)):
    print(f"Asha pays Ben {amount}:")
    try:
        with Atomic(asha, ben):
            ben.deposit(amount)                 # step 1 succeeds
            asha.withdraw(amount)               # step 2 may fail
    except ValueError:
        pass
    print(f"  Asha {asha.balance}, Ben {ben.balance}")</div>
  <div class="fx" data-lang="text">Asha pays Ben ₹100.00:
  enter: saved ['₹120.00', '₹50.00']
  exit: committed
  Asha ₹20.00, Ben ₹150.00
Asha pays Ben ₹200.00:
  enter: saved ['₹20.00', '₹150.00']
  exit: rolled back after ValueError: Asha: insufficient funds
  Asha ₹20.00, Ben ₹150.00</div>
  <p>After the code. First transfer, ₹100: enter saved ₹120 and ₹50, both steps ran, exit committed: Asha ₹20, Ben ₹150. Second transfer, ₹200: Ben's deposit went through (his balance was briefly ₹350), then Asha's withdrawal raised. <code>__exit__</code> received the ValueError, restored both saved balances, and returned False, so the error still reached the caller's <code>except</code>. Final balances are exactly as before the failed transfer: all or nothing. The same pair of hooks is behind <code>with open(...)</code> (close the file), locks (release) and database transactions (commit or roll back). <a class="xref" data-note="py_context">Context Managers</a> covers them fully, including writing one in three lines with <code>contextlib.contextmanager</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>context manager</strong> implements <code>__enter__(self)</code> (its return value is bound by <code>with … as x</code>) and <code>__exit__(self, exc_type, exc_value, traceback)</code>, called on leaving the block for any reason. A true return value from <code>__exit__</code> suppresses the exception.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Returning True from <code>__exit__</code> "to be safe" hides every error in the block, including bugs. Return False unless suppressing a specific, expected exception is the whole point.</p></div>

  <h2 id="pd-example"><span class="num">09</span>Worked Example: a Complete Money Class</h2>
  <p>The finished value type in one place. The hooks are not independent: <code>__hash__</code> must agree with <code>__eq__</code>, <code>total_ordering</code> derives three comparisons from <code>__lt__</code> plus <code>__eq__</code>, <code>sum()</code> needs the reflected <code>__radd__</code>, and truthiness comes from <code>__bool__</code>. Returning <code>NotImplemented</code> is how two types negotiate which one handles an operator.</p>
  <div class="fx" data-lang="py">from decimal import Decimal
from functools import total_ordering

@total_ordering
class Money:
    def __init__(self, rupees=0, currency="INR"):
        self.paise, self.currency = int(Decimal(str(rupees)) * 100), currency
    @classmethod
    def _from_paise(cls, p, cur):
        m = cls(0, cur); m.paise = p; return m
    def __repr__(self): return f"Money('{self.paise / 100:.2f}', '{self.currency}')"
    def __str__(self):  return f"₹{self.paise / 100:,.2f}"
    def __eq__(self, o): return isinstance(o, Money) and (self.paise, self.currency) == (o.paise, o.currency)
    def __hash__(self):  return hash((self.paise, self.currency))
    def __lt__(self, o): return self.paise &lt; o.paise if isinstance(o, Money) else NotImplemented
    def __add__(self, o): return Money._from_paise(self.paise + o.paise, self.currency) if isinstance(o, Money) else NotImplemented
    def __radd__(self, o): return self if o == 0 else NotImplemented
    def __neg__(self): return Money._from_paise(-self.paise, self.currency)
    def __bool__(self): return self.paise != 0

asha_rows = [("open", Money(100)), ("deposit", Money(50)), ("withdraw", -Money(30))]
total = sum(m for _, m in asha_rows)                        # __radd__, __add__, __neg__
print(f"{total} | {total!r}")                               # __str__, __repr__
print(total == Money("120.00"), len({total, Money(120)}))   # __eq__, __hash__
print(sorted([Money(50), total, Money(30)]))                # __lt__ (+ total_ordering)
print(max(m for _, m in asha_rows) &gt;= Money(100), bool(Money(0)), bool(total))  # &gt;= from total_ordering, __bool__</div>
  <div class="fx" data-lang="text">₹120.00 | Money('120.00', 'INR')
True 1
[Money('30.00', 'INR'), Money('50.00', 'INR'), Money('120.00', 'INR')]
True False True</div>
  <p>Asha's three rows sum to ₹120.00 (<code>__radd__</code> for the starting 0, <code>__add__</code>, <code>__neg__</code> for the withdrawal), print two ways, equal ₹120.00 and collapse with it in a set, sort among other amounts, and <code>&gt;=</code> comes from <code>total_ordering</code>.</p>
  <h2 id="pd-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: <code>__eq__</code> without <code>__hash__</code></span><p>Symptom: "unhashable type" when the object goes into a set or dict. Fix: <code>__hash__</code> over the same fields, on an immutable object (or <code>@dataclass(frozen=True)</code>).</p></div>
  <div class="callout trap"><span class="label">Trap: raising instead of returning NotImplemented</span><p>Symptom: <code>3 * m</code> or <code>sum()</code> fails although <code>__rmul__</code>/<code>__radd__</code> exist elsewhere. Fix: <code>return NotImplemented</code> for unknown types.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>sum()</code> without <code>__radd__</code></span><p>Symptom: "unsupported operand type(s) for +: 'int' and 'Money'". Cause: <code>sum</code> starts at 0. Fix: <code>__radd__</code> that treats 0 as nothing, or <code>sum(items, Money(0))</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: only <code>__str__</code></span><p>Symptom: lists of your objects still print memory addresses. Fix: write <code>__repr__</code> (str falls back to it, not the other way).</p></div>
  <div class="callout trap"><span class="label">Trap: mutating a hashed object</span><p>Symptom: an object "disappears" from a set or dict after a change. Fix: keep hashable objects immutable; arithmetic returns new objects.</p></div>
  <div class="callout trap"><span class="label">Trap: dunder methods on the instance</span><p>Symptom: <code>obj.__len__ = …</code> has no effect on <code>len(obj)</code>. Cause: implicit lookup uses the type. Fix: define them in the class.</p></div>
  <div class="callout trap"><span class="label">Trap: surprising truthiness</span><p>Symptom: an empty Statement or ₹0 skips an <code>if</code>. Cause: <code>__len__</code>/<code>__bool__</code>. Fix: test <code>is not None</code> when you mean "exists".</p></div>
  <div class="callout trap"><span class="label">Trap: <code>__exit__</code> returning True</span><p>Symptom: errors inside <code>with</code> vanish silently. Fix: return False unless suppression is the explicit purpose.</p></div>

  <h2 id="pd-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The data model</h3>
  <ul>
    <li>Syntax calls special ("dunder") methods on the object's <b>type</b>: <code>len(x)</code> ≡ <code>type(x).__len__(x)</code>, <code>a + b</code> ≡ <code>type(a).__add__(a, b)</code>.</li>
    <li>Implicit lookup skips the instance: <code>obj.__len__ = …</code> does not affect <code>len(obj)</code>. Define dunders in the class body.</li>
    <li>Write <code>a + b</code>, not <code>a.__add__(b)</code>: calling directly skips the reflected fallback.</li>
  </ul>
  <table class="tbl">
    <tr><th>Syntax</th><th>Method</th><th>Syntax</th><th>Method</th></tr>
    <tr><td><code>repr(x)</code>, shell, containers</td><td><code>__repr__</code></td><td><code>str(x)</code>, <code>print</code>, f-string</td><td><code>__str__</code></td></tr>
    <tr><td><code>==</code>, <code>!=</code></td><td><code>__eq__</code> (<code>__ne__</code> derived)</td><td><code>hash(x)</code>, set, dict key</td><td><code>__hash__</code></td></tr>
    <tr><td><code>&lt; &lt;= &gt; &gt;=</code></td><td><code>__lt__ __le__ __gt__ __ge__</code></td><td><code>+ - *</code></td><td><code>__add__ __sub__ __mul__</code> (+ <code>__r*__</code>, <code>__i*__</code>)</td></tr>
    <tr><td><code>-x</code>, <code>abs(x)</code>, <code>bool(x)</code></td><td><code>__neg__ __abs__ __bool__</code></td><td><code>len(x)</code></td><td><code>__len__</code></td></tr>
    <tr><td><code>x[i]</code>, <code>x[a:b]</code></td><td><code>__getitem__</code> (int or <code>slice</code>)</td><td><code>v in x</code></td><td><code>__contains__</code></td></tr>
    <tr><td><code>for v in x</code></td><td><code>__iter__</code> (iterator: <code>__next__</code>)</td><td><code>x(args)</code></td><td><code>__call__</code></td></tr>
    <tr><td><code>with x:</code></td><td><code>__enter__</code> / <code>__exit__</code></td><td><code>C(args)</code></td><td><code>__new__</code> then <code>__init__</code></td></tr>
  </table>
  <h3>__repr__ and __str__</h3>
  <ul>
    <li><code>__repr__</code>: unambiguous, for developers, ideally <code>Money('1250.50', 'INR')</code>. <code>__str__</code>: friendly, for users.</li>
    <li><code>str()</code> falls back to <code>__repr__</code>; <code>repr()</code> never falls back to <code>__str__</code>. Containers show items with <code>repr</code>. Always write <code>__repr__</code>.</li>
    <li>f-strings: <code>{m}</code> → str, <code>{m!r}</code> → repr. Both must return <code>str</code>.</li>
  </ul>
  <h3>__eq__ and __hash__</h3>
  <ul>
    <li>Default <code>==</code> is identity. Return <code>NotImplemented</code> for unknown types; if both sides decline, <code>==</code> falls back to identity.</li>
    <li>Defining <code>__eq__</code> sets <code>__hash__ = None</code> (unhashable).</li>
    <li>Contract: <code>a == b</code> ⇒ <code>hash(a) == hash(b)</code>. Recipe: <code>hash((self.f1, self.f2))</code> over the fields <code>__eq__</code> compares.</li>
    <li>Hashable objects must not change their compared fields while in a set/dict, or they become unfindable. <code>@dataclass(frozen=True)</code> enforces it.</li>
  </ul>
  <h3>Ordering</h3>
  <ul>
    <li><code>sorted</code>, <code>min</code>, <code>max</code> need only <code>__lt__</code>.</li>
    <li>Reflection: <code>a &gt; b</code> tries <code>b &lt; a</code>; <code>a &lt;= b</code> tries <code>b &gt;= a</code>. So <code>__lt__</code> alone gives <code>&gt;</code> but not <code>&lt;=</code>.</li>
    <li><code>@functools.total_ordering</code> + <code>__eq__</code> + one comparison → all four. <code>@dataclass(order=True)</code> compares fields as a tuple.</li>
  </ul>
  <h3>Arithmetic</h3>
  <ul>
    <li><code>a + b</code>: <code>type(a).__add__(a, b)</code>; if missing or <code>NotImplemented</code> → <code>type(b).__radd__(b, a)</code>; both fail → <code>TypeError</code>. If <code>type(b)</code> is a subclass of <code>type(a)</code>, the reflected method is tried first.</li>
    <li>Return a new object; never mutate <code>self</code> in <code>__add__</code>.</li>
    <li><code>sum(xs)</code> starts at <code>0</code>: needs <code>__radd__</code> handling 0, or <code>sum(xs, Money(0))</code>.</li>
    <li><code>a += b</code>: <code>__iadd__</code> if defined (lists mutate in place), else <code>a = a + b</code> (new object, name rebound).</li>
    <li>Return <code>NotImplemented</code>; do not raise <code>NotImplementedError</code> or return <code>None</code>.</li>
    <li>Truthiness: <code>__bool__</code>, else <code>__len__() != 0</code>, else always True.</li>
  </ul>
  <h3>Container protocol</h3>
  <ul>
    <li><code>__len__</code> (non-negative int), <code>__getitem__</code> (int or <code>slice</code>; raise <code>IndexError</code>/<code>KeyError</code>), <code>__contains__</code>, <code>__iter__</code> (return an iterator; a generator is simplest).</li>
    <li>Fallbacks: no <code>__iter__</code> → iteration calls <code>__getitem__(0, 1, …)</code> until <code>IndexError</code>; no <code>__contains__</code> → <code>in</code> iterates; no <code>__reversed__</code> → <code>__len__</code> + <code>__getitem__</code>.</li>
    <li><code>collections.abc.Sequence</code> supplies <code>__contains__</code>, <code>__iter__</code>, <code>__reversed__</code>, <code>index</code>, <code>count</code> from <code>__len__</code> + <code>__getitem__</code>.</li>
    <li>Wrap a list (has-a) rather than subclass it, to expose only the operations you want.</li>
  </ul>
  <h3>__call__ and context managers</h3>
  <ul>
    <li><code>obj(x)</code> ≡ <code>type(obj).__call__(obj, x)</code>: a function with settings and state. <code>callable(x)</code>. PyTorch <code>model(x)</code> → <code>nn.Module.__call__</code> → <code>forward</code>.</li>
    <li><code>with cm as v:</code> → <code>v = cm.__enter__()</code>; on exit, always <code>cm.__exit__(exc_type, exc, tb)</code> (all <code>None</code> if no error).</li>
    <li><code>__exit__</code> returning a true value suppresses the exception; return <code>False</code> by default.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>__eq__</code> without <code>__hash__</code> → unhashable.</li>
    <li>Mutating an object inside a set or dict → it can no longer be found.</li>
    <li>Raising instead of returning <code>NotImplemented</code> blocks <code>__radd__</code>/<code>__rmul__</code>.</li>
    <li><code>sum()</code> without <code>__radd__</code> → <code>unsupported operand type(s) for +: 'int' and 'Money'</code>.</li>
    <li>Only <code>__str__</code> → lists still print memory addresses.</li>
    <li>Empty containers and zero values are falsy: test <code>is not None</code> when you mean "exists".</li>
    <li>Dunders assigned on an instance are ignored by syntax.</li>
  </ul>

  <h2 id="pd-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are dunder methods, and what is the Python data model?</summary><div class="qa-body">Dunder ("double underscore") methods such as <code>__len__</code>, <code>__add__</code> and <code>__iter__</code> are the hooks Python's syntax and built-ins call: <code>len(x)</code> runs <code>type(x).__len__(x)</code>. The data model is the documented set of these hooks and their rules. Implementing them lets your own classes work with operators, <code>print</code>, <code>for</code>, <code>with</code> and the standard library like built-in types.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>__str__</code> vs <code>__repr__</code>?</summary><div class="qa-body"><code>__repr__</code> is the unambiguous developer view, ideally an expression that recreates the object; it is used by <code>repr()</code>, the REPL, debuggers and for items inside containers. <code>__str__</code> is the readable user view, used by <code>print</code>, <code>str()</code> and f-strings. <code>str()</code> falls back to <code>__repr__</code> but not the reverse, so always define <code>__repr__</code> first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? A class defines only <code>__str__</code> returning <code>"friendly"</code>; <code>print(OnlyStr(), [OnlyStr()])</code></summary><div class="qa-body"><code>friendly [&lt;__main__.OnlyStr object at 0x…&gt;]</code>. <code>print</code> calls <code>str()</code> on the object, but a list displays its items with <code>repr()</code>, which does not fall back to <code>__str__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does defining <code>__eq__</code> make a class unhashable?</summary><div class="qa-body">Sets and dicts require that equal objects have equal hashes. The default hash is based on identity, so two value-equal objects would land in different buckets and both be stored. To prevent that silent bug, Python sets <code>__hash__ = None</code> when a class defines <code>__eq__</code> without <code>__hash__</code>. Define <code>__hash__</code> over the same fields (on an immutable object) or use <code>@dataclass(frozen=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes wrong if you mutate an object while it is in a set or used as a dict key?</summary><div class="qa-body">The container stored it in the bucket of its old hash. After the change, lookups compute the new hash and search the wrong bucket, so <code>obj in s</code> is False even though the object is still inside. That is why hashable objects should be immutable in the fields they compare and hash.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>NotImplemented</code> vs <code>NotImplementedError</code>?</summary><div class="qa-body"><code>NotImplemented</code> is a special value a binary dunder method <em>returns</em> to say "I don't support this operand type"; Python then tries the other operand's reflected method and raises <code>TypeError</code> only if both decline. <code>NotImplementedError</code> is an exception you <em>raise</em>, typically in a base-class method that subclasses must override. Raising it from <code>__add__</code> blocks the reflected fallback.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python evaluate <code>a + b</code> for user-defined types?</summary><div class="qa-body">It calls <code>type(a).__add__(a, b)</code>. If that method is missing or returns <code>NotImplemented</code>, it calls <code>type(b).__radd__(b, a)</code>. If that also fails, it raises <code>TypeError: unsupported operand type(s)</code>. Exception: if <code>type(b)</code> is a subclass of <code>type(a)</code> and overrides the reflected method, <code>b.__radd__</code> is tried first, so subclasses can take control.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>sum()</code> fail on objects that support <code>+</code>, and how do you fix it?</summary><div class="qa-body"><code>sum</code> starts from the integer 0, so its first step is <code>0 + obj</code>; <code>int.__add__</code> returns <code>NotImplemented</code> and, without <code>obj.__radd__</code>, Python raises <code>TypeError: unsupported operand type(s) for +: 'int' and 'Money'</code>. Fix: a <code>__radd__</code> that treats 0 as the identity, or pass a start value: <code>sum(items, Money(0))</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>a = [1]; b = a; a += [2]</code>; <code>t = (1,); u = t; t += (2,)</code>; <code>print(b, u, a is b, t is u)</code></summary><div class="qa-body"><code>[1, 2] (1,) True False</code>. Lists define <code>__iadd__</code>, which extends the list in place, so <code>b</code> (the same object) sees the change. Tuples have no <code>__iadd__</code>, so <code>t += (2,)</code> becomes <code>t = t + (2,)</code>, a new tuple bound to <code>t</code>; <code>u</code> still refers to the old one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>functools.total_ordering</code> do?</summary><div class="qa-body">Given <code>__eq__</code> and one of <code>__lt__</code>, <code>__le__</code>, <code>__gt__</code>, <code>__ge__</code>, it generates the other three. Without it, defining only <code>__lt__</code> still makes <code>&gt;</code> work (Python reflects <code>a &gt; b</code> to <code>b &lt; a</code>), but <code>&lt;=</code> and <code>&gt;=</code> raise <code>TypeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make a class iterable? What is the difference between an iterable and an iterator?</summary><div class="qa-body">Define <code>__iter__</code> returning an iterator; writing it as a generator (<code>yield</code>) is simplest. An <strong>iterable</strong> has <code>__iter__</code> and can produce fresh iterators (a list, a Statement). An <strong>iterator</strong> has <code>__next__</code> (raising <code>StopIteration</code> at the end) and an <code>__iter__</code> returning itself; it is consumed once. If only <code>__getitem__</code> exists, Python iterates by calling it with 0, 1, 2… until <code>IndexError</code>. See <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python decide whether an object is truthy?</summary><div class="qa-body">It calls <code>__bool__</code> if defined; otherwise <code>__len__</code>, treating 0 as False; otherwise the object is always True. So empty containers, <code>0</code>, <code>Money(0)</code> and an empty custom collection are falsy, which is why <code>if x:</code> is the wrong test when you mean <code>if x is not None:</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are dunder methods looked up on the type rather than the instance?</summary><div class="qa-body">The interpreter's implicit special-method lookup goes straight to <code>type(x)</code>, bypassing the instance dictionary. That keeps operators fast and consistent (every instance of a type behaves the same) and avoids ambiguity for classes, whose own <code>__repr__</code> attribute is meant for their instances. Consequence: <code>obj.__len__ = lambda: 99</code> has no effect on <code>len(obj)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__call__</code> used for?</summary><div class="qa-body">It makes instances callable: <code>obj(x)</code> runs <code>type(obj).__call__(obj, x)</code>. Use it for a function that carries configuration or state (a fee rule that counts charges, a stateful scorer), and for class-based decorators. PyTorch relies on it: <code>model(x)</code> calls <code>nn.Module.__call__</code>, which runs hooks and then your <code>forward</code>, which is why you should not call <code>forward</code> directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the arguments of <code>__exit__</code>, and what does its return value mean?</summary><div class="qa-body"><code>__exit__(self, exc_type, exc_value, traceback)</code>: all three are <code>None</code> if the block finished normally, otherwise they describe the exception. It runs on every exit from the block. Returning a true value suppresses the exception; returning <code>False</code> or <code>None</code> lets it propagate, which is almost always what you want. <code>__enter__</code>'s return value is what <code>as</code> binds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>__getattr__</code> vs <code>__getattribute__</code>?</summary><div class="qa-body"><code>__getattribute__</code> runs on every attribute access and implements normal lookup; overriding it is rare and easy to get into infinite recursion. <code>__getattr__</code> runs only when normal lookup fails, so it is the safe hook for defaults, proxies and lazy attributes. With <code>__getattr__</code> returning a default, <code>c.lr</code> still returns the real attribute and only a missing name such as <code>c.epochs</code> reaches the hook.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__del__</code> a destructor you can rely on for cleanup?</summary><div class="qa-body">No. In CPython it runs when the reference count reaches zero, but timing is not guaranteed in general (reference cycles, other interpreters, interpreter shutdown) and exceptions inside it are only printed as warnings. Release files, locks and connections deterministically with a context manager (<code>with</code>) or an explicit <code>close()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you overload operators, and when not?</summary><div class="qa-body">When the meaning is obvious and conventional for the type: arithmetic on money, vectors or matrices, <code>==</code> on value objects, <code>[]</code> on collections, as NumPy and pandas do. Avoid clever meanings such as <code>account &gt;&gt; other</code> for a transfer; a named method reads better. Keep operators side-effect free and return new objects for immutable types.</div></details>
</main>
`
});
