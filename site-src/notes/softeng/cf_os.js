// notes/softeng/cf_os.js — Operating Systems
Object.assign(TOPIC_CONTENT, {
  "cf_os": `<main>
<h1>Operating Systems</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>Operating Systems</span></div>
  <p class="lead">An operating system, or OS, is the piece of software that runs the computer for every other program: it decides which program gets the processor, hands out memory, controls the disk and the network, and stops programs from damaging each other. Every time you run a Python script, open a notebook, start a Spark job or deploy a model in a container, the OS is doing a large amount of work underneath, and many confusing problems in real work (a job that was "Killed", Python threads that do not speed anything up, a container that ignores Ctrl+C, a "Permission denied" error) only make sense once you know what it is doing. To keep things concrete, one small program runs through the whole page: a nightly sales report job, <code>report.py</code>, that reads a CSV file of sales and writes a summary file. We will follow that job from the moment the OS starts it, through the system calls it makes, the process and threads it runs in, the scheduler that shares the CPU with it, and the signals that can stop it. Every demonstration was run on this page's machine, a Linux virtual machine with 4 CPU cores, so the numbers are that VM's.</p>

  <h2 id="cfo-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Operating Systems</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Kernel and system calls</div>
        <ul>
          <li>The <b>kernel</b> is the core of the OS and has full control of the hardware</li>
          <li>Programs run in <b>user space</b>; the kernel runs in <b>kernel space</b></li>
          <li>Programs ask the kernel for help through <b>system calls</b> (open, read, write, fork)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Processes and threads</div>
        <ul>
          <li><b>Process</b>: a running program with its own memory, PID and open files</li>
          <li><b>Thread</b>: a line of execution inside a process; threads share memory</li>
          <li>Processes are isolated and heavier; threads are light but can corrupt shared data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sharing the CPU</div>
        <ul>
          <li><b>Scheduler</b> gives each runnable thread a short <b>time slice</b></li>
          <li><b>Context switch</b>: save one thread's state, load another's</li>
          <li>Concurrency = taking turns; parallelism = truly at the same time on several cores</li>
          <li><b>Deadlock</b>: threads waiting for each other forever</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Around a process</div>
        <ul>
          <li>Files have owners and <b>rwx permissions</b>; env vars are inherited by children</li>
          <li><b>Signals</b>: SIGINT (Ctrl+C), SIGTERM (please stop), SIGKILL (stop now)</li>
          <li><b>Daemons</b> run in the background, managed by <b>systemd</b></li>
          <li><b>OOM killer</b> kills a process when memory runs out (exit code 137)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfo-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What an Operating System Is</span><span class="rm-sub">why every computer needs one, and the kernel at its centre</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-syscall"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">User Space, Kernel Space and System Calls</span><span class="rm-sub">how a program asks the OS to do things for it</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-proc"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Processes</span><span class="rm-sub">a running program, its PID and what it owns</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-thread"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Threads, and Process vs Thread</span><span class="rm-sub">several lines of work inside one process</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-multi"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Multitasking, Concurrency and Parallelism</span><span class="rm-sub">many programs at once, and what "at once" really means</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-sched"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Context Switching and CPU Scheduling</span><span class="rm-sub">time slices, priorities and the cost of switching</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-deadlock"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Deadlock</span><span class="rm-sub">when threads wait for each other forever</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-files"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Files, Permissions and Environment Variables</span><span class="rm-sub">the OS view of files, who may use them, and settings passed to programs</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-signals"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Signals, Services and Daemons</span><span class="rm-sub">Ctrl+C, kill, and programs that run in the background</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-oom"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Running Out of Memory: the OOM Killer</span><span class="rm-sub">why a job is sometimes just "Killed"</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-boot"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">The Boot Process</span><span class="rm-sub">from power button to a running system</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">threads for CPU work, SIGKILL first, env vars that vanish</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, comparison tables, commands</span></div></div>
      <div class="rm-item rm-done" data-target="cfo-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the OS questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="cfo-what"><span class="num">01</span>What an Operating System Is</h2>
  <p>Imagine a computer with no operating system at all. Your report job would have to know exactly which model of disk is fitted and send it the right electrical commands to find the bytes of <code>sales.csv</code>. It would have to decide for itself which part of memory to use, and hope that no other program picked the same part. If you wanted to play music while the report ran, the music player and the report would both try to use the single processor and the same memory, and whichever ran first would simply take over the machine. Early computers really did work a bit like this: one program at a time, each one written for one exact machine.</p>
  <p>An <strong>operating system</strong> is the layer of software that sits between programs and the hardware, managing the hardware and sharing it safely among all the programs that want to use it. It does three big jobs. First, it hides the messy details of the hardware behind simple ideas: a program asks to "open the file sales.csv" and the OS works out which disk blocks that means, whether the disk is an SSD, a hard drive or a network drive. Second, it shares out the limited resources, the processor (CPU), the memory (RAM), the disks and the network, so that dozens of programs can run side by side. Third, it protects programs from each other and the machine from programs, so a bug in one program cannot overwrite another program's memory or wipe the disk.</p>
  <p>A good way to picture this is a hotel. The guests are the programs. They never walk into the kitchen, the boiler room or the laundry themselves; they ask the front desk, and the hotel staff do the work. The staff decide which room each guest gets, make sure guests cannot open each other's doors, and share the hotel's limited facilities fairly. The operating system is the hotel management, and the hardware is the building.</p>
  <p>The operating systems you meet are <strong>Windows</strong>, <strong>macOS</strong> and <strong>Linux</strong> (plus Android and iOS on phones, which are built on Linux and on the same core as macOS respectively). They look very different on the surface, but they all do the same jobs described on this page. For data and ML work, Linux matters most by far: almost every server, cloud machine, Docker container, Kubernetes node and Spark cluster runs Linux, which is why the examples here use it. macOS is a close relative of Linux (both follow the Unix design), so most of the commands work there too; Windows does the same jobs with different names and tools.</p>
  <p>An OS is really two things. The part you see, the desktop, the file browser, the terminal and the bundled tools, is just a collection of ordinary programs. The essential part is the <strong>kernel</strong>: the core program that is loaded first when the computer starts, stays in memory the whole time, and has complete control over the hardware. The kernel is what actually schedules programs, manages memory, talks to devices through small pieces of code called <strong>drivers</strong>, and implements file systems and networking. "Linux", strictly speaking, is the name of a kernel; Ubuntu, Debian and Red Hat are complete operating systems built around that kernel. Here is the machine these notes were run on:</p>
  <div class="fx" data-lang="text">$ uname -srm
Linux 6.18.44-fc-v653 x86_64
$ grep PRETTY_NAME /etc/os-release
PRETTY_NAME="Ubuntu 24.04.5 LTS"
$ ps -eo pid,ppid,comm | head -5
  PID  PPID COMMAND
    1     0 process_api
    2     0 kthreadd
    3     2 pool_workqueue_release
    4     2 kworker/R-rcu_gp</div>
  <p>The first line is the kernel: Linux, version 6.18, on a 64-bit Intel-compatible (<code>x86_64</code>) processor. The second line is the operating system built around it, Ubuntu 24.04. The <code>ps</code> command lists running programs; process 2, <code>kthreadd</code>, belongs to the kernel itself and is the parent of the kernel's own internal workers (you can see they all have parent 2). Process 1 is the first program the kernel started, which we come back to in the boot section.</p>
  <figure class="viz"><svg viewBox="0 0 620 270" width="620">
<defs><marker id="cfo-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="10" y="45" class="tm" font-size="11">user space</text>
<rect x="100" y="22" width="115" height="38" rx="5" class="fb sb"/><text x="157" y="45" text-anchor="middle" font-size="11">report.py</text>
<rect x="225" y="22" width="115" height="38" rx="5" class="fb sb"/><text x="282" y="45" text-anchor="middle" font-size="11">Jupyter</text>
<rect x="350" y="22" width="115" height="38" rx="5" class="fb sb"/><text x="407" y="45" text-anchor="middle" font-size="11">web browser</text>
<rect x="475" y="22" width="115" height="38" rx="5" class="fb sb"/><text x="532" y="45" text-anchor="middle" font-size="11">PostgreSQL</text>
<path d="M157,62 L157,92" stroke="currentColor" marker-end="url(#cfo-a1)"/><path d="M282,62 L282,92" stroke="currentColor" marker-end="url(#cfo-a1)"/><path d="M407,62 L407,92" stroke="currentColor" marker-end="url(#cfo-a1)"/><path d="M532,62 L532,92" stroke="currentColor" marker-end="url(#cfo-a1)"/>
<line x1="100" y1="96" x2="590" y2="96" stroke="currentColor" stroke-dasharray="5 4"/>
<text x="345" y="112" text-anchor="middle" font-size="11" class="tr">system call interface: open, read, write, fork, kill, mmap ...</text>
<text x="10" y="160" class="tm" font-size="11">kernel space</text>
<rect x="100" y="122" width="490" height="76" rx="6" class="fv" stroke="currentColor"/>
<text x="345" y="138" text-anchor="middle" font-size="11">kernel</text>
<rect x="110" y="146" width="88" height="42" rx="4" class="fs" stroke="currentColor"/><text x="154" y="163" text-anchor="middle" font-size="10">process</text><text x="154" y="177" text-anchor="middle" font-size="10">scheduler</text>
<rect x="206" y="146" width="88" height="42" rx="4" class="fs" stroke="currentColor"/><text x="250" y="163" text-anchor="middle" font-size="10">memory</text><text x="250" y="177" text-anchor="middle" font-size="10">manager</text>
<rect x="302" y="146" width="88" height="42" rx="4" class="fs" stroke="currentColor"/><text x="346" y="163" text-anchor="middle" font-size="10">file</text><text x="346" y="177" text-anchor="middle" font-size="10">systems</text>
<rect x="398" y="146" width="88" height="42" rx="4" class="fs" stroke="currentColor"/><text x="442" y="163" text-anchor="middle" font-size="10">network</text><text x="442" y="177" text-anchor="middle" font-size="10">stack</text>
<rect x="494" y="146" width="88" height="42" rx="4" class="fs" stroke="currentColor"/><text x="538" y="163" text-anchor="middle" font-size="10">device</text><text x="538" y="177" text-anchor="middle" font-size="10">drivers</text>
<path d="M345,200 L345,222" stroke="currentColor" marker-end="url(#cfo-a1)"/>
<text x="10" y="248" class="tm" font-size="11">hardware</text>
<rect x="100" y="226" width="115" height="34" rx="5" class="fg sg"/><text x="157" y="247" text-anchor="middle" font-size="11">CPU cores</text>
<rect x="225" y="226" width="115" height="34" rx="5" class="fg sg"/><text x="282" y="247" text-anchor="middle" font-size="11">RAM</text>
<rect x="350" y="226" width="115" height="34" rx="5" class="fg sg"/><text x="407" y="247" text-anchor="middle" font-size="11">SSD / disk</text>
<rect x="475" y="226" width="115" height="34" rx="5" class="fg sg"/><text x="532" y="247" text-anchor="middle" font-size="11">network card</text>
</svg><figcaption>The layers of a running system. Programs never touch the hardware directly; they ask the kernel through system calls.</figcaption></figure>
  <p>Read the figure from the top. Ordinary programs, including your report job, a notebook server and a database, sit in the top layer. They cannot reach the hardware at the bottom directly. Every request, whether to read a file, get more memory or send data over the network, crosses the dashed line as a system call and is carried out by one of the kernel's parts: the scheduler decides who runs on the CPU, the memory manager hands out RAM, the file systems turn file names into disk blocks, the network stack handles connections, and the drivers speak each device's language. The next section looks at that dashed line closely.</p>

  <h2 id="cfo-syscall"><span class="num">02</span>User Space, Kernel Space and System Calls</h2>
  <p>If every program could give orders straight to the disk and to memory, one buggy or malicious program could read your passwords out of another program's memory or erase the whole disk. The OS needs a way to make sure that only the kernel touches the hardware, while still letting programs get their work done. The processor itself provides the tool for this.</p>
  <p>Modern CPUs can run in two modes. In <strong>kernel mode</strong> every instruction is allowed, including the ones that control devices and memory mappings. In <strong>user mode</strong> those dangerous instructions are blocked: if a program tries one, the CPU stops it and hands control to the kernel, which usually ends the program. The kernel runs in kernel mode, in a protected region of memory called <strong>kernel space</strong>. All ordinary programs, including Python, your notebook and your database, run in user mode in <strong>user space</strong>, each inside its own private slice of memory.</p>
  <p>So how does a user-space program read a file? It asks the kernel, through a <strong>system call</strong> (often shortened to <strong>syscall</strong>): a request from a program to the kernel to do something the program is not allowed to do itself, such as open a file, read from it, start a new process or send network data. Think of a bank counter with a glass screen. You, the customer, cannot reach the safe; you fill in a request slip and pass it through the slot. The cashier, who can reach the safe, checks that the request is allowed and passes back the result. A system call is that slip through the slot. Under the hood, the program puts the number of the call it wants and its arguments into CPU registers and executes a special instruction (<code>syscall</code> on x86-64). The CPU switches to kernel mode and jumps into the kernel, the kernel checks the request (does this file exist, is this user allowed to read it), does the work, puts the result back and switches the CPU back to user mode.</p>
  <p>You almost never write system calls yourself. When Python runs <code>open()</code> and <code>f.read()</code>, it calls functions in the C library, which make the actual system calls. Here is our report job, which we will trace in a moment:</p>
  <div class="fx" data-lang="py"># report.py: total sales per shop
import csv
totals = {}
with open("sales.csv") as f:
    for row in csv.DictReader(f):
        totals[row["shop"]] = totals.get(row["shop"], 0) + int(row["amount"])
with open("summary.txt", "w") as out:
    for shop, amount in sorted(totals.items()):
        out.write(f"{shop},{amount}\n")
print("done:", totals)</div>
  <div class="fx" data-lang="text">done: {'north': 93266, 'south': 95047, 'east': 92469}</div>
  <p>Linux has a tool called <code>strace</code> that shows every system call a program makes. Running the report job under it reveals what <code>open()</code>, the loop over rows and <code>out.write()</code> really turn into:</p>
  <div class="fx" data-lang="text">$ strace -o trace.txt -e trace=openat,read,write,close python3 report.py &gt; /dev/null
$ grep -A4 '"sales.csv"' trace.txt
openat(AT_FDCWD, "sales.csv", O_RDONLY|O_CLOEXEC) = 3
read(3, "date,shop,amount\n2026-11-01,nort"..., 8192) = 8192
read(3, "south,273\n2026-11-03,east,396\n20"..., 8192) = 8192
read(3, "26-11-05,east,190\n2026-11-06,sou"..., 8192) = 4200
read(3, "", 8192)                       = 0
$ grep -A2 '"summary.txt"' trace.txt
openat(AT_FDCWD, "summary.txt", O_WRONLY|O_CREAT|O_TRUNC|O_CLOEXEC, 0666) = 3
write(3, "east,92469\nnorth,93266\nsouth,950"..., 35) = 35
close(3)                                = 0
$ strace -c -o counts.txt python3 report.py &gt; /dev/null
$ tail -1 counts.txt
100.00    0.002773           4       669        85 total</div>
  <p>This is the report job seen from the kernel's side. Python's <code>open("sales.csv")</code> became an <code>openat</code> call, and the kernel answered <code>3</code>: a small number, called a <strong>file descriptor</strong>, that the program uses from then on to refer to that open file. Reading the CSV became a handful of <code>read</code> calls of up to 8192 bytes each, because Python reads in chunks rather than asking the kernel once per row: 8192 + 8192 + 4200 bytes is the whole 20,584-byte file, and the fourth read returned 0, which is how the kernel says "end of file". Writing the summary became one <code>openat</code> with the flags <code>O_WRONLY|O_CREAT|O_TRUNC</code> ("write only, create it if missing, empty it if present", which is exactly what mode <code>"w"</code> means), one <code>write</code> of 35 bytes and a <code>close</code>. The last line is the surprise: the whole run made about 670 system calls, most of them while Python itself was starting up and loading its modules.</p>
  <p>Python's <code>os</code> module exposes many system calls almost directly, which makes the idea concrete:</p>
  <div class="fx" data-lang="py">import os

fd = os.open("summary.txt", os.O_RDONLY)   # system call: openat
data = os.read(fd, 100)                     # system call: read
os.close(fd)                                # system call: close
print("file descriptor:", fd)
print(data)</div>
  <div class="fx" data-lang="text">file descriptor: 3
b'east,92469\nnorth,93266\nsouth,95047\n'</div>
  <p>Each line here is one system call. <code>os.open</code> returned file descriptor 3 (0, 1 and 2 are already taken by the standard input, output and error streams every process starts with), <code>os.read</code> returned the raw bytes of the summary, and <code>os.close</code> gave the descriptor back. The comfortable <code>open()</code> you normally use is a wrapper around these.</p>
  <p>System calls matter in practice because they are expensive compared with ordinary code. Each one switches the CPU into kernel mode and back, which costs far more than a normal function call. This is why reading a file one byte at a time is slow and reading in large chunks is fast, why Python buffers file reads and writes, and why libraries such as pandas read files in big blocks. When a program is mysteriously slow or stuck, <code>strace -p &lt;pid&gt;</code> on a running process is one of the quickest ways to see what it is waiting for.</p>

  <h2 id="cfo-proc"><span class="num">03</span>Processes</h2>
  <p>The file <code>report.py</code> sitting on disk is just text; it does nothing. When you type <code>python3 report.py</code>, the OS loads the Python interpreter into memory, gives it some memory of its own, opens its standard input and output, and starts it running. That running instance is what the OS manages, and it needs a name: a <strong>process</strong> is a program in execution, together with everything the OS has given it to run. If you start the report job twice, you get two processes from the same program, just as one recipe can be cooked in two kitchens at once.</p>
  <p>A process is best thought of as a sealed workspace. Like a worker's private office, it has its own desk (memory), its own filing cabinet of open files, an ID badge, and a manager it reports to. Specifically, the OS gives each process a unique number called the <strong>PID</strong> (process ID); a parent process, recorded as the <strong>PPID</strong>, which is the process that started it; its own private <strong>address space</strong>, the memory it can see, holding the program's code, its data, its heap (where objects live) and its stack (where function calls are tracked; see <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a>); a table of open file descriptors; the user it runs as, which decides what it is allowed to do; its environment variables and current directory; and at least one thread, which is what actually runs on the CPU. The kernel keeps all of this in a record called the process control block. On Linux you can read much of that record as text under <code>/proc</code>, and <code>/proc/self</code> always means "the process that is reading this":</p>
  <div class="fx" data-lang="py">import os

print("my PID:", os.getpid(), "  my parent's PID:", os.getppid())
wanted = ("Name", "State", "Pid", "PPid", "Uid", "VmSize", "VmRSS", "Threads")
for line in open("/proc/self/status"):           # the kernel's record of this process
    if line.split(":")[0] in wanted:
        print(line.rstrip())
print("open file descriptors:", sorted(os.listdir("/proc/self/fd"), key=int))</div>
  <div class="fx" data-lang="text">my PID: 26264   my parent's PID: 26243
Name:	python3
State:	R (running)
Pid:	26264
PPid:	26243
Uid:	0	0	0	0
VmSize:	   35552 kB
VmRSS:	   11088 kB
Threads:	1
open file descriptors: ['0', '1', '2', '3']</div>
  <p>The process found its own PID, and the PID of its parent (the shell that started it). The <code>/proc/self/status</code> lines are the kernel's record: the program is <code>python3</code>, its state is <code>R</code> (running), it runs as user ID 0 (root, in this VM), and it has exactly one thread. <code>VmSize</code> is the total address space it has reserved, about 35 MB, while <code>VmRSS</code> (resident set size) is the part actually sitting in physical RAM right now, about 11 MB; the difference is memory that has been reserved but not yet touched. Finally, its open files are descriptors 0, 1 and 2, the standard streams, plus 3, the <code>/proc/self/fd</code> folder it was in the middle of listing.</p>
  <p>The tool for looking at processes from the outside is <code>ps</code> (and its live version, <code>top</code> or <code>htop</code>). Here a Python script starts a second Python process as a stand-in for the report job and then asks <code>ps</code> about both:</p>
  <div class="fx" data-lang="py">import os, subprocess

# start the report job as a child process, but make it pause so we can look at it
child = subprocess.Popen(["python3", "-c", "import time; time.sleep(2)  # pretend report job"])
subprocess.run(["ps", "-o", "pid,ppid,stat,rss,etime,cmd", "-p", f"{os.getpid()},{child.pid}"])
child.wait()
print("child finished with exit code", child.returncode)</div>
  <div class="fx" data-lang="text">  PID  PPID STAT   RSS     ELAPSED CMD
26265 26243 S    13372       00:00 python3 ps_demo.py
26266 26265 R     8160       00:00 python3 -c import time; time.sleep(2)  # pretend report job
child finished with exit code 0</div>
  <p>The two rows show the parent-child relationship directly: the child's <code>PPID</code> is the parent's <code>PID</code>. <code>STAT</code> is the state, where <code>R</code> means running or ready to run and <code>S</code> means sleeping (waiting for something; here the parent was waiting for <code>ps</code> to finish). <code>RSS</code> is resident memory in kilobytes, and <code>ELAPSED</code> is how long it has existed. Every process on a Linux machine is started by another process, so together they form a family tree with process 1 at the root.</p>
  <p>How does a process start another? On Linux and macOS it happens in two steps. The system call <code>fork()</code> makes an almost exact copy of the calling process, and then the copy usually calls <code>exec()</code>, which replaces its program with a different one (this is what <code>subprocess</code> and the shell do behind the scenes). Watching <code>fork</code> on its own shows the most important property of processes, which is that their memory is separate:</p>
  <div class="fx" data-lang="py">import os

rows_done = 100
pid = os.fork()                      # one process becomes two
if pid == 0:                         # fork() returns 0 in the child
    rows_done += 50
    print(f"child : PID {os.getpid()}, parent {os.getppid()}, rows_done = {rows_done}")
    os._exit(0)
os.waitpid(pid, 0)                   # the parent waits for its child to finish
print(f"parent: PID {os.getpid()}, child was {pid}, rows_done = {rows_done}")</div>
  <div class="fx" data-lang="text">child : PID 26283, parent 26279, rows_done = 150
parent: PID 26279, child was 26283, rows_done = 100</div>
  <p><code>fork()</code> returns twice, once in each process: in the child it returns 0, and in the parent it returns the child's PID, which is how the code knows which branch it is in. Both processes started with <code>rows_done = 100</code>, because the child got a copy of the parent's memory. The child then added 50 and printed 150, yet the parent still printed 100. The child changed its own copy, and nothing it does can change the parent's memory. (Linux makes this copy cheap with <strong>copy-on-write</strong>: parent and child share the same physical memory pages until one of them writes to a page, and only then is that page copied.)</p>
  <p>The parent also called <code>waitpid</code> to collect its child's exit status. A process that has finished but whose parent has not yet collected that status is a <strong>zombie</strong> (state <code>Z</code> in <code>ps</code>); it uses no CPU or memory but still occupies a slot in the process table. A process whose parent dies first is an <strong>orphan</strong>, and it is adopted by process 1. This isolation is exactly why <code>multiprocessing</code>, Spark executors and the worker processes of a web server such as Gunicorn are separate processes: if one crashes, the others survive, and none of them can corrupt the others' memory. The price is that processes cannot simply share Python objects; data has to be copied between them.</p>

  <h2 id="cfo-thread"><span class="num">04</span>Threads, and Process vs Thread</h2>
  <p>Suppose the report job must download three shops' files from a server before summarising them, and each download spends most of its time waiting for the network. Done one after another, the waiting adds up. We could start three processes, but processes are heavy to create and do not share memory, so the results would have to be sent back to the parent somehow. What we want is several lines of work running inside the same program, all able to put their results into the same Python list.</p>
  <p>A <strong>thread</strong> is exactly that: an independent sequence of instructions that runs inside a process, sharing the process's memory and open files with the other threads of the same process. Every process starts with one thread, the main thread, and can create more. Each thread has only a few things of its own: its own position in the code (the CPU's instruction pointer and other registers) and its own stack for the functions it is in the middle of. Everything else, the heap where Python objects live, the global variables, the open files, belongs to the process and is shared. The thread is also the thing the OS scheduler actually runs on a CPU core; a process is the container, the threads are the workers inside it.</p>
  <p>If a process is a kitchen with its own pantry and equipment, threads are the cooks working in that kitchen. Several cooks can work at once, they all use the same pantry and the same pots, and passing food between them is as easy as putting it on the counter. But two cooks can also grab the same pot at the same moment and ruin the dish, which is the price of sharing. A second process is a whole second kitchen: safe from the first one's accidents, but more expensive to set up, and food has to be carried between them.</p>
  <div class="fx" data-lang="py">import os, threading, time

results = []                                   # ONE list, shared by all threads

def work(shop):
    results.append(shop)                       # every thread writes to the same list
    print(f"{shop:6} PID {os.getpid()}  thread id {threading.get_native_id()}")
    time.sleep(0.3)

threads = [threading.Thread(target=work, args=(s,)) for s in ("north", "south", "east")]
for t in threads:
    t.start()
    time.sleep(0.01)
status = open("/proc/self/status").read()
print([line for line in status.splitlines() if line.startswith("Threads")][0])
for t in threads:
    t.join()
print(f"main   PID {os.getpid()}  thread id {threading.get_native_id()}  results = {results}")</div>
  <div class="fx" data-lang="text">north  PID 26284  thread id 26286
south  PID 26284  thread id 26288
east   PID 26284  thread id 26294
Threads:	4
main   PID 26284  thread id 26284  results = ['north', 'south', 'east']</div>
  <p>All three worker threads report the same PID as the main thread, because they live in the same process, but each has its own thread ID: the kernel tracks and schedules them separately. (Notice that the main thread's ID equals the PID; on Linux the first thread's ID is the process ID.) While they were running, <code>/proc/self/status</code> reported <code>Threads: 4</code>, the main thread plus three workers. And all three appended to the one <code>results</code> list, so the main thread sees all three shop names without any copying. Compare this with the <code>fork</code> example, where the child's change never reached the parent.</p>
  <figure class="viz"><svg viewBox="0 0 620 220" width="620">
<text x="150" y="16" text-anchor="middle" font-size="12">two processes</text>
<text x="465" y="16" text-anchor="middle" font-size="12">one process, three threads</text>
<rect x="10" y="26" width="135" height="180" rx="6" class="fb sb"/><text x="77" y="44" text-anchor="middle" font-size="11">process A (PID 101)</text>
<rect x="20" y="52" width="115" height="60" rx="4" class="fs" stroke="currentColor"/><text x="77" y="70" text-anchor="middle" font-size="10">code, globals,</text><text x="77" y="84" text-anchor="middle" font-size="10">heap (objects),</text><text x="77" y="98" text-anchor="middle" font-size="10">open files</text>
<rect x="20" y="122" width="115" height="72" rx="4" class="fg sg"/><text x="77" y="148" text-anchor="middle" font-size="10">thread</text><text x="77" y="164" text-anchor="middle" font-size="10">stack + registers</text>
<rect x="155" y="26" width="135" height="180" rx="6" class="fb sb"/><text x="222" y="44" text-anchor="middle" font-size="11">process B (PID 102)</text>
<rect x="165" y="52" width="115" height="60" rx="4" class="fs" stroke="currentColor"/><text x="222" y="70" text-anchor="middle" font-size="10">code, globals,</text><text x="222" y="84" text-anchor="middle" font-size="10">heap (objects),</text><text x="222" y="98" text-anchor="middle" font-size="10">open files</text>
<rect x="165" y="122" width="115" height="72" rx="4" class="fg sg"/><text x="222" y="148" text-anchor="middle" font-size="10">thread</text><text x="222" y="164" text-anchor="middle" font-size="10">stack + registers</text>
<text x="150" y="218" text-anchor="middle" class="tr" font-size="10">separate memory: nothing shared</text>
<rect x="320" y="26" width="290" height="180" rx="6" class="fb sb"/><text x="465" y="44" text-anchor="middle" font-size="11">process C (PID 103)</text>
<rect x="330" y="52" width="270" height="60" rx="4" class="fs" stroke="currentColor"/><text x="465" y="74" text-anchor="middle" font-size="10">code, globals, heap (objects), open files</text><text x="465" y="92" text-anchor="middle" font-size="10" class="tg">shared by all three threads</text>
<rect x="330" y="122" width="82" height="72" rx="4" class="fg sg"/><text x="371" y="148" text-anchor="middle" font-size="10">thread 1</text><text x="371" y="164" text-anchor="middle" font-size="9">own stack</text>
<rect x="424" y="122" width="82" height="72" rx="4" class="fg sg"/><text x="465" y="148" text-anchor="middle" font-size="10">thread 2</text><text x="465" y="164" text-anchor="middle" font-size="9">own stack</text>
<rect x="518" y="122" width="82" height="72" rx="4" class="fg sg"/><text x="559" y="148" text-anchor="middle" font-size="10">thread 3</text><text x="559" y="164" text-anchor="middle" font-size="9">own stack</text>
<text x="465" y="218" text-anchor="middle" class="tg" font-size="10">one memory: threads see each other's changes</text>
</svg><figcaption>Processes each own a full set of resources. Threads in one process share everything except their own stack and registers.</figcaption></figure>
  <p>The figure sums up the difference. On the left, processes A and B each have their own code, heap and open files, so a bug in one cannot touch the other. On the right, three threads share one heap and one set of open files, and only their stacks (the record of which functions each is running) are private. That sharing is both the strength and the danger of threads: passing data is free, but two threads changing the same data at the same time can produce wrong results, called a <strong>race condition</strong>, which is why threaded code uses <strong>locks</strong> to let only one thread into a sensitive piece of code at a time (covered in <a class="xref" data-note="py_threading">Threading</a>).</p>
  <table class="tbl">
    <tr><th></th><th>Process</th><th>Thread</th></tr>
    <tr><td>What it is</td><td>a running program with its own resources</td><td>a line of execution inside a process</td></tr>
    <tr><td>Memory</td><td>private address space</td><td>shares the process's memory; own stack only</td></tr>
    <tr><td>Cost to create and switch</td><td>higher (new address space, page tables)</td><td>lower</td></tr>
    <tr><td>Sharing data</td><td>must copy it (pipes, queues, files, sockets)</td><td>just use the same objects (needs locks)</td></tr>
    <tr><td>If one crashes</td><td>the others keep running</td><td>the whole process usually dies</td></tr>
    <tr><td>Python tools</td><td><code>multiprocessing</code>, <code>subprocess</code></td><td><code>threading</code>, <code>ThreadPoolExecutor</code></td></tr>
  </table>
  <p>You meet both every day. A web browser runs each tab as a separate process so one crashing page does not take down the others. PyTorch's <code>DataLoader</code> with <code>num_workers</code> greater than zero uses worker processes, while NumPy's matrix multiply quietly uses several threads inside your one Python process. A FastAPI or Flask server may run several worker processes, each with threads or an event loop inside.</p>

  <h2 id="cfo-multi"><span class="num">05</span>Multitasking, Concurrency and Parallelism</h2>
  <p>Your laptop is running a browser, a music player, a chat app and your report job all at the same time, yet it may have only a few CPU cores, and right now this VM shows hundreds of processes and threads on 4 cores. If each core can only run one thread at a time, how do hundreds of programs all seem to be running?</p>
  <p>The answer is <strong>multitasking</strong>: the OS runs many tasks on a few cores by switching between them very quickly, giving each a few milliseconds of CPU time in turn, so fast that to a human they all appear to run continuously. Modern operating systems use <strong>preemptive multitasking</strong>, which means the OS does not wait for a program to give up the CPU politely; a hardware timer interrupts the running program at regular intervals and the kernel decides who runs next. (Old systems used cooperative multitasking, where each program had to hand back control itself, and one badly written program could freeze the whole machine.) <strong>Multithreading</strong> is the same idea inside one program: a process runs several threads, and the OS schedules each of them like any other task.</p>
  <p>This leads to two words that people often mix up. <strong>Concurrency</strong> means several tasks are in progress during the same period of time, making progress by taking turns, even if only one is running at any instant. <strong>Parallelism</strong> means several tasks are literally executing at the same instant, on different CPU cores. A single cook preparing three dishes by chopping for one, stirring another, then checking the oven, is concurrent: three dishes are in progress, but one pair of hands does one thing at a time. Three cooks each making one dish is parallel. Concurrency is about structuring work so that waiting does not waste time; parallelism is about doing more work per second by using more hardware. You can have concurrency on one core, but parallelism needs several.</p>
  <p>Python adds an important twist. The standard CPython interpreter has a <strong>Global Interpreter Lock</strong> (GIL), a lock that lets only one thread run Python code at a time within a process. Threads still help when the work is mostly waiting (for the network, a disk or a database), because a thread releases the GIL while it waits. But for pure CPU work, Python threads take turns rather than running in parallel. The fix for CPU-heavy Python is several processes, each with its own interpreter and its own GIL. Here is the same counting work done four ways on this 4-core VM:</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def count(n):                       # pure CPU work, no waiting
    total = 0
    for i in range(n):
        total += i
    return total

def timed(label, pool_class):
    start = time.perf_counter()
    with pool_class(max_workers=4) as pool:
        list(pool.map(count, [5_000_000] * 4))
    print(f"{label:22} {time.perf_counter() - start:.2f} s")

if __name__ == "__main__":
    start = time.perf_counter()
    for _ in range(4):
        count(5_000_000)
    print(f"{'one after another':22} {time.perf_counter() - start:.2f} s")
    timed("4 threads", ThreadPoolExecutor)
    timed("4 processes", ProcessPoolExecutor)</div>
  <div class="fx" data-lang="text">one after another      0.70 s
4 threads              0.64 s
4 processes            0.24 s</div>
  <p>The timings are approximate and vary from run to run, but the pattern is reliable. Four counting tasks one after another took about half a second. Four threads were no faster, and actually a little slower, because they took turns holding the GIL and paid the cost of switching between each other: concurrency without parallelism. Four processes finished in about half the time, because each process had its own interpreter and the OS ran them on different cores at the same moment: real parallelism. (They are not a full four times faster because starting the worker processes and sending them the work has a cost of its own.) Python 3.13 also offers an experimental "free-threaded" build without the GIL, but the standard build used by most projects still has it.</p>
  <p>The practical rule follows directly: use threads, or <code>asyncio</code>, for work that waits (calling APIs, downloading files, querying databases), and use processes for work that computes (feature engineering in pure Python, simulations). Libraries such as NumPy, pandas and PyTorch release the GIL inside their C code, which is why their heavy operations can use several cores even from one Python thread. The details and the right tool for each case are in <a class="xref" data-note="py_concurrency">Concurrency Overview</a>, <a class="xref" data-note="py_threading">Threading</a> and <a class="xref" data-note="py_multiprocessing">Multiprocessing</a>.</p>

  <h2 id="cfo-sched"><span class="num">06</span>Context Switching and CPU Scheduling</h2>
  <p>Multitasking raises two practical questions. When the OS takes the CPU away from one thread and gives it to another, how does the first thread later carry on exactly where it stopped, as if nothing had happened? And with dozens of threads ready to run, who decides which one goes next, and for how long?</p>
  <p>The first question is answered by the <strong>context switch</strong>: the act of saving the complete state of the thread that is running and loading the saved state of another, so the CPU can continue the second thread. A thread's "context" is everything the CPU needs to resume it: the instruction pointer (which instruction comes next), the other registers holding values it was working on, and its stack pointer; when the switch is to a thread in a different process, the kernel also has to switch the memory mappings to that process's address space. It is like a reader who is interrupted and puts a bookmark in the page, notes the line they were on, and picks up a different book; later, the bookmark lets them continue exactly where they left off. Context switches happen for two reasons. A <strong>voluntary</strong> switch happens when a thread has to wait, for example for the disk or the network or a <code>time.sleep</code>, so it gives the CPU away. An <strong>involuntary</strong> (preemptive) switch happens when a thread has used up its turn and the kernel's timer interrupt takes the CPU from it. Linux counts both for every process:</p>
  <div class="fx" data-lang="py">import os, time, multiprocessing as mp

def switches():
    d = {}
    for line in open("/proc/self/status"):
        key, _, value = line.partition(":")
        if key.endswith("ctxt_switches"):
            d[key.split("_")[0]] = int(value)
    return d

def sleeper(name):
    for _ in range(50):
        time.sleep(0.01)                 # wait: give the CPU away
    print(f"{name:8} {switches()}")

def busy(name):
    os.sched_setaffinity(0, {0})         # two busy workers share CPU 0
    end = time.time() + 1
    while time.time() &lt; end:
        pass                             # never waits, must be pushed off
    print(f"{name:8} {switches()}")

if __name__ == "__main__":
    jobs = [mp.Process(target=sleeper, args=("sleeper",)),
            mp.Process(target=busy, args=("busy-1",)),
            mp.Process(target=busy, args=("busy-2",))]
    for j in jobs: j.start()
    for j in jobs: j.join()</div>
  <div class="fx" data-lang="text">sleeper  {'voluntary': 50, 'nonvoluntary': 0}
busy-1   {'voluntary': 1, 'nonvoluntary': 125}
busy-2   {'voluntary': 1, 'nonvoluntary': 125}</div>
  <p>The sleeper slept 50 times and made exactly 50 voluntary switches: each <code>sleep</code> handed the CPU back, and it was never forced off. The two busy workers were deliberately pinned to the same core and never waited for anything, so neither ever gave the CPU away voluntarily; instead the kernel pushed each one off about 125 times in one second. That means the core was being handed back and forth about 250 times a second, every 4 milliseconds or so: that 4 ms is the length of each turn on this machine.</p>
  <figure class="viz"><svg viewBox="0 0 620 170" width="620">
<defs><marker id="cfo-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="10" y="20" font-size="12">one CPU core over about 30 ms</text>
<text x="10" y="62" class="tm" font-size="11">running:</text>
<rect x="80" y="44" width="80" height="30" class="fb sb"/><text x="120" y="63" text-anchor="middle" font-size="10">report.py</text>
<rect x="164" y="44" width="80" height="30" class="fg sg"/><text x="204" y="63" text-anchor="middle" font-size="10">browser</text>
<rect x="248" y="44" width="40" height="30" class="fb sb"/><text x="268" y="63" text-anchor="middle" font-size="10">rep.</text>
<rect x="292" y="44" width="80" height="30" class="fr sr"/><text x="332" y="63" text-anchor="middle" font-size="10">Jupyter</text>
<rect x="376" y="44" width="80" height="30" class="fg sg"/><text x="416" y="63" text-anchor="middle" font-size="10">browser</text>
<rect x="460" y="44" width="80" height="30" class="fb sb"/><text x="500" y="63" text-anchor="middle" font-size="10">report.py</text>
<line x1="162" y1="38" x2="162" y2="80" stroke="currentColor" stroke-dasharray="2 2"/><line x1="246" y1="38" x2="246" y2="80" stroke="currentColor" stroke-dasharray="2 2"/><line x1="290" y1="38" x2="290" y2="80" stroke="currentColor" stroke-dasharray="2 2"/><line x1="374" y1="38" x2="374" y2="80" stroke="currentColor" stroke-dasharray="2 2"/><line x1="458" y1="38" x2="458" y2="80" stroke="currentColor" stroke-dasharray="2 2"/>
<path d="M162,96 L162,82" stroke="currentColor" marker-end="url(#cfo-a2)"/><text x="162" y="108" text-anchor="middle" font-size="10">time slice used up</text><text x="162" y="120" text-anchor="middle" font-size="10" class="tm">(involuntary switch)</text>
<path d="M290,140 L290,82" stroke="currentColor" marker-end="url(#cfo-a2)"/><text x="290" y="152" text-anchor="middle" font-size="10">report.py waits for the disk</text><text x="290" y="164" text-anchor="middle" font-size="10" class="tm">(voluntary switch)</text>
<line x1="80" y1="88" x2="545" y2="88" stroke="currentColor" marker-end="url(#cfo-a2)"/><text x="575" y="92" class="tm" font-size="10">time</text>
</svg><figcaption>One core shared by three programs. Each dashed line is a context switch, either because a time slice ran out or because a program had to wait.</figcaption></figure>
  <p>Follow the core from left to right. The report job runs until its turn is over, and the kernel switches to the browser. When the report job gets the core back it soon asks the disk for more of the CSV; rather than waste the CPU while the disk works, it gives up the rest of its turn and Jupyter runs instead. When the disk has delivered the data, the report job becomes ready again and gets another turn later. Each dashed line costs a little time, typically a few microseconds, because the kernel has to save and restore state and, worse, the CPU's caches now hold the previous program's data, so the new one starts slowly. That is why a program with far more busy threads than cores can get slower rather than faster: it spends more and more time switching instead of working.</p>
  <p>The second question, who runs next, is the job of the <strong>scheduler</strong>, the part of the kernel that decides which ready thread runs on each core and for how long. The turn a thread gets is called a <strong>time slice</strong> (or quantum), typically a few milliseconds. A good scheduler has to balance goals that pull against each other: keep every core busy, respond quickly to interactive programs such as your editor, be fair so no program starves, and get batch jobs finished. Classic textbook strategies include first-come-first-served, shortest-job-first and round robin (everyone gets an equal slice in turn). Linux's scheduler is fair-share in spirit: it tracks how much CPU time each thread has received and keeps giving the core to whichever runnable thread has had the least, adjusted by priority. Threads that are sleeping or waiting for input are not in the queue at all, so they cost nothing.</p>
  <p><strong>Priority</strong> lets you tell the scheduler that some work matters more. On Linux and macOS the everyday control is the <strong>nice value</strong>, from −20 (highest priority) to 19 (lowest); the name comes from being "nice" to other programs by letting them go first. Ordinary users can only make their own processes nicer, while lowering the value needs administrator rights. In this demonstration two identical busy workers share one core for two seconds, one at the normal nice value 0 and one at nice 10:</p>
  <div class="fx" data-lang="py">import os, time, multiprocessing as mp

def worker(niceness, result):
    os.sched_setaffinity(0, {0})        # both workers share CPU 0
    os.nice(niceness)                   # raise niceness = lower priority
    count, end = 0, time.time() + 2
    while time.time() &lt; end:
        count += 1
    result.value = count

if __name__ == "__main__":
    results = {n: mp.Value("q", 0) for n in (0, 10)}
    procs = [mp.Process(target=worker, args=(n, results[n])) for n in results]
    for p in procs: p.start()
    for p in procs: p.join()
    total = sum(r.value for r in results.values())
    for n, r in results.items():
        print(f"nice {n:2}: {r.value:&gt;11,} loop turns ({r.value / total:.0%} of the CPU)")</div>
  <div class="fx" data-lang="text">nice  0:  23,163,701 loop turns (90% of the CPU)
nice 10:   2,575,216 loop turns (10% of the CPU)</div>
  <p>Both workers were ready to run the entire time, but the scheduler gave the nice-0 worker about nine times as much CPU (roughly 90% against 10%), because each step on the nice scale changes a thread's share by about 25%. This is useful in practice: if you start a long model-training job with <code>nice -n 10 python3 train.py</code>, your notebook and editor stay responsive, and the training job still gets every spare cycle when nothing else wants the CPU. Kubernetes and Docker offer a different control, CPU limits and requests, which are enforced by the same kernel scheduler through a feature called cgroups.</p>

  <h2 id="cfo-deadlock"><span class="num">07</span>Deadlock</h2>
  <p>Once threads share data, they need locks so that only one thread changes a piece of data at a time. Locks create a new danger. Picture two threads in our report system: one updates the stock table and then the ledger, while the other updates the ledger and then the stock table. If each grabs its first lock at the same moment, each then waits for the lock the other is holding, and neither can ever continue.</p>
  <p>That situation is a <strong>deadlock</strong>: a set of threads or processes each waiting for a resource held by another member of the set, so none of them can ever proceed. The everyday picture is two cars meeting on a one-lane bridge from opposite ends: each needs the other to back off, neither will, and traffic stops for good. A deadlock is not a crash; the program simply hangs, using no CPU, which makes it confusing to diagnose. Here the second lock is requested with a timeout, so we can see the deadlock instead of hanging forever:</p>
  <div class="fx" data-lang="py">import threading, time

stock_lock = threading.Lock()
ledger_lock = threading.Lock()

def job(name, first, second):
    with first:                                  # take the first lock
        time.sleep(0.1)                          # ...the other thread takes its first lock
        if second.acquire(timeout=1):            # wait at most 1 s for the second
            second.release()
            print(f"{name}: finished")
        else:
            print(f"{name}: stuck, the lock it needs is held by the other thread")

def run(order_b):
    a = threading.Thread(target=job, args=("thread A", stock_lock, ledger_lock))
    b = threading.Thread(target=job, args=("thread B", *order_b))
    a.start(); b.start(); a.join(); b.join()

print("opposite order:")
run((ledger_lock, stock_lock))
print("same order:")
run((stock_lock, ledger_lock))</div>
  <div class="fx" data-lang="text">opposite order:
thread A: stuck, the lock it needs is held by the other thread
thread B: finished
same order:
thread A: finished
thread B: finished</div>
  <p>With the locks taken in opposite orders, thread A held the stock lock and waited for the ledger lock, while B held the ledger lock and waited for the stock lock. After its one-second timeout A gave up and released its lock, which is the only reason B could then finish; without the timeout both would have waited forever. With both threads taking the locks in the same order, there is no cycle and both finished. Deadlock needs four conditions at once: resources that only one thread can hold (mutual exclusion), threads holding one resource while waiting for another (hold and wait), no way to take a resource away from a thread (no preemption), and a cycle of threads each waiting for the next (circular wait). Break any one and deadlock cannot happen. The most common practical fixes are to always acquire locks in one agreed order, to hold as few locks as possible for as short a time as possible, and to use timeouts. Databases meet the same problem with row locks in transactions and solve it by detecting the cycle and cancelling one of the transactions. More on locks is in <a class="xref" data-note="py_threading">Threading</a>.</p>

  <h2 id="cfo-files"><span class="num">08</span>Files, Permissions and Environment Variables</h2>
  <p>A disk is, physically, just a huge numbered array of storage blocks. Programs, however, want named files in folders. Providing that view is the job of a <strong>file system</strong>: the part of the OS that organises a disk's raw blocks into named files and directories, keeps track of which blocks belong to which file, and records information about each file such as its size, owner and permissions. Common ones are ext4 and XFS on Linux, APFS on macOS and NTFS on Windows; how they lay data out on the disk is covered in <a class="xref" data-note="cf_storage">Storage: HDD, SSD &amp; File Systems</a>. From a program's point of view, the OS offers a simple, uniform interface: open a file by name, get a file descriptor, read and write bytes, close it, exactly as the <code>strace</code> output showed. Unix systems push this idea further with the motto "everything is a file": the terminal, pipes between programs, network connections and even the kernel's process information under <code>/proc</code> are all used through the same file-descriptor calls.</p>
  <p>On a machine shared by many users and services, the OS must also decide who may use each file. Unix-style systems attach three pieces of information to every file: an <strong>owner</strong> (a user), a <strong>group</strong>, and a set of <strong>permissions</strong> saying what the owner, the group and everybody else may do. There are three kinds of access: <strong>r</strong>ead, <strong>w</strong>rite and e<strong>x</strong>ecute (for a directory, "execute" means being allowed to enter it). It is like a building where each room has a sign saying what the owner, the owner's team and visitors may do inside. The kernel checks these permissions on every <code>open</code>. Here a private file is created and another user, <code>nobody</code>, tries to read it:</p>
  <div class="fx" data-lang="text">$ ls -l report.py sales.csv
-rw-r--r-- 1 root root   347 Nov 19 05:33 report.py
-rw-r--r-- 1 root root 20584 Nov 19 05:26 sales.csv
$ echo "salaries" &gt; private.txt &amp;&amp; chmod 600 private.txt &amp;&amp; ls -l private.txt
-rw------- 1 root root 9 Nov 19 05:33 private.txt
$ runuser -u nobody -- cat private.txt
cat: private.txt: Permission denied
$ chmod 644 private.txt &amp;&amp; runuser -u nobody -- cat private.txt
salaries</div>
  <p>Read the permission string <code>-rw-r--r--</code> in groups of three after the first character (which is <code>-</code> for a normal file and <code>d</code> for a directory): the owner, root, may read and write (<code>rw-</code>), the group may only read (<code>r--</code>), and everyone else may only read (<code>r--</code>). After <code>chmod 600</code>, the private file shows <code>-rw-------</code>: only the owner can do anything, so the kernel refused <code>nobody</code>'s read with "Permission denied". After <code>chmod 644</code> the same command succeeded. The numbers are a shorthand where read = 4, write = 2 and execute = 1 are added up for each group, so 6 = rw, 4 = r, 7 = rwx and 0 = nothing; 755 (<code>rwxr-xr-x</code>) is the usual setting for scripts and directories. One warning: the user <code>root</code> bypasses these checks, which is why this demonstration had to switch to another user to see the refusal, and why running everything as root, which is common inside Docker containers, hides permission mistakes until the code reaches a properly locked-down server. The commands for managing permissions are in <a class="xref" data-note="se_linux">Linux &amp; Terminal</a>.</p>
  <p>The report job also needs settings: which database to connect to, where to write the output, maybe an API key. Hard-coding them in the script means editing code for every machine. The OS provides a standard way to pass such settings to a program: <strong>environment variables</strong>, a set of named text values that every process carries and that is copied to each child process it starts. When you run a program, it receives a copy of its parent's environment. Some variables are set by the system, such as <code>HOME</code> (your home folder) and <code>PATH</code> (the list of folders the shell searches to find a command when you type its name):</p>
  <div class="fx" data-lang="py">import os, subprocess

print("HOME =", os.environ["HOME"])
print("python3 is found via PATH at:", subprocess.run(["which", "python3"], capture_output=True, text=True).stdout.strip())

os.environ["REPORT_MODE"] = "nightly"            # set in THIS process
code = "import os; print('child sees REPORT_MODE =', os.environ.get('REPORT_MODE')); os.environ['REPORT_MODE'] = 'changed'"
print(subprocess.run(["python3", "-c", code], capture_output=True, text=True).stdout.strip())
print("parent still has REPORT_MODE =", os.environ["REPORT_MODE"])</div>
  <div class="fx" data-lang="text">HOME = /root
python3 is found via PATH at: /usr/local/bin/python3
child sees REPORT_MODE = nightly
parent still has REPORT_MODE = nightly</div>
  <p>The process read <code>HOME</code> from its environment, and the shell's <code>PATH</code> search found the <code>python3</code> program in <code>/usr/local/bin</code>. Then the parent set <code>REPORT_MODE</code>, and the child process it started saw the value, because a child gets a copy of its parent's environment at the moment it starts. The child then changed the variable, but the parent still had <code>nightly</code>: the copy flows only from parent to child, never back. This explains a classic puzzle, why running a script that sets a variable does not change your terminal: the script runs in a child process, and its environment disappears when it exits (which is why the shell has <code>source</code>, to run a file inside the current shell instead). Environment variables are how configuration reaches programs in Docker containers, Kubernetes pods, CI pipelines and cloud functions, following the common rule of keeping configuration and secrets out of the code. In Python you read them with <code>os.environ.get("NAME", default)</code>.</p>

  <h2 id="cfo-signals"><span class="num">09</span>Signals, Services and Daemons</h2>
  <p>Your report job is running and you realise it is reading the wrong file. You press Ctrl+C. How does that keypress, which arrives at the terminal, reach a running Python program and stop it? And when a server shuts down or Kubernetes replaces a pod, how does the OS tell hundreds of running programs to stop, and give them a chance to save their work first?</p>
  <p>The mechanism is the <strong>signal</strong>: a small, numbered notification that the kernel delivers to a process to tell it that some event has happened. A signal interrupts whatever the process is doing, and the process can either run a function of its own to handle it (a signal handler), ignore it, or let the default action happen, which for most signals is to terminate. It is like a tap on the shoulder: short, it carries no message other than its type, and it makes you stop what you are doing for a moment. The important ones are <strong>SIGINT</strong> (signal 2), sent when you press Ctrl+C in a terminal, which Python turns into a <code>KeyboardInterrupt</code> exception; <strong>SIGTERM</strong> (15), the polite "please shut down" request, sent by default by the <code>kill</code> command, by <code>docker stop</code> and by Kubernetes; and <strong>SIGKILL</strong> (9), sent by <code>kill -9</code>, which cannot be caught, handled or ignored: the kernel simply removes the process. Here the report job is replaced by a stand-in that sleeps, and each signal is sent to a fresh copy of it:</p>
  <div class="fx" data-lang="py">import signal, subprocess, time

# a long-running "report job" that reacts to signals
job = '''
import signal, sys, time
def on_term(signum, frame):
    print("SIGTERM handler: saving progress, exiting cleanly", flush=True)
    sys.exit(0)
signal.signal(signal.SIGTERM, on_term)
try:
    time.sleep(30)
except KeyboardInterrupt:
    print("KeyboardInterrupt raised, cleaning up", flush=True)
    sys.exit(1)
'''

for sig in (signal.SIGINT, signal.SIGTERM, signal.SIGKILL):
    p = subprocess.Popen(["python3", "-c", job], stdout=subprocess.PIPE, text=True)
    time.sleep(0.5)                         # let it start
    p.send_signal(sig)                      # what kill -s does
    out, _ = p.communicate()
    print(f"{sig.name:7} (signal {sig.value:&gt;2}) -&gt; exit code {p.returncode:&gt;2}: {out.strip() or 'nothing printed, killed instantly'}")</div>
  <div class="fx" data-lang="text">SIGINT  (signal  2) -&gt; exit code  1: KeyboardInterrupt raised, cleaning up
SIGTERM (signal 15) -&gt; exit code  0: SIGTERM handler: saving progress, exiting cleanly
SIGKILL (signal  9) -&gt; exit code -9: nothing printed, killed instantly</div>
  <p>SIGINT raised <code>KeyboardInterrupt</code> inside the sleeping job, the <code>except</code> block ran, and the job exited with code 1. SIGTERM ran the handler the job had registered with <code>signal.signal</code>, which is where a real job would save its progress, finish writing its file or close its database connection, and it exited cleanly with 0. SIGKILL printed nothing at all: the process got no chance to run any code, and Python reports the exit code as −9, meaning "killed by signal 9". In a shell or Docker the same death is reported as exit code 137, which is 128 + 9. So the right way to stop a program is SIGTERM first, wait a few seconds, and only then SIGKILL, which is exactly what <code>docker stop</code> and Kubernetes do (Kubernetes waits 30 seconds by default). Any long-running Python service, such as a queue worker or a training job that saves checkpoints, should handle SIGTERM so it can stop gracefully.</p>
  <p>Not every program is started by a person at a terminal. A database, a web server, a scheduler that runs your report every night, and the SSH server that lets you log in all need to start when the machine boots, keep running with nobody logged in, and be restarted if they crash. A program like this, running in the background without a terminal, is called a <strong>daemon</strong> on Unix systems (the name comes from helpful background spirits in Greek myth, and daemons traditionally have names ending in "d", such as <code>sshd</code> and <code>crond</code>) and a <strong>service</strong> on Windows; the words are now used interchangeably. On most Linux servers, daemons are managed by <strong>systemd</strong>, the first process the kernel starts. You describe each service in a small unit file (what command to run, which user to run it as, whether to restart it when it fails) and control it with commands such as <code>systemctl start</code>, <code>systemctl status</code> and <code>journalctl</code> for its logs. Inside Docker containers there is usually no systemd at all: the container's main program is process 1, and that is why a container's main process must handle SIGTERM itself, or the container ignores <code>docker stop</code> and is killed after the timeout. The VM used for this page is set up the same way, as the boot section shows.</p>

  <h2 id="cfo-oom"><span class="num">10</span>Running Out of Memory: the OOM Killer</h2>
  <p>You load a large CSV into pandas, the machine goes quiet, and the terminal just prints <code>Killed</code>. There was no Python traceback and no <code>MemoryError</code>. In Kubernetes the same event shows up as a pod status of <code>OOMKilled</code> with exit code 137. Nothing in your code killed the process; the operating system did.</p>
  <p>Linux hands out memory optimistically. When a program asks for memory, the kernel usually says yes immediately but only finds real RAM for each page when the program first writes to it (the reserved-but-untouched gap between <code>VmSize</code> and <code>VmRSS</code> earlier is exactly this). Most of the time this works well, because programs often reserve more than they use. But if the programs on the machine really do touch more memory than exists, and there is no swap space on disk to push pages out to, the kernel has a problem it must solve immediately, or the whole system will freeze. Its last resort is the <strong>OOM killer</strong> (out-of-memory killer): a part of the kernel that, when memory is exhausted, chooses a process and kills it with SIGKILL to free its memory. It is like a lifeboat that is about to sink: someone has to go overboard so that everyone else survives, and the choice is made by a rule, not by asking.</p>
  <div class="fx" data-lang="text">$ grep -E 'MemTotal|MemAvailable|SwapTotal' /proc/meminfo
MemTotal:       16473756 kB
MemAvailable:   15702032 kB
SwapTotal:             0 kB
$ cat /proc/self/oom_score_adj
0</div>
  <p>This VM has about 16 GB of RAM, almost all of it currently available, and no swap at all, so nothing would slow down gradually before the OOM killer stepped in. To choose its victim, the kernel gives every process an <code>oom_score</code>, based mainly on how much memory it is using, and kills the process with the highest score; processes can adjust this with <code>oom_score_adj</code> (from −1000, "never kill me", to 1000, "kill me first"), which is 0 here, so no adjustment. In practice this means the victim is usually the biggest process, which is very often your Python data job. Because the kill is a SIGKILL, Python gets no chance to raise an exception or print a traceback. Containers make this more common, not less: Docker and Kubernetes set a memory limit for each container using cgroups, and a container that goes over its own limit is OOM-killed even if the machine has free memory left. You can confirm an OOM kill with <code>dmesg</code>, which shows a kernel message naming the killed process, or with <code>kubectl describe pod</code>. The remedies are the obvious ones: load less at once (read files in chunks, select only the needed columns, use smaller data types), or give the job more memory. How memory itself is organised is in <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a>.</p>

  <h2 id="cfo-boot"><span class="num">11</span>The Boot Process</h2>
  <p>When you press the power button, memory is empty and the processor knows nothing about operating systems, so something has to bring the OS in step by step. This is called <strong>booting</strong>, from the old phrase "pulling yourself up by your bootstraps". First the motherboard's built-in <strong>firmware</strong> (UEFI, or the older BIOS), a small program stored in a chip, checks the hardware and finds a disk to start from. It loads a <strong>bootloader</strong> such as GRUB, whose job is to find the kernel file on the disk, load it into memory and start it. The kernel then sets up memory management, detects the CPUs and devices and loads their drivers, mounts the main file system, and finally starts the first user-space program, process 1 (usually <strong>systemd</strong> on Linux), which then starts all the services and, on a desktop, the login screen. The kernel keeps a log of its own start-up, which <code>dmesg</code> shows, with timestamps in seconds since the kernel started:</p>
  <div class="fx" data-lang="text">$ dmesg | grep -E 'Linux version|smpboot: Total|Run .* as init' | cut -c1-65
[    0.000000] Linux version 6.18.44-fc-v653 (builder@sandboxing)
[    0.650672] smpboot: Total of 4 processors activated (16800.00
[    1.102916] Run /process_api as init process
$ ps -p 1 -o pid,comm
  PID COMMAND
    1 process_api
$ systemctl status 2&gt;&amp;1 | head -1
System has not been booted with systemd as init system (PID 1). Can't operate.</div>
  <p>At time 0 the kernel announced itself, after 0.65 seconds it had brought all 4 CPU cores online, and at about 1.1 seconds it started its first user-space program. This machine is a lightweight virtual machine, so there is no physical firmware and no bootloader to see, and process 1 is not systemd but a small control program used by the VM platform, which is why <code>systemctl</code> reports that the system was not booted with systemd. A Docker container goes even further and does not boot at all: it reuses the host's already running kernel and simply starts one program as its process 1, which is why containers start in a fraction of a second while a full machine takes much longer (see <a class="xref" data-note="se_docker">Docker</a>).</p>

  <h2 id="cfo-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common OS-related mistake in Python work is using threads to speed up CPU-heavy pure-Python code. Because of the GIL, the threads take turns instead of running in parallel, so the program is no faster and often slower, as the counting example showed. If the work is computation in Python, use processes; if it is waiting on I/O, threads or <code>asyncio</code> are right; and if it is NumPy or pandas work, the library may already be using several cores for you.</p>
  <p>A second mistake is sharing data between processes as if they were threads. A global list updated inside <code>multiprocessing</code> workers stays empty in the parent, because each worker changed its own copy:</p>
  <div class="fx" data-lang="py">from multiprocessing import Pool

results = []

def total_for(shop):
    results.append(shop)              # changes the WORKER's copy only
    return shop, len(shop) * 100

if __name__ == "__main__":
    with Pool(3) as pool:
        returned = pool.map(total_for, ["north", "south", "east"])
    print("global list in parent:", results)        # mistake: still empty
    print("returned values      :", returned)       # fix: return and collect</div>
  <div class="fx" data-lang="text">global list in parent: []
returned values      : [('north', 500), ('south', 500), ('east', 400)]</div>
  <p>Each worker process appended to its own copy of <code>results</code>, which vanished when the worker ended, so the parent's list is still empty. The fix is to return values from the worker function and collect them, as <code>pool.map</code> does, or to use a queue.</p>
  <p>A third mistake is killing processes with <code>kill -9</code> (SIGKILL) as a first move. It gives the program no chance to finish writing files, release locks or close connections, which can leave half-written outputs and stale lock files behind. Send SIGTERM (plain <code>kill</code>) first, give the program a few seconds, and keep SIGKILL for programs that do not respond. The mirror-image mistake is writing a long-running service or container entrypoint that ignores SIGTERM, so it is always killed abruptly after the timeout.</p>
  <p>Several smaller mistakes come up again and again. Expecting a script to change your shell's environment variables does not work, because the script is a child process and changes flow only downwards. Treating a bare <code>Killed</code> message as a Python bug wastes time; it is usually the OOM killer, and <code>dmesg</code> or the container status will confirm it. Fixing "Permission denied" with <code>chmod 777</code> gives every user on the machine write access and is a security hole; give the right user the access it needs instead. And creating far more busy threads or processes than there are CPU cores rarely helps, because the extra ones just add context switches.</p>

  <h2 id="cfo-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core definitions</h3>
  <ul>
    <li><b>Operating system</b>: software that manages the hardware and shares it safely among programs (Windows, macOS, Linux).</li>
    <li><b>Kernel</b>: the core of the OS; always in memory, full control of the hardware (scheduling, memory, files, drivers, networking).</li>
    <li><b>Kernel mode / user mode</b>: CPU modes; only kernel mode may run privileged instructions. Programs run in <b>user space</b>.</li>
    <li><b>System call</b>: a program's request to the kernel (<code>openat</code>, <code>read</code>, <code>write</code>, <code>fork</code>, <code>kill</code>). See them with <code>strace</code>.</li>
    <li><b>File descriptor</b>: small integer naming an open file; 0 = stdin, 1 = stdout, 2 = stderr.</li>
    <li><b>Process</b>: a running program with its own PID, address space, open files, user, environment and at least one thread.</li>
    <li><b>Thread</b>: a line of execution inside a process; shares the process's memory, has its own stack and registers.</li>
    <li><b>Context switch</b>: save one thread's CPU state and load another's; voluntary (it waits) or involuntary (time slice used up).</li>
    <li><b>Scheduler</b>: kernel part that picks which thread runs on each core and for how long (<b>time slice</b>, a few ms).</li>
    <li><b>Deadlock</b>: threads each waiting for a resource another holds; needs mutual exclusion, hold and wait, no preemption, circular wait.</li>
    <li><b>Signal</b>: a numbered notification to a process (SIGINT, SIGTERM, SIGKILL).</li>
    <li><b>Daemon / service</b>: background program with no terminal, managed by systemd on most Linux servers.</li>
    <li><b>OOM killer</b>: kernel mechanism that SIGKILLs the highest-scoring process when memory runs out.</li>
  </ul>
  <h3>Process vs thread</h3>
  <table class="tbl">
    <tr><th></th><th>Process</th><th>Thread</th></tr>
    <tr><td>Memory</td><td>private</td><td>shared with its process</td></tr>
    <tr><td>Cost</td><td>heavier to create and switch</td><td>lighter</td></tr>
    <tr><td>Crash</td><td>isolated</td><td>takes the process down</td></tr>
    <tr><td>Python CPU work</td><td>runs in parallel</td><td>GIL: one at a time</td></tr>
    <tr><td>Best for</td><td>CPU-heavy work, isolation</td><td>I/O-bound work, sharing data</td></tr>
  </table>
  <h3>Concurrency vs parallelism</h3>
  <table class="tbl">
    <tr><th>Concurrency</th><th>Parallelism</th></tr>
    <tr><td>several tasks in progress, taking turns</td><td>several tasks executing at the same instant</td></tr>
    <tr><td>possible on one core</td><td>needs several cores</td></tr>
    <tr><td>hides waiting (threads, asyncio)</td><td>adds computing power (processes, GPUs)</td></tr>
  </table>
  <h3>Signals</h3>
  <table class="tbl">
    <tr><th>Signal</th><th>Number</th><th>Sent by</th><th>Can be handled?</th><th>Typical exit code</th></tr>
    <tr><td>SIGINT</td><td>2</td><td>Ctrl+C</td><td>yes (<code>KeyboardInterrupt</code>)</td><td>130 if unhandled</td></tr>
    <tr><td>SIGTERM</td><td>15</td><td><code>kill</code>, <code>docker stop</code>, Kubernetes</td><td>yes</td><td>143 if unhandled</td></tr>
    <tr><td>SIGKILL</td><td>9</td><td><code>kill -9</code>, OOM killer</td><td>no</td><td>137</td></tr>
  </table>
  <h3>Commands and calls</h3>
  <div class="fx" data-lang="py">import os, signal, subprocess, threading

os.getpid(), os.getppid()             # this process and its parent
threading.get_native_id()             # kernel thread id
open("/proc/self/status").read()      # kernel's record of this process (Linux)
os.environ.get("REPORT_MODE", "dev")  # read an environment variable
subprocess.run(["python3", "report.py"])          # start a child process
signal.signal(signal.SIGTERM, handler)            # graceful shutdown
os.nice(10)                           # lower this process's priority

# shell: ps -ef | top | strace -p PID | kill PID | kill -9 PID
#        nice -n 10 cmd | chmod 644 file | ls -l | dmesg | systemctl status svc</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Python threads do not speed up pure-Python CPU work (GIL); use processes.</li>
    <li>Processes do not share variables; return results or use queues.</li>
    <li>Env var changes flow parent → child only.</li>
    <li>SIGTERM first, SIGKILL last; handle SIGTERM in services and containers.</li>
    <li>"Killed" / exit 137 / OOMKilled = the OOM killer, not a Python bug.</li>
    <li>Permissions: r = 4, w = 2, x = 1; root bypasses them; avoid 777.</li>
    <li>More busy threads than cores = more context switches, not more speed.</li>
  </ul>

  <h2 id="cfo-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an operating system, and why do we need one?</summary><div class="qa-body">An OS is the software layer between programs and hardware. It hides hardware details behind simple abstractions such as files and processes, shares the CPU, memory, disk and network among many programs, and protects programs from each other. Without it, every program would have to drive the hardware itself and could interfere with every other program.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the kernel?</summary><div class="qa-body">The kernel is the core of the OS: the program loaded at boot that stays in memory and runs in privileged kernel mode. It does process scheduling, memory management, file systems, networking and device drivers. Everything else, shells, desktops and utilities, is ordinary user-space programs that ask the kernel for services.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between user space and kernel space?</summary><div class="qa-body">Kernel space is memory and execution in the CPU's privileged mode, where the kernel can access all hardware. User space is where ordinary programs run, in an unprivileged mode, each in its own address space. A user program cannot touch hardware or other programs' memory directly; it must make a system call, which switches into kernel mode, does the checked work and returns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a system call? Give some examples.</summary><div class="qa-body">A system call is a request from a program to the kernel for something it cannot do itself. Examples: <code>open</code>/<code>openat</code>, <code>read</code>, <code>write</code>, <code>close</code>, <code>fork</code>, <code>execve</code>, <code>mmap</code>, <code>kill</code>, <code>socket</code>. They are more expensive than function calls because of the switch to kernel mode, which is why I/O is buffered. <code>strace</code> lists the system calls a program makes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a process and a thread?</summary><div class="qa-body">A process is a running program with its own address space, open files and resources; a thread is a unit of execution inside a process. Threads of the same process share memory and files and have only their own stack and registers, so they are cheaper and communicate easily but can cause race conditions. Processes are isolated: a crash in one does not affect others, but sharing data requires copying it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a process own?</summary><div class="qa-body">A PID and a parent PID, a private virtual address space (code, data, heap, stacks), a table of open file descriptors, a user and group identity that decides its permissions, environment variables, a current directory, signal handlers, and one or more threads. The kernel keeps this in a process control block, partly visible on Linux under <code>/proc/&lt;pid&gt;</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do fork and exec do?</summary><div class="qa-body"><code>fork()</code> creates a child process that is a copy of the parent; it returns 0 in the child and the child's PID in the parent. Memory is shared copy-on-write, so copying is cheap until someone writes. <code>exec()</code> replaces the current process's program with a new one. A shell runs a command by forking and then exec-ing the command in the child.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are zombie and orphan processes?</summary><div class="qa-body">A zombie is a process that has exited but whose parent has not yet collected its exit status with <code>wait</code>; it holds only a process-table entry. An orphan is a process whose parent died first; it is adopted by process 1, which reaps it when it ends. Many zombies usually mean a parent program that never waits for its children.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a context switch, and why is it expensive?</summary><div class="qa-body">A context switch saves the running thread's state (instruction pointer, registers, stack pointer) and restores another's so it can continue; switching between processes also changes the memory mappings. The direct cost is a few microseconds, and the indirect cost is that CPU caches and the TLB now hold the wrong data. Too many runnable threads means more time spent switching than working.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between concurrency and parallelism?</summary><div class="qa-body">Concurrency means multiple tasks are in progress over the same period, interleaved, possibly on a single core. Parallelism means multiple tasks execute at the same instant on multiple cores. Concurrency is a way of structuring work so waiting is not wasted; parallelism is a way of doing more work per second. In Python, threads and asyncio give concurrency; processes give parallelism for Python code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't Python threads speed up CPU-bound code?</summary><div class="qa-body">CPython's Global Interpreter Lock allows only one thread to execute Python bytecode at a time in a process, so CPU-bound threads take turns and add switching overhead. Threads still help I/O-bound work because the GIL is released while waiting. For CPU-bound Python use <code>multiprocessing</code> or <code>ProcessPoolExecutor</code>, or libraries like NumPy that release the GIL in C code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CPU scheduling work? What is a time slice?</summary><div class="qa-body">The scheduler picks which ready thread runs on each core. Each thread gets a time slice of a few milliseconds; when it ends, a timer interrupt lets the kernel preempt the thread and choose another, and a thread that blocks on I/O gives up the CPU early. Linux's scheduler aims for fairness, giving the CPU to the thread that has had the least time, weighted by priority (nice value −20 to 19).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is preemptive multitasking?</summary><div class="qa-body">The OS can take the CPU away from a running program at any time, using a timer interrupt, rather than waiting for the program to give it up. This prevents one misbehaving program from freezing the system and keeps interactive programs responsive. Cooperative multitasking, where programs yield voluntarily, was used in older systems and still appears inside programs, for example in asyncio.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deadlock and how do you prevent it?</summary><div class="qa-body">A deadlock is when threads each hold a resource and wait for one another holds, so none can continue. It needs four conditions: mutual exclusion, hold and wait, no preemption and circular wait. Prevent it by breaking one of them, most commonly by always acquiring locks in the same global order; also keep lock scopes small and use timeouts. Databases detect deadlock cycles and abort one transaction.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does chmod 755 mean?</summary><div class="qa-body">Each digit is the sum of read (4), write (2) and execute (1) for owner, group and others. 755 is <code>rwxr-xr-x</code>: the owner can read, write and execute; group and others can read and execute but not modify. It is typical for scripts and directories; 644 (<code>rw-r--r--</code>) is typical for ordinary files.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are environment variables, and why doesn't a script that sets one change my shell?</summary><div class="qa-body">Environment variables are named string settings that every process carries and passes a copy of to the children it starts; they are the standard way to give configuration and secrets to programs and containers. A script runs as a child process, so it changes only its own copy, which disappears when it exits. To change the current shell you <code>source</code> the file instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between SIGTERM and SIGKILL? What does Ctrl+C send?</summary><div class="qa-body">SIGTERM (15) asks a process to terminate and can be caught, so the program can clean up and exit gracefully. SIGKILL (9) cannot be caught or ignored; the kernel ends the process immediately with no cleanup. Ctrl+C sends SIGINT (2), which Python turns into <code>KeyboardInterrupt</code>. Docker and Kubernetes send SIGTERM, wait a grace period, then send SIGKILL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a daemon, and what is systemd?</summary><div class="qa-body">A daemon is a background process with no controlling terminal that provides a service, such as <code>sshd</code> or a database server. systemd is the init system (process 1) on most Linux distributions; it starts services at boot, restarts them when they fail, and manages them through unit files and <code>systemctl</code>, with logs in <code>journalctl</code>. Containers usually have no systemd; the main program is process 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>My Python job printed only "Killed" (or the pod shows OOMKilled, exit code 137). What happened?</summary><div class="qa-body">The kernel's OOM killer, or the container's cgroup memory limit, ended the process with SIGKILL because memory ran out; 137 = 128 + 9. There is no traceback because SIGKILL cannot be caught. Confirm with <code>dmesg</code> or <code>kubectl describe pod</code>, then reduce memory use (chunked reading, fewer columns, smaller dtypes) or raise the memory limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when a computer boots?</summary><div class="qa-body">The firmware (UEFI or BIOS) runs from a chip, checks hardware and finds a boot disk. It loads a bootloader such as GRUB, which loads the kernel into memory. The kernel initialises memory, CPUs and drivers, mounts the root file system and starts process 1 (usually systemd), which starts the system's services and the login screen.</div></details>
</main>
`
});
