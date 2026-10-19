// notes/python/py_oop.js — Object-Oriented Python: the map
Object.assign(TOPIC_CONTENT, {
  "py_oop": `<main>
<h1>Object-Oriented Python: the map</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Object-Oriented Python: the map</span></div>
  <p class="lead">Start here. Object-oriented programming (OOP) is a way of organising code in which a piece of data and the functions allowed to change it live together, in a <em>class</em>. Its many terms (class, object, <code>self</code>, encapsulation, inheritance, polymorphism, duck typing, dunder methods, ABCs, composition, SOLID) are not a list to memorise: each one exists because the one before it left a problem unsolved. This page tells that story as a chain of needs, introduces the one running example every note of the group uses (<strong>PocketBank</strong>, a tiny wallet app with two customers, Asha and Ben), shows the group's map and reading order, and ends with a revision sheet. The three notes after it teach each part completely. Every sklearn estimator (<code>model.fit()</code>), PyTorch module (<code>class Net(nn.Module)</code>) and FastAPI model is built this way, and OOP questions come up in almost every Python interview.</p>

  <h2 id="oo-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
    <defs><marker id="oo-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="200" y="6" width="240" height="30" rx="6" class="fg sg" stroke-width="2.5"/><text x="320" y="26" text-anchor="middle" font-size="12" font-weight="700">Object-Oriented Python: the map</text>
    <line x1="320" y1="36" x2="115" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="36" x2="320" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="36" x2="525" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="15" y="66" width="200" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="115" y="85" text-anchor="middle" font-size="12">1. Classes &amp; Objects</text><text x="115" y="101" text-anchor="middle" class="tm" font-size="10">bundle + protect</text>
    <rect x="220" y="66" width="200" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="85" text-anchor="middle" font-size="12">2. Inheritance, Polymorphism</text><text x="320" y="101" text-anchor="middle" class="tm" font-size="10">reuse, many forms, design</text>
    <rect x="425" y="66" width="200" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="525" y="85" text-anchor="middle" font-size="12">3. Dunder Methods</text><text x="525" y="101" text-anchor="middle" class="tm" font-size="10">act like built-in types</text>
    <line x1="215" y1="88" x2="218" y2="88" stroke="currentColor" marker-end="url(#oo-a0)"/>
    <line x1="420" y1="88" x2="423" y2="88" stroke="currentColor" marker-end="url(#oo-a0)"/>
    <text x="320" y="150" text-anchor="middle" class="tm" font-size="11">one running example in all four notes: PocketBank (Asha ₹120, Ben ₹50)</text>
  </svg><figcaption>The Object-Oriented Python group as it appears in the sidebar. You are on the green node: the map of the three notes below it, read in order 1 → 2 → 3.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_fundamentals">Python Fundamentals</a>, <a class="xref" data-note="py_functions">Functions</a> and <a class="xref" data-note="py_ds">Data Structures</a></b><span>You can store records in dicts and lists and write functions that work on them. That is enough for scripts. It stops being enough when a program has many kinds of records, each with rules that must never be broken (section 01 shows exactly how it breaks).</span></li>
    <li><b>This note adds: the map</b><span>The chain of needs that produces every OOP concept, the shared running example, the group's family tree, a reading guide, the "four pillars" placed on the map, and a revision sheet for the whole group. No concept is taught in depth here; each has its note.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_classes">Classes &amp; Objects</a></b><span>The first note to read. After the group: <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, <a class="xref" data-note="py_decorators">Decorators</a> and <a class="xref" data-note="py_context">Context Managers</a> build on the dunder methods and classes learnt here, and <a class="xref" data-note="py_testing">Testing</a> relies on dependency injection and good <code>__repr__</code>/<code>__eq__</code>.</span></li>
  </ol>

  <h2 id="oo-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole group as one chain of needs. Each concept answers the question above it; its weakness raises the next question. Read it top to bottom once, slowly: if you can retell it in your own words, you know how every OOP term relates to every other. Numbers come from PocketBank (section 02).</p>
  <ol class="story">
    <li><b>Data and functions drift apart</b><span>Q: what goes wrong with dicts plus loose functions? → Nothing ties the rules to the data: <code>asha["balance"] -= 500</code> skips the "no overdraft" check (Asha at −380), and a typo key <code>"balnce"</code> is silently created. We need the data and its rules in one place…</span></li>
    <li><b>Class &amp; object</b><span>Q: how do we bundle data with the functions that change it? → A class is a blueprint; each object (Asha's account, Ben's account) has its own data, and methods travel with it: <code>asha.deposit(50)</code> is really <code>Account.deposit(asha, 50)</code>. But anyone can still write <code>asha.balance = -500</code>… <a class="xref" data-note="py_classes">Classes &amp; Objects</a></span></li>
    <li><b>Encapsulation</b><span>Q: how do we protect the rule "balance never below 0" (an invariant)? → Keep the data internal (<code>_balance</code>, <code>__balance</code>) and expose it through methods and read-only properties: assigning <code>asha.balance</code> raises AttributeError. But PocketBank needs savings and current accounts, almost the same as Account… <a class="xref" data-note="py_classes">Classes &amp; Objects</a></span></li>
    <li><b>Inheritance</b><span>Q: how do we reuse Account and specialise only the differences? → <code>class SavingsAccount(Account)</code> inherits everything and overrides or extends a few methods with <code>super()</code>; Asha earns 1% (120 → 121.2), Ben may go overdrawn (−30). But code that processes "all accounts" now seems to need an if per type… <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a></span></li>
    <li><b>Polymorphism &amp; duck typing</b><span>Q: can one piece of code handle every type? → One interface, many forms: <code>acc.month_end()</code> runs the right version for each object (Asha +1.2, Ben −10). Python does not even require a common parent: anything with <code>month_end</code> works (a gift card). But our Money values still cannot <code>+</code>, <code>==</code> or print… <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a></span></li>
    <li><b>Dunder methods</b><span>Q: how do our objects behave like built-in values? → Python's syntax calls special methods on the type: <code>len(x)</code> → <code>type(x).__len__(x)</code>, <code>a + b</code> → <code>__add__</code>. A Money type with <code>__add__</code>, <code>__eq__</code>, <code>__hash__</code>, <code>__lt__</code>, <code>__repr__</code> makes ₹0.10 + ₹0.20 == ₹0.30 exactly. But as the code grows, how do we keep the design itself healthy? <a class="xref" data-note="py_dunder">Dunder Methods &amp; the Data Model</a></span></li>
    <li><b>Contracts &amp; design</b><span>Q: how do we stop a new account type forgetting a method, avoid a class for every combination of features, and keep code changeable? → ABCs make an interface a contract (a missing method blocks creation); composition (an account <em>has</em> an interest policy) replaces 8 combination classes; SOLID's five rules and patterns like strategy and factory name the good habits. <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a></span></li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span><p>Running a bank branch. First, customer files lie loose next to a rule book anyone may ignore (dicts + functions). Then each customer gets a passbook that only the cashier may write in, following the rules (class, encapsulation). New products are variations of the basic account (inheritance), and the month-end batch job treats them all the same way (polymorphism). The branch's money behaves like real money: it adds up, compares and prints properly (dunder methods). Finally head office writes a launch checklist for new products and attaches add-on cards instead of inventing a product for every combination (ABCs, composition, SOLID).</p></div>

  <h2 id="oo-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Object-Oriented Python</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why OOP</div>
        <ul>
          <li>Data and its rules drift apart in dicts + functions</li>
          <li>OOP bundles them; the rest of OOP protects, reuses and polishes the bundle</li>
          <li>Not always needed: a 20-line script is fine with functions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">1. Classes &amp; Objects</div>
        <ul>
          <li>Class = blueprint, object = instance; <code>obj.m()</code> → <code>Class.m(obj)</code></li>
          <li><code>__init__</code> fills a new object; instance vs class attributes</li>
          <li>Instance / <code>@classmethod</code> / <code>@staticmethod</code></li>
          <li>Encapsulation: <code>_x</code>, <code>__x</code> (mangled), <code>@property</code>; <code>@dataclass</code></li>
          <li>⚠ mutable class attribute shared by all objects</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2. Inheritance &amp; design</div>
        <ul>
          <li><code>class Child(Parent)</code>, override, <code>super()</code></li>
          <li>Polymorphism, duck typing, Protocols</li>
          <li>ABCs: <code>@abstractmethod</code> contracts</li>
          <li>MRO by C3: child first, parents left → right, each once</li>
          <li>Composition over inheritance; SOLID; strategy, factory, observer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3. Dunder methods</div>
        <ul>
          <li><code>len(x)</code> → <code>type(x).__len__(x)</code></li>
          <li><code>__repr__</code>/<code>__str__</code>, <code>__eq__</code>/<code>__hash__</code>, ordering, arithmetic + <code>__radd__</code></li>
          <li>Containers: <code>__len__ __getitem__ __contains__ __iter__</code></li>
          <li><code>__call__</code>; <code>__enter__</code>/<code>__exit__</code></li>
          <li>⚠ defining <code>__eq__</code> removes <code>__hash__</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Four pillars</div>
        <ul>
          <li><b>Encapsulation</b> — protect data (note 1)</li>
          <li><b>Abstraction</b> — small interface, hide how (note 2, ABCs)</li>
          <li><b>Inheritance</b> — is-a reuse (note 2)</li>
          <li><b>Polymorphism</b> — one call, many behaviours (note 2, and note 3 at language level)</li>
          <li>⚠ encapsulation ≠ abstraction</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running example</div>
        <ul>
          <li><b>PocketBank</b>: Asha opens ₹100, +50, −30 → ₹120; Ben ₹50, withdraw 80 refused</li>
          <li>Savings 1%: 120 → 121.2; Current overdraft: Ben −30, fee 10 → −40</li>
          <li>Money in paise: ₹0.10 + ₹0.20 == ₹0.30</li>
          <li>Statement: 3 rows, balance ₹120.00</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="oo-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The group as one chain of needs</span></div></div>
      <div class="rm-item rm-done" data-target="oo-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Data and Functions Drift Apart</span><span class="rm-sub">The problem OOP solves</span></div></div>
      <div class="rm-item rm-done" data-target="oo-example"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">One Running Example: PocketBank</span><span class="rm-sub">The story every note uses</span></div></div>
      <div class="rm-item rm-done" data-target="oo-family"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Group Map</span><span class="rm-sub">Concepts, notes, arrows</span></div></div>
      <div class="rm-item rm-done" data-target="oo-guide"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Reading Guide</span><span class="rm-sub">What each note gives you</span></div></div>
      <div class="rm-item rm-done" data-target="oo-pillars"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Four Pillars, Placed</span><span class="rm-sub">And OOP in the libraries you use</span></div></div>
      <div class="rm-item rm-done" data-target="oo-connect"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table for the group</span></div></div>
      <div class="rm-item rm-done" data-target="oo-traps"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Across the group</span></div></div>
      <div class="rm-item rm-done" data-target="oo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole group on one page</span></div></div>
      <div class="rm-item rm-done" data-target="oo-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Connection questions</span></div></div>
    </div>
  </div>

  <h2 id="oo-why"><span class="num">01</span>The Problem: Data and Functions Drift Apart</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>With dicts, lists and functions (<a class="xref" data-note="py_functions">Functions</a>, <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>) you can already write a small banking script. So why does Python have classes at all? What exactly goes wrong without them?</p></div>
  <p>Here is a wallet app written with only what you know: each account is a dict, and the rules are functions. The bank's one rule: <em>a balance never goes below zero</em>.</p>
  <div class="fx" data-lang="py"># PocketBank without classes: data in dicts, rules in loose functions
asha = {"owner": "Asha", "balance": 100}
ben = {"owner": "Ben", "balance": 50}

def deposit(acc, amount):
    acc["balance"] += amount

def withdraw(acc, amount):
    if amount &gt; acc["balance"]:
        raise ValueError("insufficient funds")
    acc["balance"] -= amount

deposit(asha, 50)
withdraw(asha, 30)
print("Asha, through the rules:", asha["balance"])
try:
    withdraw(ben, 80)
except ValueError as e:
    print("Ben, through the rules: ", e)

asha["balance"] -= 500            # nothing forces anyone to use withdraw()
ben["balnce"] = 0                 # a typo silently creates a new key
print("Asha, rules skipped:    ", asha["balance"])
print("Ben, after a typo:      ", ben)
print("balance of 0.1 + 0.2:   ", 0.1 + 0.2)</div>
  <div class="fx" data-lang="text">Asha, through the rules: 120
Ben, through the rules:  insufficient funds
Asha, rules skipped:     -380
Ben, after a typo:       {'owner': 'Ben', 'balance': 50, 'balnce': 0}
balance of 0.1 + 0.2:    0.30000000000000004</div>
  <p>Read the output top to bottom. Used through the functions, everything is right: Asha reaches 120 and Ben's overdraft is refused. Then two ordinary lines break the bank with no error at all. A direct write skips the rule and puts Asha at −380. A typo creates a new key, so Ben's dict carries junk and his real balance is unchanged. Finally, the balance is a float, and floats cannot even add 0.1 and 0.2 exactly. Three separate problems, one cause: <strong>the data and the rules for it are separate things that merely happen to be used together.</strong></p>
  <p>In plain words, <strong>object-oriented programming</strong> is the answer "put them together": design a new type (a <strong>class</strong>) whose values (<strong>objects</strong>) carry both their data and the only functions allowed to change it (<strong>methods</strong>). Every other OOP idea in this group is a refinement of that one move: protecting the bundle (encapsulation), reusing it (inheritance), handling many kinds of bundle with one piece of code (polymorphism), making it behave like a built-in value (dunder methods), and keeping many bundles well-designed (ABCs, composition, SOLID).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Loose customer files on a desk next to a rule book, versus a passbook that only the cashier may write in. The passbook is the data; the cashier, who always follows the rule book, is the methods; the counter between you and the passbook is encapsulation.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Object-oriented programming</strong>: organising a program around objects, each combining state (attributes) and behaviour (methods), created from classes. In Python everything is already an object (<code>int</code>, <code>list</code>, functions); OOP lets you define your own types alongside them.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>OOP is a tool, not a goal. A 30-line script that reads a file and prints a total does not need a class. Reach for classes when data has rules that must hold, when many functions share the same data, or when you need several variants of one kind of thing.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: One Running Example.</b> The problem is clear. To see each OOP idea fix one part of it, we need one small story that every note of the group follows, with numbers we can check at every step.</div>

  <h2 id="oo-example"><span class="num">02</span>One Running Example: PocketBank</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>OOP concepts are hard to relate when each is shown on a different toy (dogs, shapes, vehicles). Is there one small story, small enough to trace by hand, on which every concept of the group can be shown changing the same numbers?</p></div>
  <p><strong>PocketBank</strong> is a tiny wallet app. Every note of the group uses it, with the same people and the same numbers, so you can watch each new idea fix one more problem.</p>
  <table class="tbl"><caption>The PocketBank cast</caption>
    <tr><th>Who / what</th><th>Story</th><th>Used in</th></tr>
    <tr><td>Asha</td><td>opens with ₹100, deposits ₹50, withdraws ₹30 → <b>₹120</b>; later a savings account at 1% a month → ₹121.20; upgrades to 2% → ₹123.62</td><td>all notes</td></tr>
    <tr><td>Ben</td><td>opens with ₹50; withdrawing ₹80 is <b>refused</b> by a plain account; a current account with ₹100 overdraft allows it → −₹30; month-end fee ₹10 → −₹40</td><td>all notes</td></tr>
    <tr><td>Chitra, Dev</td><td>a plain account (₹70) and a student / fixed-deposit customer, for edge cases</td><td>Classes, Inheritance</td></tr>
    <tr><td>GiftCard GC-7</td><td>₹25, loses ₹1 a month; not an account, but works in the same loop</td><td>Inheritance (duck typing)</td></tr>
    <tr><td>Money</td><td>exact amounts in paise: ₹0.10 + ₹0.20 == ₹0.30; ten ₹0.10 credits = ₹1.00</td><td>Dunder Methods</td></tr>
    <tr><td>Statement</td><td>Asha's 3 transactions (open 100, deposit 50, withdraw 30), balance ₹120.00</td><td>Classes (dataclass), Dunder Methods</td></tr>
  </table>
  <p>Where the group ends up, as a preview. You are not expected to follow every line yet; each comment names the note that teaches it.</p>
  <div class="fx" data-lang="py"># A preview of where the group ends up. Each line is taught in one of the three notes.
from abc import ABC, abstractmethod
from functools import total_ordering

@total_ordering
class Money:                                   # Dunder Methods: a value type
    def __init__(self, paise): self.paise = paise
    def __repr__(self): return f"₹{self.paise / 100:.2f}"
    def __eq__(self, o): return isinstance(o, Money) and self.paise == o.paise
    def __hash__(self): return hash(self.paise)
    def __lt__(self, o): return self.paise &lt; o.paise
    def __add__(self, o): return Money(self.paise + o.paise)
    def __radd__(self, o): return self if o == 0 else NotImplemented
    def __mul__(self, k): return Money(round(self.paise * k))

class Account(ABC):                            # Classes &amp; Objects + an ABC contract
    def __init__(self, owner, rupees):
        self.owner, self._balance = owner, Money(rupees * 100)   # protected data
    @property
    def balance(self): return self._balance                     # read-only view
    def deposit(self, m): self._balance = self._balance + m
    @abstractmethod
    def month_end(self): ...                                     # every type must say how

class SavingsAccount(Account):                 # Inheritance + polymorphism
    def month_end(self): self.deposit(self._balance * 0.01)

class CurrentAccount(Account):
    def month_end(self): pass

asha, ben = SavingsAccount("Asha", 120), CurrentAccount("Ben", 50)
for acc in (asha, ben):
    acc.month_end()                            # one call, two behaviours
print(asha.balance, ben.balance)
print(Money(10) + Money(20) == Money(30), sum([Money(10)] * 10))
try:
    asha.balance = Money(10**9)
except AttributeError as e:
    print("AttributeError:", e)
try:
    Account("Eve", 1)
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">₹121.20 ₹50.00
True ₹1.00
AttributeError: property 'balance' of 'SavingsAccount' object has no setter
TypeError: Can't instantiate abstract class Account without an implementation for abstract method 'month_end'</div>
  <p>After the code. Polymorphism: one loop, Asha earned 1% (₹121.20) and Ben's current account did nothing. Dunder methods: Money adds exactly, and <code>sum</code> of ten ₹0.10 credits is ₹1.00. Encapsulation: the balance is a read-only property, so the −380 accident of section 01 is impossible. ABC: a generic <code>Account</code> cannot be created, because it does not say what happens at month end.</p>
  <table class="tbl"><caption>What each note does to PocketBank</caption>
    <tr><th>Note</th><th>Problem on PocketBank</th><th>Fix</th><th>The number</th></tr>
    <tr><td><a class="xref" data-note="py_classes">Classes &amp; Objects</a></td><td>rules skipped, typo keys, shared history list</td><td>Account class, <code>__init__</code>, properties, dataclasses</td><td>Asha 120 with history open/deposit/withdraw; Ben's 80 refused</td></tr>
    <tr><td><a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a></td><td>savings vs current; month-end ifs; 8 combination classes</td><td>subclasses, polymorphism, ABCs, composition</td><td>month end +1.2, −10, +0; 1% → 2%: 121.2 → 123.62</td></tr>
    <tr><td><a class="xref" data-note="py_dunder">Dunder Methods &amp; the Data Model</a></td><td>floats drift; objects don't print, compare or add</td><td>Money and Statement with dunder methods</td><td>₹0.30 exact; Statement len 3, balance ₹120.00</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>invariant</strong> is a rule about an object's data that must hold at every moment. PocketBank's is "balance ≥ 0" (or ≥ −overdraft limit for a current account). Most OOP machinery exists to make invariants impossible to break by accident.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not skip ahead to SOLID or design patterns before classes and inheritance feel natural. The ladder is ordered by need: each rung only makes sense once you have felt the problem of the one before.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Group Map.</b> We have the problem and the story. Which concept lives in which note, and how do the arrows between them run?</div>

  <h2 id="oo-family"><span class="num">03</span>The Group Map</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Seven ideas, three notes. Which ideas are taught where, which ones depend on which, and where do the arrows cross between notes?</p></div>
  <figure class="viz"><svg viewBox="0 0 700 300" width="700">
    <defs><marker id="oo-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="10" width="220" height="280" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.45"/><text x="120" y="28" text-anchor="middle" class="tb" font-size="11" font-weight="700">1. Classes &amp; Objects</text>
    <rect x="240" y="10" width="220" height="280" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.45"/><text x="350" y="28" text-anchor="middle" class="tb" font-size="11" font-weight="700">2. Inheritance &amp; Design</text>
    <rect x="470" y="10" width="220" height="280" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.45"/><text x="580" y="28" text-anchor="middle" class="tb" font-size="11" font-weight="700">3. Dunder Methods</text>
    <rect x="30" y="44" width="180" height="40" rx="7" class="fr sr"/><text x="120" y="68" text-anchor="middle" font-size="11">dict + functions drift</text>
    <line x1="120" y1="84" x2="120" y2="102" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="30" y="104" width="180" height="40" rx="7" class="fb sb"/><text x="120" y="122" text-anchor="middle" font-size="11">class, object, self</text><text x="120" y="137" text-anchor="middle" class="tm" font-size="9.5">__init__, attributes</text>
    <line x1="120" y1="144" x2="120" y2="162" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="30" y="164" width="180" height="40" rx="7" class="fb sb"/><text x="120" y="182" text-anchor="middle" font-size="11">3 kinds of methods</text><text x="120" y="197" text-anchor="middle" class="tm" font-size="9.5">classmethod, staticmethod</text>
    <line x1="120" y1="204" x2="120" y2="222" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="30" y="224" width="180" height="50" rx="7" class="ft st"/><text x="120" y="244" text-anchor="middle" font-size="11">encapsulation</text><text x="120" y="260" text-anchor="middle" class="tm" font-size="9.5">_ / __, @property, dataclass</text>
    <line x1="210" y1="124" x2="258" y2="64" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="260" y="44" width="180" height="40" rx="7" class="fb sb"/><text x="350" y="62" text-anchor="middle" font-size="11">inheritance, super()</text><text x="350" y="77" text-anchor="middle" class="tm" font-size="9.5">Savings, Current</text>
    <line x1="350" y1="84" x2="350" y2="102" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="260" y="104" width="180" height="40" rx="7" class="fb sb"/><text x="350" y="122" text-anchor="middle" font-size="11">polymorphism</text><text x="350" y="137" text-anchor="middle" class="tm" font-size="9.5">duck typing, Protocol</text>
    <line x1="350" y1="144" x2="350" y2="162" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="260" y="164" width="180" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="350" y="182" text-anchor="middle" font-size="11">ABCs, MRO, mixins</text><text x="350" y="197" text-anchor="middle" class="tm" font-size="9.5">contracts, C3</text>
    <line x1="350" y1="204" x2="350" y2="222" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="260" y="224" width="180" height="50" rx="7" class="ft st"/><text x="350" y="244" text-anchor="middle" font-size="11">composition, SOLID</text><text x="350" y="260" text-anchor="middle" class="tm" font-size="9.5">strategy, factory, observer</text>
    <line x1="440" y1="124" x2="488" y2="64" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="490" y="44" width="180" height="40" rx="7" class="fb sb"/><text x="580" y="62" text-anchor="middle" font-size="11">data model lookup</text><text x="580" y="77" text-anchor="middle" class="tm" font-size="9.5">type(x).__len__(x)</text>
    <line x1="580" y1="84" x2="580" y2="102" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="490" y="104" width="180" height="40" rx="7" class="fb sb"/><text x="580" y="122" text-anchor="middle" font-size="11">repr, eq, hash, order</text><text x="580" y="137" text-anchor="middle" class="tm" font-size="9.5">Money as a value</text>
    <line x1="580" y1="144" x2="580" y2="162" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="490" y="164" width="180" height="40" rx="7" class="fb sb"/><text x="580" y="182" text-anchor="middle" font-size="11">arithmetic operators</text><text x="580" y="197" text-anchor="middle" class="tm" font-size="9.5">__add__, __radd__</text>
    <line x1="580" y1="204" x2="580" y2="222" stroke="currentColor" marker-end="url(#oo-a1)"/>
    <rect x="490" y="224" width="180" height="50" rx="7" class="fg sg"/><text x="580" y="244" text-anchor="middle" font-size="11">containers, call, with</text><text x="580" y="260" text-anchor="middle" class="tm" font-size="9.5">Statement, fee rule, Atomic</text>
  </svg><figcaption>Each dashed box is one note; arrows inside a box are the order of its sections. The two long arrows are the hand-overs: classes and attributes make inheritance possible; polymorphism (duck typing) is what the data model applies to all of Python's syntax.</figcaption></figure>
  <p>Read the picture left to right. Note 1 ends with a protected, well-shaped class. Note 2 takes that class and asks how many classes share and vary code. Note 3 takes the idea of duck typing from note 2, "Python only cares which methods exist", and shows that the whole language works that way: <code>+</code>, <code>len</code>, <code>for</code> and <code>with</code> are polymorphic calls to dunder methods.</p>
  <div class="callout def"><span class="label">Definition</span><p>The three hand-overs to remember: <strong>class → inheritance</strong> (a class can be the parent of another), <strong>inheritance → polymorphism</strong> (overridden methods make one call behave many ways), <strong>polymorphism → data model</strong> (syntax is a polymorphic call to <code>type(x).__op__</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The map is not a ranking. Dunder methods are not "more advanced" than SOLID; <code>__repr__</code> and <code>__eq__</code> are needed in your first week of real code. Read the notes in order, but expect to come back to each.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Guide.</b> The picture shows where each concept lives. What will each note let you do, and how long is it?</div>

  <h2 id="oo-guide"><span class="num">04</span>Reading Guide</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>In what order should the notes be read, and what should you be able to do after each one?</p></div>
  <div class="cards">
    <div><b>1. <a class="xref" data-note="py_classes">Classes &amp; Objects</a></b><p>From dict to class; what <code>self</code> really is (<code>asha.deposit(50)</code> → <code>Account.deposit(asha, 50)</code>); <code>__init__</code> traced from <code>{}</code>; instance vs class attributes and the shared-list trap; instance, class and static methods; encapsulation with <code>_</code> and <code>__</code>; <code>@property</code> with validation; dataclasses.</p><small>After it: write a class with a protected invariant and explain every line.</small></div>
    <div><b>2. <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a></b><p>Subclassing; overriding and <code>super()</code> traced; polymorphism and the template method; duck typing and Protocols; ABCs; mixins and the MRO worked by hand with C3; composition with a worked refactor; SOLID each on PocketBank; strategy, factory, observer, singleton.</p><small>After it: design a small class family and defend each choice.</small></div>
    <div><b>3. <a class="xref" data-note="py_dunder">Dunder Methods &amp; the Data Model</a></b><p>How syntax becomes <code>type(x).__op__(x)</code>; <code>__repr__</code>/<code>__str__</code>; <code>__eq__</code>/<code>__hash__</code> and why one removes the other; ordering with <code>total_ordering</code>; arithmetic, <code>NotImplemented</code> and <code>__radd__</code>; the container protocol; <code>__call__</code>; <code>__enter__</code>/<code>__exit__</code>.</p><small>After it: make your own type work with <code>print</code>, <code>==</code>, sets, <code>sorted</code>, <code>sum</code>, <code>len</code>, <code>for</code>.</small></div>
  </div>
  <p>Order matters: note 2 starts from the Account built at the end of note 1, and note 3 extends Money with <code>class Money(Money)</code> (inheritance from note 2) and stores rows in a dataclass (note 1). After the group, continue with <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> (the full story of <code>__iter__</code>), <a class="xref" data-note="py_decorators">Decorators</a> (how <code>@property</code>, <code>@classmethod</code> and <code>@dataclass</code> work inside) and <a class="xref" data-note="py_context">Context Managers</a> (<code>with</code> in depth).</p>
  <div class="callout trap"><span class="label">Trap</span><p>Reading without running teaches little. Each note's code blocks are complete; type them, change a number, and predict the output before you run it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Four Pillars, Placed.</b> Interviews and textbooks talk about "the four pillars of OOP". Where does each sit on our map, and how do they show up in libraries you already use?</div>

  <h2 id="oo-pillars"><span class="num">05</span>The Four Pillars, Placed on the Map</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>"Encapsulation, abstraction, inheritance, polymorphism" is the most common OOP interview opener. How does each pillar map onto the needs in our ladder, and which pair do people confuse?</p></div>
  <table class="tbl">
    <tr><th>Pillar</th><th>Plain words</th><th>Need it answers on PocketBank</th><th>Python tools</th><th>Taught in</th></tr>
    <tr><td><b>Encapsulation</b></td><td>hide the DATA; change it only through methods</td><td>no one can set <code>asha.balance = -500</code></td><td><code>_x</code>, <code>__x</code>, <code>@property</code></td><td><a class="xref" data-note="py_classes">Classes &amp; Objects</a></td></tr>
    <tr><td><b>Abstraction</b></td><td>hide the COMPLEXITY; show a small interface</td><td>month-end job needs only <code>interest()</code> and <code>fee()</code></td><td>ABC, <code>@abstractmethod</code>, Protocol</td><td><a class="xref" data-note="py_inheritance">Inheritance</a></td></tr>
    <tr><td><b>Inheritance</b></td><td>a child reuses a parent's code (is-a)</td><td>SavingsAccount reuses deposit/withdraw</td><td><code>class Child(Parent)</code>, <code>super()</code></td><td><a class="xref" data-note="py_inheritance">Inheritance</a></td></tr>
    <tr><td><b>Polymorphism</b></td><td>same call, behaviour depends on the type</td><td>one month-end loop for every account type</td><td>overriding, duck typing, dunder methods</td><td><a class="xref" data-note="py_inheritance">Inheritance</a>, <a class="xref" data-note="py_dunder">Dunder Methods</a></td></tr>
  </table>
  <p>The pillars are design habits, not Python rules: Python lets you ignore all four. And modern Python adds two habits the pillars leave out: <strong>composition</strong> (prefer has-a over is-a) and <strong>value semantics through dunder methods</strong> (make your types behave like built-ins).</p>
  <h3>You already use OOP every day</h3>
  <table class="tbl">
    <tr><th>Library code</th><th>OOP idea</th></tr>
    <tr><td><code>model = LogisticRegression(C=1.0)</code>; <code>model.fit(X, y)</code></td><td>object built from a class; a method changes its state (learnt coefficients)</td></tr>
    <tr><td>every sklearn estimator has <code>fit</code>/<code>predict</code></td><td>polymorphism and duck typing: <code>cross_val_score</code> accepts any of them</td></tr>
    <tr><td><code>Pipeline([("scale", StandardScaler()), ("clf", SVC())])</code></td><td>composition: a pipeline has steps</td></tr>
    <tr><td><code>class Net(nn.Module)</code> with <code>forward</code>; called as <code>net(x)</code></td><td>inheritance + template method; <code>__call__</code></td></tr>
    <tr><td><code>df["col"]</code>, <code>len(df)</code>, <code>df1 + df2</code></td><td>dunder methods: <code>__getitem__</code>, <code>__len__</code>, <code>__add__</code></td></tr>
    <tr><td><code>with open(path) as f:</code></td><td><code>__enter__</code>/<code>__exit__</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>four pillars of OOP</strong>: encapsulation (bundling state with behaviour and restricting direct access), abstraction (exposing essential operations, hiding implementation), inheritance (deriving new classes from existing ones), polymorphism (one interface, many implementations).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The most-asked mix-up: <strong>encapsulation</strong> protects data (who may change it), <strong>abstraction</strong> simplifies the interface (what a caller must know). A class can have one without the other.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One table should now hold the whole group: each concept, what it is built from, which question it answers and its value on PocketBank.</div>

  <h2 id="oo-connect"><span class="num">06</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Can every OOP concept in the group be placed in one table, each built from the previous ones and each with a number on PocketBank?</p></div>
  <figure class="viz"><svg viewBox="0 0 700 120" width="700">
    <defs><marker id="oo-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="20" width="90" height="56" rx="7" class="fr sr"/><text x="50" y="44" text-anchor="middle" font-size="10.5" font-weight="700">drift</text><text x="50" y="60" text-anchor="middle" class="tm" font-size="9.5">Asha −380</text>
    <line x1="95" y1="48" x2="103" y2="48" stroke="currentColor" marker-end="url(#oo-a2)"/>
    <rect x="105" y="20" width="90" height="56" rx="7" class="fb sb"/><text x="150" y="44" text-anchor="middle" font-size="10.5" font-weight="700">class/object</text><text x="150" y="60" text-anchor="middle" class="tm" font-size="9.5">Asha 120</text>
    <line x1="195" y1="48" x2="203" y2="48" stroke="currentColor" marker-end="url(#oo-a2)"/>
    <rect x="205" y="20" width="90" height="56" rx="7" class="fb sb"/><text x="250" y="44" text-anchor="middle" font-size="10.5" font-weight="700">encapsulate</text><text x="250" y="60" text-anchor="middle" class="tm" font-size="9.5">read-only</text>
    <line x1="295" y1="48" x2="303" y2="48" stroke="currentColor" marker-end="url(#oo-a2)"/>
    <rect x="305" y="20" width="90" height="56" rx="7" class="ft st"/><text x="350" y="44" text-anchor="middle" font-size="10.5" font-weight="700">inherit</text><text x="350" y="60" text-anchor="middle" class="tm" font-size="9.5">121.2, −30</text>
    <line x1="395" y1="48" x2="403" y2="48" stroke="currentColor" marker-end="url(#oo-a2)"/>
    <rect x="405" y="20" width="90" height="56" rx="7" class="ft st"/><text x="450" y="44" text-anchor="middle" font-size="10.5" font-weight="700">polymorph</text><text x="450" y="60" text-anchor="middle" class="tm" font-size="9.5">+1.2, −10</text>
    <line x1="495" y1="48" x2="503" y2="48" stroke="currentColor" marker-end="url(#oo-a2)"/>
    <rect x="505" y="20" width="90" height="56" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="550" y="44" text-anchor="middle" font-size="10.5" font-weight="700">dunder</text><text x="550" y="60" text-anchor="middle" class="tm" font-size="9.5">₹0.30 exact</text>
    <line x1="595" y1="48" x2="603" y2="48" stroke="currentColor" marker-end="url(#oo-a2)"/>
    <rect x="605" y="20" width="90" height="56" rx="7" class="fg sg"/><text x="650" y="44" text-anchor="middle" font-size="10.5" font-weight="700">design</text><text x="650" y="60" text-anchor="middle" class="tm" font-size="9.5">ABC, compose</text>
    <text x="350" y="104" text-anchor="middle" class="tm" font-size="10.5">each box fixes the weakness of the box to its left; the grey number is PocketBank after that fix</text>
  </svg><figcaption>The need chain of the group in one line.</figcaption></figure>
  <table class="tbl"><caption>The whole group on one table</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on PocketBank</th><th>When to use</th></tr>
    <tr><td>Class &amp; object</td><td>a type definition + calls to it</td><td>how to keep data and rules together?</td><td>asha 120, ben 50; ben's 80 refused</td><td>data with rules or behaviour</td></tr>
    <tr><td><code>self</code>, <code>__init__</code></td><td>bound methods; <code>__new__</code> + initialiser</td><td>which object? how is it filled?</td><td><code>Account.deposit(asha, 50)</code>; <code>{}</code> → owner, balance</td><td>every class</td></tr>
    <tr><td>Instance vs class attributes</td><td>object dict, class dict, lookup order</td><td>per object or shared?</td><td>class-level history leaked Asha's deposit to Ben</td><td>class attrs for constants</td></tr>
    <tr><td>Encapsulation &amp; properties</td><td>methods + <code>_</code>/<code>__</code> + <code>@property</code></td><td>how to protect the invariant?</td><td><code>asha.balance = …</code> → AttributeError</td><td>any invariant</td></tr>
    <tr><td>Inheritance &amp; <code>super()</code></td><td>classes + lookup through parents</td><td>reuse and specialise?</td><td>Savings 120 → 121.2; Current −30</td><td>a true is-a</td></tr>
    <tr><td>Polymorphism &amp; duck typing</td><td>overriding + dynamic dispatch</td><td>one code path for many types?</td><td>month end +1.2, −10, +0; GiftCard 25 → 24</td><td>replace isinstance chains</td></tr>
    <tr><td>ABCs &amp; MRO</td><td>inheritance + abstract methods; C3</td><td>enforce the interface? order with several parents?</td><td>FixedDeposit without <code>fee</code> refused; Premium → Overdraft → Rewards → Account</td><td>own class families; mixins</td></tr>
    <tr><td>Composition, SOLID, patterns</td><td>objects holding objects</td><td>combine and swap behaviours; keep code changeable?</td><td>8 classes avoided; 1% → 2% on one object: 123.62</td><td>default design choice</td></tr>
    <tr><td>Dunder methods</td><td>polymorphism applied to syntax: <code>type(x).__op__(x)</code></td><td>behave like built-in values?</td><td>₹0.10 + ₹0.20 == ₹0.30; Statement len 3, ₹120.00</td><td>value types, containers</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the group: <strong>a class bundles data with the only methods allowed to change it; encapsulation protects that bundle, inheritance reuses it, polymorphism lets one piece of code use every variant, dunder methods let the bundle plug into Python's own syntax, and ABCs, composition and SOLID keep many such bundles well-designed.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The mistakes that appear most often across the whole group.</div>

  <h2 id="oo-traps"><span class="num">07</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Across all three notes, which mistakes are made most often, and where is each one explained?</p></div>
  <div class="callout trap"><span class="label">Trap: mutable class attributes</span><p><code>history = []</code> in the class body is shared by every object. Create it in <code>__init__</code>. (<a class="xref" data-note="py_classes">Classes &amp; Objects</a>)</p></div>
  <div class="callout trap"><span class="label">Trap: treating <code>__x</code> as security</span><p>It is renamed to <code>_Class__x</code>, not hidden. (<a class="xref" data-note="py_classes">Classes &amp; Objects</a>)</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting <code>super().__init__()</code></span><p>The parent's attributes never get set; the error appears later. (<a class="xref" data-note="py_inheritance">Inheritance</a>)</p></div>
  <div class="callout trap"><span class="label">Trap: inheritance for has-a, and children that break promises</span><p>An account is not a list; a fixed deposit that refuses <code>withdraw</code> is not a safe Account. Use composition. (<a class="xref" data-note="py_inheritance">Inheritance</a>)</p></div>
  <div class="callout trap"><span class="label">Trap: <code>__eq__</code> without <code>__hash__</code></span><p>Objects become unhashable. Hash the same fields, on immutable objects. (<a class="xref" data-note="py_dunder">Dunder Methods</a>)</p></div>
  <div class="callout trap"><span class="label">Trap: floats for money</span><p>0.1 + 0.2 != 0.3. Store integer paise (or <code>Decimal</code>) in a value type. (<a class="xref" data-note="py_dunder">Dunder Methods</a>)</p></div>
  <div class="callout trap"><span class="label">Trap: a class for everything</span><p>Classes with one method and no state are usually just functions. OOP is a tool for data with rules.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole group, condensed to one page.</div>

  <h2 id="oo-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole Object-Oriented Python group on one sheet. Running example: <strong>PocketBank</strong>. Asha: ₹100 + 50 − 30 = ₹120; savings 1% → ₹121.20. Ben: ₹50; withdrawing 80 is refused by a plain account; a current account (overdraft 100) goes to −₹30, fee ₹10 → −₹40. Money in paise: ₹0.10 + ₹0.20 == ₹0.30.</p>
  <h3>The need chain</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Answer on PocketBank</th><th>Weakness → next</th></tr>
    <tr><td>Dicts + functions</td><td>store accounts and rules?</td><td>works through the functions (120)</td><td>rules skipped (−380), typo keys</td></tr>
    <tr><td>Class &amp; object</td><td>bundle data with rules?</td><td><code>Account</code>; <code>asha.deposit(50)</code> = <code>Account.deposit(asha, 50)</code></td><td>attributes still writable</td></tr>
    <tr><td>Encapsulation</td><td>protect the invariant?</td><td><code>_balance</code> + read-only <code>balance</code> property</td><td>need variants of Account</td></tr>
    <tr><td>Inheritance</td><td>reuse and specialise?</td><td>SavingsAccount 121.2, CurrentAccount −30</td><td>ifs per type in callers</td></tr>
    <tr><td>Polymorphism</td><td>one code path, many types?</td><td>month end +1.2, −10, +0; GiftCard via duck typing</td><td>values don't add or compare</td></tr>
    <tr><td>Dunder methods</td><td>act like built-ins?</td><td>Money exact; Statement len 3, ₹120.00</td><td>design at scale?</td></tr>
    <tr><td>Contracts &amp; design</td><td>enforce and keep changeable?</td><td>ABC refuses incomplete types; policies replace 8 classes</td><td>(the group is complete)</td></tr>
  </table>
  <h3>The core rules</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Form</th><th>Meaning</th></tr>
    <tr><td>Method call</td><td><code>obj.m(a)</code> ≡ <code>type(obj).m(obj, a)</code></td><td><code>self</code> is the object</td></tr>
    <tr><td>Creation</td><td><code>C(a)</code>: <code>__new__</code> then <code>__init__</code></td><td>make empty, then fill</td></tr>
    <tr><td>Lookup</td><td>instance → class → parents in <code>__mro__</code></td><td>writes go to the instance</td></tr>
    <tr><td>MRO</td><td>C3: child first, parents left to right, each once</td><td><code>super()</code> = next in the MRO</td></tr>
    <tr><td>Syntax</td><td><code>len(x)</code> ≡ <code>type(x).__len__(x)</code></td><td>dunders on the class</td></tr>
    <tr><td>Hashing</td><td><code>a == b</code> ⇒ <code>hash(a) == hash(b)</code></td><td><code>__eq__</code> alone removes <code>__hash__</code></td></tr>
  </table>
  <h3>When to use what</h3>
  <div class="cards">
    <div><b>Functions only</b><p>Short scripts, stateless transformations.</p><small>Move to a class when data gains rules</small></div>
    <div><b>Class + properties</b><p>Data with an invariant (an account).</p><small>@dataclass for plain records</small></div>
    <div><b>Inheritance</b><p>A true is-a that keeps every promise of the parent.</p><small>Shallow; never for has-a</small></div>
    <div><b>Composition</b><p>Combine or swap behaviours (policies, notifiers).</p><small>The default choice</small></div>
    <div><b>ABC / Protocol</b><p>Enforce an interface for your classes / accept any matching object.</p><small>Runtime Protocol checks names only</small></div>
    <div><b>Dunder methods</b><p>Value types and containers that should feel built-in.</p><small>Always <code>__repr__</code></small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Mutable class attributes; <code>__x</code> is not security; forgetting <code>super().__init__()</code>; inheriting for has-a; children breaking parent promises (LSP); <code>__eq__</code> without <code>__hash__</code>; floats for money; encapsulation ≠ abstraction; classes where a function would do.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>What does Python run for <code>asha.deposit(50)</code>?</td><td><code>Account.deposit(asha, 50)</code>.</td></tr>
    <tr><td>Which pillar stops <code>asha.balance = -500</code>, and with which tool?</td><td>Encapsulation: data in <code>_balance</code>, exposed by a read-only <code>@property</code>.</td></tr>
    <tr><td>Why can one loop run month end for savings, current and gift cards?</td><td>Polymorphism: each has <code>month_end</code>; Python dispatches on the object's type and needs no common parent (duck typing).</td></tr>
    <tr><td>Why is <code>Money(10) + Money(20) == Money(30)</code> True but <code>0.1 + 0.2 == 0.3</code> False?</td><td>Money stores whole paise (exact ints) and defines <code>__add__</code> and <code>__eq__</code>; floats are binary approximations.</td></tr>
    <tr><td>Inheritance or composition for "account with a cashback feature"?</td><td>Composition: the account has a cashback policy; avoids a class per combination and allows swapping.</td></tr>
  </table>

  <h2 id="oo-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Tell the OOP story in five sentences, from dicts to SOLID.</summary><div class="qa-body">Dicts plus functions let data and its rules drift apart, so a class bundles them and each object carries its own data. Encapsulation keeps the data changeable only through methods that keep the invariant. Inheritance reuses a class for variants, and polymorphism lets one piece of code handle every variant (in Python, anything with the right methods). Dunder methods extend that polymorphism to Python's syntax, so our objects print, compare and add like built-ins. ABCs, composition and SOLID keep a growing set of classes enforceable and easy to change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the four pillars and give a PocketBank example of each.</summary><div class="qa-body">Encapsulation: <code>_balance</code> behind a read-only property. Abstraction: the month-end job needs only <code>interest()</code> and <code>fee()</code>, enforced by an ABC. Inheritance: <code>SavingsAccount(Account)</code>. Polymorphism: <code>acc.month_end()</code> gives +1.2 for Asha and −10 for Ben.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Encapsulation vs abstraction?</summary><div class="qa-body">Encapsulation hides data and controls who changes it. Abstraction hides complexity behind a small interface and controls what callers need to know. One protects state, the other simplifies use.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use a class?</summary><div class="qa-body">When there is no state with rules: a stateless transformation is a function; a bag of fields is a dataclass or a dict; a single-method class with only <code>__init__</code> is usually a function or a closure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does polymorphism need inheritance in Java but not in Python?</summary><div class="qa-body">Java checks types when compiling, so a variable of type Account accepts only Accounts and their subclasses. Python looks up the method on the object's type when the call runs, so any object with the method works (duck typing). Inheritance in Python is for sharing code; ABCs and Protocols add checking back when you want it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is <code>len(x)</code> related to <code>asha.deposit(50)</code>?</summary><div class="qa-body">Both find a function on the type and pass the object in: <code>asha.deposit(50)</code> → <code>Account.deposit(asha, 50)</code>, <code>len(x)</code> → <code>type(x).__len__(x)</code>. The data model is the method-call rule from Classes &amp; Objects applied to Python's syntax.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip encapsulation but use inheritance heavily?</summary><div class="qa-body">Children and outside code reach into the parent's raw data, so the parent can no longer change how it stores things without breaking them (fragile base class), and any caller can still break the invariant (Asha at −380). Encapsulation is what makes a class safe to build on.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is composition introduced after inheritance rather than instead of it?</summary><div class="qa-body">Its value is only visible once inheritance's limits are felt: one class per combination (8 for three features), behaviour fixed when the object is created, parents that cannot change without breaking children. Composition answers those exact problems, while inheritance remains right for a true is-a.</div></details>
</main>
`
});
