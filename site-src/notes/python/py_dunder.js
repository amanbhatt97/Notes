// notes/python/py_dunder.js — Dunder Methods & the Data Model
Object.assign(TOPIC_CONTENT, {
  "py_dunder": `<main>
<h1>Dunder Methods &amp; the Data Model</h1>
  <div class="where"><span>Python</span><span>Object-Oriented Python</span><span>Dunder Methods &amp; the Data Model</span></div>
  <p class="lead">The <code>BankAccount</code> class from <a class="xref" data-note="py_oop">OOP Concepts in Python</a> works, but it does not feel like a real Python type: printing an account shows a memory address, and <code>len()</code>, <code>+</code>, <code>==</code> and <code>for</code> either fail or do something unhelpful. Built-in types such as lists and numbers support all of these because every piece of Python syntax is secretly a call to a method with a special double-underscore name, like <code>__len__</code> or <code>__add__</code>. These methods, and the rules for how Python uses them, are called the <strong>data model</strong>, and writing them in your own classes is how your objects can be printed nicely, compared, added, looped over, called like functions and used in <code>with</code> blocks. It is also how NumPy arrays add element by element, how pandas supports <code>df["col"]</code>, and why a PyTorch model can be called as <code>model(x)</code>. We continue with the bank: first the account itself, then a <code>Money</code> type for exact amounts, an account statement that behaves like a list, a callable fee rule and a safe transfer.</p>

  <h2 id="pd-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dunder Methods</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The data model</div>
        <ul>
          <li>Syntax calls special methods: <code>len(x)</code> → <code>type(x).__len__(x)</code></li>
          <li>Looked up on the class, never on the object</li>
          <li>Return <code>NotImplemented</code> to let the other operand try</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Text and comparison</div>
        <ul>
          <li><code>__repr__</code> for developers, <code>__str__</code> for users; always write repr</li>
          <li><code>__eq__</code> + <code>__hash__</code>: equal objects need equal hashes</li>
          <li><code>__lt__</code> + <code>@total_ordering</code> for sorting and comparing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Operators</div>
        <ul>
          <li><code>__add__</code>, <code>__sub__</code>, <code>__mul__</code> return new objects</li>
          <li>Reflected <code>__radd__</code>, <code>__rmul__</code> make <code>3 * m</code> and <code>sum()</code> work</li>
          <li><code>__bool__</code> decides truthiness</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Protocols</div>
        <ul>
          <li>Container: <code>__len__</code>, <code>__getitem__</code>, <code>__contains__</code>, <code>__iter__</code></li>
          <li><code>__call__</code>: objects used like functions</li>
          <li><code>__enter__</code>/<code>__exit__</code>: setup and guaranteed cleanup in <code>with</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pd-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Data Model</span><span class="rm-sub">how syntax turns into method calls</span></div></div>
      <div class="rm-item rm-done" data-target="pd-repr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">__repr__ and __str__</span><span class="rm-sub">text for developers and text for users</span></div></div>
      <div class="rm-item rm-done" data-target="pd-eq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Equality and Hashing</span><span class="rm-sub">a Money type, __eq__ and __hash__</span></div></div>
      <div class="rm-item rm-done" data-target="pd-order"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Ordering</span><span class="rm-sub">__lt__ and total_ordering</span></div></div>
      <div class="rm-item rm-done" data-target="pd-arith"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Operator Overloading</span><span class="rm-sub">+, -, *, sum() and NotImplemented</span></div></div>
      <div class="rm-item rm-done" data-target="pd-container"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Container Protocol</span><span class="rm-sub">a statement that behaves like a list</span></div></div>
      <div class="rm-item rm-done" data-target="pd-call"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Callable Objects</span><span class="rm-sub">__call__: a function with settings</span></div></div>
      <div class="rm-item rm-done" data-target="pd-with"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Context Manager Methods</span><span class="rm-sub">__enter__ and __exit__ for a safe transfer</span></div></div>
      <div class="rm-item rm-done" data-target="pd-all"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Putting It Together</span><span class="rm-sub">an account built from dunder methods</span></div></div>
      <div class="rm-item rm-done" data-target="pd-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">NotImplemented, swallowed errors, hashing</span></div></div>
      <div class="rm-item rm-done" data-target="pd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">the hook table and the rules</span></div></div>
      <div class="rm-item rm-done" data-target="pd-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">repr, hash, operators, protocols</span></div></div>
    </div>
  </div>

  <h2 id="pd-model"><span class="num">01</span>The Data Model: How Syntax Becomes Method Calls</h2>
  <p>Let us start with the problem. Here is the encapsulated <code>BankAccount</code> from <a class="xref" data-note="py_oop">OOP Concepts in Python</a>, and a few things we might naturally want to do with an account:</p>
  <div class="fx" data-lang="py"># (BankAccount is the encapsulated class from OOP Concepts)
asha = BankAccount("Asha", 1000)
ben = BankAccount("Ben", 500)
print(asha)
print([asha, ben])
for expr in ("len(asha)", "asha + ben", "'deposit' in asha"):
    try:
        eval(expr)
    except TypeError as e:
        print(f"{expr:18} -&gt; TypeError: {e}")</div>
  <div class="fx" data-lang="text">&lt;__main__.BankAccount object at 0x7f172be6f0e0&gt;
[&lt;__main__.BankAccount object at 0x7f172be6f0e0&gt;, &lt;__main__.BankAccount object at 0x7f172bb3ccd0&gt;]
len(asha)          -&gt; TypeError: object of type 'BankAccount' has no len()
asha + ben         -&gt; TypeError: unsupported operand type(s) for +: 'BankAccount' and 'BankAccount'
'deposit' in asha  -&gt; TypeError: argument of type 'BankAccount' is not iterable</div>
  <p>Printing Asha's account shows only the class name and a memory address, which tells us nothing about whose account it is or how much it holds, and a list of accounts is just a list of addresses. Asking for its length, adding two accounts or checking whether it contains a deposit all fail with a <code>TypeError</code>. Python simply does not know what these operations should mean for a bank account. Yet the same operations work perfectly on strings, lists and numbers. What do those types have that our class lacks?</p>
  <p>The answer is that most of Python's syntax is a thin layer over method calls. When you write <code>len(words)</code>, Python actually runs <code>type(words).__len__(words)</code>. When you write <code>3 + 4</code>, it runs <code>int.__add__(3, 4)</code>. Every operator, many built-in functions and statements like <code>for</code> and <code>with</code> work this way: they look for a method with a particular special name on the object's class and call it. These special names begin and end with two underscores, and are called <strong>dunder methods</strong> ("double underscore"), also known as magic or special methods. You already know one: <code>__init__</code> is the dunder method behind <code>BankAccount(...)</code>. The full set of these hooks, together with the rules for how Python uses them, is called the Python <strong>data model</strong>.</p>
  <div class="fx" data-lang="py">print(3 + 4, int.__add__(3, 4), type(3).__add__(3, 4))
words = ["deposit", "withdraw"]
print(len(words), type(words).__len__(words))
print("withdraw" in words, type(words).__contains__(words, "withdraw"))
print(words[1], type(words).__getitem__(words, 1))</div>
  <div class="fx" data-lang="text">7 7 7
2 2
True True
withdraw withdraw</div>
  <p>Each line prints the same result twice or three times: the familiar syntax on the left and the method call it turns into on the right. Think of the light switches in a house. You press a switch without thinking about wires, but every switch is connected to a specific circuit. Python's syntax is the switch, and a dunder method is the circuit behind it. If your class does not wire up <code>__len__</code>, pressing the <code>len()</code> switch does nothing but produce an error; once you write <code>__len__</code>, the switch works for your objects exactly as it does for lists.</p>
  <p>One detail of the wiring matters for everything that follows: Python looks for dunder methods on the object's <em>class</em>, not on the object itself. That is why the call is written <code>type(x).__len__(x)</code> rather than <code>x.__len__()</code>.</p>
  <div class="fx" data-lang="py">class Statement:
    def __init__(self, rows):
        self.rows = rows

    def __len__(self):                     # defined on the CLASS
        return len(self.rows)

s = Statement(["open", "deposit", "withdraw"])
print(len(s))
s.__len__ = lambda: 99                     # stick a __len__ on this one OBJECT
print(len(s), s.__len__())                 # len() ignores it: it asks the class</div>
  <div class="fx" data-lang="text">3
3 99</div>
  <p><code>len(s)</code> gave 3. Then we attached a different <code>__len__</code> to this one object; calling it directly returns 99, but <code>len(s)</code> still gives 3, because <code>len</code> asks the class and never looks at the object's own attributes. This rule keeps every object of a type behaving consistently and makes these lookups fast. The practical consequence is simple: dunder methods are always written in the class body. Writing them for your own class, so that operators like <code>+</code> or <code>==</code> gain a meaning for your type, is called <strong>operator overloading</strong>. The rest of this page goes through the most important hooks one at a time, each solving a real problem in the bank.</p>

  <h2 id="pd-repr"><span class="num">02</span>__repr__ and __str__</h2>
  <p>The first problem was printing. Python actually has two text forms for every object, because there are two different audiences. A developer debugging the bank wants to see exactly what an object is, unambiguously, ideally in a form that could be typed back into Python. A customer reading a statement wants something friendly. The method <strong><code>__repr__</code></strong> (short for "representation") returns the developer's text, and <strong><code>__str__</code></strong> returns the user's text. A cheque shows the same idea: the amount written in words is for people, while the code printed along the bottom edge is exact and meant for machines.</p>
  <p>Python chooses between them depending on where the text is needed. <code>print()</code>, <code>str()</code> and f-strings use <code>__str__</code>. The <code>repr()</code> function, the interactive shell, debuggers and, importantly, the items shown inside a list or dictionary use <code>__repr__</code>.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance

    def __repr__(self):                    # for developers: exact, looks like code
        return f"BankAccount({self.owner!r}, {self._balance!r})"

    def __str__(self):                     # for users: friendly
        return f"{self.owner}: ₹{self._balance:,}"

asha = BankAccount("Asha", 125000)
ben = BankAccount("Ben", 500)
print(asha)                                # print -&gt; str() -&gt; __str__
print(repr(asha))                          # repr() -&gt; __repr__
print([asha, ben])                         # a list shows its items with repr
print(f"Statement for {asha} | debug: {asha!r}")</div>
  <div class="fx" data-lang="text">Asha: ₹125,000
BankAccount('Asha', 125000)
[BankAccount('Asha', 125000), BankAccount('Ben', 500)]
Statement for Asha: ₹125,000 | debug: BankAccount('Asha', 125000)</div>
  <p><code>print(asha)</code> used <code>__str__</code> and showed the friendly <code>Asha: ₹125,000</code>, with a thousands separator. <code>repr(asha)</code> gave <code>BankAccount('Asha', 125000)</code>, which is valid Python that would rebuild the same account; the <code>!r</code> inside the f-string adds the quotes around the name by calling <code>repr</code> on it. The list of accounts used <code>__repr__</code> for each item, so a debug print of many accounts is now readable. In the f-string, <code>{asha}</code> used the friendly form and <code>{asha!r}</code> the developer form.</p>
  <p>The two methods are not symmetrical, and that decides which one to write first:</p>
  <div class="fx" data-lang="py">class OnlyRepr:
    def __repr__(self):
        return "OnlyRepr()"

class OnlyStr:
    def __str__(self):
        return "friendly text"

print(OnlyRepr(), [OnlyRepr()])            # str() falls back to __repr__
print(OnlyStr(), [OnlyStr()])              # but repr() never falls back to __str__</div>
  <div class="fx" data-lang="text">OnlyRepr() [OnlyRepr()]
friendly text [&lt;__main__.OnlyStr object at 0x7f7d65b78cd0&gt;]</div>
  <p>A class with only <code>__repr__</code> prints well everywhere, because when <code>__str__</code> is missing, <code>str()</code> falls back to <code>__repr__</code>. A class with only <code>__str__</code> prints nicely on its own, but inside a list it shows a memory address again, because <code>repr()</code> never falls back to <code>__str__</code>. Hence the rule: always write <code>__repr__</code>, and add <code>__str__</code> only when users need a different, friendlier text. Both must return a string, and since loggers and debuggers call <code>__repr__</code> often, it should be quick and must not change the object. (A dataclass writes a <code>__repr__</code> for you, as <a class="xref" data-note="py_classes">Classes &amp; Objects</a> showed.)</p>

  <h2 id="pd-eq"><span class="num">03</span>Equality and Hashing: __eq__ and __hash__</h2>
  <p>By default, <code>==</code> on two objects of your class asks only "are these the very same object?", the same question as <code>is</code>. Whether that is right depends on what the objects represent:</p>
  <div class="fx" data-lang="py">asha = BankAccount("Asha", 1000)
twin = BankAccount("Asha", 1000)           # same details, but a different account
print(asha == twin, asha == asha)

print(0.1 + 0.2, 0.1 + 0.2 == 0.3)         # floats cannot store most decimals exactly
total = 0.0
for _ in range(10):                        # ten cashback credits of 10 paise
    total += 0.10
print(total, total == 1.0)</div>
  <div class="fx" data-lang="text">False True
0.30000000000000004 False
0.9999999999999999 False</div>
  <p>Two accounts with the same owner and the same balance are still two different accounts; if Asha opened two accounts with 1000 each, a deposit into one must not appear in the other. So for accounts, the default <code>asha == twin</code> being <code>False</code> is correct. Objects like this, whose identity matters, are often called <em>entities</em>. Amounts of money are different: two ₹500 notes with different serial numbers are different pieces of paper but the same <em>value</em>, and code should treat them as equal. Objects compared by their contents are called <em>value objects</em>.</p>
  <p>The bottom half of the output shows why the bank needs a proper value type for money. Floats are stored in binary, and most decimal fractions such as 0.1 have no exact binary form, just as 1/3 has no exact decimal form. So 0.1 + 0.2 is not quite 0.3, and ten cashback credits of 10 paise add up to 0.9999999999999999 instead of 1. For money that is unacceptable (see <a class="xref" data-note="py_values">Values &amp; Types</a> for how floats are stored). The standard fix is to store amounts as a whole number of paise, an integer, which is always exact. So we write a <code>Money</code> class. It keeps the amount in paise, has the two text methods from the previous section, and defines <strong><code>__eq__</code></strong>, the method behind <code>==</code>, so that two Money objects are equal when their paise and currency are equal.</p>
  <div class="fx" data-lang="py">class Money:
    def __init__(self, rupees=0, currency="INR"):
        self.paise = round(rupees * 100)       # whole paise: an exact integer
        self.currency = currency

    def _text(self):                           # 125050 -&gt; "1,250.50"
        sign = "-" if self.paise &lt; 0 else ""
        rupees, paise = divmod(abs(self.paise), 100)
        return f"{sign}{rupees:,}.{paise:02d}"

    def __repr__(self):
        return f"Money({self.paise / 100}, {self.currency!r})"

    def __str__(self):
        return f"₹{self._text()}" if self.currency == "INR" else f"{self._text()} {self.currency}"

    def __eq__(self, other):                   # equal when the VALUE is equal
        if not isinstance(other, Money):
            return NotImplemented              # "I don't know how to compare with that"
        return (self.paise, self.currency) == (other.paise, other.currency)

a, b = Money(500), Money(500.00)
print(a, repr(a))
print(a == b, a is b, a != Money(100))
print(a == 500, Money(500, "USD") == a)
print(Money.__hash__)
try:
    {a}
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">₹500.00 Money(500.0, 'INR')
True False True
False False
None
TypeError: unhashable type: 'Money'</div>
  <p><code>Money(500)</code> prints as <code>₹500.00</code> and its repr is <code>Money(500.0, 'INR')</code>. <code>a == b</code> is now <code>True</code> because the values match, while <code>a is b</code> is still <code>False</code>: two objects, one value. <code>!=</code> works too, because Python derives it from <code>__eq__</code>. Notice what <code>__eq__</code> does when the other object is not a Money: it returns <code>NotImplemented</code>. This is a special built-in value meaning "I don't know how to compare myself with that; ask the other object". For <code>a == 500</code>, Money said <code>NotImplemented</code>, the integer 500 also had no idea how to compare with a Money, so Python fell back to identity and answered <code>False</code>. Different currencies are not equal either.</p>
  <p>Then comes a surprise: <code>Money.__hash__</code> is <code>None</code>, and putting a Money into a set raises "unhashable type". To understand why, you need to know how sets and dictionaries find things. They do not compare a new item with every stored item; that would be slow. Instead, they first call <code>hash(x)</code>, which turns the object into a number, the <strong>hash</strong>, and use that number to jump straight to one small group of items, called a bucket. Only inside that bucket do they use <code>==</code>. It is like a library that shelves books by the first letter of the author's name: to find a book, you go straight to the right shelf and only compare titles there. This only works if equal objects always produce equal hashes; otherwise two equal objects could be put on different shelves. That is the <strong>hash contract</strong>: if <code>a == b</code>, then <code>hash(a) == hash(b)</code>.</p>
  <p>The default hash is based on an object's identity, which is consistent with the default <code>==</code>. But once we define <code>__eq__</code> by value, two equal Money objects would still have different identity-based hashes, which breaks the contract. To protect us, Python automatically sets <code>__hash__</code> to <code>None</code> whenever a class defines <code>__eq__</code> without defining <code>__hash__</code>. Here is the bug it prevents, created on purpose by forcing the identity hash back:</p>
  <div class="fx" data-lang="py">class BadMoney:                                # equal by value, but keeps the identity hash
    def __init__(self, paise):
        self.paise = paise
    def __eq__(self, other):
        return self.paise == other.paise
    __hash__ = object.__hash__                 # forcing the default hash back: a mistake

x, y = BadMoney(50000), BadMoney(50000)
print(x == y, hash(x) == hash(y))
print(len({x, y}))                             # two "equal" items in one set</div>
  <div class="fx" data-lang="text">True False
2</div>
  <p><code>x == y</code> is <code>True</code>, but their hashes differ, so the set put them in different buckets, never compared them, and kept both: a set containing two "equal" items. The correct fix is a <strong><code>__hash__</code></strong> built from exactly the fields that <code>__eq__</code> compares, usually by hashing a tuple of them:</p>
  <div class="fx" data-lang="py">class Money(Money):                            # the Money above, plus a hash
    def __hash__(self):                        # equal Money -&gt; equal hash
        return hash((self.paise, self.currency))

a, b = Money(500), Money(500.00)
print(hash(a) == hash(b), len({a, b, Money(100)}))
notes = {Money(500): 2, Money(100): 3}         # Money as dictionary keys
print(notes[Money(500)])

wallet = {a}
a.paise = 99                                   # change an object while it is in a set
print(a in wallet, Money(0.99) in wallet, wallet)</div>
  <div class="fx" data-lang="text">True 2
2
False False {Money(0.99, 'INR')}</div>
  <p>Equal amounts now have equal hashes. The set <code>{a, b, Money(100)}</code> holds 2 items, because the two ₹500 values count once, and Money works as a dictionary key: <code>notes[Money(500)]</code> finds the entry stored under a different but equal Money object. The last lines show the second half of the contract. We changed <code>a.paise</code> while <code>a</code> was inside a set. The set had filed it on the shelf for its old hash; now every lookup computes the new hash and searches the wrong shelf, so <code>a in wallet</code> is <code>False</code> even though the object is plainly still inside. The rule is that an object's hash must never change while it is stored in a set or used as a key, which in practice means that hashable value objects should be immutable. Our Money methods will always return new objects rather than changing <code>paise</code>, and a <code>@dataclass(frozen=True)</code> enforces this automatically.</p>

  <h2 id="pd-order"><span class="num">04</span>Ordering: __lt__ and total_ordering</h2>
  <p>The bank wants to sort bills by amount and find the largest one. <code>sorted()</code>, <code>min()</code> and <code>max()</code> all work by asking one question over and over: "is this item less than that one?". That question is the <code>&lt;</code> operator, and its dunder method is <strong><code>__lt__</code></strong> ("less than"). Arranging a queue of people by height works the same way: you only ever need to ask "is A shorter than B?". Comparing rupees with dollars would be meaningless, so our <code>__lt__</code> refuses that with an error, and it returns <code>NotImplemented</code> for objects that are not Money at all. (To keep the code short, each step in this and the next section extends the Money class above by inheriting from it, <code>class Money(Money)</code>; the finished class appears in one piece at the end of the page.)</p>
  <div class="fx" data-lang="py">class Money(Money):
    def __lt__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        if self.currency != other.currency:
            raise ValueError(f"cannot compare {self.currency} with {other.currency}")
        return self.paise &lt; other.paise

bills = [Money(1200), Money(300), Money(50.5)]
print(sorted(bills), max(bills))
print(Money(300) &lt; Money(500), Money(500) &gt; Money(300))   # &gt; works: Python tries 300 &lt; 500
try:
    Money(300) &lt;= Money(500)
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">[Money(50.5, 'INR'), Money(300.0, 'INR'), Money(1200.0, 'INR')] ₹1,200.00
True True
TypeError: '&lt;=' not supported between instances of 'Money' and 'Money'</div>
  <p>Sorting and <code>max</code> worked with nothing but <code>__lt__</code>: the bills came out as ₹50.50, ₹300 and ₹1,200. <code>Money(500) &gt; Money(300)</code> also worked even though we never wrote a "greater than" method. Python first tried <code>__gt__</code> on the left object, found nothing, and then tried the mirror question on the right object: <code>Money(300) &lt; Money(500)</code>. This swapping of sides is called <strong>reflection</strong>, and the reflected partner of <code>&gt;</code> is <code>&lt;</code>. But <code>&lt;=</code> failed, because its reflected partner is <code>&gt;=</code>, which we have not written either. Writing all four comparison methods by hand would be repetitive, so the standard library offers a shortcut:</p>
  <div class="fx" data-lang="py">from functools import total_ordering

@total_ordering                        # writes &lt;=, &gt; and &gt;= from __lt__ and __eq__
class Money(Money):
    pass

print(Money(300) &lt;= Money(500), Money(500) &gt;= Money(500), Money(300) &gt; Money(500))
try:
    Money(10, "USD") &lt; Money(10)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">True True False
ValueError: cannot compare USD with INR</div>
  <p>The decorator <code>@functools.total_ordering</code> looked at our <code>__eq__</code> and <code>__lt__</code> and wrote the missing <code>__le__</code>, <code>__gt__</code> and <code>__ge__</code> for us, for example treating <code>a &lt;= b</code> as "<code>a &lt; b</code> or <code>a == b</code>". All three comparisons now give the right answers, and comparing dollars with rupees is still refused. Whatever comparisons you define, they should agree with equality: if neither <code>a &lt; b</code> nor <code>b &lt; a</code> is true, then <code>a == b</code> should be true, or sorting can produce strange results. (A dataclass with <code>order=True</code> generates all four comparisons from its fields.)</p>

  <h2 id="pd-arith"><span class="num">05</span>Operator Overloading: +, -, * and NotImplemented</h2>
  <p>A balance is updated by adding and subtracting amounts, interest is a balance multiplied by a rate, and a statement total is the <code>sum()</code> of many amounts. For Money these should behave just like arithmetic on numbers. The dunder methods are <strong><code>__add__</code></strong> for <code>+</code>, <strong><code>__sub__</code></strong> for <code>-</code> and <strong><code>__mul__</code></strong> for <code>*</code>. Each should return a <em>new</em> Money and leave both operands unchanged, exactly as <code>3 + 4</code> produces 7 without changing the 3. That also keeps Money immutable, which the previous section showed is required for anything hashable.</p>
  <p>The interesting part is what happens when the two operands are of different types. For <code>a + b</code>, Python first calls <code>a.__add__(b)</code>. If that method does not exist, or returns <code>NotImplemented</code>, Python gives the right-hand operand a turn by calling its <strong>reflected</strong> method, <code>b.__radd__(a)</code> (the "r" stands for right or reflected). Only if both decline does Python raise a <code>TypeError</code>. Think of a shop with two counters: if the first cashier says "I only handle rupees", you try the second counter, and only when both refuse are you turned away. This second chance is what makes <code>3 * Money(100)</code> and <code>sum()</code> work.</p>
  <div class="fx" data-lang="py">from functools import total_ordering
@total_ordering
class Money(Money):
    @classmethod
    def _from_paise(cls, paise, currency):      # build a Money directly from paise
        m = cls(0, currency)
        m.paise = paise
        return m

    def _same_currency(self, other):
        if self.currency != other.currency:
            raise ValueError(f"cannot mix {self.currency} and {other.currency}")

    def __add__(self, other):                   # self + other
        if not isinstance(other, Money):
            return NotImplemented
        self._same_currency(other)
        return Money._from_paise(self.paise + other.paise, self.currency)  # a NEW object

    def __radd__(self, other):                  # other + self, when other gave up
        if other == 0:                          # sum() starts from 0
            return self
        return NotImplemented

    def __sub__(self, other):                   # self - other
        if not isinstance(other, Money):
            return NotImplemented
        self._same_currency(other)
        return Money._from_paise(self.paise - other.paise, self.currency)

    def __mul__(self, factor):                  # self * number
        if not isinstance(factor, (int, float)):
            return NotImplemented
        return Money._from_paise(round(self.paise * factor), self.currency)

    __rmul__ = __mul__                          # number * self: same calculation

    def __neg__(self):                          # -self
        return Money._from_paise(-self.paise, self.currency)

    def __bool__(self):                         # Money(0) counts as "nothing"
        return self.paise != 0

print(Money(0.1) + Money(0.2), Money(0.1) + Money(0.2) == Money(0.3))
cashback = [Money(0.10)] * 10
print(sum(cashback), sum(cashback) == Money(1))
balance = Money(1000) + Money(200) - Money(300)
print(balance, balance * 0.04, 3 * Money(100), -Money(300))
print(bool(Money(0)), bool(balance))</div>
  <div class="fx" data-lang="text">₹0.30 True
₹1.00 True
₹900.00 ₹36.00 ₹300.00 ₹-300.00
False True</div>
  <p>₹0.10 + ₹0.20 is exactly ₹0.30 and compares equal to it: the float problem has disappeared, because 10 paise plus 20 paise is integer arithmetic. Ten cashback credits of ₹0.10 now sum to exactly ₹1.00. Asha's 1000 + 200 − 300 gives ₹900.00, and 4% interest on it is ₹36.00. <code>3 * Money(100)</code> worked through <code>__rmul__</code>, unary minus through <code>__neg__</code>, and the last line shows <strong><code>__bool__</code></strong>, which decides whether an object counts as true or false in an <code>if</code>: ₹0 is false, ₹900 is true.</p>
  <p>Two of these results need a closer look, because they rely on the reflected methods. <code>3 * Money(100)</code> starts with <code>int.__mul__(3, Money(100))</code>; integers know nothing about Money, so that returns <code>NotImplemented</code>, and Python then calls <code>Money.__rmul__(Money(100), 3)</code>, which we defined as the same calculation as <code>__mul__</code>. <code>sum()</code> is subtler. It starts from the integer 0 and adds each item in turn, so its very first step is <code>0 + Money(0.10)</code>. <code>int.__add__</code> returns <code>NotImplemented</code>, Python calls <code>Money.__radd__(Money(0.10), 0)</code>, and our <code>__radd__</code> treats 0 as "nothing yet" and returns the Money unchanged. From then on every step is Money plus Money. Without <code>__radd__</code>, <code>sum()</code> on Money would fail with "unsupported operand type(s) for +: 'int' and 'Money'". When both sides decline, the result is a clean error:</p>
  <div class="fx" data-lang="py">for expr in ("Money(10) + 5", "Money(10, 'USD') + Money(10)"):
    try:
        eval(expr)
    except (TypeError, ValueError) as e:
        print(f"{expr:28} -&gt; {type(e).__name__}: {e}")

balance = Money(1000)
before = id(balance)
balance += Money(200)              # no __iadd__: Python runs balance = balance + Money(200)
print(balance, id(balance) == before)</div>
  <div class="fx" data-lang="text">Money(10) + 5                -&gt; TypeError: unsupported operand type(s) for +: 'Money' and 'int'
Money(10, 'USD') + Money(10) -&gt; ValueError: cannot mix USD and INR
₹1,200.00 False</div>
  <p>Adding a plain number to Money is refused with Python's own clear <code>TypeError</code>: our <code>__add__</code> returned <code>NotImplemented</code>, the integer's <code>__radd__</code> did too, and Python reported the failure. Adding dollars to rupees is a different kind of problem, a wrong value rather than an unsupported type, so our code raises a <code>ValueError</code> itself. The last lines show augmented assignment. Python first looks for an in-place method, <code>__iadd__</code>; Money has none, so <code>balance += Money(200)</code> is run as <code>balance = balance + Money(200)</code>, which builds a new object and points the name at it, which is why <code>id(balance)</code> changed. For an immutable value that is exactly right. Lists do define <code>__iadd__</code>, which is why <code>items += [x]</code> changes a list in place (see <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>).</p>
  <p>Operator overloading is powerful, and should be used only where the meaning is obvious. Arithmetic on money, vectors or matrices is natural, as NumPy and pandas show. Something like <code>asha &gt;&gt; ben</code> to mean "transfer" would be clever but confusing; a method called <code>transfer</code> says what it does.</p>

  <h2 id="pd-container"><span class="num">06</span>The Container Protocol</h2>
  <p>Every account has a statement, a list of transactions. Customers and code want to ask the same questions of it that they ask of a list: how many transactions are there, what was the first one, what are the last three, was there ever a withdrawal, and can I go through them one by one? We could expose the internal list directly, but then any code could also delete or rewrite transactions. Instead we write a <code>Statement</code> class that answers exactly these questions and nothing more. A set of dunder methods that together give an object some built-in behaviour is called a <strong>protocol</strong>; the ones that make something behave like a container are the container protocol. A passbook is the picture to keep in mind: you can count its lines, read line 3, read from line 2 onwards, ask whether it shows any withdrawal, and read it line by line, but you cannot tear lines out.</p>
  <p>Four methods do the work. <strong><code>__len__</code></strong> answers <code>len(st)</code>. <strong><code>__getitem__</code></strong> answers <code>st[i]</code>; for a slice such as <code>st[1:]</code> it receives a <code>slice</code> object instead of a number. <strong><code>__contains__</code></strong> answers <code>x in st</code>. <strong><code>__iter__</code></strong> answers <code>for t in st</code> by returning an <em>iterator</em>, an object that hands out the items one at a time. Before writing all four, it is instructive to see how far Python gets with just one. This class has only <code>__getitem__</code>, and prints each call:</p>
  <div class="fx" data-lang="py">class OldStatement:
    def __init__(self, rows):
        self._rows = rows

    def __getitem__(self, i):
        print(f"  __getitem__({i})")
        return self._rows[i]                   # raises IndexError past the end

st = OldStatement(["open", "deposit", "withdraw"])
print("for loop:")
for row in st:
    print("  got", row)
print("'deposit' in st:", "deposit" in st)</div>
  <div class="fx" data-lang="text">for loop:
  __getitem__(0)
  got open
  __getitem__(1)
  got deposit
  __getitem__(2)
  got withdraw
  __getitem__(3)
  __getitem__(0)
  __getitem__(1)
'deposit' in st: True</div>
  <p>The <code>for</code> loop worked, although there is no <code>__iter__</code>. Python fell back to an older protocol: it called <code>__getitem__(0)</code>, <code>(1)</code>, <code>(2)</code>, and stopped when <code>(3)</code> raised an <code>IndexError</code>. The <code>in</code> test worked the same way, scanning from index 0 until it found "deposit" at index 1. These fallbacks are handy, but they are slow and hidden, so a proper container defines its own methods. Here is the full statement. Each row is a small frozen dataclass holding a <code>Money</code> amount, and <code>__iter__</code> is written as a <strong>generator</strong>, a function containing <code>yield</code> that produces items one at a time (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> explains exactly how it works). We also give <code>__contains__</code> a meaning suited to statements: "is there a transaction of this kind?".</p>
  <div class="fx" data-lang="py">from dataclasses import dataclass

@dataclass(frozen=True)
class Transaction:                              # one line of the statement
    kind: str
    amount: Money

    def signed(self):
        return -self.amount if self.kind == "withdraw" else self.amount

class Statement:
    def __init__(self, owner, rows=()):
        self.owner = owner
        self._rows = list(rows)

    def add(self, kind, rupees):
        self._rows.append(Transaction(kind, Money(rupees)))

    def __len__(self):                          # len(st); also bool(st)
        return len(self._rows)

    def __getitem__(self, i):                   # st[0], st[-1], st[1:]
        if isinstance(i, slice):
            return Statement(self.owner, self._rows[i])   # a slice is a Statement too
        return self._rows[i]

    def __contains__(self, kind):               # "withdraw" in st
        return any(t.kind == kind for t in self._rows)

    def __iter__(self):                         # for t in st
        for t in self._rows:
            yield t

    def __repr__(self):
        return f"Statement({self.owner!r}, {len(self)} rows)"

st = Statement("Asha")
st.add("open", 1000)
st.add("deposit", 200)
st.add("withdraw", 300)
print(st, len(st), bool(st), bool(Statement("Ben")))
print(st[0])
print(st[-1].kind, st[-1].amount)
print(st[1:], [t.kind for t in st[1:]])
print("withdraw" in st, "interest" in st)
for t in st:
    print(f"  {t.kind:9} {str(t.signed()):&gt;10}")
print("balance:", sum(t.signed() for t in st))</div>
  <div class="fx" data-lang="text">Statement('Asha', 3 rows) 3 True False
Transaction(kind='open', amount=Money(1000.0, 'INR'))
withdraw ₹300.00
Statement('Asha', 2 rows) ['deposit', 'withdraw']
True False
  open       ₹1,000.00
  deposit      ₹200.00
  withdraw    ₹-300.00
balance: ₹900.00</div>
  <p><code>len(st)</code> is 3. A statement with transactions counts as true and Ben's empty one as false, even though we wrote no <code>__bool__</code>: when <code>__bool__</code> is missing, Python uses <code>__len__</code> and treats a length of 0 as false. <code>st[0]</code> is the opening transaction, and <code>st[-1]</code> is the withdrawal of ₹300, because negative indexes are passed straight to the inner list. <code>st[1:]</code> is a new two-row <code>Statement</code> rather than a bare list, because <code>__getitem__</code> checks for a slice and wraps the result. <code>"withdraw" in st</code> is true and <code>"interest" in st</code> false. The <code>for</code> loop used our <code>__iter__</code>, and the final balance, the <code>sum()</code> of the signed amounts, is ₹900.00, thanks to Money's <code>__radd__</code> from the previous section. All of this works without exposing the internal list, so no caller can delete a transaction.</p>
  <p>If you need the complete set of sequence behaviour, inheriting from <code>collections.abc.Sequence</code> and writing only <code>__len__</code> and <code>__getitem__</code> gives you <code>__contains__</code>, <code>__iter__</code>, <code>__reversed__</code>, <code>index</code> and <code>count</code> for free, an abstract base class as described in <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>.</p>

  <h2 id="pd-call"><span class="num">07</span>Callable Objects: __call__</h2>
  <p>Some parts of the bank are naturally functions: an overdraft fee rule takes a balance and returns the fee. But a fee rule also has settings, such as the fee amount, and the bank may want it to remember how many times it charged a fee this month. A plain function has nowhere obvious to keep that information. If a class defines <strong><code>__call__</code></strong>, its objects can be called with brackets exactly like functions: <code>fee_rule(balance)</code> runs <code>type(fee_rule).__call__(fee_rule, balance)</code>. The object keeps its attributes between calls, so it is a function with settings and a memory. A toll booth is a good picture: you hand it a vehicle and receive a charge, like a function, but the booth also has a price list and a counter of vehicles that passed today.</p>
  <div class="fx" data-lang="py">class OverdraftFee:
    def __init__(self, fee):
        self.fee = Money(fee)                   # a setting
        self.times_charged = 0                  # state kept between calls

    def __call__(self, balance):                # fee_rule(balance)
        if balance &lt; Money(0):
            self.times_charged += 1
            return self.fee
        return Money(0)

fee_rule = OverdraftFee(100)
print(callable(fee_rule), callable(Money(1)))
for balance in (Money(500), Money(-700), Money(-50)):
    print(f"balance {str(balance):&gt;9} -&gt; fee {fee_rule(balance)}")
print("charged", fee_rule.times_charged, "times")</div>
  <div class="fx" data-lang="text">True False
balance   ₹500.00 -&gt; fee ₹0.00
balance  ₹-700.00 -&gt; fee ₹100.00
balance   ₹-50.00 -&gt; fee ₹100.00
charged 2 times</div>
  <p><code>callable(fee_rule)</code> is true, while a Money object is not callable. A balance of ₹500 owes no fee; balances of −₹700 and −₹50 each owe ₹100 (the comparison <code>balance &lt; Money(0)</code> uses Money's <code>__lt__</code>), and the rule remembers that it charged twice. Because <code>fee_rule</code> can be called like a function, it can be passed anywhere a function is expected, for example as the fee policy of the composed account in <a class="xref" data-note="py_inheritance">Inheritance, Polymorphism &amp; Design</a>.</p>
  <p>A closure, an inner function that remembers variables from the function that created it (see <a class="xref" data-note="py_functions">Functions</a>), can do something similar. A class with <code>__call__</code> is the better choice when there are several settings, when other methods are needed, or when the state should be easy to inspect from outside, as <code>times_charged</code> is here. You meet this hook constantly in libraries: class-based <a class="xref" data-note="py_decorators">decorators</a> are written with <code>__call__</code>, and a PyTorch model is used as <code>model(x)</code> because <code>nn.Module.__call__</code> runs some bookkeeping and then your <code>forward</code> method.</p>

  <h2 id="pd-with"><span class="num">08</span>Context Manager Methods: __enter__ and __exit__</h2>
  <p>A transfer from Asha to Ben has two steps: add the money to Ben's account and take it from Asha's. If the second step fails, because Asha does not have enough, the first step must be undone, or the bank has created money out of nothing. Writing that undo logic around every transfer with <code>try</code> and <code>except</code> is repetitive and easy to forget. The <code>with</code> statement exists for exactly this kind of "set up, do the work, always clean up" situation, and it works with any object that has two dunder methods. An object with them is called a <strong>context manager</strong>.</p>
  <p>When Python reaches <code>with obj:</code>, it calls <strong><code>obj.__enter__()</code></strong> before the block runs. When the block ends, for whatever reason, it calls <strong><code>obj.__exit__(exc_type, exc, tb)</code></strong>. If the block finished normally, all three arguments are <code>None</code>; if it raised an exception, they describe it (its type, the exception object and the traceback). If <code>__exit__</code> returns a true value, the exception is swallowed; if it returns <code>False</code> or <code>None</code>, the exception continues to the caller. Picture a supervisor watching a transfer: before it starts she photographs both balances; afterwards she either signs off or, if anything went wrong, restores both balances from the photograph.</p>
  <div class="fx" data-lang="py">class BankAccount:
    def __init__(self, owner, rupees):
        self.owner = owner
        self.balance = Money(rupees)

    def deposit(self, amount):
        self.balance = self.balance + amount

    def withdraw(self, amount):
        if amount &gt; self.balance:
            raise ValueError(f"{self.owner}: not enough money")
        self.balance = self.balance - amount

class Atomic:
    """with Atomic(a, b): ...   all the changes happen, or none of them."""
    def __init__(self, *accounts):
        self.accounts = accounts

    def __enter__(self):
        self.saved = [acc.balance for acc in self.accounts]      # snapshot
        print("  enter: saved", [str(m) for m in self.saved])
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is not None:                                  # the block raised
            for acc, saved in zip(self.accounts, self.saved):
                acc.balance = saved                               # roll back
            print(f"  exit: rolled back after {exc_type.__name__}: {exc}")
        else:
            print("  exit: committed")
        return False                                              # do not hide the error

asha, ben = BankAccount("Asha", 1000), BankAccount("Ben", 500)
for amount in (Money(300), Money(900)):
    print(f"Asha sends Ben {amount}:")
    try:
        with Atomic(asha, ben):
            ben.deposit(amount)                 # step 1 always succeeds
            asha.withdraw(amount)               # step 2 may fail
    except ValueError:
        pass
    print(f"  Asha {asha.balance}, Ben {ben.balance}")</div>
  <div class="fx" data-lang="text">Asha sends Ben ₹300.00:
  enter: saved ['₹1,000.00', '₹500.00']
  exit: committed
  Asha ₹700.00, Ben ₹800.00
Asha sends Ben ₹900.00:
  enter: saved ['₹700.00', '₹800.00']
  exit: rolled back after ValueError: Asha: not enough money
  Asha ₹700.00, Ben ₹800.00</div>
  <p>The first transfer of ₹300 succeeded: <code>__enter__</code> saved ₹1,000 and ₹500, both steps ran, and <code>__exit__</code> received three <code>None</code>s and reported "committed". Asha ends at ₹700 and Ben at ₹800. The second transfer, ₹900, shows the point of the pattern. Ben's deposit went through, so for a moment Ben held ₹1,700, and then Asha's withdrawal raised a <code>ValueError</code>. Python immediately called <code>__exit__</code> with that exception; it restored both saved balances and returned <code>False</code>, so the error still reached the caller's <code>except</code>. The final balances are exactly what they were before the failed transfer: all or nothing. (The comparison <code>amount &gt; self.balance</code> uses the ordering methods from earlier, and the snapshot is safe to keep because Money objects never change.)</p>
  <p>The same two hooks are behind <code>with open(...)</code>, which closes the file, behind locks, which are released, and behind database transactions, which commit or roll back. <a class="xref" data-note="py_context">Context Managers</a> covers them in full, including the shortcut of writing one as a generator with <code>contextlib.contextmanager</code>.</p>

  <h2 id="pd-all"><span class="num">09</span>Putting It Together</h2>
  <p>Here is the bank account rebuilt with the hooks from this page. <code>Money</code> is the finished value type in one piece, and this time it uses the <code>Decimal</code> type to read amounts from text, so that <code>"0.1"</code> becomes exactly 10 paise without ever passing through a float. The account keeps its history as a list of (kind, amount) pairs, works out its balance by summing them, and supports printing, <code>len</code>, <code>in</code> and <code>for</code>. It deliberately does not define <code>__eq__</code>, because accounts are entities whose identity matters.</p>
  <div class="fx" data-lang="py">from decimal import Decimal
from functools import total_ordering

@total_ordering
class Money:
    def __init__(self, rupees=0):
        self.paise = int(Decimal(str(rupees)) * 100)       # exact, even for "0.1"

    @classmethod
    def _of(cls, paise):
        m = cls()
        m.paise = paise
        return m

    def __repr__(self):  return f"Money({self.paise / 100})"
    def __str__(self):   return f"₹{self.paise / 100:,.2f}"
    def __eq__(self, o): return isinstance(o, Money) and self.paise == o.paise
    def __hash__(self):  return hash(self.paise)
    def __lt__(self, o): return self.paise &lt; o.paise if isinstance(o, Money) else NotImplemented
    def __add__(self, o): return Money._of(self.paise + o.paise) if isinstance(o, Money) else NotImplemented
    def __radd__(self, o): return self if o == 0 else NotImplemented
    def __neg__(self):   return Money._of(-self.paise)
    def __bool__(self):  return self.paise != 0

class BankAccount:
    def __init__(self, owner, rupees):
        self.owner = owner
        self._history = [("open", Money(rupees))]

    def deposit(self, rupees):
        self._history.append(("deposit", Money(rupees)))

    def withdraw(self, rupees):
        if Money(rupees) &gt; self.balance:
            raise ValueError("Not enough money")
        self._history.append(("withdraw", -Money(rupees)))

    @property
    def balance(self):
        return sum(amount for _, amount in self._history)   # __radd__, __add__

    def __repr__(self):     return f"BankAccount({self.owner!r}, {self.balance.paise / 100})"
    def __str__(self):      return f"{self.owner}: {self.balance}"
    def __len__(self):      return len(self._history)
    def __iter__(self):     return iter(self._history)
    def __contains__(self, kind): return any(k == kind for k, _ in self._history)

asha = BankAccount("Asha", 1000)
asha.deposit("0.1")
asha.deposit("0.2")
asha.withdraw(300)
print(asha, "|", repr(asha))                               # __str__, __repr__
print(len(asha), "withdraw" in asha, "interest" in asha)   # __len__, __contains__
for kind, amount in asha:                                  # __iter__
    print(f"  {kind:9} {str(amount):&gt;9}")
print(asha.balance == Money("700.30"), sorted({Money(5), Money(1), Money(5)}))</div>
  <div class="fx" data-lang="text">Asha: ₹700.30 | BankAccount('Asha', 700.3)
4 True False
  open      ₹1,000.00
  deposit       ₹0.10
  deposit       ₹0.20
  withdraw   ₹-300.00
True [Money(1.0), Money(5.0)]</div>
  <p>Asha opened with ₹1,000, made two tiny deposits of 10 and 20 paise and withdrew ₹300. <code>print</code> used <code>__str__</code> and <code>repr</code> used <code>__repr__</code>. The balance is exactly ₹700.30 and compares equal to <code>Money("700.30")</code>: the history was summed with <code>sum()</code>, which relied on <code>__radd__</code> for the starting 0 and <code>__add__</code> for the rest, while the withdrawal was stored using <code>__neg__</code>. <code>len(asha)</code> is 4 transactions, <code>"withdraw" in asha</code> used <code>__contains__</code>, and the <code>for</code> loop used <code>__iter__</code>. The very last expression shows <code>__eq__</code> and <code>__hash__</code> working together, since the set kept one ₹5, and <code>__lt__</code> letting <code>sorted</code> order the result. Each hook is small; together they make the account feel like a built-in Python type.</p>

  <h2 id="pd-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>A frequent mistake is to raise an exception when an operator receives a type it does not understand, instead of returning <code>NotImplemented</code>. It looks like the stricter choice, but it takes away the other operand's chance to handle the operation:</p>
  <div class="fx" data-lang="py">class Money:
    def __init__(self, paise):
        self.paise = paise
    def __mul__(self, factor):
        if not isinstance(factor, (int, float)):
            raise NotImplementedError("only numbers")   # BUG: should RETURN NotImplemented
        return Money(self.paise * factor)
    def __rmul__(self, factor):
        return self * factor

class Rate:                                    # a type that knows how to multiply Money
    def __init__(self, r):
        self.r = r
    def __rmul__(self, money):                 # money * rate
        return Money(round(money.paise * self.r))

try:
    print((Money(1000) * Rate(0.04)).paise)
except NotImplementedError as e:
    print("NotImplementedError:", e)

class MoneyFixed(Money):
    def __mul__(self, factor):
        if not isinstance(factor, (int, float)):
            return NotImplemented              # FIX: let the other side try
        return MoneyFixed(self.paise * factor)

print((MoneyFixed(1000) * Rate(0.04)).paise)  # Rate.__rmul__ now gets its turn</div>
  <div class="fx" data-lang="text">NotImplementedError: only numbers
40</div>
  <p>A <code>Rate</code> object knows how to multiply Money through its <code>__rmul__</code>, but the first <code>Money.__mul__</code> raised <code>NotImplementedError</code> straight away, so Python never asked <code>Rate</code>. The fixed version returns <code>NotImplemented</code>, Python passes the operation to <code>Rate.__rmul__</code>, and the result is 40 paise. Note the two similar names: <code>NotImplemented</code> is a value you <em>return</em> from an operator method; <code>NotImplementedError</code> is an exception you <em>raise</em>, typically in a base-class method that subclasses must override. Returning <code>None</code> is also wrong, because Python would take <code>None</code> as the actual result.</p>
  <p>The second mistake is an <code>__exit__</code> that returns <code>True</code> "to be safe":</p>
  <div class="fx" data-lang="py">class Quiet:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        return True                            # BUG: swallows every error

with Quiet():
    total = 1000 / 0                           # a real bug...
print("carried on as if nothing happened")     # ...silently hidden</div>
  <div class="fx" data-lang="text">carried on as if nothing happened</div>
  <p>The block divided by zero, a genuine bug, and the program carried on as if nothing had happened, because returning <code>True</code> tells Python to swallow the exception. <code>__exit__</code> should return <code>False</code> unless suppressing one specific, expected exception is the whole purpose of the context manager.</p>
  <p>The remaining mistakes have all appeared in the sections above. Defining <code>__eq__</code> without <code>__hash__</code> makes objects unhashable, and the fix is a <code>__hash__</code> over the same fields on an immutable object. Changing an object while it sits in a set or serves as a dictionary key makes it unfindable. Writing only <code>__str__</code> leaves lists of your objects showing memory addresses; write <code>__repr__</code> first. Forgetting <code>__radd__</code> makes <code>sum()</code> fail on the starting 0. Assigning a dunder method to an object rather than defining it in the class has no effect, because Python looks these methods up on the class. And because <code>__len__</code> and <code>__bool__</code> decide truthiness, <code>if statement:</code> is false for an empty statement and <code>if amount:</code> is false for ₹0; write <code>if x is not None:</code> when you mean "exists".</p>

  <h2 id="pd-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Dunder method</b>: a method with a double-underscore name that Python calls for syntax: <code>len(x)</code> → <code>type(x).__len__(x)</code>.</li>
    <li><b>Data model</b>: the full set of these hooks and the rules for using them.</li>
    <li><b>Operator overloading</b>: giving operators a meaning for your class by writing their dunder methods.</li>
    <li><b><code>NotImplemented</code></b>: a value returned by an operator method meaning "I can't handle this type; let the other operand try".</li>
    <li><b>Reflected method</b>: <code>__radd__</code>, <code>__rmul__</code>...: called on the right operand when the left one declines.</li>
    <li><b>Hash contract</b>: <code>a == b</code> ⇒ <code>hash(a) == hash(b)</code>, and a hash must not change while the object is in a set or dict.</li>
    <li><b>Protocol</b>: a group of dunder methods that together give built-in behaviour (container, iterator, context manager).</li>
  </ul>
  <h3>Hook table</h3>
  <table class="tbl">
    <tr><th>You write</th><th>Python calls</th><th>You write</th><th>Python calls</th></tr>
    <tr><td><code>repr(x)</code>, shell, inside lists</td><td><code>__repr__</code></td><td><code>print(x)</code>, <code>str(x)</code>, f-string</td><td><code>__str__</code></td></tr>
    <tr><td><code>a == b</code>, <code>a != b</code></td><td><code>__eq__</code></td><td><code>hash(a)</code>, set, dict key</td><td><code>__hash__</code></td></tr>
    <tr><td><code>a &lt; b</code> (and <code>sorted</code>, <code>max</code>)</td><td><code>__lt__</code></td><td><code>&lt;= &gt; &gt;=</code></td><td><code>__le__ __gt__ __ge__</code></td></tr>
    <tr><td><code>a + b</code> / <code>b + a</code></td><td><code>__add__</code> / <code>__radd__</code></td><td><code>a * 3</code> / <code>3 * a</code></td><td><code>__mul__</code> / <code>__rmul__</code></td></tr>
    <tr><td><code>a += b</code></td><td><code>__iadd__</code>, else <code>a = a + b</code></td><td><code>-a</code>, <code>bool(a)</code></td><td><code>__neg__</code>, <code>__bool__</code></td></tr>
    <tr><td><code>len(s)</code></td><td><code>__len__</code></td><td><code>s[i]</code>, <code>s[1:]</code></td><td><code>__getitem__</code> (int or <code>slice</code>)</td></tr>
    <tr><td><code>x in s</code></td><td><code>__contains__</code></td><td><code>for x in s</code></td><td><code>__iter__</code></td></tr>
    <tr><td><code>obj(args)</code></td><td><code>__call__</code></td><td><code>with obj:</code></td><td><code>__enter__</code> / <code>__exit__</code></td></tr>
  </table>
  <h3>Fallbacks</h3>
  <ul>
    <li><code>str()</code> falls back to <code>__repr__</code>; <code>repr()</code> never falls back to <code>__str__</code>.</li>
    <li>Defining <code>__eq__</code> without <code>__hash__</code> sets <code>__hash__ = None</code>.</li>
    <li><code>a &gt; b</code> tries <code>b &lt; a</code>; <code>a &lt;= b</code> tries <code>b &gt;= a</code>. <code>@total_ordering</code> fills in the rest from <code>__eq__</code> + one.</li>
    <li>Truthiness: <code>__bool__</code>, else <code>__len__() != 0</code>, else always true.</li>
    <li>No <code>__iter__</code>: <code>for</code> calls <code>__getitem__(0, 1, 2...)</code> until <code>IndexError</code>. No <code>__contains__</code>: <code>in</code> iterates.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from functools import total_ordering

@total_ordering
class Money:
    def __init__(self, paise): self.paise = paise
    def __repr__(self): return f"Money({self.paise})"
    def __eq__(self, o):
        if not isinstance(o, Money): return NotImplemented
        return self.paise == o.paise
    def __hash__(self): return hash(self.paise)       # same fields as __eq__
    def __lt__(self, o):
        if not isinstance(o, Money): return NotImplemented
        return self.paise &lt; o.paise
    def __add__(self, o):
        if not isinstance(o, Money): return NotImplemented
        return Money(self.paise + o.paise)            # a new object
    def __radd__(self, o): return self if o == 0 else NotImplemented

class Atomic:
    def __enter__(self): return self
    def __exit__(self, exc_type, exc, tb):
        return False                                  # don't swallow errors</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Return <code>NotImplemented</code>; don't raise <code>NotImplementedError</code> or return <code>None</code>.</li>
    <li><code>sum()</code> starts at 0: needs <code>__radd__</code> (or <code>sum(items, Money(0))</code>).</li>
    <li>Only <code>__str__</code> → lists still show memory addresses.</li>
    <li>Mutating a hashed object inside a set or dict makes it unfindable.</li>
    <li>Dunders set on an object, not the class, are ignored by syntax.</li>
    <li><code>__exit__</code> returning <code>True</code> hides every error in the block.</li>
    <li>Entities (accounts) keep identity equality; value objects (money) compare by value.</li>
  </ul>

  <h2 id="pd-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are dunder methods, and what is the Python data model?</summary><div class="qa-body">Dunder ("double underscore") methods such as <code>__len__</code>, <code>__add__</code> and <code>__iter__</code> are the hooks Python's syntax and built-in functions call: <code>len(x)</code> runs <code>type(x).__len__(x)</code>. The data model is the documented set of these hooks and their rules. Implementing them lets your own classes work with operators, <code>print</code>, <code>for</code>, <code>with</code> and the standard library just like built-in types.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>__str__</code> vs <code>__repr__</code>?</summary><div class="qa-body"><code>__repr__</code> is the unambiguous developer view, ideally an expression that recreates the object; it is used by <code>repr()</code>, the shell, debuggers and for items inside containers. <code>__str__</code> is the readable user view, used by <code>print</code>, <code>str()</code> and f-strings. <code>str()</code> falls back to <code>__repr__</code> but not the other way round, so always define <code>__repr__</code> first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? A class defines only <code>__str__</code> returning <code>"friendly"</code>; <code>print(OnlyStr(), [OnlyStr()])</code></summary><div class="qa-body"><code>friendly [&lt;__main__.OnlyStr object at 0x...&gt;]</code>. <code>print</code> calls <code>str()</code> on the object, but a list displays its items with <code>repr()</code>, which never falls back to <code>__str__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>==</code> do for a class that does not define <code>__eq__</code>?</summary><div class="qa-body">It compares identity, exactly like <code>is</code>: two objects are equal only if they are the same object. That is correct for entities such as bank accounts, whose identity matters, but wrong for value objects such as money amounts, which should compare by their contents.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does defining <code>__eq__</code> make a class unhashable?</summary><div class="qa-body">Sets and dicts require that equal objects have equal hashes. The default hash is based on identity, so two value-equal objects would get different hashes and could both be stored. To prevent that, Python sets <code>__hash__ = None</code> when a class defines <code>__eq__</code> without <code>__hash__</code>. Define <code>__hash__</code> over the same fields, on an immutable object, or use <code>@dataclass(frozen=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What goes wrong if you change an object while it is in a set or used as a dict key?</summary><div class="qa-body">The container filed the object under its old hash. After the change, lookups compute the new hash and search the wrong place, so <code>obj in s</code> is <code>False</code> even though the object is still inside. That is why hashable objects should be immutable in the fields they compare and hash.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>NotImplemented</code> vs <code>NotImplementedError</code>?</summary><div class="qa-body"><code>NotImplemented</code> is a special value that an operator method <em>returns</em> to say "I don't support this operand type"; Python then tries the other operand's reflected method and raises <code>TypeError</code> only if both decline. <code>NotImplementedError</code> is an exception you <em>raise</em>, typically in a base-class method that subclasses must override. Raising it from <code>__add__</code> blocks the reflected fallback.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python evaluate <code>a + b</code> for user-defined types?</summary><div class="qa-body">It calls <code>type(a).__add__(a, b)</code>. If that is missing or returns <code>NotImplemented</code>, it calls <code>type(b).__radd__(b, a)</code>. If that also fails, it raises <code>TypeError: unsupported operand type(s)</code>. One exception: if <code>b</code>'s type is a subclass of <code>a</code>'s type and overrides the reflected method, <code>b.__radd__</code> is tried first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>sum()</code> fail on objects that support <code>+</code>, and how do you fix it?</summary><div class="qa-body"><code>sum</code> starts from the integer 0, so its first step is <code>0 + obj</code>. <code>int.__add__</code> returns <code>NotImplemented</code>, and without <code>obj.__radd__</code> Python raises <code>TypeError: unsupported operand type(s) for +: 'int' and 'Money'</code>. Fix it with a <code>__radd__</code> that treats 0 as "nothing", or by passing a start value: <code>sum(items, Money(0))</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>a = [1]; b = a; a += [2]</code>; <code>t = (1,); u = t; t += (2,)</code>; <code>print(b, u, a is b, t is u)</code></summary><div class="qa-body"><code>[1, 2] (1,) True False</code>. Lists define <code>__iadd__</code>, which extends the list in place, so <code>b</code>, the same object, sees the change. Tuples have no <code>__iadd__</code>, so <code>t += (2,)</code> becomes <code>t = t + (2,)</code>, a new tuple bound to <code>t</code>, while <code>u</code> still refers to the old one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>functools.total_ordering</code> do?</summary><div class="qa-body">Given <code>__eq__</code> and one of <code>__lt__</code>, <code>__le__</code>, <code>__gt__</code> or <code>__ge__</code>, it generates the other three comparison methods. Without it, defining only <code>__lt__</code> still makes <code>&gt;</code> work, because Python reflects <code>a &gt; b</code> to <code>b &lt; a</code>, but <code>&lt;=</code> and <code>&gt;=</code> raise <code>TypeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make your own class work with <code>len</code>, indexing, <code>in</code> and <code>for</code>?</summary><div class="qa-body">Implement the container protocol: <code>__len__</code> for <code>len</code>, <code>__getitem__</code> for indexing and slicing (it receives a <code>slice</code> object for <code>s[1:]</code>), <code>__contains__</code> for <code>in</code>, and <code>__iter__</code> returning an iterator, most easily written as a generator with <code>yield</code>. Inheriting from <code>collections.abc.Sequence</code> and writing <code>__len__</code> and <code>__getitem__</code> supplies the rest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A class has only <code>__getitem__</code>. Can you loop over it?</summary><div class="qa-body">Yes. With no <code>__iter__</code>, Python falls back to calling <code>__getitem__(0)</code>, <code>__getitem__(1)</code> and so on until it raises <code>IndexError</code>. The <code>in</code> operator uses the same fallback. It works but is slow and implicit, so real containers define <code>__iter__</code> and usually <code>__contains__</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python decide whether an object is true or false?</summary><div class="qa-body">It calls <code>__bool__</code> if the class defines it; otherwise it calls <code>__len__</code> and treats 0 as false; otherwise the object is always true. So empty containers, zero and <code>Money(0)</code> are false, which is why <code>if x:</code> is the wrong test when you mean <code>if x is not None:</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are dunder methods looked up on the class rather than the object?</summary><div class="qa-body">Python's implicit special-method lookup goes straight to <code>type(x)</code>, skipping the object's own attributes. That keeps operators fast and guarantees every object of a type behaves the same way. As a result, <code>obj.__len__ = lambda: 99</code> has no effect on <code>len(obj)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>__call__</code> used for?</summary><div class="qa-body">It makes objects callable: <code>obj(x)</code> runs <code>type(obj).__call__(obj, x)</code>. It suits a function that needs settings or state, such as a fee rule that counts how often it charged, and it is how class-based decorators are written. PyTorch relies on it: <code>model(x)</code> calls <code>nn.Module.__call__</code>, which runs hooks and then your <code>forward</code>, which is why you should not call <code>forward</code> directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the arguments of <code>__exit__</code>, and what does its return value mean?</summary><div class="qa-body"><code>__exit__(self, exc_type, exc_value, traceback)</code> receives three <code>None</code>s if the block finished normally, or a description of the exception if it raised. It runs on every exit from the block. Returning a true value suppresses the exception; returning <code>False</code> or <code>None</code> lets it continue, which is almost always correct. The value returned by <code>__enter__</code> is what <code>with ... as x</code> binds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>__getattr__</code> vs <code>__getattribute__</code>?</summary><div class="qa-body"><code>__getattribute__</code> runs on every attribute access and implements normal lookup; overriding it is rare and easily causes infinite recursion. <code>__getattr__</code> runs only when normal lookup fails, which makes it the safe hook for default values, proxies and lazily computed attributes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__del__</code> a destructor you can rely on for cleanup?</summary><div class="qa-body">No. In CPython it usually runs when the last reference to an object disappears, but the timing is not guaranteed (reference cycles, other Python implementations, interpreter shutdown), and exceptions inside it are only printed as warnings. Release files, locks and connections deterministically with a context manager or an explicit <code>close()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you overload operators, and when not?</summary><div class="qa-body">When the meaning is obvious and conventional for the type: arithmetic on money, vectors or matrices, <code>==</code> on value objects, <code>[]</code> on collections, as NumPy and pandas do. Avoid clever meanings such as <code>account &gt;&gt; other</code> for a transfer; a named method reads better. Operators should not change their operands, and for immutable types they should return new objects.</div></details>
</main>
`
});
