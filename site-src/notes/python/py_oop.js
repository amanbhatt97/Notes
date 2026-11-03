// notes/python/py_oop.js — OOP Concepts in Python
Object.assign(TOPIC_CONTENT, {
  "py_oop": `<main>
<h1>OOP Concepts in Python</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>OOP Concepts in Python</span></div>
  <p class="lead">OOP stands for <strong>Object-Oriented Programming</strong>. It is a way of writing code where you group <b>data</b> and the <b>actions</b> on that data together, in one thing called an <b>object</b>. A bank account is a good example: it has data (the owner's name and the balance) and actions (deposit money, withdraw money). We will use one small bank program all the way through. First we see why we need OOP. Then we learn classes and objects. Then we learn the four main ideas of OOP, called the four pillars.</p>

  <h2 id="oo-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">OOP in Python</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why OOP</div>
        <ul>
          <li>Without OOP, data and rules are kept apart</li>
          <li>So any code can change the data and skip the rules</li>
          <li>OOP keeps data and rules together</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Class and object</div>
        <ul>
          <li><b>Class</b> = blueprint (the design)</li>
          <li><b>Object</b> = a real thing made from the class</li>
          <li><b>Attribute</b> = data inside an object</li>
          <li><b>Method</b> = a function inside a class</li>
          <li><code>__init__</code> = sets up a new object; <code>self</code> = this object</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The four pillars</div>
        <ul>
          <li><b>Encapsulation</b> = protect the data</li>
          <li><b>Abstraction</b> = hide the hard parts</li>
          <li><b>Inheritance</b> = a new class reuses an old one</li>
          <li><b>Polymorphism</b> = same command, different result</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="oo-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why We Need OOP</span><span class="rm-sub">the problem OOP solves</span></div></div>
      <div class="rm-item rm-done" data-target="oo-class"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Classes and Objects</span><span class="rm-sub">blueprint and houses</span></div></div>
      <div class="rm-item rm-done" data-target="oo-init"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Attributes, __init__ and self</span><span class="rm-sub">giving each object its data</span></div></div>
      <div class="rm-item rm-done" data-target="oo-methods"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Methods</span><span class="rm-sub">giving objects actions</span></div></div>
      <div class="rm-item rm-done" data-target="oo-pillars"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Four Pillars of OOP</span><span class="rm-sub">what they are</span></div></div>
      <div class="rm-item rm-done" data-target="oo-encap"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pillar 1: Encapsulation</span><span class="rm-sub">protect the data</span></div></div>
      <div class="rm-item rm-done" data-target="oo-abstr"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pillar 2: Abstraction</span><span class="rm-sub">hide the hard parts</span></div></div>
      <div class="rm-item rm-done" data-target="oo-inherit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Pillar 3: Inheritance</span><span class="rm-sub">reuse an existing class</span></div></div>
      <div class="rm-item rm-done" data-target="oo-poly"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Pillar 4: Polymorphism</span><span class="rm-sub">same command, different result</span></div></div>
      <div class="rm-item rm-done" data-target="oo-all"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">All Four Pillars Together</span><span class="rm-sub">one full program</span></div></div>
      <div class="rm-item rm-done" data-target="oo-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">errors beginners make</span></div></div>
      <div class="rm-item rm-done" data-target="oo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">all definitions on one page</span></div></div>
      <div class="rm-item rm-done" data-target="oo-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">common questions, simple answers</span></div></div>
    </div>
  </div>

  <h2 id="oo-why"><span class="num">01</span>Why We Need OOP</h2>
  <div class="callout def"><span class="label">Definition</span><p><strong>Object-Oriented Programming (OOP)</strong> is a way of writing code where data and the actions on that data are kept together inside <b>objects</b>.</p></div>
  <p>To see why this helps, let us write a small bank program without OOP. Each customer has a name and a balance. There are two rules:</p>
  <ul>
    <li>You can put money in (deposit).</li>
    <li>You cannot take out more money than you have (withdraw).</li>
  </ul>
  <h3>Try 1: plain variables</h3>
  <div class="fx" data-lang="py"># Two customers, plain variables
asha_name, asha_balance = "Asha", 1000
ben_name, ben_balance = "Ben", 500

asha_balance = asha_balance + 200      # Asha deposits 200
ben_balance = ben_balance - 100        # Ben withdraws 100
print(asha_name, asha_balance)
print(ben_name, ben_balance)</div>
  <div class="fx" data-lang="text">Asha 1200
Ben 400</div>
  <p>This works for 2 customers. But for 2,000 customers you would need 4,000 variables. That is not practical.</p>
  <h3>Try 2: a dictionary for each customer, and functions for the rules</h3>
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
  <p>When we use the <code>withdraw()</code> function, the rule works and Ben is protected. But look at the last part:</p>
  <ul>
    <li>One line changes Ben's balance directly. The rule is skipped, and his balance becomes <b>−300</b>.</li>
    <li>One line has a spelling mistake (<code>balanse</code>). Python quietly adds a wrong key.</li>
  </ul>
  <p>Python shows no error for either. The problem is that <b>the data (the dictionary) and the rules (the functions) are separate</b>. Nothing forces the code to use the rules.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Imagine a bank that writes every balance on loose paper lying on a table. Anyone walking past can pick up a pen and change a number. A real bank does not work like that. It locks each record away, and only a cashier who follows the rules can change it. OOP does the same thing for code: it keeps the data and its rules together, locked in one object.</p></div>

  <h2 id="oo-class"><span class="num">02</span>Classes and Objects</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>class</strong> is a blueprint. It describes what data and actions something will have.</p>
    <p>An <strong>object</strong> is a real thing made from a class. One class can make many objects. An object is also called an <strong>instance</strong> of the class.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy: blueprint and houses</span><p>An architect draws one <b>blueprint</b> of a house. Builders use it to build many <b>houses</b>. All the houses have the same design, because they come from the same blueprint. But each house has its own owner and its own paint colour. If you paint one house blue, the other houses do not change.</p></div>
  <table class="tbl"><caption>Blueprint and houses → class and objects</caption>
    <tr><th>House world</th><th>OOP word</th><th>Bank example</th></tr>
    <tr><td>the blueprint</td><td><b>class</b></td><td>the design of a bank account</td></tr>
    <tr><td>one real house</td><td><b>object</b> (instance)</td><td>Asha's account, Ben's account</td></tr>
    <tr><td>building a house</td><td><b>creating an object</b></td><td>opening a new account</td></tr>
    <tr><td>owner, paint colour</td><td><b>attributes</b> (data)</td><td>owner name, balance</td></tr>
    <tr><td>open the door, turn on lights</td><td><b>methods</b> (actions)</td><td>deposit, withdraw</td></tr>
  </table>
  <h3>Your first class</h3>
  <p>We write a class with the word <code>class</code>. We make an object by calling the class with brackets, like a function.</p>
  <div class="fx" data-lang="py">class BankAccount:        # the blueprint
    pass

a = BankAccount()         # build object 1
b = BankAccount()         # build object 2
print(type(a))
print(a is b)             # two separate objects</div>
  <div class="fx" data-lang="text">&lt;class '__main__.BankAccount'&gt;
False</div>
  <ul>
    <li><code>class BankAccount:</code> makes the blueprint. Class names start with a capital letter.</li>
    <li><code>BankAccount()</code> makes one new object.</li>
    <li><code>a</code> and <code>b</code> are two different objects, like two houses from one blueprint. That is why <code>a is b</code> is <code>False</code>.</li>
  </ul>
  <p>Our class is empty for now. Next we give each account its data.</p>

  <h2 id="oo-init"><span class="num">03</span>Attributes, __init__ and self</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>attribute</strong> is a piece of data stored inside an object, like <code>owner</code> or <code>balance</code>.</p>
    <p><strong><code>__init__</code></strong> is a special function inside a class. Python runs it <b>automatically</b> every time a new object is made. We use it to give the new object its starting data. It is often called the <b>constructor</b>.</p>
    <p><strong><code>self</code></strong> means "this object". It is the object that is being set up or used right now.</p>
  </div>
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
  <p>What happens when Python runs <code>BankAccount("Asha", 1000)</code>:</p>
  <ol>
    <li>Python makes a new, empty object.</li>
    <li>Python runs <code>__init__</code>. Inside it, <code>self</code> is that new object, <code>owner</code> is "Asha" and <code>balance</code> is 1000.</li>
    <li><code>self.owner = owner</code> means "store the owner inside <b>this</b> object". Same for balance.</li>
    <li>Python gives the finished object back, and we name it <code>asha</code>.</li>
  </ol>
  <p>Asha's object and Ben's object each have their own owner and balance. Changing one does not change the other, just like painting one house.</p>
  <p>The name <code>__init__</code> has two underscores before and after. Python has many special names like this; they are called "dunder" (double underscore) methods.</p>

  <h2 id="oo-methods"><span class="num">04</span>Methods</h2>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>method</strong> is a function written inside a class. It is an action that every object of that class can do. The first input of a method is always <code>self</code>, the object doing the action.</p></div>
  <p>Now we move the deposit and withdraw rules inside the class. This is the key idea of OOP: the data and its rules now live together.</p>
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
  <ul>
    <li><code>asha.deposit(200)</code> reads like English: "Asha's account, deposit 200".</li>
    <li>We wrote <code>deposit</code> only once, but it works for every account.</li>
  </ul>
  <h3>So what is self, really?</h3>
  <p>Look at the last lines. <code>ben.deposit(50)</code> is a short way of writing <code>BankAccount.deposit(ben, 50)</code>. Python takes the object before the dot (<code>ben</code>) and passes it in as the first input. That first input is <code>self</code>. So inside the method, <code>self.balance</code> means "the balance of the account we called this on".</p>
  <div class="callout trap"><span class="label">Still a problem</span><p>Our class has rules, but someone can still write <code>ben.balance = -300</code> and skip them. The first pillar of OOP, encapsulation, fixes this.</p></div>

  <h2 id="oo-pillars"><span class="num">05</span>The Four Pillars of OOP</h2>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>four pillars of OOP</strong> are the four main ideas that OOP is built on: <b>encapsulation</b>, <b>abstraction</b>, <b>inheritance</b> and <b>polymorphism</b>.</p></div>
  <p>A pillar is a strong column that holds up a building. Classes and objects are the bricks. The four pillars are four smart ways to use those bricks. Each one solves one problem:</p>
  <table class="tbl"><caption>The four pillars in simple words</caption>
    <tr><th>Pillar</th><th>In simple words</th><th>Problem it solves</th></tr>
    <tr><td><b>Encapsulation</b></td><td>Protect the data</td><td>Other code changing data in the wrong way</td></tr>
    <tr><td><b>Abstraction</b></td><td>Hide the hard parts</td><td>Code that is too complicated to use</td></tr>
    <tr><td><b>Inheritance</b></td><td>Reuse an existing class</td><td>Copying the same code again and again</td></tr>
    <tr><td><b>Polymorphism</b></td><td>Same command, different result</td><td>Long if/else chains to handle each type</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy: a car has all four</span>
    <p><b>Encapsulation</b>: the engine is closed under the bonnet. You cannot touch it while driving. You control speed only with the pedal.</p>
    <p><b>Abstraction</b>: to drive, you only need the steering wheel, pedals and gears. You do not need to know how the engine works inside.</p>
    <p><b>Inheritance</b>: an electric car is a car. It gets wheels, brakes and steering from "car", and adds a battery.</p>
    <p><b>Polymorphism</b>: every car has an accelerator pedal. In a petrol car it burns fuel. In an electric car it uses the battery. Same pedal, different result.</p>
  </div>

  <h2 id="oo-encap"><span class="num">06</span>Pillar 1: Encapsulation</h2>
  <div class="callout def"><span class="label">Definition</span><p><strong>Encapsulation</strong> means keeping an object's data safe inside it, so the data can only be changed through the object's own methods.</p></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>At a bank, you cannot walk into the locker room and change your balance. You go to the cashier. The cashier checks the rules first ("Do you have enough money?") and then updates your account. The locker is the data. The cashier is the method.</p></div>
  <p>Here is the problem with our class so far:</p>
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
  <p>We fix it in two steps:</p>
  <ol>
    <li>Rename <code>balance</code> to <code>_balance</code>. In Python, a name starting with <code>_</code> means "private: do not touch this from outside".</li>
    <li>Add <code>@property</code> above a method called <code>balance</code>. This lets people <b>read</b> the balance like normal (<code>ben.balance</code>), but not <b>change</b> it directly.</li>
  </ol>
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
  <ul>
    <li>Reading the balance still works: 600.</li>
    <li>Setting the balance directly now gives an error.</li>
    <li>The only way to change money is <code>deposit</code> or <code>withdraw</code>, and they always check the rules.</li>
  </ul>
  <h3>Is it really private?</h3>
  <p>Not fully. Python trusts programmers. The underscore is a <b>polite sign</b>, not a lock. Python has two signs:</p>
  <ul>
    <li><code>_balance</code> (one underscore): "Private, please don't touch." Python does not stop you.</li>
    <li><code>__balance</code> (two underscores): Python hides it by changing its name to <code>_ClassName__balance</code>. This is called <b>name mangling</b>. It is still reachable if you use the new name.</li>
  </ul>
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

  <h2 id="oo-abstr"><span class="num">07</span>Pillar 2: Abstraction</h2>
  <div class="callout def"><span class="label">Definition</span><p><strong>Abstraction</strong> means showing only what is needed to use something, and hiding how it works inside.</p></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>An ATM has a few simple buttons: Withdraw, Deposit, Check Balance. When you press Withdraw, the machine checks your PIN, talks to the bank, checks your balance and counts the notes. You don't see any of that. You just press one button.</p></div>
  <h3>Hide the steps behind one simple method</h3>
  <p>Here, <code>transfer</code> is the simple "button". The helper methods <code>_check_amount</code> and <code>_log</code> are the hidden parts. They start with <code>_</code> because they are only for use inside the class.</p>
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
  <p>The person using the class writes just one line: <code>asha.transfer(ben, 300)</code>. They don't need to know about checking or logging.</p>
  <h3>Abstract classes: a set of rules for other classes</h3>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>abstract class</strong> is a class that only says <b>what</b> methods must exist, not <b>how</b> they work. You cannot make an object from it directly. Other classes must fill in the missing methods.</p></div>
  <p>In Python we make one using <code>ABC</code> and <code>@abstractmethod</code> from the <code>abc</code> module:</p>
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
  <ul>
    <li><code>Account</code> says: "Every account must have a <code>monthly_charge</code> method."</li>
    <li>You cannot make an <code>Account</code> object directly.</li>
    <li><code>Broken</code> forgot to write <code>monthly_charge</code>, so Python refuses to make it too. The mistake is caught early.</li>
    <li><code>class SavingsAccount(Account):</code> uses inheritance, the next pillar. For now, read it as "SavingsAccount is a type of Account".</li>
  </ul>
  <div class="callout trap"><span class="label">Encapsulation vs abstraction (often confused)</span><p><b>Encapsulation</b> = protect the data (the locked locker and the cashier). <b>Abstraction</b> = hide the complex steps (the ATM's simple buttons). One is about <b>safety</b>, the other is about <b>simplicity</b>.</p></div>

  <h2 id="oo-inherit"><span class="num">08</span>Pillar 3: Inheritance</h2>
  <div class="callout def"><span class="label">Definition</span><p><strong>Inheritance</strong> means making a new class from an existing class. The new class (the <b>child</b>) automatically gets all the data and methods of the old class (the <b>parent</b>). The child can add new things or change old ones.</p></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Children get some features from their parents, like eye colour, and also have their own features. A child class works the same way. A simple test: use inheritance only when you can say "<b>is a</b>". A savings account <b>is a</b> bank account. An electric car <b>is a</b> car.</p></div>
  <h3>Adding something new</h3>
  <p>A savings account is a normal bank account plus one extra thing: it earns interest. Instead of copying the whole class, we inherit from it. We write the parent's name in brackets: <code>class SavingsAccount(BankAccount):</code>. (<code>BankAccount</code> here is the class from the encapsulation section.)</p>
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
  <ul>
    <li>We never wrote <code>deposit</code> in <code>SavingsAccount</code>, but <code>s.deposit(500)</code> works. It came from the parent.</li>
    <li><code>super().__init__(owner, balance)</code> means "run the parent's setup first". So we don't repeat that code.</li>
    <li><code>isinstance(s, BankAccount)</code> is <code>True</code>. A savings account really is a bank account.</li>
  </ul>
  <h3>Changing something old: overriding</h3>
  <div class="callout def"><span class="label">Definition</span><p><strong>Method overriding</strong> means the child class writes its own version of a method that the parent already has. The child's version is used instead.</p></div>
  <p>A current account lets you go below zero, up to a limit (called an overdraft). So its withdraw rule is different:</p>
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
  <p>A normal bank account would refuse to take 1200 from 500. The current account uses its own <code>withdraw</code>, so it allows it. The balance becomes −700, which is within the 1000 limit.</p>
  <div class="callout trap"><span class="label">Don't inherit when it's "has a"</span><p>A customer <b>has</b> a bank account. A customer <b>is not</b> a bank account. So <code>Customer</code> should not inherit from <code>BankAccount</code>. Instead, keep the account inside the customer: <code>self.account = BankAccount(...)</code>. This is called <b>composition</b>.</p></div>

  <h2 id="oo-poly"><span class="num">09</span>Pillar 4: Polymorphism</h2>
  <div class="callout def"><span class="label">Definition</span><p><strong>Polymorphism</strong> means "many forms". The same method name can do different things, depending on which object it is called on.</p></div>
  <p>You have already used polymorphism without knowing it:</p>
  <div class="fx" data-lang="py">print(len("chai"), len([10, 20, 30]), len({"a": 1}))
print(2 + 3, "chai" + "wala", [1] + [2])</div>
  <div class="fx" data-lang="text">4 3 1
5 chaiwala [1, 2]</div>
  <p>The same <code>len()</code> works on text, lists and dictionaries. The same <code>+</code> adds numbers but joins text and lists. Each type decides what the command means for itself.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>At a shop you say "I'll pay". If you pay by card, it is swiped. If you pay by UPI, a QR code is scanned. If you pay cash, notes are counted. The command "pay" is the same. What happens depends on how you pay.</p></div>
  <h3>Polymorphism in our bank</h3>
  <p>At the end of every month, the bank updates each account:</p>
  <ul>
    <li>A basic account: nothing happens.</li>
    <li>A savings account: earns 4% interest.</li>
    <li>A current account: pays a ₹100 fee.</li>
  </ul>
  <p>Without polymorphism, we would need a long <code>if ... elif ...</code> to check each account type. With polymorphism, each class has its own <code>month_end</code> method, and we just call it:</p>
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
  <p>The loop never checks the type. It calls <code>month_end()</code> on each account, and each one does its own thing: Asha stays at 1000, Chen gets interest (1040), Dev pays the fee (900). If the bank adds a new account type later, we only write one new class. The loop stays the same.</p>
  <h3>Duck typing</h3>
  <div class="callout def"><span class="label">Definition</span><p><strong>Duck typing</strong> means Python only cares whether an object <b>has</b> the method you call, not what class it comes from. The name comes from the saying: "If it walks like a duck and quacks like a duck, it is a duck."</p></div>
  <div class="fx" data-lang="py">class Wallet:                       # not a BankAccount at all
    def __init__(self, owner):
        self.owner = owner
        self._balance = 50
    def month_end(self):
        print("wallet: nothing to do")

for thing in [Wallet("Esha")]:
    thing.month_end()               # works: Python only needs the method to exist</div>
  <div class="fx" data-lang="text">wallet: nothing to do</div>
  <p><code>Wallet</code> is not a bank account at all. But it has a <code>month_end</code> method, so the loop works with it too.</p>

  <h2 id="oo-all"><span class="num">10</span>All Four Pillars Together</h2>
  <p>Here is the full bank program. The comments show which pillar each part uses.</p>
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
  <ul>
    <li><b>Abstraction</b>: <code>Account</code> says every account must have <code>month_end</code>, but does not say how.</li>
    <li><b>Encapsulation</b>: <code>_balance</code> can only be changed by methods. Outside code can read <code>balance</code> but not set it.</li>
    <li><b>Inheritance</b>: <code>SavingsAccount</code> and <code>CurrentAccount</code> reuse everything from <code>Account</code> and only write what is different.</li>
    <li><b>Polymorphism</b>: the loop calls <code>month_end()</code> on every account, and each one behaves in its own way. Chen earns interest (1040). Dev pays the fee and goes from −700 to −800. Chen cannot take out 5000, because he has no overdraft.</li>
  </ul>

  <h2 id="oo-traps"><span class="num">11</span>Common Mistakes</h2>
  <h3>Forgetting self</h3>
  <p>Every method needs <code>self</code> as its first input. If you forget it, you get a confusing error:</p>
  <div class="fx" data-lang="py">class BankAccount:
    def deposit(amount):            # forgot self
        pass

try:
    BankAccount().deposit(100)
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: BankAccount.deposit() takes 1 positional argument but 2 were given</div>
  <p>"Takes 1 but 2 were given" happens because Python passes the object as well as your 100, and there is no <code>self</code> to receive it.</p>
  <h3>Putting a list directly in the class</h3>
  <p>Data written directly inside the class (not inside <code>__init__</code>) is <b>shared by all objects</b>. With a list, that is usually a bug:</p>
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
  <p>Fix: put each object's own data inside <code>__init__</code>, using <code>self.</code>.</p>
  <h3>Other mistakes</h3>
  <ul>
    <li><b>Using inheritance for "has a".</b> A customer has an account; it is not an account. Use composition.</li>
    <li><b>Making a class for everything.</b> If a class has only <code>__init__</code> and one method, a simple function is usually better.</li>
    <li><b>Thinking <code>_name</code> is a real lock.</b> It is only a sign for other programmers.</li>
  </ul>

  <h2 id="oo-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>OOP</b>: a way of writing code where data and the actions on it are kept together in objects.</li>
    <li><b>Class</b>: a blueprint that describes the data and actions of something.</li>
    <li><b>Object / instance</b>: a real thing made from a class. One class can make many objects.</li>
    <li><b>Attribute</b>: data stored inside an object (<code>self.balance</code>).</li>
    <li><b>Method</b>: a function inside a class; an action the object can do.</li>
    <li><b><code>__init__</code> (constructor)</b>: runs automatically when an object is made; sets its starting data.</li>
    <li><b><code>self</code></b>: the current object. <code>a.deposit(5)</code> is the same as <code>BankAccount.deposit(a, 5)</code>.</li>
    <li><b>Encapsulation</b>: keep data safe inside the object; change it only through methods.</li>
    <li><b>Abstraction</b>: show only what is needed; hide how it works.</li>
    <li><b>Abstract class</b>: says what methods must exist, not how; cannot make objects from it.</li>
    <li><b>Inheritance</b>: a child class gets everything from a parent class and can add or change things.</li>
    <li><b>Method overriding</b>: the child writes its own version of a parent's method.</li>
    <li><b>Polymorphism</b>: same method name, different behaviour depending on the object.</li>
    <li><b>Duck typing</b>: Python only checks that the object has the method, not its class.</li>
    <li><b>Composition</b>: putting one object inside another ("has a") instead of inheriting.</li>
  </ul>
  <h3>The four pillars</h3>
  <table class="tbl">
    <tr><th>Pillar</th><th>Simple meaning</th><th>Analogy</th><th>Python</th></tr>
    <tr><td>Encapsulation</td><td>protect the data</td><td>locker + cashier</td><td><code>_balance</code>, <code>@property</code></td></tr>
    <tr><td>Abstraction</td><td>hide the hard parts</td><td>ATM buttons</td><td>simple methods, <code>ABC</code>, <code>@abstractmethod</code></td></tr>
    <tr><td>Inheritance</td><td>reuse a class ("is a")</td><td>child gets parent's features</td><td><code>class Child(Parent):</code>, <code>super()</code></td></tr>
    <tr><td>Polymorphism</td><td>same command, different result</td><td>"pay" by card / UPI / cash</td><td>overriding, duck typing</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">class BankAccount:                       # class = blueprint
    def __init__(self, owner, balance):  # runs when an object is made
        self.owner = owner               # attribute
        self._balance = balance          # _ = private by convention

    @property
    def balance(self):                   # read-only from outside
        return self._balance

    def deposit(self, amount):           # method
        self._balance += amount

class SavingsAccount(BankAccount):       # inheritance
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance) # run the parent's setup
        self.rate = rate

acc = SavingsAccount("Chen", 1000, 0.04) # object
acc.deposit(500)                         # call a method</div>
  <h3>Remember</h3>
  <ul>
    <li>Forgetting <code>self</code> → "takes 1 positional argument but 2 were given".</li>
    <li>A list written directly in the class body is shared by all objects. Put it in <code>__init__</code>.</li>
    <li>Use inheritance for "is a", composition for "has a".</li>
    <li>Encapsulation = safety. Abstraction = simplicity.</li>
    <li><code>_x</code> = private by convention; <code>__x</code> = name mangled to <code>_Class__x</code>.</li>
  </ul>

  <h2 id="oo-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is OOP? Why do we use it?</summary><div class="qa-body">OOP (Object-Oriented Programming) is a way of writing code where data and the actions on that data are kept together in objects. We use it because it keeps data safe (only the object's methods can change it), lets us reuse code (inheritance), and keeps big programs organised.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class and an object?</summary><div class="qa-body">A class is a blueprint. An object is a real thing made from that blueprint. <code>BankAccount</code> is the class; <code>asha = BankAccount("Asha", 1000)</code> is an object. One class can make many objects, and each has its own data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four pillars of OOP?</summary><div class="qa-body"><b>Encapsulation</b>: protect the data inside the object. <b>Abstraction</b>: hide the complex details and show only what is needed. <b>Inheritance</b>: a new class reuses an existing class. <b>Polymorphism</b>: the same method name behaves differently for different objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>self</code>?</summary><div class="qa-body"><code>self</code> is the object the method is working on. When you write <code>acc.deposit(100)</code>, Python runs <code>BankAccount.deposit(acc, 100)</code>, so <code>self</code> is <code>acc</code>. It is just a name everyone agrees to use, not a special keyword.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__init__</code>? Is it a constructor?</summary><div class="qa-body"><code>__init__</code> runs automatically when a new object is made, and sets its starting data. People call it the constructor. Strictly speaking, Python first creates the object with a method called <code>__new__</code>, and then <code>__init__</code> fills it in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between encapsulation and abstraction?</summary><div class="qa-body">Encapsulation is about <b>protecting data</b>: the data can only be changed through methods (like a locker that only the cashier can open). Abstraction is about <b>hiding complexity</b>: the user sees simple methods and not the steps inside (like an ATM's buttons).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python have private variables?</summary><div class="qa-body">Not truly. A name starting with <code>_</code> means "private, please don't touch", but Python does not stop you. A name starting with <code>__</code> is renamed by Python to <code>_ClassName__name</code> (name mangling), which makes it harder to reach by accident, but it can still be reached.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@property</code> do?</summary><div class="qa-body">It lets you read a method like a normal attribute, without brackets: <code>acc.balance</code> instead of <code>acc.balance()</code>. If you don't add a setter, the value becomes read-only. It is Python's clean way to control access, instead of writing <code>get_balance()</code> and <code>set_balance()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an abstract class? How do you make one in Python?</summary><div class="qa-body">An abstract class says which methods must exist but does not write them. You cannot make an object from it. In Python, inherit from <code>ABC</code> and put <code>@abstractmethod</code> above the required methods. If a child class does not write all of them, Python gives a <code>TypeError</code> when you try to make an object.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is inheritance? What does <code>super()</code> do?</summary><div class="qa-body">Inheritance lets a child class get all the data and methods of a parent class: <code>class SavingsAccount(BankAccount):</code>. <code>super()</code> lets the child use the parent's version of a method. The most common use is <code>super().__init__(...)</code>, to run the parent's setup inside the child's setup.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is method overriding? Does Python support method overloading?</summary><div class="qa-body">Overriding: a child class writes its own version of a parent's method, and the child's version is used. Overloading means having many methods with the same name but different inputs. Python does not support this; the last method with that name replaces the others. Instead, Python uses default values or <code>*args</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is polymorphism? Give an example.</summary><div class="qa-body">Polymorphism means the same method name can do different things for different objects. Example: <code>len()</code> works on text, lists and dictionaries. In our bank, <code>month_end()</code> adds interest for a savings account and takes a fee for a current account, and the loop calling it does not need to check the type.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is duck typing?</summary><div class="qa-body">Python only cares if an object has the method you call, not which class it is. "If it walks like a duck and quacks like a duck, it is a duck." So any object with a <code>month_end()</code> method can go into the month-end loop, even if it is not a bank account.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between inheritance and composition?</summary><div class="qa-body">Inheritance is for "is a": a savings account is a bank account. Composition is for "has a": a customer has an account, so we store the account inside the customer (<code>self.account = ...</code>). Composition is usually the safer choice, because it keeps classes less tied together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a class attribute and an instance attribute?</summary><div class="qa-body">An instance attribute belongs to one object; it is set with <code>self.x = ...</code>, usually in <code>__init__</code>. A class attribute is written directly inside the class and is shared by all objects. Be careful with lists: a list written as a class attribute is shared, so one object's changes show up in all of them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python support multiple inheritance? Which parent's method is used?</summary><div class="qa-body">Yes: <code>class C(A, B):</code>. Python searches for a method in a fixed order called the <b>MRO</b> (Method Resolution Order): first the class itself, then the parents from left to right. You can see the order with <code>C.__mro__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "everything in Python is an object" mean?</summary><div class="qa-body">Every value in Python, like numbers, text, lists, functions and even classes, is an object. Each has a type and can have attributes and methods. For example, <code>"hi".upper()</code> calls a method on a text object.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use a class?</summary><div class="qa-body">When there is no data to protect or keep together. A class with only <code>__init__</code> and one method is usually just a function. For simple data records, a <code>@dataclass</code> is shorter. Use a class when several actions must work on the same data and keep it correct.</div></details>
</main>
`
});
