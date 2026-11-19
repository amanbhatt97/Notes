// notes/softeng/se_docker.js — Docker
Object.assign(TOPIC_CONTENT, {
  "se_docker": `<main>
<h1>Docker</h1>
  <div class="where"><span>Software Engineering</span><span>Docker</span></div>
  <p class="lead">Docker is a tool that packs a program together with everything it needs in order to run (the right Python version, every library, the operating-system files underneath) into one sealed package called an <strong>image</strong>, and then runs that package in exactly the same way on a laptop, on a test server and in the cloud. It is the standard way scripts, web APIs and machine-learning models are shipped today, and Kubernetes and most CI/CD systems are built on top of it, so you will meet it in almost every real job. The running example continues the story of this track: the chai stall's <code>sales_report.py</code>, versioned in the Git note and run every night on a Linux server in the Linux note, gets a new job. It must now save each day's total into a PostgreSQL database, and on the way we will package it, give it a small web page and run it next to its database. One honest note about the demos: the machine this page was prepared on has the <code>docker</code> command but no Docker engine running, so Docker's own commands are shown without output and the text tells you what they print. Everything else, including the Linux features that containers are actually made of, was really run and its output is pasted as printed.</p>

  <h2 id="sd-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Docker</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What a container is</div>
        <ul>
          <li>An ordinary process, fenced off by the kernel</li>
          <li><b>Namespaces</b>: own PIDs, hostname, network, mounts</li>
          <li><b>cgroups</b>: limits on memory and CPU</li>
          <li>Shares the host kernel, so it is not a VM</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Images and builds</div>
        <ul>
          <li><b>Image</b>: read-only stack of layers + settings</li>
          <li><b>Container</b>: image + writable layer + process</li>
          <li>Dockerfile: one layer per instruction</li>
          <li>Cache: a changed step rebuilds it and every step after it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Plugging in at run time</div>
        <ul>
          <li><code>-p 8080:8000</code>: host port to container port; app listens on 0.0.0.0</li>
          <li><code>-v</code>: bind mounts and named volumes outlive the container</li>
          <li><code>-e</code>, <code>--env-file</code>: settings and secrets</li>
          <li>Compose: services find each other by name</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shipping safely</div>
        <ul>
          <li>Registry: push and pull; tag = label, digest = exact content</li>
          <li>Multi-stage builds ship only what runs</li>
          <li>No secrets in layers; run as a non-root user</li>
          <li>Exec-form <code>CMD</code> so <code>docker stop</code> is clean</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Works on My Machine</span><span class="rm-sub">why shipping only the code fails</span></div></div>
      <div class="rm-item rm-done" data-target="sd-what"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">What a Container Is</span><span class="rm-sub">a fenced-off process, not a small computer</span></div></div>
      <div class="rm-item rm-done" data-target="sd-img"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Images, Layers and Containers</span><span class="rm-sub">where a container's files come from</span></div></div>
      <div class="rm-item rm-done" data-target="sd-file"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Dockerfile</span><span class="rm-sub">the recipe that builds an image</span></div></div>
      <div class="rm-item rm-done" data-target="sd-cache"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Build Cache</span><span class="rm-sub">why the order of instructions matters</span></div></div>
      <div class="rm-item rm-done" data-target="sd-run"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Running Containers</span><span class="rm-sub">run, logs, exec, stop, and PID 1</span></div></div>
      <div class="rm-item rm-done" data-target="sd-ports"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Ports and Container Networking</span><span class="rm-sub">letting the outside world in</span></div></div>
      <div class="rm-item rm-done" data-target="sd-vol"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Volumes and Bind Mounts</span><span class="rm-sub">files that come in or must survive</span></div></div>
      <div class="rm-item rm-done" data-target="sd-env"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Configuration with Environment Variables</span><span class="rm-sub">one image, many settings</span></div></div>
      <div class="rm-item rm-done" data-target="sd-compose"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Docker Compose</span><span class="rm-sub">the app and Postgres in one file</span></div></div>
      <div class="rm-item rm-done" data-target="sd-reg"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Registries, Tags and Digests</span><span class="rm-sub">how images travel between machines</span></div></div>
      <div class="rm-item rm-done" data-target="sd-small"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Small, Safe Images</span><span class="rm-sub">multi-stage builds, secrets, non-root</span></div></div>
      <div class="rm-item rm-done" data-target="sd-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the usual "why doesn't it work"</span></div></div>
      <div class="rm-item rm-done" data-target="sd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, commands, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="sd-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on Docker</span></div></div>
    </div>
  </div>

  <h2 id="sd-why"><span class="num">01</span>Works on My Machine</h2>
  <p>The stall's owner wants every day's totals kept in a database so that she can compare one week with the next. Meera writes a new script, <code>save_report.py</code>, that reads one day's order sheet, counts the valid orders exactly as the report does, and writes one row into a PostgreSQL table called <code>daily_sales</code>:</p>
  <div class="fx" data-lang="py">import csv, os, sys
import psycopg

day = sys.argv[1]                                  # e.g. 2026-10-19
total = orders = rejected = 0
with open(f"/data/orders_{day}.csv", newline="") as f:
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
  <p>The interesting part is not the counting but what the script quietly expects from the machine it runs on. It needs a Python interpreter. It needs the <code>psycopg</code> library, which is the driver that lets Python talk to Postgres. It needs a Postgres server to be running somewhere it can reach. And it needs an <strong>environment variable</strong> called <code>DATABASE_URL</code> that says where that server is and what password to use (environment variables are named settings a process receives when it starts; the Linux note covers them). On Meera's laptop all four happen to be in place, so the script works. Here is the stall's server checked for the same four things:</p>
  <div class="fx" data-lang="text">$ python3 --version
Python 3.13.18
$ python3 -c "import psycopg" 2&gt;&amp;1 | tail -n 1
ModuleNotFoundError: No module named 'psycopg'
$ pg_isready -h localhost
localhost:5432 - no response
$ printenv DATABASE_URL || echo "DATABASE_URL is not set"
DATABASE_URL is not set</div>
  <p>Every line is a different reason for the same script to fail. The server has Python 3.13 where Meera tested with 3.12, <code>import psycopg</code> fails because the library was never installed there, <code>pg_isready</code> (a small tool that asks "is a Postgres server answering on this address?") gets no response on port 5432, and the environment variable does not exist. Each one can be fixed by hand, but the fixes must be repeated on every new machine, slightly differently each time, and the next person will forget one. This is the famous "it works on my machine" problem: a program depends on many things outside its own code (see <a class="xref" data-note="cf_programs">From Code to a Running Program</a> for what a program's dependencies are), and those things differ between machines.</p>
  <p>You may know that a <a class="xref" data-note="py_modules">virtual environment</a> isolates Python packages for one project. It helps with the second line only. A virtual environment still uses whatever Python interpreter and system libraries the machine has, and it certainly cannot start a database server. What we really want is to ship not just the code but the code <em>together with its whole environment</em>: the operating-system files, the exact Python version, every library and sensible default settings, all sealed into one package that behaves identically wherever it runs. That idea is called <strong>containerisation</strong>, and Docker is the tool that made it everyday practice.</p>
  <p>The name comes from shipping. Before standard steel containers, every port loaded sacks, barrels and crates in its own way, and goods were damaged or lost at every transfer. Once everything travelled in the same steel box, every crane, ship and lorry in the world could handle it without caring what was inside. Docker does the same for software: the report and its environment are the cargo, the image is the standard box, and any machine that has Docker can run it. The workflow you will see throughout this page has three steps. You write a recipe called a <strong>Dockerfile</strong>; <code>docker build</code> turns the recipe into an <strong>image</strong>, the sealed package; and <code>docker run</code> starts a <strong>container</strong> from that image, which is the program actually running. Before we write any recipe, though, we need to understand what a container really is, because the answer surprises most people.</p>

  <h2 id="sd-what"><span class="num">02</span>What a Container Is</h2>
  <p>"Ship the whole environment, including operating-system files" sounds like shipping an entire computer. The older way of doing exactly that is a <strong>virtual machine</strong> (VM): software that pretends to be a complete computer, with its own virtual hardware and its own operating-system kernel that boots up just like a real one (<a class="xref" data-note="cf_cloud">Virtualization, Cloud &amp; Performance</a> explains VMs in detail). VMs work, but each one carries a full operating system, takes gigabytes of disk and needs tens of seconds or minutes to boot. Containers start in well under a second and are often only tens of megabytes on top of a shared base. So a container cannot be a small VM. What is it?</p>
  <p>A <strong>container</strong> is an ordinary process (a running program, as described in <a class="xref" data-note="cf_os">Operating Systems</a>) that the Linux kernel has fenced off so that it sees its own private little world. Two kernel features do the fencing. A <strong>namespace</strong> gives a process its own private copy of something that is normally shared by the whole machine: the PID namespace gives it its own list of processes, the UTS namespace its own hostname, the network namespace its own network cards, and the mount namespace its own view of which folders exist. A <strong>cgroup</strong> (control group) puts limits on how much memory and CPU a group of processes may use. A container is simply a process started inside a fresh set of namespaces, inside a cgroup, with its own folder of files as its root directory. It still runs on the host's one and only kernel; nothing is emulated.</p>
  <p>Think of flats in one apartment building compared with separate houses. Each flat has its own front door, its own rooms and its own name on the bell, and the people inside cannot see into the other flats. But all the flats share the building's foundation, water pipes and electricity. Separate houses, the VMs, each have their own foundation: more private, but much more expensive to build. Containers are the flats, and the shared foundation is the kernel.</p>
  <p>On a normal machine you would see this through Docker. Docker is split into two programs: the <code>docker</code> command you type is only a <strong>client</strong>, and it sends each request over a local socket to the <strong>Docker daemon</strong> (<code>dockerd</code>), a background service that does the real work of building images and starting containers. On the machine used for this page the daemon is not running, which the first command below shows. That turns out to be useful, because it lets us build a container by hand from the very same kernel features Docker uses, with the standard Linux tool <code>unshare</code>, which starts a program inside new namespaces:</p>
  <div class="fx" data-lang="text">$ docker ps
failed to connect to the docker API at unix:///var/run/docker.sock; check if the path is correct and if the daemon is running: dial unix /var/run/docker.sock: connect: no such file or directory
$ hostname; uname -r
vm
6.18.44-fc-v653
$ readlink /proc/self/ns/pid /proc/self/ns/uts /proc/self/ns/net
pid:[4026531836]
uts:[4026531838]
net:[4026531833]
$ ps -e --no-headers | wc -l
82
$ unshare --pid --uts --net --fork --mount-proc sh -c 'hostname chai-box; hostname; uname -r; readlink /proc/self/ns/pid /proc/self/ns/uts /proc/self/ns/net; ps -e'
chai-box
6.18.44-fc-v653
pid:[4026532267]
uts:[4026532266]
net:[4026532268]
    PID TTY          TIME CMD
      1 ?        00:00:00 sh
      6 ?        00:00:00 ps
$ hostname
vm</div>
  <p>The first line is the error every Docker user meets sooner or later: the client tried to reach the daemon through the socket file <code>/var/run/docker.sock</code> and nobody was there. Whenever you see "cannot connect to the Docker daemon", the problem is the background service, not your command. Next we look at the host: its hostname is <code>vm</code>, its kernel version is <code>6.18.44-fc-v653</code>, and <code>readlink</code> shows the identity numbers of the PID, UTS and network namespaces our shell lives in. About 80 processes are running on the machine.</p>
  <p>Then <code>unshare</code> starts a shell in a new PID, UTS and network namespace (<code>--mount-proc</code> just makes <code>ps</code> read the new process list). Inside, we set the hostname to <code>chai-box</code> and it sticks; yet the final <code>hostname</code>, run back on the host afterwards, still says <code>vm</code>, because the change happened in a private copy. The namespace numbers inside are all different from the host's. <code>ps -e</code> inside sees only two processes, and the shell we started is <strong>PID 1</strong>, the first process of its own little world, even though on the host it has an ordinary large PID. But <code>uname -r</code> prints exactly the same kernel version inside and outside: there is only one kernel, and the "container" borrowed it. That is the whole trick behind Docker. When you run <code>docker run</code>, the daemon does what we just did, plus two more steps you will see in the next sections: it gives the process its own root filesystem built from the image, and it places it in a cgroup, so that <code>docker run -m 100m</code>, for example, becomes a memory limit of 100 MB that the kernel enforces by killing the process (exit code 137) if it goes over, as the Linux note's out-of-memory demo showed.</p>
  <p>Two consequences are worth remembering. First, because containers need a Linux kernel, Docker Desktop on a Mac or Windows laptop quietly runs one small Linux VM and starts all your containers inside it. Second, sharing the kernel makes containers lighter than VMs but also less isolated: a bug in the kernel, or a container started with extra privileges, can affect the host. Containers are a packaging and isolation tool, not a complete security boundary on their own.</p>

  <h2 id="sd-img"><span class="num">03</span>Images, Layers and Containers</h2>
  <p>Our hand-made container still saw the host's files. A Docker container instead sees Debian's files, a particular Python and our scripts, even on an Ubuntu host. Those files come from the <strong>image</strong>. An image is a read-only template for containers: a stack of filesystem <strong>layers</strong> plus a little metadata, such as the default command to run, default environment variables and the user to run as. A layer is the set of file changes (files added, changed or deleted) produced by one step of the build. The bottom layer might hold Debian's basic files, the next one Python, the next one the installed libraries, and the top one our scripts.</p>
  <p>A container is one running copy made from an image. When Docker starts a container, it stacks the image's layers into a single view of a filesystem and adds one extra, initially empty, <strong>writable layer</strong> on top that belongs only to that container. Everything the container writes goes into its own writable layer; the image's layers are never changed. So many containers can start from the same image at the same time, each with its own writable layer, and the layers underneath are stored on disk only once. A good analogy is a recipe printed in a book and the dishes cooked from it: the printed page never changes, each dish is made from it, and adding salt to one dish affects neither the book nor the other dishes. If you know <a class="xref" data-note="py_oop">OOP</a>, an image is like a class and a container like an object created from it.</p>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
    <defs><marker id="sd-arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="20" width="290" height="32" rx="4" class="fr sr" stroke-dasharray="5 3"/><text x="165" y="41" text-anchor="middle">container's writable layer (report.txt, whiteouts)</text>
    <rect x="20" y="62" width="290" height="30" rx="4" class="fb sb"/><text x="165" y="82" text-anchor="middle">layer: our scripts (/app)</text>
    <rect x="20" y="97" width="290" height="30" rx="4" class="fb sb"/><text x="165" y="117" text-anchor="middle">layer: installed libraries (psycopg)</text>
    <rect x="20" y="132" width="290" height="30" rx="4" class="fs"/><text x="165" y="152" text-anchor="middle">layer: Python 3.12</text>
    <rect x="20" y="167" width="290" height="30" rx="4" class="fs"/><text x="165" y="187" text-anchor="middle">layer: Debian base files</text>
    <line x1="330" y1="62" x2="330" y2="197" stroke="currentColor"/><text x="340" y="134" class="tm">image: read-only, shared</text>
    <rect x="430" y="70" width="155" height="90" rx="8" class="fg sg"/><text x="507" y="105" text-anchor="middle">merged view</text><text x="507" y="125" text-anchor="middle" class="tm">what the process</text><text x="507" y="141" text-anchor="middle" class="tm">sees as "/"</text>
    <line x1="312" y1="36" x2="426" y2="90" stroke="currentColor" stroke-width="1.5" marker-end="url(#sd-arr1)"/>
    <text x="165" y="222" text-anchor="middle" class="tm">a file is looked up from the top layer down; the first match wins</text>
  </svg><figcaption>A container's filesystem: the image's read-only layers with one writable layer on top, merged into one view.</figcaption></figure>
  <p>Read the figure from the top. When the process opens a file, the system looks for it in the writable layer first, then in each image layer going down, and uses the first copy it finds. When the process changes a file that lives in an image layer, the file is first copied up into the writable layer and changed there; this is called <strong>copy-on-write</strong>. And because image layers can never be modified, deleting a file is recorded by putting a special marker called a <strong>whiteout</strong> in the writable layer, which hides the file underneath. On Linux, Docker implements all of this with a kernel feature called <strong>overlay</strong> (Docker's "overlay2" storage driver). Since it is a plain kernel feature, we can use it directly. Below, three folders play the part of three image layers, and an overlay mount stacks them for a container called <code>c1</code>. (Mounting needs administrator rights; the demo ran as root inside a private mount namespace, so nothing on the machine itself changed.)</p>
  <div class="fx" data-lang="text">$ find layer1-base layer2-deps layer3-app -type f
layer1-base/etc/os-release
layer1-base/usr/local/bin/python3.12
layer2-deps/usr/local/lib/python3.12/site-packages/psycopg/__init__.py
layer3-app/app/sample_orders.csv
layer3-app/app/sales_report.py
$ mkdir -p c1/upper c1/work c1/merged
$ mount -t overlay overlay -o lowerdir=layer3-app:layer2-deps:layer1-base,upperdir=c1/upper,workdir=c1/work c1/merged
$ ls c1/merged c1/merged/app
c1/merged:
app
etc
usr

c1/merged/app:
sales_report.py
sample_orders.csv
$ python3 c1/merged/app/sales_report.py c1/merged/app/sample_orders.csv 2&gt;/dev/null | head -n 1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ echo "Total sales: ₹230" &gt; c1/merged/app/report.txt
$ rm c1/merged/app/sample_orders.csv
$ ls c1/merged/app
report.txt
sales_report.py
$ ls -l c1/upper/app
total 4
-rw-r--r-- 1 root root   20 Nov 19 05:51 report.txt
c--------- 2 root root 0, 0 Nov 19 05:51 sample_orders.csv
$ ls layer3-app/app
sales_report.py
sample_orders.csv
$ umount c1/merged
$ mkdir -p c2/upper c2/work c2/merged
$ mount -t overlay overlay -o lowerdir=layer3-app:layer2-deps:layer1-base,upperdir=c2/upper,workdir=c2/work c2/merged
$ ls c2/merged/app
sales_report.py
sample_orders.csv</div>
  <p>The <code>find</code> shows what each "layer" holds: the base files, a stand-in for the installed library, and our real script and sample sheet. The <code>mount -t overlay</code> line stacks them: <code>lowerdir</code> lists the read-only layers from top to bottom, <code>upperdir</code> is the container's writable layer, <code>workdir</code> is scratch space the kernel needs, and <code>merged</code> is the single combined view. Listing <code>c1/merged</code> shows <code>app</code>, <code>etc</code> and <code>usr</code> side by side, even though they come from three different folders, and the real report runs from inside it and prints ₹230.</p>
  <p>Then the "container" writes a new file and deletes the sample sheet. The merged view now shows <code>report.txt</code> and no sample. Look at where those changes went: <code>c1/upper/app</code> holds the new <code>report.txt</code>, and a strange entry for <code>sample_orders.csv</code> whose type is <code>c</code> (a character device with number 0, 0). That is the whiteout marker. Meanwhile the layer folder <code>layer3-app/app</code> still has both original files, untouched. Finally we throw away <code>c1</code>, the equivalent of <code>docker rm</code>, and start <code>c2</code> from the same three layers with a fresh, empty writable layer: the sample sheet is back and <code>report.txt</code> is gone. This is exactly why a file written inside a container disappears when the container is removed, and also why every container starts in exactly the same clean state. Data that must survive needs a volume, which section 08 covers.</p>
  <p>With a Docker daemon you would inspect the same things with a few commands. They are shown here without output:</p>
  <div class="fx" data-lang="text">$ docker images                 # list images on this machine
$ docker ps -a                  # list containers, including stopped ones
$ docker diff tmp1              # what container tmp1 changed in its writable layer
$ docker rm tmp1                # delete a container (and its writable layer)
$ docker rmi chai-report:1.0    # delete an image</div>
  <p><code>docker images</code> prints one line per image with its name, tag, ID and size, for example <code>python</code> with tag <code>3.12-slim</code> at around 180 MB on disk. <code>docker ps -a</code> prints one line per container with its ID, the image it came from, its command and a status such as <code>Up 5 minutes</code> or <code>Exited (0) 2 seconds ago</code>. <code>docker diff</code> prints the writable layer's changes, one path per line, marked <code>A</code> for added, <code>C</code> for changed and <code>D</code> for deleted, which is the same information we just saw in the <code>upper</code> folder. Keep the two deletion commands apart: <code>rm</code> removes containers, <code>rmi</code> removes images.</p>

  <h2 id="sd-file"><span class="num">04</span>The Dockerfile</h2>
  <p>Now we can make our own image: the official Python 3.12 image, plus psycopg, plus our three scripts and the sample sheet. The recipe for an image is a plain-text file called <strong>Dockerfile</strong>, with one instruction per line, run from top to bottom. Each instruction that changes files produces one layer. Here is the stall's Dockerfile, followed by the two small files that go with it, the pinned requirements and the <code>.dockerignore</code>:</p>
  <div class="fx" data-lang="text">FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY sales_report.py board.py save_report.py sample_orders.csv ./
CMD ["python", "sales_report.py", "sample_orders.csv"]</div>
  <div class="fx" data-lang="text">psycopg[binary]==3.3.6
typing-extensions==4.16.0</div>
  <div class="fx" data-lang="text">.git
.venv
__pycache__/
data/
out/
.env
*.env
*.log</div>
  <p>Read the Dockerfile line by line. <code>FROM python:3.12-slim</code> chooses the <strong>base image</strong> to build on, here the official image containing Debian and Python 3.12; "slim" means a variant without compilers and documentation, which makes it several hundred megabytes smaller than the full one. <code>WORKDIR /app</code> creates the folder <code>/app</code> and makes it the current directory for every later instruction and for the running container, like a permanent <code>cd</code>. <code>COPY requirements.txt .</code> copies one file from your project folder into the image. <code>RUN pip install ...</code> runs a command <em>while the image is being built</em>, and whatever files that command creates (here, the installed libraries) become a new layer; <code>--no-cache-dir</code> stops pip from keeping its download cache inside the image, where it would only waste space. The second <code>COPY</code> brings in our scripts. Finally <code>CMD</code> is not run during the build at all: it records the default command that a container should run when it starts, here the report on the baked-in sample sheet.</p>
  <p>A few other instructions appear in almost every real Dockerfile. <code>ENV NAME=value</code> sets a default environment variable inside the image. <code>USER app</code> makes the container run as that user instead of the administrator. <code>EXPOSE 8000</code> records which port the program listens on, purely as documentation. <code>ENTRYPOINT</code> is a relative of <code>CMD</code> that section 06 explains. Sections 07, 09 and 12 show each of these in use.</p>
  <p>Where do the files for <code>COPY</code> come from? When you run <code>docker build</code>, the client first packs up the folder you name (usually <code>.</code>, the current folder) and sends it to the daemon. That bundle is called the <strong>build context</strong>, and <code>COPY</code> can only see files inside it. The <code>.dockerignore</code> file lists paths that are left out of the context entirely, which matters for three reasons: it keeps secrets such as <code>.env</code> files from ever reaching an image, it keeps big folders like <code>.git</code>, <code>.venv</code> and <code>data/</code> from slowing every build, and it stops irrelevant changes from invalidating the cache, as the next section explains. The requirements file pins exact versions with <code>==</code>. Note that it pins <code>typing-extensions</code> too, a library psycopg itself needs; pinning only your direct dependencies leaves the indirect ones free to change between builds, so the "same" Dockerfile can produce a different image next month.</p>
  <p>Building and inspecting the image looks like this (no output shown, since there is no daemon here):</p>
  <div class="fx" data-lang="text">$ docker build -t chai-report:1.0 .
$ docker history chai-report:1.0</div>
  <p><code>-t chai-report:1.0</code> gives the image a name and a tag (a version label), and the final <code>.</code> is the build context. While building, Docker prints one numbered line per instruction, such as <code>[1/5] FROM docker.io/library/python:3.12-slim</code> and <code>[3/5] RUN pip install --no-cache-dir -r requirements.txt</code>, each followed by how long it took, and ends with a line like <code>naming to docker.io/library/chai-report:1.0</code>. <code>docker history</code> then lists the image's layers from newest to oldest with the size each one adds: about 0 B for <code>CMD</code> (it only changes metadata), a few kilobytes for our scripts, and tens of megabytes for the <code>pip install</code> layer, sitting on top of the base image's own layers. You can already see that the expensive layer is the libraries, not our code. That observation leads directly to the most important performance idea in Docker.</p>

  <h2 id="sd-cache"><span class="num">05</span>The Build Cache</h2>
  <p>During development you rebuild the image every time you change the code, often dozens of times a day. If every rebuild reinstalled every library, a project using numpy, pandas or PyTorch would wait minutes for each one-line change. Docker avoids this with the <strong>build cache</strong>: after building a layer, it remembers the result, and on the next build it reuses any layer whose inputs have not changed.</p>
  <p>The rule for "has not changed" is precise and worth learning exactly. For each instruction Docker computes a <strong>cache key</strong> from three things: the layer underneath it (its parent), the text of the instruction, and, for <code>COPY</code>, a checksum of the contents of the files being copied. If a layer with the same key already exists, it is reused and the build prints <code>CACHED</code> for that step. Because every key includes its parent, the moment one step misses the cache, every step after it misses as well, since their parent is now new. A stack of rotis is a good picture: to replace the top one you lift off just that one, but to replace the bottom one you have to take off every roti above it and put them all back.</p>
  <p>The program below is a small model of that rule, not Docker itself: it reads our two candidate Dockerfiles, computes a key for each step as just described, and reports which steps a second build would reuse after a one-line edit to <code>sales_report.py</code>. The "bad" Dockerfile differs only in using <code>COPY . .</code> (copy the whole folder) before installing the libraries:</p>
  <div class="fx" data-lang="text">FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "sales_report.py", "sample_orders.csv"]</div>
  <div class="fx" data-lang="py">import hashlib, os

IGNORED = {".dockerignore", ".env", "chai.env", "data"}   # what .dockerignore removes

def context_files(edits):
    """The build context: file name -&gt; content, with any edits applied."""
    files = {n: open(n).read() for n in sorted(os.listdir(".")) if n not in IGNORED and os.path.isfile(n)}
    files.update(edits)
    return files

def build(dockerfile, files, cache):
    parent = ""                                   # key of the layer below
    for step in open(dockerfile).read().splitlines():
        if not step or step.startswith("#"):
            continue
        inputs = step                             # the instruction text itself...
        if step.startswith("COPY"):               # ...plus the bytes of the files it copies
            srcs = step.split()[1:-1]
            names = sorted(files) if srcs == ["."] else srcs
            inputs += "".join(files[n] for n in names)
        key = hashlib.sha256((parent + inputs).encode()).hexdigest()
        print(f"  {'cached' if key in cache else 'BUILD '}  {step}")
        cache.add(key)
        parent = key

for dockerfile in ("Dockerfile", "Dockerfile.bad"):
    cache = set()
    print(f"{dockerfile}, first build:")
    build(dockerfile, context_files({}), cache)
    print(f"{dockerfile}, after editing sales_report.py:")
    edited = {"sales_report.py": open("sales_report.py").read() + "# new comment\\n"}
    build(dockerfile, context_files(edited), cache)
    print()</div>
  <div class="fx" data-lang="text">Dockerfile, first build:
  BUILD   FROM python:3.12-slim
  BUILD   WORKDIR /app
  BUILD   COPY requirements.txt .
  BUILD   RUN pip install --no-cache-dir -r requirements.txt
  BUILD   COPY sales_report.py board.py save_report.py sample_orders.csv ./
  BUILD   CMD ["python", "sales_report.py", "sample_orders.csv"]
Dockerfile, after editing sales_report.py:
  cached  FROM python:3.12-slim
  cached  WORKDIR /app
  cached  COPY requirements.txt .
  cached  RUN pip install --no-cache-dir -r requirements.txt
  BUILD   COPY sales_report.py board.py save_report.py sample_orders.csv ./
  BUILD   CMD ["python", "sales_report.py", "sample_orders.csv"]

Dockerfile.bad, first build:
  BUILD   FROM python:3.12-slim
  BUILD   WORKDIR /app
  BUILD   COPY . .
  BUILD   RUN pip install --no-cache-dir -r requirements.txt
  BUILD   CMD ["python", "sales_report.py", "sample_orders.csv"]
Dockerfile.bad, after editing sales_report.py:
  cached  FROM python:3.12-slim
  cached  WORKDIR /app
  BUILD   COPY . .
  BUILD   RUN pip install --no-cache-dir -r requirements.txt
  BUILD   CMD ["python", "sales_report.py", "sample_orders.csv"]</div>
  <p>In the good Dockerfile, the edit leaves the first four steps <code>cached</code>: the base image, the folder, the requirements file and, most importantly, the <code>pip install</code> layer all have unchanged keys, because <code>sales_report.py</code> is not an input to any of them. Only the final <code>COPY</code> of the scripts, whose input did change, and the <code>CMD</code> after it are rebuilt. In the bad Dockerfile, <code>COPY . .</code> copies <code>sales_report.py</code> along with everything else, so its key changes, and because <code>pip install</code> sits on top of it, the libraries are reinstalled on every single code edit. A real Docker build prints the same pattern: a run of <code>CACHED</code> lines followed by the steps that actually executed, and the whole build takes a fraction of a second when only the last step reruns.</p>
  <p>This gives the golden rule for writing Dockerfiles: order the instructions from the ones that change least often to the ones that change most often. The base image changes rarely, the list of libraries occasionally, and the code constantly, so copy the requirements file on its own, install, and copy the code last. Two subtleties follow from the rule. First, for a <code>RUN</code> step Docker only compares the command's text, not what the command would download, so <code>RUN pip install requests</code> without a pinned version keeps reusing whatever version was installed the first time, until something above it changes; pinning versions makes that harmless. Second, if you ever need to force a completely fresh build, for example to pick up security updates in the base image, <code>docker build --no-cache</code> ignores the cache and <code>--pull</code> fetches the newest copy of the base image.</p>

  <h2 id="sd-run"><span class="num">06</span>Running Containers</h2>
  <p>We have an image. The basic command is <code>docker run IMAGE</code>, which creates a container from the image and runs its default <code>CMD</code>; anything you write after the image name replaces that default command. A few options appear constantly: <code>--rm</code> deletes the container automatically when it exits (otherwise stopped containers pile up), <code>-d</code> ("detached") runs it in the background and prints its ID, and <code>--name</code> gives it a name to use in later commands instead of the long ID.</p>
  <div class="fx" data-lang="text">$ docker run --rm chai-report:1.0
$ docker run --rm chai-report:1.0 python sales_report.py; echo "exit code: $?"
$ docker run --rm chai-report:1.0 python -c "import sys, psycopg; print(sys.version.split()[0], psycopg.__version__)"</div>
  <p>The first command runs the default <code>CMD</code>, so it prints whatever the report prints, and that output is identical on every machine because the script, the Python and the sample sheet are all inside the image. For reference, here is the same script run directly with Python on this machine, once normally and once without its argument:</p>
  <div class="fx" data-lang="text">$ python3 sales_report.py sample_orders.csv
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25
$ python3 sales_report.py; echo "exit code: $?"
usage: python3 sales_report.py ORDERS.csv
exit code: 2</div>
  <p>Inside the container, the report prints exactly these lines: three warnings for the bad rows, ₹230 from 6 valid orders, and the per-item breakdown. The second command replaces the default command with <code>python sales_report.py</code> and no file, so the script prints its usage line and exits with code 2, and Docker passes that exit code straight through: <code>docker run</code> itself exits with 2, so shell scripts and CI systems can tell that the job failed. The third command proves the environment: it prints <code>3.12</code> followed by a patch number and the psycopg version from the requirements file, wherever the image runs, even on a server whose own Python is 3.13.</p>
  <p>For a long-running program we use the stall's web board, a tiny server built only from Python's standard library that shows the report over HTTP. It reads two settings from environment variables, and its last-but-two line installs a handler for the <code>SIGTERM</code> signal; both details matter shortly.</p>
  <div class="fx" data-lang="text">import os, signal, subprocess, sys
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
  <p>Running it in the background and working with it looks like this:</p>
  <div class="fx" data-lang="text">$ docker run -d --name board chai-report:1.0 python board.py
$ docker ps
$ docker logs board
$ docker exec board ls /app
$ docker exec -it board sh
$ docker stop board
$ docker rm board</div>
  <p><code>docker run -d</code> prints the new container's 64-character ID and returns immediately. <code>docker ps</code> lists running containers, showing <code>board</code> with status <code>Up</code> and how long it has been running. <code>docker logs board</code> prints everything the program wrote to its standard output and standard error, here the line <code>board on http://0.0.0.0:8000 showing sample_orders.csv</code>; this is why programs in containers should log to the screen rather than to files. <code>docker exec</code> runs an extra command inside the already-running container, so <code>ls /app</code> lists our scripts, and <code>exec -it board sh</code> opens an interactive shell inside it (<code>-i</code> keeps input open, <code>-t</code> gives it a terminal), which is the usual way to look around while debugging. <code>docker stop</code> prints the container's name once it has stopped, and <code>docker rm</code> deletes it.</p>
  <p>What <code>docker stop</code> actually does deserves care, because getting it wrong makes every deployment slow and drops work in progress. It sends the <code>SIGTERM</code> signal to the container's main process, meaning "please finish up and exit", waits up to 10 seconds, and if the process is still alive, sends <code>SIGKILL</code>, which the kernel enforces immediately and which cannot be caught (signals are covered in <a class="xref" data-note="cf_os">Operating Systems</a> and the Linux note). The catch is that the container's main process is PID 1 in its own PID namespace, and the kernel treats PID 1 specially: a signal that PID 1 has not installed a handler for is simply ignored, instead of killing it as it would kill any other process. We can watch this happen with <code>unshare</code>, no Docker needed:</p>
  <div class="fx" data-lang="text">$ sleep 300 &amp;
$ kill -TERM $!; wait $!; echo "exit code: $?"
exit code: 143
$ unshare --pid --fork sleep 300 2&gt;/dev/null &amp;
$ sleep 0.5; P=$(pgrep -n -x sleep); grep NSpid /proc/$P/status
NSpid:	3838	1
$ kill -TERM $P; sleep 2; ps -o pid,stat,args -p $P
  PID STAT COMMAND
 3838 S    sleep 300
$ kill -KILL $P; sleep 0.5; ps -p $P &gt; /dev/null || echo "process $P is gone"
process 3838 is gone
$ unshare --pid --fork python3 -c 'import signal, sys, time; signal.signal(signal.SIGTERM, lambda *a: sys.exit(0)); time.sleep(300)' &amp;
$ sleep 0.5; P=$(pgrep -n -x python3); grep NSpid /proc/$P/status
NSpid:	3847	1
$ kill -TERM $P; wait $!; echo "exit code: $?"
exit code: 0</div>
  <p>First, an ordinary background <code>sleep</code> receives <code>SIGTERM</code> and dies at once with exit code 143, which is 128 + 15, the shell's way of saying "killed by signal 15". Next, the same <code>sleep</code> is started as PID 1 of a new PID namespace: the <code>NSpid</code> line shows it is an ordinary PID on the host and PID 1 inside. We send it <code>SIGTERM</code>, wait two seconds, and <code>ps</code> shows it is still running, because <code>sleep</code> has no handler and the kernel protects PID 1. Only <code>SIGKILL</code> removes it. Last, a Python program that installs a <code>SIGTERM</code> handler, just like <code>board.py</code> does, is started as PID 1; this time <code>SIGTERM</code> reaches the handler, the program exits by itself, and the exit code is 0.</p>
  <p>Translated back to Docker, a container whose main process ignores <code>SIGTERM</code> makes <code>docker stop</code> wait the full 10 seconds and then kill it, and <code>docker ps -a</code> shows it as <code>Exited (137)</code>, which is 128 + 9 for <code>SIGKILL</code>. The board, with its handler, stops in a fraction of a second with exit code 0. There is one more way to fall into this trap. A Dockerfile can write the command in <strong>exec form</strong>, as a JSON list, <code>CMD ["python", "board.py"]</code>, which runs Python directly as PID 1; or in <strong>shell form</strong>, as plain text, <code>CMD python board.py</code>, which Docker runs as <code>/bin/sh -c "python board.py"</code>. In shell form the shell becomes PID 1 and Python is its child; Debian's shell neither handles <code>SIGTERM</code> nor passes it on, so Python never hears it and every stop ends in a 10-second wait and exit 137. Always use the exec form. If your program cannot handle signals itself, <code>docker run --init</code> puts a tiny init program in front of it as PID 1 whose only job is to forward signals.</p>
  <p>Finally, <code>CMD</code> versus <code>ENTRYPOINT</code>. <code>ENTRYPOINT</code> fixes the program that always runs, and <code>CMD</code> then supplies its default arguments. With <code>ENTRYPOINT ["python", "sales_report.py"]</code> and <code>CMD ["sample_orders.csv"]</code>, running <code>docker run chai-report /data/orders_2026-10-18.csv</code> replaces only the argument, so the image behaves like a command-line tool. With <code>CMD</code> alone, as in our image, whatever you type after the image name replaces the whole command, which is more flexible for an image that holds several programs.</p>

  <h2 id="sd-ports"><span class="num">07</span>Ports and Container Networking</h2>
  <p>The board is running, but the owner's phone cannot reach it. The reason is the network namespace from section 02: a container gets its own private network stack, separate from the host's. We can see what "its own network" means by listing the network interfaces (the network cards, real or virtual) on the host and inside a fresh network namespace:</p>
  <div class="fx" data-lang="text">$ cut -d: -f1 /proc/net/dev | tail -n +3
    lo
  ifb0
  ifb1
  eth0
$ unshare --net sh -c 'cut -d: -f1 /proc/net/dev | tail -n +3'
    lo</div>
  <p>The host has a loopback interface <code>lo</code> (the one behind the address 127.0.0.1, which only ever talks to the same machine), a real network card <code>eth0</code>, and two others. A new network namespace starts with nothing but its own private <code>lo</code>. Docker then adds one virtual network card to each container and connects it to a private virtual network on the host called a <strong>bridge</strong>, giving the container an internal address such as 172.17.0.2. Other containers on that bridge can reach it, but nothing from outside the host can, and the address changes whenever the container is recreated.</p>
  <p>To let the outside world in, you <strong>publish</strong> a port with <code>-p HOST_PORT:CONTAINER_PORT</code>. Docker then forwards every connection that arrives on the host's port to the container's port. (<a class="xref" data-note="cf_networking">Networking</a> explains what ports and addresses are.) Think of an office with a reception desk: visitors cannot walk into cabin 8000 directly, but they can ring reception on extension 8080, and reception forwards the call to the cabin.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="sd-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="130" height="50" rx="8" class="fs"/><text x="75" y="60" text-anchor="middle">phone / curl</text>
    <rect x="200" y="15" width="390" height="85" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="215" y="33" class="tm">host machine</text>
    <rect x="215" y="45" width="110" height="40" rx="6" class="fb sb"/><text x="270" y="70" text-anchor="middle">port 8080</text>
    <rect x="400" y="40" width="175" height="50" rx="8" class="fg sg"/><text x="487" y="62" text-anchor="middle">container</text><text x="487" y="80" text-anchor="middle" class="tm">board.py :8000</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="142" y1="65" x2="211" y2="65" marker-end="url(#sd-arr2)"/><line x1="327" y1="65" x2="396" y2="65" marker-end="url(#sd-arr2)"/></g>
    <text x="362" y="115" text-anchor="middle" class="tb">-p 8080:8000  (host:container)</text>
  </svg><figcaption>Publishing a port: connections to the host's port 8080 are forwarded to port 8000 inside the container.</figcaption></figure>
  <div class="fx" data-lang="text">$ docker run -d --name board -p 8080:8000 chai-report:1.0 python board.py
$ curl localhost:8080/health
$ curl localhost:8080/
$ docker ps --format 'table {{.Names}}\\t{{.Ports}}'</div>
  <p>With the port published, <code>curl localhost:8080/health</code> on the host prints <code>ok</code>, and <code>curl localhost:8080/</code> prints the full report starting with <code>Total sales: ₹230 from 6 valid orders, rejected: 3</code>. The <code>PORTS</code> column of <code>docker ps</code> shows the forwarding rule as <code>0.0.0.0:8080-&gt;8000/tcp</code>, meaning "any address of the host, port 8080, goes to port 8000 in the container". Note the order: host first, container second. And note that <code>EXPOSE 8000</code> in a Dockerfile publishes nothing; it is documentation, and only <code>-p</code> actually opens the door.</p>
  <p>Now the classic trap. Notice that <code>board.py</code> listens on the address given by its <code>HOST</code> setting, which defaults to <code>0.0.0.0</code>. Many frameworks' development servers instead listen on <code>127.0.0.1</code> by default. A server listening on 127.0.0.1 accepts connections only through the loopback interface, and inside a container that is the container's own private <code>lo</code>. Connections forwarded by Docker arrive on the container's virtual network card instead, so they are refused. We can reproduce the effect on this machine with no containers at all, by listening on one address and connecting through each of the machine's two addresses:</p>
  <div class="fx" data-lang="py">import socket, subprocess

my_ip = subprocess.check_output(["hostname", "-I"], text=True).split()[0]

def try_server(listen_on):
    server = socket.socket()
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((listen_on, 8000))          # what board.py's HOST setting controls
    server.listen()
    for target in ("127.0.0.1", my_ip):
        client = socket.socket()
        try:
            client.connect((target, 8000))
            result = "connected"
        except OSError as e:
            result = e.strerror
        print(f"listening on {listen_on:9}  visitor via {target:9} -&gt; {result}")
        client.close()
    server.close()

try_server("127.0.0.1")
try_server("0.0.0.0")</div>
  <div class="fx" data-lang="text">listening on 127.0.0.1  visitor via 127.0.0.1 -&gt; connected
listening on 127.0.0.1  visitor via 192.0.2.2 -&gt; Connection refused
listening on 0.0.0.0    visitor via 127.0.0.1 -&gt; connected
listening on 0.0.0.0    visitor via 192.0.2.2 -&gt; connected</div>
  <p>A server listening on 127.0.0.1 accepts a visitor coming through 127.0.0.1 but refuses one coming through the machine's network address 192.0.2.2, which is exactly the position Docker's forwarded traffic is in. A server listening on 0.0.0.0, which means "every interface I have", accepts both. Inside a container the symptom of getting this wrong is confusing, because <code>docker ps</code> shows the port mapping in place and the logs show the server running, yet <code>curl</code> fails with "Connection reset by peer". The rule is simple: <strong>servers inside containers must listen on 0.0.0.0</strong>. For uvicorn that means <code>--host 0.0.0.0</code>, for Flask <code>flask run --host=0.0.0.0</code>.</p>

  <h2 id="sd-vol"><span class="num">08</span>Volumes and Bind Mounts</h2>
  <p>Section 03 showed that a container's writable layer is thrown away with the container. That is a feature for code, but it creates two problems. The real daily order sheets live on the server, in its <code>data/</code> folder, and the <code>.dockerignore</code> deliberately kept them out of the image, so the container cannot see them. And a database running in a container must keep its files when the container is replaced by a newer one. Both are solved by mounting storage from outside into the container's filesystem, so that reads and writes at that path bypass the writable layer entirely.</p>
  <p>Docker offers three kinds. A <strong>bind mount</strong> makes a specific folder of the host appear at a path inside the container, written <code>-v /host/folder:/path/in/container</code>; adding <code>:ro</code> makes it read-only. A <strong>named volume</strong> is storage that Docker creates and manages for you, written <code>-v chai-out:/out</code>; it lives under Docker's own data folder (<code>/var/lib/docker/volumes</code>) and survives any number of containers until you delete it explicitly. A <strong>tmpfs</strong> mount (<code>--tmpfs /scratch</code>) is kept in memory and vanishes when the container stops, which is useful for fast scratch space. A hotel makes a good picture: the container is a room that is cleaned completely at checkout, a named volume is a locker in the lobby that keeps your things between stays, and a bind mount is a door from the room straight into your own house next door.</p>
  <p>A bind mount is again plain Linux underneath, so we can try it. Here a folder <code>box</code> plays the container's filesystem, with the scripts baked into <code>box/app</code>, and the host's <code>data</code> folder is mounted read-only at <code>box/data</code>:</p>
  <div class="fx" data-lang="text">$ ls data
orders_2026-10-18.csv
orders_2026-10-19.csv
$ mkdir -p box/app box/data &amp;&amp; cp sales_report.py sample_orders.csv box/app/
$ mount --bind data box/data
$ mount -o remount,bind,ro box/data
$ python3 box/app/sales_report.py box/data/orders_2026-10-18.csv 2&gt;/dev/null | head -n 1
Total sales: ₹655 from 18 valid orders, rejected: 1
$ echo "hack" &gt;&gt; box/data/orders_2026-10-18.csv
bash: line 13: box/data/orders_2026-10-18.csv: Read-only file system
$ mount --bind data box/app
$ ls box/app
orders_2026-10-18.csv
orders_2026-10-19.csv</div>
  <p>The script reads Sunday's sheet through the mount and reports ₹655 from 18 valid orders, a file that was never copied anywhere: the mount is a window onto the host's folder, not a copy. The write attempt fails with "Read-only file system", so a buggy or compromised container cannot damage the original sheets. The last two lines show a trap: mounting the data folder over <code>box/app</code> hides the scripts that were there, and <code>ls</code> now lists only the CSV files. In Docker, mounting a host folder over a path the image already uses, such as <code>/app</code>, makes the image's files at that path invisible for as long as the mount exists.</p>
  <div class="fx" data-lang="text">$ docker run --rm -v "$PWD/data":/data:ro chai-report:1.0 python sales_report.py /data/orders_2026-10-18.csv
$ docker volume create chai-out
$ docker run --rm -v "$PWD/data":/data:ro -v chai-out:/out chai-report:1.0 \\
      sh -c 'python sales_report.py /data/orders_2026-10-19.csv &gt; /out/report.txt'
$ docker run --rm -v chai-out:/out python:3.12-slim cat /out/report.txt
$ docker volume ls
$ docker volume rm chai-out</div>
  <p>With Docker, the first command prints the same ₹655 report from the bind-mounted sheet (bind mounts need an absolute host path, hence <code>"$PWD/data"</code>). <code>docker volume create</code> prints the volume's name. The third command writes a report into the volume and prints nothing; the fourth starts a completely different container from a different image, mounts the same volume, and prints the report, proving the data outlived the container that wrote it. <code>docker volume ls</code> lists volumes by driver and name, and <code>docker volume rm</code> deletes one, and its data, for good. As a rule of thumb, use bind mounts for input data and for live code during development, and named volumes for anything a container owns, such as database files. One more detail matters on Linux hosts: a file a container creates in a bind mount belongs to whichever user ID the container runs as, and by default that is root, so the host ends up with root-owned files an ordinary user cannot delete. Section 12 returns to this. (<a class="xref" data-note="cf_storage">Storage &amp; File Systems</a> explains what mounting a file system means.)</p>

  <h2 id="sd-env"><span class="num">09</span>Configuration with Environment Variables</h2>
  <p>The saver needs a database address and a password, and they differ between Meera's laptop (a test database) and the stall's server (the real one). Building a separate image for each would defeat the purpose, because the image that was tested would not be the image that runs. Worse, a password inside an image can be read by anyone who can pull the image, as section 12 demonstrates. So settings are supplied when the container starts, as environment variables, and the code reads them with <code>os.environ</code>. This is the same mechanism the Linux note uses for any process; Docker just gives you options to set the variables for the container's main process.</p>
  <p>Think of a hired cook. She arrives with her skills and her knives (the image), and each household tells her at the door where the gas is and which spices to use (the environment variables). Nobody tattoos one household's address onto her arm. On this machine, the effect of each Docker option can be shown with plain Python and the shell:</p>
  <div class="fx" data-lang="text">$ python3 -c 'import os; print(os.environ["DATABASE_URL"])' 2&gt;&amp;1 | tail -n 1
KeyError: 'DATABASE_URL'
$ DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall python3 -c 'import os; print(os.environ["DATABASE_URL"])'
postgresql://chai:chai-secret@db:5432/stall
$ cat chai.env
DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall
CURRENCY=INR
$ env $(cat chai.env) python3 -c 'import os; print(os.environ["CURRENCY"], os.environ["DATABASE_URL"])'
INR postgresql://chai:chai-secret@db:5432/stall</div>
  <p>Reading <code>os.environ["DATABASE_URL"]</code> when the variable is missing raises <code>KeyError</code>, and that is deliberate: a required setting should make the program stop at once with a clear error, rather than run on and fail later in a confusing way. Setting the variable in front of the command, as on the second line, is what <code>docker run -e DATABASE_URL=...</code> does for a container. The file <code>chai.env</code> holds several settings, one <code>NAME=value</code> per line, and loading all of them at once, as the last line does with <code>env</code>, is what <code>docker run --env-file chai.env</code> does. The Docker forms look like this:</p>
  <div class="fx" data-lang="text">$ docker run --rm -e DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall chai-report:1.0 python save_report.py 2026-10-19
$ docker run --rm --env-file chai.env chai-report:1.0 printenv CURRENCY</div>
  <p>The second command prints <code>INR</code>. The first would save the report, if a server called <code>db</code> existed, which it does not yet; the next section adds it. Variables set with <code>-e</code> or <code>--env-file</code> override defaults baked into the image with <code>ENV</code>. Use <code>ENV</code> for harmless defaults that are the same everywhere, such as <code>PYTHONUNBUFFERED=1</code> (which makes Python print log lines immediately instead of buffering them), and never for passwords. Treat files like <code>chai.env</code> as secrets: list them in <code>.gitignore</code> so they never reach Git, and in <code>.dockerignore</code> so they never reach an image, which is why our <code>.dockerignore</code> contains <code>*.env</code>.</p>

  <h2 id="sd-compose"><span class="num">10</span>Docker Compose</h2>
  <p>The saver needs a Postgres server, and the obvious way to get one is the official <code>postgres</code> image, run as a second container. That raises several questions at once. How does the saver find the database, when container addresses change on every restart? Why can't it just use <code>localhost</code>? How do we make the saver wait until Postgres is ready? Where do the database files live? And who will type, correctly and in the right order, three long <code>docker run</code> lines with all their options every time?</p>
  <p>The address question has a neat answer. When containers are attached to a <strong>user-defined network</strong> (one you create, rather than Docker's default bridge), Docker runs a small DNS service for them, so every container can reach every other one <em>by its name</em>. If the database container is called <code>db</code>, the saver connects to <code>db:5432</code> and Docker resolves the name to whatever the current address is. Think of an office intercom: you dial "Accounts" and it rings the right desk, even if Accounts moved floors yesterday. And <code>localhost</code> does not work for the reason section 07 showed: each container has its own private loopback interface, so inside the saver's container <code>localhost</code> means the saver's own container, where no Postgres is running, and the connection is refused.</p>
  <p><strong>Docker Compose</strong> answers the remaining questions. It is a tool, run as <code>docker compose</code>, that reads one YAML file describing all the containers of an application, together with their settings, network and volumes, and starts or stops them all with one command. Each entry under <code>services</code> becomes one container, and its name becomes that container's DNS name on a network Compose creates automatically. Here is the stall's <code>compose.yaml</code>, and the <code>.env</code> file next to it, which Compose reads to fill in <code>\${DB_PASSWORD}</code>:</p>
  <div class="fx" data-lang="text">name: chai

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
  pgdata:</div>
  <div class="fx" data-lang="text">DB_PASSWORD=chai-secret</div>
  <p>Go through it service by service. <code>db</code> runs the official <code>postgres:16-alpine</code> image; that image reads the variables <code>POSTGRES_USER</code>, <code>POSTGRES_PASSWORD</code> and <code>POSTGRES_DB</code> on its first start and creates that user and database. Its data folder is a named volume, <code>pgdata</code>, declared at the bottom of the file, so the table survives when the container is replaced. Its <code>healthcheck</code> tells Docker to run <code>pg_isready</code> inside the container every 2 seconds, up to 10 times, and to mark the container "healthy" once it succeeds. <code>report</code> is our saver: <code>build: .</code> tells Compose how to build <code>chai-report:1.0</code> from our Dockerfile, <code>command</code> replaces the image's default <code>CMD</code>, <code>DATABASE_URL</code> uses the host name <code>db</code>, the real sheets are bind-mounted read-only, and <code>depends_on</code> with <code>condition: service_healthy</code> makes Compose wait for the healthcheck before starting it. <code>board</code> reuses the same image to run the web board on the real Monday sheet, published on port 8080. One image, two very different containers: exactly the class-and-object relationship from section 03.</p>
  <p>The healthcheck is not optional decoration. A plain <code>depends_on: [db]</code> only controls the <em>order</em> in which containers start. Postgres needs a few seconds after its container starts before it accepts connections, so without the healthcheck the saver would start, try to connect too early, and crash on a cold start. Even with it, long-running applications should retry their database connection, because a database can also restart later.</p>
  <div class="fx" data-lang="text">$ docker compose up -d
$ docker compose ps -a
$ docker compose logs report
$ docker compose exec db psql -U chai -d stall -c "SELECT * FROM daily_sales;"
$ docker compose run --rm report python save_report.py 2026-10-18
$ docker compose down
$ docker compose down -v</div>
  <p>Here is what each of these prints. <code>up -d</code> builds the image if needed, creates the network <code>chai_default</code> and the volume <code>chai_pgdata</code>, and prints a progress line per container: <code>chai-db-1</code> and <code>chai-board-1</code> start at once, then <code>chai-db-1</code> shows <code>Waiting</code> and <code>Healthy</code>, and only after that does <code>chai-report-1</code> start. <code>ps -a</code> lists the three services: <code>board</code> up with <code>0.0.0.0:8080-&gt;8000/tcp</code>, <code>db</code> up and marked <code>(healthy)</code>, and <code>report</code> as <code>Exited (0)</code>, because it is a one-shot job that did its work and finished. <code>logs report</code> prints that job's output, prefixed with the container's name: <code>saved 2026-10-19: ₹230 from 6 valid orders, rejected: 3</code>. <code>exec db psql ...</code> runs the Postgres command-line client inside the database container and prints the table with one row, <code>2026-10-19 | 230 | 6 | 3</code>. <code>run --rm report ...</code> starts a one-off extra container of the <code>report</code> service, with all its settings, to save Sunday's sheet as well, printing <code>saved 2026-10-18: ₹655 from 18 valid orders, rejected: 1</code>.</p>
  <p>The last two commands are the ones to understand before you use Compose on a real server. <code>down</code> stops and removes the containers and the network but <strong>keeps named volumes</strong>, so after the next <code>up</code> the <code>daily_sales</code> table still holds both rows. <code>down -v</code> also deletes the volumes, and with them every row in the database. It is handy for resetting a development setup and a disaster if typed out of habit on a server. Compose is the standard tool for running a multi-container application on one machine, for local development and for small servers; when an application must run across many machines, with automatic restarts and scaling, the same images are handed to <a class="xref" data-note="mlops_k8s">Kubernetes</a>, whose concepts (services found by name, volumes, configuration injected at run time) are direct descendants of what you see here.</p>

  <h2 id="sd-reg"><span class="num">11</span>Registries, Tags and Digests</h2>
  <p>The stack works on the machine that built the image. The stall's server must now run exactly the same image, and rebuilding it there is not the answer: a rebuild on another day can pick up a newer base image or a different package and produce a subtly different image from the one that was tested. Images are moved instead, through a <strong>registry</strong>, a server that stores images the way GitHub stores code. You <strong>push</strong> an image to it from your laptop or your CI system, and servers <strong>pull</strong> it. Docker Hub is the default public registry; companies typically use GitHub Container Registry (<code>ghcr.io</code>), AWS ECR, Google Artifact Registry or a private registry of their own.</p>
  <p>An image's full name says where it lives: <code>registry-host/repository:tag</code>, for example <code>ghcr.io/chai-stall/chai-report:1.0.0</code>. If you leave out the host, Docker assumes Docker Hub, which is why <code>python:3.12-slim</code> really means <code>docker.io/library/python:3.12-slim</code>. If you leave out the tag, Docker assumes the tag <code>latest</code>. A <strong>tag</strong> is just a human-friendly label that points at one image, and it can be moved to point at a different image at any time. A <strong>digest</strong> is the image's true identity: a SHA-256 fingerprint computed from its content, written <code>sha256:</code> followed by 64 hexadecimal characters. Layers are identified the same way, which is how a registry knows that it already has a layer and need not upload it again. The idea is easy to check with a layer-like archive of our app folder:</p>
  <div class="fx" data-lang="text">$ tar --sort=name --mtime=@0 -C layer-app -cf - . | sha256sum
7778c3e44ca2bf89306450d38a2f4874b98be6799bebd027cd526512e1edcb47  -
$ tar --sort=name --mtime=@0 -C layer-app -cf - . | sha256sum
7778c3e44ca2bf89306450d38a2f4874b98be6799bebd027cd526512e1edcb47  -
$ echo "# shown on the stall's phone" &gt;&gt; layer-app/app/sales_report.py
$ tar --sort=name --mtime=@0 -C layer-app -cf - . | sha256sum
b468746bf0571915a6318c573cb98bd543b6aac60a576fea907d8c579307e926  -</div>
  <p>Packing the same files twice gives the same fingerprint, character for character, so identical content always has the same digest no matter who builds it or when. Adding one comment line to the script gives a completely different fingerprint. That is why a digest names exact content and can never be reused for anything else, while a tag is a sticker that can be peeled off and put on another image. Libraries offer a good comparison: the stickers "Edition 1.0" and "New arrival" both sit on book spines, but next month "New arrival" will be on a different book.</p>
  <div class="fx" data-lang="text">$ docker tag chai-report:1.0 ghcr.io/chai-stall/chai-report:1.0.0
$ docker push ghcr.io/chai-stall/chai-report:1.0.0
$ docker pull ghcr.io/chai-stall/chai-report:1.0.0
$ docker pull ghcr.io/chai-stall/chai-report@sha256:&lt;digest printed by push&gt;</div>
  <p><code>docker tag</code> prints nothing and copies nothing; it just adds a second name for the same image ID, as <code>docker images</code> would show by listing both names with one ID. <code>docker push</code> uploads only the layers the registry does not already have, printing one line per layer (<code>Pushed</code> or <code>Layer already exists</code>), and ends with a line like <code>1.0.0: digest: sha256:… size: 856</code>. <code>docker pull</code> on the server downloads the layers it lacks and prints the digest and <code>Status: Downloaded newer image for ...</code>. Pulling by digest instead of by tag guarantees byte-identical content.</p>
  <p>This is why <code>:latest</code> is dangerous in production. Despite its name, it does not mean "newest"; it is only the default tag, and it moves whenever anyone pushes an image under it. Two servers that pull <code>latest</code> a day apart may be running different code, and when something breaks there is no record of what "the previous latest" was to roll back to. The professional habit is to tag each image with something that never moves and that ties it to the code: the Git tag (<code>1.0.0</code> for the Git note's <code>v1.0.0</code>) or the commit's SHA, and to deploy that tag or the digest. <a class="xref" data-note="mlops_cicd">CI/CD for ML</a> shows pipelines that build, tag and push images this way automatically on every merge.</p>

  <h2 id="sd-small"><span class="num">12</span>Small, Safe Images</h2>
  <p>The image works and travels. The last step is making it lean and safe, because every server pulls every byte of it, and everything inside it is something an attacker could use or read. Real projects often need tools at build time that are useless at run time: a C compiler and header files to compile a package, pip's caches, downloaded installer files. A <strong>multi-stage build</strong> keeps them out of the final image. The Dockerfile contains several <code>FROM</code> lines, each starting a new stage. An early stage, often called the builder, installs everything; the final stage starts again from a clean base and copies in only the finished result with <code>COPY --from=builder</code>. Only the last stage becomes the image, and everything else in the builder is simply left behind.</p>
  <div class="fx" data-lang="text"># ---- stage 1: build the virtual environment ----
FROM python:3.12-slim AS builder
COPY requirements.txt .
RUN python -m venv /opt/venv &amp;&amp; \\
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# ---- stage 2: the small runtime image ----
FROM python:3.12-slim
RUN useradd --create-home app
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY sales_report.py board.py save_report.py sample_orders.csv ./
ENV PATH="/opt/venv/bin:$PATH" PYTHONUNBUFFERED=1
USER app
CMD ["python", "sales_report.py", "sample_orders.csv"]</div>
  <p>The builder stage creates a virtual environment in <code>/opt/venv</code> and installs the requirements into it; if a package had to be compiled, this is where a line such as <code>RUN apt-get install -y gcc libpq-dev</code> would go, and none of it would reach the final image. The second stage starts again from <code>python:3.12-slim</code>, creates an ordinary user called <code>app</code>, copies the whole venv across in one piece, copies our scripts, puts the venv's <code>bin</code> folder first on the <code>PATH</code> so that <code>python</code> means the venv's Python, and switches to the <code>app</code> user. One caution: copying a venv between stages only works when both stages use the same base image, so that paths and system libraries match.</p>
  <p>Why not stay with one stage and delete the build tools in a final <code>RUN rm</code>? Because of how layers work. A later layer cannot change an earlier one; deleting a file only adds a whiteout that hides it, and the earlier layer, file included, is still part of the image and is still downloaded by every server. We can see the size effect with archives laid out the way image layers are stored, where a whiteout is an empty file named <code>.wh.</code> followed by the hidden file's name:</p>
  <div class="fx" data-lang="text">$ mkdir -p run1-layer/tmp run2-layer/tmp single-run-layer/tmp
$ head -c 50000000 /dev/urandom &gt; run1-layer/tmp/big.bin
$ touch run2-layer/tmp/.wh.big.bin
$ sh -c 'head -c 50000000 /dev/urandom &gt; single-run-layer/tmp/big.bin &amp;&amp; rm single-run-layer/tmp/big.bin'
$ tar -C run1-layer -cf run1-layer.tar . ; tar -C run2-layer -cf run2-layer.tar . ; tar -C single-run-layer -cf single-run-layer.tar .
$ ls -lh run1-layer.tar run2-layer.tar single-run-layer.tar
-rw-r--r-- 1 root root 48M Nov 19 05:51 run1-layer.tar
-rw-r--r-- 1 root root 10K Nov 19 05:51 run2-layer.tar
-rw-r--r-- 1 root root 10K Nov 19 05:51 single-run-layer.tar
$ tar -tvf run2-layer.tar
drwxr-xr-x root/root         0 2026-11-19 05:51 ./
drwxr-xr-x root/root         0 2026-11-19 05:51 ./tmp/
-rw-r--r-- root/root         0 2026-11-19 05:51 ./tmp/.wh.big.bin</div>
  <p>The two-step version produces two layers: the first holds the 50 MB file (48 MB as <code>ls -h</code> counts it), and the second holds nothing but the tiny whiteout marker <code>.wh.big.bin</code>, as <code>tar -tvf</code> shows. Together they still weigh 48 MB, although the file is "deleted". When the file is created and deleted within one single command, the layer records only the end state, and the archive is just 10 KB of headers. The rule follows directly: create and clean up temporary files in the same <code>RUN</code> instruction (for example <code>RUN apt-get update &amp;&amp; apt-get install -y gcc &amp;&amp; rm -rf /var/lib/apt/lists/*</code>), or better, leave them in a builder stage.</p>
  <p>The same fact about layers makes secrets in images dangerous. It is tempting to write <code>ENV DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall</code> in a Dockerfile, or to <code>COPY</code> an env file into the image. But an image is just a set of layer archives plus a configuration file, and anyone who can pull it can unpack them:</p>
  <div class="fx" data-lang="text">$ mkdir -p secret-layer/app &amp;&amp; cp chai.env secret-layer/app/.env
$ tar -C secret-layer -cf layer.tar .
$ tar -tf layer.tar
./
./app/
./app/.env
$ tar -xOf layer.tar ./app/.env
DATABASE_URL=postgresql://chai:chai-secret@db:5432/stall
CURRENCY=INR</div>
  <p>Unpacking the layer prints the password in plain text, with no Docker involved. An <code>ENV</code> line is just as visible: it is stored in the image's configuration, so <code>docker history</code> prints it in the "created by" column and <code>docker run IMAGE printenv</code> prints its value. Deleting the secret in a later layer does not help, for the whiteout reason above. Secrets belong at run time (<code>-e</code>, <code>--env-file</code>, Compose variables from an untracked <code>.env</code>, Kubernetes secrets or a secret manager), and if a password ever does end up in a pushed image, change the password: old copies of the image may already be cached on other machines.</p>
  <p>Finally, the user. Unless the Dockerfile says otherwise, the process in a container runs as root, user ID 0. If an attacker breaks into the application, they are root inside the container, one kernel bug away from the host, and any file the container writes into a bind mount is owned by root on the host. That is why <code>Dockerfile.multi</code> creates the user <code>app</code> and switches to it with <code>USER app</code>: <code>docker run chai-report:multi id</code> would print <code>uid=1000(app) gid=1000(app)</code> instead of <code>uid=0(root)</code>, and that process could not even write into a host folder owned by root, the Linux permissions you know from the Linux note now protecting the host. Many Kubernetes clusters refuse to run root containers at all.</p>
  <p>Put together, the habits of a production image are short to state. Pin the base image and every package, so the same Dockerfile builds the same image next month. Deploy version tags or digests, never <code>:latest</code>. Keep secrets out of every layer. Run as a non-root user. Use exec-form <code>CMD</code> and handle <code>SIGTERM</code>, so stops are clean. Run one main process per container, log to standard output, and give servers a health endpoint, so that Compose or Kubernetes can watch and restart them. Keep large data and model files out of the image, in volumes or object storage, so that changing a model does not mean rebuilding and shipping gigabytes. And set memory limits deliberately (<code>-m</code>, or limits in Compose and Kubernetes), remembering that a container that exceeds its limit is killed by the kernel with exit code 137 and no Python traceback at all.</p>

  <h2 id="sd-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common slow-build mistake is copying the whole project before installing the dependencies. Every code edit then changes the <code>COPY</code> layer, and the expensive install layer on top of it is rebuilt each time, as section 05's model showed. The fix is to copy the requirements file alone first:</p>
  <div class="fx" data-lang="text"># Wrong: any code edit reinstalls every package
COPY . .
RUN pip install --no-cache-dir -r requirements.txt

# Right: the install layer stays cached until requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .</div>
  <p>The most common "it runs but I can't reach it" mistake is a server listening on 127.0.0.1 inside the container. <code>docker ps</code> shows the port mapping, the logs look healthy, and <code>curl</code> still fails with "Connection reset by peer", because forwarded traffic arrives on the container's network card, not on its loopback. Make the server listen on <code>0.0.0.0</code>. Its twin is using <code>localhost</code> to reach another container: <code>localhost</code> is always the container itself, so a saver with <code>DATABASE_URL=...@localhost:5432/...</code> gets "connection refused". Use the other container's service name on a shared network, <code>db:5432</code>.</p>
  <p>A shell-form command makes every stop slow and violent:</p>
  <div class="fx" data-lang="text"># Wrong: /bin/sh is PID 1, SIGTERM never reaches Python, stop waits 10 s, exit 137
CMD python board.py

# Right: Python is PID 1 and receives SIGTERM directly
CMD ["python", "board.py"]</div>
  <p>Several mistakes come from forgetting that a container's writable layer is temporary. Data a container writes to its own filesystem disappears with <code>docker rm</code>, so anything that must persist needs a volume. Fixing a problem by running <code>docker exec ... pip install</code> inside a running container repairs only that one container, and the fix vanishes on the next deployment; every change belongs in the Dockerfile, followed by a rebuild. And <code>docker compose down -v</code> deletes named volumes, including the database.</p>
  <p>In Compose, writing <code>depends_on: [db]</code> without a healthcheck only orders the start-up; it does not wait for Postgres to be ready, so the saver fails on a cold start. Use a healthcheck with <code>condition: service_healthy</code>, and still retry connections in long-running programs:</p>
  <div class="fx" data-lang="text"># Wrong: only waits for the db container to start
depends_on: [db]

# Right: waits for the db healthcheck to pass
depends_on:
  db:
    condition: service_healthy</div>
  <p>Finally, three habits cause trouble months later rather than today. Secrets written with <code>ENV</code> or copied in with <code>COPY</code> are readable by anyone who has the image. Deploying <code>:latest</code> means you cannot say which code is running or roll back to the previous version. And unpinned dependencies, including indirect ones such as psycopg's <code>typing-extensions</code>, let two builds of the same Dockerfile produce different images.</p>

  <h2 id="sd-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core definitions</h3>
  <ul>
    <li><b>Containerisation</b>: shipping a program together with its whole environment so it runs identically everywhere.</li>
    <li><b>Container</b>: an ordinary process isolated with <b>namespaces</b> (own PIDs, hostname, network, mounts) and limited by <b>cgroups</b> (memory, CPU), sharing the host kernel.</li>
    <li><b>Image</b>: read-only stack of layers + metadata (default command, env, user). <b>Layer</b>: the file changes made by one build step.</li>
    <li><b>Writable layer</b>: each container's private top layer; deleted with the container. Changes use copy-on-write; deletions are whiteouts.</li>
    <li><b>Docker client / daemon</b>: <code>docker</code> sends requests over <code>/var/run/docker.sock</code> to <code>dockerd</code>, which does the work.</li>
    <li><b>Build context</b>: the folder sent to the build; <code>.dockerignore</code> excludes paths from it.</li>
    <li><b>Registry</b>: server that stores images. <b>Tag</b>: movable label. <b>Digest</b>: <code>sha256:…</code> of the content, never changes.</li>
  </ul>
  <h3>Container vs VM vs virtualenv</h3>
  <table class="tbl">
    <tr><th></th><th>Virtual machine</th><th>Container</th><th>virtualenv</th></tr>
    <tr><td>Isolates</td><td>a whole computer</td><td>a process's view of files, PIDs, network</td><td>Python packages only</td></tr>
    <tr><td>Kernel</td><td>its own</td><td>shares the host's</td><td>the host's</td></tr>
    <tr><td>Size, start-up</td><td>GBs, tens of seconds to minutes</td><td>MBs, under a second</td><td>MBs, instant</td></tr>
    <tr><td>Isolation strength</td><td>strong</td><td>weaker (shared kernel)</td><td>none (same OS)</td></tr>
  </table>
  <h3>Dockerfile</h3>
  <div class="fx" data-lang="text">FROM python:3.12-slim AS builder        # base image; name the stage
RUN python -m venv /opt/venv            # build-time command → layer
COPY requirements.txt .                 # from build context
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim                   # final stage: only this is shipped
RUN useradd --create-home app
WORKDIR /app                            # mkdir + cd
COPY --from=builder /opt/venv /opt/venv # take only the result
COPY . .                                # code last (cache)
ENV PATH="/opt/venv/bin:$PATH" PYTHONUNBUFFERED=1
USER app                                # not root
EXPOSE 8000                             # documentation only
CMD ["python", "board.py"]              # exec form, default command</div>
  <h3>Commands</h3>
  <table class="tbl">
    <tr><th>Command</th><th>What it does</th></tr>
    <tr><td><code>docker build -t name:tag .</code></td><td>build an image from the Dockerfile in <code>.</code></td></tr>
    <tr><td><code>docker run --rm -d --name N -p 8080:8000 -v SRC:/dst[:ro] -e K=V IMG [cmd]</code></td><td>start a container (options as needed)</td></tr>
    <tr><td><code>docker ps -a</code> / <code>docker images</code></td><td>list containers / images</td></tr>
    <tr><td><code>docker logs -f N</code> / <code>docker exec -it N sh</code></td><td>follow output / shell inside a running container</td></tr>
    <tr><td><code>docker stop N</code></td><td>SIGTERM, then SIGKILL after 10 s</td></tr>
    <tr><td><code>docker rm</code> / <code>docker rmi</code></td><td>delete container / image</td></tr>
    <tr><td><code>docker history IMG</code> / <code>docker diff N</code></td><td>layers and sizes / a container's changes</td></tr>
    <tr><td><code>docker tag</code>, <code>push</code>, <code>pull</code></td><td>name, upload, download images</td></tr>
    <tr><td><code>docker compose up -d</code> / <code>ps -a</code> / <code>logs</code> / <code>exec</code> / <code>run --rm</code></td><td>start stack / status / output / command in service / one-off job</td></tr>
    <tr><td><code>docker compose down</code> / <code>down -v</code></td><td>remove containers + network / also delete volumes</td></tr>
  </table>
  <h3>Run-time plumbing</h3>
  <ul>
    <li><b>Ports</b>: <code>-p HOST:CONTAINER</code>; the app must listen on <code>0.0.0.0</code>.</li>
    <li><b>Bind mount</b> <code>-v /host/dir:/path[:ro]</code>: host folder inside; for input data and live code.</li>
    <li><b>Named volume</b> <code>-v name:/path</code>: Docker-managed, survives containers; for databases.</li>
    <li><b>Config</b>: <code>-e</code>, <code>--env-file</code>, Compose <code>environment:</code>; <code>ENV</code> only for harmless defaults.</li>
    <li><b>Networking</b>: on a user-defined or Compose network, containers reach each other by name; <code>localhost</code> = the container itself.</li>
    <li><b>Exit codes</b> pass through <code>docker run</code>; 137 = SIGKILL (stop timeout or out of memory), 143 = SIGTERM.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>COPY . .</code> before <code>pip install</code> → every edit reinstalls everything.</li>
    <li>A changed step rebuilds itself and every later step.</li>
    <li>Shell-form <code>CMD</code> → <code>sh</code> is PID 1 → 10-second stop, exit 137.</li>
    <li>PID 1 ignores signals it has no handler for.</li>
    <li>Server on 127.0.0.1 inside a container → "connection reset".</li>
    <li>Files written in the container layer vanish on <code>docker rm</code>; <code>down -v</code> deletes volumes.</li>
    <li><code>depends_on</code> alone does not wait for readiness; add a healthcheck.</li>
    <li>Deleting a file in a later layer does not shrink the image.</li>
    <li>Secrets in <code>ENV</code>/<code>COPY</code> are readable from the image.</li>
    <li><code>:latest</code> moves; deploy version tags or digests.</li>
  </ul>

  <h2 id="sd-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is Docker, and what problem does it solve?</summary><div class="qa-body">Docker packages an application together with its runtime environment (OS libraries, language version, dependencies, default configuration) into an image, and runs that image as an isolated container on any machine with Docker. It solves the "works on my machine" problem, where code fails elsewhere because the interpreter, libraries, services or settings differ. It also makes deployments repeatable, because the exact image that was tested is the one that runs in production.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a container and a virtual machine?</summary><div class="qa-body">A VM emulates a whole computer and boots its own operating-system kernel, so it is heavy (gigabytes) and slow to start, but strongly isolated. A container is an ordinary process isolated by the host kernel's namespaces and limited by cgroups; it shares the host kernel, so it is light and starts in under a second, but isolation is weaker. You can see this because <code>uname -r</code> prints the host's kernel version inside a container.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between an image and a container?</summary><div class="qa-body">An image is a read-only template made of layers plus metadata such as the default command. A container is a running (or stopped) instance created from an image, with its own writable layer, process and network. One image can run as many containers at once, and none of them change the image, much like a class and its objects.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are namespaces and cgroups?</summary><div class="qa-body">Both are Linux kernel features. Namespaces give a process its own private view of a global resource: its own process list (PID), hostname (UTS), network interfaces (net), mount points (mnt) and more. Cgroups limit and measure the resources a group of processes may use, such as memory and CPU. A container is a process started in new namespaces inside a cgroup, with its own root filesystem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an image layer, and how does the build cache work?</summary><div class="qa-body">Each Dockerfile instruction that changes files produces a layer containing just those changes. Docker caches each layer under a key made from the parent layer, the instruction text and, for <code>COPY</code>/<code>ADD</code>, a checksum of the copied files. If the key matches on the next build, the layer is reused; once one step misses, every later step is rebuilt because its parent changed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every small code change makes the build reinstall all packages. Why, and how do you fix it?</summary><div class="qa-body">The Dockerfile copies the whole project before <code>pip install</code>, so any code edit changes the <code>COPY</code> layer and invalidates the install layer above it. Copy <code>requirements.txt</code> on its own, run the install, and copy the code afterwards. In general, order instructions from least to most frequently changing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>CMD</code> and <code>ENTRYPOINT</code>? Between exec form and shell form?</summary><div class="qa-body"><code>ENTRYPOINT</code> fixes the executable that always runs; <code>CMD</code> provides the default command or default arguments, which anything after the image name in <code>docker run</code> replaces. Exec form, a JSON list like <code>["python", "app.py"]</code>, runs the program directly as PID 1. Shell form, plain text, runs it via <code>/bin/sh -c</code>, so the shell is PID 1 and signals may never reach the app.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>docker stop</code> sometimes take 10 seconds and leave exit code 137?</summary><div class="qa-body"><code>docker stop</code> sends SIGTERM to the container's PID 1, waits 10 seconds, then sends SIGKILL; 137 is 128 + 9, killed by SIGKILL. It happens when PID 1 does not handle SIGTERM: the kernel ignores unhandled signals for PID 1, and a shell-form <code>CMD</code> puts <code>sh</code>, which does not forward the signal, in front of the app. Use exec form, handle SIGTERM in the app, or run with <code>--init</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>-p 8080:8000</code> do, and what does <code>EXPOSE</code> do?</summary><div class="qa-body"><code>-p 8080:8000</code> publishes a port: connections to port 8080 on the host are forwarded to port 8000 inside the container (host first, container second). <code>EXPOSE 8000</code> in a Dockerfile only documents which port the app uses; it publishes nothing by itself.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your container is running and the port is mapped, but <code>curl</code> from the host gets "connection reset". What is the likely cause?</summary><div class="qa-body">The server inside is listening on 127.0.0.1, which inside a container means the container's own loopback interface. Forwarded traffic arrives on the container's virtual network card, so it is refused. Make the server listen on 0.0.0.0. Other causes to check are a reversed <code>-p</code> mapping and an app that crashed or is still starting (<code>docker logs</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a bind mount and a named volume?</summary><div class="qa-body">A bind mount makes a specific host folder appear inside the container; it is tied to that host's paths and permissions and is ideal for input data and live code in development. A named volume is storage created and managed by Docker that survives containers and does not depend on host paths; it is the normal choice for database files. Both bypass the container's writable layer, so their data outlives the container.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A container writes <code>/tmp/x.txt</code> and is removed. A new container from the same image runs <code>cat /tmp/x.txt</code>. What happens?</summary><div class="qa-body">It fails with "No such file or directory". The file lived in the first container's writable layer, which was deleted with it, and every new container starts from the unchanged image. Data that must persist belongs in a volume.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do containers in Docker Compose talk to each other? Why doesn't <code>localhost</code> work?</summary><div class="qa-body">Compose puts all services on one network with built-in DNS, so each service is reachable by its service name, for example <code>db:5432</code>, whatever its current IP address. <code>localhost</code> inside a container refers to that container's own network namespace, so connecting to <code>localhost:5432</code> from the app reaches the app's own container, where no database runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does <code>depends_on</code> make a service wait until the database is ready?</summary><div class="qa-body">Not by itself: it only controls start order, and a database needs a few seconds after starting before it accepts connections. Add a <code>healthcheck</code> to the database (for Postgres, <code>pg_isready</code>) and use <code>depends_on</code> with <code>condition: service_healthy</code>. Applications should still retry connections, since the database can restart later.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a tag and a digest? Why avoid <code>:latest</code> in production?</summary><div class="qa-body">A tag is a movable, human-friendly label; a digest is a SHA-256 hash of the image content and always refers to exactly the same bytes. <code>latest</code> is just the default tag and moves whenever someone pushes it, so two servers can run different code under the same name and there is nothing to roll back to. Deploy immutable tags tied to the code, such as the Git tag or commit SHA, or pin the digest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a multi-stage build and why use it?</summary><div class="qa-body">A Dockerfile with several <code>FROM</code> stages: an early builder stage installs or compiles everything, and the final stage starts from a clean base and copies in only the results with <code>COPY --from=builder</code>. Only the final stage is shipped, so compilers, caches and installers stay out of the image. The result is smaller, faster to pull and has less for an attacker to use.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You deleted a large file in a later <code>RUN</code>, but the image did not get smaller. Why?</summary><div class="qa-body">Layers are immutable and stacked. The layer that created the file still contains it, and the later layer only adds a whiteout marker that hides it, so the bytes are still shipped. Create and delete temporary files within the same <code>RUN</code>, or keep them in a builder stage of a multi-stage build.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should you pass a database password to a container?</summary><div class="qa-body">At run time: <code>-e</code> or <code>--env-file</code>, Compose variables from an untracked <code>.env</code> file, Kubernetes secrets or a secret manager. Never put it in <code>ENV</code> or <code>COPY</code> it into the image, because image layers and configuration can be read by anyone who can pull the image, for example with <code>docker history</code>. If a secret does leak into an image, rotate it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why run containers as a non-root user?</summary><div class="qa-body">By default the container process is root (uid 0). If the app is compromised, the attacker is root inside the container and closer to escaping to the host, and files written to bind mounts become root-owned on the host. Creating a user and adding <code>USER app</code> limits the damage, and many clusters require it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do Docker Compose and Kubernetes relate?</summary><div class="qa-body">Both run containers from images. Compose describes a multi-container application on a single machine in one YAML file and is used for local development and small deployments. Kubernetes runs containers across a cluster of machines, with scheduling, self-healing restarts, scaling and rolling updates; it uses the same images and similar ideas, such as services found by name, volumes and injected configuration.</div></details>
</main>
`
});
