// notes/python/py_fundamentals.js — How Python Runs Your Code
Object.assign(TOPIC_CONTENT, {
  "py_fundamentals": `<main>
<h1>How Python Runs Your Code</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>How Python Runs Your Code</span></div>
  <p class="lead">When you type a few lines of Python into a file and run it, a surprising amount happens before the first line of output appears. Python reads the whole file, translates it into simpler instructions, runs those instructions one by one, keeps track of every value in memory, and cleans up values you no longer need. Knowing this story explains things that otherwise look like magic: why a typing mistake is reported before anything runs, what the <code>__pycache__</code> folder is, why so many files end with <code>if __name__ == "__main__":</code>, and how to read the error report Python prints when something goes wrong. Throughout this page we follow one small program, the billing script for a roadside chai stall that sells masala chai for ₹30, samosas for ₹15 and cold coffee for ₹90. It is the first thing every later note builds on, so we start from zero.</p>

  <h2 id="pf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">How Python Runs Code</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">From file to result</div>
        <ul>
          <li>Source code → <b>bytecode</b> → run by the CPython <b>virtual machine</b></li>
          <li>Whole file is compiled first: a SyntaxError stops everything</li>
          <li>Other errors appear only when their line runs</li>
          <li>Imported files are cached as <code>__pycache__/*.pyc</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running a program</div>
        <ul>
          <li><code>python3 till.py</code>, the REPL, <code>python3 -m module</code></li>
          <li><code>__name__</code> is <code>"__main__"</code> only for the file you ran</li>
          <li>Indentation (4 spaces) marks blocks; PEP 8 is the style guide</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Values and memory</div>
        <ul>
          <li>Everything is an object; names point to objects</li>
          <li><b>Dynamic</b> (types live on values) and <b>strong</b> (no silent mixing)</li>
          <li><b>Reference counting</b> frees a value when nothing points to it</li>
          <li>The <b>cyclic garbage collector</b> frees groups that point at each other</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When it goes wrong</div>
        <ul>
          <li>Read a traceback from the <b>bottom up</b>: what, where, how</li>
          <li>NameError, TypeError, ValueError, AttributeError, IndexError, KeyError</li>
          <li>A file called <code>random.py</code> hides the real <code>random</code> module</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pf-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">From Source Code to Bytecode</span><span class="rm-sub">what Python does before and while your code runs</span></div></div>
      <div class="rm-item rm-done" data-target="pf-impl"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">CPython, Other Pythons and Speed</span><span class="rm-sub">why pure Python is slow and how to make it faster</span></div></div>
      <div class="rm-item rm-done" data-target="pf-run"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Ways to Run Python</span><span class="rm-sub">scripts, the REPL, -m, and the __main__ check</span></div></div>
      <div class="rm-item rm-done" data-target="pf-syntax"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Indentation, Comments and Style</span><span class="rm-sub">how Python sees blocks, and PEP 8</span></div></div>
      <div class="rm-item rm-done" data-target="pf-typing"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Dynamic and Strong Typing</span><span class="rm-sub">where types live and when they are checked</span></div></div>
      <div class="rm-item rm-done" data-target="pf-objects"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Everything Is an Object</span><span class="rm-sub">numbers, functions and modules are all objects</span></div></div>
      <div class="rm-item rm-done" data-target="pf-memory"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">How Python Frees Memory</span><span class="rm-sub">reference counting and the garbage collector</span></div></div>
      <div class="rm-item rm-done" data-target="pf-errors"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Reading a Traceback</span><span class="rm-sub">error reports and the common exception types</span></div></div>
      <div class="rm-item rm-done" data-target="pf-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">shadowed modules, text as numbers, missing brackets</span></div></div>
      <div class="rm-item rm-done" data-target="pf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, commands, error types</span></div></div>
      <div class="rm-item rm-done" data-target="pf-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">bytecode, memory, typing, tracebacks</span></div></div>
    </div>
  </div>

  <h2 id="pf-model"><span class="num">01</span>From Source Code to Bytecode</h2>
  <p>A computer's processor understands only one language, called <strong>machine code</strong>: long sequences of very simple numbered instructions such as "add these two numbers" or "jump to that address". Every kind of processor has its own machine code, and nobody wants to write it by hand. So we write programs in a language that people can read, such as Python, and the text we write is called <strong>source code</strong>. Something has to translate source code into actions the machine can perform, and there are two classic ways to do it.</p>
  <p>The first way is to translate the whole program in advance. A <strong>compiler</strong> reads all of your source code, turns it into machine code, and saves the result as a program file that can be run later without the compiler. C and Rust work like this. The second way is to translate while running. An <strong>interpreter</strong> reads the program and carries out each instruction as it goes. Think of the difference between translating a book and interpreting at a meeting. A translator takes the whole book home, works through it, and hands back a finished translation; an interpreter stands next to the speaker and turns each sentence into the other language as it is spoken.</p>
  <p>The standard Python, whose official name is <strong>CPython</strong> because it is written in the C language, does a little of both. When you run a file, it first <em>compiles</em> the whole file, but not into machine code. It compiles it into <strong>bytecode</strong>, a compact list of simple instructions designed for an imaginary computer rather than a real processor. Then a part of CPython called the <strong>virtual machine</strong>, a large loop written in C, reads that bytecode one instruction at a time and carries each one out. So "Python is interpreted" is half the story: Python is compiled to bytecode, and the bytecode is interpreted. Here is our first program, a script called <code>till.py</code> that bills one table:</p>
  <div class="fx" data-lang="py"># till.py: bill one table at the chai stall
chai, samosa, coffee = 30, 15, 90
subtotal = 2 * chai + 3 * samosa + 1 * coffee
print("Subtotal:", subtotal)
print("With 5% tax:", subtotal * 1.05)</div>
  <div class="fx" data-lang="text">Subtotal: 195
With 5% tax: 204.75</div>
  <p>When you type <code>python3 till.py</code>, CPython reads the five lines, checks that they follow Python's grammar, and compiles them into bytecode. Only then does the virtual machine start running: it creates the numbers 30, 15 and 90 and gives them names, works out 2 × 30 + 3 × 15 + 1 × 90 = 195, and prints two lines. (The tax line shows 204.75 because the program multiplies by 1.05; the real billing rules arrive in later notes.)</p>
  <p>You can see the "compile first, run second" order for yourself by making two kinds of mistake. In the first file below, line 3 is missing a colon, which breaks Python's grammar. In the second file, line 3 is grammatically fine but uses a name that does not exist. Both files begin by printing "opening the till":</p>
  <div class="fx" data-lang="py"># broken_syntax.py
print("opening the till")
subtotal = 195
if subtotal &gt;= 150          # missing colon on line 3
    print("discount")

# broken_name.py
print("opening the till")
subtotal = 195
print(subtotl)              # misspelt name on line 3</div>
  <div class="fx" data-lang="text">$ python3 broken_syntax.py
  File "broken_syntax.py", line 3
    if subtotal &gt;= 150          # missing colon on line 3
                                ^^^^^^^^^^^^^^^^^^^^^^^^^
SyntaxError: expected ':'

$ python3 broken_name.py
opening the till
Traceback (most recent call last):
  File "broken_name.py", line 3, in &lt;module&gt;
    print(subtotl)              # misspelt name on line 3
          ^^^^^^^
NameError: name 'subtotl' is not defined. Did you mean: 'subtotal'?</div>
  <p>Look carefully at what each run printed. The file with the missing colon printed nothing at all, not even "opening the till", although that print is on line 1 and the mistake is on line 3. That is because the mistake was found while compiling the whole file, before a single line had run. A grammar mistake like this is called a <strong>SyntaxError</strong> (syntax means the grammar of a language). The second file did print "opening the till", and only then failed on line 3 with a <strong>NameError</strong>. Its grammar was perfect, so it compiled, and the problem was discovered only when the virtual machine reached that line and looked for a name called <code>subtotl</code>. This matters in real work: Python checks grammar for the whole file up front, but it checks almost everything else, such as misspelt names and wrong types, only when a line actually runs. A mistake hidden inside an <code>if</code> branch that your tests never reach can sit in the code for months.</p>
  <p>The figure below shows the whole journey. The source file is parsed (read and checked against the grammar), and this is where a SyntaxError is raised. The compiler turns it into bytecode, and the virtual machine runs the bytecode. Files that your program loads from other files are also saved as cached bytecode, which we come to in a moment.</p>
  <figure class="viz"><svg viewBox="0 0 680 150" width="680">
<defs><marker id="pf-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="40" width="130" height="50" rx="8" class="fb sb"/><text x="75" y="61" text-anchor="middle" font-size="12" font-weight="700">till.py</text><text x="75" y="78" text-anchor="middle" class="tm" font-size="10">source text</text>
<line x1="140" y1="65" x2="188" y2="65" stroke="currentColor" marker-end="url(#pf-a1)"/><text x="164" y="56" text-anchor="middle" class="tm" font-size="9.5">parse</text>
<rect x="190" y="40" width="130" height="50" rx="8" class="ft st"/><text x="255" y="61" text-anchor="middle" font-size="12" font-weight="700">compiler</text><text x="255" y="78" text-anchor="middle" class="tm" font-size="10">checks grammar</text>
<line x1="320" y1="65" x2="368" y2="65" stroke="currentColor" marker-end="url(#pf-a1)"/>
<rect x="370" y="40" width="130" height="50" rx="8" class="fg sg"/><text x="435" y="61" text-anchor="middle" font-size="12" font-weight="700">bytecode</text><text x="435" y="78" text-anchor="middle" class="tm" font-size="10">LOAD_FAST, BINARY_OP…</text>
<line x1="500" y1="65" x2="548" y2="65" stroke="currentColor" marker-end="url(#pf-a1)"/>
<rect x="550" y="40" width="120" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="610" y="61" text-anchor="middle" font-size="12" font-weight="700">CPython VM</text><text x="610" y="78" text-anchor="middle" class="tm" font-size="10">runs each instruction</text>
<line x1="435" y1="90" x2="435" y2="118" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pf-a1)"/>
<text x="435" y="135" text-anchor="middle" class="tm" font-size="10.5">imported files: cached in __pycache__/name.cpython-313.pyc</text>
<text x="255" y="25" text-anchor="middle" class="tr" font-size="10.5">SyntaxError raised here, before anything runs</text>
</svg><figcaption>CPython compiles the whole file to bytecode first, then its virtual machine runs the bytecode one instruction at a time.</figcaption></figure>
  <p>Bytecode is not hidden from you. The standard <code>dis</code> module (short for "disassemble") prints the bytecode of a function. A <strong>function</strong> is a named, reusable piece of code; here it works out the amount for one line of an order and adds a ₹5 packing charge:</p>
  <div class="fx" data-lang="py">import dis

def line_total(qty, price):
    return qty * price + 5

dis.dis(line_total)</div>
  <div class="fx" data-lang="text">  3           RESUME                   0

  4           LOAD_FAST_LOAD_FAST      1 (qty, price)
              BINARY_OP                5 (*)
              LOAD_CONST               1 (5)
              BINARY_OP                0 (+)
              RETURN_VALUE</div>
  <p>Each line of output is one instruction for the virtual machine. The virtual machine works with a <strong>stack</strong>, a pile of values where you can only put something on top or take the top thing off, like a stack of plates. Reading down: <code>LOAD_FAST_LOAD_FAST</code> puts the values of <code>qty</code> and <code>price</code> on the stack; <code>BINARY_OP 5 (*)</code> takes the top two values off, multiplies them, and puts the product back; <code>LOAD_CONST</code> puts the constant 5 on the stack; the next <code>BINARY_OP</code> adds; and <code>RETURN_VALUE</code> hands the top of the stack back to whoever called the function. (<code>RESUME</code> is bookkeeping, and the numbers 3 and 4 on the left are the source line numbers.) You never need to write bytecode, and the instruction names change between Python versions, but seeing it once makes the idea concrete: your source code becomes a list of tiny steps, and a loop in C performs them.</p>
  <p>Compiling takes a little time, so CPython avoids repeating it for files your program loads. When one file uses code from another with <code>import</code> (which means "load that file and let me use what it defines"), CPython saves the compiled bytecode of the imported file in a folder called <code>__pycache__</code>, in a file ending in <code>.pyc</code>. Next time, if the source has not changed, it loads the saved bytecode instead of compiling again. Below, <code>main.py</code> imports <code>billing.py</code>:</p>
  <div class="fx" data-lang="py"># billing.py
GST = 0.05
def with_tax(amount):
    return amount + amount * GST

# main.py
import billing
print(billing.with_tax(200))</div>
  <div class="fx" data-lang="text">$ ls
billing.py
main.py
$ python3 main.py
210.0
$ ls
__pycache__
billing.py
main.py
$ ls __pycache__
billing.cpython-313.pyc</div>
  <p>Before the run the folder contains only the two source files. After it, a <code>__pycache__</code> folder has appeared holding <code>billing.cpython-313.pyc</code>: the bytecode for <code>billing.py</code>, labelled with the Python version (3.13) because bytecode differs between versions. Notice there is no <code>.pyc</code> for <code>main.py</code>; the file you run directly is compiled fresh every time and never cached. A <code>.pyc</code> file only saves start-up time. It does not make the program run any faster once started, and it is not a way to hide your source code. It is safe to delete <code>__pycache__</code>; Python simply rebuilds it.</p>

  <h2 id="pf-impl"><span class="num">02</span>CPython, Other Pythons and Speed</h2>
  <p>"Python" is really two things: a <em>language</em>, which is a set of rules about what code means, and an <em>implementation</em>, which is a program that actually runs code written in that language. Most of the time they are the same thing in people's minds, because almost everyone uses CPython, the reference implementation, and the <code>python3</code> command on your computer is almost certainly CPython. But other implementations exist, and interviewers like to ask about them because the question tests whether you understand that "interpreted" is a property of an implementation rather than of a language.</p>
  <table class="tbl">
    <tr><th>Implementation</th><th>Written in</th><th>What makes it different</th></tr>
    <tr><td><b>CPython</b></td><td>C</td><td>The standard one. Compiles to bytecode and interprets it. Libraries such as numpy and pandas are built for it.</td></tr>
    <tr><td><b>PyPy</b></td><td>RPython (a restricted Python)</td><td>Has a <strong>JIT compiler</strong> ("just in time"): it watches which code runs often and compiles that code to real machine code while the program runs. Often several times faster on long pure-Python loops, with weaker support for C-based libraries.</td></tr>
    <tr><td>MicroPython</td><td>C</td><td>A small version for microcontrollers (tiny chips in devices).</td></tr>
    <tr><td>Jython / IronPython</td><td>Java / C#</td><td>Run on the Java and .NET platforms; they lag behind current Python versions.</td></tr>
  </table>
  <p>Pure Python code in CPython is slow compared with languages like C, and the reasons follow directly from the model in the previous section. Every single operation, even <code>total += i</code>, goes through the virtual machine's loop, which must fetch the instruction, work out what it means and carry it out. Every value, even a small integer, is a full object stored in memory with extra information attached. And because Python does not know the types of values in advance, every <code>+</code> has to check at that moment what kinds of values it was given and choose the right way to add them. A C program does none of this work at run time. A good way to picture it is the difference between a cook who must look up each step in the recipe book before doing it and a cook who knows the recipe by heart.</p>
  <p>The practical rule that comes out of this is: to make Python fast, move the repetitive inner loop out of Python bytecode and into code written in C. Built-in functions like <code>sum</code>, <code>max</code> and <code>sorted</code> are written in C, so a loop they perform skips the virtual machine. Here the same ten million additions are done twice, once by a Python loop and once by the built-in <code>sum</code> (timings are approximate and vary between machines and runs):</p>
  <div class="fx" data-lang="py">import time

def add_up_loop(n):
    total = 0
    for i in range(n):          # every step goes through the bytecode loop
        total += i
    return total

n = 10_000_000
t0 = time.perf_counter(); a = add_up_loop(n)
t1 = time.perf_counter(); b = sum(range(n))     # the same loop, written in C
t2 = time.perf_counter()
print(a == b)
print(f"Python loop : {t1 - t0:.2f} s")
print(f"built-in sum: {t2 - t1:.2f} s")</div>
  <div class="fx" data-lang="text">True
Python loop : 0.26 s
built-in sum: 0.12 s</div>
  <p>Both give the same answer, as the <code>True</code> confirms, but the built-in finished in roughly half the time, because its loop runs in C instead of going through the bytecode loop ten million times. For numbers stored in large arrays, libraries such as numpy push this much further by also avoiding the creation of a separate Python object for every number. Better algorithms, such as looking things up in a set instead of searching a list, often matter even more than the language. The golden rule is to measure first (the <code>cProfile</code> module shows where time goes) and only then optimise.</p>
  <p>One more CPython detail is asked about constantly. CPython has a <strong>GIL</strong>, the global interpreter lock: a rule that only one thread may run Python bytecode at any moment. A <strong>thread</strong> is one line of work inside a program; a program can have several. The GIL makes CPython's memory management simpler and safer, but it means that several threads cannot speed up a program that is busy calculating, because they take turns rather than running at the same time. Threads still help when a program spends its time waiting, for example on the network, because the GIL is released while waiting. Python 3.13 also offers an experimental build without the GIL. The full story is in <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>.</p>

  <h2 id="pf-run"><span class="num">03</span>Ways to Run Python</h2>
  <p>So far we have run code by saving it in a file and typing <code>python3 till.py</code>. A file of Python code run this way is called a <strong>script</strong>. Python runs it once, from the top to the bottom, and the only output you see is what the code prints. There are several other ways to run the same code, and each is suited to a different job. Choosing the right one saves a lot of time, especially while learning.</p>
  <table class="tbl">
    <tr><th>Way</th><th>Command</th><th>When to use it</th></tr>
    <tr><td>Script</td><td><code>python3 till.py</code></td><td>Real programs. Runs the file top to bottom once.</td></tr>
    <tr><td>REPL</td><td><code>python3</code></td><td>Trying out one idea. You type a line at the <code>&gt;&gt;&gt;</code> prompt and see its result immediately.</td></tr>
    <tr><td>Module</td><td><code>python3 -m package.module</code></td><td>Running a module by its import name, such as <code>python3 -m pip</code>, <code>python3 -m venv</code>, <code>python3 -m pytest</code>.</td></tr>
    <tr><td>One-liner</td><td><code>python3 -c "print(2 ** 10)"</code></td><td>A quick calculation from the terminal.</td></tr>
    <tr><td>Script, then REPL</td><td><code>python3 -i till.py</code></td><td>Run the file, then stay at a prompt with all its variables, which is handy for poking around after a crash.</td></tr>
    <tr><td>Notebook</td><td>Jupyter</td><td>A REPL in the browser split into cells; popular for data work. Cells keep their values in the order you ran them.</td></tr>
  </table>
  <p>The <strong>REPL</strong> deserves a word of explanation, because you will use it every day. The name stands for Read, Evaluate, Print, Loop: it reads one line you type, evaluates it (works out its value), prints the result, and loops back for the next line. The "print" step is automatic, which is the main difference from a script. In the REPL, typing <code>2 * 30</code> shows <code>60</code> straight away; in a script, the same line calculates 60 and throws it away silently, because only <code>print</code> shows output in a script. Beginners are often confused when code that "worked in the REPL" prints nothing as a script, and this is why.</p>
  <p>The next idea explains a line you will see at the bottom of a huge number of Python files. Every file of Python code is also a <strong>module</strong>, which simply means a file whose definitions other files can import. As we saw, importing a module <em>runs</em> it, top to bottom, so that its functions and values get defined. That raises a problem. Suppose <code>billing.py</code> contains a useful function plus a few lines that test it. When you run <code>billing.py</code> directly you want the test lines to run, but when <code>main.py</code> imports it you do not. Python solves this with a special variable called <code>__name__</code> that every module has. When a file is the one you ran, its <code>__name__</code> is the text <code>"__main__"</code>; when it is imported, its <code>__name__</code> is its own module name.</p>
  <div class="fx" data-lang="py"># billing.py
GST = 0.05
def with_tax(amount):
    return amount + amount * GST

print("billing.py says __name__ is", repr(__name__))
if __name__ == "__main__":
    print("run directly, testing:", with_tax(100))

# main.py
import billing
print("main.py says __name__ is", repr(__name__))
print("bill for 200:", billing.with_tax(200))</div>
  <div class="fx" data-lang="text">$ python3 billing.py
billing.py says __name__ is '__main__'
run directly, testing: 105.0

$ python3 main.py
billing.py says __name__ is 'billing'
main.py says __name__ is '__main__'
bill for 200: 210.0</div>
  <p>Follow the two runs. Run directly, <code>billing.py</code> reports its name as <code>'__main__'</code>, so the check <code>if __name__ == "__main__":</code> is true and the test line prints 105.0. When <code>main.py</code> imports it, the first print in <code>billing.py</code> still runs (importing runs the whole file), but this time it reports its name as <code>'billing'</code>, so the guarded test line is skipped. <code>main.py</code> is now the file that was run, so it is the one called <code>'__main__'</code>, and it uses the imported function to bill 200 as 210.0. This is why that check is called the <strong>main guard</strong>: code under it runs only when the file is run directly, never when it is imported. It also teaches a habit worth keeping: the top level of a module should mostly define things, and anything that <em>does</em> something should sit under the main guard or inside a function.</p>
  <p>The <code>-m</code> option deserves a little more explanation, because it fixes problems that puzzle many people. <code>python3 -m pkg.tool</code> asks Python to find the module through its normal import system, the same way <code>import pkg.tool</code> would, and then run it as the main module. It also adds your <em>current folder</em> to the list of places Python searches for imports (that list is called <code>sys.path</code>). Running <code>python3 pkg/tool.py</code> instead adds the <em>script's own folder</em>, which is why a file inside a package often fails to import its sister modules when run directly. The most useful case is <code>python3 -m pip install …</code>: your computer may have several Pythons, and the plain <code>pip</code> command might belong to a different one, so "I installed it but the import still fails" is a very common confusion. Running pip through <code>python3 -m</code> guarantees that the package goes into the same Python you are using (see <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>).</p>
  <p>Finally, on Linux and macOS a script can be made into a command you run directly. If its very first line is <code>#!/usr/bin/env python3</code>, called a <strong>shebang</strong>, the operating system knows which program should run the file, and after <code>chmod +x till.py</code> (which marks the file as executable) you can type <code>./till.py</code>. Using <code>/usr/bin/env</code> means "find <code>python3</code> wherever it is installed", which respects an active virtual environment.</p>

  <h2 id="pf-syntax"><span class="num">04</span>Indentation, Comments and Style</h2>
  <p>Most languages use curly braces or keywords like <code>end</code> to show which lines belong together. Python uses the indentation itself: the spaces at the start of a line. A line that ends with a colon, such as <code>if</code>, <code>for</code>, <code>while</code>, <code>def</code> or <code>class</code>, starts a <strong>block</strong>, and every following line that is indented further belongs to that block. The block ends at the first line that comes back to the original level. Think of the outline of a book: chapter titles at the left margin, sections indented under them, sub-points indented under those. You can see the structure just by looking at the left edge, and Python reads code the same way. The convention is 4 spaces per level.</p>
  <p>Because indentation is part of Python's grammar, getting it wrong is a SyntaxError, caught while compiling, before anything runs. Here are four common mistakes and the messages Python gives for them:</p>
  <div class="fx" data-lang="py">bad_sources = {
    "missing colon": "if 195 &gt;= 150\\n    print('discount')",
    "block not indented": "if True:\\nprint('discount')",
    "unexpected indent": "subtotal = 195\\n    tax = 9.75",
    "= instead of ==": "if subtotal = 150:\\n    pass",
}
for label, src in bad_sources.items():
    try:
        compile(src, "&lt;demo&gt;", "exec")
    except SyntaxError as e:
        print(f"{label:19} {type(e).__name__}: {e.msg}")</div>
  <div class="fx" data-lang="text">missing colon       SyntaxError: expected ':'
block not indented  IndentationError: expected an indented block after 'if' statement on line 1
unexpected indent   IndentationError: unexpected indent
= instead of ==     SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?</div>
  <p>The first is a missing colon at the end of an <code>if</code> line. The second has an <code>if</code> whose next line is not indented, so the block is empty, which Python does not allow. The third has a line indented for no reason. <code>IndentationError</code> is simply a more specific kind of <code>SyntaxError</code>. The fourth shows a deliberate design choice: writing <code>=</code> (which assigns a value) where <code>==</code> (which compares) was meant is a syntax error inside an <code>if</code> in Python, so a whole family of bugs common in C cannot happen. The message even suggests <code>:=</code>, the "walrus" operator, which is Python's explicit way to assign inside a condition (it appears in <a class="xref" data-note="py_control">Decisions &amp; Loops</a>).</p>
  <p>Grammar errors are the easy case, because Python tells you. The dangerous case is a line that is indented validly but at the wrong level. The program still runs, but does something different. Both loops below add up three prices; the only difference is how far the <code>print</code> line is indented:</p>
  <div class="fx" data-lang="py">prices = [60, 45, 90]

total = 0
for p in prices:
    total += p
    print("total:", total)      # indented: runs once per price

total = 0
for p in prices:
    total += p
print("total:", total)          # not indented: runs once, after the loop</div>
  <div class="fx" data-lang="text">total: 60
total: 105
total: 195
total: 195</div>
  <p>In the first version the <code>print</code> is indented under the <code>for</code>, so it belongs to the loop and runs once per price, showing the running total 60, 105, 195. In the second version it is back at the left edge, so it runs once, after the loop has finished, showing only 195. Neither version is wrong in itself; they mean different things, and Python cannot guess which you intended. This is why you should let your editor insert four spaces when you press Tab, and never mix tab characters with spaces (Python 3 refuses that mix with a <code>TabError</code>).</p>
  <p>A few smaller pieces of grammar complete the picture. A <code>#</code> starts a <strong>comment</strong>, which runs to the end of the line and is ignored by Python; good comments explain <em>why</em> the code does something, because the code itself already shows <em>what</em>. A text value written as the very first line inside a function, class or module is its <strong>docstring</strong> (documentation string); Python keeps it, and <code>help()</code> and editors display it. A statement normally ends at the end of its line, but if you are inside round, square or curly brackets, Python knows the statement is unfinished and lets it continue onto the next line:</p>
  <div class="fx" data-lang="py">total = (60 +
         45 +
         90)                    # inside brackets, the line can continue
menu = [
    "masala chai",
    "samosa",                   # a trailing comma is allowed
]
print(total, len(menu))</div>
  <div class="fx" data-lang="text">195 2</div>
  <p>The sum spread over three lines still gives 195, and the list spread over four lines still has two items. You may also see a backslash at the end of a line used to continue it, but that is fragile (an invisible space after the backslash breaks it), so brackets are preferred.</p>
  <p>Beyond grammar, the Python community has an official style guide called <strong>PEP 8</strong> (a PEP is a "Python Enhancement Proposal", a design document). Following it makes your code look like everyone else's, which makes it easier for others to read. Its main rules are about names and layout:</p>
  <table class="tbl">
    <tr><th>Kind of name</th><th>Style</th><th>Example</th></tr>
    <tr><td>Variables, functions, modules</td><td><code>snake_case</code> (lowercase with underscores)</td><td><code>line_total</code>, <code>billing.py</code></td></tr>
    <tr><td>Classes and exceptions</td><td><code>PascalCase</code> (each word capitalised)</td><td><code>OrderLine</code>, <code>PaymentError</code></td></tr>
    <tr><td>Constants</td><td><code>UPPER_CASE</code></td><td><code>GST_RATE = 0.05</code></td></tr>
    <tr><td>Internal, "please don't use from outside"</td><td>leading underscore</td><td><code>_cache</code></td></tr>
    <tr><td>Special names reserved by Python</td><td>double underscores both sides ("dunder")</td><td><code>__init__</code>, <code>__name__</code></td></tr>
  </table>
  <p>For layout, PEP 8 asks for 4 spaces per indentation level, lines of at most 79 characters (many teams allow 88 or 100), two blank lines between top-level functions, and imports at the top of the file. Nobody applies these by hand any more: tools called <em>formatters</em> (black, <code>ruff format</code>) rewrite your layout automatically, and <em>linters</em> (ruff, flake8) point out style problems and likely bugs.</p>

  <h2 id="pf-typing"><span class="num">05</span>Dynamic and Strong Typing</h2>
  <p>Every value has a <strong>type</strong>, which says what kind of value it is and therefore what you can do with it: 30 is an integer, so you can do arithmetic with it; "masala chai" is text, so you can make it uppercase. Programming languages differ in two separate ways when it comes to types, and people often mix the two up. The first question is <em>when</em> types are checked. In a <strong>statically typed</strong> language such as Java, you declare that a variable holds a whole number, and the compiler checks every use before the program is allowed to run. In a <strong>dynamically typed</strong> language such as Python, types are attached to the values themselves and checked at the moment an operation runs. The second question is <em>how strict</em> the language is about mixing types. A <strong>strongly typed</strong> language refuses to combine values of unrelated types; a <strong>weakly typed</strong> one quietly converts one of them so the operation can go ahead.</p>
  <table class="tbl">
    <tr><th></th><th>Strong (refuses to mix)</th><th>Weak (converts silently)</th></tr>
    <tr><td><b>Static</b> (checked before running)</td><td>Java, Rust, Go</td><td>C</td></tr>
    <tr><td><b>Dynamic</b> (checked while running)</td><td><b>Python</b>, Ruby</td><td>JavaScript, PHP</td></tr>
  </table>
  <p>Python is dynamic and strong, and a short program shows both halves:</p>
  <div class="fx" data-lang="py">x = 30
print(type(x).__name__)
x = "thirty"                    # same name, now a str: dynamic typing
print(type(x).__name__)

try:
    print("30" + 5)             # no silent conversion: strong typing
except TypeError as e:
    print("TypeError:", e)

print(3 + 4.5, True + 1)        # numbers may mix: int -&gt; float is allowed

def double(n: int) -&gt; int:      # type hints are notes, not checks
    return n * 2
print(double("ab"))</div>
  <div class="fx" data-lang="text">int
str
TypeError: can only concatenate str (not "int") to str
7.5 2
abab</div>
  <p>The first four lines show dynamic typing. The name <code>x</code> first refers to the integer 30 and then to the text "thirty"; Python is happy with this because the name itself has no type, only the value it currently points to does. A good analogy is a luggage tag: the tag can be moved from a suitcase to a backpack, and what kind of bag it is belongs to the bag, not to the tag. The <code>try</code> block shows strong typing. Adding the text "30" to the number 5 raises a <code>TypeError</code>, because Python refuses to guess whether you meant the text "305" or the number 35. JavaScript would silently produce "305", and many real bugs come from such guesses. Python does allow mixing within the family of numbers, which is why <code>3 + 4.5</code> is 7.5 and even <code>True + 1</code> is 2 (a <code>bool</code> is a kind of integer, as <a class="xref" data-note="py_values">Values, Types &amp; Variables</a> explains).</p>
  <p>The last part shows something that surprises people coming from other languages. The <code>: int</code> and <code>-&gt; int</code> are <strong>type hints</strong>: notes saying "this function expects an integer and returns an integer". Python stores them but does not check them when running, so <code>double("ab")</code> happily returns "abab" (doubling text repeats it). Hints are read by your editor and by separate checking tools such as mypy, which can warn you before the program runs. Using hints this way, adding optional static checks to a dynamic language, is called <strong>gradual typing</strong>.</p>
  <p>Dynamic typing leads to a style called <strong>duck typing</strong>, from the saying "if it walks like a duck and quacks like a duck, it is a duck". Python code usually does not ask what type a value is; it simply tries to use it. A <code>for</code> loop works on anything that can hand out items one by one, and a function that reads from a file works on anything with a <code>read()</code> method. This makes Python code flexible, at the cost of finding some mistakes only when the code runs.</p>

  <h2 id="pf-objects"><span class="num">06</span>Everything Is an Object</h2>
  <p>In Python, every value is an <strong>object</strong>: a piece of data stored in the computer's memory that knows its own type and carries the operations that belong to that type. This is true not only of numbers and text but also of functions, of types themselves and of whole modules. Many languages treat numbers as plain raw data and functions as something special that is not data at all; Python treats them all in one uniform way. That uniformity is why so much of Python feels consistent, and you will lean on it constantly, for example every time you pass a function to <code>sorted</code> to control the order.</p>
  <p>Think of a well-run warehouse where every item, whether it is a box of tea, a tool, or the instruction manual for a machine, gets the same kind of label with a barcode and a category. Because everything is labelled the same way, any item can be stored on a shelf, put in a crate, or handed to someone. In Python, every value carries that label, so any value can be stored in a list, given a name, or passed to a function.</p>
  <div class="fx" data-lang="py">print((255).bit_length(), (3.5).is_integer(), "chai".upper())

def greet():
    """Say hello to a customer."""
    return "hello"

print(type(greet).__name__, greet.__name__, greet.__doc__)
print(type(30), type(greet), type(int))

import math
print(type(math).__name__)

steps = [len, str.upper, greet]       # functions stored in a list
print(steps[0]("samosa"), steps[1]("samosa"), steps[2]())</div>
  <div class="fx" data-lang="text">8 False CHAI
function greet Say hello to a customer.
&lt;class 'int'&gt; &lt;class 'function'&gt; &lt;class 'type'&gt;
module
6 SAMOSA hello</div>
  <p>Go through the output line by line. Even a plain number has methods (functions that belong to it): <code>(255).bit_length()</code> asks 255 how many binary digits it needs (8), and the brackets around 255 are only there so that the dot is not mistaken for a decimal point. A function is an object of type <code>function</code> with its own attributes: its name, and its docstring "Say hello to a customer." The third line shows that 30's type is <code>int</code>, <code>greet</code>'s type is <code>function</code>, and the type <code>int</code> is itself an object whose type is <code>type</code>. A module such as <code>math</code> is an object of type <code>module</code>. Finally, three functions are stored in a list like any other values and called from it: <code>len("samosa")</code> is 6, <code>str.upper("samosa")</code> is "SAMOSA", and <code>greet()</code> returns "hello".</p>
  <p>The most important consequence comes next. Because values are objects that live in memory, a variable is not a box that holds a value; it is a name that <em>refers to</em> an object. Writing <code>b = a</code> does not copy anything; it makes a second name for the same object. Everything about assignment, copying, and comparing with <code>is</code> versus <code>==</code> follows from this, and it is the main subject of <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>. Functions as values are developed in <a class="xref" data-note="py_functions">Functions</a>. And because objects take up memory, Python needs a way to know when an object is no longer needed, which is the next section.</p>

  <h2 id="pf-memory"><span class="num">07</span>How Python Frees Memory</h2>
  <p>Every object a program creates takes up some memory. A program that runs for days, such as a web server, creates millions of objects, and if none of them were ever freed the computer would run out of memory. In C, the programmer must free each piece of memory by hand, and forgetting (a "memory leak") or freeing too early (a crash) are among the most common bugs in that language. Python frees memory for you automatically, a feature called <strong>automatic memory management</strong>. CPython does it with two mechanisms working together.</p>
  <p>The main mechanism is <strong>reference counting</strong>. Every object keeps a count of how many references point to it. A reference is anything that refers to the object: a name, a slot in a list, an attribute of another object, or an argument inside a function call. Giving the object another name or putting it into a list adds one to the count; removing a name, emptying the list, or a function call finishing subtracts one. The moment the count reaches zero, nothing in the program can reach the object any more, so CPython frees it immediately. Think of a library book with a slip inside recording everyone who currently has it checked out: as long as one name is on the slip the book stays out, and when the last person returns it, it goes straight back on the shelf.</p>
  <p>You can watch the count with <code>sys.getrefcount</code>:</p>
  <div class="fx" data-lang="py">import sys
order = ["chai", "samosa"]
print(sys.getrefcount(order))   # 1 name + 1 temporary reference for the call
kitchen = order                 # a second name for the same list
print(sys.getrefcount(order))
bills = [order]                 # a list holding it
print(sys.getrefcount(order))
del kitchen                     # removes a NAME, not the list
bills.clear()
print(sys.getrefcount(order))</div>
  <div class="fx" data-lang="text">2
3
4
2</div>
  <p>The first number is 2, not 1, which confuses everyone the first time. The name <code>order</code> is one reference, and passing the list into <code>getrefcount(...)</code> creates a second, temporary reference for the duration of that call, so the reported number is always one higher than you expect. Adding the name <code>kitchen</code> raises it to 3, and putting the list inside <code>bills</code> raises it to 4. Then <code>del kitchen</code> removes the name <code>kitchen</code> and <code>bills.clear()</code> empties the other list, bringing it back to 2. Notice what <code>del</code> did: it deleted a <em>name</em>, not the list. The list survives because <code>order</code> still refers to it.</p>
  <p>Because the count is updated on every change, freeing happens at a predictable moment: exactly when the last reference disappears. A class can define a special method called <code>__del__</code> that Python calls just before freeing an object, which lets us see the moment:</p>
  <div class="fx" data-lang="py">class Order:
    def __del__(self):          # Python calls this just before freeing the object
        print("order freed")

o = Order()
print("about to drop the last reference")
o = None                        # count reaches 0
print("next line")</div>
  <div class="fx" data-lang="text">about to drop the last reference
order freed
next line</div>
  <p>"order freed" appears between the two other lines, the instant <code>o = None</code> moved the only name away from the object and its count dropped to zero. There was no delay and no separate cleaning step.</p>
  <p>Reference counting has one blind spot: a <strong>reference cycle</strong>, which is a group of objects that refer to each other. Imagine two nodes, <code>a</code> and <code>b</code>, where <code>a.partner</code> is <code>b</code> and <code>b.partner</code> is <code>a</code>. Even after every outside name is deleted, each object is still referred to by the other, so each count stays at 1 and never reaches zero, even though the program can no longer reach either object. The figure shows the situation: the names on the left have been deleted, and the two objects keep each other alive.</p>
  <figure class="viz"><svg viewBox="0 0 520 130" width="520">
<defs><marker id="pf-a6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="150" y="40" width="90" height="40" rx="8" class="fr sr"/><text x="195" y="65" text-anchor="middle" font-size="12">Node a</text>
<rect x="320" y="40" width="90" height="40" rx="8" class="fr sr"/><text x="365" y="65" text-anchor="middle" font-size="12">Node b</text>
<path d="M240 52 L318 52" stroke="currentColor" fill="none" marker-end="url(#pf-a6)"/><text x="279" y="45" text-anchor="middle" class="tm" font-size="10">partner</text>
<path d="M320 70 L242 70" stroke="currentColor" fill="none" marker-end="url(#pf-a6)"/><text x="279" y="88" text-anchor="middle" class="tm" font-size="10">partner</text>
<rect x="10" y="40" width="80" height="40" rx="8" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="50" y="65" text-anchor="middle" class="tm" font-size="11">names: del</text>
<text x="280" y="120" text-anchor="middle" class="tm" font-size="10.5">each count stays 1 → only the cyclic garbage collector can free them</text>
</svg><figcaption>A reference cycle with no outside references: nothing can reach these objects, yet their counts never reach zero.</figcaption></figure>
  <p>To deal with cycles, CPython has a second mechanism, the <strong>cyclic garbage collector</strong>, available as the <code>gc</code> module. Every so often it examines objects that can hold references to other objects, such as lists and class instances, finds groups that are reachable only from each other, and frees them. It normally runs automatically, but we can trigger it by hand to watch it work:</p>
  <div class="fx" data-lang="py">import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.partner = None
    def __del__(self):
        print("freed", self.name)

a, b = Node("a"), Node("b")
a.partner = b
b.partner = a                   # a reference cycle: a -&gt; b -&gt; a
del a, b                        # the names are gone...
print("after del: nothing freed yet")
print("gc.collect() found", gc.collect(), "unreachable objects")</div>
  <div class="fx" data-lang="text">after del: nothing freed yet
freed a
freed b
gc.collect() found 2 unreachable objects</div>
  <p>After <code>del a, b</code> nothing was printed, because the cycle kept both counts at 1. Only when <code>gc.collect()</code> ran did "freed a" and "freed b" appear, and the collector reports that it found 2 unreachable objects. The collector is <strong>generational</strong>: new objects are checked often, and objects that survive several checks are moved to an "older generation" that is checked rarely, because in practice most objects are either thrown away quickly or kept for a long time. You almost never need to call <code>gc.collect()</code> yourself, and <code>gc.disable()</code> turns off only the cycle collector, never reference counting.</p>
  <p>Two practical points follow. First, Python programs can still "leak" memory, but not the way C programs do: a Python leak is almost always an object that is still referenced when you thought it was gone, such as a global list that keeps growing, a cache with no size limit, or a function that holds on to a big object. The <code>tracemalloc</code> module shows where memory is being allocated, and the <code>weakref</code> module creates references that do not add to the count, for caches that should not keep objects alive. Second, do not rely on <code>__del__</code> to close files or network connections; it may run late (inside a cycle) or not at all when the program exits. The reliable tool is the <code>with</code> statement, covered in <a class="xref" data-note="py_context">Context Managers</a>.</p>

  <h2 id="pf-errors"><span class="num">08</span>Reading a Traceback</h2>
  <p>Sooner or later every program hits a problem it cannot handle, such as dividing by zero or adding text to a number. When that happens Python creates an <strong>exception</strong>, an object describing what went wrong. If nothing in the program deals with the exception, Python stops the program and prints a <strong>traceback</strong>: a report showing the chain of function calls that were in progress, followed by the type of exception and a message. Reading tracebacks quickly is the single most useful debugging skill, and beginners often find them intimidating only because they read them in the wrong order.</p>
  <p>Here is a realistic case. The stall now keeps each order as a list of lines, each line holding an item, a quantity and a price, and a function adds them up. One quantity came from a web form, and forms send everything as text, so it arrived as the text <code>"3"</code> instead of the number 3:</p>
  <div class="fx" data-lang="py"># till.py
def subtotal(lines):
    total = 0
    for item, qty, price in lines:
        total += qty * price
    return total

order = [("samosa", "3", 15)]     # qty arrived as TEXT from a form
print(subtotal(order))</div>
  <div class="fx" data-lang="text">$ python3 till.py
Traceback (most recent call last):
  File "till.py", line 8, in &lt;module&gt;
    print(subtotal(order))
          ~~~~~~~~^^^^^^^
  File "till.py", line 4, in subtotal
    total += qty * price
TypeError: unsupported operand type(s) for +=: 'int' and 'str'</div>
  <p>A traceback is printed with the outermost call at the top and the place where the error happened at the bottom, so the best way to read it is from the bottom up. The last line says <em>what</em> went wrong: a <code>TypeError</code>, because <code>+=</code> was asked to combine an integer and a piece of text. The lines just above it say <em>where</em>: file <code>till.py</code>, line 4, inside the function <code>subtotal</code>, and they show the line itself, <code>total += qty * price</code>. The lines above that say <em>how the program got there</em>: line 8, at the top level of the file (which Python calls <code>&lt;module&gt;</code>), called <code>subtotal(order)</code>. The <code>~~~~^^^^</code> marks underline the exact part of the line involved.</p>
  <p>Now we can understand the real cause, which is a nice example of why you should think rather than just fix the last line. <code>qty * price</code> was <code>"3" * 15</code>, and multiplying text by a number is allowed in Python: it repeats the text, giving <code>"333333333333333"</code>. The error only surfaced on the next step, when that text was added to the integer total. The right fix is not on line 4 at all; it is where the bad value <em>entered</em> the program, by converting the form's text with <code>int()</code> as soon as it arrives. In long tracebacks that pass through libraries, scan upward from the bottom for the last frame that is in <em>your</em> code; that is usually where the fix belongs. And for a SyntaxError, remember that the real mistake is often on the line <em>before</em> the one reported, such as an unclosed bracket.</p>
  <p>The exception's type is the fastest clue to what kind of problem you have, so it is worth knowing the common ones by sight. The program below triggers nine of them, one per line, and prints the type and message of each:</p>
  <div class="fx" data-lang="py">menu = {"chai": 30, "samosa": 15}
order = ["chai", "samosa"]
tests = [
    "undefined_name + 1",
    "'30' + 5",
    "int('3.5')",
    "order.push('vada pav')",
    "order[5]",
    "menu['dosa']",
    "184 / 0",
    "import chai_corner",
    "open('missing.csv')",
]
for src in tests:
    try:
        exec(src)
    except Exception as e:
        print(f"{src:24} {type(e).__name__}: {e}")</div>
  <div class="fx" data-lang="text">undefined_name + 1       NameError: name 'undefined_name' is not defined
'30' + 5                 TypeError: can only concatenate str (not "int") to str
int('3.5')               ValueError: invalid literal for int() with base 10: '3.5'
order.push('vada pav')   AttributeError: 'list' object has no attribute 'push'
order[5]                 IndexError: list index out of range
menu['dosa']             KeyError: 'dosa'
184 / 0                  ZeroDivisionError: division by zero
import chai_corner       ModuleNotFoundError: No module named 'chai_corner'
open('missing.csv')      FileNotFoundError: [Errno 2] No such file or directory: 'missing.csv'</div>
  <p>Each of these has a typical cause, and once you recognise the type you usually know where to look:</p>
  <table class="tbl">
    <tr><th>Exception</th><th>What it means</th><th>Typical cause</th></tr>
    <tr><td><code>SyntaxError</code> / <code>IndentationError</code></td><td>the code breaks Python's grammar</td><td>missing colon or bracket, bad indentation; reported before anything runs</td></tr>
    <tr><td><code>NameError</code></td><td>a name that does not exist</td><td>a typo, using a variable before creating it, a missing import</td></tr>
    <tr><td><code>TypeError</code></td><td>an operation on the wrong type of value, or a call with the wrong arguments</td><td>text + number, calling something that is not a function</td></tr>
    <tr><td><code>ValueError</code></td><td>the right type but an unacceptable value</td><td><code>int("3.5")</code>: it is text, but not whole-number text</td></tr>
    <tr><td><code>AttributeError</code></td><td>the object has no attribute or method with that name</td><td>a typo, or a method from another type (<code>push</code> is JavaScript; Python lists use <code>append</code>)</td></tr>
    <tr><td><code>IndexError</code> / <code>KeyError</code></td><td>a position past the end of a list / a missing dictionary key</td><td>counting one too far; a key that was never added</td></tr>
    <tr><td><code>ZeroDivisionError</code></td><td>division by zero</td><td>averaging an empty group</td></tr>
    <tr><td><code>ModuleNotFoundError</code></td><td>an import failed</td><td>the package is not installed in <em>this</em> Python</td></tr>
    <tr><td><code>FileNotFoundError</code></td><td>no file at that path</td><td>a relative path read from a different working folder</td></tr>
    <tr><td><code>RecursionError</code></td><td>a function called itself too deeply (about 1000 levels)</td><td>a recursive function with no stopping case</td></tr>
  </table>
  <p>Some of these are related. <code>IndentationError</code> is a kind of <code>SyntaxError</code>; <code>IndexError</code> and <code>KeyError</code> are both kinds of <code>LookupError</code>; <code>ModuleNotFoundError</code> is a kind of <code>ImportError</code>; and <code>FileNotFoundError</code> is a kind of <code>OSError</code>. These family relationships matter when you start catching exceptions, which is covered in <a class="xref" data-note="py_exceptions">Exceptions &amp; Error Handling</a>; debuggers and logging are in <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>.</p>

  <h2 id="pf-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>A classic beginner mistake is naming your own file after a module that Python already provides. When you write <code>import random</code>, Python searches a list of folders in order, and the folder containing the script you ran comes first. So if you saved a practice file as <code>random.py</code>, Python imports <em>your</em> file instead of the real module:</p>
  <div class="fx" data-lang="py"># random.py   (your own file, sitting next to dice.py)
print("loaded MY random.py")

# dice.py
import random
print(random.randint(1, 6))</div>
  <div class="fx" data-lang="text">$ python3 dice.py
loaded MY random.py
Traceback (most recent call last):
  File "dice.py", line 2, in &lt;module&gt;
    print(random.randint(1, 6))
          ^^^^^^^^^^^^^^
AttributeError: module 'random' has no attribute 'randint' (consider renaming 'random.py' since it has the same name as the standard library module named 'random' and prevents importing that standard library module)</div>
  <p>"loaded MY random.py" shows that the wrong file was imported, and since your file has no <code>randint</code>, the next line fails. Recent Python versions even add a hint about renaming the file. The fix is to rename your file (and delete its <code>__pycache__</code> folder). Avoid naming files <code>random.py</code>, <code>math.py</code>, <code>email.py</code>, <code>numpy.py</code>, <code>pandas.py</code> or <code>test.py</code>.</p>
  <p>A second mistake is forgetting that everything coming from outside the program, whether typed with <code>input()</code>, read from a file, or sent by a form, arrives as text. Text "adds" by joining, so the arithmetic is silently wrong rather than an error:</p>
  <div class="fx" data-lang="py">qty_text = "2"                  # what input(), a form or a CSV file gives you
print(qty_text + "3")           # text joined to text
print(int(qty_text) + 3)        # convert first, then add</div>
  <div class="fx" data-lang="text">23
5</div>
  <p>Joining the text "2" and "3" gives "23", with no warning. Converting with <code>int()</code> first gives the intended 5. The rule is to convert at the boundary: turn text into numbers the moment it enters your program.</p>
  <p>A third mistake is leaving off the brackets when calling a function. Without brackets, you are referring to the function object itself rather than running it:</p>
  <div class="fx" data-lang="py">def opening_message():
    return "Till is open"

print(opening_message)          # forgot the brackets: the function itself
print(opening_message())        # called: its result
if opening_message:             # a function object is always truthy
    print("this always runs")</div>
  <div class="fx" data-lang="text">&lt;function opening_message at 0x7f725c56b1a0&gt;
Till is open
this always runs</div>
  <p>The first print shows <code>&lt;function opening_message at 0x…&gt;</code>, which is Python describing the function object and its memory address, rather than the message. Only with brackets does the function run and return "Till is open". The <code>if</code> at the end is the sneaky version: a function object is always treated as true, so a condition like <code>if is_open:</code> written without brackets is always true, no matter what the function would have returned.</p>
  <p>Three more mistakes come up often enough to remember. Running <code>pip install something</code> and then finding that <code>import something</code> fails usually means pip belongs to a different Python; use <code>python3 -m pip install something</code> inside your active virtual environment. Putting code that does real work at the top level of a module means it runs every time the module is imported, so a file meant to be imported for its functions might, for example, start a long calculation; put such code under the main guard. And remember that a syntax error is reported before anything runs while every other error appears only when its line runs, so code paths your tests never reach can still contain simple typos.</p>

  <h2 id="pf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Execution model</h3>
  <ul>
    <li><b>Source code</b>: the text you write. <b>Bytecode</b>: compact instructions CPython compiles it into. <b>Virtual machine</b>: the C loop that runs bytecode.</li>
    <li>CPython = compile to bytecode, then interpret the bytecode. No machine code is produced (PyPy's JIT does produce it).</li>
    <li>Whole file compiled first: <code>SyntaxError</code> / <code>IndentationError</code> before line 1 runs. All other errors only when their line runs.</li>
    <li>Imported modules are cached in <code>__pycache__/name.cpython-313.pyc</code>; the script you run is not cached. <code>.pyc</code> only speeds up start-up.</li>
    <li><code>dis.dis(f)</code> shows bytecode. Pure Python is slow because every operation goes through the VM and checks types; move inner loops into C (built-ins, numpy).</li>
    <li><b>GIL</b>: only one thread runs Python bytecode at a time in standard CPython.</li>
  </ul>
  <h3>Running code</h3>
  <table class="tbl">
    <tr><th>Command</th><th>Effect</th></tr>
    <tr><td><code>python3 file.py</code></td><td>run a script; script's folder goes first on <code>sys.path</code></td></tr>
    <tr><td><code>python3</code></td><td>REPL: evaluates each line and shows its value</td></tr>
    <tr><td><code>python3 -m pkg.mod</code></td><td>run a module by import name; current folder on <code>sys.path</code></td></tr>
    <tr><td><code>python3 -i file.py</code> / <code>-c "code"</code></td><td>run then stay in REPL / one-liner</td></tr>
    <tr><td><code>python3 -m pip install x</code></td><td>install into <em>this</em> Python</td></tr>
  </table>
  <ul>
    <li><code>__name__</code> is <code>"__main__"</code> for the file you ran and the module name when imported. <code>if __name__ == "__main__":</code> = main guard.</li>
    <li>Blocks are marked by indentation after a colon; 4 spaces; tabs mixed with spaces → <code>TabError</code>. Brackets allow a statement to continue on the next line.</li>
    <li>PEP 8: <code>snake_case</code> variables/functions/modules, <code>PascalCase</code> classes, <code>UPPER_CASE</code> constants, <code>_internal</code>.</li>
  </ul>
  <h3>Types and objects</h3>
  <ul>
    <li><b>Dynamic</b>: types belong to values; a name can point to any type. <b>Strong</b>: <code>"30" + 5</code> → TypeError, no silent conversion.</li>
    <li>Type hints are not checked when running; mypy/pyright check them separately. <b>Duck typing</b>: what a value can do matters, not its declared type.</li>
    <li>Everything is an object, including functions, types and modules. Names refer to objects; assignment never copies.</li>
  </ul>
  <h3>Memory</h3>
  <ul>
    <li><b>Reference counting</b>: each object counts its references and is freed the instant the count hits 0. <code>sys.getrefcount(x)</code> reports one extra.</li>
    <li><code>del name</code> removes a name, not the object.</li>
    <li><b>Cyclic garbage collector</b> (<code>gc</code>): frees groups of objects that refer only to each other; generational; runs automatically.</li>
    <li>Python "leaks" are lingering references (growing globals, unbounded caches). Tools: <code>tracemalloc</code>, <code>weakref</code>. Close resources with <code>with</code>, not <code>__del__</code>.</li>
  </ul>
  <h3>Errors</h3>
  <ul>
    <li>Read a traceback bottom-up: last line = what; frame above = where; higher frames = how you got there. Fix where the bad value entered.</li>
    <li>NameError (unknown name) · TypeError (wrong type or arguments) · ValueError (bad value) · AttributeError (no such attribute) · IndexError / KeyError (both LookupError) · ZeroDivisionError · ModuleNotFoundError (ImportError) · FileNotFoundError (OSError) · RecursionError.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>A file named like a real module (<code>random.py</code>) hides it.</li>
    <li>Text from input/files/forms must be converted: <code>"2" + "3" == "23"</code>.</li>
    <li><code>f</code> without brackets is the function itself, and is always truthy.</li>
    <li>Importing a module runs its top-level code; guard scripts with <code>if __name__ == "__main__":</code>.</li>
  </ul>

  <h2 id="pf-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python interpreted or compiled?</summary><div class="qa-body">In CPython, both. Source code is first compiled to bytecode, and the bytecode is then executed by an interpreter loop called the virtual machine. No machine code is produced ahead of time. "Interpreted" really describes an implementation rather than the language: PyPy, for example, compiles frequently used code to machine code while the program runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is bytecode, and what are <code>.pyc</code> files and <code>__pycache__</code>?</summary><div class="qa-body">Bytecode is the compact, platform-independent instruction set that CPython compiles source code into; <code>dis.dis(f)</code> shows it. When a module is imported, its bytecode is saved in <code>__pycache__/name.cpython-313.pyc</code> and reused while the source is unchanged. This only skips recompiling at start-up; it does not make the code run faster, and the script you run directly is not cached.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a <code>SyntaxError</code> stop a program before its first line runs, while a <code>NameError</code> appears halfway through?</summary><div class="qa-body">CPython compiles the whole file before running any of it, and grammar is checked during compilation, so a syntax error anywhere prevents the file from running at all. Whether a name exists, or whether types fit together, is only checked when the line executes. That is why untested branches can hide simple mistakes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between CPython and PyPy?</summary><div class="qa-body">CPython is the reference implementation, written in C: it interprets bytecode, uses reference counting, and is what C-based libraries like numpy are built for. PyPy is an alternative implementation with a JIT compiler that turns frequently run code into machine code, so long pure-Python loops are often much faster, but its support for C extensions is weaker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is pure Python slower than C, and how do you speed it up?</summary><div class="qa-body">Every operation goes through the bytecode loop, every value is a full object in memory, and types are checked on every operation because they are not known in advance. To speed it up, move the inner loop into C: use built-ins like <code>sum</code> and <code>sorted</code>, vectorise with numpy or pandas, choose better data structures (a set lookup instead of a list scan), or use tools like PyPy, Numba or Cython. Always profile first with <code>cProfile</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL?</summary><div class="qa-body">The global interpreter lock is a lock in CPython that allows only one thread to run Python bytecode at a time. It keeps memory management simple and safe, but it stops threads from using several CPU cores for calculation-heavy Python code. Threads still help when the program is waiting on I/O, because the lock is released while waiting. For CPU-heavy work use multiple processes; Python 3.13 also has an experimental build without the GIL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>if __name__ == "__main__":</code> do?</summary><div class="qa-body">Every module has a <code>__name__</code> variable: it is <code>"__main__"</code> for the file that was run directly and the module's own name when it is imported. The check therefore runs the code under it only when the file is run as a program, so other files can import its functions without triggering that code. It is also required for <code>multiprocessing</code> on some platforms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>python script.py</code> and <code>python -m package.module</code>?</summary><div class="qa-body"><code>-m</code> finds the module through the import system and runs it as <code>__main__</code>, with the current folder on <code>sys.path</code>, so imports of the surrounding package work. Running a file path puts that file's own folder on <code>sys.path</code> instead, which often breaks package imports. <code>python -m pip</code> also guarantees you use the pip that belongs to that Python.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python statically or dynamically typed? Strongly or weakly?</summary><div class="qa-body">Dynamically typed: types belong to values and are checked when operations run, and a name can be pointed at a value of any type. Strongly typed: operations on incompatible types raise an error instead of converting silently, so <code>"30" + 5</code> is a TypeError. Type hints add optional checking through external tools, but the interpreter ignores them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is duck typing?</summary><div class="qa-body">Code relies on what an object can do rather than what type it is: "if it walks like a duck and quacks like a duck, it is a duck". Anything that can produce items one by one works in a <code>for</code> loop, and anything with a <code>read()</code> method can be used where a file is expected. It makes code flexible, and <code>typing.Protocol</code> lets type checkers describe it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "everything in Python is an object" mean in practice?</summary><div class="qa-body">Numbers, text, functions, types and modules all have a type, an identity and attributes. Variables are names that refer to objects, so assignment never copies. Functions can be stored in lists and passed to other functions (as with <code>sorted(key=...)</code>), types are objects whose type is <code>type</code>, and even <code>(255).bit_length()</code> is a method call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python manage memory?</summary><div class="qa-body">CPython uses reference counting: every object counts the references to it and is freed immediately when the count reaches zero. A generational cyclic garbage collector, the <code>gc</code> module, additionally finds groups of objects that refer to each other but cannot be reached, and frees them. The programmer never frees memory by hand.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Python need a garbage collector if it already has reference counting?</summary><div class="qa-body">Reference counting cannot free cycles. If <code>a.partner = b</code> and <code>b.partner = a</code>, then after <code>del a, b</code> each object still has a count of 1 from the other, even though nothing can reach them. The cyclic collector looks for such isolated groups and frees them. It is generational because most objects die young, so new objects are checked more often than old ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does <code>del x</code> free memory?</summary><div class="qa-body">Not necessarily. <code>del x</code> removes the name <code>x</code>, which lowers the object's reference count by one. The object is freed only if that was its last reference. After <code>x = [1]; y = x; del x</code>, the list is still alive because <code>y</code> refers to it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>sys.getrefcount(obj)</code> return one more than expected?</summary><div class="qa-body">Passing <code>obj</code> into the function creates a temporary reference that lasts for the call. So a list with a single name reports 2. For small integers and some strings the numbers are huge and meaningless, because the interpreter shares those objects widely.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a Python program leak memory? How would you investigate?</summary><div class="qa-body">Yes, through references that are never dropped: a global list or dictionary that keeps growing, a cache with no size limit, or callbacks holding large objects. Investigate with <code>tracemalloc</code> snapshots taken at different times to see which lines allocate more and more, and tools like <code>gc.get_objects()</code> or objgraph to see what keeps objects alive. Fix it with bounded caches or <code>weakref</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Python traceback?</summary><div class="qa-body">From the bottom up. The last line gives the exception type and message, which says what went wrong. The frame just above shows the file, line and function where it happened. Frames higher up show the chain of calls that led there; in long tracebacks, find the last frame in your own code. Then fix the cause where the bad value came from, not only where it exploded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>TypeError</code> and <code>ValueError</code>? Between <code>KeyError</code> and <code>IndexError</code>?</summary><div class="qa-body"><code>TypeError</code> means the operation does not support that type at all, as in <code>"30" + 5</code>. <code>ValueError</code> means the type is acceptable but the particular value is not, as in <code>int("3.5")</code>. <code>KeyError</code> is a missing dictionary key and <code>IndexError</code> is a list position out of range; both are subclasses of <code>LookupError</code>, so one <code>except LookupError</code> catches either.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is indentation in Python just a style choice?</summary><div class="qa-body">No. Indentation is part of the grammar: it defines which lines belong to a block, and inconsistent indentation is an <code>IndentationError</code> or <code>TabError</code>. A line indented validly but at the wrong level changes what the program does without any error. PEP 8, the style guide, adds conventions on top, such as 4 spaces per level, <code>snake_case</code> names and line length.</div></details>
</main>
`
});
