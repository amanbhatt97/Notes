// notes/python/py_oop.js — OOP
Object.assign(TOPIC_CONTENT, {
  "py_oop": `<main>
  <h1>Object-Oriented Programming</h1>
  <p class="lead">Object-oriented programming (OOP) is a way of organising code: you keep a piece of data and the functions that work on it together, in a <em>class</em>. This note starts from "why would I want that?", builds up classes, methods and inheritance step by step, and then covers the design rules (the four pillars, SOLID, design patterns) that keep big codebases easy to change. Every sklearn estimator, PyTorch module and pipeline is built this way, and OOP comes up in almost every interview.</p>

  <h2 id="po-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Python OOP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Class &amp; object</div>
        <ul>
          <li><b>Class</b> — the blueprint; <b>object</b> — one thing built from it, with its own data</li>
          <li>💡 architect's drawing vs the houses built from it</li>
          <li><b>__init__</b> — fills a new object's attributes; Python calls it on <code>Dog("Bruno")</code></li>
          <li><b>self</b> — means "my"; <code>bruno.bark()</code> is really <code>Dog.bark(bruno)</code></li>
          <li><b>Instance attr</b> — per object (<code>obj.__dict__</code>); <b>class attr</b> — shared by all</li>
          <li><b>Lookup</b> — object → class → parents (MRO)</li>
          <li>⚠ A list as class attr (<code>tricks = []</code>) is shared by all objects; create it in __init__</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Method kinds</div>
        <ul>
          <li><b>Instance</b> — gets <code>self</code>; reads/changes the object's data</li>
          <li><b>@classmethod</b> — gets <code>cls</code>; other ways to build objects (<code>from_config</code>), works for subclasses</li>
          <li><b>@staticmethod</b> — gets nothing; a helper that belongs with the class</li>
          <li>⚠ Writing the class name inside a factory breaks subclasses; use <code>cls(...)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Four pillars</div>
        <ul>
          <li><b>Encapsulation</b> — hide DATA behind methods/properties; <code>_x</code> = "internal", <code>__x</code> = renamed</li>
          <li><b>Abstraction</b> — hide COMPLEXITY; show a small interface (ABC)</li>
          <li><b>Inheritance</b> — "is-a" reuse; always call <code>super().__init__()</code></li>
          <li><b>Polymorphism</b> — same call, different behaviour per type (dynamic dispatch, duck typing)</li>
          <li>⚠ Encapsulation ≠ abstraction: protect data vs simplify the interface</li>
          <li><b>Name mangling</b> — <code>__bal</code> → <code>_Account__bal</code>; stops subclass clashes, not a security lock</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dunder methods</div>
        <ul>
          <li><b>Dunder</b> = "double underscore" hooks Python calls for built-in syntax</li>
          <li><b>__repr__</b> for developers (ideally rebuilds the object); <b>__str__</b> for users; write __repr__ first</li>
          <li><b>Operators</b> — <code>__add__ __mul__ __rmul__ __eq__ __lt__</code></li>
          <li><b>Containers</b> — <code>__len__ __getitem__ __contains__ __iter__</code></li>
          <li><b>__call__</b> — use an object like a function (PyTorch <code>model(x)</code>)</li>
          <li>Return <code>NotImplemented</code> for unknown types → Python tries the other side</li>
          <li>⚠ Defining <code>__eq__</code> sets <code>__hash__ = None</code> → can't go in a set unless you add __hash__</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Properties &amp; dataclasses</div>
        <ul>
          <li><b>@property</b> — looks like an attribute, runs a method (validate, compute)</li>
          <li>No setter → read-only attribute</li>
          <li><b>@dataclass</b> — writes <code>__init__ __repr__ __eq__</code> for you; <code>order=True</code>, <code>frozen=True</code></li>
          <li>⚠ List default → <code>field(default_factory=list)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interfaces</div>
        <ul>
          <li><b>ABC + @abstractmethod</b> — must inherit; can't create an object until all methods are written</li>
          <li><b>Protocol</b> — any class with the right methods fits, no inheritance (typed duck typing)</li>
          <li><code>@runtime_checkable</code> — allows isinstance (checks method names only)</li>
          <li>💡 ABC = a degree from a named college; Protocol = "can you drive? then you're a driver"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Composition &amp; MRO</div>
        <ul>
          <li><b>Inheritance</b> = is-a; <b>composition</b> = has-a (a Car has an Engine)</li>
          <li>Prefer composition: loose links, swap parts at runtime, no fragile parent</li>
          <li><b>MRO</b> — order Python searches for a method (C3): child first, bases left→right, each once</li>
          <li>Diamond <code>D(B, C)</code> → D, B, C, A, object; check <code>D.__mro__</code></li>
          <li><b>super()</b> = next class in the MRO, not "my parent" (this is how mixins work)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SOLID &amp; patterns</div>
        <ul>
          <li><b>S</b> one reason to change · <b>O</b> add new code, don't edit old · <b>L</b> child usable wherever parent is</li>
          <li><b>I</b> small interfaces · <b>D</b> depend on abstractions, pass dependencies in</li>
          <li>⚠ LSP classic: Square(Rect) breaks <code>set_w</code> expectations</li>
          <li><b>Factory</b> — pick the class from input (<code>make_loader("x.csv")</code>)</li>
          <li><b>Strategy</b> — swap the algorithm (metric, optimizer)</li>
          <li><b>Singleton</b> — only one object (config); in Python a module is usually enough</li>
          <li><b>Observer</b> — subscribers get told when events happen (training callbacks)</li>
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

  <div class="callout intu"><span class="label">Why this note</span><p>Small scripts get by with lists, dicts and functions. Real projects have hundreds of "things" (students, orders, models) that each carry data and need the same operations. Classes give each thing a shape. You will meet them every day: <code>LogisticRegression()</code> is an object built from a class, <code>model.fit()</code> is a method, and <code>nn.Module</code> is a parent class you inherit from. Interviews ask "what is <code>self</code>?", "encapsulation vs abstraction?", "what is the MRO?". Each section below uses only what came before it.</p></div>

  <h2 id="po-class"><span class="num">01</span>Classes &amp; Objects</h2>
  <p>Say you store students as dicts and keep an <code>average</code> function somewhere else. It works. But nothing ties the function to the data: anyone can pass the wrong dict, and with 20 such functions you lose track of which works on what.</p>
  <div class="fx" data-lang="py"># without a class: data in a dict, function kept separately
s1 = {"name": "Asha", "marks": [88, 92]}
s2 = {"name": "Ben", "marks": [70, 65]}
def average(student):
    return sum(student["marks"]) / len(student["marks"])
print(average(s1), average(s2))

# with a class: data and the function live together
class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks
    def average(self):
        return sum(self.marks) / len(self.marks)
a = Student("Asha", [88, 92])
print(a.name, a.average())</div>
  <div class="fx" data-lang="text">90.0 67.5
Asha 90.0</div>
  <p>A <strong>class</strong> is a blueprint: it says what data each student has and what each student can do. An <strong>object</strong> (also called an <strong>instance</strong>) is one student built from that blueprint. <code>Student("Asha", [88, 92])</code> builds one. The data on an object (<code>a.name</code>) is called an <strong>attribute</strong>. A function inside a class is called a <strong>method</strong>, and you call it with a dot: <code>a.average()</code>.</p>
  <p>Two things look strange at first. <code>__init__</code> is the method Python runs automatically when you build an object; its job is to fill in the attributes. <code>self</code> is the object being worked on. When you write <code>a.average()</code>, Python secretly passes <code>a</code> as <code>self</code>. Read <code>self.name</code> as "my name".</p>
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
  </svg><figcaption>One class, many objects. Each object keeps its own data. Methods and class attributes live once, on the class.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>Class = the architect's drawing. Object = a house built from it. Painting one house changes neither the drawing nor the other houses.</p></div>
  <p>One more idea in the picture: <code>species</code> is written on the class itself, not inside <code>__init__</code>. That makes it a <strong>class attribute</strong>, one value shared by every dog. <code>name</code> and <code>age</code> are <strong>instance attributes</strong>, one copy per dog.</p>
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
    <li><code>__init__</code> only fills attributes. The object already exists (made by <code>__new__</code>).</li>
    <li><code>self</code> is Python's "my": <code>bruno.bark()</code> becomes <code>Dog.bark(bruno)</code>.</li>
    <li>Attribute lookup goes <strong>object's __dict__ → class → parent classes</strong>. That is why <code>bruno.species</code> works.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>A list (or dict) set as a class attribute is shared by every object.</p></div>
  <div class="fx" data-lang="py">class Bad:
    tricks = []                     # one list for ALL dogs
    def add(self, t): self.tricks.append(t)
a, b = Bad(), Bad()
a.add("sit")
print(b.tricks)                     # b never learned "sit"!</div>
  <div class="fx" data-lang="text">['sit']</div>
  <p>Fix: create it per object in <code>__init__</code> (<code>self.tricks = []</code>).</p>

  <h2 id="po-methods"><span class="num">02</span>Instance, Class, Static Methods</h2>
  <p>Every method so far received <code>self</code>, the object. Two more kinds exist. A <strong>class method</strong> receives the class itself (called <code>cls</code>) instead of an object; its usual job is to build objects in a different way, for example from a config dict. A <strong>static method</strong> receives nothing special; it is a plain helper function that lives inside the class because it belongs there. You mark them with <code>@classmethod</code> and <code>@staticmethod</code> above the <code>def</code>. (A line starting with <code>@</code> is a <strong>decorator</strong>, a tag that changes how the function below it behaves. The Advanced note explains how they work inside.)</p>
  <table class="tbl">
    <tr><th>Kind</th><th>First arg</th><th>Can touch</th><th>Use for</th></tr>
    <tr><td>Instance</td><td><code>self</code></td><td>object + class data</td><td>Normal behaviour (<code>fit</code>, <code>predict</code>)</td></tr>
    <tr><td><code>@classmethod</code></td><td><code>cls</code></td><td>class data</td><td>Other ways to build objects, registries</td></tr>
    <tr><td><code>@staticmethod</code></td><td>none</td><td>only its args</td><td>Helper that belongs with the class</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school. Instance method = a student checking <em>their own</em> marks. Class method = the office making a new admission from a form. Static method = the calculator kept in the office — it belongs there but knows nothing about any student.</p></div>
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
  <p>Walk through it: <code>Bert</code> is a child of <code>Model</code> (inheritance, explained fully in section 03). <code>Bert.from_config(...)</code> returned a <strong>Bert</strong>, not a Model, because <code>cls</code> is whichever class you called it on. If the method had said <code>Model(...)</code> instead of <code>cls(...)</code>, every subclass would get the wrong type back. Real examples: <code>pd.DataFrame.from_dict</code>, <code>datetime.fromisoformat</code>.</p>

  <h2 id="po-pillars"><span class="num">03</span>The Four Pillars</h2>
  <p>Classes alone do not make code good. The "four pillars" are four habits that make classes worth having. Each one solves a specific pain. Read the table once now; each pillar gets its own example below.</p>
  <table class="tbl">
    <tr><th>Pillar</th><th>What</th><th>Why</th><th>Python tool</th></tr>
    <tr><td><strong>Encapsulation</strong></td><td>Hide DATA; change it only through methods</td><td>Keeps data valid (no negative balance)</td><td><code>_x</code>, <code>__x</code>, <code>@property</code></td></tr>
    <tr><td><strong>Abstraction</strong></td><td>Hide COMPLEXITY behind a small interface</td><td>Caller knows <em>what</em>, not <em>how</em></td><td>ABC, <code>@abstractmethod</code></td></tr>
    <tr><td><strong>Inheritance</strong></td><td>Child reuses parent code (is-a)</td><td>Write shared logic once</td><td><code>class Child(Parent)</code>, <code>super()</code></td></tr>
    <tr><td><strong>Polymorphism</strong></td><td>Same call, behaviour depends on type</td><td>No <code>if isinstance</code> chains</td><td>Overriding, duck typing</td></tr>
  </table>
  <p>These are design rules. Python does not force them on you.</p>

  <h3>Encapsulation</h3>
  <p>A bank account has a balance. If any code anywhere can write <code>acc.balance = -5000</code>, the rule "no overdraft" is impossible to keep. <strong>Encapsulation</strong> means: keep the data inside, and let it change only through methods that check the rules.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>An ATM: you deposit and withdraw through buttons that follow rules. You cannot open the box and grab cash.</p></div>
  <p>Python has two conventions. One underscore <code>_x</code> is a polite sign: "internal, please don't touch". Two underscores <code>__x</code> make Python rename the attribute to <code>_ClassName__x</code>, so outside code does not find it by accident. <code>@property</code> (section 05) lets a method look like a read-only attribute.</p>
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
    <li><code>_x</code>: a convention meaning "internal, don't touch". <code>__x</code>: renamed to <code>_Class__x</code>, so subclasses cannot clash with it.</li>
    <li>Python has no true private. Renaming stops accidents, not determined access.</li>
  </ul>

  <h3>Inheritance &amp; polymorphism</h3>
  <p>A Dog and a Cat both have a name and both can speak, but they speak differently. Writing two full classes repeats the shared parts. <strong>Inheritance</strong> lets a child class start as a copy of a parent and change only what differs. You write <code>class Dog(Animal)</code>; the brackets name the parent.</p>
  <div class="fx" data-lang="py">class Animal:
    def __init__(self, name): self.name = name
    def speak(self): return "..."
class Dog(Animal):                      # Dog gets __init__ for free
    def speak(self): return "Woof"      # and changes one method
d = Dog("Bruno")
print(d.name, d.speak(), isinstance(d, Animal))</div>
  <div class="fx" data-lang="text">Bruno Woof True</div>
  <p>Dog did not write <code>__init__</code>, yet <code>d.name</code> works: Python looked in Dog, did not find <code>__init__</code>, and used Animal's. Writing a new <code>speak</code> in the child is called <strong>overriding</strong>. A Dog <em>is an</em> Animal, so <code>isinstance</code> says True.</p>
  <p><strong>Polymorphism</strong> ("many forms") is what inheritance makes possible: one call like <code>p.badge()</code> behaves differently depending on which type of object <code>p</code> is. One loop can handle doctors, nurses and plain staff without a single <code>if</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>"Show your ID" at a hospital gate. A doctor, a nurse and a visitor all respond to the same request, each with their own card.</p></div>
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
  <p>Python picks <code>role()</code> from the object's real type at runtime. This is <strong>dynamic dispatch</strong>. <strong>Duck typing</strong> goes further: any object with a <code>badge()</code> method works in that loop, related or not.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Override <code>__init__</code> but forget <code>super().__init__()</code> → the parent's attributes never get set: <code>AttributeError: 'Broken' object has no attribute 'name'</code>.</p></div>

  <h3>Abstraction</h3>
  <p><strong>Abstraction</strong> means showing the caller a small, simple set of methods and hiding everything else. The caller learns <em>what</em> the object does, not <em>how</em>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Google Maps: you type a place and press Go. Routing, traffic data and servers stay hidden.</p></div>
  <p>In code: <code>model.fit(X, y)</code> hides the optimiser. ABCs (section 06) enforce it.</p>
  <div class="callout trap"><span class="label">Trap</span><p>The most-asked mix-up. <strong>Encapsulation</strong> protects data (who may change it). <strong>Abstraction</strong> simplifies the interface (what the caller needs to know).</p></div>

  <h2 id="po-dunder"><span class="num">04</span>Dunder Methods &amp; Operator Overloading</h2>
  <p>Print an object of your own class and you get something ugly: the class name and a memory address. Python does not know how to show it. Add a method called <code>__str__</code>, and <code>print</code> uses it.</p>
  <div class="fx" data-lang="py">class Student:
    pass
s = Student()
print(s)                 # no __str__: Python shows the type and an address
class Student2:
    def __init__(self, name): self.name = name
    def __str__(self): return f"Student {self.name}"
print(Student2("Asha"))</div>
  <div class="fx" data-lang="text">&lt;__main__.Student object at 0x7f…&gt;
Student Asha</div>
  <p>This is the general pattern. Methods whose names start and end with two underscores are called <strong>dunder</strong> ("double underscore") methods. You have already met <code>__init__</code>. Each one is a hook that Python calls behind a piece of built-in syntax: <code>print(v)</code> calls <code>v.__str__()</code>, <code>v + w</code> calls <code>v.__add__(w)</code>, <code>len(v)</code> calls <code>v.__len__()</code>. Write the hook, and the syntax works on your objects. Giving <code>+</code> or <code>==</code> a meaning for your class is called <strong>operator overloading</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A standard plug shape. Any appliance with the right plug fits the socket. Any class with <code>__len__</code> fits <code>len()</code>.</p></div>
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
  <p>What each line of output shows. <code>v + w</code> ran <code>__add__</code>; <code>3 * v</code> ran <code>__rmul__</code> (the "r" is for "reflected": the number is on the left, so Python asks the Vector on the right). <code>abs(v)</code> ran <code>__abs__</code>. <code>==</code> compares the coordinates because of <code>__eq__</code>; <code>is</code> is still False because they are two objects. <code>{v, Vector(3, 4)}</code> has one item because equal vectors hash the same. <code>v + 5</code> failed cleanly: <code>__add__</code> returned <code>NotImplemented</code>, Python tried <code>int.__radd__</code>, which also said no, so it raised <code>TypeError</code>.</p>
  <ul>
    <li><code>print</code> uses <code>__str__</code>, and falls back to <code>__repr__</code>. Write <code>__repr__</code> first.</li>
    <li>Without <code>__eq__</code>, <code>==</code> checks identity: <code>Plain() == Plain()</code> → <code>False</code>.</li>
    <li><code>__call__</code> is why PyTorch's <code>model(x)</code> runs <code>forward</code> plus hooks.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Defining <code>__eq__</code> quietly sets <code>__hash__ = None</code>. Putting the object in a set then fails: <code>TypeError: unhashable type: 'NoHash'</code>. Add <code>__hash__</code> over the same unchanging fields.</p></div>

  <h2 id="po-prop"><span class="num">05</span>Properties &amp; Dataclasses</h2>
  <h3>@property</h3>
  <p>You stored temperature as a plain attribute, <code>t.celsius</code>, and code all over the project reads and writes it. Now you need to reject values below absolute zero. Changing every <code>t.celsius = x</code> into <code>t.set_celsius(x)</code> would touch the whole project. A <strong>property</strong> solves this: from outside it still looks like an attribute, but inside, a method runs. The <strong>getter</strong> (under <code>@property</code>) runs on read; the <strong>setter</strong> (under <code>@celsius.setter</code>) runs on write and can check the value. A property with no setter is read-only.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank cashier window. You just "hand over money", but the cashier checks the note before it goes in.</p></div>
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
  <p>Bonus: start with a plain attribute, and switch to a property later without changing any caller.</p>

  <h3>@dataclass</h3>
  <p>Many classes exist only to hold a few fields: a point, a config, an experiment run. Writing <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> for each one is the same boring code every time. A <strong>dataclass</strong> writes them for you. You list the fields with their types, and put <code>@dataclass</code> above the class.</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass
class PointPlain:                      # by hand
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"PointPlain(x={self.x}, y={self.y})"
    def __eq__(self, o):
        return (self.x, self.y) == (o.x, o.y)

@dataclass
class Point:                           # generated for you
    x: int
    y: int

print(PointPlain(1, 2), Point(1, 2))
print(Point(1, 2) == Point(1, 2))</div>
  <div class="fx" data-lang="text">PointPlain(x=1, y=2) Point(x=1, y=2)
True</div>
  <p>Eight lines became three, with the same behaviour. Two options add more: <code>order=True</code> also writes <code>&lt;</code> and friends, so objects can be sorted; <code>frozen=True</code> makes objects unchangeable (and therefore hashable).</p>
  <div class="flow"><span>Declare typed fields</span><span>@dataclass</span><span>__init__, __repr__, __eq__ generated</span><span>+ order / frozen on request</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pre-printed form. You only decide the boxes (name, roll no, marks); the printing press makes the form.</p></div>
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
    <li><code>order=True</code> compares fields as a tuple (here only <code>score</code>, since the others have <code>compare=False</code>).</li>
    <li><code>frozen=True</code>: cannot change and is hashable. Good for configs and dict keys.</li>
    <li>Need type checking at runtime (APIs, configs)? Use <strong>pydantic</strong>; dataclasses do not check types.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p><code>tags: list = []</code> is rejected: <code>ValueError: mutable default &lt;class 'list'&gt; for field tags is not allowed: use default_factory</code>.</p></div>

  <h2 id="po-abc"><span class="num">06</span>ABCs &amp; Protocols</h2>
  <p>Your team writes ten model classes. Each must have <code>fit</code> and <code>predict</code>, because the training script calls both. Someone forgets <code>predict</code> in one class. Nothing complains until the script reaches that line in production at 2 AM. An <strong>interface</strong> is a written contract: "a model must have <code>fit</code> and <code>predict</code>". Python offers two ways to write one.</p>
  <p>An <strong>ABC</strong> (abstract base class) is a parent class with methods marked <code>@abstractmethod</code>, which means "children must write this". Python refuses to build an object of any class that still has an unwritten abstract method, so the mistake shows up at once. A <strong>Protocol</strong> does not need inheritance at all: any class that happens to have the right methods counts.</p>
  <div class="cards">
    <div><b>ABC</b><p>You must inherit it. Missing abstract methods → cannot create the object.</p><small>Use: your own class family, shared helper methods. 💡 a degree from a named college</small></div>
    <div><b>Protocol</b><p>Anything with matching methods fits. Checked by mypy, no inheritance.</p><small>Use: accepting third-party objects. 💡 "can you drive? then you're a driver"</small></div>
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
  <p>The error comes when the object is built, not when <code>predict</code> is first called in production. The <code>...</code> in the abstract methods is just a placeholder body. <code>fit_predict</code> is a normal method with real code; every child gets it for free, and it works because the contract guarantees <code>fit</code> and <code>predict</code> exist.</p>
  <div class="fx" data-lang="py">from typing import Protocol, runtime_checkable

@runtime_checkable
class Predictor(Protocol):
    def predict(self, X): ...

class SklearnLike:                         # does NOT inherit Predictor
    def predict(self, X): return [0] * len(X)

def evaluate(m: Predictor, X): return m.predict(X)
print(evaluate(SklearnLike(), [1, 2]), isinstance(SklearnLike(), Predictor), isinstance(3, Predictor))</div>
  <div class="fx" data-lang="text">[0, 0] True False</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>isinstance</code> on a runtime-checkable Protocol only checks that method <em>names</em> exist — not arguments or return types.</p></div>

  <h2 id="po-comp"><span class="num">07</span>Composition vs Inheritance</h2>
  <p>You want a Car that can run on a petrol engine or an electric motor. One tempting way is inheritance: <code>class Car(Engine)</code>. But a car is not an engine; it <em>has</em> one. And a customer might swap the engine later. <strong>Composition</strong> means building an object out of other objects it holds ("has-a"): the Car keeps an engine object inside <code>self.engine</code> and hands work to it. <strong>Inheritance</strong> means becoming a special kind of another class ("is-a").</p>
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
  </svg><figcaption>Inheritance fixes the link when the class is written. Composition plugs in a part you can replace.</figcaption></figure>
  <table class="tbl">
    <tr><th>Ask</th><th>Answer</th><th>Use</th></tr>
    <tr><td>Is a Doctor a Staff member?</td><td>yes</td><td>Inheritance</td></tr>
    <tr><td>Is a Car an Engine?</td><td>no, it <em>has</em> one</td><td>Composition</td></tr>
    <tr><td>Does a Pipeline have steps?</td><td>yes</td><td>Composition (sklearn <code>Pipeline</code>)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A mobile phone with a SIM slot. Change from Jio to Airtel by swapping the SIM — you do not buy a new phone.</p></div>
  <div class="fx" data-lang="py">class Engine:
    def start(self): return "petrol engine on"
class Electric:
    def start(self): return "electric motor on"

class Car:
    def __init__(self, engine): self.engine = engine   # has-a, injected
    def start(self): return "car: " + self.engine.start()   # delegate

print(Car(Engine()).start(), "|", Car(Electric()).start())</div>
  <div class="fx" data-lang="text">car: petrol engine on | car: electric motor on</div>
  <p><strong>Prefer composition.</strong> Parts can be tested and swapped on their own. You also avoid the <em>fragile base class</em> problem: a change in the parent quietly breaks every child. Use inheritance for a true is-a where you want polymorphism.</p>

  <h2 id="po-mro"><span class="num">08</span>MRO &amp; super()</h2>
  <p>Python lets a class have more than one parent: <code>class D(B, C)</code>. Now a question appears. If both B and C have a method <code>who</code>, which one does <code>D().who()</code> run? And if B and C share the same grandparent A, should A's code run once or twice?</p>
  <p>The <strong>MRO</strong> (Method Resolution Order) answers this. It is a fixed list of classes that Python searches, in order, to find a method. The first class in the list that has the method wins. Python builds the list with an algorithm called <strong>C3 linearisation</strong>; the rules you need are in the picture: child before parents, parents left to right, each class only once.</p>
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
  </svg><figcaption>The diamond: B and C share parent A. C3 visits C before A, so A's method runs only once.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A relay race with a fixed running order. <code>super()</code> means "pass the baton to the next runner in the order", not "to my own parent".</p></div>
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
  <div class="callout intu"><span class="label">Key insight</span><p><code>super()</code> means "next class in <em>this object's</em> MRO", not "my parent". Inside B, <code>super()</code> called <strong>C</strong>, a class B never mentions. That is what lets mixins work together.</p></div>
  <p>A <strong>mixin</strong> is a small class that adds one feature (like logging) to any class it is mixed into.</p>
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
  <div class="callout trap"><span class="label">Trap</span><p>Bases in an impossible order fail when the class is created: <code>class Z(X, Y)</code> where <code>Y(X)</code> → <code>TypeError: Cannot create a consistent method resolution order (MRO) for bases X, Y</code>. Put the subclass first.</p></div>

  <h2 id="po-solid"><span class="num">09</span>SOLID</h2>
  <p>A class that works today can still be a problem tomorrow: every new feature means editing it, and every edit breaks something. <strong>SOLID</strong> is a set of five rules, one per letter, for keeping classes easy to change. Each row of the table shows a problem and the fix. The two most asked in interviews, O and L, are run as code below.</p>
  <table class="tbl">
    <tr><th>Principle</th><th>Before (problem)</th><th>After (fix)</th></tr>
    <tr><td><strong>S</strong>ingle responsibility: one reason to change</td><td><code>Report</code> computes metrics, renders HTML <em>and</em> emails it</td><td><code>MetricsCalc</code>, <code>HtmlRenderer</code>, <code>Mailer</code>; Report uses all three</td></tr>
    <tr><td><strong>O</strong>pen/closed: add new code, don't edit old code</td><td><code>if kind == "festive": ... elif kind == "member": ...</code> grows forever</td><td>One <code>Discount</code> subclass per rule; <code>checkout</code> never changes</td></tr>
    <tr><td><strong>L</strong>iskov substitution: a child works wherever the parent does</td><td><code>Square(Rect)</code> also changes height in <code>set_w</code></td><td>Don't inherit; both implement a <code>Shape.area()</code> interface</td></tr>
    <tr><td><strong>I</strong>nterface segregation: no forced unused methods</td><td><code>Model</code> ABC demands <code>fit, predict, predict_proba, explain</code>; regressors fake <code>predict_proba</code></td><td>Small ABCs/Protocols: <code>Predictor</code>, <code>ProbaPredictor</code>, <code>Explainer</code></td></tr>
    <tr><td><strong>D</strong>ependency inversion: depend on abstractions</td><td><code>self.db = PostgresClient()</code> inside <code>Trainer</code></td><td><code>Trainer(store: Storage)</code>, passed in; tests pass a fake</td></tr>
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
  <p>Open/closed in action: a new discount rule is a new class, and <code>checkout</code> is never edited. Liskov broken: <code>stretch</code> expects "set the width, keep the height", which is true for any Rect. A Square cannot keep that promise (its sides must stay equal), so it gives 100 where the caller expected 50. The child is not a safe substitute for the parent.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Dependency inversion is a wall socket. The lamp depends on the socket standard, not on a particular power plant.</p></div>

  <h2 id="po-pat"><span class="num">10</span>Design Patterns</h2>
  <p>Some design problems come up in every project: "pick the right class from a file name", "let the user choose the algorithm", "tell several parts when something happens". A <strong>design pattern</strong> is a known, named solution to one of these. Names let a team say "use a strategy here" instead of explaining from scratch. Four you will meet in ML code:</p>
  <div class="cards">
    <div><b>Factory</b><p>Pick which class to build from input.</p><small>e.g. loader by file extension. 💡 a ticket counter: say "sleeper" or "AC", get the right ticket</small></div>
    <div><b>Strategy</b><p>Swap an algorithm at runtime.</p><small>e.g. metric, optimizer. 💡 pay by UPI, card or cash — same checkout</small></div>
    <div><b>Singleton</b><p>Exactly one shared object.</p><small>e.g. config, connection pool. 💡 one principal per school</small></div>
    <div><b>Observer</b><p>Tell all subscribers when something happens.</p><small>e.g. Keras/Lightning callbacks. 💡 YouTube bell icon</small></div>
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
  <p>Reading the code: the <strong>factory</strong> is a dict from extension to class, so adding a loader is one line. The <strong>strategy</strong> is just a function passed in; <code>Evaluator</code> does not care which metric it holds. The <strong>singleton</strong> uses <code>__new__</code> (the method that creates the object before <code>__init__</code>) to hand back the same object every time, which is why <code>a is b</code>. The <strong>observer</strong> keeps a list of functions and calls each one at the end of every epoch; that is exactly how training callbacks work.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A singleton is global data in disguise: hard to test and reset. In Python a module is already a singleton. A <code>config.py</code> with module-level values is usually enough.</p></div>

  <h2 id="po-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Encapsulation vs abstraction?</summary><div class="qa-body">Encapsulation hides <strong>data</strong>: it changes only through controlled methods/properties (<code>__balance</code> + <code>withdraw</code>). Abstraction hides <strong>complexity</strong>: callers see a small interface (<code>fit/predict</code>, ABC), not how it works inside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Instance vs class vs static method: when do you use each?</summary><div class="qa-body">Instance (<code>self</code>) for behaviour that uses the object's data. Classmethod (<code>cls</code>) for other constructors like <code>from_config</code>; it returns the right subclass. Staticmethod for a helper that needs neither, kept in the class for tidiness.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must a child call <code>super().__init__()</code>?</summary><div class="qa-body">Overriding <code>__init__</code> replaces the parent's. Without the call, the attributes the parent sets never exist, and the first method using them raises <code>AttributeError</code>. With multiple inheritance it also keeps the MRO chain going.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is name mangling, and is it security?</summary><div class="qa-body"><code>self.__x</code> in class <code>Account</code> is stored as <code>_Account__x</code>. Purpose: stop subclasses from overwriting the parent's attribute by accident. Not security: <code>obj._Account__x</code> still works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output?<br><code>class A: x = []</code>; <code>a, b = A(), A()</code>; <code>a.x.append(1)</code>; <code>a.y = 2</code>; <code>print(b.x, hasattr(b, "y"))</code></summary><div class="qa-body"><code>[1] False</code>. <code>x</code> is one list on the class, shared by both. <code>a.y = 2</code> creates an attribute on <code>a</code> only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>__str__</code> vs <code>__repr__</code>?</summary><div class="qa-body"><code>__repr__</code>: exact, for developers, ideally able to rebuild the object (<code>Vector(3, 4)</code>); used in the shell and inside lists. <code>__str__</code>: friendly, for users; used by <code>print</code>. <code>print</code> falls back to <code>__repr__</code>, so write that one first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You defined <code>__eq__</code> and now <code>{obj}</code> raises TypeError. Why?</summary><div class="qa-body">Defining <code>__eq__</code> sets <code>__hash__ = None</code>. Equal objects must have equal hashes, and the default identity hash would break that rule. Add <code>__hash__</code> over the same unchanging fields, or use <code>@dataclass(frozen=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why return <code>NotImplemented</code> from <code>__add__</code> instead of raising?</summary><div class="qa-body">It tells Python "I don't know this type", so Python tries the other operand's reflected method (<code>other.__radd__</code>). Only if both say no does it raise <code>TypeError</code>. Raising yourself blocks that fallback.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the MRO of <code>class D(B, C)</code> where B and C inherit A? What does <code>super()</code> in B call?</summary><div class="qa-body">D → B → C → A → object (C3 linearisation). For a D object, <code>super()</code> inside B calls <strong>C</strong>, the next class in D's MRO, not A. So A's method runs once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Composition vs inheritance: which do you prefer?</summary><div class="qa-body">Composition by default: has-a, loose links, parts you can swap and test (sklearn <code>Pipeline</code> holds steps). Inheritance only for a real is-a where polymorphism helps. Deep class trees suffer from the fragile base class problem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ABC vs Protocol?</summary><div class="qa-body">ABC: classes must inherit it, and missing abstract methods block object creation. Protocol: any class with matching methods satisfies it for type checkers; no inheritance needed. Use Protocol to accept third-party objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give an LSP violation and its fix.</summary><div class="qa-body"><code>Square(Rect)</code>: <code>set_w(10)</code> also changes height, so code expecting area = 10 × old height gets 100 instead of 50. Fix: don't inherit; both implement a common <code>Shape</code> interface with <code>area()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which patterns hide inside ML libraries?</summary><div class="qa-body">Strategy: pass <code>scoring="f1"</code> or an optimizer object. Observer: Keras/Lightning callbacks. Factory: <code>AutoModel.from_pretrained(name)</code> picks the class. Template method: <code>nn.Module</code> calls your <code>forward</code>. Composite: <code>Pipeline</code>/<code>Sequential</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>@property</code>?</summary><div class="qa-body">To check a value on assignment (temperature ≥ −273.15), to compute a derived value (<code>fahrenheit</code>), or to make an attribute read-only. Callers keep plain attribute syntax, so you can add it later without breaking them.</div></details>
</main>`
});
