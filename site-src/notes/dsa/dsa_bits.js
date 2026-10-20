// notes/dsa/dsa_bits.js — Bit Manipulation
Object.assign(TOPIC_CONTENT, {
  "dsa_bits": `<main>
<h1>Bit Manipulation</h1>
  <div class="where"><span>DSA</span><span>Problem-Solving Techniques</span><span>Bit Manipulation</span></div>
  <p class="lead">Every integer is a row of 0s and 1s. Bit manipulation means working on that row directly: switch one bit on, test another, cancel pairs with XOR. This note uses one running example from start to finish: <strong>Biteful's restaurant feature flags</strong>, where each bit is one yes/no feature (VEG = 1, FREE delivery = 2, CARD = 4, LATE = 8). Dosa Hut's flags are 13 = <code>1101</code>, Chai Point's are 10 = <code>1010</code>. We read them in binary, combine them with the six operators, see why <code>~13</code> is −14 in Python, check and change single flags, find the one undelivered order with XOR, count features with Brian Kernighan's trick, test "exactly one feature" (power of two), and list every filter combination as a bitmask. Every pattern has trigger words, a template, a traced table, tested code, its cost and practice problems from the tracker. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-bt-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-bt-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Complexity (ints) · Backtracking (subsets) · Hashing (sets)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-bt-ga)"/>
<rect x="170" y="62" width="300" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Bit Manipulation</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · flags: Dosa Hut = 1101</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bt-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Math (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">fast power reads exponent bits</text>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bt-ga)"/>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Dynamic Programming</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">dp[mask]: visited sets</text>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bt-ga)"/>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Advanced structures</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">Fenwick uses i &amp; -i</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-bt-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Bits: ~50 problems, Single Number → Awesome Substring</text>
</svg><figcaption>Reading order for the techniques block: Backtracking → Greedy → DP → <b>Bit Manipulation</b> → Math. Bits come late because their best uses (bitmask DP, Fenwick trees, fast power) need the earlier notes, but the basics need only integers.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_complexity">Complexity</a>, <a class="xref" data-note="dsa_backtrack">Backtracking</a> and <a class="xref" data-note="dsa_hashing">Hashing</a></b><span>Complexity explained that Python ints are objects of any size; here we look inside them. Backtracking listed all subsets with recursion (include or skip); a bitmask lists the same 2ⁿ subsets with one loop. Hashing used sets; a small set of flags fits in one int.</span></li>
    <li><b>This note adds: the integer as a row of switches</b><span>Binary, the six operators, Python's infinite-width negatives, single-bit moves, XOR cancelling, popcount, the power-of-two and lowest-bit tricks, and subsets as masks.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_math">Math &amp; Number Theory</a></b><span>Fast exponentiation reads the exponent's bits one by one (13 = 1101 → x⁸·x⁴·x¹). <a class="xref" data-note="dsa_dp">DP</a> uses masks as states ("which cities are visited"), and the Fenwick tree in <a class="xref" data-note="dsa_advanced">Advanced Data Structures</a> walks with <code>i &amp; -i</code>. Practise in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-bt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Running example: features VEG = 1, FREE = 2, CARD = 4, LATE = 8; <b>Dosa Hut = 13 (1101)</b>, <b>Chai Point = 10 (1010)</b>.</p>
  <ol class="story">
    <li><b>Binary representation</b><span>Q: how can one number store 4 yes/no features? → Give each feature a place value 1, 2, 4, 8: Dosa Hut = 8 + 4 + 1 = 13 = <code>1101</code>. But how do we compare or combine two restaurants' rows of switches?</span></li>
    <li><b>The six operators</b><span>Q: what do two restaurants share, and where do they differ? → Column by column: 13 &amp; 10 = 8 (both LATE), 13 | 10 = 15, 13 ^ 10 = 7, shifts ×4 / ÷4. But <code>~13</code> prints −14, not 2. Why?</span></li>
    <li><b>Python ints &amp; negatives</b><span>Q: what is a negative number in bits? → Two's complement with infinitely many leading 1s: ~x = −x − 1; mask with <code>0xFFFFFFFF</code> to see 32 bits. Now we understand every operator; how do we touch just one feature?</span></li>
    <li><b>One bit at a time</b><span>Q: does Dosa Hut deliver free? Turn it on; turn LATE off. → <code>1 &lt;&lt; i</code> as a mask: check (13 &gt;&gt; 1) &amp; 1 = 0, set → 15, clear bit 3 → 5, toggle VEG → 12. And whole filters: <code>flags &amp; want == want</code>. XOR flips; what else can it do?</span></li>
    <li><b>XOR tricks</b><span>Q: every order id appears twice in the dispatch log except one; which one? → x ^ x = 0, so XOR everything: [4, 1, 2, 1, 2] → 4. Also 13 ^ 9 = 0100: CARD changed. Next question: how many features does a restaurant have?</span></li>
    <li><b>Counting bits (Kernighan)</b><span>Q: count the 1s without visiting every 0? → <code>n &amp;= n − 1</code> wipes the lowest 1: 1101 → 1100 → 1000 → 0, 3 steps. That same expression has a second use…</span></li>
    <li><b>Power of two &amp; the lowest bit</b><span>Q: does a restaurant have exactly one feature, and which is its lowest? → One 1-bit ⇔ x &gt; 0 and x &amp; (x − 1) == 0 (8 yes, 13 no); x &amp; −x keeps only the lowest 1 (12 → 4). Finally: can we list every combination of filters?</span></li>
    <li><b>Subsets via bitmask</b><span>Q: all combinations of 3 filters? → Masks 0..7, bit i = filter i ticked: 8 combinations, O(n·2ⁿ). The doorway to bitmask DP and to the patterns and classic problems.</span></li>
  </ol>

<h2 id="dsa-bt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Bit Manipulation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Binary basics</div>
        <ul>
          <li><b>Base 2</b> — place values 1, 2, 4, 8, 16 … from the right</li>
          <li><b>13</b> = 8 + 4 + 1 = <code>1101</code></li>
          <li><b>Bit i</b> — counted from the right, starting at 0</li>
          <li><code>bin(n)</code>, <code>format(n, "08b")</code>, <code>int("1101", 2)</code>, <code>n.bit_length()</code></li>
          <li>💡 A row of light switches: each switch is one bit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Six operators</div>
        <ul>
          <li><b>&amp;</b> AND — 1 only if both 1 (mask, test)</li>
          <li><b>|</b> OR — 1 if any is 1 (switch on)</li>
          <li><b>^</b> XOR — 1 if different (toggle, cancel pairs)</li>
          <li><b>~</b> NOT — in Python <code>~x == -x - 1</code></li>
          <li><b>&lt;&lt; k</b> — multiply by 2ᵏ · <b>&gt;&gt; k</b> — floor-divide by 2ᵏ</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python specifics</div>
        <ul>
          <li><b>Unbounded ints</b> — no overflow, no fixed 32 bits</li>
          <li><b>Negatives</b> — act like infinite leading 1s</li>
          <li><b>32-bit view</b> — <code>x &amp; 0xFFFFFFFF</code></li>
          <li><b>Back to signed</b> — if top bit set, subtract <code>1 &lt;&lt; 32</code></li>
          <li>⚠ <code>bin(-5)</code> is <code>-0b101</code>, not two's complement</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Single-bit moves</div>
        <ul>
          <li><b>Check</b> — <code>(n &gt;&gt; i) &amp; 1</code></li>
          <li><b>Set</b> — <code>n | (1 &lt;&lt; i)</code></li>
          <li><b>Clear</b> — <code>n &amp; ~(1 &lt;&lt; i)</code></li>
          <li><b>Toggle</b> — <code>n ^ (1 &lt;&lt; i)</code></li>
          <li><b>Low k bits</b> — <code>n &amp; ((1 &lt;&lt; k) - 1)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Famous tricks</div>
        <ul>
          <li><code>x &amp; (x-1)</code> — remove lowest 1</li>
          <li><code>x &amp; -x</code> — keep only lowest 1</li>
          <li><b>Power of 2</b> — <code>x &gt; 0 and x &amp; (x-1) == 0</code></li>
          <li><b>XOR</b> — <code>x^x = 0</code>, <code>x^0 = x</code>, order does not matter</li>
          <li><b>Count 1s</b> — <code>bin(n).count("1")</code>, <code>n.bit_count()</code>, Kernighan loop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Single Number</b> — XOR everything</li>
          <li><b>Number of 1 Bits</b> / <b>Counting Bits</b> — Kernighan, <code>ans[i&gt;&gt;1] + (i&amp;1)</code></li>
          <li><b>Missing Number</b> — XOR indexes and values</li>
          <li><b>Reverse Bits</b> — shift out, shift in, 32 times</li>
          <li><b>Sum of Two Integers</b> — XOR + carry, with a 32-bit mask</li>
          <li><b>Subsets</b> — mask from 0 to 2ⁿ − 1</li>
        </ul>
      </div>
    </div>
  </div>

    <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-bt-binary"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Binary Representation</span><span class="rm-sub">Feature flags as switches</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-ops"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Six Operators</span><span class="rm-sub">&amp; | ^ ~ &lt;&lt; &gt;&gt; on 13 and 10</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-neg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Python Ints &amp; Negatives</span><span class="rm-sub">Why ~13 is −14</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-onebit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">One Bit at a Time</span><span class="rm-sub">Check, set, clear, toggle</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-single"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">XOR Tricks</span><span class="rm-sub">Single number traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-count"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Counting 1 Bits</span><span class="rm-sub">Brian Kernighan traced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-tricks"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Power of Two &amp; Lowest Bit</span><span class="rm-sub">x &amp; (x − 1), x &amp; −x</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-subsets"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Subsets via Bitmask</span><span class="rm-sub">All filter combinations</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words → trick</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-problems"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">7 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Precedence, negatives, ~</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bt-binary"><span class="num">01</span>Binary Representation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful stores, for every restaurant, four yes/no features: pure veg, free delivery, accepts card, open late. A dict of four booleans per restaurant works, but there are lakhs of restaurants and the app filters them on every search. Can one small integer hold all four answers?</p>
  </div>
  <p>You already know base 10. In 352, the 3 means "3 hundreds", the 5 means "5 tens", the 2 means "2 ones". Each place is 10 times the one to its right.</p>
  <p>Binary (base 2) is the same idea with only two digits, 0 and 1. Each place is 2 times the one to its right: 1, 2, 4, 8, 16, 32 … A computer stores every integer this way, because a wire is either off (0) or on (1).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A switchboard in an Indian home with 8 switches in a row. Each switch is a <strong>bit</strong>. The rightmost switch is worth 1, the next 2, then 4, 8 and so on. The number is the total of the switches that are on.</p>
  </div>
  <h3>The running example</h3>
  <table class="tbl"><caption>One bit per feature</caption>
    <tr><th>bit</th><th>3</th><th>2</th><th>1</th><th>0</th><th>number</th></tr>
    <tr><th>feature (value)</th><td>LATE (8)</td><td>CARD (4)</td><td>FREE (2)</td><td>VEG (1)</td><td></td></tr>
    <tr><td>Dosa Hut</td><td>1</td><td>1</td><td>0</td><td>1</td><td>8 + 4 + 1 = <b>13</b></td></tr>
    <tr><td>Chai Point</td><td>1</td><td>0</td><td>1</td><td>0</td><td>8 + 2 = <b>10</b></td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600"><text x="20" y="40" class="tm">value</text><text x="20" y="80" class="tm">bit</text><text x="20" y="128" class="tm">adds</text><text x="90" y="40" text-anchor="middle" class="tm">128</text><rect x="62" y="56" width="56" height="36" class="fs"/><text x="90" y="80" text-anchor="middle">0</text><text x="150" y="40" text-anchor="middle" class="tm">64</text><rect x="122" y="56" width="56" height="36" class="fs"/><text x="150" y="80" text-anchor="middle">0</text><text x="210" y="40" text-anchor="middle" class="tm">32</text><rect x="182" y="56" width="56" height="36" class="fs"/><text x="210" y="80" text-anchor="middle">0</text><text x="270" y="40" text-anchor="middle" class="tm">16</text><rect x="242" y="56" width="56" height="36" class="fs"/><text x="270" y="80" text-anchor="middle">0</text><text x="330" y="40" text-anchor="middle" class="tm">8</text><rect x="302" y="56" width="56" height="36" class="fg sg"/><text x="330" y="80" text-anchor="middle">1</text><text x="390" y="40" text-anchor="middle" class="tm">4</text><rect x="362" y="56" width="56" height="36" class="fg sg"/><text x="390" y="80" text-anchor="middle">1</text><text x="450" y="40" text-anchor="middle" class="tm">2</text><rect x="422" y="56" width="56" height="36" class="fs"/><text x="450" y="80" text-anchor="middle">0</text><text x="510" y="40" text-anchor="middle" class="tm">1</text><rect x="482" y="56" width="56" height="36" class="fg sg"/><text x="510" y="80" text-anchor="middle">1</text><text x="330" y="128" text-anchor="middle" class="tg">8</text><text x="390" y="128" text-anchor="middle" class="tg">+4</text><text x="510" y="128" text-anchor="middle" class="tg">+1</text><text x="300" y="160" text-anchor="middle">Dosa Hut: 00001101 = 8 + 4 + 1 = 13 (late, card, veg)</text><text x="90" y="18" text-anchor="middle" class="tm">bit 7</text><text x="510" y="18" text-anchor="middle" class="tm">bit 0</text><text x="330" y="106" text-anchor="middle" class="tm" font-size="10">LATE</text><text x="390" y="106" text-anchor="middle" class="tm" font-size="10">CARD</text><text x="450" y="106" text-anchor="middle" class="tm" font-size="10">FREE</text><text x="510" y="106" text-anchor="middle" class="tm" font-size="10">VEG</text></svg><figcaption>Dosa Hut's flags, 13, as eight switches. Green switches are on. Bits are numbered from the right, starting at 0.</figcaption></figure>
  <p>To convert 13 to binary by hand: the largest place value ≤ 13 is 8 (13 − 8 = 5), then 4 (5 − 4 = 1), skip 2, then 1. Places used: 8, 4, 1 → <code>1101</code>. Python helps in both directions:</p>
<div class="fx" data-lang="py">VEG, FREE, CARD, LATE = 1 &lt;&lt; 0, 1 &lt;&lt; 1, 1 &lt;&lt; 2, 1 &lt;&lt; 3     # 1, 2, 4, 8
dosa_hut = VEG | CARD | LATE                                # 1 + 4 + 8
chai_point = FREE | LATE                                    # 2 + 8
for name, n in [("Dosa Hut", dosa_hut), ("Chai Point", chai_point), ("all four", 15)]:
    print(f"{name:10} {n:&gt;2} {bin(n):&gt;6} {format(n, '08b')}")
print(int("1101", 2), 0b1101, 0xFF, hex(255))
print((13).bit_length(), (255).bit_length(), (256).bit_length())</div>
  <div class="fx" data-lang="text">Dosa Hut   13 0b1101 00001101
Chai Point 10 0b1010 00001010
all four   15 0b1111 00001111
13 13 255 0xff
4 8 9</div>
  <p><code>bit_length()</code> is "how many bits do I need": 13 needs 4, 255 needs 8, 256 needs 9. A number with k bits is at most 2ᵏ − 1, so 4 feature bits give 16 possible feature combinations (0 to 15), and 8 bits hold 0 to 255 (one byte).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bit i</strong> of n is the digit in place value 2ⁱ. Bit 0 is the rightmost (the "ones" place), also called the <strong>least significant bit</strong>. The leftmost 1 is the <strong>most significant bit</strong>. A <strong>mask</strong> is a number whose 1s mark the bits you care about (CARD | LATE = 12 is a mask).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading the bits left to right as bit 0, 1, 2 … Bit 0 is on the <em>right</em>. <code>bin(13)</code> = <code>'0b1101'</code> lists LATE first and VEG last.</p>
  </div>
  <p>Where you meet it: file permissions (<code>chmod 755</code> is three 3-bit masks), feature flags packed into one integer, IP subnet masks (<code>255.255.255.0</code>), chess engines (one 64-bit number per piece type), Bloom filters, compression, and any "visited" set over 20 or fewer items in DP.</p>
  <div class="bridge"><b>What this still can't tell us → next: The Six Operators.</b> 13 and 10 now hold the flags of two restaurants. A customer asks "which features do both have?" We need a way to combine two rows of switches column by column.</div>

  <h2 id="dsa-bt-ops"><span class="num">02</span>The Six Operators</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Normal arithmetic mixes the columns (13 + 10 carries into new places). For flags we need operators that treat every column separately: "both on", "either on", "different", "flip", "slide".</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>bitwise</b> AND / OR / XOR", "binary representation", "complement", "shift", "flip the bits", "add binary strings", "alternating bits".</p>
  </div>
  <p>Bitwise operators work on each column of bits separately, like adding two numbers digit by digit but with no carry. Line the numbers up on the right and apply a rule per column.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600"><text x="20" y="20" class="tm">a = 13</text><text x="200" y="20" class="tm">Dosa Hut: late, card, veg</text><text x="20" y="44" class="tm">b = 10</text><text x="200" y="44" class="tm">Chai Point: late, free delivery</text><text x="100" y="20">1 1 0 1</text><text x="100" y="44">1 0 1 0</text><line x1="96" y1="54" x2="170" y2="54" stroke="currentColor"/><text x="20" y="76" class="tb">a &amp; b</text><text x="100" y="76" class="tb">1 0 0 0</text><text x="200" y="76" class="tm">= 8: 1 only where both are 1 (both open late)</text><text x="20" y="104" class="tg">a | b</text><text x="100" y="104" class="tg">1 1 1 1</text><text x="200" y="104" class="tm">= 15: 1 where either is 1</text><text x="20" y="132" class="tr">a ^ b</text><text x="100" y="132" class="tr">0 1 1 1</text><text x="200" y="132" class="tm">= 7: 1 where they differ (veg, free, card)</text><text x="20" y="168">a &lt;&lt; 2 = 110100 (52)</text><text x="300" y="168">a &gt;&gt; 2 = 11 (3)</text></svg><figcaption>Dosa Hut (13) and Chai Point (10), column by column. Shifts slide the whole row left (adding zeros) or right (dropping bits).</figcaption></figure>
  <table class="tbl">
    <tr><th>Op</th><th>Name</th><th>Column rule</th><th>Everyday use</th></tr>
    <tr><td><code>&amp;</code></td><td>AND</td><td>1 if both are 1</td><td>Test a bit, keep only some bits (mask)</td></tr>
    <tr><td><code>|</code></td><td>OR</td><td>1 if at least one is 1</td><td>Switch a bit on, combine flags</td></tr>
    <tr><td><code>^</code></td><td>XOR</td><td>1 if the two differ</td><td>Toggle a bit, find "the odd one out"</td></tr>
    <tr><td><code>~</code></td><td>NOT</td><td>flip every bit</td><td>Build "everything except bit i"</td></tr>
    <tr><td><code>&lt;&lt; k</code></td><td>left shift</td><td>slide left, fill with 0</td><td><code>1 &lt;&lt; i</code> = a mask with only bit i; x·2ᵏ</td></tr>
    <tr><td><code>&gt;&gt; k</code></td><td>right shift</td><td>slide right, drop bits</td><td>Bring bit i to position 0; x // 2ᵏ</td></tr>
  </table>
<div class="fx" data-lang="py">a, b = 13, 10                     # Dosa Hut 1101, Chai Point 1010
print(f"a &amp; b  = {a &amp; b:2}  {a &amp; b:04b}   features both have")
print(f"a | b  = {a | b:2}  {a | b:04b}   features either has")
print(f"a ^ b  = {a ^ b:2}  {a ^ b:04b}   features where they differ")
print(f"~a     = {~a}")
print(f"a &lt;&lt; 2 = {a &lt;&lt; 2}  {a &lt;&lt; 2:06b}  (x 4)")
print(f"a &gt;&gt; 2 = {a &gt;&gt; 2:2}  {a &gt;&gt; 2:04b}   (// 4: the two lowest bits fall off)")</div>
  <div class="fx" data-lang="text">a &amp; b  =  8  1000   features both have
a | b  = 15  1111   features either has
a ^ b  =  7  0111   features where they differ
~a     = -14
a &lt;&lt; 2 = 52  110100  (x 4)
a &gt;&gt; 2 =  3  0011   (// 4: the two lowest bits fall off)</div>
  <table class="tbl out"><caption>Trace: 13 (1101) and 10 (1010), column by column</caption>
    <tr><th>column (feature)</th><th>bit 3 LATE</th><th>bit 2 CARD</th><th>bit 1 FREE</th><th>bit 0 VEG</th><th>value</th></tr>
    <tr><td>a = 13</td><td>1</td><td>1</td><td>0</td><td>1</td><td>13</td></tr>
    <tr><td>b = 10</td><td>1</td><td>0</td><td>1</td><td>0</td><td>10</td></tr>
    <tr><td>a &amp; b</td><td>1</td><td>0</td><td>0</td><td>0</td><td>8</td></tr>
    <tr><td>a | b</td><td>1</td><td>1</td><td>1</td><td>1</td><td>15</td></tr>
    <tr><td>a ^ b</td><td>0</td><td>1</td><td>1</td><td>1</td><td>7</td></tr>
  </table>
  <p>Both restaurants are open late (AND = 8); between them they cover every feature (OR = 15); they differ on VEG, FREE and CARD (XOR = 7). <code>13 &lt;&lt; 2</code> = 52 is 13 × 4; <code>13 &gt;&gt; 2</code> = 3 is 13 // 4, the two lowest bits (VEG, FREE) fall off. And <code>~13</code> = −14, which the next section explains.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Think of AND as a <strong>filter</strong> (keeps a bit only if the mask allows it), OR as a <strong>switch-on</strong>, XOR as a <strong>flip</strong>. Shifts are fast ×2 and ÷2. With these four ideas you can read almost any bit trick.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Operator precedence. In Python, arithmetic (<code>+ -</code>) binds tighter than shifts (<code>&lt;&lt; &gt;&gt;</code>), shifts tighter than <code>&amp;</code>, then <code>^</code>, then <code>|</code>, and comparisons like <code>==</code> come last. So <code>1 &lt;&lt; n - 1</code> means <code>1 &lt;&lt; (n - 1)</code>, and <code>x &amp; 1 == 0</code> means <code>(x &amp; 1) == 0</code>. In C and Java that last one is <code>x &amp; (1 == 0)</code>. When in doubt, add brackets.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Bits: <b>1342 Number of Steps to Reduce a Number to Zero</b> (read the last bit, shift), <b>693 Binary Number with Alternating Bits</b>, <b>67 Add Binary</b>, then <b>190 Reverse Bits</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Python Ints &amp; Negatives.</b> AND, OR and XOR behaved. NOT did not: we expected <code>~1101</code> = <code>0010</code> = 2 and got −14. To trust any bit trick in Python, we need to know how it stores negative numbers.</div>

  <h2 id="dsa-bt-neg"><span class="num">03</span>Python Ints &amp; Negatives</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Why is <code>~13</code> equal to −14 instead of 2, and what does a negative number look like in bits? Without this, problems that say "32-bit integer" (Reverse Bits, Sum of Two Integers) loop forever or print nonsense in Python.</p>
  </div>
  <p>In C, Java or Go an <code>int</code> is a box of exactly 32 (or 64) switches. Add 1 to the biggest value and it wraps to a negative number (overflow). Python is different: an int grows as big as it needs. <code>2 ** 100</code> just works.</p>
  <p>So how does Python store −5? Computers use <strong>two's complement</strong>: to get −x, flip all bits of x and add 1. In a 32-bit box, −1 is 32 ones, −5 is <code>11111111 … 11111011</code>. Python pretends a negative number has <strong>infinitely many</strong> leading 1s. That keeps all the bit rules consistent, but it means there is no "top bit" to look at.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An old car odometer with 6 digits rolls from 999999 to 000000. Going backwards from 000000 gives 999999, which acts like −1. Two's complement is the same with binary digits. Python's odometer has endless digits, so it never rolls over, and a negative number is "999…" forever to the left.</p>
  </div>
<div class="fx" data-lang="py">print(~13, -13 - 1)               # ~x is always -x - 1
print(bin(-5))                    # Python shows sign + magnitude, not two's complement
print(-5 &amp; 0xFFFFFFFF, hex(-5 &amp; 0xFFFFFFFF))   # the 32-bit pattern of -5
print(2 ** 100 &gt; 0, (1 &lt;&lt; 64) - 1)
print(-8 &gt;&gt; 1, -1 &gt;&gt; 10)          # right shift of a negative rounds down

def to_signed32(x):
    x &amp;= 0xFFFFFFFF                    # keep the low 32 bits
    return x - (1 &lt;&lt; 32) if x &amp; 0x80000000 else x   # top bit set = negative

print(to_signed32(0xFFFFFFFB), to_signed32(0x7FFFFFFF), to_signed32(0x80000000))
print(format(13 ^ 0b1111, "04b"))  # flip only the 4 feature bits: 0010 (just FREE)</div>
  <div class="fx" data-lang="text">-14 -14
-0b101
4294967291 0xfffffffb
True 18446744073709551615
-4 -1
-5 2147483647 -2147483648
0010</div>
  <p>Read the lines one by one:</p>
  <ul>
    <li><code>~13</code> flips every bit of …0001101, including the infinite zeros on the left, which become infinite ones: …1110010. That is −14. The rule <strong><code>~x == -x - 1</code></strong> always holds.</li>
    <li><code>bin(-5)</code> prints a minus sign and the size. It does not show the stored bits.</li>
    <li><code>-5 &amp; 0xFFFFFFFF</code> keeps only the low 32 bits, giving the 32-bit pattern as a big positive number (4294967291 = <code>0xfffffffb</code>). This is how you simulate a 32-bit machine.</li>
    <li><code>-8 &gt;&gt; 1</code> is −4 and <code>-1 &gt;&gt; 10</code> stays −1: right shift is floor division by 2ᵏ, and the leading 1s keep coming in.</li>
    <li><code>to_signed32</code> goes back: if bit 31 is set, the pattern means a negative number, so subtract 2³².</li>
    <li>What we actually wanted from <code>~13</code> ("the features Dosa Hut lacks") is <code>13 ^ 0b1111</code> = <code>0010</code>: flip only the 4 feature bits.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Two's complement</strong>: the standard way to store signed integers. −x = (~x) + 1. In n bits the range is −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1, and the top bit means "negative". <code>0xFFFFFFFF</code> is 32 ones; <code>0x7FFFFFFF</code> (2147483647) is the largest signed 32-bit int.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Loops like <code>while n: n &gt;&gt;= 1</code> never end for a negative n in Python (−1 &gt;&gt; 1 is still −1). If a problem says "treat n as a 32-bit unsigned integer", first do <code>n &amp;= 0xFFFFFFFF</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>476 Number Complement</b> (flip only the bits you have: XOR with a mask of ones), <b>405 Convert a Number to Hexadecimal</b> (negatives via <code>&amp; 0xFFFFFFFF</code>), <b>371 Sum of Two Integers</b> (section 10).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: One Bit at a Time.</b> We can now combine whole rows safely. The app's daily work is smaller: "does Dosa Hut deliver free?", "switch LATE off tonight", "does it match the customer's filters?" That means reading and changing one chosen bit.</div>

  <h2 id="dsa-bt-onebit"><span class="num">04</span>One Bit at a Time</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The operators work on all columns at once. How do we aim at exactly one feature (bit i) to read it, switch it on, switch it off or flip it, without disturbing the others?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"the i-th bit", "set / clear / toggle", "flags", "permissions", "is bit k on", "mask of letters", "has all of / any of".</p>
  </div>
  <p>Almost every bit trick is built from one small tool: <code>1 &lt;&lt; i</code>, a number with only bit i on. Combine it with an operator and you can read or change any one switch.</p>
  <table class="tbl">
    <tr><th>Goal</th><th>Code</th><th>Why it works</th></tr>
    <tr><td>Check bit i</td><td><code>(n &gt;&gt; i) &amp; 1</code></td><td>Slide bit i to position 0, then keep only that bit</td></tr>
    <tr><td>Set bit i (turn on)</td><td><code>n | (1 &lt;&lt; i)</code></td><td>OR with 1 makes it 1; other bits OR with 0, unchanged</td></tr>
    <tr><td>Clear bit i (turn off)</td><td><code>n &amp; ~(1 &lt;&lt; i)</code></td><td><code>~(1&lt;&lt;i)</code> is all ones except bit i; AND keeps everything else</td></tr>
    <tr><td>Toggle bit i</td><td><code>n ^ (1 &lt;&lt; i)</code></td><td>XOR with 1 flips; XOR with 0 keeps</td></tr>
    <tr><td>Keep the low k bits</td><td><code>n &amp; ((1 &lt;&lt; k) - 1)</code></td><td><code>(1&lt;&lt;k) - 1</code> is k ones</td></tr>
  </table>
<div class="fx" data-lang="py">def get_bit(n, i):    return (n &gt;&gt; i) &amp; 1
def set_bit(n, i):    return n | (1 &lt;&lt; i)
def clear_bit(n, i):  return n &amp; ~(1 &lt;&lt; i)
def toggle_bit(n, i): return n ^ (1 &lt;&lt; i)

dosa_hut = 0b1101                             # 13: VEG, CARD, LATE
print([get_bit(dosa_hut, i) for i in range(4)])        # bits 0..3 = VEG, FREE, CARD, LATE
print("free delivery?", get_bit(dosa_hut, 1))
print("turn on FREE   :", format(set_bit(dosa_hut, 1), "04b"), set_bit(dosa_hut, 1))
print("turn off LATE  :", format(clear_bit(dosa_hut, 3), "04b"), clear_bit(dosa_hut, 3))
print("toggle VEG     :", format(toggle_bit(dosa_hut, 0), "04b"), toggle_bit(dosa_hut, 0))
print("low 3 bits only:", format(dosa_hut &amp; ((1 &lt;&lt; 3) - 1), "04b"))</div>
  <div class="fx" data-lang="text">[1, 0, 1, 1]
free delivery? 0
turn on FREE   : 1111 15
turn off LATE  : 0101 5
toggle VEG     : 1100 12
low 3 bits only: 0101</div>
  <table class="tbl out"><caption>Trace: single-bit moves on Dosa Hut = 1101 (13)</caption>
    <tr><th>Move</th><th>Mask</th><th>Operation</th><th>Result</th><th>Meaning</th></tr>
    <tr><td>check FREE (i = 1)</td><td>—</td><td>1101 &gt;&gt; 1 = 110; &amp; 1</td><td>0</td><td>no free delivery</td></tr>
    <tr><td>set FREE</td><td>0010</td><td>1101 | 0010</td><td>1111 (15)</td><td>all four features</td></tr>
    <tr><td>clear LATE (i = 3)</td><td>~1000 = …11110111</td><td>1101 &amp; …0111</td><td>0101 (5)</td><td>closes at 11 pm now</td></tr>
    <tr><td>toggle VEG (i = 0)</td><td>0001</td><td>1101 ^ 0001</td><td>1100 (12)</td><td>no longer pure veg</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An attendance register for 30 students stored as one number: bit i = 1 means roll number i is present. Marking someone present is "set", marking absent is "clear", checking is "check". 30 students fit in one integer instead of a list of 30 booleans.</p>
  </div>
  <h3>Several bits at once: the customer's filters</h3>
  <p>A customer ticks "veg" and "card". The ticked filters form a mask, <code>want = VEG | CARD</code> = 0101. A restaurant matches all of them if <code>flags &amp; want == want</code>, and at least one of them if <code>flags &amp; want != 0</code>.</p>
<div class="fx" data-lang="py">VEG, FREE, CARD, LATE = 1, 2, 4, 8
restaurants = {"Dosa Hut": 13, "Chai Point": 10, "Biryani Bros": CARD | LATE, "Salad Co": VEG | FREE | CARD}

want = VEG | CARD                                # customer ticks "veg" and "card"
for name, flags in restaurants.items():
    print(f"{name:12} {flags:04b}  has all ticked: {flags &amp; want == want}   has any: {flags &amp; want != 0}")</div>
  <div class="fx" data-lang="text">Dosa Hut     1101  has all ticked: True   has any: True
Chai Point   1010  has all ticked: False   has any: False
Biryani Bros 1100  has all ticked: False   has any: True
Salad Co     0111  has all ticked: True   has any: True</div>
  <p>Dosa Hut (1101 &amp; 0101 = 0101) and Salad Co match all; Chai Point (1010 &amp; 0101 = 0000) matches none; Biryani Bros (1100 &amp; 0101 = 0100) has card but is not veg. One AND per restaurant instead of two dictionary lookups.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">bit  = 1 &lt;&lt; i                   # one switch
on   = (n &gt;&gt; i) &amp; 1             # read
n   |= bit                        # set        n &amp;= ~bit   # clear      n ^= bit   # toggle
all_of = n &amp; want == want         # every ticked filter      any_of = n &amp; want != 0</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>bitmask</strong> represents a set of small integers {0, …, k−1} as one int: element i is in the set when bit i is 1. Set operations become one CPU instruction each: union <code>|</code>, intersection <code>&amp;</code>, difference <code>a &amp; ~b</code>, symmetric difference <code>^</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>n &amp; (1 &lt;&lt; i)</code> is not 0 or 1; it is 0 or 2ⁱ. <code>if n &amp; (1 &lt;&lt; 3):</code> is fine, but <code>n &amp; (1 &lt;&lt; 3) == 1</code> is always False for i &gt; 0. Use <code>(n &gt;&gt; i) &amp; 1</code> when you need exactly 0/1.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>1684 Count the Number of Consistent Strings</b> (letters as a mask, "all of" test), <b>868 Binary Gap</b>, <b>1318 Minimum Flips to Make a OR b Equal to c</b> (reason bit by bit).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: XOR Tricks.</b> XOR flipped VEG on and off. Flipping twice gets you back where you started, and that turns out to solve a real dispatch problem: in a log where every order appears twice, which one appears only once?</div>

  <h2 id="dsa-bt-single"><span class="num">05</span>XOR Tricks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The dispatch log records each order id twice: once when picked up, once when delivered. One order was picked up and never delivered. A Counter finds it with O(n) extra memory. Can we find it with one variable?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"every element appears <b>twice except one</b>", "find the <b>missing</b> number", "find the extra letter", "O(1) extra space", "which bits <b>changed</b>", "XOR of a range / subarray".</p>
  </div>
  <p>Three facts: <code>x ^ x = 0</code> (same bits cancel), <code>x ^ 0 = x</code>, and order does not matter (<code>a ^ b ^ a = b</code>). So if you XOR a list where every value appears twice except one, the pairs vanish and the loner is left.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hostel light switch toggled by everyone who passes. If every person walks in and later walks out (two toggles each), the light ends where it started. Only the person who came in and stayed decides the final state.</p>
  </div>
<div class="fx" data-lang="py">print(5 ^ 5, 5 ^ 0, 3 ^ 7 ^ 3)               # x^x = 0, x^0 = x, pairs cancel

# the dispatch log: every order id appears twice (picked up, delivered) - except one
log = [4, 1, 2, 1, 2]
x = 0
for oid in log:
    print(f"x={x:03b} ^ {oid:03b} -&gt; {x ^ oid:03b}")
    x ^= oid
print("never delivered:", x)

yesterday, today = 13, 9                     # Dosa Hut's flags on two days
print("changed flags:", format(yesterday ^ today, "04b"))   # 0100 = CARD</div>
  <div class="fx" data-lang="text">0 5 7
x=000 ^ 100 -&gt; 100
x=100 ^ 001 -&gt; 101
x=101 ^ 010 -&gt; 111
x=111 ^ 001 -&gt; 110
x=110 ^ 010 -&gt; 100
never delivered: 4
changed flags: 0100</div>
  <table class="tbl out"><caption>Trace: the dispatch log [4, 1, 2, 1, 2]</caption>
    <tr><th>order id</th><th>x before</th><th>x ^ id</th><th>what happened</th></tr>
    <tr><td>4</td><td>000</td><td>100 (4)</td><td>4 picked up</td></tr>
    <tr><td>1</td><td>100</td><td>101 (5)</td><td>1 picked up</td></tr>
    <tr><td>2</td><td>101</td><td>111 (7)</td><td>2 picked up</td></tr>
    <tr><td>1</td><td>111</td><td>110 (6)</td><td>1 delivered: its bit cancels</td></tr>
    <tr><td>2</td><td>110</td><td>100 (4)</td><td>2 delivered: cancels → answer 4</td></tr>
  </table>
  <p>The same "difference detector" compares two versions of one restaurant: yesterday 13 (1101), today 9 (1001), <code>13 ^ 9</code> = 0100, so exactly the CARD flag changed.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">x = 0
for v in values: x ^= v          # pairs cancel, the odd one out remains
# missing number in 0..n:  XOR all indexes 0..n with all values</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>XOR</strong> (exclusive or) is addition without carry in each column. It is its own inverse (<code>(a ^ b) ^ b = a</code>), commutative and associative, with identity 0. That is why pairs cancel in any order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The XOR swap (<code>a ^= b; b ^= a; a ^= b</code>) is a quiz favourite but never use it in real code: it is slower than <code>a, b = b, a</code> and breaks when a and b are the same memory slot (<code>x ^= x</code> makes 0). And XOR finds the loner only if every other value appears an <em>even</em> number of times; three copies leave one behind (Single Number II needs per-bit counting).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>136 Single Number</b> (the trace above), <b>268 Missing Number</b>, <b>389 Find the Difference</b>, then <b>1310 XOR Queries of a Subarray</b> (prefix XOR, like prefix sums) and <b>260 Single Number III</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Counting 1 Bits.</b> XOR told us <em>which</em> bits differ between Dosa Hut and Chai Point (0111). The ranking team asks a number: <em>how many</em> features does a restaurant have, and in how many features do two restaurants differ?</div>

  <h2 id="dsa-bt-count"><span class="num">06</span>Counting 1 Bits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How many features does Dosa Hut have? Looking at every bit works, but a 32-bit number with three 1s wastes 29 looks on zeros. Can we jump from one 1 straight to the next?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>number of 1 bits</b>", "Hamming weight / <b>Hamming distance</b>", "count set bits for every i ≤ n", "sort by number of 1 bits", "popcount".</p>
  </div>
  <p>"How many switches are on?" is called the <strong>popcount</strong> or <strong>Hamming weight</strong>. It shows up in Hamming distance (<code>popcount(a ^ b)</code> = number of positions where two codes differ), in DP over subsets, and in many easy interview questions.</p>
  <p><strong>Brian Kernighan's trick:</strong> <code>n &amp; (n − 1)</code> removes the lowest 1. Subtracting 1 from a binary number works like subtracting 1 from 1000 in decimal (gives 0999): the lowest 1 becomes 0 and every 0 to its right becomes 1. AND that with the original and the lowest 1 and everything right of it become 0. Everything to the left is untouched. Count how many times you can do that before n is 0.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Counting lit windows in a building by walking past only the lit ones: you jump straight from one lit window to the next instead of checking every dark window in between.</p>
  </div>
<div class="fx" data-lang="py">def count_kernighan(n, trace=False):
    c = 0
    while n:
        if trace: print(f"{n:04b} &amp; {n - 1:04b} = {n &amp; (n - 1):04b}")
        n &amp;= n - 1                           # drop the lowest 1
        c += 1
    return c

def count_shift(n):
    c = 0
    while n:
        c += n &amp; 1                           # look at the last bit
        n &gt;&gt;= 1
    return c

print("Dosa Hut features:", count_kernighan(13, trace=True))
print("Hamming distance Dosa Hut vs Chai Point:", count_kernighan(13 ^ 10))
for n in [0, 1, 11, 128, 255, 2**31 - 1]:
    print(n, bin(n).count("1"), n.bit_count(), count_kernighan(n), count_shift(n))</div>
  <div class="fx" data-lang="text">1101 &amp; 1100 = 1100
1100 &amp; 1011 = 1000
1000 &amp; 0111 = 0000
Dosa Hut features: 3
Hamming distance Dosa Hut vs Chai Point: 3
0 0 0 0 0
1 1 1 1 1
11 3 3 3 3
128 1 1 1 1
255 8 8 8 8
2147483647 31 31 31 31</div>
  <table class="tbl out"><caption>Trace: Kernighan on Dosa Hut = 13</caption>
    <tr><th>step</th><th>n</th><th>n − 1</th><th>n &amp; (n − 1)</th><th>1 removed</th></tr>
    <tr><td>1</td><td>1101</td><td>1100</td><td>1100</td><td>VEG</td></tr>
    <tr><td>2</td><td>1100</td><td>1011</td><td>1000</td><td>CARD</td></tr>
    <tr><td>3</td><td>1000</td><td>0111</td><td>0000</td><td>LATE → stop, count 3</td></tr>
  </table>
  <p>Three loop steps for three features, whatever the number's width. Hamming distance between Dosa Hut and Chai Point = popcount(13 ^ 10) = popcount(0111) = 3.</p>
  <table class="tbl">
    <tr><th>Way</th><th>Code</th><th>Cost</th><th>Note</th></tr>
    <tr><td>String count</td><td><code>bin(n).count("1")</code></td><td>O(bits)</td><td>Short, works everywhere; fine in interviews if you also know a loop</td></tr>
    <tr><td>Built-in</td><td><code>n.bit_count()</code></td><td>O(bits), very fast</td><td>Python 3.10+; counts the magnitude for negatives</td></tr>
    <tr><td>Shift loop</td><td><code>c += n &amp; 1; n &gt;&gt;= 1</code></td><td>O(total bits)</td><td>Visits every bit, including zeros</td></tr>
    <tr><td>Brian Kernighan</td><td><code>n &amp;= n - 1; c += 1</code></td><td>O(number of 1s)</td><td>Jumps from 1 to 1; the expected answer</td></tr>
  </table>
  <p>For 128 (<code>10000000</code>) the shift loop runs 8 times; Kernighan runs once. That difference is the point of the trick.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Popcount</strong> (Hamming weight): the number of 1 bits in n. <strong>Hamming distance</strong> between a and b: popcount(a ^ b). Kernighan's loop is O(k) for k set bits.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Kernighan on a negative Python int never reaches 0 (infinite 1s). Mask first: <code>n &amp;= 0xFFFFFFFF</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>191 Number of 1 Bits</b>, <b>461 Hamming Distance</b>, <b>338 Counting Bits</b> (a DP over all i ≤ n), then <b>1356 Sort Integers by The Number of 1 Bits</b> and <b>477 Total Hamming Distance</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Power of Two &amp; Lowest Bit.</b> <code>n &amp; (n − 1)</code> removed one 1 per step. If a single step already gives 0, the number had exactly one 1. That is a one-line test for "exactly one feature", and for powers of two in general.</div>

  <h2 id="dsa-bt-tricks"><span class="num">07</span>Power of Two &amp; the Lowest Bit</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The ops team wants restaurants with exactly one feature (single-feature listings), and for each restaurant its "lowest" feature. Counting all the bits to see if the count is 1 works, but can a single expression answer it?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>power of two</b> / four", "exactly one bit set", "<b>lowest set bit</b>", "rightmost 1", "bitwise AND of a range", "Fenwick / binary indexed tree".</p>
  </div>
  <h3>x &amp; (x − 1): remove the lowest 1</h3>
  <p>From the last section: <code>x &amp; (x − 1)</code> wipes the lowest 1. A power of two has exactly one 1 bit (1, 10, 100, 1000 …), so wiping it leaves 0. Guard against 0 and negatives first.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><text x="20" y="34" class="tm">x</text><text x="20" y="68" class="tm">x - 1</text><text x="20" y="108" class="tb">x &amp; (x-1)</text><text x="20" y="150" class="tm">-x</text><text x="20" y="184" class="tg">x &amp; -x</text><rect x="140" y="14" width="36" height="28" class="fs"/><text x="158" y="34" text-anchor="middle">1</text><rect x="180" y="14" width="36" height="28" class="fs"/><text x="198" y="34" text-anchor="middle">1</text><rect x="220" y="14" width="36" height="28" class="fr sr"/><text x="238" y="34" text-anchor="middle">0</text><rect x="260" y="14" width="36" height="28" class="fr sr"/><text x="278" y="34" text-anchor="middle">0</text><text x="158" y="68" text-anchor="middle">1</text><text x="198" y="68" text-anchor="middle">0</text><text x="238" y="68" text-anchor="middle">1</text><text x="278" y="68" text-anchor="middle">1</text><rect x="140" y="88" width="36" height="28" class="fb sb"/><text x="158" y="108" text-anchor="middle">1</text><rect x="180" y="88" width="36" height="28" class="fb sb"/><text x="198" y="108" text-anchor="middle">0</text><rect x="220" y="88" width="36" height="28" class="fb sb"/><text x="238" y="108" text-anchor="middle">0</text><rect x="260" y="88" width="36" height="28" class="fb sb"/><text x="278" y="108" text-anchor="middle">0</text><text x="120" y="150" text-anchor="end" class="tm">…1</text><text x="158" y="150" text-anchor="middle">0</text><text x="198" y="150" text-anchor="middle">1</text><text x="238" y="150" text-anchor="middle">0</text><text x="278" y="150" text-anchor="middle">0</text><rect x="140" y="164" width="36" height="28" class="fg sg"/><text x="158" y="184" text-anchor="middle">0</text><rect x="180" y="164" width="36" height="28" class="fg sg"/><text x="198" y="184" text-anchor="middle">1</text><rect x="220" y="164" width="36" height="28" class="fg sg"/><text x="238" y="184" text-anchor="middle">0</text><rect x="260" y="164" width="36" height="28" class="fg sg"/><text x="278" y="184" text-anchor="middle">0</text><text x="330" y="34" class="tm">x = 12</text><text x="330" y="68" class="tm">lowest 1 → 0, zeros → 1</text><text x="330" y="108" class="tb">= 8: lowest 1 removed</text><text x="330" y="150" class="tm">= ~x + 1 (flip, add 1)</text><text x="330" y="184" class="tg">= 4: lowest 1 alone</text></svg><figcaption>For x = 12 (1100, Dosa Hut with VEG toggled off). x &amp; (x−1) wipes the lowest 1. x &amp; −x keeps only the lowest 1. Red boxes are the trailing zeros that both tricks rely on.</figcaption></figure>
  <h3>x &amp; −x: keep only the lowest 1</h3>
  <p>−x is ~x + 1. Flipping turns the trailing zeros into ones; adding 1 carries through them and stops at the first 0, which was x's lowest 1. So x and −x agree only at that one bit. This is the heart of the Fenwick tree (see the <a class="xref" data-note="dsa_advanced">Advanced Data Structures</a> note).</p>
<div class="fx" data-lang="py">x = 12                                       # 1100: Dosa Hut with VEG switched off
print(format(x - 1, "04b"), format(x &amp; (x - 1), "04b"))   # lowest 1 removed
print(format(x &amp; -x, "04b"))                 # lowest 1 isolated

def is_power_of_two(n):
    return n &gt; 0 and n &amp; (n - 1) == 0

print([n for n in range(-2, 70) if is_power_of_two(n)])
flags = {"Dosa Hut": 13, "Chai Point": 10, "Night Owl": 8, "Closed": 0}
print("exactly one feature:", [k for k, f in flags.items() if is_power_of_two(f)])
print("lowest feature of each:", {k: f &amp; -f for k, f in flags.items()})</div>
  <div class="fx" data-lang="text">1011 1000
0100
[1, 2, 4, 8, 16, 32, 64]
exactly one feature: ['Night Owl']
lowest feature of each: {'Dosa Hut': 1, 'Chai Point': 2, 'Night Owl': 8, 'Closed': 0}</div>
  <table class="tbl out"><caption>Trace: the two tricks on the flags</caption>
    <tr><th>x</th><th>binary</th><th>x &amp; (x − 1)</th><th>exactly one feature?</th><th>x &amp; −x (lowest feature)</th></tr>
    <tr><td>13 Dosa Hut</td><td>1101</td><td>1100</td><td>no</td><td>0001 VEG</td></tr>
    <tr><td>10 Chai Point</td><td>1010</td><td>1000</td><td>no</td><td>0010 FREE</td></tr>
    <tr><td>8 Night Owl</td><td>1000</td><td>0000</td><td>yes</td><td>1000 LATE</td></tr>
    <tr><td>12</td><td>1100</td><td>1000</td><td>no</td><td>0100 CARD</td></tr>
    <tr><td>0 Closed</td><td>0000</td><td>0000</td><td>no (guard x &gt; 0)</td><td>0</td></tr>
  </table>
  <h3>Template</h3>
<div class="fx" data-lang="text">is_pow2 = x &gt; 0 and x &amp; (x - 1) == 0
lowest  = x &amp; -x                 # e.g. Fenwick: i += i &amp; -i</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>x is a <strong>power of two</strong> iff it has exactly one 1 bit. The <strong>lowest set bit</strong> (lowbit) of x is <code>x &amp; −x</code>, the largest power of two that divides x.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>0 &amp; (0 − 1) == 0</code>, so a bare "x &amp; (x−1) == 0" says 0 is a power of two (and 0 has no features at all). Always add <code>x &gt; 0</code>.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>231 Power of Two</b>, <b>342 Power of Four</b> (one bit, and in an even position), <b>201 Bitwise AND of Numbers Range</b> (strip lowest bits until the ends agree).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Subsets via Bitmask.</b> Every trick so far looked at one restaurant's mask. The product team wants to test the search page with <em>every</em> combination of the filters VEG, FREE, CARD. How do we list all combinations without recursion?</div>

  <h2 id="dsa-bt-subsets"><span class="num">08</span>Subsets via Bitmask</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With 3 filters, how many combinations can a customer tick, and how do we loop over all of them? The Backtracking note did "all subsets" with recursion (include or skip). Is there a flatter way?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>all subsets</b> / combinations", "<b>n ≤ 20</b>" (or 15, 16), "choose any group", "visited set" in DP or BFS, "maximum over all selections".</p>
  </div>
  <p>Each subset is a yes/no choice per filter. Three yes/no choices are exactly three bits. So every number from 0 to 2³ − 1 = 7 is one subset, and counting from 0 to 7 lists them all.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An old car's odometer counting in binary: as it ticks from 000 to 111, every possible on/off pattern of the three digits appears exactly once.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600"><text x="20" y="30" class="tm">mask 5 =</text><rect x="110" y="10" width="44" height="30" class="fg sg"/><text x="132" y="31" text-anchor="middle">1</text><rect x="158" y="10" width="44" height="30" class="fs"/><text x="180" y="31" text-anchor="middle">0</text><rect x="206" y="10" width="44" height="30" class="fg sg"/><text x="228" y="31" text-anchor="middle">1</text><text x="132" y="62" text-anchor="middle" class="tm">bit 2</text><text x="180" y="62" text-anchor="middle" class="tm">bit 1</text><text x="228" y="62" text-anchor="middle" class="tm">bit 0</text><text x="132" y="88" text-anchor="middle" class="tg">CARD</text><text x="180" y="88" text-anchor="middle" class="tm">FREE</text><text x="228" y="88" text-anchor="middle" class="tg">VEG</text><text x="300" y="31">bit i on → filter i is ticked</text><text x="300" y="62">mask 5 → ['VEG', 'CARD']</text><text x="300" y="88" class="tm">masks 0..7 → all 8 filter combinations</text></svg><figcaption>A mask is a row of yes/no answers. Bit i decides whether filter i is ticked.</figcaption></figure>
<div class="fx" data-lang="py">filters = ["VEG", "FREE", "CARD"]
n = len(filters)
for mask in range(1 &lt;&lt; n):                   # 0 .. 2^n - 1
    ticked = [filters[i] for i in range(n) if mask &gt;&gt; i &amp; 1]
    print(format(mask, "03b"), ticked)</div>
  <div class="fx" data-lang="text">000 []
001 ['VEG']
010 ['FREE']
011 ['VEG', 'FREE']
100 ['CARD']
101 ['VEG', 'CARD']
110 ['FREE', 'CARD']
111 ['VEG', 'FREE', 'CARD']</div>
  <p>Now use each mask on the restaurants (Biryani Bros = 12, Salad Co = 7): which restaurants match all ticked filters?</p>
<div class="fx" data-lang="py">restaurants = {"Dosa Hut": 13, "Chai Point": 10, "Biryani Bros": 12, "Salad Co": 7}
n = 3                                        # VEG, FREE, CARD
for mask in range(1 &lt;&lt; n):
    match = [r for r, f in restaurants.items() if f &amp; mask == mask]
    print(format(mask, "03b"), len(match), match)</div>
  <div class="fx" data-lang="text">000 4 ['Dosa Hut', 'Chai Point', 'Biryani Bros', 'Salad Co']
001 2 ['Dosa Hut', 'Salad Co']
010 2 ['Chai Point', 'Salad Co']
011 1 ['Salad Co']
100 3 ['Dosa Hut', 'Biryani Bros', 'Salad Co']
101 2 ['Dosa Hut', 'Salad Co']
110 1 ['Salad Co']
111 1 ['Salad Co']</div>
  <p>Mask 000 (nothing ticked) matches all 4; mask 101 (VEG + CARD) matches Dosa Hut and Salad Co, as in section 04; 111 only Salad Co. 8 masks × 4 restaurants = 32 AND operations.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">for mask in range(1 &lt;&lt; n):                       # 2^n subsets
    subset = [items[i] for i in range(n) if mask &gt;&gt; i &amp; 1]</div>
  <p>Cost: 2ⁿ masks × n bit checks = O(n · 2ⁿ). For n = 20 that is about 20 million steps, the practical limit. Bitmasks also power <strong>bitmask DP</strong>: a state like "which cities are already visited" (Travelling Salesman) is one integer, so it can be a dict key or a list index.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A Python <code>set</code> of small integers 0..n−1 can be replaced by one int. Add = set bit, remove = clear bit, contains = check bit, union = <code>|</code>, intersection = <code>&amp;</code>. It is hashable and tiny, which is why DP solutions love it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Subset enumeration by bitmask</strong>: the numbers 0 … 2ⁿ − 1 are in one-to-one correspondence with the subsets of n items; bit i of the number says whether item i is included.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>n = 30 is a billion masks: too slow. When n is above about 20, bitmask enumeration is the wrong tool (prune with backtracking, or use DP / meet in the middle).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>78 Subsets</b> (in the Backtracking ladder; bitmask version in section 10), <b>318 Maximum Product of Word Lengths</b> (one mask of letters per word), <b>2397 Maximum Rows Covered by Columns</b>, <b>1601 Maximum Number of Achievable Transfer Requests</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Patterns.</b> We have every tool. In an interview the statement never says "use XOR" or "enumerate masks". Which words in a problem point to which trick?</div>

<h2 id="dsa-bt-patterns"><span class="num">09</span>Patterns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Eight sections gave eight tools. Faced with a new problem statement, which words should make us reach for which one?</p>
  </div>
  <div class="cards">
    <div><b>Pairs cancel → XOR</b><p>"Every element appears twice except one", "find the missing number", "find the duplicate".</p><small>XOR all values (and indexes)</small></div>
    <div><b>Count / test bits</b><p>"Number of 1 bits", "Hamming distance", "is power of two / four".</p><small>Kernighan, x &amp; (x-1)</small></div>
    <div><b>All subsets of small n</b><p>"All combinations", "n ≤ 20", "choose any group of items".</p><small>for mask in range(1 &lt;&lt; n)</small></div>
    <div><b>State as a mask</b><p>"Visited set" in DP / BFS when items ≤ 20, e.g. shortest path visiting all nodes.</p><small>dp[mask][i]</small></div>
    <div><b>No + or −</b><p>"Add without arithmetic operators": XOR is add-without-carry, AND + shift is the carry.</p><small>Mask to 32 bits in Python</small></div>
    <div><b>32-bit fixed width</b><p>"Reverse bits", "treat as unsigned", "overflow".</p><small>Loop exactly 32 times, mask with 0xFFFFFFFF</small></div>
  </div>
  <div class="flow"><span>Read the problem</span><span>Pairs or duplicates? → XOR</span><span>n ≤ 20 choices? → bitmask</span><span>"bits" or "32-bit"? → shift + mask</span></div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> A table of signals is not practice. Seven classic problems put each signal to work, with dry runs.</div>

  <h2 id="dsa-bt-problems"><span class="num">10</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can we combine the tools on the questions interviewers actually ask, including the fixed-width 32-bit ones that need section 03's masks?</p>
  </div>
  <h3>1. Single Number</h3>
  <p>Every value appears twice except one. Find it in O(n) time and O(1) extra space. Brute force: a Counter, O(n) space. Better: XOR everything, pairs cancel. It is the dispatch log from section 05.</p>
  <table class="tbl out"><caption>Dry run on [4, 1, 2, 1, 2]</caption>
    <tr><th>n</th><th>x before</th><th>x ^ n</th></tr>
    <tr><td>4</td><td>000</td><td>100 (4)</td></tr>
    <tr><td>1</td><td>100</td><td>101 (5)</td></tr>
    <tr><td>2</td><td>101</td><td>111 (7)</td></tr>
    <tr><td>1</td><td>111</td><td>110 (6)</td></tr>
    <tr><td>2</td><td>110</td><td>100 (4) → answer</td></tr>
  </table>
  <div class="fx" data-lang="py">def single_number(nums):
    x = 0
    for n in nums:
        x ^= n                     # pairs cancel to 0, the single one stays
    return x

for nums in [[2, 2, 1], [4, 1, 2, 1, 2], [1], [-3, 7, 7]]:
    print(nums, "-&gt;", single_number(nums))</div>
  <div class="fx" data-lang="text">[2, 2, 1] -&gt; 1
[4, 1, 2, 1, 2] -&gt; 4
[1] -&gt; 1
[-3, 7, 7] -&gt; -3</div>
  <p>Works for negatives too, because XOR rules hold for Python's infinite-sign representation. One-liner: <code>functools.reduce(operator.xor, nums)</code>.</p>

  <h3>2. Number of 1 Bits</h3>
  <p>Given an unsigned 32-bit integer, count its 1s. Kernighan's loop runs once per 1 bit.</p>
  <div class="fx" data-lang="py">def hamming_weight(n):
    count = 0
    while n:
        n &amp;= n - 1                 # Kernighan: each step kills one 1-bit
        count += 1
    return count

for n in [11, 128, 0, 4294967293]:
    print(n, "-&gt;", hamming_weight(n))</div>
  <div class="fx" data-lang="text">11 -&gt; 3
128 -&gt; 1
0 -&gt; 0
4294967293 -&gt; 31</div>
  <p>Time O(k) where k is the number of 1s (at most 32), space O(1). 4294967293 is <code>0xFFFFFFFD</code>: 32 ones minus one zero = 31.</p>

  <h3>3. Counting Bits</h3>
  <p>Return the popcount of every number from 0 to n. Calling the loop n times is O(n log n). Better: reuse earlier answers. <code>i &gt;&gt; 1</code> is i with its last bit dropped, and we already know its count. Add back the last bit <code>i &amp; 1</code>.</p>
  <table class="tbl out"><caption>Dry run up to 5</caption>
    <tr><th>i</th><th>binary</th><th>i &gt;&gt; 1</th><th>ans[i &gt;&gt; 1]</th><th>i &amp; 1</th><th>ans[i]</th></tr>
    <tr><td>1</td><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>
    <tr><td>2</td><td>10</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>
    <tr><td>3</td><td>11</td><td>1</td><td>1</td><td>1</td><td>2</td></tr>
    <tr><td>4</td><td>100</td><td>2</td><td>1</td><td>0</td><td>1</td></tr>
    <tr><td>5</td><td>101</td><td>2</td><td>1</td><td>1</td><td>2</td></tr>
  </table>
  <div class="fx" data-lang="py">def count_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1)   # i = (i // 2) shifted left, plus last bit
    return ans

for n in [0, 2, 5, 8]:
    print(n, "-&gt;", count_bits(n))</div>
  <div class="fx" data-lang="text">0 -&gt; [0]
2 -&gt; [0, 1, 1]
5 -&gt; [0, 1, 1, 2, 1, 2]
8 -&gt; [0, 1, 1, 2, 1, 2, 2, 3, 1]</div>
  <p>O(n) time, a small DP. Another valid recurrence: <code>ans[i] = ans[i &amp; (i - 1)] + 1</code> (drop the lowest 1, add one back).</p>

  <h3>4. Missing Number</h3>
  <p><code>nums</code> holds n distinct numbers from 0..n, one is missing. Two O(1)-space answers. Sum: expected total n(n+1)/2 minus the actual sum. XOR: XOR all indexes 0..n with all values; every present number appears twice and cancels.</p>
  <div class="fx" data-lang="py">def missing_number(nums):
    x = len(nums)                  # start with n (the index loop stops at n-1)
    for i, v in enumerate(nums):
        x ^= i ^ v                 # every number that is present cancels
    return x

def missing_number_sum(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)

for nums in [[3, 0, 1], [0, 1], [9, 6, 4, 2, 3, 5, 7, 0, 1], [0], [1]]:
    print(nums, "-&gt;", missing_number(nums), missing_number_sum(nums))</div>
  <div class="fx" data-lang="text">[3, 0, 1] -&gt; 2 2
[0, 1] -&gt; 2 2
[9, 6, 4, 2, 3, 5, 7, 0, 1] -&gt; 8 8
[0] -&gt; 1 1
[1] -&gt; 0 0</div>
  <p>Both are O(n) time. Interview note: in Java/C++ the sum can overflow for large n, the XOR version cannot. In Python both are safe.</p>

  <h3>5. Reverse Bits</h3>
  <p>Reverse the 32 bits of an unsigned integer. Picture two stacks of plates: take the top (last bit) of n, put it on out, 32 times. Even leading zeros must move, so loop exactly 32 times, not "while n".</p>
  <div class="fx" data-lang="py">def reverse_bits(n):
    out = 0
    for _ in range(32):
        out = (out &lt;&lt; 1) | (n &amp; 1)   # take n's last bit, add it to out's end
        n &gt;&gt;= 1
    return out

def reverse_bits_str(n):
    return int(format(n, "032b")[::-1], 2)

for n in [43261596, 4294967293, 1, 0]:
    print(n, "-&gt;", reverse_bits(n), reverse_bits_str(n))</div>
  <div class="fx" data-lang="text">43261596 -&gt; 964176192 964176192
4294967293 -&gt; 3221225471 3221225471
1 -&gt; 2147483648 2147483648
0 -&gt; 0 0</div>
  <p>O(32) = O(1). The string version is a nice cross-check. Follow-up "called many times?": cache the reverse of each byte (256 entries) and reverse 4 bytes at a time.</p>

  <h3>6. Sum of Two Integers (without + or −)</h3>
  <p>Think of school addition. Adding column by column without carry is XOR (1+1 = 0, carry). The carry appears where both bits are 1 (<code>a &amp; b</code>), and moves one place left. Repeat until there is no carry.</p>
  <table class="tbl out"><caption>Dry run 2 + 3 (010 + 011)</caption>
    <tr><th>step</th><th>a</th><th>b (carry)</th><th>a ^ b</th><th>(a &amp; b) &lt;&lt; 1</th></tr>
    <tr><td>1</td><td>010</td><td>011</td><td>001</td><td>100</td></tr>
    <tr><td>2</td><td>001</td><td>100</td><td>101</td><td>000 → stop, answer 101 = 5</td></tr>
  </table>
  <p>In Python, with a negative number the carry keeps moving left forever (infinite 1s). So we work inside 32 bits with a mask, and convert back at the end: if the result is above <code>0x7FFFFFFF</code> it is a negative pattern, and <code>~(a ^ MASK)</code> turns it into the matching Python negative.</p>
  <div class="fx" data-lang="py">MASK = 0xFFFFFFFF                    # 32 ones
MAX_INT = 0x7FFFFFFF

def get_sum(a, b):
    a, b = a &amp; MASK, b &amp; MASK
    while b:
        carry = ((a &amp; b) &lt;&lt; 1) &amp; MASK   # where both are 1, a carry moves left
        a = a ^ b                       # add without carry
        b = carry
    return a if a &lt;= MAX_INT else ~(a ^ MASK)   # turn the 32-bit pattern back to a Python int

for a, b in [(1, 2), (2, 3), (-1, 1), (-5, -7), (-12, 7), (1000, -1)]:
    print(a, b, "-&gt;", get_sum(a, b))</div>
  <div class="fx" data-lang="text">1 2 -&gt; 3
2 3 -&gt; 5
-1 1 -&gt; 0
-5 -7 -&gt; -12
-12 7 -&gt; -5
1000 -1 -&gt; 999</div>
  <p>At most 32 rounds, O(1). The mask is the whole difficulty in Python; in Java the same loop without masks just works because ints are 32-bit.</p>

  <h3>7. Subsets (bitmask version)</h3>
  <p>Return all subsets of distinct numbers. Backtracking is the other classic answer (see the Backtracking note). The bitmask version is shorter: mask k is subset k.</p>
  <div class="fx" data-lang="py">def subsets(nums):
    n = len(nums)
    out = []
    for mask in range(1 &lt;&lt; n):
        out.append([nums[i] for i in range(n) if mask &amp; (1 &lt;&lt; i)])
    return out

print(subsets([1, 2, 3]))
print(subsets([0]))
print(len(subsets(list(range(10)))))</div>
  <div class="fx" data-lang="text">[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
[[], [0]]
1024</div>
  <p>O(n · 2ⁿ) time and output size. <code>mask &amp; (1 &lt;&lt; i)</code> is a non-zero number (not exactly 1) when bit i is set, which is fine inside <code>if</code>.</p>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The solutions are short, which makes their bugs easy to miss: precedence, negatives, and fixed-width loops.</div>

  <h2 id="dsa-bt-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which one-character slips (precedence, a missing mask, a missing x &gt; 0) turn a correct bit idea into a wrong answer or an endless loop?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: precedence</span>
    <p><code>1 &lt;&lt; n - 1</code> is <code>1 &lt;&lt; (n-1)</code> because <code>-</code> binds tighter. <code>a + b &gt;&gt; 1</code> is <code>(a+b) &gt;&gt; 1</code>. <code>x &amp; mask == 0</code> is fine in Python but wrong in C/Java. Bracket every bit expression.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: negative numbers loop forever</span>
    <p><code>while n: n &gt;&gt;= 1</code> with n = −1 never stops, and <code>n &amp;= n - 1</code> on a negative also never reaches 0. Mask to 32 bits first when the problem talks about fixed-width integers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading bin() of a negative</span>
    <p><code>bin(-5)</code> is <code>'-0b101'</code>. To see the real 32-bit pattern use <code>format(-5 &amp; 0xFFFFFFFF, "032b")</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the 0 case</span>
    <p><code>0 &amp; (0 - 1) == 0</code>, so a bare "x &amp; (x-1) == 0" says 0 is a power of two. Always add <code>x &gt; 0</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ~ as "flip the bits I see"</span>
    <p><code>~5</code> is not <code>010</code> (2). It is −6, because the infinite zeros flip too. To flip only the low k bits use <code>x ^ ((1 &lt;&lt; k) - 1)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: stopping Reverse Bits early</span>
    <p>Looping "while n" drops the leading zeros, which must become trailing zeros. Fixed-width problems need a fixed number of iterations.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have all the pieces. How does each grow out of the one before, and what does each give on Dosa Hut's 13 and Chai Point's 10?</div>

  <h2 id="dsa-bt-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Binary, the six operators, negatives, single-bit moves, XOR, popcount, power of two, lowest bit and subset masks: how is each built from the ones before, and what does each give on Dosa Hut (13) and Chai Point (10)?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 224" width="660">
<defs><marker id="dsa-bt-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="210" y1="32" x2="230" y2="32" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="430" y1="32" x2="450" y2="32" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="380" y1="54" x2="500" y2="88" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="450" y1="110" x2="430" y2="110" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="230" y1="110" x2="210" y2="110" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="110" y1="132" x2="110" y2="166" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<line x1="500" y1="132" x2="380" y2="166" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>

<line x1="430" y1="188" x2="450" y2="188" stroke="currentColor" marker-end="url(#dsa-bt-a9)"/>
<rect x="10" y="10" width="200" height="44" rx="7" class="fb sb"/>
<text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">binary</text>
<text x="110" y="45" text-anchor="middle" class="tm" font-size="10">13 = 8 + 4 + 1 = 1101</text>
<rect x="230" y="10" width="200" height="44" rx="7" class="fb sb"/>
<text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">&amp; | ^ ~ &lt;&lt; &gt;&gt;</text>
<text x="330" y="45" text-anchor="middle" class="tm" font-size="10">13 &amp; 10 = 8, 13 ^ 10 = 7</text>
<rect x="450" y="10" width="200" height="44" rx="7" class="ft st"/>
<text x="550" y="29" text-anchor="middle" font-size="11.5" font-weight="700">negatives (~)</text>
<text x="550" y="45" text-anchor="middle" class="tm" font-size="10">~13 = −14, mask 0xFFFFFFFF</text>
<rect x="450" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="550" y="107" text-anchor="middle" font-size="11.5" font-weight="700">one bit: 1 &lt;&lt; i</text>
<text x="550" y="123" text-anchor="middle" class="tm" font-size="10">set FREE → 15, clear LATE → 5</text>
<rect x="230" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">XOR tricks</text>
<text x="330" y="123" text-anchor="middle" class="tm" font-size="10">log [4,1,2,1,2] → 4</text>
<rect x="10" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="110" y="107" text-anchor="middle" font-size="11.5" font-weight="700">count bits (Kernighan)</text>
<text x="110" y="123" text-anchor="middle" class="tm" font-size="10">13 → 3 steps</text>
<rect x="10" y="166" width="200" height="44" rx="7" class="fg sg"/>
<text x="110" y="185" text-anchor="middle" font-size="11.5" font-weight="700">power of two, x &amp; −x</text>
<text x="110" y="201" text-anchor="middle" class="tm" font-size="10">8 yes, 13 no; 12 &amp; −12 = 4</text>
<rect x="230" y="166" width="200" height="44" rx="7" class="fg sg"/>
<text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">subsets via mask</text>
<text x="330" y="201" text-anchor="middle" class="tm" font-size="10">3 filters → 8 masks</text>
<rect x="450" y="166" width="200" height="44" rx="7" class="fv"/>
<text x="550" y="185" text-anchor="middle" font-size="11.5" font-weight="700">patterns → DP, Fenwick</text>
<text x="550" y="201" text-anchor="middle" class="tm" font-size="10">dp[mask], i += i &amp; −i</text>
</svg><figcaption>Blue: representation and the operators. Gold: the Python detail that makes ~ and negatives behave. Green: tricks built from <code>1 &lt;&lt; i</code> and from <code>x &amp; (x − 1)</code>. Purple: where bits are used next (bitmask DP, Fenwick trees, fast power).</figcaption></figure>
  <table class="tbl"><caption>Every concept on the flags VEG = 1, FREE = 2, CARD = 4, LATE = 8; Dosa Hut 13 = 1101, Chai Point 10 = 1010</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Binary</td><td>place values 2ⁱ</td><td>store yes/no features in one int?</td><td>13 = 8 + 4 + 1</td><td>flags, permissions, small sets</td></tr>
    <tr><td>&amp; | ^</td><td>column rules</td><td>shared / any / different features?</td><td>8, 15, 7</td><td>combine and compare masks</td></tr>
    <tr><td>~ and negatives</td><td>two's complement, infinite 1s</td><td>why ~13 = −14?</td><td>~13 = −14; 13 ^ 1111 = 0010</td><td>32-bit problems: mask 0xFFFFFFFF</td></tr>
    <tr><td>One bit</td><td><code>1 &lt;&lt; i</code> + an operator</td><td>read / change one feature?</td><td>FREE? 0; set → 15; clear LATE → 5; toggle VEG → 12</td><td>flags, letter masks, filters</td></tr>
    <tr><td>XOR tricks</td><td>x ^ x = 0, x ^ 0 = x</td><td>which item appears once? what changed?</td><td>log → 4; 13 ^ 9 = 0100</td><td>pairs cancel, missing number, prefix XOR</td></tr>
    <tr><td>Kernighan count</td><td>x &amp; (x − 1) drops the lowest 1</td><td>how many features?</td><td>13 → 3 steps; distance(13, 10) = 3</td><td>popcount, Hamming distance</td></tr>
    <tr><td>Power of two / lowbit</td><td>x &amp; (x − 1), x &amp; −x</td><td>exactly one feature? lowest one?</td><td>8 yes, 13 no; 12 &amp; −12 = 4</td><td>pow2 tests, Fenwick tree</td></tr>
    <tr><td>Subset masks</td><td>count 0 … 2ⁿ − 1</td><td>all filter combinations?</td><td>3 filters → 8 masks</td><td>n ≤ 20, bitmask DP</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>an int is a set of small numbers; AND/OR/XOR are intersection/union/difference, <code>1 &lt;&lt; i</code> aims at one element, <code>x &amp; (x − 1)</code> and <code>x &amp; −x</code> peel elements off from the bottom, and counting from 0 to 2ⁿ − 1 visits every subset.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_math">Math &amp; Number Theory</a>: the same bits drive fast exponentiation (x¹³ = x⁸·x⁴·x¹ because 13 = 1101), and modular arithmetic keeps the huge numbers it produces small.</div>

  <h2 id="dsa-bt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: VEG = 1, FREE = 2, CARD = 4, LATE = 8. <b>Dosa Hut = 13 = 1101</b> (veg, card, late); <b>Chai Point = 10 = 1010</b> (free, late); dispatch log [4, 1, 2, 1, 2].</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Binary</td><td>4 features in one int?</td><td>13 = 1101</td><td>how to combine two?</td></tr>
    <tr><td>Operators</td><td>shared / any / differ?</td><td>&amp; 8, | 15, ^ 7, &lt;&lt;2 52, &gt;&gt;2 3</td><td>~13 = −14 is puzzling</td></tr>
    <tr><td>Negatives</td><td>what is −x in bits?</td><td>~x = −x − 1; mask 0xFFFFFFFF</td><td>need one bit, not all</td></tr>
    <tr><td>One bit</td><td>read / set / clear / toggle bit i?</td><td>0; 15; 5; 12</td><td>XOR can do more</td></tr>
    <tr><td>XOR</td><td>which id appears once?</td><td>4</td><td>how many 1s?</td></tr>
    <tr><td>Kernighan</td><td>count 1s fast?</td><td>3 steps for 13</td><td>"exactly one 1"?</td></tr>
    <tr><td>Pow2 / lowbit</td><td>one feature? lowest?</td><td>8 yes; 12 &amp; −12 = 4</td><td>all combinations?</td></tr>
    <tr><td>Subsets</td><td>every filter combo?</td><td>8 masks</td><td>→ patterns, DP</td></tr>
  </table>
  <h3>Formulas and templates</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Value</td><td>n = Σ bitᵢ · 2ⁱ</td><td>bit 0 = rightmost; k bits hold 0 … 2ᵏ − 1</td></tr>
    <tr><td>Check / set / clear / toggle</td><td><code>(n&gt;&gt;i)&amp;1</code>, <code>n|(1&lt;&lt;i)</code>, <code>n&amp;~(1&lt;&lt;i)</code>, <code>n^(1&lt;&lt;i)</code></td><td>i = bit index</td></tr>
    <tr><td>All / any of a mask</td><td><code>n &amp; m == m</code> / <code>n &amp; m != 0</code></td><td>m = OR of the wanted bits</td></tr>
    <tr><td>Low k bits</td><td><code>n &amp; ((1 &lt;&lt; k) − 1)</code></td><td>(1 &lt;&lt; k) − 1 = k ones</td></tr>
    <tr><td>Negation</td><td>−x = ~x + 1, so ~x = −x − 1</td><td>32-bit view: x &amp; 0xFFFFFFFF</td></tr>
    <tr><td>Shifts</td><td>x &lt;&lt; k = x·2ᵏ; x &gt;&gt; k = ⌊x / 2ᵏ⌋</td><td>floor also for negatives</td></tr>
    <tr><td>XOR rules</td><td>x ^ x = 0, x ^ 0 = x, any order</td><td>single number = XOR of all</td></tr>
    <tr><td>Kernighan</td><td>while n: n &amp;= n − 1; c += 1</td><td>O(number of 1s)</td></tr>
    <tr><td>Power of two</td><td>x &gt; 0 and x &amp; (x − 1) == 0</td><td>lowbit = x &amp; −x</td></tr>
    <tr><td>Subsets</td><td>for mask in range(1 &lt;&lt; n): bit i → item i</td><td>O(n · 2ⁿ), n ≤ 20</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>XOR</b><p>Pairs cancel, missing number, what changed, prefix XOR.</p><small>Not when items repeat an odd number of times (count per bit)</small></div>
    <div><b>Masks as sets</b><p>Up to ~64 flags, letters of a word, visited sets in DP.</p><small>Not for large or sparse universes (use a set)</small></div>
    <div><b>Subset enumeration</b><p>All combinations when n ≤ 20.</p><small>Not for n = 30+ (2³⁰ masks)</small></div>
    <div><b>Kernighan / pow2</b><p>Popcount, Hamming distance, one-bit tests, Fenwick lowbit.</p><small>Not on negative Python ints without masking</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Precedence (<code>1 &lt;&lt; n - 1</code>, bracket everything); negative numbers loop forever in <code>while n</code>; <code>bin(-5)</code> is not the stored pattern; 0 is not a power of two; <code>~5</code> is −6, flip low bits with XOR; <code>n &amp; (1 &lt;&lt; i)</code> is 0 or 2ⁱ, not 0 or 1; fixed-width problems need exactly 32 iterations; XOR swap breaks on the same slot.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>13 &amp; 10, 13 | 10, 13 ^ 10?</td><td>8, 15, 7</td></tr>
    <tr><td>Turn off LATE (bit 3) in 13.</td><td><code>13 &amp; ~(1 &lt;&lt; 3)</code> = 5 (0101)</td></tr>
    <tr><td>XOR of [4, 1, 2, 1, 2]?</td><td>4</td></tr>
    <tr><td>How many loop steps does Kernighan take on 13, and why?</td><td>3: one per 1 bit (1101 → 1100 → 1000 → 0)</td></tr>
    <tr><td>What is ~13 in Python and how do you get "the features Dosa Hut lacks"?</td><td>−14; use <code>13 ^ 0b1111</code> = 0010 (FREE)</td></tr>
  </table>

  
<h2 id="dsa-bt-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is 13 in binary, and what is bit 2 of 13?</summary><div class="qa-body"><code>1101</code> (8 + 4 + 1). Bit 2 (place value 4) is 1: <code>(13 &gt;&gt; 2) &amp; 1 == 1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write check, set, clear and toggle for bit i.</summary><div class="qa-body">Check <code>(n &gt;&gt; i) &amp; 1</code>, set <code>n | (1 &lt;&lt; i)</code>, clear <code>n &amp; ~(1 &lt;&lt; i)</code>, toggle <code>n ^ (1 &lt;&lt; i)</code>. All O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does x &amp; (x − 1) do, and name two uses.</summary><div class="qa-body">It clears the lowest set bit. Uses: power-of-two test (<code>x &gt; 0 and x &amp; (x-1) == 0</code>) and Kernighan's bit count (loop until 0, one step per 1 bit).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does x &amp; −x return for x = 12? Where is it used?</summary><div class="qa-body">4 (<code>100</code>), the lowest set bit alone. It is how a Fenwick tree jumps between nodes: <code>i += i &amp; -i</code> to update, <code>i -= i &amp; -i</code> to query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is ~5 equal to −6 in Python?</summary><div class="qa-body">Python ints behave like two's complement with infinite width. Flipping every bit of 5 also flips the infinite leading zeros into ones, which is a negative number. In two's complement −x = ~x + 1, so ~x = −x − 1 = −6.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get the 32-bit unsigned view of a negative int, and convert back?</summary><div class="qa-body"><code>u = x &amp; 0xFFFFFFFF</code>. Back: <code>u - (1 &lt;&lt; 32) if u &amp; 0x80000000 else u</code>, or <code>~(u ^ 0xFFFFFFFF)</code> when u &gt; 0x7FFFFFFF.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does XOR find the single number? Does order matter?</summary><div class="qa-body">x ^ x = 0 and x ^ 0 = x, and XOR is commutative and associative, so the order does not matter: all pairs reduce to 0 and only the single value remains. O(n) time, O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare ways to count 1 bits.</summary><div class="qa-body"><code>bin(n).count("1")</code> (simple), <code>n.bit_count()</code> (3.10+, fastest), shift loop O(total bits), Kernighan O(number of set bits). For all numbers 0..n use the DP <code>ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many subsets does a 20-item set have, and is bitmask enumeration practical?</summary><div class="qa-body">2²⁰ ≈ 1 million subsets; with n work each, about 20 million steps: OK in Python in a few seconds. At n = 30 it is a billion subsets, too many; you need pruning or a smarter idea (meet in the middle, DP).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you add two integers with no + or −, and why is Python harder?</summary><div class="qa-body">Sum without carry = <code>a ^ b</code>; carry = <code>(a &amp; b) &lt;&lt; 1</code>; repeat until carry is 0. In Python a negative carry never dies because ints are unbounded, so mask every step with <code>0xFFFFFFFF</code> and convert the final 32-bit pattern back to signed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the output? <code>print(6 &amp; 3, 6 | 3, 6 ^ 3, 6 &lt;&lt; 1, 6 &gt;&gt; 1, -7 &gt;&gt; 1)</code></summary><div class="qa-body"><code>2 7 5 12 3 -4</code>. 110 &amp; 011 = 010, | = 111, ^ = 101. Right shift is floor division, so −7 &gt;&gt; 1 = floor(−3.5) = −4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name three real uses of bitmasks.</summary><div class="qa-body">Unix file permissions (rwx = 4+2+1), feature flags and enum flags packed in one integer, IP subnet masks, chess bitboards, Bloom filters, and bitsets for fast set operations in databases (bitmap indexes).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the power-of-two test reuse Kernighan's step, and what breaks if you skip the x &gt; 0 guard?</summary><div class="qa-body"><code>x &amp; (x − 1)</code> removes exactly one 1 bit. Kernighan repeats it to count; the power-of-two test does it once and asks "anything left?". Without <code>x &gt; 0</code>, 0 passes (0 &amp; −1 = 0) and negatives behave oddly, so "Closed" (flags 0) would count as "exactly one feature".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must you understand Python negatives before using ~ to clear a bit?</summary><div class="qa-body"><code>~(1 &lt;&lt; 3)</code> is −9: infinitely many 1s except bit 3. ANDed with 13 it keeps every bit except LATE, giving 5. That only makes sense once you know ~ flips the infinite leading zeros too; otherwise you might expect <code>~1000 = 0111</code> and think it also clears higher bits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are subset masks related to the Backtracking note's include/skip recursion?</summary><div class="qa-body">Both list all 2ⁿ subsets. Recursion makes the include/skip decision for item i at depth i; a mask makes it in bit i. The bitmask loop is flatter and gives each subset a number (useful as a DP state); recursion can prune early, which masks cannot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: x &amp; −x gives the lowest set bit. Which later structure depends on it?</summary><div class="qa-body">The Fenwick tree (Advanced Data Structures): node i covers lowbit(i) elements, and updates/queries move with <code>i += i &amp; -i</code> / <code>i -= i &amp; -i</code>, each step O(1), log n steps in total.</div></details>
</main>
`
});
