// notes/python/py_oop.js — OOP Concepts in Python
Object.assign(TOPIC_CONTENT, {
  "py_oop": `<main>
<h1>OOP Concepts in Python</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>OOP Concepts in Python</span></div>
  <p class="lead">Object-oriented programming (OOP) organises code around <strong>objects</strong>: values that carry their own data together with the only functions allowed to change it. Without that bundling, data lives in dicts and the rules live in loose functions, so any line of code can skip the rules and put a record into an impossible state. Python supports OOP fully, but differently from Java or C++: there are no access modifiers, no interfaces you must declare, and everything, including classes and functions, is already an object. Every scikit-learn estimator (<code>fit</code>/<code>predict</code>), PyTorch <code>nn.Module</code> and pydantic model is a class, and "explain the four pillars" or "when would you not use a class?" come up in almost every Python interview. Code here was run on Python 3.13.</p>

  <h2 id="oo-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">OOP in Python</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why OOP</div>
        <ul>
          <li>Dict + functions: nothing ties the rules to the data</li>
          <li>A class bundles state (attributes) with behaviour (methods)</li>
          <li><b>Invariant</b> — a rule about the data that must always hold</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Class, object, instance</div>
        <ul>
          <li><b>Class</b> — a type you define; <b>object</b> — any value; <b>instance</b> — an object of a given class</li>
          <li>Instance attributes per object (<code>vars(obj)</code>); class attributes shared</li>
          <li><code>obj.m(x)</code> ≡ <code>type(obj).m(obj, x)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Four pillars</div>
        <ul>
          <li><b>Encapsulation</b> — data changes only through methods; <code>_x</code>, <code>@property</code></li>
          <li><b>Abstraction</b> — small interface, hidden details; <code>abc.ABC</code></li>
          <li><b>Inheritance</b> — <code>class Child(Parent)</code>, <code>super()</code>; is-a</li>
          <li><b>Polymorphism</b> — one call, behaviour chosen by the object's type</li>
          <li>⚠ encapsulation ≠ abstraction</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python vs Java / C++</div>
        <ul>
          <li>No <code>private</code>: <code>_x</code> convention, <code>__x</code> name mangling → <code>_Class__x</code></li>
          <li>Duck typing: no declared interface needed</li>
          <li>Everything is an object, classes too; <code>type</code> is the metaclass</li>
          <li>No overloading by signature; multiple inheritance with C3 MRO</li>
          <li>Properties instead of getters/setters</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Paradigms</div>
        <ul>
          <li>Procedural: steps that update state</li>
          <li>Functional: pure functions, no mutation</li>
          <li>OOP: state + allowed operations; Python mixes all three</li>
          <li>⚠ <code>__init__</code> + one method = a function</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="oo-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why OOP: Data and Behaviour Together</span><span class="rm-sub">dict + functions vs a class</span></div></div>
      <div class="rm-item rm-done" data-target="oo-class"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Class, Object and Instance</span><span class="rm-sub">blueprint, values, attributes, methods</span></div></div>
      <div class="rm-item rm-done" data-target="oo-encap"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Encapsulation</span><span class="rm-sub">_x and @property validation</span></div></div>
      <div class="rm-item rm-done" data-target="oo-abstr"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Abstraction</span><span class="rm-sub">ABC interface with fit/predict</span></div></div>
      <div class="rm-item rm-done" data-target="oo-inherit"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Inheritance</span><span class="rm-sub">subclass, super(), __mro__</span></div></div>
      <div class="rm-item rm-done" data-target="oo-poly"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Polymorphism</span><span class="rm-sub">same call, type decides</span></div></div>
      <div class="rm-item rm-done" data-target="oo-diff"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Python OOP vs Java and C++</span><span class="rm-sub">mangling, duck typing, metaclass</span></div></div>
      <div class="rm-item rm-done" data-target="oo-paradigms"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">OOP vs Procedural vs Functional</span><span class="rm-sub">and when not to write a class</span></div></div>
      <div class="rm-item rm-done" data-target="oo-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">god classes, shared state, Java habits</span></div></div>
      <div class="rm-item rm-done" data-target="oo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">pillars, Python rules, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="oo-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">pillars, privacy, MRO, design</span></div></div>
    </div>
  </div>

  <h2 id="oo-why"><span class="num">01</span>Why OOP: Keeping Data and Behaviour Together</h2>
  <p>In procedural code, a record is a dict and the rules for changing it are separate functions. That works until someone changes the dict without calling the function. Below the rule is "a balance never goes below zero".</p>
  <div class="fx" data-lang="py"># Procedural version: data in a dict, the rule in a separate function
account = {"owner": "Asha", "balance": 100}

def withdraw(acc, amount):
    if amount &gt; acc["balance"]:
        raise ValueError("insufficient funds")
    acc["balance"] -= amount

withdraw(account, 30)
print("through the function:", account["balance"])

account["balance"] -= 500        # nothing forces callers to use withdraw()
account["balnce"] = 0            # a typo silently adds a new key
print("after direct edits:  ", account)</div>
  <div class="fx" data-lang="text">through the function: 70
after direct edits:   {'owner': 'Asha', 'balance': -430, 'balnce': 0}</div>
  <p>Through <code>withdraw</code> the balance is correct (70). Two ordinary lines then break it with no error: a direct write skips the rule and leaves −430, and a typo key adds junk. The cause is structural: the data and its rules are separate things that merely happen to be used together, and in a large codebase nothing says which functions belong to which dict.</p>
  <p>OOP fixes this by defining a new type, a <strong>class</strong>, whose values carry the data and the methods that enforce its rules. The data is kept internal and exposed read-only:</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance          # internal: change only through methods

    @property
    def balance(self):                   # read-only view
        return self._balance

    def withdraw(self, amount):          # the rule lives next to the data
        if amount &gt; self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount

acc = Account("Asha", 100)
acc.withdraw(30)
print("balance:", acc.balance)
try:
    acc.balance = -430                   # direct write: refused
except AttributeError as e:
    print("AttributeError:", e)
try:
    acc.withdraw(500)                    # the rule always runs
except ValueError as e:
    print("ValueError:", e)
print("balance:", acc.balance)</div>
  <div class="fx" data-lang="text">balance: 70
AttributeError: property 'balance' of 'Account' object has no setter
ValueError: insufficient funds
balance: 70</div>
  <p>The direct write is refused and the overdraft is refused; the balance stays 70. Every other OOP idea refines this bundle: protecting it (encapsulation), simplifying how it is used (abstraction), reusing it (inheritance), and letting one piece of code work with many kinds of bundle (polymorphism).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Object-oriented programming</strong>: structuring a program as objects that combine <strong>state</strong> (attributes) and <strong>behaviour</strong> (methods), created from classes. An <strong>invariant</strong> is a condition on an object's state that must hold after every public operation (here, <code>balance ≥ 0</code>); most OOP machinery exists to make invariants hard to break by accident.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A plain class does not stop typos either: <code>acc.balnce = 0</code> just creates a new attribute. Declaring <code>__slots__ = ("x", "y")</code> (or using <code>@dataclass(slots=True)</code>) restricts which attribute names may exist:</p></div>
  <div class="fx" data-lang="py">class Point:
    __slots__ = ("x", "y")               # only these attributes may exist
    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
try:
    p.z = 3
except AttributeError as e:
    print("AttributeError:", e)</div>
  <div class="fx" data-lang="text">AttributeError: 'Point' object has no attribute 'z' and no __dict__ for setting new attributes</div>

  <h2 id="oo-class"><span class="num">02</span>Class, Object and Instance</h2>
  <p>A <strong>class</strong> is a blueprint: it defines which attributes its objects have and which methods they support. An <strong>object</strong> is any value in Python. An <strong>instance</strong> is an object considered relative to the class that made it: <code>a</code> is an instance of <code>Account</code>. Calling the class, <code>Account("Asha", 100)</code>, creates a new instance and runs <code>__init__</code> to fill it.</p>
  <div class="fx" data-lang="py">class Account:
    bank = "PocketBank"                  # class attribute: one value, shared

    def __init__(self, owner, balance=0):
        self.owner = owner               # instance attributes: one copy per object
        self.balance = balance

    def deposit(self, amount):           # method: defined once, on the class
        self.balance += amount

a = Account("Asha", 100)                 # two objects (instances) of one class
b = Account("Ben", 50)
a.deposit(50)
print(a.balance, b.balance, a.bank, b.bank)
print(vars(a), vars(b))
print(type(a).__name__, isinstance(a, Account), a is b)
Account.deposit(b, 10)                   # what b.deposit(10) really runs
print(b.balance)
print(isinstance(42, int), isinstance("hi", str), isinstance(Account, type))</div>
  <div class="fx" data-lang="text">150 50 PocketBank PocketBank
{'owner': 'Asha', 'balance': 150} {'owner': 'Ben', 'balance': 50}
Account True False
60
True True True</div>
  <p>Each instance has its own <strong>instance attributes</strong> (<code>vars(a)</code> shows Asha's, <code>vars(b)</code> Ben's), while <code>bank</code> is a <strong>class attribute</strong> stored once on the class and found by lookup. The method <code>deposit</code> is stored once, on the class; <code>b.deposit(10)</code> is shorthand for <code>Account.deposit(b, 10)</code>, which is all <code>self</code> is. The last line shows that the words overlap: <code>42</code> is an instance of <code>int</code>, and the class <code>Account</code> is itself an instance of <code>type</code>. Details of <code>self</code>, <code>__init__</code> and attribute lookup are in <a class="xref" data-note="py_classes">Classes &amp; Objects</a>.</p>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th><th>Example</th></tr>
    <tr><td>Class</td><td>user-defined type: attributes + methods</td><td><code>class Account: ...</code></td></tr>
    <tr><td>Object</td><td>any value; has a type, identity and value</td><td><code>42</code>, <code>"hi"</code>, <code>Account</code>, <code>a</code></td></tr>
    <tr><td>Instance</td><td>an object of a particular class</td><td><code>isinstance(a, Account)</code> is True</td></tr>
    <tr><td>Attribute</td><td>a name stored on an object or class</td><td><code>a.balance</code>, <code>Account.bank</code></td></tr>
    <tr><td>Method</td><td>a function defined in a class, called on an instance</td><td><code>a.deposit(50)</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>An architect's drawing and the houses built from it. The drawing (class) is made once; each house (instance) has its own furniture (instance attributes); the street name printed on the drawing applies to every house (class attribute).</p></div>

  <h2 id="oo-encap"><span class="num">03</span>Encapsulation</h2>
  <p>Encapsulation means an object's internal state is changed only through operations that keep its invariants. Python enforces nothing by keyword: a single underscore (<code>_lr</code>) marks an attribute as internal, and a <code>@property</code> lets a public attribute name run validation code on every read or write.</p>
  <div class="fx" data-lang="py">class Trainer:
    def __init__(self, lr):
        self.lr = lr                     # even __init__ goes through the setter

    @property
    def lr(self):
        return self._lr

    @lr.setter
    def lr(self, value):                 # every assignment is validated
        if not 0 &lt; value &lt; 1:
            raise ValueError(f"lr must be in (0, 1), got {value}")
        self._lr = value

t = Trainer(0.01)
t.lr = 0.001
print(t.lr)
try:
    t.lr = 5
except ValueError as e:
    print("ValueError:", e)
print(vars(t))</div>
  <div class="fx" data-lang="text">0.001
ValueError: lr must be in (0, 1), got 5
{'_lr': 0.001}</div>
  <p>Callers still write <code>t.lr = 0.001</code>, plain attribute syntax, but the setter rejects 5. The real value lives in <code>_lr</code>. Because a property can replace a plain attribute later without changing any caller, Python code starts with public attributes and adds properties only when a rule appears; Java-style <code>get_lr()</code>/<code>set_lr()</code> methods are unnecessary. Name mangling (<code>__x</code>), <code>@property</code> and dataclasses are covered in <a class="xref" data-note="py_classes">Classes &amp; Objects</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Encapsulation</strong>: bundling state with the methods that operate on it and restricting direct access to that state, so the object controls how it changes. In Python it is by convention (<code>_name</code>) and by managed attributes (<code>@property</code>), not by access modifiers.</p></div>

  <h2 id="oo-abstr"><span class="num">04</span>Abstraction</h2>
  <p>Abstraction means callers depend on a small interface (what an object can do) and not on how it does it. In Python an interface can be made explicit and enforced with an <strong>abstract base class</strong>: methods marked <code>@abstractmethod</code> must be implemented by every subclass before it can be instantiated. The scikit-learn estimator interface is the familiar example:</p>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Model(ABC):
    @abstractmethod
    def fit(self, X, y): ...

    @abstractmethod
    def predict(self, X): ...

    def score(self, X, y):               # written once, only against the interface
        preds = self.predict(X)
        return sum(p == t for p, t in zip(preds, y)) / len(y)

class MajorityClass(Model):
    def fit(self, X, y):
        self.label_ = max(set(y), key=y.count)
        return self

    def predict(self, X):
        return [self.label_] * len(X)

X, y = [[1], [2], [3], [4]], [0, 1, 1, 1]
print(MajorityClass().fit(X, y).score(X, y))
try:
    Model()
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">0.75
TypeError: Can't instantiate abstract class Model without an implementation for abstract methods 'fit', 'predict'</div>
  <p><code>score</code> is written once and only calls <code>predict</code>; it works for any model that implements the interface. <code>MajorityClass</code> predicts the most common label (1), so 3 of 4 are right: 0.75. <code>Model</code> itself cannot be created because its abstract methods have no implementation. ABCs, <code>typing.Protocol</code> and the template-method pattern used by <code>score</code> are covered in <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Abstraction</strong>: exposing the essential operations of a type and hiding the implementation. An <strong>abstract class</strong> (inherits <code>abc.ABC</code>, has at least one <code>@abstractmethod</code>) defines such an interface and raises <code>TypeError</code> if instantiated.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Encapsulation and abstraction are the most confused pair. Encapsulation protects <em>data</em> (who may change <code>_lr</code>). Abstraction simplifies the <em>interface</em> (a caller only needs <code>fit</code> and <code>predict</code>). A class can have either without the other.</p></div>

  <h2 id="oo-inherit"><span class="num">05</span>Inheritance</h2>
  <p>Inheritance defines a new class as an extension of an existing one: the child gets every attribute and method of the parent, and adds or overrides only what differs. It models an <strong>is-a</strong> relationship. <code>super()</code> calls the parent's version of a method, typically <code>super().__init__(...)</code> so the parent sets up its part of the object.</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, owner, balance=0):
        self.owner, self.balance = owner, balance

    def withdraw(self, amount):
        if amount &gt; self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

    def __repr__(self):
        return f"{type(self).__name__}({self.owner!r}, {self.balance})"

class SavingsAccount(Account):           # "a SavingsAccount is an Account"
    def __init__(self, owner, balance=0, rate=0.01):
        super().__init__(owner, balance) # reuse the parent's setup
        self.rate = rate

    def add_interest(self):              # add new behaviour
        self.balance = round(self.balance * (1 + self.rate), 2)

s = SavingsAccount("Asha", 120)
s.withdraw(20)                           # inherited from Account
s.add_interest()
print(s, isinstance(s, Account))
print([c.__name__ for c in SavingsAccount.__mro__])</div>
  <div class="fx" data-lang="text">SavingsAccount('Asha', 101.0) True
['SavingsAccount', 'Account', 'object']</div>
  <p><code>withdraw</code> and <code>__repr__</code> were inherited (120 − 20 = 100), <code>add_interest</code> is new (100 × 1.01 = 101.0), and <code>__repr__</code> printed the child's name because <code>type(self)</code> is <code>SavingsAccount</code>. <code>__mro__</code> is the order Python searches for attributes: child, parent, then <code>object</code>, the root of every class. Overriding, multiple inheritance and the C3 MRO are in <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Inheritance</strong>: <code>class Child(Parent)</code> makes <code>Child</code> a subclass; attribute lookup searches <code>Child.__mro__</code> in order, so the child's definitions win and anything missing is found on a parent.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Inherit for a true is-a whose child keeps every promise of the parent, not to borrow code. "An account has a list of transactions" is <em>has-a</em>: store a list as an attribute (composition) instead of subclassing <code>list</code>, which would also hand out <code>clear()</code> and <code>sort()</code>.</p></div>

  <h2 id="oo-poly"><span class="num">06</span>Polymorphism</h2>
  <p>Polymorphism means one operation works on objects of different types, each responding in its own way. Python decides which method runs by looking it up on the object's type when the call happens (dynamic dispatch), so the caller never checks types. A shared parent class is not required: any object with the right method works, which is <strong>duck typing</strong>.</p>
  <div class="fx" data-lang="py">class Circle:
    def __init__(self, r):
        self.r = r
    def area(self):
        return round(3.14159 * self.r ** 2, 2)

class Rect:                              # no common parent with Circle
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h

shapes = [Circle(1), Rect(2, 3)]
print([s.area() for s in shapes])        # one call, the object's type decides what runs
print(len("abc"), len([1, 2]), len({"a": 1}))
print(1 + 2, "a" + "b", [1] + [2])</div>
  <div class="fx" data-lang="text">[3.14, 6]
3 2 1
3 ab [1, 2]</div>
  <p><code>Circle</code> and <code>Rect</code> share no parent, yet one comprehension calls <code>area()</code> on both. The built-ins work the same way: <code>len</code> and <code>+</code> do different things for strings, lists and dicts because each type defines its own <code>__len__</code> and <code>__add__</code> (see <a class="xref" data-note="py_dunder">Dunder Methods &amp; the Data Model</a>). The alternative, an <code>if isinstance(s, Circle): … elif isinstance(s, Rect): …</code> chain, must be edited for every new type.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Polymorphism</strong>: one interface, many implementations. Forms in Python: <strong>subtype</strong> polymorphism (subclasses override a method), <strong>duck typing</strong> (any object with the method), and <strong>operator overloading</strong> through special methods (<code>__add__</code>, <code>__len__</code>). <code>functools.singledispatch</code> adds dispatch on an argument's type for plain functions.</p></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>"Show your ID" at a gate works for students, staff and visitors alike; each shows a different card, and the guard does not need to know in advance who is who.</p></div>

  <h2 id="oo-diff"><span class="num">07</span>How Python's OOP Differs from Java and C++</h2>
  <p>Python has the same concepts as Java and C++, with fewer rules enforced by the language. The differences below are frequent interview follow-ups.</p>
  <h3>No access modifiers: conventions and name mangling</h3>
  <p>There is no <code>private</code> or <code>protected</code>. A leading underscore is a convention for "internal". Two leading underscores (and not two trailing) trigger <strong>name mangling</strong>: inside the class body <code>__secret</code> is renamed to <code>_Account__secret</code>, which prevents accidental clashes with subclass attributes but is not security.</p>
  <div class="fx" data-lang="py">class Account:
    def __init__(self):
        self.public = 1
        self._internal = 2               # convention: "internal, don't touch"
        self.__secret = 3                # name-mangled to _Account__secret

a = Account()
print(a.public, a._internal)
try:
    a.__secret
except AttributeError as e:
    print("AttributeError:", e)
print(a._Account__secret, sorted(vars(a)))</div>
  <div class="fx" data-lang="text">1 2
AttributeError: 'Account' object has no attribute '__secret'
3 ['_Account__secret', '_internal', 'public']</div>
  <h3>Everything is an object, including classes</h3>
  <p>Integers, functions and classes are all objects: they have a type, can be stored in lists, passed to functions and given attributes at run time. The type of a class is <code>type</code>, the default <strong>metaclass</strong> (the class whose instances are classes); calling <code>type(name, bases, namespace)</code> builds a class directly, which is what the <code>class</code> statement does for you.</p>
  <div class="fx" data-lang="py">class Account:
    pass

def greet():
    return "hi"

print(type(42), type(greet), type(Account), type(type))
print(isinstance(Account, object), isinstance(greet, object), isinstance(len, object))
Account.kind = "bank"                    # a class is an object: add attributes at run time
greet.calls = 0                          # so is a function
handlers = [len, str.upper, Account]     # store and pass them like any value
print(Account.kind, greet.calls, [h.__name__ for h in handlers])

Dynamic = type("Dynamic", (object,), {"x": 1})   # type builds classes: it is the metaclass
print(Dynamic, Dynamic().x)</div>
  <div class="fx" data-lang="text">&lt;class 'int'&gt; &lt;class 'function'&gt; &lt;class 'type'&gt; &lt;class 'type'&gt;
True True True
bank 0 ['len', 'upper', 'Account']
&lt;class '__main__.Dynamic'&gt; 1</div>
  <h3>No method overloading by signature</h3>
  <p>A class body is executed like ordinary code, so a second <code>def add</code> simply rebinds the name and the first version is gone. Python uses default arguments, <code>*args</code> or <code>functools.singledispatchmethod</code> instead.</p>
  <div class="fx" data-lang="py">class Calc:
    def add(self, a, b):
        return a + b
    def add(self, a, b, c):              # same name: REPLACES the first definition
        return a + b + c

try:
    Calc().add(1, 2)
except TypeError as e:
    print("TypeError:", e)

def add(*nums):                          # the Python way: one function, flexible arguments
    return sum(nums)
print(add(1, 2), add(1, 2, 3))</div>
  <div class="fx" data-lang="text">TypeError: Calc.add() missing 1 required positional argument: 'c'
3 6</div>
  <table class="tbl"><caption>Python vs Java / C++</caption>
    <tr><th>Feature</th><th>Python</th><th>Java / C++</th></tr>
    <tr><td>Access control</td><td>convention <code>_x</code>; mangling <code>__x</code> → <code>_C__x</code></td><td><code>private</code>, <code>protected</code>, <code>public</code> enforced by the compiler</td></tr>
    <tr><td>Interfaces</td><td>duck typing; optional <code>abc.ABC</code> or <code>typing.Protocol</code></td><td>Java <code>interface</code>; C++ pure virtual classes</td></tr>
    <tr><td>Dispatch</td><td>every method is looked up at run time ("virtual")</td><td>C++ only for <code>virtual</code> methods</td></tr>
    <tr><td>Overloading</td><td>none by signature; defaults, <code>*args</code>, <code>singledispatch</code></td><td>overloads chosen at compile time</td></tr>
    <tr><td>Multiple inheritance</td><td>yes, ordered by the C3 MRO; <code>super()</code> follows it</td><td>Java: classes no (interfaces yes); C++: yes, virtual bases</td></tr>
    <tr><td>Receiver</td><td>explicit <code>self</code> parameter</td><td>implicit <code>this</code></td></tr>
    <tr><td>Getters/setters</td><td>plain attributes, then <code>@property</code></td><td>written up front</td></tr>
    <tr><td>Types</td><td>dynamic; type hints are not enforced at run time</td><td>static, checked at compile time</td></tr>
    <tr><td>Classes at run time</td><td>objects of <code>type</code>; can be created and modified while running</td><td>fixed after compilation</td></tr>
    <tr><td>Primitives</td><td>none: <code>int</code>, <code>bool</code> are objects</td><td><code>int</code>, <code>double</code> are not objects</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Treating <code>__x</code> as "private like Java". It is renamed, not hidden: <code>obj._Account__x</code> always works. Use one underscore for internal attributes and two only to avoid name clashes in classes designed to be subclassed.</p></div>

  <h2 id="oo-paradigms"><span class="num">08</span>OOP vs Procedural vs Functional</h2>
  <p>Python is multi-paradigm: the same task can be written as procedural steps, as functional expressions, or as an object. Each style suits a different kind of problem, and good Python code mixes them.</p>
  <div class="fx" data-lang="py">txns = [("deposit", 100), ("withdraw", 30), ("deposit", 50)]

# Procedural: a sequence of steps that update local state
total = 0
for kind, amount in txns:
    if kind == "deposit":
        total += amount
print("procedural:", total)

# Functional: one expression, no mutation
print("functional:", sum(amount for kind, amount in txns if kind == "deposit"))

# Object-oriented: state plus the only operations allowed on it
class Ledger:
    def __init__(self):
        self._txns = []

    def record(self, kind, amount):
        if kind not in ("deposit", "withdraw") or amount &lt;= 0:
            raise ValueError(f"bad transaction: {kind} {amount}")
        self._txns.append((kind, amount))

    def total_deposits(self):
        return sum(a for k, a in self._txns if k == "deposit")

ledger = Ledger()
for kind, amount in txns:
    ledger.record(kind, amount)
print("oop:       ", ledger.total_deposits())
try:
    ledger.record("deposti", 10)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">procedural: 150
functional: 150
oop:        150
ValueError: bad transaction: deposti 10</div>
  <p>All three give 150. The procedural and functional versions are shorter for a one-off calculation. The <code>Ledger</code> earns its extra lines only because it guards a rule: a typo like <code>"deposti"</code> is rejected at the moment it is recorded, and every later query can trust the data.</p>
  <table class="tbl">
    <tr><th>Style</th><th>Organising idea</th><th>Strength</th><th>Typical Python use</th></tr>
    <tr><td>Procedural</td><td>steps that update variables</td><td>simple, direct</td><td>scripts, notebooks, glue code</td></tr>
    <tr><td>Functional</td><td>pure functions, immutable data, composition</td><td>easy to test and parallelise; no hidden state</td><td>comprehensions, <code>map</code>/<code>filter</code>, pandas/Spark transforms</td></tr>
    <tr><td>Object-oriented</td><td>objects owning state and behaviour</td><td>protects invariants; models many variants</td><td>libraries, models, services, anything with lifecycle state</td></tr>
  </table>
  <h3>When not to write a class</h3>
  <p>A class with only <code>__init__</code> and one method is a function with extra steps:</p>
  <div class="fx" data-lang="py">class Normalizer:                        # a class with __init__ and one method ...
    def __init__(self, data):
        self.data = data

    def run(self):
        lo, hi = min(self.data), max(self.data)
        return [(x - lo) / (hi - lo) for x in self.data]

def normalize(data):                     # ... is just a function
    lo, hi = min(data), max(data)
    return [(x - lo) / (hi - lo) for x in data]

print(Normalizer([2, 4, 6]).run())
print(normalize([2, 4, 6]))</div>
  <div class="fx" data-lang="text">[0.0, 0.5, 1.0]
[0.0, 0.5, 1.0]</div>
  <table class="tbl">
    <tr><th>Situation</th><th>Use instead of a class</th></tr>
    <tr><td>Stateless transformation</td><td>a function</td></tr>
    <tr><td>A bag of fields with no rules</td><td><code>@dataclass</code>, <code>NamedTuple</code>, or a dict</td></tr>
    <tr><td>A function with fixed settings</td><td><code>functools.partial</code> or a closure</td></tr>
    <tr><td>A namespace of helpers or one shared config</td><td>a module</td></tr>
    <tr><td>Data with invariants, several operations on shared state, many variants of one kind of thing</td><td>a class is the right tool</td></tr>
  </table>

  <h2 id="oo-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: a class for everything</span><p>Classes with one method and no state, or "Manager"/"Helper" classes that only group functions. Use functions and modules; reach for a class when there is state with rules.</p></div>
  <div class="callout trap"><span class="label">Trap: god classes</span><p>One class that loads data, trains, logs and sends e-mails has many reasons to change. Split responsibilities and pass collaborators in (see SOLID in <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: inheritance just to reuse code</span><p>Deep hierarchies and names like <code>StudentCashbackSavingsAccount</code> mean inheritance is being used for combinations. Prefer composition (has-a) and keep hierarchies shallow.</p></div>
  <div class="callout trap"><span class="label">Trap: mutable class attributes</span><p><code>items = []</code> in the class body is one list shared by every instance:</p></div>
  <div class="fx" data-lang="py">class Cart:
    items = []                           # class attribute: ONE list for all carts
    def add(self, x):
        self.items.append(x)

a, b = Cart(), Cart()
a.add("tea")
print(b.items)</div>
  <div class="fx" data-lang="text">['tea']</div>
  <p>Create per-object containers in <code>__init__</code> (<code>self.items = []</code>). Details in <a class="xref" data-note="py_classes">Classes &amp; Objects</a>.</p>
  <div class="callout trap"><span class="label">Trap: Java habits</span><p>Writing <code>get_x()</code>/<code>set_x()</code> for every field, or checking <code>type(obj) == SomeClass</code> instead of relying on duck typing or <code>isinstance</code>. Use plain attributes plus <code>@property</code>, and let polymorphism replace type checks.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting <code>super().__init__()</code></span><p>A child that defines <code>__init__</code> replaces the parent's, so the parent's attributes are never set and an <code>AttributeError</code> appears later, far from the cause.</p></div>
  <div class="callout trap"><span class="label">Trap: no <code>__repr__</code></span><p>Objects print as <code>&lt;__main__.Account object at 0x…&gt;</code> in logs and test failures. Define <code>__repr__</code> (or use a dataclass); see <a class="xref" data-note="py_dunder">Dunder Methods</a>.</p></div>

  <h2 id="oo-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core terms</h3>
  <ul>
    <li><b>OOP</b>: objects = state (attributes) + behaviour (methods), created from classes. Solves data and rules drifting apart.</li>
    <li><b>Class</b>: a user-defined type. <b>Object</b>: any value. <b>Instance</b>: an object of a given class (<code>isinstance(a, Account)</code>).</li>
    <li><b>Instance attribute</b>: <code>self.x = …</code>, per object, in <code>vars(obj)</code>. <b>Class attribute</b>: in the class body, shared.</li>
    <li><b>Method call</b>: <code>obj.m(x)</code> ≡ <code>type(obj).m(obj, x)</code>; <code>self</code> is the object.</li>
    <li><b>Invariant</b>: a condition on state that every public method must preserve.</li>
  </ul>
  <h3>The four pillars</h3>
  <table class="tbl">
    <tr><th>Pillar</th><th>Meaning</th><th>Python tools</th></tr>
    <tr><td>Encapsulation</td><td>state changes only through methods that keep invariants</td><td><code>_x</code>, <code>__x</code>, <code>@property</code>, <code>__slots__</code></td></tr>
    <tr><td>Abstraction</td><td>small interface; hide implementation</td><td><code>abc.ABC</code>, <code>@abstractmethod</code>, <code>typing.Protocol</code></td></tr>
    <tr><td>Inheritance</td><td>child reuses and extends a parent (is-a)</td><td><code>class C(P)</code>, <code>super()</code>, <code>__mro__</code></td></tr>
    <tr><td>Polymorphism</td><td>one call, type-specific behaviour</td><td>overriding, duck typing, dunder methods, <code>singledispatch</code></td></tr>
  </table>
  <p>Encapsulation protects data; abstraction simplifies use. Abstract class with unimplemented methods → <code>TypeError</code> on instantiation.</p>
  <h3>Python-specific rules</h3>
  <ul>
    <li>No access modifiers. <code>_x</code> = internal by convention; <code>__x</code> in class <code>C</code> → <code>_C__x</code> (avoid subclass clashes, not security).</li>
    <li>Duck typing: an object fits wherever it has the methods used; no declared interface.</li>
    <li>Everything is an object; <code>type(42)</code> is <code>int</code>, <code>type(int)</code> is <code>type</code>. <code>type(name, bases, dict)</code> creates a class.</li>
    <li>No overloading: a second <code>def</code> with the same name replaces the first.</li>
    <li>Multiple inheritance allowed; lookup order is the C3 MRO; <code>super()</code> = next class in the MRO.</li>
    <li>All methods dispatch dynamically (like C++ <code>virtual</code> everywhere).</li>
    <li><code>isinstance(obj, A)</code> accepts subclasses; <code>type(obj) == A</code> does not.</li>
  </ul>
  <h3>Paradigms and when to use a class</h3>
  <table class="tbl">
    <tr><th>Need</th><th>Use</th></tr>
    <tr><td>stateless transformation</td><td>function</td></tr>
    <tr><td>record without rules</td><td><code>@dataclass</code> / <code>NamedTuple</code></td></tr>
    <tr><td>function with settings</td><td><code>functools.partial</code>, closure</td></tr>
    <tr><td>namespace / single config</td><td>module</td></tr>
    <tr><td>state with invariants, variants, lifecycle</td><td>class</td></tr>
    <tr><td>combining behaviours</td><td>composition over inheritance</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Mutable class attribute (<code>items = []</code>) is shared by all instances.</li>
    <li><code>__x</code> is not private; <code>obj._C__x</code> works.</li>
    <li>Forgetting <code>super().__init__()</code> leaves parent attributes unset.</li>
    <li>A plain class accepts typo attributes; <code>__slots__</code> prevents them.</li>
    <li><code>isinstance</code> chains are polymorphism done by hand.</li>
    <li><code>__init__</code> + one method → write a function.</li>
  </ul>

  <h2 id="oo-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is object-oriented programming, and what problem does it solve?</summary><div class="qa-body">A way of structuring code around objects that combine state (attributes) with the behaviour that operates on it (methods), created from classes. It solves the problem of data and the rules for changing it drifting apart: with dicts and loose functions any code can modify the data directly and break its invariants. A class keeps the rules next to the data and lets it control how the data changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class, an object and an instance?</summary><div class="qa-body">A class is a blueprint (a user-defined type). An object is any value in Python. An instance is an object described relative to its class: <code>Account("Asha")</code> returns an instance of <code>Account</code>. In Python the class itself is also an object, an instance of <code>type</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the four pillars of OOP with a Python example of each.</summary><div class="qa-body">Encapsulation: a <code>_balance</code> attribute exposed through a read-only <code>@property</code>. Abstraction: an <code>abc.ABC</code> with abstract <code>fit</code> and <code>predict</code>, like the scikit-learn estimator interface. Inheritance: <code>class SavingsAccount(Account)</code> calling <code>super().__init__()</code>. Polymorphism: <code>[s.area() for s in shapes]</code> working for circles and rectangles, or <code>len()</code> working for strings, lists and dicts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Encapsulation vs abstraction?</summary><div class="qa-body">Encapsulation hides and protects internal <em>state</em>: who may change it and how (<code>_x</code>, properties). Abstraction hides <em>complexity</em>: the caller sees a small interface and not the implementation (an ABC with <code>fit</code>/<code>predict</code>). One is about protecting data, the other about simplifying use; a class can have one without the other.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python have private attributes?</summary><div class="qa-body">No. A single leading underscore (<code>_x</code>) is a convention meaning "internal; not part of the public API". A double leading underscore (<code>__x</code>) triggers name mangling to <code>_ClassName__x</code>, which avoids clashes with subclass attributes but can still be accessed. Python's philosophy is "we are all consenting adults".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is name mangling and why does it exist?</summary><div class="qa-body">Inside a class body, any name of the form <code>__name</code> (not ending in two underscores) is rewritten to <code>_ClassName__name</code>. It exists so a base class can keep an attribute that a subclass will not overwrite by accidentally using the same name: <code>Account.__balance</code> and <code>Audited.__balance</code> are stored as <code>_Account__balance</code> and <code>_Audited__balance</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>self</code>, and why is it explicit in Python?</summary><div class="qa-body"><code>self</code> is the instance a method was called on, passed automatically as the first argument: <code>a.deposit(50)</code> runs <code>Account.deposit(a, 50)</code>. It is explicit because methods are ordinary functions stored on the class; the explicit parameter makes attribute access (<code>self.balance</code> vs a local <code>balance</code>) unambiguous. The name is a convention, not a keyword.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is duck typing, and how does it differ from interfaces in Java?</summary><div class="qa-body">An object is accepted wherever it provides the methods the code uses, regardless of its class ("if it quacks like a duck"). Java checks at compile time that a type declares an interface; Python just looks the method up when the call runs. Python can add checking back with <code>typing.Protocol</code> (structural, for type checkers) or <code>abc.ABC</code> (nominal, enforced at instantiation).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>class Calc:</code> with <code>def add(self, a, b)</code> and then <code>def add(self, a, b, c)</code>; <code>Calc().add(1, 2)</code></summary><div class="qa-body"><code>TypeError: Calc.add() missing 1 required positional argument: 'c'</code>. Python has no overloading by signature: the class body runs top to bottom and the second <code>def</code> rebinds <code>add</code>. Use default arguments, <code>*args</code>, or <code>functools.singledispatchmethod</code> to dispatch on type.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>class Cart: items = []</code> with <code>def add(self, x): self.items.append(x)</code>; <code>a, b = Cart(), Cart(); a.add("tea"); print(b.items)</code></summary><div class="qa-body"><code>['tea']</code>. <code>items</code> is a class attribute, one list shared by every instance; <code>self.items.append</code> finds it on the class and mutates it in place. Create the list in <code>__init__</code> (<code>self.items = []</code>) so each cart gets its own.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>isinstance(obj, A)</code> and <code>type(obj) == A</code>?</summary><div class="qa-body"><code>isinstance</code> is True for instances of <code>A</code> and of any subclass (and honours ABC registration); <code>type(obj) == A</code> is True only for the exact class. For <code>class B(A)</code> and <code>b = B()</code>: <code>isinstance(b, A)</code> is True, <code>type(b) == A</code> is False. Prefer <code>isinstance</code>, and prefer polymorphism to either.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python support multiple inheritance? How are conflicts resolved?</summary><div class="qa-body">Yes. Attribute lookup follows the method resolution order (<code>C.__mro__</code>), computed by C3 linearisation: a class comes before its parents, parents keep their listed order, each class appears once. For <code>class D(B, C)</code> with B and C inheriting A, the MRO is D, B, C, A, object, and <code>super()</code> in B calls C. Python raises <code>TypeError</code> if no consistent order exists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Inheritance vs composition: when do you use each?</summary><div class="qa-body">Inheritance for a genuine is-a relationship where the child honours every contract of the parent and you want polymorphism. Composition (an object holds other objects and delegates to them) for has-a relationships and for combining or swapping behaviours at run time. Composition is the default: it avoids class explosion and the fragile base class problem. scikit-learn's <code>Pipeline</code> and PyTorch's <code>nn.Sequential</code> are composition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "everything is an object" mean in Python? Is a class an object?</summary><div class="qa-body">Every value, including integers, functions, modules and classes, is an object with a type, an identity and attributes. A class is an object of type <code>type</code>: it can be stored in a variable, passed to a function, returned from one, and modified at run time (<code>Account.kind = "bank"</code>). This is what makes factories, decorators and dependency injection so lightweight in Python.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a metaclass?</summary><div class="qa-body">The class of a class. By default it is <code>type</code>: the <code>class</code> statement collects the body into a namespace and calls <code>type(name, bases, namespace)</code> to build the class object. A custom metaclass (subclass of <code>type</code>) can modify classes as they are created; ABCs use <code>ABCMeta</code>. Most code never needs one; <code>__init_subclass__</code> and class decorators cover the common cases.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an abstract class in Python? Can you instantiate one?</summary><div class="qa-body">A class that inherits <code>abc.ABC</code> (or uses <code>ABCMeta</code>) and has at least one method decorated with <code>@abstractmethod</code>. Instantiating it, or any subclass that has not implemented all abstract methods, raises <code>TypeError: Can't instantiate abstract class …</code>. It can also contain concrete methods shared by all subclasses.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Python prefer properties over getter and setter methods?</summary><div class="qa-body">Because a property can replace a plain attribute later without changing any caller: <code>obj.lr = 0.1</code> keeps working but now runs validation. So you start with public attributes and add control only when a rule appears. Java needs <code>getX()</code>/<code>setX()</code> from day one because changing a field to a method breaks callers there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not write a class?</summary><div class="qa-body">When there is no state with rules: a stateless transformation is a function; a record without behaviour is a dataclass or NamedTuple; a function with fixed settings is a <code>functools.partial</code> or closure; a group of helpers or a single shared config is a module. A class whose only methods are <code>__init__</code> and one other is usually a function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>OOP vs functional programming: how do they compare, and how does Python use both?</summary><div class="qa-body">OOP models a system as objects owning mutable state behind methods; functional programming builds results from pure functions over immutable data, which makes code easier to test and parallelise. Python mixes them: classes for stateful components (models, connections, services), and comprehensions, generators, <code>map</code>/<code>filter</code> and pure functions for data transformations, as in pandas or Spark pipelines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which OOP ideas does scikit-learn rely on?</summary><div class="qa-body">Abstraction and duck typing: every estimator has <code>fit</code>/<code>predict</code> (or <code>transform</code>), so <code>cross_val_score</code> and <code>GridSearchCV</code> accept any of them. Inheritance: estimators subclass <code>BaseEstimator</code> (which provides <code>get_params</code>/<code>set_params</code>) and mixins like <code>ClassifierMixin</code> (which provides <code>score</code>). Composition: <code>Pipeline</code> and <code>ColumnTransformer</code> hold other estimators. Encapsulation by convention: learnt state ends in an underscore (<code>coef_</code>).</div></details>
</main>
`
});
