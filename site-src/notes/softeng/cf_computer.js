// notes/softeng/cf_computer.js — How a Computer Works
Object.assign(TOPIC_CONTENT, {
  "cf_computer": `<main>
<h1>How a Computer Works</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>How a Computer Works</span></div>
  <p class="lead">Every model you train, every pandas script you run and every API you deploy ends up as instructions carried out by a small number of physical parts: a processor that does the work, memory that holds what it is working on, storage that keeps things when the power is off, and wires that connect them. You can write good Python without knowing any of this, but sooner or later you meet questions that only make sense once you do: why <code>n_jobs=4</code> made one job four times faster and another not at all, why a Docker image built on a MacBook crashes on a cloud server, why deep learning needs a GPU, or what a "vCPU" on a cloud bill actually is. This page builds that picture from zero. The running example is one ordinary task, running <code>python score.py</code> to compute features for eight batches of customer records, and we follow it through the machine this page was written on: a Linux virtual machine in the cloud, whose real numbers appear throughout.</p>

  <h2 id="cfc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">How a computer works</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The parts</div>
        <ul>
          <li><b>CPU</b> does the work; <b>RAM</b> holds the work in progress</li>
          <li><b>Storage</b> keeps files when power is off</li>
          <li><b>Motherboard buses</b> connect everything; I/O talks to the world</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside the CPU</div>
        <ul>
          <li>Fetch, decode, execute, once per instruction, billions per second</li>
          <li><b>GHz</b> = billions of clock ticks per second</li>
          <li><b>64-bit</b> = 64-bit registers and addresses</li>
          <li><b>x86</b> (Intel/AMD) vs <b>ARM</b> (Apple M, phones, Graviton)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Doing more at once</div>
        <ul>
          <li><b>Cores</b>: independent workers; <b>hardware threads</b>: shared core</li>
          <li>Processes use all cores in Python; threads do not for CPU work</li>
          <li><b>GPU</b>: thousands of simple cores for the same maths on lots of data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Switching on</div>
        <ul>
          <li>Firmware in ROM (BIOS / UEFI) checks hardware</li>
          <li>Boot loader loads the OS kernel</li>
          <li>Kernel starts the first process, which starts the rest</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfc-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Computer Is</span><span class="rm-sub">CPU, memory, storage, input/output and how they connect</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-cycle"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The CPU and the Fetch–Decode–Execute Cycle</span><span class="rm-sub">instructions, registers and the program counter</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-clock"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Clock Speed</span><span class="rm-sub">what GHz means and why it is not the whole story</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-cores"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Cores and Hardware Threads</span><span class="rm-sub">many workers on one chip, hyper-threading, vCPUs</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-bits"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Bits, Bytes and 32 vs 64-bit</span><span class="rm-sub">data units and what "64-bit" really means</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-isa"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Instruction Sets: x86 vs ARM</span><span class="rm-sub">why software is built for one kind of CPU</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-bus"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Motherboard and Buses</span><span class="rm-sub">how the parts talk, and why the wires can be the bottleneck</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-parallel"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Serial vs Parallel Work</span><span class="rm-sub">using every core from Python, and its limits</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-gpu"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">GPU vs CPU</span><span class="rm-sub">why machine learning runs on graphics cards</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-boot"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">What Happens When a Computer Starts</span><span class="rm-sub">ROM, BIOS/UEFI, boot loader, kernel</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">GHz comparisons, threads, core counts, wrong architecture</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">parts, terms, commands, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="cfc-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the hardware questions engineers get asked</span></div></div>
    </div>
  </div>

  <h2 id="cfc-what"><span class="num">01</span>What a Computer Is</h2>
  <p>A <strong>computer</strong> is a machine that follows a list of very simple instructions, extremely fast, on data stored as numbers. That is the whole idea. Everything else, from spreadsheets to neural networks, is built by combining billions of steps such as "add these two numbers", "copy this number to that place" and "if this number is zero, jump to that instruction". The interesting question is which physical parts are needed to make that happen, and the answer is the same for a phone, a laptop and a cloud server.</p>
  <p>Think of a busy restaurant kitchen. The <strong>chef</strong> is the one who actually cooks, but can only work on what is within arm's reach on the <strong>worktop</strong>. Ingredients that are not needed right now live in the <strong>pantry</strong>, which is large and keeps things for weeks but is a walk away. Orders come in from the dining room and finished plates go out through a hatch. And the whole kitchen is joined by <strong>corridors</strong> that people and trolleys move along. A computer has exactly these five parts.</p>
  <p>The chef is the <strong>CPU</strong> (central processing unit, or processor): the chip that carries out instructions. The worktop is <strong>memory</strong>, usually called <strong>RAM</strong> (random-access memory): a set of chips that hold the program currently running and the data it is working on. RAM is fast, but it is also <em>volatile</em>, which means its contents vanish when the power goes off. The pantry is <strong>storage</strong>: an SSD (solid-state drive) or an older HDD (hard disk drive), which keeps files permanently but is much slower than RAM. The order slips and the hatch are <strong>input and output (I/O) devices</strong>: anything that brings data in (keyboard, mouse, microphone, camera, network card receiving a request) or sends it out (screen, speakers, printer, network card sending a response). The corridors are the <strong>motherboard</strong>, the large circuit board that every other part plugs into, with its <strong>buses</strong>, the sets of wires that carry data between the parts. Many computers add a fifth specialist, the <strong>GPU</strong> (graphics processing unit), which we come back to in section 09.</p>
  <figure class="viz"><svg viewBox="0 0 640 270" width="640">
<rect x="230" y="18" width="180" height="84" rx="8" class="fb sb"/><text x="320" y="44" text-anchor="middle" font-weight="700">CPU</text><text x="320" y="64" text-anchor="middle" class="tm" font-size="10.5">cores, registers, cache</text><text x="320" y="82" text-anchor="middle" class="tm" font-size="10.5">does the work</text>
<rect x="470" y="18" width="150" height="84" rx="8" class="ft st"/><text x="545" y="44" text-anchor="middle" font-weight="700">RAM</text><text x="545" y="64" text-anchor="middle" class="tm" font-size="10.5">fast, temporary</text><text x="545" y="82" text-anchor="middle" class="tm" font-size="10.5">the worktop</text>
<rect x="20" y="18" width="150" height="84" rx="8" class="fg sg"/><text x="95" y="44" text-anchor="middle" font-weight="700">Storage</text><text x="95" y="64" text-anchor="middle" class="tm" font-size="10.5">SSD / HDD, permanent</text><text x="95" y="82" text-anchor="middle" class="tm" font-size="10.5">the pantry</text>
<line x1="410" y1="60" x2="470" y2="60" stroke="currentColor" stroke-width="3"/><text x="440" y="52" text-anchor="middle" class="tm" font-size="9.5">memory bus</text>
<rect x="20" y="140" width="600" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="159" text-anchor="middle" font-size="11">motherboard: PCIe lanes, chipset, USB (the corridors)</text>
<line x1="95" y1="102" x2="95" y2="140" stroke="currentColor" stroke-width="2"/><line x1="320" y1="102" x2="320" y2="140" stroke="currentColor" stroke-width="2"/>
<line x1="95" y1="168" x2="95" y2="200" stroke="currentColor" stroke-width="2"/><line x1="320" y1="168" x2="320" y2="200" stroke="currentColor" stroke-width="2"/><line x1="545" y1="168" x2="545" y2="200" stroke="currentColor" stroke-width="2"/>
<rect x="20" y="200" width="150" height="54" rx="8" class="fr sr"/><text x="95" y="223" text-anchor="middle" font-weight="700">Input / Output</text><text x="95" y="241" text-anchor="middle" class="tm" font-size="10.5">keyboard, screen, USB</text>
<rect x="230" y="200" width="180" height="54" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="223" text-anchor="middle" font-weight="700">GPU</text><text x="320" y="241" text-anchor="middle" class="tm" font-size="10.5">thousands of small cores</text>
<rect x="470" y="200" width="150" height="54" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="545" y="223" text-anchor="middle" font-weight="700">Network card</text><text x="545" y="241" text-anchor="middle" class="tm" font-size="10.5">I/O to other machines</text>
</svg><figcaption>The parts of every computer. RAM sits on its own fast memory bus right next to the CPU; storage, the GPU, the network card and other devices reach the CPU through the motherboard's slower shared connections.</figcaption></figure>
  <p>Now follow <code>python score.py</code> through the picture. Before you run it, the file <code>score.py</code> and the Python program itself sit in storage, because storage is the only part that remembers things while the machine is off. When you press Enter, the operating system copies the Python program and your script from storage into RAM, because the CPU cannot work on anything directly from storage; it is far too slow. The CPU then reads instructions out of RAM one after another and carries them out, reading the customer records into RAM, computing, and writing results back into RAM. Finally the results leave through an output device: printed to the screen, written back to storage as a file, or sent over the network. Every program you will ever run follows this same path: storage to RAM, RAM to CPU and back, then out.</p>
  <p>You can see the real sizes of these parts on any Linux machine: <code>free -h</code> shows RAM and <code>lsblk</code> lists storage devices (the processor gets its own command in section 04):</p>
  <div class="fx" data-lang="text">$ free -h
               total        used        free      shared  buff/cache   available
Mem:            15Gi       761Mi        14Gi        12Mi       817Mi        14Gi
Swap:             0B          0B          0B
$ lsblk -d -o NAME,SIZE,TYPE,MOUNTPOINTS /dev/vda
NAME  SIZE TYPE MOUNTPOINTS
vda   256G disk /</div>
  <p>This machine has about 15 GiB of RAM, of which under 1 GiB is in use, and one 256 GB virtual disk called <code>vda</code> mounted at <code>/</code>, the top of the file system. (The "Gi" means gibibytes, a unit explained in section 05.) Notice the gap in size: storage here is about seventeen times larger than RAM, and on a typical laptop the ratio is similar, because storage is much cheaper per byte. That difference in speed and price, small fast memory next to the CPU and large slow storage further away, shapes almost everything about performance, and it has its own note: <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a> and <a class="xref" data-note="cf_storage">Storage: HDD, SSD &amp; File Systems</a>. Because this is a cloud virtual machine, every number on this page belongs to the slice of a real server that the cloud provider has handed to it, not to a physical box on a desk; the ideas are identical.</p>

  <h2 id="cfc-cycle"><span class="num">02</span>The CPU and the Fetch–Decode–Execute Cycle</h2>
  <p>Your Python script says things like <code>total = price * quantity</code>. The CPU does not understand Python, or any words at all. What it understands is a fixed menu of tiny operations called <strong>instructions</strong>, each stored as a number. An instruction is one small, precisely defined action the processor can perform, such as "load the number at memory address 1000 into register A", "multiply register A by register B" or "jump back to instruction 40 if register C is not zero". A program, at the level the CPU sees it, is just a long list of these numbers sitting in RAM, and that list is called <strong>machine code</strong>. Python's own interpreter is a program written in C and compiled into machine code; when it runs your script, it is the interpreter's machine code that the CPU executes. How source code becomes machine code is the subject of <a class="xref" data-note="cf_programs">From Code to a Running Program</a>; here we only need to know what the CPU does with it.</p>
  <p>To do its job, the CPU has a few tiny storage slots built into the chip itself, called <strong>registers</strong>. A register holds a single number, typically 64 bits wide, and reading one takes less than a nanosecond, so the CPU does all its arithmetic on registers and only uses RAM to fetch inputs and store results. One special register, the <strong>program counter</strong> (PC), holds the memory address of the next instruction to run. Picture a cook working through a recipe card: they keep a finger on the current line (the program counter), hold a couple of ingredients in their hands (the registers), and go to the worktop (RAM) only to pick up or put down things.</p>
  <p>The CPU's entire life is one loop, repeated billions of times per second, called the <strong>fetch–decode–execute cycle</strong>. In the <em>fetch</em> step it reads the instruction at the address in the program counter from memory, and moves the program counter on to the next instruction. In the <em>decode</em> step its control circuitry works out what that number means: which operation, and which registers or memory addresses it involves. In the <em>execute</em> step the right part of the chip carries it out, for example the <strong>ALU</strong> (arithmetic logic unit), the circuit that adds, subtracts, multiplies and compares. Then the cycle begins again with the next instruction. A "jump" instruction is simply one that writes a new address into the program counter, which is how loops and <code>if</code> statements work at the bottom.</p>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
<defs><marker id="cfc-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<path d="M232,62 Q280,30 328,62" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#cfc-a1)"/>
<path d="M372,120 Q370,175 320,190" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#cfc-a1)"/>
<path d="M240,190 Q190,175 188,120" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#cfc-a1)"/>
<circle cx="200" cy="90" r="42" style="fill:var(--bg)"/><circle cx="200" cy="90" r="42" class="fb sb"/><text x="200" y="88" text-anchor="middle" font-weight="700">FETCH</text><text x="200" y="104" text-anchor="middle" class="tm" font-size="9.5">read at PC</text>
<circle cx="360" cy="90" r="42" style="fill:var(--bg)"/><circle cx="360" cy="90" r="42" class="ft st"/><text x="360" y="88" text-anchor="middle" font-weight="700">DECODE</text><text x="360" y="104" text-anchor="middle" class="tm" font-size="9.5">what does it mean?</text>
<circle cx="280" cy="190" r="36" style="fill:var(--bg)"/><circle cx="280" cy="190" r="36" class="fg sg"/><text x="280" y="188" text-anchor="middle" font-weight="700">EXECUTE</text><text x="280" y="203" text-anchor="middle" class="tm" font-size="9.5">ALU / memory</text>
<text x="20" y="30" class="tm" font-size="10.5">PC = address of the next instruction</text>
<text x="20" y="48" class="tm" font-size="10.5">registers = the CPU's own tiny slots</text>
<text x="420" y="190" class="tm" font-size="10.5">then repeat,</text><text x="420" y="206" class="tm" font-size="10.5">billions of times a second</text>
</svg><figcaption>The fetch–decode–execute cycle. Fetch reads the instruction the program counter points at and advances the PC, decode works out what it asks for, execute does it; then the loop starts again.</figcaption></figure>
  <p>The easiest way to make this concrete is to build a pretend CPU in a few lines of Python. The one below has two registers, A and B, a program counter, a memory of three numbers, and a menu of four instructions. Its program computes the total for one customer order, price times quantity, the same <code>total = price * quantity</code> our script needs:</p>
  <div class="fx" data-lang="py"># A toy CPU: two registers (A, B), a program counter (pc) and a tiny memory.
# The job: total = price * quantity, with price and quantity in memory.
memory = [30, 4, 0]                  # address 0: price, 1: quantity, 2: total
program = [
    ("LOAD",  "A", 0),               # A = memory[0]
    ("LOAD",  "B", 1),               # B = memory[1]
    ("MUL",   "A", "B"),             # A = A * B
    ("STORE", "A", 2),               # memory[2] = A
    ("HALT",),
]
reg = {"A": 0, "B": 0}
pc = 0
tick = 0
while True:
    instr = program[pc]              # FETCH the instruction pc points at
    op, *args = instr                # DECODE it into an operation and operands
    pc += 1                          # point at the next instruction
    tick += 1
    if op == "LOAD":                 # EXECUTE
        reg[args[0]] = memory[args[1]]
    elif op == "MUL":
        reg[args[0]] = reg[args[0]] * reg[args[1]]
    elif op == "STORE":
        memory[args[1]] = reg[args[0]]
    elif op == "HALT":
        print(f"tick {tick}: HALT")
        break
    print(f"tick {tick}: {op:5} {str(args):10} A={reg['A']:3} B={reg['B']}  memory={memory}")</div>
  <div class="fx" data-lang="text">tick 1: LOAD  ['A', 0]   A= 30 B=0  memory=[30, 4, 0]
tick 2: LOAD  ['B', 1]   A= 30 B=4  memory=[30, 4, 0]
tick 3: MUL   ['A', 'B'] A=120 B=4  memory=[30, 4, 0]
tick 4: STORE ['A', 2]   A=120 B=4  memory=[30, 4, 120]
tick 5: HALT</div>
  <p>Read the output line by line and you can watch the cycle. At tick 1 the CPU fetches the instruction at position 0, decodes it as "LOAD into A from address 0" and executes it, so register A becomes 30, the price. Tick 2 loads the quantity, 4, into B. Tick 3 multiplies the registers, and A becomes 120, but notice that memory still says <code>[30, 4, 0]</code>: the result exists only inside the CPU. Only tick 4, the STORE, writes 120 back to memory address 2. Real CPUs work exactly like this, just with hundreds of instructions on the menu, around 16 general-purpose registers on a typical 64-bit chip, and many tricks for overlapping the steps of neighbouring instructions (a technique called <strong>pipelining</strong>, like a laundry where one load is drying while the next is washing). The single line <code>total = price * quantity</code> in Python becomes dozens to hundreds of such instructions inside the interpreter, which is a big part of why plain Python loops are slow compared with compiled code.</p>

  <h2 id="cfc-clock"><span class="num">03</span>Clock Speed</h2>
  <p>The steps of the cycle have to happen in a coordinated order: decoding must not start before the fetch has finished, and every part of the chip must agree on when one step ends and the next begins. A CPU solves this with a <strong>clock</strong>, a tiny crystal-controlled circuit that sends out an electrical pulse at a steady rate. Each pulse is called a clock <strong>cycle</strong> or tick, and every part of the chip moves forward one step on each tick, like rowers pulling together to the beat of a drum. <strong>Clock speed</strong> is how many ticks happen per second, measured in hertz (Hz, one per second). Modern processors run at a few <strong>gigahertz</strong> (GHz), billions of ticks per second. The machine used for this page reports "Intel Xeon Processor @ 2.10GHz", so its clock ticks 2.1 billion times a second, and one tick lasts 1 / 2.1 billion of a second, about 0.48 nanoseconds. In that time light travels about 14 centimetres.</p>
  <p>It is natural to assume one tick means one instruction, but it is not that simple. Thanks to pipelining and to having several execution units side by side, a modern core can finish three or four simple instructions per tick, while a slow operation such as fetching a number that is not in the CPU's cache can make it wait for hundreds of ticks. The real speed of a processor is therefore roughly clock speed multiplied by <strong>IPC</strong> (instructions per cycle), and IPC differs a lot between chip designs. That is why a 3.2 GHz Apple M1 can beat an older 4 GHz desktop chip: GHz only compares chips of the same design. Clock speed also changes from moment to moment. Laptops and servers lower it when idle to save power and raise it briefly under load ("turbo" or "boost"), so the number on the box is a guide, not a constant.</p>
  <p>We can measure what a tick means for Python by timing a simple loop on this machine and dividing:</p>
  <div class="fx" data-lang="py">import time

N = 10_000_000
start = time.perf_counter()
total = 0
for i in range(N):
    total += i
secs = time.perf_counter() - start

ghz = 2.1                                   # this VM's advertised clock speed
ns_per_loop = secs / N * 1e9
print(f"{N:,} loop steps took {secs:.2f} s")
print(f"one step: about {ns_per_loop:.0f} ns")
print(f"one clock tick at {ghz} GHz: {1 / ghz:.2f} ns")
print(f"so one Python loop step costs roughly {ns_per_loop * ghz:.0f} clock ticks")</div>
  <div class="fx" data-lang="text">10,000,000 loop steps took 0.85 s
one step: about 85 ns
one clock tick at 2.1 GHz: 0.48 ns
so one Python loop step costs roughly 178 clock ticks</div>
  <p>Each step of the loop, a single <code>total += i</code>, costs tens of nanoseconds, which works out to a hundred or more clock ticks (the exact figures vary between runs, so treat them as approximate). That is the price of the interpreter: for every Python step it looks up names, checks types, and creates and frees number objects, each of which is many machine instructions. Libraries such as NumPy avoid most of this by running one compiled loop over a whole array, as we will see in section 09. The lesson for daily work is that the CPU is not slow; a Python loop simply spends most of its ticks on bookkeeping.</p>
  <p>For decades chips simply got faster clocks, but around 2005 that stopped at roughly 3 to 5 GHz. Running a chip faster needs more voltage, and power use and heat rise steeply with both, so beyond a point the chip cannot be cooled. This is called the <strong>power wall</strong>. Chip makers kept getting more transistors on each chip, though, and they spent them on a different idea: instead of one faster worker, put several workers on the same chip.</p>

  <h2 id="cfc-cores"><span class="num">04</span>Cores and Hardware Threads</h2>
  <p>A <strong>core</strong> is one complete processing unit, with its own fetch–decode–execute machinery, its own registers and its own small caches, able to run its own stream of instructions independently of the others. A modern CPU chip contains several cores: a laptop might have 8 to 12, a cloud server chip 64 or more. In kitchen terms, a multi-core CPU is a kitchen with several chefs. Each chef works on a different order at the same time, so the kitchen serves more meals per hour even though no single chef is faster. For our <code>score.py</code>, four cores means four batches of customers can be scored at the very same moment, but only if the program is written to hand out the work, which is the subject of section 08. A program written as one sequence of steps uses one core and leaves the rest idle.</p>
  <p>Even a single core is often idle inside: while it waits a hundred ticks for data from RAM, its adders and multipliers sit unused. <strong>Simultaneous multithreading</strong> (SMT), which Intel brands <strong>hyper-threading</strong>, fills that gap. The core keeps two sets of registers and program counters, so it can hold two instruction streams at once, and when one stream is stuck waiting, it executes instructions from the other. The operating system sees each such stream as a separate processor, called a <strong>logical CPU</strong> or <strong>hardware thread</strong>. A chip with 8 cores and hyper-threading therefore shows 16 logical CPUs. Think of one chef cooking two dishes: while one pan heats, they chop for the other. It helps, but it is not two chefs; the usual gain is somewhere around 10 to 30 percent, not double, and for heavy number crunching that keeps the core busy it can be close to nothing.</p>
  <p>Linux's <code>lscpu</code> command reports all of this. Here it is on this machine, filtered to the lines that matter, after <code>nproc</code>, which simply prints the number of logical CPUs this process may use:</p>
  <div class="fx" data-lang="text">$ nproc
4
$ lscpu | grep -E '^(Architecture|CPU op-mode|Address sizes|Byte Order|CPU\(s\)|Model name|Thread|Core|Socket|L1d|L2|L3|Hypervisor vendor)'
Architecture:                            x86_64
CPU op-mode(s):                          32-bit, 64-bit
Address sizes:                           52 bits physical, 57 bits virtual
Byte Order:                              Little Endian
CPU(s):                                  4
Model name:                              Intel(R) Xeon(R) Processor @ 2.10GHz
Thread(s) per core:                      1
Core(s) per socket:                      4
Socket(s):                               1
Hypervisor vendor:                       KVM
L1d cache:                               192 KiB (4 instances)
L2 cache:                                8 MiB (4 instances)
L3 cache:                                260 MiB (1 instance)</div>
  <p>The line <code>Socket(s): 1</code> says there is one CPU chip (a socket is the physical slot a chip sits in; big servers have two or more). <code>Core(s) per socket: 4</code> and <code>Thread(s) per core: 1</code> give 4 × 1 = 4 logical CPUs, which matches <code>CPU(s): 4</code> and <code>nproc</code>. So this virtual machine has no hyper-threading visible to it; on a desktop with hyper-threading the same command shows <code>Thread(s) per core: 2</code>. The line <code>Hypervisor vendor: KVM</code> confirms it is a virtual machine: KVM is the Linux software that splits a physical server into virtual ones, and the "Intel Xeon" we see is the real server chip, shared out. The cache lines describe small, very fast memories on the chip (each core has its own L1 and L2, and all cores share the L3); they are explained in <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a>.</p>
  <p>This matters directly when you rent machines. A cloud <strong>vCPU</strong> (virtual CPU) is one logical CPU of the real server. On most Intel and AMD cloud instances that is one hardware thread, half of a physical core, so an "8 vCPU" machine really has 4 cores' worth of number-crunching power; on ARM instances such as AWS Graviton, which have no hyper-threading, one vCPU is a whole core. Python reports logical CPUs too:</p>
  <div class="fx" data-lang="py">import os, platform, struct, sys

print("machine (instruction set):", platform.machine())
print("pointer size in bits:     ", struct.calcsize("P") * 8)
print("largest index (sys.maxsize):", sys.maxsize)
print("2**63 - 1                 :", 2**63 - 1)
print("logical CPUs (os.cpu_count):", os.cpu_count())
print("CPUs this process may use:  ", len(os.sched_getaffinity(0)))</div>
  <div class="fx" data-lang="text">machine (instruction set): x86_64
pointer size in bits:      64
largest index (sys.maxsize): 9223372036854775807
2**63 - 1                 : 9223372036854775807
logical CPUs (os.cpu_count): 4
CPUs this process may use:   4</div>
  <p>For now look at the last two lines: <code>os.cpu_count()</code> counts the logical CPUs the machine has, while <code>os.sched_getaffinity(0)</code> lists the ones this particular process is allowed to run on. Here both are 4. They can differ in containers and on shared servers, which is a common mistake covered in section 11. The other lines of this output are the subject of the next section.</p>

  <h2 id="cfc-bits"><span class="num">05</span>Bits, Bytes and 32 vs 64-bit</h2>
  <p>To understand what "64-bit" means, we need the units computers measure data in. Inside the chip, every number, letter and pixel is stored as a pattern of <strong>bits</strong>. A bit (binary digit) is the smallest possible piece of information: a single 0 or 1, physically a wire or a tiny cell that is either charged or not. One bit can only tell two things apart, but every bit you add doubles the number of patterns, so 8 bits give 256 patterns and 64 bits give about 18 billion billion. A group of 8 bits is a <strong>byte</strong>, the basic unit memory is organised in; one byte can hold a number from 0 to 255 or one English letter. Larger amounts use the familiar prefixes: a kilobyte (KB) is a thousand bytes, a megabyte (MB) a million, a gigabyte (GB) a billion, a terabyte (TB) a trillion. Operating systems often count in powers of 1024 instead (KiB, MiB, GiB), which is why a "1 TB" disk shows up as about 931 GB. How numbers, text, images and floats are encoded as bits, and that 1000 versus 1024 puzzle, are explained in full in <a class="xref" data-note="cf_data">How Data Is Stored as Bits</a>; here we only need the idea of a fixed number of bits.</p>
  <p>Every CPU is designed around a natural chunk size called its <strong>word size</strong>: the number of bits its general-purpose registers hold and its ALU processes in one go. A <strong>64-bit</strong> CPU has 64-bit registers, so it can add two 64-bit numbers in one instruction, and, just as important, it uses 64-bit numbers as <strong>memory addresses</strong>. RAM is like a giant street of numbered houses, one byte per house, and an address is the house number. The number of bits in an address therefore limits how many houses the CPU can tell apart. A <strong>32-bit</strong> CPU has 32-bit addresses, so it can point at 2<sup>32</sup> different bytes, which is 4 GiB. That is the reason old 32-bit Windows could not use more than about 4 GB of RAM no matter how much was installed, and why a single 32-bit program could never hold a dataset bigger than that. A 64-bit address could in theory reach 16 billion GiB, more than any machine has, so real chips wire up fewer address lines.</p>
  <p>Look back at the Python output above. <code>platform.machine()</code> says <code>x86_64</code>, the 64-bit version of the x86 instruction set (next section). A pointer, the type C uses to hold a memory address, is 64 bits. And <code>sys.maxsize</code>, the largest size a Python list or string can have, is exactly 2<sup>63</sup> − 1: the largest number a signed 64-bit word can hold (one bit is used for the sign). The <code>lscpu</code> output earlier added two related facts: <code>CPU op-mode(s): 32-bit, 64-bit</code> means this chip can still run old 32-bit programs, and <code>Address sizes: 52 bits physical, 57 bits virtual</code> shows how many of the 64 address bits the hardware really uses. Today essentially every laptop, phone and server is 64-bit, so in practice you meet "32-bit" in three places: very old software, tiny embedded devices, and data types such as <code>int32</code> and <code>float32</code>. Those data types are a separate idea, the size of one value rather than the CPU's word size, and choosing them well is one of the most useful memory-saving tricks in pandas and ML (see <a class="xref" data-note="cf_data">How Data Is Stored as Bits</a>).</p>

  <h2 id="cfc-isa"><span class="num">06</span>Instruction Sets: x86 vs ARM</h2>
  <p>We said the CPU understands a fixed menu of instructions, each encoded as a number. That menu, together with the registers it uses and the exact encoding of each instruction, is called the <strong>instruction set architecture</strong> (ISA). It is the contract between hardware and software: any chip that implements the ISA can run any machine code written for it. The catch is that different families of chips use different, incompatible menus. The number that means "add" on one family means something else, or nothing, on another, much as a recipe in Japanese is useless to a cook who reads only Spanish even though the dish is the same.</p>
  <p>Two ISAs dominate today. <strong>x86</strong> (its 64-bit form is called x86-64, x86_64 or amd64) comes from Intel's 1978 8086 chip and runs almost all Windows PCs, older Macs and most cloud servers, with chips made by Intel and AMD. It is a <strong>CISC</strong> design (complex instruction set computer): it has a large menu, including powerful instructions that do several things at once, and instructions of varying length, kept for decades for backward compatibility. <strong>ARM</strong> (its 64-bit form is called ARM64 or aarch64) comes from a British company that designs chips and licenses the designs to others. It is a <strong>RISC</strong> design (reduced instruction set computer): a smaller menu of simple, fixed-length instructions, which makes the chip simpler and more power-efficient. That efficiency is why every smartphone uses ARM, and since 2020 Apple's M-series chips (M1, M2, M3 and so on) have brought ARM to Macs with excellent battery life and speed. ARM is spreading in the cloud too, for example AWS Graviton and Google Axion, usually cheaper per unit of work.</p>
  <table class="tbl">
    <tr><th></th><th>x86-64</th><th>ARM64 (aarch64)</th></tr>
    <tr><td>Design style</td><td>CISC: many complex instructions</td><td>RISC: fewer simple instructions</td></tr>
    <tr><td>Made by</td><td>Intel, AMD</td><td>Apple, Qualcomm, AWS, Ampere and others, licensing ARM's design</td></tr>
    <tr><td>Where</td><td>most PCs, older Macs, most cloud servers</td><td>phones, Apple M-series Macs, Raspberry Pi, Graviton servers</td></tr>
    <tr><td>Strength</td><td>huge software base, high peak speed</td><td>performance per watt, lower cloud cost</td></tr>
    <tr><td>Names you see</td><td><code>x86_64</code>, <code>amd64</code></td><td><code>arm64</code>, <code>aarch64</code></td></tr>
  </table>
  <p>For Python and data work this mostly stays invisible, because your <code>.py</code> files are not machine code; the interpreter is, and there is a version of Python for each ISA. It becomes visible whenever compiled code is involved. Packages like NumPy, pandas and PyTorch contain compiled C or C++ code, so pip downloads a different <strong>wheel</strong> (a pre-built package file) for each platform; that is what tags like <code>manylinux_x86_64</code> or <code>macosx_arm64</code> in a wheel's file name mean. Docker images contain compiled programs too, so an image built on an M-series Mac is ARM64 by default and fails on an x86 server with <code>exec format error</code>, the operating system's way of saying "this machine code is not in my language". The fixes are to build multi-architecture images (<code>docker buildx build --platform linux/amd64,linux/arm64</code>) or to build for the server's platform; see <a class="xref" data-note="se_docker">Docker</a>. Apple's <strong>Rosetta 2</strong> hides the problem on Macs by translating x86 machine code into ARM code on the fly, which is convenient but slower.</p>

  <h2 id="cfc-bus"><span class="num">07</span>The Motherboard and Buses</h2>
  <p>A CPU on its own can do nothing useful; it needs to reach RAM, storage, the GPU and the network card. The <strong>motherboard</strong> is the large printed circuit board that provides the sockets and slots these parts plug into and, more importantly, the copper paths that connect them. A path that carries data between parts is called a <strong>bus</strong>: a shared set of parallel wires plus the rules (the protocol) for who may send what and when. The name comes from the passenger bus, a vehicle that many people share along a fixed route. If the components are the rooms of the kitchen, buses are its corridors, and like corridors they have a width and a speed limit, and so a maximum number of trolleys per second. That limit is called <strong>bandwidth</strong>, measured in gigabytes per second, and the time for one trip, regardless of size, is called <strong>latency</strong>.</p>
  <p>A modern computer has several buses, each built for a different job, and they are arranged by speed. The fastest is the <strong>memory bus</strong> between the CPU and RAM. The memory controller is built into the CPU chip itself and the RAM sticks sit centimetres away, giving tens of gigabytes per second on a laptop and hundreds on a server. Next comes <strong>PCIe</strong> (PCI Express), the main expansion bus, which connects the GPU, fast NVMe SSDs and network cards. PCIe is made of <strong>lanes</strong>, each an independent pair of signal paths, and a device gets 1, 4, 8 or 16 of them; a GPU sits in an "x16" slot, which on PCIe 4.0 gives about 32 GB/s in each direction. Slower devices such as USB ports, audio and older disks hang off the <strong>chipset</strong>, a helper chip on the motherboard that gathers them up and connects them to the CPU through a single link. Here is what Linux sees on this virtual machine:</p>
  <div class="fx" data-lang="text">$ ls /sys/bus/pci/devices | wc -l
11
$ ls /sys/bus/virtio/devices | head -4
virtio0
virtio1
virtio2
virtio3</div>
  <p>Linux finds 11 devices on the virtual PCI bus, and a set of <code>virtio</code> devices: virtual disks and network cards that the hypervisor pretends are attached, so that the guest operating system can talk to them through the same kind of bus a physical machine would use. On a real laptop, <code>lspci</code> (not installed here) lists each device by name, such as the GPU, the Wi-Fi card and the NVMe controller.</p>
  <p>The reason buses matter in data work is that moving data is often slower than processing it. A GPU can do arithmetic on its own memory at thousands of gigabytes per second, but every training batch first has to travel from RAM to the GPU over PCIe at a few tens of gigabytes per second. If the data loader cannot feed batches quickly enough, the expensive GPU sits idle waiting, which is why PyTorch's <code>DataLoader</code> has options like <code>num_workers</code> and <code>pin_memory=True</code> to prepare and copy batches in the background (see <a class="xref" data-note="dl_pytorch">PyTorch</a>). The same pattern, fast processors starved by slow corridors, appears with disks feeding pandas and with the network feeding Spark. When something is slow, the first question is often not "is the CPU fast enough?" but "where is the data, and how fast can it get here?"</p>

  <h2 id="cfc-parallel"><span class="num">08</span>Serial vs Parallel Work</h2>
  <p>Back to <code>score.py</code>. It has eight batches of customers to score, and the batches do not depend on each other. Written the normal way, as a <code>for</code> loop, the program runs <strong>serially</strong>: batch 1 completes, then batch 2 starts, and so on, all on one core. Running <strong>in parallel</strong> means doing several pieces of work at literally the same instant on different cores. With four cores and eight independent batches, four batches could run at once, and the whole job could take about a quarter of the time. Think of eight customers waiting at a bank with one cashier open versus four cashiers open.</p>
  <p>The CPU will not do this on its own; the program has to split the work and give a piece to each core. The operating system can only run one stream of instructions per logical CPU at a time, and each stream belongs to a <strong>process</strong> (a running program with its own memory) or to a <strong>thread</strong> (a separate stream of instructions inside a process, sharing its memory); both are explained in <a class="xref" data-note="cf_os">Operating Systems</a>. In Python there is an extra twist: the standard interpreter has a <strong>GIL</strong> (global interpreter lock) that lets only one thread run Python code at a time within a process. So for CPU-heavy pure-Python work, the reliable way to use several cores is several processes, which the <code>multiprocessing</code> module makes easy. Here is the real experiment, on this 4-core machine:</p>
  <div class="fx" data-lang="py">import time
from multiprocessing import Pool
from concurrent.futures import ThreadPoolExecutor

def score(batch_id):
    # a CPU-heavy stand-in for "compute features for one batch of customers"
    total = 0
    for i in range(6_000_000):
        total += (i * batch_id) % 7
    return total

batches = list(range(1, 9))                 # 8 batches of work

if __name__ == "__main__":
    t = time.perf_counter()
    serial = [score(b) for b in batches]
    base = time.perf_counter() - t
    print(f"serial, 1 core       : {base:.2f} s")

    for workers in (2, 4):
        t = time.perf_counter()
        with Pool(workers) as pool:
            parallel = pool.map(score, batches)
        secs = time.perf_counter() - t
        print(f"{workers} processes          : {secs:.2f} s  (speed-up x{base / secs:.1f})")

    t = time.perf_counter()
    with ThreadPoolExecutor(4) as ex:
        threaded = list(ex.map(score, batches))
    print(f"4 threads (same proc): {time.perf_counter() - t:.2f} s")
    print("same answers:", serial == parallel == threaded)</div>
  <div class="fx" data-lang="text">serial, 1 core       : 2.40 s
2 processes          : 1.20 s  (speed-up x2.0)
4 processes          : 0.72 s  (speed-up x3.3)
4 threads (same proc): 2.54 s
same answers: True</div>
  <p>The serial loop is the baseline, with one core doing all eight batches while the other three sit idle. With a pool of 2 processes the job runs close to twice as fast, and with 4 processes faster again, because now every core is busy: <code>pool.map</code> sent the eight batches out to the worker processes and collected the answers back in order, which is why the final check prints <code>True</code>. The 4-process speed-up is below the ideal of four times, because starting the worker processes costs time and other programs were sharing this machine's CPUs during the run; the exact timings move around from run to run, so read them as approximate. The last line is the important contrast: 4 <em>threads</em> took about as long as the serial version, because the GIL let only one of them execute Python at a time. That trade-off, and why threads are still the right tool for work that mostly waits on the network or disk, is covered in <a class="xref" data-note="py_concurrency">Concurrency vs Parallelism</a>, <a class="xref" data-note="py_threading">Threads &amp; the GIL</a> and <a class="xref" data-note="py_multiprocessing">Processes: multiprocessing</a>.</p>
  <p>Parallelism has limits, and knowing them saves a lot of disappointment. Starting processes and shipping data to them costs time, so splitting tiny tasks can make a program slower; with very short batches the overhead swamps the gain. Using more workers than cores does not help CPU-heavy work, because the extra workers just take turns. And almost every program has some part that cannot be split, such as reading the input file or combining results at the end. <strong>Amdahl's law</strong> puts a number on this: if a fraction <em>p</em> of the work can run in parallel on <em>n</em> cores, the best possible speed-up is 1 / ((1 − <em>p</em>) + <em>p</em> / <em>n</em>). If 90 percent of a job is parallel, even infinitely many cores can make it at most ten times faster, because the serial 10 percent remains. You meet this idea everywhere: <code>n_jobs=-1</code> in scikit-learn means "one worker per logical CPU", Spark splits a dataset into partitions and gives each executor core one at a time (<a class="xref" data-note="de_spark">Spark</a>), and NumPy's matrix routines quietly use several cores through their underlying maths library.</p>

  <h2 id="cfc-gpu"><span class="num">09</span>GPU vs CPU</h2>
  <p>Even a 64-core CPU is small next to the amount of arithmetic in modern machine learning. Training a neural network is mostly multiplying large matrices, millions of multiply-and-add operations that are all the same calculation applied to different numbers, and none depends on the others. A CPU core is built for the opposite kind of work: long chains of varied instructions with lots of branching ("if this, then that"), where the next step depends on the last one. To be good at that, each core spends most of its transistors on clever control logic and large caches, and only a small part on arithmetic.</p>
  <p>A <strong>GPU</strong> (graphics processing unit) makes the opposite trade. It was invented to draw images, where the colour of each of millions of pixels is computed by the same small program, so it has thousands of simple cores that each do little more than arithmetic, organised in groups that execute the same instruction at the same time on different data. A CPU is a handful of master chefs who can each cook any dish from start to finish; a GPU is a thousand kitchen assistants who can only chop, but who all chop at once. Give the thousand assistants a sack of onions and they finish long before the chefs; give them a complicated recipe with many decisions and they are hopeless. An NVIDIA H100, a common data-centre GPU, has around 17,000 of these simple cores, plus special <strong>tensor cores</strong> that each multiply small matrices in one step, and its own very fast memory (<strong>VRAM</strong>, around 80 GB of it on an H100) because the PCIe bus from section 07 is far too slow to feed it from main RAM.</p>
  <figure class="viz"><svg viewBox="0 0 620 200" width="620">
<rect x="20" y="20" width="250" height="150" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<rect x="34" y="34" width="104" height="58" rx="5" class="fb sb"/><text x="86" y="67" text-anchor="middle">core</text>
<rect x="152" y="34" width="104" height="58" rx="5" class="fb sb"/><text x="204" y="67" text-anchor="middle">core</text>
<rect x="34" y="100" width="104" height="58" rx="5" class="fb sb"/><text x="86" y="133" text-anchor="middle">core</text>
<rect x="152" y="100" width="104" height="58" rx="5" class="fb sb"/><text x="204" y="133" text-anchor="middle">core</text>
<text x="145" y="190" text-anchor="middle" class="tm" font-size="10.5">CPU: few big cores, smart control, big caches</text>
<rect x="350" y="20" width="250" height="150" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<rect x="363" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="26" width="12" height="12" rx="2" class="fg sg"/><rect x="363" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="42" width="12" height="12" rx="2" class="fg sg"/><rect x="363" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="58" width="12" height="12" rx="2" class="fg sg"/><rect x="363" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="74" width="12" height="12" rx="2" class="fg sg"/><rect x="363" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="90" width="12" height="12" rx="2" class="fg sg"/><rect x="363" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="106" width="12" height="12" rx="2" class="fg sg"/><rect x="363" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="122" width="12" height="12" rx="2" class="fg sg"/><rect x="363" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="138" width="12" height="12" rx="2" class="fg sg"/><rect x="363" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="379" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="395" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="411" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="427" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="443" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="459" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="475" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="491" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="507" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="523" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="539" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="555" y="154" width="12" height="12" rx="2" class="fg sg"/><rect x="571" y="154" width="12" height="12" rx="2" class="fg sg"/>
<text x="475" y="190" text-anchor="middle" class="tm" font-size="10.5">GPU: thousands of small cores, same instruction</text>
</svg><figcaption>Where the transistors go. A CPU spends them on a few powerful cores that handle any sequence of instructions quickly; a GPU spends them on very many simple cores that apply one operation to lots of data at once.</figcaption></figure>
  <p>This style is called <strong>data parallelism</strong>, or SIMD (single instruction, multiple data). Even a CPU has a small version of it: special wide registers that hold, say, eight or sixteen numbers and an instruction that adds all of them at once (the <code>avx2</code> and <code>avx512</code> entries in this machine's <code>lscpu</code> flags are exactly these). There is no GPU in this virtual machine, but we can feel the effect of "same operation on a whole array, done in compiled code" with NumPy, which uses those SIMD instructions:</p>
  <div class="fx" data-lang="py">import time
import numpy as np

prices = np.random.default_rng(0).random(10_000_000)

t = time.perf_counter()
total = 0.0
for p in prices:                        # one number at a time
    total += p * 1.18
loop_s = time.perf_counter() - t

t = time.perf_counter()
total_np = (prices * 1.18).sum()        # the whole array in one call
np_s = time.perf_counter() - t

print(f"Python loop : {loop_s:.2f} s")
print(f"NumPy       : {np_s:.3f} s  (about x{loop_s / np_s:.0f} faster)")
print("same result:", np.isclose(total, total_np))</div>
  <div class="fx" data-lang="text">Python loop : 1.41 s
NumPy       : 0.044 s  (about x32 faster)
same result: True</div>
  <p>Both versions compute the same sum, as the last line confirms, but the NumPy version is dozens of times faster on the same CPU (timings approximate). The Python loop paid the interpreter's bookkeeping cost for every one of the ten million prices; NumPy handed the whole array to a compiled loop that streams through memory and uses SIMD instructions. A GPU takes the same idea much further, with thousands of lanes instead of eight or sixteen, which is why the same matrix multiplication can be ten to a hundred times faster again on a GPU. On a machine with an NVIDIA GPU, the command <code>nvidia-smi</code> shows the card, its memory use and which processes are using it; in PyTorch, <code>torch.cuda.is_available()</code> tells you whether one is visible, and <code>tensor.to("cuda")</code> copies data into its memory (see <a class="xref" data-note="dl_pytorch">PyTorch</a>).</p>
  <p>GPUs are not faster at everything. Work with lots of branching, small data, or a strict step-by-step order (parsing JSON, running a web server, most pandas operations with Python functions in them) stays on the CPU, and copying data to and from the GPU takes time, so tiny jobs can be slower there. That is why a typical ML machine pairs a CPU that loads and prepares data with a GPU that does the heavy matrix maths, and why tree models such as XGBoost and most classic scikit-learn models are usually trained on CPUs. Google's <strong>TPU</strong> (tensor processing unit) pushes specialisation further still: a chip built only for the matrix operations of neural networks.</p>

  <h2 id="cfc-boot"><span class="num">10</span>What Happens When a Computer Starts</h2>
  <p>There is a puzzle hidden in everything above. The CPU only runs instructions it finds in RAM, but RAM is empty when the power comes on, and the operating system that knows how to load programs from storage is itself a program sitting in storage. Something has to run first. The answer is a small program stored in <strong>ROM</strong> (read-only memory), a chip on the motherboard whose contents survive without power. Today this is usually flash memory, which can be updated, but it is still called ROM because normal programs never write to it. The software it holds is called <strong>firmware</strong>, software built into the hardware. When power arrives, the CPU is designed to start fetching instructions from one fixed address, and that address points into this chip.</p>
  <p>On older PCs the firmware was the <strong>BIOS</strong> (basic input/output system), dating from 1981; since around 2010 it has been replaced on almost all machines by <strong>UEFI</strong> (unified extensible firmware interface), which does the same job but understands large modern disks, has a proper settings screen, and supports Secure Boot, which refuses to start an operating system that is not digitally signed. People still loosely say "BIOS" for both. Starting the computer is called <strong>booting</strong>, from the phrase "pulling yourself up by your bootstraps", because each stage loads a slightly bigger program that can do more than the one before.</p>
  <figure class="viz"><svg viewBox="0 0 640 120" width="640">
<defs><marker id="cfc-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="30" width="100" height="54" rx="7" class="fr sr"/><text x="60" y="54" text-anchor="middle" font-size="11" font-weight="700">power on</text><text x="60" y="71" text-anchor="middle" class="tm" font-size="9.5">CPU jumps to ROM</text>
<rect x="138" y="30" width="110" height="54" rx="7" class="fb sb"/><text x="193" y="54" text-anchor="middle" font-size="11" font-weight="700">UEFI / BIOS</text><text x="193" y="71" text-anchor="middle" class="tm" font-size="9.5">POST: check hardware</text>
<rect x="276" y="30" width="100" height="54" rx="7" class="ft st"/><text x="326" y="54" text-anchor="middle" font-size="11" font-weight="700">boot loader</text><text x="326" y="71" text-anchor="middle" class="tm" font-size="9.5">e.g. GRUB</text>
<rect x="404" y="30" width="100" height="54" rx="7" class="fg sg"/><text x="454" y="54" text-anchor="middle" font-size="11" font-weight="700">OS kernel</text><text x="454" y="71" text-anchor="middle" class="tm" font-size="9.5">drivers, memory</text>
<rect x="532" y="30" width="100" height="54" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="582" y="54" text-anchor="middle" font-size="11" font-weight="700">first process</text><text x="582" y="71" text-anchor="middle" class="tm" font-size="9.5">PID 1 starts the rest</text>
<line x1="110" y1="57" x2="136" y2="57" stroke="currentColor" marker-end="url(#cfc-a2)"/><line x1="248" y1="57" x2="274" y2="57" stroke="currentColor" marker-end="url(#cfc-a2)"/><line x1="376" y1="57" x2="402" y2="57" stroke="currentColor" marker-end="url(#cfc-a2)"/><line x1="504" y1="57" x2="530" y2="57" stroke="currentColor" marker-end="url(#cfc-a2)"/>
<text x="320" y="112" text-anchor="middle" class="tm" font-size="10">each stage loads a bigger program from storage into RAM, then hands over control</text>
</svg><figcaption>The boot sequence. Firmware in ROM runs first, checks the hardware and loads the boot loader from disk; the boot loader loads the kernel; the kernel starts the first process.</figcaption></figure>
  <p>Step by step: the firmware first runs the <strong>POST</strong> (power-on self-test), checking that the CPU, RAM and essential devices respond; the beeps an old PC made on a fault came from here. It then looks through the storage devices in the configured boot order for a <strong>boot loader</strong>, a small program whose only job is to find the operating system and load it (GRUB on most Linux machines, Windows Boot Manager on Windows). The boot loader copies the operating system's core, the <strong>kernel</strong>, from disk into RAM and jumps to it. The kernel sets up memory management, starts the <strong>drivers</strong> that know how to talk to each device, mounts the file systems, and finally starts the very first ordinary program, process number 1 (on most Linux systems <code>systemd</code>), which in turn starts everything else: network services, the login screen, and eventually your terminal and <code>python score.py</code>. Cloud virtual machines skip part of this, because the hypervisor can load the kernel straight into the VM's memory. You can see that on this machine:</p>
  <div class="fx" data-lang="text">$ ls /sys/firmware
acpi
memmap
$ ls -d /sys/firmware/efi
ls: cannot access '/sys/firmware/efi': No such file or directory</div>
  <p>A Linux machine that booted through UEFI has a <code>/sys/firmware/efi</code> folder, through which the kernel can read UEFI's settings. This virtual machine does not, because no UEFI ran: the hypervisor started the kernel directly. On a laptop or a typical cloud VM image you would see the folder. Boot problems are rare in data work, but the vocabulary comes up when you create cloud VMs (choosing a "UEFI" or "Secure Boot" image), install Linux on a machine, or read why a server took minutes to come back after a reboot; what the kernel does once it is running is the subject of <a class="xref" data-note="cf_os">Operating Systems</a>.</p>

  <h2 id="cfc-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The first mistake is comparing processors by clock speed alone. GHz says how often the clock ticks, not how much gets done per tick, and that varies between designs and generations. A newer 3 GHz chip often beats an older 4 GHz one, and an ARM chip at a lower clock can beat an x86 chip at a higher one. Compare chips with benchmarks of the work you actually do, such as the time to train your model or run your test suite.</p>
  <p>The second is expecting threads to make CPU-heavy Python faster. As the experiment in section 08 showed, four threads doing pure-Python arithmetic took about as long as one, because of the GIL. Use processes (<code>multiprocessing</code>, <code>ProcessPoolExecutor</code>, <code>n_jobs</code> in scikit-learn and joblib) for CPU-bound work and threads or <code>asyncio</code> for work that mostly waits. Libraries such as NumPy release the GIL inside their compiled code, which is why threads can help there.</p>
  <p>The third is asking the wrong question about how many cores you have. <code>os.cpu_count()</code> reports the logical CPUs of the whole machine, but a process can be restricted to fewer, by the operating system, by a job scheduler, or by a container limit. Here the same script runs normally, and then restricted to two CPUs with the Linux <code>taskset</code> command:</p>
  <div class="fx" data-lang="py">import os

print("os.cpu_count()        :", os.cpu_count())          # CPUs in the machine
print("os.process_cpu_count():", os.process_cpu_count())  # CPUs THIS process may use</div>
  <div class="fx" data-lang="text">os.cpu_count()        : 4
os.process_cpu_count(): 4</div>
  <div class="fx" data-lang="text">$ taskset -c 0,1 python3 c_affinity.py
os.cpu_count()        : 4
os.process_cpu_count(): 2</div>
  <p>Under <code>taskset</code> the machine still has 4 CPUs, so <code>os.cpu_count()</code> still says 4, but the process may only use 2, which <code>os.process_cpu_count()</code> (new in Python 3.13; use <code>len(os.sched_getaffinity(0))</code> on older versions) correctly reports. A program that starts one worker per <code>os.cpu_count()</code> would start 4 workers fighting over 2 CPUs. In Docker and Kubernetes the limit is often a CPU <em>quota</em> (for example "1.5 CPUs"), which neither function sees, so set the number of workers explicitly from configuration. A related mistake is <strong>oversubscription</strong>: running 4 worker processes that each use a NumPy or PyTorch library which itself starts 4 threads gives 16 busy threads on 4 cores, and everything slows down; environment variables such as <code>OMP_NUM_THREADS=1</code> stop the inner libraries from multiplying the count.</p>
  <p>The fourth is forgetting the <code>if __name__ == "__main__":</code> guard around multiprocessing code. On Linux, worker processes are created by copying the parent, so a script without the guard happens to work. On macOS and Windows the default start method is "spawn", where each worker starts a fresh Python that re-imports your script; without the guard every worker tries to create its own pool, and the program crashes with a <code>RuntimeError</code> or hangs. The demo in section 08 has the guard for exactly this reason.</p>
  <p>The fifth is building for the wrong architecture. An image built on an Apple M-series Mac is ARM64; pushed to an x86 server, it fails with <code>exec format error</code>. The reverse happens too, and a compiled Python package installed for one platform cannot be copied to another. Build with <code>--platform linux/amd64</code> (or a multi-platform build) when the target is x86, and let pip install packages on the machine that will run them.</p>

  <h2 id="cfc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The parts</h3>
  <table class="tbl">
    <tr><th>Part</th><th>What it does</th><th>Key property</th><th>Kitchen analogy</th></tr>
    <tr><td>CPU</td><td>executes instructions</td><td>cores, GHz, ISA</td><td>the chef</td></tr>
    <tr><td>RAM</td><td>holds running programs and their data</td><td>fast, volatile, GBs</td><td>the worktop</td></tr>
    <tr><td>Storage (SSD/HDD)</td><td>keeps files permanently</td><td>slow, persistent, TBs</td><td>the pantry</td></tr>
    <tr><td>I/O devices</td><td>bring data in, send results out</td><td>keyboard, screen, network card</td><td>order slips, serving hatch</td></tr>
    <tr><td>Motherboard / buses</td><td>connect the parts</td><td>bandwidth (GB/s), latency</td><td>corridors</td></tr>
    <tr><td>GPU</td><td>same maths on lots of data at once</td><td>thousands of cores, own VRAM</td><td>a thousand helpers who only chop</td></tr>
  </table>
  <h3>Key terms</h3>
  <ul>
    <li><b>Instruction</b>: one tiny operation the CPU can do (load, add, store, jump), encoded as a number; <b>machine code</b> = a program as these numbers.</li>
    <li><b>Register</b>: a tiny slot inside the CPU holding one value; <b>program counter</b>: holds the address of the next instruction.</li>
    <li><b>Fetch–decode–execute</b>: read the instruction at the PC, work out what it means, do it; repeat.</li>
    <li><b>Clock speed</b>: ticks per second (2.1 GHz = 2.1 billion); real speed ≈ GHz × instructions per cycle (IPC).</li>
    <li><b>Core</b>: an independent processing unit; <b>hardware thread / logical CPU</b>: an instruction stream a core can hold; <b>hyper-threading (SMT)</b>: 2 per core, ~10–30% gain.</li>
    <li><b>vCPU</b>: one logical CPU of a cloud server (often half a core on x86, a full core on Graviton).</li>
    <li><b>Word size</b>: bits per register and address; 32-bit addresses reach only 4 GiB.</li>
    <li><b>ISA</b>: the CPU's instruction menu; x86-64 (CISC) vs ARM64 (RISC).</li>
    <li><b>Bus</b>: shared wires + rules connecting parts; memory bus (fastest), PCIe lanes, chipset/USB.</li>
    <li><b>Amdahl's law</b>: speed-up ≤ 1 / ((1 − p) + p / n); the serial part limits everything.</li>
    <li><b>SIMD / data parallelism</b>: one instruction applied to many values at once (CPU AVX, GPUs).</li>
    <li><b>Firmware / ROM</b>: built-in startup software in non-volatile memory; <b>BIOS</b> (old) → <b>UEFI</b> (modern).</li>
    <li><b>Boot</b>: power on → firmware POST → boot loader → kernel → PID 1 → everything else.</li>
  </ul>
  <h3>Commands</h3>
  <div class="fx" data-lang="py"># Linux shell
#   nproc                 logical CPUs this process may use
#   lscpu                 sockets, cores, threads per core, caches, architecture
#   free -h               RAM
#   lsblk                 disks
#   nvidia-smi            GPUs (if present)
import os, platform, sys
os.cpu_count()             # logical CPUs in the machine
os.process_cpu_count()     # logical CPUs this process may use (3.13+)
platform.machine()         # 'x86_64' or 'arm64' / 'aarch64'
sys.maxsize == 2**63 - 1   # True on a 64-bit Python

from multiprocessing import Pool
if __name__ == "__main__":         # required on macOS / Windows
    with Pool(4) as pool:
        results = pool.map(score, batches)</div>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th></th><th>CPU</th><th>GPU</th></tr>
    <tr><td>Cores</td><td>few (4–128), powerful</td><td>thousands, simple</td></tr>
    <tr><td>Good at</td><td>varied, branching, step-by-step logic</td><td>same maths on huge arrays (matrix multiply)</td></tr>
    <tr><td>Memory</td><td>system RAM</td><td>own VRAM, fed over PCIe</td></tr>
    <tr><td>In ML</td><td>data loading, trees, classic models</td><td>deep learning training and inference</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>GHz only compares chips of the same design.</li>
    <li>Hyper-threading doubles logical CPUs, not speed.</li>
    <li>Python threads do not speed up CPU-bound Python (GIL); use processes.</li>
    <li><code>os.cpu_count()</code> ignores affinity and container quotas.</li>
    <li>ARM images/wheels do not run on x86 and vice versa: <code>exec format error</code>.</li>
    <li>Moving data (PCIe, disk, network) is often slower than computing on it.</li>
  </ul>

  <h2 id="cfc-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are the main components of a computer and what does each do?</summary><div class="qa-body">The CPU executes instructions; RAM holds the running programs and the data they are working on, fast but lost when power goes off; storage (SSD or HDD) keeps files permanently but is much slower; input/output devices bring data in and send results out; and the motherboard's buses connect them all. Many machines add a GPU for highly parallel maths. A program is loaded from storage into RAM, executed by the CPU, and its results go out through I/O.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the fetch–decode–execute cycle.</summary><div class="qa-body">The CPU repeatedly fetches the instruction whose address is in the program counter and advances the counter, decodes it to work out the operation and operands, and executes it using the ALU or by reading/writing memory. A jump instruction changes the program counter, which is how loops and branches work. Modern CPUs pipeline these stages so several instructions are in flight at once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a register, and how is it different from RAM?</summary><div class="qa-body">A register is a tiny storage slot inside the CPU that holds a single value, usually 64 bits, and can be read in under a nanosecond. There are only a few dozen of them. RAM is separate chips holding gigabytes, and reaching it takes tens to around a hundred nanoseconds. The CPU computes on registers and uses RAM to load inputs and store results.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does clock speed mean? Is a higher GHz CPU always faster?</summary><div class="qa-body">Clock speed is how many cycles the CPU's clock ticks per second; 3 GHz is 3 billion. It is not always faster, because work done per cycle (IPC) differs between designs, and core count, cache size and memory speed matter too. GHz only compares chips of the same family; otherwise compare benchmarks of your real workload.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did CPUs stop getting much faster clocks and start adding cores?</summary><div class="qa-body">Around 2005 clock speeds hit the power wall: higher frequency needs higher voltage, and power and heat grow steeply, so chips could not be cooled beyond roughly 4–5 GHz. Transistor counts kept rising, so manufacturers used them to put several cores on one chip. The catch is that software must be written to use multiple cores to benefit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a core and a thread? What is hyper-threading?</summary><div class="qa-body">A core is a physical processing unit with its own execution machinery. A hardware thread (logical CPU) is an instruction stream a core can hold; with hyper-threading (Intel's name for simultaneous multithreading) each core holds two and switches to the other when one stalls. The OS sees twice as many CPUs, but the gain is typically 10–30%, not 2×. A software thread is different again: a stream of execution inside a process, scheduled by the OS onto logical CPUs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a vCPU in the cloud?</summary><div class="qa-body">A vCPU is one logical CPU of the physical host given to your virtual machine. On most Intel and AMD instances it is one hyper-thread, so 2 vCPUs equal one physical core; on ARM instances like AWS Graviton one vCPU is a full core. That is why CPU-heavy jobs on x86 instances often scale with vCPUs/2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between 32-bit and 64-bit?</summary><div class="qa-body">It is the CPU's word size: the width of its registers and memory addresses. A 32-bit CPU addresses at most 2<sup>32</sup> bytes, 4 GiB, which is why 32-bit systems could not use more RAM than that; 64-bit addresses remove that limit for practical purposes and let the CPU handle 64-bit integers in one instruction. This is separate from data types like <code>int32</code> or <code>float32</code>, which are about the size of one value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an instruction set architecture? Compare x86 and ARM.</summary><div class="qa-body">An ISA is the set of instructions, registers and encodings a CPU family understands; machine code is written for a specific ISA. x86-64 (Intel, AMD) is CISC: a large, complex, variable-length instruction set with decades of compatibility, dominant in PCs and servers. ARM64 is RISC: simpler fixed-length instructions, very power-efficient, used in phones, Apple M-series Macs and cloud chips like Graviton.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A Docker image built on a MacBook fails on the server with "exec format error". Why?</summary><div class="qa-body">An Apple M-series Mac is ARM64, so by default Docker builds an ARM64 image whose programs are ARM machine code. The server is x86-64 and cannot execute that code, and the kernel reports it as an exec format error. Fix it by building for the target, <code>docker buildx build --platform linux/amd64</code>, or a multi-platform image.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a bus? What is PCIe?</summary><div class="qa-body">A bus is a shared communication path, wires plus a protocol, that carries data between components. The memory bus connects CPU and RAM and is the fastest; PCIe is the high-speed expansion bus for GPUs, NVMe SSDs and network cards, made of lanes (x1, x4, x16). Bandwidth limits how fast data can move, so for example the PCIe link from RAM to a GPU can bottleneck training if data loading is not overlapped with compute.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are GPUs used for machine learning?</summary><div class="qa-body">Training and inference are dominated by matrix multiplications: huge numbers of identical, independent multiply-adds. A GPU has thousands of simple cores (and tensor cores for small matrix products) that apply the same instruction to many values at once, plus very high-bandwidth memory, so it does this work tens to hundreds of times faster than a CPU. CPUs remain better for branching, sequential logic and small tasks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would a GPU be slower than a CPU?</summary><div class="qa-body">When the work is small, branching or sequential, or when copying data to and from GPU memory costs more than the computation saves. Examples are processing a few rows, string parsing, row-by-row Python logic and tree-based models with lots of branching. The PCIe transfer and kernel-launch overheads are fixed costs that only pay off on large parallel workloads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have 4 cores. Why does your job not run 4 times faster with 4 workers?</summary><div class="qa-body">Part of every job is serial (reading input, combining results), and Amdahl's law says that part caps the speed-up. Starting processes and moving data between them adds overhead, other programs share the cores, and memory bandwidth or disk can become the bottleneck. With hyper-threaded or cloud vCPUs, 4 logical CPUs may only be 2 physical cores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For CPU-heavy Python code, should you use threads or processes?</summary><div class="qa-body">Processes. CPython's GIL lets only one thread run Python bytecode at a time per process, so threads give no speed-up for pure-Python computation, while separate processes each have their own interpreter and run on different cores. Threads are right for I/O-bound work, and for libraries like NumPy that release the GIL inside compiled code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you decide how many worker processes to start in a container?</summary><div class="qa-body">Do not trust <code>os.cpu_count()</code>, which reports the host's CPUs. Use the CPUs actually available (<code>os.process_cpu_count()</code> or <code>len(os.sched_getaffinity(0))</code>) and the container's CPU quota, ideally passed in as configuration. For CPU-bound work use about one worker per available core, and set <code>OMP_NUM_THREADS</code> so libraries inside each worker do not oversubscribe.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when you press the power button?</summary><div class="qa-body">The CPU starts executing firmware (UEFI or BIOS) stored in ROM on the motherboard. The firmware runs the power-on self-test, finds a boot device and loads its boot loader (such as GRUB), which loads the operating system kernel into RAM. The kernel initialises memory management and drivers, mounts file systems, and starts the first process (PID 1, e.g. systemd), which starts all other services and the login screen.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between BIOS and UEFI?</summary><div class="qa-body">Both are motherboard firmware that initialise hardware and start the boot loader. BIOS is the original 1980s design with tight limits, such as booting from disks up to about 2 TB using the old MBR partition scheme. UEFI is its modern replacement: it supports large GPT disks, faster boot, a richer interface and Secure Boot, which verifies the boot loader's signature.</div></details>
</main>
`
});
