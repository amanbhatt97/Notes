// notes/softeng/cf_memory.js — Memory: RAM, Cache, Stack & Heap
Object.assign(TOPIC_CONTENT, {
  "cf_memory": `<main>
<h1>Memory: RAM, Cache, Stack &amp; Heap</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>Memory: RAM, Cache, Stack &amp; Heap</span></div>
  <p class="lead">Every value your program works with, every number in a NumPy array, every row of a DataFrame, every weight of a neural network, has to sit somewhere in the computer's memory while the program runs. Memory is not one thing: it is a ladder of storage layers, from tiny and extremely fast to huge and slow, and the speed of your code depends heavily on which layer your data is in. Memory is also where programs most often fail in practice, with "MemoryError", "Killed", "CUDA out of memory" or a server whose memory use creeps up until it crashes. To make all of this concrete, the page follows one small program throughout: a Python script that loads a table of orders from a chain of chai shops and computes totals. We will see where its numbers live, why some ways of reading them are faster than others, how Python creates and frees them, and how to estimate how much memory the whole job needs. Every example was run on this page's Linux machine, which is a virtual machine, so hardware numbers are the VM's.</p>

  <h2 id="cfm-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Memory</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The hierarchy</div>
        <ul>
          <li>Registers → L1/L2/L3 cache → RAM → SSD/HDD</li>
          <li>Each step down: ~10–1000× slower, much bigger, cheaper</li>
          <li>RAM is volatile: contents vanish without power</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Speed</div>
        <ul>
          <li>Cache moves 64-byte <b>lines</b>, not single values</li>
          <li><b>Locality</b>: nearby and recently used data is fast</li>
          <li>NumPy is contiguous; Python lists hold pointers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside a program</div>
        <ul>
          <li><b>Stack</b>: one frame per active function call</li>
          <li><b>Heap</b>: objects created at run time</li>
          <li>Python: reference counting + cycle collector</li>
          <li>Leak = memory still referenced but never used</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The OS and sizing</div>
        <ul>
          <li>Virtual memory: each process sees its own addresses</li>
          <li>Pages (4 KB), page faults, swap, OOM killer</li>
          <li>Estimate: rows × bytes per value; params × bytes</li>
          <li>VRAM is separate, smaller GPU memory</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfm-hier"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Memory Hierarchy</span><span class="rm-sub">why there are several kinds of memory, with real latency numbers</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-ram"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">RAM</span><span class="rm-sub">what it is, why it forgets, how much you have</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-cache"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Cache Memory and Locality</span><span class="rm-sub">why the order you read data in changes the speed</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-addr"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Memory Addresses and Pointers</span><span class="rm-sub">how a program finds a value, and what id() shows</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-stack"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Stack and the Heap</span><span class="rm-sub">call frames, objects, stack overflow, static vs dynamic</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-gc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Garbage Collection</span><span class="rm-sub">how Python frees memory you no longer use</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-leak"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Memory Leaks</span><span class="rm-sub">memory that grows forever, and how to find it</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-vm"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Virtual Memory, Paging and Swap</span><span class="rm-sub">pages, page faults, swap, the OOM killer, fragmentation</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-gpu"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">GPU Memory (VRAM)</span><span class="rm-sub">the GPU's own, separate memory</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-est"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Estimating Memory for Data and Models</span><span class="rm-sub">DataFrames, arrays and model weights</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">shallow sizes, column loops, unbounded caches</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">numbers, definitions, tables</span></div></div>
      <div class="rm-item rm-done" data-target="cfm-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the memory questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="cfm-hier"><span class="num">01</span>The Memory Hierarchy</h2>
  <p>A computer's processor, the <strong>CPU</strong>, is the part that actually does arithmetic: it adds the order amounts, compares them, multiplies them by a tax rate. It can do a simple operation in well under a nanosecond (a billionth of a second). The trouble is that the CPU can only work on values that are right next to it, and the data our script needs, a million order amounts, lives somewhere else. If fetching each amount took longer than adding it, the CPU would spend most of its time waiting. Keeping the CPU fed with data is the central problem that the memory system solves.</p>
  <p>The ideal memory would be huge, instant and cheap, but physics and economics do not allow all three at once. Memory that is extremely fast has to be built from many transistors per bit and placed physically close to the CPU, which makes it expensive and small. Memory that is huge and cheap is slower, and the slowest kinds sit far away on a separate device. So computers use several layers, each one bigger and slower than the one above it. This arrangement is called the <strong>memory hierarchy</strong>: a stack of storage layers in which the small fast layers keep copies of the data the CPU is using right now, and the big slow layers hold everything else.</p>
  <p>Think of a chef in a busy kitchen. The ingredient they are chopping is in their hand. A few things they use constantly are on the counter within arm's reach. More is in the fridge a few steps away, the full stock is in the storeroom down the corridor, and the rest is at a warehouse across town that delivers once a day. The chef works quickly not because everything is close, but because the things needed <em>right now</em> are close, and they keep refilling the counter from the fridge before they run out. A computer works the same way.</p>
  <figure class="viz"><svg viewBox="0 0 620 300" width="620"><defs><marker id="cfm-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
<polygon points="280,20 340,20 376.7,60 243.3,60" class="fr sr"/><text x="310" y="45" text-anchor="middle" font-size="10">Registers</text>
<polygon points="243.3,60 376.7,60 413.3,100 206.7,100" class="fv"/><text x="310" y="85" text-anchor="middle" font-size="11">L1 cache · ~1 ns · KB</text>
<polygon points="206.7,100 413.3,100 450,140 170,140" class="fb"/><text x="310" y="125" text-anchor="middle" font-size="11">L2 cache · ~4 ns · MB</text>
<polygon points="170,140 450,140 486.7,180 133.3,180" class="ft"/><text x="310" y="165" text-anchor="middle" font-size="11">L3 cache · ~15 ns · tens of MB</text>
<polygon points="133.3,180 486.7,180 523.3,220 96.7,220" class="fg"/><text x="310" y="205" text-anchor="middle" font-size="11">RAM · ~100 ns · GBs</text>
<polygon points="96.7,220 523.3,220 560,260 60,260" class="fs"/><text x="310" y="245" text-anchor="middle" font-size="11">SSD ~50 µs / HDD ~5 ms · TBs (survives power off)</text>
<line x1="30" y1="255" x2="30" y2="28" class="sb" stroke-width="1.5" marker-end="url(#cfm-a1)"/>
<text x="40" y="40" font-size="10" class="tb">faster</text><text x="40" y="54" font-size="10" class="tb">smaller</text><text x="40" y="68" font-size="10" class="tb">costlier per byte</text>
<text x="600" y="285" font-size="10" class="tm" text-anchor="end">bigger, slower, cheaper per byte going down</text>
<text x="590" y="55" font-size="10" class="tm" text-anchor="end">inside the CPU chip</text><text x="590" y="165" font-size="10" class="tm" text-anchor="end">(top four layers)</text>
<text x="590" y="205" font-size="10" class="tm" text-anchor="end">separate chips</text>
</svg><figcaption>The memory hierarchy. Each layer down is larger and cheaper per byte, but slower. The CPU only computes on values in its registers; everything else must be copied up the layers first.</figcaption></figure>
  <p>Walk down the picture from the top. <strong>Registers</strong> are a handful of tiny slots inside the CPU itself, each holding one number (64 bits on a modern CPU); the CPU's instructions operate directly on them, like the ingredient in the chef's hand. Below them is <strong>cache memory</strong>, small fast memory built into the CPU chip, in three levels: L1 is the smallest and fastest (tens of kilobytes per core), L2 is bigger and a little slower, and L3 is larger still and shared by all the cores. Then comes <strong>RAM</strong>, the computer's main memory, on separate chips on the motherboard, holding gigabytes. At the bottom is <strong>storage</strong>, the SSD or hard disk, which holds terabytes and, unlike everything above it, keeps its contents when the power is off. Storage has its own page: <a class="xref" data-note="cf_storage">Storage: HDD, SSD &amp; File Systems</a>.</p>
  <p>The differences in speed are enormous, and the numbers are worth remembering. A famous list called "latency numbers every programmer should know" gives approximate times for common operations. <strong>Latency</strong> means the delay before a requested piece of data arrives. The figures below are typical for current hardware, and the right-hand column scales them so that one nanosecond becomes one second, which makes the gaps easier to feel:</p>
  <table class="tbl">
    <tr><th>Operation</th><th>Typical latency</th><th>If 1 ns were 1 second</th></tr>
    <tr><td>CPU does one simple operation on registers</td><td>~0.3 ns</td><td>0.3 seconds</td></tr>
    <tr><td>Read from L1 cache</td><td>~1 ns</td><td>1 second</td></tr>
    <tr><td>Read from L2 cache</td><td>~4 ns</td><td>4 seconds</td></tr>
    <tr><td>Read from L3 cache</td><td>~10–20 ns</td><td>about 15 seconds</td></tr>
    <tr><td>Read from RAM</td><td>~80–100 ns</td><td>about a minute and a half</td></tr>
    <tr><td>Random 4 KB read from an NVMe SSD</td><td>~20–100 µs</td><td>about half a day</td></tr>
    <tr><td>Network round trip inside one data centre</td><td>~0.5 ms</td><td>about 6 days</td></tr>
    <tr><td>Random read from a hard disk (seek)</td><td>~5–10 ms</td><td>about 2–4 months</td></tr>
    <tr><td>Network round trip between continents</td><td>~150 ms</td><td>about 5 years</td></tr>
  </table>
  <p>Read the table as the chef would. If grabbing something from the counter (L1) takes one second, fetching it from the fridge (RAM) takes a minute and a half, getting it from the storeroom (SSD) takes half a day, and the warehouse (a hard disk) takes months. A CPU that needs a value from RAM can do hundreds of operations in the time it waits. This single fact explains a great deal of practical performance advice: why NumPy beats Python loops, why reading a column-oriented file is faster than reading a CSV, why databases keep "hot" data in memory, and why a model that does not fit in GPU memory slows to a crawl.</p>
  <p>The hierarchy works because programs do not use their data randomly. Most programs reuse the same values many times and read data in order, so a small fast layer holding the right copies can serve most requests. The layers between RAM and the CPU are managed automatically by the hardware; you never write code that says "put this in L2". But the way you lay out and walk through your data decides how well the automatic system works, which is what the cache section is about. First, RAM itself.</p>

  <h2 id="cfm-ram"><span class="num">02</span>RAM</h2>
  <p><strong>RAM</strong> stands for Random Access Memory: the computer's main working memory, where the operating system, every running program and all the data those programs are currently using are kept. "Random access" means that any byte can be read in about the same time as any other, whatever its position, unlike a tape or a spinning disk where reaching a far-away spot takes longer. When our script runs <code>pd.read_csv("orders.csv")</code>, the file is read from storage and the resulting DataFrame is built in RAM; every calculation after that works on the copy in RAM.</p>
  <p>Think of RAM as the workbench in a workshop. The tools and materials stored in cupboards (storage) are safe there, but you cannot work on them in the cupboard; you take what you need out onto the bench. A bigger bench lets you work on more things at once, and when you leave at night the bench is cleared. That last point matters: RAM is <strong>volatile</strong>, meaning it loses everything when the power goes off. The common kind of RAM, DRAM (dynamic RAM), stores each bit as a tiny electrical charge in a capacitor, a component that holds charge only briefly. The charge leaks away within milliseconds, so the memory chips constantly re-read and rewrite every bit to keep it alive, a process called refreshing. Without power there is no refreshing and the charges vanish. This is why a program's results must be written to storage to survive a crash or a reboot, and why "I had it in a variable" does not mean it was saved.</p>
  <p>RAM is measured in gigabytes. A laptop typically has 8–32 GB, a data science workstation 64–256 GB, and large cloud servers have a terabyte or more. On Linux you can see how much there is and how it is being used with <code>free -h</code> (the <code>-h</code> means "human-readable units") or by reading the file <code>/proc/meminfo</code>, which the kernel (the core of the operating system) fills in live:</p>
  <div class="fx" data-lang="text">$ free -h
               total        used        free      shared  buff/cache   available
Mem:            15Gi       830Mi        14Gi        12Mi       881Mi        14Gi
Swap:             0B          0B          0B
$ grep -E '^(MemTotal|MemFree|MemAvailable|Cached|SwapTotal)' /proc/meminfo
MemTotal:       16473756 kB
MemFree:        15046052 kB
MemAvailable:   15623148 kB
Cached:           709668 kB
SwapTotal:             0 kB</div>
  <p>This virtual machine has about 15 GiB of RAM (MemTotal is given in kilobytes, 16,473,756 kB). The "used" column is what programs are holding, which is small here. The "buff/cache" column is RAM the operating system is using to keep recently read files, so that reading them again is fast; the OS gives this memory back the moment a program needs it, which is why the most useful number is "available", not "free". Beginners often panic when "free" is low on a long-running server, but if "available" is high, the machine is fine. The "Swap" line is disk space used as overflow when RAM runs out; this machine has none, which we will come back to in the virtual memory section.</p>
  <p>When your data does not fit in RAM, you have three choices: get a machine with more RAM, make the data smaller (better types, fewer columns, as shown at the end of this page), or stop loading it all at once and process it in pieces, either by reading in chunks or by using a tool like Spark that spreads the data over many machines (<a class="xref" data-note="de_spark">Apache Spark</a>). Knowing roughly how big your data is in memory is therefore a basic skill, and it starts with understanding what happens between RAM and the CPU.</p>

  <h2 id="cfm-cache"><span class="num">03</span>Cache Memory and Locality</h2>
  <p>We saw that RAM is roughly a hundred times slower than the CPU's own cache. If the CPU had to go to RAM for every single number, a loop over a million order amounts would spend almost all its time waiting. <strong>Cache memory</strong> is the CPU's own small, fast memory that keeps copies of recently used parts of RAM, so that most reads can be answered without the long trip. We can see this machine's caches with <code>lscpu</code>:</p>
  <div class="fx" data-lang="text">$ lscpu | grep -E 'Model name|L1d|L2|L3'
Model name:                              Intel(R) Xeon(R) Processor @ 2.10GHz
L1d cache:                               192 KiB (4 instances)
L2 cache:                                8 MiB (4 instances)
L3 cache:                                260 MiB (1 instance)
$ getconf LEVEL1_DCACHE_LINESIZE
64</div>
  <p>Each of the four virtual cores has its own L1 data cache and L2 cache, and the L3 cache is shared. (This is a cloud server CPU reporting through a virtual machine, so the L3 figure is unusually large; a laptop typically has 8–32 MB of L3.) The last line is the most important number for understanding performance: <strong>64</strong>. The cache never fetches a single value from RAM. It fetches a whole block of 64 neighbouring bytes, called a <strong>cache line</strong>, because once the slow trip to RAM has been paid for, bringing back the neighbours costs almost nothing extra. A 64-byte line holds eight 8-byte float64 numbers.</p>
  <p>The cache bets on two habits that most programs have, together called <strong>locality of reference</strong>. <strong>Spatial locality</strong> means that if a program reads one address, it will probably soon read the addresses next to it, as a loop over an array does. <strong>Temporal locality</strong> means that if a program used a value recently, it will probably use it again soon, like a running total. When the data the CPU wants is already in the cache, that is a <strong>cache hit</strong>; when it is not and must come from RAM, it is a <strong>cache miss</strong>. CPUs also have a <strong>prefetcher</strong>, a circuit that notices when you are reading memory in a steady pattern and starts fetching the next lines before you ask for them.</p>
  <p>Think of reading a book from a library where you are only allowed to borrow one shelf at a time. If you read the book from page 1 to the end, each trip to the library brings back many pages you are about to read, and a helpful librarian even fetches the next shelf while you are reading. If instead you read one line from page 3, then one line from page 300, then one from page 47, every line needs a new trip, and the rest of each shelf you carried home is wasted. The total amount of reading is the same; the number of trips is completely different.</p>
  <p>The demo below makes this visible with NumPy. A 2-D NumPy array is stored in RAM as one long block of numbers, row after row; this is called <strong>C order</strong> or row-major order. The array's <code>strides</code> tell you how many bytes you must jump to move one step along each axis. We sum the same 128 MB table twice, once row by row and once column by column, and then gather all its values in memory order and in a shuffled order. Timings are approximate and will differ on your machine:</p>
  <div class="fx" data-lang="py">import time
import numpy as np

# 4000 x 4000 table of order amounts: 16 million float64 values = 128 MB
a = np.random.default_rng(0).random((4000, 4000))
print("bytes:", a.nbytes, " stored row by row:", a.flags["C_CONTIGUOUS"])
print("strides (bytes to next row, next column):", a.strides)

def best(f, reps=3):
    times = []
    for _ in range(reps):
        t0 = time.perf_counter(); f(); times.append(time.perf_counter() - t0)
    return min(times)

row_wise = best(lambda: sum(a[i, :].sum() for i in range(4000)))   # walk along rows
col_wise = best(lambda: sum(a[:, j].sum() for j in range(4000)))   # jump down columns
print(f"row by row:       {row_wise*1000:6.1f} ms")
print(f"column by column: {col_wise*1000:6.1f} ms")

flat = a.ravel()
order = np.random.default_rng(1).permutation(flat.size)        # same values, shuffled visiting order
in_order = np.arange(flat.size)                                # same values, visited in memory order
seq = best(lambda: flat[in_order].sum())
rnd = best(lambda: flat[order].sum())
print(f"in-order gather:  {seq*1000:6.1f} ms")
print(f"random gather:    {rnd*1000:6.1f} ms")</div>
  <div class="fx" data-lang="text">bytes: 128000000  stored row by row: True
strides (bytes to next row, next column): (32000, 8)
row by row:         13.4 ms
column by column:   50.1 ms
in-order gather:    68.0 ms
random gather:     282.0 ms</div>
  <p>The strides <code>(32000, 8)</code> say that moving to the next column means stepping 8 bytes (the very next number), while moving to the next row means jumping 32,000 bytes (4,000 numbers × 8 bytes). Summing row by row walks through memory in order: every cache line brings in eight useful numbers and the prefetcher stays ahead. Summing column by column reads one number, then jumps 32,000 bytes for the next, so each number needs its own cache line and seven-eighths of every line is wasted; it was several times slower even though it did exactly the same additions. The last two lines are the same lesson in a stronger form: gathering all 16 million values in their memory order versus in a random order does identical work, but the random order defeats both the cache lines and the prefetcher and takes several times as long.</p>
  <p>The same idea explains why NumPy is so much faster than a plain Python list for numeric work. A NumPy array stores raw 8-byte numbers side by side in one block, which is perfect for the cache. A Python list does not store numbers at all; it stores <strong>pointers</strong> (addresses, explained in the next section) to separate float objects scattered around memory, and each of those objects carries extra bookkeeping:</p>
  <div class="fx" data-lang="py">import sys, time
import numpy as np

n = 10_000_000
py_list = [float(i) for i in range(n)]
arr = np.arange(n, dtype=np.float64)

print("one Python float object:", sys.getsizeof(1.5), "bytes")
print("list (just the pointers):", sys.getsizeof(py_list) // 1_000_000, "MB")
print("list incl. float objects:", (sys.getsizeof(py_list) + n * 24) // 1_000_000, "MB")
print("numpy array:", arr.nbytes // 1_000_000, "MB")

t0 = time.perf_counter(); s1 = sum(py_list); t1 = time.perf_counter()
s2 = arr.sum(); t2 = time.perf_counter()
print(f"sum(list): {(t1-t0)*1000:.0f} ms   arr.sum(): {(t2-t1)*1000:.1f} ms   same: {s1 == s2}")</div>
  <div class="fx" data-lang="text">one Python float object: 24 bytes
list (just the pointers): 89 MB
list incl. float objects: 329 MB
numpy array: 80 MB
sum(list): 94 ms   arr.sum(): 12.0 ms   same: True</div>
  <p>Each Python float is a full object of 24 bytes (a reference count, a pointer to its type, and only then the 8-byte number), and the list adds an 8-byte pointer per item on top, so ten million floats take over 300 MB as a list against 80 MB as an array. Summing them is also several times faster with NumPy, partly because NumPy's loop is compiled C code rather than the Python interpreter, and partly because it streams through contiguous memory instead of following ten million pointers to scattered objects. This is the "vectorisation" advice you hear in data science, explained from the hardware up.</p>
  <p>You meet locality everywhere once you know to look for it. Pandas stores each column as its own array, so operations down a column are fast and looping over rows with <code>iterrows()</code> is slow. Column-oriented file formats such as Parquet and column-store databases exist because analytics reads a few columns of many rows. Matrix multiplication libraries split matrices into small tiles that fit in cache. And in PyTorch, a tensor that has been transposed becomes "non-contiguous" and some operations first copy it into a fresh contiguous block for exactly this reason.</p>

  <h2 id="cfm-addr"><span class="num">04</span>Memory Addresses and Pointers</h2>
  <p>RAM is one enormous row of bytes, and the computer needs a way to say which byte it wants. It does this by numbering them: every byte in memory has an <strong>address</strong>, a number that identifies its position, just as every house on a very long street has a house number. When a program stores the order list somewhere, what it really keeps is the address where the list begins. A value that holds an address, rather than the data itself, is called a <strong>pointer</strong>, or in Python's vocabulary a <strong>reference</strong>. A pointer is like a slip of paper with a house number written on it: the slip is small and easy to pass around, and anyone holding it can go and find the house.</p>
  <p>Languages like C let you work with pointers directly, which is powerful and dangerous: following a pointer to the wrong address crashes the program or corrupts data. Python hides pointers completely, but they are still there underneath. Every Python variable is a name attached to a reference to an object, and the built-in <code>id()</code> function returns a number that identifies the object; in CPython, the standard Python, it is the object's memory address. NumPy will also tell you the address of the first byte of an array's data:</p>
  <div class="fx" data-lang="py">import numpy as np

orders = [120, 80, 45]
alias = orders                       # a second name for the SAME list
print("id(orders):", id(orders), "=", hex(id(orders)))
print("id(alias): ", id(alias), " same object:", orders is alias)
alias.append(60)
print(orders)                        # changed through the other name

copy = list(orders)                  # a new list at a new address
print("id(copy):  ", id(copy), " same object:", copy is orders)

amounts = np.array([120.0, 80.0, 45.0, 60.0])
base = amounts.ctypes.data           # address of the first byte of the data
print("address of amounts[0]:", hex(base))
print("amounts[1] is", amounts.itemsize, "bytes further on, amounts[3] is", 3 * amounts.itemsize)</div>
  <div class="fx" data-lang="text">id(orders): 139691741462912 = 0x7f0c84a0c180
id(alias):  139691741462912  same object: True
[120, 80, 45, 60]
id(copy):   139691743336000  same object: False
address of amounts[0]: 0x1af623e0
amounts[1] is 8 bytes further on, amounts[3] is 24</div>
  <p>The number from <code>id()</code> is just a large integer; written in hexadecimal (base 16, the usual way to write addresses) it is <code>0x7f…</code>, a typical address for objects in a 64-bit Linux process. <code>alias = orders</code> did not copy the list; it made a second name holding the same reference, so both names show the same address, <code>is</code> is <code>True</code>, and appending through <code>alias</code> changed what <code>orders</code> shows. <code>list(orders)</code> built a new list at a different address. This is the same behaviour that surprises beginners when a function modifies a list they passed in, and it is covered in depth in <a class="xref" data-note="py_values">Values, References &amp; Mutability</a>. The NumPy lines show the other side: an array's numbers sit at consecutive addresses, each one <code>itemsize</code> (8) bytes after the last, which is precisely what makes it cache-friendly.</p>
  <p>Two practical points follow. First, <code>id()</code> values are only unique among objects alive at the same time; once an object is freed, a new object can be given the same address. Second, the address you see is not a physical position on a RAM chip but a <em>virtual</em> address that the operating system translates, an idea we come to in the virtual memory section. With addresses understood, we can look at the two main regions a program keeps its data in.</p>

  <h2 id="cfm-stack"><span class="num">05</span>The Stack and the Heap</h2>
  <p>A running program needs memory for two quite different kinds of data. Some data is short-lived and tied to a function call: the parameters and local variables of a function exist only while that function is running and can be thrown away the moment it returns. Other data must outlive the function that created it, or has a size nobody knew in advance: a DataFrame loaded from a file, a list that grows as orders arrive. Programs therefore use two regions of memory with different rules, called the stack and the heap.</p>
  <p>The <strong>stack</strong> (or call stack) is a region that holds one <strong>frame</strong> for every function call currently in progress. A frame contains that call's local variables, its arguments and the place to return to when it finishes. When a function is called, a new frame is pushed on top; when it returns, its frame is popped off and its memory is instantly reusable. This is exactly like a stack of plates: you only ever add or remove the top plate, which makes it very fast, because the program never has to search for free space. The <strong>heap</strong> is a large pool of memory from which blocks of any size can be requested at any time and given back in any order. It is flexible but needs bookkeeping: something must track which blocks are in use and find free space for new requests. Think of the stack as a notepad on your desk where you write working notes for the task at hand and tear off the page when the task is done, and the heap as a warehouse where you rent space of any size for as long as you need it, with a manager keeping the records.</p>
  <p>Our script can show its own stack. Python keeps frames as objects, and <code>sys._getframe()</code> gives access to them, so the helper below prints every frame alive at the moment it is called, starting from the top:</p>
  <div class="fx" data-lang="py">import sys

def show_stack():
    frames = []
    frame = sys._getframe(1)              # start at whoever called us
    while frame.f_code.co_name != "&lt;module&gt;":
        frames.append(frame)
        frame = frame.f_back              # each frame remembers its caller
    for f in frames:                      # newest (top of the stack) first
        local_vars = {k: v for k, v in f.f_locals.items()}
        print(f"  {f.f_code.co_name:12} locals = {local_vars}")
    print("  &lt;module&gt;     (the script itself, bottom of the stack)")

def add_tax(amount):
    taxed = amount * 1.05
    show_stack()                          # print the frames alive right now
    return taxed

def order_total(prices):
    subtotal = sum(prices)
    return add_tax(subtotal)

total = order_total([120, 80, 45])
print("total:", round(total, 2))</div>
  <div class="fx" data-lang="text">  add_tax      locals = {'amount': 245, 'taxed': 257.25}
  order_total  locals = {'prices': [120, 80, 45], 'subtotal': 245}
  &lt;module&gt;     (the script itself, bottom of the stack)
total: 257.25</div>
  <p>When <code>add_tax</code> was running, three frames were stacked: the script itself at the bottom, <code>order_total</code> above it, waiting for its call to <code>add_tax</code> to come back, and <code>add_tax</code> on top. Each frame holds its own local variables: <code>order_total</code> has <code>prices</code> and <code>subtotal</code>, <code>add_tax</code> has <code>amount</code> and <code>taxed</code>. When <code>add_tax</code> returned 257.25, its frame was removed, then <code>order_total</code>'s, and only the script was left. This is also exactly what a traceback shows you after an error: the stack of frames, from the outermost call to the one that failed.</p>
  <figure class="viz"><svg viewBox="0 0 620 260" width="620"><defs><marker id="cfm-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
<text x="20" y="30" font-size="12" class="tb">STACK: one frame per active call</text><text x="20" y="50" font-size="10" class="tm">new frames are pushed on top ↑</text>
<rect x="20" y="70" width="230" height="50" rx="4" class="fv"/><text x="30" y="88" font-size="11">add_tax  (top, running)</text><text x="30" y="110" font-size="11">amount</text><circle cx="95" cy="106" r="4" class="tb"/><text x="140" y="110" font-size="11">taxed</text><circle cx="190" cy="106" r="4" class="tb"/>
<rect x="20" y="130" width="230" height="50" rx="4" class="fb"/><text x="30" y="148" font-size="11">order_total  (waiting)</text><text x="30" y="170" font-size="11">prices</text><circle cx="95" cy="166" r="4" class="tb"/><text x="130" y="170" font-size="11">subtotal</text><circle cx="205" cy="166" r="4" class="tb"/>
<rect x="20" y="190" width="230" height="50" rx="4" class="fs"/><text x="30" y="208" font-size="11">&lt;module&gt;  (bottom)</text><text x="30" y="230" font-size="11" class="tm">total: not assigned yet</text>
<text x="350" y="30" font-size="12" class="tg">HEAP: objects, in any order</text><text x="350" y="50" font-size="10" class="tm">live as long as something refers to them</text>
<rect x="370" y="65" width="160" height="30" rx="4" class="fg sg"/><text x="450" y="85" text-anchor="middle" font-size="11">list [120, 80, 45]</text>
<rect x="490" y="130" width="100" height="30" rx="4" class="fg sg"/><text x="540" y="150" text-anchor="middle" font-size="11">int 245</text>
<rect x="360" y="200" width="130" height="30" rx="4" class="fg sg"/><text x="425" y="220" text-anchor="middle" font-size="11">float 257.25</text>
<line x1="99" y1="164" x2="368" y2="84" class="sb" stroke-width="1.2" marker-end="url(#cfm-a2)"/>
<line x1="209" y1="166" x2="488" y2="148" class="sb" stroke-width="1.2" marker-end="url(#cfm-a2)"/>
<line x1="99" y1="106" x2="488" y2="139" class="sb" stroke-width="1.2" marker-end="url(#cfm-a2)"/>
<line x1="194" y1="108" x2="360" y2="206" class="sb" stroke-width="1.2" marker-end="url(#cfm-a2)"/>
</svg><figcaption>Inside add_tax. The stack holds the frames and their local names; the objects those names refer to live on the heap. Note that amount (in add_tax) and subtotal (in order_total) refer to the same int object, 245.</figcaption></figure>
  <p>The picture shows how the two regions work together in Python. In CPython, the frames and the names they hold belong to the call stack, but every actual object, every integer, float, list and DataFrame, is created on the heap, and the names in a frame are only references to them. Follow the arrows: <code>prices</code> points to the list on the heap; <code>subtotal</code> and <code>amount</code> both point to the same integer object 245, because passing <code>subtotal</code> into <code>add_tax</code> passed the reference, not a copy. When <code>add_tax</code> returns, its frame disappears, but the float 257.25 survives on the heap because the caller receives a reference to it. In languages like C, C++ and Rust, small local values (an <code>int</code>, a fixed-size array) really are stored inside the stack frame, and only things created with <code>malloc</code> or <code>new</code> go on the heap; that is why the "what goes where" question in interviews is usually answered for C-like languages, with the note that in Python and Java the objects live on the heap.</p>
  <p>The stack is fast but limited in size, typically about 8 MB per thread on Linux. If calls keep nesting deeper without returning, usually because of recursion (a function calling itself) with no proper stopping point, frames pile up until the stack is full. This is a <strong>stack overflow</strong>, and in C it crashes the whole program. Python protects you by counting frames and refusing to go beyond a limit, raising <code>RecursionError</code> instead:</p>
  <div class="fx" data-lang="py">import sys

print("recursion limit:", sys.getrecursionlimit())

def count_down(n):
    return 0 if n == 0 else 1 + count_down(n - 1)   # one new frame per call

print(count_down(500))
try:
    count_down(100_000)
except RecursionError as e:
    print("RecursionError:", e)

def count_down_loop(n):                              # same job, one frame
    steps = 0
    while n &gt; 0:
        n -= 1; steps += 1
    return steps

print(count_down_loop(100_000))</div>
  <div class="fx" data-lang="text">recursion limit: 1000
500
RecursionError: maximum recursion depth exceeded
100000</div>
  <p>The default limit is 1000 frames. Counting down from 500 works fine, but counting down from 100,000 would need 100,000 frames, so Python stopped with <code>RecursionError</code> long before the real stack ran out. You can raise the limit with <code>sys.setrecursionlimit</code>, but that only moves the problem and risks a real crash; the proper fix is the last function, which does the same job with a loop in a single frame. This matters in practice for recursive tree and graph algorithms on large inputs, such as a depth-first search over a big graph (see <a class="xref" data-note="dsa_complexity">Complexity</a> for how recursion depth counts as memory).</p>
  <p>The stack and heap also correspond to two ways of reserving memory. <strong>Static allocation</strong> means the size of the memory is fixed before the program runs, when the code is compiled: global variables and fixed-size local arrays in C are like this, and the compiler can place them in advance at no run-time cost. <strong>Dynamic allocation</strong> means memory is requested while the program runs, in whatever amount turns out to be needed, from the heap: in C with <code>malloc</code>, in Python every time any object is created. Dynamic allocation is what lets a list grow as orders arrive, at the price of the bookkeeping work. You can watch a Python list asking the heap for more room:</p>
  <div class="fx" data-lang="py">import sys

orders = []
last = sys.getsizeof(orders)
print(f"empty list: {last} bytes")
for i in range(20):
    orders.append(i)
    size = sys.getsizeof(orders)
    if size != last:                  # the list asked the heap for a bigger block
        print(f"after {len(orders):2} items: {size} bytes")
        last = size</div>
  <div class="fx" data-lang="text">empty list: 56 bytes
after  1 items: 88 bytes
after  5 items: 120 bytes
after  9 items: 184 bytes
after 17 items: 248 bytes</div>
  <p>An empty list is a 56-byte object. It does not grow by one slot per item; when it runs out of room it asks for a bigger block and moves its pointers there, leaving spare capacity so that the next few appends are free (88 bytes holds 4 pointers, 120 holds 8, and so on). This "grow by a proportion, not by one" trick is why <code>append</code> is fast on average. NumPy arrays make the opposite choice: an array's size is fixed when it is created, which keeps its numbers in one tight block but means it cannot grow in place, so <code>np.append</code> has to allocate a whole new array and copy everything (the Common Mistakes section measures the cost).</p>

  <h2 id="cfm-gc"><span class="num">06</span>Garbage Collection</h2>
  <p>Heap memory has to be given back when it is no longer needed, or the program will eventually run out. In C the programmer must do this by hand, calling <code>free()</code> for every <code>malloc()</code>. Forgetting leaks memory; freeing too early, then using the memory anyway, causes some of the worst bugs and security holes in software. Most modern languages, Python included, do this job automatically. <strong>Garbage collection</strong> is the automatic process of finding heap objects that the program can no longer reach and returning their memory. "Garbage" here simply means an object that nothing refers to any more, so no code could ever use it again.</p>
  <p>Think of a hotel with a strict rule: a room is cleaned and rented out again as soon as the last guest holding a key card checks out. The hotel does not need to guess whether anyone still needs the room; it simply counts the key cards. Python's main mechanism works exactly like this and is called <strong>reference counting</strong>: every object stores a count of how many references point to it. Assigning it to a name, putting it in a list or passing it to a function adds one; a name going out of scope, <code>del</code>, or reassignment subtracts one. The instant the count reaches zero, the object is freed. Our <code>Order</code> class prints a message from <code>__del__</code>, a special method that runs when an object is freed, so we can watch:</p>
  <div class="fx" data-lang="py">import sys, gc

class Order:
    def __init__(self, name):
        self.name = name
    def __del__(self):                    # runs when the object is freed
        print(f"  freed {self.name}")

a = Order("A")
print("references to A:", sys.getrefcount(a) - 1)   # -1: getrefcount's own argument
b = a
print("after b = a:    ", sys.getrefcount(a) - 1)
del a
print("after del a:    ", sys.getrefcount(b) - 1)
print("del b -&gt;")
del b                                     # count hits 0: freed immediately

print("cycle:")
x, y = Order("X"), Order("Y")
x.partner, y.partner = y, x               # X points to Y and Y points to X
del x, y                                  # no names left, but each still has 1 reference
print("  (nothing freed yet)")
found = gc.collect()                      # the cycle collector finds the island
print("gc.collect() found", found, "unreachable objects")</div>
  <div class="fx" data-lang="text">references to A: 1
after b = a:     2
after del a:     1
del b -&gt;
  freed A
cycle:
  (nothing freed yet)
  freed X
  freed Y
gc.collect() found 2 unreachable objects</div>
  <p>The first half shows the counter at work. Creating A gives it one reference; <code>b = a</code> makes two; <code>del a</code> removes a name, not the object, so the count drops to one and nothing is freed. Deleting <code>b</code> brings the count to zero and "freed A" is printed immediately, at that exact line. (<code>sys.getrefcount</code> reports one extra because passing the object to it creates a temporary reference, which is why the code subtracts one.)</p>
  <p>The second half shows the one situation reference counting cannot handle: a <strong>reference cycle</strong>, where objects refer to each other. X refers to Y and Y refers to X, so after <code>del x, y</code> no name in the program can reach either, yet each still has a count of one, held by the other. Like two hotel guests who each hold the other's key card and then both vanish, the counter never reaches zero. To catch these, CPython has a second mechanism, the <strong>cycle collector</strong> (the <code>gc</code> module), which runs from time to time, looks for groups of container objects that are only reachable from each other, and frees them. In the demo nothing was freed after <code>del</code>; calling <code>gc.collect()</code> found the island of 2 unreachable objects and freed both. Normally you never call it yourself, because it runs automatically as objects are created; Python groups objects into "generations" by age so that it can check young objects often and old ones rarely. The details of how CPython stores objects are in <a class="xref" data-note="py_fundamentals">Python Fundamentals</a>.</p>
  <p>Other languages make different choices. Java, Go and C# use <strong>tracing</strong> garbage collectors that periodically start from the variables in use and mark everything reachable, then free the rest; they handle cycles naturally but can cause short pauses. Rust and C++ avoid a collector entirely by tying memory to ownership rules checked when the code is compiled. Python's reference counting has a nice property for data work: memory is usually released at a predictable moment, so <code>del big_df</code> on the last reference to a large DataFrame frees it right there. The catch is the phrase "last reference", as the next section shows.</p>

  <h2 id="cfm-leak"><span class="num">07</span>Memory Leaks</h2>
  <p>A <strong>memory leak</strong> is memory that a program keeps holding even though it will never use it again, so its memory use grows over time until the machine runs out. In C a leak usually means forgetting to call <code>free()</code>. In Python, with automatic garbage collection, you might think leaks are impossible, but the collector only frees objects that nothing refers to. If your code keeps a reference to something by accident, for example in a global list, a dictionary used as a cache, or a class attribute, the collector correctly concludes that the object is still in use, and it stays forever. A Python leak is almost always "something is still pointing at it".</p>
  <p>Picture a restaurant that keeps every receipt in a drawer "in case a customer asks about it". The drawer works perfectly for a day. After a year the drawer has taken over the kitchen. Nothing is broken; the restaurant is doing exactly what it was told, and that is the problem. Leaks are hard to notice for the same reason: a script that runs for a minute never shows them, but a web service or a model server that handles millions of requests over a week does.</p>
  <p>The demo shows the classic case in a prediction service. A dictionary caches results by request id so that repeated requests are fast, but every request id is unique, so the cache only ever grows. Python's built-in <code>tracemalloc</code> module records memory allocations and can report the current total and which line of code allocated the most:</p>
  <div class="fx" data-lang="py">import tracemalloc
from collections import OrderedDict

_cache = {}                                   # lives for the whole program

def predict(request_id, amount):
    if request_id not in _cache:
        _cache[request_id] = {"amount": amount, "score": [amount * 0.01] * 50}
    return _cache[request_id]["score"][0]

tracemalloc.start()
for batch in range(1, 4):
    for i in range(20_000):
        rid = f"req-{batch}-{i}"              # every request id is new
        predict(rid, i)
    now, peak = tracemalloc.get_traced_memory()
    print(f"after batch {batch}: {now / 1e6:5.1f} MB in use, cache size {len(_cache)}")

snapshot = tracemalloc.take_snapshot()
top = snapshot.statistics("lineno")[0]       # which line allocated the most?
print(f"biggest allocator: line {top.traceback[0].lineno}, {top.size / 1e6:.1f} MB")
_cache.clear()

class BoundedCache(OrderedDict):              # the fix: forget the oldest entries
    def __init__(self, maxsize):
        super().__init__(); self.maxsize = maxsize
    def put(self, key, value):
        self[key] = value
        if len(self) &gt; self.maxsize:
            self.popitem(last=False)

tracemalloc.reset_peak()
cache = BoundedCache(maxsize=1000)
for batch in range(1, 4):
    for i in range(20_000):
        cache.put(f"req-{batch}-{i}", {"amount": i, "score": [i * 0.01] * 50})
    now, _ = tracemalloc.get_traced_memory()
    print(f"bounded, batch {batch}: {now / 1e6:5.1f} MB in use, cache size {len(cache)}")</div>
  <div class="fx" data-lang="text">after batch 1:  15.4 MB in use, cache size 20000
after batch 2:  30.8 MB in use, cache size 40000
after batch 3:  46.7 MB in use, cache size 60000
biggest allocator: line 8, 41.8 MB
bounded, batch 1:   0.9 MB in use, cache size 1000
bounded, batch 2:   0.9 MB in use, cache size 1000
bounded, batch 3:   0.9 MB in use, cache size 1000</div>
  <p>After each batch of 20,000 requests, memory in use grows by about 15 MB and the cache holds 20,000 more entries; nothing ever shrinks it. <code>take_snapshot().statistics("lineno")</code> points straight at the culprit: line 8, the line that stores into <code>_cache</code>. The fix is to give the cache a size limit, so that it forgets the oldest entries. The <code>BoundedCache</code> keeps at most 1,000 entries, dropping the oldest when a new one arrives, and memory stays flat at under 1 MB however many requests arrive. Python's standard library has this built in as <code>functools.lru_cache(maxsize=...)</code>; "LRU" means least recently used, the entry that gets thrown away first.</p>
  <p>Common real-world leak sources in data and ML code are worth knowing by name: appending every batch's loss tensor to a list during training (in PyTorch this also keeps each tensor's whole computation graph alive, so append <code>loss.item()</code> instead); global caches and memoisation without a limit; event listeners or callbacks that are registered and never removed; and keeping references to large DataFrames in notebook variables like <code>_</code> or <code>Out</code> after you thought you had deleted them. To investigate, watch the process's memory over time (with <code>ps</code>, <code>top</code> or your monitoring dashboards), then use <code>tracemalloc</code> snapshots taken at two different times and compare them with <code>snapshot2.compare_to(snapshot1, "lineno")</code> to see which lines grew. More on profiling in <a class="xref" data-note="py_debugging">Debugging &amp; Profiling</a>.</p>

  <h2 id="cfm-vm"><span class="num">08</span>Virtual Memory, Paging and Swap</h2>
  <p>A computer runs many programs at once, all sharing the same RAM. That raises hard problems. How do you stop one program from reading or overwriting another's memory? How does each program know which addresses it is allowed to use, when other programs are coming and going? And what happens when the programs together want more memory than the machine has? The operating system solves all three with one idea. <strong>Virtual memory</strong> means that each process (a running program) is given its own private, imaginary address space, as if it had the whole memory to itself, and the operating system, with help from the CPU, translates those virtual addresses to real locations in RAM behind the scenes. The addresses you saw from <code>id()</code> were virtual addresses.</p>
  <p>The translation is not done byte by byte, which would need an enormous table. Memory is divided into fixed-size blocks called <strong>pages</strong>, and physical RAM is divided into blocks of the same size, called frames. The operating system keeps a <strong>page table</strong> for each process that records, for each virtual page, which physical frame holds it, or that it is not in RAM at all. A circuit in the CPU called the MMU (memory management unit) performs the lookup on every memory access, and caches recent translations in a small table called the TLB so that the lookup is nearly free. Think of virtual addresses as the seat numbers on concert tickets and physical RAM as the actual chairs: the usher (the operating system) can arrange the chairs however is convenient, give two concerts in different halls the same seat numbers, and leave some ticket numbers unassigned until someone actually turns up.</p>
  <figure class="viz"><svg viewBox="0 0 520 320" width="520"><defs><marker id="cfm-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
<text x="30" y="30" font-size="12" class="tb">Process A (virtual)</text>
<rect x="30" y="40" width="140" height="28" class="fb sb"/><text x="40" y="58" font-size="11">page 0</text>
<rect x="30" y="70" width="140" height="28" class="fb sb"/><text x="40" y="88" font-size="11">page 1</text>
<rect x="30" y="100" width="140" height="28" class="fr sr"/><text x="40" y="118" font-size="11">page 2: on disk</text>
<rect x="30" y="130" width="140" height="28" class="fs"/><text x="40" y="148" font-size="11" class="tm">page 3: never touched</text>
<text x="30" y="180" font-size="12" class="tb">Process B (virtual)</text>
<rect x="30" y="190" width="140" height="28" class="fv"/><text x="40" y="208" font-size="11">page 0</text>
<rect x="30" y="220" width="140" height="28" class="fv"/><text x="40" y="238" font-size="11">page 1</text>
<rect x="30" y="250" width="140" height="28" class="fv"/><text x="40" y="268" font-size="11">page 2</text>
<rect x="30" y="280" width="140" height="28" class="fs"/><text x="40" y="298" font-size="11" class="tm">page 3: never touched</text>
<text x="350" y="30" font-size="12" class="tg">Physical RAM (frames)</text>
<rect x="350" y="40" width="140" height="28" class="fg sg"/><text x="360" y="58" font-size="11">frame 0</text>
<rect x="350" y="72" width="140" height="28" class="fs"/><text x="360" y="90" font-size="11" class="tm">frame 1: free</text>
<rect x="350" y="104" width="140" height="28" class="fg sg"/><text x="360" y="122" font-size="11">frame 2</text>
<rect x="350" y="136" width="140" height="28" class="fg sg"/><text x="360" y="154" font-size="11">frame 3</text>
<rect x="350" y="168" width="140" height="28" class="fs"/><text x="360" y="186" font-size="11" class="tm">frame 4: file cache</text>
<rect x="350" y="200" width="140" height="28" class="fg sg"/><text x="360" y="218" font-size="11">frame 5</text>
<rect x="350" y="232" width="140" height="28" class="fg sg"/><text x="360" y="250" font-size="11">frame 6</text>
<line x1="170" y1="54" x2="348" y2="118" class="sb" stroke-width="1.2" marker-end="url(#cfm-a3)"/>
<line x1="170" y1="84" x2="348" y2="214" class="sb" stroke-width="1.2" marker-end="url(#cfm-a3)"/>
<line x1="170" y1="204" x2="348" y2="54" class="sb" stroke-width="1.2" marker-end="url(#cfm-a3)"/>
<line x1="170" y1="234" x2="348" y2="150" class="sb" stroke-width="1.2" marker-end="url(#cfm-a3)"/>
<line x1="170" y1="264" x2="348" y2="246" class="sb" stroke-width="1.2" marker-end="url(#cfm-a3)"/>
</svg><figcaption>Two processes, each with its own virtual pages. The arrows are the page tables. Neighbouring virtual pages can sit anywhere in RAM, one of A's pages has been moved out to disk (swap), and pages that were never touched take no RAM at all.</figcaption></figure>
  <p>Follow the arrows. Process A's page 0 is in frame 2 and its page 1 in frame 5; to A they look like neighbours, but physically they are far apart, and A cannot tell. Process B's pages are in frames 0, 3 and 6. Neither process can name the other's frames, because there is no entry for them in its page table, which is how virtual memory isolates programs from each other. A's page 2 is marked as being on disk, and both processes have a page they reserved but never used, which costs no RAM at all. On Linux the page size is almost always 4 KB, and <code>/proc/meminfo</code> shows how the system is doing overall:</p>
  <div class="fx" data-lang="text">$ getconf PAGE_SIZE
4096
$ grep -E '^(MemTotal|MemAvailable|SwapTotal|SwapFree|Committed_AS|CommitLimit|Hugepagesize)' /proc/meminfo
MemTotal:       16473756 kB
MemAvailable:   15451772 kB
SwapTotal:             0 kB
SwapFree:              0 kB
CommitLimit:     8236876 kB
Committed_AS:     443608 kB
Hugepagesize:       2048 kB
$ cat /proc/sys/vm/overcommit_memory
0</div>
  <p>A page here is 4,096 bytes. Committed_AS is the total memory that all processes have <em>reserved</em>; it can be far more than what they actually use, because reserving a virtual page is free and only touching it costs RAM. The last line, the overcommit setting 0, means Linux uses a heuristic and happily lets programs reserve more than it could ever supply, betting that they will not all use it. Hugepagesize shows that the CPU also supports large 2 MB pages, which reduce the number of translations needed for big arrays.</p>
  <p>When a program touches a virtual page that has no frame behind it yet, the CPU cannot complete the access and hands control to the operating system. This event is a <strong>page fault</strong>. It is not an error: it is the normal way memory gets assigned. A <strong>minor page fault</strong> is resolved without touching disk, for example by finding a free frame, filling it with zeros and updating the page table. A <strong>major page fault</strong> needs data from disk, because the page was swapped out or belongs to a file that has not been read yet, and costs milliseconds instead of microseconds. We can watch both the reservation and the faults happen by reading the process's own entries in <code>/proc/self/status</code> while NumPy allocates 100 MB:</p>
  <div class="fx" data-lang="py">import resource
import numpy as np

def status():
    fields = {}
    for line in open("/proc/self/status"):
        key, _, value = line.partition(":")
        if key in ("VmSize", "VmRSS"):
            fields[key] = int(value.split()[0]) // 1024     # kB -&gt; MB
    faults = resource.getrusage(resource.RUSAGE_SELF).ru_minflt
    return f"virtual {fields['VmSize']:5} MB   resident {fields['VmRSS']:4} MB   page faults so far {faults}"

print("start:          ", status())
a = np.empty(100_000_000 // 8)          # ask for 100 MB, do not touch it
print("after np.empty: ", status())
a[:] = 1.0                              # now write to every page
print("after filling:  ", status())
print("100 MB /", 4096, "bytes per page =", 100_000_000 // 4096, "pages")
huge = [l for l in open("/proc/self/smaps_rollup") if l.startswith("AnonHugePages")][0]
print("held in 2 MB huge pages:", int(huge.split()[1]) // 1024, "MB")</div>
  <div class="fx" data-lang="text">start:           virtual   238 MB   resident   28 MB   page faults so far 3771
after np.empty:  virtual   333 MB   resident   28 MB   page faults so far 3772
after filling:   virtual   333 MB   resident  124 MB   page faults so far 4170
100 MB / 4096 bytes per page = 24414 pages
held in 2 MB huge pages: 94 MB</div>
  <p>This is virtual memory in action. <code>np.empty</code> asked for 100 MB, and the process's virtual size went up by about 95 MiB immediately, but its <strong>resident</strong> memory (RSS, the RAM it actually occupies) did not move at all: the pages were promised, not provided. Only when <code>a[:] = 1.0</code> wrote to every page did the faults happen and resident memory rise by the same amount. You might expect 24,414 faults, one per 4 KB page, but there were only a few hundred, because the kernel backed most of this large block with 2 MB huge pages (the last line), each covering 512 small pages with a single fault. This is why a program's "virtual" size in <code>top</code> is often huge and harmless, while its resident size is the number to watch.</p>
  <p>What if programs actually use more memory than there is RAM? Linux can move pages that have not been used recently out to a reserved area on disk called <strong>swap</strong>, freeing their frames for other work, and bring them back with a major page fault when they are next touched. Swap is a safety net that lets a machine survive a short spike. But we saw that a disk read is tens of thousands of times slower than a RAM read, so if the working data truly does not fit, the machine spends its time moving pages in and out instead of computing. This is called <strong>thrashing</strong>: the disk light is constantly on and everything slows to a crawl. If there is no swap, as on this VM and on most Kubernetes nodes and containers, Linux has another last resort, the <strong>OOM killer</strong> (out of memory killer), which picks a process using a lot of memory and terminates it. That is the meaning of a training job that just prints "Killed", or a container that exits with code 137: it asked for more memory than its limit (see <a class="xref" data-note="se_docker">Docker</a> and <a class="xref" data-note="mlops_k8s">Kubernetes</a> for memory limits).</p>
  <p>One more memory problem is worth a paragraph. <strong>Memory fragmentation</strong> happens when free memory is broken into many small pieces scattered between blocks that are still in use, so that even though plenty of memory is free in total, there is no single piece big enough for a large request. It is like a car park with twenty empty spaces scattered one by one between parked cars: a bus still cannot park. Fragmentation shows up as a long-running process whose memory use stays high after it has freed many objects, because the allocator cannot hand partly used blocks back to the operating system. Virtual memory hides fragmentation of physical RAM (pages can go in any frame), but not inside a process's heap. In GPU work you meet it in PyTorch error messages that mention "reserved but unallocated" memory.</p>

  <h2 id="cfm-gpu"><span class="num">09</span>GPU Memory (VRAM)</h2>
  <p>Deep learning runs mostly on GPUs (graphics processing units), chips with thousands of simple cores that do the same arithmetic on many numbers at once. A GPU cannot compute on data sitting in the computer's main RAM any more than a CPU can compute on data sitting on disk; it needs the data in its own memory, which sits on the graphics card right next to the GPU chip. This memory is called <strong>VRAM</strong> (video RAM), or simply GPU memory. It is built for enormous bandwidth (how many bytes per second it can deliver): a data centre GPU's high-bandwidth memory delivers several terabytes per second, about ten times what a server CPU gets from its RAM, which is what lets a GPU keep its thousands of cores busy.</p>
  <p>The catch is size and separation. A consumer GPU has 8–24 GB of VRAM and a data centre GPU 40–192 GB, much less than a server's RAM, and it is a completely separate memory. Data must be copied from RAM to VRAM over a connection called PCIe, which is far slower than VRAM itself. Think of the GPU as a specialist workshop across the road with its own small, very fast workbench: it can build things incredibly quickly, but only with materials on its own bench, and carrying materials across the road takes time. In PyTorch, that trip is what <code>tensor.to("cuda")</code> does, and keeping data on the GPU between steps, rather than moving it back and forth, is one of the first performance rules (<a class="xref" data-note="dl_pytorch">PyTorch</a>).</p>
  <p>On a machine with an NVIDIA GPU, the command <code>nvidia-smi</code> shows each GPU's total and used memory, and inside PyTorch <code>torch.cuda.memory_allocated()</code> and <code>torch.cuda.max_memory_allocated()</code> report what your tensors are using. This machine has no GPU, so the check simply comes back empty:</p>
  <div class="fx" data-lang="text">$ command -v nvidia-smi || echo "nvidia-smi not found: this container has no GPU"
nvidia-smi not found: this container has no GPU</div>
  <p>On a GPU machine, VRAM is usually the tightest limit in deep learning. During training it must hold the model's weights, the gradients, the optimizer's extra state and the <strong>activations</strong> (intermediate results of each layer, kept for the backward pass), and activations grow with the batch size. That is why the standard responses to "CUDA out of memory" are a smaller batch size, mixed precision (16-bit numbers instead of 32-bit), gradient checkpointing (recomputing activations instead of storing them) and, for inference, quantisation (8- or 4-bit weights). Every one of these is a way of fitting more into a fixed amount of fast memory, and the next section shows how to put numbers on it.</p>

  <h2 id="cfm-est"><span class="num">10</span>Estimating Memory for Data and Models</h2>
  <p>Before loading a large file or launching a training job, you want to know whether it will fit, because finding out by crashing wastes time and money. The rule behind every estimate is simple: memory ≈ number of values × bytes per value, plus some overhead. A float64 or int64 takes 8 bytes, a float32 or int32 takes 4, a bool takes 1. Python objects, such as strings stored in an "object" column, are the exception: each one is a separate heap object with its own overhead, so they are much bigger than their characters suggest. NumPy reports an array's raw size as <code>nbytes</code>, and pandas reports each column with <code>df.memory_usage(deep=True)</code>. Here is our orders table, one million rows:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd

n = 1_000_000
rng = np.random.default_rng(0)
df = pd.DataFrame({
    "order_id": np.arange(n, dtype=np.int64),
    "amount": rng.random(n) * 500,
    "city": rng.choice(["Pune", "Delhi", "Mumbai", "Chennai"], n).astype(object),
    "paid": rng.random(n) &gt; 0.1,
})

print("numpy nbytes of amount:", df["amount"].to_numpy().nbytes, "=", n, "x 8 bytes")
print((df.memory_usage(deep=True) / 1e6).round(1).to_string())
print("total:", round(df.memory_usage(deep=True).sum() / 1e6, 1), "MB")
print("shallow (deep=False) total:", round(df.memory_usage().sum() / 1e6, 1), "MB")

small = df.astype({"order_id": "int32", "amount": "float32", "city": "category"})
print("after int32/float32/category:", round(small.memory_usage(deep=True).sum() / 1e6, 1), "MB")</div>
  <div class="fx" data-lang="text">numpy nbytes of amount: 8000000 = 1000000 x 8 bytes
Index        0.0
order_id     8.0
amount       8.0
city        13.5
paid         1.0
total: 30.5 MB
shallow (deep=False) total: 30.5 MB
after int32/float32/category: 10.0 MB</div>
  <p>The numeric columns match the rule exactly: a million int64 or float64 values take 8 MB, and the bool column 1 MB. The <code>city</code> column, stored as Python string objects (the classic "object" dtype that most existing pandas code has), takes 54.5 MB for just four distinct words, because each row holds an 8-byte pointer to a string object of about 50 bytes. Notice the difference between the two totals: without <code>deep=True</code>, pandas counts only the 8-byte pointers and reports 25 MB, badly underestimating. The last line shows the usual cure: storing the ids as int32 and amounts as float32 (enough precision for money in rupees) and the city as a <strong>category</strong>, which stores each distinct word once plus a small integer code per row, shrinks the table from 71.5 MB to 10 MB. As a rule of thumb, also budget two to three times the table size for working room, because operations like merges, sorts and <code>groupby</code> create temporary copies.</p>
  <p>Models follow the same rule, with parameters instead of rows. A model's weights take <strong>parameters × bytes per parameter</strong>:</p>
  <div class="fx" data-lang="py"># Memory needed just to HOLD a model's weights = parameters x bytes per parameter
bytes_per = {"float32": 4, "float16/bfloat16": 2, "int8": 1, "int4": 0.5}

# A small fully connected network: 784 -&gt; 512 -&gt; 10 (weights + biases)
mlp = (784 * 512 + 512) + (512 * 10 + 10)
print(f"MLP parameters: {mlp:,}  -&gt; {mlp * 4 / 1e6:.1f} MB in float32")

for name, params in [("7B LLM", 7e9), ("70B LLM", 70e9)]:
    row = "  ".join(f"{dt}: {params * b / 1e9:6.1f} GB" for dt, b in bytes_per.items())
    print(f"{name:8} {row}")

# Training with Adam in mixed precision needs roughly 16 bytes per parameter
# (weights, gradients, two optimizer moments, a float32 master copy), before activations
print(f"7B training state: ~{7e9 * 16 / 1e9:.0f} GB")</div>
  <div class="fx" data-lang="text">MLP parameters: 407,050  -&gt; 1.6 MB in float32
7B LLM   float32:   28.0 GB  float16/bfloat16:   14.0 GB  int8:    7.0 GB  int4:    3.5 GB
70B LLM  float32:  280.0 GB  float16/bfloat16:  140.0 GB  int8:   70.0 GB  int4:   35.0 GB
7B training state: ~112 GB</div>
  <p>A small neural network with 407,050 parameters needs only 1.6 MB. A 7-billion-parameter language model needs 28 GB in float32, 14 GB in 16-bit precision, and 3.5 GB when quantised to 4 bits, which is why quantisation is what makes such models run on a laptop or a single small GPU. Training needs far more than inference: with the common Adam optimizer in mixed precision, each parameter carries roughly 16 bytes of state (the 16-bit weights and gradients, a 32-bit master copy of the weights, and Adam's two running averages), so a 7B model needs over 100 GB before counting activations, which is why it is trained across several GPUs. Inference servers also need memory for the KV cache, which grows with the number and length of requests. These rough calculations, done in a minute before a job starts, prevent most memory surprises.</p>

  <h2 id="cfm-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The first mistake is trusting <code>sys.getsizeof</code> or a shallow <code>memory_usage()</code> for containers. Both report only the container itself, the list or the column of pointers, not the objects it points to:</p>
  <div class="fx" data-lang="py">import sys

cities = [f"city-{i:05d}" for i in range(10_000)]
shallow = sys.getsizeof(cities)                        # the list of pointers only
deep = shallow + sum(sys.getsizeof(c) for c in cities) # plus every string object
print(f"getsizeof(list): {shallow / 1e3:.0f} KB   with the strings: {deep / 1e3:.0f} KB")</div>
  <div class="fx" data-lang="text">getsizeof(list): 85 KB   with the strings: 595 KB</div>
  <p><code>sys.getsizeof</code> says the list of 10,000 strings is 85 KB, but the strings themselves add more than five times as much. The same applies to pandas: always use <code>memory_usage(deep=True)</code> or <code>df.info(memory_usage="deep")</code> for columns of strings or other objects.</p>
  <p>The second is walking through an array against its memory layout, for example writing an explicit loop over columns of a C-ordered array, or converting a DataFrame to rows and back. As the cache section showed, the same arithmetic can be several times slower when it jumps through memory. Prefer whole-array NumPy and pandas operations, which already walk memory efficiently, and if you must loop, loop along the contiguous axis, the last one for NumPy's default C order.</p>
  <p>The third is growing a NumPy array inside a loop with <code>np.append</code> or <code>np.concatenate</code>. Because arrays have a fixed size, each call allocates a brand-new array and copies everything, so the total work grows with the square of the length:</p>
  <div class="fx" data-lang="py">import time
import numpy as np

n = 50_000
t0 = time.perf_counter()
arr = np.array([])
for i in range(n):
    arr = np.append(arr, i * 1.5)          # new array + full copy every time
t_bad = time.perf_counter() - t0

t0 = time.perf_counter()
values = []
for i in range(n):
    values.append(i * 1.5)                 # list over-allocates: cheap appends
arr2 = np.array(values)                    # one conversion at the end
t_good = time.perf_counter() - t0
print(f"np.append in a loop: {t_bad * 1000:6.0f} ms")
print(f"list, then np.array: {t_good * 1000:6.1f} ms   equal: {np.array_equal(arr, arr2)}")</div>
  <div class="fx" data-lang="text">np.append in a loop:   1672 ms
list, then np.array:    5.0 ms   equal: True</div>
  <p>Collecting values in a Python list (which over-allocates, as we saw) and converting once at the end, or preallocating with <code>np.empty(n)</code> and filling it, avoids the repeated copies; here it was many times faster.</p>
  <p>Finally, three habits cause most memory incidents in practice. Unbounded caches and lists that only ever grow turn into leaks in long-running services; give every cache a <code>maxsize</code>. Deleting a variable does not free a large object while another name, a list or a notebook output still refers to it; check for other references. And confusing virtual size with real usage leads to false alarms: watch resident memory (RSS), and on Linux treat "available", not "free", as the memory you have left.</p>

  <h2 id="cfm-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The hierarchy</h3>
  <table class="tbl">
    <tr><th>Layer</th><th>Typical size</th><th>Latency</th><th>Survives power off?</th></tr>
    <tr><td>Registers</td><td>a few hundred bytes</td><td>&lt; 1 ns</td><td>no</td></tr>
    <tr><td>L1 / L2 / L3 cache</td><td>~48 KB / ~2 MB per core / tens of MB shared</td><td>~1 / ~4 / ~15 ns</td><td>no</td></tr>
    <tr><td>RAM</td><td>8 GB – 1 TB+</td><td>~100 ns</td><td>no (volatile)</td></tr>
    <tr><td>NVMe SSD</td><td>TBs</td><td>~20–100 µs</td><td>yes</td></tr>
    <tr><td>HDD</td><td>TBs</td><td>~5–10 ms</td><td>yes</td></tr>
    <tr><td>GPU VRAM</td><td>8–192 GB</td><td>separate; very high bandwidth</td><td>no</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>Latency</b>: delay before data arrives. <b>Bandwidth</b>: bytes per second once it flows.</li>
    <li><b>RAM</b>: main working memory; <b>volatile</b> (DRAM charges leak, need constant refresh).</li>
    <li><b>Cache line</b>: the 64-byte block the cache moves between RAM and CPU.</li>
    <li><b>Spatial locality</b>: nearby addresses used soon. <b>Temporal locality</b>: same data reused soon.</li>
    <li><b>Address</b>: a byte's position number. <b>Pointer / reference</b>: a value holding an address.</li>
    <li><b>Stack</b>: one frame per active call (locals, return point); push on call, pop on return; ~8 MB.</li>
    <li><b>Heap</b>: pool for objects of any size and lifetime; needs allocation bookkeeping.</li>
    <li><b>Static allocation</b>: size fixed at compile time. <b>Dynamic</b>: requested at run time from the heap.</li>
    <li><b>Garbage collection</b>: automatic freeing of unreachable objects.</li>
    <li><b>Memory leak</b>: memory still referenced (or never freed) though never used again.</li>
    <li><b>Virtual memory</b>: per-process address space mapped to RAM by page tables.</li>
    <li><b>Page</b>: 4 KB unit of mapping. <b>Page fault</b>: access to an unmapped page; minor (no disk) or major (disk).</li>
    <li><b>Swap</b>: disk used as overflow RAM. <b>Thrashing</b>: constant swapping. <b>OOM killer</b>: kills a process when memory runs out.</li>
    <li><b>Fragmentation</b>: free memory split into pieces too small to use.</li>
  </ul>
  <h3>Python and pandas</h3>
  <div class="fx" data-lang="py">id(x)                         # identity (address in CPython)
a is b                        # same object?
sys.getsizeof(obj)            # shallow size only
sys.getrefcount(obj)          # reference count (+1 for the call)
gc.collect()                  # run the cycle collector now
sys.getrecursionlimit()       # 1000 by default
tracemalloc.start(); tracemalloc.get_traced_memory()
tracemalloc.take_snapshot().statistics("lineno")
functools.lru_cache(maxsize=1000)    # bounded cache
arr.nbytes, arr.strides, arr.flags["C_CONTIGUOUS"]
df.memory_usage(deep=True); df.info(memory_usage="deep")
df.astype({"city": "category", "amount": "float32"})</div>
  <h3>Linux</h3>
  <div class="fx" data-lang="text">free -h                  # use "available", not "free"
cat /proc/meminfo        # MemTotal, MemAvailable, SwapTotal, Committed_AS
getconf PAGE_SIZE        # 4096
lscpu                    # cache sizes
/proc/&lt;pid&gt;/status       # VmSize (virtual) vs VmRSS (resident)
nvidia-smi               # GPU memory</div>
  <h3>Estimation rules</h3>
  <ul>
    <li>Table: rows × columns × bytes per value (8 for int64/float64, 4 for 32-bit, 1 for bool); strings much more.</li>
    <li>Budget 2–3× the table for operations that copy (merge, sort, groupby).</li>
    <li>Model weights: params × bytes (4 fp32, 2 fp16/bf16, 1 int8, 0.5 int4). 7B fp16 ≈ 14 GB.</li>
    <li>Training with Adam (mixed precision): ~16 bytes per parameter plus activations.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Column-wise loops over a C-ordered array are cache-unfriendly.</li>
    <li><code>del x</code> removes a name, not the object; other references keep it alive.</li>
    <li>Reference cycles wait for the cycle collector.</li>
    <li><code>np.append</code> in a loop copies the whole array every time.</li>
    <li>"Killed" / exit code 137 = OOM killer; "CUDA out of memory" = VRAM full.</li>
  </ul>

  <h2 id="cfm-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the memory hierarchy, and why does it exist?</summary><div class="qa-body">It is the arrangement of storage in layers: registers, L1/L2/L3 cache, RAM, then SSD or HDD. Each layer down is larger and cheaper per byte but slower, because fast memory is expensive and must sit close to the CPU. Small fast layers keep copies of the data in use right now, and because programs reuse data and read it in order (locality), most accesses are served by the fast layers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Roughly how long does it take to read from L1 cache, RAM, an SSD and a hard disk?</summary><div class="qa-body">About 1 ns for L1, about 100 ns for RAM, tens of microseconds for a random SSD read, and 5–10 ms for a random hard disk read. Each step is roughly a hundred to a thousand times slower than the one before, which is why keeping working data in memory and in cache matters so much.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between RAM and storage? Why is RAM volatile?</summary><div class="qa-body">RAM is the fast working memory where running programs and their data live; storage (SSD, HDD) is slower but keeps data permanently. DRAM stores each bit as a charge in a tiny capacitor that leaks within milliseconds and must be refreshed constantly; without power the charges disappear, so RAM's contents are lost. Results must be written to storage to survive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a CPU cache, and what is a cache line?</summary><div class="qa-body">A cache is small, fast memory on the CPU chip that holds copies of recently used RAM. It moves data in fixed blocks called cache lines, usually 64 bytes, so reading one value also brings its neighbours. A cache hit is served in a few nanoseconds; a miss has to go to RAM and costs around 100 ns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain spatial and temporal locality, with an example.</summary><div class="qa-body">Spatial locality: after accessing an address you are likely to access nearby addresses, as when looping over an array. Temporal locality: data used recently is likely to be used again soon, like a loop counter or running total. Caches and prefetchers exploit both; summing an array in memory order is fast, visiting the same elements in random order is several times slower.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is summing a NumPy array row by row faster than column by column?</summary><div class="qa-body">NumPy arrays are row-major (C order) by default: each row is stored contiguously. Row-wise access walks consecutive addresses, so every 64-byte cache line delivers eight useful float64 values and the prefetcher stays ahead. Column-wise access jumps a whole row's width (the stride) between elements, so each value needs its own cache line. A Fortran-ordered array would reverse this.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is NumPy faster and smaller than a Python list of numbers?</summary><div class="qa-body">A NumPy array stores raw fixed-size numbers contiguously, and its operations run as compiled loops over that memory. A list stores pointers to separate Python objects scattered on the heap; each float object is 24 bytes plus an 8-byte pointer, and every operation goes through the interpreter and follows a pointer. So NumPy uses about a quarter of the memory and is many times faster for numeric work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between the stack and the heap?</summary><div class="qa-body">The stack holds one frame per active function call, with its local variables and return address; frames are pushed on call and popped on return, so allocation is automatic and very fast, but the stack is small (about 8 MB per thread). The heap is a large pool for data of any size whose lifetime is not tied to one call; it needs explicit or garbage-collected freeing. In C, local ints live on the stack and <code>malloc</code> memory on the heap; in Python, frames hold only references and all objects live on the heap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a stack overflow, and what does Python do about it?</summary><div class="qa-body">A stack overflow happens when calls nest so deeply, usually through runaway recursion, that the stack runs out of space; in C this crashes the process. Python limits the depth (1000 frames by default) and raises <code>RecursionError</code> before the real stack overflows. The fix is a base case that is actually reached, or rewriting deep recursion as a loop with an explicit stack; raising the limit only postpones the problem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between static and dynamic memory allocation?</summary><div class="qa-body">Static allocation fixes the size and location of memory before the program runs, at compile time, as with global variables or fixed-size arrays in C; it is free at run time but inflexible. Dynamic allocation requests memory from the heap while the program runs, in whatever size is needed, as with <code>malloc</code> in C or creating any object in Python; it is flexible but costs bookkeeping and must be freed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python manage memory and garbage collection?</summary><div class="qa-body">CPython uses reference counting: every object counts the references to it and is freed the moment the count reaches zero. Because reference cycles (objects referring to each other) never reach zero, a separate generational cycle collector in the <code>gc</code> module periodically finds groups of objects reachable only from each other and frees them. Small objects come from Python's own allocator (pymalloc) on top of the system heap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>id()</code> return, and how is <code>is</code> different from <code>==</code>?</summary><div class="qa-body"><code>id()</code> returns an integer identifying an object for its lifetime; in CPython it is the object's memory address. <code>is</code> checks whether two names refer to the same object (same id), while <code>==</code> checks whether their values are equal. Two separate lists with the same contents are <code>==</code> but not <code>is</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a Python program leak memory? How would you find the leak?</summary><div class="qa-body">Yes: the garbage collector frees only unreachable objects, so anything still referenced, such as entries in a global dict, an unbounded cache, a list of tensors kept during training or registered callbacks, stays forever. Watch the process's resident memory over time, then use <code>tracemalloc</code> snapshots at two moments and <code>compare_to</code> to find the lines whose allocations grow. Fix it by removing the reference or bounding the container.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is virtual memory, and why is it useful?</summary><div class="qa-body">Virtual memory gives each process its own private address space, which the OS and the CPU's MMU translate to physical RAM page by page using page tables. It isolates processes from each other, lets each program use simple contiguous addresses regardless of where its data physically sits, allows memory to be reserved without being used until touched, and lets the OS move rarely used pages to disk (swap).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a page fault? Minor vs major?</summary><div class="qa-body">A page fault occurs when a program accesses a virtual page that is not currently mapped to a physical frame; the CPU traps into the OS, which fixes the mapping and resumes the program. A minor fault needs no disk access (for example, giving a freshly allocated page a zeroed frame) and costs microseconds; a major fault must read the page from disk (swap or a file) and costs milliseconds. Page faults are normal; many major faults indicate memory pressure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when a machine runs out of RAM?</summary><div class="qa-body">If swap exists, the OS moves inactive pages to disk; if the working set really exceeds RAM, it thrashes, spending its time moving pages and slowing drastically. Without swap, or when swap is also full, Linux's OOM killer terminates a process using lots of memory; you see "Killed" or exit code 137. In containers the same happens when a process exceeds its memory limit, even if the host has free RAM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is memory fragmentation?</summary><div class="qa-body">Fragmentation is when free memory is split into many small non-contiguous pieces between blocks in use, so a large allocation can fail or the process cannot return memory to the OS even though plenty is free in total. Virtual memory avoids it for physical RAM because pages can go in any frame, but it still happens inside a process's heap, and in GPU allocators (PyTorch's "reserved but unallocated" memory).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you estimate and reduce the memory of a pandas DataFrame?</summary><div class="qa-body">Multiply rows by bytes per value per column (8 for int64/float64, 1 for bool), and measure with <code>df.memory_usage(deep=True)</code>, because object (string) columns are much bigger than they look. Reduce it by downcasting numbers (int32, float32), converting repeated strings to <code>category</code>, loading only needed columns (<code>usecols</code>), and processing in chunks. Leave 2–3× headroom for operations that create copies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How much GPU memory do you need to serve a 7B-parameter model, and why does training need more?</summary><div class="qa-body">Weights alone take parameters × bytes per parameter: about 28 GB in float32, 14 GB in fp16/bf16, 7 GB in int8 and 3.5 GB in 4-bit, plus room for activations and the KV cache. Training also stores gradients, optimizer state (Adam keeps two values per parameter) and a float32 master copy, roughly 16 bytes per parameter, plus activations that grow with batch size. Smaller batches, mixed precision, gradient checkpointing and sharding across GPUs reduce it.</div></details>
</main>
`
});
