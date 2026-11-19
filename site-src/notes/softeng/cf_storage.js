// notes/softeng/cf_storage.js — Storage: HDD, SSD & File Systems
Object.assign(TOPIC_CONTENT, {
  "cf_storage": `<main>
<h1>Storage: HDD, SSD &amp; File Systems</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>Storage: HDD, SSD &amp; File Systems</span></div>
  <p class="lead">Storage is the part of the computer that remembers things when the power is off: your code, your datasets, your trained models, the database behind a website. Almost every data job begins by reading from storage and ends by writing to it, and in data engineering the time spent waiting for storage often matters more than the time spent computing. Understanding storage explains everyday puzzles: why the same file loads much faster the second time, why a folder of a hundred thousand small files is painfully slow, why a "saved" file can still be lost in a power cut, and why data teams convert CSV files to Parquet and keep them in S3. The page follows one running example: the orders file of a chain of chai shops, <code>orders.csv</code>, from the moment it is written to disk, through reading it fast, keeping it safe, and finally storing it in a cloud data lake in a better format. All commands and benchmarks were run on this page's Linux machine, which is a virtual machine, so its disk is a virtual disk and the numbers are approximate.</p>

  <h2 id="cfs-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Storage</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Devices</div>
        <ul>
          <li>Storage is persistent; RAM is not</li>
          <li><b>HDD</b>: spinning platters, seek + rotation ≈ 5–15 ms</li>
          <li><b>SSD</b>: NAND flash, no moving parts, wears with writes</li>
          <li>SATA (old, ~550 MB/s) vs NVMe (PCIe, GB/s)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Performance</div>
        <ul>
          <li>Sequential ≫ random, especially on HDD</li>
          <li><b>IOPS</b> = operations/s; <b>throughput</b> = MB/s</li>
          <li>OS <b>page cache</b> makes repeat reads come from RAM</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">File systems</div>
        <ul>
          <li>Files → blocks (4 KB) + <b>inode</b> (metadata)</li>
          <li>Directories map names to inodes</li>
          <li>Many tiny files: per-file overhead dominates</li>
          <li>"Saved" needs <code>fsync</code>; atomic write = temp + rename</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">At scale</div>
        <ul>
          <li>RAID: redundancy or speed, never a backup</li>
          <li>Block vs file vs object (S3/GCS) storage</li>
          <li>Data lakes = object storage + Parquet</li>
          <li>Columnar + compression: smaller, faster reads</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfs-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Storage vs Memory</span><span class="rm-sub">why computers need a second kind of memory</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-hdd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hard Disk Drives</span><span class="rm-sub">platters, heads, seek time and rotational latency</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-ssd"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Solid State Drives</span><span class="rm-sub">flash memory, wear, SATA vs NVMe, HDD vs SSD</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-io"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Sequential vs Random I/O</span><span class="rm-sub">IOPS, throughput and the page cache, measured</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-fs"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">File Systems</span><span class="rm-sub">files, directories, blocks, inodes, tiny files</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-dur"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Durability: Buffers and fsync</span><span class="rm-sub">what "saved" really means</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-raid"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">RAID and Backups</span><span class="rm-sub">surviving a dead disk, and everything else</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-obj"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Block, File and Object Storage</span><span class="rm-sub">disks, shared folders and S3</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-fmt"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Compression and Columnar Formats</span><span class="rm-sub">CSV vs gzip vs Parquet, measured</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">unflushed files, open deleted files, warm benchmarks</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">numbers, comparisons, commands</span></div></div>
      <div class="rm-item rm-done" data-target="cfs-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the storage questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="cfs-what"><span class="num">01</span>Storage vs Memory</h2>
  <p>RAM, the computer's main memory, is fast but <strong>volatile</strong>: it forgets everything the moment the power goes off (the reasons are in <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a>). A computer that could only use RAM would lose your files, your installed programs and even its own operating system every time it was switched off. It also could not hold very much, because RAM costs several times more per gigabyte than disk space. So computers need a second kind of memory that is large, cheap and keeps its contents without power. That is <strong>storage</strong>: devices such as hard disk drives and solid state drives that hold data <strong>persistently</strong>, meaning it survives power loss and reboots, for years if necessary.</p>
  <p>The workshop analogy from the memory page continues here. RAM is the workbench: everything you are actively working on is spread out on it, within easy reach, and it is cleared every night. Storage is the set of cupboards and the warehouse: everything you own is kept there safely, but you must fetch it to the bench before you can work on it and put it back when you want to keep the result. When our script runs <code>pd.read_csv("orders.csv")</code>, it fetches the file from storage into RAM; when it runs <code>df.to_parquet(...)</code>, it puts a result back into the cupboard. Programs constantly move data between the two, and that movement, called <strong>I/O</strong> (input/output), is what this page is about.</p>
  <p>The price of persistence is speed. Reading from storage takes anything from tens of microseconds on a fast SSD to around ten milliseconds on a hard disk, against about a hundred nanoseconds for RAM: hundreds to a hundred thousand times slower. That is why programs load data into RAM to work on it, and why so much engineering goes into reading from storage efficiently. On Linux, <code>df -h</code> ("disk free", in human-readable units) lists the storage devices that are attached and how full they are, and <code>lsblk</code> lists the block devices (disks) themselves:</p>
  <div class="fx" data-lang="text">$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        252G   29G  9.7G  75% /
$ lsblk -d -o NAME,SIZE,ROTA /dev/vda
NAME  SIZE ROTA
vda   256G    1
$ findmnt -no FSTYPE,OPTIONS /
ext4   rw,noatime,discard,no_prefetch_block_bitmaps,resv_strict,resuid=65534,resgid=65534</div>
  <p>This machine's main disk is <code>/dev/vda</code>, a 256 GB virtual disk (the "v" is for virtual; on a physical server you would see names like <code>sda</code> for a SATA disk or <code>nvme0n1</code> for an NVMe SSD). It is mounted at <code>/</code>, the root of the file system. "Avail" is much less than Size minus Used because this file system holds a large amount of space in reserve, a quirk of this VM's setup. The <code>ROTA</code> column is 1, which would normally mean "rotational", a spinning hard disk, but virtual disks often report 1 by default whatever the host really uses, so on a VM this flag tells you little. The last command, <code>findmnt</code>, shows which file system is on the disk (ext4) and the options it was mounted with; we will meet two of them, <code>noatime</code> and <code>discard</code>, later. To see what really sits underneath, we first need to understand the two kinds of device.</p>

  <h2 id="cfs-hdd"><span class="num">02</span>Hard Disk Drives</h2>
  <p>A <strong>hard disk drive</strong> (HDD) stores data magnetically on spinning metal or glass discs called <strong>platters</strong>, coated with a thin magnetic layer. Each bit is a tiny region magnetised one way or the other. The data is arranged in concentric rings called <strong>tracks</strong>, and each track is divided into small pieces called <strong>sectors</strong> (traditionally 512 bytes, 4,096 bytes on modern drives), which are the smallest units the drive reads or writes. A <strong>read/write head</strong>, mounted on an arm, floats a few nanometres above the spinning surface; it reads bits by sensing the magnetism and writes them by changing it. HDDs were invented in the 1950s and are still made because they are the cheapest way to store huge amounts of data.</p>
  <figure class="viz"><svg viewBox="0 0 620 250" width="620"><defs><marker id="cfs-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
<circle cx="150" cy="125" r="100" class="fs"/>
<circle cx="150" cy="125" r="80" fill="none" stroke="currentColor" stroke-dasharray="3 3" opacity="0.5"/>
<circle cx="150" cy="125" r="60" fill="none" stroke="currentColor" stroke-dasharray="3 3" opacity="0.5"/>
<circle cx="150" cy="125" r="40" fill="none" stroke="currentColor" stroke-dasharray="3 3" opacity="0.5"/>
<path d="M219.3,85 A80,80 0 0,1 228.8,111.1 L209.1,114.6 A60,60 0 0,0 202,95 Z" class="fr sr"/>
<circle cx="150" cy="125" r="10" class="fb sb"/>
<path d="M58,165 A100,100 0 0,0 105,215" fill="none" class="sb" stroke-width="1.5" marker-end="url(#cfs-a1)" transform="translate(-14,6)"/>
<line x1="335" y1="215" x2="222" y2="104" stroke="currentColor" stroke-width="4"/>
<circle cx="335" cy="215" r="9" class="fv"/>
<rect x="213" y="96" width="14" height="10" class="fv"/>
<text x="370" y="40" font-size="11">track: one ring of data</text>
<text x="370" y="62" font-size="11" class="tr">sector: the smallest readable block</text>
<text x="370" y="96" font-size="11">head on an arm (hovers, never touches)</text>
<text x="370" y="130" font-size="11" class="tb">seek time: swing the arm to the track</text>
<text x="370" y="148" font-size="11" class="tm">(~3–12 ms)</text>
<text x="370" y="182" font-size="11" class="tb">rotational latency: wait for the sector</text>
<text x="370" y="200" font-size="11" class="tm">to spin under the head (~2–6 ms)</text>
<text x="20" y="245" font-size="10" class="tm">platter spins at 5,400–15,000 rpm</text>
</svg><figcaption>One platter seen from above. To read the red sector, the arm must first swing the head to the right track (seek), then wait for the sector to rotate underneath it (rotational latency). Only then does the transfer begin.</figcaption></figure>
  <p>Reading a sector therefore involves real mechanical movement, in two steps. First the arm swings to the correct track; this is the <strong>seek time</strong>, typically 3–12 ms depending on the drive and how far the arm must travel. Then the head must wait until the wanted sector spins round underneath it; this is the <strong>rotational latency</strong>. On average the sector is half a turn away, so the average rotational latency is the time of half a revolution. Only then does the data transfer, which is fast once it starts. Think of a record player whose needle must be lifted, moved to the right song, and then wait for the right moment in the groove to come round. The arithmetic for common drive speeds, measured in rpm (revolutions per minute), is simple:</p>
  <div class="fx" data-lang="py"># Average time to reach one random spot on a hard disk = seek + half a rotation
drives = [(5400, 12.0), (7200, 8.5), (15000, 3.5)]   # (rpm, typical average seek in ms)
for rpm, seek_ms in drives:
    rotation_ms = 60_000 / rpm                  # one full turn, in milliseconds
    rot_latency = rotation_ms / 2               # on average we wait half a turn
    access = seek_ms + rot_latency
    print(f"{rpm:5} rpm: one turn {rotation_ms:5.2f} ms, avg wait {rot_latency:4.2f} ms, "
          f"seek {seek_ms:4.1f} ms -&gt; random access ~{access:5.2f} ms = ~{1000 / access:3.0f} IOPS")</div>
  <div class="fx" data-lang="text"> 5400 rpm: one turn 11.11 ms, avg wait 5.56 ms, seek 12.0 ms -&gt; random access ~17.56 ms = ~ 57 IOPS
 7200 rpm: one turn  8.33 ms, avg wait 4.17 ms, seek  8.5 ms -&gt; random access ~12.67 ms = ~ 79 IOPS
15000 rpm: one turn  4.00 ms, avg wait 2.00 ms, seek  3.5 ms -&gt; random access ~ 5.50 ms = ~182 IOPS</div>
  <p>A common 7,200 rpm drive takes 8.33 ms per revolution, so the average wait for a sector is 4.17 ms; add an 8.5 ms seek and each random read takes about 12.7 ms, so the drive can do only about 80 random reads per second. Even an expensive 15,000 rpm server drive manages under 200. That number, operations per second, is called <strong>IOPS</strong> (input/output operations per second), and it is the hard disk's great weakness. Its strength is reading data that is laid out in order along a track: once the head is in place, it can stream data continuously as the platter spins, at 150–250 MB/s, with no further waiting. The whole difference between sequential and random access, which we measure later, comes from these moving parts.</p>
  <p>Hard disks are still everywhere that capacity matters more than speed: backup systems, archives, and the huge storage clusters behind cloud object storage, where a 20 TB drive costs far less per terabyte than an SSD. They are also fragile in a way SSDs are not: dropping a running drive can make the head touch the platter (a "head crash") and destroy data. For your laptop and for anything that needs fast random access, such as databases, the SSD has replaced them.</p>

  <h2 id="cfs-ssd"><span class="num">03</span>Solid State Drives</h2>
  <p>A <strong>solid state drive</strong> (SSD) stores data in <strong>NAND flash memory</strong>: chips made of billions of tiny cells, each of which traps a small electrical charge in an insulated layer. Unlike the charge in RAM, the trapped charge stays for years without power, which is what makes flash persistent. "Solid state" means there are no moving parts: reading a block means sending electrical signals to the right cells, not moving an arm and waiting for a platter. So the 5–15 ms of mechanical delay disappears, and a random read takes tens of microseconds. An SSD also contains a small processor called the <strong>controller</strong>, which runs its own software to manage the flash, and many flash chips that it reads in parallel, which is why SSDs are fast for random access and even faster when given many requests at once.</p>
  <p>Flash has peculiar rules for writing, and they explain why SSDs wear out. Cells are grouped into <strong>pages</strong> (typically 4–16 KB), the smallest unit that can be read or written, and pages are grouped into <strong>erase blocks</strong> of hundreds of pages. A page cannot be overwritten in place: it must be erased first, and erasing works only on a whole block at a time. So when you modify a file, the controller writes the new data to a fresh, already-erased page elsewhere, marks the old page as stale, and later, in the background, copies the still-valid pages out of mostly-stale blocks so that whole blocks can be erased. This background tidying is called <strong>garbage collection</strong> (the same idea as in programming languages, applied to flash pages), and the extra internal writes it causes are called <strong>write amplification</strong>. The <strong>TRIM</strong> command lets the operating system tell the SSD which blocks belong to deleted files, so it does not waste effort preserving them; this machine's root file system is mounted with the <code>discard</code> option, which sends TRIM automatically. Think of a notebook written in pen: you cannot erase a single line, so you cross it out and write the new version on a fresh page, and when the notebook fills with crossings-out you copy the live lines into a new notebook and recycle the old one.</p>
  <p>Each erase slightly damages a cell's insulating layer, so every flash cell survives only a limited number of program/erase cycles, from about a hundred thousand for the oldest SLC flash (one bit per cell) down to roughly a thousand for today's dense QLC flash (four bits per cell). The controller spreads writes evenly over all the cells, which is called <strong>wear levelling</strong>, so no region wears out early. Manufacturers state the result as an endurance rating in TBW (terabytes written) or DWPD (drive writes per day for the warranty period). For a laptop this is rarely a concern; for a database server or a cache that rewrites the disk constantly, it is a real reason to choose higher-endurance drives.</p>
  <p>SSDs also differ in how they connect to the computer, and the connection can matter as much as the flash. <strong>SATA</strong> is the older interface, designed for hard disks; it carries commands one queue at a time and caps out at about 550 MB/s. <strong>NVMe</strong> (Non-Volatile Memory Express) is a protocol designed for flash that talks over <strong>PCIe</strong>, the same high-speed lanes used by graphics cards, with up to 64,000 command queues so that many requests can be served in parallel. A modern NVMe SSD reads 3–14 GB/s and handles hundreds of thousands to over a million random IOPS. Most cloud instances with "local NVMe" drives, and most new laptops, use NVMe. Putting it all together:</p>
  <table class="tbl">
    <tr><th></th><th>HDD</th><th>SATA SSD</th><th>NVMe SSD</th></tr>
    <tr><td>How it stores data</td><td>magnetic platters, moving head</td><td>NAND flash</td><td>NAND flash</td></tr>
    <tr><td>Random read latency</td><td>~5–15 ms</td><td>~100 µs</td><td>~20–100 µs</td></tr>
    <tr><td>Random 4 KB IOPS</td><td>~80–200</td><td>~50,000–100,000</td><td>~200,000–1,000,000+</td></tr>
    <tr><td>Sequential throughput</td><td>~150–250 MB/s</td><td>~550 MB/s (interface limit)</td><td>~3,000–14,000 MB/s</td></tr>
    <tr><td>Cost per TB</td><td>lowest</td><td>medium</td><td>medium to high</td></tr>
    <tr><td>Wear</td><td>mechanical wear, sensitive to shocks</td><td>limited write cycles</td><td>limited write cycles</td></tr>
    <tr><td>Typical use</td><td>archives, backups, bulk object storage</td><td>older machines, cheap capacity</td><td>laptops, databases, ML training data</td></tr>
  </table>
  <p>The row to remember is random IOPS: an NVMe SSD performs thousands of times more random reads per second than a hard disk, while its sequential speed is "only" ten to fifty times higher. That is why moving a database from HDD to SSD feels transformative, while copying one big file improves less dramatically. In cloud computing you meet the same choices as named disk types: AWS EBS volumes come as gp3 (general SSD), io2 (provisioned-IOPS SSD) and st1/sc1 (throughput-optimised and cold hard disks), each with a stated IOPS and throughput limit (<a class="xref" data-note="mlops_cloud">Cloud for ML</a>).</p>

  <h2 id="cfs-io"><span class="num">04</span>Sequential vs Random I/O</h2>
  <p>Two programs can read exactly the same amount of data from the same disk and take very different times, depending on the order they read it in. <strong>Sequential I/O</strong> means reading or writing data in order, one block after the next, like reading <code>orders.csv</code> from start to end. <strong>Random I/O</strong> means jumping around to scattered locations, like a database fetching individual customers' rows by id. On a hard disk, each jump costs a seek and a rotation; on an SSD, each request has a fixed overhead in the controller and the operating system. Either way, many small scattered requests cost far more than one long stream.</p>
  <p>This is why storage performance is described with two different numbers, and they are not interchangeable. <strong>IOPS</strong> counts how many separate read or write operations the device completes per second; it is what matters for random, small accesses. <strong>Throughput</strong> (or bandwidth) is how many bytes per second flow, usually in MB/s; it is what matters for big sequential transfers. They are linked by the request size: throughput = IOPS × bytes per operation. And a third number, <strong>latency</strong>, is how long one single operation takes. Think of a delivery company: IOPS is how many parcels it delivers per hour, throughput is how many kilograms, and latency is how long one parcel takes to arrive. A company delivering a few huge pallets moves many kilograms but few parcels; one delivering thousands of letters moves many parcels but few kilograms.</p>
  <p>One more thing gets in the way of measuring storage, and it trips up almost everyone the first time. Linux keeps recently read and written file data in spare RAM, called the <strong>page cache</strong> (the "buff/cache" column of <code>free</code>). When you read a file that is already in the page cache, it comes from RAM and never touches the disk. That is why opening the same large CSV is much faster the second time. A fair benchmark must say whether it measured the disk ("cold") or the cache ("warm"). The benchmark below writes a 256 MB test file into a scratch folder, then asks the kernel to forget its cached copy with <code>posix_fadvise(..., POSIX_FADV_DONTNEED)</code> before each cold run. The numbers are approximate, and because this is a virtual machine, the host underneath may cache data too:</p>
  <div class="fx" data-lang="py">import os, random, time

path = "orders.bin"
size = 256 * 1024 * 1024                        # a 256 MB test file
with open(path, "wb") as f:
    t0 = time.perf_counter()
    for _ in range(size // (1024 * 1024)):
        f.write(os.urandom(1024 * 1024))        # 1 MB at a time
    f.flush(); os.fsync(f.fileno())             # make sure it really reached the disk
    t = time.perf_counter() - t0
print(f"sequential write + fsync: {size / t / 1e6:6.0f} MB/s")

def drop_from_cache():
    fd = os.open(path, os.O_RDONLY)             # ask the OS to forget its cached copy
    os.posix_fadvise(fd, 0, 0, os.POSIX_FADV_DONTNEED)
    os.close(fd)

def seq_read():
    with open(path, "rb", buffering=0) as f:
        while f.read(1024 * 1024):              # 1 MB chunks, front to back
            pass

def random_read(n=20_000, block=4096):
    rng = random.Random(0)
    fd = os.open(path, os.O_RDONLY)
    for _ in range(n):
        offset = rng.randrange(size // block) * block
        os.pread(fd, block, offset)             # 4 KB from a random place
    os.close(fd)
    return n

for label in ("cold (from disk)", "warm (page cache)"):
    if label.startswith("cold"):
        drop_from_cache()
    t0 = time.perf_counter(); seq_read(); t = time.perf_counter() - t0
    print(f"{label:18} sequential read 1 MB chunks: {size / t / 1e6:6.0f} MB/s")

for label in ("cold (from disk)", "warm (page cache)"):
    if label.startswith("cold"):
        drop_from_cache()
    t0 = time.perf_counter(); n = random_read(); t = time.perf_counter() - t0
    print(f"{label:18} random 4 KB reads: {n / t:8.0f} IOPS = {n * 4096 / t / 1e6:5.0f} MB/s")
os.remove(path)</div>
  <div class="fx" data-lang="text">sequential write + fsync:    288 MB/s
cold (from disk)   sequential read 1 MB chunks:   2604 MB/s
warm (page cache)  sequential read 1 MB chunks:   8566 MB/s
cold (from disk)   random 4 KB reads:    26333 IOPS =   108 MB/s
warm (page cache)  random 4 KB reads:   639125 IOPS =  2618 MB/s</div>
  <p>There is a lot in these six lines. Writing 256 MB and forcing it to disk with <code>fsync</code> ran at a couple of hundred MB/s. Reading it back sequentially in 1 MB chunks from the disk ran in the low gigabytes per second, a figure only an SSD-backed disk can reach, which tells us the virtual disk sits on fast flash despite the <code>ROTA</code> flag. Random 4 KB reads from the cold disk achieved about twenty thousand IOPS, but because each operation moves only 4 KB, that is under 100 MB/s, more than twenty times less throughput than sequential reading of the same file. This is the sequential-versus-random gap on an SSD; on a hard disk the same random test would manage about 80 IOPS, a third of a megabyte per second. Finally, the warm runs show the page cache: the same random reads served from RAM ran at around half a million IOPS, more than twenty times faster than the disk, and sequential reads also sped up. Every "my code got faster on the second run" story starts here.</p>
  <p>The practical lessons follow directly. Prefer formats and access patterns that read large contiguous chunks: one big file read front to back beats many small reads. Databases use indexes precisely so that finding a row needs a few random reads instead of a scan, and they keep hot data in their own memory cache (<a class="xref" data-note="sql_optimization">SQL Query Optimization</a>). When you read about a cloud disk's "3,000 IOPS and 125 MB/s", you now know these are two separate limits, and a workload of tiny random reads will hit the first long before the second. And when you benchmark anything that touches files, run it more than once and say whether the cache was warm.</p>

  <h2 id="cfs-fs"><span class="num">05</span>File Systems</h2>
  <p>A disk, by itself, is just an enormous numbered row of fixed-size blocks; it has no idea what a "file" or a "folder" is. If programs had to remember "the orders data is in blocks 81,920 to 82,045", sharing a disk between programs would be impossible and a single mistake would overwrite someone else's data. A <strong>file system</strong> is the layer of the operating system that organises a disk's raw blocks into named files and directories, keeps track of which blocks belong to which file and which are free, and records information about each file such as its size, owner and permissions. Common file systems are ext4 and XFS on Linux, NTFS on Windows and APFS on macOS. This machine's root file system, as <code>findmnt</code> showed earlier, is ext4.</p>
  <p>Think of a library. The books are stored on shelves in whatever positions have space, not in title order. To find a book, you look it up in the catalogue, which gives its catalogue number; the catalogue card for that number lists the author, the date, and the exact shelves where its volumes are. The file system works the same way. The data of a file is stored in <strong>blocks</strong>, usually 4 KB each, wherever there is free space on the disk. Each file has an <strong>inode</strong> (index node), a small record holding everything about the file except its name: its size, owner, permissions, timestamps, and the list of blocks that hold its data. A <strong>directory</strong> is just a special file containing a table of names and the inode number each name points to. So opening <code>data/orders.csv</code> means: look up <code>data</code> in the root directory to find its inode, read that directory to find the inode number for <code>orders.csv</code>, read that inode to find the blocks, and finally read the blocks. The <code>stat</code> command shows a file's inode information directly:</p>
  <div class="fx" data-lang="text">$ printf 'order_id,amount,city\n1,120.0,Pune\n2,80.0,Delhi\n' &gt; orders.csv

$ stat orders.csv
  File: orders.csv
  Size: 47        	Blocks: 8          IO Block: 4096   regular file
Device: 254,0	Inode: 2048087     Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2026-11-19 05:39:16.791273945 +0000
Modify: 2026-11-19 05:39:16.793436400 +0000
Change: 2026-11-19 05:39:16.793436400 +0000
 Birth: 2026-11-19 05:39:16.791273945 +0000
$ ls -i orders.csv
2048087 orders.csv
$ df -i /
Filesystem       Inodes  IUsed    IFree IUse% Mounted on
/dev/vda       16777216 453604 16323612    3% /</div>
  <p>Read the <code>stat</code> output line by line. The file holds 47 bytes of data, but "Blocks: 8" means 8 units of 512 bytes, which is 4 KB: the smallest piece of disk a file can occupy here is one 4,096-byte block ("IO Block: 4096"), so even a tiny file uses a whole block. "Inode: 2048031" is the inode number, the file's real identity on this disk; <code>ls -i</code> shows the same number next to the name. "Links: 1" says one directory entry points to this inode (a hard link adds another name for the same inode). The permission bits, owner and the four timestamps (last access, last modification of the content, last change of the inode, and creation) are all stored in the inode, not in the file's data. (Updating the access time on every read would turn each read into a write, which is why this disk is mounted with <code>noatime</code>.) Finally <code>df -i</code> shows that the file system was created with a fixed number of inodes, 16.7 million here. Running out of inodes, which happens when a program creates millions of tiny files, makes the disk "full" even though <code>df -h</code> shows free space.</p>
  <p>This structure explains why many tiny files are slow, a problem every data engineer eventually meets. Each file costs a directory lookup, an inode read or write, at least one whole block, and separate system calls to open and close it, however little data it holds. With large files that overhead is negligible; with tiny files it is the entire cost. Here are the same 5,000 order rows written as 5,000 separate files and as one file:</p>
  <div class="fx" data-lang="py">import os, shutil, time

rows = [f"{i},{i * 1.5:.1f},Pune\n" for i in range(5000)]      # 5,000 small orders

os.makedirs("tiny", exist_ok=True)
t0 = time.perf_counter()
for i, row in enumerate(rows):                  # one file per order
    with open(f"tiny/order_{i}.csv", "w") as f:
        f.write(row)
t_many = time.perf_counter() - t0

t0 = time.perf_counter()
with open("one.csv", "w") as f:                 # all orders in one file
    f.writelines(rows)
t_one = time.perf_counter() - t0

t0 = time.perf_counter()
total = sum(len(open(os.path.join("tiny", name)).read()) for name in os.listdir("tiny"))
t_read_many = time.perf_counter() - t0
t0 = time.perf_counter()
total_one = len(open("one.csv").read())
t_read_one = time.perf_counter() - t0

data_bytes = sum(len(r) for r in rows)
disk_bytes = sum(os.stat(os.path.join("tiny", n)).st_blocks * 512 for n in os.listdir("tiny"))
print(f"write: 5000 files {t_many * 1000:6.1f} ms   one file {t_one * 1000:5.2f} ms")
print(f"read:  5000 files {t_read_many * 1000:6.1f} ms   one file {t_read_one * 1000:5.2f} ms")
print(f"actual data: {data_bytes / 1e3:.0f} KB   disk used by the 5000 files: {disk_bytes / 1e6:.1f} MB")
print(f"disk used by one.csv: {os.stat('one.csv').st_blocks * 512 / 1e3:.0f} KB")
shutil.rmtree("tiny"); os.remove("one.csv")</div>
  <div class="fx" data-lang="text">write: 5000 files   79.5 ms   one file  0.32 ms
read:  5000 files   48.6 ms   one file  0.24 ms
actual data: 83 KB   disk used by the 5000 files: 20.5 MB
disk used by one.csv: 86 KB</div>
  <p>The data is only about 83 KB in total. Writing it as 5,000 files took hundreds of times longer than writing one file, and reading it back was similarly slow, because almost all the time went into creating, opening and closing files rather than moving data. The 5,000 files also used 20.5 MB of disk, since each one rounds up to a 4 KB block, about 250 times the size of the data, while the single file used 86 KB. The same "small files problem" is far worse in distributed systems: in HDFS each file costs memory on the central NameNode, and in cloud object storage each file is a separate network request costing tens of milliseconds. That is why Spark jobs that write thousands of tiny output files are a known anti-pattern, fixed by repartitioning or compacting into fewer files of about 100 MB–1 GB each (<a class="xref" data-note="de_spark">Apache Spark</a>). For more command-line tools around files, see <a class="xref" data-note="se_linux">Linux &amp; the Command Line</a>.</p>

  <h2 id="cfs-dur"><span class="num">06</span>Durability: Buffers and fsync</h2>
  <p>When our script writes the day's orders and the call returns, it is natural to believe the data is now safely on disk. Usually it is not, yet. Because storage is so much slower than RAM, every layer between your program and the disk holds written data in memory for a while and sends it on later in bigger batches. This is called <strong>write buffering</strong> (or write-back caching), and it makes writing fast. The cost is that, for a short time, the data exists only in volatile memory, and a crash or power cut at that moment loses it. <strong>Durability</strong> is the guarantee that once a write is reported as complete, it will survive a crash, and getting it requires an explicit step.</p>
  <figure class="viz"><svg viewBox="0 0 640 175" width="640"><defs><marker id="cfs-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
<rect x="10" y="40" width="130" height="50" rx="5" class="fb sb"/><text x="75" y="61" text-anchor="middle" font-size="11">your program</text><text x="75" y="78" text-anchor="middle" font-size="10" class="tm">Python file buffer</text>
<rect x="175" y="40" width="130" height="50" rx="5" class="fv"/><text x="240" y="61" text-anchor="middle" font-size="11">operating system</text><text x="240" y="78" text-anchor="middle" font-size="10" class="tm">page cache (RAM)</text>
<rect x="340" y="40" width="130" height="50" rx="5" class="ft"/><text x="405" y="61" text-anchor="middle" font-size="11">drive</text><text x="405" y="78" text-anchor="middle" font-size="10" class="tm">small write cache</text>
<rect x="505" y="40" width="125" height="50" rx="5" class="fg sg"/><text x="567" y="61" text-anchor="middle" font-size="11">flash / platter</text><text x="567" y="78" text-anchor="middle" font-size="10" class="tm">persistent</text>
<line x1="140" y1="65" x2="173" y2="65" class="sb" stroke-width="1.5" marker-end="url(#cfs-a2)"/>
<line x1="305" y1="65" x2="338" y2="65" class="sb" stroke-width="1.5" marker-end="url(#cfs-a2)"/>
<line x1="470" y1="65" x2="503" y2="65" class="sb" stroke-width="1.5" marker-end="url(#cfs-a2)"/>
<text x="157" y="30" text-anchor="middle" font-size="10" class="tb">flush()/close()</text>
<text x="322" y="22" text-anchor="middle" font-size="10" class="tb">os.fsync()</text><text x="322" y="34" text-anchor="middle" font-size="10" class="tm">or later (~30 s)</text>
<text x="487" y="30" text-anchor="middle" font-size="10" class="tb">fsync: flush cmd</text>
<text x="75" y="115" text-anchor="middle" font-size="10" class="tr">lost if the</text><text x="75" y="129" text-anchor="middle" font-size="10" class="tr">program crashes</text>
<text x="322" y="115" text-anchor="middle" font-size="10" class="tr">lost if the machine</text><text x="322" y="129" text-anchor="middle" font-size="10" class="tr">loses power or the OS crashes</text>
<text x="567" y="115" text-anchor="middle" font-size="10" class="tg">survives</text><text x="567" y="129" text-anchor="middle" font-size="10" class="tg">power loss</text>
<text x="320" y="162" text-anchor="middle" font-size="10" class="tm">f.write() returns as soon as the data is in the first box</text>
</svg><figcaption>The path of a write. Each box holds data in memory until it is pushed to the next. Only the last box survives a power cut; os.fsync() is the call that pushes data all the way there and waits.</figcaption></figure>
  <p>Follow the picture from left to right. When Python's <code>f.write()</code> returns, the data is usually only in a buffer inside your own program; Python collects small writes and hands them to the operating system in larger pieces. <code>f.flush()</code> or closing the file passes it to the operating system, which puts it in the page cache and again returns immediately; now the data survives your program crashing, but not the machine crashing. Linux writes dirty (modified) pages from the page cache to the disk on its own schedule, typically within about 30 seconds. <code>os.fsync(fd)</code> is the system call that says "write this file's data to the device now, tell the device to flush its own cache, and do not return until it is done". Only after <code>fsync</code> returns is the data durable. Think of posting a letter: dropping it in the post box (<code>write</code>) feels like sending it, but the letter is only truly delivered when the recipient signs for it (<code>fsync</code>).</p>
  <p>Durability is expensive, because it forces the program to wait for the slowest part of the system. Here are a thousand small appends to an orders log, first left to the buffers, then with an <code>fsync</code> after each one:</p>
  <div class="fx" data-lang="py">import os, time

def append_orders(path, n, sync):
    t0 = time.perf_counter()
    with open(path, "a") as f:
        for i in range(n):
            f.write(f"{i},120.0,Pune\n")
            if sync:
                f.flush()                     # Python's buffer -&gt; OS page cache
                os.fsync(f.fileno())          # OS page cache -&gt; the disk itself
    return time.perf_counter() - t0

n = 1000
fast = append_orders("log_buffered.csv", n, sync=False)
safe = append_orders("log_fsync.csv", n, sync=True)
print(f"{n} writes, buffered:      {fast * 1000:7.1f} ms  ({fast / n * 1e6:6.1f} µs each)")
print(f"{n} writes, fsync each:    {safe * 1000:7.1f} ms  ({safe / n * 1e6:6.1f} µs each)")
os.remove("log_buffered.csv"); os.remove("log_fsync.csv")</div>
  <div class="fx" data-lang="text">1000 writes, buffered:          0.3 ms  (   0.3 µs each)
1000 writes, fsync each:      165.3 ms  ( 165.3 µs each)</div>
  <p>Buffered, each write cost about a microsecond and a half, because it only copied a few bytes in memory. With an <code>fsync</code> after each write, each one cost a couple of hundred microseconds, more than a hundred times slower, because every call waited for the device to confirm. On a hard disk each <code>fsync</code> would cost several milliseconds. This is the fundamental trade-off behind database settings: a database that promises durability, the D in ACID (<a class="xref" data-note="sql_transactions">Transactions &amp; Concurrency</a>), must <code>fsync</code> its log before saying "committed", and databases make it affordable by grouping many transactions into one <code>fsync</code> ("group commit"). Message systems like Kafka make a similar trade, often relying on copies on several machines instead of an <code>fsync</code> on each (<a class="xref" data-note="de_kafka">Apache Kafka</a>).</p>
  <p>A second danger is a crash <em>during</em> a write, which can leave a file half old and half new, or truncated. If our script overwrites <code>daily_totals.json</code> in place and crashes halfway, the file is now corrupt and the old version is gone. The standard fix is the <strong>atomic write</strong> pattern: write the new content to a temporary file next to the target, <code>fsync</code> it, then rename it over the original with <code>os.replace</code>. On POSIX file systems a rename within one file system is atomic, meaning other programs see either the complete old file or the complete new file, never a mixture:</p>
  <div class="fx" data-lang="py">import json, os

def save_atomically(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f)
        f.flush()
        os.fsync(f.fileno())                  # 1. the new content is safely on disk
    os.replace(tmp, path)                     # 2. swap names in one step
    dir_fd = os.open(os.path.dirname(os.path.abspath(path)), os.O_RDONLY)
    os.fsync(dir_fd)                          # 3. make the rename itself durable
    os.close(dir_fd)

save_atomically("daily_totals.json", {"Pune": 1200, "Delhi": 950})
print(open("daily_totals.json").read())
os.remove("daily_totals.json")</div>
  <div class="fx" data-lang="text">{"Pune": 1200, "Delhi": 950}</div>
  <p>The three numbered steps are the whole recipe. After step 1 the new content is safely on disk under a temporary name, so a crash leaves the old file untouched. Step 2 switches the name in a single indivisible operation. Step 3 makes the rename itself durable, because a rename changes the directory, and the directory has its own buffered data. Model checkpoints, configuration files, and any "latest results" file that another program reads should be written this way.</p>

  <h2 id="cfs-raid"><span class="num">07</span>RAID and Backups</h2>
  <p>Disks fail. Large studies of data centre drives find that a few percent of hard disks fail each year, and SSDs fail too, often without warning. On a single disk, a failure means every file on it is gone. <strong>RAID</strong> (Redundant Array of Independent Disks) combines several physical disks into one logical disk to gain speed, protection against disk failure, or both. The idea is like a company that keeps important documents in several filing cabinets: either duplicated in two cabinets, or spread across several with a checksum page that can rebuild any one lost cabinet.</p>
  <p>The common RAID levels are worth knowing by number. <strong>RAID 0</strong> (striping) splits data across disks so they work in parallel: faster and with full capacity, but if any one disk dies, everything is lost, so it has no redundancy at all. <strong>RAID 1</strong> (mirroring) writes identical copies to two disks: either can fail and nothing is lost, at the cost of half the capacity. <strong>RAID 5</strong> stripes data across three or more disks plus <strong>parity</strong>, extra information computed with XOR from which any single missing disk can be rebuilt; it survives one failure and loses only one disk's worth of capacity. <strong>RAID 6</strong> uses two parity blocks and survives two failures. <strong>RAID 10</strong> is mirrored pairs that are then striped, combining RAID 1's safety with RAID 0's speed. Rebuilding a large failed disk in RAID 5 can take a day or more, during which a second failure loses everything, which is why RAID 6 and RAID 10 are preferred for big drives. In the cloud you rarely build RAID yourself: services such as EBS volumes and S3 replicate data across devices and data centres behind the scenes.</p>
  <p>The most important sentence about RAID is that <strong>RAID is not a backup</strong>. RAID protects against one kind of failure, a disk dying. It does nothing if you delete the wrong folder, a bug overwrites a table, ransomware encrypts your files, or the building floods, because RAID faithfully applies every change to all its disks at once. A <strong>backup</strong> is a separate copy of the data, taken at a point in time and stored independently, from which you can restore an earlier state. The widely used <strong>3-2-1 rule</strong> says to keep three copies of important data, on two different kinds of storage, with one copy off-site. Two related ideas complete the picture: <strong>snapshots</strong>, which file systems and cloud disks can take in seconds by recording which blocks changed (cheap and fast, but often stored on the same system), and <strong>versioning</strong> in object storage, which keeps old versions of each object so an accidental overwrite can be undone. A backup only counts once you have tested restoring from it. For data science, the same principle applies to code (Git), data (versioned buckets, table formats with time travel) and models (a model registry).</p>

  <h2 id="cfs-obj"><span class="num">08</span>Block, File and Object Storage</h2>
  <p>So far our orders file has lived on a disk attached to one machine. As soon as data must be shared by many machines, or grows past what any one disk can hold, we need to choose how storage is offered over a network. There are three main models, and they differ in what you are given to work with. <strong>Block storage</strong> gives you a raw disk, a numbered row of blocks, which one machine formats with its own file system; AWS EBS volumes and the virtual disk under this machine are block storage. It is the fastest and most flexible, and it is what databases run on, but normally only one machine can use a given volume at a time. <strong>File storage</strong> gives you a shared file system over the network, with folders, files and normal file operations, that many machines can mount at once; NFS servers, AWS EFS and Google Filestore are examples. It is convenient because programs use ordinary file paths, but its shared bookkeeping limits how far it scales.</p>
  <p><strong>Object storage</strong> takes a different approach. It stores <strong>objects</strong>, each one a blob of bytes plus some metadata, identified by a key inside a <strong>bucket</strong>, and you access them over HTTP with simple operations: PUT an object, GET an object, LIST keys, DELETE. Amazon S3, Google Cloud Storage (GCS) and Azure Blob Storage are the main services. There are no real directories: a key such as <code>orders/2026/11/19/part-0001.parquet</code> merely looks like a path, and "listing a folder" means listing keys with that prefix. Objects cannot be edited in place; you replace the whole object. In return, object storage scales to practically unlimited size, is very cheap per gigabyte, stores each object redundantly across several data centres (S3 is designed for 99.999999999% durability), and can be read by thousands of machines at the same time.</p>
  <p>An analogy for all three: block storage is renting an empty plot of land, where you build whatever structure you like, but it is yours alone; file storage is a shared office building with corridors and labelled rooms that everyone can walk around; object storage is a vast warehouse with a coat-check counter, where you hand over a box, get a ticket (the key), and get exactly that box back when you show the ticket, but you cannot open the box on the shelf and change one item inside it.</p>
  <table class="tbl">
    <tr><th></th><th>Block</th><th>File</th><th>Object</th></tr>
    <tr><td>You get</td><td>a raw disk</td><td>a shared folder tree</td><td>buckets of key → blob</td></tr>
    <tr><td>Access</td><td>attached to one machine</td><td>mounted by many (NFS, SMB)</td><td>HTTP API (PUT/GET/LIST)</td></tr>
    <tr><td>Edit part of a file?</td><td>yes</td><td>yes</td><td>no, replace the whole object</td></tr>
    <tr><td>Latency</td><td>lowest (µs–ms)</td><td>low (ms)</td><td>higher (tens of ms per request)</td></tr>
    <tr><td>Scale and cost</td><td>size you provision</td><td>moderate</td><td>practically unlimited, cheapest</td></tr>
    <tr><td>Examples</td><td>AWS EBS, GCP Persistent Disk</td><td>NFS, AWS EFS, Filestore</td><td>S3, GCS, Azure Blob</td></tr>
    <tr><td>Typical use</td><td>databases, VM boot disks</td><td>shared home folders, legacy apps</td><td>data lakes, backups, model artifacts</td></tr>
  </table>
  <p>This is why <strong>data lakes</strong>, the central stores where companies keep all their raw and processed data for analytics and ML, are built on object storage. The volumes are huge and grow forever, so cost per gigabyte matters most. Storage and compute can be separated: the data stays in S3 while Spark clusters, query engines and training jobs are started and stopped as needed, all reading the same objects in parallel. And the "write once, read many times" pattern of analytics data suits objects that are never edited in place. The weaknesses shape how data lakes are designed: every request has tens of milliseconds of latency, so many tiny objects are slow and expensive to process; and since objects cannot be modified, updates are done by writing new files, with table formats such as Delta Lake, Apache Iceberg and Hudi keeping track of which files make up the current version of a table. In Python, pandas can read and write object storage directly through paths like <code>s3://bucket/orders.parquet</code> when the right library (<code>s3fs</code> or <code>gcsfs</code>) is installed (<a class="xref" data-note="mlops_cloud">Cloud for ML</a>).</p>

  <h2 id="cfs-fmt"><span class="num">09</span>Compression and Columnar Formats</h2>
  <p>We have seen that reading from storage is slow, that sequential reads beat random ones, and that object storage charges per byte stored and per request. All three point the same way: store data so that a job reads as few bytes as possible. Two ideas do most of the work. <strong>Compression</strong> encodes data in fewer bytes by exploiting repetition; repeated city names and similar numbers compress well. It trades CPU time for less I/O, which is usually a good deal because CPUs are fast and storage is slow. Fast codecs such as Snappy, LZ4 and Zstandard (zstd) decompress at gigabytes per second with moderate compression; gzip compresses harder but more slowly. One catch worth knowing: a plain <code>.csv.gz</code> file cannot be split, so a cluster cannot divide one big gzipped file among many workers.</p>
  <p>The second idea is the <strong>columnar format</strong>. A CSV file stores data row by row: the first order's id, amount, city and paid flag, then the second order's, and so on. That is natural for writing one record at a time, but analytics usually asks questions about a few columns of many rows, such as "total amount by city". To read one column from a CSV, the program must still read and parse every byte of every row. A columnar format such as <strong>Parquet</strong> (or ORC) stores all the values of one column together, then the next column, in chunks called row groups, with the column types and summary statistics stored in the file. Think of a filing cabinet of customer forms: if each folder holds one customer's whole form, finding everyone's phone number means opening every folder; if one drawer holds all the phone numbers, you open one drawer.</p>
  <figure class="viz"><svg viewBox="0 0 620 200" width="620">
<text x="20" y="25" font-size="11" class="tb">Row layout (CSV): row after row</text>
<rect x="20" y="40" width="55" height="24" class="fs"/><text x="47" y="56" text-anchor="middle" font-size="10">1</text><rect x="75" y="40" width="55" height="24" class="fg sg"/><text x="102" y="56" text-anchor="middle" font-size="10">120.0</text><rect x="130" y="40" width="55" height="24" class="fs"/><text x="157" y="56" text-anchor="middle" font-size="10">Pune</text><rect x="185" y="40" width="55" height="24" class="fs"/><text x="212" y="56" text-anchor="middle" font-size="10">True</text>
<rect x="20" y="66" width="55" height="24" class="fs"/><text x="47" y="82" text-anchor="middle" font-size="10">2</text><rect x="75" y="66" width="55" height="24" class="fg sg"/><text x="102" y="82" text-anchor="middle" font-size="10">80.0</text><rect x="130" y="66" width="55" height="24" class="fs"/><text x="157" y="82" text-anchor="middle" font-size="10">Delhi</text><rect x="185" y="66" width="55" height="24" class="fs"/><text x="212" y="82" text-anchor="middle" font-size="10">False</text>
<rect x="20" y="92" width="55" height="24" class="fs"/><text x="47" y="108" text-anchor="middle" font-size="10">3</text><rect x="75" y="92" width="55" height="24" class="fg sg"/><text x="102" y="108" text-anchor="middle" font-size="10">45.0</text><rect x="130" y="92" width="55" height="24" class="fs"/><text x="157" y="108" text-anchor="middle" font-size="10">Pune</text><rect x="185" y="92" width="55" height="24" class="fs"/><text x="212" y="108" text-anchor="middle" font-size="10">True</text>
<rect x="20" y="118" width="55" height="24" class="fs"/><text x="47" y="134" text-anchor="middle" font-size="10">4</text><rect x="75" y="118" width="55" height="24" class="fg sg"/><text x="102" y="134" text-anchor="middle" font-size="10">60.0</text><rect x="130" y="118" width="55" height="24" class="fs"/><text x="157" y="134" text-anchor="middle" font-size="10">Mumbai</text><rect x="185" y="118" width="55" height="24" class="fs"/><text x="212" y="134" text-anchor="middle" font-size="10">True</text>
<text x="20" y="168" font-size="10" class="tr">read "amount": must scan every row</text>
<text x="330" y="25" font-size="11" class="tb">Columnar layout (Parquet): column after column</text>
<rect x="330" y="40" width="62" height="24" class="fs"/><text x="361" y="56" text-anchor="middle" font-size="10">1</text><rect x="392" y="40" width="62" height="24" class="fs"/><text x="423" y="56" text-anchor="middle" font-size="10">2</text><rect x="454" y="40" width="62" height="24" class="fs"/><text x="485" y="56" text-anchor="middle" font-size="10">3</text><rect x="516" y="40" width="62" height="24" class="fs"/><text x="547" y="56" text-anchor="middle" font-size="10">4</text><text x="584" y="56" font-size="10" class="tm">id</text>
<rect x="330" y="66" width="62" height="24" class="fg sg"/><text x="361" y="82" text-anchor="middle" font-size="10">120.0</text><rect x="392" y="66" width="62" height="24" class="fg sg"/><text x="423" y="82" text-anchor="middle" font-size="10">80.0</text><rect x="454" y="66" width="62" height="24" class="fg sg"/><text x="485" y="82" text-anchor="middle" font-size="10">45.0</text><rect x="516" y="66" width="62" height="24" class="fg sg"/><text x="547" y="82" text-anchor="middle" font-size="10">60.0</text><text x="584" y="82" font-size="10" class="tm">amount</text>
<rect x="330" y="92" width="62" height="24" class="fs"/><text x="361" y="108" text-anchor="middle" font-size="10">Pune</text><rect x="392" y="92" width="62" height="24" class="fs"/><text x="423" y="108" text-anchor="middle" font-size="10">Delhi</text><rect x="454" y="92" width="62" height="24" class="fs"/><text x="485" y="108" text-anchor="middle" font-size="10">Pune</text><rect x="516" y="92" width="62" height="24" class="fs"/><text x="547" y="108" text-anchor="middle" font-size="10">Mumbai</text><text x="584" y="108" font-size="10" class="tm">city</text>
<rect x="330" y="118" width="62" height="24" class="fs"/><text x="361" y="134" text-anchor="middle" font-size="10">True</text><rect x="392" y="118" width="62" height="24" class="fs"/><text x="423" y="134" text-anchor="middle" font-size="10">False</text><rect x="454" y="118" width="62" height="24" class="fs"/><text x="485" y="134" text-anchor="middle" font-size="10">True</text><rect x="516" y="118" width="62" height="24" class="fs"/><text x="547" y="134" text-anchor="middle" font-size="10">True</text><text x="584" y="134" font-size="10" class="tm">paid</text>
<text x="330" y="168" font-size="10" class="tg">read "amount": one contiguous chunk</text>
<text x="20" y="192" font-size="10" class="tm">In both files the bytes run left to right, then top to bottom.</text>
</svg><figcaption>The same four orders in a row-oriented and a column-oriented file. The amount values (green) are scattered through the CSV but sit together in Parquet, where they can be read in one sequential pass and compressed well because similar values are side by side.</figcaption></figure>
  <p>Look at where the green cells are. In the CSV, the amounts are scattered between the other fields, so reading them means reading everything. In Parquet, they form one contiguous run, so a reader can jump straight to it and read it sequentially, which is exactly the access pattern storage likes. Storing similar values together also makes compression far more effective (a column of four city names compresses to almost nothing), and because Parquet stores each column's minimum and maximum per row group, a query like "orders above 400" can skip whole row groups without reading them. This is the same idea as cache locality on the memory page, applied to files. Here is our orders table, one million rows, saved as CSV, gzipped CSV and Parquet with pandas (using the pyarrow library for Parquet), with approximate read times:</p>
  <div class="fx" data-lang="py">import os, time
import numpy as np
import pandas as pd

n = 1_000_000
rng = np.random.default_rng(0)
df = pd.DataFrame({
    "order_id": np.arange(n),
    "amount": (rng.random(n) * 500).round(2),
    "city": rng.choice(["Pune", "Delhi", "Mumbai", "Chennai"], n),
    "paid": rng.random(n) &gt; 0.1,
})

df.to_csv("orders.csv", index=False)
df.to_csv("orders.csv.gz", index=False)              # gzip, chosen from the extension
df.to_parquet("orders.parquet")                      # columnar, snappy-compressed

def timed(f, reps=3):
    best = float("inf")
    for _ in range(reps):
        t0 = time.perf_counter(); f(); best = min(best, time.perf_counter() - t0)
    return best

print(f"{'format':16}{'size':&gt;9}{'read all':&gt;11}{'read amount only':&gt;19}")
for path, read in [("orders.csv", pd.read_csv), ("orders.csv.gz", pd.read_csv),
                   ("orders.parquet", pd.read_parquet)]:
    size = os.path.getsize(path) / 1e6
    t_all = timed(lambda: read(path))
    if read is pd.read_csv:
        t_col = timed(lambda: read(path, usecols=["amount"]))
    else:
        t_col = timed(lambda: read(path, columns=["amount"]))
    print(f"{path:16}{size:7.1f} MB{t_all * 1000:8.0f} ms{t_col * 1000:14.0f} ms")

print(pd.read_parquet("orders.parquet").dtypes.to_dict())   # types survive the round trip
for p in ("orders.csv", "orders.csv.gz", "orders.parquet"):
    os.remove(p)</div>
  <div class="fx" data-lang="text">format               size   read all   read amount only
orders.csv         25.2 MB     275 ms           135 ms
orders.csv.gz       6.3 MB     332 ms           205 ms
orders.parquet      6.9 MB      27 ms             9 ms
{'order_id': dtype('int64'), 'amount': dtype('float64'), 'city': &lt;StringDtype(na_value=nan)&gt;, 'paid': dtype('bool')}</div>
  <p>The plain CSV is 25 MB. Gzip shrinks it to about a quarter, but reading it is slightly <em>slower</em> than plain CSV, because the data must be decompressed and then still parsed as text. Parquet is nearly as small as the gzipped CSV and reads several times faster than either CSV, because it stores numbers in binary form that needs no text parsing, and its fast Snappy compression costs almost nothing to undo. The last column is the columnar advantage: reading only the <code>amount</code> column from Parquet took a small fraction of reading the whole file, while the CSV still had to scan every row even with <code>usecols</code>. The final line shows another benefit: Parquet stores the schema, so integers, floats and booleans come back with their types, whereas CSV is just text and every reader has to guess the types again.</p>
  <p>This is why the standard data lake layout is Parquet files of a few hundred megabytes each in object storage, often split into folders by a column like date (<code>orders/date=2026-11-19/</code>, called partitioning) so that a query for one day reads only that day's files. Spark, DuckDB, BigQuery external tables and pandas all read it natively (<a class="xref" data-note="de_spark">Apache Spark</a>). CSV and JSON remain useful for small files, human inspection and exchanging data with other systems; the details of reading and writing files in Python are in <a class="xref" data-note="py_files">File Handling</a>.</p>

  <h2 id="cfs-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common storage bug in Python is assuming that written data is in the file before the file is closed. Because of Python's buffer, another reader (or a crash) sees nothing until the buffer is flushed:</p>
  <div class="fx" data-lang="py">f = open("orders_today.csv", "w")
f.write("1,120.0,Pune\n")                     # sits in Python's buffer for now
print("on disk before close:", repr(open("orders_today.csv").read()))
f.close()                                      # close() flushes the buffer to the OS
print("on disk after close: ", repr(open("orders_today.csv").read()))

with open("orders_today.csv", "w") as f:       # the safe habit: with closes for you
    f.write("1,120.0,Pune\n")
print("with block:          ", repr(open("orders_today.csv").read()))</div>
  <div class="fx" data-lang="text">on disk before close: ''
on disk after close:  '1,120.0,Pune\n'
with block:           '1,120.0,Pune\n'</div>
  <p>Right after <code>write()</code>, the file on disk was still empty; only <code>close()</code> pushed the data to the operating system. Always write files inside a <code>with</code> block, which closes them even if an error occurs, and remember that even a closed file is only durable after <code>fsync</code>, as the durability section showed.</p>
  <p>A second classic is deleting a huge log file to free disk space and finding that <code>df</code> still shows the disk full. Deleting a file only removes its name from the directory; the inode and its blocks are freed only when no process has the file open any more:</p>
  <div class="fx" data-lang="py">import os

with open("big_log.txt", "w") as f:
    f.write("x" * 50_000_000)                   # 50 MB

reader = open("big_log.txt")                    # some process still has it open
os.remove("big_log.txt")                        # "delete" the file
print("still in directory?", os.path.exists("big_log.txt"))
st = os.fstat(reader.fileno())
print("links to inode:", st.st_nlink, "  blocks still allocated:", st.st_blocks * 512 // 1_000_000, "MB")
print("still readable:", len(reader.read()), "characters")
reader.close()                                  # only now is the space freed</div>
  <div class="fx" data-lang="text">still in directory? False
links to inode: 0   blocks still allocated: 50 MB
still readable: 50000000 characters</div>
  <p>After <code>os.remove</code> the name was gone and the inode's link count was 0, but all 50 MB were still allocated and fully readable through the open handle. On a server, the process holding the file is often the program still writing the log; the space returns only when it closes the file or restarts. <code>lsof +L1</code> lists such deleted-but-open files.</p>
  <p>Benchmarking with a warm page cache is the third mistake: running a read test twice and reporting the second, faster run as "disk speed", or concluding that a new file format is faster when the old one was simply read first. Say whether a measurement is cold or warm, and drop the file from the cache (as in the benchmark) or use a file larger than RAM. Finally, three design mistakes come up repeatedly in data work: writing thousands of tiny files (from too many Spark partitions, or one file per record), which is slow on every kind of storage; treating RAID or cloud replication as a backup, when neither protects against deletion or corruption; and keeping large analytical datasets as CSV, paying in size, read time and lost types every time they are read.</p>

  <h2 id="cfs-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Devices</h3>
  <table class="tbl">
    <tr><th></th><th>HDD</th><th>SATA SSD</th><th>NVMe SSD</th></tr>
    <tr><td>Medium</td><td>magnetic platters + head</td><td>NAND flash</td><td>NAND flash over PCIe</td></tr>
    <tr><td>Random latency</td><td>5–15 ms</td><td>~100 µs</td><td>20–100 µs</td></tr>
    <tr><td>Random IOPS</td><td>80–200</td><td>~50–100k</td><td>200k–1M+</td></tr>
    <tr><td>Sequential</td><td>150–250 MB/s</td><td>~550 MB/s</td><td>3–14 GB/s</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>Storage</b>: persistent (survives power off), large, slower than RAM.</li>
    <li><b>Seek time</b>: moving the HDD arm to the track. <b>Rotational latency</b>: waiting for the sector; avg = half a revolution (4.17 ms at 7,200 rpm).</li>
    <li><b>NAND flash</b>: cells trap charge; written in pages, erased in blocks; limited erase cycles.</li>
    <li><b>Wear levelling</b>, <b>garbage collection</b>, <b>write amplification</b>, <b>TRIM</b>: how SSDs manage flash.</li>
    <li><b>IOPS</b>: operations per second. <b>Throughput</b>: bytes per second = IOPS × request size. <b>Latency</b>: time per operation.</li>
    <li><b>Page cache</b>: OS keeps file data in spare RAM; warm reads skip the disk.</li>
    <li><b>File system</b>: organises blocks into files and directories (ext4, XFS, NTFS, APFS).</li>
    <li><b>Block</b>: 4 KB allocation unit. <b>Inode</b>: file metadata + block list (no name). <b>Directory</b>: name → inode table.</li>
    <li><b>fsync</b>: force a file's data to the device and wait. <b>Atomic write</b>: temp file + fsync + <code>os.replace</code>.</li>
    <li><b>RAID 0</b> stripe (no safety), <b>1</b> mirror, <b>5</b> parity (1 failure), <b>6</b> double parity (2), <b>10</b> mirrored stripes.</li>
    <li><b>3-2-1 backup</b>: 3 copies, 2 media types, 1 off-site. RAID is not a backup.</li>
    <li><b>Block / file / object storage</b>: raw disk / shared folder tree / key → immutable blob over HTTP.</li>
    <li><b>Columnar format</b> (Parquet, ORC): values of each column stored together, typed, compressed, with statistics.</li>
  </ul>
  <h3>Commands and code</h3>
  <div class="fx" data-lang="text">df -h          # space per file system      df -i     # inodes
lsblk          # block devices              stat FILE # inode info
ls -i FILE     # inode number               lsof +L1  # deleted-but-open files</div>
  <div class="fx" data-lang="py">with open(path, "w") as f:          # closes (and flushes) automatically
    f.write(data)
    f.flush(); os.fsync(f.fileno())  # durable
os.replace(tmp, path)               # atomic rename
df.to_parquet("orders.parquet")     # needs pyarrow
pd.read_parquet("orders.parquet", columns=["amount"])
pd.read_csv("orders.csv", usecols=["amount"])</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Second run faster? Probably the page cache.</li>
    <li>Many tiny files: per-file overhead and 4 KB minimum blocks dominate.</li>
    <li>Deleted file still open → space not freed.</li>
    <li><code>write()</code> returning ≠ saved; <code>close()</code> ≠ durable.</li>
    <li><code>.csv.gz</code> is small but slow to read and not splittable.</li>
    <li>Object storage: high per-request latency, no in-place edits.</li>
  </ul>

  <h2 id="cfs-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between memory and storage?</summary><div class="qa-body">Memory (RAM) is fast, volatile working space where running programs keep the data they are using; it is lost when power goes off. Storage (SSD, HDD) is persistent, much larger and cheaper per gigabyte, but hundreds to many thousands of times slower. Programs load data from storage into memory to work on it and write results back to storage to keep them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a hard disk work, and what are seek time and rotational latency?</summary><div class="qa-body">An HDD stores bits magnetically on spinning platters, read and written by a head on a moving arm. Seek time is the time for the arm to move the head to the right track (about 3–12 ms); rotational latency is the wait for the right sector to spin under the head, on average half a revolution (4.17 ms at 7,200 rpm). Together they limit an HDD to roughly 100–200 random operations per second.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does an SSD work, and why does it wear out?</summary><div class="qa-body">An SSD stores data as trapped charge in NAND flash cells, with no moving parts, managed by a controller. Flash is written in pages but can only be erased in large blocks, so updates go to fresh pages and old blocks are garbage-collected later. Each erase slightly damages the cells, so they survive a limited number of program/erase cycles; wear levelling spreads writes evenly, and endurance is rated in TBW or DWPD.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HDD vs SSD: when would you use each?</summary><div class="qa-body">SSDs have far lower latency (microseconds vs milliseconds) and thousands of times more random IOPS, so they are the choice for operating systems, databases, and any workload with random access or many small files. HDDs are much cheaper per terabyte and fine for large sequential workloads, so they are used for backups, archives and bulk object storage. Many systems tier data: hot data on SSD, cold data on HDD.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between SATA and NVMe?</summary><div class="qa-body">SATA is an older interface designed for hard disks, with a single command queue and a ceiling of about 550 MB/s. NVMe is a protocol built for flash that runs over PCIe lanes, with up to 64k parallel queues, giving several GB/s and hundreds of thousands of IOPS with lower latency. The flash can be similar; the interface is what limits SATA SSDs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is sequential I/O faster than random I/O?</summary><div class="qa-body">On an HDD, each random access pays a seek and rotational delay, while sequential access streams data as the platter spins. On an SSD there is no mechanical delay, but each request still has fixed controller and OS overhead, and large sequential requests let the drive read many flash chips in parallel and prefetch. In both cases fewer, larger requests move more bytes per second.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between IOPS, throughput and latency?</summary><div class="qa-body">IOPS is the number of read/write operations per second, the key number for small random access. Throughput is bytes per second, the key number for large sequential transfers; throughput = IOPS × request size. Latency is the time a single operation takes. A disk can have high throughput but low IOPS (an HDD streaming a file) or the reverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does reading the same file a second time go much faster?</summary><div class="qa-body">The operating system keeps recently read file data in unused RAM, called the page cache. The second read is served from memory rather than the disk, often tens of times faster. This also means benchmarks must state whether the cache was cold or warm, and that free RAM on a server is not wasted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a file system, and what is an inode?</summary><div class="qa-body">A file system is the OS layer that organises a disk's blocks into named files and directories and tracks free space, for example ext4 or NTFS. An inode is the per-file record that stores the file's metadata (size, owner, permissions, timestamps) and the list of blocks holding its data, but not its name. Directories map names to inode numbers, and several names (hard links) can point to the same inode.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are many small files slow, and how do you fix it?</summary><div class="qa-body">Each file carries fixed costs: directory lookups, inode updates, open and close system calls, and at least one whole block (4 KB) of space; in HDFS each file costs NameNode memory and in S3 each file is a separate HTTP request. With tiny files those costs dominate. Fix it by combining data into fewer, larger files (around 100 MB–1 GB for analytics), for example by repartitioning or compacting Spark output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>fsync</code> do? When is data really saved?</summary><div class="qa-body">Writes are buffered first in the program and then in the OS page cache, and written to disk later, so a crash or power cut can lose recently "written" data. <code>fsync</code> forces a file's buffered data and metadata to the storage device, asks the device to flush its cache, and waits until it is done. Data is durable only after <code>fsync</code> returns, which is why databases fsync their write-ahead log before confirming a commit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write a file so that a crash never leaves it half-written?</summary><div class="qa-body">Write the new content to a temporary file in the same directory, <code>fsync</code> it, then rename it over the target with <code>os.replace</code>, and fsync the directory. A rename within one file system is atomic, so readers see either the complete old file or the complete new one. This is how config files, checkpoints and "latest" results should be saved.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is RAID? Explain RAID 0, 1, 5 and 10.</summary><div class="qa-body">RAID combines several disks into one logical disk for performance and/or redundancy. RAID 0 stripes data across disks for speed but loses everything if any disk fails; RAID 1 mirrors data on two disks; RAID 5 stripes data with parity across three or more disks and survives one failure; RAID 10 stripes across mirrored pairs for both speed and redundancy. RAID 6 adds a second parity block to survive two failures.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is RAID not a backup?</summary><div class="qa-body">RAID only protects against a disk failing; it immediately applies every change, including accidental deletions, bugs, corruption and ransomware, to all disks. A backup is an independent point-in-time copy that can restore an earlier state, ideally following the 3-2-1 rule: three copies, two media types, one off-site. Backups must also be tested by actually restoring them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare block, file and object storage.</summary><div class="qa-body">Block storage provides a raw disk (like EBS) that one machine formats with its own file system; it has the lowest latency and suits databases. File storage provides a shared hierarchical file system over the network (NFS, EFS) that many machines can mount. Object storage (S3, GCS) stores immutable blobs under keys in buckets, accessed over HTTP; it scales almost without limit and is cheapest, but has higher latency and no in-place edits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are data lakes built on object storage?</summary><div class="qa-body">Object storage is cheap per gigabyte, scales practically without limit, is highly durable, and can be read in parallel by many machines. It lets storage be separated from compute, so Spark clusters or query engines can be started on demand against the same data. Analytics data is mostly written once and read many times, which fits immutable objects; table formats like Delta Lake and Iceberg add updates and versioning on top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Parquet usually better than CSV for analytics?</summary><div class="qa-body">Parquet is columnar: each column's values are stored together, so a query reads only the columns it needs, sequentially. It stores values in typed binary form with compression and per-chunk statistics, so files are smaller, need no text parsing, keep their schema, and allow skipping chunks that cannot match a filter. CSV is human-readable and universal but larger, slower to parse, and loses types.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You deleted a large file but <code>df</code> still shows the disk as full. Why?</summary><div class="qa-body">Deleting removes the directory entry, but the inode and its blocks are freed only when no process has the file open. A running program, often the one writing a log, still holds it, so the space remains allocated. Find it with <code>lsof +L1</code> and restart or signal the process to reopen its log; truncating the file instead of deleting it avoids the problem.</div></details>
</main>
`
});
