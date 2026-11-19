// notes/mlops/mlops_cloud.js — Cloud ML Platforms & IaC
Object.assign(TOPIC_CONTENT, {
  "mlops_cloud": `<main>
  <h1>Cloud ML Platforms &amp; IaC</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span><span>Cloud ML Platforms &amp; IaC</span></div>
  <p class="lead">Every earlier note in this track quietly assumed that machines exist: a GPU to train on, servers to run the ETA API, storage for data and models, a cluster for Kubernetes. Almost no ML team buys those machines any more. They rent them from a cloud provider by the hour, and many also use the provider's <strong>managed ML platform</strong> (AWS SageMaker, Google Vertex AI or Azure Machine Learning), which starts training jobs, hosts models and runs pipelines on their behalf. This note explains how that renting works and what it costs, how to cut training cost with spot instances, how to describe all the infrastructure as code with Terraform so it can be reviewed and rebuilt, and which mistakes make cloud bills explode. The running example is the same as in the rest of the track: Biteful's delivery-time (ETA) model, champion v2 packaged as the image <code>eta:a72a702</code>, retrained every week. There is no cloud account in this sandbox, so SDK and Terraform code is shown without output; every cost figure was computed for real in Python, using illustrative prices that are labelled as such.</p>

  <h2 id="cl-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Cloud ML &amp; IaC</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Renting and pricing</div>
        <ul>
          <li>Rent by the hour instead of owning for the peak</li>
          <li>Layers: VMs → managed Kubernetes → ML platform → serverless</li>
          <li>Per hour (always-on), per request (serverless), per run (batch)</li>
          <li>Serving mode matters more than instance price</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Managed ML platforms</div>
        <ul>
          <li><b>Training job</b>: start machines, train, save to S3, stop</li>
          <li><b>Endpoints</b>: real-time, serverless, async; <b>Batch Transform</b></li>
          <li><b>Pipelines</b> + <b>Model Registry</b> for the retraining loop</li>
          <li>SageMaker, Vertex AI, Azure ML: same blocks, other names</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Spot instances</div>
        <ul>
          <li>Spare capacity, often 60–90% cheaper, can be reclaimed</li>
          <li>Checkpoint to durable storage, resume on a new instance</li>
          <li>Good for training, tuning, batch; not for the only API replicas</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Infrastructure as code</div>
        <ul>
          <li>Terraform: provider, resource, variable, output</li>
          <li><code>init → plan → apply → destroy</code></li>
          <li><b>State</b>: remote and locked; <b>drift</b>: console changes</li>
          <li>Pulumi: the same idea in Python</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cost traps</div>
        <ul>
          <li>Idle endpoints, notebooks and GPUs</li>
          <li>Egress, NAT gateways, logs, old checkpoints</li>
          <li>Fix: tags, budgets, auto-stop, batch, everything in IaC</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Rent Machines</span><span class="rm-sub">owning for the peak vs renting by the hour</span></div></div>
      <div class="rm-item rm-done" data-target="cl-price"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How Cloud Pricing Works</span><span class="rm-sub">per hour, per request, per run</span></div></div>
      <div class="rm-item rm-done" data-target="cl-platform"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Managed Platforms and Training Jobs</span><span class="rm-sub">what SageMaker does with your script</span></div></div>
      <div class="rm-item rm-done" data-target="cl-serve"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Endpoints, Batch and Pipelines</span><span class="rm-sub">serving and retraining on a platform</span></div></div>
      <div class="rm-item rm-done" data-target="cl-other"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Vertex AI and Azure ML</span><span class="rm-sub">the same ideas on other clouds</span></div></div>
      <div class="rm-item rm-done" data-target="cl-spot"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Spot Instances and Checkpointing</span><span class="rm-sub">cheap machines that can vanish</span></div></div>
      <div class="rm-item rm-done" data-target="cl-iac"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Infrastructure as Code with Terraform</span><span class="rm-sub">describing the cloud in files</span></div></div>
      <div class="rm-item rm-done" data-target="cl-state"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">State, Plan and Drift</span><span class="rm-sub">how Terraform decides what to change</span></div></div>
      <div class="rm-item rm-done" data-target="cl-cost"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Cost Traps</span><span class="rm-sub">where the money really goes</span></div></div>
      <div class="rm-item rm-done" data-target="cl-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">habits that cost money or work</span></div></div>
      <div class="rm-item rm-done" data-target="cl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, platform map, commands</span></div></div>
      <div class="rm-item rm-done" data-target="cl-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">cloud ML and IaC questions</span></div></div>
    </div>
  </div>

  <h2 id="cl-why"><span class="num">01</span>Why Rent Machines</h2>
  <p>Start with a simple question: where should the machines for Biteful's ETA model come from? The obvious answer is to buy some servers and put them in a room. The trouble is that food delivery traffic is extremely uneven. Almost nobody orders at 4 a.m., and everybody orders at lunch and dinner. A server you buy has to be paid for whether it is busy or not, so you must buy enough servers for the busiest hour and then watch most of them sit idle for the rest of the day. Here is one illustrative day of Biteful traffic, measured in "servers needed" for each hour:</p>
  <div class="fx" data-lang="py"># Owning servers vs renting them: Biteful's hourly demand on one day
# (EXAMPLE numbers: servers needed each hour to serve ETA requests)
need = [1,1,1,1,1,1,1,2,3,3,4,6,10,10,6,3,3,4,8,10,10,6,3,2]   # midnight .. 11 pm
owned = max(need) * 24            # buying: you must own enough for the busiest hour, all day
rented = sum(need)                # renting: pay only for the server-hours actually used
print("busiest hour needs", max(need), "servers")
print("server-hours if owned  :", owned)
print("server-hours if rented :", rented)
print(f"owned capacity sitting idle: {1 - rented / owned:.0%}")</div>
  <div class="fx" data-lang="text">busiest hour needs 10 servers
server-hours if owned  : 240
server-hours if rented : 100
owned capacity sitting idle: 58%</div>
  <p>The dinner rush needs 10 servers, so an owned setup must have 10 servers running all 24 hours, which is 240 server-hours. The traffic only actually used 100 server-hours, so 58% of the owned capacity did nothing. Training makes this worse: the weekly retrain wants a GPU for an hour or two and then nothing for six days, yet a purchased GPU costs the same whether it trains once a week or never.</p>
  <p><strong>Cloud computing</strong> fixes this by turning machines into something you rent: a provider such as Amazon Web Services (AWS), Google Cloud (GCP) or Microsoft Azure owns enormous data centres, and you rent compute, storage and services from them on demand, paying only for what you use, often billed by the second. Think of the difference between owning a car and calling a taxi. Owning makes sense if you drive all day; if you mostly need a car for a few busy hours, paying per trip is far cheaper, and you never worry about servicing it. In the cloud you can start ten servers at 7 p.m. and stop them at 10 p.m., and the bill shows exactly three hours of ten servers. (The general ideas of regions, virtual machines and storage are covered in <a class="xref" data-note="cf_cloud">Virtualization, Cloud &amp; Performance</a>; this note focuses on what ML teams do with them.)</p>
  <p>Providers do not only rent bare machines. They sell layers on top, and each layer takes more work off your hands in exchange for less control and a different way of paying:</p>
  <table class="tbl">
    <tr><th>Layer</th><th>What you still manage</th><th>Biteful example</th></tr>
    <tr><td>Virtual machines (IaaS)</td><td>the operating system, Docker, scaling, restarts, everything</td><td>EC2 or Compute Engine VMs running <code>docker run eta:a72a702</code></td></tr>
    <tr><td>Managed Kubernetes</td><td>your manifests; the provider runs the control plane</td><td>EKS, GKE or AKS running the YAML from <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a></td></tr>
    <tr><td>Managed ML platform</td><td>your training script, model and settings</td><td>SageMaker, Vertex AI or Azure ML training jobs and endpoints</td></tr>
    <tr><td>Serverless inference</td><td>only the model; machines appear per request</td><td>a serverless endpoint billed per prediction</td></tr>
  </table>
  <p>IaaS stands for "infrastructure as a service", the bottom layer where you rent a virtual machine and do everything else yourself. Going down the table is like going from renting an empty kitchen and bringing your own cooks, to renting a staffed kitchen and bringing only the recipe, to ordering catering and paying per plate. None of the layers is "best": a team with strong Kubernetes skills and many services may prefer the second row, while a small team with one model often prefers the third. The rest of this note spends most of its time on the managed ML platform layer, because that is where ML-specific cloud services live.</p>

  <h2 id="cl-price"><span class="num">02</span>How Cloud Pricing Works</h2>
  <p>Renting only saves money if you understand what you are billed for. Beginners usually compare the hourly price of instances (an <strong>instance</strong> is one rented virtual machine of a given size) and pick the cheapest. That is the wrong first question, because the biggest factor is not the price per hour but how many hours you are billed for, and that depends on how the model is served.</p>
  <p>Cloud services are billed in three basic ways. An <strong>always-on</strong> resource, such as a real-time endpoint, is billed for every hour it exists, whether it receives one request or a million; a month has about 730 hours. A <strong>serverless</strong> resource is billed per request (plus a little for the compute time each request uses), and costs nothing when idle, at the price of a <strong>cold start</strong>: the first request after a quiet period is slow while a machine wakes up. A <strong>batch job</strong> is billed only while it runs: it starts, scores or trains, and stops. It is like the difference between hiring a car with a driver who waits outside all day, taking taxis, and hiring a van once a night to make deliveries.</p>
  <p>Here are the four ways Biteful could pay to produce ETAs, using example prices. The prices are illustrative only (a small CPU instance at $0.12 an hour, an L4-class GPU at $0.98 an hour, $0.00002 per serverless request); real prices differ by provider and region and change often:</p>
  <div class="fx" data-lang="py"># Monthly cost of four ways to serve Biteful ETAs
# EXAMPLE prices for illustration only, not a quote: real prices vary by region and change often
HOURS = 730                                     # hours in an average month (8,760 / 12)
cpu_small, gpu_l4 = 0.12, 0.98                  # $ per instance-hour (illustrative)
per_request = 0.00002                           # $ per serverless request (illustrative)

options = {
    "real-time, 2 CPU instances": 2 * cpu_small * HOURS,   # billed every hour, traffic or not
    "serverless, 3M requests":    3_000_000 * per_request,  # billed per request
    "nightly batch, 15 min/day":  30 * 0.25 * cpu_small,    # billed only while the job runs
    "forgotten GPU test endpoint": 1 * gpu_l4 * HOURS,      # billed every hour, used by nobody
}
for name, cost in options.items():
    print(f"{name:28s} \${cost:8.2f} / month")</div>
  <div class="fx" data-lang="text">real-time, 2 CPU instances   $  175.20 / month
serverless, 3M requests      $   60.00 / month
nightly batch, 15 min/day    $    0.90 / month
forgotten GPU test endpoint  $  715.40 / month</div>
  <p>Each line is simple multiplication. Two always-on CPU instances cost 2 × $0.12 × 730 = $175.20 a month, including every quiet hour at 3 a.m. Serverless at 3 million requests a month costs 3,000,000 × $0.00002 = $60. A nightly batch job that scores tomorrow's pre-booked orders in 15 minutes costs 30 × 0.25 hours × $0.12 = $0.90, about 190 times less than the real-time endpoint. And a single GPU endpoint that someone created for a test and forgot costs $715.40, four times the real service, while serving nobody. The serving mode changed the bill far more than any choice of instance size could.</p>
  <p>The comparison between always-on and serverless depends on traffic, so it is worth finding the point where they cost the same. Below that traffic serverless is cheaper; above it, the always-on instances win because each extra request costs them nothing:</p>
  <div class="fx" data-lang="py"># When does serverless stop being cheaper than an always-on instance?
HOURS, cpu_small, per_request = 730, 0.12, 0.00002     # EXAMPLE prices
always_on = 2 * cpu_small * HOURS                      # two instances for redundancy
for monthly_requests in [1_000_000, 5_000_000, 8_760_000, 20_000_000, 100_000_000]:
    serverless = monthly_requests * per_request
    if abs(serverless - always_on) &lt; 0.01:
        cheaper = "same cost"
    else:
        cheaper = "serverless" if serverless &lt; always_on else "always-on"
    print(f"{monthly_requests:&gt;12,} req/month  serverless \${serverless:8.2f}  always-on \${always_on:7.2f}  -&gt; {cheaper}")
print(f"break-even at {always_on / per_request:,.0f} requests/month "
      f"(about {always_on / per_request / (HOURS * 3600):.1f} requests per second)")</div>
  <div class="fx" data-lang="text">   1,000,000 req/month  serverless $   20.00  always-on $ 175.20  -&gt; serverless
   5,000,000 req/month  serverless $  100.00  always-on $ 175.20  -&gt; serverless
   8,760,000 req/month  serverless $  175.20  always-on $ 175.20  -&gt; same cost
  20,000,000 req/month  serverless $  400.00  always-on $ 175.20  -&gt; always-on
 100,000,000 req/month  serverless $ 2000.00  always-on $ 175.20  -&gt; always-on
break-even at 8,760,000 requests/month (about 3.3 requests per second)</div>
  <p>With these example prices the break-even is 8.76 million requests a month, which is only about 3.3 requests per second on average. Biteful's home feed produces thousands of ETA requests per second at dinner time, so its real-time path belongs on always-on instances (with autoscaling), while a rarely used internal tool, such as a model that restaurant managers query a few times a day, belongs on serverless. The general rule is to choose the serving mode first (batch whenever the inputs are known in advance, real-time only when the answer depends on the moment of the request, as explained in <a class="xref" data-note="mlops_serving">Model Serving &amp; Inference</a>) and choose the instance type second.</p>

  <h2 id="cl-platform"><span class="num">03</span>Managed Platforms and Training Jobs</h2>
  <p>Renting a virtual machine solves the "buying for the peak" problem, but you still have to do all the work on it: start it, install Python and the libraries, copy the data on, run the training script, copy the model off, and remember to switch it off. People forget the last step all the time, and a GPU left running over a weekend is real money. A <strong>managed ML platform</strong> is a cloud service that does this machinery for you: you hand it your code and say what hardware you want, and it runs training, hosting and pipelines on machines the provider operates. AWS's platform is called <strong>SageMaker</strong>, and we will use it as the worked example; the other two big platforms have the same building blocks under different names (section 05).</p>
  <p>The first building block is the <strong>training job</strong>: a short-lived, managed run of your training code on machines that exist only for that run. It works like a laundrette. You bring your clothes (data) and your detergent (training script), pick a machine size, press start, and collect the clean clothes (the trained model) at the end; the machine is then free for someone else and you pay only for the minutes it ran. Two other AWS pieces appear in every SageMaker example. <strong>S3</strong> (Simple Storage Service) is AWS's object storage: a place to keep files such as datasets and models, addressed by paths like <code>s3://bucket/folder/file</code>. An <strong>IAM role</strong> (Identity and Access Management) is a set of permissions that a service can take on; the training job uses a role that allows it to read the training data and write the model, and nothing else.</p>
  <p>Here is Biteful's weekly retrain as a SageMaker training job, written with the SageMaker Python SDK. It needs an AWS account, so it was not run here:</p>
  <div class="fx" data-lang="py"># SageMaker Python SDK (v2-style API). NOT RUN: needs an AWS account and an IAM role
from sagemaker.sklearn.estimator import SKLearn

est = SKLearn(
    entry_point="train.py", source_dir=".",          # the same training script as on a laptop
    framework_version="1.2-1",                       # which prebuilt scikit-learn image to use
    role="arn:aws:iam::123456789012:role/biteful-sagemaker-staging",
    instance_type="ml.m5.xlarge", instance_count=1,  # what to rent, and how many
    hyperparameters={"max_depth": 3, "learning_rate": 0.08},
)
est.fit({"train": "s3://biteful-ml-artifacts-staging/data/clean/"})
# fit() starts the instance, copies the S3 data to /opt/ml/input/data/train,
# runs train.py, uploads /opt/ml/model as model.tar.gz to S3, and shuts the instance down</div>
  <p>The important thing to see is that <code>train.py</code> is the same script you would run on a laptop. When <code>fit()</code> is called, SageMaker does the following, step by step: it starts an <code>ml.m5.xlarge</code> instance; it pulls a prebuilt container image that already has scikit-learn installed (or your own image, if you pass one); it copies the files under the S3 path into the container at <code>/opt/ml/input/data/train</code>; it runs <code>train.py</code> with the hyperparameters as command-line arguments; when the script finishes, it packs whatever the script saved into <code>/opt/ml/model</code> as <code>model.tar.gz</code> and uploads it to S3; and finally it shuts the instance down. The fixed folder names are the contract between your script and the platform: read data from one folder, write the model to another, and the platform handles everything outside the container.</p>
  <p>Training jobs are where managed platforms pay off most clearly, because the "forgot to switch it off" problem disappears: the machine stops when the script ends. They also record every run's settings, logs and metrics, which overlaps with experiment tracking in <a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a> (SageMaker even offers a managed MLflow server). The cost is some lock-in to the platform's conventions, which we come back to in section 05.</p>

  <h2 id="cl-serve"><span class="num">04</span>Endpoints, Batch and Pipelines</h2>
  <p>A trained model in S3 does nothing until something serves it. SageMaker offers several ways to do that, which map directly onto the serving modes from section 02. A <strong>real-time endpoint</strong> is a managed HTTPS service that keeps one or more instances running with your model loaded and answers each request in milliseconds; it can autoscale, and it bills per instance-hour. A <strong>serverless endpoint</strong> scales to zero when idle and bills per request, with cold starts. An <strong>asynchronous endpoint</strong> puts requests in a queue and writes results to S3, for large inputs or slow models. <strong>Batch Transform</strong> is not an endpoint at all: it is a job that starts instances, scores every file under an S3 folder, writes the predictions back to S3, and stops.</p>
  <p>Creating a real-time endpoint happens in three steps, and it helps to know them because Terraform (section 07) creates the same three objects. A <strong>model</strong> object pairs a container image with a model artifact in S3. An <strong>endpoint configuration</strong> says which model to run, on what instance type, and how many instances. The <strong>endpoint</strong> itself is the running service built from that configuration. The SDK can do all three in one call:</p>
  <div class="fx" data-lang="py"># NOT RUN: needs an AWS account
predictor = est.deploy(initial_instance_count=2, instance_type="ml.m5.large",
                       endpoint_name="biteful-eta-staging")          # real-time endpoint

transformer = est.transformer(instance_count=4, instance_type="ml.m5.xlarge",
                              output_path="s3://biteful-ml-artifacts-staging/eta-tomorrow/")
transformer.transform("s3://biteful-data/preorders/tomorrow/",       # batch: score a whole folder
                      content_type="text/csv", split_type="Line")</div>
  <p><code>deploy()</code> creates the model, the endpoint configuration and the endpoint, giving Biteful a two-instance real-time service for the home feed. <code>transformer.transform()</code> is the batch path: four instances score tomorrow's pre-booked orders, write the ETAs to S3 and disappear. Any Biteful service can then call the endpoint with the general AWS SDK, <code>boto3</code>, without knowing anything about how the model is hosted:</p>
  <div class="fx" data-lang="py"># calling the endpoint from any Biteful service. NOT RUN
import boto3, json
rt = boto3.client("sagemaker-runtime", region_name="ap-south-1")
resp = rt.invoke_endpoint(EndpointName="biteful-eta-staging", ContentType="application/json",
                          Body=json.dumps({"distance_km": 5.5, "items": 3, "rain": 1}))
print(resp["Body"].read().decode())</div>
  <p>Endpoints also handle the rollout ideas from <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> for you. When you update an endpoint to a new configuration, SageMaker can do a <strong>blue/green deployment</strong>: it starts the new version beside the old one, shifts traffic over gradually (all at once, in a canary slice, or in linear steps), watches alarms you define, and rolls back automatically if they fire.</p>
  <p>The last building block automates the whole retraining loop. <strong>SageMaker Pipelines</strong> lets you describe a workflow as a graph of steps: a processing step that cleans the latest orders, a training step, an evaluation step that computes MAE on recent data, a condition step that only continues if the new model beats the champion, and a step that registers the model in the <strong>Model Registry</strong>, where versions wait for approval before being deployed. This is exactly the continuous-training loop from <a class="xref" data-note="mlops_cicd">CI/CD for ML</a>, run as a managed service instead of on your own scheduler. Pipelines are worth it when a team retrains regularly; for a one-off model, a training job and an endpoint are enough.</p>
  <p>One warning belongs here because it causes most surprise bills: a real-time endpoint bills every hour it exists, even with zero traffic. Calling <code>deploy()</code> from a notebook to "try something" and then closing the notebook leaves the endpoint running. That is the $715 line from section 02, and it is one reason the endpoint should be created by code that can also delete it (section 07).</p>

  <h2 id="cl-other"><span class="num">05</span>Vertex AI and Azure ML</h2>
  <p>Suppose Biteful's data team prefers Google Cloud, or a banking partner insists on Azure. Do they need to learn ML deployment all over again? No, because all three platforms were built to serve the same lifecycle: train, track, register, serve online, score in batch, and automate it as a pipeline. <strong>Vertex AI</strong> is Google Cloud's ML platform, and <strong>Azure Machine Learning</strong> is Microsoft's. The concepts carry over directly; mostly the names and SDK calls change, the way "lift" and "elevator" name the same machine:</p>
  <table class="tbl">
    <tr><th>Building block</th><th>AWS SageMaker</th><th>Google Vertex AI</th><th>Azure Machine Learning</th></tr>
    <tr><td>Managed training</td><td>Training job</td><td>CustomJob</td><td>Command job</td></tr>
    <tr><td>Pipelines</td><td>SageMaker Pipelines</td><td>Vertex AI Pipelines (Kubeflow Pipelines SDK)</td><td>Azure ML pipelines</td></tr>
    <tr><td>Tracking and registry</td><td>Model Registry, managed MLflow</td><td>Experiments, Model Registry</td><td>MLflow-based tracking, registry</td></tr>
    <tr><td>Hyperparameter tuning</td><td>Automatic Model Tuning</td><td>Vertex AI hyperparameter tuning (Vizier)</td><td>Sweep jobs</td></tr>
    <tr><td>Real-time serving</td><td>Endpoints (real-time, serverless, async)</td><td>Endpoints (online prediction)</td><td>Managed online endpoints</td></tr>
    <tr><td>Batch scoring</td><td>Batch Transform</td><td>Batch prediction</td><td>Batch endpoints</td></tr>
    <tr><td>Managed Kubernetes</td><td>EKS</td><td>GKE</td><td>AKS</td></tr>
    <tr><td>Object storage</td><td>S3</td><td>Cloud Storage (GCS)</td><td>Blob Storage</td></tr>
  </table>
  <p>Here is the same "register and deploy the ETA model" step on Vertex AI, and a training run on Azure ML. Neither was run, since both need a cloud account:</p>
  <div class="fx" data-lang="py"># google-cloud-aiplatform. NOT RUN: needs a GCP project
from google.cloud import aiplatform
aiplatform.init(project="biteful-ml", location="asia-south1")

model = aiplatform.Model.upload(                     # register the model
    display_name="biteful-eta",
    artifact_uri="gs://biteful-ml-artifacts/eta/v2/",
    serving_container_image_uri="asia-south1-docker.pkg.dev/biteful-ml/eta/eta:a72a702")
endpoint = model.deploy(machine_type="n2-standard-2",  # online prediction endpoint
                        min_replica_count=2, max_replica_count=10)</div>
  <div class="fx" data-lang="py"># azure-ai-ml (SDK v2). NOT RUN: needs an Azure subscription
from azure.ai.ml import MLClient, command
from azure.identity import DefaultAzureCredential

ml = MLClient(DefaultAzureCredential(), subscription_id="&lt;subscription-id&gt;",
              resource_group_name="biteful-ml", workspace_name="biteful")
job = command(code="./src", command="python train.py --max_depth 3",
              environment="azureml:biteful-sklearn:1", compute="cpu-cluster")
ml.jobs.create_or_update(job)                        # a managed training run</div>
  <p>Read the Vertex code next to the SageMaker code from section 04 and the shape is the same: point at a model artifact in object storage and a serving container image, then deploy it onto a machine type with a minimum and maximum number of replicas. The Azure code is a training job: a folder of code, a command to run, an environment (the container) and a compute target. Two connections make moving between them easier than it looks. Vertex AI Pipelines runs pipelines written with the Kubeflow Pipelines SDK, so a pipeline written for Kubeflow on Kubernetes runs there with few changes; and Azure ML uses MLflow natively for tracking, so code that logs to MLflow only needs a new tracking address.</p>
  <p>The real risk is not which platform you pick but how deeply you weave it into your code. If platform-specific SDK calls are scattered through the training code, moving later is expensive; this is called <strong>lock-in</strong>. The usual defence is to keep the core portable (a plain training script that reads files and writes a model, a Docker image, MLflow for tracking) and keep the platform "glue" (the few lines that launch jobs and create endpoints) thin and in one place. Then the platform becomes a place to run your code rather than part of the code.</p>

  <h2 id="cl-spot"><span class="num">06</span>Spot Instances and Checkpointing</h2>
  <p>On every cloud, GPU hours are the most expensive line in an ML budget, and training needs many of them. Providers have a way to make them much cheaper. Their data centres always have some machines nobody has rented at the moment, and they sell that spare capacity at a large discount, often 60–90% below the normal on-demand price. These are called <strong>spot instances</strong> (AWS Spot Instances, Google Spot VMs, Azure Spot VMs). The catch is that the provider can take a spot instance back whenever it needs the capacity for a full-price customer. This is called being <strong>reclaimed</strong> (or preempted), and the warning is short: AWS gives two minutes, Google and Azure about thirty seconds.</p>
  <p>A spot instance is like a standby airline ticket. It is much cheaper, but you can be bumped off the flight. If you carry your notes with you, you simply continue your work on the next flight; if your notes were left on the seat, you start again from nothing. For a training job, the "notes" are a <strong>checkpoint</strong>: a saved copy of the training state (the model so far and, for neural networks, the optimiser state, the step number and the position in the data) written to durable storage at regular intervals, so a new machine can continue where the old one stopped.</p>
  <p>The money only works out if the job can resume. Here is the arithmetic for six hours of GPU training with example prices, assuming two interruptions:</p>
  <div class="fx" data-lang="py"># 6 hours of GPU training: on-demand vs spot (EXAMPLE prices), with and without checkpoints
on_demand, spot = 0.98, 0.30            # $/hour, illustrative (spot about 70% cheaper)
work_h, interruptions = 6.0, 2
ckpt_every_h = 20 / 60                  # a checkpoint every 20 minutes
restart_h = 10 / 60                     # time to get a new instance and reload
lost = interruptions * (ckpt_every_h + restart_h)   # worst case per interruption
print(f"on-demand          : {work_h:.1f} h  \${work_h * on_demand:.2f}")
print(f"spot + checkpoints : {work_h + lost:.1f} h  \${(work_h + lost) * spot:.2f}  (worst case)")
# Without checkpoints, every interruption throws away all work done so far.
# If interruptions come on average every 3 hours, a 6-hour job rarely survives in one piece:
import math
p_survive = math.exp(-work_h / 3.0)     # chance of 6 h with no interruption (Poisson, mean gap 3 h)
print(f"spot, no checkpoints: chance a 6 h run finishes without interruption = {p_survive:.0%}")</div>
  <div class="fx" data-lang="text">on-demand          : 6.0 h  $5.88
spot + checkpoints : 7.0 h  $2.10  (worst case)
spot, no checkpoints: chance a 6 h run finishes without interruption = 14%</div>
  <p>On demand, six hours cost 6 × $0.98 = $5.88. On spot with a checkpoint every 20 minutes, each interruption loses at most 20 minutes of work plus about 10 minutes to start a new instance and reload, so two interruptions add one hour: 7 hours × $0.30 = $2.10, about a third of the price. Without checkpoints the picture is completely different. If interruptions arrive on average every three hours, a six-hour run has only a 14% chance of finishing without one, and every interruption throws away everything done so far. Spot without checkpoints is not cheap; it is a lottery.</p>
  <p>Let us test the resume path for real. The code below trains a gradient-boosted ETA model 50 trees at a time on synthetic Biteful orders, saves a checkpoint after each chunk, and simulates the instance being reclaimed at 150 trees. A second "instance" then starts the same function, finds the checkpoint and continues. Finally, a third run that is never interrupted gives a reference to compare against. The trick that makes boosting resumable is <code>warm_start=True</code>, which tells scikit-learn to keep the trees it already has and only add new ones when <code>n_estimators</code> grows:</p>
  <div class="fx" data-lang="py"># Spot training: save a checkpoint every 50 trees, survive an interruption, resume
import os, joblib, numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

# 3,000 synthetic Biteful orders: distance, items, rain -&gt; delivery minutes
rng = np.random.default_rng(0)
X = np.column_stack([rng.uniform(0.5, 9, 3000), rng.integers(1, 8, 3000), rng.integers(0, 2, 3000)])
y = 12 + 3.2 * X[:, 0] + 1.5 * X[:, 1] + 6 * X[:, 2] * (X[:, 0] &gt; 4) + rng.normal(0, 2.5, 3000)
X_tr, y_tr, X_te, y_te = X[:2500], y[:2500], X[2500:], y[2500:]

CKPT = "checkpoint.joblib"      # on a real job this must be durable storage (S3/GCS)

class SpotInterruption(Exception):
    pass

def train_job(interrupt_at=None, log=print):
    if os.path.exists(CKPT):
        model = joblib.load(CKPT)                         # resume where we stopped
        log(f"  found checkpoint: resuming at {model.n_estimators} trees")
    else:
        model = GradientBoostingRegressor(n_estimators=0, learning_rate=0.08, max_depth=3,
                                          warm_start=True, random_state=42)
    while model.n_estimators &lt; 300:
        model.set_params(n_estimators=model.n_estimators + 50).fit(X_tr, y_tr)  # add 50 trees
        joblib.dump(model, CKPT)                          # checkpoint after every 50 trees
        log(f"  trained to {model.n_estimators} trees, checkpoint saved")
        if model.n_estimators == interrupt_at:
            raise SpotInterruption(f"instance reclaimed at {interrupt_at} trees")
    return model

if os.path.exists(CKPT): os.remove(CKPT)
print("run 1 (spot instance A)")
try:
    train_job(interrupt_at=150)
except SpotInterruption as e:
    print("  !!", e)
print("run 2 (spot instance B)")
resumed = train_job()
os.remove(CKPT)
straight = train_job(log=lambda msg: None)              # reference run, never interrupted
os.remove(CKPT)

mae = lambda m: mean_absolute_error(y_te, m.predict(X_te))
print(f"resumed MAE {mae(resumed):.3f} | uninterrupted MAE {mae(straight):.3f} | "
      f"identical predictions: {np.allclose(resumed.predict(X_te), straight.predict(X_te))}")</div>
  <div class="fx" data-lang="text">run 1 (spot instance A)
  trained to 50 trees, checkpoint saved
  trained to 100 trees, checkpoint saved
  trained to 150 trees, checkpoint saved
  !! instance reclaimed at 150 trees
run 2 (spot instance B)
  found checkpoint: resuming at 150 trees
  trained to 200 trees, checkpoint saved
  trained to 250 trees, checkpoint saved
  trained to 300 trees, checkpoint saved
resumed MAE 2.068 | uninterrupted MAE 2.068 | identical predictions: True</div>
  <p>Run 1 saved checkpoints at 50, 100 and 150 trees and was then reclaimed. Run 2, on a fresh "instance", found the checkpoint, printed "resuming at 150 trees", and trained only trees 151 to 300. The final model has a test MAE of 2.068 minutes, exactly the same as the run that was never interrupted, and its predictions are identical on every test order. Nothing was redone and nothing was lost, because the reclaim happened right after a save; in general, the most you can lose is the work since the last checkpoint. The picture below shows the same run as a timeline:</p>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680" role="img">
    <defs><marker id="cl-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="20" y="18" font-size="11" font-weight="600">spot instance A</text>
    <rect x="20" y="26" width="300" height="30" rx="4" class="fb" stroke="currentColor" stroke-opacity=".5"/>
    <text x="170" y="45" text-anchor="middle" font-size="11">trees 1–150</text>
    <text x="318" y="18" text-anchor="end" font-size="11" font-weight="600">✕ reclaimed at 150</text>
    <text x="360" y="18" font-size="11" font-weight="600">spot instance B (new machine)</text>
    <rect x="360" y="26" width="300" height="30" rx="4" class="fg" stroke="currentColor" stroke-opacity=".5"/>
    <text x="510" y="45" text-anchor="middle" font-size="11">trees 151–300</text>
    <line x1="120" y1="58" x2="120" y2="127" stroke="currentColor" marker-end="url(#cl-ar)"/>
    <line x1="220" y1="58" x2="220" y2="127" stroke="currentColor" marker-end="url(#cl-ar)"/>
    <line x1="314" y1="58" x2="314" y2="127" stroke="currentColor" marker-end="url(#cl-ar)"/>
    <text x="126" y="104" font-size="10" class="tm">save</text>
    <text x="226" y="104" font-size="10" class="tm">save</text>
    <text x="308" y="104" text-anchor="end" font-size="10" class="tm">save</text>
    <path d="M340,128 L370,60" fill="none" class="sb" stroke-dasharray="5 4" marker-end="url(#cl-ar)"/>
    <text x="378" y="100" font-size="10" class="tm">restore the 150-tree checkpoint</text>
    <rect x="20" y="130" width="640" height="32" rx="4" class="ft" stroke="currentColor" stroke-opacity=".5"/>
    <text x="340" y="150" text-anchor="middle" font-size="11">durable storage (S3 / GCS): ckpt@50 · ckpt@100 · ckpt@150</text>
    <text x="340" y="188" text-anchor="middle" font-size="10.5" class="tm">Only work done after the last save is at risk; the local disk of instance A disappears with it.</text>
  </svg><figcaption>Checkpoints flow down to durable storage as instance A trains; when A is reclaimed, a new instance B pulls the latest checkpoint back up and continues.</figcaption></figure>
  <p>Follow the arrows. While instance A trains, each solid arrow is a checkpoint being written down to durable storage. When A is reclaimed, its own disk vanishes with it, which is why the checkpoints must not live there. Instance B is a brand-new machine with an empty disk; the dashed arrow is it copying the newest checkpoint back up before training trees 151 to 300. On SageMaker you get this pattern by adding three settings to the training job from section 03:</p>
  <div class="fx" data-lang="py"># the same training job, spot-priced and resumable. NOT RUN
est = SKLearn(entry_point="train.py", source_dir=".", framework_version="1.2-1",
              role="arn:aws:iam::123456789012:role/biteful-sagemaker-staging",
              instance_type="ml.m5.xlarge", instance_count=1,
              use_spot_instances=True,       # ask for spot capacity
              max_run=3600,                  # at most 1 hour of actual training
              max_wait=7200,                 # at most 2 hours including waiting for capacity
              checkpoint_s3_uri="s3://biteful-ml-artifacts-staging/checkpoints/eta/")
# train.py writes checkpoints to /opt/ml/checkpoints; SageMaker syncs that folder to S3
# and copies it back onto the new instance after an interruption</div>
  <p><code>max_wait</code> must be at least <code>max_run</code>, because it includes the time spent waiting for spot capacity to become available. Your script writes checkpoints into <code>/opt/ml/checkpoints</code>, SageMaker copies that folder to the S3 path while the job runs, and after an interruption it copies it back onto the replacement instance before restarting your script, so the script must look for a checkpoint when it starts, exactly as <code>train_job()</code> did above.</p>
  <p>Spot suits any work that can be interrupted and resumed: checkpointed training, hyperparameter search (each trial is independent, so a lost trial is simply re-run, as in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>), and batch scoring (re-run the failed chunk). It does not suit the only replicas of a real-time API, because a reclaim would drop live traffic. The common compromise for serving is a mix: enough on-demand instances to carry the minimum load, with spot instances added on top for the peaks.</p>

  <h2 id="cl-iac"><span class="num">07</span>Infrastructure as Code with Terraform</h2>
  <p>Biteful now needs a fair amount of infrastructure: an S3 bucket for data and models, a container registry for the <code>eta</code> images, an IAM role for SageMaker, and the SageMaker model, endpoint configuration and endpoint, all of it twice, once for staging and once for production. The quickest way to create these is to click through the cloud provider's web console. That works once, and then the problems start. A year later nobody remembers which settings production's endpoint was created with. Staging differs from production in three ways nobody can list. A change cannot be reviewed before it happens, and if someone deletes the endpoint by accident, rebuilding it takes a day of guessing. Creating infrastructure by hand in the console is nicknamed <strong>click-ops</strong>, and it has the same weakness as a model trained in an unsaved notebook: you cannot reproduce it.</p>
  <p><strong>Infrastructure as code (IaC)</strong> is the fix: you describe the infrastructure you want in text files, keep them in Git, and let a tool create or change the real resources to match. It is the difference between building a house from memory and building it from an architect's drawing. With a drawing, you can review the plan before anyone lays a brick, build the same house twice, and see exactly what a change to the drawing will alter. The most widely used IaC tool is <strong>Terraform</strong>. It is <strong>declarative</strong>: you write what should exist, not the steps to create it, and Terraform works out the steps. It talks to each cloud through a <strong>provider</strong>, a plug-in that knows that cloud's API, so the same tool manages AWS, Google Cloud, Azure and many other services.</p>
  <p>Here is Biteful's ETA infrastructure on AWS, written in Terraform's language, HCL (HashiCorp Configuration Language):</p>
  <div class="fx" data-lang="text">terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~&gt; 5.0" }
  }
  backend "s3" {                                  # shared, locked state for the whole team
    bucket         = "biteful-terraform-state"
    key            = "ml/eta/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "terraform-locks"            # lock table: one apply at a time
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
  tags   = { team = "ml", env = var.env, model = "eta" }
}

resource "aws_ecr_repository" "eta" {
  name                 = "biteful/eta"
  image_tag_mutability = "IMMUTABLE"              # a tag can never be overwritten
}

resource "aws_iam_role" "sagemaker" {
  name = "biteful-sagemaker-\${var.env}"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "sts:AssumeRole",
                   Principal = { Service = "sagemaker.amazonaws.com" } }]
  })
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

output "endpoint_name" {
  value = aws_sagemaker_endpoint.eta.name
}</div>
  <p>Four kinds of block make up almost every Terraform file. The <code>terraform</code> block at the top says which provider is needed (AWS, version 5.x) and where Terraform keeps its records, which section 08 explains. A <strong>variable</strong> is an input: the environment name, the instance type and count, and the image URI that CI passes in after building <code>eta:&lt;git sha&gt;</code>. A <strong>resource</strong> is one thing to create; <code>resource "aws_s3_bucket" "artifacts"</code> means "a resource of type <code>aws_s3_bucket</code>, which this file calls <code>artifacts</code>". An <strong>output</strong> is a value printed after Terraform runs, here the endpoint name that the app's configuration needs.</p>
  <p>Look at how resources refer to each other. The endpoint configuration says <code>model_name = aws_sagemaker_model.eta.name</code>, and the endpoint says <code>endpoint_config_name = aws_sagemaker_endpoint_configuration.eta.name</code>. These references do two jobs. They pass values from one resource to another, and they tell Terraform the order to work in: it must create the IAM role before the model that uses it, the model before the endpoint configuration, and the configuration before the endpoint. These are the same three SageMaker objects that <code>deploy()</code> created in section 04, but now each setting is written down, reviewable and repeatable. The <code>\${var.env}</code> inside names means staging and production get separate resources from the same file; the two environments differ only in a small variables file each:</p>
  <div class="fx" data-lang="text"># staging.tfvars                          # prod.tfvars
env            = "staging"                env            = "prod"
instance_type  = "ml.m5.large"            instance_type  = "ml.c5.xlarge"
instance_count = 1                        instance_count = 4</div>
  <p>Terraform is not installed in this sandbox, and there is no AWS account to run it against, so the file could not be validated with Terraform itself. What could run is a syntax check: the Python library <code>python-hcl2</code> parses HCL, so we can confirm the file is well formed and list what it declares, and also feed it a copy with one <code>{</code> removed to see a typo being caught:</p>
  <div class="fx" data-lang="py"># terraform is not installed here: parse main.tf with python-hcl2 to check its syntax
# and list what it declares (this checks typos only, not AWS argument names or references)
import hcl2
cfg = hcl2.load(open("main.tf"))
print("variables:", [list(v)[0].strip('"') for v in cfg["variable"]])
for block in cfg["resource"]:
    for rtype, body in block.items():
        print("resource :", rtype.strip('"'), "-&gt;", list(body)[0].strip('"'))
print("outputs  :", [list(o)[0].strip('"') for o in cfg["output"]])
try:
    hcl2.load(open("broken.tf"))           # same file with one "{" removed
except Exception as e:
    print("broken.tf:", type(e).__name__, str(e).splitlines()[0][:90])</div>
  <div class="fx" data-lang="text">variables: ['region', 'env', 'instance_type', 'instance_count', 'image_uri', 'model_data_url']
resource : aws_s3_bucket -&gt; artifacts
resource : aws_ecr_repository -&gt; eta
resource : aws_iam_role -&gt; sagemaker
resource : aws_sagemaker_model -&gt; eta
resource : aws_sagemaker_endpoint_configuration -&gt; eta
resource : aws_sagemaker_endpoint -&gt; eta
outputs  : ['endpoint_name']
broken.tf: UnexpectedToken Unexpected token Token('NAME', 'name') at line 44, column 3.</div>
  <p>The real file parses into six variables, six resources and one output. The broken copy fails at line 44, which is the first line inside the block whose opening brace was removed. This only catches syntax errors. <code>terraform validate</code> would also check every reference and every argument name against the AWS provider's schema, and <code>terraform plan</code> would compare the file against the real account, which is the subject of the next section.</p>

  <h2 id="cl-state"><span class="num">08</span>State, Plan and Drift</h2>
  <p>A Terraform file says what should exist. To change anything, Terraform also needs to know what already exists and which real resources belong to which blocks in the file; otherwise, running it twice would create everything twice. It keeps that knowledge in the <strong>state</strong>: a file that records, for every resource Terraform created, its real ID and settings. You can think of state as the builder's "as-built" record that sits beside the architect's drawing. Every Terraform run compares three things: the code (what you want), the state (what Terraform created) and the real cloud (what actually exists now, which it reads fresh at the start of each run).</p>
  <p>The everyday workflow has five commands:</p>
  <div class="fx" data-lang="text"># the everyday workflow. NOT RUN: no terraform binary and no AWS account here
terraform init                                   # download the AWS provider, connect to the state
terraform validate                               # check syntax, references and argument names
terraform plan -var-file=staging.tfvars \\
               -var image_uri=...eta:a72a702 -out plan.bin    # show what WOULD change
terraform apply plan.bin                         # make exactly those changes
terraform destroy -var-file=staging.tfvars       # remove everything this code created</div>
  <p><code>init</code> downloads the provider and connects to the state. <code>validate</code> checks the files. <code>plan</code> is the heart of the workflow: it works out and prints exactly what would be created, changed or destroyed, without touching anything. <code>apply</code> carries out a saved plan. <code>destroy</code> removes everything the code created, which is how a whole staging environment, test endpoint included, can be cleaned up with one command. In a team, <code>plan</code> runs automatically on every pull request so reviewers can read the exact cloud changes next to the code change, and <code>apply</code> runs in CI only after approval.</p>
  <p>To see what <code>plan</code> actually decides, here is a small toy model of it in Python. It is not Terraform, just the same comparison logic: resources in the code but not in the state are created, resources whose real settings differ from the code are updated, and resources in the state but no longer in the code are destroyed:</p>
  <div class="fx" data-lang="py"># A toy version of what "terraform plan" does. Terraform only looks at resources recorded
# in its STATE; it refreshes their real settings and compares them with the code.
def plan(code, state, cloud):
    steps = []
    for name, cfg in code.items():
        if name not in state:
            steps.append(f"  + create  {name} {cfg}")
        elif cloud[name] != cfg:
            diff = {k: f"{cloud[name][k]} -&gt; {v}" for k, v in cfg.items() if cloud[name][k] != v}
            steps.append(f"  ~ update  {name} {diff}")
    for name in state:
        if name not in code:
            steps.append(f"  - destroy {name}")
    return "\\n".join(steps or ["  no changes: infrastructure matches the code"])

code = {   # what main.tf declares for staging
    "s3_bucket.artifacts":    {"name": "biteful-ml-artifacts-staging"},
    "sagemaker_endpoint.eta": {"instance_type": "ml.m5.large", "count": 2},
}
cloud, state = {}, set()                               # an empty AWS account, empty state

print("1) first plan on an empty account:")
print(plan(code, state, cloud))

for name, cfg in code.items():                         # "apply": create, record in state
    cloud[name] = dict(cfg); state.add(name)
print("2) plan right after apply:")
print(plan(code, state, cloud))

cloud["sagemaker_endpoint.eta"]["count"] = 4           # someone sets 4 instances in the console
cloud["notebook.gpu_test"] = {"type": "ml.g5.xlarge"}  # and starts a GPU notebook by hand
print("3) plan after manual console changes:")
print(plan(code, state, cloud))
print("   not in state, invisible to terraform:", [n for n in cloud if n not in state])

del code["s3_bucket.artifacts"]                        # a reviewed PR removes the bucket block
print("4) plan after deleting a block from the code:")
print(plan(code, state, cloud))</div>
  <div class="fx" data-lang="text">1) first plan on an empty account:
  + create  s3_bucket.artifacts {'name': 'biteful-ml-artifacts-staging'}
  + create  sagemaker_endpoint.eta {'instance_type': 'ml.m5.large', 'count': 2}
2) plan right after apply:
  no changes: infrastructure matches the code
3) plan after manual console changes:
  ~ update  sagemaker_endpoint.eta {'count': '4 -&gt; 2'}
   not in state, invisible to terraform: ['notebook.gpu_test']
4) plan after deleting a block from the code:
  ~ update  sagemaker_endpoint.eta {'count': '4 -&gt; 2'}
  - destroy s3_bucket.artifacts</div>
  <p>Step 1 is the first plan on an empty account: everything is a "+ create". After applying, step 2 shows no changes, because code, state and reality agree. In step 3 someone used the console to raise the endpoint to 4 instances and also started a GPU notebook by hand. The plan notices the first change and proposes setting the count back from 4 to 2: when reality no longer matches the code, that is called <strong>drift</strong>, and the next <code>apply</code> undoes the manual change. The notebook is more worrying. It was never created by Terraform, so it is not in the state, and Terraform cannot see it at all; it will run, and bill, until a person notices. Step 4 shows the reviewed way to remove something: delete the block from the code, and the plan proposes "- destroy". Together these show why every change should go through code: manual changes are either silently reverted or completely invisible.</p>
  <p>Because the state is the only link between code and reality, where it lives matters a great deal. If it sits on one engineer's laptop, nobody else can safely run Terraform; if two people keep separate copies, each copy believes different things exist and the next apply may duplicate or delete resources. The state can also contain secrets, so it must never be committed to Git. The standard answer is a <strong>remote backend</strong> with <strong>locking</strong>: the state lives in shared storage (the <code>backend "s3"</code> block in <code>main.tf</code>), and a lock (the DynamoDB table) makes sure only one apply runs at a time, like a single key to the site office.</p>
  <p>Terraform is not the only IaC tool. <strong>Pulumi</strong> does the same job, with the same plan-then-apply idea and the same state, but you write the infrastructure in an ordinary programming language such as Python or TypeScript instead of HCL. That makes loops, functions and tests natural, at the cost of making it easier to write clever, hard-to-review infrastructure code. A Pulumi program for part of Biteful's setup (not run, since it needs the Pulumi CLI and an AWS account) looks like this:</p>
  <div class="fx" data-lang="py"># __main__.py of a Pulumi project. NOT RUN: needs the pulumi CLI and an AWS account
import pulumi, pulumi_aws as aws

env = pulumi.get_stack()                             # "staging" or "prod"
bucket = aws.s3.BucketV2("artifacts", bucket=f"biteful-ml-artifacts-{env}",
                         tags={"team": "ml", "env": env, "model": "eta"})
repo = aws.ecr.Repository("eta", name="biteful/eta", image_tag_mutability="IMMUTABLE")
for region in ["ap-south-1", "ap-southeast-1"]:      # a real loop: one bucket per region
    aws.s3.BucketV2(f"cache-{region}", bucket=f"biteful-eta-cache-{env}-{region}",
                    opts=pulumi.ResourceOptions(provider=aws.Provider(region, region=region)))
pulumi.export("bucket", bucket.bucket)</div>
  <p>Each Pulumi <strong>stack</strong> (here "staging" or "prod") plays the role of a Terraform variables file, and the <code>for</code> loop shows what a real language adds: one cache bucket per region without copy-pasting blocks. Cloud providers also have their own IaC tools, such as AWS CloudFormation, but Terraform and Pulumi are popular because one tool covers every cloud.</p>

  <h2 id="cl-cost"><span class="num">09</span>Cost Traps</h2>
  <p>Biteful's planned cloud cost was simple: two CPU instances for the ETA endpoint, four spot training runs a month, and some storage. The first real bill was nearly nine times larger. This is the most common cloud story there is, and the reason is that compute for the main service is usually a small part of the bill. Here is an illustrative version of that first month, with example unit prices:</p>
  <div class="fx" data-lang="py"># Biteful's first month on the cloud: what was planned vs what was billed
# EXAMPLE unit prices for illustration only (real prices differ by provider and region)
HOURS = 730
bill = {
    # line item                      : (planned?, monthly $)
    "ETA endpoint, 2 CPU instances":   (True,  2 * 0.12 * HOURS),
    "weekly retrain on spot (4 runs)": (True,  4 * 2.10),
    "S3 storage, 400 GB":              (True,  400 * 0.023),
    "forgotten GPU test endpoint":     (False, 0.98 * HOURS),
    "GPU notebook left on, 3 weekends":(False, 3 * 64 * 0.98),
    "NAT gateway: 1 gateway + 2 TB":   (False, 0.045 * HOURS + 2_000 * 0.045),
    "egress: data copied out, 1.5 TB": (False, 1_500 * 0.09),
    "logs: request bodies, 600 GB":    (False, 600 * 0.50),
    "old checkpoints, 3 TB":           (False, 3_000 * 0.023),
}
planned = sum(c for p, c in bill.values() if p)
total = sum(c for _, c in bill.values())
for item, (p, c) in sorted(bill.items(), key=lambda kv: -kv[1][1]):
    print(f"{item:34s} \${c:8.2f}  {'planned' if p else 'SURPRISE'}")
print(f"{'planned':34s} \${planned:8.2f}")
print(f"{'billed':34s} \${total:8.2f}  ({total / planned:.1f}x the plan)")</div>
  <div class="fx" data-lang="text">forgotten GPU test endpoint        $  715.40  SURPRISE
logs: request bodies, 600 GB       $  300.00  SURPRISE
GPU notebook left on, 3 weekends   $  188.16  SURPRISE
ETA endpoint, 2 CPU instances      $  175.20  planned
egress: data copied out, 1.5 TB    $  135.00  SURPRISE
NAT gateway: 1 gateway + 2 TB      $  122.85  SURPRISE
old checkpoints, 3 TB              $   69.00  SURPRISE
S3 storage, 400 GB                 $    9.20  planned
weekly retrain on spot (4 runs)    $    8.40  planned
planned                            $  192.80
billed                             $ 1723.21  (8.9x the plan)</div>
  <p>The three planned lines add up to $192.80; the bill is $1,723.21. Every surprise falls into a few families that catch nearly every team. <strong>Idle resources</strong> are the largest: the forgotten GPU endpoint ($715.40) and a GPU notebook left running over three weekends ($188.16) were both billed by the hour while doing nothing. <strong>Logs</strong> come second here: logging every request body at debug level produced 600 GB of log data, and log services charge per GB taken in. <strong>Egress</strong> is the charge for data leaving the cloud provider's network or crossing regions, billed per GB; copying training data out to laptops every week added $135. A <strong>NAT gateway</strong>, the network component that lets machines in a private network reach the internet, bills per hour and per GB that passes through it, so pulling large images and datasets through it added $122.85. Finally, <strong>storage leftovers</strong>, such as every checkpoint of every tuning trial kept forever, grow quietly each month.</p>
  <p>It is like a phone bill: the plan price is small, and the shock comes from roaming charges (egress), the hotspot left on (idle instances) and subscriptions nobody remembers (old storage). The fixes are habits rather than clever tricks. Put <strong>cost allocation tags</strong> on every resource (the <code>tags</code> block in <code>main.tf</code> records team, environment and model), so the bill can be split and every line has an owner. Set <strong>budgets and alerts</strong>, so a spike is noticed after a day rather than at month end. Create everything through IaC, so <code>destroy</code> really removes it and hand-made resources stand out. Turn on auto-stop for idle notebooks, use lifecycle rules that delete or archive old checkpoints after a set number of days, keep compute in the same region as the data, use private endpoints for S3 instead of sending storage traffic through a NAT gateway, and log IDs and samples rather than full payloads. Treating cost as an engineering metric in this way is called <strong>FinOps</strong>, and a useful habit is to report cost per thousand predictions next to MAE whenever two model designs are compared.</p>
  <p>Right-sizing belongs on the same list. Biteful's ETA model is a gradient-boosted tree model, which runs comfortably on CPUs in well under a millisecond per order; putting it on a GPU instance would multiply the serving bill by about eight (using the example prices) for no gain. GPUs earn their price for large neural networks, such as the models in <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>, not for trees.</p>

  <h2 id="cl-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most expensive spot-training mistake is subtle because the code looks correct: the job writes checkpoints, but to the instance's own disk. When the instance is reclaimed, its disk goes with it, and the replacement instance starts with nothing. The simulation below runs the same interrupted job twice, once checkpointing to a folder that disappears with the "instance", and once to a folder that survives, standing in for S3:</p>
  <div class="fx" data-lang="py"># Mistake: checkpointing to the spot instance's own disk
import os, shutil, tempfile, json

def run_on_new_instance(ckpt_dir, interrupt_at=None):
    instance_disk = tempfile.mkdtemp()                 # each instance gets a fresh local disk
    folder = instance_disk if ckpt_dir is None else ckpt_dir
    path = os.path.join(folder, "ckpt.json")
    step = json.load(open(path))["step"] if os.path.exists(path) else 0
    start = step
    while step &lt; 300:
        step += 50
        json.dump({"step": step}, open(path, "w"))     # save a checkpoint
        if step == interrupt_at:
            shutil.rmtree(instance_disk)               # reclaimed: the local disk is gone
            return f"started at {start}, reclaimed at {step}"
    shutil.rmtree(instance_disk)
    return f"started at {start}, finished at {step}"

durable = tempfile.mkdtemp()                           # stands in for S3 / GCS
for label, where in [("local disk  ", None), ("durable store", durable)]:
    print(label, "| run 1:", run_on_new_instance(where, interrupt_at=150),
          "| run 2:", run_on_new_instance(where))</div>
  <div class="fx" data-lang="text">local disk   | run 1: started at 0, reclaimed at 150 | run 2: started at 0, finished at 300
durable store | run 1: started at 0, reclaimed at 150 | run 2: started at 150, finished at 300</div>
  <p>With local checkpoints, run 2 "started at 0": the checkpoints from run 1 were destroyed along with the instance, so all 150 steps were redone. With durable storage, run 2 started at 150. The fix is to write checkpoints to S3 or GCS (or to SageMaker's synced checkpoint folder) and to test the resume path once, deliberately, before trusting it with a long run.</p>
  <p>A second family of mistakes is about how infrastructure is created. Clicking resources together in the console, or calling <code>deploy()</code> from a notebook, produces infrastructure nobody can review, reproduce or reliably delete; everything that lives longer than an afternoon should be in Terraform or Pulumi. Keeping Terraform state on a laptop or in Git is the IaC version of the same error, and causes duplicated or destroyed resources the first time two people apply; use a remote, locked backend. Hard-coding environment names inside resources, instead of using a variable, is how staging accidentally overwrites production.</p>
  <p>The third family is about money. Running the only replicas of a real-time API on spot instances means a reclaim drops live traffic; keep an on-demand base. Leaving always-on endpoints up for occasional work, when Batch Transform or serverless would do, pays for 730 hours to use a few. Using GPUs for tree models wastes most of the instance. Leaving resources untagged and without budget alerts means a $715 endpoint can run for months with no owner. And estimating cost from compute alone ignores the network, log and storage lines that made up most of Biteful's first bill.</p>
  <p>Finally, spreading platform SDK calls through training code creates lock-in that makes every later change slow. Keep the training script, the Docker image and MLflow tracking portable, and keep the platform-specific code in one thin layer.</p>

  <h2 id="cl-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Cloud computing</b>: renting compute, storage and services on demand, billed by use.</li>
    <li><b>Managed ML platform</b>: a cloud service that runs training jobs, pipelines, registries and endpoints for you (SageMaker, Vertex AI, Azure ML).</li>
    <li><b>Training job</b>: an ephemeral managed run: start instance → load data from S3 → run script → save model to S3 → stop.</li>
    <li><b>Real-time / serverless / async endpoint</b>: always-on HTTPS service / scales to zero, per request, cold starts / queued, results to S3.</li>
    <li><b>Batch Transform</b>: a job that scores a whole S3 folder and stops; no endpoint.</li>
    <li><b>Spot instance</b>: spare capacity, often 60–90% cheaper, reclaimable at short notice (AWS: 2 minutes).</li>
    <li><b>Checkpoint</b>: saved training state in durable storage so a new machine can resume.</li>
    <li><b>IaC</b>: infrastructure described in version-controlled files and applied by a tool.</li>
    <li><b>State</b>: Terraform's record of which real resources it created; keep it remote and locked.</li>
    <li><b>Drift</b>: real infrastructure no longer matching the code (usually console changes).</li>
    <li><b>Egress</b>: data leaving a provider or region, billed per GB. <b>FinOps</b>: managing cloud cost as an engineering metric.</li>
  </ul>
  <h3>Cost formulas (example prices: CPU $0.12/h, GPU $0.98/h, spot $0.30/h)</h3>
  <table class="tbl">
    <tr><th>Mode</th><th>Formula</th><th>Biteful example</th></tr>
    <tr><td>Always-on</td><td>instances × $/hour × 730</td><td>2 × 0.12 × 730 = $175.20/month</td></tr>
    <tr><td>Serverless</td><td>requests × $/request</td><td>3M × $0.00002 = $60/month</td></tr>
    <tr><td>Batch</td><td>runs × hours per run × $/hour</td><td>30 × 0.25 × 0.12 = $0.90/month</td></tr>
    <tr><td>Break-even</td><td>always-on cost ÷ $/request</td><td>8.76M requests/month ≈ 3.3 req/s</td></tr>
    <tr><td>Spot</td><td>(work h + interruptions × (lost + restart)) × spot price</td><td>7 h × 0.30 = $2.10 vs $5.88 on demand</td></tr>
  </table>
  <h3>Platform map</h3>
  <table class="tbl">
    <tr><th></th><th>SageMaker</th><th>Vertex AI</th><th>Azure ML</th></tr>
    <tr><td>Training</td><td>Training job</td><td>CustomJob</td><td>Command job</td></tr>
    <tr><td>Pipelines</td><td>SageMaker Pipelines</td><td>Vertex Pipelines (KFP)</td><td>Azure ML pipelines</td></tr>
    <tr><td>Online</td><td>Endpoint</td><td>Endpoint</td><td>Managed online endpoint</td></tr>
    <tr><td>Batch</td><td>Batch Transform</td><td>Batch prediction</td><td>Batch endpoint</td></tr>
    <tr><td>Storage</td><td>S3</td><td>GCS</td><td>Blob Storage</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="text"># SageMaker spot training job (Python SDK)
SKLearn(..., use_spot_instances=True, max_run=3600, max_wait=7200,
        checkpoint_s3_uri="s3://bucket/checkpoints/eta/").fit({"train": "s3://..."})

# Terraform building blocks
variable "env" { default = "staging" }
resource "aws_sagemaker_endpoint" "eta" {
  name                 = "biteful-eta-\${var.env}"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.eta.name   # reference = dependency
}
output "endpoint_name" { value = aws_sagemaker_endpoint.eta.name }

terraform init → validate → plan -out plan.bin → apply plan.bin → destroy</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Choose the serving mode before the instance; always-on bills 730 h/month even with no traffic.</li>
    <li>Spot without durable checkpoints is a lottery; checkpoints on local disk vanish with the instance.</li>
    <li>Never run the only real-time replicas on spot; keep an on-demand base.</li>
    <li>Resources created by hand are not in Terraform state, so Terraform cannot see or destroy them.</li>
    <li>State: remote backend + locking; never on a laptop or in Git.</li>
    <li>Network, logs and storage can outweigh compute; tag everything and set budget alerts.</li>
    <li>Keep platform SDK calls in a thin layer to limit lock-in.</li>
  </ul>

  <h2 id="cl-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why do ML teams use the cloud instead of their own servers?</summary><div class="qa-body">ML workloads are uneven: serving peaks at certain hours and training needs GPUs for short bursts. Owning hardware means paying for the peak all the time, while renting means paying only for the hours used. The cloud also offers managed services (training jobs, endpoints, pipelines) that remove operational work, and lets a team get new GPU types without buying them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a managed ML platform give you compared with renting raw VMs?</summary><div class="qa-body">It runs the machinery around your code: starting and stopping training machines, moving data and models to and from storage, hosting endpoints with autoscaling and safe rollouts, running pipelines, and keeping a model registry. You trade some control and some lock-in for much less operational work, which suits small teams without platform engineers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through what happens when you call <code>fit()</code> on a SageMaker estimator.</summary><div class="qa-body">SageMaker starts the requested instances, pulls the framework or custom container image, copies the input data from S3 into <code>/opt/ml/input/data/&lt;channel&gt;</code>, and runs your script with the hyperparameters. When the script finishes, it uploads <code>/opt/ml/model</code> as <code>model.tar.gz</code> to S3 and terminates the instances, so you pay only for the run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Real-time endpoint vs serverless endpoint vs Batch Transform: how do you choose?</summary><div class="qa-body">Real-time endpoints are always on, answer in milliseconds and bill per instance-hour, so they suit steady traffic that needs an answer at request time. Serverless scales to zero and bills per request, but has cold starts, so it suits low or spiky traffic. Batch Transform scores a whole dataset and stops, so it suits predictions whose inputs are known in advance, such as tomorrow's pre-booked orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two instances at $0.12/hour run all month. What do they cost, and when would serverless at $0.00002/request be cheaper?</summary><div class="qa-body">2 × 0.12 × 730 = $175.20 a month. Serverless costs the same at 175.20 ÷ 0.00002 = 8.76 million requests a month, about 3.3 requests per second on average. Below that, serverless is cheaper; above it, the always-on instances are, as long as they can handle the load.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the three objects behind a SageMaker real-time endpoint?</summary><div class="qa-body">A model (container image plus model artifact in S3, plus an IAM role), an endpoint configuration (which model, instance type and count, possibly several variants for traffic splitting), and the endpoint itself, the running HTTPS service. Updating an endpoint means pointing it at a new configuration, which allows blue/green rollouts with automatic rollback.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do SageMaker, Vertex AI and Azure ML compare?</summary><div class="qa-body">They provide the same building blocks under different names: managed training (training job, CustomJob, command job), pipelines (SageMaker Pipelines, Vertex Pipelines on KFP, Azure ML pipelines), registries, online endpoints and batch scoring. The choice usually follows the company's existing cloud. Notable differences: Vertex Pipelines uses the Kubeflow Pipelines SDK, and Azure ML is built around MLflow tracking.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a spot instance, and how do you make training on spot safe?</summary><div class="qa-body">A spot instance is spare cloud capacity sold at a large discount that the provider can reclaim with short notice. To use it safely, the job saves checkpoints regularly to durable storage such as S3, checks for a checkpoint when it starts and resumes from it, keeps the checkpoint interval short relative to how often interruptions happen, and has its resume path tested once on purpose.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which workloads should and should not run on spot?</summary><div class="qa-body">Good: checkpointed training, hyperparameter search (independent trials that can be retried), batch scoring and data processing in retryable chunks. Bad: the only replicas of a latency-sensitive API, because a reclaim drops live traffic, and long jobs that cannot checkpoint. For serving, a common pattern is an on-demand base with spot capacity added for peaks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is infrastructure as code, and why use it for ML?</summary><div class="qa-body">IaC means describing infrastructure (buckets, registries, roles, endpoints, clusters) in version-controlled files that a tool applies. It makes environments reproducible (staging matches production), changes reviewable in pull requests, rollbacks possible and clean-up reliable through <code>destroy</code>. For ML it also stops forgotten endpoints and notebooks, because everything has an owner in code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>terraform plan</code> do, and how is it different from <code>apply</code>?</summary><div class="qa-body"><code>plan</code> reads the code, the state and the real resources, and prints what would be created, updated or destroyed, without changing anything. <code>apply</code> makes those changes; ideally it applies a saved plan file so exactly the reviewed changes happen. Teams run <code>plan</code> on every pull request and <code>apply</code> after approval.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Terraform state, and why should it be remote and locked?</summary><div class="qa-body">State records which real resources correspond to which blocks in the code, with their IDs and attributes. Without it, Terraform cannot know what it already created. It must be shared so the whole team and CI see the same truth, and locked so two applies cannot run at once; local copies diverge and can contain secrets. A typical setup is an S3 backend with a DynamoDB lock table, or Terraform Cloud.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is drift, and what happens to a resource created by hand in the console?</summary><div class="qa-body">Drift is when a resource Terraform manages has been changed outside Terraform, for example an instance count edited in the console; the next plan shows the difference and apply reverts it. A resource created entirely by hand is not in the state at all, so Terraform does not see it, will not destroy it and will not report it. That is why every change should go through code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Terraform or Pulumi?</summary><div class="qa-body">Both are declarative IaC tools with state and a plan/apply workflow. Terraform uses HCL, a simple configuration language that is easy to review and has the largest ecosystem. Pulumi uses general-purpose languages like Python, which makes loops, abstractions and unit tests natural but makes it easier to write over-clever infrastructure. Teams usually pick whichever their engineers will review well.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should a production endpoint be created by Terraform rather than by <code>deploy()</code> in a notebook?</summary><div class="qa-body">With Terraform the endpoint's image, instance type, count and IAM role are written in reviewed code with state, so staging and production match, changes are previewed in a plan, and <code>destroy</code> reliably removes it. <code>deploy()</code> in a notebook is click-ops in Python: unreviewed, hard to reproduce, and easy to forget running.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your cloud bill tripled this month. How do you investigate?</summary><div class="qa-body">Open the provider's cost explorer and group by service and by tag to find which lines grew. Typical causes are idle endpoints, notebooks or GPU instances, NAT gateway and egress charges, log ingestion, and growing storage such as old checkpoints and snapshots. Then fix ownership with tags, add budget alerts, move resources into IaC and add auto-stop and lifecycle rules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Managed ML platform or managed Kubernetes for serving?</summary><div class="qa-body">A managed platform suits a small team with a few models: endpoints, autoscaling and rollouts come built in. Managed Kubernetes suits teams with many services, existing Kubernetes skills and custom serving needs, and is often cheaper at scale because many models can share nodes. Many companies mix them, for example managed training jobs with Kubernetes serving.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you reduce the cost of serving and retraining a tree-based model in the cloud?</summary><div class="qa-body">Serve on right-sized CPU instances (trees do not need GPUs), use batch scoring wherever inputs are known in advance, autoscale with a sensible minimum, and use serverless for low-traffic endpoints. Retrain on spot instances with checkpoints, keep data and compute in the same region, apply lifecycle rules to old artifacts, and track cost per thousand predictions alongside model metrics.</div></details>
</main>
`
});
