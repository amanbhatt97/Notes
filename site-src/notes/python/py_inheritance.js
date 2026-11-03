// notes/python/py_inheritance.js — Inheritance, Polymorphism & Design
Object.assign(TOPIC_CONTENT, {
  "py_inheritance": `<main>
<h1>Inheritance, Polymorphism &amp; Design</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Inheritance, Polymorphism &amp; Design</span></div>
  <p class="lead"><a class="xref" data-note="py_oop">OOP Concepts in Python</a> introduced inheritance and polymorphism with a savings account that inherits from <code>BankAccount</code> and a month-end loop that treats every account the same way. This page is about using those ideas well in larger programs, where the hard questions are no longer "how do I inherit?" but "should I inherit at all, and how do I keep the classes from tangling?". We will look closely at what <code>super()</code> really does, how a parent class can define a procedure that children fill in, how abstract base classes and protocols state what a class must provide, how Python handles a class with several parents, and when composition beats inheritance. We finish with the SOLID design principles and a few classic design patterns, which are the vocabulary interviewers use for design questions and the ideas behind libraries such as scikit-learn and PyTorch. The same bank runs through the page: Asha's basic account, Chen's savings account and Dev's current account with an overdraft.</p>

  <h2 id="pi-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Inheritance &amp; Design</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Inheritance in depth</div>
        <ul>
          <li>Override to <b>replace</b>, or <b>extend</b> with <code>super().method()</code></li>
          <li>A child <code>__init__</code> must call <code>super().__init__()</code></li>
          <li><b>Template method</b>: parent fixes the steps, children fill in hooks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Contracts</div>
        <ul>
          <li><b>ABC</b>: must inherit; missing abstract method → cannot create objects</li>
          <li><b>Protocol</b>: just have the methods; checked by type checkers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Several parents</div>
        <ul>
          <li><b>MRO</b>: the order Python searches classes, built by C3</li>
          <li><code>super()</code> = next class in the object's MRO, not "my parent"</li>
          <li><b>Mixin</b>: a small class adding one feature, listed first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Design</div>
        <ul>
          <li><b>Composition</b> ("has a") over inheritance ("is a")</li>
          <li><b>SOLID</b>: one job, extend without editing, children keep promises, small interfaces, inject dependencies</li>
          <li>Patterns: strategy, factory, observer, singleton</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pi-super"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Overriding and super()</span><span class="rm-sub">replace or extend a parent's method</span></div></div>
      <div class="rm-item rm-done" data-target="pi-template"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Template Method</span><span class="rm-sub">a parent procedure with steps children fill in</span></div></div>
      <div class="rm-item rm-done" data-target="pi-abc"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Abstract Base Classes</span><span class="rm-sub">forcing children to write required methods</span></div></div>
      <div class="rm-item rm-done" data-target="pi-proto"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Protocols</span><span class="rm-sub">duck typing written down</span></div></div>
      <div class="rm-item rm-done" data-target="pi-mro"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Multiple Inheritance and the MRO</span><span class="rm-sub">which method runs when there are two parents</span></div></div>
      <div class="rm-item rm-done" data-target="pi-mixin"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Mixins</span><span class="rm-sub">adding one feature to any class</span></div></div>
      <div class="rm-item rm-done" data-target="pi-comp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Composition over Inheritance</span><span class="rm-sub">building objects from swappable parts</span></div></div>
      <div class="rm-item rm-done" data-target="pi-solid"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">SOLID Principles</span><span class="rm-sub">five rules for classes that stay easy to change</span></div></div>
      <div class="rm-item rm-done" data-target="pi-pat"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Design Patterns</span><span class="rm-sub">strategy, factory, observer, singleton</span></div></div>
      <div class="rm-item rm-done" data-target="pi-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">has-a inheritance, skipped super() calls</span></div></div>
      <div class="rm-item rm-done" data-target="pi-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, MRO rule, SOLID table</span></div></div>
      <div class="rm-item rm-done" data-target="pi-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">super, MRO, ABCs, design</span></div></div>
    </div>
  </div>

  <h2 id="pi-super"><span class="num">01</span>Overriding and super()</h2>
  <p>When a child class defines a method with the same name as one in its parent, the child's version is found first and runs instead; this is <strong>overriding</strong>, which we used in <a class="xref" data-note="py_oop">OOP Concepts in Python</a> to give the current account its own withdraw rule. But there are really two different reasons to override, and it pays to tell them apart. Sometimes the parent's rule is simply wrong for the child and must be <strong>replaced</strong> completely. Other times the parent's rule is still right, and the child only wants to add a step before or after it; then the child should <strong>extend</strong> the parent's method rather than copy it. Copying would mean the same check lives in two places, which is exactly the duplication inheritance was supposed to remove.</p>
  <p>Extending is done with <code>super()</code>. Inside a method, <code>super().withdraw(amount)</code> means "run the <code>withdraw</code> that comes after this class", which in a simple family is the parent's version, on the same object. Think of a branch office with an extra local rule, such as "savings customers may take out at most 500 at a time". The branch checks its own rule, and if the request passes, it sends it on to head office, which applies the bank-wide rules as usual. <code>super()</code> is "send it on to head office".</p>
  <p>Below, <code>BankAccount</code> is the encapsulated class from <a class="xref" data-note="py_oop">OOP Concepts in Python</a>, with <code>_balance</code>, a read-only <code>balance</code> property, <code>deposit</code> and a <code>withdraw</code> that refuses to go below zero. The current account replaces <code>withdraw</code>; the savings account extends it:</p>
  <div class="fx" data-lang="py"># (BankAccount is the encapsulated class from OOP Concepts)

class CurrentAccount(BankAccount):
    def __init__(self, owner, balance, overdraft):
        super().__init__(owner, balance)
        self.overdraft = overdraft

    def withdraw(self, amount):                   # REPLACES the parent's withdraw
        if amount &gt; self._balance + self.overdraft:
            raise ValueError("Overdraft limit reached")
        self._balance -= amount

class SavingsAccount(BankAccount):
    max_withdrawal = 500                          # savings rule: at most 500 at a time

    def withdraw(self, amount):                   # EXTENDS the parent's withdraw
        if amount &gt; self.max_withdrawal:
            raise ValueError(f"Savings: at most {self.max_withdrawal} per withdrawal")
        super().withdraw(amount)                  # ...then the parent's own check runs

dev = CurrentAccount("Dev", 500, overdraft=1000)
dev.withdraw(1200)
print("Dev:", dev.balance)

asha = SavingsAccount("Asha", 300)
for amount in (600, 400, 100):
    try:
        asha.withdraw(amount)
        print(f"withdraw {amount}: ok, balance {asha.balance}")
    except ValueError as e:
        print(f"withdraw {amount}: {e}")</div>
  <div class="fx" data-lang="text">Dev: -700
withdraw 600: Savings: at most 500 per withdrawal
withdraw 400: Not enough money
withdraw 100: ok, balance 200</div>
  <p>Dev's current account took out 1200 from 500 and reached −700, because its own <code>withdraw</code> replaced the parent's and the parent's "no overdrawing" check never ran. Asha's savings account shows extending. Her request for 600 was stopped by the savings rule before the parent was even asked. Her request for 400 passed the savings rule, was sent on through <code>super().withdraw(400)</code>, and was refused there with the parent's "Not enough money", because she only had 300. Her request for 100 passed both checks. Two rules, each written exactly once, applied in order.</p>
  <p>The most important use of <code>super()</code> is in <code>__init__</code>. A child that needs an extra attribute writes its own <code>__init__</code>, and that replaces the parent's completely, so the parent's setup only happens if the child asks for it. The next example prints the object's attributes at three moments so you can watch each class do its part, and then shows what happens when the call is forgotten:</p>
  <div class="fx" data-lang="py">class SavingsAccount(BankAccount):
    def __init__(self, owner, balance, rate):
        print("  child __init__ starts:   ", vars(self))
        super().__init__(owner, balance)          # the parent sets owner and _balance
        print("  after super().__init__:  ", vars(self))
        self.rate = rate                          # then the child adds its own part
        print("  child __init__ ends:     ", vars(self))

chen = SavingsAccount("Chen", 1000, 0.04)

class BrokenSavings(BankAccount):
    def __init__(self, owner, balance, rate):
        self.rate = rate                          # forgot super().__init__(...)

b = BrokenSavings("Chen", 1000, 0.04)             # no error yet...
print(vars(b))
try:
    print(b.balance)                              # ...the error appears much later
except AttributeError as e:
    print("AttributeError:", e)</div>
  <div class="fx" data-lang="text">  child __init__ starts:    {}
  after super().__init__:   {'owner': 'Chen', '_balance': 1000}
  child __init__ ends:      {'owner': 'Chen', '_balance': 1000, 'rate': 0.04}
{'rate': 0.04}
AttributeError: 'BrokenSavings' object has no attribute '_balance'</div>
  <p>When Chen's savings account is created, the child's <code>__init__</code> starts with an empty object. After <code>super().__init__(owner, balance)</code>, the parent has stored <code>owner</code> and <code>_balance</code>. Only then does the child add <code>rate</code>. In <code>BrokenSavings</code> the call is missing, so the object ends up with nothing but <code>rate</code>. The dangerous part is the timing: creating the object raised no error at all, and the failure appeared later, at the first use of <code>balance</code>, where the message about a missing <code>_balance</code> says nothing about the real cause. That is why a child's <code>__init__</code> should call <code>super().__init__(...)</code>, normally as its first line.</p>
  <p>One more point to keep in mind for later. We have described <code>super()</code> as "the parent", and in a family where every class has one parent that is exactly what it does. But Python actually defines <code>super()</code> as "the next class in a particular search order", and once a class has several parents, the next class may not be the parent at all. We will see why that matters, and why it is a good thing, in the section on multiple inheritance. (Older code writes <code>super(SavingsAccount, self)</code>; in Python 3 the short form <code>super()</code> means the same.)</p>

  <h2 id="pi-template"><span class="num">02</span>The Template Method</h2>
  <p>In <a class="xref" data-note="py_oop">OOP Concepts in Python</a> each account class wrote its own complete <code>month_end</code>, and a loop called it on every account. That works, but look at what each version must do: work out the interest, work out any fee, update the balance, and in a real bank also round the result, record a transaction and perhaps send a statement. Most of those steps are identical for every account. If each child writes the whole procedure, the shared steps are copied into every child, and a change to the rounding rule means editing all of them.</p>
  <p>The <strong>template method</strong> is the standard solution. The parent writes the procedure once, as an ordinary method, and at the points where account types differ it calls small methods, called <strong>hooks</strong>, which children override. The parent decides <em>what happens and in what order</em>; the children decide only <em>their own numbers</em>. A bank's month-end checklist works the same way: head office writes the checklist ("compute interest, deduct fees, update the balance, round to paise"), and each product's team only fills in its own interest and fee rule.</p>
  <div class="fx" data-lang="py">class Account(BankAccount):
    def interest(self):                           # hook: default is "no interest"
        return 0

    def fee(self):                                # hook: default is "no fee"
        return 0

    def month_end(self):                          # the template: same steps for everyone
        change = self.interest() - self.fee()     # ...but these calls depend on the object
        self._balance = round(self._balance + change, 2)
        return change

class SavingsAccount(Account):
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)
        self.rate = rate

    def interest(self):                           # overrides ONE step only
        return self._balance * self.rate

class CurrentAccount(Account):
    def __init__(self, owner, balance, overdraft):
        super().__init__(owner, balance)
        self.overdraft = overdraft

    def withdraw(self, amount):
        if amount &gt; self._balance + self.overdraft:
            raise ValueError("Overdraft limit reached")
        self._balance -= amount

    def fee(self):                                # overrides the other step
        return 100 if self._balance &lt; 0 else 0

accounts = [Account("Asha", 1000), SavingsAccount("Chen", 1000, 0.04),
            CurrentAccount("Dev", 500, 1000)]
accounts[2].withdraw(1200)                        # Dev goes to -700
for acc in accounts:
    change = acc.month_end()
    print(f"{acc.owner:5} {type(acc).__name__:15} change {change:+8} balance {acc.balance}")</div>
  <div class="fx" data-lang="text">Asha  Account         change       +0 balance 1000
Chen  SavingsAccount  change    +40.0 balance 1040.0
Dev   CurrentAccount  change     -100 balance -800</div>
  <p>The parent <code>Account</code> gives both hooks a default of 0, and its <code>month_end</code> is the template: <code>change = self.interest() - self.fee()</code>, then the balance is updated and rounded. <code>SavingsAccount</code> overrides only <code>interest</code>, and <code>CurrentAccount</code> overrides only <code>fee</code> (plus its overdraft rule for <code>withdraw</code>). Asha's basic account changes by 0, Chen earns 40 and reaches 1040.0, and Dev, at −700 after using his overdraft, pays the 100 fee and reaches −800, the same results as in OOP Concepts, but now the procedure exists in one place.</p>
  <p>It is worth following Dev's call step by step, because it shows how code written in the parent ends up running code written in the child. <code>dev.month_end()</code> is not found on <code>CurrentAccount</code>, so Python finds it on <code>Account</code> and runs it with <code>self</code> set to Dev's account. Inside it, <code>self.interest()</code> is looked up starting from the object's real class, <code>CurrentAccount</code>; it is not defined there, so <code>Account.interest</code> runs and returns 0. Then <code>self.fee()</code> is looked up the same way, and this time <code>CurrentAccount.fee</code> is found and returns 100 because the balance is negative. Choosing which method to run by looking at the object's actual class at the moment of the call is called <strong>dynamic dispatch</strong>, and it is what makes polymorphism work. The parent's code never mentions <code>CurrentAccount</code>, yet it ran the current account's fee rule.</p>
  <p>Libraries use this shape constantly. When you call a PyTorch model, the library's own <code>__call__</code> method runs its bookkeeping and then calls your <code>forward</code> method, the hook you wrote. scikit-learn's estimators follow the same idea with <code>fit</code> and <code>predict</code>. The template method has one weakness, though, and our next section fixes it.</p>

  <h2 id="pi-abc"><span class="num">03</span>Abstract Base Classes</h2>
  <p>The default hooks in the template method are convenient, but they hide a trap. Suppose a new developer adds fixed deposits, which earn 7% interest, and forgets to write the <code>interest</code> hook:</p>
  <div class="fx" data-lang="py">class FixedDeposit(Account):                      # someone forgot to write interest()
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)
        self.rate = rate

fd = FixedDeposit("Esha", 10000, 0.07)
print(fd.month_end(), fd.balance)                 # no error, and no interest either</div>
  <div class="fx" data-lang="text">0 10000</div>
  <p>Esha's 10,000 earned nothing, and there was no error of any kind. The class silently used the parent's default of 0. Nobody would notice until a customer complained. A missing required method should fail loudly and early, not quietly produce wrong numbers.</p>
  <p><a class="xref" data-note="py_oop">OOP Concepts in Python</a> introduced the tool for this: an <strong>abstract base class</strong> (ABC), a parent class that lists methods every child <em>must</em> write and that cannot itself be used to create objects. Here we use it for what it is really good at: an ABC can mix <em>abstract</em> methods, which only state a requirement, with ordinary methods containing real shared code, such as our template <code>month_end</code>. You build one by inheriting from <code>ABC</code> in the <code>abc</code> module and marking each required method with <code>@abstractmethod</code>. A useful picture is a launch checklist for a new bank product, with boxes for "interest rule" and "fee rule". A product with an empty box is not allowed to launch, and the checklist itself is not a product that customers can open.</p>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod

class Account(ABC):
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    @abstractmethod
    def interest(self):                           # every real account MUST define this
        ...

    @abstractmethod
    def fee(self):                                # ...and this
        ...

    def month_end(self):                          # ordinary method, shared by every child
        change = self.interest() - self.fee()
        self._balance = round(self._balance + change, 2)
        return change

class FixedDeposit(Account):
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)
        self.rate = rate

    def interest(self):
        return self._balance * self.rate          # forgot fee()

class SavingsAccount(Account):
    def __init__(self, owner, balance, rate):
        super().__init__(owner, balance)
        self.rate = rate

    def interest(self):
        return self._balance * self.rate

    def fee(self):
        return 0

for cls, args in [(Account, ("Asha", 1000)), (FixedDeposit, ("Esha", 10000, 0.07))]:
    try:
        cls(*args)
    except TypeError as e:
        print("TypeError:", e)

chen = SavingsAccount("Chen", 1000, 0.04)
print(chen.month_end(), chen.balance, isinstance(chen, Account))</div>
  <div class="fx" data-lang="text">TypeError: Can't instantiate abstract class Account without an implementation for abstract methods 'fee', 'interest'
TypeError: Can't instantiate abstract class FixedDeposit without an implementation for abstract method 'fee'
40.0 1040.0 True</div>
  <p>Python refused to create an <code>Account</code>, because it is only a description with two abstract methods. It also refused <code>FixedDeposit</code>, and the error names exactly what is missing: <code>fee</code>. The forgotten method is now caught the moment someone tries to create an object, long before any month-end run. <code>SavingsAccount</code> wrote both methods, so it can be created, and it uses the shared <code>month_end</code> from the ABC: Chen earned 40.0 and reached 1040.0. <code>isinstance(chen, Account)</code> is <code>True</code>, so code can check that it has received some kind of account. (The <code>...</code> in each abstract method is Python's "nothing here" placeholder; the body of an abstract method is normally empty.)</p>
  <p>The enforcement comes entirely from inheriting <code>ABC</code>. The decorator on its own does nothing, which is a common surprise:</p>
  <div class="fx" data-lang="py">from abc import abstractmethod

class Account:                                    # forgot to inherit from ABC
    @abstractmethod
    def fee(self):
        ...

class Broken(Account):
    pass

print(Broken().fee())                             # created without complaint; fee() returns None</div>
  <div class="fx" data-lang="text">None</div>
  <p>Without <code>ABC</code> in the class line, the incomplete <code>Broken</code> class was created without complaint, and calling its "required" method just returned <code>None</code>. Python's own standard library uses ABCs in the same way: <code>collections.abc</code> defines <code>Sequence</code>, <code>Mapping</code>, <code>Iterable</code> and others, and inheriting from one of them both checks that you wrote the required methods and gives you extra methods built on top of them for free.</p>

  <h2 id="pi-proto"><span class="num">04</span>Protocols</h2>
  <p>An ABC only works for classes that inherit from it. But Python's polymorphism does not normally need a shared parent: as <a class="xref" data-note="py_oop">OOP Concepts in Python</a> showed with duck typing, Python only cares whether an object has the method being called. That flexibility has a cost. When a function expects "anything with a <code>month_end</code> method", that expectation is written nowhere; a reader has to guess it, and a mistake is discovered only when the program runs that line. Making every such class inherit from an ABC would fix that, but it is often impossible, for example when the objects come from a library you cannot change.</p>
  <p>A <strong>protocol</strong> is the answer: a class that describes a set of methods, so that any class that happens to have those methods counts as matching, with no inheritance needed. Protocols come from the <code>typing</code> module. They are mainly read by <strong>type checkers</strong>, tools such as mypy or the checker built into your editor, which read your code before it runs and warn you when an object does not have what a function needs. Think of a driving job advert that asks "can you drive?" rather than "which driving school did you go to?". An ABC is the second kind of question: you qualify by your family tree. A protocol is the first kind: you qualify by what you can do.</p>
  <div class="fx" data-lang="py">from typing import Protocol, runtime_checkable

@runtime_checkable
class MonthEndable(Protocol):                     # "anything with a month_end() method"
    def month_end(self) -&gt; float: ...

class Wallet:                                     # NOT an Account: no inheritance at all
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def month_end(self) -&gt; float:                 # ...but it has the required method
        self.balance -= 1                         # a 1-rupee monthly charge
        return -1

def run_month_end(items: list[MonthEndable]) -&gt; float:
    return round(sum(item.month_end() for item in items), 2)

items = [SavingsAccount("Chen", 1000, 0.04), Wallet("Esha", 50)]
print(run_month_end(items))
print(isinstance(items[1], MonthEndable), isinstance(items[1], Account))
print(isinstance("some text", MonthEndable))

class Liar:
    month_end = 42                                # right name, but not even a method
print(isinstance(Liar(), MonthEndable))</div>
  <div class="fx" data-lang="text">39.0
True False
False
True</div>
  <p><code>MonthEndable</code> says "has a <code>month_end</code> method returning a number". The <code>Wallet</code> class does not inherit from it, or from <code>Account</code>, yet it can be passed to <code>run_month_end</code>, which adds Chen's +40 and the wallet's −1 to get 39.0. A type checker would accept the call, and would warn if someone passed an object without <code>month_end</code>. Adding <code>@runtime_checkable</code> also lets <code>isinstance</code> test against the protocol while the program runs: the wallet counts as <code>MonthEndable</code> although it is not an <code>Account</code>, and a string does not. The last line shows the limit of that run-time check: <code>Liar</code> has an attribute called <code>month_end</code> that is just the number 42, and <code>isinstance</code> still says <code>True</code>, because at run time Python only checks that the name exists. The real checking of protocols is done by the type checker, before the program runs.</p>
  <p>So when should you use which? Use an ABC for a family of classes you design yourself, especially when the parent can hold shared code like our template <code>month_end</code>, and when you want missing methods caught as soon as an object is created. Use a protocol to describe what a function needs from its arguments, especially when they may come from code you do not control. The two are complementary rather than rivals:</p>
  <table class="tbl">
    <tr><th></th><th>Abstract base class</th><th>Protocol</th></tr>
    <tr><td>How a class qualifies</td><td>by inheriting from it</td><td>by having the right methods</td></tr>
    <tr><td>When problems are caught</td><td>when an object is created (<code>TypeError</code>)</td><td>by a type checker, before running</td></tr>
    <tr><td>Can hold shared code</td><td>yes</td><td>not intended</td></tr>
    <tr><td>Best for</td><td>your own class families</td><td>objects from code you don't control</td></tr>
  </table>

  <h2 id="pi-mro"><span class="num">05</span>Multiple Inheritance and the MRO</h2>
  <p>Python allows a class to have more than one parent, written <code>class Premium(Overdraft, Rewards)</code>. A premium account might combine an overdraft facility with a cashback rewards scheme. This is called <strong>multiple inheritance</strong>, and it immediately raises two questions. If both parents define the same method, which one runs? And if both parents inherit from the same grandparent, does the grandparent's code run once or twice? The shape in which two parents share a grandparent is called the <strong>diamond</strong>, because that is what the class diagram looks like.</p>
  <p>Python answers both questions with a single list called the <strong>method resolution order</strong>, or <strong>MRO</strong>: the exact order in which Python searches classes when looking up a method on an object. Every class has one, stored in <code>ClassName.__mro__</code>. Every attribute lookup walks this list from the front and stops at the first class that has the name, and, crucially, <code>super()</code> means "the next class in this list after the current one". Think of a relay race with the running order printed on a board. Each runner, when finished, passes the baton to the next name on the board, not necessarily to a teammate from their own club.</p>
  <figure class="viz"><svg viewBox="0 0 540 210" width="540">
    <defs><marker id="pi-mro-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <rect x="95" y="10" width="90" height="32" rx="5" class="fs" stroke="currentColor"/><text x="140" y="31" text-anchor="middle">Account</text>
    <rect x="15" y="85" width="90" height="32" rx="5" class="fb sb"/><text x="60" y="106" text-anchor="middle">Overdraft</text>
    <rect x="175" y="85" width="90" height="32" rx="5" class="fb sb"/><text x="220" y="106" text-anchor="middle">Rewards</text>
    <rect x="95" y="160" width="90" height="32" rx="5" class="fg sg"/><text x="140" y="181" text-anchor="middle">Premium</text>
    <line x1="70" y1="85" x2="125" y2="42" stroke="currentColor" opacity="0.5"/>
    <line x1="210" y1="85" x2="155" y2="42" stroke="currentColor" opacity="0.5"/>
    <line x1="125" y1="160" x2="70" y2="117" stroke="currentColor" opacity="0.5"/>
    <line x1="155" y1="160" x2="210" y2="117" stroke="currentColor" opacity="0.5"/>
    <path d="M93,172 C30,165 12,140 30,120" fill="none" class="sr" stroke-width="2" marker-end="url(#pi-mro-arrow)"/>
    <path d="M107,100 C135,92 150,92 172,100" fill="none" class="sr" stroke-width="2" marker-end="url(#pi-mro-arrow)"/>
    <path d="M250,84 C262,50 220,28 188,26" fill="none" class="sr" stroke-width="2" marker-end="url(#pi-mro-arrow)"/>
    <text x="8" y="160" class="tr">1</text><text x="136" y="88" class="tr">2</text><text x="258" y="56" class="tr">3</text>
    <text x="300" y="60">class Premium(Overdraft, Rewards)</text>
    <text x="300" y="90" class="tr">Premium → Overdraft → Rewards</text>
    <text x="300" y="108" class="tr">→ Account → object</text>
    <text x="300" y="136" class="tm">child before parents,</text>
    <text x="300" y="154" class="tm">parents left to right,</text>
    <text x="300" y="172" class="tm">shared parent once, after all its children</text>
  </svg><figcaption>The diamond. The red path is the MRO: Python visits Rewards before Account, so Account's method runs exactly once, at the end.</figcaption></figure>
  <p>The figure shows the four classes we are about to write. <code>Overdraft</code> and <code>Rewards</code> both inherit from <code>Account</code>, and <code>Premium</code> inherits from both. The red arrows show the order Python will search: arrow 1 goes from <code>Premium</code> to its first parent <code>Overdraft</code>; arrow 2 goes <em>sideways</em> to <code>Rewards</code>, the second parent, instead of climbing to <code>Account</code>; and only arrow 3 finally reaches <code>Account</code>. In the code, each class's <code>perks</code> method adds its own perk and then calls <code>super().perks()</code>:</p>
  <div class="fx" data-lang="py">class Account:
    def perks(self):
        return ["basic"]

class Overdraft(Account):
    def perks(self):
        return ["overdraft"] + super().perks()

class Rewards(Account):
    def perks(self):
        return ["cashback"] + super().perks()

class Premium(Overdraft, Rewards):                # two parents
    def perks(self):
        return ["lounge"] + super().perks()

print(Premium().perks())
print([c.__name__ for c in Premium.__mro__])</div>
  <div class="fx" data-lang="text">['lounge', 'overdraft', 'cashback', 'basic']
['Premium', 'Overdraft', 'Rewards', 'Account', 'object']</div>
  <p>The premium account gets four perks, with <code>basic</code> exactly once, at the end, and the printed MRO matches the red path. Now look closely at <code>Overdraft.perks</code>. Its <code>super().perks()</code> did not go to <code>Account</code>, its own parent; it went to <code>Rewards</code>, a class that <code>Overdraft</code> never mentions. That happened because, for a <code>Premium</code> object, the class after <code>Overdraft</code> in the MRO is <code>Rewards</code>. This is why <code>super()</code> is defined as "next in the MRO" rather than "my parent". If it meant "my parent", <code>Overdraft</code> and <code>Rewards</code> would each jump to <code>Account</code>, and the basic perk would be added twice. Following the MRO, every class in the diamond runs exactly once.</p>
  <p>Python builds the MRO with an algorithm called <strong>C3 linearisation</strong>. You rarely need to run it by hand, but its three guarantees are worth knowing because they explain every MRO you will see: a class always comes before its parents; parents keep the left-to-right order in which they were written; and every class appears exactly once, after all of its children. The algorithm itself works like this. Write down the MRO of each parent, plus the list of parents in the order they were written. Repeatedly look at the first item (the <em>head</em>) of each list in turn, and take the first head that does not appear anywhere later (in the <em>tail</em>) of any list; add it to the result and remove it from the front of every list. For <code>Premium</code> the lists are <code>[Overdraft, Account, object]</code>, <code>[Rewards, Account, object]</code> and <code>[Overdraft, Rewards]</code>.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Lists remaining</th><th>Head tried</th><th>Decision</th><th>MRO so far</th></tr>
    <tr><td>1</td><td>[Overdraft, Account, object], [Rewards, Account, object], [Overdraft, Rewards]</td><td>Overdraft</td><td>in no tail → take</td><td>Premium, Overdraft</td></tr>
    <tr><td>2</td><td>[Account, object], [Rewards, Account, object], [Rewards]</td><td>Account</td><td>in the tail of [Rewards, Account, object] → skip</td><td></td></tr>
    <tr><td></td><td></td><td>Rewards</td><td>in no tail → take</td><td>… Rewards</td></tr>
    <tr><td>3</td><td>[Account, object], [Account, object]</td><td>Account</td><td>in no tail → take</td><td>… Account</td></tr>
    <tr><td>4</td><td>[object], [object]</td><td>object</td><td>take</td><td>Premium, Overdraft, Rewards, Account, object</td></tr>
  </table>
  <p>Step 2 is where the diamond is resolved. <code>Account</code> is refused because another of its children, <code>Rewards</code>, has not been placed yet; that is the rule "a parent comes after all of its children" in action. Sometimes no valid order exists, and then Python refuses to create the class at all:</p>
  <div class="fx" data-lang="py">class Account: pass
class Overdraft(Account): pass

try:
    class Broken(Account, Overdraft):             # a parent listed BEFORE its own child
        pass
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: Cannot create a consistent method resolution order (MRO) for bases Account, Overdraft</div>
  <p>Here the bases say "<code>Account</code> before <code>Overdraft</code>", but <code>Overdraft</code> is a child of <code>Account</code> and must come before it. The two requirements contradict each other, so no order satisfies both. The fix is always to list the more specific class first.</p>

  <h2 id="pi-mixin"><span class="num">06</span>Mixins</h2>
  <p>Diamonds with several full account types are rare in practice. The everyday use of multiple inheritance is much smaller and safer: the <strong>mixin</strong>. A mixin is a small class that adds one well-defined feature, such as logging, auditing or conversion to JSON, and is designed to be combined with a "real" class rather than used on its own. Suppose the bank must keep an audit trail of every withdrawal, for basic and current accounts alike. Writing <code>AuditedBasicAccount</code> and <code>AuditedCurrentAccount</code> by hand would duplicate the audit code. A mixin writes it once, and any account class can take it on. It is like a phone case with a card holder: you clip it onto whichever phone you have, and that phone gains one extra feature without being rebuilt.</p>
  <p>A mixin relies completely on the MRO. Its methods do their small extra job and then pass the call on with <code>super()</code>, trusting that the next class in the MRO will do the real work. Because the mixin cannot know what arguments the real class's <code>__init__</code> needs, its own <code>__init__</code> accepts anything (<code>*args, **kwargs</code>) and passes it all along. Below, <code>CurrentAccount</code> is the overdraft account from the first section:</p>
  <div class="fx" data-lang="py"># (CurrentAccount is the overdraft account from the super() section)

class AuditMixin:                                 # adds ONE feature to any account class
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)         # pass every argument along the MRO
        self.audit_log = []

    def withdraw(self, amount):
        self.audit_log.append(("withdraw", amount))
        super().withdraw(amount)                  # hand on to the next class in the MRO

class AuditedCurrent(AuditMixin, CurrentAccount):
    pass

class AuditedBasic(AuditMixin, BankAccount):
    pass

dev = AuditedCurrent("Dev", 500, overdraft=1000)
dev.withdraw(1200)
print(dev.balance, dev.audit_log)
print([c.__name__ for c in AuditedCurrent.__mro__])

asha = AuditedBasic("Asha", 1000)
try:
    asha.withdraw(5000)
except ValueError as e:
    print("ValueError:", e, asha.audit_log)</div>
  <div class="fx" data-lang="text">-700 [('withdraw', 1200)]
['AuditedCurrent', 'AuditMixin', 'CurrentAccount', 'BankAccount', 'object']
ValueError: Not enough money [('withdraw', 5000)]</div>
  <p>Dev's audited current account recorded the withdrawal of 1200 and still used its overdraft to reach −700. The printed MRO explains how: <code>AuditedCurrent → AuditMixin → CurrentAccount → BankAccount → object</code>. When the mixin calls <code>super().withdraw(amount)</code>, the next class is <code>CurrentAccount</code>, even though <code>AuditMixin</code> itself has no parent except <code>object</code> and has never heard of current accounts. The same mixin combined with <code>BankAccount</code> sends the call to the basic withdraw instead, which refused Asha's 5000 after the attempt had been logged. One audit feature, written once, now works with any account class.</p>
  <p>The order in the class line matters. The mixin must be listed <em>before</em> the main class, so that it comes first in the MRO and gets the first chance to act:</p>
  <div class="fx" data-lang="py">class AuditMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.audit_log = []
    def withdraw(self, amount):
        self.audit_log.append(("withdraw", amount))
        super().withdraw(amount)

class WrongOrder(CurrentAccount, AuditMixin):     # the mixin listed LAST
    pass

dev = WrongOrder("Dev", 500, overdraft=1000)
dev.withdraw(1200)
print(dev.balance, getattr(dev, "audit_log", "no audit_log at all"))
print([c.__name__ for c in WrongOrder.__mro__])</div>
  <div class="fx" data-lang="text">-700 no audit_log at all
['WrongOrder', 'CurrentAccount', 'BankAccount', 'AuditMixin', 'object']</div>
  <p>With the mixin listed last, the MRO puts it after <code>CurrentAccount</code> and <code>BankAccount</code>. <code>CurrentAccount.withdraw</code> does all the work and never calls <code>super()</code>, so the mixin's <code>withdraw</code> is never reached. Worse, <code>BankAccount.__init__</code> does not call <code>super().__init__</code> either, so the mixin's <code>__init__</code> never ran and the object has no <code>audit_log</code> at all. This is the general rule of <strong>cooperative inheritance</strong>: a chain of <code>super()</code> calls works only if every class in it passes the call on, and mixins should be listed on the left. scikit-learn is built this way: <code>class LogisticRegression(LinearClassifierMixin, SparseCoefMixin, BaseEstimator)</code> combines several small mixins with one base class.</p>

  <h2 id="pi-comp"><span class="num">07</span>Composition over Inheritance</h2>
  <p>Inheritance combines features by creating a class for each combination. That is fine for one or two features, but it grows fast. Suppose accounts come in two kinds, savings and current, and each can independently have cashback, a student discount and auditing:</p>
  <div class="fx" data-lang="py">from itertools import product

kinds = ["Savings", "Current"]
extras = [("", "Cashback"), ("", "Student"), ("", "Audited")]
names = ["".join(parts) + kind + "Account"
         for kind in kinds for parts in product(*extras)]
print(len(names), "classes, for example:", names[-3:])</div>
  <div class="fx" data-lang="text">16 classes, for example: ['CashbackAuditedCurrentAccount', 'CashbackStudentCurrentAccount', 'CashbackStudentAuditedCurrentAccount']</div>
  <p>Three yes-or-no features on two kinds of account already need 16 classes, with names like <code>CashbackStudentAuditedCurrentAccount</code>; a fourth feature would double that to 32. There is a second problem too: an object's class is fixed when it is created, so if Chen upgrades his savings plan, the program would have to build a new object of a different class and copy everything across.</p>
  <p><strong>Composition</strong> takes a different approach. Instead of saying "a cashback savings account <em>is a</em> special kind of savings account", it says "an account <em>has an</em> interest rule and <em>has a</em> fee rule". Each rule becomes a small separate object, and the account stores those objects as attributes and hands work to them, which is called <strong>delegation</strong>. A mobile phone with a SIM slot is a good picture. To change network you swap the SIM; you do not buy a new phone. Inheritance is like a phone with the network built into the circuit board.</p>
  <div class="fx" data-lang="py">class FlatRate:                                   # interest policies: small, swappable parts
    def __init__(self, rate):
        self.rate = rate
    def interest(self, balance):
        return round(balance * self.rate, 2) if balance &gt; 0 else 0

class NoInterest:
    def interest(self, balance):
        return 0

class OverdraftFee:                               # fee policies
    def __init__(self, amount):
        self.amount = amount
    def fee(self, balance):
        return self.amount if balance &lt; 0 else 0

class NoFee:
    def fee(self, balance):
        return 0

class BankAccount:
    def __init__(self, owner, balance, interest=None, fees=None, overdraft=0):
        self.owner = owner
        self._balance = balance
        self.interest_policy = interest or NoInterest()   # HAS-A interest policy
        self.fee_policy = fees or NoFee()                 # HAS-A fee policy
        self.overdraft = overdraft

    @property
    def balance(self):
        return self._balance

    def withdraw(self, amount):
        if amount &gt; self._balance + self.overdraft:
            raise ValueError("Limit reached")
        self._balance -= amount

    def month_end(self):                          # delegate the parts that vary
        change = (self.interest_policy.interest(self._balance)
                  - self.fee_policy.fee(self._balance))
        self._balance = round(self._balance + change, 2)
        return change

chen = BankAccount("Chen", 1000, interest=FlatRate(0.04))
dev = BankAccount("Dev", 500, fees=OverdraftFee(100), overdraft=1000)
dev.withdraw(1200)
for acc in (chen, dev):
    acc.month_end()
    print(acc.owner, acc.balance)

chen.interest_policy = FlatRate(0.05)             # Chen upgrades: swap one part, same object
chen.month_end()
print(chen.owner, chen.balance)</div>
  <div class="fx" data-lang="text">Chen 1040.0
Dev -800
Chen 1092.0</div>
  <p>Each policy is a tiny class with one method: <code>FlatRate</code> and <code>NoInterest</code> compute interest, <code>OverdraftFee</code> and <code>NoFee</code> compute fees. There is now only one <code>BankAccount</code> class, and its <code>month_end</code> asks its two policy objects for the numbers. Chen, given <code>FlatRate(0.04)</code>, reaches 1040.0; Dev, given <code>OverdraftFee(100)</code> and an overdraft, ends at −800, exactly the results of the inheritance version. Then Chen upgrades: one assignment replaces his interest policy with <code>FlatRate(0.05)</code> on the same object, and the next month earns 5% of 1040, reaching 1092.0. No new class, no new object, no copied history. Any combination of features is just a different pair of policy objects, so the 16 classes are no longer needed.</p>
  <p>Composition also avoids a subtler problem called the <strong>fragile base class</strong>. Children in an inheritance tree depend on the details of their parent: which hooks it calls, in which order, which attributes it sets. A change to the parent that looks harmless, such as renaming a hook, can quietly break children written by other people. A composed part depends only on the one small method it provides, so the account and its policies can change independently, and each policy can be tested on its own with a number in and a number out.</p>
  <p>This is why the classic advice is "favour composition over inheritance". It does not mean "never inherit". Use inheritance for a genuine "is a" relationship in which the child can be used anywhere the parent is expected, as a savings account can be used anywhere a bank account is. Use composition for "has a" relationships and for combining or swapping behaviours. Libraries follow the same rule: a scikit-learn <code>Pipeline</code> <em>has</em> a list of steps, and a PyTorch model <em>has</em> layers.</p>

  <h2 id="pi-solid"><span class="num">08</span>SOLID Principles</h2>
  <p>As a program grows, the same kinds of pain keep coming back: a small change forces edits in many places, a new feature breaks old code, a test sends real text messages. <strong>SOLID</strong> is a set of five design principles, one per letter, collected by Robert C. Martin, that each prevent one of these pains. Python does not enforce any of them; they are guidelines that good designers apply when they feel the pain coming. We have already met several of them in disguise.</p>
  <p>The <strong>single responsibility principle</strong> says a class should have one reason to change, that is, one job. The class below has three: it holds the money rules, it sends text messages, and it formats statements. A change to the SMS wording, the statement layout or the withdrawal rule all mean editing the same class, and every edit risks breaking the other two jobs. The second version gives each job its own class:</p>
  <div class="fx" data-lang="py">class FatAccount:                                 # one class, three reasons to change
    def __init__(self, owner, balance):
        self.owner, self._balance, self.log = owner, balance, []

    def withdraw(self, amount):
        self._balance -= amount                                    # money rules
        self.log.append(("withdraw", amount))
        print(f"SMS to {self.owner}: you withdrew {amount}")       # messaging

    def statement(self):                                           # formatting
        return "\\n".join(f"{kind:&gt;9} {amt:&gt;6}" for kind, amt in self.log)

class Notifier:                                   # each class now has one job
    def send(self, who, text):
        print(f"SMS to {who}: {text}")

class StatementPrinter:
    def render(self, log):
        return "\\n".join(f"{kind:&gt;9} {amt:&gt;6}" for kind, amt in log)

class LeanAccount:
    def __init__(self, owner, balance, notifier):
        self.owner, self._balance, self.log = owner, balance, []
        self.notifier = notifier

    def withdraw(self, amount):
        self._balance -= amount
        self.log.append(("withdraw", amount))
        self.notifier.send(self.owner, f"you withdrew {amount}")

asha = LeanAccount("Asha", 1000, Notifier())
asha.withdraw(300)
print(StatementPrinter().render(asha.log))</div>
  <div class="fx" data-lang="text">SMS to Asha: you withdrew 300
 withdraw    300</div>
  <p><code>LeanAccount</code> only keeps the money and the log; sending is the <code>Notifier</code>'s job and layout is the <code>StatementPrinter</code>'s. Each piece can now be changed and tested on its own. The <strong>open/closed principle</strong> says code should be open for extension but closed for modification: adding a new behaviour should mean adding new code, not editing code that already works. The composed account from the previous section obeys it. A new interest rule, say a weekend bonus, is a new policy class passed to the account, and the <code>BankAccount</code> class itself is never opened. A long <code>if</code>/<code>elif</code> chain on account types breaks the principle, because every new type means editing the chain.</p>
  <p>The <strong>Liskov substitution principle</strong>, named after Barbara Liskov, says a child class must be usable anywhere its parent is expected, without surprising the code that uses it. Inheritance promises "a child is a parent", and the child must keep the parent's promises. A fixed deposit is money in the bank, so it is tempting to write <code>class FixedDeposit(BankAccount)</code>. But <code>BankAccount</code> promises that <code>withdraw</code> works whenever the balance is enough, and a fixed deposit cannot keep that promise:</p>
  <div class="fx" data-lang="py">class FixedDeposit(BankAccount):
    def withdraw(self, amount):                   # breaks the parent's promise
        raise PermissionError("Fixed deposit is locked for 12 months")

def pay_bill(acc, amount):
    """Written for BankAccount: works whenever the balance is enough."""
    acc.withdraw(amount)
    return f"{acc.owner} paid {amount}"

for acc in (BankAccount("Asha", 1000), FixedDeposit("Esha", 10000)):
    try:
        print(pay_bill(acc, 300))
    except Exception as e:
        print(f"{type(e).__name__}: {e}")</div>
  <div class="fx" data-lang="text">Asha paid 300
PermissionError: Fixed deposit is locked for 12 months</div>
  <p><code>pay_bill</code> was written for bank accounts and is correct for every real one: Asha paid 300. Given a <code>FixedDeposit</code>, which Python considers a <code>BankAccount</code>, it crashed with a <code>PermissionError</code> nobody expected. The child is not a safe substitute for its parent. The famous interview version of the same mistake uses shapes:</p>
  <div class="fx" data-lang="py">class Rect:
    def __init__(self, w, h):
        self.w, self.h = w, h
    def set_width(self, w):
        self.w = w
    def area(self):
        return self.w * self.h

class Square(Rect):
    def __init__(self, side):
        super().__init__(side, side)
    def set_width(self, w):                       # a square must keep its sides equal
        self.w = self.h = w

def stretch(shape):                               # expects: new area = 10 * old height
    shape.set_width(10)
    return shape.area()

print(stretch(Rect(5, 5)), stretch(Square(5)))    # expected 50 both times</div>
  <div class="fx" data-lang="text">50 100</div>
  <p><code>stretch</code> assumes what is true of any rectangle: setting the width leaves the height alone, so a 5 by 5 rectangle stretched to width 10 has area 50. A square must keep its sides equal, so its <code>set_width</code> also changes the height, and the area becomes 100. In mathematics a square is a rectangle; in code, a <code>Square</code> that inherits from <code>Rect</code> breaks the rectangle's behaviour. The fix in both cases is not to inherit. Model what each type can really do: for instance, a <code>Withdrawable</code> parent for accounts that allow withdrawals, and a separate <code>FixedDeposit</code> class that simply has no <code>withdraw</code> method, so no caller can be misled.</p>
  <p>The <strong>interface segregation principle</strong> says no class should be forced to provide methods it does not need. If one big interface demanded <code>deposit</code>, <code>withdraw</code>, <code>interest</code> and <code>overdraft</code>, a gift card would have to write fake versions that raise "not supported", which is a Liskov violation waiting to happen. Several small interfaces, each describing one ability, let every class provide only what it really supports and every function ask only for what it uses:</p>
  <div class="fx" data-lang="py">from typing import Protocol

class CanDeposit(Protocol):
    def deposit(self, amount: int) -&gt; None: ...

class CanWithdraw(Protocol):
    def withdraw(self, amount: int) -&gt; None: ...

class GiftCard:                                   # supports ONLY deposits
    def __init__(self, value):
        self.value = value
    def deposit(self, amount):
        self.value += amount

def top_up(target: CanDeposit, amount: int):      # asks only for what it uses
    target.deposit(amount)

card = GiftCard(250)
top_up(card, 750)
print(card.value, hasattr(card, "withdraw"))</div>
  <div class="fx" data-lang="text">1000 False</div>
  <p><code>top_up</code> only needs the ability to deposit, so it asks for <code>CanDeposit</code>. The gift card qualifies, its value going from 250 to 1000, without pretending to support withdrawals. Finally, the <strong>dependency inversion principle</strong> says that important code should depend on abstract ideas rather than concrete tools, and that the concrete tools should be passed in from outside. If <code>BankAccount</code> created a real SMS sender inside itself, every test would send real messages, and switching to e-mail would mean editing the account class. Instead the account depends only on "something with a <code>send(who, text)</code> method", and the actual sender is given to it. Passing an object's helpers in like this is called <strong>dependency injection</strong>:</p>
  <div class="fx" data-lang="py">class SMSNotifier:                                # the real thing
    def send(self, who, text):
        print(f"[SMS gateway] to {who}: {text}")

class FakeNotifier:                               # for tests: records instead of sending
    def __init__(self):
        self.sent = []
    def send(self, who, text):
        self.sent.append((who, text))

class BankAccount:
    def __init__(self, owner, balance, notifier):  # the dependency is PASSED IN
        self.owner = owner
        self._balance = balance
        self.notifier = notifier

    def withdraw(self, amount):
        if amount &gt; self._balance:
            self.notifier.send(self.owner, f"declined: {amount}")
            raise ValueError("Not enough money")
        self._balance -= amount
        self.notifier.send(self.owner, f"withdrew {amount}")

BankAccount("Asha", 1000, SMSNotifier()).withdraw(300)     # production

fake = FakeNotifier()
ben = BankAccount("Ben", 500, fake)                         # a test
try:
    ben.withdraw(800)
except ValueError:
    pass
print(fake.sent)</div>
  <div class="fx" data-lang="text">[SMS gateway] to Asha: withdrew 300
[('Ben', 'declined: 800')]</div>
  <p>In production, Asha's account was given the real <code>SMSNotifier</code>, and her withdrawal went through the SMS gateway. In the test, Ben's account was given a <code>FakeNotifier</code> that records messages instead of sending them, so the test can check that "declined: 800" was produced without any real message leaving the building. This is exactly how the fakes and mocks of <a class="xref" data-note="py_testing">Testing</a> are used. A wall socket is a good picture of the idea: a lamp depends on the standard socket, not on a particular power station, so you can plug it in anywhere.</p>
  <p>A word of balance: SOLID describes pains to avoid, not a score to maximise. Ten one-method classes for a fifty-line script are worse than one clear class. Apply a principle when you notice the pain it prevents: repeated edits, code that cannot be tested, or methods that only exist to raise "not supported".</p>

  <h2 id="pi-pat"><span class="num">09</span>Design Patterns</h2>
  <p>Many design problems come up again and again in object-oriented programs, and over the years programmers have given names to the standard solutions. Such a named, reusable solution is called a <strong>design pattern</strong>; the best-known collection is the 1994 book by the "Gang of Four". The value of the names is communication: saying "use a strategy here" tells a colleague the whole design in two words. Two patterns have already appeared on this page. The template method is the parent <code>month_end</code> calling hooks. The <strong>strategy</strong> pattern is the composed account: an object holds a replaceable algorithm, our interest and fee policies, and calls it without caring which one it is. In Python a strategy is often just a function, because functions are objects that can be stored and passed around (see <a class="xref" data-note="py_functions">Functions</a>); passing <code>key=len</code> to <code>sorted</code> is the strategy pattern in one argument.</p>
  <p>The <strong>factory</strong> pattern puts the decision "which class should I create?" in one place. Code that opens accounts should not be full of <code>if kind == "savings": ...</code> checks; it should say what it wants and let a factory choose the class. Think of a railway ticket counter: you say "sleeper class" and the clerk knows which form to issue.</p>
  <div class="fx" data-lang="py">class SavingsAccount(BankAccount):
    pass

ACCOUNT_TYPES = {"basic": BankAccount, "savings": SavingsAccount}

def open_account(kind, owner, balance):
    """Factory: the caller says WHAT it wants; this function picks the class."""
    try:
        cls = ACCOUNT_TYPES[kind]
    except KeyError:
        raise ValueError(f"unknown account type {kind!r}; choose from {sorted(ACCOUNT_TYPES)}")
    return cls(owner, balance)

for kind, owner, balance in [("savings", "Chen", 1000), ("basic", "Asha", 1000), ("crypto", "Eve", 1)]:
    try:
        acc = open_account(kind, owner, balance)
        print(type(acc).__name__, acc.owner, acc.balance)
    except ValueError as e:
        print("ValueError:", e)</div>
  <div class="fx" data-lang="text">SavingsAccount Chen 1000
BankAccount Asha 1000
ValueError: unknown account type 'crypto'; choose from ['basic', 'savings']</div>
  <p>The factory maps a word to a class through a dictionary, so adding a new product is one new line in <code>ACCOUNT_TYPES</code>, and an unknown type such as "crypto" produces a helpful error listing the valid choices. The <code>from_csv</code> class method in <a class="xref" data-note="py_classes">Classes &amp; Objects</a> is a factory too, and so is <code>AutoModel.from_pretrained(name)</code> in the Hugging Face library, which picks the right model class from a name.</p>
  <p>The <strong>observer</strong> pattern lets an object announce events to any number of interested listeners without knowing who they are. Our bank wants an SMS after every withdrawal and a fraud check on large ones. Putting both inside <code>withdraw</code> would tie the account to messaging and fraud rules (a single-responsibility problem) and mean editing the account for every new reaction. Instead, the account keeps a list of listener functions and calls each one after a withdrawal. It works like the bell icon on a video channel: subscribers register once, and every new video notifies all of them.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance
        self._listeners = []

    def subscribe(self, listener):                # anyone interested registers a function
        self._listeners.append(listener)

    def withdraw(self, amount):
        if amount &gt; self._balance:
            raise ValueError("Not enough money")
        self._balance -= amount
        for listener in self._listeners:          # tell every subscriber
            listener(self, amount)

def sms(acc, amount):
    print(f"  sms: {acc.owner} withdrew {amount}, balance {acc._balance}")

def fraud_check(acc, amount):
    if amount &gt;= 500:
        print(f"  fraud check: large withdrawal of {amount} by {acc.owner}")

asha = BankAccount("Asha", 1000)
asha.subscribe(sms)
asha.subscribe(fraud_check)
asha.withdraw(100)
asha.withdraw(600)</div>
  <div class="fx" data-lang="text">  sms: Asha withdrew 100, balance 900
  sms: Asha withdrew 600, balance 300
  fraud check: large withdrawal of 600 by Asha</div>
  <p>Both listeners heard about both withdrawals, but the fraud check reacted only to the 600, because it only cares about amounts of 500 or more. The account knows nothing about SMS or fraud; new reactions are added with <code>subscribe</code>, without touching the class. Training callbacks in Keras and PyTorch Lightning are this pattern.</p>
  <p>The <strong>singleton</strong> pattern ensures a class has only one object, shared by everyone, for something like the bank's global configuration. In Python it can be written by overriding <code>__new__</code>, the method that creates objects (see <a class="xref" data-note="py_classes">Classes &amp; Objects</a>), so that it returns the same object every time:</p>
  <div class="fx" data-lang="py">class BankConfig:
    _instance = None

    def __new__(cls):                             # decides WHICH object a call returns
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.settings = {"overdraft_fee": 100}
        return cls._instance

a, b = BankConfig(), BankConfig()
a.settings["overdraft_fee"] = 150
print(a is b, b.settings)</div>
  <div class="fx" data-lang="text">True {'overdraft_fee': 150}</div>
  <p>Both calls returned the same object, so a change through <code>a</code> is visible through <code>b</code>. Use this pattern sparingly. A singleton is global data in disguise: any part of the program can change it, and tests cannot easily reset it. In Python a module is already a single shared object, so a <code>config.py</code> file with module-level values, imported wherever it is needed, usually does the job more simply.</p>

  <h2 id="pi-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common design mistake is using inheritance for a "has a" relationship. An account has a list of transactions, so it is tempting to make the account <em>be</em> a list and inherit all its methods for free. But "all its methods" includes ones that make no sense for an account:</p>
  <div class="fx" data-lang="py">class BankAccount(list):                          # "an account is a list of transactions"?
    def __init__(self, owner):
        super().__init__()
        self.owner = owner

asha = BankAccount("Asha")
asha.append(("deposit", 1000))
asha.append(("withdraw", 300))
asha.clear()                                      # inherited: the whole history is gone
print(asha.owner, asha, len(asha))</div>
  <div class="fx" data-lang="text">Asha [] 0</div>
  <p>Because <code>BankAccount</code> inherits from <code>list</code>, every list method is part of the account, including <code>clear()</code>, which just wiped Asha's entire history. The account should <em>have</em> a list as a private attribute and offer only the operations that make sense, which is composition.</p>
  <p>The second mistake breaks cooperative inheritance: calling a parent by name, <code>Account.perks(self)</code>, instead of using <code>super()</code>. In a single chain it seems to work, but in a diamond it skips the MRO and can run the shared base more than once:</p>
  <div class="fx" data-lang="py">class Account:
    def perks(self):
        return ["basic"]

class Overdraft(Account):
    def perks(self):
        return ["overdraft"] + Account.perks(self)    # names the parent directly

class Rewards(Account):
    def perks(self):
        return ["cashback"] + Account.perks(self)

class Premium(Overdraft, Rewards):
    def perks(self):
        return ["lounge"] + Overdraft.perks(self) + Rewards.perks(self)

print(Premium().perks())                              # "basic" twice</div>
  <div class="fx" data-lang="text">['lounge', 'overdraft', 'basic', 'cashback', 'basic']</div>
  <p>Each class called its parent directly, and <code>Premium</code> called both parents directly, so <code>Account.perks</code> ran twice and "basic" appears twice. With <code>super()</code> in every class, as in the MRO section, each class runs exactly once. For the same reason, forgetting <code>super().__init__()</code> in a child leaves the parent's attributes missing, with an <code>AttributeError</code> appearing far from the cause, and a class in a cooperative chain that does not call <code>super()</code> silently cuts off every class after it, as the wrongly ordered mixin showed.</p>
  <p>Two further mistakes concern contracts. A child that breaks its parent's promises, like the fixed deposit that refuses withdrawals or the square that changes its height, violates the Liskov principle; the fix is not to inherit. And <code>@abstractmethod</code> on a class that does not inherit from <code>ABC</code> enforces nothing. Finally, remember that a <code>@runtime_checkable</code> protocol only checks that method names exist, so an <code>isinstance</code> check against it is a weak guarantee; the real check is the type checker.</p>

  <h2 id="pi-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Overriding</b>: a child method with the same name as a parent method. <b>Replace</b>: don't call the parent. <b>Extend</b>: add a step and call <code>super().method()</code>.</li>
    <li><b><code>super()</code></b>: the next class after the current one in <code>type(self).__mro__</code>; in single inheritance, the parent.</li>
    <li><b>Template method</b>: a parent method that fixes the steps and calls <b>hooks</b> that children override.</li>
    <li><b>Dynamic dispatch</b>: the method is looked up on the object's actual class when the call runs.</li>
    <li><b>Abstract base class</b>: inherits <code>ABC</code>; <code>@abstractmethod</code> methods must be written by children or objects cannot be created.</li>
    <li><b>Protocol</b>: <code>typing.Protocol</code> describing required methods; any class with them matches, no inheritance.</li>
    <li><b>MRO</b>: the order Python searches classes (<code>C.__mro__</code>), built by <b>C3 linearisation</b>.</li>
    <li><b>Mixin</b>: a small class adding one feature, listed first, calling <code>super()</code>.</li>
    <li><b>Composition</b>: an object holds other objects ("has a") and delegates work to them.</li>
  </ul>
  <h3>C3 in one line</h3>
  <p><code>MRO(C) = C + merge(MRO(P1), ..., MRO(Pn), [P1, ..., Pn])</code>; repeatedly take the first head that is in no list's tail. Guarantees: child before parents, parents in written order, each class once. No valid order → <code>TypeError: Cannot create a consistent method resolution order</code>.</p>
  <h3>ABC vs Protocol</h3>
  <table class="tbl">
    <tr><th></th><th>ABC</th><th>Protocol</th></tr>
    <tr><td>Qualify by</td><td>inheriting</td><td>having the methods</td></tr>
    <tr><td>Checked</td><td>at object creation</td><td>by a type checker; at run time only names (<code>@runtime_checkable</code>)</td></tr>
    <tr><td>Shared code</td><td>yes</td><td>no</td></tr>
  </table>
  <h3>SOLID</h3>
  <table class="tbl">
    <tr><th>Principle</th><th>Rule</th><th>Symptom when broken</th></tr>
    <tr><td>Single responsibility</td><td>one reason to change</td><td>an SMS wording change edits money code</td></tr>
    <tr><td>Open/closed</td><td>extend by adding code, not editing</td><td>growing <code>if</code>/<code>elif</code> on types</td></tr>
    <tr><td>Liskov substitution</td><td>child usable wherever the parent is</td><td>FixedDeposit refusing withdraw; Square/Rect</td></tr>
    <tr><td>Interface segregation</td><td>small, focused interfaces</td><td>methods that raise "not supported"</td></tr>
    <tr><td>Dependency inversion</td><td>depend on abstractions, inject them</td><td>a class creating its own SMS sender; untestable</td></tr>
  </table>
  <h3>Patterns</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Idea</th><th>Bank example</th></tr>
    <tr><td>Template method</td><td>parent steps, child hooks</td><td><code>month_end</code> calling <code>interest()</code>, <code>fee()</code></td></tr>
    <tr><td>Strategy</td><td>swappable algorithm object or function</td><td><code>FlatRate</code>, <code>OverdraftFee</code></td></tr>
    <tr><td>Factory</td><td>one place chooses the class</td><td><code>open_account("savings", ...)</code></td></tr>
    <tr><td>Observer</td><td>notify registered listeners</td><td>SMS and fraud check on withdraw</td></tr>
    <tr><td>Singleton</td><td>one shared instance</td><td><code>BankConfig</code>; prefer a module</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from abc import ABC, abstractmethod
from typing import Protocol

class Account(ABC):
    @abstractmethod
    def fee(self): ...                     # children must write this
    def month_end(self):                   # template method
        self._balance -= self.fee()

class AuditMixin:
    def withdraw(self, amount):
        print("audit", amount)
        super().withdraw(amount)           # next class in the MRO

class Audited(AuditMixin, CurrentAccount): # mixin first
    pass

class MonthEndable(Protocol):
    def month_end(self) -&gt; float: ...

print(Audited.__mro__)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Child <code>__init__</code> without <code>super().__init__()</code> → parent attributes missing, error appears later.</li>
    <li><code>Parent.method(self)</code> instead of <code>super()</code> skips the MRO; a diamond base may run twice.</li>
    <li>A class in a cooperative chain that doesn't call <code>super()</code> cuts off everything after it.</li>
    <li>Mixins go on the left of the class line.</li>
    <li><code>@abstractmethod</code> without <code>ABC</code> enforces nothing.</li>
    <li>Inheriting for "has a" exposes methods that make no sense (an account inheriting <code>list.clear</code>).</li>
    <li>A singleton is global state; a module is usually simpler.</li>
  </ul>

  <h2 id="pi-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>super()</code> do?</summary><div class="qa-body">It returns an object that continues method lookup from the class after the current one in the MRO of <code>type(self)</code>. In single inheritance that is simply the parent, so <code>super().__init__(...)</code> runs the parent's setup. With multiple inheritance it can be a sibling class, which is what lets every class in a diamond or a mixin chain run exactly once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between replacing and extending a parent method?</summary><div class="qa-body">Replacing means the child's method does the whole job and never calls the parent, as a current account's <code>withdraw</code> must because the parent forbids overdrafts. Extending means the child adds its own step and then calls <code>super().withdraw(amount)</code> so the parent's logic still runs, as a savings account with an extra per-withdrawal limit does. Extending avoids copying the parent's code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if a child's <code>__init__</code> does not call <code>super().__init__()</code>?</summary><div class="qa-body">The parent's <code>__init__</code> never runs, so the attributes it would have set do not exist. The object is created without error, and an <code>AttributeError</code> such as "'BrokenSavings' object has no attribute '_balance'" appears later, at first use, far from the cause.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Overriding vs overloading?</summary><div class="qa-body">Overriding is a child class defining a method with the same name as its parent's so that the child's version runs; Python supports it. Overloading is several methods with the same name but different parameter lists; Python does not support it, because a later <code>def</code> simply replaces the earlier one. Python uses default arguments, <code>*args</code> or <code>functools.singledispatchmethod</code> instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the template method pattern?</summary><div class="qa-body">A parent class method that defines the steps of an algorithm and calls separate hook methods for the parts that vary; subclasses override only the hooks. Our <code>Account.month_end</code> computes <code>self.interest() - self.fee()</code> and updates the balance, while savings and current accounts override one hook each. PyTorch's <code>nn.Module.__call__</code> running your <code>forward</code> is the same shape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dynamic dispatch?</summary><div class="qa-body">Choosing which method to run by looking at the object's actual class at the moment of the call. When <code>Account.month_end</code> calls <code>self.fee()</code> on a current account, Python searches from <code>CurrentAccount</code> and runs its <code>fee</code>, even though the calling code lives in the parent. It is the mechanism behind polymorphism.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if a subclass of an ABC does not implement every abstract method?</summary><div class="qa-body">The class itself is created, but trying to create an object from it raises <code>TypeError: Can't instantiate abstract class FixedDeposit without an implementation for abstract method 'fee'</code>. The error appears at object creation, not when the missing method would be called. The ABC itself cannot be instantiated either.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ABC vs Protocol: when do you use each?</summary><div class="qa-body">An ABC is for a family of classes you design: subclasses must inherit from it, missing abstract methods block object creation, and it can contain shared code. A <code>typing.Protocol</code> describes required methods structurally: any class with those methods matches without inheriting, which suits objects from code you don't control, and it is checked mainly by type checkers. <code>@runtime_checkable</code> allows <code>isinstance</code> checks, but those only test that the names exist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the MRO and how is it computed?</summary><div class="qa-body">The method resolution order, <code>C.__mro__</code>, is the list of classes Python searches, in order, when looking up an attribute. It is computed by C3 linearisation: merge the parents' MROs and the list of parents, repeatedly taking the first head that does not appear in any list's tail. It guarantees that a class comes before its parents, parents keep their written order, and each class appears once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>A.hi</code> returns <code>"A"</code>; <code>B(A)</code>, <code>C(A)</code> and <code>D(B, C)</code> each return their own letter + <code>super().hi()</code>; <code>print(D().hi())</code></summary><div class="qa-body"><code>DBCA</code>. The MRO of D is D, B, C, A, object. The <code>super()</code> call inside B goes to C, the next class in D's MRO, not to A, so A runs exactly once at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does Python refuse to create a class because of the MRO?</summary><div class="qa-body">When no order satisfies all the C3 rules, for example <code>class Broken(Account, Overdraft)</code> where <code>Overdraft</code> inherits from <code>Account</code>: the base list demands Account before Overdraft, but a child must come before its parent. Python raises <code>TypeError: Cannot create a consistent method resolution order (MRO)</code>. Listing the more specific class first fixes it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a mixin, and why must it call <code>super()</code>?</summary><div class="qa-body">A mixin is a small class that adds one feature, such as auditing or logging, to any class it is combined with, and is not meant to be used alone. It is listed before the main class and does its extra work before passing the call on with <code>super()</code>, which reaches the main class through the object's MRO. Without the <code>super()</code> call, the real method would never run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Composition vs inheritance: which do you prefer and why?</summary><div class="qa-body">Composition by default. An object that holds parts, such as an interest policy or a notifier, can combine and swap behaviours at run time, avoids one subclass per combination of features, and does not depend on a parent's internals (the fragile base class problem). Inheritance is right for a genuine "is a" relationship where the child keeps every promise of the parent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Liskov substitution principle? Give a violation.</summary><div class="qa-body">A child class must be usable anywhere its parent is expected without breaking the caller's assumptions. Classic violation: <code>Square(Rect)</code> whose <code>set_width</code> also changes the height, so code expecting area 50 after widening a 5 by 5 shape to 10 gets 100. Another: a <code>FixedDeposit(BankAccount)</code> whose <code>withdraw</code> always raises. The fix is to not inherit and to model only the abilities each type really has.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the SOLID principles in one line each.</summary><div class="qa-body">Single responsibility: a class has one reason to change. Open/closed: add behaviour by adding code, not by editing working code. Liskov substitution: subclasses must honour the parent's contract. Interface segregation: prefer several small interfaces so no class implements methods it cannot support. Dependency inversion: depend on abstractions and pass concrete dependencies in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dependency injection, and why does it help testing?</summary><div class="qa-body">It means giving an object its collaborators from outside, usually as constructor arguments, instead of letting it create them: <code>BankAccount(owner, balance, notifier)</code>. Production passes a real SMS sender; a test passes a fake that records messages, so the test is fast, has no side effects and can check what would have been sent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the strategy, factory and observer patterns with an example each.</summary><div class="qa-body">Strategy: an object holds an interchangeable algorithm and calls it, like an account holding a <code>FlatRate</code> interest policy, or <code>sorted(key=len)</code>. Factory: one function or class method decides which class to create, like <code>open_account("savings", ...)</code> or <code>AutoModel.from_pretrained</code>. Observer: an object keeps a list of listeners and notifies them on events, like SMS and fraud checks on withdrawals, or training callbacks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a singleton in Python, and should you?</summary><div class="qa-body">Override <code>__new__</code> to create the object once, store it on the class, and return the stored object on every later call. Usually you should not: a singleton is global state that any code can change and tests cannot easily reset. A module is already a single shared object, so a module of configuration values is the simpler Python answer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the fragile base class problem?</summary><div class="qa-body">Subclasses depend on internal details of their parent, such as which hooks it calls, in what order, and which attributes it sets, so a seemingly safe change to the parent silently breaks subclasses elsewhere. Deep hierarchies make it worse. Composition limits it, because a composed part depends only on the small public method it implements.</div></details>
</main>
`
});
