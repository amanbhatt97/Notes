// notes/mlops/mlops_deploy.js — Shipping Models: the map
Object.assign(TOPIC_CONTENT, {
  "mlops_deploy": `<main>
  <h1>Shipping Models: the map</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span></div>
  <p class="lead">"Deployment" is not one skill but four, each answering a question the previous one leaves open: how every change is tested and packaged the same way (CI/CD), how the packaged model answers requests (serving), how many copies run, heal and upgrade (Kubernetes), and where the machines come from and what they cost (cloud and infrastructure as code). This short map note shows how the four notes connect, using Biteful's delivery-time model from registry to customer, and the one idea that runs through all of them: every layer has a version, and rollback is moving a pointer. The hands-on work, with real outputs, lives in the four notes it links to.</p>

  <h2 id="dp-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 210" width="660">
<defs><marker id="dp-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="29" text-anchor="middle" font-size="12">1 · The ML Lifecycle</text><text x="110" y="45" text-anchor="middle" class="tm" font-size="10">code, data, config versioned</text>
<rect x="230" y="10" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="29" text-anchor="middle" font-size="12">2 · MLflow &amp; Tracking</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">@champion = v2, MAE 2.347</text>
<rect x="450" y="10" width="200" height="44" rx="7" class="fg sg" stroke-width="2.5"/><text x="550" y="29" text-anchor="middle" font-size="12" font-weight="700">3 · Shipping Models</text><text x="550" y="45" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · the map</text>
<line x1="210" y1="32" x2="228" y2="32" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#dp-a0)"/><line x1="430" y1="32" x2="448" y2="32" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#dp-a0)"/>
<line x1="550" y1="54" x2="550" y2="70" stroke="currentColor"/><line x1="85" y1="70" x2="575" y2="70" stroke="currentColor"/>
<rect x="10" y="100" width="150" height="56" rx="7" class="fb sb"/><text x="85" y="122" text-anchor="middle" font-size="12">3a · CI/CD</text><text x="85" y="140" text-anchor="middle" class="tm" font-size="10">test + gate + image</text>
<rect x="175" y="100" width="150" height="56" rx="7" class="fb sb"/><text x="250" y="122" text-anchor="middle" font-size="12">3b · Serving</text><text x="250" y="140" text-anchor="middle" class="tm" font-size="10">FastAPI, ONNX, canary</text>
<rect x="340" y="100" width="150" height="56" rx="7" class="fb sb"/><text x="415" y="122" text-anchor="middle" font-size="12">3c · Kubernetes</text><text x="415" y="140" text-anchor="middle" class="tm" font-size="10">replicas, HPA, rollouts</text>
<rect x="505" y="100" width="145" height="56" rx="7" class="fb sb"/><text x="577" y="122" text-anchor="middle" font-size="12">3d · Cloud &amp; IaC</text><text x="577" y="140" text-anchor="middle" class="tm" font-size="10">platforms, spot, Terraform</text>
<g stroke="currentColor" fill="none" marker-end="url(#dp-a0)"><line x1="85" y1="70" x2="85" y2="98"/><line x1="250" y1="70" x2="250" y2="98"/><line x1="415" y1="70" x2="415" y2="98"/><line x1="577" y1="70" x2="577" y2="98"/><line x1="160" y1="128" x2="173" y2="128"/><line x1="325" y1="128" x2="338" y2="128"/><line x1="490" y1="128" x2="503" y2="128"/></g>
<text x="330" y="190" text-anchor="middle" class="tm" font-size="10.5">read in order: each note answers the question the previous one leaves open</text>
</svg><figcaption>The map note opens the shipping group: four notes, one path from a registered model to customers.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a></b><span>The registry holds <code>biteful-eta</code> version 2 (gradient boosting, test MAE 2.347) as <code>@champion</code>, with its Git SHA, data md5 and environment. Left open: the model is a folder in a registry; no customer has seen an ETA yet.</span></li>
    <li><b>This note adds: the map of shipping</b><span>What must happen between "registered" and "customers see 56 minutes", the four notes that do it and how each one's output is the next one's input, and the chain of versions that makes every layer roll back.</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="mlops_cicd">CI/CD for ML</a> → <a class="xref" data-note="mlops_serving">Model Serving &amp; Inference</a> → <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> → <a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a>, then back to the loop with <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>.</span></li>
  </ol>

  <h2 id="dp-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>Running example: Biteful's champion v2 and Monday order 2 (5.5 km, 3 items, raining, Biryani House; really 55 minutes). The goal: the checkout screen shows "ETA 56 min", and we can undo any step.</p>
  <ol class="story">
    <li><b>The shipping gap</b><span>Q: what stands between a registered model and a customer? → Testing, packaging, a server, many copies, machines, and a way back. Who checks every change the same way?</span></li>
    <li><b>CI/CD</b><span>Q: how is every change tested and packaged identically? → 16 tests, a gate (2.347 &lt; 2.654), a multi-stage image tagged with the Git SHA. The image contains a server: how should it answer?</span></li>
    <li><b>Serving</b><span>Q: how does the model answer requests safely and fast? → FastAPI with validation, lifespan, <code>/health</code> and <code>/ready</code>; ONNX; shadow and canary. One server is one machine's worth…</span></li>
    <li><b>Kubernetes</b><span>Q: who runs, heals, scales and upgrades the copies? → Deployments, Services, HPA (2 → 4 pods at lunch), rolling / blue-green / canary. The cluster needs machines…</span></li>
    <li><b>Cloud &amp; IaC</b><span>Q: where do machines come from, reproducibly and affordably? → Managed platforms, spot training with checkpoints, Terraform. And if anything goes wrong?</span></li>
    <li><b>Versioning &amp; rollback</b><span>Q: how do we trace and undo any layer? → A chain of IDs (Git SHA → data md5 → registry version → image tag → Deployment revision → Terraform state), and rollback = moving a pointer at the broken layer.</span></li>
  </ol>

  <h2 id="dp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Shipping Models</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">CI/CD</div>
        <ul>
          <li>Code, data, model, behaviour tests</li>
          <li>Gate vs baseline and champion; exit code</li>
          <li>GitHub Actions / GitLab CI / Jenkins</li>
          <li>Multi-stage image, tag = Git SHA</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Serving</div>
        <ul>
          <li>Batch / real-time / streaming</li>
          <li>FastAPI: validation, lifespan, liveness, readiness</li>
          <li>Safe formats, ONNX, quantisation</li>
          <li>Shadow → canary → A/B</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kubernetes</div>
        <ul>
          <li>Pods, Deployments, Services, probes</li>
          <li>ConfigMaps, Secrets, PVCs; requests, limits, GPUs</li>
          <li>HPA; rolling, blue-green, canary</li>
          <li>Helm; KServe, Kubeflow</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cloud &amp; IaC</div>
        <ul>
          <li>SageMaker, Vertex AI, Azure ML</li>
          <li>Spot + checkpoints</li>
          <li>Terraform: plan, apply, state; Pulumi</li>
          <li>Cost traps: idle endpoints, egress</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Versioning &amp; rollback</div>
        <ul>
          <li>Git SHA → data md5 → registry v2 → image tag → revision</li>
          <li>Model version in every response</li>
          <li>Rollback = move a pointer</li>
          <li>⚠ keep old feature code alive</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dp-gap"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Shipping Gap</span><span class="rm-sub">From registry to customer</span></div></div>
      <div class="rm-item rm-done" data-target="dp-four"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Four Notes, One Pipeline</span><span class="rm-sub">Inputs, outputs, reading order</span></div></div>
      <div class="rm-item rm-done" data-target="dp-rollback"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Versioning &amp; Rollback</span><span class="rm-sub">A pointer at every layer</span></div></div>
      <div class="rm-item rm-done" data-target="dp-connect"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One order, every layer</span></div></div>
      <div class="rm-item rm-done" data-target="dp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole map on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dp-qa"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dp-gap"><span class="num">01</span>The Shipping Gap: from Registry to Customer</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The MLflow note ended with <code>models:/biteful-eta@champion</code>. A customer opening the Biteful app at lunch sees nothing from it yet. What exactly has to exist before that customer sees "ETA 56 min", and in what order should we learn it?</p>
  </div>
  <p>A trained model earns its keep only when the app can ask it questions and get answers, all day, for everyone, safely. Six things stand in the way:</p>
  <table class="tbl">
    <tr><th>Gap</th><th>Without it</th><th>Filled by</th></tr>
    <tr><td>Every change checked the same way</td><td>Friday's "metres" edit ships unchecked</td><td>CI/CD (tests, gate)</td></tr>
    <tr><td>A shippable, identical box</td><td>"works on my laptop": scikit-learn 1.9 vs 1.5</td><td>CI/CD (Docker image)</td></tr>
    <tr><td>Something that answers requests</td><td>a model file nobody can call</td><td>Serving (FastAPI, ONNX)</td></tr>
    <tr><td>Many healthy copies</td><td>one crash or lunch rush = outage</td><td>Kubernetes (Deployment, HPA)</td></tr>
    <tr><td>Machines, reproducibly and affordably</td><td>hand-made servers, surprise bills</td><td>Cloud + Terraform</td></tr>
    <tr><td>A way back</td><td>a bad model stays live for hours</td><td>Versioning and rollback at every layer</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new dish reaching customers. The recipe is approved (registry). A food-safety inspector checks every batch the same way (CI/CD); the kitchen counter takes orders (serving); a manager keeps enough cooks on shift and swaps recipes without closing (Kubernetes); the building is rented and its layout is on a drawing (cloud and IaC). And if the new dish makes people ill, the old recipe card must still be in the drawer (rollback).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Model deployment</strong> is the set of practices that take a validated model version to reliable, observable, reversible use in production: automated testing and packaging, an inference service, orchestration of its replicas, the infrastructure underneath, and controlled rollout and rollback.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Learning deployment tool-first ("learn Kubernetes"). Kubernetes without a tested image and a probe-ready server only runs broken things faster. Follow the order of needs: CI/CD, serving, orchestration, infrastructure.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Four Notes, One Pipeline.</b> Six gaps, four notes. What does each note take in, what does it hand to the next, and which Biteful number proves it worked?</div>

  <h2 id="dp-four"><span class="num">02</span>Four Notes, One Pipeline</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If you read only one of the four notes, what would you miss from the others? How are their outputs chained?</p>
  </div>
  <table class="tbl">
    <tr><th>Note</th><th>Question it answers</th><th>Takes in</th><th>Hands on</th><th>Biteful proof (real runs in that note)</th></tr>
    <tr><td><a class="xref" data-note="mlops_cicd">CI/CD for ML</a></td><td>is every change tested and packaged the same way?</td><td>a commit + registry versions</td><td>image <code>eta:&lt;sha&gt;</code> that passed 16 tests and the gate</td><td>metres bug fails 9/16; gate 2.347 &lt; 2.654 → exit 0; image 824 → 676 MB</td></tr>
    <tr><td><a class="xref" data-note="mlops_serving">Model Serving</a></td><td>how does the model answer, safely and fast?</td><td>the image's <code>app.py</code> + model</td><td>a server with <code>/predict</code>, <code>/health</code>, <code>/ready</code>; a rollout plan</td><td>order 2 → 56.1 min; 120 km → 422; ONNX 0.008 ms/order; shadow gap 1.05 min</td></tr>
    <tr><td><a class="xref" data-note="mlops_k8s">Kubernetes for ML</a></td><td>who runs, heals, scales, upgrades the copies?</td><td>the image + its probes</td><td>a fleet behind one Service</td><td>manifests pass strict schema checks; HPA 2 → 3 → 4 → 2; rolling never below 3 ready</td></tr>
    <tr><td><a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a></td><td>where do machines come from, at what cost?</td><td>the fleet's and pipeline's needs</td><td><code>main.tf</code>, managed jobs/endpoints, spot training</td><td>real-time $175 vs batch $0.90/month (example prices); spot resume identical, MAE 2.348</td></tr>
  </table>
  <div class="flow"><span>commit</span><span>CI: tests + gate</span><span>image:sha</span><span>server in container</span><span>Kubernetes fleet</span><span>cloud machines (Terraform)</span><span>customer: 56 min</span></div>
  <p>The order matters because each note relies on the previous one: Kubernetes' readiness probes need the serving note's <code>/ready</code>; the serving image is the CI note's output; Terraform creates the cluster and endpoints that run that image; and CT (in the CI note) feeds newly trained models back through the same gate.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>deployment pipeline</strong> is the chain commit → automated checks → immutable artifact (image) → inference service → orchestrated replicas → infrastructure, where each stage consumes the previous stage's output and can be reversed independently.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Skipping a link because a later tool "does it". KServe can serve a model without your FastAPI server, and SageMaker can deploy without your CI; but something must still test the model, gate it against the champion and record its versions. Tools move the work, they don't remove it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Versioning &amp; Rollback.</b> Each note adds a layer with its own version (a commit, a registry version, an image tag, a Deployment revision, Terraform state). When something goes wrong at 3 p.m., how do we know which layer, and how do we undo it in a minute?</div>

  <h2 id="dp-rollback"><span class="num">03</span>Versioning &amp; Rollback at Every Layer</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A customer complains: "Yesterday at 3 p.m. your app said 25 minutes and the food took an hour." Which model answered, from which code and data, and if the new model is to blame, how do we go back right now?</p>
  </div>
  <p>Answering needs a chain of IDs, with every link recorded:</p>
  <div class="flow"><span>Git SHA a72a702</span><span>data md5 5c35b2bd</span><span>registry biteful-eta v2</span><span>image eta:a72a702</span><span>Deployment revision / Helm revision</span><span>Terraform state</span></div>
  <ul>
    <li><strong>Every prediction logs the model version</strong> (the serving note returns <code>model_version</code>), so a bad ETA can be traced to its model, and through the registry to its code and data.</li>
    <li><strong>Pin everything</strong>: image tags (never <code>:latest</code>), registry versions or aliases, feature code, library versions.</li>
    <li><strong>Rollback is a pointer move</strong>, at whichever layer broke: move <code>@champion</code> back (MLflow), <code>kubectl rollout undo</code> / <code>helm rollback</code> (Kubernetes), flip the Service selector back to blue, set the canary weight to 0 (serving/K8s), or revert the Terraform commit and apply (infrastructure).</li>
    <li><strong>Keep the old version warm</strong> and its features computable; a rollback that needs a retrain is not a rollback.</li>
  </ul>
  <table class="tbl">
    <tr><th>Layer</th><th>Version lives in</th><th>Rollback move</th><th>Note</th></tr>
    <tr><td>Model choice</td><td>registry alias</td><td><code>set_registered_model_alias(..., "champion", "1")</code></td><td>MLflow</td></tr>
    <tr><td>Code + model in image</td><td>image tag (Git SHA)</td><td>redeploy previous tag</td><td>CI/CD</td></tr>
    <tr><td>Live traffic split</td><td>canary %, router</td><td>canary weight to 0</td><td>Serving</td></tr>
    <tr><td>Running replicas</td><td>Deployment / Helm revision</td><td><code>kubectl rollout undo</code>, <code>helm rollback</code>, flip blue-green selector</td><td>Kubernetes</td></tr>
    <tr><td>Infrastructure</td><td>Terraform code + state</td><td>revert commit, <code>plan</code>, <code>apply</code></td><td>Cloud &amp; IaC</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An "undo" button for each layer of a cake: the recipe (model), the box it's packed in (image), how many shops sell it (replicas), and the shop building (infrastructure). You press the undo for the layer that went wrong, not bake everything again.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lineage</strong>: the recorded chain of identifiers linking a prediction to the model version, code commit, data version and infrastructure that produced it. <strong>Rollback</strong>: restoring the previous known-good version of one layer by moving a pointer, without rebuilding.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A new model that needs a new feature breaks rollback if the old feature pipeline was deleted: the old model can't be fed. Version feature code with the model and keep both alive during a rollout.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One last view: a single order, passing through every layer and every version.</div>

  <h2 id="dp-connect"><span class="num">04</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Follow Monday order 2 from Ravi's commit to the screen: which note's idea acts at each step, and which version is recorded there?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 230" width="660">
<defs><marker id="dp-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="56" rx="7" class="fb sb"/><text x="85" y="30" text-anchor="middle" font-size="11.5" font-weight="700">commit a72a702</text><text x="85" y="46" text-anchor="middle" class="tm" font-size="10">CI: tests, gate</text><text x="85" y="59" text-anchor="middle" class="tm" font-size="10">→ image eta:a72a702</text>
<rect x="175" y="10" width="150" height="56" rx="7" class="fb sb"/><text x="250" y="30" text-anchor="middle" font-size="11.5" font-weight="700">server</text><text x="250" y="46" text-anchor="middle" class="tm" font-size="10">/ready after load</text><text x="250" y="59" text-anchor="middle" class="tm" font-size="10">model_version 2</text>
<rect x="340" y="10" width="150" height="56" rx="7" class="fb sb"/><text x="415" y="30" text-anchor="middle" font-size="11.5" font-weight="700">fleet</text><text x="415" y="46" text-anchor="middle" class="tm" font-size="10">3 replicas, HPA 2–10</text><text x="415" y="59" text-anchor="middle" class="tm" font-size="10">rolling / canary</text>
<rect x="505" y="10" width="145" height="56" rx="7" class="fb sb"/><text x="577" y="30" text-anchor="middle" font-size="11.5" font-weight="700">infrastructure</text><text x="577" y="46" text-anchor="middle" class="tm" font-size="10">main.tf, state</text><text x="577" y="59" text-anchor="middle" class="tm" font-size="10">spot training</text>
<g stroke="currentColor" fill="none" marker-end="url(#dp-a9)"><line x1="160" y1="38" x2="173" y2="38"/><line x1="325" y1="38" x2="338" y2="38"/><line x1="490" y1="38" x2="503" y2="38"/></g>
<rect x="130" y="110" width="400" height="44" rx="7" class="fg sg"/><text x="330" y="129" text-anchor="middle" font-size="11.5" font-weight="700">checkout: order 2 → {"eta_minutes": 56.1, "model_version": "2"}</text><text x="330" y="145" text-anchor="middle" class="tm" font-size="10">real: 55 minutes</text>
<line x1="330" y1="66" x2="330" y2="108" stroke="currentColor" marker-end="url(#dp-a9)"/>
<rect x="130" y="176" width="400" height="44" rx="7" class="fr sr"/><text x="330" y="195" text-anchor="middle" font-size="11.5" font-weight="700">something wrong? roll back the broken layer</text><text x="330" y="211" text-anchor="middle" class="tm" font-size="10">alias · image tag · canary 0 · rollout undo · terraform revert</text>
<line x1="330" y1="154" x2="330" y2="174" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dp-a9)"/>
</svg><figcaption>Four layers, each versioned; the answer carries its model version so any layer can be traced and undone.</figcaption></figure>
  <table class="tbl"><caption>The shipping track on Biteful</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>CI/CD</td><td>tests + gate + image build</td><td>tested and packaged the same way?</td><td>9/16 fail on the bug; gate exit 0 for v2</td><td>every shared repo</td></tr>
    <tr><td>Serving</td><td>FastAPI, probes, ONNX, canary</td><td>how does it answer?</td><td>56.1 min; 422 for 120 km</td><td>any model used by an app</td></tr>
    <tr><td>Kubernetes</td><td>Deployment, Service, HPA, rollouts</td><td>many healthy copies?</td><td>2 → 4 pods at lunch</td><td>several services, variable load</td></tr>
    <tr><td>Cloud &amp; IaC</td><td>platforms, spot, Terraform</td><td>which machines, what cost?</td><td>$175 vs $0.90/month; spot ~$2.10 vs $5.88</td><td>everything not on your own hardware</td></tr>
    <tr><td>Versioning &amp; rollback</td><td>IDs at every layer</td><td>trace and undo?</td><td>SHA a72a702 → v2 → eta:a72a702</td><td>always</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the map: <strong>a registered model reaches customers through four layers (a CI/CD pipeline that tests and packages it, a server that answers safely, an orchestrator that runs and upgrades copies, and reproducible cloud infrastructure), each with its own version, so any prediction can be traced and any layer rolled back by moving one pointer.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The map on one page; the details are in the four notes.</div>

  <h2 id="dp-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful ETA champion v2 (gradient boosting, test MAE 2.347; forest v1 2.654); Monday order 2 → 56.1 minutes (real 55). Reading order: CI/CD → Serving → Kubernetes → Cloud &amp; IaC.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Answer in one line</th><th>Weakness → next</th></tr>
    <tr><td>Shipping gap</td><td>what stands between registry and customer?</td><td>tests, a box, a server, copies, machines, a way back</td><td>who checks every change?</td></tr>
    <tr><td>CI/CD</td><td>same checks, same packaging?</td><td>code/data/model tests, gate, SHA-tagged multi-stage image</td><td>how does it answer?</td></tr>
    <tr><td>Serving</td><td>answer safely and fast?</td><td>FastAPI + validation + lifespan + probes; ONNX; shadow/canary</td><td>one copy isn't enough</td></tr>
    <tr><td>Kubernetes</td><td>run, heal, scale, upgrade?</td><td>Deployment, Service, HPA, rolling/blue-green/canary, Helm</td><td>needs machines</td></tr>
    <tr><td>Cloud &amp; IaC</td><td>which machines, at what cost?</td><td>managed platforms, spot + checkpoints, Terraform, cost hygiene</td><td>need a way back</td></tr>
    <tr><td>Rollback</td><td>trace and undo?</td><td>chain of IDs; move the pointer at the broken layer</td><td>→ monitoring and retraining</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><strong>Deployment</strong>: practices taking a validated model to reliable, observable, reversible production use.</li>
    <li><strong>Deployment pipeline</strong>: commit → checks → immutable image → service → replicas → infrastructure.</li>
    <li><strong>Lineage</strong>: prediction → model version → code SHA + data version → image → infrastructure.</li>
    <li><strong>Rollback</strong>: restore a previous version of one layer by moving a pointer (alias, tag, revision, selector, weight, state).</li>
  </ul>
  <h3>When to use which note</h3>
  <div class="cards">
    <div><b>CI/CD</b><p>Bad changes keep reaching production; releases are manual.</p><small>Start here</small></div>
    <div><b>Serving</b><p>Latency, validation, unsafe model files, risky switches.</p><small>Before Kubernetes</small></div>
    <div><b>Kubernetes</b><p>Outages from crashes, lunch rushes, downtime during upgrades.</p><small>Not needed for one batch job</small></div>
    <div><b>Cloud &amp; IaC</b><p>Hand-made servers, environment drift, big bills.</p><small>Applies from day one in the cloud</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Learning tools before needs; skipping tests or the gate because a platform "deploys"; <code>:latest</code> tags; no model version in responses; deleting old feature code; rollbacks that need a rebuild.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Reading order of the four shipping notes?</td><td>CI/CD → Serving → Kubernetes → Cloud &amp; IaC</td></tr>
    <tr><td>Which note's output does Kubernetes run?</td><td>The CI/CD note's image, containing the serving note's server</td></tr>
    <tr><td>Conversions dropped after v2. Fastest rollback if v2 is a canary?</td><td>Set the canary weight to 0 (or move <code>@champion</code> back / <code>rollout undo</code>, depending on the layer)</td></tr>
    <tr><td>Why return <code>model_version</code> in every response?</td><td>To trace any prediction to its model, code and data, and split metrics during canaries</td></tr>
    <tr><td>Why keep old feature code during a rollout?</td><td>Rolling back to the old model needs the features it was trained on</td></tr>
  </table>

  <h2 id="dp-qa"><span class="num">05</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>"How would you take this model to production?" Give the shape of the answer.</summary><div class="qa-body">Register it with lineage; a CI/CD pipeline tests code, data and model, gates it against the champion and builds a SHA-tagged image; the image runs a validated, probe-ready server; Kubernetes (or a managed endpoint) runs replicas with autoscaling; a shadow then canary release exposes it gradually; infrastructure is in Terraform; every prediction logs the model version; monitoring and retraining close the loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Batch or online inference for a weekly report, and why does that change the rest of the map?</summary><div class="qa-body">Batch: a scheduled job writes scores. It removes the need for an always-on server, autoscaling and canary routing, and costs minutes of compute instead of 730 hours a month. The serving mode decides how much of the map you need.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The new model is live and conversions dropped 8%. Walk through the rollback.</summary><div class="qa-body">Move traffic back first, investigate second: canary weight to 0, or blue-green selector back to blue, or <code>kubectl rollout undo</code>/<code>helm rollback</code>, or move <code>@champion</code> back, whichever layer holds the change. Confirm metrics recover. Then use per-prediction model-version logs to compare v1 and v2, check for feature skew or a data issue, fix, and go through the gate again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why can't Kubernetes alone make a deployment safe?</summary><div class="qa-body">Kubernetes runs whatever image it is given and routes to whatever reports ready. Safety comes from earlier layers: tests and a gate (CI/CD) decide what gets built, and the server's validation and readiness (serving) decide what "ready" means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if the image tag isn't the Git SHA?</summary><div class="qa-body">Lineage: a running container can't be traced to its code, staging and production may run different builds under the same tag (<code>:latest</code>), and rollback has no exact previous version to return to.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do Terraform and Kubernetes divide the work?</summary><div class="qa-body">Terraform creates and versions the infrastructure (cluster, node pools, buckets, registries, managed endpoints); Kubernetes manifests (or Helm) describe what runs inside the cluster. Both are declarative and reconcile code with reality, at different layers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where does monitoring fit on this map?</summary><div class="qa-body">After everything runs: input drift, prediction drift, live MAE once labels arrive, latency and errors per model version. It triggers retraining (CT), whose candidates re-enter the CI/CD gate. Details in Monitoring, Drift &amp; Retraining.</div></details>
</main>
`
});
