// notes/python/py_classes.js — Classes & Objects
Object.assign(TOPIC_CONTENT, {
  "py_classes": `<main>
<h1>Classes &amp; Objects</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Classes &amp; Objects</span></div>
  <p class="lead">A class lets you keep a piece of data and the functions that are allowed to change it in one place, so the two cannot drift apart. This note builds that idea one need at a time on a single running example, <strong>PocketBank</strong>, a tiny wallet app with two customers, Asha and Ben: what a class and an object are, what <code>self</code> really is (Python turns <code>asha.deposit(50)</code> into <code>Account.deposit(asha, 50)</code>), what <code>__init__</code> does, instance versus class attributes and the shared-list trap, the three kinds of methods, encapsulation with <code>_</code> and <code>__</code>, <code>@property</code> with validation, and dataclasses. Every code block was run and its real output is shown under it.</p>

  <h2 id="pc-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
    <defs><marker id="pc-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="200" y="6" width="240" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="26" text-anchor="middle" font-size="12">Object-Oriented Python: the map</text>
    <line x1="320" y1="36" x2="115" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="36" x2="320" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="36" x2="525" y2="66" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="15" y="66" width="200" height="44" rx="6" class="fg sg" stroke-width="2.5"/><text x="115" y="85" text-anchor="middle" font-size="12" font-weight="700">Classes &amp; Objects</text><text x="115" y="101" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE: bundle + protect</text>
    <rect x="220" y="66" width="200" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="85" text-anchor="middle" font-size="12">Inheritance, Polymorphism</text><text x="320" y="101" text-anchor="middle" class="tm" font-size="10">reuse, many forms, design</text>
    <rect x="425" y="66" width="200" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="525" y="85" text-anchor="middle" font-size="12">Dunder Methods</text><text x="525" y="101" text-anchor="middle" class="tm" font-size="10">act like built-in types</text>
    <line x1="215" y1="88" x2="218" y2="88" stroke="currentColor" marker-end="url(#pc-a0)"/>
    <path d="M115,110 Q320,170 520,114" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pc-a0)"/>
    <text x="320" y="160" text-anchor="middle" class="tm" font-size="11">both later notes extend the Account class built here</text>
  </svg><figcaption>The Object-Oriented Python group. You are on the green note, the first one after the map. The other two notes start from the <code>Account</code> class you finish here.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_oop">Object-Oriented Python: the map</a>, <a class="xref" data-note="py_functions">Functions</a> and <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a></b><span>You can store a record in a dict and write functions that change it. The map note showed where that stops working: the data and the rules live apart, so anyone can change the balance without going through the rules, and a typo in a key silently creates a new key.</span></li>
    <li><b>This note adds: the class, and ways to protect what is inside it</b><span>One <code>Account</code> blueprint, many account objects, methods that travel with the data, attributes that are per object or shared, constructors, and three levels of protection (naming conventions, name mangling, properties). Dataclasses remove the boilerplate.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a></b><span>PocketBank needs a savings account and a current account that are almost, but not quite, the same as <code>Account</code>. Copying the class would duplicate every rule. Inheritance reuses it. In parallel, <a class="xref" data-note="py_dunder">Dunder Methods</a> makes accounts and money print, compare and add like built-in values.</span></li>
  </ol>

  <h2 id="pc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it, and its weakness raises the next question. All numbers come from PocketBank: Asha opens with ₹100, deposits 50 and withdraws 30 (balance 120); Ben opens with ₹50 and tries to withdraw 80.</p>
  <ol class="story">
    <li><b>Class &amp; object</b><span>Q: how do we stop the balance and the rules for changing it from drifting apart? → Put both in one <code>Account</code> class and build one object per customer: <code>asha.balance</code> is 120 and <code>ben.withdraw(80)</code> is refused. But inside the methods we keep writing <code>self</code>. What is it?</span></li>
    <li><b>self</b><span>Q: how does one method, stored once on the class, know which account to change? → Python passes the object in as the first argument: <code>asha.deposit(50)</code> runs <code>Account.deposit(asha, 50)</code>. But where do <code>owner</code> and <code>balance</code> come from in the first place?</span></li>
    <li><b>__init__</b><span>Q: how does a new account get its starting data? → <code>Account("Asha", 100)</code> makes an empty object (<code>__new__</code>), then <code>__init__</code> fills it: <code>{}</code> → <code>{'owner': 'Asha', 'balance': 100}</code>. But some data, like the bank's name, is the same for every account. Should each object store a copy?</span></li>
    <li><b>Instance vs class attributes</b><span>Q: what is per account and what is shared? → Instance attributes live in the object, class attributes once on the class; lookup tries the object first. But a list put on the class is shared too: Ben's history shows Asha's deposit. So mutable data goes in <code>__init__</code>. Now, not every method needs one account…</span></li>
    <li><b>Instance, class and static methods</b><span>Q: what about a method that builds an account from a line of text, or a helper that checks an amount? → <code>@classmethod</code> receives the class (<code>from_csv("Asha, 100")</code>), <code>@staticmethod</code> receives nothing. But any code can still write <code>asha.balance = -500</code>…</span></li>
    <li><b>Encapsulation</b><span>Q: how do we protect the rule "balance never below 0"? → Keep the data internal (<code>_balance</code>, or <code>__balance</code>, which Python renames to <code>_Account__balance</code>) and change it only through methods. But now callers must write <code>get_balance()</code> instead of <code>.balance</code>, and we cannot check values on assignment…</span></li>
    <li><b>@property</b><span>Q: can an attribute look plain from outside but run code inside? → A property: <code>asha.balance</code> is read-only, <code>asha.owner = "  asha k"</code> is cleaned to <code>"Asha K"</code>, an empty name is refused. But small record classes still need <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> written by hand, again and again…</span></li>
    <li><b>Dataclasses</b><span>Q: can Python write that boilerplate for us? → <code>@dataclass</code> generates it from typed fields; <code>frozen=True</code> makes a <code>Transaction</code> unchangeable, <code>default_factory=list</code> gives each account its own history. Then: one account type is not enough, which is where <a class="xref" data-note="py_inheritance">Inheritance</a> begins.</span></li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank branch. The <strong>class</strong> is the account-opening form and the rule book; each <strong>object</strong> is one customer's passbook. The cashier (a <strong>method</strong>) always asks "whose passbook?" (<code>self</code>). The branch name printed on every form is a <strong>class attribute</strong>. The locker behind the counter is <strong>encapsulation</strong>; the counter window where the cashier checks your note before accepting it is a <strong>property</strong>. A pre-printed slip that you only fill in is a <strong>dataclass</strong>.</p></div>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Classes &amp; Objects</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Class &amp; object</div>
        <ul>
          <li><b>Class</b> — blueprint: which data, which behaviour; <b>object / instance</b> — one thing built from it</li>
          <li><b>Attribute</b> — data on an object (<code>asha.balance</code>); <b>method</b> — function on the class (<code>asha.deposit(50)</code>)</li>
          <li>Each object keeps its own data: Asha 120, Ben 50</li>
          <li>💡 form + rule book vs one passbook per customer</li>
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
      <div class="rm-item rm-done" data-target="pc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pc-bundle"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">From Dict to Class</span><span class="rm-sub">Bundle data with its rules</span></div></div>
      <div class="rm-item rm-done" data-target="pc-self"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">What self Really Is</span><span class="rm-sub">obj.method() → Class.method(obj)</span></div></div>
      <div class="rm-item rm-done" data-target="pc-init"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Building an Object: __init__</span><span class="rm-sub">__new__ makes, __init__ fills</span></div></div>
      <div class="rm-item rm-done" data-target="pc-attrs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Instance vs Class Attributes</span><span class="rm-sub">Lookup order, the shared-list trap</span></div></div>
      <div class="rm-item rm-done" data-target="pc-methods"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Three Kinds of Methods</span><span class="rm-sub">self, cls, or nothing</span></div></div>
      <div class="rm-item rm-done" data-target="pc-encap"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Encapsulation</span><span class="rm-sub">Protect the invariant: _ and __</span></div></div>
      <div class="rm-item rm-done" data-target="pc-prop"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Properties</span><span class="rm-sub">Attribute syntax, method control</span></div></div>
      <div class="rm-item rm-done" data-target="pc-dc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Dataclasses</span><span class="rm-sub">Generated boilerplate</span></div></div>
      <div class="rm-item rm-done" data-target="pc-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">The finished Account</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that bite</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pc-bundle"><span class="num">01</span>From Dict to Class</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>With dicts and functions (<a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>, <a class="xref" data-note="py_functions">Functions</a>) we can store an account and write a <code>withdraw</code> function that refuses an overdraft. But nothing forces anyone to use that function. How do we keep the balance and the rules for changing it together, so they cannot drift apart?</p></div>
  <h3>The running example: PocketBank, version 0</h3>
  <p>PocketBank is a tiny wallet app. Two customers: <strong>Asha</strong> opens with ₹100, deposits ₹50 and withdraws ₹30, so she should have ₹120. <strong>Ben</strong> opens with ₹50 and later tries to withdraw ₹80, which must be refused. The one rule of the bank: <em>a balance can never go below zero</em>. Here is the first version, written with only what you already know.</p>
  <div class="fx" data-lang="py"># PocketBank, version 0: data in dicts, rules in loose functions
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
  <h3>The fix: one class holds both</h3>
  <p>In plain words: a <strong>class</strong> is a new type you design. It says what data each thing of that type has and what that thing can do. An <strong>object</strong> (also called an <strong>instance</strong>) is one thing built from the class, with its own data. Asha's account and Ben's account are two objects of one class, <code>Account</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>An architect's drawing and the houses built from it. The drawing (class) is made once; each house (object) has its own furniture (data). Painting one house changes neither the drawing nor the other houses.</p></div>
  <p>Before the code, read the shape. <code>class Account:</code> starts the blueprint. Inside it, every <code>def</code> is a <strong>method</strong>, a function that belongs to the class. <code>__init__</code> is a special method that Python runs when you build a new account; it stores the starting data. Every method's first parameter is <code>self</code>, which means "the account being worked on" (section 02 explains exactly how). <code>self.balance = balance</code> stores a value on the object; such a value is called an <strong>attribute</strong>.</p>
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
  <p>After the code. <code>Account("Asha", 100)</code> built one object and <code>Account("Ben", 50)</code> another; each has its own <code>owner</code> and <code>balance</code>. <code>asha.deposit(50)</code> called the method on Asha's object only. <code>type(asha).__name__</code> is <code>Account</code>: the class really is a new type, just like <code>int</code> or <code>list</code>. <code>asha is ben</code> is False: two separate objects. The last line, Ben withdrawing 80, raised <code>ValueError: insufficient funds</code>, because the rule now travels with the data. The direct write <code>asha.balance = -500</code> is still possible; section 06 closes that door.</p>
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
  <div class="callout trap"><span class="label">Trap</span><p>A class does not by itself protect anything. Version 1 still lets anyone write <code>asha.balance = -500</code>. Bundling is step one; protecting the rule (encapsulation, section 06) is a separate step.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: What self Really Is.</b> The method <code>deposit</code> is written once, on the class, yet it changed Asha's balance and not Ben's. How does one function know which object it is working on?</div>

  <h2 id="pc-self"><span class="num">02</span>What self Really Is</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Every method starts with a parameter called <code>self</code>, but when we call <code>asha.deposit(50)</code> we pass only one argument. Where does the second one come from, and how does the method know it should change Asha and not Ben?</p></div>
  <p>In plain words: <code>self</code> is the object the method was called on. When you write <code>asha.deposit(50)</code>, Python finds <code>deposit</code> on the class and calls it with <code>asha</code> slipped in as the first argument. Nothing more magical happens.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Building an Object.</b> We know how a method finds its object. But the object had <code>owner</code> and <code>balance</code> from the moment it existed. Who put them there, and when?</div>

  <h2 id="pc-init"><span class="num">03</span>Building an Object: __init__</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p><code>Account("Asha", 100)</code> looks like a function call, and yet it returns an object that already has an owner and a balance. What exactly happens between the call and the finished object, and where should a check like "no negative opening balance" go?</p></div>
  <p>In plain words: calling a class does two steps. First Python makes a new, empty object (a method called <code>__new__</code> does this; you almost never write it). Then it calls <code>__init__</code> on that empty object with your arguments, and <code>__init__</code> fills in the attributes. <code>__init__</code> is often called the <strong>constructor</strong>, although strictly it is the <em>initialiser</em>: the object already exists when it runs.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Instance vs Class Attributes.</b> Every account now gets its own owner and balance. But some facts, like the bank's name, are the same for every account. Should each object carry its own copy?</div>

  <h2 id="pc-attrs"><span class="num">04</span>Instance vs Class Attributes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Asha's balance must be hers alone, but the bank name "PocketBank" and the count of accounts opened belong to the bank as a whole. Where does shared data live, how does Python find it when we write <code>asha.bank</code>, and what goes wrong when the shared data is a list?</p></div>
  <p>In plain words: an <strong>instance attribute</strong> is stored in one object (set with <code>self.x = …</code>, usually in <code>__init__</code>). A <strong>class attribute</strong> is written directly in the class body and stored once, on the class. Reading <code>asha.bank</code> first looks in Asha's object, and if the name is not there, looks in the class.</p>
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
    <tr><td><code>asha.deposit</code></td><td>no</td><td>yes: a function</td><td>bound method (section 02)</td></tr>
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
  <p>Now suppose PocketBank wants a transaction history. A tempting first try puts <code>history = []</code> in the class body, next to <code>bank</code>.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Three Kinds of Methods.</b> Every method so far works on one account. But "build an account from the text line <code>Asha, 100</code>" happens before any account exists, and "is −5 a valid amount?" needs no account at all. Where do such functions belong?</div>

  <h2 id="pc-methods"><span class="num">05</span>Three Kinds of Methods</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>PocketBank imports customers from a CSV file, one line like <code>"Asha, 100"</code> each. The code that turns a line into an account clearly belongs with <code>Account</code>, but there is no account yet to call it on, so there is no <code>self</code>. And a check like "is this a valid amount?" needs no account at all. How do we write methods that do not receive an object?</p></div>
  <p>In plain words: there are three kinds of method, told apart by what they receive first. An <strong>instance method</strong> (the normal kind) receives the object, <code>self</code>. A <strong>class method</strong>, marked <code>@classmethod</code>, receives the class itself, by convention named <code>cls</code>; its usual job is to build objects in another way. A <strong>static method</strong>, marked <code>@staticmethod</code>, receives nothing extra; it is a plain function kept inside the class because it belongs there. (A line starting with <code>@</code> is a <strong>decorator</strong>, which changes the function below it; <a class="xref" data-note="py_decorators">Decorators</a> shows how they work inside.)</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank branch. Instance method: the cashier updating <em>your</em> passbook. Class method: the account-opening desk, which makes a new passbook from a filled-in form. Static method: the note-counting machine on the desk, which belongs to the branch but knows nothing about any customer.</p></div>
  <table class="tbl">
    <tr><th>Kind</th><th>First parameter</th><th>Can use</th><th>Typical job in PocketBank</th></tr>
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
  <p>Later notes add child classes such as a student account (opening balance 0 allowed). A child class inherits <code>from_csv</code>. Because <code>cls</code> is whichever class the method was called on, the child gets the right type back. A version that hard-codes <code>Account(...)</code> does not:</p>
  <div class="fx" data-lang="py">class StudentAccount(Account):     # a child class (the Inheritance note explains this fully)
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
  <div class="bridge"><b>What this still can't tell us → next: Encapsulation.</b> Our methods enforce the rules, but only if people call them. Any line anywhere can still write <code>asha.balance = -500</code> and skip <code>withdraw</code> entirely. How do we protect the rule itself?</div>

  <h2 id="pc-encap"><span class="num">06</span>Encapsulation: Protecting the Invariant</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>PocketBank's one rule is "a balance never goes below zero". <code>withdraw</code> checks it, but the attribute <code>balance</code> is open to everyone. How do we make sure the data changes only through the methods that check the rule?</p></div>
  <p>A rule about an object's data that must hold at every moment is called an <strong>invariant</strong>. Ours is <code>balance ≥ 0</code>. First see it broken:</p>
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
  <p>In plain words: <strong>encapsulation</strong> means keeping an object's data inside it and letting it change only through methods that keep the invariant. Python has no truly private attributes. It has two naming tools instead.</p>
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
  <p>Mangling exists so that a child class (next note) can use the same name without overwriting the parent's data by accident:</p>
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
  <div class="callout trap"><span class="label">Trap</span><p>Name mangling is not access control. <code>obj._Account__balance</code> always works. And encapsulation is not abstraction: encapsulation protects <em>data</em> (who may change it); abstraction simplifies the <em>interface</em> (what a caller needs to know). The <a class="xref" data-note="py_inheritance">Inheritance</a> note covers abstraction with ABCs.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Properties.</b> The balance is safe, but callers now write <code>asha.get_balance()</code> instead of <code>asha.balance</code>, and every existing line that used <code>.balance</code> breaks. Can an attribute look plain from outside and still run a check inside?</div>

  <h2 id="pc-prop"><span class="num">07</span>Properties: Attribute Syntax, Method Control</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We want three things at once: callers keep writing <code>asha.balance</code>; nobody can assign to it; and assigning <code>asha.owner = "  asha k "</code> is cleaned up or refused. Plain attributes cannot run code, and getter/setter methods change the syntax. Is there a middle way?</p></div>
  <p>In plain words: a <strong>property</strong> is a method that is used like an attribute. The <strong>getter</strong>, written under <code>@property</code>, runs when you read <code>obj.name</code>. An optional <strong>setter</strong>, written under <code>@name.setter</code>, runs when you assign <code>obj.name = value</code>, and can check or clean the value. A property with no setter is read-only. The real value is stored under a different name, usually with one underscore (<code>_balance</code>).</p>
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
  <h3>How a property wins the lookup</h3>
  <p>Section 04 said lookup checks the object first. A property is the exception: it is a special kind of class attribute (a <em>data descriptor</em>) that Python checks <em>before</em> the object's own data. That is why <code>asha.balance = …</code> cannot sneak a value into <code>vars(asha)</code>: the property intercepts both reading and writing.</p>
  <h3>The big practical win</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Dataclasses.</b> PocketBank also needs small record types, like a <code>Transaction</code> with a kind and an amount. For each one we would write the same <code>__init__</code>, a <code>__repr__</code> so it prints nicely and an <code>__eq__</code> so two equal records compare equal. Can Python write that for us?</div>

  <h2 id="pc-dc"><span class="num">08</span>Dataclasses</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Every deposit and withdrawal should be stored as a small record: kind, amount, maybe a note. Writing a full class for it means a boring <code>__init__</code> that copies arguments into attributes, plus <code>__repr__</code> and <code>__eq__</code>. Ten record types means ten copies of the same code. How do we avoid it?</p></div>
  <p>In plain words: a <strong>dataclass</strong> is a class where you only list the fields with their types, and the decorator <code>@dataclass</code> writes <code>__init__</code>, <code>__repr__</code> (how it prints) and <code>__eq__</code> (how <code>==</code> compares) for you. (<code>__repr__</code> and <code>__eq__</code> are "dunder" methods; the <a class="xref" data-note="py_dunder">Dunder Methods</a> note explains them. Here you only need to know that a dataclass writes them.)</p>
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
  <p>A dataclass is still a normal class: it can have methods. <code>field(default_factory=list)</code> calls <code>list()</code> for each new object, the dataclass version of "create the list in <code>__init__</code>" from section 04. <code>__post_init__</code> runs right after the generated <code>__init__</code>, the place for validation.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have built every piece one at a time. The next section puts them together into PocketBank's finished <code>Account</code> and shows which piece answers which question.</div>

  <h2 id="pc-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Class, object, <code>self</code>, <code>__init__</code>, two kinds of attributes, three kinds of methods, underscores, properties, dataclasses: are these separate features, or one design where each piece fixes a gap left by the previous one?</p></div>
  <figure class="viz"><svg viewBox="0 0 700 250" width="700">
    <defs><marker id="pc-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="10" width="150" height="46" rx="7" class="fr sr"/><text x="85" y="30" text-anchor="middle" font-size="11.5" font-weight="700">dict + functions</text><text x="85" y="46" text-anchor="middle" class="tm" font-size="10">Asha → −380, "balnce"</text>
    <line x1="160" y1="33" x2="188" y2="33" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="190" y="10" width="150" height="46" rx="7" class="fb sb"/><text x="265" y="30" text-anchor="middle" font-size="11.5" font-weight="700">class + object</text><text x="265" y="46" text-anchor="middle" class="tm" font-size="10">Asha 120, Ben 50</text>
    <line x1="340" y1="33" x2="368" y2="33" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="370" y="10" width="150" height="46" rx="7" class="fb sb"/><text x="445" y="30" text-anchor="middle" font-size="11.5" font-weight="700">self</text><text x="445" y="46" text-anchor="middle" class="tm" font-size="10">Account.deposit(asha, 50)</text>
    <line x1="520" y1="33" x2="548" y2="33" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="550" y="10" width="140" height="46" rx="7" class="fb sb"/><text x="620" y="30" text-anchor="middle" font-size="11.5" font-weight="700">__init__</text><text x="620" y="46" text-anchor="middle" class="tm" font-size="10">{} → owner, balance</text>
    <line x1="620" y1="56" x2="620" y2="98" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="550" y="100" width="140" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="620" y="120" text-anchor="middle" font-size="11.5" font-weight="700">instance / class attrs</text><text x="620" y="136" text-anchor="middle" class="tm" font-size="10">shared list leaks to Ben</text>
    <line x1="550" y1="123" x2="522" y2="123" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="370" y="100" width="150" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="445" y="120" text-anchor="middle" font-size="11.5" font-weight="700">3 kinds of methods</text><text x="445" y="136" text-anchor="middle" class="tm" font-size="10">from_csv("Asha, 100")</text>
    <line x1="370" y1="123" x2="342" y2="123" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="190" y="100" width="150" height="46" rx="7" class="ft st"/><text x="265" y="120" text-anchor="middle" font-size="11.5" font-weight="700">encapsulation</text><text x="265" y="136" text-anchor="middle" class="tm" font-size="10">_Account__balance</text>
    <line x1="190" y1="123" x2="162" y2="123" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="10" y="100" width="150" height="46" rx="7" class="ft st"/><text x="85" y="120" text-anchor="middle" font-size="11.5" font-weight="700">@property</text><text x="85" y="136" text-anchor="middle" class="tm" font-size="10">read-only balance</text>
    <line x1="85" y1="146" x2="85" y2="188" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="10" y="190" width="150" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="210" text-anchor="middle" font-size="11.5" font-weight="700">@dataclass</text><text x="85" y="226" text-anchor="middle" class="tm" font-size="10">frozen Transaction</text>
    <line x1="160" y1="213" x2="268" y2="213" stroke="currentColor" marker-end="url(#pc-a2)"/>
    <rect x="270" y="190" width="420" height="46" rx="7" class="fg sg"/><text x="480" y="210" text-anchor="middle" font-size="11.5" font-weight="700">finished Account → next notes: inheritance, dunder methods</text><text x="480" y="226" text-anchor="middle" class="tm" font-size="10">Asha 120 with history open 100, deposit 50, withdraw 30; Ben's 80 refused</text>
  </svg><figcaption>Each box is a section of this note; each arrow is "the gap this leaves is fixed by the next". Small grey text is the running example's value.</figcaption></figure>
  <p>Here is the finished PocketBank <code>Account</code>, using every piece of the note at once. Read the comments: each one names the section that introduced the line.</p>
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
  <p>Asha's account was built by the class method from a CSV line, her deposits and withdrawal went through validated methods, the balance is a read-only property over protected data, and her history is a tuple of frozen dataclass records that nobody can change from outside. Ben's overdraft is refused by the same rule.</p>
  <table class="tbl"><caption>Every concept, what it is built from, and its value on PocketBank</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Class &amp; object</td><td>a type definition + calls to it</td><td>how to keep data and rules together?</td><td>asha (120), ben (50): two objects, one class</td><td>any data with rules or behaviour</td></tr>
    <tr><td><code>self</code></td><td>attribute lookup + bound methods</td><td>which object does a method change?</td><td><code>asha.deposit(50)</code> = <code>Account.deposit(asha, 50)</code></td><td>first parameter of every instance method</td></tr>
    <tr><td><code>__init__</code></td><td><code>__new__</code> + an initialiser</td><td>how does a new object get its data?</td><td><code>{}</code> → <code>{'owner': 'Asha', 'balance': 100}</code></td><td>always; validate arguments here</td></tr>
    <tr><td>Instance vs class attribute</td><td>the two <code>__dict__</code>s + lookup order</td><td>what is per object, what is shared?</td><td><code>bank</code> shared; class-level <code>history</code> leaked Asha's deposit to Ben</td><td>class attrs for constants only</td></tr>
    <tr><td>Instance / class / static methods</td><td>what is passed first: object, class, nothing</td><td>where do builders and helpers go?</td><td><code>from_csv</code> → StudentAccount for the child class</td><td>alt. constructors → classmethod</td></tr>
    <tr><td>Encapsulation</td><td>methods + <code>_</code>/<code>__</code> naming</td><td>how to protect the invariant?</td><td><code>_Account__balance</code>; outside <code>__balance = -500</code> harmless</td><td>any invariant</td></tr>
    <tr><td><code>@property</code></td><td>encapsulation + attribute syntax</td><td>checks without changing callers?</td><td>read-only 120; <code>"  asha k"</code> → "Asha K"</td><td>validation, read-only, computed values</td></tr>
    <tr><td><code>@dataclass</code></td><td>a class + generated dunder methods</td><td>how to skip boilerplate for records?</td><td>3 frozen Transactions, sorted 30 &lt; 50 &lt; 100</td><td>records, configs, value objects</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a class bundles data with the methods that change it; <code>self</code> tells a shared method which object to work on; <code>__init__</code> gives each object its own data while class attributes hold what is shared; the three method kinds place builders and helpers; and encapsulation plus properties make sure the data changes only in ways that keep the rules, with dataclasses writing the boilerplate.</strong></p></div>
  <h3>Notes before and after</h3>
  <ul>
    <li><a class="xref" data-note="py_values">Values &amp; Types</a> — names point at objects; mutable vs immutable explains the list trap vs the counter trap.</li>
    <li><a class="xref" data-note="py_functions">Functions</a> — methods are functions; default arguments, <code>*args</code>; a method is a function stored on a class.</li>
    <li><a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> — <code>vars(obj)</code> is literally a dict; hashing explains frozen dataclasses in sets.</li>
    <li><a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a> — SavingsAccount and CurrentAccount extend this Account.</li>
    <li><a class="xref" data-note="py_dunder">Dunder Methods</a> — a Money type and a Statement container make accounts behave like built-ins.</li>
    <li><a class="xref" data-note="py_decorators">Decorators</a> — how <code>@classmethod</code>, <code>@property</code> and <code>@dataclass</code> work inside.</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing how the pieces fit is half the job; the other half is the handful of mistakes that keep appearing in real code and interviews.</div>

  <h2 id="pc-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Which mistakes with classes cost the most time in practice, and how do you spot each one from its symptom?</p></div>
  <div class="callout trap"><span class="label">Trap: a mutable class attribute</span><p>Symptom: one object's data shows up in another (Ben's history has Asha's deposit). Cause: <code>history = []</code> in the class body. Fix: create it in <code>__init__</code>, or <code>field(default_factory=list)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>self.count += 1</code> for a shared counter</span><p>Symptom: the class counter stays 0 while every object has its own 1. Fix: <code>Account.count += 1</code> or <code>type(self).count += 1</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting <code>self</code></span><p>In the signature: "takes 0 positional arguments but 1 was given". In the body: a bare <code>balance = …</code> makes a local variable and the object never changes.</p></div>
  <div class="callout trap"><span class="label">Trap: hard-coding the class in a classmethod</span><p><code>return Account(...)</code> returns the parent type for every child class. Use <code>cls(...)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: treating <code>__x</code> as private or secure</span><p>It is renamed, not hidden: <code>obj._Account__x</code> works. Use one underscore for "internal"; use two only to avoid name clashes with subclasses.</p></div>
  <div class="callout trap"><span class="label">Trap: a property that reads itself</span><p><code>return self.balance</code> inside the <code>balance</code> getter recurses until RecursionError. Store the data in <code>self._balance</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: a mutable default argument in <code>__init__</code></span><p><code>def __init__(self, history=[])</code> shares one list across every call, the same bug as the class attribute in a new place (see <a class="xref" data-note="py_functions">Functions</a>). Use <code>history=None</code> and <code>self.history = history if history is not None else []</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page.</div>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: <strong>PocketBank</strong>. Asha opens with ₹100, deposits 50, withdraws 30 → 120. Ben opens with ₹50; withdrawing 80 is refused. The invariant: balance ≥ 0.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On PocketBank</th><th>Weakness → next</th></tr>
    <tr><td>Class &amp; object</td><td>keep data and rules together?</td><td>asha, ben: one Account class</td><td>what is <code>self</code>?</td></tr>
    <tr><td><code>self</code></td><td>which object does a method change?</td><td><code>Account.deposit(asha, 50)</code></td><td>where does the data come from?</td></tr>
    <tr><td><code>__init__</code></td><td>how is a new object filled?</td><td><code>{}</code> → owner, balance; −50 refused</td><td>what is shared?</td></tr>
    <tr><td>Instance vs class attrs</td><td>per object or shared?</td><td><code>bank</code> shared; class <code>history</code> leaked to Ben</td><td>methods without an object?</td></tr>
    <tr><td>3 method kinds</td><td>builders and helpers?</td><td><code>from_csv</code>, <code>is_valid_amount</code></td><td>data still writable</td></tr>
    <tr><td>Encapsulation</td><td>protect the invariant?</td><td><code>_Account__balance</code></td><td>lost attribute syntax</td></tr>
    <tr><td><code>@property</code></td><td>checks with attribute syntax?</td><td>read-only balance; "Asha K"</td><td>boilerplate for records</td></tr>
    <tr><td><code>@dataclass</code></td><td>generate <code>__init__</code>/<code>__repr__</code>/<code>__eq__</code>?</td><td>frozen Transaction</td><td>one account type only → inheritance</td></tr>
  </table>
  <h3>Rules to remember (the "formulas" of this note)</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Form</th><th>What each part means</th></tr>
    <tr><td>Method call</td><td><code>obj.m(a)</code> ≡ <code>type(obj).m(obj, a)</code></td><td><code>obj</code> becomes the first parameter, <code>self</code></td></tr>
    <tr><td>Object creation</td><td><code>C(a)</code> ≡ <code>o = C.__new__(C); o.__init__(a); return o</code></td><td><code>__new__</code> makes, <code>__init__</code> fills, returns None</td></tr>
    <tr><td>Attribute read</td><td>instance <code>__dict__</code> → class → parents → AttributeError</td><td>properties (data descriptors) are checked first</td></tr>
    <tr><td>Attribute write</td><td><code>obj.x = v</code> writes to <code>vars(obj)</code></td><td>unless <code>x</code> is a property on the class</td></tr>
    <tr><td>Name mangling</td><td><code>__x</code> in class <code>C</code> → <code>_C__x</code></td><td>only inside the class body; names ending in <code>__</code> are not mangled</td></tr>
    <tr><td>Classmethod</td><td><code>C.f(a)</code> → <code>f(C, a)</code>; <code>Child.f(a)</code> → <code>f(Child, a)</code></td><td><code>cls</code> is the class it was called on</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Plain class</b><p>Data with rules or behaviour (an account with an invariant).</p><small>Avoid for a bag of fields with no rules: use a dataclass</small></div>
    <div><b>Class attribute</b><p>Constants and true class-wide settings (<code>bank</code>, <code>min_opening</code>).</p><small>Never a mutable per-object value</small></div>
    <div><b>@classmethod</b><p>Alternative constructors (<code>from_csv</code>, <code>from_dict</code>), class-wide settings.</p><small>Use <code>cls(...)</code>, not the class name</small></div>
    <div><b>@staticmethod</b><p>A helper that belongs with this class and needs no data.</p><small>Used elsewhere too? A module function</small></div>
    <div><b>@property</b><p>Read-only views, validation on assignment, cheap computed values.</p><small>Not for slow or side-effecting work</small></div>
    <div><b>@dataclass</b><p>Records, configs, value objects; <code>frozen=True</code> for things that must not change.</p><small>Does not validate types; pydantic for input data</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Mutable class attribute shared by all objects; <code>self.count += 1</code> creates an instance attribute; forgotten <code>self</code>; <code>Account(...)</code> instead of <code>cls(...)</code> in a classmethod; <code>__x</code> is not security; property getter reading itself; mutable default argument; dataclasses do not check types.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>What does Python run for <code>ben.withdraw(80)</code>?</td><td><code>Account.withdraw(ben, 80)</code>; <code>self</code> is <code>ben</code>, and it raises "insufficient funds".</td></tr>
    <tr><td><code>class A: x = []</code>; <code>a, b = A(), A()</code>; <code>a.x.append(1)</code>; <code>a.y = 2</code>. What is <code>b.x</code>, and does <code>b</code> have <code>y</code>?</td><td><code>[1]</code> (one shared list), and no: <code>a.y</code> was created on <code>a</code> only.</td></tr>
    <tr><td>Where is <code>self.__balance</code> stored in class <code>Account</code>?</td><td>As <code>_Account__balance</code> in the object's <code>__dict__</code>.</td></tr>
    <tr><td>Why does <code>StudentAccount.from_csv(...)</code> return a StudentAccount?</td><td>The classmethod receives <code>cls = StudentAccount</code> and returns <code>cls(...)</code>.</td></tr>
    <tr><td>How do you make <code>balance</code> readable but not assignable?</td><td>A <code>@property</code> getter returning <code>self._balance</code>, with no setter.</td></tr>
  </table>

  <h2 id="pc-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>self</code>?</summary><div class="qa-body">The object a method was called on, passed automatically as the first argument. <code>asha.deposit(50)</code> runs <code>Account.deposit(asha, 50)</code>. The name <code>self</code> is a convention, not a keyword.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__init__</code> a constructor?</summary><div class="qa-body">Informally yes; strictly it is an initialiser. <code>__new__</code> creates the empty object, then <code>__init__</code> fills its attributes and must return None. You override <code>__new__</code> only for unusual cases (immutable types, singletons).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Instance vs class attribute: where does each live, and how does lookup work?</summary><div class="qa-body">Instance attributes live in the object's <code>__dict__</code>, class attributes in the class's. Reading <code>obj.x</code> checks the object, then the class, then parent classes. Writing <code>obj.x = v</code> always writes to the object (shadowing a class attribute of the same name).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Instance vs class vs static method: when do you use each?</summary><div class="qa-body">Instance (<code>self</code>) for behaviour that uses the object's data. Classmethod (<code>cls</code>) for alternative constructors like <code>from_csv</code>, because it returns the right subclass, and for class-wide settings. Staticmethod for a helper that needs neither, kept in the class because it belongs there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is name mangling, and is it security?</summary><div class="qa-body"><code>self.__x</code> written inside class <code>Account</code> is stored as <code>_Account__x</code>. Its purpose is to stop subclasses overwriting the parent's attribute by accident. It is not security: <code>obj._Account__x</code> still works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>@property</code>?</summary><div class="qa-body">To make an attribute read-only (<code>balance</code>), to validate or clean on assignment (<code>owner</code>), or to compute a value on read (<code>is_empty</code>). Callers keep attribute syntax, so you can add it later without breaking them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@dataclass</code> generate, and what do <code>frozen</code> and <code>order</code> add?</summary><div class="qa-body"><code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> from the annotated fields. <code>frozen=True</code> blocks assignment and adds <code>__hash__</code>; <code>order=True</code> adds <code>&lt; &lt;= &gt; &gt;=</code> comparing fields as a tuple.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>class A: n = 0</code> with <code>def __init__(self): self.n += 1</code>; after <code>A(); A()</code>, what is <code>A.n</code>?</summary><div class="qa-body">0. Each <code>self.n += 1</code> reads the class's 0 and writes 1 into a new instance attribute. The class attribute never changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does encapsulation need properties to be practical in Python?</summary><div class="qa-body">Encapsulation hides the data behind methods, which forces callers to change from <code>acc.balance</code> to <code>acc.get_balance()</code>. A property gives the protection with the old syntax, so you can start with plain public attributes and add control later without breaking anyone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: the shared-list trap appears in three places in this note. Name them and the one idea behind all three.</summary><div class="qa-body">A list as a class attribute (<code>history = []</code>), a mutable default argument (<code>def __init__(self, history=[])</code>), and a mutable dataclass default (rejected with ValueError). The common idea: a list created once, when the class or function is defined, is one object shared by every later use. Create it per object (<code>self.history = []</code>, <code>None</code> then a new list, <code>default_factory=list</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip <code>__init__</code> validation and rely only on <code>withdraw</code>'s check?</summary><div class="qa-body">An account could be born invalid: <code>Account("Ben", -50)</code> would exist with a negative balance, and <code>withdraw</code> only stops balances from going lower. An invariant must be established when the object is created and kept by every method afterwards.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does the "classmethod uses <code>cls</code>" rule prepare for inheritance?</summary><div class="qa-body">Child classes inherit class methods. If the method builds objects with <code>cls(...)</code>, <code>StudentAccount.from_csv</code> returns a StudentAccount with the child's settings (<code>min_opening = 0</code>). If it hard-codes <code>Account(...)</code>, every child gets a parent object back, and the child's rules (Dev's ₹0 opening) are silently ignored.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Encapsulation vs abstraction?</summary><div class="qa-body">Encapsulation hides <strong>data</strong>: it changes only through controlled methods and properties (<code>_balance</code> + <code>withdraw</code>). Abstraction hides <strong>complexity</strong>: callers see a small interface (<code>deposit</code>, <code>withdraw</code>) and not how it works inside; ABCs, in the next note, make that interface a contract.</div></details>
</main>
`
});
