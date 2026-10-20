// notes/softeng/se_docker.js — Docker
Object.assign(TOPIC_CONTENT, {
  "se_docker": `<main>
<h1>Docker</h1>
  <div class="where"><span>Software Engineering</span><span>Docker</span></div>
  <p class="lead">Docker packs a program, the exact Python version, every library and the operating-system files it needs into one sealed box called an image, and runs that box the same way on a laptop, in CI and on a cloud server. It is the standard way scripts, APIs and ML models are shipped, and Kubernetes and most MLOps tools are built on it. This note finishes the track's story: the chai stall's <code>sales_report.py</code> (tag <code>v1.0.0</code> from the Git note, run nightly on Linux in the Linux note) now has to save each day's totals into a Postgres database, and we containerise it, give it a small web board, and run it together with Postgres using Docker Compose. Every <code>docker</code> command below was really run (Docker Engine 29.8, Compose v5.6, as root in a sandbox; on your laptop you would be in the <code>docker</code> group) and its output pasted; the build folder is shown as <code>/home/meera/chai-docker</code>. Two honest limits of the sandbox: images could not be pulled from Docker Hub (rate limit), so only the locally present <code>python:3.12-slim</code>, <code>postgres:16-alpine</code> and <code>registry:2</code> were used; and builds had no direct internet, so the Python packages were downloaded once with <code>pip download</code> into a <code>wheels/</code> folder and installed from there (section 04 explains the one line this changes).</p>

  <h2 id="sd-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<defs><marker id="sd-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="220" y="8" width="220" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="30" text-anchor="middle" font-size="12">Software Engineering track</text>
<line x1="330" y1="42" x2="115" y2="70" stroke="currentColor" stroke-opacity="0.45"/><line x1="330" y1="42" x2="330" y2="70" stroke="currentColor" stroke-opacity="0.45"/><line x1="330" y1="42" x2="545" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="20" y="72" width="190" height="52" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="115" y="93" text-anchor="middle" font-size="12">1 · Git &amp; GitHub</text><text x="115" y="111" text-anchor="middle" class="tm" font-size="10">script versioned, tag v1.0.0</text>
<rect x="235" y="72" width="190" height="52" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="93" text-anchor="middle" font-size="12">2 · Linux &amp; Terminal</text><text x="330" y="111" text-anchor="middle" class="tm" font-size="10">cron, logs, env vars, signals</text>
<rect x="450" y="72" width="190" height="52" rx="7" class="fg sg" stroke-width="2.5"/><text x="545" y="93" text-anchor="middle" font-size="12" font-weight="700">3 · Docker</text><text x="545" y="111" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · ship it + Postgres</text>
<line x1="210" y1="98" x2="233" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sd-a0)"/><line x1="425" y1="98" x2="448" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sd-a0)"/>
<text x="330" y="152" text-anchor="middle" class="tm" font-size="10.5">image chai-report:1.0 = python:3.12-slim + psycopg 3.3.6 + sales_report.py, board.py, save_report.py</text>
<text x="330" y="172" text-anchor="middle" class="tm" font-size="10.5">compose.yaml: db (Postgres + volume) · report (saves ₹230 into daily_sales) · board (port 8080)</text>
</svg><figcaption>The last step of the track: the same script, now packed with its whole environment and run next to its database.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="se_linux">Linux &amp; Terminal</a></b><span>The report runs every night by cron on one server. That note gave us everything a container is made of: processes and PIDs, signals and exit codes (137, 143), environment variables, ports, file ownership. Left open: the next feature (save totals into Postgres) needs a library and a database server that the server does not have, and setting up every new machine by hand is exactly the "works on my machine" problem. <a class="xref" data-note="py_modules">Virtual environments</a> isolate Python packages, but not Python itself, system libraries or a database.</span></li>
    <li><b>This note adds: packaging the whole environment</b><span>What a container is, images vs containers, Dockerfiles and the layer cache, build and run, ports and volumes, environment and config, Docker Compose with Postgres, registries and tags, multi-stage builds, and the production traps (<code>:latest</code>, secrets in images, running as root).</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="mlops_deploy">CI/CD, serving and Kubernetes</a> (which schedule exactly these images), <a class="xref" data-note="api_production">production backends</a> (gunicorn/uvicorn in containers, health checks) and <a class="xref" data-note="sql_relational">PostgreSQL</a> itself.</span></li>
  </ol>

  <h2 id="sd-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next. Running example: the chai report and its new job, saving Monday's ₹230 (6 valid orders, 3 rejected) into a <code>daily_sales</code> table.</p>
  <ol class="story">
    <li><b>Works on my machine</b><span>Q: why does the new version fail on the server? → Different Python, missing <code>psycopg</code>, no Postgres running, no <code>DATABASE_URL</code>. We need to ship the environment, not just the code. But what exactly would we ship?</span></li>
    <li><b>What a container is</b><span>Q: is it a small virtual machine? → No: an ordinary Linux process with its own view of files, PIDs, hostname and network (namespaces) and resource limits (cgroups), sharing the host kernel. Starts in under a second. Where do its files come from?</span></li>
    <li><b>Image vs container</b><span>Q: what is the box, and what is the running thing? → Image = read-only template (class); container = a running instance with a thin writable layer (object). A file written in a container vanished with it. How is an image made?</span></li>
    <li><b>Dockerfile, layer by layer</b><span>Q: how do we describe the image? → One instruction per line, each a cached layer; change one and it and every later layer rebuild. Copy requirements first, code last: a code edit rebuilt in 0.4 s instead of re-installing packages. How do we use the image?</span></li>
    <li><b>Build &amp; run</b><span>Q: how do we start it, override its command, stop it cleanly? → <code>docker build</code>, <code>docker run</code>, <code>logs</code>, <code>exec</code>, <code>stop</code>; exec-form commands stop in under a second, shell form waited 10 s and died with 137. But the box is sealed: how does the outside world reach in?</span></li>
    <li><b>Ports &amp; volumes</b><span>Q: how do we reach a server inside, and keep data? → <code>-p 8080:8000</code> opens a door (and the app must listen on 0.0.0.0); <code>-v</code> mounts host folders (read-only data) and named volumes (data that outlives containers). How do we configure the same image differently?</span></li>
    <li><b>Env &amp; config</b><span>Q: how does one image get dev vs prod settings and secrets? → <code>-e</code>, <code>--env-file</code> at run time; <code>save_report.py</code> without <code>DATABASE_URL</code> stops with KeyError. Now we need a database container too, connected and started in order…</span></li>
    <li><b>Docker Compose: app + db</b><span>Q: how do several containers run together? → One <code>compose.yaml</code>: services find each other by name (<code>db:5432</code>, never <code>localhost</code>), healthchecks order start-up, a volume keeps the table across <code>down</code>/<code>up</code>. How does the server get our image?</span></li>
    <li><b>Registries &amp; tags</b><span>Q: how do images travel? → Tag, push to a registry, pull elsewhere; tags are movable labels, digests are exact content. <code>:latest</code> pointed at two different images within a minute. Images are also bigger than they need to be…</span></li>
    <li><b>Multi-stage builds &amp; small images</b><span>Q: how do we ship only what runs? → Build in one stage, copy the result into a clean final stage (no wheel files, non-root user); a file deleted in a later layer still costs 100 MB. What else bites in production?</span></li>
    <li><b>Production traps</b><span>Q: what goes wrong after it works? → <code>:latest</code> drift, secrets baked into layers (readable with <code>docker history</code>), containers running as root (files on the host owned by root), memory limits (exit 137).</span></li>
  </ol>

  <h2 id="sd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Docker</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why &amp; what</div>
        <ul>
          <li><b>Problem</b> — Python 3.13 vs 3.12, no psycopg, no Postgres, no env var</li>
          <li><b>Container</b> = process + namespaces (own PIDs, files, hostname, network) + cgroups (limits)</li>
          <li><b>Not a VM</b> — same kernel (<code>uname -r</code> identical), starts in &lt; 1 s</li>
          <li><b>vs venv</b> — venv isolates Python packages only</li>
          <li>💡 shipping container: every crane handles the same box</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Image vs container</div>
        <ul>
          <li><b>Image</b> — read-only layers + config (class); <code>docker images</code>, <code>rmi</code></li>
          <li><b>Container</b> — instance + writable layer (object); <code>docker ps -a</code>, <code>rm</code></li>
          <li><code>docker diff</code> shows a container's changes</li>
          <li>⚠ container writes vanish with the container</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dockerfile &amp; cache</div>
        <ul>
          <li><code>FROM</code>, <code>WORKDIR</code>, <code>COPY</code>, <code>RUN</code>, <code>ENV</code>, <code>USER</code>, <code>EXPOSE</code>, <code>CMD</code></li>
          <li>Each instruction = layer; a change rebuilds it + all after it</li>
          <li>Order: FROM → requirements → RUN pip → code last</li>
          <li><code>.dockerignore</code>: .git, .venv, data/, .env</li>
          <li><code>docker history</code>: size per layer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Build &amp; run</div>
        <ul>
          <li><code>docker build -t chai-report:1.0 .</code></li>
          <li><code>docker run --rm IMG [cmd]</code>; <code>-d</code>, <code>--name</code>; exit codes pass through</li>
          <li><code>logs</code>, <code>exec</code>, <code>top</code>, <code>ps</code>, <code>stop</code> (TERM, KILL after 10 s), <code>rm</code></li>
          <li>Exec form <code>["python","board.py"]</code> → app is PID 1; shell form → <code>sh</code> is PID 1 → 137</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ports &amp; volumes</div>
        <ul>
          <li><code>-p 8080:8000</code> = host:container</li>
          <li>⚠ app must bind <code>0.0.0.0</code>, not 127.0.0.1 → "connection reset"</li>
          <li>Bind mount <code>-v "$PWD/data":/data:ro</code> · named volume <code>-v chai-out:/out</code></li>
          <li>💡 container = hotel room cleaned at checkout; volume = locker in the lobby</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Env &amp; config</div>
        <ul>
          <li><code>-e KEY=val</code>, <code>--env-file chai.env</code>, Compose <code>environment:</code></li>
          <li>Same image, different settings per environment</li>
          <li>Required: <code>os.environ["DATABASE_URL"]</code> → KeyError if missing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Compose</div>
        <ul>
          <li><code>services</code>: db, report, board; <code>volumes: pgdata</code></li>
          <li>Service name = DNS name: <code>db:5432</code></li>
          <li><code>healthcheck</code> + <code>depends_on: service_healthy</code></li>
          <li><code>up -d</code>, <code>ps -a</code>, <code>logs</code>, <code>exec</code>, <code>run --rm</code>, <code>down</code> (keeps volumes), <code>down -v</code> (deletes)</li>
          <li>⚠ <code>localhost</code> inside a container = itself</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Registries</div>
        <ul>
          <li>tag → push → pull; <code>host/name:tag</code></li>
          <li>Tag = movable label; digest <code>sha256:…</code> = exact content</li>
          <li>Docker Hub, ghcr.io, ECR, Artifact Registry</li>
          <li>⚠ <code>:latest</code> = default tag, moves</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Small &amp; safe</div>
        <ul>
          <li>Multi-stage: <code>FROM … AS builder</code> → <code>COPY --from=builder</code></li>
          <li>Slim base; <code>--no-cache-dir</code>; create + delete in one RUN</li>
          <li><code>USER app</code>; no secrets in ENV/COPY; pin versions</li>
          <li><code>-m 100m</code> → OOM → 137</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sd-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Works on My Machine</span><span class="rm-sub">The problem</span></div></div>
      <div class="rm-item rm-done" data-target="sd-what"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">What a Container Is</span><span class="rm-sub">Process + isolation, not a VM</span></div></div>
      <div class="rm-item rm-done" data-target="sd-img"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Image vs Container</span><span class="rm-sub">Class vs object</span></div></div>
      <div class="rm-item rm-done" data-target="sd-file"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Dockerfile Layer by Layer</span><span class="rm-sub">The cache, traced</span></div></div>
      <div class="rm-item rm-done" data-target="sd-run"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Build &amp; Run</span><span class="rm-sub">Commands, PID 1, stop</span></div></div>
      <div class="rm-item rm-done" data-target="sd-ports"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Ports &amp; Volumes</span><span class="rm-sub">Doors and lockers</span></div></div>
      <div class="rm-item rm-done" data-target="sd-env"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Env &amp; Config</span><span class="rm-sub">One image, many settings</span></div></div>
      <div class="rm-item rm-done" data-target="sd-compose"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Compose: App + Postgres</span><span class="rm-sub">Networking by name</span></div></div>
      <div class="rm-item rm-done" data-target="sd-reg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Registries &amp; Tags</span><span class="rm-sub">push, pull, digests</span></div></div>
      <div class="rm-item rm-done" data-target="sd-small"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Multi-Stage &amp; Small Images</span><span class="rm-sub">Ship only what runs</span></div></div>
      <div class="rm-item rm-done" data-target="sd-best"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Production Traps</span><span class="rm-sub">latest, secrets, root</span></div></div>
      <div class="rm-item rm-done" data-target="sd-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="sd-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The usual "why doesn't it work"</span></div></div>
      <div class="rm-item rm-done" data-target="sd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sd-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sd-why"><span class="num">01</span>The Problem: "It Works on My Machine"</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The owner wants every day's totals kept in a database, so she can compare weeks. Meera writes <code>save_report.py</code>, which reads a sheet and writes one row into a Postgres table. It works on her laptop. Why will it fail on the stall's server, and on the next server, and on Ravi's laptop?</p>
  </div>
  <p>The new script (it repeats the report's counting so it stays independent of the tagged <code>sales_report.py</code>):</p>
  <div class="fx" data-lang="py">import csv, os, sys
import psycopg

day = sys.argv[1]                                  # e.g. 2026-10-19
sheet = f"/data/orders_{day}.csv"
total = orders = rejected = 0
with open(sheet, newline="") as f:
    for row in csv.DictReader(f):
        try:
            qty, price = int(row["qty"]), int(row["price"])
        except ValueError:
            rejected += 1
            continue
        if qty &lt;= 0:
            rejected += 1
            continue
        total += qty * price
        orders += 1

with psycopg.connect(os.environ["DATABASE_URL"]) as conn:
    conn.execute("""CREATE TABLE IF NOT EXISTS daily_sales (
        day date PRIMARY KEY, total int, orders int, rejected int)""")
    conn.execute("""INSERT INTO daily_sales VALUES (%s, %s, %s, %s)
        ON CONFLICT (day) DO UPDATE SET total = EXCLUDED.total,
        orders = EXCLUDED.orders, rejected = EXCLUDED.rejected""",
        (day, total, orders, rejected))
print(f"saved {day}: ₹{total} from {orders} valid orders, rejected: {rejected}")</div>
  <p>It needs four things from its surroundings: Python, the <code>psycopg</code> library (Postgres driver), a running Postgres server, and a <code>DATABASE_URL</code> environment variable. Here is the server from the Linux note checked for all four:</p>
  <div class="fx" data-lang="text">$ python3 --version
Python 3.13.16
$ python3 -c "import psycopg"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    import psycopg
ModuleNotFoundError: No module named 'psycopg'
$ pg_isready -h localhost
localhost:5432 - no response
$ echo "DATABASE_URL=\${DATABASE_URL:-&lt;not set&gt;}"
DATABASE_URL=&lt;not set&gt;</div>
  <table class="tbl">
    <tr><th></th><th>Meera's laptop</th><th>Server (checked above)</th></tr>
    <tr><td>Python</td><td>3.12</td><td>3.13.16</td></tr>
    <tr><td>psycopg</td><td>installed in her venv</td><td>ModuleNotFoundError</td></tr>
    <tr><td>Postgres server</td><td>running locally</td><td>no response on 5432</td></tr>
    <tr><td>DATABASE_URL</td><td>in her <code>.bashrc</code></td><td>not set</td></tr>
  </table>
  <p>Each row is fixable by hand, and each new machine needs the same fixes again, slightly differently every time. Docker's idea: do not ship just the code. Ship the code <em>plus its whole environment</em> (OS files, the exact Python, every library, default settings) as one sealed box, and run the database as another box. The server only needs Docker.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shipping container. Before containers, every port loaded sacks, barrels and crates differently, and things broke. Now every crane, ship and truck handles the same steel box and does not care what is inside. The report is the cargo; Docker is the standard box.</p>
  </div>
  <div class="flow"><span>Dockerfile (recipe)</span><span>docker build</span><span>Image (sealed box)</span><span>docker run anywhere</span><span>Container (running)</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>"Works on my machine"</strong>: a program depends on things outside its code (interpreter version, libraries, system packages, services, environment variables) that differ between machines. <strong>Containerisation</strong>: packaging the program with those dependencies into an image that runs identically wherever a container runtime exists.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"A virtualenv solves this." It isolates Python <em>packages</em>, but still uses the machine's Python interpreter and system libraries, and it cannot start a Postgres server. Docker pins all of it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: What a Container Is.</b> "Ship the environment" sounds like shipping a whole computer. Is a container a small virtual machine?</div>

  <h2 id="sd-what"><span class="num">02</span>What a Container Is: a Process, Not a VM</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If a container contains "a whole operating system", why does it start in under a second and weigh megabytes? What is actually running when a container runs?</p>
  </div>
  <p>A <strong>virtual machine</strong> emulates a whole computer and boots its own kernel: gigabytes, minutes to start. A <strong>container</strong> is an ordinary Linux process (the Linux note's section 07) that the host kernel <em>fences off</em>: it gets its own view of the filesystem, process list, hostname and network (Linux <strong>namespaces</strong>) and limits on CPU and memory (<strong>cgroups</strong>). It shares the host's kernel. Proof, step by step:</p>
  <div class="fx" data-lang="text">$ grep PRETTY /etc/os-release; uname -r
PRETTY_NAME="Ubuntu 24.04.5 LTS"
6.18.44-fc-v139
$ docker run --rm python:3.12-slim sh -c 'grep PRETTY /etc/os-release; uname -r; python --version'
PRETTY_NAME="Debian GNU/Linux 13 (trixie)"
6.18.44-fc-v139
Python 3.12.15
$ docker run -d --name sleeper python:3.12-slim sleep 300
792b852b5ec00187b4d255f226b9782226a82509a341e9e5e72ddbc8d6131091
$ docker exec sleeper sh -c 'ls /proc | grep -E "^[0-9]+$"; cat /proc/1/cmdline | tr "\\0" " "; echo'
1
13
14
7
sleep 300 
$ docker top sleeper -o pid,args
PID                 COMMAND
12117               sleep 300
$ docker exec sleeper hostname
792b852b5ec0
$ hostname
vm
$ readlink /proc/$(docker inspect -f '{{.State.Pid}}' sleeper)/ns/pid /proc/self/ns/pid
pid:[4026532267]
pid:[4026531836]
$ docker rm -f sleeper
sleeper
$ time docker run --rm python:3.12-slim true
took 0.299s
$ docker run --rm -m 100m python:3.12-slim cat /sys/fs/cgroup/memory/memory.limit_in_bytes
104857600</div>
  <p>Read it. Inside, the OS files say Debian and Python is 3.12; the host is Ubuntu with Python 3.13. But <code>uname -r</code> (the kernel) is identical: the container borrowed the host's kernel. The container <code>sleeper</code> sees only a handful of PIDs, and PID 1 is <code>sleep 300</code>; <code>docker top</code> shows that same process on the host with an ordinary large PID: one process, two views. Its hostname is its container ID, not <code>vm</code>. The two <code>readlink</code> lines show different PID-namespace numbers for the container's process and for our shell. A full container start-to-finish took well under a second. Finally <code>-m 100m</code> became a cgroup memory limit of 104857600 bytes (100 × 1024 × 1024), the limit the Linux note's OOM demo hit.</p>
  <div class="cards">
    <div><b>Virtual machine</b><p>Full guest OS + own kernel. GBs, boots in minutes. Strong isolation.</p></div>
    <div><b>Container</b><p>Isolated process sharing the host kernel. MBs, starts in under a second.</p></div>
    <div><b>virtualenv</b><p>Isolates Python packages only, not Python or system libraries.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Flats in one building versus separate houses. Each flat (container) has its own door, rooms and name plate, but all share the building's foundation, water and electricity (the kernel). A separate house (VM) has its own foundation: more private, much more expensive to build.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Container</strong>: a process (tree) isolated with namespaces (pid, mnt, net, uts, ipc, user) and limited by cgroups, started from an image's filesystem. On Mac/Windows, Docker Desktop runs a small Linux VM underneath, because containers need a Linux kernel.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Docker makes my app secure." Not by itself: containers share the kernel, so isolation is weaker than a VM, and a container running as root with extra privileges can harm the host (section 11).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Image vs Container.</b> The container's Debian files came from <code>python:3.12-slim</code>. What is that thing, and what happens to files a container writes?</div>

  <h2 id="sd-img"><span class="num">03</span>Image vs Container</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>docker rm</code> vs <code>docker rmi</code>, <code>docker ps</code> vs <code>docker images</code>: the commands make no sense until the two words are separated. What is the template, what is the running copy, and where do a container's writes go?</p>
  </div>
  <p>The <strong>image</strong> is the sealed, read-only box: a stack of filesystem layers plus settings (default command, env, user). A <strong>container</strong> is one running (or stopped) instance made from it, with a thin <strong>writable layer</strong> of its own on top. Many containers can start from one image; none of them changes it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe printed in a book vs the dishes you cook. The page (image) never changes. Each dish (container) is made from it; adding salt to one dish touches neither the book nor the other dishes. Throw a dish away and cook again: it comes out exactly like the recipe. In OOP words, image = class, container = object.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="sd-arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="45" width="170" height="70" rx="8" class="fb sb"/><text x="95" y="73" text-anchor="middle">chai-report:1.0</text><text x="95" y="95" text-anchor="middle" class="tm">read-only layers</text>
    <rect x="330" y="10" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="35" text-anchor="middle">report (runs once, exits)</text>
    <rect x="330" y="60" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="85" text-anchor="middle">board :8080 (runs all day)</text>
    <rect x="330" y="110" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="135" text-anchor="middle">a one-off test</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="182" y1="70" x2="326" y2="30" marker-end="url(#sd-arr1)"/><line x1="182" y1="80" x2="326" y2="80" marker-end="url(#sd-arr1)"/><line x1="182" y1="90" x2="326" y2="130" marker-end="url(#sd-arr1)"/></g>
    <text x="255" y="155" text-anchor="middle" class="tm">docker run</text>
  </svg><figcaption>One image, many containers (exactly what Compose does in section 08). Each container adds its own writable layer.</figcaption></figure>
  <p>Worked example: container <code>tmp1</code> writes a report file; we ask Docker what it changed; we delete it; a brand-new container looks for the file.</p>
  <div class="fx" data-lang="text">$ docker images python
IMAGE              ID             DISK USAGE   CONTENT SIZE   EXTRA
python:3.12-slim   a6e34c598f24        179MB         45.4MB        
$ docker run --name tmp1 python:3.12-slim sh -c 'echo "Total sales: ₹230" &gt; /tmp/report.txt; cat /tmp/report.txt'
Total sales: ₹230
$ docker ps -a --filter name=tmp1 --format '{{.Names}}  {{.Image}}  {{.Status}}'
tmp1  python:3.12-slim  Exited (0) Less than a second ago
$ docker diff tmp1
C /tmp
A /tmp/report.txt
$ docker rm tmp1
tmp1
$ docker run --rm python:3.12-slim cat /tmp/report.txt
cat: /tmp/report.txt: No such file or directory</div>
  <p><code>docker images</code> lists images (here the 179 MB base). <code>docker ps -a</code> lists containers, including stopped ones. <code>docker diff</code> lists the writable layer's changes: <code>A</code> added, <code>C</code> changed folder. After <code>docker rm</code> that layer is gone, so the next container starts from the clean image and the file does not exist. That is a feature: every start is identical. Data you want to keep goes into a volume (section 06).</p>
  <table class="tbl">
    <tr><th></th><th>Image</th><th>Container</th></tr>
    <tr><td>Is</td><td>Read-only template (layers + config)</td><td>Running or stopped instance + writable layer</td></tr>
    <tr><td>OOP analogy</td><td>Class</td><td>Object</td></tr>
    <tr><td>Made by</td><td><code>docker build</code> / <code>docker pull</code></td><td><code>docker run</code></td></tr>
    <tr><td>List</td><td><code>docker images</code></td><td><code>docker ps -a</code></td></tr>
    <tr><td>Delete</td><td><code>docker rmi</code></td><td><code>docker rm</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Image</strong>: ordered stack of read-only layers plus metadata, identified by a sha256 ID. <strong>Container</strong>: image + writable layer + running process with its own namespaces.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"I fixed it inside the container with <code>docker exec</code> and <code>pip install</code>." That fix lives in one container's writable layer and vanishes on the next deploy. Put every change in the Dockerfile and rebuild.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Dockerfile, Layer by Layer.</b> <code>python:3.12-slim</code> has Python but not psycopg or our scripts. How do we make our own image, and why are some rebuilds instant and others slow?</div>

  <h2 id="sd-file"><span class="num">04</span>Dockerfile, Layer by Layer</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We need an image = Python 3.12 + psycopg + our three scripts + the sample sheet, rebuilt every time the code changes. How do we write that recipe, and how do we keep rebuilds fast?</p>
  </div>
  <p>A <strong>Dockerfile</strong> is a plain-text recipe, one instruction per line, run top to bottom. The build folder holds the scripts, the pinned requirements, a <code>.dockerignore</code> and the downloaded wheels:</p>
  <div class="fx" data-lang="text">$ cat Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY wheels/ /wheels/
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
COPY sales_report.py board.py save_report.py sample_orders.csv ./
CMD ["python", "sales_report.py", "sample_orders.csv"]
$ cat requirements.txt
psycopg[binary]==3.3.6
typing-extensions==4.16.0
$ cat .dockerignore
.git
.venv
__pycache__/
data/
out/
.env
*.log</div>
  <table class="tbl">
    <tr><th>Instruction</th><th>Meaning</th></tr>
    <tr><td><code>FROM python:3.12-slim</code></td><td>Start from the official Debian + Python 3.12 image (slim = without compilers and docs)</td></tr>
    <tr><td><code>WORKDIR /app</code></td><td><code>cd /app</code> for all later steps and for the container (created if missing)</td></tr>
    <tr><td><code>COPY src dst</code></td><td>Copy files from the <strong>build context</strong> (this folder minus .dockerignore) into the image</td></tr>
    <tr><td><code>RUN …</code></td><td>Run a shell command at build time; its file changes become a layer</td></tr>
    <tr><td><code>CMD [...]</code></td><td>Default command when a container starts (overridable)</td></tr>
    <tr><td><code>ENV</code>, <code>USER</code>, <code>EXPOSE</code></td><td>Default env vars, the user to run as, documentation of the listening port (sections 07, 10, 11)</td></tr>
  </table>
  <p>About the wheels: with internet access the RUN line would simply be <code>RUN pip install --no-cache-dir -r requirements.txt</code>. This sandbox's builds had no internet, so <code>pip download</code> fetched the exact wheels into <code>wheels/</code> beforehand and <code>--no-index --find-links=/wheels</code> tells pip to install only from that folder (a normal technique for offline builds). Note <code>typing-extensions</code> is pinned too: the first build attempt failed because psycopg needs it on Python 3.12, a small lesson in pinning <em>all</em> dependencies.</p>
  <p>Now the idea that decides build speed: <strong>layers and the cache</strong>. Each instruction produces a layer, and Docker remembers it keyed by the instruction and its inputs (for COPY, the files' contents). On the next build, an unchanged step is reused (<code>CACHED</code>). The first changed step and <em>every step after it</em> are rebuilt.</p>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <rect x="20" y="180" width="300" height="30" rx="4" class="fs"/><text x="170" y="200" text-anchor="middle">1 FROM python:3.12-slim</text>
    <rect x="20" y="145" width="300" height="30" rx="4" class="fs"/><text x="170" y="165" text-anchor="middle">2 WORKDIR /app</text>
    <rect x="20" y="110" width="300" height="30" rx="4" class="fb sb"/><text x="170" y="130" text-anchor="middle">3-4 COPY wheels/, requirements.txt</text>
    <rect x="20" y="75" width="300" height="30" rx="4" class="fb sb"/><text x="170" y="95" text-anchor="middle">5 RUN pip install (slow, 32 MB)</text>
    <rect x="20" y="40" width="300" height="30" rx="4" class="fr sr"/><text x="170" y="60" text-anchor="middle">6 COPY *.py sample (changes often)</text>
    <text x="345" y="60" class="tr">edit code → rebuild only this</text><text x="345" y="95" class="tg">CACHED ✓</text><text x="345" y="130" class="tg">CACHED ✓</text><text x="345" y="165" class="tg">CACHED ✓</text><text x="345" y="200" class="tg">CACHED ✓</text>
    <text x="170" y="25" text-anchor="middle" class="tm">CMD (metadata, no files)</text>
  </svg><figcaption>Each instruction is a layer; a changed layer invalidates everything above it, so rarely-changing steps go first.</figcaption></figure>
  <p>Traced for real. First build (every step runs; the repeated FROM progress lines are trimmed to "..."):</p>
  <div class="fx" data-lang="text">$ time docker build --progress=plain -t chai-report:1.0 . 2&gt;&amp;1 | grep -E '^#[0-9]+ (\\[|DONE|CACHED|naming)'
#1 [internal] load build definition from Dockerfile
#1 DONE 0.0s
#2 [internal] load metadata for docker.io/library/python:3.12-slim
#2 DONE 0.0s
#3 [internal] load .dockerignore
#3 DONE 0.0s
#4 [internal] load build context
#4 DONE 0.1s
#5 [1/6] FROM docker.io/library/python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1
#5 DONE 1.4s
...
#6 [2/6] WORKDIR /app
#6 DONE 0.2s
#7 [3/6] COPY wheels/ /wheels/
#7 DONE 0.0s
#8 [4/6] COPY requirements.txt .
#8 DONE 0.0s
#9 [5/6] RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
#9 DONE 2.1s
#10 [6/6] COPY sales_report.py board.py save_report.py sample_orders.csv ./
#10 DONE 0.0s
#11 naming to docker.io/library/chai-report:1.0 done
#11 DONE 1.6s
took 6.308s</div>
  <p>Second build with nothing changed, then a one-line edit to <code>sales_report.py</code>:</p>
  <div class="fx" data-lang="text">$ time docker build --progress=plain -t chai-report:1.0 . 2&gt;&amp;1 | grep -E '^#[0-9]+ (\\[|DONE|CACHED)'
#1 [internal] load build definition from Dockerfile
#1 DONE 0.0s
#2 [internal] load metadata for docker.io/library/python:3.12-slim
#2 DONE 0.0s
#3 [internal] load .dockerignore
#3 DONE 0.0s
#4 [internal] load build context
#4 DONE 0.0s
#5 [1/6] FROM docker.io/library/python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1
#5 DONE 0.0s
#6 [2/6] WORKDIR /app
#6 CACHED
#7 [4/6] COPY requirements.txt .
#7 CACHED
#8 [3/6] COPY wheels/ /wheels/
#8 CACHED
#9 [5/6] RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
#9 CACHED
#10 [6/6] COPY sales_report.py board.py save_report.py sample_orders.csv ./
#10 CACHED
#11 DONE 0.1s
took 0.293s
$ echo "# shown on the stall's phone" &gt;&gt; sales_report.py
$ time docker build --progress=plain -t chai-report:1.0 . 2&gt;&amp;1 | grep -E '^#[0-9]+ (\\[|DONE|CACHED)'
#1 [internal] load build definition from Dockerfile
#1 DONE 0.0s
#1 [internal] load build definition from Dockerfile
#1 DONE 0.0s
#2 [internal] load metadata for docker.io/library/python:3.12-slim
#2 DONE 0.0s
#3 [internal] load .dockerignore
#3 DONE 0.0s
#4 [internal] load build context
#4 DONE 0.0s
#5 [1/6] FROM docker.io/library/python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1
#5 DONE 0.0s
#6 [2/6] WORKDIR /app
#6 CACHED
#7 [3/6] COPY wheels/ /wheels/
#7 CACHED
#8 [4/6] COPY requirements.txt .
#8 CACHED
#9 [5/6] RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
#9 CACHED
#10 [6/6] COPY sales_report.py board.py save_report.py sample_orders.csv ./
#10 DONE 0.1s
#11 DONE 0.1s
took 0.365s</div>
  <p>Unchanged: every step <code>CACHED</code>, a fraction of a second. After the edit, steps 2–5 are still <code>CACHED</code> and only step 6 (<code>COPY sales_report.py …</code>) ran, because its input changed and it is the last step. Now the same edit with a "bad" Dockerfile that copies the whole folder first:</p>
  <div class="fx" data-lang="text">$ cat Dockerfile.bad
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir --no-index --find-links=/app/wheels -r requirements.txt
CMD ["python", "sales_report.py", "sample_orders.csv"]
$ echo "# shown on the stall's phone" &gt;&gt; sales_report.py
$ time docker build --progress=plain -f Dockerfile.bad -t chai-bad . 2&gt;&amp;1 | grep -E '^#[0-9]+ (\\[|DONE|CACHED)'
#1 [internal] load build definition from Dockerfile.bad
#1 DONE 0.0s
#2 [internal] load metadata for docker.io/library/python:3.12-slim
#2 DONE 0.0s
#3 [internal] load .dockerignore
#3 DONE 0.0s
#4 [1/4] FROM docker.io/library/python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1
#4 DONE 0.0s
#5 [internal] load build context
#5 DONE 0.0s
#6 [2/4] WORKDIR /app
#6 CACHED
#7 [3/4] COPY . .
#7 DONE 0.3s
#8 [4/4] RUN pip install --no-cache-dir --no-index --find-links=/app/wheels -r requirements.txt
#8 DONE 2.8s
#9 DONE 1.9s
took 5.336s
$ docker history chai-report:1.0 --format 'table {{.Size}}\\t{{.CreatedBy}}' | head -n 7
SIZE      CREATED BY
0B        CMD ["python" "sales_report.py" "sample_orde…
24.6kB    COPY sales_report.py board.py save_report.py…
32.2MB    RUN /bin/sh -c pip install --no-cache-dir --…
12.3kB    COPY requirements.txt . # buildkit
5.51MB    COPY wheels/ /wheels/ # buildkit
8.19kB    WORKDIR /app</div>
  <p>With <code>COPY . .</code> before <code>pip install</code>, any code edit changes that layer, so pip install ran again (<code>DONE</code>, not <code>CACHED</code>). Here it costs a few seconds because psycopg comes from local wheels; with numpy, pandas or torch it is minutes on every edit. <code>docker history</code> shows the cost of each layer of the good image: 32.2 MB for the installed packages, 5.51 MB for the wheel files (section 10 removes those), 24.6 kB for our code.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A stack of rotis: to change the top one you replace only the top. To change the bottom one, every roti above must come off and go back on. Keep the slow, rarely-changing items (packages) at the bottom and the often-edited code on top.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Layer</strong>: the filesystem change made by one instruction, stored once and shared between images. <strong>Build cache</strong>: reuse of a layer when its instruction and inputs are unchanged; invalidation cascades to later steps. <strong>.dockerignore</strong>: paths never sent to the build (keeps <code>.env</code>, <code>.git</code>, <code>data/</code> out and the context small).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>COPY . .</code> before installing packages makes every code edit reinstall everything. Copy the requirements file alone, install, then copy code. Avoid Alpine bases for data science: its C library (musl) lacks ready wheels for numpy/pandas/torch, so builds compile for ages or fail; use <code>-slim</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Build &amp; Run.</b> We have an image <code>chai-report:1.0</code>. How do we run it, pick which script it runs, look inside, and stop it without losing work?</div>

  <h2 id="sd-run"><span class="num">05</span>Build &amp; Run</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The image holds three programs: the report, the web board and the database saver. How do we run each one, read its output and exit code, look inside a running container, and stop a long-running one cleanly?</p>
  </div>
  <p><code>docker run IMAGE</code> starts a container with the image's <code>CMD</code>; <code>docker run IMAGE command…</code> replaces it. <code>--rm</code> deletes the container when it exits, <code>-d</code> runs it in the background, <code>--name</code> names it. For the long-running case we use the web board, a 20-line standard-library server that shows the report over HTTP:</p>
  <div class="fx" data-lang="py">import os, signal, subprocess, sys
from http.server import BaseHTTPRequestHandler, HTTPServer

SHEET = os.getenv("SHEET", "sample_orders.csv")
HOST = os.getenv("HOST", "0.0.0.0")

class Board(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            body = "ok\\n"
        else:
            run = subprocess.run([sys.executable, "sales_report.py", SHEET],
                                 capture_output=True, text=True)
            body = run.stdout
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(body.encode())

signal.signal(signal.SIGTERM, lambda *args: sys.exit(0))   # stop cleanly on docker stop
print(f"board on http://{HOST}:8000 showing {SHEET}", flush=True)
HTTPServer((HOST, 8000), Board).serve_forever()</div>
  <div class="fx" data-lang="text">$ docker run --rm chai-report:1.0
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25
$ docker run --rm chai-report:1.0 python sales_report.py; echo "exit code: $?"
usage: python3 sales_report.py ORDERS.csv
exit code: 2
$ docker run --rm chai-report:1.0 python -c "import sys, psycopg; print(sys.version.split()[0], psycopg.__version__)"
3.12.15 3.3.6
$ docker run -d --name ef chai-report:1.0 python board.py
70f8c148543a8bc7fc881b6978e566e39b37a8fe97700575c34a0209ba197af0
$ docker run -d --name sf chai-report:1.0 sh -c "python board.py"
be84fddcb180137ff97d05791db33a7418f0395eb357debe4f6f1b5172b6e5fb
$ sleep 1
$ docker top ef -o pid,args
PID                 COMMAND
13455               python board.py
$ docker top sf -o pid,args
PID                 COMMAND
13518               sh -c python board.py
13532               python board.py
$ time docker stop ef
ef
took 0.614s
$ time docker stop sf
sf
took 12.602s
$ docker ps -a --filter name=ef --filter name=sf --format 'table {{.Names}}\\t{{.Status}}'
NAMES     STATUS
sf        Exited (137) 2 seconds ago
ef        Exited (0) 12 seconds ago
$ docker rm ef sf
ef
sf</div>
  <p>The default <code>CMD</code> ran the report on the baked-in sample: ₹230, identical to the Git and Linux notes, now with Python 3.12.15 and psycopg 3.3.6 wherever this image runs. Running the script without a file printed the usage line and the <strong>exit code 2 passed straight through</strong> Docker to our shell (Linux note, section 07). Then the PID-1 experiment: the same board started two ways. In <code>ef</code> (exec form, <code>python board.py</code>) Python itself is the container's main process. In <code>sf</code> (shell form, <code>sh -c "python board.py"</code>, which is what <code>CMD python board.py</code> without brackets produces) <code>sh</code> is the main process and Python its child. <code>docker stop</code> sends SIGTERM to the main process, waits 10 seconds, then SIGKILL. <code>ef</code>: Python received SIGTERM, our handler exited cleanly, under a second, exit 0. <code>sf</code>: <code>sh</code> did not pass SIGTERM on, Docker waited the full 10 seconds, then killed everything: exit <strong>137</strong> (128 + 9), no clean shutdown.</p>
  <table class="tbl">
    <tr><th>Command</th><th>Meaning</th></tr>
    <tr><td><code>docker build -t name:tag .</code></td><td>Build from the Dockerfile in <code>.</code></td></tr>
    <tr><td><code>docker run --rm IMG [cmd]</code></td><td>Run once, delete afterwards; optional command replaces CMD</td></tr>
    <tr><td><code>docker run -d --name N IMG</code></td><td>Run in the background with a name</td></tr>
    <tr><td><code>docker ps [-a]</code>, <code>docker logs [-f] N</code></td><td>List containers; show (follow) stdout/stderr</td></tr>
    <tr><td><code>docker exec [-it] N cmd</code></td><td>Run a command inside a running container (<code>-it sh</code> for a shell)</td></tr>
    <tr><td><code>docker top N</code></td><td>The container's processes as the host sees them</td></tr>
    <tr><td><code>docker stop N</code> / <code>rm</code> / <code>rmi</code></td><td>SIGTERM then SIGKILL after 10 s / delete container / delete image</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop with a manager at the door (PID 1). Docker tells the manager "closing time". If the manager is the shopkeeper himself (exec form), he closes the till and leaves. If the manager is a doorman who does not pass messages on (shell form), the shopkeeper never hears it, and after ten minutes security cuts the power.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Exec form</strong> <code>CMD ["python", "board.py"]</code>: run the program directly as PID 1. <strong>Shell form</strong> <code>CMD python board.py</code>: run it through <code>/bin/sh -c</code>. <strong>ENTRYPOINT</strong> fixes the executable; <strong>CMD</strong> supplies default arguments that <code>docker run img …</code> overrides. A process that is PID 1 must handle SIGTERM itself (our <code>signal.signal</code> line) or use <code>docker run --init</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shell-form <code>CMD</code> makes every deploy wait 10 seconds and end in SIGKILL (137), dropping in-flight requests. Use the exec form, and make the app exit cleanly on SIGTERM.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Ports &amp; Volumes.</b> The board runs, but on its own private network: the owner's phone cannot reach it. And the board only shows the baked-in sample, not the real daily sheets on the server. How do the outside world and outside files get in?</div>

  <h2 id="sd-ports"><span class="num">06</span>Ports &amp; Volumes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A container is sealed: its own network and its own files. How does a browser reach the board inside, how does the report read the real sheets that live on the server, and where does output go so it survives the container?</p>
  </div>
  <h3>Ports: a door from the host to the container</h3>
  <p>The board listens on port 8000 <em>inside</em> the container's network. <code>-p 8080:8000</code> (host:container) asks Docker to forward the host's port 8080 to it.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="sd-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="130" height="50" rx="8" class="fs"/><text x="75" y="60" text-anchor="middle">phone / curl</text>
    <rect x="200" y="15" width="390" height="85" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="215" y="33" class="tm">host machine</text>
    <rect x="215" y="45" width="110" height="40" rx="6" class="fb sb"/><text x="270" y="70" text-anchor="middle">port 8080</text>
    <rect x="400" y="40" width="175" height="50" rx="8" class="fg sg"/><text x="487" y="62" text-anchor="middle">container</text><text x="487" y="80" text-anchor="middle" class="tm">board.py :8000</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="142" y1="65" x2="211" y2="65" marker-end="url(#sd-arr2)"/><line x1="327" y1="65" x2="396" y2="65" marker-end="url(#sd-arr2)"/></g>
    <text x="362" y="115" text-anchor="middle" class="tb">-p 8080:8000  (host:container)</text>
  </svg><figcaption>-p opens a door from a host port to a container port.</figcaption></figure>
  <div class="fx" data-lang="text">$ docker run -d --name board -p 8080:8000 chai-report:1.0 python board.py
aa574fca22c765711fd8356bfc6777e26d0c84203d05cb407a9822909d2bd960
$ sleep 1
$ curl -s localhost:8080/health
ok
$ curl -s localhost:8080/
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25
$ docker ps --format 'table {{.Names}}\\t{{.Image}}\\t{{.Ports}}\\t{{.Status}}'
NAMES     IMAGE             PORTS                    STATUS
board     chai-report:1.0   0.0.0.0:8080-&gt;8000/tcp   Up 1 second
$ docker logs board
board on http://0.0.0.0:8000 showing sample_orders.csv
172.17.0.1 - - [19/Oct/2026 23:58:35] "GET /health HTTP/1.1" 200 -
172.17.0.1 - - [19/Oct/2026 23:58:35] "GET / HTTP/1.1" 200 -
$ docker exec board whoami
root
$ docker rm -f board
board
$ docker run -d --name board-local -p 8081:8000 -e HOST=127.0.0.1 chai-report:1.0 python board.py
6e1291219933e68374f61bb21de9d5113d76736ab1e1b72240c39bc2e594261d
$ sleep 1
$ docker logs board-local
board on http://127.0.0.1:8000 showing sample_orders.csv
$ curl -sS localhost:8081/health
curl: (56) Recv failure: Connection reset by peer
$ docker rm -f board-local
board-local</div>
  <p><code>curl localhost:8080</code> on the host reached the board inside: <code>/health</code> says ok, <code>/</code> shows the report. <code>docker ps</code> shows the rule <code>0.0.0.0:8080-&gt;8000/tcp</code>, and <code>docker logs</code> shows the board's start line and both requests, coming from <code>172.17.0.1</code> (the Docker bridge, i.e. the host). <code>whoami</code> says root (section 11). Then the classic trap: the same board told to listen on <code>127.0.0.1</code>. Inside a container, 127.0.0.1 means "only from inside this container", so forwarded traffic is refused: <code>curl: (56) Recv failure: Connection reset by peer</code>. Servers in containers must listen on <code>0.0.0.0</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An office with a reception desk. The board sits in cabin 8000; visitors cannot walk in. They dial reception extension 8080, which forwards to cabin 8000. If the cabin only answers calls from inside the room (127.0.0.1), reception's forwarded call is refused.</p>
  </div>
  <h3>Volumes: files that come in from outside or outlive the container</h3>
  <p>Section 03 showed that a container's own files die with it. Two ways to attach storage: a <strong>bind mount</strong> makes a host folder appear inside (<code>-v "$PWD/data":/data:ro</code>; <code>:ro</code> = read-only), a <strong>named volume</strong> is storage Docker manages that survives containers (<code>-v chai-out:/out</code>).</p>
  <div class="fx" data-lang="text">$ ls data
orders_2026-10-18.csv
orders_2026-10-19.csv
$ docker run --rm chai-report:1.0 ls /app
board.py
requirements.txt
sales_report.py
sample_orders.csv
save_report.py
$ docker run --rm -v "$PWD/data":/data:ro chai-report:1.0 python sales_report.py /data/orders_2026-10-18.csv 2&gt;/dev/null | head -n 1
Total sales: ₹655 from 18 valid orders, rejected: 1
$ docker run --rm -v "$PWD/data":/data:ro chai-report:1.0 sh -c 'echo hack &gt;&gt; /data/orders_2026-10-18.csv'
sh: 1: cannot create /data/orders_2026-10-18.csv: Read-only file system
$ docker volume create chai-out
chai-out
$ docker run --rm -v "$PWD/data":/data:ro -v chai-out:/out chai-report:1.0 sh -c 'python sales_report.py /data/orders_2026-10-19.csv &gt; /out/report_2026-10-19.txt 2&gt;&amp;1'
$ docker run --rm -v chai-out:/out python:3.12-slim head -n 4 /out/report_2026-10-19.txt
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
Total sales: ₹230 from 6 valid orders, rejected: 3
$ docker volume inspect chai-out --format '{{.Mountpoint}}'
/var/lib/docker/volumes/chai-out/_data
$ docker volume rm chai-out
chai-out</div>
  <p>The image contains only <code>/app</code>'s scripts and the sample; <code>.dockerignore</code> kept <code>data/</code> out. With the server's <code>data</code> folder bind-mounted, the same image reported Sunday the 18th (₹655, as in the Linux note's week). Because we mounted it <code>:ro</code>, a write attempt failed with "Read-only file system": the container cannot damage the sheets. A named volume <code>chai-out</code> received the report from one container; a different, brand-new container read it back; Docker keeps it under <code>/var/lib/docker/volumes</code> until we remove it.</p>
  <div class="cards">
    <div><b>Bind mount</b><p><code>-v /host/path:/path[:ro]</code>. A host folder inside; changes visible both ways.</p><small>Input data, live code in development</small></div>
    <div><b>Named volume</b><p><code>-v name:/path</code>. Managed by Docker; survives <code>docker rm</code>.</p><small>Databases, outputs</small></div>
    <div><b>tmpfs</b><p><code>--tmpfs /scratch</code>. In RAM, gone on stop.</p><small>Fast scratch space</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Port publishing</strong> (<code>-p host:container</code>): forward a host port into a container. <code>EXPOSE</code> in a Dockerfile only documents a port; it publishes nothing. <strong>Volume / bind mount</strong>: storage mounted into the container that bypasses its writable layer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A bind mount hides whatever the image had at that path: mount a folder over <code>/app</code> and the baked-in scripts "disappear". And files a root container writes into a bind mount are owned by root on the host (section 11).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Env &amp; Config.</b> The saver also needs a database address and password, and those differ between Meera's laptop and the server. How does one image get different settings without rebuilding?</div>

  <h2 id="sd-env"><span class="num">07</span>Env &amp; Config</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The same image must talk to a test database on the laptop and the real one on the server, and the password must not live in the image (anyone who pulls it could read it). Where do settings come from?</p>
  </div>
  <p>Exactly the Linux note's environment variables, passed in when the container starts: <code>-e KEY=value</code> per variable, or <code>--env-file file</code> for many. The code reads them with <code>os.environ</code> / <code>os.getenv</code>.</p>
  <div class="fx" data-lang="text">$ docker run --rm chai-report:1.0 python -c 'import os; print(os.getenv("DATABASE_URL"))'
None
$ docker run --rm -e DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall chai-report:1.0 python -c 'import os; print(os.getenv("DATABASE_URL"))'
postgresql://chai:chai-secret@db:5432/stall
$ cat chai.env
DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall
CURRENCY=INR
$ docker run --rm --env-file chai.env chai-report:1.0 sh -c 'env | grep -E "^(DATABASE_URL|CURRENCY)=" | sort'
CURRENCY=INR
DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall
$ docker run --rm -v "$PWD/data":/data:ro chai-report:1.0 python save_report.py 2026-10-19 2&gt;&amp;1 | tail -n 1
KeyError: 'DATABASE_URL'</div>
  <p>Without <code>-e</code>, Python saw <code>None</code>; with it, the URL. <code>--env-file chai.env</code> loaded both lines of the file. And <code>save_report.py</code> without <code>DATABASE_URL</code> stopped immediately with <code>KeyError: 'DATABASE_URL'</code>: the "crash early" pattern from the Linux note, now inside a container. The image is identical in all four runs; only the run-time settings differ.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hired cook (the image) arrives with her skills and knives. Each household tells her at the door where the gas cylinder is and which spices to use (env vars). Nobody tattoos one house's address onto her arm.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Runtime configuration</strong>: settings supplied when a container starts (<code>-e</code>, <code>--env-file</code>, Compose <code>environment:</code>, orchestrator secrets) rather than built into the image. <code>ENV</code> in a Dockerfile sets <em>defaults</em> baked into the image (fine for <code>PYTHONUNBUFFERED=1</code>, never for passwords).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>--env-file</code> files are secrets: keep them out of Git (<code>.gitignore</code>) and out of the build (<code>.dockerignore</code> lists <code>.env</code>). Our <code>chai.env</code> is <em>not</em> in <code>.dockerignore</code>, and section 11 shows what that allows.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Compose: App + Postgres.</b> We can configure the saver, but it still has no database to talk to. How do we run Postgres as a second container and connect them reliably?</div>

  <h2 id="sd-compose"><span class="num">08</span>Docker Compose: App + Postgres</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The saver needs a Postgres container. How do two containers find each other (IP addresses change on every restart), why does <code>localhost</code> not work, how do we make the saver wait until Postgres is ready, and how do we keep the table when containers are recreated? And who types all those long <code>docker run</code> lines?</p>
  </div>
  <h3>First by hand: a network where names work</h3>
  <p>On a <strong>user-defined network</strong>, Docker runs a small DNS service: every container can reach every other by its <strong>name</strong>. We create a network, start Postgres named <code>db</code> on it, and run the saver three ways:</p>
  <div class="fx" data-lang="text">$ docker network create chainet
df4b2a66b18cd6cb5212d6c498484f0be74e1b1c35b6a66b8d9d29e851e46b93
$ docker run -d --name db --network chainet -e POSTGRES_USER=chai -e POSTGRES_PASSWORD=chai-secret -e POSTGRES_DB=stall postgres:16-alpine
273c772b70382f85c87263a8ee6d9c952012dd20a1fffbf247ef7325ca5576b9
$ docker run --rm --network chainet -v "$PWD/data":/data:ro -e DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall chai-report:1.0 python save_report.py 2026-10-19
saved 2026-10-19: ₹230 from 6 valid orders, rejected: 3
$ docker run --rm -v "$PWD/data":/data:ro -e DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall chai-report:1.0 python save_report.py 2026-10-19 2&gt;&amp;1 | tail -n 1
psycopg.OperationalError: failed to resolve host 'db': [Errno -2] Name or service not known
$ docker run --rm --network chainet -v "$PWD/data":/data:ro -e DATABASE_URL=postgresql://chai:chai-secret@localhost:5432/stall chai-report:1.0 python save_report.py 2026-10-19 2&gt;&amp;1 | tail -n 1
	Is the server running on that host and accepting TCP/IP connections?
$ docker network inspect chainet --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{end}}'
db 172.18.0.2/16
$ docker rm -f db
db
$ docker network rm chainet
chainet</div>
  <p>On the same network, <code>@db:5432</code> worked: <strong>saved 2026-10-19: ₹230 from 6 valid orders, rejected: 3</strong>. From the default network the name <code>db</code> could not even be resolved ("Name or service not known"). With <code>localhost</code> the connection was refused: inside a container, <code>localhost</code> is that container itself, where no Postgres runs. Docker assigned <code>db</code> an IP (172.18.0.2), which we never had to type.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An office intercom: inside the office you dial "Accounts" by name and it rings the right desk even if Accounts moved floors. People outside (another network) cannot use the intercom names at all. Dialling "myself" (localhost) only rings your own phone.</p>
  </div>
  <h3>Then with Compose: the whole stack in one file</h3>
  <p><strong>Docker Compose</strong> describes all containers, their settings, network and volumes in one YAML file and starts them with one command. Each key under <code>services</code> becomes a container <em>and</em> its DNS name. <code>\${DB_PASSWORD}</code> is filled from a <code>.env</code> file next to <code>compose.yaml</code> (kept out of Git and of the image).</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="sd-arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="5" y="20" width="90" height="44" rx="8" class="fs"/><text x="50" y="47" text-anchor="middle">phone</text>
    <rect x="130" y="8" width="460" height="140" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="145" y="26" class="tm">network: chai_default</text>
    <rect x="160" y="30" width="140" height="40" rx="8" class="fb sb"/><text x="230" y="55" text-anchor="middle">board :8000</text>
    <rect x="160" y="95" width="140" height="40" rx="8" class="fb sb"/><text x="230" y="120" text-anchor="middle">report (one-shot)</text>
    <rect x="420" y="60" width="150" height="44" rx="8" class="fg sg"/><text x="495" y="80" text-anchor="middle">db (Postgres)</text><text x="495" y="96" text-anchor="middle" class="tm">volume pgdata</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="97" y1="42" x2="156" y2="48" marker-end="url(#sd-arr3)"/><line x1="302" y1="112" x2="416" y2="90" marker-end="url(#sd-arr3)"/></g>
    <text x="112" y="80" text-anchor="middle" class="tm">:8080</text><text x="360" y="118" text-anchor="middle" class="tm">db:5432</text>
  </svg><figcaption>Three services, one network created by Compose, one named volume for the database files.</figcaption></figure>
  <div class="fx" data-lang="text">$ cat compose.yaml
name: chai

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: chai
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: stall
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chai -d stall"]
      interval: 2s
      retries: 10

  report:
    build: .
    image: chai-report:1.0
    command: ["python", "save_report.py", "2026-10-19"]
    environment:
      DATABASE_URL: postgresql://chai:\${DB_PASSWORD}@db:5432/stall
    volumes:
      - ./data:/data:ro
    depends_on:
      db:
        condition: service_healthy

  board:
    image: chai-report:1.0
    command: ["python", "board.py"]
    environment:
      SHEET: /data/orders_2026-10-19.csv
    volumes:
      - ./data:/data:ro
    ports:
      - "8080:8000"

volumes:
  pgdata:
$ cat .env
DB_PASSWORD=chai-secret
$ docker compose up -d 2&gt;&amp;1 | grep -vE 'Pulling|Pulled|Building|Built|transferring|^ *$' | tail -n 8
 Container chai-board-1 Starting 
 Container chai-db-1 Starting 
 Container chai-board-1 Started 
 Container chai-db-1 Started 
 Container chai-db-1 Waiting 
 Container chai-db-1 Healthy 
 Container chai-report-1 Starting 
 Container chai-report-1 Started 
$ docker compose ps -a --format 'table {{.Service}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}'
SERVICE   IMAGE                STATUS                     PORTS
board     chai-report:1.0      Up 7 seconds               0.0.0.0:8080-&gt;8000/tcp
db        postgres:16-alpine   Up 6 seconds (healthy)     5432/tcp
report    chai-report:1.0      Exited (0) 3 seconds ago   
$ docker compose logs report
report-1  | saved 2026-10-19: ₹230 from 6 valid orders, rejected: 3
$ curl -s localhost:8080/ | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ docker compose exec db psql -U chai -d stall -c "SELECT * FROM daily_sales;"
    day     | total | orders | rejected 
------------+-------+--------+----------
 2026-10-19 |   230 |      6 |        3
(1 row)

$ docker compose run --rm report python save_report.py 2026-10-18 2&gt;&amp;1 | tail -n 1
saved 2026-10-18: ₹655 from 18 valid orders, rejected: 1
$ docker compose exec db psql -U chai -d stall -c "SELECT * FROM daily_sales ORDER BY day;"
    day     | total | orders | rejected 
------------+-------+--------+----------
 2026-10-18 |   655 |     18 |        1
 2026-10-19 |   230 |      6 |        3
(2 rows)

$ docker compose down 2&gt;&amp;1 | tail -n 3
 Container chai-db-1 Removed 
 Network chai_default Removing 
 Network chai_default Removed 
$ docker volume ls --filter name=chai
DRIVER    VOLUME NAME
local     chai_pgdata
$ docker compose up -d db 2&gt;&amp;1 | tail -n 1
 Container chai-db-1 Started 
$ docker compose exec db psql -U chai -d stall -c "SELECT count(*) FROM daily_sales;"
 count 
-------
     2
(1 row)

$ docker compose down -v 2&gt;&amp;1 | tail -n 2
 Volume chai_pgdata Removed 
 Network chai_default Removed 
$ docker volume ls --filter name=chai
DRIVER    VOLUME NAME</div>
  <p>Walk through it. <code>up -d</code> created the network <code>chai_default</code> and volume <code>chai_pgdata</code>, started <code>db</code>, <strong>waited</strong> until its healthcheck (<code>pg_isready</code> every 2 s) reported Healthy, and only then started <code>report</code> (<code>depends_on: condition: service_healthy</code>). <code>board</code> has no dependency and started at once. <code>ps -a</code> shows the stack: board up with its port, db healthy, report <code>Exited (0)</code> because it is a one-shot job; its log has the saved line. The board on 8080 shows ₹230 from the bind-mounted real sheet. In <code>psql</code> the row is there; <code>compose run --rm report python save_report.py 2026-10-18</code> ran a one-off second job with the same settings (₹655). <code>down</code> removed containers and network but <strong>kept the volume</strong>; after <code>up -d db</code> the table still held 2 rows. Only <code>down -v</code> deleted the volume and the data.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Compose file</strong>: <code>services</code> (containers: <code>image</code>/<code>build</code>, <code>command</code>, <code>environment</code>, <code>ports</code>, <code>volumes</code>, <code>depends_on</code>, <code>healthcheck</code>), top-level <code>volumes</code> and <code>networks</code>. <strong>Healthcheck</strong>: a command Docker runs periodically to mark a container healthy. Commands: <code>up -d</code>, <code>ps -a</code>, <code>logs</code>, <code>exec</code>, <code>run --rm</code>, <code>down</code>, <code>down -v</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Plain <code>depends_on: [db]</code> only orders <em>start-up</em>; it does not wait for Postgres to accept connections, and the saver would fail on a cold start. Use a healthcheck + <code>service_healthy</code>, and still retry connections in long-running apps. And <code>docker compose down -v</code> deletes the database: never type it on a server out of habit.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Registries &amp; Tags.</b> The stack runs where the image was built. The stall's server must get exactly this image, without rebuilding it. How do images travel?</div>

  <h2 id="sd-reg"><span class="num">09</span>Registries &amp; Tags</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We will not email a 230 MB image or rebuild it on every server (that could produce a different image). Where do images live between machines, and how do we name exactly which one a server should run?</p>
  </div>
  <p>A <strong>registry</strong> stores images, like GitHub stores code: CI or your laptop <strong>pushes</strong>, servers <strong>pull</strong>. Docker Hub is the default; companies use GitHub Container Registry (ghcr.io), AWS ECR or GCP Artifact Registry. An image's full name says where it lives: <code>registry-host/name:tag</code>. A <strong>tag</strong> is just a label pointing at an image; without a host Docker assumes Docker Hub, without a tag it assumes <code>latest</code>. We ran a private registry locally on port 5000 (the <code>registry:2</code> image), so the whole cycle is real:</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Books in a library. The image is the book; tags are labels on the spine, like "Edition 1.0" and "Newest arrival". The "Newest arrival" sticker moves to another book next month; "Edition 1.0" never changes. That is <code>:latest</code> versus <code>:1.0</code>.</p>
  </div>
  <div class="flow"><span>build</span><span>tag host/name:version</span><span>push</span><span>server pulls</span><span>run</span></div>
  <div class="fx" data-lang="text">$ docker run -d --name registry -p 5000:5000 registry:2
7bc9710523918104763a26a97f0b682f2c29bc7b0364a373275e5f00a9c0b825
$ docker tag chai-report:1.0 localhost:5000/chai-report:1.0
$ docker images --format 'table {{.Repository}}\\t{{.Tag}}\\t{{.ID}}' | grep -E 'REPOSITORY|chai-report'
REPOSITORY                   TAG         IMAGE ID
chai-report                  1.0         181419016e8b
localhost:5000/chai-report   1.0         181419016e8b
$ docker push localhost:5000/chai-report:1.0 2&gt;&amp;1 | tail -n 1
1.0: digest: sha256:181419016e8b219490bd6a275f28a334cc97992531020d67f8a21593b32c5a3d size: 856
$ curl -s localhost:5000/v2/chai-report/tags/list
{"name":"chai-report","tags":["1.0"]}
$ docker rmi localhost:5000/chai-report:1.0
Untagged: localhost:5000/chai-report:1.0
$ docker pull localhost:5000/chai-report:1.0 2&gt;&amp;1 | tail -n 2
Status: Downloaded newer image for localhost:5000/chai-report:1.0
localhost:5000/chai-report:1.0
$ docker tag chai-report:1.0 localhost:5000/chai-report:latest
$ docker push localhost:5000/chai-report:latest 2&gt;&amp;1 | tail -n 1
latest: digest: sha256:181419016e8b219490bd6a275f28a334cc97992531020d67f8a21593b32c5a3d size: 856
$ docker tag chai-report:1.1 localhost:5000/chai-report:latest
$ docker push localhost:5000/chai-report:latest 2&gt;&amp;1 | tail -n 1
latest: digest: sha256:d1956824cb14282f274afcebeb277286ee55ebf71678c9bea3a4e1c265483e19 size: 856
$ docker run --rm localhost:5000/chai-report:latest 2&gt;/dev/null | head -n 1
Sales today: ₹230 from 6 valid orders, rejected: 3
$ curl -s localhost:5000/v2/chai-report/tags/list
{"name":"chai-report","tags":["latest","1.0"]}
$ docker rm -f registry
registry</div>
  <p>Two names, one image ID: tagging copies nothing. <code>push</code> uploaded the layers and printed the <strong>digest</strong>, a sha256 of the exact content. <code>rmi</code> on a tag only removed the label ("Untagged"); <code>pull</code> brought it back by name. Then the <code>:latest</code> experiment: we pushed 1.0 as <code>latest</code> (same digest as 1.0), then a changed build (its summary line says "Sales today") under the same <code>latest</code>: a different digest, and anyone pulling <code>latest</code> now runs different code. The registry lists the tags <code>latest</code> and <code>1.0</code>; nothing records what <code>latest</code> used to be.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tag</strong>: mutable, human-friendly label (<code>1.0</code>, <code>latest</code>, a git SHA). <strong>Digest</strong>: immutable content address (<code>name@sha256:…</code>); pulling by digest always gives byte-identical content. <strong>Repository</strong>: all tags of one image name.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>:latest</code> is not "newest"; it is the default tag, and it moves whenever someone pushes it. Deploy immutable tags that match the Git tag (<code>chai-report:1.0.0</code>) or the commit SHA, or pin the digest.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Multi-Stage Builds &amp; Small Images.</b> Every server pulls all 230 MB, including 5.5 MB of wheel files that are useless after installation. How do we ship only what the program needs at run time?</div>

  <h2 id="sd-small"><span class="num">10</span>Multi-Stage Builds &amp; Small Images</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>docker history</code> showed the installer files (<code>/wheels</code>) shipped forever in the image. Real projects also carry compilers, caches and build tools that are needed to <em>build</em> but not to <em>run</em>. How do we keep them out, and why does deleting a file in a later step not help?</p>
  </div>
  <p>A <strong>multi-stage build</strong> has several <code>FROM</code>s. The first stage (the builder) installs everything into a virtual environment; the final stage starts again from a clean base and copies in only the finished venv and our code. Only the last stage becomes the image. We also create an unprivileged user and switch to it (section 11).</p>
  <div class="fx" data-lang="text">$ cat Dockerfile.multi
# ---- stage 1: build the virtual environment ----
FROM python:3.12-slim AS builder
COPY wheels/ /wheels/
COPY requirements.txt .
RUN python -m venv /opt/venv &amp;&amp; \\
    /opt/venv/bin/pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt

# ---- stage 2: the small runtime image ----
FROM python:3.12-slim
RUN useradd --create-home app
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY sales_report.py board.py save_report.py sample_orders.csv ./
ENV PATH="/opt/venv/bin:$PATH" PYTHONUNBUFFERED=1
USER app
CMD ["python", "sales_report.py", "sample_orders.csv"]
$ docker build -q -f Dockerfile.multi -t chai-report:multi .
sha256:c684b9dac4d5b0b6188f3cb6898bb2bde781a43e40db62644cd441296a54b58e
$ docker images --format 'table {{.Repository}}:{{.Tag}}\\t{{.Size}}' | grep -E 'REPOSITORY|chai-report:(1.0|multi)|python:3.12-slim'
REPOSITORY:TAG                      SIZE
chai-report:multi                   223MB
chai-report:1.0                     230MB
localhost:5000/chai-report:1.0      230MB
python:3.12-slim                    179MB
$ docker history chai-report:multi --format 'table {{.Size}}\\t{{.CreatedBy}}' | head -n 6
SIZE      CREATED BY
0B        CMD ["python" "sales_report.py" "sample_orde…
0B        USER app
0B        ENV PATH=/opt/venv/bin:/usr/local/bin:/usr/l…
24.6kB    COPY sales_report.py board.py save_report.py…
36.1MB    COPY /opt/venv /opt/venv # buildkit
$ docker run --rm chai-report:multi 2&gt;/dev/null | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ docker run --rm chai-report:multi whoami
app
$ docker run --rm chai-report:1.0 ls /wheels
psycopg-3.3.6-py3-none-any.whl
psycopg_binary-3.3.6-cp312-cp312-manylinux2014_x86_64.manylinux_2_17_x86_64.whl
typing_extensions-4.16.0-py3-none-any.whl
$ docker run --rm chai-report:multi ls /wheels
ls: cannot access '/wheels': No such file or directory</div>
  <p>The final image has no <code>/wheels</code> folder (ls: cannot access), runs as <code>app</code>, and still prints ₹230. Its history shows the copied venv (36.1 MB) and our code, nothing else from the builder. Size: 223 MB vs 230 MB. Honest reading: here the gain is small (the wheels) because <code>python:3.12-slim</code> (179 MB on disk) is most of it and nothing had to be compiled. When the builder needs gcc and headers to compile packages, or the base is the full <code>python:3.12</code> image (typically around 1 GB; it could not be pulled in this sandbox, so not measured here), multi-stage builds cut hundreds of MB.</p>
  <p>Why not just <code>RUN rm -rf /wheels</code> at the end? Layers are stacked: a later layer can only <em>hide</em> a file, the earlier layer still contains it. Measured with a 100 MB file:</p>
  <div class="fx" data-lang="text">$ cat Dockerfile.two
FROM python:3.12-slim
RUN head -c 100000000 /dev/urandom &gt; /tmp/big.bin
RUN rm /tmp/big.bin
$ cat Dockerfile.one
FROM python:3.12-slim
RUN head -c 100000000 /dev/urandom &gt; /tmp/big.bin &amp;&amp; rm /tmp/big.bin
$ docker build -q -f Dockerfile.two -t demo:two .
sha256:d1072cb61e427b06e3ae0810ee3d0d3f86199ed13182a7c984a347019ea142bb
$ docker build -q -f Dockerfile.one -t demo:one .
sha256:e883dbd36d3d7c0e0ae3296a6ae24e3cf9b29e6ee7c62fc96fae885a72000385
$ docker images demo --format 'table {{.Repository}}:{{.Tag}}\\t{{.Size}}'
REPOSITORY:TAG   SIZE
demo:one         177MB
demo:two         377MB
$ docker history demo:two --format '{{.Size}}\\t{{.CreatedBy}}' | head -n 2
8.19kB	RUN /bin/sh -c rm /tmp/big.bin # buildkit
100MB	RUN /bin/sh -c head -c 100000000 /dev/urando…</div>
  <p>Creating and deleting in two RUNs gave a 377 MB image, in one RUN 177 MB (this Docker reports disk usage; the hidden 100 MB layer is counted twice, packed and unpacked). <code>docker history</code> shows the 100 MB layer still shipping under an 8 kB "rm" layer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kitchen and a tiffin. You cook in a full kitchen (builder stage) with pots, peels and flour everywhere; you pack only the food into the tiffin (final stage). Throwing the peels into the tiffin and then covering them with a napkin (deleting in a later layer) still makes the tiffin heavy.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multi-stage build</strong>: <code>FROM base AS builder</code> … then <code>FROM base</code> + <code>COPY --from=builder /path /path</code>; only the last stage is shipped. <strong>Small image habits</strong>: slim base, <code>--no-cache-dir</code>, create and delete temporary files in the same <code>RUN</code>, <code>.dockerignore</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Copying a venv between stages only works if both stages use the same base (same Python path and C library); mixing a Debian builder with an Alpine final stage breaks compiled packages.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Production Traps.</b> The image is now small and non-root. What other habits make a working image dangerous or unreliable in production?</div>

  <h2 id="sd-best"><span class="num">11</span>Production Traps: latest, Secrets, Root</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Everything works. What goes wrong months later on a server: which image is actually running, who can read the database password, and what can a compromised container do to the host?</p>
  </div>
  <p><strong>1. <code>:latest</code> drift.</strong> Section 09 showed one tag pointing at two different images within a minute. Two servers pulling <code>latest</code> a day apart run different code, and there is no "previous latest" to roll back to. Deploy version tags or digests.</p>
  <p><strong>2. Secrets baked into images.</strong> A tempting shortcut is to put the URL in <code>ENV</code> or <code>COPY</code> the env file into the image. Anyone who can pull the image can read every layer:</p>
  <div class="fx" data-lang="text">$ cat Dockerfile.secret
FROM chai-report:1.0
ENV DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall
COPY chai.env /app/.env
$ docker build -q -f Dockerfile.secret -t chai-secret .
sha256:2a7201b479dce2617524336aca22bf7ef5788741efa6682f5eeb44c2c2e131c7
$ docker history chai-secret --format '{{.CreatedBy}}' | head -n 2
COPY chai.env /app/.env # buildkit
ENV DATABASE_URL=postgresql://chai:chai-secr…
$ docker run --rm chai-secret cat /app/.env
DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall
CURRENCY=INR
$ docker run --rm chai-secret printenv DATABASE_URL
postgresql://chai:chai-secret@db:5432/stall</div>
  <p><code>docker history</code> shows the ENV line with the password (truncated only by the display width), and any container can simply <code>cat</code> the copied file. <code>.dockerignore</code> protected <code>.env</code> but not <code>chai.env</code>: ignore patterns must cover every secret file. Pass secrets at run time (<code>-e</code>, <code>--env-file</code>, Compose/Kubernetes secrets, a secret manager), or use BuildKit build secrets if the build itself needs one.</p>
  <p><strong>3. Running as root.</strong> By default the process inside is root (uid 0). If the app is compromised, the attacker is root inside the container, and anything it writes to a bind mount belongs to root on the host:</p>
  <div class="fx" data-lang="text">$ docker run --rm chai-report:1.0 id
uid=0(root) gid=0(root) groups=0(root)
$ docker run --rm chai-report:multi id
uid=1000(app) gid=1000(app) groups=1000(app)
$ mkdir -p out
$ docker run --rm -v "$PWD/out":/out chai-report:1.0 sh -c 'python sales_report.py sample_orders.csv &gt; /out/report.txt 2&gt;&amp;1'
$ ls -ln out/report.txt
-rw-r--r-- 1 0 0 292 Oct 19 23:59 out/report.txt
$ docker run --rm -v "$PWD/out":/out chai-report:multi sh -c 'echo test &gt; /out/new.txt'
sh: 1: cannot create /out/new.txt: Permission denied</div>
  <p>The 1.0 image runs as uid 0 and its report file on the host is owned by uid 0 (<code>ls -ln</code> prints numbers: <code>0 0</code>), which an ordinary user like meera could not delete. The multi-stage image runs as uid 1000 (<code>app</code>) and could not even write into the root-owned folder ("Permission denied"): the Linux note's permissions, now protecting the host. Give the user only the folders it needs.</p>
  <p><strong>4. Memory limits and exit 137.</strong> With <code>-m</code>, a container that exceeds its limit is killed by the kernel's OOM killer: exit 137, <code>OOMKilled: true</code>, no traceback (shown for real in the Linux note's section 12). Set limits deliberately and watch for 137.</p>
  <table class="tbl">
    <tr><th>Practice</th><th>Why</th></tr>
    <tr><td>Pin the base and every package (<code>==</code>, lock file)</td><td>Same build next month (typing-extensions surprise in section 04)</td></tr>
    <tr><td>Version tags / digests, never deploy <code>:latest</code></td><td>Know what runs; roll back</td></tr>
    <tr><td>No secrets in ENV, COPY or layers</td><td>Every layer is readable by anyone with the image</td></tr>
    <tr><td><code>USER app</code></td><td>A break-in is not root; host files not owned by root</td></tr>
    <tr><td>Exec-form CMD + SIGTERM handling</td><td>Clean, fast stops (0 s, exit 0 vs 10 s, 137)</td></tr>
    <tr><td>One process per container, logs to stdout, healthcheck</td><td>Orchestrators can restart, scale and observe it</td></tr>
    <tr><td>Big models/data outside the image (volume, object storage)</td><td>Swap data without rebuilding a huge image</td></tr>
    <tr><td>GPU: <code>nvidia/cuda</code>/<code>pytorch</code> base matching the host driver, <code>--gpus all</code> (not run here)</td><td>CUDA mismatch is the most common GPU image failure</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reproducible image</strong>: same Dockerfile, pinned base and packages and code commit give an equivalent image. <strong>Attack surface</strong>: everything in the image an attacker could use; fewer tools, no root and no secrets make it smaller.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deleting a pushed secret by rebuilding is not enough: old image versions and caches still contain it. Rotate the password first, exactly as the Git note said for committed secrets.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Eleven ideas. How do they fit into the single command that starts the stack on the stall's server?</div>

  <h2 id="sd-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What happens, layer by layer, between typing <code>docker compose up -d</code> and the row "2026-10-19 | 230 | 6 | 3" appearing in Postgres?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 320" width="660">
<defs><marker id="sd-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="150" y="10" width="360" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="28" text-anchor="middle" font-size="11.5" font-weight="700">git tag v1.0.0 → Dockerfile (04) → build → chai-report:1.0</text><text x="330" y="43" text-anchor="middle" class="tm" font-size="10">cached layers; pinned psycopg; push/pull via a registry by version tag (09)</text>
<line x1="330" y1="50" x2="330" y2="68" stroke="currentColor" marker-end="url(#sd-a9)"/>
<rect x="150" y="70" width="360" height="40" rx="7" class="fb sb"/><text x="330" y="88" text-anchor="middle" font-size="11.5" font-weight="700">docker compose up -d (08)</text><text x="330" y="103" text-anchor="middle" class="tm" font-size="10">network chai_default · volume pgdata · .env fills \${DB_PASSWORD} (07)</text>
<line x1="230" y1="110" x2="110" y2="138" stroke="currentColor" marker-end="url(#sd-a9)"/><line x1="330" y1="110" x2="330" y2="138" stroke="currentColor" marker-end="url(#sd-a9)"/><line x1="430" y1="110" x2="550" y2="138" stroke="currentColor" marker-end="url(#sd-a9)"/>
<rect x="10" y="140" width="200" height="54" rx="7" class="fg sg"/><text x="110" y="160" text-anchor="middle" font-size="11">db: postgres:16-alpine</text><text x="110" y="175" text-anchor="middle" class="tm" font-size="10">process + namespaces (02)</text><text x="110" y="188" text-anchor="middle" class="tm" font-size="10">files in volume (06) · healthy</text>
<rect x="230" y="140" width="200" height="54" rx="7" class="fg sg"/><text x="330" y="160" text-anchor="middle" font-size="11">report: save_report.py</text><text x="330" y="175" text-anchor="middle" class="tm" font-size="10">waits for healthy · DATABASE_URL</text><text x="330" y="188" text-anchor="middle" class="tm" font-size="10">/data bind mount :ro (06)</text>
<rect x="450" y="140" width="200" height="54" rx="7" class="fg sg"/><text x="550" y="160" text-anchor="middle" font-size="11">board: board.py, PID 1</text><text x="550" y="175" text-anchor="middle" class="tm" font-size="10">0.0.0.0:8000 ← -p 8080 (06)</text><text x="550" y="188" text-anchor="middle" class="tm" font-size="10">exec form, SIGTERM handler (05)</text>
<line x1="230" y1="167" x2="212" y2="167" stroke="currentColor" marker-end="url(#sd-a9)"/><text x="221" y="215" text-anchor="middle" class="tm" font-size="10">db:5432 by name</text>
<rect x="150" y="240" width="360" height="56" rx="8" class="ft st"/><text x="330" y="260" text-anchor="middle" font-size="11.5" font-weight="700">daily_sales: 2026-10-19 | 230 | 6 | 3</text><text x="330" y="276" text-anchor="middle" class="tm" font-size="10">survives down/up (volume) · gone only with down -v</text><text x="330" y="290" text-anchor="middle" class="tm" font-size="10">image: slim, non-root, no secrets (10, 11)</text>
<line x1="330" y1="194" x2="330" y2="238" stroke="currentColor" marker-end="url(#sd-a9)"/>
</svg><figcaption>One command uses every section: images built from cached layers, containers as isolated processes, a network for names, a volume for data, env for config, ports for the outside world.</figcaption></figure>
  <table class="tbl"><caption>Every idea on the chai stack</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Containerisation</td><td>image + runtime</td><td>why does it fail elsewhere?</td><td>server: 3.13, no psycopg, no db, no env</td><td>anything that must run on another machine</td></tr>
    <tr><td>Container</td><td>process + namespaces + cgroups</td><td>VM or not?</td><td>same kernel; PID 1 inside, big PID outside; 100m = 104857600</td><td>always (understand it)</td></tr>
    <tr><td>Image vs container</td><td>layers + writable layer</td><td>template vs instance?</td><td>/tmp/report.txt gone after rm</td><td>every command</td></tr>
    <tr><td>Dockerfile &amp; cache</td><td>instructions → layers</td><td>how to build, fast?</td><td>code edit: only step 6 ran; bad order re-ran pip</td><td>every image</td></tr>
    <tr><td>Build &amp; run</td><td>images + processes</td><td>start, inspect, stop?</td><td>exit 2 passes through; exec 0 s vs shell 137</td><td>daily</td></tr>
    <tr><td>Ports</td><td>host → container forwarding</td><td>reach a server inside?</td><td>8080→8000; 127.0.0.1 → connection reset</td><td>any server in a container</td></tr>
    <tr><td>Volumes</td><td>mounts outside the writable layer</td><td>outside files; keep data?</td><td>/data:ro read the 18th (₹655); write refused</td><td>input data, databases</td></tr>
    <tr><td>Env &amp; config</td><td>process environment</td><td>settings per environment?</td><td>no DATABASE_URL → KeyError</td><td>all config and secrets</td></tr>
    <tr><td>Compose</td><td>services + network + volumes</td><td>several containers together?</td><td>saved ₹230; table kept after down/up</td><td>multi-container apps, local dev</td></tr>
    <tr><td>Registry &amp; tags</td><td>push/pull + labels</td><td>move images, name versions?</td><td>same tag latest, two digests</td><td>every deploy</td></tr>
    <tr><td>Multi-stage</td><td>several FROMs</td><td>ship only runtime?</td><td>230 → 223 MB, no /wheels, user app</td><td>anything with build tools</td></tr>
    <tr><td>Production traps</td><td>all of the above</td><td>safe after it works?</td><td>password in history; root-owned files</td><td>before the first real deploy</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>an image is a stack of cached, read-only filesystem layers built from a Dockerfile; a container is an ordinary Linux process started on top of it with its own namespaces, and everything it needs from outside (ports, files, settings, other containers) is plugged in at run time, which is exactly what Compose writes down.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The usual reasons a container "doesn't work".</div>

  <h2 id="sd-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mistakes produce the classic symptoms: slow builds, "connection reset", "connection refused", lost data, 10-second stops, leaked passwords?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: code copied before requirements</span><p>Every edit reinstalls all packages. Copy <code>requirements.txt</code>, install, then copy code.</p></div>
  <div class="callout trap"><span class="label">Trap: listening on 127.0.0.1</span><p>Port mapping exists but curl gets "connection reset". Bind <code>0.0.0.0</code> inside containers.</p></div>
  <div class="callout trap"><span class="label">Trap: localhost to reach another container</span><p><code>localhost</code> is the container itself ("connection refused"). Use the service name on a shared network (<code>db:5432</code>).</p></div>
  <div class="callout trap"><span class="label">Trap: data in the container layer</span><p>Gone on <code>docker rm</code>. Use a named volume, and remember <code>compose down -v</code> deletes it.</p></div>
  <div class="callout trap"><span class="label">Trap: shell-form CMD</span><p><code>sh</code> becomes PID 1, SIGTERM never reaches the app, stop takes 10 s and ends in 137. Use <code>CMD ["python", "board.py"]</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: depends_on without healthcheck</span><p>Start order is not readiness. Healthcheck + <code>service_healthy</code> + retries.</p></div>
  <div class="callout trap"><span class="label">Trap: secrets via ENV or COPY</span><p>Visible in <code>docker history</code> and layers. Inject at run time; cover every secret file in <code>.dockerignore</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: deploying :latest</span><p>Moving label, no rollback. Use version or git-SHA tags, or digests.</p></div>
  <div class="callout trap"><span class="label">Trap: unpinned dependencies</span><p>psycopg needed typing-extensions; unpinned transitive packages drift between builds. Pin everything or use a lock file.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="sd-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: image <code>chai-report:1.0</code> = <code>python:3.12-slim</code> + psycopg 3.3.6 (+ typing-extensions 4.16.0) + <code>sales_report.py</code>, <code>board.py</code>, <code>save_report.py</code>, sample sheet; default command prints <strong>Total sales: ₹230 from 6 valid orders, rejected: 3</strong>. <code>compose.yaml</code>: <code>db</code> (postgres:16-alpine, volume pgdata, healthcheck), <code>report</code> (saves into <code>daily_sales</code>: 2026-10-19 | 230 | 6 | 3), <code>board</code> (8080→8000). Sizes: base 179 MB, single-stage 230 MB, multi-stage 223 MB.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On our stack</th><th>Weakness → next</th></tr>
    <tr><td>Works on my machine</td><td>why does it fail elsewhere?</td><td>3.13, no psycopg, no db, no env</td><td>what to ship?</td></tr>
    <tr><td>Container</td><td>VM or not?</td><td>same kernel, own PIDs, cgroup limit</td><td>where do files come from?</td></tr>
    <tr><td>Image vs container</td><td>template vs instance?</td><td>writes vanish with the container</td><td>how to make an image?</td></tr>
    <tr><td>Dockerfile &amp; cache</td><td>recipe, fast rebuilds?</td><td>only the COPY code step reran</td><td>how to run it?</td></tr>
    <tr><td>Build &amp; run</td><td>run, inspect, stop?</td><td>exit 2 passes; shell form → 137</td><td>sealed box</td></tr>
    <tr><td>Ports &amp; volumes</td><td>doors and storage?</td><td>8080→8000; /data:ro; chai-out</td><td>settings</td></tr>
    <tr><td>Env &amp; config</td><td>per-environment settings?</td><td>KeyError without DATABASE_URL</td><td>a database container</td></tr>
    <tr><td>Compose</td><td>several containers?</td><td>db by name; healthy; volume kept</td><td>moving images</td></tr>
    <tr><td>Registries</td><td>ship images?</td><td>push/pull; latest moved</td><td>image size</td></tr>
    <tr><td>Multi-stage</td><td>ship only runtime?</td><td>no /wheels, user app</td><td>production habits</td></tr>
    <tr><td>Traps</td><td>safe in production?</td><td>password in history; root files</td><td>→ CI/CD, Kubernetes</td></tr>
  </table>
  <h3>Definitions and syntax</h3>
  <ul>
    <li><strong>Container</strong> = process + namespaces (pid, mnt, net, uts…) + cgroups (memory, CPU); shares the host kernel. <strong>Image</strong> = read-only layers + config. <strong>Writable layer</strong> = per container, deleted with it.</li>
    <li><strong>Dockerfile</strong>: <code>FROM</code>, <code>WORKDIR</code>, <code>COPY</code>, <code>RUN</code>, <code>ENV</code>, <code>USER</code>, <code>EXPOSE</code> (docs only), <code>CMD</code> (default, overridable), <code>ENTRYPOINT</code> (fixed program). Cache: a changed step rebuilds it and all later steps. <code>.dockerignore</code>.</li>
    <li><strong>CLI</strong>: <code>build -t n:t .</code>, <code>run --rm/-d/--name/-p/-v/-e/--env-file/-m</code>, <code>ps -a</code>, <code>logs -f</code>, <code>exec -it</code>, <code>top</code>, <code>stop</code> (SIGTERM, SIGKILL after 10 s), <code>rm</code>, <code>rmi</code>, <code>images</code>, <code>history</code>, <code>diff</code>, <code>inspect</code>.</li>
    <li><strong>Ports</strong>: <code>-p HOST:CONTAINER</code>; app binds 0.0.0.0. <strong>Volumes</strong>: bind <code>-v /host:/path[:ro]</code>, named <code>-v name:/path</code>, <code>--tmpfs</code>.</li>
    <li><strong>Networking</strong>: user-defined network/Compose → names resolve; <code>localhost</code> = the container itself; <code>-p</code> only for traffic from outside Docker.</li>
    <li><strong>Compose</strong>: <code>services</code>, <code>image</code>/<code>build</code>, <code>command</code>, <code>environment</code>, <code>ports</code>, <code>volumes</code>, <code>depends_on: condition: service_healthy</code>, <code>healthcheck</code>; <code>up -d</code>, <code>ps -a</code>, <code>logs</code>, <code>exec</code>, <code>run --rm</code>, <code>down</code> (keeps volumes), <code>down -v</code>.</li>
    <li><strong>Registry</strong>: <code>host/name:tag</code>; <code>tag</code>, <code>push</code>, <code>pull</code>; tag = movable label, digest = <code>sha256:…</code> exact content; default tag <code>latest</code>.</li>
    <li><strong>Multi-stage</strong>: <code>FROM … AS builder</code>, <code>COPY --from=builder</code>; deleting in a later layer does not shrink the image.</li>
    <li><strong>Exit codes</strong>: pass through <code>docker run</code>; 137 = SIGKILL (OOM or stop timeout), 143 = SIGTERM unhandled.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Container</b><p>Anything that must run the same on several machines.</p><small>Not a security boundary on its own</small></div>
    <div><b>Bind mount</b><p>Input data, live code in development.</p><small>Tied to host paths and permissions</small></div>
    <div><b>Named volume</b><p>Databases and outputs that must persist.</p><small>Not for code</small></div>
    <div><b>Compose</b><p>Multi-container apps on one machine, local dev, small servers.</p><small>Clusters use Kubernetes</small></div>
    <div><b>Multi-stage</b><p>Anything with build tools or downloaded installers.</p><small>Same base in both stages</small></div>
    <div><b>Version tags / digests</b><p>Every deploy.</p><small>Never deploy <code>:latest</code></small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>COPY . . before pip install; listening on 127.0.0.1; localhost for another container; data in the writable layer; <code>down -v</code>; shell-form CMD; depends_on without healthcheck; secrets in ENV/COPY/layers; <code>:latest</code>; running as root; unpinned dependencies; deleting files in a later layer.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why is <code>uname -r</code> the same inside and outside a container?</td><td>Containers share the host kernel; only the userspace files differ</td></tr>
    <tr><td>You edit <code>sales_report.py</code>. Which steps of our Dockerfile rebuild?</td><td>Only the final <code>COPY</code> of the code (pip install stays cached)</td></tr>
    <tr><td>Why did <code>docker stop sf</code> take 10 s and exit 137?</td><td><code>sh</code> was PID 1 and did not forward SIGTERM; Docker sent SIGKILL after the timeout</td></tr>
    <tr><td>The saver in Compose uses <code>localhost:5432</code>. What happens?</td><td>Connection refused: localhost is the saver's own container; use <code>db:5432</code></td></tr>
    <tr><td>After <code>docker compose down</code> and <code>up</code>, is the table still there?</td><td>Yes, the named volume survives; only <code>down -v</code> deletes it</td></tr>
  </table>

  <h2 id="sd-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Image vs container?</summary><div class="qa-body">An image is an immutable, layered template built from a Dockerfile. A container is a running (or stopped) instance of it with its own writable layer, process and network. One image can run as many containers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Container vs VM?</summary><div class="qa-body">A VM virtualises hardware and runs a full guest kernel (heavy, slow to boot, strong isolation). A container is a process isolated with namespaces and cgroups on the host kernel (light, starts in under a second, weaker isolation). <code>uname -r</code> inside shows the host's kernel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Docker vs virtualenv?</summary><div class="qa-body">A virtualenv isolates Python packages only; it uses the machine's interpreter and system libraries and cannot provide services. An image pins OS libraries, the Python version, packages and default config; Compose adds services like Postgres.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every small code change makes the build reinstall all packages. Why and how to fix?</summary><div class="qa-body">The Dockerfile copies all code before <code>pip install</code>, so any edit invalidates that layer and every later one. Copy <code>requirements.txt</code> first, install, then copy the code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a multi-stage build and why use it?</summary><div class="qa-body">Several <code>FROM</code> stages in one Dockerfile; the final stage copies only the needed artefacts (<code>COPY --from=builder</code>). Compilers, caches and installers stay out of the shipped image: smaller and safer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your container runs but curl from the host gets "connection reset". Causes?</summary><div class="qa-body">(1) The app listens on 127.0.0.1 inside the container: bind 0.0.0.0. (2) Missing or reversed <code>-p</code> (host:container). (3) The app crashed or is still starting: check <code>docker logs</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your app cannot reach Postgres at <code>localhost:5432</code> in Compose. Why?</summary><div class="qa-body"><code>localhost</code> is the app's own container. Use the service name, <code>db:5432</code>, and wait for readiness (healthcheck + <code>service_healthy</code> + retries).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>EXPOSE 8000</code> do?</summary><div class="qa-body">It only documents the port (and lets <code>-P</code> pick it). You still need <code>-p host:container</code> to publish it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CMD vs ENTRYPOINT? Exec vs shell form?</summary><div class="qa-body"><code>ENTRYPOINT</code> fixes the executable; <code>CMD</code> gives defaults that <code>docker run img …</code> overrides. Exec form (<code>["python", "board.py"]</code>) makes the app PID 1 so it receives SIGTERM; shell form puts <code>/bin/sh</code> in front, so <code>docker stop</code> waits 10 s and SIGKILLs (137).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Container A writes <code>/tmp/x.txt</code>, is removed, then <code>docker run --rm img cat /tmp/x.txt</code>. Output?</summary><div class="qa-body"><code>cat: /tmp/x.txt: No such file or directory</code>. Each container starts from the clean image; A's writable layer died with it. Use a volume to persist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Named volume vs bind mount?</summary><div class="qa-body">Named volume: Docker-managed storage, portable, for databases and outputs. Bind mount: a specific host folder, for input data and live development, tied to that host's paths and permissions; add <code>:ro</code> when the container should only read.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use <code>:latest</code> in production?</summary><div class="qa-body">It is mutable: two servers can pull different images under the same tag (we pushed two digests as latest), and you cannot roll back to "the previous latest". Use version or git-SHA tags, or digests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you pass a database password to a container?</summary><div class="qa-body">At run time: <code>-e</code>/<code>--env-file</code>, Compose variables from an untracked <code>.env</code>, Kubernetes secrets or a secret manager. Never <code>ENV</code> or <code>COPY</code> it in the Dockerfile: <code>docker history</code> and the layers reveal it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A container keeps dying with exit code 137. What do you check?</summary><div class="qa-body">137 = SIGKILL. Check <code>docker inspect --format '{{.State.OOMKilled}}'</code> and <code>dmesg</code> for the OOM killer (memory limit), and whether a <code>docker stop</code> timed out because SIGTERM was ignored (shell-form CMD, no handler).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why run as a non-root user?</summary><div class="qa-body">A compromised app gets an unprivileged user, files it writes to mounts are not root-owned on the host, and many clusters enforce it. Our multi-stage image ran as uid 1000 and could not write into a root-owned folder.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You deleted a large file in a later RUN, but the image did not shrink. Why?</summary><div class="qa-body">Layers stack; the later layer only hides the file (377 MB vs 177 MB here). Create and delete in the same RUN, or use a multi-stage build.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the Linux note's PID and signal knowledge explain the 10-second stop?</summary><div class="qa-body">A container's main process is PID 1 in its namespace. <code>docker stop</code> = SIGTERM to PID 1, then SIGKILL after 10 s. If PID 1 is <code>sh</code> (shell form) it does not forward the signal, so the app is killed with 137 = 128 + 9, exactly the Linux note's exit-code rule.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Compose need both a network and a volume for the database?</summary><div class="qa-body">The network gives the stable name <code>db</code> the saver connects to (IPs change on restart, localhost is the wrong container); the volume keeps Postgres's files outside the container's writable layer, so <code>down</code>/<code>up</code> or an upgrade keeps the table. Without the network nothing connects; without the volume every restart loses the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you build images from an untagged working folder instead of a Git tag?</summary><div class="qa-body">You cannot say which code is inside an image, two builds of "the same" version can differ, and a rollback has nothing to point at. Build from a tagged commit (v1.0.0), tag the image with the same version, pin dependencies: code version, image version and environment then line up, which is the reproducibility the Git note started.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do env vars, ports and permissions from the Linux note reappear in Docker?</summary><div class="qa-body">Env vars: <code>-e</code> / <code>environment:</code> are the same inherited process environment (KeyError without DATABASE_URL). Ports: a server must listen on an interface reachable from outside its network namespace (0.0.0.0). Permissions: the container's user ID decides file access on bind mounts (root-owned report; Permission denied for uid 1000).</div></details>
</main>
`
});
