// notes/softeng/se_linux.js — Linux & Terminal
Object.assign(TOPIC_CONTENT, {
  "se_linux": `<main>
<h1>Linux &amp; Terminal</h1>
  <div class="where"><span>Software Engineering</span><span>Linux &amp; Terminal</span></div>
  <p class="lead">Almost every script, model and API you write will end up running on a Linux machine that you control only by typing: a cloud server, a GPU box, a Docker container. There is no mouse and no file explorer there, just a prompt waiting for a command. This note teaches the terminal from zero by following one small job all the way through: the chai stall's <code>sales_report.py</code> (released as <code>v1.0.0</code> in the <a class="xref" data-note="se_git">Git &amp; GitHub</a> note) has to run on a server every night, with nobody watching. Along the way we will move around the file system, read the week's sales sheets and logs, chain small tools together, decide who may read what, watch and stop running programs, configure them with environment variables, and finally write a safe script that a scheduler runs at 21:00. Every command shown with output was really run on a Linux machine standing in for the server, as the user <code>meera</code> (prompt <code>$</code>), her cousin <code>ravi</code> (prompt <code>ravi$</code>) and the administrator (prompt <code>root#</code>); <code>ssh</code> and <code>crontab</code> are not installed on that machine, so those commands are shown without output and explained instead.</p>

  <h2 id="sl-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linux &amp; Terminal</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Files and paths</div>
        <ul>
          <li>One tree starting at <code>/</code>; <code>~</code> is your home folder</li>
          <li>Absolute path starts with <code>/</code>; relative path starts where you are</li>
          <li><code>pwd</code>, <code>ls -la</code>, <code>cd</code>, <code>cp</code>, <code>mv</code>, <code>rm</code> (no undo), <code>head</code>, <code>wc -l</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streams and pipes</div>
        <ul>
          <li>stdin 0, stdout 1, stderr 2</li>
          <li><code>&gt;</code> overwrite, <code>&gt;&gt;</code> append, <code>2&gt;&amp;1</code> merge, <code>|</code> pipe (stdout only)</li>
          <li><code>grep | cut | sort | uniq -c | sort -rn</code> = count per group</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Permissions</div>
        <ul>
          <li>Owner / group / others, each with r w x</li>
          <li>r=4 w=2 x=1: 755 scripts, 644 files, 640 team-readable, 600 secrets</li>
          <li><code>chmod</code>, <code>chgrp</code>, <code>chown</code>, groups instead of 777</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Processes and environment</div>
        <ul>
          <li>Every running program is a process with a PID</li>
          <li><code>kill</code> = SIGTERM (can clean up), <code>kill -9</code> = SIGKILL (cannot)</li>
          <li>Exit code 0 = success; 128 + n = killed by signal n (130, 137, 143)</li>
          <li><code>export</code> passes variables to child programs; PATH is where commands are searched</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Automation</div>
        <ul>
          <li>Scripts start with <code>#!/usr/bin/env bash</code> and <code>set -euo pipefail</code></li>
          <li>SSH key pair: public key on the server, private key stays home (600)</li>
          <li>cron: <code>0 21 * * *</code>; tiny PATH, so use full paths and log everything</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why the Terminal</span><span class="rm-sub">why typed commands beat clicking on a server</span></div></div>
      <div class="rm-item rm-done" data-target="sl-fs"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Filesystem Tree and Paths</span><span class="rm-sub">where things live and how to move around</span></div></div>
      <div class="rm-item rm-done" data-target="sl-files"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Working with Files</span><span class="rm-sub">copy, move, delete, peek inside, count</span></div></div>
      <div class="rm-item rm-done" data-target="sl-pipe"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Streams, Redirection and Pipes</span><span class="rm-sub">where a program's output goes</span></div></div>
      <div class="rm-item rm-done" data-target="sl-text"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Text Tools on a Log</span><span class="rm-sub">grep, cut, sort, uniq, find, sed, awk</span></div></div>
      <div class="rm-item rm-done" data-target="sl-perm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Users, Groups and Permissions</span><span class="rm-sub">who may read, change or run a file</span></div></div>
      <div class="rm-item rm-done" data-target="sl-proc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Processes, Signals and Exit Codes</span><span class="rm-sub">watching and stopping running programs</span></div></div>
      <div class="rm-item rm-done" data-target="sl-env"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Environment Variables and PATH</span><span class="rm-sub">settings for programs, and "command not found"</span></div></div>
      <div class="rm-item rm-done" data-target="sl-bash"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Bash Scripts</span><span class="rm-sub">the nightly job as one safe program</span></div></div>
      <div class="rm-item rm-done" data-target="sl-ssh"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">SSH and Keys</span><span class="rm-sub">reaching the server safely from a laptop</span></div></div>
      <div class="rm-item rm-done" data-target="sl-cron"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Scheduling with cron</span><span class="rm-sub">run it every night at 21:00</span></div></div>
      <div class="rm-item rm-done" data-target="sl-res"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Disk and Memory</span><span class="rm-sub">why an unattended job dies</span></div></div>
      <div class="rm-item rm-done" data-target="sl-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the habits that delete files or hide failures</span></div></div>
      <div class="rm-item rm-done" data-target="sl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">commands, numbers and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="sl-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about Linux</span></div></div>
    </div>
  </div>

  <h2 id="sl-why"><span class="num">01</span>Why the Terminal</h2>
  <p>Today the chai stall's report is produced by hand. Every evening someone opens a laptop, finds the day's sheet in the Downloads folder, runs the script and types the total into WhatsApp. That works until the person is ill, the laptop is closed, or the owner asks for last week's numbers. Doing operations by clicking, sometimes called "click-ops", has three weaknesses. It cannot be repeated exactly, because every click is a fresh chance to pick the wrong file. It cannot be automated, because no program can click for you at 21:00. And it does not even exist on a server: a machine in a data centre has no screen, only a text connection.</p>
  <p>The way around all three is to give the computer typed instructions instead of clicks. A <strong>terminal</strong> is the window where you type text and read text back. Inside it runs a <strong>shell</strong>, the program that reads each line you type, works out what you mean, and starts the right programs; on most Linux servers the shell is <strong>bash</strong> (Macs use a very similar one called zsh). Each line you type is a <strong>command</strong>: the name of a program followed by <strong>arguments</strong>, which tell the program what to work on. Think of the difference between pointing at the way to a shop and writing the directions down. Pointing only works while you stand next to the person. Written directions can be copied, handed to a new helper, followed at midnight, and checked afterwards when something went wrong. Typed commands are written directions for a computer.</p>
  <p>Here is the report on the server, run on Monday's sheet. The first line is one command: the program <code>python3</code>, with two arguments, the script and the sheet. The second line runs the report for every sheet of the week in one go:</p>
<div class="fx" data-lang="text">$ python3 sales_report.py data/orders_2026-10-19.csv
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25
$ for f in data/orders_*.csv; do echo "$f -&gt; $(python3 sales_report.py "$f" 2&gt;/dev/null | head -n 1)"; done
data/orders_2026-10-13.csv -&gt; Total sales: ₹600 from 13 valid orders, rejected: 1
data/orders_2026-10-14.csv -&gt; Total sales: ₹675 from 15 valid orders, rejected: 2
data/orders_2026-10-15.csv -&gt; Total sales: ₹570 from 12 valid orders, rejected: 0
data/orders_2026-10-17.csv -&gt; Total sales: ₹760 from 18 valid orders, rejected: 4
data/orders_2026-10-18.csv -&gt; Total sales: ₹1200 from 18 valid orders, rejected: 1
data/orders_2026-10-19.csv -&gt; Total sales: ₹230 from 6 valid orders, rejected: 3</div>
  <p>The first command printed exactly what the laptop used to show: three warnings about bad rows, then the total of ₹230 and revenue per item. The second line is a small loop that we will take apart in later sections; for now notice what it achieved. It ran the report for six days, threw away the warnings, kept only the first line of each result, and printed one tidy summary per day, all from a single line of text. Because it is text, it can be saved in a file, run again tomorrow, and run by a scheduler while everyone is asleep. That is the whole reason to learn the terminal, and the rest of this note builds that line, and the nightly job around it, one idea at a time.</p>
  <p>One warning before we start: the shell does exactly what you type, immediately, with all of your permissions, and it rarely asks "are you sure?". Read every command before pressing Enter, especially one copied from the internet, and be extra careful with anything containing <code>rm</code> (delete) or <code>sudo</code> (run as administrator).</p>

  <h2 id="sl-fs"><span class="num">02</span>The Filesystem Tree and Paths</h2>
  <p>On a laptop you find files by opening folders in a window. On a server, after logging in, you see only a blinking cursor. Before you can run anything you need to know how files are arranged, where you are right now, and how to move. (How a disk stores files underneath is covered in <a class="xref" data-note="cf_storage">Storage &amp; File Systems</a>; here we only need the view from the shell.)</p>
  <p>Linux keeps every file in a single <strong>filesystem tree</strong>: one upside-down tree of folders, which Linux calls <strong>directories</strong>, starting from a single top directory called the <strong>root</strong> and written <code>/</code>. There are no drive letters like <code>C:</code> or <code>D:</code>; a second disk is simply attached ("mounted") at some directory inside the tree. A few top-level directories have fixed jobs: <code>/etc</code> holds configuration, <code>/home</code> holds one home directory per user, <code>/var/log</code> holds system logs, <code>/usr</code> holds installed programs, <code>/tmp</code> is scratch space, and <code>/srv</code> is a conventional place for data a server provides. Your own home directory, <code>/home/meera</code> for Meera, has the shortcut <code>~</code>.</p>
  <figure class="viz"><svg viewBox="0 0 600 180" width="600">
    <g stroke="currentColor" fill="none" stroke-width="1.2">
      <line x1="300" y1="38" x2="60" y2="70"/><line x1="300" y1="38" x2="160" y2="70"/><line x1="300" y1="38" x2="260" y2="70"/><line x1="300" y1="38" x2="350" y2="70"/><line x1="300" y1="38" x2="440" y2="70"/><line x1="300" y1="38" x2="535" y2="70"/>
      <line x1="160" y1="96" x2="160" y2="120"/>
    </g>
    <rect x="270" y="10" width="60" height="28" rx="6" class="fg sg"/><text x="300" y="29" text-anchor="middle">/</text>
    <rect x="25" y="70" width="70" height="26" rx="6" class="fb"/><text x="60" y="88" text-anchor="middle">/etc</text>
    <rect x="120" y="70" width="80" height="26" rx="6" class="fb"/><text x="160" y="88" text-anchor="middle">/home</text>
    <rect x="225" y="70" width="70" height="26" rx="6" class="fb"/><text x="260" y="88" text-anchor="middle">/var</text>
    <rect x="315" y="70" width="70" height="26" rx="6" class="fb"/><text x="350" y="88" text-anchor="middle">/srv</text>
    <rect x="405" y="70" width="70" height="26" rx="6" class="fb"/><text x="440" y="88" text-anchor="middle">/usr</text>
    <rect x="500" y="70" width="70" height="26" rx="6" class="fb"/><text x="535" y="88" text-anchor="middle">/tmp</text>
    <rect x="90" y="120" width="140" height="26" rx="6" class="ft st"/><text x="160" y="138" text-anchor="middle">/home/meera (~)</text>
    <text x="160" y="166" text-anchor="middle" class="tm">~/chai-report: data/, logs/</text>
    <text x="60" y="114" text-anchor="middle" class="tm">config</text>
    <text x="260" y="114" text-anchor="middle" class="tm">logs</text>
    <text x="350" y="114" text-anchor="middle" class="tm">git repo, shared data</text>
    <text x="440" y="114" text-anchor="middle" class="tm">programs</text>
    <text x="535" y="114" text-anchor="middle" class="tm">scratch</text>
  </svg><figcaption>One tree starting at /. Meera's project lives under her home directory; the shared Git repository and shared files live under /srv.</figcaption></figure>
  <p>The address of a file in this tree is its <strong>path</strong>. An <strong>absolute path</strong> starts with <code>/</code> and spells out every directory from the root, so it works no matter where you are: <code>/home/meera/chai-report/data/orders_2026-10-19.csv</code>. A <strong>relative path</strong> does not start with <code>/</code>; it is read starting from the directory you are currently in. That directory is called the <strong>working directory</strong>, and the shell always has one. If you are in <code>/home/meera/chai-report</code>, the same file is simply <code>data/orders_2026-10-19.csv</code>. Two special names help with relative paths: <code>.</code> means "this directory" and <code>..</code> means "the directory one level up". It is the difference between a full postal address, which any courier in the country can follow, and "two lanes left from the chai stall", which only works if you are standing at the chai stall.</p>
  <p>Three commands do all the moving around: <code>pwd</code> ("print working directory") tells you where you are, <code>ls</code> ("list") shows what is in a directory, and <code>cd</code> ("change directory") moves you. Here is Meera's first look at the server:</p>
<div class="fx" data-lang="text">$ pwd
/home/meera
$ ls
chai-report
$ cd chai-report
$ pwd
/home/meera/chai-report
$ ls
CHANGELOG.md  README.md  data  logs  sales_report.py  sample_orders.csv
$ ls -la
total 40
drwxrwxr-x 5 meera meera 4096 Oct 19 21:30 .
drwxr-x--- 3 meera meera 4096 Oct 19 21:30 ..
drwxrwxr-x 8 meera meera 4096 Oct 19 21:30 .git
-rw-rw-r-- 1 meera meera   37 Oct 19 21:30 .gitignore
-rw-rw-r-- 1 meera meera   75 Oct 19 21:30 CHANGELOG.md
-rw-rw-r-- 1 meera meera  220 Oct 19 21:30 README.md
drwxrwxr-x 2 meera meera 4096 Oct 19 21:30 data
drwxrwxr-x 2 meera meera 4096 Oct 19 21:30 logs
-rw-rw-r-- 1 meera meera 1097 Oct 19 21:30 sales_report.py
-rw-rw-r-- 1 meera meera  353 Oct 19 21:30 sample_orders.csv
$ ls data
orders_2026-10-13.csv  orders_2026-10-15.csv  orders_2026-10-18.csv
orders_2026-10-14.csv  orders_2026-10-17.csv  orders_2026-10-19.csv
$ cd data
$ pwd
/home/meera/chai-report/data
$ cd ..
$ pwd
/home/meera/chai-report
$ cd /var/log
$ pwd
/var/log
$ cd -
/home/meera/chai-report
$ cd ~
$ pwd
/home/meera
$ ls /
bin		     dev   lib.usr-is-merged  mnt	proc  srv  var
bin.usr-is-merged    etc   lib64	      nix	root  sys
boot		     home  lost+found	      old_root	run   tmp
container_info.json  lib   media	      opt	sbin  usr
$ cd chai-report</div>
  <p>Read it top to bottom. After logging in Meera starts in her home directory, <code>/home/meera</code>, which contains one directory, <code>chai-report</code>, the project cloned from Git. <code>cd chai-report</code> is a relative path, so it moved her one level down, and <code>pwd</code> confirms the new location. Plain <code>ls</code> shows six names, but <code>ls -la</code> shows more. The letters after the dash are <strong>options</strong> (also called flags), small switches that change what a command does: <code>-l</code> asks for the long format and <code>-a</code> asks for all files. "All" matters because names that start with a dot, such as <code>.git</code> and <code>.gitignore</code>, are <strong>hidden files</strong>: <code>ls</code> skips them unless asked, which keeps configuration out of the way. The long format shows, from left to right, the permissions (a leading <code>d</code> means directory; section 06 decodes the rest), the owner <code>meera</code>, the group <code>meera</code>, the size in bytes, the last-modified time and the name. The entries <code>.</code> and <code>..</code> appear in every directory, which is exactly why <code>cd ..</code> works.</p>
  <p>The rest of the session moves around. <code>cd ..</code> went up one level, <code>cd /var/log</code> jumped across the tree with an absolute path, <code>cd -</code> jumped back to the previous directory (and printed where it landed), and <code>cd ~</code> went home. <code>ls /</code> lists the top of the tree. Most of the names are the standard directories described above; a few, such as <code>nix</code> and <code>container_info.json</code>, exist only because this particular machine is a sandbox. Two habits will save you trouble. Names are case-sensitive, so <code>Data</code> and <code>data</code> are different directories. And spaces separate arguments, so a name containing a space must be quoted, <code>cd "my data"</code>, which is why server files are usually named in lower case with <code>_</code> or <code>-</code>. Finally, press Tab while typing a path: the shell completes the name for you, which is faster and avoids typos.</p>

  <h2 id="sl-files"><span class="num">03</span>Working with Files</h2>
  <p>Now that we can find files, we need to do things with them: keep a backup of Monday's sheet before anyone edits it, rename the copy, delete it when done, and look inside a sheet without opening a spreadsheet program. Linux does not have one big program for this. It has many small ones, each doing one job well, like a kitchen with a separate knife, grater and measuring cup instead of one machine that does everything. Learning a dozen of these tools is most of everyday terminal work.</p>
  <p>To create directories there is <code>mkdir</code> ("make directory"); its <code>-p</code> option creates any missing parent directories too and does not complain if the directory already exists. <code>cp</code> copies a file (add <code>-r</code>, "recursive", to copy a whole directory), and <code>mv</code> moves a file, which is also how you rename one, since renaming is just moving to a new name in the same place. <code>rm</code> removes a file, and <code>rm -r</code> removes a directory with everything inside it. To look inside a file, <code>cat</code> prints all of it, <code>head -n 3</code> prints the first three lines, <code>tail -n 2</code> the last two, and <code>less</code> lets you scroll through a long file (press <code>q</code> to quit). <code>wc -l</code> ("word count, lines") counts lines. Every command explains itself with <code>--help</code> or the manual page, <code>man wc</code>.</p>
  <p>The session below first shows where the project came from: <code>git clone</code> copies the whole project out of the shared Git repository on the server, here into a throwaway directory that is then deleted again. Then it backs up Monday's sheet, renames the copy, deletes it, and inspects the real sheet:</p>
<div class="fx" data-lang="text">$ git clone -q --branch v1.0.0 /srv/git/chai-report.git ~/chai-report-test
$ ls ~
chai-report  chai-report-test
$ rm -rf ~/chai-report-test
$ ls ~
chai-report
$ mkdir -p backups/2026-10
$ cp data/orders_2026-10-19.csv backups/2026-10/
$ mv backups/2026-10/orders_2026-10-19.csv backups/2026-10/monday.csv
$ ls backups/2026-10
monday.csv
$ rm -r backups
$ head -n 3 data/orders_2026-10-19.csv
order_id,time,customer,item,qty,price,note
1,08:05,Asha,masala chai,2,20,
2,08:12,Ben,samosa,3,15,"extra chutney, no onion"
$ tail -n 2 data/orders_2026-10-19.csv
8,09:10,Farid,cold coffee,1,,
9,09:20,Gita,masala chai,-1,20,refund?
$ wc -l data/orders_2026-10-19.csv
10 data/orders_2026-10-19.csv
$ wc -l data/*.csv
  15 data/orders_2026-10-13.csv
  18 data/orders_2026-10-14.csv
  13 data/orders_2026-10-15.csv
  23 data/orders_2026-10-17.csv
  20 data/orders_2026-10-18.csv
  10 data/orders_2026-10-19.csv
  99 total
$ cat README.md
# chai-report

Daily sales report for the chai stall.

    python3 sales_report.py ORDERS.csv

Prints total sales, valid and rejected orders, the top item and
revenue per item. Rows with a bad qty or price are rejected.
$ wc --help | head -n 3
Usage: wc [OPTION]... [FILE]...
  or:  wc [OPTION]... --files0-from=F
Print newline, word, and byte counts for each FILE, and a total line if</div>
  <p><code>git clone --branch v1.0.0</code> created a complete second copy of the project at the released version (Git itself is the subject of <a class="xref" data-note="se_git">Git &amp; GitHub</a>), and <code>rm -rf</code> deleted that whole directory without a word: <code>-r</code> to go into directories, <code>-f</code> ("force") to never ask. <code>mkdir -p</code> made two nested directories at once, <code>cp</code> copied the sheet into them, <code>mv</code> renamed the copy to <code>monday.csv</code>, and <code>rm -r</code> removed the backup directory and its contents. Notice that none of these commands printed anything when they succeeded. That is a Linux tradition: silence means success, and only problems are reported.</p>
  <p>The inspection commands show what the sheet looks like without opening it. <code>head -n 3</code> shows the header row and the first two orders; Ben's note contains a comma, so it is wrapped in quotes, which will matter in section 05. <code>tail -n 2</code> shows the last two orders, Farid's missing price and Gita's negative quantity, two of the three rows the report rejects. <code>wc -l</code> counts 10 lines, which is 9 orders plus the header, and when given several files it also prints a total, 99 lines for the whole week. <code>cat</code> printed the short README in full. That is fine for small files, but never <code>cat</code> a multi-gigabyte log: it would flood your screen for minutes. Use <code>head</code>, <code>tail</code> or <code>less</code> instead, and <code>tail -f logfile</code> to keep printing new lines as a log grows.</p>
  <p>The most important thing to remember from this section is that <code>rm</code> has no recycle bin. A deleted file is gone, immediately and permanently. Before deleting with a pattern or a path you typed by hand, run <code>ls</code> with exactly the same path first and check that it lists what you expect.</p>

  <h2 id="sl-pipe"><span class="num">04</span>Streams, Redirection and Pipes</h2>
  <p>The report prints two different kinds of text. The summary is meant for the owner; the WARN lines are meant for us, the people maintaining the data. On the screen they appear mixed together, but often we want them apart: the summary saved in a file, the warnings in another file or thrown away. And often we want one tool's output fed straight into another tool, as the loop in section 01 did with <code>head</code>. To do any of this we need to understand where a program's output actually goes.</p>
  <p>Every program on Linux starts with three <strong>streams</strong>, numbered channels for text. <strong>Standard input</strong> (stdin, number 0) is where it reads input from. <strong>Standard output</strong> (stdout, number 1) is where it writes its normal results; our summary goes there. <strong>Standard error</strong> (stderr, number 2) is a separate channel for warnings and errors; <code>sales_report.py</code> writes its WARN lines there on purpose, using <code>print(..., file=sys.stderr)</code>. These numbers are called <strong>file descriptors</strong>. By default all three are connected to your terminal, which is why the two kinds of output look mixed. The shell lets you reconnect them before the program starts. A <strong>redirect</strong> connects a stream to a file, and a <strong>pipe</strong>, written <code>|</code>, connects the stdout of one program to the stdin of the next.</p>
  <figure class="viz"><svg viewBox="0 0 620 150" width="620">
    <defs><marker id="sl-arr-stream" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="50" width="70" height="40" rx="8" class="fs"/><text x="45" y="75" text-anchor="middle" font-size="11">sheet.csv</text>
    <rect x="160" y="45" width="150" height="50" rx="8" class="fb sb"/><text x="235" y="67" text-anchor="middle" font-size="11.5">sales_report.py</text><text x="235" y="84" text-anchor="middle" class="tm" font-size="10">reads the file</text>
    <rect x="420" y="15" width="190" height="40" rx="8" class="fg sg"/><text x="515" y="33" text-anchor="middle" font-size="11">stdout (1): Total sales…</text><text x="515" y="48" text-anchor="middle" class="tm" font-size="9.5">&gt; out.txt  or  | head</text>
    <rect x="420" y="85" width="190" height="40" rx="8" class="fr sr"/><text x="515" y="103" text-anchor="middle" font-size="11">stderr (2): WARN line 8…</text><text x="515" y="118" text-anchor="middle" class="tm" font-size="9.5">2&gt; warnings.txt  or  2&gt;/dev/null</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="82" y1="70" x2="156" y2="70" marker-end="url(#sl-arr-stream)"/><line x1="312" y1="60" x2="416" y2="38" marker-end="url(#sl-arr-stream)"/><line x1="312" y1="82" x2="416" y2="104" marker-end="url(#sl-arr-stream)"/></g>
    <text x="120" y="62" text-anchor="middle" class="tm" font-size="10">argument</text>
    <text x="300" y="142" text-anchor="middle" class="tm">2&gt;&amp;1 = "send stream 2 wherever stream 1 is going"</text>
  </svg><figcaption>The report has two output streams. Redirects and pipes decide where each one ends up.</figcaption></figure>
  <p>The figure shows the report as a machine with two outlets, a bit like a sugarcane juice stall that produces juice from one spout and crushed waste from another. A redirect is a container under a spout: <code>&gt; out.txt</code> catches stdout in a file (emptying the file first), <code>&gt;&gt;</code> appends to the end instead, <code>2&gt; warnings.txt</code> catches stderr, and <code>2&gt;&amp;1</code> means "send stream 2 to wherever stream 1 is currently going", so both end up in one place. <code>/dev/null</code> is a special file that throws away everything written to it, the bin under the waste spout. A pipe is a tube from one spout straight into the next machine. Let us try each one on Monday's sheet:</p>
<div class="fx" data-lang="text">$ python3 sales_report.py data/orders_2026-10-19.csv &gt; out.txt
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
$ cat out.txt
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25
$ python3 sales_report.py data/orders_2026-10-19.csv 2&gt; warnings.txt
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25
$ cat warnings.txt
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
$ python3 sales_report.py data/orders_2026-10-19.csv &gt; report.txt 2&gt;&amp;1
$ wc -l report.txt
9 report.txt
$ echo "checked by Meera" &gt;&gt; report.txt
$ tail -n 2 report.txt
  ginger chai  ₹25
checked by Meera
$ python3 sales_report.py data/orders_2026-10-19.csv 2&gt;/dev/null | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ python3 sales_report.py data/orders_2026-10-19.csv | grep -c WARN
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
0
$ python3 sales_report.py data/orders_2026-10-19.csv 2&gt;&amp;1 | grep -c WARN
3
$ wc -l &lt; data/orders_2026-10-19.csv
10
$ cp data/orders_2026-10-19.csv copy.csv
$ sort copy.csv &gt; copy.csv
$ wc -l copy.csv
0 copy.csv
$ rm out.txt warnings.txt report.txt copy.csv</div>
  <p>Follow where each stream went. With <code>&gt; out.txt</code>, stdout went into the file, so the only thing left on the screen was the three WARN lines on stderr, and <code>cat out.txt</code> shows the six-line summary safely in the file. With <code>2&gt; warnings.txt</code> it was the other way round: the summary on screen, the warnings in the file. With <code>&gt; report.txt 2&gt;&amp;1</code> nothing appeared on screen at all, and the file holds all 9 lines. The order matters here, because redirects are applied left to right: first stdout is pointed at the file, then stderr is pointed at "wherever stdout goes", which is now the file. Written the other way round, <code>2&gt;&amp;1 &gt; report.txt</code>, stderr would be copied while stdout still pointed at the screen. <code>&gt;&gt;</code> then added "checked by Meera" to the end instead of replacing the file.</p>
  <p>The two <code>grep -c WARN</code> lines (<code>grep</code> keeps lines containing a word, <code>-c</code> counts them) show the most common surprise with pipes. Without <code>2&gt;&amp;1</code>, the WARN lines still appeared on the screen and grep counted 0, because <strong>a pipe carries only stdout</strong>: the warnings travelled on stderr, went around the pipe and straight to the terminal. Merging stderr into stdout first gave the correct count of 3. <code>wc -l &lt; file</code> uses <code>&lt;</code> to feed a file into stdin; wc reads it without knowing its name, so it prints only the number. Finally, the trap: <code>sort copy.csv &gt; copy.csv</code> left an empty file. The shell sets up the redirect, which empties <code>copy.csv</code>, before <code>sort</code> even starts, so sort reads an empty file. Never redirect a command's output onto its own input; write to a new name and <code>mv</code> it over afterwards.</p>
  <p>A <strong>pipeline</strong>, several commands joined with <code>|</code>, is more than a convenience. All the commands start at the same time and data flows through them in small pieces, so a pipeline can process a 5 GB log without ever holding it all in memory. The next section uses that power to answer real questions.</p>

  <h2 id="sl-text"><span class="num">05</span>Text Tools on a Log</h2>
  <p>For a week the nightly job (we will write it in section 09) has been appending its output to <code>logs/report.log</code>, with each line prefixed by its date. The owner has questions: how many rows were rejected this week, on which days, for what reasons, and what were total sales? On a laptop you might open the file in Excel. On a server, you combine small text tools in a pipeline, each doing one step, much as a SQL query combines filtering, grouping and sorting.</p>
  <p>Five tools cover most questions. <code>grep PATTERN</code> keeps only the lines that match a pattern (<code>-c</code> counts them, <code>-v</code> keeps the non-matching ones, <code>-o</code> prints only the matching part, <code>-r</code> searches every file under a directory and <code>-n</code> adds line numbers). <code>cut</code> cuts columns out of each line: <code>-d' '</code> says the columns are separated by spaces and <code>-f1</code> picks the first. <code>sort</code> puts lines in order (<code>-n</code> numerically, <code>-r</code> reversed). <code>uniq -c</code> collapses runs of identical neighbouring lines into one line with a count in front. And <code>wc -l</code> counts lines. Think of counting a jar of mixed coins: pick out the coins (grep), look only at their value (cut), arrange equal coins next to each other (sort), count each pile (uniq -c), and put the biggest pile first (sort -rn).</p>
<div class="fx" data-lang="text">$ wc -l logs/report.log
57 logs/report.log
$ head -n 9 logs/report.log
2026-10-13 WARN line 7: bad number qty='one' price='25'
2026-10-13 Total sales: ₹600 from 13 valid orders, rejected: 1
2026-10-13 top item: cold coffee (7 sold)
2026-10-13   cold coffee  ₹280
2026-10-13   masala chai  ₹120
2026-10-13   bun maska    ₹90
2026-10-13   samosa       ₹60
2026-10-13   ginger chai  ₹50
2026-10-13 DONE
$ grep -c WARN logs/report.log
11
$ grep ERROR logs/report.log
2026-10-16 ERROR no sheet: /home/meera/chai-report/data/orders_2026-10-16.csv
$ grep WARN logs/report.log | head -n 3
2026-10-13 WARN line 7: bad number qty='one' price='25'
2026-10-14 WARN line 13: qty -1 is not positive
2026-10-14 WARN line 16: bad number qty='1' price=''
$ grep WARN logs/report.log | cut -d' ' -f1
2026-10-13
2026-10-14
2026-10-14
2026-10-17
2026-10-17
2026-10-17
2026-10-17
2026-10-18
2026-10-19
2026-10-19
2026-10-19
$ grep WARN logs/report.log | cut -d' ' -f1 | sort | uniq -c | sort -rn
      4 2026-10-17
      3 2026-10-19
      2 2026-10-14
      1 2026-10-18
      1 2026-10-13
$ grep -o 'bad number\\|not positive' logs/report.log | sort | uniq -c
      7 bad number
      4 not positive
$ grep 'Total sales' logs/report.log | sed 's/.*₹\\([0-9]*\\) .*/\\1/'
600
675
570
760
1200
230
$ grep 'Total sales' logs/report.log | sed 's/.*₹\\([0-9]*\\) .*/\\1/' | awk '{s += $1} END {print "week total: ₹" s}'
week total: ₹4035
$ tail -q -n +2 data/orders_*.csv | cut -d, -f4 | sort | uniq -c | sort -rn
     21 cold coffee
     19 ginger chai
     19 bun maska
     18 samosa
     16 masala chai
$ tail -q -n +2 data/orders_*.csv | cut -d, -f4 | uniq -c | head -n 4
      1 ginger chai
      2 cold coffee
      2 bun maska
      1 ginger chai
$ cut -d, -f7 data/orders_2026-10-19.csv | head -n 3
note

"extra chutney
$ find ~/chai-report -name "*.csv"
/home/meera/chai-report/data/orders_2026-10-15.csv
/home/meera/chai-report/data/orders_2026-10-13.csv
/home/meera/chai-report/data/orders_2026-10-17.csv
/home/meera/chai-report/data/orders_2026-10-14.csv
/home/meera/chai-report/data/orders_2026-10-18.csv
/home/meera/chai-report/data/orders_2026-10-19.csv
/home/meera/chai-report/sample_orders.csv
$ find data -name "orders_*.csv" -newer data/orders_2026-10-15.csv
data/orders_2026-10-17.csv
data/orders_2026-10-18.csv
data/orders_2026-10-19.csv
$ find ~ -name "*.log" -size +1k
/home/meera/chai-report/logs/report.log
$ grep -rn "sys.exit" --include="*.py" ~/chai-report
/home/meera/chai-report/sales_report.py:7:    sys.exit(2)</div>
  <p>The log has 57 lines, and <code>head</code> shows the pattern: for each day, the WARN lines, the summary, the item lines and a DONE marker. <code>grep -c WARN</code> answers the first question, 11 rejected rows in the week, and <code>grep ERROR</code> finds the one day with no sheet at all (the stall was closed on the 16th). The next command is built up in two steps so you can watch the pipeline work. <code>grep WARN | cut -d' ' -f1</code> keeps the WARN lines and then only their first space-separated field, the date, giving 11 dates. Adding <code>sort | uniq -c | sort -rn</code> groups equal dates, counts each group and puts the biggest first: the 17th had the most rejections (4), then Monday the 19th (3). In SQL this would be <code>SELECT day, COUNT(*) ... GROUP BY day ORDER BY 2 DESC</code>. <code>grep -o</code> pulled out only the reason text from each line, and counting those shows 7 "bad number" problems and 4 "not positive" ones.</p>
  <p>For money we need two more tools. <code>sed</code> ("stream editor") edits each line as it passes; <code>s/old/new/</code> substitutes text, and here the pattern <code>.*₹\\([0-9]*\\) .*</code> matches a whole "Total sales" line while capturing the digits after ₹, and <code>\\1</code> replaces the line with just those digits. <code>awk</code> runs a tiny program on every line: <code>{s += $1}</code> adds the first field to a running total and <code>END {print ...}</code> prints it after the last line. Together they give the week's total, ₹4035. The same tools work directly on the CSV sheets: <code>tail -q -n +2</code> prints every sheet from line 2 onwards (skipping the header, <code>-q</code> to omit file names), <code>cut -d, -f4</code> keeps the item column, and the count shows cold coffee appearing on the most order rows.</p>
  <p>Two traps appear in the output for real. Running <code>uniq -c</code> without sorting first produced several small groups for the same item, such as "ginger chai" counted twice, because uniq only merges <em>neighbouring</em> identical lines. Always <code>sort</code> before <code>uniq</code>. And <code>cut -d, -f7</code> on the note column split Ben's quoted <code>"extra chutney, no onion"</code> at its comma, because these tools know nothing about CSV quoting. Shell pipelines are perfect for logs and quick questions on simple columns; for real analysis of CSV files, use Python and pandas.</p>
  <p>The last three commands search for files rather than inside them. <code>find</code> walks a directory tree and prints every file that passes its tests: <code>-name "*.csv"</code> matches a name pattern, <code>-newer FILE</code> keeps files modified after that file (the sheets after the 15th), and <code>-size +1k</code> keeps files larger than 1 KB. <code>grep -rn</code> searched every <code>.py</code> file under the project and printed the file, line number and line where <code>sys.exit</code> appears, which is the quickest way to find where something is used in an unfamiliar codebase.</p>

  <h2 id="sl-perm"><span class="num">06</span>Users, Groups and Permissions</h2>
  <p>A server is usually shared, which raises two problems with a single cause. A helper script copied onto the server refuses to run with "Permission denied". And the stall needs Ravi to be able to read the sales sheets for his own analysis, without being able to change them, while the database password in Meera's settings file stays private to her. Something has to decide who may read, change or run each file. (The operating system's side of this, how the kernel checks every file access, is in <a class="xref" data-note="cf_os">Operating Systems</a>.)</p>
  <p>Linux decides with <strong>permissions</strong>. Every person who uses the machine is a <strong>user</strong>, and users can be placed in <strong>groups</strong>, named sets of users such as a team. Every file has one owning user and one owning group. Permissions then answer three questions (may you <strong>r</strong>ead it, <strong>w</strong>rite to it, or e<strong>x</strong>ecute it as a program?) separately for three kinds of people: the file's owner, members of the file's group, and everyone else, called "others". Think of a housing society. You can do anything in your own flat, the society committee may read the notice you pinned on the board but not change it, and visitors cannot see it at all.</p>
  <p><code>ls -l</code> shows the permissions as ten characters, such as <code>-rw-r-----</code>. The first character is the type (<code>-</code> for a file, <code>d</code> for a directory). Then come three groups of three: <code>rw-</code> for the owner, <code>r--</code> for the group and <code>---</code> for others, where a dash means "not allowed". Because each group has exactly three yes/no switches, it is often written as a single digit by giving each letter a value, r = 4, w = 2 and x = 1, and adding them up. So <code>rw-</code> is 4 + 2 = 6, <code>r--</code> is 4, <code>---</code> is 0, and <code>-rw-r-----</code> is <strong>640</strong>. A handful of combinations cover almost all real use:</p>
  <table class="tbl">
    <tr><th>ls -l shows</th><th>Number</th><th>Meaning</th><th>Typical use</th></tr>
    <tr><td><code>-rwxr-xr-x</code></td><td>755</td><td>owner does everything, everyone may read and run</td><td>scripts, programs, directories</td></tr>
    <tr><td><code>-rw-r--r--</code></td><td>644</td><td>owner reads and writes, everyone reads</td><td>ordinary files</td></tr>
    <tr><td><code>-rw-rw-r--</code></td><td>664</td><td>owner and group write, others read</td><td>new files on Ubuntu, by default</td></tr>
    <tr><td><code>-rw-r-----</code></td><td>640</td><td>owner writes, group reads, others nothing</td><td>data a team may read</td></tr>
    <tr><td><code>-rw-------</code></td><td>600</td><td>only the owner, read and write</td><td>passwords, SSH keys</td></tr>
  </table>
  <p>The command that changes permissions is <code>chmod</code> ("change mode"). It accepts either the number, <code>chmod 640 file</code>, or a symbolic form that adds or removes individual letters: <code>u</code>, <code>g</code> and <code>o</code> stand for user (owner), group and others, so <code>chmod +x</code> adds execute for everyone and <code>chmod g-w,o-rx</code> removes write from the group and read and execute from others. Here is Meera fixing the helper script and protecting her settings file:</p>
<div class="fx" data-lang="text">$ ls -l
total 24
-rw-rw-r-- 1 meera meera   75 Oct 19 21:30 CHANGELOG.md
-rw-rw-r-- 1 meera meera  220 Oct 19 21:30 README.md
drwxrwxr-x 2 meera meera 4096 Oct 19 21:30 data
drwxrwxr-x 2 meera meera 4096 Oct 19 21:30 logs
-rw-rw-r-- 1 meera meera 1097 Oct 19 21:30 sales_report.py
-rw-rw-r-- 1 meera meera  353 Oct 19 21:30 sample_orders.csv
$ cp /srv/tools/monday.sh .
$ cat monday.sh
#!/usr/bin/env bash
python3 ~/chai-report/sales_report.py ~/chai-report/data/orders_2026-10-19.csv
$ ls -l monday.sh
-rw-r--r-- 1 meera meera 99 Nov 19 05:52 monday.sh
$ ./monday.sh
bash: ./monday.sh: Permission denied
$ chmod +x monday.sh
$ ls -l monday.sh
-rwxr-xr-x 1 meera meera 99 Nov 19 05:52 monday.sh
$ ./monday.sh 2&gt;/dev/null | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ echo "DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall" &gt; .env
$ ls -l .env
-rw-rw-r-- 1 meera meera 57 Nov 19 05:52 .env
$ chmod 600 .env
$ ls -l .env
-rw------- 1 meera meera 57 Nov 19 05:52 .env
$ stat -c '%A %a %U:%G %n' monday.sh .env sales_report.py
-rwxr-xr-x 755 meera:meera monday.sh
-rw------- 600 meera:meera .env
-rw-rw-r-- 664 meera:meera sales_report.py
$ chmod g-w,o-rx monday.sh
$ ls -l monday.sh
-rwxr-x--- 1 meera meera 99 Nov 19 05:52 monday.sh
$ chmod 755 monday.sh
$ ls -ld ~
drwxr-x--- 3 meera meera 4096 Nov 19 05:52 /home/meera</div>
  <p><code>monday.sh</code> arrived as <code>-rw-r--r--</code>: nobody had the x permission, so the shell refused to run it with "Permission denied". <code>chmod +x</code> turned it into <code>-rwxr-xr-x</code> (755) and it ran. Meera then created a <code>.env</code> file holding a database password. On Ubuntu a new file gets <code>-rw-rw-r--</code> by default, which means every user on the machine could read the password; <code>chmod 600</code> made it owner-only. <code>stat</code> prints the letters and the number side by side, which is a good way to check your decoding. The symbolic <code>chmod g-w,o-rx</code> took away exactly the letters named. Finally, Meera's home directory is <code>drwxr-x---</code>, so others cannot even enter it.</p>
  <p>For directories the three letters mean slightly different things, and the difference matters for sharing. r on a directory lets you list the names inside, w lets you create, rename and delete entries inside it, and x lets you enter it and reach the files within. So deleting a file is controlled by the <em>directory's</em> w, not the file's. To share the sheets with Ravi without opening Meera's home, the administrator, the special user <strong>root</strong> who bypasses all permission checks, creates a shared directory owned by Meera and the group <code>stall</code>. <code>chown</code> ("change owner") sets the owning user and group and needs root; <code>chgrp</code> changes only the group and can be used by the owner; <code>id</code> shows who you are and which groups you belong to.</p>
<div class="fx" data-lang="text">root# mkdir /srv/stall-data
root# chown meera:stall /srv/stall-data
root# chmod 750 /srv/stall-data
root# ls -ld /srv/stall-data
drwxr-x--- 2 meera stall 4096 Nov 19 05:52 /srv/stall-data
$ id
uid=1001(meera) gid=1001(meera) groups=1001(meera),1003(stall)
$ cp data/orders_2026-10-19.csv /srv/stall-data/
$ chmod 640 /srv/stall-data/orders_2026-10-19.csv
$ ls -l /srv/stall-data
total 4
-rw-r----- 1 meera meera 353 Nov 19 05:52 orders_2026-10-19.csv
$ chgrp stall /srv/stall-data/orders_2026-10-19.csv
$ ls -l /srv/stall-data
total 4
-rw-r----- 1 meera stall 353 Nov 19 05:52 orders_2026-10-19.csv
ravi$ id
uid=1002(ravi) gid=1002(ravi) groups=1002(ravi)
ravi$ head -n 2 /srv/stall-data/orders_2026-10-19.csv
head: cannot open '/srv/stall-data/orders_2026-10-19.csv' for reading: Permission denied
ravi$ ls /home/meera
ls: cannot open directory '/home/meera': Permission denied
root# usermod -aG stall ravi
root# id ravi
uid=1002(ravi) gid=1002(ravi) groups=1002(ravi),1003(stall)
ravi$ id
uid=1002(ravi) gid=1002(ravi) groups=1002(ravi)
ravi$ id
uid=1002(ravi) gid=1002(ravi) groups=1002(ravi),1003(stall)
ravi$ head -n 2 /srv/stall-data/orders_2026-10-19.csv
order_id,time,customer,item,qty,price,note
1,08:05,Asha,masala chai,2,20,
ravi$ echo "10,09:30,Ravi,samosa,1,15," &gt;&gt; /srv/stall-data/orders_2026-10-19.csv
bash: /srv/stall-data/orders_2026-10-19.csv: Permission denied
ravi$ rm -f /srv/stall-data/orders_2026-10-19.csv
rm: cannot remove '/srv/stall-data/orders_2026-10-19.csv': Permission denied</div>
  <p>Trace it slowly, because each line is one rule in action. The directory is <code>drwxr-x---</code> with owner meera and group stall, so stall members may enter and list it, but not create or delete anything in it. Meera, who is in <code>stall</code>, copied the sheet in and set 640. A new file belongs to its creator's main group, which for Meera is the group <code>meera</code>, so <code>chgrp stall</code> handed the file to the team. Ravi at first is in no shared group, so for this file he counts as "others" and has no rights at all: he could neither read the sheet nor list Meera's home. root then ran <code>usermod -aG stall ravi</code>, which adds Ravi to the group; <code>-a</code> means append, and forgetting it would replace all of Ravi's other groups. Notice that <code>id ravi</code> shows the new group immediately, but Ravi's already-running shell does not: groups are read when you log in. After logging in again, Ravi can read the sheet, but appending to it fails because the group has r and not w, and deleting it fails because the directory gives the group no w. That is exactly "the team can read the data; only the owner can change it".</p>
  <p>When you meet "Permission denied", resist the famous non-fix <code>chmod -R 777</code>, which gives everyone read, write and execute on everything, including your code and your secrets. Work out who needs which access and grant just that, usually through a group, as above.</p>

  <h2 id="sl-proc"><span class="num">07</span>Processes, Signals and Exit Codes</h2>
  <p>The stall wants a live board that recalculates the day's total every second, all day. Once it is started, we need to check that it is still running, see how much it uses, and stop it at closing time without losing its last total. We also need a way for any program to tell whoever started it whether it succeeded. All of that is about running programs rather than files.</p>
  <p>A program on disk is just a file. When you run it, the operating system creates a <strong>process</strong>: a running instance of the program with its own memory, its open files and a unique number called the <strong>PID</strong> (process ID). Every process is started by another process, its parent, whose number is the PPID; your shell is the parent of the commands you type. A command normally runs in the <strong>foreground</strong>, holding your terminal until it finishes. Adding <code>&amp;</code> at the end runs it in the <strong>background</strong> so you get the prompt back immediately, and the shell stores the new PID in the special variable <code>$!</code>. Long-running background processes that provide a service, such as a web server or a scheduler, are called <strong>daemons</strong>. (How the kernel schedules processes is covered in <a class="xref" data-note="cf_os">Operating Systems</a>.)</p>
  <p>To stop or otherwise poke a process you send it a <strong>signal</strong>, a small numbered message delivered by the kernel. Three signals matter most. <strong>SIGINT</strong> (2) is what Ctrl+C sends. <strong>SIGTERM</strong> (15) is a polite request to stop, and it is what the <code>kill</code> command sends by default. A program can catch SIGTERM and clean up first, for example finish writing a file. <strong>SIGKILL</strong> (9), sent by <code>kill -9</code>, cannot be caught at all: the kernel simply stops the process on the spot. It is the difference between a manager announcing "we close in five minutes", so staff finish the current bill and lock the till, and the power being cut mid-bill. Our live board catches SIGTERM to save its last total before exiting:</p>
<div class="fx" data-lang="py">import signal, sys, time

def total(path):
    t = 0
    with open(path) as f:
        next(f)                                   # skip the header line
        for line in f:
            qty, price = line.split(",")[4:6]
            if qty.isdigit() and price.isdigit():
                t += int(qty) * int(price)
    return t

def stop(signum, frame):                          # runs when SIGTERM arrives
    print(f"got signal {signum}, saving last total", flush=True)
    with open("last_total.txt", "w") as f:
        f.write(f"{total(sys.argv[1])}\\n")
    sys.exit(0)

signal.signal(signal.SIGTERM, stop)

n = 0
while True:
    n += 1
    print(f"refresh {n}: Total sales ₹{total(sys.argv[1])}", flush=True)
    time.sleep(1)</div>
  <p>The line <code>signal.signal(signal.SIGTERM, stop)</code> tells Python: when SIGTERM arrives, run <code>stop()</code> instead of dying immediately. <code>stop()</code> prints a message, saves the current total to <code>last_total.txt</code> and exits cleanly. Now let us start the board in the background, inspect it, and stop it both ways. <code>nohup</code> in front of a command makes it ignore the "hang-up" signal sent when you log out, so it keeps running after you disconnect; its output is redirected to <code>board.log</code>.</p>
<div class="fx" data-lang="text">$ cp /srv/tools/live_board.py .
$ nohup python3 live_board.py data/orders_2026-10-19.csv &gt; board.log 2&gt;&amp;1 &amp;
$ jobs -l
[1]+  4892 Running                 nohup python3 live_board.py data/orders_2026-10-19.csv &gt; board.log 2&gt;&amp;1 &amp;
$ ps -o pid,ppid,stat,etime,cmd -p $!
  PID  PPID STAT     ELAPSED CMD
 4892  4748 S          00:03 python3 live_board.py data/orders_2026-10-19.csv
$ pgrep -af live_board
4892 python3 live_board.py data/orders_2026-10-19.csv
$ top -b -n 1 -u meera | head -n 12
top - 05:52:49 up  1:08,  0 user,  load average: 0.16, 0.13, 0.24
Tasks:  87 total,   1 running,  86 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st 
MiB Mem :  16087.7 total,  14824.3 free,    851.3 used,    730.2 buff/cache     
MiB Swap:      0.0 total,      0.0 free,      0.0 used.  15236.4 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 4748 meera     20   0    4764   3468   3180 S   0.0   0.0   0:00.03 bash
 4892 meera     20   0   36728  12172   8364 S   0.0   0.1   0:00.00 python3
 4896 meera     20   0    9388   5424   3296 R   0.0   0.0   0:00.00 top
 4897 meera     20   0    3148   1952   1836 S   0.0   0.0   0:00.00 head
$ tail -n 2 board.log
refresh 3: Total sales ₹230
refresh 4: Total sales ₹230
$ kill $!
$ sleep 1
$ tail -n 3 board.log
refresh 3: Total sales ₹230
refresh 4: Total sales ₹230
got signal 15, saving last total
$ cat last_total.txt
230
$ python3 live_board.py data/orders_2026-10-19.csv &gt; board.log 2&gt;&amp;1 &amp;
$ kill -9 $!
$ sleep 1
bash:  4905 Killed                  python3 live_board.py data/orders_2026-10-19.csv &gt; board.log 2&gt;&amp;1
$ tail -n 2 board.log
refresh 2: Total sales ₹230
refresh 3: Total sales ₹230</div>
  <p><code>jobs -l</code> lists the background jobs of this shell with their PIDs. <code>ps</code> ("process status") shows one process in detail: its PID, its parent's PID (the shell), its state (<code>S</code> means sleeping, which is what the board does during <code>time.sleep(1)</code>), how long it has been running and its full command. <code>pgrep -af live_board</code> finds processes by name, which is how you get a PID you did not write down. <code>top</code> is the live, constantly refreshing view of the whole machine; <code>-b -n 1</code> takes a single snapshot. Its header shows the load and memory (read "avail Mem", explained in section 12), and below it each process with its memory (<code>RES</code>) and CPU use.</p>
  <p>Then the two kinds of stop. Plain <code>kill $!</code> sent SIGTERM. Our handler ran: the log ends with "got signal 15, saving last total" and <code>last_total.txt</code> contains 230. The second board was stopped with <code>kill -9</code>, and its log simply ends mid-stream. No handler could run and nothing was saved; the shell reported "Killed" at the next command. That is why the right order is always SIGTERM first, wait a few seconds, and only then SIGKILL for a process that refuses to stop.</p>
  <p>When a process ends, it hands its parent a small number called the <strong>exit code</strong> (or exit status). By convention 0 means success and anything from 1 to 255 means some kind of failure. The shell keeps the last exit code in <code>$?</code>. When a process is killed by a signal it did not handle, the shell reports 128 plus the signal number, so you can tell from the number alone how it died:</p>
<div class="fx" data-lang="text">$ python3 live_board.py data/orders_2026-10-19.csv &gt; /dev/null &amp; sleep 1; kill $!; wait $!; echo "exit code: $?"
exit code: 0
$ sleep 100 &amp; sleep 0.2; kill $!; wait $!; echo "exit code: $?"
exit code: 143
$ sleep 100 &amp; sleep 0.2; kill -9 $!; wait $!; echo "exit code: $?"
bash:  4936 Killed                  sleep 100
exit code: 137
$ timeout --preserve-status -s INT 1 sleep 100; echo "exit code: $?"
exit code: 130
$ python3 sales_report.py; echo "exit code: $?"
usage: python3 sales_report.py ORDERS.csv
exit code: 2
$ python3 sales_report.py data/orders_2026-10-16.csv 2&gt;&amp;1 | tail -n 1; echo "exit code: \${PIPESTATUS[0]}"
FileNotFoundError: [Errno 2] No such file or directory: 'data/orders_2026-10-16.csv'
exit code: 1
$ no-such-command; echo "exit code: $?"
bash: no-such-command: command not found
exit code: 127</div>
  <p>The board stopped with SIGTERM exited with 0, because our handler called <code>sys.exit(0)</code>. <code>sleep</code> has no handler, so SIGTERM killed it with 143 (128 + 15), SIGKILL with 137 (128 + 9), and an interrupt like Ctrl+C with 130 (128 + 2). The report without a file name printed its usage line and exited with 2, the conventional code for "you called me wrongly". With a missing sheet Python crashed with a <code>FileNotFoundError</code>, exit code 1. Because that command was piped into <code>tail</code>, plain <code>$?</code> would have given tail's 0; bash's <code>PIPESTATUS</code> array holds the exit code of each stage, and element 0 is the first. A command that does not exist gives 127.</p>
  <table class="tbl">
    <tr><th>Exit code</th><th>Meaning</th></tr>
    <tr><td>0</td><td>success</td></tr>
    <tr><td>1</td><td>general error (an uncaught Python exception gives 1)</td></tr>
    <tr><td>2</td><td>wrong usage, by convention</td></tr>
    <tr><td>126 / 127</td><td>found but not executable / command not found</td></tr>
    <tr><td>130 = 128 + 2</td><td>interrupted by SIGINT (Ctrl+C)</td></tr>
    <tr><td>137 = 128 + 9</td><td>killed by SIGKILL: <code>kill -9</code>, the out-of-memory killer, or <code>docker stop</code> after its timeout</td></tr>
    <tr><td>143 = 128 + 15</td><td>killed by SIGTERM that the program did not handle</td></tr>
  </table>
  <p>Three related tools round this off. A background job started with <code>&amp;</code> but without <code>nohup</code> may die when your connection drops; for long interactive work over SSH, <code>tmux</code> is more comfortable: <code>tmux new -s board</code> opens a session, Ctrl+B then D detaches from it, and <code>tmux attach -t board</code> reconnects later, with everything still running. Ctrl+Z pauses a foreground job, and <code>bg</code> or <code>fg</code> resume it in the background or foreground. And when a server program fails to start because "address already in use", the question is which process holds the network port (ports are explained in <a class="xref" data-note="cf_networking">Networking</a>): <code>ss -ltnp</code> lists listening ports with the PID and program name holding each one, and <code>lsof -i :8000</code> shows who uses port 8000. Once you have the PID, <code>kill</code> it as above.</p>

  <h2 id="sl-env"><span class="num">08</span>Environment Variables and PATH</h2>
  <p>Programs need settings that differ between machines: which currency to print, which database to use and its password. Writing them into the code would mean editing code for every machine and, worse, committing the password to Git. A second puzzle comes from the same mechanism: Meera has a handy command called <code>chai-report</code> that works in one terminal and says "command not found" in another. Both are explained by environment variables.</p>
  <p>An <strong>environment variable</strong> is a named piece of text, written <code>NAME=value</code>, that a process carries around and hands to every process it starts. Some always exist: <code>HOME</code> (your home directory), <code>USER</code> (your user name), <code>SHELL</code> and <code>PATH</code>. In the shell you read a variable by putting <code>$</code> in front of its name. The shell can also hold ordinary <strong>shell variables</strong> that it keeps to itself; the command <code>export</code> marks a variable to be passed on to child processes, and each child receives its own copy. Think of instructions for a babysitter: a note you keep in your head (a shell variable) helps nobody, while a note stuck on the fridge (an exported variable) is read by everyone who comes in later, and if the babysitter scribbles on her copy, your original is unchanged.</p>
<div class="fx" data-lang="text">$ echo $HOME $USER $SHELL
/home/meera meera /bin/bash
$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$ which python3 ls
/usr/local/bin/python3
/usr/bin/ls
$ CURRENCY=INR
$ echo $CURRENCY
INR
$ python3 -c 'import os; print(os.getenv("CURRENCY"))'
None
$ export CURRENCY
$ python3 -c 'import os; print(os.getenv("CURRENCY"))'
INR
$ DEBUG=1 python3 -c 'import os; print(os.getenv("DEBUG"))'
1
$ echo "[$DEBUG]"
[]
$ env | grep -E '^(HOME|USER|CURRENCY)='
HOME=/home/meera
USER=meera
CURRENCY=INR</div>
  <p><code>CURRENCY=INR</code> created a shell variable, and the shell itself could print it. But Python, started as a child process, got <code>None</code>, because the variable had not been exported. After <code>export CURRENCY</code>, Python saw <code>INR</code>. Writing <code>DEBUG=1</code> directly in front of a command sets the variable for that one command only; the shell never kept it, so <code>[$DEBUG]</code> printed empty brackets. <code>env</code> lists everything that is exported. Note that the values are always text, so <code>"false"</code> read from the environment is a non-empty string, which Python treats as true; compare explicitly.</p>
  <p>The most important variable of all is <strong>PATH</strong>, and it answers a question beginners rarely think to ask: when you type <code>python3</code>, which file actually runs? PATH holds a list of directories separated by colons. The shell looks through them from left to right and runs the first file with that name that it finds; <code>which</code> tells you which file that is. "command not found" means none of the directories contains it. Now Meera's puzzle. Her <code>chai-report</code> command is a two-line wrapper script in <code>~/bin</code>:</p>
<div class="fx" data-lang="text">$ mkdir -p ~/bin
$ cp /srv/tools/chai-report ~/bin/
$ chmod +x ~/bin/chai-report
$ cat ~/bin/chai-report
#!/usr/bin/env bash
exec python3 ~/chai-report/sales_report.py "$@"
$ chai-report data/orders_2026-10-19.csv
bash: chai-report: command not found
$ ~/bin/chai-report data/orders_2026-10-19.csv 2&gt;/dev/null | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ export PATH="$HOME/bin:$PATH"
$ echo $PATH
/home/meera/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$ which chai-report
/home/meera/bin/chai-report
$ chai-report data/orders_2026-10-19.csv 2&gt;/dev/null | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ (PATH=/nowhere; wc -l README.md)
bash: wc: command not found
$ python3 -m venv .venv
$ source .venv/bin/activate
$ echo $PATH
/home/meera/chai-report/.venv/bin:/home/meera/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$ which python3
/home/meera/chai-report/.venv/bin/python3
$ deactivate
$ which python3
/usr/local/bin/python3</div>
  <p>Typed by name, <code>chai-report</code> was "command not found", because <code>/home/meera/bin</code> is not one of the PATH directories. Typed with its full path it ran, because a path containing a <code>/</code> skips the search entirely. <code>export PATH="$HOME/bin:$PATH"</code> put <code>~/bin</code> in front of the existing list (the <code>:$PATH</code> keeps everything that was there), and from then on <code>which</code> finds it and the short name works. Inside the wrapper, <code>"$@"</code> passes on all the arguments it was given, and <code>exec</code> replaces the wrapper process with Python instead of starting a child. The line <code>(PATH=/nowhere; wc -l README.md)</code> shows what happens if you forget the <code>:$PATH</code>: the brackets run it in a throwaway subshell, and with a PATH containing nothing useful even <code>wc</code> cannot be found.</p>
  <p>This also explains the "magic" of Python virtual environments from <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>. <code>source .venv/bin/activate</code> does nothing more than put <code>.venv/bin</code> at the front of PATH, so <code>python3</code> now finds the virtual environment's copy first, and <code>deactivate</code> removes it again. (<code>source</code> runs a script inside the current shell instead of in a child, which is the only way a script can change your shell's variables.) A PATH change typed at the prompt lasts only until the terminal closes. To make it permanent, add the <code>export</code> line to <code>~/.bashrc</code>, which every new interactive shell reads, and remember that editing the file does not affect terminals that are already open until you run <code>source ~/.bashrc</code>.</p>
  <p>In Python code, the convention is to read required settings with <code>os.environ["NAME"]</code>, which crashes immediately with a clear error if the variable is missing, and optional ones with <code>os.getenv("NAME", default)</code>:</p>
<div class="fx" data-lang="text">$ cp /srv/tools/dbcheck.py .
$ python3 dbcheck.py
currency: INR
Traceback (most recent call last):
  File "/home/meera/chai-report/dbcheck.py", line 5, in &lt;module&gt;
    db_url = os.environ["DATABASE_URL"]          # required: crash early if missing
             ~~~~~~~~~~^^^^^^^^^^^^^^^^
  File "&lt;frozen os&gt;", line 717, in __getitem__
KeyError: 'DATABASE_URL'
$ DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall CURRENCY=USD python3 dbcheck.py
currency: USD
database: postgresql://chai:chai-secret@db:5432/stall</div>
  <p><code>CURRENCY</code> is optional, so the script fell back to INR. <code>DATABASE_URL</code> is required, and without it the script stopped at line 5 with <code>KeyError: 'DATABASE_URL'</code> before doing any work, which is far better than quietly running all night against a wrong default. With both variables given on the command line it printed them. This style of keeping URLs, secrets and switches in the environment rather than in the code is called "12-factor configuration"; the <a class="xref" data-note="se_docker">Docker</a> note passes exactly this variable into a container.</p>

  <h2 id="sl-bash"><span class="num">09</span>Bash Scripts</h2>
  <p>We now have every piece of the nightly job. It must work out today's sheet, stop with an error if the sheet is missing, run the report, prefix every line with the date, append everything to the log, and mark the run as done. Typing that each night defeats the purpose, and the scheduler in section 11 needs a single file it can run. That file is a <strong>shell script</strong>: a text file of shell commands, run from top to bottom exactly as if you had typed them. Think of a recipe card written for a new cook. A good card does not only list steps; it also says "if the milk has gone sour, stop and tell me", because otherwise the cook will happily carry on and serve sour kheer with a smile. Bash, unfortunately, behaves like that cook by default, and much of this section is about writing the "stop and tell me" line.</p>
<div class="fx" data-lang="text">$ cp /srv/tools/run_report.sh .
$ cat run_report.sh
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="\${APP_DIR:-$HOME/chai-report}"
DAY="\${1:-$(date +%F)}"
SHEET="$APP_DIR/data/orders_$DAY.csv"
LOG="$APP_DIR/logs/report.log"

if [[ ! -f "$SHEET" ]]; then
  echo "$DAY ERROR no sheet: $SHEET" &gt;&gt; "$LOG"
  exit 1
fi

python3 "$APP_DIR/sales_report.py" "$SHEET" 2&gt;&amp;1 | sed "s/^/$DAY /" &gt;&gt; "$LOG"
echo "$DAY DONE" &gt;&gt; "$LOG"
$ ./run_report.sh 2026-10-19; echo "exit code: $?"
bash: ./run_report.sh: Permission denied
exit code: 126
$ chmod +x run_report.sh
$ ./run_report.sh 2026-10-19; echo "exit code: $?"
exit code: 0
$ tail -n 4 logs/report.log
2026-10-19   bun maska    ₹60
2026-10-19   samosa       ₹45
2026-10-19   ginger chai  ₹25
2026-10-19 DONE
$ ./run_report.sh 2026-10-16; echo "exit code: $?"
exit code: 1
$ tail -n 1 logs/report.log
2026-10-16 ERROR no sheet: /home/meera/chai-report/data/orders_2026-10-16.csv
$ for f in data/orders_*.csv; do rows=$(tail -n +2 "$f" | wc -l); echo "$f has $rows orders"; done
data/orders_2026-10-13.csv has 14 orders
data/orders_2026-10-14.csv has 17 orders
data/orders_2026-10-15.csv has 12 orders
data/orders_2026-10-17.csv has 22 orders
data/orders_2026-10-18.csv has 19 orders
data/orders_2026-10-19.csv has 9 orders
$ for d in 15 16 17; do ./run_report.sh 2026-10-$d || echo "2026-10-$d failed"; done
2026-10-16 failed</div>
  <p>Read the script line by line. The first line, starting with <code>#!</code>, is the <strong>shebang</strong>: it tells the system which program should interpret the file, here bash, found through PATH by <code>/usr/bin/env</code>. <code>set -euo pipefail</code> is the safety line, explained below. Variables in bash are assigned with no spaces around <code>=</code>. <code>"\${APP_DIR:-$HOME/chai-report}"</code> means "the value of APP_DIR if it is set, otherwise this default", so the location can be changed through the environment. <code>\${1:-...}</code> does the same for the first argument given to the script, and <code>$(date +%F)</code> is <strong>command substitution</strong>: run <code>date</code>, which prints today's date as <code>2026-11-19</code>, and paste its output in place. <code>[[ ! -f "$SHEET" ]]</code> tests "the sheet is not an existing file"; if so, the script writes an ERROR line to the log and stops with <code>exit 1</code>. The main line runs the report with stderr merged into stdout, pipes every line through <code>sed</code> to put the date in front (<code>s/^/.../</code> substitutes the start of the line), and appends the result to the log.</p>
  <p>The first run failed with "Permission denied" and exit code 126, which means "found but not executable": a script needs the x permission from section 06 (alternatively, <code>bash run_report.sh</code> runs it without x). After <code>chmod +x</code>, the run for the 19th exited with 0 and the log ends with the date-prefixed report and a DONE line. The 16th, when the stall was closed, logged an ERROR line and exited with 1. The two loops show bash's <code>for</code>: the first goes over every file matching <code>data/orders_*.csv</code> (the shell expands the <code>*</code> pattern into the list of matching names) and counts orders per sheet; the second goes over three day numbers, and <code>||</code> ("or else") prints a message only when a run fails, which happened only for the 16th.</p>
  <p>Now the safety line, one option at a time, starting with the hardest to understand. A broken export for the 20th has its column named <code>quantity</code> instead of <code>qty</code>, so <code>sales_report.py</code> crashes with a <code>KeyError</code>. Watch what happens with and without <code>pipefail</code>:</p>
<div class="fx" data-lang="text">$ cp /srv/tools/orders_2026-10-20.csv data/
$ head -n 2 data/orders_2026-10-20.csv
order_id,time,customer,item,quantity,price,note
1,08:05,Asha,masala chai,2,20,
$ sed 's/set -euo pipefail/set -eu/' run_report.sh &gt; no_pipefail.sh
$ chmod +x no_pipefail.sh
$ ./no_pipefail.sh 2026-10-20; echo "exit code: $?"
exit code: 0
$ tail -n 3 logs/report.log
2026-10-20                      ~~~^^^^^^^
2026-10-20 KeyError: 'qty'
2026-10-20 DONE
$ ./run_report.sh 2026-10-20; echo "exit code: $?"
exit code: 1
$ tail -n 2 logs/report.log
2026-10-20                      ~~~^^^^^^^
2026-10-20 KeyError: 'qty'
$ bash -c 'false | true; echo "without pipefail: $?"'
without pipefail: 0
$ bash -c 'set -o pipefail; false | true; echo "with pipefail: $?"'
with pipefail: 1</div>
  <p>The copy without pipefail exited with 0 and wrote "2026-10-20 DONE" into the log, right after the crash. Anyone checking the log for DONE would believe the 20th was fine. The reason is a rule of bash: the exit code of a pipeline is the exit code of its <em>last</em> command. Python failed, but <code>sed</code>, the last stage, succeeded, so the pipeline as a whole "succeeded", and the script carried on. With <code>set -o pipefail</code>, a pipeline fails if any of its stages fails; then <code>set -e</code> ("exit on error") stopped the script before the DONE line, with exit code 1. The two one-liners show the rule on its own: <code>false | true</code> reports 0 without pipefail and 1 with it.</p>
  <p>The remaining option, <code>-u</code>, and the habit of quoting variables protect against a different danger: a variable that is empty when you did not expect it.</p>
<div class="fx" data-lang="text">$ cp /srv/tools/cleanup_unsafe.sh /srv/tools/cleanup_safe.sh .
$ chmod +x cleanup_*.sh
$ cat cleanup_unsafe.sh
#!/usr/bin/env bash
cd "$ARCHIVE_DIR"
echo "would delete these old sheets in $(pwd):"
ls *.csv
$ ./cleanup_unsafe.sh; echo "exit code: $?"
would delete these old sheets in /home/meera/chai-report:
sample_orders.csv
exit code: 0
$ diff cleanup_unsafe.sh cleanup_safe.sh
1a2
&gt; set -euo pipefail
$ ./cleanup_safe.sh; echo "exit code: $?"
./cleanup_safe.sh: line 3: ARCHIVE_DIR: unbound variable
exit code: 1
$ X = 5
bash: X: command not found
$ f="orders 19 oct.csv"
$ touch "$f"
$ ls -l $f
ls: cannot access 'orders': No such file or directory
ls: cannot access '19': No such file or directory
ls: cannot access 'oct.csv': No such file or directory
$ ls -l "$f"
-rw-rw-r-- 1 meera meera 0 Nov 19 05:52 orders 19 oct.csv
$ rm "$f"
$ grep -q "Gita" data/orders_2026-10-19.csv &amp;&amp; echo "Gita ordered today" || echo "no Gita"
Gita ordered today
$ grep -q "Zoya" data/orders_2026-10-19.csv &amp;&amp; echo "Zoya ordered today" || echo "no Zoya"
no Zoya</div>
  <p>The unsafe cleanup script uses <code>$ARCHIVE_DIR</code>, which nobody set. Bash treats an unset variable as empty text, <code>cd ""</code> quietly stays in the current directory, and the script announces it would delete <code>sample_orders.csv</code> from the project folder, then exits with 0 as if all was well. Had the next line been <code>rm *.csv</code>, the wrong files would be gone. The safe version differs by a single line, and with <code>set -u</code> using an unset variable is an error: it stopped at line 3 with "unbound variable" and exit code 1. The same danger is why <code>rm -rf "$DIR/"</code> with an empty <code>DIR</code> becomes <code>rm -rf /</code>; writing <code>"\${DIR:?not set}"</code> makes bash abort with a message if <code>DIR</code> is empty.</p>
  <p>The rest are small rules that catch everyone once. <code>X = 5</code> with spaces does not assign anything; bash read it as a command named <code>X</code> with arguments <code>=</code> and <code>5</code>. An unquoted <code>$f</code> containing spaces is split into separate words, so <code>ls</code> looked for three files called <code>orders</code>, <code>19</code> and <code>oct.csv</code>; quoted as <code>"$f"</code> it stayed one name. Always quote variables. Finally, <code>grep -q</code> prints nothing and only sets its exit code, and <code>a &amp;&amp; b || c</code> runs b if a succeeded and c otherwise, a compact if/else for scripts. Bash is excellent glue for running programs in order, checking files and logging, but its rules are fragile; once a script grows past about 50 lines or needs real logic, rewrite it in Python.</p>

  <h2 id="sl-ssh"><span class="num">10</span>SSH and Keys</h2>
  <p>So far we have been typing "on the server". In real life the server sits in a data centre and Meera is at home with her laptop. She needs a terminal on the server, the ability to run a single command there, and a way to copy logs and data back and forth, all over the public internet where passwords can be guessed or intercepted. The tool for all of this is <strong>SSH</strong> ("secure shell"): an encrypted connection that gives you a shell on another machine, by default on network port 22. (How encryption and ports work is in <a class="xref" data-note="cf_networking">Networking</a>.)</p>
  <p>SSH can use passwords, but the standard is a <strong>key pair</strong>: two linked files generated together. The <strong>public key</strong> can be shown to anyone; you copy it onto every server you want to log in to, into the file <code>~/.ssh/authorized_keys</code>. The <strong>private key</strong> never leaves your laptop. The two are mathematically linked so that something signed with the private key can be checked with the public key, but the public key cannot be used to work out the private one. At login, the server sends a random challenge, the laptop signs it with the private key, and the server checks the signature against the public key it holds. It works like your signature at a bank: the bank keeps a specimen, you sign a fresh slip in front of them, and seeing the specimen does not let anyone forge your hand.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="sl-arr-ssh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="200" height="70" rx="8" class="fb sb"/><text x="110" y="45" text-anchor="middle">Meera's laptop</text><text x="110" y="68" text-anchor="middle" class="tm">~/.ssh/id_ed25519 (private)</text>
    <rect x="390" y="20" width="200" height="70" rx="8" class="fg sg"/><text x="490" y="45" text-anchor="middle">chai server</text><text x="490" y="68" text-anchor="middle" class="tm">authorized_keys (public)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="388" y1="45" x2="214" y2="45" marker-end="url(#sl-arr-ssh)"/><line x1="212" y1="70" x2="386" y2="70" marker-end="url(#sl-arr-ssh)"/></g>
    <text x="300" y="38" text-anchor="middle" class="tm">1. random challenge</text><text x="300" y="86" text-anchor="middle" class="tm">2. challenge signed with private key</text>
    <text x="300" y="112" text-anchor="middle" class="tr">the private key never leaves the laptop</text>
  </svg><figcaption>Key-based login: the server holds the public key and checks that the laptop can sign its challenge with the matching private key.</figcaption></figure>
  <p>The machine used for this note has no SSH client or server installed, so the commands below are shown without output; the paragraph after them describes what each one prints. They are run on the laptop, and <code>chai-server</code> stands for the server's address:</p>
  <div class="fx" data-lang="text">$ ssh-keygen -t ed25519 -C "meera@laptop"
$ ls -l ~/.ssh
$ ssh-copy-id meera@chai-server
$ ssh meera@chai-server
$ ssh meera@chai-server 'tail -n 3 chai-report/logs/report.log'
$ scp meera@chai-server:chai-report/logs/report.log ~/Downloads/
$ rsync -av meera@chai-server:chai-report/data/ ~/chai-data/
$ ssh -L 8888:localhost:8888 meera@chai-server</div>
  <p><code>ssh-keygen -t ed25519</code> creates a new key pair of the modern ed25519 type; it asks where to save it and for an optional passphrase that encrypts the private key on disk. Listing <code>~/.ssh</code> then shows two files: <code>id_ed25519</code>, the private key, with permissions <code>-rw-------</code> (600), and <code>id_ed25519.pub</code>, the public key, a single line starting with <code>ssh-ed25519</code> that is safe to share. <code>ssh-copy-id</code> logs in once with your password and appends the public key to the server's <code>authorized_keys</code>; from then on, <code>ssh meera@chai-server</code> logs in without a password and gives you the server's prompt. The very first time you connect, SSH shows the server's fingerprint and asks whether to trust it, then stores it in <code>~/.ssh/known_hosts</code>; if that fingerprint ever changes, SSH prints a loud warning, because it may mean someone is impersonating the server.</p>
  <p>Giving <code>ssh</code> a command in quotes runs just that command on the server and prints its output on your laptop, here the last lines of the log, which is ideal for quick checks and for scripts. <code>scp</code> ("secure copy") copies files over the same connection, with <code>host:path</code> marking the remote side. <code>rsync -av</code> synchronises a whole directory and transfers only what changed, so running it a second time with no changes copies nothing; it prints the list of files it transferred and a summary of bytes sent. The last line is a <strong>tunnel</strong>: it forwards port 8888 on your laptop through the encrypted connection to port 8888 on the server, so a Jupyter notebook running on the server opens at <code>http://localhost:8888</code> in your laptop's browser without being exposed to the internet. To avoid typing the user and address every time, a few lines in <code>~/.ssh/config</code> give the server a short name:</p>
  <div class="fx" data-lang="text">Host chai-server
    HostName 203.0.113.10
    User meera
    Port 22</div>
  <p>The private key is the whole security of the system, so treat it like a house key. Never share it, email it or commit it to Git; if it leaks, remove its public key from every <code>authorized_keys</code> file. SSH also checks permissions: if the private key file is readable by other users (for example 644), SSH prints "WARNING: UNPROTECTED PRIVATE KEY FILE!", refuses to use the key and the login fails. <code>chmod 600 ~/.ssh/id_ed25519</code> and <code>chmod 700 ~/.ssh</code> fix it, the permissions from section 06 in action.</p>

  <h2 id="sl-cron"><span class="num">11</span>Scheduling with cron</h2>
  <p>Meera can now reach the server from anywhere, but the whole point was that nobody should have to. The report must run every evening at 21:00, after the stall closes, whether or not anyone is logged in. For that Linux has <strong>cron</strong>, a daemon that wakes up once a minute, reads every user's schedule, and starts any job whose time has come. Each user's schedule is called their <strong>crontab</strong> ("cron table"), and each line in it is five time fields followed by a command. It works like an alarm clock with a sticky note attached: "at 21:00, do this".</p>
  <table class="tbl">
    <tr><th>Schedule</th><th>Fields (minute hour day-of-month month weekday)</th><th>Meaning</th></tr>
    <tr><td><code>0 21 * * *</code></td><td>minute 0, hour 21, every day, every month, any weekday</td><td>21:00 every day: our nightly report</td></tr>
    <tr><td><code>*/15 * * * *</code></td><td>every 15th minute</td><td>every 15 minutes</td></tr>
    <tr><td><code>0 9 * * 1</code></td><td>09:00, weekday 1</td><td>Mondays at 09:00 (0 is Sunday)</td></tr>
    <tr><td><code>0 8 * * 1-5</code></td><td>08:00, weekdays 1 to 5</td><td>08:00 Monday to Friday</td></tr>
    <tr><td><code>0 0 1 * *</code></td><td>midnight on day 1</td><td>start of every month</td></tr>
  </table>
  <p>You edit your crontab with <code>crontab -e</code>, which opens it in a text editor, list it with <code>crontab -l</code>, and remove it with <code>crontab -r</code>. <code>crontab</code> is not installed on the machine used for this note, so here is the line Meera would add, without output; when installed, <code>crontab -l</code> simply prints the lines back:</p>
  <div class="fx" data-lang="text"># m  h  dom mon dow  command
0 21 * * * $HOME/chai-report/run_report.sh &gt;&gt; $HOME/chai-report/logs/cron.log 2&gt;&amp;1</div>
  <p>Notice two things about this line. The script is given by its full path, and both of its output streams are redirected into a log file. Both are there because of the most common cron problem of all: "it works in my terminal but not in cron". The person woken by the alarm clock has just walked in. They have not read your <code>.bashrc</code>, they do not know your shortcuts, and they use a plain shell. Concretely, cron starts each job with <code>/bin/sh</code> rather than bash, in your home directory, with a tiny environment whose PATH is only <code>/usr/bin:/bin</code>. And anything the job prints that is not redirected is lost (or mailed to a local mailbox that nobody reads). We cannot run cron here, but we can start a command in exactly that kind of environment with <code>env -i</code>, which clears every variable, and see what a cron job would see:</p>
<div class="fx" data-lang="text">$ env -i HOME=$HOME LOGNAME=meera PATH=/usr/bin:/bin SHELL=/bin/sh /bin/sh -c 'env'
HOME=/home/meera
LOGNAME=meera
PATH=/usr/bin:/bin
SHELL=/bin/sh
PWD=/home/meera
$ env -i HOME=$HOME PATH=/usr/bin:/bin /bin/sh -c 'chai-report ~/chai-report/data/orders_2026-10-19.csv'
/bin/sh: 1: chai-report: not found
$ env -i HOME=$HOME PATH=/usr/bin:/bin /bin/sh -c '$HOME/chai-report/run_report.sh 2026-10-19; echo "exit code: $?"'
exit code: 0
$ tail -n 2 ~/chai-report/logs/report.log
2026-10-19   ginger chai  ₹25
2026-10-19 DONE</div>
  <p>The first command shows the whole environment such a job gets: five variables, a PATH of only <code>/usr/bin:/bin</code>, and <code>sh</code> as the shell. The second tries Meera's <code>chai-report</code> command by name, the very command that worked in section 08, and fails with "not found", because <code>~/bin</code> was added to PATH in her interactive shell, which a cron job never sees. The third runs <code>run_report.sh</code> by its full path, and it works: exit code 0 and a fresh DONE line in the log. The script also sets its own <code>APP_DIR</code> from <code>$HOME</code> instead of relying on the working directory. The lessons for every cron job follow directly: use absolute paths for scripts and files, set any variables the job needs inside the script or at the top of the crontab (for example a <code>PATH=...</code> line), redirect both streams to a log, and check that log the next morning.</p>
  <p>Mind the time zone too: cron uses the server's clock, and cloud servers often run on UTC, so "21:00" in the crontab would be 02:30 the next morning in India unless the server's time zone is set. cron is ideal for simple fixed schedules on one machine. When jobs depend on each other, need retries or run across many machines, teams move to orchestrators such as Airflow (see <a class="xref" data-note="de_etl">ETL &amp; Pipelines</a>).</p>

  <h2 id="sl-res"><span class="num">12</span>Disk and Memory</h2>
  <p>A job that runs unattended for months eventually meets one of two classic failures. Either it stops with "No space left on device" because logs and data kept growing, or it simply vanishes one night with no Python error at all. Both are about the machine's resources, and a handful of commands find the cause in a minute. Think of the disk as a cupboard and memory as the work table: <code>df</code> tells you how much shelf space is left in the whole cupboard, <code>du</code> tells you how much each box takes, and when the table overflows, the building manager throws someone's papers out without asking.</p>
<div class="fx" data-lang="text">$ df -h /home
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        252G   29G  9.6G  76% /home
$ du -sh ~/chai-report/* | sort -h
4.0K	/home/meera/chai-report/CHANGELOG.md
4.0K	/home/meera/chai-report/README.md
4.0K	/home/meera/chai-report/dbcheck.py
4.0K	/home/meera/chai-report/live_board.py
4.0K	/home/meera/chai-report/monday.sh
4.0K	/home/meera/chai-report/run_report.sh
4.0K	/home/meera/chai-report/sales_report.py
4.0K	/home/meera/chai-report/sample_orders.csv
12K	/home/meera/chai-report/logs
28K	/home/meera/chai-report/data
$ du -sh ~/chai-report/.git ~/chai-report/.venv
220K	/home/meera/chai-report/.git
13M	/home/meera/chai-report/.venv
$ du -h --max-depth=1 ~ | sort -h
8.0K	/home/meera/.config
8.0K	/home/meera/bin
14M	/home/meera
14M	/home/meera/chai-report
$ free -h
               total        used        free      shared  buff/cache   available
Mem:            15Gi       765Mi        14Gi        12Mi       744Mi        14Gi
Swap:             0B          0B          0B
$ nproc
4
$ ls -lh logs/
total 8.0K
-rw-rw-r-- 1 meera meera 4.5K Nov 19 05:52 report.log</div>
  <p>The <code>-h</code> option means "human-readable", sizes in K, M and G instead of raw bytes. <code>df -h</code> ("disk free") reports whole filesystems: here the disk holding <code>/home</code> is 76% used with 9.6 GB available. On a real server, set up an alert well before a disk reaches 90%. <code>du -sh</code> ("disk usage", summarised) gives the size of each item, and piping into <code>sort -h</code> puts the biggest last; <code>du -h --max-depth=1</code> does the same for every directory one level down, which is how you drill into a full disk directory by directory. Our project is tiny, but the virtual environment created in section 08 already takes 13 MB, far more than the code and data. In <code>free -h</code>, read the <strong>available</strong> column, not "free": Linux uses otherwise idle memory as a cache for files (<code>buff/cache</code>) and hands it back the moment a program needs it, so "free" always looks alarmingly small on a healthy machine. <code>nproc</code> prints the number of CPU cores.</p>
  <p>The vanishing job is usually the <strong>OOM killer</strong> ("out of memory"). When the machine, or a container with a memory limit, runs out of memory, the kernel picks a process and kills it with SIGKILL to save the rest of the system. Because SIGKILL cannot be caught, Python never gets the chance to print a traceback; the only traces are an exit code of 137 (128 + 9, from section 07) and a line in the kernel log, which <code>dmesg | grep -i "killed process"</code> shows, naming the process and how much memory it held. In Docker, <code>docker inspect</code> on the dead container reports <code>OOMKilled: true</code>. The fixes are to process data in chunks instead of loading everything at once, to use lighter data types, or to give the job more memory. For disks, rotate logs (the standard tool is <code>logrotate</code>) instead of letting <code>report.log</code> grow forever, and remember that deleting a log file that a running process still has open does not free the space until that process closes it.</p>

  <h2 id="sl-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most dangerous mistake is deleting with a variable that turns out to be empty. A line like <code>rm -rf $DIR/*</code> in a script, with <code>DIR</code> unset, becomes <code>rm -rf /*</code>. We saw the harmless version in section 09, where an unset <code>ARCHIVE_DIR</code> left the cleanup script pointing at the project folder:</p>
  <div class="fx" data-lang="text">cd "$ARCHIVE_DIR"          # unset → stays where it is, reports success
rm -rf "$DIR/"             # empty DIR → rm -rf /

set -euo pipefail          # fix 1: unset variables become errors
rm -rf "\${DIR:?not set}/"  # fix 2: abort with a message if DIR is empty</div>
  <p>Quote every variable, put <code>set -euo pipefail</code> at the top of every script, and run <code>ls</code> with the same path before any <code>rm</code>.</p>
  <p>Redirecting a command's output onto its own input destroys the file, because the shell empties the target before the command starts. <code>sort copy.csv &gt; copy.csv</code> left us with 0 lines. Write to a new file and rename it: <code>sort copy.csv &gt; sorted.csv &amp;&amp; mv sorted.csv copy.csv</code>. A related surprise is that a pipe carries only stdout, so <code>python3 sales_report.py sheet | grep -c WARN</code> counted 0 while the warnings flew past on the screen; add <code>2&gt;&amp;1</code> before the pipe when you want stderr too. And <code>uniq -c</code> without <code>sort</code> counts only neighbouring duplicates, which gave us the same item in several groups; always write <code>sort | uniq -c</code>.</p>
  <p>On permissions, <code>chmod 777</code> (or worse, <code>chmod -R 777</code>) makes the error disappear by letting every user change your code and read your secrets. Find out which user needs which access and grant just that, usually through a group with 640 or 750. In the other direction, a private SSH key or a <code>.env</code> file left at 644 is readable by everyone on the machine; keep them at 600.</p>
  <p>On environment variables, forgetting <code>export</code> makes a variable invisible to Python (we saw <code>None</code>), and writing <code>export PATH=~/bin</code> without <code>:$PATH</code> replaces the whole list so that even <code>ls</code> stops working. Fix it in the same terminal with <code>export PATH=/usr/local/bin:/usr/bin:/bin</code>, then correct <code>~/.bashrc</code>.</p>
  <p>On processes, reaching for <code>kill -9</code> first skips every cleanup handler, so files are left half-written and state is lost, as the second live board showed. Send plain <code>kill</code>, wait, and only then <code>kill -9</code>. Starting a long job with <code>&amp;</code> over SSH and closing the laptop can kill it too; use <code>nohup</code> or <code>tmux</code>.</p>
  <p>Finally, two mistakes make failures silent. A script without <code>pipefail</code> logged a crashed run as DONE with exit code 0. And a cron job that relies on your interactive PATH, your <code>.bashrc</code> or your local time zone fails at 21:00 without anyone noticing, which is why cron lines use full paths, set their own variables and redirect both streams to a log.</p>

  <h2 id="sl-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Terminal</b>: the window for typed text; <b>shell</b> (bash): the program that reads commands and runs programs.</li>
    <li><b>Filesystem tree</b>: every file under the root <code>/</code>; <b>working directory</b>: where relative paths start (<code>pwd</code>); <b>home</b>: <code>~</code> = <code>$HOME</code>.</li>
    <li><b>Absolute path</b> starts with <code>/</code>; <b>relative path</b> starts from the working directory; <code>.</code> here, <code>..</code> up.</li>
    <li><b>Streams</b>: stdin 0, stdout 1, stderr 2 (file descriptors). <b>Pipe</b>: stdout of one command into stdin of the next.</li>
    <li><b>Permissions</b>: r w x for owner, group and others. <b>root</b>: the administrator, bypasses checks.</li>
    <li><b>Process</b>: a running program with a PID; <b>daemon</b>: a background service process; <b>signal</b>: a numbered message to a process.</li>
    <li><b>Exit code</b>: 0 success, non-zero failure, 128 + n killed by signal n.</li>
    <li><b>Environment variable</b>: NAME=value passed from parent to child processes (if exported). <b>PATH</b>: directories searched for commands, left to right.</li>
    <li><b>Shebang</b>: the <code>#!</code> first line naming the interpreter. <b>cron</b>: the scheduler daemon; <b>crontab</b>: a user's schedule.</li>
    <li><b>SSH</b>: encrypted remote shell; <b>key pair</b>: public key on the server, private key stays with you. <b>OOM killer</b>: kernel kills a process when memory runs out.</li>
  </ul>
  <h3>Numbers to know</h3>
  <table class="tbl">
    <tr><th>Permissions</th><th>Meaning</th><th>Signals and exits</th><th>Meaning</th></tr>
    <tr><td>r=4 w=2 x=1</td><td>add per triple</td><td>SIGINT 2</td><td>Ctrl+C → exit 130</td></tr>
    <tr><td>755 <code>rwxr-xr-x</code></td><td>scripts, directories</td><td>SIGKILL 9</td><td><code>kill -9</code>, OOM → exit 137</td></tr>
    <tr><td>644 <code>rw-r--r--</code></td><td>ordinary files</td><td>SIGTERM 15</td><td><code>kill</code> → exit 143 if unhandled</td></tr>
    <tr><td>640 <code>rw-r-----</code></td><td>team-readable data</td><td>exit 126 / 127</td><td>not executable / not found</td></tr>
    <tr><td>600 <code>rw-------</code></td><td>secrets, SSH keys</td><td>exit 2</td><td>wrong usage (convention)</td></tr>
  </table>
  <h3>Command summary</h3>
  <div class="fx" data-lang="text">pwd; ls -la; cd dir; cd ..; cd ~; cd -          # move around
mkdir -p a/b; cp -r src dst; mv old new; rm -r dir  # files (rm has no undo)
head -n 5 f; tail -n 5 f; tail -f log; wc -l f; less f
cmd &gt; f; cmd &gt;&gt; f; cmd 2&gt; f; cmd &gt; f 2&gt;&amp;1; cmd &lt; f; a | b; cmd 2&gt;/dev/null
grep WARN log | cut -d' ' -f1 | sort | uniq -c | sort -rn
find DIR -name "*.csv" -newer f -size +1k; grep -rn TEXT --include="*.py" DIR
sed 's/old/new/'; awk '{s += $1} END {print s}'
chmod 640 f; chmod +x f; chmod g-w,o-rx f; chgrp grp f; chown user:grp f; id
cmd &amp;; $!; jobs -l; ps -o pid,ppid,stat,cmd -p PID; pgrep -af NAME; top
kill PID; kill -9 PID; echo $?; \${PIPESTATUS[0]}; nohup cmd &amp;; tmux
export X=1; X=1 cmd; env; echo $PATH; which cmd; export PATH="$HOME/bin:$PATH"
#!/usr/bin/env bash + set -euo pipefail; "\${1:-default}"; $(cmd); [[ -f "$F" ]]
ssh host 'cmd'; scp host:path .; rsync -av host:dir/ dir/; ssh -L 8888:localhost:8888 host
crontab -e; crontab -l; 0 21 * * * /full/path/script.sh &gt;&gt; /full/path/cron.log 2&gt;&amp;1
df -h; du -sh *; du -h --max-depth=1 DIR | sort -h; free -h; nproc; ss -ltnp</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>rm</code> has no recycle bin; an empty variable in an <code>rm</code> path can delete everything.</li>
    <li><code>sort f &gt; f</code> empties f: the redirect happens before the command runs.</li>
    <li>A pipe carries only stdout: use <code>2&gt;&amp;1 |</code> to include warnings and errors.</li>
    <li><code>uniq</code> merges only neighbours: always <code>sort | uniq -c</code>.</li>
    <li>Deleting a file depends on the directory's w permission, not the file's. Group changes apply at next login.</li>
    <li>Never <code>chmod 777</code>; private keys and <code>.env</code> at 600.</li>
    <li>Variables need <code>export</code> to reach programs; <code>PATH=x</code> without <code>:$PATH</code> breaks everything.</li>
    <li>Without <code>pipefail</code>, a pipeline's status is its last command's, so failures hide.</li>
    <li>cron: <code>sh</code>, PATH=/usr/bin:/bin, no <code>.bashrc</code>, server time zone; use full paths and log output.</li>
    <li>Exit 137 with no traceback: SIGKILL, usually the OOM killer.</li>
  </ul>

  <h2 id="sl-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a terminal and a shell?</summary><div class="qa-body">The terminal is the window (or program) that displays text and sends your keystrokes. The shell, such as bash or zsh, is the program running inside it that reads each command, expands variables and patterns, sets up redirects and pipes, and starts the programs. You can run different shells in the same terminal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between an absolute and a relative path?</summary><div class="qa-body">An absolute path starts with <code>/</code> and describes the location from the root, so it works from anywhere: <code>/home/meera/chai-report/data</code>. A relative path is read from the current working directory: <code>data/orders.csv</code>. <code>.</code> means the current directory, <code>..</code> the parent, and <code>~</code> your home directory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>chmod 755</code> mean? And <code>chmod 640</code>?</summary><div class="qa-body">Each digit is the sum of r=4, w=2 and x=1 for owner, group and others. 755 is <code>rwxr-xr-x</code>: the owner can do everything, everyone else can read and execute, typical for scripts and directories. 640 is <code>rw-r-----</code>: the owner reads and writes, the group can only read, others have no access, typical for data shared with a team.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do r, w and x mean on a directory?</summary><div class="qa-body">r lets you list the names inside, w lets you create, rename and delete entries inside it, and x lets you enter the directory and access files within it. That is why deleting a file is controlled by the directory's w permission, not by the file's own permissions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your script fails with "Permission denied" when you run <code>./run.sh</code>. Why, and how do you fix it?</summary><div class="qa-body">The file does not have the execute permission, so the shell refuses to run it (exit code 126). Fix it with <code>chmod +x run.sh</code>, or run it through the interpreter as <code>bash run.sh</code>, which only needs read permission.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between stdout and stderr, and what does <code>2&gt;&amp;1</code> do?</summary><div class="qa-body">stdout (file descriptor 1) is for normal output and stderr (2) is a separate channel for errors and warnings, so they can be handled separately. <code>2&gt;&amp;1</code> redirects stderr to wherever stdout is currently going. Order matters: <code>cmd &gt; f 2&gt;&amp;1</code> puts both in f, while <code>cmd 2&gt;&amp;1 &gt; f</code> leaves stderr on the screen.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>cmd | grep ERROR</code> miss?</summary><div class="qa-body">A pipe connects only stdout, so any error messages the command writes to stderr bypass grep and go straight to the terminal. Use <code>cmd 2&gt;&amp;1 | grep ERROR</code> to search both streams.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you find the 3 most frequent IP addresses in an access log where the IP is the first field?</summary><div class="qa-body"><code>cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head -n 3</code> (or <code>awk '{print $1}'</code> instead of cut). The first sort is essential because <code>uniq -c</code> only counts adjacent identical lines; the second sort orders by count, largest first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a program, a process and a daemon?</summary><div class="qa-body">A program is a file on disk containing code. A process is a running instance of a program, with its own PID, memory and open files; one program can run as many processes. A daemon is a process that runs in the background without a terminal and provides a service, such as cron, sshd or a web server.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>kill</code> and <code>kill -9</code>?</summary><div class="qa-body"><code>kill PID</code> sends SIGTERM, a polite request the process can catch to clean up, save state and exit. <code>kill -9 PID</code> sends SIGKILL, which cannot be caught: the kernel stops the process immediately with no cleanup. Use SIGTERM first, wait, and only use SIGKILL if the process does not stop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A job exits with code 137 and prints no traceback. What happened?</summary><div class="qa-body">137 is 128 + 9, so the process was killed by SIGKILL. The usual cause is the kernel's OOM killer, because the process (or its container) exceeded available memory; it can also be a manual <code>kill -9</code> or <code>docker stop</code> after its grace period. Confirm with <code>dmesg | grep -i "killed process"</code> or <code>docker inspect</code> showing OOMKilled true. 143 would mean SIGTERM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find which process is using port 8000?</summary><div class="qa-body">Run <code>ss -ltnp | grep :8000</code>, which lists listening TCP ports with the PID and program name, or <code>lsof -i :8000</code>. With the PID you can inspect it with <code>ps</code> and stop it with <code>kill</code>. Seeing other users' processes may require <code>sudo</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You set <code>API_KEY=abc</code> in the shell, but <code>os.getenv("API_KEY")</code> in Python returns None. Why?</summary><div class="qa-body">The variable was created as a shell variable but not exported, so child processes such as Python do not receive it. Use <code>export API_KEY=abc</code>, or set it just for one command with <code>API_KEY=abc python app.py</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is PATH, and why do you get "command not found" for something you installed?</summary><div class="qa-body">PATH is a colon-separated list of directories the shell searches, left to right, when you type a command name. "command not found" means the program's directory is not in that list, for example <code>~/.local/bin</code>, or it was installed into a different Python environment. Check with <code>which</code> and <code>echo $PATH</code>, then add the directory with <code>export PATH="/its/dir:$PATH"</code> in <code>~/.bashrc</code>. Activating a virtual environment works the same way: it prepends <code>.venv/bin</code> to PATH.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>set -euo pipefail</code> do, and why put it in every bash script?</summary><div class="qa-body"><code>-e</code> exits the script when a command fails, <code>-u</code> treats unset variables as errors instead of empty strings, and <code>-o pipefail</code> makes a pipeline fail if any stage fails rather than only the last. Without it a script can fail halfway, carry on, and report success, or run <code>rm</code> with an empty path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>bash -c 'false | true; echo $?'</code> print?</summary><div class="qa-body">It prints 0, because without pipefail the exit status of a pipeline is the status of its last command, and <code>true</code> succeeded. With <code>set -o pipefail</code> it prints 1. To see each stage's status, use bash's <code>PIPESTATUS</code> array.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a cron line that runs <code>/srv/app/report.sh</code> at 08:00 every weekday. What can go wrong?</summary><div class="qa-body"><code>0 8 * * 1-5 /srv/app/report.sh &gt;&gt; /var/log/report.log 2&gt;&amp;1</code>. cron runs jobs with <code>/bin/sh</code>, a minimal PATH (<code>/usr/bin:/bin</code>), no <code>.bashrc</code>, the home directory as working directory, and the server's time zone, so use absolute paths, set needed variables explicitly, and redirect output to a log you check.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does SSH key authentication work, and why are keys better than passwords?</summary><div class="qa-body">You generate a key pair and put the public key in the server's <code>~/.ssh/authorized_keys</code>. At login the server sends a challenge, the client signs it with the private key, and the server verifies the signature with the public key, so the private key never crosses the network. Keys cannot be guessed like passwords and can be revoked per machine; the private key must be kept at 600 or SSH refuses to use it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A server's disk is full. How do you find the cause?</summary><div class="qa-body">Start with <code>df -h</code> to see which filesystem is full, then <code>du -h --max-depth=1 /path | sort -h</code> and drill into the largest directory, or <code>find / -size +1G</code> for big files. Usual suspects are logs, data files, caches and Docker images. If space does not come back after deleting a log, a running process still holds the file open; restart it or truncate the file instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you keep a long-running job alive after you disconnect from SSH?</summary><div class="qa-body">Run it inside <code>tmux</code> (or <code>screen</code>) and detach, so it keeps running in a session you can reattach to, or start it with <code>nohup cmd &gt; job.log 2&gt;&amp;1 &amp;</code> so it ignores the hang-up signal. For jobs that must run regularly or always, use cron or a service manager such as systemd instead.</div></details>
</main>
`
});
