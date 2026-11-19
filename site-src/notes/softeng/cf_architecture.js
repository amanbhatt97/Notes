// notes/softeng/cf_architecture.js — Architecture & Scaling Basics
Object.assign(TOPIC_CONTENT, {
  "cf_architecture": `<main>
<h1>Architecture &amp; Scaling Basics</h1>
  <div class="where"><span>Software Engineering</span><span>Computer Fundamentals</span><span>Architecture &amp; Scaling Basics</span></div>
  <p class="lead">Every web application you use, from a food-delivery app to the dashboard that shows your model's predictions, is not one program on one computer but several programs, usually on several computers, passing messages to each other. <strong>Software architecture</strong> is the plan for how those pieces are split up and how they talk, and <strong>scaling</strong> is what you do when more people use the application than one machine can handle. Data scientists and ML engineers meet these ideas the moment a model leaves the notebook: a prediction API needs a server, the server needs to survive crashes, slow jobs need a queue, and someone will ask "what happens when traffic grows ten times?". To make all of this concrete, this page follows one running example: a small online chai shop whose website shows a menu, takes orders and calls an ML model to recommend drinks. It starts on a single computer, and each section adds the next idea the shop needs as it grows from a hundred customers to a million. The code blocks are small simulations that run inside one Python process, so you can see each mechanism without setting up real servers.</p>

  <h2 id="cfa-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Architecture &amp; Scaling</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">How a web app is built</div>
        <ul>
          <li><b>Frontend</b> runs in the browser; <b>backend</b> runs on servers</li>
          <li>Nginx (web server) in front of Gunicorn/Uvicorn (app server)</li>
          <li><b>Monolith</b>: one deployable app; <b>microservices</b>: many small ones</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Growing</div>
        <ul>
          <li><b>Vertical</b>: a bigger machine; <b>horizontal</b>: more machines</li>
          <li><b>Load balancer</b> spreads requests, skips unhealthy servers</li>
          <li><b>Cache</b> answers repeated questions from memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Surviving failure</div>
        <ul>
          <li>Distributed systems fail <b>partially</b>; networks are slow and lossy</li>
          <li><b>Redundancy</b> + <b>replicas</b> remove single points of failure</li>
          <li>99.9% uptime ≈ 8.8 hours down per year</li>
          <li><b>CAP</b>: during a partition, choose consistency or availability</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Communication</div>
        <ul>
          <li><b>Sync</b>: wait for the answer; <b>async</b>: do not block on it</li>
          <li><b>Message queue</b>: hand slow work to background workers</li>
          <li><b>Events</b>: announce what happened; listeners react</li>
          <li><b>WebSocket</b>: server pushes updates; polling keeps asking</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cfa-web"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How a Web App Is Put Together</span><span class="rm-sub">browser, frontend, backend, database, requests</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-servers"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Web Servers and Application Servers</span><span class="rm-sub">why Nginx sits in front of Gunicorn or Uvicorn</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-arch"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Software Architecture: Monolith vs Microservices</span><span class="rm-sub">one big app or many small ones</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-dist"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Distributed Systems and What Goes Wrong</span><span class="rm-sub">partial failure, slow networks, safe retries</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-scale"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Scalability: Vertical vs Horizontal</span><span class="rm-sub">a bigger machine or more machines</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-lb"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Load Balancers</span><span class="rm-sub">round robin and health checks, simulated</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-ha"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Fault Tolerance and High Availability</span><span class="rm-sub">redundancy, replicas and the "nines"</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-sync"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Synchronous vs Asynchronous Communication</span><span class="rm-sub">waiting for an answer, or not</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-queue"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Message Queues and Event-Driven Architecture</span><span class="rm-sub">background workers and publish/subscribe</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-cache"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Caching Layers</span><span class="rm-sub">answering repeated questions from memory</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-realtime"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">WebSockets vs HTTP Polling</span><span class="rm-sub">live updates without asking every second</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-cap"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">The CAP Theorem</span><span class="rm-sub">consistency or availability when the network splits</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">early microservices, unsafe retries, stale caches</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, comparison tables, numbers to remember</span></div></div>
      <div class="rm-item rm-done" data-target="cfa-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">system-design basics interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="cfa-web"><span class="num">01</span>How a Web App Is Put Together</h2>
  <p>When a customer opens the chai shop's website, it feels like one thing. In reality at least two computers are involved: the customer's phone or laptop, and a computer somewhere else that holds the menu and the orders. The customer's device is called the <strong>client</strong>, because it asks for things, and the remote computer is called the <strong>server</strong>, because it serves answers. This arrangement, where many clients send requests to a server and the server sends back responses, is called the <strong>client–server model</strong>, and nearly every web and mobile app is built on it.</p>
  <p>Think of a restaurant. The dining room is where customers sit, read the menu and place orders; the kitchen is where the food is actually made and where the ingredients are stored. Customers never walk into the kitchen. They talk to a waiter, who carries the order in and brings the plate out. A web app has the same three parts. The <strong>frontend</strong> is the dining room: the part that runs on the customer's device, made of HTML (the page structure), CSS (the styling) and JavaScript (the code that makes buttons respond), all downloaded and run by the browser. The <strong>backend</strong> is the kitchen: code running on the server, for example a Python program written with FastAPI or Flask, which checks prices, saves orders and calls the recommendation model. Behind the backend sits a <strong>database</strong>, the storeroom where data such as menu items and orders is kept safely on disk. The waiter is <strong>HTTP</strong> (HyperText Transfer Protocol), the agreed format in which the browser asks for something ("GET /menu") and the server replies (a status code like 200 OK plus the data, often as JSON text).</p>
  <figure class="viz"><svg viewBox="0 0 680 190" width="680">
    <defs><marker id="cfa-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="50" width="140" height="80" rx="8" class="fb sb"/><text x="80" y="80" text-anchor="middle">Browser</text><text x="80" y="100" text-anchor="middle" class="tm" font-size="10">frontend: HTML/CSS/JS</text><text x="80" y="116" text-anchor="middle" class="tm" font-size="10">the client</text>
    <rect x="200" y="50" width="130" height="80" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="265" y="80" text-anchor="middle">Nginx</text><text x="265" y="100" text-anchor="middle" class="tm" font-size="10">web server</text><text x="265" y="116" text-anchor="middle" class="tm" font-size="10">HTTPS, static files</text>
    <rect x="380" y="50" width="140" height="80" rx="8" class="fg sg"/><text x="450" y="80" text-anchor="middle">Python app</text><text x="450" y="100" text-anchor="middle" class="tm" font-size="10">Uvicorn + FastAPI</text><text x="450" y="116" text-anchor="middle" class="tm" font-size="10">backend logic, ML model</text>
    <rect x="570" y="50" width="100" height="80" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="620" y="85" text-anchor="middle">Database</text><text x="620" y="105" text-anchor="middle" class="tm" font-size="10">orders, menu</text>
    <g stroke="currentColor" stroke-width="1.5"><line x1="150" y1="80" x2="196" y2="80" marker-end="url(#cfa-a1)"/><line x1="330" y1="80" x2="376" y2="80" marker-end="url(#cfa-a1)"/><line x1="520" y1="80" x2="566" y2="80" marker-end="url(#cfa-a1)"/>
    <line x1="196" y1="105" x2="152" y2="105" marker-end="url(#cfa-a1)"/><line x1="376" y1="105" x2="332" y2="105" marker-end="url(#cfa-a1)"/><line x1="566" y1="105" x2="522" y2="105" marker-end="url(#cfa-a1)"/></g>
    <text x="173" y="40" text-anchor="middle" class="tm" font-size="10">request</text><text x="173" y="150" text-anchor="middle" class="tm" font-size="10">response</text>
    <text x="80" y="175" text-anchor="middle" class="tb" font-size="11">customer's device</text><text x="435" y="175" text-anchor="middle" class="tg" font-size="11">the shop's server(s)</text>
  </svg><figcaption>One request for the menu: the browser sends it, Nginx receives it, passes it to the Python app, which reads the database; the response travels back the same way.</figcaption></figure>
  <p>Follow one click through the picture. The customer taps "Menu". The browser sends an HTTP request across the internet to the shop's server address. On the server, a program called a web server receives it and hands it to the Python application. The application asks the database for today's menu, turns the rows into JSON, and returns it. The browser's JavaScript receives the JSON and draws the menu on the screen. Every interaction, adding to the cart, placing an order, seeing a recommendation, is another round trip like this. The details of HTTP methods, status codes and JSON APIs are covered in <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a>; here the important idea is the division of labour. The frontend handles display and runs on thousands of customers' devices; the backend holds the rules and the data and runs on machines the shop controls. That division is why you never trust anything the frontend sends without checking it on the backend: the customer controls their own browser.</p>
  <p>This is where data and ML work plugs in. A model served behind an API is a backend component: a request arrives with features, the backend runs <code>model.predict()</code>, and the response carries the prediction. A dashboard in Streamlit or a React page is a frontend talking to such an API. Everything else on this page is about what happens when this simple picture has to handle many more customers, and survive things breaking.</p>

  <h2 id="cfa-servers"><span class="num">02</span>Web Servers and Application Servers</h2>
  <p>In the picture above there were two boxes on the server side, Nginx and the Python app, and beginners often ask why one is not enough. The answer is that they do very different jobs. Your FastAPI or Flask code knows how to turn a request into a response for <em>your</em> shop: check the cart, call the model, save the order. It knows nothing about the hard, generic parts of talking to the internet: handling ten thousand slow mobile connections at once, encrypting traffic with HTTPS, sending big image files efficiently, or refusing obviously malicious requests. Writing all of that into every Python app would be wasteful, and Python is not the fastest language for it.</p>
  <p>So the work is split. A <strong>web server</strong> such as <strong>Nginx</strong> (pronounced "engine-x") is a program, written in C and heavily optimised, that sits at the front door and talks to the internet. It accepts connections, handles HTTPS, serves <strong>static files</strong> (files that are the same for everyone, like images, CSS and JavaScript) straight from disk, and forwards the remaining requests to the application. When a server forwards requests on behalf of something behind it, it is called a <strong>reverse proxy</strong>. An <strong>application server</strong> such as <strong>Gunicorn</strong> or <strong>Uvicorn</strong> is the program that actually runs your Python code. It starts several copies of your app, called <strong>workers</strong>, so several requests can be processed at the same time, and restarts a worker if it crashes. Gunicorn speaks <strong>WSGI</strong>, the standard interface for traditional synchronous Python web apps like Flask and Django; Uvicorn speaks <strong>ASGI</strong>, the newer interface for asynchronous apps like FastAPI. A common production setup is Gunicorn managing several Uvicorn workers.</p>
  <p>A hotel is a good picture of this. The receptionist (Nginx) greets everyone who walks in, checks bookings, hands out leaflets from the rack (static files) without bothering anyone, and sends guests with real requests to the right specialist. The specialists (the workers inside Gunicorn or Uvicorn) do the actual skilled work, and there are several of them so the queue keeps moving. The receptionist is fast at greeting; the specialists are good at their particular job. Neither would do well at the other's role.</p>
  <p>A typical chain on one machine therefore looks like this: the internet reaches Nginx on port 443 (the standard HTTPS port); Nginx forwards to Uvicorn listening on port 8000; Uvicorn runs four workers, each with a copy of the FastAPI app and the recommendation model loaded in memory. When you run <code>uvicorn main:app --reload</code> on your laptop you are using the application server alone, which is fine for development. The production details, how many workers to start, timeouts, and how this looks inside Docker, are in <a class="xref" data-note="api_production">Production Backend</a>.</p>

  <h2 id="cfa-arch"><span class="num">03</span>Software Architecture: Monolith vs Microservices</h2>
  <p>As the chai shop grows, its backend grows too: menu, cart, payments, delivery tracking, recommendations, an admin panel. The question of how to organise all that code into running programs is a question of <strong>software architecture</strong>: the high-level structure of a system, meaning which major parts it has, what each is responsible for, and how they communicate. Architecture is like the floor plan of a building rather than the choice of paint. It is hard to change later, so it is worth understanding the main options.</p>
  <p>The simplest option is a <strong>monolith</strong>: the entire backend is one application, in one code repository, deployed as one unit. The menu code, the payment code and the recommendation code all live in the same Python project and call each other as ordinary function calls. To release a change, you deploy the whole thing. Think of a single restaurant kitchen where every cook works in the same room: communication is instant (you just shout across), and there is one place to clean and inspect. Monoliths are easy to build, test and debug, because everything runs in one process and a stack trace shows the whole story. Most successful products started as monoliths, and many very large companies still run them.</p>
  <p>The problems appear with size. When fifty developers work in one codebase, they step on each other's changes. A bug in the delivery-tracking code can crash the process and take payments down with it. If recommendations need a GPU and lots of memory, you have to give that expensive hardware to every copy of the whole app. And a small change to the menu means re-deploying everything.</p>
  <p>The alternative is <strong>microservices</strong>: the backend is split into several small, independent applications, each responsible for one business area, each with its own code, its own deployment and usually its own database, communicating over the network (typically HTTP APIs or message queues). The chai shop might have a menu service, an order service, a payment service and a recommendation service. This is like a food court instead of one kitchen: each stall is run by its own team, opens and closes on its own schedule, and if the dosa stall's stove breaks, the chai stall keeps serving. Teams can deploy their service whenever they like, and the recommendation service alone can run on GPU machines and scale independently.</p>
  <p>Microservices are not free. A function call that took nanoseconds inside a monolith becomes a network request that takes milliseconds and can fail. Placing an order now involves several services that must all cooperate, and when something goes wrong you have to trace it across multiple programs and logs. You need tooling for deployment, monitoring and service discovery (how services find each other's addresses), which is a large part of why <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> exists. A sensible rule is to start with a well-organised monolith, with clear modules inside, and split off a service only when there is a concrete reason: a team boundary, a part with very different hardware needs, or a part that must scale or deploy independently. In ML systems the model server is very often the first piece split out, precisely because it needs different hardware and is released on a different schedule from the website.</p>
  <table class="tbl">
    <tr><th></th><th>Monolith</th><th>Microservices</th></tr>
    <tr><td>Deployed as</td><td>one application</td><td>many small applications</td></tr>
    <tr><td>Parts talk via</td><td>function calls (fast, reliable)</td><td>network calls (slower, can fail)</td></tr>
    <tr><td>Strengths</td><td>simple to build, test, debug</td><td>independent deploys and scaling, team autonomy, fault isolation</td></tr>
    <tr><td>Weaknesses</td><td>large teams collide; one bug can take everything down; scale all or nothing</td><td>operational complexity, distributed failures, harder debugging</td></tr>
    <tr><td>Good default for</td><td>new products, small teams</td><td>large organisations with clear service boundaries</td></tr>
  </table>

  <h2 id="cfa-dist"><span class="num">04</span>Distributed Systems and What Goes Wrong</h2>
  <p>The moment the chai shop runs on more than one computer, whether that is microservices, a separate database server, or several copies of the same app, it has become a <strong>distributed system</strong>: a set of programs on different computers that coordinate by sending messages over a network so that together they behave like one system. Distributed systems are how you get more capacity and survive hardware failure, but they introduce a family of problems that simply do not exist inside a single program, and these problems are behind most real production incidents.</p>
  <p>The first problem is <strong>partial failure</strong>. On one computer, things mostly either work or crash completely. In a distributed system, one part can fail while the others carry on: the payment service is down but the menu service is fine, or one database server has lost power while its twin is running. The rest of the system has to notice and cope. The second problem is that the <strong>network is unreliable and slow</strong>. Messages take time to travel (this delay is called <strong>latency</strong>: within one data centre around half a millisecond, across continents 100 milliseconds or more), they can be delayed by congestion, and they can be lost entirely. The third problem follows from the first two and is the subtle one: when you send a request and hear nothing back, <em>you cannot tell what happened</em>. The other machine may never have received the request, it may have crashed halfway through, or it may have done the work perfectly and the reply got lost on the way back. From the caller's side all three look identical: silence.</p>
  <p>Imagine sending a cheque by post and never hearing back. Did the letter get lost? Did the bank receive it but has not processed it? Did they cash it and the confirmation letter got lost? If you simply send a second cheque "to be safe", you may pay twice. That is exactly the danger of retrying a request in a distributed system. The simulation below shows it. The payment service really charges the customer, but the network drops its reply, so the caller sees a timeout and retries:</p>
  <div class="fx" data-lang="py"># SIMULATION of a partial failure: the payment service does the work,
# but its reply is lost on the network, so the caller cannot tell what happened.
class PaymentService:
    def __init__(self):
        self.charges = []
        self.seen_keys = set()
        self.lose_next_reply = True        # the network will drop one reply

    def charge(self, order_id, amount, idempotency_key=None):
        if idempotency_key in self.seen_keys:
            return "already charged (duplicate ignored)"
        self.charges.append((order_id, amount))          # the money really moves
        if idempotency_key:
            self.seen_keys.add(idempotency_key)
        if self.lose_next_reply:
            self.lose_next_reply = False
            raise TimeoutError("no reply within 2 s")    # ...but the reply never arrives
        return "charged"

def place_order(service, use_key):
    key = "order-42" if use_key else None
    for attempt in (1, 2):
        try:
            print(f"  attempt {attempt}:", service.charge(42, 250, idempotency_key=key))
            break
        except TimeoutError as e:
            print(f"  attempt {attempt}: TimeoutError: {e} -&gt; retrying")

for use_key in (False, True):
    service = PaymentService()
    print("with idempotency key" if use_key else "plain retry")
    place_order(service, use_key)
    print("  charges recorded:", service.charges)</div>
  <div class="fx" data-lang="text">plain retry
  attempt 1: TimeoutError: no reply within 2 s -&gt; retrying
  attempt 2: charged
  charges recorded: [(42, 250), (42, 250)]
with idempotency key
  attempt 1: TimeoutError: no reply within 2 s -&gt; retrying
  attempt 2: already charged (duplicate ignored)
  charges recorded: [(42, 250)]</div>
  <p>In the plain retry, the first attempt timed out, so the caller tried again and got "charged". It looks like success, but the payment service's records show two charges of 250 for order 42: the customer paid twice, because the first attempt had actually worked. The fix in the second run is an <strong>idempotency key</strong>: a unique identifier for the operation ("order-42") sent with every attempt. The service remembers keys it has already processed and ignores repeats, so retrying becomes safe and only one charge is recorded. An operation is <strong>idempotent</strong> when doing it twice has the same effect as doing it once. Setting a value ("price = 50") is naturally idempotent; adding to one ("balance += 50") is not. Real payment APIs, such as Stripe's, ask for exactly this kind of key.</p>
  <p>The practical habits that follow are used everywhere. Every network call gets a <strong>timeout</strong>, so a dead service cannot make the caller wait forever (in Python, <code>requests.get(url, timeout=5)</code>; without a timeout it can hang indefinitely). Failed calls are <strong>retried</strong> a limited number of times with growing waits in between, called <strong>exponential backoff</strong> (wait 1 s, then 2 s, then 4 s), so a struggling service is not flooded. Retries are only applied to idempotent operations or ones protected by an idempotency key. And the system is designed so that one failing part degrades gracefully: if the recommendation service is down, the shop still shows the menu without the "you might like" box, instead of showing an error page. You meet the same ideas in Spark, which is a distributed system: when one executor machine dies, Spark re-runs only that machine's tasks on another machine (<a class="xref" data-note="de_spark">Apache Spark</a>).</p>

  <h2 id="cfa-scale"><span class="num">05</span>Scalability: Vertical vs Horizontal</h2>
  <p>A newspaper mentions the chai shop, and traffic jumps from a hundred customers an hour to ten thousand. Pages become slow and some requests time out, because the one server is running out of CPU. <strong>Scalability</strong> is a system's ability to handle more work, more users, more requests or more data, by adding resources, without being redesigned. A scalable system is one where "twice the traffic" can be answered with "add more hardware", not "rewrite the app".</p>
  <p>There are two ways to add hardware. <strong>Vertical scaling</strong>, or "scaling up", means replacing the machine with a bigger one: more CPU cores, more RAM, faster disks. Nothing in the software changes; the same program just has more room. <strong>Horizontal scaling</strong>, or "scaling out", means adding more machines and running copies of the application on all of them, sharing the work. A shop analogy makes the difference clear. When the queue at the counter gets long, you could hire a faster, more experienced cashier (vertical), or you could open more counters with more cashiers (horizontal). A faster cashier is simple and needs no reorganising, but there is a limit to how fast one person can be, and if that one cashier is ill, the shop is closed. More counters can keep growing and survive one cashier being away, but you now need someone at the door directing customers to free counters, and all the counters must share the same stock and price list.</p>
  <p>Those trade-offs map directly onto computers. Vertical scaling is the easiest first step and often the right one: a database or a pandas job that needs 100 GB of RAM is far simpler on one big machine than spread across many. But machine sizes have a ceiling, the biggest machines cost disproportionately more, upgrading often means downtime, and one machine is still a <strong>single point of failure</strong>, a component whose failure stops the whole system. Horizontal scaling has almost no ceiling and gives redundancy for free, which is why large web systems are built this way, but it requires two things. First, something must spread the incoming requests across machines: that is the load balancer of the next section. Second, the application servers must be <strong>stateless</strong>, meaning they do not keep anything important in their own memory between requests. If a customer's cart lived in the memory of server 1, and their next request went to server 2, the cart would seem empty. Stateless servers keep such data in a shared place, a database or a cache like Redis, so any server can handle any request.</p>
  <p>You already know both kinds from data work. Moving a pandas script from a laptop to a machine with 64 GB of RAM is vertical scaling. Moving the same job to Spark, which splits the data across many executors, is horizontal scaling; it buys almost unlimited size at the cost of more complexity and network traffic between machines. In cloud platforms and Kubernetes, horizontal scaling can be automatic: an <strong>autoscaler</strong> watches CPU usage or request rate and adds or removes copies as traffic changes.</p>

  <h2 id="cfa-lb"><span class="num">06</span>Load Balancers</h2>
  <p>The chai shop now runs three copies of its app, on three servers called app-1, app-2 and app-3. Customers, however, only know one address, the shop's domain name. Something has to receive every request at that one address and decide which server should handle it. That something is a <strong>load balancer</strong>: a component that sits in front of a group of servers and distributes incoming requests among them, so that no single server is overloaded, and so that requests stop going to servers that have failed. It is the person at the door of the shop directing each customer to a free counter.</p>
  <figure class="viz"><svg viewBox="0 0 640 220" width="640">
    <defs><marker id="cfa-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="85" width="110" height="50" rx="8" class="fb sb"/><text x="65" y="115" text-anchor="middle">customers</text>
    <rect x="180" y="80" width="140" height="60" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="250" y="106" text-anchor="middle">load balancer</text><text x="250" y="124" text-anchor="middle" class="tm" font-size="10">round robin + /health</text>
    <rect x="400" y="15" width="120" height="44" rx="8" class="fg sg"/><text x="460" y="42" text-anchor="middle">app-1 ✓</text>
    <rect x="400" y="88" width="120" height="44" rx="8" class="fr sr"/><text x="460" y="115" text-anchor="middle">app-2 ✗</text>
    <rect x="400" y="161" width="120" height="44" rx="8" class="fg sg"/><text x="460" y="188" text-anchor="middle">app-3 ✓</text>
    <rect x="560" y="80" width="70" height="60" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="106" text-anchor="middle" font-size="11">shared</text><text x="595" y="122" text-anchor="middle" font-size="11">DB</text>
    <g stroke="currentColor" stroke-width="1.5"><line x1="120" y1="110" x2="176" y2="110" marker-end="url(#cfa-a2)"/><line x1="320" y1="100" x2="396" y2="40" marker-end="url(#cfa-a2)"/><line x1="320" y1="120" x2="396" y2="180" marker-end="url(#cfa-a2)"/></g>
    <line x1="320" y1="110" x2="396" y2="110" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="358" y="104" text-anchor="middle" class="tr" font-size="10">skipped</text>
    <g stroke="currentColor" stroke-opacity="0.4"><line x1="520" y1="37" x2="558" y2="95"/><line x1="520" y1="183" x2="558" y2="125"/></g>
  </svg><figcaption>Every request arrives at the load balancer, which sends it to a healthy server in turn. app-2 failed its health check, so it receives nothing until it recovers. All servers share one database, so it does not matter which one handles a request.</figcaption></figure>
  <p>The load balancer needs a rule for choosing a server. The simplest is <strong>round robin</strong>: send the first request to server 1, the next to server 2, then server 3, then back to server 1, and so on, like dealing cards around a table. Round robin works well when requests take roughly the same effort and the servers are equally powerful. Other common rules are <strong>least connections</strong> (send the request to whichever server is currently handling the fewest, useful when some requests are slow) and <strong>hashing</strong> on something like the user's ID (the same user always reaches the same server, which helps when a server keeps a per-user cache).</p>
  <p>Round robin on its own has a dangerous weakness, which the simulation below shows. Three pretend servers are just Python objects; the "load balancer" is a loop that cycles through them blindly. Partway through, app-2 crashes:</p>
  <div class="fx" data-lang="py"># SIMULATION: three "servers" are plain Python objects in one process; no real network.
import itertools

servers = [AppServer("app-1"), AppServer("app-2"), AppServer("app-3")]
turn = itertools.cycle(servers)          # app-1, app-2, app-3, app-1, ...

for request_id in range(1, 8):
    if request_id == 4:
        servers[1].healthy = False       # app-2 crashes after request 3
    server = next(turn)
    try:
        print(server.handle(request_id))
    except ConnectionError as e:
        print(f"request {request_id} FAILED: {e}")</div>
  <div class="fx" data-lang="text">request 1 -&gt; app-1
request 2 -&gt; app-2
request 3 -&gt; app-3
request 4 -&gt; app-1
request 5 FAILED: app-2 is not responding
request 6 -&gt; app-3
request 7 -&gt; app-1</div>
  <p>Requests 1 to 4 go round the circle as expected. After app-2 crashes, blind round robin still sends it its turn, so request 5 fails, and in a real system one customer in three would see an error for as long as app-2 stays down. The missing piece is a <strong>health check</strong>: the load balancer regularly sends a tiny request (usually <code>GET /health</code>) to every server, and any server that does not answer correctly within a short time is taken out of the rotation until it passes again. Here is the same scenario with a load balancer that only routes to servers that pass their health check:</p>
  <div class="fx" data-lang="py"># SIMULATION: a round-robin load balancer that health-checks before routing.

class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.counter = 0

    def healthy_servers(self):
        # A real balancer calls GET /health on each server every few seconds.
        return [s for s in self.servers if s.healthy]

    def route(self, request_id):
        alive = self.healthy_servers()
        if not alive:
            return f"request {request_id} -&gt; 503 Service Unavailable"
        server = alive[self.counter % len(alive)]   # round robin over healthy ones
        self.counter += 1
        return server.handle(request_id)

servers = [AppServer("app-1"), AppServer("app-2"), AppServer("app-3")]
lb = LoadBalancer(servers)

for request_id in range(1, 10):
    if request_id == 4:
        servers[1].healthy = False        # app-2 crashes
    if request_id == 8:
        servers[1].healthy = True         # app-2 restarted, passes health check again
    print(lb.route(request_id))

print({s.name: s.handled for s in servers})</div>
  <div class="fx" data-lang="text">request 1 -&gt; app-1
request 2 -&gt; app-2
request 3 -&gt; app-3
request 4 -&gt; app-3
request 5 -&gt; app-1
request 6 -&gt; app-3
request 7 -&gt; app-1
request 8 -&gt; app-2
request 9 -&gt; app-3
{'app-1': 3, 'app-2': 2, 'app-3': 4}</div>
  <p>Now no request fails. From request 4 onward app-2 is not in the healthy list, so round robin runs over the two survivors only, which is why requests 4 to 7 alternate between app-3 and app-1. At request 8, app-2 has been restarted and passes its health check again, so it rejoins the rotation and immediately receives request 8. The final counts show app-2 handled fewer requests because it was out for a while, and the customers never noticed. In a real load balancer the health check runs every few seconds on a timer rather than before each request, so there is a short window in which a freshly crashed server can still receive a request; this is one reason clients retry failed requests (safely, as in section 04).</p>
  <p>In practice you rarely write a load balancer. Nginx can do it, cloud providers sell managed ones (AWS Application Load Balancer, Google Cloud Load Balancing, Azure Load Balancer), and in Kubernetes a <code>Service</code> load-balances across the copies of your model server. The load balancer also becomes the natural place to handle HTTPS and to drain traffic away from a server before you deploy a new version, so releases cause no downtime. Note that the load balancer itself must not become a new single point of failure; managed load balancers run on several machines behind the scenes for exactly that reason.</p>

  <h2 id="cfa-ha"><span class="num">07</span>Fault Tolerance and High Availability</h2>
  <p>Hardware fails. Disks wear out, power supplies die, someone deploys a bug, a whole data centre loses its network for an hour. At large scale this is not bad luck but a daily certainty: with ten thousand disks, several fail every week. The useful question is therefore not "how do we stop failures?" but "how do we keep serving customers while something is failing?". <strong>Fault tolerance</strong> is a system's ability to keep working correctly when some of its components fail. <strong>High availability</strong> (HA) is the closely related goal of keeping the service up and reachable for as large a fraction of time as possible. Fault tolerance is the property; high availability is the result you measure.</p>
  <p>The core technique is <strong>redundancy</strong>: having more than one of every important component, so that when one fails another takes over. An aeroplane has two engines and can fly on one; a hospital has a backup generator that starts when the mains power fails. In software, the load-balanced group of app servers from the previous section is redundancy for the application layer. For data, the equivalent is a <strong>replica</strong>: a continuously updated copy of a database on another machine. The main copy, called the <strong>primary</strong> (or leader), accepts writes and streams every change to one or more replicas (followers). If the primary dies, a replica is promoted to become the new primary, a process called <strong>failover</strong>. Replicas also take read traffic off the primary, which helps scaling. To survive bigger disasters, replicas are placed in different buildings or regions, so a fire or power cut in one place does not take out every copy.</p>
  <p>Availability is usually stated as a percentage of time the service is working, and engineers talk about it in "nines": 99.9% is "three nines", 99.99% is "four nines". These percentages sound almost the same, but they translate into very different amounts of downtime. The calculation is just the fraction of time not available multiplied by the minutes in a year:</p>
  <div class="fx" data-lang="py">MINUTES_PER_YEAR = 365 * 24 * 60          # 525,600

print("availability   downtime/year        downtime/month")
for availability in [0.99, 0.999, 0.9999, 0.99999]:
    down = (1 - availability) * MINUTES_PER_YEAR
    print(f"{availability:&gt;9.3%}   {down:9.1f} min ({down/60:5.1f} h)   {down/12:7.1f} min")</div>
  <div class="fx" data-lang="text">availability   downtime/year        downtime/month
  99.000%      5256.0 min ( 87.6 h)     438.0 min
  99.900%       525.6 min (  8.8 h)      43.8 min
  99.990%        52.6 min (  0.9 h)       4.4 min
  99.999%         5.3 min (  0.1 h)       0.4 min</div>
  <p>Each extra nine cuts the allowed downtime by ten. Two nines (99%) allows more than three and a half days of outage per year, which few businesses accept. Three nines allows about 8.8 hours a year, or 43.8 minutes a month, which is a common target for ordinary web services. Four nines leaves under an hour a year, so there is no time for a human to wake up, log in and fix things by hand: failover must be automatic. Five nines, about five minutes a year, is the territory of telephone networks and payment systems, and every extra nine costs a lot more money and engineering. These targets are often written into a contract called an <strong>SLA</strong> (service-level agreement), with refunds if the provider misses them.</p>
  <p>The same arithmetic explains why redundancy works. A request to the chai shop needs the load balancer, an app server and the database <em>all</em> to be working, and when parts are needed in a chain, their availabilities multiply, so the whole is less available than any single part. When parts are redundant, the layer is only down if <em>every</em> copy is down at the same time, which is far less likely:</p>
  <div class="fx" data-lang="py"># Parts in a chain: the request needs ALL of them, so availabilities multiply.
lb, app, db = 0.9999, 0.999, 0.999
chain = lb * app * db
print(f"one LB + one app + one DB : {chain:.4%}")

# Redundancy: two app servers; the app layer is down only if BOTH are down.
app_pair = 1 - (1 - app) ** 2
db_pair = 1 - (1 - db) ** 2              # primary + replica that can take over
print(f"two apps, one DB          : {lb * app_pair * db:.4%}")
print(f"two apps, two DBs         : {lb * app_pair * db_pair:.4%}")</div>
  <div class="fx" data-lang="text">one LB + one app + one DB : 99.7901%
two apps, one DB          : 99.8899%
two apps, two DBs         : 99.9898%</div>
  <p>With one of each part, three good components (99.99%, 99.9%, 99.9%) combine into 99.79%, worse than any of them, roughly eighteen hours of downtime a year. Adding a second app server lifts it to 99.89%; but the single database is now the weak link. Adding a database replica that can take over raises the total to 99.99%. The lesson is to look for every single point of failure along the path of a request, and remove the ones that matter. This calculation assumes failures are independent; if both app servers sit in the same rack on the same power supply, they can fail together, which is exactly why cloud providers offer separate "availability zones" (see <a class="xref" data-note="cf_cloud">Virtualization, Cloud &amp; Performance</a>).</p>

  <h2 id="cfa-sync"><span class="num">08</span>Synchronous vs Asynchronous Communication</h2>
  <p>To build a customer's home page, the chai shop's backend must ask three other services for information: the inventory service (what is in stock), the pricing service (today's prices and offers) and the recommendation service (the model's suggestions). Each answers in about half a second. How long does the page take? That depends on whether the backend talks to them synchronously or asynchronously.</p>
  <p>In <strong>synchronous</strong> communication, the caller sends a request and then waits, doing nothing else, until the answer comes back; only then does it continue. A phone call is synchronous: you ask a question and hold the line until you get an answer. In <strong>asynchronous</strong> communication, the caller does not sit blocked while waiting; it can start other work, or other requests, and deal with each answer when it arrives. Sending three text messages and reading the replies as they come in is asynchronous. In code, "waiting" here means waiting on input/output, mainly the network: the CPU is idle the whole time, so it is pure waste to block on it. The simulation below uses <code>sleep</code> to stand in for a half-second network wait:</p>
  <div class="fx" data-lang="py"># SIMULATION: three calls to other services that each take about 0.5 s to reply.
# sleep stands in for waiting on the network; no real requests are made.
import asyncio, time

def call_service_sync(name):
    time.sleep(0.5)
    return f"{name} ok"

async def call_service_async(name):
    await asyncio.sleep(0.5)             # while waiting, the event loop runs other tasks
    return f"{name} ok"

services = ["inventory", "pricing", "recommendations"]

start = time.perf_counter()
results = [call_service_sync(s) for s in services]           # one after another
print("synchronous :", results, f"{time.perf_counter() - start:.2f} s")

async def main():
    return await asyncio.gather(*(call_service_async(s) for s in services))

start = time.perf_counter()
results = asyncio.run(main())                                 # all waiting at once
print("asynchronous:", results, f"{time.perf_counter() - start:.2f} s")</div>
  <div class="fx" data-lang="text">synchronous : ['inventory ok', 'pricing ok', 'recommendations ok'] 1.50 s
asynchronous: ['inventory ok', 'pricing ok', 'recommendations ok'] 0.50 s</div>
  <p>The synchronous version called the services one after another, so the three half-second waits added up to 1.50 seconds. The asynchronous version, using Python's <code>asyncio</code>, started all three requests and then waited for them together; because the waits overlapped, the whole thing took 0.50 seconds, the time of the slowest one. The work was the same; only the waiting was rearranged. (Timings are approximate and come from this machine.) This is why FastAPI and Uvicorn are built on async: one worker can have hundreds of requests "in flight" while each waits on a database or another API. The mechanics of <code>async</code>/<code>await</code> and the event loop are in <a class="xref" data-note="py_asyncio">asyncio</a>, and the difference between overlapping waiting and doing calculations in parallel is in <a class="xref" data-note="py_concurrency">Concurrency vs Parallelism</a>.</p>
  <p>The words are also used at a larger, architectural scale, and the meaning is the same. A synchronous interaction between services is "call and wait for the answer", typically an HTTP request: simple, and right whenever the caller genuinely needs the answer to continue (you cannot show prices without the prices). An asynchronous interaction is "hand the work over and move on, the result will come later": the customer's order is accepted at once, and the receipt email, the stock update and the sales report happen afterwards. The usual tool for that larger kind of asynchrony is a message queue, which is the next section.</p>

  <h2 id="cfa-queue"><span class="num">09</span>Message Queues and Event-Driven Architecture</h2>
  <p>When a customer places an order, the shop has a lot to do: save the order, charge the card, generate a PDF receipt and email it, update the stock count, and add the sale to the analytics tables. If the web request did all of this synchronously, the customer would stare at a spinner for several seconds, and if the email provider was down, the whole order would fail even though the email is not essential. Only the first two steps need to happen before telling the customer "order placed". The rest can happen a moment later.</p>
  <p>A <strong>message queue</strong> makes this possible. It is a separate piece of software that holds messages, small pieces of data describing work to be done, in order, until some other program takes them out and processes them. The program that puts messages in is the <strong>producer</strong>; the program that takes them out is the <strong>consumer</strong>, often called a <strong>worker</strong>. The queue sits between them, so they never call each other directly. Think of the order slips at a busy café: the cashier writes each order on a slip and clips it to the rail, then immediately serves the next customer. The baristas take slips off the rail at their own pace. If orders arrive faster than the baristas can work, slips pile up on the rail, but nothing is lost and the cashier never has to wait. If a barista goes on a break, the slips simply wait. Popular message queues include RabbitMQ, Amazon SQS, Redis-based queues used by Celery, and Kafka.</p>
  <figure class="viz"><svg viewBox="0 0 620 130" width="620">
    <defs><marker id="cfa-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="130" height="50" rx="8" class="fb sb"/><text x="75" y="62" text-anchor="middle">web app</text><text x="75" y="78" text-anchor="middle" class="tm" font-size="10">producer</text>
    <rect x="210" y="40" width="200" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
    <rect x="222" y="50" width="38" height="30" rx="4" class="ft st"/><text x="241" y="70" text-anchor="middle" font-size="10">103</text>
    <rect x="268" y="50" width="38" height="30" rx="4" class="ft st"/><text x="287" y="70" text-anchor="middle" font-size="10">102</text>
    <rect x="314" y="50" width="38" height="30" rx="4" class="ft st"/><text x="333" y="70" text-anchor="middle" font-size="10">101</text>
    <text x="310" y="110" text-anchor="middle" class="tm" font-size="10">queue: first in, first out</text>
    <rect x="480" y="40" width="130" height="50" rx="8" class="fg sg"/><text x="545" y="62" text-anchor="middle">worker</text><text x="545" y="78" text-anchor="middle" class="tm" font-size="10">consumer</text>
    <g stroke="currentColor" stroke-width="1.5"><line x1="140" y1="65" x2="206" y2="65" marker-end="url(#cfa-a3)"/><line x1="410" y1="65" x2="476" y2="65" marker-end="url(#cfa-a3)"/></g>
    <text x="173" y="56" text-anchor="middle" class="tm" font-size="10">put</text><text x="443" y="56" text-anchor="middle" class="tm" font-size="10">get</text>
  </svg><figcaption>The web app drops a message on the queue and replies to the customer at once; the worker takes messages off the other end at its own pace.</figcaption></figure>
  <p>Python's built-in <code>queue.Queue</code> behaves like a tiny message queue inside one process, which lets us watch the timing. The "web" part accepts three orders and puts each on the queue; a background worker thread takes them off and spends 0.4 seconds on each receipt:</p>
  <div class="fx" data-lang="py"># SIMULATION: a web handler puts jobs on a queue; a background worker does them later.
# queue.Queue lives inside one process; RabbitMQ, SQS or Kafka do the same across machines.
import queue, threading, time

jobs = queue.Queue()
start = time.perf_counter()
def now():
    return f"t={time.perf_counter() - start:.1f}s"

def worker():
    while True:
        order_id = jobs.get()
        if order_id is None:              # special "stop" message
            break
        time.sleep(0.4)                   # pretend: build PDF receipt + send email
        print(f"  worker : receipt for order {order_id} sent   {now()}")

threading.Thread(target=worker).start()

for order_id in (101, 102, 103):
    jobs.put(order_id)                    # takes microseconds
    print(f"  web    : order {order_id} accepted, replied to user   {now()}")

jobs.put(None)</div>
  <div class="fx" data-lang="text">  web    : order 101 accepted, replied to user   t=0.0s
  web    : order 102 accepted, replied to user   t=0.0s
  web    : order 103 accepted, replied to user   t=0.0s
  worker : receipt for order 101 sent   t=0.4s
  worker : receipt for order 102 sent   t=0.8s
  worker : receipt for order 103 sent   t=1.2s</div>
  <p>All three customers got their reply at about t=0.0s: putting a message on a queue takes microseconds, so the web request does not wait for the slow part. The worker then handled the receipts one by one, finishing at 0.4, 0.8 and 1.2 seconds, behind the scenes. Real queues add the things this toy lacks: they run as a separate server so messages survive a crash of the producer or consumer, they keep a message until the worker confirms it is done (so a worker that dies mid-job does not lose it), and many workers on many machines can consume from the same queue. That last point is a natural way to scale: if receipts start piling up, start more workers. The queue also smooths out traffic spikes, because workers can catch up after the rush, and it isolates failures: if the email provider is down, messages wait in the queue and are retried later, while orders keep being accepted. In ML, the same pattern runs batch predictions, video processing and model-training jobs: the API puts a job on a queue and returns a job ID, and GPU workers pick jobs up.</p>
  <p>A related but distinct idea is <strong>event-driven architecture</strong>. In the queue example, the web app was still telling a specific worker what to do ("send receipt for 101"). In an event-driven design, a service instead announces a fact about something that happened, an <strong>event</strong> such as "order 101 was placed", and any number of other services that care about that kind of event react to it on their own. The announcer does not know who is listening. This style is called <strong>publish/subscribe</strong> (pub/sub): services publish events to a topic, and others subscribe to the topics they are interested in. It is like a radio station: it broadcasts, and anyone tuned in hears it; adding a new listener requires nothing from the station.</p>
  <div class="fx" data-lang="py"># SIMULATION of event-driven design: the order service announces "order_placed";
# it does not know or care who listens.
subscribers = {}

def subscribe(event, handler):
    subscribers.setdefault(event, []).append(handler)

def publish(event, data):
    for handler in subscribers.get(event, []):
        handler(data)

subscribe("order_placed", lambda o: print("  email     : receipt to", o["user"]))
subscribe("order_placed", lambda o: print("  inventory : stock -", o["qty"], o["item"]))
subscribe("order_placed", lambda o: print("  analytics : add", o["qty"] * o["price"], "to daily sales"))

publish("order_placed", {"user": "asha@example.com", "item": "masala chai", "qty": 2, "price": 40})</div>
  <div class="fx" data-lang="text">  email     : receipt to asha@example.com
  inventory : stock - 2 masala chai
  analytics : add 80 to daily sales</div>
  <p>The order code called <code>publish</code> once, and three independent reactions happened: an email, a stock update and an analytics entry. Tomorrow the shop could add a fourth subscriber, say a fraud-check service, without touching the order code at all. That loose coupling is the main benefit of event-driven design; the cost is that the flow of the program is harder to follow, because no single place lists everything that happens after an order. In real systems the event bus is a durable system such as Apache Kafka, which also keeps a history of events so new consumers can replay them, which is why Kafka is so common in data engineering for streaming data into warehouses and feature stores (<a class="xref" data-note="de_kafka">Kafka &amp; Streaming</a>).</p>

  <h2 id="cfa-cache"><span class="num">10</span>Caching Layers</h2>
  <p>Most of the chai shop's traffic asks the same questions over and over. Ten thousand customers an hour load the menu, and the menu changes maybe once a day. Yet each request goes to the database, which reads disk, runs a query and sends rows back. The database becomes the bottleneck even though it is mostly repeating itself. A <strong>cache</strong> is a fast storage layer that keeps copies of the results of expensive operations, so that repeated requests can be answered from the copy instead of redoing the work. The everyday version is the notebook a shopkeeper keeps by the till with the prices of the twenty most popular items: they could look each one up in the big catalogue in the back room, but the notebook is much faster for the items people ask about all the time.</p>
  <p>Caches exist at many layers of a web system, and the same idea repeats at each. The browser caches images and scripts, so a second visit does not download them again. A <strong>CDN</strong> (content delivery network) is a worldwide network of servers that keeps copies of static files close to users, so a customer in Chennai downloads the shop's images from a nearby server rather than one on another continent. The backend uses an <strong>in-memory cache</strong> such as Redis, a separate server that stores key–value pairs in RAM and answers in well under a millisecond, for database results and computed values such as a user's recommendations. Inside a Python process, <code>functools.lru_cache</code> does the same for function results. (The CPU has caches too, for the same reason at a much smaller scale; that story is in <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a>.)</p>
  <p>The most common pattern in backend code is called <strong>cache-aside</strong>: look in the cache first; if the value is there (a <strong>cache hit</strong>), return it; if not (a <strong>cache miss</strong>), get it from the database, store it in the cache, and return it. Here is that pattern with a dictionary standing in for Redis and a 200 ms sleep standing in for a slow database query:</p>
  <div class="fx" data-lang="py"># SIMULATION of a cache in front of a slow database (sleep stands in for the query).
import time

DATABASE = {"masala chai": 40, "ginger chai": 45}
def slow_db_price(item):
    time.sleep(0.2)                       # pretend: a 200 ms database query
    return DATABASE[item]

cache = {}                                # Redis plays this role in real systems
def get_price(item):
    if item in cache:                     # cache hit: answer from memory
        return cache[item], "hit"
    price = slow_db_price(item)           # cache miss: ask the database...
    cache[item] = price                   # ...and remember the answer
    return price, "miss"

for item in ["masala chai", "masala chai", "ginger chai", "masala chai"]:
    t0 = time.perf_counter()
    price, kind = get_price(item)
    print(f"{item:12} {price}  {kind:4}  {(time.perf_counter() - t0) * 1000:6.1f} ms")

DATABASE["masala chai"] = 50              # the price changes in the database
print("after price change:", get_price("masala chai"))   # stale!
cache.pop("masala chai")                  # invalidate the cached copy
print("after invalidation:", get_price("masala chai"))</div>
  <div class="fx" data-lang="text">masala chai  40  miss   200.2 ms
masala chai  40  hit      0.0 ms
ginger chai  45  miss   200.2 ms
masala chai  40  hit      0.0 ms
after price change: (40, 'hit')
after invalidation: (50, 'miss')</div>
  <p>The first request for masala chai was a miss and took about 200 ms, because it went to the "database". The second was a hit and took effectively no time, because the price was in memory. Ginger chai missed once, then masala chai hit again. If most traffic is for popular items, most requests become hits and the database barely notices the load; the share of requests served from the cache is called the <strong>hit rate</strong>, and it is the number to watch.</p>
  <p>The last two lines show the catch, and it is the central difficulty of caching. The price of masala chai changed to 50 in the database, but the next request still returned 40, because the cache did not know. The cache was serving <strong>stale</strong> data. Only after the cached entry was removed, called <strong>cache invalidation</strong>, did the next request miss, read 50 from the database and store it. Real systems handle this in two main ways: give every entry a <strong>TTL</strong> (time to live), so it expires automatically after, say, five minutes and staleness is bounded; or delete the cached entry whenever the underlying data is updated. Choosing what to cache therefore depends on how stale the data is allowed to be: a menu can be five minutes old, a bank balance cannot. Caches also have limited memory, so when full they drop entries using a rule such as <strong>LRU</strong> (least recently used). How to set up Redis caching in a real API is covered in <a class="xref" data-note="api_production">Production Backend</a>.</p>

  <h2 id="cfa-realtime"><span class="num">11</span>WebSockets vs HTTP Polling</h2>
  <p>The shop adds live order tracking: after ordering, the customer sees "being prepared", then "out for delivery", then the rider moving on a map. The difficulty is that ordinary HTTP only works in one direction: the client asks, the server answers, and the conversation is over. The server has no way to speak first. So how does the page learn that the status changed?</p>
  <p>The simplest answer is <strong>polling</strong>: the page asks the server again and again on a timer, "any news?", say every two seconds. It works with any server and is easy to build, and for a dashboard that refreshes every minute it is perfectly fine. But it is wasteful for live updates. Most of the answers are "no change", each one is a full HTTP request with headers, and the update can be up to two seconds late. With 10,000 customers tracking orders and polling every 2 seconds, the server handles 5,000 requests per second, nearly all of them pointless. Polling is like a child in the back seat asking "are we there yet?" every minute. A variation called <strong>long polling</strong> improves this a little: the server holds the request open until it has news or a timeout passes, then the client immediately asks again.</p>
  <p>A <strong>WebSocket</strong> solves the problem properly. It is a protocol that starts as an ordinary HTTP request and then "upgrades" the connection into a permanent, two-way channel that stays open. Either side can send a message at any time, so the server simply pushes "out for delivery" the instant it happens, with no repeated requests and almost no delay. It is the difference between repeatedly calling a restaurant to ask whether your table is ready and being handed a buzzer that vibrates when it is. WebSockets power chat apps, multiplayer games, live sports scores, collaborative editors, and the token-by-token streaming of chatbot answers in many apps (some use a simpler one-way variant called <strong>server-sent events</strong>, SSE). The cost is that each open connection uses memory on the server for as long as the customer stays, the server must be asynchronous to hold thousands of mostly idle connections cheaply, and load balancers must be configured to keep long-lived connections. FastAPI supports WebSockets directly through its ASGI foundation.</p>
  <table class="tbl">
    <tr><th></th><th>HTTP polling</th><th>WebSocket</th></tr>
    <tr><td>Who starts a message</td><td>only the client</td><td>either side, any time</td></tr>
    <tr><td>Connection</td><td>a new request each time</td><td>one long-lived connection</td></tr>
    <tr><td>Delay of an update</td><td>up to one polling interval</td><td>almost immediate</td></tr>
    <tr><td>Wasted work</td><td>many "no change" requests</td><td>very little</td></tr>
    <tr><td>Good for</td><td>infrequent updates, simple setups</td><td>chat, live tracking, games, streaming output</td></tr>
  </table>

  <h2 id="cfa-cap"><span class="num">12</span>The CAP Theorem</h2>
  <p>The chai shop now keeps copies of its database in two data centres, Mumbai and Delhi, for availability. Normally every change made in one is copied to the other within milliseconds. Then one day the network link between the two cities breaks for ten minutes, while both data centres are still running and still receiving customers. This situation, where parts of a distributed system are working but cannot communicate with each other, is called a <strong>network partition</strong>. A customer in Mumbai buys the last packet of a special tea. What should the Mumbai database do, when it cannot tell Delhi?</p>
  <p>It has only two honest choices. It can refuse the purchase (or make the customer wait) until the link is back, so the two copies never disagree; or it can accept the purchase now and sort out the difference with Delhi later, accepting that for a while the two copies hold different data. The <strong>CAP theorem</strong> states this formally. It names three properties a distributed data store might want: <strong>Consistency</strong> (every read sees the most recent write, as if there were only one copy), <strong>Availability</strong> (every request to a working node gets a non-error response) and <strong>Partition tolerance</strong> (the system keeps operating despite network partitions). The theorem says that when a partition happens, you cannot have both consistency and availability; you must give up one of them. Since networks between machines will sometimes fail, partition tolerance is not optional in practice, so the real choice is: during a partition, do you prefer consistency (CP) or availability (AP)?</p>
  <div class="fx" data-lang="py"># SIMULATION: two database copies (replicas) in two data centres, and the link breaks.
class Replica:
    def __init__(self, name):
        self.name, self.stock = name, 10

mumbai, delhi = Replica("mumbai"), Replica("delhi")
sold = 0
link_up = False                           # network partition: replicas cannot talk

def buy(replica, other, mode):
    global sold
    if link_up:
        replica.stock -= 1; other.stock -= 1; sold += 1
        return "ok"
    if mode == "CP":                      # consistency first: refuse rather than diverge
        return "error: cannot reach other replica, try later"
    replica.stock -= 1; sold += 1         # availability first: accept, sync later
    return "ok (other replica not updated yet)"

print("CP:", buy(mumbai, delhi, "CP"), "| stock", mumbai.stock, delhi.stock)
print("AP:", buy(mumbai, delhi, "AP"), "| stock", mumbai.stock, delhi.stock)
print("AP:", buy(delhi, mumbai, "AP"), "| stock", mumbai.stock, delhi.stock)
print("units really sold:", sold, "-&gt; true stock is", 10 - sold)</div>
  <div class="fx" data-lang="text">CP: error: cannot reach other replica, try later | stock 10 10
AP: ok (other replica not updated yet) | stock 9 10
AP: ok (other replica not updated yet) | stock 9 9
units really sold: 2 -&gt; true stock is 8</div>
  <p>With the link down, the CP choice refused the sale: the customer got an error, but both replicas still agree that 10 are in stock. The AP choice accepted a sale in Mumbai and then another in Delhi. Both customers were served, but now each replica says 9, while 2 units have really been sold and the true stock is 8. When the link returns, the system must reconcile the two histories, and if only one packet had been left, it would have sold the same packet twice. That is the price of availability: the data is temporarily inconsistent, and the system must merge conflicts afterwards. Systems that take this route promise <strong>eventual consistency</strong>: if updates stop, all copies will eventually agree.</p>
  <p>Neither choice is "correct"; it depends on what an error costs compared with a wrong answer. A bank account balance or a stock counter for the last item favours consistency: better to refuse than to oversell. A social media like counter, a shopping cart or a product view count favours availability: showing 1,203 likes instead of 1,204 for a few seconds harms no one, but an error page does. Traditional relational databases like PostgreSQL on a single primary behave as CP systems; databases such as Cassandra and DynamoDB are often configured as AP; many modern databases let you choose per operation. It is also worth knowing the common refinement, PACELC, which adds that even when there is no partition, there is a trade-off between latency and consistency, because waiting for every copy to confirm a write takes time. How different database families make these choices is covered in <a class="xref" data-note="db_types">Types of Databases</a>.</p>

  <h2 id="cfa-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common architectural mistake is starting with microservices because large companies use them. A three-person team that splits a new product into eight services spends its time on deployment pipelines, network errors and debugging across services, instead of on the product. The fix is a modular monolith first, with clean boundaries inside the code, and splitting out a service only when a specific need appears: different hardware, different scaling, or a separate team.</p>
  <p>The second is making network calls without a timeout and retrying them without thinking about idempotency. Python's <code>requests</code> library waits forever by default, so one hung service can tie up every worker in the app, and naive retries of non-idempotent operations cause double charges, as in section 04:</p>
  <div class="fx" data-lang="py"># Risky: no timeout, and retrying a charge can pay twice
requests.post(PAY_URL, json={"order": 42, "amount": 250})

# Better: bounded wait, and an idempotency key so a retry is safe
requests.post(PAY_URL, json={"order": 42, "amount": 250},
              headers={"Idempotency-Key": "order-42"}, timeout=5)</div>
  <p>(This snippet is shown without output because it needs a real payment endpoint.) The third is keeping state in a server's memory and then scaling horizontally. Sessions, carts or uploaded files stored on one server vanish when the load balancer sends the next request elsewhere, or when that server restarts. Store shared state in a database, a cache like Redis or object storage, so servers stay stateless and interchangeable.</p>
  <p>The fourth is adding redundancy in one layer and forgetting another: three app servers behind a load balancer, all talking to one database on one machine with no replica and no tested backup. Walk the full path of a request and ask, for each component, "what happens if this one dies?". A related mistake is never testing failover; a replica that has never actually been promoted is a hope, not a plan.</p>
  <p>The fifth is caching without an expiry or invalidation plan. A cache that never expires will eventually serve stale prices, deleted products or another version of a model's output. Every cached value needs a TTL, an explicit invalidation when the source changes, or both, and the team must agree how stale each kind of data may be. Finally, polling aggressively for live data (every 500 ms from every open tab) can generate more load than all real traffic combined; for genuinely live updates use WebSockets or server-sent events, and for slow-changing data poll rarely.</p>

  <h2 id="cfa-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Building blocks</h3>
  <ul>
    <li><b>Client–server</b>: clients send requests, servers send responses (over HTTP).</li>
    <li><b>Frontend</b>: runs in the browser (HTML, CSS, JS). <b>Backend</b>: runs on servers (Python API, business rules, model). <b>Database</b>: durable storage.</li>
    <li><b>Web server</b> (Nginx): front door; HTTPS, static files, reverse proxy, many connections.</li>
    <li><b>Application server</b> (Gunicorn = WSGI, Uvicorn = ASGI): runs Python app code in several worker processes.</li>
    <li><b>Software architecture</b>: the high-level split of a system into parts and how they communicate.</li>
  </ul>
  <h3>Monolith vs microservices</h3>
  <table class="tbl">
    <tr><th>Monolith</th><th>Microservices</th></tr>
    <tr><td>one deployable app, function calls inside</td><td>many small apps, network calls between</td></tr>
    <tr><td>simple to build, test, debug</td><td>independent deploy/scale, fault isolation, team autonomy</td></tr>
    <tr><td>large teams collide; scale everything together</td><td>operational complexity, distributed failures</td></tr>
  </table>
  <h3>Scaling and availability</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Vertical scaling</td><td>bigger machine; simple, has a ceiling, still a single point of failure</td></tr>
    <tr><td>Horizontal scaling</td><td>more machines behind a load balancer; needs stateless servers</td></tr>
    <tr><td>Load balancer</td><td>spreads requests (round robin, least connections, hashing); health checks remove dead servers</td></tr>
    <tr><td>Redundancy / replica</td><td>spare copies of servers / data; failover promotes a replica to primary</td></tr>
    <tr><td>Single point of failure</td><td>one component whose failure stops everything</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Availability</th><th>Down per year</th><th>Down per month</th></tr>
    <tr><td>99% (two nines)</td><td>≈ 3.65 days</td><td>≈ 7.3 h</td></tr>
    <tr><td>99.9% (three nines)</td><td>≈ 8.8 h</td><td>≈ 44 min</td></tr>
    <tr><td>99.99% (four nines)</td><td>≈ 53 min</td><td>≈ 4.4 min</td></tr>
    <tr><td>99.999% (five nines)</td><td>≈ 5.3 min</td><td>≈ 26 s</td></tr>
  </table>
  <ul>
    <li>Parts in a chain: multiply availabilities. Redundant copies: down only if all are down, <code>1 - (1 - a)**n</code>.</li>
  </ul>
  <h3>Communication</h3>
  <ul>
    <li><b>Synchronous</b>: call and wait. <b>Asynchronous</b>: do not block while waiting; overlapping waits (async) or hand work over (queues).</li>
    <li><b>Message queue</b>: producer puts messages, worker consumes later; absorbs spikes, isolates failures, scales by adding workers.</li>
    <li><b>Event-driven / pub-sub</b>: publish "what happened"; any subscriber reacts; publisher does not know listeners (Kafka).</li>
    <li><b>Polling</b>: client asks repeatedly. <b>WebSocket</b>: one open two-way connection; server pushes.</li>
  </ul>
  <h3>Distributed systems, caching, CAP</h3>
  <ul>
    <li><b>Partial failure</b>: some parts fail while others run. A missing reply is ambiguous: lost request, crash, or lost reply.</li>
    <li><b>Timeout</b> on every call; <b>retry</b> with exponential backoff; only for <b>idempotent</b> operations or with an <b>idempotency key</b>.</li>
    <li><b>Cache-aside</b>: check cache → on miss read DB and store. Watch <b>hit rate</b>; handle staleness with <b>TTL</b> or <b>invalidation</b>; evict with <b>LRU</b>.</li>
    <li><b>CAP</b>: during a network partition choose <b>consistency</b> (refuse/wait) or <b>availability</b> (answer, maybe stale). AP systems are <b>eventually consistent</b>.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Microservices too early cost more than they save.</li>
    <li><code>requests</code> has no default timeout; always pass <code>timeout=</code>.</li>
    <li>State in server memory breaks horizontal scaling.</li>
    <li>Redundant app servers + one database = still a single point of failure.</li>
    <li>Every cache needs an expiry or invalidation plan.</li>
  </ul>

  <h2 id="cfa-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between the frontend and the backend?</summary><div class="qa-body">The frontend is the part of an application that runs on the user's device, usually HTML, CSS and JavaScript in a browser, and handles display and interaction. The backend runs on servers the company controls; it holds business rules, talks to the database and other services, and exposes APIs. The frontend can be modified by the user, so all validation and security checks must be repeated on the backend.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why put Nginx in front of Gunicorn or Uvicorn?</summary><div class="qa-body">They do different jobs. Nginx is a highly optimised web server and reverse proxy: it handles HTTPS, many slow client connections, static files, compression, request size limits and load balancing. Gunicorn or Uvicorn is an application server that runs the Python code in several worker processes. Letting Nginx absorb the internet-facing work keeps the Python workers free for application logic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between WSGI and ASGI?</summary><div class="qa-body">Both are standard interfaces between a Python web application and the server that runs it. WSGI is synchronous: each worker handles one request at a time from start to finish (Flask, classic Django, served by Gunicorn). ASGI supports asynchronous code, so one worker can interleave many requests that are waiting on I/O, and it supports WebSockets (FastAPI, served by Uvicorn).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Monolith vs microservices: what are the trade-offs, and which would you start with?</summary><div class="qa-body">A monolith is one deployable application; it is simple to build, test, debug and deploy, but large teams collide in it, one bug can take everything down, and it must be scaled as a whole. Microservices split the system into independently deployed services, which gives team autonomy, independent scaling and fault isolation, but adds network failures, operational tooling and harder debugging. For a new product or small team, start with a well-structured monolith and split services out when a concrete need appears.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a distributed system, and what makes it hard?</summary><div class="qa-body">A distributed system is a set of programs on different machines that coordinate over a network to act as one system. It is hard because of partial failure (one part fails while others continue), unreliable networks (messages are delayed or lost) and the lack of a shared clock. Above all, when a request gets no reply, the caller cannot know whether it was processed, so retries must be designed carefully.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is idempotency, and why does it matter for retries?</summary><div class="qa-body">An operation is idempotent if performing it several times has the same effect as performing it once, such as setting a value or deleting a specific record. Because a timed-out request may actually have succeeded, retrying a non-idempotent operation like "charge ₹250" can apply it twice. Making operations idempotent, often with a client-generated idempotency key the server deduplicates, makes retries safe.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain vertical vs horizontal scaling.</summary><div class="qa-body">Vertical scaling (scaling up) means moving to a bigger machine with more CPU, RAM or faster disk; it needs no code changes but has a hardware ceiling, gets expensive and leaves a single point of failure. Horizontal scaling (scaling out) means adding more machines running copies of the service behind a load balancer; it has almost no ceiling and adds redundancy, but needs stateless servers and shared storage for state. Databases are often scaled vertically first; web and API tiers are usually scaled horizontally.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "stateless" mean for a web server, and why does it matter?</summary><div class="qa-body">A stateless server keeps nothing important in its own memory between requests; session data, carts and files live in a database, cache or object store. Then any server can handle any request, so a load balancer can send requests anywhere, servers can be added or removed freely, and a crash loses no user data. Stateful servers need sticky routing and lose data when they die.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a load balancer do, and how does it handle a failed server?</summary><div class="qa-body">A load balancer receives all requests at one address and distributes them across a pool of servers using a rule such as round robin, least connections or a hash of the client. It regularly sends health checks (for example <code>GET /health</code>) to each server and removes any that fail from the rotation, adding them back once they pass again. It is also a convenient place for HTTPS termination and for draining traffic during deployments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between fault tolerance and high availability? How do you achieve them?</summary><div class="qa-body">Fault tolerance is the ability to keep working correctly when components fail; high availability is the measured outcome, the service being up a very high fraction of the time. Both come from redundancy: multiple app servers behind a load balancer, database replicas with automatic failover, and copies spread across availability zones or regions, plus health checks and monitoring to detect failure quickly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How much downtime per year does 99.9% availability allow? And 99.99%?</summary><div class="qa-body">A year has 525,600 minutes. 99.9% allows 0.1% downtime, about 526 minutes or 8.8 hours per year (about 44 minutes a month). 99.99% allows about 53 minutes per year (about 4.4 minutes a month), which in practice requires automatic failover because there is no time for manual fixes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Three components each 99.9% available are needed in series. What is the overall availability?</summary><div class="qa-body">For components that are all required, availabilities multiply: 0.999 × 0.999 × 0.999 ≈ 0.997, so about 99.7%, worse than any single part (roughly 26 hours of downtime a year). Adding redundancy to a layer improves it: two independent 99.9% copies give 1 − 0.001² = 99.9999% for that layer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a message queue instead of a direct API call?</summary><div class="qa-body">When the caller does not need the result immediately: sending emails, generating reports, resizing images, running batch predictions. A queue lets the request return quickly, absorbs traffic spikes, lets you scale by adding workers, and keeps work safe if a downstream service is temporarily down. Use a direct synchronous call when the caller cannot continue without the answer, such as fetching prices to show on a page.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a message queue and an event-driven (pub/sub) system?</summary><div class="qa-body">A work queue typically delivers each message to one worker, and the message is a command, "do this job". In pub/sub, a service publishes an event, a fact like "order placed", to a topic, and every subscribed service receives its own copy and reacts independently; the publisher does not know who listens. Kafka-style logs also keep events so consumers can replay history.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does caching improve performance, and what is the hardest part?</summary><div class="qa-body">A cache keeps results of expensive operations in fast storage, usually memory (Redis, a CDN, the browser), so repeated requests skip the database or computation; a high hit rate dramatically cuts latency and database load. The hardest part is invalidation: keeping cached data from becoming stale when the source changes. It is handled with TTLs, explicit deletion on update, and deciding per data type how stale is acceptable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>WebSockets vs HTTP polling: when would you use each?</summary><div class="qa-body">Polling means the client sends a new HTTP request on a timer to check for updates; it is simple and fine for infrequent changes, but wastes requests and adds delay. A WebSocket upgrades one HTTP connection into a long-lived two-way channel, so the server can push updates instantly; use it for chat, live tracking, multiplayer games or streaming model output. The cost is many open connections on the server and an async server to hold them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the CAP theorem with an example.</summary><div class="qa-body">CAP says a distributed data store cannot guarantee both consistency (every read sees the latest write) and availability (every request gets a non-error answer) while a network partition is happening; since partitions will happen, you choose CP or AP behaviour for that time. Example: two replicas lose contact and a customer buys the last item; a CP system refuses or waits so the replicas never disagree, while an AP system accepts the order and reconciles later, risking overselling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design sketch: how would you serve an ML model so it handles 10× more traffic and survives a server crash?</summary><div class="qa-body">Package the model server (for example FastAPI on Uvicorn) in a container and keep it stateless, with the model loaded at start-up. Run several replicas across availability zones behind a load balancer with health checks, and autoscale on CPU/GPU usage or request rate. Cache repeated predictions where inputs repeat, send slow or batch work through a queue to background workers, set timeouts and fallbacks in callers (show defaults if the model is down), and monitor latency percentiles and error rates.</div></details>
</main>
`
});
