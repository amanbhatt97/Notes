// notes/dsa/dsa_math.js — Math & Number Theory
Object.assign(TOPIC_CONTENT, {
  "dsa_math": `<main>
<h1>Math &amp; Number Theory</h1>
  <p class="lead">A small toolbox of school maths that keeps showing up in code: GCD, primes, remainders, fast powers, counting combinations, and working digit by digit. Each tool turns a slow brute force into a fast formula. Needs loops and integers; the Bit Manipulation note helps for fast powers.</p>

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
      <div class="rm-item rm-done" data-target="dsa-mt-gcd"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">GCD &amp; LCM</span><span class="rm-sub">Euclid's remainder trick</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-primes"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Primes &amp; the Sieve</span><span class="rm-sub">√n test, Sieve of Eratosthenes</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-factor"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Factors &amp; Divisors</span><span class="rm-sub">Prime factorisation in O(√n)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-mod"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Modular Arithmetic</span><span class="rm-sub">Clock maths and 10**9 + 7</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-pow"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Fast Exponentiation</span><span class="rm-sub">pow(a, b, m) in O(log b)</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-inv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Modular Inverse</span><span class="rm-sub">"Dividing" under a modulus</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-comb"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Combinatorics</span><span class="rm-sub">nCr, Pascal, nCr mod p</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-digits"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Digits &amp; Overflow</span><span class="rm-sub">divmod, reverse, 32-bit limits</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-random"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Random Sampling</span><span class="rm-sub">Reservoir sampling</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">7 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Floats, negatives, mod division</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-mt-gcd"><span class="num">01</span>GCD &amp; LCM</h2>
  <p>You have a 48 cm × 18 cm sheet of card and want to cut it into equal squares with nothing left over. The biggest square side that works is the <strong>greatest common divisor</strong> (GCD): the largest number that divides both 48 and 18. Answer: 6.</p>
  <p>The school method lists all divisors of both. Slow for big numbers. Euclid (Greece, ~300 BC) noticed something better: any number that divides 48 and 18 also divides 48 − 18, and 48 − 18 − 18, and so on down to the remainder 48 % 18 = 12. So <code>gcd(48, 18) = gcd(18, 12)</code>. Repeat until the second number is 0.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600"><defs><marker id="mt-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><rect x="10" y="30" width="118" height="40" rx="8" class="fb sb"/><text x="69" y="55" text-anchor="middle">gcd(48, 18)</text><line x1="130" y1="50" x2="156" y2="50" class="sb" stroke-width="1.5" marker-end="url(#mt-a1)"/><text x="69" y="92" text-anchor="middle" class="tm">48 % 18 = 12</text><rect x="158" y="30" width="118" height="40" rx="8" class="fb sb"/><text x="217" y="55" text-anchor="middle">gcd(18, 12)</text><line x1="278" y1="50" x2="304" y2="50" class="sb" stroke-width="1.5" marker-end="url(#mt-a1)"/><text x="217" y="92" text-anchor="middle" class="tm">18 % 12 = 6</text><rect x="306" y="30" width="118" height="40" rx="8" class="fb sb"/><text x="365" y="55" text-anchor="middle">gcd(12, 6)</text><line x1="426" y1="50" x2="452" y2="50" class="sb" stroke-width="1.5" marker-end="url(#mt-a1)"/><text x="365" y="92" text-anchor="middle" class="tm">12 % 6 = 0</text><rect x="454" y="30" width="118" height="40" rx="8" class="fg sg"/><text x="513" y="55" text-anchor="middle">gcd(6, 0)</text><text x="512" y="92" text-anchor="middle" class="tg">b = 0 → answer 6</text></svg><figcaption>Euclid's algorithm: replace (a, b) with (b, a % b). The numbers shrink fast; when b hits 0, a is the GCD.</figcaption></figure>
  <div class="fx" data-lang="py">import math

def gcd(a, b):
    while b:
        a, b = b, a % b            # gcd(a, b) == gcd(b, a % b)
        print("  -&gt;", a, b)
    return a

print("gcd(48, 18) =", gcd(48, 18))

def lcm(a, b):
    return a // math.gcd(a, b) * b   # divide first: smaller numbers

print(math.gcd(48, 18), lcm(4, 6), math.lcm(4, 6, 10), math.gcd(0, 7))</div>
  <div class="fx" data-lang="text">  -&gt; 18 12
  -&gt; 12 6
  -&gt; 6 0
gcd(48, 18) = 6
6 12 60 7</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cutting the card: cut off as many 18×18 squares as you can from 48×18. A 12×18 strip is left. Now cut 12×12 squares from that strip, leaving 6×12. Then 6×6 squares fit exactly. The last square size is the GCD. That is Euclid, done with scissors.</p>
  </div>
  <p>Why it is fast: every two steps the bigger number at least halves, so it takes O(log min(a, b)) steps. Even for 18-digit numbers it is under 100 steps.</p>
  <p><strong>LCM</strong> (least common multiple) is the smallest number both divide: when do two buses that come every 4 and 6 minutes arrive together again? After 12 minutes. Formula: <code>lcm(a, b) = a · b / gcd(a, b)</code>. Divide before multiplying to keep the numbers small (matters in Java/C++).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>gcd(a, b)</strong>: largest d dividing both. <strong>lcm(a, b)</strong>: smallest positive number divisible by both. <strong>Coprime</strong>: gcd = 1 (e.g. 8 and 15). Facts: <code>gcd(a, 0) = a</code>, <code>gcd · lcm = a · b</code>.</p>
  </div>
  <p>Where you meet it: simplifying fractions (18/48 = 3/8), aspect ratios (1920×1080 → 16:9), gear and timetable cycles, "Water and Jug" puzzles, the GCD of strings problem, and rotating an array in place (problem 7).</p>

  <h2 id="dsa-mt-primes"><span class="num">02</span>Primes &amp; the Sieve</h2>
  <p>A <strong>prime</strong> is a number greater than 1 whose only divisors are 1 and itself: 2, 3, 5, 7, 11 … Every other number above 1 is a product of primes, so primes are the "atoms" of integers.</p>
  <h3>Testing one number: stop at √n</h3>
  <p>If 36 = a × b, one of a, b is at most 6 (√36). Divisors come in pairs around the square root (1·36, 2·18, 3·12, 4·9, 6·6). So if nothing up to √n divides n, nothing above does either. That turns O(n) into O(√n): for n = 10¹², a million checks instead of a trillion.</p>
  <h3>All primes up to n: the Sieve of Eratosthenes</h3>
  <p>To list every prime up to n, testing each one separately repeats work. The sieve does it the other way round: start with everything marked "prime". Take the first unmarked number (2), cross out all its multiples. Take the next unmarked one (3), cross out its multiples. Whatever survives is prime.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600"><rect x="25" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="50" y="35" text-anchor="middle">2</text><rect x="81" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="35" text-anchor="middle">3</text><rect x="137" y="12" width="50" height="36" rx="4" class="fs"/><text x="162" y="30" text-anchor="middle" class="tm">4</text><text x="162" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="218" y="35" text-anchor="middle">5</text><rect x="249" y="12" width="50" height="36" rx="4" class="fs"/><text x="274" y="30" text-anchor="middle" class="tm">6</text><text x="274" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="330" y="35" text-anchor="middle">7</text><rect x="361" y="12" width="50" height="36" rx="4" class="fs"/><text x="386" y="30" text-anchor="middle" class="tm">8</text><text x="386" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="12" width="50" height="36" rx="4" class="fs"/><text x="442" y="30" text-anchor="middle" class="tm">9</text><text x="442" y="43" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="473" y="12" width="50" height="36" rx="4" class="fs"/><text x="498" y="30" text-anchor="middle" class="tm">10</text><text x="498" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="554" y="35" text-anchor="middle">11</text><rect x="25" y="56" width="50" height="36" rx="4" class="fs"/><text x="50" y="74" text-anchor="middle" class="tm">12</text><text x="50" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="81" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="79" text-anchor="middle">13</text><rect x="137" y="56" width="50" height="36" rx="4" class="fs"/><text x="162" y="74" text-anchor="middle" class="tm">14</text><text x="162" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="56" width="50" height="36" rx="4" class="fs"/><text x="218" y="74" text-anchor="middle" class="tm">15</text><text x="218" y="87" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="249" y="56" width="50" height="36" rx="4" class="fs"/><text x="274" y="74" text-anchor="middle" class="tm">16</text><text x="274" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="330" y="79" text-anchor="middle">17</text><rect x="361" y="56" width="50" height="36" rx="4" class="fs"/><text x="386" y="74" text-anchor="middle" class="tm">18</text><text x="386" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="442" y="79" text-anchor="middle">19</text><rect x="473" y="56" width="50" height="36" rx="4" class="fs"/><text x="498" y="74" text-anchor="middle" class="tm">20</text><text x="498" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="56" width="50" height="36" rx="4" class="fs"/><text x="554" y="74" text-anchor="middle" class="tm">21</text><text x="554" y="87" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="25" y="100" width="50" height="36" rx="4" class="fs"/><text x="50" y="118" text-anchor="middle" class="tm">22</text><text x="50" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="81" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="123" text-anchor="middle">23</text><rect x="137" y="100" width="50" height="36" rx="4" class="fs"/><text x="162" y="118" text-anchor="middle" class="tm">24</text><text x="162" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="100" width="50" height="36" rx="4" class="fs"/><text x="218" y="118" text-anchor="middle" class="tm">25</text><text x="218" y="131" text-anchor="middle" class="tr" font-size="9">÷5</text><rect x="249" y="100" width="50" height="36" rx="4" class="fs"/><text x="274" y="118" text-anchor="middle" class="tm">26</text><text x="274" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="100" width="50" height="36" rx="4" class="fs"/><text x="330" y="118" text-anchor="middle" class="tm">27</text><text x="330" y="131" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="361" y="100" width="50" height="36" rx="4" class="fs"/><text x="386" y="118" text-anchor="middle" class="tm">28</text><text x="386" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="442" y="123" text-anchor="middle">29</text><rect x="473" y="100" width="50" height="36" rx="4" class="fs"/><text x="498" y="118" text-anchor="middle" class="tm">30</text><text x="498" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="554" y="123" text-anchor="middle">31</text><text x="25" y="160" class="tg">green = prime (never crossed)</text><text x="330" y="160" class="tm">grey = crossed out by its smallest prime</text></svg><figcaption>The sieve for 2..31. Each composite is crossed out by its smallest prime factor. We only need to sieve with 2, 3 and 5, because 7·7 = 49 is already past 31.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school assembly of students numbered 2 to 100. Student 2 says "every multiple of 2, sit down". Then the next one standing (3) says the same. Then 5, then 7. After 7 nobody new sits (11·11 = 121 &gt; 100). Everyone still standing is prime.</p>
  </div>
  <div class="fx" data-lang="py">def is_prime(n):
    if n &lt; 2:
        return False
    i = 2
    while i * i &lt;= n:              # a factor pair always has one side &lt;= sqrt(n)
        if n % i == 0:
            return False
        i += 1
    return True

def sieve(n):
    """All primes &lt;= n."""
    if n &lt; 2:
        return []
    is_p = [True] * (n + 1)
    is_p[0] = is_p[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if is_p[i]:
            for j in range(i * i, n + 1, i):   # smaller multiples were already crossed
                is_p[j] = False
    return [i for i in range(n + 1) if is_p[i]]

print([n for n in range(30) if is_prime(n)])
print(sieve(30))
print(len(sieve(1_000_000)))</div>
  <div class="fx" data-lang="text">[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
78498</div>
  <p>Two details make it fast. The outer loop stops at √n. The inner loop starts at <code>i * i</code>, because smaller multiples like 2·i or 3·i were crossed out already by 2 and 3. Cost is O(n log log n), which is practically linear: a million numbers in well under a second.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>0 and 1 are not prime, and 2 is the only even prime. Many "is prime" bugs return True for 1. Also, <code>int(n ** 0.5)</code> can be off by one for huge n because of floats; <code>math.isqrt(n)</code> is the exact version.</p>
  </div>

  <h2 id="dsa-mt-factor"><span class="num">03</span>Factors &amp; Divisors</h2>
  <p><strong>Prime factorisation</strong> writes n as a product of primes: 360 = 2³ · 3² · 5. It is unique (the "fundamental theorem of arithmetic"). To find it, try d = 2, 3, 4 … and divide out each d as many times as it goes. When d·d passes what is left, the leftover (if &gt; 1) is itself a prime.</p>
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
  <p>Non-prime d values like 4 never divide, because all 2s were removed earlier. Time O(√n). 600851475143 is Project Euler problem 3; it finishes instantly because n keeps shrinking.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>From the factorisation you get everything else. Number of divisors of 2³·3²·5 is (3+1)(2+1)(1+1) = 24. GCD takes the smaller power of each prime, LCM the bigger. Many "count divisors" or "is it a perfect square" questions reduce to the exponents.</p>
  </div>

  <h2 id="dsa-mt-mod"><span class="num">04</span>Modular Arithmetic</h2>
  <p>It is 10 o'clock. What time is it after 5 hours? 3 o'clock, not 15. A clock keeps only the remainder after dividing by 12. That is <strong>modular arithmetic</strong>: <code>(10 + 5) % 12 = 3</code>.</p>
  <p>Why interviewers use it: answers like "number of ways" grow beyond any fixed-size integer (100! has 158 digits). So the problem says "return the answer modulo 10⁹ + 7". You must keep numbers small <em>during</em> the calculation, not just at the end.</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Safe to reduce early?</th></tr>
    <tr><td><code>(a + b) % m == (a % m + b % m) % m</code></td><td>Yes</td></tr>
    <tr><td><code>(a - b) % m == (a % m - b % m) % m</code></td><td>Yes (Python keeps it non-negative)</td></tr>
    <tr><td><code>(a * b) % m == (a % m) * (b % m) % m</code></td><td>Yes</td></tr>
    <tr><td><code>(a / b) % m</code></td><td><strong>No</strong>: multiply by the modular inverse of b instead</td></tr>
  </table>
  <div class="fx" data-lang="py">MOD = 10**9 + 7

a, b = 10**12, 10**15
print((a + b) % MOD, (a % MOD + b % MOD) % MOD)        # same
print((a * b) % MOD, (a % MOD) * (b % MOD) % MOD)      # same
print((a - b) % MOD)                                   # Python: never negative
print(-7 % 5, 7 % -5, divmod(-7, 5))

fact = 1
for i in range(1, 101):
    fact = fact * i % MOD                              # reduce every step
print("100! mod p =", fact)</div>
  <div class="fx" data-lang="text">992993007 992993007
999999664 999999664
6993000
3 -3 (-2, 3)
100! mod p = 437918130</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>a ≡ b (mod m)</strong>: a and b leave the same remainder when divided by m. <strong>Why 10⁹ + 7?</strong> It is prime (so inverses exist), it fits in a signed 32-bit int, and the product of two such numbers (~10¹⁸) fits in a signed 64-bit int. 998244353 is the other common prime.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Negative remainders. Python: <code>-7 % 5 == 3</code> (result has the sign of the divisor). Java, C++, JavaScript: <code>-7 % 5 == -2</code>. In those languages write <code>((a % m) + m) % m</code>. Python's <code>//</code> also floors: <code>-7 // 2 == -4</code>.</p>
  </div>

  <h2 id="dsa-mt-pow"><span class="num">05</span>Fast Exponentiation</h2>
  <p>3¹³ by repeated multiplication is 12 multiplications. 2^(10¹⁸) that way would never finish. The trick: <code>3¹³ = 3⁸ · 3⁴ · 3¹</code> because 13 = 8 + 4 + 1 (binary <code>1101</code>). And 3¹, 3², 3⁴, 3⁸ come from squaring the previous one. So we need about log₂ b squarings plus a few multiplications.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600"><text x="20" y="24" class="tm">13 in binary:</text><rect x="140" y="6" width="44" height="28" class="fg sg"/><text x="162" y="25" text-anchor="middle">1</text><text x="162" y="50" text-anchor="middle" class="tm">8</text><rect x="190" y="6" width="44" height="28" class="fg sg"/><text x="212" y="25" text-anchor="middle">1</text><text x="212" y="50" text-anchor="middle" class="tm">4</text><rect x="240" y="6" width="44" height="28" class="fs"/><text x="262" y="25" text-anchor="middle">0</text><text x="262" y="50" text-anchor="middle" class="tm">2</text><rect x="290" y="6" width="44" height="28" class="fg sg"/><text x="312" y="25" text-anchor="middle">1</text><text x="312" y="50" text-anchor="middle" class="tm">1</text><text x="380" y="24" class="tm">13 = 8 + 4 + 1</text><rect x="20" y="72" width="128" height="40" rx="8" class="fg sg"/><text x="84" y="97" text-anchor="middle">3¹ = 3</text><text x="84" y="130" text-anchor="middle" class="tg">bit on: use it</text><rect x="162" y="72" width="128" height="40" rx="8" class="fs"/><text x="226" y="97" text-anchor="middle" class="tm">3² = 9</text><text x="226" y="130" text-anchor="middle" class="tm">bit off: skip</text><rect x="304" y="72" width="128" height="40" rx="8" class="fg sg"/><text x="368" y="97" text-anchor="middle">3⁴ = 81</text><text x="368" y="130" text-anchor="middle" class="tg">bit on: use it</text><rect x="446" y="72" width="128" height="40" rx="8" class="fg sg"/><text x="510" y="97" text-anchor="middle">3⁸ = 6561</text><text x="510" y="130" text-anchor="middle" class="tg">bit on: use it</text><text x="300" y="168" text-anchor="middle">3¹³ = 3⁸ · 3⁴ · 3¹ = 6561 · 81 · 3 = 1594323</text><text x="300" y="186" text-anchor="middle" class="tm">4 squarings instead of 12 multiplications</text></svg><figcaption>Square and multiply. Walk the bits of the exponent from the right; keep squaring the base; multiply it into the answer only where the bit is 1.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Folding a paper doubles its thickness each fold. To get 13 layers' worth you do not add sheets one by one; you note the 1-fold, 4-fold and 8-fold stacks and combine them.</p>
  </div>
  <div class="fx" data-lang="py">def fast_pow(a, b, m):
    result = 1
    a %= m
    while b &gt; 0:
        if b &amp; 1:                  # this bit of b is on: include current power
            result = result * a % m
        a = a * a % m              # a, a^2, a^4, a^8, ...
        b &gt;&gt;= 1
    return result

print(fast_pow(3, 13, 1000), pow(3, 13, 1000), 3 ** 13 % 1000)
print(fast_pow(2, 10**18, 10**9 + 7), pow(2, 10**18, 10**9 + 7))</div>
  <div class="fx" data-lang="text">323 323 323
719476260 719476260</div>
  <p>O(log b) multiplications. Python's built-in <code>pow(a, b, m)</code> does exactly this in C; always use it in real code. Never write <code>a ** b % m</code> for a big b: it builds the full giant number first.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Also called <strong>binary exponentiation</strong> or <strong>exponentiation by squaring</strong>. The same idea powers matrix exponentiation (Fibonacci in O(log n)) and RSA encryption.</p>
  </div>

  <h2 id="dsa-mt-inv"><span class="num">06</span>Modular Inverse</h2>
  <p>Under a modulus you cannot just divide. 12 / 3 = 4, but (12 mod 7) / (3 mod 7) = 5 / 3, which is not an integer. Instead we ask: which number x makes <code>3 · x ≡ 1 (mod 7)</code>? That x (here 5, since 15 = 2·7 + 1) acts like "1/3". Multiplying by it is division.</p>
  <ul>
    <li><strong>When m is prime</strong> (like 10⁹ + 7): Fermat's little theorem gives <code>a⁻¹ = a^(m−2) mod m</code>. One <code>pow</code> call.</li>
    <li><strong>Any m with gcd(a, m) = 1</strong>: extended Euclid finds x, y with a·x + m·y = 1; then x is the inverse. Python 3.8+ does this for you: <code>pow(a, -1, m)</code>.</li>
    <li><strong>gcd(a, m) ≠ 1</strong>: no inverse exists (e.g. 2 has no inverse mod 4).</li>
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
  <p>333333336 looks random but it is "1/3" in the world of mod 10⁹ + 7: three of them make exactly 1. The extended Euclid result x = −2 is also an inverse of 3 mod 7; normalise with <code>% 7</code> to get 5.</p>

  <h2 id="dsa-mt-comb"><span class="num">07</span>Combinatorics</h2>
  <p>"In how many ways can we pick 2 class monitors from 5 students?" Order does not matter, so it is a <strong>combination</strong>: C(5, 2) = 5! / (2! · 3!) = 10. If order matters (monitor and vice-monitor), it is a <strong>permutation</strong>: P(5, 2) = 5 · 4 = 20.</p>
  <p><strong>Pascal's triangle</strong> builds every C(n, r) by addition only: each number is the sum of the two above it. Reason: for C(n, r), either student n is picked (choose r−1 more from n−1) or not (choose r from n−1).</p>
  <div class="fx" data-lang="py">import math
MOD = 10**9 + 7

print(math.comb(5, 2), math.perm(5, 2), math.factorial(5))

def pascal(rows):
    tri = [[1]]
    for _ in range(rows - 1):
        prev = tri[-1]
        tri.append([1] + [prev[i] + prev[i + 1] for i in range(len(prev) - 1)] + [1])
    return tri

for row in pascal(6):
    print(row)

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

print(ncr_mod(1000, 500), math.comb(1000, 500) % MOD)</div>
  <div class="fx" data-lang="text">10 20 120
[1]
[1, 1]
[1, 2, 1]
[1, 3, 3, 1]
[1, 4, 6, 4, 1]
[1, 5, 10, 10, 5, 1]
159835829 159835829</div>
  <p>For one exact answer, <code>math.comb</code> is enough (Python ints never overflow). For thousands of queries "nCr mod p", precompute <code>fact[i]</code> and <code>inv_fact[i]</code> once in O(N); each query is then O(1). The inverse factorials are filled backwards from a single <code>pow</code>, since <code>1/(i−1)! = i / i!</code>.</p>
  <table class="tbl">
    <tr><th>Question shape</th><th>Formula</th></tr>
    <tr><td>Choose r of n, order does not matter</td><td>C(n, r) = n! / (r!(n−r)!)</td></tr>
    <tr><td>Arrange r of n, order matters</td><td>P(n, r) = n! / (n−r)!</td></tr>
    <tr><td>Paths in a grid moving only right/down</td><td>C(right + down, down)</td></tr>
    <tr><td>Number of subsets of n items</td><td>2ⁿ</td></tr>
    <tr><td>Split n identical items into k groups (stars and bars)</td><td>C(n + k − 1, k − 1)</td></tr>
  </table>

  <h2 id="dsa-mt-digits"><span class="num">08</span>Digits &amp; Overflow</h2>
  <p>Many easy problems work digit by digit: sum of digits, reverse a number, palindrome number, Armstrong numbers. Two tools: <code>n % 10</code> gives the last digit, <code>n // 10</code> drops it. <code>divmod(n, 10)</code> does both at once. Converting to <code>str</code> is also fine in Python, and interviewers usually accept it if you mention the arithmetic way.</p>
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

print(digits(9071), sum(digits(9071)), [int(c) for c in str(9071)])
print(reverse_int(123), reverse_int(-120), reverse_int(1534236469))
print(7 // 2, -7 // 2, int(-7 / 2), 2 ** 64)</div>
  <div class="fx" data-lang="text">[9, 0, 7, 1] 17 [9, 0, 7, 1]
321 -21 0
3 -4 -3 18446744073709551616</div>
  <p>Python ints never overflow (<code>2 ** 64</code> prints in full), but many problems are written for 32-bit languages and say "return 0 if the result overflows". You must check the range yourself: −2³¹ to 2³¹ − 1. Reversing 1534236469 gives 9646324351, which is too big, so the answer is 0.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Rounding of negatives. <code>-7 // 2</code> is −4 (floor), but <code>int(-7 / 2)</code> is −3 (truncate toward zero, like C/Java). When a problem says "truncate toward zero" (Divide Two Integers, Evaluate RPN), use <code>int(a / b)</code>. Also: floats lose precision above 2⁵³, so never use <code>/</code> for big integer maths.</p>
  </div>

  <h2 id="dsa-mt-random"><span class="num">09</span>Random Sampling</h2>
  <p>A lucky draw at a mall: people keep walking in all day, and you must pick 3 winners fairly, but you do not know how many people will come and you cannot keep a list of everyone. <strong>Reservoir sampling</strong> solves it with O(k) memory.</p>
  <ol>
    <li>Keep the first k people as the current winners.</li>
    <li>When person i (0-based) arrives, pick a random number j from 0 to i. If j &lt; k, person i replaces winner j. So person i gets in with chance k / (i+1).</li>
    <li>At the end, every person had the same chance k / n of being a winner.</li>
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
  <p>Over 100,000 runs every item was chosen 30% of the time, as promised. Interview problems: Linked List Random Node (k = 1), Random Pick Index. For a list you already hold, <code>random.sample(lst, k)</code> and <code>random.shuffle</code> (Fisher-Yates) are the library tools.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Why fair, for k = 1: item i is picked with 1/(i+1), then must survive every later item: (i+1)/(i+2) · (i+2)/(i+3) · … · (n−1)/n. Everything cancels to 1/n.</p>
  </div>

  <h2 id="dsa-mt-patterns"><span class="num">10</span>Patterns</h2>
  <div class="cards">
    <div><b>"modulo 10⁹ + 7"</b><p>Reduce after every + and ×. Division → multiply by <code>pow(b, MOD-2, MOD)</code>.</p><small>Never take % only at the end</small></div>
    <div><b>"count primes", "prime factors"</b><p>Many queries up to n → sieve once. One number → trial division to √n.</p><small>O(n log log n) vs O(√n)</small></div>
    <div><b>"x to the power n"</b><p>Large n, or "last digits of a huge power" → fast power.</p><small>pow(a, b, m)</small></div>
    <div><b>"number of ways"</b><p>Choosing without order → nCr; grid moves → C(m+n−2, m−1); else DP.</p><small>math.comb</small></div>
    <div><b>"digits", "reverse", "palindrome number"</b><p>Peel with % 10 and // 10; watch the 32-bit limit.</p><small>divmod(n, 10)</small></div>
    <div><b>"cycle", "repeats", "rotate by k"</b><p>Remainders repeat; gcd(n, k) counts the cycles; Floyd finds loops.</p><small>Happy Number, Rotate Array</small></div>
  </div>

  <h2 id="dsa-mt-problems"><span class="num">11</span>Classic Problems</h2>
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

  <h2 id="dsa-mt-traps"><span class="num">12</span>Common Mistakes</h2>
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

  <h2 id="dsa-mt-qa"><span class="num">13</span>Questions &amp; Answers</h2>
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
</main>
`
});
