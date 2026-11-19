// notes/softeng/cf_data.js — How Data Is Stored as Bits
Object.assign(TOPIC_CONTENT, {
  "cf_data": `<main>
<h1>How Data Is Stored as Bits</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>How Data Is Stored as Bits</span></div>
  <p class="lead">Inside a computer there are no numbers, letters, photos or prices, only enormous rows of tiny switches that are either on or off. Everything you work with as a data scientist, from a CSV file to a model's weights, is stored by agreeing on a way to turn those on/off patterns into meaning. Knowing those agreements explains a surprising number of everyday puzzles: why <code>0.1 + 0.2</code> is not <code>0.3</code>, why a 1 TB disk shows 931 GB, why a column of small numbers suddenly turns negative, why a CSV opens as <code>cafÃ©</code>, why GPUs train in "bfloat16", and why changing a dtype can shrink a DataFrame tenfold. The running example is a single order from a chai stall, a quantity of 13 cups, a price, a customer's name in English and Hindi, a city and a photo of the receipt, and we follow how each of those becomes bits, ending with a million such orders in pandas.</p>

  <h2 id="cfd-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Data as bits</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Counting</div>
        <ul>
          <li><b>Bit</b> = 0 or 1; <b>byte</b> = 8 bits = 256 patterns</li>
          <li>KB/MB/GB = powers of 1000; KiB/MiB/GiB = powers of 1024</li>
          <li>Binary (base 2), decimal (10), hex (16, one digit = 4 bits)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Numbers</div>
        <ul>
          <li>Integers: unsigned, or signed with <b>two's complement</b></li>
          <li>Fixed-size ints <b>overflow</b> (wrap round); Python ints do not</li>
          <li>Floats: sign × fraction × 2<sup>exponent</sup> (IEEE 754), rounded</li>
          <li>ML: float32 default, float16/bfloat16 for speed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Text and media</div>
        <ul>
          <li>Unicode gives each character a number; <b>UTF-8</b> stores it in 1–4 bytes</li>
          <li>Wrong encoding when reading = mojibake or errors</li>
          <li>Images = grids of RGB bytes; audio = samples per second</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li>The <b>dtype</b> decides bytes per value and range</li>
          <li>int8 / float32 / category can cut pandas memory 10×</li>
          <li>Endianness = byte order of multi-byte values</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfd-bits"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Bits and Bytes</span><span class="rm-sub">why computers use only 0 and 1</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-units"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Data Units: KB vs KiB</span><span class="rm-sub">why a 1 TB disk shows 931 GB</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-bases"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Binary, Decimal and Hexadecimal</span><span class="rm-sub">three ways to write the same number, converted by hand</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-int"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Integers, Two's Complement and Overflow</span><span class="rm-sub">negative numbers, wrapping round, byte order</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-float"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Floating Point</span><span class="rm-sub">IEEE 754 in plain words, and why 0.1 + 0.2 ≠ 0.3</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-mlfloat"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Float Precision in Machine Learning</span><span class="rm-sub">float64, float32, float16, bfloat16</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-text"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Text: ASCII, Unicode and UTF-8</span><span class="rm-sub">how letters, Hindi and emoji become bytes</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-media"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Images, Audio and Video as Numbers</span><span class="rm-sub">pixels, RGB, sample rates</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-dtype"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Choosing Data Types in pandas</span><span class="rm-sub">the same data in 70 MB or 6 MB</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">float equality, silent overflow, wrong encoding</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">units, ranges, encodings, dtypes</span></div></div>
      <div class="rm-item rm-done" data-target="cfd-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the data-representation questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="cfd-bits"><span class="num">01</span>Bits and Bytes</h2>
  <p>A computer's memory is built from billions of microscopic electronic switches. Each one can be in only two states: holding an electric charge or not, letting current through or not. Engineers could in principle try to store ten different voltage levels in each switch, one per decimal digit, but telling ten levels apart reliably, billions of times a second, in a chip that is warming up and full of electrical noise, is very hard. Telling "on" from "off" is easy and almost never goes wrong. So every computer stores everything using just two symbols, written 0 and 1.</p>
  <p>One such two-state value is called a <strong>bit</strong>, short for "binary digit": the smallest possible unit of information, answering a single yes/no question. One bit alone can only tell two things apart, but bits combine quickly. Think of a row of light switches on a wall. With one switch there are two possible patterns, with two switches four (off-off, off-on, on-off, on-on), with three switches eight, and every extra switch doubles the count again. In general, <em>n</em> bits give 2<sup><em>n</em></sup> different patterns, and a computer stores anything at all by agreeing which pattern stands for which value. Here is how the chai stall's quantity of 13 cups looks, and how fast the number of patterns grows:</p>
  <div class="fx" data-lang="py">order_qty = 13                        # the quantity on one chai-stall order

print(bin(order_qty))                 # how the number is stored, in binary
print(int("1101", 2))                 # binary text back to a number
print(order_qty.bit_length(), "bits needed")

for n_bits in (1, 2, 8, 16, 32, 64):
    print(f"{n_bits:2} bits can hold {2**n_bits:,} different values")</div>
  <div class="fx" data-lang="text">0b1101
13
4 bits needed
 1 bits can hold 2 different values
 2 bits can hold 4 different values
 8 bits can hold 256 different values
16 bits can hold 65,536 different values
32 bits can hold 4,294,967,296 different values
64 bits can hold 18,446,744,073,709,551,616 different values</div>
  <p><code>bin(13)</code> shows the binary form <code>0b1101</code> (the <code>0b</code> prefix just marks the text as binary), and <code>int("1101", 2)</code> turns it back into 13, so the conversion goes both ways. Thirteen needs only 4 bits, but notice how the table explodes: 8 bits already give 256 patterns, 32 bits about 4.3 billion, and 64 bits about 18 billion billion. This doubling is why a few more bits make an enormous difference to what can be stored, a fact we will meet again with integer sizes and float types.</p>
  <p>Working with single bits would be clumsy, so memory is organised in groups of 8 bits called <strong>bytes</strong>. A byte is the smallest unit that has its own address in memory, the way a single house has its own number on a street, and it has 2<sup>8</sup> = 256 possible patterns, enough for a number from 0 to 255 or for one English letter. Every file on disk, every network message and every value in RAM is, at bottom, a sequence of bytes. Python has a type for exactly that, called <code>bytes</code>:</p>
  <div class="fx" data-lang="py">data = bytes([72, 105, 33])           # three bytes, each a number 0..255
print(data)                           # Python shows printable bytes as text
print(list(data))
print([format(b, "08b") for b in data])

try:
    bytes([256])                      # one byte cannot hold 256
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">b'Hi!'
[72, 105, 33]
['01001000', '01101001', '00100001']
ValueError: bytes must be in range(0, 256)</div>
  <p>The three bytes hold the numbers 72, 105 and 33. Python prints them as <code>b'Hi!'</code> because, under the ASCII agreement we meet in section 07, those numbers stand for the characters H, i and !; the same bytes could equally be part of a photo or a price, and only the program reading them decides. Each byte is shown as its 8 bits on the third line. Asking for a byte with value 256 fails, because 256 patterns means values 0 to 255. The idea to carry forward is that <em>bytes have no meaning on their own</em>; meaning comes from the agreed format, called an <strong>encoding</strong>, that the reader applies. Every bug in this note, from mojibake to overflow, is a case of the writer and reader not agreeing on that format or of the format being too small.</p>

  <h2 id="cfd-units"><span class="num">02</span>Data Units: KB vs KiB</h2>
  <p>Real data is measured in thousands, millions and billions of bytes, so we use prefixes. In everyday science "kilo" means a thousand, so a <strong>kilobyte</strong> (KB) is 1,000 bytes, a <strong>megabyte</strong> (MB) is 1,000,000, a <strong>gigabyte</strong> (GB) is 10<sup>9</sup> (a billion) and a <strong>terabyte</strong> (TB) is 10<sup>12</sup> (a trillion). To get a feel for the sizes: one English letter is a byte, a page of text a few kilobytes, a phone photo a few megabytes, an hour of HD video a few gigabytes, and a large company's data warehouse many terabytes or petabytes (10<sup>15</sup> bytes).</p>
  <p>There is a complication. Because memory chips are built in powers of two, early programmers found it natural to call 2<sup>10</sup> = 1,024 bytes a "kilobyte", since 1,024 is close to 1,000. For decades the same words meant two different sizes depending on who was speaking. In 1998 a standards body introduced separate names for the powers of two: a <strong>kibibyte</strong> (KiB) is 1,024 bytes, a <strong>mebibyte</strong> (MiB) 1,024<sup>2</sup>, a <strong>gibibyte</strong> (GiB) 1,024<sup>3</sup> and a <strong>tebibyte</strong> (TiB) 1,024<sup>4</sup>. The "bi" stands for binary. Disk manufacturers use the decimal units, which make the number on the box larger; RAM is sold in binary sizes; and operating systems are split, with Windows and many Linux tools counting in powers of 1,024 but writing "GB" or "G", while macOS counts in powers of 1,000. The gap is small for kilobytes (2.4 percent) but grows with each prefix, which is exactly how a "missing" 69 GB appears on a new disk:</p>
  <div class="fx" data-lang="py">disk = 1_000_000_000_000              # "1 TB" on the box: 10**12 bytes

print("in GB  (1000**3):", disk / 1000**3)
print("in GiB (1024**3):", round(disk / 1024**3, 1))
print("in TiB (1024**4):", round(disk / 1024**4, 3))
for name, power in [("KiB", 1), ("MiB", 2), ("GiB", 3), ("TiB", 4)]:
    print(f"1 {name} is {1024**power / 1000**power:.3f} times its decimal cousin")</div>
  <div class="fx" data-lang="text">in GB  (1000**3): 1000.0
in GiB (1024**3): 931.3
in TiB (1024**4): 0.909
1 KiB is 1.024 times its decimal cousin
1 MiB is 1.049 times its decimal cousin
1 GiB is 1.074 times its decimal cousin
1 TiB is 1.100 times its decimal cousin</div>
  <p>The disk really does hold 10<sup>12</sup> bytes, exactly as advertised, which is 1,000 GB. But measured in gibibytes it is 931.3, and Windows, counting in GiB while printing "GB", shows "931 GB". Nothing is missing; the same amount is being measured with a slightly larger ruler. The last four lines show the ruler growing: a TiB is 10 percent bigger than a TB. You can see both rulers on the same disk on Linux, because <code>df -h</code> uses powers of 1,024 (while writing just "G") and <code>df -H</code> uses powers of 1,000:</p>
  <div class="fx" data-lang="text">$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        252G   29G  9.7G  75% /
$ df -H /
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        271G   31G   11G  75% /</div>
  <p>One disk, two sizes: 252 by the binary ruler and 271 by the decimal one, because 271 × 10<sup>9</sup> bytes is about 252 × 1,024<sup>3</sup>. When a number matters, such as a cloud bill, a memory limit on a container or a quota on a dataset, check which ruler is in use: AWS bills storage in decimal GB, while Kubernetes memory limits written <code>512Mi</code> mean mebibytes and <code>512M</code> means megabytes. Network speeds add one more trap: they are quoted in <em>bits</em> per second (Mbps, lowercase b), so a 100 Mbps connection moves at most 12.5 megabytes per second.</p>

  <h2 id="cfd-bases"><span class="num">03</span>Binary, Decimal and Hexadecimal</h2>
  <p>Writing numbers as long strings of 0s and 1s is how the machine stores them, but people need ways to read and write those patterns. There are three number systems you will meet, and they are all the same idea with a different number of digits. In our everyday <strong>decimal</strong> system (base 10) there are ten digits, and each position is worth ten times the one to its right: 213 means 2 hundreds, 1 ten and 3 ones. <strong>Binary</strong> (base 2) has only the digits 0 and 1, and each position is worth twice the one to its right: from the right, 1, 2, 4, 8, 16, 32, 64, 128 and so on. To read a binary number you add up the place values where there is a 1.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="20" y="34" class="tm" font-size="10.5">place value</text>
<text x="20" y="74" class="tm" font-size="10.5">bit</text>
<rect x="120" y="50" width="48" height="36" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="144" y="34" text-anchor="middle">128</text><text x="144" y="74" text-anchor="middle">0</text>
<rect x="172" y="50" width="48" height="36" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="196" y="34" text-anchor="middle">64</text><text x="196" y="74" text-anchor="middle">0</text>
<rect x="224" y="50" width="48" height="36" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="248" y="34" text-anchor="middle">32</text><text x="248" y="74" text-anchor="middle">0</text>
<rect x="276" y="50" width="48" height="36" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="300" y="34" text-anchor="middle">16</text><text x="300" y="74" text-anchor="middle">0</text>
<rect x="328" y="50" width="48" height="36" rx="4" class="fg sg"/><text x="352" y="34" text-anchor="middle">8</text><text x="352" y="74" text-anchor="middle" font-weight="700">1</text>
<rect x="380" y="50" width="48" height="36" rx="4" class="fg sg"/><text x="404" y="34" text-anchor="middle">4</text><text x="404" y="74" text-anchor="middle" font-weight="700">1</text>
<rect x="432" y="50" width="48" height="36" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="456" y="34" text-anchor="middle">2</text><text x="456" y="74" text-anchor="middle">0</text>
<rect x="484" y="50" width="48" height="36" rx="4" class="fg sg"/><text x="508" y="34" text-anchor="middle">1</text><text x="508" y="74" text-anchor="middle" font-weight="700">1</text>
<text x="326" y="116" text-anchor="middle">00001101 = 8 + 4 + 1 = 13</text>
<text x="326" y="138" text-anchor="middle" class="tm" font-size="10.5">high nibble 0000 = hex 0, low nibble 1101 = hex D, so 13 = 0x0D</text>
</svg><figcaption>One byte holding the order quantity 13. Each box is worth twice the box to its right; the value is the sum of the boxes holding a 1. Each group of four bits is exactly one hexadecimal digit.</figcaption></figure>
  <p>Going the other way, from decimal to binary by hand, uses repeated division. Divide the number by 2 and write down the remainder (0 or 1); divide the result by 2 again; keep going until you reach 0; then read the remainders from the last one back to the first. The same recipe works for any base: divide by 16 instead and you get hexadecimal. Here the conversion is done step by step for 200 so you can follow it, then checked with Python's built-ins:</p>
  <div class="fx" data-lang="py">def to_base(n, base):
    """Convert by hand: divide repeatedly by the base, keep the remainders."""
    digits = "0123456789ABCDEF"
    out = ""
    while n &gt; 0:
        q, r = divmod(n, base)
        print(f"  {n:3} / {base} = {q:3}  remainder {r}")
        out = digits[r] + out              # remainders are read bottom-up
        n = q
    return out

print("200 in binary:", to_base(200, 2))
print("200 in hex   :", to_base(200, 16))

print(bin(200), hex(200))                      # Python's built-ins agree
print(int("11001000", 2), int("C8", 16), 0xC8, 0b11001000)
print(format(200, "08b"), format(200, "02x"))</div>
  <div class="fx" data-lang="text">  200 / 2 = 100  remainder 0
  100 / 2 =  50  remainder 0
   50 / 2 =  25  remainder 0
   25 / 2 =  12  remainder 1
   12 / 2 =   6  remainder 0
    6 / 2 =   3  remainder 0
    3 / 2 =   1  remainder 1
    1 / 2 =   0  remainder 1
200 in binary: 11001000
  200 / 16 =  12  remainder 8
   12 / 16 =   0  remainder 12
200 in hex   : C8
0b11001000 0xc8
200 200 200 200
11001000 c8</div>
  <p>Reading the binary remainders from the bottom up gives 1, 1, 0, 0, 1, 0, 0, 0, so 200 is <code>11001000</code>. You can check it with place values: 128 + 64 + 8 = 200. For hexadecimal, 200 divided by 16 is 12 remainder 8, and 12 divided by 16 is 0 remainder 12. Hex needs single symbols for the values 10 to 15, so it borrows letters: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15. Reading bottom-up gives C then 8, so 200 is <code>C8</code> in hex. Python's <code>bin</code>, <code>hex</code> and <code>int(text, base)</code> agree, and the prefixes <code>0b</code> and <code>0x</code> let you type binary and hex numbers directly in code.</p>
  <p><strong>Hexadecimal</strong> (base 16) exists because binary is too long for people and decimal hides the bit pattern. Its key property is that 16 = 2<sup>4</sup>, so every hex digit stands for exactly four bits (a group called a <strong>nibble</strong>), and every byte is exactly two hex digits: <code>1100 1000</code> is <code>C 8</code>. Converting between binary and hex needs no arithmetic at all, just grouping by four, which is why programmers use hex whenever they want to look at raw bytes. You see it all the time without noticing: web colours like <code>#FF8800</code> (three bytes for red, green and blue), memory addresses like <code>0x7ffd5e3a</code> in error messages, Git commit IDs, SHA-256 hashes, UUIDs, MAC addresses, and the output of <code>bytes.hex()</code> in Python.</p>

  <h2 id="cfd-int"><span class="num">04</span>Integers, Two's Complement and Overflow</h2>
  <p>A whole number stored in a fixed number of bits is called an <strong>integer</strong> type. If every pattern stands for a non-negative number, the type is <strong>unsigned</strong>: 8 bits store 0 to 255 (the <code>uint8</code> used for image pixels), 16 bits 0 to 65,535, 32 bits 0 to about 4.3 billion. But quantities like a refund or a temperature can be negative, so most integer types are <strong>signed</strong>, and they need some way to mark the sign using only bits. The obvious idea, using the first bit as a minus sign, has two problems: it creates two zeros (+0 and −0), and the circuit for adding has to check signs and behave differently for positive and negative numbers.</p>
  <p>Every modern computer uses a cleverer scheme called <strong>two's complement</strong>, in which the leftmost bit counts as a <em>negative</em> place value. In an 8-bit signed integer the place values are −128, 64, 32, 16, 8, 4, 2 and 1, so <code>10000000</code> is −128, and <code>11111111</code> is −128 + 127 = −1. Think of a car's odometer that shows only three digits: driving one kilometre backwards from 000 makes it roll to 999, so 999 behaves like −1. Two's complement does the same thing in binary. The handy recipe for writing a negative number is: take the positive number's bits, flip every bit, and add 1.</p>
  <div class="fx" data-lang="py">def bits8(x):
    """The 8 bits a signed 8-bit integer uses for x (two's complement)."""
    return format(x &amp; 0xFF, "08b")

for x in (5, 1, 0, -1, -5, 127, -128):
    print(f"{x:5} -&gt; {bits8(x)}")

# The two's complement recipe for -5: flip the bits of 5, then add 1
five = 0b00000101
flipped = ~five &amp; 0xFF
print("flip 5 :", format(flipped, "08b"))
print("add 1  :", format(flipped + 1, "08b"))</div>
  <div class="fx" data-lang="text">    5 -&gt; 00000101
    1 -&gt; 00000001
    0 -&gt; 00000000
   -1 -&gt; 11111111
   -5 -&gt; 11111011
  127 -&gt; 01111111
 -128 -&gt; 10000000
flip 5 : 11111010
add 1  : 11111011</div>
  <p>The table shows the patterns: positive numbers look like ordinary binary with a leading 0, −1 is all ones, and the range runs from −128 (<code>10000000</code>) to 127 (<code>01111111</code>). The last two lines apply the recipe to −5: flipping <code>00000101</code> gives <code>11111010</code>, adding 1 gives <code>11111011</code>, exactly the pattern Python reported for −5. The beauty of the scheme is that the CPU's ordinary addition circuit now works for negative numbers without any special case: 5 + (−5) in binary is <code>00000101</code> + <code>11111011</code> = <code>1 00000000</code>, and the carried 1 falls off the end of the byte, leaving 0. There is also only one zero. A signed <em>n</em>-bit integer therefore covers −2<sup><em>n</em>−1</sup> to 2<sup><em>n</em>−1</sup> − 1: int8 is −128 to 127, int32 is about ±2.1 billion, int64 about ±9.2 × 10<sup>18</sup>.</p>
  <p>Now the problem the fixed size creates. What happens when a result needs more bits than the type has? The extra bits are simply lost, and the value <strong>overflows</strong>: it wraps round to the other end of the range, like the odometer rolling from 999 to 000. NumPy and pandas use fixed-size integers, because they store millions of values packed side by side in memory, so they are exposed to this:</p>
  <div class="fx" data-lang="py">import numpy as np

qty = np.array([100, 120, 127], dtype=np.int8)     # 1 byte each: -128..127
print(qty + 1)                                      # 127 + 1 wraps round

print(np.iinfo(np.int8))
print(np.iinfo(np.int32).max, np.iinfo(np.int64).max)

paise = np.array([2_000_000_000], dtype=np.int32)  # ₹2 crore in paise
print(paise + paise)                                # silently wrong

print(2_000_000_000 + 2_000_000_000)               # plain Python int: fine
print(2 ** 100)                                     # Python ints grow as needed</div>
  <div class="fx" data-lang="text">[ 101  121 -128]
Machine parameters for int8
---------------------------------------------------------------
min = -128
max = 127
---------------------------------------------------------------

2147483647 9223372036854775807
[-294967296]
4000000000
1267650600228229401496703205376</div>
  <p>In the first line, 100 + 1 and 120 + 1 are fine, but 127 + 1 does not fit in an int8, so it wraps to −128, with no error. <code>np.iinfo</code> reports each type's range. The next result is more dangerous because the numbers look ordinary: 2 billion paise (₹2 crore) stored as int32, doubled, should be 4 billion, but int32 stops at 2,147,483,647, so the answer wraps to −294,967,296. Real systems have been broken by exactly this, from YouTube's view counter (which had to be widened when a video passed 2,147,483,647 views) to the "year 2038 problem" in which 32-bit timestamps, counting seconds since 1970, run out in January 2038. Plain Python integers behave differently: they are not fixed-size, and Python adds more bytes as a number grows, so <code>2_000_000_000 + 2_000_000_000</code> is simply correct and <code>2 ** 100</code> prints all 31 digits. The price is speed and memory, which is why NumPy does not use them (see <a class="xref" data-note="py_values">Values, Types &amp; Variables</a> and <a class="xref" data-note="da_numpy">NumPy</a>).</p>
  <p>One more detail matters once a value takes more than one byte: in which order are those bytes placed in memory? Writing 0x12345678 as four bytes, a <strong>big-endian</strong> machine stores the "big end" first, <code>12 34 56 78</code>, the way we write numbers; a <strong>little-endian</strong> machine stores the little end first, <code>78 56 34 12</code>. The names come from <em>Gulliver's Travels</em>, where two nations go to war over which end of a boiled egg to crack. x86 and ARM (in the mode every common operating system uses) are little-endian, which is what <code>lscpu</code> meant by "Byte Order: Little Endian" in <a class="xref" data-note="cf_computer">How a Computer Works</a>, while network protocols send numbers big-endian ("network byte order"). It only matters when raw bytes cross between systems, such as parsing a binary file format or a network packet, and it is why functions that turn numbers into bytes make you choose:</p>
  <div class="fx" data-lang="py">import sys

n = 0x12345678
print(sys.byteorder)
print("big    :", n.to_bytes(4, "big").hex(" "))
print("little :", n.to_bytes(4, "little").hex(" "))
print(int.from_bytes(bytes.fromhex("78 56 34 12"), "little") == n)</div>
  <div class="fx" data-lang="text">little
big    : 12 34 56 78
little : 78 56 34 12
True</div>

  <h2 id="cfd-float"><span class="num">05</span>Floating Point</h2>
  <p>The chai stall's price is not a whole number, and neither are model weights, probabilities or averages. Storing fractions in a fixed number of bits needs a different scheme, and it must cope with both enormous numbers (the distance to a star) and tiny ones (the mass of an electron). Scientists solved the same problem on paper long ago with <strong>scientific notation</strong>: instead of writing 0.000000000000000000000000000000911, they write 9.11 × 10<sup>−31</sup>, a few significant digits plus a power of ten that says where the decimal point goes. The point "floats" to wherever it is needed, hence the name.</p>
  <p>A <strong>floating-point number</strong> is scientific notation in binary: a value stored as a sign, a fraction (the significant digits, also called the mantissa or significand) and an exponent, meaning ± 1.fraction × 2<sup>exponent</sup>. The exact layout is fixed by a standard called <strong>IEEE 754</strong>, used by every modern CPU and GPU, so a float means the same thing everywhere. A 64-bit float, Python's <code>float</code> and NumPy's <code>float64</code>, splits its bits into 1 sign bit, 11 exponent bits and 52 fraction bits:</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
<rect x="20" y="30" width="36" height="40" class="fr sr"/><text x="38" y="55" text-anchor="middle" font-size="11">±</text>
<rect x="56" y="30" width="150" height="40" class="fb sb"/><text x="131" y="55" text-anchor="middle" font-size="11">exponent</text>
<rect x="206" y="30" width="374" height="40" class="fg sg"/><text x="393" y="55" text-anchor="middle" font-size="11">fraction (significant digits)</text>
<text x="38" y="22" text-anchor="middle" class="tm" font-size="10">1 bit</text><text x="131" y="22" text-anchor="middle" class="tm" font-size="10">11 bits</text><text x="393" y="22" text-anchor="middle" class="tm" font-size="10">52 bits</text>
<text x="300" y="96" text-anchor="middle" font-size="11">value = ± 1.fraction × 2^(exponent − 1023)</text>
</svg><figcaption>The 64 bits of a float64. The exponent decides how big the number is (range); the 52 fraction bits decide how many significant digits it keeps (precision), about 15 to 17 decimal digits.</figcaption></figure>
  <p>The exponent is stored with an offset (1023 is added, so that negative exponents need no sign of their own), and the leading "1." of the fraction is not stored at all, because in binary scientific notation the first significant digit is always 1. Here are three real floats pulled apart into their three fields:</p>
  <div class="fx" data-lang="py">import struct

def float_bits(x):
    """Split a float64 into its sign, exponent and fraction bits."""
    b = format(struct.unpack("&gt;Q", struct.pack("&gt;d", x))[0], "064b")
    return b[0], b[1:12], b[12:]

for x in (1.0, -2.5, 0.1):
    s, e, f = float_bits(x)
    print(f"{x:5}: sign {s} | exponent {e} ({int(e, 2) - 1023:+d}) | fraction {f[:20]}...")</div>
  <div class="fx" data-lang="text">  1.0: sign 0 | exponent 01111111111 (+0) | fraction 00000000000000000000...
 -2.5: sign 1 | exponent 10000000000 (+1) | fraction 01000000000000000000...
  0.1: sign 0 | exponent 01111111011 (-4) | fraction 10011001100110011001...</div>
  <p>1.0 is +1.0 × 2<sup>0</sup>: sign 0, exponent 0, fraction all zeros. −2.5 is −1.25 × 2<sup>1</sup>: sign 1, exponent +1, and the fraction <code>01</code> means 0 halves plus 1 quarter, so 1.25. Now look at 0.1. Its exponent is −4 (0.1 = 1.6 × 2<sup>−4</sup>), and its fraction is <code>1001 1001 1001…</code>, a pattern that repeats for ever. Just as 1/3 in decimal is 0.3333… and can never be written exactly with a finite number of digits, 1/10 in binary is a repeating fraction, because 10 contains the factor 5, which binary cannot divide by. With only 52 bits available, the pattern has to be cut off and rounded, so the float called 0.1 is not exactly one tenth.</p>
  <p>That single fact explains the most famous surprise in programming:</p>
  <div class="fx" data-lang="py">from decimal import Decimal
import math

price = 0.1 + 0.2
print(price)
print(price == 0.3)
print(Decimal(0.1))                       # the exact value actually stored for 0.1
print(math.isclose(price, 0.3))           # the right way to compare floats
print(round(price, 2) == 0.3)
print(Decimal("0.1") + Decimal("0.2"))    # exact decimal arithmetic, for money</div>
  <div class="fx" data-lang="text">0.30000000000000004
False
0.1000000000000000055511151231257827021181583404541015625
True
True
0.3</div>
  <p><code>Decimal(0.1)</code> reveals the value Python actually stores for 0.1: slightly more than a tenth, 0.1000000000000000055511…. The stored 0.2 is also slightly off, and when the two rounded values are added the tiny errors combine into 0.30000000000000004, which is a different float from the one closest to 0.3, so <code>==</code> says <code>False</code>. This is not a Python bug; every language that uses IEEE 754 floats, including JavaScript, Java, C and SQL's <code>FLOAT</code> type, gives the same answer. The correct way to compare floats is with a tolerance, <code>math.isclose</code> (or <code>np.isclose</code> for arrays, which is also how tests compare model outputs), or by rounding first. For money, where every paisa must be exact, either store whole paise as integers or use <code>Decimal</code> with values created from strings, as the last line shows; databases offer the same thing as <code>DECIMAL</code>/<code>NUMERIC</code> columns.</p>
  <p>IEEE 754 also reserves some bit patterns for special values. <code>inf</code> and <code>-inf</code> (infinity) are produced when a result is too large for the type, and <code>nan</code> ("not a number") when a result is undefined, such as 0/0 or the square root of −1. NaN has the odd property that it is not equal to anything, not even itself, which is why pandas uses <code>isna()</code> rather than <code>== np.nan</code>, and why a single NaN in a training batch can spread through every weight of a neural network.</p>

  <h2 id="cfd-mlfloat"><span class="num">06</span>Float Precision in Machine Learning</h2>
  <p>The number of bits in a float is a trade-off. More exponent bits give a wider <strong>range</strong> (how big and how small numbers can get); more fraction bits give more <strong>precision</strong> (how many significant digits survive). Fewer bits in total means each number takes less memory, more numbers fit through the memory bus per second, and the hardware can do more calculations per second; a GPU typically does float16 maths several times faster than float32, and float64 much more slowly. Python's own <code>float</code> is always 64-bit, but NumPy and deep-learning libraries let you choose. Think of it like a map: a 1:1,000 street map shows every house but needs many sheets for a whole country, while a 1:1,000,000 map shows the whole country on one sheet but no houses. Both are useful; you pick the scale for the job.</p>
  <div class="fx" data-lang="py">import numpy as np

print(f"{'dtype':8} {'bytes':&gt;5} {'digits':&gt;6} {'largest':&gt;12}")
for t in (np.float64, np.float32, np.float16):
    fi = np.finfo(t)
    print(f"{t.__name__:8} {fi.bits // 8:5} {fi.precision:6} {float(fi.max):12.4g}")

print(np.float32(16_777_217))             # float32 cannot hold every integer above 2**24
with np.errstate(over="ignore"):
    print(np.float16(70_000))             # beyond float16's range: infinity
for t in (np.float16, np.float32, np.float64):
    print(f"0.1 stored as {t.__name__:7}: {float(t(0.1)):.12f}")

def to_bfloat16(x):
    """bfloat16 = the top 16 bits of a float32 (truncated)."""
    bits = np.array([x], dtype=np.float32).view(np.uint32) &amp; 0xFFFF0000
    return float(bits.view(np.float32)[0])

for x in (0.1, 3.14159, 70_000.0, 1e38):
    print(f"bfloat16({x}) ~ {to_bfloat16(x):.6g}")</div>
  <div class="fx" data-lang="text">dtype    bytes digits      largest
float64      8     15   1.798e+308
float32      4      6    3.403e+38
float16      2      3     6.55e+04
1.6777216e+07
inf
0.1 stored as float16: 0.099975585938
0.1 stored as float32: 0.100000001490
0.1 stored as float64: 0.100000000000
bfloat16(0.1) ~ 0.0996094
bfloat16(3.14159) ~ 3.14062
bfloat16(70000.0) ~ 69632
bfloat16(1e+38) ~ 9.96921e+37</div>
  <p>The table at the top comes from <code>np.finfo</code>: float64 keeps about 15 significant decimal digits and reaches 10<sup>308</sup>; <strong>float32</strong> (1 sign, 8 exponent and 23 fraction bits) keeps about 6 to 7 digits and reaches 3.4 × 10<sup>38</sup>; <strong>float16</strong> (1, 5 and 10 bits) keeps only about 3 digits, and its largest value is 65,504. The next lines show what those limits mean. float32 cannot store 16,777,217 (2<sup>24</sup> + 1); it rounds to 16,777,216, because above 2<sup>24</sup> its 24 bits of precision cannot represent every whole number, which matters if you store large IDs in a float column. 70,000 is beyond float16's range and becomes infinity. And 0.1 is stored as 0.09997… in float16 and 0.1000000015 in float32, slightly different approximations of the same value, getting closer with more bits.</p>
  <p>For machine learning these differences decide real choices. NumPy and pandas default to float64, which is more precision than any model needs; PyTorch and TensorFlow default to float32, the standard for training. To go faster and fit bigger models, modern training uses <strong>mixed precision</strong>: most calculations run in a 16-bit type while a float32 master copy of the weights is kept for the updates, so small changes are not rounded away. Plain float16 has a problem here: its range is so small that tiny gradients round to zero (called <strong>underflow</strong>) and large values overflow to infinity, so training needs a trick called loss scaling to keep values inside the range. Google designed <strong>bfloat16</strong> ("brain float", from Google Brain) to avoid this. It keeps float32's 8 exponent bits, so it has the same huge range, and gives up precision instead, with only 7 fraction bits; it is essentially the top 16 bits of a float32, which is how the code above imitates it (real conversions round rather than cut off, so the last digit can differ). The last four lines show the trade: 0.1 becomes 0.0996 and π becomes 3.1406, only two or three correct digits, but 10<sup>38</sup> is still representable where float16 overflowed at 65,504. Neural networks turn out to tolerate low precision well but hate overflow, which is why bfloat16 is now the usual training type on TPUs and recent NVIDIA GPUs. Going further still, <strong>quantization</strong> stores a trained model's weights as 8-bit or even 4-bit integers to run large language models on smaller hardware (see <a class="xref" data-note="dl_pytorch">PyTorch</a> and <a class="xref" data-note="finetuning">Fine-Tuning</a>).</p>

  <h2 id="cfd-text"><span class="num">07</span>Text: ASCII, Unicode and UTF-8</h2>
  <p>The customer's name and city are text, and text is stored by giving every character a number and then storing the numbers. The first widely used agreement was <strong>ASCII</strong> (American Standard Code for Information Interchange, 1963). It assigns the numbers 0 to 127 to the English letters, digits, punctuation and some control codes such as "new line", so <code>A</code> is 65, <code>a</code> is 97 and the digit <code>0</code> is 48. That fits in 7 bits, so each character takes one byte. ASCII was fine for American English but had no room for é, ₹, Hindi, Chinese or anything else, so countries invented hundreds of incompatible extensions that used the values 128 to 255 for their own letters, such as Latin-1 for Western Europe and Windows-1252 (cp1252) used by older Windows and Excel. A file written in one could not be read correctly in another.</p>
  <p><strong>Unicode</strong> fixed this by creating one single numbering for every character in every writing system: Latin, Devanagari, Chinese, Arabic, mathematical symbols and emoji, about 150,000 characters so far, with room for over a million. Each character gets a number called its <strong>code point</strong>, written like U+091A. Unicode is a giant catalogue of characters and their numbers, like a library catalogue that gives every book in the world a unique ID. But a catalogue number is not yet bytes: you still need a rule for writing code points into bytes, and that rule is the encoding. The dominant one is <strong>UTF-8</strong>, used by about 98 percent of web pages and the default in Python, Linux and most modern tools. UTF-8 uses a variable number of bytes per character: code points 0 to 127 (exactly ASCII) take one byte, so every ASCII file is already valid UTF-8; most European and Middle Eastern letters take two bytes; most other scripts, including Hindi, take three; and emoji and rarer characters take four.</p>
  <div class="fx" data-lang="py">print(ord("A"), chr(65), "A".encode("ascii"))
print(hex(ord("च")), hex(ord("😀")))         # Unicode code points

for s in ["chai", "café", "चाय", "☕", "😀"]:
    b = s.encode("utf-8")
    print(f"{s!r:8} {len(s)} chars -&gt; {len(b)} bytes: {b.hex(' ')}")</div>
  <div class="fx" data-lang="text">65 A b'A'
0x91a 0x1f600
'chai'   4 chars -&gt; 4 bytes: 63 68 61 69
'café'   4 chars -&gt; 5 bytes: 63 61 66 c3 a9
'चाय'    3 chars -&gt; 9 bytes: e0 a4 9a e0 a4 be e0 a4 af
'☕'      1 chars -&gt; 3 bytes: e2 98 95
'😀'      1 chars -&gt; 4 bytes: f0 9f 98 80</div>
  <p><code>ord</code> gives a character's code point and <code>chr</code> goes back, so <code>A</code> is 65 as in ASCII; च is 0x91A (U+091A) and 😀 is 0x1F600. The table shows what UTF-8 does with them. "chai" is 4 characters and 4 bytes, identical to ASCII. "café" is 4 characters but 5 bytes, because é takes two (<code>c3 a9</code>). "चाय" is 3 code points in Python (च, the vowel sign ा, and य) and 9 bytes, three each. ☕ takes 3 bytes and 😀 takes 4. So in Python, <code>len()</code> of a <code>str</code> counts code points, not bytes and not what a reader would call letters; the byte count is <code>len(s.encode("utf-8"))</code>. That difference matters for database columns sized in bytes, API payload limits, and for language models, whose tokenizers work on UTF-8 bytes, which is part of why Hindi text costs more tokens than the same sentence in English (see <a class="xref" data-note="nlp">NLP Foundations</a>).</p>
  <p>Python 3 keeps the two ideas strictly apart: a <code>str</code> is a sequence of Unicode characters, a <code>bytes</code> is a sequence of raw bytes, and you move between them with <code>.encode()</code> and <code>.decode()</code>, naming the encoding. Problems appear when bytes are decoded with a different encoding from the one used to write them. Either the decoder finds byte patterns that are invalid for it and raises an error, or, worse, they happen to be valid and it silently produces the wrong characters, which is called <strong>mojibake</strong> (Japanese for "character transformation"):</p>
  <div class="fx" data-lang="py">raw = "café चाय".encode("utf-8")              # bytes as saved by a UTF-8 program

print(raw.decode("utf-8"))                     # read with the right encoding
print(raw.decode("cp1252"))                    # read as Windows-1252: mojibake

try:
    "चाय".encode("ascii")
except UnicodeEncodeError as e:
    print("UnicodeEncodeError:", e)
try:
    b"caf\xe9".decode("utf-8")                 # Latin-1 bytes read as UTF-8
except UnicodeDecodeError as e:
    print("UnicodeDecodeError:", e)</div>
  <div class="fx" data-lang="text">café चाय
cafÃ© à¤šà¤¾à¤¯
UnicodeEncodeError: 'ascii' codec can't encode characters in position 0-2: ordinal not in range(128)
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xe9 in position 3: unexpected end of data</div>
  <p>The same bytes, read as UTF-8, give back "café चाय". Read as Windows-1252, each byte is taken as one character, so é's two bytes <code>c3 a9</code> become "Ã©" and the Hindi becomes a row of accented Latin letters. That is exactly what you see when a UTF-8 CSV is opened in an old Excel, or a web page declares the wrong encoding. The last two lines show the error cases: ASCII cannot encode Hindi at all, and the byte <code>0xe9</code>, which is é in Latin-1, is not valid on its own in UTF-8, so decoding fails. The cure is always the same: know the encoding of every file you read and write, and say it explicitly, as in <code>open(path, encoding="utf-8")</code> and <code>pd.read_csv(path, encoding="cp1252")</code> (more in <a class="xref" data-note="py_strings">Strings</a> and <a class="xref" data-note="py_files">Files &amp; Data Formats</a>).</p>

  <h2 id="cfd-media"><span class="num">08</span>Images, Audio and Video as Numbers</h2>
  <p>The photo of the receipt is also just numbers, once you see how. A digital image is a grid of tiny coloured squares called <strong>pixels</strong> (picture elements), like a mosaic made of small tiles. Each pixel's colour is stored as three numbers, the amounts of <strong>red, green and blue</strong> light (RGB), because screens make every colour by mixing those three. Each amount is usually one byte, 0 to 255, so a pixel takes 3 bytes and there are 256<sup>3</sup>, about 16.7 million, possible colours. Pure red is (255, 0, 0), white is (255, 255, 255), black is (0, 0, 0). A greyscale image needs only one byte per pixel, and images with transparency add a fourth "alpha" byte (RGBA). In Python an image is naturally a 3-D NumPy array of shape (height, width, 3) with dtype <code>uint8</code>, which is exactly what libraries like Pillow and OpenCV give you:</p>
  <div class="fx" data-lang="py">import numpy as np

# A 2 x 3 image: every pixel is three bytes (red, green, blue), 0..255
img = np.array([[[255, 0, 0], [0, 255, 0], [0, 0, 255]],
                [[255, 255, 255], [0, 0, 0], [200, 120, 40]]], dtype=np.uint8)
print(img.shape, img.dtype, img.nbytes, "bytes")
print("top-left pixel (pure red):", img[0, 0])

w, h = 1920, 1080
print(f"one Full-HD frame: {w * h * 3:,} bytes = {w * h * 3 / 1e6:.1f} MB")
print(f"1 minute of 30 fps video, uncompressed: {w * h * 3 * 30 * 60 / 1e9:.1f} GB")

rate = 44_100                                   # samples per second (CD quality)
t = np.arange(8) / rate
samples = np.round(np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
print("first samples of a 440 Hz tone:", samples)
print(f"1 minute of stereo 16-bit audio: {rate * 2 * 2 * 60 / 1e6:.1f} MB")</div>
  <div class="fx" data-lang="text">(2, 3, 3) uint8 18 bytes
top-left pixel (pure red): [255   0   0]
one Full-HD frame: 6,220,800 bytes = 6.2 MB
1 minute of 30 fps video, uncompressed: 11.2 GB
first samples of a 440 Hz tone: [    0  2053  4098  6126  8131 10103 12036 13922]
1 minute of stereo 16-bit audio: 10.6 MB</div>
  <p>The tiny 2 × 3 image is an array of shape <code>(2, 3, 3)</code>, 6 pixels of 3 bytes, 18 bytes in all, and its top-left pixel is <code>[255 0 0]</code>, pure red. Scale that up and the numbers become serious: one Full-HD frame of 1920 × 1080 pixels is 6.2 MB, and a minute of video at 30 frames per second would be 11.2 GB if stored raw. That is why files are <strong>compressed</strong>. PNG compresses without losing anything (<em>lossless</em>), while JPEG for photos and H.264 or H.265 for video throw away detail the eye barely notices (<em>lossy</em>), shrinking video by a factor of a hundred or more. A video is simply a sequence of frames shown quickly, plus an audio track, and a model that "watches" video works on decoded frames, arrays of pixels.</p>
  <p>Sound is a wave of air pressure, and it is stored by measuring the wave's height many times per second, each measurement being one <strong>sample</strong>, like the frames of a film but for sound. The number of samples per second is the <strong>sample rate</strong>: music CDs use 44,100 per second (44.1 kHz), enough to capture everything the human ear can hear, while speech models such as Whisper work at 16 kHz. Each sample is usually a 16-bit signed integer, from −32,768 to 32,767. The code generated the first eight samples of a 440 Hz tone (the note A), rising from 0 as the wave starts upwards; at CD quality with two stereo channels, one minute is 10.6 MB before compression, which is why MP3 and AAC exist. In deep learning, images are usually converted from <code>uint8</code> 0–255 to float32 values between 0 and 1 and rearranged into the layout the framework expects, and audio is often turned into a spectrogram, an image of which frequencies are loud at each moment, before a model sees it (see <a class="xref" data-note="dl_cnns">CNNs</a>).</p>

  <h2 id="cfd-dtype"><span class="num">09</span>Choosing Data Types in pandas</h2>
  <p>Now put everything together with a million chai-stall orders in a DataFrame, which is a normal size for real work. Every pandas column has a <strong>dtype</strong> (data type), which decides how each value is encoded as bits and therefore how many bytes it takes and what range it can hold. Because a NumPy-backed column stores its values packed side by side, its memory is roughly the number of rows times the bytes per value, so the dtype directly multiplies your memory use. pandas picks safe, generous defaults when it creates or reads data: 64-bit integers, 64-bit floats, and a Python-style string type for text. Those defaults are rarely the right fit:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
n = 1_000_000                                   # a million chai-stall orders
orders = pd.DataFrame({
    "qty":   rng.integers(1, 20, n),
    "price": rng.random(n) * 100,
    "city":  rng.choice(["Pune", "Delhi", "Chennai"], n),
})

def report(df):
    mem = df.memory_usage(deep=True, index=False) / 1e6
    for col in df.columns:
        print(f"  {col:6} {str(df[col].dtype):9} {mem[col]:5.1f} MB")
    print(f"  total            {mem.sum():5.1f} MB")

print("default dtypes:")
report(orders)

small = orders.astype({"qty": "int8", "price": "float32", "city": "category"})
print("chosen dtypes:")
report(small)</div>
  <div class="fx" data-lang="text">default dtypes:
  qty    int64       8.0 MB
  price  float64     8.0 MB
  city   str        54.3 MB
  total             70.3 MB
chosen dtypes:
  qty    int8        1.0 MB
  price  float32     4.0 MB
  city   category    1.0 MB
  total              6.0 MB</div>
  <p>With the defaults, <code>qty</code> and <code>price</code> take 8 bytes per row each, 8 MB per million rows, and the <code>city</code> text column dominates at 54 MB, because every row stores its own copy of a string like "Chennai" plus the overhead of a separate object. (This is pandas 3, where text gets the <code>str</code> dtype; older versions show <code>object</code>, which behaves the same way.) Now apply what this note has covered. Quantities are between 1 and 19, so <code>int8</code>, range −128 to 127, holds them in 1 byte instead of 8. Prices need about 2 decimal places, and float32's 6–7 significant digits are plenty, so it halves that column. And the city column has only three different values, so the <strong>category</strong> dtype stores each distinct string once and replaces every row with a small integer code pointing at it, 1 byte per row here. The total drops from 70.3 MB to 6.0 MB, more than ten times smaller, with the same information.</p>
  <p>Smaller columns are not just about fitting in RAM. They also make operations faster, because less data has to travel from memory to the CPU, and they cut the size of files and network transfers. The same thinking applies across data tools: you can set dtypes while reading with <code>pd.read_csv(..., dtype={"qty": "int8", "city": "category"})</code>, shrink numeric columns safely with <code>pd.to_numeric(col, downcast="integer")</code>, and save to Parquet, which remembers the dtypes and compresses columns, instead of CSV, which stores every number as text and forgets the types (see <a class="xref" data-note="da_pandas">The Map: Pandas</a> and <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>). Spark, SQL databases and PyTorch all ask the same question of each column: how many bits does this value really need? The only rule is to choose a type whose range and precision fit the data with room to spare, because the cost of choosing too small is the silent overflow from section 04.</p>

  <h2 id="cfd-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common mistake is comparing floats with <code>==</code>. Rounding errors accumulate as values are combined, so two calculations that should give the same answer often differ in the last bit:</p>
  <div class="fx" data-lang="py">import math

total = 0.0
for _ in range(10):                   # ten orders of ₹0.10, added one by one
    total += 0.1
print(total, total == 1.0)            # wrong way to compare
print(math.isclose(total, 1.0))       # right way

print(sum([0.1] * 10) == 1.0)         # sum() compensates for rounding (Python 3.12+)

paise = 0
for _ in range(10):                   # or keep money as whole paise
    paise += 10
print(paise, paise == 100)</div>
  <div class="fx" data-lang="text">0.9999999999999999 False
True
True
100 True</div>
  <p>Adding 0.1 ten times in a loop gives 0.9999999999999999, so <code>== 1.0</code> is <code>False</code>, while <code>math.isclose</code> correctly treats them as equal. Python's built-in <code>sum()</code> happens to return exactly 1.0 here, because since Python 3.12 it uses a compensated summation algorithm that keeps track of lost rounding error; do not rely on that in general, because NumPy, pandas and your own loops do not. Integers, such as an amount in paise, add exactly.</p>
  <p>The second is choosing a dtype that is too small and then doing arithmetic that leaves its range. Downcasting to save memory is good practice, but the result of an operation keeps the small type, and overflow happens silently:</p>
  <div class="fx" data-lang="py">import pandas as pd

orders = pd.DataFrame({"qty": [13, 40, 90]}).astype("int8")   # saved memory...
orders["cups_x2"] = orders["qty"] * 2                          # ...but 90 * 2 = 180 &gt; 127
print(orders)

orders["cups_x2"] = orders["qty"].astype("int16") * 2          # widen before the maths
print(orders["cups_x2"].tolist())</div>
  <div class="fx" data-lang="text">   qty  cups_x2
0   13       26
1   40       80
2   90      -76
[26, 80, 180]</div>
  <p>90 × 2 should be 180, but 180 does not fit in an int8, so it wrapped to −76 without any warning. Widening the column (here to int16) before the arithmetic gives the right answers. The rule of thumb: keep small types for storage, and widen before multiplying, summing large counts, or computing anything that can grow.</p>
  <p>The third is reading a file without knowing its encoding. pandas and Python assume UTF-8, and a file saved by older Windows software is often cp1252:</p>
  <div class="fx" data-lang="py">import pandas as pd

with open("orders_excel.csv", "w", encoding="cp1252") as f:   # as an old Excel might save it
    f.write("customer,city\nRené,Pune\n")

try:
    pd.read_csv("orders_excel.csv")                              # pandas assumes UTF-8
except UnicodeDecodeError as e:
    print("UnicodeDecodeError:", e)

print(pd.read_csv("orders_excel.csv", encoding="cp1252"))      # say what it really is</div>
  <div class="fx" data-lang="text">UnicodeDecodeError: 'utf-8' codec can't decode byte 0xe9 in position 17: invalid continuation byte
  customer  city
0     René  Pune</div>
  <p>The default read fails because byte <code>0xe9</code> (é in cp1252) is not valid UTF-8 at that position; naming the real encoding reads "René" correctly. Avoid the temptation to "fix" the error with <code>encoding="latin-1"</code> on everything: Latin-1 accepts any byte, so it never raises an error, but it quietly produces mojibake when the file was actually UTF-8. When you write files that Excel users will open, <code>encoding="utf-8-sig"</code> adds a small marker that tells Excel the file is UTF-8.</p>
  <p>A few more mistakes come from the same root. Storing money as float, which rounds; use integer paise or <code>Decimal</code>. Treating <code>len()</code> of a string as its size in bytes, which is only true for ASCII. Storing long IDs such as phone numbers or 19-digit order IDs in a float column, where they lose their last digits (pandas does this automatically if an integer column contains a missing value, unless you use the nullable <code>Int64</code> dtype); read IDs as strings. And mixing up GB and GiB, or bits and bytes, when sizing disks, memory limits or network transfers.</p>

  <h2 id="cfd-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Units</h3>
  <table class="tbl">
    <tr><th>Unit</th><th>Decimal (SI)</th><th>Binary (IEC)</th><th>Difference</th></tr>
    <tr><td>kilo</td><td>KB = 1,000 B</td><td>KiB = 1,024 B</td><td>2.4%</td></tr>
    <tr><td>mega</td><td>MB = 10<sup>6</sup> B</td><td>MiB = 1,024<sup>2</sup> B</td><td>4.9%</td></tr>
    <tr><td>giga</td><td>GB = 10<sup>9</sup> B</td><td>GiB = 1,024<sup>3</sup> B</td><td>7.4%</td></tr>
    <tr><td>tera</td><td>TB = 10<sup>12</sup> B</td><td>TiB = 1,024<sup>4</sup> B</td><td>10%</td></tr>
  </table>
  <ul>
    <li><b>Bit</b> = 0/1; <b>byte</b> = 8 bits = 256 values; <em>n</em> bits = 2<sup><em>n</em></sup> patterns.</li>
    <li>1 TB disk = 931 GiB. Network speeds are in bits: 100 Mbps = 12.5 MB/s.</li>
  </ul>
  <h3>Number systems</h3>
  <ul>
    <li><b>Binary</b> place values 128 64 32 16 8 4 2 1; decimal → binary: divide by 2, read remainders bottom-up.</li>
    <li><b>Hex</b>: digits 0–9, A–F; one hex digit = 4 bits; one byte = 2 hex digits (200 = <code>0xC8</code> = <code>0b11001000</code>).</li>
  </ul>
  <h3>Integer and float types</h3>
  <table class="tbl">
    <tr><th>Type</th><th>Bytes</th><th>Range / precision</th><th>Typical use</th></tr>
    <tr><td>uint8</td><td>1</td><td>0 … 255</td><td>image pixels</td></tr>
    <tr><td>int8</td><td>1</td><td>−128 … 127</td><td>small counts, quantized weights</td></tr>
    <tr><td>int16</td><td>2</td><td>−32,768 … 32,767</td><td>audio samples</td></tr>
    <tr><td>int32</td><td>4</td><td>about ±2.1 × 10<sup>9</sup></td><td>IDs, counts</td></tr>
    <tr><td>int64</td><td>8</td><td>about ±9.2 × 10<sup>18</sup></td><td>pandas default, timestamps</td></tr>
    <tr><td>float16</td><td>2</td><td>~3 digits, max 65,504</td><td>mixed-precision inference</td></tr>
    <tr><td>bfloat16</td><td>2</td><td>~2–3 digits, max ~3.4 × 10<sup>38</sup></td><td>training on TPUs/modern GPUs</td></tr>
    <tr><td>float32</td><td>4</td><td>~7 digits, max ~3.4 × 10<sup>38</sup></td><td>PyTorch/TensorFlow default</td></tr>
    <tr><td>float64</td><td>8</td><td>~15–17 digits, max ~1.8 × 10<sup>308</sup></td><td>Python float, NumPy/pandas default</td></tr>
  </table>
  <ul>
    <li><b>Two's complement</b>: top bit has negative weight; negate = flip bits, add 1; −1 = all ones.</li>
    <li><b>Overflow</b>: fixed-size ints wrap round silently (int8 127 + 1 = −128). Python <code>int</code> never overflows.</li>
    <li><b>IEEE 754 float64</b>: 1 sign + 11 exponent + 52 fraction bits; 0.1 is a repeating binary fraction, so it is rounded.</li>
    <li>Special floats: <code>inf</code>, <code>-inf</code>, <code>nan</code> (NaN ≠ NaN).</li>
  </ul>
  <h3>Text, media, byte order</h3>
  <ul>
    <li><b>ASCII</b>: 128 characters, 1 byte. <b>Unicode</b>: a code point for every character. <b>UTF-8</b>: 1 byte (ASCII), 2 (é), 3 (Hindi, ☕), 4 (emoji).</li>
    <li><code>len(s)</code> = code points; <code>len(s.encode("utf-8"))</code> = bytes. <b>Mojibake</b> = decoded with the wrong encoding.</li>
    <li>Image = height × width × 3 bytes (RGB, <code>uint8</code>). Audio = sample rate × bytes per sample × channels per second.</li>
    <li><b>Endianness</b>: byte order of multi-byte values; x86/ARM little-endian, network big-endian.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">bin(13), hex(200), int("C8", 16), 0b1101, 0xC8, format(200, "08b")
(5).to_bytes(4, "little"); int.from_bytes(b, "big")
"चाय".encode("utf-8"); raw.decode("cp1252")
open(path, encoding="utf-8")

import math; from decimal import Decimal
math.isclose(0.1 + 0.2, 0.3); Decimal("0.1") + Decimal("0.2")

import numpy as np, pandas as pd
np.iinfo(np.int8); np.finfo(np.float32)
df.memory_usage(deep=True)
df.astype({"qty": "int8", "price": "float32", "city": "category"})
pd.read_csv(path, dtype={"city": "category"}, encoding="utf-8")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Never compare floats with <code>==</code>; use <code>isclose</code>. Never store money as float.</li>
    <li>Small dtypes overflow silently in arithmetic; widen first.</li>
    <li>Always name the encoding when reading/writing text files.</li>
    <li>Large integer IDs in float columns lose digits (float64 is exact only up to 2<sup>53</sup>).</li>
    <li>GB vs GiB, bits vs bytes.</li>
  </ul>

  <h2 id="cfd-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a bit and what is a byte? Why do computers use binary?</summary><div class="qa-body">A bit is a single binary digit, 0 or 1; a byte is 8 bits, giving 256 possible values, and is the smallest addressable unit of memory. Computers use binary because electronic switches distinguish two states (on/off, charged/uncharged) far more reliably and cheaply than ten. Any data can be represented as bit patterns once an encoding is agreed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a 1 TB hard disk show only about 931 GB?</summary><div class="qa-body">The manufacturer uses decimal units: 1 TB = 10<sup>12</sup> bytes. Operating systems such as Windows count in powers of 1,024 but label the result "GB": 10<sup>12</sup> / 1,024<sup>3</sup> ≈ 931. The correct names for the binary units are GiB and TiB. Nothing is missing; the same bytes are measured with a different unit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Convert 200 to binary and hexadecimal.</summary><div class="qa-body">Repeatedly divide by 2 and read the remainders from last to first: 200 = 11001000 (128 + 64 + 8). Group into nibbles, 1100 1000, and convert each to a hex digit: C and 8, so 0xC8. Check: 12 × 16 + 8 = 200.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do programmers use hexadecimal?</summary><div class="qa-body">Because each hex digit corresponds to exactly 4 bits, a byte is exactly two hex digits, so hex is a compact, human-readable view of raw binary that converts by grouping rather than arithmetic. It is used for memory addresses, colours (#FF8800), hashes, UUIDs, and byte dumps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is two's complement and why is it used?</summary><div class="qa-body">It is the standard way to store signed integers: the most significant bit has a negative weight, so in 8 bits the range is −128 to 127, and a number is negated by inverting all bits and adding 1. It is used because there is only one zero and the same addition circuit works for positive and negative numbers with no special cases. −1 is all ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is integer overflow? Can it happen in Python?</summary><div class="qa-body">Overflow happens when a result needs more bits than a fixed-size integer type has; the extra bits are lost and the value wraps round, for example int8 127 + 1 = −128 or int32 2×10<sup>9</sup> + 2×10<sup>9</sup> going negative. Plain Python <code>int</code> has arbitrary precision and never overflows. NumPy arrays, pandas columns, databases and C/Java integers have fixed sizes, so they can overflow, usually silently for arrays.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>0.1 + 0.2 != 0.3</code> in Python?</summary><div class="qa-body">Floats are stored in binary (IEEE 754), and 0.1, 0.2 and 0.3 are repeating fractions in binary, like 1/3 in decimal, so each is rounded to the nearest representable value. The rounding errors of 0.1 and 0.2 add up to 0.30000000000000004, which is a different float from the one nearest 0.3. Compare floats with a tolerance (<code>math.isclose</code>) and use <code>Decimal</code> or integer cents for money.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain how a floating-point number is stored.</summary><div class="qa-body">IEEE 754 stores a sign bit, an exponent and a fraction, meaning ± 1.fraction × 2<sup>exponent</sup>, binary scientific notation. In float64 those are 1, 11 and 52 bits; the exponent sets the range and the fraction the precision (about 15–17 decimal digits). The exponent is stored with a bias (1023) and the leading 1 is implicit. Special patterns represent infinity and NaN.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is NaN and how does it behave?</summary><div class="qa-body">NaN, "not a number", is a special floating-point value produced by undefined operations such as 0/0, and pandas uses it for missing values in float columns. It is not equal to anything, including itself, so <code>x == np.nan</code> is always False; use <code>np.isnan</code> or <code>pd.isna</code>. Any arithmetic involving NaN gives NaN, which is how one bad value can poison a training run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Float32 vs float64: which would you use for a model and why?</summary><div class="qa-body">float32 for deep learning: it has about 7 significant digits, which is ample for weights and gradients, takes half the memory and runs much faster on GPUs; it is the PyTorch default. float64 is used where precision matters, such as scientific computation, some statistics, or accumulating very large sums. NumPy and pandas default to float64, so converting features to float32 often halves memory with no loss in model quality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is bfloat16 and why is it preferred over float16 for training?</summary><div class="qa-body">bfloat16 is a 16-bit float with 8 exponent bits and 7 fraction bits, the top half of a float32. It has the same range as float32 but low precision. float16 has 5 exponent bits, so its range tops out at 65,504 and small gradients underflow to zero, requiring loss scaling; bfloat16 avoids those range problems, and networks tolerate its lower precision, so it is the usual training type on TPUs and modern NVIDIA GPUs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between Unicode and UTF-8?</summary><div class="qa-body">Unicode is a character set: it assigns a unique number, a code point, to every character in every script (A = U+0041, च = U+091A). UTF-8 is an encoding: a rule for storing those code points as bytes, using 1 byte for ASCII, 2 for most European letters, 3 for most other scripts and 4 for emoji. UTF-16 and UTF-32 are other encodings of the same code points.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is UTF-8 the most popular encoding?</summary><div class="qa-body">It is backward compatible with ASCII, so existing English text and tools work unchanged, and it is compact for text that is mostly ASCII. It can represent every Unicode character, has no byte-order issues, and its byte patterns are self-synchronising, so a decoder can find where characters start. It is the default for the web, Linux, JSON and Python source code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>len("चाय")</code> return in Python, and how many bytes is it?</summary><div class="qa-body"><code>len</code> returns 3, because a Python <code>str</code> counts Unicode code points: च, the vowel sign ा and य. Encoded as UTF-8 it is 9 bytes, 3 per character, as <code>len("चाय".encode("utf-8"))</code> shows. What a reader perceives as letters (graphemes) can differ from both counts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is mojibake and how do you fix it?</summary><div class="qa-body">Mojibake is garbled text such as "cafÃ©" produced when bytes are decoded with a different encoding from the one used to encode them, here UTF-8 bytes read as Windows-1252. Fix it at the source by reading with the correct encoding (<code>open(..., encoding="utf-8")</code>, <code>pd.read_csv(..., encoding=...)</code>); already-garbled text can sometimes be repaired by re-encoding with the wrong codec and decoding with the right one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is an image stored in memory? How big is an uncompressed Full-HD frame?</summary><div class="qa-body">As a grid of pixels, each with red, green and blue intensities, usually one byte each (0–255), so in NumPy it is a <code>uint8</code> array of shape (height, width, 3). A 1920 × 1080 frame is 1920 × 1080 × 3 = 6,220,800 bytes, about 6.2 MB. That is why formats compress images (PNG losslessly, JPEG lossily) and video.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is endianness?</summary><div class="qa-body">It is the order in which the bytes of a multi-byte value are stored. Big-endian puts the most significant byte first (0x12345678 as 12 34 56 78), little-endian the least significant first (78 56 34 12). x86 and ARM systems are little-endian; network protocols use big-endian. It matters when reading binary files or packets produced on another system.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you reduce the memory used by a large pandas DataFrame?</summary><div class="qa-body">Measure with <code>df.memory_usage(deep=True)</code>, then pick dtypes that fit the data: downcast integers (<code>int8</code>/<code>int16</code>/<code>int32</code>) and floats (<code>float32</code>) where the range and precision allow, convert low-cardinality text columns to <code>category</code>, and parse dates as datetimes. Set dtypes at read time with <code>dtype=</code>, load only needed columns with <code>usecols=</code>, and store data as Parquet. Watch for overflow after downcasting.</div></details>
</main>
`
});
