// notes/apis/api_flask.js — Flask
Object.assign(TOPIC_CONTENT, {
  "api_flask": `<main>
  <h1>Flask</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>Flask</span></div>
  <p class="lead">In <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a> you poked at a Biteful server that was handed to you. Now you write it. Flask is the smallest Python library that turns ordinary functions into URLs: a few lines and Asha's app can list restaurants and place order 101. This note builds the Biteful orders API one need at a time: the app object, routes, the request and response objects, hooks and error handlers that wrap every request, Jinja2 templates for the restaurant staff page, blueprints and an app factory for structure, a delivery-time model behind <code>/v1/eta</code>, tests that run without a server, and finally the two limits that send us to FastAPI: every check is written by hand, and a sync worker can only wait for one thing at a time. Every block was run (Flask 3.1, Werkzeug 3.1, gunicorn 26); outputs are pasted as they came.</p>

  <h2 id="fl-fits" class="open"><span class="num">★</span>Where this fits</h2>
<figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="fl-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="69" y="42" text-anchor="middle" font-size="12">1 HTTP &amp; REST</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the conversation</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="206" y="42" text-anchor="middle" font-size="12" font-weight="700">2 Flask</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">write the server</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="343" y="42" text-anchor="middle" font-size="12">3 FastAPI</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">validation, docs, async</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="480" y="42" text-anchor="middle" font-size="12">4 Auth &amp; Security</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">who may call</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="614" y="42" text-anchor="middle" font-size="12">5 Production</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">many copies, watched</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#fl-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#fl-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#fl-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#fl-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: the Biteful orders API</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">GET /restaurants · POST /orders · customers vs restaurant staff · a slow receipt email on a queue</text>
  </svg><figcaption>The APIs &amp; Backend track in reading order. You are on the green note. Each note starts from a weakness the one before it leaves.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a></b><span>You know what a request and response look like, which method and status code to use, why bodies are JSON and why URLs are nouns under <code>/v1</code>. What was missing: you could only <em>call</em> a server. You need Python <a class="xref" data-note="py_decorators">decorators</a> (the <code>@</code> lines) and <a class="xref" data-note="py_dicts_sets">dicts</a>.</span></li>
    <li><b>This note adds: writing the server</b><span>The app, routes and converters, <code>request</code> and return values, <code>before_request</code>/<code>after_request</code> hooks, JSON error handlers, Jinja2 templates and auto-escaping, blueprints and <code>create_app()</code>, serving a scikit-learn model, <code>test_client</code> with pytest, and WSGI's sync limits measured with gunicorn.</span></li>
    <li><b>Leads to: <a class="xref" data-note="api_fastapi">FastAPI</a></b><span>Twelve of the 23 lines in our order view are hand-written checks, and they stop at the first error; one sync worker served 3 simultaneous orders in 3.02 s. FastAPI generates the checks from type hints and serves waiting requests concurrently. After FastAPI: <a class="xref" data-note="api_auth">Auth</a>, then <a class="xref" data-note="api_production">Production</a> (where gunicorn and the receipt email return).</span></li>
  </ol>

  <h2 id="fl-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Running example: the Biteful orders API (Dosa Hut 10, Biryani Bros 11, Pizza Point 12), Asha's order 101 of 2 Masala Dosas = ₹240, Ben's order 102 of 1 Idli = ₹60.</p>
  <ol class="story">
    <li><b>The app</b><span>Q: how do I write a server without handling sockets and raw text myself? → <code>app = Flask(__name__)</code> receives every request; you write only the functions. But how does Flask know which function a request wants?</span></li>
    <li><b>Routes</b><span>Q: which function runs for <code>GET /v1/restaurants/11</code>? → <code>@app.get("/v1/restaurants/&lt;int:rid&gt;")</code> maps URL patterns to view functions; <code>&lt;int:&gt;</code> turns <code>/abc</code> into a 404 automatically; wrong verb → 405. Then how does the function read the body and choose a status?</span></li>
    <li><b>Request and response objects</b><span>Q: how do I read input and shape output? → <code>request.args</code>, <code>request.get_json()</code>, <code>request.headers</code>; return a dict, or <code>(body, 201, headers)</code>. Order 101 → 201 + Location. But 12 of 23 lines are checks, and timing or JSON errors would be repeated in every view…</span></li>
    <li><b>Hooks and error handlers</b><span>Q: how do I run code around <em>every</em> request? → <code>before_request</code>/<code>after_request</code> stamp <code>X-Request-ID</code> and log the time; <code>errorhandler</code> turns 404, 405 and a crash (KeyError on menu 12) into JSON. Staff want an HTML page, not JSON…</span></li>
    <li><b>Templates</b><span>Q: how do I build HTML from data safely? → Jinja2: <code>{% for o in orders %}</code>; Ben's note <code>&lt;script&gt;</code> came out as harmless text. One file now holds the customer API and the staff pages…</span></li>
    <li><b>Blueprints and the app factory</b><span>Q: how do I split the app and make fresh copies for tests? → <code>Blueprint("api", url_prefix="/v1")</code>, <code>Blueprint("staff", url_prefix="/staff")</code>, <code>create_app()</code>. Biteful also wants a delivery-time estimate from a model…</span></li>
    <li><b>Serving a model</b><span>Q: how does a trained model answer requests? → Load <code>eta.joblib</code> once in <code>create_app</code>; <code>/v1/eta</code> for 3.2 km, 2 items → 12.68 + 4.03 × 3.2 + 3.02 × 2 = 31.6 min; <code>float()</code> before JSON. How do we know all this keeps working?</span></li>
    <li><b>Testing</b><span>Q: how do I check every endpoint in seconds? → <code>app.test_client()</code> + pytest: 8 passed, no server started. What can't Flask do well?</span></li>
    <li><b>The limits</b><span>Q: what happens under real load and real input? → One sync worker: 3 orders with a 1 s receipt email took 3.02 s; threads help (1.01 s) until they run out (12 orders: 4.02 s). Validation is manual and reports one error at a time. → FastAPI.</span></li>
  </ol>

  <h2 id="fl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Flask</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">App &amp; routing</div>
        <ul>
          <li><b>App</b> — <code>app = Flask(__name__)</code>; receives every request</li>
          <li><b>Route</b> — <code>@app.get("/v1/restaurants/&lt;int:rid&gt;")</code>: URL → view function</li>
          <li><b>Converters</b> — <code>&lt;int:rid&gt;</code>: <code>/abc</code> → 404 before your code</li>
          <li>No route → 404; wrong verb → 405 (automatic)</li>
          <li><b>url_map</b> — the routing table Flask built</li>
          <li>⚠ <code>debug=True</code> in prod = remote code execution</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Request &amp; response</div>
        <ul>
          <li><b>In</b> — path args, <code>request.args</code>, <code>request.get_json(silent=True)</code>, <code>request.headers</code>, <code>request.files</code></li>
          <li><b>Out</b> — dict → JSON 200; <code>(body, 201, {"Location": ...})</code></li>
          <li>⚠ No validation built in: 12 of 23 lines are checks</li>
          <li>⚠ <code>type=float</code> silently falls back to the default</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hooks &amp; errors</div>
        <ul>
          <li><b>before_request</b> — timer, request id, auth; can short-circuit</li>
          <li><b>after_request</b> — add headers, log</li>
          <li><b>g</b> — per-request scratchpad</li>
          <li><b>errorhandler(404 / 405 / Exception / BadInput)</b> — JSON, not HTML</li>
          <li>💡 airport security in, customs out</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Templates &amp; structure</div>
        <ul>
          <li><b>Jinja2</b> — <code>{{ var }}</code>, <code>{% for %}…{% else %}</code>; auto-escapes → no XSS</li>
          <li><b>Blueprint</b> — route group + prefix: <code>/v1</code>, <code>/staff</code></li>
          <li><b>App factory</b> — <code>create_app(config)</code>: config, model, blueprints</li>
          <li><b>Flask-RESTful</b> — class per resource (legacy)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Serving a model</div>
        <ul>
          <li><b>Train offline</b> → <code>joblib.dump</code> model + features + version</li>
          <li><b>Load once</b> in <code>create_app</code>, never per request</li>
          <li><b>/v1/eta</b> — 3.2 km, 2 items → 31.6 min</li>
          <li>⚠ <code>float()</code> NumPy values; pickle = trusted files only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Testing &amp; limits</div>
        <ul>
          <li><b>test_client()</b> — in-process; fixture + parametrize → 8 passed</li>
          <li><b>WSGI</b> — one request per worker thread at a time</li>
          <li>1 worker: 3 × 1 s → <b>3.02 s</b>; 3 threads → <b>1.01 s</b>; 12 orders → <b>4.02 s</b></li>
          <li><b>FastAPI</b> for new JSON APIs, many waits, auto validation and docs</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="fl-app"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Write a Server: the App</span><span class="rm-sub">A function becomes a URL</span></div></div>
      <div class="rm-item rm-done" data-target="fl-routes"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Routes</span><span class="rm-sub">Paths, converters, methods</span></div></div>
      <div class="rm-item rm-done" data-target="fl-req"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Request &amp; Response Objects</span><span class="rm-sub">Reading input, shaping output</span></div></div>
      <div class="rm-item rm-done" data-target="fl-mw"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Hooks &amp; Error Handlers</span><span class="rm-sub">Code around every request</span></div></div>
      <div class="rm-item rm-done" data-target="fl-tpl"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Templates</span><span class="rm-sub">Jinja2 and auto-escaping</span></div></div>
      <div class="rm-item rm-done" data-target="fl-bp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Blueprints &amp; App Factory</span><span class="rm-sub">Structure for a real app</span></div></div>
      <div class="rm-item rm-done" data-target="fl-ml"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Serving a Model</span><span class="rm-sub">Train → joblib → /v1/eta</span></div></div>
      <div class="rm-item rm-done" data-target="fl-test"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Testing</span><span class="rm-sub">test_client + pytest</span></div></div>
      <div class="rm-item rm-done" data-target="fl-sync"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Limits</span><span class="rm-sub">Sync workers, hand validation</span></div></div>
      <div class="rm-item rm-done" data-target="fl-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One request through the app</span></div></div>
      <div class="rm-item rm-done" data-target="fl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="fl-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="fl-app"><span class="num">01</span>Write a Server: the App</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The fundamentals note showed what a server does: wait on a port, read the request text, pick the right code, write the response text. Writing that yourself means sockets, parsing headers, building status lines. We only want to write "when someone asks for restaurants, return this list". How?</p>
  </div>
  <p>Flask does the waiting, reading and writing. You write the "return this list" part as normal Python functions and tell Flask which URL belongs to which function. Here is a complete server for Biteful's first question:</p>
<div class="fx" data-lang="py"># s1_hello.py: a whole web server
from flask import Flask

app = Flask(__name__)                    # the app: one object that receives every request

@app.get("/v1/restaurants")              # route: "when someone GETs this path, run the function"
def list_restaurants():                  # the view function
    return {"items": [{"id": 10, "name": "Dosa Hut"}, {"id": 11, "name": "Biryani Bros"}]}

if __name__ == "__main__":
    print(app.url_map)                   # the routing table Flask built from the decorators</div>
  <ul>
    <li><code>app = Flask(__name__)</code> creates the <strong>application object</strong>. Every request goes to it first. <code>__name__</code> tells Flask where your file is, so it can find templates later.</li>
    <li><code>@app.get("/v1/restaurants")</code> is a <strong>route</strong>: it registers the function below it for GET requests to that path. The <code>@</code> line is a <a class="xref" data-note="py_decorators">decorator</a>: a label that hands the function to Flask.</li>
    <li>The function is a <strong>view function</strong>. Return a dict and Flask turns it into a JSON response with status 200.</li>
  </ul>
  <p>Running the file directly prints the routing table that the decorator built:</p>
<div class="fx" data-lang="text">$ python s1_hello.py</div>
<div class="fx" data-lang="text">Map([&lt;Rule '/static/&lt;filename&gt;' (HEAD, GET, OPTIONS) -&gt; static&gt;,
 &lt;Rule '/v1/restaurants' (HEAD, GET, OPTIONS) -&gt; list_restaurants&gt;])</div>
  <p>Two rules: ours, and <code>/static/&lt;filename&gt;</code>, which Flask adds for serving files. Each rule lists its methods: GET (ours), plus HEAD and OPTIONS that Flask answers for free. Now start the server and call it:</p>
<div class="fx" data-lang="text">$ flask --app s1_hello run --port 5001        # starts the development server; it waits for requests</div>
<div class="fx" data-lang="text">$ curl -s localhost:5001/v1/restaurants
{"items":[{"id":10,"name":"Dosa Hut"},{"id":11,"name":"Biryani Bros"}]}

$ curl -s -w ' [%{http_code}]\\n' localhost:5001/v1/menus
&lt;!doctype html&gt;
&lt;html lang=en&gt;
&lt;title&gt;404 Not Found&lt;/title&gt;
&lt;h1&gt;Not Found&lt;/h1&gt;
&lt;p&gt;The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.&lt;/p&gt;
 [404]</div>
  <p>The first call matched our rule. The second matched nothing, so Flask answered 404 by itself, with an HTML page (fine for browsers, awkward for Asha's app; section 04 fixes it).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hospital reception. Each patient (request) says which department they need (the path). Reception (Flask) sends them to the right doctor (your function). You only write the doctors; Flask runs the reception.</p></div>
  <div class="flow"><span>HTTP request</span><span>WSGI server (flask run / gunicorn)</span><span>Flask app</span><span>URL map → view function</span><span>Response</span></div>
  <p>Flask itself does not open the port. A separate program, the <strong>WSGI server</strong>, does that and hands each request to Flask. <code>flask run</code> starts a small built-in one for development; in production you use <code>gunicorn</code> (section 09 and <a class="xref" data-note="api_production">Production Backend</a>).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Flask application</strong>: the object that holds routes and configuration and handles every request. <strong>View function</strong>: a function registered for a URL rule. <strong>WSGI</strong> (Web Server Gateway Interface): the Python standard for how a server hands one request to a synchronous function and gets one response back.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>flask run</code> and <code>app.run(debug=True)</code> are development servers. Debug mode shows an interactive Python console in the browser when an error happens; on a public machine that is remote code execution. Never in production.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: routes.</b> One fixed path works. But Biteful needs <code>/v1/restaurants/10</code>, <code>/v1/restaurants/11</code>… one route per restaurant is absurd, and creating an order is a POST to a different path. How do routes take variable parts and different methods?</div>

  <h2 id="fl-routes"><span class="num">02</span>Routes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha taps Biryani Bros, so the app asks <code>GET /v1/restaurants/11</code>. Tomorrow it might be 10 or 12. And placing an order is <code>POST /v1/orders</code>, a different method. How does one function serve every restaurant id, and how do methods pick functions?</p>
  </div>
  <p>A route pattern can contain a <strong>path parameter</strong> in angle brackets. Flask cuts that piece out of the URL and passes it to your function as an argument. A <strong>converter</strong> in front of the name (<code>int:</code>) says what type it must be:</p>
<div class="fx" data-lang="py"># s2_routes.py: Biteful's customer API, every check written by hand
from flask import Flask, request

app = Flask(__name__)
app.json.sort_keys = False
RESTAURANTS = {10: {"id": 10, "name": "Dosa Hut", "city": "Pune", "rating": 4.5},
               11: {"id": 11, "name": "Biryani Bros", "city": "Mumbai", "rating": 4.2},
               12: {"id": 12, "name": "Pizza Point", "city": "Pune", "rating": 3.9}}
MENUS = {10: {"Masala Dosa": 120, "Idli": 60, "Filter Coffee": 40},
         11: {"Chicken Biryani": 350, "Raita": 50}}
ORDERS, NEXT_ID = {}, [101]

@app.get("/v1/restaurants")
def list_restaurants():
    city = request.args.get("city")                       # query string: ?city=Pune
    min_rating = request.args.get("min_rating", default=0.0, type=float)
    items = [r for r in RESTAURANTS.values()
             if (city is None or r["city"] == city) and r["rating"] &gt;= min_rating]
    return {"items": items}

@app.get("/v1/restaurants/&lt;int:rid&gt;")                     # path parameter, converted to int
def get_restaurant(rid):
    if rid not in RESTAURANTS:
        return {"error": "restaurant not found"}, 404
    return RESTAURANTS[rid]</div>
  <table class="tbl"><caption>How Flask matches, traced</caption>
    <tr><th>Request</th><th>Rule that matches</th><th>Function called</th><th>Result</th></tr>
    <tr><td><code>GET /v1/restaurants?city=Pune&amp;min_rating=4</code></td><td><code>/v1/restaurants</code> (query string is not part of the path)</td><td><code>list_restaurants()</code></td><td>only Dosa Hut (Pizza Point is 3.9)</td></tr>
    <tr><td><code>GET /v1/restaurants/11</code></td><td><code>/v1/restaurants/&lt;int:rid&gt;</code></td><td><code>get_restaurant(rid=11)</code></td><td>200 Biryani Bros</td></tr>
    <tr><td><code>GET /v1/restaurants/abc</code></td><td>none: "abc" is not an int</td><td>nothing</td><td>404 from Flask</td></tr>
    <tr><td><code>GET /v1/restaurants/99</code></td><td><code>&lt;int:rid&gt;</code></td><td><code>get_restaurant(rid=99)</code></td><td>404 from <em>our</em> code</td></tr>
    <tr><td><code>DELETE /v1/restaurants/11</code></td><td>path matches, method doesn't</td><td>nothing</td><td>405 from Flask</td></tr>
  </table>
<div class="fx" data-lang="text">$ flask --app s2_routes run --port 5001</div>
<div class="fx" data-lang="text">$ curl -s 'localhost:5001/v1/restaurants?city=Pune&amp;min_rating=4'
{"items":[{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}]}

$ curl -s localhost:5001/v1/restaurants/11
{"id":11,"name":"Biryani Bros","city":"Mumbai","rating":4.2}

$ curl -s -o /dev/null -w '%{http_code}\\n' localhost:5001/v1/restaurants/abc
404

$ curl -s -w ' [%{http_code}]\\n' localhost:5001/v1/restaurants/99
{"error":"restaurant not found"}
 [404]

$ curl -s -o /dev/null -w '%{http_code}\\n' -X DELETE localhost:5001/v1/restaurants/11
405</div>
  <p>Every row of the trace, confirmed. Note the two kinds of 404: <code>/abc</code> never reached our code (empty body here because we discarded it with <code>-o /dev/null</code>), while <code>/99</code> did and returned our JSON message.</p>
  <ul>
    <li><code>@app.get</code> / <code>@app.post</code> / <code>@app.patch</code> are shortcuts for <code>@app.route(path, methods=[...])</code>.</li>
    <li>Converters: <code>string</code> (default, no slashes), <code>int</code>, <code>float</code>, <code>path</code> (allows slashes), <code>uuid</code>.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Route</strong>: a URL rule plus allowed methods, bound to a view function. <strong>Path parameter</strong>: a variable segment of the rule (<code>&lt;int:rid&gt;</code>) passed to the function as an argument. <strong>Converter</strong>: the type check and conversion for that segment.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Two rules that match the same path (for example <code>/v1/restaurants/&lt;name&gt;</code> and <code>/v1/restaurants/&lt;int:rid&gt;</code>) are resolved by Flask's rule ordering, not by the order you wrote them. Keep patterns unambiguous; use converters.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the request and response objects.</b> Routes deliver the path's variable parts. But <code>?city=Pune</code>, the JSON body of an order and the <code>X-Customer</code> header arrive elsewhere, and an order must answer 201 with a <code>Location</code> header, not a plain 200. How do we read the rest and shape the reply?</div>

  <h2 id="fl-req"><span class="num">03</span>Request &amp; Response Objects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha's order arrives as <code>POST /v1/orders</code> with a JSON body (<code>{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]}</code>) and a header saying who she is. The view needs all of it, must reject nonsense like <code>"qty": "two"</code>, and must answer 201 with a Location. Where is the body, and how do we choose the status?</p>
  </div>
  <p>Flask puts everything about the current request in one object, <code>request</code> (imported from flask; it always means "the request being handled right now"). What you <code>return</code> decides the response.</p>
  <table class="tbl"><caption>Reading input</caption>
    <tr><th>Input</th><th>Biteful example</th><th>Read with</th></tr>
    <tr><td>Path</td><td><code>/v1/restaurants/11</code></td><td>function argument <code>rid</code></td></tr>
    <tr><td>Query string</td><td><code>?city=Pune&amp;min_rating=4</code></td><td><code>request.args.get("min_rating", default=0.0, type=float)</code></td></tr>
    <tr><td>JSON body</td><td><code>{"restaurant_id": 10, ...}</code></td><td><code>request.get_json(silent=True)</code></td></tr>
    <tr><td>Headers</td><td><code>X-Customer: asha</code></td><td><code>request.headers.get("X-Customer")</code></td></tr>
    <tr><td>Form / files</td><td>a menu photo upload</td><td><code>request.form</code>, <code>request.files</code></td></tr>
  </table>
  <table class="tbl"><caption>Shaping output</caption>
    <tr><th>Return</th><th>Becomes</th></tr>
    <tr><td><code>{"a": 1}</code> or <code>jsonify(a=1)</code></td><td>200, <code>application/json</code></td></tr>
    <tr><td><code>body, 201, {"Location": "/v1/orders/101"}</code></td><td>custom status and headers</td></tr>
    <tr><td><code>"text"</code></td><td>200, <code>text/html</code></td></tr>
  </table>
  <p>The order view, with every check written by hand (there is nothing else in Flask to do it):</p>
<div class="fx" data-lang="py">@app.post("/v1/orders")
def create_order():
    body = request.get_json(silent=True)                  # None if the body isn't JSON
    if not isinstance(body, dict):
        return {"error": "body must be a JSON object"}, 400
    rid = body.get("restaurant_id")
    if not isinstance(rid, int) or rid not in MENUS:
        return {"error": "restaurant_id must be the id of a restaurant with a menu"}, 422
    items = body.get("items")
    if not isinstance(items, list) or not 1 &lt;= len(items) &lt;= 20:
        return {"error": "items must be a list of 1 to 20 items"}, 422
    total = 0
    for i, it in enumerate(items):
        if not isinstance(it, dict):
            return {"error": f"items[{i}] must be an object"}, 422
        name, qty = it.get("name"), it.get("qty")
        if name not in MENUS[rid]:
            return {"error": f"items[{i}].name: {name!r} is not on the menu"}, 422
        if not isinstance(qty, int) or isinstance(qty, bool) or not 1 &lt;= qty &lt;= 10:
            return {"error": f"items[{i}].qty must be a whole number from 1 to 10"}, 422
        total += MENUS[rid][name] * qty
    oid = NEXT_ID[0]; NEXT_ID[0] += 1
    ORDERS[oid] = {"order_id": oid, "customer": request.headers.get("X-Customer", "guest"),
                   "restaurant_id": rid, "items": items, "total": total, "status": "placed"}
    return ORDERS[oid], 201, {"Location": f"/v1/orders/{oid}"}</div>
  <p>Trace Asha's order: <code>get_json</code> gives a dict; <code>rid</code> 10 has a menu; <code>items</code> is a list of one; item 0 is a dict, "Masala Dosa" is on the menu, <code>qty</code> 2 is an int in 1–10; total = 120 × 2 = 240; id 101; return the order, 201 and a Location. Now four real requests:</p>
<div class="fx" data-lang="text">$ curl -si -X POST localhost:5001/v1/orders -H 'X-Customer: asha' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]}'
HTTP/1.1 201 CREATED
Server: Werkzeug/3.1.9 Python/3.13.16
Date: Tue, 20 Oct 2026 00:07:41 GMT
Content-Type: application/json
Content-Length: 125
Location: /v1/orders/101
Connection: close

{"order_id":101,"customer":"asha","restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"placed"}

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:5001/v1/orders -H 'Content-Type: application/json' -d 'two dosas please'
{"error":"body must be a JSON object"}
 [400]

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:5001/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": "two"}]}'
{"error":"items[0].qty must be a whole number from 1 to 10"}
 [422]

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:5001/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Pizza", "qty": 1}, {"name": "Idli", "qty": 99}]}'
{"error":"items[0].name: 'Pizza' is not on the menu"}
 [422]</div>
  <ul>
    <li>Asha's order: 201, <code>Location: /v1/orders/101</code>, total 240, customer read from the header.</li>
    <li>Plain text body: <code>get_json(silent=True)</code> returned <code>None</code> instead of raising, so our check answered 400.</li>
    <li><code>"qty": "two"</code>: JSON is fine, the value is not → 422.</li>
    <li>Two mistakes ("Pizza" and qty 99) but only the <em>first</em> was reported, because each check returns immediately. The app must fix one, resend, and discover the next.</li>
  </ul>
  <p>Count the cost: of the 23 non-empty lines in <code>create_order</code>'s body, <strong>12 are checks</strong> (six <code>if</code>s, six error returns). Every endpoint that takes input needs its own. Keep that number in mind for FastAPI.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>request</code></strong>: a proxy object for the current request (args, json, headers, form, files, method, path). <strong>Response tuple</strong>: <code>(body, status)</code> or <code>(body, status, headers)</code> returned from a view.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>request.get_json()</code> without <code>silent=True</code> raises a 400 HTML error on broken JSON or a wrong <code>Content-Type</code>. And <code>request.args.get("min_rating", default=0.0, type=float)</code> does <em>not</em> reject <code>?min_rating=high</code>: the conversion fails silently and the default is used (section 04 shows all three restaurants coming back). Flask never type-checks for you.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: hooks and error handlers.</b> Biteful also wants every response stamped with a request id and every request's time logged, and an unknown URL or a crash should give JSON, not an HTML page. Copying that into each view would multiply the 12 lines. Is there one place for "around every request"?</div>

  <h2 id="fl-mw"><span class="num">04</span>Hooks &amp; Error Handlers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Some work belongs to <em>every</em> request: start a timer, read or create a request id, log the outcome. And when anything fails (unknown URL, wrong method, a bug), Asha's app needs JSON it can read, plus a request id the support team can search for. Where does code that wraps all views go?</p>
  </div>
  <p>Flask gives two <strong>hooks</strong>: a function that runs before every view (<code>@app.before_request</code>) and one that runs after (<code>@app.after_request</code>, which receives the response and must return it). And <strong>error handlers</strong> (<code>@app.errorhandler(404)</code> or an exception class) build the response when something goes wrong.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Hooks are airport security on the way in and customs on the way out: every passenger passes through, whatever their flight. The flight itself (your view function) stays simple. The error handler is the help desk: whatever went wrong, you get a printed slip in the same format.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="fl-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="30" width="105" height="44" rx="6" class="fs"/><text x="57" y="57" text-anchor="middle">request</text>
    <rect x="135" y="30" width="125" height="44" rx="6" class="fb sb"/><text x="197" y="50" text-anchor="middle">before_request</text><text x="197" y="66" text-anchor="middle" font-size="11" class="tm">timer, request id</text>
    <rect x="285" y="30" width="95" height="44" rx="6" class="fg sg"/><text x="332" y="57" text-anchor="middle">view</text>
    <rect x="405" y="30" width="120" height="44" rx="6" class="fb sb"/><text x="465" y="50" text-anchor="middle">after_request</text><text x="465" y="66" text-anchor="middle" font-size="11" class="tm">header, log line</text>
    <text x="570" y="57" text-anchor="middle">resp</text>
    <line x1="110" y1="52" x2="133" y2="52" stroke="currentColor" marker-end="url(#fl-ar)"/>
    <line x1="260" y1="52" x2="283" y2="52" stroke="currentColor" marker-end="url(#fl-ar)"/>
    <line x1="380" y1="52" x2="403" y2="52" stroke="currentColor" marker-end="url(#fl-ar)"/>
    <line x1="525" y1="52" x2="550" y2="52" stroke="currentColor" marker-end="url(#fl-ar)"/>
    <rect x="270" y="105" width="125" height="36" rx="6" class="fr sr"/><text x="332" y="128" text-anchor="middle">errorhandler</text>
    <line x1="332" y1="74" x2="332" y2="103" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#fl-ar)"/><text x="345" y="94" font-size="11" class="tr">raise / 404</text>
    <path d="M395,123 L465,123 L465,76" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#fl-ar)"/>
  </svg><figcaption>Every request passes the blue hooks on both sides of the view. If the view raises (or no route matched), the red handler builds the response, which still goes through after_request.</figcaption></figure>
  <p><code>s4_hooks.py</code> is <code>s2_routes.py</code> plus this block (and <code>import logging, time, uuid</code>, <code>g</code>, <code>abort</code>, <code>HTTPException</code>, and <code>logging.basicConfig(level=logging.INFO)</code> at the top). The last route has a deliberate bug: Pizza Point exists but has no menu.</p>
<div class="fx" data-lang="py"># ---------- hooks: code that runs around EVERY request ----------
@app.before_request
def start_timer():
    g.t0 = time.perf_counter()                               # g: a scratchpad for this one request
    g.request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:8]

@app.after_request
def add_headers(resp):
    ms = (time.perf_counter() - g.t0) * 1000
    resp.headers["X-Request-ID"] = g.request_id
    app.logger.info("%s %s %s -&gt; %s in %.1f ms", g.request_id, request.method,
                    request.full_path.rstrip("?"), resp.status_code, ms)
    return resp

# ---------- error handlers: every error becomes JSON ----------
@app.errorhandler(404)
def not_found(e):
    return {"error": "not_found", "path": request.path}, 404

@app.errorhandler(405)
def wrong_method(e):
    return {"error": "method_not_allowed", "allowed": sorted(e.valid_methods)}, 405

@app.errorhandler(Exception)
def crashed(e):
    if isinstance(e, HTTPException):                         # other 4xx from Flask itself
        return {"error": e.name}, e.code
    app.logger.exception("unhandled error, request %s", g.request_id)
    return {"error": "internal_error", "request_id": g.request_id}, 500

# ---------- a route with a bug, to see the 500 handler work ----------
@app.get("/v1/restaurants/&lt;int:rid&gt;/menu")
def get_menu(rid):
    if rid not in RESTAURANTS:
        abort(404)
    return MENUS[rid]              # bug: Pizza Point (12) exists but has no menu -&gt; KeyError</div>
<div class="fx" data-lang="text">$ curl -si localhost:5001/v1/restaurants/10 -H 'X-Request-ID: asha-001' | grep -iE 'HTTP/|x-request-id|^\\{'
HTTP/1.1 200 OK
X-Request-ID: asha-001
{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}

$ curl -s -w ' [%{http_code}]\\n' localhost:5001/v1/menus
{"error":"not_found","path":"/v1/menus"}
 [404]

$ curl -s -w ' [%{http_code}]\\n' -X DELETE localhost:5001/v1/restaurants/11
{"error":"method_not_allowed","allowed":["GET","HEAD","OPTIONS"]}
 [405]

$ curl -s -w ' [%{http_code}]\\n' localhost:5001/v1/restaurants/12/menu
{"error":"internal_error","request_id":"ae1524e5"}
 [500]

$ curl -s 'localhost:5001/v1/restaurants?min_rating=high'
{"items":[{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5},{"id":11,"name":"Biryani Bros","city":"Mumbai","rating":4.2},{"id":12,"name":"Pizza Point","city":"Pune","rating":3.9}]}</div>
  <p>The server's log for the same five requests:</p>
<div class="fx" data-lang="text">INFO asha-001 GET /v1/restaurants/10 -&gt; 200 in 0.2 ms
INFO 0d4a013a GET /v1/menus -&gt; 404 in 0.2 ms
INFO 7cae4d21 DELETE /v1/restaurants/11 -&gt; 405 in 0.2 ms
ERROR unhandled error, request ae1524e5
Traceback (most recent call last):
  ... (two Flask-internal frames trimmed) ...
  File "s4_hooks.py", line 92, in get_menu
    return MENUS[rid]              # bug: Pizza Point (12) exists but has no menu -&gt; KeyError
           ~~~~~^^^^^
KeyError: 12
INFO ae1524e5 GET /v1/restaurants/12/menu -&gt; 500 in 1.5 ms
INFO d70b2b59 GET /v1/restaurants?min_rating=high -&gt; 200 in 0.2 ms</div>
  <ul>
    <li>Request 1 sent <code>X-Request-ID: asha-001</code>; <code>before_request</code> kept it in <code>g</code>; <code>after_request</code> put it on the response and in the log line, with the time (0.2 ms).</li>
    <li>Unknown path and wrong method: our JSON handlers replaced Flask's HTML pages; 405 even lists the allowed methods.</li>
    <li>Menu 12: <code>MENUS[12]</code> raised <code>KeyError</code>; the <code>Exception</code> handler logged the full traceback under request id <code>ae1524e5</code> and gave the client only that id. Support can now find the exact traceback from what the user sees.</li>
    <li><code>?min_rating=high</code>: the silent fallback from section 03. No error, all three restaurants. A hidden bug that no handler can catch, because nothing was raised.</li>
  </ul>
  <p><code>g</code> is a per-request scratchpad: whatever <code>before_request</code> stores there, <code>after_request</code> and the view can read, and it is gone after the response. A <code>before_request</code> that <em>returns</em> a response stops the view from running (handy for "not logged in → 401").</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Hook</strong>: a function Flask calls at a fixed point of every request (<code>before_request</code>, <code>after_request</code>, <code>teardown_request</code>). <strong>Error handler</strong>: a function registered for a status code or exception class that turns it into a response. <strong><code>g</code></strong>: request-scoped storage.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Showing the exception text to the client (<code>{"error": str(e)}</code> for a crash) leaks internals such as file paths and SQL. Log the details, return a request id. And a catch-all <code>errorhandler(Exception)</code> also catches Flask's own 4xx errors unless you pass <code>HTTPException</code>s through, as above.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: templates.</b> Everything so far returns JSON for the app. Dosa Hut's staff want a web page listing today's orders, and orders contain text typed by customers. How do we build HTML from data without letting a customer inject code into the staff's browser?</div>

  <h2 id="fl-tpl"><span class="num">05</span>Templates</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Staff at Dosa Hut need a page showing today's orders with each customer's note ("extra chutney"). Gluing HTML strings together in Python is ugly and dangerous: Ben typed <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> as his note. Put that raw into the page and the staff's browser runs Ben's code. How do we build HTML safely?</p>
  </div>
  <p>A <strong>template</strong> is an HTML file with holes. <strong>Jinja2</strong> (Flask's template engine) fills them: <code>{{ value }}</code> prints a value, <code>{% for … %}</code> repeats a block, <code>{% else %}</code> inside a for runs when the list is empty. Every printed value is <strong>auto-escaped</strong>: <code>&lt;</code> becomes <code>&amp;lt;</code>, so the browser shows it instead of running it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A printed order slip with blank boxes. The kitchen fills the boxes by hand; whatever a customer wrote goes inside a box as plain writing and can never change the slip's layout.</p></div>
<div class="fx" data-lang="text">&lt;!-- biteful/templates/orders.html --&gt;
&lt;h1&gt;{{ restaurant.name }}: today's orders&lt;/h1&gt;
&lt;ul&gt;
{% for o in orders %}
  &lt;li&gt;#{{ o.order_id }} {{ o.customer }} ₹{{ o.total }} {{ o.status }} | note: {{ o.note }}&lt;/li&gt;
{% else %}
  &lt;li&gt;No orders yet&lt;/li&gt;
{% endfor %}
&lt;/ul&gt;</div>
<div class="fx" data-lang="py"># biteful/staff.py: HTML pages for restaurant staff, under /staff
from flask import Blueprint, render_template, abort
from .data import RESTAURANTS, ORDERS

staff = Blueprint("staff", __name__, url_prefix="/staff", template_folder="templates")

@staff.get("/&lt;int:rid&gt;/orders")
def orders_page(rid):
    if rid not in RESTAURANTS:
        abort(404)
    mine = [o for o in ORDERS.values() if o["restaurant_id"] == rid]
    return render_template("orders.html", restaurant=RESTAURANTS[rid], orders=mine)</div>
  <p><code>render_template</code> finds <code>orders.html</code>, passes it <code>restaurant</code> and <code>orders</code>, and returns the finished HTML string. (The comment line at the top of the template block names the file; it is not part of the file.) Asha and Ben place orders through the JSON API, then a staff member opens the page:</p>
<div class="fx" data-lang="text">$ curl -s -X POST localhost:5001/v1/orders -H 'X-Customer: asha' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}], "note": "extra chutney"}'
{"order_id":101,"customer":"asha","restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"placed","note":"extra chutney"}

$ curl -s -X POST localhost:5001/v1/orders -H 'X-Customer: ben' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Idli", "qty": 1}], "note": "&lt;script&gt;alert(1)&lt;/script&gt;"}'
{"order_id":102,"customer":"ben","restaurant_id":10,"items":[{"name":"Idli","qty":1}],"total":60,"status":"placed","note":"&lt;script&gt;alert(1)&lt;/script&gt;"}</div>
<div class="fx" data-lang="text">$ curl -s localhost:5001/staff/10/orders
&lt;h1&gt;Dosa Hut: today's orders&lt;/h1&gt;
&lt;ul&gt;

  &lt;li&gt;#101 asha ₹240 placed | note: extra chutney&lt;/li&gt;

  &lt;li&gt;#102 ben ₹60 placed | note: &amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;&lt;/li&gt;

&lt;/ul&gt;
$ curl -s localhost:5001/staff/11/orders
&lt;h1&gt;Biryani Bros: today's orders&lt;/h1&gt;
&lt;ul&gt;

  &lt;li&gt;No orders yet&lt;/li&gt;

&lt;/ul&gt;</div>
  <p>Ben's note went into the database exactly as typed (the JSON shows <code>&lt;script&gt;</code>), but the page printed <code>&amp;lt;script&amp;gt;</code>: the staff's browser will display the characters, not run them. Biryani Bros has no orders, so the <code>{% else %}</code> branch ran. That attack, sneaking code into a page through user input, is <strong>XSS</strong> (cross-site scripting); auto-escaping is the defence.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Template</strong>: text with placeholders filled at render time. <strong>Auto-escaping</strong>: converting HTML-special characters in inserted values (<code>&lt; &gt; &amp; " '</code>) to entities so they display as text.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>{{ o.note | safe }}</code> or <code>Markup(o.note)</code> turns escaping off. Use them only for HTML you generated yourself, never for user input. And escaping protects HTML only; inside a <code>&lt;script&gt;</code> block or a URL you need other encoding.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: blueprints and the app factory.</b> One file now mixes the customer JSON API (<code>/v1/...</code>), staff HTML pages (<code>/staff/...</code>), hooks and handlers. And tests will need fresh app copies with test settings. How do we split it into parts and build the app on demand?</div>

  <h2 id="fl-bp"><span class="num">06</span>Blueprints &amp; the App Factory</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's server will grow to 40 routes owned by different people: the customer API, the staff pages, admin tools. One file with every route and one global <code>app</code> is hard to read and hard to test, because every test shares the same app and state. How do we group routes and create the app on demand?</p>
  </div>
  <p>A <strong>Blueprint</strong> is a folder for routes: define a group in its own file with a shared URL prefix, then register it on the app. An <strong>app factory</strong> is a function, <code>create_app(config)</code>, that builds and returns a configured app, so a test can make a fresh one with test settings. The final Biteful app is a small package:</p>
<div class="fx" data-lang="text">biteful/
  __init__.py      create_app(): config, model, error handlers, blueprints
  data.py          RESTAURANTS, MENUS, ORDERS (stand-ins for the database)
  errors.py        BadInput and the JSON error handlers
  api.py           Blueprint "api",   prefix /v1     (JSON for the app)
  staff.py         Blueprint "staff", prefix /staff  (HTML for restaurants)
  templates/orders.html
eta.joblib         the trained model (section 07)
tests/test_api.py  (section 08)</div>
<div class="fx" data-lang="py"># biteful/__init__.py: the app factory
import joblib
from flask import Flask
from . import errors
from .api import api
from .staff import staff

def create_app(config=None):
    app = Flask(__name__)
    app.json.sort_keys = False
    app.config["ETA"] = joblib.load("eta.joblib")      # load the model ONCE, at startup
    app.config.update(config or {})
    errors.register(app)
    app.register_blueprint(api)                        # /v1/...
    app.register_blueprint(staff)                      # /staff/...
    return app</div>
<div class="fx" data-lang="py"># biteful/errors.py: one exception type for "your input is wrong"
class BadInput(Exception):
    pass

def register(app):
    @app.errorhandler(BadInput)
    def bad_input(e):
        return {"error": "bad_input", "detail": str(e)}, 422

    @app.errorhandler(404)
    def not_found(e):
        return {"error": "not_found"}, 404</div>
  <p>The customer blueprint. Routes are written <code>@api.get("/restaurants")</code>; the prefix makes them <code>/v1/restaurants</code>. The order view now raises <code>BadInput</code> and lets the handler build the 422:</p>
<div class="fx" data-lang="py"># biteful/api.py: the customer-facing JSON API, all under /v1
import numpy as np
from flask import Blueprint, current_app, request
from .data import RESTAURANTS, MENUS, ORDERS, NEXT_ID
from .errors import BadInput

api = Blueprint("api", __name__, url_prefix="/v1")

@api.get("/restaurants")
def list_restaurants():
    return {"items": list(RESTAURANTS.values())}

@api.post("/orders")
def create_order():
    body = request.get_json(silent=True) or {}
    rid, items, note = body.get("restaurant_id"), body.get("items"), body.get("note", "")
    if rid not in MENUS:
        raise BadInput("restaurant_id must be a restaurant with a menu")
    if not isinstance(items, list) or not items:
        raise BadInput("items must be a non-empty list")
    total = 0
    for it in items:
        price = MENUS[rid].get(it.get("name")) if isinstance(it, dict) else None
        if price is None or not isinstance(it.get("qty"), int) or it["qty"] &lt; 1:
            raise BadInput(f"bad item {it}")
        total += price * it["qty"]
    oid = NEXT_ID[0]; NEXT_ID[0] += 1
    ORDERS[oid] = {"order_id": oid, "customer": request.headers.get("X-Customer", "guest"),
                   "restaurant_id": rid, "items": items, "total": total,
                   "status": "placed", "note": str(note)[:200]}
    return ORDERS[oid], 201, {"Location": f"/v1/orders/{oid}"}</div>
  <p>The routing table of the assembled app (<code>show_map.py</code> creates the app and prints its rules):</p>
<div class="fx" data-lang="py">from biteful import create_app

app = create_app()
for rule in sorted(app.url_map.iter_rules(), key=lambda r: r.rule):
    print(f"{rule.endpoint:22} {','.join(sorted(rule.methods - {'HEAD', 'OPTIONS'})):5} {rule.rule}")</div>
<div class="fx" data-lang="text">staff.orders_page      GET   /staff/&lt;int:rid&gt;/orders
static                 GET   /static/&lt;path:filename&gt;
api.eta                POST  /v1/eta
api.health             GET   /v1/health
api.create_order       POST  /v1/orders
api.list_restaurants   GET   /v1/restaurants</div>
  <p>Endpoint names are now <code>blueprint.function</code> (<code>api.create_order</code>, <code>staff.orders_page</code>), and the prefixes were added for us. Run the package with <code>flask --app "biteful:create_app()" run --port 5001</code>; the outputs in sections 05 and 07 come from that server.</p>
  <p><strong>Flask-RESTful</strong> is an older extension where one class is one resource and its methods are the HTTP verbs. You will meet it in legacy code:</p>
<div class="fx" data-lang="py">from flask import Flask
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)
ORDERS = {101: {"order_id": 101, "status": "placed"}}

class Order(Resource):                    # one class = one resource; methods = HTTP verbs
    def get(self, oid):
        if oid not in ORDERS:
            return {"error": "order not found"}, 404
        return ORDERS[oid]
    def delete(self, oid):
        ORDERS.pop(oid, None)
        return "", 204

api.add_resource(Order, "/v1/orders/&lt;int:oid&gt;")

c = app.test_client()
print(c.get("/v1/orders/101").status_code, c.get("/v1/orders/101").json)
print(c.delete("/v1/orders/101").status_code, c.get("/v1/orders/101").status_code)</div>
<div class="fx" data-lang="text">200 {'order_id': 101, 'status': 'placed'}
204 404</div>
  <p>GET found order 101 (200). DELETE removed it (204, empty body). The next GET can't find it (404).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Blueprint</strong>: a reusable group of routes, handlers and templates, registered on an app with an optional URL prefix. <strong>App factory</strong>: a function that creates and configures a new app instance.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Importing a module-level <code>app</code> everywhere leads to circular imports and to tests that leak state into each other. With a factory, use <code>current_app</code> inside views to reach the app that is handling the request.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: serving a model.</b> The app is organised. Biteful's data team has a model that predicts delivery minutes from distance and number of items, and the app wants to show "arrives in about 32 min". How does a trained model answer HTTP requests?</div>

  <h2 id="fl-ml"><span class="num">07</span>Serving a Model</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Training a model takes seconds to hours and happens rarely; answering "how long for 3.2 km and 2 items?" must take milliseconds and happens on every checkout. If the view trained or even loaded the model on each request, checkout would crawl. How do training and serving connect?</p>
  </div>
  <p>They are two programs joined by one file. The training script writes the model; the API loads it once at startup and uses it for every request.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="fl-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="110" y="16" text-anchor="middle" class="tm" font-size="12">offline, once</text>
    <text x="430" y="16" text-anchor="middle" class="tm" font-size="12">online, every request</text>
    <rect x="5" y="30" width="95" height="40" rx="6" class="fv"/><text x="52" y="55" text-anchor="middle">train_eta.py</text>
    <rect x="125" y="30" width="110" height="40" rx="6" class="fs"/><text x="180" y="55" text-anchor="middle">eta.joblib</text>
    <rect x="265" y="30" width="110" height="40" rx="6" class="fb sb"/><text x="320" y="49" text-anchor="middle">create_app</text><text x="320" y="63" text-anchor="middle" font-size="11" class="tm">joblib.load</text>
    <rect x="400" y="30" width="90" height="40" rx="6" class="ft st"/><text x="445" y="49" text-anchor="middle">validate</text><text x="445" y="63" text-anchor="middle" font-size="11" class="tm">input</text>
    <rect x="510" y="30" width="85" height="40" rx="6" class="fg sg"/><text x="552" y="49" text-anchor="middle">predict</text><text x="552" y="63" text-anchor="middle" font-size="11" class="tm">→ JSON</text>
    <line x1="100" y1="50" x2="123" y2="50" stroke="currentColor" marker-end="url(#fl-ar2)"/>
    <line x1="235" y1="50" x2="263" y2="50" stroke="currentColor" marker-end="url(#fl-ar2)"/>
    <line x1="375" y1="50" x2="398" y2="50" stroke="currentColor" marker-end="url(#fl-ar2)"/>
    <line x1="490" y1="50" x2="508" y2="50" stroke="currentColor" marker-end="url(#fl-ar2)"/>
    <line x1="252" y1="22" x2="252" y2="110" stroke="currentColor" stroke-dasharray="3 3"/>
    <text x="320" y="100" text-anchor="middle" font-size="12" class="tr">load once, never per request</text>
  </svg><figcaption>Left of the dotted line happens once; right of it happens on every request.</figcaption></figure>
  <p><strong>Step 1: train and save.</strong> Six past Dosa Hut deliveries; a linear regression learns minutes from distance and item count (the model itself is explained in <a class="xref" data-note="ml_regression">Linear Regression</a>). <code>joblib</code> saves Python objects to a file; we save the feature order and a version string with the model.</p>
<div class="fx" data-lang="py"># train_eta.py: train Biteful's delivery-time model once, offline
import joblib
from sklearn.linear_model import LinearRegression

#        distance_km, items   minutes   (six past Dosa Hut deliveries)
X = [[1.5, 1], [2.0, 2], [3.0, 2], [4.0, 3], [5.0, 2], [6.5, 4]]
y = [22, 27, 30, 38, 39, 51]
model = LinearRegression().fit(X, y)
print("minutes = %.2f + %.2f * km + %.2f * items" % (model.intercept_, *model.coef_))
print("R^2 on the six rows:", round(model.score(X, y), 3))
joblib.dump({"model": model, "features": ["distance_km", "items"], "version": "eta-lr-1"},
            "eta.joblib")</div>
<div class="fx" data-lang="text">minutes = 12.68 + 4.03 * km + 3.02 * items
R^2 on the six rows: 0.998</div>
  <p><strong>Step 2: the endpoint.</strong> <code>create_app</code> (section 06) already did <code>app.config["ETA"] = joblib.load("eta.joblib")</code>. The view reads it through <code>current_app</code>:</p>
<div class="fx" data-lang="py">@api.post("/eta")
def eta():
    body = request.get_json(silent=True) or {}
    try:
        x = np.array([[float(body["distance_km"]), int(body["items"])]])
    except (KeyError, TypeError, ValueError):
        raise BadInput("need numeric distance_km and items")
    bundle = current_app.config["ETA"]                      # loaded once in create_app
    minutes = bundle["model"].predict(x)[0]                 # a NumPy float64
    return {"eta_minutes": round(float(minutes), 1), "model": bundle["version"]}

@api.get("/health")
def health():
    return {"status": "ok", "model": current_app.config["ETA"]["version"]}</div>
<div class="fx" data-lang="text">$ curl -s -X POST localhost:5001/v1/eta -H 'Content-Type: application/json' -d '{"distance_km": 3.2, "items": 2}'
{"eta_minutes":31.6,"model":"eta-lr-1"}

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:5001/v1/eta -H 'Content-Type: application/json' -d '{"distance_km": "far", "items": 2}'
{"error":"bad_input","detail":"need numeric distance_km and items"}
 [422]

$ curl -s localhost:5001/v1/health
{"status":"ok","model":"eta-lr-1"}</div>
  <p><strong>Check by hand.</strong> 12.68 + 4.03 × 3.2 + 3.02 × 2 = 12.68 + 12.90 + 6.04 = 31.62 → 31.6 minutes, the same as the API. <code>predict</code> returned a NumPy <code>float64</code>; <code>float()</code> turned it into a plain float that JSON accepts (the fundamentals note showed <code>int64</code> crashing <code>json.dumps</code>). <code>"far"</code> made <code>float()</code> raise <code>ValueError</code>, which became our <code>BadInput</code> → 422. <code>/v1/health</code> reports the model version, so monitoring can see which model is live.</p>
  <ul>
    <li>Save the <strong>whole pipeline</strong> (preprocessing + model), the feature order and a version, so serving cannot skip or reorder a step.</li>
    <li>Return the model version with predictions, so every answer can be traced to the model that made it.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Model serving</strong>: exposing a trained model's predict function behind an API. <strong>Model artifact</strong>: the saved file (weights, pipeline, metadata) that training produces and serving loads.</p></div>
  <div class="callout trap"><span class="label">Trap: pickle and skew</span><p>Loading a pickle (joblib uses it) runs code hidden in the file: load only files you produced, and pin the scikit-learn version. If the API computes features differently from training (km vs miles, different item counting), predictions silently degrade; this is <strong>training–serving skew</strong>. Ship preprocessing inside the saved pipeline.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: testing.</b> We have JSON routes, HTML pages, error handlers and a model. Checking them all with curl after every change is slow and we will forget a case. How do we test the whole app in seconds, without starting a server?</div>

  <h2 id="fl-test"><span class="num">08</span>Testing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We changed <code>create_order</code> to raise <code>BadInput</code>. Did Asha's order still total ₹240? Does Ben's script still come out escaped? Does the ETA still match our hand calculation? Starting a server and replaying curl commands by hand doesn't scale. How do we check everything automatically?</p>
  </div>
  <p>Flask's <strong>test client</strong> calls your app directly inside the test process: no server, no port, milliseconds per call. <code>pytest</code> runs every function named <code>test_*</code> and reports pass or fail. The app factory pays off here: each test gets a fresh app.</p>
<div class="fx" data-lang="py"># tests/test_api.py: run with  pytest -q
import pytest
from biteful import create_app
from biteful.data import ORDERS

@pytest.fixture
def client():
    ORDERS.clear()                                    # start every test with no orders
    app = create_app({"TESTING": True})
    return app.test_client()                          # calls the app in-process: no server, no port

def test_list_restaurants(client):
    r = client.get("/v1/restaurants")
    assert r.status_code == 200
    assert [x["name"] for x in r.json["items"]] == ["Dosa Hut", "Biryani Bros"]

def test_asha_orders_two_dosas(client):
    r = client.post("/v1/orders", json={"restaurant_id": 10,
                    "items": [{"name": "Masala Dosa", "qty": 2}]}, headers={"X-Customer": "asha"})
    assert r.status_code == 201
    assert r.json["total"] == 240 and r.headers["Location"].startswith("/v1/orders/")

@pytest.mark.parametrize("bad", [
    {},                                                             # nothing at all
    {"restaurant_id": 99, "items": [{"name": "Idli", "qty": 1}]},   # unknown restaurant
    {"restaurant_id": 10, "items": []},                             # empty order
    {"restaurant_id": 10, "items": [{"name": "Idli", "qty": 0}]},   # zero quantity
])
def test_bad_orders_get_422(client, bad):
    r = client.post("/v1/orders", json=bad)
    assert r.status_code == 422 and r.json["error"] == "bad_input"

def test_staff_page_escapes_html(client):
    client.post("/v1/orders", json={"restaurant_id": 10, "items": [{"name": "Idli", "qty": 1}],
                                    "note": "&lt;script&gt;alert(1)&lt;/script&gt;"})
    page = client.get("/staff/10/orders").get_data(as_text=True)
    assert "&lt;script&gt;" not in page and "&amp;lt;script&amp;gt;" in page

def test_eta_matches_hand_calculation(client):
    r = client.post("/v1/eta", json={"distance_km": 3.2, "items": 2})
    assert r.json["eta_minutes"] == pytest.approx(12.68 + 4.03 * 3.2 + 3.02 * 2, abs=0.1)</div>
<div class="fx" data-lang="text">$ pytest -q tests/test_api.py</div>
<div class="fx" data-lang="text">........                                                                 [100%]
8 passed in 2.20s</div>
  <ul>
    <li>A <strong>fixture</strong> (<code>@pytest.fixture</code>) is reusable setup: here it clears the orders and builds a test client; any test that names <code>client</code> as a parameter receives one.</li>
    <li><code>parametrize</code> runs one test once per input: 5 test functions, but the bad-order test ran 4 times, so 8 tests passed.</li>
    <li><code>client.post(url, json=...)</code> sends a JSON body; <code>r.json</code> parses the reply; <code>get_data(as_text=True)</code> gives HTML.</li>
    <li>The ETA test encodes the hand calculation from section 07, so a retrained model that drifts will fail loudly.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Test client</strong>: an object that sends requests to the app in-process and returns response objects. <strong>Fixture</strong>: a pytest function that provides setup to tests by name.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Shared module-level state (our <code>ORDERS</code> dict) leaks between tests: without <code>ORDERS.clear()</code>, order ids would depend on which tests ran first. Real apps use a fresh test database per test. More on testing: <a class="xref" data-note="py_pytest">pytest</a>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the limits.</b> Tests pass for one request at a time. At lunchtime many customers order at once, and every order also sends a receipt email that takes a second. What does Flask do with requests that arrive while it is waiting?</div>

  <h2 id="fl-sync"><span class="num">09</span>The Limits: Sync Workers and Hand Validation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Placing an order also sends Asha a receipt email, and the email provider takes about a second to answer. Asha, Ben and Chen tap "Place order" at the same moment. Does the third customer wait for the first two emails? And is writing 12 lines of checks per endpoint really the best we can do?</p>
  </div>
  <p>A WSGI worker handles one request at a time, start to finish. If the view waits one second for the email provider, the worker sits idle for that second; other requests queue. We measured it with gunicorn, the production WSGI server, and a tiny client that fires the three orders together:</p>
<div class="fx" data-lang="py"># slow.py: placing an order also sends the receipt email, inside the request
import time
from flask import Flask

app = Flask(__name__)

def send_receipt_email(order_id):
    time.sleep(1)                    # stands in for talking to the email provider: ~1 s

@app.post("/v1/orders")
def create_order():
    send_receipt_email(101)          # the worker waits here, doing nothing, for 1 s
    return {"order_id": 101, "status": "placed"}, 201</div>
<div class="fx" data-lang="py"># fire3.py: Asha, Ben and Chen tap "Place order" at the same moment
import time, threading, requests

codes = []
def tap():
    codes.append(requests.post("http://127.0.0.1:5001/v1/orders").status_code)

t0 = time.perf_counter()
threads = [threading.Thread(target=tap) for _ in range(3)]
for t in threads: t.start()
for t in threads: t.join()
print(f"3 orders at once -&gt; {codes} in {time.perf_counter() - t0:.2f} s")</div>
<div class="fx" data-lang="text">$ gunicorn -w 1 -b 127.0.0.1:5001 slow:app              # 1 sync worker
$ python fire3.py
3 orders at once -&gt; [201, 201, 201] in 3.02 s

$ gunicorn -w 1 --threads 3 -b 127.0.0.1:5001 slow:app  # 1 worker, 3 threads
$ python fire3.py
3 orders at once -&gt; [201, 201, 201] in 1.01 s

$ gunicorn -w 3 -b 127.0.0.1:5001 slow:app              # 3 worker processes
$ python fire3.py
3 orders at once -&gt; [201, 201, 201] in 1.02 s</div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="5" y="22" font-size="12">1 sync worker</text>
    <rect x="140" y="10" width="140" height="18" class="fb"/><rect x="280" y="10" width="140" height="18" class="ft"/><rect x="420" y="10" width="140" height="18" class="fv"/>
    <text x="5" y="72" font-size="12">1 worker × 3 threads</text>
    <rect x="140" y="45" width="140" height="14" class="fb"/><rect x="140" y="62" width="140" height="14" class="ft"/><rect x="140" y="79" width="140" height="14" class="fv"/>
    <line x1="140" y1="110" x2="580" y2="110" stroke="currentColor"/>
    <text x="140" y="126" font-size="11" text-anchor="middle">0 s</text><text x="280" y="126" font-size="11" text-anchor="middle">1 s</text><text x="420" y="126" font-size="11" text-anchor="middle">2 s</text><text x="560" y="126" font-size="11" text-anchor="middle">3 s</text>
    <text x="300" y="146" font-size="12" text-anchor="middle" class="tm">each colour = one order waiting on the email provider</text>
  </svg><figcaption>Top: one worker serves Asha, then Ben, then Chen (3.02 s). Bottom: three threads wait at the same time (1.01 s).</figcaption></figure>
  <p>Threads (lanes inside one process) and extra worker processes both let waits overlap: 3.02 s → 1.01 s and 1.02 s. But each waiting request still occupies one whole thread. With 3 threads and a lunch rush of 12 orders:</p>
<div class="fx" data-lang="text">$ gunicorn -w 1 --threads 3 -b 127.0.0.1:5001 slow:app  # 1 worker, 3 threads
$ python fire12.py
12 orders at once -&gt; [201, 201, 201, 201, 201, 201, 201, 201, 201, 201, 201, 201] in 4.02 s</div>
  <p>12 orders ÷ 3 threads = 4 rounds of 1 s = 4.02 s. To serve 1,000 customers waiting at once you would need about 1,000 threads, each with its own memory. Two different fixes exist: serve many waits on one thread with <code>async</code> (<a class="xref" data-note="api_fastapi">FastAPI</a>), and do not wait for the email inside the request at all (a task queue, <a class="xref" data-note="api_production">Production Backend</a>).</p>
  <p>The second limit we already counted: validation by hand. 12 of 23 lines of <code>create_order</code>; one error reported at a time; <code>?min_rating=high</code> silently ignored; and no documentation of what the endpoint accepts unless someone writes it.</p>
  <table class="tbl">
    <tr><th></th><th>Flask (WSGI)</th><th>FastAPI (ASGI)</th></tr>
    <tr><td>Concurrency model</td><td>Processes × threads, one request each</td><td>Async event loop (+ threadpool for <code>def</code>)</td></tr>
    <tr><td>Many slow waits (email, LLM APIs, DBs)</td><td>Needs many threads/workers</td><td>Thousands of waits in one process</td></tr>
    <tr><td>Input validation</td><td>Manual (or marshmallow)</td><td>From type hints (Pydantic), automatic 422 listing every error</td></tr>
    <tr><td>API docs</td><td>Add-on</td><td>Automatic <code>/docs</code></td></tr>
    <tr><td>Templates, server-rendered pages</td><td>Excellent, mature</td><td>Possible, API-first</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Synchronous worker</strong>: handles one request per thread from start to finish, blocking while it waits. <strong>Concurrency</strong>: how many requests are in progress at once (here: workers × threads).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Adding threads to fix slow external calls hides the real problem. The receipt email should not be on the request path at all: Asha needs order 101 in milliseconds; the email can follow a second later from a queue worker.</p></div>
  <div class="callout intu"><span class="label">Rule of thumb</span><p>Existing Flask service, small internal tool, or HTML pages: Flask is fine. New JSON API, especially one calling other services or LLMs: FastAPI. For CPU-heavy models neither framework matters much; workers and batching do.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects,</b> then <a class="xref" data-note="api_fastapi">FastAPI</a>: the same Biteful API with validation generated from type hints, every error reported at once, and async endpoints.</div>

  <h2 id="fl-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>App, routes, request, hooks, handlers, templates, blueprints, model, tests: in which order does one request meet them?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 250" width="680">
    <defs><marker id="fl-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="10" width="140" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="80" y="28" text-anchor="middle" font-size="11">gunicorn / flask run</text><text x="80" y="42" text-anchor="middle" font-size="10" class="tm">WSGI: 1 request per thread</text>
    <line x1="150" y1="30" x2="178" y2="30" stroke="currentColor" marker-end="url(#fl-c0)"/>
    <rect x="180" y="10" width="150" height="40" rx="6" class="fb sb"/><text x="255" y="28" text-anchor="middle" font-size="11">create_app()</text><text x="255" y="42" text-anchor="middle" font-size="10" class="tm">config, model, blueprints</text>
    <line x1="330" y1="30" x2="358" y2="30" stroke="currentColor" marker-end="url(#fl-c0)"/>
    <rect x="360" y="10" width="140" height="40" rx="6" class="fb sb"/><text x="430" y="28" text-anchor="middle" font-size="11">before_request</text><text x="430" y="42" text-anchor="middle" font-size="10" class="tm">g.t0, request id</text>
    <line x1="500" y1="30" x2="528" y2="30" stroke="currentColor" marker-end="url(#fl-c0)"/>
    <rect x="530" y="10" width="140" height="40" rx="6" class="ft st"/><text x="600" y="28" text-anchor="middle" font-size="11">url_map</text><text x="600" y="42" text-anchor="middle" font-size="10" class="tm">/v1/... or /staff/...</text>
    <line x1="600" y1="50" x2="600" y2="78" stroke="currentColor" marker-end="url(#fl-c0)"/>
    <rect x="450" y="80" width="220" height="44" rx="6" class="fg sg"/><text x="560" y="98" text-anchor="middle" font-size="11">view: request.get_json, checks</text><text x="560" y="114" text-anchor="middle" font-size="10" class="tm">return dict / render_template / model</text>
    <line x1="450" y1="102" x2="372" y2="102" stroke="currentColor" marker-end="url(#fl-c0)"/>
    <rect x="230" y="80" width="140" height="44" rx="6" class="fr sr"/><text x="300" y="98" text-anchor="middle" font-size="11">errorhandler</text><text x="300" y="114" text-anchor="middle" font-size="10" class="tm">BadInput 422, 404, 500</text>
    <line x1="300" y1="124" x2="300" y2="152" stroke="currentColor" marker-end="url(#fl-c0)"/>
    <line x1="560" y1="124" x2="380" y2="164" stroke="currentColor" marker-end="url(#fl-c0)"/>
    <rect x="230" y="154" width="140" height="40" rx="6" class="fb sb"/><text x="300" y="172" text-anchor="middle" font-size="11">after_request</text><text x="300" y="186" text-anchor="middle" font-size="10" class="tm">X-Request-ID, log line</text>
    <line x1="230" y1="174" x2="152" y2="174" stroke="currentColor" marker-end="url(#fl-c0)"/>
    <rect x="10" y="154" width="140" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="80" y="178" text-anchor="middle" font-size="11">response</text>
    <rect x="10" y="210" width="660" height="30" rx="6" class="fv"/><text x="340" y="230" text-anchor="middle" font-size="11">test_client() drives the same path in-process, without gunicorn</text>
  </svg><figcaption>One request: the WSGI server hands it to the app built by <code>create_app</code>; hooks wrap the view chosen by the URL map; a raised error detours through a handler; after_request always runs last. Tests use the same path without a server.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On Biteful</th><th>When to use</th></tr>
    <tr><td>App</td><td>Flask object + WSGI server</td><td>how do I write a server?</td><td>one route, url_map with 2 rules</td><td>every Flask project</td></tr>
    <tr><td>Routes</td><td>decorators + converters</td><td>which function for this URL?</td><td>/11 → 200, /abc → 404, DELETE → 405</td><td>every endpoint</td></tr>
    <tr><td>Request / response</td><td><code>request</code>, return tuples</td><td>how do I read input, set status?</td><td>101 → 201 + Location; 12 of 23 lines checks</td><td>every endpoint with input</td></tr>
    <tr><td>Hooks, handlers</td><td>before/after_request, errorhandler</td><td>code around every request?</td><td>asha-001 echoed; KeyError → 500 + id ae1524e5</td><td>logging, ids, JSON errors</td></tr>
    <tr><td>Templates</td><td>Jinja2</td><td>safe HTML from data?</td><td>Ben's script → &amp;lt;script&amp;gt;</td><td>staff pages, emails</td></tr>
    <tr><td>Blueprints, factory</td><td>route groups + create_app</td><td>how to split and rebuild the app?</td><td>/v1 and /staff; 6 rules</td><td>more than a handful of routes</td></tr>
    <tr><td>Model serving</td><td>joblib + current_app.config</td><td>how does a model answer requests?</td><td>3.2 km, 2 items → 31.6 min</td><td>any ML endpoint</td></tr>
    <tr><td>Testing</td><td>test_client + pytest</td><td>does it still work?</td><td>8 passed in 2.20 s</td><td>always</td></tr>
    <tr><td>Limits</td><td>WSGI's one-request-per-thread</td><td>what breaks under load?</td><td>3.02 s → 1.01 s; 12 orders 4.02 s</td><td>decide Flask vs FastAPI</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Flask turns functions into URLs and gives you hooks around them, but everything about the input, from types to ranges to error lists, is your code, and each thread waits for one request at a time.</strong> Those two facts are exactly what FastAPI changes.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="api_fastapi">FastAPI</a>.</div>

  <h2 id="fl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Biteful orders API on port 5001. Restaurants 10 Dosa Hut (Pune 4.5), 11 Biryani Bros (Mumbai 4.2), 12 Pizza Point (Pune 3.9, no menu). Asha's order 101: 2 Masala Dosas = ₹240. Ben's order 102: 1 Idli = ₹60, note <code>&lt;script&gt;alert(1)&lt;/script&gt;</code>. ETA model: minutes = 12.68 + 4.03 × km + 3.02 × items.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>App</td><td>write a server without sockets?</td><td>GET /v1/restaurants works</td><td>one fixed path → routes</td></tr>
    <tr><td>Routes</td><td>which function for this URL/method?</td><td><code>&lt;int:rid&gt;</code>: 11 → 200, abc → 404; DELETE → 405</td><td>body, headers, status? → request/response</td></tr>
    <tr><td>Request/response</td><td>read input, choose status?</td><td>201 + Location; 400; 422 (first error only)</td><td>repeated cross-cutting code → hooks</td></tr>
    <tr><td>Hooks, handlers</td><td>code around every request; JSON errors?</td><td>X-Request-ID asha-001; KeyError → 500 + id</td><td>staff want HTML → templates</td></tr>
    <tr><td>Templates</td><td>safe HTML?</td><td>script escaped; else-branch "No orders yet"</td><td>one big file → blueprints</td></tr>
    <tr><td>Blueprints, factory</td><td>split and rebuild?</td><td>/v1 + /staff; create_app()</td><td>model needed → serving</td></tr>
    <tr><td>Model serving</td><td>model behind a URL?</td><td>31.6 min; "far" → 422</td><td>is it still right? → testing</td></tr>
    <tr><td>Testing</td><td>check without a server?</td><td>8 passed</td><td>load and validation → limits</td></tr>
    <tr><td>Limits</td><td>what breaks?</td><td>3.02 s / 1.01 s / 4.02 s; manual checks</td><td>→ <a class="xref" data-note="api_fastapi">FastAPI</a></td></tr>
  </table>
  <h3>Definitions and API</h3>
  <table class="tbl">
    <tr><th>Thing</th><th>What to remember</th></tr>
    <tr><td><code>Flask(__name__)</code></td><td>the app; <code>app.url_map</code> = routing table</td></tr>
    <tr><td><code>@app.get/post/patch(rule)</code></td><td>route; <code>&lt;int:x&gt;</code> converter → typed argument or 404</td></tr>
    <tr><td><code>request</code></td><td><code>.args.get(k, default, type)</code>, <code>.get_json(silent=True)</code>, <code>.headers</code>, <code>.form</code>, <code>.files</code></td></tr>
    <tr><td>Return values</td><td>dict → JSON 200; <code>(body, status, headers)</code></td></tr>
    <tr><td>Hooks</td><td><code>before_request</code> (may return early), <code>after_request(resp)</code> (must return resp), <code>g</code></td></tr>
    <tr><td>Errors</td><td><code>@app.errorhandler(404 | Exception | MyError)</code>; <code>abort(404)</code></td></tr>
    <tr><td>Jinja2</td><td><code>{{ x }}</code> auto-escaped; <code>{% for %}…{% else %}…{% endfor %}</code>; <code>render_template</code></td></tr>
    <tr><td>Structure</td><td><code>Blueprint(name, __name__, url_prefix=...)</code>; <code>create_app()</code>; <code>current_app</code></td></tr>
    <tr><td>Model</td><td>load once in the factory; <code>float()</code> results; version in responses</td></tr>
    <tr><td>Tests</td><td><code>app.test_client()</code>, fixtures, <code>parametrize</code></td></tr>
    <tr><td>Concurrency</td><td>requests in flight = workers × threads; time ≈ ceil(N / slots) × wait</td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use Flask for</b><p>Existing Flask services, small internal tools, server-rendered HTML (staff dashboards), quick prototypes.</p></div>
    <div><b>Prefer FastAPI for</b><p>New JSON APIs with lots of input validation, many slow external calls (email, LLMs), auto-generated docs, WebSockets.</p></div>
  </div>
  <h3>Traps</h3>
  <ul>
    <li><code>debug=True</code> on a server = remote code execution.</li>
    <li><code>type=float</code> silently uses the default for bad input.</li>
    <li>Hand checks stop at the first error.</li>
    <li><code>| safe</code> on user input = XSS.</li>
    <li>Loading the model per request; returning NumPy types; untrusted pickles.</li>
    <li>Shared module state leaking between tests.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li><code>GET /v1/restaurants/abc</code> with rule <code>&lt;int:rid&gt;</code>: who answers and with what? <em>Flask itself, 404; the view never runs.</em></li>
    <li>What must <code>after_request</code> return? <em>The response object it was given (possibly modified).</em></li>
    <li>Ben's note is <code>&lt;b&gt;hi&lt;/b&gt;</code>. What does <code>{{ o.note }}</code> print? <em><code>&amp;lt;b&amp;gt;hi&amp;lt;/b&amp;gt;</code>: the tags show as text.</em></li>
    <li>ETA for 2 km and 1 item? <em>12.68 + 8.06 + 3.02 = 23.76 ≈ 23.8 min.</em></li>
    <li>1 sync worker, 2 threads, 6 simultaneous 1 s requests: total time? <em>About 3 s (6 ÷ 2 = 3 rounds).</em></li>
  </ol>

  <h2 id="fl-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@app.get("/v1/restaurants/&lt;int:rid&gt;")</code> do?</summary><div class="qa-body">It registers a route: GET requests whose path matches, with an integer in the last segment, call the function below with <code>rid</code> as an int. A non-integer gives 404 before the function runs; another method gives 405. The return value becomes the response.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where should you load the model, and why?</summary><div class="qa-body">Once, at startup (in <code>create_app</code> or at import), not inside the view. Loading per request adds disk I/O and deserialization to every call and spikes memory. Each gunicorn worker process holds its own copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if a view raises an unhandled exception?</summary><div class="qa-body">Flask returns a 500 with an HTML page (or the debugger in debug mode). Register <code>@app.errorhandler(Exception)</code> to log it with a request id and return JSON, and raise your own exception types (like <code>BadInput</code>) for client errors so they map to 4xx.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>3 simultaneous requests to a view that waits 1 s, served by <code>gunicorn -w 1</code>. Total time?</summary><div class="qa-body">About 3 s: one sync worker serves them one after another (measured 3.02 s). With <code>--threads 3</code> or <code>-w 3</code>, about 1 s (1.01 s, 1.02 s). 12 requests on 3 threads: 4.02 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you add a request id and timing to every response?</summary><div class="qa-body"><code>before_request</code> stores <code>g.t0</code> and <code>g.request_id</code> (from the incoming <code>X-Request-ID</code> or a new uuid); <code>after_request</code> computes elapsed time, logs it with the id, and sets <code>X-Request-ID</code> on the response.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your <code>/v1/eta</code> returns 500 with "Object of type float32 is not JSON serializable". Fix?</summary><div class="qa-body">The model returned NumPy scalars. Convert with <code>float(x)</code>, <code>int(x)</code> or <code>arr.tolist()</code> before returning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are blueprints and the app factory for?</summary><div class="qa-body">Blueprints split routes into modules with URL prefixes (<code>/v1</code> API, <code>/staff</code> pages), each with its own templates and handlers. The factory builds a configured app on demand, so tests and different environments get fresh, independent instances.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is auto-escaping in templates important?</summary><div class="qa-body">User text (an order note) is printed into staff pages. Without escaping, <code>&lt;script&gt;</code> runs in the staff's browser (XSS) and can steal their session. Jinja2 converts it to <code>&amp;lt;script&amp;gt;</code>; never mark user input <code>| safe</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a Flask endpoint without starting a server?</summary><div class="qa-body"><code>client = create_app({"TESTING": True}).test_client()</code>, then <code>client.post("/v1/orders", json={...})</code> and assert on <code>r.status_code</code>, <code>r.json</code>, headers. Use a pytest fixture and <code>parametrize</code> for bad inputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's wrong with <code>app.run(debug=True, host="0.0.0.0")</code> on a server?</summary><div class="qa-body">It exposes the Werkzeug debugger to the network: anyone who triggers an error gets an interactive Python console. It is also a single-process development server. Use gunicorn with debug off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do hooks and error handlers need the request/response objects from section 03?</summary><div class="qa-body">A hook is just code that reads <code>request</code> (headers like <code>X-Request-ID</code>, the path) before the view and edits the response after it; an error handler builds a response instead of the view. Without one shared request object and a response that flows back through <code>after_request</code>, cross-cutting code would have to be copied into every view.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the app factory make testing (and serving a model) easier?</summary><div class="qa-body">Tests need a fresh app with test settings per test; a factory builds one on demand instead of sharing a global. The same function is the one place where expensive things like the ETA model are loaded once, and tests can pass config to swap them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you fix the slow receipt email only with more threads?</summary><div class="qa-body">Each waiting order still holds a thread, so capacity is threads × workers (12 orders on 3 threads took 4.02 s), memory grows with every thread, and a slow email provider slows checkout for everyone. The real fixes are async waiting (FastAPI) and moving the email off the request path (a task queue in Production).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does manual validation relate to status codes from the fundamentals note?</summary><div class="qa-body">Choosing 400 (unreadable body) vs 422 (readable but invalid values) is a decision every hand-written check must make correctly, along with the message. FastAPI makes the same decision automatically from type hints and lists all failing fields in one 422.</div></details>
</main>
`
});
