// notes/python/py_oop.js — OOP Concepts in Python
Object.assign(TOPIC_CONTENT, {
  "py_oop": `<main>
<h1>OOP Concepts in Python</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>OOP Concepts in Python</span></div>
  <p class="lead"><strong>OOP (object-oriented programming)</strong> → organise code around <b>objects</b>, each bundling its <b>data</b> with the <b>actions</b> on that data. One small bank program (accounts, deposits, withdrawals) runs through the whole note: first where code without OOP breaks, then classes and objects, then the four pillars.</p>

  <h2 id="oo-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">OOP in Python</div>
    <div class="mm-branches">
      <div class="mm-branch"><div class="mm-title">Why OOP</div><ul>
        <li>data (dicts) + rules (functions) apart → rules skippable</li>
        <li>OOP → data + rules together in one object</li></ul></div>
      <div class="mm-branch"><div class="mm-title">Class &amp; object</div><ul>
        <li>class = blueprint; object = thing built from it</li>
        <li>attribute = data; method = action</li>
        <li><code>__init__</code> sets up; <code>self</code> = this object</li></ul></div>
      <div class="mm-branch"><div class="mm-title">Four pillars</div><ul>
        <li>Encapsulation → protect data</li>
        <li>Abstraction → hide complexity</li>
        <li>Inheritance → reuse a class (is-a)</li>
        <li>Polymorphism → same call, own behaviour</li></ul></div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="oo-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why OOP Exists</span><span class="rm-sub">where code without OOP breaks</span></div></div>
      <div class="rm-item rm-done" data-target="oo-class"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Classes and Objects</span><span class="rm-sub">blueprint, __init__, self, methods</span></div></div>
      <div class="rm-item rm-done" data-target="oo-pillars"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Four Pillars</span><span class="rm-sub">what they are, one table</span></div></div>
      <div class="rm-item rm-done" data-target="oo-encap"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Encapsulation</span><span class="rm-sub">protect the data</span></div></div>
      <div class="rm-item rm-done" data-target="oo-abstr"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Abstraction</span><span class="rm-sub">simple outside, hidden inside</span></div></div>
      <div class="rm-item rm-done" data-target="oo-inherit"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Inheritance</span><span class="rm-sub">reuse and extend a class</span></div></div>
      <div class="rm-item rm-done" data-target="oo-poly"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Polymorphism</span><span class="rm-sub">one call, many behaviours</span></div></div>
      <div class="rm-item rm-done" data-target="oo-all"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">All Four Together</span><span class="rm-sub">the finished bank program</span></div></div>
      <div class="rm-item rm-done" data-target="oo-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">symptom → fix</span></div></div>
      <div class="rm-item rm-done" data-target="oo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions and syntax</span></div></div>
      <div class="rm-item rm-done" data-target="oo-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">short answers</span></div></div>
    </div>
  </div>

  <h2 id="oo-why"><span class="num">01</span>Why OOP Exists</h2>
  <ul class="tree">
    <li><b>The job</b> → a tiny bank: each customer has a name + balance; rules → deposit any time, never withdraw more than you have</li>
    <li><b>Plain variables</b> → <code>asha_balance</code>, <code>ben_balance</code>, … → 2,000 customers = 4,000 variables, rules repeated everywhere ✗</li>
    <li><b>Dict per customer + functions for the rules</b> → better, rules written once
      <ul>
        <li>works only if everyone calls <code>withdraw()</code></li>
        <li>direct edit skips the rule → balance −300, no error ✗</li>
        <li>typo <code>"balanse"</code> → silently adds a junk key ✗</li>
      </ul></li>
    <li><b>Root cause</b> → data (dicts) and rules (functions) live apart → nothing forces code through the rules</li>
    <li><b>Think of</b> → balances on loose paper in a bank lobby → anyone can edit; a real bank locks each record → only a cashier who checks the rules can change it</li>
    <li><b>OOP's answer</b> → bundle data + its rules into one <strong>object</strong> → to change the data you must ask the object</li>
  </ul>
  <div class="fx" data-lang="py">def withdraw(acc, amount):
    if amount &gt; acc["balance"]:
        print("Not enough money"); return
    acc["balance"] -= amount

ben = {"name": "Ben", "balance": 500}
withdraw(ben, 800)            # → Not enough money
ben["balance"] -= 800         # skips the rule
ben["balanse"] = 0            # typo: new key, no error
print(ben)                    # → {'name': 'Ben', 'balance': -300, 'balanse': 0}</div>

  <h2 id="oo-class"><span class="num">02</span>Classes and Objects</h2>
  <ul class="tree">
    <li><strong>Class</strong> = blueprint → describes what data and actions its objects have</li>
    <li><strong>Object</strong> (= <strong>instance</strong>) = one thing built from a class, with its own copy of the data</li>
    <li><b>Think of</b> → one house blueprint → many houses: same layout, each its own owner and paint; painting one ≠ painting the others</li>
  </ul>
  <table class="tbl tight"><caption>Houses → OOP → bank</caption>
    <tr><th>House</th><th>OOP term</th><th>Bank</th><th>Python</th></tr>
    <tr><td>blueprint</td><td>class</td><td>"a bank account"</td><td><code>class BankAccount:</code></td></tr>
    <tr><td>one house</td><td>object / instance</td><td>Asha's account</td><td><code>BankAccount("Asha", 1000)</code></td></tr>
    <tr><td>owner, colour</td><td>attributes (data)</td><td>owner, balance</td><td><code>self.balance</code></td></tr>
    <tr><td>open door</td><td>methods (actions)</td><td>deposit, withdraw</td><td><code>def deposit(self, …)</code></td></tr>
  </table>
  <ul class="tree">
    <li><code>__init__</code> → special method, runs <b>automatically</b> on every <code>BankAccount(...)</code> → sets the starting attributes → called the <strong>constructor</strong></li>
    <li><code>asha = BankAccount("Asha", 1000)</code>, step by step
      <ul>
        <li>Python creates an empty object</li>
        <li>→ calls <code>__init__(new_object, "Asha", 1000)</code></li>
        <li>→ <code>self.owner = owner</code> stores the value on <b>this</b> object</li>
        <li>→ returns the object → named <code>asha</code></li>
      </ul></li>
    <li><strong>self</strong> = the object being worked on right now</li>
    <li><strong>Method</strong> = function inside the class → an action every object can do → the rules now live <b>with</b> the data</li>
    <li><code>ben.deposit(50)</code> ⇔ <code>BankAccount.deposit(ben, 50)</code> → the object before the dot is passed in as <code>self</code> → why every method starts with <code>self</code></li>
  </ul>
  <div class="fx" data-lang="py">class BankAccount:                       # class = blueprint
    def __init__(self, owner, balance):  # runs on every BankAccount(...)
        self.owner = owner               # attributes: stored on THIS object
        self.balance = balance

    def deposit(self, amount):           # method = action
        self.balance += amount

    def withdraw(self, amount):
        if amount &gt; self.balance:
            print("Not enough money"); return
        self.balance -= amount

asha = BankAccount("Asha", 1000)         # object 1
ben = BankAccount("Ben", 500)            # object 2: own data
asha.deposit(200)
ben.withdraw(800)                        # → Not enough money
print(asha.balance, ben.balance)         # → 1200 500
BankAccount.deposit(ben, 50)             # what ben.deposit(50) really runs
print(ben.balance)                       # → 550
print(asha is ben)                       # → False</div>
  <ul class="tree">
    <li><b>Still open</b> → nothing stops <code>ben.balance = -300</code> → pillar 1 fixes it</li>
  </ul>

  <h2 id="oo-pillars"><span class="num">03</span>The Four Pillars</h2>
  <ul class="tree">
    <li><strong>Four pillars</strong> = the four main ideas OOP rests on → classes/objects are the bricks, pillars are how to use them well</li>
    <li>each pillar → solves one recurring problem</li>
  </ul>
  <table class="tbl tight"><caption>The pillars at a glance (car analogy in the last column)</caption>
    <tr><th>Pillar</th><th>Meaning</th><th>Problem it solves</th><th>In a car</th></tr>
    <tr><td><b>Encapsulation</b></td><td>data changes only via the object's methods</td><td>outside code breaking the rules</td><td>engine sealed; speed only via the pedal</td></tr>
    <tr><td><b>Abstraction</b></td><td>show what's needed, hide how</td><td>objects too complex to use</td><td>drive with wheel + pedals, no engine knowledge</td></tr>
    <tr><td><b>Inheritance</b></td><td>new class built on an existing one</td><td>copy-pasted similar classes</td><td>electric car is a car + battery</td></tr>
    <tr><td><b>Polymorphism</b></td><td>same call, each object responds its own way</td><td>if/elif chains on type</td><td>same pedal → petrol burns fuel, electric uses battery</td></tr>
  </table>

  <h2 id="oo-encap"><span class="num">04</span>Encapsulation</h2>
  <ul class="tree">
    <li><strong>Encapsulation</strong> = keep an object's data inside it → changeable <b>only</b> through its own methods → its rules always run</li>
    <li>name ← "capsule" → wraps the powder; you never touch it directly</li>
    <li><b>Think of</b> → bank vault (data) + cashier (method) who checks the rules before changing your balance</li>
    <li><b>Problem</b> → <code>ben.balance = -300</code> walks past <code>withdraw</code></li>
    <li><b>Fix in Python</b>
      <ul>
        <li><code>balance</code> → <code>_balance</code> → leading <code>_</code> = "internal, don't touch" (convention)</li>
        <li><code>@property def balance</code> → read like an attribute; no setter → assignment raises <code>AttributeError</code></li>
        <li>→ every change goes through <code>deposit</code>/<code>withdraw</code> → the <strong>invariant</strong> (a rule that must always hold: balance ≥ 0) is safe</li>
      </ul></li>
  </ul>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance          # _ → internal, use the methods

    @property
    def balance(self):                   # read like an attribute, no setter
        return self._balance

    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("Not enough money")
        self._balance -= amount

ben = BankAccount("Ben", 500)
print(ben.balance)                       # → 500
try:
    ben.balance = -300                   # direct write refused
except AttributeError as e:
    print(e)                             # → property 'balance' of 'BankAccount' object has no setter
try:
    ben.withdraw(5000)                   # every change runs the rule
except ValueError as e:
    print(e)                             # → Not enough money</div>
  <ul class="tree">
    <li><b>How private is private?</b> → Python has no <code>private</code> keyword ("consenting adults")
      <ul>
        <li><code>_x</code> → private by agreement only</li>
        <li><code>__x</code> → <strong>name mangling</strong> → renamed <code>_ClassName__x</code> → stops subclass name clashes, still reachable</li>
      </ul></li>
  </ul>
  <div class="fx" data-lang="py">class Demo:
    def __init__(self):
        self._internal = 1               # convention only
        self.__secret = 2                # renamed to _Demo__secret

d = Demo()
print(d._internal)                       # → 1
print(hasattr(d, "__secret"))            # → False
print(d._Demo__secret)                   # → 2</div>

  <h2 id="oo-abstr"><span class="num">05</span>Abstraction</h2>
  <ul class="tree">
    <li><strong>Abstraction</strong> = show only what's needed to <b>use</b> an object, hide <b>how</b> it works</li>
    <li><b>Think of</b> → ATM: a few buttons; behind "Withdraw" → PIN check, bank server, balance check, note counting</li>
    <li><b>Form 1: simple public methods + hidden helpers</b>
      <ul>
        <li><code>transfer()</code> = the button → hides checking, moving money, logging</li>
        <li>helpers start with <code>_</code> → internal machinery</li>
        <li>→ caller writes one line; internals can change without breaking callers</li>
      </ul></li>
  </ul>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner, self._balance = owner, balance

    def _check(self, amount):                 # hidden helper
        if amount &lt;= 0 or amount &gt; self._balance:
            raise ValueError("Invalid amount")

    def _log(self, text):                     # hidden helper
        print("[log]", text)

    def transfer(self, other, amount):        # the one simple "button"
        self._check(amount)
        self._balance -= amount
        other._balance += amount
        self._log(f"{self.owner} → {other.owner}: {amount}")

asha, ben = BankAccount("Asha", 1000), BankAccount("Ben", 500)
asha.transfer(ben, 300)                       # → [log] Asha → Ben: 300
print(asha._balance, ben._balance)            # → 700 800</div>
  <ul class="tree">
    <li><b>Form 2: abstract class</b> → says <b>what</b> methods every subclass must have, not <b>how</b>
      <ul>
        <li><code>class Account(ABC)</code> + <code>@abstractmethod</code> on required methods</li>
        <li>can't create an <code>Account</code> itself → it's only a contract</li>
        <li>subclass missing a required method → <code>TypeError</code> at creation → bug caught early</li>
      </ul></li>
  </ul>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Account(ABC):                 # contract: what, not how
    @abstractmethod
    def monthly_charge(self): ...

class Savings(Account):
    def monthly_charge(self):
        return 0

class Broken(Account):              # forgot monthly_charge
    pass

print(Savings().monthly_charge())   # → 0
for cls in (Account, Broken):
    try:
        cls()
    except TypeError:
        print(cls.__name__, "→ TypeError")   # → Account → TypeError
                                             # → Broken → TypeError</div>
  <ul class="tree">
    <li><b>vs encapsulation</b> (asked often)
      <ul>
        <li>encapsulation → hides <b>data</b> to <b>protect</b> it → "who may change this?" → vault + cashier</li>
        <li>abstraction → hides <b>complexity</b> to <b>simplify</b> use → "what must I know to use this?" → ATM buttons</li>
      </ul></li>
  </ul>

  <h2 id="oo-inherit"><span class="num">06</span>Inheritance</h2>
  <ul class="tree">
    <li><b>Problem</b> → savings account = normal account + interest → copy the class → two copies of deposit/withdraw → every fix made twice ✗</li>
    <li><strong>Inheritance</strong> = new <b>child</b> class built on an existing <b>parent</b> class → gets all its attributes + methods → writes only what differs</li>
    <li><b>Think of</b> → a child inherits a parent's eye colour and has traits of their own</li>
    <li><b>Test: "is a"</b> → savings account <b>is a</b> bank account ✓ · customer is a bank account ✗</li>
    <li><code>class SavingsAccount(BankAccount):</code>
      <ul>
        <li>method lookup → child first → then parent → <code>deposit</code> works without being rewritten</li>
        <li><code>super().__init__(owner, balance)</code> → reuse the parent's setup, then add <code>rate</code></li>
        <li><code>isinstance(s, BankAccount)</code> → True → usable anywhere an account is expected</li>
      </ul></li>
    <li><strong>Overriding</strong> = child redefines a parent method → child's version wins → <code>CurrentAccount.withdraw</code> allows an overdraft</li>
  </ul>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner, self._balance = owner, balance
    def deposit(self, amount):
        self._balance += amount
    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("Not enough money")
        self._balance -= amount

class SavingsAccount(BankAccount):           # is a BankAccount
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)     # parent sets owner + balance
        self.rate = rate                     # only the new part
    def add_interest(self):
        self.deposit(self._balance * self.rate)

class CurrentAccount(BankAccount):
    def __init__(self, owner, balance, overdraft):
        super().__init__(owner, balance)
        self.overdraft = overdraft
    def withdraw(self, amount):              # override: different rule
        if amount &gt; self._balance + self.overdraft:
            raise ValueError("Overdraft limit reached")
        self._balance -= amount

s = SavingsAccount("Chen", 1000, 0.04)
s.deposit(500)                               # inherited, never rewritten
s.add_interest()
print(s._balance)                            # → 1560.0
print(isinstance(s, BankAccount))            # → True
c = CurrentAccount("Dev", 500, overdraft=1000)
c.withdraw(1200)                             # plain account would refuse
print(c._balance)                            # → -700</div>
  <ul class="tree">
    <li><b>"Has a" → composition, not inheritance</b> → a customer <b>has</b> an account → store it: <code>self.account = BankAccount(...)</code> → usually the safer default (<a class="xref" data-note="py_inheritance">more</a>)</li>
  </ul>

  <h2 id="oo-poly"><span class="num">07</span>Polymorphism</h2>
  <ul class="tree">
    <li><strong>Polymorphism</strong> = "many forms" → the same call behaves differently depending on the object</li>
    <li>already used → <code>len()</code> on str/list; <code>+</code> adds numbers, joins strings</li>
    <li><b>Think of</b> → "I'll pay" → card tapped / UPI scanned / cash counted</li>
    <li><b>Problem</b> → month end differs per account type → <code>if type is …: elif …</code> → edit the chain for every new type ✗</li>
    <li><b>Fix</b> → each class defines its own <code>month_end()</code> → loop just calls it → new type = one new class, loop unchanged</li>
    <li><strong>Duck typing</strong> → Python checks "does it have the method?", not its class → an unrelated <code>Wallet</code> fits the same loop</li>
  </ul>
  <div class="fx" data-lang="py">print(len("chai"), len([10, 20, 30]))        # → 4 3
print(2 + 3, "chai" + "wala")                # → 5 chaiwala

class BankAccount:
    def __init__(self, owner, balance):
        self.owner, self._balance = owner, balance
    def month_end(self):
        pass                                 # basic: nothing

class SavingsAccount(BankAccount):
    def month_end(self):
        self._balance *= 1.04                # +4% interest

class CurrentAccount(BankAccount):
    def month_end(self):
        self._balance -= 100                 # ₹100 fee

class Wallet:                                # NOT an account (duck typing)
    def __init__(self):
        self.owner, self._balance = "Esha", 50
    def month_end(self):
        pass

things = [BankAccount("Asha", 1000), SavingsAccount("Chen", 1000),
          CurrentAccount("Dev", 1000), Wallet()]
for t in things:                             # no if/elif on type
    t.month_end()                            # each runs its own version
    print(t.owner, round(t._balance))        # → Asha 1000
                                             # → Chen 1040
                                             # → Dev 900
                                             # → Esha 50</div>

  <h2 id="oo-all"><span class="num">08</span>All Four Together</h2>
  <ul class="tree">
    <li><b>Abstraction</b> → <code>Account(ABC)</code> = contract: every account can deposit, withdraw, <code>month_end</code></li>
    <li><b>Encapsulation</b> → <code>_balance</code> changes only via methods; <code>balance</code> read-only outside</li>
    <li><b>Inheritance</b> → <code>SavingsAccount</code>, <code>CurrentAccount</code> reuse <code>Account</code>, add only rate / overdraft / own rules</li>
    <li><b>Polymorphism</b> → one loop calls <code>month_end()</code> on every account → each does its own (interest / fee)</li>
    <li>→ together: objects that guard their data, offer a simple interface, share code, and can be used interchangeably</li>
  </ul>

  <h2 id="oo-traps"><span class="num">09</span>Common Mistakes</h2>
  <table class="tbl tight">
    <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td>forgot <code>self</code> in a method</td><td>"takes 1 positional argument but 2 were given"</td><td><code>def deposit(self, amount)</code></td></tr>
    <tr><td>list in the class body</td><td>every object shares one list</td><td>create it in <code>__init__</code> on <code>self</code></td></tr>
    <tr><td>inheriting for "has a"</td><td><code>Customer(BankAccount)</code> makes no sense</td><td>composition</td></tr>
    <tr><td>class with only <code>__init__</code> + 1 method</td><td>a function in disguise</td><td>write a function</td></tr>
    <tr><td>treating <code>_x</code> as security</td><td>anyone can still read it</td><td>it's a convention, not a lock</td></tr>
  </table>
  <div class="fx" data-lang="py">class Cart:
    items = []                       # class attribute → ONE list for all carts
    def add(self, item):
        self.items.append(item)

a, b = Cart(), Cart()
a.add("chai")
print(b.items)                       # → ['chai']

class CartFixed:
    def __init__(self):
        self.items = []              # each cart gets its own list
    def add(self, item):
        self.items.append(item)

a, b = CartFixed(), CartFixed()
a.add("chai")
print(b.items)                       # → []</div>

  <h2 id="oo-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Terms</h3>
  <ul class="tree">
    <li><b>OOP</b> → data + actions bundled into objects</li>
    <li><b>class</b> → blueprint · <b>object/instance</b> → one thing built from it</li>
    <li><b>attribute</b> → data on an object · <b>method</b> → function in a class</li>
    <li><b><code>__init__</code></b> → auto-runs on creation, sets attributes · <b><code>self</code></b> → current object</li>
    <li><b>encapsulation</b> → data changes only via methods (<code>_x</code>, <code>@property</code>)</li>
    <li><b>abstraction</b> → simple interface, hidden details (<code>_helpers</code>, <code>ABC</code>)</li>
    <li><b>inheritance</b> → child reuses parent (is-a) · <b>overriding</b> → child's version wins</li>
    <li><b>polymorphism</b> → same call, own behaviour · <b>duck typing</b> → has the method = good enough</li>
    <li><b>composition</b> → object inside object (has-a) · <b>name mangling</b> → <code>__x</code> → <code>_C__x</code></li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Account(ABC):
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance
    @property
    def balance(self): return self._balance
    @abstractmethod
    def month_end(self): ...

class Savings(Account):
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)
        self.rate = rate
    def month_end(self):
        self._balance *= 1 + self.rate</div>

  <h2 id="oo-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is OOP and why use it?</summary><div class="qa-body">Organising code as objects that bundle data with the methods that work on it. Keeps rules attached to data (can't be bypassed), enables reuse (inheritance) and lets one piece of code handle many types (polymorphism).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Class vs object?</summary><div class="qa-body">Class = blueprint; object = an instance built from it with its own data. <code>BankAccount</code> is the class; <code>BankAccount("Asha", 1000)</code> is an object.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four pillars?</summary><div class="qa-body">Encapsulation (protect data), abstraction (hide complexity), inheritance (reuse a class), polymorphism (same call, different behaviour per object).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>self</code>?</summary><div class="qa-body">The object a method is called on. <code>acc.deposit(5)</code> runs <code>BankAccount.deposit(acc, 5)</code>. A convention, not a keyword.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__init__</code> a constructor?</summary><div class="qa-body">Commonly called one. Strictly, <code>__new__</code> creates the object and <code>__init__</code> initialises it (must return <code>None</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Encapsulation vs abstraction?</summary><div class="qa-body">Encapsulation hides data to protect it (changes only via methods). Abstraction hides complexity to make use simple (a few clear methods, abstract classes).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python have private variables?</summary><div class="qa-body">No enforced ones. <code>_x</code> = private by convention; <code>__x</code> is name-mangled to <code>_Class__x</code>, still reachable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@property</code> do?</summary><div class="qa-body">Makes a method readable like an attribute. No setter → read-only; with <code>@x.setter</code> → validated writes. Replaces Java-style getters/setters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an abstract class?</summary><div class="qa-body">A class listing methods subclasses must implement; can't be instantiated. Python: inherit <code>ABC</code>, mark <code>@abstractmethod</code>; missing implementations → <code>TypeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>super()</code> do?</summary><div class="qa-body">Calls the parent's version of a method, usually <code>super().__init__(...)</code> so the parent's setup runs before the child adds its own.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Overriding vs overloading?</summary><div class="qa-body">Overriding: child redefines a parent method. Overloading (same name, different parameters) isn't supported; the last <code>def</code> wins. Use defaults, <code>*args</code> or <code>singledispatch</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is polymorphism? Example?</summary><div class="qa-body">Same call, behaviour chosen by the object. <code>len()</code> on str/list/dict; <code>acc.month_end()</code> adds interest for savings, a fee for current accounts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is duck typing?</summary><div class="qa-body">Python cares whether an object has the method, not its class. Anything with <code>read()</code> works where a file is expected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Composition vs inheritance?</summary><div class="qa-body">Inheritance for "is a", composition (object stored as attribute) for "has a". Prefer composition: looser coupling, no deep hierarchies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Class attribute vs instance attribute?</summary><div class="qa-body">Instance: on <code>self</code>, per object. Class: in the class body, shared by all. A mutable class attribute (a list) is shared by every object, a classic bug.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Multiple inheritance: which method wins?</summary><div class="qa-body">Python follows the MRO (C3 order): the class, then parents left to right, each before its own parents. See <code>C.__mro__</code>.</div></details>
</main>
`
});
