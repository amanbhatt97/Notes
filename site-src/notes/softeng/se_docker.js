// notes/softeng/se_docker.js — Docker
Object.assign(TOPIC_CONTENT, {
  "se_docker": `<main>
  <h1>Docker</h1>
  <p class="lead">Docker packages your model, code, Python and system libraries into one image that runs the same on a laptop, in CI and in the cloud. It's the standard way ML APIs are shipped, and the base of Kubernetes and most MLOps tools. Builds on the Linux note (processes, env vars, ports).</p>

  <h2 id="sd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Docker</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why Docker</div>
        <ul>
          <li><b>Problem</b> — "works on my machine": Python, package, system-lib, env-var drift</li>
          <li><b>Example</b> — sklearn 1.6 pickle won't load on 1.3; missing libgomp crashes LightGBM</li>
          <li><b>Flow</b> — Dockerfile → <code>docker build</code> → image → <code>docker run</code> → container</li>
          <li><b>Container vs VM</b> — isolated process on host kernel (MBs, seconds) vs full guest OS (GBs, minutes)</li>
          <li><b>Isolation via</b> — Linux namespaces + cgroups; weaker than a VM</li>
          <li><b>vs virtualenv</b> — venv isolates Python packages only, not Python or system libs</li>
          <li>💡 shipping container: every crane/ship handles the same box</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Images vs containers</div>
        <ul>
          <li><b>Image</b> — read-only layered template (class); <code>docker build</code>/<code>pull</code>, list <code>docker images</code></li>
          <li><b>Container</b> — running/stopped instance (object) + thin writable layer; list <code>docker ps -a</code></li>
          <li><b>One image → many containers</b> (different ports, tests)</li>
          <li>⚠ <b>Container writes are throwaway</b> — new container starts from clean image</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dockerfile &amp; layers</div>
        <ul>
          <li><b>Each instruction = cached layer</b>; a change invalidates that layer + all after it</li>
          <li><b>Order</b> — FROM → COPY requirements.txt → RUN pip install → COPY code (changes most) last</li>
          <li>⚠ <code>COPY . .</code> before pip install → every code edit reinstalls all packages</li>
          <li><b>Multi-stage</b> — <code>FROM … AS builder</code> builds/trains; final stage <code>COPY --from=builder</code> venv + model only</li>
          <li><b>Slim base</b> — <code>python:3.12-slim</code>; Alpine (musl) often breaks numpy/torch wheels</li>
          <li><b>.dockerignore</b> — keep .git, .venv, data/, .env out of build context</li>
          <li><b>CMD vs ENTRYPOINT</b> — ENTRYPOINT fixes executable; CMD = overridable default args; use exec form <code>["uvicorn", …]</code> so app is PID 1 and gets SIGTERM</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Build, run, ports, env</div>
        <ul>
          <li><b>Build</b> — <code>docker build -t iris-api:1.0 .</code></li>
          <li><b>Run</b> — <code>docker run -d --name iris -p 8080:8000 -e KEY=val img</code>; <code>--rm</code> auto-delete</li>
          <li><b><code>-p host:container</code></b> — opens a host port into the container</li>
          <li><b>Debug</b> — <code>docker logs -f</code>, <code>docker exec -it NAME bash</code>, <code>docker ps</code></li>
          <li><b>Lifecycle</b> — <code>stop</code> (SIGTERM) / <code>rm</code> container / <code>rmi</code> image; <code>--gpus all</code> needs NVIDIA toolkit</li>
          <li>⚠ App must bind <code>0.0.0.0</code>, not <code>127.0.0.1</code> → else "connection reset"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Volumes</div>
        <ul>
          <li><b>Named volume</b> — <code>-v mldata:/data</code>; Docker-managed, outlives containers (DB files, logs)</li>
          <li><b>Bind mount</b> — <code>-v "$PWD/data":/data</code>; host folder inside (dev, live code)</li>
          <li><b>tmpfs</b> — in-memory, gone on stop (scratch, secrets)</li>
          <li>💡 container = hotel room cleaned at checkout; volume = locker in the lobby</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Networking</div>
        <ul>
          <li><b>User-defined network</b> — <code>docker network create mlnet</code>; containers resolve each other by <b>name</b> (built-in DNS)</li>
          <li><b>Default network</b> — names don't resolve ("Name or service not known")</li>
          <li><b>Container → container</b> uses container port (<code>api:8000</code>); <code>-p</code> is only for host</li>
          <li>⚠ <code>localhost</code> inside a container = that container → use <code>db:5432</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Docker Compose</div>
        <ul>
          <li><b>What</b> — multi-container app (api + Postgres + Redis) in one <code>compose.yaml</code></li>
          <li><b>Keys</b> — <code>services</code>, <code>image</code>/<code>build</code>, <code>ports</code>, <code>environment</code>, <code>volumes</code>, <code>healthcheck</code>, <code>depends_on</code></li>
          <li><b>Auto network</b> — services reach each other by service name</li>
          <li><b>Commands</b> — <code>up -d</code>, <code>ps</code>, <code>exec svc cmd</code>, <code>down</code> (keeps volumes) / <code>down -v</code> (deletes them)</li>
          <li>⚠ Plain <code>depends_on</code> only orders start-up → healthcheck + <code>condition: service_healthy</code> + retry in code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Registries &amp; tags</div>
        <ul>
          <li><b>Flow</b> — build → <code>docker tag img ghcr.io/user/name:1.1</code> → <code>push</code> → server pulls → run</li>
          <li><b>Tag = label</b>; same image ID can have many names</li>
          <li><b>Registries</b> — Docker Hub, ghcr.io, AWS ECR, GCP Artifact Registry</li>
          <li>⚠ <code>:latest</code> = default tag, mutable, not "newest" → deploy version / git-SHA tags (or digests) for rollback</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ML best practices</div>
        <ul>
          <li><b>Pin</b> base image + <code>==</code> package versions → pickles load next month</li>
          <li><b>Small</b> — slim + multi-stage + <code>--no-cache-dir</code>; inspect with <code>docker history</code></li>
          <li><b>Non-root</b> — <code>USER appuser</code>: compromise ≠ root on host</li>
          <li><b>No secrets in image</b> — layers readable by anyone; pass at runtime (<code>-e</code>, <code>--env-file</code>, secret manager)</li>
          <li><b>Big models</b> outside image (S3/registry/volume); small ones baked in with versioned tag</li>
          <li><b>Ops</b> — one process per container, log to stdout, HEALTHCHECK</li>
          <li><b>GPU</b> — <code>nvidia/cuda</code> / <code>pytorch/pytorch</code> base matching host driver</li>
          <li>⚠ Deleting a file in a later layer doesn't shrink image → download+delete in same RUN</li>
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
      <div class="rm-item rm-done" data-target="sd-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sd-why"><span class="num">01</span>The Problem: "It Works on My Machine"</h2>
  <table class="tbl">
    <tr><th></th><th>Your laptop</th><th>Prod server</th></tr>
    <tr><td>Python</td><td>3.12</td><td>3.9</td></tr>
    <tr><td>scikit-learn</td><td>1.6.1</td><td>1.3.0 → pickle won't load</td></tr>
    <tr><td>System libs</td><td>libgomp present</td><td>missing → LightGBM crashes</td></tr>
    <tr><td>Env vars / paths</td><td>set in your .bashrc</td><td>unset</td></tr>
  </table>
  <div class="flow"><span>Dockerfile (recipe)</span><span>docker build</span><span>Image (sealed box)</span><span>docker run anywhere</span><span>Container (running)</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shipping container: the port doesn't care what's inside; every crane and ship handles the same box. Your app ships with its own OS libraries, Python and packages.</p>
  </div>
  <div class="cards">
    <div><b>Virtual machine</b><p>Full guest OS + kernel. GBs, boots in minutes. Strong isolation.</p></div>
    <div><b>Container</b><p>Isolated process sharing the host kernel. MBs, starts in seconds.</p></div>
    <div><b>virtualenv</b><p>Isolates Python packages only — not Python itself or system libs.</p></div>
  </div>

  <h2 id="sd-img"><span class="num">02</span>Images vs Containers</h2>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="sd-arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="45" width="170" height="70" rx="8" class="fb sb"/><text x="95" y="73" text-anchor="middle">Image iris-api:1.0</text><text x="95" y="95" text-anchor="middle" class="tm">read-only layers</text>
    <rect x="330" y="10" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="35" text-anchor="middle">container A  :8080</text>
    <rect x="330" y="60" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="85" text-anchor="middle">container B  :8081</text>
    <rect x="330" y="110" width="250" height="40" rx="8" class="fg sg"/><text x="455" y="135" text-anchor="middle">container C  (test)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="182" y1="70" x2="326" y2="30" marker-end="url(#sd-arr1)"/><line x1="182" y1="80" x2="326" y2="80" marker-end="url(#sd-arr1)"/><line x1="182" y1="90" x2="326" y2="130" marker-end="url(#sd-arr1)"/></g>
    <text x="255" y="155" text-anchor="middle" class="tm">docker run</text>
  </svg><figcaption>One image, many containers. Each container adds its own thin writable layer on top.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Image</th><th>Container</th></tr>
    <tr><td>Is</td><td>Read-only template (layers + metadata)</td><td>A running (or stopped) instance of an image</td></tr>
    <tr><td>OOP analogy</td><td>Class</td><td>Object</td></tr>
    <tr><td>Made by</td><td><code>docker build</code> / <code>pull</code></td><td><code>docker run</code></td></tr>
    <tr><td>Lists with</td><td><code>docker images</code></td><td><code>docker ps -a</code></td></tr>
  </table>
  <p>Proof that container writes are throwaway:</p>
  <div class="fx" data-lang="text">$ docker run --name tmp1 python:3.12-slim sh -c 'echo hello &gt; /tmp/x.txt; cat /tmp/x.txt'
hello
$ docker rm tmp1
$ docker run --rm python:3.12-slim sh -c 'cat /tmp/x.txt'
cat: /tmp/x.txt: No such file or directory</div>

  <h2 id="sd-file"><span class="num">03</span>Dockerfile for a Small ML API</h2>
  <p>Project: a FastAPI app serving an iris classifier. Files: <code>requirements.txt</code>, <code>train.py</code>, <code>app/main.py</code>.</p>
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
  <div class="fx" data-lang="text"># Dockerfile
# ---- stage 1: build deps + train ----
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
  <div class="fx" data-lang="text"># requirements.txt (pinned)        # .dockerignore (keep build context small + safe)
fastapi==0.115.6                    .git
uvicorn==0.34.0                     .venv
scikit-learn==1.6.1                 __pycache__/
joblib==1.4.2                       *.ipynb
                                    data/
                                    .env</div>
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
  <p>Real rebuild after editing only <code>app/main.py</code> (trimmed):</p>
  <div class="fx" data-lang="text">#6 [builder 6/8] RUN pip install --no-cache-dir -r requirements.txt
#6 CACHED
#9 [builder 8/8] RUN python train.py
#9 CACHED
#13 [stage-1 4/6] COPY --from=builder /opt/venv /opt/venv
#13 CACHED
#17 [stage-1 6/6] COPY app/ ./app/
#17 DONE 0.1s</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>COPY . .</code> before <code>pip install</code> means every code edit re-installs all packages. Copy <code>requirements.txt</code> alone first.</p>
  </div>
  <div class="cards">
    <div><b>Slim base</b><p><code>python:3.12-slim</code> drops compilers and docs. Alpine (musl) often breaks numpy/torch wheels.</p></div>
    <div><b>Multi-stage</b><p>Build tools and training stay in stage 1; only the venv + model are copied to the final image.</p></div>
    <div><b>.dockerignore</b><p>Keeps data, .git and secrets out of the build context (and the image).</p></div>
  </div>

  <h2 id="sd-run"><span class="num">04</span>Build, Run, Ports &amp; Env</h2>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="sd-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="130" height="50" rx="8" class="fs"/><text x="75" y="60" text-anchor="middle">curl / browser</text>
    <rect x="200" y="15" width="390" height="85" rx="10" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="215" y="33" class="tm">host machine</text>
    <rect x="215" y="45" width="110" height="40" rx="6" class="fb sb"/><text x="270" y="70" text-anchor="middle">port 8080</text>
    <rect x="400" y="40" width="175" height="50" rx="8" class="fg sg"/><text x="487" y="62" text-anchor="middle">container</text><text x="487" y="80" text-anchor="middle" class="tm">uvicorn :8000</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="142" y1="65" x2="211" y2="65" marker-end="url(#sd-arr2)"/><line x1="327" y1="65" x2="396" y2="65" marker-end="url(#sd-arr2)"/></g>
    <text x="362" y="115" text-anchor="middle" class="tb">-p 8080:8000  (host:container)</text>
  </svg><figcaption>Containers are isolated; -p opens a door from a host port to a container port.</figcaption></figure>
  <div class="fx" data-lang="text">$ docker build -t iris-api:1.0 .
 ...
#14 2.427 train accuracy: 0.973
#18 naming to docker.io/library/iris-api:1.0 done

$ docker run -d --name iris -p 8080:8000 -e MODEL_PATH=model.joblib iris-api:1.0
b43a597ba20c05cc1c1db8f5612fd08b2d4eac6ab68c70533add22d11f0ab049

$ curl -s localhost:8080/health
{"status":"ok"}
$ curl -s -X POST localhost:8080/predict -H "Content-Type: application/json" -d '[6.7, 3.0, 5.2, 2.3]'
{"class":2}

$ docker ps --format 'table {{.Names}}&#92;t{{.Image}}&#92;t{{.Ports}}&#92;t{{.Status}}'
NAMES   IMAGE          PORTS                    STATUS
iris    iris-api:1.0   0.0.0.0:8080-&gt;8000/tcp   Up 3 seconds
$ docker exec iris whoami
appuser
$ docker logs iris | tail -2
INFO:     172.17.0.1:57824 - "GET /health HTTP/1.1" 200 OK
INFO:     172.17.0.1:57826 - "POST /predict HTTP/1.1" 200 OK</div>
  <p>Run here for real (Docker 29). The sandbox's build also needed proxy/CA flags; those are environment-specific and omitted above.</p>
  <table class="tbl">
    <tr><th>Flag / command</th><th>Meaning</th></tr>
    <tr><td><code>-d</code> / <code>--rm</code></td><td>Run in background / delete container when it exits</td></tr>
    <tr><td><code>-e KEY=val</code>, <code>--env-file .env</code></td><td>Env vars (config, secrets at runtime — never baked into the image)</td></tr>
    <tr><td><code>docker exec -it NAME bash</code></td><td>Shell inside a running container</td></tr>
    <tr><td><code>docker logs -f NAME</code></td><td>Follow stdout/stderr</td></tr>
    <tr><td><code>docker stop</code> / <code>rm</code> / <code>rmi</code></td><td>Stop (SIGTERM) / delete container / delete image</td></tr>
    <tr><td><code>--gpus all</code></td><td>Expose GPUs (needs NVIDIA Container Toolkit; not run here)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A server inside a container must listen on <code>0.0.0.0</code>, not <code>127.0.0.1</code> — otherwise <code>-p</code> forwards to nothing and curl gets "connection reset".</p>
  </div>

  <h2 id="sd-vol"><span class="num">05</span>Volumes</h2>
  <div class="cards">
    <div><b>Named volume</b><p><code>-v mldata:/data</code>. Docker-managed storage; survives container deletion.</p><small>DB files, experiment logs</small></div>
    <div><b>Bind mount</b><p><code>-v "$PWD/data":/data</code>. A host folder appears inside.</p><small>Dev: live code, local datasets</small></div>
    <div><b>tmpfs</b><p>In-memory only, gone on stop.</p><small>Scratch, secrets</small></div>
  </div>
  <div class="fx" data-lang="text">$ docker volume create mldata
$ docker run --rm -v mldata:/data python:3.12-slim sh -c 'echo "run-1 metrics" &gt;&gt; /data/log.txt'
$ docker run --rm -v mldata:/data python:3.12-slim cat /data/log.txt     # brand-new container
run-1 metrics
$ docker run --rm -v "$PWD/host_data":/data python:3.12-slim ls -l /data
total 4
-rw-r--r-- 1 root root 4 Oct 16 06:29 in.csv</div>
  <p>The second container is new, yet the file is there: the volume lives outside any container.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A container is a hotel room — cleaned after checkout. A volume is your locker in the lobby; any room you stay in can open it.</p>
  </div>

  <h2 id="sd-net"><span class="num">06</span>Networking</h2>
  <div class="fx" data-lang="text">$ docker network create mlnet
$ docker run -d --rm --name api --network mlnet iris-api:1.1
$ docker run --rm --network mlnet python:3.12-slim python -c "import urllib.request;print(urllib.request.urlopen('http://api:8000/health').read().decode())"
{"status":"ok"}
$ docker run --rm python:3.12-slim python -c "import urllib.request;urllib.request.urlopen('http://api:8000/health')"
urllib.error.URLError: &lt;urlopen error [Errno -2] Name or service not known&gt;</div>
  <ul>
    <li>On a user-defined network, containers reach each other by <strong>container name</strong> via Docker's built-in DNS.</li>
    <li>The last container was on the default network, so the name <code>api</code> doesn't resolve.</li>
    <li>Container-to-container uses the <em>container</em> port (8000); <code>-p</code> is only for the host.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>localhost</code> inside a container means <em>that container</em>. To reach Postgres in another container use its service name (<code>db:5432</code>), not <code>localhost:5432</code>.</p>
  </div>

  <h2 id="sd-compose"><span class="num">07</span>Docker Compose: API + Postgres + Redis</h2>
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
  <div class="fx" data-lang="text">$ docker compose up -d
 Container mlstack-db-1 Waiting
 Container mlstack-db-1 Healthy
 Container mlstack-api-1 Started
$ docker compose ps
SERVICE   IMAGE                STATUS                   PORTS
api       iris-api:1.1         Up Less than a second    0.0.0.0:8080-&gt;8000/tcp
cache     redis:7-alpine       Up 6 seconds             6379/tcp
db        postgres:16-alpine   Up 6 seconds (healthy)   5432/tcp
$ docker compose exec cache redis-cli ping
PONG
$ docker compose exec api python -c "import os;print(os.environ['REDIS_URL'])"
redis://cache:6379/0
$ docker compose down -v        # stop, remove containers, network AND volumes</div>
  <p>The api waited for db's healthcheck before starting. <code>down</code> without <code>-v</code> keeps the Postgres data volume.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Plain <code>depends_on</code> only orders <em>start-up</em>; it doesn't wait for Postgres to accept connections. Use a healthcheck + <code>condition: service_healthy</code>, and still retry in code.</p>
  </div>

  <h2 id="sd-reg"><span class="num">08</span>Registries &amp; Tagging</h2>
  <div class="flow"><span>build</span><span>tag registry/user/name:version</span><span>push</span><span>server pulls</span><span>run</span></div>
  <div class="fx" data-lang="text">$ docker tag iris-api:1.1 ghcr.io/asha/iris-api:1.1
$ docker tag iris-api:1.1 ghcr.io/asha/iris-api:latest
$ docker images | grep iris
ghcr.io/asha/iris-api   1.1      22f9a8e18e5a
ghcr.io/asha/iris-api   latest   22f9a8e18e5a
iris-api                1.1      22f9a8e18e5a
iris-api                1.0      d9806ada85f0
$ docker login ghcr.io &amp;&amp; docker push ghcr.io/asha/iris-api:1.1    # not run here</div>
  <p>Same image ID, three names: a tag is just a label. Registries: Docker Hub, GitHub (ghcr.io), AWS ECR, GCP Artifact Registry.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>:latest</code> is not "newest" — it's just the default tag, and it moves. Deploy immutable tags (version or git SHA) so you know exactly which model is live and can roll back.</p>
  </div>

  <h2 id="sd-best"><span class="num">09</span>Best Practices for ML Images</h2>
  <div class="fx" data-lang="text">$ docker history iris-api:1.1        # trimmed
SIZE      CREATED BY
16.4kB    COPY app/ ./app/
12.3kB    COPY /build/model.joblib .
311MB     COPY /opt/venv /opt/venv          # numpy + scipy + sklearn dominate
69.6kB    RUN useradd --create-home appuser
...       (python:3.12-slim base layers)</div>
  <table class="tbl">
    <tr><th>Practice</th><th>Why</th></tr>
    <tr><td>Pin base + packages (<code>python:3.12-slim</code>, <code>==</code> versions, lockfile)</td><td>Same build next month; pickles load</td></tr>
    <tr><td>Slim base, multi-stage, <code>--no-cache-dir</code></td><td>Smaller image → faster pull, smaller attack surface</td></tr>
    <tr><td>Run as non-root (<code>USER appuser</code>)</td><td>A breakout from the app isn't root on the host</td></tr>
    <tr><td>No secrets in image (use <code>-e</code>, secret managers, build secrets)</td><td>Anyone with the image can read every layer</td></tr>
    <tr><td>Large models: download at start from S3/registry, or mount a volume</td><td>Don't rebuild a 5 GB image to swap weights; keep image = code</td></tr>
    <tr><td>Small models: bake in with a versioned tag</td><td>Image fully self-contained and reproducible</td></tr>
    <tr><td>One process per container, log to stdout, add HEALTHCHECK</td><td>Orchestrators restart and scale it cleanly</td></tr>
    <tr><td>GPU: start from <code>nvidia/cuda</code> or <code>pytorch/pytorch</code> images matching host driver</td><td>CUDA mismatch is the #1 GPU image failure</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deleting a file in a later layer doesn't shrink the image — it's still in the earlier layer. Download-and-delete in the <em>same</em> <code>RUN</code>, or use multi-stage.</p>
  </div>

  <h2 id="sd-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Image vs container?</summary><div class="qa-body">An image is an immutable, layered template built from a Dockerfile. A container is a running instance of it with its own writable layer, process and network. One image can run as many containers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Container vs VM?</summary><div class="qa-body">A VM virtualises hardware and runs a full guest OS kernel (heavy, minutes to boot, strong isolation). A container is a process isolated with Linux namespaces and cgroups on the host kernel (light, seconds to start, weaker isolation).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every small code change makes your build reinstall all pip packages. Why and how to fix?</summary><div class="qa-body">The Dockerfile copies all code before <code>pip install</code>, so any edit invalidates that layer and everything after. Copy <code>requirements.txt</code> first, install, then <code>COPY</code> the code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a multi-stage build and why use it for ML?</summary><div class="qa-body">Several <code>FROM</code> stages in one Dockerfile; the final stage copies only needed artefacts (<code>COPY --from=builder</code>). Compilers, build caches, and training data stay out of the shipped image, making it smaller and safer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API container runs but curl from the host gets "connection reset". Likely causes?</summary><div class="qa-body">(1) App listens on <code>127.0.0.1</code> inside the container — bind <code>0.0.0.0</code>. (2) Missing or wrong <code>-p</code> mapping (host:container order). (3) App crashed — check <code>docker logs</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API container can't connect to Postgres at <code>localhost:5432</code> in Compose. Why?</summary><div class="qa-body"><code>localhost</code> is the API container itself. Use the service name: <code>db:5432</code>. Also make sure the API waits for db readiness (healthcheck + retries).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do you keep a 4 GB model: in the image or outside?</summary><div class="qa-body">Usually outside: pull from S3/model registry at start-up (or mount a volume), keyed by a version. Keeps images small and lets you swap models without rebuilding. Small models can be baked in for full reproducibility — either way, version it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use <code>:latest</code> in production?</summary><div class="qa-body">It's mutable: two servers can pull different images under the same tag, and you can't tell which version is running or roll back reliably. Use version or git-SHA tags (or digests).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you pass a database password to a container?</summary><div class="qa-body">At runtime: <code>-e</code>/<code>--env-file</code>, Compose/Kubernetes secrets, or a cloud secret manager. Never <code>ENV</code> or <code>COPY .env</code> in the Dockerfile — image layers are readable by anyone who pulls it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? Container A writes <code>/tmp/x.txt</code>, is removed, then <code>docker run --rm img cat /tmp/x.txt</code>.</summary><div class="qa-body"><code>cat: /tmp/x.txt: No such file or directory</code>. Each container starts from the clean image; the writable layer died with container A. Use a volume to persist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why run as a non-root user?</summary><div class="qa-body">If the app is compromised, the attacker gets an unprivileged user instead of root, which limits damage and container-escape risk. Many clusters also enforce non-root policies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CMD vs ENTRYPOINT?</summary><div class="qa-body"><code>ENTRYPOINT</code> fixes the executable; <code>CMD</code> gives default arguments (or the default command) that <code>docker run img ...</code> overrides. Use exec form (<code>["uvicorn", ...]</code>) so the app is PID 1 and receives SIGTERM for graceful shutdown.</div></details>
</main>`
});
