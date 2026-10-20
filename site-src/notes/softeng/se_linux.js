// notes/softeng/se_linux.js — Linux & Terminal
Object.assign(TOPIC_CONTENT, {
  "se_linux": `<main>
<h1>Linux &amp; Terminal</h1>
  <div class="where"><span>Software Engineering</span><span>Linux &amp; Terminal</span></div>
  <p class="lead">Almost every script, model and API you build ends up running on a Linux machine you control by typing: a cloud VM, a GPU server, a Docker container. There is no mouse and no file explorer there. This note takes the chai stall's <code>sales_report.py</code> (tag <code>v1.0.0</code> from the Git note) onto a server and teaches, in the order you need them, the commands to move around, read files and logs, chain tools into pipelines, control who may read what, watch and stop processes, configure programs with environment variables, write a safe bash script, log in with SSH keys and run the report every night with cron. Every command was really run on an Ubuntu 24.04 machine standing in for the server, as the users <code>meera</code> (prompt <code>$</code>), <code>ravi</code> (prompt <code>ravi$</code>) and the administrator (prompt <code>root#</code>); outputs are pasted as printed. Error lines that a script runner prefixes with its own name are shown as <code>bash:</code>, the way an interactive terminal prints them.</p>

  <h2 id="sl-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<defs><marker id="sl-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="220" y="8" width="220" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="30" text-anchor="middle" font-size="12">Software Engineering track</text>
<line x1="330" y1="42" x2="115" y2="70" stroke="currentColor" stroke-opacity="0.45"/><line x1="330" y1="42" x2="330" y2="70" stroke="currentColor" stroke-opacity="0.45"/><line x1="330" y1="42" x2="545" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="20" y="72" width="190" height="52" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="115" y="93" text-anchor="middle" font-size="12">1 · Git &amp; GitHub</text><text x="115" y="111" text-anchor="middle" class="tm" font-size="10">script versioned, tag v1.0.0</text>
<rect x="235" y="72" width="190" height="52" rx="7" class="fg sg" stroke-width="2.5"/><text x="330" y="93" text-anchor="middle" font-size="12" font-weight="700">2 · Linux &amp; Terminal</text><text x="330" y="111" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · run it every night</text>
<rect x="450" y="72" width="190" height="52" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="545" y="93" text-anchor="middle" font-size="12">3 · Docker</text><text x="545" y="111" text-anchor="middle" class="tm" font-size="10">ship it + Postgres anywhere</text>
<line x1="210" y1="98" x2="233" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sl-a0)"/><line x1="425" y1="98" x2="448" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sl-a0)"/>
<text x="330" y="152" text-anchor="middle" class="tm" font-size="10.5">server: ~/chai-report (git clone of v1.0.0) + data/ with a week of sheets + logs/report.log</text>
<text x="330" y="172" text-anchor="middle" class="tm" font-size="10.5">ends with: run_report.sh scheduled by cron at 21:00 every night, reachable over SSH</text>
</svg><figcaption>The middle step of the track. Git gave us one trusted version of the script; Linux runs it unattended; Docker will pack it with everything it needs.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="se_git">Git &amp; GitHub</a></b><span>The script is versioned and released as <code>v1.0.0</code> on a shared repo. It prints <strong>Total sales: ₹230 from 6 valid orders, rejected: 3</strong> for Monday's sheet and logs a <code>WARN</code> line to stderr for each bad row. Left open: someone still has to run it by hand on a laptop every evening. Python's <a class="xref" data-note="py_modules">virtual environments</a> also promised to explain what <code>activate</code> really does; this note does (it edits PATH).</span></li>
    <li><b>This note adds: running and automating programs on a server</b><span>The shell and filesystem, files, streams, pipes and redirection, text tools on a log, permissions, processes and signals, environment variables and PATH, bash scripts, SSH keys, cron, disk and memory checks.</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="se_docker">Docker</a>: a container is a Linux process with its own filesystem, so everything here (PID 1 and signals, exit codes 137/143, env vars, ports, file ownership) reappears there. Later, <a class="xref" data-note="api_production">production backends</a> and <a class="xref" data-note="mlops_lifecycle">MLOps</a> pipelines run on the same machinery.</span></li>
  </ol>

  <h2 id="sl-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next. Running example: the server copy of <code>~/chai-report</code> with six daily sheets (13 to 19 October; the stall was closed on the 16th) and the log those runs wrote.</p>
  <ol class="story">
    <li><b>Why the terminal</b><span>Q: why not keep clicking? → Clicking cannot be repeated by a machine, cannot run at 21:00 while you sleep and does not exist on a server. One typed line ran the report for the whole week. But where are we when we type?</span></li>
    <li><b>Shell &amp; filesystem tree</b><span>Q: where am I, and where are things? → One tree from <code>/</code>; <code>pwd</code>, <code>ls</code>, <code>cd</code>; absolute vs relative paths. Now how do we work with the files we find?</span></li>
    <li><b>Navigating &amp; files</b><span>Q: how do I copy, move, delete and peek? → <code>mkdir -p</code>, <code>cp</code>, <code>mv</code>, <code>rm</code>, <code>head</code>, <code>tail</code>, <code>wc</code>. Each tool does one small job; how do we combine them and keep their output?</span></li>
    <li><b>Pipes &amp; redirection</b><span>Q: where does output go? → Three streams: stdout (the report), stderr (the WARN lines), stdin. <code>&gt;</code>, <code>&gt;&gt;</code>, <code>2&gt;</code>, <code>2&gt;&amp;1</code>, <code>|</code>. Now we can build real questions out of small tools…</span></li>
    <li><b>grep, cut, sort, uniq, wc, find on the log</b><span>Q: which day had most rejections, what was the week's total? → Pipelines: 11 WARN lines, 4 on the 17th, week total ₹2920. Ravi needs to read the data too, but not change it…</span></li>
    <li><b>Permissions</b><span>Q: who may read, change, run? → rwx for owner/group/others, decoded by hand; <code>chmod 640</code>, <code>chmod +x</code>, groups. Now the script runs; how do we watch and stop running programs?</span></li>
    <li><b>Processes &amp; signals</b><span>Q: what is running, and how do we stop it safely? → PIDs, <code>ps</code>, <code>top</code>, <code>kill</code> (SIGTERM, saves) vs <code>kill -9</code> (no cleanup); exit codes 0, 1, 2, 130, 137, 143. Programs also need settings without editing code…</span></li>
    <li><b>Environment variables &amp; PATH</b><span>Q: how do programs get configuration, and why "command not found"? → <code>export</code> passes variables to children; PATH is the list of folders searched for commands; <code>activate</code> just prepends to PATH. Now we can write the nightly job…</span></li>
    <li><b>Bash scripting</b><span>Q: how do we save the steps as one safe program? → <code>run_report.sh</code>: variables, <code>if</code>, loops, exit codes, <code>set -euo pipefail</code> (without pipefail a crash was logged as DONE with exit 0). But we are still sitting at the server…</span></li>
    <li><b>SSH &amp; keys</b><span>Q: how do we reach the server safely from a laptop? → Key pair; public key in <code>authorized_keys</code>; <code>ssh</code>, <code>scp</code>, <code>rsync</code>; key files must be 600. Last step: run it without anyone logging in…</span></li>
    <li><b>cron</b><span>Q: how does it run at 21:00 every night? → A crontab line; cron's PATH is only <code>/usr/bin:/bin</code>, so <code>chai-report</code> was "not found" while the full-path script worked. (Then: disk and memory checks for when the job dies.)</span></li>
  </ol>

  <h2 id="sl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linux &amp; Terminal</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Filesystem &amp; navigation</div>
        <ul>
          <li><b>One tree from <code>/</code></b> — no C: or D:; disks are mounted as folders</li>
          <li><b>Key dirs</b> — <code>/etc</code> config, <code>/home</code> users, <code>/var/log</code> logs, <code>/tmp</code>, <code>/usr</code> programs, <code>/srv</code> served data</li>
          <li><b>Absolute</b> path starts with <code>/</code>; <b>relative</b> starts from where you are</li>
          <li><code>pwd</code>, <code>ls -la</code>, <code>cd dir</code>, <code>cd ..</code>, <code>cd ~</code>, <code>cd -</code>, <code>tree</code></li>
          <li>💡 full postal address vs "two lanes from the chai stall"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Files</div>
        <ul>
          <li><code>mkdir -p</code>, <code>cp -r</code>, <code>mv</code> (= rename), <code>rm -r</code> (no recycle bin)</li>
          <li><code>head -n</code>, <code>tail -n</code>, <code>tail -f</code>, <code>less</code>, <code>wc -l</code> (rows = lines − 1)</li>
          <li>⚠ never <code>cat</code> a 10 GB file; ⚠ <code>rm -rf</code> has no undo</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streams &amp; pipes</div>
        <ul>
          <li>stdin 0 · stdout 1 (report) · stderr 2 (WARN lines)</li>
          <li><code>&gt;</code> overwrite · <code>&gt;&gt;</code> append · <code>2&gt;</code> · <code>&gt; f 2&gt;&amp;1</code> · <code>&lt;</code> · <code>/dev/null</code></li>
          <li><code>a | b</code>: stdout of a → stdin of b</li>
          <li>⚠ <code>sort f &gt; f</code> empties f</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Text tools</div>
        <ul>
          <li><code>grep</code> (-c, -v, -o, -rn, -q), <code>cut -d, -f4</code>, <code>sort</code>, <code>uniq -c</code>, <code>sort -rn</code>, <code>awk</code>, <code>sed</code></li>
          <li>Group-by count: <code>cut | sort | uniq -c | sort -rn</code></li>
          <li><code>find DIR -name -newer -size</code></li>
          <li>⚠ <code>uniq</code> merges neighbours only; ⚠ <code>cut -d,</code> splits quoted commas</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Permissions</div>
        <ul>
          <li><code>-rwxr-x---</code> = type + owner / group / others</li>
          <li>r=4 w=2 x=1 → 755 scripts, 644 files, 640 team-readable, 600 secrets &amp; keys</li>
          <li><code>chmod</code>, <code>chgrp</code>, <code>chown</code> (root), <code>usermod -aG</code>, <code>id</code></li>
          <li>dir: r list, w create/delete, x enter</li>
          <li>⚠ <code>chmod 777</code> is never the fix</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Processes &amp; signals</div>
        <ul>
          <li>PID, <code>ps</code>, <code>pgrep -af</code>, <code>top</code>, <code>jobs</code>, <code>&amp;</code>, <code>nohup</code>, <code>tmux</code></li>
          <li><code>kill</code> = SIGTERM 15 (catchable) · <code>kill -9</code> = SIGKILL · Ctrl+C = SIGINT 2</li>
          <li>Exit codes: 0 ok, 1 error, 2 usage, 126 not executable, 127 not found, 128+n killed by n (130, 137, 143)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Env &amp; PATH</div>
        <ul>
          <li><code>export X=1</code> → children see it; <code>X=1 cmd</code> → one command</li>
          <li>PATH searched left → right; "command not found" = in none of them</li>
          <li><code>which</code>; persist in <code>~/.bashrc</code> / <code>~/.profile</code></li>
          <li>venv <code>activate</code> = prepend <code>.venv/bin</code> to PATH</li>
          <li>Python: <code>os.environ["X"]</code> required, <code>os.getenv("X", d)</code> optional</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bash scripts</div>
        <ul>
          <li><code>#!/usr/bin/env bash</code> + <code>set -euo pipefail</code></li>
          <li><code>&#36;{1:-default}</code>, <code>$(cmd)</code>, <code>[[ -f "$F" ]]</code>, <code>for f in data/*.csv</code></li>
          <li><code>exit 1</code>, <code>$?</code>, <code>a &amp;&amp; b || c</code>; always quote <code>"$var"</code></li>
          <li>⚠ <code>X = 5</code> runs a command called X</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SSH, scp, rsync</div>
        <ul>
          <li><code>ssh-keygen -t ed25519</code>; public key → server's <code>~/.ssh/authorized_keys</code></li>
          <li><code>ssh host 'cmd'</code>, <code>scp</code>, <code>rsync -av</code> (only changes), <code>~/.ssh/config</code> aliases</li>
          <li>Tunnel: <code>ssh -L 8888:localhost:8888 host</code></li>
          <li>⚠ private key must be 600 or ssh ignores it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">cron, disk, memory</div>
        <ul>
          <li><code>m h dom mon dow cmd</code>: <code>0 21 * * *</code> = 21:00 daily; <code>crontab -e/-l</code></li>
          <li>⚠ cron: PATH=/usr/bin:/bin, sh, no .bashrc, server time zone → full paths + log</li>
          <li><code>df -h</code>, <code>du -sh</code>, <code>free -h</code> (read "available"), <code>nproc</code></li>
          <li>Silent death: exit 137 + "Killed process" in <code>dmesg</code> = OOM killer</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sl-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why the Terminal</span><span class="rm-sub">Click-ops doesn't scale</span></div></div>
      <div class="rm-item rm-done" data-target="sl-fs"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Shell &amp; Filesystem Tree</span><span class="rm-sub">One tree from /</span></div></div>
      <div class="rm-item rm-done" data-target="sl-cmds"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Navigating &amp; Files</span><span class="rm-sub">cp, mv, rm, head, wc</span></div></div>
      <div class="rm-item rm-done" data-target="sl-pipe"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Pipes &amp; Redirection</span><span class="rm-sub">stdout vs stderr, traced</span></div></div>
      <div class="rm-item rm-done" data-target="sl-text"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Text Pipeline</span><span class="rm-sub">grep, sort, uniq on the log</span></div></div>
      <div class="rm-item rm-done" data-target="sl-perm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Permissions</span><span class="rm-sub">rwx by hand, chmod numbers</span></div></div>
      <div class="rm-item rm-done" data-target="sl-proc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Processes &amp; Signals</span><span class="rm-sub">ps, top, kill, exit codes</span></div></div>
      <div class="rm-item rm-done" data-target="sl-env"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Environment &amp; PATH</span><span class="rm-sub">Why "command not found"</span></div></div>
      <div class="rm-item rm-done" data-target="sl-bash"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Bash Scripting</span><span class="rm-sub">run_report.sh, pipefail</span></div></div>
      <div class="rm-item rm-done" data-target="sl-ssh"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">SSH &amp; Keys</span><span class="rm-sub">ssh, scp, rsync</span></div></div>
      <div class="rm-item rm-done" data-target="sl-cron"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">cron</span><span class="rm-sub">Every night at 21:00</span></div></div>
      <div class="rm-item rm-done" data-target="sl-res"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Disk &amp; Memory</span><span class="rm-sub">df, du, free, OOM</span></div></div>
      <div class="rm-item rm-done" data-target="sl-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="sl-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that delete things</span></div></div>
      <div class="rm-item rm-done" data-target="sl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sl-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sl-why"><span class="num">01</span>Why the Terminal: Click-Ops Doesn't Scale</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every evening someone opens the laptop, finds the day's sheet in Downloads, double-clicks a terminal icon, drags the file in, reads the total and types it into WhatsApp. It works, until that person is ill, the laptop is closed, or the owner asks for last week's numbers. Why can't we just keep clicking?</p>
  </div>
  <p>"Click-ops" (doing operations by clicking) has three problems. It cannot be <strong>repeated</strong> exactly: every click is a chance to pick the wrong file. It cannot be <strong>automated</strong>: no program can click for you at 21:00. And it does not <strong>exist</strong> on servers: a cloud machine has no screen, only a text connection. A <strong>terminal</strong> replaces clicks with typed commands, and typed commands can be saved, repeated, scheduled and run on a machine across the world.</p>
  <p>Here is the server copy of the project (cloned from the Git note's tag <code>v1.0.0</code>; section 03 shows the clone) with six daily sheets. One command does Monday's report; one line does the whole week:</p>
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
data/orders_2026-10-13.csv -&gt; Total sales: ₹395 from 13 valid orders, rejected: 1
data/orders_2026-10-14.csv -&gt; Total sales: ₹500 from 15 valid orders, rejected: 2
data/orders_2026-10-15.csv -&gt; Total sales: ₹510 from 12 valid orders, rejected: 0
data/orders_2026-10-17.csv -&gt; Total sales: ₹630 from 18 valid orders, rejected: 4
data/orders_2026-10-18.csv -&gt; Total sales: ₹655 from 18 valid orders, rejected: 1
data/orders_2026-10-19.csv -&gt; Total sales: ₹230 from 6 valid orders, rejected: 3</div>
  <p>The first command is exactly what the laptop did by hand. The second line is a <strong>loop</strong> (section 09) that runs the report for every file whose name matches <code>data/orders_*.csv</code>, hides the WARN lines (<code>2&gt;/dev/null</code>, section 04) and keeps only the first line (<code>head -n 1</code>). Six days, one line, no clicking, and it can run at 21:00 on its own (section 11). The rest of the note builds this up piece by piece.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Giving directions by pointing versus writing them down. Pointing works while you stand next to the person. Written directions can be photocopied, handed to a new helper, followed at midnight, and checked later when something goes wrong.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Terminal</strong>: the window that shows text in and out. <strong>Shell</strong>: the program inside it that reads your commands and runs them (here <strong>bash</strong>; Macs default to zsh). <strong>Command</strong>: a program name plus arguments, e.g. <code>python3 sales_report.py data/orders_2026-10-19.csv</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Copy-pasting commands you do not understand from the internet. The shell does exactly what you type, immediately, with your permissions. Read every command before pressing Enter, especially anything with <code>rm</code>, <code>sudo</code> or <code>curl … | bash</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Shell &amp; the Filesystem Tree.</b> Those commands used paths like <code>data/orders_*.csv</code>. Paths relative to what? Where are we when we type?</div>

  <h2 id="sl-fs"><span class="num">02</span>The Shell &amp; the Filesystem Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On a server there is no window showing folders. After logging in you see a blinking cursor. How are files arranged, where am I right now, and how do I move?</p>
  </div>
  <p>Linux has <strong>one single tree</strong> of folders (directories), starting at the root <code>/</code>. There are no drive letters: a second disk is attached ("mounted") somewhere inside the tree. Each user has a home folder under <code>/home</code>, and <code>~</code> means "my home". The shell always has a <strong>current directory</strong>; relative paths start there.</p>
  <figure class="viz"><svg viewBox="0 0 600 180" width="600">
    <g stroke="currentColor" fill="none" stroke-width="1.2">
      <line x1="300" y1="38" x2="60" y2="70"/><line x1="300" y1="38" x2="160" y2="70"/><line x1="300" y1="38" x2="260" y2="70"/><line x1="300" y1="38" x2="350" y2="70"/><line x1="300" y1="38" x2="440" y2="70"/><line x1="300" y1="38" x2="535" y2="70"/>
      <line x1="160" y1="96" x2="160" y2="120"/><line x1="160" y1="146" x2="160" y2="150"/>
    </g>
    <rect x="270" y="10" width="60" height="28" rx="6" class="fg sg"/><text x="300" y="29" text-anchor="middle">/</text>
    <rect x="25" y="70" width="70" height="26" rx="6" class="fb"/><text x="60" y="88" text-anchor="middle">/etc</text>
    <rect x="120" y="70" width="80" height="26" rx="6" class="fb"/><text x="160" y="88" text-anchor="middle">/home</text>
    <rect x="225" y="70" width="70" height="26" rx="6" class="fb"/><text x="260" y="88" text-anchor="middle">/var</text>
    <rect x="315" y="70" width="70" height="26" rx="6" class="fb"/><text x="350" y="88" text-anchor="middle">/srv</text>
    <rect x="405" y="70" width="70" height="26" rx="6" class="fb"/><text x="440" y="88" text-anchor="middle">/usr</text>
    <rect x="500" y="70" width="70" height="26" rx="6" class="fb"/><text x="535" y="88" text-anchor="middle">/tmp</text>
    <rect x="90" y="120" width="140" height="26" rx="6" class="ft st"/><text x="160" y="138" text-anchor="middle">/home/meera (~)</text>
    <text x="160" y="166" text-anchor="middle" class="tm">~/chai-report/data, logs</text>
    <text x="60" y="114" text-anchor="middle" class="tm">config</text>
    <text x="260" y="114" text-anchor="middle" class="tm">logs</text>
    <text x="350" y="114" text-anchor="middle" class="tm">git repo, uploads</text>
    <text x="440" y="114" text-anchor="middle" class="tm">programs</text>
    <text x="535" y="114" text-anchor="middle" class="tm">scratch</text>
  </svg><figcaption>One tree starting at /. Meera's project lives under her home; the shared Git repo and incoming sheets live under /srv.</figcaption></figure>
  <p>A <strong>path</strong> is a file's address. An <strong>absolute path</strong> starts with <code>/</code> and works from anywhere: <code>/home/meera/chai-report/data/orders_2026-10-19.csv</code>. A <strong>relative path</strong> starts from the current directory: inside <code>/home/meera/chai-report</code>, the same file is <code>data/orders_2026-10-19.csv</code>. <code>.</code> is "this folder", <code>..</code> "the folder above". Five commands do all the moving: <code>pwd</code> (print working directory), <code>ls</code> (list), <code>cd</code> (change directory), <code>tree</code> (draw the tree) and Tab (auto-complete; press it while typing a path).</p>
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
drwxrwxr-x 5 meera meera 4096 Oct 20 00:05 .
drwxr-x--- 3 meera meera 4096 Oct 20 00:05 ..
drwxrwxr-x 8 meera meera 4096 Oct 20 00:05 .git
-rw-rw-r-- 1 meera meera   36 Oct 20 00:05 .gitignore
-rw-rw-r-- 1 meera meera  136 Oct 20 00:05 CHANGELOG.md
-rw-rw-r-- 1 meera meera  289 Oct 20 00:05 README.md
drwxrwxr-x 2 meera meera 4096 Oct 20 00:05 data
drwxrwxr-x 2 meera meera 4096 Oct 20 00:05 logs
-rw-rw-r-- 1 meera meera 1109 Oct 20 00:05 sales_report.py
-rw-rw-r-- 1 meera meera  351 Oct 20 00:05 sample_orders.csv
$ tree -a -I .git ~/chai-report
/home/meera/chai-report
├── .gitignore
├── CHANGELOG.md
├── README.md
├── data
│   ├── orders_2026-10-13.csv
│   ├── orders_2026-10-14.csv
│   ├── orders_2026-10-15.csv
│   ├── orders_2026-10-17.csv
│   ├── orders_2026-10-18.csv
│   └── orders_2026-10-19.csv
├── logs
│   └── report.log
├── sales_report.py
└── sample_orders.csv

3 directories, 12 files
$ cd data
$ pwd
/home/meera/chai-report/data
$ cd ..
$ cd /var/log
$ pwd
/var/log
$ cd -
/home/meera/chai-report
$ cd ~
$ pwd
/home/meera
$ cd chai-report
$ ls /
bin		     dev   lib.usr-is-merged  mnt	proc  sbin.usr-is-merged  usr
bin.usr-is-merged    etc   lib64	      nix	root  srv		  var
boot		     home  lost+found	      old_root	run   sys
container_info.json  lib   media	      opt	sbin  tmp</div>
  <p>Plain <code>ls</code> hid <code>.git</code> and <code>.gitignore</code>: names starting with a dot are <strong>hidden</strong>; <code>ls -la</code> shows all (<code>-a</code>) in long form (<code>-l</code>): permissions, owner, group, size, date, name (section 06 decodes the first column; a leading <code>d</code> means directory). <code>tree -a -I .git</code> drew the project without the Git internals: the script and sample from the repo, plus <code>data/</code> and <code>logs/</code> that live only on the server (the Git note's <code>.gitignore</code> keeps them out of history). <code>cd ..</code> went up one level, <code>cd /var/log</code> used an absolute path, <code>cd -</code> jumped back (and printed where), <code>cd ~</code> went home. <code>ls /</code> shows the top of the tree on this machine.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Directions to a house. Absolute path = full postal address: "India, Maharashtra, Pune, Kothrud, Lane 4, House 12"; it works from anywhere. Relative path = "from the chai stall, two lanes left"; it only works if you are standing at the chai stall.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Filesystem tree</strong>: all files and directories under <code>/</code>. <strong>Working directory</strong>: where relative paths start (<code>pwd</code>). <strong>Home</strong>: <code>~</code> = <code>$HOME</code> = <code>/home/USER</code>. <strong>Hidden file</strong>: name starts with <code>.</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Names are case-sensitive and spaces matter: <code>Data/</code> and <code>data/</code> are different, and <code>cd my data</code> fails. Use lower-case names with <code>_</code> or <code>-</code>; quote names with spaces: <code>cd "my data"</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Navigating &amp; Files.</b> We can find files. How do we copy, rename, delete and look inside them without a file manager?</div>

  <h2 id="sl-cmds"><span class="num">03</span>Navigating &amp; Working with Files</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We need a backup of Monday's sheet before anyone edits it, a quick look at its first and last rows, and its number of orders. With a mouse you would open a spreadsheet. How on a server?</p>
  </div>
  <p>A handful of small tools, each doing one job. You will use them every day.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kitchen with separate tools instead of one machine: knife, grater, sieve, measuring cup. <code>head</code> is tasting a spoon from the top of the pot; <code>wc -l</code> is counting the rotis; <code>rm</code> is throwing food in the bin, and there is no taking it back.</p>
  </div>
  <table class="tbl">
    <tr><th>Need</th><th>Command</th><th>Note</th></tr>
    <tr><td>Make folders</td><td><code>mkdir -p a/b/c</code></td><td><code>-p</code>: create parents, no error if it exists</td></tr>
    <tr><td>Copy / move / rename</td><td><code>cp -r src dst</code>, <code>mv a b</code></td><td><code>-r</code> (recursive) for folders; <code>mv</code> also renames</td></tr>
    <tr><td>Delete</td><td><code>rm file</code>, <code>rm -r dir</code></td><td>No recycle bin; <code>-f</code> = never ask</td></tr>
    <tr><td>Look inside</td><td><code>cat</code>, <code>head -n 3</code>, <code>tail -n 2</code>, <code>less</code></td><td><code>less</code> scrolls (q quits); <code>tail -f</code> follows a growing log</td></tr>
    <tr><td>Count lines</td><td><code>wc -l file</code></td><td>CSV orders = lines − 1 (header)</td></tr>
    <tr><td>Help</td><td><code>man wc</code>, <code>wc --help</code></td><td>every flag explained</td></tr>
  </table>
  <p>Worked example: first, get a second copy of the project from the shared Git repo (the Git note's server) and delete it again; then back up, rename and delete; then peek and count.</p>
  <div class="fx" data-lang="text">$ git clone -q --branch v1.0.0 /srv/git/chai-report.git ~/chai-report-test
Note: switching to 'b4f0033b8093f6d5dedd993594e7dceb98dbf337'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c &lt;new-branch-name&gt;

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

$ ls ~
chai-report  chai-report-test
$ rm -rf ~/chai-report-test
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

## Output

Total sales, valid and rejected orders, the top item, and revenue per item.

Rows with a non-numeric qty or price, or a qty of 0 or less, are rejected.

Questions: ask Meera or Ravi.
$ wc --help | head -n 4
Usage: wc [OPTION]... [FILE]...
  or:  wc [OPTION]... --files0-from=F
Print newline, word, and byte counts for each FILE, and a total line if
more than one FILE is specified.  A word is a non-zero-length sequence of</div>
  <p><code>git clone --branch v1.0.0</code> checked out the tagged commit; Git's "detached HEAD" note is the Git note's section 06 in action (a tag is not a branch). <code>rm -rf</code> removed the whole folder silently. <code>mkdir -p</code> made two nested folders at once; <code>cp</code> copied; <code>mv</code> renamed (there is no separate rename command); <code>rm -r</code> deleted the folder and everything in it. <code>head -n 3</code> shows the header and the first two orders (Ben's note contains a comma, inside quotes); <code>tail -n 2</code> shows Farid's missing price and Gita's refund. <code>wc -l</code> counts 10 lines = 9 orders + header; with several files it adds a total (99 lines for the week). <code>cat</code> printed the README in full: fine for small files, never for a 10 GB log.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Option / flag</strong>: a switch that changes a command's behaviour (<code>-n 3</code>, <code>-r</code>); short flags combine (<code>ls -l -a</code> = <code>ls -la</code>). <strong>Argument</strong>: what the command works on (a file name).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>rm -rf</code> deletes instantly with no recycle bin; double-check the path, especially when it contains a variable (section 09 shows an empty variable sending a script to the wrong folder). Run <code>ls</code> with the same path first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Pipes &amp; Redirection.</b> Each tool prints to the screen. How do we save output to a file, throw away the noise, and feed one tool's output into the next?</div>

  <h2 id="sl-pipe"><span class="num">04</span>Pipes &amp; Redirection</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The report prints two kinds of text: the summary for the owner and the WARN lines for us. We want the summary in a file, the warnings in another (or nowhere), and sometimes the output of one tool fed straight into another. Where does output go, and how do we redirect it?</p>
  </div>
  <p>Every program has three <strong>streams</strong>. <strong>stdin</strong> (0) is where it reads input. <strong>stdout</strong> (1) is normal output: our summary and item lines. <strong>stderr</strong> (2) is for errors and warnings: the Git note's PR sent the WARN lines there on purpose (<code>file=sys.stderr</code>). By default all three are the terminal, which is why they look mixed. A <strong>redirect</strong> connects a stream to a file; a <strong>pipe</strong> <code>|</code> connects one program's stdout to the next program's stdin.</p>
  <figure class="viz"><svg viewBox="0 0 620 150" width="620">
    <defs><marker id="sl-arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="50" width="70" height="40" rx="8" class="fs"/><text x="45" y="75" text-anchor="middle" font-size="11">sheet.csv</text>
    <rect x="160" y="45" width="150" height="50" rx="8" class="fb sb"/><text x="235" y="67" text-anchor="middle" font-size="11.5">sales_report.py</text><text x="235" y="84" text-anchor="middle" class="tm" font-size="10">reads the file</text>
    <rect x="420" y="15" width="190" height="40" rx="8" class="fg sg"/><text x="515" y="33" text-anchor="middle" font-size="11">stdout (1): Total sales…</text><text x="515" y="48" text-anchor="middle" class="tm" font-size="9.5">&gt; out.txt  or  | head</text>
    <rect x="420" y="85" width="190" height="40" rx="8" class="fr sr"/><text x="515" y="103" text-anchor="middle" font-size="11">stderr (2): WARN line 8…</text><text x="515" y="118" text-anchor="middle" class="tm" font-size="9.5">2&gt; warnings.txt  or  2&gt;/dev/null</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="82" y1="70" x2="156" y2="70" marker-end="url(#sl-arr1)"/><line x1="312" y1="60" x2="416" y2="38" marker-end="url(#sl-arr1)"/><line x1="312" y1="82" x2="416" y2="104" marker-end="url(#sl-arr1)"/></g>
    <text x="120" y="62" text-anchor="middle" class="tm" font-size="10">argument</text>
    <text x="300" y="142" text-anchor="middle" class="tm">2&gt;&amp;1 = "send stream 2 wherever stream 1 is going"</text>
  </svg><figcaption>Our script's two output streams. Redirects and pipes decide where each one goes.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sugarcane juice stall has two outlets: juice (stdout) and the crushed waste (stderr). A pipe carries juice straight to the next machine, the strainer. A redirect sends an outlet into a container: the juice into a jug, the waste into a bin, or both into one bucket (<code>2&gt;&amp;1</code>).</p>
  </div>
  <p>Traced on Monday's sheet, one redirect at a time:</p>
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
$ python3 sales_report.py data/orders_2026-10-19.csv 2&gt;&amp;1 | grep -c WARN
3
$ python3 sales_report.py data/orders_2026-10-19.csv | grep -c WARN
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
0
$ wc -l &lt; data/orders_2026-10-19.csv
10
$ cp data/orders_2026-10-19.csv copy.csv
$ sort copy.csv &gt; copy.csv
$ wc -l copy.csv
0 copy.csv
$ rm out.txt warnings.txt report.txt copy.csv</div>
  <table class="tbl">
    <tr><th>Command</th><th>stdout went to</th><th>stderr went to</th><th>What we saw</th></tr>
    <tr><td><code>&gt; out.txt</code></td><td>out.txt</td><td>screen</td><td>only the 3 WARN lines on screen; out.txt has the 6-line summary</td></tr>
    <tr><td><code>2&gt; warnings.txt</code></td><td>screen</td><td>warnings.txt</td><td>summary on screen; 3 WARN lines in the file</td></tr>
    <tr><td><code>&gt; report.txt 2&gt;&amp;1</code></td><td>report.txt</td><td>report.txt</td><td>nothing on screen; 9 lines in the file</td></tr>
    <tr><td><code>2&gt;/dev/null | head -n 1</code></td><td>pipe → head</td><td>thrown away</td><td>only "Total sales…"</td></tr>
    <tr><td><code>2&gt;&amp;1 | grep -c WARN</code></td><td>pipe</td><td>pipe</td><td>3</td></tr>
    <tr><td><code>| grep -c WARN</code></td><td>pipe</td><td>screen</td><td>WARN lines on screen, grep counted 0</td></tr>
  </table>
  <p>The last row is the classic surprise: a pipe carries <strong>only stdout</strong>, so grep never saw the WARN lines (they bypassed the pipe and appeared on screen) and counted 0. <code>&gt;&gt;</code> appended "checked by Meera" instead of overwriting. <code>wc -l &lt; file</code> fed the file as stdin, so wc printed no file name. And the trap: <code>sort copy.csv &gt; copy.csv</code> left 0 lines, because the shell empties the target file <em>before</em> sort starts reading it.</p>
  <table class="tbl">
    <tr><th>Syntax</th><th>Meaning</th></tr>
    <tr><td><code>cmd &gt; f</code> / <code>cmd &gt;&gt; f</code></td><td>stdout to file, overwrite / append</td></tr>
    <tr><td><code>cmd 2&gt; f</code></td><td>stderr to file</td></tr>
    <tr><td><code>cmd &gt; f 2&gt;&amp;1</code></td><td>both to one file (file first, then 2&gt;&amp;1)</td></tr>
    <tr><td><code>cmd &lt; f</code></td><td>file as stdin</td></tr>
    <tr><td><code>a | b</code></td><td>stdout of a → stdin of b (stderr not included)</td></tr>
    <tr><td><code>/dev/null</code></td><td>a file that discards everything written to it</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>File descriptor</strong>: the number of a stream (0 stdin, 1 stdout, 2 stderr). <strong>Pipeline</strong>: commands joined by <code>|</code>; they run at the same time and stream data, so a 5 GB log never has to fit in memory.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>cmd file &gt; file</code> destroys the file (we got 0 lines). Write to a new name, then <code>mv</code>. And <code>2&gt;&amp;1 &gt; f</code> (wrong order) sends stderr to the screen: redirects are applied left to right.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Text Pipeline.</b> Pipes let small tools work together. Can they answer real questions about a week of logs, like a SQL query would?</div>

  <h2 id="sl-text"><span class="num">05</span>The Text Pipeline: grep, cut, sort, uniq, wc, find</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The nightly job (we build it in section 09) wrote a week of output into <code>logs/report.log</code>, each line prefixed with its day. The owner asks: how many rows were rejected this week, on which days, for what reasons, and what were total sales? Opening the log in Excel is not an option on the server.</p>
  </div>
  <p>Six tools cover most log questions. <code>grep</code> keeps matching lines (<code>-c</code> count, <code>-v</code> invert, <code>-o</code> only the match, <code>-q</code> quiet, <code>-rn</code> recursive with line numbers). <code>cut</code> cuts out columns (<code>-d' '</code> delimiter, <code>-f1</code> field 1). <code>sort</code> orders lines (<code>-n</code> numeric, <code>-r</code> reverse). <code>uniq -c</code> collapses identical <em>neighbouring</em> lines and counts them. <code>wc -l</code> counts lines. <code>find</code> searches for files by name, age or size. <code>sed</code> and <code>awk</code> edit and compute on lines.</p>
  <figure class="viz"><svg viewBox="0 0 640 110" width="640">
    <defs><marker id="sl-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="5" y="30" width="95" height="44" rx="8" class="fs"/><text x="52" y="57" text-anchor="middle">report.log</text>
    <rect x="125" y="30" width="100" height="44" rx="8" class="fb sb"/><text x="175" y="57" text-anchor="middle">grep WARN</text>
    <rect x="250" y="30" width="110" height="44" rx="8" class="fb sb"/><text x="305" y="57" text-anchor="middle">cut -d' ' -f1</text>
    <rect x="385" y="30" width="60" height="44" rx="8" class="fb sb"/><text x="415" y="57" text-anchor="middle">sort</text>
    <rect x="470" y="30" width="75" height="44" rx="8" class="fb sb"/><text x="507" y="57" text-anchor="middle">uniq -c</text>
    <rect x="570" y="30" width="65" height="44" rx="8" class="fg sg"/><text x="602" y="57" text-anchor="middle">sort -rn</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="101" y1="52" x2="121" y2="52" marker-end="url(#sl-arr2)"/><line x1="226" y1="52" x2="246" y2="52" marker-end="url(#sl-arr2)"/><line x1="361" y1="52" x2="381" y2="52" marker-end="url(#sl-arr2)"/><line x1="446" y1="52" x2="466" y2="52" marker-end="url(#sl-arr2)"/><line x1="546" y1="52" x2="566" y2="52" marker-end="url(#sl-arr2)"/></g>
    <text x="320" y="100" text-anchor="middle" class="tm">= SELECT day, COUNT(*) FROM log WHERE level='WARN' GROUP BY day ORDER BY 2 DESC</text>
  </svg><figcaption>"Rejections per day" as a pipeline. Each tool does one step and hands its output to the next.</figcaption></figure>
  <div class="fx" data-lang="text">$ wc -l logs/report.log
58 logs/report.log
$ head -n 8 logs/report.log
2026-10-13 WARN line 6: bad number qty='one' price='20'
2026-10-13 Total sales: ₹395 from 13 valid orders, rejected: 1
2026-10-13 top item: samosa (10 sold)
2026-10-13   samosa       ₹150
2026-10-13   cold coffee  ₹80
2026-10-13   masala chai  ₹80
2026-10-13   bun maska    ₹60
2026-10-13   ginger chai  ₹25
$ grep -c WARN logs/report.log
11
$ grep ERROR logs/report.log
2026-10-16 ERROR no sheet: /home/meera/chai-report/data/orders_2026-10-16.csv
$ grep WARN logs/report.log | head -n 3
2026-10-13 WARN line 6: bad number qty='one' price='20'
2026-10-14 WARN line 4: bad number qty='1' price=''
2026-10-14 WARN line 11: qty -1 is not positive
$ grep WARN logs/report.log | cut -d' ' -f1 | sort | uniq -c | sort -rn
      4 2026-10-17
      3 2026-10-19
      2 2026-10-14
      1 2026-10-18
      1 2026-10-13
$ grep -o 'bad number\\|not positive' logs/report.log | sort | uniq -c | sort -rn
      7 bad number
      4 not positive
$ grep 'Total sales' logs/report.log
2026-10-13 Total sales: ₹395 from 13 valid orders, rejected: 1
2026-10-14 Total sales: ₹500 from 15 valid orders, rejected: 2
2026-10-15 Total sales: ₹510 from 12 valid orders, rejected: 0
2026-10-17 Total sales: ₹630 from 18 valid orders, rejected: 4
2026-10-18 Total sales: ₹655 from 18 valid orders, rejected: 1
2026-10-19 Total sales: ₹230 from 6 valid orders, rejected: 3
$ grep 'Total sales' logs/report.log | sed 's/.*₹\\([0-9]*\\) .*/\\1/'
395
500
510
630
655
230
$ grep 'Total sales' logs/report.log | sed 's/.*₹\\([0-9]*\\) .*/\\1/' | awk '{s += $1} END {print "week total: ₹" s}'
week total: ₹2920
$ tail -q -n +2 data/orders_*.csv | cut -d, -f4 | sort | uniq -c | sort -rn
     28 masala chai
     26 samosa
     16 bun maska
     14 ginger chai
      9 cold coffee
$ tail -q -n +2 data/orders_*.csv | cut -d, -f4 | uniq -c | head -n 5
      1 cold coffee
      1 masala chai
      1 samosa
      2 masala chai
      2 samosa
$ cut -d, -f7 data/orders_2026-10-19.csv | head -n 4
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
  <p>Trace the "per day" pipeline by hand on the 11 WARN lines:</p>
  <table class="tbl">
    <tr><th>Stage</th><th>Output</th></tr>
    <tr><td><code>grep WARN logs/report.log</code></td><td>11 lines, e.g. <code>2026-10-13 WARN line 6: bad number qty='one' price='20'</code></td></tr>
    <tr><td><code>| cut -d' ' -f1</code></td><td>only field 1 (the day): 13, 14, 14, 17, 17, 17, 17, 18, 19, 19, 19</td></tr>
    <tr><td><code>| sort</code></td><td>equal days become neighbours (already true here, the log is in date order)</td></tr>
    <tr><td><code>| uniq -c</code></td><td>1 × 13, 2 × 14, 4 × 17, 1 × 18, 3 × 19</td></tr>
    <tr><td><code>| sort -rn</code></td><td>biggest first: the 17th (4), then Monday the 19th (3)</td></tr>
  </table>
  <p>The other answers: <code>grep -c</code> counts 11 rejected rows; <code>grep ERROR</code> shows the closed day (no sheet on the 16th); <code>grep -o</code> pulls out just the reasons (7 "bad number", 4 "not positive"). For money, <code>sed</code> keeps only the number after ₹ on each "Total sales" line (<code>\\(…\\)</code> captures it, <code>\\1</code> prints it) and <code>awk</code> adds them up: ₹395 + 500 + 510 + 630 + 655 + 230 = <strong>₹2920</strong>. Straight from the CSVs, <code>tail -q -n +2</code> drops each header (start at line 2, no file names), <code>cut -d, -f4</code> keeps the item, and the count shows masala chai on the most order rows (28). Two traps appear for real: <code>uniq -c</code> without <code>sort</code> counted "masala chai" twice in separate groups, because it only merges neighbours; and <code>cut -d, -f7</code> on the note column split Ben's quoted <code>"extra chutney, no onion"</code> at its comma. <code>find</code> listed all CSVs, those modified after the 15th's file (<code>-newer</code>), and logs bigger than 1 KB; <code>grep -rn</code> searched every <code>.py</code> file and printed file, line number and line.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sorting coins into piles to count them: first pick out only the coins (grep), look only at the value side (cut), arrange equal coins next to each other (sort), count each pile (uniq -c), put the biggest pile first (sort -rn). Counting piles before arranging them gives several small piles of the same coin.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>grep PATTERN</strong>: print lines matching a regular expression. <strong>cut -dD -fN</strong>: field N split on D. <strong>uniq -c</strong>: collapse adjacent duplicates with counts. <strong>find PATH TESTS</strong>: walk a tree and print files passing the tests (<code>-name</code>, <code>-newer</code>, <code>-size +1k</code>, <code>-mtime -1</code>). <strong>awk '{…}'</strong>: run a small program per line (<code>$1</code> = field 1, <code>END</code> runs at the end).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Always <code>sort | uniq -c</code>, never bare <code>uniq -c</code>. And text tools do not understand CSV quoting: for real analysis of CSVs with quoted commas use pandas or <code>csvkit</code>; shell pipelines are for quick questions on simple columns and logs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Permissions.</b> Ravi wants to read the sheets for his own analysis. He must not change them, and he must never see the database password. How does Linux decide who may do what?</div>

  <h2 id="sl-perm"><span class="num">06</span>Permissions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two problems with one cause. A helper script refuses to run ("Permission denied"), and a shared server must let Ravi read the sales data but not change it, and keep Meera's <code>.env</code> private. What decides who can read, change or run a file?</p>
  </div>
  <p>Every file has an <strong>owner</strong> (a user), a <strong>group</strong>, and three sets of three permissions. Kinds of access: <strong>r</strong> read, <strong>w</strong> write, <strong>x</strong> execute (run as a program). Kinds of people: the owner (<strong>u</strong>), members of the file's group (<strong>g</strong>), everyone else (<strong>o</strong>). <code>ls -l</code> shows them as ten characters: one for the type (<code>-</code> file, <code>d</code> directory), then three rwx triples.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <rect x="20" y="20" width="40" height="36" rx="5" class="fs"/><text x="40" y="43" text-anchor="middle">-</text>
    <rect x="70" y="20" width="120" height="36" rx="5" class="fb sb"/><text x="130" y="43" text-anchor="middle">r w -</text>
    <rect x="200" y="20" width="120" height="36" rx="5" class="ft st"/><text x="260" y="43" text-anchor="middle">r - -</text>
    <rect x="330" y="20" width="120" height="36" rx="5" class="fg sg"/><text x="390" y="43" text-anchor="middle">- - -</text>
    <text x="40" y="76" text-anchor="middle" class="tm">type</text>
    <text x="130" y="76" text-anchor="middle">owner (u)</text><text x="260" y="76" text-anchor="middle">group (g)</text><text x="390" y="76" text-anchor="middle">others (o)</text>
    <text x="130" y="100" text-anchor="middle" class="tb">4+2+0 = 6</text><text x="260" y="100" text-anchor="middle" class="tb">4+0+0 = 4</text><text x="390" y="100" text-anchor="middle" class="tb">0+0+0 = 0</text>
    <text x="525" y="43" text-anchor="middle" class="tg">= 640</text>
    <text x="525" y="70" text-anchor="middle" class="tm">r=4 w=2 x=1</text>
  </svg><figcaption>The shared sheet's mode, decoded: owner reads and writes, group reads, others nothing.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A housing society. Your flat (owner): you can enter, change and use everything. The society committee (group): they may look at the notice you pinned but not change it. Visitors (others): they see nothing. Each door has three locks: look, change, use.</p>
  </div>
  <p><strong>Decoding by hand.</strong> Each triple is a 3-bit number: r = 4, w = 2, x = 1, added. So <code>rwx</code> = 7, <code>rw-</code> = 6, <code>r-x</code> = 5, <code>r--</code> = 4, <code>---</code> = 0.</p>
  <table class="tbl">
    <tr><th>ls -l shows</th><th>owner</th><th>group</th><th>others</th><th>number</th><th>typical use</th></tr>
    <tr><td><code>-rw-rw-r--</code></td><td>rw = 6</td><td>rw = 6</td><td>r = 4</td><td>664</td><td>new file on Ubuntu (sales_report.py here)</td></tr>
    <tr><td><code>-rwxr-xr-x</code></td><td>rwx = 7</td><td>r-x = 5</td><td>r-x = 5</td><td>755</td><td>scripts, folders</td></tr>
    <tr><td><code>-rw-r-----</code></td><td>rw = 6</td><td>r = 4</td><td>- = 0</td><td>640</td><td>data the team may read</td></tr>
    <tr><td><code>-rw-------</code></td><td>rw = 6</td><td>0</td><td>0</td><td>600</td><td>secrets, SSH keys</td></tr>
    <tr><td><code>drwxr-x---</code></td><td>rwx = 7</td><td>r-x = 5</td><td>0</td><td>750</td><td>a folder only owner + group may enter</td></tr>
  </table>
  <div class="fx" data-lang="text">$ ls -l
total 24
-rw-rw-r-- 1 meera meera  136 Oct 20 00:05 CHANGELOG.md
-rw-rw-r-- 1 meera meera  289 Oct 20 00:05 README.md
drwxrwxr-x 2 meera meera 4096 Oct 20 00:05 data
drwxrwxr-x 2 meera meera 4096 Oct 20 00:05 logs
-rw-rw-r-- 1 meera meera 1109 Oct 20 00:05 sales_report.py
-rw-rw-r-- 1 meera meera  351 Oct 20 00:05 sample_orders.csv
$ ls -l sales_report.py
-rw-rw-r-- 1 meera meera 1109 Oct 20 00:05 sales_report.py
$ ls -ld data
drwxrwxr-x 2 meera meera 4096 Oct 20 00:05 data
$ cp /srv/tools/monday.sh .
$ cat monday.sh
#!/usr/bin/env bash
python3 ~/chai-report/sales_report.py ~/chai-report/data/orders_2026-10-19.csv
$ ls -l monday.sh
-rw-r--r-- 1 meera meera 99 Oct 20 00:05 monday.sh
$ ./monday.sh
bash: ./monday.sh: Permission denied
$ chmod +x monday.sh
$ ls -l monday.sh
-rwxr-xr-x 1 meera meera 99 Oct 20 00:05 monday.sh
$ ./monday.sh 2&gt;/dev/null | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ echo "DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall" &gt; .env
$ ls -l .env
-rw-rw-r-- 1 meera meera 57 Oct 20 00:05 .env
$ chmod 600 .env
$ ls -l .env
-rw------- 1 meera meera 57 Oct 20 00:05 .env
$ stat -c '%A %a %U:%G %n' monday.sh .env sales_report.py
-rwxr-xr-x 755 meera:meera monday.sh
-rw------- 600 meera:meera .env
-rw-rw-r-- 664 meera:meera sales_report.py
$ chmod g-w,o-rx monday.sh
$ ls -l monday.sh
-rwxr-x--- 1 meera meera 99 Oct 20 00:05 monday.sh
$ chmod 755 monday.sh
$ ls -ld ~
drwxr-x--- 3 meera meera 4096 Oct 20 00:05 /home/meera</div>
  <p><code>monday.sh</code> arrived as <code>-rw-r--r--</code>: nobody had <code>x</code>, so running it gave "Permission denied". <code>chmod +x</code> added x for all three (<code>rwxr-xr-x</code>, 755) and it printed ₹230. The fresh <code>.env</code> got <code>-rw-rw-r--</code> (664): anyone on the machine could read the password; <code>chmod 600</code> fixed that. <code>stat</code> prints mode letters and numbers side by side. The symbolic form <code>g-w,o-rx</code> means "group: remove w; others: remove r and x". Meera's home is <code>drwxr-x---</code>: others cannot even enter it.</p>
  <p>Now sharing with Ravi. Ravi is not in Meera's group, and her home is closed to others, so the admin (root) makes a shared folder owned by meera and group <code>stall</code>:</p>
  <div class="fx" data-lang="text">root# mkdir /srv/stall-data
root# chown meera:stall /srv/stall-data
root# chmod 750 /srv/stall-data
root# ls -ld /srv/stall-data
drwxr-x--- 2 meera stall 4096 Oct 20 00:05 /srv/stall-data
$ id
uid=30033(meera) gid=30033(meera) groups=30033(meera),30035(stall)
$ cp data/orders_2026-10-19.csv /srv/stall-data/
$ chmod 640 /srv/stall-data/orders_2026-10-19.csv
$ ls -l /srv/stall-data
total 4
-rw-r----- 1 meera meera 351 Oct 20 00:05 orders_2026-10-19.csv
$ chgrp stall /srv/stall-data/orders_2026-10-19.csv
$ ls -l /srv/stall-data
total 4
-rw-r----- 1 meera stall 351 Oct 20 00:05 orders_2026-10-19.csv
ravi$ id
uid=30034(ravi) gid=30034(ravi) groups=30034(ravi)
ravi$ head -n 2 /srv/stall-data/orders_2026-10-19.csv
head: cannot open '/srv/stall-data/orders_2026-10-19.csv' for reading: Permission denied
ravi$ ls /home/meera
ls: cannot open directory '/home/meera': Permission denied
root# usermod -aG stall ravi
root# id ravi
uid=30034(ravi) gid=30034(ravi) groups=30034(ravi),30035(stall)
ravi$ id
uid=30034(ravi) gid=30034(ravi) groups=30034(ravi),30035(stall)
ravi$ head -n 2 /srv/stall-data/orders_2026-10-19.csv
order_id,time,customer,item,qty,price,note
1,08:05,Asha,masala chai,2,20,
ravi$ echo "10,09:30,Ravi,samosa,1,15," &gt;&gt; /srv/stall-data/orders_2026-10-19.csv
bash: /srv/stall-data/orders_2026-10-19.csv: Permission denied
ravi$ rm -f /srv/stall-data/orders_2026-10-19.csv
rm: cannot remove '/srv/stall-data/orders_2026-10-19.csv': Permission denied</div>
  <p>Trace it. The folder is <code>drwxr-x---</code> meera:stall, so stall members may enter and list it. Meera copied the sheet and set 640; but a new file takes the creator's main group (meera), so <code>chgrp stall</code> gave it to the team. Ravi, not yet in <code>stall</code>, is "others": he could neither read the sheet nor list Meera's home. root ran <code>usermod -aG stall ravi</code> (<code>-a</code> = append, otherwise his other groups would be replaced). After a fresh login (groups are read at login), <code>id</code> shows stall, he can read the first two lines, but writing fails (group has r, not w) and deleting fails (the folder gives the group no w). Exactly "the team can read the data, only the owner can change it".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>chmod</strong>: change mode (numeric <code>640</code> or symbolic <code>u+x,g-w</code>). <strong>chgrp</strong> / <strong>chown</strong>: change group / owner (chown needs root). For a <strong>directory</strong>: r = list names, w = create/delete entries, x = enter. <strong>root</strong>: the administrator, who bypasses these checks.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>chmod -R 777</code> "fixes" every permission error by letting everyone write everything, including your scripts and secrets. Find out who needs which access and grant just that, usually through a group. SSH refuses private keys that others can read (section 10).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Processes &amp; Signals.</b> Files are now protected. But a program is more than a file: once running it uses CPU and memory and may need to be stopped. How do we see and control running programs?</div>

  <h2 id="sl-proc"><span class="num">07</span>Processes &amp; Signals</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The stall wants a live board that refreshes the total every second all day. Once started, how do we check it is still running, how much it uses, and how do we stop it without losing its last total? And how does a program tell the caller whether it succeeded?</p>
  </div>
  <p>Every running program is a <strong>process</strong> with a number, the <strong>PID</strong>. A process runs in the <strong>foreground</strong> (holds your terminal) or the <strong>background</strong> (add <code>&amp;</code>; you get the prompt back; <code>$!</code> holds its PID). <code>nohup</code> makes it ignore the hang-up signal sent when your session closes. To stop a process you send it a <strong>signal</strong>. Our board catches SIGTERM to save the last total before exiting:</p>
  <div class="fx" data-lang="py">import csv, signal, sys, time

SHEET = sys.argv[1]

def total():
    t = 0
    with open(SHEET, newline="") as f:
        for row in csv.DictReader(f):
            try:
                qty, price = int(row["qty"]), int(row["price"])
            except ValueError:
                continue
            if qty &gt; 0:
                t += qty * price
    return t

def stop(signum, frame):
    print(f"got signal {signum}, saving last total", flush=True)
    with open("last_total.txt", "w") as f:
        f.write(f"{total()}\\n")
    sys.exit(0)

signal.signal(signal.SIGTERM, stop)   # run stop() on a polite kill

n = 0
while True:
    n += 1
    print(f"refresh {n}: Total sales ₹{total()}", flush=True)
    time.sleep(1)</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Closing a shop. <strong>SIGTERM</strong> is the owner saying "we close in five minutes": staff finish the bill and lock the cash box. <strong>SIGKILL</strong> is the power being cut: everything stops mid-bill and the box stays open.</p>
  </div>
  <div class="fx" data-lang="text">$ cp /srv/tools/live_board.py .
$ nohup python3 live_board.py data/orders_2026-10-19.csv &gt; board.log 2&gt;&amp;1 &amp;
$ sleep 3
$ jobs -l
[1]+ 23973 Running                 nohup python3 live_board.py data/orders_2026-10-19.csv &gt; board.log 2&gt;&amp;1 &amp;
$ ps -o pid,ppid,stat,%cpu,%mem,etime,cmd -p $!
  PID  PPID STAT %CPU %MEM     ELAPSED CMD
23973 23970 S+    0.6  0.0       00:03 python3 live_board.py data/orders_2026-10-19.csv
$ pgrep -af live_board
23973 python3 live_board.py data/orders_2026-10-19.csv
$ top -b -n 1 -u meera | head -n 9
top - 00:06:01 up 14 min,  0 user,  load average: 0.75, 1.14, 0.98
Tasks: 105 total,   1 running, 104 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st 
MiB Mem :  16093.2 total,  10370.4 free,   1102.7 used,   5078.8 buff/cache     
MiB Swap:      0.0 total,      0.0 free,      0.0 used.  14990.5 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
23965 meera     20   0    3156   2180   2048 S   0.0   0.0   0:00.00 script
23970 meera     20   0    4764   3504   3228 S   0.0   0.0   0:00.00 bash
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
$ sleep 2.5
$ kill -9 $!
$ sleep 1
bash: 24006 Killed                  python3 live_board.py data/orders_2026-10-19.csv &gt; board.log 2&gt;&amp;1
$ tail -n 2 board.log
refresh 2: Total sales ₹230
refresh 3: Total sales ₹230</div>
  <p><code>jobs -l</code> lists this shell's background jobs. <code>ps</code> shows the PID, parent PID, state (<code>S</code> = sleeping in <code>time.sleep</code>), CPU %, memory % and elapsed time. <code>pgrep -af</code> finds PIDs by command line. <code>top -b -n 1</code> is one snapshot of the live view: load, memory (look at "avail Mem"), then one line per process. Plain <code>kill</code> sent SIGTERM: our handler ran, the log ends with "got signal 15, saving last total" and <code>last_total.txt</code> holds 230. <code>kill -9</code> sent SIGKILL: the log just stops; no handler can run, nothing is saved.</p>
  <p>The <strong>exit code</strong> is how a process tells its caller what happened: 0 success, anything else failure. Killed by an unhandled signal n, the shell reports 128 + n:</p>
  <div class="fx" data-lang="text">$ python3 live_board.py data/orders_2026-10-19.csv &gt; /dev/null &amp; sleep 1; kill $!; wait $!; echo "exit code: $?"
exit code: 0
$ sleep 100 &amp; sleep 0.2; kill $!; wait $!; echo "exit code: $?"
exit code: 143
$ sleep 100 &amp; sleep 0.2; kill -9 $!; wait $!; echo "exit code: $?"
bash: 24015 Killed                  sleep 100
exit code: 137
$ timeout --preserve-status -s INT 1 sleep 100; echo "exit code: $?"
exit code: 130
$ python3 sales_report.py; echo "exit code: $?"
usage: python3 sales_report.py ORDERS.csv
exit code: 2
$ python3 sales_report.py data/orders_2026-10-16.csv 2&gt;&amp;1 | tail -n 1; echo "exit code: \${PIPESTATUS[0]}"
FileNotFoundError: [Errno 2] No such file or directory: 'data/orders_2026-10-16.csv'
exit code: 1</div>
  <table class="tbl">
    <tr><th>Exit code</th><th>Meaning</th><th>Seen here</th></tr>
    <tr><td>0</td><td>success (our handler called <code>sys.exit(0)</code>)</td><td>board stopped with SIGTERM</td></tr>
    <tr><td>1</td><td>general error</td><td>missing sheet → FileNotFoundError</td></tr>
    <tr><td>2</td><td>usage error (by convention)</td><td>report without a file name</td></tr>
    <tr><td>126 / 127</td><td>not executable / command not found</td><td>sections 09 and 08</td></tr>
    <tr><td>130 = 128 + 2</td><td>SIGINT (Ctrl+C)</td><td><code>timeout -s INT</code></td></tr>
    <tr><td>137 = 128 + 9</td><td>SIGKILL (kill -9, OOM killer, docker stop timeout)</td><td><code>sleep</code> killed</td></tr>
    <tr><td>143 = 128 + 15</td><td>SIGTERM, not handled</td><td><code>sleep</code> killed politely</td></tr>
  </table>
  <p><code>\${PIPESTATUS[0]}</code> is bash's exit code of the <em>first</em> command of the last pipeline (plain <code>$?</code> would give <code>tail</code>'s 0); section 09 returns to this. For long jobs over SSH, <code>tmux</code> is the comfortable option: <code>tmux new -s board</code>, start the job, Ctrl+B then D to detach, log out; <code>tmux attach -t board</code> later.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Use</th></tr>
    <tr><td><code>ps aux</code>, <code>pgrep -af NAME</code></td><td>list processes / find PIDs</td></tr>
    <tr><td><code>top</code>, <code>htop</code>, <code>nvidia-smi</code></td><td>live CPU, RAM, GPU</td></tr>
    <tr><td><code>kill PID</code> / <code>kill -9 PID</code></td><td>polite stop (SIGTERM) / forced (SIGKILL)</td></tr>
    <tr><td>Ctrl+C, Ctrl+Z, <code>bg</code>, <code>fg</code></td><td>interrupt (SIGINT) / pause, then resume</td></tr>
    <tr><td><code>cmd &amp;</code>, <code>nohup</code>, <code>tmux</code></td><td>background; survive logout</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Process</strong>: a running instance of a program with a PID, memory and open files. <strong>Signal</strong>: a small asynchronous message to a process: SIGINT 2, SIGKILL 9 (cannot be caught), SIGTERM 15 (default of <code>kill</code>). <strong>Exit status</strong>: 0–255; 128 + n means "killed by signal n".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for <code>kill -9</code> first: no cleanup, no saved state, half-written files. Send SIGTERM, wait a few seconds, then SIGKILL. And a job started with <code>&amp;</code> but without <code>nohup</code>/<code>tmux</code> may die when your SSH session drops.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Environment Variables &amp; PATH.</b> Processes start other processes and pass them settings. How does a program get its configuration (like the database URL) without editing code, and how does the shell even find the program when you type its name?</div>

  <h2 id="sl-env"><span class="num">08</span>Environment Variables &amp; PATH</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Docker note's version of the report will need a database password. Writing it in the code puts it in Git (the Git note showed how that ends). And Meera's handy <code>chai-report</code> command works in one terminal but says "command not found" in another. Where do settings come from, and how does the shell find commands?</p>
  </div>
  <p>An <strong>environment variable</strong> is a name=value string the shell keeps and hands to every program it starts. Some exist already: <code>HOME</code>, <code>USER</code>, <code>SHELL</code>, <code>PATH</code>. You read one with <code>$NAME</code>. A child program receives a <em>copy</em> of the variables, but only of the <strong>exported</strong> ones.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Instructions for a babysitter. A note you only keep in your head (a shell variable) helps nobody. A note on the fridge (exported) is read by everyone who comes in later (child programs). The babysitter can scribble on her copy; your original is unchanged.</p>
  </div>
  <div class="fx" data-lang="text">$ echo $HOME $USER $SHELL
/home/meera meera /bin/bash
$ echo $PATH
/opt/ruby-3.3.6/bin:/opt/rbenv/bin:/opt/rbenv/shims:/opt/node22/bin:/home/meera/.nix-profile/bin:/nix/var/nix/profiles/default/bin:/opt/maven/bin:/usr/lib/jvm/java-21-openjdk-amd64/bin:/opt/gradle/bin:/root/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
$ which python3 ls
/usr/bin/python3
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
  <p>Before <code>export</code>, the shell knew <code>CURRENCY</code> but Python, a child process, got <code>None</code>. After <code>export</code> Python saw <code>INR</code>. <code>DEBUG=1 cmd</code> sets a variable for that one command only; the shell never kept it, so <code>[$DEBUG]</code> printed empty. <code>env</code> lists exported variables.</p>
  <p><strong>PATH</strong> answers a question beginners never ask: when you type <code>python3</code>, which file runs? The shell walks the folders listed in PATH, left to right, and runs the first match. "command not found" means: none of those folders contains it. (This sandbox's PATH is long because many tools are installed; a normal server's is shorter.)</p>
  <div class="flow"><span>you type chai-report</span><span>shell scans each folder in $PATH, left → right</span><span>first match runs · none → "command not found"</span></div>
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
/home/meera/bin:/opt/ruby-3.3.6/bin:/opt/rbenv/bin:/opt/rbenv/shims:/opt/node22/bin:/home/meera/.nix-profile/bin:/nix/var/nix/profiles/default/bin:/opt/maven/bin:/usr/lib/jvm/java-21-openjdk-amd64/bin:/opt/gradle/bin:/root/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
$ which chai-report
/home/meera/bin/chai-report
$ chai-report data/orders_2026-10-19.csv 2&gt;/dev/null | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ (PATH=/nowhere; ls)
bash: ls: command not found
$ python3 -m venv .venv
$ source .venv/bin/activate
$ echo $PATH
/home/meera/chai-report/.venv/bin:/home/meera/bin:/opt/ruby-3.3.6/bin:/opt/rbenv/bin:/opt/rbenv/shims:/opt/node22/bin:/home/meera/.nix-profile/bin:/nix/var/nix/profiles/default/bin:/opt/maven/bin:/usr/lib/jvm/java-21-openjdk-amd64/bin:/opt/gradle/bin:/root/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
$ which python3
/home/meera/chai-report/.venv/bin/python3
$ deactivate
$ which python3
/usr/bin/python3</div>
  <p><code>~/bin/chai-report</code> is a two-line wrapper (<code>exec</code> replaces the wrapper process with Python; <code>"$@"</code> passes all arguments on). Typed by name it was "command not found": <code>~/bin</code> was not in PATH. By its full path it ran. After <code>export PATH="$HOME/bin:$PATH"</code> (prepend, keep the rest), <code>which</code> finds it and the name works. In a subshell with <code>PATH=/nowhere</code>, even <code>ls</code> is "command not found": that is what happens if you forget the <code>:$PATH</code>. And the secret of virtual environments from the Python track: <code>source .venv/bin/activate</code> just put <code>.venv/bin</code> first in PATH, so <code>python3</code> meant the venv's copy; <code>deactivate</code> removed it. To keep a PATH change, put the export line in <code>~/.bashrc</code> (every new shell) or <code>~/.profile</code> (login shells; Ubuntu's default <code>.profile</code> already adds <code>~/bin</code> if it exists at login).</p>
  <p>In Python, read required settings with <code>os.environ["X"]</code> (crash early with a clear error) and optional ones with <code>os.getenv("X", default)</code>:</p>
  <div class="fx" data-lang="text">$ cp /srv/tools/dbcheck.py .
$ cat dbcheck.py
import os

currency = os.getenv("CURRENCY", "INR")          # optional: has a default
print("currency:", currency)
db_url = os.environ["DATABASE_URL"]              # required: crash early if missing
print("database:", db_url)
$ python3 dbcheck.py
currency: INR
Traceback (most recent call last):
  File "/home/meera/chai-report/dbcheck.py", line 5, in &lt;module&gt;
    db_url = os.environ["DATABASE_URL"]              # required: crash early if missing
             ~~~~~~~~~~^^^^^^^^^^^^^^^^
  File "&lt;frozen os&gt;", line 717, in __getitem__
KeyError: 'DATABASE_URL'
$ DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall CURRENCY=USD python3 dbcheck.py
currency: USD
database: postgresql://chai:chai-secret@db:5432/stall</div>
  <p>Without <code>DATABASE_URL</code> the script stopped at line 5 with <code>KeyError: 'DATABASE_URL'</code>, before doing any work: far better than running all night against a wrong default. With both variables set on the command line it printed them. The Docker note passes exactly this variable with <code>-e</code> and Compose. Values are always strings: <code>"false"</code> is truthy in Python, so compare explicitly.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Environment variable</strong>: a key=value string passed from a parent process to its children. <strong>PATH</strong>: colon-separated folders searched for commands. <strong>12-factor config</strong>: keep URLs, secrets and flags in the environment, so the same code runs in dev and prod.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Editing <code>~/.bashrc</code> does nothing to the terminal already open: <code>source ~/.bashrc</code> or open a new one. <code>export PATH=~/bin</code> (without <code>:$PATH</code>) replaces the whole list. And "I installed it but command not found": it went into a folder not on PATH (e.g. <code>~/.local/bin</code>), or into a different Python environment.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bash Scripting.</b> We have all the pieces of the nightly job: paths, redirects, exit codes, variables. How do we save them as one program that stops loudly when something goes wrong?</div>

  <h2 id="sl-bash"><span class="num">09</span>Bash Scripting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The nightly job is: find today's sheet, stop with an error if it is missing, run the report, prefix every line with the date, append it to the log, mark the run as done. cron (section 11) needs this as one runnable file. And by default bash keeps going after an error; how do we make sure a failed run is never logged as "DONE"?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe card for a new cook. A good card says "if the milk has gone sour, STOP and tell me". A bad card lets the cook carry on and serve sour kheer with a smile. <code>set -euo pipefail</code> is the "stop and tell me" line.</p>
  </div>
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
$ tail -n 9 logs/report.log
2026-10-19 WARN line 9: bad number qty='1' price=''
2026-10-19 WARN line 10: qty -1 is not positive
2026-10-19 Total sales: ₹230 from 6 valid orders, rejected: 3
2026-10-19 top item: masala chai (5 sold)
2026-10-19   masala chai  ₹100
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
  <p>Line by line. <code>#!/usr/bin/env bash</code> (the <strong>shebang</strong>) names the interpreter. <code>&#36;{APP_DIR:-$HOME/chai-report}</code> = "APP_DIR if set, else the default" (configurable through the environment, section 08). <code>&#36;{1:-$(date +%F)}</code> = first argument, or today's date (<code>$(…)</code> runs a command and pastes its output). <code>[[ ! -f "$SHEET" ]]</code> tests "is not a regular file"; then we log an ERROR line and <code>exit 1</code>. The pipeline runs the report with stderr merged into stdout (<code>2&gt;&amp;1</code>), <code>sed</code> prefixes each line with the day, <code>&gt;&gt;</code> appends to the log. The first run failed with exit code <strong>126</strong> (exists but not executable) until <code>chmod +x</code>. Then the 19th went into the log with its date prefix, and the 16th (closed) logged an ERROR and returned 1. The two loops show <code>for</code> over files (count orders per sheet) and over numbers, with <code>||</code> printing a message only when a day fails.</p>
  <p>Now why <code>pipefail</code>. A broken export for the 20th has the header <code>quantity</code> instead of <code>qty</code>, so the script crashes with <code>KeyError</code>. Watch the same script with and without pipefail:</p>
  <div class="fx" data-lang="text">$ cp /srv/tools/orders_2026-10-20.csv data/
$ head -n 2 data/orders_2026-10-20.csv
order_id,time,customer,item,quantity,price,note
1,08:04,Asha,masala chai,2,20,
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
  <p>Without pipefail, a pipeline's status is its <em>last</em> command's: <code>sed</code> succeeded, so the crash was invisible, the script carried on, wrote "2026-10-20 DONE" and exited 0. Anyone grepping for DONE would believe the 20th was fine. With pipefail the pipeline failed, <code>-e</code> stopped the script before the DONE line, and it exited 1. The two one-liners show the rule in isolation.</p>
  <p>And <code>-u</code>, plus quoting:</p>
  <div class="fx" data-lang="text">$ cp /srv/tools/cleanup_unsafe.sh /srv/tools/cleanup_safe.sh .
$ chmod +x cleanup_*.sh
$ cat cleanup_unsafe.sh
#!/usr/bin/env bash
cd "$ARCHIVE_DIR"
echo "would delete old sheets in $(pwd):"
ls
$ ./cleanup_unsafe.sh; echo "exit code: $?"
would delete old sheets in /home/meera/chai-report:
CHANGELOG.md	 cleanup_unsafe.sh  logs	   sales_report.py
README.md	 data		    monday.sh	   sample_orders.csv
cleanup_safe.sh  live_board.py	    run_report.sh
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
-rw-rw-r-- 1 meera meera 0 Oct 20 00:06 'orders 19 oct.csv'
$ rm "$f"
$ grep -q "Gita" data/orders_2026-10-19.csv &amp;&amp; echo "Gita ordered today" || echo "no Gita"
Gita ordered today
$ grep -q "Zoya" data/orders_2026-10-19.csv &amp;&amp; echo "Zoya ordered today" || echo "no Zoya"
no Zoya</div>
  <p>The unsafe cleanup script used <code>$ARCHIVE_DIR</code>, which nobody set. <code>cd ""</code> silently stayed in the current folder, so it would have "cleaned" the project folder itself, reporting success. With <code>set -u</code> an unset variable is an error: stopped at line 3, exit 1. <code>X = 5</code> with spaces ran a command called X. Unquoted <code>$f</code> was split at the spaces into three names; <code>"$f"</code> stayed one. <code>grep -q</code> prints nothing and only sets the exit code, perfect for <code>&amp;&amp; … || …</code>.</p>
  <div class="cards">
    <div><b>set -e</b><p>Exit on the first failing command.</p></div>
    <div><b>set -u</b><p>Using an unset variable is an error, not "".</p></div>
    <div><b>set -o pipefail</b><p>A pipeline fails if any stage fails, not only the last.</p></div>
    <div><b>Exit codes</b><p><code>exit 0</code> success, <code>exit 1</code> failure; read the last one with <code>$?</code>.</p></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shell script</strong>: a text file of shell commands, run by the interpreter in its shebang; needs <code>chmod +x</code> to run as <code>./run_report.sh</code> (or run it as <code>bash run_report.sh</code>). <strong>Parameter expansion</strong>: <code>$VAR</code>, <code>&#36;{VAR:-default}</code>, <code>&#36;{VAR:?message}</code> (abort if unset). <strong>Command substitution</strong>: <code>$(cmd)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>rm -rf "$DIR/"</code> with an empty DIR becomes <code>rm -rf /</code>. Use <code>set -u</code>, quote every variable, and for deletes write <code>rm -rf "&#36;{DIR:?not set}/"</code>. For anything longer than ~50 lines, switch to Python.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SSH &amp; Keys.</b> The script runs on the server. But Meera is at home with her laptop. How does she get a terminal on the server, safely, and copy files back and forth?</div>

  <h2 id="sl-ssh"><span class="num">10</span>SSH &amp; Keys</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>So far we typed "on the server". In real life the server is in a data centre and Meera is at home. Passwords can be guessed and sniffed. How does she log in safely, run commands remotely, and copy logs and data between machines?</p>
  </div>
  <p><strong>SSH</strong> (secure shell) gives an encrypted terminal on another machine. Instead of passwords it uses a <strong>key pair</strong>: two linked files made together. The <strong>public key</strong> is like a padlock: copy it to every server, in <code>~/.ssh/authorized_keys</code>. The <strong>private key</strong> is the only key that opens it and never leaves the laptop. At login the server sends a random challenge; the laptop signs it with the private key; the server checks the signature with the public key.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="sl-arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="200" height="70" rx="8" class="fb sb"/><text x="110" y="45" text-anchor="middle">Meera's laptop</text><text x="110" y="68" text-anchor="middle" class="tm">~/.ssh/id_ed25519 (private)</text>
    <rect x="390" y="20" width="200" height="70" rx="8" class="fg sg"/><text x="490" y="45" text-anchor="middle">chai server</text><text x="490" y="68" text-anchor="middle" class="tm">authorized_keys (public)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="212" y1="45" x2="386" y2="45" marker-end="url(#sl-arr3)"/><line x1="388" y1="70" x2="214" y2="70" marker-end="url(#sl-arr3)"/></g>
    <text x="300" y="38" text-anchor="middle" class="tm">2. signed challenge</text><text x="300" y="86" text-anchor="middle" class="tm">1. random challenge</text>
    <text x="300" y="112" text-anchor="middle" class="tr">the private key never leaves the laptop</text>
  </svg><figcaption>Key-based login: the server holds the public key (padlock); the laptop proves it holds the private key.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your signature at the bank. The bank keeps a specimen (public key). To withdraw, you sign a fresh slip (the challenge) in front of them; they compare. Seeing the specimen does not let anyone forge your signing hand.</p>
  </div>
  <p>Here the "server" is the same sandbox machine, reached through a real SSH daemon listening on port 2222, so every line below really ran over SSH. <code>ssh-copy-id</code> (which needs a password login) is replaced by what it does: append the public key to <code>authorized_keys</code>.</p>
  <div class="fx" data-lang="text">$ ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 -C "meera@laptop" -q
$ ls -l ~/.ssh
total 8
-rw------- 1 meera meera 399 Oct 20 00:06 id_ed25519
-rw-r--r-- 1 meera meera  94 Oct 20 00:06 id_ed25519.pub
$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGc8fAW48mHxDXjwAtge3gm40AnmYKdWM1VXkPEF3NGY meera@laptop
$ cat ~/.ssh/id_ed25519.pub &gt;&gt; ~/.ssh/authorized_keys
$ chmod 600 ~/.ssh/authorized_keys
$ ssh -p 2222 -o StrictHostKeyChecking=accept-new meera@localhost 'whoami; pwd; tail -n 2 chai-report/logs/report.log'
Warning: Permanently added '[localhost]:2222' (ED25519) to the list of known hosts.
meera
/home/meera
2026-10-20                      ~~~^^^^^^^
2026-10-20 KeyError: 'qty'
$ ssh -p 2222 meera@localhost 'cd chai-report &amp;&amp; python3 sales_report.py data/orders_2026-10-19.csv 2&gt;/dev/null | head -n 1'
Total sales: ₹230 from 6 valid orders, rejected: 3
$ mkdir -p ~/laptop
$ scp -P 2222 meera@localhost:chai-report/logs/report.log ~/laptop/
report.log                                    100% 4177     8.4MB/s   00:00    
$ ls -l ~/laptop
total 8
-rw-rw-r-- 1 meera meera 4177 Oct 20 00:06 report.log
$ rsync -av -e "ssh -p 2222" meera@localhost:chai-report/data/ ~/laptop/data/
receiving incremental file list
created directory /home/meera/laptop/data
./
orders_2026-10-13.csv
orders_2026-10-14.csv
orders_2026-10-15.csv
orders_2026-10-17.csv
orders_2026-10-18.csv
orders_2026-10-19.csv

sent 141 bytes  received 3,487 bytes  7,256.00 bytes/sec
total size is 3,056  speedup is 0.84
$ rsync -av -e "ssh -p 2222" meera@localhost:chai-report/data/ ~/laptop/data/
receiving incremental file list

sent 20 bytes  received 166 bytes  372.00 bytes/sec
total size is 3,056  speedup is 16.43
$ chmod 644 ~/.ssh/id_ed25519
$ ssh -o BatchMode=yes -p 2222 meera@localhost true
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/home/meera/.ssh/id_ed25519' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "/home/meera/.ssh/id_ed25519": bad permissions
meera@localhost: Permission denied (publickey,password).
$ chmod 600 ~/.ssh/id_ed25519
$ printf 'Host chai-server\\n    HostName localhost\\n    Port 2222\\n    User meera\\n' &gt; ~/.ssh/config
$ ssh chai-server 'echo "connected to $(hostname) as $(whoami)"'
connected to vm as meera</div>
  <p><code>ssh-keygen</code> made <code>id_ed25519</code> (private, 600) and <code>id_ed25519.pub</code> (public, one line you may share). On first contact ssh stored the server's identity in <code>known_hosts</code> ("Permanently added"); next time a changed identity raises a warning (possible impostor). <code>ssh host 'commands'</code> ran commands remotely and printed their output locally: the server's log tail and Monday's total. <code>scp</code> copied the log down; <code>rsync -av</code> copied the data folder, and the second run transferred nothing because nothing had changed. With the key made readable by others (644), ssh refused to use it ("UNPROTECTED PRIVATE KEY FILE") and login failed; <code>BatchMode=yes</code> only stops it from asking for a password instead. A <code>~/.ssh/config</code> block turns all the flags into one name: <code>ssh chai-server</code>.</p>
  <p>One more everyday use, not run here: <code>ssh -L 8888:localhost:8888 chai-server</code> forwards your laptop's port 8888 through the encrypted connection to the server's port 8888, so a Jupyter (or the Docker note's board on 8080) running on the server opens at <code>http://localhost:8888</code> in your browser without exposing it to the internet.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SSH</strong>: encrypted remote login (default port 22). <strong>authorized_keys</strong>: public keys allowed to log in as that user. <strong>known_hosts</strong>: server identities you have accepted. <strong>scp</strong> copies files over SSH; <strong>rsync</strong> synchronises folders, sending only differences.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never share or commit the private key (<code>id_ed25519</code> without <code>.pub</code>); if it leaks, remove its public key from every <code>authorized_keys</code>. Keep <code>~/.ssh</code> at 700 and keys at 600, or SSH ignores them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: cron.</b> Meera can now reach the server from anywhere. But the whole point was that nobody has to: how does <code>run_report.sh</code> run at 21:00 every night by itself?</div>

  <h2 id="sl-cron"><span class="num">11</span>cron: Run It Every Night</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The report should run every evening at 21:00, after the stall closes, whether or not anyone is logged in. What runs it, how do we write the schedule, and why do scripts that work in our terminal fail under the scheduler?</p>
  </div>
  <p><strong>cron</strong> is the built-in scheduler, a background service (daemon) that wakes every minute and runs the lines of each user's <strong>crontab</strong> whose time matches. Each line has five time fields and a command:</p>
  <figure class="viz"><svg viewBox="0 0 600 100" width="600">
    <rect x="20" y="15" width="90" height="34" rx="5" class="fb sb"/><text x="65" y="37" text-anchor="middle">0</text>
    <rect x="125" y="15" width="90" height="34" rx="5" class="fb sb"/><text x="170" y="37" text-anchor="middle">21</text>
    <rect x="230" y="15" width="90" height="34" rx="5" class="ft st"/><text x="275" y="37" text-anchor="middle">*</text>
    <rect x="335" y="15" width="90" height="34" rx="5" class="ft st"/><text x="380" y="37" text-anchor="middle">*</text>
    <rect x="440" y="15" width="90" height="34" rx="5" class="fg sg"/><text x="485" y="37" text-anchor="middle">*</text>
    <text x="65" y="70" text-anchor="middle" class="tm">minute</text><text x="170" y="70" text-anchor="middle" class="tm">hour</text><text x="275" y="70" text-anchor="middle" class="tm">day of month</text><text x="380" y="70" text-anchor="middle" class="tm">month</text><text x="485" y="70" text-anchor="middle" class="tm">weekday (0=Sun)</text>
    <text x="300" y="94" text-anchor="middle">= 21:00 every day</text>
  </svg><figcaption>Five time fields, then the command. * = every; */15 = every 15th; 1-5 = Monday to Friday.</figcaption></figure>
  <table class="tbl">
    <tr><th>Schedule</th><th>Meaning</th></tr>
    <tr><td><code>* * * * *</code></td><td>every minute (used below so we see results quickly)</td></tr>
    <tr><td><code>*/15 * * * *</code></td><td>every 15 minutes</td></tr>
    <tr><td><code>0 21 * * *</code></td><td>21:00 every day (our nightly report)</td></tr>
    <tr><td><code>0 9 * * 1</code></td><td>Mondays 09:00 (a weekly summary)</td></tr>
    <tr><td><code>0 0 1 * *</code></td><td>midnight on the 1st of each month</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An alarm clock with a sticky note: "at 21:00, do this". But the person woken by the alarm has just arrived: they do not know your shortcuts, your desk layout or your nicknames for things. Write the note with full addresses.</p>
  </div>
  <p>Real run: a test crontab with three every-minute lines (our script by full path, the <code>chai-report</code> command by name, and a dump of cron's environment), then a wait past the next minute:</p>
  <div class="fx" data-lang="text">$ crontab -l
no crontab for meera
$ cp /srv/tools/mycron.txt .
$ cat mycron.txt
# m h dom mon dow  command
* * * * * $HOME/chai-report/run_report.sh 2026-10-19 &gt;&gt; $HOME/chai-report/logs/cron.log 2&gt;&amp;1
* * * * * chai-report $HOME/chai-report/data/orders_2026-10-19.csv &gt;&gt; $HOME/cron-bad.log 2&gt;&amp;1
* * * * * env &gt; $HOME/cron-env.txt
$ crontab mycron.txt
$ crontab -l
# m h dom mon dow  command
* * * * * $HOME/chai-report/run_report.sh 2026-10-19 &gt;&gt; $HOME/chai-report/logs/cron.log 2&gt;&amp;1
* * * * * chai-report $HOME/chai-report/data/orders_2026-10-19.csv &gt;&gt; $HOME/cron-bad.log 2&gt;&amp;1
* * * * * env &gt; $HOME/cron-env.txt
$ date
Tue Oct 20 00:06:13 UTC 2026
$ sleep 70
$ date
Tue Oct 20 00:07:23 UTC 2026
$ cat ~/cron-env.txt
HOME=/home/meera
LOGNAME=meera
PATH=/usr/bin:/bin
LANG=C.UTF-8
SHELL=/bin/sh
PWD=/home/meera
$ cat ~/cron-bad.log
/bin/sh: 1: chai-report: not found
$ tail -n 3 logs/report.log
2026-10-19   samosa       ₹45
2026-10-19   ginger chai  ₹25
2026-10-19 DONE
$ cp /srv/tools/nightly.txt .
$ crontab nightly.txt
$ crontab -l
# m h dom mon dow  command
0 21 * * * $HOME/chai-report/run_report.sh &gt;&gt; $HOME/chai-report/logs/cron.log 2&gt;&amp;1</div>
  <p>Read the evidence. cron ran with a tiny environment: <code>PATH=/usr/bin:/bin</code>, <code>SHELL=/bin/sh</code>, no <code>.bashrc</code>, no <code>~/bin</code>. So the line that used the <code>chai-report</code> command by name failed with "not found" (the very command that worked in section 08), while the line with the full path ran: the log ends with a fresh "2026-10-19 … DONE". Output that is not redirected would be lost (or mailed to a local mailbox nobody reads), so every line sends both streams to a log. Finally we installed the real schedule: <code>0 21 * * *</code>, no date argument, so the script uses today's date. Note the time zone: this server runs on UTC, so "21:00" here is 02:30 in India; set the server's time zone or convert.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>cron</strong>: the scheduling daemon. <strong>crontab</strong>: a user's schedule; <code>crontab -e</code> edits, <code>crontab -l</code> lists, <code>crontab FILE</code> installs, <code>crontab -r</code> removes. Bigger pipelines with dependencies and retries move to <a class="xref" data-note="de_etl">Airflow-style orchestrators</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"It works in my terminal but not in cron": minimal PATH, <code>sh</code> instead of bash, no <code>.bashrc</code> variables, home as the working directory, server time zone. Use absolute paths, set needed variables in the script, redirect output to a log, and check the log the next morning.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Disk &amp; Memory.</b> The job now runs forever, unattended. Logs grow every night, and one day it may die silently. How do we check the machine's resources and recognise those failures?</div>

  <h2 id="sl-res"><span class="num">12</span>Disk &amp; Memory Checks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two classic mysteries for a job nobody watches: it fails with "No space left on device" because logs and data grew, or it simply vanishes with no Python error at all. How do we find the cause in a minute?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Disk is the cupboard: <code>df</code> says how much shelf space is left in the whole cupboard, <code>du</code> how much each box takes. Memory is the work table: when it overflows, the building manager (the OOM killer) throws someone's papers out without asking.</p>
  </div>
  <div class="fx" data-lang="text">$ df -h /home
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        252G   39G  730M  99% /
$ du -sh ~/chai-report/* | sort -h
4.0K	/home/meera/chai-report/CHANGELOG.md
4.0K	/home/meera/chai-report/README.md
4.0K	/home/meera/chai-report/live_board.py
4.0K	/home/meera/chai-report/monday.sh
4.0K	/home/meera/chai-report/run_report.sh
4.0K	/home/meera/chai-report/sales_report.py
4.0K	/home/meera/chai-report/sample_orders.csv
12K	/home/meera/chai-report/logs
28K	/home/meera/chai-report/data
$ du -sh ~/chai-report/.git
688K	/home/meera/chai-report/.git
$ du -h --max-depth=1 ~ | sort -h
4.0K	/home/meera/.cache
8.0K	/home/meera/.config
8.0K	/home/meera/bin
28K	/home/meera/.ssh
768K	/home/meera/chai-report
840K	/home/meera
$ free -h
               total        used        free      shared  buff/cache   available
Mem:            15Gi       1.2Gi       9.1Gi       154Mi       5.8Gi        14Gi
Swap:             0B          0B          0B
$ nproc
4
$ ls -lh logs/
total 8.0K
-rw-rw-r-- 1 meera meera    0 Oct 20 00:07 cron.log
-rw-rw-r-- 1 meera meera 4.5K Oct 20 00:07 report.log</div>
  <p><code>-h</code> = human-readable sizes. <code>df</code> reports the whole filesystem: on this sandbox the disk was almost full (look at Avail and Use%), exactly the situation that kills a nightly job; on a real server, alert well before 90%. <code>du -sh</code> sums each item; <code>--max-depth=1 | sort -h</code> ranks folders so the biggest is last. Our project is tiny: the <code>.git</code> history is the biggest part. In <code>free</code>, read <strong>available</strong>, not "free": Linux uses idle RAM as file cache (<code>buff/cache</code>) and gives it back the moment a program needs it.</p>
  <p>Now the vanishing job. The administrator ran a script that grabs 20 MB more memory each step inside a container limited to 100 MB (Docker's <code>-m</code> uses the same kernel feature as any memory limit):</p>
  <div class="fx" data-lang="text">root# cat /srv/tools/eat_memory.py
data = []
for i in range(50):
    data.append(bytearray(20 * 1024 * 1024))   # grab 20 MB more each time
    print("allocated", (i + 1) * 20, "MB", flush=True)
root# docker run --name oom-demo -m 100m --memory-swap 100m -v /srv/tools/eat_memory.py:/eat_memory.py:ro python:3.12-slim python /eat_memory.py; echo "exit code: $?"
allocated 20 MB
allocated 40 MB
allocated 60 MB
allocated 80 MB
exit code: 137
root# docker inspect oom-demo --format '{{.State.OOMKilled}} {{.State.ExitCode}}'
true 137
root# dmesg | grep -i "killed process" | tail -n 1
[  945.692060] Memory cgroup out of memory: Killed process 24653 (python) total-vm:116608kB, anon-rss:101760kB, file-rss:5488kB, shmem-rss:0kB, UID:0 pgtables:260kB oom_score_adj:0
root# docker rm oom-demo
oom-demo</div>
  <p>No Python traceback: the process was killed from outside with SIGKILL, so the exit code is 137 (128 + 9, section 07). Docker records <code>OOMKilled: true</code>, and the kernel log names the culprit: "Memory cgroup out of memory: Killed process … (python)" with about 100 MB resident. Fixes: process data in chunks, use lighter types, or give the job more memory.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>df</strong>: disk free per filesystem. <strong>du</strong>: disk usage per file/folder. <strong>OOM killer</strong>: kernel feature that kills a process when memory (or a memory limit) runs out. <strong>Swap</strong>: disk used as slow overflow RAM (0 here).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deleting a big log that a running process still writes to does not free the space until the process closes it; truncate with <code>: &gt; app.log</code> or restart the process. Rotate logs (<code>logrotate</code>) instead of letting <code>report.log</code> grow forever. Check hidden hogs: <code>~/.cache</code>, Docker images (<code>docker system df</code>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Twelve sections, one server. How do they combine when cron fires at 21:00?</div>

  <h2 id="sl-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What actually happens, layer by layer, when the clock reaches 21:00 and nobody is logged in?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 330" width="660">
<defs><marker id="sl-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="160" y="10" width="340" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="28" text-anchor="middle" font-size="11.5" font-weight="700">cron daemon: "0 21 * * *" matches (11)</text><text x="330" y="43" text-anchor="middle" class="tm" font-size="10">starts /bin/sh with PATH=/usr/bin:/bin, HOME=/home/meera (08)</text>
<line x1="330" y1="50" x2="330" y2="68" stroke="currentColor" marker-end="url(#sl-a9)"/>
<rect x="160" y="70" width="340" height="40" rx="7" class="fb sb"/><text x="330" y="88" text-anchor="middle" font-size="11.5" font-weight="700">run_report.sh (09): x bit set (06), set -euo pipefail</text><text x="330" y="103" text-anchor="middle" class="tm" font-size="10">absolute path ~/chai-report (02) · DAY=$(date +%F) · [[ -f sheet ]]</text>
<line x1="330" y1="110" x2="330" y2="128" stroke="currentColor" marker-end="url(#sl-a9)"/>
<rect x="160" y="130" width="340" height="40" rx="7" class="fg sg"/><text x="330" y="148" text-anchor="middle" font-size="11.5" font-weight="700">python3 sales_report.py sheet 2&gt;&amp;1 | sed | &gt;&gt; log (04)</text><text x="330" y="163" text-anchor="middle" class="tm" font-size="10">a process with a PID (07); stdout + stderr merged, prefixed, appended</text>
<line x1="230" y1="170" x2="120" y2="198" stroke="currentColor" marker-end="url(#sl-a9)"/><line x1="430" y1="170" x2="540" y2="198" stroke="currentColor" marker-end="url(#sl-a9)"/>
<rect x="20" y="200" width="200" height="44" rx="7" class="ft st"/><text x="120" y="219" text-anchor="middle" font-size="11">exit 0 → "DONE" line</text><text x="120" y="235" text-anchor="middle" class="tm" font-size="10">exit ≠ 0 → stop, no DONE (pipefail)</text>
<rect x="440" y="200" width="200" height="44" rx="7" class="ft st"/><text x="540" y="219" text-anchor="middle" font-size="11">logs/report.log grows</text><text x="540" y="235" text-anchor="middle" class="tm" font-size="10">watch with df / du (12)</text>
<rect x="160" y="270" width="340" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="289" text-anchor="middle" font-size="11.5" font-weight="700">Next morning, from the laptop (10)</text><text x="330" y="305" text-anchor="middle" class="tm" font-size="10">ssh chai-server 'grep -c WARN …' · grep | cut | sort | uniq -c (05)</text>
<line x1="120" y1="244" x2="250" y2="268" stroke="currentColor" marker-end="url(#sl-a9)"/><line x1="540" y1="244" x2="410" y2="268" stroke="currentColor" marker-end="url(#sl-a9)"/>
</svg><figcaption>One nightly run touches every section: scheduling, environment, permissions, script safety, streams, processes and exit codes, then remote analysis.</figcaption></figure>
  <table class="tbl"><caption>Every idea on the chai server</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Terminal</td><td>typed commands</td><td>why not click?</td><td>one loop → 6 daily totals</td><td>always on servers</td></tr>
    <tr><td>Filesystem tree</td><td>/ + paths</td><td>where am I?</td><td>/home/meera/chai-report/data</td><td>every command</td></tr>
    <tr><td>File commands</td><td>paths</td><td>copy, peek, count?</td><td>10 lines = 9 orders; 99 lines/week</td><td>daily</td></tr>
    <tr><td>Streams, redirects, pipes</td><td>file descriptors 0/1/2</td><td>where does output go?</td><td>WARN on stderr: <code>| grep -c</code> = 0, <code>2&gt;&amp;1 |</code> = 3</td><td>logging, chaining</td></tr>
    <tr><td>Text pipeline</td><td>pipes + small tools</td><td>questions about logs?</td><td>11 WARN, 4 on the 17th, week ₹2920</td><td>quick analysis</td></tr>
    <tr><td>Permissions</td><td>owner/group/others × rwx</td><td>who may do what?</td><td>monday.sh 644→755; .env 600; sheet 640 meera:stall</td><td>every shared or secret file</td></tr>
    <tr><td>Processes, signals</td><td>PIDs, kernel</td><td>what runs; stop safely?</td><td>SIGTERM saved 230; exit 0/1/2/130/137/143</td><td>long jobs, debugging</td></tr>
    <tr><td>Env vars, PATH</td><td>process inheritance</td><td>config; command not found?</td><td>CURRENCY None→INR; ~/bin on PATH</td><td>config, secrets, venvs</td></tr>
    <tr><td>Bash script</td><td>all of the above</td><td>one safe program?</td><td>pipefail: exit 0 + DONE → exit 1, no DONE</td><td>glue up to ~50 lines</td></tr>
    <tr><td>SSH, scp, rsync</td><td>key pairs</td><td>remote access?</td><td>644 key ignored; rsync 2nd run: nothing sent</td><td>every remote machine</td></tr>
    <tr><td>cron</td><td>scripts + env</td><td>run unattended?</td><td>PATH=/usr/bin:/bin; "chai-report: not found"</td><td>simple schedules</td></tr>
    <tr><td>df, du, free, OOM</td><td>kernel accounting</td><td>why did it die?</td><td>disk nearly full; exit 137, OOMKilled</td><td>when jobs fail silently</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>everything on Linux is a process started by another process, reading and writing files through numbered streams, with its rights decided by user/group permissions and its behaviour by inherited environment variables; scripts and cron just start such processes for you, and exit codes tell you how they ended.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The habits that delete data or leave a job silently broken.</div>

  <h2 id="sl-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which terminal habits cause lost files, leaked secrets or jobs that fail without anyone noticing?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: rm with a variable</span><p><code>rm -rf $DIR/*</code> with an empty DIR deletes from <code>/</code>. Quote, use <code>set -u</code> and <code>&#36;{DIR:?}</code>; run <code>ls</code> with the same path first.</p></div>
  <div class="callout trap"><span class="label">Trap: uniq without sort</span><p><code>uniq -c</code> counts only adjacent duplicates ("masala chai" appeared in two groups). Always <code>sort | uniq -c</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: redirect onto the input</span><p><code>sort f &gt; f</code> left 0 lines. Write to a new name and <code>mv</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: piping stderr</span><p><code>| grep</code> sees only stdout; our WARN count was 0 until <code>2&gt;&amp;1</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: chmod 777</span><p>Hides the real problem and lets anyone change code and read secrets. Fix owner/group instead.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting export or the :$PATH</span><p>A variable without <code>export</code> is invisible to Python; <code>PATH=~/bin</code> without <code>:$PATH</code> breaks every command.</p></div>
  <div class="callout trap"><span class="label">Trap: kill -9 first</span><p>No cleanup, no saved state. SIGTERM first, wait, then SIGKILL.</p></div>
  <div class="callout trap"><span class="label">Trap: scripts without set -euo pipefail</span><p>The crashed run on the 20th was logged as DONE with exit 0.</p></div>
  <div class="callout trap"><span class="label">Trap: cron "works in my terminal"</span><p>Minimal PATH, sh, no .bashrc, UTC: absolute paths, explicit variables, output redirected to a log.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="sl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: server folder <code>~/chai-report</code> (git clone of tag <code>v1.0.0</code>), sheets for 13, 14, 15, 17, 18, 19 October (closed on the 16th), log <code>logs/report.log</code>, nightly script <code>run_report.sh</code>, crontab <code>0 21 * * *</code>. Monday: <strong>Total sales: ₹230 from 6 valid orders, rejected: 3</strong>; week: 11 WARN lines (4 on the 17th; 7 bad number, 4 not positive), total ₹2920.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On our server</th><th>Weakness → next</th></tr>
    <tr><td>Terminal</td><td>why not click?</td><td>one loop, six totals</td><td>where are we?</td></tr>
    <tr><td>Filesystem</td><td>where am I?</td><td>pwd, ls -la, cd, tree</td><td>work with files</td></tr>
    <tr><td>Files</td><td>copy, peek, count?</td><td>cp, mv, rm, head, wc -l = 10</td><td>combine, save output</td></tr>
    <tr><td>Streams &amp; pipes</td><td>where does output go?</td><td>WARN on stderr; 2&gt;&amp;1</td><td>real questions</td></tr>
    <tr><td>Text pipeline</td><td>what does the log say?</td><td>11 WARN; ₹2920</td><td>share data safely</td></tr>
    <tr><td>Permissions</td><td>who may do what?</td><td>755, 600, 640 meera:stall</td><td>running programs</td></tr>
    <tr><td>Processes</td><td>see and stop?</td><td>SIGTERM saved 230; 137, 143</td><td>configuration</td></tr>
    <tr><td>Env &amp; PATH</td><td>settings; command not found?</td><td>export; ~/bin; activate</td><td>one program</td></tr>
    <tr><td>Bash</td><td>safe automation?</td><td>run_report.sh; pipefail</td><td>remote access</td></tr>
    <tr><td>SSH</td><td>reach the server?</td><td>keys, scp, rsync, config</td><td>no human at 21:00</td></tr>
    <tr><td>cron</td><td>run unattended?</td><td>0 21 * * *; PATH trap</td><td>resources</td></tr>
  </table>
  <h3>Definitions, syntax, numbers</h3>
  <ul>
    <li><strong>Paths</strong>: absolute starts with <code>/</code>; relative from <code>pwd</code>; <code>.</code> here, <code>..</code> up, <code>~</code> home, <code>cd -</code> back.</li>
    <li><strong>Files</strong>: <code>mkdir -p</code>, <code>cp -r</code>, <code>mv</code>, <code>rm -r</code>/<code>-f</code>, <code>head/tail -n N</code>, <code>tail -f</code>, <code>wc -l</code>, <code>less</code>, <code>man</code>.</li>
    <li><strong>Streams</strong>: 0 stdin, 1 stdout, 2 stderr. <code>&gt;</code>, <code>&gt;&gt;</code>, <code>2&gt;</code>, <code>&gt; f 2&gt;&amp;1</code>, <code>&lt;</code>, <code>|</code> (stdout only), <code>/dev/null</code>.</li>
    <li><strong>Text</strong>: <code>grep -c/-v/-o/-q/-rn</code>, <code>cut -d, -f4</code>, <code>sort -rn</code>, <code>uniq -c</code>, <code>tail -n +2</code>, <code>sed 's/a/b/'</code>, <code>awk '{s+=$1} END{print s}'</code>, <code>find DIR -name -newer -size</code>.</li>
    <li><strong>Permissions</strong>: type + u/g/o × rwx; r=4 w=2 x=1 → 7 rwx, 6 rw-, 5 r-x, 4 r--. 755 scripts/dirs, 644 files, 640 team-read, 600 secrets. Dir: r list, w create/delete, x enter. <code>chmod</code>, <code>chgrp</code>, <code>chown</code>, <code>usermod -aG</code>, <code>id</code>.</li>
    <li><strong>Processes</strong>: <code>&amp;</code>, <code>$!</code>, <code>jobs</code>, <code>ps</code>, <code>pgrep -af</code>, <code>top</code>, <code>kill</code> (15), <code>kill -9</code>, Ctrl+C (2), <code>nohup</code>, <code>tmux</code>. Exit: 0 ok, 1 error, 2 usage, 126 not executable, 127 not found, 128+n killed by n.</li>
    <li><strong>Env</strong>: <code>export X=v</code>; <code>X=v cmd</code>; <code>env</code>; PATH left→right, first match; <code>which</code>; <code>~/.bashrc</code>/<code>~/.profile</code>; activate = prepend <code>.venv/bin</code>. Python <code>os.environ["X"]</code> vs <code>os.getenv("X", d)</code>.</li>
    <li><strong>Bash</strong>: shebang, <code>set -euo pipefail</code>, <code>&#36;{1:-default}</code>, <code>$(cmd)</code>, <code>[[ -f "$F" ]]</code>, <code>for … do … done</code>, <code>exit 1</code>, <code>$?</code>, <code>\${PIPESTATUS[0]}</code>, <code>a &amp;&amp; b || c</code>, quote <code>"$var"</code>.</li>
    <li><strong>SSH</strong>: <code>ssh-keygen -t ed25519</code>, <code>authorized_keys</code>, <code>ssh host 'cmd'</code>, <code>scp</code>, <code>rsync -av</code>, <code>~/.ssh/config</code>, <code>-L</code> tunnel; keys 600.</li>
    <li><strong>cron</strong>: <code>min hour dom mon dow cmd</code>; <code>crontab -e/-l/FILE</code>; env = PATH=/usr/bin:/bin, sh.</li>
    <li><strong>Resources</strong>: <code>df -h</code>, <code>du -sh</code>, <code>du -h --max-depth=1 | sort -h</code>, <code>free -h</code> (available), <code>nproc</code>, <code>dmesg</code>; 137 + OOMKilled = memory limit.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Shell pipelines</b><p>Quick questions on logs and simple columns.</p><small>Not for quoted CSVs or real analysis (pandas)</small></div>
    <div><b>Bash scripts</b><p>Glue: run programs in order, check files, log.</p><small>Switch to Python past ~50 lines or for logic</small></div>
    <div><b>kill -9</b><p>A process that ignored SIGTERM for a while.</p><small>Never first</small></div>
    <div><b>nohup / tmux</b><p>Long jobs over SSH.</p><small>Not a replacement for cron or a service</small></div>
    <div><b>cron</b><p>Simple fixed schedules on one machine.</p><small>Not for dependencies/retries: use an orchestrator</small></div>
    <div><b>Groups + 640/750</b><p>Team-readable data.</p><small>Never 777</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>rm with empty variables; uniq without sort; <code>sort f &gt; f</code>; pipes ignore stderr; chmod 777; missing export or <code>:$PATH</code>; kill -9 first; scripts without <code>set -euo pipefail</code>; cron's minimal environment and UTC; private key not 600; deleting a log still held open.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why did <code>python3 sales_report.py sheet | grep -c WARN</code> print 0?</td><td>WARN lines go to stderr; a pipe carries only stdout. Use <code>2&gt;&amp;1 |</code>.</td></tr>
    <tr><td><code>-rw-r-----</code> as a number?</td><td>640 (owner rw 6, group r 4, others 0)</td></tr>
    <tr><td>A job exits with 137 and no traceback. Likely cause?</td><td>SIGKILL (128 + 9), usually the OOM killer or a kill -9</td></tr>
    <tr><td>Why "command not found" in cron but not in your terminal?</td><td>cron's PATH is only /usr/bin:/bin and it reads no .bashrc</td></tr>
    <tr><td>What does <code>set -o pipefail</code> change?</td><td>A pipeline fails if any stage fails, not only the last (the KeyError run stopped instead of logging DONE)</td></tr>
  </table>

  <h2 id="sl-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Absolute vs relative path? What do <code>.</code>, <code>..</code> and <code>~</code> mean?</summary><div class="qa-body">An absolute path starts at <code>/</code> and works from anywhere; a relative path starts from the current directory. <code>.</code> = this folder, <code>..</code> = parent, <code>~</code> = your home.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the 3 most frequent IPs in an access log where the IP is the first field.</summary><div class="qa-body"><code>awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -3</code> (or <code>cut -d' ' -f1</code>). Sort first because <code>uniq</code> only collapses adjacent lines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you count the data rows of a CSV and see its first 5 lines without opening it?</summary><div class="qa-body"><code>wc -l file.csv</code> minus 1 for the header (or <code>tail -n +2 file.csv | wc -l</code>), and <code>head -n 5 file.csv</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Difference between <code>&gt;</code>, <code>&gt;&gt;</code>, <code>2&gt;</code> and <code>2&gt;&amp;1</code>?</summary><div class="qa-body"><code>&gt;</code> stdout to a file (overwrite), <code>&gt;&gt;</code> append, <code>2&gt;</code> stderr to a file, <code>&gt; f 2&gt;&amp;1</code> stderr to wherever stdout goes, so both end in f.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>chmod 640 file</code> mean?</summary><div class="qa-body">Owner read+write (6), group read (4), others nothing (0): <code>-rw-r-----</code>. Team may read, only the owner may change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>./run_report.sh</code> says "Permission denied" (exit 126). Fix?</summary><div class="qa-body">The file lacks the execute bit: <code>chmod +x run_report.sh</code>, or run it as <code>bash run_report.sh</code>. On a folder, you need x to enter it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"python: command not found" but Python is installed. Why?</summary><div class="qa-body">Its folder is not in PATH, or it is called <code>python3</code>. Check <code>which python3</code> and <code>echo $PATH</code>; add the folder with <code>export PATH="/its/bin:$PATH"</code> in <code>~/.bashrc</code>, or activate the venv.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You set <code>API_KEY=abc</code> but Python's <code>os.getenv("API_KEY")</code> returns None. Why?</summary><div class="qa-body">It was not exported, so child processes do not receive it. <code>export API_KEY=abc</code> or <code>API_KEY=abc python app.py</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your long job dies when your SSH connection drops. Fix it.</summary><div class="qa-body">Run it in <code>tmux</code>/<code>screen</code> and detach, or <code>nohup cmd &gt; job.log 2&gt;&amp;1 &amp;</code>. For recurring jobs use cron or a service manager.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>kill vs kill -9?</summary><div class="qa-body"><code>kill</code> sends SIGTERM: the process can catch it, save state and exit (our board saved 230). <code>kill -9</code> sends SIGKILL: stopped instantly by the kernel, no cleanup.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A job exits with 137 and no traceback. What happened?</summary><div class="qa-body">137 = 128 + 9: killed by SIGKILL, usually the OOM killer for exceeding memory. Confirm with <code>dmesg | grep -i "killed process"</code> or <code>docker inspect</code> (OOMKilled true). 143 = 128 + 15 = SIGTERM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>set -euo pipefail</code> do?</summary><div class="qa-body"><code>-e</code> stop on error, <code>-u</code> error on unset variables, <code>pipefail</code> pipeline fails if any stage fails. Without it a script can fail halfway, keep going and report success.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output of <code>bash -c 'false | true; echo $?'</code>?</summary><div class="qa-body"><code>0</code>: a pipeline's status is its last command's. With <code>set -o pipefail</code> it prints <code>1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a cron line to run <code>report.sh</code> at 08:00 every weekday.</summary><div class="qa-body"><code>0 8 * * 1-5 /srv/app/report.sh &gt;&gt; /var/log/report.log 2&gt;&amp;1</code>. Absolute paths (cron's PATH is minimal), log both streams, mind the server's time zone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does SSH key authentication work?</summary><div class="qa-body">Generate a key pair; put the public key in the server's <code>~/.ssh/authorized_keys</code>. At login the server sends a challenge, the client signs it with the private key, the server verifies with the public key. The private key never travels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The disk is full on a server. How do you find the culprit?</summary><div class="qa-body"><code>df -h</code> for the filesystem; <code>du -h --max-depth=1 DIR | sort -h</code> and drill down; <code>find / -size +1G</code>. Usual suspects: logs, data, Docker images, caches.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do the WARN lines matter for both the pipeline section and the bash script?</summary><div class="qa-body">The Git note sent them to stderr. That is why a plain pipe could not count them (0) and why <code>run_report.sh</code> needs <code>2&gt;&amp;1</code> before <code>sed</code>, so warnings reach the log where section 05 counts them (11 for the week).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does cron need everything from sections 06, 08 and 09?</summary><div class="qa-body">cron runs a file (needs the x bit, 06), in a minimal environment (absolute paths, explicit variables, 08), with nobody watching (the script must fail loudly with <code>set -euo pipefail</code> and log both streams, 09). Skip any one and the job fails silently at 21:00.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip pipefail but keep <code>set -e</code>?</summary><div class="qa-body">Errors inside a pipeline are hidden by the last stage's success: the KeyError run of the 20th wrote "DONE" and exited 0, so <code>-e</code> never triggered and the log lied.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do signals and exit codes from this note show up in Docker?</summary><div class="qa-body"><code>docker stop</code> sends SIGTERM to the container's PID 1 and SIGKILL after 10 s; a process that ignores SIGTERM ends with 137 (128 + 9), and a memory limit kills with 137 and OOMKilled. Same kernel, same numbers.</div></details>
</main>
`
});
