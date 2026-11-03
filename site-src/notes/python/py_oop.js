// notes/python/py_oop.js — OOP Concepts in Python
Object.assign(TOPIC_CONTENT, {
  "py_oop": `<main>
<h1>OOP Concepts in Python</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>OOP Concepts in Python</span></div>
  <p class="lead">Object-oriented programming, or OOP, is a way of organising a program around the "things" it deals with. A banking app deals with accounts, a shop deals with products and orders, a game deals with players and enemies. In OOP each of these things becomes an <strong>object</strong> that carries its own information and knows how to do its own jobs. To understand why anyone would organise code this way, we will start by writing a small bank program without OOP, watch where it goes wrong, and then fix it one idea at a time. The same bank program runs through the whole page, so every new idea is added to code you have already seen.</p>

  <h2 id="oo-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">OOP in Python</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why OOP</div>
        <ul>
          <li>Without OOP, data (dicts) and rules (functions) are separate</li>
          <li>Any code can change the data and skip the rules</li>
          <li>OOP keeps each piece of data together with its rules</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Class and object</div>
        <ul>
          <li><b>Class</b>: the blueprint; <b>object</b>: one thing built from it</li>
          <li><b>Attributes</b>: an object's data; <b>methods</b>: its actions</li>
          <li><code>__init__</code> sets up each new object; <code>self</code> is that object</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The four pillars</div>
        <ul>
          <li><b>Encapsulation</b>: data changes only through the object's methods</li>
          <li><b>Abstraction</b>: a simple outside, hidden details inside</li>
          <li><b>Inheritance</b>: a new class built on an existing one ("is a")</li>
          <li><b>Polymorphism</b>: one call, each object responds its own way</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python's style</div>
        <ul>
          <li><code>_name</code> = private by agreement; <code>__name</code> = name mangling</li>
          <li><code>@property</code> for controlled access</li>
          <li><code>ABC</code> + <code>@abstractmethod</code> for required methods</li>
          <li>Duck typing: having the method is enough</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="oo-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why OOP Exists</span><span class="rm-sub">a bank program without OOP, and where it breaks</span></div></div>
      <div class="rm-item rm-done" data-target="oo-class"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Classes and Objects</span><span class="rm-sub">blueprints, attributes, __init__, self, methods</span></div></div>
      <div class="rm-item rm-done" data-target="oo-pillars"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Four Pillars of OOP</span><span class="rm-sub">what the pillars are and why there are four</span></div></div>
      <div class="rm-item rm-done" data-target="oo-encap"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Encapsulation</span><span class="rm-sub">protecting an object's data</span></div></div>
      <div class="rm-item rm-done" data-target="oo-abstr"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Abstraction</span><span class="rm-sub">a simple outside over a complex inside</span></div></div>
      <div class="rm-item rm-done" data-target="oo-inherit"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Inheritance</span><span class="rm-sub">building new classes from existing ones</span></div></div>
      <div class="rm-item rm-done" data-target="oo-poly"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Polymorphism</span><span class="rm-sub">one call, many behaviours</span></div></div>
      <div class="rm-item rm-done" data-target="oo-all"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How the Four Pillars Work Together</span><span class="rm-sub">the finished bank program</span></div></div>
      <div class="rm-item rm-done" data-target="oo-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">self, shared lists, wrong inheritance</span></div></div>
      <div class="rm-item rm-done" data-target="oo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, syntax, pillars table</span></div></div>
      <div class="rm-item rm-done" data-target="oo-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on OOP</span></div></div>
    </div>
  </div>

  <h2 id="oo-why"><span class="num">01</span>Why OOP Exists</h2>
  <p>Imagine you are asked to write the software for a very small bank. Every customer has a name and a balance, and the bank has two rules: a customer can put money in, and a customer can never take out more money than they have. That is the whole job. Let us see how far we get with the Python you already know.</p>
  <p>The most obvious approach is to keep a couple of variables for each customer:</p>
  <div class="fx" data-lang="py"># Two customers, plain variables
asha_name, asha_balance = "Asha", 1000
ben_name, ben_balance = "Ben", 500

asha_balance = asha_balance + 200      # Asha deposits 200
ben_balance = ben_balance - 100        # Ben withdraws 100
print(asha_name, asha_balance)
print(ben_name, ben_balance)</div>
  <div class="fx" data-lang="text">Asha 1200
Ben 400</div>
  <p>This works, but think about what happens when the bank has two thousand customers. You would need four thousand variables with made-up names, and every line of code that touches a balance would have to remember the "no overdrawing" rule on its own. Nothing ties Asha's name to Asha's balance except the fact that we gave them similar names.</p>
  <p>A better approach is to keep each customer's information together in a dictionary, and to write the two rules once, as functions, so nobody has to repeat them:</p>
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
  <p>This is a real improvement. Each customer is now one value, and as long as everyone calls <code>withdraw()</code>, the rule protects them: Ben's attempt to take out 800 from 500 was refused. But look at the last four lines. One line subtracts 800 from Ben's balance directly, without calling <code>withdraw()</code>, and his balance quietly becomes −300. Another line misspells "balance" as "balanse", and Python simply adds a new, useless key to Asha's dictionary. Neither line produces any error.</p>
  <p>The reason is worth understanding, because it is the reason OOP exists. In this program the <em>data</em> (the dictionaries) and the <em>rules</em> (the functions) are completely separate things. The functions sit in one place, the dictionaries sit somewhere else, and nothing forces the code to go through the functions before touching the data. In a small script you can be careful. In a real application with thousands of lines written by many people, someone will eventually change the data directly, and the rules will be broken without anyone noticing.</p>
  <p>Think of a bank that keeps every customer's balance written on loose sheets of paper on a table in the lobby, with the rulebook kept in a back office. Anybody walking past could pick up a pen and change a number. Real banks do not work like that. They keep each customer's record locked away, and the only way to change it is to ask a cashier, who checks the rules first. The record and the person who enforces its rules are kept together.</p>
  <p>That is exactly the idea of <strong>object-oriented programming</strong>: instead of keeping data in one place and the functions that work on it in another, we bundle them together into a single unit called an <strong>object</strong>. An account object holds its own balance <em>and</em> its own deposit and withdraw rules. Code that wants to change the balance has to ask the object, and the object applies its rules. The rest of this page shows how to build such objects in Python, and then the four main ideas that make this way of programming powerful.</p>

  <h2 id="oo-class"><span class="num">02</span>Classes and Objects</h2>
  <p>Before we can create account objects, we need a way to describe what an account <em>is</em>: what information every account holds and what every account can do. That description is called a <strong>class</strong>. An <strong>object</strong> is one actual account created from that description.</p>
  <p>The easiest way to understand the difference is to think about building houses. An architect draws a single blueprint. The blueprint is not a house; you cannot live in it. But a builder can use it to build as many houses as needed. Every house built from the same blueprint has the same layout, because it came from the same plan. Yet each house is its own separate building, with its own owner and its own paint colour, and painting one house blue does not change the house next door. A class is the blueprint, and objects are the houses. The class <code>BankAccount</code> describes accounts in general; Asha's account and Ben's account are two objects built from it. You will also hear objects called <strong>instances</strong>; "Asha's account is an instance of <code>BankAccount</code>" simply means it was built from that class.</p>
  <p>In Python we write a class with the keyword <code>class</code>, and we create an object by calling the class as if it were a function. Let us start with the emptiest class possible:</p>
  <div class="fx" data-lang="py">class BankAccount:        # the blueprint
    pass

a = BankAccount()         # build object 1
b = BankAccount()         # build object 2
print(type(a))
print(a is b)             # two separate objects</div>
  <div class="fx" data-lang="text">&lt;class '__main__.BankAccount'&gt;
False</div>
  <p>The class is empty, but it already does something useful: each call to <code>BankAccount()</code> creates a brand-new object. <code>type(a)</code> confirms that <code>a</code> is a <code>BankAccount</code>, and <code>a is b</code> is <code>False</code> because <code>a</code> and <code>b</code> are two separate objects, just like two separate houses. (By convention class names are written in CapitalisedWords, while variables and functions use lowercase_with_underscores.)</p>
  <p>An account is useless without its information, so the next step is to give every account an owner and a balance at the moment it is created. Pieces of information stored inside an object are called <strong>attributes</strong>. To set them up automatically, Python lets us write a special method named <code>__init__</code> (two underscores on each side; Python's special names all look like this). Python runs <code>__init__</code> by itself every time a new object is created, which is why it is usually called the <strong>constructor</strong>.</p>
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
  <p>It is worth slowing down to see exactly what happens on the line <code>asha = BankAccount("Asha", 1000)</code>. First Python creates a new, empty <code>BankAccount</code> object. Then it calls <code>__init__</code>, passing that new object as the first argument, followed by <code>"Asha"</code> and <code>1000</code>. Inside <code>__init__</code>, the new object arrives under the name <code>self</code>, so <code>self.owner = owner</code> means "store the value <code>"Asha"</code> as an attribute called <code>owner</code> on this new object". Finally Python hands the finished object back, and we give it the name <code>asha</code>. Ben's object goes through the same steps with his own values, which is why the two accounts end up with different owners and balances even though they came from the same class.</p>
  <p>So what is <code>self</code>? It is simply the object that is being worked on at that moment. When <code>__init__</code> runs for Asha's account, <code>self</code> is Asha's account; when it runs for Ben's, <code>self</code> is Ben's. Writing <code>self.balance</code> rather than just <code>balance</code> is how we say "the balance belonging to this particular object".</p>
  <p>Data alone is not enough; we also want each account to be able to do things. A function written inside a class is called a <strong>method</strong>, and it describes an action that every object of that class can perform. Here we move the deposit and withdraw rules from the dictionary version into the class itself:</p>
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
  <p>Now the data and the rules finally live in the same place. <code>asha.deposit(200)</code> reads almost like English, "Asha's account, deposit 200", and the withdraw rule refused Ben's 800 just as before. We wrote <code>deposit</code> once, inside the class, and it works for every account ever created from it.</p>
  <p>The last two lines answer a question that confuses many beginners: why does every method have <code>self</code> as its first parameter when we never pass it ourselves? The answer is that Python passes it for you. When you write <code>ben.deposit(50)</code>, Python turns it into <code>BankAccount.deposit(ben, 50)</code>: it looks up the <code>deposit</code> method in the class and passes the object before the dot as the first argument. That first argument is <code>self</code>. Both lines in the example do exactly the same thing, and Ben ends at 550. This is how one method, written once, can update whichever account it is called on.</p>
  <p>To sum up the vocabulary: a <strong>class</strong> is a blueprint describing what data and actions its objects will have; an <strong>object</strong> (or instance) is one thing built from that class with its own copy of the data; <strong>attributes</strong> are the data stored on an object; <strong>methods</strong> are the functions defined in the class that objects can perform; <code>__init__</code> is the method that sets up each new object; and <code>self</code> is the object a method is currently working on.</p>
  <p>We have now solved half of the original problem: the rules are attached to the data. But we have not yet <em>prevented</em> anyone from going around the rules, because nothing stops a line like <code>ben.balance = -300</code>. Fixing that is the job of the first of the four pillars.</p>

  <h2 id="oo-pillars"><span class="num">03</span>The Four Pillars of OOP</h2>
  <p>Classes and objects are the building blocks of OOP, but simply putting code inside classes does not automatically make a program well designed. Over the years programmers noticed that good object-oriented code relies on four main ideas, and these became known as the <strong>four pillars of OOP</strong>: <strong>encapsulation</strong>, <strong>abstraction</strong>, <strong>inheritance</strong> and <strong>polymorphism</strong>. The word "pillar" is just a metaphor: like the columns that hold up a building, these are the ideas that the whole approach rests on.</p>
  <p>Each pillar exists because it solves a specific problem that comes up again and again in real programs. Encapsulation solves the problem we just saw: other code reaching in and changing an object's data in ways that break its rules. Abstraction solves the problem of objects being too complicated to use, by giving them a simple outside and hiding the messy details. Inheritance solves the problem of writing nearly the same class twice, by letting a new class reuse an existing one. Polymorphism solves the problem of code filled with "if it's this type do this, if it's that type do that", by letting different objects respond to the same command in their own way.</p>
  <p>A car is a handy everyday example because it shows all four at once. The engine is sealed under the bonnet, and you change the car's speed only through the accelerator, so you cannot accidentally damage the engine while driving: that is encapsulation. To drive, you only need to know the steering wheel, pedals and gear stick, not how fuel injection works: that is abstraction. An electric car is still a car, with wheels, brakes and steering, plus a battery of its own: that is inheritance. And when you press the accelerator, a petrol car burns fuel while an electric car draws on its battery; the driver does the same thing, but each car responds in its own way: that is polymorphism. Keep this picture in mind as we go through each pillar using the bank.</p>

  <h2 id="oo-encap"><span class="num">04</span>Encapsulation</h2>
  <p>Our <code>BankAccount</code> class has a withdraw rule, but the rule only works if people choose to use it. Here is the problem in code:</p>
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
  <p>The <code>withdraw</code> method correctly refused to take 800, but the very next line set the balance to −300 directly, and the class could do nothing about it. The rule is there, yet it is not enforced. <strong>Encapsulation</strong> is the idea that fixes this: an object should keep its data to itself and allow it to change <em>only</em> through its own methods, so that its rules always run. The name comes from "capsule". A medicine capsule wraps its contents so you take them as a whole and never handle the powder directly; an encapsulated object wraps its data so the outside world can only work with it through the methods the object provides.</p>
  <p>The bank analogy fits perfectly. You are not allowed to walk into the bank's vault and change the number on your account. You go to the cashier, who checks your identity and your balance and only then updates the record. In our class, the balance is the vault, and the <code>deposit</code> and <code>withdraw</code> methods are the cashier.</p>
  <p>Python does encapsulation in two small steps. First, we rename the attribute from <code>balance</code> to <code>_balance</code>. A name that starts with an underscore is a signal every Python programmer understands: "this is internal to the class; don't touch it from outside". Second, we still want people to be able to <em>read</em> the balance, so we add a method called <code>balance</code> and put <code>@property</code> above it. A property is a method that can be used as if it were a plain attribute, without brackets. Because we only define how to read it and not how to set it, any attempt to assign to <code>balance</code> is refused.</p>
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
  <p>Reading the balance works exactly as before (600, after a deposit of 100). Trying to set it directly now raises an error saying the property has no setter. And trying to withdraw 5000 fails with a clear message, because withdraw checks the rule. Every possible way to change the money now goes through a method that applies the rules. A rule that must always stay true about an object, like "the balance never goes below zero", is called an <strong>invariant</strong>, and protecting invariants is the main reason for encapsulation.</p>
  <p>If you have used Java or C++, you might expect a keyword like <code>private</code> that makes an attribute completely unreachable. Python deliberately does not have one. Its philosophy is that programmers are responsible adults: a single leading underscore marks something as private by agreement, and everyone respects that agreement. There is one extra mechanism, called <strong>name mangling</strong>: if a name starts with two underscores, such as <code>__secret</code>, Python quietly renames it inside the class to <code>_ClassName__secret</code>. This mainly exists to stop subclasses from accidentally overwriting each other's attributes, and it is not real protection, as this shows:</p>
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
  <p>The public and single-underscore attributes are both readable. <code>d.__secret</code> fails because the attribute was renamed, but <code>d._Demo__secret</code> reaches it immediately. So in everyday Python, encapsulation means using <code>_name</code> for internal data and properties or methods for controlled access. (Properties with setters, which let you validate new values, are covered in <a class="xref" data-note="py_classes">Classes &amp; Objects</a>.)</p>

  <h2 id="oo-abstr"><span class="num">05</span>Abstraction</h2>
  <p>Encapsulation protects an object's data. <strong>Abstraction</strong> is about something different: making an object easy to use by showing only what the user needs to know and hiding how the work is actually done. When an object is well abstracted, the person using it thinks in terms of what they want ("transfer 300 to Ben") rather than the steps required ("check the amount is positive, subtract from one balance, add to the other, write a log entry").</p>
  <p>An ATM is the classic example. Its screen offers a handful of simple options: withdraw, deposit, check balance. When you choose "withdraw", the machine verifies your card and PIN, contacts the bank's servers, checks your balance, counts out notes and records the transaction. None of that is visible to you, and you do not need to understand any of it to get your money. The few buttons are the abstraction; the complicated machinery behind them is hidden.</p>
  <p>In code, abstraction mostly comes down to designing a small number of clear public methods and keeping the helper steps internal. Below, the bank adds a <code>transfer</code> method. Behind it are two helper methods, <code>_check_amount</code> and <code>_log</code>, which start with an underscore because they are part of the internal machinery, not something callers should use:</p>
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
  <p>The person using this class writes one line, <code>asha.transfer(ben, 300)</code>, and both balances update correctly. They never call <code>_check_amount</code> or <code>_log</code> and do not need to know they exist. This also makes the code easier to change: if the bank later decides to log transfers to a database instead of printing them, only <code>_log</code> changes, and every piece of code that calls <code>transfer</code> keeps working without modification.</p>
  <p>Abstraction has a second, more formal side. Sometimes you want to describe <em>what</em> a whole family of classes must be able to do, without saying <em>how</em>, because each member of the family does it differently. For example, the bank might decide that every kind of account must have a <code>monthly_charge</code> method, while savings and current accounts calculate that charge differently. An <strong>abstract class</strong> is a class written for exactly this purpose. It lists the methods every subclass must provide, but it is incomplete on its own, so you cannot create objects from it directly. In Python you build one by inheriting from <code>ABC</code> (short for Abstract Base Class) and marking the required methods with <code>@abstractmethod</code>:</p>
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
  <p><code>Account</code> acts as a contract that says "anything that calls itself an account must have a <code>monthly_charge</code> method". <code>SavingsAccount</code> fulfils the contract, so it can be created and used. Python refuses to create an <code>Account</code> directly, because it is only a description, and it also refuses to create <code>Broken</code>, which claims to be an account but forgot to write the required method. The benefit is that the mistake shows up immediately when the object is created, rather than weeks later when month-end processing tries to call a method that does not exist. (The line <code>class SavingsAccount(Account):</code> uses inheritance, the next pillar; for now just read it as "a savings account is a kind of account".)</p>
  <p>Because encapsulation and abstraction both involve "hiding" something, they are easy to confuse, and interviewers often ask about the difference. Encapsulation hides an object's <em>data</em> in order to <em>protect</em> it, so that the object's rules cannot be bypassed; it answers the question "who is allowed to change this?". Abstraction hides an object's <em>complexity</em> in order to make it <em>simple to use</em>; it answers the question "what does someone need to know to use this?". The bank vault and cashier are encapsulation; the ATM's few buttons are abstraction. A well-designed class usually does both.</p>

  <h2 id="oo-inherit"><span class="num">06</span>Inheritance</h2>
  <p>Now the bank wants to offer a savings account. A savings account is everything a normal account is, with an owner, a balance, deposits and withdrawals, plus one extra feature: it earns interest. One option is to copy the whole <code>BankAccount</code> class, rename it, and add an interest method. That works today, but it creates a maintenance problem: the two classes now contain the same deposit and withdraw code, so every bug fix and every new rule has to be made in two places, and sooner or later someone will forget one of them.</p>
  <p><strong>Inheritance</strong> solves this by letting a new class be built on top of an existing one. The new class, called the <strong>child class</strong> (or subclass), automatically receives all the attributes and methods of the existing class, called the <strong>parent class</strong> (or base class, or superclass). The child then only needs to add what is new or change what is different. The word comes from the way children inherit features from their parents, such as eye colour, while still having features of their own.</p>
  <p>A useful test for whether inheritance makes sense is the phrase "is a". A savings account <em>is a</em> bank account. An electric car <em>is a</em> car. If the sentence sounds right, inheritance is usually appropriate; if it does not, it probably is not.</p>
  <p>In Python you make a child class by writing the parent's name in brackets after the new class name. In the code below, <code>BankAccount</code> is the encapsulated version from the encapsulation section, with <code>_balance</code>, the <code>balance</code> property, <code>deposit</code> and <code>withdraw</code>:</p>
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
  <p>Notice that <code>SavingsAccount</code> never defines a <code>deposit</code> method, yet <code>s.deposit(500)</code> works. When Python looks for a method on an object, it first checks the object's own class; if the method is not there, it checks the parent class, and so on up the family. <code>deposit</code> was found in <code>BankAccount</code>. The only new code is the <code>rate</code> attribute and the <code>add_interest</code> method. After depositing 500 and adding 4% interest, Chen's balance is 1560.</p>
  <p>The line <code>super().__init__(owner, balance)</code> deserves attention. The child has its own <code>__init__</code> because it needs an extra piece of data, the interest rate. But the parent already knows how to set up the owner and balance, so instead of repeating that code, the child calls the parent's <code>__init__</code> through <code>super()</code>, which means "the parent class". The child then adds its own attribute. Finally, <code>isinstance(s, BankAccount)</code> is <code>True</code>: a savings account genuinely is a bank account, so it can be used anywhere the program expects a bank account.</p>
  <p>Inheritance is not only about adding things; a child can also change how an inherited method behaves. Suppose the bank offers a current account that allows customers to go below zero, up to an agreed overdraft limit. Its withdraw rule must be different from the normal one. If the child class defines a method with the same name as one in the parent, the child's version is used instead. This is called <strong>method overriding</strong>:</p>
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
  <p>A normal account would refuse to take 1200 out of a balance of 500. The current account uses its own <code>withdraw</code>, which allows the balance to drop to −700 because that is within the 1000 overdraft. Everything else, including the owner, deposit and the balance property, is still inherited unchanged from <code>BankAccount</code>.</p>
  <p>Inheritance is powerful, but it is also easy to overuse. The "is a" test matters. A customer <em>has</em> a bank account, but a customer <em>is not</em> a bank account, so a <code>Customer</code> class should not inherit from <code>BankAccount</code>. For "has a" relationships the right tool is <strong>composition</strong>: the customer object simply stores an account object as one of its attributes, for example <code>self.account = BankAccount("Asha", 1000)</code>. Composition keeps classes independent of each other and is often the safer choice; inheritance is best reserved for genuine "is a" relationships. (Multiple parents, the method resolution order and design guidelines are covered in <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>.)</p>

  <h2 id="oo-poly"><span class="num">07</span>Polymorphism</h2>
  <p>The word <strong>polymorphism</strong> comes from Greek and means "many forms". In programming it means that the same command can produce different behaviour depending on which object receives it. You have actually been using polymorphism since you started learning Python:</p>
  <div class="fx" data-lang="py">print(len("chai"), len([10, 20, 30]), len({"a": 1}))
print(2 + 3, "chai" + "wala", [1] + [2])</div>
  <div class="fx" data-lang="text">4 3 1
5 chaiwala [1, 2]</div>
  <p>The same <code>len()</code> function works on a string, a list and a dictionary, even though counting characters, items and keys are different jobs. The same <code>+</code> operator adds numbers, joins strings and joins lists. You give the same command, and each type decides for itself what that command means. Polymorphism in your own classes works exactly the same way.</p>
  <p>Think about paying at a shop. You tell the cashier "I'll pay", and what happens next depends on how you pay: a card is tapped, a UPI QR code is scanned, or cash is counted. You do not need a different sentence for each method, and the cashier does not need to know in advance which one you will use. "Pay" is one command with many forms.</p>
  <p>Here is why this matters in the bank. At the end of every month, each account must be updated, and each type of account is updated differently: a basic account stays the same, a savings account earns 4% interest, and a current account is charged a ₹100 fee. Without polymorphism you would write a loop full of checks such as "if this is a savings account, add interest; otherwise if it is a current account, charge a fee", and every time the bank introduced a new account type you would have to find that loop and add another branch. With polymorphism, every account class provides its own method called <code>month_end</code>, and the loop simply asks every account to do its month-end work:</p>
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
  <p>The loop contains no type checks at all. It calls <code>acc.month_end()</code> on each account, and Python runs whichever version belongs to that account's class. Asha's basic account stays at 1000, Chen's savings account grows to 1040, and Dev's current account drops to 900. If the bank adds a new kind of account next year, the developers write one new class with its own <code>month_end</code>, and this loop keeps working without a single change. That is the practical value of polymorphism: code that works with "any account" does not need to know about every kind of account.</p>
  <p>In many languages, polymorphism only works between classes that share a parent. Python is more relaxed. When you call <code>thing.month_end()</code>, Python does not check what class <code>thing</code> belongs to; it only checks whether the object has a <code>month_end</code> method. This style is called <strong>duck typing</strong>, from the saying "if it walks like a duck and quacks like a duck, then it is a duck":</p>
  <div class="fx" data-lang="py">class Wallet:                       # not a BankAccount at all
    def __init__(self, owner):
        self.owner = owner
        self._balance = 50
    def month_end(self):
        print("wallet: nothing to do")

for thing in [Wallet("Esha")]:
    thing.month_end()               # works: Python only needs the method to exist</div>
  <div class="fx" data-lang="text">wallet: nothing to do</div>
  <p><code>Wallet</code> has nothing to do with <code>BankAccount</code>; it does not inherit from it. But it has a <code>month_end</code> method, so the same kind of loop can use it. Duck typing is why so much Python code is flexible: a function that reads from "a file" will happily read from anything that has a <code>read()</code> method.</p>

  <h2 id="oo-all"><span class="num">08</span>How the Four Pillars Work Together</h2>
  <p>We have looked at each pillar on its own, but in real code they are used together, and each one supports the others. Here is the finished bank program. The comments mark which pillar each part represents.</p>
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
  <p>Read the program from top to bottom and you can see the pillars cooperating. <code>Account</code> is the abstraction: it is an abstract class that defines what every account can do (deposit, withdraw, and some kind of month-end processing) without fixing how month-end works. Inside it, the balance is encapsulated: it is stored as <code>_balance</code>, can only change through <code>deposit</code> and <code>withdraw</code>, and is exposed to the outside only as a read-only property. <code>SavingsAccount</code> and <code>CurrentAccount</code> use inheritance to reuse all of that, so each of them only contains the few lines that make it different: an interest rate, an overdraft limit, its own month-end rule, and in the current account's case its own withdraw rule. Finally, the loop at the bottom relies on polymorphism: it treats every account in exactly the same way, and each account responds correctly. Chen's savings account earns interest and reaches 1040; Dev's current account, already at −700 after using the overdraft, is charged the fee and reaches −800; and when Chen tries to take out 5000, the normal withdraw rule refuses, because only current accounts have an overdraft.</p>
  <p>That is the whole of OOP in one program: objects that bundle data with behaviour, protect their own data, offer a simple interface, share code through inheritance, and can be used interchangeably through polymorphism.</p>

  <h2 id="oo-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The most common beginner error in Python classes is forgetting to write <code>self</code> as the first parameter of a method. Because Python always passes the object as the first argument, a method without <code>self</code> receives one more argument than it expects, and the error message can look puzzling at first:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def deposit(amount):            # forgot self
        pass

try:
    BankAccount().deposit(100)
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: BankAccount.deposit() takes 1 positional argument but 2 were given</div>
  <p>"Takes 1 positional argument but 2 were given" means you passed one value (100), Python added the object in front of it, and the method only had room for one. Adding <code>self</code> fixes it.</p>
  <p>A second classic mistake is creating a list directly inside the class body instead of inside <code>__init__</code>. Anything written directly in the class body belongs to the class itself and is shared by every object created from it, so all objects end up appending to the same list:</p>
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
  <p>In the first version, adding "chai" to cart <code>a</code> made it appear in cart <code>b</code> too, because there was only ever one list. In the fixed version, each cart creates its own list in <code>__init__</code>. Data that should belong to each object separately must be created on <code>self</code> inside <code>__init__</code>.</p>
  <p>Beyond these, three design mistakes come up often. Using inheritance for a "has a" relationship, such as making <code>Customer</code> inherit from <code>BankAccount</code>, creates confusing classes; use composition instead. Turning everything into a class is another: if a class has only <code>__init__</code> and a single method, it is usually just a function wearing a costume. And treating a leading underscore as a security feature is a misunderstanding; it is an agreement between programmers, not protection from malicious code.</p>

  <h2 id="oo-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why OOP</h3>
  <ul>
    <li>Without OOP, data (variables, dicts) and rules (functions) are separate, so code can change the data without going through the rules.</li>
    <li><b>OOP</b> bundles data and the functions that work on it into <b>objects</b>, so the object controls how its data changes.</li>
  </ul>
  <h3>Classes and objects</h3>
  <ul>
    <li><b>Class</b>: a blueprint describing the data and actions its objects will have. <code>class BankAccount:</code></li>
    <li><b>Object / instance</b>: one thing built from a class, with its own data. <code>asha = BankAccount("Asha", 1000)</code></li>
    <li><b>Attribute</b>: data stored on an object. <code>self.owner = owner</code></li>
    <li><b>Method</b>: a function defined in a class; an action objects can perform.</li>
    <li><b><code>__init__</code></b> (constructor): runs automatically when an object is created; sets up its attributes.</li>
    <li><b><code>self</code></b>: the object a method is working on. <code>acc.deposit(5)</code> runs as <code>BankAccount.deposit(acc, 5)</code>.</li>
  </ul>
  <h3>The four pillars</h3>
  <table class="tbl">
    <tr><th>Pillar</th><th>What it means</th><th>Problem it solves</th><th>Analogy</th><th>Python</th></tr>
    <tr><td>Encapsulation</td><td>data changes only through the object's methods</td><td>outside code breaking the object's rules</td><td>bank vault + cashier</td><td><code>_balance</code>, <code>@property</code></td></tr>
    <tr><td>Abstraction</td><td>show what is needed, hide how it works</td><td>objects too complex to use</td><td>ATM buttons</td><td>small public interface, <code>_helpers</code>, <code>ABC</code> + <code>@abstractmethod</code></td></tr>
    <tr><td>Inheritance</td><td>child class reuses and extends a parent class</td><td>duplicated code in similar classes</td><td>children inherit traits</td><td><code>class Child(Parent):</code>, <code>super().__init__()</code>, overriding</td></tr>
    <tr><td>Polymorphism</td><td>same call, behaviour depends on the object</td><td>if/elif chains on type</td><td>"pay" by card, UPI or cash</td><td>overriding, duck typing</td></tr>
  </table>
  <h3>Key terms</h3>
  <ul>
    <li><b>Invariant</b>: a rule about an object's data that must always hold (balance ≥ 0).</li>
    <li><b>Abstract class</b>: lists methods subclasses must implement; cannot be instantiated.</li>
    <li><b>Method overriding</b>: a child defines a method with the same name as the parent's; the child's version runs.</li>
    <li><b>Duck typing</b>: Python checks that an object has the method, not what class it is.</li>
    <li><b>Composition</b>: storing one object inside another for "has a" relationships.</li>
    <li><b>Name mangling</b>: <code>__x</code> inside class <code>C</code> becomes <code>_C__x</code>.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Account(ABC):                      # abstract class
    def __init__(self, owner, balance):  # constructor
        self.owner = owner               # public attribute
        self._balance = balance          # internal attribute

    @property
    def balance(self):                   # read-only property
        return self._balance

    @abstractmethod
    def month_end(self): ...             # subclasses must implement

class SavingsAccount(Account):           # inheritance
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance) # parent's setup
        self.rate = rate

    def month_end(self):                 # overriding → polymorphism
        self._balance *= 1 + self.rate</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Missing <code>self</code> → "takes 1 positional argument but 2 were given".</li>
    <li>Mutable data in the class body is shared by all objects; create it in <code>__init__</code>.</li>
    <li>Inheritance for "is a", composition for "has a".</li>
    <li>Encapsulation protects data; abstraction hides complexity.</li>
    <li><code>_x</code> is private only by convention; <code>__x</code> is renamed, not locked.</li>
  </ul>

  <h2 id="oo-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is OOP, and why do we use it?</summary><div class="qa-body">OOP is a way of structuring a program around objects, where each object bundles data (attributes) with the functions that work on it (methods). We use it because it keeps data and its rules together, so the rules cannot be bypassed; it lets us reuse code through inheritance; and it lets one piece of code work with many types of object through polymorphism. It makes large programs easier to organise and change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class and an object?</summary><div class="qa-body">A class is a blueprint that describes what data and behaviour its objects will have. An object is a concrete instance created from that class, with its own copy of the data. <code>BankAccount</code> is a class; <code>asha = BankAccount("Asha", 1000)</code> and <code>ben = BankAccount("Ben", 500)</code> are two objects with separate balances.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four pillars of OOP?</summary><div class="qa-body"><b>Encapsulation</b>: an object keeps its data private and lets it change only through its methods. <b>Abstraction</b>: an object exposes a simple interface and hides how the work is done. <b>Inheritance</b>: a class can be built from an existing class, reusing and extending it. <b>Polymorphism</b>: the same method call behaves differently depending on the object that receives it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>self</code> in Python?</summary><div class="qa-body"><code>self</code> is the first parameter of every instance method and refers to the object the method was called on. Python passes it automatically: <code>acc.deposit(100)</code> becomes <code>BankAccount.deposit(acc, 100)</code>. It is a naming convention rather than a keyword, but it is always used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__init__</code>? Is it a constructor?</summary><div class="qa-body"><code>__init__</code> is called automatically right after a new object is created, and it sets the object's starting attributes. It is commonly called the constructor. Technically the object is created by <code>__new__</code>, and <code>__init__</code> only initialises it, which is why <code>__init__</code> must return <code>None</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between encapsulation and abstraction?</summary><div class="qa-body">Encapsulation hides an object's data to protect it, so changes must go through methods that enforce the rules (the vault and the cashier). Abstraction hides an object's complexity to make it easy to use, by exposing a few clear operations (the ATM's buttons). Encapsulation answers "who can change this?"; abstraction answers "what do I need to know to use this?".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python have private variables?</summary><div class="qa-body">Not enforced ones. A single leading underscore (<code>_balance</code>) marks an attribute as internal by convention, and Python does not stop access. A double leading underscore (<code>__balance</code>) triggers name mangling: Python renames it to <code>_ClassName__balance</code>, which avoids accidental clashes in subclasses but can still be accessed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>@property</code> and why use it?</summary><div class="qa-body">A property is a method that is accessed like an attribute, without brackets. Without a setter it makes the attribute read-only; with a setter (<code>@balance.setter</code>) you can validate new values. It lets you start with a plain attribute and add control later without changing the code that uses it, which is why Python code rarely uses <code>get_x()</code>/<code>set_x()</code> methods.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an abstract class? How do you create one in Python?</summary><div class="qa-body">An abstract class defines methods that subclasses must implement, without implementing them itself, and cannot be instantiated. In Python you inherit from <code>abc.ABC</code> and decorate the required methods with <code>@abstractmethod</code>. Creating the abstract class, or a subclass that has not implemented all abstract methods, raises <code>TypeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is inheritance, and what does <code>super()</code> do?</summary><div class="qa-body">Inheritance lets a child class receive all the attributes and methods of a parent class and then add or change what it needs: <code>class SavingsAccount(BankAccount):</code>. <code>super()</code> gives access to the parent's methods; it is most often used as <code>super().__init__(...)</code> so the parent's setup runs before the child adds its own attributes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is method overriding? Does Python support method overloading?</summary><div class="qa-body">Overriding is when a child class defines a method with the same name as one in its parent, so the child's version runs for child objects. Overloading means several methods with the same name but different parameters; Python does not support it, because a later definition with the same name replaces the earlier one. Python uses default arguments, <code>*args</code>/<code>**kwargs</code> or <code>functools.singledispatch</code> instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is polymorphism? Give an example.</summary><div class="qa-body">Polymorphism means one interface with many implementations: the same call behaves differently depending on the object. Built-in example: <code>len()</code> works on strings, lists and dicts, and <code>+</code> adds numbers but joins strings. In our bank, calling <code>month_end()</code> on each account adds interest for savings accounts and charges a fee for current accounts, with no type checks in the loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is duck typing?</summary><div class="qa-body">Duck typing means Python cares whether an object has the method or attribute being used, not what class it belongs to: "if it walks like a duck and quacks like a duck, it's a duck". Any object with a <code>read()</code> method can be used where a file is expected. It gives polymorphism without requiring a shared parent class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you use composition instead of inheritance?</summary><div class="qa-body">Use inheritance for genuine "is a" relationships (a savings account is a bank account) and composition for "has a" relationships (a customer has an account, so it stores an account object as an attribute). Composition is often preferred because it keeps classes loosely connected and avoids deep, fragile class hierarchies; "favour composition over inheritance" is a common guideline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class attribute and an instance attribute?</summary><div class="qa-body">An instance attribute is set on <code>self</code>, usually in <code>__init__</code>, and each object has its own. A class attribute is written directly in the class body and shared by all instances. A mutable class attribute, such as a list, is a common bug, because every object modifies the same list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python support multiple inheritance? How does it pick which method to use?</summary><div class="qa-body">Yes: <code>class C(A, B):</code>. Python searches for methods in the Method Resolution Order (MRO), calculated by the C3 algorithm: the class itself first, then its parents from left to right, with every class appearing before its own parents and only once. You can inspect it with <code>C.__mro__</code>, and <code>super()</code> follows this order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "everything in Python is an object" mean?</summary><div class="qa-body">Every value in Python, including numbers, strings, functions, modules and even classes, is an object with a type, an identity and attributes. That is why <code>"hi".upper()</code> works: the string is an object with methods. Classes themselves are objects created by <code>type</code>, so they can be passed around like any other value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use a class?</summary><div class="qa-body">When there is no state that needs protecting or keeping together. A class with only <code>__init__</code> and one method is better written as a function. For simple data records a <code>@dataclass</code> or <code>NamedTuple</code> is lighter. Classes are worth it when several operations must work on shared data and keep it consistent.</div></details>
</main>
`
});
