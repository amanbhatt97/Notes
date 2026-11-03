// notes/python/py_iterators.js — Iterators & Generators
Object.assign(TOPIC_CONTENT, {
  "py_iterators": `<main>
<h1>Iterators &amp; Generators</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions</span><span>Iterators &amp; Generators</span></div>
  <p class="lead">An <strong>iterator</strong> is an object that hands out the items of some collection or stream one at a time, each time you ask for the next one, and a <strong>generator</strong> is the easy way to write one: an ordinary-looking function that can pause after producing each value and carry on later. Every <code>for</code> loop, comprehension, <code>sum()</code> and <code>list()</code> in Python quietly relies on iterators. They matter in real work because they let a program process data that is far bigger than memory, one piece at a time: streaming a 50 GB log file, reading a CSV in chunks with <code>pd.read_csv(chunksize=...)</code>, or feeding batches to a model through a PyTorch <code>DataLoader</code>. The same pause-and-resume machinery is also what <code>async</code>/<code>await</code> is built on. Throughout this page we will work with one small file: the till log of a tea stall called Chai Corner, six lines containing four real orders, a comment and a junk line. We start by looking at how a plain <code>for</code> loop walks through it, and build up to lazy pipelines that could handle a billion lines.</p>

  <h2 id="pi-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Iterators &amp; Generators</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The protocol</div>
        <ul>
          <li><b>Iterable</b>: <code>iter(x)</code> gives a fresh iterator (list, str, dict, range)</li>
          <li><b>Iterator</b>: <code>next(it)</code> gives the next item or raises <code>StopIteration</code></li>
          <li>An iterator remembers its position and can be walked only once</li>
          <li><code>for</code> = <code>iter()</code> once, then <code>next()</code> until <code>StopIteration</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Generators</div>
        <ul>
          <li>A <code>def</code> containing <code>yield</code>; calling it runs no line yet</li>
          <li>Each <code>next()</code> runs to the next <code>yield</code> and pauses</li>
          <li>Local variables survive the pause</li>
          <li><code>(expr for x in xs)</code> is a generator expression</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Laziness</div>
        <ul>
          <li>Values made only when asked for; memory ≈ one item</li>
          <li>Infinite streams are fine; take what you need with <code>islice</code></li>
          <li>Pipelines: the last step pulls items through every stage</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Extras</div>
        <ul>
          <li><code>yield from</code> delegates; <code>send()</code> passes values in; <code>close()</code> runs cleanup</li>
          <li><b>itertools</b>: islice, chain, accumulate, groupby (sort first), tee, batched</li>
          <li>Traps: second pass is silently empty; no <code>len()</code>; <code>in</code> consumes</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pi-for"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Iterator Protocol</span><span class="rm-sub">what a for loop really does</span></div></div>
      <div class="rm-item rm-done" data-target="pi-class"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Writing an Iterator Class</span><span class="rm-sub">__iter__ and __next__ by hand</span></div></div>
      <div class="rm-item rm-done" data-target="pi-gen"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Generators and yield</span><span class="rm-sub">functions that pause and resume</span></div></div>
      <div class="rm-item rm-done" data-target="pi-genexp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Generator Expressions</span><span class="rm-sub">round brackets instead of square</span></div></div>
      <div class="rm-item rm-done" data-target="pi-lazy"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Lazy Evaluation and Memory</span><span class="rm-sub">one item at a time, even forever</span></div></div>
      <div class="rm-item rm-done" data-target="pi-pipe"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Generator Pipelines</span><span class="rm-sub">chaining steps that pull data through</span></div></div>
      <div class="rm-item rm-done" data-target="pi-more"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">yield from, send and close</span><span class="rm-sub">delegating, receiving values, cleaning up</span></div></div>
      <div class="rm-item rm-done" data-target="pi-tools"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">itertools</span><span class="rm-sub">ready-made iterator building blocks</span></div></div>
      <div class="rm-item rm-done" data-target="pi-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">used-up iterators, len, closed files</span></div></div>
      <div class="rm-item rm-done" data-target="pi-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">protocol, yield, itertools, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pi-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">protocol, laziness, send, internals</span></div></div>
    </div>
  </div>

  <h2 id="pi-for"><span class="num">01</span>The Iterator Protocol</h2>
  <p>Here is the till log we will use on this page. Each order line has the form <code>time,item,quantity,price</code>; the first line is a comment and line 5 is junk the till wrote when it restarted. The code writes the log to a file and also keeps its lines in a list called <code>raw</code>:</p>
  <div class="fx" data-lang="py">LOG = """# Chai Corner till log, Monday
09:01,masala chai,2,30
09:05,samosa,3,15
09:12,cold coffee,1,90
till restarted
09:20,masala chai,1,30
"""
with open("orders.log", "w") as f:        # (the "with" line is explained in Context Managers)
    f.write(LOG)

raw = LOG.splitlines()                    # the six lines as a list of strings
for n, line in enumerate(raw, start=1):
    print(n, repr(line))</div>
  <div class="fx" data-lang="text">1 '# Chai Corner till log, Monday'
2 '09:01,masala chai,2,30'
3 '09:05,samosa,3,15'
4 '09:12,cold coffee,1,90'
5 'till restarted'
6 '09:20,masala chai,1,30'</div>
  <p>You already know how to walk through a list like <code>raw</code> with a <code>for</code> loop. The same statement also walks through a string, a dictionary, a <code>range</code> that stores no numbers at all, and a file on disk that might be far too big to load. These are completely different kinds of object, yet one <code>for</code> statement handles all of them. How is that possible? The answer is that <code>for</code> knows nothing about lists or files. It only knows how to ask two questions. First it asks the object, "give me something that can walk through you". Then it asks that walker, over and over, "what is the next item?", until the walker answers "there are no more". Each type answers those two questions in its own way. This agreement is called the <strong>iterator protocol</strong>.</p>
  <p>A book and a bookmark make a good picture of it. The book is the thing you read; in Python it is called an <strong>iterable</strong>, any object you can loop over. The bookmark remembers where you are; that is an <strong>iterator</strong>. Each time you sit down, you read the next page and move the bookmark forward. Five friends can read the same book with five bookmarks at different pages. And a bookmark only moves forward: to start again, you take a new bookmark.</p>
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
  </svg><figcaption>The loop calls iter() once on the list and gets an iterator (the bookmark). Then it calls next() on that iterator once per item. When the items run out, the iterator raises StopIteration and the loop stops.</figcaption></figure>
  <p>The figure shows the two steps. In Python, the first question is the built-in function <code>iter(obj)</code>, which returns an iterator, and the second is <code>next(iterator)</code>, which returns the next item. When there are no items left, <code>next</code> does not return a special value; it raises an exception called <code>StopIteration</code>, and the <code>for</code> loop catches it and ends quietly. To prove that this is really all a <code>for</code> loop does, here is the same loop written twice: once with <code>for</code>, and once by hand with <code>while</code>, using three of the order lines:</p>
  <div class="fx" data-lang="py">lines = ["09:01,masala chai,2,30", "09:05,samosa,3,15", "09:12,cold coffee,1,90"]

for line in lines:
    print("for got  ", line)

it = iter(lines)                # step 1: ask the list for an iterator
while True:
    try:
        line = next(it)         # step 2: ask the iterator for the next item
    except StopIteration:       # step 3: no more items, so stop
        break
    print("while got", line)    # the loop body</div>
  <div class="fx" data-lang="text">for got   09:01,masala chai,2,30
for got   09:05,samosa,3,15
for got   09:12,cold coffee,1,90
while got 09:01,masala chai,2,30
while got 09:05,samosa,3,15
while got 09:12,cold coffee,1,90</div>
  <p>The <code>while</code> version printed exactly what the <code>for</code> version printed. That is because it <em>is</em> what <code>for</code> does: call <code>iter()</code> once, then call <code>next()</code> again and again, run the body with each item, and stop when <code>StopIteration</code> appears. Now let us poke an iterator directly, one <code>next</code> at a time, and compare a few different types:</p>
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
  <p><code>iter(lines)</code> gave a <code>list_iterator</code>, a small object that holds a reference to the list and a position number. Each <code>next(it)</code> returned one line and moved the position forward. The fourth call had nothing left to give and raised <code>StopIteration</code>; inside a <code>for</code> loop you never see that exception because the loop catches it.</p>
  <p>The line <code>iter(it) is it, iter(lines) is iter(lines)</code> printed <code>True False</code>, and it is the most important line on this page. Asking a <em>list</em> for an iterator gives a brand-new bookmark every time, which is why you can loop over a list as many times as you like. Asking an <em>iterator</em> for an iterator gives back the iterator itself, with its position unchanged. So an iterator can be walked through only once. The last loop shows that strings, dictionaries and ranges each have their own iterator type, but all of them answer <code>next()</code> in the same way. That shared answer is what lets one <code>for</code> statement serve them all.</p>
  <p>A file object is the most useful iterator of all, because each <code>next</code> reads one more line from the disk:</p>
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
  <p>The file object (its type is <code>TextIOWrapper</code>) is its own iterator, just like <code>it</code> above. Two <code>next</code> calls read lines 1 and 2, <code>list(f)</code> collected the remaining four, and a second pass got nothing at all. This is how <code>for line in open("big.csv")</code> can walk through a 20 GB file: only one line is in memory at a time. It also explains a very common surprise. Iterators that have been used up do not complain; they simply produce nothing. A file object, <code>zip(...)</code>, <code>map(...)</code>, <code>enumerate(...)</code> and every generator are iterators, so looping over one of them twice gives an empty second loop with no error.</p>
  <p>To summarise the vocabulary: an <strong>iterable</strong> is an object with an <code>__iter__</code> method that returns an iterator (lists, tuples, strings, dicts, sets, ranges, files). An <strong>iterator</strong> is an object with a <code>__next__</code> method that returns the next item or raises <code>StopIteration</code>, and whose <code>__iter__</code> returns itself. The built-ins <code>iter(x)</code> and <code>next(it)</code> simply call those two methods. Every iterator is iterable, but not every iterable is an iterator. In machine learning code you meet both: a PyTorch <code>DataLoader</code> is an iterable, so each epoch's <code>for batch in loader</code> gets a fresh pass, while <code>csv.reader(f)</code> is an iterator wrapped around a file iterator.</p>

  <h2 id="pi-class"><span class="num">02</span>Writing an Iterator Class</h2>
  <p>Now that we know the two questions, we can answer them for our own objects. We want something that walks through the raw log lines, skips the comment and the junk, and hands out each real order as a dictionary. Python finds the two answers through two special methods, often called dunder methods because their names have double underscores: <code>iter(obj)</code> calls <code>obj.__iter__()</code>, and <code>next(it)</code> calls <code>it.__next__()</code>. So we write a class, <code>OrderReader</code>, with both methods. The one thing it must remember between calls is its position, which we store as <code>self.pos</code>, the index of the next line to look at. When it runs out of lines, it must raise <code>StopIteration</code> itself.</p>
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
for order in r:                           # the loop carries on from the bookmark
    print("loop got", order["item"], "pos =", r.pos)
print("second pass:", list(r))</div>
  <div class="fx" data-lang="text">{'time': '09:01', 'item': 'masala chai', 'qty': 2, 'price': 30} pos = 2
{'time': '09:05', 'item': 'samosa', 'qty': 3, 'price': 15} pos = 3
loop got cold coffee pos = 4
loop got masala chai pos = 6
second pass: []</div>
  <p>Follow <code>self.pos</code> through the six raw lines, which have indexes 0 to 5. The first <code>next(r)</code> looks at line 0, sees a comment and skips it, then looks at line 1 and returns the chai order, leaving <code>pos</code> at 2. The second call returns the samosa order from line 2, leaving <code>pos</code> at 3. Then the <code>for</code> loop starts. It calls <code>iter(r)</code>, which returns <code>r</code> itself with its bookmark still at 3, so the loop does <em>not</em> start from the beginning: it gets the cold coffee (line 3), then skips "till restarted" on line 4 because it has one part instead of four, and gets the last chai from line 5, leaving <code>pos</code> at 6. The next call finds <code>pos</code> equal to the number of lines, falls out of the <code>while</code> loop and raises <code>StopIteration</code>, which ends the <code>for</code> loop. Finally, <code>list(r)</code> gets nothing, because the bookmark is still at the end. Our class behaves exactly like the list iterator and the file: one pass only.</p>
  <p>That is fine for an iterator, but often we want an object that can be looped over many times, as a list can. The trick a list uses is that its <code>__iter__</code> creates a <em>new</em> iterator each time it is called. We can do the same by splitting the job into two classes: an iterable that represents the log, and the iterator that walks it.</p>
  <div class="fx" data-lang="py">class OrderLog:                           # an ITERABLE: hands out a fresh reader per loop
    def __init__(self, path):
        self.path = path
    def __iter__(self):
        with open(self.path) as f:
            return OrderReader(f.read().splitlines())

log = OrderLog("orders.log")
print(len(list(log)), len(list(log)))     # two full passes: each gets a new bookmark
total = 0
for o in log:
    total += o["qty"] * o["price"]
print("revenue:", total)</div>
  <div class="fx" data-lang="text">4 4
revenue: 225</div>
  <p><code>OrderLog</code> has only an <code>__iter__</code> method, and each call opens the file and returns a fresh <code>OrderReader</code>. So both <code>list(log)</code> calls saw all four orders, and the loop afterwards still worked and added up ₹225. The book (<code>OrderLog</code>) and the bookmark (<code>OrderReader</code>) are now separate classes, exactly like <code>list</code> and <code>list_iterator</code>.</p>
  <p>A mistake to avoid is making a container its own iterator, by putting <code>pos</code> and <code>__next__</code> on the container and returning <code>self</code> from <code>__iter__</code>. It works once and then silently returns nothing, and two nested loops over the same container would share one bookmark and interfere with each other.</p>

  <h2 id="pi-gen"><span class="num">03</span>Generators and yield</h2>
  <p><code>OrderReader</code> works, but it took seventeen lines, a class, a position counter we update by hand, and a <code>raise StopIteration</code> we must remember. Why so much work? Because a normal function cannot hand out values one at a time. When a function says <code>return</code>, it finishes and all its local variables are thrown away, so the next call has to start from the top. The class exists only to remember, on <code>self</code>, where we had got to.</p>
  <p>A <strong>generator function</strong> removes that problem. It is any function that contains the keyword <code>yield</code>. <code>yield</code> works like a <code>return</code> that does not forget: it hands one value to whoever asked, and then the function <strong>pauses</strong>, frozen at that exact line, with all its local variables still holding their values. When the caller asks for the next value, the function <strong>resumes</strong> from the line just after the <code>yield</code>. Think of a cricket match stopped for rain at over 32.4 with the score at 187 for 4. When the rain stops, nobody restarts the match from the first ball; play resumes from the very next ball, with the same batsmen and the same score. <code>yield</code> is the rain break and <code>next()</code> is "play resumes". A <code>return</code>, by contrast, is the match being abandoned and the scorecard thrown away.</p>
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
print(next(g))                            # carries on where it paused: the NEXT line</div>
  <div class="fx" data-lang="text">09:01,masala chai,2,30
09:01,masala chai,2,30
09:01,masala chai,2,30
09:05,samosa,3,15</div>
  <p><code>first_order</code> is a normal function: both calls returned the chai line, because each call started from the top. <code>every_order</code> contains <code>yield</code>, so it is a generator function. Its second <code>next</code> gave the <em>samosa</em> line: the function had paused inside its <code>for</code> loop, and it carried on from there with <code>line</code> and the loop's position intact.</p>
  <p>There is one surprising detail. When you call a generator function, Python does <strong>not</strong> run any of its body. Instead it creates and returns a <strong>generator object</strong>, which holds the function's code, its local variables, and a marker saying which line it is on. A generator object is an iterator: each <code>next()</code> runs the code from the marker until it reaches a <code>yield</code>, moves the marker there, and returns the yielded value. Between calls nothing is running or waiting; the object just sits in memory until somebody calls <code>next()</code> again.</p>
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
  </svg><figcaption>Time runs left to right. The top line is your code, the bottom line is the generator. Each next() jumps down into the generator, which runs until a yield and jumps back up with a value. Between jumps the generator is frozen with its variables intact. When it runs off the end, the caller gets StopIteration.</figcaption></figure>
  <p>The figure shows control passing back and forth: down into the generator on each <code>next()</code>, up again at each <code>yield</code>. To see it in real code, here is <code>OrderReader</code> rewritten as a generator, with print statements inside so we can watch which lines run on each <code>next()</code>:</p>
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
  <p>Start with the line <code>g = read_orders(raw)</code>: it printed <em>nothing</em>, not even "gen: start". Calling the function only built the generator object, whose type is <code>generator</code>. The first <code>next(g)</code> ran the body from the top: it printed "start", skipped the comment, parsed the chai line, printed "about to yield masala chai" and paused at the <code>yield</code>, handing the chai order to the caller. The second <code>next(g)</code> resumed on the line after the <code>yield</code>, printed "resumed after masala chai", went round the loop to the samosa line and paused again. The fourth call is the interesting one: after resuming, the generator met "till restarted", printed "skip bad line" and carried on to the last chai line before pausing. On the fifth call the loop ran out, "finished" was printed, the function ended, and the caller got <code>StopIteration</code>. Notice what is missing compared with the class: there is no <code>self.pos</code> and no <code>raise StopIteration</code>. The paused <code>for</code> loop's own state is the bookmark, and falling off the end of the function ends the iteration automatically.</p>
  <p>Without the prints, the generator is just this, and because a generator object is an iterator, <code>for</code>, <code>list()</code>, <code>sum()</code> and <code>max()</code> all accept it:</p>
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
  <p>The running totals are 60, 105, 195 and 225. The generator and the loop body take turns: the generator produces one order, the body adds it, then the generator resumes and produces the next. From now on we will use this <code>orders()</code> generator as our standard way of reading the log.</p>
  <p>We can actually look inside a paused generator. <code>inspect.getgeneratorstate</code> reports its state, and <code>gi_frame.f_locals</code> shows the local variables it has saved, the very things <code>OrderReader</code> had to store on <code>self</code> by hand:</p>
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
  <p>A generator moves through three states. It starts as <code>GEN_CREATED</code>: built, but no line has run. After the first <code>next</code> it is <code>GEN_SUSPENDED</code>, paused at a <code>yield</code> with <code>line</code>, <code>item</code> and <code>qty</code> saved (<code>qty</code> is still the string <code>'2'</code>, because the conversion to <code>int</code> happens inside the yield line). After the second <code>next</code> the saved values have moved on to the samosa line. Once <code>list(g)</code> has taken the rest, the state is <code>GEN_CLOSED</code>, and the saved frame has been thrown away, so it shows <code>None</code>.</p>
  <p>Two more details complete the picture. First, a class that should be loopable many times can still use a generator: write its <code>__iter__</code> method with <code>yield</code> inside. Each loop calls <code>__iter__</code>, which returns a brand-new generator, so you get many passes without a separate iterator class. Second, a <code>return</code> inside a generator ends it, and any value you return travels inside the <code>StopIteration</code> exception as its <code>.value</code>:</p>
  <div class="fx" data-lang="py">class Squares:
    def __init__(self, n):
        self.n = n
    def __iter__(self):                   # a generator method: a new generator per loop
        for i in range(self.n):
            yield i * i

s = Squares(4)
print(list(s), list(s))

def two_then_stop():
    yield "chai"
    return "done"            # ends the generator; "done" travels on StopIteration
    yield "samosa"           # never reached

g = two_then_stop()
print(next(g))
try:
    next(g)
except StopIteration as e:
    print("StopIteration, value =", repr(e.value))
print(list(two_then_stop()))</div>
  <div class="fx" data-lang="text">[0, 1, 4, 9] [0, 1, 4, 9]
chai
StopIteration, value = 'done'
['chai']</div>
  <p><code>Squares(4)</code> could be listed twice because each <code>list()</code> got a new generator from <code>__iter__</code>. <code>two_then_stop</code> yielded "chai" and then returned "done"; the return value rode on the <code>StopIteration</code>, and the "samosa" line after it was never reached. A <code>for</code> loop ignores that value, but <code>yield from</code>, which we will meet later, receives it.</p>
  <p>A class iterator is still the right choice when the iterator needs extra methods, such as <code>reset()</code> or <code>peek()</code>, or state that other code must inspect. For everything else a generator is shorter and harder to get wrong. Be careful with one side effect of the rule "calling a generator function runs nothing": if a <code>yield</code> appears anywhere in a function, even in a branch that never runs, the whole function becomes a generator function, and calling it does nothing until somebody loops over the result.</p>

  <h2 id="pi-genexp"><span class="num">04</span>Generator Expressions</h2>
  <p>Many generators are so simple that writing a whole <code>def</code> feels excessive: "give me the amount of each order" is one line of logic. For these cases Python has a short form. You already know the list comprehension, <code>[expression for x in items]</code>. Swap the square brackets for round ones and you get a <strong>generator expression</strong>. A list comprehension builds the whole list immediately. A generator expression builds nothing: it creates a generator that computes each value only when asked.</p>
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
  <p>The list comprehension printed as <code>[60, 45, 90, 30]</code>; the round-bracket version is a <code>generator</code> and shows no values, because none exist yet. The first <code>sum</code> pulled all four amounts through it and got 225. The second <code>sum</code> on the same object got 0: the generator was used up after one pass, and it did not raise an error to tell us. When a generator expression is the only argument to a function, its own brackets can be dropped, which is why <code>sum(o["qty"] * o["price"] for o in ...)</code> works. <code>max</code> compared (price, item) pairs and found the cold coffee at ₹90, and <code>any</code> stopped pulling as soon as it found a <code>True</code>, at the third order.</p>
  <p>Generator expressions are the natural thing to pass to functions that consume a sequence once, such as <code>sum</code>, <code>max</code>, <code>min</code>, <code>any</code>, <code>all</code> and <code>"".join</code>. Use a list comprehension instead when you need the results more than once, need their length, or need to index into them.</p>

  <h2 id="pi-lazy"><span class="num">05</span>Lazy Evaluation and Memory</h2>
  <p>What do we actually gain from all this? Consider <code>sum([amount for ...])</code> with square brackets. Python first builds a list holding every amount and only then adds them up. Every number in that list is an object in memory at the same moment, even though <code>sum</code> only ever looks at one at a time. With round brackets, <code>sum(amount for ...)</code> asks for one amount, adds it, lets it go, and asks for the next. At any moment only one amount exists. Computing values only when somebody actually asks for them is called <strong>lazy evaluation</strong>; computing everything up front is called <strong>eager evaluation</strong>.</p>
  <p>Chai Corner makes each cup of tea when a customer orders it. It does not brew 500 cups at six in the morning and line them up on the counter. The list is the 500-cup line-up: it needs a lot of counter space, and most of it is wasted if only twenty customers come. The generator is brew-to-order. The code below measures both approaches over a million values, using <code>tracemalloc</code>, a standard-library tool that records the peak memory Python used while a function ran. <code>x * x</code> stands in for "compute one order's amount":</p>
  <div class="fx" data-lang="py">import sys, tracemalloc, timeit
N = 1_000_000                             # think: a million order amounts
print("generator object:", sys.getsizeof(x * x for x in range(N)), "bytes")

def peak_mb(fn):
    tracemalloc.start()
    fn()
    peak = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()
    return peak / 1e6

print(f"sum([...]) peak: {peak_mb(lambda: sum([x * x for x in range(N)])):.1f} MB")
print(f"sum(...)   peak: {peak_mb(lambda: sum(x * x for x in range(N))):.4f} MB")
print(f"time list: {timeit.timeit(lambda: sum([x * x for x in range(N)]), number=1):.3f}s")
print(f"time gen:  {timeit.timeit(lambda: sum(x * x for x in range(N)), number=1):.3f}s")</div>
  <div class="fx" data-lang="text">generator object: 200 bytes
sum([...]) peak: 40.4 MB
sum(...)   peak: 0.0005 MB
time list: 0.048s
time gen:  0.031s</div>
  <p>The generator object itself is about 200 bytes, and it stays that size whether it will produce ten values or ten billion, because it stores only the recipe and its current position. Summing through a list peaked at about 40 MB, because all million numbers existed at once; summing through a generator used almost nothing. The timings are approximate and vary between machines, but the generator is typically no slower here, because it never has to allocate that large block of memory. On small inputs a list comprehension is often slightly faster, so the real wins of generators are memory and the ability to stop early. If you ever measure this yourself, use <code>tracemalloc</code>: <code>sys.getsizeof(a_list)</code> reports only the list's internal array of pointers, not the number objects it points to.</p>
  <p>Laziness has a second, more surprising consequence: a generator can describe a sequence that never ends. Chai Corner's token counter hands out 1, 2, 3 and so on forever. Written as a normal function that returns a list, <code>while True</code> would run until the computer ran out of memory. Written as a generator it is perfectly safe, because it only computes the next token when asked. <code>itertools.islice(iterator, n)</code> means "take the first n items" of any iterator:</p>
  <div class="fx" data-lang="py">import itertools

def token_numbers(start=1):              # the stall's token counter: 1, 2, 3, ... forever
    n = start
    while True:                           # infinite, and that is fine
        yield n
        n += 1

tokens = token_numbers()
print(next(tokens), next(tokens), next(tokens))
print(list(itertools.islice(token_numbers(100), 5)))</div>
  <div class="fx" data-lang="text">1 2 3
[100, 101, 102, 103, 104]</div>
  <p>Three calls to <code>next</code> gave tokens 1, 2 and 3, and <code>islice</code> took exactly five tokens from a counter starting at 100, after which the generator was simply left paused and eventually thrown away. The same pattern describes any endless stream: sensor readings, messages arriving from a queue, or lines being appended to a live log file.</p>
  <table class="tbl">
    <tr><th>Use a list when</th><th>Use a generator when</th></tr>
    <tr><td>the data fits in memory and you need <code>len</code>, indexing like <code>x[5]</code>, sorting, or more than one pass</td><td>the data is huge, streamed or endless; one pass is enough; you may stop early</td></tr>
  </table>

  <h2 id="pi-pipe"><span class="num">06</span>Generator Pipelines</h2>
  <p>Real data processing has several steps: read lines, parse them into orders, keep only some orders, take the first few. If each step builds a list, the first step must read the entire input before the second step can start, so a billion-line log needs a billion-line list in memory. If instead each step is a generator that takes the previous step as its input, we get a <strong>generator pipeline</strong>. Each stage pulls one item from the stage before it, works on it and passes it on. Nothing happens at all until the final consumer asks for an item; then the demand travels backwards through the chain, and one item travels forwards.</p>
  <p>Think of a factory assembly line where each worker only starts on a part when the next worker reaches out for one. No piles of half-finished parts build up between stations, and if the last worker stops, everyone stops.</p>
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
  </svg><figcaption>islice asks only() for an item, only() asks orders(), and orders() asks till_stream() for one line. A line travels through every stage before the next one is read.</figcaption></figure>
  <p>The figure shows the pipeline we are about to build. <code>till_stream</code> pretends to be a huge till log for a chain of stalls: it cycles through four menu items, writes a broken line every seventh line, and prints each line it reads so that we can count them. <code>orders</code> is our generator from earlier, completely unchanged; it does not care whether its input is a list, a file or another generator. <code>only</code> keeps one item type.</p>
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
  <p>Building <code>pipe</code> read nothing: the only output is our own "pipeline built". The first <code>next(pipe)</code> asked <code>only</code> for a row, which asked <code>orders</code>, which asked <code>till_stream</code> for a line. Line 1 was a chai and line 2 a samosa, so <code>only</code> threw them away and asked again; line 3 was the first cold coffee, and it came back to us. Then <code>islice(pipe, 2)</code> asked for two more. That read lines 4 to 15: line 7 was "till restarted" and <code>orders</code> skipped it, and lines 11 and 15 were the next two cold coffees. Out of a log of almost a billion lines, fifteen were read, and memory never held more than one line at a time. Pipelines like this are the standard answer to the interview question "how would you process a 50 GB file on an 8 GB laptop?"</p>
  <p>Training loops and database inserts often want items in groups rather than one at a time. The same idea cuts any stream into <strong>batches</strong> without ever holding more than one batch. (The <code>:=</code> operator, nicknamed the walrus, assigns a value and tests it in one step; the loop stops when a chunk comes back empty.)</p>
  <div class="fx" data-lang="py">import itertools

def batches(it, size):                    # cut any stream into chunks
    it = iter(it)
    while chunk := list(itertools.islice(it, size)):
        yield chunk

print(list(batches(range(7), 3)))
print([[o["item"] for o in b] for b in batches(orders(raw), 3)])
print(list(itertools.batched(range(7), 3)))           # built in since Python 3.12</div>
  <div class="fx" data-lang="text">[[0, 1, 2], [3, 4, 5], [6]]
[['masala chai', 'samosa', 'cold coffee'], ['masala chai']]
[(0, 1, 2), (3, 4, 5), (6,)]</div>
  <p>Seven numbers became batches of 3, 3 and 1, and our four orders became a batch of three and a batch of one. Since Python 3.12 this is built in as <code>itertools.batched</code>, which yields tuples. The same pattern appears in libraries you will use: <code>pd.read_csv(path, chunksize=100_000)</code> returns an iterator of DataFrames, and PyTorch's <code>IterableDataset</code> and Hugging Face's <code>load_dataset(..., streaming=True)</code> stream examples one at a time.</p>
  <p>A pipeline is only as lazy as its greediest step. A single <code>list(...)</code>, <code>sorted(...)</code> or <code>len(list(...))</code> in the middle forces everything before it to run to completion at that point. Sorting and grouping need all the data by nature, so do them on an already-reduced stream, or chunk by chunk.</p>

  <h2 id="pi-more"><span class="num">07</span>yield from, send and close</h2>
  <p>So far our generators have only handed values out. They can do three more things: pass along every item of another iterable (<code>yield from</code>), receive values from the caller (<code>send</code>), and be stopped early while still running their cleanup code (<code>close</code>).</p>
  <p>Chai Corner now has a second day of orders in <code>tue.log</code>, and we want the whole week as a single stream. A generator that wants to hand on every item of another iterable could write <code>for x in other: yield x</code>, but Python has a shorter form, <code>yield from other</code>, which means "yield every item of <code>other</code>, one by one, then carry on":</p>
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
  <p><code>read_file</code> streams a file's lines with a single <code>yield from f</code>, and <code>week</code> hands on every order of every day using <code>yield from orders(...)</code>. The output is Monday's four orders followed by Tuesday's two (2 × 15 = 30 and 4 × 20 = 80), ₹335 for the week, and never more than one line was in memory. Notice that <code>read_file</code> has its <code>with open</code> <em>inside</em> the generator: the file stays open while the generator is paused and is closed when the generator finishes. Beyond saving a line, <code>yield from</code> also passes <code>send</code> and <code>close</code> calls through to the inner generator and receives its <code>return</code> value, which makes it the correct way for one generator to delegate to another.</p>
  <p>Values can also flow <em>into</em> a generator. <code>yield</code> is not only a statement but an expression with a value. In <code>amount = yield total</code>, the generator hands out <code>total</code> and pauses; when the caller resumes it with <code>g.send(x)</code>, the <code>yield</code> expression evaluates to <code>x</code>, which is stored in <code>amount</code>. A plain <code>next(g)</code> is the same as <code>g.send(None)</code>. Here is a running-total keeper that receives each order's amount:</p>
  <div class="fx" data-lang="py">def running_total():
    total = 0
    while True:
        amount = yield total              # hand out the total, then wait to RECEIVE an amount
        total += amount

acc = running_total()
print("primed:", next(acc))               # run up to the first yield
for o in orders(raw):
    print(f"{o['item']:12} send {o['qty'] * o['price']:3} -&gt; total {acc.send(o['qty'] * o['price'])}")

fresh = running_total()
try:
    fresh.send(60)                        # not primed: no paused yield to receive it
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">primed: 0
masala chai  send  60 -&gt; total 60
samosa       send  45 -&gt; total 105
cold coffee  send  90 -&gt; total 195
masala chai  send  30 -&gt; total 225
TypeError: can't send non-None value to a just-started generator</div>
  <p>The first call must be <code>next(acc)</code>, which runs the generator up to its first <code>yield</code> and hands out the starting total of 0. This step is called <strong>priming</strong>. After that, each <code>acc.send(amount)</code> delivers an amount into the paused <code>yield</code>, the generator adds it, loops round, and yields the new total: 60, 105, 195, 225. The last lines show why priming is needed: a brand-new generator has not reached any <code>yield</code> yet, so there is nowhere to deliver the value, and Python raises <code>TypeError</code>. A generator that receives values like this is the ancestor of the <strong>coroutine</strong>, a function that can pause and resume while exchanging data. Python's <code>async</code>/<code>await</code> (see <a class="xref" data-note="py_asyncio">asyncio</a>) is built on exactly this pause-and-resume machinery, with an event loop doing the resuming.</p>
  <p>Finally, what happens to a generator that we stop using halfway? It sits paused, holding whatever it had open, until it is garbage collected. <code>g.close()</code> ends it cleanly: Python resumes the generator by raising a special <code>GeneratorExit</code> exception at the paused <code>yield</code>, so any <code>finally</code> block, or <code>with</code> block, inside the generator gets to run:</p>
  <div class="fx" data-lang="py">import inspect

def watched(lines):
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
  <p>We took one line and then called <code>close()</code>: "cleanup ran" was printed and the state became <code>GEN_CLOSED</code>. There is also <code>g.throw(exc)</code>, which raises any exception you choose at the paused <code>yield</code>. This combination, a generator paused at <code>yield</code> inside <code>try/finally</code>, is a ready-made "set up, pause while someone else works, clean up" machine, and it is exactly what <code>@contextmanager</code> uses to build context managers (see <a class="xref" data-note="py_context">Context Managers</a>).</p>

  <h2 id="pi-tools"><span class="num">08</span>itertools</h2>
  <p>Many pipeline steps are needed so often that the standard library provides them. The <strong><code>itertools</code></strong> module is a collection of iterator building blocks written in C. Each one takes iterators and returns an iterator, so they snap straight into pipelines and stay lazy. Here they all run on our four Monday orders:</p>
  <div class="fx" data-lang="py">import itertools
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
print("tee:       ", sum(1 for _ in a), "orders,", sum(o["qty"] for o in b), "items")</div>
  <div class="fx" data-lang="text">amounts:    [60, 45, 90, 30]
accumulate: [60, 105, 195, 225]
count:      [(101, 'masala chai'), (102, 'samosa'), (103, 'cold coffee'), (104, 'masala chai')]
chain:      ['masala chai', 'samosa', 'cold coffee', 'masala chai', 'samosa', 'vada pav']
islice:     ['samosa', 'cold coffee']
takewhile:  ['09:01', '09:05']
pairwise:   [(60, 45), (45, 90), (90, 30)]
batched:    [(60, 45, 90), (30,)]
tee:        4 orders, 7 items</div>
  <p>Read the output line by line. <code>accumulate</code> produced running totals, the same 60, 105, 195, 225 we computed by hand. <code>count(101)</code> is an endless counter; zipped with the four items it numbered them 101 to 104 and stopped when the items ran out, because <code>zip</code> stops at the shortest input. <code>chain</code> joined Monday's stream and Tuesday's stream into one. <code>islice(…, 1, 3)</code> sliced an iterator the way <code>[1:3]</code> slices a list, giving orders 1 and 2. <code>takewhile</code> took orders while the time was before 09:10 and stopped at the first one that was not. <code>pairwise</code> gave neighbouring pairs, useful for differences between consecutive readings, and <code>batched</code> grouped the amounts in threes. <code>tee</code> split one generator into two independent iterators, so we could count the orders with one and total the items with the other.</p>
  <p><code>tee</code> has a hidden cost. It must store every item that one copy has seen and the other has not, so if one copy runs far ahead, that buffer grows into the very list you were trying to avoid. If you genuinely need two full passes, make a list.</p>
  <p>The tool that causes the most confusion is <code>groupby</code>, which groups items that share a key. Because it is lazy and cannot look ahead, it only groups <em>neighbouring</em> items with equal keys:</p>
  <div class="fx" data-lang="py">import itertools, operator
day = list(orders(raw))
print([(k, len(list(g))) for k, g in itertools.groupby(o["item"] for o in day)])   # unsorted

by_item = sorted(day, key=operator.itemgetter("item"))
for item, grp in itertools.groupby(by_item, key=operator.itemgetter("item")):
    print(item, "-&gt;", sum(o["qty"] for o in grp), "sold")</div>
  <div class="fx" data-lang="text">[('masala chai', 1), ('samosa', 1), ('cold coffee', 1), ('masala chai', 1)]
cold coffee -&gt; 1 sold
masala chai -&gt; 3 sold
samosa -&gt; 3 sold</div>
  <p>On the unsorted orders, masala chai appeared as two separate groups of one, because the two chai orders were not next to each other. After sorting by the same key first, each item forms one group, and summing quantities gives cold coffee 1, masala chai 3 and samosa 3. If you just need totals per key, a dictionary or <code>collections.Counter</code> does the job without sorting. Other useful members of the module are <code>cycle</code> and <code>repeat</code> (endless streams), <code>dropwhile</code>, <code>zip_longest</code>, <code>chain.from_iterable</code> (flatten one level) and the combinatoric tools <code>product</code>, <code>permutations</code> and <code>combinations</code>.</p>

  <h2 id="pi-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>Most iterator bugs are hard to spot because iterators fail silently: instead of raising an error, they just produce nothing. The most common one is looping over the same iterator twice:</p>
  <div class="fx" data-lang="py">rows = orders(raw)
n = sum(1 for _ in rows)                  # first pass: counts the orders
total = sum(o["qty"] * o["price"] for o in rows)   # second pass: nothing left
print(n, total)
rows = list(orders(raw))                  # fix: keep a list (it fits in memory)
print(len(rows), sum(o["qty"] * o["price"] for o in rows))</div>
  <div class="fx" data-lang="text">4 0
4 225</div>
  <p>Counting the orders used up the generator, so the total came out as 0 instead of 225, with no error anywhere. If the data fits in memory, keep it as a list; otherwise create a fresh generator for each pass, or compute everything you need in a single pass.</p>
  <p>The second family of mistakes comes from treating a generator as if it were a list:</p>
  <div class="fx" data-lang="py">g = orders(raw)
for attempt in (lambda: len(g), lambda: g[0]):
    try:
        attempt()
    except TypeError as e:
        print("TypeError:", e)

g = (o["item"] for o in orders(raw))
print("samosa" in g, list(g))             # "in" ate everything up to samosa</div>
  <div class="fx" data-lang="text">TypeError: object of type 'generator' has no len()
TypeError: 'generator' object is not subscriptable
True ['cold coffee', 'masala chai']</div>
  <p>A generator has no length and no indexing, because it does not know how many items it will produce until it has produced them; it might even be endless. Use <code>sum(1 for _ in g)</code> to count (which uses the generator up) or turn it into a list. The last line is subtler: <code>"samosa" in g</code> works, but it does so by pulling items until it finds a match. It consumed masala chai and samosa, so only the remaining two items were left for <code>list(g)</code>.</p>
  <p>The third is returning a lazy generator from inside a <code>with open</code> block:</p>
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
  <p><code>lines_of</code> built a generator expression over the file and returned it. Returning left the <code>with</code> block, which closed the file before a single line had been read, so the first <code>next</code> failed with "I/O operation on closed file". In <code>lines_of_fixed</code> the function itself is a generator, so it pauses <em>inside</em> the <code>with</code> block, and the file stays open until the stream is finished.</p>
  <p>The fourth is the stray <code>yield</code>. Someone adds a <code>yield</code> to a function that writes a report, to show progress:</p>
  <div class="fx" data-lang="py">def save_report(path, rows):
    print("writing", path)                # never printed
    with open(path, "w") as f:
        for r in rows:
            f.write(r + "\\n")
            yield r                       # someone added this "for progress"

save_report("report.txt", ["chai 60", "samosa 45"])
import os
print("file exists?", os.path.exists("report.txt"))</div>
  <div class="fx" data-lang="text">file exists? False</div>
  <p>Because the function contains <code>yield</code>, calling it only created a generator object. No line of the body ran: "writing" was never printed and the file was never created. Either remove the <code>yield</code> or loop over the result.</p>
  <p>A few smaller mistakes are worth knowing by name. <code>groupby</code> on unsorted data splits groups. Calling <code>send</code> on a generator that has not been primed raises <code>TypeError</code>. A <code>list(...)</code> in the middle of a pipeline makes everything before it eager. Changing a list while looping over it skips items. And <code>zip</code> stops silently at the shortest input; pass <code>strict=True</code> if unequal lengths should be an error.</p>

  <h2 id="pi-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Iterator protocol</h3>
  <ul>
    <li><b>Iterable</b>: <code>__iter__</code> returns an iterator (list, tuple, str, dict, set, range, file). Usually loopable many times.</li>
    <li><b>Iterator</b>: <code>__next__</code> returns the next item or raises <code>StopIteration</code>; <code>__iter__</code> returns <code>self</code>. One pass only.</li>
    <li><code>for x in obj</code> ≡ <code>it = iter(obj)</code>, then <code>next(it)</code> until <code>StopIteration</code>.</li>
    <li><code>iter(lst) is iter(lst)</code> → <code>False</code>; <code>iter(it) is it</code> → <code>True</code>.</li>
    <li>Files, <code>map</code>, <code>filter</code>, <code>zip</code>, <code>enumerate</code> and generators are iterators. <code>range</code> is a lazy sequence (has <code>len</code>, indexing), not an iterator.</li>
    <li><code>next(it, default)</code> returns <code>default</code> instead of raising.</li>
    <li>Iterator class: position on <code>self</code>. Re-iterable container: <code>__iter__</code> returns a <em>new</em> iterator (shortest: write <code>__iter__</code> with <code>yield</code>).</li>
  </ul>
  <h3>Generators</h3>
  <table class="tbl">
    <tr><th>Syntax</th><th>Meaning</th></tr>
    <tr><td><code>def g(): ... yield v</code></td><td>calling <code>g()</code> returns a generator; no body line runs yet</td></tr>
    <tr><td><code>yield v</code></td><td>hand out <code>v</code>, pause with locals kept; resume on the next <code>next()</code></td></tr>
    <tr><td><code>return v</code> in a generator</td><td>ends it; <code>StopIteration.value == v</code></td></tr>
    <tr><td><code>x = yield v</code> / <code>g.send(x)</code></td><td>two-way; <code>next(g)</code> ≡ <code>g.send(None)</code>; prime with <code>next</code> first</td></tr>
    <tr><td><code>yield from it</code></td><td>yield every item of <code>it</code>; forwards send/throw/close; evaluates to its return value</td></tr>
    <tr><td><code>g.throw(exc)</code> / <code>g.close()</code></td><td>raise <code>exc</code> / <code>GeneratorExit</code> at the paused <code>yield</code>; <code>finally</code> runs</td></tr>
    <tr><td><code>(expr for x in xs if c)</code></td><td>generator expression: lazy list comprehension</td></tr>
  </table>
  <ul>
    <li>States: <code>GEN_CREATED</code> → <code>GEN_RUNNING</code>/<code>GEN_SUSPENDED</code> → <code>GEN_CLOSED</code> (<code>inspect.getgeneratorstate</code>).</li>
    <li>A <code>StopIteration</code> raised inside a generator body becomes <code>RuntimeError</code> (PEP 479); use <code>return</code>.</li>
  </ul>
  <h3>List vs generator</h3>
  <table class="tbl">
    <tr><th></th><th>List <code>[...]</code></th><th>Generator <code>(...)</code></th></tr>
    <tr><td>Memory</td><td>O(n): all items at once</td><td>O(1): one item (object ≈ 200 bytes)</td></tr>
    <tr><td>Passes</td><td>many</td><td>one</td></tr>
    <tr><td><code>len</code>, index, sort</td><td>yes</td><td>no (<code>islice</code> to slice)</td></tr>
    <tr><td>Endless data / stop early</td><td>no</td><td>yes</td></tr>
  </table>
  <ul>
    <li>Pipelines are pull-based; one <code>list()</code>/<code>sorted()</code> in the middle makes everything before it eager.</li>
    <li>Batches: <code>itertools.batched(it, n)</code> (3.12+) or <code>while chunk := list(islice(it, n)): yield chunk</code>.</li>
    <li>Measure memory with <code>tracemalloc</code>, not <code>sys.getsizeof</code>.</li>
  </ul>
  <h3>itertools</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Does</th></tr>
    <tr><td><code>count</code>, <code>cycle</code>, <code>repeat</code></td><td>endless streams</td></tr>
    <tr><td><code>islice(it, start, stop, step)</code></td><td>slice any iterator</td></tr>
    <tr><td><code>chain(a, b)</code> / <code>chain.from_iterable</code></td><td>join streams / flatten one level</td></tr>
    <tr><td><code>accumulate(xs, func)</code></td><td>running totals</td></tr>
    <tr><td><code>takewhile</code> / <code>dropwhile</code></td><td>take / skip while a test holds</td></tr>
    <tr><td><code>groupby(it, key)</code></td><td>groups of <em>neighbouring</em> equal keys: sort first</td></tr>
    <tr><td><code>pairwise</code>, <code>batched</code></td><td>neighbouring pairs; tuples of n</td></tr>
    <tr><td><code>tee(it, n)</code></td><td>n independent copies; buffers the gap</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Second pass over an iterator is silently empty (<code>sum(g), sum(g)</code> → 225, 0).</li>
    <li>No <code>len()</code> or indexing on generators; <code>x in gen</code> consumes items up to the match.</li>
    <li>A <code>yield</code> anywhere makes calling the function run nothing.</li>
    <li><code>return (… for line in f)</code> inside <code>with open</code> → closed file; use <code>yield from</code> inside the <code>with</code>.</li>
    <li><code>send(value)</code> to an unprimed generator → <code>TypeError</code>.</li>
    <li><code>zip</code> stops at the shortest input; use <code>strict=True</code>.</li>
  </ul>

  <h2 id="pi-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a <code>for</code> loop actually do?</summary><div class="qa-body">It calls <code>iter(obj)</code> once to get an iterator, then repeatedly calls <code>next()</code> on that iterator and runs the body with each item. When <code>next</code> raises <code>StopIteration</code>, the loop catches it and ends without an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between an iterable and an iterator?</summary><div class="qa-body">An iterable has <code>__iter__</code> and gives a fresh iterator each time it is asked, so it can be looped over many times (lists, dicts, strings). An iterator has <code>__next__</code>, remembers its position and returns itself from <code>__iter__</code>, so it can be used only once. Every iterator is iterable, but not every iterable is an iterator.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>range</code> an iterator? Is a file object?</summary><div class="qa-body"><code>range</code> is not: it is a lazy sequence with <code>len</code>, indexing and fast membership tests, and <code>iter(r) is r</code> is <code>False</code>, so it can be looped over repeatedly. A file object is an iterator (<code>iter(f) is f</code>): each <code>next</code> reads one line, and a second loop gets nothing unless you <code>seek(0)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make your own class iterable?</summary><div class="qa-body">Give it an <code>__iter__</code> method that returns a new iterator. The simplest way is to write <code>__iter__</code> as a generator, with <code>yield</code> inside it. Alternatively, return an instance of a separate iterator class that has <code>__next__</code>. Returning <code>self</code> from a container means it can only be looped over once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>yield</code> vs <code>return</code>?</summary><div class="qa-body"><code>return</code> ends the function and throws away its local variables. <code>yield</code> hands back a value and pauses, keeping the local variables and the current position for the next <code>next()</code>. A <code>return</code> inside a generator ends it by raising <code>StopIteration</code>, carrying the return value in <code>.value</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when you call a generator function?</summary><div class="qa-body">None of its body runs. Python creates a generator object holding the code, a frame for its local variables and the current position, in state <code>GEN_CREATED</code>. The body runs only when you call <code>next()</code> or loop over it, and then only up to the next <code>yield</code>. That is why a function that accidentally contains <code>yield</code> seems to do nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is printed? <code>g = (x for x in [1, 2, 3]); print(sum(g), list(g))</code></summary><div class="qa-body"><code>6 []</code>. <code>sum</code> uses the generator up, and the second consumer gets nothing, with no error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List comprehension or generator expression: when do you use each?</summary><div class="qa-body">A list comprehension builds all items now, using memory proportional to the number of items, and supports <code>len</code>, indexing, sorting and repeated passes. A generator expression produces items on demand using constant memory, but allows only one pass. Use a generator for large or streamed data feeding a single consumer, such as <code>sum(x * x for x in data)</code>, and a list when the data is small or needed more than once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you call <code>len()</code> on a generator?</summary><div class="qa-body">A generator produces values on demand and does not know how many it will produce until it reaches the end; it may even be endless. To count, consume it with <code>sum(1 for _ in g)</code>, which uses it up, or turn it into a list first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you process a 50 GB CSV on an 8 GB laptop?</summary><div class="qa-body">Never load it whole. Stream it: iterate over the file line by line through a generator pipeline (read, parse, filter, aggregate), or use <code>pd.read_csv(path, chunksize=100_000)</code> and combine per-chunk results such as sums and counts. Memory stays at about one line or one chunk. Steps that need all the data, like sorting, are done on the reduced output or with an external sort.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>yield from</code> do, and how is it different from <code>for x in it: yield x</code>?</summary><div class="qa-body">For plain iteration they are equivalent. <code>yield from</code> also forwards <code>send()</code>, <code>throw()</code> and <code>close()</code> to the inner generator, and evaluates to the inner generator's <code>return</code> value. That makes it the correct way for one generator to delegate to another, and it was the basis of coroutines before <code>async</code>/<code>await</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>send()</code> do, and why must a generator be primed?</summary><div class="qa-body"><code>g.send(v)</code> resumes the generator and makes the paused <code>yield</code> expression evaluate to <code>v</code>, then returns the next yielded value. A new generator has not reached any <code>yield</code>, so there is nowhere to deliver <code>v</code>. You must call <code>next(g)</code> (or <code>g.send(None)</code>) first, otherwise you get <code>TypeError: can't send non-None value to a just-started generator</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when a generator is closed early?</summary><div class="qa-body"><code>g.close()</code>, which is also called when the generator is garbage collected, raises <code>GeneratorExit</code> at the paused <code>yield</code>, so <code>finally</code> and <code>with</code> blocks inside the generator run their cleanup. If the generator catches it and yields again, Python raises <code>RuntimeError: generator ignored GeneratorExit</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if code inside a generator raises <code>StopIteration</code>?</summary><div class="qa-body">Since Python 3.7 (PEP 479) it is turned into <code>RuntimeError: generator raised StopIteration</code>. Before that it silently ended the generator and hid bugs, such as a bare <code>next(other)</code> on an exhausted iterator. To end a generator, use <code>return</code>; when calling <code>next</code> inside one, give a default or catch the exception.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>return (line for line in f)</code> inside <code>with open(...) as f</code> fail?</summary><div class="qa-body">Returning leaves the <code>with</code> block, which closes the file before the generator expression has read anything, so its first <code>next</code> raises <code>ValueError: I/O operation on closed file</code>. Make the function itself a generator, using <code>yield from</code> inside the <code>with</code>, so it pauses while the file is still open.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>itertools.groupby</code> return the same key twice?</summary><div class="qa-body">It only groups neighbouring items with equal keys, because it is lazy and cannot look ahead. Sort by the same key first, or use a dict, <code>Counter</code> or <code>defaultdict(list)</code> when you just need totals per key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need to iterate over a generator twice. What are the options?</summary><div class="qa-body">Turn it into a list if it fits in memory; call the generator function again to get a fresh generator; restructure the code to do everything in one pass; or use <code>itertools.tee(gen, 2)</code>, which buffers the items one copy has seen and the other has not, so it turns into a list if the copies drift far apart.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is printed? <code>g = (c for c in "abcd"); print("b" in g, list(g))</code></summary><div class="qa-body"><code>True ['c', 'd']</code>. The membership test pulls items until it finds a match, consuming <code>'a'</code> and <code>'b'</code> along the way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do generators relate to <code>async</code>/<code>await</code> coroutines?</summary><div class="qa-body">Both are functions that can suspend and resume with a saved frame. Generator-based coroutines using <code>yield</code>, <code>send</code> and <code>yield from</code> were how asyncio was first built. Native coroutines (<code>async def</code>, <code>await</code>) are a separate type built on the same suspend-and-resume machinery, with the event loop doing the resuming. See <a class="xref" data-note="py_asyncio">asyncio</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you write an iterator class instead of a generator?</summary><div class="qa-body">When the iterator needs extra methods or inspectable state, such as <code>peek()</code>, <code>reset()</code>, <code>__len__</code> or a progress counter, or must be pickled or checkpointed partway through (generators cannot be pickled). Otherwise a generator is shorter and less error-prone.</div></details>
</main>
`
});
