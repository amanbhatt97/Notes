// notes/python/py_fundamentals.js — How Python Runs Your Code
Object.assign(TOPIC_CONTENT, {
  "py_fundamentals": `<main>
<h1>How Python Runs Your Code</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Python Basics</span><span>How Python Runs Your Code</span></div>
  <p class="lead">Python is usually called "interpreted", but CPython actually compiles your source to <strong>bytecode</strong> and runs that on a virtual machine, managing memory for you with <strong>reference counting</strong> plus a cycle-detecting garbage collector. Knowing this model explains things that otherwise look like magic: why a typo is reported before any line runs, what <code>__pycache__</code> is, why <code>if __name__ == "__main__":</code> exists, why Python is "dynamic but strong", and when objects are actually freed. It also covers the practical basics every interview assumes: running scripts, the REPL and <code>python -m</code>, indentation and PEP 8, reading a traceback bottom-up, the common built-in exceptions, and the mistakes beginners make most. Code here was run on Python 3.13 (CPython).</p>

  <h2 id="pf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">How Python Runs Code</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Execution model</div>
        <ul>
          <li>Source → <b>bytecode</b> → CPython <b>virtual machine</b></li>
          <li>Whole file compiled first: SyntaxError before line 1 runs</li>
          <li>Imported modules cached as <code>__pycache__/*.cpython-313.pyc</code></li>
          <li><code>dis.dis(f)</code> shows the bytecode</li>
          <li>Other implementations: PyPy (JIT), MicroPython, Jython</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running code</div>
        <ul>
          <li><code>python3 file.py</code>: run a script top to bottom</li>
          <li>REPL: <code>python3</code>; echoes expression values</li>
          <li><code>python3 -m pkg.mod</code>: run a module by import name</li>
          <li><code>if __name__ == "__main__":</code> runs only as a script</li>
          <li>Shebang <code>#!/usr/bin/env python3</code> + <code>chmod +x</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Syntax</div>
        <ul>
          <li>Indentation defines blocks (4 spaces); colon ends headers</li>
          <li><code>#</code> comments; docstrings for documentation</li>
          <li>Implicit line continuation inside <code>() [] {}</code></li>
          <li>PEP 8: <code>snake_case</code>, <code>PascalCase</code> classes, <code>UPPER_CASE</code> constants</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Typing</div>
        <ul>
          <li><b>Dynamic</b>: types live on objects, names can be rebound to any type</li>
          <li><b>Strong</b>: <code>"30" + 5</code> → TypeError, no silent coercion</li>
          <li>Type hints are optional and not enforced at run time</li>
          <li>Duck typing: behaviour matters, not declared type</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Objects &amp; memory</div>
        <ul>
          <li>Everything is an object: ints, functions, classes, modules</li>
          <li>Names are references; <code>del</code> removes a name</li>
          <li><b>Reference counting</b> frees an object when its count hits 0</li>
          <li><b>Cyclic GC</b> (<code>gc</code>) frees unreachable cycles; generational</li>
          <li><code>sys.getrefcount(x)</code> is one higher (its own argument)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Errors</div>
        <ul>
          <li>Read a traceback <b>bottom-up</b>: what, then where, then how</li>
          <li>NameError, TypeError, ValueError, AttributeError</li>
          <li>IndexError, KeyError (both LookupError), ZeroDivisionError</li>
          <li>ModuleNotFoundError, FileNotFoundError (an OSError)</li>
          <li>⚠ a file named <code>random.py</code> shadows the stdlib module</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pf-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Interpreted vs Compiled: Bytecode and the VM</span><span class="rm-sub">source → bytecode → CPython VM</span></div></div>
      <div class="rm-item rm-done" data-target="pf-run"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Running Python: Scripts, REPL, -m, Shebang</span><span class="rm-sub">__name__, python -m, chmod +x</span></div></div>
      <div class="rm-item rm-done" data-target="pf-syntax"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Syntax Essentials and PEP 8</span><span class="rm-sub">indentation, continuation, naming</span></div></div>
      <div class="rm-item rm-done" data-target="pf-typing"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Dynamic vs Static, Strong vs Weak Typing</span><span class="rm-sub">where Python sits and why</span></div></div>
      <div class="rm-item rm-done" data-target="pf-objects"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Everything Is an Object</span><span class="rm-sub">methods on ints, functions as objects</span></div></div>
      <div class="rm-item rm-done" data-target="pf-memory"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Memory Management: Refcounting and gc</span><span class="rm-sub">getrefcount, cycles, generations</span></div></div>
      <div class="rm-item rm-done" data-target="pf-errors"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Tracebacks and Built-in Exceptions</span><span class="rm-sub">read bottom-up; common error types</span></div></div>
      <div class="rm-item rm-done" data-target="pf-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Beginner Mistakes</span><span class="rm-sub">shadowing, input() text, wrong pip</span></div></div>
      <div class="rm-item rm-done" data-target="pf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Condensed notes for revision</span></div></div>
      <div class="rm-item rm-done" data-target="pf-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Bytecode, GIL, memory, typing</span></div></div>
    </div>
  </div>

  <h2 id="pf-model"><span class="num">01</span>Interpreted vs Compiled: Bytecode and the VM</h2>
  <p>"Interpreted vs compiled" is a property of an implementation, not a language. C is compiled ahead of time to machine code for one CPU. CPython, the standard Python, does both halves of a different split: it <strong>compiles</strong> each source file to <strong>bytecode</strong> (compact instructions for an imaginary stack machine), then its <strong>virtual machine</strong> (a big C loop, the interpreter) executes that bytecode one instruction at a time.</p>
  <figure class="viz"><svg viewBox="0 0 680 150" width="680">
<defs><marker id="pf-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="40" width="130" height="50" rx="8" class="fb sb"/><text x="75" y="61" text-anchor="middle" font-size="12" font-weight="700">billing.py</text><text x="75" y="78" text-anchor="middle" class="tm" font-size="10">source text</text>
<line x1="140" y1="65" x2="188" y2="65" stroke="currentColor" marker-end="url(#pf-a1)"/><text x="164" y="56" text-anchor="middle" class="tm" font-size="9.5">parse</text>
<rect x="190" y="40" width="130" height="50" rx="8" class="ft st"/><text x="255" y="61" text-anchor="middle" font-size="12" font-weight="700">compiler</text><text x="255" y="78" text-anchor="middle" class="tm" font-size="10">AST → code objects</text>
<line x1="320" y1="65" x2="368" y2="65" stroke="currentColor" marker-end="url(#pf-a1)"/>
<rect x="370" y="40" width="130" height="50" rx="8" class="fg sg"/><text x="435" y="61" text-anchor="middle" font-size="12" font-weight="700">bytecode</text><text x="435" y="78" text-anchor="middle" class="tm" font-size="10">LOAD_FAST, BINARY_OP…</text>
<line x1="500" y1="65" x2="548" y2="65" stroke="currentColor" marker-end="url(#pf-a1)"/>
<rect x="550" y="40" width="120" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="610" y="61" text-anchor="middle" font-size="12" font-weight="700">CPython VM</text><text x="610" y="78" text-anchor="middle" class="tm" font-size="10">executes, runs GC</text>
<line x1="435" y1="90" x2="435" y2="118" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pf-a1)"/>
<text x="435" y="135" text-anchor="middle" class="tm" font-size="10.5">imported modules: cached in __pycache__/billing.cpython-313.pyc</text>
<text x="255" y="25" text-anchor="middle" class="tr" font-size="10.5">SyntaxError raised here, before anything runs</text>
</svg><figcaption>CPython compiles the whole file to bytecode first, then executes it on a stack-based virtual machine.</figcaption></figure>
  <h3>Peeking at bytecode with dis</h3>
  <p>The <code>dis</code> module disassembles a function's bytecode. Each line is one VM instruction; the VM keeps a stack of values and each instruction pushes or pops.</p>
  <div class="fx" data-lang="py">import dis

def line_total(qty, price):
    return qty * price + 5

dis.dis(line_total)
print(line_total.__code__.co_varnames, line_total.__code__.co_consts)</div>
  <div class="fx" data-lang="text">  3           RESUME                   0

  4           LOAD_FAST_LOAD_FAST      1 (qty, price)
              BINARY_OP                5 (*)
              LOAD_CONST               1 (5)
              BINARY_OP                0 (+)
              RETURN_VALUE
('qty', 'price') (None, 5)</div>
  <p>Push <code>qty</code> and <code>price</code>, multiply (pops two, pushes the product), push the constant 5, add, return the top of the stack. The function object carries this as a <strong>code object</strong> (<code>__code__</code>) with its local names and constants. Instruction names change between Python versions; the model does not.</p>
  <h3>.pyc files and __pycache__</h3>
  <p>When a module is <em>imported</em>, CPython writes its bytecode to <code>__pycache__/&lt;name&gt;.cpython-313.pyc</code> and reuses it next time if the source has not changed, which skips the compile step. The script you run directly is compiled every time and not cached. A <code>.pyc</code> only saves start-up time: it does not make code run faster and is not a way to hide source.</p>
  <div class="fx" data-lang="py"># after:  python3 main.py   (main.py does "import billing")
$ ls __pycache__</div>
  <div class="fx" data-lang="text">billing.cpython-313.pyc</div>
  <h3>Implementations</h3>
  <table class="tbl">
    <tr><th>Implementation</th><th>Written in</th><th>Notes</th></tr>
    <tr><td><b>CPython</b></td><td>C</td><td>The reference implementation; what <code>python3</code> usually is. Has the GIL (optional free-threaded build since 3.13). C extensions (numpy, pandas) target it.</td></tr>
    <tr><td><b>PyPy</b></td><td>RPython</td><td>JIT compiler: often several times faster on pure-Python loops; weaker support for C extensions.</td></tr>
    <tr><td>MicroPython</td><td>C</td><td>Small subset for microcontrollers.</td></tr>
    <tr><td>Jython / IronPython</td><td>Java / C#</td><td>Run on the JVM / .NET; lag behind current Python versions.</td></tr>
  </table>
  <p>Why pure Python is slow: every operation goes through the VM loop, every value is a heap object, and every <code>+</code> must look up the operand types at run time. Fast Python code pushes the inner loop into C: built-ins, numpy vectorisation, or compiled extensions. The <strong>GIL</strong> (global interpreter lock) lets only one thread execute bytecode at a time in standard CPython; see <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bytecode</strong> is the platform-independent instruction set CPython compiles source into; a <strong>code object</strong> holds it. The <strong>virtual machine</strong> (interpreter loop) executes bytecode. A <strong>.pyc</strong> file is cached bytecode for an imported module, stored in <code>__pycache__</code> and keyed by Python version.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>"Python is interpreted, so errors only appear when the line runs" is half true. <em>Syntax</em> errors are found when the whole file is compiled, before line 1 executes. Everything else (NameError, TypeError, a misspelt attribute) is only found when that line actually runs, so an untested branch can hide a bug for months.</p></div>

  <h2 id="pf-run"><span class="num">02</span>Running Python: Scripts, REPL, -m and Shebang</h2>
  <p>The same code can be run in several ways, and they differ in what <code>__name__</code> is, what <code>sys.path</code> contains, and whether values are echoed.</p>
  <table class="tbl">
    <tr><th>Way</th><th>Command</th><th>Use for</th></tr>
    <tr><td>Script</td><td><code>python3 till.py</code></td><td>Programs; runs the file top to bottom once. Only <code>print</code> shows output.</td></tr>
    <tr><td>REPL</td><td><code>python3</code></td><td>Trying one idea. Each line runs at the <code>&gt;&gt;&gt;</code> prompt and expression values are echoed (<code>&gt;&gt;&gt; 2 * 30</code> shows <code>60</code>).</td></tr>
    <tr><td>Module</td><td><code>python3 -m package.module</code></td><td>Run a module by its import name: <code>-m venv</code>, <code>-m pip</code>, <code>-m pytest</code>, <code>-m http.server</code>, your own package entry points.</td></tr>
    <tr><td>One-liner</td><td><code>python3 -c "print(2 ** 10)"</code></td><td>Quick checks in a shell.</td></tr>
    <tr><td>Interactive after script</td><td><code>python3 -i till.py</code></td><td>Run the file, then drop into a REPL with its variables (handy after a crash).</td></tr>
    <tr><td>Notebook</td><td>Jupyter</td><td>A REPL in the browser, split into cells; state persists between cells in execution order.</td></tr>
  </table>
  <h3>__name__ and the main guard</h3>
  <p>Every module has a <code>__name__</code>. When a file is run directly (as a script or with <code>-m</code>) it is <code>"__main__"</code>; when it is imported, it is the module's name. The guard <code>if __name__ == "__main__":</code> therefore runs code only when the file is executed, not when another file imports its functions.</p>
  <div class="fx" data-lang="py"># billing.py
GST = 0.05
def with_tax(amount):
    return amount + amount * GST
print("billing.py: __name__ =", __name__)
if __name__ == "__main__":
    print("run as a script:", with_tax(100))

# main.py
import billing
print("main.py: __name__ =", __name__, "| with_tax(200) =", billing.with_tax(200))</div>
  <div class="fx" data-lang="text">$ python3 billing.py
billing.py: __name__ = __main__
run as a script: 105.0

$ python3 main.py
billing.py: __name__ = billing
main.py: __name__ = __main__ | with_tax(200) = 210.0</div>
  <p>Importing <code>billing</code> executed its top-level code (the first print), but the guarded block did not run. That is why top-level code in a module should be limited to definitions and constants: imports execute the whole file.</p>
  <h3>python -m vs python file.py</h3>
  <p><code>python3 -m pkg.tool</code> finds the module through the import system and puts the <em>current directory</em> on <code>sys.path</code>, so absolute imports inside a package work. <code>python3 pkg/tool.py</code> puts the script's own folder on <code>sys.path</code> instead, which is why <code>from pkg import x</code> often fails when a file inside a package is run directly. <code>python3 -m pip install …</code> also guarantees pip installs into the same interpreter you are running.</p>
  <h3>Shebang lines</h3>
  <p>On Linux and macOS a script can be made directly executable. The first line, the <strong>shebang</strong>, tells the OS which interpreter to use; <code>/usr/bin/env</code> finds <code>python3</code> on the <code>PATH</code> (so an active virtual environment is respected).</p>
  <div class="fx" data-lang="py">#!/usr/bin/env python3
print("hello from a script")

# shell:  chmod +x hello.py  then  ./hello.py</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>__name__</code> is a module-level variable set to <code>"__main__"</code> for the module being executed and to the import name otherwise. <code>python -m mod</code> runs a module located via the import system as <code>__main__</code>. The <strong>REPL</strong> (read-eval-print loop) evaluates one statement at a time and echoes the <code>repr</code> of expression results.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>python</code>, <code>python3</code> and <code>pip</code> can point to different installations. "I installed it but import fails" usually means pip installed into another interpreter: use <code>python3 -m pip install …</code> inside the activated virtual environment (see <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>).</p></div>

  <h2 id="pf-syntax"><span class="num">03</span>Syntax Essentials and PEP 8</h2>
  <p>Python uses indentation instead of braces to group statements, so whitespace is part of the grammar. A block starts after a line ending in a colon (<code>if</code>, <code>for</code>, <code>while</code>, <code>def</code>, <code>class</code>, <code>with</code>, <code>try</code>) and contains every following line indented deeper. Errors in this structure are caught at compile time:</p>
  <div class="fx" data-lang="py">bad_sources = {
    "missing colon": "if 195 &gt;= 150\\n    print('discount')",
    "bad indent": "if True:\\nprint('discount')",
    "unexpected indent": "x = 1\\n    y = 2",
    "= instead of ==": "if total = 150:\\n    pass",
}
for label, src in bad_sources.items():
    try:
        compile(src, "&lt;demo&gt;", "exec")
    except SyntaxError as e:
        print(f"{label:18} {type(e).__name__}: {e.msg} (line {e.lineno})")</div>
  <div class="fx" data-lang="text">missing colon      SyntaxError: expected ':' (line 1)
bad indent         IndentationError: expected an indented block after 'if' statement on line 1 (line 2)
unexpected indent  IndentationError: unexpected indent (line 2)
= instead of ==    SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='? (line 1)</div>
  <p><code>IndentationError</code> is a subclass of <code>SyntaxError</code>. Note that assignment inside an <code>if</code> condition is a syntax error in Python (a whole class of C bugs cannot happen); the walrus <code>:=</code> is the explicit way to assign inside an expression.</p>
  <h3>Comments, docstrings and line continuation</h3>
  <ul>
    <li><code>#</code> starts a comment to the end of the line. Explain <em>why</em>, not what.</li>
    <li>A string literal as the first statement of a module, function or class is its <strong>docstring</strong>, stored in <code>__doc__</code> and shown by <code>help()</code>.</li>
    <li>A statement normally ends at the end of the line. Inside <code>()</code>, <code>[]</code> or <code>{}</code> it continues implicitly; a trailing backslash also works but is fragile (a space after it breaks it).</li>
    <li><code>;</code> can separate statements on one line; avoid it.</li>
  </ul>
  <div class="fx" data-lang="py">total = (60 +
         45 +
         90)                      # implicit continuation inside brackets
items = [
    "masala chai",
    "samosa",                     # trailing comma is fine
]
also = 60 + \\
       45                         # explicit backslash continuation (avoid)
print(total, len(items), also)</div>
  <div class="fx" data-lang="text">195 2 105</div>
  <h3>PEP 8 naming and layout</h3>
  <table class="tbl">
    <tr><th>Kind</th><th>Convention</th><th>Example</th></tr>
    <tr><td>Variables, functions, methods, modules</td><td><code>snake_case</code></td><td><code>line_total</code>, <code>billing.py</code></td></tr>
    <tr><td>Classes, exceptions</td><td><code>PascalCase</code></td><td><code>OrderLine</code>, <code>PaymentError</code></td></tr>
    <tr><td>Constants</td><td><code>UPPER_CASE</code></td><td><code>GST_RATE = 0.05</code></td></tr>
    <tr><td>Internal / non-public</td><td>leading underscore</td><td><code>_cache</code></td></tr>
    <tr><td>Avoid keyword clash</td><td>trailing underscore</td><td><code>class_</code>, <code>type_</code></td></tr>
    <tr><td>Name-mangled attribute</td><td>double leading underscore</td><td><code>self.__secret</code></td></tr>
    <tr><td>Dunder (special) names</td><td>reserved for Python</td><td><code>__init__</code>, <code>__name__</code></td></tr>
  </table>
  <p>Layout: 4 spaces per level (never tabs mixed with spaces), lines up to 79 characters (many teams use 88 or 100), two blank lines between top-level definitions, imports at the top grouped stdlib / third-party / local. Formatters (black, ruff format) and linters (ruff, flake8) apply this automatically.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Mixing tabs and spaces raises <code>TabError</code> in Python 3, and a line indented one level too far or too little silently moves it into or out of a block: the program runs, but does something else. Configure the editor to insert 4 spaces and let a formatter fix layout.</p></div>

  <h2 id="pf-typing"><span class="num">04</span>Dynamic vs Static, Strong vs Weak Typing</h2>
  <p>Two independent questions are often mixed up. <strong>Static vs dynamic</strong>: are types checked before the program runs (on variables), or at run time (on values)? <strong>Strong vs weak</strong>: does the language refuse operations on mismatched types, or silently convert one operand?</p>
  <table class="tbl">
    <tr><th></th><th>Strong (refuses mismatches)</th><th>Weak (coerces silently)</th></tr>
    <tr><td><b>Static</b> (checked at compile time)</td><td>Java, Rust, Go, Haskell</td><td>C (implicit casts, pointer arithmetic)</td></tr>
    <tr><td><b>Dynamic</b> (checked at run time)</td><td><b>Python</b>, Ruby</td><td>JavaScript, PHP</td></tr>
  </table>
  <div class="fx" data-lang="py">x = 30
print(type(x).__name__)
x = "thirty"                      # same name, now a str: dynamic typing
print(type(x).__name__)
try:
    "30" + 5                      # no silent conversion: strong typing
except TypeError as e:
    print("TypeError:", e)
print(3 + 4.5, True + 1)          # numeric promotion is allowed
def double(n: int) -&gt; int:
    return n * 2
print(double("ab"))               # hints are not enforced</div>
  <div class="fx" data-lang="text">int
str
TypeError: can only concatenate str (not "int") to str
7.5 2
abab</div>
  <ul>
    <li><b>Dynamic</b>: a name has no type; the object it refers to does. Type errors surface only when the offending line runs.</li>
    <li><b>Strong</b>: <code>"30" + 5</code> raises instead of producing <code>"305"</code> (JavaScript) or <code>35</code> (PHP). Within the numeric tower (bool → int → float → complex) promotion is allowed.</li>
    <li><b>Duck typing</b>: code relies on what an object can do, not what it is declared as. Anything with <code>__iter__</code> works in a <code>for</code> loop; anything with <code>read()</code> can be passed where a file is expected.</li>
    <li><b>Gradual typing</b>: type hints plus mypy/pyright add a static check before running, without changing run-time behaviour.</li>
  </ul>
  <p>Types, conversion and the traps of each built-in type are covered in <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>.</p>

  <h2 id="pf-objects"><span class="num">05</span>Everything Is an Object</h2>
  <p>In Python every value, including numbers, functions, classes and modules, is an object on the heap with a type, an identity and a value. Variables are names that refer to objects. This uniformity is what lets you pass a function to <code>sorted(key=...)</code>, store classes in a dict, or call a method on a literal.</p>
  <div class="fx" data-lang="py">print((255).bit_length(), (3.5).is_integer(), "chai".upper())
def greet():
    """Say hello."""
    return "hello"
greet.calls = 0                   # functions are objects: they can hold attributes
print(type(greet).__name__, greet.__name__, greet.__doc__, greet.calls)
print(type(int), type(type), isinstance(int, object), isinstance(greet, object))
import math
print(type(math).__name__, math.__name__)
handlers = [len, str.upper, greet]
print([type(h).__name__ for h in handlers])</div>
  <div class="fx" data-lang="text">8 False CHAI
function greet Say hello. 0
&lt;class 'type'&gt; &lt;class 'type'&gt; True True
module math
['builtin_function_or_method', 'method_descriptor', 'function']</div>
  <ul>
    <li>Ints and floats have methods; <code>(255).bit_length()</code> needs the brackets only so the dot is not read as a decimal point.</li>
    <li>Functions are objects of type <code>function</code> with attributes (<code>__name__</code>, <code>__doc__</code>, <code>__code__</code>, <code>__defaults__</code>) and can be stored in lists.</li>
    <li>Classes are objects too; their type is <code>type</code> (a metaclass), and <code>type</code>'s type is itself. Every class ultimately inherits from <code>object</code>.</li>
    <li>Modules are objects; <code>import math</code> binds the name <code>math</code> to a module object.</li>
  </ul>
  <p>Assignment, aliasing, <code>is</code> vs <code>==</code> and mutability follow from this model; see <a class="xref" data-note="py_values">Values, Types &amp; Variables</a>. Functions as values are developed in <a class="xref" data-note="py_functions">Functions</a>.</p>

  <h2 id="pf-memory"><span class="num">06</span>Memory Management: Reference Counting and gc</h2>
  <p>Python has no <code>malloc</code>/<code>free</code> in user code. CPython frees objects automatically with two mechanisms: <strong>reference counting</strong>, which handles almost everything immediately, and a <strong>cyclic garbage collector</strong>, which handles groups of objects that refer to each other.</p>
  <h3>Reference counting</h3>
  <p>Every object stores a count of references to it: names, container slots, attributes, function arguments. Binding a name or storing the object in a list increments it; rebinding, <code>del</code>, a container dropping it, or a function returning decrements it. When the count reaches zero the object is freed at once.</p>
  <div class="fx" data-lang="py">import sys
order = ["chai", "samosa"]
print(sys.getrefcount(order))     # 1 name + 1 temporary reference for the call
kitchen = order                   # a second name
print(sys.getrefcount(order))
bills = [order]                   # a container holding it
print(sys.getrefcount(order))
del kitchen                       # removes a NAME, not the object
bills.clear()
print(sys.getrefcount(order))</div>
  <div class="fx" data-lang="text">2
3
4
2</div>
  <p><code>sys.getrefcount</code> always reports one more than you expect, because passing the object as its argument creates a temporary reference. <code>del kitchen</code> deletes the name only; the list survives because <code>order</code> still refers to it. Freeing is deterministic: the moment the last reference goes, the object is destroyed.</p>
  <div class="fx" data-lang="py">class Node:
    def __del__(self):
        print("freed immediately")
n = Node()
n = None                          # last reference gone -&gt; refcount 0
print("next line")</div>
  <div class="fx" data-lang="text">freed immediately
next line</div>
  <h3>Reference cycles and the gc module</h3>
  <p>Reference counting cannot free a <strong>cycle</strong>: if <code>a</code> refers to <code>b</code> and <code>b</code> refers to <code>a</code>, both counts stay at 1 after every outside name is gone. The cyclic garbage collector periodically scans container objects, finds groups reachable only from each other, and frees them.</p>
  <figure class="viz"><svg viewBox="0 0 520 130" width="520">
<defs><marker id="pf-a6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="150" y="40" width="90" height="40" rx="8" class="fr sr"/><text x="195" y="65" text-anchor="middle" font-size="12">Node a</text>
<rect x="320" y="40" width="90" height="40" rx="8" class="fr sr"/><text x="365" y="65" text-anchor="middle" font-size="12">Node b</text>
<path d="M240 52 L318 52" stroke="currentColor" fill="none" marker-end="url(#pf-a6)"/><text x="279" y="45" text-anchor="middle" class="tm" font-size="10">partner</text>
<path d="M320 70 L242 70" stroke="currentColor" fill="none" marker-end="url(#pf-a6)"/><text x="279" y="88" text-anchor="middle" class="tm" font-size="10">partner</text>
<rect x="10" y="40" width="80" height="40" rx="8" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="50" y="65" text-anchor="middle" class="tm" font-size="11">names: del</text>
<text x="280" y="120" text-anchor="middle" class="tm" font-size="10.5">each refcount stays 1 → only the cyclic GC can free them</text>
</svg><figcaption>A reference cycle with no outside references: unreachable, but never reaches refcount 0.</figcaption></figure>
  <div class="fx" data-lang="py">import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.partner = None
    def __del__(self):
        print("freed", self.name)

a, b = Node("a"), Node("b")
a.partner, b.partner = b, a       # a reference cycle: a -&gt; b -&gt; a
del a, b                          # names gone, but each object still referenced by the other
print("after del: nothing freed yet")
print("gc.collect() found", gc.collect(), "unreachable objects")
print(gc.get_threshold(), gc.isenabled())</div>
  <div class="fx" data-lang="text">after del: nothing freed yet
freed a
freed b
gc.collect() found 2 unreachable objects
(2000, 10, 10) True</div>
  <p>The collector is <strong>generational</strong>: new container objects start in the youngest generation, which is scanned often; survivors are promoted to older generations, scanned rarely, because most objects die young. <code>gc.get_threshold()</code> shows when collections trigger. It runs automatically; calling <code>gc.collect()</code> by hand is only for tests, debugging, or right after freeing a big cyclic structure. <code>gc.disable()</code> turns off only the cycle collector, never reference counting.</p>
  <ul>
    <li><b>Memory "leaks" in Python</b> are almost always objects still referenced: an ever-growing global list or cache, an unbounded <code>lru_cache</code>, closures or callbacks holding big objects. <code>tracemalloc</code> finds where memory is allocated.</li>
    <li><b><code>weakref</code></b> creates references that do not increase the count, for caches and parent pointers that should not keep objects alive.</li>
    <li>CPython also uses a private allocator (pymalloc) for small objects, so freed memory is often reused by Python rather than returned to the OS.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reference counting</strong>: each object tracks how many references point to it and is deallocated when the count reaches zero. The <strong>cyclic garbage collector</strong> (<code>gc</code> module) detects groups of container objects unreachable from outside and frees them; it is generational (three generations in CPython).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p><code>del x</code> does not free an object; it removes one name. And do not rely on <code>__del__</code> for cleanup of files, sockets or locks: it may run late (cycles) or not at all at interpreter exit. Use <code>with</code> blocks (see <a class="xref" data-note="py_context">Context Managers</a>).</p></div>

  <h2 id="pf-errors"><span class="num">07</span>Tracebacks and Built-in Exceptions</h2>
  <p>When an exception is not caught, Python stops and prints a <strong>traceback</strong>: the chain of calls active at that moment, outermost first, ending with the exception type and message. Reading it quickly is the most used debugging skill. In this script a quantity arrived from a form as the text <code>"3"</code>:</p>
  <div class="fx" data-lang="py">def subtotal(lines):
    total = 0
    for item, qty, price in lines:
        total += qty * price
    return total

order = [("samosa", "3", 15)]     # qty arrived as TEXT from a form
print(subtotal(order))</div>
  <p>Running <code>python3 till.py</code> prints (folder path shortened to the file name):</p>
  <div class="fx" data-lang="text">Traceback (most recent call last):
  File "till.py", line 8, in &lt;module&gt;
    print(subtotal(order))
          ~~~~~~~~^^^^^^^
  File "till.py", line 4, in subtotal
    total += qty * price
TypeError: unsupported operand type(s) for +=: 'int' and 'str'</div>
  <table class="tbl"><caption>Read it bottom-up</caption>
    <tr><th>Order</th><th>Line</th><th>Tells you</th></tr>
    <tr><td>1st</td><td><code>TypeError: unsupported operand type(s) for +=: 'int' and 'str'</code></td><td><b>What</b> went wrong: <code>"3" * 15</code> was string repetition, then <code>0 += "333…"</code> failed</td></tr>
    <tr><td>2nd</td><td><code>File "till.py", line 4, in subtotal</code></td><td><b>Where</b>: the innermost frame, file, line and function</td></tr>
    <tr><td>3rd</td><td><code>File "till.py", line 8, in &lt;module&gt;</code></td><td><b>How we got there</b>: the call chain; <code>&lt;module&gt;</code> is top-level code</td></tr>
  </table>
  <p>The <code>~~~^^^</code> markers (3.11+) point at the exact sub-expression. Fix the cause where the bad value <em>entered</em> (convert with <code>int()</code> at the boundary), not only where it exploded. In long tracebacks from libraries, scan upward for the last frame in <em>your</em> code. With chained exceptions, "During handling of the above exception, another exception occurred" means the second error happened inside an <code>except</code> block.</p>
  <h3>Common built-in exceptions</h3>
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
        eval(src) if not src.startswith("import") else exec(src)
    except Exception as e:
        print(f"{src:26} {type(e).__name__}: {e}")</div>
  <div class="fx" data-lang="text">undefined_name + 1         NameError: name 'undefined_name' is not defined
'30' + 5                   TypeError: can only concatenate str (not "int") to str
int('3.5')                 ValueError: invalid literal for int() with base 10: '3.5'
order.push('vada pav')     AttributeError: 'list' object has no attribute 'push'
order[5]                   IndexError: list index out of range
menu['dosa']               KeyError: 'dosa'
184 / 0                    ZeroDivisionError: division by zero
import chai_corner         ModuleNotFoundError: No module named 'chai_corner'
open('missing.csv')        FileNotFoundError: [Errno 2] No such file or directory: 'missing.csv'</div>
  <table class="tbl">
    <tr><th>Exception</th><th>Meaning</th><th>Typical cause</th></tr>
    <tr><td><code>SyntaxError</code> / <code>IndentationError</code></td><td>code cannot be parsed</td><td>missing colon or bracket, bad indentation; raised before running</td></tr>
    <tr><td><code>NameError</code></td><td>name not found in any scope</td><td>typo, used before assignment, missing import</td></tr>
    <tr><td><code>TypeError</code></td><td>operation on the wrong type, or wrong call signature</td><td>str + int, calling None, wrong number of arguments</td></tr>
    <tr><td><code>ValueError</code></td><td>right type, unacceptable value</td><td><code>int("3.5")</code>, unpacking the wrong number of items</td></tr>
    <tr><td><code>AttributeError</code></td><td>object has no such attribute</td><td>typo, method from another type, a variable that is unexpectedly None</td></tr>
    <tr><td><code>IndexError</code> / <code>KeyError</code></td><td>missing position / missing dict key (both <code>LookupError</code>)</td><td>off-by-one, absent key: use <code>.get()</code></td></tr>
    <tr><td><code>ZeroDivisionError</code></td><td>division or modulo by zero</td><td>empty group in an average</td></tr>
    <tr><td><code>ModuleNotFoundError</code></td><td>import failed (subclass of <code>ImportError</code>)</td><td>package not installed in <em>this</em> interpreter</td></tr>
    <tr><td><code>FileNotFoundError</code></td><td>path does not exist (subclass of <code>OSError</code>)</td><td>relative path resolved against a different working directory</td></tr>
    <tr><td><code>RecursionError</code></td><td>recursion depth limit (~1000) exceeded</td><td>missing base case</td></tr>
    <tr><td><code>UnboundLocalError</code></td><td>local read before assignment (subclass of <code>NameError</code>)</td><td>assigning to a global name inside a function</td></tr>
  </table>
  <p>Catching and raising exceptions, <code>try/except/else/finally</code> and custom exception classes are in <a class="xref" data-note="py_exceptions">Exceptions &amp; Error Handling</a>; debuggers and logging in <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Reading a traceback top-down buries the answer. Read the last line, then the frame just above it, and go further up only when you need to know how execution got there. For a <code>SyntaxError</code>, the real mistake is often on the line <em>before</em> the one reported (an unclosed bracket).</p></div>

  <h2 id="pf-traps"><span class="num">08</span>Common Beginner Mistakes</h2>
  <p>A script named after a standard-library module shadows it, because the script's own folder comes first on <code>sys.path</code>. Here <code>random.py</code> sits next to <code>dice.py</code>:</p>
  <div class="fx" data-lang="py"># random.py
print("loaded MY random.py")

# dice.py
import random
print(random.randint(1, 6))</div>
  <div class="fx" data-lang="text">loaded MY random.py
Traceback (most recent call last):
  File "dice.py", line 2, in &lt;module&gt;
    print(random.randint(1, 6))
          ^^^^^^^^^^^^^^
AttributeError: module 'random' has no attribute 'randint' (consider renaming '.../random.py' since it has the same name as the standard library module named 'random' and prevents importing that standard library module)</div>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td>File named <code>random.py</code>, <code>numpy.py</code>, <code>test.py</code></td><td>AttributeError / circular import on <code>import</code></td><td>Rename the file and delete its <code>__pycache__</code></td></tr>
    <tr><td><code>input()</code> or CSV text used as a number</td><td><code>"2" + "3" == "23"</code>; TypeError</td><td>Convert at the boundary: <code>int(text)</code></td></tr>
    <tr><td>Mixing tabs and spaces; wrong indent level</td><td>TabError, or a line silently in the wrong block</td><td>4 spaces, formatter</td></tr>
    <tr><td><code>pip install x</code> then <code>import x</code> fails</td><td>ModuleNotFoundError</td><td><code>python3 -m pip</code> in the active venv</td></tr>
    <tr><td>Forgetting <code>()</code>: <code>f</code> instead of <code>f()</code></td><td>Prints <code>&lt;function f at 0x…&gt;</code>; <code>if f:</code> always True</td><td>Call it</td></tr>
    <tr><td><code>print</code> instead of <code>return</code></td><td>Caller gets None</td><td><code>return</code>; see <a class="xref" data-note="py_functions">Functions</a></td></tr>
    <tr><td><code>b = a</code> expecting a copy</td><td>Changes through b appear in a</td><td><code>a.copy()</code>; see <a class="xref" data-note="py_values">Values</a></td></tr>
    <tr><td><code>is</code> to compare numbers or strings</td><td>Works for small values, fails for others</td><td><code>==</code></td></tr>
    <tr><td><code>==</code> on floats</td><td><code>0.1 + 0.2 == 0.3</code> is False</td><td><code>math.isclose</code></td></tr>
    <tr><td>Removing from a list while looping over it</td><td>Items skipped</td><td>Build a new list; see <a class="xref" data-note="py_control">Decisions &amp; Loops</a></td></tr>
    <tr><td>Mutable default argument</td><td>Data leaks between calls</td><td><code>def f(x=None)</code>; see <a class="xref" data-note="py_functions">Functions</a></td></tr>
    <tr><td>Top-level code in an imported module</td><td>Runs (or starts training) on import</td><td>Put it under <code>if __name__ == "__main__":</code></td></tr>
  </table>

  <h2 id="pf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Execution model</h3>
  <ul>
    <li>CPython: source → tokenise/parse → AST → <b>bytecode</b> (code objects) → executed by a stack-based <b>VM</b>. "Interpreted" really means "compiled to bytecode, then interpreted".</li>
    <li>Whole file compiled first: <code>SyntaxError</code>/<code>IndentationError</code> before any line runs; all other errors only when the line executes.</li>
    <li>Imported modules cached as <code>__pycache__/name.cpython-3XX.pyc</code>; the main script is not cached. <code>.pyc</code> speeds start-up only.</li>
    <li><code>dis.dis(f)</code> shows bytecode; <code>f.__code__</code> is the code object.</li>
    <li>Implementations: CPython (reference, GIL, C extensions), PyPy (JIT), MicroPython, Jython/IronPython.</li>
  </ul>
  <h3>Running code</h3>
  <table class="tbl">
    <tr><th>Command</th><th>Effect</th></tr>
    <tr><td><code>python3 file.py</code></td><td>run script; <code>sys.path[0]</code> = script folder; <code>__name__ == "__main__"</code></td></tr>
    <tr><td><code>python3 -m pkg.mod</code></td><td>run module by import name; <code>sys.path[0]</code> = current dir</td></tr>
    <tr><td><code>python3</code> / <code>-i file.py</code></td><td>REPL / run file then REPL</td></tr>
    <tr><td><code>python3 -c "code"</code></td><td>one-liner</td></tr>
    <tr><td><code>#!/usr/bin/env python3</code> + <code>chmod +x</code></td><td>directly executable script</td></tr>
  </table>
  <h3>Syntax</h3>
  <ul>
    <li>Blocks by indentation after a colon; 4 spaces; tabs+spaces → <code>TabError</code>.</li>
    <li>Implicit continuation inside brackets; avoid backslashes. No assignment in <code>if</code> conditions except <code>:=</code>.</li>
    <li>PEP 8: <code>snake_case</code> functions/variables/modules, <code>PascalCase</code> classes, <code>UPPER_CASE</code> constants, <code>_private</code>, 79–100 char lines.</li>
  </ul>
  <h3>Typing</h3>
  <ul>
    <li><b>Dynamic</b>: types on objects, checked at run time. <b>Strong</b>: no implicit str↔number coercion.</li>
    <li>Duck typing; optional type hints checked by mypy/pyright, not by the interpreter.</li>
  </ul>
  <h3>Objects and memory</h3>
  <ul>
    <li>Everything is an object (ints, functions, classes, modules); names are references.</li>
    <li><b>Reference counting</b>: freed immediately at count 0. <code>sys.getrefcount(x)</code> is +1 for its argument. <code>del name</code> removes a reference, not the object.</li>
    <li><b>Cyclic GC</b>: frees unreachable reference cycles; generational (gen 0 scanned most often); <code>gc.collect()</code>, <code>gc.get_threshold()</code>, <code>gc.disable()</code> (cycles only).</li>
    <li>Leaks = lingering references (globals, caches, closures); tools: <code>tracemalloc</code>, <code>weakref</code>.</li>
  </ul>
  <h3>Errors</h3>
  <ul>
    <li>Traceback: read bottom-up. Last line = type + message; frame above = where; higher frames = call chain.</li>
    <li>NameError (unknown name) · TypeError (wrong type / signature) · ValueError (bad value) · AttributeError · IndexError / KeyError (LookupError) · ZeroDivisionError · ModuleNotFoundError (ImportError) · FileNotFoundError (OSError) · RecursionError · UnboundLocalError (NameError).</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>A file named like a stdlib/third-party module shadows it.</li>
    <li><code>pip</code> and <code>python</code> may be different installations: use <code>python3 -m pip</code>.</li>
    <li>Importing a module runs its top-level code: guard scripts with <code>if __name__ == "__main__":</code>.</li>
    <li>Do not rely on <code>__del__</code> for cleanup; use <code>with</code>.</li>
  </ul>

  <h2 id="pf-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python interpreted or compiled?</summary><div class="qa-body">Both, in CPython: source is compiled to bytecode, and the bytecode is executed by an interpreter loop (the virtual machine). There is no ahead-of-time compilation to machine code. "Interpreted" describes the implementation, not the language: PyPy, for example, JIT-compiles hot bytecode to machine code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is bytecode, and what are <code>.pyc</code> files and <code>__pycache__</code>?</summary><div class="qa-body">Bytecode is CPython's platform-independent instruction set for its stack VM, stored in code objects (<code>f.__code__</code>; view with <code>dis</code>). When a module is imported, its bytecode is cached in <code>__pycache__/name.cpython-313.pyc</code> and reused while the source is unchanged. It only skips recompilation at start-up; it does not speed up execution, and the main script is not cached.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between CPython and PyPy?</summary><div class="qa-body">CPython is the reference implementation in C: it interprets bytecode, uses reference counting, and is what C extensions like numpy target. PyPy is an alternative implementation with a tracing JIT compiler, often much faster on long-running pure-Python loops, with a different (non-refcounting) GC and less complete C-extension support.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is pure Python slower than C, and how do you make it faster?</summary><div class="qa-body">Each operation goes through the bytecode loop, every value is a boxed heap object, and types are checked dynamically on every operation. Speed up by moving the inner loop into C: built-ins and comprehensions, numpy/pandas vectorisation, better algorithms and data structures (set/dict lookups), caching, or tools like Numba, Cython or PyPy. Profile first (<code>cProfile</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL, in one answer?</summary><div class="qa-body">The global interpreter lock is a mutex in CPython that allows only one thread to execute Python bytecode at a time. It simplifies memory management (reference counts need no per-object locks) but prevents threads from using multiple cores for CPU-bound Python code; I/O-bound threads still help because the GIL is released while waiting. Use multiprocessing or C extensions that release the GIL for CPU work. Python 3.13 offers an experimental free-threaded build. See <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>if __name__ == "__main__":</code> do?</summary><div class="qa-body"><code>__name__</code> is <code>"__main__"</code> when the file is executed directly (script or <code>-m</code>) and the module's import name when it is imported. The guard runs code (CLI parsing, training, tests) only on direct execution, so other modules can import the file's functions without side effects. It is also required for <code>multiprocessing</code> on spawn-based platforms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>python script.py</code> and <code>python -m package.module</code>?</summary><div class="qa-body"><code>-m</code> locates the module through the import system and runs it as <code>__main__</code> with the current directory on <code>sys.path</code>, so package-relative and absolute imports work. Running a file path puts the file's own directory on <code>sys.path</code>, which breaks imports of the enclosing package. <code>python -m pip</code> also guarantees you use the pip of that interpreter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Python statically or dynamically typed? Strongly or weakly?</summary><div class="qa-body">Dynamically typed: types belong to objects and are checked at run time, and a name can be rebound to any type. Strongly typed: incompatible operations raise <code>TypeError</code> instead of silently converting (<code>"30" + 5</code>). Type hints add optional static checking via external tools; the interpreter ignores them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is duck typing?</summary><div class="qa-body">Code depends on the methods an object supports, not its declared class: "if it walks like a duck and quacks like a duck". Any object with <code>__iter__</code> can be looped over; any object with <code>read()</code> can be used like a file. <code>typing.Protocol</code> lets static checkers express this structurally.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "everything in Python is an object" imply in practice?</summary><div class="qa-body">Numbers, strings, functions, classes and modules all have a type, an identity and attributes. Variables are references, so assignment never copies. Functions can be passed and returned (callbacks, decorators), classes are created by the metaclass <code>type</code> and can be stored and passed, and even <code>(5).bit_length()</code> is a method call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Python manage memory?</summary><div class="qa-body">CPython uses reference counting: each object counts its references and is freed immediately when the count drops to zero. A generational cyclic garbage collector (<code>gc</code>) additionally finds and frees groups of objects that reference each other but are unreachable. Small objects come from a private allocator (pymalloc). The programmer never frees memory explicitly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a cyclic garbage collector needed if Python has reference counting?</summary><div class="qa-body">Reference counting cannot reclaim cycles: in <code>a.partner = b; b.partner = a</code>, after <code>del a, b</code> each object still has a count of 1 from the other, though nothing can reach them. The cycle detector traverses container objects, identifies such isolated groups and frees them. It is generational because most objects die young, so young objects are scanned more often.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>del x</code> do? Does it free memory?</summary><div class="qa-body">It removes the name <code>x</code> from the current namespace (or an item/attribute with <code>del d[k]</code>, <code>del obj.attr</code>), decrementing the object's reference count. The object is freed only if that was the last reference. <code>x = [1]; y = x; del x</code> leaves the list alive through <code>y</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>sys.getrefcount(obj)</code> return one more than expected?</summary><div class="qa-body">Passing <code>obj</code> as an argument creates a temporary reference held by the call for its duration. A list bound to a single name reports 2. Exact numbers for small ints and interned strings are large and meaningless because the interpreter shares them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a Python program leak memory? How would you investigate?</summary><div class="qa-body">Yes, through references that are never dropped: growing global lists or dicts, unbounded caches (<code>lru_cache(maxsize=None)</code>), closures and callbacks capturing large objects, or C extensions. Investigate with <code>tracemalloc</code> snapshots (compare allocations over time), <code>gc.get_objects()</code>/<code>objgraph</code> to see what is alive and who refers to it, and fix with bounded caches or <code>weakref</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Python traceback?</summary><div class="qa-body">Bottom-up. The last line gives the exception type and message (what happened). The frame just above gives file, line, function and source (where). Frames further up show the call chain (how execution got there); in library-heavy tracebacks, look for the last frame in your own code. Then fix the cause where the bad value originated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>TypeError</code> and <code>ValueError</code>? <code>KeyError</code> and <code>IndexError</code>?</summary><div class="qa-body"><code>TypeError</code>: the operation does not support the type at all (<code>"30" + 5</code>, <code>len(5)</code>). <code>ValueError</code>: the type is right but the value is not acceptable (<code>int("3.5")</code>). <code>KeyError</code>: missing mapping key; <code>IndexError</code>: sequence position out of range; both subclass <code>LookupError</code>, so one <code>except LookupError</code> catches either.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a <code>SyntaxError</code> raised compared with other exceptions?</summary><div class="qa-body">At compile time, when the file (or the string passed to <code>compile</code>/<code>exec</code>/<code>eval</code>) is parsed, before any of it runs, so it cannot be caught by a <code>try</code> in the same file. Other exceptions are raised at run time when the offending line executes. An import of a module with a syntax error raises the SyntaxError at the import, which the importer can catch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is PEP 8, and is indentation in Python a style choice?</summary><div class="qa-body">PEP 8 is the official style guide: 4-space indentation, <code>snake_case</code> functions and variables, <code>PascalCase</code> classes, <code>UPPER_CASE</code> constants, line-length and import-order conventions, usually enforced with black/ruff. Indentation itself is not style: it is syntax that defines blocks, and inconsistent indentation is an <code>IndentationError</code> or <code>TabError</code>.</div></details>
</main>
`
});
