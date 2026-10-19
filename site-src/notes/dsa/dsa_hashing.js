// notes/dsa/dsa_hashing.js — Hashing
Object.assign(TOPIC_CONTENT, {
  "dsa_hashing": `<main>
  <h1>Hashing</h1>
  <p class="lead">A hash map finds a value by its key in one step on average, no matter how much data it holds. Python's <code>dict</code> and <code>set</code> are hash tables, and "use a dict" is the answer to a huge share of interview questions. This note shows how they work inside, what can be a key, and the patterns that turn O(n²) into O(n). Builds on arrays (see the Arrays note).</p>

  <h2 id="dsa-hs-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hashing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea &amp; need</div>
        <ul>
          <li><b>Need</b> — "find by name" in a list is an O(n) scan</li>
          <li><b>Idea</b> — turn the key into a number, use it as an array index</li>
          <li><b>Cost</b> — insert / lookup / delete O(1) average, O(n) worst case</li>
          <li>💡 Library: the book's code tells you the exact shelf; no walking every aisle</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How it works</div>
        <ul>
          <li><b>Hash function</b> — key → big integer; same key → same number, always</li>
          <li><b>Slot</b> — <code>hash(key) % size</code> (CPython: <code>&amp; (size-1)</code>, size is a power of 2)</li>
          <li><b>Collision</b> — two keys, one slot. Unavoidable</li>
          <li><b>Chaining</b> — slot holds a small list · <b>Open addressing</b> — try another slot (CPython)</li>
          <li><b>Delete</b> in open addressing leaves a tombstone, not an empty slot</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Load factor &amp; resize</div>
        <ul>
          <li><b>Load factor</b> — items ÷ slots</li>
          <li>Too full → long probe chains → slow</li>
          <li>CPython dict grows when about <b>2/3</b> full</li>
          <li><b>Resize</b> — new bigger table, re-insert every key: O(n), but rare → O(1) amortised</li>
          <li>Since Python 3.7, dict keeps <b>insertion order</b> (compact dict)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hashability</div>
        <ul>
          <li><b>Key must be hashable</b> — hash never changes while it's in the table</li>
          <li>OK: int, float, str, bytes, tuple (of hashables), frozenset, None</li>
          <li>Not OK: list, dict, set → <code>TypeError: unhashable type</code></li>
          <li><b>Rule</b> — <code>a == b</code> ⇒ <code>hash(a) == hash(b)</code></li>
          <li>⚠ <code>1</code>, <code>1.0</code>, <code>True</code> are the same key</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Python toolbox</div>
        <ul>
          <li><code>dict</code> — <code>d.get(k, 0)</code>, <code>k in d</code>, <code>d.items()</code>, <code>setdefault</code></li>
          <li><code>set</code> — membership, de-dupe, <code>&amp; | -</code></li>
          <li><code>Counter</code> — counts, <code>most_common(k)</code>, missing → 0</li>
          <li><code>defaultdict(list / int)</code> — no "if key not in" boilerplate</li>
          <li>⚠ <code>x in list</code> O(n) vs <code>x in set</code> O(1)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Seen set</b> — "duplicate?", "first repeat"</li>
          <li><b>Complement lookup</b> — need <code>target − x</code>? check the dict (Two Sum)</li>
          <li><b>Frequency count</b> — anagrams, top k, majority</li>
          <li><b>Group by key</b> — canonical form → list (Group Anagrams)</li>
          <li><b>Prefix sum + count</b> — subarrays summing to k, even with negatives</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Contains Duplicate</b> — seen set</li>
          <li><b>Valid Anagram</b> — count array of 26 / Counter</li>
          <li><b>Two Sum</b> — value → index dict</li>
          <li><b>Group Anagrams</b> — sorted word (or count tuple) as key</li>
          <li><b>Top K Frequent</b> — Counter + bucket sort (or heap)</li>
          <li><b>Subarray Sum Equals K</b>, <b>Longest Consecutive</b> — set, only start runs</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-hs-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Find It Without Searching</span><span class="rm-sub">Why a list lookup is too slow</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-how"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hash Function &amp; Slots</span><span class="rm-sub">Key → number → index</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-collide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Collisions</span><span class="rm-sub">Chaining vs open addressing</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-load"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Load Factor &amp; Resizing</span><span class="rm-sub">Why dict grows at 2/3 full</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-impl"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Build One From Scratch</span><span class="rm-sub">Open addressing, tombstones, Big-O</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-hashable"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">What Can Be a Key</span><span class="rm-sub">Hashability, __hash__ and __eq__</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-python"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">dict, set, Counter, defaultdict</span><span class="rm-sub">The Python toolbox</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-patterns"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Seen set, complement, count, group, prefix</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-problems"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">7 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Mutable keys, list lookups, self-pairing</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-hs-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-hs-need"><span class="num">01</span>Find It Without Searching</h2>
  <p>A college library has 50,000 books. You want "Wings of Fire". If the books were just piled on shelves in arrival order, you would walk every aisle reading spines: that is a list and <code>x in my_list</code>, O(n). Instead, the catalogue gives the book a code, and the code says exactly which shelf. You walk straight there.</p>
  <p>Arrays already give "go straight to position i" in O(1) (Arrays note). But we don't search by position; we search by <strong>name</strong>: a roll number, a word, a phone number. A <strong>hash table</strong> bridges the gap: it turns the name into a position.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A railway parcel office with 100 pigeonholes. Rule: put each parcel in the hole numbered by the last two digits of the receiver's phone number. To collect, you say your number, the clerk looks in one hole. The "last two digits" rule is the hash function; the pigeonholes are the array.</p>
  </div>
  <table class="tbl">
    <tr><th>Store items in</th><th>Insert</th><th>"Is x here?" / get by key</th><th>Keeps order?</th></tr>
    <tr><td>Unsorted list</td><td>O(1) append</td><td>O(n) scan</td><td>Insertion order</td></tr>
    <tr><td>Sorted list + binary search</td><td>O(n) shift</td><td>O(log n)</td><td>Sorted order</td></tr>
    <tr><td><strong>Hash table (dict / set)</strong></td><td><strong>O(1) avg</strong></td><td><strong>O(1) avg</strong></td><td>Insertion order (dict, Python 3.7+); no sorted order</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hash map</strong> (dict): stores key → value pairs, finds a value by its key. <strong>Hash set</strong> (set): stores keys only, answers "is it here?". Both are built on a <strong>hash table</strong>: an array of slots plus a hash function that picks the slot.</p>
  </div>

  <h2 id="dsa-hs-how"><span class="num">02</span>Hash Function &amp; Slots</h2>
  <p>A <strong>hash function</strong> turns any key into an integer. It must be <strong>deterministic</strong> (same key, same number, every time) and should <strong>spread</strong> different keys over many different numbers. Then <code>slot = hash(key) % number_of_slots</code> squeezes that big number into a valid array index.</p>
  <p>Here is a toy hash for strings, the same shape Java uses for its <code>String.hashCode</code>: multiply by 31 and add each character.</p>
  <div class="fx" data-lang="py">def toy_hash(key):
    h = 0
    for ch in key:
        h = h * 31 + ord(ch)            # mix every character in
    return h

for name in ["chai", "dosa", "idli", "vada"]:
    h = toy_hash(name)
    print(f"{name}: hash={h}  slot={h % 8}")
print(hash(42), hash(-1), hash((1, 2)) == hash((1, 2)), hash("chai") == hash("chai"))</div>
  <div class="fx" data-lang="text">chai: hash=3052365  slot=5
dosa: hash=3089433  slot=1
idli: hash=3227608  slot=0
vada: hash=3611752  slot=0
42 -2 True True</div>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600"><defs><marker id="hs-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><rect x="470" y="16" width="110" height="25" class="fr sr"/><text x="462" y="33" text-anchor="end" class="tm">0</text><text x="525" y="33" text-anchor="middle" class="tr">idli + vada?</text><rect x="470" y="41" width="110" height="25" class="fb sb"/><text x="462" y="58" text-anchor="end" class="tm">1</text><text x="525" y="58" text-anchor="middle">dosa</text><rect x="470" y="66" width="110" height="25" class="fs"/><text x="462" y="83" text-anchor="end" class="tm">2</text><rect x="470" y="91" width="110" height="25" class="fs"/><text x="462" y="108" text-anchor="end" class="tm">3</text><rect x="470" y="116" width="110" height="25" class="fs"/><text x="462" y="133" text-anchor="end" class="tm">4</text><rect x="470" y="141" width="110" height="25" class="fb sb"/><text x="462" y="158" text-anchor="end" class="tm">5</text><text x="525" y="158" text-anchor="middle">chai</text><rect x="470" y="166" width="110" height="25" class="fs"/><text x="462" y="183" text-anchor="end" class="tm">6</text><rect x="470" y="191" width="110" height="25" class="fs"/><text x="462" y="208" text-anchor="end" class="tm">7</text><rect x="10" y="15" width="56" height="26" class="ft st"/><text x="38" y="33" text-anchor="middle">chai</text><text x="76" y="33" text-anchor="start">→ hash = 3052365</text><text x="76" y="51" text-anchor="start" class="tm">  3052365 % 8 = 5</text><line x1="260" y1="30" x2="466" y2="153.5" class="sb" stroke-width="1.2" marker-end="url(#hs-a1)"/><rect x="10" y="65" width="56" height="26" class="ft st"/><text x="38" y="83" text-anchor="middle">dosa</text><text x="76" y="83" text-anchor="start">→ hash = 3089433</text><text x="76" y="101" text-anchor="start" class="tm">  3089433 % 8 = 1</text><line x1="260" y1="80" x2="466" y2="53.5" class="sb" stroke-width="1.2" marker-end="url(#hs-a1)"/><rect x="10" y="115" width="56" height="26" class="ft st"/><text x="38" y="133" text-anchor="middle">idli</text><text x="76" y="133" text-anchor="start">→ hash = 3227608</text><text x="76" y="151" text-anchor="start" class="tm">  3227608 % 8 = 0</text><line x1="260" y1="130" x2="466" y2="28.5" class="sb" stroke-width="1.2" marker-end="url(#hs-a1)"/><rect x="10" y="165" width="56" height="26" class="ft st"/><text x="38" y="183" text-anchor="middle">vada</text><text x="76" y="183" text-anchor="start">→ hash = 3611752</text><text x="76" y="201" text-anchor="start" class="tm">  3611752 % 8 = 0</text><line x1="260" y1="180" x2="466" y2="28.5" class="sb" stroke-width="1.2" marker-end="url(#hs-a1)"/><text x="525" y="232" text-anchor="middle" class="tm">table of 8 slots</text></svg><figcaption>Each key is hashed to a big number, then reduced to a slot with % 8. "idli" and "vada" both land in slot 0: a collision.</figcaption></figure>
  <p>The last line uses Python's own <code>hash()</code>: small ints hash to themselves (<code>hash(42) == 42</code>), <code>hash(-1)</code> is −2 (−1 is reserved as an error signal inside CPython), and equal tuples give equal hashes.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Computing the hash and the slot takes the same time whether the table holds 10 keys or 10 million. That is where O(1) comes from. Note: hashing a string of length k costs O(k), but Python caches a string's hash after the first time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>String hashes in Python are <strong>randomised per process</strong> (a security measure against attackers forcing collisions). <code>hash("chai")</code> differs between runs. Never save hash values to a file or depend on set order of strings across runs.</p>
  </div>

  <h2 id="dsa-hs-collide"><span class="num">03</span>Collisions</h2>
  <p>There are endless possible keys and only a few slots, so two keys <em>will</em> share a slot sometimes (the pigeonhole principle). A hash table is defined as much by how it handles collisions as by its hash function. Two main ways:</p>
  <figure class="viz"><svg viewBox="0 0 600 215" width="600"><defs><marker id="hs-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs><text x="140" y="20" text-anchor="middle" class="tb">Chaining: each slot holds a list</text><rect x="20" y="40" width="50" height="28" class="fs"/><text x="12" y="59" text-anchor="end" class="tm">0</text><rect x="20" y="76" width="50" height="28" class="fs"/><text x="12" y="95" text-anchor="end" class="tm">1</text><rect x="20" y="112" width="50" height="28" class="fs"/><text x="12" y="131" text-anchor="end" class="tm">2</text><rect x="20" y="148" width="50" height="28" class="fs"/><text x="12" y="167" text-anchor="end" class="tm">3</text><rect x="100" y="40" width="56" height="28" class="fb sb"/><text x="128" y="59" text-anchor="middle">idli</text><rect x="186" y="40" width="56" height="28" class="fr sr"/><text x="214" y="59" text-anchor="middle">vada</text><rect x="100" y="76" width="56" height="28" class="fb sb"/><text x="128" y="95" text-anchor="middle">dosa</text><line x1="70" y1="54" x2="96" y2="54" class="sb" marker-end="url(#hs-a2)"/><line x1="156" y1="54" x2="182" y2="54" class="sb" marker-end="url(#hs-a2)"/><line x1="70" y1="90" x2="96" y2="90" class="sb" marker-end="url(#hs-a2)"/><text x="140" y="200" text-anchor="middle" class="tm">Java HashMap, textbooks</text><line x1="300" y1="10" x2="300" y2="210" stroke="currentColor" stroke-dasharray="4 4" opacity=".35"/><text x="452" y="20" text-anchor="middle" class="tb">Open addressing: probe the next slot</text><rect x="316" y="90" width="34" height="30" class="fb sb"/><text x="333" y="110" text-anchor="middle">idli</text><text x="333" y="136" text-anchor="middle" class="tm">0</text><rect x="350" y="90" width="34" height="30" class="fb sb"/><text x="367" y="110" text-anchor="middle">dosa</text><text x="367" y="136" text-anchor="middle" class="tm">1</text><rect x="384" y="90" width="34" height="30" class="fg sg"/><text x="401" y="110" text-anchor="middle">vada</text><text x="401" y="136" text-anchor="middle" class="tm">2</text><rect x="418" y="90" width="34" height="30" class="fs"/><text x="435" y="136" text-anchor="middle" class="tm">3</text><rect x="452" y="90" width="34" height="30" class="fs"/><text x="469" y="136" text-anchor="middle" class="tm">4</text><rect x="486" y="90" width="34" height="30" class="fb sb"/><text x="503" y="110" text-anchor="middle">chai</text><text x="503" y="136" text-anchor="middle" class="tm">5</text><rect x="520" y="90" width="34" height="30" class="fs"/><text x="537" y="136" text-anchor="middle" class="tm">6</text><rect x="554" y="90" width="34" height="30" class="fs"/><text x="571" y="136" text-anchor="middle" class="tm">7</text><path d="M333,88 Q350,58 367,86" fill="none" class="sr" stroke-width="1.5" marker-end="url(#hs-a2)"/><path d="M367,88 Q384,58 401,86" fill="none" class="sr" stroke-width="1.5" marker-end="url(#hs-a2)"/><text x="358" y="52" text-anchor="middle" class="tr">taken</text><text x="398" y="52" text-anchor="middle" class="tr">taken</text><text x="452" y="165" text-anchor="middle">vada: home 0 busy → 1 busy → 2 free</text><text x="452" y="200" text-anchor="middle" class="tm">CPython dict and set</text></svg><figcaption>Left: chaining keeps a small list per slot. Right: open addressing keeps one key per slot and probes for the next free one; "vada" ends up two slots away from home.</figcaption></figure>
  <div class="cards">
    <div><b>Separate chaining</b><p>Each slot holds a list (or linked list) of all keys that hashed there. Lookup: go to the slot, scan its short list.</p><small>Java HashMap (turns long chains into trees)</small></div>
    <div><b>Open addressing</b><p>One key per slot. If busy, follow a fixed probe sequence to the next slot until you find the key or an empty slot.</p><small>CPython dict and set</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Chaining is a hotel that puts an extra bed in an already-booked room. Open addressing is a hotel that says "room 101 is taken, try 102", and a guest searching for you also walks 101, 102, … until they find you or an empty room.</p>
  </div>
  <h3>How CPython probes</h3>
  <p>Simple <strong>linear probing</strong> (try i+1, i+2, …) builds long runs of filled slots ("clustering"). CPython's dict instead jumps around using more bits of the hash: roughly <code>perturb &gt;&gt;= 5; i = (5*i + 1 + perturb) % size</code>. Keys that collided once quickly take different paths. The table size is always a power of 2, so <code>% size</code> is done as a fast bitmask <code>&amp; (size - 1)</code>.</p>
  <div class="callout trap"><span class="label">Trap: deleting in open addressing</span>
    <p>If you delete "dosa" from slot 1 by marking it empty, a later search for "vada" starts at slot 0, sees slot 1 empty, and stops: "not found", although vada sits in slot 2. Fix: mark deleted slots with a <strong>tombstone</strong> ("deleted, keep probing"). Inserts may reuse tombstones; resizes clean them out.</p>
  </div>

  <h2 id="dsa-hs-load"><span class="num">04</span>Load Factor &amp; Resizing</h2>
  <p>The <strong>load factor</strong> is items ÷ slots. At 0.25 most probes hit an empty slot at once. Near 1.0 almost every slot is busy and a probe may walk a long way, so lookups creep towards O(n). So the table grows before it gets crowded. CPython's dict resizes when it is about <strong>2/3</strong> full.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600"><text x="300" y="18" text-anchor="middle" class="tr">8 slots, 6 keys: load = 6/8 = 0.75 &gt; 2/3 → grow</text><rect x="164" y="28" width="34" height="30" class="fb sb"/><text x="181" y="48" text-anchor="middle">idli</text><text x="181" y="74" text-anchor="middle" class="tm">0</text><rect x="198" y="28" width="34" height="30" class="fb sb"/><text x="215" y="48" text-anchor="middle">dosa</text><text x="215" y="74" text-anchor="middle" class="tm">1</text><rect x="232" y="28" width="34" height="30" class="fb sb"/><text x="249" y="48" text-anchor="middle">vada</text><text x="249" y="74" text-anchor="middle" class="tm">2</text><rect x="266" y="28" width="34" height="30" class="fb sb"/><text x="283" y="48" text-anchor="middle">roti</text><text x="283" y="74" text-anchor="middle" class="tm">3</text><rect x="300" y="28" width="34" height="30" class="fb sb"/><text x="317" y="48" text-anchor="middle">naan</text><text x="317" y="74" text-anchor="middle" class="tm">4</text><rect x="334" y="28" width="34" height="30" class="fb sb"/><text x="351" y="48" text-anchor="middle">chai</text><text x="351" y="74" text-anchor="middle" class="tm">5</text><rect x="368" y="28" width="34" height="30" class="fs"/><text x="385" y="74" text-anchor="middle" class="tm">6</text><rect x="402" y="28" width="34" height="30" class="fs"/><text x="419" y="74" text-anchor="middle" class="tm">7</text><text x="300" y="104" text-anchor="middle">↓ allocate 16 slots, re-insert every key with hash % 16</text><text x="300" y="132" text-anchor="middle" class="tg">16 slots, 6 keys: load = 0.375</text><rect x="28" y="142" width="34" height="30" class="fg sg"/><text x="45" y="162" text-anchor="middle">naan</text><text x="45" y="188" text-anchor="middle" class="tm">0</text><rect x="62" y="142" width="34" height="30" class="fs"/><text x="79" y="188" text-anchor="middle" class="tm">1</text><rect x="96" y="142" width="34" height="30" class="fg sg"/><text x="113" y="162" text-anchor="middle">roti</text><text x="113" y="188" text-anchor="middle" class="tm">2</text><rect x="130" y="142" width="34" height="30" class="fs"/><text x="147" y="188" text-anchor="middle" class="tm">3</text><rect x="164" y="142" width="34" height="30" class="fs"/><text x="181" y="188" text-anchor="middle" class="tm">4</text><rect x="198" y="142" width="34" height="30" class="fs"/><text x="215" y="188" text-anchor="middle" class="tm">5</text><rect x="232" y="142" width="34" height="30" class="fs"/><text x="249" y="188" text-anchor="middle" class="tm">6</text><rect x="266" y="142" width="34" height="30" class="fs"/><text x="283" y="188" text-anchor="middle" class="tm">7</text><rect x="300" y="142" width="34" height="30" class="fg sg"/><text x="317" y="162" text-anchor="middle">idli</text><text x="317" y="188" text-anchor="middle" class="tm">8</text><rect x="334" y="142" width="34" height="30" class="fg sg"/><text x="351" y="162" text-anchor="middle">dosa</text><text x="351" y="188" text-anchor="middle" class="tm">9</text><rect x="368" y="142" width="34" height="30" class="fg sg"/><text x="385" y="162" text-anchor="middle">vada</text><text x="385" y="188" text-anchor="middle" class="tm">10</text><rect x="402" y="142" width="34" height="30" class="fs"/><text x="419" y="188" text-anchor="middle" class="tm">11</text><rect x="436" y="142" width="34" height="30" class="fs"/><text x="453" y="188" text-anchor="middle" class="tm">12</text><rect x="470" y="142" width="34" height="30" class="fg sg"/><text x="487" y="162" text-anchor="middle">chai</text><text x="487" y="188" text-anchor="middle" class="tm">13</text><rect x="504" y="142" width="34" height="30" class="fs"/><text x="521" y="188" text-anchor="middle" class="tm">14</text><rect x="538" y="142" width="34" height="30" class="fs"/><text x="555" y="188" text-anchor="middle" class="tm">15</text></svg><figcaption>With the toy hash and linear probing: at 6 keys in 8 slots the table is over 2/3 full, so it grows to 16 slots. Every key's slot is recomputed with % 16, and the crowd at the start of the table spreads out.</figcaption></figure>
  <p>Resizing re-inserts every key, which is O(n). Like a Python list's append (Arrays note), it happens rarely, because the size grows by a constant factor each time, so the cost averages out: insert is <strong>O(1) amortised</strong>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Rehashing</strong>: moving all keys into a bigger table. Positions change because the slot is <code>hash % size</code> and the size changed. This is why you can't rely on a key "staying at slot 5".</p>
  </div>
  <p>Modern CPython stores a dict in two parts: a small <strong>index table</strong> (the hash slots, holding positions) and a dense <strong>entries list</strong> of (hash, key, value) in insertion order. That "compact dict" uses less memory and is why dicts remember insertion order (guaranteed since Python 3.7). Sets don't have this, so set order is arbitrary.</p>
  <div class="callout trap"><span class="label">Trap: "O(1)" is an average</span>
    <p>If many keys collide (bad hash, or an attacker choosing keys), lookups degrade to O(n). In interviews say "O(1) average, O(n) worst case". A sorted structure (balanced tree) gives a guaranteed O(log n) instead.</p>
  </div>

  <h2 id="dsa-hs-impl"><span class="num">05</span>Build One From Scratch</h2>
  <p>A small hash map with open addressing and linear probing. Three ideas carry it: probe until an empty slot, leave tombstones on delete, double the table when 2/3 full.</p>
  <div class="fx" data-lang="py">EMPTY, DELETED = object(), object()       # two special markers

class HashMap:
    def __init__(self, cap=8):
        self.keys = [EMPTY] * cap
        self.vals = [None] * cap
        self.used = 0                     # live keys + tombstones

    def _slot(self, key):
        """Index where key lives, or where it should go."""
        cap = len(self.keys)
        i = hash(key) % cap               # 1. hash -&gt; home slot
        first_free = None
        while self.keys[i] is not EMPTY:  # 2. probe until an empty slot
            k = self.keys[i]
            if k is DELETED:
                if first_free is None:
                    first_free = i        # remember: can reuse this spot
            elif k == key:
                return i                  # found it
            i = (i + 1) % cap             # linear probing: try the next slot
        return first_free if first_free is not None else i

    def put(self, key, val):
        i = self._slot(key)
        if self.keys[i] is EMPTY:
            self.used += 1
        self.keys[i], self.vals[i] = key, val
        if self.used * 3 &gt;= len(self.keys) * 2:   # 2/3 full: grow
            self._resize(len(self.keys) * 2)

    def get(self, key, default=None):
        i = self._slot(key)
        k = self.keys[i]
        return self.vals[i] if k is not EMPTY and k is not DELETED else default

    def delete(self, key):
        i = self._slot(key)
        k = self.keys[i]
        if k is EMPTY or k is DELETED:
            raise KeyError(key)
        self.keys[i], self.vals[i] = DELETED, None   # tombstone, not EMPTY

    def _resize(self, cap):
        old = [(k, v) for k, v in zip(self.keys, self.vals)
               if k is not EMPTY and k is not DELETED]
        self.keys, self.vals, self.used = [EMPTY] * cap, [None] * cap, 0
        for k, v in old:                  # rehash: new size = new slots
            self.put(k, v)

    def __len__(self):
        return sum(k is not EMPTY and k is not DELETED for k in self.keys)

m = HashMap()
for i, dish in enumerate(["chai", "dosa", "idli", "vada", "roti", "naan"]):
    m.put(dish, 10 * (i + 1))
    print(f"put {dish}: size={len(m)} capacity={len(m.keys)}")
m.put("chai", 99)                         # update, not a new key
m.delete("dosa")
print(m.get("chai"), m.get("dosa"), m.get("roti"), m.get("pizza", "none"), len(m))</div>
  <div class="fx" data-lang="text">put chai: size=1 capacity=8
put dosa: size=2 capacity=8
put idli: size=3 capacity=8
put vada: size=4 capacity=8
put roti: size=5 capacity=8
put naan: size=6 capacity=16
99 None 50 none 5</div>
  <p>The sixth key pushes the table past 2/3 full, so it doubles to 16. Putting "chai" again finds the existing key and overwrites the value, so the size stays the same. The class was checked against a real dict on 300 random sequences of put/get/delete.</p>
  <p>Why does <code>used</code> count tombstones too? Because tombstones also block "probe until empty". If they were ignored, a table full of tombstones would have no empty slot and the probe loop would never end.</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Average</th><th>Worst</th><th>Plain reason</th></tr>
    <tr><td>get / <code>k in d</code></td><td>O(1)</td><td>O(n)</td><td>Hash, then a few probes; worst case all keys collide</td></tr>
    <tr><td>put (insert / update)</td><td>O(1) amortised</td><td>O(n)</td><td>Occasional resize re-inserts everything</td></tr>
    <tr><td>delete</td><td>O(1)</td><td>O(n)</td><td>Find, then leave a tombstone</td></tr>
    <tr><td>iterate all keys</td><td>O(n)</td><td>O(n)</td><td>Walk the entries</td></tr>
    <tr><td>min / max / sorted keys</td><td>O(n) / O(n log n)</td><td></td><td>No order by value; use a heap or sorting</td></tr>
    <tr><td>space</td><td>O(n)</td><td></td><td>Plus spare empty slots (≥ 1/3 of the table)</td></tr>
  </table>

  <h2 id="dsa-hs-hashable"><span class="num">06</span>What Can Be a Key</h2>
  <p>The table finds a key by its hash. If a key's hash changed after it was stored, the table would look in the wrong slot and never find it again. So keys must be <strong>hashable</strong>: their hash must never change. In practice that means <strong>immutable</strong> values.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Filing a document under "phone number 98xxx". If the person changes their number while the file is in the cabinet, nobody can find the file by either number any more.</p>
  </div>
  <div class="fx" data-lang="py">d = {}
d[(1, 2)] = "tuple ok"
d["key"] = "str ok"
d[frozenset({1, 2})] = "frozenset ok"
try:
    d[[1, 2]] = "list?"
except TypeError as e:
    print("TypeError:", e)
try:
    d[(1, [2])] = "tuple holding a list?"
except TypeError as e:
    print("TypeError:", e)
print(len(d), d[(1, 2)], 1 == 1.0 == True, {1: "a", 1.0: "b", True: "c"})

class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))   # equal objects -&gt; equal hashes

visited = {Point(1, 2)}
print(Point(1, 2) in visited, Point(2, 1) in visited)</div>
  <div class="fx" data-lang="text">TypeError: unhashable type: 'list'
TypeError: unhashable type: 'list'
3 tuple ok True {1: 'c'}
True False</div>
  <p>(Newer Python versions word the error a little longer, but it still says "unhashable type: 'list'".) A tuple is hashable only if everything inside it is. And <code>1</code>, <code>1.0</code> and <code>True</code> are equal with equal hashes, so they are the <strong>same key</strong>: the dict keeps the first key and the last value.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>The hash contract</strong>: if <code>a == b</code> then <code>hash(a) == hash(b)</code>. The reverse need not hold (different keys may collide). If you define <code>__eq__</code> on a class, Python sets <code>__hash__</code> to None (unhashable) until you define <code>__hash__</code> too, using the same fields. <code>@dataclass(frozen=True)</code> does both for you.</p>
  </div>
  <table class="tbl">
    <tr><th>Hashable (can be key / set item)</th><th>Not hashable</th><th>Common fix</th></tr>
    <tr><td>int, float, str, bytes, bool, None, tuple of hashables, frozenset, frozen dataclass</td><td>list, dict, set, bytearray, tuple containing a list</td><td><code>tuple(lst)</code>, <code>frozenset(s)</code>, <code>tuple(sorted(d.items()))</code></td></tr>
  </table>

  <h2 id="dsa-hs-python"><span class="num">07</span>dict, set, Counter, defaultdict</h2>
  <div class="fx" data-lang="py">from collections import Counter, defaultdict

stock = {"chai": 20, "dosa": 50}
stock["idli"] = 30                     # insert
stock["chai"] += 5                     # update
print(stock.get("vada", 0), "vada" in stock, list(stock))
for item, price in stock.items():
    print(item, price)
del stock["dosa"]
print(stock.pop("idli"), stock)
print(stock.setdefault("poha", 15), stock)

seen = set()
for x in [3, 1, 3, 2, 1]:
    seen.add(x)
print(seen, 2 in seen, {1, 2, 3} &amp; {2, 3, 4}, {1, 2} | {5}, {1, 2, 3} - {2})

votes = Counter("banana")
print(votes, votes["a"], votes["z"], votes.most_common(2))
votes.update("ab")
print(votes - Counter("aaa"), Counter("listen") == Counter("silent"))

by_first = defaultdict(list)
for w in ["apple", "avocado", "banana", "blueberry", "cherry"]:
    by_first[w[0]].append(w)          # no "if key not in" check needed
print(dict(by_first))
counts = defaultdict(int)
for ch in "hello":
    counts[ch] += 1
print(dict(counts))</div>
  <div class="fx" data-lang="text">0 False ['chai', 'dosa', 'idli']
chai 25
dosa 50
idli 30
30 {'chai': 25}
15 {'chai': 25, 'poha': 15}
{1, 2, 3} True {2, 3} {1, 2, 5} {1, 3}
Counter({'a': 3, 'n': 2, 'b': 1}) 3 0 [('a', 3), ('n', 2)]
Counter({'b': 2, 'n': 2, 'a': 1}) True
{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}
{'h': 1, 'e': 1, 'l': 2, 'o': 1}</div>
  <div class="cards">
    <div><b>dict</b><p><code>d[k]</code> raises KeyError if missing; <code>d.get(k, default)</code> does not. <code>setdefault(k, v)</code> inserts only if missing.</p><small>Insertion-ordered since 3.7</small></div>
    <div><b>set</b><p>Membership, de-duplication, and set algebra: <code>&amp;</code> both, <code>|</code> either, <code>-</code> only left, <code>^</code> exactly one.</p><small><code>set(lst)</code> is O(n)</small></div>
    <div><b>Counter</b><p>A dict of counts. Missing keys read as 0. <code>most_common(k)</code>, <code>+</code>/<code>-</code> drop counts ≤ 0.</p><small><code>Counter(a) == Counter(b)</code> → anagram check</small></div>
    <div><b>defaultdict</b><p><code>defaultdict(list)</code> makes an empty list on first access; <code>defaultdict(int)</code> starts at 0.</p><small>⚠ Just reading <code>d[k]</code> creates the key</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Changing a dict's size while looping over it raises <code>RuntimeError: dictionary changed size during iteration</code>. Loop over <code>list(d)</code> (a copy of the keys) if you need to delete while looping.</p>
  </div>

  <h2 id="dsa-hs-patterns"><span class="num">08</span>Patterns</h2>
  <p>Almost every hashing trick is the same move: <strong>instead of searching again, remember what you've seen</strong>. You pay O(n) memory to save an O(n) inner loop.</p>
  <h3>Pattern 1: seen set</h3>
  <p>Signal words: "duplicate", "already seen", "first repeated", "unique". Walk once; before adding each item, ask the set if it is already there.</p>
  <h3>Pattern 2: complement lookup (the Two Sum trick)</h3>
  <p>Signal words: "pair that sums / differs to target". For each x, the partner you need is <code>target − x</code>. Instead of scanning for it (O(n) each), ask a dict of values seen so far (O(1)). Check first, then store, so x never pairs with itself.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>At a wedding, guests arrive one at a time wearing a half-heart badge. Each new guest asks the host's register: "has my other half arrived?" If yes, match found. If not, they write their own name in the register and wait.</p>
  </div>
  <h3>Pattern 3: frequency count</h3>
  <p>Signal words: "anagram", "most frequent", "appears more than n/2 times", "same characters". Build a <code>Counter</code> (or an array of 26 for lowercase letters) and compare or sort the counts.</p>
  <h3>Pattern 4: group by a canonical key</h3>
  <p>Signal words: "group", "bucket", "all strings that are…". Turn each item into a <strong>canonical form</strong> that is the same for every member of a group (sorted letters, a count tuple, a shifted pattern), then <code>defaultdict(list)</code> on that key.</p>
  <h3>Pattern 5: prefix sum + hashmap</h3>
  <p>Signal words: "number of subarrays with sum k", "longest subarray with sum k", "equal 0s and 1s". A subarray sum is a difference of two prefix sums (Arrays note): <code>sum(i..j) = P[j+1] − P[i]</code>. We want it to equal k, so at each position ask: "how many earlier prefixes equal <code>P − k</code>?" A dict of prefix counts answers in O(1). Unlike sliding window, this works with negative numbers.</p>
  <div class="flow"><span>prefix += x</span><span>answer += count[prefix − k]</span><span>count[prefix] += 1</span><span>start with count[0] = 1</span></div>
  <table class="tbl">
    <tr><th>Signal</th><th>Store</th><th>Example</th></tr>
    <tr><td>"seen before?"</td><td>set of values</td><td>Contains Duplicate, Happy Number, cycle check</td></tr>
    <tr><td>"pair with sum / difference"</td><td>dict value → index</td><td>Two Sum, pairs with difference k</td></tr>
    <tr><td>"same letters / counts"</td><td>Counter or [0]*26</td><td>Valid Anagram, Ransom Note, Find All Anagrams (+ window)</td></tr>
    <tr><td>"group together"</td><td>defaultdict(list) on canonical key</td><td>Group Anagrams, group shifted strings</td></tr>
    <tr><td>"k most frequent"</td><td>Counter, then heap or buckets</td><td>Top K Frequent (see Heaps note)</td></tr>
    <tr><td>"subarray sum = k" (with negatives)</td><td>dict prefix → count / first index</td><td>Subarray Sum Equals K, Contiguous Array</td></tr>
    <tr><td>"longest run of consecutive values"</td><td>set; start only at run beginnings</td><td>Longest Consecutive Sequence</td></tr>
  </table>

  <h2 id="dsa-hs-problems"><span class="num">09</span>Classic Problems</h2>
  <h3>1. Contains Duplicate</h3>
  <p>Does any value appear twice? <code>[1, 2, 3, 1]</code> → True. Brute force compares all pairs, O(n²). Sorting then checking neighbours is O(n log n). A seen set is O(n).</p>
  <div class="fx" data-lang="py">def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True               # met it before
        seen.add(x)
    return False

for nums in [[1, 2, 3, 1], [1, 2, 3, 4], [], [7, 7]]:
    print(nums, "-&gt;", contains_duplicate(nums), len(set(nums)) != len(nums))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 1] -&gt; True True
[1, 2, 3, 4] -&gt; False False
[] -&gt; False False
[7, 7] -&gt; True True</div>
  <p>Time O(n), space O(n). The one-liner <code>len(set(nums)) != len(nums)</code> is also O(n) but always reads the whole list; the loop stops at the first repeat.</p>

  <h3>2. Valid Anagram</h3>
  <p>Are two strings made of exactly the same letters? <code>"anagram"</code>, <code>"nagaram"</code> → True. Sorting both is O(n log n). Counting is O(n).</p>
  <div class="fx" data-lang="py">def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26                  # one counter per letter a..z
    for a, b in zip(s, t):
        count[ord(a) - ord("a")] += 1
        count[ord(b) - ord("a")] -= 1
    return all(c == 0 for c in count)

for s, t in [("anagram", "nagaram"), ("rat", "car"), ("", ""), ("ab", "a"), ("aacc", "ccac")]:
    print(repr(s), repr(t), "-&gt;", is_anagram(s, t), Counter(s) == Counter(t))</div>
  <div class="fx" data-lang="text">'anagram' 'nagaram' -&gt; True True
'rat' 'car' -&gt; False False
'' '' -&gt; True True
'ab' 'a' -&gt; False False
'aacc' 'ccac' -&gt; False False</div>
  <p>Time O(n), space O(1) (26 counters, fixed). <code>Counter(s) == Counter(t)</code> is the readable version and also handles Unicode; mention both. The length check up front catches <code>"ab"</code> vs <code>"a"</code> early.</p>

  <h3>3. Two Sum</h3>
  <p>Unsorted <code>[2, 7, 11, 15]</code>, target 9 → indices <code>[0, 1]</code>. Brute force: all pairs, O(n²). Sorting + two pointers (Arrays note) loses the original indices. The complement dict does it in one pass.</p>
  <table class="tbl out"><caption>Dry run on [3, 2, 4], target 6</caption>
    <tr><th>i</th><th>x</th><th>need = 6 − x</th><th>need in dict?</th><th>dict after</th></tr>
    <tr><td>0</td><td>3</td><td>3</td><td>no (dict empty; 3 must not pair with itself)</td><td>{3: 0}</td></tr>
    <tr><td>1</td><td>2</td><td>4</td><td>no</td><td>{3: 0, 2: 1}</td></tr>
    <tr><td>2</td><td>4</td><td>2</td><td>yes, at index 1 → [1, 2]</td><td>–</td></tr>
  </table>
  <div class="fx" data-lang="py">def two_sum(nums, target):
    index_of = {}                     # value -&gt; index where we saw it
    for i, x in enumerate(nums):
        need = target - x             # the partner x is waiting for
        if need in index_of:
            return [index_of[need], i]
        index_of[x] = i               # store AFTER checking (no self-pairing)
    return []

for nums, t in [([2, 7, 11, 15], 9), ([3, 2, 4], 6), ([3, 3], 6), ([1, 2], 7)]:
    print(nums, t, "-&gt;", two_sum(nums, t))</div>
  <div class="fx" data-lang="text">[2, 7, 11, 15] 9 -&gt; [0, 1]
[3, 2, 4] 6 -&gt; [1, 2]
[3, 3] 6 -&gt; [0, 1]
[1, 2] 7 -&gt; []</div>
  <p>Time O(n), space O(n). <code>[3, 3]</code> works because the first 3 is stored before the second one asks; duplicates overwrite the index, which is fine since we only need one valid pair.</p>

  <h3>4. Group Anagrams</h3>
  <p><code>["eat", "tea", "tan", "ate", "nat", "bat"]</code> → <code>[["eat","tea","ate"], ["tan","nat"], ["bat"]]</code>. Pattern 4: every anagram has the same <strong>sorted letters</strong>, so use that as the dict key.</p>
  <div class="fx" data-lang="py">def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = "".join(sorted(w))      # "eat", "tea", "ate" -&gt; "aet"
        groups[key].append(w)
    return list(groups.values())

def group_anagrams_count(words):      # O(n·k) key, no sorting
    groups = defaultdict(list)
    for w in words:
        count = [0] * 26
        for ch in w:
            count[ord(ch) - ord("a")] += 1
        groups[tuple(count)].append(w)   # list is unhashable, tuple is fine
    return list(groups.values())

for words in [["eat", "tea", "tan", "ate", "nat", "bat"], [""], ["a"]]:
    print(words, "-&gt;", group_anagrams(words))</div>
  <div class="fx" data-lang="text">['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] -&gt; [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
[''] -&gt; [['']]
['a'] -&gt; [['a']]</div>
  <p>For n words of length up to k: sorted key costs O(n · k log k); the count-tuple key costs O(n · k). Note <code>tuple(count)</code>: the list of counts cannot be a key, the tuple can. Both versions give the same groups on every test.</p>

  <h3>5. Top K Frequent Elements</h3>
  <p><code>[1, 1, 1, 2, 2, 3]</code>, k = 2 → <code>[1, 2]</code>. Count with a Counter, then pick the k biggest counts. The Heaps note solves the second step with a heap in O(n log k). Here is the O(n) <strong>bucket</strong> version: a count can't exceed n, so put each value in a list indexed by its count and read from the top.</p>
  <div class="fx" data-lang="py">def top_k_frequent(nums, k):
    count = Counter(nums)                         # value -&gt; frequency
    buckets = [[] for _ in range(len(nums) + 1)]  # index = frequency
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(nums), 0, -1):             # highest frequency first
        for x in buckets[c]:
            out.append(x)
            if len(out) == k:
                return out
    return out

for nums, k in [([1, 1, 1, 2, 2, 3], 2), ([1], 1), ([4, 4, 5, 5, 5, 6, 6, 6, 6], 2)]:
    print(nums, k, "-&gt;", top_k_frequent(nums, k), [x for x, _ in Counter(nums).most_common(k)])</div>
  <div class="fx" data-lang="text">[1, 1, 1, 2, 2, 3] 2 -&gt; [1, 2] [1, 2]
[1] 1 -&gt; [1] [1]
[4, 4, 5, 5, 5, 6, 6, 6, 6] 2 -&gt; [6, 5] [6, 5]</div>
  <p>Time O(n), space O(n). <code>Counter.most_common(k)</code> is the library one-liner (it uses a heap inside when k is given). Interviewers like hearing all three: sort O(n log n), heap O(n log k), buckets O(n).</p>

  <h3>6. Subarray Sum Equals K</h3>
  <p>Count contiguous subarrays that sum to k. <code>[1, 1, 1]</code>, k = 2 → 2. Numbers may be negative, so sliding window fails (Arrays note). Brute force: all subarrays, O(n²). Pattern 5 gives O(n).</p>
  <table class="tbl out"><caption>Dry run on [3, 4, 7, 2, -3, 1, 4, 2], k = 7</caption>
    <tr><th>x</th><th>prefix</th><th>prefix − 7</th><th>times seen before</th><th>total</th><th>subarray found</th></tr>
    <tr><td>3</td><td>3</td><td>−4</td><td>0</td><td>0</td><td></td></tr>
    <tr><td>4</td><td>7</td><td>0</td><td>1 (empty prefix)</td><td>1</td><td>[3, 4]</td></tr>
    <tr><td>7</td><td>14</td><td>7</td><td>1</td><td>2</td><td>[7]</td></tr>
    <tr><td>2</td><td>16</td><td>9</td><td>0</td><td>2</td><td></td></tr>
    <tr><td>−3</td><td>13</td><td>6</td><td>0</td><td>2</td><td></td></tr>
    <tr><td>1</td><td>14</td><td>7</td><td>1</td><td>3</td><td>[7, 2, −3, 1]</td></tr>
    <tr><td>4</td><td>18</td><td>11</td><td>0</td><td>3</td><td></td></tr>
    <tr><td>2</td><td>20</td><td>13</td><td>1</td><td>4</td><td>[1, 4, 2]</td></tr>
  </table>
  <div class="fx" data-lang="py">def subarray_sum(nums, k):
    seen = {0: 1}                     # prefix sum -&gt; how many times seen; empty prefix
    prefix = 0
    total = 0
    for x in nums:
        prefix += x
        total += seen.get(prefix - k, 0)   # earlier prefixes that leave exactly k
        seen[prefix] = seen.get(prefix, 0) + 1
    return total

for nums, k in [([1, 1, 1], 2), ([1, 2, 3], 3), ([1, -1, 0], 0), ([3, 4, 7, 2, -3, 1, 4, 2], 7)]:
    print(nums, k, "-&gt;", subarray_sum(nums, k))</div>
  <div class="fx" data-lang="text">[1, 1, 1] 2 -&gt; 2
[1, 2, 3] 3 -&gt; 2
[1, -1, 0] 0 -&gt; 3
[3, 4, 7, 2, -3, 1, 4, 2] 7 -&gt; 4</div>
  <p>Time O(n), space O(n). <code>seen = {0: 1}</code> stands for the empty prefix, so subarrays that start at index 0 are counted (that is how <code>[3, 4]</code> was found). <code>[1, -1, 0]</code>, k = 0 has three answers: <code>[1, -1]</code>, <code>[0]</code> and <code>[1, -1, 0]</code>, which a sliding window would miss.</p>

  <h3>7. Longest Consecutive Sequence</h3>
  <p><code>[100, 4, 200, 1, 3, 2]</code> → 4 (the run 1, 2, 3, 4), in O(n). Sorting would be O(n log n), so the problem forbids it. Put everything in a set. Only start counting from a number <code>x</code> that has no <code>x − 1</code> in the set: it is the beginning of a run. Then walk <code>x + 1, x + 2, …</code> while they exist.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Students with roll numbers stand in a hall in random order. To find the longest block of consecutive roll numbers, only the student whose "roll − 1" is absent shouts "I'm a start!" and counts upward. Nobody in the middle of a block starts counting, so no one is counted twice.</p>
  </div>
  <div class="fx" data-lang="py">def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:            # x starts a run (nothing just before it)
            y = x
            while y + 1 in s:         # walk the run forward
                y += 1
            best = max(best, y - x + 1)
    return best

for nums in [[100, 4, 200, 1, 3, 2], [0, 3, 7, 2, 5, 8, 4, 6, 0, 1], [], [1, 2, 0, 1]]:
    print(nums, "-&gt;", longest_consecutive(nums))</div>
  <div class="fx" data-lang="text">[100, 4, 200, 1, 3, 2] -&gt; 4
[0, 3, 7, 2, 5, 8, 4, 6, 0, 1] -&gt; 9
[] -&gt; 0
[1, 2, 0, 1] -&gt; 3</div>
  <p>There is a <code>while</code> inside a <code>for</code>, yet it is O(n): the inner walk runs only from run starts, and each number is walked over at most once in total. Loop over the <em>set</em>, not the list, so duplicates (like the two 0s) don't restart the same run. All seven solutions were checked against brute force on hundreds of random inputs.</p>

  <h2 id="dsa-hs-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: membership on a list</span>
    <p><code>if x in my_list</code> inside a loop is O(n) per check, O(n²) total. Convert once: <code>s = set(my_list)</code>, then <code>x in s</code> is O(1).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mutable keys</span>
    <p>Lists, sets and dicts can't be keys. Convert to <code>tuple</code> / <code>frozenset</code>. And never mutate an object that is already a key in a way that changes its hash: the dict will lose it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: storing before checking in Two Sum</span>
    <p>If you add x to the dict before looking up <code>target − x</code>, then x = 3, target = 6 matches itself. Check first, store after.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting count[0] = 1 in prefix-sum counting</span>
    <p>Without the empty prefix, every subarray starting at index 0 is missed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: defaultdict creating keys by reading</span>
    <p><code>if d[k]:</code> on a defaultdict inserts k with a default value. Use <code>k in d</code> or <code>d.get(k)</code> to look without creating.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: relying on set order or hash values</span>
    <p>Set iteration order is arbitrary and string hashes change between runs. Sort the output if order matters. Dicts keep insertion order, but that is not sorted order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: claiming guaranteed O(1)</span>
    <p>Say "O(1) on average, O(n) worst case when many keys collide". Space is O(n) too; mention it when trading memory for speed.</p>
  </div>

  <h2 id="dsa-hs-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does a hash map find a key in O(1) on average?</summary><div class="qa-body">It computes <code>hash(key)</code>, reduces it to a slot index (<code>% size</code>, or a bitmask when size is a power of 2) and jumps to that array slot directly. With a good hash and a low load factor, only one or two slots are checked, regardless of how many keys are stored.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a collision and what are the two main ways to handle it?</summary><div class="qa-body">Two different keys mapping to the same slot. <strong>Chaining</strong>: each slot holds a list of entries. <strong>Open addressing</strong>: one entry per slot; on a clash, probe other slots in a fixed sequence (linear, quadratic, or CPython's perturbed sequence) until a free slot or the key is found.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which does CPython's dict use, and how does it probe?</summary><div class="qa-body">Open addressing. The table size is a power of 2. On a clash it uses a recurrence like <code>i = (5*i + 1 + perturb) &amp; mask</code>, with <code>perturb</code> starting as the full hash and shifted right 5 bits each step, so high hash bits influence the path and clustering stays low.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you just mark a deleted slot as empty in open addressing?</summary><div class="qa-body">A search stops at the first empty slot. Keys placed after the deleted one in the same probe chain would become unreachable. A tombstone means "nothing here, but keep probing"; inserts can reuse it and a resize removes them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the load factor and why does the table resize?</summary><div class="qa-body">Items ÷ slots. As it rises, probe chains get longer and operations slow down. CPython's dict grows when about 2/3 full: it allocates a bigger table and re-inserts every key (positions change because the size changed). Each resize is O(n), but they are rare, so insert is O(1) amortised.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes an object hashable? Why can't a list be a key?</summary><div class="qa-body">It has a <code>__hash__</code> whose value never changes during its lifetime, and an <code>__eq__</code> consistent with it (equal objects, equal hashes). A list is mutable: if it changed after insertion, its hash would change and the dict would look in the wrong slot. Use <code>tuple(lst)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>{1: "a", 1.0: "b", True: "c"}</code> evaluate to?</summary><div class="qa-body"><code>{1: 'c'}</code>. The three keys are equal and hash the same, so they are one key. The first-inserted key object (1) is kept and the value is overwritten each time, ending as "c".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the Two Sum hashmap solution and its complexity.</summary><div class="qa-body">Walk once; for each x compute <code>need = target − x</code>. If need is in the dict of earlier values → return both indices. Otherwise store x → index. Checking before storing prevents pairing x with itself. O(n) time, O(n) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two ways to build a key for Group Anagrams, and their costs?</summary><div class="qa-body">Sorted letters <code>"".join(sorted(w))</code>: O(k log k) per word. Count tuple <code>tuple(26 counts)</code>: O(k) per word. Total O(n·k log k) vs O(n·k). The count must be a tuple, since a list is unhashable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Subarray Sum Equals K use a hashmap instead of a sliding window?</summary><div class="qa-body">Negative numbers break the window's "grow increases the sum" rule. Prefix sums turn each subarray sum into <code>P[j] − P[i]</code>; counting earlier prefixes equal to <code>P − k</code> in a dict finds all of them in O(n). Start with <code>{0: 1}</code> for the empty prefix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Longest Consecutive Sequence runs a while loop inside a for loop. Why is it O(n)?</summary><div class="qa-body">The inner walk starts only at numbers with no predecessor in the set, i.e. run beginnings. Each number belongs to exactly one run and is stepped over once by that run's walk. Total inner steps ≤ n, plus n outer checks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top K Frequent: compare three approaches.</summary><div class="qa-body">After counting with a Counter (O(n)): sort by count O(n log n); a size-k heap O(n log k) (Heaps note); bucket sort by frequency O(n), since a frequency is between 1 and n. <code>Counter.most_common(k)</code> is the one-liner.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a sorted structure over a hash map?</summary><div class="qa-body">When you need order: min/max, range queries ("all keys between 10 and 20"), the next bigger key, or sorted iteration. Also when a guaranteed worst case (O(log n) balanced tree) matters more than average O(1). Hash maps are best for exact-match lookups.</div></details>
</main>
`
});
