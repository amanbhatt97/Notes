// notes/softeng/se_linux.js — Linux & Terminal
Object.assign(TOPIC_CONTENT, {
  "se_linux": `<main>
  <h1>Linux &amp; Terminal</h1>
  <p class="lead">Every model you deploy runs on a Linux box you reach through a terminal: a cloud VM, a GPU server, a Docker container. This note covers the commands you need to move around, inspect data and logs, run long jobs and automate them.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sl-fs"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Filesystem &amp; Navigation</span><span class="rm-sub">One tree from /</span></div></div>
      <div class="rm-item rm-done" data-target="sl-cmds"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Core Commands</span><span class="rm-sub">Files, search, inspect</span></div></div>
      <div class="rm-item rm-done" data-target="sl-pipe"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Pipes &amp; Redirection</span><span class="rm-sub">Analyse a log in one line</span></div></div>
      <div class="rm-item rm-done" data-target="sl-perm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Permissions</span><span class="rm-sub">rwx, chmod, chown</span></div></div>
      <div class="rm-item rm-done" data-target="sl-env"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Environment &amp; PATH</span><span class="rm-sub">Config without code</span></div></div>
      <div class="rm-item rm-done" data-target="sl-proc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Processes &amp; Jobs</span><span class="rm-sub">ps, kill, nohup</span></div></div>
      <div class="rm-item rm-done" data-target="sl-bash"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Bash Scripting</span><span class="rm-sub">Safe scripts that fail loudly</span></div></div>
      <div class="rm-item rm-done" data-target="sl-ssh"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">SSH, scp &amp; cron</span><span class="rm-sub">Remote boxes, schedules</span></div></div>
      <div class="rm-item rm-done" data-target="sl-res"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Disk &amp; Memory</span><span class="rm-sub">df, du, free</span></div></div>
      <div class="rm-item rm-done" data-target="sl-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 9 lines</span></div></div>
      <div class="rm-item rm-done" data-target="sl-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sl-fs"><span class="num">01</span>Filesystem &amp; Navigation</h2>
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
  </svg><figcaption>One tree starting at / — no C: or D: drives. Disks are "mounted" as folders.</figcaption></figure>
  <div class="fx" data-lang="text">pwd                  # where am I?  /home/asha/project
ls -la               # list all (incl. hidden .files), long format
cd data/raw          # relative path (from here)
cd /var/log          # absolute path (from /)
cd ~   |  cd ..  |  cd -     # home, parent, previous dir</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An address: absolute path = full postal address from the country down; relative path = "two doors down from here".</p>
  </div>

  <h2 id="sl-cmds"><span class="num">02</span>Core Commands</h2>
  <table class="tbl">
    <tr><th>Need</th><th>Command</th><th>Note</th></tr>
    <tr><td>Copy / move / rename</td><td><code>cp -r src dst</code>, <code>mv a b</code></td><td><code>-r</code> for folders</td></tr>
    <tr><td>Delete</td><td><code>rm file</code>, <code>rm -r dir</code></td><td>No recycle bin</td></tr>
    <tr><td>Make folders</td><td><code>mkdir -p a/b/c</code></td><td><code>-p</code>: parents, no error if exists</td></tr>
    <tr><td>Peek at a file</td><td><code>head -n 5</code>, <code>tail -n 5</code>, <code>less</code></td><td>Never <code>cat</code> a 10 GB CSV</td></tr>
    <tr><td>Follow a live log</td><td><code>tail -f train.log</code></td><td>Ctrl+C to stop</td></tr>
    <tr><td>Search text</td><td><code>grep -rn "API_KEY" src/</code></td><td><code>-i</code> ignore case, <code>-v</code> invert, <code>-c</code> count</td></tr>
    <tr><td>Find files</td><td><code>find . -name "*.csv" -size +100M</code></td><td>Also <code>-mtime -1</code> (changed in last day)</td></tr>
    <tr><td>Count lines</td><td><code>wc -l file</code></td><td>Rows in a CSV = lines − 1</td></tr>
  </table>
  <div class="fx" data-lang="text">$ grep -rn "API_KEY" src/
src/app.py:2:KEY = os.environ["API_KEY"]</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>rm -rf $DIR/</code> with an empty <code>DIR</code> becomes <code>rm -rf /</code>. Quote variables and use <code>set -u</code> (section 07).</p>
  </div>

  <h2 id="sl-pipe"><span class="num">03</span>Pipes &amp; Redirection</h2>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <defs><marker id="sl-arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="5" y="30" width="95" height="44" rx="8" class="fs"/><text x="52" y="57" text-anchor="middle">access.log</text>
    <rect x="125" y="30" width="105" height="44" rx="8" class="fb sb"/><text x="177" y="57" text-anchor="middle">awk $4</text>
    <rect x="255" y="30" width="70" height="44" rx="8" class="fb sb"/><text x="290" y="57" text-anchor="middle">sort</text>
    <rect x="350" y="30" width="95" height="44" rx="8" class="fb sb"/><text x="397" y="57" text-anchor="middle">uniq -c</text>
    <rect x="470" y="30" width="125" height="44" rx="8" class="fg sg"/><text x="532" y="57" text-anchor="middle">sort -rn</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="101" y1="52" x2="121" y2="52" marker-end="url(#sl-arr1)"/><line x1="231" y1="52" x2="251" y2="52" marker-end="url(#sl-arr1)"/><line x1="326" y1="52" x2="346" y2="52" marker-end="url(#sl-arr1)"/><line x1="446" y1="52" x2="466" y2="52" marker-end="url(#sl-arr1)"/></g>
    <text x="300" y="100" text-anchor="middle" class="tm">stdout of each command becomes stdin of the next</text>
  </svg><figcaption>Small tools, each doing one job, chained with | — like a SQL GROUP BY in one line.</figcaption></figure>
  <div class="fx" data-lang="text">$ head -n 3 access.log
2024-06-01T10:00:01 GET /predict 200 45ms
2024-06-01T10:00:02 GET /predict 200 51ms
2024-06-01T10:00:02 GET /health 200 2ms

$ wc -l access.log
8 access.log
$ grep " 500 " access.log | wc -l          # how many server errors?
2
$ awk '{print $4}' access.log | sort | uniq -c | sort -rn   # count by status
      5 200
      2 500
      1 404</div>
  <p>Same idea on a CSV — orders per city, skipping the header:</p>
  <div class="fx" data-lang="text">$ cat sales.csv
order_id,city,amount
100,Mumbai,880
101,Mumbai,500
102,Delhi,150
103,Mumbai,1150
104,Pune,120
$ tail -n +2 sales.csv | cut -d, -f2 | sort | uniq -c | sort -rn
      3 Mumbai
      1 Pune
      1 Delhi</div>
  <table class="tbl">
    <tr><th>Syntax</th><th>Meaning</th></tr>
    <tr><td><code>cmd &gt; out.txt</code></td><td>stdout to file (overwrite)</td></tr>
    <tr><td><code>cmd &gt;&gt; out.txt</code></td><td>append</td></tr>
    <tr><td><code>cmd 2&gt; err.txt</code></td><td>stderr (stream 2) to file</td></tr>
    <tr><td><code>cmd &gt; all.log 2&gt;&amp;1</code></td><td>both streams to one file</td></tr>
    <tr><td><code>cmd &lt; in.txt</code></td><td>file as stdin</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>uniq</code> only merges <em>adjacent</em> duplicates — always <code>sort</code> first. And <code>cut -d,</code> breaks on quoted commas; use Python/pandas or <code>csvkit</code> for real CSVs.</p>
  </div>

  <h2 id="sl-perm"><span class="num">04</span>Permissions</h2>
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
  </svg><figcaption>Ten characters: file type, then read/write/execute for owner, group and everyone else.</figcaption></figure>
  <div class="fx" data-lang="text">$ ls -l train.sh
-rw-r--r-- 1 root root 28 Oct 16 06:27 train.sh
$ ./train.sh
bash: ./train.sh: Permission denied        # (no x bit)
$ chmod +x train.sh &amp;&amp; ls -l train.sh
-rwxr-xr-x 1 root root 28 Oct 16 06:27 train.sh
$ ./train.sh
hi
$ chmod 600 secrets.env &amp;&amp; ls -l secrets.env
-rw------- 1 root root 0 Oct 16 06:27 secrets.env</div>
  <p>Columns: perms, link count, <strong>owner</strong>, <strong>group</strong>, size, modified time, name. <code>600</code> = only the owner can read/write — what SSH demands for private keys. For directories, <code>x</code> means "may enter".</p>
  <div class="fx" data-lang="text">chmod u+x,g-w file          # symbolic form
sudo chown asha:ds data/    # change owner:group (-R for recursive)</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>chmod -R 777</code> "fixes" permission errors by letting everyone write everything. Find which user needs which access instead.</p>
  </div>

  <h2 id="sl-env"><span class="num">05</span>Environment Variables &amp; PATH</h2>
  <div class="fx" data-lang="text">$ export MODEL_PATH=/models/rf.pkl      # exported: child processes see it
$ bash -c 'echo child sees: $MODEL_PATH'
child sees: /models/rf.pkl
$ FOO=1                                 # not exported: shell-only
$ bash -c 'echo child sees FOO: "[$FOO]"'
child sees FOO: []
$ which python3
/usr/bin/python3</div>
  <div class="flow"><span>type python</span><span>shell scans each dir in $PATH, left → right</span><span>first match runs</span></div>
  <ul>
    <li><strong>PATH</strong>: colon-separated list of folders searched for commands. "command not found" = not in any of them.</li>
    <li>Add a folder: <code>export PATH="$HOME/.local/bin:$PATH"</code>; make it permanent in <code>~/.bashrc</code>.</li>
    <li>Activating a virtualenv just puts <code>.venv/bin</code> first in PATH.</li>
  </ul>
  <div class="fx" data-lang="py">import os
db_url = os.environ["DATABASE_URL"]           # fail fast if missing
debug = os.getenv("DEBUG", "false") == "true"  # optional with default</div>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>Secrets and per-environment settings (dev vs prod DB) go in env vars, not code — the same image runs everywhere (12-factor app rule).</p>
  </div>

  <h2 id="sl-proc"><span class="num">06</span>Processes &amp; Background Jobs</h2>
  <div class="fx" data-lang="text">$ nohup python3 train.py &gt; train.log 2&gt;&amp;1 &amp;     # survive logout, run in background
PID=22038
$ jobs -l
[1]+ 22038 Running                 nohup python3 train.py &gt; train.log 2&gt;&amp;1 &amp;
$ ps -o pid,stat,%cpu,%mem,etime,cmd -p 22038
  PID STAT %CPU %MEM     ELAPSED CMD
22038 S     1.0  0.0       00:01 python3 train.py
$ tail -n 2 train.log
step 3
step 4
$ kill 22038; wait 22038; echo "exit code: $?"
exit code: 143                                 # 128 + 15 (SIGTERM)</div>
  <table class="tbl">
    <tr><th>Tool</th><th>Use</th></tr>
    <tr><td><code>ps aux</code> / <code>pgrep -f name</code></td><td>List / find processes</td></tr>
    <tr><td><code>top</code>, <code>htop</code>, <code>nvidia-smi</code></td><td>Live CPU, RAM, GPU usage</td></tr>
    <tr><td><code>kill PID</code> (SIGTERM 15)</td><td>Ask politely: process can save and exit</td></tr>
    <tr><td><code>kill -9 PID</code> (SIGKILL)</td><td>Force; no cleanup — last resort</td></tr>
    <tr><td><code>Ctrl+C</code> / <code>Ctrl+Z</code>, <code>bg</code>, <code>fg</code></td><td>Interrupt / pause, resume in back/front</td></tr>
    <tr><td><code>nohup</code>, <code>tmux</code>, <code>screen</code></td><td>Keep jobs alive after SSH drops</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>SIGTERM is "please close the shop"; SIGKILL is cutting the power. A training script killed with -9 never writes its last checkpoint.</p>
  </div>

  <h2 id="sl-bash"><span class="num">07</span>Bash Scripting Basics</h2>
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
  <div class="cards">
    <div><b>set -e</b><p>Exit on the first failing command.</p></div>
    <div><b>set -u</b><p>Using an unset variable is an error, not "".</p></div>
    <div><b>set -o pipefail</b><p>A pipe fails if any stage fails, not just the last.</p></div>
    <div><b>Exit codes</b><p><code>0</code> = success, anything else = failure; read with <code>$?</code>.</p></div>
  </div>
  <div class="fx" data-lang="text">$ bash -c 'false | true; echo "without pipefail: $?"'
without pipefail: 0
$ bash -c 'set -o pipefail; false | true; echo "with pipefail: $?"'
with pipefail: 1
$ grep -q Pune sales.csv &amp;&amp; echo "found Pune" || echo "no Pune"
found Pune</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>No spaces around <code>=</code>: <code>X = 5</code> runs a command called X. Always quote <code>"$var"</code> so file names with spaces don't split.</p>
  </div>

  <h2 id="sl-ssh"><span class="num">08</span>SSH, scp &amp; cron</h2>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="sl-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="200" height="70" rx="8" class="fb sb"/><text x="110" y="45" text-anchor="middle">Your laptop</text><text x="110" y="68" text-anchor="middle" class="tm">~/.ssh/id_ed25519 (private)</text>
    <rect x="390" y="20" width="200" height="70" rx="8" class="fg sg"/><text x="490" y="45" text-anchor="middle">GPU server</text><text x="490" y="68" text-anchor="middle" class="tm">authorized_keys (public)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="212" y1="45" x2="386" y2="45" marker-end="url(#sl-arr2)"/><line x1="388" y1="70" x2="214" y2="70" marker-end="url(#sl-arr2)"/></g>
    <text x="300" y="38" text-anchor="middle" class="tm">2. signed challenge</text><text x="300" y="86" text-anchor="middle" class="tm">1. random challenge</text>
    <text x="300" y="112" text-anchor="middle" class="tr">the private key never leaves your laptop</text>
  </svg><figcaption>Key-based login: the server holds your public key (the lock), you hold the private key.</figcaption></figure>
  <div class="fx" data-lang="text">ssh-keygen -t ed25519 -C "asha@laptop"        # creates id_ed25519 + id_ed25519.pub
ssh-copy-id asha@10.0.0.5                       # appends .pub to server's authorized_keys
ssh asha@10.0.0.5                               # log in, no password
ssh -L 8888:localhost:8888 asha@10.0.0.5        # tunnel: remote Jupyter on your localhost:8888
scp model.pkl asha@10.0.0.5:/srv/models/        # copy up
scp -r asha@10.0.0.5:~/runs/exp42 ./            # copy folder down
rsync -avz data/ asha@10.0.0.5:~/data/          # sync only changed files</div>
  <p>Not run here (no SSH tools or remote host in this sandbox). Private key must be <code>chmod 600</code> or SSH refuses it.</p>
  <figure class="viz"><svg viewBox="0 0 600 100" width="600">
    <rect x="20" y="15" width="90" height="34" rx="5" class="fb sb"/><text x="65" y="37" text-anchor="middle">30</text>
    <rect x="125" y="15" width="90" height="34" rx="5" class="fb sb"/><text x="170" y="37" text-anchor="middle">2</text>
    <rect x="230" y="15" width="90" height="34" rx="5" class="ft st"/><text x="275" y="37" text-anchor="middle">*</text>
    <rect x="335" y="15" width="90" height="34" rx="5" class="ft st"/><text x="380" y="37" text-anchor="middle">*</text>
    <rect x="440" y="15" width="90" height="34" rx="5" class="fg sg"/><text x="485" y="37" text-anchor="middle">1-5</text>
    <text x="65" y="70" text-anchor="middle" class="tm">minute</text><text x="170" y="70" text-anchor="middle" class="tm">hour</text><text x="275" y="70" text-anchor="middle" class="tm">day of month</text><text x="380" y="70" text-anchor="middle" class="tm">month</text><text x="485" y="70" text-anchor="middle" class="tm">weekday (0=Sun)</text>
    <text x="300" y="94" text-anchor="middle">= 02:30 every Monday to Friday</text>
  </svg><figcaption>Five time fields, then the command. Edit with crontab -e; list with crontab -l.</figcaption></figure>
  <table class="tbl">
    <tr><th>Schedule</th><th>Meaning</th></tr>
    <tr><td><code>*/15 * * * *</code></td><td>Every 15 minutes</td></tr>
    <tr><td><code>0 * * * *</code></td><td>Top of every hour</td></tr>
    <tr><td><code>0 3 * * *</code></td><td>Daily at 03:00 (nightly retrain)</td></tr>
    <tr><td><code>0 9 * * 1</code></td><td>Mondays 09:00 (weekly report)</td></tr>
    <tr><td><code>0 0 1 * *</code></td><td>Midnight on the 1st of each month</td></tr>
  </table>
  <div class="fx" data-lang="text">0 3 * * * cd /srv/ml &amp;&amp; /srv/ml/.venv/bin/python retrain.py &gt;&gt; /var/log/retrain.log 2&gt;&amp;1</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>cron runs with a tiny PATH, no <code>.bashrc</code> and server time zone (often UTC). Use absolute paths, set env vars explicitly, and redirect output to a log — otherwise failures vanish silently.</p>
  </div>

  <h2 id="sl-res"><span class="num">09</span>Disk &amp; Memory Checks</h2>
  <div class="fx" data-lang="text">$ df -h /                       # free space per mounted disk
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        252G   30G  9.3G  77% /
$ du -sh data src                # size of folders
12K	data
8.0K	src
$ du -h --max-depth=1 . | sort -h | tail -3     # biggest subfolders
8.0K	./src
12K	./data
56K	.
$ free -h                        # RAM
               total        used        free      shared  buff/cache   available
Mem:            15Gi       1.6Gi       2.9Gi       154Mi        11Gi        14Gi
Swap:             0B          0B          0B
$ nproc
4</div>
  <ul>
    <li><strong>df</strong> = disk free (whole filesystem). <strong>du</strong> = disk used (by these files).</li>
    <li>In <code>free</code>, read <strong>available</strong>, not "free": Linux uses spare RAM as file cache and gives it back on demand.</li>
  </ul>
  <div class="callout intu"><span class="label">Debug pattern</span>
    <p>Job died with no traceback? Check <code>dmesg | grep -i oom</code> (killed by the out-of-memory killer), <code>df -h</code> (disk full from checkpoints/logs), then <code>free -h</code>.</p>
  </div>

  <h2 id="sl-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li>One tree from <code>/</code>; <code>~</code> = home; absolute vs relative paths.</li>
    <li><code>grep</code> searches text, <code>find</code> searches files, <code>head/tail/less</code> peek safely.</li>
    <li>Pipes pass stdout → stdin; <code>sort | uniq -c | sort -rn</code> = group-by count.</li>
    <li><code>&gt;</code> overwrite, <code>&gt;&gt;</code> append, <code>2&gt;&amp;1</code> merge stderr.</li>
    <li><code>rwx</code> = 4/2/1 for owner/group/others; 755 scripts, 600 secrets.</li>
    <li><code>export</code> makes a variable visible to children; PATH decides which program runs.</li>
    <li><code>kill</code> = SIGTERM (graceful), <code>kill -9</code> = SIGKILL; <code>nohup</code>/<code>tmux</code> survive logout.</li>
    <li>Scripts: <code>set -euo pipefail</code>, quote variables, exit 0 = success.</li>
    <li>SSH keys: public on server, private stays home; cron = min hour dom month dow.</li>
  </ol></div>

  <h2 id="sl-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Find the 3 most frequent IPs in an access log where IP is the first field.</summary><div class="qa-body"><code>awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -3</code>. Sort first because <code>uniq</code> only collapses adjacent lines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>chmod 640 file</code> mean?</summary><div class="qa-body">Owner 6 = read+write, group 4 = read, others 0 = nothing. Shown as <code>-rw-r-----</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your training job dies when your SSH connection drops. Fix it.</summary><div class="qa-body">Run it inside <code>tmux</code>/<code>screen</code> and detach, or <code>nohup python train.py &gt; train.log 2&gt;&amp;1 &amp;</code>. For production, use a scheduler or a service (systemd, Airflow, a job queue).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>kill vs kill -9?</summary><div class="qa-body"><code>kill</code> sends SIGTERM: the process can catch it, save state and exit. <code>kill -9</code> sends SIGKILL: the kernel stops it instantly, no cleanup, possible corrupt files. Try TERM first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>set -euo pipefail</code> do and why use it?</summary><div class="qa-body"><code>-e</code> stop on error, <code>-u</code> error on unset variables, <code>pipefail</code> make a pipeline fail if any part fails. Without it, a script can fail halfway, keep going, and report success to CI or cron.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>bash -c 'false | true; echo $?'</code></summary><div class="qa-body"><code>0</code>. A pipeline's status is the last command's (<code>true</code>). With <code>set -o pipefail</code> it would print <code>1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"python: command not found" but Python is installed. Why?</summary><div class="qa-body">Its folder isn't in <code>PATH</code> (or the binary is named <code>python3</code>). Check <code>which python3</code>, <code>echo $PATH</code>; add the folder via <code>export PATH=...:$PATH</code> in <code>~/.bashrc</code>, or activate the virtualenv.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a cron line to run <code>report.py</code> at 08:00 every weekday.</summary><div class="qa-body"><code>0 8 * * 1-5 /srv/.venv/bin/python /srv/report.py &gt;&gt; /var/log/report.log 2&gt;&amp;1</code>. Absolute paths, because cron's PATH is minimal; remember the server's time zone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The disk is full on a training server. How do you find the culprit?</summary><div class="qa-body"><code>df -h</code> to see which filesystem; then <code>du -h --max-depth=1 / 2&gt;/dev/null | sort -h | tail</code> and drill down. Usual suspects: checkpoints, logs, Docker images (<code>docker system df</code>), pip/HF caches.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does SSH key authentication work?</summary><div class="qa-body">You generate a key pair. The public key goes into the server's <code>~/.ssh/authorized_keys</code>. On login, the server sends a challenge; your client signs it with the private key; the server verifies with the public key. The private key never travels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>free shows only 2.9 GB "free" of 15 GB. Is the server out of memory?</summary><div class="qa-body">No. Look at <strong>available</strong> (14 GB here). Most "used" memory is buff/cache, which the kernel frees instantly when a program needs it.</div></details>
</main>`
});
