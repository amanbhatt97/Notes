// notes/apis/api_fundamentals.js — HTTP & REST Fundamentals
Object.assign(TOPIC_CONTENT, {
  "api_fundamentals": `<main>
  <h1>HTTP &amp; REST Fundamentals</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>HTTP &amp; REST Fundamentals</span></div>
  <p class="lead">Asha opens the Biteful food-delivery app on her phone, sees five restaurants, and orders two Masala Dosas from Dosa Hut. Her phone does not store any restaurants. It sent a short text message to a Biteful computer and got a short text reply. This note explains that conversation from zero, one need at a time: who talks to whom (client, server, port, URL), what one message looks like (a real request and response captured with <code>curl -v</code>), what the first word means (methods, idempotency), what the reply's number means (status codes), the labels on every message (headers, cookies), how data becomes text (JSON), how to name things (REST resources, pagination), how to change an API without breaking phones (versioning), and why the server must not remember anyone (statelessness). Every command was run against a real local server; the outputs are pasted as they came back.</p>

  <h2 id="af-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="af-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="69" y="42" text-anchor="middle" font-size="12" font-weight="700">1 HTTP &amp; REST</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the conversation</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="42" text-anchor="middle" font-size="12">2 Flask</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">write the server</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="343" y="42" text-anchor="middle" font-size="12">3 FastAPI</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">validation, docs, async</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="480" y="42" text-anchor="middle" font-size="12">4 Auth &amp; Security</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">who may call</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="614" y="42" text-anchor="middle" font-size="12">5 Production</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">many copies, watched</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#af-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#af-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#af-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#af-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: the Biteful orders API</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">GET /restaurants · POST /orders · customers vs restaurant staff · a slow receipt email on a queue</text>
  </svg><figcaption>The APIs &amp; Backend track in reading order. You are on the green note, the first one. Each later note starts from a weakness the earlier one leaves.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: Python, and a little SQL</b><span>You can write functions and dicts (<a class="xref" data-note="py_functions">Functions</a>, <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>). The databases track stored Biteful's restaurants and orders in tables (<a class="xref" data-note="sql_joins">Joins</a> uses the same Asha, Ben, Dosa Hut and order 101). What was missing: a phone cannot run SQL against Biteful's database. It needs a doorway.</span></li>
    <li><b>This note adds: the rules of the conversation</b><span>Client and server, ports and URLs, the raw HTTP request and response, methods and idempotency, status codes, headers and cookies, JSON, REST resource naming and pagination, versioning, and statelessness. No framework knowledge is needed: the tiny server is given to you, and the Flask note explains its code.</span></li>
    <li><b>Leads to: <a class="xref" data-note="api_flask">Flask</a> → <a class="xref" data-note="api_fastapi">FastAPI</a> → <a class="xref" data-note="api_auth">Authentication &amp; Security</a> → <a class="xref" data-note="api_production">Production Backend</a></b><span>Read in that order. Flask shows how the server you poke at here is written; FastAPI removes Flask's hand-written checks; the auth note needs FastAPI's dependencies to express "who may call"; production needs all of it running as many copies.</span></li>
  </ol>

  <h2 id="af-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each answer raises the next question. All numbers come from the running example: Biteful's 5 restaurants and Asha's order of 2 Masala Dosas at ₹120 = ₹240 (order 101).</p>
  <ol class="story">
    <li><b>API</b><span>Q: Asha's phone needs Dosa Hut's menu, which lives on Biteful's computer. How can one program ask another for data without knowing its insides? → An agreed menu of questions and answer shapes. But who asks, who answers, and where do they meet?</span></li>
    <li><b>Client, server, port, URL</b><span>Q: how does the request reach the right program? → The phone is the client; a server program waits on a port; the URL <code>http://127.0.0.1:5000/v1/restaurants</code> names computer, door and thing. Wrong port: "Couldn't connect". But what exactly travels between them?</span></li>
    <li><b>Request and response</b><span>Q: what does one message look like? → Plain text: a start line (<code>GET /v1/restaurants/10 HTTP/1.1</code>), header lines, a blank line, a body. The reply starts <code>HTTP/1.1 200 OK</code>. The first word, GET, is a choice. What are the others?</span></li>
    <li><b>Methods and idempotency</b><span>Q: how do we say read, create, change, delete? → GET, POST, PUT, PATCH, DELETE. Sending the same POST twice made orders 101 <em>and</em> 102; the same PATCH twice changed nothing more. How does the client know what happened?</span></li>
    <li><b>Status codes</b><span>Q: did it work, and whose fault is it if not? → 201 Created, 304, 400, 404, 405, 409, 422, all produced by our server. The code is one number; where do details like "this format" or "reuse for 60 s" go?</span></li>
    <li><b>Headers and cookies</b><span>Q: how do we label a message? → <code>Content-Type</code>, <code>Location</code>, <code>ETag</code> (the menu came back 304 with an empty body the second time), <code>Set-Cookie</code>. The body itself must be text both sides read. How?</span></li>
    <li><b>JSON</b><span>Q: how does a Python dict travel? → <code>json.dumps</code>/<code>loads</code>. A datetime, Decimal, NumPy int or set crashes it. Now we can exchange data; but how should URLs be named so every client can guess them?</span></li>
    <li><b>REST resources, URL design, pagination</b><span>Q: what should the paths be? → Nouns (<code>/restaurants/10</code>), verbs from methods; big lists in pages (<code>?limit=2&amp;after=11</code>). Phones in the wild use these URLs. What if we must change a field?</span></li>
    <li><b>Versioning</b><span>Q: how do we change the response shape without breaking old apps? → <code>/v1/</code> keeps <code>"rating": 4.5</code>; <code>/v2/</code> returns <code>{"stars": 4.5, "out_of": 5}</code>. Finally: Biteful will run many server copies. Can any copy answer any request?</span></li>
    <li><b>Statelessness</b><span>Q: what if the second request lands on a different copy? → A session remembered by copy A gave 401 on copy B; a self-proving token worked on both. Every request must carry what it needs. Next: write such a server yourself (Flask).</span></li>
  </ol>

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
          <li><b>Benefit</b> — swap the database behind it; callers don't change</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Client, server, port, URL</div>
        <ul>
          <li><b>Server</b> — program that waits for requests and answers them</li>
          <li><b>Client</b> — program that asks (browser, app, curl, Python)</li>
          <li><b>IP</b> — which computer; <b>port</b> — which program on it</li>
          <li><b>localhost / 127.0.0.1</b> — "this same computer"</li>
          <li><b>URL</b> — <code>scheme://host:port/path?query</code></li>
          <li>Nobody on the port → "Couldn't connect to server"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">HTTP message</div>
        <ul>
          <li><b>Request</b> — <code>GET /v1/restaurants/10 HTTP/1.1</code> + headers + body</li>
          <li><b>Response</b> — <code>HTTP/1.1 200 OK</code> + headers + body</li>
          <li><b>Blank line</b> separates headers and body; all plain text over TCP</li>
          <li><b>Full trip</b> — DNS → TCP → TLS → proxy → app → handler → JSON back</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Methods</div>
        <ul>
          <li><b>GET</b> read · <b>POST</b> create · <b>PUT</b> replace · <b>PATCH</b> partial · <b>DELETE</b> remove</li>
          <li><b>Safe</b> — changes nothing (GET, HEAD)</li>
          <li><b>Idempotent</b> — repeat = same end state (GET, PUT, DELETE); POST is not</li>
          <li>Biteful: POST twice → orders 101 and 102</li>
          <li>⚠ Retried POST → <code>Idempotency-Key</code> (same key → order 103 again)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Status codes</div>
        <ul>
          <li><b>First digit = family</b> — 2 ok, 3 look elsewhere, 4 your fault, 5 our fault</li>
          <li><b>2xx</b> — 200, 201 Created (+Location), 202 Accepted, 204 No Content</li>
          <li><b>4xx</b> — 400 broken body, 401 who are you, 403 not allowed, 404, 405 wrong verb, 409 conflict, 422 bad values, 429 slow down</li>
          <li><b>5xx</b> — 500 bug; 502/503/504 proxy can't reach a healthy backend</li>
          <li>⚠ Never return errors with 200</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Headers &amp; cookies</div>
        <ul>
          <li><b>Content-Type / Accept</b> — body format sent / wanted</li>
          <li><b>Authorization: Bearer …</b> — credentials</li>
          <li><b>ETag + If-None-Match → 304</b> — menu unchanged, no body sent</li>
          <li><b>Location</b> with 201; <b>Retry-After</b> with 429/503</li>
          <li><b>Cookie</b> — <code>Set-Cookie</code> once, browser sends back; <code>HttpOnly; Secure; SameSite</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JSON</div>
        <ul>
          <li>Six types: object, array, string, number, true/false, null</li>
          <li><b>dumps / loads</b> — serialize / deserialize; tuple → list, None → null</li>
          <li>⚠ datetime, Decimal, NumPy int64, set → TypeError</li>
          <li><b>Fix</b> — <code>.isoformat()</code>, <code>int()</code>, <code>float()</code>; <code>default=str</code> turns 38 into "38"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">REST, versions, state</div>
        <ul>
          <li><b>Resources</b> — plural nouns: <code>/restaurants/10/menu</code>, <code>/orders/101</code></li>
          <li><b>Pagination</b> — cursor <code>?after=11</code> stable; offset repeats items</li>
          <li><b>Versioning</b> — <code>/v1/</code>, <code>/v2/</code>; adding a field is safe, reshaping is not</li>
          <li><b>Stateless</b> — each request carries its identity → any copy can answer</li>
          <li>⚠ Never change data via GET</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="af-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Need: What an API Is</span><span class="rm-sub">The phone needs the restaurant's data</span></div></div>
      <div class="rm-item rm-done" data-target="af-server"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Client, Server, Port, URL</span><span class="rm-sub">Who talks to whom, and where</span></div></div>
      <div class="rm-item rm-done" data-target="af-cycle"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Request → Response</span><span class="rm-sub">A raw exchange captured with curl -v</span></div></div>
      <div class="rm-item rm-done" data-target="af-methods"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Methods &amp; Idempotency</span><span class="rm-sub">What a retry does to Asha's order</span></div></div>
      <div class="rm-item rm-done" data-target="af-status"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Status Codes</span><span class="rm-sub">Which one, and why</span></div></div>
      <div class="rm-item rm-done" data-target="af-headers"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Headers &amp; Cookies</span><span class="rm-sub">Labels, ETag, 304</span></div></div>
      <div class="rm-item rm-done" data-target="af-json"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">JSON Serialization</span><span class="rm-sub">Python objects ⇄ text</span></div></div>
      <div class="rm-item rm-done" data-target="af-rest"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">REST Resources &amp; URL Design</span><span class="rm-sub">Nouns, verbs, pagination</span></div></div>
      <div class="rm-item rm-done" data-target="af-version"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Versioning</span><span class="rm-sub">v1 and v2 side by side</span></div></div>
      <div class="rm-item rm-done" data-target="af-state"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Statelessness</span><span class="rm-sub">Two copies, one request</span></div></div>
      <div class="rm-item rm-done" data-target="af-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One request, every layer</span></div></div>
      <div class="rm-item rm-done" data-target="af-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="af-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="af-what"><span class="num">01</span>The Need: What an API Is</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha's phone has the Biteful app but no restaurant data; the restaurants, menus and orders live in Biteful's database on a computer far away. A phone cannot open that database directly, and it must not: it would need passwords, table names and SQL. How can a program on one machine ask a program on another machine for data, without knowing anything about its insides?</p>
  </div>
  <h3>The running example: Biteful</h3>
  <p>Biteful is a small food-delivery company in Pune and Mumbai (the same one the SQL notes use). In this track it has one backend, the <strong>orders API</strong>. Here is its data. Keep it in mind: every section asks this same data a new question.</p>
  <table class="tbl"><caption>restaurants (5)</caption>
    <tr><th>id</th><th>name</th><th>city</th><th>rating</th><th>menu</th></tr>
    <tr><td>10</td><td>Dosa Hut</td><td>Pune</td><td>4.5</td><td>Masala Dosa ₹120, Idli ₹60, Filter Coffee ₹40</td></tr>
    <tr><td>11</td><td>Biryani Bros</td><td>Mumbai</td><td>4.2</td><td>Chicken Biryani ₹350, Raita ₹50</td></tr>
    <tr><td>12</td><td>Pizza Point</td><td>Pune</td><td>3.9</td><td>Margherita ₹280, Garlic Bread ₹100</td></tr>
    <tr><td>13</td><td>Green Bowl</td><td>Mumbai</td><td>4.2</td><td>(no menu yet)</td></tr>
    <tr><td>14</td><td>Momo Magic</td><td>Pune</td><td>none yet (new)</td><td>(no menu yet)</td></tr>
  </table>
  <p>The story of one order: Asha opens the app (it lists restaurants), taps Dosa Hut (it shows the menu), orders 2 Masala Dosas (2 × ₹120 = ₹240), and Biteful creates <strong>order 101</strong>. Later a Dosa Hut staff member marks it delivered. Ben, another customer, orders too. Customers and staff, a slow receipt email, many server copies: the later notes add those.</p>
  <p>For the app and the backend to talk, both sides must agree on the rules. Which questions can the app ask? In what words? What will each answer look like? Without fixed rules, the app would need to know how Biteful's code works inside, and every change at Biteful would break every phone.</p>
  <p>The fixed list of questions a program accepts, and the shape of each answer, is called an <strong>API</strong> (Application Programming Interface). When the questions travel over the internet using HTTP (the rules of web conversation, section 03), it is a <strong>web API</strong>. Biteful's API has questions like "list restaurants" (<code>GET /v1/restaurants</code>) and "create an order" (<code>POST /v1/orders</code>).</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="af-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="35" width="130" height="60" rx="8" class="fb sb"/><text x="75" y="62" text-anchor="middle">Asha's app</text><text x="75" y="80" text-anchor="middle" class="tm" font-size="12">client</text>
    <rect x="235" y="35" width="130" height="60" rx="8" class="ft st"/><text x="300" y="62" text-anchor="middle">Orders API</text><text x="300" y="80" text-anchor="middle" class="tm" font-size="12">fixed menu of requests</text>
    <rect x="460" y="35" width="130" height="60" rx="8" class="fg sg"/><text x="525" y="62" text-anchor="middle">Kitchen</text><text x="525" y="80" text-anchor="middle" class="tm" font-size="12">database, logic</text>
    <line x1="140" y1="52" x2="233" y2="52" stroke="currentColor" marker-end="url(#af-ar)"/><text x="187" y="45" text-anchor="middle" font-size="12">request</text>
    <line x1="235" y1="80" x2="142" y2="80" stroke="currentColor" marker-end="url(#af-ar)"/><text x="187" y="100" text-anchor="middle" font-size="12">response</text>
    <line x1="365" y1="52" x2="458" y2="52" stroke="currentColor" marker-end="url(#af-ar)"/>
    <line x1="460" y1="80" x2="367" y2="80" stroke="currentColor" marker-end="url(#af-ar)"/>
    <text x="300" y="122" text-anchor="middle" class="tm" font-size="12">The app never walks into the kitchen.</text>
  </svg><figcaption>Read left to right: the app gives its request to the API, the API talks to the database, the answer comes back the same way.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant waiter. You choose from a fixed menu. You never walk into the kitchen or see how the dosa is made. The kitchen can change chefs or move to a new building, and you won't notice, as long as the menu stays the same.</p></div>
  <p><strong>Why the contract matters, on Biteful.</strong> Next month Biteful moves its data from one database to another. The app keeps working, because it never knew about the database: it only knew "<code>GET /v1/restaurants</code> returns a list of restaurants with id, name, city and rating". The same holds for an ML model behind an API: retrain it, and callers do not change.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>API</strong> (Application Programming Interface): the agreed way one program asks another for work. A <strong>web API</strong> does it over HTTP. The agreement fixes the requests allowed and the shape of each response, and hides everything behind them.</p></div>
  <div class="callout trap"><span class="label">Trap: where the analogy breaks</span><p>A real waiter remembers you. A web API (in the REST style) does not: every request must carry everything needed, including who you are. Section 10 shows why that is a feature.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: client, server, port, URL.</b> We have a contract, but not a meeting place. Which program asks, which one answers, and how does Asha's request find the one Biteful program among thousands on the internet?</div>

  <h2 id="af-server"><span class="num">02</span>Client, Server, Port, URL</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the app should ask Biteful "list restaurants". But the internet has millions of computers, and Biteful's computer runs several programs at once (the API, the database, a cache). How does the request reach the right program on the right machine, and what happens if nobody is there?</p>
  </div>
  <p>Every conversation has two roles. The program that <em>asks</em> is the <strong>client</strong>: Asha's app, a browser, a Jupyter notebook, or <code>curl</code> (a command-line tool that sends web requests and prints the reply). The program that <em>waits and answers</em> is the <strong>server</strong>. "Server" means a program first; people also call the computer it runs on a server.</p>
  <p>A server computer runs many server programs at once. So a client needs two things to reach the right one:</p>
  <ul>
    <li><strong>IP address</strong>: the address of the computer, like <code>13.234.10.5</code>. A building's street address.</li>
    <li><strong>Port</strong>: a number from 0 to 65535 that picks one program on that computer. A flat number inside the building.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="af-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="62" width="120" height="44" rx="6" class="fb sb"/><text x="70" y="82" text-anchor="middle">Client</text><text x="70" y="98" text-anchor="middle" font-size="11" class="tm">app / curl</text>
    <rect x="230" y="10" width="360" height="150" rx="8" fill="none" stroke="currentColor"/>
    <text x="410" y="28" text-anchor="middle">Biteful's computer  IP 13.234.10.5</text>
    <rect x="245" y="42" width="70" height="28" rx="4" class="ft st"/><text x="280" y="61" text-anchor="middle">:443</text>
    <rect x="330" y="42" width="245" height="28" rx="4" class="fs"/><text x="452" y="61" text-anchor="middle">orders API (web server)</text>
    <rect x="245" y="80" width="70" height="28" rx="4" class="fs"/><text x="280" y="99" text-anchor="middle">:5432</text>
    <rect x="330" y="80" width="245" height="28" rx="4" class="fs"/><text x="452" y="99" text-anchor="middle">PostgreSQL database</text>
    <rect x="245" y="118" width="70" height="28" rx="4" class="fs"/><text x="280" y="137" text-anchor="middle">:6379</text>
    <rect x="330" y="118" width="245" height="28" rx="4" class="fs"/><text x="452" y="137" text-anchor="middle">Redis cache</text>
    <line x1="130" y1="78" x2="243" y2="58" stroke="currentColor" marker-end="url(#af-ar3)"/><text x="185" y="56" text-anchor="middle" font-size="11">IP + port</text>
  </svg><figcaption>One computer, many programs. The IP finds the computer; the port finds the program behind one "door".</figcaption></figure>
  <p>Two special names you will see all the time: <code>localhost</code> and <code>127.0.0.1</code> both mean "this same computer". When you run a server on your laptop, a client on your laptop reaches it at <code>127.0.0.1:5000</code>.</p>
  <h3>Reading a URL</h3>
  <p>A <strong>URL</strong> (web address) packs all of this into one line. Each part answers one question:</p>
  <figure class="viz"><svg viewBox="0 0 600 105" width="600">
    <rect x="5" y="10" width="80" height="34" rx="4" class="fv"/><text x="45" y="32" text-anchor="middle">https://</text>
    <rect x="90" y="10" width="140" height="34" rx="4" class="fb sb"/><text x="160" y="32" text-anchor="middle">api.biteful.in</text>
    <rect x="235" y="10" width="50" height="34" rx="4" class="ft st"/><text x="260" y="32" text-anchor="middle">:443</text>
    <rect x="290" y="10" width="165" height="34" rx="4" class="fg sg"/><text x="372" y="32" text-anchor="middle">/v1/restaurants</text>
    <rect x="460" y="10" width="135" height="34" rx="4" class="fs"/><text x="527" y="32" text-anchor="middle">?city=Pune</text>
    <text x="45" y="64" text-anchor="middle" font-size="11">scheme</text><text x="45" y="80" text-anchor="middle" font-size="11" class="tm">which rules</text>
    <text x="160" y="64" text-anchor="middle" font-size="11">host</text><text x="160" y="80" text-anchor="middle" font-size="11" class="tm">which computer</text>
    <text x="260" y="64" text-anchor="middle" font-size="11">port</text><text x="260" y="80" text-anchor="middle" font-size="11" class="tm">which door</text>
    <text x="372" y="64" text-anchor="middle" font-size="11">path</text><text x="372" y="80" text-anchor="middle" font-size="11" class="tm">which thing</text>
    <text x="527" y="64" text-anchor="middle" font-size="11">query string</text><text x="527" y="80" text-anchor="middle" font-size="11" class="tm">extra options</text>
    <text x="300" y="100" text-anchor="middle" font-size="11" class="tm">the port is usually hidden: https means 443, http means 80</text>
  </svg><figcaption>Five parts of a URL. The host name is turned into an IP address by DNS (the internet's phone book).</figcaption></figure>
  <p><strong>Try it.</strong> Here is a complete web server in a dozen lines. It is written with Flask, a Python library for servers; you do not need to understand the code yet (the <a class="xref" data-note="api_flask">Flask</a> note builds it line by line). It answers one question: "list restaurants".</p>
<div class="fx" data-lang="py"># biteful_min.py: the smallest Biteful server
from flask import Flask

app = Flask(__name__)
RESTAURANTS = [
    {"id": 10, "name": "Dosa Hut", "city": "Pune", "rating": 4.5},
    {"id": 11, "name": "Biryani Bros", "city": "Mumbai", "rating": 4.2},
]

@app.get("/v1/restaurants")
def list_restaurants():
    return {"items": RESTAURANTS}</div>
  <p>Start it in one terminal. It prints where it is listening and then waits:</p>
<div class="fx" data-lang="text">$ flask --app biteful_min run --port 5000
 * Serving Flask app 'biteful_min'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit</div>
  <p>In a second terminal, be the client. First the right port, then a port where nobody is listening:</p>
<div class="fx" data-lang="text">$ curl -s http://127.0.0.1:5000/v1/restaurants
{"items":[{"city":"Pune","id":10,"name":"Dosa Hut","rating":4.5},{"city":"Mumbai","id":11,"name":"Biryani Bros","rating":4.2}]}

$ curl -sS http://127.0.0.1:5099/v1/restaurants
curl: (7) Failed to connect to 127.0.0.1 port 5099 after 0 ms: Couldn't connect to server</div>
  <p>And the server's terminal logged the one request it received:</p>
<div class="fx" data-lang="text">127.0.0.1 - - [19/Oct/2026 23:59:49] "GET /v1/restaurants HTTP/1.1" 200 -</div>
  <p>Read the trace. The client sent <code>GET /v1/restaurants</code>; the server matched that path to <code>list_restaurants</code>, turned the returned dict into text and replied with status 200. (This tiny version lets Flask sort the keys alphabetically, so <code>city</code> comes first; the full server later keeps them in written order.) On port 5099 no program was listening, so the computer refused the connection: curl's error 7 means "no door there", not "the server said no".</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Client</strong>: the program that sends a request. <strong>Server</strong>: the program that listens on a port and answers. <strong>Port</strong>: a number that picks one listening program on a computer. <strong>URL</strong>: <code>scheme://host:port/path?query</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A server started on <code>127.0.0.1</code> accepts requests only from the same machine. To accept requests from other machines it must listen on <code>0.0.0.0</code> ("all network cards"). "It works on my laptop but not from my phone" is very often this.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: request and response.</b> curl printed only the body. What did the client actually send, and what exactly came back? We need to see the whole message.</div>

  <h2 id="af-cycle"><span class="num">03</span>Request → Response</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The client and server found each other, and a list of restaurants came back. But we saw only the body. What does the request look like on the wire, how did the server know which restaurant we wanted and in what format, and how did the client know it worked?</p>
  </div>
  <p>Client and server need a shared language, like two people agreeing to speak Hindi on a phone call. On the web it is <strong>HTTP</strong> (HyperText Transfer Protocol). A <em>protocol</em> is a fixed set of rules for a conversation. HTTP has one simple pattern: the client sends one <strong>request</strong>, the server sends back one <strong>response</strong>, and that exchange is complete.</p>
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
  </svg><figcaption>Time flows downwards. One request in, one response out.</figcaption></figure>
  <p>From here on we use the full Biteful server, <code>biteful.py</code> (all five restaurants, menus and orders). Its data part, which every later section uses:</p>
<div class="fx" data-lang="py"># biteful.py: the Biteful orders API used in every section of this note
import hashlib, hmac, json, os, secrets
from flask import Flask, request, make_response

app = Flask(__name__)
app.json.sort_keys = False                       # keep keys in the order we wrote them

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
ORDERS = {}                                      # order_id -&gt; order
SEEN_KEYS = {}                                   # Idempotency-Key -&gt; order_id
NEXT_ID = [101]</div>
  <p>Both the request and the response are plain text. <code>curl -v</code> ("verbose") prints that text. Lines starting with <code>&gt;</code> were sent by the client; lines starting with <code>&lt;</code> came back from the server. This is a real capture against <code>flask --app biteful run --port 5000</code> (curl's connection notes, the lines starting with <code>*</code>, filtered out):</p>
<div class="fx" data-lang="text">$ curl -sv http://127.0.0.1:5000/v1/restaurants/10 -H 'Accept: application/json' 2&gt;&amp;1 | grep -v '^\\*'
&gt; GET /v1/restaurants/10 HTTP/1.1
&gt; Host: 127.0.0.1:5000
&gt; User-Agent: curl/8.5.0
&gt; Accept: application/json
&gt; 
&lt; HTTP/1.1 200 OK
&lt; Server: Werkzeug/3.1.9 Python/3.13.16
&lt; Date: Tue, 20 Oct 2026 00:00:20 GMT
&lt; Content-Type: application/json
&lt; Content-Length: 55
&lt; Connection: close
&lt; 
{ [55 bytes data]
{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}</div>
  <p>Read it like a letter. The first line says what you want. The next lines (<strong>headers</strong>) are labels, like "From" and "Language" on an envelope. A blank line (the lone <code>&gt;</code> and <code>&lt;</code>) ends the labels. After it comes the <strong>body</strong>: the actual content. (<code>{ [55 bytes data]</code> is curl's own note that 55 bytes of body arrived; it matches <code>Content-Length: 55</code>.)</p>
  <table class="tbl"><caption>The capture, part by part</caption>
    <tr><th>Part</th><th>Request (Asha's app)</th><th>Response (Biteful)</th></tr>
    <tr><td>Start line</td><td><code>GET /v1/restaurants/10 HTTP/1.1</code>: method, path, version</td><td><code>HTTP/1.1 200 OK</code>: version, status code, reason</td></tr>
    <tr><td>Headers</td><td>Host (which site), User-Agent (which program), Accept (format wanted)</td><td>Server, Date, Content-Type (format sent), Content-Length (body size)</td></tr>
    <tr><td>Blank line</td><td colspan="2">Ends the headers</td></tr>
    <tr><td>Body</td><td>Empty: a GET asks, it doesn't send data</td><td><code>{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}</code></td></tr>
  </table>
  <p>From Python you usually use the <code>requests</code> library instead of curl. It sends the same text and hands you the parts as Python values:</p>
<div class="fx" data-lang="py">import requests

r = requests.get("http://127.0.0.1:5000/v1/restaurants/10")
print(r.status_code)                  # did it work?
print(r.headers["Content-Type"])      # what format is the body?
print(r.text)                         # the raw text that came back
data = r.json()                       # turn JSON text into a Python dict
print(data["name"], data["rating"])

r2 = requests.get("http://127.0.0.1:5000/v1/restaurants/99")
print(r2.status_code, r2.json())</div>
<div class="fx" data-lang="text">200
application/json
{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}

Dosa Hut 4.5
404 {'error': 'restaurant not found'}</div>
  <p><code>r.text</code> ends with a newline (Flask adds one), hence the empty line. Restaurant 99 does not exist, so the server answered 404 with a small JSON error; the body still parses, so the app can show the message.</p>
  <h3>The full trip, step by step</h3>
  <p>On your laptop the client and server are on one machine. When Asha's phone calls <code>https://api.biteful.in</code>, more happens first:</p>
  <div class="flow"><span>DNS: name → IP</span><span>TCP: open a connection</span><span>TLS: set up encryption (https)</span><span>Proxy / load balancer</span><span>App routes to a function</span><span>Database work</span><span>JSON response back</span></div>
  <p><strong>DNS</strong> turns <code>api.biteful.in</code> into an IP address, like looking up a name in a phone book. <strong>TCP</strong> is the internet's reliable delivery pipe between two programs. <strong>TLS</strong> is the encryption behind <code>https</code> (<a class="xref" data-note="api_auth">Authentication &amp; Security</a>). A <strong>load balancer</strong> is a front-door program that spreads requests across several copies of the server (<a class="xref" data-note="api_production">Production Backend</a>).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>HTTP request</strong>: start line (method, path, version), headers, blank line, optional body. <strong>HTTP response</strong>: status line (version, status code, reason), headers, blank line, optional body.</p></div>
  <div class="callout intu"><span class="label">Key insight</span><p>HTTP is just structured text over a TCP connection. Every framework (Flask, FastAPI, Django) is a machine for reading that text and writing a reply.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Thinking the body is the whole answer. The status line and headers carry half the meaning: a body that says "restaurant not found" arrived with 404, and programs decide what to do from the 404, not from the words.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: methods and idempotency.</b> Every request so far started with GET, which only reads. Asha needs to <em>create</em> an order, and staff need to <em>change</em> it. How does the first word say that, and what if the network makes the app send it twice?</div>

  <h2 id="af-methods"><span class="num">04</span>Methods &amp; Idempotency</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>GET reads Dosa Hut's details. But Asha wants to place an order, and later a staff member must mark it delivered. The path alone (<code>/v1/orders</code>) cannot say whether we want to read orders or add one. And on a weak 4G signal the app may send the same request twice. Is that harmless?</p>
  </div>
  <p>The first word of every request is the <strong>method</strong> (also called the verb). It says what kind of action you want on the thing named by the path. Think of a library register: you can <em>look up</em> a book, <em>add</em> a new one, <em>replace</em> its whole entry, <em>correct</em> one field, or <em>remove</em> it. HTTP has one method for each.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Meaning</th><th>Body?</th><th>Safe</th><th>Idempotent</th><th>Biteful example</th></tr>
    <tr><td><code>GET</code></td><td>Read</td><td>No</td><td>✓</td><td>✓</td><td><code>GET /v1/restaurants/10</code></td></tr>
    <tr><td><code>POST</code></td><td>Create / run an action</td><td>Yes</td><td>✗</td><td>✗</td><td><code>POST /v1/orders</code></td></tr>
    <tr><td><code>PUT</code></td><td>Replace the whole resource</td><td>Yes</td><td>✗</td><td>✓</td><td><code>PUT /v1/restaurants/10/menu</code> (whole menu)</td></tr>
    <tr><td><code>PATCH</code></td><td>Change some fields</td><td>Yes</td><td>✗</td><td>✗ (usually)</td><td><code>PATCH /v1/orders/101 {"status":"delivered"}</code></td></tr>
    <tr><td><code>DELETE</code></td><td>Remove</td><td>No</td><td>✗</td><td>✓</td><td><code>DELETE /v1/orders/101</code></td></tr>
  </table>
  <ul>
    <li><strong>Safe</strong>: changes nothing on the server. Reading a restaurant is safe.</li>
    <li><strong>Idempotent</strong>: doing it once or five times leaves the server in the same state. "Set order 101's status to delivered" is idempotent. "Create a new order" is not.</li>
  </ul>
  <p>Why care? Because networks fail. Asha taps "Place order", the request reaches Biteful, but the reply gets lost in a tunnel. The app does not know whether the order was made, so it sends the request again (a <strong>retry</strong>). If the request was idempotent, the retry is harmless. If not, something happens twice.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A lift button is idempotent: pressing "3" five times still takes you to floor 3 once. A "Place order" button is not: five presses, five orders.</p></div>
  <p><strong>Traced by hand first.</strong> The app retries three times; each attempt sends one PATCH (set order 101 to delivered) and one POST (create an order). Before any code, predict the state:</p>
  <table class="tbl"><caption>Server state after each attempt</caption>
    <tr><th>Attempt</th><th>After PATCH status=delivered</th><th>After POST</th></tr>
    <tr><td>start</td><td>101: placed</td><td>orders 101</td></tr>
    <tr><td>1</td><td>101: delivered</td><td>101, 102</td></tr>
    <tr><td>2</td><td>101: delivered (no change)</td><td>101, 102, 103</td></tr>
    <tr><td>3</td><td>101: delivered (no change)</td><td>101, 102, 103, 104</td></tr>
  </table>
<div class="fx" data-lang="py"># The server's state: order 101 and a list of all orders
orders = [{"order_id": 101, "status": "placed"}]

def patch_status(new_status):        # PATCH /v1/orders/101 {"status": ...}: "set it to this"
    orders[0]["status"] = new_status

def post_order():                    # POST /v1/orders: "create a new order"
    orders.append({"order_id": 101 + len(orders), "status": "placed"})

for attempt in range(3):             # a flaky network: the app retries 3 times
    patch_status("delivered")
    post_order()

print("status after 3 PATCHes:", orders[0]["status"])
print("orders after 3 POSTs  :", [o["order_id"] for o in orders])</div>
<div class="fx" data-lang="text">status after 3 PATCHes: delivered
orders after 3 POSTs  : [101, 102, 103, 104]</div>
  <p>Three PATCHes: the status is "delivered", same as after one. Three POSTs: three new orders where Asha wanted one. Now the real server. Here is how <code>biteful.py</code> creates an order (the checks in the middle are section 05's business):</p>
<div class="fx" data-lang="py">@app.post("/v1/orders")
def create_order():
    key = request.headers.get("Idempotency-Key")
    if key and key in SEEN_KEYS:                     # a retry of an order we already made
        return ORDERS[SEEN_KEYS[key]], 200
    body = request.get_json(silent=True)
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
  <p>Send the identical POST twice, the way a retry would:</p>
<div class="fx" data-lang="text">$ curl -si -X POST http://127.0.0.1:5000/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]}'
HTTP/1.1 201 CREATED
Server: Werkzeug/3.1.9 Python/3.13.16
Date: Tue, 20 Oct 2026 00:00:20 GMT
Content-Type: application/json
Content-Length: 107
Location: /v1/orders/101
Connection: close

{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"placed"}

$ curl -s -X POST http://127.0.0.1:5000/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]}'
{"order_id":102,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"placed"}</div>
  <p>Two identical requests, two orders: 101 and 102, ₹480 charged for ₹240 of food. The PATCH, sent twice, ends in the same state both times:</p>
<div class="fx" data-lang="text">$ curl -s -X PATCH http://127.0.0.1:5000/v1/orders/101 -H 'Content-Type: application/json' -d '{"status": "delivered"}'
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"delivered"}

$ curl -s -X PATCH http://127.0.0.1:5000/v1/orders/101 -H 'Content-Type: application/json' -d '{"status": "delivered"}'
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"delivered"}</div>
  <p><strong>The fix for POST: an idempotency key.</strong> The app makes up one random id per tap of "Place order" and sends it in an <code>Idempotency-Key</code> header on every retry of that tap. The server remembers keys it has seen (<code>SEEN_KEYS</code> above) and, for a repeat, returns the order it already made instead of making a new one:</p>
<div class="fx" data-lang="text">$ curl -s -X POST http://127.0.0.1:5000/v1/orders -H 'Idempotency-Key: asha-7f3a' -H 'Content-Type: application/json' -d '{"restaurant_id": 11, "items": [{"name": "Chicken Biryani", "qty": 1}]}'
{"order_id":103,"restaurant_id":11,"items":[{"name":"Chicken Biryani","qty":1}],"total":350,"status":"placed"}

$ curl -s -X POST http://127.0.0.1:5000/v1/orders -H 'Idempotency-Key: asha-7f3a' -H 'Content-Type: application/json' -d '{"restaurant_id": 11, "items": [{"name": "Chicken Biryani", "qty": 1}]}'
{"order_id":103,"restaurant_id":11,"items":[{"name":"Chicken Biryani","qty":1}],"total":350,"status":"placed"}</div>
  <p>Same key, same order 103; the first reply was 201 Created and the repeat was 200 (the server log shows <code>"POST /v1/orders HTTP/1.1" 200</code> for it). Ben's biryani is ordered once, however many times the app retries.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Safe method</strong>: does not change server state (GET, HEAD, OPTIONS). <strong>Idempotent method</strong>: N identical requests leave the same state as one (GET, HEAD, PUT, DELETE, OPTIONS). <strong>Idempotency key</strong>: a client-chosen id that makes a non-idempotent request safe to retry.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Idempotent is about server <em>state</em>, not the response. A second <code>DELETE /v1/orders/101</code> may return 404 instead of 204, yet the state (order gone) is identical. And PATCH is idempotent only when it sets values; "add 1 to quantity" sent twice adds 2.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: status codes.</b> The server answered 201 to the first POST and 200 to the repeat, and earlier 404 for restaurant 99. The app must react differently to each: show the order, say "not found", or retry later. What does each number mean, and which should our server pick?</div>

  <h2 id="af-status"><span class="num">05</span>Status Codes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha's app sends <code>POST /v1/orders</code>. Many things can happen: the order is created; the JSON was cut off; she asked for 0 dosas; the order was already delivered and can't be cancelled; the server crashed. The app must decide, without reading English messages, whether to show success, fix the input, or try again later. How?</p>
  </div>
  <p>Every response starts with a three-digit <strong>status code</strong>: the server's verdict before any details. Programs read this number to decide what to do next. You only need to remember the <em>first digit</em>; the rest is detail.</p>
  <div class="cards">
    <div><b>2xx Success</b><p>It worked.</p></div>
    <div><b>3xx Redirect</b><p>Look elsewhere (or: your copy is still good).</p></div>
    <div><b>4xx Client error</b><p>You sent something wrong. Don't retry unchanged.</p></div>
    <div><b>5xx Server error</b><p>We broke. Retrying later may work.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A railway enquiry counter. "Here is your ticket" is 2xx. "Go to counter 5" is 3xx. "Your form is filled wrong" is 4xx: fix the form, then come back. "Our printer is broken" is 5xx: the problem is theirs, so trying again later may work.</p></div>
  <p><strong>Our server's verdicts, all real.</strong> Each line is one request against <code>biteful.py</code>; <code>-w ' [%{http_code}]'</code> makes curl print the status code after the body:</p>
<div class="fx" data-lang="text">$ curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:5000/v1/restaurants/10
200

$ curl -s -w ' [%{http_code}]\\n' http://127.0.0.1:5000/v1/restaurants/99
{"error":"restaurant not found"}
 [404]

$ curl -s -o /dev/null -w '%{http_code}\\n' -X DELETE http://127.0.0.1:5000/v1/restaurants/10
405

$ curl -s -w ' [%{http_code}]\\n' -X POST http://127.0.0.1:5000/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name":'
{"error":"body must be valid JSON"}
 [400]

$ curl -s -w ' [%{http_code}]\\n' -X POST http://127.0.0.1:5000/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 0}]}'
{"error":"bad item: {'name': 'Masala Dosa', 'qty': 0}"}
 [422]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH http://127.0.0.1:5000/v1/orders/101 -H 'Content-Type: application/json' -d '{"status": "cancelled"}'
{"error":"a delivered order cannot be cancelled"}
 [409]</div>
  <table class="tbl"><caption>Why each code, on Biteful</caption>
    <tr><th>Request</th><th>Code</th><th>Why this one</th></tr>
    <tr><td><code>GET /v1/restaurants/10</code></td><td>200 OK</td><td>Read succeeded; body is the restaurant</td></tr>
    <tr><td><code>POST /v1/orders</code> (section 04)</td><td>201 Created</td><td>A new resource exists; <code>Location: /v1/orders/101</code> says where</td></tr>
    <tr><td><code>GET /v1/restaurants/99</code></td><td>404 Not Found</td><td>No such resource</td></tr>
    <tr><td><code>DELETE /v1/restaurants/10</code></td><td>405 Method Not Allowed</td><td>The URL exists but has no DELETE route; Flask answered on its own</td></tr>
    <tr><td>POST with cut-off JSON <code>{"name":</code></td><td>400 Bad Request</td><td>The body cannot even be read</td></tr>
    <tr><td>POST with <code>"qty": 0</code></td><td>422 Unprocessable Content</td><td>Valid JSON, but the values break the rules</td></tr>
    <tr><td>PATCH a delivered order to cancelled</td><td>409 Conflict</td><td>The request clashes with the resource's current state</td></tr>
  </table>
  <p>The code that chose them is in <code>create_order</code> (section 04) and this <code>update_order</code>:</p>
<div class="fx" data-lang="py">@app.patch("/v1/orders/&lt;int:oid&gt;")
def update_order(oid):
    if oid not in ORDERS:
        return {"error": "order not found"}, 404
    new = (request.get_json(silent=True) or {}).get("status")
    if ORDERS[oid]["status"] == "delivered" and new == "cancelled":
        return {"error": "a delivered order cannot be cancelled"}, 409
    ORDERS[oid]["status"] = new
    return ORDERS[oid]</div>
  <p>The full list worth knowing:</p>
  <table class="tbl">
    <tr><th>Code</th><th>Name</th><th>When</th></tr>
    <tr><td>200</td><td>OK</td><td>Successful GET / PUT / PATCH</td></tr>
    <tr><td>201</td><td>Created</td><td>POST created something; add a <code>Location</code> header</td></tr>
    <tr><td>202</td><td>Accepted</td><td>Queued for later (the receipt email job in <a class="xref" data-note="api_production">Production</a>); return a job id</td></tr>
    <tr><td>204</td><td>No Content</td><td>Success with empty body (often DELETE)</td></tr>
    <tr><td>301 / 302 / 304</td><td>Moved / Found / Not Modified</td><td>Redirects; 304 = your saved copy is still fresh (section 06)</td></tr>
    <tr><td>400</td><td>Bad Request</td><td>Malformed body, e.g. broken JSON</td></tr>
    <tr><td>401</td><td>Unauthorized</td><td>Not <em>authenticated</em>: the server doesn't know who you are</td></tr>
    <tr><td>403</td><td>Forbidden</td><td>Authenticated, but not <em>allowed</em> (Ben trying to mark Dosa Hut's order delivered)</td></tr>
    <tr><td>404</td><td>Not Found</td><td>No such resource</td></tr>
    <tr><td>405</td><td>Method Not Allowed</td><td>Right URL, wrong verb</td></tr>
    <tr><td>409</td><td>Conflict</td><td>Clash with current state, or a duplicate</td></tr>
    <tr><td>422</td><td>Unprocessable Content</td><td>Valid JSON, invalid values (FastAPI's automatic validation error)</td></tr>
    <tr><td>429</td><td>Too Many Requests</td><td>Rate limit hit; send <code>Retry-After</code></td></tr>
    <tr><td>500</td><td>Internal Server Error</td><td>Unhandled exception in your code</td></tr>
    <tr><td>502 / 503 / 504</td><td>Bad Gateway / Unavailable / Gateway Timeout</td><td>A proxy can't reach a healthy, fast backend</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Status code</strong>: a three-digit number in the response's first line. The first digit is the class: 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Returning <code>200</code> with <code>{"error": "..."}</code> in the body. Monitoring, retries and caches all read the status code, so they treat the failure as success. And retrying a 4xx unchanged is pointless; retry 5xx and 429 (after waiting).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: headers and cookies.</b> A code is one number. The 201 also needed to say <em>where</em> the new order lives, a 429 must say <em>when</em> to come back, and the app would like to know whether its saved copy of the menu is still good. Where does that kind of information go?</div>

  <h2 id="af-headers"><span class="num">06</span>Headers &amp; Cookies</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Dosa Hut's menu barely changes, yet Asha's app downloads it every time she opens the restaurant. The 201 for order 101 had to say where the order lives. And after Asha logs in, how does the next request carry "this is Asha"? None of this is the body, and none of it fits in a status code.</p>
  </div>
  <p>A courier parcel has the item inside and a label outside: address, weight, "fragile". The courier reads the label, not the item. HTTP <strong>headers</strong> are that label: one line each, <code>Name: value</code>. They say how to handle the body, who is asking, and how long an answer may be reused.</p>
  <table class="tbl">
    <tr><th>Header</th><th>Direction</th><th>Job</th><th>Seen on Biteful</th></tr>
    <tr><td><code>Content-Type: application/json</code></td><td>both</td><td>Format of the body</td><td>every JSON reply; on our POSTs</td></tr>
    <tr><td><code>Accept: application/json</code></td><td>request</td><td>Format I want back</td><td>section 03's capture</td></tr>
    <tr><td><code>Location: /v1/orders/101</code></td><td>response</td><td>Where a new resource lives</td><td>the 201 in section 04</td></tr>
    <tr><td><code>Authorization: Bearer eyJ…</code></td><td>request</td><td>Who I am (a token)</td><td><a class="xref" data-note="api_auth">Auth</a> note</td></tr>
    <tr><td><code>Cache-Control: max-age=60</code></td><td>response</td><td>How long the reply may be reused</td><td>the menu, below</td></tr>
    <tr><td><code>ETag</code> / <code>If-None-Match</code></td><td>both</td><td>Version tag; enables 304</td><td>the menu, below</td></tr>
    <tr><td><code>Idempotency-Key</code></td><td>request</td><td>Make a POST safe to retry</td><td>section 04</td></tr>
    <tr><td><code>Retry-After: 30</code></td><td>response</td><td>When to try again (429/503)</td><td><a class="xref" data-note="api_production">Production</a></td></tr>
    <tr><td><code>X-Request-ID</code></td><td>both</td><td>Trace one request across logs</td><td><a class="xref" data-note="api_flask">Flask</a> hooks</td></tr>
  </table>
  <h3>ETag and 304: don't send the menu twice</h3>
  <p>An <strong>ETag</strong> works like an edition number on a newspaper. The server stamps the menu with a short fingerprint of its content. Next time the app says "I already have edition 7e71016a" (<code>If-None-Match</code>). If the menu is unchanged, the server replies <code>304 Not Modified</code> with no body. The code:</p>
<div class="fx" data-lang="py">@app.get("/v1/restaurants/&lt;int:rid&gt;/menu")
def get_menu(rid):
    if rid not in MENUS:
        return {"error": "menu not found"}, 404
    body = json.dumps(MENUS[rid])
    etag = '"' + hashlib.sha256(body.encode()).hexdigest()[:8] + '"'
    if request.headers.get("If-None-Match") == etag:
        return "", 304, {"ETag": etag}               # you already have this version
    resp = make_response(body, 200, {"Content-Type": "application/json"})
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "max-age=60"
    return resp</div>
<div class="fx" data-lang="text">$ curl -si http://127.0.0.1:5000/v1/restaurants/10/menu
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.13.16
Date: Tue, 20 Oct 2026 00:00:20 GMT
Content-Type: application/json
Content-Length: 53
ETag: "7e71016a"
Cache-Control: max-age=60
Connection: close

{"Masala Dosa": 120, "Idli": 60, "Filter Coffee": 40}
$ curl -si http://127.0.0.1:5000/v1/restaurants/10/menu -H 'If-None-Match: "7e71016a"'
HTTP/1.1 304 NOT MODIFIED
Server: Werkzeug/3.1.9 Python/3.13.16
Date: Tue, 20 Oct 2026 00:00:20 GMT
ETag: "7e71016a"
Connection: close</div>
  <p>First call: 200, 53 bytes of menu, plus <code>ETag: "7e71016a"</code> (the first 8 hex characters of the SHA-256 of the menu text) and <code>Cache-Control: max-age=60</code> (reuse it for 60 s without asking at all). Second call sent that tag back: 304, no body, no <code>Content-Length</code>. On a menu with photos that saves real data on Asha's phone plan. If Dosa Hut changes a price, the fingerprint changes, the tags stop matching, and the full menu comes back.</p>
  <h3>Cookies</h3>
  <p>HTTP forgets you after every response. So how does a website keep you logged in? The server gives the browser a small piece of text called a <strong>cookie</strong>, and the browser sends it back automatically with every later request to that site.</p>
  <div class="flow"><span>POST /v1/login</span><span>Server: Set-Cookie</span><span>Browser stores it</span><span>Browser auto-sends Cookie on every later request</span></div>
<div class="fx" data-lang="text">$ curl -si -X POST http://127.0.0.1:5000/v1/login | grep -i set-cookie
Set-Cookie: session_id=8c180e2487c73f5a; Secure; HttpOnly; Path=/; SameSite=Lax</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cookie is a cloakroom ticket. The server hands it over once; you show it every time, and the server looks up your coat.</p></div>
  <p>The words after the value are safety flags:</p>
  <ul>
    <li><code>HttpOnly</code>: JavaScript on the page can't read it. This blocks theft by <strong>XSS</strong> (cross-site scripting: an attacker sneaks a script into a page).</li>
    <li><code>Secure</code>: sent only over HTTPS (encrypted connections).</li>
    <li><code>SameSite=Lax</code>: not sent on most requests started by other websites. This blocks most <strong>CSRF</strong> (cross-site request forgery: another site tricks your browser into acting for you).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Header</strong>: a <code>Name: value</code> line of metadata on a request or response. <strong>ETag</strong>: a version identifier for a response body; with <code>If-None-Match</code> it enables <strong>conditional requests</strong> answered by 304. <strong>Cookie</strong>: a value set by <code>Set-Cookie</code> that the browser returns in a <code>Cookie</code> header.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Header names are case-insensitive (<code>content-type</code> = <code>Content-Type</code>); FastAPI and HTTP/2 print them in lower case. And a session cookie without <code>HttpOnly; Secure; SameSite</code> is an invitation to XSS and CSRF.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: JSON.</b> Headers label the body; but the body itself, <code>{"order_id":101,...}</code>, started as a Python dict on the server and must become a JavaScript object on the phone. What exactly is that text format, and what can't it carry?</div>

  <h2 id="af-json"><span class="num">07</span>JSON Serialization</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Order 101 is a Python dict in the server's memory. The network carries only bytes, and the app on Asha's phone is not Python. How does the dict become text both sides understand, and what happens to values like the order time or the ETA that a model computed?</p>
  </div>
  <p>Both sides need a common text format for data. Almost every API uses <strong>JSON</strong> (JavaScript Object Notation). It looks almost exactly like a Python dict. Turning a Python object into JSON text is <strong>serializing</strong> (packing it for the journey); turning text back into an object is <strong>deserializing</strong> (unpacking). In Python: <code>json.dumps</code> packs ("dump to string"), <code>json.loads</code> unpacks ("load from string"). Flask called <code>dumps</code> for us every time a view returned a dict.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Sending a cupboard by train. You take it apart and pack it flat (serialize), it travels, and the other side assembles it again (deserialize). Some things can't be packed flat without a special box, and those are the errors below.</p></div>
  <div class="flow"><span>Python dict</span><span>json.dumps (serialize)</span><span>JSON text on the wire</span><span>json.loads (deserialize)</span><span>dict again</span></div>
  <p><strong>Predict first.</strong> Order 101 holds a <code>True</code>, a <code>None</code> and a tuple. JSON has only six kinds of value: object, array, string, number, true/false, null. So <code>True</code> → <code>true</code>, <code>None</code> → <code>null</code>, the tuple → an array, which comes back as a <em>list</em>. A datetime (when was it placed?), a <code>Decimal</code> (money from a database), a NumPy int (an ETA from a model) and a set have no JSON type at all.</p>
<div class="fx" data-lang="py">import json, datetime, decimal
import numpy as np

order = {"order_id": 101, "paid": True, "coupon": None,
         "items": ("Masala Dosa", "Masala Dosa"), "total": 240}
s = json.dumps(order)
print(s)                         # Python -&gt; JSON text (what travels)
print(json.loads(s))             # JSON text -&gt; Python (the tuple came back as a list)

for bad in [datetime.datetime(2026, 3, 2, 12, 10), decimal.Decimal("240.00"),
            np.int64(38), {"veg", "spicy"}]:
    try:
        json.dumps({"x": bad})
    except TypeError as e:
        print("TypeError:", e)

print(json.dumps({"placed_at": datetime.datetime(2026, 3, 2, 12, 10), "eta_min": np.int64(38)},
                 default=str))
print(json.dumps({"placed_at": datetime.datetime(2026, 3, 2, 12, 10).isoformat(),
                  "eta_min": int(np.int64(38)), "total": float(decimal.Decimal("240.00"))}))</div>
<div class="fx" data-lang="text">{"order_id": 101, "paid": true, "coupon": null, "items": ["Masala Dosa", "Masala Dosa"], "total": 240}
{'order_id': 101, 'paid': True, 'coupon': None, 'items': ['Masala Dosa', 'Masala Dosa'], 'total': 240}
TypeError: Object of type datetime is not JSON serializable
TypeError: Object of type Decimal is not JSON serializable
TypeError: Object of type int64 is not JSON serializable
TypeError: Object of type set is not JSON serializable
{"placed_at": "2026-03-02 12:10:00", "eta_min": "38"}
{"placed_at": "2026-03-02T12:10:00", "eta_min": 38, "total": 240.0}</div>
  <ul>
    <li>Line 2: the round trip changed the tuple into a list. JSON cannot tell them apart.</li>
    <li>Lines 3 to 6: four types that crash <code>dumps</code>. In an API, that crash becomes a 500.</li>
    <li>Line 7: <code>default=str</code> "fixes" it by turning everything unknown into a string, so the ETA 38 became <code>"38"</code>, and the app's arithmetic breaks.</li>
    <li>Line 8: the right fix: choose the conversion. ISO-8601 text for times (<code>2026-03-02T12:10:00</code>), <code>int()</code>/<code>float()</code> for numbers.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Serialization</strong>: converting in-memory objects to a format that can be stored or sent (JSON text). <strong>Deserialization</strong>: the reverse. <strong>JSON types</strong>: object, array, string, number, boolean, null.</p></div>
  <div class="callout trap"><span class="label">Trap: ML responses</span><p><code>model.predict()</code> returns NumPy values, which crash <code>json.dumps</code>. Use <code>.tolist()</code>, <code>int(x)</code> or <code>float(x)</code>. And money as a float can show 239.99999; many APIs send money as an integer number of paise or as a string.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: REST resources and URL design.</b> We can now send any data both ways. But nothing yet says what the URLs should be called. Should listing orders be <code>/getOrders</code>, <code>/orders/list</code> or <code>/orders</code>? And what if a list has a million entries?</div>

  <h2 id="af-rest"><span class="num">08</span>REST Resources &amp; URL Design</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>HTTP gives methods and paths but does not say how to name things. One developer writes <code>/getAllRestaurants</code>, another <code>/fetch_menu?r=10</code>, a third <code>/orders/create</code>. Every client then needs a fresh manual, and caches and tools can't guess anything. Is there a shared style? And how do we return "all orders" when there are millions?</p>
  </div>
  <p><strong>REST</strong> (Representational State Transfer) is the style most APIs follow. In one line: URLs name <em>things</em> (called <strong>resources</strong>), and the HTTP method says what to do with them. The URL is a noun; the method is the verb.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school office with labelled cupboards: "Students", "Teachers", "Fees". You don't need a cupboard called "GetStudentMarks". You go to "Students", open file 42, and read, update or remove it.</p></div>
  <table class="tbl"><caption>Biteful's URLs</caption>
    <tr><th>Action</th><th>RESTful ✓</th><th>RPC-style ✗</th></tr>
    <tr><td>List restaurants</td><td><code>GET /v1/restaurants</code></td><td><code>GET /getAllRestaurants</code></td></tr>
    <tr><td>Restaurants in Pune</td><td><code>GET /v1/restaurants?city=Pune</code></td><td><code>GET /restaurantsInPune</code></td></tr>
    <tr><td>One restaurant</td><td><code>GET /v1/restaurants/10</code></td><td><code>POST /fetchRestaurant {"id":10}</code></td></tr>
    <tr><td>A restaurant's menu</td><td><code>GET /v1/restaurants/10/menu</code></td><td><code>GET /getMenu?rid=10</code></td></tr>
    <tr><td>Place an order</td><td><code>POST /v1/orders</code></td><td><code>POST /createOrder</code></td></tr>
    <tr><td>Mark delivered</td><td><code>PATCH /v1/orders/101</code></td><td><code>GET /deliverOrder?id=101</code></td></tr>
  </table>
  <p>"RPC-style" (remote procedure call) means URLs named like function calls. Rules of thumb: plural nouns for collections (<code>/restaurants</code>), an id for one member (<code>/restaurants/10</code>), nesting for "belongs to" (<code>/restaurants/10/menu</code>), query parameters for filtering, sorting and paging (<code>?city=Pune</code>).</p>
  <div class="cards">
    <div><b>Resources</b><p>Plural nouns in URLs; verbs come from the method.</p></div>
    <div><b>Uniform interface</b><p>Same methods and status codes everywhere.</p></div>
    <div><b>Cacheable</b><p>Responses say whether they can be reused (section 06).</p></div>
    <div><b>Stateless</b><p>Each request carries all it needs (section 10).</p></div>
  </div>
  <h3>Collections get big: pagination</h3>
  <p>Five restaurants fit in one reply. Biteful's order history will not. Never return a million rows in one response: return one <strong>page</strong> plus a pointer to the next. This is <strong>pagination</strong>. Our server uses a <strong>cursor</strong>: "give me up to <code>limit</code> restaurants with an id after <code>after</code>":</p>
<div class="fx" data-lang="py">@app.get("/v1/restaurants")
def list_restaurants():
    items = list(RESTAURANTS.values())
    city = request.args.get("city")
    if city:
        items = [r for r in items if r["city"] == city]
    limit = request.args.get("limit", default=20, type=int)
    after = request.args.get("after", default=0, type=int)      # cursor: last id seen
    page = [r for r in items if r["id"] &gt; after][:limit]
    nxt = page[-1]["id"] if len(page) == limit else None
    return {"items": page, "next_after": nxt}</div>
<div class="fx" data-lang="text">$ curl -s 'http://127.0.0.1:5000/v1/restaurants?limit=2'
{"items":[{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5},{"id":11,"name":"Biryani Bros","city":"Mumbai","rating":4.2}],"next_after":11}

$ curl -s 'http://127.0.0.1:5000/v1/restaurants?limit=2&amp;after=11'
{"items":[{"id":12,"name":"Pizza Point","city":"Pune","rating":3.9},{"id":13,"name":"Green Bowl","city":"Mumbai","rating":4.2}],"next_after":13}

$ curl -s 'http://127.0.0.1:5000/v1/restaurants?limit=2&amp;after=13'
{"items":[{"id":14,"name":"Momo Magic","city":"Pune","rating":null}],"next_after":null}

$ curl -s 'http://127.0.0.1:5000/v1/restaurants?city=Pune'
{"items":[{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5},{"id":12,"name":"Pizza Point","city":"Pune","rating":3.9},{"id":14,"name":"Momo Magic","city":"Pune","rating":null}],"next_after":null}</div>
  <p>Trace it: <code>limit=2</code> gives ids 10, 11 and <code>next_after: 11</code>; the app asks <code>after=11</code> and gets 12, 13; then <code>after=13</code> gives only 14, and <code>next_after: null</code> says "no more". The last call shows filtering with the same endpoint: three Pune restaurants. Momo Magic's rating is <code>null</code>, the JSON for <code>None</code>.</p>
  <p>The other style is <strong>offset</strong>: "skip the first N". It breaks when new items arrive while you scroll. Ben scrolls his order feed (newest first, 3 per page) while placing a new order:</p>
<div class="fx" data-lang="py">orders = [f"order{i}" for i in range(110, 103, -1)]   # Ben's order feed, newest first: 110 ... 104

def page_offset(offset, limit=3):                      # ?limit=3&amp;offset=...
    return orders[offset:offset + limit]

print("page 1:", page_offset(0))
orders.insert(0, "order111")                           # Ben places a new order while scrolling
print("page 2:", page_offset(3))                       # order108 shows up twice

orders = [f"order{i}" for i in range(110, 103, -1)]
def page_cursor(after=None, limit=3):                  # ?limit=3&amp;after=...
    start = orders.index(after) + 1 if after else 0
    return orders[start:start + limit]

p1 = page_cursor()
print("cursor page 1:", p1)
orders.insert(0, "order111")
print("cursor page 2:", page_cursor(after=p1[-1]))</div>
<div class="fx" data-lang="text">page 1: ['order110', 'order109', 'order108']
page 2: ['order108', 'order107', 'order106']
cursor page 1: ['order110', 'order109', 'order108']
cursor page 2: ['order107', 'order106', 'order105']</div>
  <p>With offset, the new order111 pushed everything down by one, so order108 appeared on both pages. The cursor remembered "after order108", so nothing repeated.</p>
  <table class="tbl">
    <tr><th></th><th>Offset / limit</th><th>Cursor (keyset)</th></tr>
    <tr><td>Request</td><td><code>?limit=20&amp;offset=40</code></td><td><code>?limit=20&amp;after=1840</code></td></tr>
    <tr><td>DB query</td><td><code>OFFSET 40 LIMIT 20</code> (reads and skips 40)</td><td><code>WHERE id &gt; 1840 ORDER BY id LIMIT 20</code> (index seek)</td></tr>
    <tr><td>Deep pages</td><td>Slow</td><td>Fast</td></tr>
    <tr><td>Rows inserted meanwhile</td><td>Duplicates / skips</td><td>Stable</td></tr>
    <tr><td>Jump to page 7</td><td>Yes</td><td>No</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Resource</strong>: a named thing the API exposes (a restaurant, a menu, an order), identified by a URL. <strong>Collection</strong>: a resource that lists members (<code>/v1/restaurants</code>). <strong>Pagination</strong>: returning a collection in pages with a pointer to the next.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Never change data with GET. Crawlers and browser "prefetch" open GET links on their own; a <code>GET /deliverOrder?id=101</code> link will one day be clicked by a robot. And purity has limits: an action like <code>POST /v1/orders/101/cancel</code> (which also refunds) or <code>POST /v1/eta</code> (run a model) is fine.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: versioning.</b> Once a million phones read <code>"rating": 4.5</code> from <code>/restaurants/10</code>, the URL and its shape are a promise. What do we do when the product team wants the rating as stars out of 5 with a count?</div>

  <h2 id="af-version"><span class="num">09</span>Versioning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful wants <code>rating</code> to become <code>{"stars": 4.5, "out_of": 5}</code>. Old app versions on users' phones do <code>rating * 20</code> to draw a bar; give them an object and they crash. We cannot force everyone to update on the same day. How can the old and new shapes live side by side?</p>
  </div>
  <p>A <strong>version</strong> in the URL lets both shapes exist: old apps keep calling <code>/v1/</code>, new apps call <code>/v2/</code>. That is why every Biteful path started with <code>/v1</code>. The server adds a v2 route for the changed resource:</p>
<div class="fx" data-lang="py">@app.get("/v2/restaurants/&lt;int:rid&gt;")
def get_restaurant_v2(rid):
    r = RESTAURANTS[rid]
    return {"id": r["id"], "name": r["name"], "city": r["city"],
            "rating": {"stars": r["rating"], "out_of": 5}}</div>
<div class="fx" data-lang="text">$ curl -s http://127.0.0.1:5000/v1/restaurants/10
{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}

$ curl -s http://127.0.0.1:5000/v2/restaurants/10
{"id":10,"name":"Dosa Hut","city":"Pune","rating":{"stars":4.5,"out_of":5}}</div>
  <p>Same restaurant, two shapes, both live. When analytics show nobody calls v1 any more, v1 is retired (usually after announcing a date, often with a <code>Deprecation</code> or <code>Sunset</code> header on v1 replies).</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>Looks like</th><th>Trade-off</th></tr>
    <tr><td>URL path (most common)</td><td><code>/v1/restaurants</code></td><td>Obvious, easy to route, cache and test; URLs change</td></tr>
    <tr><td>Query parameter</td><td><code>/restaurants?version=2</code></td><td>Easy to forget; messier caching</td></tr>
    <tr><td>Header</td><td><code>Accept: application/vnd.biteful.v2+json</code></td><td>Clean URLs; invisible in a browser, harder to test</td></tr>
  </table>
  <p>Which changes need a new version? <strong>Adding</strong> a field is non-breaking: old clients ignore keys they don't know. <strong>Removing, renaming, or changing the type</strong> of a field (our number → object) breaks them.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Breaking change</strong>: a change that makes existing clients fail. <strong>API versioning</strong>: serving several contract versions at once so breaking changes reach only clients that opt in.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Bumping the version for every small addition (clients drown in versions), or never versioning and "just fixing" a field (old phones crash). Version only for breaking changes, and keep the old one running for a published period.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: statelessness.</b> One server handles all of this on a laptop. Biteful in production runs many copies of the server behind a load balancer, and Asha's next request may land on a different copy. Will it still know who she is?</div>

  <h2 id="af-state"><span class="num">10</span>Statelessness</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha logs in, then asks "show my orders". With two server copies, the login might reach copy A and the next request copy B. If copy A remembered her in its own memory, what does copy B say?</p>
  </div>
  <p>Let us just try it. <code>copies.py</code> runs as two separate processes, copy A on port 5000 and copy B on port 5002 (the same code, like two server copies). It has two login styles. <strong>Stateful</strong>: the copy stores a session id in its own Python dict. <strong>Stateless</strong>: the copy hands out a token that proves itself, <code>asha.</code> plus a signature computed with a secret that all copies share (a home-made, simplified cousin of the JWT in the <a class="xref" data-note="api_auth">Auth</a> note).</p>
<div class="fx" data-lang="py"># copies.py: run twice (two "copies" of the Biteful server), compare two login styles
import hashlib, hmac, os, secrets
from flask import Flask, request

app = Flask(__name__)
COPY = os.environ["COPY"]                  # "A" or "B", just to see who answered
SECRET = b"shared-by-all-copies"           # same value on every copy
SESSIONS = {}                              # stateful: lives in THIS process only

@app.post("/stateful/login")
def stateful_login():
    sid = secrets.token_hex(4)
    SESSIONS[sid] = "asha"                 # remembered by this copy alone
    return {"session_id": sid, "copy": COPY}

@app.get("/stateful/me")
def stateful_me():
    user = SESSIONS.get(request.headers.get("X-Session", ""))
    return ({"user": user, "copy": COPY}, 200) if user else ({"error": "who are you?", "copy": COPY}, 401)

def sign(user):                            # stateless: the token proves itself
    return user + "." + hmac.new(SECRET, user.encode(), hashlib.sha256).hexdigest()[:16]

@app.post("/stateless/login")
def stateless_login():
    return {"token": sign("asha"), "copy": COPY}

@app.get("/stateless/me")
def stateless_me():
    token = request.headers.get("X-Token", "")
    user = token.split(".")[0]
    if hmac.compare_digest(token, sign(user)):
        return {"user": user, "copy": COPY}
    return {"error": "bad token", "copy": COPY}, 401</div>
<div class="fx" data-lang="text">$ COPY=A flask --app copies run --port 5000      # terminal 1
$ COPY=B flask --app copies run --port 5002      # terminal 2</div>
<div class="fx" data-lang="text">$ curl -s -X POST localhost:5000/stateful/login
{"copy":"A","session_id":"e5e6b069"}

$ curl -s -w ' [%{http_code}]\\n' localhost:5000/stateful/me -H 'X-Session: e5e6b069'
{"copy":"A","user":"asha"}
 [200]

$ curl -s -w ' [%{http_code}]\\n' localhost:5002/stateful/me -H 'X-Session: e5e6b069'
{"copy":"B","error":"who are you?"}
 [401]

$ curl -s -X POST localhost:5000/stateless/login
{"copy":"A","token":"asha.dc3fdb52f402af93"}

$ curl -s -w ' [%{http_code}]\\n' localhost:5000/stateless/me -H 'X-Token: asha.dc3fdb52f402af93'
{"copy":"A","user":"asha"}
 [200]

$ curl -s -w ' [%{http_code}]\\n' localhost:5002/stateless/me -H 'X-Token: asha.dc3fdb52f402af93'
{"copy":"B","user":"asha"}
 [200]

$ curl -s -w ' [%{http_code}]\\n' localhost:5002/stateless/me -H 'X-Token: ravi.dc3fdb52f402af93'
{"copy":"B","error":"bad token"}
 [401]</div>
  <table class="tbl"><caption>What happened</caption>
    <tr><th>Request</th><th>Copy</th><th>Result</th><th>Why</th></tr>
    <tr><td>stateful /me with session from A</td><td>A</td><td>200 asha</td><td>A's dict has the id</td></tr>
    <tr><td>same session id</td><td>B</td><td>401</td><td>B's dict is empty: the memory is in another process</td></tr>
    <tr><td>stateless /me with token</td><td>A</td><td>200 asha</td><td>signature recomputed and matches</td></tr>
    <tr><td>same token</td><td>B</td><td>200 asha</td><td>B has the same secret, so it can check the proof itself</td></tr>
    <tr><td>token edited to say ravi</td><td>B</td><td>401</td><td>the signature was made for "asha"; it doesn't match "ravi"</td></tr>
  </table>
  <p>That is statelessness: the server keeps no memory of the client between requests; each request carries what is needed to serve it (here, a token). Then any copy can answer any request, so Biteful can run 2 or 20 copies, and a copy that crashes loses nothing. Resource state (restaurants, orders) still lives in a database that all copies share; "stateless" is about per-client conversation memory.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank where any counter can serve you, because you bring your passbook every time. If only counter 3 knew you, you'd have to queue at counter 3 forever.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Stateless protocol / service</strong>: each request is self-contained; the server stores no client session between requests. Shared, durable state lives in external stores (database, Redis).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Stateless means no database" is wrong. And "sticky sessions" (the load balancer always sends Asha to copy A) only hide the problem: when copy A restarts, she is logged out. Put sessions in Redis or use signed tokens.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We now have every rule of the conversation. Before writing servers ourselves (Flask), let us see all ten ideas acting on one request.</div>

  <h2 id="af-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ten ideas, each answering one question. How do they fit together when Asha taps "Place order" once?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
    <defs><marker id="af-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="250" y="6" width="180" height="34" rx="6" class="fb sb"/><text x="340" y="28" text-anchor="middle" font-size="12">API = the contract</text>
    <line x1="340" y1="40" x2="340" y2="58" stroke="currentColor" marker-end="url(#af-c0)"/>
    <rect x="200" y="60" width="280" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="82" text-anchor="middle" font-size="12">client → URL (host, port, path) → server</text>
    <line x1="340" y1="94" x2="340" y2="112" stroke="currentColor" marker-end="url(#af-c0)"/>
    <rect x="120" y="114" width="440" height="40" rx="6" class="ft st"/><text x="340" y="132" text-anchor="middle" font-size="12">HTTP message: start line · headers · blank line · body</text><text x="340" y="147" text-anchor="middle" font-size="10" class="tm">request: METHOD path · response: STATUS CODE</text>
    <line x1="170" y1="154" x2="90" y2="186" stroke="currentColor" marker-end="url(#af-c0)"/>
    <line x1="280" y1="154" x2="250" y2="186" stroke="currentColor" marker-end="url(#af-c0)"/>
    <line x1="400" y1="154" x2="430" y2="186" stroke="currentColor" marker-end="url(#af-c0)"/>
    <line x1="510" y1="154" x2="590" y2="186" stroke="currentColor" marker-end="url(#af-c0)"/>
    <rect x="10" y="188" width="150" height="40" rx="6" class="fg sg"/><text x="85" y="205" text-anchor="middle" font-size="11">method</text><text x="85" y="220" text-anchor="middle" font-size="10" class="tm">idempotency, retries</text>
    <rect x="175" y="188" width="150" height="40" rx="6" class="fg sg"/><text x="250" y="205" text-anchor="middle" font-size="11">status code</text><text x="250" y="220" text-anchor="middle" font-size="10" class="tm">201, 404, 409, 422</text>
    <rect x="355" y="188" width="150" height="40" rx="6" class="fg sg"/><text x="430" y="205" text-anchor="middle" font-size="11">headers, cookies</text><text x="430" y="220" text-anchor="middle" font-size="10" class="tm">Location, ETag, Set-Cookie</text>
    <rect x="520" y="188" width="150" height="40" rx="6" class="fg sg"/><text x="595" y="205" text-anchor="middle" font-size="11">body = JSON</text><text x="595" y="220" text-anchor="middle" font-size="10" class="tm">dumps / loads</text>
    <rect x="60" y="250" width="180" height="40" rx="6" class="fv"/><text x="150" y="267" text-anchor="middle" font-size="11">REST: noun paths</text><text x="150" y="282" text-anchor="middle" font-size="10" class="tm">+ pagination</text>
    <rect x="250" y="250" width="180" height="40" rx="6" class="fv"/><text x="340" y="267" text-anchor="middle" font-size="11">versioning /v1 /v2</text><text x="340" y="282" text-anchor="middle" font-size="10" class="tm">the URL is a promise</text>
    <rect x="440" y="250" width="180" height="40" rx="6" class="fv"/><text x="530" y="267" text-anchor="middle" font-size="11">statelessness</text><text x="530" y="282" text-anchor="middle" font-size="10" class="tm">any copy answers</text>
    <text x="340" y="244" text-anchor="middle" font-size="10" class="tm">design rules on top of the message format</text>
  </svg><figcaption>Top to bottom: the contract travels as an HTTP message between a client and a server found by URL; the message has four parts (green); REST, versioning and statelessness (purple) are rules about how to use those parts well.</figcaption></figure>
  <p><strong>One tap, every layer.</strong> Asha taps "Place order": the app builds <code>POST /v1/orders</code> (method, versioned REST path) to <code>api.biteful.in:443</code> (URL), with <code>Content-Type: application/json</code> and an <code>Idempotency-Key</code> (headers), and a JSON body made by <code>dumps</code>. Any server copy can take it (stateless). It answers <code>201 Created</code> with <code>Location: /v1/orders/101</code> and order 101 as JSON. If the reply is lost, the retry carries the same key and gets order 101 back, not order 102.</p>
  <table class="tbl"><caption>Every concept on the running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On Biteful</th><th>When to use</th></tr>
    <tr><td>API</td><td>a contract</td><td>how does one program ask another?</td><td>list restaurants, create order</td><td>any two programs</td></tr>
    <tr><td>Client / server / port / URL</td><td>IP + port + path</td><td>where is the program?</td><td><code>127.0.0.1:5000/v1/restaurants</code>; 5099 → refused</td><td>every call</td></tr>
    <tr><td>Request / response</td><td>start line, headers, blank line, body</td><td>what travels?</td><td><code>GET /v1/restaurants/10</code> → 200, 55 bytes</td><td>debugging with <code>curl -v</code></td></tr>
    <tr><td>Methods, idempotency</td><td>the start line's first word</td><td>read or change? safe to retry?</td><td>POST ×2 → 101, 102; PATCH ×2 same; key → 103 once</td><td>choose per action; keys on POST</td></tr>
    <tr><td>Status codes</td><td>the response's first line</td><td>did it work, whose fault?</td><td>200, 201, 304, 400, 404, 405, 409, 422</td><td>every response</td></tr>
    <tr><td>Headers, cookies</td><td>name: value lines</td><td>where do labels go?</td><td>Location, ETag 7e71016a → 304, Set-Cookie</td><td>metadata, caching, auth</td></tr>
    <tr><td>JSON</td><td>dumps / loads</td><td>how does data become text?</td><td>tuple → list; datetime, Decimal, int64, set fail</td><td>every body</td></tr>
    <tr><td>REST, pagination</td><td>methods + noun URLs</td><td>what should paths be?</td><td>after=11 → 12, 13; offset repeated order108</td><td>public and internal APIs</td></tr>
    <tr><td>Versioning</td><td>a path prefix</td><td>how to change shape safely?</td><td>v1 rating 4.5; v2 {stars, out_of}</td><td>breaking changes only</td></tr>
    <tr><td>Statelessness</td><td>self-contained requests</td><td>can any copy answer?</td><td>session: B → 401; token: B → 200</td><td>anything with &gt; 1 copy</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>An API call is a text message with four parts; HTTP fixes the parts, REST and versioning say how to name and evolve them, and statelessness says each message must stand on its own.</strong> Every later note in this track is about producing, protecting or scaling exactly these messages.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="api_flask">Flask</a>, where you write the Biteful server yourself.</div>

  <h2 id="af-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: Biteful's orders API on <code>127.0.0.1:5000</code>; restaurants 10 Dosa Hut (Pune, 4.5), 11 Biryani Bros, 12 Pizza Point, 13 Green Bowl, 14 Momo Magic (rating null); Dosa Hut's menu Masala Dosa ₹120, Idli ₹60, Filter Coffee ₹40; Asha's order 101 = 2 × 120 = ₹240.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>API</td><td>how can one program ask another for data?</td><td>"list restaurants", "create order"</td><td>where do they meet? → client/server</td></tr>
    <tr><td>Client, server, port, URL</td><td>how does a request reach the right program?</td><td>port 5000 answers, 5099 refused</td><td>what travels? → HTTP message</td></tr>
    <tr><td>Request / response</td><td>what does one exchange look like?</td><td>GET line, headers, blank, body; 200 OK</td><td>only reading so far → methods</td></tr>
    <tr><td>Methods, idempotency</td><td>read vs create vs change; safe to retry?</td><td>POST twice: 101 and 102; key: 103 once</td><td>how does the client know the outcome? → status codes</td></tr>
    <tr><td>Status codes</td><td>did it work, and whose fault?</td><td>201, 404, 405, 400, 422, 409</td><td>no room for details → headers</td></tr>
    <tr><td>Headers, cookies</td><td>where do labels and memory go?</td><td>Location; ETag → 304; Set-Cookie</td><td>the body's format? → JSON</td></tr>
    <tr><td>JSON</td><td>how does a dict become text?</td><td>tuple → list; 4 types fail</td><td>what to call URLs? → REST</td></tr>
    <tr><td>REST, pagination</td><td>how to name and page resources?</td><td><code>/v1/restaurants?limit=2&amp;after=11</code></td><td>URLs become promises → versioning</td></tr>
    <tr><td>Versioning</td><td>how to change a shape safely?</td><td>v1 4.5 vs v2 {stars, out_of}</td><td>many copies → statelessness</td></tr>
    <tr><td>Statelessness</td><td>can any copy serve any request?</td><td>session 401 on copy B; token 200 on both</td><td>→ write the server: <a class="xref" data-note="api_flask">Flask</a></td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>API / web API</td><td>Agreed requests and response shapes; over HTTP</td></tr>
    <tr><td>URL</td><td><code>scheme://host:port/path?query</code>; DNS turns host into IP</td></tr>
    <tr><td>Request</td><td><code>METHOD path HTTP/1.1</code>, headers, blank line, body</td></tr>
    <tr><td>Response</td><td><code>HTTP/1.1 CODE Reason</code>, headers, blank line, body</td></tr>
    <tr><td>Safe / idempotent</td><td>Changes nothing / repeat leaves the same state</td></tr>
    <tr><td>Idempotency-Key</td><td>Client id per action; server returns the first result for repeats</td></tr>
    <tr><td>ETag / 304</td><td>Body fingerprint; <code>If-None-Match</code> equal → 304, no body</td></tr>
    <tr><td>Cookie flags</td><td>HttpOnly (no JS), Secure (HTTPS only), SameSite (limits CSRF)</td></tr>
    <tr><td>Serialization</td><td><code>json.dumps</code> object → text; <code>loads</code> text → object</td></tr>
    <tr><td>Resource / collection</td><td>A noun URL (<code>/orders/101</code>) / a list of them (<code>/orders</code>)</td></tr>
    <tr><td>Cursor pagination</td><td><code>WHERE id &gt; after ORDER BY id LIMIT n</code>; stable, fast</td></tr>
    <tr><td>Breaking change</td><td>Remove, rename or retype a field → new version</td></tr>
    <tr><td>Stateless</td><td>No per-client memory between requests; any copy can answer</td></tr>
  </table>
  <h3>Status codes in one breath</h3>
  <p>200 OK · 201 Created (+Location) · 202 Accepted (queued) · 204 No Content · 304 Not Modified · 400 unreadable body · 401 who are you? · 403 not allowed · 404 not found · 405 wrong verb · 409 conflicts with state · 422 bad values · 429 slow down (+Retry-After) · 500 our bug · 502/503/504 proxy can't reach a healthy backend.</p>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>GET for reads; POST + Idempotency-Key for creation; PATCH for field changes; 201 + Location; 4xx for client mistakes; ETag on rarely-changing data; cursor pagination for feeds; /v1 from day one; tokens or Redis sessions.</p></div>
    <div><b>Avoid</b><p>Errors with 200; GET that changes data; verbs in URLs; returning NumPy or datetime unconverted; <code>default=str</code>; offset paging on live feeds; renaming fields in place; sessions in one process's memory.</p></div>
  </div>
  <h3>Traps</h3>
  <ul>
    <li>127.0.0.1 is reachable only from the same machine; listen on 0.0.0.0 for others.</li>
    <li>Idempotent is about state, not the response (a second DELETE may say 404).</li>
    <li>401 = unauthenticated, 403 = unauthorized.</li>
    <li>JSON has no tuple, date, Decimal or set.</li>
    <li>Stateless does not mean "no database".</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>Asha's app sends the same <code>POST /v1/orders</code> twice without a key. How many orders? <em>Two (101 and 102). With the same Idempotency-Key: one.</em></li>
    <li>Which code for "qty": 0, and which for cut-off JSON? <em>422 and 400.</em></li>
    <li>The app sends <code>If-None-Match: "7e71016a"</code> and the menu is unchanged. Reply? <em>304 Not Modified, empty body.</em></li>
    <li>What does <code>json.loads(json.dumps((1, 2)))</code> give? <em>The list <code>[1, 2]</code>.</em></li>
    <li>Why did copy B answer 401 to the stateful session? <em>The session lived in copy A's memory; the request carried only an id that B had never seen.</em></li>
  </ol>

  <h2 id="af-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a client and a server? What does a port do?</summary><div class="qa-body">The client asks (app, browser, curl, Python script); the server is a program that keeps running and answers. The IP address picks the computer; the port picks which program on it gets the request (443 for the web server, 5432 for PostgreSQL). Nobody listening on the port gives "connection refused" (curl error 7).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is idempotency, and which HTTP methods have it?</summary><div class="qa-body">Making the same request once or many times leaves the server in the same state. GET, HEAD, PUT, DELETE (and OPTIONS) are idempotent; POST is not; PATCH usually isn't (e.g. "increment quantity by 1").</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PUT vs PATCH vs POST?</summary><div class="qa-body">POST creates (the server picks the id, e.g. 101) or triggers an action. PUT replaces the whole resource at a known URL, so missing fields are wiped. PATCH changes only the fields you send (<code>{"status":"delivered"}</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>401 vs 403?</summary><div class="qa-body">401: not authenticated (no or invalid credentials); log in and retry. 403: authenticated but not authorized; logging in again won't help.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A client times out on POST /orders and retries. What can go wrong and how do you fix it?</summary><div class="qa-body">The first request may have succeeded, so the customer gets two orders (we saw 101 and 102). The client sends a unique <code>Idempotency-Key</code> per action; the server stores key → result and returns the stored result for repeats (we got order 103 twice, created once).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "REST is stateless" mean? Does it mean no database?</summary><div class="qa-body">The server keeps no client session memory between requests; each request carries its own auth and context. Resource state still lives in a database. Statelessness lets any copy handle any request: our session failed on copy B while the signed token worked on both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your endpoint returns <code>{"eta": np.int64(38)}</code>. What happens?</summary><div class="qa-body">The JSON encoder raises <code>TypeError: Object of type int64 is not JSON serializable</code>, which surfaces as a 500. Convert with <code>int(x)</code>, <code>float(x)</code> or <code>arr.tolist()</code>; <code>default=str</code> would send the string "38".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Offset vs cursor pagination: which for an infinite feed of 50M orders?</summary><div class="qa-body">Cursor. <code>OFFSET 4000000</code> makes the DB walk and discard 4M rows; <code>WHERE id &gt; last_id LIMIT 20</code> seeks the index directly. Cursors also don't duplicate or skip items when new rows arrive (offset showed order108 twice).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name three ways to version an API. Which would you pick?</summary><div class="qa-body">URL path (<code>/v1/</code>), query parameter, or a header (custom or <code>Accept</code> media type). URL path is the usual default: visible, easy to route, cache and test. Bump only for breaking changes (remove, rename, retype); adding a field is safe.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design REST endpoints for "a customer's orders" and "cancel an order".</summary><div class="qa-body"><code>GET /v1/customers/{id}/orders</code> (or <code>GET /v1/orders?customer=me</code>) to list. To cancel, <code>PATCH /v1/orders/{id}</code> with <code>{"status":"cancelled"}</code>, or <code>POST /v1/orders/{id}/cancel</code> if it triggers side effects like refunds. Return 409 if it is already delivered. Never <code>GET /cancelOrder?id=</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens between typing an API URL and getting JSON back?</summary><div class="qa-body">DNS resolves the host to an IP; a TCP connection opens (plus a TLS handshake for HTTPS); the client sends method, path, headers and body; a proxy/load balancer forwards it to an app server; the framework routes it to a handler, which may query a DB; the result is serialized to JSON and sent back with a status code and headers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do status codes need headers to be useful?</summary><div class="qa-body">A code is one number: it says "created", "slow down" or "not modified", but not where, when or which version. 201 needs <code>Location</code> to say where order 101 lives; 429 needs <code>Retry-After</code>; 304 only makes sense because the client sent <code>If-None-Match</code> with an ETag. Code = verdict, headers = the details the verdict refers to.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does idempotency matter more once the API is stateless and has many copies?</summary><div class="qa-body">With many copies behind a load balancer, retries are routine: a proxy or the client retries on a timeout, and the retry may land on a different copy. No copy remembers "I already did this" in memory, so the protection must travel with the request (an Idempotency-Key) and be checked against shared storage. Idempotent methods (PUT, PATCH-set, DELETE) need nothing extra.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip versioning and just rename <code>rating</code> to <code>stars</code>?</summary><div class="qa-body">Every installed app that reads <code>rating</code> gets nothing (or crashes) until its user updates, which some never do. The URL and JSON shape are a contract (section 01); versioning is how you keep the old contract alive while offering a new one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do REST resources and HTTP methods divide the work?</summary><div class="qa-body">The path names <em>what</em> (<code>/v1/orders/101</code>), the method says <em>what to do</em> (GET read, PATCH change, DELETE remove). Because the verbs are standard, clients, caches and proxies know without documentation that GET is safe and cacheable and that PUT/DELETE may be retried; verbs hidden in paths (<code>/deliverOrder</code>) throw that knowledge away.</div></details>
</main>
`
});
