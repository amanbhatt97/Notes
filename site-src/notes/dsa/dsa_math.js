// notes/dsa/dsa_math.js — Math & Number Theory
Object.assign(TOPIC_CONTENT, {
  "dsa_math": `<main>
<h1>Math &amp; Number Theory</h1>
  <div class="where"><span>DSA</span><span>Problem-Solving Techniques</span><span>Math &amp; Number Theory</span></div>
  <p class="lead">A handful of school-maths ideas show up again and again in interviews: GCD, primes, remainders, fast powers, counting ways, and the limits of computer numbers. This note ties them to one Biteful story: a region server hands out <strong>order ids in steps of 10</strong> (1010, 1020, …, 1080), and those ids must be spread over database shards, counted, combined and printed without overflow. We find GCD with Euclid (and see why it decides how many shards get used), list primes with a sieve traced on n = 30, factorise, reduce with modular arithmetic (and see why answers come "mod 10⁹ + 7"), compute powers by squaring, divide under a modulus, count pairs of orders with nCr and Pascal's triangle, and finish with the overflow and floating-point traps that break correct formulas. Every pattern has trigger words, a template, a traced table, tested code, its cost and practice problems from the tracker. Every output is a real run (Python 3.13).</p>

  <h2 id="dsa-mt-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-mt-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Bits (exponent bits) · Hashing (buckets) · DP (counting ways)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-mt-ga)"/>
<rect x="170" y="62" width="300" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Math &amp; Number Theory</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · order ids, shards, mod p</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-mt-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Advanced structures (next)</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">range queries on revenue</text>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-mt-ga)"/>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Dynamic Programming</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">"ways" mod 10⁹ + 7</text>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-mt-ga)"/>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Hashing</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">bucket = hash % m</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-mt-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Problem Tracker → Math: ~75 problems, Palindrome Number → Reaching Points</text>
</svg><figcaption>Reading order for the techniques block: … → Bit Manipulation → <b>Math &amp; Number Theory</b> → Advanced Data Structures. Math comes after Bits because fast exponentiation reads the exponent's bits, and after DP because "number of ways mod 10⁹ + 7" is where DP answers end up.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dsa_bits">Bit Manipulation</a>, <a class="xref" data-note="dsa_hashing">Hashing</a> and <a class="xref" data-note="dsa_dp">DP</a></b><span>Bits showed 13 = 1101 and shifts; fast power walks those bits. Hashing put keys into buckets with <code>hash % m</code>; here we see why the choice of m matters. DP counted "number of ways" and asked for the answer modulo 10⁹ + 7 without explaining why. <a class="xref" data-note="dsa_complexity">Complexity</a> showed Python ints never overflow.</span></li>
    <li><b>This note adds: number facts that turn loops into formulas</b><span>Euclid's GCD and LCM, primes and the sieve, factorisation, modular arithmetic, binary exponentiation, the modular inverse, combinations and Pascal's triangle, digit work and overflow, floating-point precision, and reservoir sampling.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_advanced">Advanced Data Structures</a></b><span>The last note of the track asks range questions over Biteful's daily revenue, which needs new structures rather than new formulas. Meanwhile <a class="xref" data-note="dsa_dp">DP</a> and many tracker problems reuse <code>% MOD</code>, <code>pow(a, b, m)</code> and <code>math.comb</code>. Practise in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-mt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Running example: order ids <b>1010, 1020, …, 1080</b> (step 10), the 8 orders A to H of the day, 48 samosas and 18 gulab jamuns.</p>
  <ol class="story">
    <li><b>GCD &amp; LCM (Euclid)</b><span>Q: what is the largest identical combo box for 48 samosas and 18 jamuns, and when do two restock cycles meet? → gcd(48, 18) = 6 in 3 remainder steps; lcm(4, 6) = 12. The same gcd decides that ids in steps of 10 put into 10 shards all land in shard 0. Which shard counts avoid sharing a factor with anything?</span></li>
    <li><b>Primes &amp; the sieve</b><span>Q: which numbers have no factors to share? → Primes; test one in O(√n), list all up to 30 with the sieve (cross out multiples of 2, 3, 5): 2, 3, 5, …, 29. Every other number is built from primes, so how do we split one into them?</span></li>
    <li><b>Factors &amp; divisors</b><span>Q: what is 360 made of, and how many batch sizes divide it? → 360 = 2³·3²·5 by trial division up to √n; (3+1)(2+1)(1+1) = 24 divisors. Now back to the shards: how do we compute with remainders safely?</span></li>
    <li><b>Modular arithmetic</b><span>Q: which shard does an order go to, and how do we keep a huge count small? → id % 7 uses all 7 shards; (a + b) % m and (a·b) % m can be reduced at every step, which is why answers come mod 10⁹ + 7. But a power like 2^(10¹⁸) still needs 10¹⁸ multiplications…</span></li>
    <li><b>Fast exponentiation</b><span>Q: compute aᵇ mod m in log b steps? → Square the base, multiply it in where b has a 1 bit: 3¹³ mod 1000 = 323 in 4 rounds. Division, however, does not survive "% m"…</span></li>
    <li><b>Modular inverse</b><span>Q: how do we divide under a modulus? → Multiply by b⁻¹ = b^(p−2) mod p (Fermat): 3⁻¹ = 333333336 mod 10⁹+7. That unlocks the formula with a division in it…</span></li>
    <li><b>Combinatorics</b><span>Q: how many ways to batch 2 of the 8 orders on one rider, and for huge n, mod p? → C(8, 2) = 28 = Pascal's row 8; nCr mod p = fact[n]·inv_fact[r]·inv_fact[n−r]. Correct formulas can still print wrong numbers on a real machine…</span></li>
    <li><b>Overflow &amp; precision</b><span>Q: when does a correct formula give a wrong answer? → 32-bit overflow (reversing 1534236469), floor vs truncate (−7 // 2 = −4), floats (the day's bill 1345.1999… instead of 1345.20; use paise). One last kind of maths: choosing fairly…</span></li>
    <li><b>Random sampling</b><span>Q: pick 3 lucky orders fairly from a stream of unknown length? → Reservoir sampling: order i replaces a winner with chance k/(i+1); every order ends with chance k/n.</span></li>
  </ol>

<h2 id="dsa-mt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Math &amp; Number Theory</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">GCD &amp; LCM</div>
        <ul>
          <li><b>Euclid</b> — <code>gcd(a, b) = gcd(b, a % b)</code>, stop at b = 0</li>
          <li><b>Cost</b> — O(log min(a, b))</li>
          <li><b>LCM</b> — <code>a // gcd(a, b) * b</code></li>
          <li><code>math.gcd</code>, <code>math.lcm</code> (3.9+, many args)</li>
          <li>💡 Cutting a 48×18 cm sheet into the biggest equal squares</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Primes</div>
        <ul>
          <li><b>Test</b> — try divisors up to √n: O(√n)</li>
          <li><b>Sieve</b> — cross out multiples from i·i: O(n log log n)</li>
          <li><b>Factorise</b> — divide out d while d·d ≤ n; leftover &gt; 1 is prime</li>
          <li><b>Divisors</b> — come in pairs (i, n/i)</li>
          <li>⚠ 0 and 1 are not prime</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Modular arithmetic</div>
        <ul>
          <li><b>Clock maths</b> — keep only the remainder</li>
          <li><b>+ − ×</b> can be reduced at every step</li>
          <li><b>10**9 + 7</b> — a big prime; fits 32-bit, products fit 64-bit</li>
          <li><b>Python %</b> — result takes the divisor's sign; never negative for m &gt; 0</li>
          <li>⚠ Division is NOT reducible: multiply by the inverse</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fast power &amp; inverse</div>
        <ul>
          <li><b>Square and multiply</b> — O(log b)</li>
          <li><code>pow(a, b, m)</code> built in</li>
          <li><b>Inverse (p prime)</b> — <code>pow(a, p - 2, p)</code> (Fermat)</li>
          <li><code>pow(a, -1, m)</code> — Python 3.8+</li>
          <li><b>Extended Euclid</b> — finds x with a·x ≡ 1 (mod m)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Counting</div>
        <ul>
          <li><b>nCr</b> — <code>math.comb(n, r)</code>; nPr — <code>math.perm</code></li>
          <li><b>Pascal</b> — C(n, r) = C(n−1, r−1) + C(n−1, r)</li>
          <li><b>Many nCr mod p</b> — precompute fact and inverse fact</li>
          <li><b>Grid paths</b> — C(m+n−2, m−1)</li>
          <li><b>Reservoir sampling</b> — k random items from a stream</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Count Primes</b> — sieve</li>
          <li><b>Pow(x, n)</b> — fast power, negative n</li>
          <li><b>Happy Number</b> — digit squares + cycle detection</li>
          <li><b>Plus One</b> — carry from the right</li>
          <li><b>Excel Column</b> — base 26 with no zero</li>
          <li><b>Unique Paths</b> — nCr · <b>Rotate Array</b> — gcd cycles</li>
        </ul>
      </div>
    </div>
  </div>

    <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-mt-gcd"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">GCD &amp; LCM</span><span class="rm-sub">Euclid traced; why shards collide</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-primes"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Primes &amp; the Sieve</span><span class="rm-sub">√n test; sieve traced on n = 30</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-factor"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Factors &amp; Divisors</span><span class="rm-sub">360 = 2³·3²·5</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-mod"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Modular Arithmetic</span><span class="rm-sub">Shards, and why 10⁹ + 7</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-pow"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Fast Exponentiation</span><span class="rm-sub">3¹³ traced bit by bit</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-inv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Modular Inverse</span><span class="rm-sub">Dividing under a modulus</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-comb"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Combinatorics</span><span class="rm-sub">nCr, Pascal, nCr mod p</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-digits"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Digits, Overflow &amp; Precision</span><span class="rm-sub">32-bit limits, floats, paise</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-random"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Random Sampling</span><span class="rm-sub">Reservoir sampling</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words → tool</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">7 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">% at the end, 1 is not prime, floats</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-mt-gcd"><span class="num">01</span>GCD &amp; LCM</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's kitchen has 48 samosas and 18 gulab jamuns and wants as many identical combo boxes as possible, with nothing left over. And the database team spreads order ids over shards with <code>id % m</code>, and with m = 10 every order lands in the same shard. Both puzzles hide the same number: the largest number that divides two others. Listing all divisors is slow for big numbers. Is there a shortcut?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>greatest common divisor</b>", "largest equal groups / squares / boxes", "simplify the fraction / ratio", "<b>least common multiple</b>", "when do they meet again", "cycles", "measure with two jugs".</p>
  </div>
  <p>The <strong>greatest common divisor</strong> (GCD) of 48 and 18 is the largest number that divides both: 6. So 6 identical boxes, each with 8 samosas and 3 jamuns. The school method lists all divisors of both. Euclid (Greece, ~300 BC) noticed something better: any number that divides 48 and 18 also divides 48 − 18, and 48 − 18 − 18, and so on down to the remainder 48 % 18 = 12. So <code>gcd(48, 18) = gcd(18, 12)</code>. Repeat until the second number is 0.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600"><defs><marker id="mt-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><rect x="10" y="30" width="118" height="40" rx="8" class="fb sb"/><text x="69" y="55" text-anchor="middle">gcd(48, 18)</text><line x1="130" y1="50" x2="156" y2="50" class="sb" stroke-width="1.5" marker-end="url(#mt-a1)"/><text x="69" y="92" text-anchor="middle" class="tm">48 % 18 = 12</text><rect x="158" y="30" width="118" height="40" rx="8" class="fb sb"/><text x="217" y="55" text-anchor="middle">gcd(18, 12)</text><line x1="278" y1="50" x2="304" y2="50" class="sb" stroke-width="1.5" marker-end="url(#mt-a1)"/><text x="217" y="92" text-anchor="middle" class="tm">18 % 12 = 6</text><rect x="306" y="30" width="118" height="40" rx="8" class="fb sb"/><text x="365" y="55" text-anchor="middle">gcd(12, 6)</text><line x1="426" y1="50" x2="452" y2="50" class="sb" stroke-width="1.5" marker-end="url(#mt-a1)"/><text x="365" y="92" text-anchor="middle" class="tm">12 % 6 = 0</text><rect x="454" y="30" width="118" height="40" rx="8" class="fg sg"/><text x="513" y="55" text-anchor="middle">gcd(6, 0)</text><text x="512" y="92" text-anchor="middle" class="tg">b = 0 → answer 6</text></svg><figcaption>Euclid's algorithm: replace (a, b) with (b, a % b). The numbers shrink fast; when b hits 0, a is the GCD.</figcaption></figure>
<div class="fx" data-lang="py">import math

def gcd(a, b):
    while b:
        print(f"  gcd({a}, {b}): {a} % {b} = {a % b}")
        a, b = b, a % b            # gcd(a, b) == gcd(b, a % b)
    return a

print("gcd(48, 18) =", gcd(48, 18))   # 48 samosas, 18 gulab jamuns -&gt; identical combo boxes

def lcm(a, b):
    return a // math.gcd(a, b) * b   # divide first: smaller numbers

print(math.gcd(48, 18), lcm(4, 6), math.lcm(4, 6, 10), math.gcd(0, 7))</div>
  <div class="fx" data-lang="text">  gcd(48, 18): 48 % 18 = 12
  gcd(18, 12): 18 % 12 = 6
  gcd(12, 6): 12 % 6 = 0
gcd(48, 18) = 6
6 12 60 7</div>
  <table class="tbl out"><caption>Trace: gcd(48, 18)</caption>
    <tr><th>step</th><th>a</th><th>b</th><th>a % b</th><th>next pair</th></tr>
    <tr><td>1</td><td>48</td><td>18</td><td>12</td><td>(18, 12)</td></tr>
    <tr><td>2</td><td>18</td><td>12</td><td>6</td><td>(12, 6)</td></tr>
    <tr><td>3</td><td>12</td><td>6</td><td>0</td><td>(6, 0) → answer 6</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cutting a 48 cm × 18 cm card into equal squares: cut off as many 18×18 squares as you can. A 12×18 strip is left. Now cut 12×12 squares from that strip, leaving 6×12. Then 6×6 squares fit exactly. The last square size is the GCD. That is Euclid, done with scissors.</p>
  </div>
  <p>Why it is fast: every two steps the bigger number at least halves, so it takes O(log min(a, b)) steps. Even for 18-digit numbers it is under 100 steps.</p>
  <p><strong>LCM</strong> (least common multiple) is the smallest number both divide: Dosa Hut restocks every 4 days and Chai Point every 6; they restock on the same day every 12 days. Formula: <code>lcm(a, b) = a · b / gcd(a, b)</code>. Divide before multiplying to keep the numbers small (matters in Java/C++).</p>
  <h3>Why the shards collide</h3>
  <p>The region server issues ids 1010, 1020, …, 1080. Put them into m shards with <code>id % m</code>:</p>
<div class="fx" data-lang="py">import math
ids = [1010 + 10 * k for k in range(8)]          # a region server hands out ids in steps of 10
print("order ids:", ids)
for m in [10, 4, 7]:                             # number of database shards
    shards = [i % m for i in ids]
    print(f"m={m:&gt;2}: shards {shards}  used {len(set(shards))} of {m}   gcd(10, {m}) = {math.gcd(10, m)}")</div>
  <div class="fx" data-lang="text">order ids: [1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080]
m=10: shards [0, 0, 0, 0, 0, 0, 0, 0]  used 1 of 10   gcd(10, 10) = 10
m= 4: shards [2, 0, 2, 0, 2, 0, 2, 0]  used 2 of 4   gcd(10, 4) = 2
m= 7: shards [2, 5, 1, 4, 0, 3, 6, 2]  used 7 of 7   gcd(10, 7) = 1</div>
  <p>With m = 10, gcd(10, 10) = 10 and every id lands in shard 0. With m = 4, gcd = 2 and only 4 / 2 = 2 shards are used. With m = 7, gcd = 1 (7 shares no factor with the step 10) and all 7 shards are used. In general ids in steps of s fill only m / gcd(s, m) of the m shards. That is why hash tables like a bucket count with no common factor with the keys' pattern, and primes have no factors to share.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">while b: a, b = b, a % b     # gcd in a
lcm = a // gcd(a, b) * b      # math.gcd, math.lcm in Python 3.9+</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>gcd(a, b)</strong>: largest d dividing both. <strong>lcm(a, b)</strong>: smallest positive number divisible by both. <strong>Coprime</strong>: gcd = 1 (e.g. 10 and 7). Facts: <code>gcd(a, 0) = a</code>, <code>gcd · lcm = a · b</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>a * b // gcd(a, b)</code> builds a·b first: fine in Python, an overflow in Java/C++ when a and b are near 10⁹. Write <code>a // gcd(a, b) * b</code>. And gcd(0, 0) is 0, so guard any division by the gcd.</p>
  </div>
  <p>Where you meet it: simplifying fractions (18/48 = 3/8), aspect ratios (1920×1080 → 16:9), gear and timetable cycles, "Water and Jug" puzzles, the GCD of strings problem, and rotating an array in place (problem 7).</p>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><a class="xref" data-note="dsa_problems">Problem Tracker</a> → Math: <b>1979 Find Greatest Common Divisor of Array</b>, <b>1071 Greatest Common Divisor of Strings</b>, <b>914 X of a Kind in a Deck of Cards</b>, then <b>365 Water and Jug Problem</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Primes &amp; the Sieve.</b> Shards collide when the shard count shares a factor with the id step. Which numbers share no factors with anything smaller, and how do we list them quickly?</div>

  <h2 id="dsa-mt-primes"><span class="num">02</span>Primes &amp; the Sieve</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want a shard count with no factors to share: a prime. How do we test whether one number is prime without trying every divisor, and how do we list all primes up to n without testing each one separately?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>prime</b>", "count primes less than n", "prime factors", "closest primes in a range", "is n prime", constraints like n ≤ 10⁶ with many queries.</p>
  </div>
  <p>A <strong>prime</strong> is a number greater than 1 whose only divisors are 1 and itself: 2, 3, 5, 7, 11 … Every other number above 1 is a product of primes, so primes are the "atoms" of integers.</p>
  <h3>Testing one number: stop at √n</h3>
  <p>If 36 = a × b, one of a, b is at most 6 (√36). Divisors come in pairs around the square root (1·36, 2·18, 3·12, 4·9, 6·6). So if nothing up to √n divides n, nothing above does either. That turns O(n) into O(√n): for n = 10¹², a million checks instead of a trillion.</p>
<div class="fx" data-lang="py">import math
def is_prime(n):
    if n &lt; 2:
        return False
    for i in range(2, math.isqrt(n) + 1):   # a factor pair always has one side &lt;= sqrt(n)
        if n % i == 0:
            return False
    return True

print([n for n in range(30) if is_prime(n)])
print(is_prime(10**9 + 7), is_prime(10**9 + 9), is_prime(10**9))</div>
  <div class="fx" data-lang="text">[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
True True False</div>
  <p>10⁹ + 7 and 10⁹ + 9 are prime (that will matter in section 04); 10⁹ is not.</p>
  <h3>All primes up to n: the Sieve of Eratosthenes</h3>
  <p>To list every prime up to n, testing each one separately repeats work. The sieve does it the other way round: start with everything marked "prime". Take the first unmarked number (2), cross out all its multiples. Take the next unmarked one (3), cross out its multiples. Whatever survives is prime.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school assembly of students numbered 2 to 30. Student 2 says "every multiple of 2, sit down". Then the next one standing (3) says the same. Then 5. After 5 nobody new sits (7·7 = 49 &gt; 30). Everyone still standing is prime.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600"><rect x="25" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="50" y="35" text-anchor="middle">2</text><rect x="81" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="35" text-anchor="middle">3</text><rect x="137" y="12" width="50" height="36" rx="4" class="fs"/><text x="162" y="30" text-anchor="middle" class="tm">4</text><text x="162" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="218" y="35" text-anchor="middle">5</text><rect x="249" y="12" width="50" height="36" rx="4" class="fs"/><text x="274" y="30" text-anchor="middle" class="tm">6</text><text x="274" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="330" y="35" text-anchor="middle">7</text><rect x="361" y="12" width="50" height="36" rx="4" class="fs"/><text x="386" y="30" text-anchor="middle" class="tm">8</text><text x="386" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="12" width="50" height="36" rx="4" class="fs"/><text x="442" y="30" text-anchor="middle" class="tm">9</text><text x="442" y="43" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="473" y="12" width="50" height="36" rx="4" class="fs"/><text x="498" y="30" text-anchor="middle" class="tm">10</text><text x="498" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="554" y="35" text-anchor="middle">11</text><rect x="25" y="56" width="50" height="36" rx="4" class="fs"/><text x="50" y="74" text-anchor="middle" class="tm">12</text><text x="50" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="81" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="79" text-anchor="middle">13</text><rect x="137" y="56" width="50" height="36" rx="4" class="fs"/><text x="162" y="74" text-anchor="middle" class="tm">14</text><text x="162" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="56" width="50" height="36" rx="4" class="fs"/><text x="218" y="74" text-anchor="middle" class="tm">15</text><text x="218" y="87" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="249" y="56" width="50" height="36" rx="4" class="fs"/><text x="274" y="74" text-anchor="middle" class="tm">16</text><text x="274" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="330" y="79" text-anchor="middle">17</text><rect x="361" y="56" width="50" height="36" rx="4" class="fs"/><text x="386" y="74" text-anchor="middle" class="tm">18</text><text x="386" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="442" y="79" text-anchor="middle">19</text><rect x="473" y="56" width="50" height="36" rx="4" class="fs"/><text x="498" y="74" text-anchor="middle" class="tm">20</text><text x="498" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="56" width="50" height="36" rx="4" class="fs"/><text x="554" y="74" text-anchor="middle" class="tm">21</text><text x="554" y="87" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="25" y="100" width="50" height="36" rx="4" class="fs"/><text x="50" y="118" text-anchor="middle" class="tm">22</text><text x="50" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="81" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="123" text-anchor="middle">23</text><rect x="137" y="100" width="50" height="36" rx="4" class="fs"/><text x="162" y="118" text-anchor="middle" class="tm">24</text><text x="162" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="100" width="50" height="36" rx="4" class="fs"/><text x="218" y="118" text-anchor="middle" class="tm">25</text><text x="218" y="131" text-anchor="middle" class="tr" font-size="9">÷5</text><rect x="249" y="100" width="50" height="36" rx="4" class="fs"/><text x="274" y="118" text-anchor="middle" class="tm">26</text><text x="274" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="100" width="50" height="36" rx="4" class="fs"/><text x="330" y="118" text-anchor="middle" class="tm">27</text><text x="330" y="131" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="361" y="100" width="50" height="36" rx="4" class="fs"/><text x="386" y="118" text-anchor="middle" class="tm">28</text><text x="386" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="442" y="123" text-anchor="middle">29</text><rect x="473" y="100" width="50" height="36" rx="4" class="fs"/><text x="498" y="118" text-anchor="middle" class="tm">30</text><text x="498" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="554" y="123" text-anchor="middle">31</text><text x="25" y="160" class="tg">green = prime (never crossed)</text><text x="330" y="160" class="tm">grey = crossed out by its smallest prime</text></svg><figcaption>The sieve for 2..31. Each composite is crossed out by its smallest prime factor. We only need to sieve with 2, 3 and 5, because 7·7 = 49 is already past 30.</figcaption></figure>
<div class="fx" data-lang="py">def sieve(n, trace=False):
    """All primes &lt;= n."""
    if n &lt; 2:
        return []
    is_p = [True] * (n + 1)
    is_p[0] = is_p[1] = False
    i = 2
    while i * i &lt;= n:                           # only primes up to sqrt(n) do any crossing
        if is_p[i]:
            crossed = [j for j in range(i * i, n + 1, i) if is_p[j]]
            for j in range(i * i, n + 1, i):    # smaller multiples were already crossed
                is_p[j] = False
            if trace: print(f"prime {i}: cross out {crossed}")
        i += 1
    return [k for k in range(n + 1) if is_p[k]]

print(sieve(30, trace=True))
print(len(sieve(1_000_000)))</div>
  <div class="fx" data-lang="text">prime 2: cross out [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]
prime 3: cross out [9, 15, 21, 27]
prime 5: cross out [25]
[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
78498</div>
  <table class="tbl out"><caption>Trace: sieve for n = 30</caption>
    <tr><th>i</th><th>still prime?</th><th>crossed out (starting at i·i)</th><th>new crossings</th></tr>
    <tr><td>2</td><td>yes</td><td>4, 6, 8, …, 30</td><td>14</td></tr>
    <tr><td>3</td><td>yes</td><td>9, 15, 21, 27 (12, 18, 24, 30 were already gone)</td><td>4</td></tr>
    <tr><td>4</td><td>no (crossed by 2)</td><td>skipped</td><td>0</td></tr>
    <tr><td>5</td><td>yes</td><td>25 (only 25 ≤ 30 not yet crossed)</td><td>1</td></tr>
    <tr><td>6</td><td colspan="3">6 · 6 = 36 &gt; 30: stop. Survivors: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29</td></tr>
  </table>
  <p>Two details make it fast. The outer loop stops at √n. The inner loop starts at <code>i * i</code>, because smaller multiples like 2·i or 3·i were crossed out already by 2 and 3. Cost is O(n log log n), which is practically linear: a million numbers in well under a second (78,498 primes).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Prime</strong>: an integer p &gt; 1 with no divisors except 1 and p. <strong>Sieve of Eratosthenes</strong>: mark every multiple of each prime ≤ √n, starting from its square; the unmarked numbers are the primes. O(n log log n) time, O(n) space.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>0 and 1 are not prime, and 2 is the only even prime. Many "is prime" bugs return True for 1. Also, <code>int(n ** 0.5)</code> can be off by one for huge n because of floats; <code>math.isqrt(n)</code> is the exact version.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>204 Count Primes</b> (the sieve; solved in section 11), <b>1175 Prime Arrangements</b>, <b>2523 Closest Prime Numbers in Range</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Factors &amp; Divisors.</b> We can list the atoms. Every other number is a product of them. How do we break one number (say 360 orders a day, to be split into equal batches) into its primes, and what does that tell us?</div>

  <h2 id="dsa-mt-factor"><span class="num">03</span>Factors &amp; Divisors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful gets 360 orders on a busy day and wants to split them into equal batches. Which batch sizes work, and how many are there, without trying all 360?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>prime factors</b>", "number of divisors", "kth factor", "perfect number", "ugly number (only factors 2, 3, 5)", "trailing zeroes of n!".</p>
  </div>
  <p><strong>Prime factorisation</strong> writes n as a product of primes: 360 = 2³ · 3² · 5. It is unique (the "fundamental theorem of arithmetic"). To find it, try d = 2, 3, 4 … and divide out each d as many times as it goes. When d·d passes what is left, the leftover (if &gt; 1) is itself a prime.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Peeling a number like an onion: peel off every layer of 2, then every layer of 3, and so on. You never peel a 4 because the 2s are already gone.</p>
  </div>
<div class="fx" data-lang="py">def factorize(n):
    factors = {}
    d = 2
    while d * d &lt;= n:
        while n % d == 0:          # divide out d completely
            factors[d] = factors.get(d, 0) + 1
            n //= d
        d += 1
    if n &gt; 1:                      # whatever is left is a prime bigger than sqrt
        factors[n] = factors.get(n, 0) + 1
    return factors

for n in [12, 360, 97, 1001, 2 ** 10, 600851475143]:
    print(n, factorize(n))

def divisors(n):
    small, large = [], []
    i = 1
    while i * i &lt;= n:
        if n % i == 0:
            small.append(i)
            if i != n // i:
                large.append(n // i)
        i += 1
    return small + large[::-1]

print(divisors(36))</div>
  <div class="fx" data-lang="text">12 {2: 2, 3: 1}
360 {2: 3, 3: 2, 5: 1}
97 {97: 1}
1001 {7: 1, 11: 1, 13: 1}
1024 {2: 10}
600851475143 {71: 1, 839: 1, 1471: 1, 6857: 1}
[1, 2, 3, 4, 6, 9, 12, 18, 36]</div>
  <table class="tbl out"><caption>Trace: factorising 360</caption>
    <tr><th>d</th><th>n before</th><th>divides?</th><th>n after</th><th>factors so far</th></tr>
    <tr><td>2</td><td>360</td><td>3 times</td><td>45</td><td>2³</td></tr>
    <tr><td>3</td><td>45</td><td>2 times</td><td>5</td><td>2³·3²</td></tr>
    <tr><td>4</td><td>5</td><td>4·4 = 16 &gt; 5: stop</td><td>5</td><td>leftover 5 is prime → 2³·3²·5</td></tr>
  </table>
  <p>Non-prime d values like 4 never divide, because all 2s were removed earlier. Time O(√n). 600851475143 is Project Euler problem 3; it finishes instantly because n keeps shrinking. <code>divisors</code> uses the same √n pairing as the prime test.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>From the factorisation you get everything else. Number of divisors of 2³·3²·5 is (3+1)(2+1)(1+1) = 24: 24 possible batch sizes for 360 orders. GCD takes the smaller power of each prime, LCM the bigger. Many "count divisors" or "is it a perfect square" questions reduce to the exponents.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Prime factorisation</strong>: n = p₁^e₁ · p₂^e₂ · …, unique. <strong>Number of divisors</strong> d(n) = (e₁ + 1)(e₂ + 1)…. Trial division finds it in O(√n).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the leftover: after the loop, if n &gt; 1 it is a prime factor bigger than √(original n) (97 → {97: 1}). And for divisors, don't add √n twice when n is a perfect square (36: 6 once).</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>263 Ugly Number</b>, <b>507 Perfect Number</b> (divisors in √n pairs), <b>1492 The kth Factor of n</b>, <b>172 Factorial Trailing Zeroes</b> (count factors of 5).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Modular Arithmetic.</b> We know which shard counts are safe (primes like 7). Now we need to compute with "id % m" properly, and to understand why so many answers must be given "mod 10⁹ + 7".</div>

  <h2 id="dsa-mt-mod"><span class="num">04</span>Modular Arithmetic</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Shards use remainders. Counting problems ("number of ways to batch the orders") produce numbers with hundreds of digits. Which operations can we do on remainders instead of the full numbers, and why does every such problem say "modulo 10⁹ + 7"?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"return the answer <b>modulo 10⁹ + 7</b>", "remainder", "divisible by k", "pairs whose sum is divisible by k", "<b>cyclic</b> / wraps around", "last digit".</p>
  </div>
  <p>It is 10 o'clock. What time is it after 5 hours? 3 o'clock, not 15. A clock keeps only the remainder after dividing by 12. That is <strong>modular arithmetic</strong>: <code>(10 + 5) % 12 = 3</code>. The shards are a clock with 7 hours: order 1010 goes to 1010 % 7 = 2.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A clock face, or the days of the week: after Saturday comes Sunday again. You can add hours or multiply days and only ever keep the position on the dial.</p>
  </div>
  <p>Why interviewers use it: answers like "number of ways" grow beyond any fixed-size integer (100! has 158 digits). So the problem says "return the answer modulo 10⁹ + 7". You must keep numbers small <em>during</em> the calculation, not just at the end.</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Safe to reduce early?</th></tr>
    <tr><td><code>(a + b) % m == (a % m + b % m) % m</code></td><td>Yes</td></tr>
    <tr><td><code>(a - b) % m == (a % m - b % m) % m</code></td><td>Yes (Python keeps it non-negative)</td></tr>
    <tr><td><code>(a * b) % m == (a % m) * (b % m) % m</code></td><td>Yes</td></tr>
    <tr><td><code>(a / b) % m</code></td><td><strong>No</strong>: multiply by the modular inverse of b instead (section 06)</td></tr>
  </table>
<div class="fx" data-lang="py">MOD = 10**9 + 7

print("clock:", (10 + 5) % 12)
a, b = 10**12, 10**15
print((a + b) % MOD, (a % MOD + b % MOD) % MOD)        # same
print((a * b) % MOD, (a % MOD) * (b % MOD) % MOD)      # same
print((a - b) % MOD)                                   # Python: never negative
print(-7 % 5, 7 % -5, divmod(-7, 5))

fact = 1
for i in range(1, 101):
    fact = fact * i % MOD                              # reduce every step
print("100! mod p =", fact)
print("100! has", len(str(__import__("math").factorial(100))), "digits")
print("largest 32-bit int:", 2**31 - 1, " (10^9+7)^2 =", (10**9 + 7) ** 2, "&lt;", 2**63 - 1, (10**9 + 7) ** 2 &lt; 2**63 - 1)</div>
  <div class="fx" data-lang="text">clock: 3
992993007 992993007
999999664 999999664
6993000
3 -3 (-2, 3)
100! mod p = 437918130
100! has 158 digits
largest 32-bit int: 2147483647  (10^9+7)^2 = 1000000014000000049 &lt; 9223372036854775807 True</div>
  <p>Reducing early and reducing late give the same remainders (992993007, 999999664). Computing 100! with <code>% MOD</code> after every multiplication keeps every intermediate value below 10⁹ + 7, while the true 100! has 158 digits.</p>
  <h3>Why 10⁹ + 7?</h3>
  <ul>
    <li>It is <strong>prime</strong> (section 02 checked it), so every non-zero number has a modular inverse (section 06) and division works.</li>
    <li>It fits in a signed <strong>32-bit</strong> int (below 2147483647).</li>
    <li>The product of two values below it, about 10¹⁸, fits in a signed <strong>64-bit</strong> int, so <code>a * b % MOD</code> never overflows in C++/Java.</li>
    <li>It is large, so two different true answers rarely share a remainder by accident. 998244353 is the other common prime.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>a ≡ b (mod m)</strong>: a and b leave the same remainder when divided by m. Addition, subtraction and multiplication respect this, so you may reduce at any step.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Negative remainders. Python: <code>-7 % 5 == 3</code> (result has the sign of the divisor). Java, C++, JavaScript: <code>-7 % 5 == -2</code>. In those languages write <code>((a % m) + m) % m</code>. Python's <code>//</code> also floors: <code>-7 // 2 == -4</code>. And taking <code>% MOD</code> only at the very end is wrong in fixed-width languages and slow in Python.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>1015 Smallest Integer Divisible by K</b> (only remainders matter), <b>1018 Binary Prefix Divisible By 5</b>, <b>1497 Check If Array Pairs Are Divisible by k</b>, then <b>1680 Concatenation of Consecutive Binary Numbers</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Fast Exponentiation.</b> We can keep products small. But some answers are powers: 2ⁿ subsets mod p with n = 10¹⁸, or the number of 13-symbol codes. Reducing after each multiplication is still 10¹⁸ multiplications.</div>

  <h2 id="dsa-mt-pow"><span class="num">05</span>Fast Exponentiation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's coupon codes are 13 symbols long, each one of 3 symbols, so there are 3¹³ codes. Computing aᵇ by multiplying a, b times is O(b). For b = 10¹⁸ that never finishes. Can we use the binary digits of b (the Bits note) to need only about log b steps?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>x to the power n</b>", "n up to 10⁹ / 10¹⁸", "last digits of a huge power", "count good numbers", "power mod", "nth Fibonacci for huge n" (matrix power).</p>
  </div>
  <p>3¹³ by repeated multiplication is 12 multiplications. The trick: <code>3¹³ = 3⁸ · 3⁴ · 3¹</code> because 13 = 8 + 4 + 1 (binary <code>1101</code>, Dosa Hut's flags from the Bits note). And 3¹, 3², 3⁴, 3⁸ come from squaring the previous one. So we need about log₂ b squarings plus a few multiplications.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600"><text x="20" y="24" class="tm">13 in binary:</text><rect x="140" y="6" width="44" height="28" class="fg sg"/><text x="162" y="25" text-anchor="middle">1</text><text x="162" y="50" text-anchor="middle" class="tm">8</text><rect x="190" y="6" width="44" height="28" class="fg sg"/><text x="212" y="25" text-anchor="middle">1</text><text x="212" y="50" text-anchor="middle" class="tm">4</text><rect x="240" y="6" width="44" height="28" class="fs"/><text x="262" y="25" text-anchor="middle">0</text><text x="262" y="50" text-anchor="middle" class="tm">2</text><rect x="290" y="6" width="44" height="28" class="fg sg"/><text x="312" y="25" text-anchor="middle">1</text><text x="312" y="50" text-anchor="middle" class="tm">1</text><text x="380" y="24" class="tm">13 = 8 + 4 + 1</text><rect x="20" y="72" width="128" height="40" rx="8" class="fg sg"/><text x="84" y="97" text-anchor="middle">3¹ = 3</text><text x="84" y="130" text-anchor="middle" class="tg">bit on: use it</text><rect x="162" y="72" width="128" height="40" rx="8" class="fs"/><text x="226" y="97" text-anchor="middle" class="tm">3² = 9</text><text x="226" y="130" text-anchor="middle" class="tm">bit off: skip</text><rect x="304" y="72" width="128" height="40" rx="8" class="fg sg"/><text x="368" y="97" text-anchor="middle">3⁴ = 81</text><text x="368" y="130" text-anchor="middle" class="tg">bit on: use it</text><rect x="446" y="72" width="128" height="40" rx="8" class="fg sg"/><text x="510" y="97" text-anchor="middle">3⁸ = 6561</text><text x="510" y="130" text-anchor="middle" class="tg">bit on: use it</text><text x="300" y="168" text-anchor="middle">3¹³ = 3⁸ · 3⁴ · 3¹ = 6561 · 81 · 3 = 1594323</text><text x="300" y="186" text-anchor="middle" class="tm">4 squarings instead of 12 multiplications</text></svg><figcaption>Square and multiply. Walk the bits of the exponent from the right; keep squaring the base; multiply it into the answer only where the bit is 1.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Folding a paper doubles its thickness each fold. To get 13 layers' worth you do not add sheets one by one; you note the 1-fold, 4-fold and 8-fold stacks and combine them.</p>
  </div>
<div class="fx" data-lang="py">def fast_pow(a, b, m, trace=False):
    result = 1
    a %= m
    while b &gt; 0:
        if trace: print(f"b={b:&gt;4b}  bit={b &amp; 1}  power={a:&gt;3}  ", end="")
        if b &amp; 1:                  # this bit of b is on: include current power
            result = result * a % m
        if trace: print(f"result={result}")
        a = a * a % m              # a, a^2, a^4, a^8, ...
        b &gt;&gt;= 1
    return result

print(fast_pow(3, 13, 1000, trace=True))           # last 3 digits of 3^13
print(pow(3, 13, 1000), 3 ** 13, 3 ** 13 % 1000)
print(fast_pow(2, 10**18, 10**9 + 7), pow(2, 10**18, 10**9 + 7))</div>
  <div class="fx" data-lang="text">b=1101  bit=1  power=  3  result=3
b= 110  bit=0  power=  9  result=3
b=  11  bit=1  power= 81  result=243
b=   1  bit=1  power=561  result=323
323
323 1594323 323
719476260 719476260</div>
  <table class="tbl out"><caption>Trace: 3¹³ mod 1000 (the last 3 digits of the number of codes)</caption>
    <tr><th>round</th><th>b (binary)</th><th>lowest bit</th><th>current power of 3 (mod 1000)</th><th>result</th></tr>
    <tr><td>1</td><td>1101</td><td>1 → multiply</td><td>3¹ = 3</td><td>3</td></tr>
    <tr><td>2</td><td>110</td><td>0 → skip</td><td>3² = 9</td><td>3</td></tr>
    <tr><td>3</td><td>11</td><td>1 → multiply</td><td>3⁴ = 81</td><td>3 · 81 = 243</td></tr>
    <tr><td>4</td><td>1</td><td>1 → multiply</td><td>3⁸ = 6561 → 561</td><td>243 · 561 = 136323 → 323</td></tr>
  </table>
  <p>4 rounds instead of 12 multiplications, and 3¹³ = 1,594,323 indeed ends in 323. For b = 10¹⁸ it is about 60 rounds. O(log b) multiplications. Python's built-in <code>pow(a, b, m)</code> does exactly this in C; always use it in real code. Never write <code>a ** b % m</code> for a big b: it builds the full giant number first.</p>
  <h3>Template</h3>
<div class="fx" data-lang="text">result = 1
while b:
    if b &amp; 1: result = result * a % m     # this bit is on
    a = a * a % m                          # a, a², a⁴, a⁸, …
    b &gt;&gt;= 1</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>Also called <strong>binary exponentiation</strong> or <strong>exponentiation by squaring</strong>: aᵇ = ∏ a^(2ⁱ) over the bits i where b has a 1. The same idea powers matrix exponentiation (Fibonacci in O(log n)) and RSA encryption.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Negative exponents (Pow(x, n) allows n &lt; 0): compute x^|n| and take 1 / result, and remember that −n overflows for n = −2³¹ in 32-bit languages. Floats: <code>2.0 ** 1000</code> is fine, but powers of floats lose precision.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>50 Pow(x, n)</b> (solved in section 11), <b>1922 Count Good Numbers</b> (5^a · 4^b mod p), <b>326 Power of Three</b>, then <b>372 Super Pow</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Modular Inverse.</b> Plus, minus, times and powers all work with remainders. Division does not: the formula for C(n, r) divides by r!, and "% m" breaks it. How do we divide under a modulus?</div>

  <h2 id="dsa-mt-inv"><span class="num">06</span>Modular Inverse</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>nCr = n! / (r! (n−r)!) has a division. If we keep n! only as a remainder mod 10⁹ + 7, we cannot divide remainders. What plays the role of "1/b" when all we have are remainders?</p>
  </div>
  <p>Under a modulus you cannot just divide. 12 / 3 = 4, but (12 mod 7) / (3 mod 7) = 5 / 3, which is not an integer. Instead we ask: which number x makes <code>3 · x ≡ 1 (mod 7)</code>? That x (here 5, since 15 = 2·7 + 1) acts like "1/3". Multiplying by it is division.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>On a 7-hour clock, "undo 3 steps forward three times" is not a division; it is finding the number of 3-hour jumps that lands you back on 1. Five jumps of 3 hours = 15 hours = 1 o'clock.</p>
  </div>
  <ul>
    <li><strong>When m is prime</strong> (like 10⁹ + 7): Fermat's little theorem gives <code>a⁻¹ = a^(m−2) mod m</code>. One <code>pow</code> call (section 05).</li>
    <li><strong>Any m with gcd(a, m) = 1</strong>: extended Euclid (section 01, run backwards) finds x, y with a·x + m·y = 1; then x is the inverse. Python 3.8+ does this for you: <code>pow(a, -1, m)</code>.</li>
    <li><strong>gcd(a, m) ≠ 1</strong>: no inverse exists (e.g. 2 has no inverse mod 4). This is why the modulus is chosen prime.</li>
  </ul>
<div class="fx" data-lang="py">MOD = 10**9 + 7

inv3 = pow(3, MOD - 2, MOD)        # Fermat: a^(p-2) is a^-1 when p is prime
print(inv3, 3 * inv3 % MOD)
print(pow(3, -1, MOD) == inv3)     # Python 3.8+: built-in inverse

# "divide" 12 by 3 under the modulus
print(12 * inv3 % MOD)

def ext_gcd(a, b):
    """Returns (g, x, y) with a*x + b*y == g."""
    if b == 0:
        return a, 1, 0
    g, x, y = ext_gcd(b, a % b)
    return g, y, x - (a // b) * y

g, x, y = ext_gcd(3, 7)
print(g, x, y, x % 7)              # 3 * 5 = 15 = 2*7 + 1, so 3^-1 mod 7 = 5</div>
  <div class="fx" data-lang="text">333333336 1
True
4
1 -2 1 5</div>
  <p>333333336 looks random but it is "1/3" in the world of mod 10⁹ + 7: three of them make exactly 1, and 12 · 333333336 mod p = 4 = 12 / 3. The extended Euclid result x = −2 is also an inverse of 3 mod 7; normalise with <code>% 7</code> to get 5.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>modular inverse</strong> of a mod m is the x with a·x ≡ 1 (mod m). It exists iff gcd(a, m) = 1. For prime p: a⁻¹ = a^(p−2) mod p.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using Fermat with a non-prime modulus gives a wrong "inverse" silently. And 0 has no inverse. As long as n &lt; p, no factorial up to n! is 0 mod p, which is why the factorial trick works for interview limits (n ≤ 10⁵, p = 10⁹ + 7).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Combinatorics.</b> With inverses, division under a modulus works. Now we can count: in how many ways can 2 of the day's 8 orders share one rider, and how do we compute C(n, r) mod p for big n?</div>

  <h2 id="dsa-mt-comb"><span class="num">07</span>Combinatorics</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Dispatch wants to batch 2 of the day's 8 orders (A to H) on one rider. How many possible batches are there, without listing them? And when n is 10⁵, how do we get the count mod 10⁹ + 7?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>number of ways</b> to choose / arrange", "how many paths", "Pascal's triangle", "kth permutation", "distribute identical items", "mod 10⁹ + 7".</p>
  </div>
  <p>"In how many ways can we pick 2 orders of 8?" Order does not matter (batch {A, B} = batch {B, A}), so it is a <strong>combination</strong>: C(8, 2) = 8! / (2! · 6!) = 28. These are exactly the 28 pairs the Arrays note's brute force checked. If order matters (first drop and second drop), it is a <strong>permutation</strong>: P(8, 2) = 8 · 7 = 56.</p>
  <p><strong>Pascal's triangle</strong> builds every C(n, r) by addition only: each number is the sum of the two above it. Reason: for C(n, r), either order n is picked (choose r−1 more from n−1) or not (choose r from n−1).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Choosing 2 orders out of 8: look at order H. Either H is in the batch (pick 1 more from the other 7: 7 ways) or it isn't (pick 2 from the other 7: 21 ways). 7 + 21 = 28. That one sentence is Pascal's rule.</p>
  </div>
<div class="fx" data-lang="py">import math
from itertools import combinations
orders = list("ABCDEFGH")                          # the day's 8 orders
pairs = list(combinations(orders, 2))              # batch 2 orders on one rider
print(len(pairs), math.comb(8, 2), pairs[:4], "...")
print(math.comb(5, 2), math.perm(5, 2), math.factorial(5))

def pascal(rows):
    tri = [[1]]
    for _ in range(rows - 1):
        prev = tri[-1]
        tri.append([1] + [prev[i] + prev[i + 1] for i in range(len(prev) - 1)] + [1])
    return tri

for row in pascal(9):
    print(row)
print("rider paths 2 blocks right, 2 down:", math.comb(4, 2))</div>
  <div class="fx" data-lang="text">28 28 [('A', 'B'), ('A', 'C'), ('A', 'D'), ('A', 'E')] ...
10 20 120
[1]
[1, 1]
[1, 2, 1]
[1, 3, 3, 1]
[1, 4, 6, 4, 1]
[1, 5, 10, 10, 5, 1]
[1, 6, 15, 20, 15, 6, 1]
[1, 7, 21, 35, 35, 21, 7, 1]
[1, 8, 28, 56, 70, 56, 28, 8, 1]
rider paths 2 blocks right, 2 down: 6</div>
  <p>Row 8 of the triangle, [1, 8, 28, 56, 70, 56, 28, 8, 1], holds C(8, r) for r = 0 … 8: 28 pairs, 56 triples, 70 batches of 4. And 28 = 7 + 21 from row 7, as the analogy said. A rider who must go 2 blocks right and 2 blocks down has C(4, 2) = 6 shortest routes (Unique Paths).</p>
  <h3>nCr mod p for many queries</h3>
  <p>For one exact answer, <code>math.comb</code> is enough (Python ints never overflow). For thousands of queries "nCr mod p", precompute <code>fact[i]</code> and <code>inv_fact[i]</code> once in O(N); each query is then O(1). The inverse factorials are filled backwards from a single <code>pow</code> (section 06), since <code>1/(i−1)! = i / i!</code>.</p>
<div class="fx" data-lang="py">import math
MOD = 10**9 + 7
# nCr mod p for many queries: precompute factorials once
N = 1000
fact = [1] * (N + 1)
for i in range(1, N + 1):
    fact[i] = fact[i - 1] * i % MOD
inv_fact = [1] * (N + 1)
inv_fact[N] = pow(fact[N], MOD - 2, MOD)
for i in range(N, 0, -1):
    inv_fact[i - 1] = inv_fact[i] * i % MOD

def ncr_mod(n, r):
    if r &lt; 0 or r &gt; n:
        return 0
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD

print(ncr_mod(8, 2), ncr_mod(1000, 500), math.comb(1000, 500) % MOD)
print("C(1000, 500) has", len(str(math.comb(1000, 500))), "digits")</div>
  <div class="fx" data-lang="text">28 159835829 159835829
C(1000, 500) has 300 digits</div>
  <table class="tbl">
    <tr><th>Question shape</th><th>Formula</th><th>On our data</th></tr>
    <tr><td>Choose r of n, order does not matter</td><td>C(n, r) = n! / (r!(n−r)!)</td><td>C(8, 2) = 28</td></tr>
    <tr><td>Arrange r of n, order matters</td><td>P(n, r) = n! / (n−r)!</td><td>P(8, 2) = 56</td></tr>
    <tr><td>Paths in a grid moving only right/down</td><td>C(right + down, down)</td><td>C(4, 2) = 6</td></tr>
    <tr><td>Number of subsets of n items</td><td>2ⁿ</td><td>2⁸ = 256</td></tr>
    <tr><td>Split n identical items into k groups (stars and bars)</td><td>C(n + k − 1, k − 1)</td><td>6 samosas to 3 boxes: C(8, 2) = 28</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>C(n, r)</strong> ("n choose r"): the number of r-element subsets of n items. <strong>Pascal's rule</strong>: C(n, r) = C(n−1, r−1) + C(n−1, r), with C(n, 0) = C(n, n) = 1.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing up combinations and permutations (does the order of the two drops matter?). And computing <code>fact[n] // (fact[r] * fact[n-r]) % MOD</code> after reducing the factorials mod p: integer division of remainders is wrong; multiply by inverse factorials.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>118 Pascal's Triangle</b>, <b>119 Pascal's Triangle II</b>, <b>62 Unique Paths</b> (in the DP ladder; the formula version is in section 11), then <b>1641 Count Sorted Vowel Strings</b> (stars and bars) and <b>60 Permutation Sequence</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Digits, Overflow &amp; Precision.</b> The formulas are right. On a real machine, numbers have limits: 32-bit ints overflow, division rounds in different directions, and floats cannot even store ₹1345.20 exactly. When does a correct formula print a wrong answer?</div>

  <h2 id="dsa-mt-digits"><span class="num">08</span>Digits, Overflow &amp; Precision</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Python hides integer overflow, so code that is right in Python can be wrong in the language the problem was written for. And money stored as floats drifts. Which limits must we check by hand, and how do we work with the digits of a number safely?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>32-bit signed integer</b>", "return 0 if it overflows", "reverse the digits", "palindrome number", "<b>truncate toward zero</b>", "without converting to string", money, "precision", "add two numbers given as strings".</p>
  </div>
  <p>Many easy problems work digit by digit: sum of digits, reverse a number, palindrome number. Two tools: <code>n % 10</code> gives the last digit, <code>n // 10</code> drops it. <code>divmod(n, 10)</code> does both at once. Converting to <code>str</code> is also fine in Python, and interviewers usually accept it if you mention the arithmetic way.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A milometer with a fixed number of wheels: past 99999 it rolls to 00000. Python's integers have unlimited wheels; most other languages have 32 or 64. The problem statement tells you which milometer it was written for.</p>
  </div>
<div class="fx" data-lang="py">def digits(n):
    out = []
    while n &gt; 0:
        n, d = divmod(n, 10)       # peel the last digit
        out.append(d)
    return out[::-1] or [0]

def reverse_int(n):
    sign = -1 if n &lt; 0 else 1
    n, r = abs(n), 0
    while n:
        r = r * 10 + n % 10
        n //= 10
    r *= sign
    return r if -2**31 &lt;= r &lt;= 2**31 - 1 else 0   # LeetCode: 0 on 32-bit overflow

print(digits(1080), sum(digits(1080)), [int(c) for c in str(1080)])   # an order id
print(reverse_int(1080), reverse_int(-120), reverse_int(1534236469))
print(7 // 2, -7 // 2, int(-7 / 2), 2 ** 64)</div>
  <div class="fx" data-lang="text">[1, 0, 8, 0] 9 [1, 0, 8, 0]
801 -21 0
3 -4 -3 18446744073709551616</div>
  <p>Order id 1080 peels into [1, 0, 8, 0] with digit sum 9, and reverses to 801. Python ints never overflow (<code>2 ** 64</code> prints in full), but many problems are written for 32-bit languages and say "return 0 if the result overflows". You must check the range yourself: −2³¹ to 2³¹ − 1. Reversing 1534236469 gives 9646324351, which is too big, so the answer is 0.</p>
  <h3>Floats: the day's bill</h3>
<div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
print(0.1 + 0.2, 0.1 + 0.2 == 0.3)
bill = sum(c * 1.18 for c in charges)              # each charge + 18% GST, as floats
print("bill as float:", bill, " == 1345.2?", bill == 1345.2)
paise = sum(c * 118 for c in charges)              # work in whole paise instead (₹1 = 100 paise)
print("bill in paise:", paise, "-&gt; ₹", paise // 100, "and", paise % 100, "paise")
print(2**53 + 1 == float(2**53 + 1), int(float(2**53 + 1)))   # floats lose integers above 2^53
total = sum(charges) * 10**7                       # a big daily total in paise
print(total, total &lt;= 2**31 - 1)                   # would overflow a 32-bit int</div>
  <div class="fx" data-lang="text">0.30000000000000004 False
bill as float: 1345.1999999999998  == 1345.2? False
bill in paise: 134520 -&gt; ₹ 1345 and 20 paise
False 9007199254740992
11400000000 False</div>
  <p>Each charge plus 18% GST, summed as floats, gives 1345.1999999999998, and <code>== 1345.2</code> is False. 0.1, 0.2 and 1.18 have no exact binary form (like 1/3 in decimal). Working in whole paise (integers) gives exactly 134520 paise = ₹1345.20. Floats also stop representing every integer above 2⁵³, and a day's total in paise can pass the 32-bit limit.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Overflow</strong>: a result outside the range of a fixed-width integer (32-bit signed: −2,147,483,648 to 2,147,483,647). <strong>Floating-point error</strong>: most decimals are stored approximately; errors grow with each operation. Integers in Python are exact and unbounded.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Rounding of negatives. <code>-7 // 2</code> is −4 (floor), but <code>int(-7 / 2)</code> is −3 (truncate toward zero, like C/Java). When a problem says "truncate toward zero" (Divide Two Integers, Evaluate RPN), use <code>int(a / b)</code>. Never compare floats with <code>==</code>; never use <code>/</code> for big integer maths; store money as integers.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>9 Palindrome Number</b>, <b>7 Reverse Integer</b> (the overflow check), <b>66 Plus One</b>, <b>258 Add Digits</b>, then <b>43 Multiply Strings</b> (big numbers as digit lists).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Random Sampling.</b> Everything so far was exact counting. One more kind of maths shows up in interviews: choosing fairly at random, for example 3 lucky orders from a stream whose length you don't know.</div>

  <h2 id="dsa-mt-random"><span class="num">09</span>Random Sampling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful gives free dessert to 3 random orders each day. Orders stream in all day; we don't know how many will come and can't store them all. How do we make sure every order had the same chance?</p>
  </div>
  <h3>Recognise it</h3>
  <div class="callout pred"><span class="label">Trigger words</span>
    <p>"<b>random</b> node / index", "uniformly", "equal probability", "stream of unknown length", "shuffle", "pick with weight".</p>
  </div>
  <p>A lucky draw at a mall: people keep walking in all day, and you must pick 3 winners fairly, but you do not know how many people will come and you cannot keep a list of everyone. <strong>Reservoir sampling</strong> solves it with O(k) memory.</p>
  <ol>
    <li>Keep the first k orders as the current winners.</li>
    <li>When order i (0-based) arrives, pick a random number j from 0 to i. If j &lt; k, order i replaces winner j. So order i gets in with chance k / (i+1).</li>
    <li>At the end, every order had the same chance k / n of being a winner.</li>
  </ol>
<div class="fx" data-lang="py">import random

def reservoir_sample(stream, k, rng):
    sample = []
    for i, x in enumerate(stream):
        if i &lt; k:
            sample.append(x)               # fill the first k seats
        else:
            j = rng.randint(0, i)          # 0..i inclusive: i+1 choices
            if j &lt; k:
                sample[j] = x              # x wins a seat with chance k/(i+1)
    return sample

rng = random.Random(42)
counts = [0] * 10
for _ in range(100_000):
    for x in reservoir_sample(range(10), 3, rng):
        counts[x] += 1
print([round(c / 100_000, 2) for c in counts])   # each should be about 3/10</div>
  <div class="fx" data-lang="text">[0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3]</div>
  <p>Over 100,000 simulated days of 10 orders, every order was chosen 30% of the time, as promised (3 / 10). For a list you already hold, <code>random.sample(lst, k)</code> and <code>random.shuffle</code> (Fisher-Yates) are the library tools.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Why fair, for k = 1: item i is picked with 1/(i+1), then must survive every later item: (i+1)/(i+2) · (i+2)/(i+3) · … · (n−1)/n. Everything cancels to 1/n.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>randint(0, i)</code> includes both ends (i + 1 choices); using <code>randint(0, i - 1)</code> or <code>randrange(i)</code> biases the draw toward later items.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p><b>382 Linked List Random Node</b> (k = 1), <b>398 Random Pick Index</b>, <b>384 Shuffle an Array</b>, <b>528 Random Pick with Weight</b> (prefix sums + binary search).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Patterns.</b> Nine tools. Which words in a problem point to which one?</div>

<h2 id="dsa-mt-patterns"><span class="num">10</span>Patterns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Nine tools. Faced with a new problem, which words should make us reach for which one?</p>
  </div>
  <div class="cards">
    <div><b>"modulo 10⁹ + 7"</b><p>Reduce after every + and ×. Division → multiply by <code>pow(b, MOD-2, MOD)</code>.</p><small>Never take % only at the end</small></div>
    <div><b>"count primes", "prime factors"</b><p>Many queries up to n → sieve once. One number → trial division to √n.</p><small>O(n log log n) vs O(√n)</small></div>
    <div><b>"x to the power n"</b><p>Large n, or "last digits of a huge power" → fast power.</p><small>pow(a, b, m)</small></div>
    <div><b>"number of ways"</b><p>Choosing without order → nCr; grid moves → C(m+n−2, m−1); else DP.</p><small>math.comb</small></div>
    <div><b>"digits", "reverse", "palindrome number"</b><p>Peel with % 10 and // 10; watch the 32-bit limit.</p><small>divmod(n, 10)</small></div>
    <div><b>"cycle", "repeats", "rotate by k"</b><p>Remainders repeat; gcd(n, k) counts the cycles; Floyd finds loops.</p><small>Happy Number, Rotate Array</small></div>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classic Problems.</b> Signals need practice: seven classic problems, each one tool in disguise.</div>

  <h2 id="dsa-mt-problems"><span class="num">11</span>Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can we use the tools on the questions interviewers actually ask, where the maths is hidden inside a story?</p>
  </div>
  <h3>1. Count Primes</h3>
  <p>Count primes strictly less than n (n up to 5 · 10⁶). Testing each number is O(n√n): too slow. Sieve: O(n log log n). In Python, crossing out with a slice assignment on a <code>bytearray</code> runs in C and is many times faster than an inner loop.</p>
  <div class="fx" data-lang="py">def count_primes(n):
    """Number of primes strictly less than n."""
    if n &lt; 3:
        return 0
    is_p = bytearray([1]) * n          # 1 byte per number, fast to slice
    is_p[0] = is_p[1] = 0
    for i in range(2, int(n ** 0.5) + 1):
        if is_p[i]:
            is_p[i * i::i] = bytearray(len(range(i * i, n, i)))   # cross out in one slice
    return sum(is_p)

for n in [10, 0, 1, 2, 3, 100, 5_000_000]:
    print(n, "-&gt;", count_primes(n))</div>
  <div class="fx" data-lang="text">10 -&gt; 4
0 -&gt; 0
1 -&gt; 0
2 -&gt; 0
3 -&gt; 1
100 -&gt; 25
5000000 -&gt; 348513</div>
  <p>Edge cases: n = 0, 1, 2 have no primes below them; "less than n" means 2 itself counts only from n = 3. Space O(n) bytes.</p>

  <h3>2. Pow(x, n)</h3>
  <p>Implement x to the power n for float x and any int n (including −2³¹). Fast power on floats, and for negative n use (1/x)ⁿ.</p>
  <div class="fx" data-lang="py">def my_pow(x, n):
    if n &lt; 0:
        x, n = 1 / x, -n               # x^-n = (1/x)^n
    result = 1.0
    while n:
        if n &amp; 1:
            result *= x
        x *= x
        n &gt;&gt;= 1
    return result

for x, n in [(2.0, 10), (2.1, 3), (2.0, -2), (1.0, -2**31), (0.5, 0), (-2.0, 3)]:
    print(x, n, "-&gt;", round(my_pow(x, n), 5))</div>
  <div class="fx" data-lang="text">2.0 10 -&gt; 1024.0
2.1 3 -&gt; 9.261
2.0 -2 -&gt; 0.25
1.0 -2147483648 -&gt; 1.0
0.5 0 -&gt; 1.0
-2.0 3 -&gt; -8.0</div>
  <p>O(log |n|). In Java, <code>-n</code> overflows for −2³¹, so you store n in a <code>long</code> first. Python has no such problem.</p>

  <h3>3. Happy Number</h3>
  <p>Replace n by the sum of the squares of its digits, repeatedly. Happy if it reaches 1. 19 → 82 → 68 → 100 → 1, happy. 2 never reaches 1 and loops forever (through 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4). So it is cycle detection: a set of seen values, or Floyd's slow/fast pointers from the Linked List note for O(1) space.</p>
  <div class="fx" data-lang="py">def is_happy(n):
    def next_num(x):
        return sum(int(d) ** 2 for d in str(x))
    slow, fast = n, next_num(n)
    while fast != 1 and slow != fast:   # Floyd: a loop means "not happy"
        slow = next_num(slow)
        fast = next_num(next_num(fast))
    return fast == 1

def is_happy_set(n):
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
    return n == 1

print([n for n in range(1, 50) if is_happy(n)])
print(is_happy(19), is_happy(2), is_happy_set(19), is_happy_set(2))</div>
  <div class="fx" data-lang="text">[1, 7, 10, 13, 19, 23, 28, 31, 32, 44, 49]
True False True False</div>
  <p>Why it must end: any number with 4+ digits maps to a much smaller one (9999 → 324), so values stay below a few hundred and must repeat. Each step is O(digits).</p>

  <h3>4. Plus One</h3>
  <p>A big number is stored as a list of digits. Add one. Exactly the school method: start from the right; a digit below 9 just increases and we stop; a 9 becomes 0 and the carry moves left. If every digit was 9, put a 1 in front.</p>
  <div class="fx" data-lang="py">def plus_one(digits):
    digits = digits[:]                  # do not change the caller's list
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] &lt; 9:
            digits[i] += 1              # no carry: done
            return digits
        digits[i] = 0                   # 9 + 1 = 10: write 0, carry on
    return [1] + digits                 # all were 9s: 999 -&gt; 1000

for d in [[1, 2, 3], [4, 3, 2, 1], [9], [9, 9, 9], [1, 9, 9], [0]]:
    print(d, "-&gt;", plus_one(d))</div>
  <div class="fx" data-lang="text">[1, 2, 3] -&gt; [1, 2, 4]
[4, 3, 2, 1] -&gt; [4, 3, 2, 2]
[9] -&gt; [1, 0]
[9, 9, 9] -&gt; [1, 0, 0, 0]
[1, 9, 9] -&gt; [2, 0, 0]
[0] -&gt; [1]</div>
  <p>O(n) worst case (all 9s), O(1) usually. <code>int("".join(...)) + 1</code> also works in Python but misses the point of the question.</p>

  <h3>5. Excel Sheet Column Number</h3>
  <p>A → 1, Z → 26, AA → 27. It is base 26, like reading decimal "352" as 3·100 + 5·10 + 2, but the digits run 1..26 with no zero. Reading left to right: <code>n = n · 26 + value(letter)</code>.</p>
  <table class="tbl out"><caption>Dry run "ZY"</caption>
    <tr><th>letter</th><th>value</th><th>n = n·26 + value</th></tr>
    <tr><td>Z</td><td>26</td><td>0·26 + 26 = 26</td></tr>
    <tr><td>Y</td><td>25</td><td>26·26 + 25 = 701</td></tr>
  </table>
  <div class="fx" data-lang="py">def title_to_number(col):
    n = 0
    for ch in col:
        n = n * 26 + (ord(ch) - ord("A") + 1)   # like reading base 10, but base 26 with A=1
    return n

def number_to_title(n):
    out = []
    while n &gt; 0:
        n, r = divmod(n - 1, 26)        # shift to 0-based before dividing
        out.append(chr(ord("A") + r))
    return "".join(reversed(out))

for col in ["A", "Z", "AA", "AB", "ZY", "FXSHRXW"]:
    n = title_to_number(col)
    print(col, "-&gt;", n, "-&gt;", number_to_title(n))</div>
  <div class="fx" data-lang="text">A -&gt; 1 -&gt; A
Z -&gt; 26 -&gt; Z
AA -&gt; 27 -&gt; AA
AB -&gt; 28 -&gt; AB
ZY -&gt; 701 -&gt; ZY
FXSHRXW -&gt; 2147483647 -&gt; FXSHRXW</div>
  <p>The reverse problem (Excel Sheet Column Title) is where people slip: because there is no zero digit, subtract 1 before each <code>divmod</code>. Both are O(length).</p>

  <h3>6. Unique Paths</h3>
  <p>A robot in an m × n grid moves only right or down from top-left to bottom-right. How many paths? Every path is exactly (m−1) downs and (n−1) rights in some order. Choosing which of the m+n−2 moves are the downs gives C(m+n−2, m−1). The DP version (paths into a cell = from above + from left) is the same Pascal's triangle, rotated.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600"><rect x="20" y="10" width="60" height="40" class="fs"/><text x="50" y="35" text-anchor="middle">1</text><rect x="80" y="10" width="60" height="40" class="fs"/><text x="110" y="35" text-anchor="middle">1</text><rect x="140" y="10" width="60" height="40" class="fs"/><text x="170" y="35" text-anchor="middle">1</text><rect x="200" y="10" width="60" height="40" class="fs"/><text x="230" y="35" text-anchor="middle">1</text><rect x="20" y="50" width="60" height="40" class="fs"/><text x="50" y="75" text-anchor="middle">1</text><rect x="80" y="50" width="60" height="40" class="fb sb"/><text x="110" y="75" text-anchor="middle">2</text><rect x="140" y="50" width="60" height="40" class="fb sb"/><text x="170" y="75" text-anchor="middle">3</text><rect x="200" y="50" width="60" height="40" class="fb sb"/><text x="230" y="75" text-anchor="middle">4</text><rect x="20" y="90" width="60" height="40" class="fs"/><text x="50" y="115" text-anchor="middle">1</text><rect x="80" y="90" width="60" height="40" class="fb sb"/><text x="110" y="115" text-anchor="middle">3</text><rect x="140" y="90" width="60" height="40" class="fb sb"/><text x="170" y="115" text-anchor="middle">6</text><rect x="200" y="90" width="60" height="40" class="fg sg"/><text x="230" y="115" text-anchor="middle">10</text><text x="300" y="40">each cell = above + left</text><text x="300" y="70" class="tm">3 × 4 grid: 2 downs + 3 rights</text><text x="300" y="100" class="tg">C(5, 2) = 10 paths</text><text x="300" y="130" class="tm">the numbers are Pascal's triangle</text></svg><figcaption>Unique paths for a 3 × 4 grid. The DP table and the formula C(m+n−2, m−1) give the same 10.</figcaption></figure>
  <div class="fx" data-lang="py">import math

def unique_paths(m, n):
    # any path = (m-1) downs and (n-1) rights in some order
    return math.comb(m + n - 2, m - 1)

def unique_paths_dp(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]        # from above (old row[j]) + from left
    return row[-1]

for m, n in [(3, 7), (3, 2), (1, 1), (7, 3), (10, 10), (23, 12)]:
    print(m, n, "-&gt;", unique_paths(m, n), unique_paths_dp(m, n))</div>
  <div class="fx" data-lang="text">3 7 -&gt; 28 28
3 2 -&gt; 3 3
1 1 -&gt; 1 1
7 3 -&gt; 28 28
10 10 -&gt; 48620 48620
23 12 -&gt; 193536720 193536720</div>
  <p>Formula: O(min(m, n)) inside <code>math.comb</code>. DP: O(m·n) time, O(n) space with one row. Mention both; the DP generalises to grids with obstacles (Unique Paths II), the formula does not.</p>

  <h3>7. Rotate Array (GCD cycles)</h3>
  <p>Rotate a list right by k, in place, with O(1) extra space. Moving each item to <code>(i + k) % n</code> forms cycles. How many? Exactly <strong>gcd(n, k)</strong>, each of length n / gcd. Follow each cycle, carrying one value in your hand like musical chairs. The more famous answer is three reversals; both are O(n) time, O(1) space.</p>
  <div class="fx" data-lang="py">import math

def rotate(nums, k):
    """Rotate right by k, in place, O(1) extra space, using gcd cycles."""
    n = len(nums)
    k %= n
    if k == 0:
        return
    for start in range(math.gcd(n, k)):     # exactly gcd(n, k) separate cycles
        cur, val = start, nums[start]
        while True:
            nxt = (cur + k) % n
            nums[nxt], val = val, nums[nxt]   # drop val in its new seat, pick up the old one
            cur = nxt
            if cur == start:
                break

def rotate_reverse(nums, k):
    n = len(nums)
    k %= n
    def rev(i, j):
        while i &lt; j:
            nums[i], nums[j] = nums[j], nums[i]
            i, j = i + 1, j - 1
    rev(0, n - 1)        # 7 6 5 4 3 2 1
    rev(0, k - 1)        # 5 6 7 | 4 3 2 1
    rev(k, n - 1)        # 5 6 7 | 1 2 3 4

for nums, k in [([1, 2, 3, 4, 5, 6, 7], 3), ([-1, -100, 3, 99], 2), ([1, 2, 3, 4, 5, 6], 4), ([1], 5)]:
    a, b = nums[:], nums[:]
    rotate(a, k); rotate_reverse(b, k)
    print(nums, k, "-&gt;", a, b)</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5, 6, 7] 3 -&gt; [5, 6, 7, 1, 2, 3, 4] [5, 6, 7, 1, 2, 3, 4]
[-1, -100, 3, 99] 2 -&gt; [3, 99, -1, -100] [3, 99, -1, -100]
[1, 2, 3, 4, 5, 6] 4 -&gt; [3, 4, 5, 6, 1, 2] [3, 4, 5, 6, 1, 2]
[1] 5 -&gt; [1] [1]</div>
  <p>For n = 6, k = 4: gcd = 2, so two cycles of length 3 (positions 0 → 4 → 2 → 0 and 1 → 5 → 3 → 1). Do <code>k %= n</code> first, or k = 5 on a list of 1 breaks things. In an interview, the slicing answer <code>nums[:] = nums[-k:] + nums[:-k]</code> is fine to mention but uses O(n) extra space.</p>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The solutions are short; their bugs hide in one character.</div>

  <h2 id="dsa-mt-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which small slips (a % taken too late, 1 counted as prime, a float compared with ==) turn correct maths into a wrong answer?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: taking % only at the end</span>
    <p>In Python it still gives the right answer, but the numbers grow to thousands of digits and the code becomes very slow. In Java/C++ it overflows and gives garbage. Reduce after every multiplication.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dividing under a modulus</span>
    <p><code>(a // b) % MOD</code> after a and b were already reduced is wrong. Use <code>a * pow(b, MOD - 2, MOD) % MOD</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: floats for integer maths</span>
    <p><code>math.sqrt</code>, <code>n ** 0.5</code>, <code>/</code> and <code>math.pow</code> return floats and go wrong above 2⁵³. Use <code>math.isqrt</code>, <code>//</code> and the three-argument <code>pow</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: 1 is prime, sieve boundaries</span>
    <p>Mark 0 and 1 as not prime, size the array n + 1 when "≤ n" is asked and n when "&lt; n" is asked, and guard tiny n before touching index 1.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: negative % and // in other languages</span>
    <p>Python floors; C/Java/JS truncate. If your solution will be translated, write <code>((a % m) + m) % m</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting k %= n</span>
    <p>Rotations, clock positions and circular indexes all need the modulus first. k may be larger than n, or zero.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> How does each tool grow out of the one before, and what does each give on the order ids and the 8 orders?</div>

  <h2 id="dsa-mt-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>GCD, primes, factors, remainders, fast power, inverses, nCr, overflow and sampling: how is each built from the ones before, and what does each give on the order ids and the day's 8 orders?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 224" width="660">
<defs><marker id="dsa-mt-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="210" y1="32" x2="230" y2="32" stroke="currentColor" marker-end="url(#dsa-mt-a9)"/>
<line x1="430" y1="32" x2="450" y2="32" stroke="currentColor" marker-end="url(#dsa-mt-a9)"/>
<line x1="550" y1="54" x2="550" y2="88" stroke="currentColor" marker-end="url(#dsa-mt-a9)"/>
<line x1="160" y1="54" x2="500" y2="88" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dsa-mt-a9)"/>
<line x1="450" y1="110" x2="430" y2="110" stroke="currentColor" marker-end="url(#dsa-mt-a9)"/>
<line x1="230" y1="110" x2="210" y2="110" stroke="currentColor" marker-end="url(#dsa-mt-a9)"/>
<line x1="110" y1="132" x2="110" y2="166" stroke="currentColor" marker-end="url(#dsa-mt-a9)"/>
<line x1="210" y1="188" x2="230" y2="188" stroke="currentColor" marker-end="url(#dsa-mt-a9)"/>
<line x1="430" y1="188" x2="450" y2="188" stroke="currentColor" marker-end="url(#dsa-mt-a9)"/>
<rect x="10" y="10" width="200" height="44" rx="7" class="fb sb"/>
<text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">GCD &amp; LCM (Euclid)</text>
<text x="110" y="45" text-anchor="middle" class="tm" font-size="10">gcd(48, 18) = 6 in 3 steps</text>
<rect x="230" y="10" width="200" height="44" rx="7" class="fb sb"/>
<text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">primes &amp; sieve</text>
<text x="330" y="45" text-anchor="middle" class="tm" font-size="10">n = 30 → 10 primes</text>
<rect x="450" y="10" width="200" height="44" rx="7" class="fb sb"/>
<text x="550" y="29" text-anchor="middle" font-size="11.5" font-weight="700">factors &amp; divisors</text>
<text x="550" y="45" text-anchor="middle" class="tm" font-size="10">360 = 2³·3²·5 → 24</text>
<rect x="450" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="550" y="107" text-anchor="middle" font-size="11.5" font-weight="700">modular arithmetic</text>
<text x="550" y="123" text-anchor="middle" class="tm" font-size="10">ids % 7 → all 7 shards</text>
<rect x="230" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">fast power</text>
<text x="330" y="123" text-anchor="middle" class="tm" font-size="10">3¹³ mod 1000 = 323</text>
<rect x="10" y="88" width="200" height="44" rx="7" class="fg sg"/>
<text x="110" y="107" text-anchor="middle" font-size="11.5" font-weight="700">modular inverse</text>
<text x="110" y="123" text-anchor="middle" class="tm" font-size="10">3⁻¹ mod p = 333333336</text>
<rect x="10" y="166" width="200" height="44" rx="7" class="fg sg"/>
<text x="110" y="185" text-anchor="middle" font-size="11.5" font-weight="700">combinatorics</text>
<text x="110" y="201" text-anchor="middle" class="tm" font-size="10">C(8, 2) = 28 pairs</text>
<rect x="230" y="166" width="200" height="44" rx="7" class="fr sr"/>
<text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">overflow &amp; precision</text>
<text x="330" y="201" text-anchor="middle" class="tm" font-size="10">1345.1999…; paise ints</text>
<rect x="450" y="166" width="200" height="44" rx="7" class="ft st"/>
<text x="550" y="185" text-anchor="middle" font-size="11.5" font-weight="700">random sampling</text>
<text x="550" y="201" text-anchor="middle" class="tm" font-size="10">reservoir: 3 lucky orders</text>
</svg><figcaption>Blue: divisibility (GCD → primes → factors); the dashed arrow is the shard lesson (gcd(step, m) decides how many shards are used). Green: computing with remainders, where each tool removes the next obstacle (huge numbers → mod, huge exponents → fast power, division → inverse, counting → nCr mod p). Red: the machine limits that can still break a correct formula. Gold: randomness.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the running example: ids 1010…1080 (step 10), orders A–H, 48 samosas and 18 jamuns</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>GCD / LCM</td><td>gcd(a, b) = gcd(b, a % b)</td><td>largest common divisor? when do cycles meet?</td><td>gcd(48, 18) = 6; lcm(4, 6) = 12; ids % 10 → 1 shard</td><td>ratios, cycles, groups, rotations</td></tr>
    <tr><td>Primes / sieve</td><td>divisor pairs around √n; crossing multiples</td><td>which numbers share no factors?</td><td>n = 30 → 2, 3, 5, …, 29</td><td>count primes, choose a modulus</td></tr>
    <tr><td>Factorisation</td><td>trial division up to √n</td><td>what is n made of?</td><td>360 = 2³·3²·5 → 24 divisors</td><td>divisor counts, ugly numbers, trailing zeros</td></tr>
    <tr><td>Modular arithmetic</td><td>remainders respect + − ×</td><td>which shard? how to keep counts small?</td><td>ids % 7 → all 7 shards; 100! mod p = 437918130</td><td>"mod 10⁹ + 7", cycles, divisibility</td></tr>
    <tr><td>Fast power</td><td>bits of the exponent + squaring</td><td>aᵇ mod m in log b steps?</td><td>3¹³ mod 1000 = 323 in 4 rounds</td><td>huge exponents, Fermat inverse</td></tr>
    <tr><td>Modular inverse</td><td>Fermat (pow) or extended Euclid</td><td>how to divide mod p?</td><td>3⁻¹ = 333333336; 12 · 3⁻¹ = 4</td><td>nCr mod p, fractions mod p</td></tr>
    <tr><td>Combinatorics</td><td>factorials, Pascal's rule, inverses</td><td>how many ways?</td><td>C(8, 2) = 28; row 8 of Pascal; C(4, 2) = 6 paths</td><td>choose / arrange / paths</td></tr>
    <tr><td>Overflow &amp; precision</td><td>fixed-width ints, binary floats</td><td>when does a right formula print wrong?</td><td>reverse(1534236469) → 0; bill 1345.1999…</td><td>32-bit problems, money, division</td></tr>
    <tr><td>Reservoir sampling</td><td>chance k/(i+1) per arrival</td><td>pick fairly from a stream?</td><td>each order 30% for k = 3, n = 10</td><td>random node / index, streams</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>work with remainders instead of whole numbers, and make every step cheap: Euclid shrinks pairs, the sieve shares work across numbers, squaring halves the exponent, and inverses turn division into multiplication; then check the machine's limits before trusting the output.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_advanced">Advanced Data Structures</a>: Biteful's finance team asks for the revenue between any two days, while past days keep getting corrected. Formulas don't help there; we need structures that answer range queries and accept updates in O(log n).</div>

  <h2 id="dsa-mt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: order ids <b>1010, 1020, …, 1080</b> (step 10) into m shards; orders <b>A–H</b>; <b>48 samosas, 18 jamuns</b>; coupon codes 3¹³; the day's charges [120, 80, 250, 40, 310, 80, 60, 200] for the bill.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>GCD / LCM</td><td>largest common divisor?</td><td>6 boxes; ids % 10 use 1 shard</td><td>which m share no factors?</td></tr>
    <tr><td>Primes / sieve</td><td>numbers with no factors?</td><td>2 … 29 (crossed by 2, 3, 5)</td><td>split one number into primes?</td></tr>
    <tr><td>Factors</td><td>what is 360 made of?</td><td>2³·3²·5, 24 divisors</td><td>compute with remainders</td></tr>
    <tr><td>Modular arithmetic</td><td>which shard? keep counts small?</td><td>ids % 7 → 7 shards</td><td>huge exponents</td></tr>
    <tr><td>Fast power</td><td>aᵇ in log b?</td><td>3¹³ mod 1000 = 323</td><td>division breaks</td></tr>
    <tr><td>Inverse</td><td>divide mod p?</td><td>3⁻¹ = 333333336</td><td>now count</td></tr>
    <tr><td>Combinatorics</td><td>how many batches?</td><td>C(8, 2) = 28</td><td>machine limits</td></tr>
    <tr><td>Overflow / precision</td><td>right formula, wrong output?</td><td>1345.1999…; use paise</td><td>random choice?</td></tr>
    <tr><td>Reservoir</td><td>fair pick from a stream?</td><td>30% each</td><td>→ patterns</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols / notes</th></tr>
    <tr><td>Euclid</td><td>gcd(a, b) = gcd(b, a mod b); gcd(a, 0) = a</td><td>O(log min(a, b))</td></tr>
    <tr><td>LCM</td><td>lcm(a, b) = a / gcd(a, b) · b</td><td>divide first</td></tr>
    <tr><td>Shards used</td><td>m / gcd(s, m)</td><td>s = id step, m = shards: 10 → 1, 4 → 2, 7 → 7</td></tr>
    <tr><td>Prime test</td><td>no divisor in 2 … ⌊√n⌋</td><td>math.isqrt; O(√n)</td></tr>
    <tr><td>Sieve</td><td>for i ≤ √n prime: cross i², i² + i, …</td><td>O(n log log n)</td></tr>
    <tr><td>Divisor count</td><td>n = ∏ pᵢ^eᵢ → d(n) = ∏ (eᵢ + 1)</td><td>360 → 4·3·2 = 24</td></tr>
    <tr><td>Mod rules</td><td>(a ± b) mod m, (a · b) mod m reducible at every step</td><td>not division</td></tr>
    <tr><td>Fast power</td><td>aᵇ = ∏ a^(2ⁱ) over 1-bits i of b</td><td>pow(a, b, m); O(log b)</td></tr>
    <tr><td>Fermat inverse</td><td>a⁻¹ ≡ a^(p−2) (mod p)</td><td>p prime, a ≢ 0; pow(a, -1, m) in general</td></tr>
    <tr><td>Combinations</td><td>C(n, r) = n! / (r! (n−r)!) = C(n−1, r−1) + C(n−1, r)</td><td>mod p: fact[n] · inv_fact[r] · inv_fact[n−r]</td></tr>
    <tr><td>Permutations</td><td>P(n, r) = n! / (n−r)!</td><td>P(8, 2) = 56</td></tr>
    <tr><td>Stars and bars</td><td>C(n + k − 1, k − 1)</td><td>n identical items, k groups</td></tr>
    <tr><td>32-bit range</td><td>−2³¹ … 2³¹ − 1</td><td>2,147,483,647</td></tr>
    <tr><td>Reservoir</td><td>item i replaces a slot with chance k / (i + 1)</td><td>final chance k / n</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Sieve</b><p>Many prime queries up to n ≤ ~10⁷.</p><small>Not for one huge number (trial division to √n)</small></div>
    <div><b>% MOD every step</b><p>Any "number of ways" answer mod 10⁹ + 7.</p><small>Not for division (use inverses)</small></div>
    <div><b>pow(a, b, m)</b><p>Huge exponents; Fermat inverses.</p><small>Not <code>a ** b % m</code> for big b</small></div>
    <div><b>math.comb / factorial tables</b><p>One exact nCr / many nCr mod p.</p><small>Not when constraints make it a DP (obstacles in the grid)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>% only at the end; dividing remainders; floats for money or big ints (1345.1999…); 1 counted as prime, <code>n ** 0.5</code> off by one; negative % and // differ across languages; floor vs truncate (−7 // 2 = −4, int(−7 / 2) = −3); 32-bit overflow checks in Reverse Integer; Fermat with a non-prime modulus; forgetting the leftover prime in factorisation; <code>randint(0, i)</code> is inclusive.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Trace gcd(48, 18).</td><td>(48, 18) → (18, 12) → (12, 6) → (6, 0): 6</td></tr>
    <tr><td>Ids in steps of 10 into 4 shards: how many shards are used?</td><td>4 / gcd(10, 4) = 2</td></tr>
    <tr><td>Which numbers does 3 cross out in the sieve for 30?</td><td>9, 15, 21, 27 (starts at 3², skips those already crossed by 2)</td></tr>
    <tr><td>3¹³ mod 1000 by fast power: which powers are multiplied in?</td><td>3¹, 3⁴, 3⁸ (13 = 1101) → 3 · 81 · 561 → 323</td></tr>
    <tr><td>Why is the answer "mod 10⁹ + 7" and not "mod 10⁹"?</td><td>10⁹ + 7 is prime, so inverses (division) exist; 10⁹ = 2⁹·5⁹ is not</td></tr>
  </table>

  
<h2 id="dsa-mt-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Euclid's algorithm and its complexity.</summary><div class="qa-body"><code>gcd(a, b) = gcd(b, a % b)</code> until b = 0, then the answer is a. Any common divisor of a and b also divides a % b, so the GCD does not change. O(log min(a, b)) steps, because the numbers at least halve every two steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does trial division stop at √n?</summary><div class="qa-body">If n = a·b with both a and b greater than √n, then a·b &gt; n, impossible. So any factorisation has a factor ≤ √n. If none is found, n is prime. O(√n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the sieve, why start crossing at i·i?</summary><div class="qa-body">Every smaller multiple k·i with k &lt; i has a prime factor smaller than i, so it was already crossed out. This also means the outer loop can stop at √n. Total O(n log log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is 10⁹ + 7 used so often?</summary><div class="qa-body">It is prime, so every non-zero number has an inverse (needed for division and nCr). It fits in a signed 32-bit int, and the product of two values below it fits in a signed 64-bit int, so C++/Java code does not overflow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does fast exponentiation work and what does it cost?</summary><div class="qa-body">Write the exponent in binary. Square the base each step (a, a², a⁴, a⁸ …) and multiply it into the result whenever the current bit is 1. O(log b) multiplications. Built in as <code>pow(a, b, m)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute (a / b) mod p for a prime p?</summary><div class="qa-body">Multiply by the inverse: <code>a * pow(b, p - 2, p) % p</code> (Fermat's little theorem, needs b not divisible by p). For a non-prime modulus use extended Euclid or <code>pow(b, -1, m)</code>, which works only when gcd(b, m) = 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need nCr mod 10⁹+7 for 10⁵ different queries with n ≤ 10⁶. Plan?</summary><div class="qa-body">Precompute <code>fact[0..N]</code> and <code>inv_fact[0..N]</code> in O(N) (one <code>pow</code> for <code>inv_fact[N]</code>, then fill backwards). Each query is <code>fact[n] * inv_fact[r] * inv_fact[n-r] % MOD</code>, O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is printed? <code>print(-7 % 3, -7 // 3, int(-7 / 3), 7 % -3)</code></summary><div class="qa-body"><code>2 -3 -2 -2</code>. Python's % takes the sign of the divisor and // floors. <code>int(-7/3)</code> truncates toward zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain reservoir sampling for k = 1 and why it is fair.</summary><div class="qa-body">Keep the first item. For the i-th item (1-based), replace the kept one with probability 1/i. Item i is chosen with 1/i and then survives every later step with (i/(i+1)) · ((i+1)/(i+2)) · … · ((n−1)/n), which multiplies to 1/n for everyone. O(1) memory, one pass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Unique Paths in a 3 × 7 grid: formula and answer?</summary><div class="qa-body">2 downs and 6 rights, 8 moves total: C(8, 2) = 28. In general C(m+n−2, m−1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Excel Column Title (number → letters) trickier than Column Number?</summary><div class="qa-body">The system is base 26 with digits 1..26 and no zero. Plain <code>divmod(n, 26)</code> gives remainder 0 for Z. Subtract 1 before each divmod: <code>n, r = divmod(n - 1, 26)</code>, letter = <code>chr(65 + r)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many cycles does the in-place rotation by k make on n items?</summary><div class="qa-body">gcd(n, k) cycles, each of length n / gcd(n, k). Example n = 6, k = 4: 2 cycles of 3. If n and k are coprime, one cycle visits everything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the choice of shard count connect GCD and primes?</summary><div class="qa-body">Ids in steps of s placed by <code>id % m</code> use only m / gcd(s, m) shards. With s = 10: m = 10 uses 1 shard, m = 4 uses 2, m = 7 uses all 7. A prime m shares no factor with any step that is not a multiple of it, so it spreads patterned keys best. The same reasoning is why hash tables like prime bucket counts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: nCr mod p needs which two earlier tools, and what breaks if you skip them?</summary><div class="qa-body">Modular arithmetic (to keep n! small) and the modular inverse (to divide by r! and (n−r)!), which itself uses fast power (Fermat: a^(p−2)). Skip the inverse and you end up dividing remainders, which gives garbage; skip the modulus and the numbers grow to hundreds of digits (C(1000, 500) has 300).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is fast exponentiation related to the Bit Manipulation note?</summary><div class="qa-body">It walks the bits of the exponent: <code>b &amp; 1</code> decides whether to multiply, <code>b &gt;&gt;= 1</code> moves to the next bit. 13 = 1101, so 3¹³ = 3⁸ · 3⁴ · 3¹. The number of rounds is b's bit_length, about log₂ b.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does 10⁹ + 7 need to be prime, and why not choose something bigger like 10¹⁸ + 9?</summary><div class="qa-body">Prime: so every non-zero remainder has an inverse (division works, nCr works). Not bigger: the product of two remainders must fit in 64 bits for C++/Java; (10⁹ + 7)² ≈ 10¹⁸ fits, (10¹⁸)² does not.</div></details>
</main>
`
});
