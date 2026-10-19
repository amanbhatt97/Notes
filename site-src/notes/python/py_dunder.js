// notes/python/py_dunder.js — Dunder Methods & the Data Model
Object.assign(TOPIC_CONTENT, {
  "py_dunder": `<main>
<h1>Dunder Methods &amp; the Data Model</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Dunder Methods &amp; the Data Model</span></div>
  <p class="lead">Why does <code>print</code> show a list nicely but your own object as <code>&lt;__main__.Money object at 0x…&gt;</code>? Why does <code>+</code> work on numbers and strings but not on your class? Because built-in syntax is a set of hooks, the double-underscore ("dunder") methods, and Python calls them on the object's <em>type</em>: <code>len(x)</code> runs <code>type(x).__len__(x)</code>. This note teaches them one need at a time on PocketBank, the running example of the group: a <code>Money</code> value type that stores exact paise and learns to print, compare, hash, sort and add (so <code>₹0.10 + ₹0.20 == ₹0.30</code>, which floats get wrong), a <code>Statement</code> container that supports <code>len</code>, indexing, slicing, <code>in</code> and <code>for</code>, a callable fee rule, and an all-or-nothing transfer with <code>with</code>. Every code block was run and its real output is shown under it.</p>

  <h2 id="pd-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
    <defs><marker id="pd-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="200" y="6" width="240" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="26" text-anchor="middle" font-size="12">Object-Oriented Python: the map</text>
    <line x1="320" y1="36" x2="115" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="36" x2="320" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="36" x2="525" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="15" y="66" width="200" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="115" y="85" text-anchor="middle" font-size="12">Classes &amp; Objects</text><text x="115" y="101" text-anchor="middle" class="tm" font-size="10">bundle + protect</text>
    <rect x="220" y="66" width="200" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="85" text-anchor="middle" font-size="12">Inheritance, Polymorphism</text><text x="320" y="101" text-anchor="middle" class="tm" font-size="10">reuse, many forms, design</text>
    <rect x="425" y="66" width="200" height="44" rx="6" class="fg sg" stroke-width="2.5"/><text x="525" y="85" text-anchor="middle" font-size="12" font-weight="700">Dunder Methods</text><text x="525" y="101" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE: act built-in</text>
    <line x1="215" y1="88" x2="218" y2="88" stroke="currentColor" marker-end="url(#pd-a0)"/>
    <line x1="420" y1="88" x2="423" y2="88" stroke="currentColor" marker-end="url(#pd-a0)"/>
    <path d="M525,110 Q420,165 300,150" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pd-a0)"/>
    <text x="230" y="146" text-anchor="middle" class="tm" font-size="11">→ Iterators, Context Managers</text>
  </svg><figcaption>The Object-Oriented Python group. You are on the green note, the last of the group. Its <code>__iter__</code> and <code>__enter__/__exit__</code> sections hand over to the Iterators and Context Managers notes.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_classes">Classes &amp; Objects</a> and <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a></b><span>PocketBank has accounts with protected balances, subclasses, polymorphic month-end, and composed policies. Left open: balances are floats (121.2, 123.62) that drift, objects print as memory addresses, and a statement is a bare list. Duck typing showed that Python cares about which methods an object has; here we learn which methods the language itself looks for.</span></li>
    <li><b>This note adds: the data model</b><span>The full list of hooks behind <code>print</code>, <code>==</code>, <code>hash</code>, <code>&lt;</code>, <code>+</code>, <code>sum</code>, <code>len</code>, <code>[]</code>, <code>in</code>, <code>for</code>, <code>()</code> and <code>with</code>, how Python finds them, and the rules each one must obey.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> and <a class="xref" data-note="py_context">Context Managers</a></b><span><code>__iter__</code> and <code>__next__</code> get a full note of their own, as do <code>__enter__</code>/<code>__exit__</code> and <code>contextlib</code>. <a class="xref" data-note="py_decorators">Decorators</a> builds on <code>__call__</code>, and <a class="xref" data-note="py_testing">Testing</a> relies on good <code>__repr__</code> and <code>__eq__</code> for readable assertions.</span></li>
  </ol>

  <h2 id="pd-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next one. Numbers come from PocketBank: Asha opens with ₹100, deposits 50, withdraws 30 (₹120.00); ten cashback credits of ₹0.10 should make exactly ₹1.00.</p>
  <ol class="story">
    <li><b>The data model</b><span>Q: why can't our objects use <code>+</code>, <code>==</code>, <code>len</code>, <code>print</code> properly? → Each piece of syntax calls a dunder method on the object's type: <code>len(x)</code> → <code>type(x).__len__(x)</code>. A plain <code>Money</code> class has none, so <code>a + b</code>, <code>a &lt; b</code>, <code>sum</code> and <code>len</code> all raise TypeError. First thing to fix: it prints as a memory address…</span></li>
    <li><b>__repr__ and __str__</b><span>Q: how should money print? → <code>__str__</code> for users (<code>₹1,250.50</code>), <code>__repr__</code> for developers (<code>Money('1250.50', 'INR')</code>). But two Money objects of ₹120 are still not <code>==</code>…</span></li>
    <li><b>__eq__ and __hash__</b><span>Q: when are two amounts equal, and can they be set members or dict keys? → <code>__eq__</code> compares paise and currency; defining it removes hashing (<code>__hash__</code> becomes None) until we write a matching <code>__hash__</code>. But we still can't sort a list of bills…</span></li>
    <li><b>Ordering</b><span>Q: which amount is smaller? → <code>__lt__</code> makes <code>sorted</code> and <code>max</code> work; <code>@functools.total_ordering</code> writes <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>. But we still can't add a deposit to a balance…</span></li>
    <li><b>Arithmetic</b><span>Q: how do we add, subtract and scale money exactly? → <code>__add__</code>, <code>__sub__</code>, <code>__mul__</code>, and the reflected <code>__radd__</code>/<code>__rmul__</code> so <code>sum()</code> and <code>3 * m</code> work; <code>NotImplemented</code> passes control to the other operand. ₹0.10 + ₹0.20 == ₹0.30 is True. But a statement of many transactions is still a bare list…</span></li>
    <li><b>Container protocol</b><span>Q: can a Statement work with <code>len</code>, <code>[]</code>, slices, <code>in</code> and <code>for</code>? → <code>__len__</code>, <code>__getitem__</code>, <code>__contains__</code>, <code>__iter__</code>: 3 rows, <code>st[-1]</code> is the withdrawal, balance ₹120.00. What about objects that act like functions?</span></li>
    <li><b>__call__</b><span>Q: can a fee rule with settings and memory be called like a function? → <code>fee_rule(balance)</code> runs <code>__call__</code>: ₹10 when overdrawn, charged 2 times. And a transfer that must fully happen or not at all?</span></li>
    <li><b>__enter__ / __exit__</b><span>Q: how do we undo a half-done transfer when a step fails? → <code>with Atomic(asha, ben):</code> snapshots on enter and rolls back on error: Ben's ₹200 deposit is undone when Asha cannot pay. The full story continues in <a class="xref" data-note="py_context">Context Managers</a>.</span></li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span><p>A standard plug shape. Any appliance with the right plug fits the wall socket, whoever made it. Python's syntax is a wall of sockets: <code>len()</code>, <code>+</code>, <code>for</code>, <code>with</code>. A dunder method is the plug: give your class <code>__len__</code> and it fits <code>len()</code>, exactly like a list.</p></div>

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
          <li>💡 standard plug, standard socket</li>
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
          <li>Iterators in depth → Iterators note</li>
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
      <div class="rm-item rm-done" data-target="pd-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pd-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Data Model</span><span class="rm-sub">Syntax → type(x).__dunder__(x)</span></div></div>
      <div class="rm-item rm-done" data-target="pd-repr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">__repr__ and __str__</span><span class="rm-sub">Developer view, user view</span></div></div>
      <div class="rm-item rm-done" data-target="pd-eq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Equality &amp; Hashing</span><span class="rm-sub">Why __eq__ removes __hash__</span></div></div>
      <div class="rm-item rm-done" data-target="pd-order"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Ordering</span><span class="rm-sub">__lt__ and total_ordering</span></div></div>
      <div class="rm-item rm-done" data-target="pd-arith"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Arithmetic Operators</span><span class="rm-sub">__add__, __radd__, NotImplemented</span></div></div>
      <div class="rm-item rm-done" data-target="pd-container"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Container Protocol</span><span class="rm-sub">len, [], in, for</span></div></div>
      <div class="rm-item rm-done" data-target="pd-call"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Callable Objects</span><span class="rm-sub">__call__</span></div></div>
      <div class="rm-item rm-done" data-target="pd-with"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">__enter__ and __exit__</span><span class="rm-sub">All-or-nothing transfers</span></div></div>
      <div class="rm-item rm-done" data-target="pd-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">The finished Money</span></div></div>
      <div class="rm-item rm-done" data-target="pd-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that bite</span></div></div>
      <div class="rm-item rm-done" data-target="pd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="pd-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pd-model"><span class="num">01</span>The Data Model: How Syntax Becomes Method Calls</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>PocketBank stores balances as floats, and floats cannot hold most decimal amounts exactly. A <code>Money</code> class that stores whole paise would fix that, but then <code>+</code>, <code>==</code>, <code>&lt;</code>, <code>sum</code> and <code>print</code> stop working on it. How do built-in types like <code>int</code> and <code>list</code> get those abilities, and how can our own class get them?</p></div>
  <h3>The running example's problem</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: __repr__ and __str__.</b> We know the hooks exist. The first one any class needs is how it shows itself: a memory address helps nobody reading a log or a test failure.</div>

  <h2 id="pd-repr"><span class="num">02</span>__repr__ and __str__</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>A customer's statement should show <code>₹1,250.50</code>. A developer reading a log or a failing test needs to see exactly what the object is, including the currency, ideally in a form that could be pasted back into Python. Is that one text or two, and which hook produces which?</p></div>
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
  <div class="bridge"><b>What this still can't tell us → next: Equality &amp; Hashing.</b> Money now prints well, yet <code>Money("120") == Money("120.00")</code> is still False: two separate objects. When should two amounts count as equal, and what does that do to sets and dicts?</div>

  <h2 id="pd-eq"><span class="num">03</span>Equality &amp; Hashing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>₹120 is ₹120, whichever object holds it. We want <code>==</code> to compare the amount, not the identity. And PocketBank counts notes in a drawer with a dict like <code>{Money(500): 2, Money(100): 3}</code>, so Money must also work as a dict key and set member. What does each require?</p></div>
  <p>In plain words: <code>__eq__</code> decides what <code>==</code> means. Without it, <code>==</code> falls back to <code>is</code> (same object). A value type such as Money should compare by value: same paise and same currency. If the other object is not a Money, return <code>NotImplemented</code>, a special value meaning "I don't know how to compare with that; ask the other side".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two ₹500 notes with different serial numbers. As objects they are different notes (<code>is</code> is False); as money they are equal (<code>==</code> is True).</p></div>
  <p>To avoid retyping the whole class in every section, each section <em>extends</em> the previous Money with <code>class Money(Money)</code>, inheritance from <a class="xref" data-note="py_inheritance">the previous note</a>. Section 09 puts the finished class in one place.</p>
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
  <p>After changing <code>a.paise</code> while <code>a</code> sat inside a set, the set can no longer find it: it looks in the bucket for the new hash, while the object sits in the bucket of the old hash. Even an object equal to its new value is not found. Rule: only objects whose compared fields never change should be hashable. Our Money arithmetic (section 05) always returns new objects and never changes <code>paise</code>, so Money is used as an immutable value; a <code>@dataclass(frozen=True)</code> enforces that automatically.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>__eq__(self, other)</code> implements <code>==</code> (and, inverted, <code>!=</code>); return <code>NotImplemented</code> for unsupported types. <code>__hash__(self)</code> returns an int used by sets and dicts. Contract: <code>a == b</code> ⇒ <code>hash(a) == hash(b)</code>, and the hash must not change while the object is in a container. A class that defines <code>__eq__</code> without <code>__hash__</code> gets <code>__hash__ = None</code> (unhashable).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Never hash a field that <code>__eq__</code> ignores, and never make a mutable object hashable by value. The usual safe recipe is <code>hash(tuple of the compared fields)</code> on an immutable object.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Ordering.</b> We can tell whether two amounts are equal. A statement must also list bills from smallest to largest and find the biggest withdrawal, so we need <code>&lt;</code>.</div>

  <h2 id="pd-order"><span class="num">04</span>Ordering</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>To sort Asha's bills and find the largest, Python must know which of two amounts is smaller. There are four ordering operators (<code>&lt; &lt;= &gt; &gt;=</code>). Do we have to write all four?</p></div>
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
  <div class="bridge"><b>What this still can't tell us → next: Arithmetic Operators.</b> Money can be printed, compared, hashed and sorted. But the bank's main job is still impossible: <code>balance + deposit</code> raises TypeError, and so does <code>sum()</code> over a statement.</div>

  <h2 id="pd-arith"><span class="num">05</span>Arithmetic: Operator Overloading</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Asha's ₹100 + ₹50 − ₹30 must be ₹120.00 exactly; ten ₹0.10 credits must sum to exactly ₹1.00; interest is balance × 0.01. How do we give <code>+</code>, <code>-</code> and <code>*</code> a meaning for Money, and why does <code>sum()</code> need something extra?</p></div>
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
  <p>After the code, line by line. ₹0.10 + ₹0.20 is exactly ₹0.30 and equals it: the float problem of section 01 is gone, because 10 + 20 paise is integer arithmetic. Ten ₹0.10 credits sum to exactly ₹1.00. Asha's 100 + 50 − 30 is ₹120.00; 1% interest is ₹1.20; <code>3 * Money(10)</code> worked through <code>__rmul__</code>; <code>-</code> and <code>abs</code> work; ₹0 is falsy, ₹120 is truthy.</p>
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
  <div class="callout trap"><span class="label">Trap</span><p>Return <code>NotImplemented</code>, do not <code>raise NotImplementedError</code> and do not return <code>None</code>: raising blocks the reflected try, and <code>None</code> would be taken as the actual result. And do not let <code>__add__</code> change <code>self</code>: a value that changes under you breaks hashing (section 03) and surprises every other name pointing at it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Container Protocol.</b> Money now behaves like a number. A statement, though, is a sequence of transactions: it should support <code>len</code>, <code>st[0]</code>, <code>st[1:]</code>, <code>"withdraw" in st</code> and <code>for t in st</code>, like a list, while keeping its own rules.</div>

  <h2 id="pd-container"><span class="num">06</span>The Container Protocol</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Asha's statement holds three transactions: open ₹100, deposit ₹50, withdraw ₹30. Making <code>Statement</code> a subclass of <code>list</code> would hand out <code>clear()</code> and <code>sort()</code> (a has-a, not an is-a, as <a class="xref" data-note="py_inheritance">the previous note</a> warned). How can our own class support the list-like syntax, choosing exactly which parts?</p></div>
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
  <p>After the code. <code>len</code> is 3, a non-empty statement is truthy and Ben's empty one falsy (via <code>__len__</code>). <code>st[0]</code> is the opening transaction, <code>st[-1]</code> the withdrawal (negative indexes work because we pass the index to the inner list). <code>st[1:]</code> is a new two-row Statement, not a bare list, because <code>__getitem__</code> checks for a slice. <code>"withdraw" in st</code> is True, <code>"interest" in st</code> False. The <code>for</code> loop used <code>__iter__</code>, and the balance, <code>sum</code> of signed amounts, is ₹120.00, matching Asha's account in every note of the group. <code>reversed()</code> worked from <code>__len__</code> and <code>__getitem__</code> alone.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>sequence/container protocol</strong>: <code>__len__</code> (non-negative int), <code>__getitem__(key)</code> (int or <code>slice</code>; raise <code>IndexError</code>/<code>KeyError</code> when missing), <code>__contains__(item)</code> (else Python iterates), <code>__iter__</code> (returns an iterator; else Python falls back to <code>__getitem__</code> from 0), <code>__reversed__</code> (else <code>__len__</code> + <code>__getitem__</code>). <code>collections.abc.Sequence</code> provides most of these from <code>__len__</code> and <code>__getitem__</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>__len__</code> also decides truthiness: a container with 0 items is falsy, so <code>if st:</code> means "is it non-empty?", not "does it exist?". Test <code>if st is not None:</code> when that is what you mean. And <code>__getitem__</code> must raise <code>IndexError</code> at the end, or the fallback loop never stops.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Callable Objects.</b> Values and containers are covered. PocketBank's fee rule is a third kind of thing: something you <em>call</em> with a balance to get a fee, but which also carries settings (₹10) and memory (how often it charged). A function has no settings; an object cannot be called. Or can it?</div>

  <h2 id="pd-call"><span class="num">07</span>Callable Objects: __call__</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>In <a class="xref" data-note="py_inheritance">Inheritance</a> the fee policy was an object with a <code>fee(balance)</code> method. Code that accepts plain functions as strategies (<code>key=</code>, callbacks) cannot use it without a wrapper. Can an object be called directly, <code>fee_rule(balance)</code>, and still keep its settings and a count of how often it charged?</p></div>
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
  <div class="bridge"><b>What this still can't tell us → next: __enter__ and __exit__.</b> One hook family is left: the one behind <code>with</code>. Asha pays Ben in two steps, a deposit to Ben and a withdrawal from Asha. If the second step fails, the first must be undone. How do we guarantee that clean-up runs, error or not?</div>

  <h2 id="pd-with"><span class="num">08</span>__enter__ and __exit__</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>A transfer from Asha to Ben is two operations. If Ben's deposit succeeds and Asha's withdrawal then fails, money has appeared from nowhere. <code>try/except</code> around every transfer would repeat the same snapshot-and-restore code everywhere. Can one object own "set up, run the block, always clean up"?</p></div>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have taught Money and Statement eight families of hooks. Time to see them together in one class and one table, and how they lean on each other.</div>

  <h2 id="pd-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Are <code>__repr__</code>, <code>__eq__</code>, <code>__hash__</code>, <code>__lt__</code>, <code>__add__</code>, <code>__len__</code>, <code>__call__</code> and <code>__exit__</code> a list to memorise, or one system where each hook depends on the ones before?</p></div>
  <figure class="viz"><svg viewBox="0 0 700 250" width="700">
    <defs><marker id="pd-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="240" y="8" width="220" height="44" rx="7" class="fb sb"/><text x="350" y="27" text-anchor="middle" font-size="11.5" font-weight="700">data model: type(x).__op__(x)</text><text x="350" y="43" text-anchor="middle" class="tm" font-size="10">len(s) ignores s.__len__ = 99</text>
    <line x1="290" y1="52" x2="95" y2="88" stroke="currentColor" marker-end="url(#pd-a2)"/>
    <line x1="350" y1="52" x2="350" y2="88" stroke="currentColor" marker-end="url(#pd-a2)"/>
    <line x1="410" y1="52" x2="605" y2="88" stroke="currentColor" marker-end="url(#pd-a2)"/>
    <rect x="10" y="90" width="170" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="95" y="109" text-anchor="middle" font-size="11.5" font-weight="700">__repr__ / __str__</text><text x="95" y="125" text-anchor="middle" class="tm" font-size="10">Money('1250.50', 'INR')</text>
    <rect x="200" y="90" width="300" height="44" rx="7" class="ft st"/><text x="350" y="109" text-anchor="middle" font-size="11.5" font-weight="700">__eq__ → __hash__ → __lt__ (+ total_ordering)</text><text x="350" y="125" text-anchor="middle" class="tm" font-size="10">₹120 == ₹120.00; set of 2; sorted 30 &lt; 50.5 &lt; 120</text>
    <rect x="520" y="90" width="170" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="605" y="109" text-anchor="middle" font-size="11.5" font-weight="700">__call__ / __enter__</text><text x="605" y="125" text-anchor="middle" class="tm" font-size="10">fee ₹10 ×2; rollback</text>
    <line x1="350" y1="134" x2="350" y2="168" stroke="currentColor" marker-end="url(#pd-a2)"/>
    <rect x="200" y="170" width="300" height="44" rx="7" class="ft st"/><text x="350" y="189" text-anchor="middle" font-size="11.5" font-weight="700">__add__ / __radd__ / __mul__, NotImplemented</text><text x="350" y="205" text-anchor="middle" class="tm" font-size="10">₹0.10 + ₹0.20 == ₹0.30; sum of 10 credits = ₹1.00</text>
    <line x1="500" y1="192" x2="518" y2="192" stroke="currentColor" marker-end="url(#pd-a2)"/>
    <rect x="520" y="170" width="170" height="44" rx="7" class="fg sg"/><text x="605" y="189" text-anchor="middle" font-size="11.5" font-weight="700">Statement container</text><text x="605" y="205" text-anchor="middle" class="tm" font-size="10">len 3, balance ₹120.00</text>
    <text x="350" y="240" text-anchor="middle" class="tm" font-size="10.5">sum() needs __radd__; sets need __hash__ which needs __eq__; sorted needs __lt__; fees compare with __lt__</text>
  </svg><figcaption>Every hook is reached through one rule (top). Equality comes before hashing and ordering; arithmetic produces the values the container sums; the callable fee rule and the transfer use comparisons and arithmetic from below.</figcaption></figure>
  <p>The finished Money in one place, compact, with each line's job in the comments. It runs the running example end to end.</p>
  <div class="fx" data-lang="py">@total_ordering
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
  <table class="tbl"><caption>Every hook, what it is built from, and its value on PocketBank</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Data model lookup</td><td><code>type(x).__op__(x, …)</code></td><td>how does syntax reach my code?</td><td><code>len(s)</code> = 3 even with <code>s.__len__ = 99</code></td><td>define hooks in the class body</td></tr>
    <tr><td><code>__repr__</code> / <code>__str__</code></td><td>the object's fields</td><td>how should it print?</td><td><code>Money('1250.50', 'INR')</code> / <code>₹1,250.50</code></td><td>repr always; str for users</td></tr>
    <tr><td><code>__eq__</code></td><td>compared fields + NotImplemented</td><td>when are two values equal?</td><td>₹120 == ₹120.00; <code>a == 120</code> False</td><td>value types</td></tr>
    <tr><td><code>__hash__</code></td><td>the same fields as <code>__eq__</code></td><td>set member / dict key?</td><td>set of 2; notes dict lookup → 2</td><td>immutable value types only</td></tr>
    <tr><td>Ordering</td><td><code>__lt__</code> + <code>__eq__</code> + total_ordering</td><td>which is smaller?</td><td>sorted ₹30, ₹50.50, ₹120</td><td>sortable values</td></tr>
    <tr><td>Arithmetic</td><td><code>__add__</code> …, reflected <code>__r*__</code>, NotImplemented</td><td>add/scale exactly?</td><td>₹0.30 exact; sum of 10 × ₹0.10 = ₹1.00</td><td>numeric-like values</td></tr>
    <tr><td>Container</td><td><code>__len__</code>, <code>__getitem__</code>, <code>__contains__</code>, <code>__iter__</code></td><td>list-like syntax with my rules?</td><td>len 3; <code>st[1:]</code> is a Statement; balance ₹120.00</td><td>collections you own</td></tr>
    <tr><td><code>__call__</code></td><td>an object + call syntax</td><td>a function with settings and state?</td><td>fee ₹10, charged 2 times</td><td>strategies, callbacks, models</td></tr>
    <tr><td><code>__enter__</code> / <code>__exit__</code></td><td>setup + guaranteed exit</td><td>always clean up / roll back?</td><td>failed ₹200 transfer rolled back</td><td>resources, transactions</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>every piece of Python syntax is a method call on the object's type, so a class becomes "built-in-like" by implementing the hooks; the hooks are not independent (hash follows equality, ordering is derived from one comparison plus equality, <code>sum</code> needs the reflected add, containers derive truthiness and reversal from length and indexing), and returning <code>NotImplemented</code> is how two types negotiate who handles an operator.</strong></p></div>
  <h3>The group, and what comes next</h3>
  <ul>
    <li><a class="xref" data-note="py_oop">Object-Oriented Python: the map</a> — how this note completes the group's need chain.</li>
    <li><a class="xref" data-note="py_classes">Classes &amp; Objects</a> — <code>__init__</code>, the desugaring <code>obj.m()</code> → <code>type(obj).m(obj)</code>, dataclasses that write <code>__repr__</code>/<code>__eq__</code>.</li>
    <li><a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a> — duck typing, which the data model applies to the whole language.</li>
    <li><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> — <code>__iter__</code>, <code>__next__</code> and <code>yield</code> in full.</li>
    <li><a class="xref" data-note="py_context">Context Managers</a> — <code>with</code>, <code>__enter__</code>/<code>__exit__</code>, <code>contextlib</code>.</li>
    <li><a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> — hashing and buckets behind section 03.</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The mistakes that make dunder methods misbehave, each with its symptom.</div>

  <h2 id="pd-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Which dunder-method mistakes are most common, and how does each show itself?</p></div>
  <div class="callout trap"><span class="label">Trap: <code>__eq__</code> without <code>__hash__</code></span><p>Symptom: "unhashable type" when the object goes into a set or dict. Fix: <code>__hash__</code> over the same fields, on an immutable object (or <code>@dataclass(frozen=True)</code>).</p></div>
  <div class="callout trap"><span class="label">Trap: raising instead of returning NotImplemented</span><p>Symptom: <code>3 * m</code> or <code>sum()</code> fails although <code>__rmul__</code>/<code>__radd__</code> exist elsewhere. Fix: <code>return NotImplemented</code> for unknown types.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>sum()</code> without <code>__radd__</code></span><p>Symptom: "unsupported operand type(s) for +: 'int' and 'Money'". Cause: <code>sum</code> starts at 0. Fix: <code>__radd__</code> that treats 0 as nothing, or <code>sum(items, Money(0))</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: only <code>__str__</code></span><p>Symptom: lists of your objects still print memory addresses. Fix: write <code>__repr__</code> (str falls back to it, not the other way).</p></div>
  <div class="callout trap"><span class="label">Trap: mutating a hashed object</span><p>Symptom: an object "disappears" from a set or dict after a change. Fix: keep hashable objects immutable; arithmetic returns new objects.</p></div>
  <div class="callout trap"><span class="label">Trap: dunder methods on the instance</span><p>Symptom: <code>obj.__len__ = …</code> has no effect on <code>len(obj)</code>. Cause: implicit lookup uses the type. Fix: define them in the class.</p></div>
  <div class="callout trap"><span class="label">Trap: surprising truthiness</span><p>Symptom: an empty Statement or ₹0 skips an <code>if</code>. Cause: <code>__len__</code>/<code>__bool__</code>. Fix: test <code>is not None</code> when you mean "exists".</p></div>
  <div class="callout trap"><span class="label">Trap: <code>__exit__</code> returning True</span><p>Symptom: errors inside <code>with</code> vanish silently. Fix: return False unless suppression is the explicit purpose.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page.</div>

  <h2 id="pd-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: <strong>PocketBank</strong>. Money stores whole paise in an int. Asha: open ₹100, deposit ₹50, withdraw ₹30 → ₹120.00. Ten ₹0.10 credits → exactly ₹1.00 (floats give 0.9999999999999999). Statement: 3 rows. Fee rule: ₹10 when overdrawn. Transfer of ₹200 that fails is rolled back.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Hook family</th><th>Question it answers</th><th>On PocketBank</th><th>Weakness → next</th></tr>
    <tr><td>Data model</td><td>how does syntax reach my code?</td><td>plain Money: <code>+ &lt; sum len</code> all TypeError</td><td>prints as an address</td></tr>
    <tr><td><code>__repr__</code>/<code>__str__</code></td><td>how to print?</td><td><code>Money('1250.50', 'INR')</code>, <code>₹1,250.50</code></td><td>₹120 != ₹120.00</td></tr>
    <tr><td><code>__eq__</code>/<code>__hash__</code></td><td>equal? set/dict key?</td><td>equal by value; set of 2</td><td>can't sort</td></tr>
    <tr><td>Ordering</td><td>which is smaller?</td><td>sorted ₹30, ₹50.50, ₹120</td><td>can't add</td></tr>
    <tr><td>Arithmetic</td><td>add/scale exactly?</td><td>₹0.10 + ₹0.20 == ₹0.30</td><td>statement is a bare list</td></tr>
    <tr><td>Container</td><td>len, [], in, for?</td><td>len 3, balance ₹120.00</td><td>callable rules?</td></tr>
    <tr><td><code>__call__</code></td><td>function with state?</td><td>fee ₹10, charged 2 times</td><td>guaranteed cleanup?</td></tr>
    <tr><td><code>__enter__</code>/<code>__exit__</code></td><td>always clean up?</td><td>₹200 transfer rolled back</td><td>→ Context Managers note</td></tr>
  </table>
  <h3>Rules to remember</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Form</th><th>What each part means</th></tr>
    <tr><td>Implicit lookup</td><td><code>len(x)</code> ≡ <code>type(x).__len__(x)</code></td><td>instance attributes are skipped</td></tr>
    <tr><td>Binary operator</td><td><code>a + b</code>: <code>a.__add__(b)</code> → if NotImplemented → <code>b.__radd__(a)</code> → else TypeError</td><td>reflected tried first if b's type subclasses a's</td></tr>
    <tr><td>sum</td><td><code>sum(xs)</code> = <code>((0 + x1) + x2) + …</code></td><td>first step needs <code>x1.__radd__(0)</code></td></tr>
    <tr><td>Augmented</td><td><code>a += b</code>: <code>__iadd__</code>, else <code>a = a + b</code></td><td>immutables rebind; lists mutate</td></tr>
    <tr><td>Hash contract</td><td><code>a == b</code> ⇒ <code>hash(a) == hash(b)</code></td><td>defining <code>__eq__</code> sets <code>__hash__ = None</code></td></tr>
    <tr><td>Comparison reflection</td><td><code>a &gt; b</code> → <code>b &lt; a</code>; <code>a &lt;= b</code> → <code>b &gt;= a</code></td><td><code>total_ordering</code> fills the rest</td></tr>
    <tr><td>Truthiness</td><td><code>__bool__</code>, else <code>__len__() != 0</code>, else True</td><td>empty containers and ₹0 are falsy</td></tr>
    <tr><td>Text</td><td><code>str()</code> → <code>__str__</code> → falls back to <code>__repr__</code></td><td>containers always show repr</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b><code>__repr__</code></b><p>Every class you will ever debug.</p><small>Cheap, no side effects</small></div>
    <div><b><code>__eq__</code> + <code>__hash__</code></b><p>Value types (Money, Point, a config key) that are immutable.</p><small>Not hashable if mutable</small></div>
    <div><b>Ordering</b><p>Values with one natural order; <code>total_ordering</code> or <code>dataclass(order=True)</code>.</p><small>Several possible orders? use <code>key=</code></small></div>
    <div><b>Operators</b><p>When the meaning is obvious (money + money).</p><small>Avoid clever meanings (<code>account &gt;&gt; ben</code> for a transfer)</small></div>
    <div><b>Container hooks</b><p>Collections with their own rules (Statement).</p><small>Or inherit <code>collections.abc.Sequence</code></small></div>
    <div><b><code>__call__</code> / <code>with</code></b><p>Stateful strategies and callbacks; resources and all-or-nothing work.</p><small>Several actions → named methods</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p><code>__eq__</code> without <code>__hash__</code>; raising instead of returning <code>NotImplemented</code>; <code>sum()</code> without <code>__radd__</code>; only <code>__str__</code>; mutating hashed objects; dunders set on instances do nothing; empty means falsy; <code>__exit__</code> returning True hides errors.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>What does <code>len(st)</code> actually call?</td><td><code>type(st).__len__(st)</code>, ignoring any <code>__len__</code> on the instance.</td></tr>
    <tr><td>You define <code>__eq__</code> only. What happens to <code>{m}</code>?</td><td>TypeError: unhashable, because <code>__hash__</code> became None.</td></tr>
    <tr><td>Steps of <code>3 * Money(10)</code>?</td><td><code>int.__mul__(3, m)</code> → NotImplemented → <code>Money.__rmul__(m, 3)</code> → ₹30.00.</td></tr>
    <tr><td>Why does <code>sum(list_of_money)</code> need <code>__radd__</code>?</td><td>It starts with 0, so the first step is <code>0 + m</code>, which <code>int</code> refuses.</td></tr>
    <tr><td>Only <code>__lt__</code> and <code>__eq__</code> defined: does <code>a &gt; b</code> work? <code>a &lt;= b</code>?</td><td><code>&gt;</code> yes (reflected to <code>b &lt; a</code>); <code>&lt;=</code> no, unless <code>@total_ordering</code>.</td></tr>
  </table>

  <h2 id="pd-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span><code>__str__</code> vs <code>__repr__</code>?</summary><div class="qa-body"><code>__repr__</code>: exact, for developers, ideally rebuilds the object (<code>Money('1250.50', 'INR')</code>); used by <code>repr()</code>, the shell and inside containers. <code>__str__</code>: friendly, for users (<code>₹1,250.50</code>); used by <code>print</code>, <code>str()</code>, f-strings. <code>str</code> falls back to <code>__repr__</code>, so write that first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You defined <code>__eq__</code> and now <code>{obj}</code> raises TypeError. Why?</summary><div class="qa-body">Defining <code>__eq__</code> sets <code>__hash__ = None</code>. Equal objects must have equal hashes, and the default identity hash would break that rule (two equal items in one set). Add <code>__hash__</code> over the same immutable fields, or use <code>@dataclass(frozen=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why return <code>NotImplemented</code> from <code>__add__</code> instead of raising?</summary><div class="qa-body">It tells Python "I don't handle this type", so Python tries the other operand's reflected method (<code>other.__radd__</code>). Only if both decline does it raise TypeError. Raising yourself blocks that fallback.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python find the method for <code>len(x)</code>, and why does it matter?</summary><div class="qa-body">It calls <code>type(x).__len__(x)</code>, skipping the instance dictionary. So dunders must be defined on the class; assigning one to an instance has no effect on the syntax. It also makes these lookups fast.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>sum()</code> fail on a list of custom objects that support <code>+</code>?</summary><div class="qa-body"><code>sum</code> starts from 0, so the first operation is <code>0 + obj</code>. <code>int.__add__</code> returns NotImplemented and, without <code>obj.__radd__</code>, Python raises TypeError. Add <code>__radd__</code> (treat 0 as identity) or pass a start value: <code>sum(xs, Money(0))</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>functools.total_ordering</code> do?</summary><div class="qa-body">Given <code>__eq__</code> and one of <code>__lt__</code>, <code>__le__</code>, <code>__gt__</code>, <code>__ge__</code>, it writes the other three. Without it, <code>&gt;</code> still works through reflection of <code>&lt;</code>, but <code>&lt;=</code> and <code>&gt;=</code> fail.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which methods make a class usable in a <code>for</code> loop, and what is the fallback?</summary><div class="qa-body"><code>__iter__</code> returning an iterator (often a generator). Fallback: if only <code>__getitem__</code> exists, Python calls it with 0, 1, 2… until IndexError. <code>in</code> uses <code>__contains__</code>, else iteration.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__call__</code> used for in ML libraries?</summary><div class="qa-body">PyTorch's <code>model(x)</code> calls <code>nn.Module.__call__</code>, which runs hooks and then your <code>forward</code>. scikit-learn scorers and Keras layers are callables too. Class-based decorators also use <code>__call__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must a hashable object be immutable, and how does Money's arithmetic respect that?</summary><div class="qa-body">A set stores an item in the bucket of its hash at insertion time. If the compared fields change, its hash changes and the set looks in the wrong bucket, so the item is "lost" (our <code>a.paise = 99</code> demo). Money's <code>__add__</code>, <code>__sub__</code>, <code>__mul__</code> return new objects and never change <code>paise</code>, and <code>+=</code> rebinds the name, so a Money in a set stays findable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is the data model the same idea as duck typing and as <code>obj.method()</code> → <code>Class.method(obj)</code>?</summary><div class="qa-body">The desugaring from <a class="xref" data-note="py_classes">Classes &amp; Objects</a> (method found on the type, object passed in) is exactly how <code>len(x)</code> becomes <code>type(x).__len__(x)</code>. And like duck typing in <a class="xref" data-note="py_inheritance">Inheritance</a>, Python never checks for a parent class: any type with <code>__len__</code> works with <code>len</code>, any type with <code>__iter__</code> works with <code>for</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip <code>__eq__</code> but write <code>__hash__</code> and <code>__lt__</code>?</summary><div class="qa-body"><code>==</code> stays identity, so two ₹120 objects are unequal: a set keeps both (equal hashes, but <code>==</code> says different), dict lookups with a new <code>Money(500)</code> key fail, and <code>total_ordering</code> derives <code>&lt;=</code> as "less or identical", which is wrong. Equality is the foundation the other hooks assume.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is Statement built with dunder methods instead of inheriting from <code>list</code>?</summary><div class="qa-body">A statement <em>has</em> transactions; it is not a general list. Inheriting <code>list</code> would expose <code>clear</code>, <code>sort</code>, <code>pop</code>, which could rewrite history (the composition-over-inheritance rule from the previous note). With dunders we choose exactly the read-only abilities (<code>len</code>, indexing, slicing returning a Statement, <code>in</code> with our own meaning, iteration).</div></details>
</main>
`
});
