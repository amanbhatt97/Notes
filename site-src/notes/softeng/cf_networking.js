// notes/softeng/cf_networking.js — Networking
Object.assign(TOPIC_CONTENT, {
  "cf_networking": `<main>
<h1>Networking</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>Networking</span></div>
  <p class="lead">Networking is how one computer gets bytes to another computer: your notebook downloading a dataset, pip fetching a package, a Spark driver talking to its executors, or an app calling a model you deployed. Almost every bug that sounds like "it works on my laptop but not in the container" or "the request just hangs" is a networking question underneath, and every backend or MLOps interview has at least one networking question in it. This page builds the subject from zero, one idea at a time. The running example is a small model-serving API: you have trained a model, wrapped it in a web service that listens on port 8000, and a colleague's Python code calls <code>https://models.example.com/predict</code> to get a prediction. We will rebuild that service for real on this machine, step by step, and by the end we will follow one request from the moment a URL is typed until the prediction comes back.</p>

  <h2 id="cfn-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Networking</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Finding the machine</div>
        <ul>
          <li><b>IP address</b>: where a machine is (IPv4 / IPv6, public / private)</li>
          <li><b>DNS</b>: turns a name into an IP address</li>
          <li><b>Router</b> moves packets between networks; <b>switch</b> inside one</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Finding the program</div>
        <ul>
          <li><b>Port</b>: which program on that machine (22, 80, 443, 5432, 8000)</li>
          <li><b>Socket</b> = IP + port + protocol</li>
          <li>Server listens, client connects</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Moving the bytes</div>
        <ul>
          <li><b>TCP</b>: handshake, reliable, ordered (HTTP, databases)</li>
          <li><b>UDP</b>: no handshake, fire and forget (DNS, video, games)</li>
          <li><b>HTTP</b> on top; <b>TLS</b> makes it HTTPS</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In between and speed</div>
        <ul>
          <li>Firewall, NAT, proxy, VPN, load balancer</li>
          <li><b>Latency</b> = delay; <b>bandwidth</b> = capacity; <b>throughput</b> = actual rate</li>
          <li>ping, traceroute, curl -v to diagnose</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfn-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Network Is</span><span class="rm-sub">packets, protocols, LAN/WAN/MAN, clients and servers</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-addr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">IP Addresses and MAC Addresses</span><span class="rm-sub">IPv4/IPv6, public vs private, localhost, DHCP</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-route"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Switches, Routers and NAT</span><span class="rm-sub">how a packet leaves your network and comes back</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-ports"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Ports and Sockets</span><span class="rm-sub">which program gets the bytes; a real server and client</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-tcpudp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">TCP and UDP</span><span class="rm-sub">the handshake, reliability, and when to skip it</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-dns"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">DNS</span><span class="rm-sub">how a name becomes an IP address</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-model"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The TCP/IP Model</span><span class="rm-sub">the layers, and how they map to OSI</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-https"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">HTTP, HTTPS and TLS</span><span class="rm-sub">requests as text, encryption, certificates, hashing</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-middle"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Firewalls, Proxies and VPNs</span><span class="rm-sub">the machines that sit in the middle</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-speed"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Latency, Bandwidth, ping and traceroute</span><span class="rm-sub">why requests are slow and how to measure it</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-url"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">What Happens When You Type a URL</span><span class="rm-sub">every piece, in order, end to end</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">0.0.0.0 vs 127.0.0.1, busy ports, timeouts</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, ports, layers, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="cfn-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the networking questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="cfn-what"><span class="num">01</span>What a Network Is</h2>
  <p>A single computer can do a lot on its own, but the moment two computers need to share something, such as a file, a database row or a model prediction, they need a way to send bytes to each other. A <strong>network</strong> is simply a group of computers (and phones, printers, servers, anything that can send data) connected so that they can exchange data. Each connected device is called a <strong>node</strong> or <strong>host</strong>, and the physical or wireless connection between them, such as an Ethernet cable, Wi-Fi or a fibre-optic line, is called a <strong>link</strong>.</p>
  <p>Data does not travel across a network as one long stream. It is chopped into small pieces called <strong>packets</strong>, typically up to about 1,500 bytes each, and every packet carries a label saying where it came from and where it is going. Think of sending a book through the post by tearing out its pages, putting each page in its own numbered envelope with the full address, and dropping them all in the post box. The envelopes may travel by different routes and arrive out of order, but because each one is addressed and numbered, the receiver can put the book back together. Splitting data into packets means one huge download cannot block the line for everyone else, and a single lost packet can be re-sent without re-sending everything.</p>
  <p>For any of this to work, both sides must agree on the rules: how an address is written, how big a packet can be, what to do when one goes missing. An agreed set of rules for communicating is called a <strong>protocol</strong>. You already know the names of several protocols even if you have never thought of them that way: IP, TCP, UDP, DNS, HTTP and HTTPS are all protocols, and most of this page is about what each one is responsible for.</p>
  <p>Networks are often described by how much ground they cover. A <strong>LAN</strong> (Local Area Network) covers one home, office or data-centre room, where devices are connected by Wi-Fi or cables to the same switch. A <strong>MAN</strong> (Metropolitan Area Network) covers a city, such as a university's campuses linked by fibre. A <strong>WAN</strong> (Wide Area Network) covers countries or continents by joining many smaller networks together. The <strong>internet</strong> is the biggest WAN of all: it is literally a network of networks, millions of independently owned networks that agree to pass each other's packets using the same protocols.</p>
  <p>Most programs on a network play one of two roles. A <strong>server</strong> is a program that waits for requests and answers them; a <strong>client</strong> is a program that sends requests to a server and uses the answers. This arrangement is called the <strong>client–server architecture</strong>. A restaurant is a good picture of it: the kitchen (server) stays in one place and waits for orders, while many customers (clients) come and go, each placing an order and getting a dish back. The kitchen never walks up to a customer uninvited. In our running example the model service is the server: it starts once, then sits waiting on port 8000. Your colleague's script is a client: it connects, asks for a prediction, and disconnects. Note that "server" means the role a program plays, not a kind of hardware; your own laptop becomes a server the moment you run <code>uvicorn</code> or <code>jupyter notebook</code> on it. The same pattern is everywhere in data work: <code>psycopg</code> is a client of a PostgreSQL server, a Spark executor is a client of the driver, and <code>pip</code> is a client of the PyPI servers. (The alternative, <strong>peer-to-peer</strong>, where every node is both client and server, is used by BitTorrent and some blockchain systems, but almost everything you build will be client–server.)</p>
  <p>For the client to reach the server, three questions must be answered: which <em>machine</em> is the server on, which <em>program</em> on that machine should receive the bytes, and how should the bytes be carried reliably. The next sections answer them in that order: IP addresses, then ports, then TCP and UDP.</p>

  <h2 id="cfn-addr"><span class="num">02</span>IP Addresses and MAC Addresses</h2>
  <p>A packet is useless without a destination. An <strong>IP address</strong> (Internet Protocol address) is a number that identifies a device on a network, so that packets can be delivered to it, the way a postal address identifies a house. The classic form, <strong>IPv4</strong>, is a 32-bit number written as four numbers from 0 to 255 separated by dots, like <code>192.168.1.23</code>. Thirty-two bits allow about 4.3 billion addresses, which sounded like plenty in 1981 but is far fewer than the number of phones, laptops and servers alive today. <strong>IPv6</strong> is the replacement: 128-bit addresses written in hexadecimal groups separated by colons, like <code>2001:4860:4860::8888</code> (the <code>::</code> means "a run of zeros goes here"). Both are in use side by side, and most software handles both without you noticing.</p>
  <p>Because IPv4 addresses ran short, certain ranges were set aside as <strong>private addresses</strong>: <code>10.x.x.x</code>, <code>172.16.x.x</code> to <code>172.31.x.x</code>, and <code>192.168.x.x</code>. Anyone may use these inside their own network, and millions of homes all use <code>192.168.1.x</code> at the same time without conflict, because private addresses are never used out on the public internet. A <strong>public address</strong> is one that is unique worldwide and reachable from the internet; your home router has one, and so does every website. The analogy is an office building: the building has one street address that the post office knows (public), while inside, rooms are numbered 101, 102, 103 (private), and every other building in town has its own room 101 too. Section 03 explains how a device with a private address can still reach the internet.</p>
  <p>One more special address matters every day: <strong>localhost</strong>, which is the name for <code>127.0.0.1</code> (IPv6: <code>::1</code>). It always means "this same machine". Packets sent to it never leave the computer; they loop straight back inside the operating system, which is why it is called the <strong>loopback</strong> address. When you run a Jupyter server or a local API and open <code>http://127.0.0.1:8000</code>, the browser and the server are on the same machine, talking through loopback. Python's <code>ipaddress</code> module knows all these rules, so we can ask it:</p>
  <div class="fx" data-lang="py">import ipaddress

for text in ["127.0.0.1", "192.168.1.23", "10.4.0.17", "8.8.8.8",
             "151.101.64.223", "::1", "2001:4860:4860::8888"]:
    ip = ipaddress.ip_address(text)
    print(f"{text:22} IPv{ip.version}  private={ip.is_private!s:5}  loopback={ip.is_loopback}")

home = ipaddress.ip_network("192.168.1.0/24")       # a typical home network
print(home, "holds", home.num_addresses, "addresses")
print("all IPv4 addresses:", 2**32)
print("all IPv6 addresses:", 2**128)</div>
  <div class="fx" data-lang="text">127.0.0.1              IPv4  private=True   loopback=True
192.168.1.23           IPv4  private=True   loopback=False
10.4.0.17              IPv4  private=True   loopback=False
8.8.8.8                IPv4  private=False  loopback=False
151.101.64.223         IPv4  private=False  loopback=False
::1                    IPv6  private=True   loopback=True
2001:4860:4860::8888   IPv6  private=False  loopback=False
192.168.1.0/24 holds 256 addresses
all IPv4 addresses: 4294967296
all IPv6 addresses: 340282366920938463463374607431768211456</div>
  <p>The first three addresses are private (home and office ranges, plus loopback), while <code>8.8.8.8</code> (a public DNS server run by Google) and <code>151.101.64.223</code> (one of the addresses of pypi.org, as we will see in the DNS section) are public. The <code>/24</code> in <code>192.168.1.0/24</code> is <strong>CIDR notation</strong>: it says the first 24 bits are the network part and the remaining 8 bits number the devices, giving 256 addresses, which is exactly the size of a typical home network. You will meet CIDR constantly in cloud work, where a VPC (a private network in AWS or GCP) is created with something like <code>10.0.0.0/16</code>. The last two lines show why IPv6 exists: 2<sup>128</sup> is so large that address shortage stops being a concern.</p>
  <p>How does a device get its IP address in the first place? Nobody types it in. When your laptop joins Wi-Fi, it broadcasts a request and the router answers with an address to use, along with the router's own address and which DNS server to use. This automatic hand-out is <strong>DHCP</strong> (Dynamic Host Configuration Protocol), and it is why your laptop's IP address changes from café to café. Servers usually get a fixed (static) address instead, so clients can always find them.</p>
  <p>There is a second kind of address underneath. A <strong>MAC address</strong> (Media Access Control address) is a hardware identifier burned into each network card, written as six pairs of hex digits like <code>02:fc:00:00:00:01</code>, and used only to deliver frames between devices on the <em>same</em> local network. The IP address says "the final destination is this house in another city"; the MAC address says "on this street, hand it to the next door". The IP address stays the same end to end, while the MAC addresses change at every hop. Here is what this machine reports. It is a Linux virtual machine in a data centre, so these are the VM's virtual network card and addresses, not physical hardware:</p>
  <div class="fx" data-lang="text">$ ip addr
bash: line 1: ip: command not found
$ ls /sys/class/net
eth0
ifb0
ifb1
lo
$ hostname -I
192.0.2.2
$ cat /sys/class/net/eth0/address
02:fc:00:00:00:01</div>
  <p>The usual command for this, <code>ip addr</code>, is not installed in this minimal container, so we read the same information from files the Linux kernel exposes under <code>/sys</code>. There are network interfaces called <code>lo</code> (the loopback interface that carries 127.0.0.1) and <code>eth0</code> (the virtual Ethernet card that reaches the outside); the <code>ifb</code> entries are internal helper devices. The machine's own IP address on <code>eth0</code> is <code>192.0.2.2</code> (a range reserved for documentation and test setups, a private address in practice), and its MAC address is the six-pair value on the last line. On your laptop, <code>ip addr</code> (Linux), <code>ifconfig</code> (macOS) or <code>ipconfig</code> (Windows) shows the same things: an interface, its IP, and its MAC.</p>

  <h2 id="cfn-route"><span class="num">03</span>Switches, Routers and NAT</h2>
  <p>Knowing the destination address is not enough; something has to carry each packet there. Two kinds of devices do this work, and the difference between them is a classic interview question. A <strong>switch</strong> connects devices <em>within</em> one local network. It learns which MAC address is plugged into which of its ports and forwards each frame only to the right port, like a receptionist who delivers internal mail to the right desk in one office. A <strong>router</strong> connects <em>different</em> networks together and decides where a packet should go next based on its destination IP address, like a post office that sends letters on towards other cities. Your home "router" box is actually both: a small switch and Wi-Fi access point for the devices in your home, plus a router that connects your home network to your internet provider.</p>
  <p>Every device keeps a small <strong>routing table</strong> that answers "where should a packet to this address go next?". For almost every device the table is tiny: addresses on my own local network go straight out on the local link, and everything else goes to one router called the <strong>default gateway</strong>, which takes it from there. Each router along the way does the same thing with its own, much bigger table, passing the packet one <strong>hop</strong> closer to its destination, until it reaches the network that owns the destination address. This machine's table, decoded from the kernel's file:</p>
  <div class="fx" data-lang="py">import socket

def hexip(h):                      # /proc stores IPv4 as little-endian hex
    return socket.inet_ntoa(bytes.fromhex(h)[::-1])

for line in open("/proc/net/route").read().splitlines()[1:]:
    iface, dest, gateway = line.split()[:3]
    print(f"{iface}: destination {hexip(dest):&lt;12} via gateway {hexip(gateway)}")

print("this machine's name:", socket.gethostname())
print("localhost resolves to:", socket.gethostbyname("localhost"))</div>
  <div class="fx" data-lang="text">eth0: destination 0.0.0.0      via gateway 192.0.2.1
eth0: destination 192.0.2.0    via gateway 0.0.0.0
this machine's name: vm
localhost resolves to: 127.0.0.1</div>
  <p>Read the two lines bottom-up. Anything for <code>192.0.2.x</code> (this VM's own small network) is delivered directly, with no gateway. Everything else, the destination <code>0.0.0.0</code> meaning "any address", is sent to the default gateway <code>192.0.2.1</code>. That second line is how a request to pypi.org leaves this machine. The last two lines show the machine's name and confirm that <code>localhost</code> is just another name for 127.0.0.1.</p>
  <p>That leaves a puzzle from the previous section: if your laptop has the private address <code>192.168.1.23</code>, and private addresses are not allowed on the internet, how can it fetch anything from pypi.org? The answer is <strong>NAT</strong> (Network Address Translation). When a packet leaves your home, the router rewrites the sender address from your private address to the router's single public address, and notes in a table which inside device and port the conversation belongs to. When the reply comes back to the public address, the router looks up the table and forwards it to the right device. It is like a company where every outgoing letter is stamped with the head office's address; replies come to head office, and the mail room uses its log to pass each one to the right employee.</p>
  <figure class="viz"><svg viewBox="0 0 660 210" width="660">
<defs><marker id="cfn-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="110" height="36" rx="6" class="fb sb"/><text x="65" y="36" text-anchor="middle" font-size="11">laptop</text><text x="65" y="50" text-anchor="middle" font-size="10" class="tm">192.168.1.23</text>
<rect x="10" y="87" width="110" height="36" rx="6" class="fb sb"/><text x="65" y="103" text-anchor="middle" font-size="11">phone</text><text x="65" y="117" text-anchor="middle" font-size="10" class="tm">192.168.1.24</text>
<rect x="10" y="154" width="110" height="36" rx="6" class="fb sb"/><text x="65" y="170" text-anchor="middle" font-size="11">printer</text><text x="65" y="184" text-anchor="middle" font-size="10" class="tm">192.168.1.30</text>
<rect x="165" y="80" width="90" height="50" rx="6" class="fs" stroke="currentColor"/><text x="210" y="102" text-anchor="middle" font-size="11">switch</text><text x="210" y="117" text-anchor="middle" font-size="9.5" class="tm">by MAC address</text>
<line x1="120" y1="38" x2="165" y2="95" stroke="currentColor"/><line x1="120" y1="105" x2="165" y2="105" stroke="currentColor"/><line x1="120" y1="172" x2="165" y2="115" stroke="currentColor"/>
<rect x="295" y="72" width="120" height="66" rx="6" class="fg sg"/><text x="355" y="92" text-anchor="middle" font-size="11">router + NAT</text><text x="355" y="107" text-anchor="middle" font-size="9.5" class="tm">inside 192.168.1.1</text><text x="355" y="121" text-anchor="middle" font-size="9.5" class="tm">outside 203.0.113.7</text>
<line x1="255" y1="105" x2="295" y2="105" stroke="currentColor"/>
<ellipse cx="490" cy="105" rx="48" ry="32" class="fs" stroke="currentColor"/><text x="490" y="102" text-anchor="middle" font-size="11">internet</text><text x="490" y="116" text-anchor="middle" font-size="9.5" class="tm">many routers</text>
<line x1="415" y1="105" x2="440" y2="105" stroke="currentColor" marker-end="url(#cfn-a1)"/>
<rect x="565" y="80" width="88" height="50" rx="6" class="fr sr"/><text x="609" y="100" text-anchor="middle" font-size="11">server</text><text x="609" y="115" text-anchor="middle" font-size="9.5" class="tm">public IP</text>
<line x1="538" y1="105" x2="563" y2="105" stroke="currentColor" marker-end="url(#cfn-a1)"/>
<text x="140" y="16" font-size="10" class="tb">LAN: private addresses</text><text x="440" y="60" font-size="10" class="tg" text-anchor="middle">sender rewritten to 203.0.113.7</text>
</svg><figcaption>A home LAN. The switch moves frames between local devices by MAC address; the router connects the LAN to the internet and uses NAT so every inside device shares the router's one public address.</figcaption></figure>
  <p>Follow the laptop's packet through the figure. It goes to the switch, which hands it to the router because the destination is not local. The router rewrites the sender to its public address <code>203.0.113.7</code> and sends it out across the internet, where a chain of other routers forwards it hop by hop to the server. The server replies to <code>203.0.113.7</code>, and the router's NAT table sends the reply back to the laptop. A side effect is important in practice: nobody outside can start a connection <em>to</em> the laptop, because the router has no table entry telling it which inside device should get an unexpected incoming packet. That is why you cannot simply share <code>http://192.168.1.23:8000</code> with a friend across town, and why cloud servers that must accept connections need a public IP or a load balancer in front of them. Docker uses the same trick on a single machine: containers get private addresses like <code>172.17.0.2</code>, and Docker NATs their traffic through the host (see <a class="xref" data-note="se_docker">Docker</a>).</p>

  <h2 id="cfn-ports"><span class="num">04</span>Ports and Sockets</h2>
  <p>An IP address gets a packet to the right machine, but one machine runs many networked programs at once: a database, a web server, an SSH server, your Jupyter notebook. When a packet arrives, the operating system needs to know which program should receive it. A <strong>port</strong> is a number from 0 to 65535 that identifies one program's "door" on a machine. If the IP address is the street address of an apartment building, the port is the flat number. A server program asks the operating system to <strong>listen</strong> on a port, which means "give me any connections that arrive for this number", and clients include that port number when they connect.</p>
  <p>Some ports are so standard that clients assume them unless told otherwise, and you will see these constantly:</p>
  <table class="tbl">
    <tr><th>Port</th><th>What usually listens there</th><th>Where you meet it</th></tr>
    <tr><td>22</td><td>SSH (secure remote shell)</td><td><code>ssh</code> into a cloud VM, <code>git</code> over SSH</td></tr>
    <tr><td>80</td><td>HTTP (unencrypted web)</td><td><code>http://</code> URLs; usually just redirects to 443 today</td></tr>
    <tr><td>443</td><td>HTTPS (encrypted web)</td><td>every <code>https://</code> URL, every API call, pip, the Hugging Face Hub</td></tr>
    <tr><td>5432</td><td>PostgreSQL</td><td><code>postgresql://user@host:5432/db</code> connection strings</td></tr>
    <tr><td>8000 / 8080 / 8888</td><td>development servers</td><td>uvicorn and Django (8000), many Java/proxy apps (8080), Jupyter (8888)</td></tr>
  </table>
  <p>Ports below 1024 are "well-known" ports and on Linux need administrator rights to listen on, which is why development servers pick numbers like 8000. When a URL has no port, the scheme implies one: <code>https://models.example.com/predict</code> really means port 443, and <code>http://127.0.0.1:8000</code> spells it out.</p>
  <p>The combination of an IP address, a port and a protocol is called a <strong>socket</strong>, and it is also the name of the programming interface every language uses for networking. A TCP connection is identified by both ends: the client's IP and port plus the server's IP and port. The client's port is not chosen by you; the operating system picks a random free high number for it, called an <strong>ephemeral port</strong>, just for this conversation. Here is the running example built at the lowest level, with Python's <code>socket</code> module. The server and client run in one script on loopback, and the server is shut down at the end so nothing is left running. The "model" is a one-line formula standing in for a real trained model:</p>
  <div class="fx" data-lang="py">import socket, threading

HOST, PORT = "127.0.0.1", 8000                 # loopback address, port 8000

def model(features):                           # stand-in for a trained model
    a, b = map(float, features.split(","))
    return round(0.3 * a + 0.5 * b, 2)

# --- server: bind to an address+port, listen, accept one client -----------
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)   # SOCK_STREAM = TCP
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind((HOST, PORT))
server.listen()
print("server listening on", server.getsockname())

seen = []
def serve_one():
    conn, client_addr = server.accept()        # blocks until a client connects
    with conn:
        seen.append(client_addr)
        features = conn.recv(1024).decode()
        conn.sendall(f"prediction={model(features)}".encode())

t = threading.Thread(target=serve_one)
t.start()

# --- client: connect to the server's address+port, send, receive ----------
with socket.create_connection((HOST, PORT)) as client:
    print("client: my end is", client.getsockname(), "-&gt; server", client.getpeername())
    client.sendall(b"2.0,3.5")
    print("client got:", client.recv(1024).decode())

t.join()
print("server saw a connection from", seen[0])
server.close()                                 # nothing left running
print("server stopped")</div>
  <div class="fx" data-lang="text">server listening on ('127.0.0.1', 8000)
client: my end is ('127.0.0.1', 37658) -&gt; server ('127.0.0.1', 8000)
client got: prediction=2.35
server saw a connection from ('127.0.0.1', 37658)
server stopped</div>
  <p>Read it in the order things happened. The server called <code>bind</code> to claim address 127.0.0.1 and port 8000, then <code>listen</code> to start accepting connections, and <code>accept</code> to wait for one. The client called <code>create_connection</code>, and the line "my end is" shows the ephemeral port the operating system gave it, paired with the server's fixed port 8000. The server saw exactly the same client address, because both sides describe the same connection. The client sent the bytes <code>2.0,3.5</code>, the server computed 0.3 × 2.0 + 0.5 × 3.5 = 2.35 and sent back <code>prediction=2.35</code>. Every networked library you use, from <code>requests</code> to <code>psycopg</code> to PyTorch's distributed backend, is built on these same calls.</p>
  <p>The tool that lists listening ports is <code>ss -tlnp</code> on Linux (older systems: <code>netstat -tlnp</code>; macOS: <code>lsof -iTCP -sTCP:LISTEN</code>). It is not installed here, but it reads its information from the kernel file <code>/proc/net/tcp</code>, so we can do the same in a few lines. The demo also shows the two errors you will hit most often with ports:</p>
  <div class="fx" data-lang="py">import socket

def listening_tcp():                           # a tiny "ss -tln" built on /proc
    rows = []
    for line in open("/proc/net/tcp").read().splitlines()[1:]:
        local, state = line.split()[1], line.split()[3]
        if state == "0A":                      # 0A = LISTEN
            ip_hex, port_hex = local.split(":")
            ip = socket.inet_ntoa(bytes.fromhex(ip_hex)[::-1])
            rows.append(f"{ip}:{int(port_hex, 16)}")
    return sorted(rows)

server = socket.socket()
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("127.0.0.1", 8000))
server.listen()
print("listening TCP sockets:", listening_tcp())

try:                                           # a second program wants the same port
    other = socket.socket()
    other.bind(("127.0.0.1", 8000))
except OSError as e:
    print("second bind:", e)
server.close()

try:                                           # nobody is listening on 8000 any more
    socket.create_connection(("127.0.0.1", 8000))
except ConnectionRefusedError as e:
    print("connect after close:", e)
print("well-known names:", {p: socket.getservbyport(p) for p in (22, 80, 443, 5432)})</div>
  <div class="fx" data-lang="text">listening TCP sockets: ['0.0.0.0:2024', '127.0.0.1:34559', '127.0.0.1:34567', '127.0.0.1:8000']
second bind: [Errno 98] Address already in use
connect after close: [Errno 111] Connection refused
well-known names: {22: 'ssh', 80: 'http', 443: 'https', 5432: 'postgresql'}</div>
  <p>While our server was running, port 8000 showed up as a listening socket next to a few others belonging to this environment's own tooling (one listening on <code>0.0.0.0</code>, which means "every network interface", and the rest on 127.0.0.1 only). Trying to bind a second socket to the same port failed with <strong>Address already in use</strong>: only one program may listen on a given address and port, which is the error you get when you start uvicorn twice or an old Jupyter kernel still holds the port. After the server closed, connecting failed with <strong>Connection refused</strong>: the machine was reachable, but nothing was listening on that port, so the operating system replied "no" immediately. That is very different from a <em>timeout</em>, where no reply comes back at all, usually because a firewall silently dropped the packets or the address is wrong. Knowing which of the two you got tells you where to look. The last line shows that the system's services list knows the standard names for ports 22, 80, 443 and 5432.</p>

  <h2 id="cfn-tcpudp"><span class="num">05</span>TCP and UDP</h2>
  <p>Remember that data travels in packets, and packets can be lost, duplicated or arrive in a different order from how they were sent, because each one may take a different route through busy routers. IP itself does nothing about this; it just makes a best effort to deliver each packet. If you are sending a model file or a database query, that is not acceptable: a missing chunk corrupts the file. Two protocols sit on top of IP and offer two different deals, and almost every program uses one of them.</p>
  <p><strong>TCP</strong> (Transmission Control Protocol) gives the program a reliable, ordered stream of bytes. Whatever the sender writes, the receiver reads exactly, in the same order, with nothing missing, or the connection reports an error. It achieves this by numbering every byte, having the receiver send back acknowledgements ("I have everything up to byte 5,000"), re-sending anything that is not acknowledged in time, and slowing down when the network looks congested. Before any data flows, TCP sets up a <strong>connection</strong> with the <strong>three-way handshake</strong>:</p>
  <figure class="viz"><svg viewBox="0 0 560 250" width="560">
<defs><marker id="cfn-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="120" y="20" text-anchor="middle" font-size="12" class="tb">client</text><text x="440" y="20" text-anchor="middle" font-size="12" class="tr">server :8000</text>
<line x1="120" y1="30" x2="120" y2="240" class="sb" stroke-width="2"/><line x1="440" y1="30" x2="440" y2="240" class="sr" stroke-width="2"/>
<line x1="120" y1="50" x2="438" y2="80" stroke="currentColor" marker-end="url(#cfn-a2)"/><text x="280" y="56" text-anchor="middle" font-size="11">1. SYN  "can we talk? my numbers start at x"</text>
<line x1="440" y1="95" x2="122" y2="125" stroke="currentColor" marker-end="url(#cfn-a2)"/><text x="280" y="101" text-anchor="middle" font-size="11">2. SYN-ACK  "yes, got x; mine start at y"</text>
<line x1="120" y1="140" x2="438" y2="170" stroke="currentColor" marker-end="url(#cfn-a2)"/><text x="280" y="146" text-anchor="middle" font-size="11">3. ACK  "got y" (connection open)</text>
<line x1="120" y1="185" x2="438" y2="205" class="sg" stroke-width="2" marker-end="url(#cfn-a2)"/><text x="280" y="190" text-anchor="middle" font-size="11" class="tg">data: "2.0,3.5"</text>
<line x1="440" y1="215" x2="122" y2="235" class="sg" stroke-width="2" marker-end="url(#cfn-a2)"/><text x="280" y="222" text-anchor="middle" font-size="11" class="tg">data: "prediction=2.35"</text>
<text x="20" y="110" font-size="10" class="tm">1 round trip</text><text x="20" y="124" font-size="10" class="tm">before any data</text>
</svg><figcaption>The TCP three-way handshake. Time runs downwards; each diagonal arrow is a packet crossing the network. Only after SYN, SYN-ACK, ACK does the request data flow.</figcaption></figure>
  <p>Walk through the figure. The client sends a <strong>SYN</strong> ("synchronise") packet with a random starting number for its bytes. The server answers with <strong>SYN-ACK</strong>, acknowledging the client's number and giving its own. The client replies <strong>ACK</strong>, and the connection is open. Only then does <code>2.0,3.5</code> travel. This is exactly what happened inside <code>create_connection</code> and <code>accept</code> in the previous demo; the operating system did the handshake for us. It is like a phone call: you dial, the other person says "hello?", you say "hi, it's me", and only then does the real conversation start. The cost is one full <strong>round trip</strong> across the network before the first useful byte, which matters a lot when the server is far away, and is why clients reuse connections instead of opening a new one per request. When the conversation ends, each side sends a <strong>FIN</strong> packet to close it politely.</p>
  <p><strong>UDP</strong> (User Datagram Protocol) offers the opposite deal. There is no connection and no handshake: the program sends individual messages called <strong>datagrams</strong>, each one delivered whole or not at all, with no acknowledgements, no re-sending, and no ordering guarantee. It is like posting postcards: cheap and quick, but you never learn whether one got lost. Here is UDP on loopback, sending the kind of small metric message that monitoring agents send:</p>
  <div class="fx" data-lang="py">import socket

receiver = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)   # SOCK_DGRAM = UDP
receiver.bind(("127.0.0.1", 9999))
receiver.settimeout(1)

sender = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
for i in range(3):                             # no connect(), no handshake
    sender.sendto(f"metric gpu_util={70 + i}".encode(), ("127.0.0.1", 9999))

for _ in range(3):
    data, addr = receiver.recvfrom(1024)       # each datagram arrives as one unit
    print("received", data.decode(), "from", addr)

sent = sender.sendto(b"hello?", ("127.0.0.1", 9998))   # nobody listens on 9998
print("sendto a closed port returned", sent, "- no error, no delivery guarantee")
sender.close(); receiver.close()</div>
  <div class="fx" data-lang="text">received metric gpu_util=70 from ('127.0.0.1', 49369)
received metric gpu_util=71 from ('127.0.0.1', 49369)
received metric gpu_util=72 from ('127.0.0.1', 49369)
sendto a closed port returned 6 - no error, no delivery guarantee</div>
  <p>There was no <code>listen</code>, no <code>accept</code> and no <code>connect</code>: the sender just fired three datagrams at port 9999, and the receiver read each one as a separate whole message. The last line is the important difference. Sending to port 9998, where nothing is listening, returned "6 bytes sent" without any error. With TCP the same mistake gives an immediate "Connection refused"; with UDP the message simply vanishes, and the sender never knows. (On loopback nothing was actually lost; across a real network, some percentage of UDP datagrams can be dropped and the application must cope.)</p>
  <p>So why would anyone choose the unreliable one? Because reliability costs time. When data is only useful if it arrives <em>now</em>, waiting to re-send a lost packet is worse than skipping it. A video call that paused to recover a 20-millisecond-old frame would feel broken; it is better to drop it and show the next one. That is why UDP is used for video and voice calls, online games, live streaming, and DNS lookups (one tiny question and one tiny answer, where re-asking is cheaper than setting up a connection). Monitoring tools such as StatsD send metrics over UDP so that a slow metrics server can never slow down the application. TCP is used whenever every byte matters: HTTP and HTTPS, SSH, database connections, file transfers, Kafka, and Spark's data shuffles. A newer protocol called <strong>QUIC</strong>, used by HTTP/3, builds its own reliability on top of UDP to avoid some of TCP's delays, so "UDP means unreliable" is about UDP itself, not every protocol built on it.</p>
  <table class="tbl">
    <tr><th></th><th>TCP</th><th>UDP</th></tr>
    <tr><td>Connection</td><td>yes, three-way handshake first</td><td>none; just send</td></tr>
    <tr><td>Delivery</td><td>guaranteed, or an error</td><td>best effort; may be lost silently</td></tr>
    <tr><td>Order</td><td>preserved</td><td>not guaranteed</td></tr>
    <tr><td>Data unit</td><td>a continuous byte stream</td><td>separate datagrams</td></tr>
    <tr><td>Overhead</td><td>higher (acks, re-sends, congestion control)</td><td>very low</td></tr>
    <tr><td>Used by</td><td>HTTP(S), SSH, PostgreSQL, Kafka, file transfer</td><td>DNS, video/voice, games, metrics, QUIC/HTTP/3</td></tr>
  </table>

  <h2 id="cfn-dns"><span class="num">06</span>DNS</h2>
  <p>So far our client connected to <code>127.0.0.1</code>. Real code says <code>models.example.com</code> or <code>pypi.org</code>, but packets can only be addressed to IP numbers. People are good at remembering names and bad at remembering numbers, and servers change IP addresses when they move between machines or data centres. The <strong>Domain Name System</strong>, or <strong>DNS</strong>, solves both problems: it is a worldwide, distributed directory that turns a hostname into the IP addresses currently serving it. Think of the contacts app on your phone: you tap "Asha" and it dials her number for you, and if she changes her number you update one contact instead of memorising the new digits.</p>
  <p>No single computer holds the whole directory. It is split up following the dots in the name, read from right to left. A set of <strong>root servers</strong> knows who is in charge of each top-level domain such as <code>.com</code> or <code>.org</code>; the <code>.com</code> servers know which <strong>authoritative name server</strong> is in charge of <code>example.com</code>; and that server holds the actual answer for <code>models.example.com</code>. Your computer does not walk this chain itself. It asks a <strong>resolver</strong> (usually run by your internet provider, your company, a cloud provider, or a public service like Google's <code>8.8.8.8</code>), which does the walking and remembers the answers.</p>
  <figure class="viz"><svg viewBox="0 0 620 240" width="620">
<defs><marker id="cfn-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="95" width="120" height="50" rx="6" class="fb sb"/><text x="70" y="115" text-anchor="middle" font-size="11">your laptop</text><text x="70" y="130" text-anchor="middle" font-size="9.5" class="tm">OS cache, /etc/hosts</text>
<rect x="215" y="95" width="130" height="50" rx="6" class="fg sg"/><text x="280" y="115" text-anchor="middle" font-size="11">resolver</text><text x="280" y="130" text-anchor="middle" font-size="9.5" class="tm">e.g. 8.8.8.8, caches</text>
<rect x="450" y="15" width="160" height="40" rx="6" class="fs" stroke="currentColor"/><text x="530" y="39" text-anchor="middle" font-size="11">root server</text>
<rect x="450" y="100" width="160" height="40" rx="6" class="fs" stroke="currentColor"/><text x="530" y="124" text-anchor="middle" font-size="11">.com TLD server</text>
<rect x="450" y="185" width="160" height="40" rx="6" class="fr sr"/><text x="530" y="203" text-anchor="middle" font-size="11">example.com's</text><text x="530" y="217" text-anchor="middle" font-size="11">authoritative server</text>
<line x1="130" y1="110" x2="213" y2="110" stroke="currentColor" marker-end="url(#cfn-a3)"/><text x="172" y="103" text-anchor="middle" font-size="10">1</text>
<line x1="215" y1="132" x2="132" y2="132" stroke="currentColor" marker-end="url(#cfn-a3)"/><text x="172" y="148" text-anchor="middle" font-size="10">8: IP</text>
<line x1="345" y1="102" x2="448" y2="40" stroke="currentColor" marker-end="url(#cfn-a3)"/><text x="385" y="62" font-size="10">2 / 3: ask .com</text>
<line x1="345" y1="120" x2="448" y2="120" stroke="currentColor" marker-end="url(#cfn-a3)"/><text x="365" y="114" font-size="10">4 / 5</text>
<line x1="345" y1="138" x2="448" y2="200" stroke="currentColor" marker-end="url(#cfn-a3)"/><text x="360" y="185" font-size="10">6 / 7: the IP</text>
</svg><figcaption>Resolving models.example.com when nothing is cached: the laptop asks the resolver (1); the resolver asks a root server, which refers it to the .com servers (2–3), which refer it to example.com's authoritative server (4–5), which gives the IP (6–7); the resolver returns it to the laptop (8) and caches it.</figcaption></figure>
  <p>The figure shows the slow path, when nobody has the answer yet. In practice almost every lookup is answered from a <strong>cache</strong>. Every DNS answer comes with a <strong>TTL</strong> (time to live), a number of seconds the answer may be reused, often between 60 and 3,600. Your browser, your operating system and the resolver all keep answers until their TTL runs out, so a popular name is usually resolved in a millisecond or two from a nearby cache instead of a chain of round trips. Caching has a famous downside: if you move a service to a new IP address, some clients keep using the old one until their cached copy expires, which is why engineers lower the TTL before a migration. Before any of this, the operating system also checks the local file <code>/etc/hosts</code>, which can map names to addresses by hand; that is how <code>localhost</code> works without any DNS server.</p>
  <p>The directory holds different kinds of entries, called <strong>record types</strong>. An <strong>A record</strong> maps a name to an IPv4 address, and an <strong>AAAA record</strong> to an IPv6 address. A <strong>CNAME record</strong> (canonical name) says "this name is an alias; look up that other name instead", which is how a company points <code>files.example.com</code> at a content-delivery network without knowing that network's IP addresses. (There are others, such as MX for email servers and TXT for verification strings, which you will meet when configuring a domain.) Lookups from this machine work for the hosts the sandbox allows, so we can see real answers. <code>socket.getaddrinfo</code> is the function every Python HTTP client calls before connecting:</p>
  <div class="fx" data-lang="py">import socket

# getaddrinfo: what every Python HTTP library calls before it connects
for family, kind, proto, _, addr in socket.getaddrinfo("pypi.org", 443, type=socket.SOCK_STREAM):
    print(family.name, kind.name, addr)

# gethostbyname_ex shows CNAME aliases: (canonical name, aliases, addresses)
print(socket.gethostbyname_ex("files.pythonhosted.org"))
print(socket.gethostbyname_ex("localhost"))    # answered from /etc/hosts, no DNS server

try:
    socket.getaddrinfo("no-such-host.invalid", 443)
except socket.gaierror as e:
    print("gaierror:", e)</div>
  <div class="fx" data-lang="text">AF_INET SOCK_STREAM ('151.101.0.223', 443)
AF_INET SOCK_STREAM ('151.101.192.223', 443)
AF_INET SOCK_STREAM ('151.101.64.223', 443)
AF_INET SOCK_STREAM ('151.101.128.223', 443)
('dualstack.python.map.fastly.net', ['files.pythonhosted.org'], ['151.101.192.223', '151.101.0.223', '151.101.128.223', '151.101.64.223'])
('localhost', [], ['127.0.0.1'])
gaierror: [Errno -2] Name or service not known</div>
  <p>pypi.org resolved to four IPv4 addresses (A records); a big site lists several so clients can spread out and fall back if one fails, and the order changes between lookups. The second lookup shows a CNAME in action: <code>files.pythonhosted.org</code>, where pip downloads package files from, is an alias, and its canonical name is <code>dualstack.python.map.fastly.net</code>, a name belonging to the Fastly content-delivery network that actually serves the files. <code>localhost</code> came from <code>/etc/hosts</code>. The last lookup failed with <code>gaierror</code> ("get address info error"), the exception you see when a hostname is misspelled, when DNS is unreachable, or, inside a company network or container, when the name only exists on a different network. The same configuration is visible from the shell:</p>
  <div class="fx" data-lang="text">$ cat /etc/resolv.conf
nameserver 8.8.8.8
nameserver 8.8.4.4
options timeout:2 attempts:3
$ grep hosts /etc/nsswitch.conf
hosts:          files dns
$ getent hosts localhost pypi.org
127.0.0.1       localhost
151.101.0.223   pypi.org
151.101.192.223 pypi.org
151.101.64.223  pypi.org
151.101.128.223 pypi.org</div>
  <p><code>/etc/resolv.conf</code> names the resolvers this machine asks (Google's public ones here). The <code>nsswitch.conf</code> line says "check files, meaning <code>/etc/hosts</code>, first, then DNS". <code>getent hosts</code> performs the same lookup your programs perform. On a normal machine you would also use <code>dig pypi.org</code> or <code>nslookup pypi.org</code>, which query DNS directly and show the record types and TTLs; they are not installed here. In Kubernetes you meet DNS constantly, because services find each other by names like <code>postgres.default.svc.cluster.local</code> that a cluster DNS server resolves (see <a class="xref" data-note="mlops_k8s">Kubernetes</a>).</p>

  <h2 id="cfn-model"><span class="num">07</span>The TCP/IP Model</h2>
  <p>We have now met many protocols, and it helps to see how they fit together, because each one solves exactly one problem and relies on the one below for everything else. HTTP does not know about lost packets; TCP takes care of that. TCP does not know how to find a machine across the world; IP does that. IP does not know about Wi-Fi radio signals; the network card does that. Stacking protocols like this, each layer using the one below and serving the one above, is called a <strong>protocol stack</strong>, and the standard description of the internet's stack is the <strong>TCP/IP model</strong>, with four layers.</p>
  <p>Sending a letter through a company is a good picture. You write the letter (application layer) and put it in an envelope marked for a person and department (transport layer, like a port). The mail room puts that into a bag addressed to the other company's building (internet layer, like an IP address). The courier van carries the bag along actual roads (link layer). Each stage wraps what it received with its own label and hands it down; at the other end each stage removes its own label and hands the contents up. This wrapping is called <strong>encapsulation</strong>: our 7 bytes <code>2.0,3.5</code> get a TCP header with the ports, then an IP header with the addresses, then an Ethernet frame header with the MAC addresses, and the receiving machine peels them off in reverse.</p>
  <p>You will also hear about the <strong>OSI model</strong>, a seven-layer reference model from the 1980s. Nobody builds networks from it directly, but its layer numbers became common vocabulary: "a layer 4 load balancer" works with TCP ports, "a layer 7 load balancer" understands HTTP paths. This one table is all you need to translate between the two models:</p>
  <table class="tbl">
    <tr><th>TCP/IP layer</th><th>OSI layers</th><th>Job</th><th>Examples</th><th>Address used</th></tr>
    <tr><td>Application</td><td>7 Application, 6 Presentation, 5 Session</td><td>what the data means</td><td>HTTP, DNS, SSH, TLS, PostgreSQL protocol</td><td>URL, hostname</td></tr>
    <tr><td>Transport</td><td>4 Transport</td><td>which program; reliable or not</td><td>TCP, UDP</td><td>port</td></tr>
    <tr><td>Internet</td><td>3 Network</td><td>which machine, across networks</td><td>IP (v4/v6), routers</td><td>IP address</td></tr>
    <tr><td>Link</td><td>2 Data link, 1 Physical</td><td>the next hop on one physical network</td><td>Ethernet, Wi-Fi, switches, cables</td><td>MAC address</td></tr>
  </table>
  <p>The table also works as a debugging checklist, from the bottom up: is the link up (cable, Wi-Fi)? Can I reach the IP (ping, routing)? Is something listening on the port (connection refused vs timeout)? Does the application answer correctly (HTTP status codes)? Most of the rest of this page lives in the top row.</p>

  <h2 id="cfn-https"><span class="num">08</span>HTTP, HTTPS and TLS</h2>
  <p>Our raw socket demo invented its own message format: send <code>2.0,3.5</code>, get back <code>prediction=2.35</code>. That works only because we wrote both sides. For any client in the world to talk to any server, they need a shared application-level format, and for the web and almost every API that format is <strong>HTTP</strong> (HyperText Transfer Protocol). An HTTP request is a few lines of plain text: a method (<code>GET</code>, <code>POST</code>…), a path, some headers, and optionally a body; the response is a status line such as <code>200 OK</code>, headers, and a body. Here is our model service rewritten as a real HTTP server using only the standard library, with the client written as a raw socket so you can see the exact bytes that cross the network:</p>
  <div class="fx" data-lang="py">import socket, threading, json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class PredictHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        a, b = float(q["a"][0]), float(q["b"][0])
        body = json.dumps({"prediction": round(0.3 * a + 0.5 * b, 2)}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *args):              # keep the demo output quiet
        pass

httpd = HTTPServer(("127.0.0.1", 8000), PredictHandler)
threading.Thread(target=httpd.serve_forever).start()

request = (b"GET /predict?a=2.0&amp;b=3.5 HTTP/1.1\r\n"
           b"Host: 127.0.0.1:8000\r\n"
           b"Connection: close\r\n\r\n")
with socket.create_connection(("127.0.0.1", 8000)) as s:
    s.sendall(request)                         # HTTP is just text sent over TCP
    response = b""
    while chunk := s.recv(4096):
        response += chunk

print("--- request bytes ---")
print(request.decode().strip())
print("--- response bytes ---")
print(response.decode())
httpd.shutdown(); httpd.server_close()</div>
  <div class="fx" data-lang="text">--- request bytes ---
GET /predict?a=2.0&amp;b=3.5 HTTP/1.1
Host: 127.0.0.1:8000
Connection: close
--- response bytes ---
HTTP/1.1 200 OK
Server: BaseHTTP/0.6 Python/3.13.18
Date: Thu, 19 Nov 2026 05:33:31 GMT
Content-Type: application/json
Content-Length: 20

{"prediction": 2.35}</div>
  <p>This is the whole secret of HTTP: it is text sent over a TCP connection. The request line asks for <code>/predict?a=2.0&amp;b=3.5</code>, the <code>Host</code> header names the site (one server can host many), and after a blank line the server answers with status <code>200 OK</code>, headers describing the body (JSON, 20 bytes), then the body itself, <code>{"prediction": 2.35}</code>. When you call <code>requests.get(url)</code> or FastAPI handles a request, these are the bytes underneath. Methods, status codes, headers, REST design and how frameworks build on this are covered in <a class="xref" data-note="api_fundamentals">API Fundamentals</a>; this page stays with the networking.</p>
  <p>The problem with plain HTTP is that it is readable by anyone in between. The request and response pass through your Wi-Fi router, your internet provider and several other networks, and every one of them could read the API key in a header, read the prediction, or even change it on the way. <strong>HTTPS</strong> is HTTP sent inside a <strong>TLS</strong> (Transport Layer Security) connection, on port 443. TLS gives three guarantees: <em>confidentiality</em> (people in between see only scrambled bytes), <em>integrity</em> (any change in transit is detected) and <em>authentication</em> (you really are talking to <code>pypi.org</code>, not an impostor). The old name for TLS is SSL, and people still say "SSL certificate".</p>
  <p>To understand TLS, it helps to separate three tools that are often mixed up. <strong>Encryption</strong> scrambles data with a <strong>key</strong> so that only someone with the right key can unscramble it; it is two-way by design. In <strong>symmetric encryption</strong> the same key locks and unlocks (fast, used for the actual data). In <strong>asymmetric</strong> or <strong>public-key encryption</strong> there is a pair: a public key anyone may know and a private key only the owner has; what one key locks, only the other unlocks, which lets two strangers set up a shared secret and lets an owner produce a signature that anyone can check. <strong>Hashing</strong> is different: a hash function turns any input into a fixed-size fingerprint, one way only, with no key, so the same input always gives the same fingerprint and you cannot get the input back. A padlock you can open with a key is encryption; a fingerprint taken from a person is a hash.</p>
  <div class="fx" data-lang="py">import hashlib
from cryptography.fernet import Fernet

# Hashing: one-way fingerprint. Same input -&gt; same output; no key; cannot be reversed.
for text in ["model-v1.pt", "model-v1.pt", "model-v2.pt"]:
    print(text, hashlib.sha256(text.encode()).hexdigest()[:16], "...")

# Encryption: two-way. Anyone with the key can get the original back.
key = Fernet.generate_key()
box = Fernet(key)
secret = box.encrypt(b"db_password=hunter2")
print("encrypted:", secret[:32], "...")
print("decrypted:", box.decrypt(secret))</div>
  <div class="fx" data-lang="text">model-v1.pt a2fee9d6ad2105a1 ...
model-v1.pt a2fee9d6ad2105a1 ...
model-v2.pt 7aac3793bcb28c1f ...
encrypted: b'gAAAAABq_oorrLtYO_YTSSiar5gcTg1g' ...
decrypted: b'db_password=hunter2'</div>
  <p>The same filename gave the same SHA-256 fingerprint both times, and changing one character changed it completely; nothing can turn the fingerprint back into the name. That makes hashes right for checking that a downloaded file was not corrupted or tampered with (pip checks package hashes; model hubs publish them), and, with a slow salted hash like bcrypt, for storing passwords so that even the database owner cannot read them. The encrypted message, by contrast, came back exactly with the key, which is right for anything you must read later, such as a database password in a secrets store. TLS uses all of these: public-key cryptography to authenticate the server and agree on a key, fast symmetric encryption for the data, and hashes to detect tampering. Passwords, tokens and API authentication in depth are in <a class="xref" data-note="api_auth">API Authentication</a>.</p>
  <p>How does your client know it is talking to the real pypi.org and not someone pretending? With a <strong>certificate</strong>: a small file that says "this public key belongs to <code>pypi.org</code>, valid from this date to this date", signed by a <strong>certificate authority</strong> (CA), an organisation trusted to check who owns a domain. Your operating system and Python ship with a list of trusted CA certificates. It works like a passport: the border officer has never met you, but trusts the government that issued it, and checks that the photo matches your face and the date has not expired. During the <strong>TLS handshake</strong>, which happens right after the TCP handshake, the server sends its certificate, the client checks that a trusted CA signed it, that the name matches the host it wanted, and that it is in date, and then the two sides agree on a fresh symmetric key for this connection. Here is a real TLS connection from this machine:</p>
  <div class="fx" data-lang="py">import socket, ssl

ctx = ssl.create_default_context()             # trusts the CAs installed on this machine
with socket.create_connection(("pypi.org", 443), timeout=5) as raw:
    with ctx.wrap_socket(raw, server_hostname="pypi.org") as tls:
        cert = tls.getpeercert()
        print("protocol:", tls.version())
        print("cipher:  ", tls.cipher()[0])
        print("cert for:", dict(x[0] for x in cert["subject"])["commonName"])
        print("names:   ", [v for k, v in cert["subjectAltName"]])
        print("valid:   ", cert["notBefore"], "-&gt;", cert["notAfter"])

empty = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)   # verifies, but trusts no CA at all
try:
    with socket.create_connection(("pypi.org", 443), timeout=5) as raw:
        empty.wrap_socket(raw, server_hostname="pypi.org")
except ssl.SSLCertVerificationError as e:
    print("with no trusted CAs:", e.verify_message)</div>
  <div class="fx" data-lang="text">protocol: TLSv1.3
cipher:   TLS_AES_256_GCM_SHA384
cert for: pypi.org
names:    ['pypi.org']
valid:    Nov 19 00:46:14 2026 GMT -&gt; Dec 19 00:47:14 2026 GMT
with no trusted CAs: self-signed certificate in certificate chain</div>
  <p>The connection used TLS 1.3 with AES-256 encryption, and the certificate is for the name <code>pypi.org</code>, so the name check passed: the client checked that the certificate was signed by a CA it trusts, that today falls inside the validity dates, and that the name matches the host it asked for. The second attempt shows what happens when that trust is missing. With an empty list of trusted CAs the very same certificate is rejected with "certificate verify failed", which is exactly the error you see when a laptop or container lacks the right CA certificates. You meet it most often on company networks: many companies route outbound traffic through a TLS-inspecting proxy that decrypts, checks and re-encrypts it with the company's own CA, so tools on your machine only work once that company CA is installed in their trust store. The fix is to install the CA (or point <code>REQUESTS_CA_BUNDLE</code> / <code>SSL_CERT_FILE</code> at it), never to turn verification off with <code>verify=False</code>, which removes the protection against impostors entirely.</p>
  <p>In production you rarely handle TLS in your own Python code. A load balancer or reverse proxy in front of your service holds the certificate and does the encryption ("TLS termination"), then forwards plain HTTP to your app on a private network. That and the rest of running APIs for real, including timeouts and retries, are in <a class="xref" data-note="api_production">APIs in Production</a>.</p>

  <h2 id="cfn-middle"><span class="num">09</span>Firewalls, Proxies and VPNs</h2>
  <p>Between a client and a server there are usually several machines whose job is not to answer requests but to control, hide or redirect them. You will run into each of them when something "can't connect", so it pays to know what each one does.</p>
  <p>A <strong>firewall</strong> decides which network traffic is allowed in or out, using rules such as "allow incoming TCP on port 443 from anywhere; allow port 5432 only from the app servers; drop everything else". It is the security guard at the building entrance with a list of who may enter which door. Firewalls run on routers, on each machine (Linux's <code>iptables</code>/<code>nftables</code>, Windows Firewall) and in the cloud, where AWS calls them <strong>security groups</strong>. A blocked packet is usually dropped silently rather than refused, which is why a firewall problem shows up as a <em>timeout</em>, not "connection refused". The classic cloud story: you start a model server on an EC2 instance on port 8000, it works with <code>curl</code> from inside the instance, but times out from your laptop, because the security group only allows port 22.</p>
  <p>We have already met <strong>NAT</strong> in section 03: a router rewriting private addresses to its public one, which as a side effect blocks unsolicited incoming connections. A cloud <strong>NAT gateway</strong> does the same for servers in a private subnet that need to download packages but must never be reachable from outside.</p>
  <p>A <strong>proxy</strong> is a server that makes requests on your behalf: your client connects to the proxy, and the proxy connects to the real destination. A <strong>forward proxy</strong> sits in front of clients; companies use it to filter, log or inspect outgoing traffic, and programs find it through environment variables such as <code>HTTPS_PROXY</code> and <code>NO_PROXY</code>, which pip, <code>requests</code>, curl and most tools read automatically. This sandbox works much like a strict company network: outbound HTTPS goes through a proxy and gateway that allow only an approved list of hosts, which is why the demos on this page reach pypi.org but would be refused for most other sites. A <strong>reverse proxy</strong> sits in front of servers instead: clients think they are talking to the website, but the reverse proxy (nginx, a cloud load balancer, Cloudflare) receives every request, terminates TLS, and forwards it to one of several app servers behind it. A <strong>load balancer</strong> is a reverse proxy whose main job is to spread requests across many copies of a service, so your model API can run on four machines behind one name. The difference is simply whose side the proxy is on: a forward proxy acts for the clients, a reverse proxy acts for the servers.</p>
  <p>A <strong>VPN</strong> (Virtual Private Network) creates an encrypted tunnel from your device to another network, so that your laptop at home behaves as if it were plugged into the office network: you get an address on that network and can reach its private servers, such as an internal database at <code>10.2.0.15</code>, while everyone in between sees only encrypted traffic to the VPN server. A common data-science surprise is that a notebook can reach the company warehouse only while the VPN is connected, because the warehouse has a private address. Cloud providers use the same idea to link a company's data centre to its cloud VPC.</p>

  <h2 id="cfn-speed"><span class="num">10</span>Latency, Bandwidth, ping and traceroute</h2>
  <p>"The network is slow" can mean two completely different things, and the fix depends on which. <strong>Latency</strong> is how long it takes one small message to get from A to B, measured in milliseconds; usually people quote the <strong>round-trip time</strong> (RTT), there and back. <strong>Bandwidth</strong> is how much data the link can carry per second, measured in megabits or gigabits per second (Mbit/s, Gbit/s; note bits, not bytes, so 100 Mbit/s is about 12.5 MB/s). Picture a motorway: latency is how long one car takes to drive from one city to the other, which depends mainly on distance; bandwidth is how many lanes there are. Adding lanes does not make any single car arrive sooner. <strong>Throughput</strong> is the rate you actually achieve, which is usually lower than the bandwidth because of other traffic, protocol overhead, TCP slowly ramping up its speed, or a slow server.</p>
  <p>Latency has a hard floor set by physics: light in fibre travels about 200 km per millisecond, so a round trip between London and New York (about 5,600 km each way) can never be faster than about 56 ms, and real routes are longer. This is why the TCP and TLS handshakes matter: each extra round trip adds the full RTT. For many small requests, such as an API called in a loop or a database queried row by row, latency dominates and the fix is fewer round trips: batch requests, reuse connections, or move the code closer to the data. For big transfers, such as downloading a dataset or shuffling data between Spark nodes, bandwidth dominates. Here are both measured from this machine. Timings are approximate and vary from run to run:</p>
  <div class="fx" data-lang="py">import socket, time, urllib.request

def connect_ms(host, port):
    t = time.perf_counter()
    socket.create_connection((host, port), timeout=5).close()
    return round((time.perf_counter() - t) * 1000, 2)

srv = socket.socket()                           # a throwaway local listener; the
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)   # kernel completes the
srv.bind(("127.0.0.1", 8000)); srv.listen()                 # handshake for us
print("connect to 127.0.0.1:8000 (ms):", [connect_ms("127.0.0.1", 8000) for _ in range(3)])
srv.close()
print("connect to pypi.org:443   (ms):", [connect_ms("pypi.org", 443) for _ in range(3)])

t = time.perf_counter()
with urllib.request.urlopen("https://pypi.org/simple/numpy/", timeout=20) as r:
    first_byte = time.perf_counter()            # DNS + TCP + TLS + server time
    body = r.read()
done = time.perf_counter()
secs = done - first_byte
print(f"time to first byte: {(first_byte - t) * 1000:.0f} ms")
print(f"then {len(body) / 1e6:.2f} MB in {secs * 1000:.0f} ms "
      f"= throughput about {len(body) * 8 / secs / 1e6:.0f} Mbit/s")</div>
  <div class="fx" data-lang="text">connect to 127.0.0.1:8000 (ms): [1.18, 0.03, 0.02]
connect to pypi.org:443   (ms): [1.5, 1.07, 1.0]
time to first byte: 102 ms
then 2.40 MB in 496 ms = throughput about 39 Mbit/s</div>
  <p>A TCP connect to loopback took a few hundredths of a millisecond after the first one, since nothing leaves the machine. A connect to pypi.org took only about a millisecond, which is surprisingly fast: this VM sits in a data centre, and the machine that completes the handshake (a nearby content-delivery edge server or this environment's gateway) is very close. The time to first byte of a real HTTPS request was far longer, tens to around a hundred milliseconds, because it includes DNS, the TCP handshake, the TLS handshake, sending the request and the server working on it. Then the 2.4 MB body arrived at a throughput of tens to a couple of hundred Mbit/s (it varies a lot between runs, because the link is shared with other traffic, which is exactly the gap between bandwidth and throughput). From a home laptop, the connect alone would typically take 10–100 ms. In short, for one small request most of the time is waiting (latency), while for a large body the time is moving bytes (throughput).</p>
  <p>Two classic command-line tools measure latency and the path. <strong>ping</strong> sends small ICMP "echo request" packets (ICMP is a helper protocol at the IP layer for control messages) and reports how long each echo reply took. <strong>traceroute</strong> (<code>tracert</code> on Windows) discovers the routers along the path by sending packets that are allowed to survive only 1 hop, then 2, then 3, and so on; each router that has to discard one sends back a "time exceeded" message, revealing its address. Neither is installed in this container, and sandboxes and cloud networks often block ICMP anyway:</p>
  <div class="fx" data-lang="text">$ ping -c 3 pypi.org
bash: line 1: ping: command not found
$ traceroute pypi.org
bash: line 1: traceroute: command not found</div>
  <p>On a normal laptop, <code>ping -c 3 pypi.org</code> prints one line per reply such as <code>64 bytes from 151.101.64.223: icmp_seq=1 ttl=57 time=12.4 ms</code>, followed by a summary with packet loss and the minimum, average and maximum round-trip time. <code>traceroute pypi.org</code> prints one numbered line per hop: your home router first (around 1 ms), then your provider's routers, then the backbone, with the time growing as the hops get farther away, and <code>* * *</code> for routers that do not reply. When ping fails it does not prove the server is down, since many servers and firewalls ignore ICMP; testing the actual port, with <code>curl -v https://host</code> or Python's <code>socket.create_connection</code>, is the more reliable check.</p>

  <h2 id="cfn-url"><span class="num">11</span>What Happens When You Type a URL</h2>
  <p>This is the most famous networking interview question because answering it well uses every idea on this page. Let us follow your colleague's request to <code>https://models.example.com/predict?a=2.0&amp;b=3.5</code>, whether it is typed into a browser or passed to <code>requests.get</code>. The steps are the same.</p>
  <p>First the client <strong>parses the URL</strong>. The scheme <code>https</code> means "HTTP over TLS" and implies port 443; the host is <code>models.example.com</code>; the path and query are <code>/predict?a=2.0&amp;b=3.5</code>. Next it needs an IP address, so it does a <strong>DNS lookup</strong>. It checks its own cache, then the operating system's cache and <code>/etc/hosts</code>, and if there is no fresh answer it asks the configured resolver over UDP port 53. The resolver either answers from its cache or walks root → <code>.com</code> → <code>example.com</code>'s authoritative server, perhaps following a CNAME to a load balancer's name, and returns an address such as <code>203.0.113.50</code> with a TTL.</p>
  <p>Now the client opens a <strong>TCP connection</strong> to <code>203.0.113.50</code> port 443. The operating system picks an ephemeral port, and the SYN packet starts its journey: the routing table says the destination is not local, so it goes to the default gateway; the home router's NAT rewrites the sender to the public address; routers across the internet forward it hop by hop; the server's firewall or security group allows port 443; and the SYN reaches the load balancer, which answers SYN-ACK. The client sends ACK. One round trip has passed.</p>
  <p>Immediately after, the <strong>TLS handshake</strong> runs over that connection. The client says which TLS versions and ciphers it supports and which host it wants; the load balancer sends its certificate for <code>models.example.com</code>; the client checks the CA signature, the name and the dates; and both sides agree on a fresh symmetric key. With TLS 1.3 that costs one more round trip. From here on everything is encrypted.</p>
  <p>The client sends the <strong>HTTP request</strong>, the same text we saw in section 08: <code>GET /predict?a=2.0&amp;b=3.5 HTTP/1.1</code>, a <code>Host</code> header, perhaps an <code>Authorization</code> header with an API key, all encrypted inside TLS. The load balancer decrypts it, picks one healthy copy of the model service, and forwards the request over the private network to, say, <code>10.0.3.17:8000</code>, where uvicorn is listening. The application parses the query, runs the model, and returns <code>200 OK</code> with the JSON body <code>{"prediction": 2.35}</code>. The response travels back the same way: app → load balancer (encrypted again) → internet → home router (NAT maps it back to the laptop) → the client, which decrypts it and hands the JSON to your code, or renders it in the browser. A browser would then make further requests for any images, scripts and styles the page refers to, usually reusing the same connection.</p>
  <p>Finally the connection is either kept open for the next request (HTTP keep-alive, which is why a <code>requests.Session</code> is much faster for many calls: no new DNS, TCP or TLS handshakes) or closed with FIN packets. If any step fails, the error tells you which step: <code>gaierror</code> is DNS, "connection refused" is nothing listening on the port, a timeout usually means a firewall or routing problem, "certificate verify failed" is TLS, and a 4xx or 5xx status is the application itself.</p>

  <h2 id="cfn-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common networking mistake in data and ML work is starting a server bound to <code>127.0.0.1</code> and then trying to reach it from somewhere else. A server bound to 127.0.0.1 accepts connections only from the same machine, which is exactly right on your laptop but wrong inside a Docker container or on a cloud VM, because traffic from outside arrives on a different interface. Binding to <code>0.0.0.0</code> means "accept on every interface". The symptom is a server that works with <code>curl</code> inside the container but gives "connection refused" or "empty reply" from the host:</p>
  <div class="fx" data-lang="text"># inside a container: only reachable from inside the container
uvicorn app:app --host 127.0.0.1 --port 8000
# fix: listen on all interfaces, then publish the port
uvicorn app:app --host 0.0.0.0 --port 8000
docker run -p 8000:8000 my-model-api</div>
  <p>The reverse mistake also exists: binding a database or a Jupyter server to <code>0.0.0.0</code> on a cloud VM with an open firewall exposes it to the whole internet, where bots scan for open ports within minutes. Bind development tools to 127.0.0.1 and reach them through an SSH tunnel (<code>ssh -L 8888:localhost:8888 vm</code>) instead.</p>
  <p>A second mistake is making network calls with no timeout. By default <code>requests.get(url)</code> will wait forever if the server accepts the connection but never answers, and a batch job or web worker hangs with no error. Always pass a timeout, and treat a timeout and a refusal as different signals, as section 04 showed:</p>
  <div class="fx" data-lang="text">requests.get(url)                    # may hang forever
requests.get(url, timeout=(3, 30))   # 3 s to connect, 30 s to read</div>
  <p>Third, opening a new connection for every request in a loop. Each call to <code>requests.get</code> without a session repeats DNS, the TCP handshake and the TLS handshake, adding several round trips per call; scoring 10,000 rows one request at a time against a remote API can spend most of its time on handshakes. Use a <code>requests.Session</code> (or an <code>httpx.Client</code>) to reuse connections, and send rows in batches. The same applies to databases, where a connection pool is standard.</p>
  <p>A few more come up regularly. Turning off certificate checks with <code>verify=False</code> to "fix" a certificate error removes the protection TLS exists to give; install the right CA instead. Hard-coding an IP address instead of a hostname breaks the moment the service moves, and skips DNS-based load balancing. Assuming "ping fails" means "server down" is wrong, since ICMP is often blocked. And "Address already in use" almost always means an old copy of your server is still running; find it with <code>ss -tlnp</code> or <code>lsof -i :8000</code> rather than picking a new port each time.</p>

  <h2 id="cfn-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core terms</h3>
  <ul>
    <li><b>Network</b>: devices (nodes/hosts) connected by links to exchange data. <b>Internet</b>: a network of networks.</li>
    <li><b>Packet</b>: a small addressed chunk of data (≈1,500 bytes max on Ethernet). <b>Protocol</b>: agreed rules for communicating.</li>
    <li><b>LAN</b>: one building; <b>MAN</b>: one city; <b>WAN</b>: countries/continents.</li>
    <li><b>Client–server</b>: server listens and answers; client connects and asks. "Server" is a role, not hardware.</li>
    <li><b>IP address</b>: identifies a machine. IPv4 = 32 bits (<code>192.168.1.23</code>); IPv6 = 128 bits (<code>2001:db8::1</code>).</li>
    <li><b>Private ranges</b>: 10/8, 172.16/12, 192.168/16. <b>Loopback</b>: 127.0.0.1 / ::1 = localhost.</li>
    <li><b>MAC address</b>: hardware ID of a network card, used only on the local network.</li>
    <li><b>DHCP</b>: hands a device its IP, gateway and DNS server automatically.</li>
    <li><b>Switch</b>: forwards within a LAN by MAC. <b>Router</b>: forwards between networks by IP. <b>Default gateway</b>: the router for "everything else".</li>
    <li><b>Port</b>: 0–65535, picks the program. <b>Socket</b>: IP + port + protocol. <b>Ephemeral port</b>: random client-side port.</li>
    <li><b>DNS</b>: name → IP. <b>A</b> = IPv4, <b>AAAA</b> = IPv6, <b>CNAME</b> = alias to another name. <b>TTL</b>: how long an answer may be cached.</li>
  </ul>
  <h3>Common ports</h3>
  <table class="tbl">
    <tr><th>22</th><th>53</th><th>80</th><th>443</th><th>5432</th><th>8000 / 8080 / 8888</th></tr>
    <tr><td>SSH</td><td>DNS</td><td>HTTP</td><td>HTTPS</td><td>PostgreSQL</td><td>dev servers / Jupyter</td></tr>
  </table>
  <h3>TCP vs UDP</h3>
  <table class="tbl">
    <tr><th></th><th>TCP</th><th>UDP</th></tr>
    <tr><td>Setup</td><td>3-way handshake: SYN, SYN-ACK, ACK</td><td>none</td></tr>
    <tr><td>Guarantees</td><td>reliable, ordered byte stream</td><td>none; datagrams may be lost or reordered</td></tr>
    <tr><td>Use for</td><td>HTTP(S), SSH, databases, files, Kafka</td><td>DNS, video/voice, games, metrics, QUIC</td></tr>
  </table>
  <h3>TCP/IP vs OSI</h3>
  <table class="tbl">
    <tr><th>TCP/IP</th><th>OSI</th><th>Examples</th></tr>
    <tr><td>Application</td><td>7, 6, 5</td><td>HTTP, DNS, SSH, TLS</td></tr>
    <tr><td>Transport</td><td>4</td><td>TCP, UDP (ports)</td></tr>
    <tr><td>Internet</td><td>3</td><td>IP, routers</td></tr>
    <tr><td>Link</td><td>2, 1</td><td>Ethernet, Wi-Fi, switches (MAC)</td></tr>
  </table>
  <h3>Security and the middle</h3>
  <ul>
    <li><b>HTTPS</b> = HTTP inside TLS: confidentiality, integrity, authentication.</li>
    <li><b>Certificate</b>: "this public key belongs to this name", signed by a trusted <b>CA</b>; checked for signature, name and dates.</li>
    <li><b>Encryption</b>: two-way with a key (symmetric = one key; asymmetric = public/private pair). <b>Hashing</b>: one-way fingerprint, no key.</li>
    <li><b>Firewall</b>: allow/deny rules (cloud: security groups); blocked = timeout. <b>NAT</b>: private → public address rewriting.</li>
    <li><b>Forward proxy</b>: acts for clients (<code>HTTPS_PROXY</code>). <b>Reverse proxy / load balancer</b>: acts for servers. <b>VPN</b>: encrypted tunnel into another network.</li>
    <li><b>Latency</b>: delay (ms, RTT). <b>Bandwidth</b>: capacity (Mbit/s). <b>Throughput</b>: actual achieved rate.</li>
  </ul>
  <h3>Commands and code</h3>
  <div class="fx" data-lang="py">import socket
socket.getaddrinfo("pypi.org", 443)                  # DNS lookup
s = socket.create_connection(("127.0.0.1", 8000))    # TCP connect (client)
srv = socket.socket(); srv.bind(("0.0.0.0", 8000)); srv.listen()   # TCP server
u = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP socket
# shell: ip addr | ss -tlnp | dig host | curl -v https://host | ping host | traceroute host</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Bound to 127.0.0.1 = reachable only from the same machine/container; use 0.0.0.0 in Docker.</li>
    <li>Connection refused = reachable but nothing listening; timeout = dropped (firewall, wrong address).</li>
    <li><code>gaierror</code> = DNS failed. "certificate verify failed" = missing CA; never <code>verify=False</code>.</li>
    <li>Always set timeouts; reuse connections with a Session; batch requests to save round trips.</li>
    <li>ping failing does not mean the server is down; test the port.</li>
  </ul>

  <h2 id="cfn-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between an IP address and a MAC address?</summary><div class="qa-body">An IP address identifies a device's location on a network and is used to route packets end to end across many networks; it can change (DHCP gives a new one on each network). A MAC address is a hardware identifier of a network card and is used only to deliver frames to the next device on the same local network. The IP address stays the same along the whole path, while the MAC addresses change at each hop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between IPv4 and IPv6?</summary><div class="qa-body">IPv4 addresses are 32 bits, written as four decimal numbers (<code>192.168.1.23</code>), giving about 4.3 billion addresses, which have effectively run out. IPv6 addresses are 128 bits, written in hex groups (<code>2001:db8::1</code>), giving so many that every device can have a public address. Both run side by side today; NAT and private ranges are what kept IPv4 going.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are private IP addresses, and what is 127.0.0.1?</summary><div class="qa-body">Private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) can be used freely inside any network and are not routed on the public internet, so many networks reuse them; NAT lets those devices reach the internet through one public address. 127.0.0.1 (localhost, IPv6 <code>::1</code>) is the loopback address: traffic to it never leaves the machine, so it is used to reach servers running on the same computer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a router and a switch?</summary><div class="qa-body">A switch connects devices within one local network and forwards frames based on MAC addresses. A router connects different networks and forwards packets based on destination IP addresses using a routing table, hop by hop towards the destination. A home router box combines both, plus Wi-Fi, NAT, DHCP and a firewall.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a port, and why do we need ports when we have IP addresses?</summary><div class="qa-body">An IP address only identifies the machine; one machine runs many networked programs. A port number (0–65535) identifies which program should receive the data, so the OS can deliver a packet for port 5432 to PostgreSQL and one for port 443 to the web server. Common ones are 22 (SSH), 53 (DNS), 80 (HTTP), 443 (HTTPS) and 5432 (PostgreSQL).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between TCP and UDP? When would you use each?</summary><div class="qa-body">TCP is connection-based: it does a three-way handshake, then guarantees that bytes arrive complete and in order, re-sending lost packets and controlling congestion. UDP has no connection and no guarantees: it sends independent datagrams that may be lost or reordered, with very low overhead. Use TCP when every byte matters (HTTP, databases, file transfer) and UDP when speed matters more than completeness or the messages are tiny (video calls, games, DNS, metrics).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the TCP three-way handshake.</summary><div class="qa-body">The client sends SYN with its initial sequence number; the server replies SYN-ACK, acknowledging it and sending its own sequence number; the client replies ACK. Both sides now know the other is reachable and agree on starting sequence numbers, so they can detect lost or duplicate data. It costs one round trip before any data, which is why connection reuse matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does DNS work?</summary><div class="qa-body">The client asks a resolver to translate a name into an IP address. If the resolver has no cached answer it asks a root server, which refers it to the top-level domain servers (e.g. <code>.com</code>), which refer it to the domain's authoritative name server, which returns the record. Answers are cached by the resolver, the OS and the browser for their TTL, so most lookups are answered from cache. DNS queries normally use UDP port 53.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between an A record and a CNAME record?</summary><div class="qa-body">An A record maps a name directly to an IPv4 address (AAAA does the same for IPv6). A CNAME maps a name to another name, an alias, which must then be resolved further. CNAMEs let you point your domain at a provider's hostname, such as a CDN or load balancer, without tracking its IP addresses.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between HTTP and HTTPS?</summary><div class="qa-body">HTTP sends requests and responses as plain text, usually on port 80, so anyone on the path can read or modify them. HTTPS is HTTP inside a TLS connection, usually on port 443: the data is encrypted, tampering is detected, and the server proves its identity with a certificate. Today essentially all APIs and websites use HTTPS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does TLS work, and what is a certificate?</summary><div class="qa-body">After the TCP handshake, the client and server do a TLS handshake: the server sends its certificate, the client verifies it, and they use public-key cryptography to agree on a shared symmetric key, which then encrypts the rest of the connection. A certificate binds a public key to a domain name and validity dates, and is signed by a certificate authority the client already trusts. The client checks the signature chain, that the name matches the host, and that it has not expired.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between hashing and encryption?</summary><div class="qa-body">Encryption is reversible: data is scrambled with a key and anyone with the right key can recover it, so it is used for data you need to read later. Hashing is one-way: it produces a fixed-size fingerprint with no key, and the original cannot be recovered; the same input always gives the same hash. Hashes are used for integrity checks and password storage (with a slow, salted algorithm like bcrypt); encryption for confidentiality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe the TCP/IP model and how it relates to OSI.</summary><div class="qa-body">TCP/IP has four layers: application (HTTP, DNS, SSH), transport (TCP, UDP, ports), internet (IP addresses and routing) and link (Ethernet, Wi-Fi, MAC addresses). OSI is a seven-layer reference model; its layers 5–7 map to application, 4 to transport, 3 to internet, and 1–2 to link. People use OSI numbers as shorthand, e.g. "layer 4 load balancer" (TCP) vs "layer 7" (HTTP).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is NAT, and why is it used?</summary><div class="qa-body">Network Address Translation lets many devices with private addresses share one public address: the router rewrites the source address of outgoing packets and keeps a table to send replies back to the right device. It was introduced to save IPv4 addresses. A side effect is that outside hosts cannot start connections to devices behind NAT, which adds some protection but complicates hosting servers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a forward proxy, a reverse proxy and a load balancer?</summary><div class="qa-body">A forward proxy acts on behalf of clients: they send their requests through it, and companies use it for filtering, logging or caching outgoing traffic. A reverse proxy acts on behalf of servers: clients connect to it thinking it is the site, and it forwards requests to backend servers, often terminating TLS. A load balancer is a reverse proxy focused on spreading requests across several servers and removing unhealthy ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between latency, bandwidth and throughput?</summary><div class="qa-body">Latency is the time for a message to travel (often measured as round-trip time in milliseconds). Bandwidth is the maximum data rate a link can carry, in bits per second. Throughput is the rate actually achieved, usually lower than bandwidth because of overhead, congestion or slow endpoints. Many small requests are limited by latency; large transfers by bandwidth.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"Connection refused" vs "connection timed out": what does each tell you?</summary><div class="qa-body">Connection refused means the packet reached the machine but nothing was listening on that port (or a firewall actively rejected it), so the server process is down or on another port or interface. A timeout means no reply came back at all, typically because a firewall or security group silently dropped the packets, the address or route is wrong, or the host is down. Refused points at the application; timeout points at the network path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't I reach my Flask/FastAPI app in Docker even though it is running?</summary><div class="qa-body">Usually the app is listening on 127.0.0.1 inside the container, which only accepts connections from inside the container itself; it must listen on 0.0.0.0. The port must also be published with <code>docker run -p 8000:8000</code>, since containers sit on a private network behind the host's NAT. On a cloud VM, also check the firewall or security group allows the port.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when you type a URL into the browser and press Enter?</summary><div class="qa-body">The browser parses the URL (scheme, host, port, path), then resolves the host to an IP via caches and DNS. It opens a TCP connection to that IP on port 443 (three-way handshake, routed through the default gateway, NAT and internet routers), then performs a TLS handshake and verifies the certificate. It sends an encrypted HTTP request; a load balancer forwards it to an app server, which returns a response with a status code, headers and body. The browser renders it, fetches further resources over the same connection, and keeps or closes the connection.</div></details>
</main>
`
});
