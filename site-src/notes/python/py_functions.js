// notes/python/py_functions.js — Functions
Object.assign(TOPIC_CONTENT, {
  "py_functions": `<main>
<h1>Functions</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Functions</span></div>
  <p class="lead">A <strong>function</strong> is a named piece of code that takes some inputs, does one job, and hands back a result. Functions exist because real programs repeat the same logic in many places, and copied code drifts apart: when a rule changes, one copy is always missed, nothing crashes, and the results quietly disagree. A function puts each rule in exactly one place and gives it a name, so the rest of the program can simply say <code>bill(order)</code>. Because Python treats functions as values, they can also be passed to other functions, which is how <code>sorted(key=...)</code>, callbacks and decorators work. This page builds functions up from zero using one running example, the till of a chai stall: masala chai ₹30, samosa ₹15, vada pav ₹20, cold coffee ₹90, 10% off bills of ₹150 or more, and 5% tax. Asha's table orders 2 chai, 3 samosas and 1 cold coffee; Ben's orders 1 chai and 2 vada pav; Chen's orders 2 samosas and 1 vada pav.</p>

  <h2 id="pfn-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Define, call, return</div>
        <ul>
          <li><code>def name(params):</code> creates a function; the body runs only when called</li>
          <li>No <code>return</code> → the call gives <code>None</code>; print is not return</li>
          <li><code>return a, b</code> returns one tuple</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Parameters</div>
        <ul>
          <li>Positional, keyword, defaults; <code>*args</code> → tuple, <code>**kwargs</code> → dict</li>
          <li><code>/</code> = positional-only before it; <code>*</code> = keyword-only after it</li>
          <li>Defaults are built once: never use <code>[]</code> as a default</li>
          <li>Arguments are passed by object reference</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scope</div>
        <ul>
          <li>LEGB: Local → Enclosing → Global → Built-in</li>
          <li>Assigning inside a function makes a name local</li>
          <li><code>global</code> / <code>nonlocal</code>; closures remember outer variables</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Advanced uses</div>
        <ul>
          <li>Recursion: base case + smaller problem; limit about 1000</li>
          <li><code>lambda</code>: one-expression function for <code>key=</code></li>
          <li>Functions are values: store, pass, return, wrap</li>
          <li>Docstrings and type hints document the contract</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pfn-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Defining and Calling Functions</span><span class="rm-sub">why functions exist, def, and what a call does</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-return"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">return and None</span><span class="rm-sub">giving a result back, versus printing it</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-params"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Parameters and Arguments</span><span class="rm-sub">positional, keyword, defaults, how values are passed</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-default"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Mutable Default Arguments</span><span class="rm-sub">why a default list is shared between calls</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-star"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">*args, **kwargs and Unpacking</span><span class="rm-sub">any number of arguments, / and *</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-scope"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Scope and the LEGB Rule</span><span class="rm-sub">where names live and how Python finds them</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-closure"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Closures</span><span class="rm-sub">functions that remember their surroundings</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-rec"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Recursion</span><span class="rm-sub">a function calling itself, and the call stack</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-lambda"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">lambda Expressions</span><span class="rm-sub">small nameless functions, late binding</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-values"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Functions as Values</span><span class="rm-sub">store, pass, return and wrap functions</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-doc"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Docstrings and Type Hints</span><span class="rm-sub">documenting what a function expects</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">print vs return, defaults, scope, passing calls</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, rules and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pfn-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">arguments, scope, closures, recursion</span></div></div>
    </div>
  </div>

  <h2 id="pfn-why"><span class="num">01</span>Defining and Calling Functions</h2>
  <p>To see why functions exist, start without them. The stall needs to bill two tables, so someone writes the billing steps for Asha's order, then copies and pastes them for Ben's. Later the tax rate changes to 12%, and only one copy gets updated:</p>
  <div class="fx" data-lang="py">asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
ben = [("masala chai", 1, 30), ("vada pav", 2, 20)]
# billing Asha ...
s = 0
for item, qty, price in asha:
    s += qty * price
after = s - (s * 0.10 if s &gt;= 150 else 0)
print("Asha", round(after + after * 0.05))
# ... and the same code pasted for Ben, where someone already changed the tax to 12%
s = 0
for item, qty, price in ben:
    s += qty * price
after = s - (s * 0.10 if s &gt;= 150 else 0)
print("Ben ", round(after + after * 0.12))     # two copies, two different rules</div>
  <div class="fx" data-lang="text">Asha 184
Ben  78</div>
  <p>Nothing crashed and both lines look like sensible bills, yet Asha was taxed at 5% and Ben at 12%. This is the main problem functions solve: when the same rule is written in two places, the two places drift apart, and nobody notices because no error appears. The principle is <strong>one rule, one place</strong>. A second benefit is naming: <code>bill(ben)</code> says what it does, while ten lines of arithmetic make the reader work it out.</p>
  <p>A function is like a recipe card. The chai-wala does not reinvent masala chai for every customer; the steps are written once on a card titled "masala chai", and "make masala chai, 2 cups" uses the same steps with a different quantity. Change the card once and every future cup changes. In Python, a function is created with the keyword <code>def</code> (short for "define"). The first line gives the function's name and, in brackets, its <strong>parameters</strong>: names for the inputs it will receive. The indented lines below are the <strong>body</strong>, the steps. The keyword <code>return</code> hands the result back to whoever used the function. Using a function is called <strong>calling</strong> it, and you call it by writing its name followed by brackets containing the inputs:</p>
  <div class="fx" data-lang="py">def subtotal(lines):
    """Add up qty * price over the lines of one order."""
    total = 0
    for item, qty, price in lines:
        total += qty * price
    return total                      # hand the answer back to the caller

asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
ben = [("masala chai", 1, 30), ("vada pav", 2, 20)]
chen = [("samosa", 2, 15), ("vada pav", 1, 20)]
print(subtotal(asha), subtotal(ben), subtotal(chen))
print(subtotal(asha) + 5)             # a call is an expression: use it anywhere</div>
  <div class="fx" data-lang="text">195 70 50
200</div>
  <p>The <code>def</code> block creates a function called <code>subtotal</code> with one parameter, <code>lines</code>. Below it, the three orders are billed by three calls, giving 195, 70 and 50. It is worth slowing down to see exactly what happens on a call such as <code>subtotal(asha)</code>. First, Python pauses the line it was working on. Second, it attaches the parameter name <code>lines</code> to the same list that <code>asha</code> refers to; this is not a copy, just a second name for the same object (see <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>). Third, it runs the body: <code>total</code> starts at 0, the loop adds 60, 45 and 90, and <code>total</code> reaches 195. Fourth, <code>return total</code> ends the function and hands back 195. Finally, Python returns to the paused line, and the call <code>subtotal(asha)</code> is <em>replaced by</em> the value 195. The names created inside the function, <code>lines</code>, <code>total</code> and the loop variables, are thrown away when the call ends, and the next call starts fresh with its own.</p>
  <p>Because a call is replaced by its returned value, it can be used anywhere a value can be used, which is why <code>subtotal(asha) + 5</code> gives 200. It is also important to understand what <code>def</code> itself does: it does <em>not</em> run the body. It only creates the function and binds the name to it, and the body runs later, once per call. The function is an object like any other value:</p>
  <div class="fx" data-lang="py">print(subtotal)                       # def made a function object...
print(type(subtotal).__name__, subtotal.__name__)
print(callable(subtotal), callable(195))</div>
  <div class="fx" data-lang="text">&lt;function subtotal at 0x7fb3bd62d4e0&gt;
function subtotal
True False</div>
  <p>Printing the name without brackets shows <code>&lt;function subtotal at 0x…&gt;</code>: the function object itself, with its memory address. Its type is <code>function</code> and it knows its own name. <code>callable(subtotal)</code> is True because it can be called with brackets, while the number 195 cannot. The difference between <code>subtotal</code> (the function) and <code>subtotal(...)</code> (calling it and getting a result) will matter a great deal later, when we pass functions to other functions.</p>

  <h2 id="pfn-return"><span class="num">02</span>return and None</h2>
  <p>A function has two quite different ways to "give" you a result, and confusing them is the most common beginner bug with functions. <code>print</code> shows text on the screen for a human to read. <code>return</code> hands a value back to the <em>code</em> that called the function, so that the program can keep working with it. Think of asking a colleague for a total. Printing is the colleague shouting the number across the room: you heard it, but you cannot paste it into your spreadsheet. Returning is the colleague handing you a slip of paper with the number on it. Here is a function that only prints:</p>
  <div class="fx" data-lang="py">def show_subtotal(lines):
    print("subtotal is", subtotal(lines))   # shows it, hands nothing back

x = show_subtotal(asha)
print("x =", x)
try:
    x + 10
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">subtotal is 195
x = None
TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'</div>
  <p>The function displayed "subtotal is 195" as expected, so it looks as if it works. But <code>x</code> is <code>None</code>, and <code>x + 10</code> fails with a <code>TypeError</code> about <code>'NoneType'</code>. The rule behind this is that a function which reaches the end of its body without a <code>return</code> statement, or which uses a bare <code>return</code> with no value, gives back <code>None</code>. The slogan to remember is <strong>print shows, return gives</strong>. A helper that prints instead of returning cannot be reused by other code, so the habit to build is: functions return values, and only the top level of the program prints them.</p>
  <p><code>return</code> also ends the function immediately, wherever it appears. That gives a clean way to write rules: return as soon as the answer is known. Here is the stall's discount rule as a function:</p>
  <div class="fx" data-lang="py">def discount(sub):
    """10% off at 150 or more, else nothing."""
    if sub &gt;= 150:
        return sub * 0.10             # leaves the function right here
    return 0                          # only reached when the if was False

print(discount(195), discount(70), discount(50))</div>
  <div class="fx" data-lang="text">19.5 0 0</div>
  <p>For 195 the condition is true, so the first <code>return</code> runs and the function ends right there, returning 19.5. For 70 and 50 the condition is false, the indented line is skipped, and Python reaches <code>return 0</code>. There is no need for an <code>else</code>, because the second <code>return</code> can only be reached when the first one did not run. This style, handling special cases first with early returns, keeps functions flat and readable.</p>
  <p>Sometimes a function naturally produces two results. Splitting ₹184 among 3 people needs both a share and a remainder. Writing <code>return a, b</code> builds a single tuple containing both values, and the caller can unpack it into two names:</p>
  <div class="fx" data-lang="py">def split_bill(total, people):
    return total // people, total % people   # really ONE tuple

share, left = split_bill(184, 3)
print(share, left, split_bill(184, 3))</div>
  <div class="fx" data-lang="text">61 1 (61, 1)</div>
  <p><code>split_bill(184, 3)</code> returns the one tuple <code>(61, 1)</code>, as the last value printed shows, and <code>share, left = ...</code> unpacks it into 61 and 1. When a function has more than two or three results, returning something with named fields, such as a dictionary or a dataclass, is clearer.</p>
  <p>One more <code>None</code> surprise is worth knowing early. Methods that change an object in place, such as <code>list.sort()</code> and <code>list.append()</code>, deliberately return <code>None</code>, as a reminder that they changed the original rather than producing something new:</p>
  <div class="fx" data-lang="py">order = ["samosa", "chai", "cold coffee"]
result = order.sort()                 # sorts in place, returns None
print(result, order)</div>
  <div class="fx" data-lang="text">None ['chai', 'cold coffee', 'samosa']</div>
  <p><code>order.sort()</code> sorted the list in place, so <code>order</code> is now in alphabetical order, but the value it returned is <code>None</code>. So the common mistake <code>order = order.sort()</code> replaces your list with <code>None</code>. Use either <code>order.sort()</code> on its own line, or <code>order = sorted(order)</code>, which returns a new sorted list.</p>

  <h2 id="pfn-params"><span class="num">03</span>Parameters and Arguments</h2>
  <p>A function with a constant written into it, such as a fixed 5% tax, can do only one job. Parameters make functions reusable by letting the caller supply the inputs. Two words here are often mixed up, and interviewers like to check them. A <strong>parameter</strong> is a name in the <code>def</code> line, a placeholder such as <code>amount</code> or <code>rate</code>. An <strong>argument</strong> is the actual value supplied in a call, such as <code>175.5</code> or <code>0.12</code>. Think of a printed order form: the labelled boxes ("item", "quantity", "sugar") are the parameters, and what the customer writes in them are the arguments. A box with "normal" pre-printed in it is a <strong>default</strong>: leave it blank and "normal" is used.</p>
  <p>Arguments can reach parameters in two ways. A <strong>positional argument</strong> is matched by position: the first value goes to the first parameter, the second to the second. A <strong>keyword argument</strong> is matched by name, written as <code>rate=0.12</code>, so its position does not matter. And a parameter given a default value in the <code>def</code> line, like <code>rate=0.05</code>, may be left out of the call entirely:</p>
  <div class="fx" data-lang="py">def with_tax(amount, rate=0.05):      # rate has a default
    return amount + amount * rate

print(with_tax(175.5))                # positional; rate uses its default
print(with_tax(175.5, 0.12))          # positional; overrides the default
print(with_tax(rate=0.12, amount=175.5))   # by keyword; any order
print(with_tax(175.5, rate=0.12))     # mixed: positional first</div>
  <div class="fx" data-lang="text">184.275
196.56
196.56
196.56</div>
  <p>The first call passes only the amount, so <code>rate</code> takes its default of 0.05 and the result is 184.275. The second passes both by position, so <code>rate</code> is 0.12. The third passes both by keyword, in the "wrong" order, which is fine because names, not positions, decide where each value goes. The fourth mixes the two: positional arguments first, then keyword arguments. The last three calls are identical in effect, and each gives 196.56.</p>
  <p>Python checks the matching of arguments to parameters strictly and refuses calls that do not fit. Each of these four calls is wrong in a different way:</p>
  <div class="fx" data-lang="py">for call in ["with_tax()", "with_tax(1, 2, 3)", "with_tax(175.5, amount=1)", "with_tax(rate=0.1, 175.5)"]:
    try:
        eval(call)
    except TypeError as e:
        print(f"{call:27} TypeError: {e}")
    except SyntaxError as e:
        print(f"{call:27} SyntaxError: {e.msg}")</div>
  <div class="fx" data-lang="text">with_tax()                  TypeError: with_tax() missing 1 required positional argument: 'amount'
with_tax(1, 2, 3)           TypeError: with_tax() takes from 1 to 2 positional arguments but 3 were given
with_tax(175.5, amount=1)   TypeError: with_tax() got multiple values for argument 'amount'
with_tax(rate=0.1, 175.5)   SyntaxError: positional argument follows keyword argument</div>
  <p>Leaving out a required argument and passing too many positional arguments both raise <code>TypeError</code>, with a message naming the function and the problem. Passing <code>amount</code> both by position and by name gives "got multiple values for argument". And a positional argument after a keyword argument is not even valid Python: it is a <code>SyntaxError</code>, because positional arguments must always come first. One mistake Python cannot catch is two positional arguments in the wrong order: <code>with_tax(0.12, 175.5)</code> quietly computes the wrong thing. For anything beyond the first one or two obvious inputs, passing by keyword makes calls self-explaining and safe.</p>
  <p>With parameters and return values, small functions can be combined into bigger ones. <code>bill</code> below uses <code>subtotal</code>, the <code>discount</code> rule from the previous section, and <code>with_tax</code>:</p>
  <div class="fx" data-lang="py">def bill(lines):
    sub = subtotal(lines)
    after = sub - discount(sub)
    return round(with_tax(after))

for name, lines in [("Asha", asha), ("Ben", ben), ("Chen", chen)]:
    print(name, subtotal(lines), bill(lines))</div>
  <div class="fx" data-lang="text">Asha 195 184
Ben 70 74
Chen 50 52</div>
  <p>Each small function does one job and can be tested on its own, and <code>bill</code> just connects them. Asha's bill is 184, Ben's 74 and Chen's 52. The tax rate now lives in exactly one place, the default of <code>with_tax</code>, so the bug from section 01 cannot happen.</p>
  <p>One last question about parameters is asked in almost every interview: when you pass a list into a function, can the function change it? The answer follows from the fact that the parameter is just another name for the caller's object. This way of passing arguments is called <strong>pass by object reference</strong> (or "call by sharing"), and it is neither the "pass by value" nor the "pass by reference" of other languages:</p>
  <div class="fx" data-lang="py">def add_tip(lines):
    lines.append(("tip", 1, 10))      # mutate the caller's list

def reset(lines):
    lines = []                        # rebind the LOCAL name only

table = [("samosa", 2, 15)]
add_tip(table)
print(table)
reset(table)
print(table)</div>
  <div class="fx" data-lang="text">[('samosa', 2, 15), ('tip', 1, 10)]
[('samosa', 2, 15), ('tip', 1, 10)]</div>
  <p><code>add_tip</code> <em>mutated</em> the list it was given, by appending to it; since the parameter and <code>table</code> name the same list, the caller sees the tip line. <code>reset</code> <em>rebound</em> its parameter to a new empty list; that only moved the function's local name, and the caller's <code>table</code> is untouched, so the second print is unchanged. In short, a function can change a mutable object you pass in, but it can never make your variable point at something else.</p>

  <h2 id="pfn-default"><span class="num">04</span>Mutable Default Arguments</h2>
  <p>Default values hide one of Python's most famous traps. Below, <code>add_line</code> adds a line to an order, and if no order is passed it is meant to start a new, empty one. Before reading the output, predict what the two prints will show:</p>
  <div class="fx" data-lang="py">def add_line(line, order=[]):         # the [] is built ONCE, when def runs
    order.append(line)
    return order

asha_order = add_line(("masala chai", 2, 30))
ben_order = add_line(("vada pav", 2, 20))     # a "new" order?
print(asha_order)
print(ben_order)
print(asha_order is ben_order, add_line.__defaults__)</div>
  <div class="fx" data-lang="text">[('masala chai', 2, 30), ('vada pav', 2, 20)]
[('masala chai', 2, 30), ('vada pav', 2, 20)]
True ([('masala chai', 2, 30), ('vada pav', 2, 20)],)</div>
  <p>Both names show <em>both</em> lines, and <code>asha_order is ben_order</code> is True: the two "new" orders are the same list. The cause is a rule that is easy to miss: <strong>a default value is created once, when the <code>def</code> line runs</strong>, not each time the function is called. Python builds the empty list a single time, stores it on the function object (you can see it in <code>add_line.__defaults__</code>), and hands that same stored list to every call that leaves out <code>order</code>. Since lists are mutable, each <code>append</code> changes the one shared list. Think of a shop that keeps one "default" shopping basket by the door for anyone who did not bring their own: if each customer drops items into it and nobody empties it, the next customer starts with everyone else's shopping.</p>
  <p>The same "created once, at <code>def</code> time" rule explains a quieter surprise. A default taken from a global variable keeps the value the variable had when the function was defined:</p>
  <div class="fx" data-lang="py">GST = 0.05
def with_gst(amount, rate=GST):       # rate's default = the value of GST NOW
    return amount + amount * rate

GST = 0.12                            # changing the name later...
print(with_gst(100))                  # ...does not change the stored default</div>
  <div class="fx" data-lang="text">105.0</div>
  <p><code>GST</code> was 0.05 when <code>def</code> ran, so the default stored on the function is 0.05. Changing <code>GST</code> to 0.12 later moves the name <code>GST</code> to a new object, but the stored default still points at 0.05, so the result is 105.0, not 112.0. If a function should use the current value of a global, it must read the global inside its body.</p>
  <p>The standard fix for mutable defaults uses <code>None</code> as a <strong>sentinel</strong>, a special value meaning "nothing was passed". The function checks for it and creates a fresh list <em>inside</em> the body, which runs on every call:</p>
  <div class="fx" data-lang="py">def add_line_ok(line, order=None):    # None = "nothing was passed"
    if order is None:
        order = []                    # a fresh list on every call
    order.append(line)
    return order

asha_order = add_line_ok(("masala chai", 2, 30))
ben_order = add_line_ok(("vada pav", 2, 20))
print(asha_order, ben_order, asha_order is ben_order)</div>
  <div class="fx" data-lang="text">[('masala chai', 2, 30)] [('vada pav', 2, 20)] False</div>
  <p>Now each call that omits <code>order</code> gets its own new list, so Asha's and Ben's orders are separate and <code>is</code> is False. Two details matter. First, never use a list, dict, set or any other mutable object as a default. Second, test the sentinel with <code>is None</code>, not with <code>if not order:</code>; otherwise a caller who deliberately passes an empty list of their own would have it silently replaced.</p>

  <h2 id="pfn-star"><span class="num">05</span>*args, **kwargs and Unpacking</h2>
  <p>Some functions must accept any number of inputs. <code>print</code> takes one argument or ten; <code>max</code> takes as many numbers as you give it; a function that wraps another must accept whatever the wrapped function accepts. Python handles this with stars. A parameter written with one star, conventionally <code>*args</code>, collects all the extra positional arguments into a <strong>tuple</strong>. A parameter written with two stars, conventionally <code>**kwargs</code> ("keyword arguments"), collects all the extra keyword arguments into a <strong>dictionary</strong>. The names are only habit; the stars do the work, so below they are called <code>*amounts</code> and <code>**notes</code>:</p>
  <div class="fx" data-lang="py">def total_of(*amounts):               # any number of positional arguments
    print("amounts =", amounts, type(amounts).__name__)
    return sum(amounts)

print(total_of(60, 45, 90))
print(total_of())

def make_line(item, qty, **notes):    # any number of keyword arguments
    print("notes =", notes, type(notes).__name__)
    return (item, qty, notes)

print(make_line("masala chai", 2, sugar="less", ginger=True))</div>
  <div class="fx" data-lang="text">amounts = (60, 45, 90) tuple
195
amounts = () tuple
0
notes = {'sugar': 'less', 'ginger': True} dict
('masala chai', 2, {'sugar': 'less', 'ginger': True})</div>
  <p><code>total_of(60, 45, 90)</code> collected the three values into the tuple <code>(60, 45, 90)</code> and summed them to 195; called with nothing, it received an empty tuple and returned 0. <code>make_line</code> has two normal parameters, and the extra keyword arguments <code>sugar="less"</code> and <code>ginger=True</code> were collected into the dict <code>{'sugar': 'less', 'ginger': True}</code>. Think of the "remarks" box at the bottom of a form: the normal boxes take the expected answers, and anything extra goes into remarks.</p>
  <p>Python actually has five kinds of parameter, and they must appear in a fixed order. Some must be passed by position, some may be passed either way, some must be passed by name, and two kinds collect the extras:</p>
  <table class="tbl">
    <tr><th>Kind</th><th>How it is written</th><th>How callers must pass it</th></tr>
    <tr><td>Positional-only</td><td>before a <code>/</code> marker</td><td>by position only</td></tr>
    <tr><td>Positional-or-keyword</td><td>an ordinary name, with or without a default</td><td>either way</td></tr>
    <tr><td>Var-positional</td><td><code>*args</code></td><td>extra positional values, collected into a tuple</td></tr>
    <tr><td>Keyword-only</td><td>after <code>*</code> or <code>*args</code></td><td>by name only</td></tr>
    <tr><td>Var-keyword</td><td><code>**kwargs</code></td><td>extra keyword values, collected into a dict</td></tr>
  </table>
  <p>The full order is <code>def f(a, /, b, *args, c, **kwargs)</code>. Here is a receipt function that uses most of them, called once with only the required argument and once with everything:</p>
  <div class="fx" data-lang="py">def receipt(customer, table=1, *lines, gst=0.05, **extra):
    print(customer, table, lines, gst, extra)

receipt("Asha")
receipt("Asha", 1, ("masala chai", 2, 30), ("samosa", 3, 15), gst=0.12, tip=20)</div>
  <div class="fx" data-lang="text">Asha 1 () 0.05 {}
Asha 1 (('masala chai', 2, 30), ('samosa', 3, 15)) 0.12 {'tip': 20}</div>
  <p>In the second call, "Asha" goes to <code>customer</code> and 1 to <code>table</code> by position. The two order lines are extra positional arguments, so they are collected into the tuple <code>lines</code>. <code>gst=0.12</code> matches the keyword-only parameter <code>gst</code>, which comes after <code>*lines</code> and so can only be passed by name. <code>tip=20</code> matches no parameter, so it is collected into the dict <code>extra</code>.</p>
  <p>Why would you <em>force</em> callers to pass an argument by position or by name? Because it makes calls hard to get wrong. In the function below, the bare <code>/</code> and <code>*</code> are markers, not parameters: the amount must come first and unnamed, and the payment method must be named, so a call like <code>pay(184, "upi")</code>, where a reader has to guess what "upi" means, is rejected:</p>
  <div class="fx" data-lang="py">def pay(amount, /, *, method="cash"):   # amount positional-only, method keyword-only
    return f"{amount} paid by {method}"

print(pay(184, method="upi"))
try:
    pay(184, "upi")                     # method must be named
except TypeError as e:
    print("TypeError:", e)
try:
    pay(amount=184)                     # amount must NOT be named
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">184 paid by upi
TypeError: pay() takes 1 positional argument but 2 were given
TypeError: pay() got some positional-only arguments passed as keyword arguments: 'amount'</div>
  <p>The named call works. Passing the method by position fails ("takes 1 positional argument but 2 were given"), and passing the amount by name fails too. Keyword-only parameters are common in well-designed libraries such as scikit-learn, because they keep calls readable and let the library add or reorder options later without breaking anyone's code. Positional-only parameters let a library rename a parameter without breaking callers, and many built-in functions use them.</p>
  <p>The stars also work in the opposite direction, inside a <em>call</em>. There, <code>*sequence</code> spreads a list or tuple out into separate positional arguments, and <code>**dictionary</code> spreads a dict out into keyword arguments. This is called <strong>unpacking</strong>:</p>
  <div class="fx" data-lang="py">line = ("samosa", 3, 15)
print(*line)                            # same as print("samosa", 3, 15)
cfg = {"gst": 0.12, "tip": 20}
receipt("Ben", 2, *ben, **cfg)          # spread a list and a dict into a call</div>
  <div class="fx" data-lang="text">samosa 3 15
Ben 2 (('masala chai', 1, 30), ('vada pav', 2, 20)) 0.12 {'tip': 20}</div>
  <p><code>print(*line)</code> is the same as <code>print("samosa", 3, 15)</code>, so the three parts print separated by spaces rather than as a tuple. In the receipt call, <code>*ben</code> spreads Ben's two order lines into separate arguments, which <code>*lines</code> then collects, and <code>**cfg</code> becomes <code>gst=0.12, tip=20</code>. Collecting with <code>*args, **kwargs</code> and passing on with <code>*args, **kwargs</code> is exactly how one function can forward any call to another, which section 10 uses. One caution: <code>**kwargs</code> accepts anything, including typos, so only use it when you genuinely need to accept or forward unknown keyword arguments.</p>

  <h2 id="pfn-scope"><span class="num">06</span>Scope and the LEGB Rule</h2>
  <p>Many functions use names like <code>total</code>, <code>s</code> or <code>result</code> for their working values. If all functions shared one set of names, calling one function could overwrite another's working values, and every program would be a minefield. Python prevents this with <strong>scope</strong>: the region of a program in which a name can be seen. A name created inside a function, including its parameters, is <strong>local</strong>: it exists only while that call runs, and code outside cannot see it. A name created at the top level of a file is <strong>global</strong>: every function in that file can read it.</p>
  <div class="fx" data-lang="py">GST_RATE = 0.05                         # global: top level of the file
def tax(amount):
    t = amount * GST_RATE               # t and amount are local
    return round(t, 3)

print(tax(175.5))
try:
    print(t)
except NameError as e:
    print("NameError:", e)</div>
  <div class="fx" data-lang="text">8.775
NameError: name 't' is not defined</div>
  <p>Inside <code>tax</code>, the names <code>amount</code> and <code>t</code> are local, while <code>GST_RATE</code> is global, and the function can read it. After the call ends, <code>t</code> no longer exists, so trying to print it at the top level raises a <code>NameError</code>. Think of each function call as a room with its own whiteboard: what is written on it is wiped when the call ends, and nobody outside can read it.</p>
  <p>When Python meets a name, it needs to decide which variable you mean, and it does so by searching up to four places in a fixed order, using the first match it finds. The first letters of the four places spell <strong>LEGB</strong>: <strong>Local</strong> (the current function), <strong>Enclosing</strong> (any outer function, when a function is defined inside another one), <strong>Global</strong> (the top level of the file), and <strong>Built-in</strong> (names Python provides everywhere, such as <code>len</code>, <code>print</code> and <code>round</code>). Think of looking for your keys: first your pocket, then the room, then the house, then the lost-property office, and you stop as soon as you find them. The figure shows the four scopes nested inside one another.</p>
  <figure class="viz"><svg viewBox="0 0 440 190" width="440">
    <rect x="5" y="5" width="430" height="180" rx="10" class="fs" stroke="currentColor"/><text x="15" y="24">B  built-in: len, round, print, sum</text>
    <rect x="25" y="34" width="390" height="140" rx="10" class="fv"/><text x="35" y="53">G  module globals: GST_RATE = 0.05</text>
    <rect x="45" y="63" width="350" height="100" rx="10" class="ft st"/><text x="55" y="82">E  outer(): where = "enclosing"</text>
    <rect x="65" y="92" width="310" height="60" rx="10" class="fb sb"/><text x="75" y="113">L  inner(): looks here first</text>
    <text x="75" y="136">not found → try the next box out</text>
  </svg><figcaption>Name lookup starts in the innermost box and works outward: Local, Enclosing, Global, Built-in. The first match wins.</figcaption></figure>
  <p>Here is LEGB at work with a function defined inside another function:</p>
  <div class="fx" data-lang="py">where = "global"
def outer():
    where = "enclosing"
    def inner():
        print("inner sees:", where, "| len is", len)   # E, then B
    inner()
outer()
print("module sees:", where)</div>
  <div class="fx" data-lang="text">inner sees: enclosing | len is &lt;built-in function len&gt;
module sees: global</div>
  <p><code>inner</code> has no local <code>where</code>, so Python looks in the enclosing function, <code>outer</code>, finds "enclosing", and stops; it never reaches the global "global". <code>len</code> is not local, enclosing or global, so it is found in Built-in. And the module-level print still sees the global value, because <code>outer</code>'s assignment created a local variable of its own rather than changing the global one.</p>
  <p>That last point leads to the rule that surprises almost everyone. Python decides whether a name is local <em>before</em> the function runs, by looking at the whole body: <strong>if a function assigns to a name anywhere in its body, that name is local everywhere in the function</strong>. Reading an outer variable is fine, but trying to update one is not:</p>
  <div class="fx" data-lang="py">bills_today = 0
def record_bill():
    bills_today += 1                    # assignment makes it LOCAL everywhere in the function
try:
    record_bill()
except UnboundLocalError as e:
    print("UnboundLocalError:", e)

def record_bill_global():
    global bills_today                  # use the module-level name
    bills_today += 1
record_bill_global(); record_bill_global()
print(bills_today)

def record_bill_pure(count):            # better: take the value in, give it back
    return count + 1
print(record_bill_pure(bills_today))</div>
  <div class="fx" data-lang="text">UnboundLocalError: cannot access local variable 'bills_today' where it is not associated with a value
2
3</div>
  <p>In <code>record_bill</code>, the line <code>bills_today += 1</code> assigns to <code>bills_today</code>, so Python treats it as local for the whole function. The <code>+=</code> then tries to read that local before it has any value, and Python raises <code>UnboundLocalError</code>, "cannot access local variable … where it is not associated with a value". The second version declares <code>global bills_today</code>, which tells Python that assignments in this function should change the module-level name; after two calls the counter is 2. That works, but it means any function can change the counter from anywhere, which makes bugs hard to trace. The third version shows the cleaner design: take the value in as a parameter and return the new value, so the function has no hidden effects. As for what does <em>not</em> need any declaration: reading a global, or mutating a global object in place with something like <code>items.append(x)</code>, because neither assigns to the name. Also remember from <a class="xref" data-note="py_control">Decisions &amp; Loops</a> that <code>if</code> blocks and loops do not create a scope; only functions (and classes and comprehensions) do.</p>

  <h2 id="pfn-closure"><span class="num">07</span>Closures</h2>
  <p>The stall wants a bill-number counter: 1, 2, 3 and so on, with each call returning the next number. A local variable cannot do this, because locals are wiped at the end of every call, and a global variable works but can be changed by any code in the program. What we want is a small private memory that only the counter can reach. Python provides this through <strong>closures</strong>. A closure is a function that remembers the variables of the function it was created in, even after that outer function has finished. To change such a remembered variable, the inner function declares it <code>nonlocal</code>, which means "assignments should go to the variable in the enclosing function, not create a new local one":</p>
  <div class="fx" data-lang="py">def make_bill_counter():
    n = 0
    def next_bill_no():
        nonlocal n                      # rebind outer's n, not a new local
        n += 1
        return n
    return next_bill_no

next_no = make_bill_counter()
print(next_no(), next_no(), next_no())
other_stall = make_bill_counter()
print(other_stall(), next_no())</div>
  <div class="fx" data-lang="text">1 2 3
1 4</div>
  <p>Follow the calls. <code>make_bill_counter()</code> creates a local <code>n = 0</code>, defines <code>next_bill_no</code> inside itself, and returns that inner function, which we name <code>next_no</code>. At that point <code>make_bill_counter</code> has finished, so normally its local <code>n</code> would be gone, but <code>next_bill_no</code> still refers to it, so Python keeps it alive. Each call to <code>next_no()</code> adds 1 to that remembered <code>n</code>, giving 1, 2, 3. Calling <code>make_bill_counter()</code> a second time creates a completely new <code>n</code>, so <code>other_stall()</code> starts again at 1, while <code>next_no()</code> continues with 4. Think of a ticket machine at a counter: each machine keeps its own count inside, and nobody can reach in and change it; the only way to use it is to press its button.</p>
  <p>Closures are also used to build customised functions from a template. A function that creates and returns other functions is called a <strong>factory</strong>. Here <code>make_discount</code> builds discount rules, each remembering its own percentage and threshold:</p>
  <div class="fx" data-lang="py">def make_discount(pct, at=0):           # a function that BUILDS functions
    def rule(sub):
        return sub * pct if sub &gt;= at else 0
    return rule

student = make_discount(0.15)
bulk = make_discount(0.10, at=150)
print(student(70), bulk(195), bulk(70))
print(bulk.__closure__[0].cell_contents, bulk.__closure__[1].cell_contents)</div>
  <div class="fx" data-lang="text">10.5 19.5 0
150 0.1</div>
  <p><code>make_discount(0.15)</code> returns a rule that takes 15% off any amount, so the student rule gives 10.5 on a ₹70 order. <code>make_discount(0.10, at=150)</code> returns a rule that remembers both 0.10 and 150, so it gives 19.5 on ₹195 and 0 on ₹70. The last line peeks at where those remembered values live: every closure has a <code>__closure__</code> attribute holding "cells" for the outer variables it uses, here <code>at</code> (150) and <code>pct</code> (0.1). You never need to touch <code>__closure__</code> in real code, but it shows that the memory is real and attached to the function. Closures are the foundation of decorators, covered in <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>.</p>

  <h2 id="pfn-rec"><span class="num">08</span>Recursion</h2>
  <p>Some problems contain smaller copies of themselves. A folder contains folders; a gift box can contain smaller boxes; an order is "the first line plus the rest of the order". A <strong>recursive</strong> function solves such a problem by calling <em>itself</em> on the smaller copy. To avoid calling itself forever, it must have a <strong>base case</strong>: a version of the problem small enough to answer directly, without another call. Think of standing in a long queue and wanting to know your position. You ask the person in front, who asks the person in front of them, and so on until the person at the very front, who knows they are number 1: that is the base case. Each answer then comes back down the queue with 1 added. The smallest possible example is a countdown:</p>
  <div class="fx" data-lang="py">def countdown(n):
    if n == 0:            # base case: stop here
        print("Go!")
        return
    print(n)
    countdown(n - 1)      # the same job on a smaller problem
countdown(3)</div>
  <div class="fx" data-lang="text">3
2
1
Go!</div>
  <p><code>countdown(3)</code> prints 3 and hands the smaller job, <code>countdown(2)</code>, to itself; that prints 2 and calls <code>countdown(1)</code>, which prints 1 and calls <code>countdown(0)</code>. Zero is the base case, which prints "Go!" and returns without calling again.</p>
  <p>To understand how recursion really works you need the idea of the <strong>call stack</strong>. Every call that has started but not yet finished keeps its own local variables in a <strong>frame</strong>, and the frames are piled up like plates: each new call goes on top, and when a call returns, its frame is removed and the call below it continues. Let us write an order's total recursively: the total of an order is the first line's amount plus the total of the rest, and the total of an empty order is 0. The function prints each step, indented by how deep it is, so we can watch the calls go down and the answers come back up:</p>
  <div class="fx" data-lang="py">def total(lines, depth=0):
    pad = "  " * depth
    if not lines:                               # base case: empty order
        print(pad + "total([]) = 0")
        return 0
    item, qty, price = lines[0]
    print(pad + f"total({len(lines)} line(s)) = {qty * price} + total(rest)")
    result = qty * price + total(lines[1:], depth + 1)   # smaller problem
    print(pad + f"returns {result}")
    return result

print(total(asha))</div>
  <div class="fx" data-lang="text">total(3 line(s)) = 60 + total(rest)
  total(2 line(s)) = 45 + total(rest)
    total(1 line(s)) = 90 + total(rest)
      total([]) = 0
    returns 90
  returns 135
returns 195
195</div>
  <p>The first call, with three lines, cannot finish yet: it needs the total of the remaining two lines, so it calls itself, and its own frame waits on the stack. The second call waits for the third, and the third waits for the fourth, which receives an empty list, hits the base case and returns 0 without calling again. Now the stack unwinds: the third call can finish 90 + 0 = 90, the second 45 + 90 = 135, and the first 60 + 135 = 195. The figure shows the same shape for factorial, the classic textbook example, where 3! = 3 × 2 × 1.</p>
  <figure class="viz"><svg viewBox="0 0 520 190" width="520">
    <defs><marker id="pfn-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" class="tm">calls go down</text>
    <text x="380" y="16" class="tm">answers come up</text>
    <rect x="120" y="26" width="200" height="30" rx="6" class="fb sb"/><text x="132" y="46">fact(3) = 3 * fact(2)</text>
    <rect x="120" y="74" width="200" height="30" rx="6" class="fb sb"/><text x="132" y="94">fact(2) = 2 * fact(1)</text>
    <rect x="120" y="122" width="200" height="30" rx="6" class="fg sg"/><text x="132" y="142">fact(1) = 1  (base)</text>
    <line x1="160" y1="56" x2="160" y2="72" stroke="currentColor" marker-end="url(#pfn-ah4)"/>
    <line x1="160" y1="104" x2="160" y2="120" stroke="currentColor" marker-end="url(#pfn-ah4)"/>
    <line x1="290" y1="120" x2="290" y2="106" stroke="currentColor" marker-end="url(#pfn-ah4)"/>
    <line x1="290" y1="72" x2="290" y2="58" stroke="currentColor" marker-end="url(#pfn-ah4)"/>
    <text x="340" y="142" class="tg">returns 1</text>
    <text x="340" y="94" class="tg">returns 2*1 = 2</text>
    <text x="340" y="46" class="tg">returns 3*2 = 6</text>
    <text x="60" y="178" class="tm">each waiting call holds a frame in memory: too deep → RecursionError</text>
  </svg><figcaption>Each call waits for the one below it. The base case starts the answers travelling back up the stack.</figcaption></figure>
  <p>For a flat list like an order, a loop is simpler than recursion. Recursion earns its place with <em>nested</em> data of unknown depth, where a loop would need one nested loop per level and you do not know how many levels there are. Suppose a party order can contain boxes, and boxes can contain more boxes:</p>
  <div class="fx" data-lang="py">party = [
    ("masala chai", 2, 30),
    ("box", [("samosa", 2, 15),
             ("box", [("vada pav", 1, 20), ("samosa", 1, 15)])]),
    ("cold coffee", 1, 90),
]
def box_total(lines):
    s = 0
    for line in lines:
        if line[0] == "box":
            s += box_total(line[1])     # a box is a smaller order: recurse
        else:
            item, qty, price = line
            s += qty * price
    return s
print(box_total(party))</div>
  <div class="fx" data-lang="text">215</div>
  <p>When <code>box_total</code> meets a box, it calls itself on the box's contents, because a box is just a smaller order. Working by hand: the chai is 60; the outer box is 2 samosas (30) plus an inner box of vada pav and samosa (20 + 15 = 35), so 65; the cold coffee is 90. Total 60 + 65 + 90 = 215. The same short function handles any depth of nesting, which is why recursion is the natural tool for trees, folders and JSON documents.</p>
  <p>Recursion has limits. Every waiting call holds a frame in memory, so CPython stops a recursion that goes about 1000 calls deep, to protect itself from crashing:</p>
  <div class="fx" data-lang="py">import sys
def fact(n):
    return 1 if n &lt;= 1 else n * fact(n - 1)   # base case + smaller step
print(fact(5))
print(sys.getrecursionlimit())
try:
    fact(5000)
except RecursionError as e:
    print("RecursionError:", e)</div>
  <div class="fx" data-lang="text">120
1000
RecursionError: maximum recursion depth exceeded</div>
  <p><code>fact(5)</code> is 120. <code>sys.getrecursionlimit()</code> shows the limit of 1000, and <code>fact(5000)</code> exceeds it, raising <code>RecursionError</code>. Python also does not perform <em>tail-call optimisation</em>, a trick some languages use to run certain recursive calls without growing the stack. So for very deep inputs, such as a linked list with thousands of items, rewrite the recursion as a loop, using a list as your own stack if necessary; raising the limit with <code>sys.setrecursionlimit</code> can crash the interpreter.</p>
  <p>A second problem appears when a recursive function solves the same small problems over and over. The Fibonacci numbers (each is the sum of the two before) are the standard example: <code>fib(30)</code> asks for <code>fib(29)</code> and <code>fib(28)</code>, and <code>fib(29)</code> asks for <code>fib(28)</code> again, and so on, so the same values are recomputed an enormous number of times. Saving each answer the first time it is computed and reusing it afterwards is called <strong>memoisation</strong>, and Python provides it ready-made as <code>functools.lru_cache</code> (timings approximate):</p>
  <div class="fx" data-lang="py">import time
from functools import lru_cache

def fib(n):
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)

@lru_cache(maxsize=None)            # remember each answer
def fib_cached(n):
    return n if n &lt; 2 else fib_cached(n - 1) + fib_cached(n - 2)

t0 = time.perf_counter(); a = fib(30); t1 = time.perf_counter()
b = fib_cached(30); t2 = time.perf_counter()
print(a, b)
print(f"plain: {t1 - t0:.3f} s   cached: {t2 - t1:.6f} s")
print(fib_cached(80))</div>
  <div class="fx" data-lang="text">832040 832040
plain: 0.091 s   cached: 0.000052 s
23416728348467685</div>
  <p>Both versions give 832040, but the plain one took tens of milliseconds while the cached one took microseconds, because each Fibonacci number was computed only once. The line <code>@lru_cache(maxsize=None)</code> above the function is a <em>decorator</em>, a way of wrapping a function with extra behaviour, which section 10 previews. With the cache, even <code>fib_cached(80)</code>, which the plain version would take years to finish, is instant.</p>

  <h2 id="pfn-lambda"><span class="num">09</span>lambda Expressions</h2>
  <p>Some functions are needed only once, for a moment, as an argument to another function. The classic case is sorting: <code>sorted</code> can sort the order lines by any rule you like, but you must give it a function that says what to compare, through its <code>key</code> parameter. Writing a full <code>def</code> with a name for a one-line rule used once is clumsy, so Python has the <strong>lambda expression</strong>: a small function with no name, whose body is a single expression. <code>lambda line: line[1] * line[2]</code> means "a function that takes <code>line</code> and gives back <code>line[1] * line[2]</code>", that is, quantity times price. There is no <code>return</code> keyword; the expression's value is returned automatically.</p>
  <div class="fx" data-lang="py">amount = lambda line: line[1] * line[2]     # a function with no def
print(amount(("samosa", 3, 15)))
print(sorted(asha, key=lambda line: line[1] * line[2], reverse=True))
print(sorted(asha, key=lambda line: line[2]))     # by unit price, cheapest first
print(list(map(lambda line: line[0].upper(), asha)))
print(max(asha, key=amount))</div>
  <div class="fx" data-lang="text">45
[('cold coffee', 1, 90), ('masala chai', 2, 30), ('samosa', 3, 15)]
[('samosa', 3, 15), ('masala chai', 2, 30), ('cold coffee', 1, 90)]
['MASALA CHAI', 'SAMOSA', 'COLD COFFEE']
('cold coffee', 1, 90)</div>
  <p>The first line binds a lambda to a name, which works (it gives 45 for 3 samosas at 15), but if you are going to name a function, a <code>def</code> is clearer. The next two lines show the real use. <code>key=lambda line: line[1] * line[2]</code> tells <code>sorted</code> to compare lines by their amount, and <code>reverse=True</code> puts the biggest first: cold coffee (90), chai (60), samosas (45). The next sorts by unit price, cheapest first. <code>map(f, items)</code> applies a function to every item, here capitalising each item name. And <code>max(asha, key=amount)</code> finds the line with the biggest amount, the best-so-far pattern from <a class="xref" data-note="py_control">Decisions &amp; Loops</a> in a single call. A lambda supports the same kinds of parameters as <code>def</code>, but it cannot contain statements (no loops, no <code>try</code>, no ordinary assignments), cannot have a docstring, and appears in error messages as <code>&lt;lambda&gt;</code>, which is less helpful than a real name.</p>
  <p>Lambdas made inside a loop have a famous trap. Here three discount rules, 5%, 10% and 15%, are built in a loop and applied to ₹200:</p>
  <div class="fx" data-lang="py">rules = [lambda amt: amt * p for p in (0.05, 0.10, 0.15)]
print([rule(200) for rule in rules])               # all use the LAST p
rules = [lambda amt, p=p: amt * p for p in (0.05, 0.10, 0.15)]
print([rule(200) for rule in rules])               # p stored per lambda</div>
  <div class="fx" data-lang="text">[30.0, 30.0, 30.0]
[10.0, 20.0, 30.0]</div>
  <p>All three rules give 30.0, the 15% answer. The reason is called <strong>late binding</strong>: a function looks up outside variables at the moment it is <em>called</em>, not at the moment it is created. All three lambdas refer to the same loop variable <code>p</code>, and by the time they are called, the loop has finished and <code>p</code> is 0.15. The fix uses the rule from section 04 deliberately: default values are evaluated when the function is created, so writing <code>p=p</code> as a default parameter stores the current value of <code>p</code> inside each lambda. The second line gives the intended 10.0, 20.0 and 30.0. (<code>functools.partial</code>, shown in the next section, is another fix.)</p>

  <h2 id="pfn-values"><span class="num">10</span>Functions as Values</h2>
  <p>Suppose the stall runs a festival sale with 20% off everything, and a "no discount" mode for staff meals. One option is to write <code>bill_regular</code>, <code>bill_festival</code> and <code>bill_staff</code>, each a copy of the billing logic with a different discount line, which brings back the copied-code problem from section 01. The better option uses a fact we have already seen: in Python, functions are <strong>first-class objects</strong>, which means a function is a value like a number or a list. It can be given another name, stored in a list or dictionary, passed to another function, and returned from one.</p>
  <div class="fx" data-lang="py">f = subtotal                            # a second name for the same function
print(f(asha), f is subtotal)
rules = {
    "regular": discount,                # our 10%-at-150 rule
    "festival": lambda sub: sub * 0.20, # 20% off everything
    "none": lambda sub: 0,
}
for name, rule in rules.items():
    print(f"{name:8}", rule(195))</div>
  <div class="fx" data-lang="text">195 True
regular  19.5
festival 39.0
none     0</div>
  <p><code>f = subtotal</code> gives the function a second name (no brackets, so nothing is called), and <code>f(asha)</code> works exactly like <code>subtotal(asha)</code>. Then three discount rules are stored as the values of a dictionary: our existing <code>discount</code> function and two lambdas. The loop calls each rule on ₹195, giving 19.5, 39.0 and 0. Now <code>bill</code> can take the discount rule as a parameter:</p>
  <div class="fx" data-lang="py">def bill(lines, discount_rule=discount, gst=0.05):
    sub = subtotal(lines)
    after = sub - discount_rule(sub)    # call whatever function was passed in
    return round(with_tax(after, gst))

print(bill(asha), bill(asha, rules["festival"]), bill(ben, rules["none"]))</div>
  <div class="fx" data-lang="text">184 164 74</div>
  <p><code>bill</code> calls whatever function it was given, with the regular rule as the default. It does not care which rule it gets, only that the rule can be called with a subtotal. The regular rule gives Asha ₹184; the festival rule gives 195 × 0.8 = 156, plus tax 163.8, rounded to ₹164; and no discount on Ben's ₹70 gives ₹74. One <code>bill</code> function, any rule. A function that takes another function as an argument, or returns one, is called a <strong>higher-order function</strong>. You have already used several: <code>sorted</code> and <code>max</code> with <code>key=</code>, <code>map</code>, and the <code>make_discount</code> factory from section 07, which returns functions. This style is sometimes called the "strategy" pattern: the caller chooses the strategy, and the function applies it.</p>
  <p>Combining both directions, a function can take a function and return a new function that calls the original with some extra behaviour around it. Below, <code>logged</code> wraps any function so that each call is logged. <code>*args, **kwargs</code> from section 05 let the wrapper accept any arguments and pass them straight on:</p>
  <div class="fx" data-lang="py">def logged(func):                       # takes a function, returns a new one
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(f"  [log] {func.__name__}{args} -&gt; {result}")
        return result
    return wrapper

logged_tax = logged(with_tax)           # a new function that wraps the old one
print(round(logged_tax(175.5)))
print(round(with_tax(175.5)))           # the original is untouched: no log line</div>
  <div class="fx" data-lang="text">  [log] with_tax(175.5,) -&gt; 184.275
184
184</div>
  <p><code>logged(with_tax)</code> returns a new function, <code>wrapper</code>, which is a closure remembering <code>func</code>. Calling <code>logged_tax(175.5)</code> runs the original <code>with_tax</code>, prints a log line showing the arguments and result, and returns the same 184.275. The original <code>with_tax</code> is untouched, so calling it directly prints no log line. Writing <code>with_tax = logged(with_tax)</code> would replace the original name with the logged version, and Python's <code>@logged</code> line above a <code>def</code> is shorthand for exactly that. That shorthand is called a <strong>decorator</strong>, and it is how features like timing, caching (<code>@lru_cache</code>) and access checks are added to functions; it is the whole subject of <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>.</p>
  <p>The standard library also has a ready-made helper for a common higher-order task: creating a version of a function with some arguments already filled in. <code>functools.partial</code> does this:</p>
  <div class="fx" data-lang="py">from functools import partial
gst12 = partial(with_tax, rate=0.12)    # with_tax with rate already filled in
print(gst12(100), gst12(175.5))</div>
  <div class="fx" data-lang="text">112.0 196.56</div>
  <p><code>partial(with_tax, rate=0.12)</code> returns a new callable that behaves like <code>with_tax</code> with <code>rate</code> fixed at 0.12, so <code>gst12(100)</code> is 112.0. It is handy when a library expects a function with fewer parameters than yours, and it avoids the late-binding trap when building functions in a loop.</p>

  <h2 id="pfn-doc"><span class="num">11</span>Docstrings and Type Hints</h2>
  <p>The first line of a function, its <strong>signature</strong>, shows the parameter names but not what they mean or what types of value they expect. Does <code>bill_total(lines, gst)</code> want a percentage like 5 or a fraction like 0.05? A reader should not have to read the body to find out. Python offers two tools for recording this contract where people, editors and checking tools can see it. A <strong>docstring</strong> is a string written as the very first statement in a function's body; Python stores it in the function's <code>__doc__</code> attribute, and <code>help(f)</code> and every editor display it. <strong>Type hints</strong>, also called annotations, are written after parameter names (<code>gst: float</code>) and after an arrow for the return type (<code>-&gt; int</code>); Python stores them in <code>__annotations__</code>.</p>
  <div class="fx" data-lang="py">def bill_total(lines: list[tuple[str, int, int]], gst: float = 0.05) -&gt; int:
    """Return the rounded bill for one order.

    lines: (item, qty, price) tuples. 10% off at 150+, then GST.
    """
    sub = subtotal(lines)
    return round((sub - discount(sub)) * (1 + gst))

print(bill_total(asha))
print(bill_total.__doc__.splitlines()[0])
print(bill_total.__annotations__)
import inspect
print(inspect.signature(bill_total))</div>
  <div class="fx" data-lang="text">184
Return the rounded bill for one order.
{'lines': list[tuple[str, int, int]], 'gst': &lt;class 'float'&gt;, 'return': &lt;class 'int'&gt;}
(lines: list[tuple[str, int, int]], gst: float = 0.05) -&gt; int</div>
  <p>The function works as before, returning 184 for Asha's order. The next lines show what Python stored: the first line of the docstring, the annotations dictionary, and the full signature from <code>inspect.signature</code>. The hint <code>list[tuple[str, int, int]]</code> reads "a list of tuples, each holding a str, an int and an int", which describes our order lines exactly. Docstrings should say what the function does, what its parameters mean and what it returns; and they must be kept true, since a docstring describing an old rule is worse than none.</p>
  <p>The most important fact about type hints is easy to get wrong: Python does not check them when the program runs.</p>
  <div class="fx" data-lang="py">def double(x: int) -&gt; int:
    return x * 2
print(double(21), double("ab"), double([0]))   # hints are not checked at run time</div>
  <div class="fx" data-lang="text">42 abab [0, 0]</div>
  <p><code>double</code> claims to take and return an int, but <code>double("ab")</code> happily returns "abab" and <code>double([0])</code> returns <code>[0, 0]</code>, because Python ignores the hints at run time. Hints are for humans and for tools: editors use them for autocompletion and warnings, and a separate checker such as mypy or pyright reads your code before it runs and reports <code>double("ab")</code> as an error. Some libraries, such as Pydantic and FastAPI, deliberately read hints to validate data at run time, but that is the library's choice. So never rely on hints alone to reject bad input; check data explicitly where it enters the program.</p>

  <h2 id="pfn-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Most function mistakes have already appeared in context, so this section gathers them with their fixes. The commonest is printing instead of returning: the function displays the right answer, but its caller receives <code>None</code>, and the program fails later with an error about <code>'NoneType'</code>. Return the value and print it at the top level. Closely related is <code>order = order.sort()</code>, which replaces the list with <code>None</code>; use <code>order.sort()</code> alone or <code>order = sorted(order)</code>.</p>
  <p>A mistake that appears as soon as you start passing functions around is passing the <em>result</em> of a call instead of the function itself:</p>
  <div class="fx" data-lang="py">def festival(sub):
    return sub * 0.20
try:
    bill(asha, festival(195))           # passes a NUMBER, not the function
except TypeError as e:
    print("TypeError:", e)
print(bill(asha, festival))             # pass the function itself</div>
  <div class="fx" data-lang="text">TypeError: 'float' object is not callable
164</div>
  <p><code>festival(195)</code> with brackets calls the rule immediately and passes its result, the number 39.0, to <code>bill</code>. When <code>bill</code> later tries to call that number, Python raises "'float' object is not callable". Without brackets, <code>festival</code> is the function itself, and <code>bill</code> can call it when it is ready, giving 164.</p>
  <p>Another quiet mistake comes from accepting <code>**kwargs</code> too freely. Because it collects every unexpected keyword argument, a misspelt argument name is silently accepted instead of raising an error:</p>
  <div class="fx" data-lang="py">def receipt(customer, *, gst=0.05, **extra):
    print(customer, gst, extra)

receipt("Asha", gts=0.12)               # typo: silently swallowed by **extra</div>
  <div class="fx" data-lang="text">Asha 0.05 {'gts': 0.12}</div>
  <p>The caller meant to set <code>gst=0.12</code> but typed <code>gts</code>. Instead of an error, the typo landed in <code>extra</code> and the default 0.05 was used, so the bill is wrong. Use explicit keyword-only parameters for options you know about, and accept <code>**kwargs</code> only when you genuinely forward them to another function.</p>
  <p>The remaining classics, each explained in its own section above, are worth listing once more because interviewers ask about all of them. A mutable default such as <code>def f(x=[])</code> is shared between calls; use <code>x=None</code> and create the list inside. A default taken from a global, like <code>rate=GST</code>, is frozen at definition time. Assigning to a global name inside a function, such as <code>count += 1</code>, raises <code>UnboundLocalError</code>; pass the value in and return the new one, or declare <code>global</code> if you must. Lambdas created in a loop all see the loop variable's final value; bind it with <code>p=p</code> or use <code>functools.partial</code>. A recursive function without a reachable base case, or with very deep input, raises <code>RecursionError</code>; check the base case, and use a loop for deep data. Swapped positional arguments give wrong answers without an error; pass by keyword. And type hints are not checks: validate input explicitly.</p>

  <h2 id="pfn-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Function</b>: a named, reusable block of code; <code>def</code> creates it, the body runs on each <b>call</b>.</li>
    <li><b>Parameter</b>: name in the <code>def</code> line. <b>Argument</b>: value passed in a call.</li>
    <li><b>Return value</b>: what the call evaluates to; <code>None</code> if there is no <code>return</code>.</li>
    <li><b>Scope</b>: where a name is visible. <b>Local</b>: inside a function. <b>Global</b>: top level of a module.</li>
    <li><b>Closure</b>: a function that remembers variables from the function it was created in.</li>
    <li><b>Recursion</b>: a function calling itself on a smaller problem, stopping at a <b>base case</b>.</li>
    <li><b>Higher-order function</b>: takes or returns functions. <b>Decorator</b>: a higher-order function applied with <code>@</code>.</li>
    <li><b>Pass by object reference</b>: a parameter is a new name for the caller's object; mutation is visible, rebinding is not.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">def f(a, /, b, c=1, *args, d, e=2, **kwargs):
    """Docstring: what f does."""     # stored in f.__doc__
    return a, b                       # one tuple

f(1, 2, d=3)                          # a=1, b=2, d=3
f(1, b=2, d=3, extra=4)               # extra -&gt; kwargs
f(*[1, 2], **{"d": 3})                # unpacking in a call

square = lambda x: x * x              # one expression, implicit return

def make_counter():
    n = 0
    def step():
        nonlocal n                    # rebind the enclosing n
        n += 1
        return n
    return step                       # a closure</div>
  <h3>Parameter kinds</h3>
  <table class="tbl">
    <tr><th>Kind</th><th>Written</th><th>Passed</th></tr>
    <tr><td>Positional-only</td><td>before <code>/</code></td><td>by position</td></tr>
    <tr><td>Positional-or-keyword</td><td><code>b</code>, <code>c=1</code></td><td>either way</td></tr>
    <tr><td>Var-positional</td><td><code>*args</code></td><td>extras → tuple</td></tr>
    <tr><td>Keyword-only</td><td>after <code>*</code> / <code>*args</code></td><td>by name</td></tr>
    <tr><td>Var-keyword</td><td><code>**kwargs</code></td><td>extras → dict</td></tr>
  </table>
  <h3>Rules</h3>
  <ul>
    <li>Defaults are evaluated once, at <code>def</code> time, and stored in <code>f.__defaults__</code>. Mutable default → shared; use <code>None</code> and <code>if x is None: x = []</code>.</li>
    <li>LEGB: Local → Enclosing → Global → Built-in; first match wins.</li>
    <li>Assigning to a name anywhere in a function makes it local for the whole function; <code>global</code> / <code>nonlocal</code> change that.</li>
    <li>Only functions, classes and comprehensions create scopes; loops and <code>if</code> do not.</li>
    <li>Recursion limit about 1000 (<code>sys.getrecursionlimit()</code>); no tail-call optimisation; memoise with <code>@functools.lru_cache</code>.</li>
    <li>Late binding: functions read outer variables when called; fix loops with <code>lambda x, p=p: ...</code> or <code>functools.partial</code>.</li>
    <li>Type hints live in <code>__annotations__</code> and are not enforced at run time.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Print is not return; the caller gets <code>None</code>.</li>
    <li><code>xs = xs.sort()</code> sets <code>xs</code> to <code>None</code>.</li>
    <li>Pass <code>f</code>, not <code>f()</code>, when giving a function to another function.</li>
    <li><code>**kwargs</code> swallows misspelt keyword arguments.</li>
    <li><code>count += 1</code> on a global → <code>UnboundLocalError</code>.</li>
    <li>A wrapper without <code>functools.wraps</code> hides the original's name and docstring.</li>
  </ul>

  <h2 id="pfn-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a parameter and an argument?</summary><div class="qa-body">A parameter is a name in the function definition, such as <code>amount</code> in <code>def with_tax(amount, rate=0.05)</code>. An argument is the value supplied in a call, such as <code>175.5</code> in <code>with_tax(175.5, rate=0.12)</code>. Arguments are matched to parameters by position first, then by keyword.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a function return if it has no <code>return</code> statement?</summary><div class="qa-body"><code>None</code>. That is why a helper that only prints its result cannot be reused: <code>x = show(...)</code> gives <code>None</code>, and <code>x + 10</code> raises TypeError. It is also why <code>xs = xs.sort()</code> sets <code>xs</code> to <code>None</code>, since in-place methods return <code>None</code> by convention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>def f(x, l=[]): l.append(x); return l</code>, then <code>f(1); f(2); print(f(3))</code></summary><div class="qa-body"><code>[1, 2, 3]</code>. The default list is created once, when <code>def</code> runs, and stored in <code>f.__defaults__</code>; every call that leaves out <code>l</code> appends to that same list. The fix is <code>def f(x, l=None):</code> followed by <code>if l is None: l = []</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python pass-by-value or pass-by-reference?</summary><div class="qa-body">Neither exactly; it is pass by object reference, also called call by sharing. The parameter becomes a new name for the caller's object. If the function mutates that object, for example by appending to a list, the caller sees the change. If the function rebinds the parameter, for example <code>lines = []</code>, only its local name moves and the caller sees nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are <code>*args</code> and <code>**kwargs</code>?</summary><div class="qa-body">In a definition, <code>*args</code> collects extra positional arguments into a tuple and <code>**kwargs</code> collects extra keyword arguments into a dict. In a call, <code>*seq</code> and <code>**mapping</code> do the opposite and unpack into separate arguments. Together they let a wrapper accept and forward any call with <code>return func(*args, **kwargs)</code>. The names are conventions; the stars do the work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>/</code> and <code>*</code> mean in a parameter list?</summary><div class="qa-body">Parameters before <code>/</code> are positional-only, and parameters after <code>*</code> (or after <code>*args</code>) are keyword-only. <code>def pay(amount, /, *, method="cash")</code> forces calls like <code>pay(184, method="upi")</code>. Keyword-only parameters prevent swapped arguments and keep calls readable; positional-only parameters let a library rename a parameter without breaking callers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the LEGB rule.</summary><div class="qa-body">When a name is used, Python looks for it in the Local scope (the current function), then any Enclosing function scopes from the innermost outward, then the Global scope (the module), and finally Built-ins such as <code>len</code>. The first match wins, and if none is found Python raises NameError. Whether a name is local is decided when the function is compiled, based on whether it is assigned anywhere in the body.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does this raise <code>UnboundLocalError</code>? <code>x = 10</code>; <code>def show(): print(x); x = 5</code></summary><div class="qa-body">Because <code>x</code> is assigned somewhere in <code>show</code>, Python treats it as a local variable for the entire function. The <code>print(x)</code> then tries to read that local before it has a value. Fix it by renaming, passing <code>x</code> in as a parameter, or declaring <code>global x</code> if you really mean the module variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>global</code> and <code>nonlocal</code>?</summary><div class="qa-body"><code>global x</code> makes assignments inside the function rebind the module-level <code>x</code>. <code>nonlocal x</code> makes them rebind <code>x</code> in the nearest enclosing function, where it must already exist; this is what lets a closure update a counter. Neither is needed merely to read an outer variable or to mutate an outer object in place.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a closure? Give a practical use.</summary><div class="qa-body">A closure is a function that keeps access to variables from the scope where it was defined, even after that scope has finished. <code>make_discount(0.15)</code> returns <code>rule</code>, which still remembers <code>pct</code>, stored in <code>rule.__closure__</code>. Uses include function factories, counters without globals, callbacks that carry configuration, and decorators, where the wrapper closes over the original function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>fs = [lambda: i for i in range(3)]; print([f() for f in fs])</code></summary><div class="qa-body"><code>[2, 2, 2]</code>. Each lambda looks up <code>i</code> when it is called, not when it was created (late binding), and by then the loop has finished with <code>i</code> equal to 2. Fix it by binding the current value as a default, <code>lambda i=i: i</code>, or by using <code>functools.partial</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the limitations of <code>lambda</code> compared with <code>def</code>?</summary><div class="qa-body">A lambda's body is a single expression, so it cannot contain statements such as loops, <code>try</code> or ordinary assignments; it cannot have a docstring or annotations; and its name is <code>&lt;lambda&gt;</code>, which makes tracebacks less clear. It supports the same parameter kinds. Use it for short key functions and callbacks, and <code>def</code> for anything you would name, reuse or test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "functions are first-class objects" mean? What is a higher-order function?</summary><div class="qa-body">Functions are values: they can be bound to names, stored in lists and dicts, passed as arguments and returned from other functions. A higher-order function takes or returns functions; examples are <code>sorted(xs, key=...)</code>, <code>map</code>, <code>filter</code>, <code>functools.partial</code>, factories like <code>make_discount</code>, and decorators.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a decorator, and how does it relate to closures?</summary><div class="qa-body">A decorator is a function that takes a function and returns a replacement, applied with <code>@dec</code> above a <code>def</code>, which is shorthand for <code>f = dec(f)</code>. The replacement is usually a closure over the original function that accepts <code>*args, **kwargs</code>, adds behaviour such as logging, timing or caching, and forwards the call. A well-written decorator uses <code>functools.wraps</code> to keep the original's name and docstring.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you return multiple values from a function?</summary><div class="qa-body"><code>return a, b</code> returns a single tuple, which the caller can unpack: <code>share, left = split_bill(184, 3)</code> gives 61 and 1. For more than two or three values, return something with named fields, such as a namedtuple, a dataclass or a dict, so the caller does not have to remember positions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your recursive function raises <code>RecursionError</code> on deep input. What are your options?</summary><div class="qa-body">CPython limits recursion to about 1000 frames and does not optimise tail calls. The best fix is to rewrite the function iteratively, with a loop and, if needed, an explicit stack stored in a list. <code>sys.setrecursionlimit</code> is only a stopgap and can crash the interpreter. If the recursion repeats the same sub-problems, memoising with <code>@lru_cache</code> also helps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@functools.lru_cache</code> do, and when should you not use it?</summary><div class="qa-body">It memoises a function: results are stored in a dictionary keyed by the arguments, so repeated calls with the same arguments return instantly, which turns a naive recursive <code>fib(80)</code> from impossible into instant. The arguments must be hashable, so lists and dicts cannot be passed. Do not use it on functions with side effects or whose results depend on changing outside state, and set <code>maxsize</code> if the number of different arguments is large.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are type hints enforced at run time?</summary><div class="qa-body">No. <code>def double(x: int) -&gt; int</code> still returns "abab" for <code>double("ab")</code>. Hints are stored in <code>__annotations__</code> and used by static checkers such as mypy and pyright, by editors, and by libraries that choose to validate with them, such as Pydantic and FastAPI. Untrusted input must still be validated explicitly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>functools.partial</code> used for?</summary><div class="qa-body">It creates a new callable with some arguments already filled in: <code>gst12 = partial(with_tax, rate=0.12)</code>, then <code>gst12(100)</code> gives 112.0. It is useful when a library expects a function with fewer parameters than yours, for fixing settings before passing a function along, and as a safe alternative to lambdas built in a loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why prefer pure functions where possible?</summary><div class="qa-body">A pure function's result depends only on its arguments, and it changes nothing outside itself. That makes it easy to test, to reason about, to cache and to run in parallel. Functions that read or change globals, or mutate their arguments, create hidden connections where a bug appears far from its cause. Pass inputs in, return outputs, and keep printing, file access and other side effects at the edges of the program.</div></details>
</main>
`
});
