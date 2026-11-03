// notes/python/py_io.js — Input, Output & Command-Line Programs
Object.assign(TOPIC_CONTENT, {
  "py_io": `<main>
<h1>Input, Output &amp; Command-Line Programs</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Input, Output &amp; Command-Line Programs</span></div>
  <p class="lead">A program is only useful if it can talk to the world around it: it has to receive information, show results, report problems and tell whoever started it whether it worked. Python programs do this through a handful of channels: <code>print()</code> and <code>input()</code>, three standard streams, command-line arguments, environment variables and an exit code. These channels are what turn a script that only works when you run it by hand into a tool that can be run by a scheduler at 2 AM, inside a Docker container, in a CI pipeline, or chained with other programs in a shell. Throughout this page we build tools for a small chai stall: first a script that prints and asks questions, then a proper command-line program that summarises a CSV of orders, a filter that sits in a shell pipeline, and finally settings and secrets read from the environment. Every new idea is added to code you have already seen.</p>

  <h2 id="pio-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Input, Output &amp; CLI Programs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">print and input</div>
        <ul>
          <li><code>print</code> calls <code>str()</code>, joins with <code>sep</code>, adds <code>end</code>, returns None</li>
          <li><code>input()</code> always returns a <code>str</code>: convert and validate</li>
          <li><code>EOFError</code> when there is no more input</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streams and buffering</div>
        <ul>
          <li>stdin (0), stdout (1), stderr (2)</li>
          <li>Data → stdout, messages → stderr</li>
          <li>stdout is line-buffered on a terminal, block-buffered in a pipe</li>
          <li><code>flush=True</code>, <code>python -u</code>, <code>PYTHONUNBUFFERED=1</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Arguments</div>
        <ul>
          <li><code>sys.argv</code>: list of strings, <code>[0]</code> is the script</li>
          <li>argparse: positionals, <code>--options</code>, <code>type</code>, <code>default</code>, <code>choices</code>, <code>--help</code></li>
          <li>Bad arguments → usage message, exit code 2</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Exit codes and environment</div>
        <ul>
          <li>0 = success, anything else = failure</li>
          <li><code>sys.exit(n)</code> raises <code>SystemExit</code></li>
          <li><code>os.environ</code> / <code>os.getenv</code>: values are always strings</li>
          <li>Secrets come from the environment, never from code</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pio-print"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">print(): Writing Output</span><span class="rm-sub">how print turns values into text</span></div></div>
      <div class="rm-item rm-done" data-target="pio-input"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">input(): Reading What the User Types</span><span class="rm-sub">text in, convert, check, ask again</span></div></div>
      <div class="rm-item rm-done" data-target="pio-streams"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">stdin, stdout and stderr</span><span class="rm-sub">the three channels every program has</span></div></div>
      <div class="rm-item rm-done" data-target="pio-buffer"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Buffering and flush</span><span class="rm-sub">why output can arrive late or out of order</span></div></div>
      <div class="rm-item rm-done" data-target="pio-argv"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Command-Line Arguments: sys.argv</span><span class="rm-sub">the raw words typed after the script name</span></div></div>
      <div class="rm-item rm-done" data-target="pio-argparse"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">argparse</span><span class="rm-sub">building a real command-line interface</span></div></div>
      <div class="rm-item rm-done" data-target="pio-pipes"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pipes and Filters</span><span class="rm-sub">programs that work inside a shell pipeline</span></div></div>
      <div class="rm-item rm-done" data-target="pio-exit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Exit Codes and sys.exit</span><span class="rm-sub">telling the caller whether it worked</span></div></div>
      <div class="rm-item rm-done" data-target="pio-env"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Environment Variables</span><span class="rm-sub">settings and secrets from outside the code</span></div></div>
      <div class="rm-item rm-done" data-target="pio-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">silent failures, lost logs, leaked secrets</span></div></div>
      <div class="rm-item rm-done" data-target="pio-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, tables and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pio-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on I/O and CLIs</span></div></div>
    </div>
  </div>

  <h2 id="pio-print"><span class="num">01</span>print(): Writing Output</h2>
  <p>The first thing almost every program does is show something to a person. Suppose the chai stall wants a line on screen saying who ordered what. A beginner's first attempt is often to glue the pieces together with <code>+</code>, and it fails as soon as one of the pieces is a number:</p>
  <div class="fx" data-lang="py">qty = 2
try:
    print("Asha ordered " + qty + " masala chai")    # gluing a str and an int
except TypeError as e:
    print("TypeError:", e)
print("Asha ordered", qty, "masala chai")            # print converts and adds spaces</div>
  <div class="fx" data-lang="text">TypeError: can only concatenate str (not "int") to str
Asha ordered 2 masala chai</div>
  <p>The <code>+</code> operator can join two strings, but it refuses to join a string and an integer, because Python will not guess whether you meant text or arithmetic. The second line shows what <code>print</code> does for you instead: you hand it several separate values, separated by commas, and it turns each one into text and puts a space between them. That is the heart of <strong>print</strong>, a built-in function that converts each value it is given into text with <code>str()</code>, joins the pieces together, and writes the result to the screen (more precisely, to a channel called standard output, which section 03 explains).</p>
  <p>Think of <code>print</code> as a typist who receives a pile of items, writes each one down in words, puts a separator between them and finishes the line. You can change both the separator and the ending. The <code>sep</code> parameter says what goes between the values (a space unless you say otherwise), and <code>end</code> says what goes after the last one (a newline, <code>"\\n"</code>, unless you say otherwise). The program below tries each of these, plus two other everyday tricks:</p>
  <div class="fx" data-lang="py">items = ["masala chai", "samosa", "bun maska"]

print("Asha", 2, "masala chai", 40.0)          # each value converted with str()
print("Asha", 2, "masala chai", sep=",")        # sep: what goes between values
print("2026", "10", "19", sep="-")
print("loading", end="")                        # end: what goes after the last value
print("...", end=" ")
print("done")
print(*items, sep=" | ")                        # * unpacks the list into separate values
print(f"{'Asha':6}|{2:&gt;3} cups|{40.0:8.2f}")    # an f-string for exact layout
result = print("x")
print("print returned", result)</div>
  <div class="fx" data-lang="text">Asha 2 masala chai 40.0
Asha,2,masala chai
2026-10-19
loading... done
masala chai | samosa | bun maska
Asha  |  2 cups|   40.00
x
print returned None</div>
  <p>The first line shows the default behaviour: the integer 2 and the float 40.0 were converted to text without any help, and single spaces were placed between the four values. With <code>sep=","</code> the spaces became commas, which is a quick way to produce a CSV line, and <code>sep="-"</code> built a date. The three calls with <code>end</code> all landed on one line, <code>loading... done</code>, because the first two replaced the usual newline with nothing and with a space. <code>print(*items, sep=" | ")</code> uses the star to unpack the list, so <code>print</code> receives three separate strings rather than one list. When you need exact column widths or decimal places, an f-string does the layout and <code>print</code> just writes it: <code>{40.0:8.2f}</code> produced <code>   40.00</code>, eight characters wide with two decimals.</p>
  <p>The last two lines answer a question that trips up beginners: what does <code>print</code> give back? It writes text as a side effect and returns <code>None</code>, so <code>result = print("x")</code> prints <code>x</code> and leaves <code>result</code> holding <code>None</code>. If you want to keep the text, build the string first (with an f-string) and print it afterwards. One more parameter, <code>file</code>, decides <em>where</em> the text goes; it becomes important once we meet the standard streams.</p>

  <h2 id="pio-input"><span class="num">02</span>input(): Reading What the User Types</h2>
  <p>Output is half of a conversation. To take an order, the program also needs to ask a question and read the answer. The built-in <strong>input</strong> function does this: it shows a prompt, waits until the user types a line and presses Enter, and returns that line as a string, without the newline at the end. The word to notice is <em>string</em>. Whatever the user types, even if it looks like a number, arrives as text:</p>
  <div class="fx" data-lang="py">qty = input("How many cups? ")
print(repr(qty), type(qty).__name__)
print("qty * 2 =", qty * 2)                # string repetition, not maths
print("int(qty) * 2 =", int(qty) * 2)</div>
  <div class="fx" data-lang="text">$ printf '3\\n' | python3 cups.py
How many cups? '3' str
qty * 2 = 33
int(qty) * 2 = 6</div>
  <p>Here the answer "3" was piped in by the shell (the <code>printf ... |</code> part) instead of being typed, which is why it is not echoed after the prompt; on a real terminal you would see your own typing. The output tells the story. <code>repr(qty)</code> shows <code>'3'</code> with quotes, and its type is <code>str</code>. So <code>qty * 2</code> is not 6 but <code>33</code>: multiplying a string by 2 repeats it. Only after <code>int(qty)</code> converts the text into an integer does the arithmetic give 6. The same mistake with <code>+</code> is worse in a different way: <code>qty + 1</code> raises a <code>TypeError</code>.</p>
  <p>Converting is easy; the hard part is that people type unexpected things. <code>int()</code> and <code>float()</code> accept spaces around the number but raise a <code>ValueError</code> for anything else, including words such as "two" and even <code>"2.5"</code> for <code>int()</code>. A receptionist taking a booking handles this naturally: if you give a date that does not exist, they do not hang up, they ask again. A program should behave the same way, which means wrapping the conversion in a loop that only ends when the answer is usable:</p>
  <div class="fx" data-lang="py">def ask_int(prompt, lo=1, hi=20):
    while True:                                  # keep asking until the answer is usable
        text = input(prompt).strip()
        try:
            n = int(text)
        except ValueError:
            print(f"  {text!r} is not a whole number, try again")
            continue
        if lo &lt;= n &lt;= hi:
            return n
        print(f"  must be between {lo} and {hi}")

qty = ask_int("Cups (1-20)? ")
price = float(input("Price per cup? "))
name, item = input("Name and item? ").split(maxsplit=1)
print(f"{name}: {qty} x {item} = {qty * price:.2f}")</div>
  <div class="fx" data-lang="text">$ printf 'two\\n0\\n 3 \\n20.5\\nAsha masala chai\\n' | python3 order_form.py
Cups (1-20)?   'two' is not a whole number, try again
Cups (1-20)?   must be between 1 and 20
Cups (1-20)? Price per cup? Name and item? Asha: 3 x masala chai = 61.50</div>
  <p>Follow the piped answers one by one. "two" could not be converted, so the <code>except ValueError</code> branch printed a message and <code>continue</code> went round the loop again. "0" was a valid number but failed the range check, so the user was asked a third time. " 3 " was accepted because <code>strip()</code> removed the spaces and <code>int()</code> parsed the rest. The function only returns once both checks pass, so the rest of the program can trust that <code>qty</code> is a whole number between 1 and 20. The last <code>input</code> shows how to read two values from one line: <code>split(maxsplit=1)</code> splits at the first space only, so "Asha masala chai" becomes the name "Asha" and the item "masala chai". For a line of several numbers the common idiom is <code>list(map(int, input().split()))</code>.</p>
  <p>Sometimes there is nothing to read at all. If the input comes from an empty file, or the user presses Ctrl+D (Ctrl+Z then Enter on Windows) to signal "end of input", <code>input()</code> raises <strong>EOFError</strong>, short for end of file. Pressing Ctrl+C raises <code>KeyboardInterrupt</code> instead. A program that might be run without a keyboard should expect the first one:</p>
  <div class="fx" data-lang="py">try:
    text = input("qty? ")
except EOFError:
    print("\\nno input: stdin is closed")</div>
  <div class="fx" data-lang="text">$ python3 ask.py &lt; /dev/null
qty?
no input: stdin is closed</div>
  <p>Redirecting from <code>/dev/null</code>, an always-empty file, gave <code>input()</code> nothing, and the program handled the <code>EOFError</code> instead of crashing. This points at the real limit of <code>input()</code>: it needs a human. Under cron, in CI or inside a container there is nobody to type, so a program that calls <code>input()</code> either waits forever or fails. Tools meant to run unattended should take their information from command-line arguments, files, standard input or environment variables, all covered below. Two smaller rules: for passwords use <code>getpass.getpass()</code>, which does not show what is typed, and never write <code>eval(input())</code> to "convert" an answer, because <code>eval</code> runs whatever Python code the user types.</p>

  <h2 id="pio-streams"><span class="num">03</span>stdin, stdout and stderr</h2>
  <p>So far "the screen" and "the keyboard" have been treated as obvious places. In reality a program does not talk to the screen directly. When the operating system starts any program, it gives it three ready-made channels called the <strong>standard streams</strong>. A stream is simply a channel that text flows through, one piece after another. <strong>Standard input</strong> (stdin) is where the program reads from; <code>input()</code> reads from it. <strong>Standard output</strong> (stdout) is where the program writes its results; <code>print()</code> writes to it. <strong>Standard error</strong> (stderr) is a second output channel reserved for error messages, warnings and progress notes. The operating system numbers them 0, 1 and 2 (these numbers are called file descriptors), and in Python they are available as <code>sys.stdin</code>, <code>sys.stdout</code> and <code>sys.stderr</code>.</p>
  <p>Why two output channels? Picture the kitchen of a restaurant with two hatches. Plates of food go out through the serving hatch to the customers; problems ("we are out of samosas") are called out through a different hatch to the manager. If both went through the same hatch, a customer might receive a note instead of a plate. Programs work the same way. The <em>data</em> a program produces goes to stdout, so it can be saved to a file or fed to another program, and <em>messages</em> about the work go to stderr, so they still reach a person without getting mixed into the data. You choose the stream with <code>print</code>'s <code>file</code> parameter:</p>
  <div class="fx" data-lang="py">import sys

orders = [("masala chai", 2), ("samosa", 3), ("bun maska", "two")]
for item, qty in orders:
    if isinstance(qty, int):
        print(f"{item},{qty}")                                       # data -&gt; stdout
    else:
        print(f"warning: skipped {item}, qty {qty!r}", file=sys.stderr)  # message -&gt; stderr</div>
  <p>By default both streams are connected to your terminal, so running the script simply shows all three lines. The interesting part is what the shell lets you do with them. A <code>&gt;</code> sends stdout into a file, <code>2&gt;</code> sends stderr (stream number 2) into a file, and <code>|</code> connects one program's stdout to the next program's stdin. Watch where each line ends up:</p>
  <div class="fx" data-lang="text">$ python3 report.py
masala chai,2
samosa,3
warning: skipped bun maska, qty 'two'
$ python3 report.py &gt; totals.csv
warning: skipped bun maska, qty 'two'
$ cat totals.csv
masala chai,2
samosa,3
$ python3 report.py 2&gt; problems.log
masala chai,2
samosa,3
$ cat problems.log
warning: skipped bun maska, qty 'two'
$ python3 report.py 2&gt; /dev/null | sort
masala chai,2
samosa,3</div>
  <p>With <code>&gt; totals.csv</code>, the two data lines went quietly into the file, and only the warning appeared on the terminal, which is exactly what you want: the file contains clean data, and the person running the command still learns that a row was skipped. With <code>2&gt; problems.log</code> it was the other way round: the data stayed on screen and the warning was saved for later. The last command threw the warnings away (<code>/dev/null</code> discards anything written to it) and passed only the data to <code>sort</code>. None of this needed any change to the Python code; the program just kept data and messages on separate streams, and the shell did the routing.</p>
  <table class="tbl">
    <tr><th>shell syntax</th><th>what it does</th></tr>
    <tr><td><code>a | b</code></td><td>a's stdout becomes b's stdin</td></tr>
    <tr><td><code>&lt; file</code></td><td>stdin is read from the file</td></tr>
    <tr><td><code>&gt; file</code> / <code>&gt;&gt; file</code></td><td>stdout goes to the file (replace / append)</td></tr>
    <tr><td><code>2&gt; file</code></td><td>stderr goes to the file</td></tr>
    <tr><td><code>2&gt;&amp;1</code></td><td>stderr goes wherever stdout is going</td></tr>
    <tr><td><code>&gt; /dev/null</code></td><td>discard the output</td></tr>
  </table>
  <p>A program can also ask whether a stream is connected to a terminal (a "tty", an old name from teletype machines) or to a file or pipe, using <code>isatty()</code>:</p>
  <div class="fx" data-lang="text">$ python3 -c "import sys; print(sys.stdin.isatty(), sys.stdout.isatty())"
True True
$ python3 -c "import sys; print(sys.stdin.isatty(), sys.stdout.isatty())" &lt; orders.csv | cat
False False</div>
  <p>Run plainly, both stdin and stdout are the terminal. With input coming from a file and output going into a pipe, both answers are <code>False</code>. Programs use this to decide, for example, whether to print colours or progress bars, which make sense for a person but are noise in a file. It also matters for the next section, because Python itself behaves differently depending on the answer.</p>

  <h2 id="pio-buffer"><span class="num">04</span>Buffering and flush</h2>
  <p>Here is a puzzle. The script below prints three lines in order, the middle one to stderr. Run it normally and the lines come out in order. Send both streams through a pipe (<code>2&gt;&amp;1 | cat</code> merges stderr into stdout and passes everything to <code>cat</code>, which just prints it) and the order changes:</p>
  <div class="fx" data-lang="py">import sys
print("step 1 (stdout)")
print("step 2 (stderr)", file=sys.stderr)
print("step 3 (stdout)")</div>
  <div class="fx" data-lang="text">$ python3 order.py
step 1 (stdout)
step 2 (stderr)
step 3 (stdout)
$ python3 order.py 2&gt;&amp;1 | cat
step 2 (stderr)
step 1 (stdout)
step 3 (stdout)
$ python3 -u order.py 2&gt;&amp;1 | cat
step 1 (stdout)
step 2 (stderr)
step 3 (stdout)
$ PYTHONUNBUFFERED=1 python3 order.py 2&gt;&amp;1 | cat
step 1 (stdout)
step 2 (stderr)
step 3 (stdout)</div>
  <p>In the second run "step 2" came out first, even though the program printed it second. The reason is <strong>buffering</strong>. Writing to a terminal, file or pipe costs a call into the operating system, and making that call for every tiny piece of text is slow. So Python's stdout collects text in a <strong>buffer</strong>, an area of memory that fills up first and is written out in one go. It is like a postman who does not walk to the post box after every letter but collects a bagful first. When stdout is a terminal, Python empties the buffer at every newline, called <strong>line buffering</strong>, because a person is watching. When stdout is a pipe or a file, Python waits until several kilobytes have collected or the program ends, called <strong>block buffering</strong>, because nobody is watching and speed matters more. Stderr, on the other hand, is written out straight away, because error messages should never be delayed. In the piped run, steps 1 and 3 sat in the stdout buffer until the program finished, while step 2 went straight through.</p>
  <p>The third and fourth runs show the two standard ways to turn buffering off for the whole program: the <code>-u</code> flag ("unbuffered") and the environment variable <code>PYTHONUNBUFFERED=1</code>. Both restored the original order. The second is very common in Dockerfiles, because container logs are a pipe, and without it a long-running job can show nothing for minutes and then everything at once, or nothing at all if it is killed before the buffer is written. When only certain messages matter, such as progress updates in a long job, you can push a single print out immediately with <code>flush=True</code>:</p>
  <div class="fx" data-lang="py">import sys
print("step 1 (stdout)", flush=True)          # push it out now
print("step 2 (stderr)", file=sys.stderr)
print("step 3 (stdout)", flush=True)</div>
  <div class="fx" data-lang="text">$ python3 order_flush.py 2&gt;&amp;1 | cat
step 1 (stdout)
step 2 (stderr)
step 3 (stdout)</div>
  <p>Even through the pipe, the order is now correct, because each stdout line was flushed (written out of the buffer) the moment it was printed. A third option is to send progress and diagnostics through the <a class="xref" data-note="py_debugging">logging</a> module, which writes to stderr and is therefore not delayed. Buffering is a speed optimisation and usually invisible; it only becomes a problem when output order or timing matters to a human reading logs.</p>

  <h2 id="pio-argv"><span class="num">05</span>Command-Line Arguments: sys.argv</h2>
  <p>Our scripts so far either have their data written inside the code or ask a person for it. Neither works for a tool: you do not want to edit the code to process a different file, and nobody is there to answer questions when a scheduler runs it. The usual solution is <strong>command-line arguments</strong>, the extra words typed after the script's name, such as <code>python3 sales.py orders.csv --top 3</code>. They are like the instructions written on an order slip: the same kitchen, a different order every time.</p>
  <p>When you press Enter, the shell splits the command line into words at the spaces (quotes keep a phrase with spaces together as one word) and hands them to Python, which stores them in <strong>sys.argv</strong>, a list of strings whose first element is the script name:</p>
  <div class="fx" data-lang="py">import sys
print("sys.argv =", sys.argv)
print("script:", sys.argv[0], "| arguments:", sys.argv[1:])</div>
  <div class="fx" data-lang="text">$ python3 args.py orders.csv --top 3 "masala chai"
sys.argv = ['args.py', 'orders.csv', '--top', '3', 'masala chai']
script: args.py | arguments: ['orders.csv', '--top', '3', 'masala chai']
$ python3 args.py
sys.argv = ['args.py']
script: args.py | arguments: []</div>
  <p>The quoted <code>"masala chai"</code> arrived as one element, and <code>sys.argv[0]</code> is the script itself, so the real arguments are <code>sys.argv[1:]</code>. Two things are worth noticing. Everything is a string, including <code>'3'</code>. And <code>--top</code> is just another word: <code>sys.argv</code> has no idea that it is meant to be an option followed by its value. Any meaning has to be added by your code. For one or two values that is manageable, as long as you check how many arrived and convert them yourself:</p>
  <div class="fx" data-lang="py">import sys

if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} QTY PRICE", file=sys.stderr)
    sys.exit(2)
qty, price = int(sys.argv[1]), float(sys.argv[2])
print(qty * price)</div>
  <div class="fx" data-lang="text">$ python3 total.py 3 20
60.0
$ python3 total.py 3; echo "exit $?"
usage: total.py QTY PRICE
exit 2
$ python3 total.py three 20
Traceback (most recent call last):
  File "total.py", line 6, in &lt;module&gt;
    qty, price = int(sys.argv[1]), float(sys.argv[2])
                 ~~~^^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'three'</div>
  <p>The correct call printed 60.0. The call with a missing price printed a <strong>usage message</strong>, the one-line summary of how to call the program, to stderr and ended with exit code 2, the traditional code for "you called me wrongly" (exit codes are covered in section 08; <code>$?</code> is how the shell shows the last one). But the third call shows the limit of doing this by hand: a word where a number was expected still crashed with a traceback, because we never wrapped the conversion. Add options in any order, default values, type checks and a <code>--help</code> screen, and hand-written argument handling becomes most of the program. That is the job of <code>argparse</code>.</p>

  <h2 id="pio-argparse"><span class="num">06</span>argparse</h2>
  <p><strong>argparse</strong> is a standard-library module for building a command-line interface. Instead of picking apart <code>sys.argv</code> yourself, you <em>describe</em> the arguments the program accepts (their names, types, defaults and help text), and argparse does the parsing, converts the values, produces a help screen and rejects bad input with a clear message. It works like a well-designed paper form: the boxes, labels and "choose one of" options are printed on the form, so mistakes are caught when the form is filled in, not later in the back office.</p>
  <p>The vocabulary is small. A <strong>positional argument</strong> is identified by its position and is required (like the file name in <code>sales.py orders.csv</code>). An <strong>optional argument</strong>, or option, starts with a dash, has a short form (<code>-n</code>) and/or a long form (<code>--top</code>), can appear in any order and usually has a default. A <strong>flag</strong> is an option that takes no value and is simply on or off (<code>--verbose</code>). Here is a complete tool for the chai stall that reads the orders CSV (six orders, header <code>customer,item,qty,price</code>) and shows revenue per item:</p>
  <div class="fx" data-lang="py">"""sales: summarise an orders CSV by item."""
import argparse
import csv
import json
import sys
from collections import Counter


def positive_int(text):
    n = int(text)                      # ValueError -&gt; argparse reports "invalid positive_int value"
    if n &lt;= 0:
        raise argparse.ArgumentTypeError(f"must be &gt; 0, got {n}")
    return n


def build_parser():
    p = argparse.ArgumentParser(prog="sales", description="Summarise an orders CSV by item.")
    p.add_argument("csv", help="path to the orders CSV")
    p.add_argument("-n", "--top", type=positive_int, default=3,
                   help="how many items to show (default: %(default)s)")
    p.add_argument("--item", action="append", default=[],
                   help="only count this item (repeatable)")
    p.add_argument("--format", choices=["text", "json"], default="text")
    p.add_argument("-v", "--verbose", action="store_true", help="print progress to stderr")
    return p


def main(argv=None):
    args = build_parser().parse_args(argv)
    revenue = Counter()
    try:
        with open(args.csv, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if args.item and row["item"] not in args.item:
                    continue
                revenue[row["item"]] += int(row["qty"]) * int(row["price"])
    except FileNotFoundError:
        print(f"sales: no such file: {args.csv}", file=sys.stderr)
        return 1
    if args.verbose:
        print(f"read {sum(revenue.values())} rupees over {len(revenue)} items", file=sys.stderr)
    top = revenue.most_common(args.top)
    if args.format == "json":
        print(json.dumps(dict(top)))
    else:
        for item, amount in top:
            print(f"{item:12} {amount:5}")
    return 0


if __name__ == "__main__":
    sys.exit(main())</div>
  <p>Read <code>build_parser</code> first. <code>ArgumentParser</code> creates the parser, and each <code>add_argument</code> describes one argument: <code>"csv"</code> has no dash, so it is a required positional; <code>-n/--top</code> is converted by the <code>positive_int</code> function and defaults to 3; <code>--item</code> uses <code>action="append"</code>, so it can be given several times and collects a list; <code>--format</code> only accepts the listed <code>choices</code>; and <code>-v/--verbose</code> uses <code>action="store_true"</code>, which makes it a flag that is <code>False</code> unless present. <code>parse_args</code> then returns an object whose attributes are named after the arguments, so the rest of the code reads <code>args.top</code>, <code>args.item</code> and so on. Notice also that the revenue goes to stdout and the progress message to stderr, as in section 03. Here is the tool in use:</p>
  <div class="fx" data-lang="text">$ python3 sales.py --help
usage: sales [-h] [-n TOP] [--item ITEM] [--format {text,json}] [-v] csv

Summarise an orders CSV by item.

positional arguments:
  csv                   path to the orders CSV

options:
  -h, --help            show this help message and exit
  -n, --top TOP         how many items to show (default: 3)
  --item ITEM           only count this item (repeatable)
  --format {text,json}
  -v, --verbose         print progress to stderr
$ python3 sales.py orders.csv
masala chai    100
bun maska       60
samosa          45
$ python3 sales.py orders.csv -n 2 --format json -v
read 230 rupees over 4 items
{"masala chai": 100, "bun maska": 60}
$ python3 sales.py orders.csv --item samosa --item "bun maska"
bun maska       60
samosa          45</div>
  <p>The entire <code>--help</code> screen was generated from the <code>add_argument</code> calls; we wrote no help code at all, and <code>%(default)s</code> filled in the default value. In the normal run, <code>args.top</code> was already the integer 3. With <code>-n 2 --format json -v</code>, the output switched to JSON, only two items appeared, and the progress line went to stderr. The repeated <code>--item</code> options arrived as a list and filtered the counting. Now look at what happens with bad input:</p>
  <div class="fx" data-lang="text">$ python3 sales.py orders.csv --top 0; echo "exit $?"
usage: sales [-h] [-n TOP] [--item ITEM] [--format {text,json}] [-v] csv
sales: error: argument -n/--top: must be &gt; 0, got 0
exit 2
$ python3 sales.py orders.csv --top two; echo "exit $?"
usage: sales [-h] [-n TOP] [--item ITEM] [--format {text,json}] [-v] csv
sales: error: argument -n/--top: invalid positive_int value: 'two'
exit 2
$ python3 sales.py; echo "exit $?"
usage: sales [-h] [-n TOP] [--item ITEM] [--format {text,json}] [-v] csv
sales: error: the following arguments are required: csv
exit 2
$ python3 sales.py orders.csv --format xml; echo "exit $?"
usage: sales [-h] [-n TOP] [--item ITEM] [--format {text,json}] [-v] csv
sales: error: argument --format: invalid choice: 'xml' (choose from 'text', 'json')
exit 2
$ python3 sales.py missing.csv; echo "exit $?"
sales: no such file: missing.csv
exit 1</div>
  <p>Every mistake produced the usage line, a precise error naming the argument, and exit code 2, and none of it needed an <code>if</code> in our code. The trick for custom validation is the <code>type</code> parameter: it can be any function that takes the string and returns the converted value. If that function raises <code>ValueError</code> (as <code>int("two")</code> did) or <code>argparse.ArgumentTypeError</code> (as our "must be &gt; 0" check did), argparse turns it into a proper error message. The last case is different: the arguments were fine but the file did not exist. That is a runtime failure, not a usage mistake, so the program handles it itself, prints a message to stderr and returns 1.</p>
  <p>The way <code>main</code> is written is worth copying. It takes an optional <code>argv</code> list and <em>returns</em> an exit code instead of ending the program, and only the last line, under <code>if __name__ == "__main__":</code>, calls <code>sys.exit(main())</code>. That makes the program easy to test, because a test can call it with a made-up argument list and look at what it returns:</p>
  <div class="fx" data-lang="text">$ python3 -c "import sales; print(sales.build_parser().parse_args(['orders.csv', '-n', '5']))"
Namespace(csv='orders.csv', top=5, item=[], format='text', verbose=False)
$ python3 -c "import sales; print('returned', sales.main(['orders.csv', '-n', '1']))"
masala chai    100
returned 0</div>
  <p>The first line tested the parser alone and shows the <code>Namespace</code> object argparse builds. The second ran the whole program in-process with <code>-n 1</code> and got back 0. A few more <code>add_argument</code> features cover most remaining needs, and the last one in this example is a classic trap:</p>
  <div class="fx" data-lang="py">import argparse

p = argparse.ArgumentParser(prog="demo")
p.add_argument("files", nargs="+")                       # one or more positionals
p.add_argument("--min-qty", type=int, default=1)         # dashes become underscores
p.add_argument("--dry-run", action="store_true")         # flag: False unless given
p.add_argument("-q", "--quiet", action="count", default=0)
p.add_argument("--debug", type=bool, default=False)      # looks right, is wrong
print(p.parse_args(["a.csv", "b.csv", "--min-qty", "2", "-qq"]))
print(p.parse_args(["a.csv", "--dry-run", "--debug", "False"]))
args, unknown = p.parse_known_args(["a.csv", "--lr", "0.1"])
print(args.files, unknown)</div>
  <div class="fx" data-lang="text">Namespace(files=['a.csv', 'b.csv'], min_qty=2, dry_run=False, quiet=2, debug=False)
Namespace(files=['a.csv'], min_qty=1, dry_run=True, quiet=0, debug=True)
['a.csv'] ['--lr', '0.1']</div>
  <p><code>nargs="+"</code> made <code>files</code> accept one or more values. <code>--min-qty</code> became the attribute <code>min_qty</code>, because dashes are not allowed in Python names. <code>action="count"</code> counted the repeated <code>-q</code>, giving 2. <code>parse_known_args</code> returned the options it did not recognise instead of failing, which is useful when passing extra options on to another tool. And the <code>--debug</code> line shows the trap: <code>--debug False</code> produced <code>debug=True</code>. With <code>type=bool</code>, argparse calls <code>bool("False")</code>, and every non-empty string is truthy in Python. Boolean switches should always be <code>action="store_true"</code> (or <code>argparse.BooleanOptionalAction</code> for a <code>--debug/--no-debug</code> pair).</p>
  <table class="tbl">
    <tr><th>add_argument parameter</th><th>what it does</th><th>example</th></tr>
    <tr><td>name(s)</td><td>no dash = positional (required); <code>-x</code>/<code>--long</code> = optional</td><td><code>"csv"</code>, <code>"-n", "--top"</code></td></tr>
    <tr><td><code>type</code></td><td>function that converts the string; errors become usage errors</td><td><code>int</code>, <code>float</code>, <code>pathlib.Path</code>, your own</td></tr>
    <tr><td><code>default</code></td><td>value when the option is not given (otherwise <code>None</code>)</td><td><code>default=3</code></td></tr>
    <tr><td><code>required</code></td><td>forces an option to be given</td><td><code>required=True</code></td></tr>
    <tr><td><code>choices</code></td><td>only these values are accepted</td><td><code>choices=["text", "json"]</code></td></tr>
    <tr><td><code>action</code></td><td><code>store_true</code>, <code>store_false</code>, <code>append</code>, <code>count</code>, <code>version</code></td><td><code>action="store_true"</code></td></tr>
    <tr><td><code>nargs</code></td><td><code>"?"</code> 0 or 1, <code>"*"</code> 0 or more, <code>"+"</code> 1 or more, or a number</td><td><code>nargs="+"</code></td></tr>
    <tr><td><code>help</code>, <code>metavar</code>, <code>dest</code></td><td>help text, placeholder name, attribute name</td><td><code>help="... (default: %(default)s)"</code></td></tr>
  </table>
  <p>Bigger tools such as <code>git</code> have <strong>subcommands</strong> (<code>git commit</code>, <code>git push</code>), each with its own options; argparse supports them with <code>add_subparsers()</code>, and options that cannot be used together go in an <code>add_mutually_exclusive_group()</code>. Popular third-party alternatives are <code>click</code> and <code>typer</code>, which build the interface from decorators or type hints. To install a tool like this as a real command that can be typed from any folder, see entry points in <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>.</p>

  <h2 id="pio-pipes"><span class="num">07</span>Pipes and Filters</h2>
  <p>Section 03 showed that the shell can connect one program's stdout to another's stdin with <code>|</code>. A chain of programs joined this way is a <strong>pipeline</strong>, and it is one of the most powerful ideas in Unix-style systems: instead of one big program that does everything, you combine small tools that each do one job, such as <code>grep</code> to select lines, <code>sort</code> to order them and <code>head</code> to keep the first few. A program designed to sit in the middle of a pipeline is called a <strong>filter</strong>: it reads data from stdin, transforms it, and writes the result to stdout. Think of an assembly line, where each worker takes the item from the previous worker, does one thing to it and passes it on.</p>
  <p>Writing a filter in Python needs one new idea: <code>sys.stdin</code> can be looped over like a file, giving one line at a time. The filter below reads lines like <code>samosa,3</code>, adds up the quantity per item and writes totals to stdout. It follows every rule from the earlier sections: data to stdout, problems to stderr, and an exit code that says whether the input was clean.</p>
  <div class="fx" data-lang="py">"""Read 'item,qty' lines from stdin; write totals to stdout, problems to stderr."""
import sys
from collections import Counter

totals = Counter()
bad = 0
for n, line in enumerate(sys.stdin, start=1):      # lazy: one line at a time
    line = line.strip()
    if not line:
        continue
    try:
        item, qty = line.rsplit(",", 1)
        totals[item] += int(qty)
    except ValueError:
        bad += 1
        print(f"line {n}: cannot parse {line!r}", file=sys.stderr)
for item, qty in totals.most_common():
    print(f"{item},{qty}")
sys.exit(1 if bad else 0)</div>
  <div class="fx" data-lang="text">$ cat items.txt | python3 sumqty.py; echo "exit $?"
line 4: cannot parse 'samosa,two'
masala chai,3
samosa,3
bun maska,2
exit 1
$ python3 sumqty.py &lt; items.txt 2&gt; errors.log | sort; cat errors.log
bun maska,2
masala chai,3
samosa,3
line 4: cannot parse 'samosa,two'
$ python3 sumqty.py &lt; items.txt &gt; totals.csv 2&gt; /dev/null &amp;&amp; echo "ok" || echo "failed with $?"
failed with 1
$ grep -v two items.txt | python3 sumqty.py &amp;&amp; echo "clean run"
masala chai,3
samosa,3
bun maska,2
clean run</div>
  <p>In the first run the input came from <code>cat</code> through a pipe. The bad line produced a message on stderr, the three totals went to stdout, and the exit code was 1 because one line could not be read. In the second run the input came from a file with <code>&lt;</code>, the totals were piped into <code>sort</code>, and the error went into <code>errors.log</code>, so the sorted output contained only data. In the third run the shell's <code>&amp;&amp;</code> ("run the next command only if this one succeeded") and <code>||</code> ("only if it failed") reacted to the exit code and reported the failure. In the last run <code>grep -v two</code> removed the bad line first, our filter got clean input and exited with 0, so "clean run" was printed. Our twenty lines of Python became a building block that cooperates with tools written decades ago.</p>
  <p>The loop <code>for line in sys.stdin</code> reads lazily, one line at a time, so the same script works on a few lines or on gigabytes of input with constant memory; <code>sys.stdin.read()</code> would read everything at once. If you want a filter that accepts file names as arguments and falls back to stdin when there are none, like most Unix tools, the standard <code>fileinput</code> module does exactly that with <code>for line in fileinput.input():</code>.</p>
  <p>Pipelines have one surprise. When the program at the end of the pipe stops reading early, as <code>head -2</code> does after two lines, the pipe is closed, and the next time Python tries to write, it fails:</p>
  <div class="fx" data-lang="py">for i in range(1_000_000):
    print(i)</div>
  <div class="fx" data-lang="text">$ python3 many.py | head -2
0
1
Traceback (most recent call last):
  File "many.py", line 2, in &lt;module&gt;
    print(i)
    ~~~~~^^^
BrokenPipeError: [Errno 32] Broken pipe</div>
  <p><code>head</code> printed its two lines and exited; Python's next <code>print</code> found nobody listening and raised <code>BrokenPipeError</code>. The result is correct, but the traceback is ugly and looks like a bug. The fix recommended in the Python documentation is to catch the error at the top of the program and point stdout at <code>/dev/null</code>, so that Python's final flush at exit does not fail a second time:</p>
  <div class="fx" data-lang="py">import os, sys

def main():
    for i in range(1_000_000):
        print(i)

try:
    main()
    sys.stdout.flush()
except BrokenPipeError:
    # the reader (head) went away: stop quietly
    devnull = os.open(os.devnull, os.O_WRONLY)
    os.dup2(devnull, sys.stdout.fileno())
    sys.exit(1)</div>
  <div class="fx" data-lang="text">$ python3 many2.py | head -2
0
1</div>
  <p>Now the pipeline ends quietly. You only need this in filters whose output is likely to be cut short; most scripts never meet it.</p>

  <h2 id="pio-exit"><span class="num">08</span>Exit Codes and sys.exit</h2>
  <p>Every time a program ends, it hands a small integer back to whoever started it. This is the <strong>exit code</strong> (or exit status): 0 means success, and any other number means some kind of failure. It is the program's final report, like a delivery driver's single word back at the depot: "delivered" or "failed". The shell's <code>&amp;&amp;</code>, <code>||</code> and <code>$?</code>, cron, CI systems, Airflow, Kubernetes and Python's own <code>subprocess</code> module all decide whether a job worked by looking at this number and nothing else. A script that prints an error message but ends with code 0 is, as far as all of them are concerned, a success.</p>
  <p>Python sets the code for you in some cases and lets you choose it with <strong>sys.exit</strong>. The program below runs eight tiny programs in child processes with <code>subprocess.run</code> and prints the exit code and output each one produced:</p>
  <div class="fx" data-lang="py">import subprocess, sys

cases = {
    "falls off the end":        "x = 1",
    "sys.exit()":               "import sys; sys.exit()",
    "sys.exit(0)":              "import sys; sys.exit(0)",
    "sys.exit(3)":              "import sys; sys.exit(3)",
    'sys.exit("bad config")':   "import sys; sys.exit('bad config')",
    "uncaught exception":       "1 / 0",
    "SystemExit caught":        "import sys\\ntry:\\n    sys.exit(4)\\nexcept SystemExit as e:\\n    print('caught, code =', e.code)",
    "os._exit(5)":              "import os; os._exit(5)",
}
for name, code in cases.items():
    r = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True)
    last_err = r.stderr.strip().splitlines()[-1] if r.stderr.strip() else ""
    print(f"{name:24} exit={r.returncode}  stdout={r.stdout.strip()!r:20} stderr={last_err!r}")</div>
  <div class="fx" data-lang="text">falls off the end        exit=0  stdout=''                   stderr=''
sys.exit()               exit=0  stdout=''                   stderr=''
sys.exit(0)              exit=0  stdout=''                   stderr=''
sys.exit(3)              exit=3  stdout=''                   stderr=''
sys.exit("bad config")   exit=1  stdout=''                   stderr='bad config'
uncaught exception       exit=1  stdout=''                   stderr='ZeroDivisionError: division by zero'
SystemExit caught        exit=0  stdout='caught, code = 4'   stderr=''
os._exit(5)              exit=5  stdout=''                   stderr=''</div>
  <p>Reaching the end of the script, <code>sys.exit()</code> and <code>sys.exit(0)</code> all gave 0. An integer argument becomes the code, so <code>sys.exit(3)</code> gave 3. A string argument is printed to stderr and the code is 1, which makes <code>sys.exit("bad config")</code> a neat one-line way to stop with an error message. An uncaught exception prints the traceback and also gives 1. The last two rows reveal how <code>sys.exit</code> works: it does not stop the program on the spot, it <em>raises an exception</em> called <code>SystemExit</code>. Like any exception it can be caught, and in the "SystemExit caught" row the program caught it and finished normally with 0. <code>os._exit(5)</code>, by contrast, ends the process immediately without any cleanup; it exists for special cases such as child processes after a fork.</p>
  <p>Because <code>sys.exit</code> raises an exception, everything that normally runs while an exception travels outwards still runs, including <code>finally</code> blocks and the closing of <code>with</code> blocks. And because <code>SystemExit</code> is deliberately not a subclass of <code>Exception</code>, a general <code>except Exception</code> handler does not swallow it:</p>
  <div class="fx" data-lang="py">import sys

def main():
    try:
        print("working...")
        sys.exit(3)                  # raises SystemExit(3)
    finally:
        print("finally still runs: temp files cleaned up")

try:
    main()
except Exception:
    print("never printed: SystemExit is not an Exception")</div>
  <div class="fx" data-lang="text">$ python3 finally_exit.py; echo "exit $?"
working...
finally still runs: temp files cleaned up
exit 3</div>
  <p>The <code>finally</code> block ran, the <code>except Exception</code> did not catch the exit, and the shell received 3. (The exception hierarchy is explained in <a class="xref" data-note="py_exceptions">Exceptions &amp; Error Handling</a>.)</p>
  <table class="tbl">
    <tr><th>code</th><th>conventional meaning</th></tr>
    <tr><td>0</td><td>success</td></tr>
    <tr><td>1</td><td>general failure (also Python's code for an uncaught exception)</td></tr>
    <tr><td>2</td><td>wrong usage or invalid arguments (argparse uses it)</td></tr>
    <tr><td>126 / 127</td><td>command not executable / command not found (set by the shell)</td></tr>
    <tr><td>128 + N</td><td>killed by signal N: 130 = Ctrl+C, 137 = SIGKILL (often out of memory in Docker), 143 = SIGTERM</td></tr>
  </table>
  <p>The structure the <code>sales.py</code> tool used is the standard one: all logic lives in a <code>main()</code> function that returns 0, 1 or 2, and a single line at the bottom, <code>sys.exit(main())</code>, turns that into the exit code. Exactly one place decides how the program ends, ordinary functions stay testable because they return values instead of ending the process, and library code never calls <code>sys.exit</code> itself; it raises an exception and lets <code>main</code> choose the code.</p>

  <h2 id="pio-env"><span class="num">09</span>Environment Variables</h2>
  <p>Arguments are good for things that change on every run, like which file to process. Some information, though, belongs to the place where the program runs rather than to a particular run: the address of the database, how many worker processes to use, whether debug output is on, and secrets such as API keys and passwords. Putting these in the code is wrong for two reasons. They differ between your laptop, the test server and production, so you would need different code for each. And a secret written in the code ends up in git history, where anyone with access to the repository can read it, forever.</p>
  <p>The standard answer is <strong>environment variables</strong>: named text values that every process receives from the process that started it. Your shell has a set of them (<code>HOME</code>, <code>PATH</code> and so on), and every program it starts gets a copy, just as a new employee receives a copy of the office's notice board on their first day. Docker, Kubernetes and CI systems all let you set environment variables for the programs they run, which is why this is the usual way to configure software per deployment. In Python they are available through <strong>os.environ</strong>, a dictionary-like mapping, and <strong>os.getenv</strong>, which looks a name up with a default:</p>
  <div class="fx" data-lang="py">import os
import subprocess
import sys

print(type(os.environ).__name__, "| HOME =", os.environ["HOME"])
print(os.getenv("CHAI_OUTLET"))                     # missing -&gt; None
print(os.getenv("CHAI_OUTLET", "main"))             # missing -&gt; default
try:
    os.environ["CHAI_API_KEY"]
except KeyError as e:
    print("KeyError:", e)

workers = os.getenv("CHAI_WORKERS", "4")
print(repr(workers), "-&gt;", int(workers) * 2)        # always strings: convert
debug = os.getenv("CHAI_DEBUG", "0").lower() in {"1", "true", "yes"}
print("debug:", debug)

os.environ["CHAI_OUTLET"] = "north"                 # visible to this process and its children
out = subprocess.run([sys.executable, "-c", "import os; print(os.getenv('CHAI_OUTLET'))"],
                     capture_output=True, text=True).stdout.strip()
print("child process sees:", out)</div>
  <div class="fx" data-lang="text">$ python3 env_demo.py
_Environ | HOME = /root
None
main
KeyError: 'CHAI_API_KEY'
'4' -&gt; 8
debug: False
child process sees: north
$ CHAI_WORKERS=8 CHAI_DEBUG=true python3 env_demo.py
_Environ | HOME = /root
None
main
KeyError: 'CHAI_API_KEY'
'8' -&gt; 16
debug: True
child process sees: north
$ echo "after the script, the shell sees CHAI_OUTLET=[$CHAI_OUTLET]"
after the script, the shell sees CHAI_OUTLET=[]</div>
  <p>Start with the first run. <code>os.environ["HOME"]</code> read an existing variable. <code>os.getenv("CHAI_OUTLET")</code> returned <code>None</code> because the variable was not set, and with a second argument it returned the default <code>"main"</code> instead. Indexing <code>os.environ</code> with a missing name raised <code>KeyError</code>, which makes it the right choice for settings that must exist. The worker count came back as the <em>string</em> <code>'4'</code>: environment variables are always text, so numbers need <code>int()</code> and true/false settings need an explicit rule, here "1, true or yes means on".</p>
  <p>The second run shows how to set variables: writing <code>NAME=value</code> before a command sets them for that one command only, and the script picked up 8 workers and debug mode without any change to the code. The last lines show the direction of inheritance. Setting <code>os.environ["CHAI_OUTLET"]</code> inside the script was visible to the child process it started, but after the script ended, the shell still had no such variable. A process can change its own environment and pass it on to its children, but it can never change its parent's.</p>
  <p>In a real application you read all such settings in one place, once, at startup: convert the types, apply defaults for optional values, and stop immediately with a clear message if a required secret is missing, rather than crashing halfway through a job. A small frozen dataclass is a tidy way to hold the result:</p>
  <div class="fx" data-lang="py">"""Read settings from the environment once, at startup; fail fast if a secret is missing."""
import os
import sys
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    api_key: str
    db_url: str
    workers: int
    debug: bool

    def __repr__(self):                              # never print secrets
        return f"Settings(api_key='***', db_url={self.db_url!r}, workers={self.workers}, debug={self.debug})"


def load_settings():
    missing = [k for k in ("CHAI_API_KEY",) if not os.getenv(k)]
    if missing:
        sys.exit(f"config error: missing environment variable(s): {', '.join(missing)}")
    return Settings(
        api_key=os.environ["CHAI_API_KEY"],
        db_url=os.getenv("CHAI_DB_URL", "sqlite:///chai.db"),
        workers=int(os.getenv("CHAI_WORKERS", "4")),
        debug=os.getenv("CHAI_DEBUG", "0").lower() in {"1", "true", "yes"},
    )


if __name__ == "__main__":
    print(load_settings())</div>
  <div class="fx" data-lang="text">$ python3 config.py; echo "exit $?"
config error: missing environment variable(s): CHAI_API_KEY
exit 1
$ CHAI_API_KEY=sk-test-123 CHAI_WORKERS=2 python3 config.py
Settings(api_key='***', db_url='sqlite:///chai.db', workers=2, debug=False)
$ cat .env
CHAI_API_KEY=sk-test-123
CHAI_DEBUG=1
$ set -a; source .env; set +a; python3 config.py
Settings(api_key='***', db_url='sqlite:///chai.db', workers=4, debug=True)</div>
  <p>Without the API key, the program stopped at once with a one-line message and exit code 1 (the <code>sys.exit("...")</code> form from section 08). With the key set, the settings object was built, and its custom <code>__repr__</code> printed <code>'***'</code> instead of the key, so the secret cannot leak into logs by accident. During development it is common to keep these values in a file named <code>.env</code>, which is listed in <code>.gitignore</code> so it is never committed. The shell can load it, as in the last command (<code>set -a</code> exports every variable defined while it is on), or the <code>python-dotenv</code> package can load it from inside Python with <code>load_dotenv()</code>. In production the platform sets the same names: Docker's <code>-e</code> or <code>--env-file</code>, Kubernetes secrets, or your CI system's secret variables. Libraries such as <code>pydantic-settings</code> automate the read-convert-validate step.</p>
  <p>Arguments, environment variables and <code>input()</code> now each have a clear role. Use arguments for choices that change per run and should be visible in the command (which file, how many results). Use environment variables for per-deployment settings and secrets that should not appear in code or in shell history. Use <code>input()</code> only for genuinely interactive tools with a person at the keyboard, and stdin or files for real data.</p>

  <h2 id="pio-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most damaging mistake in command-line programs is reporting a failure in words but not in the exit code. The program catches an error, prints a message, and then simply reaches the end, which means exit code 0. To a scheduler that looks like success, so the failed job is marked green and nobody is alerted:</p>
  <div class="fx" data-lang="py">import sys

def main():
    try:
        open("orders_missing.csv")
    except FileNotFoundError as e:
        print("error:", e, file=sys.stderr)       # reported... then falls off the end

main()</div>
  <div class="fx" data-lang="py">import sys

def main():
    try:
        open("orders_missing.csv")
    except FileNotFoundError as e:
        print("error:", e, file=sys.stderr)
        return 1                                  # tell the caller it failed
    return 0

sys.exit(main())</div>
  <div class="fx" data-lang="text">$ python3 m_exit0.py &amp;&amp; echo "scheduler: job succeeded"
error: [Errno 2] No such file or directory: 'orders_missing.csv'
scheduler: job succeeded
$ python3 m_exit1.py &amp;&amp; echo "scheduler: job succeeded" || echo "scheduler: job FAILED"
error: [Errno 2] No such file or directory: 'orders_missing.csv'
scheduler: job FAILED</div>
  <p>Both versions printed the same error, but only the second told the shell it had failed, because <code>main</code> returned 1 and <code>sys.exit(main())</code> passed it on. Whenever you catch an error that means the job did not do its work, make sure the program ends with a non-zero code.</p>
  <p>The second classic mistake is treating environment variables as if they were already booleans or numbers. Every value is a string, and every non-empty string is truthy, so a setting meant to switch debug mode <em>off</em> switches it on:</p>
  <div class="fx" data-lang="py">import os
if os.getenv("CHAI_DEBUG"):                       # any non-empty string is truthy
    print("debug on")
print(bool("0"), bool("false"))</div>
  <div class="fx" data-lang="text">$ CHAI_DEBUG=0 python3 m_debug.py
debug on
True True</div>
  <p><code>CHAI_DEBUG=0</code> printed "debug on", because <code>"0"</code> is a non-empty string. Parse such values explicitly, as <code>os.getenv("CHAI_DEBUG", "0").lower() in {"1", "true", "yes"}</code> did in section 09. The same truthiness trap is behind <code>type=bool</code> in argparse.</p>
  <p>Several other mistakes have already appeared on this page. Doing arithmetic on the raw result of <code>input()</code> repeats strings (<code>"3" * 2</code> is <code>"33"</code>) or raises <code>TypeError</code>; convert first, inside a <code>try</code>. Calling <code>input()</code> in a program that runs unattended blocks forever or raises <code>EOFError</code>; take arguments, files or environment variables instead. Printing progress messages or warnings to stdout corrupts the data for whatever program reads it next; messages belong on stderr. Relying on stdout in a container without <code>flush=True</code>, <code>-u</code> or <code>PYTHONUNBUFFERED=1</code> makes logs arrive late or never. Calling <code>sys.exit</code> deep inside library functions kills the caller's program and makes the code hard to test; raise an exception and let <code>main</code> decide. And writing a secret into the code, committing a <code>.env</code> file, or printing a settings object that contains a key leaks it; read secrets from the environment and mask them in <code>repr</code>.</p>

  <h2 id="pio-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>print</b>: converts each value with <code>str()</code>, joins with <code>sep</code>, adds <code>end</code>, writes to <code>file</code>; returns <code>None</code>.</li>
    <li><b>input</b>: shows a prompt, reads one line from stdin, returns it as <code>str</code> without the newline; <code>EOFError</code> at end of input.</li>
    <li><b>Standard streams</b>: stdin (0), stdout (1), stderr (2); <code>sys.stdin</code>, <code>sys.stdout</code>, <code>sys.stderr</code>.</li>
    <li><b>Buffering</b>: stdout collects text before writing; line-buffered on a terminal, block-buffered in a pipe or file; stderr is written immediately.</li>
    <li><b>sys.argv</b>: list of strings; <code>[0]</code> is the script, <code>[1:]</code> the arguments.</li>
    <li><b>Filter</b>: a program that reads stdin, transforms, writes stdout.</li>
    <li><b>Exit code</b>: integer returned to the parent; 0 = success.</li>
    <li><b>Environment variable</b>: named string inherited from the parent process.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">print(*values, sep=" ", end="\\n", file=sys.stdout, flush=False)
print("warning", file=sys.stderr)
n = int(input("Cups? "))                      # always convert, inside try/except
nums = list(map(int, input().split()))

p = argparse.ArgumentParser(prog="tool", description="...")
p.add_argument("csv")                         # positional, required
p.add_argument("-n", "--top", type=int, default=3, help="(default: %(default)s)")
p.add_argument("--format", choices=["text", "json"], default="text")
p.add_argument("-v", "--verbose", action="store_true")
args = p.parse_args(argv)                     # --min-qty becomes args.min_qty

for line in sys.stdin: ...                    # lazy filter

os.environ["KEY"]                             # KeyError if missing
os.getenv("KEY", "default")                   # always a str

def main(argv=None) -&gt; int: ...
if __name__ == "__main__":
    sys.exit(main())</div>
  <h3>Shell redirection</h3>
  <table class="tbl">
    <tr><th>syntax</th><th>meaning</th></tr>
    <tr><td><code>a | b</code></td><td>a's stdout → b's stdin</td></tr>
    <tr><td><code>&lt; f</code>, <code>&gt; f</code>, <code>&gt;&gt; f</code></td><td>stdin from f, stdout to f, append to f</td></tr>
    <tr><td><code>2&gt; f</code>, <code>2&gt;&amp;1</code></td><td>stderr to f, stderr to wherever stdout goes</td></tr>
    <tr><td><code>a &amp;&amp; b</code>, <code>a || b</code></td><td>run b only if a succeeded / failed</td></tr>
  </table>
  <h3>Exit codes</h3>
  <table class="tbl">
    <tr><th>how the program ends</th><th>exit code</th></tr>
    <tr><td>end of script, <code>sys.exit()</code>, <code>sys.exit(0)</code></td><td>0</td></tr>
    <tr><td><code>sys.exit(n)</code></td><td>n</td></tr>
    <tr><td><code>sys.exit("message")</code></td><td>1, message on stderr</td></tr>
    <tr><td>uncaught exception</td><td>1, traceback on stderr</td></tr>
    <tr><td>argparse usage error</td><td>2</td></tr>
    <tr><td>Ctrl+C / SIGKILL / SIGTERM</td><td>130 / 137 / 143</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li><code>input()</code> returns a string: <code>"3" * 2 == "33"</code>.</li>
    <li><code>print</code> returns <code>None</code>.</li>
    <li>Piped stdout is block-buffered: late or reordered output; use <code>flush=True</code>, <code>-u</code>, <code>PYTHONUNBUFFERED=1</code>.</li>
    <li>Data to stdout, messages to stderr.</li>
    <li><code>type=bool</code> and <code>if os.getenv(...)</code>: any non-empty string is true.</li>
    <li>Printing an error is not failing: exit non-zero.</li>
    <li><code>sys.exit</code> raises <code>SystemExit</code>: <code>finally</code> runs, <code>except Exception</code> does not catch it, a bare <code>except:</code> does.</li>
    <li>A child process cannot change its parent's environment.</li>
  </ul>

  <h2 id="pio-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What do the <code>sep</code>, <code>end</code>, <code>file</code> and <code>flush</code> parameters of <code>print</code> do?</summary><div class="qa-body"><code>sep</code> is placed between the values (a space by default) and <code>end</code> after the last one (a newline by default). <code>file</code> is where the text is written, <code>sys.stdout</code> by default but any object with a <code>write</code> method works, such as <code>sys.stderr</code> or an open file. <code>flush=True</code> writes the buffer out immediately. For example <code>print(*[1, 2, 3], sep=",")</code> prints <code>1,2,3</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>input()</code> return, and what does <code>x = input(); print(x * 2)</code> print if the user types 3?</summary><div class="qa-body"><code>input()</code> always returns a string, without the trailing newline, so this prints <code>33</code>: multiplying a string by 2 repeats it. <code>x + 1</code> would raise a <code>TypeError</code>. Convert with <code>int(x)</code> and handle the <code>ValueError</code> raised for input that is not a number.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a line of space-separated integers?</summary><div class="qa-body"><code>nums = list(map(int, input().split()))</code>. <code>split()</code> with no argument splits on any run of whitespace and ignores spaces at the ends, so "1 2 3" gives <code>[1, 2, 3]</code>. When reading many lines, iterating over <code>sys.stdin</code> is faster than calling <code>input()</code> repeatedly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are stdin, stdout and stderr, and why keep stdout and stderr separate?</summary><div class="qa-body">They are the three standard streams every process starts with, file descriptors 0, 1 and 2. Stdout carries the program's data, so it can be redirected to a file or piped into another program. Stderr carries errors and diagnostics, which still reach the user when stdout is redirected and never corrupt the data stream. In Python you write to stderr with <code>print(..., file=sys.stderr)</code> or the logging module.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might a Python script's output appear late or out of order in Docker or when piped, and how do you fix it?</summary><div class="qa-body">Stdout is line-buffered only when it is a terminal. When it is a pipe, a file or a container log it is block-buffered, so prints are held until several kilobytes collect or the program exits, while stderr is written immediately. Fixes are <code>print(..., flush=True)</code>, running with <code>python -u</code>, setting <code>PYTHONUNBUFFERED=1</code> (common in Dockerfiles), or logging to stderr.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>sys.argv</code>, and why use argparse instead?</summary><div class="qa-body"><code>sys.argv</code> is the list of words from the command line, as strings, with the script name at index 0. It does no interpretation: no options, no types, no defaults, no help. argparse lets you declare the arguments once and gives you type conversion, defaults, <code>choices</code>, required checks, a generated <code>--help</code> and consistent error messages with exit code 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between positional and optional arguments in argparse?</summary><div class="qa-body">Positional arguments have no leading dash, are identified by their position and are required by default, like <code>add_argument("csv")</code>. Optional arguments start with <code>-</code> or <code>--</code>, can appear in any order and take their <code>default</code> (or <code>None</code>) when absent, like <code>add_argument("-n", "--top", type=int, default=3)</code>. An option can be made mandatory with <code>required=True</code>, though a required value is usually clearer as a positional.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you add a boolean flag in argparse, and what is wrong with <code>type=bool</code>?</summary><div class="qa-body">Use <code>action="store_true"</code>: the attribute is <code>False</code> unless the flag is present. <code>type=bool</code> calls <code>bool()</code> on the string, and every non-empty string is truthy, so <code>--debug False</code> gives <code>True</code>. For a <code>--x/--no-x</code> pair use <code>action=argparse.BooleanOptionalAction</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you validate an argument in argparse, for example a positive integer?</summary><div class="qa-body">Pass a function as <code>type</code>. It receives the string and returns the converted value, raising <code>argparse.ArgumentTypeError</code> or <code>ValueError</code> for bad input. argparse turns that into a message such as <code>error: argument -n/--top: must be &gt; 0, got 0</code> and exits with code 2. For a fixed set of values use <code>choices</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you make a command-line program's <code>main</code> function testable?</summary><div class="qa-body">Give it an <code>argv=None</code> parameter that is passed to <code>parse_args(argv)</code>, make it return an exit code instead of calling <code>sys.exit</code> itself, and call <code>sys.exit(main())</code> only under the main guard. A test can then call <code>main(["orders.csv", "-n", "2"])</code> and check the return value and the captured output (pytest's <code>capsys</code>). Usage errors raise <code>SystemExit(2)</code>, which a test can expect with <code>pytest.raises(SystemExit)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a Python script that works as a Unix filter?</summary><div class="qa-body">Loop over <code>sys.stdin</code> line by line, which is lazy and uses constant memory, write results to stdout, write problems to stderr, and exit with a non-zero code on failure. <code>fileinput.input()</code> also accepts file names as arguments and falls back to stdin. Then it composes with other tools: <code>cat data | python3 f.py | sort &gt; out.txt</code>. Handle <code>BrokenPipeError</code> if the output may be cut short by something like <code>head</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>python3 script.py | head -2</code> sometimes end with <code>BrokenPipeError</code>, and how do you handle it?</summary><div class="qa-body"><code>head</code> exits after two lines and closes the pipe, so Python's next write fails and raises <code>BrokenPipeError</code>. Catch it around <code>main()</code>, redirect stdout to <code>os.devnull</code> with <code>os.dup2</code> so the interpreter's final flush does not fail again, and exit, conventionally with 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an exit code, and what does Python return in different cases?</summary><div class="qa-body">It is the integer a process returns to its parent, with 0 meaning success. Python returns 0 when the script ends normally or calls <code>sys.exit()</code>, n for <code>sys.exit(n)</code>, 1 with the message on stderr for <code>sys.exit("message")</code>, 1 for an uncaught exception, 2 for argparse usage errors, and 128 + N when killed by signal N (130 for Ctrl+C). Shells, CI systems and schedulers decide success from this number alone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>sys.exit()</code> work? Does <code>finally</code> run, and can it be caught?</summary><div class="qa-body"><code>sys.exit</code> raises <code>SystemExit</code>, so <code>finally</code> blocks and <code>with</code> exits run as it travels outwards, and it can be caught with <code>except SystemExit</code> or a bare <code>except:</code> (a common bug that stops a program from exiting). <code>except Exception</code> does not catch it because <code>SystemExit</code> inherits from <code>BaseException</code>. <code>os._exit(n)</code> ends the process immediately, skipping all cleanup.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>os.environ["X"]</code> and <code>os.getenv("X")</code>?</summary><div class="qa-body"><code>os.environ["X"]</code> raises <code>KeyError</code> if X is not set, which suits required settings. <code>os.getenv("X", default)</code> returns the default, or <code>None</code> without one, which suits optional settings. Both return strings. <code>os.environ</code> can also be written to; changes affect the current process and any children it starts afterwards.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print when run as <code>DEBUG=0 python3 app.py</code>? <code>if os.getenv("DEBUG"): print("debug on")</code></summary><div class="qa-body">It prints <code>debug on</code>. <code>os.getenv</code> returns the string <code>"0"</code>, and every non-empty string is truthy, including <code>"0"</code> and <code>"false"</code>. Parse explicitly, for example <code>os.getenv("DEBUG", "0").lower() in {"1", "true", "yes"}</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If a Python script sets <code>os.environ["X"] = "1"</code>, will the shell that started it see X afterwards?</summary><div class="qa-body">No. A process can only change its own environment, which children started afterwards inherit. The parent shell's environment is untouched. To set variables in a shell, a program has to print <code>export</code> lines for the shell to <code>source</code> or <code>eval</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should an application handle configuration and secrets such as API keys?</summary><div class="qa-body">Keep them out of the code and out of git. Read them from environment variables, set by Docker, Kubernetes secrets, the CI system or a secret manager. Load and validate all settings once at startup into one settings object, convert the types, give optional values defaults, and stop with a clear message and a non-zero exit code if a required secret is missing. For local development use a git-ignored <code>.env</code> file with python-dotenv, and never log secrets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>input()</code>, command-line arguments, environment variables or stdin?</summary><div class="qa-body"><code>input()</code> only for interactive tools with a person at the keyboard. Arguments for choices that change on every run, such as which file or how many results; they are visible in the command and shell history. Environment variables for per-deployment configuration and secrets that should not appear in code or on the command line. Stdin or files for the actual data, especially large or streaming data.</div></details>
</main>
`
});
