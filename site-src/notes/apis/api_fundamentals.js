// notes/apis/api_fundamentals.js — HTTP & REST Fundamentals
Object.assign(TOPIC_CONTENT, {
  "api_fundamentals": `<main>
  <h1>HTTP &amp; REST Fundamentals</h1>
  <p class="lead">When you tap "Place order" on Swiggy, your phone sends a short text message to a Swiggy computer and gets a short text reply. This page explains that conversation from zero: what a server, a port, a request and JSON are, and the rules (HTTP) and house style (REST) almost every web API follows. You need it to put any ML model behind a URL, and interviewers ask about status codes, idempotency and REST in almost every backend or MLOps round. The Flask and FastAPI pages build on this one.</p>

  <h2 id="af-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">HTTP &amp; REST</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">API basics</div>
        <ul>
          <li><b>API</b> — agreed way one program asks another for work</li>
          <li><b>Web API</b> — that agreement over HTTP, answers usually in JSON</li>
          <li>💡 waiter: fixed menu, you never enter the kitchen</li>
          <li><b>Benefit</b> — swap the model/DB behind it; callers don't change</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Client, server, port, URL</div>
        <ul>
          <li><b>Server</b> — program that waits for requests and answers them</li>
          <li><b>Client</b> — program that asks (browser, app, curl, Python)</li>
          <li><b>IP address</b> — which computer; <b>port</b> — which program on it (door number)</li>
          <li><b>localhost / 127.0.0.1</b> — "this same computer"</li>
          <li><b>URL</b> — <code>scheme://host:port/path?query</code></li>
          <li>Nobody listening on the port → "Couldn't connect to server"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">HTTP message</div>
        <ul>
          <li><b>Request</b> — <code>GET /api/v1/products/11 HTTP/1.1</code> + headers + body</li>
          <li><b>Response</b> — <code>HTTP/1.1 200 OK</code> + headers + body</li>
          <li><b>Blank line</b> separates headers and body; all plain text over TCP</li>
          <li><b>Full trip</b> — DNS → TCP → TLS → proxy → app → handler → JSON back</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Methods</div>
        <ul>
          <li><b>GET</b> read · <b>POST</b> create/action · <b>PUT</b> replace · <b>PATCH</b> partial · <b>DELETE</b> remove</li>
          <li><b>Safe</b> — changes nothing on the server (GET, HEAD)</li>
          <li><b>Idempotent</b> — repeat = same end state (GET, PUT, DELETE); POST is not</li>
          <li>💡 lift button "3" (idempotent) vs "Buy" button (not)</li>
          <li>⚠ Retried POST double-charges → <code>Idempotency-Key</code> header</li>
          <li>⚠ Idempotent ≠ same response (2nd DELETE may 404)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Status codes</div>
        <ul>
          <li><b>First digit = family</b> — 2 ok, 3 look elsewhere, 4 your fault, 5 our fault</li>
          <li><b>2xx</b> — 200 OK, 201 Created (+Location), 202 Accepted (queued), 204 No Content</li>
          <li><b>4xx</b> — 400 bad body, 401 who are you, 403 not allowed, 404, 405 wrong verb, 409 conflict, 422 invalid values, 429 slow down</li>
          <li><b>5xx</b> — 500 bug, 502/503/504 proxy can't reach healthy backend</li>
          <li>⚠ Never return errors with 200</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Headers &amp; cookies</div>
        <ul>
          <li><b>Headers</b> — labels on the envelope; body = the letter</li>
          <li><b>Content-Type / Accept</b> — body format sent / wanted</li>
          <li><b>Authorization: Bearer …</b> — credentials (token = digital pass)</li>
          <li><b>Cache-Control, ETag → 304</b> — reuse old copy if unchanged</li>
          <li><b>Retry-After</b> with 429/503; <b>X-Request-ID</b> for tracing</li>
          <li><b>Cookie</b> — server <code>Set-Cookie</code>, browser auto-sends; flags <code>HttpOnly; Secure; SameSite</code></li>
          <li>💡 cookie = cloakroom ticket</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JSON</div>
        <ul>
          <li><b>JSON</b> — text format for data both sides can read</li>
          <li><b>Types</b> — object, array, string, number, bool, null</li>
          <li><b>dumps / loads</b> — serialize (pack) / deserialize (unpack); tuple → list, None → null</li>
          <li>⚠ date, set, Decimal, <b>NumPy int64/float32</b> → TypeError</li>
          <li><b>Fix</b> — <code>.tolist()</code>, <code>float(x)</code>; <code>default=str</code> turns 3 into "3"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">REST</div>
        <ul>
          <li><b>Resources</b> — plural nouns: <code>/customers/1/orders</code></li>
          <li><b>Verbs</b> from methods, not URLs (<code>/getAllProducts</code> ✗)</li>
          <li><b>Stateless</b> — each request carries auth + context → any server can answer</li>
          <li><b>Uniform, cacheable</b>; actions like <code>POST /predict</code> are fine</li>
          <li>⚠ Never change data via GET (crawlers/prefetch trigger it)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Versioning &amp; pagination</div>
        <ul>
          <li><b>Versioning</b> — URL <code>/v1/</code> (default), query param, or header</li>
          <li>Add field = safe; rename/remove/retype = new version</li>
          <li><b>Offset</b> — <code>?limit=20&amp;offset=40</code>; jump to page; slow deep, skips/repeats on inserts</li>
          <li><b>Cursor</b> — <code>WHERE id &gt; last LIMIT 20</code>; fast, stable; no page jumps</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="af-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What an API Is</span><span class="rm-sub">The waiter between you and the kitchen</span></div></div>
      <div class="rm-item rm-done" data-target="af-server"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Client, Server, Port, URL</span><span class="rm-sub">Who talks to whom, and where</span></div></div>
      <div class="rm-item rm-done" data-target="af-cycle"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Request → Response</span><span class="rm-sub">A raw exchange, line by line</span></div></div>
      <div class="rm-item rm-done" data-target="af-methods"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Methods &amp; Idempotency</span><span class="rm-sub">GET, POST, PUT, PATCH, DELETE</span></div></div>
      <div class="rm-item rm-done" data-target="af-status"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Status Codes</span><span class="rm-sub">The 15 that matter</span></div></div>
      <div class="rm-item rm-done" data-target="af-headers"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Headers &amp; Cookies</span><span class="rm-sub">Labels on every message</span></div></div>
      <div class="rm-item rm-done" data-target="af-json"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">JSON Serialization</span><span class="rm-sub">Python objects ⇄ text</span></div></div>
      <div class="rm-item rm-done" data-target="af-rest"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">REST Principles</span><span class="rm-sub">Resources, verbs, statelessness</span></div></div>
      <div class="rm-item rm-done" data-target="af-version"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Versioning &amp; Pagination</span><span class="rm-sub">Change safely, return in pages</span></div></div>
      <div class="rm-item rm-done" data-target="af-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="af-what"><span class="num">01</span>What an API Is</h2>
  <p>Open the IRCTC app and search "Mumbai to Delhi, tomorrow". The app on your phone does not store every train in India. It sends your question to an IRCTC computer, and that computer sends back the list of trains. Two programs, on two different machines, just had a conversation.</p>
  <p>For that to work, both sides must agree on the rules. Which questions can the app ask? In what words? What will the answer look like? Without fixed rules, every app would need to know how IRCTC's code works inside, and any change at IRCTC would break every app.</p>
  <p>The fixed list of questions a program accepts, and the shape of each answer, is called an <strong>API</strong> (Application Programming Interface). When the questions travel over the internet using HTTP (the rules of web conversation, explained below), it is called a <strong>web API</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="af-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="35" width="130" height="60" rx="8" class="fb sb"/><text x="75" y="62" text-anchor="middle">You (client)</text><text x="75" y="80" text-anchor="middle" class="tm" font-size="12">app, notebook, curl</text>
    <rect x="235" y="35" width="130" height="60" rx="8" class="ft st"/><text x="300" y="62" text-anchor="middle">Waiter (API)</text><text x="300" y="80" text-anchor="middle" class="tm" font-size="12">fixed menu of requests</text>
    <rect x="460" y="35" width="130" height="60" rx="8" class="fg sg"/><text x="525" y="62" text-anchor="middle">Kitchen</text><text x="525" y="80" text-anchor="middle" class="tm" font-size="12">model, DB, logic</text>
    <line x1="140" y1="52" x2="233" y2="52" stroke="currentColor" marker-end="url(#af-ar)"/><text x="187" y="45" text-anchor="middle" font-size="12">order</text>
    <line x1="235" y1="80" x2="142" y2="80" stroke="currentColor" marker-end="url(#af-ar)"/><text x="187" y="100" text-anchor="middle" font-size="12">dish</text>
    <line x1="365" y1="52" x2="458" y2="52" stroke="currentColor" marker-end="url(#af-ar)"/>
    <line x1="460" y1="80" x2="367" y2="80" stroke="currentColor" marker-end="url(#af-ar)"/>
    <text x="300" y="122" text-anchor="middle" class="tm" font-size="12">You never walk into the kitchen.</text>
  </svg><figcaption>Read left to right: you give your order to the waiter, the waiter talks to the kitchen, the dish comes back the same way.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant waiter. You choose from a fixed menu. You never walk into the kitchen or see how the dal is made. The kitchen can change chefs or recipes, and you won't notice, as long as the menu stays the same.</p></div>
  <p><strong>A tiny example from ML.</strong> You trained a model that predicts if a customer will leave (churn). The mobile team wants to show a "special offer" to risky customers. They don't want your Python code. They want one question they can ask: "here is customer 42's data, will they churn?" and one answer: <code>{"churn": true, "score": 0.81}</code>. That question-and-answer contract is your API. Next month you retrain the model; the mobile app keeps working, because the contract did not change.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>API</strong> (Application Programming Interface): the agreed way one program asks another for work. A <strong>web API</strong> does it over HTTP.</p></div>
  <div class="callout anlg"><span class="label">Where the analogy breaks</span><p>A real waiter remembers you. A REST API does not: every request must carry everything needed, including who you are.</p></div>

  <h2 id="af-server"><span class="num">02</span>Client, Server, Port, URL</h2>
  <p>Every conversation above has two roles. The program that <em>asks</em> is the <strong>client</strong>: your browser, a phone app, a Jupyter notebook, or <code>curl</code> (a command-line tool that sends web requests and prints the reply). The program that <em>waits and answers</em> is the <strong>server</strong>. "Server" means a program first. People also call the computer it runs on a server.</p>
  <p>A server computer can run many server programs at once: a website, a database, a cache. So a client needs two things to reach the right one:</p>
  <ul>
    <li><strong>IP address</strong> — the address of the computer, like <code>13.234.10.5</code>. It works like a building's street address.</li>
    <li><strong>Port</strong> — a number from 0 to 65535 that picks one program on that computer. It works like a flat or door number inside the building.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="af-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="62" width="120" height="44" rx="6" class="fb sb"/><text x="70" y="82" text-anchor="middle">Client</text><text x="70" y="98" text-anchor="middle" font-size="11" class="tm">browser / curl</text>
    <rect x="230" y="10" width="360" height="150" rx="8" fill="none" stroke="currentColor"/>
    <text x="410" y="28" text-anchor="middle">Server computer  IP 13.234.10.5</text>
    <rect x="245" y="42" width="70" height="28" rx="4" class="ft st"/><text x="280" y="61" text-anchor="middle">:443</text>
    <rect x="330" y="42" width="245" height="28" rx="4" class="fs"/><text x="452" y="61" text-anchor="middle">web server (your API)</text>
    <rect x="245" y="80" width="70" height="28" rx="4" class="fs"/><text x="280" y="99" text-anchor="middle">:5432</text>
    <rect x="330" y="80" width="245" height="28" rx="4" class="fs"/><text x="452" y="99" text-anchor="middle">PostgreSQL database</text>
    <rect x="245" y="118" width="70" height="28" rx="4" class="fs"/><text x="280" y="137" text-anchor="middle">:6379</text>
    <rect x="330" y="118" width="245" height="28" rx="4" class="fs"/><text x="452" y="137" text-anchor="middle">Redis cache</text>
    <line x1="130" y1="78" x2="243" y2="58" stroke="currentColor" marker-end="url(#af-ar3)"/><text x="185" y="56" text-anchor="middle" font-size="11">IP + port</text>
  </svg><figcaption>One computer, many programs. The IP finds the computer; the port number finds the program behind one "door".</figcaption></figure>
  <p>Two special names you will see all the time: <code>localhost</code> and <code>127.0.0.1</code> both mean "this same computer". When you run a server on your laptop, the client on your laptop reaches it at <code>127.0.0.1:5001</code>.</p>
  <h3>Reading a URL</h3>
  <p>A <strong>URL</strong> (web address) packs all of this into one line. Each part answers one question:</p>
  <figure class="viz"><svg viewBox="0 0 600 105" width="600">
    <rect x="5" y="10" width="80" height="34" rx="4" class="fv"/><text x="45" y="32" text-anchor="middle">https://</text>
    <rect x="90" y="10" width="130" height="34" rx="4" class="fb sb"/><text x="155" y="32" text-anchor="middle">api.shop.com</text>
    <rect x="225" y="10" width="55" height="34" rx="4" class="ft st"/><text x="252" y="32" text-anchor="middle">:443</text>
    <rect x="285" y="10" width="160" height="34" rx="4" class="fg sg"/><text x="365" y="32" text-anchor="middle">/api/v1/products</text>
    <rect x="450" y="10" width="145" height="34" rx="4" class="fs"/><text x="522" y="32" text-anchor="middle">?limit=2</text>
    <text x="45" y="64" text-anchor="middle" font-size="11">scheme</text><text x="45" y="80" text-anchor="middle" font-size="11" class="tm">which rules</text>
    <text x="155" y="64" text-anchor="middle" font-size="11">host</text><text x="155" y="80" text-anchor="middle" font-size="11" class="tm">which computer</text>
    <text x="252" y="64" text-anchor="middle" font-size="11">port</text><text x="252" y="80" text-anchor="middle" font-size="11" class="tm">which door</text>
    <text x="365" y="64" text-anchor="middle" font-size="11">path</text><text x="365" y="80" text-anchor="middle" font-size="11" class="tm">which thing</text>
    <text x="522" y="64" text-anchor="middle" font-size="11">query string</text><text x="522" y="80" text-anchor="middle" font-size="11" class="tm">extra options</text>
    <text x="300" y="100" text-anchor="middle" font-size="11" class="tm">port is usually hidden: https means 443, http means 80</text>
  </svg><figcaption>Five parts of a URL. The host is turned into an IP address by DNS (the internet's phone book).</figcaption></figure>
  <p><strong>Try it.</strong> Here is a complete web server in 10 lines (Flask, a Python library for web servers; it has its own page). It answers one kind of question: "give me product number N".</p>
  <div class="fx" data-lang="py"># shop.py
from flask import Flask

app = Flask(__name__)
PRODUCTS = {10: {"id": 10, "name": "Laptop", "price": 800},
            11: {"id": 11, "name": "Phone", "price": 500}}

@app.get("/api/v1/products/&lt;int:pid&gt;")
def get_product(pid):
    if pid not in PRODUCTS:
        return {"error": "product not found"}, 404
    return PRODUCTS[pid]</div>
  <div class="fx" data-lang="text">$ flask --app shop run --port 5051          # start the server: it now waits on port 5051
 * Serving Flask app 'shop'
 * Running on http://127.0.0.1:5051

$ curl -s http://127.0.0.1:5051/api/v1/products/10       # in a second terminal: the client
{"id":10,"name":"Laptop","price":800}

$ curl -sS http://127.0.0.1:5099/api/v1/products/10      # wrong port: nobody is listening there
curl: (7) Failed to connect to 127.0.0.1 port 5099 after 0 ms: Couldn't connect to server</div>
  <p>Notice two things. The server is just a program that keeps running and waiting. And a wrong port gives no answer at all, because no program is behind that door.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A server started on <code>127.0.0.1</code> accepts requests only from the same machine. To accept requests from other machines it must listen on <code>0.0.0.0</code> ("all network cards"). "It works on my laptop but not from my phone" is very often this.</p></div>

  <h2 id="af-cycle"><span class="num">03</span>Request → Response</h2>
  <p>Client and server need a shared language, like two people agreeing to speak Hindi on a phone call. On the web that language is <strong>HTTP</strong> (HyperText Transfer Protocol). A <em>protocol</em> is just a fixed set of rules for a conversation.</p>
  <p>HTTP has one simple pattern. The client sends one <strong>request</strong> ("give me product 11"). The server sends back one <strong>response</strong> ("here it is", or "no such product"). Then the conversation is over.</p>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
    <defs><marker id="af-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="30" y="8" width="110" height="28" rx="6" class="fb sb"/><text x="85" y="27" text-anchor="middle">Client</text>
    <rect x="245" y="8" width="110" height="28" rx="6" class="ft st"/><text x="300" y="27" text-anchor="middle">API server</text>
    <rect x="460" y="8" width="110" height="28" rx="6" class="fg sg"/><text x="515" y="27" text-anchor="middle">Database</text>
    <line x1="85" y1="36" x2="85" y2="205" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="300" y1="36" x2="300" y2="205" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="515" y1="36" x2="515" y2="205" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="85" y1="60" x2="298" y2="60" stroke="currentColor" marker-end="url(#af-ar2)"/><text x="192" y="54" text-anchor="middle" font-size="12">1  GET /api/v1/products/11</text>
    <line x1="300" y1="95" x2="513" y2="95" stroke="currentColor" marker-end="url(#af-ar2)"/><text x="407" y="89" text-anchor="middle" font-size="12">2  SELECT … WHERE id=11</text>
    <line x1="515" y1="130" x2="302" y2="130" stroke="currentColor" marker-end="url(#af-ar2)"/><text x="407" y="124" text-anchor="middle" font-size="12">3  row</text>
    <line x1="300" y1="170" x2="87" y2="170" stroke="currentColor" marker-end="url(#af-ar2)"/><text x="192" y="164" text-anchor="middle" font-size="12" class="tg">4  200 OK + JSON body</text>
  </svg><figcaption>Time flows downwards. One request in, one response out. The connection carries nothing else between calls.</figcaption></figure>
  <p>Both the request and the response are plain text. <code>curl -v</code> ("verbose") prints that text. Lines starting with <code>&gt;</code> were sent by the client; lines starting with <code>&lt;</code> came back from the server:</p>
  <div class="fx" data-lang="text">$ curl -v http://127.0.0.1:5001/api/v1/products/11 -H 'Accept: application/json'
&gt; GET /api/v1/products/11 HTTP/1.1
&gt; Host: 127.0.0.1:5001
&gt; User-Agent: curl/8.5.0
&gt; Accept: application/json
&gt;
&lt; HTTP/1.1 200 OK
&lt; Server: Werkzeug/3.1.9 Python/3.13.16
&lt; Date: Fri, 16 Oct 2026 06:28:36 GMT
&lt; Content-Type: application/json
&lt; Content-Length: 37
&lt; Connection: close
&lt;
{"id":11,"name":"Phone","price":500}</div>
  <p>Read it like a letter. The first line says what you want. The next lines (<strong>headers</strong>) are labels, like "From" and "Language" on an envelope. A blank line ends the labels. After it comes the <strong>body</strong>: the actual content.</p>
  <table class="tbl">
    <tr><th>Part</th><th>Request</th><th>Response</th></tr>
    <tr><td>Start line</td><td><code>GET /api/v1/products/11 HTTP/1.1</code> (method, path, version)</td><td><code>HTTP/1.1 200 OK</code> (version, status)</td></tr>
    <tr><td>Headers</td><td>Host, Accept, User-Agent</td><td>Content-Type, Content-Length, Date</td></tr>
    <tr><td>Blank line</td><td colspan="2">Separates headers from body</td></tr>
    <tr><td>Body</td><td>Empty for GET</td><td>The JSON</td></tr>
  </table>
  <p>From Python you usually use the <code>requests</code> library instead of curl. It sends the same text and gives you the parts as Python values (run against <code>shop.py</code> from section 02):</p>
  <div class="fx" data-lang="py">import requests

r = requests.get("http://127.0.0.1:5051/api/v1/products/11")
print(r.status_code)                  # did it work?
print(r.headers["Content-Type"])      # what format is the body?
print(r.text)                         # the raw text that came back
data = r.json()                       # turn JSON text into a Python dict
print(data["name"], data["price"])

r2 = requests.get("http://127.0.0.1:5051/api/v1/products/99")
print(r2.status_code, r2.json())</div>
  <div class="fx" data-lang="text">200
application/json
{"id":11,"name":"Phone","price":500}

Phone 500
404 {'error': 'product not found'}</div>
  <div class="callout intu"><span class="label">Key insight</span><p>HTTP is just structured text over a TCP connection (TCP = the internet's reliable delivery pipe between two programs). Every framework (Flask, FastAPI, Django) is a machine for parsing that text and writing a reply.</p></div>
  <h3>The full trip, step by step</h3>
  <p>Interviewers like "what happens when you call an API URL?". The short answer, in order:</p>
  <div class="flow"><span>DNS: name → IP</span><span>TCP: open a connection</span><span>TLS: set up encryption (https)</span><span>Proxy / load balancer</span><span>App routes to a function</span><span>DB / model work</span><span>JSON response back</span></div>
  <p><strong>DNS</strong> turns <code>api.shop.com</code> into an IP address, like looking up a name in a phone book. <strong>TLS</strong> is the encryption behind <code>https</code> (covered in <em>Authentication &amp; Security</em>). A <strong>load balancer</strong> is a front-door program that spreads requests across several copies of your server.</p>

  <h2 id="af-methods"><span class="num">04</span>Methods &amp; Idempotency</h2>
  <p>The first word of every request is the <strong>method</strong> (also called the verb). It tells the server what kind of action you want on the thing named by the path. Think of a library register: you can <em>look up</em> a book, <em>add</em> a new book, <em>replace</em> a book's whole entry, <em>correct</em> one field, or <em>remove</em> it. HTTP has one method for each.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Meaning</th><th>Body?</th><th>Safe</th><th>Idempotent</th><th>Example</th></tr>
    <tr><td><code>GET</code></td><td>Read</td><td>No</td><td>✓</td><td>✓</td><td><code>GET /products/11</code></td></tr>
    <tr><td><code>POST</code></td><td>Create / run an action</td><td>Yes</td><td>✗</td><td>✗</td><td><code>POST /predict</code>, <code>POST /orders</code></td></tr>
    <tr><td><code>PUT</code></td><td>Replace whole resource</td><td>Yes</td><td>✗</td><td>✓</td><td><code>PUT /products/11</code></td></tr>
    <tr><td><code>PATCH</code></td><td>Change some fields</td><td>Yes</td><td>✗</td><td>✗ (usually)</td><td><code>PATCH /products/11 {"price":450}</code></td></tr>
    <tr><td><code>DELETE</code></td><td>Remove</td><td>No</td><td>✗</td><td>✓</td><td><code>DELETE /products/11</code></td></tr>
  </table>
  <p>Two words in that table need explaining.</p>
  <ul>
    <li><strong>Safe</strong>: does not change anything on the server. Reading a product is safe.</li>
    <li><strong>Idempotent</strong>: doing it once or five times leaves the server in the same state. "Set the price to 450" is idempotent. "Create a new order" is not.</li>
  </ul>
  <p>Why care? Because networks fail. Your phone sends a request, the reply gets lost on a weak 4G signal, and the app sends it again (a <strong>retry</strong>). If the request was idempotent, the retry is harmless. If not, something happens twice.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A lift button is idempotent: pressing "3" five times still takes you to floor 3 once. A "buy" button is not: five presses, five orders.</p></div>
  <p><strong>Worked example.</strong> A client sends the same two requests three times because of retries. Watch the server's state:</p>
  <div class="fx" data-lang="py"># A tiny "server state": one product and a list of orders
product = {"id": 11, "price": 500}
orders = []

def put_price(new_price):          # PUT: "set the price to this value"
    product["price"] = new_price

def post_order(item):              # POST: "create a new order"
    orders.append({"order_id": len(orders) + 1, "item": item})

for _ in range(3):                 # the client retries 3 times
    put_price(450)
    post_order("Phone")

print("price after 3 PUTs :", product["price"])
print("orders after 3 POSTs:", len(orders), orders)</div>
  <div class="fx" data-lang="text">price after 3 PUTs : 450
orders after 3 POSTs: 3 [{'order_id': 1, 'item': 'Phone'}, {'order_id': 2, 'item': 'Phone'}, {'order_id': 3, 'item': 'Phone'}]</div>
  <p>Three PUTs: price is 450, same as after one. Three POSTs: three orders, and the customer wanted one.</p>
  <div class="callout trap"><span class="label">Trap: retries</span><p>Networks time out, and clients retry. Retrying an idempotent call is harmless; retrying <code>POST /payments</code> can charge twice. Fix: the client sends an <code>Idempotency-Key</code> header (a unique id for this one payment) and the server ignores repeats of the same key.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Idempotent is about server <em>state</em>, not the response. A second <code>DELETE</code> may return 404 instead of 204, yet the state (item gone) is identical.</p></div>

  <h2 id="af-status"><span class="num">05</span>Status Codes</h2>
  <p>Every response starts with a three-digit number called the <strong>status code</strong>. It is the server's one-word verdict on your request, before you read any details. Programs read this number to decide what to do next: show the data, ask the user to log in, or try again later.</p>
  <p>You only need to remember what the <em>first digit</em> means. The rest is detail.</p>
  <div class="cards">
    <div><b>2xx Success</b><p>It worked.</p></div>
    <div><b>3xx Redirect</b><p>Look elsewhere.</p></div>
    <div><b>4xx Client error</b><p>You sent something wrong. Don't retry unchanged.</p></div>
    <div><b>5xx Server error</b><p>We broke. Retry later may work.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A railway enquiry counter. "Here is your ticket" is 2xx. "Go to counter 5" is 3xx. "Your form is filled wrong" is 4xx: fix the form, then come back. "Our printer is broken" is 5xx: the problem is theirs, so trying again later may work.</p></div>
  <table class="tbl">
    <tr><th>Code</th><th>Name</th><th>When</th></tr>
    <tr><td>200</td><td>OK</td><td>Successful GET / PUT / PATCH, or a prediction</td></tr>
    <tr><td>201</td><td>Created</td><td>POST created something; add a <code>Location</code> header saying where it lives</td></tr>
    <tr><td>202</td><td>Accepted</td><td>Queued for later (async job); return a job id</td></tr>
    <tr><td>204</td><td>No Content</td><td>Success with empty body (often DELETE)</td></tr>
    <tr><td>301 / 302 / 304</td><td>Moved / Found / Not Modified</td><td>Redirects; 304 = your cached (saved) copy is still fresh</td></tr>
    <tr><td>400</td><td>Bad Request</td><td>Malformed body, e.g. broken JSON</td></tr>
    <tr><td>401</td><td>Unauthorized</td><td>Not <em>authenticated</em>: missing or bad credentials (server doesn't know who you are)</td></tr>
    <tr><td>403</td><td>Forbidden</td><td>Authenticated, but not <em>allowed</em> (server knows you, and says no)</td></tr>
    <tr><td>404</td><td>Not Found</td><td>No such resource</td></tr>
    <tr><td>405</td><td>Method Not Allowed</td><td>Right URL, wrong verb</td></tr>
    <tr><td>409</td><td>Conflict</td><td>Duplicate, or a version clash</td></tr>
    <tr><td>422</td><td>Unprocessable Content</td><td>Valid JSON, invalid values (FastAPI's validation error)</td></tr>
    <tr><td>429</td><td>Too Many Requests</td><td>Rate limit hit; send <code>Retry-After</code></td></tr>
    <tr><td>500</td><td>Internal Server Error</td><td>Unhandled exception in your code</td></tr>
    <tr><td>502 / 503 / 504</td><td>Bad Gateway / Unavailable / Gateway Timeout</td><td>Proxy can't reach a healthy, fast backend</td></tr>
  </table>
  <p>Real responses from the same server (<code>curl -i</code> prints the status line and headers too; repeated headers trimmed):</p>
  <div class="fx" data-lang="text">$ curl -i -X POST localhost:5001/api/v1/products -H 'Content-Type: application/json' -d '{"name":"Mouse","price":25}'
HTTP/1.1 201 CREATED
Content-Type: application/json
Location: /api/v1/products/15

{"id":15,"name":"Mouse","price":25}

$ curl -i localhost:5001/api/v1/products/99           →  HTTP/1.1 404 NOT FOUND   {"error":"product not found"}
$ curl -i -X DELETE localhost:5001/api/v1/products/10 →  HTTP/1.1 405 METHOD NOT ALLOWED
$ curl -i -X POST ... -d '{"name":'                  →  HTTP/1.1 400 BAD REQUEST</div>
  <p>In curl, <code>-X POST</code> picks the method, <code>-H</code> adds a header, and <code>-d</code> sends a body.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Returning <code>200</code> with <code>{"error": "..."}</code> in the body. Monitoring, retries and caches all read the status code, so they will treat the failure as success.</p></div>

  <h2 id="af-headers"><span class="num">06</span>Headers &amp; Cookies</h2>
  <p>A courier parcel has the item inside and a label outside: address, weight, "fragile". The courier reads the label, not the item. HTTP <strong>headers</strong> are that label. Each header is one line: <code>Name: value</code>. They tell the other side how to handle the body, who is asking, and how long the answer can be reused.</p>
  <table class="tbl">
    <tr><th>Header</th><th>Direction</th><th>Job</th></tr>
    <tr><td><code>Content-Type: application/json</code></td><td>both</td><td>What format the body is in</td></tr>
    <tr><td><code>Accept: application/json</code></td><td>request</td><td>What format I want back</td></tr>
    <tr><td><code>Authorization: Bearer eyJ…</code></td><td>request</td><td>Who I am (token)</td></tr>
    <tr><td><code>Cache-Control: max-age=60</code></td><td>response</td><td>How long the reply may be reused</td></tr>
    <tr><td><code>ETag: "v7"</code> / <code>If-None-Match</code></td><td>both</td><td>Version tag; enables 304 Not Modified</td></tr>
    <tr><td><code>Retry-After: 30</code></td><td>response</td><td>When to try again (429/503)</td></tr>
    <tr><td><code>X-Request-ID</code></td><td>both</td><td>Trace one request across services' logs</td></tr>
  </table>
  <ul>
    <li>A <strong>token</strong> is a long random-looking string the server gave you after login. You show it on every request, like a pass. "Bearer" means "whoever holds this pass". The auth page explains tokens fully.</li>
    <li><strong>ETag</strong> works like an edition number on a newspaper. The client says "I already have edition v7" (<code>If-None-Match: "v7"</code>). If nothing changed, the server replies <code>304</code> with an empty body, which saves sending the same data again.</li>
    <li><strong>X-Request-ID</strong> is a unique id stamped on one request, so you can find every log line about it across many services.</li>
  </ul>
  <h3>Cookies</h3>
  <p>HTTP forgets you after every response. So how does a website keep you logged in? The server gives the browser a small piece of text called a <strong>cookie</strong>, and the browser sends it back automatically with every later request.</p>
  <div class="flow"><span>POST /login</span><span>Server: Set-Cookie</span><span>Browser stores it</span><span>Browser auto-sends Cookie on every later request</span></div>
  <div class="fx" data-lang="text">$ curl -si -X POST localhost:5001/login | grep -i set-cookie
Set-Cookie: session_id=abc123; Secure; HttpOnly; Path=/; SameSite=Lax</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cookie is a cloakroom ticket. The server hands it over once; you show it every time, and the server looks up your coat.</p></div>
  <p>The words after the value are safety flags:</p>
  <ul>
    <li><code>HttpOnly</code>: JavaScript on the page can't read it. This blocks theft by <strong>XSS</strong> (cross-site scripting: an attacker sneaks their script into a page).</li>
    <li><code>Secure</code>: sent only over HTTPS (encrypted connections).</li>
    <li><code>SameSite=Lax</code>: not sent on most requests started by other websites. This blocks <strong>CSRF</strong> (cross-site request forgery: another site tricks your browser into acting for you).</li>
  </ul>

  <h2 id="af-json"><span class="num">07</span>JSON Serialization</h2>
  <p>Your Python code holds a dict in memory. The network can only carry text (bytes). The client may not even be Python: it could be JavaScript on a phone. So both sides need a common text format for data. Almost every API uses <strong>JSON</strong> (JavaScript Object Notation). It looks almost exactly like a Python dict:</p>
  <div class="fx" data-lang="text">{"id": 11, "name": "Phone", "price": 500, "in_stock": true, "tags": ["mobile", "5g"], "discount": null}</div>
  <p>Turning a Python object into JSON text is called <strong>serializing</strong> (packing it for the journey). Turning JSON text back into an object is <strong>deserializing</strong> (unpacking). In Python: <code>json.dumps</code> packs ("dump to string"), <code>json.loads</code> unpacks ("load from string").</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Sending a cupboard by train. You take it apart and pack it flat (serialize), it travels, and the other side assembles it again (deserialize). Some things can't be packed flat without a special box, and those are the errors below.</p></div>
  <div class="flow"><span>Python dict</span><span>json.dumps (serialize)</span><span>JSON text on the wire</span><span>json.loads (deserialize)</span><span>dict again</span></div>
  <div class="fx" data-lang="py">import json, datetime
import numpy as np

order = {"id": 100, "paid": True, "note": None, "tags": ("new", "vip")}
s = json.dumps(order)
print(s)                     # Python -&gt; JSON text
print(json.loads(s))         # JSON text -&gt; Python (tuple came back as list)

for bad in [datetime.date(2024, 5, 1), np.int64(3), {1, 2}]:
    try:
        json.dumps({"x": bad})
    except TypeError as e:
        print("TypeError:", e)

print(json.dumps({"d": datetime.date(2024, 5, 1), "n": np.int64(3)}, default=str))</div>
  <div class="fx" data-lang="text">{"id": 100, "paid": true, "note": null, "tags": ["new", "vip"]}
{'id': 100, 'paid': True, 'note': None, 'tags': ['new', 'vip']}
TypeError: Object of type date is not JSON serializable
TypeError: Object of type int64 is not JSON serializable
TypeError: Object of type set is not JSON serializable
{"d": "2024-05-01", "n": "3"}</div>
  <ul>
    <li>JSON has only six kinds of value: object (like a dict), array (like a list), string, number, true/false, null. Tuples become lists; <code>None</code> becomes <code>null</code>; <code>True</code> becomes <code>true</code>.</li>
    <li>Dates, sets, <code>Decimal</code> and NumPy types fail by default, because JSON has no type for them.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: ML responses</span><p><code>model.predict()</code> returns NumPy values, which crash <code>json.dumps</code>. Use <code>.tolist()</code> or <code>float(x)</code>. <code>default=str</code> "works" but turns the number 3 into the string <code>"3"</code>.</p></div>

  <h2 id="af-rest"><span class="num">08</span>REST Principles</h2>
  <p>HTTP gives you methods and paths, but it does not say how to name things. Without a shared style, one team writes <code>/getAllProducts</code>, another <code>/fetch_items_list</code>, a third <code>/products/list</code>. Every new API then needs a fresh manual.</p>
  <p><strong>REST</strong> (Representational State Transfer) is the common style most APIs follow. The idea in one line: URLs name <em>things</em> (called <strong>resources</strong>), and the HTTP method says what to do with them. So the URL is a noun and the method is the verb.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school office with labelled cupboards: "Students", "Teachers", "Fees". You don't need a cupboard called "GetStudentMarks". You go to the "Students" cupboard, open file 42, and either read it, update it, or remove it.</p></div>
  <table class="tbl">
    <tr><th>Action</th><th>RESTful ✓</th><th>RPC-style ✗</th></tr>
    <tr><td>List products</td><td><code>GET /products</code></td><td><code>GET /getAllProducts</code></td></tr>
    <tr><td>One product</td><td><code>GET /products/11</code></td><td><code>POST /fetchProduct {"id":11}</code></td></tr>
    <tr><td>Create</td><td><code>POST /products</code></td><td><code>POST /createProduct</code></td></tr>
    <tr><td>A customer's orders</td><td><code>GET /customers/1/orders</code></td><td><code>GET /getOrdersForCustomer?c=1</code></td></tr>
    <tr><td>Delete</td><td><code>DELETE /products/11</code></td><td><code>GET /deleteProduct?id=11</code></td></tr>
  </table>
  <p>"RPC-style" (remote procedure call) means URLs named like function calls. It is the opposite habit.</p>
  <div class="cards">
    <div><b>Resources</b><p>Plural nouns in URLs; verbs come from the method.</p></div>
    <div><b>Stateless</b><p>Each request carries all it needs (token, params). The server keeps no per-client memory between calls.</p></div>
    <div><b>Uniform interface</b><p>Same methods and status codes everywhere.</p></div>
    <div><b>Cacheable</b><p>Responses say whether they can be reused.</p></div>
  </div>
  <div class="callout intu"><span class="label">Why statelessness matters</span><p>If no server remembers you, any server can answer you. That is what lets you run 10 copies behind a load balancer (see <em>Production Backend</em>). It's like a bank where any counter can serve you, because you bring your passbook every time.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Purity has limits. <code>POST /predict</code> is an action, not a resource, and that is fine. Interviewers want you to know the rules <em>and</em> when to bend them.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Never change data with GET. Search engine crawlers and browser "prefetch" open GET links on their own. A <code>GET /deleteProduct?id=11</code> link will one day be clicked by a robot.</p></div>

  <h2 id="af-version"><span class="num">09</span>Versioning &amp; Pagination</h2>
  <h3>Versioning</h3>
  <p>Once the mobile app reads a field called <code>price</code>, renaming it to <code>cost</code> breaks every phone that hasn't updated yet. And you can't force every user to update on the same day. A <strong>version</strong> lets the old and new shapes live side by side: old apps call <code>/v1/</code>, new apps call <code>/v2/</code>.</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>Looks like</th><th>Trade-off</th></tr>
    <tr><td>URL path (most common)</td><td><code>/api/v1/products</code></td><td>Obvious, easy to route and cache; URLs change</td></tr>
    <tr><td>Query param</td><td><code>/products?version=2</code></td><td>Easy to forget; messier caching</td></tr>
    <tr><td>Header</td><td><code>Accept: application/vnd.shop.v2+json</code></td><td>Clean URLs; invisible in browser, harder to test</td></tr>
  </table>
  <p>Adding a field is non-breaking: old clients simply ignore it. Removing or renaming one, or changing its type, needs a new version.</p>
  <h3>Pagination</h3>
  <p>An Instagram feed doesn't load every post ever made. It loads a few, then more as you scroll. APIs do the same: never return 10 million rows in one response. Return one <strong>page</strong> plus a pointer to the next one. This is called <strong>pagination</strong>.</p>
  <div class="fx" data-lang="text">$ curl 'localhost:5001/api/v1/products?limit=2&amp;offset=0'
{"items":[{"id":10,"name":"Laptop","price":800},{"id":11,"name":"Phone","price":500}],"next_offset":2,"total":5}</div>
  <p><code>limit</code> = how many items per page. <code>offset</code> = how many to skip first. Page 2 is <code>offset=2</code>, page 3 is <code>offset=4</code>, and so on.</p>
  <p>There are two ways to point at the next page. <strong>Offset</strong> says "skip the first N". <strong>Cursor</strong> says "give me items after the last one I saw". The worked example shows why that difference matters when new items arrive while you scroll:</p>
  <div class="fx" data-lang="py">rows = [f"post{i}" for i in range(1, 8)]      # newest first: post1 is newest

def page_offset(offset, limit=3):
    return rows[offset:offset + limit]

print("page 1:", page_offset(0))
rows.insert(0, "post0")                        # someone posts while you read
print("page 2:", page_offset(3))               # post3 shows up again

# cursor version: "give me 3 rows after the last one I saw"
rows = [f"post{i}" for i in range(1, 8)]
def page_cursor(after=None, limit=3):
    start = rows.index(after) + 1 if after else 0
    return rows[start:start + limit]

p1 = page_cursor()
print("cursor page 1:", p1)
rows.insert(0, "post0")
print("cursor page 2:", page_cursor(after=p1[-1]))</div>
  <div class="fx" data-lang="text">page 1: ['post1', 'post2', 'post3']
page 2: ['post3', 'post4', 'post5']
cursor page 1: ['post1', 'post2', 'post3']
cursor page 2: ['post4', 'post5', 'post6']</div>
  <p>With offset, one new post pushed everything down by one, so <code>post3</code> appeared twice. The cursor remembered "after post3", so nothing repeated.</p>
  <table class="tbl">
    <tr><th></th><th>Offset / limit</th><th>Cursor (keyset)</th></tr>
    <tr><td>Request</td><td><code>?limit=20&amp;offset=40</code></td><td><code>?limit=20&amp;after=id_1840</code></td></tr>
    <tr><td>DB query</td><td><code>OFFSET 40 LIMIT 20</code> (scans and skips 40)</td><td><code>WHERE id &gt; 1840 ORDER BY id LIMIT 20</code> (index seek)</td></tr>
    <tr><td>Deep pages</td><td>Slow</td><td>Fast</td></tr>
    <tr><td>Rows inserted meanwhile</td><td>Duplicates / skips</td><td>Stable</td></tr>
    <tr><td>Jump to page 7</td><td>Yes</td><td>No</td></tr>
  </table>
  <p>"Index seek" means the database jumps straight to <code>id 1840</code> using its index (like a book's index), instead of reading and throwing away the first 40 rows.</p>

  <h2 id="af-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a client and a server? What does a port do?</summary><div class="qa-body">The client asks (browser, app, curl, Python script); the server is a program that keeps running and answers requests. The IP address picks the computer; the port number picks which program on that computer gets the request (e.g. 443 for the web server, 5432 for PostgreSQL).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is idempotency, and which HTTP methods have it?</summary><div class="qa-body">Making the same request once or many times leaves the server in the same state. GET, HEAD, PUT, DELETE (and OPTIONS) are idempotent; POST is not; PATCH usually isn't (e.g. "increment stock by 1").</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PUT vs PATCH vs POST?</summary><div class="qa-body">POST creates (server picks the id) or triggers an action. PUT replaces the whole resource at a known URL, so missing fields are wiped. PATCH changes only the fields you send.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>401 vs 403?</summary><div class="qa-body">401: not authenticated (no or invalid credentials); log in and retry. 403: authenticated but not authorized; logging in again won't help.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A client times out on POST /payments and retries. What can go wrong and how do you fix it?</summary><div class="qa-body">The first request may have succeeded, so the customer is charged twice. Have the client send a unique <code>Idempotency-Key</code>; the server stores the key with the result and returns the stored result for repeats.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "REST is stateless" mean? Does it mean no database?</summary><div class="qa-body">The server keeps no client <em>session</em> memory between requests; each request carries its own auth and context. Resource state still lives in a database. Statelessness lets any server instance handle any request, which makes horizontal scaling simple.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your endpoint returns <code>{"pred": np.int64(1)}</code>. What happens?</summary><div class="qa-body">The stdlib JSON encoder raises <code>TypeError: Object of type int64 is not JSON serializable</code>, which surfaces as a 500. Convert with <code>int(x)</code>, <code>float(x)</code> or <code>arr.tolist()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Offset vs cursor pagination: which for an infinite feed of 50M events?</summary><div class="qa-body">Cursor. <code>OFFSET 4000000</code> makes the DB walk and discard 4M rows; <code>WHERE id &gt; last_id LIMIT 20</code> seeks the index directly. Cursors also don't duplicate or skip items when new rows arrive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name three ways to version an API. Which would you pick?</summary><div class="qa-body">URL path (<code>/v1/</code>), query parameter, or a header (custom or <code>Accept</code> media type). URL path is the usual default: visible, easy to route, cache and test. Only bump for breaking changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design REST endpoints for "a customer's orders" and "cancel an order".</summary><div class="qa-body"><code>GET /customers/{id}/orders</code> to list. To cancel, either <code>PATCH /orders/{id}</code> with <code>{"status":"cancelled"}</code> (state change on a resource), or <code>POST /orders/{id}/cancel</code> if cancelling triggers side effects like refunds. Never <code>GET /cancelOrder?id=</code>: GETs must be safe, and crawlers or prefetchers would cancel orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a cookie safe for a session id?</summary><div class="qa-body"><code>HttpOnly</code> (JS can't read it, limits XSS damage), <code>Secure</code> (HTTPS only), <code>SameSite=Lax/Strict</code> (limits CSRF), plus a short expiry and a random, unguessable value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens between typing an API URL and getting JSON back?</summary><div class="qa-body">DNS resolves the host to an IP; a TCP connection opens (plus a TLS handshake for HTTPS); the client sends method, path, headers and body; a proxy/load balancer forwards it to an app server; the framework routes it to a handler, which may hit a DB or model; the handler's result is serialized to JSON and sent back with a status code and headers.</div></details>
</main>`
});
