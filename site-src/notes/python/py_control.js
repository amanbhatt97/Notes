// notes/python/py_control.js — Decisions & Loops
Object.assign(TOPIC_CONTENT, {
  "py_control": `<main>
<h1>Decisions &amp; Loops</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>Decisions &amp; Loops</span></div>
  <p class="lead">A program normally runs top to bottom, each line once. <strong>Control flow</strong> changes that: a <strong>decision</strong> (<code>if</code>) runs some lines only when a condition holds, and a <strong>loop</strong> (<code>while</code>, <code>for</code>) runs lines again and again. With these two ideas, the Chai Corner till stops being one hard-coded sum and becomes a program that bills any order and any number of tables. This note covers <code>if/elif/else</code>, the conditional expression, <code>while</code>, <code>for</code> over iterables, <code>range</code>, <code>break</code>/<code>continue</code>, the loop's <code>else</code> (traced), <code>enumerate</code> and <code>zip</code>, nested loops, the five loop patterns every program uses, <code>match</code>, and the classic loop traps, each traced step by step. Code here was run on Python 3.13.</p>

  <h2 id="pc-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="pc-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="230" y="8" width="200" height="36" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="31" text-anchor="middle" font-size="12">Python Basics: the Map</text>
<line x1="330" y1="44" x2="330" y2="80" stroke="currentColor" marker-end="url(#pc-a0)"/>
<rect x="15" y="82" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="100" y="103" text-anchor="middle" font-size="12">Values, Types &amp; Variables</text><text x="100" y="121" text-anchor="middle" class="tm" font-size="10">the raw material</text>
<line x1="185" y1="107" x2="243" y2="107" stroke="currentColor" marker-end="url(#pc-a0)"/>
<rect x="245" y="82" width="170" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="330" y="103" text-anchor="middle" font-size="12.5" font-weight="700">Decisions &amp; Loops</text><text x="330" y="121" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<line x1="415" y1="107" x2="473" y2="107" stroke="currentColor" marker-end="url(#pc-a0)"/>
<rect x="475" y="82" width="170" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="103" text-anchor="middle" font-size="12">Functions</text><text x="560" y="121" text-anchor="middle" class="tm" font-size="10">name and reuse</text>
<text x="330" y="160" text-anchor="middle" class="tm" font-size="10.5">for-loops lead on to Iterators &amp; Generators: what "iterable" really means</text>
</svg><figcaption>The second concept note of Python Basics: it turns fixed expressions into programs that choose and repeat.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_values">Values, Types &amp; Variables</a></b><span>We computed Asha's bill (195 → ₹184) as one expression of values, names and operators. Left open: the discount was a trick (<code>subtotal * 0.10 * eligible</code>, using True = 1), and every order needed its own hand-typed expression.</span></li>
    <li><b>This note adds: choosing and repeating</b><span><code>if</code> picks the discount rule; loops walk through any order line by line and through any number of tables. Result: all three tables billed by one block of code (₹184, ₹74, ₹52; day total ₹310).</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_functions">Functions</a></b><span>The billing block now works, but it is one long script: to bill a table from another place in the program we must copy it. Functions give the block a name. Later, <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> explains what a <code>for</code> loop does under the hood, and <a class="xref" data-note="py_ds">Data Structures</a> turns many loops into one-line comprehensions.</span></li>
  </ol>

  <h2 id="pc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>if / elif / else</b><span>Q: how does the till apply a discount only when the subtotal is ₹150+? → Run an indented block only when a condition is True; <code>elif</code> adds more rules, checked in order. Asha: rate 0.10, discount 19.5. But a whole <code>if</code> block just to pick one value is long…</span></li>
    <li><b>Conditional expression</b><span>Q: can a small choice fit inside one expression? → <code>rate = 0.10 if subtotal &gt;= 150 else 0.0</code>. But decisions run once; Ben buying chai until his money runs out needs repetition…</span></li>
    <li><b>while</b><span>Q: how do we repeat while something is true? → <code>while wallet &gt;= 30</code>: 3 cups, ₹10 left. But walking through the lines of an order with a counter is clumsy and easy to get wrong…</span></li>
    <li><b>for and range</b><span>Q: how do we do one step per item of a collection? → <code>for item, qty, price in order</code>: 60 → 105 → 195. <code>range</code> gives numbers to loop over. But sometimes we must stop early or skip a line…</span></li>
    <li><b>break, continue, loop-else</b><span>Q: how do we stop at the first match, skip a line, or know that nothing matched? → <code>break</code>, <code>continue</code>, and <code>else</code> on the loop ("no break happened"). But we also need line numbers and to walk several lists together…</span></li>
    <li><b>enumerate and zip</b><span>Q: how do we get positions, or pair up parallel lists? → <code>enumerate(order, start=1)</code>, <code>zip(items, qtys, prices)</code>. But the stall has three tables, each with its own lines…</span></li>
    <li><b>Nested loops</b><span>Q: how do we repeat a repetition? → A loop inside a loop: every table, every line: ₹184, ₹74, ₹52, day total ₹310. Many loops look alike; is there a small set of shapes?</span></li>
    <li><b>Loop patterns</b><span>Q: what are the standard jobs loops do? → Accumulate, count, find, filter, best-so-far, and the built-ins that replace them (<code>sum</code>, <code>any</code>, <code>max</code>). But when inputs come in different <em>shapes</em> (a command, a payment, a note), an if/elif chain gets messy…</span></li>
    <li><b>match</b><span>Q: how do we choose by the shape of data? → <code>match</code>/<code>case</code> patterns pull pieces out while checking. Finally: what goes wrong with loops in practice?</span></li>
    <li><b>Loop traps</b><span>Q: what bugs do loops cause? → Modifying a list while looping (traced), off-by-one, infinite loops, leaking loop variables. Then: the billing code works but is one long script → <a class="xref" data-note="py_functions">Functions</a>.</span></li>
  </ol>

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
          <li>Asha 195 → rate 0.10 → discount 19.5</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">while</div>
        <ul>
          <li>Repeats while the condition is True, checked before every round</li>
          <li>Wallet 100, chai 30 → 3 cups, ₹10 left</li>
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
          <li>Asha: 60 → 105 → 195</li>
          <li><code>enumerate(x, start=1)</code>, <code>zip(a, b)</code> (stops at shortest)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Jumping</div>
        <ul>
          <li><b>break</b>: leave the (innermost) loop now</li>
          <li><b>continue</b>: skip to the next round</li>
          <li><b>loop-else</b>: runs only if no break; read it as "nobreak"</li>
          <li>💡 search the bag: found → stop; every pocket empty → else</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Nested</b>: tables × lines → 184, 74, 52; day 310</li>
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
      <div class="rm-item rm-done" data-target="pc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pc-if"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">if / elif / else</span><span class="rm-sub">The discount rule</span></div></div>
      <div class="rm-item rm-done" data-target="pc-ternary"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Conditional Expression</span><span class="rm-sub">A choice in one line</span></div></div>
      <div class="rm-item rm-done" data-target="pc-while"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">while Loops</span><span class="rm-sub">Repeat while true</span></div></div>
      <div class="rm-item rm-done" data-target="pc-for"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">for Loops &amp; range</span><span class="rm-sub">One round per item</span></div></div>
      <div class="rm-item rm-done" data-target="pc-break"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">break, continue, loop-else</span><span class="rm-sub">Stop, skip, "nobreak"</span></div></div>
      <div class="rm-item rm-done" data-target="pc-enum"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">enumerate &amp; zip</span><span class="rm-sub">Positions and pairs</span></div></div>
      <div class="rm-item rm-done" data-target="pc-nested"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Nested Loops</span><span class="rm-sub">Every table, every line</span></div></div>
      <div class="rm-item rm-done" data-target="pc-patterns"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Loop Patterns</span><span class="rm-sub">Accumulate, count, find, filter</span></div></div>
      <div class="rm-item rm-done" data-target="pc-match"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">match / case</span><span class="rm-sub">Choosing by shape</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Loop Traps, Traced</span><span class="rm-sub">Skips, off-by-one, forever</span></div></div>
      <div class="rm-item rm-done" data-target="pc-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pc-if"><span class="num">01</span>Decisions: if / elif / else</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The previous note computed Asha's discount with a trick: <code>subtotal * 0.10 * eligible</code>, which works only because True counts as 1. A real till needs to say "<em>if</em> the subtotal is at least ₹150, take 10% off; otherwise nothing". How does a program run some lines only when a condition holds?</p>
  </div>
  <h3>The running example</h3>
  <p>Same stall as before. Menu: masala chai ₹30, samosa ₹15, vada pav ₹20, cold coffee ₹90. Rules: 10% off at ₹150 or more, then 5% GST, rounded to whole rupees. Three tables:</p>
  <table class="tbl out"><caption>Chai Corner's three orders, written as lines of (item, quantity, price)</caption>
    <tr><th>Table</th><th>Lines</th><th>Subtotal</th><th>Discount?</th><th>Bill</th></tr>
    <tr><td>Asha</td><td>("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)</td><td>195</td><td>yes, 19.5</td><td>₹184</td></tr>
    <tr><td>Ben</td><td>("masala chai", 1, 30), ("vada pav", 2, 20)</td><td>70</td><td>no</td><td>₹74</td></tr>
    <tr><td>Chen</td><td>("samosa", 2, 15), ("vada pav", 1, 20)</td><td>50</td><td>no</td><td>₹52</td></tr>
  </table>
  <p>Each order line is a <strong>tuple</strong> of three values (item, quantity, price), and an order is a list of such lines. You met both in <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>; <a class="xref" data-note="py_ds">Data Structures</a> covers them fully. By the end of this note, one block of code will produce the last column for all three tables.</p>
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
  <p><code>else:</code> gives a block that runs exactly when the condition was False. Ben's subtotal is 70:</p>
  <div class="fx" data-lang="py">subtotal = 70                        # Ben's table
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
    <tr><td>50 (Chen)</td><td>False</td><td>False</td><td>else</td><td>0.0</td><td>0</td></tr>
    <tr><td>70 (Ben)</td><td>False</td><td>False</td><td>else</td><td>0.0</td><td>0</td></tr>
    <tr><td>195 (Asha)</td><td>False</td><td>True</td><td>elif</td><td>0.10</td><td>19.5</td></tr>
    <tr><td>320 (catering)</td><td>True</td><td>(not checked)</td><td>if</td><td>0.15</td><td>48.0</td></tr>
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
  <p>A block can contain another <code>if</code>. At the counter: first "did the customer pay enough?", and only if so, "exactly, or is change due?". Asha pays ₹200 for ₹184:</p>
  <div class="fx" data-lang="py">total, paid = 184, 200               # Asha's bill and her note
if paid &gt;= total:
    if paid == total:
        print("exact amount, thank you")
    else:
        print("change:", paid - total)
else:
    print("short by", total - paid)</div>
  <div class="fx" data-lang="text">change: 16</div>
  <p>Nesting is right when the inner question only makes sense after the outer answer. When it is just "both must be true", one <code>if a and b:</code> is flatter and easier to read. More than two or three levels deep is a sign the code should be split into functions (next note).</p>
  <h3>Conditions use truthiness</h3>
  <p>The condition does not have to be a comparison. <code>if</code> asks for <code>bool(condition)</code>, so the truthiness rules from the previous note apply: empty or zero is False.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Conditional Expression.</b> A four-line <code>if/else</code> just to choose between 0.10 and 0.0 is heavy. Can a small choice fit inside an expression?</div>

  <h2 id="pc-ternary"><span class="num">02</span>The Conditional Expression</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>if/else</code> is a <em>statement</em>: it runs blocks, it does not produce a value. When all we want is "this value or that value", can we write the choice where the value is needed?</p>
  </div>
  <p>The <strong>conditional expression</strong> (often called the ternary operator) reads like English: <code>value_if_true if condition else value_if_false</code>. It is an expression, so it gives a value you can assign, print or pass along.</p>
  <div class="fx" data-lang="py">subtotal = 195
rate = 0.10 if subtotal &gt;= 150 else 0.0
size = "big order" if subtotal &gt;= 300 else "regular order"
print(rate, size)
qty = 0
print(qty if qty is not None else 1)   # keeps a real 0, unlike qty or 1</div>
  <div class="fx" data-lang="text">0.1 regular order
0</div>
  <p>The last line fixes a trap from the previous note: <code>qty or 1</code> would turn a genuine 0 into 1, because 0 is falsy. <code>qty if qty is not None else 1</code> only replaces a missing value.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: while Loops.</b> Decisions run once. Ben has ₹100 and wants to buy ₹30 chais until he can't afford another; that needs the same step repeated an unknown number of times.</div>

  <h2 id="pc-while"><span class="num">03</span>while Loops</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We do not know in advance how many chais Ben can buy; it depends on his money. We need "keep doing this as long as a condition is true". How do we repeat a block without copying it?</p>
  </div>
  <p>A <code>while</code> loop is an <code>if</code> that goes back to the top: check the condition; if True, run the block, then check again; when the condition is False, continue after the loop. Each pass through the block is called an <strong>iteration</strong> (a round).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Eating from a plate of samosas: "while there is a samosa on the plate, eat one". You look at the plate before every bite. Something in each round (eating) must move you toward stopping, or you would sit there forever.</p></div>
  <table class="tbl"><caption>Trace: while wallet &gt;= 30 (chai costs 30)</caption>
    <tr><th>Round</th><th>wallet before</th><th><code>wallet &gt;= 30</code>?</th><th>Action</th><th>wallet after</th><th>cups</th></tr>
    <tr><td>1</td><td>100</td><td>True</td><td>buy</td><td>70</td><td>1</td></tr>
    <tr><td>2</td><td>70</td><td>True</td><td>buy</td><td>40</td><td>2</td></tr>
    <tr><td>3</td><td>40</td><td>True</td><td>buy</td><td>10</td><td>3</td></tr>
    <tr><td>—</td><td>10</td><td><b>False</b></td><td>leave the loop</td><td>10</td><td>3</td></tr>
  </table>
  <div class="fx" data-lang="py">wallet = 100                         # Ben has 100 rupees; chai costs 30
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
  <p>Truthiness again: a non-empty list is True. So <code>while waiting:</code> means "while anyone is still in the queue". <code>.pop(0)</code> removes and returns the first item, which both serves the customer and moves the loop toward its end.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: for Loops.</b> Walking through Asha's three order lines with a counter (<code>i = 0; while i &lt; len(order): …; i += 1</code>) works but invites mistakes. Python has a loop made for "one round per item".</div>

  <h2 id="pc-for"><span class="num">04</span>for Loops and range</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An order has some number of lines, and we must do the same thing (quantity × price, add to the subtotal) for each. How do we say "for each line, do this" without counting positions by hand?</p>
  </div>
  <p>A <code>for</code> loop takes the items of a collection one at a time, binds a name to the current item, and runs the block. When the items run out, the loop ends. You never manage a counter.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cashier scanning a basket: pick up the next item, scan it, add it to the total, repeat until the basket is empty. The cashier never asks "which number item is this?".</p></div>
  <h3>Traced: Asha's subtotal</h3>
  <p>In <code>for item, qty, price in order:</code> each line is a 3-tuple, and the three names on the left take its three parts. This is the same <strong>unpacking</strong> as <code>chai, samosa = 30, 15</code>.</p>
  <table class="tbl"><caption>Trace: the for loop over Asha's order</caption>
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
  <p>The <code>print</code> uses an <strong>f-string</strong>: text starting with <code>f"</code>, where <code>{name}</code> is replaced by the value and <code>{item:12}</code> pads it to 12 characters so the columns line up (full formatting rules in <a class="xref" data-note="py_ds">Data Structures</a>). The same three lines of loop body would bill an order of 3 lines or 300.</p>
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
  <h3>Decisions inside a loop: every bill</h3>
  <p>Now the two halves of this note meet. The loop goes over the three tables' subtotals; inside, the conditional expression from section 02 picks the rate. One block bills everyone.</p>
  <div class="fx" data-lang="py">for name, subtotal in [("Asha", 195), ("Ben", 70), ("Chen", 50)]:
    rate = 0.10 if subtotal &gt;= 150 else 0.0
    after = subtotal - subtotal * rate
    tax = after * 0.05
    print(name, subtotal, after, round(tax, 3), round(after + tax))</div>
  <div class="fx" data-lang="text">Asha 195 175.5 8.775 184
Ben 70 70.0 3.5 74
Chen 50 50.0 2.5 52</div>
  <p>₹184, ₹74, ₹52: the same numbers we worked out by hand in <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>. (Chen's 52.5 → 52 is Python's half-to-even rounding, explained there.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>for target in iterable: B</code> takes each item of the iterable in turn, binds <code>target</code> to it (unpacking if the target is a tuple of names), and executes B. <code>range(start=0, stop, step=1)</code> yields start, start+step, … while below stop (above stop for negative steps); its length is ⌈(stop − start)/step⌉ when positive.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>range(1, 10)</code> stops at 9. Writing <code>for i in range(len(order))</code> then <code>order[i]</code> works but is the clumsy, error-prone way; loop over the items directly (and use <code>enumerate</code> when you need the position, section 06).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: break, continue and loop-else.</b> A for loop always visits every item. What if we want to stop at the first cold coffee, skip a sold-out samosa, or know that a search found nothing?</div>

  <h2 id="pc-break"><span class="num">05</span>break, continue and the Loop's else</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sometimes the rest of the items do not matter (we found what we wanted), sometimes one item must be skipped (sold out), and sometimes we need to act only if a search found nothing. How do we change the flow <em>inside</em> a loop?</p>
  </div>
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
  <p>The samosas have run out. Bill every other line:</p>
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
  <h3>Traced: the loop's else</h3>
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
  <table class="tbl"><caption>Trace: searching Asha's order for "samosa", then for "vada pav"</caption>
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
  <p>The outer <code>for target in …</code> just runs the search twice (a loop inside a loop; section 07). The <code>else</code> is lined up with the inner <code>for</code>, not with the <code>if</code>: it belongs to the loop.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>break</code> exits the innermost enclosing loop immediately. <code>continue</code> ends the current iteration and starts the next. A loop's <code>else</code> block runs when the loop ends normally (iterable exhausted, or while-condition False), including when there were zero iterations; it is skipped if the loop exited via <code>break</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>The loop's <code>else</code> does not mean "if the loop didn't run" and is not paired with the <code>if</code> inside. Indent it level with <code>for</code>. If a reader may be confused, a comment <code># no break</code> helps.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: enumerate and zip.</b> The printed bill should number its lines (1., 2., 3.), and sometimes the data arrives as three separate lists (items, quantities, prices). How do we get positions, and walk several lists together?</div>

  <h2 id="pc-enum"><span class="num">06</span>enumerate and zip</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A for loop gives the items but not their positions. And if items, quantities and prices are in three parallel lists, one loop variable is not enough. How do we get both item and position, or items from several lists at once?</p>
  </div>
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
  <p>The second line is the trap: when the lists have different lengths, <code>zip</code> silently stops at the shortest one, and the cold coffee vanishes from the bill. Since Python 3.10, <code>strict=True</code> turns that silent loss into an error.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Nested Loops.</b> One loop bills one order. The stall has three tables, each with its own list of lines. That is a repetition (every line) inside a repetition (every table).</div>

  <h2 id="pc-nested"><span class="num">07</span>Nested Loops</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can loop over one order's lines, and we can loop over a list of subtotals. But to go from raw orders to all three bills, we must loop over the tables and, for each table, loop over its lines. How does a loop inside a loop run?</p>
  </div>
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
  <table class="tbl"><caption>Trace: outer round = table, inner rounds = its lines</caption>
    <tr><th>Outer round</th><th>Inner rounds (qty × price, subtotal)</th><th>subtotal</th><th>rate</th><th>total</th><th>day_total</th></tr>
    <tr><td>Asha</td><td>60 → 60; 45 → 105; 90 → 195</td><td>195</td><td>0.10</td><td>184</td><td>184</td></tr>
    <tr><td>Ben</td><td>30 → 30; 40 → 70</td><td>70</td><td>0.0</td><td>74</td><td>258</td></tr>
    <tr><td>Chen</td><td>30 → 30; 20 → 50</td><td>50</td><td>0.0</td><td>52</td><td>310</td></tr>
  </table>
  <p>Notice where each line sits. <code>subtotal = 0</code> is <em>inside</em> the outer loop but <em>before</em> the inner one, so it restarts for every table. <code>day_total = 0</code> is before both loops, so it keeps growing. Put <code>subtotal = 0</code> before the outer loop and Ben's bill would include Asha's food.</p>
  <h3>break leaves only one loop</h3>
  <p>Which tables ordered vada pav? <code>break</code> stops the inner search as soon as one is found, but the outer loop carries on with the next table.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Loop Patterns.</b> We have now written many loops: summing, searching, skipping. Are they all different, or do a few standard shapes cover almost every loop you will write?</div>

  <h2 id="pc-patterns"><span class="num">08</span>Common Loop Patterns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each loop so far was written from scratch. Experienced programmers recognise a handful of loop shapes and write them without thinking. Which shapes are they, and does Python have shortcuts for them?</p>
  </div>
  <p>Almost every loop over a collection is one of five patterns. Each has the same skeleton: <strong>set up</strong> a result before the loop, <strong>update</strong> it inside, <strong>use</strong> it after. All five on Asha's order:</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Question</th><th>Set up</th><th>Update in the loop</th><th>Asha's order</th></tr>
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
  <p>Because these shapes are so common, Python has built-ins that do them in one line. They use features from later notes (a generator expression inside <code>sum()</code>, a list comprehension in <code>[...]</code>, a <code>lambda</code>), so read them now as a preview; <a class="xref" data-note="py_ds">Data Structures</a> (comprehensions), <a class="xref" data-note="py_functions">Functions</a> (lambda) and <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> explain them.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: match / case.</b> The till does not only receive order lines. It receives different <em>kinds</em> of input: "open", ("add", item, qty), {"pay": 200}, a list of notes. Choosing by the shape of data with if/elif quickly becomes messy.</div>

  <h2 id="pc-match"><span class="num">09</span>match / case: Choosing by Shape</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An if/elif chain compares values. But the till's commands differ in <em>shape</em>: a word, a 3-tuple starting with "add", a dict with a "pay" key. Checking the shape and pulling out the pieces by hand needs many lines per case. Is there a tidier way?</p>
  </div>
  <p><strong>match/case</strong> (Python 3.10+) is a smarter <code>if/elif</code>. It checks the <em>shape</em> of data, not only its value: "is this a tuple of three items starting with 'add'?", "is this a dict with a 'pay' key?". It also pulls pieces out into names in the same step. Each <code>case</code> is a <strong>pattern</strong>, a template the data must fit. The first pattern that fits wins. <code>_</code> fits anything, so it is the default.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Loop Traps, Traced.</b> We can now choose and repeat in every way the till needs. What goes wrong when loops meet real data?</div>

  <h2 id="pc-traps"><span class="num">10</span>Loop Traps, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Loops are where beginners' programs most often go silently wrong: an item skipped, one round too many, a program that never ends. What are the classic loop bugs, and what exactly happens in each?</p>
  </div>
  <h3>Trap 1: changing a list while looping over it</h3>
  <p>The samosas run out, so we remove every "samosa" from a list of lines. The obvious code leaves one behind:</p>
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
  <h3>Trap 2: off-by-one</h3>
  <p>The stall has tables 1 to 10. <code>range(1, 10)</code> forgets table 10, because stop is excluded. And looping one position too far raises <code>IndexError</code> (positions of a 3-item list are 0, 1, 2).</p>
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
  <h3>Trap 3: the loop that never ends</h3>
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
  <h3>Trap 4: loop variables outlive the loop</h3>
  <div class="fx" data-lang="py">for item, qty, price in order:
    pass
print(item, qty, price)               # the loop variables survive the loop</div>
  <div class="fx" data-lang="text">cold coffee 1 90</div>
  <p>Python has no separate scope for a loop's block: after the loop, <code>item</code>, <code>qty</code> and <code>price</code> still hold the last line's values. Code that later uses <code>item</code> by mistake will silently get "cold coffee". (Scope is explained in <a class="xref" data-note="py_functions">Functions</a>.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>off-by-one error</strong> is a loop that runs one time too many or too few, usually from an inclusive/exclusive boundary mix-up. An <strong>infinite loop</strong> is one whose exit condition never becomes true.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>The list-mutation bug raises no error, so it is easy to ship. Rule: inside <code>for x in lst</code>, never <code>lst.remove</code>, <code>lst.insert</code> or <code>lst.append</code>. (Changing a dict's size while looping over it is so dangerous that Python raises <code>RuntimeError</code>.)</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Decisions, three kinds of loops, jumps, helpers, patterns, match and traps: one picture and one table should hold them together.</div>

  <h2 id="pc-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Are these ten topics ten separate tools, or a few ideas combined in different ways?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="pc-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="240" y="8" width="200" height="44" rx="7" class="fb sb"/><text x="340" y="27" text-anchor="middle" font-size="12" font-weight="700">a condition (truthiness)</text><text x="340" y="43" text-anchor="middle" class="tm" font-size="10">subtotal &gt;= 150 → True</text>
<line x1="290" y1="52" x2="140" y2="86" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="390" y1="52" x2="540" y2="86" stroke="currentColor" marker-end="url(#pc-a9)"/>
<rect x="30" y="88" width="220" height="44" rx="7" class="ft st"/><text x="140" y="107" text-anchor="middle" font-size="12" font-weight="700">checked once: if / elif / else</text><text x="140" y="123" text-anchor="middle" class="tm" font-size="10">→ conditional expression · match</text>
<rect x="430" y="88" width="220" height="44" rx="7" class="ft st"/><text x="540" y="107" text-anchor="middle" font-size="12" font-weight="700">checked every round: while</text><text x="540" y="123" text-anchor="middle" class="tm" font-size="10">wallet 100 → 3 cups, ₹10 left</text>
<line x1="540" y1="132" x2="540" y2="166" stroke="currentColor" marker-end="url(#pc-a9)"/>
<rect x="430" y="168" width="220" height="44" rx="7" class="ft st"/><text x="540" y="187" text-anchor="middle" font-size="12" font-weight="700">for over an iterable</text><text x="540" y="203" text-anchor="middle" class="tm" font-size="10">"while items remain": 60 → 105 → 195</text>
<line x1="430" y1="190" x2="372" y2="190" stroke="currentColor" marker-end="url(#pc-a9)"/>
<rect x="160" y="168" width="210" height="44" rx="7" class="fg sg"/><text x="265" y="187" text-anchor="middle" font-size="12" font-weight="700">break · continue · else</text><text x="265" y="203" text-anchor="middle" class="tm" font-size="10">enumerate · zip · nesting</text>
<line x1="140" y1="132" x2="200" y2="166" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pc-a9)"/>
<line x1="265" y1="212" x2="265" y2="246" stroke="currentColor" marker-end="url(#pc-a9)"/><line x1="540" y1="212" x2="420" y2="246" stroke="currentColor" marker-end="url(#pc-a9)"/>
<rect x="150" y="248" width="380" height="44" rx="7" class="fg sg"/><text x="340" y="267" text-anchor="middle" font-size="12" font-weight="700">loop patterns: accumulate · count · find · filter · best</text><text x="340" y="283" text-anchor="middle" class="tm" font-size="10">every table billed: 184 + 74 + 52 = 310</text>
</svg><figcaption>One idea, a condition, used two ways: checked once (decisions) or checked again and again (loops). A for loop is a while loop whose condition is "items remain". Jumps and helpers shape the rounds; patterns are the jobs the rounds do.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Chai Corner</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>if / elif / else</td><td>a condition (bool)</td><td>which block runs?</td><td>195 → rate 0.10, discount 19.5</td><td>actions, 3+ cases</td></tr>
    <tr><td>Conditional expression</td><td>if/else, as a value</td><td>which of two values?</td><td><code>0.10 if 195 &gt;= 150 else 0.0</code></td><td>a two-way value choice</td></tr>
    <tr><td>while</td><td>a condition, re-checked</td><td>repeat until?</td><td>100 → 70 → 40 → 10: 3 cups</td><td>unknown number of rounds</td></tr>
    <tr><td>for</td><td>an iterable</td><td>once per item?</td><td>60 → 105 → 195</td><td>walking a collection</td></tr>
    <tr><td>range</td><td>start, stop, step</td><td>which numbers?</td><td>range(1, 4) → tables 1, 2, 3</td><td>counting, positions</td></tr>
    <tr><td>break / continue</td><td>an if inside a loop</td><td>stop early / skip?</td><td>first over ₹50: cold coffee; skip samosa → 150</td><td>search; filters</td></tr>
    <tr><td>loop-else</td><td>break</td><td>did the search fail?</td><td>"vada pav not in this order"</td><td>search without a flag</td></tr>
    <tr><td>enumerate / zip</td><td>for</td><td>position? parallel lists?</td><td>1. masala chai 60 …</td><td>numbering; pairing</td></tr>
    <tr><td>Nested loops</td><td>for inside for</td><td>repeat a repetition?</td><td>184, 74, 52; day 310</td><td>tables × lines</td></tr>
    <tr><td>Loop patterns</td><td>for + if + a result</td><td>total, count, first, which, biggest?</td><td>195, 2, masala chai, [samosa], cold coffee</td><td>almost every loop</td></tr>
    <tr><td>match / case</td><td>if/elif + unpacking</td><td>which shape is this?</td><td>("add", "samosa", 2) → item, q</td><td>commands, parsed data</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>control flow is a condition checked either once (a decision) or repeatedly (a loop).</strong> A <code>for</code> loop is a <code>while</code> loop that checks "are there items left?"; <code>break</code>, <code>continue</code> and <code>else</code> are extra exits; patterns are what you compute while going round.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="py_functions">Functions</a>: the billing code works for every table, but it is one long script. To bill a single table from anywhere in the program, we must give that block a name.</div>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Chai Corner (chai 30, samosa 15, vada pav 20, cold coffee 90; 10% off at ₹150+, then 5% GST, round). Orders as lists of (item, qty, price): Asha 195 → ₹184, Ben 70 → ₹74, Chen 50 → ₹52.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on Chai Corner</th><th>Weakness → next</th></tr>
    <tr><td>if / elif / else</td><td>run lines only when…?</td><td>195 ≥ 150 → 10%</td><td>heavy for one value</td></tr>
    <tr><td>Conditional expr.</td><td>choose a value inline?</td><td><code>0.10 if s &gt;= 150 else 0.0</code></td><td>runs once</td></tr>
    <tr><td>while</td><td>repeat while true?</td><td>wallet 100 → 3 cups, ₹10 left</td><td>counters for collections are clumsy</td></tr>
    <tr><td>for, range</td><td>once per item?</td><td>60 → 105 → 195</td><td>can't stop/skip</td></tr>
    <tr><td>break, continue, else</td><td>stop, skip, not found?</td><td>cold coffee first over ₹50; skip samosa → 150</td><td>need positions, parallel lists</td></tr>
    <tr><td>enumerate, zip</td><td>position? pairs?</td><td>1. masala chai 60</td><td>many tables</td></tr>
    <tr><td>Nested loops</td><td>repeat a repetition?</td><td>184, 74, 52 → 310</td><td>which loop shapes recur?</td></tr>
    <tr><td>Patterns</td><td>standard loop jobs?</td><td>195, 2, masala chai, [samosa], cold coffee 90</td><td>inputs of different shapes</td></tr>
    <tr><td>match</td><td>choose by shape?</td><td>("add", "samosa", 2) → add 2 x samosa</td><td>what breaks?</td></tr>
    <tr><td>Traps</td><td>common loop bugs?</td><td>remove-while-looping leaves [chai, samosa]</td><td>long script → <a class="xref" data-note="py_functions">Functions</a></td></tr>
  </table>
  <h3>Syntax and rules</h3>
  <table class="tbl">
    <tr><th>Construct</th><th>Form</th><th>Rule</th></tr>
    <tr><td>Decision</td><td><code>if c1: … elif c2: … else: …</code></td><td>first truthy branch only; order matters</td></tr>
    <tr><td>Conditional expression</td><td><code>x if c else y</code></td><td>only one of x, y evaluated</td></tr>
    <tr><td>while</td><td><code>while c: …</code></td><td>c checked before every round; n rounds = n + 1 checks</td></tr>
    <tr><td>for</td><td><code>for a, b in pairs: …</code></td><td>one round per item; unpacks tuples</td></tr>
    <tr><td>range</td><td><code>range(start=0, stop, step=1)</code></td><td>stop excluded; with step 1 the length is stop − start</td></tr>
    <tr><td>Loop else</td><td><code>for …: … else: …</code></td><td>runs if no break (also for 0 rounds)</td></tr>
    <tr><td>enumerate / zip</td><td><code>enumerate(x, start=1)</code>, <code>zip(a, b, strict=True)</code></td><td>zip stops at shortest unless strict</td></tr>
    <tr><td>Nested cost</td><td>outer n, inner m</td><td>inner body runs n × m times</td></tr>
    <tr><td>match</td><td><code>case ("add", str(i), int(q)) if q &gt; 0:</code></td><td>first fitting pattern + guard; bare name = capture</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>for</b><p>Walking any collection or a fixed count of numbers.</p><small>Not for "until something happens"</small></div>
    <div><b>while</b><p>Unknown number of rounds: until money runs out, queue empties, input ends.</p><small>Make every round move toward stopping</small></div>
    <div><b>Built-ins</b><p><code>sum</code>, <code>any</code>, <code>all</code>, <code>max(key=)</code>, comprehensions for the five patterns.</p><small>Write the loop when the body is complex</small></div>
    <div><b>match</b><p>Inputs with different shapes: commands, parsed JSON, tokens.</p><small>Plain if/elif for value ranges</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Loose condition first in an elif chain; wrong indentation; <code>range(1, 10)</code> misses 10; zip silently drops extras; removing from a list while looping over it; <code>while x != 1.0</code> with floats; accumulator reset in the wrong loop; <code>break</code> leaves only the inner loop; loop-else is about break, not about the if; <code>case NAME:</code> captures.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>list(range(2, 11, 4))</code>?</td><td><code>[2, 6, 10]</code></td></tr>
    <tr><td>With tiers <code>if s &gt;= 150 … elif s &gt;= 300 …</code>, what rate does 320 get?</td><td>The ≥ 150 rate (10%); the ≥ 300 branch is unreachable</td></tr>
    <tr><td>Wallet 100, chai 30, <code>while wallet &gt;= 30</code>: rounds and condition checks?</td><td>3 rounds, 4 checks, ₹10 left</td></tr>
    <tr><td><code>for x in [1, 2]: pass</code> then <code>else: print("A")</code>: printed?</td><td>Yes, "A" (no break happened)</td></tr>
    <tr><td><code>list(zip("ab", [1, 2, 3]))</code>?</td><td><code>[('a', 1), ('b', 2)]</code></td></tr>
  </table>

  <h2 id="pc-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python decide which branch of an if/elif/else runs?</summary><div class="qa-body">It evaluates the conditions top to bottom, takes the truthiness of each, runs the block of the first True one and skips the rest; <code>else</code> runs if none was True. So the order of conditions is part of the logic: put stricter tiers first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>while</code> instead of <code>for</code>?</summary><div class="qa-body">When the number of rounds is not known in advance and depends on a condition: until money runs out, until a queue is empty, until the user types "quit", until an algorithm converges. Use <code>for</code> whenever you are walking a collection or a known range.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the <code>else</code> of a <code>for</code> loop run?</summary><div class="qa-body">Only when the loop ends without <code>break</code> (also when the iterable is empty). Typical use: search — <code>break</code> when found, <code>else</code> handles "not found" without a flag variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>break</code> and <code>continue</code>?</summary><div class="qa-body"><code>break</code> leaves the innermost loop entirely; <code>continue</code> skips the rest of the current round and goes to the next item. Both affect only the innermost loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>zip</code> do with lists of different lengths?</summary><div class="qa-body">It stops at the shortest, silently dropping the extra items. In Python 3.10+, <code>zip(..., strict=True)</code> raises ValueError instead. <code>itertools.zip_longest</code> pads the shorter ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>for i in range(len(xs)): x = xs[i]</code> considered unpythonic?</summary><div class="qa-body">It is longer and invites off-by-one and index mistakes. Loop over the items directly (<code>for x in xs</code>), and use <code>enumerate(xs)</code> when you also need the position, or <code>zip</code> to walk several lists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you remove items from a list while looping over it?</summary><div class="qa-body">Items are skipped, because removing shifts later items left while the loop's position counter keeps going. ["samosa", "samosa", "chai", "samosa"] with remove-every-samosa ends as ['chai', 'samosa']. Build a new list, or loop over a copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might <code>while x != 1.0: x += 0.1</code> never stop?</summary><div class="qa-body">0.1 has no exact binary form, so after ten additions x is 0.9999999999999999, not 1.0, and it then jumps past 1.0. Loop with an int counter, or compare with <code>&lt;</code>/<code>math.isclose</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In match/case, why does <code>case LIMIT:</code> match everything?</summary><div class="qa-body">A bare name in a pattern is a capture pattern: it binds the subject to that name and always succeeds. To compare with a constant, use a dotted name (<code>Rules.LIMIT</code>), a literal, or a guard (<code>case x if x == LIMIT</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A nested loop runs 1,000 outer × 1,000 inner. How many times does the inner body run, and how can you avoid it?</summary><div class="qa-body">1,000,000 times. Often the inner loop is a search ("is this id in the other list?"); putting the other list in a set or dict turns each search into an O(1) lookup, so the whole thing runs about 1,000 times.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is a for loop related to a while loop?</summary><div class="qa-body">A for loop is a while loop whose condition is "are there items left?": it asks the iterable for the next item each round and stops when there is none (the details, <code>iter()</code>/<code>next()</code>/<code>StopIteration</code>, are in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>). Both rest on the same idea as <code>if</code>: a condition, but re-checked.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did we need loops after the previous note's "bill as one expression"?</summary><div class="qa-body">Values and operators compute one fixed bill: the order (2 chai, 3 samosa, 1 coffee) was typed into the expression. A loop does the same step for every line of <em>any</em> order and for every table, so one block bills Asha, Ben and Chen (₹184, ₹74, ₹52).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip functions and keep everything as one script with loops?</summary><div class="qa-body">To bill one table from somewhere else (a refund screen, a daily report) you must copy the loop, and a later rule change (GST 5% → 12%) must then be fixed in every copy; missing one gives inconsistent bills. Naming the block once as a function fixes that: <a class="xref" data-note="py_functions">Functions</a>.</div></details>
</main>
`
});
