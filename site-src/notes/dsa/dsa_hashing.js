// notes/dsa/dsa_hashing.js — Hashing
Object.assign(TOPIC_CONTENT, {
  "dsa_hashing": `<main>
<h1>Hashing</h1>
  <div class="where"><span>DSA</span><span>Linear structures</span><span>Hashing</span></div>
  <p class="lead"><strong>Hashing</strong> is the technique of turning a key (a number, a word, a tuple) directly into a position in an array, so that storing and finding things by key takes the same short time no matter how much data there is. Python's <code>dict</code> and <code>set</code> are built on it, and "use a dict" is the answer to a remarkable share of interview questions, because it turns the O(n) question "have I seen this before?" into an O(1) one, and with it many O(n²) solutions into O(n). This note first builds a hash table by hand to show how it works inside (hash functions, collisions, resizing, what may be a key), then teaches the five patterns that use it: the seen set, Two Sum, counting, prefix sum with a hash map, and grouping. The running example is the same as in the <a class="xref" data-note="dsa_arrays">Arrays</a> note: Biteful's 8 charges <b>[120, 80, 250, 40, 310, 80, 60, 200]</b> and the profit per order after paying the rider ₹120, <b>[0, −40, 130, −80, 190, −40, −60, 80]</b>. All outputs are real runs on Python 3.13; timings are approximate.</p>

  <h2 id="dsa-hs-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hashing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">How it works</div>
        <ul>
          <li>slot = hash(key) % size → jump straight there</li>
          <li><b>Collision</b>: two keys, one slot → chaining or probing</li>
          <li>Grow at about 2/3 full → O(1) average, O(1) amortised insert</li>
          <li>Worst case O(n) if many keys collide</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keys</div>
        <ul>
          <li>Must be <b>hashable</b>: hash never changes</li>
          <li>int, str, tuple, frozenset yes; list, dict, set no</li>
          <li>a == b must imply hash(a) == hash(b)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python tools</div>
        <ul>
          <li><code>dict</code>, <code>set</code>, <code>d.get(k, 0)</code>, set algebra</li>
          <li><code>Counter</code> for counts, <code>defaultdict(list)</code> for groups</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Seen set</b>: duplicates, visited</li>
          <li><b>Complement</b>: Two Sum, need = target − x</li>
          <li><b>Counting</b>: anagrams, top k</li>
          <li><b>Prefix + map</b>: subarrays summing to k</li>
          <li><b>Grouping</b>: canonical key → list</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-hs-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Hashing Exists</span><span class="rm-sub">"have I seen this?" without searching</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-how"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hash Functions and Slots</span><span class="rm-sub">turning a key into a position</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-collide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Collisions and Resizing</span><span class="rm-sub">two keys, one slot; when the table grows</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-impl"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Build One From Scratch</span><span class="rm-sub">put, get, delete, tombstones</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-hashable"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">What Can Be a Key</span><span class="rm-sub">hashability and the hash contract</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-python"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">dict, set, Counter, defaultdict</span><span class="rm-sub">Python's everyday tools</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-twosum"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Two Sum: Complement Lookup</span><span class="rm-sub">pairs in one pass</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-count"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Counting and Anagrams</span><span class="rm-sub">value → how many times</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-prefix"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Prefix Sum + Hash Map</span><span class="rm-sub">subarrays summing to k, with negatives</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-group"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Grouping by Key</span><span class="rm-sub">canonical forms that collide on purpose</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-patterns"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Choosing the Pattern</span><span class="rm-sub">from the problem's wording to the pattern</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-problems"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">what to practise, in order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">self-pairing, phantom keys, mutation</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">mechanics, patterns, templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about hashing</span></div></div>
    </div>
  </div>

  <h2 id="dsa-hs-need"><span class="num">01</span>Why Hashing Exists</h2>
  <p>An array is excellent at "give me the item at position 4", but many real questions are not about positions. As charges stream in, Biteful wants to know: <em>has this amount already appeared today?</em> There is no position to jump to for that question. The only array answer is to scan everything stored so far, which makes each check O(n) and the whole day O(n²), the duplicate check that took seconds in the <a class="xref" data-note="dsa_complexity">Complexity</a> note.</p>
  <p>Think of a college library with 50,000 books. If the books were piled up in the order they arrived, finding one would mean walking every aisle reading spines. Instead, each book has a catalogue code, and the code itself tells you which shelf to go to. A <strong>hash table</strong> does the same for any value: it computes a position from the value itself, so to find something you go straight to where it must be. In Python, a <strong>set</strong> is a hash table that stores keys only and answers "is it here?", and a <strong>dict</strong> stores key → value pairs.</p>
  <p>The simplest pattern built on this is the <strong>seen set</strong>: walk through the data once, and before remembering each item, ask the set whether it is already there. On the day's charges:</p>
  <div class="fx" data-lang="py">def first_repeat(charges):
    seen = set()
    for i, c in enumerate(charges):
        print(f"i={i} charge={c:3}  in seen? {'YES' if c in seen else 'no '}  seen={sorted(seen)}")
        if c in seen:                # O(1) on average: is it already there?
            return i, c
        seen.add(c)                  # O(1) amortised: remember it
    return None

print(first_repeat([120, 80, 250, 40, 310, 80, 60, 200]))</div>
  <div class="fx" data-lang="text">i=0 charge=120  in seen? no   seen=[]
i=1 charge= 80  in seen? no   seen=[120]
i=2 charge=250  in seen? no   seen=[80, 120]
i=3 charge= 40  in seen? no   seen=[80, 120, 250]
i=4 charge=310  in seen? no   seen=[40, 80, 120, 250]
i=5 charge= 80  in seen? YES  seen=[40, 80, 120, 250, 310]
(5, 80)</div>
  <p>The set grows by one charge per step: 120, then 80, then 250, 40 and 310. At position 5 the second 80 arrives, the set says yes, and we have found the repeat after 6 checks, each of which took constant time. That is O(n) time for the whole pass, and O(n) space for the set, compared with O(n²) time and O(1) space for comparing every pair.</p>
  <p>Why not keep the seen values in a sorted list and use binary search, which is O(log n) per check? Here are three ways to store 1 lakh processed charge ids, each asked 2,000 "seen before?" questions:</p>
  <div class="fx" data-lang="py">import time, random, bisect
random.seed(4)
stored = random.sample(range(10**9), 100_000)    # 1 lakh charge ids already processed
queries = random.sample(range(10**9), 2_000)     # 2,000 new ids: "seen before?"
as_list, as_sorted, as_set = list(stored), sorted(stored), set(stored)

def in_sorted(q):                                # binary search on the sorted list
    i = bisect.bisect_left(as_sorted, q)
    return i &lt; len(as_sorted) and as_sorted[i] == q

for name, check in [("unsorted list (scan)", lambda q: q in as_list),
                    ("sorted list (binary search)", in_sorted),
                    ("set (hash table)", lambda q: q in as_set)]:
    t = time.perf_counter()
    hits = sum(check(q) for q in queries)
    print(f"{name:28} {(time.perf_counter() - t) * 1000:8.2f} ms for 2,000 checks")</div>
  <div class="fx" data-lang="text">unsorted list (scan)          1317.94 ms for 2,000 checks
sorted list (binary search)      2.17 ms for 2,000 checks
set (hash table)                 0.76 ms for 2,000 checks</div>
  <p>The plain list needs well over a second, because every check scans. Binary search on a sorted list is fast to <em>query</em>, but keeping the list sorted as new ids arrive means inserting in the middle, which shifts items and costs O(n) per insert. The set is fastest to query and also O(1) to insert, which is why it wins whenever the question is "exact match: is it here?". Recognise the seen-set pattern when a problem says <em>duplicate</em>, <em>appears twice</em>, <em>already seen</em>, <em>first repeated</em>, <em>unique</em> or <em>visited</em>.</p>

  <h2 id="dsa-hs-how"><span class="num">02</span>Hash Functions and Slots</h2>
  <p>A hash table is underneath just an array of <strong>slots</strong> (also called buckets). Arrays can jump to slot i in O(1), but our keys are values like 310 or "chai", not slot numbers. We need a rule that turns any key into a slot number, and always the same one for the same key. That rule has two parts. A <strong>hash function</strong> turns the key into an integer; it must be <strong>deterministic</strong> (the same key always gives the same number) and should <strong>spread</strong> different keys over many different numbers. Then <code>hash(key) % number_of_slots</code> squeezes that integer into a valid index.</p>
  <p>A railway parcel office works the same way. It has 100 pigeon-holes, and the rule is that each parcel goes into the hole numbered by the last two digits of the receiver's phone number. To collect your parcel you say your number, and the clerk looks in exactly one hole. "Last two digits" is the hash function, and the pigeon-holes are the array. Python's built-in <code>hash</code> of a small integer is the integer itself, which makes the charges easy to place by hand:</p>
  <div class="fx" data-lang="py">charges = [120, 80, 250, 40, 310, 80, 60, 200]
print([hash(c) for c in charges])                 # small ints hash to themselves
for size in (8, 16):
    print(f"{size:2} slots:", {c: hash(c) % size for c in charges})</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, 310, 80, 60, 200]
 8 slots: {120: 0, 80: 0, 250: 2, 40: 0, 310: 6, 60: 4, 200: 0}
16 slots: {120: 8, 80: 0, 250: 10, 40: 8, 310: 6, 60: 12, 200: 8}</div>
  <p>With 8 slots, 250 goes to slot 2 (250 % 8), 310 to slot 6 and 60 to slot 4. But 120, 80, 40 and 200 are all multiples of 8, so all four want slot 0. With 16 slots the keys spread differently, though 120, 40 and 200 still share slot 8. Different keys landing in the same slot is called a <strong>collision</strong>, and it is the subject of the next section. (CPython keeps the number of slots a power of two and uses the faster <code>hash &amp; (size − 1)</code>, which gives the same result as <code>% size</code> for non-negative hashes.)</p>
  <p>For strings, a good hash mixes in every character, so that "dosa" and "soda" get different numbers. A toy version, the same shape Java uses for its string hash, multiplies the running value by 31 and adds each character's code. On Biteful's breakfast menu:</p>
  <div class="fx" data-lang="py">def toy_hash(key):                   # the shape Java uses for String.hashCode
    h = 0
    for ch in key:
        h = h * 31 + ord(ch)         # mix every character in
    return h

for dish in ["chai", "dosa", "idli", "vada"]:      # Biteful's breakfast menu
    h = toy_hash(dish)
    print(f"{dish}: hash={h}  slot={h % 8}")</div>
  <div class="fx" data-lang="text">chai: hash=3052365  slot=5
dosa: hash=3089433  slot=1
idli: hash=3227608  slot=0
vada: hash=3611752  slot=0</div>
  <p>Each word becomes a large number that depends on every letter, and the slot is that number modulo 8. "idli" and "vada" both land in slot 0, another collision. The reason hashing gives O(1) is that computing the hash and the slot takes the same time whether the table holds ten keys or ten million; nothing depends on how many keys are stored. (Hashing a string of length k is O(k), but Python remembers a string's hash after computing it once.) One practical warning: Python randomises string hashes per process to stop attackers from crafting colliding keys, so <code>hash("chai")</code> changes between runs. Never save hash values or rely on the order in which a set of strings prints.</p>

  <h2 id="dsa-hs-collide"><span class="num">03</span>Collisions and Resizing</h2>
  <p>There are endlessly many possible keys and only a few slots, so some keys <em>must</em> share a slot; on our charges, four of the seven distinct values want slot 0. A hash table needs a rule for collisions, and there are two classic ones. In <strong>separate chaining</strong>, each slot holds a small list of all the keys that hashed there, and a lookup scans that short list; Java's HashMap works this way. In <strong>open addressing</strong>, each slot holds at most one key, and when the home slot is busy the key follows a fixed sequence of other slots (the <strong>probe sequence</strong>) until it finds a free one; a lookup follows the same sequence until it finds the key or reaches an empty slot. CPython's dict and set use open addressing. Picture two hotels: the first puts an extra bed into an already-booked room (chaining), the second says "room 101 is taken, try 102" (open addressing), and anyone looking for you later walks 101, 102 and onwards in the same way.</p>
  <p>The simplest probe sequence is "try the next slot", called <strong>linear probing</strong>. Here it is by hand on the charges with 8 slots, followed by two lookups:</p>
  <div class="fx" data-lang="py">size = 8
table = [None] * size
for k in [120, 80, 250, 40, 310, 80, 60, 200]:
    if k in table:
        print(f"{k:3}: already stored")
        continue
    i = home = k % size                      # hash(k) == k for small ints
    path = [i]
    while table[i] is not None:              # busy: linear probing tries the next slot
        i = (i + 1) % size
        path.append(i)
    table[i] = k
    print(f"{k:3}: home {home}, tried {path}, stored in slot {i}")
print(table)

def lookup(k):                               # follow the same path as insert
    i, looks = k % size, 1
    while table[i] is not None and table[i] != k:
        i, looks = (i + 1) % size, looks + 1
    return ("found" if table[i] == k else "not found"), looks
print("lookup 200:", lookup(200), "| lookup 90:", lookup(90))</div>
  <div class="fx" data-lang="text">120: home 0, tried [0], stored in slot 0
 80: home 0, tried [0, 1], stored in slot 1
250: home 2, tried [2], stored in slot 2
 40: home 0, tried [0, 1, 2, 3], stored in slot 3
310: home 6, tried [6], stored in slot 6
 80: already stored
 60: home 4, tried [4], stored in slot 4
200: home 0, tried [0, 1, 2, 3, 4, 5], stored in slot 5
[120, 80, 250, 40, 60, 200, 310, None]
lookup 200: ('found', 6) | lookup 90: ('not found', 6)</div>
  <figure class="viz"><svg viewBox="0 0 620 200" width="620">
<defs><marker id="hs-pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="310" y="18" text-anchor="middle" font-size="12">8 slots, linear probing, keys inserted in charge order (slot = k % 8)</text>
<rect x="30" y="60" width="64" height="40" class="fb sb"/><text x="62" y="85" text-anchor="middle" font-size="13">120</text><text x="62" y="118" text-anchor="middle" class="tm" font-size="11">slot 0</text><text x="62" y="136" text-anchor="middle" font-size="10" class="tg">home 0</text>
<rect x="100" y="60" width="64" height="40" class="fr sr"/><text x="132" y="85" text-anchor="middle" font-size="13">80</text><text x="132" y="118" text-anchor="middle" class="tm" font-size="11">slot 1</text><text x="132" y="136" text-anchor="middle" font-size="10" class="tr">home 0</text>
<rect x="170" y="60" width="64" height="40" class="fb sb"/><text x="202" y="85" text-anchor="middle" font-size="13">250</text><text x="202" y="118" text-anchor="middle" class="tm" font-size="11">slot 2</text><text x="202" y="136" text-anchor="middle" font-size="10" class="tg">home 2</text>
<rect x="240" y="60" width="64" height="40" class="fr sr"/><text x="272" y="85" text-anchor="middle" font-size="13">40</text><text x="272" y="118" text-anchor="middle" class="tm" font-size="11">slot 3</text><text x="272" y="136" text-anchor="middle" font-size="10" class="tr">home 0</text>
<rect x="310" y="60" width="64" height="40" class="fb sb"/><text x="342" y="85" text-anchor="middle" font-size="13">60</text><text x="342" y="118" text-anchor="middle" class="tm" font-size="11">slot 4</text><text x="342" y="136" text-anchor="middle" font-size="10" class="tg">home 4</text>
<rect x="380" y="60" width="64" height="40" class="fr sr"/><text x="412" y="85" text-anchor="middle" font-size="13">200</text><text x="412" y="118" text-anchor="middle" class="tm" font-size="11">slot 5</text><text x="412" y="136" text-anchor="middle" font-size="10" class="tr">home 0</text>
<rect x="450" y="60" width="64" height="40" class="fb sb"/><text x="482" y="85" text-anchor="middle" font-size="13">310</text><text x="482" y="118" text-anchor="middle" class="tm" font-size="11">slot 6</text><text x="482" y="136" text-anchor="middle" font-size="10" class="tg">home 6</text>
<rect x="520" y="60" width="64" height="40" class="fs" stroke="currentColor"/><text x="552" y="118" text-anchor="middle" class="tm" font-size="11">slot 7</text>
<path d="M62,58 C150,25 380,25 412,58" fill="none" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#hs-pa)"/>
<text x="240" y="40" text-anchor="middle" class="tr" font-size="11">200: home 0 busy → 1 → 2 → 3 → 4 → slot 5 (6 looks)</text>
<text x="310" y="170" text-anchor="middle" class="tm" font-size="11">blue = in its home slot · red = pushed along by a collision</text>
<text x="310" y="188" text-anchor="middle" class="tm" font-size="11">slots 0–6 form one long busy run (a cluster), so every probe that enters it walks far</text>
</svg><figcaption>Where the 7 distinct charges land. The red keys all wanted slot 0 and were pushed further along each time.</figcaption></figure>
  <p>Walk along the figure from the left. 120 takes its home, slot 0. 80 also wants slot 0, finds it busy and moves to slot 1. 250 lands at home in slot 2. 40 wants slot 0 and has to walk 0, 1, 2 and 3. 310 and 60 land at home. Finally 200 wants slot 0 and walks all the way to slot 5, six looks. Each collision lengthens the busy run, and a longer run makes the next collision more expensive; this snowball is called <strong>clustering</strong>. Lookups pay the same price: finding 200 repeats the 6 looks, and finding the missing value 90 (home 90 % 8 = 2) walks 2, 3, 4, 5, 6 and stops only at the empty slot 7. CPython avoids most clustering by jumping around the table using more bits of the hash, roughly <code>i = (5*i + 1 + perturb) % size</code> with <code>perturb</code> shifted right a little each step, so keys that collided once quickly follow different paths.</p>
  <p>The real cure is to keep the table from getting crowded. The <strong>load factor</strong> is the number of stored keys divided by the number of slots. At a load of 0.25 most probes hit an empty slot immediately; near 1.0 almost every probe walks a long way. So the table grows before it gets crowded: CPython rebuilds a dict with more slots when it is about <strong>two-thirds</strong> full. Our 7 keys in 8 slots (0.875) were far past that point. You can watch a real dict grow:</p>
  <div class="fx" data-lang="py">import sys
d, last = {}, sys.getsizeof({})
for i in range(30):
    d[i] = i
    if sys.getsizeof(d) != last:             # the table was rebuilt bigger
        print(f"after inserting key number {len(d):2}: table grew ({last} -&gt; {sys.getsizeof(d)} bytes)")
        last = sys.getsizeof(d)</div>
  <div class="fx" data-lang="text">after inserting key number  1: table grew (64 -&gt; 224 bytes)
after inserting key number  6: table grew (224 -&gt; 352 bytes)
after inserting key number 11: table grew (352 -&gt; 632 bytes)
after inserting key number 22: table grew (632 -&gt; 1168 bytes)</div>
  <p>The first insert creates the table. After that it grows at the 6th key (more than 2/3 of 8 slots), the 11th (more than 2/3 of 16) and the 22nd (more than 2/3 of 32). Growing means allocating a bigger table and re-inserting every key, because each key's slot is <code>hash % size</code> and the size has changed; this is called <strong>rehashing</strong>, and it is why you can never rely on a key "staying in slot 6". A rebuild costs O(n), but since the size multiplies each time, rebuilds are rare and the cost averages out, exactly like a list's append: insertion is <strong>O(1) amortised</strong>. The honest summary for interviews is: lookup, insert and delete are O(1) on average, and O(n) in the worst case, when many keys collide (a bad hash function, or an attacker choosing keys). If a guaranteed bound matters more than the average, a balanced search tree gives O(log n) every time.</p>
  <p>One more detail explains a Python behaviour you may have noticed. Modern CPython stores a dict in two parts: a small table of slots that hold positions, and a dense list of (hash, key, value) entries in insertion order. That "compact dict" saves memory, and it is why dicts remember insertion order (guaranteed since Python 3.7). Sets are not built this way, so a set's order is arbitrary.</p>

  <h2 id="dsa-hs-impl"><span class="num">04</span>Build One From Scratch</h2>
  <p>Writing a hash map yourself is the best check that you understand it, and it is also an interview question in its own right (LeetCode 706, Design HashMap). Ours uses open addressing with linear probing, and three ideas carry the whole thing. First, find a key by probing from its home slot until you reach the key or an empty slot. Second, grow the table when it is two-thirds full. Third, delete by leaving a <strong>tombstone</strong>, a marker that means "something was here; keep probing", instead of emptying the slot. We use it to record, for each charge amount, the last position at which it appeared:</p>
  <div class="fx" data-lang="py">EMPTY, DELETED = object(), object()          # markers: never used / tombstone

class HashMap:
    def __init__(self, cap=8):
        self.keys = [EMPTY] * cap
        self.vals = [None] * cap
        self.used = 0                        # live keys + tombstones

    def _slot(self, key):                    # where key is, or where it should go
        i = hash(key) % len(self.keys)
        free = None
        while self.keys[i] is not EMPTY:     # probe until an empty slot
            if self.keys[i] is DELETED:
                if free is None:
                    free = i                 # remember a reusable slot
            elif self.keys[i] == key:
                return i                     # found the key
            i = (i + 1) % len(self.keys)
        return free if free is not None else i

    def put(self, key, val):
        i = self._slot(key)
        if self.keys[i] is EMPTY:
            self.used += 1
        self.keys[i], self.vals[i] = key, val
        if self.used * 3 &gt;= len(self.keys) * 2:          # 2/3 full: grow
            old = [(k, v) for k, v in zip(self.keys, self.vals) if k is not EMPTY and k is not DELETED]
            self.__init__(len(self.keys) * 2)
            for k, v in old:                             # rehash into the bigger table
                self.put(k, v)

    def get(self, key, default=None):
        i = self._slot(key)
        return self.vals[i] if self.keys[i] not in (EMPTY, DELETED) else default

    def delete(self, key):
        i = self._slot(key)
        if self.keys[i] in (EMPTY, DELETED):
            raise KeyError(key)
        self.keys[i], self.vals[i] = DELETED, None       # tombstone, not EMPTY

    def layout(self):
        return {i: k for i, k in enumerate(self.keys) if k not in (EMPTY, DELETED)}

last_seen = HashMap()                        # charge -&gt; last position it appeared at
for pos, c in enumerate([120, 80, 250, 40, 310, 80, 60, 200]):
    last_seen.put(c, pos)
    print(f"put {c:3} -&gt; {pos}: capacity {len(last_seen.keys):2}, slots {last_seen.layout()}")
last_seen.delete(250)
print(last_seen.get(80), last_seen.get(250), last_seen.get(200), last_seen.get(999, "none"))</div>
  <div class="fx" data-lang="text">put 120 -&gt; 0: capacity  8, slots {0: 120}
put  80 -&gt; 1: capacity  8, slots {0: 120, 1: 80}
put 250 -&gt; 2: capacity  8, slots {0: 120, 1: 80, 2: 250}
put  40 -&gt; 3: capacity  8, slots {0: 120, 1: 80, 2: 250, 3: 40}
put 310 -&gt; 4: capacity  8, slots {0: 120, 1: 80, 2: 250, 3: 40, 6: 310}
put  80 -&gt; 5: capacity  8, slots {0: 120, 1: 80, 2: 250, 3: 40, 6: 310}
put  60 -&gt; 6: capacity 16, slots {0: 80, 6: 310, 8: 120, 9: 40, 10: 250, 12: 60}
put 200 -&gt; 7: capacity 16, slots {0: 80, 6: 310, 8: 120, 9: 40, 10: 250, 11: 200, 12: 60}
5 None 7 none</div>
  <p>Trace it call by call. The first four puts land in slots 0, 1, 2 and 3, with 80 and 40 probing past busy slots exactly as in the hand trace. 310 goes to slot 6: 5 keys in 8 slots, still under two-thirds. The second 80 is an <em>update</em>: <code>_slot</code> finds the existing key in slot 1 and overwrites its value with 5, so the size does not change. Putting 60 makes 6 of 8 slots used, which crosses two-thirds, so the table rebuilds itself with 16 slots and re-inserts every key with <code>% 16</code>: 120 moves to slot 8, 40 (also home 8) probes to 9, 250 to 10, and 80 to 0. Then 200, whose home is 8, probes past 8, 9 and 10 to slot 11. Finally 250 is deleted, so <code>get(250)</code> returns None while <code>get(80)</code> returns 5 and <code>get(200)</code> returns 7.</p>
  <p>The tombstone is the subtle part. Suppose we deleted 80 from slot 1 of the small table by simply emptying the slot. A later search for 40, whose home is 0, would look at slot 0 (120), then slot 1, find it empty, and stop with "not found", even though 40 sits in slot 3. The tombstone keeps such probe chains intact: searches walk past it, inserts may reuse it, and a resize clears tombstones away. That is also why <code>used</code> counts tombstones: they occupy slots in probe chains, and if they were ignored the table could fill up with tombstones and a probe loop would never find an empty slot. The costs of the finished structure:</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Average</th><th>Worst</th><th>Why</th></tr>
    <tr><td>get, <code>key in d</code></td><td>O(1)</td><td>O(n)</td><td>hash, then a few probes; worst when all keys collide</td></tr>
    <tr><td>put (insert or update)</td><td>O(1) amortised</td><td>O(n)</td><td>occasional resize re-inserts everything</td></tr>
    <tr><td>delete</td><td>O(1)</td><td>O(n)</td><td>find, then leave a tombstone</td></tr>
    <tr><td>iterate all keys</td><td>O(n)</td><td>O(n)</td><td>visit every entry</td></tr>
    <tr><td>min, max, sorted keys</td><td>O(n), O(n log n)</td><td></td><td>a hash table keeps no order by value</td></tr>
    <tr><td>space</td><td>O(n)</td><td></td><td>plus spare empty slots (at least a third of the table)</td></tr>
  </table>

  <h2 id="dsa-hs-hashable"><span class="num">05</span>What Can Be a Key</h2>
  <p>A hash table finds a key by its hash. If a key could change after being stored, its hash would change too, and the table would look in the wrong slot and never find it again. It is like filing a document under someone's phone number: if they change their number while the file is in the cabinet, nobody can find the file by either number. So keys must be <strong>hashable</strong>, meaning their hash never changes during their lifetime. In practice that means <strong>immutable</strong> values: numbers, strings, tuples whose contents are hashable, and frozensets. Biteful might key orders by a (shift, slot) tuple, a coupon code, or a frozenset of the prices in a combo:</p>
  <div class="fx" data-lang="py">d = {}
d[("lunch", 2)] = 250                # (shift, slot) tuple: fine
d["BITE50"] = "coupon"
d[frozenset({80, 200})] = "combo"
for bad in ([80, 200], ("lunch", [2])):
    try:
        d[bad] = "?"
    except TypeError as e:
        print(repr(bad), "-&gt; TypeError:", e)
print(len(d), {1: "a", 1.0: "b", True: "c"})

class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))       # equal points -&gt; equal hashes

visited = {Point(1, 2)}
print(Point(1, 2) in visited, Point(2, 1) in visited)</div>
  <div class="fx" data-lang="text">[80, 200] -&gt; TypeError: unhashable type: 'list'
('lunch', [2]) -&gt; TypeError: unhashable type: 'list'
3 {1: 'c'}
True False</div>
  <p>The tuple, the string and the frozenset were all accepted. The list was refused with <code>TypeError: unhashable type</code>, and so was a tuple that <em>contains</em> a list, because a tuple is only hashable if everything inside it is. The dict literal shows a surprise: <code>1</code>, <code>1.0</code> and <code>True</code> are equal in Python and have equal hashes, so they are the <em>same key</em>; the dict keeps the first key object and the last value, giving <code>{1: 'c'}</code>.</p>
  <p>The rule behind all this is the <strong>hash contract</strong>: if <code>a == b</code>, then <code>hash(a) == hash(b)</code>. (The reverse need not hold; different keys may collide.) Your own classes can be keys if they follow it. The <code>Point</code> class defines equality by its coordinates and its hash from the same coordinates, so a new <code>Point(1, 2)</code> is found in a set holding a different <code>Point(1, 2)</code> object. If you define <code>__eq__</code> without <code>__hash__</code>, Python makes the class unhashable, to stop you breaking the contract by accident; <code>@dataclass(frozen=True)</code> writes both for you. The usual fixes for unhashable data are <code>tuple(lst)</code>, <code>frozenset(s)</code> or <code>tuple(sorted(d.items()))</code>. Be careful with float keys too: <code>0.1 + 0.2</code> is not exactly <code>0.3</code>, so they are different keys; store money as whole paise or round before using it as a key.</p>

  <h2 id="dsa-hs-python"><span class="num">06</span>dict, set, Counter, defaultdict</h2>
  <p>Day to day you never write a hash map class; you use Python's. Every pattern in the rest of this note needs one of four moves: read a value with a default, combine sets, count things, or collect things into lists. Writing <code>if k not in d: d[k] = ...</code> every time is slow and easy to get wrong, so Python provides a tool for each move:</p>
  <div class="fx" data-lang="py">from collections import Counter, defaultdict
charges = [120, 80, 250, 40, 310, 80, 60, 200]

menu = {"chai": 20, "dosa": 50}
menu["idli"] = 30                    # insert
menu["chai"] += 5                    # update
print(menu.get("vada", 0), "vada" in menu, menu.setdefault("poha", 15), menu)

today = set(charges)
yesterday = {80, 90, 200, 310, 500}
print(len(today), today &amp; yesterday, sorted(today - yesterday))

count = Counter(charges)
print(count[80], count[999], count.most_common(2))

by_band = defaultdict(list)          # missing key -&gt; a new empty list
for c in charges:
    by_band[c // 100].append(c)      # band 0 = under 100, 1 = 100-199, ...
print(dict(by_band))</div>
  <div class="fx" data-lang="text">0 False 15 {'chai': 25, 'dosa': 50, 'idli': 30, 'poha': 15}
7 {80, 310, 200} [40, 60, 120, 250]
2 0 [(80, 2), (120, 1)]
{1: [120], 0: [80, 40, 80, 60], 2: [250, 200], 3: [310]}</div>
  <p>Line by line: <code>menu.get("vada", 0)</code> returned 0 for a missing dish instead of raising <code>KeyError</code> the way <code>menu["vada"]</code> would, and <code>setdefault</code> inserted poha only because it was missing. Turning the 8 charges into a set gives 7 distinct amounts; <code>&amp;</code> (intersection) shows the amounts charged both today and yesterday, {80, 200, 310}, and <code>-</code> (difference) the ones charged only today. A <strong>Counter</strong> is a dict of counts: it says 80 appears twice, a missing key reads as 0 rather than raising, and <code>most_common(k)</code> returns the k biggest counts. A <strong>defaultdict(list)</strong> creates an empty list the first time a key is used, so grouping the charges into price bands needed no setup code at all.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Use it for</th><th>Remember</th></tr>
    <tr><td><code>dict</code></td><td>key → value lookups, value → index</td><td><code>d[k]</code> raises if missing; <code>d.get(k, default)</code> doesn't; insertion-ordered</td></tr>
    <tr><td><code>set</code></td><td>membership, de-duplication</td><td><code>&amp;</code> both, <code>|</code> either, <code>-</code> only left, <code>^</code> exactly one; no order</td></tr>
    <tr><td><code>Counter</code></td><td>frequencies, top k</td><td>missing → 0; <code>most_common(k)</code>; <code>Counter(a) == Counter(b)</code></td></tr>
    <tr><td><code>defaultdict(list / int)</code></td><td>grouping, counting without checks</td><td>merely <em>reading</em> a missing key creates it</td></tr>
  </table>

  <h2 id="dsa-hs-twosum"><span class="num">07</span>Two Sum: Complement Lookup</h2>
  <p>The Arrays note found Biteful's ₹280 combo (two charges that add up to exactly 280) in two ways: by checking all 28 pairs, which is O(n²), or by sorting and walking two pointers, which reported sorted positions rather than the real order numbers. This is LeetCode 1, <strong>Two Sum</strong>, and the hash map solves it in one pass over the <em>unsorted</em> charges, returning their original positions.</p>
  <p>The key insight is that for each charge x, the partner it needs is fully determined: it is <code>280 − x</code>, called the <strong>complement</strong>. So instead of scanning for that partner (O(n) per charge), we ask a dict of the values seen so far, value → index, whether the complement is already there (O(1)). It is like guests arriving at a party one at a time, each wearing half of a heart-shaped badge. Each newcomer asks the host's register "has my other half arrived?"; if yes, a match is made, and if not, they write their own name in the register and wait.</p>
  <div class="fx" data-lang="py">def two_sum(charges, target):
    index_of = {}                    # value -&gt; index where we saw it
    for i, x in enumerate(charges):
        need = target - x            # the partner x is waiting for
        hit = need in index_of
        print(f"i={i} x={x:3} need={need:4}  in dict? {'YES, at ' + str(index_of[need]) if hit else 'no'}")
        if hit:
            return [index_of[need], i]
        index_of[x] = i              # store AFTER checking
    return []

print(two_sum([120, 80, 250, 40, 310, 80, 60, 200], 280))</div>
  <div class="fx" data-lang="text">i=0 x=120 need= 160  in dict? no
i=1 x= 80 need= 200  in dict? no
i=2 x=250 need=  30  in dict? no
i=3 x= 40 need= 240  in dict? no
i=4 x=310 need= -30  in dict? no
i=5 x= 80 need= 200  in dict? no
i=6 x= 60 need= 220  in dict? no
i=7 x=200 need=  80  in dict? YES, at 5
[5, 7]</div>
  <p>For the first seven charges the needed partner has not arrived yet. Note i = 1: 80 needs 200, which only arrives later, so 80 is simply recorded. At i = 5 the second 80 overwrites the first in the dict (80 → 5). At i = 7, 200 asks for 80, which the dict has at position 5, so the answer is [5, 7]. The pair is always found when its <em>second</em> member arrives. ([1, 7] would be equally valid; the dict kept only the latest 80.) The order inside the loop matters: check first, then store. If x were stored before checking, a charge could pair with itself; section 13 shows the bug. The speed difference:</p>
  <div class="fx" data-lang="py">import time, random
def two_sum_brute(nums, target):     # every pair: O(n^2)
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

def two_sum(nums, target):           # one pass with a dict: O(n)
    index_of = {}
    for i, x in enumerate(nums):
        if target - x in index_of:
            return [index_of[target - x], i]
        index_of[x] = i
    return []

random.seed(5)
for n in [1_000, 5_000]:
    data = [random.randrange(1, 10**6) * 2 for _ in range(n)]   # all even: no pair sums to 1
    t = time.perf_counter(); a = two_sum_brute(data, 1); t1 = time.perf_counter() - t
    t = time.perf_counter(); b = two_sum(data, 1); t2 = time.perf_counter() - t
    print(f"n={n:,}  brute {t1 * 1000:7.1f} ms   dict {t2 * 1000:5.2f} ms   same: {a == b}")</div>
  <div class="fx" data-lang="text">n=1,000  brute    16.9 ms   dict  0.14 ms   same: True
n=5,000  brute   466.3 ms   dict  0.72 ms   same: True</div>
  <p>With 5 times more items, the brute force became roughly 25 times slower (O(n²)) and the dict version roughly 5 times slower (O(n)); at 5,000 items the dict is several hundred times faster. Two Sum with a dict is <strong>O(n) time and O(n) space</strong>, with original indexes and no sorting. Compare it with the alternatives: brute force is O(n²) time and O(1) space; sorting with two pointers is O(n log n) time and O(1) extra space but loses the original positions. Recognise complement lookup when a problem says <em>two numbers that add up to</em>, <em>pair with difference k</em>, <em>return their indices</em> or <em>count pairs</em>, especially on unsorted input. Variants store a count instead of an index (counting pairs), or put pair sums into the dict (4Sum II).</p>

  <h2 id="dsa-hs-count"><span class="num">08</span>Counting and Anagrams</h2>
  <p>A set records only "seen or not", and Two Sum's dict records one index per value. Neither can tell us that 80 was charged <em>twice</em>, or whether "dosa" and "soda" use exactly the same letters. For that we need a <strong>frequency map</strong>: a dict from each value to the number of times it appears. Walk the data once and do <code>count[x] = count.get(x, 0) + 1</code>; <code>Counter</code> does exactly this for you.</p>
  <p>Two words are <strong>anagrams</strong> when every letter appears the same number of times in both, like "dosa" and "soda" or "lemon" and "melon". For lowercase English letters, the frequency map can be a plain list of 26 counters indexed by <code>ord(letter) − ord("a")</code>. A neat way to compare two words in one pass is to add 1 for each letter of the first word and subtract 1 for each letter of the second; they are anagrams exactly when every counter ends at zero:</p>
  <div class="fx" data-lang="py">from collections import Counter
charges = [120, 80, 250, 40, 310, 80, 60, 200]
freq = {}
for c in charges:
    freq[c] = freq.get(c, 0) + 1     # count by hand
print(freq)
print(Counter(charges) == freq, {c: n for c, n in freq.items() if n &gt; 1})

def is_anagram(a, b):                # same letters, same counts?
    if len(a) != len(b):
        return False
    count = [0] * 26                 # one counter per letter a..z
    for x, y in zip(a, b):
        count[ord(x) - ord("a")] += 1
        count[ord(y) - ord("a")] -= 1
    return all(c == 0 for c in count)

for a, b in [("dosa", "soda"), ("lemon", "melon"), ("chai", "chat"), ("aan", "nna")]:
    print(a, b, is_anagram(a, b), Counter(a) == Counter(b), "| sets equal?", set(a) == set(b))</div>
  <div class="fx" data-lang="text">{120: 1, 80: 2, 250: 1, 40: 1, 310: 1, 60: 1, 200: 1}
True {80: 2}
dosa soda True True | sets equal? True
lemon melon True True | sets equal? True
chai chat False False | sets equal? False
aan nna False False | sets equal? True</div>
  <p>The hand-made counts and <code>Counter</code> agree, and the only repeated charge is 80, twice. "dosa"/"soda" and "lemon"/"melon" are anagrams; "chai"/"chat" are not. The last line is the important one: "aan" and "nna" contain the same <em>set</em> of letters {a, n}, so comparing sets would wrongly call them anagrams. Counts, not mere presence, are what matter. Counting is O(n) time, and the space is O(number of distinct values), or O(1) for the fixed 26-letter array. Sorting both words also detects anagrams, but costs O(n log n). Recognise counting when a problem says <em>anagram</em>, <em>same characters</em>, <em>most frequent</em>, <em>appears more than n/2 times</em>, <em>first unique</em>, <em>can you build X from the letters of Y</em> or <em>top k</em>.</p>

  <h2 id="dsa-hs-prefix"><span class="num">09</span>Prefix Sum + Hash Map</h2>
  <p>The Arrays note left one question open. How many stretches of consecutive orders have a profit of exactly ₹90, when profits can be negative? Prefix sums give any stretch's total in O(1), but trying all 36 stretches is still O(n²), and the sliding window fails because negative values make the total jump up and down. Counting, applied to prefix totals, solves it in one pass.</p>
  <p>Here is the insight. Keep a running <code>prefix</code> total as you walk. A stretch that ends at the current position and totals k must start right after some earlier point where the running total was exactly <code>prefix − k</code>, because the stretch's total is the difference between the two running totals. So at each position the question becomes: <strong>how many earlier running totals equal prefix − k?</strong> Each one marks the start of a stretch that totals k, and a dict of running total → how many times seen answers in O(1). The dict starts as <code>{0: 1}</code>, standing for the empty prefix before any order, so that stretches beginning at position 0 are counted too.</p>
  <div class="fx" data-lang="py">def count_stretches(nums, k):
    seen = {0: 1}                    # prefix total -&gt; times seen; the empty prefix counts once
    prefix = total = 0
    for i, x in enumerate(nums):
        prefix += x
        found = seen.get(prefix - k, 0)          # earlier prefixes that leave exactly k
        total += found
        seen[prefix] = seen.get(prefix, 0) + 1
        print(f"i={i} x={x:4} prefix={prefix:4} look for {prefix - k:4}: found {found}  total={total}")
    return total

profit = [0, -40, 130, -80, 190, -40, -60, 80]   # charge - 120, from the Arrays note
print(count_stretches(profit, 90))
print([(i, j) for i in range(8) for j in range(i, 8) if sum(profit[i:j + 1]) == 90])   # brute-force check</div>
  <div class="fx" data-lang="text">i=0 x=   0 prefix=   0 look for  -90: found 0  total=0
i=1 x= -40 prefix= -40 look for -130: found 0  total=0
i=2 x= 130 prefix=  90 look for    0: found 2  total=2
i=3 x= -80 prefix=  10 look for  -80: found 0  total=2
i=4 x= 190 prefix= 200 look for  110: found 0  total=2
i=5 x= -40 prefix= 160 look for   70: found 0  total=2
i=6 x= -60 prefix= 100 look for   10: found 1  total=3
i=7 x=  80 prefix= 180 look for   90: found 1  total=4
4
[(0, 2), (1, 2), (3, 7), (4, 6)]</div>
  <table class="tbl">
    <tr><th>i</th><th>profit</th><th>prefix</th><th>look for prefix − 90</th><th>found</th><th>stretches found</th></tr>
    <tr><td>0</td><td>0</td><td>0</td><td>−90</td><td>0</td><td>(prefix 0 is now seen twice)</td></tr>
    <tr><td>2</td><td>130</td><td>90</td><td>0</td><td>2</td><td>[0, −40, 130] and [−40, 130]</td></tr>
    <tr><td>6</td><td>−60</td><td>100</td><td>10</td><td>1</td><td>[190, −40, −60]</td></tr>
    <tr><td>7</td><td>80</td><td>180</td><td>90</td><td>1</td><td>[−80, 190, −40, −60, 80]</td></tr>
  </table>
  <p>The table picks out the rows of the trace where something was found. At i = 2 the running total is 90, so we look for 0, and the dict has seen 0 <em>twice</em>: once as the empty prefix and once after the first order, whose profit was 0. Those two starting points give two stretches, [0, −40, 130] and [−40, 130], which is exactly why the dict stores counts rather than just "seen". At i = 6 we look for 10, seen once after order 3, giving [190, −40, −60]; at i = 7 we look for 90, seen once after order 2, giving [−80, 190, −40, −60, 80]. Four stretches, and the brute-force list of (start, end) pairs confirms all four. This is <strong>O(n) time and O(n) space</strong>, and it works with negative numbers, which the sliding window cannot handle.</p>
  <p>The same skeleton solves a family of problems by changing what is stored. Store the <em>first index</em> of each running total instead of a count, and you get the <em>longest</em> stretch with sum k. Replace each 0 by −1 in a list of 0s and 1s and look for sum 0, and you get the longest stretch with equal numbers of each. Store <code>prefix % k</code> as the key and you count stretches whose sum is divisible by k. Recognise the pattern when a problem says <em>number of subarrays with sum k</em>, <em>longest subarray with sum k</em>, <em>sum divisible by k</em> or <em>equal number of 0s and 1s</em>, especially with negatives allowed.</p>

  <h2 id="dsa-hs-group"><span class="num">10</span>Grouping by Key</h2>
  <p>So far the key was the value itself: a charge, or a prefix total. Some questions ask for items that are <em>different</em> but belong together. Biteful's menu search wants dishes whose names are anagrams listed together ("lemon" and "melon"), and finance wants the charges bucketed by price band. Using the items themselves as keys would put each in its own bucket. What we need is a key that makes members of the same group collide on purpose.</p>
  <p>That key is a <strong>canonical form</strong>: something computed from an item that is identical for every member of its group and different between groups. For anagrams, sorting the letters works, because "lemon" and "melon" both become "elmno". For price bands, the hundreds digit works, because 250 and 200 both belong to "200-299". Then a <code>defaultdict(list)</code> keyed by the canonical form collects each group:</p>
  <div class="fx" data-lang="py">from collections import defaultdict
dishes = ["lemon", "dosa", "melon", "tea", "soda", "naan", "eat"]
groups = defaultdict(list)
for d in dishes:
    groups["".join(sorted(d))].append(d)         # canonical form: letters in order
print(dict(groups))

charges = [120, 80, 250, 40, 310, 80, 60, 200]
by_band = defaultdict(list)
for c in charges:
    low = c // 100 * 100
    by_band[f"{low}-{low + 99}"].append(c)       # canonical form: the price band
print(dict(by_band))</div>
  <div class="fx" data-lang="text">{'elmno': ['lemon', 'melon'], 'ados': ['dosa', 'soda'], 'aet': ['tea', 'eat'], 'aann': ['naan']}
{'100-199': [120], '0-99': [80, 40, 80, 60], '200-299': [250, 200], '300-399': [310]}</div>
  <p>The dishes fall into four groups: lemon and melon under "elmno", dosa and soda under "ados", tea and eat under "aet", and naan alone. The charges fall into four bands, with all of 80, 40, 80 and 60 in "0-99". This is LeetCode 49, Group Anagrams, in miniature. The cost is n items times the cost of building one key: sorting a word of length k is O(k log k), so O(n·k log k) overall. A faster key is the tuple of 26 letter counts, O(k) per word; it must be a <em>tuple</em>, because a list cannot be a key. Recognise grouping when a problem says <em>group</em>, <em>bucket</em>, <em>classify by</em>, <em>all strings that are anagrams or shifts of each other</em> or <em>same pattern</em>.</p>

  <h2 id="dsa-hs-patterns"><span class="num">11</span>Choosing the Pattern</h2>
  <p>Almost every hashing trick is the same move: <strong>instead of searching again, remember what you have seen</strong>. You pay O(n) memory to remove an O(n) inner loop. What decides the pattern is what you remember, and what you will search for later: the value itself (seen set), the partner's value (Two Sum), a count (frequency), a running total (prefix + map), or a canonical form (grouping). When you meet a new problem, ask "what would I otherwise have to search for again?" and store exactly that, keyed by what you will search with. The wording of the problem usually points the way:</p>
  <table class="tbl">
    <tr><th>Words in the problem</th><th>Store</th><th>Pattern</th><th>Cost</th></tr>
    <tr><td>"duplicate", "seen before", "within k positions"</td><td>set of values (or value → last index)</td><td>seen set</td><td>O(n) time, O(n) space</td></tr>
    <tr><td>"two numbers that add up to", "pair with difference k"</td><td>dict value → index or count</td><td>complement lookup</td><td>O(n), O(n)</td></tr>
    <tr><td>"anagram", "most frequent", "top k"</td><td>Counter or 26 counters</td><td>counting</td><td>O(n), O(distinct)</td></tr>
    <tr><td>"subarray sum equals k", "divisible by k" (negatives)</td><td>dict running total → count / first index</td><td>prefix sum + map</td><td>O(n), O(n)</td></tr>
    <tr><td>"group", "bucket", "same pattern"</td><td>defaultdict(list) on a canonical key</td><td>grouping</td><td>O(n·key cost)</td></tr>
    <tr><td>"isomorphic", "word pattern"</td><td>two dicts, a → b and b → a</td><td>two-way mapping</td><td>O(n)</td></tr>
    <tr><td>values in 1..n, "O(1) extra space"</td><td>the array itself, index = key, sign = mark</td><td>index as key</td><td>O(n), O(1)</td></tr>
  </table>
  <p>The last two rows are worth seeing in code. In a <strong>two-way mapping</strong>, "egg" matches the pattern of "add" because e ↔ a and g ↔ d hold in both directions; "ab" does not match "aa", because a and b would both have to map to a, so one dict is not enough and a second one checks the reverse direction. With <strong>index as key</strong>, when the values are known to lie between 1 and n, the array can serve as its own hash table: to record "value v was seen", make position v − 1 negative; afterwards, positions that are still positive belong to the missing values.</p>
  <div class="fx" data-lang="py">def same_pattern(a, b):              # two-way mapping: letters must match one-to-one
    if len(a) != len(b):
        return False
    fwd, back = {}, {}
    for x, y in zip(a, b):
        if fwd.setdefault(x, y) != y or back.setdefault(y, x) != x:
            return False
    return True

def missing_numbers(nums):           # values 1..n: the array is its own hash table
    for x in nums:
        i = abs(x) - 1
        nums[i] = -abs(nums[i])      # mark "value i+1 was seen" by making slot i negative
    return [i + 1 for i, x in enumerate(nums) if x &gt; 0]

print(same_pattern("egg", "add"), same_pattern("foo", "bar"), same_pattern("ab", "aa"))
print(missing_numbers([4, 3, 2, 7, 8, 2, 3, 1]))</div>
  <div class="fx" data-lang="text">True False False
[5, 6]</div>
  <p>"egg"/"add" match while "foo"/"bar" and "ab"/"aa" do not. In [4, 3, 2, 7, 8, 2, 3, 1], positions 4 and 5 were never marked, so 5 and 6 are missing, found with O(1) extra space. Finally, know when <em>not</em> to use a hash map. It answers exact-match questions only. "The next bigger key", "all keys between 10 and 20" or "the smallest so far" need order, which means sorting, a heap or a balanced tree. And when O(1) extra space is required and the data can be sorted, two pointers may be the better answer.</p>

  <h2 id="dsa-hs-problems"><span class="num">12</span>Classic Problems</h2>
  <p>The patterns above cover the standard hashing problems in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>. A good order to practise them, with what each one teaches: start with <b>217 Contains Duplicate</b>, the seen set exactly as in section 01; then <b>242 Valid Anagram</b>, counting with 26 counters (and why sets are not enough); then <b>1 Two Sum</b>, complement lookup with "check before store". Next <b>49 Group Anagrams</b> practises canonical keys and the tuple-of-counts trick, and <b>560 Subarray Sum Equals K</b> is the prefix-sum pattern of section 09, including the <code>{0: 1}</code> start. <b>219 Contains Duplicate II</b> stores the last index instead of a bare presence, <b>205 Isomorphic Strings</b> needs the two-way mapping, and <b>706 Design HashMap</b> is section 04. Two more classics need one extra idea on top of a dict, so they are worth seeing here.</p>
  <p><strong>347 Top K Frequent Elements</strong> asks for the k most frequent values. Counting is O(n); the question is how to pick the top k counts. Sorting the counts costs O(n log n) and a heap of size k costs O(n log k) (the <a class="xref" data-note="dsa_heaps">Heaps</a> note). But a count can never exceed n, so you can place each value into a list of <strong>buckets</strong> indexed by its count and read the buckets from the highest count down, which is O(n). <strong>128 Longest Consecutive Sequence</strong> asks for the longest run of consecutive integers, such as 1, 2, 3, 4, in O(n), which rules out sorting. Put everything in a set, and only start counting from a number x that has no x − 1 in the set, because only such a number begins a run; then walk x + 1, x + 2 and so on while they exist. Picture students with roll numbers standing in random order: only those whose "roll number minus one" is absent call out "I'm a start" and count upwards, so nobody in the middle of a block ever starts a count.</p>
  <div class="fx" data-lang="py">from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)                          # value -&gt; frequency
    buckets = [[] for _ in range(len(nums) + 1)]   # index = frequency
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(nums), 0, -1):              # highest frequency first
        for x in buckets[c]:
            out.append(x)
            if len(out) == k:
                return out
    return out

def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:           # x starts a run
            y = x
            while y + 1 in s:        # walk the run forward
                y += 1
            best = max(best, y - x + 1)
    return best

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2), Counter([1, 1, 1, 2, 2, 3]).most_common(2))
print(longest_consecutive([100, 4, 200, 1, 3, 2]), longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]))</div>
  <div class="fx" data-lang="text">[1, 2] [(1, 3), (2, 2)]
4 9</div>
  <p>Top K returns [1, 2], matching <code>Counter.most_common(2)</code>. The longest runs are 4 (1 to 4) and 9 (0 to 8). Longest Consecutive has a <code>while</code> inside a <code>for</code>, yet it is O(n): the inner walk starts only at run beginnings, and each number is stepped over by exactly one walk, so the inner loop does at most n steps in total. Loop over the set, not the original list, so that duplicates do not restart the same run.</p>

  <h2 id="dsa-hs-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common Two Sum bug is storing the current value <em>before</em> checking for its complement. Then a value can pair with itself:</p>
  <div class="fx" data-lang="py">def two_sum_wrong(nums, target):
    index_of = {}
    for i, x in enumerate(nums):
        index_of[x] = i                      # stored BEFORE checking
        if target - x in index_of:
            return [index_of[target - x], i]
    return []

print(two_sum_wrong([120, 80, 250], 160))    # 80 pairs with itself</div>
  <div class="fx" data-lang="text">[1, 1]</div>
  <p>With target 160, the 80 at index 1 is stored, then the code asks whether 160 − 80 = 80 is in the dict, finds itself, and returns [1, 1], an answer that uses one order twice. Check first, store after. A second trap is specific to <code>defaultdict</code>: merely reading a missing key creates it.</p>
  <div class="fx" data-lang="py">from collections import defaultdict
orders = defaultdict(int)
orders["chai"] += 2
if orders["vada"] &gt; 0:               # just reading a missing key creates it
    print("vada ordered")
print(dict(orders))
print("dosa" in orders, orders.get("idli", 0), dict(orders))   # these look without creating</div>
  <div class="fx" data-lang="text">{'chai': 2, 'vada': 0}
False 0 {'chai': 2, 'vada': 0}</div>
  <p>The <code>if</code> only <em>looked</em> at "vada", but the dict now contains <code>'vada': 0</code>. In a loop this can silently fill a dict with junk keys, or change its size while you are iterating over it. Use <code>k in d</code> or <code>d.get(k, 0)</code> to look without creating. Changing a dict's size during a loop over it is itself an error:</p>
  <div class="fx" data-lang="py">stock = {"chai": 5, "dosa": 0, "idli": 0}
try:
    for dish in stock:
        if stock[dish] == 0:
            del stock[dish]          # changes the dict's size mid-loop
except RuntimeError as e:
    print("RuntimeError:", e)
stock = {"chai": 5, "dosa": 0, "idli": 0}
for dish in list(stock):             # loop over a copy of the keys
    if stock[dish] == 0:
        del stock[dish]
print(stock)</div>
  <div class="fx" data-lang="text">RuntimeError: dictionary changed size during iteration
{'chai': 5}</div>
  <p>Deleting while iterating raises <code>RuntimeError: dictionary changed size during iteration</code>; looping over <code>list(stock)</code>, a copy of the keys, makes it safe. Other mistakes to scan for: <code>if x in my_list</code> inside a loop, which is O(n) per check (convert to a set once); using a list or set as a key (convert to a tuple or frozenset); forgetting <code>{0: 1}</code> in prefix-sum counting, which misses every stretch starting at index 0 (one of the four in section 09); comparing sets instead of counts for anagrams; relying on set order or on <code>hash()</code> values across runs; deleting from an open-addressing table by emptying the slot instead of leaving a tombstone; and claiming "guaranteed O(1)" when the truth is O(1) on average and O(n) in the worst case, with O(n) space as the price.</p>

  <h2 id="dsa-hs-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Hash table</b>: an array of slots plus a hash function; slot = hash(key) % size. <code>dict</code> stores key → value, <code>set</code> keys only.</li>
    <li><b>Hash function</b>: key → integer, deterministic, well spread.</li>
    <li><b>Collision</b>: two keys in one slot. <b>Chaining</b>: a list per slot. <b>Open addressing</b>: probe other slots (CPython).</li>
    <li><b>Load factor</b>: keys ÷ slots; CPython grows at about 2/3, rehashing every key.</li>
    <li><b>Tombstone</b>: "deleted, keep probing" marker in open addressing.</li>
    <li><b>Hashable</b>: hash never changes; a == b ⇒ hash(a) == hash(b).</li>
    <li><b>Canonical form</b>: a key that is the same for every member of a group.</li>
  </ul>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Average</th><th>Worst</th></tr>
    <tr><td>lookup, <code>in</code>, delete</td><td>O(1)</td><td>O(n)</td></tr>
    <tr><td>insert</td><td>O(1) amortised</td><td>O(n)</td></tr>
    <tr><td>iterate, build from n items</td><td>O(n)</td><td>O(n)</td></tr>
    <tr><td>space</td><td>O(n)</td><td>O(n)</td></tr>
  </table>
  <h3>Patterns</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Store</th><th>On Biteful's data</th></tr>
    <tr><td>Seen set</td><td>values seen</td><td>repeat 80 found at i = 5</td></tr>
    <tr><td>Two Sum</td><td>value → index; check T − x, then store</td><td>280 → [5, 7]</td></tr>
    <tr><td>Counting</td><td>value → count</td><td>80 × 2; dosa/soda anagrams</td></tr>
    <tr><td>Prefix + map</td><td>running total → count, start {0: 1}</td><td>4 profit stretches of ₹90</td></tr>
    <tr><td>Grouping</td><td>canonical key → list</td><td>"elmno": lemon, melon</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from collections import Counter, defaultdict

seen = set()                       # seen set
if x in seen: ...
seen.add(x)

index_of = {}                      # Two Sum: check, then store
if target - x in index_of: return [index_of[target - x], i]
index_of[x] = i

count = Counter(items)             # counting; count[missing] == 0
count.most_common(k)

seen_sums = {0: 1}                 # prefix sum + map
prefix += x
answer += seen_sums.get(prefix - k, 0)
seen_sums[prefix] = seen_sums.get(prefix, 0) + 1

groups = defaultdict(list)         # grouping
groups["".join(sorted(word))].append(word)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Say "O(1) average, O(n) worst case", and mention O(n) space.</li>
    <li>Lists, sets and dicts can't be keys; use tuple / frozenset. 1, 1.0 and True are one key.</li>
    <li>Two Sum: check before storing, or x pairs with itself.</li>
    <li>Prefix counting needs <code>{0: 1}</code>; store counts, not presence.</li>
    <li>Reading a missing key of a defaultdict creates it.</li>
    <li>Don't change a dict's size while looping over it; set order is arbitrary.</li>
    <li>Hash maps can't answer ordered questions (next bigger, ranges, min).</li>
  </ul>

  <h2 id="dsa-hs-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does a hash map find a key in O(1) on average?</summary><div class="qa-body">It computes <code>hash(key)</code>, reduces it to a slot index (modulo the table size, or a bitmask when the size is a power of two) and jumps to that slot directly. With a good hash and a table that is kept less than about two-thirds full, only one or two slots are checked, however many keys are stored.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a good hash function?</summary><div class="qa-body">It must be deterministic (same key, same hash), fast to compute, and spread keys evenly over the possible values so few of them collide. Equal keys must hash equally. For strings it should depend on every character, which is why a running "multiply by 31 and add the character" style is common.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a collision, and what are the two main ways to handle one?</summary><div class="qa-body">Two different keys mapping to the same slot. Separate chaining keeps a small list of entries in each slot. Open addressing keeps one entry per slot and, on a clash, probes other slots in a fixed sequence until it finds the key or an empty slot. Java's HashMap chains; CPython's dict uses open addressing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the load factor and why does a hash table resize?</summary><div class="qa-body">The number of keys divided by the number of slots. As it rises, collisions and probe chains get longer and operations drift towards O(n). CPython grows a dict at about two-thirds full: it allocates a bigger table and re-inserts every key. Each resize is O(n), but they are rare because the size multiplies, so insertion is O(1) amortised.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does a hash map lookup become O(n)?</summary><div class="qa-body">When many keys land in the same slot or probe chain: a poor hash function (for example a class whose <code>__hash__</code> returns a constant), or keys deliberately crafted to collide. That is why Python randomises string hashes per process. In interviews say "O(1) average, O(n) worst case".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you simply empty a slot when deleting from an open-addressing table?</summary><div class="qa-body">Lookups stop at the first empty slot. A key that was pushed past the deleted one during insertion would become unreachable. A tombstone marks the slot as "deleted, keep probing": searches walk past it, inserts may reuse it, and a resize removes it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes an object hashable? Why can't a list be a dict key?</summary><div class="qa-body">It has a hash that never changes during its lifetime and an equality consistent with it (a == b implies equal hashes). A list is mutable: if it changed after being stored, its hash would change and the table would look in the wrong slot. Convert it with <code>tuple(lst)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If you override <code>__eq__</code> in a class, what must you also do to use it in a set?</summary><div class="qa-body">Define <code>__hash__</code> using the same fields as <code>__eq__</code>, so that equal objects have equal hashes. Python sets <code>__hash__</code> to None when you define only <code>__eq__</code>, making the class unhashable. A frozen dataclass generates both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>{1: "a", 1.0: "b", True: "c"}</code> evaluate to?</summary><div class="qa-body"><code>{1: 'c'}</code>. The three keys are equal and hash the same, so they are one key. The dict keeps the first key object and overwrites the value each time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hash map vs balanced binary search tree: when would you choose each?</summary><div class="qa-body">A hash map gives O(1) average exact-match lookup, insert and delete, but keeps no order. A balanced tree gives O(log n) for the same operations, guaranteed, and supports ordered queries: minimum, maximum, next bigger key, ranges, sorted iteration. Choose the tree when you need order or a worst-case guarantee.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the hash-map solution to Two Sum and its complexity.</summary><div class="qa-body">Walk once. For each x compute the complement <code>target − x</code>; if it is in the dict of earlier values, return both indexes; otherwise store x → its index. Checking before storing stops x pairing with itself. O(n) time and O(n) space, on unsorted input, with original indexes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you check whether two strings are anagrams, and at what cost?</summary><div class="qa-body">Compare letter counts: <code>Counter(s) == Counter(t)</code>, or 26 counters incremented for one string and decremented for the other, all zero at the end. O(n) time, O(1) space for a fixed alphabet. Sorting both strings also works in O(n log n). Comparing sets is wrong, because it ignores how many times each letter appears.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Subarray Sum Equals K work, and why does it handle negatives when a sliding window can't?</summary><div class="qa-body">Keep a running total and a dict counting how often each running total has appeared, starting with {0: 1}. A subarray ending here sums to k exactly when an earlier running total equals the current total minus k, so add that count to the answer. It never shrinks a window, so it doesn't rely on totals moving in one direction, which negatives break. O(n) time, O(n) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two ways to build the key in Group Anagrams, and their costs?</summary><div class="qa-body">Sorted letters, <code>"".join(sorted(w))</code>, costing O(k log k) per word; or a tuple of 26 letter counts, O(k) per word. Totals are O(n·k log k) and O(n·k). The count must be a tuple because a list can't be a key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top K Frequent Elements: compare the approaches.</summary><div class="qa-body">Count with a Counter in O(n), then: sort by count, O(n log n); keep a heap of size k, O(n log k); or bucket values by count (a count is at most n), O(n). <code>Counter.most_common(k)</code> is the library version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Longest Consecutive Sequence has a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body">The inner walk only starts at numbers with no predecessor in the set, the beginnings of runs. Every number belongs to exactly one run and is stepped over once by that run's walk, so the inner loop does at most n steps in total, plus n outer checks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a Python dict remember insertion order but a set doesn't?</summary><div class="qa-body">Since CPython 3.6 a dict stores its entries in a dense array in insertion order, with a separate small table of slots pointing into it; this "compact dict" saves memory, and the order became a language guarantee in 3.7. Sets still use a plain hash table, so their iteration order depends on hashes and table size and should never be relied on.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time–space trade-off in hashing solutions?</summary><div class="qa-body">A hash map spends O(n) extra memory to replace a repeated O(n) search with an O(1) lookup, turning many O(n²) solutions into O(n). If memory is limited, the alternative is often sorting plus two pointers: O(n log n) time with O(1) extra space, at the cost of losing the original order.</div></details>
</main>
`
});
