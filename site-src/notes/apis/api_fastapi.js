// notes/apis/api_fastapi.js — FastAPI
Object.assign(TOPIC_CONTENT, {
  "api_fastapi": `<main>
  <h1>FastAPI</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>FastAPI</span></div>
  <p class="lead">The Flask version of Biteful's <code>POST /v1/orders</code> spent 12 of its 23 lines checking input, reported only the first mistake, and one sync worker needed 3.02 s for three customers whose receipt emails each took a second. FastAPI attacks both problems. You write a normal function with type hints (<code>qty: int</code>), and FastAPI uses those hints to parse and check the input, reject bad requests with a 422 that lists <em>every</em> error, filter the output, and write the documentation page. Its endpoints can be <code>async</code>, so one process can wait for many things at once. This note rebuilds the Biteful orders API one need at a time: type hints, Pydantic models, parameters, response models, dependency injection (traced call by call), async endpoints, background tasks, WebSockets, OpenAPI docs, error handling, loading the delivery-time model with <code>lifespan</code>, and tests with <code>TestClient</code>. Everything was run (FastAPI 0.146, Pydantic 2.13, uvicorn 0.53).</p>

  <h2 id="fa-fits" class="open"><span class="num">★</span>Where this fits</h2>
<figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="fa-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="69" y="42" text-anchor="middle" font-size="12">1 HTTP &amp; REST</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the conversation</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="42" text-anchor="middle" font-size="12">2 Flask</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">write the server</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="343" y="42" text-anchor="middle" font-size="12" font-weight="700">3 FastAPI</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">validation, docs, async</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="480" y="42" text-anchor="middle" font-size="12">4 Auth &amp; Security</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">who may call</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="614" y="42" text-anchor="middle" font-size="12">5 Production</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">many copies, watched</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#fa-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#fa-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#fa-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#fa-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: the Biteful orders API</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">GET /restaurants · POST /orders · customers vs restaurant staff · a slow receipt email on a queue</text>
  </svg><figcaption>The APIs &amp; Backend track in reading order. You are on the green note. Each note starts from a weakness the one before it leaves.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="api_flask">Flask</a> and <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a></b><span>You can write routes, read requests, return status codes, use hooks and test with a test client. Two weaknesses remained: hand-written validation and one-request-per-thread waiting. Async ideas come from <a class="xref" data-note="py_asyncio">asyncio</a> (event loop, <code>await</code>); classes with typed fields from <a class="xref" data-note="py_classes">Classes</a>.</span></li>
    <li><b>This note adds: an API built from type hints</b><span>Type hints → Pydantic models → path/query/body/header parameters → <code>response_model</code> → <code>Depends</code> → <code>async def</code> → <code>BackgroundTasks</code> → WebSockets → OpenAPI → exception handlers and middleware → <code>lifespan</code> → <code>TestClient</code> and <code>dependency_overrides</code>.</span></li>
    <li><b>Leads to: <a class="xref" data-note="api_auth">Authentication &amp; Security</a> → <a class="xref" data-note="api_production">Production Backend</a></b><span>Our "who are you" is a plain <code>X-Customer</code> header anyone can fake; the auth note replaces it with keys, sessions and JWTs, written as the same dependencies. The background receipt email dies if the process restarts; production moves it to a Celery queue and runs many uvicorn workers behind nginx.</span></li>
  </ol>

  <h2 id="fa-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Running example: the Biteful orders API on port 8000. Asha's order 101 (2 Masala Dosas, ₹240) at Dosa Hut (10); staff at Dosa Hut send <code>X-Staff-Of: 10</code>; the receipt email takes 1 s; the ETA model gives 31.6 min for 3.2 km and 2 items.</p>
  <ol class="story">
    <li><b>The pain</b><span>Q: why not keep Flask? → 12 of 23 lines were checks, one error at a time, no docs, sync waiting. Could the function's own signature describe its input?</span></li>
    <li><b>Type hints</b><span>Q: how can code say what a value should be? → <code>price: int</code>. Python ignores it (<code>line_total("120", 2)</code> = "120120") but keeps it in <code>__annotations__</code>, where a library can read it. Hints describe single values; an order is a nested shape…</span></li>
    <li><b>Pydantic models</b><span>Q: how do we describe and check a whole JSON shape? → <code>class OrderIn(BaseModel)</code> with <code>Field(ge=1, le=10)</code>: <code>"2"</code> becomes 2, and the Pizza/"two"/99 order gets <em>both</em> errors at once. How does FastAPI know which argument is the body and which is the query string?</span></li>
    <li><b>Path, query, body parameters</b><span>Q: where does each input come from? → name in the path → path; simple type → query; model → body; <code>Header()</code> → header. <code>?min_rating=high</code> now gives 422 instead of Flask's silent default. Input is safe; what about output?</span></li>
    <li><b>Response models</b><span>Q: how do we stop internal fields leaking? → <code>response_model=OrderOut</code>: the stored row has <code>customer_phone</code> and <code>payment_ref</code>; the client sees 3 fields. Every endpoint also needs the same "who is calling" and "open the DB"…</span></li>
    <li><b>Dependency injection</b><span>Q: how do endpoints share setup without copying it? → <code>Depends(get_db)</code>, <code>Depends(current_staff)</code>; traced: header check → open session → order lookup → endpoint → close session; staff of 11 → 404, no header → 401. The receipt email still blocks…</span></li>
    <li><b>async endpoints</b><span>Q: can one process wait for many emails at once? → <code>await</code>: 10 orders in 1.02 s; but <code>time.sleep</code> inside <code>async def</code> froze the loop: 10.06 s; a plain <code>def</code> runs in a threadpool: 1.04 s. Yet Asha shouldn't wait for her email at all…</span></li>
    <li><b>Background tasks</b><span>Q: how do we answer first and send the email after? → <code>bg.add_task(send_receipt_email, …)</code>: 201 in 0.003 s; receipt logged a second later. Asha also wants live status without refreshing…</span></li>
    <li><b>WebSockets</b><span>Q: how does the server push updates? → <code>@app.websocket</code>: placed → preparing → out_for_delivery → delivered on one open connection. Other teams now need to know what all these endpoints accept…</span></li>
    <li><b>OpenAPI docs</b><span>Q: where is the documentation? → Generated from the same hints: <code>/docs</code>, <code>/openapi.json</code> with 8 operations and <code>OrderItem.qty</code> limits 1–10. Some errors are business rules, not shapes…</span></li>
    <li><b>Error handling and middleware</b><span>Q: how do domain errors become status codes, and what runs around every request? → <code>HTTPException</code> (404, 403), <code>@app.exception_handler(OrderConflict)</code> → 409, middleware adds <code>X-Process-Time-ms</code>. The ETA model must be loaded somewhere…</span></li>
    <li><b>lifespan</b><span>Q: where do expensive things load once? → before <code>yield</code> in <code>lifespan</code>: "model loaded" at startup, "model released" at shutdown; <code>/ready</code> says 503 until then. How do we test all of it?</span></li>
    <li><b>Testing with TestClient</b><span>Q: how do we check everything without a server? → <code>with TestClient(app)</code> runs the lifespan; <code>dependency_overrides</code> swaps the customer check; WebSockets testable too: 6 passed. Next: real identity (Auth).</span></li>
  </ol>

  <h2 id="fa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">FastAPI</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why &amp; stack</div>
        <ul>
          <li><b>ASGI</b> — async server standard; <b>uvicorn</b> runs it, <b>Starlette</b> routes</li>
          <li><b>Type hints</b> drive parsing, validation, docs, editor help</li>
          <li><b>Pydantic v2</b> — validation core in Rust</li>
          <li>vs Flask: 12 hand-written check lines → 0 for shape checks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inputs</div>
        <ul>
          <li><b>Path</b> — name in <code>"/v1/restaurants/{rid}"</code></li>
          <li><b>Query</b> — simple type not in path: <code>?min_rating=4</code></li>
          <li><b>Body</b> — a Pydantic model argument</li>
          <li><b>Header</b> — <code>Annotated[str, Header()]</code>: <code>x_customer</code> ↔ <code>X-Customer</code></li>
          <li><b>Limits</b> — <code>Query(ge=0, le=5)</code>, <code>Field(ge=1, le=10)</code></li>
          <li>Coercion: <code>"2"</code> → 2; <code>"abc"</code> for int → 422</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pydantic &amp; 422</div>
        <ul>
          <li><b>BaseModel</b> = schema; nested lists of models</li>
          <li><b>Field</b> — <code>gt ge lt le min_length max_length</code></li>
          <li><b>@field_validator</b> — clean/check one field</li>
          <li><code>model_validate</code>, <code>model_dump</code>, <code>model_dump_json</code></li>
          <li><b>422</b> lists every error: <code>loc</code>, <code>msg</code>, <code>input</code></li>
          <li><b>response_model</b> filters output (no <code>customer_phone</code>)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dependencies</div>
        <ul>
          <li><b>Depends(fn)</b> — FastAPI calls fn, passes the result</li>
          <li><b>yield</b> deps — setup → endpoint → cleanup</li>
          <li><b>Chained</b> — order_for_staff ← current_staff + get_db</li>
          <li>Raise in a dep → endpoint never runs (401, 404)</li>
          <li><b>Tests</b> — <code>app.dependency_overrides[dep] = fake</code></li>
          <li>💡 hotel concierge</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">async &amp; background</div>
        <ul>
          <li><b>async def</b> + <code>await</code> → 10 waits in 1.02 s</li>
          <li>⚠ <code>time.sleep</code> in async def → 10.06 s (loop frozen)</li>
          <li><b>def</b> → threadpool → 1.04 s</li>
          <li><b>BackgroundTasks</b> — after the response: 201 in 3 ms</li>
          <li>⚠ dies with the process → Celery (Production)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Around the endpoints</div>
        <ul>
          <li><b>WebSocket</b> — <code>@app.websocket</code>; server pushes status</li>
          <li><b>OpenAPI</b> — <code>/docs</code>, <code>/redoc</code>, <code>/openapi.json</code></li>
          <li><b>HTTPException(404/403)</b>; <b>exception_handler</b> → 409, 503</li>
          <li><b>middleware("http")</b> — timing header on every response</li>
          <li><b>lifespan</b> — load model once; <code>/health</code> vs <code>/ready</code></li>
          <li><b>TestClient</b> — <code>with</code> runs lifespan</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="fa-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Pain: Why FastAPI</span><span class="rm-sub">Hand checks and blocked workers</span></div></div>
      <div class="rm-item rm-done" data-target="fa-hints"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Type Hints</span><span class="rm-sub">Notes Python keeps but ignores</span></div></div>
      <div class="rm-item rm-done" data-target="fa-pyd"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Pydantic Models</span><span class="rm-sub">Shapes, coercion, all errors at once</span></div></div>
      <div class="rm-item rm-done" data-target="fa-params"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Path, Query, Body Parameters</span><span class="rm-sub">Where each input comes from</span></div></div>
      <div class="rm-item rm-done" data-target="fa-resp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Response Models</span><span class="rm-sub">Only listed fields leave</span></div></div>
      <div class="rm-item rm-done" data-target="fa-di"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Dependency Injection</span><span class="rm-sub">Traced call by call</span></div></div>
      <div class="rm-item rm-done" data-target="fa-async"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">async Endpoints</span><span class="rm-sub">The blocking trap, measured</span></div></div>
      <div class="rm-item rm-done" data-target="fa-bg"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Background Tasks</span><span class="rm-sub">Answer first, email after</span></div></div>
      <div class="rm-item rm-done" data-target="fa-ws"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">WebSockets</span><span class="rm-sub">Live order status</span></div></div>
      <div class="rm-item rm-done" data-target="fa-docs"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">OpenAPI Docs</span><span class="rm-sub">Docs from the same hints</span></div></div>
      <div class="rm-item rm-done" data-target="fa-err"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Error Handling &amp; Middleware</span><span class="rm-sub">404, 403, 409, timing</span></div></div>
      <div class="rm-item rm-done" data-target="fa-ml"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">lifespan: Serving the Model</span><span class="rm-sub">Load once, ready checks</span></div></div>
      <div class="rm-item rm-done" data-target="fa-test"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Testing with TestClient</span><span class="rm-sub">Overrides, lifespan, WebSockets</span></div></div>
      <div class="rm-item rm-done" data-target="fa-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One order through every layer</span></div></div>
      <div class="rm-item rm-done" data-target="fa-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="fa-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="fa-why"><span class="num">01</span>The Pain: Why FastAPI</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Flask note ended with two numbers: 12 of the 23 lines in <code>create_order</code> were hand-written checks (and they reported only the first mistake), and one sync worker took 3.02 s to serve three customers whose receipt emails took 1 s each. Thirty endpoints means thirty sets of checks, and a lunch rush means a thread per waiting customer. Is there a way to <em>declare</em> what the input looks like instead of checking it line by line, and to wait for many things at once?</p>
  </div>
  <p>Look at what the Flask checks were really saying: "<code>restaurant_id</code> is an int", "<code>items</code> is a list of 1 to 20 objects", "<code>qty</code> is a whole number from 1 to 10". That is a <em>description of a shape</em>, written as code. FastAPI lets you write the description once, as Python types, and generates the checking, the error messages, and the documentation from it. Underneath it is a stack of four pieces:</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <rect x="5" y="15" width="130" height="50" rx="6" class="fs"/><text x="70" y="38" text-anchor="middle">uvicorn</text><text x="70" y="55" text-anchor="middle" font-size="11" class="tm">ASGI server</text>
    <rect x="155" y="15" width="130" height="50" rx="6" class="ft st"/><text x="220" y="38" text-anchor="middle">Starlette</text><text x="220" y="55" text-anchor="middle" font-size="11" class="tm">routing, async, WS</text>
    <rect x="305" y="15" width="130" height="50" rx="6" class="fb sb"/><text x="370" y="38" text-anchor="middle">FastAPI</text><text x="370" y="55" text-anchor="middle" font-size="11" class="tm">type hints → API</text>
    <rect x="455" y="15" width="140" height="50" rx="6" class="fv"/><text x="525" y="38" text-anchor="middle">Pydantic v2</text><text x="525" y="55" text-anchor="middle" font-size="11" class="tm">validation (Rust core)</text>
    <text x="300" y="95" text-anchor="middle" font-size="12">one type hint  →  parsing + validation + 422 errors + OpenAPI docs</text>
  </svg><figcaption>uvicorn opens the port (Flask used gunicorn or flask run), Starlette routes requests and handles async and WebSockets, FastAPI reads your hints, Pydantic does the checking.</figcaption></figure>
  <div class="cards">
    <div><b>Validation</b><p>Bad input never reaches your function; clients get a 422 listing every problem.</p></div>
    <div><b>Docs</b><p>An interactive page at <code>/docs</code>, generated from the code.</p></div>
    <div><b>Async</b><p>Overlaps waiting on email providers, databases, LLM APIs.</p></div>
    <div><b>Editor help</b><p>Inputs are typed objects, so autocomplete and type checkers work.</p></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>ASGI</strong> (Asynchronous Server Gateway Interface): the async successor to WSGI. The server calls an <code>async</code> application, so one process can keep many requests open while each waits on I/O. <strong>FastAPI</strong>: a framework that builds an ASGI app from typed Python functions.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"FastAPI is fast, so my model gets faster." The name is about development speed and I/O concurrency. A CPU-heavy prediction takes the same time in any framework; section 07 shows async can even make it worse if used wrongly.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: type hints.</b> "Declare the shape with Python types" assumes Python has a way to say what type something should be. It does, but it has a surprising property.</div>

  <h2 id="fa-hints"><span class="num">02</span>Type Hints</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To generate checks from code, the code must say "price is an int" somewhere a program can read. Python has syntax for that. Does Python enforce it?</p>
  </div>
  <p>A <strong>type hint</strong> (annotation) is a note after a name: <code>price: int</code>, <code>-&gt; int</code> for the return value. Predict the second line before reading the output:</p>
<div class="fx" data-lang="py">def line_total(price: int, qty: int) -&gt; int:
    return price * qty

print(line_total(120, 2))          # what we meant
print(line_total("120", 2))        # Python ignores the hints: string * 2
print(line_total.__annotations__)  # ...but it keeps them, and a library can read them</div>
<div class="fx" data-lang="text">240
120120
{'price': &lt;class 'int'&gt;, 'qty': &lt;class 'int'&gt;, 'return': &lt;class 'int'&gt;}</div>
  <p>Python ignored the hints: <code>"120" * 2</code> is string repetition, so the "total" became <code>"120120"</code>, a bug that would reach Asha's bill. But the hints were not thrown away: <code>__annotations__</code> holds them as real Python objects. That is the door FastAPI uses. When you write <code>def get_restaurant(rid: int)</code>, FastAPI reads <code>rid: int</code> and, before calling you, converts the text from the URL to an int or rejects it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A form with "Age (number)" printed next to the box. The printing doesn't stop anyone writing "twenty". A clerk who reads the printed labels and checks each box before accepting the form does. Python prints the labels; FastAPI is the clerk.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Type hint</strong>: an annotation stating the expected type of a parameter, variable or return value (<code>x: int</code>, <code>str | None</code>, <code>list[OrderItem]</code>, <code>Literal["placed", "delivered"]</code>). Not enforced by Python; available at runtime through <code>__annotations__</code> / <code>typing.get_type_hints</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Assuming hints protect plain functions. Only code that reads them (FastAPI, Pydantic, a type checker like mypy) acts on them. Inside your own helper functions, <code>"120"</code> still gets through.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Pydantic models.</b> <code>qty: int</code> describes one value. Asha's order is a nested shape: an object with a restaurant id and a <em>list</em> of items, each with a name and a quantity between 1 and 10. How do we describe and check a whole JSON document?</div>

  <h2 id="fa-pyd"><span class="num">03</span>Pydantic Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The order body is <code>{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}], "note": "..."}</code>. We need one description of that whole shape, including limits (1 to 10 dosas, at most 20 lines, a note under 200 characters), that checks everything and reports every problem at once. How?</p>
  </div>
  <p>The description of a data shape is a <strong>schema</strong>. In Pydantic, a schema is a class that inherits from <code>BaseModel</code>, with one typed attribute per field. <code>Field(...)</code> adds limits; a model can contain lists of other models; <code>@field_validator</code> runs your own function on one field.</p>
<div class="fx" data-lang="py">from pydantic import BaseModel, Field, ValidationError, field_validator

class OrderItem(BaseModel):
    name: str
    qty: int = Field(ge=1, le=10)                 # a whole number from 1 to 10

class OrderIn(BaseModel):
    restaurant_id: int
    items: list[OrderItem] = Field(min_length=1, max_length=20)
    note: str = Field(default="", max_length=200)

    @field_validator("note")
    @classmethod
    def tidy(cls, v: str) -&gt; str:
        return v.strip()

# 1) Asha's order, sent with strings where numbers belong
o = OrderIn.model_validate({"restaurant_id": "10", "items": [{"name": "Masala Dosa", "qty": "2"}],
                            "note": "  extra chutney "})
print(repr(o))
print(o.model_dump())
print(o.model_dump_json())

# 2) the order that Flask reported one error at a time
try:
    OrderIn.model_validate({"restaurant_id": 10,
                            "items": [{"name": "Pizza", "qty": "two"}, {"name": "Idli", "qty": 99}]})
except ValidationError as e:
    print(e.error_count(), "errors")
    for err in e.errors():
        print(" ", err["loc"], "-&gt;", err["msg"])</div>
<div class="fx" data-lang="text">OrderIn(restaurant_id=10, items=[OrderItem(name='Masala Dosa', qty=2)], note='extra chutney')
{'restaurant_id': 10, 'items': [{'name': 'Masala Dosa', 'qty': 2}], 'note': 'extra chutney'}
{"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"note":"extra chutney"}
2 errors
  ('items', 0, 'qty') -&gt; Input should be a valid integer, unable to parse string as an integer
  ('items', 1, 'qty') -&gt; Input should be less than or equal to 10</div>
  <p>Trace part 1: <code>"10"</code> fits <code>int</code>, so it became 10; <code>"2"</code> became 2 (this conversion is <strong>coercion</strong>; Pydantic does it only when it is safe: <code>"two"</code> is not); the validator stripped the note's spaces. <code>model_dump()</code> gives a dict back, <code>model_dump_json()</code> JSON text. Part 2 is the order that Flask rejected one error at a time: Pydantic found <em>both</em> problems, each with a <code>loc</code> (location) path: <code>('items', 0, 'qty')</code> means "items, first element, qty".</p>
  <p>Notice what the schema did <em>not</em> catch: "Pizza" isn't on Dosa Hut's menu. A schema knows shapes and limits, not your data. That rule stays in the endpoint (section 04).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Pydantic is the bouncer with a checklist. It checks every guest at the door and hands back a full list of what's wrong, so the party inside (your function) never sees a bad guest. It cannot know who is on tonight's guest list unless you tell it; that check happens inside.</p></div>
  <p>The schemas of the Biteful API (<code>OrderOut</code>, <code>StatusIn</code> and <code>EtaIn</code> are used in later sections):</p>
<div class="fx" data-lang="py"># ---------- schemas ----------
class OrderItem(BaseModel):
    name: str
    qty: int = Field(ge=1, le=10)

class OrderIn(BaseModel):
    restaurant_id: int
    items: list[OrderItem] = Field(min_length=1, max_length=20)
    note: str = Field(default="", max_length=200)

class OrderOut(BaseModel):                       # what clients may see
    order_id: int
    restaurant_id: int
    items: list[OrderItem]
    total: int
    status: Literal["placed", "preparing", "out_for_delivery", "delivered", "cancelled"]

class StatusIn(BaseModel):
    status: Literal["preparing", "out_for_delivery", "delivered", "cancelled"]

class EtaIn(BaseModel):
    distance_km: float = Field(gt=0, le=30)
    items: int = Field(ge=1, le=20)</div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Pydantic model</strong>: a class with typed fields that validates and coerces input on creation, raising <code>ValidationError</code> with every failure. <strong>Field constraints</strong>: <code>gt, ge, lt, le</code> (numbers), <code>min_length, max_length</code> (strings, lists). <strong>Literal</strong>: only these exact values.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Pydantic v1 and v2 differ: v2 uses <code>model_validate</code>/<code>model_dump</code> and <code>@field_validator</code>; v1's <code>parse_obj</code>/<code>dict()</code>/<code>@validator</code> are deprecated. And coercion means <code>"2"</code> is accepted for an int; use <code>Field(strict=True)</code> if a string must be refused.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: path, query and body parameters.</b> We can check a body. But an endpoint gets input from several places at once: the restaurant id in the path, <code>?min_rating=4</code> in the query string, the order in the body, the customer in a header. How does FastAPI know which argument comes from where?</div>

  <h2 id="fa-params"><span class="num">04</span>Path, Query &amp; Body Parameters</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In Flask we read each place by hand: function argument for the path, <code>request.args</code> for the query, <code>request.get_json()</code> for the body. In FastAPI the endpoint is just a function with typed arguments. How does it decide that <code>rid</code> is from the path, <code>min_rating</code> from the query string and <code>order</code> from the body?</p>
  </div>
  <p>FastAPI looks at each argument's name and type:</p>
  <table class="tbl"><caption>Where each argument comes from</caption>
    <tr><th>Argument looks like</th><th>Comes from</th><th>Biteful example</th></tr>
    <tr><td>name appears in the path template</td><td>path</td><td><code>rid: int</code> in <code>"/v1/restaurants/{rid}"</code></td></tr>
    <tr><td>simple type (int, float, str, bool), not in path</td><td>query string</td><td><code>min_rating: float = 0</code> ← <code>?min_rating=4</code></td></tr>
    <tr><td>a Pydantic model</td><td>JSON body</td><td><code>order: OrderIn</code></td></tr>
    <tr><td><code>Annotated[str, Header()]</code></td><td>header</td><td><code>x_customer</code> ← <code>X-Customer</code> (underscores become dashes)</td></tr>
  </table>
<div class="fx" data-lang="py">@app.get("/v1/restaurants")
def list_restaurants(city: str | None = None,
                     min_rating: Annotated[float, Query(ge=0, le=5)] = 0):
    return {"items": [r for r in RESTAURANTS.values()
                      if (city is None or r["city"] == city) and r["rating"] &gt;= min_rating]}

@app.get("/v1/restaurants/{rid}")
def get_restaurant(rid: int):
    if rid not in RESTAURANTS:
        raise HTTPException(404, "restaurant not found")
    return RESTAURANTS[rid]</div>
  <p><code>Annotated[float, Query(ge=0, le=5)]</code> reads "a float, from the query string, between 0 and 5". A default value (<code>= 0</code>, <code>= None</code>) makes it optional. The order endpoint's body is <code>OrderIn</code>, and the menu check is the business rule the schema can't know:</p>
<div class="fx" data-lang="py">@app.post("/v1/orders", response_model=OrderOut, status_code=201)
def create_order(order: OrderIn, bg: BackgroundTasks,
                 customer: str = Depends(current_customer), db: dict = Depends(get_db)):
    menu = MENUS.get(order.restaurant_id)
    if menu is None:
        raise HTTPException(422, "restaurant has no menu")
    unknown = [it.name for it in order.items if it.name not in menu]
    if unknown:
        raise HTTPException(422, f"not on the menu: {unknown}")
    total = sum(menu[it.name] * it.qty for it in order.items)
    oid = NEXT_ID[0]; NEXT_ID[0] += 1
    db["orders"][oid] = {"order_id": oid, "customer": customer, "customer_phone": "98xxxx1234",
                         "restaurant_id": order.restaurant_id, "items": order.items,
                         "total": total, "status": "placed", "note": order.note}
    bg.add_task(send_receipt_email, customer, oid, total)   # runs AFTER the response is sent
    return db["orders"][oid]                                 # response_model filters the fields</div>
  <p>Run with <code>uvicorn main:app --port 8000</code>, then the same kinds of requests that Flask got:</p>
<div class="fx" data-lang="text">$ curl -s 'localhost:8000/v1/restaurants?city=Pune&amp;min_rating=4'
{"items":[{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}]}
$ curl -s -w ' [%{http_code}]\\n' 'localhost:8000/v1/restaurants?min_rating=high'
{"detail":[{"type":"float_parsing","loc":["query","min_rating"],"msg":"Input should be a valid number, unable to parse string as a number","input":"high"}]} [422]

$ curl -s -w ' [%{http_code}]\\n' localhost:8000/v1/restaurants/abc
{"detail":[{"type":"int_parsing","loc":["path","rid"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"abc"}]} [422]

$ curl -s -w ' [%{http_code}]\\n' localhost:8000/v1/restaurants/99
{"detail":"restaurant not found"} [404]</div>
<div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:8000/v1/orders -H 'X-Customer: asha' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Pizza", "qty": "two"}, {"name": "Idli", "qty": 99}]}'
{"detail":[{"type":"int_parsing","loc":["body","items",0,"qty"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"two"},{"type":"less_than_equal","loc":["body","items",1,"qty"],"msg":"Input should be less than or equal to 10","input":99,"ctx":{"le":10}}]} [422]

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:8000/v1/orders -H 'X-Customer: asha' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Pizza", "qty": 1}]}'
{"detail":"not on the menu: ['Pizza']"} [422]

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:8000/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Idli", "qty": 1}]}'
{"detail":"send X-Customer"} [401]</div>
  <table class="tbl"><caption>Flask vs FastAPI on the same requests</caption>
    <tr><th>Request</th><th>Flask (hand checks)</th><th>FastAPI (from hints)</th></tr>
    <tr><td><code>?min_rating=high</code></td><td>200, silently used 0.0, all restaurants</td><td>422, <code>loc: ["query","min_rating"]</code></td></tr>
    <tr><td><code>/v1/restaurants/abc</code></td><td>404 (converter didn't match)</td><td>422, <code>loc: ["path","rid"]</code></td></tr>
    <tr><td>Pizza + "two" + 99</td><td>422, first error only</td><td>422, both qty errors (shape); then 422 "not on the menu" (business rule)</td></tr>
    <tr><td>no <code>X-Customer</code></td><td>"guest"</td><td>401 from the dependency (section 06)</td></tr>
  </table>
  <p>Count the cost now: <code>create_order</code>'s body has 5 lines of checks (the menu rules) instead of 12, and none of them is about types or ranges.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Path parameter</strong>: a named segment of the URL template. <strong>Query parameter</strong>: a <code>key=value</code> after <code>?</code>. <strong>Request body</strong>: the JSON document, declared as a Pydantic model. All three are validated before the endpoint runs; failures give 422 with a <code>loc</code> naming the source.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A list or model argument intended as a query parameter becomes the body unless you mark it <code>Query()</code>. And forgetting a default makes a query parameter <em>required</em>: <code>city: str</code> rejects every request without <code>?city=</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: response models.</b> Input is now checked at the door. But what goes <em>out</em>? Our stored order contains <code>customer_phone</code>; returning the row would send it to anyone who can read the order.</div>

  <h2 id="fa-resp"><span class="num">05</span>Response Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful stores each order with internal fields: the customer's phone number for the rider, a payment reference. Endpoints usually return the stored row. Everything returned is sent. How do we guarantee only the public fields leave, on every endpoint?</p>
  </div>
  <p>A <code>response_model</code> is a schema for the output: FastAPI validates the return value against it and drops every field it doesn't list.</p>
<div class="fx" data-lang="py">from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
ROW = {"order_id": 101, "total": 240, "status": "placed",
       "customer_phone": "98xxxx1234", "payment_ref": "pay_8f2k1"}   # a full database row

class OrderOut(BaseModel):
    order_id: int
    total: int
    status: str

@app.get("/leaky/orders/101")                         # no response_model
def leaky():
    return ROW

@app.get("/safe/orders/101", response_model=OrderOut)
def safe():
    return ROW                                         # same dict, filtered on the way out

c = TestClient(app)
print("leaky:", c.get("/leaky/orders/101").json())
print("safe :", c.get("/safe/orders/101").json())</div>
<div class="fx" data-lang="text">leaky: {'order_id': 101, 'total': 240, 'status': 'placed', 'customer_phone': '98xxxx1234', 'payment_ref': 'pay_8f2k1'}
safe : {'order_id': 101, 'total': 240, 'status': 'placed'}</div>
  <p>Same dict, two endpoints. Without a response model the phone number and payment reference leaked; with <code>OrderOut</code> only the three listed fields left. In <code>main.py</code>, <code>create_order</code> stores <code>customer</code>, <code>customer_phone</code> and <code>note</code> too, yet the 201 body in section 08 shows only <code>OrderOut</code>'s five fields. <code>status_code=201</code> on the decorator sets the success status.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A window envelope: whatever is printed on the letter inside, only the address area shows through the window.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>response_model</code></strong>: the schema used to validate, filter and document an endpoint's return value. Separate <strong>In</strong> and <strong>Out</strong> models (<code>OrderIn</code>, <code>OrderOut</code>) keep what clients may send apart from what they may see.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>One model for both directions invites <strong>mass assignment</strong>: if <code>OrderIn</code> had a <code>status</code> or <code>total</code> field, a client could send <code>"total": 1</code>. Inputs list only what clients may set; the server computes the rest.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: dependency injection.</b> Input and output are safe. Now almost every endpoint begins the same way: find out who is calling, open a database session, maybe load the order and check it belongs to this staff member, and close the session afterwards. Copying that into each function is how the Flask code grew.</div>

  <h2 id="fa-di"><span class="num">06</span>Dependency Injection</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Marking an order delivered needs: the staff member's restaurant (from a header), a database session (opened before, closed after, even on error), and the order itself (404 if it isn't this restaurant's). Three endpoints need the same steps. How do we write each step once, combine them, and still run the cleanup?</p>
  </div>
  <p>Write each step as a function, and ask for its result in an endpoint's signature with <code>Depends(that_function)</code>. Before calling the endpoint, FastAPI calls the dependency (resolving <em>its</em> dependencies first) and passes the result in. A dependency that <code>yield</code>s runs its code after <code>yield</code> once the response is done. This is <strong>dependency injection</strong>: what you depend on is handed to you instead of fetched by you.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hotel concierge. The guest (endpoint) lists what it needs: a taxi, a newspaper. The concierge fetches each item before the guest comes down, and tidies up after checkout. If the taxi can't be found, the guest is told before leaving the room.</p></div>
  <p>A small app that prints each step, so we can watch the order of calls:</p>
<div class="fx" data-lang="py"># di_trace.py: watch FastAPI resolve dependencies for one PATCH request
from typing import Annotated
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

ORDERS = {101: {"order_id": 101, "restaurant_id": 10, "status": "placed"}}
app = FastAPI()

def get_db():
    print("  get_db: open session")
    try:
        yield ORDERS
    finally:
        print("  get_db: close session")               # runs after the endpoint, even on error

def current_staff(x_staff_of: Annotated[int | None, Header()] = None):
    print(f"  current_staff: header X-Staff-Of={x_staff_of}")
    if x_staff_of is None:
        raise HTTPException(401, "staff only")
    return x_staff_of

def order_for_staff(oid: int, staff_of: int = Depends(current_staff), db=Depends(get_db)):
    print(f"  order_for_staff: oid={oid}, staff_of={staff_of}")   # a dependency WITH dependencies
    order = db.get(oid)
    if order is None or order["restaurant_id"] != staff_of:
        raise HTTPException(404, "order not found")
    return order

@app.patch("/v1/orders/{oid}/delivered")
def mark_delivered(order: dict = Depends(order_for_staff)):
    print("  endpoint: runs last, gets a ready order")
    order["status"] = "delivered"
    return order

c = TestClient(app)
for headers in [{"X-Staff-Of": "10"}, {"X-Staff-Of": "11"}, {}]:
    print("PATCH /v1/orders/101/delivered", headers)
    r = c.patch("/v1/orders/101/delivered", headers=headers)
    print("  -&gt;", r.status_code, r.json())</div>
<div class="fx" data-lang="text">PATCH /v1/orders/101/delivered {'X-Staff-Of': '10'}
  current_staff: header X-Staff-Of=10
  get_db: open session
  order_for_staff: oid=101, staff_of=10
  endpoint: runs last, gets a ready order
  get_db: close session
  -&gt; 200 {'order_id': 101, 'restaurant_id': 10, 'status': 'delivered'}
PATCH /v1/orders/101/delivered {'X-Staff-Of': '11'}
  current_staff: header X-Staff-Of=11
  get_db: open session
  order_for_staff: oid=101, staff_of=11
  get_db: close session
  -&gt; 404 {'detail': 'order not found'}
PATCH /v1/orders/101/delivered {}
  current_staff: header X-Staff-Of=None
  -&gt; 401 {'detail': 'staff only'}</div>
  <table class="tbl"><caption>The trace, explained</caption>
    <tr><th>Request</th><th>What ran</th><th>Result</th></tr>
    <tr><td>staff of 10</td><td>current_staff → get_db opens → order_for_staff → endpoint → get_db closes</td><td>200, status delivered</td></tr>
    <tr><td>staff of 11</td><td>current_staff → get_db opens → order_for_staff raises 404 → get_db still closes</td><td>404; endpoint never ran</td></tr>
    <tr><td>no header</td><td>current_staff raises 401</td><td>401; no session was even opened</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="fa-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="10" width="170" height="40" rx="6" class="ft st"/><text x="95" y="35" text-anchor="middle">current_staff → 10</text>
    <rect x="215" y="10" width="170" height="40" rx="6" class="ft st"/><text x="300" y="35" text-anchor="middle">get_db → session</text>
    <rect x="420" y="10" width="170" height="40" rx="6" class="fv"/><text x="505" y="35" text-anchor="middle">oid ← path</text>
    <rect x="200" y="62" width="200" height="34" rx="6" class="fb sb"/><text x="300" y="84" text-anchor="middle">order_for_staff → order</text>
    <rect x="200" y="108" width="200" height="34" rx="6" class="fg sg"/><text x="300" y="130" text-anchor="middle">mark_delivered(order)</text>
    <line x1="95" y1="50" x2="240" y2="62" stroke="currentColor" marker-end="url(#fa-ar)"/>
    <line x1="300" y1="50" x2="300" y2="61" stroke="currentColor" marker-end="url(#fa-ar)"/>
    <line x1="505" y1="50" x2="360" y2="62" stroke="currentColor" marker-end="url(#fa-ar)"/>
    <line x1="300" y1="96" x2="300" y2="107" stroke="currentColor" marker-end="url(#fa-ar)"/>
  </svg><figcaption>FastAPI resolves the graph from the top: the two leaf dependencies and the path value feed <code>order_for_staff</code>, whose result feeds the endpoint. Each dependency runs once per request even if several things ask for it.</figcaption></figure>
  <p>The dependencies in <code>main.py</code>; <code>current_customer</code> and <code>current_staff</code> are deliberately naive (anyone can send any header) until the <a class="xref" data-note="api_auth">Auth</a> note replaces them with real checks, without changing a single endpoint:</p>
<div class="fx" data-lang="py"># ---------- dependencies ----------
def get_db():
    db = {"orders": ORDERS}                        # stands in for a DB session
    try:
        yield db                                   # handed to the endpoint
    finally:
        pass                                       # a real session would close here

def current_customer(x_customer: Annotated[str | None, Header()] = None) -&gt; str:
    if not x_customer:                             # real auth: see the Auth note
        raise HTTPException(401, "send X-Customer")
    return x_customer

def current_staff(x_staff_of: Annotated[int | None, Header()] = None) -&gt; int:
    if x_staff_of is None:
        raise HTTPException(401, "staff only")
    return x_staff_of                              # the restaurant this staff member works at</div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Dependency</strong>: a function (or class) declared with <code>Depends()</code> whose result FastAPI injects into an endpoint or another dependency. <strong>Yield dependency</strong>: setup before <code>yield</code>, cleanup after, like a <code>with</code> block around the request.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Writing <code>Depends(get_db())</code> (with parentheses) passes the generator object instead of the function: pass the function itself. And heavy work in a dependency runs on every request that uses it; load models in <code>lifespan</code> (section 12), not in a dependency.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: async endpoints.</b> The code is now short and shared. But Flask's second weakness is untouched: the receipt email takes a second, and during that second the worker serves nobody. FastAPI promises "many waits in one process". How, and what can go wrong?</div>

  <h2 id="fa-async"><span class="num">07</span>async Endpoints</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ten customers place orders at the same moment, and each request waits a second for the email provider. Flask needed ten threads to finish in one second. Can a single process with a single thread wait for all ten at once, and what happens if one endpoint waits the wrong way?</p>
  </div>
  <p>The idea comes from <a class="xref" data-note="py_asyncio">asyncio</a>: an <code>async def</code> function can pause at <code>await</code> ("this will take a while; run something else and wake me when it's done"), and an <strong>event loop</strong> (one thread with a list of paused tasks) resumes whichever is ready. Three receipts, first with <code>await</code>, then with a plain blocking wait:</p>
<div class="fx" data-lang="py">import asyncio, time

async def send_receipt(order_id):
    await asyncio.sleep(1)                  # waiting on the email provider: let others run
    return f"receipt {order_id} sent"

async def main():
    t = time.perf_counter()
    done = await asyncio.gather(send_receipt(101), send_receipt(102), send_receipt(103))
    print(done, f"in {time.perf_counter() - t:.1f} s")

asyncio.run(main())

def send_receipt_sync(order_id):
    time.sleep(1)                           # stand and stare at the provider
    return f"receipt {order_id} sent"

t = time.perf_counter()
print([send_receipt_sync(i) for i in (101, 102, 103)], f"in {time.perf_counter() - t:.1f} s")</div>
<div class="fx" data-lang="text">['receipt 101 sent', 'receipt 102 sent', 'receipt 103 sent'] in 1.0 s
['receipt 101 sent', 'receipt 102 sent', 'receipt 103 sent'] in 3.0 s</div>
  <p>Three one-second waits overlapped: 1.0 s instead of 3.0 s. Now inside a real server. Three endpoints that each wait one second for the "email provider", in three different ways, and a client that fires 10 orders at each at once:</p>
<div class="fx" data-lang="py"># blocking.py: three ways to wait 1 s for the email provider inside an endpoint
import asyncio, time
from fastapi import FastAPI

app = FastAPI()

@app.post("/async-blocking")
async def bad():
    time.sleep(1)              # blocks the ONE event-loop thread: nobody else runs
    return {"order_id": 101}

@app.post("/async-awaiting")
async def good():
    await asyncio.sleep(1)     # stands in for an awaitable call (httpx.AsyncClient, aiosmtplib):
    return {"order_id": 101}   # the loop serves other requests while this one waits

@app.post("/sync-def")
def fine():
    time.sleep(1)              # plain def: FastAPI runs it in a threadpool, loop stays free
    return {"order_id": 101}</div>
<div class="fx" data-lang="py"># fire10.py: 10 customers place orders at the same moment, against each endpoint
import asyncio, time, httpx

async def burst(path):
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8001", timeout=30,
                                 trust_env=False) as client:   # local server: ignore proxy env vars
        t0 = time.perf_counter()
        rs = await asyncio.gather(*[client.post(path) for _ in range(10)])
        codes = {r.status_code for r in rs}
        print(f"{path:16} 10 concurrent -&gt; {codes} in {time.perf_counter() - t0:5.2f} s")

for p in ["/async-blocking", "/async-awaiting", "/sync-def"]:
    asyncio.run(burst(p))</div>
<div class="fx" data-lang="text">$ uvicorn blocking:app --port 8001        # one process, one event loop
$ python fire10.py
/async-blocking  10 concurrent -&gt; {200} in 10.06 s
/async-awaiting  10 concurrent -&gt; {200} in  1.02 s
/sync-def        10 concurrent -&gt; {200} in  1.04 s</div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <text x="5" y="20" font-size="12">async + time.sleep</text>
    <rect x="150" y="8" width="42" height="16" class="fr"/><rect x="192" y="8" width="42" height="16" class="fr" opacity="0.8"/><rect x="234" y="8" width="42" height="16" class="fr" opacity="0.6"/><text x="285" y="21" font-size="12" class="tr">… one after another → 10.06 s</text>
    <text x="5" y="62" font-size="12">async + await</text>
    <rect x="150" y="48" width="42" height="6" class="fg"/><rect x="150" y="56" width="42" height="6" class="fg"/><rect x="150" y="64" width="42" height="6" class="fg"/><text x="200" y="64" font-size="12" class="tg">all wait together → 1.02 s</text>
    <text x="5" y="106" font-size="12">plain def (threadpool)</text>
    <rect x="150" y="92" width="42" height="6" class="fb"/><rect x="150" y="100" width="42" height="6" class="fb"/><rect x="150" y="108" width="42" height="6" class="fb"/><text x="200" y="108" font-size="12" class="tb">threads wait in parallel → 1.04 s</text>
    <line x1="150" y1="135" x2="580" y2="135" stroke="currentColor"/>
    <text x="150" y="152" font-size="11" text-anchor="middle">0 s</text><text x="192" y="152" font-size="11" text-anchor="middle">1 s</text><text x="580" y="152" font-size="11" text-anchor="middle">10 s</text>
  </svg><figcaption>Each bar is one order. Top: <code>time.sleep</code> in an async endpoint holds the only loop thread, so orders run one after another. Middle and bottom: all ten waits overlap.</figcaption></figure>
  <ul>
    <li><strong>async + time.sleep: 10.06 s.</strong> <code>time.sleep</code> doesn't <code>await</code>, so the loop thread is stuck for each second and nobody else runs. One bad line made the server ten times slower than Flask with ten threads.</li>
    <li><strong>async + await: 1.02 s.</strong> Each request pauses at <code>await</code>, the loop starts the next; all ten wait together on one thread.</li>
    <li><strong>plain def: 1.04 s.</strong> FastAPI notices a plain <code>def</code> and runs it in a <strong>threadpool</strong> (a set of helper threads), so blocking inside it doesn't touch the loop. That is why every Biteful endpoint in <code>main.py</code> is a plain <code>def</code>: they call blocking code (the model, the receipt function).</li>
  </ul>
  <table class="tbl">
    <tr><th>Your endpoint does…</th><th>Write it as</th></tr>
    <tr><td>Awaitable I/O (<code>httpx.AsyncClient</code>, <code>asyncpg</code>, async email/LLM SDKs)</td><td><code>async def</code></td></tr>
    <tr><td>Blocking I/O (<code>requests</code>, <code>psycopg2</code>, <code>smtplib</code>, <code>boto3</code>)</td><td><code>def</code> (threadpool)</td></tr>
    <tr><td>CPU-heavy work (model prediction)</td><td><code>def</code>, and scale with worker processes</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>The event loop is one waiter serving many tables. <code>await</code> = take an order, move on while the kitchen cooks. <code>time.sleep</code> in async = the waiter stands at the kitchen door; every table waits.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Async endpoint</strong>: an <code>async def</code> path function run on the event loop; it must <code>await</code> every slow operation. <strong>Sync endpoint</strong>: a plain <code>def</code>, run in a threadpool.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Any blocking call in <code>async def</code> (<code>time.sleep</code>, <code>requests.get</code>, a 200 ms <code>model.predict</code>) freezes every request in that process. When in doubt, use <code>def</code>, or <code>await run_in_threadpool(fn, ...)</code>. Async doesn't make maths faster.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: background tasks.</b> Even with perfect async, Asha still waits a full second for her own receipt email before she sees "Order placed". She doesn't need the email to have been sent to see her order. Can the server answer first and send the email afterwards?</div>

  <h2 id="fa-bg"><span class="num">08</span>Background Tasks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The response "order 101 placed" is ready in a few milliseconds; the receipt email takes a second and Asha doesn't need to wait for it. How do we send the response first and run the email afterwards, in the same server?</p>
  </div>
  <p>Add a <code>BackgroundTasks</code> argument and call <code>bg.add_task(fn, args...)</code>. FastAPI sends the response, then runs the task (a plain <code>def</code> task runs in the threadpool). In <code>main.py</code>, <code>create_order</code> ends with <code>bg.add_task(send_receipt_email, customer, oid, total)</code>, and the task is:</p>
<div class="fx" data-lang="py"># ---------- background work ----------
def send_receipt_email(customer: str, order_id: int, total: int):
    time.sleep(1)                                  # the email provider is slow
    with open("receipts.log", "a") as f:
        f.write(f"{time.strftime('%H:%M:%S')} receipt for order {order_id} -&gt; {customer}: Rs {total}\\n")</div>
<div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}] in %{time_total}s\\n' -X POST localhost:8000/v1/orders -H 'X-Customer: asha' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}], "note": "extra chutney"}'
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"placed"} [201] in 0.003207s

$ date +%H:%M:%S; cat receipts.log; sleep 1.2; date +%H:%M:%S; cat receipts.log
00:16:04
cat: receipts.log: No such file or directory
00:16:05
00:16:05 receipt for order 101 -&gt; asha: Rs 240</div>
  <p>The 201 came back in 0.003 s, with the five <code>OrderOut</code> fields only. Right after, <code>receipts.log</code> did not exist yet; 1.2 s later it held the receipt, written at 00:16:05 by the task that ran after the response. Asha saw "Order placed" a full second sooner than in Flask.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The cashier hands you your token at once and drops the printed bill in the outbox; the bill is posted after you've left the counter.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Background task</strong>: a function scheduled with <code>BackgroundTasks.add_task</code> that runs in the same process after the response has been sent.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Background tasks live inside the web process: no retries, no status, and a crash or deploy during that second loses the email silently. They also compete with requests for the same CPU. Fine for small, losable work; for receipts that must arrive use a task queue (Celery, in <a class="xref" data-note="api_production">Production Backend</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: WebSockets.</b> HTTP is always "client asks, server answers". Asha's app wants to <em>be told</em> when Dosa Hut starts preparing her order and when the rider leaves, without asking every two seconds. Can the server push?</div>

  <h2 id="fa-ws"><span class="num">09</span>WebSockets</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Order 101 goes placed → preparing → out for delivery → delivered over half an hour. Polling <code>GET /v1/orders/101</code> every few seconds wastes requests and still shows changes late. How can the server send each change the moment it happens?</p>
  </div>
  <p>A <strong>WebSocket</strong> starts as an HTTP request and then "upgrades" into a long-lived, two-way connection: either side can send messages at any time until one closes it. Like a phone call instead of SMS.</p>
<div class="fx" data-lang="py"># ---------- WebSocket: live order status ----------
@app.websocket("/ws/orders/{oid}")
async def order_updates(websocket: WebSocket, oid: int):
    await websocket.accept()
    last = None
    while True:
        status = ORDERS.get(oid, {}).get("status")
        if status != last:                          # push only changes
            await websocket.send_json({"order_id": oid, "status": status})
            last = status
        if status in ("delivered", "cancelled", None):
            break
        await asyncio.sleep(0.05)                   # check again soon, without blocking the loop
    await websocket.close()</div>
  <p>The endpoint accepts the connection, then loops: whenever the stored status differs from the last one sent, it pushes it; it stops at a final status. <code>await asyncio.sleep(0.05)</code> keeps the loop free between checks. Here Asha's app connects while Dosa Hut's staff update the order through the normal PATCH endpoint (TestClient can drive WebSockets in-process):</p>
<div class="fx" data-lang="py"># ws_demo.py: Asha's app watches order 101 while Dosa Hut's staff update it
from fastapi.testclient import TestClient
from main import app

STAFF = {"X-Staff-Of": "10"}
with TestClient(app) as client:
    client.post("/v1/orders", headers={"X-Customer": "asha"},
                json={"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]})
    with client.websocket_connect("/ws/orders/101") as ws:     # one connection, stays open
        print("app got:", ws.receive_json())
        for new in ["preparing", "out_for_delivery", "delivered"]:
            client.patch("/v1/orders/101", headers=STAFF, json={"status": new})
            print("app got:", ws.receive_json())</div>
<div class="fx" data-lang="text">model loaded: eta-lr-1
app got: {'order_id': 101, 'status': 'placed'}
app got: {'order_id': 101, 'status': 'preparing'}
app got: {'order_id': 101, 'status': 'out_for_delivery'}
app got: {'order_id': 101, 'status': 'delivered'}
model released</div>
  <p>One connection, four pushed messages, each arriving right after the staff's PATCH. The first and last lines come from the lifespan (section 12).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>WebSocket</strong>: a protocol (<code>ws://</code>, <code>wss://</code>) giving a persistent, full-duplex message channel over one TCP connection, opened with an HTTP Upgrade request.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Each open WebSocket holds a connection for minutes; with several server copies, the PATCH may hit copy A while Asha's socket is on copy B, which never sees the change in its own memory. Real systems publish status changes through a shared channel (Redis pub/sub). Simpler alternatives: polling, or Server-Sent Events for one-way pushes.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: OpenAPI docs.</b> We now have eight HTTP endpoints and a WebSocket. The mobile team, the restaurant tablet team and a partner company all ask the same thing: "what exactly does each endpoint accept and return?"</div>

  <h2 id="fa-docs"><span class="num">10</span>OpenAPI Docs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Hand-written API documentation is always out of date: someone changes <code>qty</code>'s limit to 10 and forgets the wiki. Every fact a client needs (paths, methods, fields, types, limits, error shapes) is already in our type hints. Can the documentation come from the same place?</p>
  </div>
  <p><strong>OpenAPI</strong> is a standard JSON format that describes an API. FastAPI writes it from your hints at <code>/openapi.json</code> and serves two pages built on it: <code>/docs</code> (Swagger UI, where you can click "Try it out" on each endpoint) and <code>/redoc</code>.</p>
<div class="fx" data-lang="text">$ curl -s localhost:8000/docs | grep -o '&lt;title&gt;.*&lt;/title&gt;'
&lt;title&gt;Biteful Orders API - Swagger UI&lt;/title&gt;

$ curl -s localhost:8000/openapi.json   (summarised by a few lines of Python)
openapi 3.1.0 | {'title': 'Biteful Orders API', 'version': '1.0'}
  GET    /v1/restaurants          List Restaurants
  GET    /v1/restaurants/{rid}    Get Restaurant
  POST   /v1/orders               Create Order
  GET    /v1/orders/{oid}         Get Order
  PATCH  /v1/orders/{oid}         Update Status
  POST   /v1/eta                  Eta
  GET    /health                  Health
  GET    /ready                   Ready
  schemas: ['EtaIn', 'HTTPValidationError', 'OrderIn', 'OrderItem', 'OrderOut', 'StatusIn', 'ValidationError']
  OrderItem.qty: {'type': 'integer', 'maximum': 10.0, 'minimum': 1.0, 'title': 'Qty'}</div>
  <p>Every endpoint is listed with an auto-generated summary from the function name; every schema is there, including FastAPI's own <code>HTTPValidationError</code> (the 422 shape); and <code>OrderItem.qty</code> carries <code>minimum 1, maximum 10</code>, straight from <code>Field(ge=1, le=10)</code>. Change the limit in code and the docs change too. The spec also generates client libraries for the mobile apps and contract tests.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>OpenAPI specification</strong>: a machine-readable description of an HTTP API (paths, operations, parameters, request and response schemas). <strong>Swagger UI</strong>: an interactive page rendered from it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The docs page also tells attackers every endpoint. Hide internal routes with <code>include_in_schema=False</code>, and consider disabling <code>/docs</code> on public production deployments (<code>FastAPI(docs_url=None)</code>). And errors raised by hand (<code>HTTPException(409)</code>) are not documented unless you add <code>responses={409: ...}</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: error handling and middleware.</b> Validation errors become 422 automatically. But "already delivered" or "not your restaurant" are business rules, raised in our code, that need their own status codes and a consistent JSON shape. And Flask's hooks (timing on every request) need a FastAPI equivalent.</div>

  <h2 id="fa-err"><span class="num">11</span>Error Handling &amp; Middleware</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Dosa Hut's staff try to cancel order 101 after it was delivered. Biryani Bros' staff try to update Dosa Hut's order. A missing order must be 404. How do these business errors become the right status codes with consistent JSON, and where does code that wraps every request (like a timing header) go?</p>
  </div>
  <p>Three tools. <code>raise HTTPException(status, detail)</code> anywhere in an endpoint or dependency gives that status with <code>{"detail": ...}</code>. For your own exception classes, <code>@app.exception_handler(MyError)</code> maps them to a response, so domain code can <code>raise OrderConflict(...)</code> without knowing about HTTP. And <code>@app.middleware("http")</code> wraps every request: it gets the request, calls <code>call_next</code> to run the endpoint, and can edit the response on the way out (Flask's before/after hooks in one function).</p>
<div class="fx" data-lang="py"># ---------- middleware: wraps every request ----------
@app.middleware("http")
async def timing(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - t0) * 1000:.1f}"
    return response

# ---------- domain errors -&gt; status codes ----------
class OrderConflict(Exception):
    def __init__(self, order_id: int, detail: str):
        self.order_id, self.detail = order_id, detail

@app.exception_handler(OrderConflict)
async def order_conflict(request: Request, exc: OrderConflict):
    return JSONResponse(status_code=409, content={"error": "conflict", "order_id": exc.order_id,
                                                  "detail": exc.detail})

class ModelNotReady(Exception):
    pass

@app.exception_handler(ModelNotReady)
async def model_not_ready(request: Request, exc: ModelNotReady):
    return JSONResponse(status_code=503, content={"error": "model not loaded"})</div>
<div class="fx" data-lang="py">@app.patch("/v1/orders/{oid}", response_model=OrderOut)
def update_status(oid: int, change: StatusIn, staff_of: int = Depends(current_staff),
                  db: dict = Depends(get_db)):
    order = db["orders"].get(oid)
    if order is None:
        raise HTTPException(404, "order not found")
    if order["restaurant_id"] != staff_of:
        raise HTTPException(403, "not your restaurant's order")
    if order["status"] == "delivered":
        raise OrderConflict(oid, "already delivered")
    order["status"] = change.status
    return order</div>
<div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}]\\n' -X PATCH localhost:8000/v1/orders/101 -H 'X-Staff-Of: 11' -H 'Content-Type: application/json' -d '{"status": "delivered"}'
{"detail":"not your restaurant's order"} [403]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH localhost:8000/v1/orders/101 -H 'X-Staff-Of: 10' -H 'Content-Type: application/json' -d '{"status": "delivered"}'
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"delivered"} [200]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH localhost:8000/v1/orders/101 -H 'X-Staff-Of: 10' -H 'Content-Type: application/json' -d '{"status": "cancelled"}'
{"error":"conflict","order_id":101,"detail":"already delivered"} [409]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH localhost:8000/v1/orders/101 -H 'X-Staff-Of: 10' -H 'Content-Type: application/json' -d '{"status": "eaten"}'
{"detail":[{"type":"literal_error","loc":["body","status"],"msg":"Input should be 'preparing', 'out_for_delivery', 'delivered' or 'cancelled'","input":"eaten","ctx":{"expected":"'preparing', 'out_for_delivery', 'delivered' or 'cancelled'"}}]} [422]

$ curl -si localhost:8000/v1/orders/101 | grep -iE '^x-process|^\\{'
x-process-time-ms: 2.2
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"delivered"}</div>
  <p>Biryani Bros staff (11) → 403 from <code>HTTPException</code>; Dosa Hut staff → 200; cancelling a delivered order → our handler's 409 shape; <code>"eaten"</code> isn't in the <code>Literal</code> → automatic 422 listing the allowed values; and every response carried <code>x-process-time-ms</code> from the middleware.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Use it for</th><th>Biteful</th></tr>
    <tr><td>automatic 422</td><td>shape and limit errors</td><td><code>"eaten"</code>, <code>qty: 99</code></td></tr>
    <tr><td><code>raise HTTPException(...)</code></td><td>expected errors inside endpoints/deps</td><td>404 order, 403 other restaurant, 401 no header</td></tr>
    <tr><td><code>@app.exception_handler(MyError)</code></td><td>domain errors → status + JSON</td><td><code>OrderConflict</code> → 409, <code>ModelNotReady</code> → 503</td></tr>
    <tr><td><code>@app.middleware("http")</code></td><td>cross-cutting: timing, request ids, logging</td><td><code>X-Process-Time-ms</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Exception handler</strong>: a function that converts an exception type into a response. <strong>Middleware</strong>: code that runs around every request and response.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Catching all exceptions inside endpoints and returning 200 with an error message (monitoring sees success). Let unexpected exceptions become 500s, logged with a request id; handle expected ones explicitly.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: lifespan.</b> <code>/v1/eta</code> needs the delivery-time model. Loading it per request is slow, and loading it at import time makes tests and startup awkward. Where do expensive things go that must exist before the first request and be released at shutdown?</div>

  <h2 id="fa-ml"><span class="num">12</span>lifespan: Serving the ETA Model</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The ETA model (<code>eta.joblib</code>, trained in the <a class="xref" data-note="api_flask">Flask</a> note: minutes = 12.68 + 4.03 × km + 3.02 × items) must be loaded once, before traffic arrives, and released when the server stops. And the load balancer must not send traffic while it is still loading. Where does that code live?</p>
  </div>
  <p>FastAPI's place for "once at startup, once at shutdown" is the <strong>lifespan</strong> function: everything before <code>yield</code> runs when the server starts, everything after runs when it stops.</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <defs><marker id="fa-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <line x1="10" y1="55" x2="585" y2="55" stroke="currentColor" marker-end="url(#fa-ar2)"/>
    <rect x="15" y="30" width="130" height="50" rx="6" class="fv"/><text x="80" y="52" text-anchor="middle">startup</text><text x="80" y="69" text-anchor="middle" font-size="11">joblib.load once</text>
    <rect x="165" y="30" width="270" height="50" rx="6" class="fg sg"/><text x="300" y="52" text-anchor="middle">serve requests</text><text x="300" y="69" text-anchor="middle" font-size="11">/v1/orders  /v1/eta  /health  /ready</text>
    <rect x="455" y="30" width="125" height="50" rx="6" class="fs"/><text x="517" y="52" text-anchor="middle">shutdown</text><text x="517" y="69" text-anchor="middle" font-size="11">release</text>
    <text x="80" y="100" text-anchor="middle" font-size="11" class="tm">before yield</text><text x="517" y="100" text-anchor="middle" font-size="11" class="tm">after yield</text>
  </svg><figcaption>Time runs left to right across the server's life. Every request in the middle uses the model loaded once on the left.</figcaption></figure>
<div class="fx" data-lang="py"># ---------- lifespan: load the ETA model ONCE ----------
ML = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    ML["eta"] = joblib.load("eta.joblib")          # startup
    print("model loaded:", ML["eta"]["version"])
    yield
    ML.clear()                                     # shutdown
    print("model released")

app = FastAPI(title="Biteful Orders API", version="1.0", lifespan=lifespan)</div>
<div class="fx" data-lang="py">@app.post("/v1/eta")
def eta(x: EtaIn):
    if "eta" not in ML:
        raise ModelNotReady()
    bundle = ML["eta"]
    minutes = bundle["model"].predict([[x.distance_km, x.items]])[0]
    return {"eta_minutes": round(float(minutes), 1), "model": bundle["version"]}

@app.get("/health")
def health():
    return {"status": "ok"}                        # liveness: the process is up

@app.get("/ready")
def ready():
    if "eta" not in ML:
        raise ModelNotReady()
    return {"ready": True, "model": ML["eta"]["version"]}</div>
<div class="fx" data-lang="text">$ curl -s -X POST localhost:8000/v1/eta -H 'Content-Type: application/json' -d '{"distance_km": 3.2, "items": 2}'
{"eta_minutes":31.6,"model":"eta-lr-1"}
$ curl -s localhost:8000/ready
{"ready":true,"model":"eta-lr-1"}</div>
  <p>31.6 minutes, the same as Flask and the hand calculation (12.68 + 12.90 + 6.04). <code>EtaIn</code> rejects <code>distance_km: 0</code> or 50 before the model is touched. The server log of the whole run shows the lifespan bracketing every request:</p>
<div class="fx" data-lang="text">INFO:     Started server process [29431]
INFO:     Waiting for application startup.
model loaded: eta-lr-1
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     127.0.0.1:36312 - "GET /v1/restaurants?city=Pune&amp;min_rating=4 HTTP/1.1" 200 OK
   ... (16 more request lines) ...
INFO:     Shutting down
INFO:     Waiting for application shutdown.
model released
INFO:     Application shutdown complete.</div>
  <ul>
    <li><strong>/health</strong> (liveness) says the process is alive; <strong>/ready</strong> (readiness) says it can serve: model loaded, else 503. Load balancers send traffic only to ready copies (<a class="xref" data-note="api_production">Production</a>).</li>
    <li>Return the model version with predictions, so each answer is traceable.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>lifespan</strong>: an async context manager passed to <code>FastAPI(lifespan=...)</code>; code before <code>yield</code> runs at startup, after <code>yield</code> at shutdown.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The old <code>@app.on_event("startup")</code> is deprecated; use lifespan. Each uvicorn worker process runs its own lifespan, so 4 workers = 4 model copies in RAM.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: testing.</b> Validation, dependencies, background email, WebSocket pushes, error handlers, the model. How do we check all of it automatically, including paths that need a fake customer or a missing model?</div>

  <h2 id="fa-test"><span class="num">13</span>Testing with TestClient</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want tests for: Asha's order and its receipt, the every-error 422, staff rules (403/200/409), the 503 before the model loads, the WebSocket pushes, and an order without a customer header (by replacing the customer check). How, without starting uvicorn?</p>
  </div>
  <p><code>TestClient</code> (from Starlette, built on httpx) calls the app in-process, like Flask's test client. Two FastAPI-specific points: the lifespan runs only inside <code>with TestClient(app) as client</code>, and <code>app.dependency_overrides[dep] = fake</code> replaces a dependency everywhere it is used, the payoff of section 06.</p>
<div class="fx" data-lang="py"># test_main.py: run with  pytest -q test_main.py
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from main import app, ORDERS, NEXT_ID, current_customer

ASHA = {"X-Customer": "asha"}
DOSAS = {"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]}

@pytest.fixture(autouse=True)
def fresh_orders():
    ORDERS.clear(); NEXT_ID[0] = 101          # every test starts with no orders

def test_asha_order_and_receipt():
    Path("receipts.log").unlink(missing_ok=True)
    with TestClient(app) as client:            # 'with' runs the lifespan (loads the model)
        r = client.post("/v1/orders", json=DOSAS, headers=ASHA)
        assert r.status_code == 201
        assert r.json() == {"order_id": 101, "restaurant_id": 10, "total": 240, "status": "placed",
                            "items": [{"name": "Masala Dosa", "qty": 2}]}   # no customer_phone
    assert "order 101 -&gt; asha: Rs 240" in Path("receipts.log").read_text()   # background task ran

def test_every_error_listed_at_once():
    with TestClient(app) as client:
        bad = {"restaurant_id": 10, "items": [{"name": "Idli", "qty": "two"}, {"name": "Idli", "qty": 99}]}
        r = client.post("/v1/orders", json=bad, headers=ASHA)
        assert r.status_code == 422
        assert [e["loc"] for e in r.json()["detail"]] == [["body", "items", 0, "qty"],
                                                          ["body", "items", 1, "qty"]]

def test_staff_rules():
    with TestClient(app) as client:
        client.post("/v1/orders", json=DOSAS, headers=ASHA)
        assert client.patch("/v1/orders/101", json={"status": "delivered"},
                            headers={"X-Staff-Of": "11"}).status_code == 403
        assert client.patch("/v1/orders/101", json={"status": "delivered"},
                            headers={"X-Staff-Of": "10"}).status_code == 200
        assert client.patch("/v1/orders/101", json={"status": "cancelled"},
                            headers={"X-Staff-Of": "10"}).status_code == 409

def test_eta_needs_lifespan():
    client = TestClient(app)                   # no 'with': lifespan never ran, no model
    assert client.post("/v1/eta", json={"distance_km": 3.2, "items": 2}).status_code == 503
    with TestClient(app) as client:
        assert client.post("/v1/eta", json={"distance_km": 3.2, "items": 2}).json()["eta_minutes"] == 31.6

def test_override_customer_dependency():
    app.dependency_overrides[current_customer] = lambda: "test-user"   # swap a dependency
    with TestClient(app) as client:
        assert client.post("/v1/orders", json=DOSAS).status_code == 201  # no header needed
    app.dependency_overrides.clear()

def test_websocket_pushes_status():
    with TestClient(app) as client:
        client.post("/v1/orders", json=DOSAS, headers=ASHA)
        with client.websocket_connect("/ws/orders/101") as ws:
            assert ws.receive_json()["status"] == "placed"
            client.patch("/v1/orders/101", json={"status": "delivered"}, headers={"X-Staff-Of": "10"})
            assert ws.receive_json()["status"] == "delivered"</div>
<div class="fx" data-lang="text">$ pytest -q test_main.py</div>
<div class="fx" data-lang="text">......                                                                   [100%]
(warnings summary: one DeprecationWarning from inside starlette/testclient.py, not from our code)
6 passed, 1 warning in 6.12s</div>
  <ul>
    <li><code>test_asha_order_and_receipt</code>: TestClient runs background tasks before returning, so the receipt line is already in the log; the body equals exactly the five <code>OrderOut</code> fields.</li>
    <li><code>test_eta_needs_lifespan</code>: without <code>with</code>, no lifespan, no model → 503; with it → 31.6.</li>
    <li><code>test_override_customer_dependency</code>: the fake returns "test-user", so no header is needed. Clear overrides afterwards.</li>
    <li>An autouse fixture resets <code>ORDERS</code> so every test starts at order 101.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>TestClient</strong>: an in-process HTTP and WebSocket client for ASGI apps. <strong><code>dependency_overrides</code></strong>: a dict on the app mapping a dependency to a replacement for tests.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>TestClient(app)</code> without <code>with</code> silently skips startup, so tests fail with a missing model (we used that on purpose to test the 503). And forgetting <code>dependency_overrides.clear()</code> leaks a fake user into later tests.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects,</b> then <a class="xref" data-note="api_auth">Authentication &amp; Security</a>, because <code>X-Customer: asha</code> can be sent by anyone.</div>

  <h2 id="fa-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Twelve features. In what order does Asha's one <code>POST /v1/orders</code> meet them, and which feature is built from which?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 270" width="680">
    <defs><marker id="fa-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="8" width="150" height="38" rx="6" class="fv"/><text x="85" y="25" text-anchor="middle" font-size="11">lifespan (startup)</text><text x="85" y="39" text-anchor="middle" font-size="10" class="tm">model loaded once</text>
    <rect x="190" y="8" width="150" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="265" y="25" text-anchor="middle" font-size="11">uvicorn → middleware</text><text x="265" y="39" text-anchor="middle" font-size="10" class="tm">timer starts</text>
    <line x1="340" y1="27" x2="368" y2="27" stroke="currentColor" marker-end="url(#fa-c0)"/>
    <rect x="370" y="8" width="300" height="38" rx="6" class="ft st"/><text x="520" y="25" text-anchor="middle" font-size="11">parameters from type hints</text><text x="520" y="39" text-anchor="middle" font-size="10" class="tm">path · query · header · body (Pydantic) → 422 with all errors</text>
    <line x1="520" y1="46" x2="520" y2="70" stroke="currentColor" marker-end="url(#fa-c0)"/>
    <rect x="370" y="72" width="300" height="38" rx="6" class="ft st"/><text x="520" y="89" text-anchor="middle" font-size="11">dependencies (Depends)</text><text x="520" y="103" text-anchor="middle" font-size="10" class="tm">current_customer → 401 · get_db opens</text>
    <line x1="520" y1="110" x2="520" y2="134" stroke="currentColor" marker-end="url(#fa-c0)"/>
    <rect x="370" y="136" width="300" height="38" rx="6" class="fg sg"/><text x="520" y="153" text-anchor="middle" font-size="11">endpoint (def → threadpool / async def → loop)</text><text x="520" y="167" text-anchor="middle" font-size="10" class="tm">menu rules · HTTPException · domain exceptions</text>
    <line x1="370" y1="155" x2="342" y2="155" stroke="currentColor" marker-end="url(#fa-c0)"/>
    <rect x="190" y="136" width="150" height="38" rx="6" class="fr sr"/><text x="265" y="153" text-anchor="middle" font-size="11">exception handlers</text><text x="265" y="167" text-anchor="middle" font-size="10" class="tm">409, 503</text>
    <line x1="520" y1="174" x2="520" y2="198" stroke="currentColor" marker-end="url(#fa-c0)"/>
    <rect x="370" y="200" width="300" height="38" rx="6" class="fb sb"/><text x="520" y="217" text-anchor="middle" font-size="11">response_model filters → JSON 201</text><text x="520" y="231" text-anchor="middle" font-size="10" class="tm">middleware adds X-Process-Time-ms</text>
    <line x1="370" y1="219" x2="342" y2="219" stroke="currentColor" marker-end="url(#fa-c0)"/>
    <rect x="190" y="200" width="150" height="38" rx="6" class="fv"/><text x="265" y="217" text-anchor="middle" font-size="11">background task</text><text x="265" y="231" text-anchor="middle" font-size="10" class="tm">receipt after response</text>
    <rect x="10" y="72" width="150" height="102" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="100" text-anchor="middle" font-size="11">same hints →</text><text x="85" y="118" text-anchor="middle" font-size="11">OpenAPI /docs</text><text x="85" y="146" text-anchor="middle" font-size="10" class="tm">TestClient drives</text><text x="85" y="160" text-anchor="middle" font-size="10" class="tm">all of it in-process</text>
    <rect x="10" y="200" width="150" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="217" text-anchor="middle" font-size="11">WebSocket</text><text x="85" y="231" text-anchor="middle" font-size="10" class="tm">pushes status changes</text>
    <text x="340" y="262" text-anchor="middle" font-size="10" class="tm">get_db closes after the endpoint (yield cleanup)</text>
  </svg><figcaption>Right column: one request top to bottom. Type hints feed validation, dependencies and the response filter; the same hints produce the docs (left). Errors detour through handlers; the background task runs after the response.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On Biteful</th><th>When to use</th></tr>
    <tr><td>Type hints</td><td>Python annotations</td><td>how does code state a type?</td><td><code>line_total("120", 2)</code> = "120120" (ignored by Python)</td><td>every signature</td></tr>
    <tr><td>Pydantic model</td><td>hints + Field limits</td><td>check a whole JSON shape?</td><td>"2" → 2; 2 errors at once</td><td>every body</td></tr>
    <tr><td>Parameters</td><td>name/type rules</td><td>where does each input come from?</td><td><code>?min_rating=high</code> → 422</td><td>every endpoint</td></tr>
    <tr><td>response_model</td><td>an Out model</td><td>what may leave?</td><td>phone and payment ref dropped</td><td>every endpoint returning data</td></tr>
    <tr><td>Depends</td><td>functions + yield</td><td>shared setup and cleanup?</td><td>11 → 404, no header → 401; session closed</td><td>auth, DB, settings</td></tr>
    <tr><td>async def</td><td>asyncio event loop</td><td>many waits in one process?</td><td>1.02 s vs 10.06 s (blocking) vs 1.04 s (def)</td><td>awaitable I/O only</td></tr>
    <tr><td>BackgroundTasks</td><td>post-response hook</td><td>answer first, work after?</td><td>201 in 0.003 s, receipt 1 s later</td><td>small, losable work</td></tr>
    <tr><td>WebSocket</td><td>Starlette + async</td><td>can the server push?</td><td>4 status messages</td><td>live updates, streaming</td></tr>
    <tr><td>OpenAPI</td><td>the same hints</td><td>where are the docs?</td><td>8 operations; qty 1–10</td><td>always (hide internals)</td></tr>
    <tr><td>Errors, middleware</td><td>HTTPException, handlers</td><td>business errors → codes?</td><td>403, 409, timing header</td><td>every API</td></tr>
    <tr><td>lifespan</td><td>async context manager</td><td>load once, release at end?</td><td>model loaded / released; 31.6 min</td><td>models, pools</td></tr>
    <tr><td>TestClient</td><td>httpx in-process</td><td>does it all work?</td><td>6 passed</td><td>always</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>In FastAPI the function signature is the contract: type hints and Pydantic models become validation, documentation and output filtering, <code>Depends</code> turns shared setup into reusable pieces, and <code>async</code> lets one process wait on many things, as long as nothing blocks the loop.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="api_auth">Authentication &amp; Security</a>: real identity in the same <code>Depends</code> slots.</div>

  <h2 id="fa-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Biteful orders API (<code>uvicorn main:app --port 8000</code>). Asha's order 101 = 2 × Masala Dosa ₹120 = ₹240 at Dosa Hut (10); staff headers <code>X-Staff-Of: 10</code> / <code>11</code>; receipt email 1 s; ETA = 12.68 + 4.03 × km + 3.02 × items → 31.6 min for 3.2 km, 2 items.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Why FastAPI</td><td>why leave Flask?</td><td>12/23 check lines; 3.02 s</td><td>need machine-readable types → hints</td></tr>
    <tr><td>Type hints</td><td>how to state types?</td><td>"120120"; <code>__annotations__</code></td><td>single values only → Pydantic</td></tr>
    <tr><td>Pydantic</td><td>check a JSON shape?</td><td>2 errors at once</td><td>which input is which? → parameters</td></tr>
    <tr><td>Parameters</td><td>path, query, body, header?</td><td>min_rating=high → 422</td><td>output leaks → response models</td></tr>
    <tr><td>response_model</td><td>what leaves?</td><td>3 of 5 fields</td><td>repeated setup → Depends</td></tr>
    <tr><td>Depends</td><td>shared setup/cleanup?</td><td>trace: 200 / 404 / 401</td><td>waiting blocks → async</td></tr>
    <tr><td>async def</td><td>many waits at once?</td><td>1.02 / 10.06 / 1.04 s</td><td>Asha still waits → background</td></tr>
    <tr><td>BackgroundTasks</td><td>answer first?</td><td>0.003 s, receipt later</td><td>no push → WebSocket</td></tr>
    <tr><td>WebSocket</td><td>server push?</td><td>placed … delivered</td><td>others need docs → OpenAPI</td></tr>
    <tr><td>OpenAPI</td><td>docs?</td><td>8 operations, qty 1–10</td><td>business errors → handlers</td></tr>
    <tr><td>Errors, middleware</td><td>domain errors, wrapping?</td><td>403, 409, timing</td><td>model loading → lifespan</td></tr>
    <tr><td>lifespan</td><td>load once?</td><td>loaded/released; /ready</td><td>verify → TestClient</td></tr>
    <tr><td>TestClient</td><td>test it all?</td><td>6 passed</td><td>fake identity → <a class="xref" data-note="api_auth">Auth</a></td></tr>
  </table>
  <h3>API cheat sheet</h3>
  <table class="tbl">
    <tr><th>Need</th><th>Write</th></tr>
    <tr><td>path / query param</td><td><code>@app.get("/x/{rid}") def f(rid: int, q: str | None = None)</code></td></tr>
    <tr><td>limits</td><td><code>Annotated[float, Query(ge=0, le=5)]</code>; <code>Field(ge=1, le=10)</code></td></tr>
    <tr><td>header</td><td><code>x_customer: Annotated[str | None, Header()] = None</code></td></tr>
    <tr><td>body</td><td><code>order: OrderIn</code> (a <code>BaseModel</code>)</td></tr>
    <tr><td>output filter + status</td><td><code>@app.post(..., response_model=OrderOut, status_code=201)</code></td></tr>
    <tr><td>dependency</td><td><code>user = Depends(current_customer)</code>; <code>yield</code> for cleanup</td></tr>
    <tr><td>errors</td><td><code>raise HTTPException(404, "...")</code>; <code>@app.exception_handler(E)</code></td></tr>
    <tr><td>wrap all requests</td><td><code>@app.middleware("http") async def m(request, call_next)</code></td></tr>
    <tr><td>after response</td><td><code>bg: BackgroundTasks</code>; <code>bg.add_task(fn, *args)</code></td></tr>
    <tr><td>push</td><td><code>@app.websocket("/ws/...")</code>; <code>accept</code>, <code>send_json</code>, <code>close</code></td></tr>
    <tr><td>startup/shutdown</td><td><code>@asynccontextmanager async def lifespan(app): ...; yield; ...</code></td></tr>
    <tr><td>tests</td><td><code>with TestClient(app) as c</code>; <code>app.dependency_overrides[dep] = fake</code></td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>Separate In/Out models; <code>Field</code> limits; dependencies for auth and DB; <code>def</code> for blocking or CPU work; <code>async def</code> only with awaitable libraries; lifespan for models; <code>/health</code> + <code>/ready</code>.</p></div>
    <div><b>Avoid</b><p>Blocking calls in <code>async def</code>; returning DB rows without <code>response_model</code>; BackgroundTasks for work that must not be lost; <code>on_event</code>; <code>TestClient</code> without <code>with</code> when lifespan matters.</p></div>
  </div>
  <h3>Traps</h3>
  <ul>
    <li>Python ignores hints; only FastAPI/Pydantic act on them.</li>
    <li>Schemas check shape, not business rules (menu membership stays in code).</li>
    <li><code>time.sleep</code> in async def: 10 requests → 10 s.</li>
    <li>Background tasks die with the process.</li>
    <li>Each worker runs its own lifespan: N workers = N model copies.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li><code>GET /v1/restaurants/abc</code> with <code>rid: int</code>: status? <em>422, <code>loc: ["path","rid"]</code> (Flask gave 404).</em></li>
    <li>An argument <code>order: OrderIn</code>: where is it read from? <em>The JSON body.</em></li>
    <li>In the DI trace, does <code>get_db</code> close when <code>order_for_staff</code> raises 404? <em>Yes, cleanup after <code>yield</code> runs anyway.</em></li>
    <li>10 concurrent requests to <code>async def</code> doing <code>await asyncio.sleep(1)</code>, one process: time? <em>About 1 s (measured 1.02 s).</em></li>
    <li>What does <code>with TestClient(app)</code> do that <code>TestClient(app)</code> doesn't? <em>Runs the lifespan startup and shutdown (loads the model).</em></li>
  </ol>

  <h2 id="fa-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is FastAPI faster to build with than Flask for JSON APIs?</summary><div class="qa-body">Type hints do the work: parsing, validation with 422 errors listing every problem, response filtering and OpenAPI docs come free. Our order endpoint went from 12 check lines to 5 lines of business rules. Plus native async for I/O-heavy services.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>10 concurrent requests to <code>async def</code> with <code>time.sleep(1)</code>, one uvicorn worker. Time?</summary><div class="qa-body">About 10 s (measured 10.06 s). <code>time.sleep</code> blocks the only event-loop thread, so requests run one by one. With <code>await asyncio.sleep(1)</code> or a plain <code>def</code>, about 1 s (1.02 s, 1.04 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should an endpoint be <code>def</code> rather than <code>async def</code>?</summary><div class="qa-body">When it calls blocking libraries (requests, psycopg2, smtplib, most <code>model.predict</code> calls). FastAPI runs <code>def</code> endpoints in a threadpool. Use <code>async def</code> only when every slow call inside is awaited.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a FastAPI 422 contain?</summary><div class="qa-body">A <code>detail</code> list with one entry per failure: <code>type</code>, <code>loc</code> (e.g. <code>["body","items",1,"qty"]</code>), <code>msg</code>, the offending <code>input</code>, and sometimes <code>ctx</code> (e.g. <code>{"le": 10}</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you load a 2 GB model so it isn't reloaded per request?</summary><div class="qa-body">In <code>lifespan</code> before <code>yield</code>, stored on <code>app.state</code> or a module dict; add <code>/ready</code> returning 503 until loaded. Each worker process loads its own copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dependency injection in FastAPI? Give two uses.</summary><div class="qa-body"><code>param = Depends(fn)</code> makes FastAPI call <code>fn</code> (resolving its own dependencies) and pass the result. Uses: a DB session opened/closed per request with <code>yield</code>; the current user or staff member from a header or token; settings; pagination parameters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test an endpoint protected by auth without real credentials?</summary><div class="qa-body"><code>app.dependency_overrides[current_customer] = lambda: "test-user"</code>, run with <code>TestClient</code>, then <code>app.dependency_overrides.clear()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>response_model</code> do?</summary><div class="qa-body">Validates and serializes the return value against a schema, drops extra fields (we hid <code>customer_phone</code> and <code>payment_ref</code>), and documents the response in OpenAPI.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>BackgroundTasks or Celery for the receipt email? For a nightly re-scoring job?</summary><div class="qa-body">BackgroundTasks only if losing an email on a crash is acceptable; receipts usually aren't, so a queue (Celery) with retries is better. The nightly job: always a queue or scheduler, on separate workers with status and retries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why have both /health and /ready?</summary><div class="qa-body">Liveness: is the process alive (restart if not)? Readiness: can it serve now (model loaded, DB reachable)? If not, stop sending traffic but don't restart. Mixing them causes restart loops during slow model loads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do OpenAPI docs stay correct in FastAPI but drift in Flask?</summary><div class="qa-body">In FastAPI the docs, the validation and the output filter are all generated from the same type hints and models, so changing <code>Field(le=10)</code> changes all three. In Flask the checks are imperative code and the docs are separate text; nothing ties them together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does dependency injection make testing and the auth note easier?</summary><div class="qa-body">Endpoints only declare "I need the current customer". Tests swap that one dependency with <code>dependency_overrides</code>; the auth note replaces the naive header check with JWT verification in the same function, and no endpoint changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: async endpoints and background tasks both "help with the slow email". What does each actually fix?</summary><div class="qa-body">Async lets one process <em>wait</em> for many emails at once (throughput: 10 orders in 1.02 s), but each customer still waits 1 s. A background task removes the wait from the customer's response (201 in 0.003 s), but the work still runs in the web process. A task queue (Production) moves it out of the process entirely.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the response model but keep Pydantic input models?</summary><div class="qa-body">Input is safe but output isn't: every key in the stored row is sent, including internal or personal fields. That is OWASP's "broken property-level authorization" (Auth note). Input and output need separate models.</div></details>
</main>
`
});
