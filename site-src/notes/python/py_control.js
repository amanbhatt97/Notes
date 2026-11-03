// notes/python/py_control.js — Decisions & Loops
Object.assign(TOPIC_CONTENT, {
  "py_control": `<main>
<h1>Decisions &amp; Loops</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Decisions &amp; Loops</span></div>
  <p class="lead">Without decisions and loops, a program runs every line exactly once, from top to bottom. That is enough to work out one fixed bill, but not enough for real rules. A real program must apply a discount only when the bill is large enough, and must handle an order of three lines or three hundred with the same code. The tools for this are called <strong>control flow</strong>: <em>decisions</em> (<code>if</code>, <code>elif</code>, <code>else</code>, the conditional expression and <code>match</code>) choose which lines run, and <em>loops</em> (<code>while</code> and <code>for</code>) run lines again and again. This page builds both from zero using one running example, the till of a chai stall that sells masala chai for ₹30, samosas for ₹15, vada pav for ₹20 and cold coffee for ₹90, gives 10% off bills of ₹150 or more, and charges 5% tax. Asha's table orders 2 chai, 3 samosas and 1 cold coffee, so its subtotal is ₹195. Every data-cleaning script, training loop and web request handler you will ever write is made of these pieces.</p>

  <h2 id="pc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Decisions &amp; Loops</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Decisions</div>
        <ul>
          <li><code>if / elif / else</code>: the first true branch runs, the rest are skipped</li>
          <li>Indentation marks the block; order tiers strictest first</li>
          <li><code>a if cond else b</code> picks one of two values</li>
          <li><code>match / case</code> picks by the shape of data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Loops</div>
        <ul>
          <li><code>while</code>: repeat while a condition is true</li>
          <li><code>for</code>: once per item of anything iterable</li>
          <li><code>range(start, stop, step)</code>: stop is not included</li>
          <li><code>enumerate</code> adds positions; <code>zip</code> walks lists side by side</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Control inside loops</div>
        <ul>
          <li><code>break</code> leaves the loop; <code>continue</code> skips to the next round</li>
          <li>Loop <code>else</code> runs only if there was no break</li>
          <li>Nested loops run n × m times</li>
          <li>Patterns: accumulate, count, find, filter, best-so-far</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>Removing from a list while looping over it skips items</li>
          <li><code>range(1, 10)</code> misses 10</li>
          <li><code>while x != 1.0</code> with float steps may never stop</li>
          <li><code>case NAME:</code> captures, it does not compare</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-if"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">if, elif and else</span><span class="rm-sub">running code only when a condition holds</span></div></div>
      <div class="rm-item rm-done" data-target="pc-ternary"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Conditional Expression</span><span class="rm-sub">choosing between two values in one line</span></div></div>
      <div class="rm-item rm-done" data-target="pc-while"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">while Loops</span><span class="rm-sub">repeating until a condition becomes false</span></div></div>
      <div class="rm-item rm-done" data-target="pc-for"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">for Loops and range</span><span class="rm-sub">one round per item, and counting with range</span></div></div>
      <div class="rm-item rm-done" data-target="pc-break"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">break, continue and the Loop else</span><span class="rm-sub">stopping early, skipping, and "not found"</span></div></div>
      <div class="rm-item rm-done" data-target="pc-enum"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">enumerate and zip</span><span class="rm-sub">positions and parallel lists without indexes</span></div></div>
      <div class="rm-item rm-done" data-target="pc-nested"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Nested Loops</span><span class="rm-sub">a loop inside a loop, and its cost</span></div></div>
      <div class="rm-item rm-done" data-target="pc-patterns"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Loop Patterns and Built-ins</span><span class="rm-sub">five loop shapes and their one-line versions</span></div></div>
      <div class="rm-item rm-done" data-target="pc-match"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">match and case</span><span class="rm-sub">choosing by the shape of data</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">changing a list while looping, off-by-one, floats</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, rules and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">branches, loops and how iteration works</span></div></div>
    </div>
  </div>

  <h2 id="pc-if"><span class="num">01</span>if, elif and else</h2>
  <p>The stall's first rule is "10% off when the subtotal is at least ₹150". Some lines, the ones that apply the discount, must run only when that condition is true. In <a class="xref" data-note="py_values">Values, Types &amp; Variables</a> we faked this by multiplying by a bool, which works for exactly two cases and becomes unreadable after that. The proper tool is the <code>if</code> statement. It has a <strong>condition</strong>, which is any expression that Python can judge as true or false, and a <strong>block</strong>, the indented lines underneath. If the condition is true, Python runs the block; if it is false, Python skips the block and carries on after it. Think of a railway junction: the train arrives at the points, the signal is checked once, and the train goes down one track or the other, never both.</p>
  <div class="fx" data-lang="py">subtotal = 195
discount = 0
if subtotal &gt;= 150:                  # the condition
    discount = subtotal * 0.10       # indented: runs only if the condition is True
    print("10% discount applied")
print("discount:", discount)         # not indented: always runs</div>
  <div class="fx" data-lang="text">10% discount applied
discount: 19.5</div>
  <p>Look at the shape of the code before the output. The line <code>if subtotal &gt;= 150:</code> ends with a colon, and the two lines below it are indented by four spaces. That indentation <em>is</em> the block; Python has no braces or <code>end</code> keyword. The last line is back at the left edge, which means it is after the <code>if</code> and runs whatever happened. Because 195 ≥ 150 is true, the block ran: the discount became 19.5 and the message was printed.</p>
  <p>Often you want something different to happen when the condition is false. An <code>else:</code> block is the other track of the junction: it runs exactly when the condition was false. With a subtotal of 70, the condition fails and the <code>else</code> block sets the discount to 0:</p>
  <div class="fx" data-lang="py">subtotal = 70
if subtotal &gt;= 150:
    discount = subtotal * 0.10
else:
    discount = 0                     # runs only if the condition was False
print("discount:", discount)</div>
  <div class="fx" data-lang="text">discount: 0</div>
  <p>Now suppose the stall adds a catering rule: ₹300 or more gets 15%. There are three cases, and <code>if</code>/<code>else</code> only has two tracks. <code>elif</code>, short for "else if", adds another condition. Python checks the conditions <strong>from top to bottom</strong>, runs the block of the <strong>first</strong> one that is true, and skips all the rest, including the <code>else</code>. The loop around this code (explained in section 04) simply tries three subtotals in turn:</p>
  <div class="fx" data-lang="py">for subtotal in [320, 195, 70]:
    if subtotal &gt;= 300:
        rate = 0.15
    elif subtotal &gt;= 150:
        rate = 0.10
    else:
        rate = 0.0
    print(subtotal, "-&gt; rate", rate, "discount", subtotal * rate)</div>
  <div class="fx" data-lang="text">320 -&gt; rate 0.15 discount 48.0
195 -&gt; rate 0.1 discount 19.5
70 -&gt; rate 0.0 discount 0.0</div>
  <p>For 320, the first condition (≥ 300) is true, so the rate is 0.15 and the other branches are never even checked. For 195, the first condition is false, so Python tries the <code>elif</code>, which is true, giving 0.10. For 70 both conditions fail and the <code>else</code> gives 0.0. Because only the first true branch runs, the <em>order</em> of the conditions is part of the logic. Watch what happens if the looser condition is written first:</p>
  <div class="fx" data-lang="py">subtotal = 320                       # a big catering order
if subtotal &gt;= 150:                  # checked first: already True...
    rate = 0.10
elif subtotal &gt;= 300:                # ...so this branch can never be reached
    rate = 0.15
else:
    rate = 0.0
print("rate:", rate)                 # should have been 0.15</div>
  <div class="fx" data-lang="text">rate: 0.1</div>
  <p>320 ≥ 150 is true, so the first branch wins and the rate is 0.10. The 15% branch can never be reached, because any number that is ≥ 300 is also ≥ 150 and is caught first. Code that can never run is called <strong>dead code</strong>, and here it is a silent bug: the catering customer is undercharged a discount without any error. The rule of thumb for tiers is to test the strictest condition first (≥ 300, then ≥ 150), or to write each range in full, such as <code>150 &lt;= subtotal &lt; 300</code>.</p>
  <p>A block can contain another <code>if</code>. This is called <strong>nesting</strong>, and it is right when the inner question only makes sense once the outer one is answered. Here the till first asks whether enough was paid, and only then whether change is due:</p>
  <div class="fx" data-lang="py">total, paid = 184, 200
if paid &gt;= total:
    if paid == total:
        print("exact amount, thank you")
    else:
        print("change:", paid - total)
else:
    print("short by", total - paid)</div>
  <div class="fx" data-lang="text">change: 16</div>
  <p>₹200 is at least ₹184, so the outer block runs; 200 is not equal to 184, so the inner <code>else</code> prints the change, 16. When two conditions simply both have to hold, one <code>if a and b:</code> is flatter and easier to read than nesting. Code nested more than two or three levels deep is a sign that part of it should become a <a class="xref" data-note="py_functions">function</a>.</p>
  <p>Finally, a condition does not have to be a comparison. <code>if</code> asks for the <strong>truthiness</strong> of whatever it is given: zero, empty text, empty collections and <code>None</code> count as false, and everything else counts as true (see <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>). This gives short, readable conditions:</p>
  <div class="fx" data-lang="py">order = []
if order:                            # an empty list counts as false
    print("send to kitchen")
else:
    print("nothing ordered yet")

name = ""
if not name:                         # empty text counts as false
    name = "Guest"
print(name)</div>
  <div class="fx" data-lang="text">nothing ordered yet
Guest</div>
  <p><code>if order:</code> reads as "if there is anything in the order"; the list is empty, so the <code>else</code> runs. <code>if not name:</code> reads as "if no name was given"; the empty text counts as false, so <code>not</code> makes the condition true and the name becomes "Guest". One caution: <code>if x:</code> treats 0 the same as "missing". When 0 or an empty list is a valid value that must still be handled, test <code>if x is not None:</code> instead.</p>

  <h2 id="pc-ternary"><span class="num">02</span>The Conditional Expression</h2>
  <p>An <code>if</code> statement runs blocks of code, but it does not itself produce a value. Very often, though, the whole job of a decision is to pick one of two values: the discount rate is 0.10 or 0.0, the label is "big order" or "regular order". Writing four lines of <code>if</code>/<code>else</code> just to set one variable is clumsy, so Python has a <strong>conditional expression</strong>, often called the ternary operator because it has three parts. It reads almost like English: <code>value_if_true if condition else value_if_false</code>. Because it is an expression, it produces a value you can assign, print or pass to a function. Think of a vending machine button labelled "tea if hot water is available, otherwise juice": one press, one result.</p>
  <div class="fx" data-lang="py">subtotal = 195
rate = 0.10 if subtotal &gt;= 150 else 0.0
size = "big order" if subtotal &gt;= 300 else "regular order"
print(rate, size)
qty = 0
print(qty or 1)                          # replaces a real 0
print(qty if qty is not None else 1)     # replaces only a missing value</div>
  <div class="fx" data-lang="text">0.1 regular order
1
0</div>
  <p>The rate becomes 0.10 because 195 ≥ 150, and the label is "regular order" because 195 is below 300. Only the chosen side is evaluated, which matters if the other side would fail or be slow. The last two lines show a practical use. You often want a default for a missing value. The shortcut <code>qty or 1</code> also replaces a genuine 0, because 0 is falsy, so it prints 1. <code>qty if qty is not None else 1</code> replaces only a truly missing value and keeps the 0.</p>
  <p>Note where the condition sits: in the middle, unlike the <code>c ? a : b</code> form of C and JavaScript. Conditional expressions can be nested (<code>a if c1 else b if c2 else c</code>), but that quickly becomes hard to read; when there are three or more cases, or when a branch needs several lines, use <code>if</code>/<code>elif</code>/<code>else</code>.</p>

  <h2 id="pc-while"><span class="num">03</span>while Loops</h2>
  <p>Decisions choose between lines; loops repeat them. Some repetitions have no fixed count: keep buying chai until the money runs out, keep serving customers until the queue is empty, keep improving an estimate until it is accurate enough. For these, Python has the <code>while</code> loop. It is like an <code>if</code> that goes back to the top: Python checks the condition, and if it is true runs the block, then checks the condition again, and so on; as soon as the condition is false it continues after the loop. Each pass through the block is called an <strong>iteration</strong>, or a round. Think of eating samosas from a plate: "while there is a samosa on the plate, eat one". You check the plate before every bite, and each bite moves you closer to stopping.</p>
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
  <p>With ₹100 and chai at ₹30, the loop runs three rounds. The table below traces the condition check before each round:</p>
  <table class="tbl"><caption>Trace: while wallet &gt;= 30</caption>
    <tr><th>Check</th><th>wallet before</th><th><code>wallet &gt;= 30</code>?</th><th>What happens</th><th>wallet after</th></tr>
    <tr><td>1</td><td>100</td><td>True</td><td>buy a cup (round 1)</td><td>70</td></tr>
    <tr><td>2</td><td>70</td><td>True</td><td>buy a cup (round 2)</td><td>40</td></tr>
    <tr><td>3</td><td>40</td><td>True</td><td>buy a cup (round 3)</td><td>10</td></tr>
    <tr><td>4</td><td>10</td><td><b>False</b></td><td>leave the loop</td><td>10</td></tr>
  </table>
  <p>The condition was checked four times and the block ran three times. That is always the shape of a <code>while</code> loop: n rounds take n + 1 checks, the last one being the check that fails. Most important of all, something inside the block, here <code>wallet -= 30</code>, changes the value the condition depends on. If you forgot that line, the condition would stay true forever, giving an <strong>infinite loop</strong>, and you would have to stop the program with Ctrl+C.</p>
  <p>A very common use is processing a collection until it is empty. Since a non-empty list counts as true, <code>while waiting:</code> means "while anyone is still in the queue". <code>.pop(0)</code> removes the first item from a list and returns it, which both serves the customer and moves the loop toward its end:</p>
  <div class="fx" data-lang="py">waiting = ["Asha", "Ben", "Chen"]
while waiting:                       # a non-empty list counts as true
    customer = waiting.pop(0)        # take the first customer out
    print("serving", customer, "| still waiting:", waiting)
print("queue empty")</div>
  <div class="fx" data-lang="text">serving Asha | still waiting: ['Ben', 'Chen']
serving Ben | still waiting: ['Chen']
serving Chen | still waiting: []
queue empty</div>
  <p>Each round removes one name, so the list shrinks from three names to none, and the loop stops when it is empty. Sometimes the condition computes a value that you also want inside the block. The <strong>walrus operator</strong> <code>:=</code> (named for its resemblance to a walrus's eyes and tusks) assigns a value and also produces it, so you can test and keep a value in one step:</p>
  <div class="fx" data-lang="py">waiting = ["Asha", "Ben", "Chen"]
while (n := len(waiting)) &gt; 1:       # compute n, keep it, and test it
    print(n, "waiting; serving", waiting.pop(0))
print("last one:", waiting)</div>
  <div class="fx" data-lang="text">3 waiting; serving Asha
2 waiting; serving Ben
last one: ['Chen']</div>
  <p><code>(n := len(waiting)) &gt; 1</code> stores the length of the queue in <code>n</code> and then compares it with 1, so the block can print "3 waiting" without calling <code>len</code> a second time. The loop stops when only one customer is left. The walrus is handy in loops like "while there is another chunk of the file, process it", but use it sparingly; a plain assignment is usually clearer.</p>
  <p><code>while</code> is the right tool when the number of rounds depends on a condition. It is the wrong tool for "once for each item in a list": doing that with a counter and indexes is easy to get wrong, and that job belongs to <code>for</code>.</p>

  <h2 id="pc-for"><span class="num">04</span>for Loops and range</h2>
  <p>An order is a list of lines, and billing it means doing the same thing once for every line. You could do it with <code>while</code> and a counter that goes 0, 1, 2, but you would have to manage the counter and stop at the right moment, and getting either wrong is a classic bug. A <code>for</code> loop removes all of that. It takes the items of a collection one at a time, gives the current item a name, runs the block, and stops by itself when the items run out. Think of a cashier scanning a basket: pick up the next item, scan it, add it to the total, repeat until the basket is empty. The cashier never needs to ask "which number item is this?".</p>
  <p>Our order is a list of <strong>tuples</strong>, small fixed groups of values in round brackets, each holding an item, a quantity and a price. In the loop header <code>for item, qty, price in order:</code>, each line of the order is split into its three parts, which get the three names on the left. This splitting is called <strong>unpacking</strong>, and it is the same feature as <code>chai, samosa = 30, 15</code>:</p>
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
  <p>In round 1, <code>item</code>, <code>qty</code> and <code>price</code> are "masala chai", 2 and 30, so the amount is 60 and the running subtotal becomes 60. Round 2 adds 45 for the samosas, giving 105, and round 3 adds 90 for the cold coffee, giving 195. Then the items run out and the loop ends. The <code>print</code> uses an <strong>f-string</strong>: text starting with <code>f"</code> in which <code>{name}</code> is replaced by the value, and <code>{item:12}</code> pads the value to 12 characters so the columns line up (full rules in <a class="xref" data-note="py_strings">Strings</a>). The important thing is that the same three lines of loop body would bill an order of 3 lines or 300 without any change.</p>
  <p>A <code>for</code> loop can walk over anything that is <strong>iterable</strong>, meaning anything that can hand out its items one at a time. Lists and tuples are iterable, and so are strings (one character per round), dictionaries (one key per round), sets, files (one line per round) and the <code>range</code> objects we meet next. How Python asks an object for "the next item" is explained in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>.</p>
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
masala chai=30 samosa=15 vada pav=20 cold coffee=90</div>
  <p>The first loop prints the four characters of "chai". The second walks over the menu dictionary and gets its keys, the item names, not the prices. To get both, the third loop uses <code>menu.items()</code>, which hands out (key, value) pairs that are unpacked into <code>name</code> and <code>price</code>. <code>print(..., end=" ")</code> ends each print with a space instead of a new line, so a whole loop's output fits on one line; the bare <code>print()</code> afterwards finishes the line.</p>
  <p>Sometimes you need to loop over numbers rather than over a collection, for example over table numbers 1 to 10. <code>range(start, stop, step)</code> produces whole numbers starting at <code>start</code>, going up by <code>step</code>, and stopping <strong>before</strong> <code>stop</code>. With one argument, the start is 0; with two, the step is 1. A <code>range</code> does not build a list in memory; it produces each number when the loop asks for it, so <code>range(1_000_000_000)</code> costs almost nothing. We wrap ranges in <code>list()</code> here only to see the numbers:</p>
  <div class="fx" data-lang="py">print(list(range(5)))                # 0..4: stop is NOT included
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
table 1; table 2; table 3;</div>
  <p><code>range(5)</code> gives 0 to 4, five numbers; the stop value 5 is not included. <code>range(1, 4)</code> gives 1, 2, 3. <code>range(0, 10, 3)</code> counts in threes and stops at 9, because the next number, 12, is past the stop. A negative step counts down, and <code>range(5, 0, -1)</code> stops before 0. A useful consequence of "stop is excluded" is that <code>range(a, b)</code> always contains exactly b − a numbers, so tables 1 to 10 need <code>range(1, 11)</code>, which has 10 numbers. Why exclude the stop? Because it makes <code>range(len(x))</code> produce exactly the valid positions of a list, which start at 0.</p>
  <p>Loops and decisions combine naturally. Here the discount rule from section 02 is applied to three tables in turn, using a conditional expression inside the loop:</p>
  <div class="fx" data-lang="py">for name, subtotal in [("Asha", 195), ("Ben", 70), ("Chen", 50)]:
    rate = 0.10 if subtotal &gt;= 150 else 0.0
    after = subtotal - subtotal * rate
    total = after + after * 0.05
    print(name, subtotal, after, round(total))</div>
  <div class="fx" data-lang="text">Asha 195 175.5 184
Ben 70 70.0 74
Chen 50 50.0 52</div>
  <p>Asha's ₹195 gets the discount and ends at ₹184; Ben's ₹70 and Chen's ₹50 do not, and end at ₹74 and ₹52. (52.5 rounds to 52 because Python rounds halves to the even number; see <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>.)</p>

  <h2 id="pc-break"><span class="num">05</span>break, continue and the Loop else</h2>
  <p>A <code>for</code> loop visits every item by default, but real tasks often need to stop early or skip some items. Suppose we want the first item on the order that costs more than ₹50. Once it is found, checking the rest is wasted work. The <code>break</code> statement leaves the loop immediately and continues with the first line after it:</p>
  <div class="fx" data-lang="py">for item, qty, price in order:
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
  <p>The loop checked chai and samosa, found that cold coffee costs more than 50, printed it, and broke out. "after the loop" prints either way, because <code>break</code> jumps to the line after the loop rather than ending the program. Had cold coffee been first on the order, only one item would have been checked.</p>
  <p><code>continue</code> is the gentler cousin: it abandons the <em>rest of the current round</em> and moves straight on to the next item. Here the samosas are out of stock and must be skipped:</p>
  <div class="fx" data-lang="py">out_of_stock = {"samosa"}            # a set of names
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
  <p>When the loop reaches the samosa line, the condition is true, so it prints "skip" and <code>continue</code> jumps to the next round before the samosas are added. The subtotal is 60 + 90 = 150. (<code>out_of_stock</code> is a <strong>set</strong>, a collection written with curly braces that is very fast for <code>in</code> checks; see <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>.)</p>
  <p>Python has one unusual extra feature here. A <code>for</code> or <code>while</code> loop can have its own <code>else:</code> block, and that block runs only if the loop finished <strong>without</strong> hitting <code>break</code>. The name is confusing, so read it as "no break". It exists to handle the "searched everything and found nothing" case without an extra variable. Think of searching your bag for a pen: if you find it, you stop searching (break); if you have checked every pocket and found nothing, then you borrow one (the <code>else</code>). The figure shows the two paths out of the loop.</p>
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
  </svg><figcaption>A loop can end in two ways. If it hits break, the else block is skipped; if it runs out of items, the else block runs.</figcaption></figure>
  <p>The code below searches the order twice, once for samosa and once for vada pav. The outer loop just runs the search for each target; the inner loop is the search itself:</p>
  <div class="fx" data-lang="py">for target in ["samosa", "vada pav"]:     # run the search twice
    for item, qty, price in order:
        if item == target:
            print(target, "found, qty", qty)
            break
    else:                                 # runs only if NO break happened
        print(target, "not in this order")</div>
  <div class="fx" data-lang="text">samosa found, qty 3
vada pav not in this order</div>
  <p>The search for samosa finds it in round 2, prints its quantity and breaks, so the <code>else</code> is skipped. The search for vada pav checks all three lines without a match, the loop ends normally, and the <code>else</code> prints "not in this order". Notice the indentation: the <code>else</code> lines up with the inner <code>for</code>, not with the <code>if</code>; it belongs to the loop. Without this feature you would need a variable such as <code>found = False</code>, set it to True before breaking, and test it after the loop. A loop's <code>else</code> also runs when the loop had zero rounds, and it is skipped if the loop is left by <code>return</code> or an error.</p>
  <p>A third small statement often appears alongside these: <code>pass</code>, which does nothing at all. Python does not allow an empty block, so <code>pass</code> is a placeholder for "nothing to do here yet".</p>

  <h2 id="pc-enum"><span class="num">06</span>enumerate and zip</h2>
  <p>A <code>for</code> loop hands you items, but not their positions. To print a numbered receipt, you need "1.", "2.", "3." next to each line. Beginners usually reach for <code>range(len(order))</code> and indexes, but Python has a cleaner tool. <code>enumerate(order, start=1)</code> hands out pairs of (position, item), counting from whatever start you choose. Because each item in our order is itself a tuple, the three names for it are put in brackets so that both levels unpack at once:</p>
  <div class="fx" data-lang="py">for i, (item, qty, price) in enumerate(order, start=1):
    print(f"{i}. {item:12} {qty * price:4}")</div>
  <div class="fx" data-lang="text">1. masala chai    60
2. samosa         45
3. cold coffee    90</div>
  <p>Each round gets <code>i</code> (1, 2, 3) and the three parts of the line, and the receipt is numbered correctly. Compare it with the index-based version, which produces similar output in a harder-to-read way:</p>
  <div class="fx" data-lang="py">for i in range(len(order)):          # works, but clumsy
    print(i, order[i][0])</div>
  <div class="fx" data-lang="text">0 masala chai
1 samosa
2 cold coffee</div>
  <p><code>order[i][0]</code> means "the line at position i, then its first part", which forces the reader to remember what position 0 holds, and it counts from 0. The <code>enumerate</code> version names everything and is less error-prone.</p>
  <p>The second common need is walking several lists side by side. Suppose items, quantities and prices arrive as three separate lists, where position 0 of each belongs together. <code>zip(a, b, c)</code> hands out tuples containing the first item of each list, then the second of each, and so on, like the two sides of a zip fastener meeting one tooth at a time:</p>
  <div class="fx" data-lang="py">items = ["masala chai", "samosa", "cold coffee"]
qtys = [2, 3, 1]
prices = [30, 15, 90]
for item, q, p in zip(items, qtys, prices):   # walk three lists side by side
    print(item, q * p)
print(list(zip(items, [2, 3])))               # stops at the SHORTEST list
try:
    list(zip(items, [2, 3], strict=True))     # insist on equal lengths
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">masala chai 60
samosa 45
cold coffee 90
[('masala chai', 2), ('samosa', 3)]
ValueError: zip() argument 2 is shorter than argument 1</div>
  <p>The loop gets ("masala chai", 2, 30), then ("samosa", 3, 15), then ("cold coffee", 1, 90), and prints each amount. The next line is the trap: when the lists have different lengths, <code>zip</code> silently stops at the shortest one, so the cold coffee line simply disappears with no error. That is a real source of bugs when data has gone missing. Since Python 3.10, passing <code>strict=True</code> turns the silent loss into a <code>ValueError</code>, as the last line shows; use it whenever the lists are supposed to be the same length. (<code>itertools.zip_longest</code> pads the shorter lists instead.)</p>

  <h2 id="pc-nested"><span class="num">07</span>Nested Loops</h2>
  <p>At the end of the day the stall has several tables, and each table has several order lines. Billing the whole day means "for every table, for every line on that table". A loop whose block contains another loop is called a <strong>nested loop</strong>, and the rule is simple: for every single round of the outer loop, the inner loop runs completely. Think of a clock, where the minute hand goes all the way round for every single step of the hour hand.</p>
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
  <p>The outer loop takes one table at a time. For Asha's table, the inner loop runs through her three lines, building the subtotal 60 → 105 → 195; then the discount and tax give 184, which is added to the day total. Then the outer loop moves on to Ben, the inner loop runs through his two lines (30 + 40 = 70), and so on. The day total ends at 184 + 74 + 52 = 310.</p>
  <p>Notice exactly where each starting value is set, because getting this wrong is the most common nested-loop bug. <code>subtotal = 0</code> is <em>inside</em> the outer loop but <em>before</em> the inner one, so it restarts at zero for each table. <code>day_total = 0</code> is before both loops, so it keeps growing all day. If you moved <code>subtotal = 0</code> above the outer loop, each table's subtotal would include every earlier table's lines.</p>
  <p><code>break</code> and <code>continue</code> affect only the innermost loop that contains them. Here we want to know which tables ordered vada pav. Breaking out of the inner search as soon as vada pav is found is correct, and the outer loop carries on to the next table:</p>
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
  <p>Asha has no vada pav, so the inner loop runs to the end. Ben's inner loop breaks at vada pav, and then "done with Ben" still prints, because only the inner loop was left. To stop <em>both</em> loops at once, Python has no special statement; the cleanest way is to put the loops in a function and use <code>return</code>, and the alternatives are a flag variable checked by the outer loop, or the loop-<code>else</code> idiom.</p>
  <p>Nested loops also multiply work. Pairing every drink with every snack, two drinks and two snacks, runs the inner block 2 × 2 = 4 times:</p>
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
  <p>In general, an outer loop of n items around an inner loop of m items runs the inner block n × m times. That is harmless for 2 × 2, but comparing every one of 10,000 customers with every one of 10,000 others is 100 million rounds. When the inner loop is only asking "is this item in the other list?", replacing the inner list with a set or dict turns each check into a near-instant lookup and removes the inner loop entirely (see <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>).</p>

  <h2 id="pc-patterns"><span class="num">08</span>Loop Patterns and Built-ins</h2>
  <p>If you look at many loops over collections, the same few shapes appear again and again, and recognising them makes loops much easier to write. Each pattern has three parts: <strong>set up</strong> a result before the loop, <strong>update</strong> it inside the loop, and <strong>use</strong> it after the loop. The five core patterns answer five kinds of question. <em>Accumulate</em> answers "what is the total?"; <em>count</em> answers "how many satisfy a rule?"; <em>find</em> answers "which is the first one that…?" and stops early; <em>filter</em> answers "which ones satisfy a rule?" by building a new list; and <em>best-so-far</em> answers "which is the biggest?" by remembering the best seen so far. Here are all five on Asha's order:</p>
  <div class="fx" data-lang="py"># 1. accumulate: add up as you go
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
# 5. best-so-far: the line with the biggest amount
best_item, best_amount = None, 0
for item, qty, price in order:
    if qty * price &gt; best_amount:
        best_item, best_amount = item, qty * price
print(subtotal, multi, first_drink, cheap, best_item, best_amount)</div>
  <div class="fx" data-lang="text">195 2 masala chai ['samosa'] cold coffee 90</div>
  <p>The subtotal accumulates to 195. Two lines (chai and samosa) have a quantity of 2 or more. The first drink found is masala chai, and the loop breaks there. The only line with a price under 25 is samosa. And the line with the biggest amount is cold coffee, at 90. Notice the starting values, which matter: 0 for sums and counts, an empty list for filters, and <code>None</code> for "not found yet". Starting a best-so-far at 0 fails if all the values could be negative; starting from the first item, or using <code>max</code>, avoids that.</p>
  <p>Because these shapes are so common, Python has built-in tools that perform each of them in one line, and they are also faster, because the looping happens in C rather than in Python's bytecode loop:</p>
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
  <p><code>sum(...)</code> accumulates, and gives 195. Counting is a sum of 1 for each matching line, giving 2. <code>any(...)</code> answers "is there at least one?" and stops at the first match (its partner <code>all(...)</code> answers "are they all?"). The square-bracket form is a <strong>list comprehension</strong>, a one-line filter that builds a new list. And <code>max(..., key=...)</code> is best-so-far, where <code>key</code> says what to compare, here each line's quantity times price; the small nameless function after <code>key=</code> is a <code>lambda</code>. The text inside <code>sum(...)</code> and <code>any(...)</code> is a <strong>generator expression</strong>, a lazy version of a comprehension. All of these are explained fully in <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a>, <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> and <a class="xref" data-note="py_functions">Functions</a>. Use the built-ins when the loop is a pure pattern; use a plain loop when the body does several things or has side effects, because then a loop is clearer.</p>

  <h2 id="pc-match"><span class="num">09</span>match and case</h2>
  <p>Imagine the till receives commands from a tablet app, and the commands come in different <em>shapes</em>: the word "open", a tuple like <code>("add", "samosa", 2)</code>, a dict like <code>{"pay": 200}</code>, a list of notes. An <code>if</code>/<code>elif</code> chain would have to check each value's type, check its length, and pull out the parts by hand, which gets long and error-prone. Python 3.10 added <strong>structural pattern matching</strong>, written with <code>match</code> and <code>case</code>. It is like an <code>if</code>/<code>elif</code> chain that checks the <em>shape</em> of data, not just its value, and pulls out the pieces into names in the same step. Each <code>case</code> line holds a <strong>pattern</strong>, a template the data must fit. Python tries the patterns from top to bottom and runs the first one that fits. Think of a post-office sorting counter: is this a parcel with a PIN code, a letter, or anything else? Each packet goes to the first slot it fits, and the clerk reads the PIN code off it at the same moment.</p>
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
  <p>Each command lands in the first case that fits it. "open" matches <code>"open" | "close"</code>, where <code>|</code> means "or". The tuple <code>("add", "samosa", 2)</code> matches <code>("add", str(item), int(q)) if q &gt; 0</code>: the pattern requires three items, the first equal to "add", the second a str (which gets the name <code>item</code>) and the third an int (which gets the name <code>q</code>). The <code>if q &gt; 0</code> part is a <strong>guard</strong>, an extra condition checked after the shape fits. The next command has the same shape but a quantity of 0, so its guard fails and Python moves on to <code>("add", _, _)</code>, which rejects it; <code>_</code> means "anything, and I don't need its value". The dict matches <code>{"pay": int(amount)}</code>, which needs a "pay" key holding an int (other keys would be allowed). The list matches <code>["note", *texts]</code>, where <code>*texts</code> collects all remaining items into a list. And 42 fits nothing until the final <code>case _:</code>, which matches anything and acts as the default. A tuple pattern matches a list of the same shape as well, but strings never match sequence patterns.</p>
  <p>There is one trap in <code>match</code> that catches nearly everyone. A plain name in a pattern does not compare against a variable of that name; it <em>captures</em>: it matches anything and binds the value to that name.</p>
  <div class="fx" data-lang="py">LIMIT = 150
subtotal = 70
match subtotal:
    case LIMIT:                       # NOT a comparison: captures into LIMIT
        print("matched! LIMIT is now", LIMIT)</div>
  <div class="fx" data-lang="text">matched! LIMIT is now 70</div>
  <p>The intention was "does subtotal equal LIMIT?", but <code>case LIMIT:</code> matched 70 and overwrote <code>LIMIT</code> with 70. To compare against a constant, use a literal (<code>case 150:</code>), a dotted name such as <code>case Rules.LIMIT:</code> (dotted names are compared, not captured), or a guard (<code>case x if x == LIMIT:</code>). Python will even refuse with a SyntaxError if such a catch-all capture is not the last case, because the cases after it could never run. Also remember that <code>match</code> has no "fall-through": exactly one case runs.</p>

  <h2 id="pc-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most damaging loop bug raises no error at all. The task is to remove every "samosa" from a list, and the obvious loop leaves one behind:</p>
  <div class="fx" data-lang="py">lines = ["samosa", "samosa", "chai", "samosa"]
for x in lines:
    if x == "samosa":
        lines.remove(x)               # changes the list under the loop's feet
print(lines)                          # we wanted ['chai']</div>
  <div class="fx" data-lang="text">['chai', 'samosa']</div>
  <p>To see why, you need to know how a <code>for</code> loop over a list works: it keeps a hidden position counter, 0, 1, 2 and so on, and in each round takes the item at that position. Removing an item shifts everything after it one place to the left, underneath the counter:</p>
  <table class="tbl"><caption>Trace: for x in lines, with lines.remove(x) inside</caption>
    <tr><th>Round</th><th>Position</th><th>lines at that moment</th><th>x</th><th>What happens</th></tr>
    <tr><td>1</td><td>0</td><td>[samosa, samosa, chai, samosa]</td><td>samosa</td><td>the first samosa is removed; everything shifts left</td></tr>
    <tr><td>2</td><td>1</td><td>[samosa, <b>chai</b>, samosa]</td><td>chai</td><td>kept; the samosa now at position 0 was never looked at</td></tr>
    <tr><td>3</td><td>2</td><td>[samosa, chai, <b>samosa</b>]</td><td>samosa</td><td><code>remove</code> deletes the <em>first</em> samosa, at position 0</td></tr>
    <tr><td>—</td><td>3</td><td>[chai, samosa]</td><td></td><td>position 3 is past the end; the loop stops</td></tr>
  </table>
  <p>The fix is never to change the list you are looping over. Either build a new list from the items you want to keep (the filter pattern), or loop over a copy while changing the original:</p>
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
  <p>Both give <code>['chai']</code>. Dictionaries protect you from the same mistake: changing a dict's size while looping over it raises an error, and the fix is to loop over a snapshot of its keys made with <code>list()</code>:</p>
  <div class="fx" data-lang="py">stock = {"chai": 0, "samosa": 4, "vada pav": 0}
try:
    for item in stock:
        if stock[item] == 0:
            del stock[item]           # changing a dict's size while looping
except RuntimeError as e:
    print("RuntimeError:", e)
stock = {"chai": 0, "samosa": 4, "vada pav": 0}
for item in list(stock):              # loop over a snapshot of the keys
    if stock[item] == 0:
        del stock[item]
print(stock)</div>
  <div class="fx" data-lang="text">RuntimeError: dictionary changed size during iteration
{'samosa': 4}</div>
  <p>Deleting a key during the loop raised "dictionary changed size during iteration". Looping over <code>list(stock)</code>, a separate list of the keys, lets the original dict be changed safely, leaving only the samosas that are in stock. (Changing the <em>value</em> of an existing key while looping is allowed; only adding or removing keys is not.)</p>
  <p>The second family of mistakes is <strong>off-by-one errors</strong>: loops that run one time too many or too few, usually because of a mix-up about whether an end point is included:</p>
  <div class="fx" data-lang="py">print(list(range(1, 10)))             # tables 1..9: table 10 is missing
print(list(range(1, 11)))             # stop is one past the last
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
  <p><code>range(1, 10)</code> stops at 9, so table 10 is forgotten; <code>range(1, 11)</code> is correct. Looping one position too far over a three-line order prints the three items and then fails with <code>IndexError</code>, because the valid positions are 0, 1 and 2. Looping over items directly, as <code>for</code> is designed to do, avoids most of these errors.</p>
  <p>The third mistake is an infinite loop caused by floats. From <a class="xref" data-note="py_values">Values, Types &amp; Variables</a> we know 0.1 cannot be stored exactly, so adding it ten times does not give exactly 1.0. A loop that waits for <code>x</code> to equal 1.0 therefore never stops; the demo below has a safety <code>break</code> so that it finishes:</p>
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
  <p>After ten additions <code>x</code> is 0.9999999999999999, not 1.0, and after that it jumps past 1.0 without ever equalling it, so the loop is still running at 13 steps. The fix is to count with an int and compute the float from it, as the last loop does, or to test with <code>&lt;</code> rather than <code>!=</code>.</p>
  <p>Finally, a surprise for people coming from other languages: a loop's variables are still there after the loop ends, holding their last values. Python does not create a separate space for names inside a loop (only functions do that, as <a class="xref" data-note="py_functions">Functions</a> explains):</p>
  <div class="fx" data-lang="py">for item, qty, price in order:
    pass
print(item, qty, price)               # the loop variables survive the loop</div>
  <div class="fx" data-lang="text">cold coffee 1 90</div>
  <p>After the loop, <code>item</code>, <code>qty</code> and <code>price</code> still hold the last line's values, so code further down that uses <code>item</code> by mistake silently gets "cold coffee". If the list had been empty, the names would never have been created, and using them would raise <code>NameError</code>.</p>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Decisions</h3>
  <ul>
    <li><code>if</code> / <code>elif</code> / <code>else</code>: conditions are tested top to bottom; only the first true branch runs; <code>else</code> runs if none did.</li>
    <li>Order tiers strictest first (<code>&gt;= 300</code> before <code>&gt;= 150</code>) or write full ranges (<code>150 &lt;= s &lt; 300</code>); a loose condition first creates dead code.</li>
    <li>Blocks are marked by a colon and 4-space indentation.</li>
    <li>Conditions use truthiness: <code>if order:</code> = not empty. Use <code>is not None</code> when 0 or empty is valid.</li>
    <li>Conditional expression: <code>a if cond else b</code>; only the chosen side is evaluated; two choices only.</li>
  </ul>
  <h3>Loops</h3>
  <ul>
    <li><code>while cond:</code> checks before every round (n rounds = n + 1 checks); the body must move toward making the condition false.</li>
    <li><code>for x in iterable:</code> one round per item; works on lists, tuples, strings, dicts (keys; <code>.items()</code> for pairs), sets, files, ranges.</li>
    <li>Unpack in the header: <code>for item, qty, price in order:</code>.</li>
    <li><code>range(start=0, stop, step=1)</code>: stop excluded; length is stop − start for step 1; lazy (no list in memory).</li>
    <li>Walrus: <code>while (n := len(q)) &gt; 1:</code> assigns and tests.</li>
  </ul>
  <h3>Jumps</h3>
  <table class="tbl">
    <tr><th>Statement</th><th>Effect</th></tr>
    <tr><td><code>break</code></td><td>leave the innermost loop now</td></tr>
    <tr><td><code>continue</code></td><td>skip the rest of this round; start the next</td></tr>
    <tr><td><code>pass</code></td><td>do nothing (placeholder block)</td></tr>
    <tr><td>loop <code>else:</code></td><td>runs if the loop ended without <code>break</code> (also after zero rounds)</td></tr>
  </table>
  <h3>Helpers and patterns</h3>
  <table class="tbl">
    <tr><th>Need</th><th>Tool</th></tr>
    <tr><td>position + item</td><td><code>enumerate(xs, start=1)</code></td></tr>
    <tr><td>lists side by side</td><td><code>zip(a, b)</code>; stops at shortest; <code>strict=True</code> to insist on equal lengths</td></tr>
    <tr><td>accumulate / count</td><td><code>sum(...)</code>, <code>sum(1 for x in xs if cond)</code></td></tr>
    <tr><td>find / any / all</td><td><code>next((x for x in xs if cond), None)</code>, <code>any(...)</code>, <code>all(...)</code></td></tr>
    <tr><td>filter</td><td><code>[x for x in xs if cond]</code></td></tr>
    <tr><td>best-so-far</td><td><code>max(xs, key=...)</code>, <code>min(...)</code></td></tr>
  </table>
  <ul>
    <li>Nested loops: inner body runs n × m times; reset per-table accumulators inside the outer loop.</li>
    <li><code>break</code> leaves only the inner loop; to leave both, <code>return</code> from a function.</li>
  </ul>
  <h3>match / case (3.10+)</h3>
  <div class="fx" data-lang="py">match cmd:
    case "open" | "close":              # literals, | = or
        ...
    case ("add", str(item), int(q)) if q &gt; 0:   # shape, types, guard
        ...
    case {"pay": int(amount)}:          # dict with a key (extra keys allowed)
        ...
    case ["note", *texts]:              # first item, then the rest
        ...
    case _:                             # default
        ...</div>
  <ul>
    <li>A bare name captures (matches anything); compare with literals, dotted names or guards.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Never add to or remove from a list while looping over it; build a new list or loop over a copy.</li>
    <li>Changing a dict's size while looping → <code>RuntimeError</code>; loop over <code>list(d)</code>.</li>
    <li><code>range(1, 10)</code> stops at 9; <code>range(len(xs) + 1)</code> → IndexError.</li>
    <li><code>while x != 1.0</code> with float steps may never stop; count with ints.</li>
    <li>Loop variables keep their last value after the loop.</li>
  </ul>

  <h2 id="pc-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python decide which branch of an if/elif/else runs?</summary><div class="qa-body">It evaluates the conditions from top to bottom, judges each by its truthiness, runs the block of the first one that is true and skips the rest; <code>else</code> runs only if none were true. Because only the first match runs, the order of conditions is part of the logic: <code>if s &gt;= 150 … elif s &gt;= 300 …</code> can never reach the second branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Python has no switch statement. What do you use instead?</summary><div class="qa-body">An <code>if</code>/<code>elif</code> chain for ranges and general conditions; a dict that maps keys to values or functions for simple dispatch (<code>handlers.get(cmd, default)()</code>); and since Python 3.10, <code>match</code>/<code>case</code>, which also matches the shape of data and extracts parts. Unlike C's switch, <code>match</code> has no fall-through: exactly one case runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the syntax of Python's conditional (ternary) expression?</summary><div class="qa-body"><code>a if condition else b</code>, with the condition in the middle, unlike C's <code>c ? a : b</code>. It is an expression, so it produces a value that can be assigned or passed, and only the chosen side is evaluated. For three or more cases, use <code>if</code>/<code>elif</code>/<code>else</code> rather than nesting it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>while</code> instead of <code>for</code>?</summary><div class="qa-body">When the number of rounds is not known in advance and depends on a condition: waiting until a job finishes, reading until input ends, repeating until a calculation converges, or processing a queue until it is empty. To go through a collection or a known count, use <code>for</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>break</code>, <code>continue</code> and <code>pass</code>?</summary><div class="qa-body"><code>break</code> leaves the innermost loop immediately. <code>continue</code> skips the rest of the current round and starts the next one. <code>pass</code> does nothing; it exists because Python does not allow an empty block. <code>break</code> and <code>continue</code> affect only the innermost loop that contains them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the <code>else</code> clause of a loop run?</summary><div class="qa-body">When the loop finishes without hitting <code>break</code>, including when it ran zero times. It is skipped after a <code>break</code>, and also when the loop is left by <code>return</code> or an exception. Its typical use is a search: <code>break</code> when the item is found, and the <code>else</code> handles "not found" without needing a flag variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>for i in range(3): pass</code> followed by <code>print(i)</code></summary><div class="qa-body"><code>2</code>. Loops do not create their own scope, so the loop variable keeps its last value after the loop. If the range had been empty, <code>i</code> would never have been assigned and <code>print(i)</code> would raise NameError (unless <code>i</code> existed earlier).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>range()</code> return? Is <code>range(10**12)</code> expensive?</summary><div class="qa-body">A <code>range</code> object, which is lazy and immutable, not a list. It stores only its start, stop and step, so <code>range(10**12)</code> is cheap to create, and <code>len</code>, indexing and <code>x in r</code> for integers are calculated arithmetically in constant time. Only converting it with <code>list(range(...))</code> uses memory for every number.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>for i in range(len(xs)): x = xs[i]</code> considered unpythonic?</summary><div class="qa-body">It is longer than necessary, invites off-by-one and indexing mistakes, and does not work on iterables that cannot be indexed, such as sets, files and generators. Loop over the items directly, use <code>enumerate(xs)</code> when you also need the position, and <code>zip</code> to walk several sequences together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>zip</code> do with inputs of different lengths?</summary><div class="qa-body">It stops at the shortest input and silently drops the remaining items of the longer ones. Pass <code>strict=True</code> (Python 3.10+) to get a ValueError instead, or use <code>itertools.zip_longest(..., fillvalue=...)</code> to pad the shorter inputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you remove items from a list while looping over it? How do you fix it?</summary><div class="qa-body">Items get skipped. The loop keeps an internal position, and each removal shifts the later items one place left underneath it, so the item that moves into the current position is never examined. Removing every "s" from <code>["s", "s", "c", "s"]</code> this way leaves <code>['c', 's']</code>. Fix it by building a new list (<code>[x for x in xs if x != "s"]</code>) or by looping over a copy (<code>for x in xs[:]</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you add or remove a dict key while looping over the dict?</summary><div class="qa-body">CPython raises <code>RuntimeError: dictionary changed size during iteration</code>. Loop over a snapshot instead, <code>for k in list(d):</code>, or build a new dict with a comprehension. Changing the values of existing keys during the loop is allowed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you break out of two nested loops at once?</summary><div class="qa-body">The cleanest way is to put the loops inside a function and <code>return</code>. Alternatives are a flag variable that the outer loop checks, or the loop-else idiom (<code>else: continue</code> after the inner loop, followed by <code>break</code>). Python has no labelled break, and using an exception for this is heavy-handed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a <code>for</code> loop work internally?</summary><div class="qa-body">It calls <code>iter(obj)</code> to get an iterator, then calls <code>next()</code> on it once per round and binds the result to the loop variable. When <code>next()</code> raises <code>StopIteration</code>, the loop ends and the <code>else</code> clause, if any, runs. That is why any object with an <code>__iter__</code> method works in a for loop, and why a generator can only be looped over once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A loop compares every item of list A (10,000 items) with every item of list B (10,000 items). How would you speed it up?</summary><div class="qa-body">The nested loop does 100 million comparisons, which is O(n × m). If the inner loop is only checking membership, build <code>set(B)</code> once and test <code>x in b_set</code>, making the whole job roughly O(n + m). More generally, move work out of the inner loop, use built-ins that loop in C, and for numeric data use numpy or pandas operations instead of Python loops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the walrus operator and when is it useful?</summary><div class="qa-body"><code>name := expr</code> (Python 3.8+) assigns a value and also returns it, so it can be used inside a condition. Typical uses are <code>while (chunk := f.read(4096)):</code>, <code>if (m := pattern.search(s)):</code>, and reusing a computed value in a comprehension filter. It needs brackets in most positions and should be used sparingly for readability.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In <code>match</code>/<code>case</code>, why does <code>case LIMIT:</code> match every value?</summary><div class="qa-body">A bare name in a pattern is a capture pattern: it always succeeds and binds the matched value to that name, overwriting <code>LIMIT</code>. To compare against a constant, use a literal, a dotted name such as <code>case Config.LIMIT:</code>, or a guard like <code>case x if x == LIMIT:</code>. Python rejects a catch-all capture that is not the last case.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>if items:</code> and <code>if items is not None:</code>?</summary><div class="qa-body"><code>if items:</code> is false for <code>None</code> and also for an empty container, 0 or <code>""</code>. <code>if items is not None:</code> excludes only None. Use the second when an empty list or 0 is a valid value that must still be processed. With numpy arrays and pandas objects, <code>if arr:</code> raises an error; use <code>arr.size</code>, <code>.empty</code>, <code>.any()</code> or <code>.all()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might <code>while x != 1.0: x += 0.1</code> never stop?</summary><div class="qa-body">0.1 cannot be stored exactly in binary, so after ten additions <code>x</code> is 0.9999999999999999, and the next addition jumps past 1.0 without ever equalling it. Drive the loop with an integer counter and compute the float from it, or use <code>&lt;</code> instead of <code>!=</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a list comprehension faster than an equivalent <code>for</code> loop with <code>append</code>?</summary><div class="qa-body">Usually yes, modestly: it avoids looking up and calling <code>list.append</code> on every round and uses a specialised bytecode loop. Built-ins like <code>sum</code> and <code>max</code> are faster still because their loop runs in C. When the body has several steps or side effects, a plain loop is clearer and readability should win.</div></details>
</main>
`
});
