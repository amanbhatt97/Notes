// notes/softeng/se_docker.js — Docker
Object.assign(TOPIC_CONTENT, {
  "se_docker": `<main>
  <h1>Docker</h1>
  <p class="lead">Docker packs your model, your code, the exact Python version and every system library into one sealed box called an image. That box runs the same on your laptop, in CI and on a cloud server. It is the standard way ML APIs are shipped, and Kubernetes and most MLOps tools are built on it. Builds on <a class="xref" data-note="se_linux">Linux &amp; Terminal</a> (processes, signals, env vars, ports, exit codes).</p>

  <h2 id="sd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Docker</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why Docker</div>
        <ul>
          <li><b>Problem</b> — "works on my machine": Python, package, system-library and env-var drift</li>
          <li><b>Example</b> — sklearn 1.6 pickle fails on 1.3; missing libgomp crashes LightGBM</li>
          <li><b>Flow</b> — Dockerfile → <code>docker build</code> → image → <code>docker run</code> → container</li>
          <li><b>Container vs VM</b> — isolated process on the host kernel (MBs, seconds) vs full guest OS (GBs, minutes)</li>
          <li><b>vs virtualenv</b> — venv isolates Python packages only, not Python or system libs</li>
          <li>💡 shipping container: every crane and ship handles the same box</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Images vs containers</div>
        <ul>
          <li><b>Image</b> — read-only layered template (like a class); <code>build</code>/<code>pull</code>, list <code>docker images</code></li>
          <li><b>Container</b> — running/stopped instance (object) + thin writable layer; list <code>docker ps -a</code></li>
          <li><b>One image → many containers</b> (different ports, tests)</li>
          <li><b><code>docker diff</code></b> — what a container changed</li>
          <li>⚠ <b>Container writes are throwaway</b> — new container = clean image</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dockerfile &amp; layers</div>
        <ul>
          <li><b>Keys</b> — <code>FROM</code>, <code>WORKDIR</code>, <code>COPY</code>, <code>RUN</code>, <code>ENV</code>, <code>USER</code>, <code>EXPOSE</code>, <code>CMD</code></li>
          <li><b>Each instruction = cached layer</b>; a change rebuilds that layer + all after it</li>
          <li><b>Order</b> — FROM → COPY requirements.txt → RUN pip install → COPY code last (0.4 s vs 39 s rebuild)</li>
          <li><b>Multi-stage</b> — <code>FROM … AS builder</code> installs/trains; final stage <code>COPY --from=builder</code> only venv + model</li>
          <li><b>Slim base</b> — <code>python:3.12-slim</code>; Alpine (musl) often breaks numpy/torch wheels</li>
          <li><b>.dockerignore</b> — keep .git, .venv, data/, .env out of the build context</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Build, run, ports, env</div>
        <ul>
          <li><b>Build</b> — <code>docker build -t iris-api:1.0 .</code></li>
          <li><b>Run</b> — <code>docker run -d --name iris -p 8080:8000 -e KEY=val img</code>; <code>--rm</code> auto-delete</li>
          <li><b><code>-p host:container</code></b> — opens a host port into the container</li>
          <li><b>Debug</b> — <code>docker logs -f</code>, <code>docker exec -it NAME bash</code>, <code>docker ps</code></li>
          <li><b>Lifecycle</b> — <code>stop</code> (SIGTERM, then SIGKILL after 10 s) / <code>rm</code> / <code>rmi</code></li>
          <li><b>CMD exec form</b> <code>["uvicorn", …]</code> → app is PID 1, stops in 0 s; shell form waits 10 s → 137</li>
          <li>⚠ App must listen on <code>0.0.0.0</code>, not <code>127.0.0.1</code> → else "connection reset"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Volumes</div>
        <ul>
          <li><b>Named volume</b> — <code>-v mldata:/data</code>; Docker-managed, outlives containers (DB files, metrics)</li>
          <li><b>Bind mount</b> — <code>-v "$PWD/data":/data</code>; a host folder inside (dev, local datasets)</li>
          <li><b>tmpfs</b> — <code>--tmpfs /scratch</code>; in RAM, gone on stop</li>
          <li>💡 container = hotel room cleaned at checkout; volume = locker in the lobby</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Networking</div>
        <ul>
          <li><b>User-defined network</b> — <code>docker network create mlnet</code>; containers find each other by <b>name</b> (built-in DNS)</li>
          <li><b>Default network</b> — names don't resolve ("Name or service not known")</li>
          <li><b>Container → container</b> uses the container port (<code>api:8000</code>); <code>-p</code> is only for the host</li>
          <li>⚠ <code>localhost</code> inside a container = that container itself → use <code>db:5432</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Docker Compose</div>
        <ul>
          <li><b>What</b> — many containers (api + Postgres + Redis) in one <code>compose.yaml</code></li>
          <li><b>Keys</b> — <code>services</code>, <code>image</code>/<code>build</code>, <code>ports</code>, <code>environment</code>, <code>volumes</code>, <code>healthcheck</code>, <code>depends_on</code></li>
          <li><b>Auto network</b> — services reach each other by service name</li>
          <li><b>Commands</b> — <code>up -d</code>, <code>ps</code>, <code>exec svc cmd</code>, <code>logs</code>, <code>down</code> (keeps volumes) / <code>down -v</code> (deletes)</li>
          <li>⚠ Plain <code>depends_on</code> only orders start-up → healthcheck + <code>service_healthy</code> + retry in code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Registries &amp; tags</div>
        <ul>
          <li><b>Flow</b> — build → <code>docker tag img registry/user/name:1.1</code> → <code>push</code> → server <code>pull</code> → run</li>
          <li><b>Tag = label</b>; one image ID can have many names</li>
          <li><b>Registries</b> — Docker Hub, ghcr.io, AWS ECR, GCP Artifact Registry</li>
          <li><b>Digest</b> — <code>sha256:…</code> = exact, unchangeable content</li>
          <li>⚠ <code>:latest</code> = default tag, movable, not "newest" → deploy version / git-SHA tags</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ML best practices</div>
        <ul>
          <li><b>Pin everything</b> — base image + <code>==</code> for every package (incl. numpy/scipy) or a lockfile</li>
          <li><b>Small</b> — slim + multi-stage + <code>--no-cache-dir</code>; inspect with <code>docker history</code></li>
          <li><b>Non-root</b> — <code>USER appuser</code></li>
          <li><b>No secrets in image</b> — <code>docker history</code> shows ENV values; pass at runtime</li>
          <li><b>Big models</b> outside the image (S3 / registry / volume); small ones baked in with a version tag</li>
          <li><b>Ops</b> — one process per container, log to stdout, HEALTHCHECK, memory limit (<code>-m</code>; OOM → 137)</li>
          <li><b>GPU</b> — <code>nvidia/cuda</code> / <code>pytorch/pytorch</code> base matching host driver; <code>--gpus all</code></li>
          <li>⚠ Deleting a file in a later layer doesn't shrink the image → create and delete in the same RUN</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Problem</span><span class="rm-sub">"Works on my machine"</span></div></div>
      <div class="rm-item rm-done" data-target="sd-img"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Images vs Containers</span><span class="rm-sub">Class vs object</span></div></div>
      <div class="rm-item rm-done" data-target="sd-file"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Dockerfile for an ML API</span><span class="rm-sub">Layers, cache, multi-stage</span></div></div>
      <div class="rm-item rm-done" data-target="sd-run"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Build, Run, Ports, Env</span><span class="rm-sub">Real commands, real output</span></div></div>
      <div class="rm-item rm-done" data-target="sd-vol"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Volumes</span><span class="rm-sub">Data that outlives containers</span></div></div>
      <div class="rm-item rm-done" data-target="sd-net"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Networking</span><span class="rm-sub">Containers find each other by name</span></div></div>
      <div class="rm-item rm-done" data-target="sd-compose"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Docker Compose</span><span class="rm-sub">API + Postgres + Redis</span></div></div>
      <div class="rm-item rm-done" data-target="sd-reg"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Registries &amp; Tagging</span><span class="rm-sub">Ship images, pin versions</span></div></div>
      <div class="rm-item rm-done" data-target="sd-best"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Best Practices for ML</span><span class="rm-sub">Small, safe, reproducible</span></div></div>
      <div class="rm-item rm-done" data-target="sd-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The usual "why doesn't it work"</span></div></div>
      <div class="rm-item rm-done" data-target="sd-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sd-why"><span class="num">01</span>The Problem: "It Works on My Machine"</h2>
  <p>You train a churn model on your laptop, save it with <code>joblib</code>, and hand it to the platform team. On the production server it fails to load. Your laptop has Python 3.12 and scikit-learn 1.6; the server has Python 3.9 and scikit-learn 1.3, which cannot read the newer pickle. A second model uses LightGBM, which needs a C library (<code>libgomp</code>) the server does not have. And your code reads <code>MODEL_PATH</code> from an env var you set months ago in your <code>.bashrc</code>.</p>
  <table class="tbl">
    <tr><th></th><th>Your laptop</th><th>Prod server</th></tr>
    <tr><td>Python</td><td>3.12</td><td>3.9</td></tr>
    <tr><td>scikit-learn</td><td>1.6.1</td><td>1.3.0 → pickle won't load</td></tr>
    <tr><td>System libs</td><td>libgomp present</td><td>missing → LightGBM crashes</td></tr>
    <tr><td>Env vars / paths</td><td>set in your .bashrc</td><td>unset</td></tr>
  </table>
  <p>Docker's idea: do not ship just the code. Ship the code <em>plus its whole environment</em> (the operating-system files, Python, every package, settings) as one sealed box. The server only needs Docker; it runs the box and gets exactly your environment.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shipping container. Before containers, every port loaded sacks, barrels and crates differently, and things broke. Now every crane, ship and truck handles the same steel box and does not care what is inside. Your app is the cargo; Docker is the standard box.</p>
  </div>
  <div class="flow"><span>Dockerfile (recipe)</span><span>docker build</span><span>Image (sealed box)</span><span>docker run anywhere</span><span>Container (running)</span></div>
  <p>Is a container a small virtual machine? No, and the difference is a classic interview question. A <strong>virtual machine</strong> (VM) emulates a whole computer and boots its own operating system kernel, so it weighs GBs and takes minutes to start. A <strong>container</strong> is just a normal Linux process that the host kernel fences off: it sees its own files, its own process list and its own network, but it shares the host's kernel. Here is proof, run on this machine:</p>
  <div class="fx" data-lang="text">$ grep PRETTY /etc/os-release; uname -r; python3 --version          # the host
PRETTY_NAME="Ubuntu 24.04.5 LTS"
6.18.44-fc-v139
Python 3.13.16
$ docker run --rm python:3.12-slim sh -c 'grep PRETTY /etc/os-release; uname -r; python --version'
PRETTY_NAME="Debian GNU/Linux 13 (trixie)"
6.18.44-fc-v139
Python 3.12.15</div>
  <p>Inside the container the OS files say Debian and Python is 3.12, while the host is Ubuntu with Python 3.13. But <code>uname -r</code>, the kernel version, is identical: the container borrowed the host's kernel. That is why containers start in about a second and weigh MBs. <code>docker run --rm IMAGE command</code> starts a container, runs one command, and deletes the container afterwards.</p>
  <div class="cards">
    <div><b>Virtual machine</b><p>Full guest OS + own kernel. GBs, boots in minutes. Strong isolation.</p></div>
    <div><b>Container</b><p>Isolated process sharing the host kernel. MBs, starts in seconds.</p></div>
    <div><b>virtualenv</b><p>Isolates Python packages only — not Python itself or system libs.</p></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Container</strong>: a process isolated using Linux <strong>namespaces</strong> (separate view of files, PIDs, network) and limited by <strong>cgroups</strong> (caps on CPU and memory). <strong>Image</strong>: the packaged filesystem + settings a container starts from. On Mac/Windows, Docker Desktop runs a small Linux VM underneath.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Docker makes my app secure" — not by itself. Containers share the kernel, so isolation is weaker than a VM, and a container running as root with extra privileges can harm the host. Section 09 covers the basics (non-root user, no secrets inside).</p>
  </div>

  <h2 id="sd-img"><span class="num">02</span>Images vs Containers</h2>
  <p>Beginners mix up the two words, and then commands like <code>docker rm</code> vs <code>docker rmi</code> make no sense. The <strong>image</strong> is the sealed, read-only box: files and settings, frozen. A <strong>container</strong> is one running (or stopped) copy made from it. You can start many containers from one image, for example the same API on two ports plus one for tests.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cake recipe printed in a book vs the cakes you bake. The book page (image) never changes. Each cake (container) is made from it; you can add icing to one cake without touching the book or the other cakes. Throw a cake away, bake a new one, and it comes out exactly like the recipe again. In OOP words: image = class, container = object.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="sd-arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="45" width="170" height="70" rx="8" class="fb sb"/><text x="95" y="73" text-anchor="middle">Image iris-api:1.0</text><text x="95" y="95" text-anchor="middle" class="tm">read-only layers</text>
    <rect x="330" y="10" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="35" text-anchor="middle">container A  :8080</text>
    <rect x="330" y="60" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="85" text-anchor="middle">container B  :8081</text>
    <rect x="330" y="110" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="135" text-anchor="middle">container C  (test)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="182" y1="70" x2="326" y2="30" marker-end="url(#sd-arr1)"/><line x1="182" y1="80" x2="326" y2="80" marker-end="url(#sd-arr1)"/><line x1="182" y1="90" x2="326" y2="130" marker-end="url(#sd-arr1)"/></g>
    <text x="255" y="155" text-anchor="middle" class="tm">docker run</text>
  </svg><figcaption>One image, many containers. Each container adds its own thin writable layer on top.</figcaption></figure>
  <p>When a container writes a file, the change goes into a thin <strong>writable layer</strong> that belongs to that container only. The image underneath is untouched. Worked example: container <code>tmp1</code> writes <code>/tmp/x.txt</code>; we ask Docker what it changed; we delete it; a brand-new container looks for the file.</p>
  <div class="fx" data-lang="text">$ docker run --name tmp1 python:3.12-slim sh -c 'echo hello &gt; /tmp/x.txt; cat /tmp/x.txt'
hello
$ docker diff tmp1                 # changes in tmp1's writable layer
C /tmp
A /tmp/x.txt
$ docker rm tmp1                   # delete the container (and its layer)
tmp1
$ docker run --rm python:3.12-slim cat /tmp/x.txt
cat: /tmp/x.txt: No such file or directory</div>
  <p><code>docker diff</code> lists changes: <code>A</code> = added, <code>C</code> = changed folder. After <code>docker rm</code>, that layer is gone, so the new container starts from the clean image and the file does not exist. This is a feature: every start is identical. Data you want to keep goes into a <strong>volume</strong> (section 05).</p>
  <table class="tbl">
    <tr><th></th><th>Image</th><th>Container</th></tr>
    <tr><td>Is</td><td>Read-only template (layers + metadata)</td><td>A running or stopped instance of an image</td></tr>
    <tr><td>OOP analogy</td><td>Class</td><td>Object</td></tr>
    <tr><td>Made by</td><td><code>docker build</code> / <code>docker pull</code></td><td><code>docker run</code></td></tr>
    <tr><td>List</td><td><code>docker images</code></td><td><code>docker ps -a</code> (<code>-a</code> includes stopped)</td></tr>
    <tr><td>Delete</td><td><code>docker rmi</code></td><td><code>docker rm</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Image</strong>: an ordered stack of read-only filesystem layers plus config (default command, env, user, ports), identified by a sha256 ID. <strong>Container</strong>: an image + a writable layer + a running process with its own namespaces.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"I fixed it inside the container with <code>docker exec</code> and <code>pip install</code>." That fix lives only in that container's layer and vanishes on the next deploy. Put every change in the Dockerfile and rebuild.</p>
  </div>

  <h2 id="sd-file"><span class="num">03</span>Dockerfile for a Small ML API</h2>
  <p>To build an image you write a <strong>Dockerfile</strong>: a plain text recipe, one instruction per line, run top to bottom. Our project is a FastAPI app that serves an iris flower classifier. Files: <code>requirements.txt</code>, <code>train.py</code> (trains and saves <code>model.joblib</code>), and <code>app/main.py</code> (the API). First the two Python files:</p>
  <div class="fx" data-lang="py"># train.py
import joblib
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression

X, y = load_iris(return_X_y=True)
model = LogisticRegression(max_iter=200).fit(X, y)
print(f"train accuracy: {model.score(X, y):.3f}")
joblib.dump(model, "model.joblib")</div>
  <div class="fx" data-lang="py"># app/main.py
import os
import joblib
from fastapi import FastAPI

MODEL_PATH = os.getenv("MODEL_PATH", "model.joblib")
model = joblib.load(MODEL_PATH)
app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(features: list[float]):
    return {"class": int(model.predict([features])[0])}</div>
  <p><code>train.py</code> fits a logistic regression and saves it. <code>main.py</code> loads the model once at start-up (path from an env var, with a default) and exposes two endpoints: <code>/health</code> for "am I alive" checks and <code>/predict</code>, which takes a JSON list of 4 numbers and returns the class. Now the recipe. It has two <strong>stages</strong>: a builder that installs packages and trains, and a small final image that only receives the results.</p>
  <div class="fx" data-lang="text"># Dockerfile
# ---- stage 1: install deps + train ----
FROM python:3.12-slim AS builder
WORKDIR /build
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY train.py .
RUN python train.py

# ---- stage 2: small runtime ----
FROM python:3.12-slim
RUN useradd --create-home appuser
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /build/model.joblib .
COPY app/ ./app/
ENV PATH="/opt/venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]</div>
  <table class="tbl">
    <tr><th>Instruction</th><th>Meaning</th></tr>
    <tr><td><code>FROM python:3.12-slim AS builder</code></td><td>Start from an official image with Debian + Python 3.12; name this stage</td></tr>
    <tr><td><code>WORKDIR /build</code></td><td><code>cd</code> into this folder (create it if missing)</td></tr>
    <tr><td><code>RUN …</code></td><td>Run a shell command at build time; result saved as a layer</td></tr>
    <tr><td><code>ENV PATH=…</code></td><td>Set an env var for later steps and for the container (here: use the venv)</td></tr>
    <tr><td><code>COPY src dst</code></td><td>Copy files from your project (the <strong>build context</strong>) into the image</td></tr>
    <tr><td><code>COPY --from=builder</code></td><td>Copy files from the earlier stage instead of from your project</td></tr>
    <tr><td><code>USER appuser</code></td><td>Run the app as a normal user, not root</td></tr>
    <tr><td><code>EXPOSE 8000</code></td><td>Documentation: "this app listens on 8000" (does not open anything)</td></tr>
    <tr><td><code>CMD [...]</code></td><td>Default command when a container starts</td></tr>
  </table>
  <div class="fx" data-lang="text"># requirements.txt (pinned)        # .dockerignore (keeps the build context small + safe)
fastapi==0.115.6                    .git
uvicorn==0.34.0                     .venv
scikit-learn==1.6.1                 __pycache__/
joblib==1.4.2                       *.ipynb
numpy==2.2.1                        data/
scipy==1.15.1                       .env</div>
  <p>Why two stages? The builder holds pip caches, build tools and training scripts that the server never needs. The final stage starts again from a clean base and copies in only the finished venv and <code>model.joblib</code>. Smaller image, faster pulls, less to attack. <code>.dockerignore</code> works like <code>.gitignore</code>: those paths are never sent to the builder, so your <code>.env</code> and a 5 GB <code>data/</code> folder cannot leak into the image.</p>
  <p>Now the most important idea for build speed: <strong>layers and the cache</strong>. Every instruction produces a layer, and Docker remembers it. On the next build, if an instruction and its inputs are unchanged, Docker reuses the old layer (CACHED). As soon as one layer changes, that layer and <em>every layer after it</em> are rebuilt.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <rect x="20" y="160" width="300" height="30" rx="4" class="fs"/><text x="170" y="180" text-anchor="middle">FROM python:3.12-slim</text>
    <rect x="20" y="125" width="300" height="30" rx="4" class="fb sb"/><text x="170" y="145" text-anchor="middle">COPY requirements.txt</text>
    <rect x="20" y="90" width="300" height="30" rx="4" class="fb sb"/><text x="170" y="110" text-anchor="middle">RUN pip install (slow, big)</text>
    <rect x="20" y="55" width="300" height="30" rx="4" class="ft st"/><text x="170" y="75" text-anchor="middle">COPY train.py / RUN train</text>
    <rect x="20" y="20" width="300" height="30" rx="4" class="fr sr"/><text x="170" y="40" text-anchor="middle">COPY app/  (changes often)</text>
    <text x="345" y="40" class="tr">edit app → rebuild only this</text><text x="345" y="75" class="tg">cached ✓</text>
    <text x="345" y="110" class="tg">cached ✓</text>
    <text x="345" y="145" class="tg">cached ✓</text>
    <text x="345" y="180" class="tg">cached ✓</text>
  </svg><figcaption>Each instruction = a layer. A changed layer invalidates everything above it, so put rarely-changing steps first.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Building a stack of rotis for a family thali: if you need to change the top roti, you replace only the top. If you must change the bottom one, every roti above it has to come off and go back on. So keep the slow, rarely-changing items (packages) at the bottom and your often-edited code at the top.</p>
  </div>
  <p>Real test. We edited one line in <code>app/main.py</code> and rebuilt (trimmed). Then we did the same with a "bad" Dockerfile that starts with <code>COPY . .</code> and installs packages after it.</p>
  <div class="fx" data-lang="text">$ docker build -t iris-api:1.1 .                  # good order: took 0.38 s
#10 [builder 5/7] RUN pip install --no-cache-dir -r requirements.txt
#10 CACHED
#13 [builder 7/7] RUN python train.py
#13 CACHED
#6 [stage-1 4/6] COPY --from=builder /opt/venv /opt/venv
#6 CACHED
#16 [stage-1 6/6] COPY app/ ./app/
#16 DONE 0.0s

$ docker build -f Dockerfile.bad -t iris-bad .    # COPY . . first: took 39.4 s
#7 [3/5] COPY . .
#7 DONE 0.5s
#8 [4/5] RUN pip install --no-cache-dir -r requirements.txt
#8 DONE 19.7s
#9 [5/5] RUN python train.py
#9 DONE 1.6s</div>
  <p>With the good order every heavy step says <code>CACHED</code>, and only the final <code>COPY app/</code> ran: 0.38 seconds. In the bad file, <code>COPY . .</code> copies the whole project, so any code edit changes that layer, and pip install (20 s here, often 5+ minutes with torch) runs again on every build: 39.4 seconds for a one-line change.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Layer</strong>: the filesystem change made by one instruction, stored once and shared between images. <strong>Build context</strong>: the folder you pass to <code>docker build</code> (the final <code>.</code>), minus <code>.dockerignore</code>. <strong>Multi-stage build</strong>: several <code>FROM</code>s in one Dockerfile; only the last stage becomes the image.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>COPY . .</code> before <code>pip install</code> means every code edit re-installs every package. Copy <code>requirements.txt</code> alone first. And avoid Alpine images for data science: they use a different C library (musl), so numpy/pandas/torch often have no ready wheels and compile for ages or fail; use <code>-slim</code>.</p>
  </div>

  <h2 id="sd-run"><span class="num">04</span>Build, Run, Ports &amp; Env</h2>
  <p>You have a recipe. Now: cook it into an image, start a container, and call the API from your laptop. One surprise waits: the container has its own private network, so even though uvicorn listens on port 8000 inside, <code>curl localhost:8000</code> on your laptop reaches nothing. You must open a door from a host port to the container port.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An office building with a reception desk. The API sits in cabin 8000 inside the office. Visitors cannot walk in; they dial the reception extension 8080, and reception forwards the call to cabin 8000. <code>-p 8080:8000</code> sets up that forwarding rule.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="sd-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="130" height="50" rx="8" class="fs"/><text x="75" y="60" text-anchor="middle">curl / browser</text>
    <rect x="200" y="15" width="390" height="85" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="215" y="33" class="tm">host machine</text>
    <rect x="215" y="45" width="110" height="40" rx="6" class="fb sb"/><text x="270" y="70" text-anchor="middle">port 8080</text>
    <rect x="400" y="40" width="175" height="50" rx="8" class="fg sg"/><text x="487" y="62" text-anchor="middle">container</text><text x="487" y="80" text-anchor="middle" class="tm">uvicorn :8000</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="142" y1="65" x2="211" y2="65" marker-end="url(#sd-arr2)"/><line x1="327" y1="65" x2="396" y2="65" marker-end="url(#sd-arr2)"/></g>
    <text x="362" y="115" text-anchor="middle" class="tb">-p 8080:8000  (host:container)</text>
  </svg><figcaption>Containers are isolated; -p opens a door from a host port to a container port.</figcaption></figure>
  <p>Step by step: build and tag the image, run it in the background with a port mapping and an env var, call both endpoints, then look at it from outside (<code>ps</code>), from inside (<code>exec</code>) and through its output (<code>logs</code>).</p>
  <div class="fx" data-lang="text">$ docker build -t iris-api:1.0 .
 ...
#11 [builder 7/7] RUN python train.py
#11 0.952 train accuracy: 0.973
 ...
#17 naming to docker.io/library/iris-api:1.0 done
$ docker images iris-api
IMAGE          ID             DISK USAGE   CONTENT SIZE   EXTRA
iris-api:1.0   eefcf4a6f5d6        597MB          139MB
$ docker run -d --name iris -p 8080:8000 -e MODEL_PATH=model.joblib iris-api:1.0
40eb10eb917f4852fe1619ba1cd8ef9cc39164f9c93a9078cd7204ded7415f9c
$ curl -s localhost:8080/health
{"status":"ok"}
$ curl -s -X POST localhost:8080/predict -H 'Content-Type: application/json' -d '[6.7, 3.0, 5.2, 2.3]'
{"class":2}
$ curl -s -X POST localhost:8080/predict -H 'Content-Type: application/json' -d '[5.1, 3.5, 1.4, 0.2]'
{"class":0}
$ docker ps --format 'table {{.Names}}&#92;t{{.Image}}&#92;t{{.Ports}}&#92;t{{.Status}}'
NAMES     IMAGE          PORTS                    STATUS
iris      iris-api:1.0   0.0.0.0:8080-&gt;8000/tcp   Up 4 seconds
$ docker exec iris whoami
appuser
$ docker exec iris python -c 'import sklearn, sys; print(sys.version.split()[0], sklearn.__version__)'
3.12.15 1.6.1
$ docker logs iris
INFO:     Started server process [1]
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     172.17.0.1:42806 - "GET /health HTTP/1.1" 200 OK
INFO:     172.17.0.1:42812 - "POST /predict HTTP/1.1" 200 OK
 ...
$ docker stop iris &amp;&amp; docker rm iris</div>
  <p>(The sandbox build also needed proxy settings; those are environment-specific and left out. Some log lines trimmed.) <code>-d</code> = detached (background); Docker printed the new container's ID. <code>--name iris</code> gives a name to use instead of the ID. <code>-e</code> set the env var. <code>docker ps</code> shows the port rule <code>0.0.0.0:8080-&gt;8000</code>. <code>exec</code> ran commands inside the live container: the app runs as <code>appuser</code> with exactly Python 3.12.15 and scikit-learn 1.6.1, wherever this image runs. <code>logs</code> shows what the app printed to stdout; <code>[1]</code> means uvicorn is process 1 in the container.</p>
  <p>That PID 1 detail matters when stopping. <code>docker stop</code> sends SIGTERM to PID 1, waits 10 seconds, then sends SIGKILL. We started the same image twice: once with the exec form <code>CMD ["uvicorn", …]</code>, once with the shell form <code>CMD uvicorn …</code>.</p>
  <div class="fx" data-lang="text">$ docker top ef -o pid,args                     # exec form
PID                 COMMAND
2348                /opt/venv/bin/python /opt/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
$ docker top sf -o pid,args                     # shell form: sh is in front
PID                 COMMAND
2286                /bin/sh -c uvicorn app.main:app --host 0.0.0.0 --port 8000
2306                /opt/venv/bin/python /opt/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
$ docker stop ef                                # took 0 s
$ docker stop sf                                # took 10 s
$ docker ps -a --filter name=ef --filter name=sf --format 'table {{.Names}}&#92;t{{.Status}}'
NAMES     STATUS
ef        Exited (0) 10 seconds ago
sf        Exited (137) Less than a second ago</div>
  <p>In shell form, <code>/bin/sh</code> is the main process and does not pass SIGTERM on to uvicorn. Docker waited the full 10 seconds and then killed everything: exit 137 (128 + SIGKILL 9, as in the Linux note), no graceful shutdown, in-flight requests dropped. Exec form: uvicorn got SIGTERM, shut down cleanly, exit 0.</p>
  <table class="tbl">
    <tr><th>Flag / command</th><th>Meaning</th></tr>
    <tr><td><code>-d</code> / <code>--rm</code></td><td>Run in background / delete the container when it exits</td></tr>
    <tr><td><code>-p 8080:8000</code></td><td>Host port 8080 → container port 8000</td></tr>
    <tr><td><code>-e KEY=val</code>, <code>--env-file .env</code></td><td>Env vars (config, secrets at runtime, never baked in)</td></tr>
    <tr><td><code>docker exec -it NAME bash</code></td><td>Interactive shell inside a running container (<code>sh</code> if no bash)</td></tr>
    <tr><td><code>docker logs -f NAME</code></td><td>Follow stdout/stderr</td></tr>
    <tr><td><code>docker stop</code> / <code>rm</code> / <code>rmi</code></td><td>Stop (SIGTERM, then KILL) / delete container / delete image</td></tr>
    <tr><td><code>-m 2g</code>, <code>--cpus 2</code></td><td>Memory and CPU limits</td></tr>
    <tr><td><code>--gpus all</code></td><td>Expose GPUs (needs NVIDIA Container Toolkit; not run here)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Port publishing</strong> (<code>-p</code>): a rule forwarding a host port to a container port. <strong>Exec form</strong> <code>CMD ["a","b"]</code>: run the program directly; <strong>shell form</strong> <code>CMD a b</code>: run it through <code>/bin/sh -c</code>. <strong>ENTRYPOINT</strong> fixes the program; <strong>CMD</strong> gives default arguments that <code>docker run img …</code> can override.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The server inside must listen on <code>0.0.0.0</code> (all interfaces), not <code>127.0.0.1</code>. Real run with <code>--host 127.0.0.1</code>: logs say "Uvicorn running on http://127.0.0.1:8000", yet <code>curl -sS localhost:8081/health</code> gives <code>curl: (56) Recv failure: Connection reset by peer</code>. Inside the container, 127.0.0.1 means "only from inside this container", so the forwarded traffic is refused.</p>
  </div>

  <h2 id="sd-vol"><span class="num">05</span>Volumes</h2>
  <p>Section 02 showed that a container's files vanish when it is removed. That is great for code, terrible for data. A Postgres container that loses its tables on every redeploy is useless, and so is an experiment logger that forgets past runs. During development you also want the container to see the dataset on your laptop without baking it into the image.</p>
  <p>A <strong>volume</strong> is storage that lives outside any container and is attached (mounted) into a container at a path. Remove the container and the volume stays; attach it to the next container and the data is there.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A container is a hotel room: cleaned completely after checkout. A named volume is your locker in the hotel lobby: any room you stay in later can open it. A bind mount is bringing your own suitcase from home into the room: it is your folder, just visible inside.</p>
  </div>
  <div class="cards">
    <div><b>Named volume</b><p><code>-v mldata:/data</code>. Docker manages where it lives; survives container deletion.</p><small>Databases, experiment logs</small></div>
    <div><b>Bind mount</b><p><code>-v "$PWD/data":/data</code>. A host folder appears inside; changes go both ways.</p><small>Dev: live code, local datasets</small></div>
    <div><b>tmpfs</b><p><code>--tmpfs /scratch</code>. In RAM only, gone on stop.</p><small>Fast scratch, short-lived secrets</small></div>
  </div>
  <p>Worked example. Two short-lived containers each append a line of metrics to a named volume; a third, brand-new container reads the file. Then a bind mount, where the container writes into a folder on the host.</p>
  <div class="fx" data-lang="text">$ docker volume create mldata
mldata
$ docker run --rm -v mldata:/data python:3.12-slim sh -c 'echo "run-1 auc=0.91" &gt;&gt; /data/metrics.txt'
$ docker run --rm -v mldata:/data python:3.12-slim sh -c 'echo "run-2 auc=0.93" &gt;&gt; /data/metrics.txt'
$ docker run --rm -v mldata:/data python:3.12-slim cat /data/metrics.txt
run-1 auc=0.91
run-2 auc=0.93
$ docker volume inspect mldata --format '{{.Mountpoint}}'
/var/lib/docker/volumes/mldata/_data
$ docker run --rm -v "$PWD/host_data":/data python:3.12-slim sh -c 'ls /data; echo "from container" &gt; /data/out.txt'
in.csv
$ cat host_data/out.txt
from container
$ docker run --rm --tmpfs /scratch python:3.12-slim sh -c 'echo temp &gt; /scratch/t; df -h /scratch | tail -1'
tmpfs           7.9G  4.0K  7.9G   1% /scratch</div>
  <p>Each <code>--rm</code> container was deleted right after running, yet the third one read both lines: the data lived in the volume, which Docker keeps under <code>/var/lib/docker/volumes</code> on the host. With the bind mount, the container saw the host's <code>in.csv</code>, and the file it wrote appeared on the host. The tmpfs mount is a RAM disk (<code>df</code> shows type tmpfs).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Volume</strong>: persistent storage managed by Docker, mounted with <code>-v name:/path</code> (or <code>--mount</code>). <strong>Bind mount</strong>: a specific host path mounted into a container. Both bypass the container's writable layer, which is also faster for heavy writes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A bind mount hides whatever the image had at that path. Mount <code>$PWD:/app</code> over an image whose <code>/app</code> contained <code>model.joblib</code>, and the model "disappears". Also, files written via a bind mount are owned by the container's user ID, which can cause permission errors on the host.</p>
  </div>

  <h2 id="sd-net"><span class="num">06</span>Networking</h2>
  <p>Real ML systems are several containers: the API, a database with features, a Redis cache. The API must find the database. IP addresses change every time a container restarts, so hard-coding them breaks. And beginners write <code>localhost:5432</code> for the database, which fails for a reason that is obvious once you see it.</p>
  <p>Docker gives each container its own network stack. On a <strong>user-defined network</strong> (one you create), Docker runs a small DNS service: every container can reach every other one by its <strong>container name</strong>, which Docker turns into the current IP.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An office intercom. Inside the office you dial "Accounts" or "HR" by name and the system finds the desk, even if HR moved floors. People outside the office (the default network, or your laptop) cannot use the intercom names at all; they need the public number at reception (<code>-p</code>).</p>
  </div>
  <div class="fx" data-lang="text">$ docker network create mlnet
$ docker run -d --rm --name api --network mlnet iris-api:1.1
$ docker run --rm --network mlnet python:3.12-slim python -c "import urllib.request; print(urllib.request.urlopen('http://api:8000/health').read().decode())"
{"status":"ok","model":"model.joblib"}
$ docker run --rm python:3.12-slim python -c "import urllib.request; urllib.request.urlopen('http://api:8000/health')"
urllib.error.URLError: &lt;urlopen error [Errno -2] Name or service not known&gt;
$ docker run --rm --network mlnet python:3.12-slim python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
urllib.error.URLError: &lt;urlopen error [Errno 111] Connection refused&gt;
$ docker network inspect mlnet --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{end}}'
api 172.18.0.2/16</div>
  <p>(Tracebacks trimmed to the last line. Version 1.1 of the image also returns the model path from <code>/health</code>.) First call: a client container on <code>mlnet</code> reached <code>http://api:8000</code> by name. Note it used the <em>container</em> port 8000; no <code>-p</code> was needed between containers. Second call: a container not on <code>mlnet</code> (default network) could not even resolve the name. Third call: <code>localhost</code> inside the client means the client itself, where nothing listens on 8000, so the connection was refused. The last command shows the IP Docker assigned; you never need to type it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bridge network</strong>: Docker's default private network type on one host. <strong>User-defined bridge</strong>: one you create; adds name-based DNS between its containers. <strong>Published port</strong>: only needed for traffic from outside Docker (your laptop, the internet).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>localhost</code> inside a container means <em>that container</em>. To reach Postgres in another container use its name (<code>db:5432</code>), not <code>localhost:5432</code>. To reach a service running on the host machine itself, Docker Desktop offers <code>host.docker.internal</code>.</p>
  </div>

  <h2 id="sd-compose"><span class="num">07</span>Docker Compose: API + Postgres + Redis</h2>
  <p>Starting three containers by hand means three long <code>docker run</code> lines with networks, env vars, volumes and the right start order, typed correctly every time by every teammate. That does not scale. <strong>Docker Compose</strong> lets you describe the whole stack in one YAML file and start it with one command.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding caterer's order sheet. Instead of phoning the cook, the decorator and the band separately with instructions, you write one sheet: who comes, what they need, who starts after whom. Hand it over and the whole event runs. <code>compose.yaml</code> is that sheet; <code>docker compose up</code> hands it over.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="sd-arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="5" y="50" width="90" height="44" rx="8" class="fs"/><text x="50" y="77" text-anchor="middle">client</text>
    <rect x="130" y="10" width="460" height="130" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="145" y="28" class="tm">network: mlstack_default</text>
    <rect x="160" y="50" width="130" height="44" rx="8" class="fb sb"/><text x="225" y="77" text-anchor="middle">api :8000</text>
    <rect x="410" y="35" width="160" height="40" rx="8" class="fg sg"/><text x="490" y="60" text-anchor="middle">db (Postgres)</text>
    <rect x="410" y="88" width="160" height="40" rx="8" class="fr sr"/><text x="490" y="113" text-anchor="middle">cache (Redis)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="97" y1="72" x2="156" y2="72" marker-end="url(#sd-arr3)"/><line x1="292" y1="65" x2="406" y2="55" marker-end="url(#sd-arr3)"/><line x1="292" y1="80" x2="406" y2="105" marker-end="url(#sd-arr3)"/></g>
    <text x="112" y="100" text-anchor="middle" class="tm">:8080</text>
    <text x="350" y="50" text-anchor="middle" class="tm">db:5432</text><text x="350" y="112" text-anchor="middle" class="tm">cache:6379</text>
  </svg><figcaption>One YAML file declares all three services; Compose creates the network and they find each other by service name.</figcaption></figure>
  <div class="fx" data-lang="text"># compose.yaml
services:
  api:
    image: iris-api:1.1          # or: build: .
    ports:
      - "8080:8000"
    environment:
      DATABASE_URL: postgresql://ml:secret@db:5432/features
      REDIS_URL: redis://cache:6379/0
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ml
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: features
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ml -d features"]
      interval: 5s
      retries: 5

  cache:
    image: redis:7-alpine

volumes:
  pgdata:</div>
  <p>Each key under <code>services</code> becomes a container and also its DNS name. <code>ports</code>, <code>environment</code> and <code>volumes</code> are the same as <code>-p</code>, <code>-e</code> and <code>-v</code>. Note the URLs use <code>db</code> and <code>cache</code>, the service names. The <code>healthcheck</code> runs <code>pg_isready</code> every 5 seconds, and <code>condition: service_healthy</code> makes the API wait until Postgres actually accepts connections. (The password is inline only for the demo; real stacks read it from an env file or secret.)</p>
  <div class="fx" data-lang="text">$ docker compose up -d
 ...
 Container mlstack-db-1 Waiting
 Container mlstack-db-1 Healthy
 Container mlstack-api-1 Started
$ docker compose ps --format 'table {{.Service}}&#92;t{{.Image}}&#92;t{{.Status}}&#92;t{{.Ports}}'
SERVICE   IMAGE                STATUS                   PORTS
api       iris-api:1.1         Up Less than a second    0.0.0.0:8080-&gt;8000/tcp
cache     redis:7-alpine       Up 6 seconds             6379/tcp
db        postgres:16-alpine   Up 5 seconds (healthy)   5432/tcp
$ docker compose exec cache redis-cli ping
PONG
$ docker compose exec api python -c "import socket; socket.create_connection(('db', 5432), timeout=2); print('db:5432 reachable')"
db:5432 reachable
$ docker compose exec db psql -U ml -d features -c "CREATE TABLE runs(id int, auc float); INSERT INTO runs VALUES (1, 0.91);"
CREATE TABLE
INSERT 0 1
$ docker compose down              # removes containers + network, KEEPS volumes
$ docker compose up -d
$ docker compose exec db psql -U ml -d features -c "SELECT * FROM runs;"
 id | auc
----+------
  1 | 0.91
(1 row)
$ docker compose down -v           # -v: also delete the volumes (data gone)</div>
  <p>(Progress lines trimmed.) Compose created the network <code>mlstack_default</code> (named after the folder) and the volume, waited for <code>db</code> to be healthy, then started <code>api</code>. From inside the API container, the name <code>db</code> resolved and port 5432 answered. After <code>down</code> and <code>up</code>, the <code>runs</code> table was still there, because Postgres stores its files in the <code>pgdata</code> volume. Only <code>down -v</code> deletes that data.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Docker Compose</strong>: a tool (<code>docker compose</code>) that creates and manages a multi-container app from a YAML file. <strong>Service</strong>: one container definition in that file (can be scaled to several replicas). <strong>Healthcheck</strong>: a command Docker runs periodically to mark a container healthy or unhealthy.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Plain <code>depends_on: [db]</code> only orders <em>start-up</em>; it does not wait for Postgres to accept connections. In our run, the API itself was "Up Less than a second" and a <code>curl</code> sent at that instant got an empty reply; three seconds later it answered. Use healthchecks + <code>service_healthy</code>, and still retry connections in code.</p>
  </div>

  <h2 id="sd-reg"><span class="num">08</span>Registries &amp; Tagging</h2>
  <p>The image is on your laptop. The server in the cloud needs it. You will not email a 600 MB file. A <strong>registry</strong> is a server that stores images, like GitHub for code: you <strong>push</strong> to it from your laptop or CI, and servers <strong>pull</strong> from it. Docker Hub is the public default; companies use GitHub Container Registry (ghcr.io), AWS ECR or GCP Artifact Registry.</p>
  <p>The image's name says where it lives: <code>registry-host/user/name:tag</code>. A <strong>tag</strong> is just a label pointing at an image ID, and one image can have many tags. Without a host part, Docker assumes Docker Hub; without a tag, it assumes <code>latest</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Books in a library. The image is the book; tags are labels on the spine, like "Edition 1.1" and "Newest arrival". A library (registry) holds the books; branches (servers) order a copy by its label. The "Newest arrival" sticker gets moved to another book next month; "Edition 1.1" never changes. That is the difference between <code>:latest</code> and <code>:1.1</code>.</p>
  </div>
  <div class="flow"><span>build</span><span>tag registry/name:version</span><span>push</span><span>server pulls</span><span>run</span></div>
  <p>We ran a private registry locally on port 5000 (<code>docker run -d -p 5000:5000 registry:2</code>), so the full cycle is real:</p>
  <div class="fx" data-lang="text">$ docker tag iris-api:1.1 localhost:5000/iris-api:1.1
$ docker tag iris-api:1.1 localhost:5000/iris-api:latest
$ docker images --format 'table {{.Repository}}&#92;t{{.Tag}}&#92;t{{.ID}}' | grep -E 'REPOSITORY|iris-api'
REPOSITORY                TAG         IMAGE ID
iris-api                  1.1         3b8aeaf8e27e
localhost:5000/iris-api   1.1         3b8aeaf8e27e
localhost:5000/iris-api   latest      3b8aeaf8e27e
iris-api                  1.0         eefcf4a6f5d6
$ docker push localhost:5000/iris-api:1.1
 ...
1.1: digest: sha256:3b8aeaf8e27ed4456df0683ae4ebc9729c7bf27c2b2efa2f3740ae1a214aa566 size: 856
$ docker rmi localhost:5000/iris-api:1.1
Untagged: localhost:5000/iris-api:1.1
$ docker pull localhost:5000/iris-api:1.1
 ...
Status: Downloaded newer image for localhost:5000/iris-api:1.1
$ curl -s localhost:5000/v2/iris-api/tags/list
{"name":"iris-api","tags":["1.1"]}</div>
  <p>Three names, one image ID <code>3b8aeaf8e27e</code>: tagging copies nothing. <code>push</code> uploaded the layers and printed the <strong>digest</strong>, a sha256 of the exact content. <code>rmi</code> on a tag only removed the label ("Untagged"). <code>pull</code> brought it back by name. The registry's own API lists the tags it holds (only 1.1, since we pushed only that one). For GitHub you would tag <code>ghcr.io/asha/iris-api:1.1</code> and <code>docker login ghcr.io</code> first.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tag</strong>: mutable, human-friendly label (<code>1.1</code>, <code>latest</code>, a git SHA). <strong>Digest</strong>: immutable content address (<code>name@sha256:…</code>); pulling by digest always gives byte-identical content. <strong>Repository</strong>: all tags of one image name.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>:latest</code> is not "newest"; it is just the default tag, and it moves whenever someone pushes it. Two servers pulling <code>:latest</code> a day apart can run different models, and you cannot roll back to "the previous latest". Deploy immutable tags (version or git SHA), or digests.</p>
  </div>

  <h2 id="sd-best"><span class="num">09</span>Best Practices for ML Images</h2>
  <p>A working image is step one. A good ML image is also reproducible (the same build next month), small (fast to pull on 20 servers), safe (no secrets, no root) and well behaved under an orchestrator. Each rule below comes from a real failure, and several we reproduced here.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Packing a tiffin for a long train journey. Pack exactly what was tested at home (pin versions), not whatever the canteen has today. Pack light (slim image). Never tape your ATM PIN to the lid (secrets in layers). Put a label with the date on it (version tag).</p>
  </div>
  <p><strong>1. Pin everything.</strong> Our first build pinned only the four direct packages. pip filled in the rest with whatever was newest that day: <code>numpy-2.5.4</code> and <code>scipy-1.18.1</code>. Training then printed a warning that did not exist on the developer's laptop:</p>
  <div class="fx" data-lang="text">#13 1.820 /opt/venv/lib/python3.12/site-packages/sklearn/linear_model/_logistic.py:451: OptimizeWarning: Unknown solver options: iprint
#13 3.516 train accuracy: 0.973</div>
  <p>A newer scipy changed an internal option scikit-learn 1.6.1 still passes. Today it is a warning; next time it can be a crash or a different result. Adding <code>numpy==2.2.1</code> and <code>scipy==1.15.1</code> (or generating a full lockfile with <code>pip freeze &gt; requirements.lock</code>, pip-tools or uv) made the warning vanish. Pin the base image too (<code>python:3.12-slim</code>, or by digest).</p>
  <p><strong>2. Small images, and layers never forget.</strong> <code>docker history</code> shows what each layer added:</p>
  <div class="fx" data-lang="text">$ docker history iris-api:1.1 --format 'table {{.Size}}&#92;t{{.CreatedBy}}'     # trimmed
SIZE      CREATED BY
16.4kB    COPY app/ ./app/ # buildkit
12.3kB    COPY /build/model.joblib . # buildkit
323MB     COPY /opt/venv /opt/venv # buildkit
69.6kB    RUN /bin/sh -c useradd --create-home appuser…
...       (python:3.12-slim base layers)</div>
  <p>The venv (numpy, scipy, scikit-learn) is almost all of it; code and model are KBs. Now a trap test: one Dockerfile creates a 100 MB file in one <code>RUN</code> and deletes it in the next; the other does both in the same <code>RUN</code>.</p>
  <div class="fx" data-lang="text">$ cat Dockerfile.two
FROM python:3.12-slim
RUN head -c 100000000 /dev/urandom &gt; /tmp/data.bin
RUN rm /tmp/data.bin
$ cat Dockerfile.one
FROM python:3.12-slim
RUN head -c 100000000 /dev/urandom &gt; /tmp/data.bin &amp;&amp; rm /tmp/data.bin
$ docker images demo --format 'table {{.Repository}}:{{.Tag}}&#92;t{{.Size}}'
REPOSITORY:TAG   SIZE
demo:one         178MB
demo:two         378MB
$ docker history demo:two --format '{{.Size}}&#92;t{{.CreatedBy}}' | head -2
8.19kB	RUN /bin/sh -c rm /tmp/data.bin # buildkit
100MB	RUN /bin/sh -c head -c 100000000 /dev/urando…</div>
  <p>The <code>rm</code> layer only <em>hides</em> the file; the 100 MB layer below still ships (this Docker reports disk usage counting it both packed and unpacked, hence +200 MB). Download-and-delete in one <code>RUN</code>, or use multi-stage builds.</p>
  <p><strong>3. No secrets in the image.</strong> Anyone who can pull the image can read every layer and its settings:</p>
  <div class="fx" data-lang="text">$ cat Dockerfile.secret
FROM python:3.12-slim
ENV API_KEY=sk-live-abc123
$ docker history demo:secret --format '{{.CreatedBy}}' | head -1
ENV API_KEY=sk-live-abc123</div>
  <p>Pass secrets at run time (<code>-e</code>, <code>--env-file</code>, Compose/Kubernetes secrets, a cloud secret manager), or with BuildKit build secrets if the build itself needs one.</p>
  <p><strong>4. Set limits and know exit 137.</strong> We ran a script that keeps allocating 20 MB inside a container started with <code>-m 100m</code>:</p>
  <div class="fx" data-lang="text">$ docker run --name oom -m 100m --memory-swap 100m python:3.12-slim python -c "..."
allocated 20 MB
allocated 40 MB
allocated 60 MB
allocated 80 MB
$ echo "exit code: $?"
exit code: 137
$ docker inspect oom --format '{{.State.OOMKilled}} {{.State.ExitCode}}'
true 137</div>
  <p>No Python traceback, just exit 137 and <code>OOMKilled: true</code>. In Kubernetes this shows as <code>OOMKilled</code>. Fix the memory use (batch size, chunked loading, float32) or raise the limit.</p>
  <table class="tbl">
    <tr><th>Practice</th><th>Why</th></tr>
    <tr><td>Pin base + all packages (<code>==</code>, lockfile)</td><td>Same build next month; pickles load</td></tr>
    <tr><td>Slim base, multi-stage, <code>--no-cache-dir</code></td><td>Smaller image → faster pull, smaller attack surface</td></tr>
    <tr><td>Run as non-root (<code>USER appuser</code>)</td><td>A break-out from the app is not root</td></tr>
    <tr><td>No secrets in image</td><td>Every layer and ENV is readable</td></tr>
    <tr><td>Large models: download at start from S3/registry, or mount a volume</td><td>Don't rebuild a 5 GB image to swap weights</td></tr>
    <tr><td>Small models: bake in with a versioned tag</td><td>Fully self-contained and reproducible</td></tr>
    <tr><td>One process per container, log to stdout, HEALTHCHECK, exec-form CMD</td><td>Orchestrators restart, scale and stop it cleanly</td></tr>
    <tr><td>GPU: <code>nvidia/cuda</code> or <code>pytorch/pytorch</code> base matching the host driver</td><td>CUDA mismatch is the #1 GPU image failure</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reproducible build</strong>: same inputs (Dockerfile, pinned base and packages, code commit) give an equivalent image. <strong>Attack surface</strong>: everything in the image an attacker could use; fewer tools = smaller surface.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>COPY . .</code> without a <code>.dockerignore</code> can copy <code>.env</code>, <code>.git</code> (with history of old secrets) and the whole <code>data/</code> folder into the image. Always write the <code>.dockerignore</code> together with the Dockerfile.</p>
  </div>

  <h2 id="sd-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: code copied before requirements</span>
    <p>Every edit reinstalls all packages (39 s vs 0.4 s here). Copy <code>requirements.txt</code>, install, then copy code.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: listening on 127.0.0.1</span>
    <p>Port mapping works but curl gets "connection reset". Bind <code>0.0.0.0</code> inside containers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: localhost to reach another container</span>
    <p><code>localhost</code> is the container itself. Use the service/container name on a shared network.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: data in the container layer</span>
    <p>Gone on <code>docker rm</code> or redeploy. Use a named volume (and remember <code>compose down -v</code> deletes it).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shell-form CMD</span>
    <p><code>CMD uvicorn …</code> puts <code>sh</code> at PID 1; SIGTERM never reaches the app, stop takes 10 s and ends in SIGKILL (137). Use <code>CMD ["uvicorn", …]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: secrets via ENV or COPY .env</span>
    <p>Visible in <code>docker history</code> / layers to anyone with the image. Inject at run time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deploying :latest</span>
    <p>Moving label, no rollback, servers drift. Use version or git-SHA tags.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unpinned transitive packages</span>
    <p>Pinning only direct dependencies let numpy/scipy jump versions and change behaviour. Use a lockfile.</p>
  </div>

  <h2 id="sd-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Image vs container?</summary><div class="qa-body">An image is an immutable, layered template built from a Dockerfile. A container is a running (or stopped) instance of it with its own writable layer, process and network. One image can run as many containers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Container vs VM?</summary><div class="qa-body">A VM virtualises hardware and runs a full guest OS kernel (heavy, minutes to boot, strong isolation). A container is a process isolated with Linux namespaces and cgroups on the host kernel (light, seconds to start, weaker isolation). <code>uname -r</code> inside a container shows the host's kernel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Docker vs virtualenv?</summary><div class="qa-body">A virtualenv isolates Python packages only; it still uses the machine's Python interpreter and system libraries. A Docker image pins the OS libraries, the Python version, packages and config together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every small code change makes your build reinstall all pip packages. Why and how to fix?</summary><div class="qa-body">The Dockerfile copies all code before <code>pip install</code>, so any edit invalidates that layer and everything after it. Copy <code>requirements.txt</code> first, install, then <code>COPY</code> the code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a multi-stage build and why use it for ML?</summary><div class="qa-body">Several <code>FROM</code> stages in one Dockerfile; the final stage copies only needed artefacts (<code>COPY --from=builder</code>). Compilers, caches and training data stay out of the shipped image, making it smaller and safer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API container runs but curl from the host gets "connection reset". Likely causes?</summary><div class="qa-body">(1) App listens on <code>127.0.0.1</code> inside the container — bind <code>0.0.0.0</code>. (2) Missing or reversed <code>-p</code> mapping (host:container). (3) App still starting or crashed — check <code>docker logs</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API can't connect to Postgres at <code>localhost:5432</code> in Compose. Why?</summary><div class="qa-body"><code>localhost</code> is the API container itself. Use the service name: <code>db:5432</code>. Also make the API wait for db readiness (healthcheck + <code>service_healthy</code> + retries).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>EXPOSE 8000</code> do?</summary><div class="qa-body">Only documents the port (and lets <code>-P</code> pick it). It does not publish anything; you still need <code>-p host:container</code> for outside access.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CMD vs ENTRYPOINT? Exec vs shell form?</summary><div class="qa-body"><code>ENTRYPOINT</code> fixes the executable; <code>CMD</code> gives default arguments (or the default command) that <code>docker run img …</code> overrides. Use exec form (<code>["uvicorn", …]</code>) so the app is PID 1 and receives SIGTERM; shell form puts <code>/bin/sh</code> in front, so <code>docker stop</code> waits 10 s and SIGKILLs (exit 137).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? Container A writes <code>/tmp/x.txt</code>, is removed, then <code>docker run --rm img cat /tmp/x.txt</code>.</summary><div class="qa-body"><code>cat: /tmp/x.txt: No such file or directory</code>. Each container starts from the clean image; the writable layer died with container A. Use a volume to persist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Named volume vs bind mount?</summary><div class="qa-body">Named volume: storage managed by Docker (<code>-v name:/path</code>), portable, good for databases and production data. Bind mount: a specific host folder (<code>-v /host/path:/path</code>), good for development (live code, local datasets) but tied to that host's paths and permissions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do you keep a 4 GB model: in the image or outside?</summary><div class="qa-body">Usually outside: pull from S3/a model registry at start-up (or mount a volume), keyed by version. Keeps images small and lets you swap models without rebuilding. Small models can be baked in for full reproducibility. Either way, version it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use <code>:latest</code> in production?</summary><div class="qa-body">It's mutable: two servers can pull different images under the same tag, and you can't tell which version is running or roll back reliably. Use version or git-SHA tags (or digests).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you pass a database password to a container?</summary><div class="qa-body">At runtime: <code>-e</code>/<code>--env-file</code>, Compose/Kubernetes secrets, or a cloud secret manager. Never <code>ENV</code> or <code>COPY .env</code> in the Dockerfile — <code>docker history</code> and the layers reveal it to anyone who pulls the image.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A container keeps dying with exit code 137. What do you check?</summary><div class="qa-body">137 = killed by SIGKILL. Check <code>docker inspect --format '{{.State.OOMKilled}}'</code> (memory limit exceeded) and <code>dmesg</code>. Also possible: a <code>docker stop</code> whose SIGTERM was ignored (shell-form CMD) until the 10 s timeout.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why run as a non-root user?</summary><div class="qa-body">If the app is compromised, the attacker gets an unprivileged user instead of root, which limits damage and container-escape risk. Many clusters also enforce non-root policies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You deleted a large file in a later RUN, but the image did not shrink. Why?</summary><div class="qa-body">Layers are stacked; the later layer only hides the file, the earlier layer still contains it. Create and delete in the same <code>RUN</code>, or use a multi-stage build that copies only what is needed.</div></details>
</main>
`
});
