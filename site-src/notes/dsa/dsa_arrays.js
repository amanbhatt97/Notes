// notes/dsa/dsa_arrays.js — Arrays, Strings & Two Pointers
Object.assign(TOPIC_CONTENT, {
  "dsa_arrays": `<main>
  <h1>Arrays, Strings &amp; Two Pointers</h1>
  <p class="lead">An array is a row of numbered boxes, and almost every interview starts with one. This note covers what a Python list really costs, why strings can't be changed in place, and the four tricks that turn slow O(n²) loops over arrays into one O(n) pass: two pointers, sliding window, prefix sums and Kadane. It ends with 2D grids. Big-O from the complexity note helps.</p>

  <h2 id="dsa-ar-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Arrays, Strings &amp; Two Pointers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Array basics</div>
        <ul>
          <li><b>Array</b> — items side by side in one block of memory, same-size slots</li>
          <li><b>Index</b> — address = start + i × size → read/write <code>a[i]</code> in O(1)</li>
          <li><b>Dynamic array</b> (Python list) — full? allocate ~2× bigger, copy over</li>
          <li><b>append</b> — O(1) amortised; resize is rare and its cost spreads out</li>
          <li>💡 Hostel lockers: walk straight to locker 37</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python list costs</div>
        <ul>
          <li><b>O(1)</b> — <code>a[i]</code>, <code>a[i] = x</code>, <code>append</code>, <code>pop()</code>, <code>len</code></li>
          <li><b>O(n)</b> — <code>insert(0, x)</code>, <code>pop(0)</code>, <code>x in a</code>, <code>remove</code>, <code>index</code></li>
          <li><b>O(k)</b> — slice <code>a[i:i+k]</code> makes a copy</li>
          <li><b>O(n log n)</b> — <code>sort()</code> / <code>sorted()</code></li>
          <li>⚠ <code>[[0]*m]*n</code> → n references to one row</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Strings</div>
        <ul>
          <li><b>Immutable</b> — <code>s[0] = "x"</code> is a TypeError; every change makes a new string</li>
          <li><b>+= in a loop</b> — may copy all so far each time → O(n²) worst case</li>
          <li><b>Build with a list</b>, then <code>"".join(parts)</code> once → O(n)</li>
          <li><code>list(s)</code> to edit chars; <code>s[::-1]</code> reverse; <code>ord</code> / <code>chr</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two pointers</div>
        <ul>
          <li><b>Opposite ends</b> — L at start, R at end, move toward each other (needs sorted / symmetric)</li>
          <li><b>Same direction</b> — slow writes, fast reads (in-place filter, dedupe)</li>
          <li><b>Why it works</b> — each step safely rules out a whole row of pairs</li>
          <li><b>Cost</b> — O(n) instead of O(n²) pairs, O(1) space</li>
          <li>Signal: "sorted", "pair / triplet sums to", "in place", "palindrome"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sliding window</div>
        <ul>
          <li><b>Fixed k</b> — add the new right item, subtract the item that fell off</li>
          <li><b>Variable</b> — grow right; while the window breaks the rule (or is valid, for "min"), shrink left</li>
          <li>Each index enters once, leaves once → O(n)</li>
          <li>Signal: "contiguous subarray / substring", "longest / shortest / at most k"</li>
          <li>⚠ Needs a rule that stays broken as the window grows (e.g. positives only)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Prefix sums &amp; Kadane</div>
        <ul>
          <li><b>prefix[i]</b> = sum of first i items; <code>prefix[0] = 0</code></li>
          <li><b>Range sum</b> i..j = <code>prefix[j+1] − prefix[i]</code> in O(1)</li>
          <li><b>With negatives / "sum equals k"</b> → prefix sum + hashmap (see Hashing note)</li>
          <li><b>Kadane</b> — <code>cur = max(x, cur + x)</code>; best = max seen → max subarray O(n)</li>
          <li>⚠ All negative: start from <code>nums[0]</code>, not 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrix / 2D</div>
        <ul>
          <li><code>grid[r][c]</code>; rows = <code>len(grid)</code>, cols = <code>len(grid[0])</code></li>
          <li><b>4 neighbours</b> — loop over <code>(1,0),(-1,0),(0,1),(0,-1)</code>, check bounds</li>
          <li><b>Spiral</b> — four walls top/bottom/left/right, shrink after each side</li>
          <li><b>Rotate 90° clockwise</b> — transpose, then reverse each row</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Two Sum II</b>, <b>Container With Most Water</b>, <b>3Sum</b> — two pointers</li>
          <li><b>Longest Substring w/o Repeat</b>, <b>Minimum Window</b> — variable window</li>
          <li><b>Maximum Subarray</b> — Kadane</li>
          <li><b>Product Except Self</b> — prefix × suffix products</li>
          <li><b>Rotate Image</b>, <b>Spiral Matrix</b> — 2D index work</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-ar-lockers"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A Row of Lockers</span><span class="rm-sub">Why a[i] is instant</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-dynamic"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Python Lists &amp; Their Costs</span><span class="rm-sub">Dynamic array from scratch, Big-O table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-strings"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Strings</span><span class="rm-sub">Immutability, join vs +=</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-twoptr"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Two Pointers</span><span class="rm-sub">Opposite ends, same direction</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-window"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Sliding Window</span><span class="rm-sub">Fixed size and variable size</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-prefix"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Prefix Sums</span><span class="rm-sub">Any range sum in O(1)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-kadane"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Kadane's Algorithm</span><span class="rm-sub">Best subarray in one pass</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-matrix"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Matrices &amp; 2D Traversal</span><span class="rm-sub">Spiral, rotate, neighbours</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words → technique</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-problems"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">8 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Shared rows, off-by-one, O(n) hidden ops</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ar-lockers"><span class="num">01</span>A Row of Lockers</h2>
  <p>A college hostel has a corridor of lockers, numbered 0, 1, 2, 3… and every locker is the same width. Someone says "get my bag from locker 37". You don't open lockers 0 to 36 first. You know where 37 is, so you walk straight there.</p>
  <p>That is an <strong>array</strong>: items stored side by side in one unbroken block of memory, every slot the same size. Because of that, the computer can work out where item <code>i</code> lives with one small sum, and jump there directly.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600"><rect x="75" y="50" width="75" height="40" class="fb sb"/><text x="112.5" y="75" text-anchor="middle">10</text><text x="112.5" y="40" text-anchor="middle" class="tm">1000</text><text x="112.5" y="110" text-anchor="middle" class="tm">i=0</text><rect x="150" y="50" width="75" height="40" class="fb sb"/><text x="187.5" y="75" text-anchor="middle">20</text><text x="187.5" y="40" text-anchor="middle" class="tm">1008</text><text x="187.5" y="110" text-anchor="middle" class="tm">i=1</text><rect x="225" y="50" width="75" height="40" class="fb sb"/><text x="262.5" y="75" text-anchor="middle">30</text><text x="262.5" y="40" text-anchor="middle" class="tm">1016</text><text x="262.5" y="110" text-anchor="middle" class="tm">i=2</text><rect x="300" y="50" width="75" height="40" class="fg sg"/><text x="337.5" y="75" text-anchor="middle">40</text><text x="337.5" y="40" text-anchor="middle" class="tm">1024</text><text x="337.5" y="110" text-anchor="middle" class="tm">i=3</text><rect x="375" y="50" width="75" height="40" class="fb sb"/><text x="412.5" y="75" text-anchor="middle">50</text><text x="412.5" y="40" text-anchor="middle" class="tm">1032</text><text x="412.5" y="110" text-anchor="middle" class="tm">i=4</text><rect x="450" y="50" width="75" height="40" class="fb sb"/><text x="487.5" y="75" text-anchor="middle">60</text><text x="487.5" y="40" text-anchor="middle" class="tm">1040</text><text x="487.5" y="110" text-anchor="middle" class="tm">i=5</text><text x="35" y="40" text-anchor="middle" class="tm">addr</text><text x="35" y="75" text-anchor="middle">value</text><text x="300" y="18" text-anchor="middle" class="tb">one unbroken block of memory, every slot the same size</text><text x="300" y="145" text-anchor="middle" class="tg">address of a[3] = 1000 + 3 × 8 = 1024  → one multiply, one jump: O(1)</text></svg><figcaption>Six numbers stored in one block. Each slot is 8 bytes wide, so slot i starts at 1000 + i × 8. No searching, just arithmetic.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Array</strong>: a fixed-size, contiguous block of same-size slots. <strong>Random access</strong>: reading or writing any index in O(1), because <code>address = start + index × slot_size</code>. This is the one thing arrays do better than anything else.</p>
  </div>
  <p>The price of "side by side" shows up when you change the middle. To insert a new item at locker 0, every item must shift one place right to make room. To remove locker 0, everyone shifts left to close the gap. That is O(n) work. Adding or removing at the <em>end</em> moves nobody, so it is O(1).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A row of people sitting on a cinema bench with no gaps. Someone new wants the first seat: all of them must shuffle one seat right. Someone new sitting at the far end disturbs nobody.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Arrays are fast at <strong>"go to position i"</strong> and at the <strong>end</strong>. They are slow at the <strong>front and middle</strong>, and slow at <strong>"is x in here?"</strong> (that needs a scan, or a set; see the Hashing note). Most array tricks in this note are ways to stay in the fast zone.</p>
  </div>

  <h2 id="dsa-ar-dynamic"><span class="num">02</span>Python Lists &amp; Their Costs</h2>
  <p>A real array has a fixed size. But a Python list grows when you <code>append</code>. How? It is a <strong>dynamic array</strong>: it reserves some spare slots, and when they run out it grabs a bigger block (roughly double), copies everything across and throws the old block away.</p>
  <p>Copying n items sounds expensive. The trick is that it happens rarely. After a resize to 16 slots, the next 8 appends are free. Here is a tiny version that counts the copies.</p>
  <div class="fx" data-lang="py">class DynamicArray:
    def __init__(self):
        self.cap = 1                     # room we have reserved
        self.n = 0                       # items actually stored
        self.slots = [None] * self.cap
        self.copies = 0                  # count work, to see the cost

    def append(self, x):
        if self.n == self.cap:           # full: get a block twice as big
            self._resize(2 * self.cap)
        self.slots[self.n] = x
        self.n += 1

    def _resize(self, new_cap):
        new = [None] * new_cap
        for i in range(self.n):          # copy every old item across
            new[i] = self.slots[i]
            self.copies += 1
        self.slots, self.cap = new, new_cap

    def __getitem__(self, i):            # O(1): jump straight to slot i
        if not 0 &lt;= i &lt; self.n:
            raise IndexError(i)
        return self.slots[i]

a = DynamicArray()
for x in range(1, 10):
    a.append(x * 10)
    print(f"append {x*10:2}: n={a.n} cap={a.cap} copies so far={a.copies}")</div>
  <div class="fx" data-lang="text">append 10: n=1 cap=1 copies so far=0
append 20: n=2 cap=2 copies so far=1
append 30: n=3 cap=4 copies so far=3
append 40: n=4 cap=4 copies so far=3
append 50: n=5 cap=8 copies so far=7
append 60: n=6 cap=8 copies so far=7
append 70: n=7 cap=8 copies so far=7
append 80: n=8 cap=8 copies so far=7
append 90: n=9 cap=16 copies so far=15</div>
  <p>9 appends caused only 15 copies in total. The copies are 1 + 2 + 4 + 8 = 15, always less than 2n. Spread across n appends that is under 2 copies each: <strong>O(1) amortised</strong>. "Amortised" means "averaged over many calls"; one unlucky append is O(n), but the average is constant.</p>
  <p>CPython's real list grows by about 1.125× plus a little, not 2×, but the argument is the same: any constant growth factor gives O(1) amortised. An insert in the middle would shift the tail right one slot at a time: O(n).</p>
  <h3>The cost table you should know by heart</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Time</th><th>Plain reason</th></tr>
    <tr><td><code>a[i]</code>, <code>a[i] = x</code>, <code>len(a)</code></td><td>O(1)</td><td>Address arithmetic; length is stored</td></tr>
    <tr><td><code>a.append(x)</code>, <code>a.pop()</code></td><td>O(1) amortised</td><td>Only the end changes</td></tr>
    <tr><td><code>a.insert(i, x)</code>, <code>a.pop(i)</code>, <code>del a[i]</code></td><td>O(n − i)</td><td>Everything after i shifts</td></tr>
    <tr><td><code>a.insert(0, x)</code>, <code>a.pop(0)</code></td><td>O(n)</td><td>Everyone shifts. Use <code>deque</code> for queues</td></tr>
    <tr><td><code>x in a</code>, <code>a.index(x)</code>, <code>a.remove(x)</code>, <code>a.count(x)</code></td><td>O(n)</td><td>Scan until found. Use a <code>set</code> for repeated lookups</td></tr>
    <tr><td><code>a[i:j]</code> slice</td><td>O(j − i)</td><td>Makes a new list (a copy)</td></tr>
    <tr><td><code>a + b</code>, <code>a.extend(b)</code></td><td>O(len a + len b) / O(len b)</td><td><code>+</code> builds a new list; extend appends in place</td></tr>
    <tr><td><code>min</code>, <code>max</code>, <code>sum</code>, <code>a.reverse()</code>, <code>a[::-1]</code></td><td>O(n)</td><td>Touch every item once</td></tr>
    <tr><td><code>a.sort()</code>, <code>sorted(a)</code></td><td>O(n log n)</td><td>Timsort; <code>sort</code> is in place, <code>sorted</code> returns a copy</td></tr>
  </table>
  <div class="fx" data-lang="py">nums = [3, 1, 4, 1, 5]
nums.append(9)          # O(1) amortised
nums.pop()              # O(1) from the end
nums.insert(0, 7)       # O(n): everything shifts right
first = nums.pop(0)     # O(n): everything shifts left
print(nums, first, 4 in nums, nums[1:3], nums[::-1])

grid_bad = [[0] * 3] * 2      # 2 references to the SAME row
grid_bad[0][0] = 1
grid_ok = [[0] * 3 for _ in range(2)]
grid_ok[0][0] = 1
print(grid_bad, grid_ok)</div>
  <div class="fx" data-lang="text">[3, 1, 4, 1, 5] 7 True [1, 4] [5, 1, 4, 1, 3]
[[1, 0, 0], [1, 0, 0]] [[1, 0, 0], [0, 0, 0]]</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>[[0] * 3] * 2</code> does not make two rows. It makes one row and a list holding two references to it. Change one, both change. Always build a grid with a comprehension: <code>[[0] * cols for _ in range(rows)]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A hidden O(n) inside a loop makes the whole thing O(n²): <code>if x in my_list</code>, <code>my_list.pop(0)</code>, <code>my_list.insert(0, x)</code>, or slicing <code>a[1:]</code> in recursion. Interviewers look for exactly these.</p>
  </div>

  <h2 id="dsa-ar-strings"><span class="num">03</span>Strings</h2>
  <p>A string is an array of characters, so indexing <code>s[i]</code> and <code>len(s)</code> are O(1), and slicing copies. One big difference: in Python a string is <strong>immutable</strong>. Once made, it can never change. Every "change" builds a brand-new string.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A printed wedding card. To fix a spelling mistake you cannot erase one letter; you must print a whole new card. A Python list is more like a whiteboard: wipe one cell, write a new value.</p>
  </div>
  <div class="fx" data-lang="py">s = "chai"
try:
    s[0] = "C"
except TypeError as e:
    print("TypeError:", e)
t = s
s += " garam"            # builds a NEW string; t still points to the old one
print(s, "|", t)

words = ["masala", "chai", "please"]
out = ""
for w in words:
    out += w + " "          # each += may copy everything built so far
print(repr(out.strip()), repr(" ".join(words)))

chars = list("hello")       # mutable copy
chars[0] = "j"
print("".join(chars), "hello"[::-1], ord("a"), chr(98), "Hello World".split())</div>
  <div class="fx" data-lang="text">TypeError: 'str' object does not support item assignment
chai garam | chai
'masala chai please' 'masala chai please'
jello olleh 97 b ['Hello', 'World']</div>
  <h3>join vs +=</h3>
  <p>Building a long string with <code>+=</code> in a loop: each step may copy everything built so far. Lengths 1, 2, 3, … n add up to about n²/2 character copies, so O(n²) in the worst case. Collecting pieces in a list and calling <code>"".join(parts)</code> once measures the total length, allocates once and copies each character once: O(n).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"But my += loop runs fast." CPython has a special trick that sometimes grows the string in place when nobody else references it. It is an implementation detail, not a promise (PyPy and other cases don't do it). In an interview always say: <strong>build a list, join once</strong>.</p>
  </div>

  <h2 id="dsa-ar-twoptr"><span class="num">04</span>Two Pointers</h2>
  <p>Many array questions ask about <strong>pairs</strong>: "two numbers that add to 10", "two walls that hold the most water". The obvious way tries every pair: two nested loops, n²/2 pairs. For n = 100,000 that is 5 billion checks. Two pointers does it in n steps.</p>
  <h3>Style 1: opposite ends</h3>
  <p>Put <code>L</code> at the start and <code>R</code> at the end. Look at the pair. Based on what you see, move <strong>one</strong> of them inward. Stop when they meet.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You have ₹10 and a menu sorted by price: 1, 3, 4, 6, 8, 11. Want two items that cost exactly 10. Try cheapest + costliest: 1 + 11 = 12, too much. Is 11 ever useful? It is too costly even with the cheapest item, so 11 is out for good. Drop it. Now 1 + 8 = 9, too little. Even with the costliest remaining item, 1 is too cheap, so 1 is out. Every step throws away one item forever.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 280" width="600"><rect x="20" y="14" width="44" height="28" class="fb sb"/><text x="42" y="33" text-anchor="middle">1</text><rect x="64" y="14" width="44" height="28" class="fs"/><text x="86" y="33" text-anchor="middle">3</text><rect x="108" y="14" width="44" height="28" class="fs"/><text x="130" y="33" text-anchor="middle">4</text><rect x="152" y="14" width="44" height="28" class="fs"/><text x="174" y="33" text-anchor="middle">6</text><rect x="196" y="14" width="44" height="28" class="fs"/><text x="218" y="33" text-anchor="middle">8</text><rect x="240" y="14" width="44" height="28" class="fr sr"/><text x="262" y="33" text-anchor="middle">11</text><text x="42" y="56" text-anchor="middle" class="tb">L</text><text x="262" y="56" text-anchor="middle" class="tr">R</text><text x="310" y="33" text-anchor="start">1 + 11 = 12 &gt; 10 → move R left</text><rect x="20" y="68" width="44" height="28" class="fb sb"/><text x="42" y="87" text-anchor="middle">1</text><rect x="64" y="68" width="44" height="28" class="fs"/><text x="86" y="87" text-anchor="middle">3</text><rect x="108" y="68" width="44" height="28" class="fs"/><text x="130" y="87" text-anchor="middle">4</text><rect x="152" y="68" width="44" height="28" class="fs"/><text x="174" y="87" text-anchor="middle">6</text><rect x="196" y="68" width="44" height="28" class="fr sr"/><text x="218" y="87" text-anchor="middle">8</text><rect x="240" y="68" width="44" height="28" class="fs"/><text x="262" y="87" text-anchor="middle">11</text><text x="42" y="110" text-anchor="middle" class="tb">L</text><text x="218" y="110" text-anchor="middle" class="tr">R</text><text x="310" y="87" text-anchor="start">1 + 8 = 9 &lt; 10 → move L right</text><rect x="20" y="122" width="44" height="28" class="fs"/><text x="42" y="141" text-anchor="middle">1</text><rect x="64" y="122" width="44" height="28" class="fb sb"/><text x="86" y="141" text-anchor="middle">3</text><rect x="108" y="122" width="44" height="28" class="fs"/><text x="130" y="141" text-anchor="middle">4</text><rect x="152" y="122" width="44" height="28" class="fs"/><text x="174" y="141" text-anchor="middle">6</text><rect x="196" y="122" width="44" height="28" class="fr sr"/><text x="218" y="141" text-anchor="middle">8</text><rect x="240" y="122" width="44" height="28" class="fs"/><text x="262" y="141" text-anchor="middle">11</text><text x="86" y="164" text-anchor="middle" class="tb">L</text><text x="218" y="164" text-anchor="middle" class="tr">R</text><text x="310" y="141" text-anchor="start">3 + 8 = 11 &gt; 10 → move R left</text><rect x="20" y="176" width="44" height="28" class="fs"/><text x="42" y="195" text-anchor="middle">1</text><rect x="64" y="176" width="44" height="28" class="fb sb"/><text x="86" y="195" text-anchor="middle">3</text><rect x="108" y="176" width="44" height="28" class="fs"/><text x="130" y="195" text-anchor="middle">4</text><rect x="152" y="176" width="44" height="28" class="fr sr"/><text x="174" y="195" text-anchor="middle">6</text><rect x="196" y="176" width="44" height="28" class="fs"/><text x="218" y="195" text-anchor="middle">8</text><rect x="240" y="176" width="44" height="28" class="fs"/><text x="262" y="195" text-anchor="middle">11</text><text x="86" y="218" text-anchor="middle" class="tb">L</text><text x="174" y="218" text-anchor="middle" class="tr">R</text><text x="310" y="195" text-anchor="start">3 + 6 = 9 &lt; 10 → move L right</text><rect x="20" y="230" width="44" height="28" class="fs"/><text x="42" y="249" text-anchor="middle">1</text><rect x="64" y="230" width="44" height="28" class="fs"/><text x="86" y="249" text-anchor="middle">3</text><rect x="108" y="230" width="44" height="28" class="fg sg"/><text x="130" y="249" text-anchor="middle">4</text><rect x="152" y="230" width="44" height="28" class="fg sg"/><text x="174" y="249" text-anchor="middle">6</text><rect x="196" y="230" width="44" height="28" class="fs"/><text x="218" y="249" text-anchor="middle">8</text><rect x="240" y="230" width="44" height="28" class="fs"/><text x="262" y="249" text-anchor="middle">11</text><text x="130" y="272" text-anchor="middle" class="tb">L</text><text x="174" y="272" text-anchor="middle" class="tr">R</text><text x="310" y="249" text-anchor="start" class="tg">4 + 6 = 10 → found!</text></svg><figcaption>Sorted list, target 10. Sum too big → R steps left (only a smaller number can help). Sum too small → L steps right. Five steps instead of fifteen pairs.</figcaption></figure>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Why is it safe to skip pairs? When <code>a[L] + a[R]</code> is too big, then <code>a[R]</code> plus <em>anything</em> between L and R is also too big (the list is sorted). So all those pairs with R are dead; moving R discards them in one step. That "one step kills a whole row of pairs" argument is the proof you give in interviews.</p>
  </div>
  <div class="fx" data-lang="py">def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l &lt; r:
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    return True

for s in ["racecar", "abba", "chai", "", "a"]:
    print(repr(s), is_palindrome(s))</div>
  <div class="fx" data-lang="text">'racecar' True
'abba' True
'chai' False
'' True
'a' True</div>
  <h3>Style 2: same direction (slow and fast)</h3>
  <p>Both pointers start at the left. <code>fast</code> reads every item. <code>slow</code> marks the next place to <em>write</em> a keeper. This filters or compacts a list <strong>in place</strong>, with O(1) extra space.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sorting mangoes into a crate. Your right hand (fast) picks up every mango. Your left hand (slow) points at the next empty spot in the crate. Good mango? Put it at the left hand's spot and move the left hand. Bad mango? Skip it.</p>
  </div>
  <div class="fx" data-lang="py">def remove_duplicates(nums):           # nums is sorted
    if not nums:
        return 0
    slow = 1                          # next place to write a new value
    for fast in range(1, len(nums)):
        if nums[fast] != nums[fast - 1]:
            nums[slow] = nums[fast]
            slow += 1
    return slow                       # first slow items are the unique ones

def move_zeroes(nums):
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    return nums

a = [1, 1, 2, 3, 3, 3, 4]
k = remove_duplicates(a)
print(k, a[:k])
print(move_zeroes([0, 1, 0, 3, 12]))</div>
  <div class="fx" data-lang="text">4 [1, 2, 3, 4]
[1, 3, 12, 0, 0]</div>
  <table class="tbl">
    <tr><th>Style</th><th>Start</th><th>Needs</th><th>Typical problems</th></tr>
    <tr><td>Opposite ends</td><td>L = 0, R = n − 1</td><td>Sorted input, or a symmetric check</td><td>Two Sum II, 3Sum, Container With Most Water, palindrome, reverse in place</td></tr>
    <tr><td>Same direction</td><td>slow = fast = 0 (or 1)</td><td>Nothing special</td><td>Remove duplicates, move zeroes, remove element, merge sorted arrays</td></tr>
    <tr><td>Fast &amp; slow by speed</td><td>both at head</td><td>Linked structure</td><td>Cycle detection, middle node (see Linked Lists note)</td></tr>
  </table>

  <h2 id="dsa-ar-window"><span class="num">05</span>Sliding Window</h2>
  <p>A <strong>subarray</strong> is a contiguous piece of an array (no gaps). Questions like "best sum of 3 days in a row" or "longest piece of the string with no repeat" are about subarrays. Brute force checks every start and every end: O(n²) windows, and summing each one makes it O(n³).</p>
  <p>The sliding window idea: neighbouring windows share almost everything. Don't recompute; when the window moves one step, add the item that comes in and remove the item that falls out.</p>
  <h3>Fixed size k</h3>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper tracks sales over the last 3 days. Each new morning she doesn't re-add three days; she adds today's sales and subtracts the day that just dropped out of the 3-day range.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><rect x="20" y="14" width="44" height="28" class="fg"/><text x="42" y="33" text-anchor="middle">2</text><rect x="64" y="14" width="44" height="28" class="fg"/><text x="86" y="33" text-anchor="middle">1</text><rect x="108" y="14" width="44" height="28" class="fg"/><text x="130" y="33" text-anchor="middle">5</text><rect x="152" y="14" width="44" height="28" class="fs"/><text x="174" y="33" text-anchor="middle">1</text><rect x="196" y="14" width="44" height="28" class="fs"/><text x="218" y="33" text-anchor="middle">3</text><rect x="240" y="14" width="44" height="28" class="fs"/><text x="262" y="33" text-anchor="middle">2</text><rect x="20" y="14" width="132" height="28" class="sg" fill="none" stroke-width="2.5"/><text x="310" y="33" text-anchor="start">first window: 2 + 1 + 5 = 8</text><rect x="20" y="60" width="44" height="28" class="fs"/><text x="42" y="79" text-anchor="middle">2</text><rect x="64" y="60" width="44" height="28" class="fg"/><text x="86" y="79" text-anchor="middle">1</text><rect x="108" y="60" width="44" height="28" class="fg"/><text x="130" y="79" text-anchor="middle">5</text><rect x="152" y="60" width="44" height="28" class="fg"/><text x="174" y="79" text-anchor="middle">1</text><rect x="196" y="60" width="44" height="28" class="fs"/><text x="218" y="79" text-anchor="middle">3</text><rect x="240" y="60" width="44" height="28" class="fs"/><text x="262" y="79" text-anchor="middle">2</text><rect x="64" y="60" width="132" height="28" class="sg" fill="none" stroke-width="2.5"/><text x="42" y="102" text-anchor="middle" class="tr">out</text><text x="174" y="102" text-anchor="middle" class="tg">in</text><text x="310" y="79" text-anchor="start">8 − 2 + 1 = 7</text><rect x="20" y="106" width="44" height="28" class="fs"/><text x="42" y="125" text-anchor="middle">2</text><rect x="64" y="106" width="44" height="28" class="fs"/><text x="86" y="125" text-anchor="middle">1</text><rect x="108" y="106" width="44" height="28" class="fg"/><text x="130" y="125" text-anchor="middle">5</text><rect x="152" y="106" width="44" height="28" class="fg"/><text x="174" y="125" text-anchor="middle">1</text><rect x="196" y="106" width="44" height="28" class="fg"/><text x="218" y="125" text-anchor="middle">3</text><rect x="240" y="106" width="44" height="28" class="fs"/><text x="262" y="125" text-anchor="middle">2</text><rect x="108" y="106" width="132" height="28" class="sg" fill="none" stroke-width="2.5"/><text x="86" y="148" text-anchor="middle" class="tr">out</text><text x="218" y="148" text-anchor="middle" class="tg">in</text><text x="310" y="125" text-anchor="start" class="tg">7 − 1 + 3 = 9  ← best</text><rect x="20" y="152" width="44" height="28" class="fs"/><text x="42" y="171" text-anchor="middle">2</text><rect x="64" y="152" width="44" height="28" class="fs"/><text x="86" y="171" text-anchor="middle">1</text><rect x="108" y="152" width="44" height="28" class="fs"/><text x="130" y="171" text-anchor="middle">5</text><rect x="152" y="152" width="44" height="28" class="fg"/><text x="174" y="171" text-anchor="middle">1</text><rect x="196" y="152" width="44" height="28" class="fg"/><text x="218" y="171" text-anchor="middle">3</text><rect x="240" y="152" width="44" height="28" class="fg"/><text x="262" y="171" text-anchor="middle">2</text><rect x="152" y="152" width="132" height="28" class="sg" fill="none" stroke-width="2.5"/><text x="130" y="194" text-anchor="middle" class="tr">out</text><text x="262" y="194" text-anchor="middle" class="tg">in</text><text x="310" y="171" text-anchor="start">9 − 5 + 2 = 6</text></svg><figcaption>Fixed window of size 3 over [2, 1, 5, 1, 3, 2]. Each move is one subtraction and one addition, so the whole scan is O(n).</figcaption></figure>
  <div class="fx" data-lang="py">def max_sum_k(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]   # one in, one out
        best = max(best, window)
    return best

print(max_sum_k([2, 1, 5, 1, 3, 2], 3))</div>
  <div class="fx" data-lang="text">9</div>
  <h3>Variable size: grow right, shrink left</h3>
  <p>Now the window size is the unknown. "Shortest subarray with sum ≥ 7". Move <code>right</code> forward one step at a time to grow. Whenever the window is good enough, record it, then pull <code>left</code> forward to see if a shorter one still works.</p>
  <div class="flow"><span>right += 1 (take one more)</span><span>update window state</span><span>while window valid / broken: move left</span><span>record the answer</span></div>
  <div class="fx" data-lang="py">def min_subarray_len(target, nums):      # nums are positive
    left = 0
    total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x                        # grow: take one more on the right
        while total &gt;= target:            # valid: try to shrink from the left
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best

for t, arr in [(7, [2, 3, 1, 2, 4, 3]), (4, [1, 4, 4]), (11, [1, 1, 1, 1, 1])]:
    print(t, arr, "-&gt;", min_subarray_len(t, arr))</div>
  <div class="fx" data-lang="text">7 [2, 3, 1, 2, 4, 3] -&gt; 2
4 [1, 4, 4] -&gt; 1
11 [1, 1, 1, 1, 1] -&gt; 0</div>
  <p>There is a <code>while</code> inside a <code>for</code>, yet this is O(n), not O(n²). <code>left</code> only moves forward and never past <code>right</code>, so across the whole run it moves at most n times. Each index enters the window once and leaves once: 2n steps.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Two templates cover almost everything. <strong>Longest</strong> window: shrink while the window is <em>broken</em>, then record (answer = biggest valid). <strong>Shortest</strong> window: shrink while the window is <em>valid</em>, recording inside the loop (answer = smallest valid).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sliding window needs <strong>monotonic</strong> behaviour: growing the window must only make the sum bigger (or the "rule" more broken). With negative numbers, adding an item can lower the sum, and shrinking might be wrong. For "subarray sum equals k" with negatives, use prefix sum + hashmap instead (Hashing note).</p>
  </div>

  <h2 id="dsa-ar-prefix"><span class="num">06</span>Prefix Sums</h2>
  <p>Need: answer many questions like "total of items 1 to 3", "total of items 0 to 5", on the same array. Summing each range is O(n) per question. With a <strong>prefix sum</strong> array, each question is O(1) after one O(n) setup.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A car's odometer. It shows total km since the car was new. How far did you drive between Pune and Mumbai? Reading at Mumbai minus reading at Pune. You never re-add the trip kilometre by kilometre.</p>
  </div>
  <p><code>prefix[i]</code> is the sum of the first <code>i</code> items, with <code>prefix[0] = 0</code>. Then the sum from index i to j (both included) is <code>prefix[j + 1] − prefix[i]</code>: "total up to j" minus "total before i".</p>
  <table class="tbl out"><caption>nums = [3, 1, 4, 1, 5, 9]</caption>
    <tr><th>i</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>
    <tr><td>nums[i]</td><td>3</td><td>1</td><td>4</td><td>1</td><td>5</td><td>9</td><td>–</td></tr>
    <tr><td>prefix[i]</td><td>0</td><td>3</td><td>4</td><td>8</td><td>9</td><td>14</td><td>23</td></tr>
  </table>
  <div class="fx" data-lang="py">from itertools import accumulate
nums = [3, 1, 4, 1, 5, 9]
prefix = [0]
for x in nums:
    prefix.append(prefix[-1] + x)
def range_sum(i, j):                      # sum of nums[i..j], both inclusive
    return prefix[j + 1] - prefix[i]
print(prefix, range_sum(1, 3), range_sum(0, 5), list(accumulate(nums, initial=0)))</div>
  <div class="fx" data-lang="text">[0, 3, 4, 8, 9, 14, 23] 6 23 [0, 3, 4, 8, 9, 14, 23]</div>
  <p>Sum of indexes 1..3 is 1 + 4 + 1 = 6, and indeed prefix[4] − prefix[1] = 9 − 3 = 6. <code>itertools.accumulate(nums, initial=0)</code> is the library one-liner.</p>
  <div class="cards">
    <div><b>Leading 0</b><p>Makes ranges that start at index 0 work without a special case.</p><small>prefix has n + 1 entries</small></div>
    <div><b>2D version</b><p><code>P[r+1][c+1] = grid[r][c] + P[r][c+1] + P[r+1][c] − P[r][c]</code> gives any rectangle sum in O(1).</p><small>Inclusion–exclusion</small></div>
    <div><b>+ hashmap</b><p>"How many subarrays sum to k?" Count earlier prefix values equal to <code>prefix − k</code>.</p><small>Hashing note, Subarray Sum Equals K</small></div>
  </div>

  <h2 id="dsa-ar-kadane"><span class="num">07</span>Kadane's Algorithm</h2>
  <p>Question: which contiguous subarray has the biggest sum? In <code>[-2, 1, -3, 4, -1, 2, 1, -5, 4]</code> it is <code>[4, -1, 2, 1]</code> = 6. Brute force tries every start and end: O(n²) with running sums.</p>
  <p>Kadane's idea in plain words: walk left to right, keeping the best sum of a subarray that <strong>ends right here</strong> (<code>cur</code>). At each new number x you have only two choices: join the run you already have (<code>cur + x</code>), or start fresh at x. If the old run is negative, it only drags you down, so drop it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket batting partnership tracked over by over. If the partnership has gone into "negative" (they cost more than they scored), the captain would rather start counting fresh from the next over. The best partnership ever seen is remembered separately.</p>
  </div>
  <div class="fx" data-lang="py">def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)     # extend the old run, or start fresh at x
        best = max(best, cur)
    return best

trace = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
cur = best = trace[0]
print(f"x={trace[0]:2} cur={cur:2} best={best}")
for x in trace[1:]:
    cur = max(x, cur + x); best = max(best, cur)
    print(f"x={x:2} cur={cur:2} best={best}")
print(max_subarray(trace), max_subarray([-3, -1, -2]), max_subarray([5]))</div>
  <div class="fx" data-lang="text">x=-2 cur=-2 best=-2
x= 1 cur= 1 best=1
x=-3 cur=-2 best=1
x= 4 cur= 4 best=4
x=-1 cur= 3 best=4
x= 2 cur= 5 best=5
x= 1 cur= 6 best=6
x=-5 cur= 1 best=6
x= 4 cur= 5 best=6
6 -1 5</div>
  <p>At x = 4, <code>cur</code> was −2, so 4 alone (4) beats −2 + 4 (2): start fresh. That fresh start is where the winning subarray begins. One pass, O(n) time, O(1) space.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Kadane's algorithm</strong> is a tiny dynamic programme: <code>cur[i] = max(nums[i], cur[i−1] + nums[i])</code>, answer = max over all <code>cur[i]</code>. Only the previous value is needed, so it keeps one variable instead of a table.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Starting with <code>best = cur = 0</code> breaks on all-negative input: <code>[-3, -1, -2]</code> would return 0 (the empty subarray) instead of −1. Start from <code>nums[0]</code> unless the problem says an empty subarray is allowed.</p>
  </div>

  <h2 id="dsa-ar-matrix"><span class="num">08</span>Matrices &amp; 2D Traversal</h2>
  <p>A matrix (grid) in Python is a list of rows: <code>grid[r][c]</code> is row r, column c. Rows = <code>len(grid)</code>, columns = <code>len(grid[0])</code>. Think of a cinema seat chart: row letter, then seat number.</p>
  <div class="cards">
    <div><b>Neighbours</b><p>Loop over <code>(1,0), (-1,0), (0,1), (0,-1)</code> and check <code>0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C</code>.</p><small>Add 4 diagonals for 8-way</small></div>
    <div><b>Transpose</b><p><code>[list(r) for r in zip(*grid)]</code> swaps rows and columns.</p><small>Works for non-square too</small></div>
    <div><b>Diagonals</b><p>Same <code>r − c</code> → same ↘ diagonal. Same <code>r + c</code> → same ↙ diagonal.</p><small>N-Queens, diagonal traversal</small></div>
  </div>
  <h3>Rotate 90° clockwise, in place</h3>
  <p>Where does each value go? The first row becomes the last column. Doing that directly needs careful 4-way swaps. A simpler route: two easy steps that each are just swaps. First <strong>transpose</strong> (flip across the main diagonal, <code>a[i][j] ↔ a[j][i]</code>), then <strong>reverse each row</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 600 185" width="600"><rect x="30" y="40" width="36" height="36" class="fv sb"/><text x="48" y="63" text-anchor="middle">1</text><rect x="66" y="40" width="36" height="36" class="fb sb"/><text x="84" y="63" text-anchor="middle">2</text><rect x="102" y="40" width="36" height="36" class="fb sb"/><text x="120" y="63" text-anchor="middle">3</text><rect x="30" y="76" width="36" height="36" class="fb sb"/><text x="48" y="99" text-anchor="middle">4</text><rect x="66" y="76" width="36" height="36" class="fv sb"/><text x="84" y="99" text-anchor="middle">5</text><rect x="102" y="76" width="36" height="36" class="fb sb"/><text x="120" y="99" text-anchor="middle">6</text><rect x="30" y="112" width="36" height="36" class="fb sb"/><text x="48" y="135" text-anchor="middle">7</text><rect x="66" y="112" width="36" height="36" class="fb sb"/><text x="84" y="135" text-anchor="middle">8</text><rect x="102" y="112" width="36" height="36" class="fv sb"/><text x="120" y="135" text-anchor="middle">9</text><rect x="245" y="40" width="36" height="36" class="fv sb"/><text x="263" y="63" text-anchor="middle">1</text><rect x="281" y="40" width="36" height="36" class="fb sb"/><text x="299" y="63" text-anchor="middle">4</text><rect x="317" y="40" width="36" height="36" class="fb sb"/><text x="335" y="63" text-anchor="middle">7</text><rect x="245" y="76" width="36" height="36" class="fb sb"/><text x="263" y="99" text-anchor="middle">2</text><rect x="281" y="76" width="36" height="36" class="fv sb"/><text x="299" y="99" text-anchor="middle">5</text><rect x="317" y="76" width="36" height="36" class="fb sb"/><text x="335" y="99" text-anchor="middle">8</text><rect x="245" y="112" width="36" height="36" class="fb sb"/><text x="263" y="135" text-anchor="middle">3</text><rect x="281" y="112" width="36" height="36" class="fb sb"/><text x="299" y="135" text-anchor="middle">6</text><rect x="317" y="112" width="36" height="36" class="fv sb"/><text x="335" y="135" text-anchor="middle">9</text><rect x="460" y="40" width="36" height="36" class="fg sg"/><text x="478" y="63" text-anchor="middle">7</text><rect x="496" y="40" width="36" height="36" class="fb sb"/><text x="514" y="63" text-anchor="middle">4</text><rect x="532" y="40" width="36" height="36" class="fb sb"/><text x="550" y="63" text-anchor="middle">1</text><rect x="460" y="76" width="36" height="36" class="fg sg"/><text x="478" y="99" text-anchor="middle">8</text><rect x="496" y="76" width="36" height="36" class="fb sb"/><text x="514" y="99" text-anchor="middle">5</text><rect x="532" y="76" width="36" height="36" class="fb sb"/><text x="550" y="99" text-anchor="middle">2</text><rect x="460" y="112" width="36" height="36" class="fg sg"/><text x="478" y="135" text-anchor="middle">9</text><rect x="496" y="112" width="36" height="36" class="fb sb"/><text x="514" y="135" text-anchor="middle">6</text><rect x="532" y="112" width="36" height="36" class="fb sb"/><text x="550" y="135" text-anchor="middle">3</text><text x="84" y="25" text-anchor="middle">original</text><text x="299" y="25" text-anchor="middle">1. transpose</text><text x="514" y="25" text-anchor="middle">2. reverse rows</text><text x="190" y="100" text-anchor="middle">→</text><text x="405" y="100" text-anchor="middle">→</text><text x="84" y="170" text-anchor="middle" class="tm">diagonal stays</text><text x="299" y="170" text-anchor="middle" class="tm">a[i][j] ↔ a[j][i]</text><text x="514" y="170" text-anchor="middle" class="tg">turned 90° clockwise</text></svg><figcaption>Rotate = transpose + reverse each row. The violet cells on the diagonal never move during the transpose. For anticlockwise, reverse each row first, then transpose (or transpose, then reverse the order of rows).</figcaption></figure>
  <h3>Spiral order</h3>
  <p>Read the grid like peeling an onion: across the top, down the right, back along the bottom, up the left, then the next ring inside. Keep four walls: <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>. After reading a side, move that wall inward.</p>
  <div class="fx" data-lang="py">def spiral_order(matrix):
    res = []
    if not matrix:
        return res
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top &lt;= bottom and left &lt;= right:
        for j in range(left, right + 1):          # → along the top row
            res.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1):          # ↓ down the right column
            res.append(matrix[i][right])
        right -= 1
        if top &lt;= bottom:
            for j in range(right, left - 1, -1):  # ← along the bottom row
                res.append(matrix[bottom][j])
            bottom -= 1
        if left &lt;= right:
            for i in range(bottom, top - 1, -1):  # ↑ up the left column
                res.append(matrix[i][left])
            left += 1
    return res

for mat in [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], [[1], [2], [3]], [[7]], []]:
    print(mat, "-&gt;", spiral_order(mat))</div>
  <div class="fx" data-lang="text">[[1, 2, 3], [4, 5, 6], [7, 8, 9]] -&gt; [1, 2, 3, 6, 9, 8, 7, 4, 5]
[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]] -&gt; [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
[[1], [2], [3]] -&gt; [1, 2, 3]
[[7]] -&gt; [7]
[] -&gt; []</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The two <code>if</code> checks before the bottom and left sides are not optional. For a single remaining row (or column), the top pass already read it; without the check, the bottom pass reads it again backwards and you get duplicates. Always test a 1×n and an n×1 grid.</p>
  </div>
  <div class="fx" data-lang="py">grid = [[1, 2, 3], [4, 5, 6]]
print([list(r) for r in zip(*grid)], [list(r) for r in zip(*grid[::-1])])   # transpose, rotate clockwise</div>
  <div class="fx" data-lang="text">[[1, 4], [2, 5], [3, 6]] [[4, 1], [5, 2], [6, 3]]</div>

  <h2 id="dsa-ar-patterns"><span class="num">09</span>Patterns</h2>
  <p>Before coding, match the wording of the question to a technique. These signal words cover most array and string questions.</p>
  <table class="tbl">
    <tr><th>Signal words</th><th>Technique</th><th>Cost</th></tr>
    <tr><td>"sorted array", "pair / triplet that sums to", "closest sum"</td><td>Two pointers, opposite ends (sort first for 3Sum)</td><td>O(n) per pass; O(n²) for 3Sum</td></tr>
    <tr><td>"in place", "remove", "move zeroes", "without extra space"</td><td>Two pointers, slow writer / fast reader</td><td>O(n), O(1) space</td></tr>
    <tr><td>"palindrome", "reverse"</td><td>Two pointers from both ends</td><td>O(n)</td></tr>
    <tr><td>"k consecutive", "every window of size k", "average of subarrays of size k"</td><td>Fixed sliding window</td><td>O(n)</td></tr>
    <tr><td>"longest / shortest substring / subarray such that…", "at most k distinct"</td><td>Variable sliding window + dict/Counter</td><td>O(n)</td></tr>
    <tr><td>"sum of range i..j" many times, "subarray sum equals k"</td><td>Prefix sums (+ hashmap when negatives allowed)</td><td>O(n) setup, O(1) per query</td></tr>
    <tr><td>"maximum (sum) subarray"</td><td>Kadane</td><td>O(n)</td></tr>
    <tr><td>"product of all others", "without division"</td><td>Prefix and suffix products</td><td>O(n)</td></tr>
    <tr><td>"rotate matrix", "spiral", "set matrix zeroes"</td><td>Index arithmetic, boundaries, transpose</td><td>O(R·C)</td></tr>
    <tr><td>"have we seen x?", "count occurrences", "anagram"</td><td>Hash map / set (Hashing note)</td><td>O(n)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every technique here has the same goal: <strong>don't redo work</strong>. Two pointers rules out many pairs per step. A window reuses the previous window. A prefix sum reuses earlier totals. Kadane reuses the best run ending one step back. When you see an O(n²) loop, ask "what am I recomputing?"</p>
  </div>

  <h2 id="dsa-ar-problems"><span class="num">10</span>Classic Problems</h2>
  <h3>1. Two Sum II (input sorted)</h3>
  <p><code>numbers = [2, 7, 11, 15]</code>, target 9 → <code>[1, 2]</code> (1-based positions). Brute force: all pairs, O(n²). Sorted input is the signal for opposite-end pointers.</p>
  <div class="fx" data-lang="py">def two_sum_sorted(numbers, target):
    l, r = 0, len(numbers) - 1
    while l &lt; r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]          # problem wants 1-based indices
        if s &lt; target:
            l += 1                         # need bigger: move the small end up
        else:
            r -= 1                         # need smaller: move the big end down
    return []

for nums, t in [([2, 7, 11, 15], 9), ([2, 3, 4], 6), ([-1, 0], -1), ([1, 2, 3], 10)]:
    print(nums, t, "-&gt;", two_sum_sorted(nums, t))</div>
  <div class="fx" data-lang="text">[2, 7, 11, 15] 9 -&gt; [1, 2]
[2, 3, 4] 6 -&gt; [1, 3]
[-1, 0] -1 -&gt; [1, 2]
[1, 2, 3] 10 -&gt; []</div>
  <p>Time O(n), space O(1). If the input is <em>not</em> sorted, use the hashmap version (Hashing note) for O(n); sorting first would lose the original indexes.</p>

  <h3>2. Container With Most Water</h3>
  <p>Walls of heights <code>[1, 8, 6, 2, 5, 4, 8, 3, 7]</code>. Pick two walls; water held = <code>min(height) × distance</code>. Find the max (49). Brute force: every pair, O(n²).</p>
  <p>Start with the widest pair (both ends). Which end to move? The water is limited by the <strong>shorter</strong> wall. Moving the taller wall inward can only shrink the width while the height stays capped by the same short wall, so it can never help. Moving the shorter one is the only move with a chance.</p>
  <div class="fx" data-lang="py">def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l &lt; r:
        h = min(height[l], height[r])
        best = max(best, h * (r - l))
        if height[l] &lt; height[r]:
            l += 1                         # the shorter wall limits us: drop it
        else:
            r -= 1
    return best

for h in [[1, 8, 6, 2, 5, 4, 8, 3, 7], [1, 1], [4, 3, 2, 1, 4], [1, 2, 1]]:
    print(h, "-&gt;", max_area(h))</div>
  <div class="fx" data-lang="text">[1, 8, 6, 2, 5, 4, 8, 3, 7] -&gt; 49
[1, 1] -&gt; 1
[4, 3, 2, 1, 4] -&gt; 16
[1, 2, 1] -&gt; 2</div>
  <p>49 comes from walls 8 (index 1) and 7 (index 8): min 7 × width 7. Time O(n), space O(1). The input is not sorted here; the pointer rule comes from the "shorter wall limits" argument instead.</p>

  <h3>3. 3Sum</h3>
  <p>Find all unique triplets that sum to 0. <code>[-1, 0, 1, 2, -1, -4]</code> → <code>[[-1, -1, 2], [-1, 0, 1]]</code>. Brute force is O(n³) plus messy de-duplication.</p>
  <p>Sort first. Fix the first number <code>nums[i]</code>; now you need two numbers to the right that sum to <code>-nums[i]</code>. That is Two Sum II on a sorted piece. Skip equal neighbours to avoid repeated triplets.</p>
  <div class="fx" data-lang="py">def three_sum(nums):
    nums.sort()
    res = []
    n = len(nums)
    for i in range(n - 2):
        if i &gt; 0 and nums[i] == nums[i - 1]:
            continue                       # same first number again: skip
        if nums[i] &gt; 0:
            break                          # smallest is positive: no zero sum left
        l, r = i + 1, n - 1
        while l &lt; r:
            s = nums[i] + nums[l] + nums[r]
            if s &lt; 0:
                l += 1
            elif s &gt; 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l &lt; r and nums[l] == nums[l - 1]:
                    l += 1                 # skip repeated second numbers
    return res

for nums in [[-1, 0, 1, 2, -1, -4], [0, 1, 1], [0, 0, 0, 0], [-2, 0, 0, 2, 2]]:
    print(nums, "-&gt;", three_sum(nums[:]))</div>
  <div class="fx" data-lang="text">[-1, 0, 1, 2, -1, -4] -&gt; [[-1, -1, 2], [-1, 0, 1]]
[0, 1, 1] -&gt; []
[0, 0, 0, 0] -&gt; [[0, 0, 0]]
[-2, 0, 0, 2, 2] -&gt; [[-2, 0, 2]]</div>
  <p>Time O(n²): n choices for i, each with an O(n) two-pointer scan. The sort is O(n log n), which is smaller. Space O(1) extra besides the output (the sort is in place). The <code>[0, 0, 0, 0]</code> case checks both skip rules.</p>

  <h3>4. Longest Substring Without Repeating Characters</h3>
  <p><code>"abcabcbb"</code> → 3 (<code>"abc"</code>). Variable window, "longest" template: grow right; if the new character is already inside the window, move left just past its earlier copy. A dict remembers the last index of each character, so left can jump in one step.</p>
  <table class="tbl out"><caption>Dry run on "abcabcbb"</caption>
    <tr><th>right</th><th>ch</th><th>seen inside window?</th><th>left</th><th>window</th><th>best</th></tr>
    <tr><td>0</td><td>a</td><td>no</td><td>0</td><td>a</td><td>1</td></tr>
    <tr><td>1</td><td>b</td><td>no</td><td>0</td><td>ab</td><td>2</td></tr>
    <tr><td>2</td><td>c</td><td>no</td><td>0</td><td>abc</td><td>3</td></tr>
    <tr><td>3</td><td>a</td><td>yes at 0</td><td>1</td><td>bca</td><td>3</td></tr>
    <tr><td>4</td><td>b</td><td>yes at 1</td><td>2</td><td>cab</td><td>3</td></tr>
    <tr><td>5</td><td>c</td><td>yes at 2</td><td>3</td><td>abc</td><td>3</td></tr>
    <tr><td>6</td><td>b</td><td>yes at 4</td><td>5</td><td>cb</td><td>3</td></tr>
    <tr><td>7</td><td>b</td><td>yes at 6</td><td>7</td><td>b</td><td>3</td></tr>
  </table>
  <div class="fx" data-lang="py">def length_of_longest_substring(s):
    last = {}                              # char -&gt; last index seen
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] &gt;= left:
            left = last[ch] + 1            # jump past the earlier copy
        last[ch] = right
        best = max(best, right - left + 1)
    return best

for s in ["abcabcbb", "bbbbb", "pwwkew", "", "abba", " "]:
    print(repr(s), "-&gt;", length_of_longest_substring(s))</div>
  <div class="fx" data-lang="text">'abcabcbb' -&gt; 3
'bbbbb' -&gt; 1
'pwwkew' -&gt; 3
'' -&gt; 0
'abba' -&gt; 2
' ' -&gt; 1</div>
  <p>Time O(n), space O(k) for k distinct characters. The <code>last[ch] &gt;= left</code> check matters: in <code>"abba"</code>, when the final <code>a</code> arrives, its old copy at index 0 is already outside the window (left = 2). Without the check, left would jump <em>backwards</em> to 1 and the answer would be 3, which is wrong.</p>

  <h3>5. Minimum Window Substring</h3>
  <p>Smallest piece of <code>s = "ADOBECODEBANC"</code> that contains every character of <code>t = "ABC"</code> (with counts) → <code>"BANC"</code>. Variable window, "shortest" template: grow right until the window covers t, then shrink left while it still covers t.</p>
  <p>To check "covers t" in O(1), keep <code>need</code> (a Counter of what t still requires, which can go negative for extras) and <code>missing</code> (how many characters of t are still not in the window).</p>
  <div class="fx" data-lang="py">from collections import Counter

def min_window(s, t):
    if not t or not s:
        return ""
    need = Counter(t)                      # what we still owe, per char
    missing = len(t)                       # total chars still owed
    left = 0
    best = (0, float("inf"))               # (start, end) of best window
    for right, ch in enumerate(s):
        if need[ch] &gt; 0:
            missing -= 1                   # this char paid off a debt
        need[ch] -= 1
        if missing == 0:                   # window covers t: shrink it
            while need[s[left]] &lt; 0:       # left char is extra: drop it
                need[s[left]] += 1
                left += 1
            if right - left &lt; best[1] - best[0]:
                best = (left, right)
            need[s[left]] += 1             # give up one needed char
            missing += 1
            left += 1
    start, end = best
    return "" if end == float("inf") else s[start:end + 1]

for s, t in [("ADOBECODEBANC", "ABC"), ("a", "a"), ("a", "aa"), ("aa", "aa"), ("ab", "b")]:
    print(repr(s), repr(t), "-&gt;", repr(min_window(s, t)))</div>
  <div class="fx" data-lang="text">'ADOBECODEBANC' 'ABC' -&gt; 'BANC'
'a' 'a' -&gt; 'a'
'a' 'aa' -&gt; ''
'aa' 'aa' -&gt; 'aa'
'ab' 'b' -&gt; 'b'</div>
  <p>After recording a window, the code deliberately gives up one needed character (moves left past it) so the search continues for a later, shorter window. Time O(|s| + |t|), space O(alphabet). This is the hardest standard window problem; if you can explain <code>need</code> and <code>missing</code>, you can do any of them.</p>

  <h3>6. Maximum Subarray (with the actual subarray)</h3>
  <p>Kadane from section 07, extended to remember <em>where</em> the best run starts and ends: a common follow-up question.</p>
  <div class="fx" data-lang="py">def max_subarray_with_range(nums):
    best = cur = nums[0]
    start = best_l = best_r = 0
    for i in range(1, len(nums)):
        if cur + nums[i] &lt; nums[i]:        # old run hurts: restart here
            cur = nums[i]
            start = i
        else:
            cur += nums[i]
        if cur &gt; best:
            best, best_l, best_r = cur, start, i
    return best, nums[best_l:best_r + 1]

for nums in [[-2, 1, -3, 4, -1, 2, 1, -5, 4], [1], [5, 4, -1, 7, 8], [-3, -1, -2]]:
    print(nums, "-&gt;", max_subarray_with_range(nums))</div>
  <div class="fx" data-lang="text">[-2, 1, -3, 4, -1, 2, 1, -5, 4] -&gt; (6, [4, -1, 2, 1])
[1] -&gt; (1, [1])
[5, 4, -1, 7, 8] -&gt; (23, [5, 4, -1, 7, 8])
[-3, -1, -2] -&gt; (-1, [-1])</div>
  <p>O(n) time, O(1) extra space. Note <code>[5, 4, -1, 7, 8]</code>: the −1 does not cause a restart because 9 − 1 = 8 is still better than −1 alone. Kadane drops a run only when its total is negative.</p>

  <h3>7. Product of Array Except Self</h3>
  <p><code>[1, 2, 3, 4]</code> → <code>[24, 12, 8, 6]</code>: each slot gets the product of all the <em>other</em> numbers. No division allowed (and division breaks on zeros anyway). Brute force: for each i multiply the rest, O(n²).</p>
  <p>Product of everything except i = (product of everything left of i) × (product of everything right of i). Two passes: a left-to-right pass writes the left products, a right-to-left pass multiplies in the right products. Same idea as prefix sums, with × instead of +.</p>
  <table class="tbl out"><caption>nums = [1, 2, 3, 4]</caption>
    <tr><th>i</th><th>0</th><th>1</th><th>2</th><th>3</th></tr>
    <tr><td>left product</td><td>1</td><td>1</td><td>2</td><td>6</td></tr>
    <tr><td>right product</td><td>24</td><td>12</td><td>4</td><td>1</td></tr>
    <tr><td>answer = left × right</td><td>24</td><td>12</td><td>8</td><td>6</td></tr>
  </table>
  <div class="fx" data-lang="py">def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):                     # out[i] = product of everything left of i
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):         # times product of everything right of i
        out[i] *= right
        right *= nums[i]
    return out

for nums in [[1, 2, 3, 4], [-1, 1, 0, -3, 3], [0, 0], [2, 3]]:
    print(nums, "-&gt;", product_except_self(nums))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4] -&gt; [24, 12, 8, 6]
[-1, 1, 0, -3, 3] -&gt; [0, 0, 9, 0, 0]
[0, 0] -&gt; [0, 0]
[2, 3] -&gt; [3, 2]</div>
  <p>Time O(n). Extra space O(1) besides the output, because the "left" array is written straight into <code>out</code> and the right side is a single running variable.</p>

  <h3>8. Rotate Image</h3>
  <p>Rotate an n×n matrix 90° clockwise <strong>in place</strong>. Building a new matrix with <code>zip(*m[::-1])</code> is easy but uses O(n²) extra space, which the problem forbids. Use transpose + reverse rows from section 08.</p>
  <div class="fx" data-lang="py">def rotate(matrix):
    n = len(matrix)
    for i in range(n):                     # 1. transpose: swap across the diagonal
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:                     # 2. reverse every row
        row.reverse()

m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
rotate(m)
print(m)
m1 = [[1]]; rotate(m1); print(m1)</div>
  <div class="fx" data-lang="text">[[7, 4, 1], [8, 5, 2], [9, 6, 3]]
[[1]]</div>
  <p>Time O(n²) (every cell is touched a constant number of times, which is the best possible), extra space O(1). The inner loop starts at <code>j = i + 1</code>: starting at 0 would swap every pair twice and undo the transpose.</p>
  <p>All eight solutions were checked against brute-force versions on hundreds of random inputs, including empty, single-item, all-equal and all-negative cases.</p>

  <h2 id="dsa-ar-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: shared rows</span>
    <p><code>[[0] * m] * n</code> creates n references to one row. Use <code>[[0] * m for _ in range(n)]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hidden O(n) operations</span>
    <p><code>x in list</code>, <code>list.pop(0)</code>, <code>list.insert(0, x)</code>, <code>list.remove(x)</code>, slicing and <code>+</code> on lists all cost O(n). Inside a loop they quietly make your solution O(n²). Use a set for membership and a <code>deque</code> for the front.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: building strings with +=</span>
    <p>O(n²) in the worst case. Append pieces to a list and <code>"".join</code> once.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: off-by-one in windows and ranges</span>
    <p>Window length is <code>right - left + 1</code>. Range sum i..j is <code>prefix[j+1] - prefix[i]</code>. <code>range(a, b)</code> excludes b. Test with arrays of size 0, 1 and 2 before saying "done".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sliding window with negatives</span>
    <p>The "shrink while too big" logic assumes adding items only increases the sum. With negative numbers that is false; use prefix sums + a hashmap instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: modifying a list while looping over it</span>
    <p><code>for x in nums: nums.remove(x)</code> skips items, because the indexes shift under the loop. Build a new list, use the slow/fast write pointer, or loop backwards by index.</p>
  </div>

  <h2 id="dsa-ar-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is reading <code>a[i]</code> O(1) in an array?</summary><div class="qa-body">The items sit side by side in one block and every slot is the same size, so the address of item i is <code>start + i × slot_size</code>: one multiply and one add, whatever n is. (A Python list stores same-size pointers to the objects, so the rule still holds.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>append is sometimes O(n). Why do we still call it O(1)?</summary><div class="qa-body">It is O(1) <em>amortised</em>. A resize copies everything, but the capacity grows by a constant factor, so resizes happen at sizes 1, 2, 4, 8… The total copying over n appends is less than 2n, which is under 2 copies per append on average.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>"".join(parts)</code> better than <code>+=</code> in a loop?</summary><div class="qa-body">Strings are immutable, so each <code>+=</code> may build a new string and copy everything so far: 1 + 2 + … + n ≈ n²/2 copies. <code>join</code> adds up the lengths, allocates once and copies each character once: O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Two Sum II, why is it safe to move R left when the sum is too big?</summary><div class="qa-body">The list is sorted, so every item between L and R is ≥ <code>a[L]</code>. If <code>a[L] + a[R]</code> is already too big, <code>a[R]</code> plus any of them is also too big. So <code>a[R]</code> cannot be in any answer, and dropping it loses nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Container With Most Water, why move the shorter wall?</summary><div class="qa-body">Water = min(height) × width. Moving the taller wall makes the width smaller while the height is still capped by the same short wall, so the area can only shrink. Only moving the short wall can find a taller partner and possibly more water.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The variable window has a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body"><code>left</code> only ever moves forward and never passes <code>right</code>. So over the whole run the inner loop executes at most n times in total, not n times per outer step. Every index is added once and removed once: about 2n operations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does sliding window fail, and what do you use instead?</summary><div class="qa-body">When growing the window doesn't change the condition in one direction, e.g. sums with negative numbers ("subarray sum equals k" with negatives). Use prefix sums with a hashmap counting earlier prefix values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give the prefix-sum formula for the sum of nums[i..j] and explain the leading 0.</summary><div class="qa-body"><code>prefix[j+1] - prefix[i]</code>, where <code>prefix[k]</code> = sum of the first k items. The leading <code>prefix[0] = 0</code> means a range starting at index 0 needs no special case.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Kadane in one sentence, and the all-negative trap.</summary><div class="qa-body">At each item, the best subarray ending here is either the item alone or the item added to the best subarray ending one step back: <code>cur = max(x, cur + x)</code>; track the max of <code>cur</code>. Initialise with <code>nums[0]</code>, not 0, or an all-negative array returns 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you rotate an n×n matrix 90° clockwise in place? Anticlockwise?</summary><div class="qa-body">Clockwise: transpose (swap <code>a[i][j]</code> with <code>a[j][i]</code> for j &gt; i), then reverse every row. Anticlockwise: transpose, then reverse the order of the rows (or reverse each row first, then transpose). O(n²) time, O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Product of Array Except Self without division: idea and complexity?</summary><div class="qa-body">Answer at i = product of everything left of i × product of everything right of i. One forward pass stores left products in the output, one backward pass multiplies by a running right product. O(n) time, O(1) extra space besides the output, and zeros need no special handling.</div></details>
</main>
`
});
