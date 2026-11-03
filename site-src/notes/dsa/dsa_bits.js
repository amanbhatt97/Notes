// notes/dsa/dsa_bits.js — Bit Manipulation
Object.assign(TOPIC_CONTENT, {
  "dsa_bits": `<main>
<h1>Bit Manipulation</h1>
  <div class="where"><span>DSA</span><span>Problem-Solving Techniques</span><span>Bit Manipulation</span></div>
  <p class="lead">Every integer a computer stores is really a row of 0s and 1s, and <strong>bit manipulation</strong> means working on that row directly: switching one digit on, testing another, or combining two rows column by column. It matters in real work because it lets one small integer stand in for a whole set of yes/no facts (file permissions, feature flags, "which cities have I visited"), and because a handful of interview questions can only be solved in O(1) extra space with a bit trick. The running example is <strong>Biteful's restaurant feature flags</strong>: every restaurant has four yes/no features, VEG, FREE delivery, CARD payments and open LATE, and we store all four in one number. Dosa Hut has VEG, CARD and LATE, which we will see is the number 13; Chai Point has FREE and LATE, which is 10. Every idea on this page is tried on these two restaurants first.</p>

  <h2 id="dsa-bt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Bit Manipulation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Binary</div>
        <ul>
          <li>Place values 1, 2, 4, 8 … from the right; bit 0 is rightmost</li>
          <li>Dosa Hut = 8 + 4 + 1 = 13 = <code>1101</code></li>
          <li>An int can be a set of small numbers (a <b>bitmask</b>)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Operators</div>
        <ul>
          <li><code>&amp;</code> both, <code>|</code> either, <code>^</code> different</li>
          <li><code>&lt;&lt; k</code> = ×2ᵏ, <code>&gt;&gt; k</code> = //2ᵏ</li>
          <li><code>~x == -x - 1</code> in Python (infinite leading 1s)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Famous tricks</div>
        <ul>
          <li><code>1 &lt;&lt; i</code> aims at bit i: check, set, clear, toggle</li>
          <li>XOR: pairs cancel → single / missing number</li>
          <li><code>x &amp; (x-1)</code> drops the lowest 1; <code>x &amp; -x</code> keeps it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bigger uses</div>
        <ul>
          <li>Masks 0 … 2ⁿ−1 = every subset (n ≤ 20)</li>
          <li>Bitmask DP, Fenwick tree, fast power</li>
          <li>32-bit problems: mask with <code>0xFFFFFFFF</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-bt-binary"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Binary Representation</span><span class="rm-sub">four features stored in one number</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-ops"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Six Operators</span><span class="rm-sub">combining two rows of bits column by column</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-neg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Python Ints &amp; Negatives</span><span class="rm-sub">why ~13 is −14, and how to fake 32 bits</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-onebit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">One Bit at a Time</span><span class="rm-sub">check, set, clear and toggle a single feature</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-single"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">XOR Tricks</span><span class="rm-sub">pairs cancel: single number, missing number</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-count"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Counting 1 Bits</span><span class="rm-sub">Kernighan's trick and counting for every i</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-tricks"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Power of Two &amp; the Lowest Bit</span><span class="rm-sub">x &amp; (x − 1) and x &amp; −x</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-subsets"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Subsets via Bitmask</span><span class="rm-sub">every combination by counting</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-fixed"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Fixed-Width Problems</span><span class="rm-sub">reverse bits, adding without +</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">which words in a problem point to which trick</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">zero, precedence, 0-or-2ⁱ, ~</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">operators, tricks, templates, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-bt-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about bits</span></div></div>
    </div>
  </div>

  <h2 id="dsa-bt-binary"><span class="num">01</span>Binary Representation</h2>
  <p>Biteful's search page lets customers filter restaurants by four yes/no features, and it runs that filter over lakhs of restaurants on every search. The most obvious way to store the features is a dictionary of four booleans per restaurant, and to answer "which features do Dosa Hut and Chai Point both have?" by comparing the dictionaries key by key:</p>
  <div class="fx" data-lang="py"># The obvious way: four booleans per restaurant
dosa_hut = {"veg": True, "free": False, "card": True, "late": True}
chai_point = {"veg": False, "free": True, "card": False, "late": True}
both = {k: dosa_hut[k] and chai_point[k] for k in dosa_hut}
print(both)</div>
  <div class="fx" data-lang="text">{'veg': False, 'free': False, 'card': False, 'late': True}</div>
  <p>This is correct, but every restaurant now carries a whole dictionary, and every comparison is a loop over keys. Four yes/no answers are only four bits of information, so it feels wasteful. The question this section answers is whether one small integer can hold all four answers, and the answer comes from how computers store integers in the first place.</p>
  <p>You already know base 10: in 352 the 3 means three hundreds, the 5 five tens and the 2 two ones, and each place is worth ten times the place to its right. <strong>Binary</strong>, or base 2, is the same idea with only two digits, 0 and 1, and each place worth twice the one to its right: 1, 2, 4, 8, 16 and so on. Each binary digit is called a <strong>bit</strong>. Computers use binary because a wire is either off or on. Think of a switchboard with a row of switches, where the rightmost switch is worth 1, the next 2, then 4, then 8: the number is simply the total of the switches that are on.</p>
  <p>Now give each Biteful feature its own switch: VEG is worth 1, FREE 2, CARD 4 and LATE 8. Dosa Hut has VEG, CARD and LATE switched on, so it is 1 + 4 + 8 = 13, written <code>1101</code> in binary. The figure shows Dosa Hut's eight lowest switches.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600"><text x="20" y="40" class="tm">value</text><text x="20" y="80" class="tm">bit</text><text x="20" y="128" class="tm">adds</text><text x="90" y="40" text-anchor="middle" class="tm">128</text><rect x="62" y="56" width="56" height="36" class="fs"/><text x="90" y="80" text-anchor="middle">0</text><text x="150" y="40" text-anchor="middle" class="tm">64</text><rect x="122" y="56" width="56" height="36" class="fs"/><text x="150" y="80" text-anchor="middle">0</text><text x="210" y="40" text-anchor="middle" class="tm">32</text><rect x="182" y="56" width="56" height="36" class="fs"/><text x="210" y="80" text-anchor="middle">0</text><text x="270" y="40" text-anchor="middle" class="tm">16</text><rect x="242" y="56" width="56" height="36" class="fs"/><text x="270" y="80" text-anchor="middle">0</text><text x="330" y="40" text-anchor="middle" class="tm">8</text><rect x="302" y="56" width="56" height="36" class="fg sg"/><text x="330" y="80" text-anchor="middle">1</text><text x="390" y="40" text-anchor="middle" class="tm">4</text><rect x="362" y="56" width="56" height="36" class="fg sg"/><text x="390" y="80" text-anchor="middle">1</text><text x="450" y="40" text-anchor="middle" class="tm">2</text><rect x="422" y="56" width="56" height="36" class="fs"/><text x="450" y="80" text-anchor="middle">0</text><text x="510" y="40" text-anchor="middle" class="tm">1</text><rect x="482" y="56" width="56" height="36" class="fg sg"/><text x="510" y="80" text-anchor="middle">1</text><text x="330" y="128" text-anchor="middle" class="tg">8</text><text x="390" y="128" text-anchor="middle" class="tg">+4</text><text x="510" y="128" text-anchor="middle" class="tg">+1</text><text x="300" y="160" text-anchor="middle">Dosa Hut: 00001101 = 8 + 4 + 1 = 13 (late, card, veg)</text><text x="90" y="18" text-anchor="middle" class="tm">bit 7</text><text x="510" y="18" text-anchor="middle" class="tm">bit 0</text><text x="330" y="106" text-anchor="middle" class="tm" font-size="10">LATE</text><text x="390" y="106" text-anchor="middle" class="tm" font-size="10">CARD</text><text x="450" y="106" text-anchor="middle" class="tm" font-size="10">FREE</text><text x="510" y="106" text-anchor="middle" class="tm" font-size="10">VEG</text></svg><figcaption>Dosa Hut's flags as eight switches. Green switches are on. Bits are numbered from the right, starting at 0.</figcaption></figure>
  <p>Read the figure from the right. Bit 0, the rightmost switch, is worth 1 and is on (VEG). Bit 1 is worth 2 and is off (no free delivery). Bits 2 and 3, worth 4 and 8, are on (CARD and LATE). Everything to the left is off. Adding the values of the green switches gives 8 + 4 + 1 = 13. Bits are always counted from the right starting at 0, so "bit i" is the switch worth 2ⁱ. The rightmost bit is also called the <strong>least significant bit</strong> and the leftmost 1 the <strong>most significant bit</strong>. To convert a number to binary by hand, repeatedly take the largest place value that still fits: from 13 take 8 (5 left), then 4 (1 left), skip 2, take 1, which gives <code>1101</code>.</p>
  <p>Python converts in both directions for us:</p>
  <div class="fx" data-lang="py">VEG, FREE, CARD, LATE = 1, 2, 4, 8       # one place value per feature
dosa_hut = VEG + CARD + LATE              # 1 + 4 + 8
chai_point = FREE + LATE                  # 2 + 8
print(dosa_hut, bin(dosa_hut), format(dosa_hut, "08b"))
print(chai_point, bin(chai_point), format(chai_point, "08b"))
print(int("1101", 2), 0b1101)             # binary text back to a number
print((13).bit_length(), (255).bit_length(), (256).bit_length())</div>
  <div class="fx" data-lang="text">13 0b1101 00001101
10 0b1010 00001010
13 13
4 8 9</div>
  <p><code>bin(13)</code> gives the text <code>'0b1101'</code>, where <code>0b</code> just means "binary follows", and <code>format(n, "08b")</code> pads it to eight digits. <code>int("1101", 2)</code> and the literal <code>0b1101</code> go the other way. <code>bit_length()</code> tells you how many bits a number needs: 13 needs 4, 255 needs 8, and 256 needs 9. A number with k bits can be at most 2ᵏ − 1, so our four feature bits can describe 2⁴ = 16 different restaurants, from 0 (no features) to 15 (all four).</p>
  <p>The important shift in thinking is this: an integer whose bit i is 1 exactly when "item i is in the set" can represent any set drawn from a small collection of items. Such an integer is called a <strong>bitmask</strong>, or just a mask. Dosa Hut's 13 is the set {VEG, CARD, LATE}. The rest of the page is about how to do set operations on these masks in one CPU instruction each. You meet masks everywhere in real systems: Unix file permissions (<code>chmod 755</code> is three 3-bit masks), IP subnet masks, feature flags packed into one database column, chess engines that keep one 64-bit mask per piece type, and DP solutions that store "which cities are visited" as a single integer.</p>

  <h2 id="dsa-bt-ops"><span class="num">02</span>The Six Operators</h2>
  <p>We now have Dosa Hut as 13 and Chai Point as 10, and we want to ask "which features do both have?" Ordinary arithmetic does not help: 13 + 10 carries digits from one column into the next and mixes the features up. What we need are operators that treat every column on its own, the way you would compare two rows of switches by looking at each pair of switches separately. Python has six of them, called the <strong>bitwise operators</strong>.</p>
  <table class="tbl">
    <tr><th>Op</th><th>Name</th><th>Rule for each column</th><th>Typical use</th></tr>
    <tr><td><code>&amp;</code></td><td>AND</td><td>1 only if both bits are 1</td><td>keep only some bits; test a bit</td></tr>
    <tr><td><code>|</code></td><td>OR</td><td>1 if at least one bit is 1</td><td>switch bits on; combine flags</td></tr>
    <tr><td><code>^</code></td><td>XOR</td><td>1 if the two bits differ</td><td>flip bits; find what changed</td></tr>
    <tr><td><code>~</code></td><td>NOT</td><td>flip every bit</td><td>"everything except these bits"</td></tr>
    <tr><td><code>&lt;&lt; k</code></td><td>left shift</td><td>slide the row k places left, fill with 0</td><td>multiply by 2ᵏ; <code>1 &lt;&lt; i</code> makes a mask for bit i</td></tr>
    <tr><td><code>&gt;&gt; k</code></td><td>right shift</td><td>slide k places right, drop bits that fall off</td><td>floor-divide by 2ᵏ; bring bit i to position 0</td></tr>
  </table>
  <p>Line the two numbers up on the right and apply the rule in each column. Dosa Hut is <code>1101</code> and Chai Point is <code>1010</code>. In the LATE column both have a 1; in the CARD column only Dosa Hut does; in the FREE column only Chai Point; in the VEG column only Dosa Hut. So AND keeps only the LATE column, <code>1000</code>; OR keeps every column where anyone has a 1, <code>1111</code>; and XOR keeps the three columns where they differ, <code>0111</code>. Here is the same thing in Python:</p>
  <div class="fx" data-lang="py">a, b = 13, 10                     # Dosa Hut 1101, Chai Point 1010
print(f"a &amp; b  = {a &amp; b:2}  {a &amp; b:04b}   features both have")
print(f"a | b  = {a | b:2}  {a | b:04b}   features either has")
print(f"a ^ b  = {a ^ b:2}  {a ^ b:04b}   features where they differ")
print(f"a &lt;&lt; 2 = {a &lt;&lt; 2}  {a &lt;&lt; 2:06b}")
print(f"a &gt;&gt; 2 = {a &gt;&gt; 2:2}  {a &gt;&gt; 2:04b}")
print(f"~a     = {~a}")</div>
  <div class="fx" data-lang="text">a &amp; b  =  8  1000   features both have
a | b  = 15  1111   features either has
a ^ b  =  7  0111   features where they differ
a &lt;&lt; 2 = 52  110100
a &gt;&gt; 2 =  3  0011
~a     = -14</div>
  <p>Read the output as answers about restaurants. <code>13 &amp; 10 = 8</code>: the only feature both share is LATE. <code>13 | 10 = 15</code>: between them they cover all four features. <code>13 ^ 10 = 7</code>: they differ on VEG, FREE and CARD. That is the set intersection, union and difference we wanted, each computed in one step instead of a loop over a dictionary. The shifts slide the whole row: <code>13 &lt;&lt; 2</code> adds two zeros on the right, giving 52, which is 13 × 4; <code>13 &gt;&gt; 2</code> drops the two rightmost bits (VEG and FREE fall off), giving 3, which is 13 // 4. Shifts are the fast way to multiply and divide by powers of two.</p>
  <p>A good way to remember the first three is by what they do to a target: AND is a <em>filter</em> (a bit survives only if the mask allows it), OR is a <em>switch-on</em>, and XOR is a <em>flip</em>. With those three pictures you can read almost any bit trick. The last line of output, <code>~13 = -14</code>, is the odd one out. We expected "flip the four bits of 1101" to give <code>0010</code>, which is 2. The next section explains why Python gives −14 instead.</p>
  <p>One practical warning before moving on: these operators have low <strong>precedence</strong>, meaning Python applies them after arithmetic. Arithmetic binds tighter than shifts, shifts tighter than <code>&amp;</code>, then <code>^</code>, then <code>|</code>, and comparisons such as <code>==</code> come last:</p>
  <div class="fx" data-lang="py">n, x = 4, 6
print(1 &lt;&lt; n - 1)          # means 1 &lt;&lt; (n - 1), not (1 &lt;&lt; n) - 1
print(x &amp; 1 == 0)          # Python: (x &amp; 1) == 0
print((1 &lt;&lt; n) - 1)        # brackets say what you mean</div>
  <div class="fx" data-lang="text">8
True
15</div>
  <p><code>1 &lt;&lt; n - 1</code> printed 8, because Python read it as <code>1 &lt;&lt; (n - 1)</code>; if you meant "n ones" you need <code>(1 &lt;&lt; n) - 1</code>, which printed 15. <code>x &amp; 1 == 0</code> happens to work in Python, but in C and Java the same text means <code>x &amp; (1 == 0)</code>. The safe habit is to put brackets around every bit expression.</p>

  <h2 id="dsa-bt-neg"><span class="num">03</span>Python Ints &amp; Negatives</h2>
  <p>To trust any bit trick in Python we need to understand the surprise from the last section, <code>~13 == -14</code>, and that means understanding how negative numbers are stored. It matters in interviews too: several classic problems say "treat n as a 32-bit integer", and code that ignores how Python handles negatives either prints nonsense or loops forever on them.</p>
  <p>In C, Java or Go an <code>int</code> is a box with exactly 32 (or 64) bits. Almost every computer stores negative numbers in that box using <strong>two's complement</strong>: to get −x, flip all the bits of x and add 1. In a 32-bit box, −1 is thirty-two 1s, and −5 is <code>11111111 … 11111011</code>. The leftmost bit acts as the sign: if it is 1, the number is negative. Think of an old car odometer with six digits. Wind it back one step from 000000 and it shows 999999, which behaves exactly like −1, because adding 1 to it rolls it round to 000000 again. Two's complement is the binary version of that odometer.</p>
  <p>Python's integers have no fixed box: they grow as large as needed, so <code>2 ** 100</code> just works and there is no overflow. To keep the bit rules consistent, Python behaves as if a negative number had <strong>infinitely many</strong> leading 1s, an odometer with endless 9s to the left. That one fact explains every surprise:</p>
  <div class="fx" data-lang="py">print(~13, -13 - 1)                       # ~x is always -x - 1
print(bin(-5))                            # sign + size, not the stored bits
print(-5 &amp; 0xFFFFFFFF, hex(-5 &amp; 0xFFFFFFFF))   # the 32-bit pattern of -5
print(-8 &gt;&gt; 1, -1 &gt;&gt; 10)                  # right shift floors; -1 stays -1
print(2 ** 100 &gt; 0)                       # no overflow, ever

def to_signed32(u):
    u &amp;= 0xFFFFFFFF                       # keep the low 32 bits
    return u - (1 &lt;&lt; 32) if u &amp; 0x80000000 else u   # bit 31 set means negative

print(to_signed32(0xFFFFFFFB), to_signed32(0x7FFFFFFF), to_signed32(0x80000000))
print(format(13 ^ 0b1111, "04b"))         # flip only the 4 feature bits</div>
  <div class="fx" data-lang="text">-14 -14
-0b101
4294967291 0xfffffffb
-4 -1
True
-5 2147483647 -2147483648
0010</div>
  <p>Go through the output line by line. <code>~13</code> flips every bit of …0001101, including the infinite zeros on the left, which become infinite ones: …1110010, and that pattern is −14. In general <strong><code>~x == -x - 1</code></strong>, which follows from the definition −x = ~x + 1. <code>bin(-5)</code> prints <code>-0b101</code>, a minus sign and the size; it does not show the stored bits, so never use it to inspect a negative pattern. <code>-5 &amp; 0xFFFFFFFF</code> keeps only the lowest 32 bits (<code>0xFFFFFFFF</code> is 32 ones), which turns the infinite pattern into the 32-bit pattern a Java program would see, printed as the large positive number 4294967291. Right shift on a negative number keeps pulling in 1s from the left, so it rounds down: <code>-8 &gt;&gt; 1</code> is −4, and <code>-1 &gt;&gt; 10</code> stays −1 forever.</p>
  <p><code>to_signed32</code> goes the other way. Given a 32-bit pattern stored as a positive number, it checks bit 31 (<code>0x80000000</code>); if that sign bit is set, the pattern stands for a negative number, so it subtracts 2³². That is how <code>0xFFFFFFFB</code> becomes −5 and <code>0x80000000</code> becomes −2147483648, the smallest 32-bit integer. And the last line gives what we actually wanted from <code>~13</code>, "the features Dosa Hut lacks": XOR with a mask of four 1s flips only those four bits, giving <code>0010</code>, which is just FREE.</p>
  <p>So the working rule in Python is: AND, OR, XOR and shifts behave exactly as you expect on non-negative numbers; <code>~</code> always produces a negative number; and whenever a problem talks about a fixed width such as 32 bits, you simulate the box yourself by masking with <code>0xFFFFFFFF</code> and converting back at the end. Section 09 uses exactly this on two classic fixed-width problems.</p>

  <h2 id="dsa-bt-onebit"><span class="num">04</span>One Bit at a Time</h2>
  <p>The operators work on every column at once, but the app's everyday questions are about one feature: "does Dosa Hut deliver free?", "switch LATE off tonight", "Dosa Hut stopped being pure veg". We need to aim an operator at exactly one bit without disturbing the others.</p>
  <p>The tool for aiming is <code>1 &lt;&lt; i</code>, a number whose only 1 is at bit i. <code>1 &lt;&lt; 1</code> is <code>0010</code> (FREE) and <code>1 &lt;&lt; 3</code> is <code>1000</code> (LATE). Combined with one operator, it gives the four basic moves. To <strong>check</strong> bit i, slide it down to position 0 with <code>n &gt;&gt; i</code> and keep only that bit with <code>&amp; 1</code>. To <strong>set</strong> it (switch on), OR with the mask: OR with 1 makes that bit 1, and OR with 0 leaves every other bit alone. To <strong>clear</strong> it (switch off), AND with <code>~(1 &lt;&lt; i)</code>, which is all ones except a 0 at bit i, so every other bit survives the filter. To <strong>toggle</strong> it, XOR with the mask, since XOR with 1 flips and XOR with 0 keeps. Think of a class attendance register stored as one number, where bit i means roll number i is present: marking someone present is set, marking them absent is clear, and checking the register is check.</p>
  <div class="fx" data-lang="py">def get_bit(n, i):    return (n &gt;&gt; i) &amp; 1
def set_bit(n, i):    return n | (1 &lt;&lt; i)
def clear_bit(n, i):  return n &amp; ~(1 &lt;&lt; i)
def toggle_bit(n, i): return n ^ (1 &lt;&lt; i)

dosa_hut = 0b1101                           # VEG, CARD, LATE
print([get_bit(dosa_hut, i) for i in range(4)])   # bits 0..3
print("free delivery?", get_bit(dosa_hut, 1))
print("turn on FREE :", format(set_bit(dosa_hut, 1), "04b"))
print("turn off LATE:", format(clear_bit(dosa_hut, 3), "04b"))
print("toggle VEG   :", format(toggle_bit(dosa_hut, 0), "04b"))</div>
  <div class="fx" data-lang="text">[1, 0, 1, 1]
free delivery? 0
turn on FREE : 1111
turn off LATE: 0101
toggle VEG   : 1100</div>
  <p>Reading Dosa Hut's bits 0 to 3 gives <code>[1, 0, 1, 1]</code>: VEG yes, FREE no, CARD yes, LATE yes. Checking bit 1 says 0, so no free delivery. Setting bit 1 turns <code>1101</code> into <code>1111</code>; clearing bit 3 turns it into <code>0101</code>, the same restaurant closing early; toggling bit 0 turns it into <code>1100</code>, no longer veg. In each case only the targeted bit changed. All four moves are O(1).</p>
  <p>The same idea works for several bits at once, which is how the search filter actually runs. When a customer ticks "veg" and "card", the ticked filters form a mask, <code>want = VEG | CARD = 0101</code>. A restaurant has <em>all</em> the ticked features if AND-ing its flags with the mask leaves the whole mask (<code>flags &amp; want == want</code>), and it has <em>at least one</em> of them if anything at all survives (<code>flags &amp; want != 0</code>):</p>
  <div class="fx" data-lang="py">VEG, FREE, CARD, LATE = 1, 2, 4, 8
restaurants = {"Dosa Hut": 13, "Chai Point": 10, "Biryani Bros": CARD | LATE, "Salad Co": VEG | FREE | CARD}
want = VEG | CARD                           # customer ticks "veg" and "card"
for name, flags in restaurants.items():
    print(f"{name:12} {flags:04b}  all: {flags &amp; want == want!s:5}  any: {flags &amp; want != 0}")</div>
  <div class="fx" data-lang="text">Dosa Hut     1101  all: True   any: True
Chai Point   1010  all: False  any: False
Biryani Bros 1100  all: False  any: True
Salad Co     0111  all: True   any: True</div>
  <p>Dosa Hut is <code>1101 &amp; 0101 = 0101</code>, the whole mask, so it matches all. Chai Point is <code>1010 &amp; 0101 = 0000</code>, nothing, so it matches none. Biryani Bros is <code>1100 &amp; 0101 = 0100</code>: it takes cards but is not veg, so "any" is true and "all" is false. Each test is a single AND, compared with two dictionary lookups per restaurant before. In interview problems the same pattern appears as "letters of a word as a 26-bit mask": two words share no letters exactly when their masks AND to 0.</p>

  <h2 id="dsa-bt-single"><span class="num">05</span>XOR Tricks</h2>
  <p>Biteful's dispatch log records every order id twice, once when a rider picks it up and once when it is delivered. One order was picked up and never delivered, so its id appears only once. The brute-force answer counts each id with a dictionary or <code>Counter</code>, which is O(n) time but also O(n) extra memory. Interviewers ask for O(1) extra memory, and XOR gives it.</p>
  <p>Three facts about XOR do all the work. A number XOR itself is 0 (<code>x ^ x = 0</code>), because every column has two equal bits. A number XOR 0 is itself (<code>x ^ 0 = x</code>). And the order of XORs does not matter (<code>a ^ b ^ a = b</code>), because XOR works column by column with no carries. So if you XOR together a list in which every value appears twice except one, the pairs cancel to 0 wherever they are, and only the loner is left. Think of a corridor light whose switch everyone flips as they pass. If every person walks in and later walks out, every person flips it twice and the light ends where it started; only the person who came in and stayed decides the final state.</p>
  <div class="fx" data-lang="py">print(5 ^ 5, 5 ^ 0, 3 ^ 7 ^ 3)              # x^x = 0, x^0 = x, order does not matter

log = [4, 1, 2, 1, 2]                       # every order id twice, except one
x = 0
for oid in log:
    x ^= oid
print("never delivered:", x)

def missing_number(nums):                   # nums holds 0..n with one value missing
    x = len(nums)
    for i, v in enumerate(nums):
        x ^= i ^ v                          # every present value meets its index and cancels
    return x

print(missing_number([3, 0, 1]), missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]))
print("changed flags:", format(13 ^ 9, "04b"))   # yesterday 1101, today 1001</div>
  <div class="fx" data-lang="text">0 5 7
never delivered: 4
2 8
changed flags: 0100</div>
  <p>The first line confirms the three facts: <code>5 ^ 5 = 0</code>, <code>5 ^ 0 = 5</code>, and in <code>3 ^ 7 ^ 3</code> the two 3s cancel and leave 7. The log <code>[4, 1, 2, 1, 2]</code> leaves 4, and you can trace why in the table below; notice that the 1s and 2s cancel even though their two copies are not next to each other. This is LeetCode's <strong>Single Number</strong>, solved in O(n) time and O(1) space.</p>
  <table class="tbl"><caption>Trace: XOR over the dispatch log</caption>
    <tr><th>order id</th><th>x before</th><th>x after</th><th>what happened</th></tr>
    <tr><td>4</td><td>000</td><td>100</td><td>4 picked up</td></tr>
    <tr><td>1</td><td>100</td><td>101</td><td>1 picked up</td></tr>
    <tr><td>2</td><td>101</td><td>111</td><td>2 picked up</td></tr>
    <tr><td>1</td><td>111</td><td>110</td><td>1 delivered: its bit cancels</td></tr>
    <tr><td>2</td><td>110</td><td>100</td><td>2 delivered: cancels, 4 is left</td></tr>
  </table>
  <p><strong>Missing Number</strong> is the same trick in disguise: a list holds n distinct numbers from 0 to n with one missing. XOR every index 0 to n with every value; each number that is present meets its own index and cancels, and only the missing one survives. On <code>[3, 0, 1]</code> that gives 2, and on the longer list 8. (The sum formula n(n+1)/2 − sum also works; in Java it can overflow for large n, while XOR cannot.) Finally, XOR is a "what changed?" detector: Dosa Hut's flags were 13 yesterday and 9 today, and <code>13 ^ 9 = 0100</code> says exactly one feature changed, CARD.</p>
  <p>Recognise this pattern when a problem says "every element appears twice except one", "find the missing number", "find the extra letter" or "O(1) extra space". Its limit is important: XOR only removes values that appear an <em>even</em> number of times. If every other value appears three times (Single Number II), XOR leaves garbage, and you need to count each bit position modulo 3 instead. A related idea, prefix XOR, works like prefix sums: the XOR of a subarray is <code>pre[r+1] ^ pre[l]</code>, because the shared part cancels.</p>

  <h2 id="dsa-bt-count"><span class="num">06</span>Counting 1 Bits</h2>
  <p>The ranking team wants to know how many features each restaurant has, and in how many features two restaurants differ. The number of 1 bits in a number is called its <strong>popcount</strong> or <strong>Hamming weight</strong>. The obvious way is to look at the last bit (<code>n &amp; 1</code>), shift right, and repeat until n is 0. That visits every bit, including all the zeros: for a number like 128 (<code>10000000</code>) it takes 8 steps to find a single 1.</p>
  <p><strong>Brian Kernighan's trick</strong> skips the zeros. The key insight is that <code>n &amp; (n - 1)</code> removes exactly the lowest 1 bit of n. Subtracting 1 in binary works like subtracting 1 from 1000 in decimal, which gives 0999: the lowest 1 becomes 0 and every 0 to its right becomes 1. AND that with the original n, and the lowest 1 and everything to its right become 0, while everything to the left is untouched. So if you keep doing <code>n &amp;= n - 1</code> and count the steps until n is 0, you take one step per 1 bit. It is like counting the lit windows of a building by walking straight from one lit window to the next instead of checking every dark one in between.</p>
  <div class="fx" data-lang="py">def count_ones(n):
    c = 0
    while n:
        print(f"  {n:04b} &amp; {n - 1:04b} = {n &amp; (n - 1):04b}")
        n &amp;= n - 1                          # wipe the lowest 1
        c += 1
    return c

print("Dosa Hut features:", count_ones(13))
print(bin(13).count("1"), (13).bit_count(), (13 ^ 10).bit_count())</div>
  <div class="fx" data-lang="text">  1101 &amp; 1100 = 1100
  1100 &amp; 1011 = 1000
  1000 &amp; 0111 = 0000
Dosa Hut features: 3
3 3 3</div>
  <p>The three printed lines are the trace for Dosa Hut. <code>1101 &amp; 1100</code> removes the VEG bit, <code>1100 &amp; 1011</code> removes CARD, and <code>1000 &amp; 0111</code> removes LATE, leaving 0 after three steps, so Dosa Hut has three features. The cost is O(k) where k is the number of 1 bits, compared with O(total bits) for the shift loop. In everyday Python you would write <code>bin(n).count("1")</code> or, from Python 3.10, <code>n.bit_count()</code>; both printed 3. The last value on that line is the <strong>Hamming distance</strong> between Dosa Hut and Chai Point, the number of positions where they differ, which is just the popcount of their XOR: <code>13 ^ 10 = 0111</code> has three 1s.</p>
  <p>A common follow-up, <strong>Counting Bits</strong>, asks for the popcount of every number from 0 to n. Calling Kernighan n times costs O(n log n). Better is to reuse answers we already have, which is a tiny dynamic programme: <code>i &gt;&gt; 1</code> is i with its last bit removed, and it is smaller than i, so its count is already known. Add back the last bit, <code>i &amp; 1</code>, and you have the count for i.</p>
  <div class="fx" data-lang="py">def count_bits(n):                          # popcount of every i in 0..n
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1)      # i without its last bit, plus that bit
    return ans

print(count_bits(8))</div>
  <div class="fx" data-lang="text">[0, 1, 1, 2, 1, 2, 2, 3, 1]</div>
  <p>For example, 5 is <code>101</code>; <code>5 &gt;&gt; 1</code> is 2 (<code>10</code>) with count 1, and the dropped bit is 1, so 5 has count 2. Each entry takes O(1), so the whole list is O(n). Recognise popcount problems by the words "number of 1 bits", "Hamming weight" or "Hamming distance", and remember that Kernighan's loop on a negative Python int never reaches 0 (it has infinitely many 1s), so mask with <code>0xFFFFFFFF</code> first if negatives are possible.</p>

  <h2 id="dsa-bt-tricks"><span class="num">07</span>Power of Two &amp; the Lowest Bit</h2>
  <p>The ops team wants restaurants that have exactly one feature, and for every restaurant its "lowest" feature. Counting all the 1 bits and comparing with 1 works, but there are two one-line expressions that answer these questions directly, and both are built from the same observation about trailing zeros.</p>
  <p>The first is the step we just used: <code>x &amp; (x - 1)</code> removes the lowest 1. A <strong>power of two</strong> (1, 2, 4, 8 …) is exactly a number with a single 1 bit, so removing its lowest 1 leaves 0. That gives the classic test <code>x &gt; 0 and x &amp; (x - 1) == 0</code>. The <code>x &gt; 0</code> part matters because 0 also gives 0 (it has no bits to remove) and is not a power of two.</p>
  <p>The second expression is <code>x &amp; -x</code>, which keeps <em>only</em> the lowest 1 bit and clears everything else. The figure walks through both on x = 12, which is <code>1100</code>.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><text x="20" y="34" class="tm">x</text><text x="20" y="68" class="tm">x - 1</text><text x="20" y="108" class="tb">x &amp; (x-1)</text><text x="20" y="150" class="tm">-x</text><text x="20" y="184" class="tg">x &amp; -x</text><rect x="140" y="14" width="36" height="28" class="fs"/><text x="158" y="34" text-anchor="middle">1</text><rect x="180" y="14" width="36" height="28" class="fs"/><text x="198" y="34" text-anchor="middle">1</text><rect x="220" y="14" width="36" height="28" class="fr sr"/><text x="238" y="34" text-anchor="middle">0</text><rect x="260" y="14" width="36" height="28" class="fr sr"/><text x="278" y="34" text-anchor="middle">0</text><text x="158" y="68" text-anchor="middle">1</text><text x="198" y="68" text-anchor="middle">0</text><text x="238" y="68" text-anchor="middle">1</text><text x="278" y="68" text-anchor="middle">1</text><rect x="140" y="88" width="36" height="28" class="fb sb"/><text x="158" y="108" text-anchor="middle">1</text><rect x="180" y="88" width="36" height="28" class="fb sb"/><text x="198" y="108" text-anchor="middle">0</text><rect x="220" y="88" width="36" height="28" class="fb sb"/><text x="238" y="108" text-anchor="middle">0</text><rect x="260" y="88" width="36" height="28" class="fb sb"/><text x="278" y="108" text-anchor="middle">0</text><text x="120" y="150" text-anchor="end" class="tm">…1</text><text x="158" y="150" text-anchor="middle">0</text><text x="198" y="150" text-anchor="middle">1</text><text x="238" y="150" text-anchor="middle">0</text><text x="278" y="150" text-anchor="middle">0</text><rect x="140" y="164" width="36" height="28" class="fg sg"/><text x="158" y="184" text-anchor="middle">0</text><rect x="180" y="164" width="36" height="28" class="fg sg"/><text x="198" y="184" text-anchor="middle">1</text><rect x="220" y="164" width="36" height="28" class="fg sg"/><text x="238" y="184" text-anchor="middle">0</text><rect x="260" y="164" width="36" height="28" class="fg sg"/><text x="278" y="184" text-anchor="middle">0</text><text x="330" y="34" class="tm">x = 12</text><text x="330" y="68" class="tm">lowest 1 → 0, zeros → 1</text><text x="330" y="108" class="tb">= 8: lowest 1 removed</text><text x="330" y="150" class="tm">= ~x + 1 (flip, add 1)</text><text x="330" y="184" class="tg">= 4: lowest 1 alone</text></svg><figcaption>x = 12 (1100). The red boxes are the trailing zeros that both tricks rely on. x &amp; (x − 1) wipes the lowest 1; x &amp; −x keeps only the lowest 1.</figcaption></figure>
  <p>Start with the top two rows. Subtracting 1 from <code>1100</code> turns the lowest 1 (bit 2) into 0 and the two red trailing zeros into 1s, giving <code>1011</code>. AND-ing the two rows wipes bit 2 and everything to its right, leaving <code>1000</code> = 8: the lowest 1 is gone. Now the bottom two rows. In two's complement, −x is ~x + 1. Flipping <code>1100</code> gives …<code>0011</code>; adding 1 carries through the two 1s that used to be trailing zeros and stops at the first 0, which is exactly where x had its lowest 1. So −x is …<code>0100</code>, and x and −x agree only at that one bit. AND keeps it: <code>0100</code> = 4. The value <code>x &amp; -x</code> is often called <strong>lowbit(x)</strong>, the largest power of two that divides x.</p>
  <div class="fx" data-lang="py">x = 12                                      # 1100
print(format(x - 1, "04b"), format(x &amp; (x - 1), "04b"), format(x &amp; -x, "04b"))

def is_power_of_two(n):
    return n &gt; 0 and n &amp; (n - 1) == 0

print([n for n in range(0, 70) if is_power_of_two(n)])
flags = {"Dosa Hut": 13, "Chai Point": 10, "Night Owl": 8, "Closed": 0}
print("exactly one feature:", [k for k, f in flags.items() if is_power_of_two(f)])
print("lowest feature:", {k: f &amp; -f for k, f in flags.items()})</div>
  <div class="fx" data-lang="text">1011 1000 0100
[1, 2, 4, 8, 16, 32, 64]
exactly one feature: ['Night Owl']
lowest feature: {'Dosa Hut': 1, 'Chai Point': 2, 'Night Owl': 8, 'Closed': 0}</div>
  <p>The first line confirms the figure: <code>1011</code>, <code>1000</code> and <code>0100</code>. The power-of-two test finds 1, 2, 4, 8, 16, 32, 64 below 70 and correctly rejects 0. On the restaurants, only Night Owl (flags 8, just LATE) has exactly one feature; the "Closed" restaurant with flags 0 is correctly excluded by the <code>x &gt; 0</code> guard. The lowest features are VEG for Dosa Hut (13 → 1), FREE for Chai Point (10 → 2) and LATE for Night Owl. Both tricks are O(1).</p>
  <p>Recognise these from words like "power of two", "exactly one bit set", "lowest set bit" or "rightmost 1". The <code>x &amp; -x</code> step is also the engine of the <strong>Fenwick tree</strong> in <a class="xref" data-note="dsa_advanced">Advanced Data Structures</a>, which jumps between its boxes with <code>i += i &amp; -i</code> and <code>i -= i &amp; -i</code>. Power of Four adds one extra condition: the single 1 must sit at an even position, which you can test with <code>x &amp; 0x55555555</code>.</p>

  <h2 id="dsa-bt-subsets"><span class="num">08</span>Subsets via Bitmask</h2>
  <p>The product team wants to test the search page with every possible combination of three filters: VEG, FREE and CARD. How many combinations are there, and how do we loop over all of them? The <a class="xref" data-note="dsa_backtrack">Backtracking</a> note answered "all subsets" with recursion, deciding "include or skip" for one item at each level. Bitmasks give a flatter answer that needs no recursion at all.</p>
  <p>The key insight is that a subset is just a yes/no choice for each item, and n yes/no choices are exactly n bits. So every number from 0 to 2ⁿ − 1 describes one subset (bit i on means item i is in it), and every subset is described by exactly one such number. Counting from 0 to 2ⁿ − 1 therefore lists every subset once. Think of a binary odometer with three digits ticking from 000 to 111: on its way it shows every possible on/off pattern exactly once.</p>
  <div class="fx" data-lang="py">filters = ["VEG", "FREE", "CARD"]
n = len(filters)
for mask in range(1 &lt;&lt; n):                  # 0 .. 2^n - 1
    ticked = [filters[i] for i in range(n) if (mask &gt;&gt; i) &amp; 1]
    print(format(mask, "03b"), ticked)</div>
  <div class="fx" data-lang="text">000 []
001 ['VEG']
010 ['FREE']
011 ['VEG', 'FREE']
100 ['CARD']
101 ['VEG', 'CARD']
110 ['FREE', 'CARD']
111 ['VEG', 'FREE', 'CARD']</div>
  <p>Eight masks give eight combinations, from 000 (nothing ticked) to 111 (all three). Mask 101 has bits 0 and 2 on, so it means VEG and CARD. The inner list comprehension checks each of the n bits, so the total work is O(n · 2ⁿ). Now use each mask as a filter on the restaurants (Biryani Bros is 12 and Salad Co is 7), with the "has all" test from section 04:</p>
  <div class="fx" data-lang="py">restaurants = {"Dosa Hut": 13, "Chai Point": 10, "Biryani Bros": 12, "Salad Co": 7}
for mask in range(1 &lt;&lt; 3):                  # every combination of VEG, FREE, CARD
    match = [r for r, f in restaurants.items() if f &amp; mask == mask]
    print(format(mask, "03b"), match)</div>
  <div class="fx" data-lang="text">000 ['Dosa Hut', 'Chai Point', 'Biryani Bros', 'Salad Co']
001 ['Dosa Hut', 'Salad Co']
010 ['Chai Point', 'Salad Co']
011 ['Salad Co']
100 ['Dosa Hut', 'Biryani Bros', 'Salad Co']
101 ['Dosa Hut', 'Salad Co']
110 ['Salad Co']
111 ['Salad Co']</div>
  <p>With nothing ticked, all four restaurants match; mask 101 (VEG + CARD) matches Dosa Hut and Salad Co, the same answer section 04 gave; and only Salad Co survives FREE + CARD. The whole test suite is 8 masks × 4 restaurants = 32 AND operations.</p>
  <p>The limit is the 2ⁿ. For n = 20 there are about a million masks and roughly 20 million steps, which is the practical ceiling in Python; at n = 30 there are a billion and it is hopeless. So in an interview, constraints such as "n ≤ 20" (or 15, or 16) are a strong hint that the intended solution enumerates or stores masks. That is also the idea behind <strong>bitmask DP</strong>: a state like "which cities have been visited" in the travelling salesman problem is one integer, so it can index a list or key a dictionary, giving <code>dp[mask][i]</code> with 2ⁿ · n states. Compared with backtracking, the bitmask loop is shorter and gives each subset a number, but backtracking can prune early (stop exploring a branch that already fails), which a plain loop over masks cannot.</p>

  <h2 id="dsa-bt-fixed"><span class="num">09</span>Fixed-Width Problems</h2>
  <p>Some interview problems are written for languages with 32-bit integers: "reverse the bits of a 32-bit unsigned integer" or "add two integers without using + or −". In Python they hide two traps from section 03. A loop that stops "when n becomes 0" behaves differently because Python has no fixed width, and negative numbers never become 0 under right shifts:</p>
  <div class="fx" data-lang="py">n = -1
steps = 0
while n and steps &lt; 5:                      # without the step limit this never ends
    n &gt;&gt;= 1
    steps += 1
print(n, steps)
n = -1 &amp; 0xFFFFFFFF                         # treat it as a 32-bit unsigned value first
steps = 0
while n:
    n &gt;&gt;= 1
    steps += 1
print(n, steps)</div>
  <div class="fx" data-lang="text">-1 5
0 32</div>
  <p>Starting from −1, five right shifts left it at −1, and without the step limit the loop would never end. After masking to 32 bits it is the positive number 4294967295 (thirty-two 1s), and the loop stops after exactly 32 shifts. So the rule for fixed-width problems is: mask inputs with <code>0xFFFFFFFF</code>, loop a fixed number of times rather than "while n", and convert back to a signed number at the end if the answer can be negative.</p>
  <p><strong>Reverse Bits</strong> asks for the 32 bits of n in reverse order. Picture two stacks of plates: take the top plate (the last bit, <code>n &amp; 1</code>) off n and put it on top of <code>out</code> (shift <code>out</code> left and OR the bit in), 32 times. The loop must run exactly 32 times, because n's leading zeros have to become trailing zeros of the answer; a "while n" loop would stop early and lose them.</p>
  <div class="fx" data-lang="py">def reverse_bits(n):
    out = 0
    for _ in range(32):                     # exactly 32: leading zeros must move too
        out = (out &lt;&lt; 1) | (n &amp; 1)          # take n's last bit, put it on out's end
        n &gt;&gt;= 1
    return out

print(reverse_bits(43261596), reverse_bits(1))
print(int(format(43261596, "032b")[::-1], 2))   # string version as a cross-check</div>
  <div class="fx" data-lang="text">964176192 2147483648
964176192</div>
  <p>43261596 reverses to 964176192, the LeetCode example, and 1 (a single bit at position 0) becomes 2147483648 (a single bit at position 31). The string version, which formats to 32 digits, reverses the text and parses it back, gives the same answer and is a handy cross-check. The cost is 32 steps, which is O(1). If the interviewer asks "what if it is called millions of times?", the usual answer is to precompute the reverse of every 8-bit byte (256 entries) and reverse four bytes at a time.</p>
  <p><strong>Sum of Two Integers</strong> forbids + and −. Think of school addition column by column. Adding two bits without carrying is exactly XOR (1 + 1 gives 0 in that column), and a carry appears exactly where both bits are 1, which is <code>a &amp; b</code>, and moves one place left, <code>(a &amp; b) &lt;&lt; 1</code>. So we replace a with the carry-less sum and b with the carry, and repeat until there is no carry. For 2 + 3: <code>010 ^ 011 = 001</code> with carry <code>100</code>; then <code>001 ^ 100 = 101</code> with carry 0, so the answer is 5.</p>
  <div class="fx" data-lang="py">MASK, MAX_INT = 0xFFFFFFFF, 0x7FFFFFFF

def get_sum(a, b):
    a, b = a &amp; MASK, b &amp; MASK
    while b:
        carry = ((a &amp; b) &lt;&lt; 1) &amp; MASK       # columns where both are 1 carry left
        a = a ^ b                           # add without carry
        b = carry
    return a if a &lt;= MAX_INT else ~(a ^ MASK)   # 32-bit pattern back to a Python int

for a, b in [(2, 3), (-1, 1), (-5, -7), (1000, -1)]:
    print(a, "+", b, "=", get_sum(a, b))</div>
  <div class="fx" data-lang="text">2 + 3 = 5
-1 + 1 = 0
-5 + -7 = -12
1000 + -1 = 999</div>
  <p>The positive cases are straightforward, and the negative ones show why the masks are needed. With a negative number, Python's infinite leading 1s would make the carry travel left forever, so every step is masked to 32 bits, exactly as Java's ints would behave. At the end, a result above <code>0x7FFFFFFF</code> has its sign bit set, so it represents a negative number, and <code>~(a ^ MASK)</code> turns that 32-bit pattern into the matching Python negative (−12 and 999 above). The loop runs at most 32 times, O(1). In Java the same loop needs no masks at all; the masks are entirely the price of Python's unlimited integers.</p>

  <h2 id="dsa-bt-patterns"><span class="num">10</span>Patterns</h2>
  <p>Problem statements never say "use XOR" or "enumerate masks"; they describe a situation, and the skill is recognising which trick that situation calls for. The phrase "appears twice except one", "find the missing number" or "O(1) extra space" with duplicates points to XOR, because pairs cancel. The words "number of 1 bits", "Hamming" or "power of two" point to the <code>x &amp; (x - 1)</code> family. A small n, typically "n ≤ 20", together with "all combinations" or "any subset", points to looping over masks, and if the same small set has to be remembered as part of a state (visited nodes, used items), it points to bitmask DP. "32-bit", "unsigned", "reverse bits" or "without + or −" mean a fixed-width simulation: mask with <code>0xFFFFFFFF</code> and loop exactly 32 times. Finally, "letters of a word", "flags" or "has all of / any of" mean a set packed into a mask with AND tests.</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Pattern</th><th>Skeleton</th><th>Cost</th></tr>
    <tr><td>"twice except one", "missing number", "extra letter"</td><td>XOR cancelling</td><td><code>x = 0; for v in a: x ^= v</code></td><td>O(n), O(1) space</td></tr>
    <tr><td>"number of 1 bits", "Hamming distance"</td><td>Kernighan popcount</td><td><code>while n: n &amp;= n - 1; c += 1</code></td><td>O(number of 1s)</td></tr>
    <tr><td>"count bits for every i ≤ n"</td><td>bit DP</td><td><code>ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1)</code></td><td>O(n)</td></tr>
    <tr><td>"power of two", "lowest set bit"</td><td>x &amp; (x−1), x &amp; −x</td><td><code>x &gt; 0 and x &amp; (x - 1) == 0</code></td><td>O(1)</td></tr>
    <tr><td>"all subsets", "n ≤ 20"</td><td>mask enumeration</td><td><code>for mask in range(1 &lt;&lt; n)</code></td><td>O(n · 2ⁿ)</td></tr>
    <tr><td>"visit all nodes", state is a small set</td><td>bitmask DP</td><td><code>dp[mask][i]</code></td><td>O(2ⁿ · n²) typical</td></tr>
    <tr><td>"letters", "flags", "has all / any of"</td><td>set as a mask</td><td><code>m |= 1 &lt;&lt; i</code>; <code>a &amp; b == 0</code></td><td>O(1) per test</td></tr>
    <tr><td>"32-bit", "reverse bits", "no + or −"</td><td>fixed-width simulation</td><td><code>&amp; 0xFFFFFFFF</code>, loop 32 times</td><td>O(32)</td></tr>
  </table>
  <p>For practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, a good order is: Single Number and Missing Number (XOR), Number of 1 Bits and Counting Bits (popcount), Power of Two (lowest bit), Subsets and Maximum Product of Word Lengths (masks), then Reverse Bits and Sum of Two Integers (fixed width), and finally Single Number II, which forces you to count bits per position instead of XOR-ing.</p>

  <h2 id="dsa-bt-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Bit solutions are short, so their bugs hide in a single character. The most common is forgetting that 0 passes the power-of-two test. <code>0 &amp; (0 - 1)</code> is 0, so the bare expression wrongly says yes:</p>
  <div class="fx" data-lang="py">def is_pow2_wrong(x): return x &amp; (x - 1) == 0
def is_pow2(x):       return x &gt; 0 and x &amp; (x - 1) == 0
print(is_pow2_wrong(0), is_pow2(0), is_pow2(8))</div>
  <div class="fx" data-lang="text">True False True</div>
  <p>The unguarded version returned True for 0; adding <code>x &gt; 0</code> fixes it. A second classic slip is expecting <code>n &amp; (1 &lt;&lt; i)</code> to be 0 or 1. It is 0 or 2ⁱ, so comparing it with 1 is wrong for every bit except bit 0:</p>
  <div class="fx" data-lang="py">n = 13
print(n &amp; (1 &lt;&lt; 2), n &amp; (1 &lt;&lt; 2) == 1)      # 0 or 4, never 1
print((n &gt;&gt; 2) &amp; 1 == 1)                    # exactly 0 or 1</div>
  <div class="fx" data-lang="text">4 False
True</div>
  <p>For Dosa Hut's bit 2 the expression is 4, and <code>== 1</code> is False even though the bit is on. Inside an <code>if</code> the non-zero value is fine; when you need exactly 0 or 1, use <code>(n &gt;&gt; i) &amp; 1</code>. A third is using <code>~</code> to mean "flip the bits I can see":</p>
  <div class="fx" data-lang="py">print(~5, format(5 ^ 0b111, "03b"))         # flip only the 3 bits you have</div>
  <div class="fx" data-lang="text">-6 010</div>
  <p><code>~5</code> is −6, not <code>010</code>, because the infinite zeros on the left flip too. To flip only the low k bits, XOR with k ones, <code>x ^ ((1 &lt;&lt; k) - 1)</code>, which gave <code>010</code>. Beyond these, remember the precedence rule from section 02 (bracket every bit expression), the endless loop on negative numbers from section 09 (mask before <code>while n</code>), and that <code>bin()</code> of a negative number does not show its bits (use <code>format(x &amp; 0xFFFFFFFF, "032b")</code>). Avoid the XOR swap (<code>a ^= b; b ^= a; a ^= b</code>) in real code: it is slower than <code>a, b = b, a</code> and zeroes the value if both names refer to the same slot.</p>

  <h2 id="dsa-bt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key ideas</h3>
  <ul>
    <li><b>Bit i</b>: the binary digit worth 2ⁱ, counted from the right starting at 0. 13 = 8 + 4 + 1 = <code>1101</code>.</li>
    <li><b>Bitmask</b>: an int used as a set; bit i on means item i is in the set. VEG = 1, FREE = 2, CARD = 4, LATE = 8; Dosa Hut = 13, Chai Point = 10.</li>
    <li><b>Two's complement</b>: −x = ~x + 1. Python acts as if negatives have infinitely many leading 1s, so <code>~x == -x - 1</code>.</li>
    <li><b>Popcount / Hamming weight</b>: number of 1 bits. <b>Hamming distance</b>: popcount(a ^ b).</li>
    <li><b>lowbit</b>: <code>x &amp; -x</code>, the lowest 1 bit alone; <code>x &amp; (x - 1)</code> removes it.</li>
  </ul>
  <h3>Operators on 13 (1101) and 10 (1010)</h3>
  <table class="tbl">
    <tr><th>Expression</th><th>Result</th><th>Meaning</th></tr>
    <tr><td><code>13 &amp; 10</code></td><td>8 (1000)</td><td>features both have (intersection)</td></tr>
    <tr><td><code>13 | 10</code></td><td>15 (1111)</td><td>features either has (union)</td></tr>
    <tr><td><code>13 ^ 10</code></td><td>7 (0111)</td><td>features where they differ</td></tr>
    <tr><td><code>13 &lt;&lt; 2</code>, <code>13 &gt;&gt; 2</code></td><td>52, 3</td><td>×4, //4</td></tr>
    <tr><td><code>~13</code></td><td>−14</td><td>use <code>13 ^ 0b1111</code> = 2 to flip just 4 bits</td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py">(n &gt;&gt; i) &amp; 1          # check bit i
n | (1 &lt;&lt; i)            # set
n &amp; ~(1 &lt;&lt; i)           # clear
n ^ (1 &lt;&lt; i)            # toggle
n &amp; want == want        # has all bits of want
x &gt; 0 and x &amp; (x - 1) == 0   # power of two
x &amp; -x                  # lowest set bit
while n: n &amp;= n - 1; c += 1  # Kernighan popcount
for mask in range(1 &lt;&lt; n):   # every subset
    items = [a[i] for i in range(n) if (mask &gt;&gt; i) &amp; 1]
u = x &amp; 0xFFFFFFFF      # 32-bit view; back: u - (1 &lt;&lt; 32) if u &amp; 0x80000000 else u</div>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Technique</th><th>Time</th><th>Space</th></tr>
    <tr><td>Single-bit moves, pow2, lowbit</td><td>O(1)</td><td>O(1)</td></tr>
    <tr><td>XOR single / missing number</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Kernighan popcount</td><td>O(number of 1s)</td><td>O(1)</td></tr>
    <tr><td>Counting bits 0..n</td><td>O(n)</td><td>O(n)</td></tr>
    <tr><td>Subset enumeration</td><td>O(n · 2ⁿ), n ≤ ~20</td><td>O(n) per subset</td></tr>
    <tr><td>Reverse bits / sum without +</td><td>O(32)</td><td>O(1)</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>0 is not a power of two: always add <code>x &gt; 0</code>.</li>
    <li><code>n &amp; (1 &lt;&lt; i)</code> is 0 or 2ⁱ, not 0 or 1.</li>
    <li>Precedence: <code>1 &lt;&lt; n - 1</code> is <code>1 &lt;&lt; (n - 1)</code>; bracket everything.</li>
    <li><code>while n: n &gt;&gt;= 1</code> never ends for negative n; mask first.</li>
    <li><code>bin(-5)</code> is <code>'-0b101'</code>, not the stored bits.</li>
    <li>Fixed-width problems loop exactly 32 times, not "while n".</li>
    <li>XOR cancels only even counts; triples need per-bit counting.</li>
  </ul>

  <h2 id="dsa-bt-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a bitmask, and why would you use one instead of a set or a list of booleans?</summary><div class="qa-body">A bitmask is an integer in which bit i says whether item i is in a set. For a small universe (up to about 64 items) it is far more compact than a set, and union, intersection and difference become single <code>|</code>, <code>&amp;</code> and <code>^</code> operations. It is also hashable and can be used as a list index, which is why DP solutions use masks as states.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you check, set, clear and toggle bit i?</summary><div class="qa-body">Check: <code>(n &gt;&gt; i) &amp; 1</code>. Set: <code>n | (1 &lt;&lt; i)</code>. Clear: <code>n &amp; ~(1 &lt;&lt; i)</code>. Toggle: <code>n ^ (1 &lt;&lt; i)</code>. Each builds a mask with only bit i on and uses the operator whose column rule does the job: OR switches on, AND with all-but-i switches off, XOR flips.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between AND, OR and XOR?</summary><div class="qa-body">They all work column by column with no carries. AND gives 1 only where both bits are 1 (intersection, filtering), OR gives 1 where at least one is 1 (union, switching on), and XOR gives 1 where the bits differ (flipping, detecting changes). On 13 and 10 they give 8, 15 and 7.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do left and right shifts do arithmetically?</summary><div class="qa-body"><code>x &lt;&lt; k</code> multiplies by 2ᵏ and <code>x &gt;&gt; k</code> floor-divides by 2ᵏ. In Python the right shift of a negative number also floors, so <code>-7 &gt;&gt; 1</code> is −4, and <code>-1 &gt;&gt; k</code> stays −1 for any k.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>~5</code> equal to −6 in Python?</summary><div class="qa-body">Python ints behave like two's complement numbers with infinitely many leading bits. Flipping every bit of 5 also flips the infinite leading zeros into ones, which is a negative number. Since −x = ~x + 1, it follows that ~x = −x − 1 = −6. To flip only the low k bits, XOR with <code>(1 &lt;&lt; k) - 1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle a problem that says "32-bit integer" in Python?</summary><div class="qa-body">Mask values with <code>0xFFFFFFFF</code> to get the 32-bit pattern, loop a fixed 32 times instead of "while n", and at the end convert back: if bit 31 is set, subtract 2³² (or use <code>~(x ^ 0xFFFFFFFF)</code>). Without the mask, negative numbers carry infinite 1s and loops never end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does XOR-ing every element find the single number? Does order matter?</summary><div class="qa-body">x ^ x = 0, x ^ 0 = x, and XOR is commutative and associative, so the order does not matter: every pair cancels to 0 wherever its two copies are, and only the single value remains. It runs in O(n) time with O(1) extra space, beating a Counter's O(n) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every number appears three times except one. Why does XOR fail, and what works?</summary><div class="qa-body">XOR only cancels values that appear an even number of times; three copies leave one copy behind for every value. Instead, for each of the 32 bit positions count how many numbers have that bit set and take the count mod 3; the leftover bits form the answer. That is O(32·n) time and O(1) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>x &amp; (x - 1)</code> do, and name two uses.</summary><div class="qa-body">It clears the lowest set bit, because subtracting 1 turns that bit to 0 and the zeros below it to 1s, and AND removes them all. Uses: the power-of-two test (<code>x &gt; 0 and x &amp; (x - 1) == 0</code>) and Kernighan's popcount, which repeats it once per 1 bit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>x &amp; -x</code> return for x = 12, and where is it used?</summary><div class="qa-body">4, the lowest set bit alone (12 is 1100). It works because −x = ~x + 1, which matches x only at that bit. The Fenwick tree uses it to jump between boxes: <code>i += i &amp; -i</code> to update and <code>i -= i &amp; -i</code> to query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare ways to count 1 bits.</summary><div class="qa-body"><code>bin(n).count("1")</code> is simple; <code>n.bit_count()</code> (3.10+) is fastest; the shift loop is O(total bits) because it visits zeros; Kernighan's loop is O(number of 1s). For every number from 0 to n, use the DP <code>ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1)</code> in O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>print(6 &amp; 3, 6 | 3, 6 ^ 3, 6 &lt;&lt; 1, -7 &gt;&gt; 1)</code></summary><div class="qa-body"><code>2 7 5 12 -4</code>. 110 &amp; 011 = 010, 110 | 011 = 111, 110 ^ 011 = 101, 6 × 2 = 12, and right shift floors, so −7 &gt;&gt; 1 = floor(−3.5) = −4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many subsets does a 20-item set have, and is enumerating them practical?</summary><div class="qa-body">2²⁰, about a million; with n work per subset that is about 20 million steps, which runs in a few seconds in Python. At n = 30 there are a billion subsets, which is too many, so you need pruning (backtracking), DP or meet-in-the-middle.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bitmask enumeration vs backtracking for subsets: when would you pick each?</summary><div class="qa-body">Both produce all 2ⁿ subsets. The mask loop is shorter, iterative, and gives each subset a number that can be a DP state. Backtracking can prune: if a partial choice already breaks a constraint, it skips the whole branch, which a plain mask loop cannot do. Pick masks for small n without pruning, backtracking when pruning cuts the search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you add two integers without + or −?</summary><div class="qa-body">XOR gives the sum without carries, and <code>(a &amp; b) &lt;&lt; 1</code> gives the carries. Replace a with the XOR and b with the carry and repeat until the carry is 0. In Python you must mask every step to 32 bits, because a negative carry would otherwise move left forever, and convert the final pattern back to a signed int.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is bitmask DP, and how do you recognise a problem that needs it?</summary><div class="qa-body">It is dynamic programming where part of the state is a set of items stored as a mask, such as "which cities are visited" in the travelling salesman problem: <code>dp[mask][last]</code>. The giveaway is a small n (around 12 to 20) combined with a need to remember which items were used. The state count is 2ⁿ · n, so it only works for small n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name some real-world uses of bit manipulation.</summary><div class="qa-body">Unix file permissions (rwx as 4 + 2 + 1), feature flags packed into one column, IP subnet masks, chess bitboards, Bloom filters (a bit array plus hashes), bitmap indexes in databases, and compression and checksum code. In all of them a few bits replace a larger structure and set operations become single instructions.</div></details>
</main>
`
});
