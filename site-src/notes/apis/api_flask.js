// notes/apis/api_flask.js — Flask
Object.assign(TOPIC_CONTENT, {
  "api_flask": `<main>
  <h1>Flask</h1>
  <p class="lead">Flask is the smallest useful Python web framework: a few decorators turn functions into URLs. Most legacy ML services and many internal tools run on it. This page builds a real model-serving app, tests it, and shows where Flask's synchronous design runs out. Builds on <em>HTTP &amp; REST Fundamentals</em>.</p>

  <h2 id="fl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Flask</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">App &amp; routing</div>
        <ul>
          <li><b>App</b> — <code>app = Flask(__name__)</code></li>
          <li><b>Route</b> — <code>@app.get("/hello/&lt;name&gt;")</code>; converters <code>&lt;int:id&gt;</code></li>
          <li><b>WSGI</b> — sync standard: one request per worker thread</li>
          <li><b>Run</b> — dev <code>flask run</code>; prod <code>gunicorn -w 4 app:app</code></li>
          <li>⚠ <code>debug=True</code> in prod = remote code execution</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Requests &amp; responses</div>
        <ul>
          <li><b>Inputs</b> — path args, <code>request.args</code>, <code>request.get_json()</code>, <code>request.headers</code>, <code>request.files</code></li>
          <li><b>Return</b> dict → JSON; <code>jsonify(x), 201, headers</code></li>
          <li>⚠ No validation built in; <code>get_json(silent=True)</code> + manual checks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hooks &amp; errors</div>
        <ul>
          <li><b>before_request</b> — timer, auth, request id; may short-circuit</li>
          <li><b>after_request</b> — add headers, log</li>
          <li><b>g</b> — per-request scratchpad</li>
          <li><b>@app.errorhandler(Exc/404)</b> — JSON errors, not HTML 500</li>
          <li>💡 airport security in, customs out</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Structure</div>
        <ul>
          <li><b>Blueprint</b> — route group + URL prefix (<code>/api/v1</code>)</li>
          <li><b>App factory</b> — <code>create_app()</code> for config + tests</li>
          <li><b>Jinja2</b> — <code>{{ var }}</code>, <code>{% for %}</code>; auto-escapes (no XSS)</li>
          <li><b>Flask-RESTful</b> — class per resource, methods = verbs (legacy)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Serving a model</div>
        <ul>
          <li><b>Train offline</b> → <code>joblib.dump</code> pipeline + classes + version</li>
          <li><b>Load once</b> at import/startup, never per request</li>
          <li><b>/predict</b> — validate → <code>predict_proba</code> → <code>float()</code> → JSON</li>
          <li>⚠ pickle runs code: trusted files only; pin sklearn version</li>
          <li>⚠ training–serving skew: keep preprocessing in the pipeline</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Testing</div>
        <ul>
          <li><b>app.test_client()</b> — in-process, no server</li>
          <li><code>client.post(url, json=...)</code> → <code>r.status_code</code>, <code>r.json</code></li>
          <li>Test health, known prediction, bad inputs → 422, headers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sync limits</div>
        <ul>
          <li>1 sync worker, 3 × 1 s requests → <b>3.14 s</b>; 3 threads → <b>1.20 s</b></li>
          <li>Scale with gunicorn workers (<code>-w</code>) and threads</li>
          <li><b>Pick FastAPI</b> for new JSON APIs, many I/O calls, LLMs, auto docs</li>
          <li><b>Keep Flask</b> for legacy, small tools, server-rendered pages</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="fl-app"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">App &amp; Routing</span><span class="rm-sub">Decorators map URLs to functions</span></div></div>
      <div class="rm-item rm-done" data-target="fl-req"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Requests &amp; JSON</span><span class="rm-sub">Reading input, returning output</span></div></div>
      <div class="rm-item rm-done" data-target="fl-mw"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Hooks &amp; Errors</span><span class="rm-sub">Middleware and error handlers</span></div></div>
      <div class="rm-item rm-done" data-target="fl-bp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Blueprints &amp; Templates</span><span class="rm-sub">Structure and Jinja2</span></div></div>
      <div class="rm-item rm-done" data-target="fl-ml"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Serving a Model</span><span class="rm-sub">Train → joblib → /predict</span></div></div>
      <div class="rm-item rm-done" data-target="fl-test"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Testing</span><span class="rm-sub">The test client + pytest</span></div></div>
      <div class="rm-item rm-done" data-target="fl-sync"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sync / WSGI Limits</span><span class="rm-sub">When to pick FastAPI</span></div></div>
      <div class="rm-item rm-done" data-target="fl-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="fl-app"><span class="num">01</span>App &amp; Routing</h2>
  <div class="flow"><span>HTTP request</span><span>WSGI server (gunicorn)</span><span>Flask app</span><span>URL map → view function</span><span>Response</span></div>
  <div class="fx" data-lang="py">from flask import Flask
app = Flask(__name__)

@app.get("/hello/&lt;name&gt;")            # path parameter
def hello(name):
    return {"msg": f"Hi {name}"}        # dict → JSON response, 200</div>
  <ul>
    <li><code>@app.get</code> / <code>@app.post</code> are shortcuts for <code>@app.route(path, methods=[...])</code>.</li>
    <li>Converters type the path: <code>&lt;int:pid&gt;</code> turns <code>/products/abc</code> into an automatic 404.</li>
    <li>Run in dev with <code>flask --app app run</code>; in production with <code>gunicorn -w 4 app:app</code>.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>WSGI</strong> (Web Server Gateway Interface): the Python standard for how a server hands one request to a synchronous function and gets one response back.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>flask run</code> / <code>app.run(debug=True)</code> is a development server. Debug mode exposes an interactive console that can run code on your machine. Never in production.</p></div>

  <h2 id="fl-req"><span class="num">02</span>Requests &amp; JSON</h2>
  <table class="tbl">
    <tr><th>Input</th><th>Example</th><th>Read with</th></tr>
    <tr><td>Path</td><td><code>/hello/Asha</code></td><td>function argument <code>name</code></td></tr>
    <tr><td>Query string</td><td><code>?times=2</code></td><td><code>request.args.get("times", 1, type=int)</code></td></tr>
    <tr><td>JSON body</td><td><code>{"features":[…]}</code></td><td><code>request.get_json()</code></td></tr>
    <tr><td>Form / files</td><td>HTML form, upload</td><td><code>request.form</code>, <code>request.files</code></td></tr>
    <tr><td>Headers</td><td><code>X-Request-ID</code></td><td><code>request.headers.get(...)</code></td></tr>
  </table>
  <table class="tbl">
    <tr><th>Return</th><th>Becomes</th></tr>
    <tr><td><code>{"a": 1}</code> or <code>jsonify(a=1)</code></td><td>200, <code>application/json</code></td></tr>
    <tr><td><code>jsonify(x), 201, {"Location": "/x/1"}</code></td><td>Custom status and headers</td></tr>
    <tr><td><code>"text"</code></td><td>200, <code>text/html</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p><code>request.get_json()</code> raises 400 on broken JSON or a wrong <code>Content-Type</code>. Use <code>get_json(silent=True)</code> and validate yourself. Flask does no type checking: <code>"features": "abc"</code> reaches your code untouched.</p></div>

  <h2 id="fl-mw"><span class="num">03</span>Hooks &amp; Errors</h2>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="fl-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="30" width="105" height="44" rx="6" class="fs"/><text x="57" y="57" text-anchor="middle">request</text>
    <rect x="135" y="30" width="125" height="44" rx="6" class="fb sb"/><text x="197" y="50" text-anchor="middle">before_request</text><text x="197" y="66" text-anchor="middle" font-size="11" class="tm">timer, auth, req id</text>
    <rect x="285" y="30" width="95" height="44" rx="6" class="fg sg"/><text x="332" y="57" text-anchor="middle">view</text>
    <rect x="405" y="30" width="120" height="44" rx="6" class="fb sb"/><text x="465" y="50" text-anchor="middle">after_request</text><text x="465" y="66" text-anchor="middle" font-size="11" class="tm">headers, logging</text>
    <text x="570" y="57" text-anchor="middle">resp</text>
    <line x1="110" y1="52" x2="133" y2="52" stroke="currentColor" marker-end="url(#fl-ar)"/>
    <line x1="260" y1="52" x2="283" y2="52" stroke="currentColor" marker-end="url(#fl-ar)"/>
    <line x1="380" y1="52" x2="403" y2="52" stroke="currentColor" marker-end="url(#fl-ar)"/>
    <line x1="525" y1="52" x2="550" y2="52" stroke="currentColor" marker-end="url(#fl-ar)"/>
    <rect x="270" y="105" width="125" height="36" rx="6" class="fr sr"/><text x="332" y="128" text-anchor="middle">errorhandler</text>
    <line x1="332" y1="74" x2="332" y2="103" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#fl-ar)"/><text x="345" y="94" font-size="11" class="tr">raise</text>
    <path d="M395,123 L465,123 L465,76" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#fl-ar)"/>
  </svg><figcaption>Hooks wrap every request; an exception jumps to the matching error handler, which still returns a normal response.</figcaption></figure>
  <div class="fx" data-lang="py"># ---------- middleware: hooks around every request ----------
@app.before_request
def start_timer():
    g.t0 = time.perf_counter()
    g.request_id = request.headers.get("X-Request-ID", uuid.uuid4().hex[:8])

@app.after_request
def add_headers(resp):
    ms = (time.perf_counter() - g.t0) * 1000
    resp.headers["X-Request-ID"] = g.request_id
    app.logger.info("%s %s %s %.1fms", request.method, request.path, resp.status_code, ms)
    return resp

# ---------- error handlers: always JSON ----------
class BadInput(Exception):
    pass

@app.errorhandler(BadInput)
def bad_input(e):
    return jsonify(error="bad_input", detail=str(e)), 422

@app.errorhandler(404)
def not_found(e):
    return jsonify(error="not_found", path=request.path), 404</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Hooks are airport security on the way in and customs on the way out: every passenger passes through, whatever their flight.</p></div>
  <p><code>g</code> is a per-request scratchpad: the timer set in <code>before_request</code> is read in <code>after_request</code>. Returning a response from <code>before_request</code> short-circuits the view (handy for auth).</p>

  <h2 id="fl-bp"><span class="num">04</span>Blueprints &amp; Templates</h2>
  <div class="cards">
    <div><b>Blueprint</b><p>A mini-app: a group of routes with a shared URL prefix, registered on the main app.</p><small><code>/api/v1/*</code>, <code>/admin/*</code>, <code>/auth/*</code></small></div>
    <div><b>App factory</b><p><code>create_app(config)</code> builds and returns the app, so tests can make a fresh one.</p><small>Standard in larger projects</small></div>
    <div><b>Jinja2 template</b><p>HTML with <code>{{ var }}</code> and <code>{% for %}</code>. Values are auto-escaped.</p><small>Admin pages, model demo forms</small></div>
  </div>
  <div class="fx" data-lang="py"># ---------- a blueprint groups related routes ----------
ml = Blueprint("ml", __name__, url_prefix="/api/v1")
# ... @ml.get('/health'), @ml.post('/predict') below ...
app.register_blueprint(ml)

# ---------- path + query params, and a tiny Jinja2 page ----------
@app.get("/hello/&lt;name&gt;")
def hello(name):
    times = request.args.get("times", default=1, type=int)
    return render_template_string(
        "&lt;h1&gt;{% for _ in range(n) %}Hi {{ name }}! {% endfor %}&lt;/h1&gt;", name=name, n=times)</div>
  <div class="fx" data-lang="text">$ curl 'localhost:5002/hello/Asha?times=2'
&lt;h1&gt;Hi Asha! Hi Asha! &lt;/h1&gt;
$ curl 'localhost:5002/hello/&lt;script&gt;'
&lt;h1&gt;Hi &amp;lt;script&amp;gt;! &lt;/h1&gt;      ← auto-escaped: no XSS</div>
  <p><strong>Flask-RESTful</strong> is an older extension where one class is one resource and its methods are the verbs. Still seen in legacy code:</p>
  <div class="fx" data-lang="py">from flask import Flask
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)
MODELS = {"churn": {"version": 3}}

class Model(Resource):                  # one class = one resource; methods = HTTP verbs
    def get(self, name):
        return MODELS.get(name, {"error": "unknown"}), (200 if name in MODELS else 404)
    def delete(self, name):
        MODELS.pop(name, None)
        return "", 204

api.add_resource(Model, "/models/&lt;string:name&gt;")

c = app.test_client()
print(c.get("/models/churn").status_code, c.get("/models/churn").json)
print(c.delete("/models/churn").status_code, c.get("/models/churn").status_code)</div>
  <div class="fx" data-lang="text">200 {'version': 3}
204 404</div>

  <h2 id="fl-ml"><span class="num">05</span>Serving a Model</h2>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="fl-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="110" y="16" text-anchor="middle" class="tm" font-size="12">offline, once</text>
    <text x="430" y="16" text-anchor="middle" class="tm" font-size="12">online, every request</text>
    <rect x="5" y="30" width="95" height="40" rx="6" class="fv"/><text x="52" y="55" text-anchor="middle">train.py</text>
    <rect x="125" y="30" width="110" height="40" rx="6" class="fs"/><text x="180" y="55" text-anchor="middle">model.joblib</text>
    <rect x="265" y="30" width="110" height="40" rx="6" class="fb sb"/><text x="320" y="49" text-anchor="middle">app start</text><text x="320" y="63" text-anchor="middle" font-size="11" class="tm">joblib.load</text>
    <rect x="400" y="30" width="90" height="40" rx="6" class="ft st"/><text x="445" y="49" text-anchor="middle">validate</text><text x="445" y="63" text-anchor="middle" font-size="11" class="tm">input</text>
    <rect x="510" y="30" width="85" height="40" rx="6" class="fg sg"/><text x="552" y="49" text-anchor="middle">predict</text><text x="552" y="63" text-anchor="middle" font-size="11" class="tm">→ JSON</text>
    <line x1="100" y1="50" x2="123" y2="50" stroke="currentColor" marker-end="url(#fl-ar2)"/>
    <line x1="235" y1="50" x2="263" y2="50" stroke="currentColor" marker-end="url(#fl-ar2)"/>
    <line x1="375" y1="50" x2="398" y2="50" stroke="currentColor" marker-end="url(#fl-ar2)"/>
    <line x1="490" y1="50" x2="508" y2="50" stroke="currentColor" marker-end="url(#fl-ar2)"/>
    <line x1="252" y1="22" x2="252" y2="110" stroke="currentColor" stroke-dasharray="3 3"/>
    <text x="320" y="100" text-anchor="middle" font-size="12" class="tr">load once, never per request</text>
  </svg><figcaption>Training and serving are separate programs joined by one artifact file.</figcaption></figure>
  <div class="fx" data-lang="py">import joblib
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=500)).fit(X, y)
joblib.dump({"model": model, "classes": ["setosa", "versicolor", "virginica"],
             "version": "iris-lr-1"}, "model.joblib")
print("train acc:", round(model.score(X, y), 3))</div>
  <div class="fx" data-lang="text">train acc: 0.973</div>
  <div class="fx" data-lang="py">import time, uuid, logging
import joblib, numpy as np
from flask import Flask, Blueprint, jsonify, request, g, render_template_string

logging.basicConfig(level=logging.INFO, format="%(message)s")
app = Flask(__name__)
bundle = joblib.load("model.joblib")          # loaded ONCE at import, not per request
# (hooks + error handlers from section 03; BadInput -&gt; 422)

# ---------- a blueprint groups related routes ----------
ml = Blueprint("ml", __name__, url_prefix="/api/v1")

@ml.get("/health")
def health():
    return {"status": "ok", "model": bundle["version"]}      # dict -&gt; JSON automatically

@ml.post("/predict")
def predict():
    body = request.get_json(silent=True) or {}
    feats = body.get("features")
    if not isinstance(feats, list) or len(feats) != 4:
        raise BadInput("'features' must be a list of 4 numbers")
    try:
        x = np.array([feats], dtype=float)
    except ValueError:
        raise BadInput("features must be numeric")
    proba = bundle["model"].predict_proba(x)[0]
    i = int(proba.argmax())
    return jsonify(label=bundle["classes"][i], confidence=round(float(proba[i]), 3))

app.register_blueprint(ml)</div>
  <div class="fx" data-lang="text">
$ curl -X POST localhost:5002/api/v1/predict -H 'Content-Type: application/json' -d '{"features": [6.7, 3.0, 5.2, 2.3]}'
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: 29deacbb

{"confidence":0.961,"label":"virginica"}

$ curl -X POST localhost:5002/api/v1/predict -H 'Content-Type: application/json' -d '{"features": [1, 2]}'
{"detail":"'features' must be a list of 4 numbers","error":"bad_input"}
 [422]
$ curl localhost:5002/api/v1/nope
{"error":"not_found","path":"/api/v1/nope"}
 [404]</div>
  <ul>
    <li>Save the <strong>whole pipeline</strong> (scaler + model), plus class names and a version, so serving can't skip preprocessing.</li>
    <li><code>float(proba[i])</code>: NumPy floats aren't JSON-serializable.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: pickle / joblib</span><p>Loading a pickle runs arbitrary code, so only load files you produced. Also pin the scikit-learn version: a model pickled on one version may fail or misbehave on another.</p></div>
  <div class="callout trap"><span class="label">Trap: training–serving skew</span><p>If the API does its own feature engineering (different scaling, different category order), predictions silently degrade. Ship preprocessing inside the saved pipeline.</p></div>

  <h2 id="fl-test"><span class="num">06</span>Testing</h2>
  <p>The test client calls the app in-process: no server, no port, milliseconds per test.</p>
  <div class="fx" data-lang="py">import pytest
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    return app.test_client()          # calls the app in-process: no server, no network

def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200 and r.json["status"] == "ok"

def test_predict_virginica(client):
    r = client.post("/api/v1/predict", json={"features": [6.7, 3.0, 5.2, 2.3]})
    assert r.status_code == 200
    assert r.json["label"] == "virginica" and 0 &lt;= r.json["confidence"] &lt;= 1

@pytest.mark.parametrize("bad", [{}, {"features": [1, 2]}, {"features": ["a", 1, 2, 3]}])
def test_predict_rejects_bad_input(client, bad):
    r = client.post("/api/v1/predict", json=bad)
    assert r.status_code == 422 and r.json["error"] == "bad_input"

def test_request_id_echoed(client):
    r = client.get("/api/v1/health", headers={"X-Request-ID": "abc"})
    assert r.headers["X-Request-ID"] == "abc"</div>
  <div class="fx" data-lang="text">$ pytest -q test_app.py
......                                                                   [100%]
6 passed in 1.05s</div>
  <div class="callout intu"><span class="label">What to test in an ML API</span><p>Health, one known-good prediction, schema of the response, every class of bad input (422 not 500), and headers your infra depends on.</p></div>

  <h2 id="fl-sync"><span class="num">07</span>Sync / WSGI Limits</h2>
  <p>A sync worker handles one request at a time. While a view waits on a DB or remote call, that worker is idle but busy.</p>
  <div class="fx" data-lang="py">import time
from flask import Flask
app = Flask(__name__)

@app.get("/slow")
def slow():
    time.sleep(1)          # stands in for a 1 s DB query or remote call
    return {"ok": True}</div>
  <div class="fx" data-lang="text">$ gunicorn -w 1 slow:app             # then fire 3 requests at once
1 sync worker:              3 concurrent requests -&gt; [200, 200, 200]  in 3.14 s
1 worker x 3 threads:       3 concurrent requests -&gt; [200, 200, 200]  in 1.20 s</div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="5" y="22" font-size="12">1 sync worker</text>
    <rect x="140" y="10" width="140" height="18" class="fb"/><rect x="280" y="10" width="140" height="18" class="ft"/><rect x="420" y="10" width="140" height="18" class="fv"/>
    <text x="5" y="72" font-size="12">1 worker × 3 threads</text>
    <rect x="140" y="45" width="140" height="14" class="fb"/><rect x="140" y="62" width="140" height="14" class="ft"/><rect x="140" y="79" width="140" height="14" class="fv"/>
    <line x1="140" y1="110" x2="580" y2="110" stroke="currentColor"/>
    <text x="140" y="126" font-size="11" text-anchor="middle">0 s</text><text x="280" y="126" font-size="11" text-anchor="middle">1 s</text><text x="420" y="126" font-size="11" text-anchor="middle">2 s</text><text x="560" y="126" font-size="11" text-anchor="middle">3 s</text>
    <text x="300" y="146" font-size="12" text-anchor="middle" class="tm">each colour = one request waiting on I/O</text>
  </svg><figcaption>Sync requests queue behind each other; extra workers or threads are the only way to overlap waiting.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Flask (WSGI)</th><th>FastAPI (ASGI)</th></tr>
    <tr><td>Concurrency model</td><td>Processes × threads</td><td>Async event loop (+ threadpool for <code>def</code>)</td></tr>
    <tr><td>Many slow I/O calls (LLM APIs, DBs)</td><td>Needs many threads/workers</td><td>Thousands of waits in one process</td></tr>
    <tr><td>Input validation</td><td>Manual (or marshmallow)</td><td>Built in (Pydantic), automatic 422</td></tr>
    <tr><td>API docs</td><td>Add-on</td><td>Automatic <code>/docs</code></td></tr>
    <tr><td>WebSockets / streaming</td><td>Awkward</td><td>Native</td></tr>
    <tr><td>Ecosystem / templates</td><td>Huge, mature; great for server-rendered pages</td><td>API-first</td></tr>
  </table>
  <div class="callout intu"><span class="label">Rule of thumb</span><p>Existing Flask service, small internal tool, or HTML pages: Flask is fine. New JSON API, especially one calling other services or LLMs: FastAPI. For CPU-heavy models, neither framework matters much; workers and batching do.</p></div>

  <h2 id="fl-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Where should you load the model, and why?</summary><div class="qa-body">Once, at module import / app startup (a global or app config), not inside the view. Loading per request adds hundreds of ms to seconds of disk I/O and deserialization each call and multiplies memory spikes. Each gunicorn worker process holds its own copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if a view raises an unhandled exception?</summary><div class="qa-body">Flask returns a 500 with an HTML error page (or the debugger in debug mode). Register <code>@app.errorhandler(Exception)</code> or specific handlers to log it and return a JSON error, and raise your own exception types for client errors so they map to 4xx.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output: 3 concurrent requests to a view that sleeps 1 s, served by <code>gunicorn -w 1</code>?</summary><div class="qa-body">About 3 seconds total: the single sync worker handles them one after another (measured: 3.14 s). With <code>--threads 3</code> or <code>-w 3</code> it drops to ~1 s (measured: 1.20 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you add request timing and a request id to every response?</summary><div class="qa-body"><code>before_request</code> stores <code>g.t0</code> and <code>g.request_id</code> (from the incoming header or a new uuid); <code>after_request</code> computes elapsed time, logs it, and sets <code>X-Request-ID</code> on the response.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your /predict returns 500 with "Object of type float32 is not JSON serializable". Fix?</summary><div class="qa-body">The model returned NumPy scalars. Convert: <code>float(p)</code>, <code>int(label)</code>, or <code>arr.tolist()</code> before <code>jsonify</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are blueprints for?</summary><div class="qa-body">Splitting a large app into modules (e.g. <code>api_v1</code>, <code>admin</code>, <code>auth</code>), each with its own routes, URL prefix and optionally error handlers and templates, registered on the app. Also lets you mount <code>/api/v2</code> next to <code>/api/v1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is loading an uploaded pickle file dangerous?</summary><div class="qa-body">Unpickling can execute arbitrary code embedded in the file. Only load artifacts from your own trusted storage; for portable models prefer formats like ONNX or safetensors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Flask or FastAPI for a new service that calls an LLM API and a vector DB per request?</summary><div class="qa-body">FastAPI. Each request mostly waits on network I/O; async lets one process overlap thousands of such waits, and you get Pydantic validation and OpenAPI docs for free. Flask would need many threads/workers to reach the same concurrency.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a Flask endpoint without starting a server?</summary><div class="qa-body"><code>client = app.test_client()</code>, then <code>client.post("/api/v1/predict", json={...})</code> and assert on <code>r.status_code</code> and <code>r.json</code>. Use a pytest fixture and parametrize bad inputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's wrong with <code>app.run(debug=True, host="0.0.0.0")</code> on a server?</summary><div class="qa-body">It exposes the Werkzeug debugger to the network: anyone triggering an error gets an interactive Python console (remote code execution). It's also a single-process dev server. Use gunicorn with debug off.</div></details>
</main>`
});
