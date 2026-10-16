// notes/apis/api_fastapi.js — FastAPI
Object.assign(TOPIC_CONTENT, {
  "api_fastapi": `<main>
  <h1>FastAPI</h1>
  <p class="lead">FastAPI is the default way to put an ML model behind an API today: type hints become validation, docs and editor help, and async lets one process juggle thousands of slow calls. This page builds and runs a real model service with uvicorn. Builds on <em>Flask</em> and <em>HTTP &amp; REST Fundamentals</em>.</p>

  <h2 id="fa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">FastAPI</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why FastAPI</div>
        <ul>
          <li><b>ASGI</b> — async server standard; uvicorn runs it, Starlette underneath</li>
          <li><b>Type hints</b> — drive parsing, validation, docs, editor autocomplete</li>
          <li><b>Pydantic v2</b> — validation core in Rust; fast</li>
          <li><b>Auto docs</b> — <code>/docs</code> (Swagger), <code>/redoc</code>, <code>/openapi.json</code></li>
          <li><b>vs Flask</b> — built-in validation, async, docs; Flask = WSGI, manual checks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inputs</div>
        <ul>
          <li><b>Path param</b> — in the URL template: <code>/products/{product_id}</code></li>
          <li><b>Query param</b> — any simple arg not in path: <code>?limit=5</code></li>
          <li><b>Body</b> — any Pydantic-model arg</li>
          <li><b>Header</b> — <code>x_api_key: Annotated[str, Header()]</code> ↔ <code>X-API-Key</code></li>
          <li><b>Constraints</b> — <code>Query(ge=1, le=100)</code>, <code>Field(gt=0)</code></li>
          <li>Strings coerced: <code>"yes"</code> → <code>True</code>, <code>"31"</code> → <code>31</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pydantic &amp; 422</div>
        <ul>
          <li><b>BaseModel</b> — class with typed fields = schema</li>
          <li><b>Field</b> — <code>gt, ge, lt, le, min_length, max_length</code></li>
          <li><b>@field_validator</b> — custom clean/check per field</li>
          <li><b>v2 API</b> — <code>model_validate</code>, <code>model_dump</code>, <code>model_dump_json</code></li>
          <li><b>422</b> — automatic; lists every error with <code>loc</code>, <code>msg</code>, <code>input</code></li>
          <li><b>response_model</b> — filters + validates output; hides <code>password_hash</code></li>
          <li>⚠ Without response_model, every key you return leaks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dependency Injection</div>
        <ul>
          <li><b>Depends(fn)</b> — FastAPI calls fn, passes result to endpoint</li>
          <li><b>yield deps</b> — setup → yield → cleanup (DB session close)</li>
          <li><b>Uses</b> — DB session, current user, API key, settings, pagination</li>
          <li><b>Chained</b> — deps can depend on deps (role check → user → token)</li>
          <li><b>Testing</b> — <code>app.dependency_overrides[dep] = fake</code></li>
          <li>💡 like a hotel concierge fetching what each guest needs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Around the endpoint</div>
        <ul>
          <li><b>Middleware</b> — <code>@app.middleware("http")</code>; wraps every request (timing, ids)</li>
          <li><b>HTTPException</b> — <code>raise HTTPException(401, "...")</code></li>
          <li><b>exception_handler</b> — map your exception → JSON + status (503)</li>
          <li><b>BackgroundTasks</b> — run after response is sent; small jobs only</li>
          <li><b>WebSockets</b> — <code>@app.websocket</code>; two-way, long-lived</li>
          <li>⚠ Background tasks die with the process → Celery for real jobs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">async vs def</div>
        <ul>
          <li><b>async def</b> — runs on the event loop; must <code>await</code> I/O</li>
          <li><b>def</b> — runs in a threadpool; safe for blocking libs</li>
          <li>⚠ <b>Blocking trap</b> — <code>time.sleep</code>/<code>requests</code> in async def freezes all: 10 req = 10.4 s</li>
          <li><b>Fix</b> — async libs (httpx, asyncpg) or plain def → 1.5 s</li>
          <li><b>CPU-heavy model</b> — def + multiple workers; async doesn't speed up math</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Serving ML properly</div>
        <ul>
          <li><b>lifespan</b> — load model once at startup, release at shutdown</li>
          <li><b>/predict</b> — Pydantic input → model → response_model output</li>
          <li><b>/predict/batch</b> — one vectorised call; cap size (<code>max_length=100</code>)</li>
          <li><b>/health</b> — liveness: process up; <b>/ready</b> — model loaded (503 if not)</li>
          <li>Return <code>model_version</code> with every prediction</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Testing &amp; Running</div>
        <ul>
          <li><b>TestClient</b> — in-process; <code>with TestClient(app)</code> runs lifespan</li>
          <li>⚠ Without <code>with</code>, startup never runs → model missing</li>
          <li><b>Dev</b> — <code>uvicorn main:app --reload</code></li>
          <li><b>Prod</b> — <code>uvicorn main:app --workers 4</code> or gunicorn + UvicornWorker</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="fa-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why FastAPI</span><span class="rm-sub">ASGI, type hints, auto docs</span></div></div>
      <div class="rm-item rm-done" data-target="fa-params"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Path &amp; Query Params</span><span class="rm-sub">Typed function arguments</span></div></div>
      <div class="rm-item rm-done" data-target="fa-pyd"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Pydantic &amp; 422</span><span class="rm-sub">Validation and response models</span></div></div>
      <div class="rm-item rm-done" data-target="fa-di"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Dependency Injection</span><span class="rm-sub">DB sessions, auth, overrides</span></div></div>
      <div class="rm-item rm-done" data-target="fa-mw"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Middleware, Errors, Extras</span><span class="rm-sub">Background tasks, WebSockets, docs</span></div></div>
      <div class="rm-item rm-done" data-target="fa-async"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">async vs def</span><span class="rm-sub">The blocking-call trap, measured</span></div></div>
      <div class="rm-item rm-done" data-target="fa-ml"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Serving a Model</span><span class="rm-sub">Lifespan, batch, health</span></div></div>
      <div class="rm-item rm-done" data-target="fa-test"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Testing</span><span class="rm-sub">TestClient and overrides</span></div></div>
      <div class="rm-item rm-done" data-target="fa-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="fa-why"><span class="num">01</span>Why FastAPI</h2>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <rect x="5" y="15" width="130" height="50" rx="6" class="fs"/><text x="70" y="38" text-anchor="middle">uvicorn</text><text x="70" y="55" text-anchor="middle" font-size="11" class="tm">ASGI server</text>
    <rect x="155" y="15" width="130" height="50" rx="6" class="ft st"/><text x="220" y="38" text-anchor="middle">Starlette</text><text x="220" y="55" text-anchor="middle" font-size="11" class="tm">routing, async, WS</text>
    <rect x="305" y="15" width="130" height="50" rx="6" class="fb sb"/><text x="370" y="38" text-anchor="middle">FastAPI</text><text x="370" y="55" text-anchor="middle" font-size="11" class="tm">type hints → API</text>
    <rect x="455" y="15" width="140" height="50" rx="6" class="fv"/><text x="525" y="38" text-anchor="middle">Pydantic v2</text><text x="525" y="55" text-anchor="middle" font-size="11" class="tm">validation (Rust core)</text>
    <text x="300" y="95" text-anchor="middle" font-size="12">one type hint  →  parsing + validation + 422 errors + OpenAPI docs</text>
  </svg><figcaption>FastAPI is a thin layer that turns Python type hints into everything an API needs.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p><strong>ASGI</strong> (Asynchronous Server Gateway Interface): the async successor to WSGI. One process can hold many requests open while each waits on I/O.</p></div>
  <div class="cards">
    <div><b>Validation</b><p>Bad input never reaches your code; clients get a precise 422.</p></div>
    <div><b>Docs</b><p>Interactive Swagger UI at <code>/docs</code>, generated from the code.</p></div>
    <div><b>Async</b><p>Overlaps waiting on DBs, LLM APIs, other services.</p></div>
    <div><b>Editor help</b><p>Inputs are typed objects, so autocomplete and type checkers work.</p></div>
  </div>

  <h2 id="fa-params"><span class="num">02</span>Path &amp; Query Params</h2>
  <div class="fx" data-lang="py">@app.get("/products/{product_id}")
def get_product(product_id: int, include_stock: bool = False,
                limit: Annotated[int, Query(ge=1, le=100)] = 10):
    return {"product_id": product_id, "include_stock": include_stock, "limit": limit}</div>
  <div class="fx" data-lang="text">$ curl "localhost:8021/products/11?include_stock=yes&amp;limit=5"
{"product_id":11,"include_stock":true,"limit":5}
$ curl "localhost:8021/products/abc?limit=500"
{"detail":[{"type":"int_parsing","loc":["path","product_id"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"abc"},{"type":"less_than_equal","loc":["query","limit"],"msg":"Input should be less than or equal to 100","input":"500","ctx":{"le":100}}]}</div>
  <ul>
    <li>Name in the path template → <strong>path param</strong>. Other simple args → <strong>query params</strong>. Pydantic model → <strong>JSON body</strong>.</li>
    <li>Strings are converted: <code>"yes"</code> became <code>true</code>. Both errors were reported at once, each with its <code>loc</code>.</li>
  </ul>

  <h2 id="fa-pyd"><span class="num">03</span>Pydantic &amp; 422</h2>
  <div class="fx" data-lang="py">from pydantic import BaseModel, Field, ValidationError, field_validator

class Customer(BaseModel):
    name: str
    city: str | None = None
    age: int = Field(ge=18)

    @field_validator("name")
    @classmethod
    def tidy(cls, v: str) -&gt; str:
        return v.strip().title()

c = Customer.model_validate({"name": "  asha ", "age": "31"})   # "31" coerced to 31
print(repr(c))
print(c.model_dump(), c.model_dump_json())
try:
    Customer(name="Dia", age=15)
except ValidationError as e:
    print(e.error_count(), "error:", e.errors()[0]["msg"])</div>
  <div class="fx" data-lang="text">Customer(name='Asha', city=None, age=31)
{'name': 'Asha', 'city': None, 'age': 31} {"name":"Asha","city":null,"age":31}
1 error: Input should be greater than or equal to 18</div>
  <p>The model's input and output schemas for the iris service:</p>
  <div class="fx" data-lang="py"># ---------- Pydantic schemas ----------
class IrisIn(BaseModel):
    sepal_length: float = Field(gt=0, lt=10, examples=[6.7])
    sepal_width: float = Field(gt=0, lt=10)
    petal_length: float = Field(gt=0, lt=10)
    petal_width: float = Field(gt=0, lt=10)

class PredictionOut(BaseModel):
    label: Literal["setosa", "versicolor", "virginica"]
    confidence: float
    model_version: str

class BatchIn(BaseModel):
    items: list[IrisIn] = Field(min_length=1, max_length=100)</div>
  <p>A real bad request against the running server (<code>uvicorn main:app --port 8021</code>):</p>
  <div class="fx" data-lang="text">$ curl -X POST localhost:8021/predict -H 'X-API-Key: demo-key' -H 'Content-Type: application/json' -d '{"sepal_length":"big","sepal_width":-1,"petal_length":5.2}'
# HTTP 422 Unprocessable Content
{"detail": [
  {"type": "float_parsing", "loc": ["body", "sepal_length"], "msg": "Input should be a valid number, unable to parse string as a number", "input": "big"},
  {"type": "greater_than", "loc": ["body", "sepal_width"], "msg": "Input should be greater than 0", "input": -1, "ctx": {"gt": 0.0}},
  {"type": "missing", "loc": ["body", "petal_width"], "msg": "Field required", "input": {"sepal_length": "big", "sepal_width": -1, "petal_length": 5.2}}
]}</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Pydantic is the bouncer with a checklist. It checks every guest at the door and hands back a full list of what's wrong, so the party inside (your code) never sees a bad guest.</p></div>
  <h3>Response models</h3>
  <div class="fx" data-lang="py">from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserIn(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str

@app.post("/users", response_model=UserOut, status_code=201)
def create_user(u: UserIn):
    row = {"id": 1, "email": u.email, "password": u.password, "password_hash": "$2b$12$..."}
    return row               # extra keys are filtered out by response_model</div>
  <div class="fx" data-lang="text">$ curl -X POST localhost:8022/users -d '{"email":"asha@shop.com","password":"hunter2"}'
{"id":1,"email":"asha@shop.com"} [201]</div>
  <div class="callout trap"><span class="label">Trap</span><p>Return a DB row without <code>response_model</code> and every column ships, including <code>password_hash</code>. Separate <code>In</code> and <code>Out</code> models stop both leaks and mass assignment.</p></div>

  <h2 id="fa-di"><span class="num">04</span>Dependency Injection</h2>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <defs><marker id="fa-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="215" y="95" width="170" height="38" rx="6" class="fb sb"/><text x="300" y="119" text-anchor="middle">endpoint /predict</text>
    <rect x="10" y="10" width="160" height="40" rx="6" class="ft st"/><text x="90" y="35" text-anchor="middle">get_db() → conn</text>
    <rect x="220" y="10" width="160" height="40" rx="6" class="ft st"/><text x="300" y="35" text-anchor="middle">api_key() → caller</text>
    <rect x="430" y="10" width="160" height="40" rx="6" class="fv"/><text x="510" y="35" text-anchor="middle">IrisIn ← JSON body</text>
    <line x1="90" y1="50" x2="250" y2="93" stroke="currentColor" marker-end="url(#fa-ar)"/>
    <line x1="300" y1="50" x2="300" y2="93" stroke="currentColor" marker-end="url(#fa-ar)"/>
    <line x1="510" y1="50" x2="350" y2="93" stroke="currentColor" marker-end="url(#fa-ar)"/>
  </svg><figcaption>FastAPI resolves each Depends() before the endpoint runs and passes in the results.</figcaption></figure>
  <div class="fx" data-lang="py"># ---------- dependencies ----------
def get_db():
    conn = sqlite3.connect("preds.db")
    try:
        yield conn                 # handed to the endpoint
    finally:
        conn.close()               # runs after the response, even on error

def api_key(x_api_key: Annotated[str, Header()] = ""):
    if x_api_key != "demo-key":
        raise HTTPException(401, "invalid API key")
    return "team-growth"

@app.get("/stats")
def stats(db: sqlite3.Connection = Depends(get_db)):
    db.execute("CREATE TABLE IF NOT EXISTS preds (label TEXT)")
    n = db.execute("SELECT COUNT(*) FROM preds").fetchone()[0]
    return {"stored_predictions": n}</div>
  <div class="fx" data-lang="text">$ curl localhost:8021/stats
{"stored_predictions":0}</div>
  <ul>
    <li><code>yield</code> dependencies give setup + guaranteed cleanup, like a <code>with</code> block around the request.</li>
    <li>One function, reused by every endpoint that needs it; swapped for a fake in tests.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hotel concierge. The guest (endpoint) lists what it needs; the concierge fetches it, and tidies up after checkout.</p></div>

  <h2 id="fa-mw"><span class="num">05</span>Middleware, Errors, Extras</h2>
  <div class="fx" data-lang="py"># ---------- middleware ----------
@app.middleware("http")
async def timing(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - t0) * 1000:.1f}"
    return response

# ---------- custom error ----------
class ModelNotReady(Exception):
    pass

@app.exception_handler(ModelNotReady)
async def not_ready(request: Request, exc: ModelNotReady):
    return JSONResponse(status_code=503, content={"error": "model not loaded"})</div>
  <table class="tbl">
    <tr><th>Tool</th><th>Use it for</th></tr>
    <tr><td><code>raise HTTPException(404, "...")</code></td><td>Expected client errors inside endpoints</td></tr>
    <tr><td><code>@app.exception_handler(MyError)</code></td><td>Map domain errors to a status + JSON body</td></tr>
    <tr><td><code>@app.middleware("http")</code></td><td>Cross-cutting: timing, request ids, logging</td></tr>
    <tr><td><code>BackgroundTasks</code></td><td>Small work after the response: audit log, email</td></tr>
    <tr><td><code>@app.websocket</code></td><td>Two-way streams: live scores, token streaming, chat</td></tr>
  </table>
  <p>The <code>/predict</code> endpoint (section 07) queues an audit write; the client already has its answer when it runs:</p>
  <div class="fx" data-lang="text">$ cat audit.log
{"caller": "team-growth", "label": "virginica", "confidence": 0.961, "model_version": "iris-lr-1"}</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>BackgroundTasks</code> run inside the same process with no retries: a crash or deploy loses them. Use Celery or another queue for anything that matters (see <em>Production Backend</em>).</p></div>
  <h3>WebSockets and OpenAPI</h3>
  <div class="fx" data-lang="py">@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    async for text in websocket.iter_text():
        x = IrisIn.model_validate_json(text)
        await websocket.send_json(_predict([x])[0].model_dump())</div>
  <div class="fx" data-lang="text">$ curl localhost:8021/docs | grep title     →  &lt;title&gt;Iris API - Swagger UI&lt;/title&gt;
$ curl localhost:8021/openapi.json          (summarised)
openapi 3.1.0 | {'title': 'Iris API', 'version': '1.0'}
  GET /health
  GET /ready
  GET /products/{product_id}
  POST /predict
  POST /predict/batch
  GET /stats
  schemas: ['BatchIn', 'HTTPValidationError', 'IrisIn', 'PredictionOut', 'ValidationError']</div>
  <p>The OpenAPI spec also generates client SDKs and contract tests. Hide internal routes with <code>include_in_schema=False</code>.</p>

  <h2 id="fa-async"><span class="num">06</span>async vs def</h2>
  <div class="fx" data-lang="py">import asyncio, time
from fastapi import FastAPI
app = FastAPI()

@app.get("/async-blocking")
async def bad():
    time.sleep(1)              # blocks the ONE event loop thread
    return {"ok": True}

@app.get("/async-awaiting")
async def good():
    await asyncio.sleep(1)     # yields: loop serves others while waiting
    return {"ok": True}

@app.get("/sync-def")
def fine():
    time.sleep(1)              # plain def runs in a threadpool: OK
    return {"ok": True}</div>
  <div class="fx" data-lang="text">$ uvicorn blocking:app --port 8023      # one process; 10 requests fired at once
/async-blocking 10 concurrent requests (all 200)  in 10.38 s
/async-awaiting 10 concurrent requests (all 200)  in 1.52 s
/sync-def       10 concurrent requests (all 200)  in 1.49 s</div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <text x="5" y="20" font-size="12">async + time.sleep</text>
    <rect x="150" y="8" width="42" height="16" class="fr"/><rect x="192" y="8" width="42" height="16" class="fr" opacity="0.8"/><rect x="234" y="8" width="42" height="16" class="fr" opacity="0.6"/><text x="285" y="21" font-size="12" class="tr">… one after another → 10.4 s</text>
    <text x="5" y="62" font-size="12">async + await</text>
    <rect x="150" y="48" width="42" height="6" class="fg"/><rect x="150" y="56" width="42" height="6" class="fg"/><rect x="150" y="64" width="42" height="6" class="fg"/><text x="200" y="64" font-size="12" class="tg">all wait together → 1.5 s</text>
    <text x="5" y="106" font-size="12">plain def (threadpool)</text>
    <rect x="150" y="92" width="42" height="6" class="fb"/><rect x="150" y="100" width="42" height="6" class="fb"/><rect x="150" y="108" width="42" height="6" class="fb"/><text x="200" y="108" font-size="12" class="tb">threads wait in parallel → 1.5 s</text>
    <line x1="150" y1="135" x2="580" y2="135" stroke="currentColor"/>
    <text x="150" y="152" font-size="11" text-anchor="middle">0 s</text><text x="192" y="152" font-size="11" text-anchor="middle">1 s</text><text x="580" y="152" font-size="11" text-anchor="middle">10 s</text>
  </svg><figcaption>A blocking call inside async def freezes the single event loop for everyone.</figcaption></figure>
  <table class="tbl">
    <tr><th>Your endpoint does…</th><th>Write it as</th></tr>
    <tr><td>Awaitable I/O (<code>httpx.AsyncClient</code>, <code>asyncpg</code>, async OpenAI SDK)</td><td><code>async def</code></td></tr>
    <tr><td>Blocking I/O (<code>requests</code>, <code>psycopg2</code>, <code>boto3</code>)</td><td><code>def</code> (FastAPI runs it in a threadpool)</td></tr>
    <tr><td>CPU-heavy inference (sklearn, torch)</td><td><code>def</code>, and scale with worker processes</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>The event loop is one waiter serving many tables. <code>await</code> = take an order, move on while the kitchen cooks. <code>time.sleep</code> in async = the waiter stands at the kitchen door; every table waits.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Async doesn't make maths faster. A 200 ms model call in <code>async def</code> blocks the loop for 200 ms. Use <code>def</code> or <code>await run_in_threadpool(...)</code>, and add workers for CPU.</p></div>

  <h2 id="fa-ml"><span class="num">07</span>Serving a Model</h2>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <defs><marker id="fa-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <line x1="10" y1="55" x2="585" y2="55" stroke="currentColor" marker-end="url(#fa-ar2)"/>
    <rect x="15" y="30" width="130" height="50" rx="6" class="fv"/><text x="80" y="52" text-anchor="middle">startup</text><text x="80" y="69" text-anchor="middle" font-size="11">joblib.load once</text>
    <rect x="165" y="30" width="270" height="50" rx="6" class="fg sg"/><text x="300" y="52" text-anchor="middle">serve requests</text><text x="300" y="69" text-anchor="middle" font-size="11">/predict  /predict/batch  /health  /ready</text>
    <rect x="455" y="30" width="125" height="50" rx="6" class="fs"/><text x="517" y="52" text-anchor="middle">shutdown</text><text x="517" y="69" text-anchor="middle" font-size="11">release, flush</text>
    <text x="80" y="100" text-anchor="middle" font-size="11" class="tm">before yield</text><text x="517" y="100" text-anchor="middle" font-size="11" class="tm">after yield</text>
  </svg><figcaption>The lifespan function brackets the app's whole life: code before yield runs once at startup.</figcaption></figure>
  <div class="fx" data-lang="py">import sqlite3, time, json
from contextlib import asynccontextmanager
from typing import Annotated, Literal

import joblib, numpy as np
from fastapi import (FastAPI, Depends, HTTPException, Header, Query, Request,
                     BackgroundTasks, WebSocket)
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ---------- lifespan: load expensive things ONCE ----------
ML = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    ML["bundle"] = joblib.load("model.joblib")        # startup
    print("model loaded:", ML["bundle"]["version"])
    yield
    ML.clear()                                        # shutdown
    print("model released")

app = FastAPI(title="Iris API", version="1.0", lifespan=lifespan)</div>
  <div class="fx" data-lang="py"># ---------- helpers ----------
def _predict(rows: list[IrisIn]) -&gt; list[PredictionOut]:
    if "bundle" not in ML:
        raise ModelNotReady()
    b = ML["bundle"]
    X = np.array([[r.sepal_length, r.sepal_width, r.petal_length, r.petal_width] for r in rows])
    P = b["model"].predict_proba(X)                   # ONE vectorised call for the batch
    return [PredictionOut(label=b["classes"][int(p.argmax())], confidence=round(float(p.max()), 3),
                          model_version=b["version"]) for p in P]

def log_prediction(payload: dict):
    time.sleep(0.2)                                   # pretend this is slow
    with open("audit.log", "a") as f:
        f.write(json.dumps(payload) + "&#92;n")

@app.post("/predict", response_model=PredictionOut)
def predict(x: IrisIn, bg: BackgroundTasks, caller: str = Depends(api_key)):
    out = _predict([x])[0]
    bg.add_task(log_prediction, {"caller": caller, **out.model_dump()})
    return out

@app.post("/predict/batch", response_model=list[PredictionOut])
def predict_batch(batch: BatchIn, caller: str = Depends(api_key)):
    return _predict(batch.items)</div>
  <div class="fx" data-lang="py">@app.get("/health")
def health():
    return {"status": "ok"}                           # liveness: process is up

@app.get("/ready")
def ready():
    if "bundle" not in ML:
        raise ModelNotReady()
    return {"ready": True, "model": ML["bundle"]["version"]}</div>
  <div class="fx" data-lang="text">$ curl -X POST localhost:8021/predict -H "X-API-Key: demo-key" -H "Content-Type: application/json" &#92;
       -d '{"sepal_length":6.7,"sepal_width":3.0,"petal_length":5.2,"petal_width":2.3}'
HTTP/1.1 200 OK
content-type: application/json
x-process-time-ms: 10.5

{"label":"virginica","confidence":0.961,"model_version":"iris-lr-1"}

$ curl -X POST localhost:8021/predict/batch -H "X-API-Key: demo-key" -d @batch.json
[{"label":"setosa","confidence":0.985,"model_version":"iris-lr-1"},{"label":"versicolor","confidence":0.942,"model_version":"iris-lr-1"},{"label":"virginica","confidence":0.961,"model_version":"iris-lr-1"}]
$ curl -X POST localhost:8021/predict -d ... (no key)
{"detail":"invalid API key"} [401]
$ curl localhost:8021/health ; curl localhost:8021/ready
{"status":"ok"}
{"ready":true,"model":"iris-lr-1"}</div>
  <div class="fx" data-lang="text">$ cat uvicorn.log      # start, two requests, Ctrl+C
INFO:     Started server process [32294]
INFO:     Waiting for application startup.
model loaded: iris-lr-1
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8021 (Press CTRL+C to quit)
INFO:     127.0.0.1:40232 - "GET /docs HTTP/1.1" 200 OK
INFO:     127.0.0.1:40248 - "POST /predict HTTP/1.1" 200 OK
INFO:     Shutting down
INFO:     Waiting for application shutdown.
model released
INFO:     Application shutdown complete.
INFO:     Finished server process [32294]</div>
  <ul>
    <li><strong>Batch endpoint</strong>: one <code>predict_proba</code> on a matrix is far cheaper than N calls; cap the size.</li>
    <li><strong>/health</strong> (liveness) says the process is alive; <strong>/ready</strong> (readiness) says it can serve. Load balancers route only to ready instances.</li>
    <li>Return <code>model_version</code> so every prediction is traceable.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>The old <code>@app.on_event("startup")</code> is deprecated. Use <code>lifespan</code>. Each uvicorn worker process runs it, so 4 workers = 4 model copies in RAM.</p></div>

  <h2 id="fa-test"><span class="num">08</span>Testing</h2>
  <div class="fx" data-lang="py">from fastapi.testclient import TestClient
from main import app

GOOD = {"sepal_length": 6.7, "sepal_width": 3.0, "petal_length": 5.2, "petal_width": 2.3}
H = {"X-API-Key": "demo-key"}

def test_predict_and_health():
    with TestClient(app) as client:          # 'with' runs the lifespan (loads the model)
        assert client.get("/ready").json()["ready"] is True
        r = client.post("/predict", json=GOOD, headers=H)
        assert r.status_code == 200 and r.json()["label"] == "virginica"

def test_validation_and_auth():
    with TestClient(app) as client:
        assert client.post("/predict", json={**GOOD, "petal_width": -1}, headers=H).status_code == 422
        assert client.post("/predict", json=GOOD).status_code == 401
        assert client.post("/predict/batch", json={"items": []}, headers=H).status_code == 422

def test_model_not_loaded_returns_503():
    client = TestClient(app)                 # no 'with': lifespan never ran
    assert client.post("/predict", json=GOOD, headers=H).status_code == 503

def test_override_auth_dependency():
    from main import api_key
    app.dependency_overrides[api_key] = lambda: "test-user"     # swap a dependency
    with TestClient(app) as client:
        assert client.post("/predict", json=GOOD).status_code == 200
    app.dependency_overrides.clear()

def test_websocket():
    with TestClient(app) as client, client.websocket_connect("/ws") as ws:
        ws.send_json(GOOD)
        assert ws.receive_json()["label"] == "virginica"</div>
  <div class="fx" data-lang="text">$ pytest -q test_main.py
5 passed, 1 warning in 1.81s</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>TestClient(app)</code> without <code>with</code> skips the lifespan, so the model never loads. The third test uses that on purpose to check the 503 path.</p></div>
  <h3>Hands-on</h3>
  <ol>
    <li>Add a <code>GET /model</code> endpoint returning version and class names, with a response model.</li>
    <li>Make <code>/predict/batch</code> reject more than 100 items and confirm the 422 in a test.</li>
    <li>Change <code>/predict</code> to <code>async def</code> and add <code>time.sleep(1)</code>; fire 10 requests and watch the time explode. Then fix it.</li>
  </ol>

  <h2 id="fa-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is FastAPI faster to build with than Flask for JSON APIs?</summary><div class="qa-body">Type hints do the work: request parsing, validation with precise 422 errors, response filtering and OpenAPI docs come free. Flask needs manual checks or extra libraries. Plus native async for I/O-heavy services.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output: 10 concurrent requests to <code>async def</code> with <code>time.sleep(1)</code>, one uvicorn worker?</summary><div class="qa-body">About 10 s (measured 10.38 s). <code>time.sleep</code> blocks the only event-loop thread, so requests run one by one. With <code>await asyncio.sleep(1)</code> or a plain <code>def</code>, ~1.5 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should an endpoint be <code>def</code> rather than <code>async def</code>?</summary><div class="qa-body">When it calls blocking libraries (requests, psycopg2, most ML <code>predict</code> calls). FastAPI runs <code>def</code> endpoints in a threadpool so they don't block the loop. Use <code>async def</code> only when everything slow inside is awaited.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a 422 from FastAPI mean, and what does it contain?</summary><div class="qa-body">The request was well-formed but failed validation: wrong type, out-of-range value, missing field. The body's <code>detail</code> lists every error with <code>type</code>, <code>loc</code> (e.g. <code>["body","sepal_width"]</code>), <code>msg</code> and the offending <code>input</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you load a 2 GB model so it isn't reloaded per request?</summary><div class="qa-body">In the <code>lifespan</code> context manager before <code>yield</code>, stored on <code>app.state</code> or a module dict. Add a <code>/ready</code> endpoint that returns 503 until it's loaded. Remember each worker process loads its own copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dependency injection in FastAPI? Give two uses.</summary><div class="qa-body">Declaring <code>param = Depends(fn)</code> makes FastAPI call <code>fn</code> (resolving its own dependencies) and pass the result in. Uses: a DB session opened and closed per request via <code>yield</code>; the current user from a token; settings; shared pagination params.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test an endpoint protected by auth without real tokens?</summary><div class="qa-body"><code>app.dependency_overrides[get_current_user] = lambda: fake_user</code>, run the test with <code>TestClient</code>, then clear the overrides.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>response_model</code> do?</summary><div class="qa-body">Validates and serializes the return value against a schema, dropping any extra fields (e.g. <code>password_hash</code>), and documents the response in OpenAPI.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>BackgroundTasks or Celery for sending a "model retrained" email? For a 20-minute re-scoring job?</summary><div class="qa-body">Email: BackgroundTasks is fine (small, losing one is tolerable). 20-minute job: Celery (or another queue): survives restarts, retries, runs on separate workers, and reports status.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why have both /health and /ready?</summary><div class="qa-body">Liveness (<code>/health</code>): is the process alive? If not, restart it. Readiness (<code>/ready</code>): can it serve now (model loaded, DB reachable)? If not, stop sending traffic, but don't kill it. Mixing them causes restart loops during slow model loads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why add a batch endpoint to a model API?</summary><div class="qa-body">Vectorised inference on N rows costs barely more than on 1, and one HTTP round trip replaces N. Cap the batch size to protect memory and latency.</div></details>
</main>`
});
