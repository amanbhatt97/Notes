// notes/python/py_ds.js — Data Structures
Object.assign(TOPIC_CONTENT, {
  "py_ds": `<main>
  <h1>Data Structures</h1>
  <p class="lead">Python has four built-in containers — list, tuple, set, dict — plus strings. Almost all data passes through them before numpy or pandas. The right choice can turn an O(n²) script into O(n). Knowing how copying and hashing work stops silent bugs. Builds on <em>Python Fundamentals</em> (names, mutability). Run on Python 3.13.</p>

  <h2 id="pd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Data Structures</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Lists</div>
        <ul>
          <li><b>list</b> — ordered, changeable, duplicates OK; a growing array of references</li>
          <li>💡 a shopping basket: add, remove, reorder</li>
          <li><b>Slicing</b> <code>[start:stop:step]</code> — stop not included; <code>[::-1]</code> reverses; never raises IndexError</li>
          <li><b>append</b> O(1) on average; <b>insert(0)/pop(0)</b> O(n) → use <code>deque</code></li>
          <li>⚠ <code>lst.sort()</code> / <code>append</code> return <code>None</code>; <code>sorted(lst)</code> returns a new list</li>
          <li>⚠ <code>[[0]*3]*3</code> = three names for ONE row → use a comprehension</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Comprehensions</div>
        <ul>
          <li><b>List</b> <code>[f(x) for x in xs if cond]</code>; filter at the end, if/else at the front</li>
          <li><b>Nested</b> — loops read left→right like nested for: <code>[x for row in m for x in row]</code></li>
          <li><b>Dict / set</b> — <code>{k: v for ...}</code>, <code>{x for ...}</code></li>
          <li><b>Generator</b> <code>(x for ...)</code> — makes items one by one, tiny memory; feed <code>sum</code>/<code>max</code></li>
          <li>Faster than append loops; more than 2 levels → write a function</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Copying</div>
        <ul>
          <li><b>Alias</b> <code>b = a</code> — no copy at all, just a second name</li>
          <li><b>Shallow</b> <code>a.copy()</code>, <code>a[:]</code>, <code>list(a)</code> — new outer box, same inner objects</li>
          <li><b>Deep</b> <code>copy.deepcopy(a)</code> — copies every level</li>
          <li>💡 shallow = photocopy of the contents page: same chapters</li>
          <li>⚠ nested lists/dicts (configs, JSON) need deepcopy before editing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tuples &amp; sets</div>
        <ul>
          <li><b>tuple</b> — fixed, hashable (if items are) → dict keys, fixed records</li>
          <li><b>Unpacking</b> — <code>x, y = p</code>; <code>first, *rest = seq</code></li>
          <li>⚠ <code>(5)</code> is an int; a one-item tuple is <code>(5,)</code></li>
          <li><b>namedtuple</b> — tuple with field names</li>
          <li><b>set</b> — unique items, no order, O(1) <code>in</code>; <code>| &amp; - ^</code></li>
          <li>⚠ <code>{}</code> is an empty dict; empty set = <code>set()</code></li>
          <li><b>Dedupe, keep order</b> — <code>list(dict.fromkeys(xs))</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dicts &amp; hashing</div>
        <ul>
          <li><b>Hash table</b> — <code>hash(key) % size</code> → slot; O(1) average lookup</li>
          <li>💡 a locker room: locker number from the key, walk straight to it</li>
          <li><b>Keys must be hashable</b> — hash must never change → immutable keys</li>
          <li><b>Equal ⇒ same hash</b> — <code>1 == 1.0 == True</code> share one key</li>
          <li><b>Keeps insertion order</b> (3.7+); <code>d.get(k, default)</code>, <code>d | other</code></li>
          <li><b>defaultdict(list)</b> — grouping; <b>Counter</b> — <code>.most_common(k)</code></li>
          <li>Worst case O(n) if many keys collide</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Strings &amp; f-strings</div>
        <ul>
          <li><b>Immutable</b> — every method returns a new string</li>
          <li>⚠ <code>s += x</code> in a loop is O(n²) → <code>"".join(parts)</code></li>
          <li><b>f-string spec</b> — <code>{x:.2f}</code> <code>{x:,}</code> <code>{p:.1%}</code> <code>{s:&gt;8}</code> <code>{x=}</code></li>
          <li><b>find</b> → −1 if missing; <b>index</b> raises</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regex &amp; Unicode</div>
        <ul>
          <li><b>Regex</b> — a mini-language to describe text patterns (e.g. "6 digits" for a PIN code)</li>
          <li><b>search</b> anywhere; <b>match</b> only at start; <b>fullmatch</b> whole string</li>
          <li><b>findall</b> — returns only the groups if the pattern has groups</li>
          <li><b>Syntax</b> — <code>\\d \\w \\s . + * ? {m,n} ^ $ ( ) (?P&lt;name&gt;)</code>; use raw strings <code>r"..."</code></li>
          <li><b>str ↔ bytes</b> — <code>encode</code>/<code>decode</code>; UTF-8 is 1–4 bytes per char</li>
          <li>⚠ wrong codec → garbled text (<code>cafÃ©</code>); always pass <code>encoding="utf-8"</code></li>
          <li>⚠ "é" can be 1 or 2 code points → <code>unicodedata.normalize("NFC")</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Big-O &amp; choosing</div>
        <ul>
          <li><b>Membership</b> — list O(n), set/dict O(1): 100k items → ~7,800× faster</li>
          <li><b>Queue</b> → <code>deque</code>; <b>lookup by key</b> → dict; <b>unique</b> → set</li>
          <li><b>Fixed record / key</b> → tuple; <b>ordered, indexed</b> → list</li>
          <li><b>Top-k</b> → <code>heapq</code> / Counter; <b>search sorted data</b> → <code>bisect</code></li>
          <li><b>Big numeric arrays</b> → numpy, not lists</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pd-list"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Lists &amp; Slicing</span><span class="rm-sub">The everyday sequence</span></div></div>
      <div class="rm-item rm-done" data-target="pd-comp"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Comprehensions</span><span class="rm-sub">Build collections in one line</span></div></div>
      <div class="rm-item rm-done" data-target="pd-copy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Copying</span><span class="rm-sub">Alias, shallow, deep</span></div></div>
      <div class="rm-item rm-done" data-target="pd-tup"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Tuples &amp; Sets</span><span class="rm-sub">Fixed records, unique items</span></div></div>
      <div class="rm-item rm-done" data-target="pd-dict"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Dicts &amp; Hashing</span><span class="rm-sub">Why lookup is O(1)</span></div></div>
      <div class="rm-item rm-done" data-target="pd-str"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Strings &amp; f-strings</span><span class="rm-sub">Methods and formatting</span></div></div>
      <div class="rm-item rm-done" data-target="pd-re"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Regex &amp; Unicode</span><span class="rm-sub">Patterns, bytes, encodings</span></div></div>
      <div class="rm-item rm-done" data-target="pd-big"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Big-O &amp; Choosing</span><span class="rm-sub">Pick the right container</span></div></div>
      <div class="rm-item rm-done" data-target="pd-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Hands-on</span><span class="rm-sub">Log summariser</span></div></div>
      <div class="rm-item rm-done" data-target="pd-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <div class="cards">
    <div><b>list</b><p>Ordered, changeable, duplicates</p><small>💡 shopping basket</small></div>
    <div><b>tuple</b><p>Ordered, fixed, hashable</p><small>💡 sealed envelope</small></div>
    <div><b>set</b><p>Unique, no order, O(1) <code>in</code></p><small>💡 stamp collection: no repeats</small></div>
    <div><b>dict</b><p>Key → value, O(1) lookup</p><small>💡 phone contacts: name → number</small></div>
  </div>

  <h2 id="pd-list"><span class="num">01</span>Lists &amp; Slicing</h2>
  <p>A <strong>list</strong> is an ordered, changeable sequence. Use it when order matters and items get added or removed. A <strong>slice</strong> takes a piece of it.</p>
  <figure class="viz"><svg viewBox="0 0 470 120" width="470">
    <text x="10" y="18" class="tm">lst = [0, 1, 2, 3, 4, 5]</text>
    <g><rect x="40" y="40" width="60" height="34" class="fs" stroke="currentColor"/><rect x="100" y="40" width="60" height="34" class="fb sb"/><rect x="160" y="40" width="60" height="34" class="fb sb"/><rect x="220" y="40" width="60" height="34" class="fb sb"/><rect x="280" y="40" width="60" height="34" class="fs" stroke="currentColor"/><rect x="340" y="40" width="60" height="34" class="fs" stroke="currentColor"/></g>
    <text x="66" y="62">0</text><text x="126" y="62">1</text><text x="186" y="62">2</text><text x="246" y="62">3</text><text x="306" y="62">4</text><text x="366" y="62">5</text>
    <text x="36" y="36" class="tm">0</text><text x="96" y="36" class="tb">1</text><text x="156" y="36" class="tm">2</text><text x="216" y="36" class="tm">3</text><text x="276" y="36" class="tb">4</text><text x="336" y="36" class="tm">5</text><text x="396" y="36" class="tm">6</text>
    <text x="30" y="92" class="tm">-6</text><text x="90" y="92" class="tm">-5</text><text x="150" y="92" class="tm">-4</text><text x="210" y="92" class="tm">-3</text><text x="270" y="92" class="tm">-2</text><text x="330" y="92" class="tm">-1</text>
    <text x="130" y="112" class="tb">lst[1:4] → [1, 2, 3]   (cut at gaps 1 and 4)</text>
  </svg><figcaption>Think of indices as cuts between items. A slice takes everything between two cuts; stop is not included.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>Slicing is like cutting a bread loaf: you mark cut 1 and cut 4, and you get the three slices in between.</p></div>
  <div class="fx" data-lang="py">lst = [0, 1, 2, 3, 4, 5]
print(lst[1:4], lst[:3], lst[-2:], lst[::2], lst[::-1])
print(lst[10:])                   # slicing never raises
lst[1:3] = ["a", "b", "c"]        # slice assignment can resize
print(lst)
nums = [5, 2, 8]
print(nums.append(1), nums)       # append returns None
print(sorted(nums), nums.pop(), nums)</div>
  <div class="fx" data-lang="text">[1, 2, 3] [0, 1, 2] [4, 5] [0, 2, 4] [5, 4, 3, 2, 1, 0]
[]
[0, 'a', 'b', 'c', 3, 4, 5]
None [5, 2, 8, 1]
[1, 2, 5, 8] 1 [5, 2, 8]</div>
  <div class="callout trap"><span class="label">Trap</span><p>Methods that change the list in place (<code>append</code>, <code>sort</code>, <code>reverse</code>) return <code>None</code>. So <code>nums = nums.sort()</code> wipes your list.</p></div>
  <p>A list stores <em>references</em>, not copies. So repeating a row with <code>*</code> repeats the same row object:</p>
  <div class="fx" data-lang="py">grid = [[0] * 3] * 3              # 3 refs to ONE row
grid[0][0] = 1
print(grid)
grid = [[0] * 3 for _ in range(3)] # 3 separate rows
grid[0][0] = 1
print(grid)</div>
  <div class="fx" data-lang="text">[[1, 0, 0], [1, 0, 0], [1, 0, 0]]
[[1, 0, 0], [0, 0, 0], [0, 0, 0]]</div>

  <h2 id="pd-comp"><span class="num">02</span>Comprehensions</h2>
  <p>A <strong>comprehension</strong> builds a list (or dict, set) in one line. It does the same job as a for-loop with <code>append</code>, but shorter and faster, because the loop runs in C.</p>
  <div class="flow"><span>[ expression</span><span>for x in iterable</span><span>if condition ]</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>"From the class list, take each student who scored above 60, and write their name in capitals." One sentence instead of a step-by-step register.</p></div>
  <p>A <strong>generator</strong> <code>( )</code> gives items one at a time instead of building a full list, so it uses almost no memory.</p>
  <div class="fx" data-lang="py">print([x ** 2 for x in range(6) if x % 2 == 0])          # filter at the end
print(["even" if x % 2 == 0 else "odd" for x in range(4)])  # if/else at the front
m = [[1, 2], [3, 4]]
print([x for row in m for x in row])                     # flatten
print([[row[i] for row in m] for i in range(2)])          # transpose
print({w: len(w) for w in ["ml", "data"]})                # dict comprehension
g = (x * x for x in range(10**6))   # generator: lazy, no list built
print(sum(g))</div>
  <div class="fx" data-lang="text">[0, 4, 16]
['even', 'odd', 'even', 'odd']
[1, 2, 3, 4]
[[1, 3], [2, 4]]
{'ml': 2, 'data': 4}
333332833333500000</div>
  <div class="callout intu"><span class="label">Key insight</span><p>Read nested comprehensions as nested loops, left to right: <code>for row in m</code> is the outer loop, <code>for x in row</code> the inner one. More than two levels → write a named function.</p></div>

  <h2 id="pd-copy"><span class="num">03</span>Copying: Alias, Shallow, Deep</h2>
  <p>Three levels of "copy". An <strong>alias</strong> is just a second name. A <strong>shallow copy</strong> makes a new outer container but shares the inner objects. A <strong>deep copy</strong> copies every level. Pick wrong and editing the "copy" changes the original.</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
    <defs><marker id="pd-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="70" height="26" rx="5" class="fb sb"/><text x="18" y="38">orig</text>
    <rect x="10" y="62" width="70" height="26" rx="5" class="fb sb"/><text x="18" y="80">alias</text>
    <rect x="130" y="30" width="80" height="44" rx="5" class="fs" stroke="currentColor"/><text x="140" y="48">outer</text><text x="140" y="64" class="tm">[ • , • ]</text>
    <line x1="80" y1="33" x2="128" y2="45" stroke="currentColor" marker-end="url(#pd-ah)"/>
    <line x1="80" y1="75" x2="128" y2="60" stroke="currentColor" marker-end="url(#pd-ah)"/>
    <rect x="10" y="120" width="70" height="26" rx="5" class="fb sb"/><text x="14" y="138">shallow</text>
    <rect x="130" y="112" width="80" height="44" rx="5" class="fs" stroke="currentColor"/><text x="140" y="130">outer'</text><text x="140" y="146" class="tm">[ • , • ]</text>
    <line x1="80" y1="133" x2="128" y2="133" stroke="currentColor" marker-end="url(#pd-ah)"/>
    <rect x="270" y="40" width="80" height="28" rx="5" class="fr sr"/><text x="280" y="59">[1, 2]</text>
    <rect x="270" y="110" width="80" height="28" rx="5" class="fr sr"/><text x="280" y="129">[3, 4]</text>
    <line x1="210" y1="50" x2="268" y2="54" stroke="currentColor" marker-end="url(#pd-ah)"/>
    <line x1="210" y1="64" x2="268" y2="118" stroke="currentColor" marker-end="url(#pd-ah)"/>
    <line x1="210" y1="126" x2="268" y2="62" class="sr" stroke-dasharray="4 3" marker-end="url(#pd-ah)"/>
    <line x1="210" y1="140" x2="268" y2="126" class="sr" stroke-dasharray="4 3" marker-end="url(#pd-ah)"/>
    <text x="230" y="182" class="tr">inner lists SHARED</text>
    <rect x="390" y="20" width="70" height="26" rx="5" class="fb sb"/><text x="398" y="38">deep</text>
    <rect x="390" y="60" width="80" height="44" rx="5" class="fs" stroke="currentColor"/><text x="400" y="78">outer"</text><text x="400" y="94" class="tm">[ • , • ]</text>
    <rect x="490" y="56" width="62" height="24" rx="5" class="fg sg"/><text x="494" y="73">[1, 2]</text>
    <rect x="490" y="88" width="62" height="24" rx="5" class="fg sg"/><text x="494" y="105">[3, 4]</text>
    <line x1="425" y1="46" x2="425" y2="58" stroke="currentColor" marker-end="url(#pd-ah)"/>
    <line x1="470" y1="74" x2="488" y2="68" class="sg" marker-end="url(#pd-ah)"/><line x1="470" y1="90" x2="488" y2="98" class="sg" marker-end="url(#pd-ah)"/>
    <text x="400" y="140" class="tg">all new objects</text>
  </svg><figcaption>A shallow copy's slots point at the SAME inner lists. A deep copy duplicates every level.</figcaption></figure>
  <div class="fx" data-lang="py">import copy
orig = [[1, 2], [3, 4]]
alias = orig
shallow = orig.copy()            # same as orig[:] or list(orig)
deep = copy.deepcopy(orig)
orig[0].append(99)               # edit an inner list
orig.append([5])                 # edit the outer list
print("alias  ", alias)
print("shallow", shallow)
print("deep   ", deep)
print(shallow[0] is orig[0], deep[0] is orig[0])</div>
  <div class="fx" data-lang="text">alias   [[1, 2, 99], [3, 4], [5]]
shallow [[1, 2, 99], [3, 4]]
deep    [[1, 2], [3, 4]]
True False</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A shallow copy photocopies the contents page of a book: a new page, but it points to the same chapters. A deep copy reprints the whole book.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Copy a nested config with <code>.copy()</code> or <code>{**cfg}</code>, then edit <code>cfg2["params"]["lr"]</code> — the original changes too. Use <code>copy.deepcopy</code>. (pandas <code>df.copy()</code> is deep by default for the data.)</p></div>

  <h2 id="pd-tup"><span class="num">04</span>Tuples &amp; Sets</h2>
  <p>A <strong>tuple</strong> is a fixed record: coordinates, RGB, a (user, item) pair. It cannot change, so it is hashable and can be a dict key.</p>
  <div class="fx" data-lang="py">point = (3, 4)
x, y = point                       # unpacking
first, *rest = (1, 2, 3, 4)
print(x, y, first, rest)
print((5,), type((5)), type((5,)))
from collections import namedtuple
Pt = namedtuple("Pt", "x y")
p = Pt(3, 4)
print(p.x, p, p._replace(x=0))
dist = {(0, 0): "origin", (3, 4): "p"}   # tuple as key
print(dist[(3, 4)])</div>
  <div class="fx" data-lang="text">3 4 1 [2, 3, 4]
(5,) &lt;class 'int'&gt; &lt;class 'tuple'&gt;
3 Pt(x=3, y=4) Pt(x=0, y=4)
p</div>
  <p>A <strong>set</strong> keeps only unique items and answers "is x here?" in O(1). Set maths is the cleanest way to compare ID lists (train vs test users, old vs new columns).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two WhatsApp groups. <code>a &amp; b</code> = people in both. <code>a | b</code> = everyone. <code>a - b</code> = only in group a. Nobody appears twice.</p></div>
  <div class="fx" data-lang="py">a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a | b, a &amp; b, a - b, a ^ b)
print({1, 2} &lt;= a)                              # subset
print(list(dict.fromkeys([3, 1, 3, 2, 1])))      # dedupe, keep order
print(type({}), type(set()))
try:
    {[1, 2]}
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">{1, 2, 3, 4, 5, 6} {3, 4} {1, 2} {1, 2, 5, 6}
True
[3, 1, 2]
&lt;class 'dict'&gt; &lt;class 'set'&gt;
TypeError: unhashable type: 'list'</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>list(set(xs))</code> loses the original order. Use <code>dict.fromkeys</code> when order matters. Need a set inside a set, or as a key? Use <code>frozenset</code>.</p></div>

  <h2 id="pd-dict"><span class="num">05</span>Dicts &amp; Hashing</h2>
  <p>A <strong>dict</strong> maps keys to values. Finding a value by key takes the same time for 10 items or 10 million. How: Python turns the key into a number (its <strong>hash</strong>), and that number picks a slot directly.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A railway cloak room: the token number tells the attendant exactly which shelf your bag is on. No need to check every shelf.</p></div>
  <figure class="viz"><svg viewBox="0 0 520 210" width="520">
    <defs><marker id="pd-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" class="tm">key</text><text x="110" y="16" class="tm">hash(key) % 8</text><text x="330" y="16" class="tm">slots</text>
    <rect x="10" y="40" width="50" height="24" rx="4" class="fb sb"/><text x="22" y="57">42</text>
    <rect x="10" y="90" width="50" height="24" rx="4" class="fb sb"/><text x="22" y="107">17</text>
    <rect x="10" y="140" width="50" height="24" rx="4" class="fb sb"/><text x="26" y="157">9</text>
    <text x="110" y="57">→ 2</text><text x="110" y="107">→ 1</text><text x="110" y="157" class="tr">→ 1 (taken!)</text>
    <g stroke="currentColor" fill="none"><rect x="300" y="26" width="120" height="20"/><rect x="300" y="46" width="120" height="20"/><rect x="300" y="66" width="120" height="20"/><rect x="300" y="86" width="120" height="20"/><rect x="300" y="106" width="120" height="20"/><rect x="300" y="126" width="120" height="20"/><rect x="300" y="146" width="120" height="20"/><rect x="300" y="166" width="120" height="20"/></g>
    <g class="tm"><text x="280" y="41">0</text><text x="280" y="61">1</text><text x="280" y="81">2</text><text x="280" y="101">3</text><text x="280" y="121">4</text><text x="280" y="141">5</text><text x="280" y="161">6</text><text x="280" y="181">7</text></g>
    <rect x="301" y="47" width="118" height="18" class="fb"/><text x="308" y="61">17: "b"</text>
    <rect x="301" y="67" width="118" height="18" class="fb"/><text x="308" y="81">42: "a"</text>
    <rect x="301" y="127" width="118" height="18" class="fr"/><text x="308" y="141">9: "c"</text>
    <line x1="160" y1="53" x2="298" y2="76" stroke="currentColor" marker-end="url(#pd-ah2)"/>
    <line x1="160" y1="103" x2="298" y2="58" stroke="currentColor" marker-end="url(#pd-ah2)"/>
    <path d="M430,56 C470,70 470,120 430,136" class="sr" fill="none" stroke-dasharray="4 3" marker-end="url(#pd-ah2)"/>
    <text x="440" y="100" class="tr">probe</text>
    <text x="10" y="204" class="tm">lookup = compute hash, jump to slot, compare key: no scanning</text>
  </svg><figcaption>A dict is an array of slots. The hash picks the slot. If the slot is taken (a collision), Python tries another. Hashes shown are real for these ints.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p><strong>Hashable</strong> = has a <code>hash()</code> that never changes, and equal objects give equal hashes. Immutable built-ins qualify; list, dict and set do not.</p></div>
  <p>Why keys must not change: if a key changed, its hash would change. The dict would then look in the wrong slot, and the entry would be lost. That is why lists cannot be keys.</p>
  <div class="fx" data-lang="py">for k in [42, 17, 9]:
    print(k, "-&gt; slot", hash(k) % 8)
print(hash(1) == hash(1.0) == hash(True))
print({1: "int", 1.0: "float", True: "bool"})   # one key!</div>
  <div class="fx" data-lang="text">42 -&gt; slot 2
17 -&gt; slot 1
9 -&gt; slot 1
True
{1: 'bool'}</div>
  <div class="fx" data-lang="py">d = {"name": "Asha", "age": 31}
d["city"] = "Mumbai"
print(d.get("salary", 0), d.pop("age"), d)
print(d | {"age": 32})                           # merge (3.9+), new dict
try:
    d["salary"]
except KeyError as e:
    print("KeyError:", e)
print({k: v * 2 for k, v in {"a": 1, "b": 2}.items() if v &gt; 1})
from collections import defaultdict, Counter
groups = defaultdict(list)                        # missing key → []
for name, team in [("Asha", "ds"), ("Ben", "ml"), ("Chen", "ds")]:
    groups[team].append(name)
print(dict(groups))
print(Counter("mississippi").most_common(2))</div>
  <div class="fx" data-lang="text">0 31 {'name': 'Asha', 'city': 'Mumbai'}
{'name': 'Asha', 'city': 'Mumbai', 'age': 32}
KeyError: 'salary'
{'b': 4}
{'ds': ['Asha', 'Chen'], 'ml': ['Ben']}
[('i', 4), ('s', 4)]</div>
  <div class="callout trap"><span class="label">Trap</span><p>String hashes change in every new Python process (<code>PYTHONHASHSEED</code>). So never use <code>hash(s)</code> for stable bucketing, like A/B groups or a train/test split. Use <code>hashlib.md5(s.encode())</code>. Also: do not add or remove keys while looping over a dict (RuntimeError).</p></div>

  <h2 id="pd-str"><span class="num">06</span>Strings &amp; f-strings</h2>
  <p>A <strong>string</strong> is unchangeable text. Every method (<code>lower</code>, <code>replace</code>) returns a new string. An <strong>f-string</strong> puts values into text with formatting rules after a colon.</p>
  <div class="fx" data-lang="py">s = "Hello, World!"
print(s[7:12], s[-6:], s[::-1])
print(s.lower(), s.split(", "), s.find("World"), s.find("x"))
print("  pad  ".strip() + "|", s.replace("l", "L"), s.startswith("He"))
print("-".join(["2024", "05", "01"]))</div>
  <div class="fx" data-lang="text">World World! !dlroW ,olleH
hello, world! ['Hello', 'World!'] 7 -1
pad| HeLLo, WorLd! True
2024-05-01</div>
  <table class="tbl">
    <tr><th>Spec</th><th>Code</th><th>Gives</th></tr>
    <tr><td>Decimals</td><td><code>{score:.2f}</code> / <code>{score:8.3f}</code></td><td>0.91 / width 8</td></tr>
    <tr><td>Percent</td><td><code>{score:.2%}</code></td><td>91.23%</td></tr>
    <tr><td>Thousands</td><td><code>{n:,}</code> / <code>{n:_}</code></td><td>1,234,567</td></tr>
    <tr><td>Align</td><td><code>{name:&gt;6}</code> <code>&lt;</code> <code>^</code></td><td>right / left / centre</td></tr>
    <tr><td>Zero-pad, hex, bin, sci</td><td><code>{7:03d} {255:x} {255:b} {x:e}</code></td><td>007 ff 11111111</td></tr>
    <tr><td>Debug</td><td><code>{score=:.2f}</code>, <code>{name!r}</code></td><td>score=0.91, 'Asha'</td></tr>
  </table>
  <div class="fx" data-lang="py">name, score, n = "Asha", 0.91234, 1234567
print(f"{name:&gt;6}|{score:.2%}|{n:,}|{n:_}|{score:8.3f}|")
print(f"{name!r} {score=:.2f}")
print(f"{7:03d} {255:x} {255:b} {3.14159:e}")</div>
  <div class="fx" data-lang="text">  Asha|91.23%|1,234,567|1_234_567|   0.912|
'Asha' score=0.91
007 ff 11111111 3.141590e+00</div>
  <div class="fx" data-lang="py">import timeit
words = ["x"] * 20000
def concat():
    s = ""
    for w in words:
        s = s + w + ","          # copies the growing string each time
    return s
def join():
    return ",".join(words)       # one pass, one allocation
print(f"concat {timeit.timeit(concat, number=50)*20:.2f} ms, join {timeit.timeit(join, number=50)*20:.2f} ms")</div>
  <div class="fx" data-lang="text">concat 20.02 ms, join 0.25 ms</div>
  <div class="callout trap"><span class="label">Trap</span><p>Strings cannot change, so <code>+</code> in a loop copies the whole string every time: O(n²). Collect pieces in a list and <code>"".join</code> once. (CPython sometimes speeds up <code>s += x</code>; do not rely on it.)</p></div>

  <h2 id="pd-re"><span class="num">07</span>Regex &amp; Unicode</h2>
  <p>A <strong>regular expression</strong> (regex) describes a text pattern, like "4 digits, dash, 2 digits". Use it to find, pull out or clean text that plain <code>split</code> cannot handle — log lines, emails, phone numbers.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Like telling someone "find every 10-digit number starting with 9" in a phone book, instead of naming each number.</p></div>
  <table class="tbl">
    <tr><th>Token</th><th>Matches</th><th>Token</th><th>Matches</th></tr>
    <tr><td><code>\\d \\w \\s</code></td><td>digit, word char, whitespace</td><td><code>+ * ?</code></td><td>1+, 0+, 0 or 1 (add <code>?</code> for lazy)</td></tr>
    <tr><td><code>.</code></td><td>any char except newline</td><td><code>{2,4}</code></td><td>2 to 4 times</td></tr>
    <tr><td><code>^ $</code></td><td>start, end</td><td><code>[A-Z]</code></td><td>character class</td></tr>
    <tr><td><code>( )</code></td><td>capture group</td><td><code>(?P&lt;name&gt;...)</code></td><td>named group</td></tr>
  </table>
  <div class="fx" data-lang="py">import re
log = "2024-05-01 ERROR user=42 took 350ms; 2024-05-02 INFO user=7 took 12ms"
print(re.findall(r"\\d+ms", log))
print(re.findall(r"user=(\\d+)", log))                 # groups → only the group
m = re.search(r"(?P&lt;date&gt;\\d{4}-\\d{2}-\\d{2}) (?P&lt;lvl&gt;[A-Z]+)", log)
print(m.group("date"), m.group("lvl"), m.span())
print(re.match(r"ERROR", log))                         # match = only at start
print(re.sub(r"\\s+", " ", "too    many   spaces"))
email = re.compile(r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$")        # compile once, reuse
print(bool(email.match("a.b@x.com")), bool(email.match("bad@")))</div>
  <div class="fx" data-lang="text">['350ms', '12ms']
['42', '7']
2024-05-01 ERROR (0, 16)
None
too many spaces
True False</div>
  <div class="callout trap"><span class="label">Trap</span><p>Always use raw strings <code>r"\\d"</code>. In a normal string, escapes like <code>"\\b"</code> become control characters. <code>re.match</code> checks only the start — use <code>search</code> to scan, <code>fullmatch</code> to validate.</p></div>
  <p><strong>Unicode:</strong> a <code>str</code> is a sequence of characters (code points). <code>bytes</code> is what is stored on disk or sent on the network. UTF-8 uses 1 byte for English letters and up to 4 for others (Hindi, emoji).</p>
  <div class="flow"><span>str "naïve ☕"</span><span>.encode("utf-8")</span><span>bytes b'na\\xc3\\xafve ...'</span><span>.decode("utf-8")</span><span>str again</span></div>
  <div class="fx" data-lang="py">s = "naïve ☕"
print(len(s), len(s.encode("utf-8")), s.encode("utf-8"))
print(ord("A"), chr(9749))
try:
    s.encode("ascii")
except UnicodeEncodeError as e:
    print("UnicodeEncodeError:", e.reason)
print(s.encode("ascii", errors="ignore"))
raw = "café".encode("utf-8")
print(raw.decode("latin-1"))          # wrong codec = mojibake
import unicodedata
a, b = "é", "é"                 # 1 code point vs e + combining accent
print(a == b, unicodedata.normalize("NFC", b) == a)</div>
  <div class="fx" data-lang="text">7 10 b'na\\xc3\\xafve \\xe2\\x98\\x95'
65 ☕
UnicodeEncodeError: ordinal not in range(128)
b'nave '
cafÃ©
False True</div>
  <div class="callout trap"><span class="label">Trap</span><p>Garbled text like <code>cafÃ©</code> (called <em>mojibake</em>) means UTF-8 bytes were read with the wrong codec. Always pass <code>encoding="utf-8"</code> to <code>open()</code>. In NLP, NFC-normalise text before comparing or removing duplicates.</p></div>

  <h2 id="pd-big"><span class="num">08</span>Big-O &amp; Choosing the Right Structure</h2>
  <p><strong>Big-O</strong> says how the work grows as data grows. O(1) = same time for any size. O(n) = double the data, double the time.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Finding a student in an unsorted attendance register means reading line by line: O(n). Finding them by roll number in a numbered locker: O(1).</p></div>
  <table class="tbl">
    <tr><th>Operation</th><th>list</th><th>deque</th><th>set / dict</th></tr>
    <tr><td>Index <code>x[i]</code></td><td>O(1)</td><td>O(n) middle</td><td>— / O(1) by key</td></tr>
    <tr><td>Append / pop at end</td><td>O(1)*</td><td>O(1)</td><td>add O(1)</td></tr>
    <tr><td>Insert / pop at front</td><td>O(n)</td><td>O(1)</td><td>—</td></tr>
    <tr><td><code>x in c</code></td><td>O(n)</td><td>O(n)</td><td>O(1) avg</td></tr>
    <tr><td>Delete by value / key</td><td>O(n)</td><td>O(n)</td><td>O(1) avg</td></tr>
    <tr><td>Sort</td><td>O(n log n)</td><td>—</td><td>— (use <code>sorted</code>)</td></tr>
    <tr><td>Copy / slice of k</td><td>O(n) / O(k)</td><td>O(n)</td><td>O(n)</td></tr>
  </table>
  <p>* On average: the list keeps spare room, so the rare resize is spread over many appends. Timings below are from one run; the ratios are what matter.</p>
  <div class="fx" data-lang="py">import timeit
n = 100_000
L = list(range(n)); S = set(L)
t_list = timeit.timeit(lambda: (n - 1) in L, number=200)
t_set = timeit.timeit(lambda: (n - 1) in S, number=200)
print(f"list: {t_list*1e3/200:.3f} ms per lookup")
print(f"set:  {t_set*1e6/200:.3f} us per lookup")
print(f"set is ~{t_list/t_set:,.0f}x faster")</div>
  <div class="fx" data-lang="text">list: 0.556 ms per lookup
set:  0.071 us per lookup
set is ~7,808x faster</div>
  <div class="fx" data-lang="py">from collections import deque
import timeit
n = 100_000
def drain_list():
    q = list(range(n))
    while q: q.pop(0)        # shifts every item left: O(n) each
def drain_deque():
    q = deque(range(n))
    while q: q.popleft()     # O(1)
print(f"list.pop(0): {timeit.timeit(drain_list, number=1):.2f}s")
print(f"deque.popleft(): {timeit.timeit(drain_deque, number=1):.3f}s")</div>
  <div class="fx" data-lang="text">list.pop(0): 2.03s
deque.popleft(): 0.009s</div>
  <table class="tbl">
    <tr><th>You need…</th><th>Use</th></tr>
    <tr><td>Ordered items, index access, duplicates</td><td><code>list</code></td></tr>
    <tr><td>Fixed record, dict key, return several values</td><td><code>tuple</code> / <code>namedtuple</code> / dataclass</td></tr>
    <tr><td>"Have I seen this?", dedupe, set maths</td><td><code>set</code></td></tr>
    <tr><td>Lookup by key, grouping, counting</td><td><code>dict</code>, <code>defaultdict</code>, <code>Counter</code></td></tr>
    <tr><td>Queue / sliding window (BFS, last-k events)</td><td><code>deque(maxlen=k)</code></td></tr>
    <tr><td>Top-k, priority queue</td><td><code>heapq.nlargest</code> / <code>heappush</code></td></tr>
    <tr><td>Search in sorted data</td><td><code>bisect</code> (O(log n))</td></tr>
    <tr><td>Millions of numbers, vector maths</td><td>numpy array / pandas</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>The most common interview speed-up: a list used for <code>in</code> checks inside a loop makes the loop O(n²). Turn it into a set once (O(n)), and the loop becomes O(n).</p></div>

  <h2 id="pd-build"><span class="num">09</span>Hands-on: Log Summariser</h2>
  <p>Regex to parse, <code>Counter</code> to count, <code>defaultdict(set)</code> to group unique messages, f-strings to print a table.</p>
  <div class="fx" data-lang="py">from collections import Counter, defaultdict
import re
logs = """2024-05-01 ERROR db timeout user=42
2024-05-01 INFO  login user=7
2024-05-02 ERROR db timeout user=42
2024-05-02 WARN  slow query user=9
2024-05-03 ERROR disk full user=7"""
pat = re.compile(r"^(\\S+) (\\w+)\\s+(.*?) user=(\\d+)$")
by_level = Counter()
errors_by_user = defaultdict(set)
for line in logs.splitlines():
    date, lvl, msg, user = pat.match(line).groups()
    by_level[lvl] += 1
    if lvl == "ERROR":
        errors_by_user[int(user)].add(msg)
print(by_level.most_common())
print({u: sorted(m) for u, m in errors_by_user.items()})
print(f"{'level':&lt;6}|{'n':&gt;3}")
for lvl, n in by_level.most_common():
    print(f"{lvl:&lt;6}|{n:&gt;3}")</div>
  <div class="fx" data-lang="text">[('ERROR', 3), ('INFO', 1), ('WARN', 1)]
{42: ['db timeout'], 7: ['disk full']}
level |  n
ERROR |  3
INFO  |  1
WARN  |  1</div>
  <p><strong>Extend it:</strong> keep only the last 3 errors per user with <code>defaultdict(lambda: deque(maxlen=3))</code>.</p>

  <h2 id="pd-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>List vs tuple: what's the real trade-off?</summary><div class="qa-body">List: changeable, can grow, not hashable. Tuple: fixed, a little smaller and faster, hashable when its items are — so it can be a dict key or set item. Use a tuple for fixed records, and as a promise that nobody changes the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>x in set</code> O(1) but <code>x in list</code> O(n)?</summary><div class="qa-body">A list compares items one by one. A set is a hash table: <code>hash(x)</code> picks a slot directly, then one equality check confirms. O(1) on average; O(n) in the worst case if many keys collide.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must dict keys be hashable / immutable?</summary><div class="qa-body">The slot is chosen from the key's hash when it is inserted. If the key changed, its hash would change, and lookups would check the wrong slot — the entry is lost. So Python needs a stable <code>__hash__</code>; lists, dicts and sets have none.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shallow vs deep copy — when does it bite?</summary><div class="qa-body"><code>a.copy()</code>/<code>a[:]</code> make a new outer container but share the inner objects. Editing a nested list or dict through the copy changes the original. Use <code>copy.deepcopy</code> for nested data (configs, JSON, list of lists).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>g = [[0]*2]*2; g[0][0] = 1; print(g)</code></summary><div class="qa-body"><code>[[1, 0], [1, 0]]</code>. <code>*2</code> repeats the reference to one inner list. Build rows with <code>[[0]*2 for _ in range(2)]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>print({1: "a", True: "b", 1.0: "c"})</code></summary><div class="qa-body"><code>{1: 'c'}</code>. <code>1 == True == 1.0</code> and they hash the same, so it is one key. The first key object stays; the value is overwritten each time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Remove duplicates from a list while keeping order.</summary><div class="qa-body"><code>list(dict.fromkeys(xs))</code> — dicts keep insertion order and keys are unique. <code>list(set(xs))</code> loses order. Both are O(n); items must be hashable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is building a string with <code>+=</code> in a loop slow? Fix?</summary><div class="qa-body">Strings cannot change, so each <code>+</code> makes a new string and copies everything so far → O(n²) total. Append pieces to a list and <code>"".join(parts)</code> once → O(n). Measured here: 20 ms vs 0.25 ms for 20k pieces.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need a FIFO queue for BFS. List or something else?</summary><div class="qa-body"><code>collections.deque</code>. <code>list.pop(0)</code> shifts every element (O(n)); <code>deque.popleft()</code> is O(1). Draining 100k items: 2.03 s vs 0.009 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>re.match</code> vs <code>re.search</code> vs <code>re.fullmatch</code>?</summary><div class="qa-body"><code>match</code> tries only at position 0. <code>search</code> scans the whole string for the first hit. <code>fullmatch</code> needs the entire string to match (best for validation). <code>findall</code> returns all matches — or only the groups, if the pattern has groups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A CSV shows <code>cafÃ©</code> instead of <code>café</code>. What happened?</summary><div class="qa-body">UTF-8 bytes were decoded as Latin-1/cp1252 (mojibake). Read with <code>encoding="utf-8"</code> (or <code>"utf-8-sig"</code> for Excel files with a BOM). <code>str</code> is text, <code>bytes</code> is encoded data; convert with <code>encode</code>/<code>decode</code> at the edges of your program.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a one-liner: word frequencies, top 3.</summary><div class="qa-body"><code>Counter(text.lower().split()).most_common(3)</code>. For grouping instead of counting: <code>d = defaultdict(list); d[k].append(v)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use <code>hash(user_id)</code> to assign users to A/B buckets?</summary><div class="qa-body">String hashes change in every Python process, so the same user lands in different buckets on different runs or machines. Use a stable hash: <code>int(hashlib.md5(uid.encode()).hexdigest(), 16) % 100</code>.</div></details>
</main>`
});
