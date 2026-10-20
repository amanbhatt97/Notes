// notes/mlops/mlops_cloud.js — Cloud ML Platforms & IaC
Object.assign(TOPIC_CONTENT, {
  "mlops_cloud": `<main>
  <h1>Cloud ML Platforms &amp; IaC</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span><span>Cloud ML Platforms &amp; IaC</span></div>
  <p class="lead">Everything so far needs machines: GPUs for training, servers for the ETA API, storage for data and models, a cluster for Kubernetes. Cloud providers rent all of these by the hour, and also sell managed ML platforms (AWS SageMaker, Google Vertex AI, Azure Machine Learning) that run training jobs, pipelines and endpoints for you. This note maps Biteful's pipeline onto those platforms, makes training cheap with spot instances and checkpoints, describes the infrastructure as code with Terraform, and lists the cost traps that surprise every team. <strong>Honest limits:</strong> there is no cloud account in this sandbox, so no SageMaker, Vertex or Azure call was made (those snippets are labelled not run), and Terraform is not installed, so <code>terraform validate/plan</code> was not run; the Terraform file was instead parsed with <code>python-hcl2</code> to check its syntax. The cost arithmetic and the spot-interruption/checkpoint demo were really run; the prices in them are illustrative examples, not quotes.</p>

  <h2 id="cl-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="cl-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="30" text-anchor="middle" font-size="12">1 · CI/CD</text><text x="85" y="46" text-anchor="middle" class="tm" font-size="10">image eta:&lt;sha&gt;</text>
<rect x="180" y="10" width="140" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="250" y="30" text-anchor="middle" font-size="12">2 · Serving</text><text x="250" y="46" text-anchor="middle" class="tm" font-size="10">the ETA server</text>
<rect x="340" y="10" width="140" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="410" y="30" text-anchor="middle" font-size="12">3 · Kubernetes</text><text x="410" y="46" text-anchor="middle" class="tm" font-size="10">the fleet</text>
<rect x="500" y="10" width="150" height="46" rx="7" class="fg sg" stroke-width="2.5"/><text x="575" y="30" text-anchor="middle" font-size="12" font-weight="700">4 · Cloud &amp; IaC</text><text x="575" y="46" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="160" y1="33" x2="178" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#cl-a0)"/><line x1="320" y1="33" x2="338" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#cl-a0)"/><line x1="480" y1="33" x2="498" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#cl-a0)"/>
<text x="330" y="90" text-anchor="middle" class="tm" font-size="10.5">in: an image, a model in the registry, manifests that need machines</text>
<text x="330" y="110" text-anchor="middle" class="tm" font-size="10.5">out: managed training + endpoints, spot-priced training, all infrastructure in one reviewed main.tf</text>
</svg><figcaption>The last shipping note: where the machines come from, how to pay less for them, and how to rebuild them from code.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a></b><span>We can run a self-healing, autoscaled fleet of ETA servers, and we know the CT pipeline from <a class="xref" data-note="mlops_cicd">CI/CD</a>. Left open: Biteful owns no GPUs and no data centre; someone must create the cluster, the buckets, the registry and the endpoints, keep staging and production identical, and keep the bill under control.</span></li>
    <li><b>This note adds: managed platforms, cheap compute, infrastructure as code</b><span>SageMaker (training jobs, Pipelines, endpoints, batch transform), Vertex AI and Azure ML equivalents, spot instances with checkpointing, Terraform (and Pulumi) for reproducible infrastructure, and cost traps.</span></li>
    <li><b>Leads to</b><span>Back to the loop: monitoring and retraining in <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>; GPU-heavy LLM serving costs in <a class="xref" data-note="llm_prod">LLMOps &amp; Production</a>; the whole map in <a class="xref" data-note="mlops_deploy">Shipping Models</a>.</span></li>
  </ol>

  <h2 id="cl-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>Running example: Biteful's ETA model (champion v2, image <code>eta:a72a702</code>), the weekly retraining pipeline, and a future GPU model. Example prices: a small CPU instance $0.12/hour, a GPU (L4-class) instance $0.98/hour on demand, about $0.30 as spot (illustrative; real prices vary by region and day).</p>
  <ol class="story">
    <li><b>Why the cloud</b><span>Q: where do machines come from, and which way of serving is cheapest? → Rent by the hour. Two always-on CPU instances ≈ $175/month, a nightly batch job ≈ $0.90, a forgotten GPU endpoint ≈ $715. Renting raw machines still means running everything ourselves…</span></li>
    <li><b>SageMaker</b><span>Q: can someone else run training, pipelines and endpoints? → Training jobs (start, train, stop), Pipelines (the CT loop), real-time / serverless / async endpoints, Batch Transform. Is that AWS-only?</span></li>
    <li><b>Vertex AI &amp; Azure ML</b><span>Q: what are the same ideas on Google and Microsoft? → Same building blocks, other names: custom jobs, pipelines, registries, endpoints. Training on GPUs is still expensive…</span></li>
    <li><b>Spot instances</b><span>Q: how do we pay ~70% less for training? → Spot capacity can be taken back at any time; checkpoint every 50 trees and resume: interrupted at 150, finished with identical predictions (MAE 2.348). 6 h GPU: $5.88 on demand vs about $2.10 on spot. But who creates all these resources, identically, in staging and production?</span></li>
    <li><b>Infrastructure as code</b><span>Q: how do we create and change infrastructure reproducibly? → Terraform: <code>main.tf</code> declares a bucket, an image registry, a SageMaker model, endpoint config and endpoint; <code>plan</code> shows changes, <code>apply</code> makes them, state remembers what exists. Even correct infrastructure can quietly cost a fortune…</span></li>
    <li><b>Cost traps</b><span>Q: what makes cloud ML bills explode? → Idle endpoints and GPUs, data egress, NAT gateways, oversized instances, logs, forgotten notebooks. Tags, budgets, auto-shutdown and batch-when-possible.</span></li>
  </ol>

  <h2 id="cl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Cloud ML Platforms &amp; IaC</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why cloud</div>
        <ul>
          <li><b>Rent by the hour</b> — GPUs, servers, storage</li>
          <li><b>IaaS → managed → serverless</b> — less to run, less control</li>
          <li><b>Serving cost</b> — real-time $175, serverless $60, batch $0.90 / month (example)</li>
          <li>💡 renting a kitchen vs a catered meal</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SageMaker</div>
        <ul>
          <li><b>Training job</b> — image + data in S3 → model in S3; machines stop after</li>
          <li><b>Pipelines</b> — steps: process → train → evaluate → condition → register</li>
          <li><b>Endpoints</b> — real-time, serverless, async; <b>Batch Transform</b></li>
          <li><b>Model Registry</b>, managed MLflow</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vertex &amp; Azure ML</div>
        <ul>
          <li><b>Vertex</b> — CustomJob, Vertex Pipelines (KFP), Model Registry, Endpoints, batch prediction</li>
          <li><b>Azure ML</b> — command jobs, pipelines, registry, managed online/batch endpoints</li>
          <li>Same blocks, different names</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Spot</div>
        <ul>
          <li><b>Spare capacity</b>, ~60–90% cheaper, can be reclaimed</li>
          <li><b>Checkpoint + resume</b> — 150 trees saved, identical result</li>
          <li><b>Good for</b> training, batch; <b>bad for</b> sole serving replicas</li>
          <li>6 h GPU: $5.88 vs ~$2.10 (example)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Terraform</div>
        <ul>
          <li><b>Provider, resource, variable, output</b></li>
          <li><b>init → plan → apply</b>; <b>state</b> in a locked remote backend</li>
          <li><b>Drift</b> — console clicks vs code</li>
          <li><b>Pulumi</b> — same idea in Python</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cost traps</div>
        <ul>
          <li>Idle endpoints, GPUs, notebooks</li>
          <li>Egress, NAT gateways, cross-region traffic</li>
          <li>Oversized instances, log volume, old snapshots</li>
          <li>Fix: tags, budgets, auto-stop, batch, scale to zero</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why the Cloud</span><span class="rm-sub">Renting machines, and what serving costs</span></div></div>
      <div class="rm-item rm-done" data-target="cl-sm"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">AWS SageMaker</span><span class="rm-sub">Jobs, pipelines, endpoints</span></div></div>
      <div class="rm-item rm-done" data-target="cl-other"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Vertex AI &amp; Azure ML</span><span class="rm-sub">Same ideas, other names</span></div></div>
      <div class="rm-item rm-done" data-target="cl-spot"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Spot Instances</span><span class="rm-sub">Cheap compute + checkpoints</span></div></div>
      <div class="rm-item rm-done" data-target="cl-iac"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Infrastructure as Code</span><span class="rm-sub">Terraform and Pulumi</span></div></div>
      <div class="rm-item rm-done" data-target="cl-cost"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Cost Traps</span><span class="rm-sub">Where the bill explodes</span></div></div>
      <div class="rm-item rm-done" data-target="cl-connect"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="cl-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Cloud habits that hurt</span></div></div>
      <div class="rm-item rm-done" data-target="cl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="cl-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="cl-why"><span class="num">01</span>Why the Cloud, and What Serving Costs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful wants weekly retraining on a GPU, an ETA API with 2–10 replicas, and a bucket for data and models. Buying servers means paying for lunch-rush capacity all night. Where should the machines come from, and how much does each way of serving cost?</p>
  </div>
  <p>Cloud providers rent computing by the hour (or second). They also sell layers on top, from "a bare virtual machine" to "send us a model and we run everything":</p>
  <table class="tbl">
    <tr><th>Layer</th><th>You manage</th><th>Biteful example</th></tr>
    <tr><td>IaaS (virtual machines)</td><td>OS, Docker, scaling, everything</td><td>EC2 / Compute Engine VMs running <code>docker run</code></td></tr>
    <tr><td>Managed Kubernetes</td><td>manifests; the provider runs the control plane</td><td>EKS / GKE / AKS running the Kubernetes note's YAML</td></tr>
    <tr><td>Managed ML platform</td><td>code, model, settings</td><td>SageMaker / Vertex / Azure ML jobs and endpoints</td></tr>
    <tr><td>Serverless</td><td>only the function or model</td><td>serverless inference, pay per request</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Feeding a wedding. Rent an empty kitchen (IaaS) and bring your own cooks; rent a kitchen with staff (managed platform) and bring the recipe; or order catering (serverless) and pay per plate. More convenience, less control, different pricing.</p>
  </div>
  <p>The cost of serving depends mostly on the serving mode from the serving note. With example prices:</p>
  <div class="fx" data-lang="py"># monthly cost of three ways to serve Biteful ETAs (EXAMPLE prices, not a quote: check your region)
HOURS = 730                                    # hours in a month
price = {"cpu_small": 0.12, "gpu_l4": 0.98}    # $ per instance-hour, illustrative
realtime = 2 * price["cpu_small"] * HOURS      # 2 always-on instances, even at 3 a.m.
serverless = 3_000_000 * 0.00002               # 3M requests x $0.00002 per request (illustrative)
batch = 30 * 0.25 * price["cpu_small"]         # one 15-minute job per day
gpu_idle = 1 * price["gpu_l4"] * HOURS         # a forgotten GPU test endpoint
for name, cost in [("real-time, 2 CPU instances", realtime), ("serverless, 3M requests", serverless),
                   ("nightly batch job", batch), ("forgotten GPU endpoint", gpu_idle)]:
    print(f"{name:28s} \${cost:8.2f} / month")</div>
  <div class="fx" data-lang="text">real-time, 2 CPU instances   $  175.20 / month
serverless, 3M requests      $   60.00 / month
nightly batch job            $    0.90 / month
forgotten GPU endpoint       $  715.40 / month</div>
  <p>By hand: two CPU instances × $0.12 × 730 hours = $175.20, whether there are orders at 3 a.m. or not. Serverless charges per request: 3,000,000 × $0.00002 = $60. The nightly batch job runs 15 minutes a day: 30 × 0.25 h × $0.12 = $0.90. And one GPU endpoint someone forgot after a test: 730 × $0.98 = $715.40, four times the real service. Cost is a design decision: batch when possible, real-time only where needed, and nothing left running by accident.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cloud computing</strong>: renting compute, storage and services on demand, billed by usage. <strong>Managed ML platform</strong>: a cloud service that runs ML training, pipelines, registries and inference endpoints on infrastructure the provider operates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing only the hourly price. An always-on endpoint bills 730 hours a month; the same model as a batch job bills 7.5. Choose the serving mode first, the instance second.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: AWS SageMaker.</b> Renting VMs still means we run training scripts, schedule pipelines and operate servers ourselves. What does a managed platform take off our hands?</div>

  <h2 id="cl-sm"><span class="num">02</span>AWS SageMaker: Training Jobs, Pipelines, Endpoints</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The weekly retrain needs a GPU for an hour, then nothing for a week. The ETA API needs machines all day. Can a platform start machines only for the training, run our CT pipeline, and host the endpoint?</p>
  </div>
  <p><strong>SageMaker</strong> is AWS's ML platform. Its parts map onto the track's stages:</p>
  <div class="cards">
    <div><b>Training job</b><p>Give it a training image or script, data in S3, an instance type. It starts machines, trains, writes <code>model.tar.gz</code> to S3, and shuts down. Billed only while running; can use spot.</p><small>The "train" step</small></div>
    <div><b>SageMaker Pipelines</b><p>A DAG of steps: processing → training → evaluation → condition (gate) → register model. Our CT loop as a managed service.</p><small>CI/CD note, section 08</small></div>
    <div><b>Model Registry</b><p>Model groups, versions, approval status (and managed MLflow).</p><small>MLflow note</small></div>
    <div><b>Endpoints</b><p>Real-time (always-on, autoscaling), serverless (scale to zero, cold starts), async (queued, large payloads).</p><small>Serving note</small></div>
    <div><b>Batch Transform</b><p>Starts instances, scores a whole S3 prefix, writes results, stops.</p><small>Batch mode</small></div>
  </div>
  <p><strong>S3</strong> is AWS's object storage. A <strong>cold start</strong> is the slow first request after idle time while a machine wakes up. The steps to an endpoint:</p>
  <div class="flow"><span>model.tar.gz on S3</span><span>Model (image + artifact)</span><span>Endpoint config (instance type, count)</span><span>Endpoint</span></div>
  <div class="fx" data-lang="py"># SageMaker Python SDK (v2-style API) — NOT RUN: needs an AWS account and an IAM role
from sagemaker.sklearn.estimator import SKLearn

est = SKLearn(entry_point="train.py", source_dir=".", framework_version="1.2-1",
              role="arn:aws:iam::123456789012:role/BitefulSageMaker",
              instance_type="ml.m5.xlarge", instance_count=1,
              use_spot_instances=True, max_run=3600, max_wait=7200,      # spot training (section 04)
              checkpoint_s3_uri="s3://biteful-ml-artifacts-staging/checkpoints/eta/",
              hyperparameters={"max_depth": 2, "learning_rate": 0.088})
est.fit({"train": "s3://biteful-ml-artifacts-staging/data/clean/"})      # training job: start, train, stop

predictor = est.deploy(initial_instance_count=2, instance_type="ml.m5.large",
                       endpoint_name="biteful-eta-staging")              # real-time endpoint
transformer = est.transformer(instance_count=4, instance_type="ml.m5.xlarge",
                              output_path="s3://biteful-ml-artifacts-staging/eta-tomorrow/")
transformer.transform("s3://biteful-data/preorders/tomorrow/", content_type="text/csv", split_type="Line")</div>
  <p><code>fit</code> runs a training job; <code>use_spot_instances</code> plus <code>checkpoint_s3_uri</code> makes it spot-priced and resumable. <code>deploy</code> creates model, endpoint config and endpoint in one call. <code>transformer.transform</code> is the batch path for pre-booked orders. Any app calls the endpoint with boto3 (not run):</p>
  <div class="fx" data-lang="py"># calling the endpoint from any service — NOT RUN
import boto3, json
rt = boto3.client("sagemaker-runtime", region_name="ap-south-1")
resp = rt.invoke_endpoint(EndpointName="biteful-eta-staging", ContentType="application/json",
                          Body=json.dumps({"distance_km": 5.5, "items": 3, "rain": 1,
                                           "restaurant": "Biryani House"}))
print(resp["Body"].read().decode())</div>
  <p>Newer SDK releases restructure deployment around <code>ModelBuilder</code>; the boto3 call stays the same. Endpoints also support blue/green updates with canary or linear traffic shifting and auto-rollback on CloudWatch alarms, the rollout ideas from the Kubernetes note, managed for you.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SageMaker training job</strong>: a managed, ephemeral run of a training container on chosen instances, reading from and writing to S3. <strong>SageMaker endpoint</strong>: a managed HTTPS inference service backed by an endpoint configuration (model, instance type, count). <strong>Batch Transform</strong>: managed offline scoring of S3 data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A real-time endpoint bills every hour it exists, even with zero traffic, like a hired car waiting outside all night. Delete test endpoints (or create them through Terraform so <code>destroy</code> removes them), and use Batch Transform or serverless where you can.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Vertex AI &amp; Azure ML.</b> Biteful's data team prefers Google Cloud; a bank partner runs on Azure. Are these the same ideas under other names?</div>

  <h2 id="cl-other"><span class="num">03</span>Vertex AI &amp; Azure ML</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If the ETA pipeline had to move to Google Cloud or Azure, what would change: the concepts, or only the names and SDK calls?</p>
  </div>
  <p>Only the names. All three platforms offer the same building blocks, because they all serve the same lifecycle:</p>
  <table class="tbl">
    <tr><th>Building block</th><th>AWS SageMaker</th><th>Google Vertex AI</th><th>Azure Machine Learning</th></tr>
    <tr><td>Managed training</td><td>Training job</td><td>CustomJob / training pipeline</td><td>Command job</td></tr>
    <tr><td>Pipelines (CT)</td><td>SageMaker Pipelines</td><td>Vertex AI Pipelines (Kubeflow Pipelines SDK)</td><td>Azure ML pipelines</td></tr>
    <tr><td>Tracking / registry</td><td>Model Registry, managed MLflow</td><td>Experiments, Model Registry</td><td>MLflow-native tracking, registry</td></tr>
    <tr><td>Tuning</td><td>Automatic Model Tuning</td><td>Vizier / hyperparameter tuning jobs</td><td>Sweep jobs</td></tr>
    <tr><td>Real-time serving</td><td>Endpoints (real-time, serverless, async)</td><td>Endpoints (online prediction)</td><td>Managed online endpoints</td></tr>
    <tr><td>Batch</td><td>Batch Transform</td><td>Batch prediction</td><td>Batch endpoints</td></tr>
    <tr><td>Kubernetes</td><td>EKS</td><td>GKE</td><td>AKS</td></tr>
    <tr><td>Object storage</td><td>S3</td><td>Cloud Storage (GCS)</td><td>Blob Storage</td></tr>
  </table>
  <p>The same "deploy the ETA model" step on Vertex AI (not run):</p>
  <div class="fx" data-lang="py"># google-cloud-aiplatform — NOT RUN: needs a GCP project
from google.cloud import aiplatform
aiplatform.init(project="biteful-ml", location="asia-south1")
model = aiplatform.Model.upload(display_name="biteful-eta",
                                artifact_uri="gs://biteful-ml-artifacts/eta/v2/",
                                serving_container_image_uri="asia-south1-docker.pkg.dev/biteful-ml/eta/eta:a72a702")
endpoint = model.deploy(machine_type="n2-standard-2", min_replica_count=2, max_replica_count=10)</div>
  <p>Because Vertex Pipelines runs the Kubeflow Pipelines SDK, the pipeline sketch from the Kubernetes note would run there almost unchanged; Azure ML tracks with MLflow natively, so the MLflow note's code works with only a new tracking URI.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Vertex AI</strong>: Google Cloud's ML platform (training, pipelines on KFP, registry, endpoints, batch prediction). <strong>Azure Machine Learning</strong>: Microsoft's (jobs, pipelines, MLflow-based tracking, managed online and batch endpoints).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Lock-in through convenience. Platform-specific SDK calls spread through training code make moving expensive. Keep the core portable (a Docker image, MLflow tracking, plain training scripts) and keep the platform glue thin.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Spot Instances.</b> On every platform a GPU hour is expensive, and the weekly retrain (or a future neural model) needs many. Is there cheaper capacity, and what's the catch?</div>

  <h2 id="cl-spot"><span class="num">04</span>Spot Instances: Cheap Compute that Can Vanish</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Clouds sell their unused machines at a large discount, but may take them back with a few minutes' (or seconds') warning. Can a training job use them without losing hours of work each time?</p>
  </div>
  <p><strong>Spot instances</strong> (AWS Spot, GCP Spot VMs, Azure Spot) are spare capacity sold typically 60–90% cheaper than on-demand. The catch: when the provider needs the capacity back, the instance is <strong>reclaimed</strong> (AWS gives a 2-minute notice). A job that can stop and continue loses little; a job that must start over can lose everything.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A standby airline ticket. Much cheaper, but you may be bumped. If you carry your notes with you (a checkpoint), you continue on the next flight; if not, you start your trip again.</p>
  </div>
  <p>By hand first. Six hours of GPU training: on demand 6 × $0.98 = $5.88. On spot at $0.30 with two interruptions, each costing at most 20 minutes of work since the last checkpoint plus 10 minutes to restart: 6 + 2 × 0.5 = 7 hours × $0.30 = $2.10.</p>
  <div class="fx" data-lang="py"># 6 hours of GPU training: on-demand vs spot (EXAMPLE prices), with and without checkpoints
on_demand, spot = 0.98, 0.30                     # $/hour, illustrative (spot ~70% cheaper)
work_h, interruptions = 6.0, 2
lost_with_ckpt = interruptions * (0.33 + 0.17)    # per interruption: &lt;=20 min since checkpoint + 10 min restart
print(f"on-demand            : {work_h:.1f} h  \${work_h * on_demand:.2f}")
print(f"spot + checkpoints   : {work_h + lost_with_ckpt:.1f} h  \${(work_h + lost_with_ckpt) * spot:.2f}")
print(f"spot, no checkpoints : restarts from zero after each interruption; at 2 per 6 h it may never finish")</div>
  <div class="fx" data-lang="text">on-demand            : 6.0 h  $5.88
spot + checkpoints   : 7.0 h  $2.10
spot, no checkpoints : restarts from zero after each interruption; at 2 per 6 h it may never finish</div>
  <p>The savings only exist if the job can resume. The real demo: train Biteful's boosting model 50 trees at a time, save a <strong>checkpoint</strong> (the model so far) after every chunk, simulate the instance being reclaimed at 150 trees, then start a "new instance" that resumes from the checkpoint. A third, uninterrupted run is the reference.</p>
  <div class="fx" data-lang="py"># spot training: save a checkpoint every 50 trees, survive an interruption, resume
import os, joblib, numpy as np, pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from features import build_features

train, test = pd.read_csv("data/train.csv"), pd.read_csv("data/test.csv")
X, y, Xt = build_features(train), train.minutes, build_features(test)
CKPT = "checkpoint.joblib"

class SpotInterruption(Exception):
    pass

def train_job(interrupt_at=None):
    if os.path.exists(CKPT):
        model = joblib.load(CKPT)                     # resume where we stopped
        print(f"  resumed from checkpoint at {model.n_estimators} trees")
    else:
        model = GradientBoostingRegressor(n_estimators=0, learning_rate=0.088, max_depth=2,
                                          warm_start=True, random_state=42)
    while model.n_estimators &lt; 300:
        model.set_params(n_estimators=model.n_estimators + 50).fit(X, y)
        joblib.dump(model, CKPT)                      # checkpoint after every 50 trees
        if model.n_estimators == interrupt_at:
            raise SpotInterruption(f"instance reclaimed at {interrupt_at} trees")
    return model

if os.path.exists(CKPT): os.remove(CKPT)
try:
    train_job(interrupt_at=150)
except SpotInterruption as e:
    print("run 1:", e)
resumed = train_job()                                 # run 2 on a new spot instance
os.remove(CKPT)
straight = train_job()                                # reference: never interrupted
print("resumed MAE", round(mean_absolute_error(test.minutes, resumed.predict(Xt)), 3),
      "| uninterrupted MAE", round(mean_absolute_error(test.minutes, straight.predict(Xt)), 3),
      "| identical predictions:", bool(np.allclose(resumed.predict(Xt), straight.predict(Xt))))
os.remove(CKPT)</div>
  <div class="fx" data-lang="text">run 1: instance reclaimed at 150 trees
  resumed from checkpoint at 150 trees
resumed MAE 2.348 | uninterrupted MAE 2.348 | identical predictions: True</div>
  <p>Run 1 died at 150 trees. Run 2 found the checkpoint, continued from tree 151, and finished with test MAE 2.348, exactly the same model as the uninterrupted run (identical predictions on all 550 test orders). Only the 50-tree chunk in progress could ever be lost. On SageMaker the same pattern is <code>use_spot_instances=True</code> plus <code>checkpoint_s3_uri</code>: the job writes checkpoints to a local folder that is synced to S3 and restored on restart.</p>
  <table class="tbl">
    <tr><th>Workload</th><th>Spot?</th><th>Why</th></tr>
    <tr><td>Training with checkpoints</td><td>Yes</td><td>Interruptions cost minutes, savings are large</td></tr>
    <tr><td>Hyperparameter search (Optuna trials)</td><td>Yes</td><td>Trials are independent; a lost trial is retried</td></tr>
    <tr><td>Batch scoring</td><td>Yes</td><td>Rerun failed chunks</td></tr>
    <tr><td>The only replicas of a real-time API</td><td>No</td><td>A reclaim drops live traffic; mix spot with on-demand nodes instead</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Spot (preemptible) instance</strong>: discounted spare cloud capacity that the provider can reclaim at short notice. <strong>Checkpointing</strong>: periodically saving training state (model, optimiser, step, data position) to durable storage so a job can resume after interruption.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Checkpointing to the instance's own disk. When the spot instance is reclaimed, its local disk goes with it. Write checkpoints to durable storage (S3/GCS, a persistent volume) and test the resume path, as above, before trusting it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Infrastructure as Code.</b> We now need buckets, an image registry, IAM roles, a SageMaker model, endpoint config and endpoint, in staging and production. Clicking them together in a web console can't be reviewed, repeated or undone. How do we version infrastructure like code?</div>

  <h2 id="cl-iac"><span class="num">05</span>Infrastructure as Code: Terraform (and Pulumi)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Production's endpoint was created by hand last year. Nobody remembers its settings, staging differs in three ways nobody can list, and recreating it after an accident would take a day of guessing. How do we make infrastructure reproducible, reviewable and undoable, like the model itself?</p>
  </div>
  <p><strong>Infrastructure as code (IaC)</strong> describes cloud resources in text files kept in Git. A tool compares that description with what exists and makes the changes. It is the reconcile idea from Kubernetes applied to the cloud account. <strong>Terraform</strong> is the most widely used IaC tool; it works with every major cloud through <strong>providers</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An architect's drawing versus building by memory. With a drawing (code) you can review the plan before building, build the same house twice (staging and production), and see exactly what a change will alter. The "as-built" record (state) tells you what's actually standing.</p>
  </div>
  <p>Biteful's ETA infrastructure on AWS: a bucket for artifacts, an image registry with immutable tags, an IAM role, and the SageMaker model, endpoint configuration and endpoint:</p>
  <div class="fx" data-lang="text">terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~&gt; 5.0" }
  }
  backend "s3" {                                  # shared, locked state for the whole team
    bucket = "biteful-terraform-state"
    key    = "ml/eta/terraform.tfstate"
    region = "ap-south-1"
  }
}

provider "aws" {
  region = var.region
}

variable "region"         { default = "ap-south-1" }
variable "env"            { default = "staging" }
variable "instance_type"  { default = "ml.m5.large" }
variable "instance_count" { default = 2 }
variable "image_uri"      { type = string }       # from CI: .../eta:&lt;git sha&gt;
variable "model_data_url" { type = string }       # s3://.../model.tar.gz

resource "aws_s3_bucket" "artifacts" {
  bucket = "biteful-ml-artifacts-\${var.env}"
  tags   = { team = "ml", env = var.env }
}

resource "aws_ecr_repository" "eta" {
  name                 = "biteful/eta"
  image_tag_mutability = "IMMUTABLE"              # a tag can never be overwritten
}

resource "aws_sagemaker_model" "eta" {
  name               = "biteful-eta-\${var.env}"
  execution_role_arn = aws_iam_role.sagemaker.arn
  primary_container {
    image          = var.image_uri
    model_data_url = var.model_data_url
  }
}

resource "aws_sagemaker_endpoint_configuration" "eta" {
  name = "biteful-eta-\${var.env}"
  production_variants {
    variant_name           = "v2"
    model_name             = aws_sagemaker_model.eta.name
    instance_type          = var.instance_type
    initial_instance_count = var.instance_count
  }
}

resource "aws_sagemaker_endpoint" "eta" {
  name                 = "biteful-eta-\${var.env}"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.eta.name
}

resource "aws_iam_role" "sagemaker" {
  name = "biteful-sagemaker-\${var.env}"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "sts:AssumeRole",
                   Principal = { Service = "sagemaker.amazonaws.com" } }]
  })
}

output "endpoint_name" {
  value = aws_sagemaker_endpoint.eta.name
}</div>
  <ul>
    <li><strong>provider</strong>: which cloud and region; <strong>backend "s3"</strong>: where Terraform keeps its <strong>state</strong>, the record of what it created, shared by the team and locked so two people can't apply at once.</li>
    <li><strong>variable</strong>: inputs (the environment, instance type and count, and the image URI from CI); staging and production differ only in variable files.</li>
    <li><strong>resource</strong>: one thing to create. References like <code>aws_sagemaker_model.eta.name</code> make dependencies explicit, so Terraform creates the model before the endpoint config, and the config before the endpoint.</li>
    <li><strong>output</strong>: values printed after apply (the endpoint name, for the app's config).</li>
  </ul>
  <p>The workflow is <code>terraform init</code> (download providers, connect the state), <code>terraform validate</code> (check syntax and references), <code>terraform plan</code> (show what would be created, changed or destroyed), <code>terraform apply</code> (do it), <code>terraform destroy</code> (remove it all). <strong>Not run here</strong>: Terraform is not installed in this sandbox and there is no AWS account to plan against. What could run is a syntax check: parsing the file with <code>python-hcl2</code>, a parser for Terraform's language (HCL), and listing what it declares, plus a copy with one missing <code>{</code>:</p>
  <div class="fx" data-lang="py"># terraform is not installed here: parse the HCL with python-hcl2 to check syntax and list what it would create
import hcl2
cfg = hcl2.load(open("main.tf"))
print("variables:", [list(v)[0].strip('"') for v in cfg["variable"]])
for block in cfg["resource"]:
    for rtype, body in block.items():
        print("resource:", rtype.strip('"'), "-&gt;", list(body)[0].strip('"'))
print("outputs:", [list(o)[0].strip('"') for o in cfg["output"]])
try:
    hcl2.load(open("broken.tf"))
except Exception as e:
    print("broken.tf:", type(e).__name__, str(e).splitlines()[0][:110])</div>
  <div class="fx" data-lang="text">variables: ['region', 'env', 'instance_type', 'instance_count', 'image_uri', 'model_data_url']
resource: aws_s3_bucket -&gt; artifacts
resource: aws_ecr_repository -&gt; eta
resource: aws_sagemaker_model -&gt; eta
resource: aws_sagemaker_endpoint_configuration -&gt; eta
resource: aws_sagemaker_endpoint -&gt; eta
resource: aws_iam_role -&gt; sagemaker
outputs: ['endpoint_name']
broken.tf: UnexpectedToken Unexpected token Token('NAME', 'name') at line 29, column 3.</div>
  <p>The file parses: six variables, six resources, one output. The broken copy fails at line 29, right after the resource header that lost its brace. This catches typos only; <code>terraform validate</code> would also check references and argument names against the AWS provider's schema, and <code>plan</code> against the real account.</p>
  <div class="fx" data-lang="text"># the normal workflow — NOT RUN (no terraform binary, no AWS account)
terraform init
terraform validate
terraform plan -var-file=staging.tfvars -var image_uri=...eta:a72a702 -out plan.bin
terraform apply plan.bin            # in CI, after a human approves the plan
terraform destroy -var-file=staging.tfvars</div>
  <h3>Drift, and Pulumi</h3>
  <p><strong>Drift</strong> is when the real infrastructure no longer matches the code, usually because someone changed it in the console. The next <code>plan</code> shows the difference and <code>apply</code> would undo the manual change, which is why every change must go through code. <strong>Pulumi</strong> does the same job with real programming languages (here Python) instead of HCL (not run):</p>
  <div class="fx" data-lang="py"># __main__.py — Pulumi (NOT RUN)
import pulumi, pulumi_aws as aws
env = pulumi.get_stack()                                   # "staging" or "prod"
bucket = aws.s3.BucketV2("artifacts", bucket=f"biteful-ml-artifacts-{env}")
repo = aws.ecr.Repository("eta", name="biteful/eta", image_tag_mutability="IMMUTABLE")
pulumi.export("bucket", bucket.bucket)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Infrastructure as code</strong>: defining infrastructure in version-controlled files that a tool applies. <strong>Terraform</strong>: a declarative IaC tool using HCL with providers, resources, variables, outputs and a <strong>state</strong> file; <code>plan</code> previews the difference between code and reality, <code>apply</code> makes it. <strong>Drift</strong>: differences between declared and actual infrastructure.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Keeping Terraform state on a laptop or committing it to Git. State contains resource IDs and often secrets; two copies diverge and the next apply may destroy or duplicate resources. Use a remote backend with locking and restricted access, as in the file above.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Cost Traps.</b> The infrastructure is now correct and reproducible. Correct infrastructure can still cost far more than it should. Where does the money actually go?</div>

  <h2 id="cl-cost"><span class="num">06</span>Cost Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's first cloud bill is three times the estimate, yet the ETA API costs only $175 a month. What else is billing?</p>
  </div>
  <table class="tbl">
    <tr><th>Trap</th><th>How it bills</th><th>Biteful-sized example (illustrative)</th><th>Fix</th></tr>
    <tr><td>Idle endpoints</td><td>per instance-hour, traffic or not</td><td>forgotten GPU test endpoint: $715/month</td><td>Terraform-managed, TTL tags, serverless or batch</td></tr>
    <tr><td>Idle notebooks and GPU dev boxes</td><td>per hour while running</td><td>a GPU notebook left on over a weekend: 64 h × $0.98 ≈ $63</td><td>auto-stop after idle time</td></tr>
    <tr><td>Oversized instances</td><td>paying for unused CPU/GPU</td><td>a GPU for a tree model that runs in 0.008 ms per order on CPU (ONNX)</td><td>measure, right-size, CPU for trees</td></tr>
    <tr><td>Data egress</td><td>per GB leaving the cloud or region</td><td>copying the training data out to laptops every week</td><td>compute next to the data, same region</td></tr>
    <tr><td>NAT gateways</td><td>per hour plus per GB processed</td><td>private pods pulling large images and datasets through NAT</td><td>VPC endpoints for S3/registries, image caching</td></tr>
    <tr><td>Logs and metrics</td><td>per GB ingested and stored</td><td>logging every request body at DEBUG</td><td>sample, set retention, log IDs not payloads</td></tr>
    <tr><td>Storage leftovers</td><td>per GB-month</td><td>every checkpoint of every Optuna trial kept forever</td><td>lifecycle rules: delete or archive after N days</td></tr>
    <tr><td>No spot / no scale-down</td><td>on-demand for interruptible work; HPA min too high</td><td>$5.88 instead of ~$2.10 per training run</td><td>spot + checkpoints; sensible HPA minimums</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A phone bill. The plan price is small; the shock comes from roaming (egress), the hotspot left on (idle instances) and paid apps nobody remembers (leftover storage).</p>
  </div>
  <p>Habits that keep the bill honest: <strong>tag</strong> every resource with team, environment and model (the <code>tags</code> block in <code>main.tf</code>) so the bill can be split; set <strong>budgets and alerts</strong>; create everything through IaC so <code>destroy</code> really removes it; prefer batch and scale-to-zero; and review cost per prediction alongside MAE when choosing models.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Egress</strong>: data transferred out of a cloud region or provider, usually billed per GB. <strong>Cost allocation tags</strong>: labels on resources used to break the bill down by team, project or environment. <strong>FinOps</strong>: the practice of managing cloud cost as an engineering metric.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Estimating cost from compute alone. Network, storage, logs and managed-service fees are often half the bill. Look at the provider's cost explorer by service after the first week, not after the first quarter.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Six ideas. How do they fit into one picture of Biteful's cloud setup?</div>

  <h2 id="cl-connect"><span class="num">07</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>From <code>terraform apply</code> to a weekly retrain and a served ETA: which piece does what, and where does money go?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<defs><marker id="cl-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="180" y="10" width="300" height="44" rx="7" class="fv" stroke="currentColor"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">main.tf → plan → apply (05)</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">bucket · registry · role · model · endpoint config · endpoint</text>
<line x1="250" y1="54" x2="130" y2="86" stroke="currentColor" marker-end="url(#cl-a9)"/><line x1="330" y1="54" x2="330" y2="86" stroke="currentColor" marker-end="url(#cl-a9)"/><line x1="410" y1="54" x2="530" y2="86" stroke="currentColor" marker-end="url(#cl-a9)"/>
<rect x="10" y="88" width="230" height="56" rx="7" class="fb sb"/><text x="125" y="107" text-anchor="middle" font-size="11.5" font-weight="700">training job on spot (02, 04)</text><text x="125" y="123" text-anchor="middle" class="tm" font-size="10">checkpoint every 50 trees → S3</text><text x="125" y="137" text-anchor="middle" class="tm" font-size="10">$5.88 → ~$2.10</text>
<rect x="255" y="88" width="150" height="56" rx="7" class="fs" stroke="currentColor"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">pipeline + registry</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">gate, approve</text><text x="330" y="137" text-anchor="middle" class="tm" font-size="10">(02, 03)</text>
<rect x="420" y="88" width="230" height="56" rx="7" class="fg sg"/><text x="535" y="107" text-anchor="middle" font-size="11.5" font-weight="700">serving (01, 02)</text><text x="535" y="123" text-anchor="middle" class="tm" font-size="10">real-time $175 · batch $0.90</text><text x="535" y="137" text-anchor="middle" class="tm" font-size="10">or EKS/GKE/AKS (K8s note)</text>
<g stroke="currentColor" fill="none" marker-end="url(#cl-a9)"><line x1="240" y1="116" x2="253" y2="116"/><line x1="405" y1="116" x2="418" y2="116"/></g>
<rect x="130" y="180" width="400" height="56" rx="7" class="fr sr"/><text x="330" y="199" text-anchor="middle" font-size="11.5" font-weight="700">cost traps (06)</text><text x="330" y="215" text-anchor="middle" class="tm" font-size="10">idle GPU endpoint $715 · egress · NAT · logs · leftovers</text><text x="330" y="229" text-anchor="middle" class="tm" font-size="10">tags + budgets + destroy via IaC</text>
<line x1="330" y1="144" x2="330" y2="178" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#cl-a9)"/>
</svg><figcaption>Code creates the infrastructure; spot training feeds a gated registry; serving mode drives the bill; cost hygiene watches all of it.</figcaption></figure>
  <table class="tbl"><caption>Every idea on Biteful's cloud setup</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Cloud layers</td><td>IaaS → managed → serverless</td><td>where do machines come from?</td><td>VMs, EKS, SageMaker, serverless</td><td>always: pick the layer</td></tr>
    <tr><td>Serving cost by mode</td><td>hours × price, requests × price</td><td>what will serving cost?</td><td>$175.20 / $60 / $0.90 per month</td><td>before building</td></tr>
    <tr><td>SageMaker</td><td>jobs, pipelines, registry, endpoints</td><td>can someone else run it?</td><td>spot training job + 2-instance endpoint</td><td>AWS teams without a platform team</td></tr>
    <tr><td>Vertex / Azure ML</td><td>same blocks, other names</td><td>same on GCP/Azure?</td><td>Model.upload + deploy</td><td>those clouds</td></tr>
    <tr><td>Spot + checkpoints</td><td>discount + resumable state</td><td>train cheaply?</td><td>interrupted at 150, same MAE 2.348; ~$2.10 vs $5.88</td><td>training, tuning, batch</td></tr>
    <tr><td>Terraform</td><td>providers, resources, state, plan/apply</td><td>reproducible infrastructure?</td><td>6 resources, 6 variables; broken brace caught</td><td>anything beyond a toy</td></tr>
    <tr><td>Pulumi</td><td>IaC in Python</td><td>IaC with a real language?</td><td>bucket + registry stack</td><td>teams preferring code over HCL</td></tr>
    <tr><td>Cost traps</td><td>idle, egress, NAT, logs, storage</td><td>why is the bill high?</td><td>forgotten GPU endpoint = 4× the API</td><td>monthly review</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>the cloud rents every machine the ML lifecycle needs; managed platforms (SageMaker, Vertex, Azure ML) run its stages for you, spot capacity with checkpoints makes training cheap, Terraform makes all of it reproducible and reviewable, and the serving mode plus idle resources decide most of the bill.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The habits that make cloud ML slow, fragile or expensive.</div>

  <h2 id="cl-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which cloud habits cause surprise bills, unrebuildable environments and lost training runs?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: click-ops</span><p>Resources created by hand can't be reviewed, repeated or cleanly removed. Everything through Terraform/Pulumi.</p></div>
  <div class="callout trap"><span class="label">Trap: local Terraform state</span><p>Diverging copies, leaked secrets. Remote, locked backend.</p></div>
  <div class="callout trap"><span class="label">Trap: spot without checkpoints (or checkpoints on local disk)</span><p>Every reclaim restarts from zero. Checkpoint to S3/GCS and test resume.</p></div>
  <div class="callout trap"><span class="label">Trap: spot-only serving</span><p>A reclaim drops live traffic. Keep on-demand capacity for real-time replicas.</p></div>
  <div class="callout trap"><span class="label">Trap: always-on endpoints for occasional work</span><p>Batch Transform or serverless; delete test endpoints.</p></div>
  <div class="callout trap"><span class="label">Trap: GPUs for tree models</span><p>Our boosting model needs no GPU; right-size from measurements.</p></div>
  <div class="callout trap"><span class="label">Trap: untagged resources, no budget alerts</span><p>Nobody knows who owns the $715 endpoint. Tag everything; alert on budgets.</p></div>
  <div class="callout trap"><span class="label">Trap: SDK calls everywhere</span><p>Platform lock-in. Keep images, MLflow and scripts portable; thin platform glue.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="cl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example (illustrative prices): CPU $0.12/h, GPU $0.98/h on demand, $0.30/h spot. Serving per month: 2 always-on CPU instances $175.20, serverless 3M requests $60, nightly 15-minute batch $0.90, forgotten GPU endpoint $715.40. Spot training: 6 h on demand $5.88 vs 7 h spot with checkpoints $2.10. Checkpoint demo: interrupted at 150 trees, resumed, MAE 2.348 = uninterrupted, identical predictions. <code>main.tf</code>: 6 variables, 6 resources (bucket, ECR repo, SageMaker model, endpoint config, endpoint, IAM role), 1 output; parsed with python-hcl2 (Terraform itself not run).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Why cloud</td><td>where do machines come from, what does serving cost?</td><td>$175 / $60 / $0.90 / $715</td><td>we still run everything</td></tr>
    <tr><td>SageMaker</td><td>managed jobs, pipelines, endpoints?</td><td>spot training job, endpoint, batch</td><td>AWS only?</td></tr>
    <tr><td>Vertex / Azure ML</td><td>same elsewhere?</td><td>same blocks, other names</td><td>GPUs are expensive</td></tr>
    <tr><td>Spot</td><td>cheaper training?</td><td>resume at 150; ~$2.10</td><td>who creates resources?</td></tr>
    <tr><td>Terraform</td><td>reproducible infrastructure?</td><td>main.tf, plan/apply, state</td><td>correct ≠ cheap</td></tr>
    <tr><td>Cost traps</td><td>why the bill explodes?</td><td>idle GPU, egress, NAT, logs</td><td>→ monitor and retrain (System Design)</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <ul>
    <li><strong>Always-on cost</strong> = instances × $/hour × 730 h/month. <strong>Per-request cost</strong> = requests × $/request. <strong>Batch cost</strong> = runs × hours per run × $/hour.</li>
    <li><strong>Spot cost</strong> ≈ (work hours + interruptions × (lost work + restart)) × spot price; lost work ≤ checkpoint interval.</li>
    <li><strong>SageMaker</strong>: training job (ephemeral, S3 in/out, spot + <code>checkpoint_s3_uri</code>), Pipelines (process → train → evaluate → condition → register), Model Registry, endpoints (real-time, serverless, async), Batch Transform; boto3 <code>invoke_endpoint</code>.</li>
    <li><strong>Vertex AI</strong>: CustomJob, Vertex Pipelines (KFP), Model Registry, <code>Model.upload</code> → <code>deploy</code> to an Endpoint, batch prediction. <strong>Azure ML</strong>: command jobs, pipelines, MLflow tracking, managed online/batch endpoints.</li>
    <li><strong>Terraform</strong>: <code>terraform { required_providers; backend }</code>, <code>provider</code>, <code>variable</code>, <code>resource "type" "name" { }</code>, references <code>type.name.attr</code>, <code>output</code>; <code>init → validate → plan → apply → destroy</code>; state + locking; drift.</li>
    <li><strong>Pulumi</strong>: IaC in Python/TypeScript/Go; stacks per environment.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Managed ML platform</b><p>Small teams, standard workflows, no platform engineers.</p><small>Watch lock-in and per-hour endpoint costs</small></div>
    <div><b>Managed Kubernetes</b><p>Many services, existing K8s skills, custom serving.</p><small>You still operate workloads and upgrades</small></div>
    <div><b>Serverless inference</b><p>Spiky or low traffic.</p><small>Cold starts; not for strict latency</small></div>
    <div><b>Spot</b><p>Checkpointed training, tuning, batch.</p><small>Not the only replicas of a live API</small></div>
    <div><b>Terraform</b><p>Every real environment.</p><small>Not for per-request runtime changes</small></div>
    <div><b>Batch</b><p>Pre-booked orders, reports.</p><small>Not when inputs exist only at request time</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Click-ops; local Terraform state; spot without durable checkpoints; spot-only serving; idle endpoints, notebooks and GPUs; GPUs for tree models; egress, NAT and log costs ignored; untagged resources; platform SDK calls spread through training code.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Monthly cost of 2 instances at $0.12/h, always on?</td><td>2 × 0.12 × 730 = $175.20</td></tr>
    <tr><td>Why did the resumed training match the uninterrupted one exactly?</td><td>It continued from the saved 150-tree model with the same settings and data; no work was redone differently</td></tr>
    <tr><td>What does <code>terraform plan</code> do that <code>apply</code> doesn't?</td><td>Shows the create/change/destroy diff between code, state and reality without changing anything</td></tr>
    <tr><td>Name the SageMaker option for scoring tomorrow's pre-booked orders.</td><td>Batch Transform (no always-on endpoint)</td></tr>
    <tr><td>Two cost traps that aren't compute?</td><td>Data egress and NAT gateway processing (also logs and leftover storage)</td></tr>
  </table>

  <h2 id="cl-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>SageMaker real-time endpoint vs serverless vs Batch Transform?</summary><div class="qa-body">Real-time: always-on HTTPS endpoint, ms latency, billed per instance-hour. Serverless: scales to zero, billed per request, cold starts. Batch Transform: a job that scores S3 data and stops, no endpoint. Choose by when predictions are needed and traffic shape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a SageMaker training job do with machines?</summary><div class="qa-body">Starts the chosen instances with your training image or script, mounts data from S3, trains, uploads the model artifact to S3 and shuts the instances down, billing only for the run. With spot enabled and a checkpoint URI, it resumes after interruptions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make spot training safe?</summary><div class="qa-body">Checkpoint regularly to durable storage (S3/GCS), make the job resume from the latest checkpoint on start, keep the checkpoint interval short relative to expected interruptions, and test the resume path (we interrupted at 150 trees and got identical predictions).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Terraform state and why keep it remote?</summary><div class="qa-body">State records which real resources correspond to which code blocks (IDs, attributes). It must be shared and locked so the team and CI see one truth and can't apply concurrently; local copies diverge and may contain secrets. Use a remote backend (S3 + locking, Terraform Cloud, GCS).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is infrastructure drift, and how does IaC handle it?</summary><div class="qa-body">Drift is when real infrastructure differs from the code (manual console changes). <code>terraform plan</code> reveals it; <code>apply</code> brings reality back to the code. Prevent it by allowing changes only through reviewed IaC.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Managed ML platform or Kubernetes for Biteful?</summary><div class="qa-body">With a small team and one or two models, a managed platform (training jobs, endpoints, batch) avoids running a cluster. With many services, existing Kubernetes skills and custom serving needs, managed Kubernetes (EKS/GKE/AKS) gives more control and often lower cost at scale. Many teams mix: managed training, Kubernetes serving.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your cloud bill tripled. Where do you look first?</summary><div class="qa-body">Cost explorer by service and tag: idle endpoints and notebooks, GPU instances, NAT gateway and egress charges, log ingestion, storage growth (checkpoints, snapshots). Then fix ownership with tags and budgets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why should the endpoint be created by Terraform rather than the SDK's <code>deploy()</code> in a notebook?</summary><div class="qa-body">Terraform puts the endpoint, its instance type and count, IAM role and image in reviewed code with state, so staging and production match, changes are previewed, and <code>destroy</code> removes it (no forgotten $715 endpoints). <code>deploy()</code> in a notebook is click-ops in Python.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does spot checkpointing relate to Optuna and the CI/CD note?</summary><div class="qa-body">Optuna trials and the CT pipeline's training are interruptible work: trials are independent (lost ones are retried) and training resumes from checkpoints, so both fit spot capacity. The gate and registry steps after them don't care where training ran.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does serving mode (serving note) matter more than instance price?</summary><div class="qa-body">Real-time bills 730 hours a month regardless of traffic; batch bills minutes. In our example, the same ETAs cost $175.20 always-on vs $0.90 as a nightly batch: a 190× difference that no instance discount can match.</div></details>
</main>
`
});
