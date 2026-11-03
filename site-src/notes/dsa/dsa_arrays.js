// notes/dsa/dsa_arrays.js — Arrays, Strings & Two Pointers
Object.assign(TOPIC_CONTENT, {
  "dsa_arrays": `<main>
<h1>Arrays, Strings &amp; Two Pointers</h1>
  <div class="where"><span>DSA</span><span>Linear structures</span><span>Arrays, Strings &amp; Two Pointers</span></div>
  <p class="lead">An <strong>array</strong> is a row of numbered boxes, and a very large share of interview problems are questions about one: find a pair, find the best stretch, answer a range question, walk a grid. The obvious answer to almost all of them is "check every possibility", which is usually O(n²) and too slow. This note teaches the handful of techniques that bring those problems down to O(n): <strong>two pointers</strong>, the <strong>sliding window</strong>, <strong>prefix sums</strong> and <strong>Kadane's algorithm</strong>, then applies the same ideas to strings and 2-D grids. The running example continues from the <a class="xref" data-note="dsa_complexity">Complexity</a> note: Biteful's 8 charges from one day, <b>[120, 80, 250, 40, 310, 80, 60, 200]</b>, and the harder and harder questions its finance team asks about them. All outputs are real runs on Python 3.13; timings are approximate.</p>

  <h2 id="dsa-ar-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Arrays, Strings &amp; Two Pointers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The array</div>
        <ul>
          <li>Contiguous equal-size slots: <code>a[i]</code> is O(1)</li>
          <li>End is cheap (append, pop); front and middle are O(n)</li>
          <li>Brute force over pairs or stretches is O(n²)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pointer techniques</div>
        <ul>
          <li><b>Two pointers</b>: sorted pairs, palindromes, in-place filtering</li>
          <li><b>Sliding window</b>: best contiguous run; positives only</li>
          <li>Each index visited a constant number of times → O(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running totals</div>
        <ul>
          <li><b>Prefix sums</b>: sum(i..j) = P[j+1] − P[i] in O(1)</li>
          <li><b>Kadane</b>: <code>cur = max(x, cur + x)</code>, best run with negatives</li>
          <li>Prefix products: product of all except self</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Strings and grids</div>
        <ul>
          <li>Strings are immutable arrays: build a list, <code>"".join</code> once</li>
          <li><code>grid[r][c]</code>; 4 neighbours with a bounds check</li>
          <li>Rotate = transpose + reverse rows; spiral = four walls</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-ar-dynamic"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Array and Its Costs</span><span class="rm-sub">what arrays are fast and slow at</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-twoptr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Two Pointers</span><span class="rm-sub">from checking every pair to one pass</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-window"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Sliding Window</span><span class="rm-sub">best runs of consecutive items</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-prefix"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Prefix Sums</span><span class="rm-sub">any range total in one subtraction</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-kadane"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Kadane's Algorithm</span><span class="rm-sub">the best stretch when values can be negative</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-strings"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Strings as Arrays</span><span class="rm-sub">immutability, join, windows on text</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-matrix"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">2-D Matrices</span><span class="rm-sub">grids, neighbours, spiral, rotate</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-patterns"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing the Technique</span><span class="rm-sub">from the problem's wording to the pattern</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">shared rows, negatives, off-by-one</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">templates, formulas, costs</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-ar-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about arrays</span></div></div>
    </div>
  </div>

  <h2 id="dsa-ar-dynamic"><span class="num">01</span>The Array and Its Costs</h2>
  <p>Every technique in this note is a way of staying inside what arrays do well, so we start with exactly what that is. Picture a hostel corridor of lockers numbered 0, 1, 2 and so on, all the same width. If someone asks you to fetch a bag from locker 4, you do not open lockers 0 to 3 first; you know where locker 4 is and walk straight to it. An <strong>array</strong> is the same idea in memory: items stored side by side in one unbroken block, every slot the same size, so the position of item i can be calculated rather than searched for.</p>
  <figure class="viz"><svg viewBox="0 0 640 165" width="640">
<text x="320" y="16" text-anchor="middle" class="tb" font-size="12">one unbroken block of memory, every slot the same size</text>
<rect x="60" y="50" width="70" height="40" class="fb sb"/><text x="95" y="75" text-anchor="middle" font-size="12">120</text>
<text x="95" y="40" text-anchor="middle" class="tm" font-size="11">1000</text><text x="95" y="110" text-anchor="middle" class="tm" font-size="11">i=0</text>
<rect x="130" y="50" width="70" height="40" class="fb sb"/><text x="165" y="75" text-anchor="middle" font-size="12">80</text>
<text x="165" y="40" text-anchor="middle" class="tm" font-size="11">1008</text><text x="165" y="110" text-anchor="middle" class="tm" font-size="11">i=1</text>
<rect x="200" y="50" width="70" height="40" class="fb sb"/><text x="235" y="75" text-anchor="middle" font-size="12">250</text>
<text x="235" y="40" text-anchor="middle" class="tm" font-size="11">1016</text><text x="235" y="110" text-anchor="middle" class="tm" font-size="11">i=2</text>
<rect x="270" y="50" width="70" height="40" class="fb sb"/><text x="305" y="75" text-anchor="middle" font-size="12">40</text>
<text x="305" y="40" text-anchor="middle" class="tm" font-size="11">1024</text><text x="305" y="110" text-anchor="middle" class="tm" font-size="11">i=3</text>
<rect x="340" y="50" width="70" height="40" class="fg sg"/><text x="375" y="75" text-anchor="middle" font-size="12">310</text>
<text x="375" y="40" text-anchor="middle" class="tm" font-size="11">1032</text><text x="375" y="110" text-anchor="middle" class="tm" font-size="11">i=4</text>
<rect x="410" y="50" width="70" height="40" class="fb sb"/><text x="445" y="75" text-anchor="middle" font-size="12">80</text>
<text x="445" y="40" text-anchor="middle" class="tm" font-size="11">1040</text><text x="445" y="110" text-anchor="middle" class="tm" font-size="11">i=5</text>
<rect x="480" y="50" width="70" height="40" class="fb sb"/><text x="515" y="75" text-anchor="middle" font-size="12">60</text>
<text x="515" y="40" text-anchor="middle" class="tm" font-size="11">1048</text><text x="515" y="110" text-anchor="middle" class="tm" font-size="11">i=6</text>
<rect x="550" y="50" width="70" height="40" class="fb sb"/><text x="585" y="75" text-anchor="middle" font-size="12">200</text>
<text x="585" y="40" text-anchor="middle" class="tm" font-size="11">1056</text><text x="585" y="110" text-anchor="middle" class="tm" font-size="11">i=7</text>
<text x="30" y="40" text-anchor="middle" class="tm" font-size="11">addr</text><text x="30" y="75" text-anchor="middle" font-size="11">₹</text>
<text x="320" y="150" text-anchor="middle" class="tg" font-size="12">address of charges[4] = 1000 + 4 × 8 = 1032 → one multiply, one jump: O(1)</text>
</svg><figcaption>Biteful's 8 charges in one block. Each slot is 8 bytes wide, so slot i starts at 1000 + i × 8.</figcaption></figure>
  <p>In the figure the block starts at address 1000 and each slot is 8 bytes, so slot 4 must start at 1000 + 4 × 8 = 1032. The computer does that one multiplication and addition and goes straight there, whether the array holds 8 items or 8 million. This is called <strong>random access</strong>, and it makes reading or writing <code>a[i]</code> O(1). The price of keeping everything side by side shows up when you change the middle. To insert a new charge at position 0, every existing charge has to shift one slot to the right, which is n moves; deleting from the front shifts everyone left. Adding or removing at the <em>end</em> moves nobody. It is like a full cinema bench: someone who wants the first seat makes the whole row shuffle along, while someone sitting down at the far end disturbs no one.</p>
  <p>A plain array has a fixed size, yet a Python list grows whenever you <code>append</code>. That is because a list is a <strong>dynamic array</strong>: it reserves some spare slots, and when they run out it allocates a bigger block, copies everything across and drops the old block. Here is a tiny dynamic array that doubles its size when full, fed with the day's charges plus one late ₹90 order, counting every copy it makes:</p>
  <div class="fx" data-lang="py">class DynamicArray:
    def __init__(self):
        self.cap, self.n = 1, 0              # slots reserved, slots used
        self.slots = [None] * self.cap
        self.copies = 0                      # count the copying work

    def append(self, x):
        if self.n == self.cap:               # full: get a block twice as big
            new = [None] * (2 * self.cap)
            for i in range(self.n):          # copy every old item across
                new[i] = self.slots[i]
                self.copies += 1
            self.slots, self.cap = new, 2 * self.cap
        self.slots[self.n] = x
        self.n += 1

    def __getitem__(self, i):                # O(1): straight to slot i
        if not 0 &lt;= i &lt; self.n:
            raise IndexError(i)
        return self.slots[i]

a = DynamicArray()
for charge in [120, 80, 250, 40, 310, 80, 60, 200, 90]:
    a.append(charge)
    print(f"append {charge:3}: n={a.n} cap={a.cap:2} copies so far={a.copies}")
print("a[4] =", a[4])</div>
  <div class="fx" data-lang="text">append 120: n=1 cap= 1 copies so far=0
append  80: n=2 cap= 2 copies so far=1
append 250: n=3 cap= 4 copies so far=3
append  40: n=4 cap= 4 copies so far=3
append 310: n=5 cap= 8 copies so far=7
append  80: n=6 cap= 8 copies so far=7
append  60: n=7 cap= 8 copies so far=7
append 200: n=8 cap= 8 copies so far=7
append  90: n=9 cap=16 copies so far=15
a[4] = 310</div>
  <p>The capacity went 1, 2, 4, 8, 16, and each time it doubled every stored item was copied. Yet 9 appends caused only 15 copies in total (1 + 2 + 4 + 8), less than 2 per append, because a doubling buys as many free appends as it cost copies. That is why <code>append</code> is called <strong>O(1) amortised</strong>: an occasional append is expensive, but the average over many appends is constant. (The Complexity note watched the real CPython list do this.) Reading <code>a[4]</code> stays a single jump to slot 4. Putting it together, here are the costs to know by heart:</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Cost</th><th>Why</th></tr>
    <tr><td><code>a[i]</code>, <code>a[i] = x</code>, <code>len(a)</code></td><td>O(1)</td><td>address arithmetic; length is stored</td></tr>
    <tr><td><code>a.append(x)</code>, <code>a.pop()</code></td><td>O(1) amortised</td><td>only the end changes</td></tr>
    <tr><td><code>a.insert(0, x)</code>, <code>a.pop(0)</code></td><td>O(n)</td><td>everyone shifts; use <code>deque</code> for queues</td></tr>
    <tr><td><code>x in a</code>, <code>a.index(x)</code>, <code>a.remove(x)</code></td><td>O(n)</td><td>scan until found; use a <code>set</code> for repeated lookups</td></tr>
    <tr><td><code>a[i:j]</code>, <code>a + b</code></td><td>O(size of result)</td><td>builds a new list</td></tr>
    <tr><td><code>a.sort()</code>, <code>sorted(a)</code></td><td>O(n log n)</td><td>Timsort</td></tr>
  </table>
  <p>Most easy array problems need nothing more than a single pass that keeps a few variables up to date and perhaps builds an output list, which is O(n) time:</p>
  <div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
biggest, big_orders = charges[0], []
for c in charges:                    # one pass, a variable and an output list: O(n)
    if c &gt; biggest:
        biggest = c
    if c &gt;= 200:
        big_orders.append(c)
print("biggest:", biggest, "| orders of 200+:", big_orders)</div>
  <div class="fx" data-lang="text">biggest: 310 | orders of 200+: [250, 310, 200]</div>
  <p>One loop found the biggest charge (310) and collected the orders of ₹200 or more. The lesson of the cost table is the key to everything that follows: arrays are fast at "go to position i" and at the end, and slow at the front, the middle and "is x in here?". Every technique in this note works by walking the array by index, once, without ever searching it.</p>

  <h2 id="dsa-ar-twoptr"><span class="num">02</span>Two Pointers</h2>
  <p>Biteful runs a combo offer: two orders that together cost exactly ₹280 get a free dessert. Which two of the day's charges qualify? The obvious method is the <strong>brute force</strong>: take every order, pair it with every later order, and check the sum. It is always correct, so in an interview it is always the first thing to say, followed by its cost:</p>
  <div class="fx" data-lang="py">import time, random

def pair_brute(charges, target):
    checks = 0
    for i in range(len(charges)):            # every first order...
        for j in range(i + 1, len(charges)): # ...with every later order
            checks += 1
            if charges[i] + charges[j] == target:
                return (i, j), checks
    return None, checks

charges = [120, 80, 250, 40, 310, 80, 60, 200]
print("combo 280:", pair_brute(charges, 280))
print("combo 999:", pair_brute(charges, 999))

random.seed(5)
for n in [1_000, 2_000, 4_000]:
    data = [random.randrange(1, 10**6) * 2 for _ in range(n)]   # all even, so no pair sums to 1
    t = time.perf_counter()
    found, checks = pair_brute(data, 1)
    print(f"n={n:&gt;5,}  checks={checks:&gt;10,}  time={time.perf_counter() - t:.3f} s")</div>
  <div class="fx" data-lang="text">combo 280: ((1, 7), 13)
combo 999: (None, 28)
n=1,000  checks=   499,500  time=0.023 s
n=2,000  checks= 1,999,000  time=0.093 s
n=4,000  checks= 7,998,000  time=0.397 s</div>
  <p>The combo is orders 1 and 7 (₹80 + ₹200), found after 13 checks. When no pair works, as with target 999, all 8 × 7 / 2 = 28 pairs get checked, and in general n(n − 1)/2, which is O(n²). The timings confirm it: doubling n roughly quadruples the checks and the time. At 1 lakh charges that is 5 billion checks, minutes rather than milliseconds. The real weakness is that each check teaches us nothing about any other pair.</p>
  <p>The <strong>two pointers</strong> technique fixes that when the data is sorted. Sort the charges, put a pointer <code>L</code> on the cheapest and a pointer <code>R</code> on the dearest, and look at their sum. If the sum is too big, the dearest charge cannot be in any answer: even paired with the cheapest one it overshoots, and every other partner is dearer still. So R moves left, ruling that charge out for good. If the sum is too small, the cheapest charge cannot be in any answer: even with the dearest partner it falls short. So L moves right. Think of holding exactly ₹280 with a menu sorted by price: if the cheapest plus the costliest item is too much, the costliest item is useless to you and you cross it off. Every step crosses one item off forever, and you stop when the pointers meet.</p>
  <div class="fx" data-lang="py">def pair_two_pointers(a, target):            # a must be sorted
    l, r = 0, len(a) - 1
    while l &lt; r:
        s = a[l] + a[r]
        if s == target:
            print(f"L={l} ({a[l]:3}) R={r} ({a[r]:3}) sum={s} -&gt; found")
            return l, r
        if s &lt; target:
            print(f"L={l} ({a[l]:3}) R={r} ({a[r]:3}) sum={s} too small -&gt; L moves right")
            l += 1                           # a[l] is too small even with the biggest partner
        else:
            print(f"L={l} ({a[l]:3}) R={r} ({a[r]:3}) sum={s} too big   -&gt; R moves left")
            r -= 1                           # a[r] is too big even with the smallest partner
    return None

s = sorted([120, 80, 250, 40, 310, 80, 60, 200])
print("sorted:", s)
print(pair_two_pointers(s, 280))</div>
  <div class="fx" data-lang="text">sorted: [40, 60, 80, 80, 120, 200, 250, 310]
L=0 ( 40) R=7 (310) sum=350 too big   -&gt; R moves left
L=0 ( 40) R=6 (250) sum=290 too big   -&gt; R moves left
L=0 ( 40) R=5 (200) sum=240 too small -&gt; L moves right
L=1 ( 60) R=5 (200) sum=260 too small -&gt; L moves right
L=2 ( 80) R=5 (200) sum=280 -&gt; found
(2, 5)</div>
  <p>Follow the trace. 40 + 310 = 350 is too big, so 310 is crossed off. 40 + 250 = 290 is still too big, so 250 goes. 40 + 200 = 240 is too small, so 40 is useless and L moves right; 60 + 200 = 260 is too small too; and 80 + 200 = 280 is the combo, found in 5 steps instead of up to 28. The key insight, and the argument you give an interviewer, is that one comparison eliminates a whole row of the brute force's pairs at once. Each step moves one pointer and they never cross, so there are at most n steps: <strong>O(n) time and O(1) extra space</strong>, plus O(n log n) if you have to sort first. The difference is huge:</p>
  <div class="fx" data-lang="py">import time, random
random.seed(5)
data = sorted(random.randrange(1, 10**6) * 2 for _ in range(5_000))   # no pair sums to 1
t = time.perf_counter(); r1 = pair_brute(data, 1); t1 = time.perf_counter() - t
t = time.perf_counter(); r2 = pair_two_pointers(data, 1); t2 = time.perf_counter() - t
print(f"5,000 sorted charges: brute force {t1:.3f} s, two pointers {t2 * 1000:.2f} ms, same answer: {r1 == r2}")</div>
  <div class="fx" data-lang="text">5,000 sorted charges: brute force 0.445 s, two pointers 0.33 ms, same answer: True</div>
  <p>Two things to notice. The answer is reported as sorted positions (2, 5), not the original orders 1 and 7, because sorting moved everything. When a problem wants the original indexes of an unsorted array (LeetCode 1, Two Sum), use the hash map method from the <a class="xref" data-note="dsa_hashing">Hashing</a> note instead. And the same "move inwards from both ends" idea works for any symmetric check. A <strong>palindrome</strong> reads the same backwards, so you compare the first and last characters, then step both pointers inwards.</p>
  <p>There is a second style, where both pointers move in the same direction. A <code>fast</code> pointer reads every item, and a <code>slow</code> pointer marks the next place to <em>write</em> an item worth keeping. This filters or compacts an array <strong>in place</strong>, with O(1) extra space. It is like sorting mangoes into a crate: your right hand picks up every mango, your left hand points at the next empty spot in the crate, and only good mangoes get placed there. Below, the palindrome check, then the reader/writer style used to keep only the distinct prices of the sorted charges, and to push cancelled orders (stored as 0) to the end while keeping the rest in order:</p>
  <div class="fx" data-lang="py">def is_palindrome(s):                # opposite ends, moving inwards
    l, r = 0, len(s) - 1
    while l &lt; r:
        if s[l] != s[r]:
            return False
        l, r = l + 1, r - 1
    return True

def remove_duplicates(nums):         # nums sorted; reader/writer, in place
    slow = 1                         # next position to write a new value
    for fast in range(1, len(nums)): # fast reads every item
        if nums[fast] != nums[fast - 1]:
            nums[slow] = nums[fast]
            slow += 1
    return slow                      # nums[:slow] are the distinct values

def move_zeroes(nums):               # 0 = a cancelled order
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    return nums

print([(code, is_palindrome(code)) for code in ["BITETIB", "BITE", ""]])
prices = [40, 60, 80, 80, 120, 200, 250, 310]
k = remove_duplicates(prices)
print(k, prices[:k])
print(move_zeroes([120, 0, 250, 40, 0, 80]))</div>
  <div class="fx" data-lang="text">[('BITETIB', True), ('BITE', False), ('', True)]
7 [40, 60, 80, 120, 200, 250, 310]
[120, 250, 40, 80, 0, 0]</div>
  <p>"BITETIB" is a palindrome and "BITE" is not. The sorted charges have 7 distinct prices, because the second 80 was skipped by the writer, and the cancelled orders slid to the end while the others kept their order. Both are one pass, O(n) time, O(1) space.</p>
  <p>Two famous interview problems are two pointers with one extra idea each. <strong>3Sum</strong> asks for all distinct triplets that add up to 0. Sort first, then fix the first number and run the two-pointer search on the part to its right for the other two, skipping equal neighbours so that no triplet is reported twice. That is n two-pointer passes, O(n²), instead of the brute force's O(n³). <strong>Container With Most Water</strong> gives wall heights and asks which two walls hold the most water, where water = shorter wall × distance. Start with the widest pair and always move the <em>shorter</em> wall inwards: moving the taller one can only reduce the width while the height stays capped by the same short wall, so it can never help.</p>
  <div class="fx" data-lang="py">def three_sum(nums):                 # all unique triplets summing to 0
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i &gt; 0 and nums[i] == nums[i - 1]:
            continue                 # same first number as before: skip
        l, r = i + 1, len(nums) - 1  # Two Sum on the sorted part to the right
        while l &lt; r:
            s = nums[i] + nums[l] + nums[r]
            if s &lt; 0:
                l += 1
            elif s &gt; 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l, r = l + 1, r - 1
                while l &lt; r and nums[l] == nums[l - 1]:
                    l += 1           # skip repeated second numbers
    return res

def max_area(height):                # Container With Most Water
    l, r, best = 0, len(height) - 1, 0
    while l &lt; r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] &lt; height[r]:
            l += 1                   # the shorter wall limits the water: move it
        else:
            r -= 1
    return best

print(three_sum([-1, 0, 1, 2, -1, -4]), three_sum([0, 0, 0, 0]))
print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))</div>
  <div class="fx" data-lang="text">[[-1, -1, 2], [-1, 0, 1]] [[0, 0, 0]]
49</div>
  <p>3Sum found [−1, −1, 2] and [−1, 0, 1], and the all-zeros input gave a single triplet, which checks the duplicate-skipping. The container answer is 49, from the walls of height 8 and 7, seven positions apart. Recognise two pointers when a problem says <em>sorted array</em>, <em>pair or triplet that sums to</em>, <em>palindrome</em>, <em>reverse</em>, <em>in place</em> or <em>without extra space</em>.</p>

  <h2 id="dsa-ar-window"><span class="num">03</span>Sliding Window</h2>
  <p>Finance's next question is about runs of orders: which 3 <em>consecutive</em> orders brought in the most money? A run of consecutive items with no gaps is called a <strong>subarray</strong> (for text, a <strong>substring</strong>). The brute force adds up every 3-long run from scratch. But neighbouring runs share almost everything: orders 0–2 and orders 1–3 have two orders in common. Re-adding them wastes work, and with runs of 1,000 orders it would re-add 1,000 numbers per run.</p>
  <p>The <strong>sliding window</strong> reuses that work. Add up the first 3 orders once. Then slide the window one step at a time: add the order that joins on the right and subtract the order that leaves on the left. Each step costs one addition and one subtraction, however wide the window is. A shopkeeper tracking "sales over the last 3 days" does exactly this each morning: she adds today's sales and subtracts the day that just fell out of the range, rather than re-adding three days.</p>
  <div class="fx" data-lang="py">def busiest_k(charges, k):
    window = sum(charges[:k])                # first window, summed once
    best, best_start = window, 0
    print(f"orders 0-{k - 1}: sum={window}")
    for right in range(k, len(charges)):
        leaving = charges[right - k]
        window += charges[right] - leaving   # one joins, one leaves
        print(f"orders {right - k + 1}-{right}: +{charges[right]} -{leaving} -&gt; sum={window}")
        if window &gt; best:
            best, best_start = window, right - k + 1
    return best, charges[best_start:best_start + k]

print(busiest_k([120, 80, 250, 40, 310, 80, 60, 200], 3))</div>
  <div class="fx" data-lang="text">orders 0-2: sum=450
orders 1-3: +40 -120 -&gt; sum=370
orders 2-4: +310 -80 -&gt; sum=600
orders 3-5: +80 -250 -&gt; sum=430
orders 4-6: +60 -40 -&gt; sum=450
orders 5-7: +200 -310 -&gt; sum=340
(600, [250, 40, 310])</div>
  <p>The window starts at 450 (120 + 80 + 250). Sliding once, 40 joins and 120 leaves, giving 370; sliding again, 310 joins and 80 leaves, giving 600, the best. The busiest run is orders 2–4 (250, 40, 310), and the whole scan was O(n).</p>
  <p>Often the window size is not given; it is the answer. "What is the <em>shortest</em> run of consecutive orders worth at least ₹500?" Now the window grows and shrinks. Move <code>right</code> forward one order at a time to grow it. Whenever the total reaches ₹500 the window is valid, so record its length and then drop the leftmost order to see whether a shorter window still works. Keep dropping while it stays valid.</p>
  <div class="fx" data-lang="py">def shortest_at_least(charges, target):     # all charges are positive
    left, total, best = 0, 0, float("inf")
    for right, x in enumerate(charges):
        total += x                           # grow: take one more order
        print(f"R={right} +{x:3} window={charges[left:right + 1]} total={total}")
        while total &gt;= target:               # valid: record it, then try shorter
            best = min(best, right - left + 1)
            print(f"      {total} &gt;= {target}: length {right - left + 1}, drop {charges[left]}")
            total -= charges[left]
            left += 1
    return best

print("shortest:", shortest_at_least([120, 80, 250, 40, 310, 80, 60, 200], 500))</div>
  <div class="fx" data-lang="text">R=0 +120 window=[120] total=120
R=1 + 80 window=[120, 80] total=200
R=2 +250 window=[120, 80, 250] total=450
R=3 + 40 window=[120, 80, 250, 40] total=490
R=4 +310 window=[120, 80, 250, 40, 310] total=800
      800 &gt;= 500: length 5, drop 120
      680 &gt;= 500: length 4, drop 80
      600 &gt;= 500: length 3, drop 250
R=5 + 80 window=[40, 310, 80] total=430
R=6 + 60 window=[40, 310, 80, 60] total=490
R=7 +200 window=[40, 310, 80, 60, 200] total=690
      690 &gt;= 500: length 5, drop 40
      650 &gt;= 500: length 4, drop 310
shortest: 3</div>
  <p>The window grew to 5 orders before reaching 800, then shrank: dropping 120 left 680 (4 orders, still valid), dropping 80 left 600 (3 orders, still valid), dropping 250 left 350, too little. Later the window grew to 690 again but could only shrink to 4. The answer is 3. There is a <code>while</code> inside a <code>for</code>, which looks like O(n²), but it is O(n): <code>left</code> only ever moves forward and never passes <code>right</code>, so over the whole run it moves at most n times. Each order joins the window once and leaves it once, about 2n steps in total.</p>
  <p>The mirror question, "the <em>longest</em> run worth at most ₹500", uses the same machinery in the other order: grow, shrink while the window is <em>broken</em> (over ₹500), and record after fixing it:</p>
  <div class="fx" data-lang="py">def longest_at_most(charges, limit):        # longest run with total &lt;= limit
    left, total, best = 0, 0, 0
    for right, x in enumerate(charges):
        total += x                           # grow
        while total &gt; limit:                 # broken: shrink until valid again
            total -= charges[left]
            left += 1
        best = max(best, right - left + 1)   # record after fixing
    return best

print(longest_at_most([120, 80, 250, 40, 310, 80, 60, 200], 500))</div>
  <div class="fx" data-lang="text">4</div>
  <p>The longest such run is 4 orders (120, 80, 250, 40 = 490, or 40, 310, 80, 60 = 490). Those two shapes, "shrink while valid, record before shrinking" for shortest and "shrink while broken, record after" for longest, cover almost every window problem. The window's contents can be more than a total: a set or a dict of the characters inside it, as the strings section shows.</p>
  <p>The sliding window rests on one assumption that is easy to miss. Growing the window must only push the total one way (more broken), and shrinking it the other way. That holds because every charge is positive. If values can be negative, adding an item can <em>lower</em> the total and dropping one can raise it, so "shrink while too big" may throw away the answer. For sums with negatives, use prefix sums with a hash map (<a class="xref" data-note="dsa_hashing">Hashing</a>) or Kadane's algorithm (section 05). Recognise the window when a problem says <em>contiguous subarray or substring</em>, <em>k consecutive</em>, <em>longest / shortest … such that</em> or <em>at most k distinct</em>. Cost: O(n) time, and O(1) space for a total or O(k) for a set or dict of window contents.</p>

  <h2 id="dsa-ar-prefix"><span class="num">04</span>Prefix Sums</h2>
  <p>A window answers one question per pass. Now finance fires many: "what did orders 2 to 4 add up to?", "orders 0 to 3?", "the whole day?", thousands of them, in any order. Summing each range from scratch costs O(n) per question. <strong>Prefix sums</strong> pay O(n) once so that every later range question costs O(1).</p>
  <p>The idea is the car odometer. It shows total kilometres since the car was new, and to know how far you drove between Pune and Mumbai you subtract the reading at Pune from the reading at Mumbai; nobody re-adds the trip kilometre by kilometre. So we store running totals: <code>P[i]</code> is the total of the first i charges, with <code>P[0] = 0</code>. The total of charges i to j (both included) is then "total up to and including j" minus "total before i", which is <strong>P[j + 1] − P[i]</strong>.</p>
  <div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
P = [0]
for x in charges:
    P.append(P[-1] + x)              # P[i] = total of the first i charges
print("P =", P)

def range_sum(i, j):                 # orders i..j, both included
    return P[j + 1] - P[i]

print("orders 2..4:", range_sum(2, 4), "| orders 0..3:", range_sum(0, 3),
      "| order 4 alone:", range_sum(4, 4), "| whole day:", range_sum(0, 7))</div>
  <div class="fx" data-lang="text">P = [0, 120, 200, 450, 490, 800, 880, 940, 1140]
orders 2..4: 600 | orders 0..3: 490 | order 4 alone: 310 | whole day: 1140</div>
  <p>Each entry of P is the previous entry plus one charge: 0, 120, 200, 450 and so on up to 1140 for the whole day. Orders 2..4 are P[5] − P[2] = 800 − 200 = 600, the same busiest run the window found. Orders 0..3 are P[4] − P[0] = 490. The leading 0 is what makes ranges that start at index 0 work without a special case, and the single-order check, order 4 alone = P[5] − P[4] = 310, is a good way to make sure you have not dropped an item with an off-by-one. Here is why the technique exists, on 1,000 random range questions over 1 lakh charges:</p>
  <div class="fx" data-lang="py">import time, random
random.seed(2)
n = 100_000
charges = [random.randrange(40, 400) for _ in range(n)]
queries = [sorted(random.sample(range(n), 2)) for _ in range(1_000)]

t = time.perf_counter()
slow = [sum(charges[i:j + 1]) for i, j in queries]    # re-add each range: O(n) per query
t_slow = time.perf_counter() - t

t = time.perf_counter()
P = [0]
for x in charges:
    P.append(P[-1] + x)                               # build once: O(n)
fast = [P[j + 1] - P[i] for i, j in queries]          # O(1) per query
t_fast = time.perf_counter() - t
print(f"1,000 range sums: re-adding {t_slow * 1000:.0f} ms, prefix sums {t_fast * 1000:.1f} ms, same: {slow == fast}")</div>
  <div class="fx" data-lang="text">1,000 range sums: re-adding 825 ms, prefix sums 8.3 ms, same: True</div>
  <p>Same answers, about a hundred times faster, and the gap grows with the number of queries: re-adding costs O(n) per query, while prefix sums cost O(n) once and O(1) per query, so q queries cost O(n + q) instead of O(n·q). The space cost is O(n) for the P array.</p>
  <p>The same idea works with multiplication. <strong>Product of Array Except Self</strong> asks, for each position, the product of all the <em>other</em> numbers, without using division (which would also break on zeros). The product of everything except position i is (the product of everything to its left) × (the product of everything to its right). One pass from the left writes the left products into the output; one pass from the right multiplies in a running right product:</p>
  <div class="fx" data-lang="py">def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):               # out[i] = product of everything left of i
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):   # multiply in the product of everything right of i
        out[i] *= right
        right *= nums[i]
    return out

print(product_except_self([1, 2, 3, 4]), product_except_self([-1, 1, 0, -3, 3]))</div>
  <div class="fx" data-lang="text">[24, 12, 8, 6] [0, 0, 9, 0, 0]</div>
  <p>For [1, 2, 3, 4], position 2 gets 1 × 2 from the left and 4 from the right, so 8. The zero in the second example is handled with no special code. It is O(n) time and O(1) extra space besides the output. The prefix idea has other well-known variants: a 2-D prefix table answers any rectangle sum in a grid in O(1); a <strong>difference array</strong> does the reverse, adding a value to a whole range with two writes; and prefix sums combined with a hash map count the subarrays that sum to exactly k, even with negatives, which the <a class="xref" data-note="dsa_hashing">Hashing</a> note builds on these same charges. Recognise prefix sums when a problem says <em>sum of range i..j</em>, <em>many queries</em>, <em>running sum</em>, <em>pivot index</em> (left total equals right total) or <em>product except self</em>.</p>

  <h2 id="dsa-ar-kadane"><span class="num">05</span>Kadane's Algorithm</h2>
  <p>Biteful pays its rider ₹120 per order, so the profit on each order is the charge minus 120, and some profits are negative: <b>[0, −40, 130, −80, 190, −40, −60, 80]</b>. Finance asks: which stretch of consecutive orders made the most profit? This is the <strong>maximum subarray</strong> problem. Prefix sums can total any stretch we name, but there are 36 stretches for 8 orders and about 5 billion for 1 lakh, and the sliding window cannot help because negative values break it.</p>
  <p><strong>Kadane's algorithm</strong> solves it in one pass. Walk from left to right keeping <code>cur</code>, the best total of a stretch that <em>ends exactly here</em>. At each new order x there are only two choices: extend the stretch you already have (<code>cur + x</code>), or start a fresh stretch at x. If the old stretch has a negative total, it can only drag x down, so you drop it and start fresh. Separately, you remember the best <code>cur</code> ever seen. A cricket partnership tracked over by over works the same way: once a partnership has cost more than it scored, the captain would rather start counting afresh from the next over, while the best partnership of the day is remembered separately.</p>
  <div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
profit = [c - 120 for c in charges]          # Biteful pays the rider 120 per order
print("profit:", profit)

def best_run(nums):
    best = cur = nums[0]
    start = best_l = best_r = 0
    for i in range(1, len(nums)):
        x = nums[i]
        if cur + x &lt; x:                      # the run so far only drags x down
            cur, start, why = x, i, "start fresh"
        else:
            cur, why = cur + x, "extend"
        if cur &gt; best:
            best, best_l, best_r = cur, start, i
        print(f"i={i} x={x:4}  cur={cur:4}  best={best:4}  ({why})")
    return best, (best_l, best_r)

print(best_run(profit))</div>
  <div class="fx" data-lang="text">profit: [0, -40, 130, -80, 190, -40, -60, 80]
i=1 x= -40  cur= -40  best=   0  (extend)
i=2 x= 130  cur= 130  best= 130  (start fresh)
i=3 x= -80  cur=  50  best= 130  (extend)
i=4 x= 190  cur= 240  best= 240  (extend)
i=5 x= -40  cur= 200  best= 240  (extend)
i=6 x= -60  cur= 140  best= 240  (extend)
i=7 x=  80  cur= 220  best= 240  (extend)
(240, (2, 4))</div>
  <p>The algorithm starts with <code>cur = best = 0</code> from the first order. At i = 1 the stretch falls to −40. At i = 2 the choice matters: extending gives −40 + 130 = 90, starting fresh gives 130, so the negative stretch is dropped and a new one starts at order 2. At i = 3 the profit is −80, but the stretch stays positive (50), so it is worth keeping, and at i = 4 the +190 pays that off and reaches 240, the best. Later orders lower <code>cur</code> but never beat 240. The answer is orders 2..4, ₹240. In short form, with a brute-force check and the all-negative case:</p>
  <div class="fx" data-lang="py">def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)        # extend the run ending here, or start fresh at x
        best = max(best, cur)
    return best

profit = [0, -40, 130, -80, 190, -40, -60, 80]
brute = max(sum(profit[i:j + 1]) for i in range(8) for j in range(i, 8))
print("Kadane:", max_subarray(profit), " brute force over all 36 runs:", brute)
print("all negative:", max_subarray([-3, -1, -2]))</div>
  <div class="fx" data-lang="text">Kadane: 240  brute force over all 36 runs: 240
all negative: -1</div>
  <p>The brute force over all 36 stretches agrees: 240. Kadane is <strong>O(n) time and O(1) space</strong>, against O(n²) for the brute force with running sums. It is really a tiny piece of dynamic programming: the best stretch ending at i is built from the best stretch ending at i − 1, and since only the previous value is needed, one variable replaces a whole table (the <a class="xref" data-note="dsa_dp">Dynamic Programming</a> note grows this idea). One detail matters: start from the first element, not from 0. If you start with <code>best = cur = 0</code>, an all-negative input such as [−3, −1, −2] returns 0, the empty stretch, instead of the correct −1. Recognise Kadane when a problem says <em>maximum sum subarray</em>, <em>largest sum of contiguous</em> or <em>best time to buy and sell</em> (the best gain is Kadane over the day-to-day price changes).</p>

  <h2 id="dsa-ar-strings"><span class="num">06</span>Strings as Arrays</h2>
  <p>Real data often arrives as text. Biteful's gateway does not send a Python list; it sends one line, "120,80,250,40,310,80,60,200". A string is an array of characters, so indexing <code>s[i]</code> and <code>len(s)</code> are O(1), slicing copies, and two pointers and windows work on it unchanged (the palindrome check in section 02 already ran on strings). The big difference is that a Python string is <strong>immutable</strong>: once created it can never change, and every "change" builds a new string. It is like a printed invitation card: to fix one spelling mistake you cannot rub out a letter, you must print a whole new card, whereas a list is a whiteboard where you wipe one cell and write a new value.</p>
  <div class="fx" data-lang="py">line = "120,80,250,40,310,80,60,200"         # how the gateway sends the charges
charges = [int(part) for part in line.split(",")]
print(charges, len(line), line[0], line[-3:])

try:
    line[0] = "9"
except TypeError as e:
    print("TypeError:", e)

parts = []
for c in charges:
    parts.append(f"Rs{c}")                   # build the pieces in a list...
receipt = " + ".join(parts)                  # ...then join once
print(receipt, "=", sum(charges))

code = list("BITE")                          # an editable copy of the characters
code[0] = "K"
print("".join(code), "biteful"[::-1], ord("a"), chr(98))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200] 27 1 200
TypeError: 'str' object does not support item assignment
Rs120 + Rs80 + Rs250 + Rs40 + Rs310 + Rs80 + Rs60 + Rs200 = 1140
KITE lufetib 97 b</div>
  <p>Splitting on commas turned the 27-character line back into the 8 charges. Assigning to <code>line[0]</code> fails because strings cannot be modified. The receipt was built by collecting pieces in a list and joining them once, and <code>list("BITE")</code> made an editable copy of the characters, changed to "KITE" and joined back. <code>ord</code> and <code>chr</code> convert between a character and its number, which is how letter-counting arrays index by letter.</p>
  <p>Immutability is why the rule "build a list, join once" matters. Building a long string with <code>s += piece</code> in a loop may copy everything built so far at every step, 1 + 2 + … + n copies, which is O(n²). <code>"".join(parts)</code> measures the total length, allocates once and copies each character once: O(n). CPython sometimes makes <code>+=</code> fast as an optimisation, but it is not guaranteed (the Complexity note measured it breaking), so in an interview always say "build a list and join".</p>
  <p>The sliding window becomes especially useful on strings. A classic is <strong>Longest Substring Without Repeating Characters</strong>: in "abcabcbb" the answer is 3 ("abc"). Grow the window to the right; when the new character already appears inside the window, move <code>left</code> just past its earlier copy. A dict remembering the last index of each character lets <code>left</code> jump there in one step:</p>
  <div class="fx" data-lang="py">def longest_unique(s):                       # longest substring with no repeated character
    last = {}                                # character -&gt; last index seen
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] &gt;= left:  # ch is already inside the window
            left = last[ch] + 1              # jump just past its earlier copy
        last[ch] = right
        best = max(best, right - left + 1)
    return best

for s in ["abcabcbb", "bbbbb", "pwwkew", "abba", ""]:
    print(repr(s), "-&gt;", longest_unique(s))</div>
  <div class="fx" data-lang="text">'abcabcbb' -&gt; 3
'bbbbb' -&gt; 1
'pwwkew' -&gt; 3
'abba' -&gt; 2
'' -&gt; 0</div>
  <p>The check <code>last[ch] &gt;= left</code> is the subtle part. In "abba", when the final "a" arrives, its earlier copy at index 0 is already outside the window (left is 2 by then), so it must be ignored; without the check, <code>left</code> would jump <em>backwards</em> and the answer would be 3 instead of 2. Time O(n), space O(number of distinct characters). The hardest standard window problem, <strong>Minimum Window Substring</strong> (the smallest piece of s containing every character of t), uses the "shortest" template with a counter of the characters still needed; it is in the tracker. Recognise string problems by words like <em>substring</em>, <em>characters</em>, <em>parse</em>, <em>reverse words</em>, <em>palindrome</em> and <em>anagram</em>: most are an array technique applied to characters.</p>

  <h2 id="dsa-ar-matrix"><span class="num">07</span>2-D Matrices</h2>
  <p>Some data has two dimensions. Biteful's operations team lays the day out as a table: one row per shift, one column per order slot. In Python a <strong>matrix</strong> (or grid) is a list of rows, and <code>grid[r][c]</code> means row r, column c, like a cinema seat chart where you give the row letter and then the seat number. The number of rows is <code>len(grid)</code> and the number of columns is <code>len(grid[0])</code>. The same 8 charges as 2 shifts × 4 slots:</p>
  <div class="fx" data-lang="py">grid = [[120, 80, 250, 40],          # lunch shift
        [310, 80, 60, 200]]          # dinner shift
R, C = len(grid), len(grid[0])
print("rows x cols:", R, "x", C, "| grid[1][2] =", grid[1][2])
print("row totals:", [sum(row) for row in grid])
print("column totals:", [sum(grid[r][c] for r in range(R)) for c in range(C)])
print("row by row:", [grid[r][c] for r in range(R) for c in range(C)])
print("transpose:", [list(col) for col in zip(*grid)])

def neighbours(r, c):
    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:   # down, up, right, left
        nr, nc = r + dr, c + dc
        if 0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C:                  # stay inside the grid
            yield grid[nr][nc]
print("neighbours of grid[0][1]:", list(neighbours(0, 1)))</div>
  <div class="fx" data-lang="text">rows x cols: 2 x 4 | grid[1][2] = 60
row totals: [490, 650]
column totals: [430, 160, 310, 240]
row by row: [120, 80, 250, 40, 310, 80, 60, 200]
transpose: [[120, 310], [80, 80], [250, 60], [40, 200]]
neighbours of grid[0][1]: [80, 250, 120]</div>
  <p>Row totals are the lunch shift (490) and the dinner shift (650); column totals compare order slots across shifts. Reading row by row (called <strong>row-major order</strong>) gives back the day in its original order. The <strong>transpose</strong> swaps rows and columns, turning 2 × 4 into 4 × 2, and <code>zip(*grid)</code> is the Python idiom for it. Neighbours are found by adding the four direction offsets (down, up, right, left) and keeping only positions inside the grid: for <code>grid[0][1]</code>, the lunch ₹80, "up" falls outside and is skipped, leaving 80 below, 250 to the right and 120 to the left. That bounds check is the heart of every grid problem, and the same pattern turns grids into graphs later in the track. Any full traversal touches each cell once, O(R·C), which is the best possible.</p>
  <p><strong>Spiral order</strong> reads a grid like peeling an onion: along the top row, down the right column, back along the bottom row, up the left column, then the next ring inside. Keep four walls, <code>top</code>, <code>bottom</code>, <code>left</code> and <code>right</code>, and after reading a side move that wall inwards:</p>
  <div class="fx" data-lang="py">def spiral_order(m):
    res = []
    if not m:
        return res
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top &lt;= bottom and left &lt;= right:
        for c in range(left, right + 1):          # along the top row
            res.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1):          # down the right column
            res.append(m[r][right])
        right -= 1
        if top &lt;= bottom:                         # a bottom row is still left
            for c in range(right, left - 1, -1):
                res.append(m[bottom][c])
            bottom -= 1
        if left &lt;= right:                         # a left column is still left
            for r in range(bottom, top - 1, -1):
                res.append(m[r][left])
            left += 1
    return res

print(spiral_order([[120, 80, 250, 40], [310, 80, 60, 200]]))
print(spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), spiral_order([[1], [2], [3]]))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 200, 60, 80, 310]
[1, 2, 3, 6, 9, 8, 7, 4, 5] [1, 2, 3]</div>
  <p>On Biteful's grid the spiral reads the top row (120, 80, 250, 40), the right column (200), the bottom row backwards (60, 80, 310), and then the walls have crossed. The two <code>if</code> checks before the bottom and left sides are essential: when only a single row or column remains, the top pass has already read it, and without the check it would be read again backwards. That is why a 1 × n and an n × 1 grid are the test cases to try.</p>
  <figure class="viz"><svg viewBox="0 0 600 185" width="600"><rect x="30" y="40" width="36" height="36" class="fv sb"/><text x="48" y="63" text-anchor="middle">1</text><rect x="66" y="40" width="36" height="36" class="fb sb"/><text x="84" y="63" text-anchor="middle">2</text><rect x="102" y="40" width="36" height="36" class="fb sb"/><text x="120" y="63" text-anchor="middle">3</text><rect x="30" y="76" width="36" height="36" class="fb sb"/><text x="48" y="99" text-anchor="middle">4</text><rect x="66" y="76" width="36" height="36" class="fv sb"/><text x="84" y="99" text-anchor="middle">5</text><rect x="102" y="76" width="36" height="36" class="fb sb"/><text x="120" y="99" text-anchor="middle">6</text><rect x="30" y="112" width="36" height="36" class="fb sb"/><text x="48" y="135" text-anchor="middle">7</text><rect x="66" y="112" width="36" height="36" class="fb sb"/><text x="84" y="135" text-anchor="middle">8</text><rect x="102" y="112" width="36" height="36" class="fv sb"/><text x="120" y="135" text-anchor="middle">9</text><rect x="245" y="40" width="36" height="36" class="fv sb"/><text x="263" y="63" text-anchor="middle">1</text><rect x="281" y="40" width="36" height="36" class="fb sb"/><text x="299" y="63" text-anchor="middle">4</text><rect x="317" y="40" width="36" height="36" class="fb sb"/><text x="335" y="63" text-anchor="middle">7</text><rect x="245" y="76" width="36" height="36" class="fb sb"/><text x="263" y="99" text-anchor="middle">2</text><rect x="281" y="76" width="36" height="36" class="fv sb"/><text x="299" y="99" text-anchor="middle">5</text><rect x="317" y="76" width="36" height="36" class="fb sb"/><text x="335" y="99" text-anchor="middle">8</text><rect x="245" y="112" width="36" height="36" class="fb sb"/><text x="263" y="135" text-anchor="middle">3</text><rect x="281" y="112" width="36" height="36" class="fb sb"/><text x="299" y="135" text-anchor="middle">6</text><rect x="317" y="112" width="36" height="36" class="fv sb"/><text x="335" y="135" text-anchor="middle">9</text><rect x="460" y="40" width="36" height="36" class="fg sg"/><text x="478" y="63" text-anchor="middle">7</text><rect x="496" y="40" width="36" height="36" class="fb sb"/><text x="514" y="63" text-anchor="middle">4</text><rect x="532" y="40" width="36" height="36" class="fb sb"/><text x="550" y="63" text-anchor="middle">1</text><rect x="460" y="76" width="36" height="36" class="fg sg"/><text x="478" y="99" text-anchor="middle">8</text><rect x="496" y="76" width="36" height="36" class="fb sb"/><text x="514" y="99" text-anchor="middle">5</text><rect x="532" y="76" width="36" height="36" class="fb sb"/><text x="550" y="99" text-anchor="middle">2</text><rect x="460" y="112" width="36" height="36" class="fg sg"/><text x="478" y="135" text-anchor="middle">9</text><rect x="496" y="112" width="36" height="36" class="fb sb"/><text x="514" y="135" text-anchor="middle">6</text><rect x="532" y="112" width="36" height="36" class="fb sb"/><text x="550" y="135" text-anchor="middle">3</text><text x="84" y="25" text-anchor="middle">original</text><text x="299" y="25" text-anchor="middle">1. transpose</text><text x="514" y="25" text-anchor="middle">2. reverse rows</text><text x="190" y="100" text-anchor="middle">→</text><text x="405" y="100" text-anchor="middle">→</text><text x="84" y="170" text-anchor="middle" class="tm">diagonal stays</text><text x="299" y="170" text-anchor="middle" class="tm">a[i][j] ↔ a[j][i]</text><text x="514" y="170" text-anchor="middle" class="tg">turned 90° clockwise</text></svg><figcaption>Rotating clockwise in two easy steps. The violet diagonal cells never move during the transpose.</figcaption></figure>
  <p>The last classic is <strong>Rotate Image</strong>: turn an n × n grid 90° clockwise, in place, without building a new grid. Doing it directly needs fiddly four-way swaps. The figure shows a simpler route made of two easy steps. First <strong>transpose</strong>: swap each <code>a[i][j]</code> with <code>a[j][i]</code>, which flips the grid across its main diagonal, so the first row 1, 2, 3 becomes the first column. Then <strong>reverse each row</strong>, so 1, 4, 7 becomes 7, 4, 1. The first row of the original has become the last column, which is exactly a clockwise turn.</p>
  <div class="fx" data-lang="py">def rotate(m):                               # 90 degrees clockwise, in place
    n = len(m)
    for i in range(n):                       # 1. transpose: swap across the diagonal
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]
    print("after transpose:", m)
    for row in m:                            # 2. reverse every row
        row.reverse()

m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
rotate(m)
print("rotated:        ", m)</div>
  <div class="fx" data-lang="text">after transpose: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
rotated:         [[7, 4, 1], [8, 5, 2], [9, 6, 3]]</div>
  <p>The inner loop starts at <code>j = i + 1</code> so that each pair is swapped once; starting at 0 would swap every pair twice and undo the transpose. Time is O(n²), touching each cell a constant number of times, and extra space is O(1). For an anticlockwise turn, transpose and then reverse the order of the rows instead. Recognise matrix problems by <em>grid</em>, <em>m × n</em>, <em>rows and columns</em>, <em>spiral</em>, <em>rotate</em>, <em>transpose</em> and <em>adjacent cells</em>.</p>

  <h2 id="dsa-ar-patterns"><span class="num">08</span>Choosing the Technique</h2>
  <p>Each section so far met a question that was built for its technique. A real problem never says "use a sliding window", so the skill to practise is going from the wording of the question to the technique. Two things decide it. The first is the shape of what is asked: a <em>pair</em> points towards two pointers or a hash map, a <em>contiguous run</em> towards a window, prefix sums or Kadane, and <em>many range questions</em> towards prefix sums. The second is the extra conditions: is the input sorted? are all values positive? are the original positions needed? "Subarray" alone does not mean sliding window; with negative numbers it means prefix sums with a hash map, or Kadane for a maximum. Read the constraints too: n ≤ 10⁵ means one of the O(n) or O(n log n) rows below.</p>
  <table class="tbl">
    <tr><th>Words in the problem</th><th>Technique</th><th>Cost</th></tr>
    <tr><td>"sorted array", "pair / triplet that sums to", "closest sum"</td><td>two pointers from both ends (sort first for 3Sum)</td><td>O(n); O(n²) for 3Sum</td></tr>
    <tr><td>"in place", "remove", "move zeroes", "without extra space"</td><td>two pointers, reader / writer</td><td>O(n), O(1) space</td></tr>
    <tr><td>"palindrome", "reverse"</td><td>two pointers moving inwards</td><td>O(n)</td></tr>
    <tr><td>"k consecutive", "every window of size k"</td><td>fixed sliding window</td><td>O(n)</td></tr>
    <tr><td>"longest / shortest subarray or substring such that", "at most k distinct"</td><td>variable sliding window (+ set or dict)</td><td>O(n)</td></tr>
    <tr><td>"sum of range i..j" many times, "pivot index"</td><td>prefix sums</td><td>O(n) build, O(1) per query</td></tr>
    <tr><td>"product of all others", "without division"</td><td>prefix and suffix products</td><td>O(n)</td></tr>
    <tr><td>"maximum subarray", "best time to buy and sell"</td><td>Kadane</td><td>O(n), O(1) space</td></tr>
    <tr><td>"subarray sum equals k" with negatives, unsorted pair with original indexes</td><td>hash map (<a class="xref" data-note="dsa_hashing">Hashing</a>)</td><td>O(n), O(n) space</td></tr>
    <tr><td>"matrix", "spiral", "rotate", "neighbours"</td><td>index arithmetic, four walls, transpose</td><td>O(R·C)</td></tr>
  </table>
  <p>All of these techniques share one goal: <strong>don't redo work</strong>. The brute force recomputes; each technique keeps one small piece of state so that every item is handled once. Two pointers keep two indexes and rule out many pairs per step; a window keeps the previous window's total; prefix sums keep earlier totals; Kadane keeps the best stretch ending one step back. When you find yourself writing nested loops, ask "what am I recomputing, and what could I remember instead?". Here is each skeleton in its smallest form, run on Biteful's charges:</p>
  <div class="fx" data-lang="py">def two_pointers(a, target):         # sorted a: a pair summing to target
    l, r = 0, len(a) - 1
    while l &lt; r:
        s = a[l] + a[r]
        if s == target: return l, r
        if s &lt; target: l += 1
        else: r -= 1

def longest_window(a, limit):        # positives: longest run with total &lt;= limit
    left = total = best = 0
    for right, x in enumerate(a):
        total += x
        while total &gt; limit:
            total -= a[left]; left += 1
        best = max(best, right - left + 1)
    return best

def prefix(a):                       # P[j+1] - P[i] = sum of a[i..j]
    P = [0]
    for x in a: P.append(P[-1] + x)
    return P

def kadane(a):                       # best sum of any run, negatives allowed
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x); best = max(best, cur)
    return best

charges = [120, 80, 250, 40, 310, 80, 60, 200]
print(two_pointers(sorted(charges), 280), longest_window(charges, 500),
      prefix(charges)[5] - prefix(charges)[2], kadane([c - 120 for c in charges]))</div>
  <div class="fx" data-lang="text">(2, 5) 4 600 240</div>
  <p>The two-pointer search finds the ₹280 combo at sorted positions (2, 5), the window finds the longest run worth at most ₹500 (4 orders), the prefix array gives orders 2..4 as 600, and Kadane gives the best profit stretch, 240. Practise each pattern in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, starting with 167 Two Sum II, 26 Remove Duplicates and 125 Valid Palindrome for two pointers; 643 Maximum Average Subarray, 209 Minimum Size Subarray Sum and 3 Longest Substring Without Repeating Characters for windows; 303 Range Sum Query and 238 Product of Array Except Self for prefix sums; 53 Maximum Subarray and 121 Best Time to Buy and Sell Stock for Kadane; and 54 Spiral Matrix and 48 Rotate Image for grids.</p>

  <h2 id="dsa-ar-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The classic grid bug is building rows with multiplication. <code>[[0] * 4] * 2</code> does not make two rows: it makes one row and a list holding two references to it, so changing one row changes "both":</p>
  <div class="fx" data-lang="py">bad = [[0] * 4] * 2                  # ONE row, referenced twice
bad[0][0] = 120
good = [[0] * 4 for _ in range(2)]   # two separate rows
good[0][0] = 120
print(bad)
print(good)</div>
  <div class="fx" data-lang="text">[[120, 0, 0, 0], [120, 0, 0, 0]]
[[120, 0, 0, 0], [0, 0, 0, 0]]</div>
  <p>Setting <code>bad[0][0]</code> also changed <code>bad[1][0]</code>, because there is only one row. A list comprehension runs <code>[0] * 4</code> afresh for each row, so the rows are independent. Always build grids with a comprehension.</p>
  <p>The second mistake is using a sliding window when values can be negative. Here is the "shortest run with total at least the target" window, unchanged, run on the profit list and checked against a brute force:</p>
  <div class="fx" data-lang="py">def shortest_at_least(nums, target):         # the window code from earlier
    left, total, best = 0, 0, float("inf")
    for right, x in enumerate(nums):
        total += x
        while total &gt;= target and left &lt;= right:
            best = min(best, right - left + 1)
            total -= nums[left]; left += 1
    return best

def brute(nums, target):                     # try every run
    return min((j - i + 1 for i in range(len(nums)) for j in range(i, len(nums))
                if sum(nums[i:j + 1]) &gt;= target), default=float("inf"))

profit = [0, -40, 130, -80, 190, -40, -60, 80]
for target in [190, 240]:
    print(target, "window:", shortest_at_least(profit, target), " brute force:", brute(profit, target))</div>
  <div class="fx" data-lang="text">190 window: 3  brute force: 1
240 window: inf  brute force: 3</div>
  <p>For a target of 190 the window answers 3, but the single order with profit 190 is a run of length 1. For 240 the window finds nothing, although orders 2..4 total exactly 240. The window shrank past the answer because a negative value made the total jump around. With negatives, use prefix sums with a hash map, or Kadane for a maximum.</p>
  <p>A third mistake is changing a list while looping over it. Removing items shifts the later items one place left underneath the loop, so the loop skips the item that slid into the removed one's place:</p>
  <div class="fx" data-lang="py">orders = [120, 0, 0, 250, 0, 40]     # 0 = cancelled
for x in orders:
    if x == 0:
        orders.remove(x)             # removing while looping shifts items under the loop
print(orders)
orders = [120, 0, 0, 250, 0, 40]
print([x for x in orders if x != 0]) # build a new list instead</div>
  <div class="fx" data-lang="text">[120, 250, 0, 40]
[120, 250, 40]</div>
  <p>One cancelled order survived, because after the first 0 was removed the second 0 slid into its position and the loop moved past it. Build a new list, use the reader/writer pointers from section 02, or loop backwards by index. Other mistakes to scan your code for: a hidden O(n) operation inside a loop (<code>x in list</code>, <code>pop(0)</code>, <code>insert(0, x)</code>, slicing) silently makes it O(n²); building a string with <code>+=</code> instead of joining; off-by-one errors, where window length is <code>right - left + 1</code> and the range sum i..j is <code>P[j + 1] - P[i]</code>; running opposite-end pointers on unsorted data, which silently misses answers; starting Kadane at 0 instead of the first element; and forgetting the single-row and single-column checks in spiral order. Before saying "done", test arrays of length 0, 1 and 2.</p>

  <h2 id="dsa-ar-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Array</b>: contiguous equal-size slots; <code>a[i]</code> at start + i × size, O(1) (random access).</li>
    <li><b>Dynamic array</b> (Python list): spare capacity, grows by a constant factor; <code>append</code> O(1) amortised.</li>
    <li><b>Subarray / substring</b>: a contiguous run with no gaps.</li>
    <li><b>Two pointers</b>: two indexes that move by a rule so each step rules out many candidates.</li>
    <li><b>Sliding window</b>: a contiguous range [left, right] updated incrementally as it moves.</li>
    <li><b>Prefix sum</b>: P[i] = total of the first i items; range sum in O(1).</li>
    <li><b>Kadane</b>: best run ending here = max(x, previous best ending + x).</li>
  </ul>
  <h3>Techniques at a glance</h3>
  <table class="tbl">
    <tr><th>Technique</th><th>Needs</th><th>Time / space</th><th>On Biteful's charges</th></tr>
    <tr><td>Brute force pairs</td><td>nothing</td><td>O(n²) / O(1)</td><td>(1, 7) after 13 of 28 checks</td></tr>
    <tr><td>Two pointers</td><td>sorted input or symmetry</td><td>O(n) / O(1)</td><td>80 + 200 in 5 steps</td></tr>
    <tr><td>Sliding window</td><td>contiguous, positive values</td><td>O(n) / O(1) or O(k)</td><td>busiest 3 = 600; shortest ≥ 500 = 3</td></tr>
    <tr><td>Prefix sums</td><td>many range queries</td><td>O(n) build, O(1) query / O(n)</td><td>P[5] − P[2] = 600</td></tr>
    <tr><td>Kadane</td><td>maximum run, negatives allowed</td><td>O(n) / O(1)</td><td>best profit = 240</td></tr>
    <tr><td>Grid traversal</td><td>bounds checks</td><td>O(R·C)</td><td>rows 490 / 650</td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py"># two pointers (sorted)                 # reader / writer (in place)
l, r = 0, len(a) - 1                     slow = 0
while l &lt; r:                             for fast in range(len(a)):
    s = a[l] + a[r]                          if keep(a[fast]):
    if s == t: return l, r                       a[slow] = a[fast]; slow += 1
    if s &lt; t: l += 1
    else: r -= 1

left = total = best = 0                  # sliding window: longest run with total &lt;= limit
for right, x in enumerate(a):
    total += x                           # grow
    while total &gt; limit:                 # broken: shrink
        total -= a[left]; left += 1
    best = max(best, right - left + 1)

P = [0]                                  # prefix sums
for x in a: P.append(P[-1] + x)          # sum(i..j) = P[j + 1] - P[i]

best = cur = a[0]                        # Kadane
for x in a[1:]: cur = max(x, cur + x); best = max(best, cur)

rotated = [list(r) for r in zip(*grid[::-1])]   # rotate clockwise (new grid)</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>[[0] * m] * n</code> shares one row; use a comprehension.</li>
    <li>Sliding window breaks on negative numbers.</li>
    <li>Two pointers needs sorted data, and sorting loses original indexes.</li>
    <li>Kadane starts from <code>a[0]</code>, not 0.</li>
    <li>Window length <code>right - left + 1</code>; range sum <code>P[j + 1] - P[i]</code>.</li>
    <li>Strings are immutable: list + <code>"".join</code>, never <code>+=</code> in a loop.</li>
    <li>Don't remove from a list while iterating over it.</li>
  </ul>

  <h2 id="dsa-ar-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is accessing <code>a[i]</code> O(1) in an array?</summary><div class="qa-body">The items sit side by side in one block and every slot is the same size, so the address of item i is start + i × slot size: one multiplication and one addition, whatever the length. A Python list stores equal-size pointers to its objects, so the same holds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dynamic array, and why is append O(1) amortised?</summary><div class="qa-body">An array that keeps spare capacity and, when full, allocates a bigger block (by a constant factor) and copies everything over. A resize costs O(n), but because capacity multiplies, resizes are rare and n appends cause fewer than 2n copies in total, so each append is O(1) on average.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Array vs linked list: when would you choose each?</summary><div class="qa-body">An array gives O(1) access by index and is cache-friendly, but inserting or deleting at the front or middle is O(n). A linked list inserts or removes at a known node in O(1) but needs O(n) to reach the i-th item. Choose an array for indexing and scanning; a linked list (or deque) for frequent insertions at the ends or at known positions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the two-pointer pair search, why is it safe to move R left when the sum is too big?</summary><div class="qa-body">The array is sorted, so every value between L and R is at least <code>a[L]</code>. If <code>a[L] + a[R]</code> is already too big, <code>a[R]</code> plus any of them is too big as well, so <code>a[R]</code> cannot be part of any answer and dropping it loses nothing. Each step therefore rules out a whole row of pairs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two Sum: when would you use two pointers and when a hash map?</summary><div class="qa-body">Two pointers when the input is already sorted (or positions don't matter) and you want O(1) extra space; it is O(n) after an O(n log n) sort. A hash map when the input is unsorted and you need original indexes; it is O(n) time but O(n) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time complexity of 3Sum and why?</summary><div class="qa-body">O(n²). After an O(n log n) sort, you fix each of the n first numbers and run an O(n) two-pointer scan on the rest. Skipping equal neighbours avoids duplicate triplets. The brute force over all triples is O(n³).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Container With Most Water, why do you move the shorter wall?</summary><div class="qa-body">Water is the shorter height times the width. Moving the taller wall inwards reduces the width while the height is still capped by the same short wall, so the area cannot grow. Only moving the shorter wall can find a taller partner and possibly more water.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The variable sliding window has a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body">The left pointer only moves forward and never passes the right pointer, so across the whole run the inner loop executes at most n times in total, not n times per step. Each index enters the window once and leaves once, about 2n operations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the sliding window fail, and what do you use instead?</summary><div class="qa-body">When growing the window does not move the condition in one direction, typically sums with negative numbers: adding an item can lower the total, so shrinking can discard the answer. Use prefix sums with a hash map for "sum equals k", or Kadane for "maximum sum".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do sliding window and prefix sums differ? When do you pick each?</summary><div class="qa-body">Both avoid re-adding ranges. A window keeps the total of the current range as it slides left to right, good for one pass over runs of positive values. Prefix sums store totals of every prefix so any range is one subtraction, good for many arbitrary range queries, and (with a hash map) for exact-sum counting with negatives.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give the prefix-sum formula for the sum of a[i..j]. Why is P[0] = 0?</summary><div class="qa-body"><code>P[j + 1] - P[i]</code>, where P[k] is the sum of the first k items. The leading 0 represents the empty prefix, so ranges starting at index 0 need no special case. It costs O(n) to build and O(1) per query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Kadane's algorithm. What goes wrong if you initialise with 0?</summary><div class="qa-body">At each element, the best subarray ending there is either the element alone or the element added to the best subarray ending just before it: <code>cur = max(x, cur + x)</code>, and the answer is the largest <code>cur</code> seen. Initialising with 0 makes an all-negative array return 0 (the empty subarray) instead of its largest element.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Product of Array Except Self without division: how, and what complexity?</summary><div class="qa-body">The answer at i is the product of everything left of i times the product of everything right of i. One forward pass writes left products into the output and one backward pass multiplies in a running right product. O(n) time, O(1) extra space besides the output, and zeros need no special handling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you build strings with <code>"".join</code> instead of <code>+=</code>?</summary><div class="qa-body">Python strings are immutable, so each <code>+=</code> may create a new string and copy everything so far, O(n²) in total. <code>join</code> computes the final length, allocates once and copies each character once, O(n). CPython's in-place shortcut for <code>+=</code> is an implementation detail you shouldn't rely on.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you rotate an n × n matrix 90° clockwise in place?</summary><div class="qa-body">Transpose it (swap <code>a[i][j]</code> with <code>a[j][i]</code> for j &gt; i), then reverse every row. For anticlockwise, transpose and then reverse the order of the rows. O(n²) time, O(1) extra space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>[[0] * 3] * 3</code> create, and why is it a bug?</summary><div class="qa-body">A list containing three references to the same row. Changing <code>grid[0][0]</code> appears to change every row's first element. Use <code>[[0] * 3 for _ in range(3)]</code> so each row is a separate list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you approach a new array problem in an interview?</summary><div class="qa-body">State the brute force and its cost first, then ask what it recomputes. Check the conditions: sorted? all positive? contiguous? many queries? original indexes needed? Those point to two pointers, a window, prefix sums, Kadane or a hash map. Read the constraints to confirm the target complexity, then test on empty, single-element and duplicate-heavy inputs.</div></details>
</main>
`
});
