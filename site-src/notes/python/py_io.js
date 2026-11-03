// notes/python/py_io.js — Input, Output & Command-Line Programs
Object.assign(TOPIC_CONTENT, {
  "py_io": `<main>
<h1>Input, Output &amp; Command-Line Programs</h1>
  <div class="where"><span>Python</span><span>Fundamentals</span><span>Programs Meet the Real World</span><span>Input, Output &amp; Command-Line Programs</span></div>
  <p class="lead">Every program talks to the outside world through a few channels: it prints to standard output, reports problems on standard error, reads standard input, receives command-line arguments, inherits environment variables, and returns an exit code when it ends. Getting these right is what turns a notebook cell into a tool that can run from cron, a CI pipeline, a Docker container or a shell pipeline. Getting them wrong causes real failures: logs that appear out of order or never appear because stdout was buffered, a script that crashes on <code>input() * 2</code>, an argument parser that accepts nonsense, a job that "succeeds" with exit code 0 after failing, or an API key committed to git because it was hard-coded instead of read from the environment. Code was run on Python 3.13.</p>

  <h2 id="pio-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Input, Output &amp; CLI Programs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">print()</div>
        <ul>
          <li><code>print(*objects, sep=" ", end="\\n", file=sys.stdout, flush=False)</code></li>
          <li>Calls <code>str()</code> on each argument; returns None</li>
          <li><code>file=sys.stderr</code> for diagnostics</li>
          <li>stdout is line-buffered on a terminal, block-buffered in a pipe</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">input()</div>
        <ul>
          <li>Always returns <code>str</code>, without the newline</li>
          <li>Convert with <code>int()</code> / <code>float()</code>, inside try/except</li>
          <li>Re-prompt in a loop until valid</li>
          <li><code>EOFError</code> when stdin is closed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Arguments</div>
        <ul>
          <li><code>sys.argv</code>: list of str, <code>[0]</code> = script</li>
          <li>argparse: positional, <code>--optional</code>, <code>type</code>, <code>default</code>, <code>choices</code>, <code>help</code></li>
          <li><code>action="store_true"</code>, <code>nargs</code>, <code>append</code></li>
          <li>Bad args → usage + error on stderr, exit 2</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streams &amp; pipes</div>
        <ul>
          <li>stdin (0), stdout (1), stderr (2)</li>
          <li><code>for line in sys.stdin</code>: lazy filter</li>
          <li>Data → stdout, messages → stderr</li>
          <li><code>|</code>, <code>&lt;</code>, <code>&gt;</code>, <code>2&gt;</code>, <code>2&gt;&amp;1</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Exit codes</div>
        <ul>
          <li>0 = success, non-zero = failure; uncaught exception → 1</li>
          <li><code>sys.exit(n)</code> raises <code>SystemExit</code></li>
          <li><code>sys.exit("msg")</code> → msg on stderr, code 1</li>
          <li>Shell: <code>$?</code>, <code>&amp;&amp;</code>, <code>||</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Environment</div>
        <ul>
          <li><code>os.environ</code> (mapping of str) · <code>os.getenv(k, default)</code></li>
          <li>Values are strings: convert ints and booleans</li>
          <li>Secrets and per-deployment config come from env</li>
          <li>Inherited by child processes</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pio-print"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">print() in Depth</span><span class="rm-sub">sep, end, file, flush, buffering</span></div></div>
      <div class="rm-item rm-done" data-target="pio-input"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">input() and Type Conversion</span><span class="rm-sub">str in, validate, re-prompt</span></div></div>
      <div class="rm-item rm-done" data-target="pio-argv"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">sys.argv</span><span class="rm-sub">Raw command-line arguments</span></div></div>
      <div class="rm-item rm-done" data-target="pio-argparse"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">argparse</span><span class="rm-sub">Positional, optional, types, help</span></div></div>
      <div class="rm-item rm-done" data-target="pio-streams"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">stdin, stdout, stderr and Pipes</span><span class="rm-sub">Filters, redirection, broken pipes</span></div></div>
      <div class="rm-item rm-done" data-target="pio-exit"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Exit Codes and sys.exit</span><span class="rm-sub">SystemExit, codes, shell checks</span></div></div>
      <div class="rm-item rm-done" data-target="pio-env"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Environment Variables</span><span class="rm-sub">os.environ, getenv, secrets</span></div></div>
      <div class="rm-item rm-done" data-target="pio-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">I/O and CLI bugs and fixes</span></div></div>
      <div class="rm-item rm-done" data-target="pio-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Syntax, tables and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pio-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Basic to advanced, with answers</span></div></div>
    </div>
  </div>

  <h2 id="pio-print"><span class="num">01</span>print() in Depth: sep, end, file, flush</h2>
  <p><code>print</code> converts each argument with <code>str()</code>, joins them with <code>sep</code>, adds <code>end</code>, and writes the result to <code>file</code> (standard output by default). Its keyword arguments cover most formatting needs without string concatenation.</p>
  <div class="fx" data-lang="py">import sys

print("Asha", 2, "masala chai", 40.0)          # args converted with str(), joined by " "
print("Asha", 2, "masala chai", sep=",")        # custom separator
print("2026", "10", "19", sep="-")
print("loading", end="")                        # no newline
print("...", end=" ")
print("done")
print()                                         # just "\\n"
items = ["masala chai", "samosa", "bun maska"]
print(*items, sep=" | ")                        # unpack a list into arguments
print("warning: 1 row skipped", file=sys.stderr)
print(repr(print("x")))                         # print returns None</div>
  <div class="fx" data-lang="text">$ python3 print_demo.py 2&gt;/dev/null        # hide stderr
Asha 2 masala chai 40.0
Asha,2,masala chai
2026-10-19
loading... done

masala chai | samosa | bun maska
x
None
$ python3 print_demo.py 1&gt;/dev/null        # hide stdout
warning: 1 row skipped</div>
  <p>Numbers needed no conversion (<code>print</code> calls <code>str()</code>), <code>sep</code> and <code>end</code> replaced the space and newline, <code>*items</code> passed the list as separate arguments, and <code>file=sys.stderr</code> sent the warning to a different stream: redirecting <code>2&gt;/dev/null</code> hid only it. <code>print</code> returns <code>None</code>, a common bug in <code>x = print(...)</code>.</p>
  <h3>Buffering and flush</h3>
  <p>For speed, <code>sys.stdout</code> collects output in a buffer. On a terminal it is <strong>line-buffered</strong> (flushed at each newline); when stdout is a pipe or a file it is <strong>block-buffered</strong> (flushed every few KB or at exit). <code>sys.stderr</code> is always flushed promptly. So the same program can print in a different order when piped:</p>
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
step 3 (stdout)</div>
  <p>Piped, the two stdout lines sat in the buffer until the program exited, so the stderr line came out first. <code>python -u</code> (or <code>PYTHONUNBUFFERED=1</code>, common in Dockerfiles so container logs appear immediately) disables buffering; <code>print(..., flush=True)</code> flushes one call, which is what progress messages in long jobs need.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>print(*objects, sep=" ", end="\\n", file=sys.stdout, flush=False)</code>. <code>file</code> can be any object with a <code>write</code> method (an open file, <code>io.StringIO</code>). <code>sys.stdout.isatty()</code> tells whether output goes to a terminal.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A long-running job in Docker or under a scheduler shows no output for minutes, then everything at once, or nothing if it is killed: stdout was block-buffered. Use <code>flush=True</code>, <code>-u</code>/<code>PYTHONUNBUFFERED=1</code>, or <a class="xref" data-note="py_debugging">logging</a> (which writes to stderr).</p></div>

  <h2 id="pio-input"><span class="num">02</span>input() and Converting What It Returns</h2>
  <p><code>input(prompt)</code> writes the prompt, reads one line from standard input, and returns it as a <code>str</code> without the trailing newline. It never returns a number, so arithmetic on the raw value silently does string operations or raises <code>TypeError</code>.</p>
  <div class="fx" data-lang="py">qty = input("How many cups? ")
print(repr(qty), type(qty).__name__)
print("qty * 2 =", qty * 2)                # string repetition, not maths
print("int(qty) * 2 =", int(qty) * 2)</div>
  <div class="fx" data-lang="text">$ printf '3\\n' | python3 cups.py
How many cups? '3' str
qty * 2 = 33
int(qty) * 2 = 6</div>
  <p><code>"3" * 2</code> is <code>"33"</code>. Convert with <code>int()</code> / <code>float()</code>; both accept surrounding whitespace but raise <code>ValueError</code> on anything else (<code>int("2.5")</code> fails too). User input must be validated, so wrap conversion in a loop that re-prompts:</p>
  <div class="fx" data-lang="py">def ask_int(prompt, lo=1, hi=20):
    while True:
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
  <p>The answers were piped in, so they are not echoed (a terminal echoes what you type). "two" failed conversion, 0 failed the range check, " 3 " was accepted after <code>strip()</code>. <code>split(maxsplit=1)</code> splits one line into two values; for a line of numbers use <code>list(map(int, input().split()))</code>.</p>
  <div class="fx" data-lang="py">try:
    text = input("qty? ")
except EOFError:
    print("\\nno input (stdin closed)")</div>
  <div class="fx" data-lang="text">$ python3 ask.py &lt; /dev/null
qty?
no input (stdin closed)</div>
  <div class="callout def"><span class="label">Definition</span><p><code>input(prompt="")</code> writes <code>prompt</code> to stdout, reads a line from <code>sys.stdin</code>, strips the trailing newline and returns a <code>str</code>; it raises <code>EOFError</code> at end of input (Ctrl+D, Ctrl+Z on Windows, or a closed pipe) and <code>KeyboardInterrupt</code> on Ctrl+C. For passwords use <code>getpass.getpass()</code>, which does not echo.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>input()</code> blocks forever when nobody is typing (cron, CI, a container). Tools that run unattended should take their inputs from arguments, files, stdin pipes or environment variables, not interactive prompts. And never <code>eval(input())</code>: it executes whatever the user types.</p></div>

  <h2 id="pio-argv"><span class="num">03</span>sys.argv</h2>
  <p>Command-line arguments let the caller configure a run without editing code. The shell splits the command line into words (quotes keep spaces together) and Python exposes them as <code>sys.argv</code>, a list of strings whose first element is the script name.</p>
  <div class="fx" data-lang="py">import sys
print("sys.argv =", sys.argv)
print("script:", sys.argv[0], "| arguments:", sys.argv[1:])</div>
  <div class="fx" data-lang="text">$ python3 args.py orders.csv --top 3 "masala chai"
sys.argv = ['args.py', 'orders.csv', '--top', '3', 'masala chai']
script: args.py | arguments: ['orders.csv', '--top', '3', 'masala chai']
$ python3 args.py
sys.argv = ['args.py']
script: args.py | arguments: []</div>
  <p>Everything is a string, including <code>'3'</code>, and <code>--top</code> is just another word: <code>sys.argv</code> knows nothing about options. Hand-parsing works for one or two positional values, but you must check the count and convert types yourself:</p>
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
  <p>A wrong count gets a usage message and exit code 2 (the Unix convention for bad usage), but a bad value still crashes with a traceback. Options, defaults, type checking and <code>--help</code> by hand quickly become a lot of code: that is what argparse is for.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>sys.argv</code> is a list of <code>str</code>: <code>argv[0]</code> is the script path (or <code>"-c"</code>, or the module's full path with <code>-m</code>), <code>argv[1:]</code> the arguments as split by the shell. Python's own options (<code>-u</code>, <code>-O</code>) are not included.</p></div>

  <h2 id="pio-argparse"><span class="num">04</span>argparse: Building a Command-Line Interface</h2>
  <p><code>argparse</code> (standard library) declares the arguments a program accepts, then parses <code>sys.argv</code> into a namespace with converted values, generates <code>--help</code>, and rejects bad input with a clear message and exit code 2. A small but complete tool that summarises an orders CSV by item:</p>
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
  <p>The input file (<code>orders.csv</code>) has a header <code>customer,item,qty,price</code> and six rows: Asha masala chai 2×20, Ben samosa 3×15, Asha ginger chai 1×25, Chen masala chai 1×20, Dia bun maska 2×30, Ben masala chai 2×20.</p>
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
  <p>The help text was generated from the declarations. <code>args.top</code> arrived as an <code>int</code> (via <code>type=</code>), defaults filled in what was not given, <code>-v</code> set a boolean, and <code>--item</code> collected a list. Now bad input:</p>
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
  <p>Every bad argument produced a usage line and a precise error on stderr with exit code 2, without a single <code>if</code> in our code: a <code>type</code> function that raises <code>ValueError</code> or <code>ArgumentTypeError</code> is all the validation needed. Runtime failures (a missing file) are the program's job: message on stderr, exit 1. Because <code>main</code> takes <code>argv</code>, a test can call it directly, and the parser can be tested alone:</p>
  <div class="fx" data-lang="text">$ python3 -c "import sales; print(sales.build_parser().parse_args(['orders.csv', '-n', '5']))"
Namespace(csv='orders.csv', top=5, item=[], format='text', verbose=False)</div>
  <h3>More add_argument options</h3>
  <div class="fx" data-lang="py">import argparse

p = argparse.ArgumentParser(prog="demo")
p.add_argument("files", nargs="+")                       # one or more positionals
p.add_argument("--min-qty", type=int, default=1)         # dashes become underscores
p.add_argument("--dry-run", action="store_true")         # flag: False unless given
p.add_argument("-q", "--quiet", action="count", default=0)
print(p.parse_args(["a.csv", "b.csv", "--min-qty", "2", "-qq"]))
print(p.parse_args(["a.csv", "--dry-run"]))
args, unknown = p.parse_known_args(["a.csv", "--lr", "0.1"])
print(args.files, unknown)</div>
  <div class="fx" data-lang="text">Namespace(files=['a.csv', 'b.csv'], min_qty=2, dry_run=False, quiet=2)
Namespace(files=['a.csv'], min_qty=1, dry_run=True, quiet=0)
['a.csv'] ['--lr', '0.1']</div>
  <table class="tbl"><caption>add_argument parameters</caption>
    <tr><th>parameter</th><th>effect</th><th>example</th></tr>
    <tr><td>name(s)</td><td>no dash = positional (required); <code>-x</code>/<code>--long</code> = optional</td><td><code>"csv"</code>, <code>"-n", "--top"</code></td></tr>
    <tr><td><code>type</code></td><td>callable converting the string; ValueError/ArgumentTypeError → error</td><td><code>int</code>, <code>float</code>, <code>pathlib.Path</code>, custom</td></tr>
    <tr><td><code>default</code></td><td>value when the option is absent (None otherwise)</td><td><code>default=3</code></td></tr>
    <tr><td><code>required</code></td><td>force an optional to be given</td><td><code>required=True</code></td></tr>
    <tr><td><code>choices</code></td><td>restrict to a set of values</td><td><code>choices=["text", "json"]</code></td></tr>
    <tr><td><code>action</code></td><td><code>store_true</code>, <code>store_false</code>, <code>append</code>, <code>count</code>, <code>version</code></td><td><code>action="store_true"</code></td></tr>
    <tr><td><code>nargs</code></td><td><code>"?"</code> 0–1, <code>"*"</code> 0+, <code>"+"</code> 1+, N exactly</td><td><code>nargs="+"</code></td></tr>
    <tr><td><code>help</code>, <code>metavar</code>, <code>dest</code></td><td>help text, placeholder name, attribute name</td><td><code>help="… (default: %(default)s)"</code></td></tr>
  </table>
  <p>Larger tools add <strong>subcommands</strong> (<code>git commit</code>, <code>git push</code>) with <code>p.add_subparsers(dest="command")</code>, and <code>add_mutually_exclusive_group()</code> for options that cannot be combined. Third-party alternatives: <code>click</code> and <code>typer</code> (type hints become options). To install the tool as a real command, see entry points in <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>ArgumentParser(prog, description)</code> → <code>add_argument(...)</code> per argument → <code>parse_args(argv=None)</code> returns an <code>argparse.Namespace</code> (attributes named after the long option, dashes → underscores). On error it prints usage + message to stderr and calls <code>sys.exit(2)</code>; <code>-h</code> prints help and exits 0. <code>parse_known_args</code> returns <code>(namespace, leftover_list)</code> instead of failing on unknown options.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>type=bool</code> does not parse booleans: <code>bool("False")</code> is <code>True</code> because any non-empty string is truthy. Use <code>action="store_true"</code> (or <code>argparse.BooleanOptionalAction</code> for <code>--x/--no-x</code>).</p></div>

  <h2 id="pio-streams"><span class="num">05</span>stdin, stdout, stderr and Piping</h2>
  <p>Every process starts with three open streams: <strong>standard input</strong> (file descriptor 0), <strong>standard output</strong> (1) and <strong>standard error</strong> (2), exposed as <code>sys.stdin</code>, <code>sys.stdout</code>, <code>sys.stderr</code>. The shell connects them to the terminal, files or other programs. The Unix convention, which makes programs composable: <strong>data goes to stdout, messages and errors go to stderr</strong>, so a pipeline carries only data while diagnostics still reach the user.</p>
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
$ python3 sumqty.py &lt; items.txt 2&gt; errors.log | sort -t, -k2 -n; cat errors.log
bun maska,2
masala chai,3
samosa,3
line 4: cannot parse 'samosa,two'
$ python3 sumqty.py &lt; items.txt 2&gt;/dev/null &gt; totals.csv &amp;&amp; echo "ok" || echo "failed with $?"; cat totals.csv
failed with 1
masala chai,3
samosa,3
bun maska,2
$ grep -v two items.txt | python3 sumqty.py &amp;&amp; echo "clean run"
masala chai,3
samosa,3
bun maska,2
clean run</div>
  <p>The script works as a filter: input from a pipe or <code>&lt; file</code>, totals to stdout (sorted by <code>sort</code>, or saved with <code>&gt; totals.csv</code>), the parse error to stderr (shown on the terminal, or captured with <code>2&gt; errors.log</code>, or discarded with <code>2&gt;/dev/null</code>), and the exit code tells the shell whether the input was clean. <code>for line in sys.stdin</code> reads lazily, so it works on gigabytes of input; <code>sys.stdin.read()</code> reads everything at once.</p>
  <table class="tbl"><caption>Shell redirection</caption>
    <tr><th>syntax</th><th>meaning</th></tr>
    <tr><td><code>a | b</code></td><td>a's stdout → b's stdin</td></tr>
    <tr><td><code>&lt; file</code></td><td>stdin from file</td></tr>
    <tr><td><code>&gt; file</code> / <code>&gt;&gt; file</code></td><td>stdout to file (truncate / append)</td></tr>
    <tr><td><code>2&gt; file</code></td><td>stderr to file</td></tr>
    <tr><td><code>2&gt;&amp;1</code></td><td>stderr to wherever stdout goes</td></tr>
    <tr><td><code>&gt;/dev/null</code></td><td>discard</td></tr>
  </table>
  <h3>Broken pipes</h3>
  <p>When the reader stops early (<code>head</code>), the next write raises <code>BrokenPipeError</code>:</p>
  <div class="fx" data-lang="text">$ python3 many.py | head -2          # many.py prints 0..999999
0
1
Traceback (most recent call last):
  File "many.py", line 2, in &lt;module&gt;
    print(i)
    ~~~~~^^^
BrokenPipeError: [Errno 32] Broken pipe</div>
  <p>The fix recommended in the Python docs: catch it at the top level and point stdout at <code>/dev/null</code> so the final flush at exit does not raise again.</p>
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
  <div class="callout def"><span class="label">Definition</span><p><code>sys.stdin</code>, <code>sys.stdout</code>, <code>sys.stderr</code> are text file objects on descriptors 0, 1, 2 (raw bytes via <code>.buffer</code>). <code>isatty()</code> tells whether a stream is a terminal. <code>fileinput.input()</code> iterates over the files named in <code>sys.argv[1:]</code>, or stdin if none, like Unix tools do. Running other programs and capturing their streams: <code>subprocess.run(cmd, capture_output=True, text=True)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Printing progress or warnings to stdout corrupts the data stream for the next program in the pipe (a CSV with "Processing…" lines in it). Diagnostics go to stderr or the logging module.</p></div>

  <h2 id="pio-exit"><span class="num">06</span>Exit Codes and sys.exit</h2>
  <p>When a process ends it returns an integer <strong>exit code</strong> to whoever started it: 0 means success, anything else failure. Shells (<code>$?</code>, <code>&amp;&amp;</code>, <code>||</code>, <code>set -e</code>), cron, CI systems, Airflow tasks, Kubernetes and <code>subprocess</code> all decide "did it work?" from this number alone, so a script that prints an error but exits 0 is reported as successful. <code>sys.exit(code)</code> ends the program by raising <code>SystemExit</code>. Each case below was run in a child process:</p>
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
    print(f"{name:24} exit={r.returncode}  stdout={r.stdout.strip()!r:22} stderr={last_err!r}")</div>
  <div class="fx" data-lang="text">falls off the end        exit=0  stdout=''                     stderr=''
sys.exit()               exit=0  stdout=''                     stderr=''
sys.exit(0)              exit=0  stdout=''                     stderr=''
sys.exit(3)              exit=3  stdout=''                     stderr=''
sys.exit("bad config")   exit=1  stdout=''                     stderr='bad config'
uncaught exception       exit=1  stdout=''                     stderr='ZeroDivisionError: division by zero'
SystemExit caught        exit=0  stdout='caught, code = 4'     stderr=''
os._exit(5)              exit=5  stdout=''                     stderr=''</div>
  <p>Reaching the end, <code>sys.exit()</code> and <code>sys.exit(0)</code> all give 0. An integer is used as the code. A string is printed to stderr and gives 1, a neat one-line fatal error. An uncaught exception prints the traceback and gives 1. Because <code>sys.exit</code> only <em>raises</em> <code>SystemExit</code>, <code>finally</code> blocks and <code>with</code> exits still run, and it can be caught (the program then continues). <code>os._exit</code> ends the process immediately, skipping cleanup and buffer flushing; it is meant for forked child processes only.</p>
  <table class="tbl"><caption>Exit code conventions</caption>
    <tr><th>code</th><th>meaning</th></tr>
    <tr><td>0</td><td>success</td></tr>
    <tr><td>1</td><td>general failure (Python's uncaught exception)</td></tr>
    <tr><td>2</td><td>bad usage / invalid arguments (argparse)</td></tr>
    <tr><td>126 / 127</td><td>command not executable / not found (shell)</td></tr>
    <tr><td>128 + N</td><td>killed by signal N: 130 = Ctrl+C (SIGINT), 137 = SIGKILL (e.g. out of memory in Docker), 143 = SIGTERM</td></tr>
  </table>
  <p>The pattern for a CLI: put the logic in <code>main()</code> that <em>returns</em> a code, and call <code>sys.exit(main())</code> under the main guard. Functions stay testable (they return values, they do not end the process), and exactly one place decides the exit code.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>sys.exit(arg=None)</code> raises <code>SystemExit(arg)</code>: <code>None</code> → 0, an int → that code (0–255 on POSIX), anything else → printed to stderr, code 1. <code>SystemExit</code> derives from <code>BaseException</code>, so <code>except Exception</code> does not catch it (see <a class="xref" data-note="py_exceptions">Exceptions</a>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Catching every error at the top, printing it, and falling off the end returns 0: the scheduler marks the failed job green. Always return or exit with a non-zero code on failure. And never <code>sys.exit</code> deep inside library functions: raise an exception and let <code>main</code> choose the code.</p></div>

  <h2 id="pio-env"><span class="num">07</span>Environment Variables: os.environ and os.getenv</h2>
  <p>Environment variables are name=value strings that a process inherits from its parent (the shell, Docker, Kubernetes, a CI runner). They are the standard way to pass configuration that differs per deployment (database URL, log level, number of workers) and secrets (API keys, passwords) without putting them in code or in git, following the "twelve-factor app" practice.</p>
  <div class="fx" data-lang="py">import os

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

os.environ["CHAI_OUTLET"] = "north"                 # visible to this process and children
import subprocess, sys
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
child process sees: north</div>
  <p><code>os.environ</code> is a dict-like mapping: indexing a missing name raises <code>KeyError</code>, while <code>os.getenv(name, default)</code> returns the default (or <code>None</code>). Values are always strings, so numbers need <code>int()</code> and booleans need an explicit rule (<code>bool("0")</code> is <code>True</code>). <code>VAR=value command</code> sets a variable for one command only. Setting <code>os.environ[...]</code> affects this process and the children it starts, never the parent shell.</p>
  <h3>Reading config and secrets from the environment</h3>
  <p>Read all settings once at startup into one object, convert and validate them there, and fail fast with a clear message if a required secret is missing, rather than crashing later in the middle of a job:</p>
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
  <p>Without the key the program stopped immediately with exit code 1 and a one-line message. Optional settings have defaults; the custom <code>__repr__</code> keeps the key out of logs. Locally, a <code>.env</code> file (listed in <code>.gitignore</code>) holds development values; the shell's <code>set -a; source .env</code> exports them, or the <code>python-dotenv</code> package loads them in code (<code>load_dotenv()</code>). In production the platform (Docker <code>-e</code>/<code>--env-file</code>, Kubernetes secrets, CI secret variables) sets the same names. Libraries such as <code>pydantic-settings</code> automate the parse-and-validate step.</p>
  <div class="callout def"><span class="label">Definition</span><p><code>os.environ</code>: a mutable mapping of the process environment (<code>str</code> → <code>str</code>). <code>os.getenv(key, default=None)</code>: <code>os.environ.get</code>. <code>os.environ.setdefault(k, v)</code>, <code>os.environ.pop(k)</code> also work. Changes are inherited by child processes started afterwards (<code>subprocess</code> accepts <code>env=</code> to pass a custom mapping).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Hard-coding a secret (<code>API_KEY = "sk-…"</code>) puts it in git history forever; committing <code>.env</code> does the same. Also: printing the settings object or the whole <code>os.environ</code> in logs leaks secrets, and treating env strings as booleans directly (<code>if os.getenv("DEBUG"):</code>) makes <code>DEBUG=0</code> and <code>DEBUG=false</code> true.</p></div>

  <h2 id="pio-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: arithmetic on input()</span><p><code>input()</code> returns <code>str</code>: <code>"3" * 2 == "33"</code>, <code>"3" + 1</code> raises <code>TypeError</code>. Convert with <code>int()</code>/<code>float()</code> inside try/except.</p></div>
  <div class="callout trap"><span class="label">Trap: eval(input())</span><p>Executes arbitrary code typed by the user. Use <code>int()</code>, <code>float()</code>, <code>json.loads</code> or <code>ast.literal_eval</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: interactive prompts in automated jobs</span><p><code>input()</code> blocks forever (or raises <code>EOFError</code>) under cron, CI or Docker. Take arguments, files, stdin or env vars.</p></div>
  <div class="callout trap"><span class="label">Trap: messages on stdout</span><p>Progress and warnings mixed into stdout corrupt piped data. Data → stdout, everything else → stderr / logging.</p></div>
  <div class="callout trap"><span class="label">Trap: buffered output in containers</span><p>Logs appear late or never. Use <code>flush=True</code>, <code>python -u</code> or <code>PYTHONUNBUFFERED=1</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: hand-parsing sys.argv</span><p>No help, no type checks, tracebacks on bad values. Use argparse.</p></div>
  <div class="callout trap"><span class="label">Trap: type=bool in argparse</span><p><code>bool("False")</code> is True. Use <code>action="store_true"</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: exit code 0 on failure</span><p>Catching an error, printing it and ending normally reports success to the shell and scheduler. Return/exit non-zero.</p></div>
  <div class="callout trap"><span class="label">Trap: sys.exit inside library code</span><p>Kills the caller's process and is awkward to test. Raise exceptions; only <code>main</code> exits.</p></div>
  <div class="callout trap"><span class="label">Trap: secrets in code, in git, or in logs</span><p>Read them from env vars (or a secret manager), keep <code>.env</code> out of git, mask them in <code>repr</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: env values used as non-strings</span><p><code>os.getenv("WORKERS")</code> is <code>"4"</code> or <code>None</code>; <code>bool("0")</code> is True. Convert explicitly with defaults.</p></div>

  <h2 id="pio-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>print()</h3>
  <ul>
    <li><code>print(*objects, sep=" ", end="\\n", file=sys.stdout, flush=False)</code>; calls <code>str()</code>; returns <code>None</code>.</li>
    <li><code>print(*lst, sep=", ")</code> unpacks; <code>end=""</code> stays on the line; <code>file=sys.stderr</code> for diagnostics.</li>
    <li>stdout: line-buffered on a terminal, block-buffered in a pipe/file; stderr: unbuffered-ish. Fix ordering/latency with <code>flush=True</code>, <code>-u</code>, <code>PYTHONUNBUFFERED=1</code>.</li>
  </ul>
  <h3>input()</h3>
  <ul>
    <li>Returns <code>str</code> without <code>\\n</code>; <code>EOFError</code> at end of input; <code>getpass.getpass()</code> for secrets.</li>
    <li><code>int(input())</code>, <code>float(...)</code>, <code>list(map(int, input().split()))</code>, <code>a, b = input().split(maxsplit=1)</code>.</li>
    <li>Validate in a <code>while True</code> loop with try/except <code>ValueError</code>.</li>
  </ul>
  <h3>sys.argv and argparse</h3>
  <ul>
    <li><code>sys.argv</code>: list of str; <code>[0]</code> = script; no type conversion, no options parsing.</li>
  </ul>
  <div class="fx" data-lang="py">p = argparse.ArgumentParser(prog="tool", description="…")
p.add_argument("csv")                                   # positional, required
p.add_argument("-n", "--top", type=int, default=3, help="… (default: %(default)s)")
p.add_argument("--format", choices=["text", "json"], default="text")
p.add_argument("-v", "--verbose", action="store_true")
p.add_argument("files", nargs="+")                      # 1 or more
args = p.parse_args(argv)                               # Namespace; --min-qty → args.min_qty</div>
  <ul>
    <li>Bad args → usage + error on stderr, exit 2; <code>-h</code> → help, exit 0.</li>
    <li>Custom validation: a <code>type</code> function raising <code>ValueError</code> / <code>argparse.ArgumentTypeError</code>.</li>
    <li>Subcommands: <code>add_subparsers</code>; exclusive options: <code>add_mutually_exclusive_group</code>; unknown args: <code>parse_known_args</code>.</li>
  </ul>
  <h3>Streams and pipes</h3>
  <table class="tbl">
    <tr><th>stream</th><th>fd</th><th>Python</th><th>use for</th></tr>
    <tr><td>stdin</td><td>0</td><td><code>sys.stdin</code>, <code>input()</code></td><td>data in (pipe, <code>&lt; file</code>)</td></tr>
    <tr><td>stdout</td><td>1</td><td><code>sys.stdout</code>, <code>print()</code></td><td>data out</td></tr>
    <tr><td>stderr</td><td>2</td><td><code>sys.stderr</code>, logging</td><td>errors, warnings, progress</td></tr>
  </table>
  <ul>
    <li><code>for line in sys.stdin:</code> lazy filter; <code>sys.stdin.read()</code> all at once; <code>fileinput.input()</code> = files from argv or stdin.</li>
    <li><code>|</code> pipe, <code>&lt;</code> in, <code>&gt;</code>/<code>&gt;&gt;</code> out, <code>2&gt;</code> err, <code>2&gt;&amp;1</code> merge.</li>
    <li><code>BrokenPipeError</code> when the reader exits (<code>| head</code>): catch at top level, redirect stdout to devnull.</li>
  </ul>
  <h3>Exit codes</h3>
  <table class="tbl">
    <tr><th>how the program ends</th><th>exit code</th></tr>
    <tr><td>end of script, <code>sys.exit()</code>, <code>sys.exit(0)</code></td><td>0</td></tr>
    <tr><td><code>sys.exit(n)</code></td><td>n</td></tr>
    <tr><td><code>sys.exit("message")</code></td><td>1, message on stderr</td></tr>
    <tr><td>uncaught exception</td><td>1, traceback on stderr</td></tr>
    <tr><td>argparse error</td><td>2</td></tr>
    <tr><td>Ctrl+C / SIGKILL / SIGTERM</td><td>130 / 137 / 143</td></tr>
  </table>
  <ul>
    <li><code>sys.exit</code> raises <code>SystemExit</code> (a <code>BaseException</code>): finally/with still run; <code>os._exit</code> skips cleanup.</li>
    <li>Pattern: <code>def main(argv=None) -&gt; int</code> + <code>if __name__ == "__main__": sys.exit(main())</code>.</li>
  </ul>
  <h3>Environment variables</h3>
  <ul>
    <li><code>os.environ["K"]</code> (KeyError if missing) · <code>os.getenv("K", default)</code> · values are always <code>str</code>.</li>
    <li>Booleans: <code>os.getenv("DEBUG", "0").lower() in {"1", "true", "yes"}</code>; ints: <code>int(os.getenv("N", "4"))</code>.</li>
    <li>Inherited by children; changes never reach the parent shell. <code>VAR=x cmd</code> sets for one command.</li>
    <li>Config/secrets: load once at startup, validate, fail fast; <code>.env</code> + python-dotenv locally, never committed.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>input() * 2</code> repeats a string; <code>"3" + 1</code> → TypeError.</li>
    <li><code>print</code> returns None.</li>
    <li>Piped stdout is block-buffered → reordered/late output.</li>
    <li><code>type=bool</code> and <code>bool(os.getenv(...))</code>: any non-empty string is True.</li>
    <li>Printing an error is not failing: exit non-zero.</li>
    <li><code>except Exception</code> does not catch <code>SystemExit</code>; a bare <code>except:</code> does.</li>
  </ul>

  <h2 id="pio-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What do the <code>sep</code>, <code>end</code>, <code>file</code> and <code>flush</code> parameters of <code>print</code> do?</summary><div class="qa-body"><code>sep</code> is placed between arguments (default a space), <code>end</code> after the last one (default <code>"\\n"</code>), <code>file</code> is where the text is written (default <code>sys.stdout</code>; any object with <code>write</code>), and <code>flush=True</code> forces the buffer out immediately. Example: <code>print(*[1, 2, 3], sep=",")</code> prints <code>1,2,3</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>input()</code> return, and what does this print if the user types 3? <code>x = input(); print(x * 2)</code></summary><div class="qa-body">Always a <code>str</code> (without the newline), so it prints <code>33</code>: string repetition. <code>x + 1</code> would raise <code>TypeError: can only concatenate str (not "int") to str</code>. Convert with <code>int(x)</code>, handling <code>ValueError</code> for non-numeric input.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a line of space-separated integers from input?</summary><div class="qa-body"><code>nums = list(map(int, input().split()))</code>. <code>split()</code> with no argument splits on any whitespace and ignores leading/trailing spaces; for "1 2 3" this gives <code>[1, 2, 3]</code>. For many lines in competitive-style or batch input, read <code>sys.stdin</code> directly, which is faster than repeated <code>input()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>sys.argv</code>, and why use argparse instead?</summary><div class="qa-body"><code>sys.argv</code> is the list of command-line words as strings, with the script name at index 0. It does no parsing: no options, no types, no defaults, no help. argparse declares arguments once and gives type conversion, defaults, <code>choices</code>, required checks, generated <code>--help</code>, and consistent error messages with exit code 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between positional and optional arguments in argparse?</summary><div class="qa-body">Positional arguments have no leading dash, are identified by position and are required by default (<code>add_argument("csv")</code>). Optional arguments start with <code>-</code>/<code>--</code>, can appear in any order, are optional by default and take a <code>default</code> (or None) when absent (<code>add_argument("-n", "--top", type=int, default=3)</code>). Optionals can be made mandatory with <code>required=True</code>, though a required input is usually better as a positional.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you add a boolean flag in argparse, and what is wrong with <code>type=bool</code>?</summary><div class="qa-body">Use <code>action="store_true"</code>: the attribute is False unless the flag is present. <code>type=bool</code> calls <code>bool()</code> on the string, and every non-empty string is truthy, so <code>--debug False</code> gives True. For <code>--x/--no-x</code> pairs use <code>action=argparse.BooleanOptionalAction</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you validate an argument, e.g. a positive integer, in argparse?</summary><div class="qa-body">Pass a function as <code>type</code>: it receives the string and returns the converted value, raising <code>argparse.ArgumentTypeError</code> (or <code>ValueError</code>) for bad input. argparse turns that into <code>error: argument -n/--top: must be &gt; 0, got 0</code> and exit code 2. <code>choices=[...]</code> covers fixed sets of values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you make a CLI's <code>main</code> function testable?</summary><div class="qa-body">Give it an <code>argv=None</code> parameter passed to <code>parse_args(argv)</code>, make it <em>return</em> an exit code instead of calling <code>sys.exit</code> internally, and call <code>sys.exit(main())</code> only under the main guard. Tests then call <code>main(["orders.csv", "-n", "2"])</code> and assert on the return value and captured output (pytest's <code>capsys</code>). Parse errors raise <code>SystemExit(2)</code>, testable with <code>pytest.raises(SystemExit)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are stdin, stdout and stderr, and why separate stdout from stderr?</summary><div class="qa-body">The three standard streams every process starts with (file descriptors 0, 1, 2). stdout carries the program's data so it can be piped or redirected (<code>| sort</code>, <code>&gt; out.csv</code>); stderr carries errors and diagnostics, which still reach the terminal or a log when stdout is redirected, and never corrupt the data stream. In Python: <code>print(..., file=sys.stderr)</code> or the logging module (stderr by default).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a Python script that works as a Unix filter?</summary><div class="qa-body">Iterate over <code>sys.stdin</code> line by line (lazy, constant memory), write results to stdout, write problems to stderr, and exit non-zero on failure. <code>fileinput.input()</code> additionally accepts file names in <code>sys.argv</code> and falls back to stdin. Then it composes: <code>cat data | python3 f.py | sort &gt; out.txt</code>. Handle <code>BrokenPipeError</code> if output may be cut off by <code>head</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might output from a Python script appear late or out of order in Docker or when piped, and how do you fix it?</summary><div class="qa-body">stdout is line-buffered only when attached to a terminal; to a pipe, file or container log it is block-buffered, so prints are held until the buffer fills or the process exits, while stderr is written promptly. Fixes: <code>print(..., flush=True)</code>, <code>python -u</code>, <code>PYTHONUNBUFFERED=1</code> (common in Dockerfiles), or <code>sys.stdout.reconfigure(line_buffering=True)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an exit code, and what does Python return in different cases?</summary><div class="qa-body">An integer a process returns to its parent; 0 means success. Python returns 0 when the script ends or calls <code>sys.exit()</code>/<code>sys.exit(0)</code>, n for <code>sys.exit(n)</code>, 1 with the message on stderr for <code>sys.exit("message")</code>, 1 for an uncaught exception, 2 for argparse usage errors, and 128+N when killed by signal N (130 for Ctrl+C). Shells, CI and schedulers decide success only from this number.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>sys.exit()</code> work? Does <code>finally</code> run? Can it be caught?</summary><div class="qa-body"><code>sys.exit</code> raises <code>SystemExit</code>, so <code>finally</code> blocks and context-manager exits run as it propagates, and it can be caught with <code>except SystemExit</code> (or a bare <code>except:</code>, a common bug that stops a program from exiting). <code>except Exception</code> does not catch it because <code>SystemExit</code> derives from <code>BaseException</code>. <code>os._exit(n)</code> terminates immediately without cleanup.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>os.environ["X"]</code> and <code>os.getenv("X")</code>?</summary><div class="qa-body"><code>os.environ["X"]</code> raises <code>KeyError</code> if X is not set, suitable for required settings; <code>os.getenv("X", default)</code> returns the default (None if omitted), suitable for optional ones. Both return strings. <code>os.environ</code> is also writable; assignments affect the current process and children started later.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print when run as <code>DEBUG=0 python3 app.py</code>? <code>import os<br>if os.getenv("DEBUG"):<br>&nbsp;&nbsp;print("debug on")</code></summary><div class="qa-body"><code>debug on</code>. <code>os.getenv</code> returns the string <code>"0"</code>, and any non-empty string is truthy (<code>bool("0")</code> and <code>bool("False")</code> are both True). Parse explicitly: <code>os.getenv("DEBUG", "0").lower() in {"1", "true", "yes"}</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should an application handle configuration and secrets such as API keys?</summary><div class="qa-body">Keep them out of code and git. Read them from environment variables (set by Docker, Kubernetes secrets, CI secret stores or a secret manager), load and validate all settings once at startup into a settings object, convert types, apply defaults for optional values, and fail fast with a clear message and non-zero exit if a required secret is missing. Use a git-ignored <code>.env</code> with python-dotenv for local development, and never log secrets (mask them in <code>repr</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If a Python script sets <code>os.environ["X"] = "1"</code>, will the shell that ran it see X afterwards?</summary><div class="qa-body">No. A process can change only its own environment, which children started afterwards inherit (<code>subprocess</code> children see X). The parent shell's environment is unaffected; to set variables for a shell, output <code>export</code> lines for it to <code>eval</code>/<code>source</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>python3 script.py | head -2</code> sometimes end with <code>BrokenPipeError</code>, and how do you handle it?</summary><div class="qa-body"><code>head</code> exits after two lines, closing the pipe; the next write by Python fails with EPIPE, raised as <code>BrokenPipeError</code>. Catch it around <code>main()</code>, redirect stdout to <code>os.devnull</code> with <code>os.dup2</code> so the interpreter's final flush does not raise again, and exit (conventionally with 1, or 141 to mimic SIGPIPE).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>input()</code> versus command-line arguments versus environment variables?</summary><div class="qa-body"><code>input()</code> only for genuinely interactive tools with a human at the keyboard. Arguments for per-run choices (which file, how many results, output format), visible in the command and in shell history. Environment variables for per-deployment configuration and secrets that should not appear in the command line or code. Large or streaming data comes through stdin or files.</div></details>
</main>
`
});
