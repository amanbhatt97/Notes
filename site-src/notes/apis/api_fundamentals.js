// notes/apis/api_fundamentals.js — HTTP & REST Fundamentals
Object.assign(TOPIC_CONTENT, {
  "api_fundamentals": `<main>
  <h1>HTTP &amp; REST Fundamentals</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>HTTP &amp; REST Fundamentals</span></div>
  <p class="lead">Almost every piece of software you will deploy, from a model behind a prediction endpoint to a dashboard that fetches numbers, talks to other programs by sending short text messages over the network using a set of rules called HTTP. This note explains those messages from zero: what an API is, how a request finds the right program, what a request and a response actually contain, what the methods, status codes and headers mean, how Python data becomes text, how to name URLs in the REST style, how to change an API without breaking its users, and why servers should not remember their clients. The running example is <strong>Biteful</strong>, a small food-delivery company whose phone app asks a backend program for restaurants and places orders. Asha opens the app, picks Dosa Hut, and orders two Masala Dosas; we will follow that order, and a few others, through every section. Every command on this page was run against a real local server, and the outputs are pasted exactly as they came back.</p>

  <h2 id="af-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">HTTP &amp; REST</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The conversation</div>
        <ul>
          <li><b>API</b>: an agreed list of requests and answer shapes</li>
          <li><b>Client</b> asks, <b>server</b> listens on a <b>port</b> and answers</li>
          <li><b>URL</b> = <code>scheme://host:port/path?query</code></li>
          <li>Request: method + path, headers, blank line, body</li>
          <li>Response: status code, headers, blank line, body</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Methods</div>
        <ul>
          <li>GET read · POST create · PUT replace · PATCH change · DELETE remove</li>
          <li><b>Safe</b>: changes nothing (GET)</li>
          <li><b>Idempotent</b>: repeating it leaves the same state (GET, PUT, DELETE)</li>
          <li>POST is not; retries need an <code>Idempotency-Key</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Codes and labels</div>
        <ul>
          <li>2xx worked · 3xx look elsewhere · 4xx your fault · 5xx our fault</li>
          <li>201 + Location, 400 vs 422, 401 vs 403, 404, 409</li>
          <li>Headers: Content-Type, Authorization, ETag → 304</li>
          <li>Cookies: Set-Cookie once, sent back automatically</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Design rules</div>
        <ul>
          <li>JSON body: <code>dumps</code> / <code>loads</code>; no datetime, Decimal, NumPy, set</li>
          <li>REST: noun URLs, verbs from methods, cursor pagination</li>
          <li>Version breaking changes: <code>/v1</code> next to <code>/v2</code></li>
          <li>Stateless: each request carries what it needs, so any copy can answer</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="af-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What an API Is</span><span class="rm-sub">why the phone cannot just read the database</span></div></div>
      <div class="rm-item rm-done" data-target="af-server"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Clients, Servers, Ports and URLs</span><span class="rm-sub">who talks to whom, and how a request finds its program</span></div></div>
      <div class="rm-item rm-done" data-target="af-cycle"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Request–Response Cycle</span><span class="rm-sub">what actually travels, captured with curl -v</span></div></div>
      <div class="rm-item rm-done" data-target="af-methods"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">HTTP Methods and Idempotency</span><span class="rm-sub">read, create, replace, change, delete, and retries</span></div></div>
      <div class="rm-item rm-done" data-target="af-status"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Status Codes</span><span class="rm-sub">the server's verdict in one number</span></div></div>
      <div class="rm-item rm-done" data-target="af-headers"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Headers and Cookies</span><span class="rm-sub">labels on the message, caching, staying logged in</span></div></div>
      <div class="rm-item rm-done" data-target="af-json"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">JSON Serialization</span><span class="rm-sub">turning Python objects into text and back</span></div></div>
      <div class="rm-item rm-done" data-target="af-rest"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">REST Resources and URL Design</span><span class="rm-sub">naming things, filtering and pagination</span></div></div>
      <div class="rm-item rm-done" data-target="af-version"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Versioning</span><span class="rm-sub">changing an API without breaking old apps</span></div></div>
      <div class="rm-item rm-done" data-target="af-state"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Statelessness</span><span class="rm-sub">why any server copy must be able to answer</span></div></div>
      <div class="rm-item rm-done" data-target="af-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">errors sent as 200, missing Content-Type, GET that writes</span></div></div>
      <div class="rm-item rm-done" data-target="af-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, codes, methods table, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="af-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the HTTP and REST questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="af-what"><span class="num">01</span>What an API Is</h2>
  <p>Biteful is a small food-delivery company in Pune and Mumbai (the same company the SQL notes use, for example in <a class="xref" data-note="sql_joins">Joins</a>). Its restaurants, menus and orders are stored in a database on a computer that Biteful rents in a data centre. At the moment it has five restaurants:</p>
  <table class="tbl">
    <tr><th>id</th><th>name</th><th>city</th><th>rating</th><th>menu</th></tr>
    <tr><td>10</td><td>Dosa Hut</td><td>Pune</td><td>4.5</td><td>Masala Dosa ₹120, Idli ₹60, Filter Coffee ₹40</td></tr>
    <tr><td>11</td><td>Biryani Bros</td><td>Mumbai</td><td>4.2</td><td>Chicken Biryani ₹350, Raita ₹50</td></tr>
    <tr><td>12</td><td>Pizza Point</td><td>Pune</td><td>3.9</td><td>Margherita ₹280, Garlic Bread ₹100</td></tr>
    <tr><td>13</td><td>Green Bowl</td><td>Mumbai</td><td>4.2</td><td>(no menu yet)</td></tr>
    <tr><td>14</td><td>Momo Magic</td><td>Pune</td><td>none yet</td><td>(no menu yet)</td></tr>
  </table>
  <p>Asha's phone has the Biteful app installed, but none of this data. When she opens the app, it has to get the list of restaurants from Biteful's computer; when she taps "Place order", it has to tell Biteful's computer to record an order. The obvious idea is to let the app connect to the database directly and run SQL. That would be a disaster. Every phone would need the database password, so anyone who took the app apart would have it. Every phone would need to know the table and column names, so the day Biteful renamed a column, every installed app would break. And nothing would stop a modified app from running <code>DELETE FROM orders</code>. The phone needs a way to ask for exactly the things it is allowed to ask for, without knowing anything about how Biteful stores them.</p>
  <p>That is what an API provides. An <strong>API</strong> (Application Programming Interface) is an agreed list of requests that one program will accept from another, together with the shape of the answer to each one. Biteful's API might say: "you may ask for the list of restaurants, and you will get back a list where each entry has an id, a name, a city and a rating"; "you may ask to create an order by sending a restaurant id and a list of items, and you will get back the new order with its id and total". The program that offers the API does the real work behind it, in whatever way it likes, and the program that uses the API sees only the agreed requests and answers. When those requests travel over the internet using HTTP, the rules of web conversation that the rest of this page explains, it is called a <strong>web API</strong>. In this track "API" will always mean a web API.</p>
  <p>Think of a waiter in a restaurant. You choose from a fixed menu, the waiter carries your order to the kitchen, and the food comes back. You never walk into the kitchen, and you do not need to know whether the dosa batter was made this morning or which chef is on duty. The kitchen can hire a new chef or rearrange its shelves, and you will not notice, as long as the menu stays the same. The menu is the API; the kitchen is the database and code behind it.</p>
  <p>The key benefit is that the two sides can change independently. Next month Biteful moves its data from one database to another; the app keeps working, because it only ever knew "ask for the restaurant list, get back id, name, city and rating". For a data scientist this is the same reason models are served behind an API: you can retrain the model, change the library or move it to a bigger machine, and every program that calls it keeps working, because the request and answer shapes did not change. The flip side is that the API itself becomes a promise. Once thousands of phones rely on the answer having a field called <code>rating</code>, you cannot casually rename it; section 09 is about how to change a promise safely.</p>
  <p>The backend program that offers Biteful's API is called the <strong>orders API</strong>. Over the following sections we will run it on a laptop and talk to it, so the next question is practical: when the app sends a request, how does it reach that one program?</p>

  <h2 id="af-server"><span class="num">02</span>Clients, Servers, Ports and URLs</h2>
  <p>Every API conversation has two roles. The program that asks is the <strong>client</strong>: Asha's app, a web browser, a Python script in a Jupyter notebook, or <code>curl</code>, a command-line tool that sends a web request and prints the reply (we will use it constantly). The program that waits for requests and answers them is the <strong>server</strong>. Notice that "server" means a program first. People also call the computer it runs on "a server", but the thing that answers is a running program, which the operating system calls a <strong>process</strong> (<a class="xref" data-note="cf_os">Operating Systems</a> explains processes). A server process starts, says "I am ready", and then sits waiting, possibly for days, answering each request that arrives.</p>
  <p>To reach a server process, the client needs to know two things. The first is which computer it is on. Every computer on a network has an <strong>IP address</strong>, a number such as <code>13.234.10.5</code> that other computers use to send it data, much like a street address. Because numbers are hard to remember, the internet also has names such as <code>api.biteful.in</code>, called <strong>host names</strong>, and a system called <strong>DNS</strong> works like a phone book that turns a host name into its IP address. The second thing is which program on that computer. One computer usually runs several server programs at once, for example the orders API, a database and a cache, so the address alone is not enough. Each server program claims a <strong>port</strong>, a number from 0 to 65535, and the operating system delivers data sent to that port to that program. If the IP address is the address of an apartment building, the port is the flat number.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="af-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="62" width="120" height="44" rx="6" class="fb sb"/><text x="70" y="82" text-anchor="middle">Client</text><text x="70" y="98" text-anchor="middle" font-size="11" class="tm">app / curl</text>
    <rect x="230" y="10" width="360" height="150" rx="8" fill="none" stroke="currentColor"/>
    <text x="410" y="28" text-anchor="middle">Biteful's computer, IP 13.234.10.5</text>
    <rect x="245" y="42" width="70" height="28" rx="4" class="ft st"/><text x="280" y="61" text-anchor="middle">:443</text>
    <rect x="330" y="42" width="245" height="28" rx="4" class="fs"/><text x="452" y="61" text-anchor="middle">orders API (web server)</text>
    <rect x="245" y="80" width="70" height="28" rx="4" class="fs"/><text x="280" y="99" text-anchor="middle">:5432</text>
    <rect x="330" y="80" width="245" height="28" rx="4" class="fs"/><text x="452" y="99" text-anchor="middle">PostgreSQL database</text>
    <rect x="245" y="118" width="70" height="28" rx="4" class="fs"/><text x="280" y="137" text-anchor="middle">:6379</text>
    <rect x="330" y="118" width="245" height="28" rx="4" class="fs"/><text x="452" y="137" text-anchor="middle">Redis cache</text>
    <line x1="130" y1="78" x2="243" y2="58" stroke="currentColor" marker-end="url(#af-ar3)"/><text x="185" y="56" text-anchor="middle" font-size="11">IP + port</text>
  </svg><figcaption>One computer, three server programs, each on its own port. The IP address finds the computer; the port picks the program.</figcaption></figure>
  <p>In the figure, Biteful's computer runs three server programs. A request sent to IP 13.234.10.5 on port 443 is handed to the orders API; one sent to port 5432 would go to the PostgreSQL database instead. Some ports have conventional owners: web servers use 80 for plain HTTP and 443 for encrypted HTTPS, PostgreSQL uses 5432, Redis uses 6379. On your own laptop you can pick almost any free number above 1024. Two special names appear constantly in development: <code>localhost</code> and the IP address <code>127.0.0.1</code> both mean "this same computer", so a client and a server on the same laptop talk through them without the data ever leaving the machine. (<a class="xref" data-note="cf_networking">Networking</a> covers IP addresses, DNS and ports in more depth.)</p>
  <p>Once the client knows the computer and the port, it opens a <strong>connection</strong> to the server. On the internet this is a <strong>TCP</strong> connection: TCP is the part of the networking system that delivers bytes between two programs reliably and in order, re-sending anything lost on the way. You can think of it as a telephone line between the two processes; HTTP, which we meet in the next section, is the language they speak once the line is open.</p>
  <p>All of this is packed into a single line, the <strong>URL</strong> (Uniform Resource Locator, the web address). Take <code>https://api.biteful.in:443/v1/restaurants?city=Pune</code>. Each part answers one question:</p>
  <table class="tbl">
    <tr><th>Part</th><th>In the example</th><th>Question it answers</th></tr>
    <tr><td>scheme</td><td><code>https://</code></td><td>Which rules? <code>http</code> is plain, <code>https</code> is HTTP inside an encrypted connection</td></tr>
    <tr><td>host</td><td><code>api.biteful.in</code></td><td>Which computer? DNS turns the name into an IP address</td></tr>
    <tr><td>port</td><td><code>:443</code></td><td>Which program on it? Usually left out: <code>https</code> means 443, <code>http</code> means 80</td></tr>
    <tr><td>path</td><td><code>/v1/restaurants</code></td><td>Which thing inside the server? The server chooses the code to run from this</td></tr>
    <tr><td>query string</td><td><code>?city=Pune</code></td><td>Extra options, as <code>name=value</code> pairs joined by <code>&amp;</code></td></tr>
  </table>
  <p>Let us see a real client and server. Here is a complete web server for Biteful, cut down to answer a single request, "list restaurants". It is written with <strong>Flask</strong>, a Python library for building servers. You do not need to understand the code yet; the <a class="xref" data-note="api_flask">Flask</a> note builds it line by line. For now, the only important line is <code>@app.get("/v1/restaurants")</code>, which says "when a GET request for the path <code>/v1/restaurants</code> arrives, run the function below and send back what it returns".</p>
  <div class="fx" data-lang="py"># biteful_min.py: the smallest possible Biteful server
from flask import Flask

app = Flask(__name__)
RESTAURANTS = [
    {"id": 10, "name": "Dosa Hut", "city": "Pune", "rating": 4.5},
    {"id": 11, "name": "Biryani Bros", "city": "Mumbai", "rating": 4.2},
]

@app.get("/v1/restaurants")
def list_restaurants():
    return {"items": RESTAURANTS}</div>
  <p>We start it in one terminal with the <code>flask</code> command, telling it which port to claim. Port 18157 is just a free number we picked. The server prints where it is listening and then waits:</p>
  <div class="fx" data-lang="text">$ flask --app biteful_min run --port 18157
 * Serving Flask app 'biteful_min'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:18157
Press CTRL+C to quit</div>
  <p>The line <code>Running on http://127.0.0.1:18157</code> is the server saying "I own port 18157 on this computer and I am waiting". The warning only means Flask's built-in server is meant for development; real deployments use a production server, covered in <a class="xref" data-note="api_production">Production Backend</a>. Now, in a second terminal, we act as the client. First we send a request to the right port, then the same request to port 18198, where nothing is running:</p>
  <div class="fx" data-lang="text">$ curl -s http://127.0.0.1:18157/v1/restaurants
{"items":[{"city":"Pune","id":10,"name":"Dosa Hut","rating":4.5},{"city":"Mumbai","id":11,"name":"Biryani Bros","rating":4.2}]}

$ curl -sS http://127.0.0.1:18198/v1/restaurants
curl: (7) Failed to connect to 127.0.0.1 port 18198 after 0 ms: Couldn't connect to server</div>
  <p>The first request reached the server, which ran <code>list_restaurants</code>, turned the returned Python dict into text, and sent it back; curl printed that text. (This small server lets Flask sort the keys alphabetically, which is why <code>city</code> comes before <code>id</code>; the full server later keeps them in the order we wrote them.) The second request failed before any conversation happened. Error 7, "Couldn't connect to server", means the operating system found no program owning port 18198, so it refused the connection. That is very different from a server that answers "no": here there was nobody to answer at all. When you see "connection refused", check whether the server is running and whether the port is right. Meanwhile, the server's terminal logged the one request it received:</p>
  <div class="fx" data-lang="text">127.0.0.1 - - [19/Nov/2026 07:31:06] "GET /v1/restaurants HTTP/1.1" 200 -</div>
  <p>The log line records who asked (<code>127.0.0.1</code>, this same machine), when, what was asked (<code>GET /v1/restaurants HTTP/1.1</code>) and the result code (200, which section 05 explains). The second request never appears, because it never reached this program. One practical detail: because the server said it is running on <code>127.0.0.1</code>, it only accepts connections that come from the same computer. To accept requests from other machines, such as your phone on the same Wi-Fi, a server must listen on <code>0.0.0.0</code>, which means "every network connection this computer has". "It works on my laptop but not from my phone" is very often exactly this.</p>

  <h2 id="af-cycle"><span class="num">03</span>The Request–Response Cycle</h2>
  <p>In the last section curl printed only the restaurant list. But the client must have sent more than a path: how did the server know which method was wanted, or what format to reply in, and how did curl know the request succeeded? To answer that we need to see the whole message.</p>
  <p>Client and server need a shared language, just as two people on a phone call must agree to speak Hindi or English. On the web that language is <strong>HTTP</strong> (HyperText Transfer Protocol). A <strong>protocol</strong> is a fixed set of rules for a conversation: who speaks first, what each message must contain, and in what order. HTTP's basic rule is very simple. The client sends one <strong>request</strong>; the server sends back one <strong>response</strong>; that exchange is complete. The server never speaks first, and every request gets exactly one response.</p>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
    <defs><marker id="af-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="30" y="8" width="110" height="28" rx="6" class="fb sb"/><text x="85" y="27" text-anchor="middle">Asha's app</text>
    <rect x="245" y="8" width="110" height="28" rx="6" class="ft st"/><text x="300" y="27" text-anchor="middle">Orders API</text>
    <rect x="460" y="8" width="110" height="28" rx="6" class="fg sg"/><text x="515" y="27" text-anchor="middle">Database</text>
    <line x1="85" y1="36" x2="85" y2="205" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="300" y1="36" x2="300" y2="205" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="515" y1="36" x2="515" y2="205" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="85" y1="60" x2="298" y2="60" stroke="currentColor" marker-end="url(#af-ar2)"/><text x="192" y="54" text-anchor="middle" font-size="12">1  GET /v1/restaurants/10</text>
    <line x1="300" y1="95" x2="513" y2="95" stroke="currentColor" marker-end="url(#af-ar2)"/><text x="407" y="89" text-anchor="middle" font-size="12">2  look up id 10</text>
    <line x1="515" y1="130" x2="302" y2="130" stroke="currentColor" marker-end="url(#af-ar2)"/><text x="407" y="124" text-anchor="middle" font-size="12">3  Dosa Hut row</text>
    <line x1="300" y1="170" x2="87" y2="170" stroke="currentColor" marker-end="url(#af-ar2)"/><text x="192" y="164" text-anchor="middle" font-size="12" class="tg">4  200 OK + JSON body</text>
  </svg><figcaption>Time flows downwards. One request in, one response out; what the server does in between is hidden from the client.</figcaption></figure>
  <p>Read the figure from top to bottom. In step 1 the app sends a request asking for restaurant 10. In steps 2 and 3 the orders API does its own work, here looking up the row in the database; the app cannot see this part, which is exactly the "kitchen" from section 01. In step 4 the server sends one response back, containing a status and the restaurant's data, and the exchange is over. If the app wants something else, it sends a new request.</p>
  <p>From here on we use the full Biteful server, <code>biteful.py</code>. It holds the five restaurants, three menus and the orders in ordinary Python dicts (a real service would use a database, but dicts keep the example small). Here is its data part, which every later section builds on; we start it the same way, on port 18158:</p>
  <div class="fx" data-lang="py"># biteful.py: the Biteful orders API used throughout this note
import hashlib, json, secrets
import numpy as np
from flask import Flask, request, make_response

app = Flask(__name__)
app.json.sort_keys = False              # keep keys in the order we wrote them

RESTAURANTS = {
    10: {"id": 10, "name": "Dosa Hut",     "city": "Pune",   "rating": 4.5},
    11: {"id": 11, "name": "Biryani Bros", "city": "Mumbai", "rating": 4.2},
    12: {"id": 12, "name": "Pizza Point",  "city": "Pune",   "rating": 3.9},
    13: {"id": 13, "name": "Green Bowl",   "city": "Mumbai", "rating": 4.2},
    14: {"id": 14, "name": "Momo Magic",   "city": "Pune",   "rating": None},
}
MENUS = {10: {"Masala Dosa": 120, "Idli": 60, "Filter Coffee": 40},
         11: {"Chicken Biryani": 350, "Raita": 50},
         12: {"Margherita": 280, "Garlic Bread": 100}}
ORDERS = {}                             # order_id -&gt; order
SEEN_KEYS = {}                          # Idempotency-Key -&gt; order_id
SESSIONS = {}                           # session_id -&gt; user name
NEXT_ID = [101]</div>
  <div class="fx" data-lang="text">$ flask --app biteful run --port 18158
 * Serving Flask app 'biteful'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:18158
Press CTRL+C to quit</div>
  <p>The function that answers "give me one restaurant" looks up the id taken from the path, and replies with an error and the number 404 if it does not exist:</p>
  <div class="fx" data-lang="py">@app.get("/v1/restaurants/&lt;int:rid&gt;")
def get_restaurant(rid):
    if rid not in RESTAURANTS:
        return {"error": "restaurant not found"}, 404
    return RESTAURANTS[rid]</div>
  <p>Now the interesting part. HTTP messages are plain text, and <code>curl -v</code> ("verbose") prints that text instead of hiding it. In its output, lines starting with <code>&gt;</code> are what the client sent and lines starting with <code>&lt;</code> are what came back. (curl also prints its own notes on lines starting with <code>*</code>; the <code>grep</code> at the end filters those out.)</p>
  <div class="fx" data-lang="text">$ curl -sv http://127.0.0.1:18158/v1/restaurants/10 -H 'Accept: application/json' 2&gt;&amp;1 | grep -v '^\\*'
&gt; GET /v1/restaurants/10 HTTP/1.1
&gt; Host: 127.0.0.1:18158
&gt; User-Agent: curl/8.5.0
&gt; Accept: application/json
&gt; 
&lt; HTTP/1.1 200 OK
&lt; Server: Werkzeug/3.1.9 Python/3.13.18
&lt; Date: Thu, 19 Nov 2026 07:31:06 GMT
&lt; Content-Type: application/json
&lt; Content-Length: 55
&lt; Connection: close
&lt; 
{ [55 bytes data]
{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}</div>
  <p>Read the request first, the five lines starting with <code>&gt;</code>. The first line is the <strong>request line</strong>: the <strong>method</strong> <code>GET</code> (what kind of action: here, "read"), the <strong>path</strong> <code>/v1/restaurants/10</code> (which thing), and the protocol version <code>HTTP/1.1</code>. The next three lines are <strong>headers</strong>, one per line in the form <code>Name: value</code>. They are labels about the request rather than its content: <code>Host</code> says which site is wanted (one computer can host many sites), <code>User-Agent</code> says which program is asking, and <code>Accept: application/json</code>, which we added with <code>-H</code>, says "please reply in JSON". Then comes a line containing nothing, shown as a lone <code>&gt;</code>. That blank line is how HTTP marks the end of the headers. After it would come the request <strong>body</strong>, the actual content being sent, but a GET only asks for something, so this body is empty.</p>
  <p>The response has the same shape. Its first line is the <strong>status line</strong>: version, the <strong>status code</strong> <code>200</code> and a short reason phrase <code>OK</code>, the server's verdict on the request. Then come the response headers: <code>Server</code> names the server software, <code>Date</code> is when it answered, <code>Content-Type: application/json</code> says what format the body is in, and <code>Content-Length: 55</code> says the body is exactly 55 bytes long, so the client knows when it has received all of it. Then the blank line, then the 55-byte body, the restaurant as JSON. (The line <code>{ [55 bytes data]</code> is curl's own note that 55 bytes arrived.)</p>
  <p>A good way to remember the structure is a posted letter. The request line is the instruction written at the top ("please send me restaurant 10"). The headers are what is written on the envelope: who it is for, who it is from, what language the reply should be in. The blank line is the edge of the envelope, and the body is the letter inside. Every HTTP message, request or response, has the same four parts in the same order: a first line, headers, a blank line, and an optional body.</p>
  <p>From Python you rarely use curl; you use the <code>requests</code> library, which sends the same text and hands you the parts of the response as Python values. Here it asks for restaurant 10 and then for restaurant 99, which does not exist:</p>
  <div class="fx" data-lang="py">import requests

r = requests.get("http://127.0.0.1:18158/v1/restaurants/10")
print(r.status_code)                   # did it work?
print(r.headers["Content-Type"])       # what format is the body in?
print(repr(r.text))                    # the raw text that came back
data = r.json()                        # JSON text -&gt; Python dict
print(data["name"], data["rating"])

r2 = requests.get("http://127.0.0.1:18158/v1/restaurants/99")
print(r2.status_code, r2.json())</div>
  <div class="fx" data-lang="text">200
application/json
'{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}\\n'
Dosa Hut 4.5
404 {'error': 'restaurant not found'}</div>
  <p><code>r.status_code</code> is the 200 from the status line, <code>r.headers</code> gives the response headers, and <code>r.text</code> is the raw body exactly as it travelled: a string of characters, with a newline at the end that Flask adds. Only when we call <code>r.json()</code> is that text turned into a Python dict we can index with <code>data["name"]</code>. For restaurant 99 the server answered with status 404 and a small JSON body explaining the problem. A client program should decide what to do from the 404, not by reading the English words in the body; the status code is the part designed for programs.</p>
  <p>On a laptop the client and server are on one machine, so the trip is short. When Asha's phone calls <code>https://api.biteful.in/v1/restaurants/10</code>, a few more steps happen before and after. The phone first asks DNS for the IP address of <code>api.biteful.in</code>. It then opens a TCP connection to that address on port 443. Because the scheme is <code>https</code>, the two sides then set up encryption using <strong>TLS</strong> (Transport Layer Security), so nobody between them can read or change the messages; this is covered in <a class="xref" data-note="api_auth">Authentication &amp; Security</a>. The request usually reaches a <strong>load balancer</strong> first, a front-door program that passes each request to one of several identical copies of the server (<a class="xref" data-note="api_production">Production Backend</a>). The chosen copy reads the request line, picks the Python function for that method and path, runs it (perhaps querying the database), turns the result into JSON text and sends the response back along the same path. Underneath all of it, though, the request and response are exactly the plain text we just saw. Every web framework, Flask, FastAPI or Django, is a machine for reading that text and writing a reply.</p>

  <h2 id="af-methods"><span class="num">04</span>HTTP Methods and Idempotency</h2>
  <p>Every request so far began with GET, which only reads. But Asha needs to <em>create</em> an order, a Dosa Hut staff member later needs to <em>change</em> its status to delivered, and a restaurant owner may need to replace a whole menu. The path alone cannot say which of these is wanted: <code>/v1/orders</code> could mean "show me the orders" or "add an order". The first word of the request line, the <strong>method</strong> (often called the verb), carries that meaning. It tells the server what kind of action to perform on the thing named by the path.</p>
  <p>Think of the register a librarian keeps. For any book you can look up its entry, add a new entry, rewrite an entry completely, correct one detail in it, or strike it out. HTTP has a method for each of these: <strong>GET</strong> reads, <strong>POST</strong> creates something new (or, more generally, asks the server to carry out an action), <strong>PUT</strong> replaces the whole thing at a URL with what you send, <strong>PATCH</strong> changes only the fields you send, and <strong>DELETE</strong> removes it. There are a few others you will meet less often: <strong>HEAD</strong> is a GET that returns only the headers, and <strong>OPTIONS</strong> asks which methods a URL supports.</p>
  <p>Methods differ in one property that matters enormously in practice, and to see why, we need to talk about failure. Networks are unreliable. Asha taps "Place order" on a weak 4G signal; the request reaches Biteful and the order is created, but the response is lost in a tunnel. From the app's point of view the request simply timed out, and it cannot tell whether the order was made. The natural thing is to send it again, which is called a <strong>retry</strong>, and apps, browsers and load balancers all retry automatically. Whether a retry is harmless depends on the method. A method is <strong>idempotent</strong> if sending the same request once or many times leaves the server in the same final state. "Set order 101's status to delivered" is idempotent: after the first one it is delivered, and the second changes nothing. "Create a new order" is not: each one creates another order. A method is <strong>safe</strong> if it does not change the server's state at all; GET is safe, because reading a restaurant changes nothing. Every safe method is also idempotent, but not the other way round: DELETE changes state, yet deleting the same thing twice leaves it just as deleted.</p>
  <p>A lift button is a good picture of idempotency: pressing "3" five times still takes you to floor 3 once. A "Place order" button is the opposite: five presses, five orders. Before touching the server, here is the difference as a tiny simulation. The app retries three times, and each attempt sends one PATCH (set order 101 to delivered) and one POST (create an order):</p>
  <div class="fx" data-lang="py"># The server's state: order 101, and a list of all orders
orders = [{"order_id": 101, "status": "placed"}]

def patch_status(new_status):        # PATCH /v1/orders/101  "set the status to this"
    orders[0]["status"] = new_status

def post_order():                    # POST /v1/orders  "create a new order"
    orders.append({"order_id": 101 + len(orders), "status": "placed"})

for attempt in range(3):             # a flaky network: the app sends everything 3 times
    patch_status("delivered")
    post_order()

print("status after 3 PATCHes:", orders[0]["status"])
print("orders after 3 POSTs  :", [o["order_id"] for o in orders])</div>
  <div class="fx" data-lang="text">status after 3 PATCHes: delivered
orders after 3 POSTs  : [101, 102, 103, 104]</div>
  <p>After three PATCHes the status is "delivered", exactly as after one. After three POSTs there are three new orders, 102 to 104, where Asha wanted none extra. Now let us see the same thing on the real server. This is the function that handles <code>POST /v1/orders</code>. It reads the JSON body, checks the restaurant and the items (the error returns are section 05's subject), computes the total, stores the order under the next id, and replies with the code 201 and a <code>Location</code> header saying where the new order lives. The first few lines, about an <code>Idempotency-Key</code>, we will come back to in a moment:</p>
  <div class="fx" data-lang="py">@app.post("/v1/orders")
def create_order():
    key = request.headers.get("Idempotency-Key")
    if key and key in SEEN_KEYS:                # a retry of an order we already made
        return ORDERS[SEEN_KEYS[key]], 200
    body = request.get_json(silent=True)        # None if the body is not JSON
    if body is None:
        return {"error": "body must be valid JSON"}, 400
    rid, items = body.get("restaurant_id"), body.get("items")
    if rid not in MENUS or not isinstance(items, list) or not items:
        return {"error": "need restaurant_id with a menu and a non-empty items list"}, 422
    total = 0
    for it in items:
        price = MENUS[rid].get(it.get("name"))
        if price is None or not isinstance(it.get("qty"), int) or it["qty"] &lt; 1:
            return {"error": f"bad item: {it}"}, 422
        total += price * it["qty"]
    oid = NEXT_ID[0]; NEXT_ID[0] += 1
    ORDERS[oid] = {"order_id": oid, "restaurant_id": rid, "items": items,
                   "total": total, "status": "placed"}
    if key:
        SEEN_KEYS[key] = oid
    return ORDERS[oid], 201, {"Location": f"/v1/orders/{oid}"}</div>
  <p>We send the identical POST twice, the way a retry would. The first time we use <code>-i</code> so curl also prints the status line and headers. <code>-X POST</code> sets the method, <code>-H</code> adds a header saying the body is JSON, and <code>-d</code> supplies the body:</p>
  <div class="fx" data-lang="text">$ curl -si -X POST http://127.0.0.1:18158/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]}'
HTTP/1.1 201 CREATED
Server: Werkzeug/3.1.9 Python/3.13.18
Date: Thu, 19 Nov 2026 07:31:06 GMT
Content-Type: application/json
Content-Length: 107
Location: /v1/orders/101
Connection: close

{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"placed"}

$ curl -s -X POST http://127.0.0.1:18158/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]}'
{"order_id":102,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"placed"}</div>
  <p>The first response is <code>201 CREATED</code> with <code>Location: /v1/orders/101</code> and order 101 in the body: 2 Masala Dosas at ₹120, total 240. The second, identical request created order 102. If the first reply had been lost and the app had retried, Asha would now be charged ₹480 for ₹240 of food. Here is the PATCH handler for comparison; it looks the order up and sets its status to whatever the body says:</p>
  <div class="fx" data-lang="py">@app.patch("/v1/orders/&lt;int:oid&gt;")
def update_order(oid):
    if oid not in ORDERS:
        return {"error": "order not found"}, 404
    new = (request.get_json(silent=True) or {}).get("status")
    if ORDERS[oid]["status"] == "delivered" and new == "cancelled":
        return {"error": "a delivered order cannot be cancelled"}, 409
    ORDERS[oid]["status"] = new
    return ORDERS[oid]</div>
  <div class="fx" data-lang="text">$ curl -s -X PATCH http://127.0.0.1:18158/v1/orders/101 -H 'Content-Type: application/json' -d '{"status": "delivered"}'
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"delivered"}

$ curl -s -X PATCH http://127.0.0.1:18158/v1/orders/101 -H 'Content-Type: application/json' -d '{"status": "delivered"}'
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"delivered"}</div>
  <p>The two PATCH responses are identical, and so is the server's state after each: order 101 is delivered. Sending it twice did no harm. That is the practical meaning of idempotency: idempotent requests can be retried freely, non-idempotent ones cannot.</p>
  <p>So how do we make "Place order" safe to retry? The standard answer is an <strong>idempotency key</strong>. When Asha (or here, Ben) taps the button, the app makes up one random id for that tap and sends it in an <code>Idempotency-Key</code> header, and every retry of the same tap sends the same key. The server remembers which keys it has already handled. That is the <code>SEEN_KEYS</code> dict at the top of <code>create_order</code>: if the key has been seen, the server returns the order it already made instead of creating another. Ben orders a Chicken Biryani, and we send the request twice with the same key. <code>-w ' [%{http_code}]\\n'</code> tells curl to print the status code after the body:</p>
  <div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}]\\n' -X POST http://127.0.0.1:18158/v1/orders -H 'Idempotency-Key: ben-7f3a' -H 'Content-Type: application/json' -d '{"restaurant_id": 11, "items": [{"name": "Chicken Biryani", "qty": 1}]}'
{"order_id":103,"restaurant_id":11,"items":[{"name":"Chicken Biryani","qty":1}],"total":350,"status":"placed"}
 [201]

$ curl -s -w ' [%{http_code}]\\n' -X POST http://127.0.0.1:18158/v1/orders -H 'Idempotency-Key: ben-7f3a' -H 'Content-Type: application/json' -d '{"restaurant_id": 11, "items": [{"name": "Chicken Biryani", "qty": 1}]}'
{"order_id":103,"restaurant_id":11,"items":[{"name":"Chicken Biryani","qty":1}],"total":350,"status":"placed"}
 [200]</div>
  <p>Both replies describe the same order, 103. The first was <code>201</code>, because an order was created; the repeat was <code>200</code>, because nothing new was created and the server simply returned the earlier result. However many times the app retries, Ben's biryani is ordered once. Payment providers such as Stripe use exactly this design. In a real system the keys are stored in a shared database or Redis rather than a Python dict, so that every server copy can see them (section 10 explains why that matters).</p>
  <p>PUT is idempotent for a different reason: it does not add or adjust, it replaces. Whatever you send becomes the new state, so sending it again produces the same state. That also means PUT replaces <em>everything</em>, so any field you leave out is gone. The handler below replaces Pizza Point's whole menu with the body:</p>
  <div class="fx" data-lang="py">@app.put("/v1/restaurants/&lt;int:rid&gt;/menu")
def replace_menu(rid):
    if rid not in RESTAURANTS:
        return {"error": "restaurant not found"}, 404
    new_menu = request.get_json(silent=True)
    if not isinstance(new_menu, dict):
        return {"error": "body must be a JSON object of item: price"}, 400
    MENUS[rid] = new_menu                       # the WHOLE menu is replaced
    return MENUS[rid]</div>
  <div class="fx" data-lang="text">$ curl -s http://127.0.0.1:18158/v1/restaurants/12/menu
{"Margherita": 280, "Garlic Bread": 100}

$ curl -s -X PUT http://127.0.0.1:18158/v1/restaurants/12/menu -H 'Content-Type: application/json' -d '{"Margherita": 300, "Garlic Bread": 100}'
{"Margherita":300,"Garlic Bread":100}

$ curl -s -X PUT http://127.0.0.1:18158/v1/restaurants/12/menu -H 'Content-Type: application/json' -d '{"Margherita": 300, "Garlic Bread": 100}'
{"Margherita":300,"Garlic Bread":100}

$ curl -s -X PUT http://127.0.0.1:18158/v1/restaurants/12/menu -H 'Content-Type: application/json' -d '{"Margherita": 300}'
{"Margherita":300}</div>
  <p>The menu started with a Margherita at 280 and Garlic Bread. Sending the same PUT twice, with the Margherita at 300, gave the same menu both times: idempotent. The last request sent only <code>{"Margherita": 300}</code>, perhaps intending to change only the price, and the Garlic Bread disappeared, because PUT means "this is the complete new menu". Changing one field without restating the others is precisely what PATCH is for. This is the classic "PUT vs PATCH" interview question in one example.</p>
  <p>Finally, DELETE. Order 102 was Asha's accidental duplicate, so we delete it, twice:</p>
  <div class="fx" data-lang="py">@app.delete("/v1/orders/&lt;int:oid&gt;")
def delete_order(oid):
    if oid not in ORDERS:
        return {"error": "order not found"}, 404
    del ORDERS[oid]
    return "", 204</div>
  <div class="fx" data-lang="text">$ curl -s -o /dev/null -w '%{http_code}\\n' -X DELETE http://127.0.0.1:18158/v1/orders/102
204

$ curl -s -w ' [%{http_code}]\\n' -X DELETE http://127.0.0.1:18158/v1/orders/102
{"error":"order not found"}
 [404]</div>
  <p>The first DELETE returned <code>204</code> (success, with no body) and the second returned <code>404</code>, because the order no longer exists. The responses differ, yet DELETE is still idempotent, because idempotency is about the server's <em>state</em>, not about the response: after one DELETE or two, order 102 is gone. One more subtlety: PATCH is idempotent only when it sets values. A PATCH meaning "add one more dosa" would add two if sent twice, which is why the table below marks PATCH as "not guaranteed".</p>
  <table class="tbl">
    <tr><th>Method</th><th>Meaning</th><th>Has a body?</th><th>Safe</th><th>Idempotent</th><th>Biteful example</th></tr>
    <tr><td><code>GET</code></td><td>Read</td><td>No</td><td>Yes</td><td>Yes</td><td><code>GET /v1/restaurants/10</code></td></tr>
    <tr><td><code>POST</code></td><td>Create, or run an action</td><td>Yes</td><td>No</td><td>No</td><td><code>POST /v1/orders</code></td></tr>
    <tr><td><code>PUT</code></td><td>Replace the whole resource</td><td>Yes</td><td>No</td><td>Yes</td><td><code>PUT /v1/restaurants/12/menu</code></td></tr>
    <tr><td><code>PATCH</code></td><td>Change some fields</td><td>Yes</td><td>No</td><td>Not guaranteed</td><td><code>PATCH /v1/orders/101</code></td></tr>
    <tr><td><code>DELETE</code></td><td>Remove</td><td>Usually no</td><td>No</td><td>Yes</td><td><code>DELETE /v1/orders/102</code></td></tr>
  </table>

  <h2 id="af-status"><span class="num">05</span>Status Codes</h2>
  <p>We have already seen 200, 201, 204 and 404, and it is time to understand them properly. When Asha's app sends <code>POST /v1/orders</code>, many different things can happen. The order may be created. The body may have been cut off by the network so it is not even valid JSON. She may have asked for zero dosas. She may be trying to cancel an order that was already delivered. Or the server may have crashed. The app must react differently to each: show the order, show an error and let her fix the input, or wait and try again. And it must decide by itself, without a human reading an English message.</p>
  <p>That is the job of the <strong>status code</strong>, the three-digit number in the response's first line: it is the server's verdict on the request, in a form programs can act on. The good news is that you only need to remember what the first digit means; the other two add detail. Codes starting with <strong>2</strong> mean success: it worked. Codes starting with <strong>3</strong> mean redirection: look somewhere else, or "the copy you already have is still good". Codes starting with <strong>4</strong> mean a client error: you sent something wrong, and sending the same thing again will fail again. Codes starting with <strong>5</strong> mean a server error: the server failed, it is not your fault, and trying again later may work. (Codes starting with 1 exist too, for rare informational messages.)</p>
  <p>Think of a railway enquiry counter. "Here is your ticket" is a 2xx. "Go to counter 5" is a 3xx. "You filled in the form wrongly" is a 4xx: there is no point handing over the same form again; fix it first. "Our printer is broken" is a 5xx: the problem is theirs, so coming back in ten minutes might work. That last distinction is the most useful one in practice: clients should retry 5xx errors (after waiting) and should not blindly retry 4xx errors.</p>
  <p>Here is our server producing several different verdicts. Each request is a real one against <code>biteful.py</code>; the codes come from the functions shown in the previous section and from Flask itself:</p>
  <div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}]\\n' http://127.0.0.1:18158/v1/restaurants/99
{"error":"restaurant not found"}
 [404]

$ curl -s -o /dev/null -w '%{http_code}\\n' -X DELETE http://127.0.0.1:18158/v1/restaurants/10
405

$ curl -s -w ' [%{http_code}]\\n' -X POST http://127.0.0.1:18158/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name":'
{"error":"body must be valid JSON"}
 [400]

$ curl -s -w ' [%{http_code}]\\n' -X POST http://127.0.0.1:18158/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 0}]}'
{"error":"bad item: {'name': 'Masala Dosa', 'qty': 0}"}
 [422]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH http://127.0.0.1:18158/v1/orders/101 -H 'Content-Type: application/json' -d '{"status": "cancelled"}'
{"error":"a delivered order cannot be cancelled"}
 [409]</div>
  <p>Each code was chosen for a reason, and the differences between them are what interviewers ask about. Restaurant 99 does not exist, so the answer is <code>404 Not Found</code>. <code>DELETE /v1/restaurants/10</code> got <code>405 Method Not Allowed</code>: the URL exists, but no function handles DELETE on it, and Flask answered that on its own. The cut-off body <code>{"restaurant_id": 10, "items": [{"name":</code> got <code>400 Bad Request</code> from <code>create_order</code>, because it cannot even be parsed as JSON. The order for 0 dosas got <code>422 Unprocessable Content</code>: the JSON is perfectly readable, but its values break the rules. The distinction between 400 ("I can't read this") and 422 ("I can read it, but it's not acceptable") matters because FastAPI uses 422 for every validation failure. Finally, trying to cancel order 101, which was delivered in the previous section, got <code>409 Conflict</code> from <code>update_order</code>: the request is valid in itself but clashes with the order's current state.</p>
  <p>Two codes we cannot demonstrate yet, because Biteful has no logins, are the most frequently confused pair in interviews. <code>401 Unauthorized</code> really means <em>unauthenticated</em>: the server does not know who you are, because you sent no credentials or invalid ones, and logging in might fix it. <code>403 Forbidden</code> means the server knows exactly who you are and you are still not allowed: if Ben, a customer, tries to mark a Dosa Hut order as delivered, logging in again will not help. The <a class="xref" data-note="api_auth">Authentication &amp; Security</a> note builds both. The 5xx family appears when something breaks on the server side: <code>500 Internal Server Error</code> means an unhandled exception in your code (section 07 produces one), while <code>502</code>, <code>503</code> and <code>504</code> usually come from a load balancer that could not get a healthy, timely answer from the server behind it. The codes worth knowing by heart are these:</p>
  <table class="tbl">
    <tr><th>Code</th><th>Name</th><th>When to use it</th></tr>
    <tr><td>200</td><td>OK</td><td>Successful GET, PUT or PATCH, with a body</td></tr>
    <tr><td>201</td><td>Created</td><td>POST created something; add a <code>Location</code> header pointing to it</td></tr>
    <tr><td>202</td><td>Accepted</td><td>The work was queued to happen later (e.g. sending a receipt email); return a job id</td></tr>
    <tr><td>204</td><td>No Content</td><td>Success with nothing to return, often DELETE</td></tr>
    <tr><td>301 / 302</td><td>Moved Permanently / Found</td><td>The resource lives at another URL, given in <code>Location</code></td></tr>
    <tr><td>304</td><td>Not Modified</td><td>Your saved copy is still current (section 06)</td></tr>
    <tr><td>400</td><td>Bad Request</td><td>The request cannot be read, e.g. broken JSON</td></tr>
    <tr><td>401</td><td>Unauthorized</td><td>Not authenticated: missing or invalid credentials</td></tr>
    <tr><td>403</td><td>Forbidden</td><td>Authenticated, but not allowed to do this</td></tr>
    <tr><td>404</td><td>Not Found</td><td>No such resource</td></tr>
    <tr><td>405</td><td>Method Not Allowed</td><td>Right URL, wrong method</td></tr>
    <tr><td>409</td><td>Conflict</td><td>Clashes with the current state, or a duplicate</td></tr>
    <tr><td>422</td><td>Unprocessable Content</td><td>Readable body, invalid values</td></tr>
    <tr><td>429</td><td>Too Many Requests</td><td>Rate limit hit; say when to retry with <code>Retry-After</code></td></tr>
    <tr><td>500</td><td>Internal Server Error</td><td>An unhandled bug in the server</td></tr>
    <tr><td>502 / 503 / 504</td><td>Bad Gateway / Service Unavailable / Gateway Timeout</td><td>A proxy could not get a good, timely answer from the server behind it</td></tr>
  </table>
  <p>Notice that several of these codes are not complete on their own. A 201 should say <em>where</em> the new thing lives, a 429 should say <em>when</em> to come back, and a 304 only makes sense if the client said which copy it already has. A number has no room for that information. It goes into the headers, which are the subject of the next section.</p>

  <h2 id="af-headers"><span class="num">06</span>Headers and Cookies</h2>
  <p>We met headers in section 03 as the <code>Name: value</code> lines between the first line and the blank line. Now let us look at what they are for. A courier parcel has the item inside and a label outside: address, weight, "fragile", "keep upright". The courier handles the parcel by reading the label and never opens the box. HTTP <strong>headers</strong> are that label. They carry information <em>about</em> the message, often called <strong>metadata</strong>, rather than the content itself, which is called the <strong>body</strong> or <strong>payload</strong>. Clients, servers, and every program in between, such as load balancers and caches, read the headers to decide how to handle the message. Header names are case-insensitive, so <code>content-type</code> and <code>Content-Type</code> are the same header; FastAPI and HTTP/2 print them in lower case.</p>
  <p>There are dozens of standard headers, but a handful do most of the work. <code>Content-Type</code> says what format the body is in; it appears on any message with a body, so the server knows to parse JSON and the client knows how to display the reply. <code>Accept</code> is the client saying what format it wants back. <code>Authorization</code> carries credentials, typically <code>Authorization: Bearer &lt;token&gt;</code>, which the auth note explains. <code>Location</code>, as we saw with the 201, says where a new resource lives. <code>Retry-After</code> tells the client how many seconds to wait after a 429 or 503. <code>Idempotency-Key</code> we built in section 04. Teams also invent their own, such as <code>X-Request-ID</code>, an id that follows one request through every log line so you can trace it (used in the <a class="xref" data-note="api_flask">Flask</a> note). Two headers deserve a demonstration, because together they save real bandwidth: <code>ETag</code> and <code>If-None-Match</code>.</p>
  <p>Dosa Hut's menu barely ever changes, yet every time Asha opens the restaurant, the app downloads it again. With photos, that could be hundreds of kilobytes on a mobile data plan, every time. An <strong>ETag</strong> (entity tag) fixes this. It is a short version label that the server attaches to a response, usually a fingerprint computed from the content, so it changes whenever the content changes. Think of the edition number printed on a newspaper. The app saves the menu together with its ETag, and next time it asks with an <code>If-None-Match</code> header that means "I already have this edition; send it only if yours is different". If nothing changed, the server replies <code>304 Not Modified</code> with no body at all, and the app uses its saved copy. A request like this, whose answer depends on what the client already has, is called a <strong>conditional request</strong>. Here is the menu handler; it fingerprints the menu text with SHA-256 (a function that turns any text into a fixed-length code that changes completely if the text changes by even one character) and keeps the first 8 characters as the ETag:</p>
  <div class="fx" data-lang="py">@app.get("/v1/restaurants/&lt;int:rid&gt;/menu")
def get_menu(rid):
    if rid not in MENUS:
        return {"error": "menu not found"}, 404
    body = json.dumps(MENUS[rid])
    etag = '"' + hashlib.sha256(body.encode()).hexdigest()[:8] + '"'
    if request.headers.get("If-None-Match") == etag:
        return "", 304, {"ETag": etag}          # you already have this version
    resp = make_response(body, 200, {"Content-Type": "application/json"})
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "max-age=60"
    return resp</div>
  <p>The first request has no <code>If-None-Match</code>, so it gets the full menu and the tag. The second sends that tag back:</p>
  <div class="fx" data-lang="text">$ curl -si http://127.0.0.1:18158/v1/restaurants/10/menu
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.13.18
Date: Thu, 19 Nov 2026 07:31:07 GMT
Content-Type: application/json
Content-Length: 53
ETag: "7e71016a"
Cache-Control: max-age=60
Connection: close

{"Masala Dosa": 120, "Idli": 60, "Filter Coffee": 40}

$ curl -si http://127.0.0.1:18158/v1/restaurants/10/menu -H 'If-None-Match: "7e71016a"'
HTTP/1.1 304 NOT MODIFIED
Server: Werkzeug/3.1.9 Python/3.13.18
Date: Thu, 19 Nov 2026 07:31:07 GMT
ETag: "7e71016a"
Connection: close</div>
  <p>The first reply is a normal 200 with the 53-byte menu, plus two caching headers. <code>ETag: "7e71016a"</code> is the fingerprint. <code>Cache-Control: max-age=60</code> goes further and tells the client it may reuse this answer for 60 seconds without asking at all. The second request sent <code>If-None-Match: "7e71016a"</code>, the tag matched, and the reply is <code>304 NOT MODIFIED</code> with no <code>Content-Type</code>, no <code>Content-Length</code> and no body. If Dosa Hut changes a price, the fingerprint changes, the tags no longer match, and the full menu comes back with the new tag. Browsers do this automatically; in your own clients you store the tag and send it yourself.</p>
  <p>The last header topic is cookies, which solve a puzzle you may already have noticed: each HTTP request is independent, and the server does not recognise you from one request to the next. So how does a website keep you logged in as you click from page to page? The answer is that the server gives the browser a small piece of text in a <code>Set-Cookie</code> response header, and the browser stores it and automatically sends it back in a <code>Cookie</code> header on every later request to that site. That piece of text is a <strong>cookie</strong>. Think of a cloakroom ticket: the attendant hands it over once, you show it whenever you come back, and the attendant uses the number on it to find your coat. Biteful's login handler stores a random session id in a <code>SESSIONS</code> dict and sends the id as a cookie; the <code>/v1/me</code> handler reads the cookie back and looks up who you are:</p>
  <div class="fx" data-lang="py">@app.post("/v1/login")
def login():
    sid = secrets.token_hex(8)
    SESSIONS[sid] = "asha"
    resp = make_response({"user": "asha"})
    resp.set_cookie("session_id", sid, httponly=True, secure=True, samesite="Lax")
    return resp

@app.get("/v1/me")
def me():
    user = SESSIONS.get(request.cookies.get("session_id", ""))
    if user is None:
        return {"error": "not logged in"}, 401
    return {"user": user}</div>
  <p>curl does not keep cookies unless asked, so we tell it to save them to a file with <code>-c</code> and send them back from that file with <code>-b</code>, which is what a browser does automatically. The last request sends no cookie:</p>
  <div class="fx" data-lang="text">$ curl -si -X POST http://127.0.0.1:18158/v1/login -c cookies.txt
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.13.18
Date: Thu, 19 Nov 2026 07:31:07 GMT
Content-Type: application/json
Content-Length: 16
Set-Cookie: session_id=846b7497d641e3db; Secure; HttpOnly; Path=/; SameSite=Lax
Connection: close

{"user":"asha"}

$ curl -s -b cookies.txt http://127.0.0.1:18158/v1/me
{"user":"asha"}

$ curl -s -w ' [%{http_code}]\\n' http://127.0.0.1:18158/v1/me
{"error":"not logged in"}
 [401]</div>
  <p>The login reply carried <code>Set-Cookie: session_id=...</code>. The next request presented that cookie, and the server recognised Asha. The request without a cookie got <code>401</code>, because as far as the server is concerned it came from a stranger. The words after the value are security flags, and every session cookie should have all three. <code>HttpOnly</code> means JavaScript running in the page cannot read the cookie, which stops an attacker who manages to inject a script into the page (an attack called <strong>XSS</strong>, cross-site scripting) from stealing it. <code>Secure</code> means the browser sends it only over encrypted HTTPS connections. <code>SameSite=Lax</code> means the browser will not attach it to most requests that another website triggers, which blocks most <strong>CSRF</strong> (cross-site request forgery) attacks, where a malicious site makes your browser perform actions on a site you are logged in to. Notice also where the session lives: in a dict inside this one server process. That works on a laptop, and section 10 shows exactly how it fails once there are several server copies.</p>

  <h2 id="af-json"><span class="num">07</span>JSON Serialization</h2>
  <p>Every body we have seen so far was JSON text, but on the server, order 101 is a Python dict in memory, and on Asha's phone it needs to become an object in whatever language the app is written in, Kotlin, Swift or JavaScript. The network can carry only bytes. So both sides need an agreed text format for data that any language can read and write. Almost every web API uses <strong>JSON</strong> (JavaScript Object Notation), which looks almost exactly like a Python dict written out.</p>
  <p>Converting an in-memory object into text (or bytes) that can be sent or stored is called <strong>serialization</strong>; converting the text back into an object is <strong>deserialization</strong>. A good picture is sending a cupboard by train: you take it apart and pack it flat, it travels, and at the other end someone assembles it again. Python's standard library does this with <code>json.dumps</code> ("dump to string"), which turns a Python object into JSON text, and <code>json.loads</code> ("load from string"), which turns JSON text back into Python. Flask has been calling <code>dumps</code> for us every time a handler returned a dict, and <code>request.get_json()</code> called <code>loads</code> on incoming bodies.</p>
  <p>JSON has only six kinds of value: <strong>objects</strong> (like dicts, with string keys), <strong>arrays</strong> (like lists), <strong>strings</strong>, <strong>numbers</strong>, <strong>true/false</strong> and <strong>null</strong>. Every Python value has to be squeezed into one of these, which leads to some surprises. In the code below, order 101 contains <code>True</code>, <code>None</code> and a tuple. Then we try four types that have no JSON equivalent at all, and finally two ways to deal with them:</p>
  <div class="fx" data-lang="py">import json, datetime, decimal
import numpy as np

order = {"order_id": 101, "paid": True, "coupon": None,
         "items": ("Masala Dosa", "Masala Dosa"), "total": 240}
text = json.dumps(order)                 # Python -&gt; JSON text (what travels)
print(type(text).__name__, text)
back = json.loads(text)                  # JSON text -&gt; Python
print(back)
print(back == order)                     # the tuple came back as a list

placed_at = datetime.datetime(2026, 3, 2, 12, 10)
for bad in [placed_at, decimal.Decimal("240.00"), np.int64(38), {"veg", "spicy"}]:
    try:
        json.dumps({"x": bad})
    except TypeError as e:
        print("TypeError:", e)

print(json.dumps({"placed_at": placed_at, "eta_min": np.int64(38)}, default=str))
print(json.dumps({"placed_at": placed_at.isoformat(), "eta_min": int(np.int64(38)),
                  "total": float(decimal.Decimal("240.00"))}))</div>
  <div class="fx" data-lang="text">str {"order_id": 101, "paid": true, "coupon": null, "items": ["Masala Dosa", "Masala Dosa"], "total": 240}
{'order_id': 101, 'paid': True, 'coupon': None, 'items': ['Masala Dosa', 'Masala Dosa'], 'total': 240}
False
TypeError: Object of type datetime is not JSON serializable
TypeError: Object of type Decimal is not JSON serializable
TypeError: Object of type int64 is not JSON serializable
TypeError: Object of type set is not JSON serializable
{"placed_at": "2026-03-02 12:10:00", "eta_min": "38"}
{"placed_at": "2026-03-02T12:10:00", "eta_min": 38, "total": 240.0}</div>
  <p>The first line shows that <code>dumps</code> returns a plain <code>str</code>: this text is what actually travels. <code>True</code> became <code>true</code>, <code>None</code> became <code>null</code>, and the tuple became an array. The second and third lines show the round trip is not perfect: <code>loads</code> turned the array into a <em>list</em>, so the result is not equal to the original dict. JSON cannot tell a tuple from a list, so it always gives back a list.</p>
  <p>The four <code>TypeError</code> lines are the ones that bite real projects. A <code>datetime</code> (when the order was placed), a <code>Decimal</code> (money as databases often return it), a NumPy <code>int64</code> (exactly what a model's <code>predict()</code> returns) and a <code>set</code> all crash <code>dumps</code>, because JSON has no type for them. The tempting quick fix, <code>default=str</code>, tells <code>dumps</code> to call <code>str()</code> on anything it does not understand. It stops the crash, but look at the result: the ETA became the string <code>"38"</code>, not the number 38, so any app doing arithmetic with it breaks, and the date came out in a format with a space that many parsers reject. The right fix is the last line: convert each value deliberately. Dates become ISO-8601 text (<code>2026-03-02T12:10:00</code>, the standard date format every language can parse), NumPy numbers become Python numbers with <code>int()</code> or <code>float()</code> (or <code>.tolist()</code> for arrays), and money is often sent as a whole number of paise or as a string, so that no precision is lost to floating point.</p>
  <p>Inside a server, this crash becomes a 500 error. Here is a Biteful endpoint that returns a delivery estimate as a NumPy integer, the way it would come from a model:</p>
  <div class="fx" data-lang="py">@app.get("/v1/orders/&lt;int:oid&gt;/eta")
def order_eta(oid):
    minutes = np.int64(38)                      # pretend a model predicted this
    return {"order_id": oid, "eta_min": minutes}</div>
  <div class="fx" data-lang="text">$ curl -si http://127.0.0.1:18158/v1/orders/101/eta | head -4
HTTP/1.1 500 INTERNAL SERVER ERROR
Server: Werkzeug/3.1.9 Python/3.13.18
Date: Thu, 19 Nov 2026 07:31:07 GMT
Content-Type: text/html; charset=utf-8</div>
  <p>Flask tried to serialize the dict, hit the <code>int64</code>, and the exception turned into <code>500 INTERNAL SERVER ERROR</code> with an HTML error page instead of JSON. The server's own log showed the real cause: <code>TypeError: Object of type int64 is not JSON serializable</code>. Wrapping the value as <code>int(minutes)</code> fixes it. This is one of the most common bugs when data scientists first put a model behind an API. (FastAPI, covered in the <a class="xref" data-note="api_fastapi">FastAPI</a> note, handles more types automatically through Pydantic, but NumPy values still need converting.)</p>

  <h2 id="af-rest"><span class="num">08</span>REST Resources and URL Design</h2>
  <p>HTTP gives us methods, paths, codes and headers, but it says nothing about how to name the paths. Left alone, one developer writes <code>/getAllRestaurants</code>, another <code>/fetch_menu?r=10</code>, a third <code>/orders/create</code>, and a fourth uses POST for everything. Each client then needs a separate manual for each endpoint, and general-purpose tools such as caches cannot guess anything about the API. A shared style solves this, and the style almost every web API follows is REST.</p>
  <p><strong>REST</strong> (Representational State Transfer) is a set of design rules for web APIs, first described by Roy Fielding in 2000. Its central idea is simple: URLs name <em>things</em>, and the HTTP method says what to do with them. The things are called <strong>resources</strong>: a restaurant, a menu, an order. Each resource has its own URL, such as <code>/v1/restaurants/10</code>, and a <strong>collection</strong> is a resource that lists members of one kind, such as <code>/v1/restaurants</code>. The URL is a noun and the method is the verb, so you never need a verb in the URL. (The "representation" in the name is the JSON you get back: not the restaurant itself, which lives in a database, but a representation of it.) An API that follows these rules is called <strong>RESTful</strong>.</p>
  <p>Picture a school office with labelled cupboards: "Students", "Teachers", "Fees". There is no cupboard called "GetStudentMarks". You go to "Students", take out file 42, and then read it, update it or remove it. The cupboard and the file number say <em>what</em>; what you do with the file is a separate choice. Here is how Biteful's URLs look in that style, next to the function-call style it replaces. That style is called <strong>RPC</strong> (remote procedure call), because each URL is named like a function to call.</p>
  <table class="tbl">
    <tr><th>Action</th><th>RESTful</th><th>RPC-style (avoid)</th></tr>
    <tr><td>List restaurants</td><td><code>GET /v1/restaurants</code></td><td><code>GET /getAllRestaurants</code></td></tr>
    <tr><td>Restaurants in Pune</td><td><code>GET /v1/restaurants?city=Pune</code></td><td><code>GET /restaurantsInPune</code></td></tr>
    <tr><td>One restaurant</td><td><code>GET /v1/restaurants/10</code></td><td><code>POST /fetchRestaurant</code> with <code>{"id": 10}</code></td></tr>
    <tr><td>A restaurant's menu</td><td><code>GET /v1/restaurants/10/menu</code></td><td><code>GET /getMenu?rid=10</code></td></tr>
    <tr><td>Place an order</td><td><code>POST /v1/orders</code></td><td><code>POST /createOrder</code></td></tr>
    <tr><td>Mark an order delivered</td><td><code>PATCH /v1/orders/101</code></td><td><code>GET /deliverOrder?id=101</code></td></tr>
  </table>
  <p>A few conventions follow from the idea. Collections use plural nouns (<code>/restaurants</code>, <code>/orders</code>), and one member is the collection plus its id (<code>/restaurants/10</code>). Nesting expresses "belongs to" (<code>/restaurants/10/menu</code> is Dosa Hut's menu), but more than two levels deep becomes hard to use. Filtering, sorting and paging are options on a collection, so they go in the query string (<code>?city=Pune</code>) rather than in new paths. Beyond naming, REST also asks for a <strong>uniform interface</strong> (the same methods and status codes mean the same thing everywhere), <strong>cacheable</strong> responses (each response says whether it may be reused, as the menu's ETag and Cache-Control did), and <strong>statelessness</strong>, which has its own section. Purity has limits, though. Some operations really are actions, not changes to a field: cancelling an order may also trigger a refund, and asking a model for a delivery estimate creates nothing. A <code>POST /v1/orders/101/cancel</code> or <code>POST /v1/eta</code> is a perfectly acceptable, common compromise.</p>
  <p>Collections raise a practical problem. Five restaurants fit in one response, but Biteful's order history will one day hold millions of rows, and returning them all at once would take seconds, use huge amounts of memory and send megabytes to a phone that shows twenty at a time. The answer is <strong>pagination</strong>: return one page of results plus a pointer the client can use to ask for the next page. Biteful uses a <strong>cursor</strong>, which means the pointer is the position of the last item the client saw: "give me up to <code>limit</code> restaurants whose id is after <code>after</code>". The list handler also supports a <code>city</code> filter:</p>
  <div class="fx" data-lang="py">@app.get("/v1/restaurants")
def list_restaurants():
    items = list(RESTAURANTS.values())
    city = request.args.get("city")
    if city:
        items = [r for r in items if r["city"] == city]
    limit = request.args.get("limit", default=20, type=int)
    after = request.args.get("after", default=0, type=int)   # cursor: last id seen
    page = [r for r in items if r["id"] &gt; after][:limit]
    nxt = page[-1]["id"] if len(page) == limit else None
    return {"items": page, "next_after": nxt}</div>
  <div class="fx" data-lang="text">$ curl -s 'http://127.0.0.1:18158/v1/restaurants?limit=2'
{"items":[{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5},{"id":11,"name":"Biryani Bros","city":"Mumbai","rating":4.2}],"next_after":11}

$ curl -s 'http://127.0.0.1:18158/v1/restaurants?limit=2&amp;after=11'
{"items":[{"id":12,"name":"Pizza Point","city":"Pune","rating":3.9},{"id":13,"name":"Green Bowl","city":"Mumbai","rating":4.2}],"next_after":13}

$ curl -s 'http://127.0.0.1:18158/v1/restaurants?limit=2&amp;after=13'
{"items":[{"id":14,"name":"Momo Magic","city":"Pune","rating":null}],"next_after":null}

$ curl -s 'http://127.0.0.1:18158/v1/restaurants?city=Pune'
{"items":[{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5},{"id":12,"name":"Pizza Point","city":"Pune","rating":3.9},{"id":14,"name":"Momo Magic","city":"Pune","rating":null}],"next_after":null}</div>
  <p>Follow the pages. <code>limit=2</code> returned restaurants 10 and 11 and <code>"next_after": 11</code>. The app then asked for <code>after=11</code> and got 12 and 13, then <code>after=13</code>, which returned only Momo Magic and <code>"next_after": null</code>, the signal that there are no more pages. The last request used the same endpoint with a filter instead and got the three Pune restaurants. Momo Magic's rating appears as <code>null</code>, the JSON form of Python's <code>None</code>.</p>
  <p>The other common style is <strong>offset</strong> pagination: "skip the first N items and give me the next <code>limit</code>", as in <code>?limit=20&amp;offset=40</code>. It is simpler and lets you jump straight to page 7, but it has two weaknesses. The first is speed: a database answering <code>OFFSET 4000000</code> has to walk past four million rows and throw them away, while a cursor becomes <code>WHERE id &gt; 1840 ORDER BY id LIMIT 20</code>, which an index can answer immediately. The second is correctness when data changes while someone is scrolling. Here Ben scrolls his order feed, newest first, three per page, and a new order arrives between his two page requests:</p>
  <div class="fx" data-lang="py">feed = [f"order{i}" for i in range(110, 103, -1)]     # Ben's orders, newest first: 110 ... 104

def page_offset(offset, limit=3):                      # ?limit=3&amp;offset=...
    return feed[offset:offset + limit]

print("offset page 1:", page_offset(0))
feed.insert(0, "order111")                             # a new order arrives while Ben scrolls
print("offset page 2:", page_offset(3))

feed = [f"order{i}" for i in range(110, 103, -1)]
def page_cursor(after=None, limit=3):                  # ?limit=3&amp;after=...
    start = feed.index(after) + 1 if after else 0
    return feed[start:start + limit]

p1 = page_cursor()
print("cursor page 1:", p1)
feed.insert(0, "order111")
print("cursor page 2:", page_cursor(after=p1[-1]))</div>
  <div class="fx" data-lang="text">offset page 1: ['order110', 'order109', 'order108']
offset page 2: ['order108', 'order107', 'order106']
cursor page 1: ['order110', 'order109', 'order108']
cursor page 2: ['order107', 'order106', 'order105']</div>
  <p>With offset paging, the new <code>order111</code> pushed every item down one position, so the second page, "skip 3", began with <code>order108</code>, which Ben had already seen. (Had an item been deleted instead, one would have been skipped.) The cursor version asked for "the items after <code>order108</code>", which is still correct after the insert, so nothing was repeated. That is why infinite feeds and large exports use cursors, while offset paging is fine for small, rarely changing lists where users want page numbers.</p>
  <table class="tbl">
    <tr><th></th><th>Offset / limit</th><th>Cursor (keyset)</th></tr>
    <tr><td>Request</td><td><code>?limit=20&amp;offset=40</code></td><td><code>?limit=20&amp;after=1840</code></td></tr>
    <tr><td>Database query</td><td><code>OFFSET 40 LIMIT 20</code>: reads and skips 40 rows</td><td><code>WHERE id &gt; 1840 ORDER BY id LIMIT 20</code>: index lookup</td></tr>
    <tr><td>Deep pages</td><td>Slow</td><td>Fast</td></tr>
    <tr><td>Rows added or removed meanwhile</td><td>Duplicates or skips</td><td>Stable</td></tr>
    <tr><td>Jump to page 7</td><td>Yes</td><td>No</td></tr>
  </table>

  <h2 id="af-version"><span class="num">09</span>Versioning</h2>
  <p>Once an API is in use, its URLs and response shapes are a promise. Suppose a million phones run a Biteful app that reads <code>"rating": 4.5</code> from <code>/restaurants/10</code> and draws a bar of width <code>rating * 20</code>. Now the product team wants the rating as an object, <code>{"stars": 4.5, "out_of": 5}</code>, so that a ten-point scale can be added later. If the server simply changes the field, every old app tries to multiply an object by 20 and crashes. And Biteful cannot force everyone to update their app on the same day; some people never update at all. A change that makes existing clients fail like this is called a <strong>breaking change</strong>.</p>
  <p><strong>API versioning</strong> is the practice of serving more than one version of the contract at the same time, so that a breaking change reaches only clients that ask for it. It works like a textbook's editions: the second edition can reorganise the chapters, but students holding the first edition can still use it, because the first edition does not change under them. The most common way to version is to put the version in the URL path, which is why every Biteful path so far began with <code>/v1</code>. To make the change, the server adds a v2 route for the changed resource and leaves the v1 route alone:</p>
  <div class="fx" data-lang="py">@app.get("/v2/restaurants/&lt;int:rid&gt;")
def get_restaurant_v2(rid):
    r = RESTAURANTS[rid]
    return {"id": r["id"], "name": r["name"], "city": r["city"],
            "rating": {"stars": r["rating"], "out_of": 5}}</div>
  <div class="fx" data-lang="text">$ curl -s http://127.0.0.1:18158/v1/restaurants/10
{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}

$ curl -s http://127.0.0.1:18158/v2/restaurants/10
{"id":10,"name":"Dosa Hut","city":"Pune","rating":{"stars":4.5,"out_of":5}}</div>
  <p>The same restaurant now has two shapes, both live. Old apps keep calling <code>/v1/</code> and get the number they expect; new apps call <code>/v2/</code> and get the object. When monitoring shows that hardly anyone calls v1 any more, Biteful announces a retirement date (often by adding <code>Deprecation</code> and <code>Sunset</code> headers to v1 responses) and eventually removes it.</p>
  <p>Not every change needs a new version, and bumping the version for every small change just drowns clients in versions. The rule is about what old clients can survive. <strong>Adding</strong> a new field is not a breaking change, because well-written clients ignore keys they do not recognise; Biteful could add <code>"cuisine": "South Indian"</code> to v1 tomorrow. <strong>Removing</strong> a field, <strong>renaming</strong> it, or <strong>changing its type</strong> (our number becoming an object) is breaking, and so is making a previously optional request field required. Those need a new version. There are also other places to put the version number, each with trade-offs:</p>
  <table class="tbl">
    <tr><th>Where the version goes</th><th>Looks like</th><th>Trade-off</th></tr>
    <tr><td>URL path (most common)</td><td><code>/v1/restaurants</code></td><td>Visible, easy to route, cache and test in a browser; the URL changes between versions</td></tr>
    <tr><td>Query parameter</td><td><code>/restaurants?version=2</code></td><td>Easy to forget, and caches must take the parameter into account</td></tr>
    <tr><td>Header</td><td><code>Accept: application/vnd.biteful.v2+json</code></td><td>Clean URLs, but invisible when you paste a link and harder to test</td></tr>
  </table>

  <h2 id="af-state"><span class="num">10</span>Statelessness</h2>
  <p>Everything so far ran as one server process on one laptop. Biteful in production runs many copies of the same server program, perhaps on several machines, behind a load balancer that sends each request to whichever copy is free. Running copies like this is how a service handles more traffic than one process can, and how it survives one copy crashing. It also raises a question: Asha logs in, and her login request lands on copy A; her next request, "show my orders", lands on copy B. Does copy B know who she is?</p>
  <p>Rather than argue, let us run it. <code>copies.py</code> is one small server program that we start twice, on two ports, as copy A and copy B. It offers two styles of login. In the <strong>stateful</strong> style the copy that handles the login stores a session id in a dict in its own memory, exactly like Biteful's cookie login in section 06. In the <strong>stateless</strong> style the copy hands back a token that proves itself: the user name followed by a <strong>signature</strong>, a code computed from the name and a secret key using HMAC (a standard way of signing data), so that anyone who knows the secret can check the token was issued by Biteful and has not been changed. Every copy is given the same secret. This is a home-made, simplified cousin of the JWT covered in <a class="xref" data-note="api_auth">Authentication &amp; Security</a>.</p>
  <div class="fx" data-lang="py"># copies.py: one server program, started twice as two "copies"
import hashlib, hmac, os, secrets
from flask import Flask, request

app = Flask(__name__)
COPY = os.environ["COPY"]                  # "A" or "B", so we can see who answered
SECRET = b"shared-by-all-copies"           # the same value on every copy
SESSIONS = {}                              # stateful: lives in THIS process only

@app.post("/stateful/login")
def stateful_login():
    sid = secrets.token_hex(4)
    SESSIONS[sid] = "asha"                 # remembered by this copy alone
    return {"copy": COPY, "session_id": sid}

@app.get("/stateful/me")
def stateful_me():
    user = SESSIONS.get(request.headers.get("X-Session", ""))
    if user is None:
        return {"copy": COPY, "error": "who are you?"}, 401
    return {"copy": COPY, "user": user}

def sign(user):                            # stateless: the token proves itself
    return user + "." + hmac.new(SECRET, user.encode(), hashlib.sha256).hexdigest()[:16]

@app.post("/stateless/login")
def stateless_login():
    return {"copy": COPY, "token": sign("asha")}

@app.get("/stateless/me")
def stateless_me():
    token = request.headers.get("X-Token", "")
    user = token.split(".")[0]
    if hmac.compare_digest(token, sign(user)):
        return {"copy": COPY, "user": user}
    return {"copy": COPY, "error": "bad token"}, 401</div>
  <div class="fx" data-lang="text">$ COPY=A flask --app copies run --port 18159
 * Running on http://127.0.0.1:18159
$ COPY=B flask --app copies run --port 18160
 * Running on http://127.0.0.1:18160</div>
  <p>The Python client below logs in on copy A in each style and then asks both copies "who am I?". At the end it tries to cheat by changing the name in the token from asha to ravi while keeping asha's signature:</p>
  <div class="fx" data-lang="py">import requests

A, B = "http://127.0.0.1:18159", "http://127.0.0.1:18160"   # two copies of one server

# Stateful: copy A remembers the session in its own memory
sid = requests.post(A + "/stateful/login").json()["session_id"]
print("session id from A:", sid)
for url in (A, B):
    r = requests.get(url + "/stateful/me", headers={"X-Session": sid})
    print("  stateful ", r.status_code, r.json())

# Stateless: the token carries its own proof
token = requests.post(A + "/stateless/login").json()["token"]
print("token from A:", token)
for url in (A, B):
    r = requests.get(url + "/stateless/me", headers={"X-Token": token})
    print("  stateless", r.status_code, r.json())

forged = "ravi." + token.split(".")[1]        # change the name, keep asha's signature
r = requests.get(B + "/stateless/me", headers={"X-Token": forged})
print("  forged   ", r.status_code, r.json())</div>
  <div class="fx" data-lang="text">session id from A: 51b2ac46
  stateful  200 {'copy': 'A', 'user': 'asha'}
  stateful  401 {'copy': 'B', 'error': 'who are you?'}
token from A: asha.dc3fdb52f402af93
  stateless 200 {'copy': 'A', 'user': 'asha'}
  stateless 200 {'copy': 'B', 'user': 'asha'}
  forged    401 {'copy': 'B', 'error': 'bad token'}</div>
  <p>Read the stateful lines first. Copy A issued the session id and recognised it, answering 200. Copy B received exactly the same id and answered 401, "who are you?", because copy B is a separate process with its own, empty <code>SESSIONS</code> dict; the memory of Asha's login exists only inside copy A. With a load balancer in front, Asha would be logged in or out depending on which copy her request happened to reach. Now the stateless lines: both copies answered 200 for the same token, because each copy can recompute the signature with the shared secret and check it, without having seen the login. And the forged token was rejected with 401, because asha's signature does not match the name ravi.</p>
  <p>That is the meaning of <strong>statelessness</strong>: the server keeps no memory of a client between requests, so each request must carry everything needed to handle it, including who is asking. HTTP itself is stateless in this sense, and REST asks that APIs be built the same way. The pay-off is that any copy can handle any request: Biteful can run two copies or twenty, add more during the dinner rush, and lose one to a crash without logging anyone out. Think of a bank where you bring your passbook every time: any counter can serve you, because everything they need is in your hand. If only counter 3 remembered you, you would have to queue at counter 3 forever, and if that cashier went home, you would be a stranger.</p>
  <p>Two clarifications prevent common misunderstandings. First, stateless does not mean "no data". Restaurants and orders still live in a database that every copy shares; what the server must not keep is per-client conversation memory inside one process. If you do want server-side sessions, put them in a shared store such as Redis or the database, so every copy can look them up. Second, a load balancer feature called <strong>sticky sessions</strong>, which always sends the same user to the same copy, only hides the problem: when that copy restarts or is removed, its users are logged out. Signed tokens or a shared session store are the real fixes.</p>

  <h2 id="af-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most damaging beginner mistake is returning an error with status 200. It feels natural to write <code>return {"error": "order not found"}</code> and let the client read the message. But clients, monitoring dashboards, load balancers and retry logic do not read English; they read the status code. In Flask, a handler that returns only a dict gets status 200 by default:</p>
  <div class="fx" data-lang="py">from flask import Flask

app = Flask(__name__)

@app.get("/bad/orders/&lt;int:oid&gt;")
def bad(oid):
    return {"error": "order not found"}            # status defaults to 200

@app.get("/good/orders/&lt;int:oid&gt;")
def good(oid):
    return {"error": "order not found"}, 404

client = app.test_client()                         # an in-process client, no network
for path in ("/bad/orders/999", "/good/orders/999"):
    r = client.get(path)
    looks_ok = 200 &lt;= r.status_code &lt; 300          # what monitoring and retries check
    print(path, r.status_code, r.get_json(), "counted as success:", looks_ok)</div>
  <div class="fx" data-lang="text">/bad/orders/999 200 {'error': 'order not found'} counted as success: True
/good/orders/999 404 {'error': 'order not found'} counted as success: False</div>
  <p>Both endpoints send the same body, but the first says 200, so every program that checks the status code counts the failure as a success: error-rate graphs stay flat, alerts never fire, and a client's <code>raise_for_status()</code> never raises. The fix is simply to return the right code, as the second endpoint does. (This example uses Flask's <code>test_client()</code>, which sends requests to the app inside the same Python process, with no network or port involved; it is how Flask apps are usually tested.)</p>
  <p>A second mistake catches people when they first call an API by hand: sending a JSON body without the <code>Content-Type: application/json</code> header. curl's <code>-d</code> on its own labels the body as form data, and many servers, including ours, then refuse to read it as JSON:</p>
  <div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}]\\n' -X POST http://127.0.0.1:18158/v1/orders -d '{"restaurant_id": 10, "items": [{"name": "Idli", "qty": 1}]}'
{"error":"body must be valid JSON"}
 [400]

$ curl -s -w ' [%{http_code}]\\n' -X POST http://127.0.0.1:18158/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Idli", "qty": 1}]}'
{"order_id":104,"restaurant_id":10,"items":[{"name":"Idli","qty":1}],"total":60,"status":"placed"}
 [201]</div>
  <p>The body was identical both times. Without the header, Flask's <code>get_json()</code> saw a body labelled as a web form, returned <code>None</code>, and the server answered 400. With the header, the order was created as number 104. In Python, <code>requests.post(url, json=data)</code> sets the header for you, while <code>requests.post(url, data=json.dumps(data))</code> does not, which is a classic source of this bug.</p>
  <p>A few design mistakes are worth recognising even without running code. Changing data with GET, such as a link to <code>/deliverOrder?id=101</code>, is dangerous because GET is supposed to be safe: browsers prefetch links, search-engine crawlers follow them, and caches may replay them, so sooner or later a robot will "click" it. Retrying a non-idempotent POST without an idempotency key creates duplicates, as orders 101 and 102 showed. Returning NumPy values or datetimes unconverted produces 500 errors, and patching it with <code>default=str</code> silently turns numbers into strings. Renaming or retyping a field in place, without a new version, breaks every old app at once. Keeping sessions in one process's memory works on a laptop and fails as soon as a second copy runs. And a server bound to <code>127.0.0.1</code> cannot be reached from any other machine, which looks like a network problem but is a one-word configuration change to <code>0.0.0.0</code>.</p>

  <h2 id="af-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>API</b>: an agreed list of requests one program accepts and the shape of each answer; a <b>web API</b> does it over HTTP.</li>
    <li><b>Client</b>: the program that sends requests. <b>Server</b>: the process that listens on a port and answers.</li>
    <li><b>IP address</b>: which computer. <b>Port</b>: which program on it (0–65535). <b>localhost / 127.0.0.1</b>: this same computer.</li>
    <li><b>DNS</b>: turns a host name into an IP address. <b>TCP</b>: reliable, ordered byte delivery between two programs. <b>TLS</b>: the encryption behind https.</li>
    <li><b>URL</b>: <code>scheme://host:port/path?query</code>.</li>
    <li><b>HTTP</b>: the protocol of one request and one response. Each message: first line, headers, blank line, optional body.</li>
    <li><b>Safe</b>: changes nothing. <b>Idempotent</b>: repeating the request leaves the same server state.</li>
    <li><b>Idempotency key</b>: a client-chosen id per action; the server returns the first result for repeats.</li>
    <li><b>Header</b>: a <code>Name: value</code> line of metadata. <b>ETag</b>: a version fingerprint; <code>If-None-Match</code> → 304.</li>
    <li><b>Cookie</b>: text set with <code>Set-Cookie</code> that the browser sends back in <code>Cookie</code>.</li>
    <li><b>Serialization</b>: object → text (<code>json.dumps</code>); <b>deserialization</b>: text → object (<code>json.loads</code>).</li>
    <li><b>Resource</b>: a named thing with a URL; <b>collection</b>: a resource listing members.</li>
    <li><b>Breaking change</b>: remove, rename or retype a field → new version.</li>
    <li><b>Stateless</b>: no per-client memory between requests; each request carries what it needs.</li>
  </ul>
  <h3>Methods</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Does</th><th>Safe</th><th>Idempotent</th><th>Typical success code</th></tr>
    <tr><td>GET</td><td>read</td><td>Yes</td><td>Yes</td><td>200 (304 if unchanged)</td></tr>
    <tr><td>POST</td><td>create / action</td><td>No</td><td>No</td><td>201 + Location (202 if queued)</td></tr>
    <tr><td>PUT</td><td>replace whole resource</td><td>No</td><td>Yes</td><td>200 or 204</td></tr>
    <tr><td>PATCH</td><td>change some fields</td><td>No</td><td>Not guaranteed</td><td>200</td></tr>
    <tr><td>DELETE</td><td>remove</td><td>No</td><td>Yes</td><td>204 (404 on repeat)</td></tr>
  </table>
  <h3>Status codes</h3>
  <table class="tbl">
    <tr><th>Family</th><th>Meaning</th><th>Ones to know</th></tr>
    <tr><td>2xx</td><td>worked</td><td>200 OK, 201 Created, 202 Accepted, 204 No Content</td></tr>
    <tr><td>3xx</td><td>look elsewhere</td><td>301 / 302 redirect, 304 Not Modified</td></tr>
    <tr><td>4xx</td><td>client's fault, don't retry unchanged</td><td>400 unreadable, 401 who are you, 403 not allowed, 404, 405 wrong method, 409 conflict, 422 bad values, 429 slow down</td></tr>
    <tr><td>5xx</td><td>server's fault, retry later</td><td>500 bug, 502 / 503 / 504 proxy can't get a good answer</td></tr>
  </table>
  <h3>Pagination and versioning</h3>
  <table class="tbl">
    <tr><th></th><th>Offset</th><th>Cursor</th></tr>
    <tr><td>Request</td><td><code>?limit=20&amp;offset=40</code></td><td><code>?limit=20&amp;after=1840</code></td></tr>
    <tr><td>Deep pages</td><td>slow</td><td>fast (index seek)</td></tr>
    <tr><td>Live data</td><td>duplicates / skips</td><td>stable</td></tr>
  </table>
  <p>Version in the URL path (<code>/v1</code>, <code>/v2</code>); adding a field is safe, removing/renaming/retyping is not.</p>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import requests

r = requests.get("http://127.0.0.1:18158/v1/restaurants", params={"city": "Pune"})
r.status_code, r.headers["Content-Type"], r.json()

requests.post(url, json={"restaurant_id": 10, "items": [...]},     # sets Content-Type
              headers={"Idempotency-Key": "ben-7f3a"})
requests.patch(url, json={"status": "delivered"})
requests.get(url, headers={"If-None-Match": '"7e71016a"'})        # 304 if unchanged

# curl: -X method, -H header, -d body, -i show headers, -v show everything,
#       -w '%{http_code}' print code, -c / -b save / send cookies</div>
  <h3>Gotchas</h3>
  <ul>
    <li>"Connection refused" means no program on that port, not a server saying no.</li>
    <li>A server on 127.0.0.1 is reachable only from the same machine; use 0.0.0.0.</li>
    <li>Idempotency is about server state, not the response (second DELETE → 404).</li>
    <li>PUT with missing fields wipes them; use PATCH for partial updates.</li>
    <li>Never return errors with 200; never change data with GET.</li>
    <li>401 = not authenticated; 403 = authenticated but not allowed. 400 = unreadable; 422 = invalid values.</li>
    <li>JSON has no tuple, datetime, Decimal, set or NumPy type; <code>default=str</code> turns numbers into strings.</li>
    <li>Send <code>Content-Type: application/json</code> with JSON bodies.</li>
    <li>Stateless does not mean no database.</li>
  </ul>

  <h2 id="af-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an API, and what is a web API?</summary><div class="qa-body">An API is an agreed interface through which one program asks another for data or work: a fixed set of requests and the shape of each response, hiding how the work is done. A web API offers that interface over HTTP, usually with JSON bodies. Because callers depend only on the contract, the implementation behind it (database, model, language) can change without breaking them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a client and a server, and what is a port?</summary><div class="qa-body">The client sends requests (an app, browser, script or curl); the server is a long-running process that listens for requests and answers them. An IP address identifies a computer, and a port number identifies which program on that computer receives the data, for example 443 for HTTPS or 5432 for PostgreSQL. If nothing is listening on the port, the client gets "connection refused".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does an HTTP request and response look like?</summary><div class="qa-body">Both are text with four parts: a first line, headers, a blank line, and an optional body. A request's first line is the method, path and version, such as <code>GET /v1/restaurants/10 HTTP/1.1</code>. A response's first line is the version, status code and reason, such as <code>HTTP/1.1 200 OK</code>. Headers like <code>Content-Type</code> and <code>Content-Length</code> describe the body.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when you call <code>https://api.example.com/orders</code>?</summary><div class="qa-body">DNS resolves the host name to an IP address; the client opens a TCP connection to port 443 and performs a TLS handshake to encrypt it. It sends the HTTP request; a load balancer or reverse proxy forwards it to one server instance, where the framework routes it by method and path to a handler. The handler may query a database, and the result is serialized to JSON and returned with a status code and headers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do safe and idempotent mean? Which methods are which?</summary><div class="qa-body">A safe method does not change server state: GET, HEAD, OPTIONS. An idempotent method leaves the same state whether sent once or many times: all safe methods plus PUT and DELETE. POST is neither, and PATCH is not guaranteed to be idempotent, because a patch like "increment quantity" applied twice changes things twice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PUT vs PATCH vs POST?</summary><div class="qa-body">POST creates a new resource whose id the server chooses, or triggers an action; repeating it creates duplicates. PUT replaces the entire resource at a known URL with the body, so omitted fields are removed, and repeating it is harmless. PATCH changes only the fields sent, such as <code>{"status": "delivered"}</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A client times out on <code>POST /orders</code> and retries. What can go wrong, and how do you prevent it?</summary><div class="qa-body">The first request may have succeeded with only the response lost, so the retry creates a duplicate order and a double charge. The fix is an idempotency key: the client generates a unique id per user action and sends it in an <code>Idempotency-Key</code> header on every retry, and the server stores key → result in shared storage and returns the stored result for repeats instead of creating again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is DELETE idempotent if the second call returns 404?</summary><div class="qa-body">Yes. Idempotency is defined by the server's state, not by the response. After one DELETE or two, the resource is gone, so the state is identical; the different status code only reports that there was nothing left to delete the second time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do the status code families mean? When should a client retry?</summary><div class="qa-body">2xx success, 3xx redirection or "not modified", 4xx client error, 5xx server error. Clients should retry 5xx errors and 429 after waiting (honouring <code>Retry-After</code>), preferably with exponential backoff, and only for idempotent requests or ones protected by an idempotency key. Retrying a 4xx unchanged will fail again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>401 vs 403? And 400 vs 422?</summary><div class="qa-body">401 means not authenticated: no credentials or invalid ones, so logging in may help. 403 means authenticated but not authorized: the server knows who you are and still refuses. 400 means the request cannot be parsed at all, such as broken JSON; 422 means it parsed fine but the values are invalid, such as a quantity of zero. FastAPI returns 422 for validation errors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is returning <code>200</code> with <code>{"error": ...}</code> a bad idea?</summary><div class="qa-body">Everything automatic reads the status code, not the body: monitoring counts it as a success, alerts do not fire, client libraries do not raise, caches may store the error, and retry logic does nothing. Use the proper 4xx or 5xx code and put the human-readable detail in the body.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do ETags and 304 responses work?</summary><div class="qa-body">The server sends an <code>ETag</code> header, a fingerprint of the response content. The client stores it and on the next request sends <code>If-None-Match</code> with that value. If the content has not changed, the server replies <code>304 Not Modified</code> with no body and the client uses its cached copy, saving bandwidth; if it changed, a normal 200 with the new content and a new ETag comes back.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are cookies, and what do HttpOnly, Secure and SameSite do?</summary><div class="qa-body">A cookie is a small value the server sets with <code>Set-Cookie</code>; the browser stores it and automatically sends it back in a <code>Cookie</code> header on later requests to that site, which is how sessions survive across stateless requests. HttpOnly hides it from JavaScript, limiting theft through XSS; Secure sends it only over HTTPS; SameSite stops it being attached to most cross-site requests, which blocks most CSRF.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model endpoint returns a NumPy value and the API answers 500. Why, and what is the fix?</summary><div class="qa-body">The JSON encoder only knows Python's built-in types, so <code>np.int64</code> raises <code>TypeError: Object of type int64 is not JSON serializable</code>, which the framework turns into a 500. Convert explicitly with <code>int()</code>, <code>float()</code> or <code>.tolist()</code>. Avoid <code>default=str</code>, which hides the error by turning numbers into strings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is REST? How does it differ from RPC-style APIs?</summary><div class="qa-body">REST is an architectural style where URLs identify resources (nouns such as <code>/orders/101</code>) and standard HTTP methods express the action, with a uniform interface, cacheable responses and stateless requests. RPC-style APIs name endpoints after functions, such as <code>/createOrder</code> or <code>/getMenu</code>, often all via POST. REST's standard verbs let clients, caches and proxies know without documentation which requests are safe or retryable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design REST endpoints for a customer's orders and for cancelling an order.</summary><div class="qa-body">List with <code>GET /v1/customers/{id}/orders</code> (or <code>GET /v1/orders?customer_id=...</code>), with cursor pagination. Cancel with <code>PATCH /v1/orders/{id}</code> and <code>{"status": "cancelled"}</code>, or <code>POST /v1/orders/{id}/cancel</code> if it triggers side effects such as refunds. Return 404 if the order does not exist and 409 if it was already delivered; never use a GET link to cancel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Offset vs cursor pagination: which would you use for an infinite feed of 50 million orders?</summary><div class="qa-body">Cursor. Offset makes the database read and discard every skipped row, so deep pages get slower and slower, and inserts or deletes during scrolling cause duplicates or skipped items. A cursor query like <code>WHERE id &gt; :last_id ORDER BY id LIMIT 20</code> uses the index directly and stays correct as data changes. Offset is fine for small lists where users want to jump to page numbers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you version an API, and which changes need a new version?</summary><div class="qa-body">Options are the URL path (<code>/v1/</code>), a query parameter, or a header such as a custom media type in <code>Accept</code>; the URL path is the usual choice because it is visible and easy to route, cache and test. Only breaking changes need a new version: removing, renaming or changing the type of a field, or adding a required input. Adding an optional field is safe; old versions are deprecated with notice and then retired.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "REST is stateless" mean, and why does it matter for scaling?</summary><div class="qa-body">The server keeps no per-client session memory between requests; each request carries its own credentials and context, such as a signed token. That lets a load balancer send any request to any instance, so you can add or remove instances freely and survive crashes. It does not mean no database: shared state lives in a database or Redis that all instances use, and sticky sessions are only a workaround.</div></details>
</main>
`
});
