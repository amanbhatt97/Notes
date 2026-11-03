// notes/python/py_inheritance.js — Inheritance, Polymorphism & Design
Object.assign(TOPIC_CONTENT, {
  "py_inheritance": `<main>
<h1>Inheritance, Polymorphism &amp; Design</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Inheritance, Polymorphism &amp; Design</span></div>
  <p class="lead">Inheritance lets a class reuse another class and specify only what differs; polymorphism lets one piece of code work with every such variant without checking types. Without them you either copy a class to make a variant (and fix every bug twice) or write <code>if isinstance(...)</code> chains that must be edited for every new type. Python adds its own twists: polymorphism works through duck typing with no common parent required, interfaces are optional (<code>abc.ABC</code>, <code>typing.Protocol</code>), and multiple inheritance is allowed, ordered by the C3 method resolution order that <code>super()</code> follows. Overused, inheritance produces class explosions and fragile hierarchies, which is why composition, SOLID and a few design patterns belong here too; they are how scikit-learn (<code>BaseEstimator</code>, mixins, <code>Pipeline</code>) and PyTorch (<code>nn.Module</code>, <code>nn.Sequential</code>) are built. Code here was run on Python 3.13.</p>

  <h2 id="pi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Inheritance &amp; Design</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Inheritance</div>
        <ul>
          <li><code>class Child(Parent)</code> — child gets every attribute and method; "is-a"</li>
          <li>Lookup: object → Child → Parent → object (<code>__mro__</code>)</li>
          <li><code>isinstance(s, Account)</code> True for a SavingsAccount</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Overriding &amp; super()</div>
        <ul>
          <li>Same-name method in the child replaces the parent's</li>
          <li><b>Extend</b>: do extra, then <code>super().withdraw(amount)</code>; <b>replace</b>: don't call it</li>
          <li><code>super().__init__(...)</code> runs the parent's setup first</li>
          <li>⚠ Forget it → <code>'BrokenSavings' object has no attribute '_balance'</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Polymorphism</div>
        <ul>
          <li>Same call, behaviour chosen by the object's type at run time (dynamic dispatch)</li>
          <li>One loop calls <code>a.month_end()</code> on every account type; no type checks</li>
          <li><b>Template method</b>: parent's <code>month_end</code> calls <code>self.interest()</code>, <code>self.fee()</code> hooks</li>
          <li>⚠ <code>isinstance</code> chains = polymorphism done by hand</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Duck typing</div>
        <ul>
          <li>"If it has <code>month_end</code>, it works": no inheritance needed (GiftCard)</li>
          <li>EAFP: try, catch <code>AttributeError</code></li>
          <li><b>Protocol</b> — typed duck typing for mypy; <code>@runtime_checkable</code> for isinstance</li>
          <li>⚠ runtime check only looks at names (<code>month_end = 42</code> passes)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ABCs &amp; abstraction</div>
        <ul>
          <li><b>Abstraction</b> — show a small interface, hide how</li>
          <li><code>ABC</code> + <code>@abstractmethod</code> — cannot instantiate until all are implemented</li>
          <li>Error at creation, not at 2 AM in production</li>
          <li>ABC = must inherit; Protocol = just match the methods</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">MRO &amp; mixins</div>
        <ul>
          <li><b>C3</b>: child first, parents left → right, each class once, parents after all children</li>
          <li><code>L[C] = C + merge(L[parents]…, [parents])</code>; take a head not in any tail</li>
          <li>Diamond <code>D(B, C)</code>, B and C inherit A: D → B → C → A → object</li>
          <li><code>super()</code> = next class in <em>the object's</em> MRO, not "my parent"</li>
          <li><b>Mixin</b> — small class adding one feature (AuditMixin)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Composition</div>
        <ul>
          <li>"has-a": account holds policy objects and delegates to them</li>
          <li>Avoids class explosion: no subclass per feature combination</li>
          <li>Swap a part on a live object (assign a new policy)</li>
          <li>Prefer composition; inherit only for a true is-a</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SOLID &amp; patterns</div>
        <ul>
          <li><b>S</b> one job · <b>O</b> add classes, don't edit · <b>L</b> child keeps parent's promises</li>
          <li><b>I</b> small interfaces · <b>D</b> depend on abstractions, pass them in</li>
          <li><b>Strategy</b> policies · <b>Factory</b> <code>open_account</code> · <b>Observer</b> listeners · <b>Singleton</b> config</li>
          <li>⚠ LSP classic: Square(Rect) gives 100 where 50 was expected</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pi-sub"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Subclassing</span><span class="rm-sub">class Child(Parent), lookup, isinstance</span></div></div>
      <div class="rm-item rm-done" data-target="pi-super"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Overriding and super()</span><span class="rm-sub">replace vs extend, super().__init__</span></div></div>
      <div class="rm-item rm-done" data-target="pi-poly"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Polymorphism and the Template Method</span><span class="rm-sub">dynamic dispatch, hook methods</span></div></div>
      <div class="rm-item rm-done" data-target="pi-duck"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Duck Typing and Protocols</span><span class="rm-sub">EAFP, typing.Protocol</span></div></div>
      <div class="rm-item rm-done" data-target="pi-abc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Abstract Base Classes</span><span class="rm-sub">ABC, @abstractmethod, TypeError</span></div></div>
      <div class="rm-item rm-done" data-target="pi-mro"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Multiple Inheritance and the MRO</span><span class="rm-sub">mixins, diamond, C3 by hand</span></div></div>
      <div class="rm-item rm-done" data-target="pi-comp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Composition vs Inheritance</span><span class="rm-sub">has-a policies, swapping parts</span></div></div>
      <div class="rm-item rm-done" data-target="pi-solid"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">SOLID Principles</span><span class="rm-sub">SRP, OCP, LSP, ISP, DIP in code</span></div></div>
      <div class="rm-item rm-done" data-target="pi-pat"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Design Patterns</span><span class="rm-sub">strategy, factory, observer, singleton</span></div></div>
      <div class="rm-item rm-done" data-target="pi-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">super(), LSP, has-a misuse</span></div></div>
      <div class="rm-item rm-done" data-target="pi-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">rules, C3, SOLID table</span></div></div>
      <div class="rm-item rm-done" data-target="pi-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">super, MRO, ABCs, design</span></div></div>
    </div>
  </div>

  <h2 id="pi-sub"><span class="num">01</span>Subclassing: class Child(Parent)</h2>
  <p>Inheritance lets a new class start as everything an existing class is and then add or change a few things, instead of copying the class and maintaining two versions. The examples extend this <code>Account</code> (see <a class="xref" data-note="py_classes">Classes &amp; Objects</a>); <code>describe()</code> prints the class name, owner and balance, so the real type of each object is visible.</p>
  <div class="fx" data-lang="py"># A base Account class (see Classes &amp; Objects)
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount &lt;= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount

    def describe(self):
        return f"{type(self).__name__}({self.owner}, {self._balance})"

asha = Account("Asha", 120)
print(asha.describe())</div>
  <div class="fx" data-lang="text">Account(Asha, 120)</div>
  <p>The existing class is the <strong>parent</strong> (also <em>base class</em> or <em>superclass</em>); the new one is the <strong>child</strong> (<em>subclass</em>). You write the parent's name in brackets: <code>class SavingsAccount(Account)</code>. Read it as "a SavingsAccount <em>is an</em> Account".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A recipe card that says "Masala chai: make plain tea (see card 1), then add spices". It does not copy card 1; it points to it and writes down only what is different.</p></div>
  <div class="fx" data-lang="py">class SavingsAccount(Account):     # "a SavingsAccount IS an Account"
    pass                           # nothing new yet

s = SavingsAccount("Asha", 120)
s.deposit(10)                      # found on Account
print(s.describe(), s.balance)
print(isinstance(s, SavingsAccount), isinstance(s, Account), issubclass(SavingsAccount, Account))
print(SavingsAccount.__bases__)
print([c.__name__ for c in SavingsAccount.__mro__])
print("deposit" in vars(SavingsAccount), "deposit" in vars(Account))</div>
  <div class="fx" data-lang="text">SavingsAccount(Asha, 130) 130
True True True
(&lt;class '__main__.Account'&gt;,)
['SavingsAccount', 'Account', 'object']
False True</div>
  <p>After the code. The empty child already deposits (120 + 10 = 130) and describes itself, and <code>describe</code> printed <code>SavingsAccount</code> because <code>type(self)</code> is the child. <code>isinstance</code> says a savings account is both a SavingsAccount and an Account. <code>__bases__</code> lists the direct parent. <code>__mro__</code> is the search order Python uses for every attribute: child, then parent, then <code>object</code> (the root of every class). <code>deposit</code> is in <code>vars(Account)</code> only: nothing was copied.</p>
  <h3>The lookup, traced</h3>
  <table class="tbl">
    <tr><th><code>s.deposit(10)</code>: where Python looks</th><th>Found?</th></tr>
    <tr><td>1. <code>vars(s)</code> (the object: owner, _balance)</td><td>no</td></tr>
    <tr><td>2. <code>vars(SavingsAccount)</code></td><td>no</td></tr>
    <tr><td>3. <code>vars(Account)</code></td><td>yes → call <code>Account.deposit(s, 10)</code></td></tr>
  </table>
  <p>It is the lookup from <a class="xref" data-note="py_classes">Classes &amp; Objects</a> with one more stop. Now add what is new:</p>
  <div class="fx" data-lang="py">class SavingsAccount(Account):
    rate = 0.01                    # new class attribute: 1% interest per month

    def add_interest(self):        # new method that only savings accounts have
        self._balance += self._balance * self.rate

s = SavingsAccount("Asha", 120)
s.add_interest()
print(s.describe())
print(hasattr(Account("Ben", 50), "add_interest"))</div>
  <div class="fx" data-lang="text">SavingsAccount(Asha, 121.2)
False</div>
  <p>Asha's 120 earned 1% (120 × 0.01 = 1.2) and became 121.2. A plain <code>Account</code> has no <code>add_interest</code>: the child added something the parent does not have.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Inheritance</strong>: a class defined as <code>class Child(Parent)</code> inherits all attributes and methods of <code>Parent</code>; attribute lookup searches the child, then its parents in method resolution order (<code>Child.__mro__</code>), ending at <code>object</code>. It models an <strong>is-a</strong> relationship.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Inherit only for a true is-a. "A savings account is an account" is true. "An account is a list of transactions" is not: an account <em>has</em> a list. Inheriting from <code>list</code> would give the account <code>sort</code>, <code>pop</code> and <code>clear</code>, which could wipe the history. Composition, covered below, is the alternative.</p></div>

  <h2 id="pi-super"><span class="num">02</span>Overriding and super()</h2>
  <p>In plain words: writing a method in the child with the <em>same name</em> as a parent method is called <strong>overriding</strong>. Lookup finds the child's version first, so the parent's is skipped. If the child still wants the parent's version to run as part of its own, it calls <code>super().method(...)</code>, which means "the same method, from the next class up".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A branch manager adds a local rule ("savings: at most ₹500 per withdrawal"), checks it, and then sends the request on to head office's standard procedure. <code>super()</code> is "send it on to head office".</p></div>
  <h3>super().__init__, traced</h3>
  <p>The child below prints the object's attributes at three moments, so you can watch the parent and child each fill in their part.</p>
  <div class="fx" data-lang="py">class SavingsAccount(Account):
    def __init__(self, owner, balance=0, rate=0.01):
        print(f"  SavingsAccount.__init__ starts: {vars(self)}")
        super().__init__(owner, balance)          # let Account set owner and _balance
        print(f"  after super().__init__:          {vars(self)}")
        self.rate = rate                          # then add what is new
        print(f"  SavingsAccount.__init__ ends:   {vars(self)}")

    def add_interest(self):
        self._balance += self._balance * self.rate

asha = SavingsAccount("Asha", 120, rate=0.01)
asha.add_interest()
print(asha.describe())</div>
  <div class="fx" data-lang="text">  SavingsAccount.__init__ starts: {}
  after super().__init__:          {'owner': 'Asha', '_balance': 120}
  SavingsAccount.__init__ ends:   {'owner': 'Asha', '_balance': 120, 'rate': 0.01}
SavingsAccount(Asha, 121.2)</div>
  <table class="tbl">
    <tr><th>Moment</th><th><code>vars(asha)</code></th><th>Who wrote it</th></tr>
    <tr><td>child's <code>__init__</code> starts</td><td><code>{}</code></td><td>(empty object from <code>__new__</code>)</td></tr>
    <tr><td>after <code>super().__init__("Asha", 120)</code></td><td><code>{'owner': 'Asha', '_balance': 120}</code></td><td><code>Account.__init__</code></td></tr>
    <tr><td>child's <code>__init__</code> ends</td><td>+ <code>'rate': 0.01</code></td><td><code>SavingsAccount.__init__</code></td></tr>
  </table>
  <p>Skip the <code>super()</code> call and the parent's half never happens:</p>
  <div class="fx" data-lang="py">class BrokenSavings(Account):
    def __init__(self, owner, balance=0, rate=0.01):
        self.rate = rate                          # forgot super().__init__(...)

b = BrokenSavings("Asha", 120)
print(vars(b))
b.balance</div>
  <div class="fx" data-lang="text">{'rate': 0.01}
AttributeError: 'BrokenSavings' object has no attribute '_balance'</div>
  <p>The object has only <code>rate</code>. It is created without complaint; the error arrives later, at the first use of <code>balance</code>, far from the real cause.</p>
  <h3>Replace or extend</h3>
  <p>Two ways to override. <strong>Replace</strong>: the child's method does the whole job and never calls the parent. Ben's current account must do this, because the parent's <code>withdraw</code> refuses any overdraft. <strong>Extend</strong>: the child adds its own step and then calls <code>super()</code> to run the parent's. The savings account does this: its own limit first, then the normal balance check.</p>
  <div class="fx" data-lang="py">class CurrentAccount(Account):
    def __init__(self, owner, balance=0, overdraft_limit=100):
        super().__init__(owner, balance)
        self.overdraft_limit = overdraft_limit

    def withdraw(self, amount):                   # REPLACES Account.withdraw
        if amount &gt; self._balance + self.overdraft_limit:
            raise ValueError("overdraft limit exceeded")
        self._balance -= amount

class SavingsAccount(Account):
    max_withdrawal = 500

    def __init__(self, owner, balance=0, rate=0.01):
        super().__init__(owner, balance)
        self.rate = rate

    def withdraw(self, amount):                   # EXTENDS Account.withdraw
        if amount &gt; self.max_withdrawal:
            raise ValueError(f"savings: at most {self.max_withdrawal} per withdrawal")
        super().withdraw(amount)                  # ... then the parent's own check

    def add_interest(self):
        self._balance += self._balance * self.rate

ben = CurrentAccount("Ben", 50)
ben.withdraw(80)                                  # plain Account would refuse this
print(ben.describe())
asha = SavingsAccount("Asha", 120)
for amount in (600, 200):
    try:
        asha.withdraw(amount)
    except ValueError as e:
        print(f"withdraw {amount}: {e}")</div>
  <div class="fx" data-lang="text">CurrentAccount(Ben, -30)
withdraw 600: savings: at most 500 per withdrawal
withdraw 200: insufficient funds</div>
  <p>After the code. Ben (₹50, overdraft limit 100) withdrew 80 and is at −30: the current account's own <code>withdraw</code> ran, and the parent's check never did. Asha's 600 was stopped by the savings rule before the parent was even asked; her 200 passed the savings rule, went on to <code>Account.withdraw</code> through <code>super()</code>, and was stopped there by "insufficient funds" (200 &gt; 120). Two rules, each written once, applied in order.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Overriding</strong>: defining in a subclass a method with the same name as one in a parent, so lookup finds the subclass's version. <code>super()</code> returns a proxy that continues the lookup from the <em>next</em> class in the instance's MRO, so <code>super().m(args)</code> runs the inherited version of <code>m</code> on the same object.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>An overriding child that defines <code>__init__</code> must call <code>super().__init__(...)</code>, normally first. And keep the parent's signature compatible: if callers pass <code>withdraw(amount)</code> to any account, a child that requires <code>withdraw(amount, pin)</code> breaks them (the L in SOLID).</p></div>

  <h2 id="pi-poly"><span class="num">03</span>Polymorphism and the Template Method</h2>
  <p><strong>Polymorphism</strong> ("many forms") means one call works on objects of different types, each responding in its own way. Without it, code that handles several types has to ask each object what it is:</p>
  <div class="fx" data-lang="py">def month_end_with_ifs(acc):                     # BEFORE: one function that knows every type
    if isinstance(acc, SavingsAccount):
        acc._balance += acc._balance * acc.rate
    elif isinstance(acc, CurrentAccount):
        if acc._balance &lt; 0:
            acc._balance -= 10
    # a new account type means editing this function again

accounts = [SavingsAccount("Asha", 120), CurrentAccount("Ben", 50), Account("Chitra", 70)]
accounts[1].withdraw(80)
for a in accounts:
    month_end_with_ifs(a)
    print(a.describe())</div>
  <div class="fx" data-lang="text">SavingsAccount(Asha, 121.2)
CurrentAccount(Ben, -40)
Account(Chitra, 70)</div>
  <p>It works (Asha 121.2, Ben −30 − 10 = −40, Chitra unchanged), but the function must know every account type and reach into each one's internals, and each new type means another <code>elif</code>. Polymorphism is the cure: every type provides a method with the same name, and the caller just calls it. The object's own type decides which version runs.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The month-end batch job says "close your month" to every account. A savings account adds interest, a current account charges its fee, a plain account does nothing. The job does not need to know which is which, just as "show your ID" at a gate works for students, staff and visitors alike.</p></div>
  <h3>The template method: shared steps, per-type hooks</h3>
  <p>Below, the parent <code>Account</code> writes the month-end <em>procedure</em> once: change = interest − fee. The two steps it needs are small methods, <code>interest()</code> and <code>fee()</code>, which default to 0. Children override only the hook they care about. This shape (a parent method that calls methods children override) is the <strong>template method</strong> pattern.</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount &lt;= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount

    def interest(self):            # hooks: the default is "nothing"
        return 0

    def fee(self):
        return 0

    def month_end(self):           # the same steps for every account ...
        change = self.interest() - self.fee()      # ... but these calls dispatch on type(self)
        self._balance = round(self._balance + change, 2)
        return change

    def describe(self):
        return f"{type(self).__name__}({self.owner}, {self._balance})"

class SavingsAccount(Account):
    def __init__(self, owner, balance=0, rate=0.01):
        super().__init__(owner, balance)
        self.rate = rate

    def interest(self):
        return round(self._balance * self.rate, 2)

class CurrentAccount(Account):
    monthly_fee = 10

    def __init__(self, owner, balance=0, overdraft_limit=100):
        super().__init__(owner, balance)
        self.overdraft_limit = overdraft_limit

    def withdraw(self, amount):
        if amount &gt; self._balance + self.overdraft_limit:
            raise ValueError("overdraft limit exceeded")
        self._balance -= amount

    def fee(self):
        return self.monthly_fee if self._balance &lt; 0 else 0

accounts = [SavingsAccount("Asha", 120), CurrentAccount("Ben", 50), Account("Chitra", 70)]
accounts[1].withdraw(80)
for a in accounts:                 # AFTER: one loop, no isinstance, three behaviours
    change = a.month_end()
    print(f"{a.describe():28} change {change:+}")</div>
  <div class="fx" data-lang="text">SavingsAccount(Asha, 121.2)  change +1.2
CurrentAccount(Ben, -40)     change -10
Account(Chitra, 70)          change +0</div>
  <p>One loop, no <code>isinstance</code>, three behaviours: +1.2 for Asha, −10 for Ben (overdrawn at −30), +0 for Chitra. Trace Ben's call to see how the parent's code ends up running the child's hook:</p>
  <table class="tbl">
    <tr><th>Step</th><th>Code running</th><th>What happens</th></tr>
    <tr><td>1</td><td><code>ben.month_end()</code></td><td>not in CurrentAccount → found in <code>Account</code>; <code>self</code> is <code>ben</code></td></tr>
    <tr><td>2</td><td><code>self.interest()</code> inside <code>Account.month_end</code></td><td>lookup starts at <code>type(self)</code> = CurrentAccount → not there → <code>Account.interest</code> → 0</td></tr>
    <tr><td>3</td><td><code>self.fee()</code></td><td>found on CurrentAccount → balance −30 &lt; 0 → 10</td></tr>
    <tr><td>4</td><td>change = 0 − 10</td><td>balance −30 → −40, returns −10</td></tr>
  </table>
  <p>Step 3 is the key: code written in the parent called a method written in the child, because <code>self.fee</code> is looked up on the object's real type <em>at run time</em>. This is <strong>dynamic dispatch</strong>. Adding a new account type next year means writing a new class with its own <code>interest</code> or <code>fee</code>; the loop and <code>month_end</code> are never edited.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Polymorphism</strong>: the same operation (<code>a.month_end()</code>) works on objects of different types, each responding in its own way. In Python it comes from dynamic dispatch: <code>obj.method</code> is looked up on <code>type(obj)</code> when the call runs. The <strong>template method</strong> pattern fixes an algorithm's steps in a parent and lets subclasses override individual steps.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A chain of <code>if isinstance(x, A): … elif isinstance(x, B): …</code> spread around the code is polymorphism done by hand, and every new type means hunting down every chain. Move the varying behaviour into a method on each class.</p></div>

  <h2 id="pi-duck"><span class="num">04</span>Duck Typing, EAFP and typing.Protocol</h2>
  <p>Polymorphism in Python does not need inheritance. Python never checks the type when you call <code>t.month_end()</code>; it only looks for a method with that name. Any object that has the methods the code uses will work. This is <strong>duck typing</strong>: "if it walks like a duck and quacks like a duck, it is a duck".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A driving job asks "can you drive?", not "which driving school did you attend?". Anyone with the skill gets the job.</p></div>
  <div class="fx" data-lang="py">class GiftCard:                    # NOT an Account: no inheritance at all
    def __init__(self, code, value):
        self.code, self.value = code, value

    def month_end(self):           # but it has the methods the loop uses
        self.value -= 1            # a 1-rupee monthly charge
        return -1

    def describe(self):
        return f"GiftCard({self.code}, {self.value})"

ben = CurrentAccount("Ben", 50)
ben.withdraw(80)
things = [SavingsAccount("Asha", 120), ben, GiftCard("GC-7", 25)]
for t in things:
    t.month_end()
    print(t.describe())
print(isinstance(things[-1], Account))</div>
  <div class="fx" data-lang="text">SavingsAccount(Asha, 121.2)
CurrentAccount(Ben, -40)
GiftCard(GC-7, 24)
False</div>
  <p>The gift card joined the loop and went 25 → 24, and <code>isinstance(..., Account)</code> is False: no inheritance was involved. Python's own built-ins work the same way: <code>for</code> accepts anything with <code>__iter__</code>, <code>len()</code> anything with <code>__len__</code> (that is the subject of <a class="xref" data-note="py_dunder">Dunder Methods</a>).</p>
  <h3>EAFP: just try it</h3>
  <p>Duck-typed code usually does not check first ("look before you leap", LBYL); it tries the call and handles the failure ("easier to ask forgiveness than permission", EAFP):</p>
  <div class="fx" data-lang="py">def total_month_end(items):
    total = 0
    for t in items:
        try:
            total += t.month_end()          # just try it (EAFP)
        except AttributeError:
            print(f"  skipped {t!r}: no month_end")
    return round(total, 2)

print(total_month_end([SavingsAccount("Asha", 120), GiftCard("GC-7", 25), "not an account"]))</div>
  <div class="fx" data-lang="text">  skipped 'not an account': no month_end
0.2</div>
  <p>Asha's +1.2 and the gift card's −1 add to 0.2; the string has no <code>month_end</code>, so it is skipped with a message rather than crashing the batch.</p>
  <h3>Protocols: duck typing you can write down</h3>
  <p>Duck typing is flexible but invisible: nothing in the code says what a "month-endable" thing must have. A <code>typing.Protocol</code> writes that list of methods down. Type checkers such as mypy then accept any class with matching methods, with no inheritance; <code>@runtime_checkable</code> also lets <code>isinstance</code> check it.</p>
  <div class="fx" data-lang="py">from typing import Protocol, runtime_checkable

@runtime_checkable
class MonthEndable(Protocol):
    def month_end(self) -&gt; float: ...
    def describe(self) -&gt; str: ...

def run_month_end(items: list[MonthEndable]):
    for t in items:
        t.month_end()

print(isinstance(GiftCard("GC-7", 25), MonthEndable),
      isinstance(SavingsAccount("Asha", 120), MonthEndable),
      isinstance("text", MonthEndable))

class Liar:
    month_end = 42                 # not even a method
    describe = "nope"
print(isinstance(Liar(), MonthEndable))</div>
  <div class="fx" data-lang="text">True True False
True</div>
  <p>The gift card and the savings account both count as <code>MonthEndable</code> although neither inherits from it; a string does not. The last line is the catch: <code>Liar</code> has attributes with the right <em>names</em> (one is the number 42), and <code>isinstance</code> still says True, because the runtime check only looks for names.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Duck typing</strong>: an object is usable wherever it provides the methods and attributes the code uses, regardless of its class. A <strong>Protocol</strong> (<code>typing.Protocol</code>) describes such a set of methods for static type checkers (structural typing); <code>@runtime_checkable</code> enables <code>isinstance</code> checks of method <em>presence</em> only.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Duck typing fails late: a missing method shows up only when that line runs, possibly in production. Protocols plus a type checker catch it before running; ABCs (next section) catch it when the object is created.</p></div>

  <h2 id="pi-abc"><span class="num">05</span>Abstract Base Classes: abc.ABC and @abstractmethod</h2>
  <p>When a base class supplies default hooks, a subclass that forgets to override one fails silently instead of loudly:</p>
  <div class="fx" data-lang="py">class FixedDeposit(Account):       # someone forgot to write interest()
    def __init__(self, owner, balance=0, rate=0.06):
        super().__init__(owner, balance)
        self.rate = rate

fd = FixedDeposit("Dev", 1000)
print(fd.month_end(), fd.describe())  # no error, and no interest either</div>
  <div class="fx" data-lang="text">0 FixedDeposit(Dev, 1000)</div>
  <p>No error, no interest: the worst kind of bug. Two ideas fix it.</p>
  <p><strong>Abstraction</strong> means showing callers a small, simple interface and hiding how it works. The month-end job only needs "every account can tell me its interest and its fee"; it does not care how. An <strong>interface</strong> is that list of required methods. An <strong>abstract base class</strong> (ABC) turns the interface into a contract Python enforces: a parent class whose methods marked <code>@abstractmethod</code> <em>must</em> be written by every child. Python refuses to create an object of any class that still has an unwritten abstract method.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Head office's launch checklist for a new product: "state the interest rule; state the fee rule". A product with an empty box cannot launch. The checklist itself is not a product: you cannot open a "generic account".</p></div>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class BaseAccount(ABC):
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @abstractmethod
    def interest(self):            # every concrete account MUST say how it earns ...
        ...

    @abstractmethod
    def fee(self):                 # ... and what it charges
        ...

    def month_end(self):           # concrete: shared by every child
        change = self.interest() - self.fee()
        self._balance = round(self._balance + change, 2)
        return change

    def describe(self):
        return f"{type(self).__name__}({self.owner}, {self._balance})"

class FixedDeposit(BaseAccount):
    def interest(self):
        return round(self._balance * 0.005, 2)    # forgot fee()

class Savings(BaseAccount):
    def interest(self):
        return round(self._balance * 0.01, 2)

    def fee(self):
        return 0

for cls in (BaseAccount, FixedDeposit):
    try:
        cls("Dev", 1000)
    except TypeError as e:
        print("TypeError:", e)
s = Savings("Asha", 120)
print(s.month_end(), s.describe(), isinstance(s, BaseAccount))</div>
  <div class="fx" data-lang="text">TypeError: Can't instantiate abstract class BaseAccount without an implementation for abstract methods 'fee', 'interest'
TypeError: Can't instantiate abstract class FixedDeposit without an implementation for abstract method 'fee'
1.2 Savings(Asha, 121.2) True</div>
  <p>After the code. <code>BaseAccount</code> itself cannot be created: it is a contract, not a product. <code>FixedDeposit</code> wrote <code>interest</code> but not <code>fee</code>, and is refused <em>at creation</em>, with the missing method named. <code>Savings</code> implemented both, so it works, and it inherits the concrete <code>month_end</code> and <code>describe</code>: an ABC can hold real shared code next to the abstract methods (here, the template method from the polymorphism section). The <code>...</code> in the abstract methods is just a placeholder body.</p>
  <div class="cards">
    <div><b>ABC</b><p>You must inherit it. Missing abstract methods → the object cannot be created. Can hold shared code.</p><small>Use: your own family of classes. 💡 a degree from a named college</small></div>
    <div><b>Protocol</b><p>Anything with matching methods fits; no inheritance. Checked by mypy, optionally by <code>isinstance</code>.</p><small>Use: accepting objects you don't control. 💡 "can you drive? then you're a driver"</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>abstract base class</strong> inherits from <code>abc.ABC</code> and marks required methods with <code>@abstractmethod</code>. A class is <em>abstract</em> while any abstract method lacks an implementation, and instantiating it raises <code>TypeError</code>. <strong>Abstraction</strong> (exposing what, hiding how) is the design goal; the ABC is Python's tool for enforcing it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Encapsulation and abstraction are the most-asked mix-up. <strong>Encapsulation</strong> protects data (who may change <code>_balance</code>). <strong>Abstraction</strong> simplifies the interface (what a caller must know: <code>interest</code>, <code>fee</code>, <code>month_end</code>). Also: <code>@abstractmethod</code> without inheriting <code>ABC</code> enforces nothing.</p></div>

  <h2 id="pi-mro"><span class="num">06</span>Multiple Inheritance, Mixins and the MRO (C3)</h2>
  <p>A Python class may have several parents: <code>class Premium(Overdraft, Rewards)</code>. That raises two questions: if both parents define a method, which one runs, and if both inherit from a common base, does the base's code run twice? The <strong>method resolution order</strong> (MRO) answers both.</p>
  <h3>Mixins: one feature, added to any class</h3>
  <p>The friendliest use of multiple inheritance is a <strong>mixin</strong>: a small class that adds one feature and is meant to be combined with a "real" class. <code>AuditMixin</code> logs every withdrawal and then passes the call on with <code>super()</code>.</p>
  <div class="fx" data-lang="py">class AuditMixin:                  # adds ONE feature to any account class
    def withdraw(self, amount):
        print(f"  audit: {self.owner} withdraws {amount}")
        super().withdraw(amount)   # hand on to the next class in the MRO

class AuditedCurrent(AuditMixin, CurrentAccount):
    pass

ben = AuditedCurrent("Ben", 50)
ben.withdraw(80)
print(ben.describe())
print([c.__name__ for c in AuditedCurrent.__mro__])</div>
  <div class="fx" data-lang="text">  audit: Ben withdraws 80
AuditedCurrent(Ben, -30)
['AuditedCurrent', 'AuditMixin', 'CurrentAccount', 'Account', 'object']</div>
  <p>The audit line printed, then Ben's overdraft withdrawal still happened (−30). But look at the MRO: <code>AuditMixin</code> has no parent except <code>object</code>, yet its <code>super().withdraw</code> reached <code>CurrentAccount.withdraw</code>. That is only possible if <code>super()</code> does not mean "my parent". It means "the next class in <em>this object's</em> MRO", and for an <code>AuditedCurrent</code> object the next class after AuditMixin is CurrentAccount.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A relay race with a fixed running order printed on the board. <code>super()</code> means "pass the baton to the next runner on the board", not "to the runner from my own club".</p></div>
  <h3>The diamond</h3>
  <p>Now the worrying shape. <code>Overdraft</code> and <code>Rewards</code> both inherit from <code>Account</code>; <code>Premium</code> inherits from both. Drawn out, it is a diamond. Each <code>perks()</code> adds its own perk and calls <code>super()</code>.</p>
  <figure class="viz"><svg viewBox="0 0 540 210" width="540">
    <defs><marker id="pi-a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <rect x="95" y="10" width="90" height="32" rx="5" class="fs" stroke="currentColor"/><text x="140" y="31" text-anchor="middle">Account</text>
    <rect x="15" y="85" width="90" height="32" rx="5" class="fb sb"/><text x="60" y="106" text-anchor="middle">Overdraft</text>
    <rect x="175" y="85" width="90" height="32" rx="5" class="fb sb"/><text x="220" y="106" text-anchor="middle">Rewards</text>
    <rect x="95" y="160" width="90" height="32" rx="5" class="fg sg"/><text x="140" y="181" text-anchor="middle">Premium</text>
    <line x1="70" y1="85" x2="125" y2="42" stroke="currentColor" opacity="0.5"/>
    <line x1="210" y1="85" x2="155" y2="42" stroke="currentColor" opacity="0.5"/>
    <line x1="125" y1="160" x2="70" y2="117" stroke="currentColor" opacity="0.5"/>
    <line x1="155" y1="160" x2="210" y2="117" stroke="currentColor" opacity="0.5"/>
    <path d="M93,172 C30,165 12,140 30,120" fill="none" class="sr" stroke-width="2" marker-end="url(#pi-a4)"/>
    <path d="M107,100 C135,92 150,92 172,100" fill="none" class="sr" stroke-width="2" marker-end="url(#pi-a4)"/>
    <path d="M250,84 C262,50 220,28 188,26" fill="none" class="sr" stroke-width="2" marker-end="url(#pi-a4)"/>
    <text x="8" y="160" class="tr">1</text><text x="136" y="88" class="tr">2</text><text x="258" y="56" class="tr">3</text>
    <text x="300" y="60">class Premium(Overdraft, Rewards)</text>
    <text x="300" y="90" class="tr">Premium → Overdraft → Rewards</text>
    <text x="300" y="108" class="tr">→ Account → object</text>
    <text x="300" y="136" class="tm">child before parents,</text>
    <text x="300" y="154" class="tm">parents left to right,</text>
    <text x="300" y="172" class="tm">shared parent once, after all its children</text>
  </svg><figcaption>The diamond. The red path is the MRO: C3 visits Rewards before Account, so Account's method runs exactly once, at the end.</figcaption></figure>
  <div class="fx" data-lang="py">class Account:
    def perks(self):
        return ["basic"]

class Overdraft(Account):
    def perks(self):
        return ["overdraft"] + super().perks()

class Rewards(Account):
    def perks(self):
        return ["cashback"] + super().perks()

class Premium(Overdraft, Rewards):
    def perks(self):
        return ["lounge"] + super().perks()

print(Premium().perks())
print([c.__name__ for c in Premium.__mro__])</div>
  <div class="fx" data-lang="text">['lounge', 'overdraft', 'cashback', 'basic']
['Premium', 'Overdraft', 'Rewards', 'Account', 'object']</div>
  <p>Four perks, <code>basic</code> exactly once, at the end. Inside <code>Overdraft.perks</code>, <code>super()</code> went to <strong>Rewards</strong>, a class Overdraft never mentions, because Rewards is next in Premium's MRO. If <code>super()</code> meant "my parent", Overdraft would jump to Account, Rewards would also jump to Account, and <code>basic</code> would appear twice while cashback could be skipped.</p>
  <h3>C3 by hand</h3>
  <p>Python builds the MRO with the <strong>C3 linearisation</strong>. Notation: <code>L[X]</code> is the MRO of X. The rule:</p>
  <div class="callout def"><span class="label">The C3 rule</span><p><code>L[C] = C + merge(L[P1], L[P2], …, [P1, P2, …])</code> where P1, P2 are C's parents in the order written. <strong>merge</strong>: look at the first element (head) of each list in turn; take the first head that does not appear in the <em>tail</em> (anything after the first element) of any list; append it to the result and remove it from the front of every list; repeat until all lists are empty. If no head can be taken, the order is impossible.</p></div>
  <p>Start at the top: <code>L[object] = [object]</code>; <code>L[Account] = [Account, object]</code>; with one parent C3 is just "me, then my parent's MRO": <code>L[Overdraft] = [Overdraft, Account, object]</code> and <code>L[Rewards] = [Rewards, Account, object]</code>. Now Premium:</p>
  <table class="tbl"><caption>L[Premium] = Premium + merge([Overdraft, Account, object], [Rewards, Account, object], [Overdraft, Rewards])</caption>
    <tr><th>Step</th><th>Lists left</th><th>Try head</th><th>In some tail?</th><th>Result so far</th></tr>
    <tr><td>1</td><td>[Overdraft, Account, object], [Rewards, Account, object], [Overdraft, Rewards]</td><td>Overdraft</td><td>no → take</td><td>Premium, Overdraft</td></tr>
    <tr><td>2</td><td>[Account, object], [Rewards, Account, object], [Rewards]</td><td>Account</td><td>yes, in tail of [Rewards, <b>Account</b>, object] → skip</td><td></td></tr>
    <tr><td></td><td></td><td>Rewards</td><td>no → take</td><td>… , Rewards</td></tr>
    <tr><td>3</td><td>[Account, object], [Account, object]</td><td>Account</td><td>no → take</td><td>… , Account</td></tr>
    <tr><td>4</td><td>[object], [object]</td><td>object</td><td>no → take</td><td>Premium, Overdraft, Rewards, Account, object</td></tr>
  </table>
  <p>Step 2 is where the diamond is solved: Account is refused because Rewards, another child of Account, still has to come first. That is the rule "a parent comes after all of its children". The function below is C3 written in Python, printing the same steps, so you can check the hand trace:</p>
  <div class="fx" data-lang="py">def c3(cls, show=False):
    """The C3 linearisation, written out so every step can be printed."""
    if cls is object:
        return [object]
    seqs = [c3(b) for b in cls.__bases__] + [list(cls.__bases__)]
    result = [cls]
    while any(seqs):
        seqs = [s for s in seqs if s]
        for s in seqs:                                    # try each list's head in turn
            head = s[0]
            if not any(head in other[1:] for other in seqs):   # head in no tail?
                break
        else:
            raise TypeError(f"no consistent order for {cls.__name__}")
        if show:
            print("  lists:", [[c.__name__ for c in s] for s in seqs], "-&gt; take", head.__name__)
        result.append(head)
        seqs = [s[1:] if s[0] is head else s for s in seqs]
    return result

print("L[Premium]:")
print([c.__name__ for c in c3(Premium, show=True)])</div>
  <div class="fx" data-lang="text">L[Premium]:
  lists: [['Overdraft', 'Account', 'object'], ['Rewards', 'Account', 'object'], ['Overdraft', 'Rewards']] -&gt; take Overdraft
  lists: [['Account', 'object'], ['Rewards', 'Account', 'object'], ['Rewards']] -&gt; take Rewards
  lists: [['Account', 'object'], ['Account', 'object']] -&gt; take Account
  lists: [['object'], ['object']] -&gt; take object
['Premium', 'Overdraft', 'Rewards', 'Account', 'object']</div>
  <p>The printed lists match the table row for row, and the result equals <code>Premium.__mro__</code>. When the lists conflict, there is no valid order, and Python refuses to create the class:</p>
  <div class="fx" data-lang="py">try:
    class Broken(Account, Overdraft):  # parent listed BEFORE its own child
        pass
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: Cannot create a consistent method resolution order (MRO) for bases Account, Overdraft</div>
  <p>By hand: <code>merge([Account, object], [Overdraft, Account, object], [Account, Overdraft])</code>. Head Account is in the tail of the second list; head Overdraft is in the tail of the third; head Account again (third list) is still in the second list's tail. No head can be taken. The bases say "Account before Overdraft", but Overdraft is a child of Account and must come first. Fix: list the more specific class first.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>method resolution order</strong> (MRO, <code>C.__mro__</code> or <code>C.mro()</code>) is the linear order in which Python searches classes for an attribute. It is computed by <strong>C3 linearisation</strong>, which guarantees: a class comes before its parents, parents keep the order they were listed in, and every class appears once. <code>super()</code> delegates to the next class in the MRO of <code>type(self)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Cooperative multiple inheritance only works if every class in the chain calls <code>super()</code> and accepts the same arguments (often via <code>**kwargs</code>). One class that calls <code>Account.perks(self)</code> directly, or forgets <code>super()</code>, silently cuts off everything after it in the MRO.</p></div>

  <h2 id="pi-comp"><span class="num">07</span>Composition vs Inheritance</h2>
  <p>Inheritance combines features by making a class per combination, so the number of classes doubles with every yes/no feature, and changing a customer's plan means changing the object's class:</p>
  <div class="fx" data-lang="py">from itertools import product
kinds = ["Savings", "Current"]
cashback = ["", "Cashback"]
student = ["", "Student"]
names = [f"{s}{c}{k}Account" for k, c, s in product(kinds, cashback, student)]
print(len(names), "classes:")
for n in names:
    print(" ", n)</div>
  <div class="fx" data-lang="text">8 classes:
  SavingsAccount
  StudentSavingsAccount
  CashbackSavingsAccount
  StudentCashbackSavingsAccount
  CurrentAccount
  StudentCurrentAccount
  CashbackCurrentAccount
  StudentCashbackCurrentAccount</div>
  <p>Eight classes for three yes/no choices, sixteen for four. <strong>Composition</strong> means building an object out of other objects it holds, and handing work to them ("has-a"). Instead of "a cashback savings account <em>is</em> a special kind of savings account", say "an account <em>has</em> an interest policy and a fee policy". Each policy is a small object with one method; the account <em>delegates</em> to it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A mobile phone with a SIM slot. To change from one network to another you swap the SIM; you do not buy a new phone. Inheritance is a phone with the network soldered in.</p></div>
  <h3>The worked refactor</h3>
  <table class="tbl">
    <tr><th></th><th>Before (inheritance)</th><th>After (composition)</th></tr>
    <tr><td>Interest rule</td><td><code>SavingsAccount.interest()</code> overrides a hook</td><td><code>FlatRate(0.01)</code> object passed in, or <code>NoInterest()</code></td></tr>
    <tr><td>Fee rule</td><td><code>CurrentAccount.fee()</code></td><td><code>OverdraftFee(10)</code> or <code>NoFee()</code></td></tr>
    <tr><td>Combinations</td><td>one class each (8 for three choices)</td><td>one Account + one object per rule</td></tr>
    <tr><td>Change plan</td><td>new object of another class</td><td>assign a new policy to the same object</td></tr>
    <tr><td><code>month_end</code></td><td>template method calling <code>self.interest()</code></td><td>calls <code>self.interest_policy.interest(balance)</code></td></tr>
  </table>
  <div class="fx" data-lang="py">class FlatRate:                    # interest policies: small, swappable parts
    def __init__(self, rate):
        self.rate = rate
    def interest(self, balance):
        return round(balance * self.rate, 2) if balance &gt; 0 else 0

class NoInterest:
    def interest(self, balance):
        return 0

class OverdraftFee:                # fee policies
    def __init__(self, amount):
        self.amount = amount
    def fee(self, balance):
        return self.amount if balance &lt; 0 else 0

class NoFee:
    def fee(self, balance):
        return 0

class Account:
    def __init__(self, owner, balance=0, interest=None, fees=None, overdraft_limit=0):
        self.owner = owner
        self._balance = balance
        self.interest_policy = interest or NoInterest()   # HAS-A interest policy
        self.fee_policy = fees or NoFee()                 # HAS-A fee policy
        self.overdraft_limit = overdraft_limit

    def withdraw(self, amount):
        if amount &gt; self._balance + self.overdraft_limit:
            raise ValueError("limit exceeded")
        self._balance -= amount

    def month_end(self):           # delegate the varying parts to the policies
        change = (self.interest_policy.interest(self._balance)
                  - self.fee_policy.fee(self._balance))
        self._balance = round(self._balance + change, 2)
        return change

    def describe(self):
        return (f"{self.owner}: {self._balance} [{type(self.interest_policy).__name__}, "
                f"{type(self.fee_policy).__name__}]")

asha = Account("Asha", 120, interest=FlatRate(0.01))
ben = Account("Ben", 50, fees=OverdraftFee(10), overdraft_limit=100)
ben.withdraw(80)
for a in (asha, ben):
    a.month_end()
    print(a.describe())

asha.interest_policy = FlatRate(0.02)   # Asha upgrades mid-year: swap a part, same object
asha.month_end()
print(asha.describe())</div>
  <div class="fx" data-lang="text">Asha: 121.2 [FlatRate, NoFee]
Ben: -40 [NoInterest, OverdraftFee]
Asha: 123.62 [FlatRate, NoFee]</div>
  <p>After the code. The results match the inheritance version exactly: Asha 121.2 (FlatRate, NoFee), Ben −40 (NoInterest, OverdraftFee). Then Asha upgrades: one assignment swaps her interest policy on the same object, and the next month earns 2% of 121.2 = 2.42, so 123.62. No new class, no new object, no copied history. Each policy can be tested alone with a number in and a number out.</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
    <defs><marker id="pi-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="none" stroke="currentColor"/></marker>
    <marker id="pi-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="40" y="20" class="tb" font-weight="bold">Inheritance: is-a</text>
    <rect x="70" y="34" width="110" height="32" rx="5" class="fb sb"/><text x="125" y="55" text-anchor="middle">Account</text>
    <rect x="10" y="124" width="110" height="32" rx="5" class="fb sb"/><text x="65" y="145" text-anchor="middle">Savings</text>
    <rect x="135" y="124" width="110" height="32" rx="5" class="fb sb"/><text x="190" y="145" text-anchor="middle">Current</text>
    <line x1="65" y1="122" x2="110" y2="70" stroke="currentColor" marker-end="url(#pi-a2)"/>
    <line x1="190" y1="122" x2="145" y2="70" stroke="currentColor" marker-end="url(#pi-a2)"/>
    <line x1="275" y1="10" x2="275" y2="180" stroke="currentColor" opacity="0.3"/>
    <text x="320" y="20" class="tg" font-weight="bold">Composition: has-a</text>
    <rect x="300" y="72" width="100" height="40" rx="5" class="fg sg"/><text x="350" y="97" text-anchor="middle">Account</text>
    <line x1="402" y1="88" x2="438" y2="58" stroke="currentColor" marker-end="url(#pi-a3)"/>
    <line x1="402" y1="98" x2="438" y2="130" stroke="currentColor" marker-end="url(#pi-a3)"/>
    <rect x="440" y="40" width="110" height="32" rx="5" class="ft st"/><text x="495" y="61" text-anchor="middle">FlatRate(0.02)</text>
    <rect x="440" y="116" width="110" height="32" rx="5" class="ft st"/><text x="495" y="137" text-anchor="middle">OverdraftFee(10)</text>
    <text x="420" y="176" class="tm" text-anchor="middle">swap a part at run time</text>
  </svg><figcaption>Inheritance fixes the link when the class is written. Composition plugs in parts that can be replaced while the program runs.</figcaption></figure>
  <table class="tbl">
    <tr><th>Ask</th><th>Answer</th><th>Use</th></tr>
    <tr><td>Is a savings account an account?</td><td>yes, and it keeps every promise of one</td><td>inheritance is fine</td></tr>
    <tr><td>Is an account an interest rule?</td><td>no, it <em>has</em> one</td><td>composition</td></tr>
    <tr><td>Is an account a list of transactions?</td><td>no, it has one</td><td>composition</td></tr>
    <tr><td>Can the behaviour change while the object lives?</td><td>yes (plan upgrade)</td><td>composition</td></tr>
  </table>
  <p>Composition also avoids the <strong>fragile base class</strong> problem: with inheritance, a change inside the parent (renaming a hook, changing when <code>month_end</code> calls <code>fee</code>) can quietly break every child, because children depend on the parent's internals. A composed policy depends only on the small public method it implements. Real libraries do this everywhere: a scikit-learn <code>Pipeline</code> <em>has</em> steps, a PyTorch model <em>has</em> layers.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Composition</strong>: an object holds references to other objects (its parts) and delegates part of its behaviour to them; it models <strong>has-a</strong>. "Favour composition over inheritance" (Gang of Four, 1994): inherit for a genuine is-a with shared behaviour; compose to combine or swap behaviours.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Composition is not "never inherit". Small, shallow hierarchies with true is-a relationships (SavingsAccount is an Account; all your policies inherit one ABC) are fine. The smell is deep trees and combination class names like <code>StudentCashbackCurrentAccount</code>.</p></div>

  <h2 id="pi-solid"><span class="num">08</span>SOLID Principles</h2>
  <p><strong>SOLID</strong> is five design rules, one per letter, collected by Robert C. Martin. None is enforced by Python; each prevents a specific pain, shown below in code.</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Plain words</th><th>Pain it prevents</th><th>Example</th></tr>
    <tr><td><b>S</b>ingle responsibility</td><td>a class has one reason to change</td><td>an SMS wording change forces edits to the money logic</td><td>Account, Notifier, StatementPrinter</td></tr>
    <tr><td><b>O</b>pen/closed</td><td>open for extension, closed for modification</td><td>every new rule edits (and risks) old code</td><td>new rule = new policy class</td></tr>
    <tr><td><b>L</b>iskov substitution</td><td>a child must work wherever the parent works</td><td>code written for the parent crashes on a child</td><td>FixedDeposit refusing <code>withdraw</code></td></tr>
    <tr><td><b>I</b>nterface segregation</td><td>no class is forced to implement methods it doesn't need</td><td>fake methods that raise "not supported"</td><td>CanDeposit, CanWithdraw, EarnsInterest</td></tr>
    <tr><td><b>D</b>ependency inversion</td><td>depend on abstractions, passed in from outside</td><td>untestable code that sends real SMS in tests</td><td>Account(notifier=…)</td></tr>
  </table>
  <h3>S: single responsibility</h3>
  <p>The first class below does three jobs: money rules, messaging and formatting. A change to the SMS wording, the statement layout or the withdrawal rule all mean editing one class. The second version splits the jobs.</p>
  <div class="fx" data-lang="py">class FatAccount:                  # BEFORE: one class, three reasons to change
    def __init__(self, owner, balance):
        self.owner, self._balance, self.log = owner, balance, []
    def withdraw(self, amount):
        self._balance -= amount
        self.log.append(("withdraw", amount))
        print(f"SMS to {self.owner}: you withdrew {amount}")       # messaging
    def statement_text(self):                                     # formatting
        return "\\n".join(f"{k:&gt;9} {a:&gt;5}" for k, a in self.log)

class Notifier:                    # AFTER: each class has one job
    def send(self, who, text):
        print(f"SMS to {who}: {text}")

class StatementPrinter:
    def render(self, log):
        return "\\n".join(f"{k:&gt;9} {a:&gt;5}" for k, a in log)

class LeanAccount:
    def __init__(self, owner, balance, notifier):
        self.owner, self._balance, self.log = owner, balance, []
        self.notifier = notifier
    def withdraw(self, amount):
        self._balance -= amount
        self.log.append(("withdraw", amount))
        self.notifier.send(self.owner, f"you withdrew {amount}")

a = LeanAccount("Asha", 150, Notifier())
a.withdraw(30)
print(StatementPrinter().render(a.log))</div>
  <div class="fx" data-lang="text">SMS to Asha: you withdrew 30
 withdraw    30</div>
  <p><code>LeanAccount</code> only keeps money and a log; sending is the <code>Notifier</code>'s job, layout is the <code>StatementPrinter</code>'s. Each can change, and be tested, alone.</p>
  <h3>O: open for extension, closed for modification</h3>
  <p>The composition refactor above already obeys it. A new interest rule is a new class; <code>Account</code> is not edited.</p>
  <div class="fx" data-lang="py">class WeekendBonus:                # a NEW interest rule = a NEW class; Account is not edited
    def interest(self, balance):
        return 5

chitra = Account("Chitra", 70)
chitra.interest_policy = WeekendBonus()
print(chitra.month_end(), chitra._balance)</div>
  <div class="fx" data-lang="text">5 75</div>
  <p>Chitra's 70 earned the weekend bonus of 5, and the <code>Account</code> class was never opened. Compare <code>month_end_with_ifs</code> in the polymorphism section, which had to be edited for every new type.</p>
  <h3>L: Liskov substitution</h3>
  <p>A fixed deposit is money in the bank, so it is tempting to write <code>class FixedDeposit(Account)</code>. But <code>Account</code> promises "<code>withdraw</code> works when the balance is enough", and a fixed deposit cannot keep that promise.</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner, self._balance = owner, balance
    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount

class FixedDeposit(Account):
    def withdraw(self, amount):            # breaks the parent's promise
        raise PermissionError("fixed deposit is locked for 12 months")

def pay_canteen_bill(acc: Account, amount):
    """Written for Account: works whenever the balance is enough."""
    acc.withdraw(amount)
    return f"{acc.owner} paid {amount}"

for acc in (Account("Asha", 120), FixedDeposit("Dev", 1000)):
    try:
        print(pay_canteen_bill(acc, 30))
    except Exception as e:
        print(f"{type(e).__name__}: {e}")</div>
  <div class="fx" data-lang="text">Asha paid 30
PermissionError: fixed deposit is locked for 12 months</div>
  <p><code>pay_canteen_bill</code> was written for <code>Account</code> and is correct for every real Account. Given a FixedDeposit, which <code>isinstance</code> calls an Account, it crashes. The child is not a safe substitute for its parent. The classic interview version of the same mistake:</p>
  <div class="fx" data-lang="py">class Rect:                        # the classic interview version of the same mistake
    def __init__(self, w, h): self.w, self.h = w, h
    def set_w(self, w): self.w = w
    def area(self): return self.w * self.h

class Square(Rect):
    def __init__(self, s): super().__init__(s, s)
    def set_w(self, w): self.w = self.h = w   # must keep the sides equal

def stretch(r):                    # caller's expectation: area = 10 * old height
    r.set_w(10)
    return r.area()

print(stretch(Rect(5, 5)), stretch(Square(5)))   # expected 50 both times</div>
  <div class="fx" data-lang="text">50 100</div>
  <p><code>stretch</code> assumes "set the width, keep the height", true for any rectangle: 10 × 5 = 50. A Square must keep its sides equal, so <code>set_w(10)</code> also sets the height, giving 100. Mathematically a square is a rectangle; behaviourally it breaks the rectangle's promise. The fix is to model what each type can really do:</p>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Holding(ABC):                # what EVERY product can do
    def __init__(self, owner, balance=0):
        self.owner, self._balance = owner, balance
    @abstractmethod
    def month_end(self): ...

class Withdrawable(Holding):       # only products that really allow withdrawals
    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount
    def month_end(self):
        return 0

class Fixed(Holding):              # no withdraw at all, so it promises nothing it can't keep
    def month_end(self):
        self._balance = round(self._balance * 1.005, 2)
        return self._balance

def pay_canteen_bill(acc: Withdrawable, amount):
    acc.withdraw(amount)
    return f"{acc.owner} paid {amount}"

print(pay_canteen_bill(Withdrawable("Asha", 120), 30))
print(hasattr(Fixed("Dev", 1000), "withdraw"))</div>
  <div class="fx" data-lang="text">Asha paid 30
False</div>
  <p>Only <code>Withdrawable</code> products have <code>withdraw</code>; <code>Fixed</code> simply does not have it, so no caller can be misled, and <code>pay_canteen_bill</code> asks for a <code>Withdrawable</code>.</p>
  <h3>I: interface segregation</h3>
  <p>If one big <code>AccountInterface</code> demanded <code>deposit</code>, <code>withdraw</code>, <code>interest</code> and <code>overdraft_limit</code>, a gift card would have to write fake versions that raise "not supported" (a Liskov violation waiting to happen). Small interfaces let each class implement only what it supports, and let each function ask only for what it uses.</p>
  <div class="fx" data-lang="py">from typing import Protocol

class CanDeposit(Protocol):
    def deposit(self, amount: int) -&gt; None: ...

class CanWithdraw(Protocol):
    def withdraw(self, amount: int) -&gt; None: ...

class EarnsInterest(Protocol):
    def interest(self) -&gt; float: ...

class GiftCard:                    # implements ONLY what it supports
    def __init__(self, value): self.value = value
    def deposit(self, amount): self.value += amount

def top_up(target: CanDeposit, amount: int):     # asks for the one ability it needs
    target.deposit(amount)

g = GiftCard(25)
top_up(g, 75)
print(g.value, hasattr(g, "withdraw"), hasattr(g, "interest"))</div>
  <div class="fx" data-lang="text">100 False False</div>
  <p><code>top_up</code> needs only the ability to deposit, so it asks for <code>CanDeposit</code>; the gift card (25 + 75 = 100) qualifies without pretending to support withdrawals or interest.</p>
  <h3>D: dependency inversion</h3>
  <p>If <code>Account</code> created a real SMS sender inside itself, every test would send real messages, and switching to e-mail would mean editing <code>Account</code>. Instead, <code>Account</code> depends on the abstract idea "something with <code>send(who, text)</code>", and the actual sender is passed in. Passing dependencies in is called <strong>dependency injection</strong>.</p>
  <div class="fx" data-lang="py">class SMSNotifier:
    def send(self, who, text):
        print(f"[SMS gateway] to {who}: {text}")

class FakeNotifier:                # for tests: records instead of sending
    def __init__(self):
        self.sent = []
    def send(self, who, text):
        self.sent.append((who, text))

class Account:
    def __init__(self, owner, balance, notifier):   # the dependency is PASSED IN
        self.owner, self._balance = owner, balance
        self.notifier = notifier
    def withdraw(self, amount):
        if amount &gt; self._balance:
            self.notifier.send(self.owner, f"declined: {amount}")
            raise ValueError("insufficient funds")
        self._balance -= amount
        self.notifier.send(self.owner, f"withdrew {amount}")

Account("Asha", 150, SMSNotifier()).withdraw(30)   # production
fake = FakeNotifier()
ben = Account("Ben", 50, fake)                      # test
try:
    ben.withdraw(80)
except ValueError:
    pass
print(fake.sent)</div>
  <div class="fx" data-lang="text">[SMS gateway] to Asha: withdrew 30
[('Ben', 'declined: 80')]</div>
  <p>In production Asha's withdrawal went through the SMS gateway. In the test, Ben's account got a <code>FakeNotifier</code>, which recorded the "declined: 80" message instead of sending it, so a test can assert on it. This is exactly how <a class="xref" data-note="py_testing">Testing</a> uses fakes and mocks.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Dependency inversion is a wall socket. A lamp depends on the socket standard, not on a particular power plant, so you can plug it in at home, in an office, or into a test bench.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>SOLID</strong>: Single responsibility (one reason to change), Open/closed (extend without modifying), Liskov substitution (subtypes must be usable wherever the base type is expected, keeping its contracts), Interface segregation (many small, client-specific interfaces), Dependency inversion (high-level code depends on abstractions; concrete dependencies are injected).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>SOLID is a set of tests for pain, not a checklist to maximise. Ten one-method classes for a 50-line script is worse than one clear class. Apply a rule when you feel the pain it prevents (repeated edits, untestable code, fake methods).</p></div>

  <h2 id="pi-pat"><span class="num">09</span>Design Patterns: Strategy, Factory, Observer, Singleton</h2>
  <p>A <strong>design pattern</strong> is a named, reusable solution to a problem that keeps coming up in object-oriented code. Names let a team communicate in one word. Two have already appeared: the <strong>template method</strong> (<code>month_end</code> calling overridable hooks) and the <strong>strategy</strong> (the swappable interest and fee policies).</p>
  <div class="cards">
    <div><b>Strategy</b><p>Swap an algorithm by passing in an object (or function) that does it.</p><small>Example: <code>FlatRate</code>, <code>OverdraftFee</code>. 💡 pay by UPI, card or cash, same checkout</small></div>
    <div><b>Factory</b><p>A function or classmethod that decides which class to build from input.</p><small>Example: <code>open_account("savings", …)</code>. 💡 a ticket counter: say "sleeper" or "AC"</small></div>
    <div><b>Observer</b><p>Subscribers register; the subject notifies all of them when something happens.</p><small>Example: SMS and fraud check on withdrawals. 💡 the YouTube bell icon</small></div>
    <div><b>Singleton</b><p>Exactly one shared instance of a class.</p><small>Example: bank config. 💡 one principal per school</small></div>
  </div>
  <h3>Strategy</h3>
  <p>The interest and fee policies are the strategy pattern: <code>Account</code> holds an object that knows how to compute interest and calls it, without caring which one it is. In Python a strategy is often just a function, since functions are objects too (<a class="xref" data-note="py_functions">Functions</a>): <code>Account(interest=lambda b: b * 0.01)</code> would work with a one-line change to <code>month_end</code>.</p>
  <h3>Factory</h3>
  <div class="fx" data-lang="py">class Savings:
    def __init__(self, owner, balance): self.owner, self.balance = owner, balance
class Current:
    def __init__(self, owner, balance): self.owner, self.balance = owner, balance
class Student:
    def __init__(self, owner, balance): self.owner, self.balance = owner, balance

ACCOUNT_TYPES = {"savings": Savings, "current": Current, "student": Student}

def open_account(kind, owner, balance=0):
    """Factory: the caller names WHAT it wants; this function picks the class."""
    try:
        cls = ACCOUNT_TYPES[kind]
    except KeyError:
        raise ValueError(f"unknown account type {kind!r}; choose from {sorted(ACCOUNT_TYPES)}")
    return cls(owner, balance)

for kind, owner, bal in [("savings", "Asha", 120), ("current", "Ben", 50), ("crypto", "Eve", 1)]:
    try:
        acc = open_account(kind, owner, bal)
        print(type(acc).__name__, acc.owner, acc.balance)
    except ValueError as e:
        print("ValueError:", e)</div>
  <div class="fx" data-lang="text">Savings Asha 120
Current Ben 50
ValueError: unknown account type 'crypto'; choose from ['current', 'savings', 'student']</div>
  <p>The caller says <em>what</em> it wants ("savings"); the factory maps the word to a class through a dict. Adding a product is one line in <code>ACCOUNT_TYPES</code>, and unknown types get a helpful error. The <code>from_csv</code> classmethod of <a class="xref" data-note="py_classes">Classes &amp; Objects</a> is a factory too.</p>
  <h3>Observer</h3>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner, self._balance = owner, balance
        self._listeners = []

    def subscribe(self, fn):                 # anyone interested registers a function
        self._listeners.append(fn)

    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount
        for fn in self._listeners:           # tell every subscriber
            fn(self, "withdraw", amount)

def sms(acc, kind, amount):
    print(f"  sms: {acc.owner}, {kind} {amount}, balance {acc._balance}")

def fraud_check(acc, kind, amount):
    if amount &gt;= 100:
        print(f"  fraud-check: large {kind} of {amount} on {acc.owner}'s account")

asha = Account("Asha", 150)
asha.subscribe(sms)
asha.subscribe(fraud_check)
asha.withdraw(30)
asha.withdraw(100)</div>
  <div class="fx" data-lang="text">  sms: Asha, withdraw 30, balance 120
  sms: Asha, withdraw 100, balance 20
  fraud-check: large withdraw of 100 on Asha's account</div>
  <p>The account keeps a list of functions and calls each one after every withdrawal. It knows nothing about SMS or fraud; new reactions are added with <code>subscribe</code>, without editing <code>Account</code> (open/closed again). The ₹30 withdrawal triggered only the SMS; the ₹100 one also triggered the fraud check. Training callbacks in Keras and PyTorch Lightning are this pattern.</p>
  <h3>Singleton</h3>
  <div class="fx" data-lang="py">class BankConfig:
    _instance = None
    def __new__(cls):                        # runs BEFORE __init__, decides which object
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.settings = {"overdraft_fee": 10}
        return cls._instance

a, b = BankConfig(), BankConfig()
a.settings["overdraft_fee"] = 15
print(a is b, b.settings)</div>
  <div class="fx" data-lang="text">True {'overdraft_fee': 15}</div>
  <p><code>__new__</code> (the method that creates the object, before <code>__init__</code>) hands back the same object every time, so <code>a is b</code> and a change through <code>a</code> is seen through <code>b</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Strategy</strong>: encapsulate interchangeable algorithms behind one interface and inject the chosen one. <strong>Factory</strong>: centralise the choice of which concrete class to instantiate. <strong>Observer</strong>: a subject keeps a list of dependents and notifies them of events. <strong>Singleton</strong>: ensure a class has one instance with a global access point.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A singleton is global state in disguise: hard to test and to reset between tests. In Python a module is already a singleton: a <code>config.py</code> with module-level values, imported wherever needed, is usually all you need.</p></div>

  <h2 id="pi-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: forgetting <code>super().__init__()</code></span><p>Symptom: <code>AttributeError</code> on a parent attribute, long after creation. Cause: the child's <code>__init__</code> replaced the parent's. Fix: call <code>super().__init__(...)</code> first.</p></div>
  <div class="callout trap"><span class="label">Trap: inheriting for has-a</span><p>Symptom: the child has methods that make no sense (an Account inheriting <code>list</code> gets <code>clear()</code>). Fix: hold the object as an attribute (composition).</p></div>
  <div class="callout trap"><span class="label">Trap: breaking the parent's promise (LSP)</span><p>Symptom: code that works for the parent crashes or gives wrong numbers for a child (FixedDeposit, Square). Fix: do not inherit; split the interface so each type promises only what it can do.</p></div>
  <div class="callout trap"><span class="label">Trap: isinstance chains</span><p>Symptom: the same <code>if isinstance … elif …</code> in several places, edited for every new type. Fix: a method on each class (polymorphism).</p></div>
  <div class="callout trap"><span class="label">Trap: thinking <code>super()</code> means "my parent"</span><p>It means "next in the object's MRO". In a diamond or with mixins it can call a sibling class. Every class in a cooperative chain must call <code>super()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>@abstractmethod</code> without <code>ABC</code></span><p>Without inheriting <code>ABC</code> (or using <code>ABCMeta</code>) nothing is enforced and the incomplete class can be created.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting <code>@runtime_checkable</code></span><p><code>isinstance(obj, Proto)</code> only checks method <em>names</em>; <code>month_end = 42</code> passes. Use a type checker for real signatures.</p></div>
  <div class="callout trap"><span class="label">Trap: deep hierarchies and combination classes</span><p>Symptom: names like <code>StudentCashbackCurrentAccount</code>, or a change in a base class breaking distant children (fragile base class). Fix: shallow trees plus composed policies.</p></div>

  <h2 id="pi-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Subclassing</h3>
  <ul>
    <li><code>class Child(Parent)</code>: child inherits every attribute and method; models <b>is-a</b>.</li>
    <li>Lookup: <code>vars(obj)</code>, then each class in <code>type(obj).__mro__</code>, ending at <code>object</code>. Nothing is copied.</li>
    <li><code>isinstance(s, Parent)</code> True for a child instance; <code>issubclass(Child, Parent)</code>; <code>Child.__bases__</code> = direct parents.</li>
  </ul>
  <h3>Overriding and super()</h3>
  <ul>
    <li>Same-name method in the child replaces the parent's. <b>Replace</b>: don't call the parent. <b>Extend</b>: add a step, then <code>super().m(...)</code>.</li>
    <li>A child <code>__init__</code> replaces the parent's: call <code>super().__init__(...)</code> (normally first), else parent attributes are missing → <code>AttributeError</code> later.</li>
    <li><code>super()</code> inside class K = the next class after K in <code>type(self).__mro__</code>, not "K's parent".</li>
    <li>Keep overriding signatures compatible with the parent's.</li>
  </ul>
  <h3>Polymorphism</h3>
  <ul>
    <li>Same call, type-specific behaviour; method looked up on <code>type(obj)</code> at run time (dynamic dispatch).</li>
    <li><b>Template method</b>: parent fixes the algorithm (<code>month_end</code> = <code>self.interest() - self.fee()</code>), children override the hook steps.</li>
    <li><code>isinstance</code> chains = polymorphism done by hand; move behaviour into methods.</li>
  </ul>
  <h3>Duck typing and Protocols</h3>
  <ul>
    <li>Duck typing: any object with the required methods works; no common parent needed.</li>
    <li><b>EAFP</b> (try, catch <code>AttributeError</code>) is idiomatic; <b>LBYL</b> (<code>hasattr</code> first) is the alternative.</li>
    <li><code>typing.Protocol</code>: structural typing for type checkers; <code>@runtime_checkable</code> enables <code>isinstance</code>, which checks only that the names exist.</li>
  </ul>
  <h3>Abstract base classes</h3>
  <table class="tbl">
    <tr><th></th><th><code>abc.ABC</code></th><th><code>typing.Protocol</code></th></tr>
    <tr><td>Typing style</td><td>nominal: must inherit (or <code>register</code>)</td><td>structural: just match the methods</td></tr>
    <tr><td>Checked</td><td>at instantiation: missing abstract method → <code>TypeError</code></td><td>by mypy/pyright; runtime only names</td></tr>
    <tr><td>Shared code</td><td>yes, concrete methods</td><td>not intended</td></tr>
    <tr><td>Use for</td><td>your own class families</td><td>accepting third-party objects</td></tr>
  </table>
  <p><code>@abstractmethod</code> without inheriting <code>ABC</code> (or <code>metaclass=ABCMeta</code>) enforces nothing.</p>
  <h3>Multiple inheritance and the MRO</h3>
  <ul>
    <li>C3: <code>L[C] = C + merge(L[P1], …, L[Pn], [P1, …, Pn])</code>. Merge: take the first head that is in no list's tail; repeat; no candidate → <code>TypeError: Cannot create a consistent method resolution order</code>.</li>
    <li>Guarantees: child before parents; parents in listed order; each class once.</li>
    <li>Diamond <code>D(B, C)</code>, B and C inherit A → D, B, C, A, object; A's method runs once if every class calls <code>super()</code>.</li>
    <li><b>Mixin</b>: small class adding one feature, listed first, calling <code>super()</code>; avoid its own <code>__init__</code> state.</li>
    <li>Cooperative chains need every class to call <code>super()</code> and accept compatible arguments (<code>**kwargs</code>).</li>
  </ul>
  <h3>Composition</h3>
  <ul>
    <li>has-a: the object holds parts (policies, strategies) and delegates to them.</li>
    <li>Avoids class explosion (n yes/no features → 2<sup>n</sup> subclasses) and the fragile base class problem; parts can be swapped at run time and tested alone.</li>
    <li>Rule: inherit for a real is-a that keeps all the parent's promises; compose otherwise.</li>
  </ul>
  <h3>SOLID</h3>
  <table class="tbl">
    <tr><th>Principle</th><th>Rule</th><th>Violation symptom</th></tr>
    <tr><td>Single responsibility</td><td>one reason to change</td><td>SMS wording change edits money logic</td></tr>
    <tr><td>Open/closed</td><td>extend by adding classes, not editing</td><td>growing <code>if/elif</code> per type</td></tr>
    <tr><td>Liskov substitution</td><td>child usable wherever parent is</td><td>child raises where parent works (FixedDeposit, Square/Rect)</td></tr>
    <tr><td>Interface segregation</td><td>small, focused interfaces</td><td>methods that raise "not supported"</td></tr>
    <tr><td>Dependency inversion</td><td>depend on abstractions, inject them</td><td>class creates its own SMS sender; untestable</td></tr>
  </table>
  <h3>Design patterns</h3>
  <ul>
    <li><b>Strategy</b>: inject an interchangeable algorithm (object or function).</li>
    <li><b>Factory</b>: one place maps input to the class to build (<code>{"savings": Savings}[kind]</code>, classmethods like <code>from_csv</code>).</li>
    <li><b>Observer</b>: subject keeps a list of callbacks and notifies them on events.</li>
    <li><b>Singleton</b>: one instance via <code>__new__</code>; in Python a module usually does the job.</li>
    <li><b>Template method</b>: parent algorithm with overridable steps.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Forgetting <code>super().__init__()</code>.</li>
    <li>Inheriting for has-a (subclassing <code>list</code> exposes <code>clear</code>, <code>sort</code>).</li>
    <li>Children that break the parent's contract (LSP).</li>
    <li>Calling <code>Parent.m(self)</code> directly in a cooperative chain skips classes later in the MRO.</li>
    <li>Listing a parent before its own child in the bases → MRO <code>TypeError</code>.</li>
    <li>Runtime Protocol checks pass objects whose attributes merely have the right names.</li>
    <li>Deep hierarchies and combination class names; singletons as hidden global state.</li>
  </ul>

  <h2 id="pi-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is inheritance, and when should you use it?</summary><div class="qa-body">Defining a class as an extension of another: <code>class Child(Parent)</code> inherits all the parent's attributes and methods and adds or overrides some. Use it for a genuine is-a relationship where the child can be used anywhere the parent is expected and you benefit from shared code or polymorphism. For has-a relationships or combining features, use composition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>super()</code> do, and why prefer it over <code>Parent.method(self)</code>?</summary><div class="qa-body"><code>super()</code> returns a proxy that continues attribute lookup from the class after the current one in <code>type(self).__mro__</code>. With single inheritance that is the parent. With multiple inheritance it may be a sibling, which is what makes cooperative mixins and diamonds work; hard-coding <code>Parent.method(self)</code> skips the rest of the MRO and can run a shared base twice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>class A: def __init__(self): self.x = 1</code>; <code>class B(A): def __init__(self): self.y = 2</code>; <code>b = B(); print(vars(b)); print(b.x)</code></summary><div class="qa-body"><code>{'y': 2}</code> and then <code>AttributeError: 'B' object has no attribute 'x'</code>. B's <code>__init__</code> replaced A's, and without <code>super().__init__()</code> the parent never set <code>x</code>. The object is created without complaint; the error appears at first use.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Overriding vs overloading?</summary><div class="qa-body">Overriding: a subclass defines a method with the same name as its parent's, replacing it for instances of the subclass; Python supports this. Overloading: several methods with the same name but different parameter lists, chosen by signature; Python does not support it, because a second <code>def</code> just rebinds the name. Python uses default arguments, <code>*args</code> or <code>functools.singledispatchmethod</code> instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is polymorphism, and how does Python implement it?</summary><div class="qa-body">The same operation working on different types, each in its own way: <code>acc.month_end()</code> adds interest for a savings account and charges a fee for a current account. Python looks up the method on the object's type when the call runs (dynamic dispatch), and does not require a common parent at all (duck typing). Operators are polymorphic through dunder methods.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the template method pattern?</summary><div class="qa-body">A parent method defines the steps of an algorithm and calls other methods for the parts that vary; subclasses override only those hook methods. <code>Account.month_end</code> calls <code>self.interest()</code> and <code>self.fee()</code>; <code>SavingsAccount</code> overrides <code>interest</code>. PyTorch's <code>nn.Module.__call__</code> running hooks around your <code>forward</code> is the same shape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is duck typing? What are EAFP and LBYL?</summary><div class="qa-body">Duck typing: an object is usable wherever it has the methods the code calls, regardless of its class. EAFP ("easier to ask forgiveness than permission") tries the operation and catches the exception (<code>try: x.month_end() except AttributeError</code>); LBYL ("look before you leap") checks first (<code>if hasattr(x, "month_end")</code>). EAFP is idiomatic Python and avoids race conditions between the check and the use.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if a subclass of an ABC does not implement every abstract method?</summary><div class="qa-body">The class is created, but instantiating it raises <code>TypeError: Can't instantiate abstract class FixedDeposit without an implementation for abstract method 'fee'</code>. The error appears at object creation, not when the missing method would first be called. The ABC itself also cannot be instantiated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ABC vs Protocol?</summary><div class="qa-body">An ABC is nominal: classes must inherit from it (or be registered), missing abstract methods block instantiation, and it can provide shared concrete methods. A <code>typing.Protocol</code> is structural: any class with matching methods satisfies it for static type checkers, with no inheritance, which suits third-party objects. <code>@runtime_checkable</code> allows <code>isinstance</code>, but it only checks that the attribute names exist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the MRO, and how is it computed?</summary><div class="qa-body">The method resolution order, <code>C.__mro__</code> or <code>C.mro()</code>, is the linear order Python searches classes for an attribute. It is computed by C3 linearisation: <code>L[C] = C + merge(L[P1], …, L[Pn], [P1, …, Pn])</code>, repeatedly taking the first head that does not appear in the tail of any list. It guarantees children before parents, parents in their listed order, and each class once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>A.hi</code> returns <code>"A"</code>; <code>B(A)</code>, <code>C(A)</code> and <code>D(B, C)</code> each return their own letter + <code>super().hi()</code>; <code>print(D().hi())</code></summary><div class="qa-body"><code>DBCA</code>. The MRO of D is D, B, C, A, object. <code>super()</code> inside B goes to C (the next class in D's MRO), not to A, so A runs exactly once at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does Python refuse to create a class because of the MRO?</summary><div class="qa-body">When C3 finds no consistent order, for example <code>class Broken(Account, Overdraft)</code> where <code>Overdraft</code> is a subclass of <code>Account</code>: the bases demand Account before Overdraft, but a child must come before its parent. Python raises <code>TypeError: Cannot create a consistent method resolution order (MRO)</code>. List the more specific class first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a mixin?</summary><div class="qa-body">A small class that adds one feature (logging, auditing, JSON serialisation) to any class it is combined with, and is not meant to be instantiated alone. It is listed before the main base (<code>class AuditedCurrent(AuditMixin, CurrentAccount)</code>) and calls <code>super()</code>, which reaches the main base through the object's MRO. scikit-learn's <code>ClassifierMixin</code> and Django's view mixins are examples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Composition vs inheritance: which do you prefer, and why?</summary><div class="qa-body">Composition by default. An object that holds parts (an interest policy, a notifier) can combine and swap behaviours at run time, avoids one subclass per feature combination, and does not depend on a parent's internals (the fragile base class problem). Inheritance is right for a true is-a where the child keeps every promise of the parent and polymorphism helps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Liskov substitution principle? Give a violation.</summary><div class="qa-body">A subclass must be usable anywhere its parent is expected without breaking the caller's assumptions. Classic violation: <code>Square(Rect)</code> whose <code>set_w</code> also changes the height, so code that sets the width of a 5×5 shape to 10 expects area 50 and gets 100. Another: a <code>FixedDeposit(Account)</code> whose <code>withdraw</code> always raises. Fix by not inheriting and modelling only the abilities each type really has.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the SOLID principles in one line each.</summary><div class="qa-body">S: a class should have one reason to change. O: add behaviour by adding code (new classes), not editing working code. L: subtypes must honour the base type's contract. I: prefer several small interfaces over one large one, so no class implements methods it cannot support. D: high-level code depends on abstractions, and concrete dependencies are passed in (dependency injection).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dependency injection, and why does it help testing?</summary><div class="qa-body">Passing an object's collaborators in (constructor arguments) instead of creating them inside: <code>Account(owner, balance, notifier)</code>. Production passes a real SMS sender; a test passes a fake that records messages, so the test runs fast, has no side effects and can assert on what was sent. It is the practical form of dependency inversion and why mocking is easy in well-designed code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which design patterns appear in ML libraries?</summary><div class="qa-body">Strategy: passing <code>scoring="f1"</code>, an optimizer or a loss object. Observer: Keras and PyTorch Lightning callbacks. Factory: <code>AutoModel.from_pretrained(name)</code>, <code>pd.DataFrame.from_dict</code>. Template method: <code>nn.Module.__call__</code> wrapping <code>forward</code>. Composition: <code>Pipeline</code>, <code>nn.Sequential</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a singleton in Python, and should you?</summary><div class="qa-body">Override <code>__new__</code> to create the instance once and return the stored one on every later call, or use a decorator or metaclass. Usually you should not: a singleton is global state, hard to reset between tests. A module is already a single shared object, so a <code>config.py</code> with module-level values covers most cases.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the fragile base class problem?</summary><div class="qa-body">Subclasses depend on the internals of their parent (which hooks it calls, in what order, which attributes it sets), so a seemingly safe change to the base class silently breaks distant subclasses. Deep hierarchies make it worse. Composition limits it, because a composed part depends only on the small public interface it implements.</div></details>
</main>
`
});
