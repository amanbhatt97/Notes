// notes/mlops/mlops_k8s.js — Kubernetes for ML
Object.assign(TOPIC_CONTENT, {
  "mlops_k8s": `<main>
  <h1>Kubernetes for ML</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span><span>Kubernetes for ML</span></div>
  <p class="lead">One container on one machine is not a service: it dies with the machine, can't absorb the lunch rush, and can't be upgraded without downtime. Kubernetes runs many copies of the Biteful ETA image across many machines and keeps them in the state you declare: so many replicas, this much CPU, this config, reachable at this address, scaled with load, upgraded step by step. This note builds the manifests for the ETA server: pods, Deployment, Service, ConfigMap, Secret, volumes, resources and GPUs, the autoscaler, rolling / blue-green / canary rollouts, a Helm chart, and KServe and Kubeflow. <strong>Honest limit:</strong> this sandbox has no Kubernetes cluster (no kind, k3d or minikube), so no <code>kubectl</code> command was run against a cluster; every manifest was instead checked against the official Kubernetes 1.37 schemas with <code>kubernetes-validate --strict</code> (real output below), and the scheduling, autoscaling and rollout rules were reproduced in small Python simulations that were really run. <code>kubectl</code> and <code>helm</code> commands are labelled "not run".</p>

  <h2 id="k8-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="k8-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="30" text-anchor="middle" font-size="12">1 · CI/CD</text><text x="85" y="46" text-anchor="middle" class="tm" font-size="10">image eta:&lt;sha&gt;</text>
<rect x="180" y="10" width="140" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="250" y="30" text-anchor="middle" font-size="12">2 · Serving</text><text x="250" y="46" text-anchor="middle" class="tm" font-size="10">/health, /ready, /predict</text>
<rect x="340" y="10" width="140" height="46" rx="7" class="fg sg" stroke-width="2.5"/><text x="410" y="30" text-anchor="middle" font-size="12" font-weight="700">3 · Kubernetes</text><text x="410" y="46" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<rect x="500" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="575" y="30" text-anchor="middle" font-size="12">4 · Cloud &amp; IaC</text><text x="575" y="46" text-anchor="middle" class="tm" font-size="10">where the nodes come from</text>
<line x1="160" y1="33" x2="178" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#k8-a0)"/><line x1="320" y1="33" x2="338" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#k8-a0)"/><line x1="480" y1="33" x2="498" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#k8-a0)"/>
<text x="330" y="90" text-anchor="middle" class="tm" font-size="10.5">in: one container that answers 56.1 min for Monday order 2</text>
<text x="330" y="110" text-anchor="middle" class="tm" font-size="10.5">out: 2–10 self-healing replicas behind one address, upgraded by rolling, blue-green or canary</text>
</svg><figcaption>The third shipping note: from one container to a fleet that heals, scales and upgrades itself.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="mlops_serving">Model Serving &amp; Inference</a> and <a class="xref" data-note="mlops_cicd">CI/CD for ML</a></b><span>CI builds <code>ghcr.io/biteful/eta:&lt;sha&gt;</code>; the server inside reports <code>/health</code> (alive) and <code>/ready</code> (model loaded); shadow and canary were shown in code. Left open: who restarts it at 2 a.m., who adds copies at lunch, who splits traffic between versions? <a class="xref" data-note="se_docker">Docker</a> and <a class="xref" data-note="se_linux">Linux</a> gave us containers, processes, signals and exit codes like 137.</span></li>
    <li><b>This note adds: orchestration</b><span>Desired state and reconciliation; pods, Deployments, Services; ConfigMaps, Secrets, persistent volumes; requests, limits and GPU scheduling; the Horizontal Pod Autoscaler; rolling, blue-green and canary rollouts; Helm charts; Kubeflow and KServe.</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a>: where the cluster's machines come from, managed alternatives, and Terraform. Production backends in general (load balancers, horizontal scaling) are in <a class="xref" data-note="api_production">Production Backend</a>; LLM serving on GPUs in <a class="xref" data-note="llm_prod">LLMOps</a>.</span></li>
  </ol>

  <h2 id="k8-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>Running example: the Biteful ETA image (champion v2, boosting) and the old v1 image (forest). Monday lunch: CPU load rises from 45% to 96% of what the pods requested between 11:30 and 12:00.</p>
  <ol class="story">
    <li><b>Why orchestration</b><span>Q: what happens when the one container or its machine dies, or lunch traffic triples? → Someone must restart, add and spread copies. Kubernetes does it by comparing desired state (3 replicas) with actual state, forever. What objects describe that state?</span></li>
    <li><b>Pods, Deployments, Services</b><span>Q: how do we say "3 copies of this image, reachable at one address"? → A Deployment stamps out pods from a template; a Service gives one stable name that load-balances over <em>ready</em> pods. But settings and passwords are baked into nothing yet…</span></li>
    <li><b>ConfigMaps, Secrets, volumes</b><span>Q: where do settings, secrets and big files go? → ConfigMap for <code>MODEL_VERSION</code>, Secret for the MLflow token (base64, not encrypted), a PersistentVolumeClaim for 20 GiB of weights. How many pods fit on a machine, and what about GPUs?</span></li>
    <li><b>Resources &amp; GPU scheduling</b><span>Q: how does Kubernetes decide where a pod runs and how much it may use? → Requests (500m CPU) reserve, limits cap; 7 ETA pods fit on a 4-core node; GPUs are whole units placed with node selectors and tolerations. Lunch load still changes hourly…</span></li>
    <li><b>HPA</b><span>Q: how do we scale with load automatically? → desired = ceil(current × utilisation / target): 2 pods at 96% → 3, 3 at 88% → 4, back to 2 at 14:00. Now v2 must replace v1 without downtime…</span></li>
    <li><b>Rollouts</b><span>Q: how do we upgrade safely? → Rolling (maxSurge 1, maxUnavailable 0: never fewer than 3 ready), blue-green (flip the Service selector), canary (9 + 1 replicas ≈ 10% of traffic). Ten YAML files per environment are getting repetitive…</span></li>
    <li><b>Helm</b><span>Q: how do we package and vary manifests per environment? → A chart: templates + values; <code>values-prod.yaml</code> sets 6–30 replicas. Is there something made for ML on Kubernetes?</span></li>
    <li><b>Kubeflow &amp; KServe</b><span>Q: ML-specific building blocks? → KServe's <code>InferenceService</code> (one resource for serving, autoscaling, canary %), Kubeflow Pipelines for training workflows. Then: where does the cluster itself come from? (cloud note)</span></li>
  </ol>

  <h2 id="k8-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Kubernetes for ML</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea</div>
        <ul>
          <li><b>Declarative</b> — write desired state in YAML</li>
          <li><b>Reconcile loop</b> — controllers fix desired vs actual forever</li>
          <li><b>Control plane</b> — API server, etcd, scheduler, controllers</li>
          <li><b>Nodes</b> — kubelet runs pods</li>
          <li>💡 a restaurant manager who keeps 3 chefs on shift</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core objects</div>
        <ul>
          <li><b>Pod</b> — one or more containers, one IP</li>
          <li><b>Deployment</b> — N replicas from a template; rollouts; undo</li>
          <li><b>Service</b> — stable name, load-balances to ready pods</li>
          <li><b>Probes</b> — startup, readiness (/ready), liveness (/health)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Config &amp; storage</div>
        <ul>
          <li><b>ConfigMap</b> — plain settings → env vars</li>
          <li><b>Secret</b> — base64, NOT encryption; RBAC + encryption at rest</li>
          <li><b>PVC</b> — claim 20Gi for model weights</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Resources &amp; GPUs</div>
        <ul>
          <li><b>Requests</b> — reserved, used for scheduling: 7 pods/node</li>
          <li><b>Limits</b> — CPU throttled, memory → OOMKilled (137)</li>
          <li><b>GPU</b> — <code>nvidia.com/gpu: 1</code>, whole units, device plugin</li>
          <li><b>Placement</b> — nodeSelector, taints &amp; tolerations</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">HPA</div>
        <ul>
          <li><b>Rule</b> — ceil(current × util / target), clamp [min, max]</li>
          <li><b>Lunch</b> — 2 → 3 → 4 → 2 pods</li>
          <li><b>Needs</b> — requests set, metrics server</li>
          <li><b>Stabilisation</b> — 5 min before scale-down</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rollouts</div>
        <ul>
          <li><b>Rolling</b> — maxSurge 1, maxUnavailable 0; <code>rollout undo</code></li>
          <li><b>Blue-green</b> — two Deployments; flip Service selector</li>
          <li><b>Canary</b> — 9 + 1 replicas ≈ 10%; or weights (Istio, Argo Rollouts)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Packaging &amp; ML</div>
        <ul>
          <li><b>Helm</b> — chart = templates + values; install/upgrade/rollback</li>
          <li><b>KServe</b> — InferenceService, canaryTrafficPercent, scale to zero</li>
          <li><b>Kubeflow</b> — Pipelines, notebooks, training operators</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="k8-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Orchestration</span><span class="rm-sub">Desired state, reconcile loop</span></div></div>
      <div class="rm-item rm-done" data-target="k8-core"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pods, Deployments, Services</span><span class="rm-sub">The core objects</span></div></div>
      <div class="rm-item rm-done" data-target="k8-config"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">ConfigMaps, Secrets, Volumes</span><span class="rm-sub">Settings, passwords, weights</span></div></div>
      <div class="rm-item rm-done" data-target="k8-res"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Resources &amp; GPU Scheduling</span><span class="rm-sub">Requests, limits, placement</span></div></div>
      <div class="rm-item rm-done" data-target="k8-hpa"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Horizontal Pod Autoscaler</span><span class="rm-sub">Scaling with lunch traffic</span></div></div>
      <div class="rm-item rm-done" data-target="k8-roll"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Rollouts</span><span class="rm-sub">Rolling, blue-green, canary</span></div></div>
      <div class="rm-item rm-done" data-target="k8-helm"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Helm</span><span class="rm-sub">Charts and values</span></div></div>
      <div class="rm-item rm-done" data-target="k8-kf"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Kubeflow &amp; KServe</span><span class="rm-sub">ML on Kubernetes</span></div></div>
      <div class="rm-item rm-done" data-target="k8-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="k8-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Pending, OOMKilled, CrashLoop</span></div></div>
      <div class="rm-item rm-done" data-target="k8-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="k8-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="k8-why"><span class="num">01</span>Why Orchestration: Desired State and the Reconcile Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The ETA container runs on one server. At 2 a.m. the server's disk fails. At 12:00 checkout traffic triples. Next week v2 must replace v1. With plain <code>docker run</code>, a human does all three. What would a system need to do them by itself?</p>
  </div>
  <p>Three jobs: keep the right number of copies running (restart or replace failed ones, on other machines if needed), spread requests over the copies, and change the copies (count or version) without dropping requests. <strong>Kubernetes</strong> (K8s) is the standard system for this. Its central idea: you never say "start a container"; you declare the state you want ("3 replicas of image X"), and <strong>controllers</strong> compare it with what is actually running and fix any difference, in a loop that never stops.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant manager with a rule on the wall: "3 chefs on shift". If a chef goes home sick, the manager calls in another; if the owner changes the rule to 5, two more are called in. Nobody tells the manager <em>how</em>; the rule is the desired state, the manager is the controller.</p>
  </div>
  <p>The whole idea in a toy controller (a simulation in plain Python, really run; a real controller watches the cluster through the API server):</p>
  <div class="fx" data-lang="py"># a toy controller: Kubernetes' core idea in 15 lines — compare desired vs actual, fix the difference
desired = 3
pods = ["eta-a", "eta-b", "eta-c"]
events = {2: "crash eta-b", 4: "node lost: eta-a, eta-c", 6: "scale to 5"}
next_id = iter("defghijk")
for tick in range(1, 8):
    e = events.get(tick, "")
    if e.startswith("crash"):  pods.remove("eta-b")
    if e.startswith("node"):   pods = [p for p in pods if p not in ("eta-a", "eta-c")]
    if e.startswith("scale"):  desired = 5
    while len(pods) &lt; desired:                       # reconcile: start missing pods
        pods.append("eta-" + next(next_id))
    while len(pods) &gt; desired:                       # ... or stop extra ones
        pods.pop()
    print(f"t={tick} {e:24s} desired={desired} running={pods}")</div>
  <div class="fx" data-lang="text">t=1                          desired=3 running=['eta-a', 'eta-b', 'eta-c']
t=2 crash eta-b              desired=3 running=['eta-a', 'eta-c', 'eta-d']
t=3                          desired=3 running=['eta-a', 'eta-c', 'eta-d']
t=4 node lost: eta-a, eta-c  desired=3 running=['eta-d', 'eta-e', 'eta-f']
t=5                          desired=3 running=['eta-d', 'eta-e', 'eta-f']
t=6 scale to 5               desired=5 running=['eta-d', 'eta-e', 'eta-f', 'eta-g', 'eta-h']
t=7                          desired=5 running=['eta-d', 'eta-e', 'eta-f', 'eta-g', 'eta-h']</div>
  <p>At t=2 a pod crashes and the loop immediately starts <code>eta-d</code>. At t=4 a whole node is lost with two pods; the loop starts two replacements. At t=6 someone changes the desired count to 5 and the loop adds two. Nobody wrote "restart eta-b"; the loop only ever compares two numbers.</p>
  <figure class="viz"><svg viewBox="0 0 640 180" width="640">
    <defs><marker id="k8-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="250" height="140" rx="8" fill="none" stroke="currentColor" stroke-dasharray="5 3"/><text x="20" y="38" class="tm" font-size="11">control plane</text>
    <rect x="25" y="48" width="105" height="32" rx="5" class="fv" stroke="currentColor"/><text x="77" y="68" text-anchor="middle" font-size="11">API server</text>
    <rect x="140" y="48" width="105" height="32" rx="5" class="fs" stroke="currentColor"/><text x="192" y="68" text-anchor="middle" font-size="11">etcd (state)</text>
    <rect x="25" y="92" width="105" height="32" rx="5" class="fb sb"/><text x="77" y="112" text-anchor="middle" font-size="11">scheduler</text>
    <rect x="140" y="92" width="105" height="32" rx="5" class="fb sb"/><text x="192" y="112" text-anchor="middle" font-size="11">controllers</text>
    <text x="135" y="148" text-anchor="middle" class="tm" font-size="10">kubectl apply → API server → stored in etcd</text>
    <rect x="320" y="20" width="150" height="140" rx="8" class="fs" stroke="currentColor"/><text x="395" y="38" text-anchor="middle" font-size="11">node 1 (kubelet)</text>
    <rect x="335" y="50" width="120" height="26" rx="5" class="fg sg"/><text x="395" y="68" text-anchor="middle" font-size="11">pod eta (v2)</text>
    <rect x="335" y="84" width="120" height="26" rx="5" class="fg sg"/><text x="395" y="102" text-anchor="middle" font-size="11">pod eta (v2)</text>
    <rect x="485" y="20" width="150" height="140" rx="8" class="fs" stroke="currentColor"/><text x="560" y="38" text-anchor="middle" font-size="11">node 2 (kubelet)</text>
    <rect x="500" y="50" width="120" height="26" rx="5" class="fg sg"/><text x="560" y="68" text-anchor="middle" font-size="11">pod eta (v2)</text>
    <g stroke="currentColor" fill="none" marker-end="url(#k8-ar1)"><line x1="260" y1="90" x2="318" y2="90"/></g>
    <text x="289" y="84" text-anchor="middle" class="tm" font-size="10">assign</text>
  </svg><figcaption>The control plane stores desired state and assigns pods to nodes; each node's kubelet starts and watches its pods.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Kubernetes</strong> is a container orchestrator: a <strong>control plane</strong> (API server, etcd store, scheduler, controllers) and worker <strong>nodes</strong> (each running a <strong>kubelet</strong>) that together keep declared <strong>desired state</strong> true through continuous <strong>reconciliation</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fixing things by hand on the cluster (deleting a pod, editing a live object) and expecting it to stick. Controllers restore the declared state: a deleted pod comes back, a manual edit to a Deployment is overwritten by the next <code>kubectl apply</code> from Git. Change the YAML, not the running cluster.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Pods, Deployments, Services.</b> "Desired state" must be written down somehow. Which objects say "3 copies of the ETA image" and "one address for all of them"?</div>

  <h2 id="k8-core"><span class="num">02</span>Pods, Deployments, Services</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want three copies of <code>ghcr.io/biteful/eta:a72a702</code>, each started only once its model is loaded, and the checkout service should call one address no matter which copy answers. What do we write?</p>
  </div>
  <ul>
    <li>A <strong>pod</strong> is the smallest unit Kubernetes runs: one (or a few tightly coupled) containers sharing one IP address and lifecycle. Pods are disposable; they get new names and IPs when replaced.</li>
    <li>A <strong>Deployment</strong> holds a pod template and a replica count, and keeps that many pods running (through a ReplicaSet). It also performs rolling updates and remembers previous versions for rollback.</li>
    <li>A <strong>Service</strong> gives a stable name and virtual IP (<code>biteful-eta</code>, port 80) that load-balances across all pods matching a <strong>label selector</strong>, but only pods whose readiness probe passes.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Chefs (pods) come and go. The shift manager (Deployment) keeps three of them cooking from the same recipe card (template). Customers hand orders to the counter (Service), never to a named chef; the counter only passes orders to chefs who are ready.</p>
  </div>
  <div class="fx" data-lang="text">apiVersion: apps/v1
kind: Deployment
metadata:
  name: biteful-eta
  labels: {app: biteful-eta}
spec:
  replicas: 3                                   # desired state: three copies
  selector:
    matchLabels: {app: biteful-eta}
  strategy:
    type: RollingUpdate
    rollingUpdate: {maxSurge: 1, maxUnavailable: 0}
  template:                                     # the pod to stamp out
    metadata:
      labels: {app: biteful-eta, version: v2}
    spec:
      containers:
        - name: api
          image: ghcr.io/biteful/eta:a72a702     # git SHA tag from CI, never :latest
          ports: [{containerPort: 8000}]
          envFrom:
            - configMapRef: {name: eta-config}  # MODEL_VERSION, MODEL_PATH, LOG_LEVEL
          env:
            - name: MLFLOW_TRACKING_TOKEN
              valueFrom: {secretKeyRef: {name: eta-secrets, key: MLFLOW_TRACKING_TOKEN}}
          resources:
            requests: {cpu: 500m, memory: 512Mi}   # what the scheduler reserves
            limits: {cpu: "1", memory: 1Gi}        # the most it may use
          startupProbe: {httpGet: {path: /health, port: 8000}, periodSeconds: 2, failureThreshold: 30}
          readinessProbe: {httpGet: {path: /ready, port: 8000}, periodSeconds: 5}
          livenessProbe: {httpGet: {path: /health, port: 8000}, periodSeconds: 10, failureThreshold: 3}</div>
  <div class="fx" data-lang="text">apiVersion: v1
kind: Service
metadata:
  name: biteful-eta
spec:
  type: ClusterIP
  selector: {app: biteful-eta}                  # every READY pod with this label
  ports: [{port: 80, targetPort: 8000}]</div>
  <p>The Deployment's key lines: <code>replicas: 3</code> is the desired count. <code>selector.matchLabels</code> must match the template's labels; that is how the Deployment knows which pods are "its own". The image tag is the Git SHA from CI. The three probes map directly onto the serving note's endpoints:</p>
  <table class="tbl">
    <tr><th>Probe</th><th>Calls</th><th>If it fails</th><th>Why</th></tr>
    <tr><td><code>startupProbe</code></td><td><code>/health</code> every 2 s, up to 30 times</td><td>container restarted after 60 s</td><td>gives slow model loads time before liveness starts</td></tr>
    <tr><td><code>readinessProbe</code></td><td><code>/ready</code> every 5 s</td><td>pod removed from the Service (no traffic), not restarted</td><td>503 until the model is loaded</td></tr>
    <tr><td><code>livenessProbe</code></td><td><code>/health</code> every 10 s</td><td>container restarted after 3 failures</td><td>a hung process gets replaced</td></tr>
  </table>
  <p>The Service selects <code>app: biteful-eta</code> and forwards port 80 to the pods' port 8000. Inside the cluster, checkout calls <code>http://biteful-eta/predict</code>. What you would type on a real cluster (<strong>not run here: no cluster</strong>):</p>
  <div class="fx" data-lang="text"># not run: needs a cluster (kind, k3d, minikube, EKS, GKE, AKS)
kubectl apply -f configmap.yaml -f secret.yaml -f deployment.yaml -f service.yaml -f hpa.yaml
kubectl get pods -l app=biteful-eta -o wide      # 3 pods, which node each is on
kubectl rollout status deployment/biteful-eta    # wait until all replicas are ready
kubectl describe pod &lt;pod-name&gt;                  # events: scheduling, probes, restarts
kubectl logs -f deployment/biteful-eta           # uvicorn startup/shutdown lines
kubectl port-forward svc/biteful-eta 8080:80     # then: curl localhost:8080/predict ...</div>
  <h3>How these manifests were checked</h3>
  <p>Without a cluster, the closest real check is the one the API server would do first: validate each object against the official schema for its kind and API version. <code>kubernetes-validate --strict</code> carries those schemas (Kubernetes 1.37) and rejects wrong types and unknown fields. This run covers every manifest in this note, including a deliberately broken Deployment and the KServe resource from section 08:</p>
  <div class="fx" data-lang="text">$ kubernetes-validate --strict configmap.yaml secret.yaml deployment.yaml service.yaml hpa.yaml
INFO configmap.yaml passed for resource configmap/eta-config against version 1.37
INFO secret.yaml passed for resource secret/eta-secrets against version 1.37
INFO deployment.yaml passed for resource deployment/biteful-eta against version 1.37
INFO service.yaml passed for resource service/biteful-eta against version 1.37
INFO hpa.yaml passed for resource horizontalpodautoscaler/biteful-eta against version 1.37
$ kubernetes-validate --strict gpu-model.yaml bluegreen.yaml canary.yaml
INFO gpu-model.yaml passed for resource persistentvolumeclaim/model-cache against version 1.37
INFO gpu-model.yaml passed for resource deployment/eta-transformer against version 1.37
INFO bluegreen.yaml passed for resource deployment/eta-blue against version 1.37
INFO bluegreen.yaml passed for resource deployment/eta-green against version 1.37
INFO bluegreen.yaml passed for resource service/biteful-eta against version 1.37
INFO canary.yaml passed for resource deployment/eta-stable against version 1.37
INFO canary.yaml passed for resource deployment/eta-canary against version 1.37
$ kubernetes-validate --strict broken.yaml
ERROR broken.yaml did not validate for resource deployment/biteful-eta against version 1.37: spec.replicas: '3' is not of type 'integer', 'null'
$ sed -i 's/replicas: "3"/replicas: 3/' broken.yaml
$ kubernetes-validate --strict broken.yaml
ERROR broken.yaml did not validate for resource deployment/biteful-eta against version 1.37: spec.template.spec.containers.0.resources: Additional properties are not allowed ('request' was unexpected)
$ kubernetes-validate --strict inferenceservice.yaml
WARN inferenceservice.yaml Couldn't find schema for kind InferenceService with api version serving.kserve.io/v1beta1 for kubernetes version 1.37</div>
  <p>All real manifests pass. The broken file shows two classic mistakes, one at a time: <code>replicas: "3"</code> is a string, not an integer; after fixing it, <code>resources.request</code> (missing "s") is an unknown field. Without <code>--strict</code> a real API server may silently drop unknown fields, so the pod would run with no requests at all. The KServe <code>InferenceService</code> is a custom resource (CRD): the core schemas don't know it, so the validator can only warn. A cluster with KServe installed would validate it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pod</strong>: one or more containers scheduled together with a shared network identity. <strong>Deployment</strong>: a controller that maintains a set of identical pods from a template and manages rollouts. <strong>Service</strong>: a stable network endpoint that load-balances to ready pods selected by labels. <strong>Label selector</strong>: the key-value match that connects them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A Service selector that matches no pods (a typo in a label), or matches pods of another app. The Service exists, DNS resolves, and every request fails or goes to the wrong place. Check <code>kubectl get endpoints biteful-eta</code>: it lists the pod IPs actually behind the Service.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ConfigMaps, Secrets, Volumes.</b> The Deployment refers to <code>eta-config</code> and <code>eta-secrets</code>. Where do settings, passwords and large model files live, so the same image runs in staging and production?</div>

  <h2 id="k8-config"><span class="num">03</span>ConfigMaps, Secrets and Persistent Volumes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Staging and production run the same image but need different settings (model version, log level) and a password for the MLflow server. A future neural ETA model has 20 GiB of weights, too big to bake into an image. Where does each kind of thing go?</p>
  </div>
  <p>The <a class="xref" data-note="se_docker">Docker note</a> injected settings with <code>-e</code> at run time. Kubernetes does the same with objects:</p>
  <ul>
    <li>A <strong>ConfigMap</strong> holds plain settings; <code>envFrom: configMapRef</code> turns every key into an environment variable.</li>
    <li>A <strong>Secret</strong> holds sensitive values; a pod reads one with <code>secretKeyRef</code>.</li>
    <li>A <strong>PersistentVolumeClaim (PVC)</strong> asks for storage ("20 GiB, readable by many pods"); the cluster binds it to a <strong>PersistentVolume</strong> (a cloud disk or shared file system) that outlives any pod.</li>
  </ul>
  <div class="fx" data-lang="text">apiVersion: v1
kind: ConfigMap
metadata:
  name: eta-config
data:
  MODEL_VERSION: "2"
  MODEL_PATH: /app/model/model.joblib
  LOG_LEVEL: info</div>
  <div class="fx" data-lang="text">apiVersion: v1
kind: Secret
metadata:
  name: eta-secrets
type: Opaque
data:
  MLFLOW_TRACKING_TOKEN: Yml0ZWZ1bC1kZW1vLXRva2Vu   # base64 of "biteful-demo-token" (NOT encrypted)</div>
  <p>The Secret's value looks scrambled. It is not. It is <strong>base64</strong>, an encoding that turns any bytes into safe text, and anyone can reverse it:</p>
  <div class="fx" data-lang="text">$ grep MLFLOW_TRACKING_TOKEN secret.yaml
  MLFLOW_TRACKING_TOKEN: Yml0ZWZ1bC1kZW1vLXRva2Vu   # base64 of "biteful-demo-token" (NOT encrypted)
$ echo "Yml0ZWZ1bC1kZW1vLXRva2Vu" | base64 -d; echo
biteful-demo-token</div>
  <p>So a Secret is protected only by who may read it. In production: restrict access with RBAC (role-based access control: only the ETA service account may read <code>eta-secrets</code>), turn on encryption at rest for etcd, never commit real Secret YAML to Git (use an external store like Vault or the cloud's secret manager, synced by tools such as External Secrets), and keep the demo token above for demos only.</p>
  <p>Large weights go on a volume. The PVC and a GPU Deployment that mounts it read-only at <code>/models</code> (section 04 explains the GPU lines):</p>
  <div class="fx" data-lang="text">apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: model-cache
spec:
  accessModes: [ReadOnlyMany]
  resources: {requests: {storage: 20Gi}}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eta-transformer
spec:
  replicas: 1
  selector:
    matchLabels: {app: eta-transformer}
  template:
    metadata:
      labels: {app: eta-transformer}
    spec:
      nodeSelector: {nvidia.com/gpu.product: NVIDIA-L4}     # only nodes with this GPU
      tolerations:
        - {key: nvidia.com/gpu, operator: Exists, effect: NoSchedule}
      containers:
        - name: model
          image: ghcr.io/biteful/eta-transformer:0.1
          resources:
            requests: {cpu: "2", memory: 12Gi}
            limits: {nvidia.com/gpu: 1, memory: 16Gi}       # GPUs are requested in whole units
          volumeMounts: [{name: weights, mountPath: /models, readOnly: true}]
      volumes:
        - name: weights
          persistentVolumeClaim: {claimName: model-cache, readOnly: true}</div>
  <table class="tbl">
    <tr><th>Where</th><th>Put</th><th>Biteful</th></tr>
    <tr><td>Image</td><td>Code, dependencies, small models</td><td><code>app.py</code>, <code>features.py</code>, 230 KB <code>model.joblib</code></td></tr>
    <tr><td>ConfigMap</td><td>Non-secret settings per environment</td><td><code>MODEL_VERSION=2</code>, <code>LOG_LEVEL=info</code></td></tr>
    <tr><td>Secret</td><td>Passwords, tokens, keys</td><td>MLflow token</td></tr>
    <tr><td>PVC</td><td>Large or shared files that outlive pods</td><td>20 GiB of transformer weights</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ConfigMap</strong>: key-value configuration injected as environment variables or files. <strong>Secret</strong>: the same for sensitive data, stored base64-encoded and protected by access control and optional encryption at rest. <strong>PersistentVolumeClaim</strong>: a request for durable storage with a size and access mode (ReadWriteOnce, ReadOnlyMany, ReadWriteMany) that pods mount as volumes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Changing a ConfigMap and expecting running pods to notice. Environment variables are read when a container starts; you must restart the pods (<code>kubectl rollout restart deployment/biteful-eta</code>) or, better, put a hash of the config in the pod template so a config change triggers a rollout (Helm charts commonly do this).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Resources &amp; GPU Scheduling.</b> Pods can now be configured. But which node does each pod land on, how many fit, what happens when one uses too much memory, and how does a GPU model get a GPU?</div>

  <h2 id="k8-res"><span class="num">04</span>Resources &amp; GPU Scheduling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The cluster has 4-core, 16 GiB machines. How many ETA pods can one machine hold? What stops one pod from eating a whole machine? And how does the transformer pod end up on a machine that actually has a GPU?</p>
  </div>
  <ul>
    <li><strong>Requests</strong>: what a container is guaranteed. The <strong>scheduler</strong> places a pod only on a node whose unreserved capacity covers its requests. It looks at requests, <em>not</em> at actual usage.</li>
    <li><strong>Limits</strong>: the most a container may use. Over the CPU limit it is <strong>throttled</strong> (slowed); over the memory limit it is killed (<strong>OOMKilled</strong>, exit code 137 from the Linux note) and restarted.</li>
    <li>CPU is measured in cores or <strong>millicores</strong> (500m = half a core); memory in bytes (512Mi = 512 × 1024 × 1024).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Booking tables in a restaurant. The request is the booking: "a table for 4" reserves 4 chairs even if only 2 people come. The limit is the fire-safety maximum per table. The host seats bookings by counting reserved chairs, not by looking at who is actually eating.</p>
  </div>
  <p>By hand: the node has 4,000m CPU and 16,384 Mi memory; about 300m and 1,536 Mi are reserved for the system, leaving 3,700m and 14,848 Mi. Each ETA pod requests 500m and 512 Mi. CPU: 3,700 / 500 = 7.4 → 7 pods. Memory: 14,848 / 512 = 29 pods. The smaller number wins: 7 pods, CPU is the bottleneck.</p>
  <div class="fx" data-lang="py"># how many ETA pods fit on one node? the scheduler only looks at REQUESTS, not actual use
node = {"cpu_m": 4000, "mem_mi": 16384}          # a 4-core, 16 GiB node
reserved = {"cpu_m": 300, "mem_mi": 1536}        # kubelet, OS, system pods
pod = {"cpu_m": 500, "mem_mi": 512}              # our requests: 500m CPU, 512Mi
free = {k: node[k] - reserved[k] for k in node}
fit = {k: free[k] // pod[k] for k in pod}
print("allocatable:", free, "| pods by cpu:", fit["cpu_m"], "by memory:", fit["mem_mi"],
      "| fit:", min(fit.values()), "(CPU is the bottleneck)")</div>
  <div class="fx" data-lang="text">allocatable: {'cpu_m': 3700, 'mem_mi': 14848} | pods by cpu: 7 by memory: 29 | fit: 7 (CPU is the bottleneck)</div>
  <table class="tbl">
    <tr><th>QoS class</th><th>When</th><th>Under memory pressure</th></tr>
    <tr><td>Guaranteed</td><td>requests = limits for CPU and memory</td><td>evicted last</td></tr>
    <tr><td>Burstable</td><td>requests set, lower than limits (our ETA pods)</td><td>evicted after BestEffort</td></tr>
    <tr><td>BestEffort</td><td>no requests or limits</td><td>evicted first</td></tr>
  </table>
  <h3>GPU scheduling</h3>
  <p>GPUs are an <strong>extended resource</strong> advertised by the NVIDIA <strong>device plugin</strong> running on GPU nodes (the Kubernetes counterpart of the NVIDIA Container Toolkit from the CI/CD note). In the <code>eta-transformer</code> manifest above:</p>
  <ul>
    <li><code>limits: {nvidia.com/gpu: 1}</code>: GPUs are requested in whole units (no "half a GPU" without special sharing setups like MIG or time-slicing) and are not shared between pods by default.</li>
    <li><code>nodeSelector: {nvidia.com/gpu.product: NVIDIA-L4}</code>: only nodes labelled with that GPU model qualify.</li>
    <li><code>tolerations</code>: GPU nodes are usually <strong>tainted</strong> ("don't schedule here unless you tolerate <code>nvidia.com/gpu</code>"), so ordinary pods like the CPU ETA server never waste an expensive GPU node; the transformer pod tolerates the taint.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Requests</strong> are the resources reserved for a container and used by the scheduler; <strong>limits</strong> cap usage (CPU throttling, memory OOM kill). <strong>Taints</strong> on nodes repel pods; <strong>tolerations</strong> on pods allow them onto tainted nodes; <strong>nodeSelector</strong>/affinity attract pods to labelled nodes. GPUs are scheduled as the extended resource <code>nvidia.com/gpu</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>No requests at all (BestEffort): the scheduler packs pods onto one node, the node runs out of memory, and the ETA pods are evicted first at lunch. The opposite trap: requests far above real use, so nodes look "full" while CPUs idle, and the cluster bill doubles. Set requests from measured usage (p95), limits a bit higher.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Horizontal Pod Autoscaler.</b> Three replicas is right at 11:00 and wrong at 12:00. How does the number of pods follow the lunch rush by itself?</div>

  <h2 id="k8-hpa"><span class="num">05</span>Horizontal Pod Autoscaler</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>At 11:30 three pods are mostly idle; at 12:00 checkout traffic makes them run at 96% of their requested CPU and p95 latency climbs. What rule adds pods when busy and removes them when quiet?</p>
  </div>
  <p>The <strong>Horizontal Pod Autoscaler (HPA)</strong> changes a Deployment's <code>replicas</code> from metrics. With CPU, "utilisation" means usage <em>as a percentage of the request</em> (500m here). Its core rule:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>desiredReplicas = ceil(currentReplicas × currentMetric / targetMetric)</strong>, clamped to [minReplicas, maxReplicas]; no change if the ratio is within a tolerance (default 10%). currentMetric = average utilisation across pods; targetMetric = the target (70%); ceil rounds up.</p>
  </div>
  <div class="fx" data-lang="text">apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: biteful-eta
spec:
  scaleTargetRef: {apiVersion: apps/v1, kind: Deployment, name: biteful-eta}
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: {name: cpu, target: {type: Utilization, averageUtilization: 70}}
  behavior:
    scaleDown: {stabilizationWindowSeconds: 300}   # wait 5 min before removing pods</div>
  <p>By hand, Monday lunch (average CPU as % of request, read by the metrics server):</p>
  <table class="tbl">
    <tr><th>Time</th><th>Pods</th><th>CPU % of request</th><th>Ratio to 70</th><th>ceil(pods × ratio)</th><th>New pods</th></tr>
    <tr><td>11:30</td><td>3</td><td>45</td><td>0.643</td><td>ceil(1.93) = 2</td><td>2 (= min)</td></tr>
    <tr><td>12:00</td><td>2</td><td>96</td><td>1.371</td><td>ceil(2.74) = 3</td><td>3</td></tr>
    <tr><td>12:15</td><td>3</td><td>88</td><td>1.257</td><td>ceil(3.77) = 4</td><td>4</td></tr>
    <tr><td>12:30</td><td>4</td><td>74</td><td>1.057</td><td>within 10% tolerance</td><td>4</td></tr>
    <tr><td>13:00</td><td>4</td><td>61</td><td>0.871</td><td>ceil(3.49) = 4</td><td>4</td></tr>
    <tr><td>14:00</td><td>4</td><td>30</td><td>0.429</td><td>ceil(1.71) = 2</td><td>2</td></tr>
  </table>
  <div class="fx" data-lang="py">import math
# HPA rule: desired = ceil(current_replicas * current_utilisation / target), within [min, max]
def hpa(current, util, target=70, lo=2, hi=10, tolerance=0.10):
    ratio = util / target
    if abs(ratio - 1) &lt;= tolerance:                  # within 10%: do nothing (avoids flapping)
        return current
    return max(lo, min(hi, math.ceil(current * ratio)))

replicas = 3
lunch = [("11:30", 45), ("12:00", 96), ("12:15", 88), ("12:30", 74), ("13:00", 61), ("14:00", 30)]
for t, util in lunch:                                # average CPU % of request across pods
    new = hpa(replicas, util)
    print(f"{t} cpu {util:3d}% of request, {replicas} pods -&gt; {new} pods")
    replicas = new</div>
  <div class="fx" data-lang="text">11:30 cpu  45% of request, 3 pods -&gt; 2 pods
12:00 cpu  96% of request, 2 pods -&gt; 3 pods
12:15 cpu  88% of request, 3 pods -&gt; 4 pods
12:30 cpu  74% of request, 4 pods -&gt; 4 pods
13:00 cpu  61% of request, 4 pods -&gt; 4 pods
14:00 cpu  30% of request, 4 pods -&gt; 2 pods</div>
  <p>The code reproduces the table. Two details of the real HPA the toy skips: scale-down waits for the <code>stabilizationWindowSeconds</code> (300 s here) so a short dip doesn't remove pods that will be needed a minute later; and new pods only help once their readiness probe passes, which is why fast model loading (and the startup probe) matters for autoscaling.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The manager watches how busy the chefs are. If they're at 96% when the target is 70%, the kitchen needs about 96/70 = 1.37 times as many chefs, rounded up. If they're at 30%, send some home, but wait a few minutes in case the rush comes back.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>HPA on CPU without <code>resources.requests</code>: utilisation is a percentage of the request, so with no request there is nothing to compute and the HPA does nothing. Also, CPU is a poor signal for GPU models or I/O-bound servers; scale those on custom metrics (requests per second, queue length, GPU utilisation) via a metrics adapter or KEDA.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Rollouts.</b> The fleet now heals and scales. Next week the image changes from the v1 forest to the v2 boosting model. How do we swap every pod without a moment where no ready pod is answering, and undo it fast?</div>

  <h2 id="k8-roll"><span class="num">06</span>Rollouts: Rolling, Blue-Green, Canary</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Three v1 pods are serving lunch. If we deleted them and started three v2 pods, checkout would get errors until the new models load. In what order should pods be replaced, and how do we limit how many customers a bad version can reach?</p>
  </div>
  <h3>Rolling update (the Deployment default)</h3>
  <p>Change the image tag in the Deployment and apply it. The Deployment replaces pods a few at a time, controlled by <code>maxSurge</code> (how many <em>extra</em> pods may exist) and <code>maxUnavailable</code> (how many may be missing). Ours: surge 1, unavailable 0. By hand for 3 replicas: start one v2 (4 pods), wait until it is ready, stop one v1 (3 pods); repeat three times.</p>
  <div class="fx" data-lang="py"># rolling update of 3 pods v1 -&gt; v2 with maxSurge=1, maxUnavailable=0
replicas, surge = 3, 1
old, new, step = 3, 0, 0
print(f"step {step}: v1={old} v2={new} total={old + new} ready&gt;={old + new}")
while new &lt; replicas:
    new += 1; step += 1                               # start one extra v2 pod (surge)
    print(f"step {step}: v1={old} v2={new} total={old + new}  (v2 pod must pass /ready)")
    old -= 1; step += 1                               # only then stop one v1 pod
    print(f"step {step}: v1={old} v2={new} total={old + new}")</div>
  <div class="fx" data-lang="text">step 0: v1=3 v2=0 total=3 ready&gt;=3
step 1: v1=3 v2=1 total=4  (v2 pod must pass /ready)
step 2: v1=2 v2=1 total=3
step 3: v1=2 v2=2 total=4  (v2 pod must pass /ready)
step 4: v1=1 v2=2 total=3
step 5: v1=1 v2=3 total=4  (v2 pod must pass /ready)
step 6: v1=0 v2=3 total=3</div>
  <p>At no step are there fewer than 3 pods able to serve, and each v2 pod receives traffic only after its <code>/ready</code> passes. If v2 pods never become ready, the rollout stalls with v1 still serving, and <code>kubectl rollout undo deployment/biteful-eta</code> (not run here) returns to the previous template.</p>
  <h3>Blue-green</h3>
  <p>Run two complete Deployments: <strong>blue</strong> (v1, live) and <strong>green</strong> (v2, warmed up, tested). The Service's selector decides which one gets traffic; switching is one change of <code>track: blue</code> to <code>track: green</code>, and rolling back is changing it back.</p>
  <div class="fx" data-lang="text">apiVersion: apps/v1
kind: Deployment
metadata: {name: eta-blue}
spec:
  replicas: 3
  selector: {matchLabels: {app: biteful-eta, track: blue}}
  template:
    metadata: {labels: {app: biteful-eta, track: blue}}
    spec:
      containers: [{name: api, image: "ghcr.io/biteful/eta:18d6a1b", ports: [{containerPort: 8000}]}]  # v1 forest
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: eta-green}
spec:
  replicas: 3
  selector: {matchLabels: {app: biteful-eta, track: green}}
  template:
    metadata: {labels: {app: biteful-eta, track: green}}
    spec:
      containers: [{name: api, image: "ghcr.io/biteful/eta:a72a702", ports: [{containerPort: 8000}]}]  # v2 boosting
---
apiVersion: v1
kind: Service
metadata: {name: biteful-eta}
spec:
  selector: {app: biteful-eta, track: blue}     # the switch: change blue -&gt; green
  ports: [{port: 80, targetPort: 8000}]</div>
  <div class="fx" data-lang="text"># not run: the switch, and the rollback
kubectl patch service biteful-eta -p '{"spec":{"selector":{"app":"biteful-eta","track":"green"}}}'
kubectl patch service biteful-eta -p '{"spec":{"selector":{"app":"biteful-eta","track":"blue"}}}'</div>
  <h3>Canary</h3>
  <p>The simplest canary uses replica counts: a stable Deployment with 9 pods and a canary Deployment with 1, both labelled <code>app: biteful-eta</code>, so the main Service (selector <code>app: biteful-eta</code>) spreads requests over 10 pods and about 1 in 10 goes to v2.</p>
  <div class="fx" data-lang="text">apiVersion: apps/v1
kind: Deployment
metadata: {name: eta-stable}
spec:
  replicas: 9
  selector: {matchLabels: {app: biteful-eta, track: stable}}
  template:
    metadata: {labels: {app: biteful-eta, track: stable}}
    spec:
      containers: [{name: api, image: "ghcr.io/biteful/eta:18d6a1b", ports: [{containerPort: 8000}]}]
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: eta-canary}
spec:
  replicas: 1
  selector: {matchLabels: {app: biteful-eta, track: canary}}
  template:
    metadata: {labels: {app: biteful-eta, track: canary}}
    spec:
      containers: [{name: api, image: "ghcr.io/biteful/eta:a72a702", ports: [{containerPort: 8000}]}]</div>
  <div class="fx" data-lang="py">import random
random.seed(0)
pods = ["stable"] * 9 + ["canary"]                     # eta-stable: 9 replicas, eta-canary: 1
hits = [random.choice(pods) for _ in range(10_000)]   # the Service spreads requests over ready pods
print("canary share:", hits.count("canary") / len(hits))</div>
  <div class="fx" data-lang="text">canary share: 0.1017</div>
  <p>10.17% of 10,000 simulated requests hit the canary. This replica-ratio canary is coarse (the percentage is tied to pod counts) and not sticky per customer, unlike the hash-based router in the serving note. For exact weights (5%, 25%) and stickiness, teams use a service mesh (Istio, Linkerd) or Argo Rollouts / Flagger, which also automate "promote if error rate and latency stay healthy, else roll back".</p>
  <table class="tbl">
    <tr><th></th><th>Rolling</th><th>Blue-green</th><th>Canary</th></tr>
    <tr><td>Extra capacity</td><td>maxSurge pods</td><td>2× during the switch</td><td>a few pods</td></tr>
    <tr><td>Customers on new version</td><td>grows pod by pod, all eventually</td><td>all at once</td><td>a chosen small share first</td></tr>
    <tr><td>Rollback</td><td><code>rollout undo</code> (new rollout)</td><td>instant: flip selector back</td><td>scale canary to 0</td></tr>
    <tr><td>Two versions at once?</td><td>briefly</td><td>no (traffic-wise)</td><td>yes, deliberately</td></tr>
    <tr><td>Biteful use</td><td>routine image updates</td><td>risky changes needing instant rollback</td><td>new models (v1 → v2)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Rolling update</strong>: replace pods incrementally within <code>maxSurge</code>/<code>maxUnavailable</code>. <strong>Blue-green</strong>: two full environments, traffic switched at once by a router or Service selector. <strong>Canary</strong>: a small fraction of traffic sent to the new version, increased while metrics stay healthy.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Rolling updates without a readiness probe: Kubernetes considers a pod "available" as soon as it starts, stops the old pods, and traffic hits v2 pods whose model is still loading. The probe is what makes the rolling update safe.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Helm.</b> We now have nine YAML files, and staging needs 2–10 pods while production needs 6–30, with a different image tag each release. Copy-pasting YAML per environment is how mistakes like <code>replicas: "3"</code> creep in. How do we template and version the whole bundle?</div>

  <h2 id="k8-helm"><span class="num">07</span>Helm: Charts and Values</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each release changes one value (the image tag); each environment changes a few (replicas, autoscaling limits). How do we keep one set of manifests, fill in values per environment, and roll back a whole release, not just one Deployment?</p>
  </div>
  <p><strong>Helm</strong> is Kubernetes' package manager. A <strong>chart</strong> is a folder: <code>Chart.yaml</code> (name and version), <code>values.yaml</code> (defaults), and <code>templates/</code> (manifests with placeholders). Installing a chart creates a <strong>release</strong>; every upgrade becomes a numbered revision you can roll back to. Biteful's chart (shown; <strong>not run</strong>: Helm is not installed in this sandbox and there is no cluster):</p>
  <div class="fx" data-lang="text">apiVersion: v2
name: biteful-eta
description: Biteful delivery-time model server
version: 0.3.0          # version of the chart (the packaging)
appVersion: "a72a702"   # version of the app inside (image tag)</div>
  <div class="fx" data-lang="text">image:
  repository: ghcr.io/biteful/eta
  tag: a72a702
replicas: 3
modelVersion: "2"
resources:
  requests: {cpu: 500m, memory: 512Mi}
  limits: {cpu: "1", memory: 1Gi}
autoscaling: {enabled: true, min: 2, max: 10, cpuTarget: 70}</div>
  <div class="fx" data-lang="text">replicas: 6
autoscaling: {enabled: true, min: 6, max: 30, cpuTarget: 60}</div>
  <div class="fx" data-lang="text">apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicas }}
  selector:
    matchLabels: {app: {{ .Release.Name }}}
  template:
    metadata:
      labels: {app: {{ .Release.Name }}}
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          env:
            - {name: MODEL_VERSION, value: "{{ .Values.modelVersion }}"}
          resources: {{- toYaml .Values.resources | nindent 12 }}
          readinessProbe: {httpGet: {path: /ready, port: 8000}}</div>
  <p><code>{{ .Values.replicas }}</code> is replaced by the value from the values files; <code>{{ .Release.Name }}</code> by the name given at install; <code>toYaml … | nindent 12</code> inserts the resources block with the right indentation. Later values files override earlier ones, so production gets 6 replicas. The commands (not run):</p>
  <div class="fx" data-lang="text"># not run: needs helm and a cluster
helm template eta ./chart -f chart/values-prod.yaml          # render YAML locally (pipe into kubernetes-validate in CI)
helm install eta ./chart -f chart/values-prod.yaml           # revision 1
helm upgrade eta ./chart --set image.tag=b4c5d6e             # revision 2: new image from CI
helm history eta                                             # list revisions
helm rollback eta 1                                          # back to revision 1, whole release</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding-card template. The design (templates) is printed once; each family fills in names, date and venue (values). Helm prints the cards and keeps a copy of every print run, so you can reprint last month's version exactly.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Helm chart</strong>: a versioned package of templated Kubernetes manifests plus default values. <strong>Release</strong>: an installed instance of a chart; each <code>upgrade</code> creates a revision that <code>rollback</code> can restore. <code>helm template</code> renders manifests without installing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Templates that render invalid YAML only for some values (an indentation off by two, a number quoted as a string). Render every environment's values in CI with <code>helm template</code> and validate the output (as in section 02) before anything reaches a cluster.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Kubeflow &amp; KServe.</b> Everything so far is generic Kubernetes: the ETA server could be any web app. Are there ML-specific tools on Kubernetes for serving many models and running training pipelines?</div>

  <h2 id="k8-kf"><span class="num">08</span>Kubeflow &amp; KServe: ML on Kubernetes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our ETA serving needed a Deployment, Service, HPA, probes and a canary setup: five objects for one model. Biteful will have ten models and a weekly retraining pipeline. Is there a higher-level way to say "serve this model" and "run this training pipeline" on Kubernetes?</p>
  </div>
  <p><strong>KServe</strong> adds a custom resource, <code>InferenceService</code>: you give a model format and storage location; KServe creates the server pods, autoscaling (including scale-to-zero via Knative), and canary traffic splitting. The resource from the serving note (the validator above could only warn about it, because it is not a core kind):</p>
  <div class="fx" data-lang="text">apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: biteful-eta
spec:
  predictor:
    minReplicas: 2
    canaryTrafficPercent: 10
    model:
      modelFormat: {name: sklearn}
      storageUri: s3://biteful-ml-artifacts/eta/v2/</div>
  <p>Compare: five generic objects become one, and <code>canaryTrafficPercent: 10</code> replaces the 9 + 1 replica trick with an exact weight. KServe also standardises the request protocol (V1/V2 inference protocol), so clients don't care which framework served the model.</p>
  <p><strong>Kubeflow</strong> is a set of ML tools on Kubernetes: notebooks, training operators (distributed PyTorch/TensorFlow jobs), Katib (hyperparameter tuning, like Optuna at cluster scale) and <strong>Kubeflow Pipelines</strong>, where each pipeline step runs as a container. Biteful's CT pipeline from the CI/CD note, written with the Pipelines SDK (shown, <strong>not run</strong>: needs a Kubeflow installation):</p>
  <div class="fx" data-lang="py"># kfp pipeline sketch (not run): each component runs in its own container on the cluster
from kfp import dsl

@dsl.component(base_image="ghcr.io/biteful/train:a72a702")
def prepare(raw_uri: str) -&gt; str: ...           # drop impossible rows, return clean data URI

@dsl.component(base_image="ghcr.io/biteful/train:a72a702")
def train(clean_uri: str, max_depth: int) -&gt; str: ...   # train + log to MLflow, return model URI

@dsl.component(base_image="ghcr.io/biteful/train:a72a702")
def gate(model_uri: str) -&gt; bool: ...          # beat baseline and @champion?

@dsl.pipeline(name="biteful-eta-weekly")
def weekly(raw_uri: str = "s3://biteful-data/orders/latest/"):
    clean = prepare(raw_uri=raw_uri)
    model = train(clean_uri=clean.output, max_depth=8)
    gate(model_uri=model.output)</div>
  <table class="tbl">
    <tr><th>Need</th><th>Plain Kubernetes</th><th>ML layer</th></tr>
    <tr><td>Serve a model</td><td>Deployment + Service + HPA + probes</td><td>KServe <code>InferenceService</code>, Seldon</td></tr>
    <tr><td>Canary by %</td><td>replica ratio, or a mesh</td><td><code>canaryTrafficPercent</code></td></tr>
    <tr><td>Training pipeline</td><td>Jobs / CronJobs chained by hand</td><td>Kubeflow Pipelines, Argo Workflows</td></tr>
    <tr><td>Tuning at scale</td><td>many Jobs</td><td>Katib</td></tr>
    <tr><td>Distributed training</td><td>hand-wired pods</td><td>Training Operator (PyTorchJob)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Custom Resource Definition (CRD)</strong>: an extension that adds a new kind (like <code>InferenceService</code>) to the Kubernetes API, with an <strong>operator</strong> (controller) that reconciles it. <strong>KServe</strong>: model serving via CRDs with autoscaling and canaries. <strong>Kubeflow</strong>: a toolkit for ML workflows on Kubernetes (pipelines, notebooks, training, tuning).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Installing Kubeflow to serve one model. It is a platform with many components to upgrade and secure. One model is a Deployment (or a managed endpoint, cloud note); reach for KServe/Kubeflow when you have many models and a platform team.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Eight ideas. How do they combine for one lunch rush and one model upgrade?</div>

  <h2 id="k8-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>At 12:00 traffic triples while v2 is being rolled out. Which object does what?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 290" width="660">
<defs><marker id="k8-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Helm release (07)</text><text x="110" y="45" text-anchor="middle" class="tm" font-size="10">values-prod: image a72a702</text>
<line x1="210" y1="33" x2="248" y2="33" stroke="currentColor" marker-end="url(#k8-a9)"/>
<rect x="250" y="10" width="400" height="46" rx="7" class="fv" stroke="currentColor"/><text x="450" y="29" text-anchor="middle" font-size="11.5" font-weight="700">API server + controllers (01): reconcile desired vs actual</text><text x="450" y="45" text-anchor="middle" class="tm" font-size="10">validated objects only (02)</text>
<rect x="10" y="80" width="200" height="56" rx="7" class="fb sb"/><text x="110" y="99" text-anchor="middle" font-size="11.5" font-weight="700">HPA (05)</text><text x="110" y="115" text-anchor="middle" class="tm" font-size="10">96% of request → 2 → 3 → 4 pods</text><text x="110" y="129" text-anchor="middle" class="tm" font-size="10">needs requests (04)</text>
<rect x="230" y="80" width="200" height="56" rx="7" class="fg sg"/><text x="330" y="99" text-anchor="middle" font-size="11.5" font-weight="700">Deployment (02, 06)</text><text x="330" y="115" text-anchor="middle" class="tm" font-size="10">rolling: surge 1, unavailable 0</text><text x="330" y="129" text-anchor="middle" class="tm" font-size="10">template + ConfigMap/Secret (03)</text>
<rect x="450" y="80" width="200" height="56" rx="7" class="fb sb"/><text x="550" y="99" text-anchor="middle" font-size="11.5" font-weight="700">Scheduler (04)</text><text x="550" y="115" text-anchor="middle" class="tm" font-size="10">7 pods per 4-core node</text><text x="550" y="129" text-anchor="middle" class="tm" font-size="10">GPU pods → tainted GPU nodes</text>
<g stroke="currentColor" fill="none" marker-end="url(#k8-a9)"><line x1="210" y1="108" x2="228" y2="108"/><line x1="430" y1="108" x2="448" y2="108"/><line x1="450" y1="56" x2="330" y2="78"/><line x1="550" y1="136" x2="450" y2="168"/></g>
<rect x="150" y="170" width="360" height="50" rx="7" class="ft st"/><text x="330" y="189" text-anchor="middle" font-size="11.5" font-weight="700">pods: v1 and v2 ETA servers</text><text x="330" y="207" text-anchor="middle" class="tm" font-size="10">startup /health · readiness /ready · liveness /health</text>
<line x1="330" y1="220" x2="330" y2="240" stroke="currentColor" marker-end="url(#k8-a9)"/>
<rect x="150" y="242" width="360" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="260" text-anchor="middle" font-size="11.5">Service biteful-eta: only READY pods get orders</text><text x="330" y="275" text-anchor="middle" class="tm" font-size="10">canary 9+1 ≈ 10% · blue-green = flip selector (06)</text>
</svg><figcaption>Helm submits objects; controllers reconcile; the HPA sets the count; the scheduler places pods by requests; probes decide which pods the Service uses.</figcaption></figure>
  <table class="tbl"><caption>Every idea on the Biteful fleet</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Reconcile loop</td><td>desired vs actual</td><td>who fixes failures?</td><td>crash → eta-d; node lost → 2 new</td><td>always (the core idea)</td></tr>
    <tr><td>Pod / Deployment / Service</td><td>template, replicas, selector</td><td>N copies at one address?</td><td>3 replicas behind <code>biteful-eta:80</code></td><td>every service</td></tr>
    <tr><td>Probes</td><td>/health, /ready</td><td>restart? send traffic?</td><td>startup 60 s budget; ready after load</td><td>every model server</td></tr>
    <tr><td>ConfigMap / Secret</td><td>key-values → env</td><td>settings per environment?</td><td>MODEL_VERSION=2; token = base64 only</td><td>all config</td></tr>
    <tr><td>PVC</td><td>claim → volume</td><td>big or shared files?</td><td>20 GiB weights, read-only</td><td>large models, caches</td></tr>
    <tr><td>Requests / limits</td><td>reservation / cap</td><td>where, how much?</td><td>7 pods per node; OOM → 137</td><td>every container</td></tr>
    <tr><td>GPU scheduling</td><td>device plugin, taints, selectors</td><td>GPU pods on GPU nodes?</td><td><code>nvidia.com/gpu: 1</code> on L4 nodes</td><td>neural models</td></tr>
    <tr><td>HPA</td><td>ceil(n × util/target)</td><td>follow the load?</td><td>2 → 3 → 4 → 2</td><td>variable traffic</td></tr>
    <tr><td>Rolling / blue-green / canary</td><td>surge, selectors, replica ratio</td><td>upgrade safely?</td><td>never &lt; 3 ready; 10.17% canary</td><td>every release</td></tr>
    <tr><td>Helm</td><td>templates + values</td><td>per-environment bundles?</td><td>prod 6–30 replicas; rollback revision</td><td>more than a few manifests</td></tr>
    <tr><td>KServe / Kubeflow</td><td>CRDs + operators</td><td>ML-level abstractions?</td><td>one InferenceService, 10% canary</td><td>many models, platform team</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>Kubernetes keeps declared state true: a Deployment keeps N probed pods of an image, a Service sends traffic only to ready ones, requests decide placement and the HPA's count, ConfigMaps/Secrets/volumes plug in environment-specific pieces, rollouts change versions without dropping below capacity, and Helm or KServe package all of it.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The status words you'll see when it goes wrong.</div>

  <h2 id="k8-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What do <code>Pending</code>, <code>OOMKilled</code>, <code>CrashLoopBackOff</code> and <code>ImagePullBackOff</code> usually mean for a model server?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Pending forever</span><p>No node has enough unreserved requests (or no GPU node tolerates the pod). Lower requests, add nodes, check taints and selectors.</p></div>
  <div class="callout trap"><span class="label">Trap: OOMKilled (exit 137)</span><p>The model plus request buffers exceed the memory limit. Measure peak memory; raise the limit or shrink the model (quantisation).</p></div>
  <div class="callout trap"><span class="label">Trap: CrashLoopBackOff</span><p>The container keeps exiting: a missing env var, wrong <code>MODEL_PATH</code>, or a liveness probe that kills a slow-loading model. Read <code>kubectl logs --previous</code>; use a startup probe.</p></div>
  <div class="callout trap"><span class="label">Trap: ImagePullBackOff</span><p>Wrong tag or no pull credentials for the private registry. Use the exact SHA tag from CI and an <code>imagePullSecret</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: no readiness probe</span><p>Rolling updates and the Service send traffic to pods still loading. Always probe <code>/ready</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: HPA without requests</span><p>Utilisation can't be computed; nothing scales.</p></div>
  <div class="callout trap"><span class="label">Trap: Secrets treated as encrypted</span><p>base64 is reversible. RBAC, encryption at rest, external secret stores, nothing real in Git.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>:latest</code> images</span><p>Pods on different nodes may run different code, and rollback has nothing to roll back to. SHA tags.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="k8-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful ETA image <code>ghcr.io/biteful/eta:a72a702</code> (v2) and <code>:18d6a1b</code> (v1); Deployment of 3 replicas, requests 500m CPU / 512Mi, limits 1 CPU / 1Gi; probes: startup and liveness <code>/health</code>, readiness <code>/ready</code>; Service <code>biteful-eta:80 → 8000</code>; HPA 2–10 at 70% CPU. All manifests passed <code>kubernetes-validate --strict</code> (Kubernetes 1.37); no cluster was available, so nothing was applied.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Orchestration</td><td>who heals and scales?</td><td>reconcile: crash → replacement</td><td>how to declare state?</td></tr>
    <tr><td>Pod/Deployment/Service</td><td>N copies, one address?</td><td>3 replicas, probes, ClusterIP</td><td>settings and secrets?</td></tr>
    <tr><td>ConfigMap/Secret/PVC</td><td>config, passwords, big files?</td><td>MODEL_VERSION; base64 token; 20Gi</td><td>placement and size?</td></tr>
    <tr><td>Requests/limits/GPU</td><td>where and how much?</td><td>7 pods per 4-core node; nvidia.com/gpu</td><td>load changes hourly</td></tr>
    <tr><td>HPA</td><td>follow the load?</td><td>2 → 3 → 4 → 2</td><td>how to upgrade?</td></tr>
    <tr><td>Rollouts</td><td>upgrade safely?</td><td>surge 1 / unavailable 0; flip; 9+1</td><td>YAML per environment</td></tr>
    <tr><td>Helm</td><td>package and vary?</td><td>values-prod 6–30; rollback</td><td>ML-specific tools?</td></tr>
    <tr><td>KServe/Kubeflow</td><td>serve/train at ML level?</td><td>InferenceService 10%; pipeline</td><td>→ where do nodes come from? (cloud)</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <ul>
    <li><strong>Control plane</strong>: API server, etcd, scheduler, controllers; <strong>node</strong>: kubelet + pods. <strong>Reconciliation</strong>: make actual = desired, forever.</li>
    <li><strong>Deployment</strong> fields: <code>replicas</code>, <code>selector.matchLabels</code> (= template labels), <code>strategy.rollingUpdate.maxSurge/maxUnavailable</code>, <code>template.spec.containers[].image/ports/env/envFrom/resources/probes</code>.</li>
    <li><strong>Service</strong>: <code>selector</code>, <code>ports: port → targetPort</code>; types ClusterIP, NodePort, LoadBalancer.</li>
    <li><strong>Probes</strong>: startup (protects slow starts), readiness (traffic on/off), liveness (restart).</li>
    <li><strong>Pods per node</strong> = min over resources of floor(allocatable / request): min(floor(3700/500), floor(14848/512)) = min(7, 29) = 7.</li>
    <li><strong>HPA</strong>: desired = ceil(current × currentUtil / targetUtil), clamp [min, max], skip if |ratio − 1| ≤ 0.1; utilisation = usage / request; scale-down stabilisation window.</li>
    <li><strong>Rolling</strong> with surge s and unavailable u: pods between replicas − u and replicas + s at all times.</li>
    <li><strong>Canary by replicas</strong>: share ≈ canary / (stable + canary) = 1/10.</li>
    <li><strong>Helm</strong>: chart (Chart.yaml, values.yaml, templates/), <code>{{ .Values.x }}</code>, <code>helm template/install/upgrade/history/rollback</code>.</li>
    <li><strong>GPU</strong>: <code>limits: nvidia.com/gpu: 1</code>, device plugin, nodeSelector, taints/tolerations.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Kubernetes</b><p>Several services, variable traffic, need for self-healing and rollouts.</p><small>One small model with steady load: a managed endpoint or one VM may be simpler</small></div>
    <div><b>HPA on CPU</b><p>CPU-bound servers like tree models.</p><small>GPU or queue-bound: custom metrics / KEDA</small></div>
    <div><b>Blue-green</b><p>Changes needing instant, total rollback.</p><small>Costs 2× capacity during the switch</small></div>
    <div><b>Canary</b><p>New models, where live behaviour is the unknown.</p><small>Replica ratios are coarse: use a mesh or Argo Rollouts for exact %</small></div>
    <div><b>Helm</b><p>Many manifests, several environments.</p><small>Two static files don't need it</small></div>
    <div><b>KServe / Kubeflow</b><p>Many models, a platform team.</p><small>Overkill for one model</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Editing live objects instead of YAML; selectors matching nothing; no requests (BestEffort) or inflated requests; heavy liveness probes; no readiness probe; HPA without requests; Secrets assumed encrypted; ConfigMap changes not restarting pods; <code>:latest</code>; unvalidated templates.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>3 pods at 88% CPU of request, target 70%. New count?</td><td>ceil(3 × 88/70) = ceil(3.77) = 4</td></tr>
    <tr><td>Readiness vs liveness failure?</td><td>Readiness: removed from the Service, not restarted. Liveness: container restarted</td></tr>
    <tr><td>A 4-core node with 3,700m allocatable, pods request 500m. How many fit by CPU?</td><td>floor(3700 / 500) = 7</td></tr>
    <tr><td>Is a Kubernetes Secret encrypted?</td><td>No, base64-encoded; protect with RBAC, encryption at rest and an external secret store</td></tr>
    <tr><td>maxSurge 1, maxUnavailable 0, 3 replicas: min and max pods during a rollout?</td><td>Never fewer than 3 available, never more than 4 in total</td></tr>
  </table>

  <h2 id="k8-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why run a model server on Kubernetes instead of <code>docker run</code> on a VM?</summary><div class="qa-body">Kubernetes keeps a declared number of replicas alive across machines (self-healing), load-balances to ready pods, autoscales with the HPA, and upgrades with rolling/blue-green/canary strategies and rollback. On a single VM, a person does all of that.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pod vs Deployment vs Service?</summary><div class="qa-body">A pod is one running unit (container(s) with an IP). A Deployment keeps N identical pods from a template and manages rollouts. A Service is the stable address that load-balances across the ready pods matching its selector.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Requests vs limits: what happens when each is exceeded?</summary><div class="qa-body">Requests aren't "exceeded"; they are reservations the scheduler uses for placement (and the HPA for utilisation). Over the CPU limit, a container is throttled; over the memory limit, it is OOMKilled (exit 137) and restarted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a GPU model get scheduled onto a GPU node?</summary><div class="qa-body">The NVIDIA device plugin advertises <code>nvidia.com/gpu</code> on GPU nodes; the pod sets <code>limits: nvidia.com/gpu: 1</code>, often a nodeSelector for the GPU type, and a toleration for the GPU nodes' taint. The scheduler places it only where a whole GPU is free.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the HPA's decision at 12:00 for Biteful.</summary><div class="qa-body">2 pods averaging 96% of requested CPU, target 70%: ratio 1.371, outside the 10% tolerance; desired = ceil(2 × 1.371) = ceil(2.74) = 3, within [2, 10]. The Deployment is scaled to 3; the new pod gets traffic once <code>/ready</code> passes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Rolling update vs blue-green vs canary?</summary><div class="qa-body">Rolling replaces pods gradually within surge/unavailable limits (cheap, gradual, rollback = another rollout). Blue-green runs two full versions and flips traffic at once (instant rollback, 2× capacity). Canary sends a small share to the new version and grows it while metrics hold (limits blast radius; best for new models).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your ETA pods are in CrashLoopBackOff after a new release. What do you check?</summary><div class="qa-body"><code>kubectl logs --previous</code> for the crash (missing env var or model path, version mismatch); <code>kubectl describe pod</code> for probe failures (a liveness probe killing a slow model load: add a startup probe) and OOMKilled (raise the memory limit). Roll back with <code>kubectl rollout undo</code> or <code>helm rollback</code> while investigating.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Helm add over plain YAML?</summary><div class="qa-body">Templating with per-environment values, packaging as a versioned chart, and releases with revision history and whole-release rollback. Render with <code>helm template</code> and validate in CI.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use KServe instead of your own Deployment?</summary><div class="qa-body">When serving many models on Kubernetes and you want one standard resource per model with built-in autoscaling (including scale to zero), exact canary percentages and a standard inference protocol. For one model, a Deployment + Service + HPA is simpler.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do readiness probes depend on the serving note's lifespan?</summary><div class="qa-body">The lifespan loads the model before the server accepts requests, and <code>/ready</code> reports 503 until then. Kubernetes uses that signal to keep new pods out of the Service during rolling updates and scale-ups; without it, traffic would hit pods with no model loaded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must the HPA know the pod's CPU request from section 04?</summary><div class="qa-body">Utilisation is usage divided by request. With requests of 500m, a pod using 480m is at 96%. Without a request, there is no denominator and the HPA can't compute anything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does a Kubernetes rollback relate to an MLflow alias rollback?</summary><div class="qa-body">They roll back different layers. <code>rollout undo</code>/<code>helm rollback</code> returns to the previous image (code + baked-in model); moving <code>@champion</code> back changes which model a server that loads from the registry will fetch. Know which layer the model lives in, and record both the image SHA and the model version in every response.</div></details>
</main>
`
});
