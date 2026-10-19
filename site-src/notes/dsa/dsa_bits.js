// notes/dsa/dsa_bits.js — Bit Manipulation
Object.assign(TOPIC_CONTENT, {
  "dsa_bits": `<main>
<h1>Bit Manipulation</h1>
  <p class="lead">Every integer is a row of 0s and 1s. Bit manipulation means working on that row directly: switch one bit on, test another, cancel pairs with XOR. It gives O(1) tricks, tiny memory, and a handful of interview questions that look impossible until you see the bits. Needs only integers and loops.</p>

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
      <div class="rm-item rm-done" data-target="dsa-bt-binary"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Binary Refresher</span><span class="rm-sub">Light switches and place values</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-ops"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Six Operators</span><span class="rm-sub">&amp; | ^ ~ &lt;&lt; &gt;&gt;</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-neg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Python Ints &amp; Negatives</span><span class="rm-sub">~x = -x-1, masking with 0xFFFFFFFF</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-single"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">One Bit at a Time</span><span class="rm-sub">Check, set, clear, toggle</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-tricks"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Famous Tricks</span><span class="rm-sub">x&amp;(x-1), x&amp;-x, XOR</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-count"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Counting 1 Bits</span><span class="rm-sub">Three ways, one winner</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-subsets"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Subsets via Bitmask</span><span class="rm-sub">Every number is a selection</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-patterns"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-problems"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">7 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Precedence, negatives, 32-bit</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bt-binary"><span class="num">01</span>Binary Refresher</h2>
  <p>You already know base 10. In 352, the 3 means "3 hundreds", the 5 means "5 tens", the 2 means "2 ones". Each place is 10 times the one to its right.</p>
  <p>Binary (base 2) is the same idea with only two digits, 0 and 1. Each place is 2 times the one to its right: 1, 2, 4, 8, 16, 32 … A computer stores every integer this way, because a wire is either off (0) or on (1).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A switchboard in an Indian home with 8 switches in a row. Each switch is a <strong>bit</strong>. The rightmost switch is worth 1, the next 2, then 4, 8 and so on. The number is the total of the switches that are on.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600"><text x="20" y="40" class="tm">value</text><text x="20" y="80" class="tm">bit</text><text x="20" y="128" class="tm">adds</text><text x="90" y="40" text-anchor="middle" class="tm">128</text><rect x="62" y="56" width="56" height="36" class="fs"/><text x="90" y="80" text-anchor="middle">0</text><text x="150" y="40" text-anchor="middle" class="tm">64</text><rect x="122" y="56" width="56" height="36" class="fs"/><text x="150" y="80" text-anchor="middle">0</text><text x="210" y="40" text-anchor="middle" class="tm">32</text><rect x="182" y="56" width="56" height="36" class="fs"/><text x="210" y="80" text-anchor="middle">0</text><text x="270" y="40" text-anchor="middle" class="tm">16</text><rect x="242" y="56" width="56" height="36" class="fs"/><text x="270" y="80" text-anchor="middle">0</text><text x="330" y="40" text-anchor="middle" class="tm">8</text><rect x="302" y="56" width="56" height="36" class="fg sg"/><text x="330" y="80" text-anchor="middle">1</text><text x="390" y="40" text-anchor="middle" class="tm">4</text><rect x="362" y="56" width="56" height="36" class="fg sg"/><text x="390" y="80" text-anchor="middle">1</text><text x="450" y="40" text-anchor="middle" class="tm">2</text><rect x="422" y="56" width="56" height="36" class="fs"/><text x="450" y="80" text-anchor="middle">0</text><text x="510" y="40" text-anchor="middle" class="tm">1</text><rect x="482" y="56" width="56" height="36" class="fg sg"/><text x="510" y="80" text-anchor="middle">1</text><text x="330" y="128" text-anchor="middle" class="tg">8</text><text x="390" y="128" text-anchor="middle" class="tg">+4</text><text x="510" y="128" text-anchor="middle" class="tg">+1</text><text x="300" y="160" text-anchor="middle">00001101 = 8 + 4 + 1 = 13</text><text x="90" y="18" text-anchor="middle" class="tm">bit 7</text><text x="510" y="18" text-anchor="middle" class="tm">bit 0</text></svg><figcaption>13 as eight switches. Green switches are on. Bits are numbered from the right, starting at 0.</figcaption></figure>
  <p>To convert 13 to binary by hand: the largest place value ≤ 13 is 8 (13 − 8 = 5), then 4 (5 − 4 = 1), skip 2, then 1. Places used: 8, 4, 1 → <code>1101</code>.</p>
  <p>Python helps in both directions:</p>
  <div class="fx" data-lang="py">for n in [5, 6, 13, 255]:
    print(n, bin(n), format(n, "08b"))
print(int("1101", 2), 0b1101, 0xFF, hex(255))
print((13).bit_length(), (255).bit_length(), (256).bit_length())</div>
  <div class="fx" data-lang="text">5 0b101 00000101
6 0b110 00000110
13 0b1101 00001101
255 0b11111111 11111111
13 13 255 0xff
4 8 9</div>
  <p><code>bit_length()</code> is "how many bits do I need": 13 needs 4, 255 needs 8, 256 needs 9. A number with k bits is at most 2ᵏ − 1, so 8 bits hold 0 to 255 (one byte).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bit i</strong> of n is the digit in place value 2ⁱ. Bit 0 is the rightmost (the "ones" place), also called the <strong>least significant bit</strong>. The leftmost 1 is the <strong>most significant bit</strong>. A <strong>mask</strong> is a number whose 1s mark the bits you care about.</p>
  </div>
  <p>Where you meet it: file permissions (<code>chmod 755</code> is three 3-bit masks), feature flags packed into one integer, IP subnet masks (<code>255.255.255.0</code>), chess engines (one 64-bit number per piece type), Bloom filters, compression, and any "visited" set over 20 or fewer items in DP.</p>

  <h2 id="dsa-bt-ops"><span class="num">02</span>The Six Operators</h2>
  <p>Bitwise operators work on each column of bits separately, like adding two numbers digit by digit but with no carry. Line the numbers up on the right and apply a rule per column.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600"><text x="20" y="20" class="tm">a = 12</text><text x="20" y="44" class="tm">b = 10</text><text x="100" y="20">1 1 0 0</text><text x="100" y="44">1 0 1 0</text><line x1="96" y1="54" x2="170" y2="54" stroke="currentColor"/><text x="20" y="76" class="tb">a &amp; b</text><text x="100" y="76" class="tb">1 0 0 0</text><text x="200" y="76" class="tm">= 8   1 only where both are 1</text><text x="20" y="104" class="tg">a | b</text><text x="100" y="104" class="tg">1 1 1 0</text><text x="200" y="104" class="tm">= 14  1 where either is 1</text><text x="20" y="132" class="tr">a ^ b</text><text x="100" y="132" class="tr">0 1 1 0</text><text x="200" y="132" class="tm">= 6   1 where they differ</text><text x="20" y="168">a &lt;&lt; 2 = 110000 (48)</text><text x="300" y="168">a &gt;&gt; 2 = 11 (3)</text></svg><figcaption>Each operator looks at one column at a time. Shifts slide the whole row left (adding zeros) or right (dropping bits).</figcaption></figure>
  <table class="tbl">
    <tr><th>Op</th><th>Name</th><th>Column rule</th><th>Everyday use</th></tr>
    <tr><td><code>&amp;</code></td><td>AND</td><td>1 if both are 1</td><td>Test a bit, keep only some bits (mask)</td></tr>
    <tr><td><code>|</code></td><td>OR</td><td>1 if at least one is 1</td><td>Switch a bit on, combine flags</td></tr>
    <tr><td><code>^</code></td><td>XOR</td><td>1 if the two differ</td><td>Toggle a bit, find "the odd one out"</td></tr>
    <tr><td><code>~</code></td><td>NOT</td><td>flip every bit</td><td>Build "everything except bit i"</td></tr>
    <tr><td><code>&lt;&lt; k</code></td><td>left shift</td><td>slide left, fill with 0</td><td><code>1 &lt;&lt; i</code> = a mask with only bit i; x·2ᵏ</td></tr>
    <tr><td><code>&gt;&gt; k</code></td><td>right shift</td><td>slide right, drop bits</td><td>Bring bit i to position 0; x // 2ᵏ</td></tr>
  </table>
  <div class="fx" data-lang="py">a, b = 12, 10                     # 1100 and 1010
print(f"a &amp; b  = {a &amp; b:2}  {a &amp; b:04b}")
print(f"a | b  = {a | b:2}  {a | b:04b}")
print(f"a ^ b  = {a ^ b:2}  {a ^ b:04b}")
print(f"~a     = {~a}")
print(f"a &lt;&lt; 2 = {a &lt;&lt; 2}  {a &lt;&lt; 2:06b}")
print(f"a &gt;&gt; 2 = {a &gt;&gt; 2:2}  {a &gt;&gt; 2:04b}")</div>
  <div class="fx" data-lang="text">a &amp; b  =  8  1000
a | b  = 14  1110
a ^ b  =  6  0110
~a     = -13
a &lt;&lt; 2 = 48  110000
a &gt;&gt; 2 =  3  0011</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Think of AND as a <strong>filter</strong> (keeps a bit only if the mask allows it), OR as a <strong>switch-on</strong>, XOR as a <strong>flip</strong>. Shifts are fast ×2 and ÷2. With these four ideas you can read almost any bit trick.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Operator precedence. In Python, arithmetic (<code>+ -</code>) binds tighter than shifts (<code>&lt;&lt; &gt;&gt;</code>), shifts tighter than <code>&amp;</code>, then <code>^</code>, then <code>|</code>, and comparisons like <code>==</code> come last. So <code>1 &lt;&lt; n - 1</code> means <code>1 &lt;&lt; (n - 1)</code>, and <code>x &amp; 1 == 0</code> means <code>(x &amp; 1) == 0</code>. In C and Java that last one is <code>x &amp; (1 == 0)</code>. When in doubt, add brackets.</p>
  </div>

  <h2 id="dsa-bt-neg"><span class="num">03</span>Python Ints &amp; Negatives</h2>
  <p>In C, Java or Go an <code>int</code> is a box of exactly 32 (or 64) switches. Add 1 to the biggest value and it wraps to a negative number (overflow). Python is different: an int grows as big as it needs. <code>2 ** 100</code> just works.</p>
  <p>So how does Python store −5? Computers use <strong>two's complement</strong>: to get −x, flip all bits of x and add 1. In a 32-bit box, −1 is 32 ones, −5 is <code>11111111 … 11111011</code>. Python pretends a negative number has <strong>infinitely many</strong> leading 1s. That keeps all the bit rules consistent, but it means there is no "top bit" to look at.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An old car odometer with 6 digits rolls from 999999 to 000000. Going backwards from 000000 gives 999999, which acts like −1. Two's complement is the same with binary digits. Python's odometer has endless digits, so it never rolls over, and a negative number is "999…" forever to the left.</p>
  </div>
  <div class="fx" data-lang="py">print(~5, -5 - 1)                 # ~x is always -x - 1
print(bin(-5))                    # Python shows sign + magnitude, not two's complement
print(-5 &amp; 0xFFFFFFFF, hex(-5 &amp; 0xFFFFFFFF))   # the 32-bit pattern of -5
print(2 ** 100 &gt; 0, (1 &lt;&lt; 64) - 1)
print(-8 &gt;&gt; 1, -1 &gt;&gt; 10)          # right shift of a negative rounds down

def to_signed32(x):
    x &amp;= 0xFFFFFFFF                    # keep the low 32 bits
    return x - (1 &lt;&lt; 32) if x &amp; 0x80000000 else x   # top bit set = negative

print(to_signed32(0xFFFFFFFB), to_signed32(0x7FFFFFFF), to_signed32(0x80000000))</div>
  <div class="fx" data-lang="text">-6 -6
-0b101
4294967291 0xfffffffb
True 18446744073709551615
-4 -1
-5 2147483647 -2147483648</div>
  <p>Read the lines one by one:</p>
  <ul>
    <li><code>~5</code> flips every bit, including the infinite zeros on the left, which become infinite ones. That is −6. The rule <strong><code>~x == -x - 1</code></strong> always holds.</li>
    <li><code>bin(-5)</code> prints a minus sign and the size. It does not show the stored bits.</li>
    <li><code>-5 &amp; 0xFFFFFFFF</code> keeps only the low 32 bits, giving the 32-bit pattern as a big positive number (4294967291 = <code>0xfffffffb</code>). This is how you simulate a 32-bit machine.</li>
    <li><code>-8 &gt;&gt; 1</code> is −4 and <code>-1 &gt;&gt; 10</code> stays −1: right shift is floor division by 2ᵏ, and the leading 1s keep coming in.</li>
    <li><code>to_signed32</code> goes back: if bit 31 is set, the pattern means a negative number, so subtract 2³².</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Two's complement</strong>: the standard way to store signed integers. −x = (~x) + 1. In n bits the range is −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1, and the top bit means "negative". <code>0xFFFFFFFF</code> is 32 ones; <code>0x7FFFFFFF</code> (2147483647) is the largest signed 32-bit int.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Loops like <code>while n: n &gt;&gt;= 1</code> never end for a negative n in Python (−1 &gt;&gt; 1 is still −1). If a problem says "treat n as a 32-bit unsigned integer", first do <code>n &amp;= 0xFFFFFFFF</code>.</p>
  </div>

  <h2 id="dsa-bt-single"><span class="num">04</span>One Bit at a Time</h2>
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

n = 0b1010                                    # 10
print([get_bit(n, i) for i in range(4)])      # bits 0..3, right to left
print(format(set_bit(n, 0), "04b"), format(clear_bit(n, 1), "04b"), format(toggle_bit(n, 3), "04b"))
print(format(n &amp; ((1 &lt;&lt; 3) - 1), "04b"))     # keep only the low 3 bits</div>
  <div class="fx" data-lang="text">[0, 1, 0, 1]
1011 1000 0010
0010</div>
  <p>10 is <code>1010</code>. Reading bits 0 to 3 gives <code>[0, 1, 0, 1]</code> (right to left). Setting bit 0 gives <code>1011</code>, clearing bit 1 gives <code>1000</code>, toggling bit 3 gives <code>0010</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An attendance register for 30 students stored as one number: bit i = 1 means roll number i is present. Marking someone present is "set", marking absent is "clear", checking is "check". 30 students fit in one integer instead of a list of 30 booleans.</p>
  </div>

  <h2 id="dsa-bt-tricks"><span class="num">05</span>Famous Tricks</h2>
  <h3>x &amp; (x − 1): remove the lowest 1</h3>
  <p>Subtracting 1 from a binary number works like subtracting 1 from 1000 in decimal (gives 0999): the lowest 1 becomes 0 and every 0 to its right becomes 1. AND that with the original and the lowest 1 and everything right of it become 0. Everything to the left is untouched.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><text x="20" y="34" class="tm">x</text><text x="20" y="68" class="tm">x - 1</text><text x="20" y="108" class="tb">x &amp; (x-1)</text><text x="20" y="150" class="tm">-x</text><text x="20" y="184" class="tg">x &amp; -x</text><rect x="140" y="14" width="36" height="28" class="fs"/><text x="158" y="34" text-anchor="middle">1</text><rect x="180" y="14" width="36" height="28" class="fs"/><text x="198" y="34" text-anchor="middle">1</text><rect x="220" y="14" width="36" height="28" class="fr sr"/><text x="238" y="34" text-anchor="middle">0</text><rect x="260" y="14" width="36" height="28" class="fr sr"/><text x="278" y="34" text-anchor="middle">0</text><text x="158" y="68" text-anchor="middle">1</text><text x="198" y="68" text-anchor="middle">0</text><text x="238" y="68" text-anchor="middle">1</text><text x="278" y="68" text-anchor="middle">1</text><rect x="140" y="88" width="36" height="28" class="fb sb"/><text x="158" y="108" text-anchor="middle">1</text><rect x="180" y="88" width="36" height="28" class="fb sb"/><text x="198" y="108" text-anchor="middle">0</text><rect x="220" y="88" width="36" height="28" class="fb sb"/><text x="238" y="108" text-anchor="middle">0</text><rect x="260" y="88" width="36" height="28" class="fb sb"/><text x="278" y="108" text-anchor="middle">0</text><text x="120" y="150" text-anchor="end" class="tm">…1</text><text x="158" y="150" text-anchor="middle">0</text><text x="198" y="150" text-anchor="middle">1</text><text x="238" y="150" text-anchor="middle">0</text><text x="278" y="150" text-anchor="middle">0</text><rect x="140" y="164" width="36" height="28" class="fg sg"/><text x="158" y="184" text-anchor="middle">0</text><rect x="180" y="164" width="36" height="28" class="fg sg"/><text x="198" y="184" text-anchor="middle">1</text><rect x="220" y="164" width="36" height="28" class="fg sg"/><text x="238" y="184" text-anchor="middle">0</text><rect x="260" y="164" width="36" height="28" class="fg sg"/><text x="278" y="184" text-anchor="middle">0</text><text x="330" y="34" class="tm">x = 12</text><text x="330" y="68" class="tm">lowest 1 → 0, zeros → 1</text><text x="330" y="108" class="tb">= 8: lowest 1 removed</text><text x="330" y="150" class="tm">= ~x + 1 (flip, add 1)</text><text x="330" y="184" class="tg">= 4: lowest 1 alone</text></svg><figcaption>For x = 12 (1100). x &amp; (x−1) wipes the lowest 1. x &amp; −x keeps only the lowest 1. Red boxes are the trailing zeros that both tricks rely on.</figcaption></figure>
  <h3>x &amp; −x: keep only the lowest 1</h3>
  <p>−x is ~x + 1. Flipping turns the trailing zeros into ones; adding 1 carries through them and stops at the first 0, which was x's lowest 1. So x and −x agree only at that one bit. This is the heart of the Fenwick tree (see the Advanced Data Structures note).</p>
  <h3>Power of two</h3>
  <p>A power of two has exactly one 1 bit (1, 10, 100, 1000 …). Remove the lowest 1 and you get 0. Guard against 0 and negatives first.</p>
  <h3>XOR rules</h3>
  <p>Three facts: <code>x ^ x = 0</code> (same bits cancel), <code>x ^ 0 = x</code>, and order does not matter (<code>a ^ b ^ a = b</code>). So if you XOR a list where every value appears twice except one, the pairs vanish and the loner is left.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hostel light switch toggled by everyone who passes. If every person walks in and later walks out (two toggles each), the light ends where it started. Only the person who came in and stayed decides the final state.</p>
  </div>
  <div class="fx" data-lang="py">x = 12                                       # 1100
print(format(x - 1, "04b"), format(x &amp; (x - 1), "04b"))   # lowest 1 removed
print(format(x &amp; -x, "04b"))                 # lowest 1 isolated

def is_power_of_two(n):
    return n &gt; 0 and n &amp; (n - 1) == 0

print([n for n in range(-2, 70) if is_power_of_two(n)])
print(5 ^ 5, 5 ^ 0, 3 ^ 7 ^ 3)               # x^x = 0, x^0 = x, pairs cancel

a, b = 6, 9
a ^= b; b ^= a; a ^= b                       # swap without a temp (party trick)
print(a, b)</div>
  <div class="fx" data-lang="text">1011 1000
0100
[1, 2, 4, 8, 16, 32, 64]
0 5 7
9 6</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The XOR swap is a quiz favourite but never use it in real code: it is slower than <code>a, b = b, a</code> and breaks when a and b are the same memory slot (<code>x ^= x</code> makes 0). Say that in an interview and you score a point.</p>
  </div>

  <h2 id="dsa-bt-count"><span class="num">06</span>Counting 1 Bits</h2>
  <p>"How many switches are on?" is called the <strong>popcount</strong> or <strong>Hamming weight</strong>. It shows up in Hamming distance (<code>popcount(a ^ b)</code> = number of positions where two codes differ), in DP over subsets, and in many easy interview questions.</p>
  <table class="tbl">
    <tr><th>Way</th><th>Code</th><th>Cost</th><th>Note</th></tr>
    <tr><td>String count</td><td><code>bin(n).count("1")</code></td><td>O(bits)</td><td>Short, works everywhere; fine in interviews if you also know a loop</td></tr>
    <tr><td>Built-in</td><td><code>n.bit_count()</code></td><td>O(bits), very fast</td><td>Python 3.10+; counts the magnitude for negatives</td></tr>
    <tr><td>Shift loop</td><td><code>c += n &amp; 1; n &gt;&gt;= 1</code></td><td>O(total bits)</td><td>Visits every bit, including zeros</td></tr>
    <tr><td>Brian Kernighan</td><td><code>n &amp;= n - 1; c += 1</code></td><td>O(number of 1s)</td><td>Jumps from 1 to 1; the expected answer</td></tr>
  </table>
  <div class="fx" data-lang="py">def count_kernighan(n):
    c = 0
    while n:
        n &amp;= n - 1                           # drop the lowest 1
        c += 1
    return c

def count_shift(n):
    c = 0
    while n:
        c += n &amp; 1                           # look at the last bit
        n &gt;&gt;= 1
    return c

for n in [0, 1, 11, 128, 255, 2**31 - 1]:
    print(n, bin(n).count("1"), n.bit_count(), count_kernighan(n), count_shift(n))</div>
  <div class="fx" data-lang="text">0 0 0 0 0
1 1 1 1 1
11 3 3 3 3
128 1 1 1 1
255 8 8 8 8
2147483647 31 31 31 31</div>
  <p>For 128 (<code>10000000</code>) the shift loop runs 8 times; Kernighan runs once. That difference is the point of the trick.</p>

  <h2 id="dsa-bt-subsets"><span class="num">07</span>Subsets via Bitmask</h2>
  <p>You have 3 snacks: a, b, c. Each subset is a yes/no choice per snack. Three yes/no choices are exactly three bits. So every number from 0 to 2³ − 1 = 7 is one subset, and counting from 0 to 7 lists them all.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600"><text x="20" y="30" class="tm">mask 5 =</text><rect x="110" y="10" width="44" height="30" class="fg sg"/><text x="132" y="31" text-anchor="middle">1</text><rect x="158" y="10" width="44" height="30" class="fs"/><text x="180" y="31" text-anchor="middle">0</text><rect x="206" y="10" width="44" height="30" class="fg sg"/><text x="228" y="31" text-anchor="middle">1</text><text x="132" y="62" text-anchor="middle" class="tm">bit 2</text><text x="180" y="62" text-anchor="middle" class="tm">bit 1</text><text x="228" y="62" text-anchor="middle" class="tm">bit 0</text><text x="132" y="88" text-anchor="middle" class="tg">c</text><text x="180" y="88" text-anchor="middle" class="tm">b</text><text x="228" y="88" text-anchor="middle" class="tg">a</text><text x="300" y="31">bit i on → take items[i]</text><text x="300" y="62">mask 5 → ['a', 'c']</text><text x="300" y="88" class="tm">masks 0..7 → all 8 subsets</text></svg><figcaption>A mask is a row of yes/no answers. Bit i decides whether items[i] is in the subset.</figcaption></figure>
  <div class="fx" data-lang="py">items = ["a", "b", "c"]
n = len(items)
for mask in range(1 &lt;&lt; n):                   # 0 .. 2^n - 1
    subset = [items[i] for i in range(n) if mask &gt;&gt; i &amp; 1]
    print(format(mask, "03b"), subset)</div>
  <div class="fx" data-lang="text">000 []
001 ['a']
010 ['b']
011 ['a', 'b']
100 ['c']
101 ['a', 'c']
110 ['b', 'c']
111 ['a', 'b', 'c']</div>
  <p>Cost: 2ⁿ masks × n bit checks = O(n · 2ⁿ). For n = 20 that is about 20 million steps, the practical limit. Bitmasks also power <strong>bitmask DP</strong>: a state like "which cities are already visited" (Travelling Salesman) is one integer, so it can be a dict key or a list index.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A Python <code>set</code> of small integers 0..n−1 can be replaced by one int. Add = set bit, remove = clear bit, contains = check bit, union = <code>|</code>, intersection = <code>&amp;</code>. It is hashable and tiny, which is why DP solutions love it.</p>
  </div>

  <h2 id="dsa-bt-patterns"><span class="num">08</span>Patterns</h2>
  <div class="cards">
    <div><b>Pairs cancel → XOR</b><p>"Every element appears twice except one", "find the missing number", "find the duplicate".</p><small>XOR all values (and indexes)</small></div>
    <div><b>Count / test bits</b><p>"Number of 1 bits", "Hamming distance", "is power of two / four".</p><small>Kernighan, x &amp; (x-1)</small></div>
    <div><b>All subsets of small n</b><p>"All combinations", "n ≤ 20", "choose any group of items".</p><small>for mask in range(1 &lt;&lt; n)</small></div>
    <div><b>State as a mask</b><p>"Visited set" in DP / BFS when items ≤ 20, e.g. shortest path visiting all nodes.</p><small>dp[mask][i]</small></div>
    <div><b>No + or −</b><p>"Add without arithmetic operators": XOR is add-without-carry, AND + shift is the carry.</p><small>Mask to 32 bits in Python</small></div>
    <div><b>32-bit fixed width</b><p>"Reverse bits", "treat as unsigned", "overflow".</p><small>Loop exactly 32 times, mask with 0xFFFFFFFF</small></div>
  </div>
  <div class="flow"><span>Read the problem</span><span>Pairs or duplicates? → XOR</span><span>n ≤ 20 choices? → bitmask</span><span>"bits" or "32-bit"? → shift + mask</span></div>

  <h2 id="dsa-bt-problems"><span class="num">09</span>Classic Problems</h2>
  <h3>1. Single Number</h3>
  <p>Every value appears twice except one. Find it in O(n) time and O(1) extra space. Brute force: a Counter, O(n) space. Better: XOR everything, pairs cancel.</p>
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

  <h2 id="dsa-bt-traps"><span class="num">10</span>Common Mistakes</h2>
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

  <h2 id="dsa-bt-qa"><span class="num">11</span>Questions &amp; Answers</h2>
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
</main>
`
});
