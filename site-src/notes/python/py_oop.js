// notes/python/py_oop.js — OOP Concepts in Python
Object.assign(TOPIC_CONTENT, {
  "py_oop": `<main>
<h1>OOP Concepts in Python</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>OOP Concepts in Python</span></div>
  <p class="lead">Object-oriented programming (OOP) is a way of organising code around <strong>objects</strong>: things that hold their own data and know how to work with it, the way a bank account holds a balance and knows how to accept a deposit. Below, the idea is built from zero: first the mess OOP was invented to clean up, then explains classes and objects with an everyday analogy, then the four ideas (the "four pillars") that OOP is built on, each with an analogy and code. Every example uses the same small banking program, so each new idea is added to code you have already seen. Code was run on Python 3.13.</p>

  <h2 id="oo-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">OOP in Python</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why OOP</div>
        <ul>
          <li>Loose variables and dicts: data and rules are separate</li>
          <li>Nothing stops code from skipping the rules</li>
          <li>OOP keeps data and its rules together in one object</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Class and object</div>
        <ul>
          <li><b>Class</b> = blueprint; <b>object</b> (instance) = a thing built from it</li>
          <li><b>Attribute</b> = data on an object (<code>acc.balance</code>)</li>
          <li><b>Method</b> = function inside a class (<code>acc.deposit(100)</code>)</li>
          <li><code>__init__</code> runs when an object is created; <code>self</code> = that object</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The four pillars</div>
        <ul>
          <li><b>Encapsulation</b>: protect the data; change it only through methods</li>
          <li><b>Abstraction</b>: show a simple interface, hide the details</li>
          <li><b>Inheritance</b>: build a new class from an existing one (is-a)</li>
          <li><b>Polymorphism</b>: same method call, different behaviour per class</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python specifics</div>
        <ul>
          <li>No true private: <code>_x</code> by convention, <code>__x</code> is name-mangled</li>
          <li><code>@property</code> for read-only or validated attributes</li>
          <li><code>abc.ABC</code> + <code>@abstractmethod</code> for contracts</li>
          <li>Duck typing: having the method is enough</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="oo-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why We Need OOP</span><span class="rm-sub">variables, then dicts, then what breaks</span></div></div>
      <div class="rm-item rm-done" data-target="oo-class"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Classes and Objects</span><span class="rm-sub">blueprint analogy, __init__, self, methods</span></div></div>
      <div class="rm-item rm-done" data-target="oo-pillars"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Four Pillars of OOP</span><span class="rm-sub">what they are, one car analogy</span></div></div>
      <div class="rm-item rm-done" data-target="oo-encap"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Pillar 1: Encapsulation</span><span class="rm-sub">protect data: _balance, @property</span></div></div>
      <div class="rm-item rm-done" data-target="oo-abstr"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Pillar 2: Abstraction</span><span class="rm-sub">simple interface, abstract classes</span></div></div>
      <div class="rm-item rm-done" data-target="oo-inherit"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pillar 3: Inheritance</span><span class="rm-sub">child classes, super(), overriding</span></div></div>
      <div class="rm-item rm-done" data-target="oo-poly"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pillar 4: Polymorphism</span><span class="rm-sub">same call, different behaviour</span></div></div>
      <div class="rm-item rm-done" data-target="oo-all"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">All Four Pillars in One Program</span><span class="rm-sub">each line labelled with its pillar</span></div></div>
      <div class="rm-item rm-done" data-target="oo-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">self, shared lists, overusing classes</span></div></div>
      <div class="rm-item rm-done" data-target="oo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, syntax, pillars table</span></div></div>
      <div class="rm-item rm-done" data-target="oo-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">pillars, self, private, ABC, MRO</span></div></div>
    </div>
  </div>

  <h2 id="oo-why"><span class="num">01</span>Why We Need OOP</h2>
  <p>Before learning what OOP is, it helps to feel the problem it solves. Suppose you are writing a tiny banking program. Each customer has a name and a balance, and there are two rules: you can deposit money, and you cannot withdraw more than you have.</p>
  <h3>Attempt 1: plain variables</h3>
  <p>The simplest thing is a pair of variables per customer.</p>
  <div class="fx" data-lang="py"># Two customers, plain variables
asha_name, asha_balance = "Asha", 1000
ben_name, ben_balance = "Ben", 500

asha_balance = asha_balance + 200      # Asha deposits 200
ben_balance = ben_balance - 100        # Ben withdraws 100
print(asha_name, asha_balance)
print(ben_name, ben_balance)</div>
  <div class="fx" data-lang="text">Asha 1200
Ben 400</div>
  <p>This works for two customers. For two thousand it is hopeless: you need two thousand pairs of variable names, and every line that changes a balance must remember to apply the rules by hand.</p>
  <h3>Attempt 2: a dict per customer, plus functions</h3>
  <p>Grouping each customer's data into a dict, and writing the rules once as functions, is a real improvement.</p>
  <div class="fx" data-lang="py"># Better: one dict per customer, and functions for the rules
def deposit(account, amount):
    account["balance"] += amount

def withdraw(account, amount):
    if amount &gt; account["balance"]:
        print("Not enough money")
        return
    account["balance"] -= amount

asha = {"name": "Asha", "balance": 1000}
ben = {"name": "Ben", "balance": 500}

deposit(asha, 200)
withdraw(ben, 800)                     # rule works: refused
print(asha)
print(ben)

# ...but nothing forces anyone to use the functions
ben["balance"] = ben["balance"] - 800  # skips the rule
asha["balanse"] = 0                    # typo: silently adds a new key
print(ben)
print(asha)</div>
  <div class="fx" data-lang="text">Not enough money
{'name': 'Asha', 'balance': 1200}
{'name': 'Ben', 'balance': 500}
{'name': 'Ben', 'balance': -300}
{'name': 'Asha', 'balance': 1200, 'balanse': 0}</div>
  <p>When everyone calls <code>withdraw()</code>, the rule protects Ben. But look at the last part: one line changes Ben's balance directly and he ends at <b>−300</b>, and a spelling mistake quietly adds a junk key <code>'balanse'</code>. Python raises no error in either case.</p>
  <p>The root cause is that <b>the data (the dict) and the rules (the functions) are separate things</b>. Nothing connects them. Any line anywhere in the program can change the dict without going through the rules, and in a large codebase nobody can tell which functions are meant to be used with which dicts.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Imagine a bank that keeps every customer's balance written on loose sheets of paper lying on a table, with the rulebook kept in another room. Anyone walking past can pick up a pen and change a number. A real bank keeps each customer's record locked in a file, and the only way to change it is through a teller who follows the rules. OOP does the same for code: it puts each record and its rules together into one unit, so changes go through the rules.</p></div>
  <p>That unit is an <strong>object</strong>, and the design that describes it is a <strong>class</strong>. Everything else in OOP grows from that one move: keep data and the code that works on it together.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Object-oriented programming</strong> is a style of programming where you model your program as <strong>objects</strong>, each combining <strong>data</strong> (called attributes) and <strong>behaviour</strong> (called methods), created from blueprints called <strong>classes</strong>.</p></div>

  <h2 id="oo-class"><span class="num">02</span>Classes and Objects</h2>
  <div class="callout anlg"><span class="label">Analogy: blueprint and houses</span><p>An architect draws one <b>blueprint</b> of a house. From it, a builder can build many <b>houses</b>. Every house has the same structure (rooms, doors, windows) because it came from the same blueprint, but each house has its own details: its own owner, its own paint colour. Painting one house blue does not change the others. And every house can do the same things: open the door, switch on the lights.</p></div>
  <p>In OOP the blueprint is the <strong>class</strong> and each house is an <strong>object</strong>. The table maps every OOP word you will meet onto the analogy, then onto the bank example.</p>
  <table class="tbl"><caption>OOP terms, mapped</caption>
    <tr><th>OOP term</th><th>House analogy</th><th>Bank example</th><th>Python</th></tr>
    <tr><td><b>Class</b></td><td>the blueprint</td><td>the design of "a bank account"</td><td><code>class BankAccount:</code></td></tr>
    <tr><td><b>Object</b> / <b>instance</b></td><td>one actual house</td><td>Asha's account, Ben's account</td><td><code>asha = BankAccount(...)</code></td></tr>
    <tr><td><b>Instantiation</b></td><td>building a house from the blueprint</td><td>opening a new account</td><td>calling the class: <code>BankAccount(...)</code></td></tr>
    <tr><td><b>Constructor</b></td><td>the builder's setup steps</td><td>filling in owner and opening balance</td><td><code>def __init__(self, ...):</code></td></tr>
    <tr><td><b>Attribute</b></td><td>a house's details: owner, colour</td><td>owner, balance</td><td><code>self.balance = ...</code></td></tr>
    <tr><td><b>Method</b></td><td>what a house can do: open door</td><td>deposit, withdraw</td><td><code>def deposit(self, amount):</code></td></tr>
    <tr><td><b>self</b></td><td>"this particular house"</td><td>"this particular account"</td><td>first parameter of every method</td></tr>
  </table>
  <p>"Object" and "instance" mean the same thing; "instance" is used when you want to say which class it came from ("Asha's account is an instance of <code>BankAccount</code>"). Now let us build the class one step at a time.</p>
  <h3>Step 1: an empty class, and objects made from it</h3>
  <div class="fx" data-lang="py">class BankAccount:        # the blueprint
    pass

a = BankAccount()         # build object 1
b = BankAccount()         # build object 2
print(type(a))
print(a is b)             # two separate objects</div>
  <div class="fx" data-lang="text">&lt;class '__main__.BankAccount'&gt;
False</div>
  <p><code>class BankAccount:</code> defines the blueprint. Calling it like a function, <code>BankAccount()</code>, builds a new object. <code>a</code> and <code>b</code> are two separate objects of the same class, just as two houses from one blueprint are two separate houses. By convention class names use <code>CapitalisedWords</code>.</p>
  <h3>Step 2: give every object its data with <code>__init__</code></h3>
  <p>An account is useless without an owner and a balance. We want every account to receive these the moment it is created. A method with the special name <code>__init__</code> does exactly that: Python calls it automatically every time an object is built, passing in the new, empty object plus whatever arguments you gave.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner          # attribute stored on this object
        self.balance = balance

asha = BankAccount("Asha", 1000)    # Python calls __init__(asha_object, "Asha", 1000)
ben = BankAccount("Ben", 500)
print(asha.owner, asha.balance)
print(ben.owner, ben.balance)</div>
  <div class="fx" data-lang="text">Asha 1000
Ben 500</div>
  <p>When you write <code>BankAccount("Asha", 1000)</code>, Python (1) creates a new empty object, (2) calls <code>__init__</code> with that object as <code>self</code>, <code>owner="Asha"</code>, <code>balance=1000</code>, and (3) hands the object back, which we name <code>asha</code>. Inside <code>__init__</code>, <code>self.owner = owner</code> means "store this value on <em>this</em> object". Asha's object and Ben's object each have their own <code>owner</code> and <code>balance</code>, like two houses each with their own paint.</p>
  <h3>Step 3: add behaviour with methods</h3>
  <p>A <strong>method</strong> is a function written inside a class. It describes something every object of that class can do. Here we move the rules from attempt 2 into the class, so the data and its rules finally live together.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount &gt; self.balance:
            print("Not enough money")
            return
        self.balance -= amount

    def show(self):
        print(f"{self.owner}: {self.balance}")

asha = BankAccount("Asha", 1000)
ben = BankAccount("Ben", 500)

asha.deposit(200)
ben.withdraw(800)
asha.show()
ben.show()

BankAccount.deposit(ben, 50)   # what ben.deposit(50) really does
ben.show()</div>
  <div class="fx" data-lang="text">Not enough money
Asha: 1200
Ben: 500
Ben: 550</div>
  <p><code>asha.deposit(200)</code> reads naturally: "Asha's account, deposit 200". The last two lines reveal what <code>self</code> really is. <code>ben.deposit(50)</code> is a shortcut: Python turns it into <code>BankAccount.deposit(ben, 50)</code>, passing the object before the dot as the first argument. That first argument is what we call <code>self</code>. So inside a method, <code>self.balance</code> always means "the balance of the object this method was called on". One method definition serves every account.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>class</strong> is a blueprint that defines what data its objects hold and what they can do. An <strong>object</strong> (or <strong>instance</strong>) is one thing built from a class, with its own copy of the data. An <strong>attribute</strong> is a piece of data stored on an object. A <strong>method</strong> is a function defined in a class; it receives the object it was called on as its first parameter, <code>self</code>. <code>__init__</code> is the method Python runs automatically to set up each new object.</p></div>
  <p>Notice what we have and have not fixed. The data and the rules now live together, which is the core of OOP. But nothing yet <em>prevents</em> someone from writing <code>ben.balance = -300</code> directly. Closing that gap is the first of the four pillars.</p>

  <h2 id="oo-pillars"><span class="num">03</span>The Four Pillars of OOP</h2>
  <p>A pillar holds a building up. The "four pillars of OOP" are simply the <b>four main ideas that make object-oriented design work</b>. Classes and objects are the bricks; the pillars are four ways of using those bricks well. Each pillar answers one practical question:</p>
  <table class="tbl"><caption>The four pillars at a glance</caption>
    <tr><th>Pillar</th><th>Question it answers</th><th>One-line meaning</th></tr>
    <tr><td><b>Encapsulation</b></td><td>How do I stop other code from breaking my object's data?</td><td>Keep the data inside the object; change it only through its methods.</td></tr>
    <tr><td><b>Abstraction</b></td><td>How do I make my object easy to use?</td><td>Show a few simple operations; hide how they work.</td></tr>
    <tr><td><b>Inheritance</b></td><td>How do I make a similar class without copying code?</td><td>Build a new class from an existing one and add or change only what differs.</td></tr>
    <tr><td><b>Polymorphism</b></td><td>How can one piece of code work with many kinds of objects?</td><td>Different classes provide the same method name, each in its own way.</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy: a car shows all four</span>
    <p><b>Encapsulation</b>: the engine is sealed under the bonnet. You cannot reach in and turn the fuel valve by hand; you change speed only through the accelerator pedal, which keeps the engine safe.</p>
    <p><b>Abstraction</b>: to drive, you only need to know the steering wheel, pedals and gear stick. You do not need to know how fuel injection or the gearbox works.</p>
    <p><b>Inheritance</b>: an electric car <em>is a</em> car. It gets wheels, steering and brakes from the general idea of "car" and adds one new thing, a battery.</p>
    <p><b>Polymorphism</b>: every car has an accelerator pedal. Press it in a petrol car and it burns fuel; press it in an electric car and it draws on the battery. Same pedal, same action from the driver, different behaviour inside.</p>
  </div>
  <p>Encapsulation and abstraction both "hide" something, which is why they get confused. Encapsulation hides the <em>data</em> to protect it; abstraction hides the <em>complexity</em> to simplify use. The next four sections take each pillar in turn, starting from the <code>BankAccount</code> we just built.</p>

  <h2 id="oo-encap"><span class="num">04</span>Pillar 1: Encapsulation</h2>
  <p><strong>Encapsulation</strong> means bundling data together with the methods that work on it, and making sure the data is changed <em>only</em> through those methods. The word comes from "capsule": a medicine capsule wraps the powder inside so you take it whole, never touching the powder directly.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>At a bank you cannot walk into the vault and change your balance. You go to the teller, who checks the rules (do you have enough money? is this really you?) and then updates the record. The vault is the data; the teller is the method.</p></div>
  <p>The <code>BankAccount</code> we just built has the rules, but it does not enforce them, because anyone can write to <code>balance</code> directly:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def withdraw(self, amount):
        if amount &gt; self.balance:
            print("Not enough money")
            return
        self.balance -= amount

ben = BankAccount("Ben", 500)
ben.withdraw(800)          # the rule refuses this...
ben.balance = -300         # ...but this line walks straight past it
print(ben.balance)</div>
  <div class="fx" data-lang="text">Not enough money
-300</div>
  <p>The fix has two parts. First, rename the attribute to <code>_balance</code>. A leading underscore is Python's signal for "internal: do not touch from outside, use the methods". Second, give read access through a <code>@property</code>: a method that is read like an attribute (<code>ben.balance</code>, no brackets). Because we define no way to set it, assigning to <code>balance</code> raises an error.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance      # _ means: internal, use the methods

    @property
    def balance(self):               # read access, like an attribute
        return self._balance

    def deposit(self, amount):
        if amount &lt;= 0:
            raise ValueError("Deposit must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("Not enough money")
        self._balance -= amount

ben = BankAccount("Ben", 500)
ben.deposit(100)
print(ben.balance)                   # reading is allowed

try:
    ben.balance = -300               # writing directly is refused
except AttributeError as e:
    print("AttributeError:", e)

try:
    ben.withdraw(5000)               # every change goes through the rules
except ValueError as e:
    print("ValueError:", e)
print(ben.balance)</div>
  <div class="fx" data-lang="text">600
AttributeError: property 'balance' of 'BankAccount' object has no setter
ValueError: Not enough money
600</div>
  <p>Now reading the balance works as before, writing to it directly is refused, and the only way to change the money is through <code>deposit</code> and <code>withdraw</code>, which always check the rules. The object protects its own data. The rule that must always be true (here "the balance never goes negative") is called an <strong>invariant</strong>, and encapsulation is how a class guarantees it.</p>
  <h3>How private is "private" in Python?</h3>
  <p>Languages like Java have a <code>private</code> keyword that the compiler enforces. Python deliberately does not. It relies on naming conventions:</p>
  <div class="fx" data-lang="py">class Demo:
    def __init__(self):
        self.public = 1
        self._internal = 2
        self.__secret = 3

d = Demo()
print(d.public, d._internal)
try:
    print(d.__secret)
except AttributeError as e:
    print("AttributeError:", e)
print(d._Demo__secret)          # name mangling: renamed, not locked</div>
  <div class="fx" data-lang="text">1 2
AttributeError: 'Demo' object has no attribute '__secret'
3</div>
  <table class="tbl"><caption>Python's naming conventions for access</caption>
    <tr><th>Name</th><th>Meaning</th><th>Enforced?</th></tr>
    <tr><td><code>balance</code></td><td>public: part of the class's interface</td><td>—</td></tr>
    <tr><td><code>_balance</code></td><td>internal: "please don't touch from outside"</td><td>No, just a convention every Python developer respects</td></tr>
    <tr><td><code>__balance</code></td><td>name-mangled: Python renames it to <code>_ClassName__balance</code></td><td>Partly: avoids accidental clashes in subclasses, but still reachable</td></tr>
  </table>
  <p>Python's view is "we are all consenting adults": the underscore tells others what is internal, and <code>@property</code> lets you add checks without changing how callers read the attribute. In practice <code>_name</code> plus properties is the standard way to encapsulate. (Details: <a class="xref" data-note="py_classes">Classes &amp; Objects</a>.)</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Encapsulation</strong>: keeping an object's data and the methods that operate on it together, and restricting direct access to the data so it can change only through those methods. In Python: <code>_name</code> for internal attributes, <code>@property</code> for controlled access.</p></div>

  <h2 id="oo-abstr"><span class="num">05</span>Pillar 2: Abstraction</h2>
  <p><strong>Abstraction</strong> means showing only what someone needs in order to use an object, and hiding how it works. The user of your class should think "transfer 300 to Ben", not "check the amount, subtract from one balance, add to another, write a log line".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>An ATM gives you a few buttons: Withdraw, Deposit, Check balance. Behind the Withdraw button the machine verifies your PIN, contacts the bank's servers, checks your balance, counts notes and updates records. You see one button. That is abstraction: a simple interface over a complicated process.</p></div>
  <h3>Abstraction with simple public methods</h3>
  <p>In practice abstraction mostly means designing a small set of public methods and keeping the helper steps internal (again marked with <code>_</code>). Here <code>transfer</code> is the "button"; <code>_check_amount</code> and <code>_log</code> are the machinery behind it.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    def _check_amount(self, amount):          # hidden helper
        if amount &lt;= 0:
            raise ValueError("Amount must be positive")

    def _log(self, text):                     # hidden helper
        print(f"[log] {self.owner}: {text}")

    def deposit(self, amount):
        self._check_amount(amount)
        self._balance += amount

    def withdraw(self, amount):
        self._check_amount(amount)
        if amount &gt; self._balance:
            raise ValueError("Not enough money")
        self._balance -= amount

    def transfer(self, other, amount):        # the simple button
        self.withdraw(amount)
        other.deposit(amount)
        self._log(f"sent {amount} to {other.owner}")

asha = BankAccount("Asha", 1000)
ben = BankAccount("Ben", 500)
asha.transfer(ben, 300)                       # caller sees one simple call
print(asha.balance, ben.balance)</div>
  <div class="fx" data-lang="text">[log] Asha: sent 300 to Ben
700 800</div>
  <p>The caller writes one line, <code>asha.transfer(ben, 300)</code>. If the bank later changes how logging or validation works, only the hidden helpers change; every piece of code that calls <code>transfer</code> keeps working.</p>
  <h3>Abstraction with abstract classes</h3>
  <p>Sometimes you want to describe <em>what</em> every kind of account must be able to do, without saying <em>how</em>, because each kind does it differently. An <strong>abstract class</strong> is a class that only describes; you cannot create objects from it directly. In Python you write one by inheriting from <code>ABC</code> and marking the required methods with <code>@abstractmethod</code>:</p>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Account(ABC):                 # an abstract idea: "some kind of account"
    @abstractmethod
    def monthly_charge(self):       # every account MUST say how this works
        ...

class SavingsAccount(Account):
    def monthly_charge(self):
        return 0

class Broken(Account):              # forgot to implement monthly_charge
    pass

print(SavingsAccount().monthly_charge())
for cls in (Account, Broken):
    try:
        cls()
    except TypeError as e:
        print("TypeError:", e)</div>
  <div class="fx" data-lang="text">0
TypeError: Can't instantiate abstract class Account without an implementation for abstract method 'monthly_charge'
TypeError: Can't instantiate abstract class Broken without an implementation for abstract method 'monthly_charge'</div>
  <p><code>Account</code> is a contract: "every account must have a <code>monthly_charge</code> method". Python refuses to create an <code>Account</code> itself, and refuses to create a subclass that forgot to fill in the method, so the mistake shows up immediately instead of at month end. (<code>SavingsAccount(Account)</code> uses inheritance, the next pillar; for now, read it as "SavingsAccount is a kind of Account".)</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Abstraction</strong>: exposing only the essential operations of an object and hiding the implementation details. In Python: a small public interface with <code>_</code>-prefixed helpers, and abstract base classes (<code>abc.ABC</code> + <code>@abstractmethod</code>) that define what subclasses must implement.</p></div>
  <div class="callout trap"><span class="label">Encapsulation vs abstraction</span><p>Encapsulation is about <b>protection</b>: who is allowed to change the data (the vault and the teller). Abstraction is about <b>simplicity</b>: how much the user needs to know (the ATM's few buttons). A class usually does both, but they answer different questions.</p></div>

  <h2 id="oo-inherit"><span class="num">06</span>Pillar 3: Inheritance</h2>
  <p>The bank now wants a savings account. It is exactly a bank account (owner, balance, deposit, withdraw) plus one extra thing: it earns interest. Copying the whole <code>BankAccount</code> class and adding a method would work, but then every bug fix has to be made twice. <strong>Inheritance</strong> lets a new class start from an existing class and add or change only what differs.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A child inherits traits from a parent, then has some of their own. In the same way a <b>child class</b> (also called subclass) inherits all the attributes and methods of its <b>parent class</b> (also called base class or superclass), then adds new ones or changes some. The test for using inheritance is the phrase "<b>is a</b>": a savings account <em>is a</em> bank account; an electric car <em>is a</em> car.</p></div>
  <h3>Adding to the parent</h3>
  <p>Here <code>BankAccount</code> is the class from the encapsulation step (with <code>_balance</code>, <code>deposit</code> and <code>withdraw</code>). Writing the parent's name in brackets, <code>class SavingsAccount(BankAccount):</code>, makes it a child class.</p>
  <div class="fx" data-lang="py"># (BankAccount is the class from the encapsulation step)

class SavingsAccount(BankAccount):              # "a SavingsAccount IS A BankAccount"
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)        # let the parent set owner and _balance
        self.rate = rate                        # the one new piece of data

    def add_interest(self):                     # the one new behaviour
        self.deposit(self._balance * self.rate)

s = SavingsAccount("Chen", 1000, 0.04)
s.deposit(500)          # inherited: written once, in BankAccount
s.add_interest()        # new: only savings accounts have this
print(s.owner, s.balance)
print(isinstance(s, SavingsAccount), isinstance(s, BankAccount))</div>
  <div class="fx" data-lang="text">Chen 1560.0
True True</div>
  <p><code>deposit</code> was never written in <code>SavingsAccount</code>, yet <code>s.deposit(500)</code> works: Python did not find it in the child, so it looked in the parent. <code>super().__init__(owner, balance)</code> means "run the parent's setup first", so the child does not repeat that code; it then adds its own <code>rate</code>. And <code>isinstance(s, BankAccount)</code> is True: a savings account really is a bank account, so it can be used anywhere a bank account is expected.</p>
  <h3>Changing the parent's behaviour: overriding</h3>
  <p>A current account lets you go below zero up to an overdraft limit. Its <code>withdraw</code> must follow a different rule. If the child defines a method with the same name as the parent's, the child's version is used instead. This is called <strong>overriding</strong>.</p>
  <div class="fx" data-lang="py">class CurrentAccount(BankAccount):
    def __init__(self, owner, balance, overdraft):
        super().__init__(owner, balance)
        self.overdraft = overdraft

    def withdraw(self, amount):                 # override: same name, new rule
        if amount &gt; self._balance + self.overdraft:
            raise ValueError("Overdraft limit reached")
        self._balance -= amount

c = CurrentAccount("Dev", 500, overdraft=1000)
c.withdraw(1200)        # a plain BankAccount would refuse this
print(c.balance)</div>
  <div class="fx" data-lang="text">-700</div>
  <p>A plain <code>BankAccount</code> would refuse to withdraw 1200 from 500. The <code>CurrentAccount</code> uses its own <code>withdraw</code> and allows it, ending at −700, within the 1000 overdraft. Everything else (owner, deposit, the <code>balance</code> property) is still inherited unchanged.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Inheritance</strong>: creating a new class (child) from an existing class (parent) so that the child automatically has the parent's attributes and methods. The child can <b>add</b> new ones and <b>override</b> existing ones. <code>super()</code> calls the parent's version of a method. Use it only for genuine "is-a" relationships.</p></div>
  <div class="callout trap"><span class="label">Trap: not everything is "is-a"</span><p>A customer <em>has</em> an account; a customer is not an account. For "has-a" relationships, store one object inside another (<code>self.account = BankAccount(...)</code>) instead of inheriting. This is called <b>composition</b>, and it is usually the safer default. (More: <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>.)</p></div>

  <h2 id="oo-poly"><span class="num">07</span>Pillar 4: Polymorphism</h2>
  <p><strong>Polymorphism</strong> is Greek for "many forms". It means the same method call can do different things depending on which kind of object receives it. You have already used it without the name:</p>
  <div class="fx" data-lang="py">print(len("chai"), len([10, 20, 30]), len({"a": 1}))
print(2 + 3, "chai" + "wala", [1] + [2])</div>
  <div class="fx" data-lang="text">4 3 1
5 chaiwala [1, 2]</div>
  <p>The same <code>len()</code> works on a string, a list and a dict; the same <code>+</code> adds numbers, joins strings and joins lists. Each type decides what the operation means for itself. Polymorphism in your own classes works the same way.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>At a shop counter you say "pay", and the payment method decides what happens: a card is swiped, UPI scans a QR code, cash is counted. You do not need a different instruction for each; you say "pay" and each one does it its own way.</p></div>
  <p>At month end, the bank must update every account. A basic account does nothing, a savings account earns 4% interest, a current account pays a ₹100 fee. Without polymorphism you would write <code>if type is SavingsAccount: ... elif type is CurrentAccount: ...</code> and edit that chain every time a new account type is added. With polymorphism each class provides its own <code>month_end</code> method, and the loop just calls it:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance

    def month_end(self):
        pass                                    # basic account: nothing happens

class SavingsAccount(BankAccount):
    def month_end(self):
        self._balance += self._balance * 0.04   # earns interest

class CurrentAccount(BankAccount):
    def month_end(self):
        self._balance -= 100                    # pays a fee

accounts = [BankAccount("Asha", 1000), SavingsAccount("Chen", 1000), CurrentAccount("Dev", 1000)]

for acc in accounts:                            # no if/elif on the type
    acc.month_end()                             # each object runs its OWN version
    print(f"{acc.owner:5} {type(acc).__name__:15} {acc._balance}")</div>
  <div class="fx" data-lang="text">Asha  BankAccount     1000
Chen  SavingsAccount  1040.0
Dev   CurrentAccount  900</div>
  <p>The loop does not check types at all. Each object runs its own version of <code>month_end</code>: Asha's stays at 1000, Chen's earns interest to 1040, Dev's pays the fee down to 900. Adding a new account type later means writing one new class; the loop never changes.</p>
  <h3>Duck typing: Python's relaxed polymorphism</h3>
  <p>In Python the objects do not even need to share a parent class. As long as an object has the method being called, it works. This is called <strong>duck typing</strong>: "if it walks like a duck and quacks like a duck, treat it as a duck".</p>
  <div class="fx" data-lang="py">class Wallet:                       # not a BankAccount at all
    def __init__(self, owner):
        self.owner = owner
        self._balance = 50
    def month_end(self):
        print("wallet: nothing to do")

for thing in [Wallet("Esha")]:
    thing.month_end()               # works: Python only needs the method to exist</div>
  <div class="fx" data-lang="text">wallet: nothing to do</div>
  <p><code>Wallet</code> has nothing to do with <code>BankAccount</code>, but it has a <code>month_end</code> method, so the same loop can use it. Python checks for the method when the call happens, not the class.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Polymorphism</strong>: one interface (the same method name or operator) with many implementations, where the object's class decides which implementation runs. In Python it comes from method overriding in subclasses and from duck typing.</p></div>

  <h2 id="oo-all"><span class="num">08</span>All Four Pillars in One Program</h2>
  <p>Here is the finished banking program. Read the comments: each one names the pillar that line is using. This is what the four pillars look like when they work together in real code.</p>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Account(ABC):                                  # ABSTRACTION: what every account can do
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance                      # ENCAPSULATION: internal data

    @property
    def balance(self):                               # ENCAPSULATION: read-only view
        return self._balance

    def deposit(self, amount):
        if amount &lt;= 0:
            raise ValueError("Amount must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("Not enough money")
        self._balance -= amount

    @abstractmethod
    def month_end(self):                             # ABSTRACTION: each type must define it
        ...

class SavingsAccount(Account):                       # INHERITANCE: reuses Account
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)
        self.rate = rate

    def month_end(self):
        self.deposit(self._balance * self.rate)

class CurrentAccount(Account):                       # INHERITANCE
    def __init__(self, owner, balance, overdraft):
        super().__init__(owner, balance)
        self.overdraft = overdraft

    def withdraw(self, amount):                      # override with a different rule
        if amount &gt; self._balance + self.overdraft:
            raise ValueError("Overdraft limit reached")
        self._balance -= amount

    def month_end(self):
        self._balance -= 100

accounts = [SavingsAccount("Chen", 1000, 0.04), CurrentAccount("Dev", 500, 1000)]
accounts[1].withdraw(1200)                           # allowed: Dev has an overdraft

for acc in accounts:                                 # POLYMORPHISM: same call, different behaviour
    acc.month_end()
    print(acc.owner, acc.balance)

try:
    accounts[0].withdraw(5000)                       # Chen has no overdraft
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">Chen 1040.0
Dev -800
ValueError: Not enough money</div>
  <p>How the pillars connect:</p>
  <ul>
    <li><b>Abstraction</b> sets the plan: <code>Account</code> says every account can deposit, withdraw and do <code>month_end</code>, without fixing how <code>month_end</code> works.</li>
    <li><b>Encapsulation</b> keeps every account safe: <code>_balance</code> changes only inside methods, and <code>balance</code> is read-only from outside.</li>
    <li><b>Inheritance</b> lets <code>SavingsAccount</code> and <code>CurrentAccount</code> reuse all of that, writing only what is different (a rate, an overdraft, their own <code>month_end</code>, and a different <code>withdraw</code> for current accounts).</li>
    <li><b>Polymorphism</b> lets the final loop treat every account the same way, while each one behaves correctly: Chen earns interest to 1040, Dev pays the fee and goes from −700 to −800, and Chen is still refused an overdraft he does not have.</li>
  </ul>

  <h2 id="oo-traps"><span class="num">09</span>Common Mistakes</h2>
  <h3>Forgetting <code>self</code></h3>
  <p>Every regular method receives the object as its first argument. Leave out <code>self</code> and the call fails with a confusing count:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def deposit(amount):            # forgot self
        pass

try:
    BankAccount().deposit(100)
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: BankAccount.deposit() takes 1 positional argument but 2 were given</div>
  <p>"Takes 1 but 2 were given": you passed 100, and Python also passed the object, which had nowhere to go.</p>
  <h3>A list written at class level is shared by every object</h3>
  <p>Attributes written directly in the class body (not inside <code>__init__</code>) belong to the class and are shared by all objects. With a list, that is almost always a bug:</p>
  <div class="fx" data-lang="py">class Cart:
    items = []                      # class attribute: ONE list shared by every Cart
    def add(self, item):
        self.items.append(item)

a, b = Cart(), Cart()
a.add("chai")
print(b.items)                      # b sees a's item

class CartFixed:
    def __init__(self):
        self.items = []             # instance attribute: each Cart gets its own
    def add(self, item):
        self.items.append(item)

a, b = CartFixed(), CartFixed()
a.add("chai")
print(b.items)</div>
  <div class="fx" data-lang="text">['chai']
[]</div>
  <p>Put per-object data in <code>__init__</code> as <code>self.something</code>. (More: <a class="xref" data-note="py_classes">Classes &amp; Objects</a>.)</p>
  <h3>Other mistakes</h3>
  <ul>
    <li><b>Inheriting for a "has-a" relationship.</b> A <code>Customer(BankAccount)</code> class is wrong; a customer has accounts. Use composition.</li>
    <li><b>Making a class for everything.</b> A class with only <code>__init__</code> and one method is usually just a function. Use a class when there is data that must stay consistent across several operations.</li>
    <li><b>Writing Java-style getters and setters</b> (<code>get_balance()</code>, <code>set_balance()</code>). In Python start with a plain attribute and switch to <code>@property</code> only when you need a check; callers do not change.</li>
    <li><b>Treating <code>_name</code> as security.</b> It is a convention for other developers, not protection against malicious code.</li>
  </ul>

  <h2 id="oo-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why OOP</h3>
  <ul>
    <li>Without OOP, data (variables, dicts) and rules (functions) are separate, so any code can change data without the rules.</li>
    <li>OOP bundles data (<b>attributes</b>) and behaviour (<b>methods</b>) into <b>objects</b>, created from <b>classes</b>.</li>
  </ul>
  <h3>Classes and objects</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th><th>Syntax</th></tr>
    <tr><td>Class</td><td>blueprint</td><td><code>class BankAccount:</code></td></tr>
    <tr><td>Object / instance</td><td>one thing built from a class</td><td><code>a = BankAccount("Asha", 1000)</code></td></tr>
    <tr><td>Constructor</td><td>runs automatically on creation</td><td><code>def __init__(self, owner, balance):</code></td></tr>
    <tr><td>Attribute</td><td>data on one object</td><td><code>self.owner = owner</code></td></tr>
    <tr><td>Method</td><td>function in a class</td><td><code>def deposit(self, amount):</code></td></tr>
    <tr><td><code>self</code></td><td>the object the method was called on</td><td><code>a.deposit(5)</code> = <code>BankAccount.deposit(a, 5)</code></td></tr>
  </table>
  <h3>The four pillars</h3>
  <table class="tbl">
    <tr><th>Pillar</th><th>Meaning</th><th>Analogy</th><th>In Python</th></tr>
    <tr><td>Encapsulation</td><td>protect data; change only via methods</td><td>bank vault + teller</td><td><code>_balance</code>, <code>@property</code></td></tr>
    <tr><td>Abstraction</td><td>simple interface, hidden details</td><td>ATM buttons</td><td>public methods + <code>_helpers</code>; <code>ABC</code>, <code>@abstractmethod</code></td></tr>
    <tr><td>Inheritance</td><td>child class reuses parent (is-a)</td><td>child inherits traits</td><td><code>class Savings(BankAccount):</code>, <code>super().__init__(...)</code></td></tr>
    <tr><td>Polymorphism</td><td>same call, behaviour depends on class</td><td>"pay" by card / UPI / cash</td><td>overriding, duck typing</td></tr>
  </table>
  <h3>Syntax to remember</h3>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Account(ABC):                    # abstract: cannot be instantiated
    def __init__(self, owner, balance):
        self.owner = owner             # public attribute
        self._balance = balance        # internal attribute

    @property
    def balance(self):                 # read-only access
        return self._balance

    @abstractmethod
    def month_end(self): ...           # subclasses must implement

class Savings(Account):                # inheritance
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)
        self.rate = rate

    def month_end(self):               # override → polymorphism
        self._balance *= 1 + self.rate</div>
  <h3>Python specifics</h3>
  <ul>
    <li>No <code>private</code> keyword: <code>_x</code> = internal by convention; <code>__x</code> → renamed to <code>_Class__x</code> (name mangling).</li>
    <li>Duck typing: an object only needs the method, not a shared parent class.</li>
    <li>Abstract class: inherit <code>ABC</code>, mark <code>@abstractmethod</code>; instantiating it, or a subclass missing a method, raises <code>TypeError</code>.</li>
    <li><code>isinstance(obj, Parent)</code> is True for child objects.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Forgetting <code>self</code> → "takes 1 positional argument but 2 were given".</li>
    <li>Mutable class attribute (<code>items = []</code> in class body) is shared by all objects; initialise in <code>__init__</code>.</li>
    <li>Inheritance only for is-a; has-a → composition.</li>
    <li>Encapsulation (protect data) ≠ abstraction (hide complexity).</li>
  </ul>

  <h2 id="oo-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is object-oriented programming, and why use it?</summary><div class="qa-body">OOP structures a program as objects that combine data (attributes) and behaviour (methods), created from classes. It keeps each piece of data next to the only code allowed to change it, which protects rules (like "balance never negative"), makes code reusable through inheritance, and lets one piece of code work with many object types through polymorphism. It suits programs with many entities that each have state and rules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class and an object?</summary><div class="qa-body">A class is a blueprint that defines attributes and methods; an object is a concrete instance built from it, with its own data. One class can create many objects: <code>BankAccount</code> is the class, <code>asha = BankAccount("Asha", 1000)</code> and <code>ben = BankAccount("Ben", 500)</code> are two objects with separate balances.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four pillars of OOP? Explain each in one line.</summary><div class="qa-body"><b>Encapsulation</b>: keep data and methods together and restrict direct access to the data. <b>Abstraction</b>: expose only essential operations, hide the implementation. <b>Inheritance</b>: create a class from an existing one, reusing and extending it. <b>Polymorphism</b>: the same method call behaves differently depending on the object's class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>self</code> in Python?</summary><div class="qa-body"><code>self</code> is the first parameter of an instance method and refers to the object the method was called on. <code>acc.deposit(100)</code> is translated to <code>BankAccount.deposit(acc, 100)</code>, so <code>self</code> is <code>acc</code>. It is a naming convention, not a keyword, but always use it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__init__</code>? Is it a constructor?</summary><div class="qa-body"><code>__init__</code> initialises a newly created object: Python calls it automatically after creating the object, and it sets up attributes. Strictly, the object is created by <code>__new__</code> and <code>__init__</code> only initialises it, but in everyday speech <code>__init__</code> is called the constructor. It must return <code>None</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between encapsulation and abstraction?</summary><div class="qa-body">Encapsulation is about protecting data: bundling it with methods and preventing direct changes (in Python, <code>_balance</code> plus <code>@property</code>). Abstraction is about hiding complexity: offering a simple interface like <code>transfer()</code> and hiding the steps behind it, or defining an abstract class that says what must be done but not how. Encapsulation answers "who can change this?"; abstraction answers "what does the user need to know?".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python have private variables?</summary><div class="qa-body">No enforced ones. <code>_name</code> is a convention meaning internal. <code>__name</code> triggers name mangling: inside class <code>Demo</code> it becomes <code>_Demo__name</code>, which prevents accidental clashes in subclasses but can still be accessed. Python relies on convention ("consenting adults") rather than access modifiers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>@property</code> used for?</summary><div class="qa-body">It turns a method into something read like an attribute (<code>acc.balance</code>, no brackets). With no setter the attribute is read-only; with <code>@balance.setter</code> you can validate assignments. It lets you start with a plain attribute and add checks later without changing any calling code, which is why Python avoids Java-style <code>get_x()</code>/<code>set_x()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an abstract class? How do you create one in Python?</summary><div class="qa-body">A class that defines an interface but cannot be instantiated; subclasses must implement its abstract methods. In Python inherit from <code>abc.ABC</code> and decorate methods with <code>@abstractmethod</code>. Creating the abstract class, or a subclass that has not implemented every abstract method, raises <code>TypeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is inheritance, and what does <code>super()</code> do?</summary><div class="qa-body">Inheritance creates a child class that automatically has the parent's attributes and methods and can add or override them: <code>class SavingsAccount(BankAccount):</code>. <code>super()</code> gives access to the parent's methods, most often <code>super().__init__(...)</code> so the parent's setup runs before the child adds its own attributes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is method overriding? How is it different from overloading?</summary><div class="qa-body">Overriding: a child class defines a method with the same name as the parent's, and the child's version runs for child objects (e.g. <code>CurrentAccount.withdraw</code> allowing an overdraft). Overloading: several methods with the same name but different parameter lists. Python does not support signature-based overloading; a later <code>def</code> with the same name replaces the earlier one. Use default arguments, <code>*args</code>, or <code>functools.singledispatch</code> instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is polymorphism? Give a Python example.</summary><div class="qa-body">One interface, many implementations: the object's class decides what a call does. Built-in example: <code>len()</code> works on strings, lists and dicts; <code>+</code> adds numbers and joins strings. Own example: <code>for acc in accounts: acc.month_end()</code>, where savings accounts add interest and current accounts charge a fee, with no type checks in the loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is duck typing?</summary><div class="qa-body">Python cares whether an object has the method you call, not what class it is: "if it walks like a duck and quacks like a duck, it's a duck". Any object with a <code>read()</code> method can be passed where a file is expected. It gives polymorphism without a shared parent class; <code>typing.Protocol</code> lets type checkers verify it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Composition vs inheritance: when do you use each?</summary><div class="qa-body">Inheritance for "is-a" (a savings account is a bank account). Composition for "has-a": store an object as an attribute (a customer has accounts: <code>self.accounts = [...]</code>). Composition is the safer default: it keeps classes loosely coupled, avoids deep hierarchies and lets you swap parts at runtime. "Favour composition over inheritance" is a common design guideline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class attribute and an instance attribute?</summary><div class="qa-body">An instance attribute is set on <code>self</code> (usually in <code>__init__</code>) and each object has its own. A class attribute is written in the class body and shared by all instances. Mutable class attributes are a classic bug: <code>items = []</code> in the class body means every object appends to the same list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python support multiple inheritance? How does it decide which method to use?</summary><div class="qa-body">Yes: <code>class C(A, B):</code>. Python searches classes in the <b>Method Resolution Order</b> (MRO), computed with the C3 linearisation: the class itself, then its parents left to right, with each class appearing before its own parents and only once. You can see it with <code>C.__mro__</code> or <code>C.mro()</code>. <code>super()</code> follows the MRO, which is what makes cooperative multiple inheritance and mixins work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "everything is an object" mean in Python?</summary><div class="qa-body">Every value, including ints, functions, modules and classes themselves, is an object with a type, an identity and attributes. Classes are objects too: they are instances of <code>type</code> (the default metaclass), so you can pass a class to a function or store it in a list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use a class?</summary><div class="qa-body">When there is no state to protect: a class with just <code>__init__</code> and one method is a function in disguise. For plain data records, a <code>@dataclass</code> or <code>NamedTuple</code> is lighter. For stateless transformations (common in data pipelines), plain functions are simpler to test and reuse. Use a class when several operations must keep shared data consistent.</div></details>
</main>
`
});
