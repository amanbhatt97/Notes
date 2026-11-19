// notes/apis/api_flask.js — Flask
Object.assign(TOPIC_CONTENT, {
  "api_flask": `<main>
  <h1>Flask</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>Flask</span></div>
  <p class="lead">Flask is a small Python library for writing web servers: you write ordinary Python functions, tell Flask which web address belongs to which function, and Flask takes care of receiving requests and sending back responses. For a data scientist or ML engineer this is often the first backend code you write, because it is the quickest way to put a model, a report or an internal tool behind a URL that other programs and people can call. In <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a> you learned what a request and a response look like; this page shows how to write the program that answers them, and also where Flask stops helping you. Throughout the page we build one program, the Biteful food-delivery orders API, with three restaurants (Dosa Hut 10, Biryani Bros 11 and Pizza Point 12), Asha's order 101 of two Masala Dosas for ₹240, Ben's order with a suspicious note, and a small model that predicts delivery time. Every block was really run (Flask 3.1, Werkzeug 3.1, gunicorn 27), and the outputs are pasted exactly as they came.</p>

  <h2 id="fl-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Flask</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">App and WSGI</div>
        <ul>
          <li><b>WSGI</b>: the standard plug between a web server and a Python app</li>
          <li><code>app = Flask(__name__)</code> is a WSGI callable</li>
          <li><code>flask run</code> for development; <code>gunicorn</code> in production</li>
          <li>Never <code>debug=True</code> on a public server</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Handling a request</div>
        <ul>
          <li><b>Route</b>: URL pattern + methods → view function</li>
          <li><code>&lt;int:rid&gt;</code> converter: wrong type → 404, wrong method → 405</li>
          <li><code>request.args</code>, <code>.get_json()</code>, <code>.headers</code></li>
          <li>Return dict → JSON; <code>(body, 201, headers)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Around every request</div>
        <ul>
          <li><code>before_request</code> (can stop early), <code>after_request</code> (must return resp)</li>
          <li><code>g</code>: per-request scratch space</li>
          <li><code>errorhandler</code>: 404, 405, crashes → JSON</li>
          <li>WSGI middleware wraps <code>app.wsgi_app</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Structure, models, tests</div>
        <ul>
          <li>Jinja2 templates auto-escape → no XSS</li>
          <li>Blueprints group routes; <code>create_app()</code> builds fresh apps</li>
          <li>Load the model once at startup; <code>float()</code> NumPy values</li>
          <li><code>app.test_client()</code>: tests without a server</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits</div>
        <ul>
          <li>Sync worker: one request per thread, start to finish</li>
          <li>Capacity = workers × threads</li>
          <li>Validation is all hand-written, first error only</li>
          <li>→ FastAPI: async and automatic validation</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="fl-app"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The App Object and WSGI</span><span class="rm-sub">what a server needs, and the plug Flask fits into</span></div></div>
      <div class="rm-item rm-done" data-target="fl-routes"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Routing</span><span class="rm-sub">which function runs for which URL and method</span></div></div>
      <div class="rm-item rm-done" data-target="fl-req"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Request and Response Objects</span><span class="rm-sub">reading input, choosing the status, hand-written checks</span></div></div>
      <div class="rm-item rm-done" data-target="fl-mw"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Hooks, Middleware and Error Handlers</span><span class="rm-sub">code that runs around every request</span></div></div>
      <div class="rm-item rm-done" data-target="fl-tpl"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Jinja2 Templates</span><span class="rm-sub">building safe HTML pages from data</span></div></div>
      <div class="rm-item rm-done" data-target="fl-bp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Blueprints and the App Factory</span><span class="rm-sub">splitting a growing app, plus Flask-RESTful</span></div></div>
      <div class="rm-item rm-done" data-target="fl-ml"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Serving a Model</span><span class="rm-sub">a trained model behind /v1/eta</span></div></div>
      <div class="rm-item rm-done" data-target="fl-test"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Testing with the Test Client</span><span class="rm-sub">checking every endpoint without a server</span></div></div>
      <div class="rm-item rm-done" data-target="fl-sync"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Limits: Sync Workers and Manual Validation</span><span class="rm-sub">what happens under load, and why FastAPI exists</span></div></div>
      <div class="rm-item rm-done" data-target="fl-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">get_json, NumPy values, | safe, hooks</span></div></div>
      <div class="rm-item rm-done" data-target="fl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, syntax, numbers, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="fl-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what backend interviewers ask about Flask</span></div></div>
    </div>
  </div>

  <h2 id="fl-app"><span class="num">01</span>The App Object and WSGI</h2>
  <p>A web server is just a program that keeps running and waits for other programs to ask it things. To understand what Flask does for you, it helps to list what such a program has to do. When a program is running, the operating system calls it a <strong>process</strong>. The computer it runs on is the <strong>host</strong>, identified on a network by an address; the special name <code>localhost</code> (address <code>127.0.0.1</code>) always means "this same computer". A host can run many network programs at once, so each one listens on its own <strong>port</strong>, a number from 1 to 65535 that works like a door number on a building: a request addressed to <code>localhost:18201</code> is delivered to whichever process is listening at door 18201. The bytes travel over a <strong>TCP connection</strong>, a reliable two-way pipe between the client and the server. (<a class="xref" data-note="cf_networking">Networking</a> and <a class="xref" data-note="cf_os">Operating Systems</a> cover these in depth.)</p>
  <p>Writing a server from scratch means opening a port, accepting connections, reading raw bytes, cutting them into the request line, the headers and the body, deciding what to answer, writing the status line and headers back in exactly the right format, and doing all of that for many clients at once. Almost none of it has anything to do with restaurants. So the job is split in two. A <strong>web server</strong> program does all the generic networking work, and a Python <strong>application</strong> only decides what to answer. For the two halves to work together, Python has a standard hand-off between them called <strong>WSGI</strong> (Web Server Gateway Interface, pronounced "whiskey"). WSGI says that the application must be a callable that takes two arguments, <code>environ</code>, a dictionary describing the request, and <code>start_response</code>, a function the application calls with the status and the headers, and that it returns the body as bytes.</p>
  <p>Think of a restaurant with a hatch between the dining room and the kitchen. Waiters take orders from customers and pass each one through the hatch on a slip in a fixed format; the cooks never meet a customer, they just read slips and hand plates back. Because the slip format is fixed, any waiter can work with any kitchen. The waiters are the web server (gunicorn, uWSGI, Waitress, or Flask's own development server), the kitchen is your application, and the slip format is WSGI. To see that there is nothing magic about it, here is a complete WSGI application with no framework at all, together with a tiny fake server that calls it the way a real one would:</p>
  <div class="fx" data-lang="py"># A web app written against WSGI directly, with no framework
def app(environ, start_response):
    path = environ["PATH_INFO"]                      # the path the client asked for
    if path == "/v1/restaurants":
        body = b'{"items": ["Dosa Hut", "Biryani Bros"]}'
        start_response("200 OK", [("Content-Type", "application/json")])
    else:
        body = b"not found"
        start_response("404 NOT FOUND", [("Content-Type", "text/plain")])
    return [body]                                    # the body, as a list of bytes

# What a WSGI server (gunicorn, flask run) does for each request, in miniature
def fake_server(method, path):
    environ = {"REQUEST_METHOD": method, "PATH_INFO": path}
    def start_response(status, headers):
        print(status, headers)
    print(b"".join(app(environ, start_response)))

fake_server("GET", "/v1/restaurants")
fake_server("GET", "/v1/menus")</div>
  <div class="fx" data-lang="text">200 OK [('Content-Type', 'application/json')]
b'{"items": ["Dosa Hut", "Biryani Bros"]}'
404 NOT FOUND [('Content-Type', 'text/plain')]
b'not found'</div>
  <p>The fake server built an <code>environ</code> dictionary for each request and called <code>app</code>. For <code>/v1/restaurants</code> the application called <code>start_response("200 OK", ...)</code> and returned the JSON bytes; for <code>/v1/menus</code> it chose 404. A real server does the same thing, except that it fills <code>environ</code> with dozens of keys parsed from the real request and turns the status, headers and body back into HTTP text on the TCP connection.</p>
  <p>Writing applications at this level quickly becomes painful: you would parse query strings and JSON yourself, and the <code>if path == ...</code> chain would grow with every URL. <strong>Flask</strong> is a framework that builds the WSGI callable for you. The central object is the <strong>application object</strong>, created with <code>Flask(__name__)</code>; it holds the configuration and the list of URLs, and every request goes to it. You attach your functions to it with <strong>routes</strong>, written as <a class="xref" data-note="py_decorators">decorators</a> such as <code>@app.get("/v1/restaurants")</code>, and a function attached this way is called a <strong>view function</strong>. The <code>__name__</code> argument tells Flask which module the app lives in, so it can find the template and static-file folders next to it. Here is the same restaurant list in Flask, and to prove the point, we call the Flask app exactly as we called the plain function:</p>
  <div class="fx" data-lang="py">from flask import Flask
from werkzeug.test import EnvironBuilder

app = Flask(__name__)                          # the application object

@app.get("/v1/restaurants")                    # route: GET on this path runs the function below
def list_restaurants():                        # a view function
    return {"items": ["Dosa Hut", "Biryani Bros"]}

print(app.url_map)                             # the routing table the decorator filled in

# The Flask app is itself a WSGI callable: call it exactly like the plain function above
def start_response(status, headers):
    print(status, headers)

environ = EnvironBuilder(method="GET", path="/v1/restaurants").get_environ()
print(b"".join(app(environ, start_response)))</div>
  <div class="fx" data-lang="text">Map([&lt;Rule '/static/&lt;filename&gt;' (GET, HEAD, OPTIONS) -&gt; static&gt;,
 &lt;Rule '/v1/restaurants' (GET, HEAD, OPTIONS) -&gt; list_restaurants&gt;])
200 OK [('Content-Type', 'application/json'), ('Content-Length', '38')]
b'{"items":["Dosa Hut","Biryani Bros"]}\n'</div>
  <p>The first two lines of output are the app's <code>url_map</code>, the routing table the decorator filled in. Our rule is there with GET, plus HEAD and OPTIONS, which Flask answers for free; the <code>/static/&lt;filename&gt;</code> rule is added automatically for serving files such as images. The last two lines show that the Flask app really is a WSGI callable: given an <code>environ</code>, it called <code>start_response</code> with <code>200 OK</code>, turned our dictionary into JSON, and even added a <code>Content-Length</code> header for us.</p>
  <p>Now let us serve it over a real network. The command <code>flask --app hello run</code> starts Werkzeug's development server (Werkzeug is the toolkit Flask is built on), which opens a port, turns each incoming HTTP request into an <code>environ</code>, and calls the app. Here <code>hello.py</code> contains just the app part of the block above, and <code>curl</code> is a command-line HTTP client:</p>
  <div class="fx" data-lang="py">from flask import Flask

app = Flask(__name__)

@app.get("/v1/restaurants")
def list_restaurants():
    return {"items": ["Dosa Hut", "Biryani Bros"]}</div>
  <div class="fx" data-lang="text">$ flask --app hello run --port 18201                 # terminal 1: the server
$ curl -si localhost:18201/v1/restaurants        # terminal 2: a client
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.13.18
Date: Thu, 19 Nov 2026 07:33:02 GMT
Content-Type: application/json
Content-Length: 38
Connection: close

{"items":["Dosa Hut","Biryani Bros"]}

$ curl -s -o /dev/null -w '%{http_code}\n' localhost:18201/v1/menus        # terminal 2: a client
404

--- what terminal 1 printed ---
 * Serving Flask app 'hello'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:18201
Press CTRL+C to quit
127.0.0.1 - - [19/Nov/2026 07:33:02] "GET /v1/restaurants HTTP/1.1" 200 -
127.0.0.1 - - [19/Nov/2026 07:33:02] "GET /v1/menus HTTP/1.1" 404 -</div>
  <p>The server said it was <code>Running on http://127.0.0.1:18201</code>, so it was listening on port 18201 of this machine. The first curl received a full HTTP response: status line, headers (including <code>Server: Werkzeug</code>, added by the development server) and our JSON body. The second asked for a path that has no route, so Flask answered 404 by itself. The server printed one log line per request with the method, path and status.</p>
  <p>Notice the warning in the server's output. The development server handles requests in a simple way, is not hardened against attacks, and is meant only for your own machine. It also has a debug mode (<code>flask run --debug</code> or <code>app.run(debug=True)</code>) that shows an interactive Python console in the browser whenever a view crashes; on a server reachable by others, that lets anyone who can trigger an error run code on your machine. In production the very same app object is handed to a production WSGI server such as <strong>gunicorn</strong> (<code>gunicorn hello:app</code>), which runs several copies of it; section 09 measures what that means.</p>

  <h2 id="fl-routes"><span class="num">02</span>Routing</h2>
  <p>Biteful has many restaurants, and the app asks for one at a time: <code>GET /v1/restaurants/10</code>, then <code>/v1/restaurants/11</code>, and next month restaurant 500. Writing one function per restaurant is obviously absurd. On top of that, the same path can be used with different HTTP methods, GET to read and DELETE to remove, and each must run different code or be refused. We need a way to say "any URL of this shape, with this method, goes to this function, and here is the variable part".</p>
  <p>That is what a <strong>route</strong> is: a rule that links a URL pattern and a set of allowed HTTP methods to one view function. A part of the pattern written in angle brackets, like <code>&lt;rid&gt;</code>, is a <strong>path parameter</strong>: Flask cuts that piece out of the real URL and passes it to the function as an argument. A <strong>converter</strong> in front of the name, as in <code>&lt;int:rid&gt;</code>, says what type the piece must have and converts it, so your function receives the integer 11, not the string <code>"11"</code>. Think of a post office sorting room: one clerk handles every letter addressed to "Restaurant Street, house number N", and the sorting machine hands the clerk the letter along with the number N. Letters for a house number that is not a number at all never reach that clerk.</p>
  <p>Step by step, this is what Flask does. When your module is imported, each decorator adds a rule to <code>app.url_map</code>. When a request arrives, Flask compares its path with the rules. If no rule's pattern fits the path (including a converter that refuses the value), the answer is <strong>404 Not Found</strong> and no view runs. If a pattern fits but the method is not in that rule's list, the answer is <strong>405 Method Not Allowed</strong>, with an <code>Allow</code> header listing the methods that would have worked. Otherwise Flask converts the parameters and calls the view with them as keyword arguments. In the block below, <code>app.test_client()</code> gives us an object that sends requests straight to the app without starting a server; section 08 explains it properly, and for now read <code>client.open(url, method=...)</code> as "send this request".</p>
  <div class="fx" data-lang="py">from flask import Flask

# RESTAURANTS = {10: {"id": 10, "name": "Dosa Hut", "city": "Pune", "rating": 4.5},
#                11: {... "Biryani Bros", "Mumbai", 4.2}, 12: {... "Pizza Point", "Pune", 3.9}}
app = Flask(__name__)
app.json.sort_keys = False                         # keep keys in the order we wrote them

@app.get("/v1/restaurants")
def list_restaurants():
    return {"items": [r["name"] for r in RESTAURANTS.values()]}

@app.get("/v1/restaurants/&lt;int:rid&gt;")              # &lt;int:rid&gt;: a variable part, must be an int
def get_restaurant(rid):                           # Flask passes it in as an argument
    if rid not in RESTAURANTS:
        return {"error": "restaurant not found"}, 404
    return RESTAURANTS[rid]

client = app.test_client()                         # sends requests to the app, no server needed
for method, url in [("GET", "/v1/restaurants/11"), ("GET", "/v1/restaurants/99"),
                    ("GET", "/v1/restaurants/abc"), ("DELETE", "/v1/restaurants/11")]:
    r = client.open(url, method=method)
    body = r.json if r.is_json else "(Flask's own HTML error page)"
    print(f"{method:6} {url:20} -&gt; {r.status:22} {body}")
print("Allow header on the 405:", r.headers["Allow"])</div>
  <div class="fx" data-lang="text">GET    /v1/restaurants/11   -&gt; 200 OK                 {'id': 11, 'name': 'Biryani Bros', 'city': 'Mumbai', 'rating': 4.2}
GET    /v1/restaurants/99   -&gt; 404 NOT FOUND          {'error': 'restaurant not found'}
GET    /v1/restaurants/abc  -&gt; 404 NOT FOUND          (Flask's own HTML error page)
DELETE /v1/restaurants/11   -&gt; 405 METHOD NOT ALLOWED (Flask's own HTML error page)
Allow header on the 405: OPTIONS, GET, HEAD</div>
  <p>Each line of output is one request. <code>/v1/restaurants/11</code> matched the rule, the converter turned "11" into 11, and the view returned Biryani Bros as JSON. <code>/v1/restaurants/99</code> also matched, the view ran, found no restaurant 99 and returned <em>our</em> JSON error with 404. <code>/v1/restaurants/abc</code> looks similar but is completely different: "abc" is not an integer, so the rule never matched, our function never ran, and Flask produced its own HTML 404 page. The DELETE matched the path but not the method, so Flask answered 405 and the <code>Allow</code> header says only GET, HEAD and OPTIONS are accepted. Telling these two kinds of 404 apart matters when you debug: if your view is not even being called, the route pattern or converter is the problem.</p>
  <p>The built-in converters are <code>string</code> (the default; anything without a slash), <code>int</code>, <code>float</code>, <code>path</code> (like string but allows slashes) and <code>uuid</code>. The decorators <code>@app.get</code>, <code>@app.post</code>, <code>@app.put</code>, <code>@app.patch</code> and <code>@app.delete</code> are shortcuts for the older, general form <code>@app.route("/path", methods=["GET", "POST"])</code>, which you will see in a lot of existing code. Every rule also has an <strong>endpoint</strong> name, by default the function's name, and <code>url_for("get_restaurant", rid=11)</code> builds the matching URL from it, so templates and redirects do not need to hard-code paths.</p>

  <h2 id="fl-req"><span class="num">03</span>The Request and Response Objects</h2>
  <p>The path only tells us which restaurant. Most requests carry more than that. A search such as <code>/v1/restaurants?city=Pune</code> puts filters in the <strong>query string</strong>, the part after the <code>?</code>. Asha's order arrives as <code>POST /v1/orders</code> with a <strong>body</strong> (also called the <strong>payload</strong>), the data sent after the headers, here a JSON object listing what she wants. And <strong>headers</strong>, the "Name: value" lines of extra information at the top of every request, tell us things like the body's format (<code>Content-Type: application/json</code>) and, in our app, who the customer is (<code>X-Customer: asha</code>). The view needs to read all of this, and then it needs to reply with the right status code, not always 200: a new order should get <code>201 Created</code> and a <code>Location</code> header pointing at it.</p>
  <p>For reading, Flask gives you the <strong><code>request</code> object</strong>: an object, imported from <code>flask</code>, that describes the request currently being handled. Each kind of input has its own attribute:</p>
  <table class="tbl">
    <tr><th>Input</th><th>Biteful example</th><th>How to read it</th></tr>
    <tr><td>Path parameter</td><td><code>/v1/restaurants/11</code></td><td>the view's argument, <code>rid</code></td></tr>
    <tr><td>Query string</td><td><code>?city=Pune&amp;min_rating=4</code></td><td><code>request.args.get("city")</code></td></tr>
    <tr><td>JSON body</td><td><code>{"restaurant_id": 10, "items": [...]}</code></td><td><code>request.get_json(silent=True)</code></td></tr>
    <tr><td>Headers</td><td><code>X-Customer: asha</code></td><td><code>request.headers.get("X-Customer")</code></td></tr>
    <tr><td>Form fields, uploads</td><td>a menu photo</td><td><code>request.form</code>, <code>request.files</code></td></tr>
    <tr><td>Method, path, cookies</td><td><code>POST</code>, <code>/v1/orders</code></td><td><code>request.method</code>, <code>request.path</code>, <code>request.cookies</code></td></tr>
  </table>
  <p>Let us start with the query string. <code>request.args</code> behaves like a dictionary of the query parameters, and its <code>get</code> method can also convert a value with <code>type=float</code>:</p>
  <div class="fx" data-lang="py">from flask import Flask, request

app = Flask(__name__)
app.json.sort_keys = False

@app.get("/v1/restaurants")
def list_restaurants():
    city = request.args.get("city")                                  # ?city=Pune, or None
    min_rating = request.args.get("min_rating", default=0.0, type=float)
    return {"items": [r["name"] for r in RESTAURANTS.values()
                      if (city is None or r["city"] == city) and r["rating"] &gt;= min_rating]}

c = app.test_client()
print(c.get("/v1/restaurants?city=Pune").json)
print(c.get("/v1/restaurants?city=Pune&amp;min_rating=4").json)
print(c.get("/v1/restaurants?min_rating=high").json)                # not a number!</div>
  <div class="fx" data-lang="text">{'items': ['Dosa Hut', 'Pizza Point']}
{'items': ['Dosa Hut']}
{'items': ['Dosa Hut', 'Biryani Bros', 'Pizza Point']}</div>
  <p>The first two searches behave as expected: Pune gives Dosa Hut and Pizza Point, and adding <code>min_rating=4</code> removes Pizza Point (3.9). The third line is a warning. <code>min_rating=high</code> is not a number, yet there was no error: <code>type=float</code> means "try to convert, and if that fails, quietly use the default", so the filter became 0.0 and all three restaurants came back. Flask never checks types for you; if the input is wrong, it is up to your code to notice.</p>
  <p>That becomes very clear when we write the order endpoint. <code>request.get_json(silent=True)</code> parses the body as JSON and returns a Python dictionary, or <code>None</code> if the body is not valid JSON (without <code>silent=True</code> it raises an error instead; see Common Mistakes). Everything else, whether the restaurant exists, whether <code>items</code> is a list, whether each quantity is a sensible whole number, has to be checked by hand. When a view returns a <strong>tuple</strong> of <code>(body, status, headers)</code>, Flask uses those for the response. We use two different error statuses on purpose: <strong>400 Bad Request</strong> when the body cannot even be read as a JSON object, and <strong>422 Unprocessable Entity</strong> when it can be read but the values are wrong.</p>
  <div class="fx" data-lang="py">from flask import Flask, request

app = Flask(__name__)
app.json.sort_keys = False
ORDERS, NEXT_ID = {}, [101]

@app.post("/v1/orders")
def create_order():
    body = request.get_json(silent=True)                  # parsed JSON, or None if it isn't JSON
    if not isinstance(body, dict):
        return {"error": "body must be a JSON object"}, 400
    rid = body.get("restaurant_id")
    if not isinstance(rid, int) or rid not in MENUS:
        return {"error": "restaurant_id must be a restaurant with a menu"}, 422
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
    return ORDERS[oid], 201, {"Location": f"/v1/orders/{oid}"}   # body, status, headers

c = app.test_client()
r = c.post("/v1/orders", headers={"X-Customer": "asha"},
           json={"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]})
print(r.status, "| Location:", r.headers["Location"])
print(r.json)

for body in ['two dosas please',
             '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": "two"}]}',
             '{"restaurant_id": 10, "items": [{"name": "Pizza", "qty": 1}, {"name": "Idli", "qty": 99}]}']:
    r = c.post("/v1/orders", data=body, content_type="application/json")
    print(r.status, r.json)</div>
  <div class="fx" data-lang="text">201 CREATED | Location: /v1/orders/101
{'order_id': 101, 'customer': 'asha', 'restaurant_id': 10, 'items': [{'name': 'Masala Dosa', 'qty': 2}], 'total': 240, 'status': 'placed'}
400 BAD REQUEST {'error': 'body must be a JSON object'}
422 UNPROCESSABLE ENTITY {'error': 'items[0].qty must be a whole number from 1 to 10'}
422 UNPROCESSABLE ENTITY {'error': "items[0].name: 'Pizza' is not on the menu"}</div>
  <p>Trace Asha's order through the checks: the body is a dictionary, restaurant 10 has a menu, <code>items</code> is a list of one, "Masala Dosa" is on the menu and quantity 2 is a whole number between 1 and 10, so the total is 120 × 2 = 240. The view stored order 101, read the customer name from the <code>X-Customer</code> header, and returned the order with status 201 and <code>Location: /v1/orders/101</code>. The other three requests show the checks at work. The plain-text body made <code>get_json</code> return <code>None</code>, so we answered 400. <code>"qty": "two"</code> is valid JSON with a wrong value, so 422. The last body has two mistakes, an item that is not on the menu and a quantity of 99, but only the first was reported, because each check returns as soon as it fails. A mobile app would have to fix one mistake, send again, and only then discover the next.</p>
  <p>Count the cost. Of the 23 lines inside <code>create_order</code>, 12 are checks: six <code>if</code> statements and six error returns. Every endpoint that accepts input needs its own set, written and tested by hand. Keep that number in mind; it is one of the two reasons the next note, <a class="xref" data-note="api_fastapi">FastAPI</a>, exists.</p>
  <p>You may have noticed something odd. <code>request</code> is imported once at the top of the module, like a global variable, yet a real server handles many requests at the same time, each with a different body. How can one global name mean the right request in every view? The answer is the <strong>request context</strong>. When a request starts, Flask records it as "the current request" for the thread handling it (a <strong>thread</strong> is one independent line of execution inside a process), and <code>request</code> is a stand-in, called a proxy, that looks up the current request every time you use it. It is like a cashier's counter with a "current customer" card: every cashier has their own card, so "the customer" always means the person standing at <em>your</em> counter. Outside a request there is no current customer, which is exactly what this shows, along with the different things a view can return:</p>
  <div class="fx" data-lang="py">from flask import Flask, request, make_response

app = Flask(__name__)

# 1. request only has a value while a request is being handled
with app.test_request_context("/v1/restaurants?city=Pune", headers={"X-Customer": "asha"}):
    print(request.method, request.path, dict(request.args), request.headers["X-Customer"])
try:
    request.path                                   # no request is being handled now
except RuntimeError as e:
    print("RuntimeError:", str(e).splitlines()[0])

# 2. What a view returns decides the response
@app.get("/text")
def text():
    return "Dosa Hut is open"                      # str -&gt; HTML

@app.get("/list")
def as_list():
    return ["Dosa Hut", "Biryani Bros"]            # dict or list -&gt; JSON

@app.get("/made")
def made():
    resp = make_response({"ok": True}, 202)        # build the Response object yourself
    resp.headers["Cache-Control"] = "no-store"
    resp.set_cookie("last_city", "Pune")
    return resp

c = app.test_client()
for url in ["/text", "/list", "/made"]:
    r = c.get(url)
    print(f"{url:6} {r.status:13} {r.content_type:25} {r.get_data(as_text=True).strip()}")
print("extra headers on /made:", r.headers["Cache-Control"], "|", r.headers["Set-Cookie"])</div>
  <div class="fx" data-lang="text">GET /v1/restaurants {'city': 'Pune'} asha
RuntimeError: Working outside of request context.
/text  200 OK        text/html; charset=utf-8  Dosa Hut is open
/list  200 OK        application/json          ["Dosa Hut","Biryani Bros"]
/made  202 ACCEPTED  application/json          {"ok":true}
extra headers on /made: no-store | last_city=Pune; Path=/</div>
  <p>Inside <code>test_request_context</code> (a helper that pretends a request is in progress) <code>request</code> knew the method, path, query arguments and header. Outside it, the same name raised "Working outside of request context". The second half shows Flask's rules for return values: a string becomes an HTML response, a dictionary or list becomes JSON, and if you need full control, <code>make_response</code> gives you the actual <strong>Response object</strong> so you can set any status, extra headers such as <code>Cache-Control</code>, or a cookie with <code>set_cookie</code> before returning it.</p>

  <h2 id="fl-mw"><span class="num">04</span>Hooks, Middleware and Error Handlers</h2>
  <p>Some work belongs to every request rather than to any one endpoint. Biteful's support team wants every response stamped with a <strong>request id</strong>, a short code that also appears in the server's log, so that when Asha reports a problem they can find exactly what happened. They also want each request's duration logged. And whenever something goes wrong, an unknown URL, a wrong method or a bug in our code, the mobile app needs a JSON error it can read, not Flask's HTML page. Copying this code into every view would add even more lines to the 12 we already counted, and sooner or later someone would forget it in a new endpoint.</p>
  <p>Flask's answer is <strong>hooks</strong>: functions that Flask itself calls at fixed points of every request. A function decorated with <code>@app.before_request</code> runs before the view; if it returns a response, the view is skipped entirely, which is how checks like "maintenance mode" or "not logged in" are written. A function decorated with <code>@app.after_request</code> receives the finished response, may change it, and must return it. (<code>@app.teardown_request</code> also exists; it runs at the very end even if something crashed and is used for cleanup such as closing a database connection.) To pass information from one hook to another, Flask provides <strong><code>g</code></strong>, a scratch object that lives for exactly one request. For failures there are <strong>error handlers</strong>: <code>@app.errorhandler(404)</code> or <code>@app.errorhandler(SomeException)</code> registers a function that builds the response whenever that status or exception occurs, and <code>abort(404)</code> inside a view raises a 404 on purpose.</p>
  <p>Hooks are like airport security on the way in and customs on the way out: every passenger passes through them, whatever flight they are on, so the flights themselves (your views) stay simple. The error handler is the airline's help desk: whatever went wrong, you get a slip in the same standard format. The picture shows the path one request takes:</p>
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
  </svg><figcaption>Every request passes the blue hooks on both sides of the view. If the view raises an exception, or no route matched, the red error handler builds the response instead, and that response still goes through after_request.</figcaption></figure>
  <p>Follow the arrows: the request first meets <code>before_request</code>, which starts a timer and sets the request id; then the view runs; then <code>after_request</code> adds the header and writes the log line. If the view raises, or Flask raises a 404 or 405 before any view is chosen, the dashed path goes to the error handler, and its response rejoins the normal path at <code>after_request</code>. That is why even error responses get a request id. Here is all of it in code. The menu route contains a deliberate bug: Pizza Point exists, but has no menu.</p>
  <div class="fx" data-lang="py">import itertools, logging, sys, time
from flask import Flask, request, g, abort
from werkzeug.exceptions import HTTPException

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s %(message)s")
app = Flask(__name__)
app.json.sort_keys = False
ids = itertools.count(1)                             # simple request-id generator

@app.get("/v1/restaurants/&lt;int:rid&gt;")
def get_restaurant(rid):
    if rid not in RESTAURANTS:
        abort(404)                                   # stop here and raise a 404
    return RESTAURANTS[rid]

@app.get("/v1/restaurants/&lt;int:rid&gt;/menu")
def get_menu(rid):
    if rid not in RESTAURANTS:
        abort(404)
    return MENUS[rid]                  # bug: Pizza Point (12) has no menu -&gt; KeyError

# ---------- hooks: run around EVERY request ----------
@app.before_request
def start():
    g.t0 = time.perf_counter()                       # g: scratch space for this one request
    g.request_id = request.headers.get("X-Request-ID") or f"req-{next(ids)}"
    if app.config.get("MAINTENANCE"):
        return {"error": "down for maintenance"}, 503   # returning here skips the view

@app.after_request
def finish(resp):
    ms = (time.perf_counter() - g.t0) * 1000
    resp.headers["X-Request-ID"] = g.request_id
    app.logger.info("%s %s %s -&gt; %s in %.1f ms", g.request_id, request.method,
                    request.path, resp.status_code, ms)
    return resp                                      # after_request must return the response

# ---------- error handlers: every error becomes JSON ----------
@app.errorhandler(404)
def not_found(e):
    return {"error": "not_found", "path": request.path}, 404

@app.errorhandler(405)
def wrong_method(e):
    return {"error": "method_not_allowed", "allowed": sorted(e.valid_methods)}, 405

@app.errorhandler(Exception)
def crashed(e):
    if isinstance(e, HTTPException):                 # other HTTP errors raised by Flask
        return {"error": e.name}, e.code
    app.logger.error("request %s crashed: %r", g.request_id, e)
    return {"error": "internal_error", "request_id": g.request_id}, 500

c = app.test_client()
for method, url, headers in [("GET", "/v1/restaurants/10", {"X-Request-ID": "asha-001"}),
                             ("GET", "/v1/restaurants/99", {}),
                             ("DELETE", "/v1/restaurants/10", {}),
                             ("GET", "/v1/restaurants/12/menu", {})]:
    r = c.open(url, method=method, headers=headers)
    print("   client got:", r.status_code, r.json, "| X-Request-ID:", r.headers["X-Request-ID"])

app.config["MAINTENANCE"] = True
r = c.get("/v1/restaurants/10")
print("   client got:", r.status_code, r.json)</div>
  <div class="fx" data-lang="text">INFO asha-001 GET /v1/restaurants/10 -&gt; 200 in 0.1 ms
   client got: 200 {'id': 10, 'name': 'Dosa Hut', 'city': 'Pune', 'rating': 4.5} | X-Request-ID: asha-001
INFO req-1 GET /v1/restaurants/99 -&gt; 404 in 0.1 ms
   client got: 404 {'error': 'not_found', 'path': '/v1/restaurants/99'} | X-Request-ID: req-1
INFO req-2 DELETE /v1/restaurants/10 -&gt; 405 in 0.1 ms
   client got: 405 {'error': 'method_not_allowed', 'allowed': ['GET', 'HEAD', 'OPTIONS']} | X-Request-ID: req-2
ERROR request req-3 crashed: KeyError(12)
INFO req-3 GET /v1/restaurants/12/menu -&gt; 500 in 0.1 ms
   client got: 500 {'error': 'internal_error', 'request_id': 'req-3'} | X-Request-ID: req-3
INFO req-4 GET /v1/restaurants/10 -&gt; 503 in 0.0 ms
   client got: 503 {'error': 'down for maintenance'}</div>
  <p>The lines starting with INFO or ERROR are the server's log; the indented lines are what the client received. The first request sent its own id, <code>asha-001</code>; <code>before_request</code> kept it in <code>g</code>, and <code>after_request</code> put it on the response and in the log line along with the time taken. Requests without an id got one from a simple counter (<code>req-1</code>, <code>req-2</code>, ...); real apps usually generate a random UUID instead, and the counter only keeps this example's output predictable. Restaurant 99 and the DELETE now get our JSON instead of HTML pages, and the 405 even lists the allowed methods. Menu 12 raised a <code>KeyError</code>; the catch-all handler logged it under request id <code>req-3</code> and gave the client only that id and a generic message. That is deliberate: sending the exception text to the client can leak file paths, SQL or other internals, while the id lets support find the real error in the log (in real code, use <code>app.logger.exception</code>, which also logs the full traceback). The catch-all handler passes Flask's own HTTP errors through unchanged, otherwise it would turn every 404 into a 500. Finally, with <code>MAINTENANCE</code> switched on, <code>before_request</code> returned a 503 and the view never ran.</p>
  <p>You will also hear the word <strong>middleware</strong>. In general it means code that sits between the server and your views and sees every request. In Flask, hooks are the usual way to do this, but there is a second, lower-level kind: <strong>WSGI middleware</strong>. Because a WSGI app is just a callable, you can wrap it in another callable that receives the raw <code>environ</code> first, does something, and then calls the real app. Flask keeps its inner WSGI app in <code>app.wsgi_app</code> so you can wrap it:</p>
  <div class="fx" data-lang="py">from flask import Flask

app = Flask(__name__)

@app.get("/v1/restaurants")
def list_restaurants():
    return {"items": ["Dosa Hut", "Biryani Bros"]}

class AddServerName:                                  # WSGI middleware
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app                      # the app it wraps
    def __call__(self, environ, start_response):      # looks like a WSGI app from outside
        print("middleware saw:", environ["REQUEST_METHOD"], environ["PATH_INFO"])
        def start_response_with_header(status, headers, exc_info=None):
            headers.append(("X-Served-By", "biteful-web-1"))
            return start_response(status, headers, exc_info)
        return self.wsgi_app(environ, start_response_with_header)

app.wsgi_app = AddServerName(app.wsgi_app)            # wrap Flask's inner WSGI app

r = app.test_client().get("/v1/restaurants")
print(r.status, r.headers["X-Served-By"], r.json)</div>
  <div class="fx" data-lang="text">middleware saw: GET /v1/restaurants
200 OK biteful-web-1 {'items': ['Dosa Hut', 'Biryani Bros']}</div>
  <p>The wrapper saw the method and path before Flask did, and it added an <code>X-Served-By</code> header by intercepting <code>start_response</code>, all without Flask knowing it was there. A common real example is Werkzeug's <code>ProxyFix</code>, which corrects the client's IP address when the app runs behind a reverse proxy such as nginx. Use hooks when you need Flask things such as <code>request</code>, <code>g</code> or the matched route; use WSGI middleware when the job has nothing to do with Flask and could wrap any WSGI app.</p>

  <h2 id="fl-tpl"><span class="num">05</span>Jinja2 Templates</h2>
  <p>So far every response has been JSON for the mobile app. Dosa Hut's kitchen staff, however, want a web page in the browser listing today's orders, including the note each customer typed. A web page is written in <strong>HTML</strong>, a text format of tags such as <code>&lt;h1&gt;</code> (a heading) and <code>&lt;li&gt;</code> (a list item) that the browser turns into a page; a <code>&lt;script&gt;</code> tag contains JavaScript code that the browser runs. Gluing HTML strings together in Python is ugly, and it is dangerous: Ben typed <code>&lt;script&gt;alert('hacked')&lt;/script&gt;</code> as his note. If that text were pasted into the page as it is, the staff's browser would run Ben's code, which could, for example, steal their login.</p>
  <p>The solution is a <strong>template</strong>: an HTML file with holes in it, filled in with data when the page is requested. Flask uses the <strong>Jinja2</strong> template engine. Inside a template, <code>{{ value }}</code> prints a value, <code>{% ... %}</code> holds logic such as <code>{% for o in orders %}</code> (with an optional <code>{% else %}</code> that runs when the list is empty), <code>{# ... #}</code> is a comment that never appears in the output, and a <strong>filter</strong> written with a bar, such as <code>{{ name | title }}</code>, transforms a value before printing it. Crucially, every value printed with <code>{{ }}</code> is <strong>auto-escaped</strong>: characters that mean something in HTML, such as <code>&lt;</code>, <code>&gt;</code> and quotes, are replaced by codes such as <code>&amp;lt;</code> that the browser displays as the characters themselves rather than treating them as tags. Think of a printed order slip with boxes: whatever a customer writes goes inside a box as plain writing and can never change the layout of the slip.</p>
  <p>Templates can also share a common frame through <strong>template inheritance</strong>. A layout template defines named blocks with <code>{% block name %}</code>; a page template starts with <code>{% extends "layout.html" %}</code> and fills in only those blocks, so the title, menus and styling are written once. Here are the two templates for the staff page, saved in a <code>templates</code> folder next to the app, where <code>render_template</code> looks for them:</p>
  <div class="fx" data-lang="text">{# templates/layout.html: the frame every staff page shares #}
&lt;title&gt;Biteful staff&lt;/title&gt;
&lt;h1&gt;{% block heading %}{% endblock %}&lt;/h1&gt;
{% block content %}{% endblock %}</div>
  <div class="fx" data-lang="text">{# templates/orders.html: fills the holes in layout.html #}
{% extends "layout.html" %}
{% block heading %}{{ restaurant.name }}: today's orders{% endblock %}
{% block content %}
&lt;ul&gt;
{% for o in orders %}
  &lt;li&gt;#{{ o.order_id }} {{ o.customer | title }} ₹{{ o.total }} | note: {{ o.note }}&lt;/li&gt;
{% else %}
  &lt;li&gt;No orders yet&lt;/li&gt;
{% endfor %}
&lt;/ul&gt;
{% endblock %}</div>
  <p>The view finds the restaurant's orders and calls <code>render_template</code> with the template's name and the values to fill in; it returns the finished HTML as a string. We request the page for Dosa Hut, which has Asha's and Ben's orders, and for Biryani Bros, which has none:</p>
  <div class="fx" data-lang="py">from flask import Flask, render_template, abort

app = Flask(__name__)                    # looks for templates in ./templates
ORDERS = {101: {"order_id": 101, "customer": "asha", "restaurant_id": 10, "total": 240,
                "note": "extra chutney"},
          102: {"order_id": 102, "customer": "ben", "restaurant_id": 10, "total": 60,
                "note": "&lt;script&gt;alert('hacked')&lt;/script&gt;"}}   # typed by Ben in the app

@app.get("/staff/&lt;int:rid&gt;/orders")
def orders_page(rid):
    if rid not in RESTAURANTS:
        abort(404)
    mine = [o for o in ORDERS.values() if o["restaurant_id"] == rid]
    return render_template("orders.html", restaurant=RESTAURANTS[rid], orders=mine)

c = app.test_client()
for rid in (10, 11):
    html = c.get(f"/staff/{rid}/orders").get_data(as_text=True)
    print("\n".join(line for line in html.splitlines() if line.strip()))   # drop blank lines
    print("-" * 40)</div>
  <div class="fx" data-lang="text">&lt;title&gt;Biteful staff&lt;/title&gt;
&lt;h1&gt;Dosa Hut: today's orders&lt;/h1&gt;
&lt;ul&gt;
  &lt;li&gt;#101 Asha ₹240 | note: extra chutney&lt;/li&gt;
  &lt;li&gt;#102 Ben ₹60 | note: &amp;lt;script&amp;gt;alert(&amp;#39;hacked&amp;#39;)&amp;lt;/script&amp;gt;&lt;/li&gt;
&lt;/ul&gt;
----------------------------------------
&lt;title&gt;Biteful staff&lt;/title&gt;
&lt;h1&gt;Biryani Bros: today's orders&lt;/h1&gt;
&lt;ul&gt;
  &lt;li&gt;No orders yet&lt;/li&gt;
&lt;/ul&gt;
----------------------------------------</div>
  <p>The output shows each Jinja2 feature at work. Inheritance merged the two files: the <code>&lt;title&gt;</code> came from the layout and the heading and list from the orders page, while the <code>{# #}</code> comments vanished. The <code>title</code> filter turned "asha" into "Asha". Ben's note came out as <code>&amp;lt;script&amp;gt;alert(&amp;#39;hacked&amp;#39;)...</code>: the browser will show those characters on screen, but it will not run them. Biryani Bros has no orders, so the <code>{% else %}</code> branch printed "No orders yet". The attack Ben tried, sneaking code into a page through user input, is called <strong>XSS</strong> (cross-site scripting), and auto-escaping is the main defence against it. Two limits are worth remembering: the <code>| safe</code> filter switches escaping off for a value (Common Mistakes shows what happens), and HTML escaping only protects HTML text; values placed inside a <code>&lt;script&gt;</code> block or a URL need different encoding.</p>

  <h2 id="fl-bp"><span class="num">06</span>Blueprints and the App Factory</h2>
  <p>Our server now has customer JSON endpoints under <code>/v1</code>, staff HTML pages under <code>/staff</code>, error handlers, and soon a model endpoint. In one file with one global <code>app = Flask(__name__)</code> at the top, two problems appear. The file becomes long and owned by several people at once. And the global app is created the moment the module is imported, with its configuration fixed, so every test shares the same app and the same state, and you cannot easily make a copy with test settings. Modules that import <code>app</code> from each other also tend to end up in circular imports.</p>
  <p>Flask solves the first problem with <strong>blueprints</strong>. A blueprint is a named group of routes (and, optionally, error handlers and templates) that is defined on its own, usually in its own file, and later registered on an app, optionally under a URL prefix. Its routes are written as <code>@api.get("/restaurants")</code>, and registering it with <code>url_prefix="/v1"</code> makes the real URL <code>/v1/restaurants</code>. It solves the second problem with the <strong>application factory</strong> pattern: instead of creating the app at import time, you write a function, by convention <code>create_app(config)</code>, that builds a new, fully configured app every time it is called. A global app is like a single dish everyone has to share; a factory is the recipe, which you can cook again whenever you like, with test ingredients for tests and real ones in production. The blueprints are like the departments of a shopping mall: each is fitted out separately and then opened inside whichever building needs it.</p>
  <p>Here is Biteful reorganised as a small package (a folder of Python modules with an <code>__init__.py</code>):</p>
  <div class="fx" data-lang="text">biteful/
  __init__.py      create_app(): config, model, error handlers, blueprints
  data.py          RESTAURANTS, MENUS, ORDERS (in-memory stand-ins for a database)
  errors.py        BadInput and the JSON error handlers
  api.py           blueprint "api",   prefix /v1     (orders and restaurants)
  ml.py            blueprint "ml",    prefix /v1     (the model, section 07)
  staff.py         blueprint "staff", prefix /staff  (HTML pages for restaurants)
  templates/       layout.html, orders.html (from section 05)
eta.joblib         the trained model file (section 07)
tests/test_api.py  the tests (section 08)</div>
  <p>The factory is short. It creates the app, applies default settings and then whatever the caller passed in, loads the model once (section 07 explains why only once), registers the error handlers and plugs in each blueprint:</p>
  <div class="fx" data-lang="py"># biteful/__init__.py: the app factory
import joblib
from flask import Flask
from . import errors
from .api import api
from .ml import ml
from .staff import staff

def create_app(config=None):
    app = Flask(__name__)
    app.json.sort_keys = False
    app.config["ETA_PATH"] = "eta.joblib"              # defaults...
    app.config.update(config or {})                    # ...overridden by the caller
    app.config["ETA"] = joblib.load(app.config["ETA_PATH"])   # load the model ONCE
    errors.register(app)
    app.register_blueprint(api)                        # /v1/restaurants, /v1/orders
    app.register_blueprint(ml)                         # /v1/eta, /v1/health
    app.register_blueprint(staff)                      # /staff/...
    return app</div>
  <p>The error handlers live in their own module. Instead of returning a 422 tuple from every check, views can now raise <code>BadInput</code>, and one handler turns it into the JSON error, which shortens every view:</p>
  <div class="fx" data-lang="py"># biteful/errors.py: one exception for "your input is wrong", and JSON errors
class BadInput(Exception):
    pass

def register(app):
    @app.errorhandler(BadInput)
    def bad_input(e):
        return {"error": "bad_input", "detail": str(e)}, 422

    @app.errorhandler(404)
    def not_found(e):
        return {"error": "not_found"}, 404</div>
  <div class="fx" data-lang="py"># biteful/api.py: the customer-facing JSON API, all under /v1
from flask import Blueprint, request
from .data import RESTAURANTS, MENUS, ORDERS, NEXT_ID
from .errors import BadInput

api = Blueprint("api", __name__, url_prefix="/v1")

@api.get("/restaurants")                               # becomes /v1/restaurants
def list_restaurants():
    return {"items": [r["name"] for r in RESTAURANTS.values()]}

@api.post("/orders")
def create_order():
    body = request.get_json(silent=True) or {}
    rid, items = body.get("restaurant_id"), body.get("items")
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
                   "restaurant_id": rid, "total": total, "note": str(body.get("note", ""))[:200]}
    return ORDERS[oid], 201, {"Location": f"/v1/orders/{oid}"}</div>
  <p>The staff page from section 05 moves into its own blueprint unchanged, with <code>@staff.get</code> in place of <code>@app.get</code>:</p>
  <div class="fx" data-lang="py"># biteful/staff.py: HTML pages for restaurant staff, all under /staff
from flask import Blueprint, render_template, abort
from .data import RESTAURANTS, ORDERS

staff = Blueprint("staff", __name__, url_prefix="/staff", template_folder="templates")

@staff.get("/&lt;int:rid&gt;/orders")
def orders_page(rid):
    if rid not in RESTAURANTS:
        abort(404)
    mine = [o for o in ORDERS.values() if o["restaurant_id"] == rid]
    return render_template("orders.html", restaurant=RESTAURANTS[rid], orders=mine)</div>
  <p>To see the result, we build the app with the factory and print its routing table, then build two more apps to check that they really are separate:</p>
  <div class="fx" data-lang="py">from biteful import create_app

app = create_app()
for rule in sorted(app.url_map.iter_rules(), key=lambda r: r.rule):
    methods = ",".join(sorted(rule.methods - {"HEAD", "OPTIONS"}))
    print(f"{rule.endpoint:22} {methods:5} {rule.rule}")

a = create_app({"TESTING": True})
b = create_app()
print("two separate apps:", a is not b, "| TESTING:", a.config["TESTING"], b.config["TESTING"])</div>
  <div class="fx" data-lang="text">staff.orders_page      GET   /staff/&lt;int:rid&gt;/orders
static                 GET   /static/&lt;path:filename&gt;
ml.eta                 POST  /v1/eta
ml.health              GET   /v1/health
api.create_order       POST  /v1/orders
api.list_restaurants   GET   /v1/restaurants
two separate apps: True | TESTING: True False</div>
  <p>Every route is there with its prefix added for us: <code>/v1/orders</code> comes from the <code>api</code> blueprint, <code>/v1/eta</code> from <code>ml</code>, and <code>/staff/&lt;int:rid&gt;/orders</code> from <code>staff</code>. Endpoint names are now <code>blueprint.function</code>, such as <code>api.create_order</code>, so two blueprints can each have a function called <code>index</code> without clashing. The last line shows the factory's payoff: the two apps are different objects, and only the one we asked for has <code>TESTING</code> switched on. One more detail: inside a blueprint there is no <code>app</code> variable to import, so views reach the app that is handling the request through <code>current_app</code>, a proxy that works just like <code>request</code>. To run the package, point the tools at the factory: <code>flask --app "biteful:create_app()" run</code> or <code>gunicorn "biteful:create_app()"</code>.</p>
  <p>You will also meet <strong>Flask-RESTful</strong> in older codebases. It is an extension that organises an API around classes instead of functions: one class represents one resource, and its methods are named after the HTTP verbs they handle. It is no longer actively developed, and new projects usually use plain routes, Flask's built-in <code>MethodView</code> class, or FastAPI, but you should be able to read it:</p>
  <div class="fx" data-lang="py">from flask import Flask
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)
ORDERS = {101: {"order_id": 101, "customer": "asha", "status": "placed"}}

class Order(Resource):                     # one class = one resource
    def get(self, oid):                    # method names = HTTP verbs
        if oid not in ORDERS:
            return {"error": "order not found"}, 404
        return ORDERS[oid]

    def delete(self, oid):
        ORDERS.pop(oid, None)
        return "", 204

api.add_resource(Order, "/v1/orders/&lt;int:oid&gt;")

c = app.test_client()
print("GET    -&gt;", c.get("/v1/orders/101").status_code, c.get("/v1/orders/101").json)
print("DELETE -&gt;", c.delete("/v1/orders/101").status_code)
print("GET    -&gt;", c.get("/v1/orders/101").status_code, c.get("/v1/orders/101").json)
print("POST   -&gt;", c.post("/v1/orders/101").status_code)      # no post() method defined</div>
  <div class="fx" data-lang="text">GET    -&gt; 200 {'order_id': 101, 'customer': 'asha', 'status': 'placed'}
DELETE -&gt; 204
GET    -&gt; 404 {'error': 'order not found'}
POST   -&gt; 405</div>
  <p><code>api.add_resource</code> connected the <code>Order</code> class to <code>/v1/orders/&lt;int:oid&gt;</code>. A GET called the class's <code>get</code> method and found order 101; DELETE called <code>delete</code> and returned 204 (success, no body); the next GET found nothing and returned our 404. The class has no <code>post</code> method, so Flask-RESTful answered 405 automatically, the same rule as in section 02.</p>

  <h2 id="fl-ml"><span class="num">07</span>Serving a Model</h2>
  <p>Biteful's data team has built a model that predicts how many minutes a delivery will take from the distance and the number of items, and the app wants to show "arrives in about 32 minutes" at checkout. Training a model happens rarely and can take minutes or hours; a prediction happens on every checkout and must take milliseconds. If the view trained the model, or even loaded it from disk, on every request, checkout would crawl. So the question is how training and answering requests connect.</p>
  <p>The answer is <strong>model serving</strong>: putting a trained model's predict function behind an API endpoint. Training and serving are two separate programs joined by one file, the <strong>model artifact</strong>, which the training script writes and the API reads once when it starts. It is like a restaurant kitchen that makes its sauce in the morning: the slow cooking happens once, and each order during the day just takes a ladleful.</p>
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
  </svg><figcaption>Left of the dotted line happens once, offline. Right of it, create_app loads the file once at startup, and every request only validates its input and calls predict.</figcaption></figure>
  <p>The training script below fits a linear regression on six past Dosa Hut deliveries (the model itself is explained in <a class="xref" data-note="ml_regression">Linear Regression</a>) and saves it with <code>joblib</code>, a library that writes Python objects to a file. Along with the model we save the order of the input features and a version string, so the API can never feed the columns in the wrong order and every answer can be traced back to the model that produced it:</p>
  <div class="fx" data-lang="py"># train_eta.py: train Biteful's delivery-time model once, offline
import joblib
from sklearn.linear_model import LinearRegression

#     distance_km, items        minutes   (six past Dosa Hut deliveries)
X = [[1.5, 1], [2.0, 2], [3.0, 2], [4.0, 3], [5.0, 2], [6.5, 4]]
y = [22, 27, 30, 38, 39, 51]
model = LinearRegression().fit(X, y)
print("minutes = %.2f + %.2f * km + %.2f * items" % (model.intercept_, *model.coef_))
print("R^2 on the six rows:", round(model.score(X, y), 3))
joblib.dump({"model": model, "features": ["distance_km", "items"], "version": "eta-lr-1"},
            "eta.joblib")</div>
  <div class="fx" data-lang="text">minutes = 12.68 + 4.03 * km + 3.02 * items
R^2 on the six rows: 0.998</div>
  <p>The model learned that a delivery takes about 12.68 minutes plus 4.03 per kilometre plus 3.02 per item. The factory in section 06 already loads <code>eta.joblib</code> into <code>app.config["ETA"]</code> at startup. The endpoint lives in its own blueprint, reads the bundle through <code>current_app</code>, checks the input by hand (Flask still will not do it for us), predicts, and converts the result before returning it:</p>
  <div class="fx" data-lang="py"># biteful/ml.py: the delivery-time model behind /v1/eta
import numpy as np
from flask import Blueprint, current_app, request
from .errors import BadInput

ml = Blueprint("ml", __name__, url_prefix="/v1")

@ml.post("/eta")
def eta():
    body = request.get_json(silent=True) or {}
    try:
        x = np.array([[float(body["distance_km"]), int(body["items"])]])
    except (KeyError, TypeError, ValueError):
        raise BadInput("need numeric distance_km and items")
    bundle = current_app.config["ETA"]                 # loaded once, in create_app
    minutes = bundle["model"].predict(x)[0]
    return {"eta_minutes": round(float(minutes), 1), "model": bundle["version"]}

@ml.get("/health")
def health():
    return {"status": "ok", "model": current_app.config["ETA"]["version"]}</div>
  <div class="fx" data-lang="py">from biteful import create_app

c = create_app().test_client()
for body in [{"distance_km": 3.2, "items": 2}, {"distance_km": "far", "items": 2}, {"items": 2}]:
    r = c.post("/v1/eta", json=body)
    print(body, "-&gt;", r.status_code, r.json)
print(c.get("/v1/health").json)</div>
  <div class="fx" data-lang="text">{'distance_km': 3.2, 'items': 2} -&gt; 200 {'eta_minutes': 31.6, 'model': 'eta-lr-1'}
{'distance_km': 'far', 'items': 2} -&gt; 422 {'error': 'bad_input', 'detail': 'need numeric distance_km and items'}
{'items': 2} -&gt; 422 {'error': 'bad_input', 'detail': 'need numeric distance_km and items'}
{'status': 'ok', 'model': 'eta-lr-1'}</div>
  <p>Check the first answer by hand: 12.68 + 4.03 × 3.2 + 3.02 × 2 = 12.68 + 12.90 + 6.04 = 31.62, which rounds to the 31.6 minutes the API returned. <code>"far"</code> made <code>float()</code> raise <code>ValueError</code> and a missing <code>distance_km</code> raised <code>KeyError</code>; both became <code>BadInput</code> and therefore a 422 with a readable message. <code>/v1/health</code> reports which model version is live, which monitoring systems and deploy scripts use to check that the server is up and running the expected model. The <code>float()</code> call matters because <code>predict</code> returns NumPy numbers, and Flask's JSON encoder rejects some of them (Common Mistakes shows the error).</p>
  <p>Why load once? This measures what loading on every request would cost compared with the prediction itself. The timings are approximate and will differ on your machine:</p>
  <div class="fx" data-lang="py">import time, joblib, numpy as np

t0 = time.perf_counter()
for _ in range(100):
    bundle = joblib.load("eta.joblib")                  # what a load-per-request view would do
load_ms = (time.perf_counter() - t0) * 1000 / 100

x = np.array([[3.2, 2]])
t0 = time.perf_counter()
for _ in range(100):
    bundle["model"].predict(x)                          # the actual work of one request
predict_ms = (time.perf_counter() - t0) * 1000 / 100

print(f"joblib.load: {load_ms:.2f} ms per call")
print(f"predict:     {predict_ms:.2f} ms per call")</div>
  <div class="fx" data-lang="text">joblib.load: 8.85 ms per call
predict:     0.18 ms per call</div>
  <p>Loading even this tiny model took dozens of times longer than predicting with it, as the two numbers above show. A real model file of hundreds of megabytes can take seconds to load and a lot of memory, so loading it per request would make every checkout slow. Loading at startup has one consequence to remember: gunicorn runs several worker processes (section 09), and each process loads its own copy, so memory use is roughly the number of workers times the model's size. Two further cautions. Loading a pickle file, which joblib uses underneath, can run code hidden inside it, so load only files you produced yourself and pin the scikit-learn version used for training. And if the API computes features differently from the training code, for example miles instead of kilometres, predictions silently get worse; this is called <strong>training–serving skew</strong>, and the usual protection is to save the whole preprocessing pipeline together with the model.</p>

  <h2 id="fl-test"><span class="num">08</span>Testing with the Test Client</h2>
  <p>We have changed <code>create_order</code> to raise <code>BadInput</code>, moved routes into blueprints and added a model. Does Asha's order still total ₹240? Is Ben's script still escaped on the staff page? Does the ETA still match our hand calculation? Starting a server and retyping curl commands after every change is slow, and we would soon forget a case. We want every check written down once and run automatically in seconds.</p>
  <p>Flask's <strong>test client</strong> makes this possible. It is an object, obtained from <code>app.test_client()</code>, that builds a request, calls the app's WSGI callable directly inside the same Python process and gives you back the response: no server, no port, no network, just function calls taking a fraction of a millisecond. It is the flight simulator of web apps: the pilot (your code) does exactly what it would do in a real flight, but nobody leaves the ground. We combine it with <a class="xref" data-note="py_pytest">pytest</a>, which finds every function whose name starts with <code>test_</code>, runs it, and reports whether its <code>assert</code> statements held. A pytest <strong>fixture</strong> (a function marked <code>@pytest.fixture</code>) provides setup: any test that has a parameter named <code>client</code> receives a fresh test client from it. And <code>@pytest.mark.parametrize</code> runs one test function once for each input in a list.</p>
  <div class="fx" data-lang="py"># tests/test_api.py: run with  pytest -q
import pytest
from biteful import create_app
from biteful.data import ORDERS

@pytest.fixture
def client():
    ORDERS.clear()                                    # every test starts with no orders
    app = create_app({"TESTING": True})
    return app.test_client()                          # in-process: no server, no port

def test_list_restaurants(client):
    r = client.get("/v1/restaurants")
    assert r.status_code == 200
    assert r.json["items"] == ["Dosa Hut", "Biryani Bros", "Pizza Point"]

def test_asha_orders_two_dosas(client):
    r = client.post("/v1/orders", headers={"X-Customer": "asha"},
                    json={"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]})
    assert r.status_code == 201
    assert r.json["total"] == 240
    assert r.headers["Location"].startswith("/v1/orders/")

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
  <div class="fx" data-lang="text">$ pytest -q tests/test_api.py
........                                                                 [100%]
8 passed in 1.12s</div>
  <p>Each dot is one passed test. There are five test functions, but the bad-order test ran once for each of its four inputs, so pytest counted 8 tests, all passing in about a second. Look at what the fixture does. It calls <code>create_app({"TESTING": True})</code>, which is the factory paying off: every test gets its own app, built with test settings. <code>TESTING</code> also tells Flask to let exceptions reach the test instead of hiding them behind a 500 page, so failures are easier to read. The fixture also empties <code>ORDERS</code>, because that dictionary is module-level state shared by every app; without clearing it, order numbers would depend on which tests happened to run first. Real projects solve the same problem with a fresh test database for each test. Inside the tests, <code>client.post(url, json=...)</code> sends a JSON body, <code>r.json</code> parses the reply, and <code>get_data(as_text=True)</code> returns the HTML of a page. The last test writes our hand calculation from section 07 into code, so if someone retrains the model and its answers drift, the test fails loudly.</p>

  <h2 id="fl-sync"><span class="num">09</span>The Limits: Sync Workers and Manual Validation</h2>
  <p>Our tests send one request at a time. Real traffic does not. At lunchtime many customers tap "Place order" at the same moment, and in Biteful each order also sends a receipt email, which means waiting about a second for the email provider to answer. What does a Flask server do with the requests that arrive while it is waiting?</p>
  <p>To answer, we need two words. In production, gunicorn starts a few <strong>worker processes</strong>, each one a separate running copy of your app, and each worker may also run several threads. Flask is a <strong>synchronous</strong> (sync) framework: one request occupies one thread from start to finish, including every moment it spends waiting for something else, such as the email provider, a database or another API. While a thread waits, it does nothing else; any other request has to wait for a free thread. Think of a shop with one cashier who, for every customer, phones the bank and stays on the line until the bank answers: the queue only moves as fast as the phone calls. Here is the slow order endpoint, and a small client that fires N orders at exactly the same moment:</p>
  <div class="fx" data-lang="py"># slow.py: placing an order also sends the receipt email, inside the request
import time
from flask import Flask

app = Flask(__name__)

def send_receipt_email(order_id):
    time.sleep(1)                    # stands in for waiting on the email provider: ~1 s

@app.post("/v1/orders")
def create_order():
    send_receipt_email(101)          # the worker waits here, doing nothing, for 1 s
    return {"order_id": 101, "status": "placed"}, 201</div>
  <div class="fx" data-lang="py"># fire.py N: N customers tap "Place order" at the same moment
import sys, time, threading, requests

n = int(sys.argv[1])
codes = []
def tap():
    codes.append(requests.post("http://127.0.0.1:18210/v1/orders").status_code)

t0 = time.perf_counter()
threads = [threading.Thread(target=tap) for _ in range(n)]
for t in threads: t.start()
for t in threads: t.join()
print(f"{n} orders at once -&gt; {codes.count(201)} x 201 in {time.perf_counter() - t0:.2f} s")</div>
  <p>We started gunicorn four times with different settings and fired the orders at it each time:</p>
  <div class="fx" data-lang="text">$ gunicorn -w 1 -b 127.0.0.1:18210 slow:app
$ python fire.py 3
3 orders at once -&gt; 3 x 201 in 3.01 s

$ gunicorn -w 1 --threads 3 -b 127.0.0.1:18210 slow:app
$ python fire.py 3
3 orders at once -&gt; 3 x 201 in 1.01 s

$ gunicorn -w 3 -b 127.0.0.1:18210 slow:app
$ python fire.py 3
3 orders at once -&gt; 3 x 201 in 1.01 s

$ gunicorn -w 1 --threads 3 -b 127.0.0.1:18210 slow:app
$ python fire.py 12
12 orders at once -&gt; 12 x 201 in 4.02 s</div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="5" y="22" font-size="12">1 sync worker</text>
    <rect x="140" y="10" width="140" height="18" class="fb"/><rect x="280" y="10" width="140" height="18" class="ft"/><rect x="420" y="10" width="140" height="18" class="fv"/>
    <text x="5" y="72" font-size="12">1 worker × 3 threads</text>
    <rect x="140" y="45" width="140" height="14" class="fb"/><rect x="140" y="62" width="140" height="14" class="ft"/><rect x="140" y="79" width="140" height="14" class="fv"/>
    <line x1="140" y1="110" x2="580" y2="110" stroke="currentColor"/>
    <text x="140" y="126" font-size="11" text-anchor="middle">0 s</text><text x="280" y="126" font-size="11" text-anchor="middle">1 s</text><text x="420" y="126" font-size="11" text-anchor="middle">2 s</text><text x="560" y="126" font-size="11" text-anchor="middle">3 s</text>
    <text x="300" y="146" font-size="12" text-anchor="middle" class="tm">each colour = one order waiting on the email provider</text>
  </svg><figcaption>Top: one sync worker with one thread serves the three orders one after another (3.01 s). Bottom: three threads wait at the same time (1.01 s).</figcaption></figure>
  <p>With one worker and one thread, the three orders were served one after another: the first customer waited 1 second, the second 2, the third 3, and the whole batch took 3.01 seconds, as the top row of the picture shows. Giving the worker 3 threads, or starting 3 worker processes, let the three waits overlap (the bottom row), and the batch finished in 1.01 seconds. But the last run shows that this only moves the limit: with 3 threads and 12 orders, the server worked through them in rounds of 3, and 12 ÷ 3 = 4 rounds of one second took 4.02 seconds. In general, a sync server can have at most <em>workers × threads</em> requests in progress at once, and every waiting request holds one of those slots. Serving 1,000 customers who are all waiting on slow services would need about 1,000 threads, each using memory. (Threads help here only because the requests are <em>waiting</em>; for CPU-heavy work such as a big model's prediction, Python's GIL lets only one thread compute at a time, so extra worker processes are what help. See <a class="xref" data-note="py_threading">Multithreading</a>.)</p>
  <p>There are two different fixes, and the rest of this track covers both. The first is to stop holding a thread while waiting: an <strong>asynchronous</strong> framework built on <strong>ASGI</strong> (WSGI's async successor) runs an event loop that can keep thousands of waiting requests on one thread and switch to whichever one is ready; that is <a class="xref" data-note="api_fastapi">FastAPI</a>. Flask 2.0 and later do accept <code>async def</code> views, but under WSGI each request still occupies a worker thread for its whole duration, so it does not raise the number of requests in progress. The second fix is to not wait at all: Asha needs order 101 confirmed in milliseconds, and the email can be sent a second later by a separate worker reading from a task queue, as shown in <a class="xref" data-note="api_production">Production Backend</a>.</p>
  <p>The second limit we have already measured: validation is manual. In section 03, 12 of the 23 lines in <code>create_order</code> were checks, the endpoint reported only the first of two mistakes, <code>?min_rating=high</code> was silently ignored, and nothing describes to other developers what the endpoint accepts unless someone writes that documentation by hand. Extensions such as marshmallow help, but they are extra pieces you choose and wire in yourself. The table summarises where Flask stands:</p>
  <table class="tbl">
    <tr><th></th><th>Flask (WSGI)</th><th>FastAPI (ASGI)</th></tr>
    <tr><td>Requests in progress at once</td><td>workers × threads, each request holds one</td><td>thousands of waiting requests on one event loop</td></tr>
    <tr><td>Input validation</td><td>hand-written (or an extension), first error only</td><td>generated from type hints, every error listed in one 422</td></tr>
    <tr><td>API documentation</td><td>add-on</td><td>automatic <code>/docs</code> page</td></tr>
    <tr><td>Server-rendered HTML pages</td><td>excellent, mature (Jinja2)</td><td>possible, but API-first</td></tr>
    <tr><td>Good fit</td><td>existing Flask services, internal tools, HTML dashboards, quick model demos</td><td>new JSON APIs, many slow external calls (LLMs, other services)</td></tr>
  </table>
  <p>None of this makes Flask a bad choice. It is simple, stable and extremely widely used, and for an internal tool, a staff dashboard or a model demo with modest traffic it is often the fastest way to ship. Its two weaknesses, hand-written validation and one request per thread, are exactly what FastAPI was designed to change.</p>

  <h2 id="fl-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>A very common surprise is how strict <code>request.get_json()</code> is when called without <code>silent=True</code>. If the client forgot the <code>Content-Type: application/json</code> header, or sent broken JSON, Flask stops the request with its own HTML error page before your code can respond:</p>
  <div class="fx" data-lang="py">from flask import Flask, request

app = Flask(__name__)

@app.post("/strict")
def strict():
    return {"got": request.get_json()}                  # raises on anything but valid JSON

@app.post("/silent")
def silent():
    body = request.get_json(silent=True)                # None instead of raising
    if body is None:
        return {"error": "send a JSON body with Content-Type: application/json"}, 400
    return {"got": body}

c = app.test_client()
for url in ["/strict", "/silent"]:
    a = c.post(url, data='{"qty": 2}')                                     # no Content-Type
    b = c.post(url, data='{"qty": 2', content_type="application/json")    # broken JSON
    print(f"{url:8} no content-type -&gt; {a.status:28} broken JSON -&gt; {b.status}")</div>
  <div class="fx" data-lang="text">/strict  no content-type -&gt; 415 UNSUPPORTED MEDIA TYPE   broken JSON -&gt; 400 BAD REQUEST
/silent  no content-type -&gt; 400 BAD REQUEST              broken JSON -&gt; 400 BAD REQUEST</div>
  <p>The strict version answered <strong>415 Unsupported Media Type</strong> when the header was missing and 400 for broken JSON, both as HTML pages your client did not expect. With <code>silent=True</code> you get <code>None</code> and choose the response yourself, as a JSON error with a helpful message.</p>
  <p>A mistake that hits nearly everyone serving a model is returning NumPy values directly. Many models return <code>float32</code> or <code>int64</code> numbers, and Python's JSON encoder does not know them:</p>
  <div class="fx" data-lang="py">import json
import numpy as np
from flask import Flask

app = Flask(__name__)
preds = np.array([31.62], dtype=np.float32)            # what many models return
counts = np.array([2, 1])                              # int64

@app.get("/bad")
def bad():
    return {"eta_minutes": preds[0], "items": counts[0]}

@app.get("/good")
def good():
    return {"eta_minutes": round(float(preds[0]), 1), "items": int(counts[0])}

c = app.test_client()
print("/bad  -&gt;", c.get("/bad").status)
print("/good -&gt;", c.get("/good").status, c.get("/good").json)
for value in (preds[0], counts[0]):                    # the reason, from the json module itself
    try:
        json.dumps(value)
    except TypeError as e:
        print("TypeError:", e)</div>
  <div class="fx" data-lang="text">/bad  -&gt; 500 INTERNAL SERVER ERROR
/good -&gt; 200 OK {'eta_minutes': 31.6, 'items': 2}
TypeError: Object of type float32 is not JSON serializable
TypeError: Object of type int64 is not JSON serializable</div>
  <p>The <code>/bad</code> view crashed with a 500, and the last two lines show why: <code>json.dumps</code> refuses <code>float32</code> and <code>int64</code>. (A <code>float64</code> happens to work, because NumPy makes it a subclass of Python's <code>float</code>, which is why this bug often appears only after someone changes the model.) Convert with <code>float()</code>, <code>int()</code> or <code>array.tolist()</code> before returning.</p>
  <p>Turning off escaping to "make the HTML look right" reopens the XSS hole that templates closed. The <code>| safe</code> filter tells Jinja2 to trust a value completely:</p>
  <div class="fx" data-lang="py">from flask import Flask, render_template_string

app = Flask(__name__)
note = "&lt;script&gt;alert('hacked')&lt;/script&gt;"

with app.app_context():
    print(render_template_string("note: {{ note }}", note=note))         # escaped
    print(render_template_string("note: {{ note | safe }}", note=note))  # escaping switched off</div>
  <div class="fx" data-lang="text">note: &amp;lt;script&amp;gt;alert(&amp;#39;hacked&amp;#39;)&amp;lt;/script&amp;gt;
note: &lt;script&gt;alert('hacked')&lt;/script&gt;</div>
  <p>The first line is harmless text; the second puts a working <code>&lt;script&gt;</code> tag into the page. Use <code>| safe</code> only for HTML your own code generated, never for anything a user typed.</p>
  <p>Forgetting that <code>after_request</code> must return the response produces a confusing error, because Flask passes your hook's return value (<code>None</code>) on as if it were the response:</p>
  <div class="fx" data-lang="py">from flask import Flask

app = Flask(__name__)

@app.get("/v1/restaurants")
def list_restaurants():
    return {"items": ["Dosa Hut"]}

@app.after_request
def add_header(resp):
    resp.headers["X-Request-ID"] = "asha-001"          # forgot: return resp

try:
    app.test_client().get("/v1/restaurants")
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">TypeError: 'NoneType' object is not callable</div>
  <p>The message "'NoneType' object is not callable" says nothing about hooks, which is why this bug can take a while to find. Ending every <code>after_request</code> function with <code>return resp</code> fixes it.</p>
  <p>A few more mistakes come up often enough to name. Running with debug mode on a server anyone else can reach exposes an interactive console to them. Loading a model inside the view rather than at startup makes every request pay the load time. Putting slow external calls, such as the receipt email, inside the request holds a worker thread for the whole wait. And keeping data in module-level dictionaries, as our examples do for simplicity, breaks in production: each gunicorn worker process has its own copy, so an order stored by one worker is invisible to the others, and threads updating a counter such as <code>NEXT_ID</code> at the same time can hand out the same number twice. Real apps keep shared state in a database or Redis.</p>

  <h2 id="fl-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Process / host / port</b>: a running program; the machine (<code>localhost</code> = this one); the numbered door a server listens on.</li>
    <li><b>WSGI</b>: the standard interface between a web server and a Python app: <code>app(environ, start_response)</code> returns the body as bytes.</li>
    <li><b>Application object</b>: <code>Flask(__name__)</code>; holds config and routes; is the WSGI callable.</li>
    <li><b>Route / view function / endpoint</b>: URL pattern + methods → function; the function; its name (<code>blueprint.function</code>).</li>
    <li><b>Converter</b>: <code>&lt;int:rid&gt;</code> checks and converts a path part; a mismatch means 404 before your code runs.</li>
    <li><b><code>request</code></b>: proxy to the current request (request context); <b><code>g</code></b>: per-request scratch space; <b><code>current_app</code></b>: proxy to the app handling the request.</li>
    <li><b>Hook</b>: <code>before_request</code> (return a response to skip the view), <code>after_request</code> (must return the response), <code>teardown_request</code> (cleanup, always runs).</li>
    <li><b>Error handler</b>: <code>@app.errorhandler(404 | Exception | MyError)</code>; <code>abort(404)</code> raises one.</li>
    <li><b>WSGI middleware</b>: a callable wrapping <code>app.wsgi_app</code> that sees the raw <code>environ</code>.</li>
    <li><b>Template / auto-escaping / XSS</b>: HTML with holes; <code>&lt;</code> becomes <code>&amp;lt;</code>; injecting script through user input.</li>
    <li><b>Blueprint / app factory</b>: a route group registered with a prefix; <code>create_app(config)</code> builds a fresh app.</li>
    <li><b>Test client</b>: calls the app in-process; no server or port.</li>
    <li><b>Sync worker</b>: one request per thread from start to finish; capacity = workers × threads.</li>
  </ul>
  <h3>Reading input, shaping output</h3>
  <table class="tbl">
    <tr><th>Need</th><th>Code</th></tr>
    <tr><td>Path part</td><td><code>@app.get("/v1/restaurants/&lt;int:rid&gt;")</code> → argument <code>rid</code></td></tr>
    <tr><td>Query string</td><td><code>request.args.get("city")</code>; <code>type=float</code> falls back silently</td></tr>
    <tr><td>JSON body</td><td><code>request.get_json(silent=True)</code> → dict or <code>None</code></td></tr>
    <tr><td>Header</td><td><code>request.headers.get("X-Customer")</code></td></tr>
    <tr><td>JSON response</td><td><code>return {"a": 1}</code> (200)</td></tr>
    <tr><td>Status and headers</td><td><code>return body, 201, {"Location": "/v1/orders/101"}</code></td></tr>
    <tr><td>Full control</td><td><code>resp = make_response(body, 202)</code>; <code>resp.set_cookie(...)</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from flask import Flask, Blueprint, request, g, abort, current_app, render_template

api = Blueprint("api", __name__, url_prefix="/v1")

@api.post("/orders")
def create_order():
    body = request.get_json(silent=True) or {}
    if "restaurant_id" not in body:
        abort(422)
    return {"order_id": 101}, 201, {"Location": "/v1/orders/101"}

def create_app(config=None):
    app = Flask(__name__)
    app.config.update(config or {})

    @app.before_request
    def start():
        g.request_id = request.headers.get("X-Request-ID", "new-id")

    @app.after_request
    def finish(resp):
        resp.headers["X-Request-ID"] = g.request_id
        return resp                                  # must return it

    @app.errorhandler(404)
    def not_found(e):
        return {"error": "not_found"}, 404

    app.register_blueprint(api)
    return app

# tests:      client = create_app({"TESTING": True}).test_client()
#             r = client.post("/v1/orders", json={...}); r.status_code, r.json
# dev:        flask --app "biteful:create_app()" run
# production: gunicorn -w 4 "biteful:create_app()"</div>
  <h3>Numbers from this page</h3>
  <table class="tbl">
    <tr><th>Fact</th><th>Value</th></tr>
    <tr><td>Asha's order 101</td><td>2 × ₹120 = ₹240, 201 + <code>Location</code></td></tr>
    <tr><td>Hand validation in <code>create_order</code></td><td>12 of 23 lines; first error only</td></tr>
    <tr><td>ETA model</td><td>12.68 + 4.03 × km + 3.02 × items; 3.2 km, 2 items → 31.6 min</td></tr>
    <tr><td>Load vs predict</td><td>loading is dozens of times slower than predicting (approximate timings)</td></tr>
    <tr><td>3 orders, 1 s wait each</td><td>1 worker: 3.01 s; 3 threads or 3 workers: 1.01 s</td></tr>
    <tr><td>12 orders, 3 threads</td><td>4.02 s = ceil(12 / 3) × 1 s</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li><code>debug=True</code> on a reachable server = remote code execution.</li>
    <li><code>get_json()</code> without <code>silent=True</code>: 415 or 400 HTML page.</li>
    <li><code>request.args.get(..., type=float)</code> ignores bad values silently.</li>
    <li>Two 404s: converter mismatch (view never ran) vs your own 404.</li>
    <li><code>after_request</code> must return the response.</li>
    <li>Catch-all <code>errorhandler(Exception)</code> also catches Flask's 404/405 unless you pass <code>HTTPException</code> through.</li>
    <li><code>| safe</code> on user input = XSS.</li>
    <li>NumPy <code>float32</code>/<code>int64</code> are not JSON serialisable; use <code>float()</code>/<code>int()</code>.</li>
    <li>Load models once per worker process; memory ≈ workers × model size.</li>
    <li>Module-level dicts are per process and not thread-safe; use a database.</li>
  </ul>

  <h2 id="fl-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is Flask, and why is it called a micro-framework?</summary><div class="qa-body">Flask is a Python web framework that maps URLs to Python functions and handles requests and responses for you. "Micro" means the core is small: routing, request and response objects, templates (Jinja2) and a development server, built on the Werkzeug toolkit. It has no built-in database layer, validation or authentication; you add extensions for those, which keeps it flexible but means more decisions are yours.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is WSGI, and how does it relate to gunicorn and Flask?</summary><div class="qa-body">WSGI is the Python standard for how a web server hands a request to an application: the app is a callable taking <code>environ</code> (a dict describing the request) and <code>start_response</code>, and it returns the body. gunicorn is a WSGI server: it handles the network and calls the app. A Flask app object is a WSGI app, so any WSGI server can run it, for example <code>gunicorn biteful:app</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between WSGI and ASGI?</summary><div class="qa-body">WSGI is synchronous: each request is one call that occupies a thread until it returns, and it only handles request-response HTTP. ASGI is its asynchronous successor: apps are coroutines run on an event loop, so one thread can hold many waiting requests, and it also supports long-lived connections such as WebSockets. Flask is WSGI; FastAPI and Starlette are ASGI, served by uvicorn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when you request <code>/v1/restaurants/abc</code> and the route is <code>/v1/restaurants/&lt;int:rid&gt;</code>? What about a DELETE to a GET-only route?</summary><div class="qa-body">The int converter refuses "abc", so no rule matches and Flask returns 404 itself; the view never runs. A DELETE to a path that matches but whose rule only allows GET gives 405 Method Not Allowed, with an <code>Allow</code> header listing the accepted methods. You can replace both default HTML pages with JSON using error handlers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>request</code> is a global import. How does it give the right data when many requests run at once?</summary><div class="qa-body">It is a proxy bound to the request context. When a request starts, Flask pushes a context holding that request, stored per thread (using context variables), and every attribute access on <code>request</code> looks up the current one. Each thread therefore sees its own request. Outside a request, using it raises "Working outside of request context". <code>g</code>, <code>session</code> and <code>current_app</code> work the same way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>g</code> and <code>session</code>?</summary><div class="qa-body"><code>g</code> is scratch storage for a single request, such as a request id or a database connection, and is discarded when the request ends. <code>session</code> persists across requests from the same browser: Flask stores it in a cookie signed with the app's <code>SECRET_KEY</code>, so the client cannot tamper with it, but it can read it, so never put secrets in it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you add a request id and timing to every response?</summary><div class="qa-body">In <code>before_request</code>, store a start time and a request id (from an incoming <code>X-Request-ID</code> header or a new UUID) on <code>g</code>. In <code>after_request</code>, compute the elapsed time, log it with the id, set <code>X-Request-ID</code> on the response and return it. Error responses also pass through <code>after_request</code>, so failures carry the id too, and the error handler can log the traceback under the same id.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a Flask hook and WSGI middleware?</summary><div class="qa-body">Hooks (<code>before_request</code>, <code>after_request</code>) run inside Flask, after the request context exists, so they can use <code>request</code>, <code>g</code> and the matched endpoint. WSGI middleware wraps <code>app.wsgi_app</code> and runs outside Flask on the raw <code>environ</code>; it works for any WSGI app. Use hooks for app logic such as auth checks and logging, middleware for generic concerns such as <code>ProxyFix</code> behind a reverse proxy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should an API return 400 and when 422?</summary><div class="qa-body">400 Bad Request means the request itself could not be understood, for example the body is not valid JSON. 422 Unprocessable Entity means the request was readable but its contents fail validation, such as an unknown restaurant id or a quantity of "two". Many APIs use 400 for both; what matters is being consistent and returning a clear JSON message.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are blueprints and the application factory, and why use them?</summary><div class="qa-body">A blueprint is a group of routes, handlers and templates defined separately and registered on an app with an optional URL prefix, such as <code>/v1</code> for the API and <code>/staff</code> for HTML pages. The application factory is a function, <code>create_app(config)</code>, that builds a configured app on demand. Together they split large apps into modules, avoid circular imports and let tests create fresh apps with test settings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do Jinja2 templates protect against XSS, and how can you break that protection?</summary><div class="qa-body">Values printed with <code>{{ }}</code> are auto-escaped, so characters such as <code>&lt;</code> become <code>&amp;lt;</code> and user input shows as text instead of running as script. The protection is lost if you apply <code>| safe</code> or <code>Markup()</code> to user input, or put values into contexts where HTML escaping is not enough, such as inside a <code>&lt;script&gt;</code> block or an <code>href</code> URL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you serve a scikit-learn model with Flask?</summary><div class="qa-body">Train offline and save the whole pipeline, the feature order and a version with joblib. Load it once at startup in the app factory, not per request. In the endpoint, validate the input, build the feature array in the saved order, call <code>predict</code>, convert NumPy values with <code>float()</code> or <code>.tolist()</code>, and return the prediction with the model version. Add a health endpoint and tests that pin known predictions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You run <code>gunicorn -w 4</code> with a 2 GB model loaded at startup. How much memory do you need, and what can you do about it?</summary><div class="qa-body">Each worker is a separate process with its own copy, so roughly 4 × 2 GB plus overhead. Options are fewer workers with threads (if prediction releases the GIL or requests mostly wait), gunicorn's <code>--preload</code>, which loads the model before forking so workers initially share its memory pages (only partly in practice, because Python's reference counting writes to objects), a smaller or quantised model, or moving the model to a dedicated model server that the API calls.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a Flask endpoint without starting a server?</summary><div class="qa-body">Create the app with test settings, for example <code>create_app({"TESTING": True})</code>, and call <code>app.test_client()</code>. The client calls the app in-process: <code>client.post("/v1/orders", json={...})</code> returns a response whose <code>status_code</code>, <code>json</code> and headers you assert on. Put the client in a pytest fixture, reset shared state there, and use <code>parametrize</code> for lists of bad inputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A view waits 1 second on an external API. With <code>gunicorn -w 1</code>, how long do 3 simultaneous requests take? With <code>-w 1 --threads 3</code> and 12 requests?</summary><div class="qa-body">One sync worker with one thread serves them one after another, so about 3 seconds (measured 3.01 s). With 3 threads, 3 requests can wait at once, so 12 requests take 4 rounds, about 4 seconds (measured 4.02 s). In general, time ≈ ceil(requests ÷ (workers × threads)) × wait.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose the number of gunicorn workers and threads?</summary><div class="qa-body">A common starting point is (2 × CPU cores) + 1 workers, then adjust by measurement. Processes give true parallelism for CPU-heavy work, because each has its own GIL, but each costs memory, including its own copy of any model. Threads are cheap and help when requests mostly wait on I/O. If requests spend most of their time waiting, consider an async framework or moving the slow work to a task queue instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does writing <code>async def</code> views make Flask handle more concurrent requests?</summary><div class="qa-body">Not really. Flask 2.0+ accepts async views, but under WSGI each request still occupies a worker thread for its whole duration; Flask runs the coroutine in an event loop for that one request. It lets you use async libraries and run several awaits in parallel inside one request, but the number of requests in progress is still workers × threads. For many concurrent waiting requests, use an ASGI framework such as FastAPI.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Flask or FastAPI: how do you decide?</summary><div class="qa-body">Choose Flask for existing Flask codebases, server-rendered HTML pages, small internal tools and quick prototypes, where its simplicity and mature ecosystem shine. Choose FastAPI for new JSON APIs with a lot of input validation, many slow external calls such as LLM or database requests, or when you want automatic OpenAPI documentation. For CPU-heavy model inference the framework matters less than workers, batching and hardware.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you never run <code>app.run(debug=True, host="0.0.0.0")</code> on a server?</summary><div class="qa-body"><code>host="0.0.0.0"</code> listens on every network interface, so other machines can reach it, and debug mode serves Werkzeug's interactive debugger whenever a view raises, which lets anyone who triggers an error execute Python on the server. The development server is also not built for production load or security. Use gunicorn (often behind nginx) with debug off.</div></details>
</main>
`
});
