// notes/dsa/dsa_math.js — Math & Number Theory
Object.assign(TOPIC_CONTENT, {
  "dsa_math": `<main>
<h1>Math &amp; Number Theory</h1>
  <div class="where"><span>DSA</span><span>Problem-Solving Techniques</span><span>Math &amp; Number Theory</span></div>
  <p class="lead">A small set of school-maths ideas keeps turning up in interviews and in real systems: the greatest common divisor, primes, remainders, fast powers, counting the ways to choose things, and the limits of how computers store numbers. Each of them turns a slow loop into a formula or a handful of steps, and several explain things you have already seen without a reason, such as why answers are given "mod 10⁹ + 7" or why hash tables like prime sizes. The running example is one Biteful story: a region server hands out <strong>order ids in steps of 10</strong> (1010, 1020, …, 1080), and those ids must be spread over database shards, counted, combined and printed correctly. Along the way the kitchen packs 48 samosas and 18 gulab jamuns into combo boxes, and dispatch batches the day's 8 orders, A to H, onto riders.</p>

  <h2 id="dsa-mt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Math &amp; Number Theory</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Divisibility</div>
        <ul>
          <li>Euclid: <code>gcd(a, b) = gcd(b, a % b)</code>, O(log n)</li>
          <li><code>lcm = a // gcd * b</code></li>
          <li>Prime test to √n; sieve O(n log log n)</li>
          <li>Factorise by trial division; divisors come in pairs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Remainders</div>
        <ul>
          <li>+ − × can be reduced at every step</li>
          <li>10⁹ + 7: prime, fits 32 bits, products fit 64</li>
          <li>Division → multiply by the inverse</li>
          <li><code>pow(a, b, m)</code>: square and multiply, O(log b)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Counting</div>
        <ul>
          <li>C(n, r) order doesn't matter; P(n, r) it does</li>
          <li>Pascal: C(n, r) = C(n−1, r−1) + C(n−1, r)</li>
          <li>Many nCr mod p: factorial + inverse-factorial tables</li>
          <li>Reservoir sampling: fair k from a stream</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Machine limits</div>
        <ul>
          <li>32-bit range −2³¹ … 2³¹ − 1</li>
          <li><code>//</code> floors, C/Java truncate</li>
          <li>Floats are approximate: money in paise</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-mt-gcd"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">GCD &amp; LCM</span><span class="rm-sub">Euclid's algorithm, and why shards collide</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-primes"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Primes &amp; the Sieve</span><span class="rm-sub">testing one number, listing all of them</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-factor"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Factors &amp; Divisors</span><span class="rm-sub">what a number is made of</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-mod"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Modular Arithmetic</span><span class="rm-sub">clock maths, and why 10⁹ + 7</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-pow"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Fast Exponentiation</span><span class="rm-sub">huge powers in log steps</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-inv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Modular Inverse</span><span class="rm-sub">how to divide under a modulus</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-comb"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Combinatorics</span><span class="rm-sub">counting ways: nCr, Pascal, grid paths</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-digits"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Digits, Overflow &amp; Precision</span><span class="rm-sub">when a correct formula prints a wrong answer</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-random"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Random Sampling</span><span class="rm-sub">choosing fairly from a stream</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">which words point to which tool</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">late %, dividing remainders, floats</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, templates, costs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-mt-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on maths</span></div></div>
    </div>
  </div>

  <h2 id="dsa-mt-gcd"><span class="num">01</span>GCD &amp; LCM</h2>
  <p>Biteful's database team spreads orders across several database servers, called <strong>shards</strong>, by putting order id x on shard <code>x % m</code>, where m is the number of shards and <code>%</code> gives the remainder. The ids come from a region server in steps of 10. The team tried 10 shards first and saw something strange:</p>
  <div class="fx" data-lang="py">ids = [1010 + 10 * k for k in range(8)]          # ids come in steps of 10
print("order ids:", ids)
for m in [10, 4, 7]:                             # number of database shards
    shards = [i % m for i in ids]
    print(f"m={m:&gt;2}: shards {shards}  used {len(set(shards))} of {m}")</div>
  <div class="fx" data-lang="text">order ids: [1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080]
m=10: shards [0, 0, 0, 0, 0, 0, 0, 0]  used 1 of 10
m= 4: shards [2, 0, 2, 0, 2, 0, 2, 0]  used 2 of 4
m= 7: shards [2, 5, 1, 4, 0, 3, 6, 2]  used 7 of 7</div>
  <p>With 10 shards every single order landed on shard 0, and the other nine sat idle. With 4 shards only two were used. With 7 shards all seven were used. Nothing in the code is wrong; the behaviour comes from how the step 10 and the shard count m share factors. To explain it, and to predict it for any m, we need the <strong>greatest common divisor</strong>, the largest number that divides two numbers exactly.</p>
  <p>Take a friendlier example first. The kitchen has 48 samosas and 18 gulab jamuns and wants as many identical combo boxes as possible with nothing left over. The number of boxes must divide both 48 and 18, and we want the largest such number: gcd(48, 18) = 6, giving 6 boxes of 8 samosas and 3 jamuns each. The school method lists all divisors of both numbers and picks the biggest shared one, which is slow for large numbers. About 2,300 years ago Euclid noticed something better: any number that divides both 48 and 18 also divides their difference, 48 − 18, and therefore also 48 − 18 − 18, all the way down to the remainder 48 % 18 = 12. So the pair (48, 18) has exactly the same common divisors as the pair (18, 12), and in particular the same GCD. Repeating this shrinks the pair quickly until the second number is 0, at which point the first number is the answer.</p>
  <p>Think of cutting a 48 cm × 18 cm card into equal squares with no waste. Cut off as many 18 × 18 squares as fit; a 12 × 18 strip is left. Cut 12 × 12 squares from that strip; a 6 × 12 strip is left. Now 6 × 6 squares fit exactly. The last square size is the GCD, and each cut is one step of Euclid's algorithm.</p>
  <div class="fx" data-lang="py">import math

def gcd(a, b):
    while b:
        print(f"  gcd({a}, {b}): {a} % {b} = {a % b}")
        a, b = b, a % b            # gcd(a, b) == gcd(b, a % b)
    return a

print("gcd(48, 18) =", gcd(48, 18))

def lcm(a, b):
    return a // math.gcd(a, b) * b   # divide first: keeps numbers small

print(math.gcd(48, 18), lcm(4, 6), math.lcm(4, 6, 10), math.gcd(0, 7))
for m in [10, 4, 7]:
    print(f"m={m}: gcd(10, {m}) = {math.gcd(10, m)}, shards used = {m // math.gcd(10, m)}")</div>
  <div class="fx" data-lang="text">  gcd(48, 18): 48 % 18 = 12
  gcd(18, 12): 18 % 12 = 6
  gcd(12, 6): 12 % 6 = 0
gcd(48, 18) = 6
6 12 60 7
m=10: gcd(10, 10) = 10, shards used = 1
m=4: gcd(10, 4) = 2, shards used = 2
m=7: gcd(10, 7) = 1, shards used = 7</div>
  <p>The three trace lines are the three cuts: (48, 18) becomes (18, 12), then (12, 6), then (6, 0), and the answer is 6. Python's <code>math.gcd</code> gives the same. The algorithm is fast because the larger number at least halves every two steps, so it takes O(log min(a, b)) steps; even for 18-digit numbers that is under 100 steps.</p>
  <p>The <strong>least common multiple</strong> (LCM) is the smallest number that both divide. If Dosa Hut restocks every 4 days and Chai Point every 6, they restock on the same day every lcm(4, 6) = 12 days. It comes straight from the GCD: lcm(a, b) = a · b / gcd(a, b). Writing it as <code>a // gcd(a, b) * b</code>, dividing before multiplying, keeps the intermediate number small, which matters in Java or C++ where a · b can overflow. Two useful facts: gcd(a, 0) = a (printed 7 above), and two numbers with gcd 1 are called <strong>coprime</strong>.</p>
  <p>Now the shards make sense, as the last three lines show. Ids in steps of s, placed with <code>% m</code>, can only reach m / gcd(s, m) different shards. With m = 10, gcd(10, 10) = 10, so only one shard is reachable. With m = 4, gcd(10, 4) = 2, so two shards. With m = 7, gcd(10, 7) = 1 (they are coprime), so all seven. This is why hash tables and shard counts are often chosen to be prime: a prime shares no factor with any step that is not a multiple of it, so patterned keys still spread evenly.</p>
  <p>The same cycle structure solves <strong>Rotate Array</strong> in place. To rotate a list right by k, each item moves from position i to (i + k) % n, and following those moves from a starting position forms a cycle, like musical chairs where you carry one value in your hand. There are exactly gcd(n, k) separate cycles, each of length n / gcd(n, k):</p>
  <div class="fx" data-lang="py">import math

def rotate(nums, k):
    """Rotate right by k in place, O(1) extra space, following gcd(n, k) cycles."""
    n = len(nums)
    k %= n
    for start in range(math.gcd(n, k) if k else 0):
        cur, val = start, nums[start]
        while True:
            nxt = (cur + k) % n
            nums[nxt], val = val, nums[nxt]    # drop val in its seat, pick up the old one
            cur = nxt
            if cur == start:
                break

for nums, k in [([1, 2, 3, 4, 5, 6, 7], 3), ([1, 2, 3, 4, 5, 6], 4)]:
    a = nums[:]
    rotate(a, k)
    print(nums, k, "-&gt;", a, " cycles:", math.gcd(len(nums), k))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5, 6, 7] 3 -&gt; [5, 6, 7, 1, 2, 3, 4]  cycles: 1
[1, 2, 3, 4, 5, 6] 4 -&gt; [3, 4, 5, 6, 1, 2]  cycles: 2</div>
  <p>For n = 7 and k = 3 the numbers are coprime, so one cycle visits every seat. For n = 6 and k = 4 the GCD is 2, so two cycles of three (positions 0 → 4 → 2 → 0 and 1 → 5 → 3 → 1). Both take O(n) time and O(1) extra space. Recognise GCD problems from words like "largest equal groups", "simplify the ratio", "when do they meet again", "cycles" or "measure with two jugs".</p>

  <h2 id="dsa-mt-primes"><span class="num">02</span>Primes &amp; the Sieve</h2>
  <p>The shard story ended with "choose a shard count that shares no factors", and numbers that share no factors with anything smaller are primes. A <strong>prime</strong> is a whole number greater than 1 whose only divisors are 1 and itself: 2, 3, 5, 7, 11, and so on. Every other number above 1 can be built by multiplying primes together, so primes are the atoms of the integers. Two questions come up: is one given number prime, and what are all the primes up to n?</p>
  <p>To test one number, the brute-force idea tries every possible divisor from 2 to n − 1, which is O(n). The key insight is that divisors come in pairs around the square root. 36 = 1 × 36 = 2 × 18 = 3 × 12 = 4 × 9 = 6 × 6, and in every pair one side is at most 6 = √36. So if nothing up to √n divides n, nothing above it can either, and checking up to √n is enough. That turns O(n) into O(√n): for n = 10¹² it is a million checks instead of a trillion.</p>
  <div class="fx" data-lang="py">import math

def is_prime(n):
    if n &lt; 2:
        return False
    for i in range(2, math.isqrt(n) + 1):   # a factor pair always has one side &lt;= sqrt(n)
        if n % i == 0:
            return False
    return True

print([n for n in range(30) if is_prime(n)])
print(is_prime(10**9 + 7), is_prime(10**9))</div>
  <div class="fx" data-lang="text">[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
True False</div>
  <p>The primes below 30 come out as expected, and 10⁹ + 7 is prime while 10⁹ is not; that fact will matter in section 04. <code>math.isqrt</code> gives the exact integer square root; <code>int(n ** 0.5)</code> goes through floating point and can be off by one for very large n.</p>
  <p>To list every prime up to n, testing each number separately repeats a lot of work. The <strong>Sieve of Eratosthenes</strong> works the other way round: assume everything is prime, then take the first prime (2) and cross out all its multiples, take the next number still standing (3) and cross out its multiples, and so on. Whatever is never crossed out is prime. Picture a school assembly of students numbered 2 to 30: student 2 says "every multiple of 2, sit down", then the next student still standing, 3, says the same, then 5. After that nobody new sits down, and everyone still standing is prime.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600"><rect x="25" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="50" y="35" text-anchor="middle">2</text><rect x="81" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="35" text-anchor="middle">3</text><rect x="137" y="12" width="50" height="36" rx="4" class="fs"/><text x="162" y="30" text-anchor="middle" class="tm">4</text><text x="162" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="218" y="35" text-anchor="middle">5</text><rect x="249" y="12" width="50" height="36" rx="4" class="fs"/><text x="274" y="30" text-anchor="middle" class="tm">6</text><text x="274" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="330" y="35" text-anchor="middle">7</text><rect x="361" y="12" width="50" height="36" rx="4" class="fs"/><text x="386" y="30" text-anchor="middle" class="tm">8</text><text x="386" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="12" width="50" height="36" rx="4" class="fs"/><text x="442" y="30" text-anchor="middle" class="tm">9</text><text x="442" y="43" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="473" y="12" width="50" height="36" rx="4" class="fs"/><text x="498" y="30" text-anchor="middle" class="tm">10</text><text x="498" y="43" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="12" width="50" height="36" rx="4" class="fg sg"/><text x="554" y="35" text-anchor="middle">11</text><rect x="25" y="56" width="50" height="36" rx="4" class="fs"/><text x="50" y="74" text-anchor="middle" class="tm">12</text><text x="50" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="81" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="79" text-anchor="middle">13</text><rect x="137" y="56" width="50" height="36" rx="4" class="fs"/><text x="162" y="74" text-anchor="middle" class="tm">14</text><text x="162" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="56" width="50" height="36" rx="4" class="fs"/><text x="218" y="74" text-anchor="middle" class="tm">15</text><text x="218" y="87" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="249" y="56" width="50" height="36" rx="4" class="fs"/><text x="274" y="74" text-anchor="middle" class="tm">16</text><text x="274" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="330" y="79" text-anchor="middle">17</text><rect x="361" y="56" width="50" height="36" rx="4" class="fs"/><text x="386" y="74" text-anchor="middle" class="tm">18</text><text x="386" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="56" width="50" height="36" rx="4" class="fg sg"/><text x="442" y="79" text-anchor="middle">19</text><rect x="473" y="56" width="50" height="36" rx="4" class="fs"/><text x="498" y="74" text-anchor="middle" class="tm">20</text><text x="498" y="87" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="56" width="50" height="36" rx="4" class="fs"/><text x="554" y="74" text-anchor="middle" class="tm">21</text><text x="554" y="87" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="25" y="100" width="50" height="36" rx="4" class="fs"/><text x="50" y="118" text-anchor="middle" class="tm">22</text><text x="50" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="81" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="106" y="123" text-anchor="middle">23</text><rect x="137" y="100" width="50" height="36" rx="4" class="fs"/><text x="162" y="118" text-anchor="middle" class="tm">24</text><text x="162" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="193" y="100" width="50" height="36" rx="4" class="fs"/><text x="218" y="118" text-anchor="middle" class="tm">25</text><text x="218" y="131" text-anchor="middle" class="tr" font-size="9">÷5</text><rect x="249" y="100" width="50" height="36" rx="4" class="fs"/><text x="274" y="118" text-anchor="middle" class="tm">26</text><text x="274" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="305" y="100" width="50" height="36" rx="4" class="fs"/><text x="330" y="118" text-anchor="middle" class="tm">27</text><text x="330" y="131" text-anchor="middle" class="tr" font-size="9">÷3</text><rect x="361" y="100" width="50" height="36" rx="4" class="fs"/><text x="386" y="118" text-anchor="middle" class="tm">28</text><text x="386" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="417" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="442" y="123" text-anchor="middle">29</text><rect x="473" y="100" width="50" height="36" rx="4" class="fs"/><text x="498" y="118" text-anchor="middle" class="tm">30</text><text x="498" y="131" text-anchor="middle" class="tr" font-size="9">÷2</text><rect x="529" y="100" width="50" height="36" rx="4" class="fg sg"/><text x="554" y="123" text-anchor="middle">31</text><text x="25" y="160" class="tg">green = prime (never crossed)</text><text x="330" y="160" class="tm">grey = crossed out by its smallest prime</text></svg><figcaption>The sieve for 2 to 31. Each composite number is crossed out by its smallest prime factor. Sieving with 2, 3 and 5 is enough, because 7 × 7 = 49 is already past 30.</figcaption></figure>
  <p>The figure shows the result for numbers up to 31. Every grey box is labelled with the prime that crossed it out: all the even numbers by 2, then 9, 15, 21, 27 by 3, then 25 by 5. Two details make the sieve fast, and the figure shows both. First, prime i only needs to start crossing at i × i: smaller multiples like 2i or 3i have a smaller prime factor and were already crossed (12, 18, 24 were gone before 3 got there). Second, once i × i is past n there is nothing left to cross, so the outer loop stops at √n; 7 never does any work here.</p>
  <div class="fx" data-lang="py">def sieve(n):
    """All primes &lt;= n."""
    is_p = [True] * (n + 1)
    is_p[0] = is_p[1] = False
    i = 2
    while i * i &lt;= n:                        # only primes up to sqrt(n) cross anything out
        if is_p[i]:
            crossed = [j for j in range(i * i, n + 1, i) if is_p[j]]
            print(f"prime {i}: cross out {crossed}")
            for j in range(i * i, n + 1, i): # smaller multiples were crossed already
                is_p[j] = False
        i += 1
    return [k for k in range(n + 1) if is_p[k]]

print(sieve(30))</div>
  <div class="fx" data-lang="text">prime 2: cross out [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]
prime 3: cross out [9, 15, 21, 27]
prime 5: cross out [25]
[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]</div>
  <p>The trace matches the figure: 2 crosses fourteen numbers, 3 crosses only the four that 2 missed, 5 crosses only 25, and the loop stops at 6 because 36 &gt; 30. The total cost is O(n log log n), which in practice is almost linear, and the list uses O(n) memory. For LeetCode's <strong>Count Primes</strong> with n in the millions, Python's inner loop is the bottleneck, so the usual trick is to cross out a whole stride at once with a slice assignment on a <code>bytearray</code>, which runs in C:</p>
  <div class="fx" data-lang="py">def count_primes(n):
    """Number of primes strictly less than n."""
    if n &lt; 3:
        return 0
    is_p = bytearray([1]) * n
    is_p[0] = is_p[1] = 0
    for i in range(2, int(n ** 0.5) + 1):
        if is_p[i]:
            is_p[i * i::i] = bytearray(len(range(i * i, n, i)))   # cross out in one C-speed slice
    return sum(is_p)

print(count_primes(10), count_primes(2), count_primes(1_000_000))</div>
  <div class="fx" data-lang="text">4 0 78498</div>
  <p>There are 4 primes below 10 (2, 3, 5, 7), none below 2, and 78,498 below a million. Recognise prime problems from "count primes less than n", "prime factors", or many "is it prime?" queries with n up to about 10⁷; for one huge number, use the √n test instead of a sieve.</p>

  <h2 id="dsa-mt-factor"><span class="num">03</span>Factors &amp; Divisors</h2>
  <p>On a busy day Biteful handles 360 orders and wants to split them into equal batches. Which batch sizes work, and how many are there, without trying all 360? The answer comes from breaking 360 into its primes, its <strong>prime factorisation</strong>: 360 = 2³ × 3² × 5. Every whole number above 1 has exactly one such factorisation (this is called the fundamental theorem of arithmetic), so it is like a recipe that tells you everything about the number's divisors.</p>
  <p>To find it, use <strong>trial division</strong>: try d = 2, 3, 4, … and divide d out of n as many times as it goes, writing down how many times. It is like peeling an onion layer by layer: peel off every 2, then every 3, and so on. You never peel a 4, because all the 2s were already gone, so composite d values simply never divide. As with the prime test, you can stop once d × d is larger than what is left; if anything bigger than 1 remains at that point, it must itself be a prime.</p>
  <div class="fx" data-lang="py">def factorize(n):
    factors = {}
    d = 2
    while d * d &lt;= n:
        while n % d == 0:          # divide out d completely
            factors[d] = factors.get(d, 0) + 1
            n //= d
        d += 1
    if n &gt; 1:                      # what is left is a prime bigger than sqrt
        factors[n] = factors.get(n, 0) + 1
    return factors

def divisors(n):
    small, large = [], []
    i = 1
    while i * i &lt;= n:
        if n % i == 0:
            small.append(i)
            if i != n // i:        # don't add the square root twice
                large.append(n // i)
        i += 1
    return small + large[::-1]

for n in [360, 97, 1001]:
    print(n, factorize(n))
print(len(divisors(360)), divisors(36))</div>
  <div class="fx" data-lang="text">360 {2: 3, 3: 2, 5: 1}
97 {97: 1}
1001 {7: 1, 11: 1, 13: 1}
24 [1, 2, 3, 4, 6, 9, 12, 18, 36]</div>
  <p>360 peels into three 2s (360 → 45), two 3s (45 → 5), and then the loop stops because 4 × 4 &gt; 5, leaving the prime 5. 97 is prime, so the loop finds nothing and the leftover 97 is the only factor; forgetting that leftover check is the classic bug here. 1001 = 7 × 11 × 13. The time is O(√n), and usually faster because n shrinks as factors are removed.</p>
  <p>Once you have the factorisation, counting divisors is pure arithmetic. A divisor of 2³ × 3² × 5 can use the prime 2 zero to three times (4 choices), 3 zero to two times (3 choices), and 5 zero or one time (2 choices), so there are 4 × 3 × 2 = 24 divisors, which is the 24 printed above and the number of valid batch sizes for 360 orders. In general, if n = p₁^e₁ × p₂^e₂ × …, the number of divisors is (e₁ + 1)(e₂ + 1)…. The factorisation also explains GCD and LCM: the GCD takes the smaller power of each prime and the LCM the larger. To list the divisors themselves, use the same square-root pairing as the prime test: every i up to √n that divides n gives two divisors, i and n / i, and you must not add √n twice when n is a perfect square (36 lists 6 only once). Interview problems in this family include "ugly numbers" (only factors 2, 3, 5), "perfect number" (sum of divisors) and "trailing zeros of n!", which is really counting how many factors of 5 appear.</p>

  <h2 id="dsa-mt-mod"><span class="num">04</span>Modular Arithmetic</h2>
  <p>The shards already use remainders, and the next problem makes them essential. Questions like "in how many ways can the day's orders be batched?" produce astronomically large answers: 100! has 158 digits. Fixed-size integers in Java or C++ cannot hold them, so interview problems say "return the answer modulo 10⁹ + 7", meaning "give only the remainder after dividing by 10⁹ + 7". To do that efficiently we need to know which calculations we can do on remainders instead of on the full numbers.</p>
  <p>Working only with remainders is called <strong>modular arithmetic</strong>, and you use it every day on a clock. If it is 10 o'clock, five hours later it is 3 o'clock, not 15: a clock keeps only the remainder after dividing by 12, so (10 + 5) % 12 = 3. The shards are a clock with 7 hours, and order 1010 sits at 1010 % 7 = 2. The useful fact is that addition, subtraction and multiplication all give the same remainder whether you reduce the inputs first or only at the end. If two numbers leave the same remainder mod m we write a ≡ b (mod m), and the rules are (a + b) % m = (a % m + b % m) % m, (a − b) % m = (a % m − b % m) % m and (a · b) % m = (a % m)(b % m) % m. So you may reduce after every single step and the final remainder is unchanged.</p>
  <div class="fx" data-lang="py">MOD = 10**9 + 7
print("clock:", (10 + 5) % 12, "  shard of 1010:", 1010 % 7)
a, b = 10**12, 10**15
print((a + b) % MOD, (a % MOD + b % MOD) % MOD)      # same
print((a * b) % MOD, (a % MOD) * (b % MOD) % MOD)    # same
print((a - b) % MOD, -7 % 5)                         # Python: never negative

fact = 1
for i in range(1, 101):
    fact = fact * i % MOD                            # reduce at every step
print("100! mod p =", fact)
print("(10^9+7)^2 &lt; 2^63:", (10**9 + 7) ** 2 &lt; 2**63)</div>
  <div class="fx" data-lang="text">clock: 3   shard of 1010: 2
992993007 992993007
999999664 999999664
6993000 3
100! mod p = 437918130
(10^9+7)^2 &lt; 2^63: True</div>
  <p>The two pairs of numbers on lines 2 and 3 are identical: reducing 10¹² and 10¹⁵ first, or adding and multiplying the full numbers and reducing at the end, gives the same remainder. Python's <code>%</code> always returns a non-negative result when m is positive, so <code>(a - b) % MOD</code> is safe and <code>-7 % 5</code> is 3; in Java, C++ and JavaScript <code>-7 % 5</code> is −2, so code in those languages writes <code>((a % m) + m) % m</code>. The factorial loop multiplies and reduces at every step, so every intermediate value stays below 10⁹ + 7 even though the true 100! has 158 digits. (Python could compute the huge number and reduce once at the end, but section 11 shows how much slower that is.)</p>
  <p>Why exactly 10⁹ + 7? There are four reasons, and the last line of the output shows one of them. It is <strong>prime</strong>, which section 06 needs so that division works. It is below 2³¹ − 1, so any remainder fits in a signed 32-bit int. The product of two remainders, about 10¹⁸, is below 2⁶³, so <code>a * b % MOD</code> never overflows a 64-bit integer in C++ or Java. And it is large, so two different true answers rarely collide on the same remainder by accident. The other common choice, 998244353, is also a prime with the same properties. One rule is missing from the list above on purpose: division does <em>not</em> survive reducing. That needs its own tool, the modular inverse, which is built from the next idea.</p>

  <h2 id="dsa-mt-pow"><span class="num">05</span>Fast Exponentiation</h2>
  <p>Biteful's coupon codes are 13 symbols long, each symbol one of 3 characters, so there are 3¹³ possible codes. Other problems need things like 2ⁿ mod p for n = 10¹⁸. Computing aᵇ by multiplying a by itself b times is O(b): 12 multiplications for 3¹³ is fine, but 10¹⁸ multiplications would never finish, even if each one is reduced mod p.</p>
  <p>The key insight uses the binary digits of the exponent, from the <a class="xref" data-note="dsa_bits">Bit Manipulation</a> note. 13 in binary is <code>1101</code>, which means 13 = 8 + 4 + 1, so 3¹³ = 3⁸ × 3⁴ × 3¹. And the powers 3¹, 3², 3⁴, 3⁸ are cheap to produce, because each is the square of the one before. So walk through the bits of the exponent from the right while repeatedly squaring the base, and multiply the current power into the answer only when the bit is 1. This is called <strong>binary exponentiation</strong> or square-and-multiply. Think of folding paper: each fold doubles the thickness, so to get 13 layers' worth you do not add sheets one at a time; you use the 1-fold, 4-fold and 8-fold stacks.</p>
  <div class="fx" data-lang="py">def fast_pow(a, b, m):
    result = 1
    a %= m
    while b &gt; 0:
        bit = b &amp; 1
        if bit:                    # this bit of b is on: multiply in the current power
            result = result * a % m
        print(f"b={b:&gt;4b}  bit={bit}  power={a:&gt;3}  result={result}")
        a = a * a % m              # a, a^2, a^4, a^8, ...
        b &gt;&gt;= 1
    return result

print(fast_pow(3, 13, 1000), 3 ** 13)
print(pow(2, 10**18, 10**9 + 7))   # built-in: about 60 rounds, instant</div>
  <div class="fx" data-lang="text">b=1101  bit=1  power=  3  result=3
b= 110  bit=0  power=  9  result=3
b=  11  bit=1  power= 81  result=243
b=   1  bit=1  power=561  result=323
323 1594323
719476260</div>
  <p>The four trace lines are the four bits of 13, read from the right. In round 1 the bit is 1, so the current power 3 goes into the result. In round 2 the bit is 0, so the power 9 is skipped. In round 3 the power is 81 and the bit is 1, so the result becomes 3 × 81 = 243. In round 4 the power is 3⁸ = 6561, which is 561 mod 1000, and the bit is 1, so the result becomes 243 × 561 = 136323, which is 323 mod 1000. The true 3¹³ is 1,594,323, which does end in 323. Four rounds instead of twelve multiplications, and for b = 10¹⁸ about 60 rounds, so the cost is O(log b). Python's built-in three-argument <code>pow(a, b, m)</code> does exactly this in C, and the last line computes 2 to the power 10¹⁸ mod p instantly. In real code always use it; never write <code>a ** b % m</code> for a large b, because that builds the full giant number first.</p>
  <p>LeetCode's <strong>Pow(x, n)</strong> asks for the same loop on a float x with a possibly negative n. A negative exponent just means "1 over the positive power", so swap x for 1/x and n for −n first:</p>
  <div class="fx" data-lang="py">def my_pow(x, n):
    if n &lt; 0:
        x, n = 1 / x, -n           # x^-n = (1/x)^n
    result = 1.0
    while n:
        if n &amp; 1:
            result *= x
        x *= x
        n &gt;&gt;= 1
    return result

print(my_pow(2.0, 10), my_pow(2.0, -2), my_pow(1.0, -2**31))</div>
  <div class="fx" data-lang="text">1024.0 0.25 1.0</div>
  <p>2¹⁰ = 1024, 2⁻² = 0.25, and 1 to the power −2³¹ is 1 after about 31 rounds. In Java, −n overflows when n = −2³¹ because +2³¹ does not fit in an int, so you copy n into a <code>long</code> first; Python has no such problem. The same square-and-multiply idea extends to matrices, which is how the nth Fibonacci number is computed in O(log n), and it is at the heart of RSA encryption.</p>

  <h2 id="dsa-mt-inv"><span class="num">06</span>Modular Inverse</h2>
  <p>Section 04 said that addition, subtraction and multiplication can be reduced at every step, but division cannot. We need division for the formula C(n, r) = n! / (r! (n − r)!) in the next section, so it is worth seeing exactly what goes wrong:</p>
  <div class="fx" data-lang="py">MOD = 10**9 + 7
print((12 % 7) / (3 % 7))          # dividing remainders: not even an integer

inv3 = pow(3, MOD - 2, MOD)        # Fermat: a^(p-2) is a^-1 when p is prime
print(inv3, 3 * inv3 % MOD)
print(12 * inv3 % MOD)             # "12 / 3" under the modulus
print(pow(3, -1, MOD) == inv3, pow(3, -1, 7))   # Python 3.8+: built-in inverse
try:
    pow(2, -1, 4)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">1.6666666666666667
333333336 1
4
True 5
ValueError: base is not invertible for the given modulus</div>
  <p>The first line tries to compute 12 / 3 = 4 using remainders mod 7: 12 % 7 is 5 and 3 % 7 is 3, and 5 / 3 is not even a whole number. The fix is to stop thinking of division as division. Dividing by 3 is the same as multiplying by "1/3", and in modular arithmetic "1/3" means the number x that makes 3 · x ≡ 1 (mod m). That x is called the <strong>modular inverse</strong> of 3. Mod 7 it is 5, because 3 × 5 = 15 = 2 × 7 + 1. On a 7-hour clock, five jumps of 3 hours land you on 1 o'clock.</p>
  <p>When the modulus p is prime, Fermat's little theorem gives the inverse directly: a^(p−1) ≡ 1 (mod p) for any a not divisible by p, so a × a^(p−2) ≡ 1, which means a^(p−2) is the inverse. That is one fast <code>pow</code> call from section 05. The output shows the inverse of 3 mod 10⁹ + 7 is 333333336. It looks random, but 3 × 333333336 leaves remainder exactly 1, and 12 × 333333336 leaves 4, which is 12 / 3. Python 3.8+ also accepts <code>pow(a, -1, m)</code>, which works for any modulus by running the extended Euclidean algorithm (Euclid's algorithm run backwards to find x and y with a·x + m·y = 1), and it returned 5 for the inverse of 3 mod 7.</p>
  <p>An inverse exists only when gcd(a, m) = 1. The last line asks for the inverse of 2 mod 4 and Python refuses: no x makes 2x leave remainder 1 when divided by 4, because 2x is always even. This is the deeper reason the standard modulus is prime: with a prime p, every number from 1 to p − 1 has an inverse, so every division you need is possible. Using Fermat's formula with a non-prime modulus is a silent bug, because it returns a number that is not actually an inverse.</p>

  <h2 id="dsa-mt-comb"><span class="num">07</span>Combinatorics</h2>
  <p>Dispatch wants to batch 2 of the day's 8 orders onto one rider. How many different batches are possible, and when n is 10⁵ instead of 8, how do we get the count mod 10⁹ + 7? Counting the ways to choose or arrange things is called <strong>combinatorics</strong>, and it hides inside many "number of ways" interview questions.</p>
  <p>The first thing to decide is whether order matters. A batch {A, B} is the same as {B, A}, so order does not matter: that is a <strong>combination</strong>, written C(n, r) or "n choose r", and C(n, r) = n! / (r! (n − r)!). If order does matter, for example which order is dropped off first, it is a <strong>permutation</strong>, P(n, r) = n! / (n − r)!. For 8 orders, C(8, 2) = 28 and P(8, 2) = 56, exactly twice as many because each pair can be delivered in two orders.</p>
  <p>There is also a way to compute C(n, r) using only addition, and it explains a lot. Look at order H. Either H is in the batch, and we must choose 1 more from the other 7 (7 ways), or H is not, and we must choose 2 from the other 7 (21 ways). So C(8, 2) = C(7, 1) + C(7, 2) = 7 + 21 = 28. In general C(n, r) = C(n − 1, r − 1) + C(n − 1, r), which is <strong>Pascal's rule</strong>, and writing the values out row by row gives Pascal's triangle, where each number is the sum of the two above it.</p>
  <div class="fx" data-lang="py">import math
from itertools import combinations
orders = list("ABCDEFGH")                          # the day's 8 orders
pairs = list(combinations(orders, 2))              # batch 2 orders on one rider
print(len(pairs), math.comb(8, 2), math.perm(8, 2))

def pascal(rows):
    tri = [[1]]
    for _ in range(rows - 1):
        prev = tri[-1]
        tri.append([1] + [prev[i] + prev[i + 1] for i in range(len(prev) - 1)] + [1])
    return tri

for row in pascal(9)[6:]:
    print(row)</div>
  <div class="fx" data-lang="text">28 28 56
[1, 6, 15, 20, 15, 6, 1]
[1, 7, 21, 35, 35, 21, 7, 1]
[1, 8, 28, 56, 70, 56, 28, 8, 1]</div>
  <p><code>itertools.combinations</code> lists the 28 pairs, and <code>math.comb</code> and <code>math.perm</code> count them without listing. Rows 6 to 8 of the triangle are printed: row 8 holds C(8, r) for r = 0 to 8, so there are 28 pairs, 56 triples and 70 batches of four, and the 28 in row 8 is the sum of the 7 and the 21 above it in row 7, exactly as the argument about order H said.</p>
  <p>For one exact answer, <code>math.comb</code> is all you need, since Python integers never overflow. But a problem may ask for thousands of "nCr mod p" queries with n up to 10⁶. Computing each from scratch would be too slow, and dividing reduced factorials is wrong (section 06). The standard plan is to precompute two tables once in O(N): <code>fact[i] = i! mod p</code> and <code>inv_fact[i] = (i!)⁻¹ mod p</code>. Then each query is two multiplications: C(n, r) = fact[n] × inv_fact[r] × inv_fact[n − r]. The inverse table needs only one <code>pow</code> call, for the largest factorial, and is then filled backwards using 1/(i − 1)! = i × 1/i!.</p>
  <div class="fx" data-lang="py">import math
MOD = 10**9 + 7
N = 1000
fact = [1] * (N + 1)
for i in range(1, N + 1):
    fact[i] = fact[i - 1] * i % MOD
inv_fact = [1] * (N + 1)
inv_fact[N] = pow(fact[N], MOD - 2, MOD)          # one inverse...
for i in range(N, 0, -1):
    inv_fact[i - 1] = inv_fact[i] * i % MOD       # ...then 1/(i-1)! = i * 1/i!

def ncr_mod(n, r):
    if r &lt; 0 or r &gt; n:
        return 0
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD

print(ncr_mod(8, 2), ncr_mod(1000, 500), math.comb(1000, 500) % MOD)</div>
  <div class="fx" data-lang="text">28 159835829 159835829</div>
  <p>The table version gives 28 for C(8, 2) and the same remainder for C(1000, 500) as Python's exact <code>math.comb</code> followed by <code>% MOD</code>, even though the exact value has 300 digits. Build is O(N), each query O(1).</p>
  <p>Combinations also count paths. A rider who may only move right or down through a grid of streets, from the top-left corner of an m × n grid to the bottom-right, always makes exactly m − 1 down moves and n − 1 right moves; a route is just a choice of which of the m + n − 2 moves are the downs, so there are C(m + n − 2, m − 1) routes. This is LeetCode's <strong>Unique Paths</strong>. The DP solution, where the number of ways into a cell is the ways from above plus the ways from the left, builds the same Pascal's triangle, rotated:</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600"><rect x="20" y="10" width="60" height="40" class="fs"/><text x="50" y="35" text-anchor="middle">1</text><rect x="80" y="10" width="60" height="40" class="fs"/><text x="110" y="35" text-anchor="middle">1</text><rect x="140" y="10" width="60" height="40" class="fs"/><text x="170" y="35" text-anchor="middle">1</text><rect x="200" y="10" width="60" height="40" class="fs"/><text x="230" y="35" text-anchor="middle">1</text><rect x="20" y="50" width="60" height="40" class="fs"/><text x="50" y="75" text-anchor="middle">1</text><rect x="80" y="50" width="60" height="40" class="fb sb"/><text x="110" y="75" text-anchor="middle">2</text><rect x="140" y="50" width="60" height="40" class="fb sb"/><text x="170" y="75" text-anchor="middle">3</text><rect x="200" y="50" width="60" height="40" class="fb sb"/><text x="230" y="75" text-anchor="middle">4</text><rect x="20" y="90" width="60" height="40" class="fs"/><text x="50" y="115" text-anchor="middle">1</text><rect x="80" y="90" width="60" height="40" class="fb sb"/><text x="110" y="115" text-anchor="middle">3</text><rect x="140" y="90" width="60" height="40" class="fb sb"/><text x="170" y="115" text-anchor="middle">6</text><rect x="200" y="90" width="60" height="40" class="fg sg"/><text x="230" y="115" text-anchor="middle">10</text><text x="300" y="40">each cell = above + left</text><text x="300" y="70" class="tm">3 × 4 grid: 2 downs + 3 rights</text><text x="300" y="100" class="tg">C(5, 2) = 10 paths</text><text x="300" y="130" class="tm">the numbers are Pascal's triangle</text></svg><figcaption>Unique paths in a 3 × 4 grid. The DP table and the formula C(m + n − 2, m − 1) both give 10.</figcaption></figure>
  <p>In the figure, the top row and left column are all 1 because there is only one way to reach them (straight along the edge). Every other cell adds the cell above and the cell to its left: the middle row goes 1, 2, 3, 4 and the bottom row 1, 3, 6, 10. Read along the diagonals and you will find Pascal's triangle. Both versions agree in code:</p>
  <div class="fx" data-lang="py">import math

def unique_paths(m, n):                 # (m-1) downs and (n-1) rights in some order
    return math.comb(m + n - 2, m - 1)

def unique_paths_dp(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]        # from above (old row[j]) + from the left
    return row[-1]

print(unique_paths(3, 4), unique_paths_dp(3, 4), unique_paths(3, 7), unique_paths_dp(3, 7))</div>
  <div class="fx" data-lang="text">10 10 28 28</div>
  <p>The formula is O(min(m, n)) and the DP is O(m · n) time with one row of O(n) space. Mention both in an interview: the formula is elegant, but the DP generalises to grids with obstacles (Unique Paths II), where the formula no longer applies. One more counting formula worth knowing is <strong>stars and bars</strong>: the number of ways to split n identical items into k groups is C(n + k − 1, k − 1), so 6 identical samosas into 3 boxes can be packed in C(8, 2) = 28 ways.</p>

  <h2 id="dsa-mt-digits"><span class="num">08</span>Digits, Overflow &amp; Precision</h2>
  <p>So far every formula has been mathematically right. On a real machine, a correct formula can still print a wrong answer, for two reasons: fixed-size integers <strong>overflow</strong> (a result too large for the box wraps around or is rejected), and floating-point numbers store most decimals only approximately. Python hides the first problem, which is exactly why you must check for it yourself when a problem is written for 32-bit languages. Think of a car's milometer with five wheels: past 99999 it rolls to 00000. Python's integers have unlimited wheels; most other languages have 32 or 64 bits, and the problem statement tells you which milometer it was written for.</p>
  <p>Many easy problems work digit by digit: digit sums, reversing a number, palindrome numbers. Two operations do all of it: <code>n % 10</code> is the last digit and <code>n // 10</code> drops it, and <code>divmod(n, 10)</code> gives both at once. <strong>Reverse Integer</strong> combines that with an overflow rule: reverse the digits, but return 0 if the result does not fit in a signed 32-bit integer, −2³¹ to 2³¹ − 1.</p>
  <div class="fx" data-lang="py">def reverse_int(n):
    sign = -1 if n &lt; 0 else 1
    n, r = abs(n), 0
    while n:
        n, d = divmod(n, 10)       # peel the last digit
        r = r * 10 + d             # push it onto the result
    r *= sign
    return r if -2**31 &lt;= r &lt;= 2**31 - 1 else 0   # 0 if it would overflow 32 bits

print(reverse_int(1080), reverse_int(-120), reverse_int(1534236469))
print(7 // 2, -7 // 2, int(-7 / 2))  # floor vs truncate toward zero</div>
  <div class="fx" data-lang="text">801 -21 0
3 -4 -3</div>
  <p>Order id 1080 reverses to 801 and −120 to −21. Reversing 1534236469 gives 9646324351, which is larger than 2³¹ − 1 = 2147483647, so the answer is 0; Python computed the big number without complaint, which is why the range check has to be written by hand. The second line shows the other machine detail: Python's <code>//</code> rounds <em>down</em> (floor), so −7 // 2 is −4, while C and Java round <em>toward zero</em> (truncate), giving −3. When a problem says "truncate toward zero" (Divide Two Integers, Evaluate Reverse Polish Notation), use <code>int(a / b)</code> for small values, as in the last number printed.</p>
  <p>Floating-point numbers have a different problem. They are stored in binary, and most decimal fractions such as 0.1 have no exact binary form, just as 1/3 has no exact decimal form. The error is tiny, but it shows up as soon as you compare, and Biteful's bill shows the real-world consequence:</p>
  <div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
print(0.1 + 0.2, 0.1 + 0.2 == 0.3)
bill = sum(c * 1.18 for c in charges)             # each charge + 18% GST, as floats
print("bill as float:", bill, bill == 1345.2)
paise = sum(c * 118 for c in charges)             # whole paise instead (Rs 1 = 100 paise)
print("bill in paise:", paise, "-&gt; Rs", paise // 100, "and", paise % 100, "paise")
print(float(2**53 + 1) == 2**53 + 1)              # floats lose integers above 2^53</div>
  <div class="fx" data-lang="text">0.30000000000000004 False
bill as float: 1345.1999999999998 False
bill in paise: 134520 -&gt; Rs 1345 and 20 paise
False</div>
  <p>0.1 + 0.2 is not exactly 0.3. The day's eight charges, each with 18% GST added as a float, sum to 1345.1999999999998 instead of 1345.20, and the equality test fails. The fix for money is to never use floats: work in whole paise (integers), where 118 per rupee is exact, and the bill is exactly 134520 paise, Rs 1345.20. The last line shows that floats also stop representing every integer above 2⁵³, so using <code>/</code> or <code>math.sqrt</code> on big integers silently loses precision.</p>
  <p>One digit problem is a well-known trap: spreadsheet column names. A, B, …, Z are 1 to 26, then AA is 27. This is base 26, like reading the decimal "352" as 3 × 100 + 5 × 10 + 2, except that the digits run from 1 to 26 with no zero. Reading letters into a number is easy, n = n × 26 + value. Going back is where people slip, because a plain <code>divmod(n, 26)</code> gives remainder 0 for Z; subtracting 1 before each division shifts the digits to 0–25 and fixes it:</p>
  <div class="fx" data-lang="py">def title_to_number(col):
    n = 0
    for ch in col:
        n = n * 26 + (ord(ch) - ord("A") + 1)   # base 26 with digits A=1 .. Z=26
    return n

def number_to_title(n):
    out = []
    while n &gt; 0:
        n, r = divmod(n - 1, 26)        # shift to 0..25 before dividing: there is no zero digit
        out.append(chr(ord("A") + r))
    return "".join(reversed(out))

for col in ["A", "Z", "AA", "ZY"]:
    print(col, title_to_number(col), number_to_title(title_to_number(col)))</div>
  <div class="fx" data-lang="text">A 1 A
Z 26 Z
AA 27 AA
ZY 701 ZY</div>
  <p>Every column name survives the round trip, including ZY = 26 × 26 + 25 = 701. Recognise this family from "32-bit signed integer", "return 0 if it overflows", "reverse the digits", "palindrome number", "truncate toward zero", money, or "numbers given as strings" (Add Strings, Multiply Strings, Plus One), where you do school arithmetic digit by digit with a carry.</p>

  <h2 id="dsa-mt-random"><span class="num">09</span>Random Sampling</h2>
  <p>Biteful gives free dessert to 3 random orders each day. Orders stream in all day, nobody knows how many there will be, and the system cannot store them all. How do we pick 3 so that every order had exactly the same chance? The obvious approach, store all orders and pick 3 at the end with <code>random.sample</code>, needs memory for the whole day. Think of a lucky draw at a mall where people keep walking in and you must announce winners fairly at closing time, without keeping a list of everyone.</p>
  <p><strong>Reservoir sampling</strong> solves it with memory for only k items. Keep the first k orders as the current winners. When order number i arrives (counting from 0), pick a random whole number j from 0 to i; if j is less than k, the new order replaces winner j, otherwise it is ignored. So order i gets a seat with probability k / (i + 1). The early orders have a high chance of getting a seat but must survive many later replacements; the late orders have a low chance of getting in but few replacements left. The two effects balance exactly, and at the end every order has the same chance, k / n.</p>
  <p>You can check the balance for k = 1. Order i is picked with chance 1/(i + 1), and then must not be replaced by any later order: it survives order i + 1 with chance (i + 1)/(i + 2), order i + 2 with (i + 2)/(i + 3), and so on up to (n − 1)/n. Multiply all of those and everything cancels except 1/n, the same for every i. The code simulates 100,000 days of 10 orders each:</p>
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
for _ in range(100_000):                   # 100,000 simulated days of 10 orders
    for x in reservoir_sample(range(10), 3, rng):
        counts[x] += 1
print([round(c / 100_000, 2) for c in counts])</div>
  <div class="fx" data-lang="text">[0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3]</div>
  <p>Every one of the 10 orders was chosen 30% of the time, which is exactly k / n = 3/10. One pass, O(n) time, O(k) memory. The one detail that breaks fairness is the range of j: <code>randint(0, i)</code> includes both ends, giving i + 1 choices; using <code>randrange(i)</code> or <code>randint(0, i - 1)</code> biases the draw toward later items. Recognise this from "random node of a linked list", "random index of a target", "equal probability", or "a stream of unknown length". For a list you already hold, <code>random.sample</code> and <code>random.shuffle</code> (the Fisher–Yates shuffle) are the library tools, and "pick with weight" uses prefix sums plus binary search instead.</p>

  <h2 id="dsa-mt-patterns"><span class="num">10</span>Patterns</h2>
  <p>Maths problems rarely name the tool; they describe a story and the numbers give it away. "Return the answer modulo 10⁹ + 7" tells you to reduce after every addition and multiplication, and if the formula contains a division, to multiply by an inverse. "Count primes" or many prime queries up to a bound mean a sieve; a single huge number means trial division up to √n. "x to the power n" with n up to 10⁹ or more, or "last digits of a huge power", means fast exponentiation. "Number of ways to choose" with no other constraints means nCr; a grid with only right and down moves means C(m + n − 2, m − 1); anything with obstacles or extra rules usually means DP. "Largest equal groups", "simplify", "cycles" or "rotate by k" point to GCD. Digit problems ("reverse", "palindrome number", "sum of digits") mean peeling with <code>% 10</code> and <code>// 10</code> while watching the 32-bit limit, and a process on digits that might loop forever, such as <strong>Happy Number</strong> (repeatedly sum the squares of the digits), is really cycle detection with a set or Floyd's fast and slow pointers.</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Tool</th><th>Skeleton</th><th>Cost</th></tr>
    <tr><td>"modulo 10⁹ + 7"</td><td>reduce every step</td><td><code>x = x * y % MOD</code></td><td>O(1) per step</td></tr>
    <tr><td>formula with division, mod p</td><td>modular inverse</td><td><code>a * pow(b, MOD - 2, MOD) % MOD</code></td><td>O(log p)</td></tr>
    <tr><td>"count primes", many prime queries</td><td>sieve</td><td>cross out from i·i while i·i ≤ n</td><td>O(n log log n)</td></tr>
    <tr><td>"is n prime", "prime factors"</td><td>trial division</td><td><code>while d * d &lt;= n</code></td><td>O(√n)</td></tr>
    <tr><td>"power", huge exponent</td><td>fast power</td><td><code>pow(a, b, m)</code></td><td>O(log b)</td></tr>
    <tr><td>"number of ways to choose", grid paths</td><td>combinations</td><td><code>math.comb(n, r)</code>; fact / inv_fact tables</td><td>O(1) per query after O(N)</td></tr>
    <tr><td>"equal groups", "cycles", "rotate"</td><td>GCD / LCM</td><td><code>while b: a, b = b, a % b</code></td><td>O(log n)</td></tr>
    <tr><td>"reverse digits", "32-bit", "overflow"</td><td>digit peeling + range check</td><td><code>n, d = divmod(n, 10)</code></td><td>O(digits)</td></tr>
    <tr><td>"random", "stream", "equal probability"</td><td>reservoir sampling</td><td><code>j = randint(0, i); if j &lt; k: s[j] = x</code></td><td>O(n), O(k) space</td></tr>
  </table>
  <p>For practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, start with Palindrome Number, Plus One and Reverse Integer (digits and overflow), then Greatest Common Divisor of Strings and Count Primes, Pow(x, n), Unique Paths and Pascal's Triangle, Excel Sheet Column Title, Happy Number, and finally Linked List Random Node and Count Good Numbers (fast power mod p).</p>

  <h2 id="dsa-mt-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common mistake with "mod 10⁹ + 7" is taking the remainder only at the very end. In Java or C++ the intermediate values overflow and the answer is garbage. In Python the answer is still right, but the numbers grow to thousands of digits and everything slows down. Timings are approximate, but the gap is large:</p>
  <div class="fx" data-lang="py">import time
MOD = 10**9 + 7
t = time.perf_counter(); f = 1
for i in range(1, 20001): f *= i
late = f % MOD; t1 = time.perf_counter() - t
t = time.perf_counter(); g = 1
for i in range(1, 20001): g = g * i % MOD
t2 = time.perf_counter() - t
print(late == g, f.bit_length(), "bits in 20000!")
print(f"% at the end: {t1 * 1000:.0f} ms   % every step: {t2 * 1000:.1f} ms")</div>
  <div class="fx" data-lang="text">True 256909 bits in 20000!
% at the end: 75 ms   % every step: 1.3 ms</div>
  <p>Both versions give the same remainder for 20000!, but the late version builds a 256,909-bit integer and takes many times longer (here tens of milliseconds against about one or two). Reduce after every multiplication. The second classic mistake is dividing remainders, which section 06 explained; here it is with real numbers:</p>
  <div class="fx" data-lang="py">MOD = 10**9 + 7
a, b = 10**12, 10**6               # true answer: a / b = 10**6
print((a % MOD) // (b % MOD) % MOD)             # wrong
print(a % MOD * pow(b, MOD - 2, MOD) % MOD)     # right</div>
  <div class="fx" data-lang="text">999
1000000</div>
  <p>The true answer is 10¹² / 10⁶ = 10⁶. Integer-dividing the reduced values gives 999, which is nonsense, while multiplying by the Fermat inverse gives 1000000. A third mistake is using floating-point functions for integer maths:</p>
  <div class="fx" data-lang="py">import math
n = 10**30 + 1
print(int(math.sqrt(n * n)) == n, math.isqrt(n * n) == n)</div>
  <div class="fx" data-lang="text">False True</div>
  <p>For a 31-digit number, <code>math.sqrt</code> went through a float and came back wrong, while <code>math.isqrt</code> is exact. Use <code>math.isqrt</code>, <code>//</code> and three-argument <code>pow</code> for integers, never <code>math.sqrt</code>, <code>/</code> or <code>math.pow</code>. Beyond these: 0 and 1 are not prime (many <code>is_prime</code> functions forget 1); size the sieve n + 1 for "≤ n" and n for "&lt; n"; remember the leftover prime after trial division; check for 32-bit overflow by hand when the problem asks; remember that Python's <code>%</code> and <code>//</code> floor while other languages truncate; and do <code>k %= n</code> before any rotation or circular index, since k may be larger than n.</p>

  <h2 id="dsa-mt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>GCD</b>: largest number dividing both; <b>LCM</b>: smallest number both divide; <b>coprime</b>: gcd = 1.</li>
    <li><b>Prime</b>: p &gt; 1 with no divisors except 1 and p. 0 and 1 are not prime; 2 is the only even prime.</li>
    <li><b>Prime factorisation</b>: n = p₁^e₁ · p₂^e₂ · …, unique; divisors = (e₁ + 1)(e₂ + 1)….</li>
    <li><b>a ≡ b (mod m)</b>: same remainder; + − × respect it, division does not.</li>
    <li><b>Modular inverse</b> of a: x with a·x ≡ 1 (mod m); exists iff gcd(a, m) = 1.</li>
    <li><b>C(n, r)</b>: ways to choose r of n, order ignored; <b>P(n, r)</b>: order matters.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Example</th></tr>
    <tr><td>Euclid</td><td>gcd(a, b) = gcd(b, a mod b); gcd(a, 0) = a</td><td>(48, 18) → (18, 12) → (12, 6) → 6</td></tr>
    <tr><td>LCM</td><td>a / gcd(a, b) · b</td><td>lcm(4, 6) = 12</td></tr>
    <tr><td>Shards reached</td><td>m / gcd(step, m)</td><td>step 10: m = 10 → 1, 4 → 2, 7 → 7</td></tr>
    <tr><td>Divisor count</td><td>∏ (eᵢ + 1)</td><td>360 = 2³·3²·5 → 24</td></tr>
    <tr><td>Fermat inverse</td><td>a⁻¹ ≡ a^(p−2) (mod p), p prime</td><td>3⁻¹ mod (10⁹ + 7) = 333333336</td></tr>
    <tr><td>Combinations</td><td>C(n, r) = n! / (r!(n−r)!) = C(n−1, r−1) + C(n−1, r)</td><td>C(8, 2) = 28</td></tr>
    <tr><td>Permutations</td><td>P(n, r) = n! / (n−r)!</td><td>P(8, 2) = 56</td></tr>
    <tr><td>Grid paths</td><td>C(m + n − 2, m − 1)</td><td>3 × 4 → 10</td></tr>
    <tr><td>Stars and bars</td><td>C(n + k − 1, k − 1)</td><td>6 items, 3 boxes → 28</td></tr>
    <tr><td>Reservoir</td><td>item i kept with chance k / (i + 1)</td><td>final chance k / n</td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py">while b: a, b = b, a % b                 # gcd in a
lcm = a // math.gcd(a, b) * b

i = 2                                    # sieve
while i * i &lt;= n:
    if is_p[i]:
        for j in range(i * i, n + 1, i): is_p[j] = False
    i += 1

result = 1                               # fast power (or just pow(a, b, m))
while b:
    if b &amp; 1: result = result * a % m
    a = a * a % m; b &gt;&gt;= 1

inv = pow(b, MOD - 2, MOD)               # divide by b mod a prime
ncr = fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD
n, d = divmod(n, 10)                     # peel the last digit</div>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Time</th></tr>
    <tr><td>gcd / lcm</td><td>O(log min(a, b))</td></tr>
    <tr><td>Prime test, factorisation</td><td>O(√n)</td></tr>
    <tr><td>Sieve up to n</td><td>O(n log log n) time, O(n) space</td></tr>
    <tr><td>Fast power, Fermat inverse</td><td>O(log b)</td></tr>
    <tr><td>nCr mod p tables</td><td>O(N) build, O(1) query</td></tr>
    <tr><td>Reservoir sampling</td><td>O(n) time, O(k) space</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Reduce % MOD after every step, not just at the end.</li>
    <li>Never divide remainders; multiply by the inverse (prime modulus only for Fermat).</li>
    <li>Use <code>math.isqrt</code>, <code>//</code>, <code>pow(a, b, m)</code>; avoid floats for integers and money.</li>
    <li>1 is not prime; remember the leftover prime after trial division.</li>
    <li>Python: <code>-7 // 2 = -4</code>, <code>-7 % 5 = 3</code>; C/Java truncate (−3, −2).</li>
    <li>Check 32-bit overflow by hand when the problem asks (Reverse Integer).</li>
    <li>Excel title: <code>divmod(n - 1, 26)</code>; rotation: <code>k %= n</code> first.</li>
    <li><code>randint(0, i)</code> is inclusive: i + 1 choices.</li>
  </ul>

  <h2 id="dsa-mt-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Euclid's algorithm and its complexity.</summary><div class="qa-body">Replace (a, b) with (b, a % b) until b is 0; then a is the GCD. It works because any common divisor of a and b also divides a % b, so the set of common divisors never changes. The larger number at least halves every two steps, so it takes O(log min(a, b)) steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute the LCM, and why divide before multiplying?</summary><div class="qa-body">lcm(a, b) = a / gcd(a, b) × b, because gcd × lcm = a × b. Writing <code>a // gcd(a, b) * b</code> keeps the intermediate value no larger than the answer, whereas <code>a * b</code> first can overflow in fixed-width languages when a and b are near 10⁹.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a prime test only need to check divisors up to √n?</summary><div class="qa-body">Divisors come in pairs a × b = n. If both a and b were larger than √n, their product would be larger than n, which is impossible. So every factor pair has one member at most √n, and if none is found there, n is prime. That makes the test O(√n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the Sieve of Eratosthenes, why start crossing at i × i, and what does it cost?</summary><div class="qa-body">Every smaller multiple k × i with k &lt; i has a prime factor smaller than i, so it was already crossed out. The same reason lets the outer loop stop at √n. The total cost is O(n log log n) time and O(n) space, which is practically linear.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many divisors does 360 have, and how do you work it out without listing them?</summary><div class="qa-body">Factorise: 360 = 2³ × 3² × 5. A divisor picks each prime's exponent from 0 up to its power, giving (3+1)(2+1)(1+1) = 24 divisors. Trial division finds the factorisation in O(√n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do problems ask for the answer modulo 10⁹ + 7?</summary><div class="qa-body">The true answers are too large for fixed-size integers. 10⁹ + 7 is prime, so every non-zero remainder has an inverse and division works; it fits in a signed 32-bit int; and the product of two remainders, about 10¹⁸, fits in a signed 64-bit int, so <code>a * b % MOD</code> never overflows in C++ or Java.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which operations can you reduce mod m at every step, and which can't you?</summary><div class="qa-body">Addition, subtraction and multiplication give the same remainder whether you reduce inputs first or only at the end, so you can reduce at every step. Division cannot: dividing remainders gives wrong answers. Replace division by b with multiplication by b's modular inverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does fast exponentiation work, and what does it cost?</summary><div class="qa-body">Read the exponent in binary. Keep squaring the base (a, a², a⁴, a⁸ …) and multiply the current power into the result whenever the current bit of the exponent is 1; 3¹³ = 3⁸ × 3⁴ × 3¹ because 13 = 1101. That needs O(log b) multiplications. Python's <code>pow(a, b, m)</code> implements it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute (a / b) mod p for a prime p? What if the modulus is not prime?</summary><div class="qa-body">Multiply by the inverse: <code>a * pow(b, p - 2, p) % p</code>, from Fermat's little theorem, which needs b not divisible by p. For a non-prime modulus, use the extended Euclidean algorithm or Python's <code>pow(b, -1, m)</code>, which only works when gcd(b, m) = 1; otherwise no inverse exists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need nCr mod 10⁹ + 7 for 10⁵ queries with n up to 10⁶. What is your plan?</summary><div class="qa-body">Precompute <code>fact[0..N]</code> and <code>inv_fact[0..N]</code> mod p in O(N): one <code>pow</code> for <code>inv_fact[N]</code>, then fill backwards with <code>inv_fact[i-1] = inv_fact[i] * i</code>. Each query is <code>fact[n] * inv_fact[r] * inv_fact[n-r] % MOD</code>, O(1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Combinations vs permutations: how do you decide which one a problem wants?</summary><div class="qa-body">Ask whether swapping two chosen items gives a different answer. If not (a team, a batch, a subset), it is a combination C(n, r). If yes (a ranking, a sequence, a route order), it is a permutation P(n, r) = C(n, r) × r!.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Unique Paths in a 3 × 7 grid: formula, answer, and when would you use DP instead?</summary><div class="qa-body">Every path is 2 downs and 6 rights in some order, so C(8, 2) = 28; in general C(m + n − 2, m − 1). Use the DP (ways into a cell = from above + from the left) when the grid has obstacles or costs, because the formula assumes every cell is usable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>print(-7 % 3, -7 // 3, int(-7 / 3))</code></summary><div class="qa-body"><code>2 -3 -2</code>. Python's <code>%</code> takes the sign of the divisor and <code>//</code> floors, so −7 // 3 is −3 and −7 % 3 is 2 (since −3 × 3 + 2 = −7). <code>int(-7 / 3)</code> truncates toward zero, giving −2, which is what C and Java do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't you store money as floats, and what do you use instead?</summary><div class="qa-body">Floats store most decimals approximately in binary, so sums drift (the bill came out as 1345.1999…) and equality checks fail. Store amounts as integers in the smallest unit (paise or cents), or use <code>decimal.Decimal</code> when you need decimal arithmetic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you handle Reverse Integer's overflow rule in Python?</summary><div class="qa-body">Python never overflows, so compute the reversed number normally and then check it against the 32-bit range −2³¹ to 2³¹ − 1, returning 0 if it falls outside. In Java you would instead check before each <code>r * 10 + d</code> step whether it would exceed the limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain reservoir sampling and why it is fair.</summary><div class="qa-body">Keep the first k items. For item i (0-based), pick j uniformly in 0..i; if j &lt; k, replace slot j with the item. Item i enters with chance k/(i+1) and then survives each later step with a matching probability, and the product telescopes to k/n for every item. It uses one pass and O(k) memory, so it works on streams of unknown length.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do hash tables and shard counts often use prime sizes?</summary><div class="qa-body">Keys often follow a pattern, such as ids in steps of 10. With x % m, keys in steps of s reach only m / gcd(s, m) buckets, so a size sharing factors with the step leaves buckets empty. A prime m shares no factor with any step that is not a multiple of it, so patterned keys spread over every bucket.</div></details>
</main>
`
});
