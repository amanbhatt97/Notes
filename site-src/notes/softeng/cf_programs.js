// notes/softeng/cf_programs.js — From Code to a Running Program
Object.assign(TOPIC_CONTENT, {
  "cf_programs": `<main>
<h1>From Code to a Running Program</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>From Code to a Running Program</span></div>
  <p class="lead">The code you write is text meant for people, but a processor can only follow its own very simple numeric instructions, so something has to turn one into the other before anything runs. How that translation happens explains a surprising number of everyday facts: why a Python loop is slow while the same work in NumPy is fast, why some errors appear before a program runs and others only halfway through, why a package installs fine on your laptop but fails on a server, and what people mean by compilers, interpreters, runtimes, libraries, frameworks, APIs and SDKs. One small task runs through the whole page: add up the squares of the first million whole numbers, 0×0 + 1×1 + 2×2 and so on. It is the same kind of arithmetic that sits inside a variance, a mean squared error or a dot product. We will write it in C and compile it, write it in Python and look inside the interpreter, run it through NumPy, and see what each version depends on to run. Every command was run on this page's machine, a Linux virtual machine, so sizes, addresses and timings are that VM's.</p>

  <h2 id="cfp-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Code to running program</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Languages</div>
        <ul>
          <li>The CPU runs only <b>machine code</b>: numbered instructions as bytes</li>
          <li><b>Low-level</b> (assembly, C) is close to the hardware; <b>high-level</b> (Python) is close to people</li>
          <li><b>Source code</b> must be translated before it can run</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Translators</div>
        <ul>
          <li><b>Compiler</b>: translates the whole program ahead of time into an executable</li>
          <li><b>Interpreter</b>: reads and carries out the program as it runs</li>
          <li>CPython: source → <b>bytecode</b> → interpreter loop</li>
          <li><b>JIT</b>: compiles hot code to machine code while running (PyPy, Numba, JVM)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What code runs on</div>
        <ul>
          <li><b>Runtime</b>: the support a program needs while running (interpreter, GC, standard library)</li>
          <li><b>Library</b>: you call it; <b>framework</b>: it calls you</li>
          <li><b>API</b>: the agreed interface; <b>SDK</b>: a kit of tools for one platform</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sharing and shipping</div>
        <ul>
          <li><b>Shared libraries</b> (.so, .dll, .dylib) are loaded at run time</li>
          <li>NumPy and pandas are fast because the loops are compiled C</li>
          <li><b>Dependencies</b> and their versions decide whether code runs elsewhere</li>
          <li>Fix "works on my machine" with pinned versions, virtual environments, Docker</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfp-hw"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Hardware and Software</span><span class="rm-sub">the machine, the instructions, and what a program really is</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-levels"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">High-Level and Low-Level Languages</span><span class="rm-sub">from machine code to Python</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-translate"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">From Source Code to Machine Code</span><span class="rm-sub">the translation problem and its two classic answers</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-compiler"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Compilers</span><span class="rm-sub">compiling and running a small C program</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-interp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Interpreters and Python Bytecode</span><span class="rm-sub">what really happens when you run a .py file</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-jit"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Compiler vs Interpreter, and JIT</span><span class="rm-sub">the trade-offs, and the best of both</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-runtime"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Runtime Environment</span><span class="rm-sub">what a program needs around it while it runs</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-libs"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Libraries, Frameworks, APIs and SDKs</span><span class="rm-sub">four words that are often confused</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-shared"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Shared Libraries and Why NumPy Is Fast</span><span class="rm-sub">.so and .dll files, ldd, and C underneath Python</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-deps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Dependencies and "Works on My Machine"</span><span class="rm-sub">why code breaks when it moves, and how to stop it</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Python loops over arrays, unpinned versions, wrong platform</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, comparison tables, commands</span></div></div>
      <div class="rm-item rm-done" data-target="cfp-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on this topic</span></div></div>
    </div>
  </div>

  <h2 id="cfp-hw"><span class="num">01</span>Hardware and Software</h2>
  <p>A computer is made of two very different kinds of thing. <strong>Hardware</strong> is the physical machine: the processor (CPU), the memory chips (RAM), the disk, the screen, the network card, everything you could in principle touch. <strong>Software</strong> is the set of instructions that tells the hardware what to do: the operating system, Python, your notebook, your scripts. Hardware without software is a box that can do nothing useful; software without hardware is a list of instructions with nobody to follow them. The same laptop becomes a spreadsheet, a game or a model-training machine depending only on which software it runs, which is the whole point of a general-purpose computer.</p>
  <p>A good comparison is a piano and sheet music. The piano is the hardware: it can produce any note, but on its own it plays nothing. The sheet music is the software: it says which notes to play, in which order, for how long. Change the sheet music and the same piano plays a completely different piece.</p>
  <p>The crucial detail is what kind of instructions the hardware actually understands. A CPU does not understand Python, English or even the word "add". It understands only its own small, fixed set of very basic operations, its <strong>instruction set</strong>: load a number from memory into a tiny storage slot inside the CPU (a <strong>register</strong>), multiply two registers, add them, compare them, jump to a different instruction if a comparison came out a certain way, store a register back into memory. Each operation is encoded as a pattern of bytes, and a program the CPU can run directly is just a long sequence of these byte patterns, called <strong>machine code</strong>. Intel and AMD processors in most laptops and cloud servers use the x86-64 instruction set; Apple's M-series chips, phones and many newer cloud servers use ARM. The two speak different machine languages, which will matter later when we talk about why code built for one does not run on the other. How the CPU fetches and executes these instructions is covered in <a class="xref" data-note="cf_computer">How a Computer Works</a>.</p>
  <p>So every program, however it was written, must in the end reach the CPU as machine code. A program, in this sense, is any set of instructions that has been put into a form some machine can carry out, and the rest of this page is about the different routes from the text you type to the instructions the CPU runs.</p>

  <h2 id="cfp-levels"><span class="num">02</span>High-Level and Low-Level Languages</h2>
  <p>If the CPU only understands machine code, why not write machine code directly? Because it is almost impossible for people to work with. Here are four real bytes from the middle of our compiled sum-of-squares program: <code>48 0f af c8</code>. They mean "multiply register <code>rax</code> into register <code>rcx</code>". A whole program is millions of such bytes, with nothing to say what any of them is for, and it only works on one family of processors. The first programmers really did work this way, and it was slow, error-prone and impossible to move to a new machine.</p>
  <p>Programming languages were invented to close that gap, and they are often described by their <strong>level</strong>: how close they are to the hardware (low) or to human thinking (high). A <strong>low-level language</strong> gives you direct control over the machine's details, such as registers, memory addresses and exactly how many bytes each value uses, at the cost of having to manage all of it yourself. A <strong>high-level language</strong> lets you describe what you want in terms closer to the problem, such as lists, dictionaries, strings and objects, and handles the machine details for you, at the cost of some speed and control. It is like giving directions: a low-level description says "turn the steering wheel 30 degrees left, press the accelerator 20% for 4 seconds", a high-level one says "drive to the station".</p>
  <table class="tbl">
    <tr><th>Level</th><th>Example</th><th>What our sum looks like</th><th>You manage</th></tr>
    <tr><td>Machine code</td><td>raw bytes for x86-64</td><td><code>48 0f af c8</code> ...</td><td>everything, as numbers</td></tr>
    <tr><td>Assembly</td><td>x86-64 or ARM assembly</td><td><code>imulq %rax, %rcx</code></td><td>registers, memory, jumps, with readable names</td></tr>
    <tr><td>Systems languages</td><td>C, C++, Rust</td><td><code>total += i * i;</code> with declared types</td><td>types and memory, but not registers</td></tr>
    <tr><td>High-level</td><td>Python, R, JavaScript, Java</td><td><code>total += i * i</code></td><td>the problem; memory is automatic</td></tr>
  </table>
  <p><strong>Assembly language</strong> is machine code written with short readable names instead of numbers, one line per instruction, so it is still tied to one processor family. C, created in the early 1970s, was a big step up: you write loops, functions and variables, and the same C code can be translated for any processor. But C still makes you declare the type of every variable (a whole number of 8 bytes is a <code>long</code>) and manage memory yourself. Python goes much further: you never declare types, lists grow by themselves, and memory is freed automatically. That is why data work is done in Python, and also, as we will see, why Python on its own is slow for heavy number crunching and leans on C underneath. "Low-level" is not an insult and "high-level" is not a compliment; they are different trade-offs between control and convenience.</p>

  <h2 id="cfp-translate"><span class="num">03</span>From Source Code to Machine Code</h2>
  <p>Whatever language you choose, what you write is <strong>source code</strong>: the human-readable text of a program, saved in files such as <code>squares.c</code> or <code>report.py</code>. The CPU cannot run it. Some program has to translate source code into machine code, and there are two classic ways to do it, which differ in <em>when</em> the translation happens.</p>
  <p>Think of a book written in Japanese that you want to read in English. One option is to hire a translator to translate the whole book once, in advance, and print an English edition; after that, anyone can read the English edition quickly, and the translator is no longer needed. The other is to hire an interpreter who sits beside you and translates each sentence aloud as you go; you can start immediately and change the text as you like, but reading is slower, because every sentence is translated every time, and the interpreter has to be there every time you read. Programming uses exactly these two ideas. A <strong>compiler</strong> translates a whole program into machine code ahead of time and saves the result as a file you can run. An <strong>interpreter</strong> is a program that reads your source code and carries it out step by step while it runs, without producing a separate machine-code file.</p>
  <figure class="viz"><svg viewBox="0 0 620 230" width="620">
<defs><marker id="cfp-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="10" y="20" font-size="12">compiled (C)</text>
<rect x="10" y="32" width="100" height="44" rx="5" class="fs" stroke="currentColor"/><text x="60" y="52" text-anchor="middle" font-size="11">squares.c</text><text x="60" y="66" text-anchor="middle" font-size="9" class="tm">source code</text>
<path d="M112,54 L150,54" stroke="currentColor" marker-end="url(#cfp-a1)"/>
<rect x="152" y="32" width="100" height="44" rx="5" class="fb sb"/><text x="202" y="52" text-anchor="middle" font-size="11">gcc</text><text x="202" y="66" text-anchor="middle" font-size="9" class="tm">compiler, once</text>
<path d="M254,54 L292,54" stroke="currentColor" marker-end="url(#cfp-a1)"/>
<rect x="294" y="32" width="110" height="44" rx="5" class="fg sg"/><text x="349" y="52" text-anchor="middle" font-size="11">squares</text><text x="349" y="66" text-anchor="middle" font-size="9" class="tm">machine code file</text>
<path d="M406,54 L520,54" stroke="currentColor" marker-end="url(#cfp-a1)"/><text x="463" y="46" text-anchor="middle" font-size="9" class="tm">run any time</text>
<rect x="522" y="32" width="88" height="44" rx="5" class="fr sr"/><text x="566" y="58" text-anchor="middle" font-size="11">CPU</text>
<text x="10" y="120" font-size="12">interpreted (CPython)</text>
<rect x="10" y="132" width="100" height="44" rx="5" class="fs" stroke="currentColor"/><text x="60" y="152" text-anchor="middle" font-size="11">sum_py.py</text><text x="60" y="166" text-anchor="middle" font-size="9" class="tm">source code</text>
<path d="M112,154 L150,154" stroke="currentColor" marker-end="url(#cfp-a1)"/>
<rect x="152" y="132" width="100" height="44" rx="5" class="fb sb"/><text x="202" y="152" text-anchor="middle" font-size="11">compile step</text><text x="202" y="166" text-anchor="middle" font-size="9" class="tm">inside python3</text>
<path d="M254,154 L292,154" stroke="currentColor" marker-end="url(#cfp-a1)"/>
<rect x="294" y="132" width="110" height="44" rx="5" class="fv" stroke="currentColor"/><text x="349" y="152" text-anchor="middle" font-size="11">bytecode</text><text x="349" y="166" text-anchor="middle" font-size="9" class="tm">.pyc, not for the CPU</text>
<path d="M406,154 L432,154" stroke="currentColor" marker-end="url(#cfp-a1)"/>
<rect x="434" y="132" width="76" height="44" rx="5" class="fb sb"/><text x="472" y="152" text-anchor="middle" font-size="11">interpreter</text><text x="472" y="166" text-anchor="middle" font-size="9" class="tm">loop (in C)</text>
<path d="M512,154 L520,154" stroke="currentColor" marker-end="url(#cfp-a1)"/>
<rect x="522" y="132" width="88" height="44" rx="5" class="fr sr"/><text x="566" y="158" text-anchor="middle" font-size="11">CPU</text>
<text x="310" y="210" text-anchor="middle" font-size="10" class="tm">the interpreter is itself a compiled C program; it is what the CPU actually runs</text>
</svg><figcaption>Two routes to the CPU. A compiler produces a machine-code file once; CPython turns source into bytecode, which its own compiled interpreter loop then carries out every time the program runs.</figcaption></figure>
  <p>The top row is the compiled route: <code>gcc</code> reads <code>squares.c</code> once and writes a file of machine code, which the CPU can then run directly, as many times as you like, without the compiler. The bottom row is how standard Python (CPython) works, and it is a mix. When you run a <code>.py</code> file, Python first compiles it, very quickly, into an intermediate form called <strong>bytecode</strong>, which is a list of simple instructions designed for Python's own virtual machine, not for any real CPU. Then the interpreter, a big loop written in C, reads those bytecode instructions one at a time and carries each one out. Notice that the CPU never runs your Python code directly: it runs the interpreter, which in turn runs your code. The next two sections take each route in turn with our sum-of-squares example.</p>

  <h2 id="cfp-compiler"><span class="num">04</span>Compilers</h2>
  <p>A <strong>compiler</strong> is a program that translates source code written in one language into another, usually lower-level, form, most often machine code for a particular processor, and saves the result so it can be run later without the compiler. The most widely used C compiler on Linux is <code>gcc</code> (the GNU Compiler Collection); others are Clang, which macOS uses, and Microsoft's MSVC on Windows. Here is our task written in C:</p>
  <div class="fx" data-lang="text">#include &lt;stdio.h&gt;
#include &lt;stdlib.h&gt;

/* add up 0*0 + 1*1 + 2*2 + ... + (n-1)*(n-1) */
long sum_squares(long n) {
    long total = 0;
    for (long i = 0; i &lt; n; i++) {
        total += i * i;
    }
    return total;
}

int main(int argc, char *argv[]) {
    long n = argc &gt; 1 ? atol(argv[1]) : 1000000;
    printf("%ld\n", sum_squares(n));
    return 0;
}</div>
  <p>Compared with Python, two things stand out. Every variable has a declared type: <code>long</code> means "a whole number stored in 8 bytes", so the compiler knows exactly how much memory each value needs and which machine instructions to use for it. And there is a <code>main</code> function where the program starts. Now we compile it and run it:</p>
  <div class="fx" data-lang="text">$ gcc -O1 -o squares squares.c
$ ls -l squares.c squares
-rwxr-xr-x 1 root root 16048 Nov 19 05:39 squares
-rw-r--r-- 1 root root   359 Nov 19 05:39 squares.c
$ ./squares
333332833333500000
$ file squares | cut -d, -f1-2
squares: ELF 64-bit LSB pie executable, x86-64</div>
  <p>The command <code>gcc -O1 -o squares squares.c</code> means "compile <code>squares.c</code>, with level-1 optimisation, into an output file called <code>squares</code>". It printed nothing, which in the Unix tradition means success. The 359-byte text file became a 16,048-byte <strong>executable</strong>, a file of machine code that the operating system can load and run (note the <code>x</code> in its permissions). Running it printed the answer immediately. The <code>file</code> command shows what kind of file it is: an <strong>ELF</strong> executable (the standard format for programs on Linux; Windows uses <code>.exe</code> files in a format called PE, and macOS uses Mach-O) for 64-bit x86 processors. This file runs only on 64-bit x86 Linux; to run the program on a Mac with an ARM chip, or on Windows, you would compile the same source again for that platform.</p>
  <p>The compiler works in stages. It first reads the text and checks that it follows the language's grammar and type rules, then turns it into an internal representation, then <strong>optimises</strong> it (removing wasted work, keeping values in registers instead of memory), and finally generates instructions for the target processor. A last step, called <strong>linking</strong>, joins your code with library code it uses, such as <code>printf</code>, into the final executable. We can stop the compiler just before the end and look at the instructions it chose, in assembly language, using <code>-S</code>:</p>
  <div class="fx" data-lang="text">$ gcc -O1 -S -o - squares.c | sed -n '/^sum_squares:/,/ret/p' | grep -vE 'cfi|LFB|endbr'
sum_squares:
	testq	%rdi, %rdi
	jle	.L4
	movl	$0, %eax
	movl	$0, %edx
.L3:
	movq	%rax, %rcx
	imulq	%rax, %rcx
	addq	%rcx, %rdx
	addq	$1, %rax
	cmpq	%rax, %rdi
	jne	.L3
.L1:
	movq	%rdx, %rax
	ret</div>
  <p>This is the whole <code>sum_squares</code> function as the CPU will execute it, and it is short enough to follow. The input <code>n</code> arrives in register <code>rdi</code>. <code>testq</code> and <code>jle</code> handle the case where <code>n</code> is zero or less by jumping straight to the end. Two registers are set to 0: <code>eax</code> (the lower half of <code>rax</code>) plays the role of <code>i</code> and <code>edx</code> (the lower half of <code>rdx</code>) plays <code>total</code>. The loop, from <code>.L3</code> to <code>jne .L3</code>, is just six instructions: copy <code>i</code>, multiply it by itself (<code>imulq</code>), add the result to <code>total</code> (<code>addq</code>), add 1 to <code>i</code>, compare <code>i</code> with <code>n</code>, and jump back if they are not equal. Finally the total is moved into <code>rax</code>, where the caller expects the answer, and <code>ret</code> returns. Notice what is absent: no type checks, no lookups of variable names, no objects. The compiler knew everything in advance, so each turn of the loop is a handful of the CPU's simplest operations. The same instructions as actual bytes in the executable file look like this:</p>
  <div class="fx" data-lang="text">$ objdump -d squares | sed -n '/&lt;sum_squares&gt;:/,/ret/p' | grep -E 'imul|add |jne'
    117f:	48 0f af c8          	imul   %rax,%rcx
    1183:	48 01 ca             	add    %rcx,%rdx
    1186:	48 83 c0 01          	add    $0x1,%rax
    118d:	75 ed                	jne    117c &lt;sum_squares+0x13&gt;
$ head -c 4 squares | od -c | head -1
0000000 177   E   L   F</div>
  <p>Each line shows an address in the file, the raw machine-code bytes and the assembly they stand for: <code>48 0f af c8</code> is the multiply we met earlier, and <code>75 ed</code> is the two-byte "jump back if not equal". The last command shows the first four bytes of the file, the "magic number" that tells Linux this is an ELF program: a byte with the value 177 (written in octal, the old base-8 notation <code>od</code> uses) followed by the letters E, L and F.</p>
  <p>Because a compiler reads the whole program before running anything, it can catch many mistakes early. Here is the same function with a typo:</p>
  <div class="fx" data-lang="text">long sum_squares(long n) {
    long total = 0;
    for (long i = 0; i &lt; n; i++) {
        totl += i * i;          /* typo: totl instead of total */
    }
    return total;
}</div>
  <div class="fx" data-lang="text">$ gcc -c bad.c
bad.c: In function ‘sum_squares’:
bad.c:4:9: error: ‘totl’ undeclared (first use in this function); did you mean ‘total’?
    4 |         totl += i * i;          /* typo: totl instead of total */
      |         ^~~~
      |         total
bad.c:4:9: note: each undeclared identifier is reported only once for each function it appears in</div>
  <p>The compiler refused to produce a program at all, pointed to line 4, column 9, and even suggested the fix. This is a <strong>compile-time error</strong>: found before the program ever runs. It is one of the big practical benefits of compiled, statically typed languages such as C, C++, Rust, Go and Java, and it is the reason tools like <code>mypy</code> exist for Python, to bring some of that early checking to a language that normally finds errors only while running.</p>

  <h2 id="cfp-interp"><span class="num">05</span>Interpreters and Python Bytecode</h2>
  <p>Compiling has costs. You must wait for a compile step every time you change the code, the result runs on only one kind of machine, and you cannot type a line and see its result straight away the way you can in a Jupyter cell. An <strong>interpreter</strong> is a program that runs source code directly, reading it and carrying out its instructions as it goes, so there is no separate build step and no machine-code file. Python, R, JavaScript (originally), Ruby and the Unix shell are all usually run by interpreters, and that is what makes notebooks and interactive prompts possible.</p>
  <p>Standard Python, called <strong>CPython</strong> because the interpreter itself is written in C, actually does a little compiling first, as the earlier figure showed. When you run a file, CPython reads your source code, checks its grammar, and compiles each function into <strong>bytecode</strong>: a compact list of simple instructions for an imaginary computer, the Python Virtual Machine. Then the interpreter loop executes those instructions one by one. The standard library's <code>dis</code> module (short for "disassemble") lets us see the bytecode for our function:</p>
  <div class="fx" data-lang="py">import dis

def sum_squares(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

if __name__ == "__main__":
    print(sum_squares(1_000_000))
    dis.dis(sum_squares)            # show the bytecode Python compiled it to</div>
  <div class="fx" data-lang="text">333332833333500000
  3           RESUME                   0

  4           LOAD_CONST               1 (0)
              STORE_FAST               1 (total)

  5           LOAD_GLOBAL              1 (range + NULL)
              LOAD_FAST                0 (n)
              CALL                     1
              GET_ITER
      L1:     FOR_ITER                10 (to L2)
              STORE_FAST               2 (i)

  6           LOAD_FAST_LOAD_FAST     18 (total, i)
              LOAD_FAST                2 (i)
              BINARY_OP                5 (*)
              BINARY_OP               13 (+=)
              STORE_FAST               1 (total)
              JUMP_BACKWARD           12 (to L1)

  5   L2:     END_FOR
              POP_TOP

  7           LOAD_FAST                1 (total)
              RETURN_VALUE</div>
  <p>The first line is the correct answer, the same as the C program's. Below it is the bytecode, grouped by source line number on the left. Line 4, <code>total = 0</code>, became <code>LOAD_CONST</code> (push the constant 0) and <code>STORE_FAST</code> (store it in the local variable <code>total</code>). Line 5 builds a <code>range</code> object and gets an iterator from it, and <code>FOR_ITER</code> takes the next number each time round. Line 6, <code>total += i * i</code>, is the interesting part: load <code>total</code> and <code>i</code>, load <code>i</code> again, <code>BINARY_OP (*)</code> to multiply, <code>BINARY_OP (+=)</code> to add, store the result back into <code>total</code>, and <code>JUMP_BACKWARD</code> to the top of the loop. That looks similar in length to the six machine instructions of the C loop, but it is not the same thing at all. Each bytecode instruction is carried out by a chunk of C code inside the interpreter, typically dozens of machine instructions. <code>BINARY_OP (*)</code> has to find out at that moment what types its two values have (they could be integers, floats, strings or NumPy arrays), find the right multiplication routine, and create a brand-new Python integer object in memory to hold the answer, because Python integers are full objects with a type and a reference count (see <a class="xref" data-note="py_values">Values, Types &amp; Memory</a>). The C version did none of that, because the compiler already knew both values were 8-byte integers.</p>
  <p>Python saves the bytecode it compiles for imported modules, so it does not have to compile them again next time. Importing our file leaves a <code>.pyc</code> file behind:</p>
  <div class="fx" data-lang="text">$ python3 -c "import sum_py"
$ ls __pycache__
sum_py.cpython-313.pyc</div>
  <p>The <code>__pycache__</code> folder holds <code>sum_py.cpython-313.pyc</code>, the bytecode for CPython 3.13. The version is in the name because bytecode changes between Python versions; a <code>.pyc</code> is a cache to speed up start-up, not a compiled program you can ship instead of your source. (The script you run directly is compiled fresh each time and not cached; only imported modules are.)</p>
  <p>Because Python compiles only enough to produce bytecode and does not check types, many mistakes that a C compiler would catch only show up when the faulty line actually runs:</p>
  <div class="fx" data-lang="py">def sum_squares(n):
    total = 0
    for i in range(n):
        totl += i * i               # same typo as the C version
    return total

print("the file loaded and started running without complaint")
try:
    sum_squares(3)
except NameError as e:
    print("only when the line runs:", type(e).__name__, "-", e)</div>
  <div class="fx" data-lang="text">the file loaded and started running without complaint
only when the line runs: UnboundLocalError - cannot access local variable 'totl' where it is not associated with a value</div>
  <p>The file with the same typo loaded and started running without any complaint, and the error appeared only when <code>sum_squares</code> was called and line 4 was executed. (The error is <code>UnboundLocalError</code>, a kind of <code>NameError</code>: because the line assigns to <code>totl</code>, Python treated it as a local variable that had no value yet.) In a long data pipeline, this is how a typo in a rarely used branch can sit unnoticed for weeks and then crash a job at 3 a.m. Tests, linters and type checkers are the Python world's answer. For more on how Python executes code, see <a class="xref" data-note="py_fundamentals">Python Fundamentals</a>.</p>

  <h2 id="cfp-jit"><span class="num">06</span>Compiler vs Interpreter, and JIT</h2>
  <p>We now have the same task done both ways, and the trade-off is clear. Compiled code runs fast, because all the work of understanding the program was done once, in advance, and the CPU gets lean machine instructions. Many errors are caught before the program runs. But you need a build step, and the result is tied to one processor and operating system. Interpreted code starts immediately, runs anywhere the interpreter is installed, and lets you experiment line by line, but it is slower, because the work of understanding each instruction is repeated every single time it runs, and more errors appear only at run time.</p>
  <table class="tbl">
    <tr><th></th><th>Compiler</th><th>Interpreter</th></tr>
    <tr><td>When translation happens</td><td>once, before running</td><td>while running, every time</td></tr>
    <tr><td>Output</td><td>an executable file of machine code</td><td>no machine-code file (CPython keeps bytecode)</td></tr>
    <tr><td>Speed</td><td>fast</td><td>slower, often 10–100× for tight loops</td></tr>
    <tr><td>Errors found</td><td>many at compile time</td><td>mostly at run time</td></tr>
    <tr><td>Portability</td><td>rebuild for each platform</td><td>runs wherever the interpreter runs</td></tr>
    <tr><td>Development</td><td>edit, compile, run</td><td>edit, run; interactive prompts and notebooks</td></tr>
    <tr><td>Examples</td><td>C, C++, Rust, Go</td><td>CPython, R, Bash</td></tr>
  </table>
  <p>In practice the line is blurry, because "compiled" and "interpreted" describe how a language is usually <em>run</em>, not the language itself. Java is compiled ahead of time, but to bytecode for the Java Virtual Machine rather than to machine code. CPython compiles to bytecode and then interprets it. And there is a third approach that tries to get the best of both. A <strong>JIT compiler</strong> (just-in-time compiler) starts by interpreting a program, watches which parts run most often (the "hot" loops and functions), and compiles those parts into machine code while the program is running, using what it has learned, such as "this variable has always been an integer so far". The program starts as quickly as an interpreted one and, once warmed up, its hot parts run at close to compiled speed. It is like the human interpreter from earlier noticing that you keep rereading the same chapter, and writing out a proper translation of that chapter so they no longer have to translate it sentence by sentence.</p>
  <p>JITs are everywhere, even if you do not see them. The Java Virtual Machine and Node.js's V8 engine for JavaScript both use them, which is why Java and modern JavaScript are far faster than classic interpreters. In the Python world, <strong>PyPy</strong> is an alternative Python interpreter with a built-in JIT that runs many pure-Python programs several times faster than CPython, although it does not work with every library that relies on C extensions. <strong>Numba</strong> is a library that JIT-compiles individual numeric functions: you put the decorator <code>@numba.njit</code> above a function like our <code>sum_squares</code>, and the first time it is called, Numba compiles it to machine code for the argument types it sees, so later calls run at roughly C speed. (Numba is not installed on this page's machine, so it is described rather than run.) The same idea appears in deep learning: <code>torch.compile</code> in PyTorch and JAX's <code>jit</code> trace your model's Python code and compile it into optimised machine code for the CPU or GPU, and Spark compiles parts of your DataFrame queries into Java bytecode at run time. CPython itself gained an experimental JIT in version 3.13, switched off by default.</p>

  <h2 id="cfp-runtime"><span class="num">07</span>The Runtime Environment</h2>
  <p>Whether a program is compiled or interpreted, it almost never runs entirely on its own. Our C program called <code>printf</code> to print, but we did not write <code>printf</code>; it was provided by the C library. A Python program needs far more: something to execute its bytecode, to create and free objects, to collect garbage, to load modules, to raise and catch exceptions. All of that support has to be present on the machine at the moment the program runs.</p>
  <p>The <strong>runtime environment</strong> (or simply <strong>runtime</strong>) is everything a program needs around it while it is running, beyond its own code: the interpreter or virtual machine if there is one, automatic memory management, the standard library, and the system libraries it calls. It is like the stage, lighting and crew a play needs: the script is the play itself, but it cannot be performed without them, and a script written for a theatre with a revolving stage will not work in a theatre without one. For a C program the runtime is thin, mostly the C standard library (libc) and the operating system. For Python, the runtime is CPython itself: the interpreter loop, the memory allocator and garbage collector, the built-in types and functions (written in C), and the standard library. Java's runtime is the JVM, JavaScript's is the browser or Node.js, and .NET's is the CLR. We can ask Python about its own runtime:</p>
  <div class="fx" data-lang="py">import sys, platform, gc

print("implementation:", sys.implementation.name, platform.python_version())
print("interpreter   :", sys.executable)
print("running on    :", platform.system(), platform.machine())
print("len is        :", len)                     # a function written in C
print("garbage collector on:", gc.isenabled())</div>
  <div class="fx" data-lang="text">implementation: cpython 3.13.18
interpreter   : /usr/local/bin/python3
running on    : Linux x86_64
len is        : &lt;built-in function len&gt;
garbage collector on: True</div>
  <p>This program is being run by CPython 3.13.18, from the interpreter program at <code>/usr/local/bin/python3</code>, on 64-bit x86 Linux. The built-in function <code>len</code> is part of the runtime and written in C, which is why Python shows it as a "built-in function" rather than Python code, and the garbage collector, which frees objects you no longer use, is switched on. Each of these lines is a property of the runtime, not of your code, and each can differ from one machine to another, which is why the same script can behave differently when the runtime changes: a newer Python adds features and removes deprecated ones, PyPy behaves slightly differently from CPython, and a script that uses a 3.12 feature fails on 3.8. When you pick "Python 3.11 runtime" for an AWS Lambda function, a Databricks cluster or a Docker base image such as <code>python:3.11-slim</code>, this is what you are choosing.</p>

  <h2 id="cfp-libs"><span class="num">08</span>Libraries, Frameworks, APIs and SDKs</h2>
  <p>Nobody writes a CSV parser, an HTTP client or a matrix multiply from scratch for each project. Code that solves common problems is packaged up so other programs can reuse it, and four words describe the different forms this reuse takes. They are often used loosely, which makes them confusing, but each has a clear core meaning.</p>
  <p>A <strong>library</strong> is a collection of ready-made code (functions, classes) that your program calls when it needs them. You stay in charge: your code decides what to call and when. NumPy, pandas, <code>requests</code> and scikit-learn are libraries; so is the C library that provided <code>printf</code>. A library is like a toolbox: you take out the tool you need, use it, and put it back. A <strong>framework</strong> is a larger structure that is in charge of the program's overall flow and calls <em>your</em> code at the right moments; you fill in the pieces it asks for. In FastAPI or Flask you write a function for each web address, and the framework receives the requests and decides when to call your function; in Django, Airflow, PyTorch Lightning or Scrapy you likewise plug code into places the framework defines. This reversal is called <strong>inversion of control</strong>, and it is the simplest test: if you call it, it is a library; if it calls you, it is a framework. A framework is less like a toolbox and more like the frame of a house: the structure is already built, and you add the rooms in the places it leaves for them.</p>
  <p>An <strong>API</strong> (application programming interface) is not code you install but an agreement: the defined set of operations one piece of software offers to others, with exactly what inputs each accepts and what it returns. It is like a restaurant menu: it lists what you can order and what you will get, without showing the kitchen. Every library has an API (the functions and parameters pandas documents, such as <code>pd.read_csv(path, usecols=...)</code>), the operating system has an API (the system calls), and a web service has an API that you use by sending HTTP requests, such as a weather service or the OpenAI and Stripe APIs; web APIs are covered in <a class="xref" data-note="api_fundamentals">API Fundamentals</a>. As long as the API stays the same, whoever provides it can completely change how it works inside without breaking your code. Finally, an <strong>SDK</strong> (software development kit) is a bundle of tools for building software for one particular platform or service: usually libraries, plus documentation, examples, command-line tools and sometimes compilers or emulators. <code>boto3</code>, the AWS SDK for Python, wraps the AWS web APIs in convenient Python functions; the Android SDK contains everything needed to build Android apps; NVIDIA's CUDA toolkit is an SDK for programming GPUs.</p>
  <table class="tbl">
    <tr><th>Term</th><th>What it is</th><th>Who is in control</th><th>Examples</th></tr>
    <tr><td>Library</td><td>reusable code you call</td><td>your code</td><td>NumPy, pandas, requests, scikit-learn</td></tr>
    <tr><td>Framework</td><td>a structure that calls your code</td><td>the framework</td><td>FastAPI, Flask, Django, Airflow, Spark</td></tr>
    <tr><td>API</td><td>the agreed interface between pieces of software</td><td>(a contract, not code)</td><td><code>pd.read_csv</code>'s parameters, a REST endpoint, system calls</td></tr>
    <tr><td>SDK</td><td>a kit of libraries and tools for one platform</td><td>your code, using the kit</td><td>boto3 (AWS), Android SDK, CUDA toolkit</td></tr>
  </table>
  <p>The categories overlap in real life. Spark acts as a framework (it schedules and runs your functions across a cluster) but you use its DataFrame methods like a library; an SDK contains libraries; and every one of them exposes an API. When someone says "use the API", ask whether they mean a library's functions or a web service you reach over the network.</p>

  <h2 id="cfp-shared"><span class="num">09</span>Shared Libraries and Why NumPy Is Fast</h2>
  <p>Almost every program on a computer needs the same basic functions: printing, reading files, allocating memory, doing maths. If each executable carried its own private copy of all that code, every program would be bigger, the same code would be loaded into memory many times over, and fixing a security bug in that code would mean rebuilding every program on the machine. Operating systems solve this with shared libraries.</p>
  <p>A <strong>shared library</strong> is a file of compiled machine code that is not a program on its own but is loaded into programs when they start (or later, on demand), so that many programs can use one copy of it. On Linux these files end in <code>.so</code> (shared object), on Windows <code>.dll</code> (dynamic-link library), and on macOS <code>.dylib</code>. Joining a program to its shared libraries at start-up is called <strong>dynamic linking</strong>; copying the library code into the executable when it is built is <strong>static linking</strong>. Think of a public library compared with buying your own books: with dynamic linking, every program borrows the one shared copy, and when the library replaces a damaged book everyone gets the fixed version; with static linking, each program owns its own copy, which nobody can take away but which also never gets fixed. The tool <code>ldd</code> lists the shared libraries a program needs:</p>
  <div class="fx" data-lang="text">$ ldd squares
	linux-vdso.so.1 (0x00007f955f06e000)
	libc.so.6 =&gt; /lib/x86_64-linux-gnu/libc.so.6 (0x00007f955ee00000)
	/lib64/ld-linux-x86-64.so.2 (0x00007f955f070000)
$ gcc -O1 -static -o squares_static squares.c
$ ls -l squares squares_static
-rwxr-xr-x 1 root root  16048 Nov 19 05:39 squares
-rwxr-xr-x 1 root root 785352 Nov 19 05:39 squares_static
$ ldd squares_static
	not a dynamic executable</div>
  <p>Our 16 KB program needs three things at run time: <code>libc.so.6</code>, the C standard library, which contains <code>printf</code>; <code>ld-linux-x86-64.so.2</code>, the <strong>dynamic loader</strong>, the small program that finds and loads the shared libraries whenever <code>squares</code> starts; and <code>linux-vdso.so.1</code>, a tiny library the kernel provides itself to make a few system calls faster. The hexadecimal numbers are the memory addresses where each library was loaded in this run. Building the same program with <code>-static</code> copied the parts of libc it uses into the executable: it grew from 16 KB to 785 KB, and <code>ldd</code> confirms it no longer depends on any shared library. That is the trade-off: static programs are bigger but self-contained (Go programs are built this way by default, which makes them easy to drop into a minimal container), while dynamic ones are small and share fixes but break if the right library version is missing. The classic error <code>error while loading shared libraries: libxyz.so.1: cannot open shared object file</code> means exactly that: the program was built against a shared library that this machine does not have.</p>
  <p>This is also the secret behind NumPy, pandas, scikit-learn and PyTorch. They are Python packages on the outside, but the heavy work is done by shared libraries of compiled C, C++ or Fortran inside them. When you <code>import numpy</code>, Python loads a <code>.so</code> file into the interpreter's process, and from then on NumPy functions are machine code running directly on the CPU:</p>
  <div class="fx" data-lang="py">import os, subprocess
import numpy.linalg
from numpy._core import _multiarray_umath as core   # NumPy's main compiled module

print("file:", os.path.basename(core.__file__))
print("size:", round(os.path.getsize(core.__file__) / 1e6, 1), "MB of compiled machine code")
print("loads these shared libraries:")
for line in subprocess.run(["ldd", core.__file__], capture_output=True, text=True).stdout.splitlines():
    print("   ", line.split()[0])</div>
  <div class="fx" data-lang="text">file: _multiarray_umath.cpython-313-x86_64-linux-gnu.so
size: 10.6 MB of compiled machine code
loads these shared libraries:
    linux-vdso.so.1
    libscipy_openblas64_-f48b354e.so
    libstdc++.so.6
    libm.so.6
    libgcc_s.so.1
    libc.so.6
    /lib64/ld-linux-x86-64.so.2
    libpthread.so.0
    libgfortran-83c28eba-468e71e5.so.5.0.0
    libquadmath-2284e583-a9307bba.so.0.0.0
    libz.so.1</div>
  <p>NumPy's core is a single 10.6 MB file of compiled machine code, a <strong>C extension</strong> module, which Python loads like any other shared library. It in turn pulls in more shared libraries, most notably OpenBLAS (<code>libscipy_openblas64_</code>), a heavily optimised library of linear algebra routines whose matrix multiply is tuned for specific CPU models and runs on several cores at once, plus Fortran support libraries and the same libc as our C program. The odd names with random-looking suffixes are copies bundled inside the NumPy package, so that installing NumPy does not depend on what happens to be installed on the system. The figure below shows the layers a single line of pandas passes through.</p>
  <figure class="viz"><svg viewBox="0 0 620 230" width="620">
<defs><marker id="cfp-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="60" y="10" width="330" height="34" rx="5" class="fs" stroke="currentColor"/><text x="225" y="31" text-anchor="middle" font-size="11">your code: df["amount"].sum()</text>
<rect x="60" y="54" width="330" height="34" rx="5" class="fb sb"/><text x="225" y="75" text-anchor="middle" font-size="11">pandas (Python code, checks and dispatch)</text>
<rect x="60" y="98" width="330" height="34" rx="5" class="fg sg"/><text x="225" y="119" text-anchor="middle" font-size="11">NumPy / pandas C extensions (.so)</text>
<rect x="60" y="142" width="330" height="34" rx="5" class="fg sg"/><text x="225" y="163" text-anchor="middle" font-size="11">OpenBLAS, libm, libc (.so)</text>
<rect x="60" y="186" width="330" height="34" rx="5" class="fr sr"/><text x="225" y="207" text-anchor="middle" font-size="11">CPU: tight machine-code loop over raw numbers</text>
<path d="M30,14 L30,216" stroke="currentColor" marker-end="url(#cfp-a2)"/>
<text x="410" y="31" font-size="10" class="tm">interpreted, runs once per call</text>
<text x="410" y="75" font-size="10" class="tm">interpreted, runs once per call</text>
<text x="410" y="113" font-size="10" class="tg">compiled: the loop over</text><text x="410" y="127" font-size="10" class="tg">a million values is here</text>
<text x="410" y="163" font-size="10" class="tg">compiled, often multi-core</text>
</svg><figcaption>Python code runs a few times per call to decide what to do; the loop over every value happens in compiled shared libraries.</figcaption></figure>
  <p>Reading the figure from the top: your one line of pandas, and pandas' own Python code that checks the column's type and picks the right routine, run only once per call, so it hardly matters that they are interpreted. The loop over a million values happens two layers down, in compiled C that works on raw 8-byte numbers packed side by side in memory, with no Python objects, no type checks and no bytecode in the way. Here is our sum of squares done four ways, with approximate timings from this VM:</p>
  <div class="fx" data-lang="py">import subprocess, time
import numpy as np

N = 1_000_000

def sum_squares(n):                          # pure Python loop
    total = 0
    for i in range(n):
        total += i * i
    return total

def timed(label, fn):                        # best of 5 runs, in milliseconds
    times = []
    for _ in range(5):
        start = time.perf_counter()
        result = fn()
        times.append(time.perf_counter() - start)
    ms = min(times) * 1000
    print(f"{label:34} {ms:8.2f} ms   result {int(result)}")

timed("Python loop (interpreted)", lambda: sum_squares(N))
x = np.arange(N, dtype=np.int64)
timed("NumPy vectorised (C inside)", lambda: (x * x).sum())
timed("NumPy dot product (C inside)", lambda: x @ x)
timed("compiled C program (+ start-up)", lambda: int(subprocess.run(["./squares", str(N)], capture_output=True, text=True).stdout))</div>
  <div class="fx" data-lang="text">Python loop (interpreted)             40.39 ms   result 333332833333500000
NumPy vectorised (C inside)            1.04 ms   result 333332833333500000
NumPy dot product (C inside)           0.64 ms   result 333332833333500000
compiled C program (+ start-up)        1.57 ms   result 333332833333500000</div>
  <p>All four give the same answer, and each time is the best of five runs. The pure-Python loop took nearly 40 milliseconds, because each of the million turns went through several bytecode instructions, type checks and the creation of new integer objects. The NumPy version, <code>(x * x).sum()</code>, took about 1 millisecond, more than 30 times faster, because the multiply and the sum each ran as one compiled loop over the whole array; this style of replacing a Python loop with whole-array operations is called <strong>vectorisation</strong>. The dot product <code>x @ x</code> computes the same sum in a single optimised OpenBLAS routine without even building the intermediate array of squares, and was as fast or faster again. The C program came out a little slower than NumPy only because its time includes starting a whole new process; the sum itself takes well under a millisecond. Exact numbers vary between runs and machines, but the size of the gap does not, which is the practical lesson for data work: keep the loops inside NumPy, pandas, Polars, PyTorch or Spark, and write Python only for the logic around them. This also explains why such libraries can use several cores from one Python thread: the GIL is released while their compiled code runs.</p>

  <h2 id="cfp-deps"><span class="num">10</span>Dependencies and "Works on My Machine"</h2>
  <p>Your report script runs perfectly on your laptop. A colleague runs it and gets an <code>ImportError</code>; the server runs it and the numbers come out slightly different; a Docker build fails with a compiler error while installing a package. Everyone has heard, or said, "but it works on my machine". The script is identical in each case. What differs is everything the script relies on.</p>
  <p>A <strong>dependency</strong> is any piece of software your code needs in order to run: a library such as pandas, a specific version of the Python runtime, a shared library such as OpenBLAS, even a command-line tool or an operating system feature. Dependencies have dependencies of their own, called <strong>transitive dependencies</strong>, so installing one package can quietly install many. You can walk the tree for pandas on this machine:</p>
  <div class="fx" data-lang="py">import importlib.metadata as md
import re

def deps(package):
    reqs = md.requires(package) or []
    # keep real install requirements, skip optional "extra" and other-platform ones
    names = [re.split(r"[ &lt;&gt;=;\[]", r)[0] for r in reqs if "extra ==" not in r and "sys_platform" not in r]
    return sorted(set(names))

def tree(package, depth=0):
    print("    " * depth + f"{package} {md.version(package)}")
    for d in deps(package):
        tree(d, depth + 1)

tree("pandas")</div>
  <div class="fx" data-lang="text">pandas 3.0.5
    numpy 2.5.3
    python-dateutil 2.9.0.post0
        six 1.17.0</div>
  <p>Asking for pandas also brought in NumPy and <code>python-dateutil</code>, and <code>python-dateutil</code> in turn needs <code>six</code>; and below all of them sit the shared libraries we saw inside NumPy, the CPython runtime and the operating system. Every item has a version, and code that works with one combination of versions may break with another. A dependency is like an ingredient in a recipe: the recipe says "flour", but bread flour and cake flour give different results, and if the shop changes its brand the same recipe can fail. Here is a real example: the same five lines of pandas code give different results depending on the pandas version installed:</p>
  <div class="fx" data-lang="py">import pandas as pd

shops = pd.Series(["north", "south"])
print("pandas", pd.__version__, "-&gt; text column dtype:", shops.dtype)

df = pd.DataFrame({"amount": [100, 200]})
col = df["amount"]
col.iloc[0] = 999              # change the extracted column...
print("df after changing col:", df["amount"].tolist())   # ...did df change too?</div>
  <div class="fx" data-lang="text">pandas 3.0.5 -&gt; text column dtype: str
df after changing col: [100, 200]</div>
  <p>On this machine, with pandas 3.0, a column of text gets the new dedicated <code>str</code> data type, and changing a column taken out of a DataFrame leaves the DataFrame untouched (pandas 3 made "copy-on-write" the rule). On a machine with pandas 1.x or 2.x, the same lines report the text column as <code>object</code>, and the change to <code>col</code> also changes <code>df</code>. Nothing in the script reveals which behaviour you will get; only the installed version decides. Breaking changes like this between major versions are normal, which is why a project needs to record exactly which versions it was built and tested with.</p>
  <p>The causes of "works on my machine" fall into a few groups: a different version of a package (often because the requirements file said just <code>pandas</code> and each machine installed whatever was newest that day); a different Python runtime version; packages installed globally on one machine and forgotten about, so they are missing elsewhere; compiled parts that do not match the platform (a wheel built for x86-64 Linux will not load on an ARM Mac, and a package with no pre-built version for your platform has to be compiled, which needs a compiler and system libraries); and differences in the environment itself, such as environment variables, file paths, the operating system and its shared libraries. The fixes build on each other. A <strong>virtual environment</strong> (<code>python -m venv</code>, conda, or uv) gives each project its own isolated set of packages instead of one shared global pile. <strong>Pinning</strong> records exact versions, for example <code>pandas==3.0.5</code> in a requirements file produced by <code>pip freeze</code>, or better a <strong>lock file</strong> from a tool such as uv, Poetry or pip-tools that pins every transitive dependency too, so every machine installs exactly the same tree. And a <strong>container</strong> image built with Docker packages the operating system libraries, the Python runtime, your pinned packages and your code into one unit that runs the same way on a laptop, a CI server and a Kubernetes cluster. How Python finds and imports packages is covered in <a class="xref" data-note="py_modules">Modules &amp; Packages</a>, and containers in <a class="xref" data-note="se_docker">Docker</a>.</p>

  <h2 id="cfp-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most expensive everyday mistake in data work is writing Python loops over data that already lives in NumPy arrays or pandas DataFrames. Each turn of a Python loop goes through the interpreter, so a loop over a million rows throws away the compiled speed the library offers:</p>
  <div class="fx" data-lang="py">import time
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
df = pd.DataFrame({"price": rng.integers(50, 500, 100_000), "qty": rng.integers(1, 5, 100_000)})

start = time.perf_counter()
total = 0
for _, row in df.iterrows():                     # mistake: a Python loop over rows
    total += row["price"] * row["qty"]
loop_s = time.perf_counter() - start

start = time.perf_counter()
total_vec = (df["price"] * df["qty"]).sum()      # fix: one vectorised expression
vec_s = time.perf_counter() - start

print(f"iterrows loop : {loop_s * 1000:8.1f} ms  total {total}")
print(f"vectorised    : {vec_s * 1000:8.1f} ms  total {total_vec}")</div>
  <div class="fx" data-lang="text">iterrows loop :   1277.2 ms  total 68570179
vectorised    :      1.1 ms  total 68570179</div>
  <p>Both versions compute the same total, but the row-by-row loop with <code>iterrows</code> took far longer than the single vectorised expression (the timings are approximate). The fix is to express the work as whole-column operations, such as arithmetic on columns, <code>np.where</code> for conditions and <code>groupby</code> for per-group totals, and to keep row loops for genuinely small data.</p>
  <p>A second mistake is not pinning dependencies. A <code>requirements.txt</code> containing just <code>pandas</code> and <code>scikit-learn</code> installs different versions on every machine and every month, and one day a major release changes behaviour, as the pandas example showed. Pin exact versions, or use a lock file, and upgrade deliberately, running your tests when you do. Closely related is installing packages into the system Python rather than a virtual environment, which leaves projects silently sharing, and fighting over, the same packages.</p>
  <p>Platform mistakes are the third group. A compiled executable, a <code>.so</code> file or a binary wheel is machine code for one processor and operating system, so copying a virtual environment folder from a Mac to a Linux server, or building a Docker image on an ARM laptop and running it on an x86 server, fails with errors such as "exec format error" or "cannot open shared object file". Rebuild or reinstall on the target platform, or build images for the right platform (Docker's <code>--platform linux/amd64</code>). Finally, a few misunderstandings come up often: thinking a <code>.pyc</code> file hides or protects your source code (bytecode is easily turned back into readable code); thinking Python is "not compiled at all" (it compiles to bytecode, it just does not compile to machine code); and assuming a program that compiled without errors is correct (the compiler checks grammar and types, not logic).</p>

  <h2 id="cfp-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core definitions</h3>
  <ul>
    <li><b>Hardware</b>: the physical machine. <b>Software</b>: instructions that tell it what to do.</li>
    <li><b>Instruction set</b>: the fixed operations a CPU understands (x86-64, ARM). <b>Machine code</b>: those instructions as bytes.</li>
    <li><b>Low-level language</b>: close to the hardware (assembly, C). <b>High-level language</b>: close to the problem (Python).</li>
    <li><b>Source code</b>: the human-readable text of a program.</li>
    <li><b>Compiler</b>: translates the whole program ahead of time into an executable (gcc, Clang, rustc).</li>
    <li><b>Interpreter</b>: runs source code directly, translating as it goes (CPython, R, Bash).</li>
    <li><b>Bytecode</b>: intermediate instructions for a virtual machine (Python <code>.pyc</code>, Java <code>.class</code>).</li>
    <li><b>JIT</b>: compiles hot code to machine code while the program runs (JVM, V8, PyPy, Numba, <code>torch.compile</code>).</li>
    <li><b>Runtime</b>: what a program needs while running: interpreter/VM, memory management, standard and system libraries.</li>
    <li><b>Library</b>: code you call. <b>Framework</b>: calls your code (inversion of control). <b>API</b>: the agreed interface. <b>SDK</b>: tool kit for a platform.</li>
    <li><b>Shared library</b>: compiled code loaded into programs at run time (<code>.so</code>, <code>.dll</code>, <code>.dylib</code>). <b>Static linking</b>: code copied into the executable.</li>
    <li><b>Dependency</b>: software your code needs; <b>transitive</b> = dependencies of dependencies.</li>
  </ul>
  <h3>Compiler vs interpreter</h3>
  <table class="tbl">
    <tr><th></th><th>Compiler</th><th>Interpreter</th><th>JIT</th></tr>
    <tr><td>Translates</td><td>before running</td><td>while running</td><td>while running, hot parts only</td></tr>
    <tr><td>Speed</td><td>fast</td><td>slow</td><td>fast after warm-up</td></tr>
    <tr><td>Errors</td><td>many at compile time</td><td>at run time</td><td>at run time</td></tr>
    <tr><td>Portability</td><td>rebuild per platform</td><td>anywhere the interpreter runs</td><td>anywhere the VM runs</td></tr>
  </table>
  <h3>Why NumPy is fast</h3>
  <ul>
    <li>Data stored as raw numbers side by side, not as Python objects.</li>
    <li>Loops run in compiled C/Fortran shared libraries (OpenBLAS for linear algebra), not in the bytecode interpreter.</li>
    <li>The GIL is released inside, and BLAS routines use several cores.</li>
    <li>On this VM (best of 5, approximate): Python loop ≈ 40 ms, <code>(x*x).sum()</code> ≈ 1 ms, <code>x @ x</code> ≈ 0.5–1 ms for a million values.</li>
  </ul>
  <h3>Commands</h3>
  <div class="fx" data-lang="py">import dis, sys, importlib.metadata as md

dis.dis(func)                    # show a function's bytecode
sys.implementation.name          # 'cpython' (or 'pypy')
sys.version, sys.executable      # which runtime is running this code
md.version("pandas")             # installed version of a package
md.requires("pandas")            # its declared dependencies

# shell: gcc -O1 -o prog prog.c   (compile)     gcc -S prog.c    (see assembly)
#        objdump -d prog          (machine code) file prog       (what kind of file)
#        ldd prog                 (shared libraries needed)
#        python -m venv .venv     pip freeze &gt; requirements.txt</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Python does compile, to bytecode; it does not compile to machine code.</li>
    <li><code>.pyc</code> is a start-up cache tied to a Python version, not protection for your code.</li>
    <li>Executables, <code>.so</code> files and wheels are platform-specific (x86-64 vs ARM, Linux vs macOS vs Windows).</li>
    <li>Loop in NumPy/pandas, not in Python.</li>
    <li>Pin versions (lock files), isolate with virtual environments, ship with Docker.</li>
    <li>If it calls you, it is a framework; if you call it, it is a library.</li>
  </ul>

  <h2 id="cfp-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between hardware and software?</summary><div class="qa-body">Hardware is the physical machine: CPU, memory, storage, network card. Software is the set of instructions that tells the hardware what to do, from the operating system to applications and scripts. The same hardware does completely different jobs depending on the software it runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is machine code?</summary><div class="qa-body">Machine code is the sequence of binary-encoded instructions that a CPU executes directly, from its instruction set (such as x86-64 or ARM). Each instruction is a very basic operation like load, add, multiply, compare or jump. Every program, however it was written, must end up as machine code, either ahead of time or while running.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a high-level and a low-level language?</summary><div class="qa-body">A low-level language such as assembly or C is close to the hardware and gives direct control over memory and data layout, but you must manage those details yourself. A high-level language such as Python works with abstractions like lists, objects and automatic memory management, which makes it faster to write and safer, at the cost of speed and control.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a compiler and an interpreter?</summary><div class="qa-body">A compiler translates the whole program ahead of time into an executable, which then runs fast without the compiler and catches many errors before running. An interpreter executes the source directly, translating as it goes, which allows instant start and interactive use but is slower and finds most errors at run time. Many real systems mix both, such as CPython (bytecode plus interpreter) and Java (bytecode plus JIT).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python compiled or interpreted?</summary><div class="qa-body">Both, in a sense. CPython compiles source code to bytecode (cached as <code>.pyc</code> files for imported modules) and then interprets that bytecode in a loop written in C. It does not compile to machine code, which is why pure-Python loops are slow. Other implementations differ: PyPy adds a JIT compiler.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is bytecode?</summary><div class="qa-body">Bytecode is a compact, low-level instruction set for a virtual machine rather than a real CPU, such as Python's <code>LOAD_FAST</code> and <code>BINARY_OP</code> or Java's JVM instructions. It is quicker to execute than parsing source text each time and is portable across processors, because the virtual machine is what runs it. <code>dis.dis(func)</code> shows a Python function's bytecode.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a JIT compiler? Give examples.</summary><div class="qa-body">A just-in-time compiler compiles code to machine code while the program runs, usually only the frequently executed parts, and can use information gathered at run time such as the actual types seen. It combines fast start-up with near-compiled speed after warm-up. Examples: the JVM's HotSpot, JavaScript's V8, PyPy, Numba's <code>@njit</code>, <code>torch.compile</code> and JAX's <code>jit</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a Python loop so much slower than the same loop in C?</summary><div class="qa-body">In C, the compiler knows the types in advance, so each iteration is a few machine instructions on registers. In CPython each iteration executes several bytecode instructions, each dispatched by the interpreter, with dynamic type checks, reference counting and new integer objects created for results. That overhead typically makes tight loops 10 to 100 times slower.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are NumPy and pandas fast if they are Python libraries?</summary><div class="qa-body">Their heavy work is done in compiled C, C++ or Fortran code loaded as shared libraries (C extensions), with BLAS libraries such as OpenBLAS or MKL for linear algebra. Data is stored in contiguous arrays of raw numbers instead of Python objects, so one call runs a tight compiled loop over the whole array, can use SIMD instructions and several cores, and releases the GIL. Python code only runs once per call to decide what to do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is vectorisation?</summary><div class="qa-body">Vectorisation means expressing a computation as operations on whole arrays or columns, such as <code>(x * x).sum()</code> or <code>df["a"] * df["b"]</code>, instead of a Python loop over elements. The loop then runs inside the library's compiled code. At the hardware level the term also refers to SIMD instructions that process several numbers in one instruction, which those compiled loops often use.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a runtime environment?</summary><div class="qa-body">It is everything a program needs while running besides its own code: the interpreter or virtual machine, memory management and garbage collection, the standard library and system libraries. CPython is Python's runtime, the JVM is Java's, Node.js or the browser is JavaScript's. Choosing "Python 3.11 runtime" for a cloud function or Docker image means choosing this environment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a library and a framework?</summary><div class="qa-body">You call a library: your code is in control and uses its functions when needed (NumPy, requests). A framework calls you: it controls the program's flow and invokes the code you plug into it (Flask, FastAPI, Django, Airflow). This is called inversion of control, summed up as "don't call us, we'll call you".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between an API and an SDK?</summary><div class="qa-body">An API is the interface: the defined operations, inputs and outputs one piece of software offers to another, such as a REST endpoint or a library's documented functions. An SDK is a kit for building on a platform, typically including client libraries that wrap the API, plus documentation, tools and examples. boto3 is the AWS SDK for Python; it calls the AWS APIs for you.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a shared library, and what is the difference between static and dynamic linking?</summary><div class="qa-body">A shared library (<code>.so</code> on Linux, <code>.dll</code> on Windows, <code>.dylib</code> on macOS) is compiled code loaded into programs at run time so many programs can share one copy. Dynamic linking resolves these libraries when the program starts, giving smaller executables and shared bug fixes but requiring the right versions on the machine. Static linking copies the code into the executable, making it larger but self-contained.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A program fails with "error while loading shared libraries: libxyz.so: cannot open shared object file". What does it mean?</summary><div class="qa-body">The program was dynamically linked against a shared library that the dynamic loader cannot find on this machine, either because it is not installed, is a different version, or is not on the library search path. <code>ldd program</code> lists which libraries are missing. Fixes are installing the system package, matching versions, or using a container image that includes it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are transitive dependencies, and why do lock files matter?</summary><div class="qa-body">Transitive dependencies are the dependencies of your dependencies; installing pandas also installs NumPy, python-dateutil and six. If only top-level packages are listed, each install may pick different versions of everything underneath. A lock file records the exact version of every package in the tree, so every machine installs an identical set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Code works on your laptop but not on the server. How do you approach it?</summary><div class="qa-body">Compare the environments: Python version, package versions (<code>pip freeze</code> on both), operating system and CPU architecture, system libraries, environment variables and file paths. Then remove the differences: use a virtual environment with pinned versions or a lock file, and ideally build a Docker image so the same runtime, libraries and code run everywhere, with CI testing that image.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you run an executable built on an x86 Linux machine on an ARM Mac?</summary><div class="qa-body">The executable contains machine code for the x86-64 instruction set, which an ARM CPU does not understand, and it is in Linux's ELF format with links to Linux libraries, while macOS expects Mach-O files and its own libraries. You must compile the source again for the target, or use emulation (such as Rosetta 2 or QEMU) or a virtual machine or container running the right platform.</div></details>
</main>
`
});
