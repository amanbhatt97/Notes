// notes/softeng/cf_cloud.js — Virtualization, Cloud & Performance
Object.assign(TOPIC_CONTENT, {
  "cf_cloud": `<main>
<h1>Virtualization, Cloud &amp; Performance</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>Virtualization, Cloud &amp; Performance</span></div>
  <p class="lead">Almost every machine a data scientist or ML engineer uses at work is not a real, physical computer but a <strong>virtual machine</strong>: a computer simulated in software, carved out of a much bigger physical server owned by a cloud provider. When you open a notebook on SageMaker or Vertex AI, start a Spark cluster, or deploy a model API, you are renting slices of someone else's hardware by the hour. To use that well you need to understand three things: how one physical machine is shared between many virtual ones, what the cloud actually sells you and how it is organised, and how to tell, once your job is running, whether it is slow because of the CPU, the memory, the disk or the network. This page follows one running example: the chai shop's nightly demand-forecasting job, which trains a model on the day's sales. It begins on a laptop, moves to the cloud, needs a correctly sized machine, and then turns out to be slower than expected, so we measure it. The machine these examples run on is itself a virtual machine, so all hardware numbers shown are the VM's, not those of the physical server underneath.</p>

  <h2 id="cfv-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Virtualization, Cloud &amp; Performance</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Virtualization</div>
        <ul>
          <li><b>VM</b>: a whole computer simulated in software, with its own OS</li>
          <li><b>Hypervisor</b>: shares hardware among VMs (type 1 bare metal, type 2 on an OS)</li>
          <li><b>Container</b>: isolated process sharing the host kernel; lighter than a VM</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cloud</div>
        <ul>
          <li>Rent computing on demand, pay per use</li>
          <li><b>IaaS</b> machines · <b>PaaS</b> platforms · <b>SaaS</b> finished apps</li>
          <li><b>Region</b> = geographic area; <b>AZ</b> = separate data centre(s) inside it</li>
          <li><b>VPC</b>, subnets, security groups; object storage (S3)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing a machine</div>
        <ul>
          <li>RAM ≈ 2–3× the data in memory; GPU only for GPU-friendly work</li>
          <li>Pay only while running; <b>spot</b> is cheap but can be taken away</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Performance</div>
        <ul>
          <li>CPU, RAM, disk utilization; load average vs number of cores</li>
          <li><b>Throughput</b> (MB/s), <b>IOPS</b> (ops/s), <b>latency</b> (time per op)</li>
          <li>CPU-bound vs memory-bound vs I/O-bound</li>
          <li><b>Metrics</b> show that something is wrong; <b>logs</b> and <b>profilers</b> show why</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfv-vm"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Virtualization and Virtual Machines</span><span class="rm-sub">one physical computer pretending to be many</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-hyper"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hypervisors: Type 1 and Type 2</span><span class="rm-sub">the software that shares the hardware</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-cont"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Containers vs Virtual Machines</span><span class="rm-sub">sharing the kernel instead of the hardware</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-cloud"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Cloud Computing: IaaS, PaaS and SaaS</span><span class="rm-sub">renting computers, platforms or finished software</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-providers"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">AWS, Azure, GCP, Regions and Availability Zones</span><span class="rm-sub">the same core services under different names</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-net"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Cloud Networking: VPC, Subnets, Security Groups</span><span class="rm-sub">your private network inside the cloud</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-obj"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Object Storage</span><span class="rm-sub">S3-style buckets where data lakes live</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-size"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing a Machine and Paying for It</span><span class="rm-sub">CPU, RAM, GPU, disk, on-demand vs spot</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-util"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Reading a Machine: CPU, RAM and Disk Utilization</span><span class="rm-sub">top, free, df, uptime and load average</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-io"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Throughput, Latency and IOPS</span><span class="rm-sub">three different meanings of "fast"</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-bound"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Bottlenecks: CPU-, Memory- and I/O-Bound</span><span class="rm-sub">finding what your program is waiting for</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-mon"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Monitoring and Profiling</span><span class="rm-sub">metrics, logs, percentiles and cProfile</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">idle GPUs, open buckets, averages that lie</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, service names, commands</span></div></div>
      <div class="rm-item rm-done" data-target="cfv-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">cloud and performance questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="cfv-vm"><span class="num">01</span>Virtualization and Virtual Machines</h2>
  <p>A modern server in a data centre is enormous: dozens or hundreds of CPU cores, hundreds of gigabytes of RAM. Very few programs need all of that, and in the early days companies ran one application per physical server, so most servers sat at 5–15% utilization, wasting electricity, space and money. Worse, setting up a new server meant ordering hardware and waiting weeks. What everyone wanted was a way to cut one big machine into several smaller, fully separate machines, created and destroyed in minutes.</p>
  <p><strong>Virtualization</strong> is that technique: using software to create simulated computers on top of one physical computer, so that one set of hardware can be shared safely by several independent systems. Each simulated computer is a <strong>virtual machine</strong> (VM). A VM has what looks, from the inside, like its own CPUs, its own RAM, its own disk and its own network card, and it runs its own complete operating system, called the <strong>guest OS</strong>. The physical machine underneath is called the <strong>host</strong>. Programs inside a VM cannot see or touch the other VMs on the same host, and if one VM crashes or is hacked, the others are unaffected.</p>
  <p>A block of flats is a helpful picture. The building (the physical server) has one foundation, one water supply and one electricity connection. It is divided into separate flats (VMs), each with its own front door, its own lock, its own kitchen and its own residents, who arrange things however they like and cannot walk into their neighbours' homes. The building manager (the hypervisor, next section) decides how the shared water and electricity are divided. One building houses many households far more efficiently than one house each.</p>
  <p>Inside, the trick works because modern CPUs have special support for it (Intel calls theirs VT-x, AMD calls theirs AMD-V). Most of the guest's instructions run directly on the real CPU at full speed; only sensitive operations, such as talking to hardware or changing memory mappings, are intercepted and handled by the virtualization software, which translates the guest's "disk" into a file on the host and the guest's "network card" into a slice of the real one. That is why a VM is only slightly slower than real hardware for most work. You can see the effect on this machine: the CPU reports that it is running under a <strong>hypervisor</strong>, and names it.</p>
  <div class="fx" data-lang="text">$ lscpu | grep -E '^(Model name|CPU\(s\)|Hypervisor vendor|Virtualization type)'
CPU(s):                                  4
Model name:                              Intel(R) Xeon(R) Processor @ 2.10GHz
Hypervisor vendor:                       KVM
Virtualization type:                     full
$ grep -c -w hypervisor /proc/cpuinfo
4
$ uname -r
6.18.44-fc-v653</div>
  <p>The VM believes it has 4 CPUs, an Intel Xeon processor. But <code>lscpu</code> also reports "Hypervisor vendor: KVM" and "Virtualization type: full", and all 4 CPUs carry the <code>hypervisor</code> flag in <code>/proc/cpuinfo</code>, which is how a guest learns it is virtualised. KVM is the hypervisor built into the Linux kernel, the one that many clouds use. The physical server underneath almost certainly has many more cores; this VM has simply been given four. Every cloud "instance" you rent, an AWS EC2 instance, an Azure VM, a GCP Compute Engine machine, is a VM like this one, and "4 vCPUs" on a price list means four virtual CPUs, usually each one hardware thread of a physical core.</p>
  <p>Virtualization brought the cloud's main superpowers. A VM is just files and settings, so it can be created from a saved image in a minute, copied, resized, snapshotted before a risky change, or even moved to another host while running. And because many VMs share each server, providers can keep hardware busy and rent it cheaply by the hour. The costs are some overhead, because each VM boots and runs a whole operating system, and the occasional <strong>noisy neighbour</strong>: another VM on the same host using so much disk or memory bandwidth that yours slows down.</p>

  <h2 id="cfv-hyper"><span class="num">02</span>Hypervisors: Type 1 and Type 2</h2>
  <p>Something has to create the VMs, give each its share of CPU time and memory, and keep them apart. That software is the <strong>hypervisor</strong>, also called a virtual machine monitor: the layer that sits between the hardware and the virtual machines and divides the physical resources among them, the building manager in the block of flats. There are two kinds, distinguished by what the hypervisor itself runs on.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
    <text x="150" y="18" text-anchor="middle" font-weight="700">Type 1 (bare metal)</text>
    <rect x="30" y="30" width="70" height="60" rx="6" class="fg sg"/><text x="65" y="55" text-anchor="middle" font-size="11">VM 1</text><text x="65" y="72" text-anchor="middle" class="tm" font-size="10">guest OS</text>
    <rect x="115" y="30" width="70" height="60" rx="6" class="fg sg"/><text x="150" y="55" text-anchor="middle" font-size="11">VM 2</text><text x="150" y="72" text-anchor="middle" class="tm" font-size="10">guest OS</text>
    <rect x="200" y="30" width="70" height="60" rx="6" class="fg sg"/><text x="235" y="55" text-anchor="middle" font-size="11">VM 3</text><text x="235" y="72" text-anchor="middle" class="tm" font-size="10">guest OS</text>
    <rect x="30" y="100" width="240" height="40" rx="6" class="fb sb"/><text x="150" y="125" text-anchor="middle">hypervisor (KVM, ESXi, Hyper-V)</text>
    <rect x="30" y="150" width="240" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="150" y="175" text-anchor="middle">physical hardware</text>
    <text x="150" y="215" text-anchor="middle" class="tm" font-size="10">data centres, clouds</text>
    <text x="490" y="18" text-anchor="middle" font-weight="700">Type 2 (hosted)</text>
    <rect x="380" y="30" width="100" height="40" rx="6" class="fg sg"/><text x="430" y="55" text-anchor="middle" font-size="11">VM (guest OS)</text>
    <rect x="490" y="30" width="110" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="545" y="55" text-anchor="middle" font-size="11">your browser, apps</text>
    <rect x="380" y="78" width="100" height="32" rx="6" class="fb sb"/><text x="430" y="99" text-anchor="middle" font-size="10">VirtualBox</text>
    <rect x="380" y="118" width="220" height="32" rx="6" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="490" y="139" text-anchor="middle" font-size="11">host OS (Windows / macOS)</text>
    <rect x="380" y="158" width="220" height="32" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="490" y="179" text-anchor="middle">physical hardware</text>
    <text x="490" y="215" text-anchor="middle" class="tm" font-size="10">laptops, desktops</text>
  </svg><figcaption>A type 1 hypervisor runs directly on the hardware and only hosts VMs. A type 2 hypervisor is an ordinary application on your normal operating system, so every VM operation passes through one extra layer.</figcaption></figure>
  <p>A <strong>type 1 hypervisor</strong>, also called a <strong>bare-metal</strong> hypervisor, runs directly on the physical hardware, with no ordinary operating system underneath. Its only job is running VMs, so it is lean, fast and secure. VMware ESXi, Microsoft Hyper-V, Xen and Linux KVM (which turns the Linux kernel itself into a hypervisor) are type 1, and every cloud data centre uses this kind; AWS's current one, called Nitro, is based on KVM. A <strong>type 2 hypervisor</strong>, or <strong>hosted</strong> hypervisor, is an application you install on a normal operating system, like any other program. Oracle VirtualBox, VMware Workstation and Parallels Desktop on a Mac are type 2. Look at the diagram from the bottom up: in type 2, a VM's request for hardware goes through the hypervisor application, then the host operating system, before reaching the hardware, so there is more overhead, and the VM competes with your browser and email for resources.</p>
  <p>In the flats analogy, a type 1 hypervisor is a building designed from the foundation up as flats, with a professional manager whose only job is running them. A type 2 hypervisor is a family home where the owner has turned a spare room into a rented flat: perfectly usable, but the tenant shares the family's front door and plumbing. That makes the uses clear. Type 1 is for servers and clouds where performance and isolation matter; type 2 is for a developer who wants to try Linux on a Windows laptop or test software on another operating system. You will mainly meet type 2 on your own machine, and type 1 every time you rent a cloud machine without ever seeing it.</p>

  <h2 id="cfv-cont"><span class="num">03</span>Containers vs Virtual Machines</h2>
  <p>VMs solved the sharing problem, but they are heavy for the job of shipping one application. Suppose the forecasting job needs Python 3.12, pandas and LightGBM. Packaging it as a VM means packaging a full operating system, several gigabytes, which takes a minute to boot and reserves its own chunk of RAM even when idle. Most of that is duplicated in every VM: ten VMs on one host run ten copies of the Linux kernel. Often you do not need a separate operating system at all; you only need your program to have its own files and libraries and to be isolated from other programs.</p>
  <p>A <strong>container</strong> provides exactly that. It is an ordinary process (a running program) on the host operating system, which the kernel isolates so that it sees its own file system, its own process list and its own network, and is limited in how much CPU and memory it may use. All containers on a host share the host's one kernel (the core of the operating system that talks to the hardware); they bring only their own application and libraries, packaged as an <strong>image</strong>. Because there is no guest OS to boot, a container starts in a fraction of a second, an image is often tens or hundreds of megabytes instead of gigabytes, and one host can run far more containers than VMs.</p>
  <figure class="viz"><svg viewBox="0 0 640 220" width="640">
    <text x="150" y="16" text-anchor="middle" font-weight="700">Virtual machines</text>
    <rect x="30" y="26" width="75" height="34" rx="5" class="fg sg"/><text x="67" y="47" text-anchor="middle" font-size="10">app + libs</text>
    <rect x="113" y="26" width="75" height="34" rx="5" class="fg sg"/><text x="150" y="47" text-anchor="middle" font-size="10">app + libs</text>
    <rect x="196" y="26" width="75" height="34" rx="5" class="fg sg"/><text x="233" y="47" text-anchor="middle" font-size="10">app + libs</text>
    <rect x="30" y="64" width="75" height="34" rx="5" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="67" y="85" text-anchor="middle" font-size="10">guest OS</text>
    <rect x="113" y="64" width="75" height="34" rx="5" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="150" y="85" text-anchor="middle" font-size="10">guest OS</text>
    <rect x="196" y="64" width="75" height="34" rx="5" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="233" y="85" text-anchor="middle" font-size="10">guest OS</text>
    <rect x="30" y="106" width="241" height="34" rx="5" class="fb sb"/><text x="150" y="127" text-anchor="middle" font-size="11">hypervisor</text>
    <rect x="30" y="148" width="241" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="150" y="169" text-anchor="middle" font-size="11">hardware</text>
    <text x="490" y="16" text-anchor="middle" font-weight="700">Containers</text>
    <rect x="370" y="64" width="75" height="34" rx="5" class="fg sg"/><text x="407" y="85" text-anchor="middle" font-size="10">app + libs</text>
    <rect x="453" y="64" width="75" height="34" rx="5" class="fg sg"/><text x="490" y="85" text-anchor="middle" font-size="10">app + libs</text>
    <rect x="536" y="64" width="75" height="34" rx="5" class="fg sg"/><text x="573" y="85" text-anchor="middle" font-size="10">app + libs</text>
    <rect x="370" y="106" width="241" height="34" rx="5" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="490" y="127" text-anchor="middle" font-size="11">one host OS kernel (+ Docker)</text>
    <rect x="370" y="148" width="241" height="34" rx="5" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="490" y="169" text-anchor="middle" font-size="11">hardware (or a VM)</text>
    <text x="150" y="205" text-anchor="middle" class="tm" font-size="10">each VM boots its own OS: GBs, ~a minute</text>
    <text x="490" y="205" text-anchor="middle" class="tm" font-size="10">shared kernel: MBs, under a second</text>
  </svg><figcaption>A VM virtualises the hardware, so each one carries a full guest operating system. A container virtualises the operating system, so containers share the host's kernel and carry only the application and its libraries.</figcaption></figure>
  <p>Back to the building analogy: VMs are separate flats, each with its own kitchen, bathroom and boiler. Containers are rooms in a well-run shared house: each tenant has a private, lockable room with their own belongings, but everyone shares the same kitchen and plumbing (the kernel). Rooms are cheaper and quicker to move into; flats give stronger separation. That is the trade-off exactly. Containers are lighter and faster, and ideal for packaging applications so they run the same everywhere, which is why Docker took over software delivery. VMs give stronger isolation, because a bug in the shared kernel could in principle let one container affect another, and they can run a different operating system: you cannot run a Windows container on a Linux kernel, but you can run a Windows VM on a Linux host.</p>
  <p>In practice the two are used together, not as rivals. Cloud providers give you VMs, and you run containers inside them; a Kubernetes cluster is a group of VMs, each running many containers. The machine these examples run on is in fact a lightweight VM used to run a sandboxed workload, which shows the boundary is blurry: some modern "micro-VMs" boot in a fraction of a second to give container-like speed with VM-level isolation. For the forecasting job, the normal path is to package it as a Docker image (<a class="xref" data-note="se_docker">Docker</a>) and run it on a cloud VM or a Kubernetes cluster (<a class="xref" data-note="mlops_k8s">Kubernetes for ML</a>).</p>
  <table class="tbl">
    <tr><th></th><th>Virtual machine</th><th>Container</th></tr>
    <tr><td>Virtualises</td><td>the hardware</td><td>the operating system</td></tr>
    <tr><td>Contains</td><td>full guest OS + app</td><td>app + libraries only</td></tr>
    <tr><td>Kernel</td><td>its own</td><td>shared with the host</td></tr>
    <tr><td>Size / start time</td><td>gigabytes / tens of seconds to minutes</td><td>megabytes / under a second</td></tr>
    <tr><td>Isolation</td><td>strong (hardware-level)</td><td>good, but shares a kernel</td></tr>
    <tr><td>Typical use</td><td>cloud instances, different OSes, strict isolation</td><td>packaging and deploying apps, microservices</td></tr>
  </table>

  <h2 id="cfv-cloud"><span class="num">04</span>Cloud Computing: IaaS, PaaS and SaaS</h2>
  <p>The forecasting job outgrows the laptop: the data is too big for its RAM, the job ties up the machine for hours, and it should run every night even when the laptop is closed. The shop could buy a server, but then it pays upfront for hardware that sits idle 22 hours a day, has to find space, power and cooling for it, and has to replace the disk when it fails. <strong>Cloud computing</strong> is the alternative: renting computing resources, machines, storage, databases and ready-made services, over the internet from a provider, on demand, and paying only for what you use. You click a button or run a command, a machine exists a minute later, and when you delete it the billing stops.</p>
  <p>Think of electricity. A century ago factories ran their own generators. Today they plug into the grid and pay per unit used, because a power company can generate electricity far more efficiently at scale and the factory can draw more on a busy day without building anything. The cloud does the same for computing: the provider runs huge data centres efficiently, and you get <strong>elasticity</strong> (scale up for the nightly training run, scale back down afterwards) and turn a large upfront purchase into a running cost. The trade-offs are that heavy, constant usage can end up more expensive than owning hardware, costs are easy to lose track of, and you depend on the provider.</p>
  <p>Cloud services are usually grouped by how much the provider manages for you, in three main <strong>service models</strong>. The popular "pizza" analogy captures them. You can make pizza at home with your own oven (owning servers: you do everything). With <strong>IaaS</strong>, Infrastructure as a Service, you rent the basic building blocks, virtual machines, disks and networks, and do everything above them yourself: install the OS updates, Python, your libraries and your application. It is like renting a fully equipped kitchen: the oven is provided, but you make the pizza. AWS EC2, Azure Virtual Machines and Google Compute Engine are IaaS. With <strong>PaaS</strong>, Platform as a Service, the provider also runs the operating system and runtime; you hand over your code or model and it is run, scaled and patched for you. That is pizza delivery: you choose what you want, someone else cooks it. Google App Engine, AWS Elastic Beanstalk, Heroku, managed databases like Amazon RDS, and ML platforms like SageMaker training jobs and Vertex AI are PaaS-style. With <strong>SaaS</strong>, Software as a Service, you simply use a finished application in the browser and manage nothing technical: eating at a restaurant. Gmail, Slack, Salesforce and Google Workspace are SaaS.</p>
  <table class="tbl">
    <tr><th></th><th>IaaS</th><th>PaaS</th><th>SaaS</th></tr>
    <tr><td>You get</td><td>virtual machines, disks, networks</td><td>a platform that runs your code</td><td>a finished application</td></tr>
    <tr><td>You manage</td><td>OS, runtime, libraries, app, data</td><td>your code/model and data</td><td>only your usage and settings</td></tr>
    <tr><td>Examples</td><td>EC2, Azure VMs, Compute Engine</td><td>App Engine, Heroku, RDS, SageMaker, Vertex AI</td><td>Gmail, Slack, Salesforce</td></tr>
    <tr><td>Pizza</td><td>rented kitchen</td><td>delivery</td><td>restaurant</td></tr>
    <tr><td>Trade-off</td><td>most control, most work</td><td>less work, less control</td><td>no work, least control</td></tr>
  </table>
  <p>The further right you go, the less you manage and the less you can customise. Notice also that responsibility is split even in IaaS: the provider secures the buildings, hardware and hypervisor, while you are responsible for what you put on top, your OS patches, passwords, network rules and data. This is called the <strong>shared responsibility model</strong>, and most cloud data leaks are on the customer's side of it. For the forecasting job, a data scientist might start with IaaS (a VM with Python installed, running the script with cron), then move to PaaS (a SageMaker or Vertex AI training job that starts a machine, runs the container and shuts it down) so that nobody has to look after a server; how those platforms work is in <a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a>.</p>

  <h2 id="cfv-providers"><span class="num">05</span>AWS, Azure, GCP, Regions and Availability Zones</h2>
  <p>Three providers dominate: <strong>Amazon Web Services</strong> (AWS, the largest and oldest), <strong>Microsoft Azure</strong> (strong in companies already using Microsoft products) and <strong>Google Cloud Platform</strong> (GCP, known for data and ML tools such as BigQuery and TPUs). They look intimidating because each offers two hundred services with brand names, but the core services are the same ideas under different labels, much as every city has buses, trains and taxis with different livery. If you understand the concept, switching provider is mostly learning new names.</p>
  <table class="tbl">
    <tr><th>Concept</th><th>AWS</th><th>Azure</th><th>GCP</th></tr>
    <tr><td>Virtual machines</td><td>EC2</td><td>Virtual Machines</td><td>Compute Engine</td></tr>
    <tr><td>Object storage</td><td>S3</td><td>Blob Storage</td><td>Cloud Storage (GCS)</td></tr>
    <tr><td>Block disks for VMs</td><td>EBS</td><td>Managed Disks</td><td>Persistent Disk</td></tr>
    <tr><td>Managed relational DB</td><td>RDS, Aurora</td><td>Azure SQL, Database for PostgreSQL</td><td>Cloud SQL, AlloyDB</td></tr>
    <tr><td>Data warehouse</td><td>Redshift</td><td>Synapse / Fabric</td><td>BigQuery</td></tr>
    <tr><td>Serverless functions</td><td>Lambda</td><td>Functions</td><td>Cloud Functions / Cloud Run</td></tr>
    <tr><td>Managed Kubernetes</td><td>EKS</td><td>AKS</td><td>GKE</td></tr>
    <tr><td>ML platform</td><td>SageMaker</td><td>Azure Machine Learning</td><td>Vertex AI</td></tr>
    <tr><td>Private network</td><td>VPC</td><td>Virtual Network (VNet)</td><td>VPC</td></tr>
    <tr><td>Identity and permissions</td><td>IAM</td><td>Entra ID + RBAC</td><td>IAM</td></tr>
    <tr><td>Message queue / streaming</td><td>SQS, Kinesis</td><td>Service Bus, Event Hubs</td><td>Pub/Sub</td></tr>
  </table>
  <p>The table is worth reading once with the forecasting job in mind: the raw sales files land in object storage (S3, Blob, GCS), the job runs on a VM or the ML platform, results go to a database or warehouse, and IAM decides which machines may read which data. <strong>Serverless</strong> deserves a sentence: it means you upload a function and the provider runs it only when triggered, scaling automatically and billing per call, so you never see a server at all, convenient for small event-driven jobs but limited in run time and memory.</p>
  <p>Physically, the cloud is a set of very real buildings, organised in two levels. A <strong>region</strong> is a geographic area where the provider has data centres, such as Mumbai (<code>ap-south-1</code> on AWS), Frankfurt or Northern Virginia (<code>us-east-1</code>). Regions are independent of each other, and you choose which region each resource lives in. Inside each region are several <strong>availability zones</strong> (AZs): one or more data centres with their own separate power, cooling and network, a few kilometres apart, connected to each other by very fast private links. A useful picture is a city (region) with several hospitals in different districts (AZs): a power cut in one district does not close every hospital, yet they are close enough to transfer patients quickly.</p>
  <p>These two levels drive several everyday decisions. You pick a region close to your users, for lower latency (see <a class="xref" data-note="cf_networking">Networking</a>), and sometimes because law requires data to stay in a country. Prices and available machine types, especially GPUs, differ between regions. You spread copies of anything important across at least two AZs, so the failure of one data centre does not take your service down: this is the redundancy of <a class="xref" data-note="cf_architecture">Architecture &amp; Scaling Basics</a> put into practice, and managed services offer it as a "multi-AZ" checkbox. And you keep compute close to its data: a Spark job in one region reading terabytes from a bucket in another pays for the slow cross-region transfer, both in time and in data transfer fees.</p>

  <h2 id="cfv-net"><span class="num">06</span>Cloud Networking: VPC, Subnets, Security Groups</h2>
  <p>When the shop puts its database and the forecasting VM in the cloud, it certainly does not want the database reachable by anyone on the internet. It needs a private network, like the office network behind a company's front door, except built in software inside the provider's data centres. That is a <strong>VPC</strong>, Virtual Private Cloud: a logically isolated network that belongs to your account, in which you decide the range of IP addresses, how it is divided, and what may talk to what. Resources in your VPC can reach each other on private addresses; nothing outside can reach in unless you explicitly allow it.</p>
  <p>The address range of a VPC is written in <strong>CIDR notation</strong>, such as <code>10.0.0.0/16</code>. An IPv4 address is 32 bits, and the number after the slash says how many leading bits are fixed for this network; the remaining bits number the individual machines. So <code>/16</code> fixes 16 bits and leaves 16 for machines, 2<sup>16</sup> = 65,536 addresses, while <code>/24</code> leaves 8 bits, 256 addresses. Addresses starting with 10., 172.16–31. and 192.168. are reserved as <strong>private</strong>: they are never used on the public internet, so they can be reused inside every company's network. A VPC is divided into <strong>subnets</strong>, smaller address ranges, each living in one availability zone. A <strong>public subnet</strong> has a route to the internet (through an <em>internet gateway</em>) and holds things that must be reachable from outside, such as the load balancer; a <strong>private subnet</strong> has no inbound route from the internet and holds databases and internal workers. Machines in a private subnet that need to download packages go out through a <em>NAT gateway</em>, which allows outgoing connections but not incoming ones. Python's standard <code>ipaddress</code> module makes the arithmetic concrete:</p>
  <div class="fx" data-lang="py">import ipaddress

vpc = ipaddress.ip_network("10.0.0.0/16")          # the whole private network
print(vpc, "-&gt;", vpc.num_addresses, "addresses")

subnets = list(vpc.subnets(new_prefix=24))         # carve it into /24 subnets
public, private = subnets[0], subnets[1]
print("public subnet :", public, "-&gt;", public.num_addresses, "addresses")
print("private subnet:", private, "-&gt;", private.num_addresses, "addresses")
print("how many /24s fit in the VPC:", len(subnets))

db_server = ipaddress.ip_address("10.0.1.25")
print("10.0.1.25 in private subnet?", db_server in private)
print("10.0.1.25 is a private (non-internet) address?", db_server.is_private)
print("8.8.8.8 is private?", ipaddress.ip_address("8.8.8.8").is_private)</div>
  <div class="fx" data-lang="text">10.0.0.0/16 -&gt; 65536 addresses
public subnet : 10.0.0.0/24 -&gt; 256 addresses
private subnet: 10.0.1.0/24 -&gt; 256 addresses
how many /24s fit in the VPC: 256
10.0.1.25 in private subnet? True
10.0.1.25 is a private (non-internet) address? True
8.8.8.8 is private? False</div>
  <p>The VPC <code>10.0.0.0/16</code> holds 65,536 addresses, and carving it into <code>/24</code> subnets gives 256 subnets of 256 addresses each (clouds reserve a handful in every subnet for their own use). The first is used as the public subnet and the second, <code>10.0.1.0/24</code>, as the private one; the database at 10.0.1.25 falls inside the private subnet, and it is a private address, while Google's public DNS server 8.8.8.8 is not. In the city analogy, the VPC is a gated housing estate, subnets are its streets, the public subnet is the street with the main gate and reception, and the private subnet is the inner street that visitors never reach directly.</p>
  <p>Inside the estate, each building still has a door with a guard. A <strong>security group</strong> is that guard: a virtual firewall attached to a VM or database, holding a list of <em>allow</em> rules that say which traffic may come in, by port (which service) and source (from which addresses). Anything not explicitly allowed is dropped. The simulation below checks connection attempts against the database's security group: Postgres (port 5432) only from the public subnet where the app servers live, SSH (port 22) only from one office IP address.</p>
  <div class="fx" data-lang="py"># SIMULATION of a security group: a list of "allow" rules; anything not allowed is dropped.
import ipaddress

db_security_group = [
    {"port": 5432, "source": "10.0.0.0/24"},     # Postgres, only from the public (web) subnet
    {"port": 22,   "source": "203.0.113.7/32"},  # SSH, only from the office IP
]

def allowed(rules, src_ip, port):
    ip = ipaddress.ip_address(src_ip)
    return any(r["port"] == port and ip in ipaddress.ip_network(r["source"]) for r in rules)

for src, port in [("10.0.0.12", 5432), ("198.51.100.9", 5432), ("203.0.113.7", 22), ("10.0.0.12", 22)]:
    print(f"{src:&gt;14} -&gt; port {port:&lt;5}", "ALLOW" if allowed(db_security_group, src, port) else "DENY")</div>
  <div class="fx" data-lang="text">     10.0.0.12 -&gt; port 5432  ALLOW
  198.51.100.9 -&gt; port 5432  DENY
   203.0.113.7 -&gt; port 22    ALLOW
     10.0.0.12 -&gt; port 22    DENY</div>
  <p>An app server at 10.0.0.12 may reach Postgres; a random internet address may not, even on the right port; the office IP may use SSH; and the app server may not use SSH, because no rule allows that combination. Real security groups work the same way, and they are <em>stateful</em>: if a request is allowed in, its reply is automatically allowed out. The most important habit is the <strong>principle of least privilege</strong>: open only the ports and sources you need. A rule allowing port 5432 or 22 from <code>0.0.0.0/0</code> (meaning "any address on the internet") is one of the most common causes of breaches. The underlying networking, IP addresses, ports and firewalls, is explained in <a class="xref" data-note="cf_networking">Networking</a>.</p>
  <figure class="viz"><svg viewBox="0 0 640 210" width="640">
    <rect x="10" y="10" width="620" height="190" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-dasharray="6 4"/>
    <text x="20" y="28" class="tm" font-size="11">region: ap-south-1 (Mumbai) · VPC 10.0.0.0/16</text>
    <rect x="25" y="40" width="290" height="150" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.35"/><text x="35" y="56" class="tm" font-size="10">availability zone A</text>
    <rect x="325" y="40" width="290" height="150" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.35"/><text x="335" y="56" class="tm" font-size="10">availability zone B</text>
    <rect x="40" y="64" width="260" height="50" rx="6" class="fb sb"/><text x="170" y="84" text-anchor="middle" font-size="11">public subnet 10.0.0.0/24</text><text x="170" y="101" text-anchor="middle" class="tm" font-size="10">load balancer, app server</text>
    <rect x="40" y="124" width="260" height="56" rx="6" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="170" y="146" text-anchor="middle" font-size="11">private subnet 10.0.1.0/24</text><text x="170" y="163" text-anchor="middle" class="tm" font-size="10">database (primary), forecast job</text>
    <rect x="340" y="64" width="260" height="50" rx="6" class="fb sb"/><text x="470" y="84" text-anchor="middle" font-size="11">public subnet 10.0.2.0/24</text><text x="470" y="101" text-anchor="middle" class="tm" font-size="10">app server</text>
    <rect x="340" y="124" width="260" height="56" rx="6" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="470" y="146" text-anchor="middle" font-size="11">private subnet 10.0.3.0/24</text><text x="470" y="163" text-anchor="middle" class="tm" font-size="10">database replica</text>
  </svg><figcaption>One VPC spanning two availability zones in a region. Each zone has a public subnet for internet-facing parts and a private subnet for the database and jobs; the replica in zone B keeps the shop running if zone A fails.</figcaption></figure>

  <h2 id="cfv-obj"><span class="num">07</span>Object Storage</h2>
  <p>Every night the shop's sales system exports a file, and over a year that is thousands of files and hundreds of gigabytes, plus model artefacts and logs. Keeping them on the forecasting VM's disk is a bad idea: the disk is attached to one machine, has a fixed size you must pay for in advance, and disappears if someone deletes the VM. The cloud's answer is <strong>object storage</strong>: a storage service where you save whole files, called <strong>objects</strong>, into containers called <strong>buckets</strong>, and read them back over HTTP from anywhere, with practically unlimited capacity and payment only for what you store. Amazon S3 is the original; Azure Blob Storage and Google Cloud Storage are equivalents, and many tools speak S3's API.</p>
  <p>Object storage is not a disk in the usual sense, and the differences matter. Each object is identified by a <strong>key</strong>, a string like <code>sales/2026/11/18.parquet</code>, inside a bucket. The slashes look like folders, and consoles display them as folders, but the store is really a flat map from key to bytes; "folders" are just shared key prefixes. You cannot edit part of an object: you upload a whole new version, which replaces it. Every request travels over the network, so each one has a latency of tens of milliseconds, far slower than a local disk for many small reads but able to deliver very high total throughput when you read large files or many files in parallel. In exchange you get very high <strong>durability</strong>: S3 is designed for 99.999999999% ("eleven nines") durability by storing copies across several availability zones, so losing an object to hardware failure is almost unheard of. A good picture is a huge valet coat-check: you hand over a whole coat and receive a ticket (the key); you can collect the coat from any branch with the ticket, but you cannot ask them to sew a button onto it while it hangs there.</p>
  <p>That design is why object storage is the foundation of modern data platforms. Data lakes keep Parquet files in S3 or GCS, Spark and pandas read them directly (<code>pd.read_parquet("s3://bucket/sales/")</code> with the right library installed), model registries store artefacts there, and training jobs read datasets from it. Code against it uses the provider's SDK, for example boto3 on AWS. The snippet below shows the shape; it is not run here because it needs cloud credentials and a real bucket:</p>
  <div class="fx" data-lang="py">import boto3

s3 = boto3.client("s3")
s3.upload_file("forecast.parquet", "chai-shop-data", "forecasts/2026-11-19.parquet")
for obj in s3.list_objects_v2(Bucket="chai-shop-data", Prefix="forecasts/")["Contents"]:
    print(obj["Key"], obj["Size"])</div>
  <p>Object storage also offers <strong>storage classes</strong>: frequently read data in a standard class, old data in cheaper "infrequent access" or archive classes (S3 Glacier, for example) that cost less to store but more, and take longer, to read back, with lifecycle rules that move objects automatically as they age. The comparison with block storage (a VM's disk) and file storage (a shared network drive), and how disks themselves work, is in <a class="xref" data-note="cf_storage">Storage: HDD, SSD &amp; File Systems</a>.</p>

  <h2 id="cfv-size"><span class="num">08</span>Choosing a Machine and Paying for It</h2>
  <p>Cloud consoles offer hundreds of machine types, and the choice decides both whether the forecasting job works at all and what it costs. The useful approach is to ask what the job actually needs from each of the four main resources. <strong>CPU</strong> cores (vCPUs) do calculations; more cores help only if the work is parallel, such as LightGBM training with several threads, scikit-learn with <code>n_jobs=-1</code>, or several Spark tasks, while plain pandas code mostly uses one core. <strong>RAM</strong> holds the data being worked on; if the data does not fit, the job crashes with an out-of-memory error, or becomes extremely slow, so RAM is usually the first thing to size. A <strong>GPU</strong> is a processor with thousands of simple cores that speeds up large matrix calculations, essential for deep learning, useless for most pandas and classical ML, and expensive. The <strong>disk</strong> holds the data and temporary files; its size and speed matter for jobs that read or spill a lot of data.</p>
  <p>Providers group machine types into families tuned for different balances: general purpose (balanced CPU and RAM, for example 4 GB per vCPU), compute-optimised (more CPU per GB, for CPU-heavy work), memory-optimised (8 GB or more per vCPU, for big in-memory dataframes and caches), GPU or accelerator instances (for deep learning training and inference), and storage-optimised (fast local disks). On AWS these are the m, c, r, g/p and i families, and similar groupings exist on Azure and GCP. Choosing well starts with measuring how much memory your data actually takes. pandas can tell you:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd

rows = 1_000_000
rng = np.random.default_rng(0)
df = pd.DataFrame({
    "order_id": np.arange(rows),                                  # int64
    "price": rng.uniform(10, 500, rows),                          # float64
    "city": rng.choice(["Mumbai", "Delhi", "Pune"], rows),        # text
})
mb = df.memory_usage(deep=True) / 1e6
print(mb.round(1).to_string())
print(f"total: {mb.sum():.0f} MB for {rows:,} rows")

df["city"] = df["city"].astype("category")                        # store text as small codes
print(f"after category: {df.memory_usage(deep=True).sum() / 1e6:.0f} MB")

per_row = mb.sum() * 1e6 / rows
for target in (50_000_000, 500_000_000):
    gb = per_row * target / 1e9
    print(f"{target:&gt;11,} rows ~ {gb:5.1f} GB raw -&gt; plan ~{gb * 3:5.0f} GB RAM (3x headroom)")</div>
  <div class="fx" data-lang="text">Index        0.0
order_id     8.0
price        8.0
city        54.0
total: 70 MB for 1,000,000 rows
after category: 17 MB
 50,000,000 rows ~   3.5 GB raw -&gt; plan ~   10 GB RAM (3x headroom)
500,000,000 rows ~  35.0 GB raw -&gt; plan ~  105 GB RAM (3x headroom)</div>
  <p>One million rows took about 70 MB, but notice where: the two number columns are exactly 8 MB each (8 bytes per value), while the text column takes 54 MB, because every string is a separate Python object. Converting it to a <code>category</code>, which stores each city name once plus a small integer code per row, cut the whole table to 17 MB. Scaling up from the measured bytes per row, 50 million rows would need about 3.5 GB as loaded, and 500 million rows about 35 GB. The plan then multiplies by roughly 2–3, because pandas operations such as merges, groupbys and sorts create temporary copies, and the operating system and Python need room too. So a 50-million-row job fits comfortably on a 16 GB machine; the 500-million-row job needs a large memory-optimised machine, or a better tool such as Polars, DuckDB or Spark that does not need everything in RAM at once. This measuring habit, together with choosing compact dtypes, is the single most effective way to avoid both out-of-memory crashes and paying for oversized machines. (How bytes become numbers and strings in memory is in <a class="xref" data-note="cf_data">How Data Is Stored as Bits</a>.)</p>
  <p>Cost follows from how long the machine exists, not how hard it works. Most machines are billed per second or per hour from the moment they start until you stop them, whether busy or idle. There are three main pricing options. <strong>On-demand</strong> is the default: pay the list price, start and stop any time. <strong>Reserved instances</strong> or <strong>savings plans</strong> give a large discount in exchange for committing to one or three years of usage, sensible for servers that run constantly. <strong>Spot instances</strong> (called preemptible or spot VMs on GCP and spot VMs on Azure) are the provider's spare capacity sold at a discount often in the range of 60–90%, with one catch: the provider can take the machine back at short notice (on AWS, a two-minute warning) when it needs the capacity. Spot is like a standby airline ticket: very cheap, but you may be bumped. The arithmetic below uses illustrative round-number prices, not real quotes, to show why both the pricing model and switching machines off matter:</p>
  <div class="fx" data-lang="py"># Cost arithmetic. Prices are ILLUSTRATIVE round numbers, not real quotes:
# always check your provider's current price page for your region.
hourly = {"on-demand 8 vCPU / 32 GB": 0.40,
          "spot (same machine)": 0.12,
          "on-demand 1 GPU machine": 1.20}
hours_per_month = 730

for name, price in hourly.items():
    print(f"{name:26} &#36;{price:4.2f}/h -&gt; left on 24/7: &#36;{price * hours_per_month:7.0f}/month")

job_hours = 2 * 30                    # a 2-hour nightly training job, 30 nights
print(f"\nnightly job, on-demand, only while running: &#36;{0.40 * job_hours:.0f}/month")
print(f"nightly job, spot, only while running     : &#36;{0.12 * job_hours:.0f}/month")</div>
  <div class="fx" data-lang="text">on-demand 8 vCPU / 32 GB   $0.40/h -&gt; left on 24/7: $    292/month
spot (same machine)        $0.12/h -&gt; left on 24/7: $     88/month
on-demand 1 GPU machine    $1.20/h -&gt; left on 24/7: $    876/month

nightly job, on-demand, only while running: $24/month
nightly job, spot, only while running     : $7/month</div>
  <p>The same 8-vCPU machine costs about $292 a month if left running 24/7, but a two-hour nightly job that starts the machine, runs and shuts it down costs $24 on-demand and $7 on spot. A GPU machine forgotten over a long weekend costs more than the nightly job does in months. Spot suits work that can be interrupted and resumed: training jobs that save <strong>checkpoints</strong> (the model's state, written to object storage every so often) so a replacement machine can continue, batch predictions split into chunks, and Spark worker nodes. It does not suit a database or a single long job that cannot resume. Managed ML platforms support "managed spot training" with automatic checkpoint resume; see <a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a>. Beyond compute, remember that storage is billed monthly per GB, and moving data out of the cloud or between regions (egress) is billed per GB too, which surprises many teams.</p>

  <h2 id="cfv-util"><span class="num">09</span>Reading a Machine: CPU, RAM and Disk Utilization</h2>
  <p>The forecasting job is now running on a cloud VM, but it takes three hours instead of the expected one. Before changing anything, you need to see what the machine is doing. <strong>Utilization</strong> means the fraction of a resource's capacity that is in use: a CPU at 100% utilization is busy all the time; a disk at 95% utilization is nearly full. Linux comes with small command-line tools that report it, and the same numbers appear as graphs in every cloud console. Here they are on this machine (a VM, so the numbers describe its 4 virtual CPUs and its share of RAM and disk):</p>
  <div class="fx" data-lang="text">$ uptime
 05:37:48 up 53 min,  0 user,  load average: 0.09, 0.22, 0.32
$ cat /proc/loadavg
0.09 0.22 0.32 1/109 27131
$ nproc
4
$ free -h
               total        used        free      shared  buff/cache   available
Mem:            15Gi       879Mi        14Gi        12Mi       922Mi        14Gi
Swap:             0B          0B          0B
$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        252G   29G  9.7G  75% /
$ top -b -n 1 | head -5
top - 05:37:48 up 53 min,  0 user,  load average: 0.09, 0.22, 0.32
Tasks:  83 total,   1 running,  82 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.0 us,  2.3 sy,  0.0 ni, 97.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st 
MiB Mem :  16087.7 total,  14603.9 free,    879.3 used,    922.5 buff/cache     
MiB Swap:      0.0 total,      0.0 free,      0.0 used.  15208.4 avail Mem</div>
  <p>Read the output from the top. <code>uptime</code> says how long the machine has been running and ends with three <strong>load average</strong> numbers, which <code>/proc/loadavg</code> shows in raw form. The load average is the average number of processes that were running or waiting to run (on Linux, also those stuck waiting for disk) over the last 1, 5 and 15 minutes. It only means something compared with the number of CPU cores, which <code>nproc</code> reports as 4: a load of 4.0 on a 4-core machine means every core is busy; 8.0 would mean twice as much work as the machine can handle, with processes queueing; the values here, below 1, mean the machine is mostly idle. Think of a supermarket with 4 checkouts: a load of 4 means every checkout is busy with no queue, and 8 means four customers are waiting. The three numbers together show the trend: if the 1-minute value is much higher than the 15-minute one, load is rising.</p>
  <p><code>free -h</code> reports memory ("-h" means human-readable units). The key column is <code>available</code>, not <code>free</code>. Linux deliberately uses spare RAM to cache recently read files (<code>buff/cache</code>), because unused RAM is wasted RAM, and it gives that memory back instantly when a program needs it; so "free" looks small on a healthy busy machine, while "available" estimates how much programs can still get. <code>Swap</code> is disk space used as overflow memory when RAM runs out; this VM has none, so a program that exceeds available RAM is killed by the kernel's out-of-memory killer rather than slowed down. On machines that do have swap, heavy swap use is a sign of too little RAM and makes everything crawl. <code>df -h /</code> reports disk space: size, used, available and use percentage for each file system. On this VM the numbers do not add up neatly (the "Size" includes space the system does not offer to this machine), which is common in virtual and cloud disks; "Avail" and "Use%" are the ones to trust. A disk that reaches 100% causes strange failures everywhere: databases stop, logs cannot be written, and jobs crash when writing temporary files.</p>
  <p>The <code>top</code> header combines all of this, and its <code>%Cpu(s)</code> line splits CPU time into categories worth knowing: <code>us</code> (user: time running programs' own code, such as your Python), <code>sy</code> (system: time in the kernel on programs' behalf, such as handling file and network operations), <code>id</code> (idle), <code>wa</code> (I/O wait: idle while waiting for the disk, a clue that the disk is the bottleneck) and <code>st</code> (steal: time the hypervisor gave to other VMs when this one wanted to run, the noisy-neighbour effect from section 01, which only exists on VMs). Below the header, <code>top</code> lists processes, and <code>ps</code> shows a chosen process. Here a Python process allocates 300 MB and sleeps, and <code>ps</code> reports on it:</p>
  <div class="fx" data-lang="text">$ python3 -c 'data = bytearray(300_000_000); import time; time.sleep(3)' &amp; sleep 1; ps -o pid,stat,%cpu,%mem,rss,etime,comm -p $!; kill $!
  PID STAT %CPU %MEM   RSS     ELAPSED COMMAND
27139 S    13.8  1.8 304000      00:01 python3</div>
  <p>The <code>RSS</code> column (resident set size, in kilobytes) is the RAM the process actually occupies, about 300 MB as expected, and <code>%MEM</code> is that as a share of the machine's RAM. <code>STAT</code> S means sleeping, and <code>%CPU</code> is averaged over the process's short life, mostly the moment of allocating the memory. These are the numbers to check when a job is slow or dies: is the CPU busy, is memory close to full, is the disk full or the CPU stuck in I/O wait. Process management and these tools in more depth are in <a class="xref" data-note="se_linux">Linux &amp; Terminal</a> and <a class="xref" data-note="cf_os">Operating Systems</a>.</p>

  <h2 id="cfv-io"><span class="num">10</span>Throughput, Latency and IOPS</h2>
  <p>When people say a disk, a network or an API is "fast", they can mean three different things, and confusing them leads to wrong fixes. <strong>Throughput</strong> (or bandwidth) is how much data is moved per second, measured in MB/s or GB/s; it matters when moving large amounts of data, like reading a 10 GB Parquet file. <strong>Latency</strong> is how long a single operation takes from request to completion, measured in milliseconds or microseconds; it matters when you do many small operations one after another, like database lookups. <strong>IOPS</strong>, input/output operations per second, is how many separate read or write operations a storage device can complete each second; it matters for workloads made of many small random reads and writes, like a database. Throughput is roughly IOPS multiplied by the size of each operation.</p>
  <p>A motorway explains the difference. Throughput is how many cars pass per hour; latency is how long one car takes to get from one end to the other; IOPS is how many separate trips can be completed per hour. A wide motorway (high throughput) does not make any single journey quicker if the road is long (high latency), and a fleet of tiny scooters can make many trips (high IOPS) while carrying very little cargo each (low throughput). The script below makes this real on this VM's disk with a 64 MB temporary file. First it writes the file in large 1 MB chunks and forces it onto the disk with <code>fsync</code> (which makes the operating system actually write data to the device instead of keeping it in memory); then it does 300 tiny 4 KB writes at scattered positions, each forced to disk separately:</p>
  <div class="fx" data-lang="py"># Small, real disk test in a temp file (64 MB). Numbers are this VM's and vary run to run.
import os, time, tempfile

path = os.path.join(tempfile.mkdtemp(dir="."), "test.bin")
chunk = os.urandom(1024 * 1024)                 # 1 MB of random bytes

# 1) Throughput: big sequential writes, then one fsync to force them onto the disk
t0 = time.perf_counter()
with open(path, "wb") as f:
    for _ in range(64):
        f.write(chunk)
    f.flush(); os.fsync(f.fileno())
secs = time.perf_counter() - t0
print(f"sequential write: 64 MB in {secs:.2f} s -&gt; {64 / secs:.0f} MB/s throughput")

# 2) IOPS and latency: many tiny 4 KB writes, each forced to disk with fsync
small = os.urandom(4096)
n = 300
t0 = time.perf_counter()
with open(path, "r+b") as f:
    for i in range(n):
        f.seek(i * 4096 * 50)                   # jump around the file
        f.write(small); f.flush(); os.fsync(f.fileno())
secs = time.perf_counter() - t0
print(f"4 KB synced writes: {n} in {secs:.2f} s -&gt; {n / secs:.0f} IOPS, "
      f"{secs / n * 1000:.2f} ms average latency, {n * 4 / 1024 / secs:.1f} MB/s")
os.remove(path); os.rmdir(os.path.dirname(path))</div>
  <div class="fx" data-lang="text">sequential write: 64 MB in 0.09 s -&gt; 677 MB/s throughput
4 KB synced writes: 300 in 0.05 s -&gt; 6267 IOPS, 0.16 ms average latency, 24.5 MB/s</div>
  <p>Big sequential writes achieved several hundred MB/s of throughput. The tiny synced writes managed a few thousand IOPS with a fraction of a millisecond average latency each, but because each operation carried only 4 KB, their throughput was a small fraction of the sequential figure, even though the same disk was doing the work. The exact numbers depend on the VM's virtual disk and change from run to run, so treat them as approximate; on a cloud VM they are also capped by the disk type you paid for, since cloud block disks advertise separate limits for IOPS and throughput, and both can be raised by choosing a bigger or faster disk. A spinning hard drive would manage only around a hundred random IOPS, which is why databases moved to SSDs; see <a class="xref" data-note="cf_storage">Storage: HDD, SSD &amp; File Systems</a>.</p>
  <p>The practical lesson for data work is that the same amount of data can be fast or slow depending on how you access it. Reading one 1 GB Parquet file is limited by throughput and is quick; reading a million 1 KB JSON files from object storage is limited by latency per request and can take hours. That is why data engineers combine many small files into fewer large ones, and why databases, which need many small random accesses, care most about IOPS and latency. The same three words apply to networks and APIs: a model API's latency is how long one prediction takes, and its throughput is how many predictions per second it can serve; batching requests usually raises throughput at the cost of some latency per request.</p>

  <h2 id="cfv-bound"><span class="num">11</span>Bottlenecks: CPU-, Memory- and I/O-Bound</h2>
  <p>A job is only as fast as its slowest part, just as a motorway's flow is decided by its narrowest stretch. That slowest part is the <strong>bottleneck</strong>, the resource that limits overall speed, and improving anything else makes no difference. Before buying a bigger machine, you need to know which resource is the bottleneck, because each one has a different cure. Programs are usually described as one of three kinds. A <strong>CPU-bound</strong> program spends its time calculating: the CPU is at 100% and a faster CPU, more cores (if the work can be split) or a more efficient algorithm would help. An <strong>I/O-bound</strong> program spends its time waiting for input/output: reading files, waiting for a database or an API to reply; the CPU sits idle, and a faster CPU would change nothing. A <strong>memory-bound</strong> program is in between: the CPU is "busy", but most of that time is spent waiting for data to arrive from RAM, because memory cannot deliver data as fast as the CPU can use it.</p>
  <p>The simplest diagnostic is to compare two clocks. <strong>Wall-clock time</strong> is the real elapsed time, what a stopwatch would show. <strong>CPU time</strong> is the time the CPU actually spent running your code. If CPU time is close to wall time, the program was calculating the whole time: CPU-bound. If CPU time is much smaller than wall time, the program was mostly waiting: I/O-bound. Python gives you both clocks (<code>time.perf_counter()</code> and <code>time.process_time()</code>), and the <code>resource</code> module reports the whole process's totals like the Unix <code>time</code> command does:</p>
  <div class="fx" data-lang="py"># Wall time = time on the clock. CPU time = time the CPU actually spent on our code.
import os, time, resource, tempfile

def measure(label, fn):
    wall0, cpu0 = time.perf_counter(), time.process_time()
    fn()
    wall, cpu = time.perf_counter() - wall0, time.process_time() - cpu0
    print(f"{label:28} wall {wall:5.2f} s   cpu {cpu:5.2f} s   cpu/wall {cpu / wall:4.0%}")

def cpu_bound():                       # pure calculation, no waiting
    total = 0
    for i in range(8_000_000):
        total += i * i

def io_bound_disk():                   # 200 small files, each forced to disk
    d = tempfile.mkdtemp(dir=".")
    for i in range(200):
        with open(f"{d}/f{i}.txt", "w") as f:
            f.write("chai,40\n"); f.flush(); os.fsync(f.fileno())
        os.remove(f"{d}/f{i}.txt")
    os.rmdir(d)

def io_bound_network():                # SIMULATED: waiting 1 s for a slow API to reply
    time.sleep(1.0)

measure("CPU-bound (arithmetic loop)", cpu_bound)
measure("I/O-bound (disk, fsync)", io_bound_disk)
measure("I/O-bound (network wait)", io_bound_network)

usage = resource.getrusage(resource.RUSAGE_SELF)
print(f"whole script: user {usage.ru_utime:.2f} s, system {usage.ru_stime:.2f} s, "
      f"peak RAM {usage.ru_maxrss / 1024:.0f} MB")</div>
  <div class="fx" data-lang="text">CPU-bound (arithmetic loop)  wall  0.48 s   cpu  0.48 s   cpu/wall 100%
I/O-bound (disk, fsync)      wall  0.13 s   cpu  0.03 s   cpu/wall  21%
I/O-bound (network wait)     wall  1.00 s   cpu  0.00 s   cpu/wall   0%
whole script: user 0.51 s, system 0.02 s, peak RAM 14 MB</div>
  <p>The arithmetic loop used about as much CPU time as wall time, a ratio near 100%: purely CPU-bound. The disk test spent most of its wall time waiting for <code>fsync</code> to complete, so CPU time was a fraction of it. The simulated network wait used essentially no CPU at all: the program simply slept while the "server" thought. The final line, from <code>getrusage</code>, splits the script's CPU time into <em>user</em> time (running our own code) and <em>system</em> time (the kernel working for us, such as file operations), and reports peak memory use. The numbers are approximate and vary between runs. The cures follow directly. For CPU-bound Python code, use vectorised NumPy or pandas operations instead of Python loops, or use several processes (<code>multiprocessing</code>), since threads in standard Python cannot run Python code on several cores at once. For I/O-bound code, overlap the waiting with threads or <code>asyncio</code>, batch requests, or move compute closer to the data; a bigger CPU is wasted money. Which concurrency tool fits which bottleneck is the subject of <a class="xref" data-note="py_concurrency">Concurrency vs Parallelism</a>.</p>
  <p>Memory-bound behaviour is subtler, because it looks like CPU work in <code>top</code>. The demonstration below sums the same 160 MB array twice, doing exactly the same additions, once reading elements in order and once in a shuffled order:</p>
  <div class="fx" data-lang="py"># Same arithmetic, different memory access pattern (array is 160 MB, far bigger than the CPU caches).
import numpy as np, time

a = np.ones(20_000_000)                    # 20 M float64 = 160 MB
in_order = np.arange(a.size)
shuffled = np.random.default_rng(0).permutation(a.size)

for label, idx in [("in order", in_order), ("random order", shuffled)]:
    t0 = time.perf_counter()
    total = a[idx].sum()                   # read every element exactly once
    print(f"{label:13} sum={total:.0f}  {time.perf_counter() - t0:.2f} s")</div>
  <div class="fx" data-lang="text">in order      sum=20000000  0.11 s
random order  sum=20000000  0.36 s</div>
  <p>Both sums are 20 million, so the arithmetic was identical, yet the shuffled version was about three times slower. In order, the CPU fetches memory in long runs and prefetches the next part before it is needed; in random order, almost every element requires a fresh trip to RAM, and the CPU spends most of its "busy" time waiting. (Part of the difference also comes from NumPy gathering a shuffled copy.) This is why access patterns matter for performance even when the CPU is at 100%: columnar formats like Parquet, contiguous NumPy arrays and sorting data before joining all help keep work memory-friendly. The mechanism, CPU caches and why RAM is slow compared with the CPU, is in <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a>. In GPU training the same thinking applies: if GPU utilization is low, the GPU is usually waiting for data from the loader, an I/O bottleneck, and the fix is more data-loading workers, not a bigger GPU (<a class="xref" data-note="dl_pytorch">PyTorch</a>).</p>

  <h2 id="cfv-mon"><span class="num">12</span>Monitoring and Profiling</h2>
  <p>Running <code>top</code> by hand works when you are looking at a problem right now. But the forecasting job runs at 2 a.m., the model API runs all day on several machines, and you want to know about problems before customers do, and afterwards to understand what happened. <strong>Monitoring</strong> is the continuous collection of data about a running system so you can see its health, get alerts when something goes wrong, and investigate later. It rests on two main kinds of data. <strong>Metrics</strong> are numbers measured at regular intervals: CPU utilization every minute, requests per second, error rate, memory used, prediction latency. They are small and cheap to store, easy to graph and to alert on ("page someone if the error rate stays above 1% for five minutes"). <strong>Logs</strong> are timestamped text records of individual events: "order 42 failed: TimeoutError calling payment service". They are bulky but detailed, and they tell you what happened in a particular case. A third kind, <strong>traces</strong>, follows a single request through several services, showing how long each step took.</p>
  <p>A hospital patient is a good analogy. The monitor by the bed shows heart rate, blood pressure and oxygen as numbers over time, and beeps when one goes out of range: those are metrics. The nurse's notes record specific events, "10:42 patient complained of chest pain, gave medication": those are logs. Metrics tell the doctor <em>that</em> something is wrong and when it started; the notes help explain <em>why</em>. In real systems, metrics typically go to tools such as Prometheus with Grafana dashboards or the cloud's own monitoring (CloudWatch, Azure Monitor, Google Cloud Monitoring), and logs to a searchable log store. For an ML system you also monitor the model itself, such as input data drift and prediction distributions, on top of these system metrics.</p>
  <p>One rule about metrics catches nearly everyone: do not judge latency by its average. A few very slow requests can hide behind a healthy-looking mean, or a few extreme ones can distort it. Instead, use <strong>percentiles</strong>: the p95 latency is the value 95% of requests are faster than. The simulated latencies below have 98% of requests around 80 ms and 2% stuck for 1.5–3 seconds:</p>
  <div class="fx" data-lang="py"># SIMULATED request latencies: most requests are fast, a few are very slow.
import numpy as np

rng = np.random.default_rng(1)
fast = rng.normal(80, 15, 980)                 # 980 requests around 80 ms
slow = rng.uniform(1500, 3000, 20)             # 20 requests stuck for 1.5-3 s
latency_ms = np.concatenate([fast, slow])

print(f"requests : {latency_ms.size}")
print(f"average  : {latency_ms.mean():6.0f} ms")
for p in (50, 95, 99):
    print(f"p{p:&lt;7} : {np.percentile(latency_ms, p):6.0f} ms")</div>
  <div class="fx" data-lang="text">requests : 1000
average  :    124 ms
p50      :     80 ms
p95      :    107 ms
p99      :   2319 ms</div>
  <p>The average of 124 ms describes no actual request: real requests were either around 80 ms or over a second. The median (p50) of 80 ms shows the typical experience, and p95 is still only about 107 ms, but p99 jumps above two seconds, revealing that one request in a hundred is terribly slow. With thousands of users, that is many unhappy customers every minute, and it often points to a specific problem such as a slow database query or garbage collection pauses. Dashboards and service-level objectives are therefore usually written in percentiles: "p99 latency under 500 ms".</p>
  <p>Monitoring tells you <em>which</em> job or service is slow and which resource is strained; <strong>profiling</strong> tells you <em>which part of your code</em> is responsible. A <strong>profiler</strong> runs your program while recording how much time is spent in each function. Python includes one, <code>cProfile</code>. Here it measures a miniature version of the forecasting pipeline: load the orders (including a wait that stands in for reading from storage), compute features in a Python loop, and summarise:</p>
  <div class="fx" data-lang="py">import cProfile, pstats, time

def load_orders():
    time.sleep(0.3)                                    # pretend: read a file from storage
    return [{"price": i % 500, "qty": i % 7} for i in range(300_000)]

def slow_features(orders):                             # pure-Python loop
    return [o["price"] * o["qty"] + len(str(o["price"])) for o in orders]

def summarise(values):
    return sum(values) / len(values)

def pipeline():
    orders = load_orders()
    feats = slow_features(orders)
    return summarise(feats)

profiler = cProfile.Profile()
profiler.enable()
pipeline()
profiler.disable()
pstats.Stats(profiler).strip_dirs().sort_stats("cumulative").print_stats(6)</div>
  <div class="fx" data-lang="text">         300008 function calls in 0.463 seconds

   Ordered by: cumulative time
   List reduced from 8 to 6 due to restriction &lt;6&gt;

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.000    0.000    0.463    0.463 c_prof.py:13(pipeline)
        1    0.061    0.061    0.361    0.361 c_prof.py:3(load_orders)
        1    0.300    0.300    0.300    0.300 {built-in method time.sleep}
        1    0.076    0.076    0.099    0.099 c_prof.py:7(slow_features)
   300001    0.024    0.000    0.024    0.000 {built-in method builtins.len}
        1    0.000    0.000    0.002    0.002 c_prof.py:10(summarise)</div>
  <p>The table is sorted by <code>cumtime</code>, the cumulative time spent in a function including everything it called; <code>tottime</code> is time spent in the function's own lines only, and <code>ncalls</code> is how many times it was called. Reading it top-down: <code>pipeline</code> took about half a second in total; most of that was inside <code>load_orders</code>, and most of <em>that</em> was the 0.3-second <code>time.sleep</code>, the simulated storage read. <code>slow_features</code>, the Python loop everyone would have guessed was the problem, is a smaller share, and <code>len</code> was called 300,001 times but cost little. So the right first fix is the I/O, reading less data, a faster format or reading in parallel, not rewriting the feature code. This is the whole point of profiling: measure before optimising, because intuition about where time goes is usually wrong. Exact timings vary from run to run. For line-by-line profilers, memory profilers like <code>tracemalloc</code>, flame graphs and the <code>logging</code> module, see <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>.</p>

  <h2 id="cfv-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most expensive cloud mistake is leaving machines running. Billing counts the time a machine exists, not the work it does, so a GPU notebook left open over a weekend or a forgotten test cluster can cost more than months of real jobs. Use jobs that start and stop their own machines, set idle shutdown on notebooks, put budget alerts on the account, and tag resources with an owner so orphans can be found.</p>
  <p>The second is choosing hardware by guesswork: a GPU machine for a pandas or scikit-learn job that never touches the GPU, or 64 vCPUs for single-threaded code. Measure first, as in sections 08 and 11. Check data size with <code>memory_usage(deep=True)</code>, watch whether the CPU is busy or waiting, and look at GPU utilization (<code>nvidia-smi</code>) before paying for one.</p>
  <p>The third is opening the network too widely: security groups allowing SSH or database ports from <code>0.0.0.0/0</code>, or object storage buckets made public "just to test". Automated scanners find such openings within minutes. Keep databases in private subnets, allow only the specific sources that need access, and keep buckets private by default.</p>
  <p>The fourth is running important work on spot instances without checkpoints. When the machine is reclaimed, hours of training vanish and the job starts over, which can end up costing more than on-demand. Save checkpoints to object storage regularly and make the job able to resume from the latest one.</p>
  <p>The fifth is misreading the numbers: panicking because <code>free</code> shows little "free" memory when "available" is plenty, comparing load average without checking the core count, or judging an API by its average latency when the p99 is terrible. A related trap is optimising before profiling, rewriting code that turns out to be a small share of the runtime while the real cost is waiting on I/O:</p>
  <div class="fx" data-lang="py"># Guessing: rewrite the feature loop, hope it helps
# Measuring: profile first, then fix the biggest cumtime entry
import cProfile, pstats
cProfile.run("pipeline()", "prof.out")
pstats.Stats("prof.out").sort_stats("cumulative").print_stats(10)</div>
  <p>(This is the same profiling call as in section 12, shown as a habit rather than re-run.) Finally, ignoring regions: putting the compute in one region and its data in another adds latency to every read and a data-transfer bill on every gigabyte.</p>

  <h2 id="cfv-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Virtualization</h3>
  <ul>
    <li><b>Virtualization</b>: software that splits one physical machine into several isolated virtual ones.</li>
    <li><b>VM</b>: a simulated computer with its own guest OS. <b>Host</b>: the physical machine.</li>
    <li><b>Hypervisor</b>: shares hardware among VMs. <b>Type 1</b> (bare metal: KVM, ESXi, Hyper-V, Xen) for servers and clouds; <b>Type 2</b> (hosted: VirtualBox, VMware Workstation, Parallels) on a desktop OS.</li>
    <li><b>Container</b>: isolated process sharing the host kernel; image holds app + libraries. Lighter and faster than a VM, weaker isolation, same OS kernel only.</li>
  </ul>
  <h3>Cloud</h3>
  <table class="tbl">
    <tr><th>Model</th><th>You manage</th><th>Examples</th></tr>
    <tr><td>IaaS</td><td>OS, runtime, app, data</td><td>EC2, Azure VMs, Compute Engine</td></tr>
    <tr><td>PaaS</td><td>code/model and data</td><td>App Engine, Heroku, RDS, SageMaker, Vertex AI</td></tr>
    <tr><td>SaaS</td><td>only usage</td><td>Gmail, Slack, Salesforce</td></tr>
  </table>
  <ul>
    <li><b>Region</b>: geographic area. <b>Availability zone</b>: separate data centre(s) in a region with own power and network. Spread important things across AZs.</li>
    <li><b>VPC</b>: your private network; <b>subnets</b> (public = route to internet, private = none); <b>security group</b> = allow-list firewall per resource. CIDR /16 = 65,536 addresses, /24 = 256.</li>
    <li><b>Object storage</b> (S3, Blob, GCS): buckets of whole objects by key; flat namespace; HTTP access; huge durability; whole-object writes.</li>
    <li><b>Pricing</b>: on-demand (flexible), reserved/savings plans (commit for discount), spot (big discount, can be reclaimed; needs checkpoints). Billed while running; egress costs extra.</li>
    <li><b>RAM sizing</b>: measure <code>df.memory_usage(deep=True)</code>, plan 2–3× headroom; use compact dtypes (category, smaller ints).</li>
  </ul>
  <h3>Performance terms</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th><th>Unit</th></tr>
    <tr><td>Utilization</td><td>share of a resource's capacity in use</td><td>%</td></tr>
    <tr><td>Load average</td><td>processes running or waiting, averaged over 1/5/15 min; compare with core count</td><td>number</td></tr>
    <tr><td>Throughput</td><td>data moved per second</td><td>MB/s</td></tr>
    <tr><td>Latency</td><td>time for one operation</td><td>ms, µs</td></tr>
    <tr><td>IOPS</td><td>separate I/O operations per second</td><td>ops/s</td></tr>
    <tr><td>p95 / p99</td><td>value 95% / 99% of requests are faster than</td><td>ms</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Bottleneck</th><th>Signs</th><th>Fix</th></tr>
    <tr><td>CPU-bound</td><td>CPU ~100%, CPU time ≈ wall time</td><td>vectorise, better algorithm, more cores via processes</td></tr>
    <tr><td>Memory-bound</td><td>CPU busy but slow; random access over big data</td><td>contiguous data, columnar formats, better access order</td></tr>
    <tr><td>I/O-bound</td><td>CPU idle, high <code>wa</code>, CPU time ≪ wall time</td><td>async/threads, batching, bigger files, faster disk, move compute to data</td></tr>
  </table>
  <h3>Commands</h3>
  <div class="fx" data-lang="text">nproc / lscpu            # how many CPUs, hypervisor?
uptime, cat /proc/loadavg  # load average (1, 5, 15 min)
free -h                  # memory: look at "available"
df -h                    # disk space per file system
top -b -n 1              # CPU split: us sy id wa st, top processes
ps -o pid,%cpu,%mem,rss,comm -p PID   # one process
python -m cProfile -s cumulative job.py   # profile a script</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Idle machines still cost money; stop them.</li>
    <li>"free" memory is low on healthy Linux; read "available".</li>
    <li>Load average means nothing without the core count.</li>
    <li>Averages hide slow requests; use p95/p99.</li>
    <li>Profile before optimising; the slow part is often I/O.</li>
    <li>Never open 22 or database ports to <code>0.0.0.0/0</code>.</li>
  </ul>

  <h2 id="cfv-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is virtualization, and why is it useful?</summary><div class="qa-body">Virtualization uses software to create several isolated virtual machines on one physical machine, each with its own virtual CPU, memory, disk and operating system. It raises hardware utilization, lets machines be created, resized, copied and deleted in minutes, and isolates workloads from each other. It is the foundation that makes renting cloud machines by the hour possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a hypervisor? Explain type 1 vs type 2.</summary><div class="qa-body">A hypervisor is the software layer that creates and runs virtual machines and divides physical resources among them. A type 1 (bare-metal) hypervisor runs directly on the hardware, like KVM, ESXi, Hyper-V or Xen, and is used in data centres and clouds for performance and isolation. A type 2 (hosted) hypervisor runs as an application on a normal OS, like VirtualBox or VMware Workstation, and is used on desktops for testing; it has more overhead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a container and a virtual machine?</summary><div class="qa-body">A VM virtualises hardware and runs a full guest operating system, so it is heavy (gigabytes, slower to boot) but strongly isolated and can run a different OS. A container virtualises the operating system: it is an isolated process that shares the host's kernel and carries only the app and its libraries, so it is small and starts in under a second, with somewhat weaker isolation. In practice containers usually run inside cloud VMs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain IaaS, PaaS and SaaS with examples.</summary><div class="qa-body">IaaS provides raw infrastructure, virtual machines, disks and networks, and you manage the OS and everything above (EC2, Compute Engine). PaaS also manages the OS and runtime, so you only supply code or models (Heroku, App Engine, RDS, SageMaker, Vertex AI). SaaS is a finished application used over the web (Gmail, Slack, Salesforce). Moving from IaaS to SaaS, you manage less and control less.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the shared responsibility model?</summary><div class="qa-body">It describes how security duties are split between the cloud provider and the customer. The provider secures the physical data centres, hardware, network and virtualization layer ("security of the cloud"). The customer secures what they put in it: OS patches on their VMs, IAM permissions, network rules, encryption and data ("security in the cloud"). Most breaches come from customer-side misconfiguration such as public buckets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a region and an availability zone?</summary><div class="qa-body">A region is a separate geographic area with its own set of data centres, such as Mumbai or Frankfurt. An availability zone is one or more physically separate data centres within a region, with independent power, cooling and networking, connected by low-latency links. You choose regions for user latency, data-residency laws, price and service availability, and spread resources across AZs for high availability.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the equivalent AWS, Azure and GCP services for compute, object storage and managed Kubernetes.</summary><div class="qa-body">Virtual machines: EC2, Azure Virtual Machines, Compute Engine. Object storage: S3, Azure Blob Storage, Google Cloud Storage. Managed Kubernetes: EKS, AKS, GKE. For ML platforms: SageMaker, Azure Machine Learning, Vertex AI.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are a VPC, a subnet and a security group?</summary><div class="qa-body">A VPC is a private, isolated virtual network in the cloud with an IP range you choose. Subnets divide that range, each in one availability zone; public subnets have a route to the internet, private ones do not, so databases go in private subnets. A security group is a stateful virtual firewall attached to resources that allows only listed traffic by port and source, denying everything else.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is object storage different from a disk (block storage)?</summary><div class="qa-body">Block storage is a virtual disk attached to one machine, formatted with a file system and allowing small in-place reads and writes with low latency, as databases need. Object storage (S3, GCS) stores whole objects in buckets by key, accessed over HTTP from anywhere, with practically unlimited capacity, very high durability and pay-per-GB pricing, but with higher per-request latency and no partial edits. Data lakes and model artefacts live in object storage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are spot instances, and when would you use them?</summary><div class="qa-body">Spot instances are spare provider capacity sold at a large discount, often 60–90%, which the provider can reclaim at short notice. They suit fault-tolerant, interruptible work: training jobs that checkpoint and resume, batch inference, Spark worker nodes, CI jobs. They are a poor choice for databases or long jobs that cannot resume.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you choose a cloud machine for a pandas or ML training job?</summary><div class="qa-body">First measure the data's in-memory size (<code>df.memory_usage(deep=True)</code>) and choose RAM of about 2–3 times that, optimising dtypes first. Pick CPU count based on how parallel the work really is, and a GPU only for GPU-friendly work like deep learning. Ensure enough disk for data and temporary files, then watch CPU, memory and GPU utilization on a trial run and resize; use spot plus checkpoints and stop the machine when done to control cost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does load average mean? Is a load of 6 bad?</summary><div class="qa-body">Load average is the average number of processes running or waiting to run (on Linux, also those waiting on disk I/O) over the last 1, 5 and 15 minutes. It must be compared with the number of CPU cores: 6 on a 16-core machine is fine, while 6 on a 2-core machine means work is queueing and the machine is overloaded. Comparing the three values shows whether load is rising or falling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Linux shows almost no free memory. Is the server running out of RAM?</summary><div class="qa-body">Not necessarily. Linux uses spare RAM as a file cache (buff/cache) and releases it immediately when programs need memory, so "free" is often low on a healthy machine. The "available" column estimates how much memory programs can still get. Real memory pressure shows as low available memory, heavy swap use, or processes killed by the OOM killer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain throughput, latency and IOPS.</summary><div class="qa-body">Throughput is how much data is transferred per second (MB/s). Latency is how long one operation takes (ms). IOPS is how many separate input/output operations a storage device completes per second; throughput is roughly IOPS times operation size. Large sequential reads depend on throughput; databases with many small random accesses depend on IOPS and latency.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How can you tell whether a program is CPU-bound or I/O-bound?</summary><div class="qa-body">Compare CPU time with wall-clock time, for example with the <code>time</code> command or <code>time.process_time()</code> vs <code>time.perf_counter()</code>. If CPU time is close to wall time (CPU near 100% in <code>top</code>), it is CPU-bound; if CPU time is much smaller and the CPU is idle or shows high I/O wait, it is I/O-bound. CPU-bound work needs better algorithms, vectorisation or more cores via processes; I/O-bound work benefits from async, threads, batching or faster storage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a memory-bound program?</summary><div class="qa-body">A memory-bound program is limited by how fast data can be moved between RAM and the CPU, not by the arithmetic itself. The CPU appears busy but spends much of its time waiting for memory, typically when accessing large data in random order so CPU caches and prefetching cannot help. Improving data layout and access order, such as contiguous arrays and columnar formats, helps more than a faster CPU.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between logs and metrics?</summary><div class="qa-body">Metrics are numeric measurements sampled over time, such as CPU usage, request rate, error rate and latency percentiles; they are cheap, easy to graph and used for dashboards and alerts. Logs are timestamped records of individual events with details, used to investigate what happened in a particular case. Metrics tell you that something is wrong; logs (and traces) help you find out why.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use p95/p99 latency instead of average latency?</summary><div class="qa-body">Latency distributions have long tails: most requests are fast but a few are very slow. The average mixes both and describes no real request, and can look fine while many users wait seconds. Percentiles show the experience of the slowest users: p99 under 500 ms means 99% of requests finish within half a second, which is what SLOs and alerts are usually based on.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A training job is slow and GPU utilization is 30%. What would you check?</summary><div class="qa-body">Low GPU utilization usually means the GPU is waiting for data. Check whether the data loader is the bottleneck: CPU usage of loader workers, disk or network throughput when reading data (for example small files in object storage), and whether data is being decoded or augmented on too few CPU workers. Fixes include more DataLoader workers, pinned memory, larger batches, caching or pre-processing data into larger files, and keeping data in the same region; profiling the training loop confirms where time goes.</div></details>
</main>
`
});
