// notes/mlops/mlops_k8s.js — Kubernetes for ML
Object.assign(TOPIC_CONTENT, {
  "mlops_k8s": `<main>
  <h1>Kubernetes for ML</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span><span>Kubernetes for ML</span></div>
  <p class="lead">The <a class="xref" data-note="mlops_serving">Model Serving</a> note ended with one container that answers ETA requests for Biteful. One container on one machine is not yet a service: it dies when the machine dies, it cannot absorb the lunch rush, and replacing it with a new model means a moment where nothing answers. <strong>Kubernetes</strong> is the system most companies use to fix this. You describe what you want (how many copies of which image, how much CPU each may use, which settings and secrets they need, how they are reached, how they should scale and how they should be upgraded) and Kubernetes keeps reality matching that description, on as many machines as you have. This page builds that description for Biteful's ETA server, one concept at a time, ending with the tools built specifically for ML on Kubernetes. There is no Kubernetes cluster in this sandbox, so manifests are shown without cluster output and <code>kubectl</code> commands are marked "not run"; instead, every manifest was checked against the official Kubernetes 1.37 schemas from Python, and the mechanisms that a cluster would perform (reconciliation, scheduling arithmetic, autoscaling, rolling updates, traffic splitting) are taught with small, clearly labelled simulations that were really run.</p>

  <h2 id="k8-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Kubernetes for ML</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Declare desired state in YAML; controllers make reality match, forever</li>
          <li>Control plane: API server, etcd, scheduler, controllers</li>
          <li>Nodes: machines whose kubelet runs pods</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core objects</div>
        <ul>
          <li><b>Pod</b>: container(s) with one IP; probes for startup, readiness, liveness</li>
          <li><b>Deployment</b>: keeps N pods from a template; upgrades and rollbacks</li>
          <li><b>Service</b>: one stable address for the ready pods its selector matches</li>
          <li><b>ConfigMap / Secret / PVC</b>: settings, credentials (base64, not encrypted), storage</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Resources &amp; scaling</div>
        <ul>
          <li><b>Requests</b> reserve (scheduling); <b>limits</b> cap (throttle CPU, OOM-kill memory)</li>
          <li>GPUs: <code>nvidia.com/gpu: 1</code>, whole units, taints + tolerations</li>
          <li><b>HPA</b>: desired = ceil(current × utilisation / target)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Releasing</div>
        <ul>
          <li><b>Rolling</b>: maxSurge / maxUnavailable; <code>rollout undo</code></li>
          <li><b>Blue-green</b>: two full versions, flip the Service selector</li>
          <li><b>Canary</b>: small share first (replica ratio, mesh, or KServe %)</li>
          <li><b>Helm</b> packages manifests; <b>KServe / Kubeflow</b> add ML-level objects</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="k8-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Orchestration</span><span class="rm-sub">desired state and the reconcile loop</span></div></div>
      <div class="rm-item rm-done" data-target="k8-pod"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pods and Probes</span><span class="rm-sub">the smallest thing Kubernetes runs</span></div></div>
      <div class="rm-item rm-done" data-target="k8-deploy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Deployments and Services</span><span class="rm-sub">N copies behind one address</span></div></div>
      <div class="rm-item rm-done" data-target="k8-config"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">ConfigMaps and Secrets</span><span class="rm-sub">settings and passwords outside the image</span></div></div>
      <div class="rm-item rm-done" data-target="k8-vol"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Volumes and Persistent Storage</span><span class="rm-sub">where model files live</span></div></div>
      <div class="rm-item rm-done" data-target="k8-res"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Resource Requests and Limits</span><span class="rm-sub">how pods are placed and capped</span></div></div>
      <div class="rm-item rm-done" data-target="k8-gpu"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">GPU Scheduling</span><span class="rm-sub">getting a model onto a GPU node</span></div></div>
      <div class="rm-item rm-done" data-target="k8-hpa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Horizontal Pod Autoscaler</span><span class="rm-sub">more pods at lunch, fewer at night</span></div></div>
      <div class="rm-item rm-done" data-target="k8-roll"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Rolling, Blue-Green and Canary</span><span class="rm-sub">upgrading without downtime</span></div></div>
      <div class="rm-item rm-done" data-target="k8-helm"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Helm</span><span class="rm-sub">packaging manifests per environment</span></div></div>
      <div class="rm-item rm-done" data-target="k8-kf"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">KServe and Kubeflow</span><span class="rm-sub">ML-specific tools on Kubernetes</span></div></div>
      <div class="rm-item rm-done" data-target="k8-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Pending, OOMKilled, CrashLoopBackOff</span></div></div>
      <div class="rm-item rm-done" data-target="k8-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">the whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="k8-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what Kubernetes-for-ML interviews ask</span></div></div>
    </div>
  </div>

  <h2 id="k8-why"><span class="num">01</span>Why Orchestration</h2>
  <p>Picture the ETA server running as a single container, started with <code>docker run</code> on one server (see <a class="xref" data-note="se_docker">Docker</a>). At 2 a.m. that server's disk fails and checkout stops showing ETAs until someone wakes up and starts the container somewhere else. At noon, checkout traffic triples and the one container cannot keep up, so someone has to start more copies and spread requests across them. Next week the new model must replace the old one, and someone has to stop the old container and start the new one, hoping nothing goes wrong in between. Every one of these jobs is done by a person, and people are slow, asleep or busy.</p>
  <p>Software that does these jobs automatically is called a <strong>container orchestrator</strong>, and <strong>Kubernetes</strong> (often written K8s, "K, eight letters, s") is by far the most widely used one. Its central idea is worth understanding before any YAML. You never tell Kubernetes to "start a container". Instead you write down the <strong>desired state</strong>, for example "three copies of the ETA image should be running", and store it in the cluster. Programs called <strong>controllers</strong> then compare that desired state with the <strong>actual state</strong> (what is really running) and take whatever action closes the gap: start a missing copy, stop an extra one. They do this in a loop that never ends, called the <strong>reconcile loop</strong>. This style, describing what you want rather than the steps to get there, is called <strong>declarative</strong>.</p>
  <p>Think of a restaurant manager with a rule pinned to the wall: "three chefs on shift". If a chef goes home sick, the manager calls in a replacement. If the owner changes the rule to five, the manager calls in two more. Nobody tells the manager how to react to each situation; the manager just keeps comparing the rule with the kitchen and fixing the difference. The rule is the desired state, the manager is the controller.</p>
  <p>Since there is no cluster here, the loop itself is shown as a <strong>simulation</strong> in plain Python. It is the same logic a real controller follows, minus the networking: on every tick, compare the desired count with the running pods and fix the difference.</p>
  <div class="fx" data-lang="py"># SIMULATION: the reconcile loop at the heart of Kubernetes, in plain Python
desired = 3
pods = ["eta-a", "eta-b", "eta-c"]
events = {2: "pod eta-b crashes", 4: "node with eta-a, eta-c dies", 6: "desired changed to 5"}
new_names = iter("defghijk")

for tick in range(1, 8):
    event = events.get(tick, "")
    if "crashes" in event:
        pods.remove("eta-b")
    if "dies" in event:
        pods = [p for p in pods if p not in ("eta-a", "eta-c")]
    if "desired" in event:
        desired = 5
    # the controller never handles "events"; it only compares desired with actual
    while len(pods) &lt; desired:
        pods.append("eta-" + next(new_names))
    while len(pods) &gt; desired:
        pods.pop()
    print(f"t={tick} {event:28s} desired={desired} running={pods}")</div>
  <div class="fx" data-lang="text">t=1                              desired=3 running=['eta-a', 'eta-b', 'eta-c']
t=2 pod eta-b crashes            desired=3 running=['eta-a', 'eta-c', 'eta-d']
t=3                              desired=3 running=['eta-a', 'eta-c', 'eta-d']
t=4 node with eta-a, eta-c dies  desired=3 running=['eta-d', 'eta-e', 'eta-f']
t=5                              desired=3 running=['eta-d', 'eta-e', 'eta-f']
t=6 desired changed to 5         desired=5 running=['eta-d', 'eta-e', 'eta-f', 'eta-g', 'eta-h']
t=7                              desired=5 running=['eta-d', 'eta-e', 'eta-f', 'eta-g', 'eta-h']</div>
  <p>At t=2 a pod crashes, and on the same tick the loop starts <code>eta-d</code> to replace it. At t=4 a whole machine dies, taking two pods with it, and the loop starts two replacements. At t=6 someone changes the desired count to 5, and the loop adds two more. Notice that the code never contains a rule like "if a pod crashes, restart it" or "if a node dies, move its pods". It only ever compares two numbers. That is why Kubernetes copes with failures nobody planned for: whatever the cause, the response is the same.</p>
  <figure class="viz"><svg viewBox="0 0 640 180" width="640">
    <defs><marker id="k8-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="250" height="140" rx="8" fill="none" stroke="currentColor" stroke-dasharray="5 3"/><text x="20" y="38" class="tm" font-size="11">control plane</text>
    <rect x="25" y="48" width="105" height="32" rx="5" class="fv" stroke="currentColor"/><text x="77" y="68" text-anchor="middle" font-size="11">API server</text>
    <rect x="140" y="48" width="105" height="32" rx="5" class="fs" stroke="currentColor"/><text x="192" y="68" text-anchor="middle" font-size="11">etcd (state)</text>
    <rect x="25" y="92" width="105" height="32" rx="5" class="fb sb"/><text x="77" y="112" text-anchor="middle" font-size="11">scheduler</text>
    <rect x="140" y="92" width="105" height="32" rx="5" class="fb sb"/><text x="192" y="112" text-anchor="middle" font-size="11">controllers</text>
    <text x="135" y="148" text-anchor="middle" class="tm" font-size="10">kubectl apply → API server → stored in etcd</text>
    <rect x="320" y="20" width="150" height="140" rx="8" class="fs" stroke="currentColor"/><text x="395" y="38" text-anchor="middle" font-size="11">node 1 (kubelet)</text>
    <rect x="335" y="50" width="120" height="26" rx="5" class="fg sg"/><text x="395" y="68" text-anchor="middle" font-size="11">pod eta</text>
    <rect x="335" y="84" width="120" height="26" rx="5" class="fg sg"/><text x="395" y="102" text-anchor="middle" font-size="11">pod eta</text>
    <rect x="485" y="20" width="150" height="140" rx="8" class="fs" stroke="currentColor"/><text x="560" y="38" text-anchor="middle" font-size="11">node 2 (kubelet)</text>
    <rect x="500" y="50" width="120" height="26" rx="5" class="fg sg"/><text x="560" y="68" text-anchor="middle" font-size="11">pod eta</text>
    <g stroke="currentColor" fill="none" marker-end="url(#k8-ar1)"><line x1="260" y1="90" x2="318" y2="90"/></g>
    <text x="289" y="84" text-anchor="middle" class="tm" font-size="10">assign</text>
  </svg><figcaption>The control plane stores the desired state and decides where pods go; each node's kubelet starts and watches its own pods.</figcaption></figure>
  <p>A real cluster splits this work across a few components, shown in the figure. A cluster is a set of machines called <strong>nodes</strong>. A few of them (or a managed service from a cloud provider) form the <strong>control plane</strong>. Its front door is the <strong>API server</strong>: every request, whether from you running <code>kubectl apply</code> or from a controller, goes through it. The desired state is stored in <strong>etcd</strong>, a small, highly reliable database. The <strong>scheduler</strong> decides which node each new pod should run on, and the <strong>controllers</strong> run reconcile loops like ours, one for each kind of object. On every worker node, an agent called the <strong>kubelet</strong> (the arrow on the right) receives the pods assigned to its node, starts their containers, watches them and reports back. So when the machine in our simulation died at t=4, the node's kubelet stopped reporting, the control plane marked its pods as lost, the controller saw too few pods and created new ones, and the scheduler placed them on healthy nodes.</p>
  <p>One practical consequence follows directly from the loop. If you "fix" something by hand on a running cluster, such as deleting a pod or editing a live object, the controllers will restore whatever the stored desired state says. A deleted pod comes back; a manual edit is overwritten the next time someone applies the YAML from Git. The way to change a Kubernetes system is to change its YAML, review it like code, and apply it.</p>

  <h2 id="k8-pod"><span class="num">02</span>Pods and Probes</h2>
  <p>The desired state is written as <strong>manifests</strong>: YAML files, each describing one object, with four standard parts. <code>apiVersion</code> and <code>kind</code> say what type of object it is; <code>metadata</code> gives it a name and <strong>labels</strong>, free-form key-value tags such as <code>app: biteful-eta</code> that other objects use to find it; and <code>spec</code> is the desired state itself. The smallest object Kubernetes can run is a <strong>pod</strong>: one container, or occasionally a few tightly coupled containers, that are always scheduled together on the same node and share one network address. For a model server, a pod is simply "one running copy of the ETA container". Pods are meant to be disposable: when one is replaced, the new one gets a new name and a new IP address. Think of a pod as one chef on shift, not as a permanent member of staff.</p>
  <p>Here is a pod for the ETA server. Besides the image and port, it carries three <strong>probes</strong>: checks the kubelet performs on the container, here by calling HTTP endpoints. They connect directly to the <code>/health</code> and <code>/ready</code> endpoints from the serving note.</p>
  <div class="fx" data-lang="text">apiVersion: v1
kind: Pod
metadata:
  name: eta-pod
  labels:
    app: biteful-eta
spec:
  containers:
    - name: api
      image: ghcr.io/biteful/eta:a72a702       # the image CI built, tagged with the Git commit
      ports:
        - containerPort: 8000
      startupProbe:                            # give the model up to 60 s to load
        httpGet: {path: /health, port: 8000}
        periodSeconds: 2
        failureThreshold: 30
      readinessProbe:                          # traffic only once /ready says 200
        httpGet: {path: /ready, port: 8000}
        periodSeconds: 5
      livenessProbe:                           # restart if /health stops answering
        httpGet: {path: /health, port: 8000}
        periodSeconds: 10
        failureThreshold: 3</div>
  <p>The <strong>readiness probe</strong> calls <code>/ready</code> every 5 seconds. While it fails (the server answers 503 while its model loads), the pod receives no traffic, but nothing is restarted. The <strong>liveness probe</strong> calls <code>/health</code> every 10 seconds; if it fails three times in a row, the kubelet decides the process is stuck and restarts the container. The <strong>startup probe</strong> solves a specific problem for ML: models can take a long time to load, and a liveness probe that starts checking immediately might kill a container that is merely slow. While the startup probe is running, the other two probes wait. Here it allows up to 30 failures, 2 seconds apart, so the model has a full minute to load before Kubernetes gives up and restarts the container.</p>
  <table class="tbl">
    <tr><th>Probe</th><th>Calls</th><th>When it fails</th><th>Why the ETA server needs it</th></tr>
    <tr><td>startup</td><td><code>/health</code> every 2 s, up to 30 times</td><td>container restarted after 60 s</td><td>protects a slow model load from the liveness probe</td></tr>
    <tr><td>readiness</td><td><code>/ready</code> every 5 s</td><td>pod taken out of traffic, not restarted</td><td>503 until the model is in memory</td></tr>
    <tr><td>liveness</td><td><code>/health</code> every 10 s</td><td>container restarted after 3 failures</td><td>a hung process gets replaced</td></tr>
  </table>
  <p>Without a cluster we cannot apply this manifest, but we can perform the same first checks the API server would. A manifest must be valid YAML, and it must match the official schema for its kind and API version: correct field names, correct types, no unknown fields. The <code>kubernetes-validate</code> package carries those schemas, so a few lines of Python can check a manifest exactly as strictly as the API server's schema check:</p>
  <div class="fx" data-lang="py">import yaml, kubernetes_validate

with open("pod.yaml") as f:
    pod = yaml.safe_load(f)                     # step 1: is it valid YAML at all?
print(pod["kind"], pod["metadata"]["name"], "-&gt;", pod["spec"]["containers"][0]["image"])

# step 2: does it match the official Kubernetes 1.37 schema for a Pod? (strict: no unknown fields)
kubernetes_validate.validate(pod, "1.37", strict=True)
print("pod.yaml passed schema validation")</div>
  <div class="fx" data-lang="text">Pod eta-pod -&gt; ghcr.io/biteful/eta:a72a702
pod.yaml passed schema validation</div>
  <p>The file parsed as YAML into an ordinary Python dictionary, from which we can read the kind, name and image, and it passed strict validation against the Kubernetes 1.37 Pod schema. In practice you rarely create bare pods like this one, because nobody would recreate it if its node died. Pods are almost always created for you by a higher-level object, which is the next section.</p>

  <h2 id="k8-deploy"><span class="num">03</span>Deployments and Services</h2>
  <p>We want three copies of the ETA pod, kept at three no matter what, and we want the checkout service to reach "the ETA server" without knowing which copies exist right now or what their IP addresses are. Those are two separate jobs, and Kubernetes has one object for each.</p>
  <p>A <strong>Deployment</strong> holds a pod template and a replica count, and its controller keeps exactly that many pods running from the template. (Internally it does this through another object called a ReplicaSet, which is why pod names look like <code>biteful-eta-7d9f-abc</code>.) The Deployment also performs upgrades when the template changes and remembers earlier versions so you can roll back, which section 09 covers. A <strong>Service</strong> gives a set of pods one stable name and virtual IP address and spreads incoming requests across them. Back in the restaurant, the Deployment is the shift manager keeping three chefs cooking from the same recipe card, and the Service is the order counter: customers hand orders to the counter, never to a named chef, and the counter only passes orders to chefs who are ready.</p>
  <div class="fx" data-lang="text">apiVersion: apps/v1
kind: Deployment
metadata:
  name: biteful-eta
spec:
  replicas: 3                                  # desired state: three copies
  selector:
    matchLabels: {app: biteful-eta}            # "my pods are the ones labelled app=biteful-eta"
  template:                                    # the pod to stamp out, exactly like pod.yaml
    metadata:
      labels: {app: biteful-eta}
    spec:
      containers:
        - name: api
          image: ghcr.io/biteful/eta:a72a702
          ports: [{containerPort: 8000}]
          envFrom:
            - configMapRef: {name: eta-config}           # MODEL_VERSION, MODEL_PATH, LOG_LEVEL
          env:
            - name: MLFLOW_TRACKING_TOKEN
              valueFrom: {secretKeyRef: {name: eta-secrets, key: MLFLOW_TRACKING_TOKEN}}
          resources:
            requests: {cpu: 500m, memory: 512Mi}         # reserved for this container
            limits: {cpu: "1", memory: 1Gi}              # the most it may use
          startupProbe: {httpGet: {path: /health, port: 8000}, periodSeconds: 2, failureThreshold: 30}
          readinessProbe: {httpGet: {path: /ready, port: 8000}, periodSeconds: 5}
          livenessProbe: {httpGet: {path: /health, port: 8000}, periodSeconds: 10, failureThreshold: 3}</div>
  <div class="fx" data-lang="text">apiVersion: v1
kind: Service
metadata:
  name: biteful-eta
spec:
  type: ClusterIP                              # reachable inside the cluster only
  selector: {app: biteful-eta}                 # send traffic to READY pods with this label
  ports:
    - port: 80                                 # callers use http://biteful-eta:80
      targetPort: 8000                         # forwarded to the container's port 8000</div>
  <p>The Deployment's <code>template</code> is exactly the pod from the last section, plus settings and resources that later sections explain. Two lines connect everything: the template gives each pod the label <code>app: biteful-eta</code>, and both the Deployment's <code>selector</code> and the Service's <code>selector</code> say "the pods labelled <code>app: biteful-eta</code>". A <strong>label selector</strong> is simply a query over labels, and it is the glue of Kubernetes: objects do not hold lists of pod names (which would go stale every time a pod is replaced); they hold a query, and whatever pods match it right now are the ones they manage or send traffic to. The Service listens on port 80 and forwards to port 8000 in the containers, so inside the cluster the checkout service calls <code>http://biteful-eta/predict</code>.</p>
  <p>A Service sends traffic only to pods that match its selector <em>and</em> are ready. The simulation below plays the Service's part with four pods: three ETA pods, one of which is still loading its model, and one pod from a different app.</p>
  <div class="fx" data-lang="py"># SIMULATION: how a Service picks its endpoints (label match AND readiness)
pods = [
    {"name": "biteful-eta-7d9f-abc", "labels": {"app": "biteful-eta"}, "ready": True},
    {"name": "biteful-eta-7d9f-def", "labels": {"app": "biteful-eta"}, "ready": True},
    {"name": "biteful-eta-7d9f-ghi", "labels": {"app": "biteful-eta"}, "ready": False},  # still loading
    {"name": "fraud-model-55c1-xyz", "labels": {"app": "fraud-model"}, "ready": True},
]

def endpoints(selector):
    return [p["name"] for p in pods
            if all(p["labels"].get(k) == v for k, v in selector.items()) and p["ready"]]

print("selector app=biteful-eta :", endpoints({"app": "biteful-eta"}))
print("selector app=bitefull-eta:", endpoints({"app": "bitefull-eta"}))   # a typo</div>
  <div class="fx" data-lang="text">selector app=biteful-eta : ['biteful-eta-7d9f-abc', 'biteful-eta-7d9f-def']
selector app=bitefull-eta: []</div>
  <p>With the correct selector, the Service's <strong>endpoints</strong> (the list of pod addresses it actually forwards to) are the two ready ETA pods. The pod that is still loading is skipped until its readiness probe passes, and the fraud model's pod is ignored because its label does not match. The second line shows a classic mistake: a one-letter typo in the selector. The Service still exists and its name still resolves, but it has no endpoints, so every request to it fails. On a real cluster, <code>kubectl get endpoints biteful-eta</code> shows this list, and it is the first thing to check when a Service "does not work".</p>
  <p>Validation catches a different kind of mistake, the kind that comes from typing YAML by hand. The file <code>broken.yaml</code> is a copy of the Deployment with two small errors in it. We validate the real files, then the broken one, then the broken one again after fixing the first error:</p>
  <div class="fx" data-lang="py">import yaml, kubernetes_validate

def check(label, doc):
    try:
        kubernetes_validate.validate(doc, "1.37", strict=True)
        print(f"{label:22s} OK")
    except kubernetes_validate.ValidationError as e:
        where = ".".join(str(p) for p in e.path)
        print(f"{label:22s} INVALID at {where}: {e.message}")

for path in ["deployment.yaml", "service.yaml", "broken.yaml"]:
    with open(path) as f:
        check(path, yaml.safe_load(f))

with open("broken.yaml") as f:
    doc = yaml.safe_load(f)
doc["spec"]["replicas"] = 3                     # fix the first mistake and check again
check("broken.yaml (fixed 1)", doc)</div>
  <div class="fx" data-lang="text">deployment.yaml        OK
service.yaml           OK
broken.yaml            INVALID at spec.replicas: '3' is not of type 'integer', 'null'
broken.yaml (fixed 1)  INVALID at spec.template.spec.containers.0.resources: Additional properties are not allowed ('request' was unexpected)</div>
  <p>The real Deployment and Service pass. The broken file fails because <code>replicas: "3"</code> is a string (the quotes make it text), while the schema requires an integer. After fixing that, the second error appears: the container has <code>resources.request</code> instead of <code>resources.requests</code>, and strict validation rejects the unknown field. That second mistake is dangerous on a real cluster, because without strict checking an unknown field can be silently ignored, so the pods would run with no resource requests at all and nobody would notice until the cluster ran out of capacity. Running this kind of check in CI, before anything reaches a cluster, is cheap insurance. On a real cluster you would then apply the files and watch the result (not run here):</p>
  <div class="fx" data-lang="text"># not run: needs a cluster (kind, minikube, EKS, GKE, AKS...)
kubectl apply -f configmap.yaml -f secret.yaml -f deployment.yaml -f service.yaml
kubectl get pods -l app=biteful-eta -o wide       # the 3 pods and the node each runs on
kubectl rollout status deployment/biteful-eta     # wait until all replicas are ready
kubectl get endpoints biteful-eta                 # the pod IPs the Service currently uses
kubectl describe pod &lt;pod-name&gt;                   # events: scheduling, probe failures, restarts
kubectl logs deployment/biteful-eta               # the server's startup/shutdown lines
kubectl port-forward svc/biteful-eta 8080:80      # then: curl localhost:8080/ready</div>

  <h2 id="k8-config"><span class="num">04</span>ConfigMaps and Secrets</h2>
  <p>The same ETA image runs in staging and in production, but the two need different settings: a different model version, a different log level, a different password for the MLflow server the pods talk to. Baking these into the image would mean building a separate image per environment, and baking a password into an image means anyone who can pull the image can read the password. The <a class="xref" data-note="se_docker">Docker</a> note solved this with environment variables passed at <code>docker run</code> time; Kubernetes stores those values as objects of their own, so they can be managed and changed separately from the image.</p>
  <p>A <strong>ConfigMap</strong> holds ordinary, non-secret settings as key-value pairs. A <strong>Secret</strong> holds sensitive values such as passwords, tokens and keys. Pods read both, either as environment variables or as files mounted into the container. In our Deployment, <code>envFrom: configMapRef</code> turns every key of the ConfigMap into an environment variable, and <code>secretKeyRef</code> picks a single key out of the Secret. That is why the server code from the serving note reads <code>os.environ["MODEL_VERSION"]</code>: the value arrives from here. Think of the image as a standard appliance and the ConfigMap as the settings card taped to it at each site, with the Secret as the key kept in the site manager's drawer.</p>
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
  MLFLOW_TRACKING_TOKEN: Yml0ZWZ1bC1kZW1vLXRva2Vu   # looks scrambled, but is only base64</div>
  <p>The token in the Secret looks scrambled, and many people assume that means it is encrypted. It is not. It is <strong>base64</strong>, an encoding that turns any bytes into plain letters and digits so they can be stored safely in a text file. Encoding is not encryption: there is no key, and anyone can reverse it.</p>
  <div class="fx" data-lang="py">import base64, yaml

with open("secret.yaml") as f:
    secret = yaml.safe_load(f)
stored = secret["data"]["MLFLOW_TRACKING_TOKEN"]
print("stored in the Secret:", stored)
print("anyone can decode it:", base64.b64decode(stored).decode())
print("how it was made     :", base64.b64encode(b"biteful-demo-token").decode())</div>
  <div class="fx" data-lang="text">stored in the Secret: Yml0ZWZ1bC1kZW1vLXRva2Vu
anyone can decode it: biteful-demo-token
how it was made     : Yml0ZWZ1bC1kZW1vLXRva2Vu</div>
  <p>One function call turned the stored value back into the real token, <code>biteful-demo-token</code>. So a Secret is protected only by who is allowed to read it. In production that means restricting access with <strong>RBAC</strong> (role-based access control, Kubernetes' permission system, so that only the ETA pods' service account can read <code>eta-secrets</code>), enabling encryption of etcd's data on disk, and never committing real Secret YAML to Git. Most teams keep the real values in an external store such as HashiCorp Vault or the cloud provider's secret manager and let a tool like External Secrets copy them into the cluster.</p>
  <p>One behaviour surprises everyone once. Environment variables are read when a container starts, so changing a ConfigMap does not change anything in pods that are already running. You must restart them (<code>kubectl rollout restart deployment/biteful-eta</code>), or better, include a hash of the configuration in the pod template so that any config change automatically triggers a rolling update; Helm charts commonly do this. Finally, both objects pass schema validation, which we check together with the next section's storage objects.</p>

  <h2 id="k8-vol"><span class="num">05</span>Volumes and Persistent Storage</h2>
  <p>A container's own filesystem is temporary: when the container is replaced, anything written inside it is gone. For the current ETA model this is fine, because the model file is small (a few hundred kilobytes) and is baked into the image. But models change more often than code, and Biteful's planned transformer-based ETA model has 20 GiB of weights, which would make every image enormous and every deployment slow. We need ways to give a container files that do not come from its image, and storage that outlives any single pod.</p>
  <p>Kubernetes provides this through <strong>volumes</strong>: storage declared in the pod spec and mounted into containers at a path, much like plugging a USB drive into a computer and seeing it appear as a folder. There are two kinds that matter most here. An <strong><code>emptyDir</code></strong> volume is an empty scratch folder created when the pod starts and deleted when the pod goes away; containers in the same pod can share it. A <strong>PersistentVolumeClaim</strong> (PVC) is a request for durable storage, such as "20 GiB, readable by many pods at once". The cluster satisfies the claim by binding it to a <strong>PersistentVolume</strong>, an actual piece of storage such as a cloud disk or a shared network filesystem, which keeps its data no matter how many pods come and go. The claim is like a library card: the pod asks for "a 20 GiB read-only shelf", and the cluster finds a real shelf that matches.</p>
  <p>The manifest below shows both, in a common pattern for models. An <strong>init container</strong>, a container that runs to completion before the main container starts, downloads the model file from object storage into an <code>emptyDir</code>, and the server then reads it from there. The large shared weights come from the PVC, mounted read-only at <code>/models</code>.</p>
  <div class="fx" data-lang="text">apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: model-store
spec:
  accessModes: [ReadOnlyMany]                  # many pods may mount it, read-only
  resources:
    requests: {storage: 20Gi}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: biteful-eta-big
spec:
  replicas: 2
  selector:
    matchLabels: {app: biteful-eta-big}
  template:
    metadata:
      labels: {app: biteful-eta-big}
    spec:
      initContainers:                          # runs to completion BEFORE the main container
        - name: fetch-model
          image: amazon/aws-cli:2.17.0
          command: ["aws", "s3", "cp", "s3://biteful-ml-artifacts/eta/v2/model.joblib", "/cache/"]
          volumeMounts: [{name: cache, mountPath: /cache}]
      containers:
        - name: api
          image: ghcr.io/biteful/eta:a72a702
          env: [{name: MODEL_PATH, value: /cache/model.joblib}]
          volumeMounts:
            - {name: cache, mountPath: /cache}                     # the file fetched above
            - {name: weights, mountPath: /models, readOnly: true}  # the shared 20Gi volume
      volumes:
        - name: cache
          emptyDir: {}                                             # scratch space, dies with the pod
        - name: weights
          persistentVolumeClaim: {claimName: model-store, readOnly: true}</div>
  <p>The <code>accessModes</code> field says how the storage may be shared: <code>ReadWriteOnce</code> means one node at a time can mount it for writing (typical for a cloud disk), <code>ReadOnlyMany</code> means many nodes can mount it for reading (ideal for model weights that every replica needs), and <code>ReadWriteMany</code> needs a shared network filesystem. Here are the ConfigMap, the Secret and both storage objects, validated together:</p>
  <div class="fx" data-lang="py">import yaml, kubernetes_validate

for path in ["configmap.yaml", "secret.yaml", "volumes.yaml"]:
    with open(path) as f:
        for doc in yaml.safe_load_all(f):
            kubernetes_validate.validate(doc, "1.37", strict=True)
            print(f'{path:15s} {doc["kind"]}/{doc["metadata"]["name"]} OK')</div>
  <div class="fx" data-lang="text">configmap.yaml  ConfigMap/eta-config OK
secret.yaml     Secret/eta-secrets OK
volumes.yaml    PersistentVolumeClaim/model-store OK
volumes.yaml    Deployment/biteful-eta-big OK</div>
  <p>All four objects pass. Where to put each kind of thing follows a simple rule of thumb: code, dependencies and small models go in the image; per-environment settings go in a ConfigMap; credentials go in a Secret; large or shared files that should outlive pods go on a persistent volume, or are fetched into an <code>emptyDir</code> at startup. Fetching at startup keeps images small, but it adds download time to every pod start, which is exactly the slow startup the startup probe must allow for.</p>

  <h2 id="k8-res"><span class="num">06</span>Resource Requests and Limits</h2>
  <p>Biteful's cluster is made of 4-core machines with 16 GiB of memory. When a new ETA pod is created, which machine should it go on? How many ETA pods can one machine hold? And what stops one misbehaving pod from using all of a machine's memory and starving everything else on it? Without answers, the scheduler would pile pods onto one node until it fell over.</p>
  <p>The answers come from two numbers each container declares. A <strong>request</strong> is the amount of CPU and memory the container is guaranteed; the scheduler places a pod only on a node whose unreserved capacity covers all of its containers' requests. A <strong>limit</strong> is the most the container may use. What happens at the limit depends on the resource. CPU can be slowed down, so a container that tries to use more CPU than its limit is <strong>throttled</strong>: it keeps running, just slower. Memory cannot be taken back, so a container that goes over its memory limit is killed by the Linux kernel's out-of-memory killer, which Kubernetes reports as <strong>OOMKilled</strong> with exit code 137 (see <a class="xref" data-note="se_linux">Linux</a>), and then restarted. CPU is measured in cores or <strong>millicores</strong>, thousandths of a core, so <code>500m</code> is half a core; memory is in bytes with binary suffixes, so <code>512Mi</code> is 512 × 1024 × 1024 bytes.</p>
  <p>Booking a restaurant table is a good picture. The request is the booking: "a table for four" reserves four chairs even if only two people turn up, and the host seats new bookings by counting reserved chairs, not by looking at who is actually eating. The limit is the fire-safety maximum for that table. The key consequence is that the scheduler looks only at requests, never at actual usage. Let us work out how many ETA pods fit on one node. A 4-core, 16 GiB node is 4,000m of CPU and 16,384 Mi of memory, but some is kept back for the operating system, the kubelet and system pods, leaving what is called the <strong>allocatable</strong> capacity. Each ETA pod requests 500m and 512 Mi.</p>
  <div class="fx" data-lang="py"># how many ETA pods fit on one node? The scheduler adds up REQUESTS, not actual usage
node = {"cpu_m": 4000, "mem_mi": 16384}        # a 4-core, 16 GiB machine
reserved = {"cpu_m": 300, "mem_mi": 1536}      # kept back for the OS, kubelet and system pods
pod = {"cpu_m": 500, "mem_mi": 512}            # our requests: 500m CPU, 512Mi memory

allocatable = {k: node[k] - reserved[k] for k in node}
fits = {k: allocatable[k] // pod[k] for k in pod}
print("allocatable:", allocatable)
print("pods that fit by CPU:", fits["cpu_m"], "| by memory:", fits["mem_mi"])
print("pods that fit:", min(fits.values()))</div>
  <div class="fx" data-lang="text">allocatable: {'cpu_m': 3700, 'mem_mi': 14848}
pods that fit by CPU: 7 | by memory: 29
pods that fit: 7</div>
  <p>By CPU, 3,700m / 500m = 7.4, so 7 pods fit (a pod cannot be split). By memory, 14,848 / 512 = 29 pods would fit. The smaller number wins, so 7 ETA pods fit on each node and CPU is the bottleneck. This is the arithmetic the scheduler does for every pod, for every candidate node. It also shows why requests should be set from measured usage: if the ETA pods really use 200m each but request 500m, each node holds 7 pods while it could hold 18, and the cluster bill is more than double what it needs to be. If they request too little, the scheduler packs too many onto one node and they fight for CPU at lunchtime.</p>
  <p>Requests and limits also decide what happens when a node runs short of memory. Kubernetes gives each pod a <strong>Quality of Service (QoS) class</strong> from its resource settings, and when it has to evict pods to save the node, it evicts the lowest class first. The rule is simple enough to write as a small function:</p>
  <div class="fx" data-lang="py"># SIMULATION: the rule Kubernetes uses to give each pod a QoS class
def qos(requests, limits):
    if not requests and not limits:
        return "BestEffort"
    if requests == limits and {"cpu", "memory"} &lt;= requests.keys():
        return "Guaranteed"
    return "Burstable"

print("ETA pod     :", qos({"cpu": "500m", "memory": "512Mi"}, {"cpu": "1", "memory": "1Gi"}))
print("equal       :", qos({"cpu": "1", "memory": "1Gi"}, {"cpu": "1", "memory": "1Gi"}))
print("nothing set :", qos({}, {}))</div>
  <div class="fx" data-lang="text">ETA pod     : Burstable
equal       : Guaranteed
nothing set : BestEffort</div>
  <p>Our ETA pods, with requests lower than their limits, are <strong>Burstable</strong>: they are guaranteed their requests and may burst up to their limits when the node has spare capacity. A pod whose requests equal its limits for both CPU and memory is <strong>Guaranteed</strong> and is evicted last, which suits critical, latency-sensitive servers. A pod with no requests or limits at all is <strong>BestEffort</strong>: it uses whatever is free and is the first to be evicted. Running a production model server as BestEffort is a common way to have it vanish in the middle of the lunch rush.</p>

  <h2 id="k8-gpu"><span class="num">07</span>GPU Scheduling</h2>
  <p>The tree-based ETA model runs happily on CPUs, but the planned transformer model needs a GPU. Biteful's cluster has a few expensive GPU nodes alongside many ordinary ones. Two things must be true: the transformer pod must land on a node that actually has a free GPU of the right type, and ordinary pods, such as the CPU ETA server, must not fill up the GPU nodes and leave no room for the work that needs them.</p>
  <p>Kubernetes does not know about GPUs out of the box. On GPU nodes, the NVIDIA <strong>device plugin</strong> (the Kubernetes counterpart of the NVIDIA Container Toolkit from the <a class="xref" data-note="mlops_cicd">CI/CD</a> note) advertises the node's GPUs as an <strong>extended resource</strong> called <code>nvidia.com/gpu</code>. A pod then asks for GPUs the same way it asks for memory, and the scheduler counts them the same way, with one difference: GPUs come in whole units. A pod can ask for 1 or 2 GPUs, but not for half of one, and by default a GPU given to one pod is not shared with any other. (Sharing schemes exist, such as NVIDIA's Multi-Instance GPU, which splits a large GPU into smaller isolated pieces, and time-slicing, but they are configured specially.)</p>
  <p>Placement uses two complementary mechanisms. A <strong><code>nodeSelector</code></strong> (or its more flexible big brother, node affinity) attracts a pod to nodes with certain labels, for example nodes labelled with a particular GPU model. A <strong>taint</strong> works the other way round: it is a mark on a node that repels every pod, unless the pod carries a matching <strong>toleration</strong>. Cluster operators taint GPU nodes so that only pods which explicitly tolerate the taint can be scheduled there. It is like a reserved parking bay: the sign (taint) keeps ordinary cars out, the permit on the dashboard (toleration) lets the right cars in, and the bay's location (node label) is how those cars find it.</p>
  <div class="fx" data-lang="text">apiVersion: apps/v1
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
      nodeSelector:
        nvidia.com/gpu.product: NVIDIA-L4      # only nodes labelled with this GPU model
      tolerations:                             # allowed onto nodes tainted for GPU work
        - {key: nvidia.com/gpu, operator: Exists, effect: NoSchedule}
      containers:
        - name: model
          image: ghcr.io/biteful/eta-transformer:0.1
          resources:
            requests: {cpu: "2", memory: 12Gi}
            limits: {nvidia.com/gpu: 1, memory: 16Gi}   # GPUs come in whole units
          volumeMounts: [{name: weights, mountPath: /models, readOnly: true}]
      volumes:
        - name: weights
          persistentVolumeClaim: {claimName: model-store, readOnly: true}</div>
  <div class="fx" data-lang="py">import yaml, kubernetes_validate

with open("gpu.yaml") as f:
    dep = yaml.safe_load(f)
kubernetes_validate.validate(dep, "1.37", strict=True)
spec = dep["spec"]["template"]["spec"]
print("gpu.yaml OK")
print("GPU limit   :", spec["containers"][0]["resources"]["limits"]["nvidia.com/gpu"])
print("nodeSelector:", spec["nodeSelector"])
print("toleration  :", spec["tolerations"][0])</div>
  <div class="fx" data-lang="text">gpu.yaml OK
GPU limit   : 1
nodeSelector: {'nvidia.com/gpu.product': 'NVIDIA-L4'}
toleration  : {'key': 'nvidia.com/gpu', 'operator': 'Exists', 'effect': 'NoSchedule'}</div>
  <p>The manifest passes validation, and the printout picks out the three lines that matter. <code>nvidia.com/gpu: 1</code> under <code>limits</code> asks for one whole GPU (for extended resources the request is set equal to the limit). The <code>nodeSelector</code> restricts the pod to nodes labelled as having an NVIDIA L4 GPU. The toleration lets it onto nodes tainted with <code>nvidia.com/gpu</code>, while the CPU ETA pods, which have no such toleration, stay off them. If no node has a free L4 GPU, the pod simply waits in the <code>Pending</code> state, and <code>kubectl describe pod</code> shows the scheduler's reason. The pod also mounts the 20 GiB weights volume from section 05, so the image itself stays small.</p>

  <h2 id="k8-hpa"><span class="num">08</span>Horizontal Pod Autoscaler</h2>
  <p>Three ETA pods are too many at 11:30, when checkout is quiet, and too few at 12:00, when the lunch rush makes them run at nearly full CPU and the p99 latency from the serving note starts to climb. Changing <code>replicas</code> by hand several times a day is exactly the kind of job we wanted to take away from people. We need a rule that adds pods when they are busy and removes them when they are idle.</p>
  <p>The <strong>Horizontal Pod Autoscaler</strong> (HPA) is a controller that does this. "Horizontal" means it scales by changing the number of pods, as opposed to giving each pod more CPU, which would be vertical scaling. Every 15 seconds or so it reads a metric, most often CPU <strong>utilisation</strong>, and adjusts the Deployment's <code>replicas</code>. Utilisation is measured as a percentage of the pod's CPU <em>request</em>, not of the node: an ETA pod requesting 500m and using 480m is at 96%. Its core rule is:</p>
  <p><strong>desired replicas = ceil(current replicas × current utilisation / target utilisation)</strong></p>
  <p>where ceil means "round up", and the result is kept between a minimum and a maximum. If the ratio is within 10% of 1 (the <strong>tolerance</strong>), nothing changes, which stops the replica count from flapping up and down on tiny fluctuations. The logic is the same as a kitchen manager watching how busy the chefs are: if they are at 96% when the comfortable target is 70%, the kitchen needs about 96 / 70 ≈ 1.37 times as many chefs, rounded up.</p>
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
      resource:
        name: cpu
        target: {type: Utilization, averageUtilization: 70}   # aim for 70% of requested CPU
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300          # wait 5 minutes before removing pods</div>
  <p>This HPA keeps the ETA Deployment between 2 and 10 replicas and aims for an average of 70% of requested CPU. The simulation below applies the rule to a Monday lunch, with the CPU utilisation the metrics server might report at each check:</p>
  <div class="fx" data-lang="py">import math
# SIMULATION of the HPA rule: desired = ceil(current * currentUtilisation / target), within [min, max]
def hpa(current, util, target=70, lo=2, hi=10, tolerance=0.10):
    ratio = util / target
    if abs(ratio - 1) &lt;= tolerance:            # within 10% of target: leave it alone
        return current
    return max(lo, min(hi, math.ceil(current * ratio)))

replicas = 3
monday = [("11:30", 45), ("12:00", 96), ("12:15", 88), ("12:30", 74), ("13:00", 61), ("14:00", 30)]
for time, util in monday:                      # average CPU use as a % of the 500m request
    new = hpa(replicas, util)
    print(f"{time}  {replicas} pods at {util:3d}% -&gt; ratio {util / 70:.2f} -&gt; {new} pods")
    replicas = new</div>
  <div class="fx" data-lang="text">11:30  3 pods at  45% -&gt; ratio 0.64 -&gt; 2 pods
12:00  2 pods at  96% -&gt; ratio 1.37 -&gt; 3 pods
12:15  3 pods at  88% -&gt; ratio 1.26 -&gt; 4 pods
12:30  4 pods at  74% -&gt; ratio 1.06 -&gt; 4 pods
13:00  4 pods at  61% -&gt; ratio 0.87 -&gt; 4 pods
14:00  4 pods at  30% -&gt; ratio 0.43 -&gt; 2 pods</div>
  <p>Follow it line by line. At 11:30 three pods are at 45%, a ratio of 0.64; 3 × 0.64 = 1.93, rounded up to 2, which is also the minimum. At 12:00 the two remaining pods are at 96%: 2 × 1.37 = 2.74, rounded up to 3. At 12:15 three pods are still at 88%: 3 × 1.26 = 3.77, rounded up to 4. At 12:30 the ratio is 1.06, within the 10% tolerance, so nothing changes. At 13:00 the ratio is 0.87 and 4 × 0.87 = 3.49 rounds back up to 4. By 14:00 the pods are at 30%, and 4 × 0.43 = 1.71 rounds up to 2.</p>
  <p>Two details of the real HPA are left out of the simulation and matter in practice. First, scaling down waits for the <code>stabilizationWindowSeconds</code> (300 seconds here): the HPA uses the highest recommendation from the last five minutes, so a brief dip does not remove pods that will be needed again a minute later. Second, a new pod only helps once its readiness probe passes, which for a model server means once its model is loaded; a model that takes two minutes to load makes the cluster react two minutes late to every rush, which is a strong argument for fast, small model files (see ONNX and quantisation in the serving note). The HPA also needs requests to be set, since without a request there is nothing to divide by, and it needs the <strong>metrics server</strong> add-on installed to read CPU usage. CPU is a poor signal for GPU models or for servers that mostly wait on other services; those are better scaled on custom metrics such as requests per second, queue length or GPU utilisation, through a metrics adapter or the event-driven autoscaler KEDA.</p>

  <h2 id="k8-roll"><span class="num">09</span>Rolling, Blue-Green and Canary</h2>
  <p>Next week the image changes from v1 (the random forest) to v2 (gradient boosting). The naive way is to delete the three v1 pods and create three v2 pods, but then for the minute or so it takes the new pods to load their models, no pod is ready and checkout gets errors. And if v2 has a bug, every customer gets it at once. We need ways to replace pods without ever dropping below capacity, and to limit how many customers a bad version can reach.</p>
  <p>The default is a <strong>rolling update</strong>: when you change the Deployment's template (for example the image tag), the Deployment replaces old pods with new ones a few at a time. Two settings control the pace. <code>maxSurge</code> is how many pods may exist above the desired count during the update, and <code>maxUnavailable</code> is how many may be missing below it. It is like renovating a hotel floor while staying open: you never close more rooms than you can spare. For a model server, the safest setting is to add before removing:</p>
  <div class="fx" data-lang="text"># the part of deployment.yaml that controls upgrades
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # at most 1 pod above the desired 3 during the upgrade
      maxUnavailable: 0    # never fewer than 3 ready pods
  minReadySeconds: 10      # a new pod must stay ready 10 s before it counts</div>
  <p>With 3 replicas, <code>maxSurge: 1</code> and <code>maxUnavailable: 0</code>, the Deployment must add a v2 pod first (4 pods), wait until it is ready, remove a v1 pod (back to 3), and repeat. The simulation walks through the sequence:</p>
  <div class="fx" data-lang="py"># SIMULATION: a rolling update of 3 pods from v1 to v2 with maxSurge=1, maxUnavailable=0
desired, max_surge, max_unavailable = 3, 1, 0
v1, v2 = 3, 0
step = 0
print(f"step {step}: v1={v1} v2={v2}  total={v1 + v2}  ready={v1 + v2}")
while v2 &lt; desired:
    if v1 + v2 &lt; desired + max_surge:          # room to add a pod above the desired count?
        v2 += 1; step += 1
        print(f"step {step}: v1={v1} v2={v2}  total={v1 + v2}  ready={v1 + v2 - 1}   (new v2 pod loading its model)")
    ready = v1 + v2                            # the new pod has now passed its readiness probe
    if ready - 1 &gt;= desired - max_unavailable: # can we remove an old pod and stay at capacity?
        v1 -= 1; step += 1
        print(f"step {step}: v1={v1} v2={v2}  total={v1 + v2}  ready={v1 + v2}")</div>
  <div class="fx" data-lang="text">step 0: v1=3 v2=0  total=3  ready=3
step 1: v1=3 v2=1  total=4  ready=3   (new v2 pod loading its model)
step 2: v1=2 v2=1  total=3  ready=3
step 3: v1=2 v2=2  total=4  ready=3   (new v2 pod loading its model)
step 4: v1=1 v2=2  total=3  ready=3
step 5: v1=1 v2=3  total=4  ready=3   (new v2 pod loading its model)
step 6: v1=0 v2=3  total=3  ready=3</div>
  <p>At every step at least 3 pods are ready to serve, and the total never exceeds 4. The odd-numbered steps are the moments when a new v2 pod exists but is still loading its model; it is not counted as ready and gets no traffic until its readiness probe passes. This is why the readiness probe is what makes a rolling update safe: without it, Kubernetes would consider each new pod available as soon as its process started, remove a v1 pod, and send customers to a v2 pod with no model loaded. If the v2 pods never become ready, perhaps because the new model file is missing, the rollout simply stalls with the v1 pods still serving, and <code>kubectl rollout undo</code> returns the Deployment to its previous template.</p>
  <p>A rolling update has two weaknesses: for a while, some customers get v1 and some get v2, and rolling back is itself another rolling update that takes time. <strong>Blue-green deployment</strong> avoids both. You run two complete Deployments side by side: <strong>blue</strong>, the current version, serving all traffic, and <strong>green</strong>, the new version, fully started and tested but receiving nothing. The switch is a single change to the Service's selector, from <code>track: blue</code> to <code>track: green</code>, and rolling back is changing it back, which takes effect almost instantly. The price is running double capacity during the switch. It is like a theatre with two identical stages: the next show is set up behind the curtain while the current one plays, and switching is just raising a different curtain.</p>
  <div class="fx" data-lang="text">apiVersion: apps/v1
kind: Deployment
metadata: {name: eta-blue}
spec:
  replicas: 3
  selector: {matchLabels: {app: biteful-eta, track: blue}}
  template:
    metadata: {labels: {app: biteful-eta, track: blue}}
    spec:
      containers: [{name: api, image: "ghcr.io/biteful/eta:18d6a1b", ports: [{containerPort: 8000}]}]  # v1
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
      containers: [{name: api, image: "ghcr.io/biteful/eta:a72a702", ports: [{containerPort: 8000}]}]  # v2
---
apiVersion: v1
kind: Service
metadata: {name: biteful-eta}
spec:
  selector: {app: biteful-eta, track: blue}    # the switch: change blue to green
  ports: [{port: 80, targetPort: 8000}]</div>
  <p>A <strong>canary release</strong> sends only a small share of traffic to the new version first and increases it while the metrics stay healthy. The simplest canary on plain Kubernetes uses replica counts. Two Deployments, a stable one with 9 v1 pods and a canary one with 1 v2 pod, both carry the label <code>app: biteful-eta</code>, so the main Service (whose selector is just <code>app: biteful-eta</code>) spreads requests over all 10 pods, and about one request in ten reaches v2.</p>
  <div class="fx" data-lang="text">apiVersion: apps/v1
kind: Deployment
metadata: {name: eta-stable}
spec:
  replicas: 9
  selector: {matchLabels: {app: biteful-eta, track: stable}}
  template:
    metadata: {labels: {app: biteful-eta, track: stable}}
    spec:
      containers: [{name: api, image: "ghcr.io/biteful/eta:18d6a1b", ports: [{containerPort: 8000}]}]  # v1
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
      containers: [{name: api, image: "ghcr.io/biteful/eta:a72a702", ports: [{containerPort: 8000}]}]  # v2
# the existing Service (selector app: biteful-eta) now spreads traffic over all 10 pods</div>
  <div class="fx" data-lang="py">import random
# SIMULATION: a Service spreads requests evenly over ready pods; 9 stable + 1 canary
random.seed(0)
pods = ["stable"] * 9 + ["canary"]
requests = [random.choice(pods) for _ in range(10_000)]
print(f"canary share of 10,000 requests: {requests.count('canary') / len(requests):.2%}")
for stable, canary in [(9, 1), (19, 1), (3, 1)]:
    print(f"{stable} stable + {canary} canary -&gt; about {canary / (stable + canary):.0%} of traffic")</div>
  <div class="fx" data-lang="text">canary share of 10,000 requests: 10.17%
9 stable + 1 canary -&gt; about 10% of traffic
19 stable + 1 canary -&gt; about 5% of traffic
3 stable + 1 canary -&gt; about 25% of traffic</div>
  <p>In the simulation, 10.17% of 10,000 requests reached the canary, close to the expected 10%. The other lines show the catch: the share is tied to pod counts, so 5% needs 19 stable pods for every canary pod, and fine-grained percentages need many pods. The split is also random per request, so the same customer may hit v1 on one order and v2 on the next, unlike the sticky, hash-based routing in the serving note. For exact percentages and stickiness, teams use a service mesh such as Istio or Linkerd, or a progressive-delivery tool such as Argo Rollouts or Flagger, which can also automate the whole canary: increase the share step by step, compare error rate and latency with the stable version, and roll back automatically if they degrade. KServe, in section 11, offers the same as a single field. The commands for these strategies on a real cluster (not run here):</p>
  <div class="fx" data-lang="text"># not run: needs a cluster
kubectl set image deployment/biteful-eta api=ghcr.io/biteful/eta:b4c5d6e   # start a rolling update
kubectl rollout status deployment/biteful-eta      # watch it progress
kubectl rollout undo deployment/biteful-eta        # go back to the previous template
# blue-green: point the Service at green, and back again to roll back
kubectl patch service biteful-eta -p '{"spec":{"selector":{"app":"biteful-eta","track":"green"}}}'
kubectl patch service biteful-eta -p '{"spec":{"selector":{"app":"biteful-eta","track":"blue"}}}'</div>
  <table class="tbl">
    <tr><th></th><th>Rolling</th><th>Blue-green</th><th>Canary</th></tr>
    <tr><td>Extra capacity needed</td><td>maxSurge pods</td><td>a full second copy</td><td>a few pods</td></tr>
    <tr><td>Who gets the new version</td><td>everyone, pod by pod</td><td>everyone at once</td><td>a small share first</td></tr>
    <tr><td>Rollback</td><td><code>rollout undo</code> (another rollout)</td><td>flip the selector back, instant</td><td>scale the canary to 0</td></tr>
    <tr><td>Best for</td><td>routine updates</td><td>risky changes needing instant rollback</td><td>new models, where live behaviour is the unknown</td></tr>
  </table>

  <h2 id="k8-helm"><span class="num">10</span>Helm</h2>
  <p>By now the ETA service is a Deployment, a Service, a ConfigMap, a Secret, an HPA and possibly volumes, about half a dozen files. Staging wants 2 to 10 replicas and production 6 to 30; every release changes the image tag. Copying the whole set of files per environment and editing them by hand is how mistakes like <code>replicas: "3"</code> creep in, and if a release goes wrong you want to roll back all the objects together, not one at a time.</p>
  <p><strong>Helm</strong> is the package manager for Kubernetes, and it solves both problems. A <strong>chart</strong> is a folder containing <code>Chart.yaml</code> (the chart's name and version), <code>values.yaml</code> (default settings) and a <code>templates/</code> folder of manifests with placeholders. Helm fills the placeholders from the values, producing ordinary YAML, and applies it. Each installation of a chart is a <strong>release</strong>, and every upgrade of a release becomes a numbered <strong>revision</strong> that Helm remembers, so a whole release can be rolled back in one command. Think of a printed invitation template: the design is fixed, each family fills in its own names, date and venue, and the printer keeps a copy of every print run so last month's version can be reprinted exactly.</p>
  <div class="fx" data-lang="text"># chart/Chart.yaml
apiVersion: v2
name: biteful-eta
description: Biteful delivery-time model server
version: 0.3.0            # version of the chart (the packaging)
appVersion: "a72a702"     # version of the app inside (the image tag)</div>
  <div class="fx" data-lang="text"># chart/values.yaml: defaults, used by every environment
image:
  repository: ghcr.io/biteful/eta
  tag: a72a702
replicas: 3
modelVersion: "2"
resources:
  requests: {cpu: 500m, memory: 512Mi}
  limits: {cpu: "1", memory: 1Gi}
autoscaling: {enabled: true, minReplicas: 2, maxReplicas: 10, cpuTarget: 70}</div>
  <div class="fx" data-lang="text"># chart/values-prod.yaml: only what production changes
replicas: 6
autoscaling: {minReplicas: 6, maxReplicas: 30, cpuTarget: 60}</div>
  <div class="fx" data-lang="text"># chart/templates/deployment.yaml
apiVersion: apps/v1
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
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          readinessProbe: {httpGet: {path: /ready, port: 8000}}</div>
  <p>In the template, <code>{{ .Values.replicas }}</code> is replaced by the <code>replicas</code> value, <code>{{ .Release.Name }}</code> by the name given when the chart is installed, and <code>toYaml .Values.resources | nindent 12</code> inserts the whole resources block from the values file, indented by 12 spaces so the YAML stays valid. Chart.yaml has two versions: <code>version</code> is the version of the chart itself (the packaging), while <code>appVersion</code> is the version of the application inside it. The production values file contains only what production changes. Helm combines values files in order, with later files overriding earlier ones key by key. Helm itself is not installed here, so the snippet below is an illustration of that merging rule in Python, not Helm's own code:</p>
  <div class="fx" data-lang="py">import yaml
# ILLUSTRATION of Helm's rule: later values files override earlier ones, key by key
def merge(base, override):
    out = dict(base)
    for k, v in override.items():
        out[k] = merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out

defaults = yaml.safe_load(open("chart/values.yaml"))
prod = yaml.safe_load(open("chart/values-prod.yaml"))
final = merge(defaults, prod)
print("replicas   :", final["replicas"])
print("autoscaling:", final["autoscaling"])
print("image      :", f'{final["image"]["repository"]}:{final["image"]["tag"]}')</div>
  <div class="fx" data-lang="text">replicas   : 6
autoscaling: {'enabled': True, 'minReplicas': 6, 'maxReplicas': 30, 'cpuTarget': 60}
image      : ghcr.io/biteful/eta:a72a702</div>
  <p>Production ends up with 6 replicas and autoscaling between 6 and 30 at a 60% target, while everything production did not mention, such as <code>enabled: true</code> and the image, comes from the defaults. Because the merge goes key by key inside nested sections, <code>values-prod.yaml</code> did not have to repeat <code>enabled</code>. The day-to-day commands look like this (not run here):</p>
  <div class="fx" data-lang="text"># not run: needs helm and a cluster
helm template eta ./chart -f chart/values-prod.yaml    # render the YAML locally, install nothing
helm install eta ./chart -f chart/values-prod.yaml     # release "eta", revision 1
helm upgrade eta ./chart -f chart/values-prod.yaml --set image.tag=b4c5d6e   # revision 2
helm history eta                                       # list the revisions
helm rollback eta 1                                    # the whole release back to revision 1</div>
  <p>The first command, <code>helm template</code>, renders the final YAML without touching a cluster, which makes it perfect for CI: render every environment's values and run the schema validation from section 03 on the output. That catches templates that produce broken YAML for only some values, such as an indentation that is off by two spaces, before they reach any cluster.</p>

  <h2 id="k8-kf"><span class="num">11</span>KServe and Kubeflow</h2>
  <p>Everything so far is generic Kubernetes; the ETA server could be any web application. Serving one model took a Deployment, a Service, an HPA, probes and some canary machinery, and Biteful will soon have ten models plus a weekly retraining pipeline. ML teams want to say "serve this model" and "run this training pipeline" without assembling the same five objects every time. Kubernetes allows exactly this kind of extension: a <strong>Custom Resource Definition</strong> (CRD) adds a new kind of object to the Kubernetes API, and an <strong>operator</strong>, a controller written for that kind, reconciles it by creating and managing ordinary objects underneath. It is the same reconcile loop from section 01, at a higher level.</p>
  <p><strong>KServe</strong> adds a kind called <code>InferenceService</code>. You give it the model's format and storage location, and its operator creates the server pods (using a built-in server for scikit-learn, XGBoost, PyTorch, ONNX, Triton and others), the routing, the autoscaling, including <strong>scale to zero</strong> when there is no traffic at all, and canary traffic splitting. It also standardises the request format through its inference protocol, so clients do not need to know which framework serves the model.</p>
  <div class="fx" data-lang="text">apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: biteful-eta
spec:
  predictor:
    minReplicas: 2
    maxReplicas: 10
    canaryTrafficPercent: 10                   # 10% of requests to the newest revision
    model:
      modelFormat: {name: sklearn}
      storageUri: s3://biteful-ml-artifacts/eta/v2/</div>
  <p>Compare this with sections 03 to 09: five generic objects become one, and <code>canaryTrafficPercent: 10</code> replaces the 9-plus-1 replica trick with an exact traffic weight. When you update the <code>storageUri</code> to a new model, KServe keeps the previous revision serving 90% and sends 10% to the new one until you promote it. Because <code>InferenceService</code> is a custom resource, the standard schemas do not know it, as the validator shows when we run it over the remaining manifests:</p>
  <div class="fx" data-lang="py">import glob, yaml, kubernetes_validate

for path in ["kserve.yaml", "hpa.yaml", "bluegreen.yaml", "canary.yaml"]:
    with open(path) as f:
        for doc in yaml.safe_load_all(f):
            name = f'{doc["kind"]}/{doc["metadata"]["name"]}'
            try:
                kubernetes_validate.validate(doc, "1.37", strict=True)
                print(f"{path:15s} {name:30s} OK")
            except kubernetes_validate.SchemaNotFoundError:
                print(f"{path:15s} {name:30s} no built-in schema (a custom resource)")</div>
  <div class="fx" data-lang="text">kserve.yaml     InferenceService/biteful-eta   no built-in schema (a custom resource)
hpa.yaml        HorizontalPodAutoscaler/biteful-eta OK
bluegreen.yaml  Deployment/eta-blue            OK
bluegreen.yaml  Deployment/eta-green           OK
bluegreen.yaml  Service/biteful-eta            OK
canary.yaml     Deployment/eta-stable          OK
canary.yaml     Deployment/eta-canary          OK</div>
  <p>The HPA, blue-green and canary manifests all pass, while the <code>InferenceService</code> has no built-in schema. A cluster with KServe installed would validate it against KServe's own CRD schema; in CI you would download that schema and check against it too.</p>
  <p><strong>Kubeflow</strong> is a broader collection of ML tools that run on Kubernetes: hosted notebooks, training operators for distributed PyTorch and TensorFlow jobs, Katib for hyperparameter tuning at cluster scale (like Optuna, but with each trial running as its own pod), and <strong>Kubeflow Pipelines</strong>, where each step of an ML workflow runs as a container and the pipeline is defined in Python. Biteful's weekly retraining pipeline would look roughly like this (not run here: it needs a Kubeflow installation):</p>
  <div class="fx" data-lang="py"># weekly_pipeline.py: Kubeflow Pipelines sketch (not run: needs a Kubeflow installation)
from kfp import dsl

@dsl.component(base_image="ghcr.io/biteful/train:a72a702")
def prepare(raw_uri: str) -&gt; str: ...                 # clean the data, return its location

@dsl.component(base_image="ghcr.io/biteful/train:a72a702")
def train(clean_uri: str, n_estimators: int) -&gt; str: ...   # train, log to MLflow, return model URI

@dsl.component(base_image="ghcr.io/biteful/train:a72a702")
def evaluate(model_uri: str) -&gt; bool: ...             # does it beat the current champion?

@dsl.pipeline(name="biteful-eta-weekly")
def weekly(raw_uri: str = "s3://biteful-data/orders/latest/"):
    clean = prepare(raw_uri=raw_uri)                  # each step runs as its own pod
    model = train(clean_uri=clean.output, n_estimators=300)
    evaluate(model_uri=model.output)</div>
  <p>Each function decorated with <code>@dsl.component</code> becomes a containerised step, the pipeline function wires their inputs and outputs together, and Kubeflow runs each step as a pod and passes data between them through object storage. The output of <code>train</code> feeds <code>evaluate</code>, exactly the gate from the <a class="xref" data-note="mlops_cicd">CI/CD for ML</a> note, now running on the cluster.</p>
  <table class="tbl">
    <tr><th>Need</th><th>Plain Kubernetes</th><th>ML layer on top</th></tr>
    <tr><td>Serve a model</td><td>Deployment + Service + HPA + probes</td><td>KServe <code>InferenceService</code>, Seldon Core</td></tr>
    <tr><td>Canary by exact percentage</td><td>replica ratios or a service mesh</td><td><code>canaryTrafficPercent</code></td></tr>
    <tr><td>Training pipeline</td><td>Jobs and CronJobs chained by hand</td><td>Kubeflow Pipelines, Argo Workflows</td></tr>
    <tr><td>Hyperparameter tuning</td><td>many Jobs</td><td>Katib</td></tr>
    <tr><td>Distributed training</td><td>hand-wired pods</td><td>Training Operator (PyTorchJob, TFJob)</td></tr>
  </table>
  <p>These platforms are powerful but heavy: Kubeflow in particular has many components to install, secure and upgrade. One model is better served by a Deployment, or by a managed cloud endpoint (see <a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a>, which also covers where the cluster's machines come from). KServe and Kubeflow pay off when there are many models and a platform team to run them.</p>

  <h2 id="k8-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Most Kubernetes problems with model servers show up as a handful of pod statuses, and each one usually has the same few causes. A pod stuck in <code>Pending</code> has not been placed on any node: no node has enough unreserved CPU or memory for its requests, or, for GPU pods, no node with a free GPU both matches its <code>nodeSelector</code> and is tolerated. <code>kubectl describe pod</code> shows the scheduler's reason; the fixes are smaller requests, more nodes, or correcting labels and tolerations. A container that keeps restarting with <code>OOMKilled</code> (exit code 137) exceeded its memory limit: the model plus request buffers needs more memory than was allowed. Measure peak memory under load, then raise the limit or shrink the model.</p>
  <p><code>CrashLoopBackOff</code> means the container starts, exits, and is restarted with growing delays. For model servers the usual causes are a missing environment variable, a wrong <code>MODEL_PATH</code>, a library version that cannot read the model file, or a liveness probe that kills a slow model load before it finishes. <code>kubectl logs --previous</code> shows the output of the crashed attempt, and a startup probe fixes the slow-load case. <code>ImagePullBackOff</code> means the node cannot download the image: a wrong tag, or missing credentials for a private registry (an <code>imagePullSecret</code>). Use the exact commit-SHA tag that CI produced, never <code>:latest</code>, which can point to different images on different nodes and leaves nothing specific to roll back to.</p>
  <p>Several other mistakes appeared along the way. Leaving out the readiness probe lets rolling updates and scale-ups send traffic to pods whose model is still loading. Leaving out resource requests makes pods BestEffort (evicted first) and stops the HPA from working, since utilisation is measured against the request; setting requests far above real usage wastes nodes and money. A Service selector that matches no pods, because of a typo in a label, fails every request while looking perfectly healthy. Treating Secrets as encrypted, when base64 is just an encoding, leaks credentials; protect them with RBAC, encryption at rest and an external secret store. Expecting running pods to notice a ConfigMap change leaves stale settings in place until a restart. And editing live objects by hand instead of changing the YAML in Git gets silently undone by the reconcile loop.</p>

  <h2 id="k8-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core ideas</h3>
  <ul>
    <li><b>Declarative desired state</b>: you store what should exist; <b>controllers</b> reconcile actual to desired in an endless loop.</li>
    <li><b>Control plane</b>: API server (front door), etcd (state store), scheduler (places pods), controllers (reconcile). <b>Node</b>: a machine whose <b>kubelet</b> runs and watches pods.</li>
    <li><b>Labels</b> tag objects; <b>selectors</b> query them; Deployments and Services find pods by selector, not by name.</li>
    <li>Change the YAML (in Git), not the live cluster.</li>
  </ul>
  <h3>Objects</h3>
  <table class="tbl">
    <tr><th>Object</th><th>What it does</th><th>Biteful</th></tr>
    <tr><td>Pod</td><td>one or more containers, one IP, disposable</td><td>one ETA server copy</td></tr>
    <tr><td>Deployment</td><td>keeps N pods from a template; rolling updates; rollback</td><td>3 replicas of <code>eta:a72a702</code></td></tr>
    <tr><td>Service</td><td>stable name/IP, load-balances to <em>ready</em> matching pods</td><td><code>biteful-eta:80 → 8000</code></td></tr>
    <tr><td>ConfigMap</td><td>non-secret settings as env vars or files</td><td><code>MODEL_VERSION=2</code></td></tr>
    <tr><td>Secret</td><td>sensitive values, base64-encoded (not encrypted)</td><td>MLflow token</td></tr>
    <tr><td>PVC</td><td>claim for durable storage (RWO, ROX, RWX)</td><td>20Gi weights, ReadOnlyMany</td></tr>
    <tr><td>HPA</td><td>changes replicas from metrics</td><td>2–10 pods at 70% CPU</td></tr>
    <tr><td>CRD + operator</td><td>new object kinds, reconciled by custom controllers</td><td>KServe <code>InferenceService</code></td></tr>
  </table>
  <h3>Probes</h3>
  <table class="tbl">
    <tr><th>Probe</th><th>On failure</th><th>Use</th></tr>
    <tr><td>startup</td><td>restart after the allowed attempts</td><td>give slow model loads time</td></tr>
    <tr><td>readiness</td><td>removed from Service endpoints, not restarted</td><td><code>/ready</code>: model loaded?</td></tr>
    <tr><td>liveness</td><td>container restarted</td><td><code>/health</code>: process alive? (keep trivial)</td></tr>
  </table>
  <h3>Formulas</h3>
  <ul>
    <li><b>Pods per node</b> = min over resources of floor(allocatable / request) = min(floor(3700/500), floor(14848/512)) = min(7, 29) = 7.</li>
    <li><b>HPA</b>: desired = ceil(current × currentUtil / targetUtil), clamped to [min, max]; no change if |ratio − 1| ≤ 0.1; utilisation = usage / request; scale-down stabilisation window (default 300 s).</li>
    <li><b>Rolling update</b>: pods stay between replicas − maxUnavailable (ready) and replicas + maxSurge (total).</li>
    <li><b>Replica canary</b>: share ≈ canary pods / all pods (1 of 10 ≈ 10%).</li>
    <li><b>Limits</b>: over CPU → throttled; over memory → OOMKilled (137). <b>QoS</b>: requests = limits → Guaranteed; some set → Burstable; none → BestEffort (evicted first).</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="text">resources:
  requests: {cpu: 500m, memory: 512Mi}
  limits:   {cpu: "1", memory: 1Gi, nvidia.com/gpu: 1}
readinessProbe: {httpGet: {path: /ready, port: 8000}, periodSeconds: 5}
envFrom: [{configMapRef: {name: eta-config}}]
env: [{name: TOKEN, valueFrom: {secretKeyRef: {name: eta-secrets, key: TOKEN}}}]
strategy: {type: RollingUpdate, rollingUpdate: {maxSurge: 1, maxUnavailable: 0}}
tolerations: [{key: nvidia.com/gpu, operator: Exists, effect: NoSchedule}]

kubectl apply -f deployment.yaml          kubectl get endpoints biteful-eta
kubectl rollout status|undo deployment/X  kubectl logs --previous POD
kubectl describe pod POD                  helm template|install|upgrade|rollback</div>
  <h3>Gotchas</h3>
  <ul>
    <li>No readiness probe → traffic to pods still loading their model.</li>
    <li>Liveness probe on a slow model load → CrashLoopBackOff; add a startup probe.</li>
    <li>No requests → BestEffort, and the HPA cannot compute utilisation.</li>
    <li>Secrets are base64, not encrypted.</li>
    <li>ConfigMap changes need a pod restart (or a config hash in the template).</li>
    <li>Selector typo → Service with no endpoints.</li>
    <li>Use commit-SHA image tags, never <code>:latest</code>.</li>
  </ul>

  <h2 id="k8-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why run a model server on Kubernetes instead of <code>docker run</code> on a VM?</summary><div class="qa-body">Kubernetes keeps a declared number of replicas running across many machines and replaces failed ones automatically, load-balances only to ready copies, scales the count with load, and upgrades with rolling, blue-green or canary strategies plus rollback. On a single VM a person has to do all of that by hand. For one small model with steady traffic, a managed endpoint or a single VM can still be the simpler choice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "declarative" mean in Kubernetes, and what is the reconcile loop?</summary><div class="qa-body">You describe the desired end state (for example, three replicas of an image) rather than the steps to reach it. Controllers continuously compare that desired state with what is actually running and act to remove any difference. Because they only compare states, they handle any cause of drift, such as crashes, lost nodes or manual edits, the same way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the main components of the control plane and what each does.</summary><div class="qa-body">The API server is the front door that validates and stores every request. etcd is the key-value store holding the cluster's state. The scheduler assigns new pods to nodes based on their requests and constraints. The controller manager runs the reconcile loops for Deployments, ReplicaSets and other objects. On each node, the kubelet runs the assigned pods and reports their status.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pod vs Deployment vs Service?</summary><div class="qa-body">A pod is one running unit: one or more containers sharing an IP and lifecycle. A Deployment keeps a set number of identical pods running from a template and manages upgrades and rollbacks. A Service gives those pods one stable name and IP and load-balances to the ones that are ready, found through a label selector.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between readiness, liveness and startup probes?</summary><div class="qa-body">Readiness decides whether a pod receives traffic; failing it removes the pod from Service endpoints without restarting it. Liveness decides whether the container is restarted. A startup probe runs first and holds off the other two, giving slow starts (like large model loads) time to finish. For model servers, readiness should check the model is loaded and liveness should stay trivial.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Requests vs limits: what happens when a container exceeds each?</summary><div class="qa-body">Requests are reservations: the scheduler uses them to place pods and the HPA uses them to compute utilisation; a container can use more than its request if the node has spare capacity. Above its CPU limit, a container is throttled. Above its memory limit, it is OOM-killed (exit code 137) and restarted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many pods requesting 500m CPU and 512Mi fit on a node with 3,700m CPU and 14,848Mi allocatable?</summary><div class="qa-body">By CPU, floor(3700 / 500) = 7; by memory, floor(14848 / 512) = 29. The smaller wins, so 7 pods fit and CPU is the bottleneck. The scheduler counts requests, not actual usage, so inflated requests waste capacity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a Kubernetes Secret secure? How would you handle secrets properly?</summary><div class="qa-body">By default a Secret is only base64-encoded, which anyone can decode, so its safety depends on who can read it. Restrict access with RBAC, enable encryption at rest for etcd, never commit real Secret manifests to Git, and keep the source of truth in an external store such as Vault or a cloud secret manager, synced into the cluster by a tool like External Secrets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your new pods read a value from a ConfigMap you just changed, but the old pods still use the old value. Why?</summary><div class="qa-body">Environment variables from a ConfigMap are read only when a container starts, so running containers keep the old value. Restart the Deployment (<code>kubectl rollout restart</code>) or put a hash of the config in the pod template so a change triggers a rolling update. ConfigMaps mounted as files do update eventually, but the application must re-read them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you store a 20 GB model for a Kubernetes deployment?</summary><div class="qa-body">Not in the image, which would make pulls and rollouts slow. Either mount a PersistentVolumeClaim with ReadOnlyMany access holding the weights, shared by all replicas, or download the model from object storage in an init container into an emptyDir at startup. Either way, allow for the load time with a startup probe and readiness check.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a GPU model get scheduled onto a GPU node, and how do you keep other pods off GPU nodes?</summary><div class="qa-body">The NVIDIA device plugin advertises <code>nvidia.com/gpu</code> as an extended resource; the pod sets <code>limits: nvidia.com/gpu: 1</code> and usually a nodeSelector or affinity for the GPU type. GPU nodes are tainted, and only pods with a matching toleration can run there, so ordinary CPU pods do not occupy expensive GPU nodes. GPUs are allocated in whole units unless MIG or time-slicing is configured.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two pods average 96% of requested CPU and the HPA target is 70%. What happens?</summary><div class="qa-body">The ratio is 96 / 70 ≈ 1.37, outside the 10% tolerance, so desired = ceil(2 × 1.37) = ceil(2.74) = 3, provided that is within the min and max. The Deployment is scaled to 3, and the new pod starts receiving traffic once its readiness probe passes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might CPU-based autoscaling be wrong for a model server, and what would you use instead?</summary><div class="qa-body">GPU models may be saturated while CPU is low, and servers waiting on I/O or other services do not show load as CPU. Scale on a metric that reflects the real bottleneck: requests per second per pod, queue length, latency or GPU utilisation, through a custom metrics adapter or KEDA. Also remember new pods help only after the model loads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain a rolling update with maxSurge 1 and maxUnavailable 0 for 3 replicas.</summary><div class="qa-body">Kubernetes starts one new pod (4 total), waits until it passes readiness, then removes one old pod (back to 3), and repeats until all three are new. There are never fewer than 3 ready pods or more than 4 in total. If new pods never become ready, the rollout stalls with old pods still serving, and <code>kubectl rollout undo</code> reverts it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Rolling update vs blue-green vs canary: when would you use each for a new model?</summary><div class="qa-body">Rolling for routine low-risk updates: cheap and gradual, but mixed versions for a while and slower rollback. Blue-green when you need an instant, total switch and instant rollback, at the cost of double capacity. Canary for new models, where live behaviour is the main unknown: expose a small share, watch error rate, latency and model metrics, then increase or roll back.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Helm add over plain YAML manifests?</summary><div class="qa-body">Templating with per-environment values files, packaging as a versioned chart, and releases with a revision history so a whole set of objects can be upgraded or rolled back together. <code>helm template</code> renders YAML without a cluster, so CI can validate every environment's output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a CRD and an operator? Give an ML example.</summary><div class="qa-body">A Custom Resource Definition adds a new object kind to the Kubernetes API; an operator is a controller that reconciles objects of that kind by managing ordinary resources underneath. KServe's <code>InferenceService</code> is one: you declare a model format and storage URI, and its operator creates the pods, routing, autoscaling and canary splits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose KServe or Kubeflow, and when is it overkill?</summary><div class="qa-body">KServe fits when many models must be served on Kubernetes with standard autoscaling (including scale to zero), exact canary percentages and a common inference protocol. Kubeflow fits when a team needs pipelines, distributed training and tuning on the cluster. For one or two models without a platform team, a Deployment, Service and HPA, or a managed cloud endpoint, is simpler to run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your ETA pods are in CrashLoopBackOff right after a release. How do you debug it?</summary><div class="qa-body">Check <code>kubectl logs --previous</code> for the crash reason (missing environment variable, wrong model path, library version unable to load the model) and <code>kubectl describe pod</code> for events such as liveness probe failures or OOMKilled. A slow model load killed by liveness needs a startup probe; OOMKilled needs a higher memory limit or a smaller model. Roll back with <code>kubectl rollout undo</code> or <code>helm rollback</code> while you investigate.</div></details>
</main>
`
});
