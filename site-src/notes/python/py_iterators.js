// notes/python/py_iterators.js — Iterators & Generators
Object.assign(TOPIC_CONTENT, {
  "py_iterators": `<main>
<h1>Iterators &amp; Generators</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions</span><span>Iterators &amp; Generators</span></div>
  <p class="lead">Every <code>for</code> loop you have ever written quietly uses two tiny functions, <code>iter()</code> and <code>next()</code>. This note opens that up and builds on it, one need at a time: what an iterator is, how to write one as a class, why that is clumsy, how a <strong>generator</strong> (a function that can pause with <code>yield</code>) does the same job in a few lines, and why that pausing lets you process a file far bigger than your RAM. Everything is traced by hand on one small running example, the order log of a tea stall called Chai Corner, and every piece of code was run with its real output shown underneath.</p>

  <h2 id="pi-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
    <defs><marker id="pi-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="230" y="8" width="180" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="28" text-anchor="middle" font-size="12">Advanced Python Functions: map</text>
    <line x1="320" y1="38" x2="110" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="320" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="530" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="20" y="70" width="180" height="34" rx="6" class="fg sg" stroke-width="2.5"/><text x="110" y="92" text-anchor="middle" font-size="12" font-weight="700">Iterators &amp; Generators</text>
    <rect x="230" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="92" text-anchor="middle" font-size="12">Closures &amp; Decorators</text>
    <rect x="440" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="530" y="92" text-anchor="middle" font-size="12">Context Managers</text>
    <path d="M110,104 Q320,165 524,108" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pi-a0)"/>
    <text x="320" y="160" text-anchor="middle" class="tm" font-size="11">@contextmanager turns a generator into a context manager</text>
  </svg><figcaption>The Advanced Python Functions group. You are on the green note. Its generators come back later: the Context Managers note builds a context manager out of a generator.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_fundamentals">Python Fundamentals</a>, <a class="xref" data-note="py_ds">Data Structures</a> and <a class="xref" data-note="py_oop">OOP</a></b><span>You can write loops, functions and classes, and you know that methods with double underscores (dunder methods such as <code>__init__</code>) are hooks Python calls for you. Left open: how can one <code>for</code> loop walk a list, a string, a dict and a 20 GB file, and what do you do when the data does not fit in memory? The group map, <a class="xref" data-note="py_advanced">Advanced Python Functions: the map</a>, introduced the Chai Corner log we use here.</span></li>
    <li><b>This note adds: the iteration protocol and lazy data</b><span>Iterables and iterators, <code>iter()</code>/<code>next()</code>/<code>StopIteration</code>, the <code>for</code> loop taken apart, class iterators, generators and <code>yield</code>, generator expressions, lazy evaluation, pipelines, <code>yield from</code>/<code>send</code>, and the <code>itertools</code> toolbox.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a> and <a class="xref" data-note="py_context">Context Managers</a></b><span>A generator is a function that keeps its local variables between calls. A closure is another way for a function to keep variables, and it is what decorators are made of. Context managers then reuse the generator directly: <code>@contextmanager</code> runs your setup up to <code>yield</code> and your cleanup after it. Later, <a class="xref" data-note="py_concurrency">Concurrency &amp; Async</a> uses the same "pause and resume" idea for coroutines.</span></li>
  </ol>

  <h2 id="pi-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Numbers come from the running example: Chai Corner's six-line log with four valid orders worth ₹225.</p>
  <ol class="story">
    <li><b>The for loop</b><span>Q: how does one <code>for</code> work on lists, strings, dicts and files? → It doesn't know any of them. It calls <code>iter()</code> once and <code>next()</code> again and again. So what are those two calls talking to?</span></li>
    <li><b>Iterable vs iterator</b><span>Q: what does <code>iter()</code> return? → An <strong>iterator</strong>: a bookmark that hands out the next item on each <code>next()</code> and raises <code>StopIteration</code> at the end. A list is an <strong>iterable</strong>: it hands out a fresh bookmark each time. But the built-in types only walk raw lines; can we make an object that walks <em>orders</em>?</span></li>
    <li><b>A class iterator</b><span>Q: how do we make our own thing loopable? → Write <code>__iter__</code> and <code>__next__</code>. <code>OrderReader</code> keeps <code>self.pos</code> and walks the log: pos 2, 3, 4, 6, then StopIteration. But that is 17 lines of manual bookkeeping for "give the next order"…</span></li>
    <li><b>Generators and yield</b><span>Q: can the position be remembered for us? → A function with <code>yield</code> pauses instead of ending; its local variables <em>are</em> the bookmark. 9 lines, same four orders, same ₹225. But we still wrote a whole <code>def</code> for a one-line transformation…</span></li>
    <li><b>Generator expressions</b><span>Q: is there a one-line form? → <code>(o["qty"] * o["price"] for o in orders(raw))</code>, summed to 225. Round brackets compute nothing until asked. Why does "until asked" matter?</span></li>
    <li><b>Lazy evaluation</b><span>Q: what do we gain by not computing early? → Memory: 10 million amounts as a list peak at 409 MB, as a generator at 0.0005 MB. And endless sequences (token numbers) become safe. But real work is several steps, not one…</span></li>
    <li><b>Pipelines</b><span>Q: can several lazy steps be chained? → read → parse → filter → take: the first three cold coffees in a billion-line log needed only 15 lines. But how do generators hand work to other generators, or receive values?</span></li>
    <li><b>yield from, send, close</b><span>Q: how do generators delegate, talk back and clean up? → <code>yield from</code> hands over every item of another iterable (Monday + Tuesday = ₹335); <code>send</code> passes a value in (running totals 60, 105, 195, 225); <code>close</code> runs the <code>finally</code>. Must we write every stream tool ourselves?</span></li>
    <li><b>itertools</b><span>Q: what is already built? → <code>islice</code>, <code>count</code>, <code>chain</code>, <code>accumulate</code> (60, 105, 195, 225), <code>groupby</code>, <code>tee</code>, <code>batched</code>, <code>pairwise</code>. All lazy, all iterator-in, iterator-out. And the price of laziness?</span></li>
    <li><b>Traps</b><span>Q: what goes wrong? → Iterators are one-pass and fail silently (second <code>sum</code> = 0), have no <code>len</code>, are eaten by <code>in</code>, and a lazy generator can outlive its <code>with open</code>.</span></li>
  </ol>

  <h2 id="pi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Iterators &amp; Generators</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">How a for loop works</div>
        <ul>
          <li><b>Iterable</b> — has <code>__iter__</code>; <code>iter(x)</code> gives a fresh iterator (list, str, dict, range)</li>
          <li><b>Iterator</b> — has <code>__next__</code>; remembers its position; <code>__iter__</code> returns itself</li>
          <li><code>for x in obj</code> = <code>it = iter(obj)</code>, then <code>next(it)</code> until <code>StopIteration</code></li>
          <li>File objects are iterators: one line per <code>next</code>, one pass only</li>
          <li>💡 a book (iterable) and a bookmark (iterator)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Class iterator</div>
        <ul>
          <li><code>OrderReader</code>: <code>self.pos</code> is the bookmark</li>
          <li><code>__next__</code> returns an order or raises <code>StopIteration</code></li>
          <li>Trace on the log: pos 2, 3, 4, 6, then stop</li>
          <li><code>OrderLog.__iter__</code> returns a new reader → many passes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Generators</div>
        <ul>
          <li>Any <code>def</code> with <code>yield</code>; calling it runs <b>no</b> line</li>
          <li>Each <code>next()</code> runs to the next <code>yield</code>, then pauses</li>
          <li>Locals survive the pause: the state machine for free</li>
          <li>States: CREATED → SUSPENDED → CLOSED</li>
          <li><code>return v</code> ends it; v rides on <code>StopIteration.value</code></li>
          <li>💡 a cricket match stopped for rain</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lazy evaluation</div>
        <ul>
          <li><code>[ ]</code> builds now, <code>( )</code> builds on demand</li>
          <li>10M items: list peak <b>409 MB</b>, generator <b>0.0005 MB</b></li>
          <li>Infinite streams are fine: take what you need with <code>islice</code></li>
          <li>Pipeline: read → parse → filter → take; the last step pulls</li>
          <li>Billion-line log, 3 cold coffees: 15 lines read</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">More generator tools</div>
        <ul>
          <li><code>yield from it</code> — pass on every item of <code>it</code></li>
          <li><code>x = yield v</code> + <code>g.send(x)</code> — two-way: running total 60 → 225</li>
          <li><code>g.close()</code> → <code>finally</code> runs (cleanup)</li>
          <li><b>itertools</b>: islice, count, chain, accumulate, groupby (sort first!), tee, batched, pairwise, takewhile</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>⚠ Second pass over an iterator gives nothing, silently</li>
          <li>⚠ No <code>len()</code>, no <code>g[0]</code></li>
          <li>⚠ <code>x in gen</code> consumes items</li>
          <li>⚠ <code>return (… for line in f)</code> inside <code>with open</code> → closed file</li>
          <li>⚠ A stray <code>yield</code> makes the function do nothing when called</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pi-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pi-for"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How a for Loop Really Works</span><span class="rm-sub">iter, next, StopIteration</span></div></div>
      <div class="rm-item rm-done" data-target="pi-class"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Writing Your Own Iterator</span><span class="rm-sub">__iter__ and __next__ by hand</span></div></div>
      <div class="rm-item rm-done" data-target="pi-gen"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Generators: Functions That Pause</span><span class="rm-sub">yield traced line by line</span></div></div>
      <div class="rm-item rm-done" data-target="pi-genexp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Generator Expressions</span><span class="rm-sub">Round brackets are lazy</span></div></div>
      <div class="rm-item rm-done" data-target="pi-lazy"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Lazy Evaluation &amp; Memory</span><span class="rm-sub">409 MB vs 200 bytes</span></div></div>
      <div class="rm-item rm-done" data-target="pi-pipe"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Generator Pipelines</span><span class="rm-sub">Read → parse → filter → take</span></div></div>
      <div class="rm-item rm-done" data-target="pi-more"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">yield from, send &amp; close</span><span class="rm-sub">Delegate, talk back, clean up</span></div></div>
      <div class="rm-item rm-done" data-target="pi-tools"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">itertools Essentials</span><span class="rm-sub">The standard stream toolbox</span></div></div>
      <div class="rm-item rm-done" data-target="pi-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pi-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">One-pass, len, closed files</span></div></div>
      <div class="rm-item rm-done" data-target="pi-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="pi-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pi-for"><span class="num">01</span>How a for Loop Really Works</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You can write <code>for x in …</code> over a list, a string, a dict, a range, a file. These are very different things: a list sits in memory, a file is on disk and is read line by line, a range never stores its numbers at all. How can one loop know how to walk through all of them?</p>
  </div>
  <h3>The running example: Chai Corner's order log</h3>
  <p>Chai Corner is a small tea stall. Its till writes one line per order: time, item, quantity, unit price in rupees. Monday's log has six lines. Line 1 is a comment, line 5 is junk written when the till restarted, and the other four are real orders. We will use this same file in every section, and in the sibling notes.</p>
  <div class="fx" data-lang="py">LOG = """# Chai Corner till log, Monday
09:01,masala chai,2,30
09:05,samosa,3,15
09:12,cold coffee,1,90
till restarted
09:20,masala chai,1,30
"""
with open("orders.log", "w") as f:        # (the "with" line is explained in Context Managers)
    f.write(LOG)

with open("orders.log") as f:
    raw = f.read().splitlines()           # the six lines as a list of strings
for n, line in enumerate(raw, start=1):
    print(n, repr(line))</div>
  <div class="fx" data-lang="text">1 '# Chai Corner till log, Monday'
2 '09:01,masala chai,2,30'
3 '09:05,samosa,3,15'
4 '09:12,cold coffee,1,90'
5 'till restarted'
6 '09:20,masala chai,1,30'</div>
  <table class="tbl"><caption>The four valid orders, worked by hand</caption>
    <tr><th>Line</th><th>Time</th><th>Item</th><th>Qty × price</th><th>Amount</th><th>Running total</th></tr>
    <tr><td>2</td><td>09:01</td><td>masala chai</td><td>2 × 30</td><td>60</td><td>60</td></tr>
    <tr><td>3</td><td>09:05</td><td>samosa</td><td>3 × 15</td><td>45</td><td>105</td></tr>
    <tr><td>4</td><td>09:12</td><td>cold coffee</td><td>1 × 90</td><td>90</td><td>195</td></tr>
    <tr><td>6</td><td>09:20</td><td>masala chai</td><td>1 × 30</td><td>30</td><td><strong>225</strong></td></tr>
  </table>
  <p>The answer every section must reproduce: <strong>4 orders, 7 items, ₹225</strong>. Lines 1 and 5 must be skipped.</p>
  <h3>The idea in plain words</h3>
  <p>The loop does not know anything about lists or files. It only knows how to ask two questions. First it asks the object, "give me something that can walk through you". Then it asks that walker, again and again, "what is the next item?". When the walker says "no more", the loop stops. Every type that wants to work with <code>for</code> just answers those two questions in its own way.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A book and a bookmark. The book is the thing you read (the <strong>iterable</strong>). The bookmark remembers where you are (the <strong>iterator</strong>). Each time you sit down you read the next page and move the bookmark forward. Five friends can read the same book with five bookmarks at different pages. A bookmark only moves forward; to start again you take a new bookmark.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="pi-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="72" width="120" height="50" rx="6" class="fb sb"/><text x="22" y="93">iterable</text><text x="22" y="112" class="tm">lines (3 items)</text>
    <line x1="132" y1="97" x2="206" y2="97" stroke="currentColor" marker-end="url(#pi-a1)"/><text x="140" y="88">iter()</text>
    <rect x="210" y="72" width="150" height="50" rx="6" class="ft st"/><text x="222" y="93">iterator</text><text x="222" y="112" class="tm">remembers pos</text>
    <line x1="362" y1="84" x2="406" y2="37" stroke="currentColor" marker-end="url(#pi-a1)"/>
    <line x1="362" y1="97" x2="406" y2="97" stroke="currentColor" marker-end="url(#pi-a1)"/>
    <line x1="362" y1="110" x2="406" y2="157" stroke="currentColor" marker-end="url(#pi-a1)"/>
    <rect x="410" y="20" width="180" height="32" rx="6" class="fg sg"/><text x="420" y="41">next() → chai line</text>
    <rect x="410" y="81" width="180" height="32" rx="6" class="fg sg"/><text x="420" y="102">next() → samosa line</text>
    <rect x="410" y="142" width="180" height="32" rx="6" class="fr sr"/><text x="420" y="163">… then StopIteration</text>
  </svg><figcaption>Read left to right. The loop calls iter() once on the list and gets an iterator (the bookmark). Then it calls next() on that iterator, once per item. When the items run out the iterator raises StopIteration, which tells the loop to stop.</figcaption></figure>
  <h3>Traced by hand</h3>
  <p>Take the first three order lines as a list, <code>lines</code>, and trace <code>for line in lines: print(line)</code> exactly as Python runs it.</p>
  <table class="tbl out"><caption>What Python does for one for loop</caption>
    <tr><th>Step</th><th>Python does</th><th>Iterator position after</th><th>Result</th></tr>
    <tr><td>1</td><td><code>it = iter(lines)</code></td><td>before item 0</td><td>a <code>list_iterator</code></td></tr>
    <tr><td>2</td><td><code>line = next(it)</code>, run body</td><td>after item 0</td><td>prints the chai line</td></tr>
    <tr><td>3</td><td><code>line = next(it)</code>, run body</td><td>after item 1</td><td>prints the samosa line</td></tr>
    <tr><td>4</td><td><code>line = next(it)</code>, run body</td><td>after item 2</td><td>prints the cold coffee line</td></tr>
    <tr><td>5</td><td><code>next(it)</code></td><td>at the end</td><td>raises <code>StopIteration</code> → the loop catches it and ends quietly</td></tr>
  </table>
  <p>The code below writes the same loop twice: once with <code>for</code>, once by hand with a <code>while</code> loop that does steps 1–5 itself.</p>
  <div class="fx" data-lang="py">lines = ["09:01,masala chai,2,30", "09:05,samosa,3,15", "09:12,cold coffee,1,90"]

for line in lines:
    print("for got  ", line)

it = iter(lines)                # step 1: ask the list for an iterator
while True:
    try:
        line = next(it)         # step 2: ask for the next item
    except StopIteration:       # step 3: no more items -&gt; stop
        break
    print("while got", line)    # the loop body</div>
  <div class="fx" data-lang="text">for got   09:01,masala chai,2,30
for got   09:05,samosa,3,15
for got   09:12,cold coffee,1,90
while got 09:01,masala chai,2,30
while got 09:05,samosa,3,15
while got 09:12,cold coffee,1,90</div>
  <p>The <code>while</code> version printed exactly what the <code>for</code> version printed: that <em>is</em> what <code>for</code> does. Now poke an iterator directly, one <code>next</code> at a time.</p>
  <div class="fx" data-lang="py">it = iter(lines)
print(type(it).__name__)
print(next(it))
print(next(it))
print(next(it))
try:
    next(it)                    # one too many
except StopIteration:
    print("StopIteration")
print(iter(it) is it, iter(lines) is iter(lines))

for thing in ["ab", {"chai": 30, "samosa": 15}, range(3)]:
    print(type(thing).__name__, "-&gt;", type(iter(thing)).__name__, list(thing))</div>
  <div class="fx" data-lang="text">list_iterator
09:01,masala chai,2,30
09:05,samosa,3,15
09:12,cold coffee,1,90
StopIteration
True False
str -&gt; str_ascii_iterator ['a', 'b']
dict -&gt; dict_keyiterator ['chai', 'samosa']
range -&gt; range_iterator [0, 1, 2]</div>
  <p>What happened. <code>iter(lines)</code> gave a <code>list_iterator</code>, a small object holding a reference to the list and a position number. Each <code>next(it)</code> returned one item and moved the position forward. The fourth <code>next</code> raised <code>StopIteration</code>; inside a <code>for</code> loop that exception is caught for you, which is why you never see it.</p>
  <p>Look at <code>iter(it) is it</code> → <code>True</code>, but <code>iter(lines) is iter(lines)</code> → <code>False</code>. Asking a list for an iterator gives a <em>new</em> bookmark every time, so you can loop over a list as often as you like. Asking an iterator for an iterator gives back <em>itself</em>, with its old position. So an iterator can be walked only once. The last loop shows each type has its own iterator class (string, dict keys, range), but all answer <code>next()</code> the same way.</p>
  <h3>A file is an iterator</h3>
  <p>The log itself, opened as a file, is the most useful iterator of all: each <code>next</code> reads one more line from disk.</p>
  <div class="fx" data-lang="py">with open("orders.log") as f:
    print(type(f).__name__, "| iter(f) is f:", iter(f) is f)
    print(repr(next(f)))
    print(repr(next(f)))
    rest = list(f)              # take everything that is left
    print(len(rest), "lines left; a second pass gives", list(f))</div>
  <div class="fx" data-lang="text">TextIOWrapper | iter(f) is f: True
'# Chai Corner till log, Monday\\n'
'09:01,masala chai,2,30\\n'
4 lines left; a second pass gives []</div>
  <p>The file object (a <code>TextIOWrapper</code>) is its own iterator, like <code>it</code> above. Two <code>next</code> calls read lines 1 and 2; <code>list(f)</code> took the remaining 4; a second pass got nothing. This is how <code>for line in open("big.csv")</code> walks a 20 GB file: only one line is in memory at a time.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Iterable</strong>: an object with <code>__iter__</code> that returns an iterator (list, tuple, str, dict, set, range, file). <strong>Iterator</strong>: an object with <code>__next__</code> that returns the next item or raises <code>StopIteration</code>, and whose <code>__iter__</code> returns itself. <code>iter(x)</code> calls <code>x.__iter__()</code>; <code>next(it)</code> calls <code>it.__next__()</code>. This pair of rules is the <strong>iterator protocol</strong>. Every iterator is iterable; not every iterable is an iterator.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Used-up iterators fail silently: no error, just nothing. A file object, <code>zip(...)</code>, <code>map(...)</code>, <code>enumerate(...)</code> and every generator are iterators. Loop over one twice and the second loop does nothing.</p></div>
  <p>Where it matters: a PyTorch <code>DataLoader</code> is an iterable; each epoch's <code>for batch in loader</code> calls <code>iter()</code> and gets a fresh pass. <code>csv.reader(f)</code> is an iterator over a file iterator.</p>
  <div class="bridge"><b>What this still can't tell us → next: Writing Your Own Iterator.</b> The built-in iterators hand us raw lines, junk and comments included. We want an object that hands out clean <em>orders</em>, one per <code>next()</code>, and works in a <code>for</code> loop like a list does.</div>

  <h2 id="pi-class"><span class="num">02</span>Writing Your Own Iterator</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know <code>for</code> only calls <code>iter()</code> and <code>next()</code>. So if we write those two hooks ourselves, can our own object be looped over? And what must it remember between calls?</p>
  </div>
  <p>Python finds the two answers through two dunder methods: <code>iter(obj)</code> calls <code>obj.__iter__()</code>, and <code>next(it)</code> calls <code>it.__next__()</code>. So we write a class, <code>OrderReader</code>, whose <code>__next__</code> moves through the raw lines, skips the junk, and returns the next order as a dict. The only thing it must remember between calls is where it is: <code>self.pos</code>, the index of the next line to look at. When it runs out it must <code>raise StopIteration</code> itself.</p>
  <div class="fx" data-lang="py">class OrderReader:                        # an ITERATOR over raw log lines
    def __init__(self, lines):
        self.lines = lines
        self.pos = 0                      # the bookmark: index of the next line to look at
    def __iter__(self):
        return self                       # an iterator is its own iterator
    def __next__(self):
        while self.pos &lt; len(self.lines):
            line = self.lines[self.pos].strip()
            self.pos += 1
            if not line or line.startswith("#"):
                continue                  # skip comments and blank lines
            parts = line.split(",")
            if len(parts) != 4:
                continue                  # skip broken lines
            time_, item, qty, price = parts
            return {"time": time_, "item": item, "qty": int(qty), "price": int(price)}
        raise StopIteration               # signal: no more orders

r = OrderReader(raw)
print(next(r), "pos =", r.pos)
print(next(r), "pos =", r.pos)
for order in r:                           # the loop continues from the bookmark
    print("loop got", order["item"], "pos =", r.pos)
print("second pass:", list(r))</div>
  <div class="fx" data-lang="text">{'time': '09:01', 'item': 'masala chai', 'qty': 2, 'price': 30} pos = 2
{'time': '09:05', 'item': 'samosa', 'qty': 3, 'price': 15} pos = 3
loop got cold coffee pos = 4
loop got masala chai pos = 6
second pass: []</div>
  <p>Follow <code>self.pos</code> through the six raw lines (index 0 to 5):</p>
  <table class="tbl out"><caption>Trace of OrderReader over Monday's log</caption>
    <tr><th>Call</th><th>Lines examined (index)</th><th>What happens</th><th>pos after</th><th>Returns</th></tr>
    <tr><td>1st <code>next(r)</code></td><td>0, 1</td><td>0 is a comment → skip; 1 is chai</td><td>2</td><td>chai, 2 × 30</td></tr>
    <tr><td>2nd <code>next(r)</code></td><td>2</td><td>samosa</td><td>3</td><td>samosa, 3 × 15</td></tr>
    <tr><td>loop: <code>next</code></td><td>3</td><td>cold coffee</td><td>4</td><td>cold coffee</td></tr>
    <tr><td>loop: <code>next</code></td><td>4, 5</td><td>4 is "till restarted" (1 part, not 4) → skip; 5 is chai</td><td>6</td><td>chai, 1 × 30</td></tr>
    <tr><td>loop: <code>next</code></td><td>none</td><td>pos 6 = len 6, while-loop ends</td><td>6</td><td><code>StopIteration</code> → loop ends</td></tr>
    <tr><td><code>list(r)</code></td><td>none</td><td>bookmark still at the end</td><td>6</td><td><code>[]</code></td></tr>
  </table>
  <p>Two things to see. The <code>for</code> loop did not restart: <code>__iter__</code> returned <code>self</code>, bookmark and all, so it carried on from pos 4 after our two manual <code>next</code> calls. And the second pass was empty, exactly like the list iterator and the file.</p>
  <h3>An iterable that can be looped many times</h3>
  <p>A list can be looped many times because its <code>__iter__</code> makes a <em>new</em> iterator each time. We copy that: <code>OrderLog</code> is an iterable whose <code>__iter__</code> opens the file and returns a fresh <code>OrderReader</code>.</p>
  <div class="fx" data-lang="py">class OrderLog:                           # an ITERABLE: hands out a fresh reader per loop
    def __init__(self, path):
        self.path = path
    def __iter__(self):
        with open(self.path) as f:
            return OrderReader(f.read().splitlines())

log = OrderLog("orders.log")
print(len(list(log)), len(list(log)))     # two full passes, because each gets a new bookmark
total = 0
for o in log:
    total += o["qty"] * o["price"]
print("revenue:", total)</div>
  <div class="fx" data-lang="text">4 4
revenue: 225</div>
  <p>Both <code>list(log)</code> calls saw all 4 orders, and the loop gave ₹225, the hand answer. Iterable (the book, <code>OrderLog</code>) and iterator (the bookmark, <code>OrderReader</code>) are now two separate classes, just like <code>list</code> and <code>list_iterator</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>class iterator</strong> implements <code>__iter__</code> (returning <code>self</code>) and <code>__next__</code> (returning the next item or raising <code>StopIteration</code>), and stores its position in instance attributes. A <strong>re-iterable</strong> container implements only <code>__iter__</code>, returning a new iterator each call.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Making a container its own iterator (putting <code>__next__</code> and <code>pos</code> on the container and returning <code>self</code> from <code>__iter__</code>). It then works once and silently returns nothing on the second loop, and two nested loops over it share one bookmark.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Generators.</b> <code>OrderReader</code> needed a class, two dunder methods, a <code>self.pos</code> counter, a <code>while</code> loop to skip lines and a manual <code>raise StopIteration</code>: 17 lines of bookkeeping to say "give the next clean order". Could Python remember our place for us?</div>

  <h2 id="pi-gen"><span class="num">03</span>Generators: Functions That Pause</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A normal function cannot remember its place: it runs top to bottom, <code>return</code> hands back one value, and all its local variables are thrown away. Next call starts again from line 1. So how could a plain function hand out orders one at a time, continuing where it left off?</p>
  </div>
  <p>A <strong>generator function</strong> is a function that contains the word <code>yield</code>. <code>yield</code> works like a <code>return</code> that does not forget. It hands one value to the caller and then the function <strong>pauses</strong>: it freezes at that exact line, with all its local variables still holding their values. When the caller asks for the next value, the function <strong>resumes</strong> from the line just after the <code>yield</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cricket match stopped for rain. Play halts at over 32.4 with the score at 187/4. Nobody restarts the match from ball one. When the rain stops, play resumes from the very next ball, same batsmen, same score. <code>yield</code> is the rain break; <code>next()</code> is "play resumes". A normal <code>return</code> is the match being abandoned: the scorecard is thrown away.</p></div>
  <h3>return forgets, yield pauses</h3>
  <div class="fx" data-lang="py">def first_order(lines):                   # a normal function
    for line in lines:
        if line and not line.startswith("#"):
            return line                   # ends the function; its locals are thrown away

def every_order(lines):                   # a generator function (it contains yield)
    for line in lines:
        if line and not line.startswith("#"):
            yield line                    # pauses the function; its locals are kept

print(first_order(raw))
print(first_order(raw))                   # starts again from the top: same answer
g = every_order(raw)
print(next(g))
print(next(g))                            # continues where it paused: the NEXT line</div>
  <div class="fx" data-lang="text">09:01,masala chai,2,30
09:01,masala chai,2,30
09:01,masala chai,2,30
09:05,samosa,3,15</div>
  <p><code>first_order</code> returned the chai line twice: each call started from the top. <code>every_order</code>'s second <code>next</code> gave the <em>samosa</em> line: the function continued inside its <code>for</code> loop, with <code>line</code> and the loop's position kept.</p>
  <h3>What "pausing" means concretely</h3>
  <p>When you call a generator function, Python does <strong>not</strong> run its body. It creates a <strong>generator object</strong> holding three things: the function's code, its local variables, and a marker for "which line am I on". Each <code>next()</code> runs the code from the marker until it reaches a <code>yield</code>, moves the marker there, and returns the yielded value. Nothing is sleeping or waiting between calls; the object just sits in memory until someone calls <code>next()</code> again.</p>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
    <defs><marker id="pi-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="44" class="tb">caller</text><text x="10" y="134" class="tg">generator</text>
    <line x1="90" y1="40" x2="650" y2="40" stroke="currentColor" opacity="0.3"/>
    <line x1="90" y1="130" x2="650" y2="130" stroke="currentColor" opacity="0.3"/>
    <text x="96" y="26">next()</text>
    <line x1="110" y1="44" x2="134" y2="114" stroke="currentColor" marker-end="url(#pi-a2)"/>
    <rect x="136" y="116" width="104" height="26" rx="4" class="fg sg"/><text x="144" y="134">yield chai</text>
    <line x1="240" y1="116" x2="266" y2="46" stroke="currentColor" marker-end="url(#pi-a2)"/><text x="250" y="90" class="tb">chai</text>
    <text x="244" y="164" class="tm">paused</text>
    <text x="282" y="26">next()</text>
    <line x1="296" y1="44" x2="320" y2="114" stroke="currentColor" marker-end="url(#pi-a2)"/>
    <rect x="322" y="116" width="128" height="26" rx="4" class="fg sg"/><text x="330" y="134">resume, samosa</text>
    <line x1="450" y1="116" x2="476" y2="46" stroke="currentColor" marker-end="url(#pi-a2)"/><text x="454" y="90" class="tb">samosa</text>
    <text x="454" y="164" class="tm">paused</text>
    <text x="490" y="26">… next()</text>
    <line x1="504" y1="44" x2="528" y2="114" stroke="currentColor" marker-end="url(#pi-a2)"/>
    <rect x="530" y="116" width="120" height="26" rx="4" class="fr sr"/><text x="538" y="134">runs off end</text>
    <text x="530" y="66" class="tr">StopIteration</text>
  </svg><figcaption>Time runs left to right. The top line is your code (the caller), the bottom line is the generator. Each next() jumps down into the generator, which runs until a yield and jumps back up with a value. Between jumps the generator is frozen with its variables intact. When it runs off the end, the caller gets StopIteration.</figcaption></figure>
  <h3>Traced line by line</h3>
  <p>Here is <code>OrderReader</code> rewritten as a generator, with prints inside so you can see which lines run on each <code>next()</code>.</p>
  <div class="fx" data-lang="py">def read_orders(lines):
    print("  gen: start")
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(",")
        if len(parts) != 4:
            print(f"  gen: skip bad line {line!r}")
            continue
        time_, item, qty, price = parts
        print(f"  gen: about to yield {item}")
        yield {"time": time_, "item": item, "qty": int(qty), "price": int(price)}
        print(f"  gen: resumed after {item}")
    print("  gen: finished")

g = read_orders(raw)                      # nothing printed yet!
print(type(g).__name__)
print("caller got", next(g)["item"])
print("caller got", next(g)["item"])
print("caller got", next(g)["item"])
print("caller got", next(g)["item"])
try:
    next(g)                               # nothing left
except StopIteration:
    print("StopIteration")</div>
  <div class="fx" data-lang="text">generator
  gen: start
  gen: about to yield masala chai
caller got masala chai
  gen: resumed after masala chai
  gen: about to yield samosa
caller got samosa
  gen: resumed after samosa
  gen: about to yield cold coffee
caller got cold coffee
  gen: resumed after cold coffee
  gen: skip bad line 'till restarted'
  gen: about to yield masala chai
caller got masala chai
  gen: resumed after masala chai
  gen: finished
StopIteration</div>
  <p>Read the output against this table. The key line is <code>g = read_orders(raw)</code>: it printed <em>nothing</em>, because calling a generator function only builds the generator object.</p>
  <table class="tbl out"><caption>Trace of g = read_orders(raw)</caption>
    <tr><th>Call</th><th>Lines of the body that run</th><th>Paused at</th><th>Caller receives</th></tr>
    <tr><td><code>read_orders(raw)</code></td><td>none</td><td>before the first line</td><td>a generator object</td></tr>
    <tr><td>1st <code>next(g)</code></td><td>"start"; loop: line 1 is a comment → <code>continue</code>; line 2 parsed; "about to yield masala chai"</td><td><code>yield</code>, with line = chai line</td><td>chai order</td></tr>
    <tr><td>2nd <code>next(g)</code></td><td>"resumed after masala chai"; loop moves to line 3; "about to yield samosa"</td><td><code>yield</code></td><td>samosa order</td></tr>
    <tr><td>3rd <code>next(g)</code></td><td>"resumed after samosa"; line 4; "about to yield cold coffee"</td><td><code>yield</code></td><td>cold coffee order</td></tr>
    <tr><td>4th <code>next(g)</code></td><td>"resumed"; line 5 "skip bad line"; line 6; "about to yield masala chai"</td><td><code>yield</code></td><td>chai order</td></tr>
    <tr><td>5th <code>next(g)</code></td><td>"resumed"; loop ends; "finished"; function returns</td><td>ended</td><td><code>StopIteration</code></td></tr>
  </table>
  <p>The <code>for</code> loop's position inside <code>raw</code> and every local variable were kept between calls. That is the "no bookkeeping" win: the generator's own local state <em>is</em> the bookmark. There is no <code>self.pos</code>, no class and no <code>raise StopIteration</code>; falling off the end of the function raises it for you.</p>
  <h3>The quiet version, used from now on</h3>
  <div class="fx" data-lang="py">def orders(lines):                        # the same generator without the prints
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(",")
        if len(parts) != 4:
            continue
        time_, item, qty, price = parts
        yield {"time": time_, "item": item, "qty": int(qty), "price": int(price)}

total = 0
for o in orders(raw):
    total += o["qty"] * o["price"]
    print(f"{o['item']:12} {o['qty']} x {o['price']:2} = {o['qty'] * o['price']:3}  running total {total}")
print("revenue:", total)</div>
  <div class="fx" data-lang="text">masala chai  2 x 30 =  60  running total 60
samosa       3 x 15 =  45  running total 105
cold coffee  1 x 90 =  90  running total 195
masala chai  1 x 30 =  30  running total 225
revenue: 225</div>
  <p>₹225, the hand answer, with the running totals 60, 105, 195, 225 from the table in section 01. In the loop the generator and the loop body take turns: the generator produces one order, the body adds it, then the generator resumes. A generator object is an iterator, so <code>for</code>, <code>list()</code>, <code>sum()</code>, <code>max()</code> all accept it.</p>
  <h3>The state machine for free</h3>
  <p>A generator is a small machine with three states. <code>inspect.getgeneratorstate</code> shows the state, and <code>gi_frame.f_locals</code> shows the saved local variables, the exact things <code>OrderReader</code> had to store on <code>self</code> by hand.</p>
  <div class="fx" data-lang="py">import inspect
g = orders(raw)
print(inspect.getgeneratorstate(g))
first = next(g)
loc = g.gi_frame.f_locals
print(inspect.getgeneratorstate(g), "| saved locals:", {k: loc[k] for k in ("line", "item", "qty")})
second = next(g)
loc = g.gi_frame.f_locals
print(inspect.getgeneratorstate(g), "| saved locals:", {k: loc[k] for k in ("line", "item", "qty")})
rest = list(g)
print(inspect.getgeneratorstate(g), "| frame:", g.gi_frame)</div>
  <div class="fx" data-lang="text">GEN_CREATED
GEN_SUSPENDED | saved locals: {'line': '09:01,masala chai,2,30', 'item': 'masala chai', 'qty': '2'}
GEN_SUSPENDED | saved locals: {'line': '09:05,samosa,3,15', 'item': 'samosa', 'qty': '3'}
GEN_CLOSED | frame: None</div>
  <p>CREATED (built, no line run) → SUSPENDED (paused at a <code>yield</code>, with <code>line</code>, <code>item</code>, <code>qty</code> saved; <code>qty</code> is still the string <code>'2'</code> because the <code>int()</code> happens in the yield line) → CLOSED (finished; the frame has been thrown away, so it is <code>None</code>).</p>
  <table class="tbl"><caption>Class iterator vs generator for the same job</caption>
    <tr><th></th><th>OrderReader (class)</th><th>orders() (generator)</th></tr>
    <tr><td>Lines of code</td><td>17</td><td>9</td></tr>
    <tr><td>Where the position lives</td><td><code>self.pos</code>, updated by hand</td><td>the paused <code>for</code> loop's own state</td></tr>
    <tr><td>Ending</td><td><code>raise StopIteration</code> by hand</td><td>automatic when the function ends</td></tr>
    <tr><td>Extra methods possible?</td><td>yes (e.g. <code>reset()</code>, <code>__len__</code>)</td><td>no, just <code>next</code>/<code>send</code>/<code>close</code></td></tr>
  </table>
  <p>One more detail: <code>return</code> inside a generator ends it, and any value you return travels on the <code>StopIteration</code> (a <code>for</code> loop ignores it; <code>yield from</code> in section 07 receives it).</p>
  <div class="fx" data-lang="py">def two_then_stop():
    yield "chai"
    return "done"            # ends the generator; "done" rides on StopIteration
    yield "samosa"           # never reached

g = two_then_stop()
print(next(g))
try:
    next(g)
except StopIteration as e:
    print("StopIteration, value =", repr(e.value))
print(list(two_then_stop()))</div>
  <div class="fx" data-lang="text">chai
StopIteration, value = 'done'
['chai']</div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Generator function</strong>: a <code>def</code> containing <code>yield</code>. Calling it returns a <strong>generator</strong>, an iterator whose <code>__next__</code> runs the body up to the next <code>yield</code>. <strong>yield</strong> hands out a value and suspends the function with its local state saved. Falling off the end or <code>return</code> raises <code>StopIteration</code> (the return value becomes <code>StopIteration.value</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"I called my function and nothing happened." If the body contains <code>yield</code> anywhere, even in a branch that never runs, calling it only creates a generator; no line runs until you loop over it or call <code>next</code>. This bites people who add a <code>yield</code> into a function that also writes a file.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Generator Expressions.</b> Turning orders into amounts is one line of logic (<code>qty * price</code>), but so far it needs a whole <code>def</code> with a loop and a <code>yield</code>. Is there a short form?</div>

  <h2 id="pi-genexp"><span class="num">04</span>Generator Expressions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You know list comprehensions: <code>[o["qty"] * o["price"] for o in day]</code>. Is there an equally short way to write a <em>generator</em>, and what exactly is different about it?</p>
  </div>
  <p>Swap the square brackets for round ones and you get a <strong>generator expression</strong>. A list comprehension builds the whole list right now. A generator expression builds nothing: it is a ready-made generator that computes each value only when asked.</p>
  <div class="fx" data-lang="py">amounts_list = [o["qty"] * o["price"] for o in orders(raw)]   # [ ]: the whole list, now
amounts_gen = (o["qty"] * o["price"] for o in orders(raw))    # ( ): a generator, nothing computed yet
print(amounts_list, type(amounts_gen).__name__)
print(sum(amounts_gen), sum(amounts_gen))                     # second pass: already used up
print(sum(o["qty"] * o["price"] for o in orders(raw)))        # inside a call the extra ( ) can go
print(max((o["price"], o["item"]) for o in orders(raw)))
print(any(o["item"] == "cold coffee" for o in orders(raw)))</div>
  <div class="fx" data-lang="text">[60, 45, 90, 30] generator
225 0
225
(90, 'cold coffee')
True</div>
  <p>Line by line. The list printed as <code>[60, 45, 90, 30]</code> (the amounts column of our hand table); the round-bracket version is a <code>generator</code> and shows no values, because none exist yet. The first <code>sum</code> pulled all four amounts: 225. The second <code>sum</code> got 0: the generator was already used up, and it said so silently. When a generator expression is the only argument of a call, its own brackets can go: <code>sum(… for o in …)</code>. <code>max</code> compared (price, item) pairs and found cold coffee at ₹90; <code>any</code> stops pulling at the first <code>True</code>, here at the third order.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Generator expression</strong>: <code>(expr for x in iterable if cond)</code>. Same syntax as a list comprehension but in round brackets; it returns a generator that evaluates <code>expr</code> lazily, one item per <code>next()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A generator expression is a generator: one pass only. Assigning it to a variable and using it twice gives the full answer once and an empty answer the second time (225, then 0 above).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Lazy Evaluation.</b> On four orders, list and generator give the same 225. So why does "compute only when asked" matter at all?</div>

  <h2 id="pi-lazy"><span class="num">05</span>Lazy Evaluation &amp; Memory</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What does a list comprehension cost when the log has not 4 orders but 10 million? And what if the stream never ends at all?</p>
  </div>
  <p><code>sum([amount for …])</code> first builds a list holding every amount, then adds them up. Every one of those numbers is an object in RAM at the same moment, even though <code>sum</code> only ever needs one at a time. <strong>Lazy evaluation</strong> means: do not compute a value until somebody actually asks for it. <code>sum(amount for …)</code> asks for one amount, adds it, throws it away, asks for the next. At any moment only one exists.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Chai Corner makes each cup when a customer orders it. It does not brew 500 cups at 6 a.m. and line them up. The list version is the 500-cup line-up: lots of counter space, and wasted if only 20 people come. The generator is brew-to-order.</p></div>
  <h3>The same idea at scale: ten million amounts</h3>
  <p>The code measures both versions with <code>tracemalloc</code>, a standard-library tool that records the peak memory Python allocated while a function ran. <code>x * x</code> stands in for "compute one order's amount".</p>
  <div class="fx" data-lang="py">import sys, tracemalloc, timeit
N = 10_000_000                            # think: ten million order amounts
print("generator object:", sys.getsizeof(x * x for x in range(N)), "bytes")

def peak_mb(fn):
    tracemalloc.start()
    fn()
    peak = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()
    return peak / 1e6

print(f"sum([...]) peak: {peak_mb(lambda: sum([x * x for x in range(N)])):.1f} MB")
print(f"sum(...)   peak: {peak_mb(lambda: sum(x * x for x in range(N))):.4f} MB")
print(f"time list: {timeit.timeit(lambda: sum([x * x for x in range(N)]), number=1):.2f}s")
print(f"time gen:  {timeit.timeit(lambda: sum(x * x for x in range(N)), number=1):.2f}s")</div>
  <div class="fx" data-lang="text">generator object: 200 bytes
sum([...]) peak: 409.1 MB
sum(...)   peak: 0.0005 MB
time list: 0.70s
time gen:  0.60s</div>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <text x="10" y="40">list [ … ]</text>
    <rect x="150" y="24" width="300" height="24" class="fr sr"/><text x="458" y="41">409 MB</text>
    <text x="10" y="90">generator ( … )</text>
    <rect x="150" y="74" width="2" height="24" class="fg sg"/><text x="162" y="91" class="tg">0.0005 MB</text>
    <text x="10" y="122" class="tm">peak memory of sum() over 10,000,000 values (tracemalloc)</text>
  </svg><figcaption>Bar length is peak memory. The list holds all 10 million numbers at once; the generator holds one, so its bar is almost invisible.</figcaption></figure>
  <p>The generator object itself is 200 bytes whether N is 10 or 10 billion: it stores only the recipe and the current position. The list version peaked at 409 MB. The generator was also a little faster here, because it never had to allocate that huge block. On small inputs a list comprehension is often slightly faster; the big wins of generators are memory and being able to stop early.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>sys.getsizeof(a_list)</code> reports only the list's array of pointers (about 89 MB here), not the integer objects it points to. Use <code>tracemalloc</code> to see real memory.</p></div>
  <h3>Infinite streams</h3>
  <p>Because a generator runs only when asked, it can describe a sequence that never ends. Chai Corner's token counter is one: 1, 2, 3, … forever. As a normal function, <code>while True</code> would hang; as a generator it is safe, because the caller takes only what it needs. <code>itertools.islice(it, n)</code> means "take the first n items" of any iterator.</p>
  <div class="fx" data-lang="py">import itertools

def token_numbers(start=1):              # the cafe's token counter: 1, 2, 3, ... forever
    n = start
    while True:                           # infinite, and that is fine
        yield n
        n += 1

tokens = token_numbers()
print(next(tokens), next(tokens), next(tokens))
print(list(itertools.islice(token_numbers(100), 5)))

def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
print(list(itertools.islice(fib(), 10)))</div>
  <div class="fx" data-lang="text">1 2 3
[100, 101, 102, 103, 104]
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]</div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Lazy evaluation</strong>: values are computed on demand, one at a time, instead of all up front (<strong>eager</strong> evaluation). Memory stays at about one item no matter how long the stream is, and the stream may be infinite.</p></div>
  <table class="tbl">
    <tr><th>Use a list when</th><th>Use a generator when</th></tr>
    <tr><td>Data fits in memory and you need <code>len</code>, indexing <code>x[5]</code>, sorting, or more than one pass</td><td>Data is huge, streaming or infinite; one pass is enough; you may stop early</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Pipelines.</b> One lazy step is easy. Real work is several steps: read lines, parse them, keep some, take the first few. Do the steps stay lazy when chained, or does each one build a full list?</div>

  <h2 id="pi-pipe"><span class="num">06</span>Generator Pipelines</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Imagine the till log of a whole chain of tea stalls, a billion lines. We want just the first three cold coffee orders. With lists, step 1 would read all billion lines before step 2 starts. Can the steps be connected so that only the lines we need are ever read?</p>
  </div>
  <p>With generators, you connect the steps like pipes. Each step pulls one item from the step before it, works on it, and passes it on. Nothing runs until the last step asks; then the demand travels backwards through the chain.</p>
  <figure class="viz"><svg viewBox="0 0 600 90" width="600">
    <defs><marker id="pi-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="110" height="36" rx="6" class="fb sb"/><text x="22" y="43">till_stream()</text>
    <rect x="160" y="20" width="90" height="36" rx="6" class="ft st"/><text x="174" y="43">orders()</text>
    <rect x="290" y="20" width="130" height="36" rx="6" class="fv sb"/><text x="300" y="43">only("cold coffee")</text>
    <rect x="460" y="20" width="130" height="36" rx="6" class="fg sg"/><text x="470" y="43">next / islice</text>
    <line x1="122" y1="38" x2="156" y2="38" stroke="currentColor" marker-end="url(#pi-a3)"/>
    <line x1="252" y1="38" x2="286" y2="38" stroke="currentColor" marker-end="url(#pi-a3)"/>
    <line x1="422" y1="38" x2="456" y2="38" stroke="currentColor" marker-end="url(#pi-a3)"/>
    <text x="10" y="80" class="tm">data flows left to right; demand flows right to left, one line at a time</text>
  </svg><figcaption>An assembly line. islice asks only() for an item, only() asks orders(), orders() asks till_stream() for one line. A line travels through every stage before the next one is read.</figcaption></figure>
  <p><code>till_stream</code> fakes the billion-line log, cycling through four menu items with a broken line every 7th line, and prints each line it reads so we can count. <code>orders</code> is our generator from section 03, unchanged: it does not care whether its input is a list, a file or another generator.</p>
  <div class="fx" data-lang="py">import itertools

def till_stream():                        # stand-in for a chain's billion-line till log
    menu = [("masala chai", 30), ("samosa", 15), ("cold coffee", 90), ("vada pav", 20)]
    for i in range(1, 1_000_000_000):
        print(f"  read line {i}")
        if i % 7 == 0:
            yield "till restarted"        # a broken line every 7th line
            continue
        item, price = menu[(i - 1) % 4]
        yield f"09:{i % 60:02d},{item},{i % 3 + 1},{price}"

def only(item, rows):
    return (r for r in rows if r["item"] == item)

pipe = only("cold coffee", orders(till_stream()))   # builds the chain, reads nothing
print("pipeline built")
print(next(pipe))                                     # pull ONE cold coffee
print(list(itertools.islice(pipe, 2)))                # pull two more</div>
  <div class="fx" data-lang="text">pipeline built
  read line 1
  read line 2
  read line 3
{'time': '09:03', 'item': 'cold coffee', 'qty': 1, 'price': 90}
  read line 4
  read line 5
  read line 6
  read line 7
  read line 8
  read line 9
  read line 10
  read line 11
  read line 12
  read line 13
  read line 14
  read line 15
[{'time': '09:11', 'item': 'cold coffee', 'qty': 3, 'price': 90}, {'time': '09:15', 'item': 'cold coffee', 'qty': 1, 'price': 90}]</div>
  <p>Step by step: building <code>pipe</code> printed nothing except our own "pipeline built". The first <code>next(pipe)</code> asked <code>only</code> for a row; it asked <code>orders</code>, which asked <code>till_stream</code> for a line. Lines 1 and 2 were chai and samosa, so <code>only</code> threw them away and kept asking; line 3 was the first cold coffee. <code>islice(pipe, 2)</code> then read lines 4–15: line 7 was "till restarted" and <code>orders</code> skipped it, line 11 and line 15 were cold coffees. Out of a billion lines, fifteen were read.</p>
  <h3>Batches</h3>
  <p>Training loops and database inserts want items in chunks. The same trick cuts any stream into batches without ever holding more than one batch. (The <code>:=</code> "walrus" operator assigns and tests in one go; the loop stops when a chunk comes back empty.)</p>
  <div class="fx" data-lang="py">def batches(it, size):                    # cut any stream into chunks
    it = iter(it)
    while chunk := list(itertools.islice(it, size)):
        yield chunk

print(list(batches(range(7), 3)))
print([[o["item"] for o in b] for b in batches(orders(raw), 3)])
print(list(itertools.batched(range(7), 3)))           # built in since Python 3.12</div>
  <div class="fx" data-lang="text">[[0, 1, 2], [3, 4, 5], [6]]
[['masala chai', 'samosa', 'cold coffee'], ['masala chai']]
[(0, 1, 2), (3, 4, 5), (6,)]</div>
  <p>Our four orders became a batch of 3 and a batch of 1. Python 3.12+ ships this as <code>itertools.batched</code>, which yields tuples.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>generator pipeline</strong> is a chain of generators (or generator expressions) each consuming the previous one. It is <strong>pull-based</strong>: the consumer at the end drives the whole chain, so memory is about one item per stage and work stops as soon as the consumer stops.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>One eager step breaks the chain: a <code>list(...)</code>, <code>sorted(...)</code> or <code>len(list(...))</code> in the middle reads the entire input at that point. Sorting and grouping by key need all the data, so do them on a reduced stream or in chunks.</p></div>
  <p>Where you meet it: <code>pd.read_csv(path, chunksize=100_000)</code> returns an iterator of DataFrames; PyTorch <code>IterableDataset</code> and Hugging Face <code>load_dataset(..., streaming=True)</code> stream examples. Interviews: "how would you process a 50 GB file on an 8 GB machine?" Stream it through a generator pipeline or in chunks.</p>
  <div class="bridge"><b>What this still can't tell us → next: yield from, send &amp; close.</b> Our generators only hand values <em>out</em>. How does one generator hand over all the items of another (Monday's log, then Tuesday's)? Can the caller send values <em>in</em>? And what happens to a file opened inside a generator if we stop early?</div>

  <h2 id="pi-more"><span class="num">07</span>yield from, send &amp; close</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A week of logs is several files. Writing <code>for line in f: yield line</code> inside another loop is clumsy. And a running total needs a generator that <em>receives</em> each new amount. Do generators support delegation and two-way talk?</p>
  </div>
  <h3>yield from: hand over another iterable</h3>
  <p><code>yield from other</code> means "yield every item of <code>other</code>, one by one, then carry on". Here <code>read_file</code> streams a file's lines, and <code>week</code> streams the orders of several files as one stream.</p>
  <div class="fx" data-lang="py">with open("tue.log", "w") as f:
    f.write("09:02,samosa,2,15\\n09:30,vada pav,4,20\\n")

def read_file(path):
    with open(path) as f:
        yield from f                      # same as: for line in f: yield line

def week(*paths):
    for p in paths:
        yield from orders(read_file(p))   # hand on every order of every day

for o in week("orders.log", "tue.log"):
    print(o["time"], o["item"], o["qty"] * o["price"])
print("week revenue:", sum(o["qty"] * o["price"] for o in week("orders.log", "tue.log")))</div>
  <div class="fx" data-lang="text">09:01 masala chai 60
09:05 samosa 45
09:12 cold coffee 90
09:20 masala chai 30
09:02 samosa 30
09:30 vada pav 80
week revenue: 335</div>
  <p>Monday's four orders (₹225) then Tuesday's two (2 × 15 = 30 and 4 × 20 = 80), ₹335 for the week, and never more than one line in memory. Notice that <code>read_file</code> has a <code>with open</code> <em>inside</em> the generator: the file stays open while the generator is paused and closes when it finishes. (<code>yield from</code> also passes <code>send</code> and <code>close</code> through to the inner generator and receives its <code>return</code> value.)</p>
  <h3>send: values in as well as out</h3>
  <p><code>yield</code> is also an expression. In <code>amount = yield total</code> the generator hands out <code>total</code>, pauses, and when resumed with <code>g.send(x)</code>, the <code>yield</code> expression evaluates to <code>x</code>. A plain <code>next(g)</code> is the same as <code>g.send(None)</code>. The first call must be <code>next</code> ("priming"), to run up to the first <code>yield</code>.</p>
  <div class="fx" data-lang="py">def running_total():
    total = 0
    while True:
        amount = yield total              # hand out the total, wait to RECEIVE the next amount
        total += amount

acc = running_total()
print("primed:", next(acc))               # run up to the first yield
for o in orders(raw):
    print(f"{o['item']:12} send {o['qty'] * o['price']:3} -&gt; total {acc.send(o['qty'] * o['price'])}")
acc.close()</div>
  <div class="fx" data-lang="text">primed: 0
masala chai  send  60 -&gt; total 60
samosa       send  45 -&gt; total 105
cold coffee  send  90 -&gt; total 195
masala chai  send  30 -&gt; total 225</div>
  <table class="tbl out"><caption>Trace of the running-total generator</caption>
    <tr><th>Call</th><th>amount received</th><th>total after</th><th>yielded back</th></tr>
    <tr><td><code>next(acc)</code></td><td>(none, just runs to the yield)</td><td>0</td><td>0</td></tr>
    <tr><td><code>send(60)</code></td><td>60</td><td>60</td><td>60</td></tr>
    <tr><td><code>send(45)</code></td><td>45</td><td>105</td><td>105</td></tr>
    <tr><td><code>send(90)</code></td><td>90</td><td>195</td><td>195</td></tr>
    <tr><td><code>send(30)</code></td><td>30</td><td>225</td><td>225</td></tr>
  </table>
  <p>A generator that receives values like this is the ancestor of the <strong>coroutine</strong>: Python's <code>async</code>/<code>await</code> (see <a class="xref" data-note="py_concurrency">Concurrency &amp; Async</a>) is built on exactly this pause-and-resume machinery.</p>
  <h3>close: stopping early still cleans up</h3>
  <p>If you stop pulling from a generator, it sits paused forever (until garbage collected). <code>g.close()</code> resumes it with a <code>GeneratorExit</code> exception raised at the paused <code>yield</code>, so any <code>finally</code> block (or <code>with</code> block) inside runs.</p>
  <div class="fx" data-lang="py">def watched(lines):
    try:
        for line in lines:
            yield line
    finally:
        print("  cleanup ran")            # on finishing, on close(), or when garbage-collected

g = watched(raw)
print(next(g))
g.close()                                 # we stop early: Python raises GeneratorExit at the yield
print(inspect.getgeneratorstate(g))</div>
  <div class="fx" data-lang="text"># Chai Corner till log, Monday
  cleanup ran
GEN_CLOSED</div>
  <p>We took one line and closed: "cleanup ran" printed, the state became CLOSED. This is the exact mechanism the <a class="xref" data-note="py_context">Context Managers</a> note relies on: a generator paused at <code>yield</code> inside <code>try/finally</code> is a ready-made "setup, pause, cleanup" machine.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>yield from it</strong>: delegate to a sub-iterator, yielding each of its items and returning its return value. <strong>g.send(v)</strong>: resume the generator, making the paused <code>yield</code> expression evaluate to <code>v</code>; returns the next yielded value. <strong>g.throw(exc)</strong>: raise <code>exc</code> at the paused <code>yield</code>. <strong>g.close()</strong>: raise <code>GeneratorExit</code> at the paused <code>yield</code> so cleanup runs.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>g.send(5)</code> on a brand-new generator fails with <code>TypeError: can't send non-None value to a just-started generator</code>: there is no paused <code>yield</code> yet to receive it. Prime with <code>next(g)</code> first.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: itertools.</b> We have written <code>batches</code>, a token counter and a week-chainer by hand. Python ships a whole toolbox of such lazy building blocks. Which ones matter?</div>

  <h2 id="pi-tools"><span class="num">08</span>itertools Essentials</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Running totals, numbering, joining streams, taking a slice, grouping by item: must we write a generator for each, or are they already built and lazy?</p>
  </div>
  <p>The <code>itertools</code> module is a set of generators written in C. Each takes iterators and returns an iterator, so they snap into pipelines. Here they all run on the same four orders.</p>
  <div class="fx" data-lang="py">import itertools, operator
day = list(orders(raw))
amounts = [o["qty"] * o["price"] for o in day]
print("amounts:   ", amounts)
print("accumulate:", list(itertools.accumulate(amounts)))
print("count:     ", list(zip(itertools.count(101), (o["item"] for o in day))))
print("chain:     ", [o["item"] for o in itertools.chain(orders(raw), week("tue.log"))])
print("islice:    ", [o["item"] for o in itertools.islice(orders(raw), 1, 3)])
print("takewhile: ", [o["time"] for o in itertools.takewhile(lambda o: o["time"] &lt; "09:10", day)])
print("pairwise:  ", list(itertools.pairwise(amounts)))
print("batched:   ", list(itertools.batched(amounts, 3)))
a, b = itertools.tee(orders(raw))
print("tee:       ", sum(1 for _ in a), "orders,", sum(o["qty"] for o in b), "items")
by_item = sorted(day, key=operator.itemgetter("item"))
for item, grp in itertools.groupby(by_item, key=operator.itemgetter("item")):
    print("groupby:   ", item, "-&gt;", sum(o["qty"] for o in grp), "sold")
print("unsorted groupby:", [(k, len(list(g))) for k, g in itertools.groupby(o["item"] for o in day)])</div>
  <div class="fx" data-lang="text">amounts:    [60, 45, 90, 30]
accumulate: [60, 105, 195, 225]
count:      [(101, 'masala chai'), (102, 'samosa'), (103, 'cold coffee'), (104, 'masala chai')]
chain:      ['masala chai', 'samosa', 'cold coffee', 'masala chai', 'samosa', 'vada pav']
islice:     ['samosa', 'cold coffee']
takewhile:  ['09:01', '09:05']
pairwise:   [(60, 45), (45, 90), (90, 30)]
batched:    [(60, 45, 90), (30,)]
tee:        4 orders, 7 items
groupby:    cold coffee -&gt; 1 sold
groupby:    masala chai -&gt; 3 sold
groupby:    samosa -&gt; 3 sold
unsorted groupby: [('masala chai', 1), ('samosa', 1), ('cold coffee', 1), ('masala chai', 1)]</div>
  <table class="tbl"><caption>What each tool did on our orders</caption>
    <tr><th>Tool</th><th>Does</th><th>On Monday's orders</th></tr>
    <tr><td><code>accumulate(xs)</code></td><td>running totals</td><td>60, 105, 195, 225 (the hand table)</td></tr>
    <tr><td><code>count(start)</code></td><td>endless counter</td><td>tokens 101–104 zipped to the items</td></tr>
    <tr><td><code>chain(a, b)</code></td><td>one stream after another</td><td>Monday's 4 items then Tuesday's 2</td></tr>
    <tr><td><code>islice(it, start, stop)</code></td><td>slice any iterator</td><td>orders 1 and 2 (samosa, cold coffee)</td></tr>
    <tr><td><code>takewhile(pred, it)</code></td><td>take while true, then stop</td><td>orders before 09:10: 09:01, 09:05</td></tr>
    <tr><td><code>pairwise(it)</code></td><td>neighbouring pairs</td><td>(60, 45), (45, 90), (90, 30)</td></tr>
    <tr><td><code>batched(it, n)</code></td><td>tuples of n</td><td>(60, 45, 90), (30,)</td></tr>
    <tr><td><code>tee(it)</code></td><td>split one iterator into two</td><td>4 orders and 7 items from one generator</td></tr>
    <tr><td><code>groupby(it, key)</code></td><td>groups of <em>consecutive</em> equal keys</td><td>sorted: cold coffee 1, masala chai 3, samosa 3</td></tr>
  </table>
  <p>The last line is the classic trap: <code>groupby</code> only groups <em>neighbouring</em> equal keys. Unsorted, masala chai appeared as two separate groups of 1. Sort by the same key first (or use a dict/<code>Counter</code>).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>itertools</strong>: standard-library module of lazy iterator building blocks: infinite (<code>count</code>, <code>cycle</code>, <code>repeat</code>), terminating (<code>accumulate</code>, <code>chain</code>, <code>islice</code>, <code>takewhile</code>, <code>dropwhile</code>, <code>groupby</code>, <code>pairwise</code>, <code>batched</code>, <code>tee</code>, <code>zip_longest</code>) and combinatoric (<code>product</code>, <code>permutations</code>, <code>combinations</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>tee</code> buffers every item one copy has seen and the other has not; if one copy runs far ahead, that buffer becomes the whole list you were trying to avoid. If you need two full passes, make a list.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We now have protocol, class iterator, generator, expression, pipeline, delegation and toolbox. How are they built from each other?</div>

  <h2 id="pi-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Are iterators, generators, generator expressions, pipelines and itertools separate features, or layers of one idea?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
    <defs><marker id="pi-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="250" y="8" width="180" height="40" rx="6" class="fb sb"/><text x="340" y="26" text-anchor="middle" font-size="12">iterator protocol</text><text x="340" y="41" text-anchor="middle" class="tm" font-size="10">__iter__ + __next__ + StopIteration</text>
    <line x1="290" y1="48" x2="140" y2="86" stroke="currentColor" marker-end="url(#pi-a9)"/>
    <line x1="340" y1="48" x2="340" y2="86" stroke="currentColor" marker-end="url(#pi-a9)"/>
    <line x1="390" y1="48" x2="540" y2="86" stroke="currentColor" marker-end="url(#pi-a9)"/>
    <rect x="50" y="88" width="180" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="140" y="106" text-anchor="middle" font-size="12">for loop</text><text x="140" y="121" text-anchor="middle" class="tm" font-size="10">calls iter once, next until stop</text>
    <rect x="250" y="88" width="180" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="106" text-anchor="middle" font-size="12">class iterator</text><text x="340" y="121" text-anchor="middle" class="tm" font-size="10">OrderReader, self.pos</text>
    <rect x="450" y="88" width="180" height="40" rx="6" class="ft st"/><text x="540" y="106" text-anchor="middle" font-size="12">generator (yield)</text><text x="540" y="121" text-anchor="middle" class="tm" font-size="10">protocol written for you</text>
    <line x1="430" y1="108" x2="448" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pi-a9)"/>
    <line x1="500" y1="128" x2="400" y2="170" stroke="currentColor" marker-end="url(#pi-a9)"/>
    <line x1="540" y1="128" x2="540" y2="170" stroke="currentColor" marker-end="url(#pi-a9)"/>
    <line x1="590" y1="128" x2="640" y2="170" stroke="currentColor" marker-end="url(#pi-a9)"/>
    <rect x="300" y="172" width="170" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="385" y="190" text-anchor="middle" font-size="12">generator expression</text><text x="385" y="205" text-anchor="middle" class="tm" font-size="10">one-line generator</text>
    <rect x="480" y="172" width="120" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="540" y="190" text-anchor="middle" font-size="12">send / yield from</text><text x="540" y="205" text-anchor="middle" class="tm" font-size="10">two-way, delegate</text>
    <rect x="610" y="172" width="64" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="642" y="196" text-anchor="middle" font-size="11">close</text>
    <line x1="385" y1="212" x2="300" y2="248" stroke="currentColor" marker-end="url(#pi-a9)"/>
    <rect x="160" y="250" width="270" height="40" rx="6" class="fg sg"/><text x="295" y="268" text-anchor="middle" font-size="12">lazy pipelines + itertools</text><text x="295" y="283" text-anchor="middle" class="tm" font-size="10">read → parse → filter → take; 409 MB → 0.0005 MB</text>
    <line x1="642" y1="212" x2="642" y2="270" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pi-a9)"/>
    <text x="560" y="290" class="tm" font-size="10">→ @contextmanager (Context Managers)</text>
  </svg><figcaption>Everything grows from one protocol: "give me an iterator; give me the next item; StopIteration means done". The for loop consumes it, a class can implement it by hand, a generator implements it automatically, and everything below the generator (expressions, send, pipelines, itertools) is built from generators. close() leads straight into the Context Managers note.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same Chai Corner log</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>When to use</th></tr>
    <tr><td>Iterator protocol</td><td><code>__iter__</code>, <code>__next__</code>, <code>StopIteration</code></td><td>how does for walk anything?</td><td><code>next(it)</code> × 3 then StopIteration</td><td>understanding every loop</td></tr>
    <tr><td>Iterable vs iterator</td><td>protocol; fresh vs same bookmark</td><td>why can I loop a list twice but not a file?</td><td><code>iter(lines) is iter(lines)</code> False; file second pass <code>[]</code></td><td>deciding if data can be re-read</td></tr>
    <tr><td>Class iterator</td><td>protocol + state on <code>self</code></td><td>how do I make my own loopable thing?</td><td>pos 2, 3, 4, 6 → 4 orders</td><td>iterators with extra methods or state</td></tr>
    <tr><td>Generator</td><td>a function + <code>yield</code> (protocol automatic)</td><td>can Python keep my place for me?</td><td>9 lines, ₹225, states CREATED → SUSPENDED → CLOSED</td><td>almost every custom iterator</td></tr>
    <tr><td>Generator expression</td><td>generator in one line</td><td>short form for map/filter?</td><td><code>sum(…)</code> = 225, second sum = 0</td><td>a single transformation</td></tr>
    <tr><td>Lazy evaluation</td><td>generators pulling on demand</td><td>how to handle huge or endless data?</td><td>409 MB → 0.0005 MB; tokens 1, 2, 3 …</td><td>data bigger than RAM, streams</td></tr>
    <tr><td>Pipeline</td><td>generators feeding generators</td><td>do several steps stay lazy?</td><td>3 cold coffees from 15 of 10⁹ lines</td><td>ETL, log processing, data loading</td></tr>
    <tr><td><code>yield from</code> / <code>send</code> / <code>close</code></td><td>generator methods</td><td>delegate, receive values, clean up?</td><td>week ₹335; totals 60 → 225; "cleanup ran"</td><td>chaining sources; coroutines; resource cleanup</td></tr>
    <tr><td>itertools</td><td>ready-made C generators</td><td>do I have to write these myself?</td><td>accumulate 60, 105, 195, 225</td><td>any stream manipulation</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a <code>for</code> loop is just repeated <code>next()</code> on an iterator; a generator is the easy way to write an iterator because a paused function keeps its own place; and because nothing runs until someone calls <code>next()</code>, chains of generators process any amount of data one item at a time.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Laziness and one-pass behaviour are the source of the power and of almost every bug. Here are the bugs.</div>

  <h2 id="pi-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Iterators fail silently instead of raising errors. Which mistakes does that cause in real code, and what does each look like on our log?</p>
  </div>
  <h3>1. Looping over an iterator twice</h3>
  <div class="fx" data-lang="py">rows = orders(raw)
n = sum(1 for _ in rows)                  # first pass: counts the orders
total = sum(o["qty"] * o["price"] for o in rows)   # second pass: nothing left
print(n, total)
rows = list(orders(raw))                  # fix: keep a list (it fits in memory)
print(len(rows), sum(o["qty"] * o["price"] for o in rows))</div>
  <div class="fx" data-lang="text">4 0
4 225</div>
  <p>Counting used up the generator, so the total came out 0 instead of 225, with no error. Fix: <code>list(...)</code> if it fits in memory, or create a fresh generator for each pass (or compute both in one pass).</p>
  <h3>2. Asking a generator for its length or an index</h3>
  <div class="fx" data-lang="py">g = orders(raw)
for attempt in (lambda: len(g), lambda: g[0]):
    try:
        attempt()
    except TypeError as e:
        print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: object of type 'generator' has no len()
TypeError: 'generator' object is not subscriptable</div>
  <p>A generator does not know how many items it will produce until it has produced them. Use <code>sum(1 for _ in g)</code> (which consumes it) or a list.</p>
  <h3>3. Testing membership consumes items</h3>
  <div class="fx" data-lang="py">g = (o["item"] for o in orders(raw))
print("samosa" in g, list(g))             # "in" ate everything up to samosa</div>
  <div class="fx" data-lang="text">True ['cold coffee', 'masala chai']</div>
  <p><code>"samosa" in g</code> pulled masala chai and samosa to find it; only the remaining two items were left for <code>list(g)</code>.</p>
  <h3>4. Returning a lazy generator from inside "with open"</h3>
  <div class="fx" data-lang="py">def lines_of(path):
    with open(path) as f:
        return (line.strip() for line in f)   # lazy... and the file closes on return

g = lines_of("orders.log")
try:
    next(g)
except ValueError as e:
    print("ValueError:", e)

def lines_of_fixed(path):
    with open(path) as f:
        yield from (line.strip() for line in f)  # the function itself pauses inside "with"

print(next(lines_of_fixed("orders.log")))</div>
  <div class="fx" data-lang="text">ValueError: I/O operation on closed file.
# Chai Corner till log, Monday</div>
  <p><code>lines_of</code> built a generator expression over <code>f</code> and returned it, which left the <code>with</code> block and closed the file before a single line was read. In <code>lines_of_fixed</code> the function itself is a generator, so it pauses <em>inside</em> the <code>with</code> and the file stays open until the stream is finished.</p>
  <div class="callout trap"><span class="label">More traps in one line each</span>
    <p>A stray <code>yield</code> makes a function do nothing when called. <code>groupby</code> on unsorted data splits groups. <code>send</code> to an unprimed generator raises <code>TypeError</code>. A <code>list(...)</code> in the middle of a pipeline makes it eager. Modifying a list while iterating over it skips items. <code>zip</code> stops silently at the shortest input (use <code>zip(..., strict=True)</code> to get an error).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Closures &amp; Decorators.</b> A generator is a function that keeps its variables between calls. The next note meets a second way for a function to keep variables, the <strong>closure</strong>, and uses it to wrap extra behaviour (timing, retries) around functions like our <code>total_revenue</code>. Read <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>.</div>

  <h2 id="pi-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Chai Corner's Monday log, six lines: a comment, chai 2 × 30, samosa 3 × 15, cold coffee 1 × 90, junk ("till restarted"), chai 1 × 30. Valid: 4 orders, 7 items, ₹225.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our log</th><th>Weakness → next</th></tr>
    <tr><td>for loop</td><td>how does one loop walk anything?</td><td><code>iter</code> once, <code>next</code> until StopIteration</td><td>what is the thing <code>iter</code> returns?</td></tr>
    <tr><td>Iterable vs iterator</td><td>book vs bookmark?</td><td>list → new iterator each time; file is its own</td><td>built-ins give raw lines, not orders</td></tr>
    <tr><td>Class iterator</td><td>make my own loopable object?</td><td>OrderReader: pos 2, 3, 4, 6</td><td>17 lines of bookkeeping</td></tr>
    <tr><td>Generator</td><td>let Python keep my place?</td><td>9 lines, same 4 orders</td><td>still a full def for one line</td></tr>
    <tr><td>Generator expression</td><td>one-line generator?</td><td>sum = 225, then 0</td><td>why does lazy matter?</td></tr>
    <tr><td>Lazy evaluation</td><td>huge or endless data?</td><td>409 MB vs 0.0005 MB</td><td>several steps?</td></tr>
    <tr><td>Pipeline</td><td>chain lazy steps?</td><td>15 of 10⁹ lines read</td><td>delegate / receive / clean up?</td></tr>
    <tr><td>yield from, send, close</td><td>generator methods</td><td>week ₹335; totals → 225</td><td>don't rewrite common tools</td></tr>
    <tr><td>itertools</td><td>ready-made lazy tools</td><td>accumulate 60, 105, 195, 225</td><td>one-pass traps</td></tr>
  </table>
  <h3>Definitions and "formulas"</h3>
  <table class="tbl">
    <tr><th>Name</th><th>What Python actually does</th><th>Meaning of each part</th></tr>
    <tr><td><code>for x in obj: body</code></td><td><code>it = iter(obj)</code>; loop: <code>try: x = next(it)</code> <code>except StopIteration: break</code>; <code>body</code></td><td><code>iter</code> calls <code>obj.__iter__()</code>; <code>next</code> calls <code>it.__next__()</code></td></tr>
    <tr><td>Iterator</td><td><code>__next__</code> + <code>__iter__</code> returning <code>self</code></td><td>remembers a position; one pass</td></tr>
    <tr><td>Iterable</td><td><code>__iter__</code> returning a new iterator</td><td>can be looped many times</td></tr>
    <tr><td>Generator function</td><td>any <code>def</code> containing <code>yield</code></td><td>call → generator object; no body line runs</td></tr>
    <tr><td><code>yield v</code></td><td>hand out <code>v</code>, pause, keep locals</td><td>resumes after the yield on the next <code>next()</code></td></tr>
    <tr><td><code>x = yield v</code></td><td>as above, and <code>x</code> = value of the next <code>send</code></td><td><code>next(g)</code> ≡ <code>g.send(None)</code></td></tr>
    <tr><td><code>yield from it</code></td><td><code>for v in it: yield v</code> (+ passes send/throw/close, returns its return value)</td><td>delegation</td></tr>
    <tr><td><code>(expr for x in xs)</code></td><td>a generator</td><td>lazy version of <code>[expr for x in xs]</code></td></tr>
    <tr><td><code>g.close()</code></td><td>raise <code>GeneratorExit</code> at the paused yield</td><td><code>finally</code> / <code>with</code> inside run</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a generator</b><p>Big files, streams, infinite sequences, multi-step processing where each item can be handled alone, stopping early.</p><small>read → parse → filter → take</small></div>
    <div><b>Use a list</b><p>Small data, need <code>len</code>, indexing, sorting, or two passes.</p><small><code>rows = list(gen)</code></small></div>
    <div><b>Use a class iterator</b><p>When the iterator needs extra methods (reset, peek, length) or complex state that is clearer as attributes.</p><small>otherwise prefer a generator</small></div>
    <div><b>Use itertools</b><p>Before writing any counter, chunker, chainer, running total or grouper by hand.</p><small>sort before groupby</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Second pass over an iterator is empty (silently); no <code>len</code>/indexing; <code>in</code> consumes; a stray <code>yield</code> stops the function running when called; returning a generator from inside <code>with open</code> → closed file; <code>groupby</code> needs sorted input; prime before <code>send</code>; <code>tee</code> can buffer everything.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>g = (x for x in [60, 45, 90, 30])</code>; <code>sum(g), sum(g)</code>?</td><td><code>(225, 0)</code></td></tr>
    <tr><td>What prints when you call a generator function that has a print on its first line?</td><td>Nothing; the print runs on the first <code>next()</code></td></tr>
    <tr><td><code>iter(f) is f</code> for an open file?</td><td><code>True</code>: a file is its own iterator, so it is one-pass</td></tr>
    <tr><td>Running-total generator: <code>next</code>, then <code>send(60)</code>, <code>send(45)</code>. Last result?</td><td>105</td></tr>
    <tr><td>Peak memory, sum over 10M items: list vs generator?</td><td>About 409 MB vs about 0.0005 MB</td></tr>
  </table>

  <h2 id="pi-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a <code>for</code> loop actually do?</summary><div class="qa-body"><code>it = iter(obj)</code> (calls <code>obj.__iter__()</code>), then repeatedly <code>x = next(it)</code> (calls <code>it.__next__()</code>) and runs the body, until <code>next</code> raises <code>StopIteration</code>, which the loop catches silently and stops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Iterable vs iterator?</summary><div class="qa-body">An iterable has <code>__iter__</code> and returns a fresh iterator each time (list, dict, str), so it can be looped many times. An iterator has <code>__next__</code>, remembers its position, and returns itself from <code>__iter__</code>, so it can be consumed only once. Every iterator is iterable; not every iterable is an iterator.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>yield</code> vs <code>return</code>?</summary><div class="qa-body"><code>return</code> ends the function and throws away its local variables. <code>yield</code> hands back a value and <em>pauses</em>, keeping the local variables and the current line for the next <code>next()</code>. A <code>return</code> inside a generator ends it (raises StopIteration, carrying the return value).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "a generator pauses" mean concretely?</summary><div class="qa-body">The generator object stores the function's code, its local variables (its frame) and the position of the last <code>yield</code>. Between <code>next()</code> calls nothing is running; the object just keeps that saved state in memory. The next <code>next()</code> continues from the line after that <code>yield</code> with the same variables. <code>inspect.getgeneratorstate</code> shows GEN_SUSPENDED.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>g = (x for x in [1, 2, 3])</code>; <code>print(sum(g), list(g))</code></summary><div class="qa-body"><code>6 []</code>. <code>sum</code> uses up the generator; the second consumer gets nothing, with no error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you process a 50 GB CSV on an 8 GB laptop?</summary><div class="qa-body">Never load it whole. Stream it: iterate the file line by line in a generator pipeline (read → parse → filter → aggregate), or use <code>pd.read_csv(path, chunksize=100_000)</code> and combine per-chunk results. Memory stays at about one chunk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do generators make class iterators mostly unnecessary?</summary><div class="qa-body">A class iterator must store its position on <code>self</code> and raise <code>StopIteration</code> by hand. A generator's paused frame already stores every local variable and the current line, and Python generates <code>__iter__</code>/<code>__next__</code>/<code>StopIteration</code> for it. <code>OrderReader</code> was 17 lines; <code>orders()</code> is 9, same output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in a pipeline if one stage is a list comprehension instead of a generator?</summary><div class="qa-body">That stage reads its entire input before passing anything on, so laziness is lost from that point back to the source: memory grows to the full data and early stopping no longer saves work. In the billion-line demo, <code>[r for r in rows if …]</code> would read all 10⁹ lines before the first cold coffee came out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is a generator's <code>close()</code> the bridge to context managers?</summary><div class="qa-body">A generator paused at <code>yield</code> inside <code>try/finally</code> is a "setup, pause, cleanup" machine: code before the yield is setup, the pause is where the caller works, and <code>finally</code> runs when the generator is resumed, closed or thrown an exception. <code>@contextmanager</code> uses exactly this to make a <code>with</code> block from a generator.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>return (line for line in f)</code> inside <code>with open(...) as f</code> fail?</summary><div class="qa-body">Returning leaves the <code>with</code> block, which closes the file. The generator expression has not read anything yet; its first <code>next</code> reads a closed file: <code>ValueError: I/O operation on closed file</code>. Make the function itself a generator (<code>yield from</code> inside the <code>with</code>) so it pauses while the file is open.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>send</code> and <code>yield from</code> do?</summary><div class="qa-body"><code>g.send(v)</code> resumes a paused generator and makes the <code>yield</code> expression evaluate to <code>v</code> (prime with <code>next</code> first). <code>yield from it</code> yields every item of <code>it</code>, forwards send/throw/close to it, and evaluates to its return value. Both are the roots of coroutines and <code>async</code>/<code>await</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did <code>groupby</code> give masala chai twice?</summary><div class="qa-body"><code>itertools.groupby</code> groups only <em>consecutive</em> equal keys, because it is lazy and cannot look ahead. Our orders were chai, samosa, cold coffee, chai. Sort by the same key first, or count with a dict/<code>collections.Counter</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a list better than a generator?</summary><div class="qa-body">When the data fits in memory and you need <code>len</code>, indexing, slicing, sorting, random access or more than one pass. Lists are also slightly faster for small data and easier to debug (you can print them).</div></details>
</main>
`
});
