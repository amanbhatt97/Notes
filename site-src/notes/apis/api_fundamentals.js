// notes/apis/api_fundamentals.js — HTTP & REST Fundamentals
Object.assign(TOPIC_CONTENT, {
  "api_fundamentals": `<main>
  <h1>HTTP &amp; REST Fundamentals</h1>
  <p class="lead">A model nobody can call is a model nobody uses. This page covers the language every API speaks (HTTP) and the house style most of them follow (REST), so the Flask and FastAPI pages make sense.</p>

  <h2 id="af-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">HTTP &amp; REST</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">API basics</div>
        <ul>
          <li><b>API</b> — contract for asking another program for work</li>
          <li><b>Web API</b> — that contract over HTTP, usually JSON</li>
          <li>💡 waiter: fixed menu, you never enter the kitchen</li>
          <li><b>Benefit</b> — swap the model/DB behind it; clients don't change</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">HTTP message</div>
        <ul>
          <li><b>Request</b> — <code>GET /api/v1/products/11 HTTP/1.1</code> + headers + body</li>
          <li><b>Response</b> — <code>HTTP/1.1 200 OK</code> + headers + body</li>
          <li><b>Blank line</b> separates headers and body; it's all plain text over TCP</li>
          <li><b>Full trip</b> — DNS → TCP → TLS → proxy → app → handler → JSON back</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Methods</div>
        <ul>
          <li><b>GET</b> read · <b>POST</b> create/action · <b>PUT</b> replace · <b>PATCH</b> partial · <b>DELETE</b> remove</li>
          <li><b>Safe</b> — no state change (GET, HEAD)</li>
          <li><b>Idempotent</b> — repeat = same state (GET, PUT, DELETE); POST is not</li>
          <li>⚠ Retried POST double-charges → <code>Idempotency-Key</code> header</li>
          <li>⚠ Idempotent ≠ same response (2nd DELETE may 404)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Status codes</div>
        <ul>
          <li><b>2xx</b> — 200 OK, 201 Created (+Location), 202 Accepted (queued), 204 No Content</li>
          <li><b>4xx</b> — 400 bad body, 401 who are you, 403 not allowed, 404, 405 wrong verb, 409 conflict, 422 invalid values, 429 slow down</li>
          <li><b>5xx</b> — 500 bug, 502/503/504 proxy can't reach healthy backend</li>
          <li>⚠ Never return errors with 200</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Headers &amp; cookies</div>
        <ul>
          <li><b>Content-Type / Accept</b> — body format sent / wanted</li>
          <li><b>Authorization: Bearer …</b> — credentials</li>
          <li><b>Cache-Control, ETag → 304</b> — caching</li>
          <li><b>Retry-After</b> with 429/503; <b>X-Request-ID</b> for tracing</li>
          <li><b>Cookie</b> — server <code>Set-Cookie</code>, browser auto-sends; flags <code>HttpOnly; Secure; SameSite</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JSON</div>
        <ul>
          <li><b>Types</b> — object, array, string, number, bool, null</li>
          <li><b>dumps / loads</b> — serialize / deserialize; tuple → list, None → null</li>
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
          <li>⚠ Never mutate via GET (crawlers/prefetch trigger it)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Versioning &amp; pagination</div>
        <ul>
          <li><b>Versioning</b> — URL <code>/v1/</code> (default), query param, or header</li>
          <li>Add field = safe; rename/remove/retype = new version</li>
          <li><b>Offset</b> — <code>?limit=20&amp;offset=40</code>; jump to page; slow deep, skips on inserts</li>
          <li><b>Cursor</b> — <code>WHERE id &gt; last LIMIT 20</code>; fast, stable; no page jumps</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="af-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What an API Is</span><span class="rm-sub">The waiter between you and the kitchen</span></div></div>
      <div class="rm-item rm-done" data-target="af-cycle"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Request → Response</span><span class="rm-sub">A raw exchange, byte by byte</span></div></div>
      <div class="rm-item rm-done" data-target="af-methods"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Methods &amp; Idempotency</span><span class="rm-sub">GET, POST, PUT, PATCH, DELETE</span></div></div>
      <div class="rm-item rm-done" data-target="af-status"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Status Codes</span><span class="rm-sub">The 15 that matter</span></div></div>
      <div class="rm-item rm-done" data-target="af-headers"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Headers &amp; Cookies</span><span class="rm-sub">Metadata on every message</span></div></div>
      <div class="rm-item rm-done" data-target="af-json"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">JSON Serialization</span><span class="rm-sub">Python objects ⇄ text</span></div></div>
      <div class="rm-item rm-done" data-target="af-rest"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">REST Principles</span><span class="rm-sub">Resources, verbs, statelessness</span></div></div>
      <div class="rm-item rm-done" data-target="af-version"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Versioning &amp; Pagination</span><span class="rm-sub">Change safely, return in pages</span></div></div>
      <div class="rm-item rm-done" data-target="af-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="af-what"><span class="num">01</span>What an API Is</h2>
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
  </svg><figcaption>An API is a contract: a fixed menu of requests and the shape of each answer.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p><strong>API</strong> (Application Programming Interface): the agreed way one program asks another for work. A <strong>web API</strong> does it over HTTP.</p></div>
  <p>The kitchen can swap chefs (retrain the model, change databases) without the customer noticing, as long as the menu stays the same.</p>
  <div class="callout anlg"><span class="label">Where the analogy breaks</span><p>A real waiter remembers you. A REST API does not: every request must carry everything needed, including who you are.</p></div>

  <h2 id="af-cycle"><span class="num">02</span>Request → Response</h2>
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
  </svg><figcaption>One request in, one response out. The connection carries nothing else between calls.</figcaption></figure>
  <p>A real exchange with a small Flask server, captured with <code>curl -v</code> (<code>&gt;</code> = sent, <code>&lt;</code> = received):</p>
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
  <table class="tbl">
    <tr><th>Part</th><th>Request</th><th>Response</th></tr>
    <tr><td>Start line</td><td><code>GET /api/v1/products/11 HTTP/1.1</code> (method, path, version)</td><td><code>HTTP/1.1 200 OK</code> (version, status)</td></tr>
    <tr><td>Headers</td><td>Host, Accept, User-Agent</td><td>Content-Type, Content-Length, Date</td></tr>
    <tr><td>Blank line</td><td colspan="2">Separates headers from body</td></tr>
    <tr><td>Body</td><td>Empty for GET</td><td>The JSON</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>HTTP is just structured text over a TCP connection. Every framework (Flask, FastAPI, Django) is a machine for parsing that text and writing a reply.</p></div>

  <h2 id="af-methods"><span class="num">03</span>Methods &amp; Idempotency</h2>
  <table class="tbl">
    <tr><th>Method</th><th>Meaning</th><th>Body?</th><th>Safe</th><th>Idempotent</th><th>Example</th></tr>
    <tr><td><code>GET</code></td><td>Read</td><td>No</td><td>✓</td><td>✓</td><td><code>GET /products/11</code></td></tr>
    <tr><td><code>POST</code></td><td>Create / run an action</td><td>Yes</td><td>✗</td><td>✗</td><td><code>POST /predict</code>, <code>POST /orders</code></td></tr>
    <tr><td><code>PUT</code></td><td>Replace whole resource</td><td>Yes</td><td>✗</td><td>✓</td><td><code>PUT /products/11</code></td></tr>
    <tr><td><code>PATCH</code></td><td>Change some fields</td><td>Yes</td><td>✗</td><td>✗ (usually)</td><td><code>PATCH /products/11 {"price":450}</code></td></tr>
    <tr><td><code>DELETE</code></td><td>Remove</td><td>No</td><td>✗</td><td>✓</td><td><code>DELETE /products/11</code></td></tr>
  </table>
  <ul>
    <li><strong>Safe</strong>: does not change server state.</li>
    <li><strong>Idempotent</strong>: doing it once or five times leaves the server in the same state.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A lift button is idempotent: pressing "3" five times still takes you to floor 3 once. A "buy" button is not: five presses, five orders.</p></div>
  <div class="callout trap"><span class="label">Trap: retries</span><p>Networks time out, and clients retry. Retrying an idempotent call is harmless; retrying <code>POST /payments</code> can charge twice. Fix: the client sends an <code>Idempotency-Key</code> header and the server ignores repeats of the same key.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Idempotent is about server <em>state</em>, not the response. A second <code>DELETE</code> may return 404 instead of 204, yet the state (item gone) is identical.</p></div>

  <h2 id="af-status"><span class="num">04</span>Status Codes</h2>
  <div class="cards">
    <div><b>2xx Success</b><p>It worked.</p></div>
    <div><b>3xx Redirect</b><p>Look elsewhere.</p></div>
    <div><b>4xx Client error</b><p>You sent something wrong. Don't retry unchanged.</p></div>
    <div><b>5xx Server error</b><p>We broke. Retry later may work.</p></div>
  </div>
  <table class="tbl">
    <tr><th>Code</th><th>Name</th><th>When</th></tr>
    <tr><td>200</td><td>OK</td><td>Successful GET / PUT / PATCH, or a prediction</td></tr>
    <tr><td>201</td><td>Created</td><td>POST created something; add a <code>Location</code> header</td></tr>
    <tr><td>202</td><td>Accepted</td><td>Queued for later (async job); return a job id</td></tr>
    <tr><td>204</td><td>No Content</td><td>Success with empty body (often DELETE)</td></tr>
    <tr><td>301 / 302 / 304</td><td>Moved / Found / Not Modified</td><td>Redirects; 304 = your cached copy is still fresh</td></tr>
    <tr><td>400</td><td>Bad Request</td><td>Malformed body, e.g. broken JSON</td></tr>
    <tr><td>401</td><td>Unauthorized</td><td>Not <em>authenticated</em>: missing or bad credentials</td></tr>
    <tr><td>403</td><td>Forbidden</td><td>Authenticated, but not <em>allowed</em></td></tr>
    <tr><td>404</td><td>Not Found</td><td>No such resource</td></tr>
    <tr><td>405</td><td>Method Not Allowed</td><td>Right URL, wrong verb</td></tr>
    <tr><td>409</td><td>Conflict</td><td>Duplicate, or a version clash</td></tr>
    <tr><td>422</td><td>Unprocessable Content</td><td>Valid JSON, invalid values (FastAPI's validation error)</td></tr>
    <tr><td>429</td><td>Too Many Requests</td><td>Rate limit hit; send <code>Retry-After</code></td></tr>
    <tr><td>500</td><td>Internal Server Error</td><td>Unhandled exception in your code</td></tr>
    <tr><td>502 / 503 / 504</td><td>Bad Gateway / Unavailable / Gateway Timeout</td><td>Proxy can't reach a healthy, fast backend</td></tr>
  </table>
  <p>Real responses from the same server (repeated headers trimmed):</p>
  <div class="fx" data-lang="text">$ curl -i -X POST localhost:5001/api/v1/products -H 'Content-Type: application/json' -d '{"name":"Mouse","price":25}'
HTTP/1.1 201 CREATED
Content-Type: application/json
Location: /api/v1/products/15

{"id":15,"name":"Mouse","price":25}

$ curl -i localhost:5001/api/v1/products/99           →  HTTP/1.1 404 NOT FOUND   {"error":"product not found"}
$ curl -i -X DELETE localhost:5001/api/v1/products/10 →  HTTP/1.1 405 METHOD NOT ALLOWED
$ curl -i -X POST ... -d '{"name":'                  →  HTTP/1.1 400 BAD REQUEST</div>
  <div class="callout trap"><span class="label">Trap</span><p>Returning <code>200</code> with <code>{"error": "..."}</code> in the body. Monitoring, retries and caches all read the status code, so they will treat the failure as success.</p></div>

  <h2 id="af-headers"><span class="num">05</span>Headers &amp; Cookies</h2>
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
  <h3>Cookies</h3>
  <div class="flow"><span>POST /login</span><span>Server: Set-Cookie</span><span>Browser stores it</span><span>Browser auto-sends Cookie on every later request</span></div>
  <div class="fx" data-lang="text">$ curl -si -X POST localhost:5001/login | grep -i set-cookie
Set-Cookie: session_id=abc123; Secure; HttpOnly; Path=/; SameSite=Lax</div>
  <ul>
    <li><code>HttpOnly</code>: JavaScript can't read it (blocks theft by XSS).</li>
    <li><code>Secure</code>: sent only over HTTPS.</li>
    <li><code>SameSite=Lax</code>: not sent on most cross-site requests (blocks CSRF).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cookie is a cloakroom ticket. The server hands it over once; you show it every time, and the server looks up your coat.</p></div>

  <h2 id="af-json"><span class="num">06</span>JSON Serialization</h2>
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
    <li>JSON has only: object, array, string, number, true/false, null. Tuples become lists; <code>None</code> becomes <code>null</code>.</li>
    <li>Dates, sets, <code>Decimal</code> and NumPy types fail by default.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: ML responses</span><p><code>model.predict()</code> returns NumPy values, which crash <code>json.dumps</code>. Use <code>.tolist()</code> or <code>float(x)</code>. <code>default=str</code> "works" but turns the number 3 into the string <code>"3"</code>.</p></div>

  <h2 id="af-rest"><span class="num">07</span>REST Principles</h2>
  <p><strong>REST</strong> (Representational State Transfer): a style where URLs name <em>things</em> (resources) and HTTP methods say what to do to them.</p>
  <table class="tbl">
    <tr><th>Action</th><th>RESTful ✓</th><th>RPC-style ✗</th></tr>
    <tr><td>List products</td><td><code>GET /products</code></td><td><code>GET /getAllProducts</code></td></tr>
    <tr><td>One product</td><td><code>GET /products/11</code></td><td><code>POST /fetchProduct {"id":11}</code></td></tr>
    <tr><td>Create</td><td><code>POST /products</code></td><td><code>POST /createProduct</code></td></tr>
    <tr><td>A customer's orders</td><td><code>GET /customers/1/orders</code></td><td><code>GET /getOrdersForCustomer?c=1</code></td></tr>
    <tr><td>Delete</td><td><code>DELETE /products/11</code></td><td><code>GET /deleteProduct?id=11</code></td></tr>
  </table>
  <div class="cards">
    <div><b>Resources</b><p>Plural nouns in URLs; verbs come from the method.</p></div>
    <div><b>Stateless</b><p>Each request carries all it needs (token, params). The server keeps no per-client memory between calls.</p></div>
    <div><b>Uniform interface</b><p>Same methods and status codes everywhere.</p></div>
    <div><b>Cacheable</b><p>Responses say whether they can be reused.</p></div>
  </div>
  <div class="callout intu"><span class="label">Why statelessness matters</span><p>If no server remembers you, any server can answer you. That is what lets you run 10 copies behind a load balancer (see <em>Production Backend</em>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Purity has limits. <code>POST /predict</code> is an action, not a resource, and that is fine. Interviewers want you to know the rules <em>and</em> when to bend them.</p></div>

  <h2 id="af-version"><span class="num">08</span>Versioning &amp; Pagination</h2>
  <h3>Versioning</h3>
  <p>Once clients depend on a response shape, renaming a field breaks them. Versions let old and new coexist.</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>Looks like</th><th>Trade-off</th></tr>
    <tr><td>URL path (most common)</td><td><code>/api/v1/products</code></td><td>Obvious, easy to route and cache; URLs change</td></tr>
    <tr><td>Query param</td><td><code>/products?version=2</code></td><td>Easy to forget; messier caching</td></tr>
    <tr><td>Header</td><td><code>Accept: application/vnd.shop.v2+json</code></td><td>Clean URLs; invisible in browser, harder to test</td></tr>
  </table>
  <p>Adding a field is non-breaking. Removing or renaming one, or changing a type, needs a new version.</p>
  <h3>Pagination</h3>
  <p>Never return 10 million rows in one response. Return a page plus a pointer to the next.</p>
  <div class="fx" data-lang="text">$ curl 'localhost:5001/api/v1/products?limit=2&amp;offset=0'
{"items":[{"id":10,"name":"Laptop","price":800},{"id":11,"name":"Phone","price":500}],"next_offset":2,"total":5}</div>
  <table class="tbl">
    <tr><th></th><th>Offset / limit</th><th>Cursor (keyset)</th></tr>
    <tr><td>Request</td><td><code>?limit=20&amp;offset=40</code></td><td><code>?limit=20&amp;after=id_1840</code></td></tr>
    <tr><td>DB query</td><td><code>OFFSET 40 LIMIT 20</code> (scans and skips 40)</td><td><code>WHERE id &gt; 1840 ORDER BY id LIMIT 20</code> (index seek)</td></tr>
    <tr><td>Deep pages</td><td>Slow</td><td>Fast</td></tr>
    <tr><td>Rows inserted meanwhile</td><td>Duplicates / skips</td><td>Stable</td></tr>
    <tr><td>Jump to page 7</td><td>Yes</td><td>No</td></tr>
  </table>

  <h2 id="af-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
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
