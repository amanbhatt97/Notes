// notes/python/py_control.js — Decisions & Loops
Object.assign(TOPIC_CONTENT, {
  "py_control": `<main>
<h1>Decisions &amp; Loops</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Decisions &amp; Loops</span></div>
  <p class="lead">Without control flow a program runs every line once, top to bottom, so it can compute one fixed answer but cannot apply a rule only when it holds or process a list of any length. <strong>Decisions</strong> (<code>if/elif/else</code>, the conditional expression, <code>match</code>) choose which lines run; <strong>loops</strong> (<code>while</code>, <code>for</code>) repeat them. This note covers both, plus <code>range</code>, <code>break</code>/<code>continue</code>, the loop <code>else</code> clause, <code>enumerate</code> and <code>zip</code>, nested loops and their n × m cost, the standard loop patterns and the built-ins that replace them, and the bugs loops cause in real code (mutating a list while iterating, off-by-one, float loop conditions). These are the building blocks of every data-cleaning script, training loop and request handler. Code here was run on Python 3.13.</p>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Decisions &amp; Loops</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Decisions</div>
        <ul>
          <li><b>if / elif / else</b>: first True branch runs, the rest are skipped</li>
          <li>Indentation (4 spaces) marks the block</li>
          <li>Tiers: check the strictest condition first (≥ 300 before ≥ 150)</li>
          <li>Conditions use truthiness: <code>if order:</code> = "not empty"</li>
          <li><b>Conditional expression</b>: <code>a if cond else b</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">while</div>
        <ul>
          <li>Repeats while the condition is True, checked before every round</li>
          <li>n rounds = n + 1 condition checks</li>
          <li><code>while queue:</code> until empty</li>
          <li>Walrus: <code>while (n := len(q)) &gt; 1</code></li>
          <li>⚠ forget to change the condition → infinite loop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">for</div>
        <ul>
          <li>One round per item of an <b>iterable</b>: list, str, dict (keys), range, file</li>
          <li>Unpack: <code>for item, qty, price in order</code></li>
          <li><code>range(start, stop, step)</code>: stop NOT included</li>
          <li>Loop variable survives the loop (no block scope)</li>
          <li><code>enumerate(x, start=1)</code>, <code>zip(a, b)</code> (stops at shortest)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Jumping</div>
        <ul>
          <li><b>break</b>: leave the (innermost) loop now</li>
          <li><b>continue</b>: skip to the next round</li>
          <li><b>loop-else</b>: runs only if no break; read it as "nobreak"</li>
          <li>Use: search without a <code>found</code> flag</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Nested</b>: inner body runs n × m times</li>
          <li><b>Accumulate</b> (sum), <b>count</b>, <b>find</b> (+ break), <b>filter</b> (new list), <b>best-so-far</b></li>
          <li>Built-ins: <code>sum</code>, <code>any</code>, <code>all</code>, <code>max(key=)</code>, comprehensions</li>
          <li><b>match/case</b>: literals, <code>|</code>, shapes, types, guards, <code>*rest</code>, <code>_</code></li>
          <li>⚠ <code>case NAME:</code> captures, never compares</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>Removing from a list while looping over it skips items</li>
          <li>Off-by-one: <code>range(1, 10)</code> misses 10</li>
          <li><code>while x != 1.0</code> with float steps never stops</li>
          <li>Loop variables keep their last value after the loop</li>
          <li><code>break</code> leaves only the inner loop</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-if"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">if, elif and else</span><span class="rm-sub">branches, order of tiers, truthiness</span></div></div>
      <div class="rm-item rm-done" data-target="pc-ternary"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Conditional Expression</span><span class="rm-sub">x if cond else y</span></div></div>
      <div class="rm-item rm-done" data-target="pc-while"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">while Loops</span><span class="rm-sub">condition loops, walrus :=</span></div></div>
      <div class="rm-item rm-done" data-target="pc-for"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">for Loops and range</span><span class="rm-sub">iterables, unpacking, range rules</span></div></div>
      <div class="rm-item rm-done" data-target="pc-break"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">break, continue and Loop else</span><span class="rm-sub">early exit, skip, no-break clause</span></div></div>
      <div class="rm-item rm-done" data-target="pc-enum"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">enumerate and zip</span><span class="rm-sub">positions, parallel lists, strict</span></div></div>
      <div class="rm-item rm-done" data-target="pc-nested"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Nested Loops</span><span class="rm-sub">inner loop per outer round, n × m</span></div></div>
      <div class="rm-item rm-done" data-target="pc-patterns"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Loop Patterns and Built-ins</span><span class="rm-sub">sum, any, max(key=), filters</span></div></div>
      <div class="rm-item rm-done" data-target="pc-match"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Structural Pattern Matching</span><span class="rm-sub">match/case, guards, capture trap</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Loop Bugs</span><span class="rm-sub">mutation, off-by-one, float loops</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Condensed notes for revision</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Branches, loops, iteration internals</span></div></div>
    </div>
  </div>

  <h2 id="pc-if"><span class="num">01</span>if, elif and else</h2>
  <p>A rule such as "10% off when the subtotal is at least ₹150" needs some lines to run only when a condition holds. Faking it with arithmetic (<code>subtotal * 0.10 * eligible</code>) breaks as soon as there are three cases; <code>if</code> is the real tool.</p>
  <h3>if: run a block only when a condition is True</h3>
  <p>An <code>if</code> statement has a <strong>condition</strong> (any expression; Python asks for its truthiness) and a <strong>block</strong>: the lines indented under it. If the condition is True the block runs; if not, Python skips it and continues after it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A railway points switch: the train (Python) arrives at the switch, the signal (the condition) is checked once, and the train goes down one track or the other. It never runs down both.</p></div>
  <div class="fx" data-lang="py">subtotal = 195
discount = 0
if subtotal &gt;= 150:                  # the condition: a bool
    discount = subtotal * 0.10       # indented: runs only if True
    print("10% discount applied")
print("discount:", discount)         # not indented: always runs</div>
  <div class="fx" data-lang="text">10% discount applied
discount: 19.5</div>
  <p>Read the shape: the line <code>if subtotal &gt;= 150:</code> ends with a colon, and the two lines below are indented by 4 spaces. That indentation <em>is</em> the block; Python has no braces. The last line is back at the left edge, so it is after the <code>if</code> and always runs.</p>
  <h3>else: the other track</h3>
  <p><code>else:</code> gives a block that runs exactly when the condition was False. With a subtotal of 70:</p>
  <div class="fx" data-lang="py">subtotal = 70
if subtotal &gt;= 150:
    discount = subtotal * 0.10
else:
    discount = 0                     # runs only if the condition was False
print("discount:", discount)</div>
  <div class="fx" data-lang="text">discount: 0</div>
  <h3>elif: more than two cases</h3>
  <p>Suppose a catering rule is added: ₹300 or more gets 15%. Now there are three cases. <code>elif</code> ("else if") adds another condition. Python checks the conditions <strong>top to bottom</strong>, runs the block of the <strong>first</strong> True one, and skips all the rest.</p>
  <div class="fx" data-lang="py">subtotal = 195
if subtotal &gt;= 300:
    rate = 0.15
elif subtotal &gt;= 150:
    rate = 0.10
else:
    rate = 0.0
print("rate:", rate, " discount:", subtotal * rate)</div>
  <div class="fx" data-lang="text">rate: 0.1  discount: 19.5</div>
  <table class="tbl"><caption>Trace: which branch runs for each subtotal</caption>
    <tr><th>subtotal</th><th><code>&gt;= 300</code>?</th><th><code>&gt;= 150</code>?</th><th>Branch</th><th>rate</th><th>discount</th></tr>
    <tr><td>50</td><td>False</td><td>False</td><td>else</td><td>0.0</td><td>0</td></tr>
    <tr><td>70</td><td>False</td><td>False</td><td>else</td><td>0.0</td><td>0</td></tr>
    <tr><td>195</td><td>False</td><td>True</td><td>elif</td><td>0.10</td><td>19.5</td></tr>
    <tr><td>320</td><td>True</td><td>(not checked)</td><td>if</td><td>0.15</td><td>48.0</td></tr>
  </table>
  <p>Because only the first True branch runs, the <em>order</em> of conditions is part of the logic. Put the looser check first and the stricter one can never be reached:</p>
  <div class="fx" data-lang="py">subtotal = 320                       # a big catering order
if subtotal &gt;= 150:                  # checked first: already True...
    rate = 0.10
elif subtotal &gt;= 300:                # ...so this is never even looked at
    rate = 0.15
else:
    rate = 0.0
print("rate:", rate)                 # should have been 0.15</div>
  <div class="fx" data-lang="text">rate: 0.1</div>
  <p>320 ≥ 150 is True, so the first branch wins and the 15% branch is dead code. Rule of thumb for tiers: test the strictest condition first (≥ 300, then ≥ 150), or write each range in full (<code>150 &lt;= subtotal &lt; 300</code>).</p>
  <h3>Nested decisions</h3>
  <p>A block can contain another <code>if</code>: first "was enough paid?", and only then "exactly, or is change due?".</p>
  <div class="fx" data-lang="py">total, paid = 184, 200
if paid &gt;= total:
    if paid == total:
        print("exact amount, thank you")
    else:
        print("change:", paid - total)
else:
    print("short by", total - paid)</div>
  <div class="fx" data-lang="text">change: 16</div>
  <p>Nesting is right when the inner question only makes sense after the outer answer. When it is just "both must be true", one <code>if a and b:</code> is flatter and easier to read. More than two or three levels deep is a sign the code should be split into <a class="xref" data-note="py_functions">functions</a>.</p>
  <h3>Conditions use truthiness</h3>
  <p>The condition does not have to be a comparison. <code>if</code> asks for <code>bool(condition)</code>, so the truthiness rules apply: empty or zero is False (see <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>).</p>
  <div class="fx" data-lang="py">order = []
if order:                            # an empty list is falsy
    print("send to kitchen")
else:
    print("nothing ordered yet")
name = ""
if not name:
    name = "Guest"
print(name)</div>
  <div class="fx" data-lang="text">nothing ordered yet
Guest</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>if C1: B1 elif C2: B2 … else: Bn</code> evaluates C1, C2, … in order, executes the block of the <strong>first</strong> condition whose truthiness is True, and skips all others; <code>else</code> runs if none was True. Blocks are defined by indentation (PEP 8: 4 spaces). <code>elif</code> and <code>else</code> are optional.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Order matters: the first True branch wins, so a loose condition placed first hides stricter ones. And mixing tabs and spaces, or indenting one line by 3 spaces, gives an <code>IndentationError</code> or, worse, puts a line in the wrong block. Let your editor insert 4 spaces.</p></div>

  <h2 id="pc-ternary"><span class="num">02</span>Conditional Expression</h2>
  <p><code>if/else</code> is a statement: it runs blocks but produces no value. When the only job is to pick one of two values, the conditional expression does it inline.</p>
  <p>The <strong>conditional expression</strong> (often called the ternary operator) reads like English: <code>value_if_true if condition else value_if_false</code>. It is an expression, so it gives a value you can assign, print or pass along.</p>
  <div class="fx" data-lang="py">subtotal = 195
rate = 0.10 if subtotal &gt;= 150 else 0.0
size = "big order" if subtotal &gt;= 300 else "regular order"
print(rate, size)
qty = 0
print(qty if qty is not None else 1)   # keeps a real 0, unlike qty or 1</div>
  <div class="fx" data-lang="text">0.1 regular order
0</div>
  <p>The last line avoids the <code>or</code>-default trap: <code>qty or 1</code> would turn a genuine 0 into 1, because 0 is falsy. <code>qty if qty is not None else 1</code> only replaces a missing value.</p>
  <table class="tbl"><caption>Statement vs expression</caption>
    <tr><th></th><th>if / else statement</th><th>conditional expression</th></tr>
    <tr><td>Produces a value?</td><td>No, runs blocks</td><td>Yes</td></tr>
    <tr><td>Branches</td><td>any number (elif), many lines each</td><td>exactly two, one expression each</td></tr>
    <tr><td>Use for</td><td>actions, several lines, 3+ cases</td><td>picking one of two values</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>X if C else Y</code> evaluates C; if truthy it evaluates and returns X, otherwise Y. Only one of X, Y is evaluated.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Nesting them (<code>a if c1 else b if c2 else c</code>) is legal but hard to read; with three cases, use <code>if/elif/else</code>. Also remember the order: the condition sits in the <em>middle</em>, not first as in C's <code>c ? a : b</code>.</p></div>

  <h2 id="pc-while"><span class="num">03</span>while Loops</h2>
  <p>Use <code>while</code> when the number of rounds is not known in advance and depends on a condition: until money runs out, a queue empties, input ends or an algorithm converges.</p>
  <p>A <code>while</code> loop is an <code>if</code> that goes back to the top: check the condition; if True, run the block, then check again; when the condition is False, continue after the loop. Each pass through the block is called an <strong>iteration</strong> (a round).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Eating from a plate of samosas: "while there is a samosa on the plate, eat one". You look at the plate before every bite. Something in each round (eating) must move you toward stopping, or you would sit there forever.</p></div>
  <table class="tbl"><caption>Trace: while wallet &gt;= 30 (chai costs 30)</caption>
    <tr><th>Round</th><th>wallet before</th><th><code>wallet &gt;= 30</code>?</th><th>Action</th><th>wallet after</th><th>cups</th></tr>
    <tr><td>1</td><td>100</td><td>True</td><td>buy</td><td>70</td><td>1</td></tr>
    <tr><td>2</td><td>70</td><td>True</td><td>buy</td><td>40</td><td>2</td></tr>
    <tr><td>3</td><td>40</td><td>True</td><td>buy</td><td>10</td><td>3</td></tr>
    <tr><td>—</td><td>10</td><td><b>False</b></td><td>leave the loop</td><td>10</td><td>3</td></tr>
  </table>
  <div class="fx" data-lang="py">wallet = 100                         # chai costs 30
cups = 0
while wallet &gt;= 30:                  # checked before EVERY round
    wallet -= 30
    cups += 1
    print("round", cups, "-&gt; wallet", wallet)
print("cups:", cups, " left:", wallet)</div>
  <div class="fx" data-lang="text">round 1 -&gt; wallet 70
round 2 -&gt; wallet 40
round 3 -&gt; wallet 10
cups: 3  left: 10</div>
  <p>The condition was checked four times and the block ran three times. That is always the shape: n rounds need n + 1 checks. The block changes <code>wallet</code>, which is what eventually makes the condition False.</p>
  <h3>Looping until a collection is empty</h3>
  <p>A non-empty list is truthy. So <code>while waiting:</code> means "while anyone is still in the queue". <code>.pop(0)</code> removes and returns the first item, which both serves the customer and moves the loop toward its end.</p>
  <div class="fx" data-lang="py">waiting = ["Asha", "Ben", "Chen"]
while waiting:                       # a non-empty list is truthy
    customer = waiting.pop(0)        # take the first one out
    print("serving", customer, "| still waiting:", waiting)
print("queue empty")</div>
  <div class="fx" data-lang="text">serving Asha | still waiting: ['Ben', 'Chen']
serving Ben | still waiting: ['Chen']
serving Chen | still waiting: []
queue empty</div>
  <h3>The walrus operator in a loop condition</h3>
  <p>Sometimes the condition computes a value you also want inside the block. <code>:=</code> (the "walrus") assigns and tests in one go: <code>(n := len(waiting)) &gt; 1</code> stores the length in <code>n</code> and compares it with 1.</p>
  <div class="fx" data-lang="py">waiting = ["Asha", "Ben", "Chen"]
while (n := len(waiting)) &gt; 1:       # compute n, keep it, and test it
    print(n, "waiting; serving", waiting.pop(0))
print("last one:", waiting)</div>
  <div class="fx" data-lang="text">3 waiting; serving Asha
2 waiting; serving Ben
last one: ['Chen']</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>while C: B</code> evaluates C; if truthy, executes B and repeats; if falsy, continues after the loop. The block must eventually make C falsy (or exit with <code>break</code>), otherwise the loop is <strong>infinite</strong>. <code>name := expr</code> (assignment expression) binds name and returns the value.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Forget to update the variable in the condition (e.g. drop <code>wallet -= 30</code>) and the loop never ends; stop it with Ctrl+C. Also, <code>while</code> is the wrong tool for "once per item of a list": index counters are easy to get wrong. That is what <code>for</code> is for.</p></div>

  <h2 id="pc-for"><span class="num">04</span>for Loops and range</h2>
  <p>Walking a collection with an index counter in a <code>while</code> loop invites off-by-one errors. <code>for</code> hands you each item in turn and stops by itself when the items run out.</p>
  <p>A <code>for</code> loop takes the items of a collection one at a time, binds a name to the current item, and runs the block. When the items run out, the loop ends. You never manage a counter.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cashier scanning a basket: pick up the next item, scan it, add it to the total, repeat until the basket is empty. The cashier never asks "which number item is this?".</p></div>
  <h3>Iterating and Unpacking Tuples</h3>
  <p>An order is a list of <code>(item, qty, price)</code> tuples. In <code>for item, qty, price in order:</code> each line is a 3-tuple, and the three names on the left take its three parts. This is the same <strong>unpacking</strong> as <code>chai, samosa = 30, 15</code>.</p>
  <table class="tbl"><caption>Trace: the for loop over the order</caption>
    <tr><th>Round</th><th>item</th><th>qty</th><th>price</th><th>amount = qty × price</th><th>subtotal after</th></tr>
    <tr><td>start</td><td>—</td><td>—</td><td>—</td><td>—</td><td>0</td></tr>
    <tr><td>1</td><td>masala chai</td><td>2</td><td>30</td><td>60</td><td>60</td></tr>
    <tr><td>2</td><td>samosa</td><td>3</td><td>15</td><td>45</td><td>105</td></tr>
    <tr><td>3</td><td>cold coffee</td><td>1</td><td>90</td><td>90</td><td>195</td></tr>
  </table>
  <div class="fx" data-lang="py">order = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
subtotal = 0
for item, qty, price in order:       # one round per line of the order
    amount = qty * price
    subtotal += amount
    print(f"{item:12} {qty} x {price:2} = {amount:3}   subtotal so far {subtotal}")
print("subtotal:", subtotal)</div>
  <div class="fx" data-lang="text">masala chai  2 x 30 =  60   subtotal so far 60
samosa       3 x 15 =  45   subtotal so far 105
cold coffee  1 x 90 =  90   subtotal so far 195
subtotal: 195</div>
  <p>The <code>print</code> uses an <strong>f-string</strong>: text starting with <code>f"</code>, where <code>{name}</code> is replaced by the value and <code>{item:12}</code> pads it to 12 characters so the columns line up (full formatting rules in <a class="xref" data-note="py_strings">Strings</a>). The same three lines of loop body would bill an order of 3 lines or 300.</p>
  <h3>What can a for loop walk over?</h3>
  <p>Anything <strong>iterable</strong>: a list, a tuple, a string (one character per round), a dict (its keys; <code>.items()</code> gives key-value pairs), a set, a <code>range</code>, a file (one line per round). How Python asks an object for "the next item" is the subject of <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>.</p>
  <div class="fx" data-lang="py">for ch in "chai":                    # a string: one character per round
    print(ch, end=" ")
print()
menu = {"masala chai": 30, "samosa": 15, "vada pav": 20, "cold coffee": 90}
for name in menu:                    # a dict: its keys
    print(name, end=" | ")
print()
for name, price in menu.items():     # keys and values together
    print(f"{name}={price}", end=" ")
print()</div>
  <div class="fx" data-lang="text">c h a i 
masala chai | samosa | vada pav | cold coffee | 
masala chai=30 samosa=15 vada pav=20 cold coffee=90 </div>
  <p><code>print(..., end=" ")</code> prints a space instead of a new line, so a whole loop's output fits on one line; the bare <code>print()</code> then ends the line.</p>
  <h3>range: numbers to loop over</h3>
  <p><code>range(start, stop, step)</code> produces the whole numbers from <code>start</code> up to but <strong>not including</strong> <code>stop</code>. With one argument, start is 0. It does not build a list in memory; it produces each number when asked.</p>
  <div class="fx" data-lang="py">print(list(range(5)))                # 0,1,2,3,4: stop is NOT included
print(list(range(1, 4)))             # start at 1, stop before 4
print(list(range(0, 10, 3)))         # step 3
print(list(range(5, 0, -1)))         # counting down
print(len(range(1, 11)))             # tables 1..10 -&gt; 10 numbers
for table in range(1, 4):
    print("table", table, end="; ")
print()</div>
  <div class="fx" data-lang="text">[0, 1, 2, 3, 4]
[1, 2, 3]
[0, 3, 6, 9]
[5, 4, 3, 2, 1]
10
table 1; table 2; table 3; </div>
  <table class="tbl"><caption>Reading range by hand</caption>
    <tr><th>Call</th><th>Numbers</th><th>How many</th><th>Rule</th></tr>
    <tr><td><code>range(5)</code></td><td>0 1 2 3 4</td><td>5</td><td>stop − start</td></tr>
    <tr><td><code>range(1, 4)</code></td><td>1 2 3</td><td>3</td><td>4 − 1</td></tr>
    <tr><td><code>range(0, 10, 3)</code></td><td>0 3 6 9</td><td>4</td><td>next would be 12 ≥ 10</td></tr>
    <tr><td><code>range(5, 0, -1)</code></td><td>5 4 3 2 1</td><td>5</td><td>stops before 0</td></tr>
  </table>
  <h3>Decisions Inside a Loop</h3>
  <p>A loop over several subtotals with a conditional expression inside applies the discount rule to each one.</p>
  <div class="fx" data-lang="py">for name, subtotal in [("Asha", 195), ("Ben", 70), ("Chen", 50)]:
    rate = 0.10 if subtotal &gt;= 150 else 0.0
    after = subtotal - subtotal * rate
    tax = after * 0.05
    print(name, subtotal, after, round(tax, 3), round(after + tax))</div>
  <div class="fx" data-lang="text">Asha 195 175.5 8.775 184
Ben 70 70.0 3.5 74
Chen 50 50.0 2.5 52</div>
  <p>52.5 → 52 is Python's half-to-even rounding (see <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>for target in iterable: B</code> takes each item of the iterable in turn, binds <code>target</code> to it (unpacking if the target is a tuple of names), and executes B. <code>range(start=0, stop, step=1)</code> yields start, start+step, … while below stop (above stop for negative steps); its length is ⌈(stop − start)/step⌉ when positive.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>range(1, 10)</code> stops at 9. Writing <code>for i in range(len(order))</code> then <code>order[i]</code> works but is the clumsy, error-prone way; loop over the items directly (and use <code>enumerate</code> when you need the position).</p></div>

  <h2 id="pc-break"><span class="num">05</span>break, continue and Loop else</h2>
  <p>A <code>for</code> loop visits every item by default. <code>break</code> stops early once the answer is known, <code>continue</code> skips one item, and the loop's <code>else</code> clause handles "the search found nothing".</p>
  <h3>break: leave the loop now</h3>
  <p>Find the first item that costs more than ₹50. Once found, checking the rest is wasted work.</p>
  <div class="fx" data-lang="py">order = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
for item, qty, price in order:
    print("checking", item)
    if price &gt; 50:
        print("first item over 50:", item)
        break                        # leave the loop at once
print("after the loop")</div>
  <div class="fx" data-lang="text">checking masala chai
checking samosa
checking cold coffee
first item over 50: cold coffee
after the loop</div>
  <p>The loop checked three items and broke at the third. Had cold coffee been first, it would have checked only one. "after the loop" prints either way: <code>break</code> jumps to the first line after the loop.</p>
  <h3>continue: skip to the next round</h3>
  <p>Skip lines whose item is out of stock:</p>
  <div class="fx" data-lang="py">out_of_stock = {"samosa"}            # a set of names (fast 'in')
subtotal = 0
for item, qty, price in order:
    if item in out_of_stock:
        print("skip", item, "(out of stock)")
        continue                     # jump to the next round
    subtotal += qty * price
    print("billed", item)
print("subtotal:", subtotal)</div>
  <div class="fx" data-lang="text">billed masala chai
skip samosa (out of stock)
billed cold coffee
subtotal: 150</div>
  <p><code>continue</code> abandons the rest of the current round (the samosa is not added) and goes straight to the next item. The subtotal is 60 + 90 = 150. Note <code>out_of_stock</code> is a <strong>set</strong> (curly braces, no duplicates, fast <code>in</code>; see <a class="xref" data-note="py_ds">Data Structures</a>).</p>
  <h3>The Loop else Clause</h3>
  <p>Python has one rare extra: a <code>for</code> or <code>while</code> loop can have an <code>else:</code> block. It runs only when the loop finished <strong>without</strong> hitting <code>break</code>. That is exactly "the search found nothing", without needing a <code>found = False</code> flag.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>You search your school bag for a pen. Found it → stop searching (break). Checked every pocket and nothing → "else: borrow one".</p></div>
  <figure class="viz"><svg viewBox="0 0 520 150" width="520">
    <defs><marker id="pc-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="55" width="124" height="36" rx="6" class="fb sb"/><text x="20" y="77">for x in items</text>
    <rect x="190" y="10" width="130" height="36" rx="6" class="fr sr"/><text x="204" y="32">hit break</text>
    <rect x="190" y="100" width="130" height="36" rx="6" class="fg sg"/><text x="200" y="122">ran to the end</text>
    <rect x="390" y="10" width="120" height="36" rx="6" class="fs" stroke="currentColor"/><text x="402" y="32">skip else</text>
    <rect x="390" y="100" width="120" height="36" rx="6" class="fg sg"/><text x="402" y="122">run else:</text>
    <line x1="134" y1="68" x2="188" y2="32" stroke="currentColor" marker-end="url(#pc-ah3)"/>
    <line x1="134" y1="80" x2="188" y2="116" stroke="currentColor" marker-end="url(#pc-ah3)"/>
    <line x1="320" y1="28" x2="388" y2="28" stroke="currentColor" marker-end="url(#pc-ah3)"/>
    <line x1="320" y1="118" x2="388" y2="118" stroke="currentColor" marker-end="url(#pc-ah3)"/>
  </svg><figcaption>The loop's else means "no break happened". Read it as "nobreak".</figcaption></figure>
  <table class="tbl"><caption>Trace: searching the order for "samosa", then for "vada pav"</caption>
    <tr><th>Search</th><th>Round 1 (masala chai)</th><th>Round 2 (samosa)</th><th>Round 3 (cold coffee)</th><th>break?</th><th>else runs?</th></tr>
    <tr><td>samosa</td><td>no match</td><td><b>match → print, break</b></td><td>(never reached)</td><td>yes</td><td>no</td></tr>
    <tr><td>vada pav</td><td>no match</td><td>no match</td><td>no match</td><td>no</td><td><b>yes → "not in this order"</b></td></tr>
  </table>
  <div class="fx" data-lang="py">for target in ["samosa", "vada pav"]:     # try two searches
    for item, qty, price in order:
        if item == target:
            print(target, "found, qty", qty)
            break
    else:                                 # runs only if NO break happened
        print(target, "not in this order")</div>
  <div class="fx" data-lang="text">samosa found, qty 3
vada pav not in this order</div>
  <p>The outer <code>for target in …</code> just runs the search twice (a nested loop). The <code>else</code> is lined up with the inner <code>for</code>, not with the <code>if</code>: it belongs to the loop.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>break</code> exits the innermost enclosing loop immediately. <code>continue</code> ends the current iteration and starts the next. A loop's <code>else</code> block runs when the loop ends normally (iterable exhausted, or while-condition False), including when there were zero iterations; it is skipped if the loop exited via <code>break</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>The loop's <code>else</code> does not mean "if the loop didn't run" and is not paired with the <code>if</code> inside. Indent it level with <code>for</code>. If a reader may be confused, a comment <code># no break</code> helps.</p></div>

  <h2 id="pc-enum"><span class="num">06</span>enumerate and zip</h2>
  <p><code>for</code> gives items but not positions, and one loop variable cannot walk several parallel lists. <code>enumerate</code> and <code>zip</code> solve both without index arithmetic.</p>
  <h3>enumerate: item plus its position</h3>
  <p><code>enumerate(order, start=1)</code> gives pairs (position, item). Unpack both in the loop header. Because each item is itself a tuple, the names for it go in brackets.</p>
  <div class="fx" data-lang="py">for i, (item, qty, price) in enumerate(order, start=1):
    print(f"{i}. {item:12} {qty * price:4}")</div>
  <div class="fx" data-lang="text">1. masala chai    60
2. samosa         45
3. cold coffee    90</div>
  <p>The beginner version, with <code>range(len(...))</code> and indexing, produces the same thing in a harder-to-read way:</p>
  <div class="fx" data-lang="py">for i in range(len(order)):          # works, but clumsy
    print(i, order[i][0])</div>
  <div class="fx" data-lang="text">0 masala chai
1 samosa
2 cold coffee</div>
  <h3>zip: walk several lists side by side</h3>
  <p><code>zip(a, b, c)</code> gives tuples (a[0], b[0], c[0]), (a[1], b[1], c[1]), … like the teeth of a zip meeting one pair at a time.</p>
  <div class="fx" data-lang="py">items = ["masala chai", "samosa", "cold coffee"]
qtys = [2, 3, 1]
prices = [30, 15, 90]
for item, q, p in zip(items, qtys, prices):   # walk three lists side by side
    print(item, q * p)
print(list(zip(items, [2, 3])))               # stops at the SHORTEST list
try:
    list(zip(items, [2, 3], strict=True))     # 3.10+: insist on equal lengths
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">masala chai 60
samosa 45
cold coffee 90
[('masala chai', 2), ('samosa', 3)]
ValueError: zip() argument 2 is shorter than argument 1</div>
  <p>The second line is the trap: when the lists have different lengths, <code>zip</code> silently stops at the shortest one, and the cold coffee line vanishes. Since Python 3.10, <code>strict=True</code> turns that silent loss into an error.</p>
  <table class="tbl"><caption>Trace: zip(items, qtys, prices)</caption>
    <tr><th>Round</th><th>item</th><th>q</th><th>p</th><th>q × p</th></tr>
    <tr><td>1</td><td>masala chai</td><td>2</td><td>30</td><td>60</td></tr>
    <tr><td>2</td><td>samosa</td><td>3</td><td>15</td><td>45</td></tr>
    <tr><td>3</td><td>cold coffee</td><td>1</td><td>90</td><td>90</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>enumerate(iterable, start=0)</code> yields <code>(start + i, item_i)</code>. <code>zip(*iterables, strict=False)</code> yields tuples of the i-th items and stops when the shortest input is exhausted; with <code>strict=True</code> it raises <code>ValueError</code> on unequal lengths.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>zip</code> drops the extra items of longer lists without a word. When lengths must match, use <code>strict=True</code>. And <code>enumerate</code> counts from 0 unless you pass <code>start=1</code>.</p></div>

  <h2 id="pc-nested"><span class="num">07</span>Nested Loops</h2>
  <p>A <strong>nested loop</strong> is a loop whose block contains another loop. For every single round of the outer loop, the inner loop runs <em>completely</em>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A clock: the minute hand goes all the way round (inner loop) for every single step of the hour hand (outer loop).</p></div>
  <div class="fx" data-lang="py">tables = [
    ("Asha", [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]),
    ("Ben",  [("masala chai", 1, 30), ("vada pav", 2, 20)]),
    ("Chen", [("samosa", 2, 15), ("vada pav", 1, 20)]),
]
day_total = 0
for name, lines in tables:                    # outer loop: one round per table
    subtotal = 0
    for item, qty, price in lines:            # inner loop: every line of THIS table
        subtotal += qty * price
    rate = 0.10 if subtotal &gt;= 150 else 0.0
    after = subtotal - subtotal * rate
    total = round(after + after * 0.05)
    day_total += total
    print(f"{name:5} subtotal {subtotal:3}  total {total}")
print("day total:", day_total)</div>
  <div class="fx" data-lang="text">Asha  subtotal 195  total 184
Ben   subtotal  70  total 74
Chen  subtotal  50  total 52
day total: 310</div>
  <table class="tbl"><caption>Trace: outer round = one order, inner rounds = its lines</caption>
    <tr><th>Outer round</th><th>Inner rounds (qty × price, subtotal)</th><th>subtotal</th><th>rate</th><th>total</th><th>day_total</th></tr>
    <tr><td>Asha</td><td>60 → 60; 45 → 105; 90 → 195</td><td>195</td><td>0.10</td><td>184</td><td>184</td></tr>
    <tr><td>Ben</td><td>30 → 30; 40 → 70</td><td>70</td><td>0.0</td><td>74</td><td>258</td></tr>
    <tr><td>Chen</td><td>30 → 30; 20 → 50</td><td>50</td><td>0.0</td><td>52</td><td>310</td></tr>
  </table>
  <p>Notice where each line sits. <code>subtotal = 0</code> is <em>inside</em> the outer loop but <em>before</em> the inner one, so it restarts for every table. <code>day_total = 0</code> is before both loops, so it keeps growing. Put <code>subtotal = 0</code> before the outer loop and each total would include every earlier table's lines.</p>
  <h3>break leaves only one loop</h3>
  <p>Which orders contain vada pav? <code>break</code> stops the inner search as soon as one is found, but the outer loop carries on with the next table.</p>
  <div class="fx" data-lang="py">for name, lines in tables:
    for item, qty, price in lines:
        if item == "vada pav":
            print(name, "ordered vada pav")
            break                             # leaves only the INNER loop
    print("done with", name)</div>
  <div class="fx" data-lang="text">done with Asha
Ben ordered vada pav
done with Ben
Chen ordered vada pav
done with Chen</div>
  <h3>Counting the work</h3>
  <p>Every combo of one drink and one snack: 2 drinks × 2 snacks = 4 rounds of the inner block. In general an outer loop of n items around an inner loop of m items runs the inner block n × m times. Two nested loops over the same 10,000 customers is 100 million rounds; that is why "avoid nested loops over big data" is common advice (<a class="xref" data-note="py_ds">Data Structures</a> shows how a dict or set removes the inner loop).</p>
  <div class="fx" data-lang="py">drinks = ["masala chai", "cold coffee"]
snacks = ["samosa", "vada pav"]
combos = 0
for d in drinks:
    for s in snacks:
        combos += 1
        print(combos, d, "+", s)
print(len(drinks), "x", len(snacks), "=", combos, "combos")</div>
  <div class="fx" data-lang="text">1 masala chai + samosa
2 masala chai + vada pav
3 cold coffee + samosa
4 cold coffee + vada pav
2 x 2 = 4 combos</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>In a <strong>nested loop</strong> the inner loop executes fully for each iteration of the outer loop, so the inner body runs (outer length) × (inner length) times. <code>break</code> and <code>continue</code> act on the innermost loop that contains them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Resetting an accumulator in the wrong place (outside the outer loop) leaks one table's total into the next. And <code>break</code> in the inner loop does not stop the outer loop; to stop both, use a flag, or put the loops in a function and <code>return</code>.</p></div>

  <h2 id="pc-patterns"><span class="num">08</span>Loop Patterns and Built-ins</h2>
  <p>Almost every loop over a collection is one of five patterns. Each has the same skeleton: <strong>set up</strong> a result before the loop, <strong>update</strong> it inside, <strong>use</strong> it after. All five on one order:</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Question</th><th>Set up</th><th>Update in the loop</th><th>Result</th></tr>
    <tr><td>Accumulate</td><td>what is the total?</td><td><code>subtotal = 0</code></td><td><code>subtotal += qty * price</code></td><td>195</td></tr>
    <tr><td>Count</td><td>how many satisfy a rule?</td><td><code>multi = 0</code></td><td><code>if qty &gt;= 2: multi += 1</code></td><td>2 (chai, samosa)</td></tr>
    <tr><td>Find</td><td>which is the first that…?</td><td><code>first_drink = None</code></td><td><code>if …: first_drink = item; break</code></td><td>masala chai</td></tr>
    <tr><td>Filter</td><td>which ones satisfy a rule?</td><td><code>cheap = []</code></td><td><code>if price &lt; 25: cheap.append(item)</code></td><td>['samosa']</td></tr>
    <tr><td>Best-so-far</td><td>which is the biggest?</td><td><code>best = None, 0</code></td><td><code>if amount &gt; best_amount: replace</code></td><td>cold coffee, 90</td></tr>
  </table>
  <div class="fx" data-lang="py">order = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
# 1. accumulate: add up as you go
subtotal = 0
for item, qty, price in order:
    subtotal += qty * price
# 2. count: how many lines have 2 or more pieces?
multi = 0
for item, qty, price in order:
    if qty &gt;= 2:
        multi += 1
# 3. find: the first line that is a drink
first_drink = None
for item, qty, price in order:
    if item in {"masala chai", "cold coffee"}:
        first_drink = item
        break
# 4. filter: keep only the cheap lines (price under 25)
cheap = []
for item, qty, price in order:
    if price &lt; 25:
        cheap.append(item)
# 5. best-so-far: the most expensive line
best_item, best_amount = None, 0
for item, qty, price in order:
    if qty * price &gt; best_amount:
        best_item, best_amount = item, qty * price
print(subtotal, multi, first_drink, cheap, best_item, best_amount)</div>
  <div class="fx" data-lang="text">195 2 masala chai ['samosa'] cold coffee 90</div>
  <p>Because these shapes are so common, Python has built-ins that do them in one line. They are also faster, because the looping happens in C. (Generator expressions, comprehensions and <code>lambda</code> are covered in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> and <a class="xref" data-note="py_functions">Functions</a>.)</p>
  <div class="fx" data-lang="py">print(sum(qty * price for item, qty, price in order))
print(sum(1 for item, qty, price in order if qty &gt;= 2))
print(any(price &gt; 50 for item, qty, price in order))
print([item for item, qty, price in order if price &lt; 25])
print(max(order, key=lambda line: line[1] * line[2]))</div>
  <div class="fx" data-lang="text">195
2
True
['samosa']
('cold coffee', 1, 90)</div>
  <table class="tbl"><caption>Pattern → built-in</caption>
    <tr><th>Pattern</th><th>Built-in</th><th>Here</th></tr>
    <tr><td>Accumulate</td><td><code>sum(...)</code></td><td>195</td></tr>
    <tr><td>Count</td><td><code>sum(1 for … if …)</code></td><td>2</td></tr>
    <tr><td>Find (any?)</td><td><code>any(...)</code> / <code>all(...)</code> / <code>next(...)</code></td><td>True</td></tr>
    <tr><td>Filter</td><td><code>[x for x in … if …]</code></td><td>['samosa']</td></tr>
    <tr><td>Best-so-far</td><td><code>max(..., key=...)</code> / <code>min</code></td><td>('cold coffee', 1, 90)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>loop pattern</strong> is a reusable loop shape: initialise a result, update it per item, use it after the loop. The five core patterns are accumulate, count, find (with early exit), filter (build a new collection) and best-so-far (running max/min).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Initialise in the right place and with the right "empty" value: 0 for sums and counts, <code>[]</code> for filters, <code>None</code> for "not found yet". Starting best-so-far at 0 fails when all values are negative; start from the first item or use <code>max()</code>.</p></div>

  <h2 id="pc-match"><span class="num">09</span>Structural Pattern Matching: match / case</h2>
  <p>When inputs differ in <em>shape</em> (a word, a 3-tuple, a dict with a given key), an if/elif chain that checks types and unpacks by hand gets long. <strong>match/case</strong> (Python 3.10+) is a structural <code>if/elif</code>. It checks the <em>shape</em> of data, not only its value: "is this a tuple of three items starting with 'add'?", "is this a dict with a 'pay' key?". It also pulls pieces out into names in the same step. Each <code>case</code> is a <strong>pattern</strong>, a template the data must fit. The first pattern that fits wins. <code>_</code> fits anything, so it is the default.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A post office sorting counter: "is it a parcel with a PIN code? a letter? anything else?" Each packet goes to the first slot it fits, and the clerk reads the PIN off it at the same moment.</p></div>
  <div class="fx" data-lang="py">commands = [
    "open",
    ("add", "samosa", 2),
    ("add", "masala chai", 0),
    {"pay": 200},
    ["note", "extra sugar", "no onion"],
    "close",
    42,
]
for cmd in commands:
    match cmd:
        case "open" | "close":                         # either literal
            print("till", cmd)
        case ("add", str(item), int(q)) if q &gt; 0:      # shape + types + guard
            print("add", q, "x", item)
        case ("add", _, _):                            # same shape, guard failed
            print("rejected: quantity must be positive")
        case {"pay": int(amount)}:                     # a dict with a 'pay' key
            print("paid", amount)
        case ["note", *texts]:                         # first item, then the rest
            print("notes:", texts)
        case _:                                        # anything else
            print("unknown command:", cmd)</div>
  <div class="fx" data-lang="text">till open
add 2 x samosa
rejected: quantity must be positive
paid 200
notes: ['extra sugar', 'no onion']
till close
unknown command: 42</div>
  <table class="tbl"><caption>Trace: which case catches each command</caption>
    <tr><th>Command</th><th>First case that fits</th><th>Names bound</th></tr>
    <tr><td>"open"</td><td><code>"open" | "close"</code></td><td>—</td></tr>
    <tr><td>("add", "samosa", 2)</td><td><code>("add", str(item), int(q)) if q &gt; 0</code></td><td>item = "samosa", q = 2</td></tr>
    <tr><td>("add", "masala chai", 0)</td><td>shape fits but guard <code>q &gt; 0</code> fails → <code>("add", _, _)</code></td><td>—</td></tr>
    <tr><td>{"pay": 200}</td><td><code>{"pay": int(amount)}</code></td><td>amount = 200</td></tr>
    <tr><td>["note", "extra sugar", "no onion"]</td><td><code>["note", *texts]</code></td><td>texts = ['extra sugar', 'no onion']</td></tr>
    <tr><td>42</td><td><code>_</code></td><td>—</td></tr>
  </table>
  <p>Reading the patterns: <code>|</code> means "or". <code>str(item)</code> means "must be a str; call it item". <code>if q &gt; 0</code> after a pattern is a <strong>guard</strong>, an extra condition. <code>*texts</code> collects all remaining items into a list. A tuple pattern also matches a list of the same shape (any sequence works), but strings never match sequence patterns.</p>
  <h3>The capture trap</h3>
  <div class="fx" data-lang="py">LIMIT = 150
subtotal = 70
match subtotal:
    case LIMIT:                       # NOT a comparison: captures into LIMIT
        print("matched! LIMIT is now", LIMIT)</div>
  <div class="fx" data-lang="text">matched! LIMIT is now 70</div>
  <p><code>case LIMIT:</code> does not compare with the variable LIMIT. A bare name in a pattern is a <em>capture</em>: it matches anything and binds the value to that name, so LIMIT is overwritten with 70. (If such a case is not last, Python refuses with a SyntaxError, because the cases after it could never run.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>match subject: case pattern [if guard]: block …</code> tries patterns top to bottom and runs the first whose structure matches and whose guard is truthy. Patterns: literals, <code>|</code> alternatives, capture names, <code>_</code> wildcard, sequence patterns <code>[a, *rest]</code>, mapping patterns <code>{"key": p}</code> (extra keys allowed), class patterns <code>int(x)</code>, and dotted constants <code>Color.RED</code> (compared by value).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>To compare against a constant, use a dotted name (<code>case Rules.LIMIT:</code>), a literal, or a guard (<code>case x if x == LIMIT:</code>). Never a bare name. And <code>match</code> needs Python 3.10+.</p></div>

  <h2 id="pc-traps"><span class="num">10</span>Common Loop Bugs</h2>
  <h3>Mutating a List While Iterating Over It</h3>
  <p>Removing every "samosa" from a list with the obvious loop leaves one behind:</p>
  <div class="fx" data-lang="py">lines = ["samosa", "samosa", "chai", "samosa"]
for x in lines:
    if x == "samosa":
        lines.remove(x)               # changes the list under the loop's feet
print(lines)                          # we wanted ['chai']</div>
  <div class="fx" data-lang="text">['chai', 'samosa']</div>
  <p>Why: a for loop over a list keeps an internal position counter (0, 1, 2, …). Removing an item shifts everything after it one place left, under the counter's feet.</p>
  <table class="tbl"><caption>Trace: for x in lines, with lines.remove(x) inside</caption>
    <tr><th>Round</th><th>Position</th><th>lines at that moment</th><th>x</th><th>Action</th><th>lines after</th></tr>
    <tr><td>1</td><td>0</td><td>[samosa, samosa, chai, samosa]</td><td>samosa</td><td>remove first "samosa"</td><td>[samosa, chai, samosa]</td></tr>
    <tr><td>2</td><td>1</td><td>[samosa, <b>chai</b>, samosa]</td><td>chai</td><td>keep (the samosa now at 0 was skipped!)</td><td>[samosa, chai, samosa]</td></tr>
    <tr><td>3</td><td>2</td><td>[samosa, chai, <b>samosa</b>]</td><td>samosa</td><td>remove <em>first</em> "samosa" (at position 0)</td><td>[chai, samosa]</td></tr>
    <tr><td>—</td><td>3</td><td>length is 2</td><td></td><td>loop ends</td><td>[chai, samosa]</td></tr>
  </table>
  <p>The fix: never change the list you are looping over. Build a new list (the filter pattern), or loop over a copy.</p>
  <div class="fx" data-lang="py">lines = ["samosa", "samosa", "chai", "samosa"]
kept = []
for x in lines:                       # read one list, write another
    if x != "samosa":
        kept.append(x)
print(kept)
lines = ["samosa", "samosa", "chai", "samosa"]
for x in lines.copy():                # or loop over a copy
    if x == "samosa":
        lines.remove(x)
print(lines)</div>
  <div class="fx" data-lang="text">['chai']
['chai']</div>
  <h3>Off-by-One Errors</h3>
  <p>For tables numbered 1 to 10, <code>range(1, 10)</code> forgets table 10, because stop is excluded. And looping one position too far raises <code>IndexError</code> (positions of a 3-item list are 0, 1, 2).</p>
  <div class="fx" data-lang="py">print(list(range(1, 10)))             # tables 1..9: table 10 is missing
print(list(range(1, 11)))             # stop is one past the last
order = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
try:
    for i in range(len(order) + 1):   # one too many
        print(order[i][0])
except IndexError as e:
    print("IndexError:", e)</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5, 6, 7, 8, 9]
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
masala chai
samosa
cold coffee
IndexError: list index out of range</div>
  <h3>Infinite Loops and Float Conditions</h3>
  <p>An infinite loop happens when nothing in the block can make the condition False. A subtle cause is floats (from <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>): 0.1 added ten times is not exactly 1.0, so <code>while x != 1.0</code> runs forever. The demo below has a safety <code>break</code> so it can finish.</p>
  <div class="fx" data-lang="py">x = 0.0
for step in range(10):
    x += 0.1
print("0.1 added ten times:", x, "| equal to 1.0?", x == 1.0)
x = 0.0
steps = 0
while x != 1.0:                       # so this test is never False
    x += 0.1
    steps += 1
    if steps &gt; 12:                    # a safety net, only for this demo
        print("still running after", steps, "steps; x =", x)
        break
for i in range(1, 11):                # the fix: count with an int
    x = i / 10
print("int counter:", x, x == 1.0)</div>
  <div class="fx" data-lang="text">0.1 added ten times: 0.9999999999999999 | equal to 1.0? False
still running after 13 steps; x = 1.3
int counter: 1.0 True</div>
  <p>Fixes: loop with an int counter and compute the float from it, or test with <code>&lt;</code> instead of <code>!=</code> (still check the last step). For <code>while</code> loops in general: make sure every round moves toward the stopping condition.</p>
  <h3>Loop Variables Outlive the Loop</h3>
  <div class="fx" data-lang="py">for item, qty, price in order:
    pass
print(item, qty, price)               # the loop variables survive the loop</div>
  <div class="fx" data-lang="text">cold coffee 1 90</div>
  <p>Python has no separate scope for a loop's block: after the loop, <code>item</code>, <code>qty</code> and <code>price</code> still hold the last line's values. Code that later uses <code>item</code> by mistake will silently get "cold coffee". (Scope is explained in <a class="xref" data-note="py_functions">Functions</a>.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>off-by-one error</strong> is a loop that runs one time too many or too few, usually from an inclusive/exclusive boundary mix-up. An <strong>infinite loop</strong> is one whose exit condition never becomes true.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>The list-mutation bug raises no error, so it is easy to ship. Rule: inside <code>for x in lst</code>, never <code>lst.remove</code>, <code>lst.insert</code> or <code>lst.append</code>. (Changing a dict's size while looping over it is so dangerous that Python raises <code>RuntimeError</code>.)</p></div>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>if / elif / else</h3>
  <ul>
    <li>Conditions are tested top to bottom; only the <b>first truthy</b> branch runs. Order tiers strictest first (<code>&gt;= 300</code> before <code>&gt;= 150</code>) or write full ranges (<code>150 &lt;= s &lt; 300</code>).</li>
    <li>Blocks are defined by indentation (4 spaces); a colon ends every header line.</li>
    <li><code>if x:</code> tests truthiness (empty/zero → False). When 0 or <code>""</code> are valid, test <code>if x is not None:</code>.</li>
    <li>Prefer <code>if a and b:</code> over nesting when there is no "only then ask" logic.</li>
  </ul>
  <h3>Conditional expression</h3>
  <ul>
    <li><code>value_if_true if cond else value_if_false</code>: an expression, only one side is evaluated.</li>
    <li>Two choices only; for three or more use <code>if/elif/else</code> (or a dict lookup).</li>
  </ul>
  <h3>while</h3>
  <ul>
    <li><code>while cond:</code> checks before every round; n rounds take n + 1 checks.</li>
    <li>Something in the body must move toward making <code>cond</code> false, or <code>break</code>.</li>
    <li>Walrus: <code>while (cmd := next(lines)):</code> assigns and tests in one expression (3.8+).</li>
  </ul>
  <h3>for and range</h3>
  <ul>
    <li><code>for target in iterable:</code> works on lists, tuples, str (chars), dict (keys; <code>.items()</code> for pairs), set, range, files (lines), generators.</li>
    <li>Unpacking: <code>for item, qty, price in order:</code>; with positions: <code>for i, (item, qty, price) in enumerate(order, start=1):</code>.</li>
    <li><code>range(start=0, stop, step=1)</code>: stop excluded; lazy object with O(1) <code>len</code>, indexing and <code>in</code>.</li>
    <li>Loop variables remain bound after the loop (only functions create a scope).</li>
  </ul>
  <h3>break, continue, else</h3>
  <table class="tbl">
    <tr><th>Statement</th><th>Effect</th></tr>
    <tr><td><code>break</code></td><td>leave the innermost loop now</td></tr>
    <tr><td><code>continue</code></td><td>skip to the next round of the innermost loop</td></tr>
    <tr><td><code>pass</code></td><td>do nothing (placeholder for an empty block)</td></tr>
    <tr><td>loop <code>else:</code></td><td>runs when the loop ends without <code>break</code> (also after zero rounds)</td></tr>
  </table>
  <p>To exit nested loops: <code>return</code> from a function (cleanest), a flag, or the <code>else: continue / break</code> idiom.</p>
  <h3>enumerate and zip</h3>
  <ul>
    <li><code>enumerate(xs, start=0)</code> yields <code>(index, item)</code>. Replaces <code>for i in range(len(xs))</code>.</li>
    <li><code>zip(a, b, c)</code> yields tuples and stops at the <b>shortest</b>; <code>strict=True</code> (3.10+) raises ValueError on unequal lengths; <code>itertools.zip_longest</code> pads.</li>
  </ul>
  <h3>Nested loops and patterns</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Loop form</th><th>Built-in</th></tr>
    <tr><td>Accumulate</td><td><code>total = 0; total += x</code></td><td><code>sum(...)</code></td></tr>
    <tr><td>Count</td><td><code>n = 0; if cond: n += 1</code></td><td><code>sum(1 for x in xs if cond)</code></td></tr>
    <tr><td>Find first</td><td><code>if cond: found = x; break</code></td><td><code>next((x for x in xs if cond), None)</code>, <code>any</code>, <code>all</code></td></tr>
    <tr><td>Filter</td><td><code>out = []; if cond: out.append(x)</code></td><td><code>[x for x in xs if cond]</code></td></tr>
    <tr><td>Best-so-far</td><td><code>if v &gt; best: best = v</code></td><td><code>max(xs, key=...)</code>, <code>min</code></td></tr>
  </table>
  <ul>
    <li>Nested loops: inner body runs n × m times. An inner "is it in the other list?" scan becomes O(1) with a set or dict.</li>
    <li>Reset per-outer-round accumulators inside the outer loop, before the inner one.</li>
  </ul>
  <h3>match / case (3.10+)</h3>
  <ul>
    <li>First matching pattern wins; <code>_</code> is the wildcard default.</li>
    <li>Patterns: literals, <code>"a" | "b"</code>, sequences <code>("add", item, qty)</code> / <code>[first, *rest]</code>, mappings <code>{"pay": amount}</code> (extra keys allowed), class patterns <code>int(q)</code>, guards <code>if q &gt; 0</code>.</li>
    <li>A bare name is a <b>capture</b>, not a comparison: <code>case LIMIT:</code> matches everything. Compare with dotted names, literals or guards.</li>
    <li>Strings do not match sequence patterns.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Removing from a list while iterating skips items: build a new list or iterate over a copy.</li>
    <li>Adding/removing dict keys while iterating raises <code>RuntimeError</code>: iterate over <code>list(d)</code>.</li>
    <li><code>range(1, 10)</code> stops at 9; <code>range(len(xs) + 1)</code> → IndexError.</li>
    <li><code>while x != 1.0</code> with float steps may never stop: count with ints or use <code>&lt;</code>.</li>
    <li>A generator can be iterated only once; a second loop sees nothing.</li>
    <li>Loose condition first in an elif chain makes later branches dead code.</li>
  </ul>

  <h2 id="pc-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python decide which branch of an if/elif/else runs?</summary><div class="qa-body">It evaluates each condition top to bottom, takes its truthiness, runs the block of the first truthy one and skips the rest; <code>else</code> runs if none matched. Because only the first match runs, the order of conditions is part of the logic: <code>if s &gt;= 150 … elif s &gt;= 300 …</code> can never reach the second branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Python has no switch statement. What do you use instead?</summary><div class="qa-body">An <code>if/elif</code> chain for ranges and conditions; a dict mapping keys to values or functions for dispatch (<code>handlers.get(cmd, default)(args)</code>); and since 3.10, <code>match/case</code>, which also destructures data by shape. Note <code>match</code> has no fall-through between cases.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the syntax of Python's ternary operator?</summary><div class="qa-body"><code>a if condition else b</code>: the condition is in the middle, unlike C's <code>c ? a : b</code>. It is an expression, so it can be assigned or passed, and only the selected branch is evaluated. Avoid nesting it beyond two choices.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>while</code> instead of <code>for</code>?</summary><div class="qa-body">When the number of iterations is not known up front and depends on a condition: polling until a job finishes, reading until input ends, iterating until convergence, processing a queue until empty. For walking a collection or a known count, use <code>for</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>break</code>, <code>continue</code> and <code>pass</code>?</summary><div class="qa-body"><code>break</code> exits the innermost loop; <code>continue</code> skips the rest of the current iteration and moves to the next; <code>pass</code> does nothing and exists because a block cannot be empty. <code>break</code> and <code>continue</code> only affect the innermost loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the <code>else</code> clause of a <code>for</code> or <code>while</code> loop run?</summary><div class="qa-body">When the loop finishes without hitting <code>break</code>, including when it ran zero times. It is skipped on <code>break</code> (and on <code>return</code> or an exception). The typical use is a search: <code>break</code> when found, <code>else</code> handles "not found" without a flag variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>for i in range(3): pass</code> then <code>print(i)</code></summary><div class="qa-body"><code>2</code>. Loops do not create a scope, so the loop variable stays bound to the last value. If the iterable were empty, <code>i</code> would never be assigned and <code>print(i)</code> would raise NameError (unless <code>i</code> existed before).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>range()</code> return? Is <code>range(10**12)</code> expensive?</summary><div class="qa-body">A lazy, immutable <code>range</code> sequence object, not a list. It stores only start, stop and step, so <code>range(10**12)</code> is cheap; <code>len</code>, indexing and <code>x in r</code> for ints are O(1) (computed arithmetically). <code>list(range(...))</code> is what costs memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>for i in range(len(xs)): x = xs[i]</code> considered unpythonic?</summary><div class="qa-body">It is longer and invites off-by-one and indexing mistakes, and it does not work on iterables without indexing (sets, generators, files). Loop over items directly, use <code>enumerate(xs)</code> when you need the index, and <code>zip</code> to walk sequences in parallel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>zip</code> do with inputs of different lengths?</summary><div class="qa-body">It stops at the shortest input, silently dropping the rest. Pass <code>strict=True</code> (3.10+) to raise ValueError instead, or use <code>itertools.zip_longest(..., fillvalue=...)</code> to pad.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you remove items from a list while looping over it? How do you fix it?</summary><div class="qa-body">Items get skipped: the loop keeps an internal index, and each removal shifts later items one place left under it. <code>["s", "s", "c", "s"]</code> with "remove every s" ends as <code>['c', 's']</code>. Fix: build a new list (<code>[x for x in xs if x != "s"]</code>), iterate over a copy (<code>for x in xs[:]</code>), or iterate backwards by index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you add a key to a dict while iterating over it?</summary><div class="qa-body">CPython raises <code>RuntimeError: dictionary changed size during iteration</code>. Iterate over a snapshot instead: <code>for k in list(d): ...</code>, or build a new dict with a comprehension. Changing values of existing keys is allowed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you break out of two nested loops at once?</summary><div class="qa-body">Cleanest: put the loops in a function and <code>return</code>. Alternatives: a flag checked by the outer loop, or the loop-else idiom (<code>else: continue</code> after the inner loop, then <code>break</code>). Python has no labelled break. Raising and catching an exception works but is heavy for normal control flow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a <code>for</code> loop work internally?</summary><div class="qa-body">It calls <code>iter(obj)</code> to get an iterator, then calls <code>next()</code> on it each round and binds the result to the target; when <code>next()</code> raises <code>StopIteration</code>, the loop ends (and runs the <code>else</code> clause). That is why any object with <code>__iter__</code> works in a for loop, and why a generator can be looped over only once (see <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A loop compares every item of list A (10,000 items) against every item of list B (10,000). How would you speed it up?</summary><div class="qa-body">The nested loop is 10<sup>8</sup> comparisons, O(n·m). If the inner loop is a membership test, build <code>set(B)</code> once and test <code>x in b_set</code>: O(n + m) total. More generally: move work out of the inner loop, use built-ins (<code>sum</code>, <code>any</code>, comprehensions) that loop in C, and for numeric data vectorise with numpy/pandas instead of Python loops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the walrus operator and when is it useful?</summary><div class="qa-body"><code>name := expr</code> (3.8+) assigns and returns the value inside an expression. Typical uses: <code>while (chunk := f.read(4096)):</code>, <code>if (m := pattern.search(s)):</code>, and reusing a computed value in a comprehension filter. It cannot be used as a plain top-level statement without brackets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In <code>match</code>/<code>case</code>, why does <code>case LIMIT:</code> match every value?</summary><div class="qa-body">A bare name in a pattern is a capture pattern: it always succeeds and binds the subject to that name, overwriting <code>LIMIT</code>. To compare against a constant, use a dotted name (<code>case Config.LIMIT:</code>), a literal, or a guard (<code>case x if x == LIMIT:</code>). Python rejects an irrefutable capture that is not the last case.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>if items:</code> vs <code>if items is not None:</code>, what is the difference?</summary><div class="qa-body"><code>if items:</code> is False for <code>None</code> <em>and</em> for an empty container, 0 or <code>""</code>. <code>if items is not None:</code> only excludes None. Use the second when an empty list or 0 is a valid value that must still be processed. With numpy arrays and pandas objects, <code>if arr:</code> raises; use <code>arr.size</code>, <code>.empty</code>, <code>.any()</code> or <code>.all()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might <code>while x != 1.0: x += 0.1</code> never stop?</summary><div class="qa-body">0.1 is not exactly representable in binary, so after ten additions <code>x</code> is 0.9999999999999999 and then jumps past 1.0 without ever equalling it. Drive the loop with an integer counter and compute the float from it, or use <code>&lt;</code> with a tolerance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a list comprehension faster than an equivalent <code>for</code> loop with <code>append</code>?</summary><div class="qa-body">Usually yes, modestly: the comprehension avoids the repeated attribute lookup and call of <code>list.append</code> and runs a specialised bytecode loop. Built-ins like <code>sum</code> and <code>max</code> are faster still because the loop runs in C. Readability decides when the body has side effects or several statements: then a plain loop is clearer.</div></details>

</main>
`
});
