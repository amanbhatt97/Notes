// notes/python/py_oop.js — OOP
Object.assign(TOPIC_CONTENT, {
  "py_oop": `<main>
  <h1>Object-Oriented Programming</h1>
  <p class="lead">How Python bundles data and behaviour into classes, and the design rules (pillars, SOLID, patterns) that keep big codebases sane. Every sklearn estimator, PyTorch module and pipeline you touch is built this way, and OOP is a staple interview topic.</p>

  <h2 id="po-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Python OOP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Class &amp; object</div>
        <ul>
          <li><b>Class</b> — blueprint; <b>object</b> — one built instance with its own data</li>
          <li><b>__init__</b> — fills a new object's attributes; Python calls it on <code>Dog("Bruno")</code></li>
          <li><b>self</b> — "my"; <code>bruno.bark()</code> is really <code>Dog.bark(bruno)</code></li>
          <li><b>Instance attr</b> — per object (<code>obj.__dict__</code>); <b>class attr</b> — shared</li>
          <li><b>Lookup</b> — instance → class → parents (MRO)</li>
          <li>⚠ Mutable class attr (<code>tricks = []</code>) is shared by all objects; create it in __init__</li>
          <li>💡 Architect's drawing vs the houses built from it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Method kinds</div>
        <ul>
          <li><b>Instance</b> — gets <code>self</code>; reads/writes object state</li>
          <li><b>@classmethod</b> — gets <code>cls</code>; alternative constructors (<code>from_config</code>), subclass-aware</li>
          <li><b>@staticmethod</b> — gets nothing; utility that belongs with the class</li>
          <li>⚠ Hard-coding the class name in a factory breaks subclasses; use <code>cls(...)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Four pillars</div>
        <ul>
          <li><b>Encapsulation</b> — hide DATA behind methods/properties; <code>_x</code> convention, <code>__x</code> name-mangled</li>
          <li><b>Abstraction</b> — hide COMPLEXITY; expose a small interface (ABC)</li>
          <li><b>Inheritance</b> — is-a reuse; always call <code>super().__init__()</code></li>
          <li><b>Polymorphism</b> — same call, type-specific behaviour (dynamic dispatch, duck typing)</li>
          <li>⚠ Encapsulation ≠ abstraction: data protection vs interface simplification</li>
          <li><b>Name mangling</b> — <code>__bal</code> → <code>_Account__bal</code>; avoids subclass clashes, not security</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dunder methods</div>
        <ul>
          <li><b>__repr__</b> dev string (ideally recreates obj); <b>__str__</b> user string; define __repr__ first</li>
          <li><b>Operators</b> — <code>__add__ __mul__ __rmul__ __eq__ __lt__</code></li>
          <li><b>Containers</b> — <code>__len__ __getitem__ __contains__ __iter__</code></li>
          <li><b>__call__</b> — instance used like a function (PyTorch <code>model(x)</code>)</li>
          <li>Return <code>NotImplemented</code> for unknown types → Python tries the other side</li>
          <li>⚠ Defining <code>__eq__</code> sets <code>__hash__ = None</code> → unhashable unless you add __hash__</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Properties &amp; dataclasses</div>
        <ul>
          <li><b>@property</b> — attribute syntax, method logic (validate, compute)</li>
          <li>No setter → read-only attribute</li>
          <li><b>@dataclass</b> — auto <code>__init__ __repr__ __eq__</code>; <code>order=True</code>, <code>frozen=True</code></li>
          <li>⚠ Mutable default → <code>field(default_factory=list)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interfaces</div>
        <ul>
          <li><b>ABC + @abstractmethod</b> — nominal; must inherit; can't instantiate until all implemented</li>
          <li><b>Protocol</b> — structural; any class with the right methods fits (static duck typing)</li>
          <li><code>@runtime_checkable</code> — enables isinstance (checks names only)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Composition &amp; MRO</div>
        <ul>
          <li><b>Inheritance</b> = is-a; <b>composition</b> = has-a (Car has an Engine)</li>
          <li>Prefer composition: loose coupling, swap parts at runtime, no fragile base class</li>
          <li><b>MRO</b> — C3 linearisation; child before parents, left-to-right bases, each once</li>
          <li>Diamond <code>D(B, C)</code> → D, B, C, A, object; check <code>D.__mro__</code></li>
          <li><b>super()</b> = next class in the MRO, not "my parent" (enables mixins)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SOLID &amp; patterns</div>
        <ul>
          <li><b>S</b> one reason to change · <b>O</b> extend, don't edit · <b>L</b> subclass usable as parent</li>
          <li><b>I</b> small interfaces · <b>D</b> depend on abstractions, inject dependencies</li>
          <li>⚠ LSP classic: Square(Rect) breaks <code>set_w</code> expectations</li>
          <li><b>Factory</b> — pick class from input (<code>make_loader("x.csv")</code>)</li>
          <li><b>Strategy</b> — swap algorithm object/function (metric, optimizer)</li>
          <li><b>Singleton</b> — one instance (config); in Python a module often suffices</li>
          <li><b>Observer</b> — subscribers notified on events (training callbacks)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="po-class"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Classes &amp; Objects</span><span class="rm-sub">Blueprint, __init__, self</span></div></div>
      <div class="rm-item rm-done" data-target="po-methods"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Instance, Class, Static Methods</span><span class="rm-sub">self vs cls vs nothing</span></div></div>
      <div class="rm-item rm-done" data-target="po-pillars"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Four Pillars</span><span class="rm-sub">What each hides or reuses</span></div></div>
      <div class="rm-item rm-done" data-target="po-dunder"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Dunder Methods &amp; Operators</span><span class="rm-sub">Make objects act built-in</span></div></div>
      <div class="rm-item rm-done" data-target="po-prop"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Properties &amp; Dataclasses</span><span class="rm-sub">Less boilerplate, safe attributes</span></div></div>
      <div class="rm-item rm-done" data-target="po-abc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">ABCs &amp; Protocols</span><span class="rm-sub">Contracts for subclasses</span></div></div>
      <div class="rm-item rm-done" data-target="po-comp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Composition vs Inheritance</span><span class="rm-sub">has-a beats is-a</span></div></div>
      <div class="rm-item rm-done" data-target="po-mro"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">MRO &amp; super()</span><span class="rm-sub">The diamond, solved</span></div></div>
      <div class="rm-item rm-done" data-target="po-solid"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">SOLID</span><span class="rm-sub">Five rules, before → after</span></div></div>
      <div class="rm-item rm-done" data-target="po-pat"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Design Patterns</span><span class="rm-sub">Factory, strategy, singleton, observer</span></div></div>
      <div class="rm-item rm-done" data-target="po-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="po-class"><span class="num">01</span>Classes &amp; Objects</h2>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
    <defs><marker id="po-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="50" width="190" height="96" rx="6" class="fb sb"/>
    <text x="32" y="72" font-weight="bold">class Dog</text>
    <text x="32" y="94">species = "Canis..."</text>
    <text x="32" y="112">bark(self)</text>
    <text x="32" y="134" class="tm">shared by all</text>
    <line x1="212" y1="80" x2="318" y2="45" stroke="currentColor" marker-end="url(#po-ah1)"/>
    <line x1="212" y1="118" x2="318" y2="150" stroke="currentColor" marker-end="url(#po-ah1)"/>
    <text x="226" y="100" class="tm">Dog(...)</text>
    <rect x="320" y="14" width="220" height="62" rx="6" class="fg sg"/>
    <text x="332" y="36" font-weight="bold">bruno</text>
    <text x="332" y="58">name="Bruno", age=3</text>
    <rect x="320" y="120" width="220" height="62" rx="6" class="fg sg"/>
    <text x="332" y="142" font-weight="bold">tommy</text>
    <text x="332" y="164">name="Tommy", age=5</text>
  </svg><figcaption>One class, many objects. Each object stores its own data; methods and class attributes live once on the class.</figcaption></figure>
  <p>A <strong>class</strong> groups data and the functions that act on it. Without it, 500 patients become 2,500 loose variables with no structure.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Class = architect's drawing; object = a house built from it. Repainting one house changes neither the drawing nor the other houses.</p></div>
  <div class="fx" data-lang="py">class Dog:
    species = "Canis familiaris"          # class attribute: shared
    def __init__(self, name, age):        # runs automatically on Dog(...)
        self.name = name                  # instance attributes: per object
        self.age = age
    def bark(self):
        return f"{self.name} says Woof"

bruno, tommy = Dog("Bruno", 3), Dog("Tommy", 5)
print(bruno.bark(), "|", Dog.bark(tommy))   # self is just the first argument
print(bruno is tommy, bruno.species is tommy.species)
print(bruno.__dict__)</div>
  <div class="fx" data-lang="text">Bruno says Woof | Tommy says Woof
False True
{'name': 'Bruno', 'age': 3}</div>
  <ul>
    <li><code>__init__</code> is an initialiser: the object already exists (made by <code>__new__</code>); it just fills attributes.</li>
    <li><code>self</code> is Python's "my": <code>bruno.bark()</code> becomes <code>Dog.bark(bruno)</code>.</li>
    <li>Attribute lookup goes <strong>instance __dict__ → class → parent classes</strong>. That's why <code>bruno.species</code> works.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>A mutable class attribute is shared by every object.</p></div>
  <div class="fx" data-lang="py">class Bad:
    tricks = []                     # one list for ALL dogs
    def add(self, t): self.tricks.append(t)
a, b = Bad(), Bad()
a.add("sit")
print(b.tricks)                     # b never learned "sit"!</div>
  <div class="fx" data-lang="text">['sit']</div>
  <p>Fix: create it per object in <code>__init__</code> (<code>self.tricks = []</code>).</p>

  <h2 id="po-methods"><span class="num">02</span>Instance, Class, Static Methods</h2>
  <table class="tbl">
    <tr><th>Kind</th><th>First arg</th><th>Can touch</th><th>Use for</th></tr>
    <tr><td>Instance</td><td><code>self</code></td><td>object + class state</td><td>Normal behaviour (<code>fit</code>, <code>predict</code>)</td></tr>
    <tr><td><code>@classmethod</code></td><td><code>cls</code></td><td>class state</td><td>Alternative constructors, registries</td></tr>
    <tr><td><code>@staticmethod</code></td><td>none</td><td>only its args</td><td>Helper that logically belongs to the class</td></tr>
  </table>
  <div class="fx" data-lang="py">class Model:
    registry = 0
    def __init__(self, name, lr=1e-3):
        self.name, self.lr = name, lr
        Model.registry += 1
    def describe(self):                 # instance method
        return f"{self.name} lr={self.lr}"
    @classmethod
    def from_config(cls, cfg):          # alternative constructor
        return cls(cfg["name"], cfg.get("lr", 1e-3))
    @staticmethod
    def valid_lr(lr):                   # pure helper
        return 0 &lt; lr &lt; 1

class Bert(Model): pass
m = Bert.from_config({"name": "bert", "lr": 2e-5})
print(type(m).__name__, m.describe(), Model.valid_lr(5), Model.registry)</div>
  <div class="fx" data-lang="text">Bert bert lr=2e-05 False 1</div>
  <p>Notice <code>Bert.from_config</code> returned a <strong>Bert</strong>: <code>cls</code> is whichever class you called it on. Real-world: <code>pd.DataFrame.from_dict</code>, <code>datetime.fromisoformat</code>.</p>

  <h2 id="po-pillars"><span class="num">03</span>The Four Pillars</h2>
  <table class="tbl">
    <tr><th>Pillar</th><th>What</th><th>Why</th><th>Python tool</th></tr>
    <tr><td><strong>Encapsulation</strong></td><td>Hide DATA; change it only through methods</td><td>Keeps state valid (no negative balance)</td><td><code>_x</code>, <code>__x</code>, <code>@property</code></td></tr>
    <tr><td><strong>Abstraction</strong></td><td>Hide COMPLEXITY behind a small interface</td><td>Caller knows <em>what</em>, not <em>how</em></td><td>ABC, <code>@abstractmethod</code></td></tr>
    <tr><td><strong>Inheritance</strong></td><td>Child reuses parent code (is-a)</td><td>Write shared logic once</td><td><code>class Child(Parent)</code>, <code>super()</code></td></tr>
    <tr><td><strong>Polymorphism</strong></td><td>Same call, type-specific behaviour</td><td>No <code>if isinstance</code> chains</td><td>Overriding, duck typing</td></tr>
  </table>
  <p>They are design principles, not features Python enforces.</p>

  <h3>Encapsulation</h3>
  <div class="callout anlg"><span class="label">Analogy</span><p>An ATM: you deposit and withdraw through buttons with rules; you can't open the box and grab cash.</p></div>
  <div class="fx" data-lang="py">class Account:
    def __init__(self, balance):
        self.__balance = balance          # name-mangled to _Account__balance
    def withdraw(self, amt):
        if amt &gt; self.__balance:
            raise ValueError("insufficient funds")
        self.__balance -= amt
    @property
    def balance(self):                    # read-only view
        return self.__balance

acc = Account(100); acc.withdraw(30)
print(acc.balance)
acc.__balance                 # AttributeError
print(acc._Account__balance)  # mangled name still reachable
acc.balance = 1_000_000       # AttributeError: no setter</div>
  <div class="fx" data-lang="text">70
AttributeError: 'Account' object has no attribute '__balance'
70
AttributeError: property 'balance' of 'Account' object has no setter</div>
  <ul>
    <li><code>_x</code>: convention, "internal, don't touch". <code>__x</code>: renamed to <code>_Class__x</code> so subclasses can't clash with it.</li>
    <li>Python has no true private. Mangling prevents accidents, not access.</li>
  </ul>

  <h3>Inheritance &amp; polymorphism</h3>
  <div class="fx" data-lang="py">class Staff:
    def __init__(self, name): self.name = name
    def role(self): return "staff"
    def badge(self): return f"{self.name} [{self.role()}]"   # calls the override!

class Doctor(Staff):                      # Doctor IS-A Staff
    def __init__(self, name, spec):
        super().__init__(name)            # let the parent set self.name
        self.spec = spec
    def role(self): return f"doctor/{self.spec}"

class Nurse(Staff):
    def role(self): return "nurse"

for p in [Doctor("Alice", "cardio"), Nurse("Bob"), Staff("Cy")]:
    print(p.badge())                      # one loop, three behaviours</div>
  <div class="fx" data-lang="text">Alice [doctor/cardio]
Bob [nurse]
Cy [staff]</div>
  <p>Python picks <code>role()</code> from the object's actual type at runtime: <strong>dynamic dispatch</strong>. Duck typing goes further: any object with a <code>badge()</code> method works in that loop, related or not.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Override <code>__init__</code> but forget <code>super().__init__()</code> → parent attributes never exist: <code>AttributeError: 'Broken' object has no attribute 'name'</code>.</p></div>

  <h3>Abstraction</h3>
  <div class="callout anlg"><span class="label">Analogy</span><p>Google Maps: you type a destination and press Go. Routing, traffic data and servers stay hidden.</p></div>
  <p>In code: <code>model.fit(X, y)</code> hides the optimiser. Enforced with ABCs (section 06).</p>
  <div class="callout trap"><span class="label">Trap</span><p>Most-asked mix-up. <strong>Encapsulation</strong> protects data (who may change state). <strong>Abstraction</strong> simplifies the interface (what the caller needs to know).</p></div>

  <h2 id="po-dunder"><span class="num">04</span>Dunder Methods &amp; Operator Overloading</h2>
  <table class="tbl">
    <tr><th>You write</th><th>Python calls</th><th>You write</th><th>Python calls</th></tr>
    <tr><td><code>print(v)</code></td><td><code>__str__</code></td><td><code>repr(v)</code> / shell</td><td><code>__repr__</code></td></tr>
    <tr><td><code>v + w</code></td><td><code>__add__</code></td><td><code>3 * v</code></td><td><code>__rmul__</code></td></tr>
    <tr><td><code>v == w</code></td><td><code>__eq__</code></td><td><code>v &lt; w</code></td><td><code>__lt__</code></td></tr>
    <tr><td><code>len(v)</code></td><td><code>__len__</code></td><td><code>v[0]</code></td><td><code>__getitem__</code></td></tr>
    <tr><td><code>x in v</code></td><td><code>__contains__</code></td><td><code>for x in v</code></td><td><code>__iter__</code></td></tr>
    <tr><td><code>bool(v)</code></td><td><code>__bool__</code></td><td><code>v(x)</code></td><td><code>__call__</code></td></tr>
    <tr><td><code>with v:</code></td><td><code>__enter__/__exit__</code></td><td><code>{v}</code>, dict key</td><td><code>__hash__</code></td></tr>
  </table>
  <p>Dunder ("double underscore") methods are hooks Python calls for built-in syntax. <strong>Operator overloading</strong> is just using them for operators.</p>
  <div class="fx" data-lang="py">class Vector:
    def __init__(self, x, y): self.x, self.y = x, y
    def __repr__(self): return f"Vector({self.x}, {self.y})"   # for devs
    def __str__(self):  return f"({self.x}, {self.y})"         # for users
    def __add__(self, o):
        if not isinstance(o, Vector): return NotImplemented     # let Python try o.__radd__
        return Vector(self.x + o.x, self.y + o.y)
    def __mul__(self, k):  return Vector(self.x * k, self.y * k)
    __rmul__ = __mul__                       # makes 3 * v work
    def __eq__(self, o):
        return isinstance(o, Vector) and (self.x, self.y) == (o.x, o.y)
    def __hash__(self): return hash((self.x, self.y))
    def __abs__(self):  return (self.x**2 + self.y**2) ** 0.5
    def __bool__(self): return bool(self.x or self.y)
    def __len__(self): return 2
    def __getitem__(self, i): return (self.x, self.y)[i]       # also makes it iterable

v, w = Vector(3, 4), Vector(1, 2)
print(v + w, repr(v + w), 3 * v, abs(v))
print(v == Vector(3, 4), v is Vector(3, 4), bool(Vector(0, 0)))
print(list(v), v[1], len(v), {v, Vector(3, 4)})
v + 5</div>
  <div class="fx" data-lang="text">(4, 6) Vector(4, 6) (9, 12) 5.0
True False False
[3, 4] 4 2 {Vector(3, 4)}
TypeError: unsupported operand type(s) for +: 'Vector' and 'int'</div>
  <ul>
    <li><code>print</code> uses <code>__str__</code>, falling back to <code>__repr__</code>. Define <code>__repr__</code> first.</li>
    <li>Without <code>__eq__</code>, <code>==</code> compares identity: <code>Plain() == Plain()</code> → <code>False</code>.</li>
    <li><code>__call__</code> is why PyTorch's <code>model(x)</code> runs <code>forward</code> plus hooks.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Defining <code>__eq__</code> silently sets <code>__hash__ = None</code>. Putting the object in a set then fails: <code>TypeError: unhashable type: 'NoHash'</code>. Add <code>__hash__</code> over the same immutable fields.</p></div>

  <h2 id="po-prop"><span class="num">05</span>Properties &amp; Dataclasses</h2>
  <h3>@property</h3>
  <p>Attribute syntax on the outside, a method on the inside. Use it to validate or compute without Java-style <code>get_x()/set_x()</code>.</p>
  <div class="fx" data-lang="py">class Temperature:
    def __init__(self, c): self.celsius = c        # goes through the setter
    @property
    def celsius(self): return self._c
    @celsius.setter
    def celsius(self, v):
        if v &lt; -273.15: raise ValueError("below absolute zero")
        self._c = v
    @property
    def fahrenheit(self): return self._c * 9 / 5 + 32   # computed, read-only

t = Temperature(25); print(t.celsius, t.fahrenheit)
t.celsius = -300</div>
  <div class="fx" data-lang="text">25 77.0
ValueError: below absolute zero</div>
  <p>Bonus: you can start with a plain attribute and switch to a property later without changing any caller.</p>

  <h3>@dataclass</h3>
  <div class="flow"><span>Declare typed fields</span><span>@dataclass</span><span>__init__, __repr__, __eq__ generated</span><span>+ order / frozen on request</span></div>
  <div class="fx" data-lang="py">from dataclasses import dataclass, field

@dataclass(order=True, frozen=True)
class Run:
    score: float
    name: str = field(compare=False)
    tags: list = field(default_factory=list, compare=False)

r1, r2 = Run(0.91, "xgb"), Run(0.87, "rf")
print(r1)
print(r1 &gt; r2, sorted([r1, r2])[0].name, r1 == Run(0.91, "other"))
r1.score = 1.0</div>
  <div class="fx" data-lang="text">Run(score=0.91, name='xgb', tags=[])
True rf True
FrozenInstanceError: cannot assign to field 'score'</div>
  <ul>
    <li><code>order=True</code> compares fields as a tuple (here only <code>score</code>, since others have <code>compare=False</code>).</li>
    <li><code>frozen=True</code>: immutable and hashable. Good for configs and dict keys.</li>
    <li>Need runtime type validation (APIs, configs)? Use <strong>pydantic</strong>; dataclasses don't check types.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p><code>tags: list = []</code> is rejected: <code>ValueError: mutable default &lt;class 'list'&gt; for field tags is not allowed: use default_factory</code>.</p></div>

  <h2 id="po-abc"><span class="num">06</span>ABCs &amp; Protocols</h2>
  <div class="cards">
    <div><b>ABC</b><p>Nominal: you must inherit. Missing abstract methods → can't instantiate.</p><small>Use: your own class hierarchy, shared concrete helpers</small></div>
    <div><b>Protocol</b><p>Structural: anything with matching methods fits. Checked by mypy, no inheritance.</p><small>Use: accepting third-party objects (duck typing, typed)</small></div>
  </div>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Model(ABC):
    @abstractmethod
    def fit(self, X, y): ...
    @abstractmethod
    def predict(self, X): ...
    def fit_predict(self, X, y):          # concrete, shared by all subclasses
        return self.fit(X, y).predict(X)

class Half(Model):
    def fit(self, X, y): return self      # forgot predict

class Mean(Model):
    def fit(self, X, y): self.m = sum(y) / len(y); return self
    def predict(self, X): return [self.m] * len(X)

Model()
Half()
print(Mean().fit_predict([1, 2, 3], [10, 20, 30]))</div>
  <div class="fx" data-lang="text">TypeError: Can't instantiate abstract class Model without an implementation for abstract methods 'fit', 'predict'
TypeError: Can't instantiate abstract class Half without an implementation for abstract method 'predict'
[20.0, 20.0, 20.0]</div>
  <p>The error fires at construction, not when <code>predict</code> is first called in production.</p>
  <div class="fx" data-lang="py">from typing import Protocol, runtime_checkable

@runtime_checkable
class Predictor(Protocol):
    def predict(self, X): ...

class SklearnLike:                         # does NOT inherit Predictor
    def predict(self, X): return [0] * len(X)

def evaluate(m: Predictor, X): return m.predict(X)
print(evaluate(SklearnLike(), [1, 2]), isinstance(SklearnLike(), Predictor), isinstance(3, Predictor))</div>
  <div class="fx" data-lang="text">[0, 0] True False</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>isinstance</code> on a runtime-checkable Protocol only checks method <em>names</em> exist, not signatures or return types.</p></div>

  <h2 id="po-comp"><span class="num">07</span>Composition vs Inheritance</h2>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
    <defs><marker id="po-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="none" stroke="currentColor"/></marker>
    <marker id="po-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="70" y="20" class="tb" font-weight="bold">Inheritance: is-a</text>
    <rect x="80" y="34" width="100" height="32" rx="5" class="fb sb"/><text x="108" y="55">Staff</text>
    <rect x="20" y="124" width="100" height="32" rx="5" class="fb sb"/><text x="45" y="145">Doctor</text>
    <rect x="140" y="124" width="100" height="32" rx="5" class="fb sb"/><text x="168" y="145">Nurse</text>
    <line x1="70" y1="122" x2="115" y2="70" stroke="currentColor" marker-end="url(#po-ah2)"/>
    <line x1="190" y1="122" x2="145" y2="70" stroke="currentColor" marker-end="url(#po-ah2)"/>
    <line x1="280" y1="10" x2="280" y2="180" stroke="currentColor" opacity="0.3"/>
    <text x="330" y="20" class="tg" font-weight="bold">Composition: has-a</text>
    <rect x="310" y="70" width="90" height="40" rx="5" class="fg sg"/><text x="340" y="95">Car</text>
    <line x1="402" y1="90" x2="448" y2="60" stroke="currentColor" marker-end="url(#po-ah3)"/>
    <line x1="402" y1="90" x2="448" y2="130" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#po-ah3)"/>
    <rect x="450" y="42" width="100" height="32" rx="5" class="ft st"/><text x="466" y="63">Engine</text>
    <rect x="450" y="114" width="100" height="32" rx="5" class="ft st"/><text x="462" y="135">Electric</text>
    <text x="400" y="172" class="tm">swap part at runtime</text>
  </svg><figcaption>Inheritance fixes the relationship at class-definition time; composition plugs in a part you can replace.</figcaption></figure>
  <table class="tbl">
    <tr><th>Ask</th><th>Answer</th><th>Use</th></tr>
    <tr><td>Is a Doctor a Staff member?</td><td>yes</td><td>Inheritance</td></tr>
    <tr><td>Is a Car an Engine?</td><td>no, it <em>has</em> one</td><td>Composition</td></tr>
    <tr><td>Does a Pipeline have steps?</td><td>yes</td><td>Composition (sklearn <code>Pipeline</code>)</td></tr>
  </table>
  <div class="fx" data-lang="py">class Engine:
    def start(self): return "petrol engine on"
class Electric:
    def start(self): return "electric motor on"

class Car:
    def __init__(self, engine): self.engine = engine   # has-a, injected
    def start(self): return "car: " + self.engine.start()   # delegate

print(Car(Engine()).start(), "|", Car(Electric()).start())</div>
  <div class="fx" data-lang="text">car: petrol engine on | car: electric motor on</div>
  <p><strong>Prefer composition.</strong> Parts are tested and swapped independently, and you avoid the <em>fragile base class</em> problem (a parent change silently breaks every child). Use inheritance for a true is-a where you want polymorphism.</p>

  <h2 id="po-mro"><span class="num">08</span>MRO &amp; super()</h2>
  <figure class="viz"><svg viewBox="0 0 520 210" width="520">
    <defs><marker id="po-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <rect x="110" y="10" width="60" height="32" rx="5" class="fs" stroke="currentColor"/><text x="135" y="31">A</text>
    <rect x="30" y="85" width="60" height="32" rx="5" class="fb sb"/><text x="55" y="106">B</text>
    <rect x="190" y="85" width="60" height="32" rx="5" class="fb sb"/><text x="215" y="106">C</text>
    <rect x="110" y="160" width="60" height="32" rx="5" class="fg sg"/><text x="135" y="181">D</text>
    <line x1="70" y1="85" x2="125" y2="42" stroke="currentColor" opacity="0.5"/>
    <line x1="210" y1="85" x2="155" y2="42" stroke="currentColor" opacity="0.5"/>
    <line x1="125" y1="160" x2="70" y2="117" stroke="currentColor" opacity="0.5"/>
    <line x1="155" y1="160" x2="210" y2="117" stroke="currentColor" opacity="0.5"/>
    <path d="M108,170 C40,165 20,140 40,120" fill="none" class="sr" stroke-width="2" marker-end="url(#po-ah4)"/>
    <path d="M92,100 C130,90 150,92 186,100" fill="none" class="sr" stroke-width="2" marker-end="url(#po-ah4)"/>
    <path d="M240,84 C250,50 200,30 174,28" fill="none" class="sr" stroke-width="2" marker-end="url(#po-ah4)"/>
    <text x="16" y="160" class="tr">1</text><text x="132" y="86" class="tr">2</text><text x="248" y="56" class="tr">3</text>
    <text x="290" y="60">class D(B, C)</text>
    <text x="290" y="90" class="tr">D → B → C → A → object</text>
    <text x="290" y="120" class="tm">child before parents,</text>
    <text x="290" y="138" class="tm">bases left to right,</text>
    <text x="290" y="156" class="tm">each class once (A last)</text>
  </svg><figcaption>The diamond: B and C share parent A. C3 linearisation visits C before A, so A's method runs once.</figcaption></figure>
  <p><strong>MRO</strong> (Method Resolution Order) is the list Python searches for a method. It's computed by <strong>C3 linearisation</strong>.</p>
  <div class="fx" data-lang="py">class A:
    def who(self): return "A"
class B(A):
    def who(self): return "B&gt;" + super().who()
class C(A):
    def who(self): return "C&gt;" + super().who()
class D(B, C):
    def who(self): return "D&gt;" + super().who()

print(D().who())
print([k.__name__ for k in D.__mro__])</div>
  <div class="fx" data-lang="text">D&gt;B&gt;C&gt;A
['D', 'B', 'C', 'A', 'object']</div>
  <div class="callout intu"><span class="label">Key insight</span><p><code>super()</code> means "next class in <em>this object's</em> MRO", not "my parent". Inside B, <code>super()</code> called <strong>C</strong>, a class B never mentions. That is what makes mixins cooperate.</p></div>
  <div class="fx" data-lang="py">class LogMixin:
    def save(self):
        print("log: saving", type(self).__name__)
        super().save()                 # continues to Store
class Store:
    def save(self): print("store: written")
class Report(LogMixin, Store): pass
Report().save()</div>
  <div class="fx" data-lang="text">log: saving Report
store: written</div>
  <div class="callout trap"><span class="label">Trap</span><p>Bases in an impossible order fail at class creation: <code>class Z(X, Y)</code> where <code>Y(X)</code> → <code>TypeError: Cannot create a consistent method resolution order (MRO) for bases X, Y</code>. Put the subclass first.</p></div>

  <h2 id="po-solid"><span class="num">09</span>SOLID</h2>
  <p>Five rules that keep classes easy to change. Each row: the smell, then the fix.</p>
  <table class="tbl">
    <tr><th>Principle</th><th>Before (smell)</th><th>After (fix)</th></tr>
    <tr><td><strong>S</strong>ingle responsibility: one reason to change</td><td><code>Report</code> computes metrics, renders HTML <em>and</em> emails it</td><td><code>MetricsCalc</code>, <code>HtmlRenderer</code>, <code>Mailer</code>; Report composes them</td></tr>
    <tr><td><strong>O</strong>pen/closed: extend without editing</td><td><code>if kind == "festive": ... elif kind == "member": ...</code> grows forever</td><td>One <code>Discount</code> subclass per rule; <code>checkout</code> never changes</td></tr>
    <tr><td><strong>L</strong>iskov substitution: subclass works wherever parent does</td><td><code>Square(Rect)</code> also changes height in <code>set_w</code></td><td>Don't inherit; make both implement a <code>Shape.area()</code> interface</td></tr>
    <tr><td><strong>I</strong>nterface segregation: no forced unused methods</td><td><code>Model</code> ABC demands <code>fit, predict, predict_proba, explain</code>; regressors stub <code>predict_proba</code></td><td>Small ABCs/Protocols: <code>Predictor</code>, <code>ProbaPredictor</code>, <code>Explainer</code></td></tr>
    <tr><td><strong>D</strong>ependency inversion: depend on abstractions</td><td><code>self.db = PostgresClient()</code> inside <code>Trainer</code></td><td><code>Trainer(store: Storage)</code>, injected; tests pass a fake</td></tr>
  </table>
  <h3>O and L, run</h3>
  <div class="fx" data-lang="py"># O: add a rule = add a class; checkout() is closed for modification
class Discount:
    def apply(self, p): return p
class Festive(Discount):
    def apply(self, p): return p * 0.8
class Member(Discount):
    def apply(self, p): return p - 50
def checkout(price, d: Discount): return d.apply(price)
print([checkout(1000, d) for d in (Discount(), Festive(), Member())])

# L violated: caller expects area = new width * old height
class Rect:
    def __init__(self, w, h): self.w, self.h = w, h
    def set_w(self, w): self.w = w
    def area(self): return self.w * self.h
class Square(Rect):
    def __init__(self, s): super().__init__(s, s)
    def set_w(self, w): self.w = self.h = w
def stretch(r): r.set_w(10); return r.area()
print(stretch(Rect(2, 5)), stretch(Square(5)))   # expected 50 both times</div>
  <div class="fx" data-lang="text">[1000, 800.0, 950]
50 100</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Dependency inversion is a wall socket: the lamp depends on the socket standard, not on a specific power plant.</p></div>

  <h2 id="po-pat"><span class="num">10</span>Design Patterns</h2>
  <div class="cards">
    <div><b>Factory</b><p>Pick which class to build from input.</p><small>e.g. loader by file extension</small></div>
    <div><b>Strategy</b><p>Swap an algorithm at runtime.</p><small>e.g. metric, optimizer, scaler</small></div>
    <div><b>Singleton</b><p>Exactly one shared instance.</p><small>e.g. config, connection pool</small></div>
    <div><b>Observer</b><p>Notify subscribers when something happens.</p><small>e.g. Keras/Lightning callbacks</small></div>
  </div>
  <div class="fx" data-lang="py"># Factory
class CSVLoader:
    def load(self, p): return f"csv rows from {p}"
class ParquetLoader:
    def load(self, p): return f"parquet columns from {p}"
LOADERS = {"csv": CSVLoader, "parquet": ParquetLoader}
def make_loader(path):
    ext = path.rsplit(".", 1)[-1]
    try: return LOADERS[ext]()
    except KeyError: raise ValueError(f"no loader for .{ext}")
print(make_loader("sales.parquet").load("sales.parquet"))

# Strategy: in Python a plain function is often the strategy object
def mse(y, p): return sum((a - b) ** 2 for a, b in zip(y, p)) / len(y)
def mae(y, p): return sum(abs(a - b) for a, b in zip(y, p)) / len(y)
class Evaluator:
    def __init__(self, metric): self.metric = metric
    def score(self, y, p): return round(self.metric(y, p), 3)
print(Evaluator(mse).score([3, 5, 2], [2, 5, 4]), Evaluator(mae).score([3, 5, 2], [2, 5, 4]))

# Singleton via __new__
class Config:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.settings = {}
        return cls._instance
a, b = Config(), Config()
a.settings["lr"] = 0.01
print(a is b, b.settings)

# Observer
class Trainer:
    def __init__(self): self._subs = []
    def subscribe(self, fn): self._subs.append(fn)
    def end_epoch(self, epoch, loss):
        for fn in self._subs: fn(epoch, loss)
t = Trainer()
t.subscribe(lambda e, l: print(f"  logger: epoch {e} loss {l}"))
t.subscribe(lambda e, l: l &lt; 0.3 and print(f"  early-stop: hit target at epoch {e}"))
for e, l in enumerate([0.9, 0.5, 0.25], 1): t.end_epoch(e, l)</div>
  <div class="fx" data-lang="text">parquet columns from sales.parquet
1.667 1.0
True {'lr': 0.01}
  logger: epoch 1 loss 0.9
  logger: epoch 2 loss 0.5
  logger: epoch 3 loss 0.25
  early-stop: hit target at epoch 3</div>
  <div class="callout trap"><span class="label">Trap</span><p>Singletons are global state in disguise: hard to test and reset. In Python a module is already a singleton; <code>config.py</code> with module-level values is usually enough.</p></div>

  <h2 id="po-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Encapsulation vs abstraction?</summary><div class="qa-body">Encapsulation hides <strong>data</strong>: state changes only through controlled methods/properties (<code>__balance</code> + <code>withdraw</code>). Abstraction hides <strong>complexity</strong>: callers see a small interface (<code>fit/predict</code>, ABC) and not the implementation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Instance vs class vs static method: when do you use each?</summary><div class="qa-body">Instance (<code>self</code>) for behaviour using object state. Classmethod (<code>cls</code>) for alternative constructors like <code>from_config</code>; it returns the right subclass. Staticmethod for a helper that needs neither, kept in the class for organisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must a child call <code>super().__init__()</code>?</summary><div class="qa-body">Overriding <code>__init__</code> replaces the parent's. Without the call, the attributes the parent sets never exist, and the first method using them raises <code>AttributeError</code>. With multiple inheritance it also keeps the cooperative MRO chain going.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is name mangling, and is it security?</summary><div class="qa-body"><code>self.__x</code> in class <code>Account</code> is stored as <code>_Account__x</code>. Purpose: stop subclasses accidentally overwriting the parent's attribute. Not security: <code>obj._Account__x</code> still works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output?<br><code>class A: x = []</code>; <code>a, b = A(), A()</code>; <code>a.x.append(1)</code>; <code>a.y = 2</code>; <code>print(b.x, hasattr(b, "y"))</code></summary><div class="qa-body"><code>[1] False</code>. <code>x</code> is one list on the class, shared by both. <code>a.y = 2</code> creates an instance attribute on <code>a</code> only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>__str__</code> vs <code>__repr__</code>?</summary><div class="qa-body"><code>__repr__</code>: unambiguous, for developers, ideally <code>eval</code>-able (<code>Vector(3, 4)</code>); used in the shell and inside containers. <code>__str__</code>: readable, for users; used by <code>print</code>. <code>print</code> falls back to <code>__repr__</code>, so define that one first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You defined <code>__eq__</code> and now <code>{obj}</code> raises TypeError. Why?</summary><div class="qa-body">Defining <code>__eq__</code> sets <code>__hash__ = None</code>, because equal objects must have equal hashes and the default identity hash would break that. Add <code>__hash__</code> over the same immutable fields, or use <code>@dataclass(frozen=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why return <code>NotImplemented</code> from <code>__add__</code> instead of raising?</summary><div class="qa-body">It tells Python "I don't know this type", so Python tries the reflected method on the other operand (<code>other.__radd__</code>). Only if both decline does it raise <code>TypeError</code>. Raising yourself blocks that fallback.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the MRO of <code>class D(B, C)</code> where B and C inherit A? What does <code>super()</code> in B call?</summary><div class="qa-body">D → B → C → A → object (C3 linearisation). For a D object, <code>super()</code> inside B calls <strong>C</strong>, the next class in D's MRO, not A. So A's method runs once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Composition vs inheritance: which do you prefer?</summary><div class="qa-body">Composition by default: has-a, loose coupling, parts swappable and testable (sklearn <code>Pipeline</code> holds steps). Inheritance only for a genuine is-a where polymorphism helps. Deep hierarchies suffer the fragile base class problem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ABC vs Protocol?</summary><div class="qa-body">ABC is nominal: classes must inherit it, and missing abstract methods block instantiation. Protocol is structural: any class with matching methods satisfies it for type checkers, no inheritance needed. Use Protocol to accept third-party objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give an LSP violation and its fix.</summary><div class="qa-body"><code>Square(Rect)</code>: <code>set_w(10)</code> also changes height, so code expecting area = 10 × old height gets 100 instead of 50. Fix: don't inherit; both implement a common <code>Shape</code> interface with <code>area()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which patterns hide inside ML libraries?</summary><div class="qa-body">Strategy: pass <code>scoring="f1"</code> or an optimizer object. Observer: Keras/Lightning callbacks. Factory: <code>AutoModel.from_pretrained(name)</code> picks the class. Template method: <code>nn.Module</code> calls your <code>forward</code>. Composite: <code>Pipeline</code>/<code>Sequential</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>@property</code>?</summary><div class="qa-body">To validate on assignment (temperature ≥ −273.15), to compute a derived value (<code>fahrenheit</code>), or to make an attribute read-only. Callers keep plain attribute syntax, so you can add it later without breaking them.</div></details>
</main>`
});
