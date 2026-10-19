// notes/python/py_fundamentals.js — Python Basics: the Map
Object.assign(TOPIC_CONTENT, {
  "py_fundamentals": `<main>
<h1>Python Basics: the Map</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics: the Map</span></div>
  <p class="lead">If you are learning Python for the first time, the basics can look like a pile of unrelated rules: types, variables, operators, if, for, while, functions, scope. They are not unrelated. Every program is built in four layers, and each layer exists because the one below it cannot do something you need: <strong>values</strong> (the data) → <strong>names</strong> (to keep and reuse values) → <strong>decisions and repetition</strong> (to choose and repeat) → <strong>functions</strong> (to name and reuse whole steps). This map shows the layers, the three concept notes that teach them, the order to read them in, and the one running example they all share: the bill at Chai Corner, a small chai stall. Code here was run on Python 3.13.</p>

  <h2 id="pf-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 250" width="680">
<defs><marker id="pf-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="240" y="8" width="200" height="44" rx="8" class="fg sg" stroke-width="3"/><text x="340" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Python Basics: the Map</text><text x="340" y="44" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<line x1="290" y1="52" x2="110" y2="84" stroke="currentColor" marker-end="url(#pf-a0)"/><line x1="340" y1="52" x2="340" y2="84" stroke="currentColor" marker-end="url(#pf-a0)"/><line x1="390" y1="52" x2="570" y2="84" stroke="currentColor" marker-end="url(#pf-a0)"/>
<rect x="20" y="86" width="180" height="44" rx="8" class="fb sb"/><text x="110" y="105" text-anchor="middle" font-size="12">Values, Types &amp; Variables</text><text x="110" y="121" text-anchor="middle" class="tm" font-size="10">values + names</text>
<line x1="200" y1="108" x2="248" y2="108" stroke="currentColor" marker-end="url(#pf-a0)"/>
<rect x="250" y="86" width="180" height="44" rx="8" class="fb sb"/><text x="340" y="105" text-anchor="middle" font-size="12">Decisions &amp; Loops</text><text x="340" y="121" text-anchor="middle" class="tm" font-size="10">choose + repeat</text>
<line x1="430" y1="108" x2="478" y2="108" stroke="currentColor" marker-end="url(#pf-a0)"/>
<rect x="480" y="86" width="180" height="44" rx="8" class="fb sb"/><text x="570" y="105" text-anchor="middle" font-size="12">Functions</text><text x="570" y="121" text-anchor="middle" class="tm" font-size="10">name + reuse</text>
<line x1="570" y1="130" x2="570" y2="160" stroke="currentColor" marker-end="url(#pf-a0)"/>
<rect x="20" y="162" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="120" y="184" text-anchor="middle" font-size="11">Data Structures</text>
<rect x="240" y="162" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="184" text-anchor="middle" font-size="11">Exceptions, Files &amp; Packages</text>
<rect x="460" y="162" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="184" text-anchor="middle" font-size="11">OOP</text>
<rect x="20" y="208" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="120" y="230" text-anchor="middle" font-size="11">Iterators &amp; Generators</text>
<rect x="240" y="208" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="230" text-anchor="middle" font-size="11">Decorators</text>
<rect x="460" y="208" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="230" text-anchor="middle" font-size="11">Context Managers</text>
</svg><figcaption>This map opens the Python track. Its three concept notes form one chain; everything below them builds on all three.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: nothing</b><span>This is the first note of the Python track. You only need to be able to run <code>python3</code> (section 05 shows how). No earlier programming is assumed.</span></li>
    <li><b>This note adds: the map</b><span>How a program is built in four layers, which note teaches each layer, the order to read them, and the shared running example (three orders at Chai Corner) that every note computes on.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_values">Values, Types &amp; Variables</a></b><span>Then <a class="xref" data-note="py_control">Decisions &amp; Loops</a> and <a class="xref" data-note="py_functions">Functions</a>. After the basics: <a class="xref" data-note="py_ds">Data Structures</a>, <a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a>, <a class="xref" data-note="py_oop">OOP</a>, <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>, <a class="xref" data-note="py_decorators">Decorators</a> and <a class="xref" data-note="py_context">Context Managers</a>.</span></li>
  </ol>

  <h2 id="pf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole of Python Basics as one chain. Each concept answers the question above it; its weakness raises the next question. The note that teaches it is in brackets.</p>
  <ol class="story">
    <li><b>Values and types</b><span>Q: how does a computer hold "₹30" or "samosa"? → As objects with a type: <code>30</code> (int), <code>"samosa"</code> (str), <code>True</code> (bool), <code>None</code>. The type decides what you can do: <code>30 * 3</code> is 90 but <code>"30" * 3</code> is "303030". But a value typed once is lost after its line… (<a class="xref" data-note="py_values">Values</a>)</span></li>
    <li><b>Names (variables)</b><span>Q: how do we keep a value and reuse it? → <code>price_chai = 30</code> sticks a label on the object. Labels, not boxes: two names can share one list, so a change through one shows through the other. (<a class="xref" data-note="py_values">Values</a>)</span></li>
    <li><b>Mutability and conversion</b><span>Q: which objects can change, and how do we get the right type? → Lists change in place, ints and strings never do; <code>int("2")</code> converts, with traps (<code>int("3.5")</code>, 0.1 + 0.2, <code>round(52.5) = 52</code>). (<a class="xref" data-note="py_values">Values</a>)</span></li>
    <li><b>Operators and expressions</b><span>Q: how do we compute new values? → <code>2 * 30 + 3 * 15 + 1 * 90</code> = 195; comparisons give bools; <code>and</code>/<code>or</code> stop early. The whole bill is one expression: ₹184. But it cannot choose a discount honestly, and every order needs a new expression… (<a class="xref" data-note="py_values">Values</a>)</span></li>
    <li><b>Decisions</b><span>Q: how does a program run lines only when a rule holds? → <code>if subtotal &gt;= 150:</code> … <code>else:</code> …. But one decision still handles only one fixed order… (<a class="xref" data-note="py_control">Decisions &amp; Loops</a>)</span></li>
    <li><b>Loops</b><span>Q: how do we do the same step for every line and every table? → <code>for item, qty, price in order</code>: 60 → 105 → 195; a loop over tables bills everyone: ₹184, ₹74, ₹52. But the billing code is one long script; using it elsewhere means copying it… (<a class="xref" data-note="py_control">Decisions &amp; Loops</a>)</span></li>
    <li><b>Functions</b><span>Q: how do we write a step once and use it anywhere? → <code>def bill(lines): … return …</code>; <code>bill(asha)</code> = 184. Parameters bring inputs, return gives the answer, scope keeps names private. (<a class="xref" data-note="py_functions">Functions</a>)</span></li>
    <li><b>Functions as values</b><span>Q: how can one <code>bill</code> work with any discount rule? → Functions are objects: pass a rule in, return a new function, wrap one in another. This opens the advanced notes. (<a class="xref" data-note="py_functions">Functions</a> → <a class="xref" data-note="py_decorators">Decorators</a>)</span></li>
    <li><b>Beyond the basics</b><span>Q: how do we organise many values, handle bad input and files, and model things like an Order? → <a class="xref" data-note="py_ds">Data Structures</a>, <a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a>, <a class="xref" data-note="py_oop">OOP</a>.</span></li>
  </ol>

  <h2 id="pf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Python Basics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Layer 1: values</div>
        <ul>
          <li>Every value is an <b>object</b>: type + identity + value</li>
          <li><b>int</b>, <b>float</b>, <b>bool</b>, <b>str</b>, <b>None</b></li>
          <li>Operators build new values: 2×30 + 3×15 + 90 = 195</li>
          <li>⚠ 0.1 + 0.2 ≠ 0.3; <code>round(52.5) = 52</code>; <code>-7 // 2 = -4</code></li>
          <li>Note: <a class="xref" data-note="py_values">Values, Types &amp; Variables</a></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Layer 2: names</div>
        <ul>
          <li><code>price = 30</code>: a label on an object, not a box</li>
          <li><code>b = a</code> shares, never copies</li>
          <li>Mutable (list, dict, set) vs immutable (int, str, tuple)</li>
          <li><code>==</code> same value, <code>is</code> same object</li>
          <li>Note: <a class="xref" data-note="py_values">Values, Types &amp; Variables</a></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Layer 3: choose &amp; repeat</div>
        <ul>
          <li><code>if / elif / else</code>: first True branch runs</li>
          <li><code>while</code>: repeat while true; <code>for</code>: once per item</li>
          <li><code>break</code>, <code>continue</code>, loop-<code>else</code>; <code>enumerate</code>, <code>zip</code></li>
          <li>Patterns: accumulate, count, find, filter, best-so-far</li>
          <li>Note: <a class="xref" data-note="py_control">Decisions &amp; Loops</a></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Layer 4: functions</div>
        <ul>
          <li><code>def</code> names a block; <code>return</code> gives a value (else None)</li>
          <li>Parameters: positional, keyword, defaults, *args, **kwargs</li>
          <li>Scope LEGB; closures; recursion; lambda</li>
          <li>Functions are values → decorators</li>
          <li>Note: <a class="xref" data-note="py_functions">Functions</a></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The running example</div>
        <ul>
          <li>Chai Corner: chai 30, samosa 15, vada pav 20, cold coffee 90</li>
          <li>Rules: 10% off at ₹150+, then 5% GST, round to rupees</li>
          <li>Asha 195 → ₹184 · Ben 70 → ₹74 · Chen 50 → ₹52</li>
          <li>Day total ₹310</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How to study</div>
        <ul>
          <li>Read in order: Values → Decisions &amp; Loops → Functions</li>
          <li>Predict every output before reading it</li>
          <li>Type and run the code; change one number</li>
          <li>Read tracebacks from the bottom line up</li>
          <li>Use each note's Revision Sheet to revise</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pf-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The basics as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pf-bill"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Bill for the Whole Group</span><span class="rm-sub">Chai Corner's three orders</span></div></div>
      <div class="rm-item rm-done" data-target="pf-layers"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Four Layers of a Program</span><span class="rm-sub">The bill, built up</span></div></div>
      <div class="rm-item rm-done" data-target="pf-family"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Family Tree</span><span class="rm-sub">Which note builds on which</span></div></div>
      <div class="rm-item rm-done" data-target="pf-guide"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Reading Guide</span><span class="rm-sub">Order, and how to study</span></div></div>
      <div class="rm-item rm-done" data-target="pf-run"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Running Code &amp; Reading Errors</span><span class="rm-sub">python3, the REPL, tracebacks</span></div></div>
      <div class="rm-item rm-done" data-target="pf-connect"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pf-traps"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The top beginner bugs</span></div></div>
      <div class="rm-item rm-done" data-target="pf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">All of the basics in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pf-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pf-bill"><span class="num">01</span>One Bill for the Whole Group</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Learn variables, then operators, then loops, then functions" gives you a list of topics but not a reason for any of them. What single, concrete job can every one of these topics be measured against, so that each new idea visibly helps finish it?</p>
  </div>
  <h3>The running example</h3>
  <p>Chai Corner is a small stall with a four-item menu and two rules. Every note in Python Basics computes on exactly these numbers.</p>
  <table class="tbl out"><caption>Chai Corner menu (₹)</caption>
    <tr><th>Item</th><td>masala chai</td><td>samosa</td><td>vada pav</td><td>cold coffee</td></tr>
    <tr><th>Price</th><td>30</td><td>15</td><td>20</td><td>90</td></tr>
  </table>
  <p>Rules: a subtotal of ₹150 or more gets <b>10% off</b>; then <b>5% GST</b> is added; the bill is rounded to whole rupees. Three tables order:</p>
  <table class="tbl"><caption>The three bills, by hand</caption>
    <tr><th>Table</th><th>Order</th><th>Subtotal</th><th>Discount</th><th>After discount</th><th>+ 5% GST</th><th>Bill</th></tr>
    <tr><td>Asha</td><td>2 masala chai, 3 samosa, 1 cold coffee</td><td>60 + 45 + 90 = 195</td><td>19.5</td><td>175.5</td><td>184.275</td><td><b>₹184</b></td></tr>
    <tr><td>Ben</td><td>1 masala chai, 2 vada pav</td><td>30 + 40 = 70</td><td>0</td><td>70</td><td>73.5</td><td><b>₹74</b></td></tr>
    <tr><td>Chen</td><td>2 samosa, 1 vada pav</td><td>30 + 20 = 50</td><td>0</td><td>50</td><td>52.5</td><td><b>₹52</b> (not 53: see <a class="xref" data-note="py_values">Values</a>)</td></tr>
    <tr><td colspan="6">Day total</td><td><b>₹310</b></td></tr>
  </table>
  <p>Look at the steps you did by hand: you <em>looked up values</em> (prices), <em>remembered</em> intermediate results (195, 175.5), <em>decided</em> whether a discount applies, <em>repeated</em> the same steps for every line and every table, and you would like to <em>give the whole procedure a name</em> ("bill it") so you never have to think it through again. Those five verbs are the whole of Python Basics.</p>
  <h3>The finished program</h3>
  <p>Here is the complete till program you will be able to write, and fully explain, after the three concept notes. The comments say which note teaches each part. Do not worry about understanding it yet; just notice that it is short and that it reproduces the hand-made table.</p>
  <div class="fx" data-lang="py"># ---- values and names  (Values, Types &amp; Variables)
GST = 0.05
asha = [("masala chai", 2, 30), ("samosa", 3, 15), ("cold coffee", 1, 90)]
ben = [("masala chai", 1, 30), ("vada pav", 2, 20)]
chen = [("samosa", 2, 15), ("vada pav", 1, 20)]

# ---- functions  (Functions)
def subtotal(lines):
    total = 0
    for item, qty, price in lines:                  # repetition  (Decisions &amp; Loops)
        total += qty * price
    return total

def bill(lines):
    sub = subtotal(lines)
    discount = sub * 0.10 if sub &gt;= 150 else 0      # a decision  (Decisions &amp; Loops)
    after = sub - discount
    return round(after + after * GST)

# ---- the program itself
day_total = 0
for name, lines in [("Asha", asha), ("Ben", ben), ("Chen", chen)]:
    amount = bill(lines)
    day_total += amount
    print(f"{name:5} subtotal {subtotal(lines):3}  bill {amount}")
print("day total:", day_total)</div>
  <div class="fx" data-lang="text">Asha  subtotal 195  bill 184
Ben   subtotal  70  bill 74
Chen  subtotal  50  bill 52
day total: 310</div>
  <p>₹184, ₹74, ₹52, day total ₹310: the same as by hand. Each line of this program uses one of the four layers described next.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>program</strong> is a list of instructions that Python runs top to bottom, one statement at a time, unless a decision, loop or function call changes the order. A <strong>running example</strong> is one small problem that every note in a group solves, so that each new concept can be seen adding something to the same result.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not try to learn Python by memorising syntax lists. Without a job to do, rules like "<code>//</code> rounds toward minus infinity" or "defaults are evaluated once" have nothing to stick to. Attach each rule to the bill: where would it change ₹184?</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Four Layers of a Program.</b> We have the finished program, but jumping straight to it hides why each piece is there. What does the bill look like with only values, then with names, then with decisions and loops, then with functions?</div>

  <h2 id="pf-layers"><span class="num">02</span>Four Layers of a Program</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Why do we need variables if we have values, loops if we have variables, functions if we have loops? Each layer must be <em>forced</em> by something the previous layer cannot do. What exactly does each layer fail at?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Learning a stall's work: first you learn the goods and their prices (values). Then you keep a notepad of running totals (names). Then you learn the rules and the routine, "if big order, discount", "for each item on the slip, add it" (decisions and loops). Finally the routine becomes a named job you can hand to anyone: "do the billing for table 3" (functions).</p></div>
  <h3>Layer 1: values and operators</h3>
  <p>Python as a calculator. Values (30, 15, 90) and operators (<code>*</code>, <code>+</code>) produce a new value.</p>
  <div class="fx" data-lang="py">print(2 * 30 + 3 * 15 + 1 * 90)</div>
  <div class="fx" data-lang="text">195</div>
  <p><b>Can:</b> compute Asha's subtotal. <b>Cannot:</b> remember it. The 195 is printed and gone; to discount it we must retype the whole expression.</p>
  <h3>Layer 2: names</h3>
  <p>Give values names, and results can be kept and reused.</p>
  <div class="fx" data-lang="py">chai, samosa, coffee = 30, 15, 90
subtotal_asha = 2 * chai + 3 * samosa + 1 * coffee
after = subtotal_asha - subtotal_asha * 0.10
print(subtotal_asha, after, round(after * 1.05))</div>
  <div class="fx" data-lang="text">195 175.5 184</div>
  <p><b>Can:</b> build the bill step by step: 195 → 175.5 → 184. <b>Cannot:</b> choose. The discount line always runs (wrong for Ben), and Asha's order is typed into the code, so Ben and Chen each need a copy.</p>
  <h3>Layer 3: decisions and loops</h3>
  <p>An <code>if</code> applies the discount only when the rule holds; a <code>for</code> loop does the same steps for every line, and an outer loop for every table.</p>
  <div class="fx" data-lang="py">for name, lines in [("Asha", asha), ("Ben", ben), ("Chen", chen)]:
    sub = 0
    for item, qty, price in lines:
        sub += qty * price
    if sub &gt;= 150:
        sub = sub - sub * 0.10
    print(name, round(sub * 1.05))</div>
  <div class="fx" data-lang="text">Asha 184
Ben 74
Chen 52</div>
  <p><b>Can:</b> bill every table correctly with one block. <b>Cannot:</b> be used from anywhere else. A refund screen or a daily report that needs "the bill for this order" must copy the block, and every copy must be kept in step with every rule change.</p>
  <h3>Layer 4: functions</h3>
  <p>Give the block a name and an input. Now "bill an order" is one call, usable anywhere, and each rule lives in exactly one place. (<code>bill</code> here is the one defined in the finished program above.)</p>
  <div class="fx" data-lang="py">print(bill(asha), bill(ben), bill(chen))
print(bill([("cold coffee", 4, 90)]))       # any new order, one call</div>
  <div class="fx" data-lang="text">184 74 52
340</div>
  <p>A brand-new order (4 cold coffees: 360 → 324 → 340.2 → ₹340) needs no new code at all.</p>
  <table class="tbl"><caption>What each layer adds, and the weakness that forces the next</caption>
    <tr><th>Layer</th><th>New idea</th><th>On the bill</th><th>Still can't…</th><th>Taught in</th></tr>
    <tr><td>1. Values</td><td>objects, types, operators</td><td>195 printed</td><td>remember a result</td><td><a class="xref" data-note="py_values">Values, Types &amp; Variables</a></td></tr>
    <tr><td>2. Names</td><td>variables (labels), mutability, conversion</td><td>195 → 175.5 → 184</td><td>choose; handle other orders</td><td><a class="xref" data-note="py_values">Values, Types &amp; Variables</a></td></tr>
    <tr><td>3. Control flow</td><td>if/elif/else, while, for</td><td>184, 74, 52 in one block</td><td>be reused elsewhere</td><td><a class="xref" data-note="py_control">Decisions &amp; Loops</a></td></tr>
    <tr><td>4. Functions</td><td>def, return, parameters, scope</td><td><code>bill(any_order)</code></td><td>(organise data and errors: next notes)</td><td><a class="xref" data-note="py_functions">Functions</a></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>The four layers: <strong>expressions</strong> (values combined by operators into new values); <strong>assignment</strong> (binding names to values); <strong>control flow</strong> (statements that choose or repeat which statements run); <strong>abstraction</strong> (functions that name a block of statements and parameterise its inputs). Each layer is built only from the layers below it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Skipping a layer makes the next one confusing. Most "functions are hard" problems are really layer-2 problems: not knowing that a name is a label (so a function's list parameter is the caller's list), or that <code>print</code> is not <code>return</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Family Tree.</b> We know the four layers and the three notes that teach them. Where do the other Python notes (data structures, files, OOP, generators, decorators) attach, and which of the basics does each one need?</div>

  <h2 id="pf-family"><span class="num">03</span>The Family Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Python track has many notes. If you open OOP or Decorators too early, they will feel like magic. Which notes depend on which, so that you always read a note only after the ideas it stands on?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="pf-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="115" y="29" text-anchor="middle" font-size="12" font-weight="700">Values, Types &amp; Variables</text><text x="115" y="45" text-anchor="middle" class="tm" font-size="10">objects, names, operators</text>
<line x1="210" y1="32" x2="243" y2="32" stroke="currentColor" marker-end="url(#pf-a3)"/>
<rect x="245" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="340" y="29" text-anchor="middle" font-size="12" font-weight="700">Decisions &amp; Loops</text><text x="340" y="45" text-anchor="middle" class="tm" font-size="10">if, while, for</text>
<line x1="435" y1="32" x2="468" y2="32" stroke="currentColor" marker-end="url(#pf-a3)"/>
<rect x="470" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="565" y="29" text-anchor="middle" font-size="12" font-weight="700">Functions</text><text x="565" y="45" text-anchor="middle" class="tm" font-size="10">def, scope, first-class</text>
<line x1="115" y1="54" x2="115" y2="96" stroke="currentColor" marker-end="url(#pf-a3)"/><line x1="340" y1="54" x2="140" y2="96" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pf-a3)"/>
<line x1="565" y1="54" x2="340" y2="96" stroke="currentColor" marker-end="url(#pf-a3)"/><line x1="565" y1="54" x2="565" y2="96" stroke="currentColor" marker-end="url(#pf-a3)"/>
<rect x="20" y="98" width="190" height="44" rx="7" class="ft st"/><text x="115" y="117" text-anchor="middle" font-size="12" font-weight="700">Data Structures</text><text x="115" y="133" text-anchor="middle" class="tm" font-size="10">list, tuple, set, dict, str</text>
<rect x="245" y="98" width="190" height="44" rx="7" class="ft st"/><text x="340" y="117" text-anchor="middle" font-size="12" font-weight="700">Exceptions, Files &amp; Packages</text><text x="340" y="133" text-anchor="middle" class="tm" font-size="10">try/except, I/O, modules</text>
<rect x="470" y="98" width="190" height="44" rx="7" class="ft st"/><text x="565" y="117" text-anchor="middle" font-size="12" font-weight="700">OOP</text><text x="565" y="133" text-anchor="middle" class="tm" font-size="10">classes = data + functions</text>
<line x1="115" y1="142" x2="115" y2="184" stroke="currentColor" marker-end="url(#pf-a3)"/><line x1="565" y1="142" x2="360" y2="184" stroke="currentColor" marker-end="url(#pf-a3)"/><line x1="340" y1="142" x2="565" y2="184" stroke="currentColor" marker-end="url(#pf-a3)"/><line x1="565" y1="142" x2="565" y2="184" stroke="currentColor" marker-end="url(#pf-a3)"/>
<rect x="20" y="186" width="190" height="44" rx="7" class="fg sg"/><text x="115" y="205" text-anchor="middle" font-size="12" font-weight="700">Iterators &amp; Generators</text><text x="115" y="221" text-anchor="middle" class="tm" font-size="10">what for really does</text>
<rect x="245" y="186" width="190" height="44" rx="7" class="fg sg"/><text x="340" y="205" text-anchor="middle" font-size="12" font-weight="700">Decorators</text><text x="340" y="221" text-anchor="middle" class="tm" font-size="10">functions wrapping functions</text>
<rect x="470" y="186" width="190" height="44" rx="7" class="fg sg"/><text x="565" y="205" text-anchor="middle" font-size="12" font-weight="700">Context Managers</text><text x="565" y="221" text-anchor="middle" class="tm" font-size="10">with: setup + guaranteed cleanup</text>
<line x1="340" y1="230" x2="340" y2="254" stroke="currentColor" marker-end="url(#pf-a3)"/>
<rect x="160" y="256" width="360" height="36" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="340" y="279" text-anchor="middle" font-size="11.5">then: Concurrency &amp; Async · Testing &amp; Debugging</text>
</svg><figcaption>Top row: Python Basics, read left to right. Middle row: the core library of the language. Bottom row: the advanced mechanisms, each grown from one basic idea (for loops → iterators; functions as values → decorators; try/finally + classes → context managers).</figcaption></figure>
  <table class="tbl"><caption>Every Python note, what it answers, and which basics it stands on</caption>
    <tr><th>Note</th><th>The question it answers</th><th>Needs from the basics</th><th>On Chai Corner</th></tr>
    <tr><td><a class="xref" data-note="py_values">Values, Types &amp; Variables</a></td><td>What is data, and how do names hold it?</td><td>—</td><td>prices, 195 as one expression, ₹184</td></tr>
    <tr><td><a class="xref" data-note="py_control">Decisions &amp; Loops</a></td><td>How does a program choose and repeat?</td><td>values, bools, truthiness</td><td>discount rule; every line, every table</td></tr>
    <tr><td><a class="xref" data-note="py_functions">Functions</a></td><td>How do we name and reuse steps?</td><td>names, mutability, control flow</td><td>subtotal, discount, with_tax, bill</td></tr>
    <tr><td><a class="xref" data-note="py_ds">Data Structures</a></td><td>How do we organise many values?</td><td>mutability, hashing, loops</td><td>the menu as a dict, orders as lists</td></tr>
    <tr><td><a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a></td><td>What if input is bad; how do we read files and split code into modules?</td><td>functions, types</td><td>quantity "3" from a form; the till log file</td></tr>
    <tr><td><a class="xref" data-note="py_oop">OOP</a></td><td>How do we bundle data with the functions that use it?</td><td>functions, scope, names</td><td>an <code>Order</code> class with <code>.bill()</code></td></tr>
    <tr><td><a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></td><td>What does <code>for</code> really do; how do we stream data lazily?</td><td>for loops, functions</td><td>reading a long till log line by line</td></tr>
    <tr><td><a class="xref" data-note="py_decorators">Decorators</a></td><td>How do we add behaviour to many functions at once?</td><td>functions as values, closures, *args/**kwargs</td><td>logging every bill call</td></tr>
    <tr><td><a class="xref" data-note="py_context">Context Managers</a></td><td>How do we guarantee cleanup (close the file, release the lock)?</td><td>functions, exceptions, classes</td><td><code>with open("till.log")</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A note <strong>depends on</strong> another when its explanations use that note's ideas without re-teaching them. Python Basics (values → control flow → functions) is the root every other note depends on.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>The older combined note <a class="xref" data-note="py_advanced">Iterators, Generators, Decorators</a> covers advanced topics in one place; read it only after Functions, or it will look like magic syntax.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Guide.</b> The tree shows dependencies. What should you look for in each basics note, and how should you study so the ideas stick?</div>

  <h2 id="pf-guide"><span class="num">04</span>Reading Guide</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Knowing the order is not enough; three long notes can still blur together. What is the one thing to take from each, and what is a study routine that works for first-time learners?</p>
  </div>
  <h3>1. Values, Types &amp; Variables</h3>
  <p>Read it for one picture: <strong>a name is a label stuck on an object</strong>. Every "my list changed by itself" bug, every <code>is</code> vs <code>==</code> question, and later the mutable-default trap in Functions come from this picture. Then learn the five types, conversion traps (floats, rounding, truthiness) and operators. You are done when you can compute Asha's ₹184 as one expression and explain why <code>round(52.5)</code> gives 52. <a class="xref" data-note="py_values">Open the note</a>.</p>
  <h3>2. Decisions &amp; Loops</h3>
  <p>Read it for one idea: <strong>a condition, checked once (if) or again and again (while, for)</strong>. Trace every loop table by hand before running the code. You are done when one block of code bills all three tables (₹184, ₹74, ₹52) and you can explain why removing items from a list while looping over it skips one. <a class="xref" data-note="py_control">Open the note</a>.</p>
  <h3>3. Functions</h3>
  <p>Read it for one idea: <strong>a function is an object holding a block of code with its own private names</strong>. Parameters, return, scope, recursion, lambda and decorators all follow. You are done when <code>bill(lines, discount_rule)</code> works with any rule and you can trace the call stack of a recursive total. <a class="xref" data-note="py_functions">Open the note</a>.</p>
  <h3>How to study each note</h3>
  <div class="flow"><span>read the question opener</span><span>predict the output</span><span>trace the table by hand</span><span>run the code</span><span>change one number</span><span>revision sheet</span></div>
  <ul>
    <li><b>Predict before you read the output.</b> Being wrong and then seeing why is how the rule sticks.</li>
    <li><b>Run everything yourself.</b> Type it (not copy-paste) into a file or the REPL (section 05). Typing makes you notice colons, indentation and brackets.</li>
    <li><b>Change one thing.</b> Make Ben's order cross ₹150, or set GST to 12%, and predict the new bill first.</li>
    <li><b>Revise with the Revision Sheet</b> at the end of each note, a day later and a week later.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Reading code is not the same as being able to write it. After each note, close it and write the bill program for that layer from memory.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Running Code and Reading Errors.</b> All of this assumes you can run Python and understand what it says when something goes wrong. How?</div>

  <h2 id="pf-run"><span class="num">05</span>Running Code and Reading Errors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Where do you actually type Python, and what do you do when it answers with a wall of red text? A beginner who cannot read an error message is stuck at the first typo.</p>
  </div>
  <h3>Two ways to run Python</h3>
  <ul>
    <li><b>A script</b>: save code in a file such as <code>till.py</code> and run <code>python3 till.py</code> in a terminal. Python runs the file top to bottom, once. Use this for anything longer than a few lines.</li>
    <li><b>The REPL</b> (Read-Eval-Print Loop): type <code>python3</code> alone. You get a <code>&gt;&gt;&gt;</code> prompt; each line you type runs immediately, and the value of an expression is shown automatically (<code>&gt;&gt;&gt; 2 * 30</code> shows <code>60</code>). Perfect for trying one idea. In a script, you need <code>print()</code> to see anything.</li>
  </ul>
  <p>Jupyter notebooks (common in data science) are a REPL in a browser, split into cells. The code in these notes runs the same in all three.</p>
  <h3>Three rules of Python's shape</h3>
  <ul>
    <li><b>Statements run top to bottom</b>, one after another, unless control flow changes the order.</li>
    <li><b>Indentation is syntax.</b> The lines indented under an <code>if</code>, <code>for</code> or <code>def</code> (4 spaces) form its block. Wrong indentation is an error, or worse, a silently different program.</li>
    <li><b>Comments</b> start with <code>#</code> and are ignored by Python. Write them for the reader: why, not what.</li>
  </ul>
  <h3>Reading a traceback</h3>
  <p>When something goes wrong at run time, Python stops and prints a <strong>traceback</strong>: the chain of calls that led to the error. Here a form sent Asha's samosa quantity as the text "3" instead of the number 3. The script <code>till.py</code>:</p>
  <div class="fx" data-lang="py">def subtotal(lines):
    total = 0
    for item, qty, price in lines:
        total += qty * price
    return total

order = [("samosa", "3", 15)]     # qty arrived as TEXT from a form
print(subtotal(order))</div>
  <p>Running <code>python3 till.py</code> prints (folder path shortened to the file name):</p>
  <div class="fx" data-lang="text">Traceback (most recent call last):
  File "till.py", line 8, in &lt;module&gt;
    print(subtotal(order))
          ~~~~~~~~^^^^^^^
  File "till.py", line 4, in subtotal
    total += qty * price
TypeError: unsupported operand type(s) for +=: 'int' and 'str'</div>
  <table class="tbl"><caption>How to read it: bottom line first</caption>
    <tr><th>Read</th><th>Line</th><th>Tells you</th></tr>
    <tr><td>1st</td><td><code>TypeError: unsupported operand type(s) for +=: 'int' and 'str'</code></td><td><b>What</b> went wrong: adding a str to an int. <code>"3" * 15</code> was text repeated ("333…"), then <code>0 += "333…"</code> failed</td></tr>
    <tr><td>2nd</td><td><code>File "till.py", line 4, in subtotal</code> / <code>total += qty * price</code></td><td><b>Where</b> it happened: the innermost call, the exact line</td></tr>
    <tr><td>3rd</td><td><code>File "till.py", line 8, in &lt;module&gt;</code> / <code>print(subtotal(order))</code></td><td><b>How we got there</b>: the top level of the file called subtotal</td></tr>
  </table>
  <p>The fix belongs where the bad value entered (convert the form's text with <code>int()</code>), not where it exploded. Type errors like this are explained in <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>; catching errors with <code>try/except</code> is in <a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>script</strong> is a .py file run with <code>python3 file.py</code>; the <strong>REPL</strong> runs one statement at a time and echoes expression values. A <strong>traceback</strong> lists the active calls at the moment of an uncaught exception, outermost first, ending with the exception type and message.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Beginners read tracebacks top-down and give up. Read the last line first (what), then the frame just above it (where), then go up only if you need to know how you got there. And a <code>SyntaxError</code> or <code>IndentationError</code> appears before anything runs: the line it names, or the line just before it, has a typo.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture and one table to hold the whole of Python Basics together.</div>

  <h2 id="pf-connect"><span class="num">06</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Across three notes there are dozens of concepts. How is each one built from the ones before, which question does each answer, and what does each contribute to ₹184?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 290" width="680">
<defs><marker id="pf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="50" rx="7" class="fb sb"/><text x="85" y="30" text-anchor="middle" font-size="12" font-weight="700">values · types</text><text x="85" y="47" text-anchor="middle" class="tm" font-size="10">30, "samosa", True</text>
<line x1="160" y1="35" x2="183" y2="35" stroke="currentColor" marker-end="url(#pf-a9)"/>
<rect x="185" y="10" width="150" height="50" rx="7" class="fb sb"/><text x="260" y="30" text-anchor="middle" font-size="12" font-weight="700">operators</text><text x="260" y="47" text-anchor="middle" class="tm" font-size="10">2*30 + 3*15 + 90 = 195</text>
<line x1="335" y1="35" x2="358" y2="35" stroke="currentColor" marker-end="url(#pf-a9)"/>
<rect x="360" y="10" width="150" height="50" rx="7" class="fb sb"/><text x="435" y="30" text-anchor="middle" font-size="12" font-weight="700">names</text><text x="435" y="47" text-anchor="middle" class="tm" font-size="10">subtotal → 195</text>
<line x1="510" y1="35" x2="533" y2="35" stroke="currentColor" marker-end="url(#pf-a9)"/>
<rect x="535" y="10" width="135" height="50" rx="7" class="fr sr"/><text x="602" y="30" text-anchor="middle" font-size="11.5" font-weight="700">mutability</text><text x="602" y="47" text-anchor="middle" class="tm" font-size="10">shared lists</text>
<line x1="260" y1="60" x2="200" y2="100" stroke="currentColor" marker-end="url(#pf-a9)"/><line x1="435" y1="60" x2="470" y2="100" stroke="currentColor" marker-end="url(#pf-a9)"/>
<rect x="80" y="102" width="230" height="50" rx="7" class="ft st"/><text x="195" y="122" text-anchor="middle" font-size="12" font-weight="700">decisions: if / elif / else</text><text x="195" y="139" text-anchor="middle" class="tm" font-size="10">195 ≥ 150 → 10% off</text>
<rect x="360" y="102" width="230" height="50" rx="7" class="ft st"/><text x="475" y="122" text-anchor="middle" font-size="12" font-weight="700">loops: while · for</text><text x="475" y="139" text-anchor="middle" class="tm" font-size="10">60 → 105 → 195; every table</text>
<line x1="195" y1="152" x2="300" y2="190" stroke="currentColor" marker-end="url(#pf-a9)"/><line x1="475" y1="152" x2="380" y2="190" stroke="currentColor" marker-end="url(#pf-a9)"/><line x1="602" y1="60" x2="602" y2="190" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pf-a9)"/>
<rect x="200" y="192" width="280" height="50" rx="7" class="fg sg"/><text x="340" y="212" text-anchor="middle" font-size="12" font-weight="700">functions: def · return · scope</text><text x="340" y="229" text-anchor="middle" class="tm" font-size="10">bill(asha) = 184 · bill(ben) = 74 · bill(chen) = 52</text>
<rect x="500" y="192" width="170" height="50" rx="7" class="fr sr"/><text x="585" y="212" text-anchor="middle" font-size="11.5" font-weight="700">mutable default trap</text><text x="585" y="229" text-anchor="middle" class="tm" font-size="10">labels + defaults</text>
<line x1="340" y1="242" x2="340" y2="258" stroke="currentColor" marker-end="url(#pf-a9)"/>
<rect x="150" y="260" width="380" height="28" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="340" y="279" text-anchor="middle" font-size="11">functions as values → decorators · OOP · iterators</text>
</svg><figcaption>Values are combined by operators and kept by names; conditions on them drive decisions and loops; functions wrap all of that into named, reusable steps. Mutability (dashed) is the thread that causes the classic bugs at every layer.</figcaption></figure>
  <table class="tbl"><caption>The basics on Chai Corner</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the running example</th><th>Note</th></tr>
    <tr><td>Value / type</td><td>—</td><td>what is data?</td><td>30 (int), "samosa" (str)</td><td><a class="xref" data-note="py_values">Values</a></td></tr>
    <tr><td>Operator</td><td>values, types</td><td>how to compute?</td><td>2×30 + 3×15 + 90 = 195</td><td><a class="xref" data-note="py_values">Values</a></td></tr>
    <tr><td>Name</td><td>objects</td><td>how to keep a value?</td><td>subtotal → 195; after → 175.5</td><td><a class="xref" data-note="py_values">Values</a></td></tr>
    <tr><td>Conversion</td><td>types</td><td>how to get the right type?</td><td>round(184.275) = 184; round(52.5) = 52</td><td><a class="xref" data-note="py_values">Values</a></td></tr>
    <tr><td>Decision</td><td>bool conditions</td><td>run only when…?</td><td>195 ≥ 150 → 19.5 off</td><td><a class="xref" data-note="py_control">Decisions &amp; Loops</a></td></tr>
    <tr><td>Loop</td><td>conditions, iterables</td><td>repeat for each…?</td><td>60 → 105 → 195; 184, 74, 52</td><td><a class="xref" data-note="py_control">Decisions &amp; Loops</a></td></tr>
    <tr><td>Function</td><td>all of the above</td><td>name and reuse a step?</td><td>bill(asha) = 184</td><td><a class="xref" data-note="py_functions">Functions</a></td></tr>
    <tr><td>Scope</td><td>names + functions</td><td>whose name is this?</td><td>GST global, total local</td><td><a class="xref" data-note="py_functions">Functions</a></td></tr>
    <tr><td>Function as value</td><td>functions are objects</td><td>one bill, many rules?</td><td>festival 20% → ₹164</td><td><a class="xref" data-note="py_functions">Functions</a></td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds Python Basics: <strong>programs are values held by names, transformed by operators, steered by conditions, and packaged into functions.</strong> Each layer is useless without the one below and limited without the one above.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The map is complete. Before starting, it helps to know the handful of bugs that trip up almost every beginner.</div>

  <h2 id="pf-traps"><span class="num">07</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which beginner bugs appear across all three basics notes, and where is each one explained?</p>
  </div>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom on Chai Corner</th><th>Fix</th><th>Explained in</th></tr>
    <tr><td>Text from input used as a number</td><td>"2" + "3" = "23"; TypeError in subtotal</td><td><code>int(text)</code> at once</td><td><a class="xref" data-note="py_values">Values</a></td></tr>
    <tr><td><code>b = a</code> as a "copy"</td><td>Kitchen's slip changes with the waiter's</td><td><code>a.copy()</code></td><td><a class="xref" data-note="py_values">Values</a></td></tr>
    <tr><td>Floats for money, <code>==</code> on floats</td><td>0.1 + 0.2 ≠ 0.3; 52.5 rounds to 52</td><td>Decimal, isclose</td><td><a class="xref" data-note="py_values">Values</a></td></tr>
    <tr><td>Loose condition first</td><td>₹320 order gets 10%, not 15%</td><td>Strictest first</td><td><a class="xref" data-note="py_control">Decisions &amp; Loops</a></td></tr>
    <tr><td>Changing a list while looping over it</td><td>One sold-out samosa stays</td><td>Build a new list</td><td><a class="xref" data-note="py_control">Decisions &amp; Loops</a></td></tr>
    <tr><td>Off-by-one with range</td><td>Table 10 never billed</td><td><code>range(1, 11)</code></td><td><a class="xref" data-note="py_control">Decisions &amp; Loops</a></td></tr>
    <tr><td>print instead of return</td><td><code>bill(...)</code> gives None</td><td><code>return</code></td><td><a class="xref" data-note="py_functions">Functions</a></td></tr>
    <tr><td>Mutable default</td><td>Ben's order holds Asha's chai</td><td><code>order=None</code></td><td><a class="xref" data-note="py_functions">Functions</a></td></tr>
    <tr><td>Assigning a global inside a function</td><td>UnboundLocalError on a bill counter</td><td>Return values; <code>global</code></td><td><a class="xref" data-note="py_functions">Functions</a></td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole of Python Basics, condensed to one page for revision.</div>

  <h2 id="pf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Python Basics on one sheet. Running example: Chai Corner (chai 30, samosa 15, vada pav 20, cold coffee 90; 10% off at ₹150+, then 5% GST, round to rupees). Each concept note has its own, more detailed Revision Sheet.</p>
  <h3>The four layers</h3>
  <table class="tbl">
    <tr><th>Layer</th><th>Question it answers</th><th>Key ideas</th><th>On the bill</th><th>Weakness → next</th></tr>
    <tr><td>Values</td><td>what is data?</td><td>objects (type, id, value); int, float, bool, str, None; operators</td><td>195</td><td>can't remember results</td></tr>
    <tr><td>Names</td><td>how to keep values?</td><td>labels not boxes; mutable vs immutable; conversion; <code>is</code> vs <code>==</code></td><td>195 → 175.5 → 184</td><td>can't choose or handle other orders</td></tr>
    <tr><td>Control flow</td><td>how to choose and repeat?</td><td>if/elif/else; while; for, range; break, continue, else; patterns</td><td>184, 74, 52</td><td>can't reuse the block</td></tr>
    <tr><td>Functions</td><td>how to name and reuse steps?</td><td>def, return, parameters, defaults, *args/**kwargs, LEGB, recursion, lambda, first-class</td><td>bill(any order)</td><td>→ data structures, errors, OOP</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Table</th><th>Subtotal</th><th>Discount</th><th>After</th><th>With GST</th><th>Bill</th></tr>
    <tr><td>Asha</td><td>195</td><td>19.5</td><td>175.5</td><td>184.275</td><td>184</td></tr>
    <tr><td>Ben</td><td>70</td><td>0</td><td>70</td><td>73.5</td><td>74</td></tr>
    <tr><td>Chen</td><td>50</td><td>0</td><td>50</td><td>52.5</td><td>52 (half to even)</td></tr>
    <tr><td colspan="5">Day total</td><td>310</td></tr>
  </table>
  <h3>Reading order and one idea per note</h3>
  <div class="cards">
    <div><b>1. Values, Types &amp; Variables</b><p>A name is a label on an object; the type decides what operators do.</p><small><a class="xref" data-note="py_values">open</a></small></div>
    <div><b>2. Decisions &amp; Loops</b><p>A condition checked once (if) or repeatedly (while, for).</p><small><a class="xref" data-note="py_control">open</a></small></div>
    <div><b>3. Functions</b><p>An object holding a block of code with its own private names.</p><small><a class="xref" data-note="py_functions">open</a></small></div>
    <div><b>Then</b><p>Data Structures, Exceptions &amp; Files, OOP, Iterators, Decorators, Context Managers.</p><small>each builds on all three</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Text is not a number; <code>b = a</code> does not copy; floats are inexact and <code>round</code> goes half-to-even; the first True branch wins; never change a list while looping over it; <code>range</code> excludes stop; print is not return; mutable defaults are shared; assigning a name in a function makes it local. Read tracebacks from the bottom.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Which layer would you need to bill a 4th table without writing new code?</td><td>Functions (call <code>bill(new_order)</code>); with only loops you would add it to the list, with only names you would copy code</td></tr>
    <tr><td>What does <code>print(2 * 30 + 3 * 15 + 1 * 90)</code> show?</td><td>195</td></tr>
    <tr><td>Why does Chen pay ₹52 and not ₹53?</td><td><code>round(52.5)</code> rounds half to even</td></tr>
    <tr><td>In a traceback, which line do you read first?</td><td>The last one: exception type and message</td></tr>
    <tr><td>Which note explains why a function's default list is shared between calls?</td><td>Functions (defaults built once), using the label picture from Values</td></tr>
  </table>

  <h2 id="pf-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four layers of a program, in order?</summary><div class="qa-body">Values (data and operators), names (variables that keep values), control flow (decisions and loops), and functions (named, reusable blocks). Each is built from the ones below it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need variables if we can write expressions?</summary><div class="qa-body">An expression's result is gone after its line. Names keep results so the next step can use them (195 → 175.5 → 184) and let one value (the price of chai) be written once and changed in one place.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need loops if we have variables?</summary><div class="qa-body">With only names, the order is typed into the code: each order, and each line of an order, needs its own code. A loop does the same step for every item of any order and every table, with one block.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need functions if we have loops?</summary><div class="qa-body">A loop runs a block in one place. To use the same block elsewhere (a refund screen, a report) you would copy it, and every rule change would have to be made in every copy. A function gives the block a name and inputs, so it lives in one place and can be called from anywhere.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between running a script and using the REPL?</summary><div class="qa-body">A script (<code>python3 till.py</code>) runs a whole file once and shows only what you print. The REPL runs one statement at a time and echoes each expression's value, which is ideal for experiments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Python traceback?</summary><div class="qa-body">Bottom line first: the exception type and message say what went wrong. The frame just above says where (file, line, function, the code). Frames further up show the chain of calls that led there. Fix the cause where the bad value entered, not just where it exploded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In which order should you read the Python notes, and why?</summary><div class="qa-body">Values, Types &amp; Variables → Decisions &amp; Loops → Functions, then Data Structures, Exceptions/Files/Packages and OOP, then Iterators, Decorators and Context Managers. Each later note uses earlier ideas without re-teaching them (decorators need closures and *args/**kwargs from Functions, which need the label picture from Values).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does "a name is a label" show up in all three basics notes?</summary><div class="qa-body">Values: <code>b = a</code> shares a list, and <code>is</code> vs <code>==</code> exist. Decisions &amp; Loops: the loop variable is just a label moved to each item, and it still labels the last item after the loop. Functions: a parameter is a new label on the caller's object (so a function can change the caller's list), and a mutable default is one object labelled again on every call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in the bill if you skip each layer?</summary><div class="qa-body">Skip names: every step retypes the previous expression. Skip decisions: the discount either always or never applies (or you hack it with True = 1). Skip loops: every order needs hand-written code. Skip functions: the billing logic is copied, and copies drift apart (Asha taxed at 5%, Ben at 12%).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which basic idea does each advanced note grow from?</summary><div class="qa-body">Iterators &amp; Generators grow from the for loop (what "the next item" means). Decorators grow from functions as values plus closures. Context Managers grow from functions, exceptions and classes (guaranteed cleanup). OOP grows from functions plus data (methods are functions attached to objects).</div></details>
</main>
`
});
