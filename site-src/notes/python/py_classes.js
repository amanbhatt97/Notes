// notes/python/py_classes.js — Classes & Objects
Object.assign(TOPIC_CONTENT, {
  "py_classes": `<main>
<h1>Classes &amp; Objects</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Classes &amp; Objects</span></div>
  <p class="lead">A class defines a new type: it names the data each object carries (attributes) and the functions allowed to change it (methods), so the two cannot drift apart the way a dict and a set of loose functions do. Without classes, nothing stops code from editing a record directly and breaking its rules, and every kind of record is just an unlabelled dict. Python's class machinery is small but has sharp edges: <code>self</code> is an explicit parameter, <code>__init__</code> fills an object that already exists, class attributes are shared by every instance, and privacy is only a naming convention. Every scikit-learn estimator, PyTorch module and dataclass or pydantic config in a DS/ML codebase is built from these pieces. Code here was run on Python 3.13.</p>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Classes &amp; Objects</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Class &amp; object</div>
        <ul>
          <li><b>Class</b> — blueprint: which data, which behaviour; <b>object / instance</b> — one thing built from it</li>
          <li><b>Attribute</b> — data on an object (<code>asha.balance</code>); <b>method</b> — function on the class (<code>asha.deposit(50)</code>)</li>
          <li>Each object keeps its own data; methods are stored once, on the class</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">self</div>
        <ul>
          <li><code>asha.deposit(50)</code> → <code>Account.deposit(asha, 50)</code></li>
          <li><code>asha.deposit</code> is a <b>bound method</b> = function + object</li>
          <li><code>self</code> is only a name for the first parameter; read it as "my"</li>
          <li>⚠ Forgot <code>self</code> → "takes 0 positional arguments but 1 was given"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">__init__</div>
        <ul>
          <li><code>Account("Asha", 100)</code> = <code>__new__</code> (empty object) + <code>__init__</code> (fill it)</li>
          <li>Validate there: negative opening balance → ValueError</li>
          <li>Default arguments give optional data (<code>balance=0</code>)</li>
          <li>⚠ <code>__init__</code> must return None</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Attributes</div>
        <ul>
          <li><b>Instance</b> — in <code>vars(obj)</code>, per object; <b>class</b> — in <code>vars(Class)</code>, shared</li>
          <li>Lookup: object → class → parents</li>
          <li><code>asha.bank = "X"</code> makes a NEW instance attribute (shadowing)</li>
          <li>⚠ <code>history = []</code> on the class is shared by all accounts</li>
          <li>⚠ <code>self.count += 1</code> writes an instance attribute; use <code>Class.count</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Three kinds of methods</div>
        <ul>
          <li><b>Instance</b> (<code>self</code>) — uses this object's data</li>
          <li><b>@classmethod</b> (<code>cls</code>) — other constructors (<code>from_csv</code>), class-wide settings; returns the subclass</li>
          <li><b>@staticmethod</b> (nothing) — helper that belongs with the class</li>
          <li>⚠ Hard-coding <code>Account(...)</code> in a factory breaks subclasses; use <code>cls(...)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Encapsulation</div>
        <ul>
          <li><b>Invariant</b> — a rule that must always hold: balance ≥ 0</li>
          <li><code>_x</code> — convention "internal"; <code>__x</code> — renamed <code>_Class__x</code></li>
          <li>Mangling prevents clashes with subclasses; it is not security</li>
          <li>⚠ <code>obj.__x = …</code> from outside makes an unrelated attribute</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">@property</div>
        <ul>
          <li>Looks like an attribute, runs a method; no setter → read-only</li>
          <li>Setter validates or cleans (<code>"  asha k"</code> → <code>"Asha K"</code>)</li>
          <li>Computed values (<code>is_empty</code>)</li>
          <li>Start with a plain attribute; switch to a property later without changing callers</li>
          <li>⚠ Getter that reads <code>self.balance</code> → RecursionError; store in <code>self._balance</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dataclasses</div>
        <ul>
          <li><code>@dataclass</code> writes <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> from typed fields</li>
          <li><code>frozen=True</code> → read-only and hashable; <code>order=True</code> → sortable</li>
          <li><code>field(default_factory=list)</code>, <code>compare=False</code>, <code>__post_init__</code> for checks</li>
          <li>⚠ <code>history: list = []</code> is rejected with ValueError</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-bundle"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Defining a Class</span><span class="rm-sub">class, attributes, methods, objects</span></div></div>
      <div class="rm-item rm-done" data-target="pc-self"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">self and Bound Methods</span><span class="rm-sub">obj.m() is Class.m(obj)</span></div></div>
      <div class="rm-item rm-done" data-target="pc-init"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">__init__ and __new__</span><span class="rm-sub">create, then initialise; validation</span></div></div>
      <div class="rm-item rm-done" data-target="pc-attrs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Instance vs Class Attributes</span><span class="rm-sub">lookup order, shadowing, shared list</span></div></div>
      <div class="rm-item rm-done" data-target="pc-methods"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Instance, Class and Static Methods</span><span class="rm-sub">self, cls, alternative constructors</span></div></div>
      <div class="rm-item rm-done" data-target="pc-encap"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Encapsulation and Name Mangling</span><span class="rm-sub">_x convention, __x → _Class__x</span></div></div>
      <div class="rm-item rm-done" data-target="pc-prop"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">@property</span><span class="rm-sub">read-only, setters, computed values</span></div></div>
      <div class="rm-item rm-done" data-target="pc-dc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Dataclasses</span><span class="rm-sub">@dataclass, field(), frozen, order</span></div></div>
      <div class="rm-item rm-done" data-target="pc-example"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Worked Example: a Complete Account Class</span><span class="rm-sub">all features in one class</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">shared state, self, recursion</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">rules, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">self, __init__, attributes, dataclasses</span></div></div>
    </div>
  </div>

  <h2 id="pc-bundle"><span class="num">01</span>Defining a Class: Attributes and Methods</h2>
  <h3>Without a class: a dict and loose functions</h3>
  <p>A class keeps a piece of data and the rules for changing it together. To see why that matters, here is an account written without one: a dict for the data and functions for the rule <em>a balance can never go below zero</em>.</p>
  <div class="fx" data-lang="py"># Without a class: data in dicts, rules in loose functions
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
print("Asha after the rules:", asha["balance"])

asha["balance"] -= 500          # someone skips withdraw() ...
ben["balnce"] = 0               # ... and someone mistypes a key
print("Asha now:", asha["balance"])
print("Ben now: ", ben)</div>
  <div class="fx" data-lang="text">Asha after the rules: 120
Asha now: -380
Ben now:  {'owner': 'Ben', 'balance': 50, 'balnce': 0}</div>
  <p>The functions work: Asha's balance is 120 after the rules. Then two lines break everything without any error. The first changes the balance directly and skips the "no overdraft" check, so Asha is at −380. The second has a typo, <code>"balnce"</code>, and a dict happily makes a new key: Ben's dict now has a junk key, and his real balance is untouched. The data (the dict) and the rules (the functions) are separate things that merely happen to be used together. As a program grows to hundreds of functions and many kinds of records, nothing says which function belongs to which dict.</p>
  <h3>Defining the class</h3>
  <p>A <strong>class</strong> is a new type you design. It says what data each thing of that type has and what that thing can do. An <strong>object</strong> (also called an <strong>instance</strong>) is one thing built from the class, with its own data. Asha's account and Ben's account are two objects of one class, <code>Account</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>An architect's drawing and the houses built from it. The drawing (class) is made once; each house (object) has its own furniture (data). Painting one house changes neither the drawing nor the other houses.</p></div>
  <p>Before the code, read the shape. <code>class Account:</code> starts the blueprint. Inside it, every <code>def</code> is a <strong>method</strong>, a function that belongs to the class. <code>__init__</code> is a special method that Python runs when you build a new account; it stores the starting data. Every method's first parameter is <code>self</code>, which means "the account being worked on" (explained in the next section). <code>self.balance = balance</code> stores a value on the object; such a value is called an <strong>attribute</strong>.</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance):
        self.owner = owner          # data that belongs to THIS account
        self.balance = balance

    def deposit(self, amount):      # behaviour, stored next to the data
        self.balance += amount

    def withdraw(self, amount):
        if amount &gt; self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

asha = Account("Asha", 100)        # build one object from the class
ben = Account("Ben", 50)           # and another
asha.deposit(50)
asha.withdraw(30)
print(asha.owner, asha.balance)
print(ben.owner, ben.balance)
print(type(asha).__name__, isinstance(asha, Account), asha is ben)
ben.withdraw(80)</div>
  <div class="fx" data-lang="text">Asha 120
Ben 50
Account True False
ValueError: insufficient funds</div>
  <p>After the code. <code>Account("Asha", 100)</code> built one object and <code>Account("Ben", 50)</code> another; each has its own <code>owner</code> and <code>balance</code>. <code>asha.deposit(50)</code> called the method on Asha's object only. <code>type(asha).__name__</code> is <code>Account</code>: the class really is a new type, just like <code>int</code> or <code>list</code>. <code>asha is ben</code> is False: two separate objects. The last line, Ben withdrawing 80, raised <code>ValueError: insufficient funds</code>, because the rule now travels with the data. The direct write <code>asha.balance = -500</code> is still possible; encapsulation and properties close that door.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
    <defs><marker id="pc-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="40" width="200" height="120" rx="6" class="fb sb"/>
    <text x="32" y="62" font-weight="bold">class Account</text>
    <text x="32" y="86">__init__(self, owner, balance)</text>
    <text x="32" y="106">deposit(self, amount)</text>
    <text x="32" y="126">withdraw(self, amount)</text>
    <text x="32" y="148" class="tm">methods: stored once</text>
    <line x1="222" y1="80" x2="318" y2="48" stroke="currentColor" marker-end="url(#pc-a1)"/>
    <line x1="222" y1="122" x2="318" y2="150" stroke="currentColor" marker-end="url(#pc-a1)"/>
    <text x="238" y="102" class="tm">Account(...)</text>
    <rect x="320" y="16" width="220" height="62" rx="6" class="fg sg"/>
    <text x="332" y="38" font-weight="bold">asha</text>
    <text x="332" y="60">owner="Asha", balance=120</text>
    <rect x="320" y="122" width="220" height="62" rx="6" class="fg sg"/>
    <text x="332" y="144" font-weight="bold">ben</text>
    <text x="332" y="166">owner="Ben", balance=50</text>
  </svg><figcaption>One class, many objects. Each object keeps its own data. The methods live once, on the class, and work on whichever object they are called on.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>class</strong> is a user-defined type that groups data (attributes) with the functions that operate on it (methods). An <strong>object</strong> or <strong>instance</strong> is a value of that type, created by calling the class like a function: <code>Account("Asha", 100)</code>. Bundling data with its behaviour is the first idea of object-oriented programming.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A class does not by itself protect anything. This version still lets anyone write <code>asha.balance = -500</code>. Bundling is step one; protecting the rule (encapsulation) is a separate step.</p></div>

  <h2 id="pc-self"><span class="num">02</span>self and Bound Methods</h2>
  <p><code>self</code> is the object the method was called on. When you write <code>asha.deposit(50)</code>, Python finds <code>deposit</code> on the class and calls it with <code>asha</code> slipped in as the first argument. Nothing more magical happens.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cashier serves every customer with the same procedure. The first thing she does is take your passbook. <code>self</code> is that passbook: the same procedure, applied to whichever account was handed over.</p></div>
  <h3>The desugaring, traced</h3>
  <table class="tbl">
    <tr><th>Step</th><th>What Python does for <code>asha.deposit(50)</code></th></tr>
    <tr><td>1</td><td>Look for <code>deposit</code> in Asha's own data, <code>vars(asha)</code> = <code>{'owner': 'Asha', 'balance': 100}</code>. Not there.</td></tr>
    <tr><td>2</td><td>Look in the class, <code>vars(Account)</code>. Found: a plain function <code>deposit(self, amount)</code>.</td></tr>
    <tr><td>3</td><td>Because it was reached through an object, wrap it as a <strong>bound method</strong>: the function plus <code>asha</code>.</td></tr>
    <tr><td>4</td><td>Calling the bound method with <code>(50)</code> calls the function with <code>(asha, 50)</code>. Inside, <code>self</code> is <code>asha</code>, so <code>self.balance += amount</code> changes 100 → 150.</td></tr>
  </table>
  <p>The code below calls the method both ways and then looks at the objects involved. Watch for the words <code>function</code> and <code>bound method</code> in the output.</p>
  <div class="fx" data-lang="py">asha = Account("Asha", 100)
asha.deposit(50)                   # what you write
Account.deposit(asha, 50)          # what Python actually runs
print(asha.balance)

print(Account.deposit)             # a plain function stored on the class
print(asha.deposit)                # a "bound method": that function + asha
m = asha.deposit
print(m.__func__ is Account.deposit, m.__self__ is asha)
print("deposit" in vars(Account), "deposit" in vars(asha))</div>
  <div class="fx" data-lang="text">200
&lt;function Account.deposit at 0x7fbeaa6dab60&gt;
&lt;bound method Account.deposit of &lt;__main__.Account object at 0x7fbeaa6b5310&gt;&gt;
True True
True False</div>
  <p>After the code. The balance went 100 → 150 → 200: both calls did the same thing. <code>Account.deposit</code> printed as a plain <code>function</code>; <code>asha.deposit</code> printed as a <code>bound method</code> of an Account object. A bound method remembers two things, the function (<code>__func__</code>) and the object (<code>__self__</code>), and both checks print True. Finally, <code>deposit</code> is in <code>vars(Account)</code> but not in <code>vars(asha)</code>: methods are stored once, on the class, never copied into each object.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>obj.method(args)</code> is shorthand for <code>type(obj).method(obj, args)</code>. The first parameter receives the object; by convention it is named <code>self</code>, but the name is not a keyword. A <strong>bound method</strong> is the object returned by <code>obj.method</code>: the function with its first argument already filled in.</p></div>
  <h3>When self is missing</h3>
  <p>Because Python always passes the object, a method written without a parameter for it fails on the first call:</p>
  <div class="fx" data-lang="py">class Broken:
    def greet():                   # forgot the self parameter
        return "hi"

Broken().greet()</div>
  <div class="fx" data-lang="text">TypeError: Broken.greet() takes 0 positional arguments but 1 was given</div>
  <p>Read the message literally: <code>greet</code> takes 0 arguments, but Python gave it 1 (the object). This message almost always means a missing <code>self</code>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Inside a method, a bare <code>balance</code> is a local variable, not the object's attribute. Always write <code>self.balance</code>. Forgetting <code>self.</code> on an assignment creates a local that vanishes when the method returns, with no error.</p></div>

  <h2 id="pc-init"><span class="num">03</span>__init__ and __new__: Creating an Object</h2>
  <p>Calling a class does two steps. First Python makes a new, empty object (a method called <code>__new__</code> does this; you almost never write it). Then it calls <code>__init__</code> on that empty object with your arguments, and <code>__init__</code> fills in the attributes. <code>__init__</code> is often called the <strong>constructor</strong>, although strictly it is the <em>initialiser</em>: the object already exists when it runs.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Opening an account at a branch. The clerk first takes a blank passbook from the drawer (<code>__new__</code>), then writes your name and opening deposit in it (<code>__init__</code>). A clerk who refuses to write a negative opening deposit is validation inside <code>__init__</code>.</p></div>
  <p>The version below prints the object's attributes at the start and the end of <code>__init__</code>, so you can watch it being filled. <code>balance=0</code> is a default argument, so the balance is optional.</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        print("  __init__ starts, attributes so far:", vars(self))
        if balance &lt; 0:
            raise ValueError("opening balance cannot be negative")
        self.owner = owner
        self.balance = balance
        print("  __init__ ends,   attributes now:   ", vars(self))

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount &gt; self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

print("Account('Asha', 100):")
asha = Account("Asha", 100)
print("Account('Chitra') uses the default balance:")
chitra = Account("Chitra")</div>
  <div class="fx" data-lang="text">Account('Asha', 100):
  __init__ starts, attributes so far: {}
  __init__ ends,   attributes now:    {'owner': 'Asha', 'balance': 100}
Account('Chitra') uses the default balance:
  __init__ starts, attributes so far: {}
  __init__ ends,   attributes now:    {'owner': 'Chitra', 'balance': 0}</div>
  <p>At the start of <code>__init__</code> the object is empty: <code>{}</code>. By the end it holds owner and balance. For Chitra, who passed no balance, the default 0 was used. The same two steps can be done by hand, which proves there is nothing hidden:</p>
  <div class="fx" data-lang="py">obj = Account.__new__(Account)     # step 1: make an EMPTY object
print("after __new__ :", vars(obj))
Account.__init__(obj, "Asha", 100) # step 2: fill it in
print("after __init__:", vars(obj), type(obj).__name__)</div>
  <div class="fx" data-lang="text">after __new__ : {}
  __init__ starts, attributes so far: {}
  __init__ ends,   attributes now:    {'owner': 'Asha', 'balance': 100}
after __init__: {'owner': 'Asha', 'balance': 100} Account</div>
  <p><code>Account.__new__(Account)</code> returned an empty Account; calling <code>Account.__init__</code> on it filled it in (its trace lines appear in the middle). <code>Account("Asha", 100)</code> does exactly these two calls. Two consequences follow:</p>
  <div class="fx" data-lang="py">try:
    Account("Ben", -50)
except ValueError as e:
    print("ValueError:", e)

class Weird:
    def __init__(self):
        return 42                  # __init__ must return None

Weird()</div>
  <div class="fx" data-lang="text">  __init__ starts, attributes so far: {}
ValueError: opening balance cannot be negative
TypeError: __init__() should return None, not 'int'</div>
  <p>The check in <code>__init__</code> stopped Ben's account from ever existing with −50: an object that fails validation is never handed back. And <code>__init__</code> must return <code>None</code>: the result of <code>Account(...)</code> is the object, not whatever <code>__init__</code> returns, so Python rejects any other return value.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>Class(args)</code> calls <code>Class.__new__(Class)</code> to create an instance, then <code>instance.__init__(args)</code> to initialise it, and returns the instance. <code>__init__</code> sets the instance attributes and is the natural place to validate arguments; it must return <code>None</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Attributes created outside <code>__init__</code> (in some later method) do not exist until that method runs; reading them earlier raises <code>AttributeError</code>. Create every attribute in <code>__init__</code>, even if only as <code>None</code> or <code>[]</code>, so every object has the same shape.</p></div>

  <h2 id="pc-attrs"><span class="num">04</span>Instance vs Class Attributes</h2>
  <p>An <strong>instance attribute</strong> is stored in one object (set with <code>self.x = …</code>, usually in <code>__init__</code>). A <strong>class attribute</strong> is written directly in the class body and stored once, on the class. Reading <code>asha.bank</code> first looks in Asha's object, and if the name is not there, looks in the class.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Each passbook has its own balance written inside (instance attribute). The bank's name is printed once, on the branch signboard (class attribute). Ask any customer "which bank?" and, unless they have scribbled something else in their own passbook, they read the signboard.</p></div>
  <div class="fx" data-lang="py">class Account:
    bank = "PocketBank"            # class attribute: ONE value, on the class
    accounts_opened = 0

    def __init__(self, owner, balance=0):
        self.owner = owner         # instance attributes: one copy per object
        self.balance = balance
        Account.accounts_opened += 1

asha, ben = Account("Asha", 100), Account("Ben", 50)
print(asha.bank, ben.bank, Account.bank)
print(vars(asha))
print("bank" in vars(asha), "bank" in vars(Account))
print("accounts opened:", Account.accounts_opened)</div>
  <div class="fx" data-lang="text">PocketBank PocketBank PocketBank
{'owner': 'Asha', 'balance': 100}
False True
accounts opened: 2</div>
  <p>All three ways of reading <code>bank</code> give PocketBank, yet <code>vars(asha)</code> holds only owner and balance: <code>bank</code> is in <code>vars(Account)</code>, not in the object. The counter was changed through the class (<code>Account.accounts_opened += 1</code>), so both accounts added to the same number: 2.</p>
  <h3>Lookup order, traced</h3>
  <table class="tbl">
    <tr><th>Expression</th><th>1. in <code>vars(asha)</code>?</th><th>2. in <code>vars(Account)</code>?</th><th>Result</th></tr>
    <tr><td><code>asha.balance</code></td><td>yes: 100</td><td>(not checked)</td><td>100</td></tr>
    <tr><td><code>asha.bank</code></td><td>no</td><td>yes: "PocketBank"</td><td>"PocketBank"</td></tr>
    <tr><td><code>asha.deposit</code></td><td>no</td><td>yes: a function</td><td>bound method</td></tr>
    <tr><td><code>asha.colour</code></td><td>no</td><td>no (then parent classes, then <code>object</code>)</td><td>AttributeError</td></tr>
  </table>
  <p>Reading searches upward. <strong>Writing does not</strong>: assigning through an object always writes into that object.</p>
  <div class="fx" data-lang="py">asha.bank = "AshaBank"             # assignment through an object makes a NEW instance attribute
print(asha.bank, "|", ben.bank, "|", Account.bank)
print(vars(asha))
del asha.bank                      # remove it: lookup falls back to the class again
print(asha.bank)</div>
  <div class="fx" data-lang="text">AshaBank | PocketBank | PocketBank
{'owner': 'Asha', 'balance': 100, 'bank': 'AshaBank'}
PocketBank</div>
  <p><code>asha.bank = "AshaBank"</code> did not change the class; it created a new instance attribute that <em>shadows</em> (hides) the class one, for Asha only. Ben and the class still say PocketBank. Deleting Asha's attribute uncovers the class value again.</p>
  <h3>The shared-mutable trap, traced</h3>
  <p>Now add a per-account transaction history. A tempting first try puts <code>history = []</code> in the class body, next to <code>bank</code>.</p>
  <div class="fx" data-lang="py">class Account:
    history = []                   # BUG: one list shared by every account

    def __init__(self, owner, balance=0):
        self.owner, self.balance = owner, balance

    def deposit(self, amount):
        self.balance += amount
        self.history.append((self.owner, "deposit", amount))

asha, ben = Account("Asha", 100), Account("Ben", 50)
asha.deposit(50)
print("Ben's history:", ben.history)
print(asha.history is ben.history is Account.history)</div>
  <div class="fx" data-lang="text">Ben's history: [('Asha', 'deposit', 50)]
True</div>
  <p>Ben never deposited anything, yet his history shows Asha's deposit. Trace <code>asha.deposit(50)</code>:</p>
  <table class="tbl">
    <tr><th>Step</th><th>What happens</th><th>Where the list lives</th></tr>
    <tr><td>1</td><td><code>self.history</code>: not in <code>vars(asha)</code> → found on the class</td><td>one list, on <code>Account</code></td></tr>
    <tr><td>2</td><td><code>.append(...)</code> <em>changes that list in place</em>; no assignment, so no new instance attribute</td><td>still the class's list</td></tr>
    <tr><td>3</td><td><code>ben.history</code>: not in <code>vars(ben)</code> → the same class list</td><td>Ben sees Asha's entry</td></tr>
  </table>
  <p>The last line printed True: <code>asha.history</code>, <code>ben.history</code> and <code>Account.history</code> are one object. The opposite mistake happens with a number:</p>
  <div class="fx" data-lang="py">class Account:
    accounts_opened = 0

    def __init__(self, owner):
        self.owner = owner
        self.accounts_opened += 1  # BUG: reads the class value, WRITES an instance attribute

asha, ben = Account("Asha"), Account("Ben")
print(Account.accounts_opened, asha.accounts_opened, vars(ben))</div>
  <div class="fx" data-lang="text">0 1 {'owner': 'Ben', 'accounts_opened': 1}</div>
  <p><code>self.accounts_opened += 1</code> means <code>self.accounts_opened = self.accounts_opened + 1</code>. The read finds the class's 0, but the write is an assignment through the object, so it creates an instance attribute with 1 on each account. The class counter stays 0. Ints cannot be changed in place (they are <em>immutable</em>, see <a class="xref" data-note="py_values">Values &amp; Types</a>), so the list trap and the counter trap are mirror images: mutating a shared object leaks to everyone; rebinding a name creates a private copy.</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner, self.balance = owner, balance
        self.history = []          # a fresh list for EACH account

    def deposit(self, amount):
        self.balance += amount
        self.history.append(("deposit", amount))

asha, ben = Account("Asha", 100), Account("Ben", 50)
asha.deposit(50)
print("Asha:", asha.history, "| Ben:", ben.history)</div>
  <div class="fx" data-lang="text">Asha: [('deposit', 50)] | Ben: []</div>
  <p>The fix: create the list in <code>__init__</code>, so each call makes a fresh one. Now Asha has her deposit and Ben has an empty history.</p>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>instance attribute</strong> lives in the object's <code>__dict__</code> (shown by <code>vars(obj)</code>); a <strong>class attribute</strong> lives in the class's <code>__dict__</code> and is shared by all instances. Attribute <em>lookup</em> searches the instance, then the class, then its parent classes; attribute <em>assignment</em> through an instance always writes to the instance.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Never put a list, dict or set in the class body unless you truly want one shared object. Use class attributes for constants (<code>bank = "PocketBank"</code>, <code>min_opening = 10</code>), and change shared counters through the class name (<code>Account.count += 1</code>) or <code>type(self)</code>.</p></div>

  <h2 id="pc-methods"><span class="num">05</span>Instance, Class and Static Methods</h2>
  <p>There are three kinds of method, told apart by what they receive first. An <strong>instance method</strong> (the normal kind) receives the object, <code>self</code>. A <strong>class method</strong>, marked <code>@classmethod</code>, receives the class itself, by convention named <code>cls</code>; its usual job is to build objects in another way. A <strong>static method</strong>, marked <code>@staticmethod</code>, receives nothing extra; it is a plain function kept inside the class because it belongs there. (A line starting with <code>@</code> is a <strong>decorator</strong>, which changes the function below it; <a class="xref" data-note="py_decorators">Decorators</a> shows how they work inside.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank branch. Instance method: the cashier updating <em>your</em> passbook. Class method: the account-opening desk, which makes a new passbook from a filled-in form. Static method: the note-counting machine on the desk, which belongs to the branch but knows nothing about any customer.</p></div>
  <table class="tbl">
    <tr><th>Kind</th><th>First parameter</th><th>Can use</th><th>Typical job</th></tr>
    <tr><td>Instance</td><td><code>self</code> (the account)</td><td>this object's data + class data</td><td><code>deposit</code>, <code>withdraw</code></td></tr>
    <tr><td><code>@classmethod</code></td><td><code>cls</code> (the class it was called on)</td><td>class data; can build objects with <code>cls(...)</code></td><td><code>from_csv("Asha, 100")</code>, <code>set_min_opening(20)</code></td></tr>
    <tr><td><code>@staticmethod</code></td><td>none</td><td>only its own arguments</td><td><code>is_valid_amount(-5)</code></td></tr>
  </table>
  <p>The class below has all three. <code>min_opening = 10</code> is a class attribute (the smallest opening deposit); <code>__init__</code> reads it through <code>self</code>, which matters in a moment.</p>
  <div class="fx" data-lang="py">class Account:
    bank = "PocketBank"
    min_opening = 10

    def __init__(self, owner, balance=0):
        if balance &lt; self.min_opening:
            raise ValueError(f"opening balance must be at least {self.min_opening}")
        self.owner, self.balance = owner, balance

    def deposit(self, amount):                 # instance method: needs THIS account
        if not self.is_valid_amount(amount):
            raise ValueError(f"bad amount: {amount!r}")
        self.balance += amount

    @classmethod
    def from_csv(cls, line):                   # class method: another way to BUILD one
        owner, balance = line.split(",")
        return cls(owner.strip(), int(balance))

    @classmethod
    def set_min_opening(cls, amount):          # class method: change class-wide data
        cls.min_opening = amount

    @staticmethod
    def is_valid_amount(amount):               # static method: a helper, needs neither
        return isinstance(amount, (int, float)) and amount &gt; 0

asha = Account.from_csv("Asha, 100")
print(asha.owner, asha.balance, type(asha).__name__)
print(Account.is_valid_amount(50), Account.is_valid_amount(-5), asha.is_valid_amount("10"))
print(Account.from_csv)
print(Account.is_valid_amount)
try:
    asha.deposit(-5)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">Asha 100 Account
True False False
&lt;bound method Account.from_csv of &lt;class '__main__.Account'&gt;&gt;
&lt;function Account.is_valid_amount at 0x7fbeaa6db7e0&gt;
ValueError: bad amount: -5</div>
  <p>After the code. <code>Account.from_csv("Asha, 100")</code> split the line, converted <code>"100"</code> to an int and returned <code>cls(...)</code>, a normal Account. The static method answered True, False, False without any account (and also works when called through one, <code>asha.is_valid_amount</code>). The two printed method objects show the difference: <code>from_csv</code> is a <em>bound method of the class</em> (the class was slipped in as <code>cls</code>, just as an object is slipped in as <code>self</code>), while <code>is_valid_amount</code> is a plain function with nothing slipped in. <code>deposit(-5)</code> used the static helper and refused the amount.</p>
  <h3>Why cls and not the class name</h3>
  <p>A child class (see <a class="xref" data-note="py_inheritance">Inheritance</a>), such as a student account that allows a 0 opening balance, inherits <code>from_csv</code>. Because <code>cls</code> is whichever class the method was called on, the child gets the right type back. A version that hard-codes <code>Account(...)</code> does not:</p>
  <div class="fx" data-lang="py">class StudentAccount(Account):     # a child class: inherits everything from Account
    min_opening = 0

dev = StudentAccount.from_csv("Dev, 0")
print(type(dev).__name__, dev.owner, dev.balance)

class Hardcoded(Account):
    @classmethod
    def from_csv(cls, line):
        owner, balance = line.split(",")
        return Account(owner.strip(), int(balance))   # BUG: ignores cls

class StudentAccount2(Hardcoded):
    min_opening = 0

try:
    StudentAccount2.from_csv("Dev, 0")
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">StudentAccount Dev 0
ValueError: opening balance must be at least 10</div>
  <p><code>StudentAccount.from_csv("Dev, 0")</code> returned a StudentAccount, and its <code>min_opening</code> of 0 allowed the empty account. The hard-coded version built a plain <code>Account</code>, so the parent's minimum of 10 applied and Dev was refused. Real alternative constructors work this way: <code>dict.fromkeys</code>, <code>datetime.fromisoformat</code>, <code>pd.DataFrame.from_dict</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>instance method</strong> receives the instance as its first argument. A <strong>class method</strong> (<code>@classmethod</code>) receives the class it was called on, so it is used for <em>alternative constructors</em> and class-wide state. A <strong>static method</strong> (<code>@staticmethod</code>) receives no implicit argument; it is a namespaced helper.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A static method that needs the class's data is really a class method in disguise. And a "helper" that needs neither class nor instance and is used elsewhere too is often better as a module-level function. Static methods are for helpers that belong with this class only.</p></div>

  <h2 id="pc-encap"><span class="num">06</span>Encapsulation: _name and __name Mangling</h2>
  <p>Encapsulation keeps an object's data internal so it changes only through methods that keep its <strong>invariant</strong>, a rule about the data that must hold at every moment (here, <code>balance ≥ 0</code>). Without it, the invariant is one assignment away from broken:</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner, self.balance = owner, balance

    def withdraw(self, amount):
        if amount &gt; self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

asha = Account("Asha", 120)
asha.balance = -500                # nothing stops this line
print(asha.balance)</div>
  <div class="fx" data-lang="text">-500</div>
  <p>Python has no truly private attributes. It has two naming tools instead.</p>
  <ul>
    <li><strong>One underscore</strong>, <code>_balance</code>: a convention that means "internal, not part of the public interface". Python changes nothing; other programmers (and linters) respect it.</li>
    <li><strong>Two underscores</strong>, <code>__balance</code> (and not ending in two underscores): Python <em>renames</em> it inside the class body to <code>_Account__balance</code>. This is called <strong>name mangling</strong>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>An ATM. You deposit and withdraw through buttons that follow rules; you cannot reach into the cash box. A single underscore is a "Staff only" sign on an unlocked door. Double underscore is moving the door to a different corridor: harder to stumble into, but a determined person with the floor plan can still find it.</p></div>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._fee_waived = False   # one underscore: "internal, please don't touch"
        self.__balance = balance   # two underscores: renamed by Python

    def withdraw(self, amount):
        if amount &gt; self.__balance:
            raise ValueError("insufficient funds")
        self.__balance -= amount

    def get_balance(self):
        return self.__balance

asha = Account("Asha", 120)
asha.withdraw(20)
print(vars(asha))
print(asha.get_balance(), asha._Account__balance)
try:
    asha.__balance
except AttributeError as e:
    print("AttributeError:", e)
asha.__balance = -500              # creates a NEW, unrelated attribute
print(asha.get_balance(), vars(asha))</div>
  <div class="fx" data-lang="text">{'owner': 'Asha', '_fee_waived': False, '_Account__balance': 100}
100 100
AttributeError: 'Account' object has no attribute '__balance'
100 {'owner': 'Asha', '_fee_waived': False, '_Account__balance': 100, '__balance': -500}</div>
  <p>After the code. <code>vars(asha)</code> shows the real stored name, <code>_Account__balance</code>, holding 100 after the withdrawal of 20. The method <code>get_balance</code> reads it (inside the class, <code>self.__balance</code> is rewritten to <code>self._Account__balance</code>). From outside, <code>asha.__balance</code> is not found, but the mangled name works, which proves this is not security. The last two lines are the classic surprise: assigning <code>asha.__balance = -500</code> from <em>outside</em> the class is not mangled, so it creates a brand-new attribute literally called <code>__balance</code>. The real balance stays 100 and the invariant survives.</p>
  <h3>What mangling is actually for</h3>
  <p>Mangling exists so that a child class can use the same name without overwriting the parent's data by accident:</p>
  <div class="fx" data-lang="py">class AuditedAccount(Account):
    def __init__(self, owner, balance=0):
        super().__init__(owner, balance)       # run the parent's __init__ first
        self.__balance = "audit copy"          # becomes _AuditedAccount__balance

a = AuditedAccount("Ben", 50)
print(vars(a))
print(a.get_balance())                         # the parent's data is untouched</div>
  <div class="fx" data-lang="text">{'owner': 'Ben', '_fee_waived': False, '_Account__balance': 50, '_AuditedAccount__balance': 'audit copy'}
50</div>
  <p>Both classes wrote <code>self.__balance</code>, but they are stored under different names, <code>_Account__balance</code> and <code>_AuditedAccount__balance</code>, so the parent's real balance (50) is untouched. Use double underscores for this purpose only; for "internal" use a single underscore.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Encapsulation</strong>: hiding an object's internal state and exposing only operations that keep its invariants. In Python it is by convention: <code>_name</code> marks internal attributes; <code>__name</code> inside a class body is mangled to <code>_ClassName__name</code> to avoid clashes in subclasses.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Name mangling is not access control. <code>obj._Account__balance</code> always works. And encapsulation is not abstraction: encapsulation protects <em>data</em> (who may change it); abstraction simplifies the <em>interface</em> (what a caller needs to know). Abstraction and ABCs are covered in <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>.</p></div>

  <h2 id="pc-prop"><span class="num">07</span>@property: Getters, Setters and Read-only Attributes</h2>
  <p>A <strong>property</strong> is a method that is used like an attribute. The <strong>getter</strong>, written under <code>@property</code>, runs when you read <code>obj.name</code>. An optional <strong>setter</strong>, written under <code>@name.setter</code>, runs when you assign <code>obj.name = value</code>, and can check or clean the value. A property with no setter is read-only. The real value is stored under a different name, usually with one underscore (<code>_balance</code>).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank counter window. You just "hand over money", but the cashier checks the note before it goes in. From your side it is one simple action; behind the glass, rules run.</p></div>
  <p>In the class below, <code>balance</code> is read-only, <code>owner</code> has a setter that strips spaces, refuses an empty name and capitalises it, and <code>is_empty</code> is computed on every read. Note that <code>__init__</code> itself writes <code>self.owner = owner</code>, so even the first value goes through the setter.</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner                     # goes through the owner setter below
        self._balance = 0
        if balance:
            self.deposit(balance)

    @property
    def balance(self):                         # read like an attribute ...
        return self._balance                   # ... but no setter: read-only

    @property
    def owner(self):
        return self._owner

    @owner.setter
    def owner(self, name):                     # runs on every  obj.owner = ...
        name = name.strip()
        if not name:
            raise ValueError("owner name cannot be empty")
        self._owner = name.title()

    @property
    def is_empty(self):                        # computed on every read
        return self._balance == 0

    def deposit(self, amount):
        if amount &lt;= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount

asha = Account("  asha rao ", 100)
asha.deposit(50); asha.withdraw(30)
print(asha.owner, asha.balance, asha.is_empty)
try:
    asha.balance = 1_000_000
except AttributeError as e:
    print("AttributeError:", e)
try:
    asha.owner = "   "
except ValueError as e:
    print("ValueError:", e)
asha.owner = "asha k"
print(asha.owner, vars(asha))</div>
  <div class="fx" data-lang="text">Asha Rao 120 False
AttributeError: property 'balance' of 'Account' object has no setter
ValueError: owner name cannot be empty
Asha K {'_owner': 'Asha K', '_balance': 120}</div>
  <p>After the code. The name <code>"  asha rao "</code> was cleaned to <code>Asha Rao</code> by the setter during <code>__init__</code>. The balance reads as 120 with plain attribute syntax. Assigning to it fails with "property 'balance' … has no setter". An empty name is refused; <code>"asha k"</code> becomes <code>Asha K</code>. <code>vars(asha)</code> shows where the data really lives: <code>_owner</code> and <code>_balance</code>. The properties themselves live on the class.</p>
  <h3>Why a property wins the lookup: data descriptors</h3>
  <p>Normal attribute lookup checks the object first. A property is the exception: it is a special kind of class attribute (a <em>data descriptor</em>) that Python checks <em>before</em> the object's own data. That is why <code>asha.balance = …</code> cannot sneak a value into <code>vars(asha)</code>: the property intercepts both reading and writing.</p>
  <h3>Adding a property later without breaking callers</h3>
  <p>Start every class with plain attributes. If a rule appears later ("owner names must not be empty"), turn the attribute into a property with a setter. Every caller that wrote <code>acc.owner = …</code> keeps working, and now goes through the check. In Java you would have to write <code>getOwner()</code>/<code>setOwner()</code> from day one; in Python you do not.</p>
  <div class="fx" data-lang="py">class Loop:
    @property
    def balance(self):
        return self.balance        # BUG: reads itself, forever

Loop().balance</div>
  <div class="fx" data-lang="text">RecursionError: maximum recursion depth exceeded</div>
  <p>This is the most common property bug. The getter is named <code>balance</code> and reads <code>self.balance</code>, which calls the getter again, forever, until Python gives up. Store the value under another name (<code>self._balance</code>).</p>
  <div class="callout def"><span class="label">Definition</span><p><code>@property</code> turns a method into a managed attribute: reading calls the getter, <code>@x.setter</code> handles assignment, <code>@x.deleter</code> handles <code>del</code>. A property without a setter is read-only. Properties are data descriptors, so they take precedence over the instance's <code>__dict__</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Keep getters cheap and free of side effects. <code>acc.balance</code> looks like a plain read, so a getter that queries a database or changes state surprises everyone who reads the calling code.</p></div>

  <h2 id="pc-dc"><span class="num">08</span>Dataclasses: @dataclass, field() and frozen</h2>
  <p>A <strong>dataclass</strong> is a class where you only list the fields with their types, and the decorator <code>@dataclass</code> writes <code>__init__</code>, <code>__repr__</code> (how it prints) and <code>__eq__</code> (how <code>==</code> compares) for you. (<code>__repr__</code> and <code>__eq__</code> are dunder methods; see <a class="xref" data-note="py_dunder">Dunder Methods</a>.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pre-printed bank slip. You only decide the boxes (kind, amount, note); the printing press makes the slip, the same way every time.</p></div>
  <div class="fx" data-lang="py">class TransactionPlain:            # writing the boring methods by hand
    def __init__(self, kind, amount, note=""):
        self.kind, self.amount, self.note = kind, amount, note
    def __repr__(self):
        return f"TransactionPlain(kind={self.kind!r}, amount={self.amount!r}, note={self.note!r})"
    def __eq__(self, other):
        return (self.kind, self.amount, self.note) == (other.kind, other.amount, other.note)

from dataclasses import dataclass

@dataclass
class Transaction:                 # the same three methods, generated
    kind: str
    amount: int
    note: str = ""

print(TransactionPlain("deposit", 50))
print(Transaction("deposit", 50))
print(Transaction("deposit", 50) == Transaction("deposit", 50))</div>
  <div class="fx" data-lang="text">TransactionPlain(kind='deposit', amount=50, note='')
Transaction(kind='deposit', amount=50, note='')
True</div>
  <p>Eight lines by hand, four lines with <code>@dataclass</code>, and the same behaviour: both print every field, and two Transactions with the same fields compare equal. The type annotations (<code>kind: str</code>) are what tells the decorator which fields exist; Python does not check the types at runtime.</p>
  <h3>Options you will use</h3>
  <div class="flow"><span>Declare typed fields</span><span>@dataclass</span><span>__init__, __repr__, __eq__ generated</span><span>+ order / frozen on request</span></div>
  <p><code>frozen=True</code> makes objects unchangeable after creation (and therefore hashable, so they can go into a set or be dict keys). <code>order=True</code> also writes <code>&lt;</code>, <code>&gt;</code> and friends, comparing the fields in order like a tuple. <code>field(compare=False)</code> leaves a field out of comparisons.</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass, field, FrozenInstanceError

@dataclass(frozen=True, order=True)
class Transaction:
    amount: int                    # order=True compares fields in this order
    kind: str = field(compare=False)
    note: str = field(default="", compare=False)

t1, t2, t3 = Transaction(100, "open"), Transaction(50, "deposit"), Transaction(30, "withdraw")
print(sorted([t1, t2, t3]))
print(t2 &gt; t3, len({t1, t2, Transaction(50, "deposit")}))
try:
    t1.amount = 1_000
except FrozenInstanceError as e:
    print("FrozenInstanceError:", e)</div>
  <div class="fx" data-lang="text">[Transaction(amount=30, kind='withdraw', note=''), Transaction(amount=50, kind='deposit', note=''), Transaction(amount=100, kind='open', note='')]
True 2
FrozenInstanceError: cannot assign to field 'amount'</div>
  <p>After the code. Sorting compared only <code>amount</code> (the other fields have <code>compare=False</code>), so 30 &lt; 50 &lt; 100. The set holds 2 items because the two <code>Transaction(50, "deposit")</code> are equal and hash the same. Assigning to a frozen field raised <code>FrozenInstanceError</code>, which is what you want for a ledger entry that must never change.</p>
  <h3>A whole Account as a dataclass</h3>
  <p>A dataclass is still a normal class: it can have methods. <code>field(default_factory=list)</code> calls <code>list()</code> for each new object, the dataclass version of creating the list in <code>__init__</code>. <code>__post_init__</code> runs right after the generated <code>__init__</code>, the place for validation.</p>
  <div class="fx" data-lang="py">@dataclass
class Account:
    owner: str
    balance: int = 0
    history: list = field(default_factory=list)   # a NEW list per object

    def __post_init__(self):                       # runs right after the generated __init__
        if self.balance &lt; 0:
            raise ValueError("opening balance cannot be negative")
        self.history.append(Transaction(self.balance, "open"))

    def deposit(self, amount):
        self.balance += amount
        self.history.append(Transaction(amount, "deposit"))

asha, ben = Account("Asha", 100), Account("Ben", 50)
asha.deposit(50)
print(asha)
print(ben)</div>
  <div class="fx" data-lang="text">Account(owner='Asha', balance=150, history=[Transaction(amount=100, kind='open', note=''), Transaction(amount=50, kind='deposit', note='')])
Account(owner='Ben', balance=50, history=[Transaction(amount=50, kind='open', note='')])</div>
  <p>Each account has its own history: Asha's has the opening and the deposit, Ben's only the opening. The shared-list trap cannot happen, because dataclasses refuse a mutable default outright:</p>
  <div class="fx" data-lang="py">try:
    @dataclass
    class Bad:
        history: list = []
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">ValueError: mutable default &lt;class 'list'&gt; for field history is not allowed: use default_factory</div>
  <div class="callout def"><span class="label">Definition</span><p><code>@dataclass</code> (module <code>dataclasses</code>) generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> from annotated class fields. Options: <code>frozen=True</code> (immutable, hashable), <code>order=True</code> (comparison methods), <code>slots=True</code> (less memory). <code>field()</code> sets per-field options such as <code>default_factory</code> and <code>compare</code>; <code>__post_init__</code> runs after initialisation.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Dataclasses do not validate types: <code>Transaction("deposit", "fifty")</code> is accepted. For data from users, files or APIs, validate in <code>__post_init__</code> or use <strong>pydantic</strong>. And a dataclass with real invariants (like the balance rule) still needs encapsulation: a public <code>balance</code> field can be assigned freely.</p></div>

  <h2 id="pc-example"><span class="num">09</span>Worked Example: a Complete Account Class</h2>
  <p>One class using every feature above: a class attribute, per-instance state created in <code>__init__</code>, an alternative constructor, a static helper, read-only properties over protected data, and frozen dataclass records.</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass

@dataclass(frozen=True)
class Transaction:
    kind: str
    amount: int

class Account:
    bank = "PocketBank"                           # class attribute (shared)

    def __init__(self, owner, balance=0):
        self.owner = owner                        # instance attributes (per object)
        self._balance = 0
        self._history = []                        # fresh list per account
        self.deposit(balance, kind="open")

    @classmethod
    def from_csv(cls, line):                      # alternative constructor
        owner, balance = line.split(",")
        return cls(owner.strip(), int(balance))

    @staticmethod
    def _check(amount):                           # helper
        if not isinstance(amount, int) or amount &lt; 0:
            raise ValueError(f"bad amount: {amount!r}")

    @property
    def balance(self):                            # read-only view of the protected data
        return self._balance

    @property
    def history(self):
        return tuple(self._history)               # a copy the caller cannot change

    def deposit(self, amount, kind="deposit"):
        self._check(amount)
        self._balance += amount
        self._history.append(Transaction(kind, amount))

    def withdraw(self, amount):
        self._check(amount)
        if amount &gt; self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount
        self._history.append(Transaction("withdraw", amount))

asha = Account.from_csv("Asha, 100")
asha.deposit(50)
asha.withdraw(30)
ben = Account("Ben", 50)
try:
    ben.withdraw(80)
except ValueError as e:
    print("Ben:", e)
print(asha.owner, asha.balance, asha.bank)
for t in asha.history:
    print(" ", t)</div>
  <div class="fx" data-lang="text">Ben: insufficient funds
Asha 120 PocketBank
  Transaction(kind='open', amount=100)
  Transaction(kind='deposit', amount=50)
  Transaction(kind='withdraw', amount=30)</div>
  <p>The account was built by the class method from a CSV line; every change went through a validated method; <code>balance</code> is a read-only property over <code>_balance</code>; and <code>history</code> returns a tuple of frozen records, so callers can read it but neither append to it nor edit an entry.</p>
  <h2 id="pc-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: a mutable class attribute</span><p>Symptom: one object's data shows up in another (Ben's history has Asha's deposit). Cause: <code>history = []</code> in the class body. Fix: create it in <code>__init__</code>, or <code>field(default_factory=list)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>self.count += 1</code> for a shared counter</span><p>Symptom: the class counter stays 0 while every object has its own 1. Fix: <code>Account.count += 1</code> or <code>type(self).count += 1</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting <code>self</code></span><p>In the signature: "takes 0 positional arguments but 1 was given". In the body: a bare <code>balance = …</code> makes a local variable and the object never changes.</p></div>
  <div class="callout trap"><span class="label">Trap: hard-coding the class in a classmethod</span><p><code>return Account(...)</code> returns the parent type for every child class. Use <code>cls(...)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: treating <code>__x</code> as private or secure</span><p>It is renamed, not hidden: <code>obj._Account__x</code> works. Use one underscore for "internal"; use two only to avoid name clashes with subclasses.</p></div>
  <div class="callout trap"><span class="label">Trap: a property that reads itself</span><p><code>return self.balance</code> inside the <code>balance</code> getter recurses until RecursionError. Store the data in <code>self._balance</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: a mutable default argument in <code>__init__</code></span><p><code>def __init__(self, history=[])</code> shares one list across every call, the same bug as the class attribute in a new place (see <a class="xref" data-note="py_functions">Functions</a>). Use <code>history=None</code> and <code>self.history = history if history is not None else []</code>.</p></div>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Class and object</h3>
  <ul>
    <li><b>Class</b>: user-defined type grouping attributes (data) and methods (functions). <b>Object/instance</b>: a value of that type, made by calling the class: <code>Account("Asha", 100)</code>.</li>
    <li>Methods live once, on the class (<code>"deposit" in vars(Account)</code>); data lives on each instance (<code>vars(asha)</code>).</li>
    <li>A class is a type like <code>int</code>: <code>type(asha) is Account</code>, <code>isinstance(asha, Account)</code>.</li>
  </ul>
  <h3>self and method calls</h3>
  <ul>
    <li><code>obj.m(a)</code> ≡ <code>type(obj).m(obj, a)</code>. <code>self</code> is just the first parameter's conventional name.</li>
    <li><code>obj.m</code> is a <b>bound method</b>: <code>m.__func__</code> (the function) + <code>m.__self__</code> (the object).</li>
    <li>Missing <code>self</code> in the signature → <code>takes 0 positional arguments but 1 was given</code>. Bare <code>balance = …</code> in a method is a local.</li>
  </ul>
  <h3>__init__ and __new__</h3>
  <ul>
    <li><code>C(a)</code> ≡ <code>o = C.__new__(C); o.__init__(a); return o</code>. <code>__new__</code> creates, <code>__init__</code> initialises.</li>
    <li><code>__init__</code> must return <code>None</code> (else <code>TypeError</code>). Validate arguments there; create every attribute there.</li>
    <li>Override <code>__new__</code> only for immutable subclasses (<code>class Money(int)</code>), singletons, caching.</li>
  </ul>
  <h3>Instance vs class attributes</h3>
  <table class="tbl">
    <tr><th></th><th>Instance attribute</th><th>Class attribute</th></tr>
    <tr><td>Created by</td><td><code>self.x = v</code></td><td><code>x = v</code> in class body</td></tr>
    <tr><td>Stored in</td><td><code>vars(obj)</code> / <code>obj.__dict__</code></td><td><code>vars(C)</code></td></tr>
    <tr><td>Shared?</td><td>no</td><td>yes, by all instances</td></tr>
    <tr><td>Use for</td><td>per-object state</td><td>constants, true class-wide settings</td></tr>
  </table>
  <ul>
    <li><b>Read</b>: data descriptors (properties) on the class → <code>vars(obj)</code> → class → parents (MRO) → <code>AttributeError</code>.</li>
    <li><b>Write</b> <code>obj.x = v</code> always writes to <code>vars(obj)</code> (shadows a class attribute), unless <code>x</code> is a property.</li>
    <li>Shared counter: <code>Account.count += 1</code> or <code>type(self).count += 1</code>, never <code>self.count += 1</code>.</li>
  </ul>
  <h3>Instance, class and static methods</h3>
  <table class="tbl">
    <tr><th>Kind</th><th>Receives</th><th>Use for</th></tr>
    <tr><td>instance</td><td><code>self</code></td><td>behaviour using the object's data</td></tr>
    <tr><td><code>@classmethod</code></td><td><code>cls</code> (class it was called on)</td><td>alternative constructors (<code>from_csv</code>, <code>dict.fromkeys</code>), class-wide state</td></tr>
    <tr><td><code>@staticmethod</code></td><td>nothing</td><td>helper that belongs with the class</td></tr>
  </table>
  <p>Alternative constructors must return <code>cls(...)</code>, not the class name, so subclasses get their own type.</p>
  <h3>Encapsulation</h3>
  <ul>
    <li>No access modifiers. <code>_x</code> = internal by convention. <code>__x</code> in class <code>C</code> → stored as <code>_C__x</code> (name mangling; only inside the class body; names ending in <code>__</code> are not mangled).</li>
    <li>Mangling prevents clashes with subclass attributes; it is not security (<code>obj._C__x</code> works).</li>
    <li><code>obj.__x = v</code> from outside the class creates an unrelated attribute literally named <code>__x</code>.</li>
  </ul>
  <h3>@property</h3>
  <div class="fx" data-lang="py">@property
def balance(self):            # read: obj.balance
    return self._balance
@balance.setter
def balance(self, v):         # write: obj.balance = v  (omit for read-only)
    ...</div>
  <ul>
    <li>No setter → assignment raises <code>AttributeError: property 'balance' of 'Account' object has no setter</code>.</li>
    <li>Properties are data descriptors: they win over the instance <code>__dict__</code>.</li>
    <li>Store the value under another name (<code>_balance</code>); reading <code>self.balance</code> inside the getter → <code>RecursionError</code>.</li>
    <li>Start with plain attributes; switch to a property later without changing callers. Keep getters cheap.</li>
  </ul>
  <h3>Dataclasses</h3>
  <ul>
    <li><code>@dataclass</code> generates <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> from annotated fields; types are not checked.</li>
    <li><code>frozen=True</code> → assignment raises <code>FrozenInstanceError</code>, and the class is hashable. <code>order=True</code> → <code>&lt; &lt;= &gt; &gt;=</code> comparing fields as a tuple. <code>slots=True</code> → less memory, no new attributes.</li>
    <li>Plain <code>@dataclass</code> (eq, not frozen) sets <code>__hash__ = None</code>: unhashable.</li>
    <li><code>field(default_factory=list)</code> for mutable defaults (a bare <code>[]</code> raises <code>ValueError</code>); <code>field(compare=False)</code>; <code>__post_init__</code> for validation.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Mutable class attribute (<code>history = []</code>) is shared by all instances.</li>
    <li><code>self.count += 1</code> on a class counter creates an instance attribute; the class value stays 0.</li>
    <li>Mutable default argument <code>def __init__(self, history=[])</code> is shared across calls; use <code>None</code>.</li>
    <li>Hard-coding <code>Account(...)</code> in a classmethod returns the parent type for subclasses.</li>
    <li>Property getter reading its own name recurses forever.</li>
    <li>Attributes created outside <code>__init__</code> may not exist yet → <code>AttributeError</code>.</li>
  </ul>

  <h2 id="pc-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class and an object?</summary><div class="qa-body">A class is a user-defined type: it declares which data its objects hold and which methods they support. An object (instance) is one value of that type with its own data, created by calling the class. Methods are stored once on the class and shared; instance data is stored on each object.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>self</code>?</summary><div class="qa-body">The instance a method was called on, passed automatically as the first argument. <code>asha.deposit(50)</code> runs <code>Account.deposit(asha, 50)</code>. <code>self</code> is a naming convention, not a keyword; Python makes it explicit because methods are ordinary functions stored on the class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a bound method?</summary><div class="qa-body">The object you get from <code>obj.method</code> (without calling it): the function plus the instance, stored as <code>__func__</code> and <code>__self__</code>. Calling it passes the instance as the first argument. A new bound method object is created on each access, so <code>a.m == a.m</code> is True but <code>a.m is a.m</code> is False.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__init__</code> a constructor? How does it differ from <code>__new__</code>?</summary><div class="qa-body"><code>__new__</code> is the constructor: a static method that creates and returns the new, empty instance. <code>__init__</code> is the initialiser: it receives that instance and sets its attributes, and must return <code>None</code>. You override <code>__new__</code> only for immutable types (subclassing <code>int</code>, <code>str</code>, <code>tuple</code>), singletons or instance caching.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if <code>__init__</code> returns a value?</summary><div class="qa-body"><code>TypeError: __init__() should return None, not 'int'</code>. The result of <code>Class(...)</code> is the instance created by <code>__new__</code>, so any other return value from <code>__init__</code> is an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Instance attribute vs class attribute: where does each live, and how does lookup work?</summary><div class="qa-body">Instance attributes live in the object's <code>__dict__</code>; class attributes in the class's <code>__dict__</code>, shared by all instances. Reading <code>obj.x</code> checks data descriptors on the class (properties), then the instance, then the class and its parents in MRO order. Writing <code>obj.x = v</code> always writes to the instance, shadowing any class attribute of that name.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>class A: x = 1</code>; <code>a, b = A(), A()</code>; <code>a.x = 2</code>; <code>A.x = 3</code>; <code>print(a.x, b.x, A.x)</code></summary><div class="qa-body"><code>2 3 3</code>. <code>a.x = 2</code> created an instance attribute on <code>a</code> that shadows the class attribute. <code>b</code> has no instance attribute, so it reads the class attribute, which was changed to 3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>class A: n = 0</code> with <code>def __init__(self): self.n += 1</code>; then <code>A(); a = A(); print(A.n, a.n)</code></summary><div class="qa-body"><code>0 1</code>. <code>self.n += 1</code> is <code>self.n = self.n + 1</code>: the read finds the class's 0, but the assignment creates an instance attribute with 1. The class counter never changes. Use <code>A.n += 1</code> or <code>type(self).n += 1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a list as a class attribute (or as a default argument) a bug?</summary><div class="qa-body">It is created once, when the class body (or the <code>def</code>) runs, and every instance shares that single list, so appending through one instance shows up in all of them. With <code>def __init__(self, history=[])</code>, <code>a.history is b.history</code> is True. Create the list per object: <code>self.history = []</code>, or <code>history=None</code> then <code>history if history is not None else []</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Instance vs class vs static method: when do you use each?</summary><div class="qa-body">Instance method (<code>self</code>) for behaviour that uses the object's data. <code>@classmethod</code> (<code>cls</code>) for alternative constructors such as <code>from_csv</code> or <code>datetime.fromisoformat</code>, and for class-wide settings. <code>@staticmethod</code> for a helper that needs neither but belongs with the class; if other modules use it too, make it a module-level function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should an alternative constructor return <code>cls(...)</code> rather than the class name?</summary><div class="qa-body">Subclasses inherit the classmethod, and <code>cls</code> is whichever class it was called on. <code>StudentAccount.from_csv(...)</code> then returns a <code>StudentAccount</code> with the child's settings. Hard-coding <code>Account(...)</code> returns a parent instance and silently ignores the child's rules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is name mangling, and is it a security feature?</summary><div class="qa-body">Inside a class body, <code>__x</code> (two leading underscores, not two trailing) is renamed to <code>_ClassName__x</code>. Its purpose is to stop a subclass from overwriting a base class's attribute by reusing the name. It is not security: <code>obj._Account__x</code> still works. A single underscore is the usual "internal" marker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>@property</code>, and what can go wrong?</summary><div class="qa-body">To make an attribute read-only, to validate or normalise on assignment, or to compute a value on read, all while callers keep attribute syntax, so it can be added later without breaking them. Pitfalls: a getter that reads <code>self.balance</code> inside the <code>balance</code> property recurses until <code>RecursionError</code> (store the value in <code>self._balance</code>), and slow or side-effecting getters surprise readers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a property take priority over an instance attribute with the same name?</summary><div class="qa-body">A property is a <strong>data descriptor</strong>: a class attribute that defines <code>__get__</code> and <code>__set__</code>. Attribute lookup checks data descriptors on the type before the instance <code>__dict__</code>, so both reading and assigning go through the property. Plain methods are non-data descriptors (only <code>__get__</code>), which is why an instance attribute can shadow a method.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@dataclass</code> generate, and what do <code>frozen</code>, <code>order</code> and <code>slots</code> add?</summary><div class="qa-body">It generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> from the annotated fields. <code>frozen=True</code> blocks assignment (raising <code>FrozenInstanceError</code>) and generates <code>__hash__</code>; <code>order=True</code> adds <code>&lt; &lt;= &gt; &gt;=</code> comparing the fields as a tuple; <code>slots=True</code> adds <code>__slots__</code> for lower memory and no stray attributes. <code>__post_init__</code> runs after the generated <code>__init__</code> for validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a regular <code>@dataclass</code> hashable?</summary><div class="qa-body">No. With the default <code>eq=True</code> and <code>frozen=False</code>, the dataclass sets <code>__hash__ = None</code>, because an object that compares by value but can change would break sets and dicts. <code>@dataclass(frozen=True)</code> makes it hashable by its fields; <code>unsafe_hash=True</code> forces a hash on a mutable class (rarely a good idea).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Dataclass vs NamedTuple vs pydantic model?</summary><div class="qa-body"><code>NamedTuple</code>: an immutable tuple with named fields, unpackable and indexable, lightweight. <code>@dataclass</code>: a normal class with generated boilerplate; mutable by default, can have methods, no runtime type checks. pydantic <code>BaseModel</code>: validates and converts types at runtime and serialises to JSON, the right choice for data from users, files and APIs (FastAPI uses it).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__slots__</code> for?</summary><div class="qa-body">Declaring <code>__slots__ = ("x", "y")</code> replaces the per-instance <code>__dict__</code> with fixed storage for those names. Instances use noticeably less memory (useful for millions of small objects) and assigning any other attribute raises <code>AttributeError</code>, which also catches typos. The trade-off: no dynamic attributes, and every class in a hierarchy must declare slots to get the benefit.</div></details>
</main>
`
});
