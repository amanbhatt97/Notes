// notes/python/py_strings.js — Strings
Object.assign(TOPIC_CONTENT, {
  "py_strings": `<main>
<h1>Strings</h1>
  <div class="where"><span>Python</span><span>Collections</span><span>Strings</span></div>
  <p class="lead">Real data rarely arrives as neat lists and dictionaries. It arrives as text: lines in a log file, rows of a CSV, messages from an API, whatever a user typed into a form. Before you can count, total or analyse anything, that text has to be cut apart, cleaned, checked and turned into numbers and records, and at the end the results usually have to be formatted back into text for people to read. This page teaches Python's <code>str</code> type from that practical angle: what a string is (an unchangeable sequence of characters), the methods that take text apart and put it back together, f-strings for formatting, how characters become bytes when text is saved or sent (the source of every "â‚¹" garbage you have ever seen), and regular expressions for messy input. The running example is the chai stall from <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> and <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>, except that this time its orders arrive as typed lines of text, such as <code>"Asha: 2 masala chai ₹40"</code>, and our job is to turn them into the tuples and totals we used before.</p>

  <h2 id="pst-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Strings</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What a str is</div>
        <ul>
          <li>Immutable sequence of Unicode characters</li>
          <li>Index, slice, <code>in</code> (substring), loop</li>
          <li>Every method returns a NEW string</li>
          <li>Build with a list + <code>"".join</code>, not <code>+</code> in a loop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Methods &amp; formatting</div>
        <ul>
          <li><code>split</code> / <code>join</code>, <code>strip</code>, <code>replace</code></li>
          <li><code>find</code> → −1, <code>index</code> → ValueError</li>
          <li>f-strings: <code>f"{x:.2f}"</code>, <code>{name:&gt;6}</code>, <code>{x=}</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Text and bytes</div>
        <ul>
          <li>Code point = a character's number (₹ = U+20B9)</li>
          <li><code>encode</code>: str → bytes; <code>decode</code>: bytes → str</li>
          <li>UTF-8: 1 to 4 bytes per character</li>
          <li>Wrong codec → mojibake; always pass <code>encoding="utf-8"</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regex</div>
        <ul>
          <li>Describes the shape of text: <code>\\d+</code>, <code>\\s*</code>, <code>(…)</code></li>
          <li><code>search</code> scans, <code>match</code> start only, <code>fullmatch</code> whole</li>
          <li><code>findall</code>, <code>sub</code>, named groups</li>
          <li>Write patterns as raw strings <code>r"…"</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pst-seq"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Strings as Sequences</span><span class="rm-sub">indexing, slicing and looping over text</span></div></div>
      <div class="rm-item rm-done" data-target="pst-immut"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Immutability</span><span class="rm-sub">why every change makes a new string</span></div></div>
      <div class="rm-item rm-done" data-target="pst-methods"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">String Methods</span><span class="rm-sub">split, join, strip, find, replace</span></div></div>
      <div class="rm-item rm-done" data-target="pst-fmt"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">f-strings and Format Specs</span><span class="rm-sub">putting values into text, neatly aligned</span></div></div>
      <div class="rm-item rm-done" data-target="pst-join"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Building Strings: + versus join</span><span class="rm-sub">why adding in a loop is slow</span></div></div>
      <div class="rm-item rm-done" data-target="pst-uni"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Unicode, Bytes and Encodings</span><span class="rm-sub">how characters become bytes</span></div></div>
      <div class="rm-item rm-done" data-target="pst-enc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">When Encodings Go Wrong</span><span class="rm-sub">errors, mojibake, files, look-alike strings</span></div></div>
      <div class="rm-item rm-done" data-target="pst-re"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Regular Expressions</span><span class="rm-sub">describing the shape of messy text</span></div></div>
      <div class="rm-item rm-done" data-target="pst-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Putting It Together</span><span class="rm-sub">from raw lines to a printed bill</span></div></div>
      <div class="rm-item rm-done" data-target="pst-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">discarded results, find in an if, greedy patterns</span></div></div>
      <div class="rm-item rm-done" data-target="pst-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">methods, format specs, encodings, regex</span></div></div>
      <div class="rm-item rm-done" data-target="pst-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on strings</span></div></div>
    </div>
  </div>

  <h2 id="pst-seq"><span class="num">01</span>Strings as Sequences</h2>
  <p>The stall's orders now come in as six typed lines. Each line follows the pattern "name: quantity item ₹amount". To a person each line is obviously an order, but to Python it is just a <strong>string</strong>: a piece of text, written between quotes, of type <code>str</code>. Precisely, a string is a sequence of characters in a fixed order, and that word "sequence" is good news, because it means everything you learned about lists in <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> applies: you can measure its length, index it, slice it and loop over it. Think of a shop's name board made of letter tiles glued onto a strip: you can read any tile, read a stretch of tiles, or look for a word on it.</p>
  <div class="fx" data-lang="py">LINES = [
    "Asha: 2 masala chai ₹40",
    "Ben: 3 samosa ₹45",
    "Asha: 1 ginger chai ₹25",
    "Chen: 1 masala chai ₹20",
    "Dia: 2 bun maska ₹60",
    "Ben: 2 masala chai ₹40",
]
line = LINES[0]
print(line, type(line), len(line))
print(line[0], line[6], line[-3], line[-1])      # one character = a string of length 1
print("chai" in line, "samosa" in line)           # substring test
for ch in line[:4]:                               # a string can be looped over
    print(ch, end=" ")</div>
  <div class="fx" data-lang="text">Asha: 2 masala chai ₹40 &lt;class 'str'&gt; 23
A 2 ₹ 0
True False
A s h a</div>
  <p>The first line has 23 characters. <code>line[0]</code> is "A" and <code>line[6]</code> is "2", the quantity. Negative indexes count from the end, so <code>line[-1]</code> is the final "0" and <code>line[-3]</code> is "₹"; even though the rupee sign is not on an English keyboard, it is one character like any other. Python has no separate "character" type: a single character is simply a string of length 1. On strings, <code>in</code> is more powerful than on lists. It checks for a <em>substring</em>, a run of characters anywhere inside, so <code>"chai" in line</code> is <code>True</code>. And a <code>for</code> loop visits the characters one at a time.</p>
  <p>Slicing works exactly as on lists: <code>s[start:stop:step]</code>, with the stop position not included. Here are the positions of the first line:</p>
  <table class="tbl">
    <tr><th>char</th><td>A</td><td>s</td><td>h</td><td>a</td><td>:</td><td>␣</td><td>2</td><td>␣</td><td>m</td><td>…</td><td>i</td><td>␣</td><td>₹</td><td>4</td><td>0</td></tr>
    <tr><th>index</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>…</td><td>18</td><td>19</td><td>20</td><td>21</td><td>22</td></tr>
  </table>
  <p>From the table, the name is the cut from 0 to 4, "masala chai" runs from position 8 to position 18 (so the slice stops at 19), and the amount is the last two characters. Let us check, and then try the same slices on Ben's line:</p>
  <div class="fx" data-lang="py">line = "Asha: 2 masala chai ₹40"
print(line[:4], "|", line[6], "|", line[8:19], "|", line[-2:])
print(line[::-1])
ben = "Ben: 3 samosa ₹45"
print(ben[:4], "|", ben[8:19])                    # the same positions fail on Ben
colon = ben.find(":")                             # find the colon first
print(colon, ben[:colon])</div>
  <div class="fx" data-lang="text">Asha | 2 | masala chai | 40
04₹ iahc alasam 2 :ahsA
Ben: | amosa ₹45
3 Ben</div>
  <p>For Asha's line the slices give exactly "Asha", "2", "masala chai" and "40", and <code>[::-1]</code> reverses the whole line, the standard way to reverse a string. But the same positions on Ben's line produce nonsense, "Ben:" and "amosa ₹45", because "Ben" is one letter shorter than "Asha" and every position after it has shifted. Slicing by fixed positions only works for fixed-width data, such as the year in a date like "2024-05-01"[:4]. For text whose parts vary in length, you have to find things by their <em>content</em>: here <code>find(":")</code> locates the colon at position 3, and slicing up to it gives the name. Section 03 builds a whole parser this way.</p>

  <h2 id="pst-immut"><span class="num">02</span>Immutability</h2>
  <p>A list can be changed in place; a string cannot. Once a string object exists, its characters are fixed forever, which is called being <strong>immutable</strong>. That may sound limiting, since text processing is all about changing text, so let us see what it means in practice:</p>
  <div class="fx" data-lang="py">line = "Asha: 2 masala chai ₹40"
try:
    line[0] = "a"
except TypeError as e:
    print("TypeError:", e)
shout = line.upper()            # a NEW string; line is untouched
print(shout)
print(line)
before = id(line)
line = line + "!"               # "changing" = building a new object and moving the name
print(id(line) == before, line)</div>
  <div class="fx" data-lang="text">TypeError: 'str' object does not support item assignment
ASHA: 2 MASALA CHAI ₹40
Asha: 2 masala chai ₹40
False Asha: 2 masala chai ₹40!</div>
  <p>Assigning to a position raises <code>TypeError</code>, just as it does for a tuple. <code>line.upper()</code> did not change <code>line</code>; it built and returned a brand-new string in capitals, and <code>line</code> still holds the original. Even <code>line = line + "!"</code> does not change the old string: it creates a new string object (its <code>id</code> is different) and then moves the name <code>line</code> to point at it. This is the "names are labels" idea from <a class="xref" data-note="py_fundamentals">Python Fundamentals</a>. So "changing" a string always means making a new one and re-pointing a name, like replacing a shop's name board rather than repainting a tile.</p>
  <p>Python made strings immutable on purpose, and it buys three things. Strings can be dictionary keys and set items, because their hash can never change (see <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>). A string can be shared safely between many parts of a program, because nobody can alter it behind anyone else's back. And Python can reuse identical strings internally to save memory. The practical consequence to remember is that a string method on its own line does nothing useful: <code>line.strip()</code> computes a cleaned string and throws it away. You must write <code>line = line.strip()</code>. This is the exact opposite of the list trap, where <code>q = q.sort()</code> loses the list because <code>sort</code> changes the list in place and returns <code>None</code>.</p>

  <h2 id="pst-methods"><span class="num">03</span>String Methods</h2>
  <p>Since fixed positions break as soon as names differ in length, we need to cut text by its content: at separators, around whitespace, before or after a known marker. Python's string <strong>methods</strong> do exactly that, and because strings are immutable, every one of them returns a new string (or a list of strings) and leaves the original alone. The most important pair is <code>split</code> and <code>join</code>. <code>split</code> cuts a string into a list of pieces wherever a separator appears, like tearing a sheet of tickets at every perforation. <code>join</code> does the reverse: it glues a list of strings into one string, putting the separator between each pair, like taping the tickets back into one strip. Let us parse Asha's line step by step:</p>
  <div class="fx" data-lang="py">line = "Asha: 2 masala chai ₹40"
name, rest = line.split(": ")            # cut at ": " -&gt; two pieces
print(repr(name), repr(rest))
words = rest.split()                     # no argument: cut at any run of spaces
print(words)
qty = int(words[0])                      # text "2" -&gt; number 2
amount = int(words[-1].lstrip("₹"))      # remove the rupee sign from the LEFT
item = " ".join(words[1:-1])             # glue the middle words back with spaces
print((name, item, qty, amount))</div>
  <div class="fx" data-lang="text">'Asha' '2 masala chai ₹40'
['2', 'masala', 'chai', '₹40']
('Asha', 'masala chai', 2, 40)</div>
  <p>The first <code>split(": ")</code> cuts at the colon-and-space, giving the name and the rest; we unpack the two pieces straight into variables (<code>repr</code> just prints them with quotes so you can see exactly where each piece starts and ends). <code>split()</code> with no argument is special: it cuts at any run of whitespace and never produces empty pieces, which makes it the right choice for splitting text into words. The first word, "2", is still text, so <code>int()</code> converts it to the number 2. The last word is "₹40"; <code>lstrip("₹")</code> removes the rupee sign from the left end, and <code>int</code> turns "40" into 40. The item can be one word or several, so we take all the middle words, <code>words[1:-1]</code>, and glue them back with <code>" ".join</code>. Note the slightly odd-looking order of <code>join</code>: the separator comes first, then the list, as in <code>separator.join(pieces)</code>. The result is the tuple we used throughout the previous pages.</p>
  <p>Several other methods come up constantly when cleaning text. Read through the output and match each line to its method:</p>
  <div class="fx" data-lang="py">line = "Ben: 3 samosa ₹45"
print(line.find("samosa"), line.find("vada"))          # position, or -1 when missing
try:
    line.index("vada")                                 # like find, but RAISES when missing
except ValueError as e:
    print("ValueError:", e)
print(line.replace("samosa", "vada pav"))
print(line.startswith("Ben"), line.endswith("₹45"), line.count("a"))
print(line.partition(": "))                            # always exactly 3 parts
print(repr("  Ben \\n".strip()), repr("--chai--".strip("-")), repr("₹45".removeprefix("₹")))
print("asha".title(), "MASALA chai".lower(), "3".isdigit(), "₹45".isdigit())
print(line.split(" ", 1), "a,b,,c".split(","))</div>
  <div class="fx" data-lang="text">7 -1
ValueError: substring not found
Ben: 3 vada pav ₹45
True True 2
('Ben', ': ', '3 samosa ₹45')
'Ben' 'chai' '45'
Asha masala chai True False
['Ben:', '3 samosa ₹45'] ['a', 'b', '', 'c']</div>
  <p><code>find</code> returns the position where a substring first appears (samosa starts at 7) or −1 if it does not appear; <code>index</code> does the same but raises <code>ValueError</code> when the substring is missing, which is better when its absence would be a bug. <code>replace</code> swaps every occurrence of one substring for another. <code>startswith</code> and <code>endswith</code> test the two ends, and <code>count</code> counts occurrences ("a" appears twice). <code>partition</code> splits at the first separator and always returns exactly three parts (before, separator, after), so it never fails to unpack even when the separator is missing. <code>strip()</code> removes whitespace, including the newline character <code>\\n</code>, from both ends; given an argument it removes those characters instead, and <code>lstrip</code> and <code>rstrip</code> do one end only, while <code>removeprefix</code> removes one exact prefix once. <code>title</code>, <code>lower</code> and <code>upper</code> change case, and <code>isdigit</code> checks that every character is a digit, so "₹45" fails. Finally, <code>split(" ", 1)</code> splits at most once, and <code>split(",")</code> with an explicit separator keeps the empty piece between two commas, unlike <code>split()</code> with no argument.</p>
  <p>With these tools we can write a <code>parse</code> function and apply it to every line with a list comprehension, turning raw text into typed records:</p>
  <div class="fx" data-lang="py">def parse(line):
    name, rest = line.split(": ")
    words = rest.split()
    return name, " ".join(words[1:-1]), int(words[0]), int(words[-1].lstrip("₹"))
orders = [parse(l) for l in LINES]
for o in orders:
    print(o)
print(sum(o[3] for o in orders))</div>
  <div class="fx" data-lang="text">('Asha', 'masala chai', 2, 40)
('Ben', 'samosa', 3, 45)
('Asha', 'ginger chai', 1, 25)
('Chen', 'masala chai', 1, 20)
('Dia', 'bun maska', 2, 60)
('Ben', 'masala chai', 2, 40)
230</div>
  <p>All six lines become tuples of (name, item, quantity, amount), with the numbers as real integers, and the amounts add up to 230, matching the totals from <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>. This parser assumes tidy input, exactly one ": " and a ₹ glued to the amount; section 08 shows what to do when real people type the lines.</p>

  <h2 id="pst-fmt"><span class="num">04</span>f-strings and Format Specs</h2>
  <p>The reverse job, turning values back into readable text, is just as common: a bill, a log message, a report. Gluing pieces with <code>+</code> quickly gets clumsy, because every number has to be converted with <code>str()</code> and every space has to be added by hand. An <strong>f-string</strong>, a string literal with the letter <code>f</code> in front of the opening quote, solves this: anything you write inside curly braces <code>{ }</code> is a Python expression, evaluated when the line runs, and its value is inserted into the text. Think of a pre-printed bill book where the braces are the blanks to fill in.</p>
  <div class="fx" data-lang="py">name, item, qty, amount = "Asha", "masala chai", 2, 40
print("Bill for " + name + ": " + str(qty) + " x " + item + " = Rs " + str(amount))  # clumsy
print(f"Bill for {name}: {qty} x {item} = Rs {amount}")
print(f"{name.upper()} owes {qty * 20 + 25} rupees")    # any expression inside { }</div>
  <div class="fx" data-lang="text">Bill for Asha: 2 x masala chai = Rs 40
Bill for Asha: 2 x masala chai = Rs 40
ASHA owes 65 rupees</div>
  <p>The first two lines print identical text, but the f-string needs no <code>+</code> and no <code>str()</code>, and it reads like the output it produces. The third line shows that the braces can hold any expression, a method call or arithmetic, not just a variable name: Asha's 2 × 20 + 25 is 65.</p>
  <p>Inside the braces, after a colon, you can add a <strong>format spec</strong>: a short code that says how to display the value, such as "two decimal places" or "right-aligned in a field six characters wide". In the bill-book picture, it is the small instruction printed under each blank.</p>
  <div class="fx" data-lang="py">amount, name = 40, "Asha"
print(f"[{amount / 3:.2f}] [{amount:5d}] [{amount:&lt;5}] [{name:&gt;6}] [{name:^8}]")
total, share, n = 230, 85 / 230, 1234567
print(f"{share:.1%} {n:,} {n:_} {7:03d} {255:x} {255:b} {total:e}")
print(f"{name!r} {total=} {share=:.3f}")</div>
  <div class="fx" data-lang="text">[13.33] [   40] [40   ] [  Asha] [  Asha  ]
37.0% 1,234,567 1_234_567 007 ff 11111111 2.300000e+02
'Asha' total=230 share=0.370</div>
  <p>The square brackets in the first line just make the field widths visible. <code>.2f</code> means "fixed-point with 2 decimals", so 40/3 shows as 13.33. <code>5d</code> means "an integer in a field 5 characters wide", and numbers are right-aligned by default. <code>&lt;5</code> left-aligns in 5 characters, <code>&gt;6</code> right-aligns in 6, and <code>^8</code> centres in 8. The second line shows more types: <code>.1%</code> multiplies by 100 and adds a percent sign (85/230 is 37.0%), <code>,</code> and <code>_</code> insert thousands separators, <code>03d</code> pads with zeros to width 3, <code>x</code> and <code>b</code> show hexadecimal and binary, and <code>e</code> shows scientific notation. In the third line, <code>!r</code> inserts the value's <code>repr</code> (with quotes), and the <code>=</code> form, <code>{total=}</code>, prints the expression's text as well as its value, which is very handy for quick debugging.</p>
  <p>The real use of widths is lining up columns. Here is a bill for the whole morning, using the totals from <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>:</p>
  <div class="fx" data-lang="py">bills = {"Asha": 65, "Ben": 85, "Chen": 20, "Dia": 60}
print(f"{'customer':&lt;10}{'Rs':&gt;6}{'share':&gt;8}")
for who, rs in bills.items():
    print(f"{who:&lt;10}{rs:&gt;6}{rs / 230:&gt;8.1%}")
print(f"{'TOTAL':&lt;10}{sum(bills.values()):&gt;6}")</div>
  <div class="fx" data-lang="text">customer      Rs   share
Asha          65   28.3%
Ben           85   37.0%
Chen          20    8.7%
Dia           60   26.1%
TOTAL        230</div>
  <p>Every row uses the same widths, 10 characters left-aligned for the name and 6 and 8 right-aligned for the numbers, so the columns line up however long each value is. The shares are each bill divided by 230, shown as percentages. Notice that the column headings inside the f-strings use single quotes, because the f-string itself is written with double quotes.</p>
  <p>Two cautions. Formatting is for display only: <code>f"{0.1 + 0.2:.2f}"</code> shows 0.30, but the underlying float is still 0.30000000000000004, so do the arithmetic with numbers and format only at the end, and for real money use whole paise or <code>decimal.Decimal</code>. And never build SQL queries or shell commands by inserting user input into an f-string, because a malicious input can change the meaning of the command; use the database library's parameters instead.</p>

  <h2 id="pst-join"><span class="num">05</span>Building Strings: + versus join</h2>
  <p>Immutability has a cost that only shows up at scale. Suppose we build one long line listing every customer, adding one name at a time with <code>s = s + name + ","</code>. Because a string cannot grow in place, each <code>+</code> has to allocate a brand-new string and copy every character of the old one into it, then add the new piece. Let us count the characters written:</p>
  <div class="fx" data-lang="py">pieces = ["Asha", "Ben", "Asha", "Chen", "Dia", "Ben"]
s, copied = "", 0
for p in pieces:
    s = s + p + ","                 # builds a new string each time
    copied += len(s)                # every character of the new string is written
    print(f"{s:30} length {len(s):2}  copied so far {copied}")
print(",".join(pieces), "&lt;- join writes", len(",".join(pieces)), "characters once")</div>
  <div class="fx" data-lang="text">Asha,                          length  5  copied so far 5
Asha,Ben,                      length  9  copied so far 14
Asha,Ben,Asha,                 length 14  copied so far 28
Asha,Ben,Asha,Chen,            length 19  copied so far 47
Asha,Ben,Asha,Chen,Dia,        length 23  copied so far 70
Asha,Ben,Asha,Chen,Dia,Ben,    length 27  copied so far 97
Asha,Ben,Asha,Chen,Dia,Ben &lt;- join writes 26 characters once</div>
  <p>To produce a 27-character result, the loop wrote 5 + 9 + 14 + 19 + 23 + 27 = 97 characters, because the early pieces were copied again on every pass: "Asha," was written six times. With n pieces, the total copying grows roughly like 1 + 2 + … + n, which is about n²/2, so building a string this way is O(n²). <code>",".join(pieces)</code> works differently: it first adds up the lengths of all the pieces, allocates the final string once at exactly the right size, and copies each piece into it once. That is O(n) in total. Imagine writing a growing list of names on whiteboards that can neither be erased nor extended: with <code>+</code> you fetch a bigger board for every new name and copy all the old names across; with <code>join</code> you count the names first, fetch one board of the right size, and write each name once.</p>
  <div class="fx" data-lang="py">import timeit
words = ["x"] * 20000
def concat():
    s = ""
    for w in words:
        s = s + w + ","          # copies the growing string each time
    return s
def join():
    return ",".join(words)       # one pass, one allocation
print(concat()[:-1] == join())
print(f"concat {timeit.timeit(concat, number=50) * 20:.2f} ms, join {timeit.timeit(join, number=50) * 20:.2f} ms")</div>
  <div class="fx" data-lang="text">True
concat 17.30 ms, join 0.11 ms</div>
  <p>Both produce the same text (the concat version has one extra trailing comma, which we remove for the comparison), but <code>join</code> is far faster at 20,000 pieces, and the gap grows with n. The times are approximate. CPython sometimes manages to extend <code>s += x</code> in place when nothing else refers to <code>s</code>, which hides the problem in small tests, but you should not rely on that trick; other Python implementations do not have it. The rule is simple: when building text in a loop, append the pieces to a list and call <code>"".join(pieces)</code> once at the end, and when writing to a file, write each piece directly. The same reasoning applies to tuples, since <code>t = t + (x,)</code> in a loop is also quadratic.</p>

  <h2 id="pst-uni"><span class="num">06</span>Unicode, Bytes and Encodings</h2>
  <p>So far a string has been "a sequence of characters", but computers do not store characters; files, network connections and databases store <strong>bytes</strong>, numbers from 0 to 255. There are far more than 256 characters in the world's writing systems, so text has to be translated into bytes whenever it is saved or sent, and translated back when it is read. Two ideas make this work. <strong>Unicode</strong> is one worldwide list that gives every character a number, called its <strong>code point</strong>: "c" is 99, written U+0063 in the standard hexadecimal notation, and "₹" is 8377, or U+20B9. A Python <code>str</code> is, precisely, a sequence of code points. An <strong>encoding</strong> is a rule for turning code points into bytes and back again. The standard encoding today is <strong>UTF-8</strong>, which uses 1 byte for the basic English characters and 2 to 4 bytes for everything else. An analogy: the code points are the words of a message, and the encoding is the signalling system used to send it. Send in Morse and read as semaphore and you get nonsense, even though every signal arrived.</p>
  <p>Python converts between the two worlds with two methods: <code>str.encode("utf-8")</code> turns text into bytes, and <code>bytes.decode("utf-8")</code> turns bytes back into text. Let us look at "chai ₹" one character at a time:</p>
  <div class="fx" data-lang="py">s = "chai ₹"
print(len(s))
for ch in s:
    b = ch.encode("utf-8")
    print(f"{ch!r:5} code point {ord(ch):5} = U+{ord(ch):04X}  utf-8 bytes {b.hex(' '):9} ({len(b)} byte{'s' if len(b) &gt; 1 else ''})")</div>
  <div class="fx" data-lang="text">6
'c'   code point    99 = U+0063  utf-8 bytes 63        (1 byte)
'h'   code point   104 = U+0068  utf-8 bytes 68        (1 byte)
'a'   code point    97 = U+0061  utf-8 bytes 61        (1 byte)
'i'   code point   105 = U+0069  utf-8 bytes 69        (1 byte)
' '   code point    32 = U+0020  utf-8 bytes 20        (1 byte)
'₹'   code point  8377 = U+20B9  utf-8 bytes e2 82 b9  (3 bytes)</div>
  <p><code>ord()</code> gives a character's code point and <code>chr()</code> goes the other way. The five ASCII characters (the basic English set, code points below 128) each become a single byte whose value equals the code point: "c" is 99, hex 63. The rupee sign, code point 8377, becomes three bytes: e2, 82 and b9 in hex. So this string is 6 characters long but 8 bytes long once encoded:</p>
  <div class="fx" data-lang="py">s = "chai ₹"
data = s.encode("utf-8")            # str -&gt; bytes
print(data, type(data), len(data))
print(data.decode("utf-8"))         # bytes -&gt; str
print(list(data))                   # bytes are just numbers 0-255</div>
  <div class="fx" data-lang="text">b'chai \\xe2\\x82\\xb9' &lt;class 'bytes'&gt; 8
chai ₹
[99, 104, 97, 105, 32, 226, 130, 185]</div>
  <p><code>data</code> is a <code>bytes</code> object, an immutable sequence of numbers from 0 to 255. Python prints it as <code>b'...'</code>, showing ASCII bytes as letters and other bytes as <code>\\x</code> followed by two hex digits. Its length is 8. Decoding it with the same encoding gives back the original text, and <code>list(data)</code> shows the raw numbers: the five ASCII codes followed by 226, 130 and 185 for the rupee sign.</p>
  <p>How does UTF-8 decide on exactly those three bytes, and how does a reader know where each character starts? The rule is a fixed bit pattern. In binary, U+20B9 is <code>0010 0000 1011 1001</code> (16 bits). Code points between U+0800 and U+FFFF use the three-byte pattern <code>1110xxxx 10xxxxxx 10xxxxxx</code>: the 16 bits are split into groups of 4, 6 and 6 and dropped into the x positions in order:</p>
  <table class="tbl">
    <tr><th>byte</th><th>pattern</th><th>bits filled in</th><th>hex</th><th>decimal</th></tr>
    <tr><td>1</td><td>1110xxxx</td><td>1110 0010</td><td>E2</td><td>226</td></tr>
    <tr><td>2</td><td>10xxxxxx</td><td>10 000010</td><td>82</td><td>130</td></tr>
    <tr><td>3</td><td>10xxxxxx</td><td>10 111001</td><td>B9</td><td>185</td></tr>
  </table>
  <p>That gives exactly the bytes we saw. The fixed leading bits act as signposts. A byte starting with 0 is a complete ASCII character on its own; a byte starting with 1110 announces "I am the first of three"; and every byte starting with 10 is a continuation byte. A decoder reading a stream of bytes can therefore always tell where each character begins, and it is also why old ASCII text is automatically valid UTF-8.</p>

  <h2 id="pst-enc"><span class="num">07</span>When Encodings Go Wrong</h2>
  <p>Every encoding bug comes from one mistake: bytes are turned into text (or text into bytes) using a different encoding from the one used at the other end. There are three typical symptoms, and they look different enough that it pays to recognise each:</p>
  <div class="fx" data-lang="py">s = "chai ₹"
try:
    s.encode("ascii")
except UnicodeEncodeError as e:
    print("UnicodeEncodeError:", e.reason)
print(s.encode("ascii", errors="replace"), s.encode("ascii", errors="ignore"))
raw = s.encode("utf-8")
print(raw.decode("cp1252"))         # wrong codec (Windows-1252): garbage, no error!
try:
    raw.decode("ascii")
except UnicodeDecodeError as e:
    print("UnicodeDecodeError:", e.reason)</div>
  <div class="fx" data-lang="text">UnicodeEncodeError: ordinal not in range(128)
b'chai ?' b'chai '
chai â‚¹
UnicodeDecodeError: ordinal not in range(128)</div>
  <p>First, ASCII only knows 128 characters, so encoding "₹" into ASCII fails with <code>UnicodeEncodeError</code>, "ordinal not in range(128)". You can ask Python to cope, with <code>errors="replace"</code> writing a "?" or <code>errors="ignore"</code> silently dropping the character, but both lose data. Second, and most dangerous, decoding UTF-8 bytes with the wrong encoding often does <em>not</em> raise any error. Windows-1252 (also called cp1252) has a character for every byte, so each of the rupee sign's three bytes becomes its own character: E2 becomes "â", 82 becomes "‚" and B9 becomes "¹". This garbage, "chai â‚¹", is called <strong>mojibake</strong>, and when you see it, the diagnosis is almost always "UTF-8 bytes read with the wrong codec". Third, decoding with ASCII does raise <code>UnicodeDecodeError</code>, because bytes above 127 are not valid ASCII at all.</p>
  <p>Files are where this matters most, because <code>open()</code> uses the computer's default encoding unless you say otherwise, and that default differs between machines (many Windows systems use cp1252):</p>
  <div class="fx" data-lang="py">with open("orders.txt", "w", encoding="utf-8") as f:
    f.write("Asha: 2 masala chai ₹40\\n")
with open("orders.txt", "rb") as f:            # "rb": read raw bytes
    print(f.read())
with open("orders.txt", encoding="utf-8") as f:
    print(f.read().strip())
with open("orders.txt", encoding="cp1252") as f:
    print(f.read().strip())</div>
  <div class="fx" data-lang="text">b'Asha: 2 masala chai \\xe2\\x82\\xb940\\n'
Asha: 2 masala chai ₹40
Asha: 2 masala chai â‚¹40</div>
  <p>Opened in binary mode (<code>"rb"</code>), the file shows its real contents: the three bytes of the rupee sign. Read back as UTF-8 the text is correct; read as cp1252 the very same bytes become mojibake. The rule is to always pass <code>encoding="utf-8"</code> to <code>open()</code>, and to use <code>"utf-8-sig"</code> for CSV files saved by Excel, which start with an invisible marker called a byte-order mark (BOM). File handling in general is covered in <a class="xref" data-note="py_files">File Handling</a>.</p>
  <p>One last Unicode surprise: two strings can look identical on screen and still be different. The letter "é" can be stored as one code point (U+00E9, "e with acute"), or as a plain "e" followed by a separate combining accent (U+0301). Below, <code>́</code> is how you write that combining accent inside a Python string:</p>
  <div class="fx" data-lang="py">import unicodedata
a = "café"                          # é as ONE code point (U+00E9)
b = "café"                    # e + COMBINING ACUTE ACCENT (two code points)
print(a, b, a == b, len(a), len(b))
print(unicodedata.normalize("NFC", b) == a)</div>
  <div class="fx" data-lang="text">café café False 4 5
True</div>
  <p>Both print as "café", yet they compare unequal and have lengths 4 and 5. Text copied from different sources (a Mac file name, a web form, a PDF) can arrive in either form, and then a dictionary lookup or duplicate check fails mysteriously. <code>unicodedata.normalize("NFC", s)</code> converts text to the composed form, so normalise text before comparing it, removing duplicates or using it as a key. The same example shows that <code>len()</code> counts code points, not bytes and not what a reader would call letters: "chai ₹" is 6 code points but 8 UTF-8 bytes, so a limit such as "at most 255 bytes" must be checked with <code>len(s.encode("utf-8"))</code>.</p>

  <h2 id="pst-re"><span class="num">08</span>Regular Expressions</h2>
  <p>Our <code>parse</code> function assumed every line was typed neatly. Here are the same six orders as they were actually typed in a hurry, and what <code>split(": ")</code> makes of them:</p>
  <div class="fx" data-lang="py">RAW = [
    "Asha: 2 masala chai ₹40",
    "Ben : 3 samosa ₹45",
    "asha:1 ginger chai  ₹25",
    "Chen: 1 masala chai ₹20",
    "Dia: 2 bun maska ₹ 60",
    "Ben: 2 masala chai ₹40",
]
for l in RAW:
    print(repr(l), "-&gt;", l.split(": "))</div>
  <div class="fx" data-lang="text">'Asha: 2 masala chai ₹40' -&gt; ['Asha', '2 masala chai ₹40']
'Ben : 3 samosa ₹45' -&gt; ['Ben ', '3 samosa ₹45']
'asha:1 ginger chai  ₹25' -&gt; ['asha:1 ginger chai  ₹25']
'Chen: 1 masala chai ₹20' -&gt; ['Chen', '1 masala chai ₹20']
'Dia: 2 bun maska ₹ 60' -&gt; ['Dia', '2 bun maska ₹ 60']
'Ben: 2 masala chai ₹40' -&gt; ['Ben', '2 masala chai ₹40']</div>
  <p>Three lines break. "Ben " keeps a trailing space because of the space before the colon, "asha:1 ..." does not split at all because there is no space after the colon, and "₹ 60" has a space that would make <code>int</code> fail later. We could add special cases for each, but the next file would bring new ones. What we really want is to describe the <em>shape</em> of a valid line, "a word, a colon with maybe some spaces around it, a number, the item, a rupee sign, maybe a space, a number", and let Python find the parts that fit. A <strong>regular expression</strong> (regex) is exactly that: a small language for describing the shape of text. It is like telling a helper "find every ten-digit number starting with 9" in a register, rather than listing each phone number. Python's <code>re</code> module runs them.</p>
  <p>A regex is written as a string in which some characters have special meanings. <code>\\d</code> means "one digit", and <code>+</code> means "one or more of the thing before", so <code>\\d+</code> means "a run of digits". The table lists the pieces you will use most:</p>
  <table class="tbl">
    <tr><th>Token</th><th>Matches</th><th>Token</th><th>Matches</th></tr>
    <tr><td><code>\\d \\w \\s</code></td><td>a digit, a word character (letter, digit or _), a whitespace character</td><td><code>+ * ?</code></td><td>1 or more, 0 or more, 0 or 1 of the previous item</td></tr>
    <tr><td><code>.</code></td><td>any character except a newline</td><td><code>{2,4}</code> <code>{6}</code></td><td>2 to 4 times, exactly 6 times</td></tr>
    <tr><td><code>^ $</code></td><td>the start, the end of the text</td><td><code>[A-Z]</code> <code>[^,]</code></td><td>one of these characters / any character except these</td></tr>
    <tr><td><code>( )</code></td><td>a capture group: a part you want back</td><td><code>(?P&lt;name&gt;…)</code></td><td>a named group</td></tr>
    <tr><td><code>\\b</code></td><td>a word boundary</td><td><code>a|b</code></td><td>a or b</td></tr>
  </table>
  <p>Regex patterns are full of backslashes, and backslashes also have meanings in ordinary Python strings: <code>"\\n"</code> is a newline and <code>"\\b"</code> is the backspace control character. To stop Python interpreting them before the regex engine sees them, always write patterns as <strong>raw strings</strong>, with an <code>r</code> before the quote, in which a backslash is just a backslash:</p>
  <div class="fx" data-lang="py">print(len("\\b"), len(r"\\b"))
print(re.findall("\\bchai\\b", "masala chai"), re.findall(r"\\bchai\\b", "masala chai"))</div>
  <div class="fx" data-lang="text">1 2
[] ['chai']</div>
  <p>In the normal string, <code>"\\b"</code> is one character, the backspace, so the pattern searches for backspaces and finds nothing. In the raw string it is two characters, a backslash and a "b", which the regex engine reads as "word boundary", and "chai" is found. Every pattern from here on is a raw string.</p>
  <p>The three most used functions are <code>re.search</code>, which finds the first place a pattern fits, <code>re.findall</code>, which returns every match as a list of strings, and groups, which pick out part of a match:</p>
  <div class="fx" data-lang="py">text = "Ben : 3 samosa ₹45"
m = re.search(r"\\d+", text)            # first run of 1 or more digits
print(m.group(), m.start(), m.end())
print(re.findall(r"\\d+", text))        # every run of digits
print(re.findall(r"₹\\s*(\\d+)", "Dia: 2 bun maska ₹ 60"))   # group: only the part in ( )</div>
  <div class="fx" data-lang="text">3 6 7
['3', '45']
['60']</div>
  <p><code>re.search</code> returns a <strong>match object</strong> describing the first match: its text, "3", and where it starts and ends (positions 6 and 7). If nothing matches it returns <code>None</code>. <code>findall</code> returns every match, the quantity 3 and the amount 45. When the pattern contains a group in round brackets, <code>findall</code> returns just the group's text: <code>₹\\s*(\\d+)</code> reads as "a rupee sign, any number of spaces, then capture a run of digits", so "₹ 60" gives just "60".</p>
  <p>Now we can describe a whole order line. Read the pattern piece by piece against "Ben : 3 samosa ₹45":</p>
  <table class="tbl">
    <tr><th>piece</th><th>meaning</th><th>matches</th></tr>
    <tr><td><code>^\\s*</code></td><td>the start, then optional spaces</td><td>(nothing)</td></tr>
    <tr><td><code>(\\w+)</code></td><td>group 1: the name</td><td>Ben</td></tr>
    <tr><td><code>\\s*:\\s*</code></td><td>a colon with optional spaces around it</td><td>" : "</td></tr>
    <tr><td><code>(\\d+)</code></td><td>group 2: the quantity</td><td>3</td></tr>
    <tr><td><code>\\s+(.+?)\\s+</code></td><td>group 3: the item, as short as possible, between spaces</td><td>samosa</td></tr>
    <tr><td><code>₹\\s*(\\d+)\\s*$</code></td><td>₹, optional spaces, group 4: the amount, then the end</td><td>45</td></tr>
  </table>
  <div class="fx" data-lang="py">pat = re.compile(r"^\\s*(\\w+)\\s*:\\s*(\\d+)\\s+(.+?)\\s+₹\\s*(\\d+)\\s*$")
for l in RAW:
    m = pat.search(l)
    print(m.groups())</div>
  <div class="fx" data-lang="text">('Asha', '2', 'masala chai', '40')
('Ben', '3', 'samosa', '45')
('asha', '1', 'ginger chai', '25')
('Chen', '1', 'masala chai', '20')
('Dia', '2', 'bun maska', '60')
('Ben', '2', 'masala chai', '40')</div>
  <p>All six lines parse, including the three that broke <code>split</code>, because the pattern says "optional spaces" wherever spaces may or may not appear. <code>re.compile</code> turns the pattern into a reusable object, which is tidier and slightly faster when the same pattern is used many times. <code>m.groups()</code> returns a tuple of the four captured strings, ready to unpack. Two things are still not clean: "asha" is lowercase and the numbers are text; the final section deals with both.</p>
  <p>The <code>?</code> after <code>.+</code> in the item group deserves a word. By default, <code>+</code> and <code>*</code> are <strong>greedy</strong>: they grab as many characters as they can and only give some back if the rest of the pattern would otherwise fail. Adding <code>?</code> makes them <strong>lazy</strong>, taking as few as possible. Here it stops the item from swallowing the extra spaces in "ginger chai  ₹25". Greediness causes classic bugs: on "a,b,c", the pattern <code>(.+),</code> captures "a,b", up to the <em>last</em> comma, while <code>(.+?),</code> or <code>([^,]+),</code> captures just "a".</p>
  <p>Numbered groups are hard to read in a long pattern. A <strong>named group</strong>, written <code>(?P&lt;name&gt;...)</code>, lets you refer to each part by name:</p>
  <div class="fx" data-lang="py">pat = re.compile(r"^\\s*(?P&lt;name&gt;\\w+)\\s*:\\s*(?P&lt;qty&gt;\\d+)\\s+(?P&lt;item&gt;.+?)\\s+₹\\s*(?P&lt;amount&gt;\\d+)\\s*$")
m = pat.search("Dia: 2 bun maska ₹ 60")
print(m["name"], m["item"], int(m["qty"]) * 30 == int(m["amount"]))
print(m.groupdict())</div>
  <div class="fx" data-lang="text">Dia bun maska True
{'name': 'Dia', 'qty': '2', 'item': 'bun maska', 'amount': '60'}</div>
  <p><code>m["item"]</code> (the same as <code>m.group("item")</code>) is far clearer than <code>m.group(3)</code>, and <code>groupdict()</code> returns all the named parts as a dictionary. The check confirms Dia's line: 2 bun maska at ₹30 each is ₹60.</p>
  <p>Finally, three more functions complete the everyday toolkit. <code>re.match</code> only tries to match at the very start of the text, <code>re.fullmatch</code> requires the <em>whole</em> text to fit the pattern, and <code>re.sub</code> replaces every match with something else:</p>
  <div class="fx" data-lang="py">print(re.match(r"\\d+", "Ben : 3 samosa"))            # match only tries position 0
print(re.search(r"\\d+", "Ben : 3 samosa").group())   # search scans the whole text
print(bool(re.fullmatch(r"\\d{10}", "9876543210")), bool(re.fullmatch(r"\\d{10}", "98765 43210")))
print(re.sub(r"\\s+", " ", "asha:1 ginger chai  ₹25"))          # squeeze runs of spaces
print(re.sub(r"₹\\s*(\\d+)", r"Rs \\1", "Dia: 2 bun maska ₹ 60"))  # \\1 = whatever group 1 captured</div>
  <div class="fx" data-lang="text">None
3
True False
asha:1 ginger chai ₹25
Dia: 2 bun maska Rs 60</div>
  <p><code>re.match</code> returns <code>None</code> here because the digit is not at the start of the text, while <code>search</code> scans along and finds it; mixing these two up is a very common bug. <code>fullmatch</code> is the right tool for validation, such as "is this exactly a ten-digit phone number?": the version containing a space fails. <code>re.sub</code> squeezes every run of whitespace down to one space, and in the last line rewrites "₹ 60" as "Rs 60", where <code>\\1</code> in the replacement means "the text captured by group 1". Do not reach for a regex when a plain method says it more clearly: <code>s.startswith("Ben")</code> beats <code>re.match("Ben", s)</code>, and formats like HTML and JSON have proper parsers.</p>

  <h2 id="pst-build"><span class="num">09</span>Putting It Together</h2>
  <p>A typical data-cleaning job has four stages: <strong>parse</strong> the raw text into values, <strong>normalise</strong> them (consistent case and spacing), <strong>validate</strong> them against known facts, and only then <strong>aggregate</strong>. This final example runs the messy order lines through all four, using one container for each job, as described in <a class="xref" data-note="py_ds">Choosing a Collection</a>: a regex to parse each string, a tuple per order in a list, the menu dict to check each typed amount, a set of customers, a <code>Counter</code> of items sold, a <code>defaultdict</code> of bills, and f-strings for the printed bill. It is like closing the till at night: read the slips, file each as a record, price it from the board, note who came, tally the items, total each tab, and print the day's sheet.</p>
  <div class="fx" data-lang="py">from collections import Counter, defaultdict
menu = {"masala chai": 20, "ginger chai": 25, "samosa": 15, "bun maska": 30}
pat = re.compile(r"^\\s*(?P&lt;name&gt;\\w+)\\s*:\\s*(?P&lt;qty&gt;\\d+)\\s+(?P&lt;item&gt;.+?)\\s+₹\\s*(?P&lt;amount&gt;\\d+)\\s*$")

orders, problems = [], []
for l in RAW:
    m = pat.search(l)
    if not m:                                            # could not parse at all
        problems.append(l)
        continue
    name = m["name"].title()                             # normalise: "asha" -&gt; "Asha"
    item = " ".join(m["item"].lower().split())           # normalise spaces and case
    qty, amount = int(m["qty"]), int(m["amount"])
    if menu.get(item) is None or qty * menu[item] != amount:   # validate against the menu
        problems.append(l)
        continue
    orders.append((name, item, qty))                     # list of tuples

customers = {name for name, _, _ in orders}              # set
sold = Counter()                                         # Counter
bill = defaultdict(int)                                  # defaultdict
for name, item, qty in orders:
    sold[item] += qty
    bill[name] += qty * menu[item]

print(f"{len(orders)} orders, {len(customers)} customers, problems: {problems}")
print("top seller:", sold.most_common(1))
print(f"{'customer':&lt;9}{'Rs':&gt;5}")
for who in sorted(bill, key=bill.get, reverse=True):
    print(f"{who:&lt;9}{bill[who]:&gt;5}")
print(f"{'TOTAL':&lt;9}{sum(bill.values()):&gt;5}")</div>
  <div class="fx" data-lang="text">6 orders, 4 customers, problems: []
top seller: [('masala chai', 5)]
customer    Rs
Ben         85
Asha        65
Dia         60
Chen        20
TOTAL      230</div>
  <p>All six lines parsed, there are 4 distinct customers, and the problems list is empty, because every typed amount equals quantity × menu price. Masala chai is the top seller with 5 cups, and the bill, sorted largest first, matches the totals computed in <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>: Ben 85, Asha 65, Dia 60, Chen 20, total 230. The difference is that this time they came straight from raw, messy text. The normalising step matters more than it looks. Without <code>title()</code>, "asha" and "Asha" would be two different keys: the set would count 5 customers and Asha's bill would be split in two. Without <code>" ".join(...split())</code>, an item typed with a double space would not match the menu. Normalise first, then count.</p>
  <p>The validation step also protects us from unknown items. If a line such as "Esha: 2 vada pav ₹36" arrived, <code>menu.get(item)</code> would return <code>None</code> and the line would be recorded in <code>problems</code> rather than crashing the program with a <code>KeyError</code>.</p>

  <h2 id="pst-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common string mistake comes straight from immutability: calling a method and forgetting to keep its result. The method works perfectly, but the new string it returns is thrown away:</p>
  <div class="fx" data-lang="py">name = "  asha  "
name.strip()                 # result thrown away
name.title()
print(repr(name))
name = name.strip().title()  # keep the result
print(repr(name))</div>
  <div class="fx" data-lang="text">'  asha  '
'Asha'</div>
  <p>After the first two calls <code>name</code> is unchanged, spaces and all. Assigning the result back fixes it, and because each method returns a string, they can be chained. A second classic is using <code>find</code> in an <code>if</code>. <code>find</code> returns a position, so a match at the very start returns 0, which counts as false, and "not found" returns −1, which counts as true:</p>
  <div class="fx" data-lang="py">line = "chai and samosa"
if line.find("chai"):
    print("found chai (find)")
else:
    print("no chai?! (find returned 0)")
if "chai" in line:
    print("found chai (in)")</div>
  <div class="fx" data-lang="text">no chai?! (find returned 0)
found chai (in)</div>
  <p>The <code>find</code> version reports that there is no chai, exactly backwards. To ask "is this substring present?", use <code>in</code>; use <code>find</code> only when you need the position. A third trap is <code>join</code> with things that are not strings:</p>
  <div class="fx" data-lang="py">qtys = [2, 3, 1]
try:
    ",".join(qtys)
except TypeError as e:
    print("TypeError:", e)
print(",".join(map(str, qtys)))</div>
  <div class="fx" data-lang="text">TypeError: sequence item 0: expected str instance, int found
2,3,1</div>
  <p><code>join</code> only glues strings, so a list of numbers must be converted first; <code>map(str, qtys)</code> applies <code>str</code> to each item. Beyond these, the traps from earlier sections are worth a final review: building text with <code>+</code> in a loop is O(n²), so collect pieces and <code>join</code> them; open files with <code>encoding="utf-8"</code>, or the same bytes may turn into mojibake on another machine; <code>len(s)</code> counts characters, not bytes; normalise case, spaces and Unicode form before comparing or counting; write regex patterns as raw strings; use <code>search</code> rather than <code>match</code> when the pattern may appear anywhere; and prefer a lazy <code>.+?</code> or a class like <code>[^,]+</code> over a greedy <code>.+</code>.</p>

  <h2 id="pst-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>str</b>: immutable sequence of Unicode code points. Indexing, slicing, <code>in</code> (substring), looping. Methods return new strings.</li>
    <li><b>Code point</b>: the number Unicode gives a character; <code>ord("₹")</code> is 8377, <code>chr(8377)</code> is "₹".</li>
    <li><b>Encoding</b>: rule mapping code points to bytes. UTF-8 uses 1 byte (ASCII) up to 4 bytes.</li>
    <li><b>bytes</b>: immutable sequence of integers 0–255. <code>s.encode()</code> → bytes, <code>b.decode()</code> → str.</li>
    <li><b>Mojibake</b>: garbage from decoding with the wrong codec ("â‚¹" for "₹").</li>
    <li><b>Regex</b>: a pattern describing the shape of text; <b>group</b> <code>( )</code> captures a part.</li>
  </ul>
  <h3>Methods</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Does</th></tr>
    <tr><td><code>split()</code> / <code>split(sep, maxsplit)</code></td><td>list of pieces; no argument = any whitespace, no empty pieces</td></tr>
    <tr><td><code>sep.join(strings)</code></td><td>one string with sep between (items must be str)</td></tr>
    <tr><td><code>strip</code>, <code>lstrip</code>, <code>rstrip</code>, <code>removeprefix</code></td><td>trim ends</td></tr>
    <tr><td><code>find</code> / <code>index</code></td><td>position; −1 / ValueError when missing</td></tr>
    <tr><td><code>replace</code>, <code>count</code>, <code>startswith</code>, <code>endswith</code>, <code>partition</code></td><td>replace all, count, test ends, split into 3</td></tr>
    <tr><td><code>lower</code>, <code>upper</code>, <code>title</code>, <code>casefold</code>, <code>isdigit</code></td><td>case and tests</td></tr>
  </table>
  <h3>Format specs</h3>
  <table class="tbl">
    <tr><th>Spec</th><th>Example</th><th>Gives</th></tr>
    <tr><td>decimals</td><td><code>{x:.2f}</code></td><td>13.33</td></tr>
    <tr><td>width / align</td><td><code>{x:5d}</code> <code>{s:&lt;10}</code> <code>{s:&gt;6}</code> <code>{s:^8}</code></td><td>padded fields</td></tr>
    <tr><td>percent, separators</td><td><code>{r:.1%}</code> <code>{n:,}</code></td><td>37.0%, 1,234,567</td></tr>
    <tr><td>zero-pad, hex, binary</td><td><code>{7:03d}</code> <code>{255:x}</code> <code>{255:b}</code></td><td>007, ff, 11111111</td></tr>
    <tr><td>debug, repr</td><td><code>{total=}</code> <code>{name!r}</code></td><td>total=230, 'Asha'</td></tr>
  </table>
  <h3>Regex functions</h3>
  <table class="tbl">
    <tr><th>Function</th><th>Returns</th></tr>
    <tr><td><code>re.search(p, s)</code></td><td>first match anywhere, or None</td></tr>
    <tr><td><code>re.match(p, s)</code></td><td>match at position 0 only, or None</td></tr>
    <tr><td><code>re.fullmatch(p, s)</code></td><td>match only if the whole string fits</td></tr>
    <tr><td><code>re.findall(p, s)</code></td><td>list of matches (or of groups)</td></tr>
    <tr><td><code>re.sub(p, repl, s)</code></td><td>new string with every match replaced</td></tr>
    <tr><td><code>m.group()</code>, <code>m.groups()</code>, <code>m["name"]</code>, <code>m.groupdict()</code></td><td>parts of a match</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">name, rest = line.split(": "); words = rest.split(); " ".join(words[1:-1])
s = s.strip().lower(); "chai" in s; s[::-1]
f"{name:&lt;10}{amount:&gt;6}{share:&gt;8.1%}"; f"{total=}"
"".join(parts)                                   # not s += part in a loop
data = s.encode("utf-8"); text = data.decode("utf-8")
open(path, encoding="utf-8"); unicodedata.normalize("NFC", s)
pat = re.compile(r"(?P&lt;name&gt;\\w+)\\s*:\\s*(?P&lt;qty&gt;\\d+)")
m = pat.search(line); m["qty"]; re.findall(r"\\d+", s); re.sub(r"\\s+", " ", s)</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>s.strip()</code> on its own changes nothing; assign the result.</li>
    <li><code>+</code> in a loop is O(n²); use <code>"".join</code>.</li>
    <li><code>if s.find(x):</code> is wrong; use <code>in</code>.</li>
    <li><code>",".join([1, 2])</code> → TypeError; convert with <code>map(str, …)</code>.</li>
    <li>No <code>encoding=</code> on <code>open()</code> → machine-dependent results.</li>
    <li><code>len(s)</code> counts code points, not bytes; look-alike strings may differ (normalise).</li>
    <li>Regex: raw strings; <code>match</code> only checks the start; <code>.+</code> is greedy.</li>
  </ul>

  <h2 id="pst-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Are Python strings mutable? What happens on <code>s[0] = "x"</code>?</summary><div class="qa-body">No, strings are immutable. <code>s[0] = "x"</code> raises <code>TypeError: 'str' object does not support item assignment</code>. To "change" a string you build a new one, for example <code>"x" + s[1:]</code> or <code>s.replace(...)</code>, and assign it to the name.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are strings immutable, and what does that buy?</summary><div class="qa-body">Immutability means a string's hash never changes, so strings can be dict keys and set items. It also makes them safe to share between parts of a program without copying, and lets Python reuse identical strings (interning) to save memory and speed up comparisons. The cost is that every modification creates a new string.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is building a string with <code>+=</code> in a loop slow? What should you do instead?</summary><div class="qa-body">Each <code>+</code> creates a new string and copies everything built so far, so building from n pieces copies about n²/2 characters: O(n²). Instead, append the pieces to a list and call <code>"".join(pieces)</code> once, which sizes the result once and copies each piece once: O(n). CPython sometimes optimises <code>s += x</code> in place, but that is not guaranteed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you reverse a string?</summary><div class="qa-body"><code>s[::-1]</code>, a slice with step −1. <code>"".join(reversed(s))</code> also works. Strings have no <code>reverse()</code> method, because they are immutable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>split()</code> and <code>split(" ")</code>?</summary><div class="qa-body"><code>split()</code> with no argument splits on any run of whitespace (spaces, tabs, newlines) and ignores leading and trailing whitespace, so it never returns empty strings. <code>split(" ")</code> splits on every single space, so double spaces produce empty strings: <code>"a  b".split(" ")</code> is <code>['a', '', 'b']</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>find</code> and <code>index</code>? Why is <code>if s.find(x):</code> a bug?</summary><div class="qa-body">Both return the position of the first occurrence. When the substring is missing, <code>find</code> returns −1 and <code>index</code> raises <code>ValueError</code>. <code>if s.find(x):</code> is a bug because a match at position 0 is falsy and "not found" (−1) is truthy, so the test is inverted at the edges. Use <code>if x in s:</code> to test for presence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>"banana".strip("an")</code> return?</summary><div class="qa-body"><code>'b'</code>. The argument to <code>strip</code> is a set of characters, not a substring: Python removes any of "a" and "n" from both ends until it meets another character. The "b" at the start blocks the left side, and the right side strips "ana", "n", "a" and so on back to "b". To remove an exact prefix or suffix, use <code>removeprefix</code> or <code>removesuffix</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>==</code> vs <code>is</code> for strings? What is interning?</summary><div class="qa-body"><code>==</code> compares the characters; <code>is</code> checks whether two names refer to the same object. Python interns (reuses a single copy of) some strings, such as identifier-like literals, so <code>is</code> may happen to be True for equal strings, but that is an implementation detail. Always compare strings with <code>==</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>str</code> and <code>bytes</code>?</summary><div class="qa-body"><code>str</code> is text, a sequence of Unicode code points. <code>bytes</code> is raw binary data, a sequence of integers from 0 to 255. You convert with <code>s.encode("utf-8")</code> and <code>b.decode("utf-8")</code>. Files opened in binary mode, network sockets and hashing functions work with bytes; Python never mixes the two silently, so <code>"a" + b"b"</code> raises <code>TypeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are Unicode, code points and UTF-8? What are <code>len("₹")</code> and <code>len("₹".encode())</code>?</summary><div class="qa-body">Unicode assigns every character a number, its code point; ₹ is U+20B9 (8377). UTF-8 is an encoding that stores each code point in 1 to 4 bytes, using 1 byte for ASCII. <code>len("₹")</code> is 1, because it is one code point, and <code>len("₹".encode())</code> is 3, because UTF-8 needs three bytes for it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A file shows <code>â‚¹</code> where <code>₹</code> should be. What happened, and how do you fix it?</summary><div class="qa-body">The file contains UTF-8 bytes (E2 82 B9 for ₹) that were decoded with a different codec, usually Windows-1252, which turned each byte into its own character. That is mojibake. Fix it by reading with <code>open(path, encoding="utf-8")</code>, or <code>"utf-8-sig"</code> for files saved by Excel. As a one-off repair, <code>s.encode("cp1252").decode("utf-8")</code> often reverses it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two strings look identical but <code>a == b</code> is False. Why?</summary><div class="qa-body">Common causes are invisible whitespace (a trailing space, a newline or a non-breaking space), different case, or different Unicode forms, such as "é" stored as one code point versus "e" plus a combining accent. Print <code>repr(a)</code> and <code>repr(b)</code> to see them, then normalise with <code>strip()</code>, <code>casefold()</code> and <code>unicodedata.normalize("NFC", s)</code> before comparing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>lower()</code> and <code>casefold()</code>?</summary><div class="qa-body">Both lowercase a string, but <code>casefold()</code> is more aggressive and is designed for case-insensitive comparison across languages. For example, the German "ß" stays "ß" with <code>lower()</code> but becomes "ss" with <code>casefold()</code>, so "STRASSE" and "straße" compare equal only after casefolding.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>str()</code> and <code>repr()</code>?</summary><div class="qa-body"><code>str()</code> gives a readable form for end users; <code>repr()</code> gives an unambiguous form for developers, usually valid Python. For a string, <code>str("hi\\n")</code> is the text itself with a real newline, while <code>repr</code> shows <code>'hi\\n'</code> with quotes and the escape. f-strings use <code>str</code> by default and <code>repr</code> with <code>!r</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Check whether a string is a palindrome, ignoring case and anything that is not a letter or digit.</summary><div class="qa-body">Clean, then compare with the reverse: <code>t = [c.lower() for c in s if c.isalnum()]</code>, then <code>t == t[::-1]</code>. That is O(n) time. An O(1)-memory alternative uses two indexes moving inwards from both ends, skipping characters that are not alphanumeric.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Check whether two strings are anagrams. Find the first non-repeating character.</summary><div class="qa-body">Anagrams: <code>Counter(a) == Counter(b)</code>, O(n), or <code>sorted(a) == sorted(b)</code>, O(n log n). First non-repeating character: build <code>c = Counter(s)</code>, then return the first <code>ch</code> in <code>s</code> with <code>c[ch] == 1</code>. That is two passes, O(n) in total.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>re.match</code>, <code>re.search</code> and <code>re.fullmatch</code>?</summary><div class="qa-body"><code>re.match</code> only tries to match at the start of the string. <code>re.search</code> scans and returns the first match anywhere. <code>re.fullmatch</code> succeeds only if the entire string matches the pattern, which makes it the right choice for validating input such as phone numbers or ids. All three return a match object or <code>None</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are greedy and lazy quantifiers?</summary><div class="qa-body">Greedy quantifiers (<code>*</code>, <code>+</code>, <code>?</code>, <code>{m,n}</code>) match as much text as possible and then give back only what the rest of the pattern needs. Adding <code>?</code> makes them lazy, matching as little as possible. On "a,b,c", <code>(.+),</code> captures "a,b" but <code>(.+?),</code> captures "a". A negated class such as <code>[^,]+</code> is often clearer and faster than a lazy dot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why write regex patterns as raw strings?</summary><div class="qa-body">In a normal string literal Python processes backslash escapes first, so <code>"\\b"</code> becomes a backspace character and the regex engine never sees "word boundary". In a raw string, <code>r"\\b"</code>, the backslash is kept, so the pattern reaches <code>re</code> exactly as written.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use a regular expression?</summary><div class="qa-body">When a plain string method is clearer, such as <code>startswith</code>, <code>in</code>, <code>split</code> or <code>replace</code>. When the format has a real parser: <code>json</code>, <code>csv</code>, an HTML parser, <code>urllib.parse</code>, <code>datetime.strptime</code>. And when the pattern becomes unreadable; at that point a small hand-written parser is easier to maintain.</div></details>
</main>
`
});
