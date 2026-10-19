// notes/softeng/se_linux.js — Linux & Terminal
Object.assign(TOPIC_CONTENT, {
  "se_linux": `<main>
  <h1>Linux &amp; Terminal</h1>
  <p class="lead">Almost every model you train or deploy runs on a Linux machine you control by typing commands: a cloud VM, a GPU server, a Docker container. There is no mouse and no file explorer there. This note teaches the commands you need to move around, look inside data and logs, control who may read what, run long training jobs safely and automate them. No earlier note needed; it is the base for <a class="xref" data-note="se_docker">Docker</a> and <a class="xref" data-note="se_git">Git</a>.</p>

  <h2 id="sl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linux &amp; Terminal</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Filesystem &amp; navigation</div>
        <ul>
          <li><b>One tree from <code>/</code></b> — no C: or D:; disks are attached ("mounted") as folders</li>
          <li><b>Key dirs</b> — <code>/etc</code> config, <code>/home</code> users, <code>/var/log</code> logs, <code>/tmp</code> scratch, <code>/usr</code> programs, <code>/opt</code> add-ons</li>
          <li><b>Absolute</b> path starts with <code>/</code>; <b>relative</b> starts from where you are</li>
          <li><b>Moves</b> — <code>pwd</code>, <code>ls -la</code>, <code>cd dir</code>, <code>cd ..</code>, <code>cd ~</code>, <code>cd -</code></li>
          <li><b>Hidden files</b> start with a dot (<code>.env</code>); only <code>ls -a</code> shows them</li>
          <li>💡 full postal address vs "two doors down"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core commands</div>
        <ul>
          <li><b>Files</b> — <code>mkdir -p</code>, <code>cp -r</code>, <code>mv</code> (move = rename), <code>rm -r</code> (no recycle bin)</li>
          <li><b>Peek</b> — <code>head -n 5</code>, <code>tail -n 5</code>, <code>tail -f log</code> (follow live), <code>less</code></li>
          <li><b><code>wc -l</code></b> — line count; CSV rows = lines − 1</li>
          <li><b>grep</b> — search text: <code>-r</code> folders, <code>-n</code> line no., <code>-i</code> any case, <code>-v</code> not, <code>-c</code> count</li>
          <li><b>find</b> — search files: <code>-name "*.csv"</code>, <code>-size +100M</code>, <code>-mtime -1</code></li>
          <li>⚠ Never <code>cat</code> a 10 GB CSV; ⚠ <code>rm -rf</code> has no undo</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pipes &amp; redirection</div>
        <ul>
          <li><b>3 streams</b> — stdin (0) in, stdout (1) normal out, stderr (2) errors</li>
          <li><b>Pipe <code>|</code></b> — stdout of one → stdin of next</li>
          <li><b>Group-by count</b> — <code>awk '{print $4}' f | sort | uniq -c | sort -rn</code></li>
          <li><b>Redirects</b> — <code>&gt;</code> overwrite, <code>&gt;&gt;</code> append, <code>2&gt;</code> errors, <code>&gt; f 2&gt;&amp;1</code> both, <code>&lt;</code> input</li>
          <li><b><code>/dev/null</code></b> — black hole for unwanted output</li>
          <li>⚠ <code>uniq</code> merges only neighbours → sort first; ⚠ <code>cut -d,</code> breaks on quoted commas</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Permissions</div>
        <ul>
          <li><b><code>-rwxr-xr-x</code></b> — type + owner / group / others × read, write, execute</li>
          <li><b>Numbers</b> — r=4 w=2 x=1 → 755 scripts &amp; dirs, 644 files, 600 secrets/SSH keys, 640 owner rw + group r</li>
          <li><b>chmod</b> — <code>chmod +x run.sh</code>, <code>chmod 600 .env</code>, <code>chmod u-x,g+w f</code></li>
          <li><b>chown</b> — <code>sudo chown asha:ds file</code> (owner:group), <code>-R</code> recursive</li>
          <li><b>Dir x bit</b> = may enter; <b>"Permission denied"</b> on <code>./script</code> → missing x</li>
          <li>⚠ <code>chmod -R 777</code> is not a fix; give the right user/group access</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Environment &amp; PATH</div>
        <ul>
          <li><b>Env var</b> — named setting every program can read (<code>HOME</code>, <code>PATH</code>, <code>API_KEY</code>)</li>
          <li><b><code>export X=1</code></b> — child programs see it; plain <code>X=1</code> = shell only; <code>X=1 cmd</code> = one command</li>
          <li><b>PATH</b> — folders searched left → right for a command; first match wins</li>
          <li><b>"command not found"</b> → not in PATH: <code>which</code>, <code>echo $PATH</code>; fix in <code>~/.bashrc</code></li>
          <li><b>venv activate</b> = put <code>.venv/bin</code> first in PATH</li>
          <li><b>Python</b> — <code>os.environ["X"]</code> required vs <code>os.getenv("X", default)</code> optional</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Processes &amp; jobs</div>
        <ul>
          <li><b>Process</b> — a running program with a PID</li>
          <li><b>Survive logout</b> — <code>nohup cmd &gt; log 2&gt;&amp;1 &amp;</code>, or <code>tmux</code>/<code>screen</code></li>
          <li><b>Inspect</b> — <code>ps aux</code>, <code>pgrep -f</code>, <code>top</code>/<code>htop</code>, <code>nvidia-smi</code>, <code>jobs</code></li>
          <li><b><code>kill PID</code></b> = SIGTERM 15 (polite, can save) → exit 143 if not handled</li>
          <li><b><code>kill -9</code></b> = SIGKILL (instant, no cleanup) → exit 137</li>
          <li><b>Keys</b> — Ctrl+C stop, Ctrl+Z pause, <code>bg</code>/<code>fg</code> resume</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bash scripting</div>
        <ul>
          <li><b>Header</b> — <code>#!/usr/bin/env bash</code> + <code>set -euo pipefail</code></li>
          <li><b>-e</b> stop on error · <b>-u</b> unset var = error · <b>pipefail</b> any pipe stage fails → pipe fails</li>
          <li><b>Exit code</b> — 0 ok, non-zero fail; <code>$?</code>; <code>exit 1</code> + message to <code>&gt;&amp;2</code></li>
          <li><b>Pieces</b> — <code>[[ -d "$D" ]]</code>, <code>for f in "$D"/*.csv</code>, <code>$(cmd)</code>, <code>a &amp;&amp; b || c</code>, <code>&#36;{1:-default}</code></li>
          <li>⚠ <code>X = 5</code> runs command X → write <code>X=5</code>; ⚠ always quote <code>"$var"</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SSH, scp &amp; cron</div>
        <ul>
          <li><b>Key login</b> — public key in server's <code>authorized_keys</code>; private key signs a challenge, never leaves</li>
          <li><b>Setup</b> — <code>ssh-keygen -t ed25519</code>, <code>ssh-copy-id user@host</code>; key file <code>chmod 600</code></li>
          <li><b>Tunnel</b> — <code>ssh -L 8888:localhost:8888 host</code> → remote Jupyter in local browser</li>
          <li><b>Copy</b> — <code>scp f host:dir</code>, <code>scp -r</code>; <code>rsync -avz</code> sends only changes</li>
          <li><b>cron</b> — <code>min hour day month weekday cmd</code>: <code>*/15 * * * *</code>, <code>0 3 * * *</code>, <code>0 8 * * 1-5</code></li>
          <li>⚠ cron: tiny PATH, no .bashrc, server time zone → absolute paths + log redirect</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Disk &amp; memory</div>
        <ul>
          <li><b><code>df -h</code></b> — free space per disk · <b><code>du -sh dir</code></b> — size of folders</li>
          <li><b>Biggest dirs</b> — <code>du -h --max-depth=1 . | sort -h</code></li>
          <li><b><code>free -h</code></b> — read <b>available</b>, not "free" (cache is given back)</li>
          <li><b><code>nproc</code></b> CPUs · <b><code>nvidia-smi</code></b> GPU memory</li>
          <li><b>Silent death</b> — exit 137 + <code>dmesg | grep -i "killed process"</code> = out-of-memory killer</li>
          <li><b>Usual disk hogs</b> — checkpoints, logs, Docker images, pip / Hugging Face caches</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sl-fs"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Filesystem &amp; Navigation</span><span class="rm-sub">One tree from /</span></div></div>
      <div class="rm-item rm-done" data-target="sl-cmds"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Core Commands</span><span class="rm-sub">Files, search, inspect</span></div></div>
      <div class="rm-item rm-done" data-target="sl-pipe"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Pipes &amp; Redirection</span><span class="rm-sub">Analyse a log in one line</span></div></div>
      <div class="rm-item rm-done" data-target="sl-perm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Permissions</span><span class="rm-sub">rwx, chmod, chown</span></div></div>
      <div class="rm-item rm-done" data-target="sl-env"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Environment &amp; PATH</span><span class="rm-sub">Config without code</span></div></div>
      <div class="rm-item rm-done" data-target="sl-proc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Processes &amp; Jobs</span><span class="rm-sub">ps, kill, nohup, signals</span></div></div>
      <div class="rm-item rm-done" data-target="sl-bash"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Bash Scripting</span><span class="rm-sub">Scripts that fail loudly</span></div></div>
      <div class="rm-item rm-done" data-target="sl-ssh"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">SSH, scp &amp; cron</span><span class="rm-sub">Remote boxes, schedules</span></div></div>
      <div class="rm-item rm-done" data-target="sl-res"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Disk &amp; Memory</span><span class="rm-sub">df, du, free, OOM</span></div></div>
      <div class="rm-item rm-done" data-target="sl-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that delete things</span></div></div>
      <div class="rm-item rm-done" data-target="sl-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sl-fs"><span class="num">01</span>Filesystem &amp; Navigation</h2>
  <p>On Windows you open File Explorer, click C:, then Users, then your name. On a remote Linux server there is no window to click. You get a blinking cursor after a <strong>prompt</strong> like <code>asha@gpu-box:~$</code>, and you must type to move around. First you need a picture of how files are arranged.</p>
  <p>Linux has <strong>one single tree</strong> of folders (also called directories). It starts at the root, written as a single slash <code>/</code>. There are no drive letters. A second disk or a USB stick is attached somewhere inside the tree, for example at <code>/mnt/data</code>; this is called <strong>mounting</strong>. Each user has a home folder under <code>/home</code>, and the shortcut <code>~</code> means "my home".</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <g stroke="currentColor" fill="none" stroke-width="1.2">
      <line x1="300" y1="38" x2="60" y2="70"/><line x1="300" y1="38" x2="160" y2="70"/><line x1="300" y1="38" x2="260" y2="70"/><line x1="300" y1="38" x2="350" y2="70"/><line x1="300" y1="38" x2="440" y2="70"/><line x1="300" y1="38" x2="535" y2="70"/>
      <line x1="160" y1="96" x2="160" y2="120"/>
    </g>
    <rect x="270" y="10" width="60" height="28" rx="6" class="fg sg"/><text x="300" y="29" text-anchor="middle">/</text>
    <rect x="25" y="70" width="70" height="26" rx="6" class="fb"/><text x="60" y="88" text-anchor="middle">/etc</text>
    <rect x="120" y="70" width="80" height="26" rx="6" class="fb"/><text x="160" y="88" text-anchor="middle">/home</text>
    <rect x="225" y="70" width="70" height="26" rx="6" class="fb"/><text x="260" y="88" text-anchor="middle">/var</text>
    <rect x="315" y="70" width="70" height="26" rx="6" class="fb"/><text x="350" y="88" text-anchor="middle">/tmp</text>
    <rect x="405" y="70" width="70" height="26" rx="6" class="fb"/><text x="440" y="88" text-anchor="middle">/usr</text>
    <rect x="500" y="70" width="70" height="26" rx="6" class="fb"/><text x="535" y="88" text-anchor="middle">/opt</text>
    <rect x="110" y="120" width="100" height="26" rx="6" class="ft st"/><text x="160" y="138" text-anchor="middle">/home/asha</text>
    <text x="60" y="114" text-anchor="middle" class="tm">config</text>
    <text x="260" y="114" text-anchor="middle" class="tm">logs</text>
    <text x="350" y="114" text-anchor="middle" class="tm">scratch</text>
    <text x="440" y="114" text-anchor="middle" class="tm">programs</text>
    <text x="535" y="114" text-anchor="middle" class="tm">add-on apps</text>
    <text x="160" y="164" text-anchor="middle" class="tm">~ (your home)</text>
  </svg><figcaption>One tree starting at / — no C: or D: drives. Extra disks are "mounted" as folders inside it.</figcaption></figure>
  <p>A <strong>path</strong> is the address of a file. An <strong>absolute path</strong> starts with <code>/</code> and works from anywhere: <code>/home/asha/project/data/raw/sales.csv</code>. A <strong>relative path</strong> starts from the folder you are in now (the <strong>current directory</strong>): if you are in <code>/home/asha/project</code>, the same file is <code>data/raw/sales.csv</code>. Two special names: <code>.</code> means "this folder" and <code>..</code> means "the folder above".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Giving directions to your house. Absolute path = full postal address: "India, Maharashtra, Pune, Kothrud, Lane 4, House 12". It works from anywhere. Relative path = "from the chai stall, two lanes left". It only works if you are standing at the chai stall.</p>
  </div>
  <p>Worked example: Asha logs in, checks where she is, looks around, walks into a sub-folder and back. Five commands do all of it: <code>pwd</code> (print working directory), <code>ls</code> (list), <code>cd</code> (change directory).</p>
  <div class="fx" data-lang="text">$ pwd
/home/asha/project
$ ls
data  logs  src
$ ls -la
total 24
drwxr-xr-x 5 asha asha 4096 Oct 19 04:22 .
drwx------ 3 asha asha 4096 Oct 19 04:22 ..
-rw-r--r-- 1 asha asha   15 Oct 19 04:22 .env
drwxr-xr-x 3 asha asha 4096 Oct 19 04:22 data
drwxr-xr-x 2 asha asha 4096 Oct 19 04:22 logs
drwxr-xr-x 2 asha asha 4096 Oct 19 04:22 src
$ cd data/raw             # relative: from here, go down two levels
$ pwd
/home/asha/project/data/raw
$ cd ../..                # up two levels
$ cd /var/log             # absolute: works from anywhere
$ cd -                    # back to the previous folder
/home/asha/project
$ cd ~                    # home
$ pwd
/home/asha</div>
  <p>Plain <code>ls</code> showed three folders but hid <code>.env</code>, because names starting with a dot are <strong>hidden</strong>. <code>ls -la</code> shows all (<code>-a</code>) in long form (<code>-l</code>): permissions, owner, size, date, name (section 04 decodes the first column; a leading <code>d</code> means directory). <code>cd -</code> printed the folder it jumped back to. Press <strong>Tab</strong> while typing a path and the shell completes it; this avoids most typos.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shell</strong>: the program that reads your typed commands and runs them; <strong>bash</strong> is the usual one (zsh on Macs). <strong>Terminal</strong>: the window showing the shell. <strong>Working directory</strong>: the folder relative paths start from.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Linux names are case-sensitive and spaces matter: <code>Data/</code> and <code>data/</code> are different folders, and <code>cd my data</code> fails. Prefer lower-case names with <code>_</code> or <code>-</code>; if a name has a space, quote it: <code>cd "my data"</code>.</p>
  </div>

  <h2 id="sl-cmds"><span class="num">02</span>Core Commands</h2>
  <p>A teammate says "the new sales file is somewhere on the server, check whether it has the Pune rows and how many lines it has". With a mouse you would open folders and a spreadsheet. On a server you do it with a handful of small commands. Each does one job, and you will use them every single day.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kitchen with separate tools instead of one machine: a knife (cut), a grater, a sieve, a measuring cup. Each is simple; a cook combines them. <code>head</code> is tasting a spoon from the top of the pot; <code>grep</code> is picking out only the green chillies; <code>wc -l</code> is counting the rotis.</p>
  </div>
  <table class="tbl">
    <tr><th>Need</th><th>Command</th><th>Note</th></tr>
    <tr><td>Make folders</td><td><code>mkdir -p a/b/c</code></td><td><code>-p</code>: create parents, no error if it exists</td></tr>
    <tr><td>Copy / move / rename</td><td><code>cp -r src dst</code>, <code>mv a b</code></td><td><code>-r</code> (recursive) needed for folders</td></tr>
    <tr><td>Delete</td><td><code>rm file</code>, <code>rm -r dir</code></td><td>No recycle bin, no undo</td></tr>
    <tr><td>Peek at a file</td><td><code>head -n 5</code>, <code>tail -n 5</code>, <code>less</code></td><td><code>less</code> scrolls; <code>q</code> to quit</td></tr>
    <tr><td>Follow a growing log</td><td><code>tail -f train.log</code></td><td>Ctrl+C to stop watching</td></tr>
    <tr><td>Count lines</td><td><code>wc -l file</code></td><td>CSV rows = lines − 1 (header)</td></tr>
    <tr><td>Search text in files</td><td><code>grep -rn "API_KEY" src/</code></td><td><code>-i</code> any case, <code>-v</code> invert, <code>-c</code> count</td></tr>
    <tr><td>Find files by name/size/age</td><td><code>find . -name "*.csv" -size +100M</code></td><td><code>-mtime -1</code> = changed in the last day</td></tr>
  </table>
  <p>Worked example on Asha's project. Step 1: make a folder for an experiment and copy the data in. Step 2: make a backup of <code>src</code>, rename it, delete it. Step 3: look at the top and bottom of the CSV and count lines. Step 4: search inside files. Step 5: find files.</p>
  <div class="fx" data-lang="text">$ mkdir -p experiments/2024/run1
$ cp data/raw/sales.csv experiments/2024/run1/
$ cp -r src src_backup
$ mv src_backup old_src
$ ls
data  experiments  logs  old_src  src
$ rm -r old_src
$ head -n 3 data/raw/sales.csv
order_id,city,amount
100,Mumbai,880
101,Mumbai,500
$ tail -n 2 data/raw/sales.csv
103,Mumbai,1150
104,Pune,120
$ wc -l data/raw/sales.csv
6 data/raw/sales.csv
$ grep -rn "API_KEY" src/
src/app.py:2:KEY = os.environ["API_KEY"]
$ grep -c Mumbai data/raw/sales.csv
3
$ grep -v Mumbai data/raw/sales.csv
order_id,city,amount
102,Delhi,150
104,Pune,120
$ find . -name "*.csv"
./experiments/2024/run1/sales.csv
./data/raw/sales.csv
$ find . -name "*.csv" -mtime -1
./experiments/2024/run1/sales.csv</div>
  <p>Point at the important lines. <code>mkdir -p</code> made three nested folders at once. <code>mv</code> both moves and renames; there is no separate rename command. <code>wc -l</code> says 6 lines, so the CSV has 5 data rows. <code>grep -rn</code> searched every file under <code>src/</code> (<code>-r</code>) and printed file name, line number (<code>-n</code>) and the line: perfect for "where is this key used?". <code>-c</code> counted matching lines, <code>-v</code> printed lines that do <em>not</em> match. The last <code>find</code> listed only the copy: <code>cp</code> gave it a new modified time, while the original is older than a day.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Flag / option</strong>: a switch after the command that changes its behaviour, like <code>-n 3</code> or <code>-r</code>. Short flags can be combined: <code>ls -l -a</code> = <code>ls -la</code>. <code>man grep</code> or <code>grep --help</code> lists them all.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>cat big.csv</code> on a 10 GB file floods your terminal for minutes. Use <code>head</code>, <code>tail</code> or <code>less</code>. And <code>rm -rf</code> deletes instantly with no recycle bin; double-check the path, especially when it contains a variable (section 07 shows how an empty variable makes it dangerous).</p>
  </div>

  <h2 id="sl-pipe"><span class="num">03</span>Pipes &amp; Redirection</h2>
  <p>Your API is returning errors and your manager asks: "how many requests failed, and which status codes are most common?" You could copy the log into Excel. Or you can answer in one line, on the server, in a second, even if the log is 5 GB. The trick is to chain small commands so the output of one becomes the input of the next.</p>
  <p>Every program has three <strong>streams</strong>. <strong>stdin</strong> (standard input, number 0) is where it reads from. <strong>stdout</strong> (standard output, 1) is where normal results go. <strong>stderr</strong> (standard error, 2) is where error messages go. By default all of them are your terminal. A <strong>pipe</strong> <code>|</code> connects one program's stdout to the next program's stdin. A <strong>redirect</strong> (<code>&gt;</code>, <code>&lt;</code>) connects a stream to a file.</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <defs><marker id="sl-arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="5" y="30" width="95" height="44" rx="8" class="fs"/><text x="52" y="57" text-anchor="middle">access.log</text>
    <rect x="125" y="30" width="105" height="44" rx="8" class="fb sb"/><text x="177" y="57" text-anchor="middle">awk $4</text>
    <rect x="255" y="30" width="70" height="44" rx="8" class="fb sb"/><text x="290" y="57" text-anchor="middle">sort</text>
    <rect x="350" y="30" width="95" height="44" rx="8" class="fb sb"/><text x="397" y="57" text-anchor="middle">uniq -c</text>
    <rect x="470" y="30" width="125" height="44" rx="8" class="fg sg"/><text x="532" y="57" text-anchor="middle">sort -rn</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="101" y1="52" x2="121" y2="52" marker-end="url(#sl-arr1)"/><line x1="231" y1="52" x2="251" y2="52" marker-end="url(#sl-arr1)"/><line x1="326" y1="52" x2="346" y2="52" marker-end="url(#sl-arr1)"/><line x1="446" y1="52" x2="466" y2="52" marker-end="url(#sl-arr1)"/></g>
    <text x="300" y="100" text-anchor="middle" class="tm">stdout of each command becomes stdin of the next</text>
  </svg><figcaption>Small tools, each doing one job, chained with | — a SQL GROUP BY in one line.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sugarcane juice stall. Cane goes into the crusher, juice flows into the strainer, then into the glass with ice. Each machine does one step and hands its output straight to the next. Nobody stores the half-done juice in a bucket in between.</p>
  </div>
  <p>The log has one request per line: time, method, path, status, latency. Watch the data change at each stage of the pipe:</p>
  <table class="tbl">
    <tr><th>Stage</th><th>Output (8 lines in)</th></tr>
    <tr><td><code>awk '{print $4}'</code></td><td>200 200 200 500 200 404 500 200 (4th field of each line)</td></tr>
    <tr><td><code>| sort</code></td><td>200 200 200 200 200 404 500 500 (equal values now neighbours)</td></tr>
    <tr><td><code>| uniq -c</code></td><td>5 200 · 1 404 · 2 500 (collapse neighbours, count them)</td></tr>
    <tr><td><code>| sort -rn</code></td><td>5 200 · 2 500 · 1 404 (numeric, biggest first)</td></tr>
  </table>
  <div class="fx" data-lang="text">$ head -n 3 logs/access.log
2024-06-01T10:00:01 GET /predict 200 45ms
2024-06-01T10:00:02 GET /predict 200 51ms
2024-06-01T10:00:02 GET /health 200 2ms
$ wc -l logs/access.log
8 logs/access.log
$ grep " 500 " logs/access.log | wc -l          # how many server errors?
2
$ awk '{print $4}' logs/access.log | sort | uniq -c | sort -rn
      5 200
      2 500
      1 404
$ awk '{print $4}' logs/access.log | uniq -c    # forgot sort!
      3 200
      1 500
      1 200
      1 404
      1 500
      1 200</div>
  <p><code>awk '{print $4}'</code> splits each line on spaces and prints the 4th field. The full pipe answers the question: 5 OK, 2 server errors, 1 not-found. The last command shows the classic bug: without <code>sort</code>, <code>uniq</code> only merges <em>neighbouring</em> equal lines, so 200 appears three times. The same idea works on a CSV: skip the header, cut out a column, count; or let <code>awk</code> sum a column per group:</p>
  <div class="fx" data-lang="text">$ tail -n +2 data/raw/sales.csv | cut -d, -f2 | sort | uniq -c | sort -rn
      3 Mumbai
      1 Pune
      1 Delhi
$ awk -F, 'NR&gt;1 {s[$2]+=$3} END {for (c in s) print c, s[c]}' data/raw/sales.csv | sort -k2 -rn
Mumbai 2530
Delhi 150
Pune 120</div>
  <p><code>tail -n +2</code> means "from line 2 on" (drops the header). <code>cut -d, -f2</code> splits on commas and keeps field 2 (city). In the awk line, <code>-F,</code> sets the separator, <code>NR&gt;1</code> skips line 1, and <code>s[$2]+=$3</code> adds each amount to its city: that is <code>SELECT city, SUM(amount) … GROUP BY city</code>.</p>
  <p>Now redirection. Errors go to stderr, so <code>&gt;</code> alone does not capture them:</p>
  <div class="fx" data-lang="text">$ grep 500 logs/access.log &gt; errors.txt        # stdout into a file (overwrite)
$ echo "checked at 10:05" &gt;&gt; errors.txt          # append
$ wc -l errors.txt
3 errors.txt
$ ls data nosuchdir &gt; out.txt
ls: cannot access 'nosuchdir': No such file or directory
$ cat out.txt
data:
raw
$ ls data nosuchdir &gt; out.txt 2&gt; err.txt        # each stream to its own file
$ cat err.txt
ls: cannot access 'nosuchdir': No such file or directory
$ ls data nosuchdir &gt; all.txt 2&gt;&amp;1             # both streams into one file
$ cat all.txt
ls: cannot access 'nosuchdir': No such file or directory
data:
raw
$ wc -l &lt; data/raw/sales.csv                    # file as stdin (no name printed)
6</div>
  <p>With only <code>&gt; out.txt</code>, the error still appeared on screen because it went to stream 2. <code>2&gt; err.txt</code> sent it to its own file. <code>2&gt;&amp;1</code> means "send stream 2 to wherever stream 1 is going", so both ended in <code>all.txt</code>. Send unwanted output to <code>/dev/null</code>, a special file that throws away everything written to it.</p>
  <table class="tbl">
    <tr><th>Syntax</th><th>Meaning</th></tr>
    <tr><td><code>cmd &gt; out.txt</code></td><td>stdout to file (overwrite)</td></tr>
    <tr><td><code>cmd &gt;&gt; out.txt</code></td><td>stdout to file (append)</td></tr>
    <tr><td><code>cmd 2&gt; err.txt</code></td><td>stderr to file</td></tr>
    <tr><td><code>cmd &gt; all.log 2&gt;&amp;1</code></td><td>both streams to one file (order matters: file first)</td></tr>
    <tr><td><code>cmd &lt; in.txt</code></td><td>file as stdin</td></tr>
    <tr><td><code>a | b</code></td><td>stdout of a becomes stdin of b</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pipeline</strong>: commands joined by <code>|</code>; they run at the same time, streaming data, so a 5 GB log never has to fit in memory. <strong>File descriptor</strong>: the number of a stream (0, 1, 2).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>&gt;</code> empties the file before the command runs, so <code>sort data.csv &gt; data.csv</code> leaves you with an empty file. Write to a new name, then <code>mv</code>. And <code>cut -d,</code> breaks on quoted commas like <code>"Mumbai, MH"</code>; use pandas or <code>csvkit</code> for real CSVs.</p>
  </div>

  <h2 id="sl-perm"><span class="num">04</span>Permissions</h2>
  <p>A shared GPU server has ten users. Without rules, anyone could read your <code>.env</code> with the database password, or delete your checkpoints. And you have probably already seen <code>Permission denied</code> when trying to run your own script. Both come from the same system: every file has an <strong>owner</strong>, a <strong>group</strong>, and three sets of permissions.</p>
  <p>Three kinds of access: <strong>r</strong> (read the content), <strong>w</strong> (write / change it), <strong>x</strong> (execute: run it as a program). Three kinds of people: the <strong>owner</strong> (u, user), members of the file's <strong>group</strong> (g, for example a <code>ds</code> team group), and <strong>others</strong> (o, everybody else). That gives the 9 letters you see in <code>ls -l</code>, after one character for the type (<code>-</code> file, <code>d</code> directory).</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <rect x="20" y="20" width="40" height="36" rx="5" class="fs"/><text x="40" y="43" text-anchor="middle">-</text>
    <rect x="70" y="20" width="120" height="36" rx="5" class="fb sb"/><text x="130" y="43" text-anchor="middle">r w x</text>
    <rect x="200" y="20" width="120" height="36" rx="5" class="ft st"/><text x="260" y="43" text-anchor="middle">r - x</text>
    <rect x="330" y="20" width="120" height="36" rx="5" class="fg sg"/><text x="390" y="43" text-anchor="middle">r - x</text>
    <text x="40" y="76" text-anchor="middle" class="tm">type</text>
    <text x="130" y="76" text-anchor="middle">owner (u)</text><text x="260" y="76" text-anchor="middle">group (g)</text><text x="390" y="76" text-anchor="middle">others (o)</text>
    <text x="130" y="100" text-anchor="middle" class="tb">4+2+1 = 7</text><text x="260" y="100" text-anchor="middle" class="tb">4+0+1 = 5</text><text x="390" y="100" text-anchor="middle" class="tb">4+0+1 = 5</text>
    <text x="525" y="43" text-anchor="middle" class="tg">= 755</text>
    <text x="525" y="70" text-anchor="middle" class="tm">r=4 w=2 x=1</text>
  </svg><figcaption>Ten characters: file type, then read/write/execute for owner, group and everyone else. Add the numbers per group.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A housing society. Your flat (owner) — you can enter, change and use everything. The society committee (group) — they can look at the notice board in your file but not change it. Visitors (others) — they see nothing. Each door has its own three locks: look, change, use.</p>
  </div>
  <p>The number form: r = 4, w = 2, x = 1, added per person. So <code>rwx</code> = 7, <code>rw-</code> = 6, <code>r-x</code> = 5, <code>r--</code> = 4, <code>---</code> = 0. <code>755</code> = owner everything, others read and run (scripts, folders). <code>644</code> = owner read/write, others read (normal files). <code>600</code> = only the owner can read/write (secrets, SSH keys). Worked example as user <code>asha</code>:</p>
  <div class="fx" data-lang="text">$ cat train.sh
#!/usr/bin/env bash
echo "training started"
$ ls -l train.sh
-rw-r--r-- 1 asha asha 44 Oct 19 04:22 train.sh
$ ./train.sh
bash: ./train.sh: Permission denied
$ chmod +x train.sh
$ ls -l train.sh
-rwxr-xr-x 1 asha asha 44 Oct 19 04:22 train.sh
$ ./train.sh
training started
$ chmod 600 .env
$ ls -l .env
-rw------- 1 asha asha 15 Oct 16  2024 .env
$ chmod u-x,g+w train.sh                         # symbolic form: who +/- what
$ ls -l train.sh
-rw-rwxr-x 1 asha asha 44 Oct 19 04:22 train.sh</div>
  <p>The columns of <code>ls -l</code>: permissions, link count, <strong>owner</strong>, <strong>group</strong>, size in bytes, modified time, name. The script failed only because nobody had <code>x</code>. <code>chmod +x</code> added it for all three. <code>chmod 600</code> locked <code>.env</code> to Asha. The symbolic form <code>u-x,g+w</code> removed execute from the owner and added write for the group. Now a second user, Ravi, tries to read Asha's files:</p>
  <div class="fx" data-lang="text">$ id                                             # as ravi
uid=1001(ravi) gid=1002(ravi) groups=1002(ravi)
$ cat /home/asha/project/.env
cat: /home/asha/project/.env: Permission denied
$ # admin gives the CSV to group ds, mode 640:  sudo chown asha:ds sales.csv
$ ls -l /home/asha/project/data/raw/sales.csv
-rw-r----- 1 asha ds 94 Jun  1  2024 /home/asha/project/data/raw/sales.csv
$ head -2 /home/asha/project/data/raw/sales.csv
head: cannot open '/home/asha/project/data/raw/sales.csv' for reading: Permission denied
$ # admin adds ravi to the ds group (sudo usermod -aG ds ravi), new login:
$ id
uid=1001(ravi) gid=1002(ravi) groups=1002(ravi),1001(ds)
$ head -2 /home/asha/project/data/raw/sales.csv
order_id,city,amount
100,Mumbai,880
$ echo hack &gt;&gt; /home/asha/project/data/raw/sales.csv
bash: /home/asha/project/data/raw/sales.csv: Permission denied</div>
  <p>Ravi is "others" for <code>.env</code> (600), so he is blocked. <code>chown asha:ds</code> set owner asha and group ds. Mode 640 gives the group read only. Once Ravi joined <code>ds</code> he could read the CSV, but writing still failed: the group has <code>r</code>, not <code>w</code>. That is exactly the "team can read the data, only the owner can change it" rule you want.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>chmod</strong> changes mode (permissions). <strong>chown</strong> changes owner and group (needs <code>sudo</code>, i.e. admin rights). For a <strong>directory</strong>: r = list names, w = create/delete files inside, x = enter it. <strong>root</strong> is the admin user who bypasses read/write checks.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>chmod -R 777</code> "fixes" every permission error by letting everyone write everything, including your secrets and code. Find out which user needs which access and grant just that (often via a group). SSH also refuses private keys that others can read; they must be 600.</p>
  </div>

  <h2 id="sl-env"><span class="num">05</span>Environment Variables &amp; PATH</h2>
  <p>Your API needs a database password. If you write it in <code>app.py</code>, it ends up in Git and in every copy of the code. Also, the dev server and the production server need <em>different</em> databases, but you want the same code on both. The answer is to keep such settings outside the code, in <strong>environment variables</strong>.</p>
  <p>An environment variable is a name = value pair that the shell keeps and hands to every program it starts. Some are already set: <code>HOME</code> (your home folder), <code>USER</code> (your name), <code>PATH</code> (where to find commands). You read one with <code>$NAME</code>. A program receives a <em>copy</em> of the variables only if they are <strong>exported</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A parent's instructions to a babysitter. Notes you only <em>think</em> (a shell variable) help nobody else. Notes you write on the fridge (exported) are seen by everyone who enters the house afterwards (child programs). The babysitter can change her copy, but your original notebook stays the same.</p>
  </div>
  <div class="fx" data-lang="text">$ echo $HOME $USER
/home/asha asha
$ MODEL_PATH=/models/rf.pkl                  # shell variable only
$ echo $MODEL_PATH
/models/rf.pkl
$ python -c 'import os; print(os.getenv("MODEL_PATH"))'
None
$ export MODEL_PATH                          # now child programs get it
$ python -c 'import os; print(os.getenv("MODEL_PATH"))'
/models/rf.pkl
$ DEBUG=true python -c 'import os; print(os.getenv("DEBUG"))'   # for one command only
true
$ echo "[$DEBUG]"
[]</div>
  <p>Before <code>export</code>, the shell knew <code>MODEL_PATH</code> but Python (a child program) got <code>None</code>. After <code>export</code>, Python saw it. Writing <code>DEBUG=true</code> in front of a command sets it for that one command; the shell itself never kept it, so <code>$DEBUG</code> is empty afterwards. Normally you write <code>export X=value</code> in one go.</p>
  <p><strong>PATH</strong> answers a question beginners never ask: when you type <code>python</code>, which file runs? The shell looks through the folders listed in <code>PATH</code>, left to right, and runs the first match. "command not found" means: not in any of those folders.</p>
  <div class="flow"><span>you type python</span><span>shell scans each folder in $PATH, left → right</span><span>first match runs</span></div>
  <div class="fx" data-lang="text">$ echo $PATH
/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$ which python
/usr/local/bin/python
$ mytool                                     # a script in ~/bin
bash: mytool: command not found
$ export PATH="$HOME/bin:$PATH"              # prepend ~/bin
$ mytool
hello from mytool
$ python -m venv .venv &amp;&amp; source .venv/bin/activate
$ echo $PATH
/home/asha/project/.venv/bin:/home/asha/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$ which python
/home/asha/project/.venv/bin/python
$ deactivate &amp;&amp; which python
/usr/local/bin/python</div>
  <p><code>which</code> shows the file that would run. Adding <code>$HOME/bin</code> to the front of PATH made <code>mytool</code> findable. And here is the secret of virtual environments: <code>activate</code> just puts <code>.venv/bin</code> first in PATH, so <code>python</code> and <code>pip</code> now mean the venv's copies. To keep a PATH change after logout, put the <code>export</code> line in <code>~/.bashrc</code>, which bash runs at every start.</p>
  <p>In Python, read required settings with <code>os.environ["X"]</code> (crash early with a clear error) and optional ones with <code>os.getenv("X", default)</code>:</p>
  <div class="fx" data-lang="py">import os
debug = os.getenv("DEBUG", "false") == "true"   # optional, with a default
print("debug:", debug)
db_url = os.environ["DATABASE_URL"]               # required: crash early if missing
print("db:", db_url)</div>
  <div class="fx" data-lang="text">$ python envcheck.py
debug: False
Traceback (most recent call last):
  ...
KeyError: 'DATABASE_URL'
$ DATABASE_URL=postgresql://db:5432/ml DEBUG=true python envcheck.py
debug: True
db: postgresql://db:5432/ml</div>
  <p>Without <code>DATABASE_URL</code> the script stops at line 4 with a <code>KeyError</code> naming the missing setting, before doing any work. That is far better than running for an hour with a wrong default. Note that env values are always strings: <code>"false"</code> is truthy in Python, hence the <code>== "true"</code> comparison.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Environment variable</strong>: a key-value string passed from a parent process to its children. <strong>12-factor app</strong> rule: keep config (URLs, secrets, feature flags) in the environment, so the same code or Docker image runs in dev, staging and prod.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Editing <code>~/.bashrc</code> does nothing to the terminal already open; run <code>source ~/.bashrc</code> or open a new one. And <code>export PATH=~/bin</code> (without <code>:$PATH</code>) replaces the whole list, after which even <code>ls</code> is "command not found".</p>
  </div>

  <h2 id="sl-proc"><span class="num">06</span>Processes &amp; Background Jobs</h2>
  <p>You SSH into a GPU server and start a 6-hour training run. Your Wi-Fi drops after 20 minutes. When you reconnect, the training is dead, because it was attached to your terminal session, and the session ended. You also need to know how to check whether a job is still running, how much CPU and memory it uses, and how to stop it without corrupting the checkpoint.</p>
  <p>Every running program is a <strong>process</strong> with a number called the <strong>PID</strong> (process ID). You can run a process in the <strong>foreground</strong> (it holds your terminal until it ends) or the <strong>background</strong> (add <code>&amp;</code>; you get the prompt back). <code>nohup</code> ("no hang-up") makes a process ignore the signal sent when your session closes. To stop a process you send it a <strong>signal</strong>, a small message from the operating system.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Closing a shop. <strong>SIGTERM</strong> is the owner saying "we close in five minutes": staff finish the bill, count cash, lock the safe. <strong>SIGKILL</strong> is the electricity board cutting the power: everything stops mid-bill and the safe stays open. A training script killed with <code>-9</code> never writes its last checkpoint.</p>
  </div>
  <p>Here is a fake training script that prints a step every second. Before the loop it tells Python: "when SIGTERM arrives, run <code>save_and_exit</code>". That is how real trainers save a checkpoint on a polite stop.</p>
  <div class="fx" data-lang="py">import signal, sys, time

def save_and_exit(signum, frame):
    print(f"got signal {signum}, saving checkpoint...", flush=True)
    sys.exit(0)

signal.signal(signal.SIGTERM, save_and_exit)   # run our function on a polite kill

step = 0
while True:
    step += 1
    print(f"step {step}", flush=True)
    time.sleep(1)</div>
  <p>Now run it in the background, check on it, and stop it politely; then run it again and kill it hard.</p>
  <div class="fx" data-lang="text">$ nohup python3 train.py &gt; train.log 2&gt;&amp;1 &amp;    # background, survives logout, log to file
$ jobs -l
[1]+ 24329 Running                 nohup python3 train.py &gt; train.log 2&gt;&amp;1 &amp;
$ ps -o pid,stat,%cpu,%mem,etime,cmd -p 24329
  PID STAT %CPU %MEM     ELAPSED CMD
24329 S     0.2  0.0       00:03 python3 train.py
$ tail -n 2 train.log
step 3
step 4
$ kill 24329                                     # SIGTERM (15)
$ tail -n 2 train.log
step 4
got signal 15, saving checkpoint...
$ # second run, then:
$ kill -9 24414                                  # SIGKILL
$ tail -n 2 train.log
step 2
step 3</div>
  <p><code>jobs -l</code> lists background jobs of this shell with their PID. <code>ps</code> shows state (<code>S</code> = sleeping, waiting on <code>time.sleep</code>), CPU %, memory % and elapsed time. With plain <code>kill</code> the handler ran and the log ends with "saving checkpoint". With <code>kill -9</code> the log just stops at step 3: no handler, no checkpoint. A program can catch SIGTERM; nobody can catch SIGKILL.</p>
  <p>The <strong>exit code</strong> tells how a process ended. 0 = success. A process killed by a signal it did not handle gets 128 + signal number:</p>
  <div class="fx" data-lang="text">$ python3 train.py &gt; /dev/null &amp; sleep 1; kill $!; wait $!; echo "exit code: $?"
exit code: 0                                     # handler ran sys.exit(0)
$ sleep 100 &amp; sleep 0.2; kill $!; wait $!; echo "exit code: $?"
[1]+  Terminated              sleep 100
exit code: 143                                   # 128 + 15 (SIGTERM)
$ sleep 100 &amp; sleep 0.2; kill -9 $!; wait $!; echo "exit code: $?"
exit code: 137                                   # 128 + 9 (SIGKILL)</div>
  <p><code>$!</code> is the PID of the last background job; <code>wait</code> waits for it and <code>$?</code> holds its exit code. Remember <strong>137</strong>: you will see it when Docker or Kubernetes kills a container for using too much memory (section 09).</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Use</th></tr>
    <tr><td><code>ps aux</code> / <code>pgrep -f train.py</code></td><td>List all processes / find PIDs by command line</td></tr>
    <tr><td><code>top</code>, <code>htop</code>, <code>nvidia-smi</code></td><td>Live CPU, RAM and GPU usage</td></tr>
    <tr><td><code>kill PID</code> (SIGTERM 15)</td><td>Ask politely; process can save and exit</td></tr>
    <tr><td><code>kill -9 PID</code> (SIGKILL)</td><td>Force; no cleanup — last resort</td></tr>
    <tr><td>Ctrl+C / Ctrl+Z, <code>bg</code>, <code>fg</code></td><td>Interrupt (SIGINT) / pause, then resume in background / foreground</td></tr>
    <tr><td><code>nohup</code>, <code>tmux</code>, <code>screen</code></td><td>Keep jobs alive after the SSH session drops</td></tr>
  </table>
  <p><code>tmux</code> is the comfortable option: <code>tmux new -s train</code>, start the job, press Ctrl+B then D to detach, log out; later <code>tmux attach -t train</code> shows the live screen again.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Process</strong>: a running instance of a program, with PID, memory and open files. <strong>Signal</strong>: an asynchronous notification to a process: SIGINT (2, Ctrl+C), SIGTERM (15, default <code>kill</code>), SIGKILL (9, cannot be caught).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>python train.py &amp;</code> without <code>nohup</code>/<code>tmux</code> still dies when the session ends, and without <code>&gt; train.log 2&gt;&amp;1</code> its output is lost. Reaching for <code>kill -9</code> first can leave half-written checkpoint files and locked GPU memory; try plain <code>kill</code>, wait a few seconds, then <code>-9</code>.</p>
  </div>

  <h2 id="sl-bash"><span class="num">07</span>Bash Scripting Basics</h2>
  <p>You type the same five commands every morning: activate the venv, check the data folder, count rows, run training, copy the log. Typing is slow and error-prone, and cron (section 08) needs something it can run unattended. So you save the commands in a file: a <strong>bash script</strong>. The danger is that by default bash keeps going after an error, and a script that fails halfway can still report "success" to cron or CI.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe card handed to a new cook. A good card says "if the milk has gone sour, STOP and tell me". A bad card lets the cook carry on and serve sour kheer with a smile. <code>set -euo pipefail</code> is the "stop and tell me" line.</p>
  </div>
  <p>Here is a small, safe script. Read the comments first, then the run below it.</p>
  <div class="fx" data-lang="text">#!/usr/bin/env bash
set -euo pipefail

DATA_DIR="&#36;{1:-data}"          # first argument, default "data"
EPOCHS=3

if [[ ! -d "$DATA_DIR" ]]; then
  echo "ERROR: $DATA_DIR not found" &gt;&amp;2
  exit 1
fi

for f in "$DATA_DIR"/*.csv; do
  rows=$(tail -n +2 "$f" | wc -l)
  echo "$f has $rows rows"
done

for ((i=1; i&lt;=EPOCHS; i++)); do
  echo "epoch $i/$EPOCHS"
done</div>
  <p>Line by line. <code>#!/usr/bin/env bash</code> (the <strong>shebang</strong>) says which program runs this file. <code>&#36;{1:-data}</code> is "the first argument, or <code>data</code> if none was given". <code>[[ ! -d "$DATA_DIR" ]]</code> tests "is not a directory". <code>&gt;&amp;2</code> sends the error message to stderr, and <code>exit 1</code> reports failure. <code>$(...)</code> runs a command and pastes its output into the variable. The <code>for</code> loops walk over files and over numbers.</p>
  <div class="fx" data-lang="text">$ ./run.sh; echo "exit code: $?"
data/sales.csv has 5 rows
data/tiny.csv has 1 rows
epoch 1/3
epoch 2/3
epoch 3/3
exit code: 0
$ ./run.sh missing; echo "exit code: $?"
ERROR: missing not found
exit code: 1</div>
  <p>Now why <code>set -euo pipefail</code> matters. This tiny script is meant to clean old checkpoints in <code>$MODEL_DIR</code>, but somebody forgot to set that variable:</p>
  <div class="fx" data-lang="text">$ cat unsafe.sh
#!/usr/bin/env bash
cd "$MODEL_DIR"
echo "deleting old checkpoints in $(pwd)"
$ ./unsafe.sh; echo "exit code: $?"
deleting old checkpoints in /home/asha/demo
exit code: 0
$ ./safe.sh; echo "exit code: $?"            # same script + set -euo pipefail
./safe.sh: line 3: MODEL_DIR: unbound variable
exit code: 1
$ bash -c 'false | true; echo "without pipefail: $?"'
without pipefail: 0
$ bash -c 'set -o pipefail; false | true; echo "with pipefail: $?"'
with pipefail: 1</div>
  <p>The unsafe version ran <code>cd ""</code>, which silently stays in the current folder, and would have "cleaned" the wrong place while reporting success. With <code>-u</code>, using an unset variable is an error, so the safe version stopped at line 3 with exit code 1. The last two lines show <code>pipefail</code>: a pipeline normally reports only the <em>last</em> command's status, so a failing first stage is hidden.</p>
  <div class="cards">
    <div><b>set -e</b><p>Exit on the first failing command.</p></div>
    <div><b>set -u</b><p>Using an unset variable is an error, not "".</p></div>
    <div><b>set -o pipefail</b><p>A pipe fails if any stage fails, not just the last.</p></div>
    <div><b>Exit codes</b><p><code>0</code> = success, anything else = failure; read with <code>$?</code>.</p></div>
  </div>
  <p>Two more everyday pieces: <code>a &amp;&amp; b</code> runs b only if a succeeded; <code>a || c</code> runs c only if a failed.</p>
  <div class="fx" data-lang="text">$ grep -q Pune data/sales.csv &amp;&amp; echo "found Pune" || echo "no Pune"
found Pune
$ grep -q Chennai data/sales.csv &amp;&amp; echo "found Chennai" || echo "no Chennai"
no Chennai
$ X = 5
bash: X: command not found
$ f="my data.csv"; ls -l $f
ls: cannot access 'my': No such file or directory
ls: cannot access 'data.csv': No such file or directory
$ ls -l "$f"
-rw-r--r-- 1 asha asha 0 Oct 19 04:23 'my data.csv'</div>
  <p><code>grep -q</code> prints nothing and only sets the exit code, which is perfect for tests. <code>X = 5</code> with spaces is read as "run command X with arguments = and 5". And unquoted <code>$f</code> was split at the space into two names; <code>"$f"</code> kept it as one.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Exit status</strong>: integer 0–255 returned by every command; 0 means success. <strong>Shebang</strong>: the <code>#!</code> first line naming the interpreter. A script needs <code>chmod +x</code> to be run as <code>./run.sh</code> (or run it as <code>bash run.sh</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>rm -rf "$DIR/"</code> with an empty <code>DIR</code> becomes <code>rm -rf /</code>. Use <code>set -u</code>, quote every variable, and for deletes write <code>rm -rf "&#36;{DIR:?not set}/"</code>, which aborts if DIR is empty. For anything longer than ~50 lines, switch to Python.</p>
  </div>

  <h2 id="sl-ssh"><span class="num">08</span>SSH, scp &amp; cron</h2>
  <p>The GPU machine is in a data centre; you are at home. You need a safe way to log in, a way to copy a model up and results down, a way to open the server's Jupyter in your browser, and a way to run a job every night without being awake. These are <strong>SSH</strong>, <strong>scp/rsync</strong> and <strong>cron</strong>.</p>
  <p><strong>SSH</strong> (secure shell) gives you an encrypted terminal on another machine. Passwords can be guessed, so servers use <strong>key pairs</strong>: two linked files made together. The <strong>public key</strong> is like a padlock; you can give copies to every server. The <strong>private key</strong> is the only key that opens it and never leaves your laptop. At login the server sends a random challenge; your laptop signs it with the private key; the server checks the signature with the public key.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="sl-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="200" height="70" rx="8" class="fb sb"/><text x="110" y="45" text-anchor="middle">Your laptop</text><text x="110" y="68" text-anchor="middle" class="tm">id_ed25519 (private)</text>
    <rect x="390" y="20" width="200" height="70" rx="8" class="fg sg"/><text x="490" y="45" text-anchor="middle">GPU server</text><text x="490" y="68" text-anchor="middle" class="tm">authorized_keys (public)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="212" y1="45" x2="386" y2="45" marker-end="url(#sl-arr2)"/><line x1="388" y1="70" x2="214" y2="70" marker-end="url(#sl-arr2)"/></g>
    <text x="300" y="38" text-anchor="middle" class="tm">2. signed challenge</text><text x="300" y="86" text-anchor="middle" class="tm">1. random challenge</text>
    <text x="300" y="112" text-anchor="middle" class="tr">the private key never leaves your laptop</text>
  </svg><figcaption>Key-based login: the server holds your public key (the padlock), you hold the private key.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your signature at the bank. The bank keeps a specimen of your signature (public key). When you withdraw, you sign a fresh slip (the challenge) in front of them. They compare; they never need your hand. Anyone who sees the specimen still cannot forge your signing.</p>
  </div>
  <p>The commands below were not run here (no remote server in this sandbox); they are the standard ones.</p>
  <div class="fx" data-lang="text">ssh-keygen -t ed25519 -C "asha@laptop"        # once: creates ~/.ssh/id_ed25519 + id_ed25519.pub
ssh-copy-id asha@10.0.0.5                       # appends the .pub to server's ~/.ssh/authorized_keys
ssh asha@10.0.0.5                               # log in, no password
ssh -L 8888:localhost:8888 asha@10.0.0.5        # tunnel: server's Jupyter at your localhost:8888
scp model.pkl asha@10.0.0.5:/srv/models/        # copy a file up
scp -r asha@10.0.0.5:~/runs/exp42 ./            # copy a folder down
rsync -avz data/ asha@10.0.0.5:~/data/          # sync: sends only changed files</div>
  <p>The tunnel line is a DS favourite: Jupyter runs on the server's port 8888, which the internet cannot reach. <code>-L 8888:localhost:8888</code> forwards your laptop's port 8888 through the encrypted SSH connection, so <code>http://localhost:8888</code> in your browser shows the remote notebook. <code>rsync</code> beats <code>scp</code> for big folders because a second run copies only what changed.</p>
  <p><strong>cron</strong> is the built-in scheduler. Each line in your crontab (edit with <code>crontab -e</code>, list with <code>crontab -l</code>) has five time fields, then the command:</p>
  <figure class="viz"><svg viewBox="0 0 600 100" width="600">
    <rect x="20" y="15" width="90" height="34" rx="5" class="fb sb"/><text x="65" y="37" text-anchor="middle">30</text>
    <rect x="125" y="15" width="90" height="34" rx="5" class="fb sb"/><text x="170" y="37" text-anchor="middle">2</text>
    <rect x="230" y="15" width="90" height="34" rx="5" class="ft st"/><text x="275" y="37" text-anchor="middle">*</text>
    <rect x="335" y="15" width="90" height="34" rx="5" class="ft st"/><text x="380" y="37" text-anchor="middle">*</text>
    <rect x="440" y="15" width="90" height="34" rx="5" class="fg sg"/><text x="485" y="37" text-anchor="middle">1-5</text>
    <text x="65" y="70" text-anchor="middle" class="tm">minute</text><text x="170" y="70" text-anchor="middle" class="tm">hour</text><text x="275" y="70" text-anchor="middle" class="tm">day of month</text><text x="380" y="70" text-anchor="middle" class="tm">month</text><text x="485" y="70" text-anchor="middle" class="tm">weekday (0=Sun)</text>
    <text x="300" y="94" text-anchor="middle">= 02:30 every Monday to Friday</text>
  </svg><figcaption>Five time fields, then the command. * means "every"; */15 means "every 15th".</figcaption></figure>
  <table class="tbl">
    <tr><th>Schedule</th><th>Meaning</th></tr>
    <tr><td><code>*/15 * * * *</code></td><td>Every 15 minutes</td></tr>
    <tr><td><code>0 * * * *</code></td><td>Top of every hour</td></tr>
    <tr><td><code>0 3 * * *</code></td><td>Daily at 03:00 (nightly retrain)</td></tr>
    <tr><td><code>0 9 * * 1</code></td><td>Mondays 09:00 (weekly report)</td></tr>
    <tr><td><code>0 0 1 * *</code></td><td>Midnight on the 1st of each month</td></tr>
  </table>
  <div class="fx" data-lang="text">0 3 * * * cd /srv/ml &amp;&amp; /srv/ml/.venv/bin/python retrain.py &gt;&gt; /var/log/retrain.log 2&gt;&amp;1</div>
  <p>Read it: at minute 0 of hour 3, every day, go to the project, run the venv's Python by its full path, and append all output (both streams) to a log. Every part of that line is there for a reason, explained in the trap below.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SSH</strong>: encrypted remote login protocol (port 22). <strong>authorized_keys</strong>: the server-side list of public keys allowed to log in as that user. <strong>crontab</strong>: per-user table of scheduled commands run by the <code>cron</code> daemon (a background service).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>cron runs with a tiny PATH, without your <code>.bashrc</code>, from your home folder, in the server's time zone (often UTC, so "3 AM" may be 8:30 AM IST). Use absolute paths, set needed env vars in the line or script, and redirect output to a log, otherwise failures vanish silently. Bigger pipelines move to Airflow or a cloud scheduler.</p>
  </div>

  <h2 id="sl-res"><span class="num">09</span>Disk &amp; Memory Checks</h2>
  <p>Two classic mysteries. One: training crashes at epoch 7 with "No space left on device", because every epoch saved a 150 MB checkpoint and the logs grew. Two: training simply vanishes, with no Python traceback at all. Both are about resources, and four commands find the cause in a minute.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Disk is your cupboard: <code>df</code> tells how much shelf space is left in the whole cupboard, <code>du</code> tells how much each box on the shelf takes. Memory (RAM) is your work desk: big but limited, and when it overflows the "building manager" (the OOM killer) throws someone's papers out without asking.</p>
  </div>
  <div class="fx" data-lang="text">$ df -h /                       # free space per mounted disk
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        252G   30G  9.8G  75% /
$ du -sh data src checkpoints    # size of these folders
41M	data
12K	src
451M	checkpoints
$ du -h --max-depth=1 . | sort -h  # biggest sub-folders last
8.0K	./logs
12K	./src
16K	./experiments
41M	./data
451M	./checkpoints
491M	.
$ find . -type f -size +100M -exec ls -lh {} + | awk '{print $5, $9}'
150M ./checkpoints/epoch1.pt
150M ./checkpoints/epoch2.pt
150M ./checkpoints/epoch3.pt
$ free -h                        # RAM
               total        used        free      shared  buff/cache   available
Mem:            15Gi       2.2Gi       2.5Gi        75Mi        11Gi        13Gi
Swap:             0B          0B          0B
$ nproc                          # CPU cores
4</div>
  <p><code>-h</code> means human-readable (G, M, K). <code>df</code> reports the whole filesystem: 9.8 GB free. <code>du -sh</code> sums folders (<code>-s</code>), and the <code>--max-depth=1 | sort -h</code> pipe ranks sub-folders, which points straight at <code>checkpoints</code>. <code>find -size +100M</code> lists the offenders. In <code>free</code>, look at <strong>available</strong> (13 GB), not "free" (2.5 GB): Linux uses idle RAM as a file cache (<code>buff/cache</code>) and hands it back the moment a program needs it.</p>
  <p>Now the vanishing job. We ran a script that keeps grabbing 20 MB more memory, in a sandbox capped at 100 MB (a Docker container with <code>-m 100m</code>; see the Docker note):</p>
  <div class="fx" data-lang="py">data = []
for i in range(50):
    data.append(bytearray(20 * 1024 * 1024))     # 20 MB more each time
    print("allocated", (i + 1) * 20, "MB", flush=True)</div>
  <div class="fx" data-lang="text">allocated 20 MB
allocated 40 MB
allocated 60 MB
allocated 80 MB
exit code: 137
$ dmesg | grep -i "killed process"
[ 2076.145406] Memory cgroup out of memory: Killed process 25470 (python) total-vm:116612kB, anon-rss:101760kB, file-rss:5472kB, shmem-rss:0kB, UID:0 pgtables:264kB oom_score_adj:0</div>
  <p>No Python error was printed: the process was killed from outside with SIGKILL, so the exit code is 137 (128 + 9). The kernel log (<code>dmesg</code>, often needs <code>sudo</code>) names the culprit: the <strong>OOM killer</strong> (out-of-memory) killed <code>python</code> using about 100 MB (<code>anon-rss</code>). Fixes: smaller batch size, load data in chunks, use lighter dtypes (float32 instead of float64), or a bigger machine.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>df</strong> = disk free (per filesystem). <strong>du</strong> = disk usage (per file/folder). <strong>OOM killer</strong>: kernel feature that kills a process when memory runs out. <strong>Swap</strong>: disk used as slow overflow RAM (often 0 on servers).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deleting a big log file that a running process still writes to does not free the space until that process closes it; truncate it with <code>: &gt; app.log</code> instead, or restart the process. Also check hidden space hogs: <code>~/.cache/pip</code>, <code>~/.cache/huggingface</code>, and Docker images (<code>docker system df</code>).</p>
  </div>

  <h2 id="sl-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: rm with a variable</span>
    <p><code>rm -rf $DIR/*</code> with an empty DIR deletes from <code>/</code>. Quote, use <code>set -u</code>, and <code>&#36;{DIR:?}</code>. Run <code>ls</code> with the same path first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: uniq without sort</span>
    <p><code>uniq -c</code> counts only adjacent duplicates. Always <code>sort | uniq -c</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: redirect onto the input</span>
    <p><code>cmd file &gt; file</code> empties the file before reading. Write to a temp name and <code>mv</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: chmod 777</span>
    <p>It hides the real problem and lets anyone change your code and read secrets. Fix the owner/group instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting export / .bashrc reload</span>
    <p>A variable without <code>export</code> is invisible to Python. A <code>.bashrc</code> change needs <code>source ~/.bashrc</code> or a new terminal.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: long job tied to the terminal</span>
    <p>Wi-Fi drops, job dies. Use <code>tmux</code> or <code>nohup … &gt; log 2&gt;&amp;1 &amp;</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: kill -9 first</span>
    <p>No cleanup, no checkpoint, possible corrupt files. Send SIGTERM first and give it a few seconds.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: cron "works in my terminal"</span>
    <p>cron has a minimal PATH and no .bashrc. Absolute paths, explicit env vars, output redirected to a log.</p>
  </div>

  <h2 id="sl-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Absolute vs relative path? What do <code>.</code>, <code>..</code> and <code>~</code> mean?</summary><div class="qa-body">An absolute path starts at <code>/</code> and works from anywhere; a relative path starts from the current directory. <code>.</code> = this folder, <code>..</code> = parent folder, <code>~</code> = your home folder.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the 3 most frequent IPs in an access log where IP is the first field.</summary><div class="qa-body"><code>awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -3</code>. Sort first because <code>uniq</code> only collapses adjacent lines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you count the data rows of a CSV and see its first 5 lines without opening it?</summary><div class="qa-body"><code>wc -l file.csv</code> minus 1 for the header (or <code>tail -n +2 file.csv | wc -l</code>), and <code>head -n 5 file.csv</code>. Never <code>cat</code> a huge file.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>&gt;</code>, <code>&gt;&gt;</code>, <code>2&gt;</code> and <code>2&gt;&amp;1</code>?</summary><div class="qa-body"><code>&gt;</code> writes stdout to a file (overwrite), <code>&gt;&gt;</code> appends, <code>2&gt;</code> redirects stderr, <code>&gt; f 2&gt;&amp;1</code> sends stderr to wherever stdout goes, so both end up in <code>f</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>chmod 640 file</code> mean?</summary><div class="qa-body">Owner 6 = read+write, group 4 = read, others 0 = nothing. Shown as <code>-rw-r-----</code>. Good for data a team may read but only the owner may change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>./train.sh</code> says "Permission denied". Why, and the fix?</summary><div class="qa-body">The file lacks the execute bit. <code>chmod +x train.sh</code>, or run it as <code>bash train.sh</code>. If the error is on a folder, you need <code>x</code> on the directory to enter it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"python: command not found" but Python is installed. Why?</summary><div class="qa-body">Its folder isn't in <code>PATH</code>, or the binary is named <code>python3</code>. Check <code>which python3</code> and <code>echo $PATH</code>; add the folder with <code>export PATH="/its/bin:$PATH"</code> in <code>~/.bashrc</code>, or activate the virtualenv.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You set <code>API_KEY=abc</code> in the shell but Python's <code>os.getenv("API_KEY")</code> returns None. Why?</summary><div class="qa-body">It was not exported, so child processes don't receive it. Use <code>export API_KEY=abc</code> or <code>API_KEY=abc python app.py</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your training job dies when your SSH connection drops. Fix it.</summary><div class="qa-body">Run it inside <code>tmux</code>/<code>screen</code> and detach, or <code>nohup python train.py &gt; train.log 2&gt;&amp;1 &amp;</code>. For production use a scheduler or a service (systemd, Airflow, a job queue).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>kill vs kill -9?</summary><div class="qa-body"><code>kill</code> sends SIGTERM: the process can catch it, save state and exit. <code>kill -9</code> sends SIGKILL: the kernel stops it instantly, no cleanup, possible corrupt files. Try TERM first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A container or job exits with code 137 and no traceback. What happened?</summary><div class="qa-body">137 = 128 + 9: it was killed by SIGKILL, usually by the OOM killer for exceeding its memory limit. Confirm with <code>dmesg | grep -i "killed process"</code> or <code>docker inspect</code> (OOMKilled: true). Reduce memory use or raise the limit. (143 = 128 + 15 = SIGTERM.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>set -euo pipefail</code> do and why use it?</summary><div class="qa-body"><code>-e</code> stop on error, <code>-u</code> error on unset variables, <code>pipefail</code> make a pipeline fail if any part fails. Without it, a script can fail halfway, keep going, and report success to CI or cron.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>bash -c 'false | true; echo $?'</code></summary><div class="qa-body"><code>0</code>. A pipeline's status is the last command's (<code>true</code>). With <code>set -o pipefail</code> it would print <code>1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a cron line to run <code>report.py</code> at 08:00 every weekday.</summary><div class="qa-body"><code>0 8 * * 1-5 /srv/.venv/bin/python /srv/report.py &gt;&gt; /var/log/report.log 2&gt;&amp;1</code>. Absolute paths because cron's PATH is minimal; remember the server's time zone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does SSH key authentication work?</summary><div class="qa-body">You generate a key pair. The public key goes into the server's <code>~/.ssh/authorized_keys</code>. On login the server sends a challenge; your client signs it with the private key; the server verifies with the public key. The private key never travels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you open a Jupyter notebook running on a remote server in your local browser?</summary><div class="qa-body">SSH tunnel: <code>ssh -L 8888:localhost:8888 user@host</code>, then open <code>http://localhost:8888</code> locally. The traffic goes through the encrypted SSH connection; the port is never exposed to the internet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The disk is full on a training server. How do you find the culprit?</summary><div class="qa-body"><code>df -h</code> to see which filesystem; then <code>du -h --max-depth=1 / 2&gt;/dev/null | sort -h | tail</code> and drill down, or <code>find / -size +1G</code>. Usual suspects: checkpoints, logs, Docker images (<code>docker system df</code>), pip/HF caches.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>free shows only 2.5 GB "free" of 15 GB. Is the server out of memory?</summary><div class="qa-body">No. Look at <strong>available</strong> (13 GB here). Most "used" memory is buff/cache, which the kernel frees instantly when a program needs it.</div></details>
</main>
`
});
