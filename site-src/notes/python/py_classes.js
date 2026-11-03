// notes/python/py_classes.js — Classes & Objects
Object.assign(TOPIC_CONTENT, {
  "py_classes": `<main>
<h1>Classes &amp; Objects</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Classes &amp; Objects</span></div>
  <p class="lead">In <a class="xref" data-note="py_oop">OOP Concepts in Python</a> we built a <code>BankAccount</code> class and learned what a class, an object, <code>__init__</code>, <code>self</code> and a method are. That is enough to write working classes, but real Python code uses a handful of further tools that decide where data is stored, how objects are created and how much control a class has over its own attributes. This page goes one level deeper: the difference between data stored on the class and data stored on each object, the three kinds of method, alternative ways to build objects, properties that check every new value, dataclasses that write the boring code for you, and <code>__slots__</code> for saving memory. These are exactly the pieces you meet when you read a scikit-learn estimator, a PyTorch module or a configuration class, and they are favourite interview topics. We keep working on the same bank, with Asha, Ben and friends, so every new idea is added to an account class you already know.</p>

  <h2 id="pc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Classes &amp; Objects</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Where data lives</div>
        <ul>
          <li><b>Instance attribute</b>: <code>self.x</code>, one per object, in <code>vars(obj)</code></li>
          <li><b>Class attribute</b>: written in the class body, shared by all objects</li>
          <li>Reading searches object → class → parents; writing through an object always writes on the object</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Creating objects</div>
        <ul>
          <li><code>BankAccount(...)</code> = <code>__new__</code> (empty object) + <code>__init__</code> (fill it)</li>
          <li><code>__init__</code> validates and must return <code>None</code></li>
          <li><code>@classmethod</code> alternative constructors return <code>cls(...)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Three kinds of method</div>
        <ul>
          <li><b>Instance</b> gets <code>self</code>: one object's data</li>
          <li><b>Class</b> gets <code>cls</code>: the class itself</li>
          <li><b>Static</b> gets nothing: a helper that belongs with the class</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Controlling attributes</div>
        <ul>
          <li><code>@property</code> + setter: checks every new value, keeps attribute syntax</li>
          <li><code>@dataclass</code>: writes <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code></li>
          <li><code>__slots__</code>: fixed attribute names, less memory, typos refused</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-attrs"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Class and Instance Attributes</span><span class="rm-sub">data shared by all accounts vs data each account owns</span></div></div>
      <div class="rm-item rm-done" data-target="pc-init"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How an Object Is Created</span><span class="rm-sub">__new__ makes it, __init__ fills it</span></div></div>
      <div class="rm-item rm-done" data-target="pc-methods"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Instance, Class and Static Methods</span><span class="rm-sub">what each kind of method receives</span></div></div>
      <div class="rm-item rm-done" data-target="pc-alt"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Alternative Constructors</span><span class="rm-sub">building objects from a CSV line with cls</span></div></div>
      <div class="rm-item rm-done" data-target="pc-prop"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Properties with Setters</span><span class="rm-sub">checking every new value</span></div></div>
      <div class="rm-item rm-done" data-target="pc-dc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Dataclasses</span><span class="rm-sub">let Python write the boring methods</span></div></div>
      <div class="rm-item rm-done" data-target="pc-slots"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">__slots__</span><span class="rm-sub">fixed attributes and less memory</span></div></div>
      <div class="rm-item rm-done" data-target="pc-all"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Putting It Together</span><span class="rm-sub">the complete account class</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">shared defaults, recursion, unchecked types</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, tables, syntax</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">attributes, methods, properties, dataclasses</span></div></div>
    </div>
  </div>

  <h2 id="pc-attrs"><span class="num">01</span>Class and Instance Attributes</h2>
  <p>Every account in our bank has its own owner and its own balance, and we already know how to store those: <code>self.owner = owner</code> inside <code>__init__</code>. But some information is not personal to one account. Every account belongs to the same bank, so the bank's name is the same for all of them. And the bank may want to know how many accounts it has opened in total, a number that belongs to the bank as a whole rather than to Asha or Ben. Storing the bank's name separately on every account would waste space and, worse, the copies could drift apart. We need a place to keep data that is shared by all the objects of a class.</p>
  <p>Python has exactly such a place. A variable written directly inside the class body, outside any method, is a <strong>class attribute</strong>: a single value stored once, on the class itself, and shared by every object made from it. A value stored with <code>self.something = ...</code> is an <strong>instance attribute</strong>: it is stored on one particular object, and each object has its own. Think of the passbooks a bank hands out. Each passbook has the customer's balance written inside it, different for every customer; that is an instance attribute. The bank's name is printed once on the sign above the door; that is a class attribute. Ask any customer which bank they use, and they look up at the same sign.</p>
  <p>To see where each kind of value lives, we use <code>vars(obj)</code>, which shows the dictionary in which an object keeps its own attributes (Python stores it in a hidden attribute called <code>__dict__</code>). <code>vars(BankAccount)</code> shows the class's own dictionary in the same way.</p>
  <div class="fx" data-lang="py">class BankAccount:
    bank_name = "Python Bank"          # class attribute: ONE value, stored on the class
    accounts_opened = 0                # class attribute: a counter shared by all accounts

    def __init__(self, owner, balance):
        self.owner = owner             # instance attributes: each object gets its own
        self.balance = balance
        BankAccount.accounts_opened += 1

asha = BankAccount("Asha", 1000)
ben = BankAccount("Ben", 500)
print(asha.bank_name, "|", ben.bank_name, "|", BankAccount.bank_name)
print(vars(asha))
print(vars(ben))
print("bank_name" in vars(asha), "bank_name" in vars(BankAccount))
print("accounts opened:", BankAccount.accounts_opened)</div>
  <div class="fx" data-lang="text">Python Bank | Python Bank | Python Bank
{'owner': 'Asha', 'balance': 1000}
{'owner': 'Ben', 'balance': 500}
False True
accounts opened: 2</div>
  <p>All three ways of reading <code>bank_name</code> print "Python Bank", yet <code>vars(asha)</code> contains only <code>owner</code> and <code>balance</code>. The name of the bank is not stored on Asha's object at all; it is in <code>vars(BankAccount)</code>. The counter was updated through the class name, <code>BankAccount.accounts_opened += 1</code>, so both accounts added to the same single number, and it reached 2.</p>
  <p>How, then, does <code>asha.bank_name</code> find a value that is not on Asha's object? When you read an attribute, Python searches in a fixed order: first the object's own dictionary, then the class, then the class's parents (and finally the built-in <code>object</code> that every class ultimately comes from). It stops at the first place where it finds the name. For <code>asha.balance</code> the search ends at the first step, on the object. For <code>asha.bank_name</code> the object has nothing, so Python looks in <code>BankAccount</code> and finds it there. This is also how methods are found: <code>deposit</code> is not stored on each account but on the class, and the same search reaches it. If the name is nowhere, you get an <code>AttributeError</code>.</p>
  <p>Reading searches upward, but writing does not. Assigning through an object always writes onto that object, even if the class already has an attribute of the same name. This produces a behaviour called <strong>shadowing</strong>: the new instance attribute hides the class attribute, but only for that one object.</p>
  <div class="fx" data-lang="py">asha.bank_name = "Asha's Bank"         # assigning through an object...
print(asha.bank_name, "|", ben.bank_name, "|", BankAccount.bank_name)
print(vars(asha))                      # ...created a NEW attribute on asha only

del asha.bank_name                     # remove it, and lookup falls back to the class
print(asha.bank_name)

BankAccount.bank_name = "PyBank"       # change the class attribute itself
print(asha.bank_name, "|", ben.bank_name)</div>
  <div class="fx" data-lang="text">Asha's Bank | Python Bank | Python Bank
{'owner': 'Asha', 'balance': 1000, 'bank_name': "Asha's Bank"}
Python Bank
PyBank | PyBank</div>
  <p>After <code>asha.bank_name = "Asha's Bank"</code>, Asha sees her own value while Ben and the class still say "Python Bank", and <code>vars(asha)</code> now contains a new <code>bank_name</code> key. The class attribute was not changed at all; it was merely hidden from Asha. Deleting Asha's attribute uncovers the class value again. To change the value for everyone, you must assign through the class, as the last lines do: after <code>BankAccount.bank_name = "PyBank"</code>, both accounts read the new name.</p>
  <p>This read-up, write-here rule is the reason for two classic bugs. The first concerns counters. Suppose we update the counter through <code>self</code> instead of through the class:</p>
  <div class="fx" data-lang="py">class BankAccount:
    accounts_opened = 0

    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance
        self.accounts_opened += 1      # BUG: reads the class value, WRITES an instance attribute

asha = BankAccount("Asha", 1000)
ben = BankAccount("Ben", 500)
print(BankAccount.accounts_opened, asha.accounts_opened, vars(ben))</div>
  <div class="fx" data-lang="text">0 1 {'owner': 'Ben', 'balance': 500, 'accounts_opened': 1}</div>
  <p>The class counter is still 0, while each account carries its own private value of 1. The line <code>self.accounts_opened += 1</code> is shorthand for <code>self.accounts_opened = self.accounts_opened + 1</code>. The right-hand side reads the attribute, the search reaches the class and finds 0, and adding 1 gives 1. But the assignment on the left writes through the object, so it creates a new instance attribute instead of updating the class. Every account does the same and the shared counter never moves. Shared values must be changed through the class: <code>BankAccount.accounts_opened += 1</code>, or <code>type(self).accounts_opened += 1</code> if subclasses should keep their own counts.</p>
  <p>The second bug is its mirror image, and <a class="xref" data-note="py_oop">OOP Concepts in Python</a> showed it with a shopping cart: a list written in the class body is shared by every object. Now we can see exactly why.</p>
  <div class="fx" data-lang="py">class BankAccount:
    history = []                       # BUG: one list, stored on the class

    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        self.history.append((self.owner, amount))   # changes the class's list in place

asha, ben = BankAccount("Asha", 1000), BankAccount("Ben", 500)
asha.deposit(200)
print(ben.history)
print(asha.history is ben.history is BankAccount.history)</div>
  <div class="fx" data-lang="text">[('Asha', 200)]
True</div>
  <p>Ben never deposited anything, yet his history contains Asha's deposit, and the last line confirms that <code>asha.history</code>, <code>ben.history</code> and <code>BankAccount.history</code> are one and the same list. Inside <code>deposit</code>, <code>self.history</code> is only <em>read</em>: the search finds the list on the class, and <code>.append()</code> changes that list in place. No assignment happens, so no instance attribute is ever created. Put the two bugs side by side and the rule becomes clear. With the counter, assigning through <code>self</code> created a private copy when we wanted a shared value. With the list, modifying through <code>self</code> changed the shared object when we wanted a private one. Numbers cannot be changed in place (they are <em>immutable</em>, see <a class="xref" data-note="py_values">Values &amp; Types</a>), while lists can, and that difference decides which bug you get.</p>
  <p>The practical rule follows. Use class attributes for constants and genuine class-wide settings, such as the bank's name or a minimum opening balance. Create anything that belongs to one object, and especially anything mutable like a list or dict, on <code>self</code> inside <code>__init__</code>.</p>

  <h2 id="pc-init"><span class="num">02</span>How an Object Is Created: __new__ and __init__</h2>
  <p>We have been calling <code>__init__</code> "the constructor", as most people do. Strictly speaking that is not quite right, and knowing the real sequence explains several things: why <code>__init__</code> receives an object that already exists, why it is not allowed to return anything, and how an object that fails a check never comes into existence.</p>
  <p>When you write <code>BankAccount("Asha", 1000)</code>, Python performs two separate steps. First it calls a method named <code>__new__</code>, which creates a brand-new, completely empty object of the right class. Then it calls <code>__init__</code> on that empty object, passing your arguments, and <code>__init__</code> fills in the attributes. Only after both steps does Python hand the object back to you. So <code>__new__</code> is the real <strong>constructor</strong>, the part that creates the object, and <code>__init__</code> is the <strong>initialiser</strong>, the part that sets it up. Opening an account at a branch works the same way: the clerk first takes a blank passbook from the drawer, and only then writes your name and opening deposit into it. You almost never write <code>__new__</code> yourself, because the version every class inherits from <code>object</code> does the job.</p>
  <p>The class below prints the object's attributes at the start and end of <code>__init__</code>, so you can watch it being filled. It also refuses a negative opening balance, and then repeats the two steps by hand to show that nothing else is hidden inside the call:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance=0):
        print("  __init__ starts, attributes so far:", vars(self))
        if balance &lt; 0:
            raise ValueError("opening balance cannot be negative")
        self.owner = owner
        self.balance = balance
        print("  __init__ ends, attributes now:", vars(self))

print("BankAccount('Asha', 1000):")
asha = BankAccount("Asha", 1000)

print("The same two steps by hand:")
obj = BankAccount.__new__(BankAccount)     # step 1: make an EMPTY object
print("  after __new__:", vars(obj))
BankAccount.__init__(obj, "Ben", 500)      # step 2: fill it in

try:
    BankAccount("Chen", -50)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">BankAccount('Asha', 1000):
  __init__ starts, attributes so far: {}
  __init__ ends, attributes now: {'owner': 'Asha', 'balance': 1000}
The same two steps by hand:
  after __new__: {}
  __init__ starts, attributes so far: {}
  __init__ ends, attributes now: {'owner': 'Ben', 'balance': 500}
  __init__ starts, attributes so far: {}
ValueError: opening balance cannot be negative</div>
  <p>When <code>__init__</code> starts, the object already exists but is empty: <code>{}</code>. By the time it ends, it holds <code>owner</code> and <code>balance</code>. The manual version does the same: <code>BankAccount.__new__(BankAccount)</code> returns an empty object, and calling <code>BankAccount.__init__</code> on it fills in Ben's details. That is all that <code>BankAccount("Ben", 500)</code> does. The last part shows why <code>__init__</code> is the natural place for checks: Chen's negative balance raised a <code>ValueError</code> half-way through <code>__init__</code>, so the call never finished and no half-built account was ever handed back to the program.</p>
  <p>Two more consequences follow from this sequence:</p>
  <div class="fx" data-lang="py">class Weird:
    def __init__(self):
        return 42                      # __init__ is not allowed to return a value

try:
    Weird()
except TypeError as e:
    print("TypeError:", e)

class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def freeze(self):
        self.frozen = True             # attribute created only when freeze() runs

ben = BankAccount("Ben", 500)
try:
    print(ben.frozen)
except AttributeError as e:
    print("AttributeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: __init__() should return None, not 'int'
AttributeError: 'BankAccount' object has no attribute 'frozen'</div>
  <p>The result of <code>BankAccount(...)</code> is always the object created by <code>__new__</code>, not whatever <code>__init__</code> returns, so a return value from <code>__init__</code> would be meaningless and Python rejects it with "should return None". The second example shows why every attribute should be created in <code>__init__</code>: <code>frozen</code> only appears when <code>freeze()</code> runs, so reading it on an account that was never frozen fails. If every attribute is set in <code>__init__</code>, even if only to <code>None</code>, <code>False</code> or an empty list, every object of the class has the same shape and code that uses it does not have to guess.</p>
  <p>The rare occasions for writing <code>__new__</code> come when the object must be decided before it exists. The most common case is a subclass of an immutable built-in type such as <code>int</code>, <code>str</code> or <code>tuple</code>. Their value is fixed the moment the object is created, so by the time <code>__init__</code> runs it is too late to change it:</p>
  <div class="fx" data-lang="py">class Paise(int):                      # int is immutable: its value is fixed in __new__
    def __new__(cls, rupees):
        return super().__new__(cls, round(rupees * 100))

p = Paise(12.5)                        # ₹12.50 stored as 1250 paise
print(p, p + 1, isinstance(p, int), type(p).__name__)</div>
  <div class="fx" data-lang="text">1250 1251 True Paise</div>
  <p><code>Paise(12.5)</code> converted rupees to paise inside <code>__new__</code>, and the result is a real integer, 1250, that supports arithmetic and passes <code>isinstance(p, int)</code>. Apart from immutable types, <code>__new__</code> is used for patterns that must control which object is returned, such as a singleton (one shared instance), which appears in <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>.</p>

  <h2 id="pc-methods"><span class="num">03</span>Instance, Class and Static Methods</h2>
  <p>In <a class="xref" data-note="py_oop">OOP Concepts in Python</a> we saw that <code>asha.deposit(200)</code> is turned by Python into <code>BankAccount.deposit(asha, 200)</code>, which is how <code>self</code> receives the account. To understand the other kinds of method, it helps to look at the object that makes this possible. When you write <code>asha.deposit</code> without brackets, Python finds the function on the class and wraps it together with <code>asha</code> into a small object called a <strong>bound method</strong>: the function plus the object it should work on, with the first argument already filled in.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

asha = BankAccount("Asha", 1000)
print(BankAccount.deposit)             # through the class: a plain function
print(asha.deposit)                    # through an object: a "bound method"

m = asha.deposit                       # take the method without calling it
print(m.__func__ is BankAccount.deposit, m.__self__ is asha)
m(200)                                 # it still remembers which account it belongs to
print(asha.balance)
print("deposit" in vars(BankAccount), "deposit" in vars(asha))</div>
  <div class="fx" data-lang="text">&lt;function BankAccount.deposit at 0x7fcea21a51c0&gt;
&lt;bound method BankAccount.deposit of &lt;__main__.BankAccount object at 0x7fcea24e30e0&gt;&gt;
True True
1200
True False</div>
  <p>Reached through the class, <code>BankAccount.deposit</code> is printed as a plain <code>function</code>. Reached through Asha's account, it is a <code>bound method</code>. The bound method remembers two things, the function in <code>__func__</code> and the account in <code>__self__</code>, and both checks print <code>True</code>. Because it carries the account with it, we could store it in a variable <code>m</code> and call <code>m(200)</code> later, and it still deposited into Asha's account, taking her to 1200. The last line confirms that the method is stored once, on the class, and never copied into each object.</p>
  <p>Most methods are of this ordinary kind, called <strong>instance methods</strong>: they receive the object as <code>self</code> because they work on that one object's data. But not every job concerns one account. Sometimes a method needs the class rather than any particular object, for example to change a bank-wide rule. And sometimes a function needs neither, such as a check that an amount is a positive number, yet it clearly belongs with the account code. Python offers a kind of method for each case, chosen with a <strong>decorator</strong>, a line starting with <code>@</code> placed above a function to change how it behaves (<a class="xref" data-note="py_decorators">Decorators</a> explains how they work inside).</p>
  <p>A <strong>class method</strong>, marked <code>@classmethod</code>, receives the class itself as its first argument instead of an object; by convention that parameter is called <code>cls</code>. A <strong>static method</strong>, marked <code>@staticmethod</code>, receives no automatic first argument at all; it is an ordinary function that simply lives inside the class. A bank branch makes the difference concrete. The cashier who updates your passbook is doing an instance method: the work is about your account. The manager who changes the minimum opening balance for the whole branch is doing a class method: the work is about the branch's rules, not any one customer. The note-counting machine on the desk is a static method: it belongs to the branch, but it knows nothing about customers or rules; you give it notes and it counts them.</p>
  <div class="fx" data-lang="py">class BankAccount:
    min_opening = 100                           # class attribute: smallest opening deposit

    def __init__(self, owner, balance):
        if balance &lt; self.min_opening:
            raise ValueError(f"opening balance must be at least {self.min_opening}")
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):                  # instance method: works on ONE account
        if not self.is_valid_amount(amount):
            raise ValueError(f"bad amount: {amount!r}")
        self.balance += amount

    @classmethod
    def set_min_opening(cls, amount):           # class method: works on the CLASS
        cls.min_opening = amount

    @staticmethod
    def is_valid_amount(amount):                # static method: needs neither
        return isinstance(amount, (int, float)) and amount &gt; 0

asha = BankAccount("Asha", 1000)
print(BankAccount.is_valid_amount(50), BankAccount.is_valid_amount(-5), asha.is_valid_amount("10"))
try:
    asha.deposit(-5)
except ValueError as e:
    print("ValueError:", e)

BankAccount.set_min_opening(500)               # the bank raises its minimum
try:
    BankAccount("Ben", 200)
except ValueError as e:
    print("ValueError:", e)

print(BankAccount.set_min_opening)
print(BankAccount.is_valid_amount)</div>
  <div class="fx" data-lang="text">True False False
ValueError: bad amount: -5
ValueError: opening balance must be at least 500
&lt;bound method BankAccount.set_min_opening of &lt;class '__main__.BankAccount'&gt;&gt;
&lt;function BankAccount.is_valid_amount at 0x7f89c4fa5300&gt;</div>
  <p>The static method <code>is_valid_amount</code> answered <code>True</code>, <code>False</code>, <code>False</code> without needing any account; it can be called through the class or through an object, and <code>deposit</code> uses it to refuse −5. The class method <code>set_min_opening(500)</code> changed <code>min_opening</code> on the class, so the very next account, Ben's with 200, was refused because the rule is now 500 for everybody. The two printed method objects show what each kind receives. <code>set_min_opening</code> is a bound method <em>of the class</em>: Python slipped the class in as <code>cls</code>, exactly as it slips an object in as <code>self</code>. <code>is_valid_amount</code> is a plain function with nothing slipped in.</p>
  <p>Choosing between them is a matter of asking what the method needs. If it uses the object's data, it is an instance method. If it needs the class, to read or change class-wide settings or to create new objects, it is a class method. If it needs neither but is only meaningful together with this class, it is a static method. And if a helper needs neither and is useful elsewhere too, it is often better as an ordinary function at module level. The most important use of class methods, creating objects in a different way, deserves its own section.</p>

  <h2 id="pc-alt"><span class="num">04</span>Alternative Constructors</h2>
  <p>A class has only one <code>__init__</code>, and Python does not allow several versions of it with different parameters (there is no <em>overloading</em> as in Java). Yet data often arrives in different shapes. Our bank might receive new accounts as lines of a CSV file, such as <code>"Asha, 1000"</code>. We could make every caller split and convert the text before calling <code>BankAccount(...)</code>, but then the same parsing code would be repeated everywhere, and a change of format would mean finding every copy.</p>
  <p>The usual solution is an <strong>alternative constructor</strong>: a class method that accepts the data in another form, converts it, and then calls the class to build the object. It is like a bank that accepts account applications either at the counter or on a printed form: the form desk reads the form, fills in the same details, and hands them to the same account-opening procedure. By convention these methods are named <code>from_something</code>.</p>
  <div class="fx" data-lang="py">class BankAccount:
    min_opening = 100

    def __init__(self, owner, balance):
        if balance &lt; self.min_opening:
            raise ValueError(f"opening balance must be at least {self.min_opening}")
        self.owner = owner
        self.balance = balance

    @classmethod
    def from_csv(cls, line):                    # "Asha, 1000"  -&gt;  a BankAccount
        owner, balance = line.split(",")
        return cls(owner.strip(), int(balance))

rows = ["Asha, 1000", "Ben, 500"]               # e.g. lines read from a file
accounts = [BankAccount.from_csv(r) for r in rows]
for acc in accounts:
    print(type(acc).__name__, acc.owner, acc.balance)</div>
  <div class="fx" data-lang="text">BankAccount Asha 1000
BankAccount Ben 500</div>
  <p><code>BankAccount.from_csv("Asha, 1000")</code> split the line at the comma, stripped the spaces, converted <code>"1000"</code> to an integer and then called <code>cls(...)</code>, which runs the normal <code>__new__</code> and <code>__init__</code>. The result is an ordinary <code>BankAccount</code>, checked by the same opening rule as any other. You have used this pattern already in the standard library: <code>dict.fromkeys(...)</code>, <code>datetime.fromisoformat("2024-01-31")</code> and pandas' <code>pd.DataFrame.from_dict(...)</code> are all alternative constructors.</p>
  <p>Why does <code>from_csv</code> call <code>cls(...)</code> rather than simply <code>BankAccount(...)</code>? The answer appears as soon as there is a subclass (a child class, see <a class="xref" data-note="py_oop">OOP Concepts in Python</a>). Suppose the bank adds student accounts, which may be opened with nothing in them. The student class inherits <code>from_csv</code>, and when it is called as <code>StudentAccount.from_csv(...)</code>, <code>cls</code> is <code>StudentAccount</code>. A version that names a class directly loses that information:</p>
  <div class="fx" data-lang="py">class StudentAccount(BankAccount):              # students may open an account with 0
    min_opening = 0

dev = StudentAccount.from_csv("Dev, 0")         # inherited from_csv, called on the child
print(type(dev).__name__, dev.owner, dev.balance)

class HardcodedAccount(BankAccount):
    @classmethod
    def from_csv(cls, line):
        owner, balance = line.split(",")
        return HardcodedAccount(owner.strip(), int(balance))  # BUG: names a class instead of cls

class HardcodedStudent(HardcodedAccount):
    min_opening = 0

try:
    HardcodedStudent.from_csv("Eve, 0")
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">StudentAccount Dev 0
ValueError: opening balance must be at least 100</div>
  <p><code>StudentAccount.from_csv("Dev, 0")</code> returned a <code>StudentAccount</code>, and the child's own <code>min_opening</code> of 0 allowed Dev's empty account. In the second family, <code>from_csv</code> names <code>HardcodedAccount</code> instead of using <code>cls</code>, so even when called on <code>HardcodedStudent</code> it builds a <code>HardcodedAccount</code>, whose minimum is still 100, and Eve is refused. The child's rule was silently ignored. An alternative constructor should therefore always build its result with <code>cls(...)</code>, so that it keeps working for every subclass.</p>

  <h2 id="pc-prop"><span class="num">05</span>Properties with Setters</h2>
  <p>In <a class="xref" data-note="py_oop">OOP Concepts in Python</a> we made the balance read-only with <code>@property</code>, so the only way to change it was through <code>deposit</code> and <code>withdraw</code>. But some attributes should be changeable, just not to any value at all. An account's owner can change their name, for example after marriage, yet an empty name should never be accepted. With a plain attribute, nothing checks the value:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance

asha = BankAccount("Asha", 1000)
asha.owner = "   "                  # an empty name: nothing stops it
print(repr(asha.owner))</div>
  <div class="fx" data-lang="text">'   '</div>
  <p>The owner is now three spaces, and no error appeared. We could add a <code>set_owner()</code> method with the check inside, as Java programmers do, but then every existing line that says <code>asha.owner = ...</code> would have to be rewritten, and nothing would stop someone from still assigning the attribute directly.</p>
  <p>A <strong>property</strong> solves this without changing how the attribute is used. It is a pair of methods that Python runs automatically when the attribute is read or assigned. The <strong>getter</strong>, written under <code>@property</code>, runs when code reads <code>asha.owner</code>. The <strong>setter</strong>, written under <code>@owner.setter</code>, runs when code assigns <code>asha.owner = value</code>, and it can check or clean the value before storing it. Because the property uses the name <code>owner</code> itself, the real value has to be stored under a different name, by convention the same name with a leading underscore, <code>_owner</code>. Think of a bank counter window. From your side you simply hand over a form; behind the glass, the cashier checks it before anything is written into the records. The caller sees a simple action, but rules run every time.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner                     # goes through the setter below
        self._balance = balance

    @property
    def owner(self):                           # getter: runs on  asha.owner
        return self._owner

    @owner.setter
    def owner(self, name):                     # setter: runs on  asha.owner = ...
        name = name.strip()
        if not name:
            raise ValueError("owner name cannot be empty")
        self._owner = name.title()

    @property
    def balance(self):                         # getter only: read-only (as in OOP Concepts)
        return self._balance

    @property
    def is_empty(self):                        # computed fresh on every read
        return self._balance == 0

asha = BankAccount("  asha rao ", 1000)
print(asha.owner, asha.balance, asha.is_empty)
try:
    asha.owner = "   "
except ValueError as e:
    print("ValueError:", e)
asha.owner = "asha k"
print(asha.owner)
print(vars(asha))

asha.__dict__["owner"] = "Hacker"              # sneak a value straight into the object's storage
print(asha.owner)                              # the property still wins</div>
  <div class="fx" data-lang="text">Asha Rao 1000 False
ValueError: owner name cannot be empty
Asha K
{'_owner': 'Asha K', '_balance': 1000}
Asha K</div>
  <p>The name <code>"  asha rao "</code> came out as <code>Asha Rao</code>. Notice that <code>__init__</code> itself writes <code>self.owner = owner</code>, so even the very first value went through the setter: there is no way to create an account with an unchecked name. Assigning three spaces raised a <code>ValueError</code>, and <code>"asha k"</code> was cleaned to <code>Asha K</code>. The balance is still read-only, and <code>is_empty</code> shows a third use of properties: a value that is computed fresh every time it is read, so it can never be out of date. <code>vars(asha)</code> shows where the data really lives, under <code>_owner</code> and <code>_balance</code>; the properties themselves are stored on the class.</p>
  <p>The last two lines reveal something about how properties work. We forced a value called <code>owner</code> straight into the object's own dictionary, and yet <code>asha.owner</code> still printed "Asha K". Normally the object's own dictionary is searched before the class, as we saw in the first section. A property is an exception. It belongs to a special group of class attributes called <strong>data descriptors</strong>, objects that define what happens on both reading and writing, and Python checks data descriptors on the class <em>before</em> it looks in the object. That is why a property cannot be bypassed by an attribute of the same name on the object, and why assigning <code>asha.owner = ...</code> always goes through the setter.</p>
  <p>Properties also explain why Python code rarely uses <code>get_x()</code> and <code>set_x()</code> methods. You can start every class with plain attributes. If a rule appears months later, you turn the attribute into a property, and every line that already reads or assigns it keeps working, now with the check in place. The one rule to remember is that the getter and setter must use the underscore name. If they use the property's own name, each call triggers itself again:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, balance):
        self.balance = balance          # calls the setter, which calls itself...

    @property
    def balance(self):
        return self.balance             # BUG: reads itself

    @balance.setter
    def balance(self, value):
        self.balance = value            # BUG: assigns itself

try:
    BankAccount(1000)
except RecursionError as e:
    print("RecursionError:", e)</div>
  <div class="fx" data-lang="text">RecursionError: maximum recursion depth exceeded</div>
  <p>Inside the setter, <code>self.balance = value</code> calls the setter again, which calls it again, and so on until Python gives up with a <code>RecursionError</code>. Storing the value in <code>self._balance</code> fixes it. Finally, keep getters cheap and free of surprises: <code>asha.balance</code> looks like reading a plain value, so a getter that queries a database or changes state would mislead everyone reading the calling code.</p>

  <h2 id="pc-dc"><span class="num">06</span>Dataclasses</h2>
  <p>Our bank needs to record each transaction: what kind it was, how much, and perhaps a note. A transaction is mostly data, and a class for it needs the same boring methods every time: an <code>__init__</code> that copies each argument onto <code>self</code>, a <code>__repr__</code> so that it prints something readable instead of a memory address, and an <code>__eq__</code> so that two transactions with the same details compare equal. (These special methods are explained fully in <a class="xref" data-note="py_dunder">Dunder Methods &amp; the Data Model</a>.) Writing them by hand is tedious, and every new field means editing all three in step.</p>
  <p>A <strong>dataclass</strong> is a class in which you only list the fields with their types, and the <code>@dataclass</code> decorator writes those methods for you. It is like a pre-printed bank slip: you decide which boxes the slip should have, and the printing press produces the slip the same way every time. The field list uses <strong>type annotations</strong>, the <code>name: type</code> syntax, which is how the decorator knows which fields exist and in what order.</p>
  <div class="fx" data-lang="py">class TransactionByHand:               # the boring methods, written by hand
    def __init__(self, kind, amount, note=""):
        self.kind = kind
        self.amount = amount
        self.note = note

    def __repr__(self):
        return f"TransactionByHand(kind={self.kind!r}, amount={self.amount!r}, note={self.note!r})"

    def __eq__(self, other):
        return (self.kind, self.amount, self.note) == (other.kind, other.amount, other.note)

from dataclasses import dataclass

@dataclass
class Transaction:                     # the same three methods, generated
    kind: str
    amount: int
    note: str = ""

print(TransactionByHand("deposit", 200))
print(Transaction("deposit", 200))
print(Transaction("deposit", 200) == Transaction("deposit", 200))
print(Transaction("deposit", "two hundred"))   # type hints are NOT checked</div>
  <div class="fx" data-lang="text">TransactionByHand(kind='deposit', amount=200, note='')
Transaction(kind='deposit', amount=200, note='')
True
Transaction(kind='deposit', amount='two hundred', note='')</div>
  <p>The hand-written class needed nine lines of code; the dataclass needs five, and they behave the same way: both print every field, and two <code>Transaction("deposit", 200)</code> objects compare equal. The last line is an important warning. The annotation says <code>amount: int</code>, but the dataclass happily accepted the text "two hundred". Annotations tell the decorator which fields exist and tell tools such as editors and type checkers what is intended, but Python does not check them when the program runs. For data that comes from users, files or web APIs, you either check values yourself or use a validation library such as <strong>pydantic</strong>.</p>
  <p>The decorator accepts options that change what it generates. A transaction, once recorded, should never change, and <code>frozen=True</code> makes every field read-only after creation. Frozen objects can also be <em>hashed</em>, which means they can be stored in a set or used as dictionary keys. <code>order=True</code> additionally writes the comparison operators <code>&lt;</code>, <code>&gt;</code> and friends, comparing the fields in order, like comparing tuples. The <code>field()</code> function sets options for one field: <code>compare=False</code> leaves that field out of comparisons.</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass, field, FrozenInstanceError

@dataclass(frozen=True, order=True)
class Transaction:
    amount: int                        # order=True compares fields in this order
    kind: str = field(compare=False)   # left out of ==, &lt; and hashing
    note: str = field(default="", compare=False)

t1 = Transaction(1000, "open")
t2 = Transaction(200, "deposit")
t3 = Transaction(300, "withdraw")
print(sorted([t1, t2, t3]))
print(t2 &lt; t3, len({t1, t2, Transaction(200, "deposit")}))
try:
    t1.amount = 1_000_000
except FrozenInstanceError as e:
    print("FrozenInstanceError:", e)</div>
  <div class="fx" data-lang="text">[Transaction(amount=200, kind='deposit', note=''), Transaction(amount=300, kind='withdraw', note=''), Transaction(amount=1000, kind='open', note='')]
True 2
FrozenInstanceError: cannot assign to field 'amount'</div>
  <p>Sorting compared only <code>amount</code>, because the other two fields have <code>compare=False</code>, so the transactions came out as 200, 300, 1000. The set contains 2 items, not 3, because the two deposits of 200 are equal and therefore count as one. And assigning to <code>t1.amount</code> raised <code>FrozenInstanceError</code>, which is exactly what you want for a ledger entry that must never be edited.</p>
  <p>A dataclass is still a normal class, so it can have methods of its own. Two more features make it practical for something like an account. <code>field(default_factory=list)</code> gives each new object a fresh list by calling <code>list()</code> every time, the dataclass equivalent of writing <code>self.history = []</code> in <code>__init__</code>. And a method named <code>__post_init__</code>, if you write one, runs straight after the generated <code>__init__</code>, which makes it the place for checks.</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass, field

@dataclass(frozen=True)
class Transaction:
    kind: str
    amount: int

@dataclass
class BankAccount:
    owner: str
    balance: int = 0
    history: list = field(default_factory=list)   # a NEW list for every account

    def __post_init__(self):                       # runs right after the generated __init__
        if self.balance &lt; 0:
            raise ValueError("opening balance cannot be negative")
        self.history.append(Transaction("open", self.balance))

    def deposit(self, amount):
        self.balance += amount
        self.history.append(Transaction("deposit", amount))

asha, ben = BankAccount("Asha", 1000), BankAccount("Ben", 500)
asha.deposit(200)
print(asha)
print(ben)
try:
    BankAccount("Chen", -50)
except ValueError as e:
    print("ValueError:", e)

try:
    @dataclass
    class Bad:
        history: list = []                         # a shared list: refused
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">BankAccount(owner='Asha', balance=1200, history=[Transaction(kind='open', amount=1000), Transaction(kind='deposit', amount=200)])
BankAccount(owner='Ben', balance=500, history=[Transaction(kind='open', amount=500)])
ValueError: opening balance cannot be negative
ValueError: mutable default &lt;class 'list'&gt; for field history is not allowed: use default_factory</div>
  <p>Asha's history holds her opening transaction and her deposit, while Ben's holds only his opening: each account got its own list. Chen's negative balance was caught by <code>__post_init__</code>. The last example shows that dataclasses protect you from the shared-list bug of the first section: writing <code>history: list = []</code> is refused outright, with a message telling you to use <code>default_factory</code>.</p>
  <p>Dataclasses are ideal for objects that are mainly a bundle of named values: records, configuration objects, results returned from a function. They are less suitable when a class has strict rules about how its data may change. Our account dataclass, for example, has a public <code>balance</code> field that anyone can assign, so the "no overdrawing" rule is not protected. For such classes you either combine a dataclass with properties or write the class by hand, as we do in the final section.</p>

  <h2 id="pc-slots"><span class="num">07</span>__slots__</h2>
  <p>Every ordinary object carries its own dictionary, the <code>__dict__</code> we have been inspecting with <code>vars()</code>. That dictionary is what makes Python objects so flexible: you can add any attribute to any object at any moment. But flexibility has two costs. A dictionary takes memory, which starts to matter when a program creates millions of small objects, such as one per transaction in a year of bank data. And since any name can be added, a misspelled attribute is silently accepted, the same "balanse" problem that <a class="xref" data-note="py_oop">OOP Concepts in Python</a> showed with plain dictionaries.</p>
  <p>Declaring <strong><code>__slots__</code></strong> in a class tells Python the complete list of attribute names its objects will ever have. Python then gives each object a fixed set of storage places for exactly those names, instead of a dictionary. Compare a notebook with a printed form. In a notebook you can write anything anywhere, which is flexible but bulky; a form has one box for each field it expects, takes less paper, and has no room for anything else.</p>
  <div class="fx" data-lang="py">class WithDict:                        # a normal class: every object has a __dict__
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

class WithSlots:                       # fixed storage for exactly these two names
    __slots__ = ("owner", "balance")
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

a = WithDict("Asha", 1000)
b = WithSlots("Asha", 1000)
a.balnce = 0                           # typo: silently creates a new attribute
print(vars(a))
try:
    b.balnce = 0                       # the same typo is refused
except AttributeError as e:
    print("AttributeError:", e)
print(hasattr(a, "__dict__"), hasattr(b, "__dict__"))</div>
  <div class="fx" data-lang="text">{'owner': 'Asha', 'balance': 1000, 'balnce': 0}
AttributeError: 'WithSlots' object has no attribute 'balnce' and no __dict__ for setting new attributes
True False</div>
  <p>The ordinary object accepted the typo <code>balnce</code> and quietly gained a third attribute. The slotted object refused it with an <code>AttributeError</code>, saying it has no attribute of that name and no <code>__dict__</code> in which to create one. The last line confirms that slotted objects really have no dictionary. Now the memory difference, measured with the standard <code>tracemalloc</code> module while creating 100,000 objects of each kind:</p>
  <div class="fx" data-lang="py">import tracemalloc

def bytes_per_object(cls, n=100_000):
    tracemalloc.start()
    objs = [cls("Asha", 1000) for _ in range(n)]
    size, _ = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return size / n

print(f"with __dict__ : {bytes_per_object(WithDict):.0f} bytes per object")
print(f"with __slots__: {bytes_per_object(WithSlots):.0f} bytes per object")</div>
  <div class="fx" data-lang="text">with __dict__ : 96 bytes per object
with __slots__: 56 bytes per object</div>
  <p>On this machine each slotted object used roughly 40 percent less memory. The exact numbers are approximate and vary with the Python version and the number of attributes, but the saving is real and grows with the number of objects. For a handful of accounts it is irrelevant; for millions of records it can decide whether the data fits in memory.</p>
  <p><code>__slots__</code> has trade-offs that you should know before using it. Objects can no longer receive new attributes, which is the point, but it also rules out tricks that depend on <code>__dict__</code>. Default values cannot be written as class attributes with the same names as slots. And the benefit only holds if every class in a family declares slots, as this shows:</p>
  <div class="fx" data-lang="py">class Child(WithSlots):                # forgot to declare __slots__ in the child
    pass

c = Child("Ben", 500)
c.anything = 1                         # works again: the child has a __dict__
print(vars(c))

from dataclasses import dataclass

@dataclass(slots=True)                 # dataclasses can write __slots__ for you
class Transaction:
    kind: str
    amount: int

t = Transaction("deposit", 200)
try:
    t.amout = 300
except AttributeError as e:
    print("AttributeError:", e)</div>
  <div class="fx" data-lang="text">{'anything': 1}
AttributeError: 'Transaction' object has no attribute 'amout' and no __dict__ for setting new attributes</div>
  <p>The child class did not declare <code>__slots__</code>, so its objects got a dictionary back, and <code>c.anything = 1</code> worked. A child that wants to stay dictionary-free must declare <code>__slots__</code> itself, even if only as an empty tuple <code>()</code> when it adds no new attributes. The second example shows the easy route for dataclasses: <code>@dataclass(slots=True)</code> writes <code>__slots__</code> for you from the field list, so the misspelled <code>amout</code> is refused. In everyday code you rarely need slots; reach for them when you create very large numbers of objects or when catching misspelled attributes is worth the loss of flexibility.</p>

  <h2 id="pc-all"><span class="num">08</span>Putting It Together: the Complete Account Class</h2>
  <p>Here is our bank account with every idea from this page in one class. The comments mark which idea each part uses.</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Transaction:                                # an unchangeable record
    kind: str
    amount: int

class BankAccount:
    __slots__ = ("_owner", "_balance", "_history")  # fixed storage, typos refused
    bank_name = "Python Bank"                     # class attribute (shared, read-only use)
    min_opening = 100

    def __init__(self, owner, balance):
        if balance &lt; self.min_opening:
            raise ValueError(f"opening balance must be at least {self.min_opening}")
        self.owner = owner                        # through the property setter
        self._balance = 0
        self._history = []                        # a fresh list per account
        self._apply("open", balance)

    @classmethod
    def from_csv(cls, line):                      # alternative constructor
        owner, balance = line.split(",")
        return cls(owner.strip(), int(balance))

    @staticmethod
    def _check(amount):                           # helper: needs neither self nor cls
        if not isinstance(amount, int) or amount &lt;= 0:
            raise ValueError(f"bad amount: {amount!r}")

    @property
    def owner(self):
        return self._owner

    @owner.setter
    def owner(self, name):                        # validated on every assignment
        name = name.strip()
        if not name:
            raise ValueError("owner name cannot be empty")
        self._owner = name.title()

    @property
    def balance(self):                            # read-only
        return self._balance

    @property
    def history(self):                            # a copy the caller cannot change
        return tuple(self._history)

    def _apply(self, kind, amount):
        self._balance += amount if kind != "withdraw" else -amount
        self._history.append(Transaction(kind, amount))

    def deposit(self, amount):
        self._check(amount)
        self._apply("deposit", amount)

    def withdraw(self, amount):
        self._check(amount)
        if amount &gt; self._balance:
            raise ValueError("Not enough money")
        self._apply("withdraw", amount)

class StudentAccount(BankAccount):
    __slots__ = ()                                # keep the child dict-free too
    min_opening = 0

asha = BankAccount.from_csv("  asha , 1000")
asha.deposit(200)
asha.withdraw(300)
dev = StudentAccount.from_csv("dev, 0")
print(asha.owner, asha.balance, asha.bank_name)
for t in asha.history:
    print("  ", t)
print(type(dev).__name__, dev.owner, dev.balance)

try:
    asha.withdraw(5000)                           # the rule still holds
except ValueError as e:
    print("ValueError:", e)
try:
    asha.balnce = 0                               # a typo, caught by __slots__
except AttributeError as e:
    print("AttributeError:", e)</div>
  <div class="fx" data-lang="text">Asha 900 Python Bank
   Transaction(kind='open', amount=1000)
   Transaction(kind='deposit', amount=200)
   Transaction(kind='withdraw', amount=300)
StudentAccount Dev 0
ValueError: Not enough money
AttributeError: 'BankAccount' object has no attribute 'balnce' and no __dict__ for setting new attributes</div>
  <p>Read it from the top. <code>Transaction</code> is a frozen, slotted dataclass: each record is small and can never be edited. <code>BankAccount</code> declares <code>__slots__</code> for its three internal attributes, so a misspelled name such as <code>balnce</code> is refused, as the last line of output shows. <code>bank_name</code> and <code>min_opening</code> are class attributes shared by all accounts, while each account's owner, balance and history are created in <code>__init__</code>, the history as a fresh list per account. <code>from_csv</code> is an alternative constructor that returns <code>cls(...)</code>, so <code>StudentAccount.from_csv("dev, 0")</code> produced a <code>StudentAccount</code> that obeyed the student rule of a zero minimum. <code>_check</code> is a static helper, because checking an amount needs neither the account nor the class. <code>owner</code> is a property with a setter, so the messy input <code>"  asha "</code> became <code>Asha</code>. <code>balance</code> is read-only, and <code>history</code> returns a tuple copy, so callers can read the records but cannot append to or remove from the real list. Asha opened with 1000, deposited 200 and withdrew 300, ending at 900, and the attempt to withdraw 5000 was still refused by the rule from <a class="xref" data-note="py_oop">OOP Concepts in Python</a>. Note also <code>__slots__ = ()</code> in <code>StudentAccount</code>, which keeps the child free of a dictionary, as the previous section explained.</p>

  <h2 id="pc-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The mutable default argument is a close relative of the shared class-attribute list, and it catches experienced programmers too. Default values in a function's parameter list are created once, when the <code>def</code> line runs, not each time the function is called (see <a class="xref" data-note="py_functions">Functions</a>). So a default list in <code>__init__</code> is shared by every object that relies on the default:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, history=[]):     # BUG: the default list is made ONCE
        self.owner = owner
        self.history = history

asha, ben = BankAccount("Asha"), BankAccount("Ben")
asha.history.append("deposit 200")
print(ben.history, asha.history is ben.history)

class BankAccountFixed:
    def __init__(self, owner, history=None):   # None means "make me a new list"
        self.owner = owner
        self.history = history if history is not None else []

asha, ben = BankAccountFixed("Asha"), BankAccountFixed("Ben")
asha.history.append("deposit 200")
print(ben.history)</div>
  <div class="fx" data-lang="text">['deposit 200'] True
[]</div>
  <p>Asha's deposit appeared in Ben's history, and <code>asha.history is ben.history</code> is <code>True</code>, because both accounts received the same default list. The fix is to use <code>None</code> as the default and create a new list inside the method when no list was passed. In a dataclass, <code>field(default_factory=list)</code> does the same job.</p>
  <p>A property whose getter or setter uses its own name instead of the underscore name recurses forever, as we saw with <code>RecursionError</code> in the properties section. Whenever you write <code>@property def balance</code>, the body should read and write <code>self._balance</code>.</p>
  <p>Changing a shared counter through <code>self</code> (<code>self.accounts_opened += 1</code>) creates an instance attribute on each object and leaves the class value untouched; change it through the class. Naming the class inside a class method (<code>return BankAccount(...)</code>) makes every subclass get a parent object back; return <code>cls(...)</code>. And creating attributes outside <code>__init__</code> leaves objects with different shapes, so an attribute that "usually" exists raises <code>AttributeError</code> on the objects where the creating method never ran.</p>
  <p>Finally, two misunderstandings about dataclasses. The type annotations are not checked: <code>Transaction("deposit", "two hundred")</code> is accepted. And an ordinary (not frozen) dataclass is not hashable, because it defines equality by value while its fields can change; trying to put one in a set raises <code>TypeError: unhashable type</code>. Use <code>frozen=True</code> when the objects must go into sets or be used as dictionary keys.</p>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Instance attribute</b>: stored on one object (<code>self.x = ...</code>), visible in <code>vars(obj)</code>.</li>
    <li><b>Class attribute</b>: written in the class body, stored once on the class, shared by all objects.</li>
    <li><b>Shadowing</b>: an instance attribute hiding a class attribute of the same name, for that object only.</li>
    <li><b>Constructor</b> (<code>__new__</code>) creates the empty object; <b>initialiser</b> (<code>__init__</code>) fills it and must return <code>None</code>.</li>
    <li><b>Bound method</b>: <code>obj.method</code>, the function plus the object (<code>__func__</code>, <code>__self__</code>).</li>
    <li><b>Class method</b>: <code>@classmethod</code>, receives the class as <code>cls</code>. <b>Static method</b>: <code>@staticmethod</code>, receives nothing automatically.</li>
    <li><b>Alternative constructor</b>: a class method that builds an object from another form of data and returns <code>cls(...)</code>.</li>
    <li><b>Property</b>: getter (and optional setter) run on attribute read/assignment; a <b>data descriptor</b>, so it wins over the object's own dictionary.</li>
    <li><b>Dataclass</b>: <code>@dataclass</code> writes <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> from annotated fields.</li>
    <li><b><code>__slots__</code></b>: fixed list of attribute names; no per-object <code>__dict__</code>.</li>
  </ul>
  <h3>Attribute lookup</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Where Python looks or writes</th></tr>
    <tr><td>read <code>obj.x</code></td><td>data descriptors (properties) on the class → <code>vars(obj)</code> → class → parents → <code>AttributeError</code></td></tr>
    <tr><td>write <code>obj.x = v</code></td><td>the property's setter if <code>x</code> is a property, otherwise always <code>vars(obj)</code></td></tr>
    <tr><td><code>obj.lst.append(v)</code></td><td>a read: changes whatever list the search finds (possibly the class's)</td></tr>
  </table>
  <h3>Three kinds of method</h3>
  <table class="tbl">
    <tr><th>Kind</th><th>Receives</th><th>Use for</th><th>Example</th></tr>
    <tr><td>instance</td><td><code>self</code></td><td>work on one object's data</td><td><code>deposit</code></td></tr>
    <tr><td><code>@classmethod</code></td><td><code>cls</code></td><td>class-wide settings, alternative constructors</td><td><code>from_csv</code>, <code>set_min_opening</code></td></tr>
    <tr><td><code>@staticmethod</code></td><td>nothing</td><td>helper that belongs with the class</td><td><code>is_valid_amount</code></td></tr>
  </table>
  <h3>Dataclass options</h3>
  <table class="tbl">
    <tr><th>Option</th><th>Effect</th></tr>
    <tr><td><code>frozen=True</code></td><td>fields read-only (<code>FrozenInstanceError</code>); objects hashable</td></tr>
    <tr><td><code>order=True</code></td><td>adds <code>&lt; &lt;= &gt; &gt;=</code>, comparing fields like a tuple</td></tr>
    <tr><td><code>slots=True</code></td><td>generates <code>__slots__</code></td></tr>
    <tr><td><code>field(default_factory=list)</code></td><td>fresh mutable default per object</td></tr>
    <tr><td><code>field(compare=False)</code></td><td>field ignored by <code>==</code>, ordering and hashing</td></tr>
    <tr><td><code>__post_init__</code></td><td>runs after the generated <code>__init__</code>; put checks here</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from dataclasses import dataclass, field

class BankAccount:
    __slots__ = ("_owner", "_balance")    # fixed attributes
    min_opening = 100                     # class attribute

    def __init__(self, owner, balance):   # initialiser
        self.owner = owner                # goes through the setter
        self._balance = balance

    @classmethod
    def from_csv(cls, line):              # alternative constructor
        owner, bal = line.split(",")
        return cls(owner.strip(), int(bal))

    @staticmethod
    def is_valid(amount):                 # helper
        return amount &gt; 0

    @property
    def owner(self):                      # getter
        return self._owner

    @owner.setter
    def owner(self, name):                # setter with a check
        if not name.strip():
            raise ValueError("empty name")
        self._owner = name.strip()

@dataclass(frozen=True)
class Transaction:
    kind: str
    amount: int
    note: str = field(default="", compare=False)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>A list or dict in the class body is shared by all objects; create it in <code>__init__</code>.</li>
    <li><code>self.count += 1</code> creates an instance attribute; use <code>ClassName.count += 1</code>.</li>
    <li><code>def __init__(self, history=[])</code> shares one list; default to <code>None</code>.</li>
    <li>Class methods must return <code>cls(...)</code>, not the class name.</li>
    <li>Property bodies must use <code>self._name</code>, or they recurse forever.</li>
    <li>Dataclass annotations are not checked; plain dataclasses are unhashable.</li>
    <li>A subclass without <code>__slots__</code> gets a <code>__dict__</code> back.</li>
  </ul>

  <h2 id="pc-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class attribute and an instance attribute?</summary><div class="qa-body">An instance attribute is set on <code>self</code>, usually in <code>__init__</code>, and each object has its own copy in its <code>__dict__</code>. A class attribute is written in the class body and stored once on the class, so all objects share it. Reading <code>obj.x</code> finds an instance attribute first and falls back to the class attribute.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>class A: x = 1</code>; <code>a, b = A(), A()</code>; <code>a.x = 2</code>; <code>A.x = 3</code>; <code>print(a.x, b.x, A.x)</code></summary><div class="qa-body"><code>2 3 3</code>. <code>a.x = 2</code> created an instance attribute on <code>a</code> that shadows the class attribute. <code>b</code> has no attribute of its own, so it reads the class attribute, which was changed to 3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A class has <code>count = 0</code> and <code>__init__</code> does <code>self.count += 1</code>. After creating two objects, what are <code>A.count</code> and <code>a.count</code>?</summary><div class="qa-body"><code>0</code> and <code>1</code>. <code>self.count += 1</code> means <code>self.count = self.count + 1</code>: the read finds the class's 0, but the assignment creates an instance attribute on each object. The class value never changes. Use <code>A.count += 1</code> or <code>type(self).count += 1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a list as a class attribute usually a bug?</summary><div class="qa-body">The list is created once, when the class body runs, and every object that reads it through <code>self</code> reaches that same list. Appending through one object changes the shared list, so the change appears in all objects. Per-object lists must be created in <code>__init__</code> with <code>self.items = []</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__init__</code> a constructor? How does it differ from <code>__new__</code>?</summary><div class="qa-body"><code>__new__</code> is the actual constructor: it creates and returns a new, empty object. <code>__init__</code> is the initialiser: it receives that object and sets its attributes, and must return <code>None</code>. Calling <code>C(args)</code> runs <code>__new__</code> then <code>__init__</code>. You override <code>__new__</code> mainly for subclasses of immutable types (<code>int</code>, <code>str</code>, <code>tuple</code>) or to control which object is returned, as in a singleton.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if <code>__init__</code> returns a value?</summary><div class="qa-body">Python raises <code>TypeError: __init__() should return None, not 'int'</code>. The result of calling a class is the object made by <code>__new__</code>, so a return value from <code>__init__</code> has no meaning and is rejected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a bound method?</summary><div class="qa-body">The object you get from <code>obj.method</code> without calling it. It packages the function (<code>__func__</code>) with the object (<code>__self__</code>), so calling it passes the object as the first argument automatically. That is how <code>asha.deposit(200)</code> becomes <code>BankAccount.deposit(asha, 200)</code>, and why a method can be stored in a variable and called later.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain instance, class and static methods and when to use each.</summary><div class="qa-body">An instance method receives the object as <code>self</code> and works on its data. A class method (<code>@classmethod</code>) receives the class as <code>cls</code>; use it for alternative constructors and class-wide settings. A static method (<code>@staticmethod</code>) receives nothing automatically; use it for a helper that belongs with the class but needs neither the object nor the class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an alternative constructor, and why should it return <code>cls(...)</code>?</summary><div class="qa-body">A class method that builds an object from a different form of input, such as <code>from_csv("Asha, 1000")</code>, <code>dict.fromkeys</code> or <code>datetime.fromisoformat</code>. It should return <code>cls(...)</code> because <code>cls</code> is whichever class the method was called on, so subclasses get an object of their own type with their own rules. Naming the class directly returns a parent object for every subclass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python support constructor overloading?</summary><div class="qa-body">No. A class has one <code>__init__</code>; a second definition simply replaces the first. Python handles different inputs with default arguments, keyword arguments, or alternative constructors written as class methods.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>@property</code>, and why is it preferred over getter and setter methods?</summary><div class="qa-body">A property makes method calls look like attribute access: the getter runs on <code>obj.x</code> and the setter, if defined, on <code>obj.x = v</code>. It lets you add validation, read-only access or computed values later without changing any calling code, so you can start with plain attributes. Java-style <code>get_x()</code>/<code>set_x()</code> methods force that decision up front and make the calling code noisier.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a property take priority over an instance attribute of the same name?</summary><div class="qa-body">A property is a data descriptor, a class attribute that defines behaviour for both getting and setting. Python's attribute lookup checks data descriptors on the class before the object's <code>__dict__</code>, so both reading and assigning go through the property. Ordinary methods define only getting, which is why an instance attribute can shadow a method but not a property.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does this property cause a <code>RecursionError</code>? <code>@property def balance(self): return self.balance</code></summary><div class="qa-body">Reading <code>self.balance</code> inside the getter calls the getter again, which reads <code>self.balance</code> again, forever. The value must be stored under a different name, conventionally <code>self._balance</code>, and the getter and setter must use that name.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@dataclass</code> generate, and what do <code>frozen</code> and <code>order</code> add?</summary><div class="qa-body">It generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> from the annotated fields. <code>frozen=True</code> makes fields read-only after creation (assignment raises <code>FrozenInstanceError</code>) and makes objects hashable. <code>order=True</code> adds <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>, comparing the fields in order like tuples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you give a dataclass a list field, and where do you put validation?</summary><div class="qa-body">Use <code>field(default_factory=list)</code>, which calls <code>list()</code> for each new object; a bare <code>= []</code> is refused with a <code>ValueError</code>. Validation goes in <code>__post_init__</code>, which runs right after the generated <code>__init__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a regular dataclass hashable? Are its types checked?</summary><div class="qa-body">Neither. A dataclass with the default <code>eq=True</code> and <code>frozen=False</code> sets <code>__hash__</code> to <code>None</code>, because an object that compares by value but can change would break sets and dicts; use <code>frozen=True</code> to make it hashable. Type annotations are not checked at run time, so wrong types are accepted; use <code>__post_init__</code> checks or pydantic for validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Dataclass vs NamedTuple vs pydantic model?</summary><div class="qa-body">A <code>NamedTuple</code> is an immutable tuple with named fields: lightweight, indexable and unpackable. A dataclass is a normal class with generated methods: mutable by default, can have methods, no run-time type checks. A pydantic model validates and converts data at run time and serialises to JSON, which makes it the right choice for data from users, files and APIs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__slots__</code>, and what are its trade-offs?</summary><div class="qa-body"><code>__slots__</code> lists the only attribute names a class's objects can have, and Python stores them in fixed places instead of a per-object <code>__dict__</code>. Objects use noticeably less memory and misspelled attributes raise <code>AttributeError</code>. The costs: no new attributes at run time, no class-level defaults with slot names, and every class in a hierarchy must declare <code>__slots__</code> (or a subclass gets a <code>__dict__</code> back).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a plain class, a dataclass, or a class with properties?</summary><div class="qa-body">A dataclass suits objects that are mainly named data, such as records, configuration and results. A hand-written class with properties suits objects with rules that must always hold, like an account whose balance may only change through deposits and withdrawals. The two can be combined, but a public dataclass field cannot protect an invariant on its own.</div></details>
</main>
`
});
