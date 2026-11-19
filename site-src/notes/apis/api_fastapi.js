// notes/apis/api_fastapi.js — FastAPI
Object.assign(TOPIC_CONTENT, {
  "api_fastapi": `<main>
  <h1>FastAPI</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>FastAPI</span></div>
  <p class="lead">FastAPI is a Python library for building web APIs: programs that wait for requests from apps and other programs, and answer them with data, usually JSON. It has become the usual choice for serving machine-learning models and for most new Python backends, because you describe each endpoint with ordinary Python type hints and FastAPI turns those hints into input checking, clear error messages, output filtering and a documentation page, while also letting one process wait on many slow things at once. To see why that matters, this page starts from where the <a class="xref" data-note="api_flask">Flask</a> note ended and rebuilds the same Biteful food-ordering API one idea at a time. The running example never changes: Asha orders two Masala Dosas (₹240) from Dosa Hut, restaurant 10, which becomes order 101; Dosa Hut's staff update the order's status; a receipt email takes a slow second to send; and a small delivery-time model predicts 31.6 minutes for a 3.2 km trip with 2 items. Every new idea is added to code you have already seen, and every output on this page was produced by really running the code (FastAPI 0.165, Pydantic 2.14, uvicorn 0.54).</p>

  <h2 id="fa-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">FastAPI</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why FastAPI</div>
        <ul>
          <li>Flask: checks written by hand, one error at a time</li>
          <li>FastAPI: type hints become checks, errors, docs</li>
          <li>Stack: uvicorn (server) → Starlette → FastAPI → Pydantic</li>
          <li>ASGI lets one process keep many requests open</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data in and out</div>
        <ul>
          <li><b>Pydantic model</b>: a class describing a JSON shape</li>
          <li>Path, query, body, header chosen from name and type</li>
          <li>Bad input → <b>422</b> listing every error</li>
          <li><b>response_model</b> sends only listed fields</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Structure</div>
        <ul>
          <li><b>Depends</b>: shared setup handed to endpoints</li>
          <li><code>yield</code> dependency = setup, then cleanup</li>
          <li>Exception handlers and middleware wrap requests</li>
          <li><b>lifespan</b>: load the model once at startup</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Waiting well</div>
        <ul>
          <li><code>async def</code> + <code>await</code>: many waits on one thread</li>
          <li>Blocking call in <code>async def</code> freezes everyone</li>
          <li>Plain <code>def</code> runs in a threadpool</li>
          <li>BackgroundTasks: answer first, work after</li>
          <li>WebSocket: server pushes updates</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="fa-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why FastAPI Exists</span><span class="rm-sub">hand-written checks in Flask, and a first FastAPI app</span></div></div>
      <div class="rm-item rm-done" data-target="fa-pyd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Type Hints and Pydantic Models</span><span class="rm-sub">describing the shape of the data once</span></div></div>
      <div class="rm-item rm-done" data-target="fa-params"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Path, Query, Body and Header Parameters</span><span class="rm-sub">where each piece of input comes from</span></div></div>
      <div class="rm-item rm-done" data-target="fa-resp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Response Models</span><span class="rm-sub">controlling what leaves the server</span></div></div>
      <div class="rm-item rm-done" data-target="fa-di"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Dependency Injection</span><span class="rm-sub">sharing setup like "who is calling" and "open the database"</span></div></div>
      <div class="rm-item rm-done" data-target="fa-async"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">async Endpoints</span><span class="rm-sub">waiting for many things at once, and the blocking trap</span></div></div>
      <div class="rm-item rm-done" data-target="fa-bg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Background Tasks</span><span class="rm-sub">answer first, send the email after</span></div></div>
      <div class="rm-item rm-done" data-target="fa-ws"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">WebSockets</span><span class="rm-sub">the server pushing live order status</span></div></div>
      <div class="rm-item rm-done" data-target="fa-docs"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">OpenAPI and Swagger Docs</span><span class="rm-sub">documentation generated from the same code</span></div></div>
      <div class="rm-item rm-done" data-target="fa-err"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Error Handling and Middleware</span><span class="rm-sub">business errors to status codes, code around every request</span></div></div>
      <div class="rm-item rm-done" data-target="fa-ml"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">lifespan: Loading a Model Once</span><span class="rm-sub">startup and shutdown code, health and ready checks</span></div></div>
      <div class="rm-item rm-done" data-target="fa-test"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Testing with TestClient</span><span class="rm-sub">testing everything without starting a server</span></div></div>
      <div class="rm-item rm-done" data-target="fa-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">one model for both directions, Depends(), required queries</span></div></div>
      <div class="rm-item rm-done" data-target="fa-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, syntax, async rules</span></div></div>
      <div class="rm-item rm-done" data-target="fa-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on FastAPI</span></div></div>
    </div>
  </div>

  <h2 id="fa-why"><span class="num">01</span>Why FastAPI Exists</h2>
  <p>In the Flask note we built Biteful's <code>POST /v1/orders</code> endpoint, the URL Asha's app calls to place an order. An app sends the order as a JSON <strong>body</strong> (the data carried inside a request, sometimes called the payload), and before the server can trust it, it has to check every part: is <code>restaurant_id</code> a whole number, is <code>items</code> a list, is each quantity between 1 and 10? Flask gives you the raw JSON and leaves all of that to you. Here is what the checks look like when written by hand, and what happens when Asha's buggy app sends an order with two different mistakes in it:</p>
  <div class="fx" data-lang="py"># flask_checks.py: the Flask way, every check written by hand
from flask import Flask, request

app = Flask(__name__)

@app.post("/v1/orders")
def create_order():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return {"error": "body must be a JSON object"}, 400
    if not isinstance(body.get("restaurant_id"), int):
        return {"error": "restaurant_id must be an integer"}, 422
    items = body.get("items")
    if not isinstance(items, list) or not 1 &lt;= len(items) &lt;= 20:
        return {"error": "items must be a list of 1 to 20 entries"}, 422
    for i, it in enumerate(items):
        if not isinstance(it.get("name"), str):
            return {"error": f"items[{i}].name must be text"}, 422
        if not isinstance(it.get("qty"), int) or not 1 &lt;= it["qty"] &lt;= 10:
            return {"error": f"items[{i}].qty must be a whole number from 1 to 10"}, 422
    return {"status": "placed"}, 201

bad = {"restaurant_id": 10, "items": [{"name": "Idli", "qty": "two"}, {"name": "Idli", "qty": 99}]}
r = app.test_client().post("/v1/orders", json=bad)
print(r.status_code, r.get_json())</div>
  <div class="fx" data-lang="text">422 {'error': 'items[0].qty must be a whole number from 1 to 10'}</div>
  <p>Two things are wrong with this. First, more than half of the function is checking code, and every endpoint in the API needs its own copy of the same kind of checks, so a thirty-endpoint API carries hundreds of lines of it. Second, the app sent two mistakes (<code>"two"</code> is not a number, and 99 is more than 10) but the server only reported the first one, because each check returns as soon as it fails. The app developer fixes that, sends again, and only then learns about the second problem. And there is a third, quieter problem the output cannot show: nobody outside the team knows what this endpoint accepts unless someone writes documentation by hand and remembers to keep it up to date.</p>
  <p>Look at what those checks are really saying: "restaurant_id is an int", "items is a list of 1 to 20 objects", "qty is a whole number from 1 to 10". That is a <em>description of a shape</em>, written out as if-statements. The idea behind <strong>FastAPI</strong> is that you should write the description once, as Python types, and let the library produce the checking, the error messages and the documentation from it. Think of the difference between a clerk who has to remember every rule for a form and a printed form whose boxes say "Age (number, 18 to 99)": the printed labels are the single source of truth, and a machine can check every box at once.</p>
  <p>Before writing any FastAPI code, it helps to know the few pieces that make a web API run, because FastAPI is one layer in a small stack. A <strong>server</strong> is simply a program that keeps running and waits for requests. It runs as a <strong>process</strong>, which is the operating system's name for one running program with its own memory (see <a class="xref" data-note="cf_os">Operating Systems</a>). Requests arrive over the network at a <strong>host</strong> (a machine, identified by a name or IP address) and a <strong>port</strong> (a number from 0 to 65535 that says which program on that machine should receive the request, like a flat number in a building). <code>localhost</code>, also written <code>127.0.0.1</code>, is the special host name that means "this same machine", which is what we use when testing. (<a class="xref" data-note="cf_networking">Networking</a> explains hosts, ports and TCP properly.)</p>
  <p>In the FastAPI world the server program is usually <strong>uvicorn</strong>. It opens the port, reads raw HTTP from the network, and hands each request to your application. The rules for that hand-over are a standard called <strong>ASGI</strong> (Asynchronous Server Gateway Interface). Flask uses an older standard, WSGI, in which each request occupies one thread from start to finish; ASGI was designed so that one process can keep many requests open at the same time while each of them is waiting for something, which matters a great deal later in this note. On the application side, FastAPI is built on top of <strong>Starlette</strong>, a smaller library that does the routing (matching URLs to functions), WebSockets and async support, and it uses <strong>Pydantic</strong> to do the actual checking of data. Your code talks to FastAPI; FastAPI uses Starlette and Pydantic underneath; uvicorn runs the whole thing.</p>
  <p>Here is the smallest useful FastAPI app. It has one endpoint, and notice the only unusual thing about it: the parameter <code>rid</code> has a type hint, <code>int</code>.</p>
  <div class="fx" data-lang="py"># hello.py: the smallest FastAPI app
from fastapi import FastAPI

app = FastAPI()

@app.get("/v1/restaurants/{rid}")
def get_restaurant(rid: int):
    return {"id": rid, "name": "Dosa Hut"}</div>
  <p>The line <code>app = FastAPI()</code> creates the application object, and <code>@app.get("/v1/restaurants/{rid}")</code> is a <strong>decorator</strong> that registers the function below it as the handler for GET requests to that URL; <code>{rid}</code> marks a part of the URL that varies. A function registered like this is called an <strong>endpoint</strong> (or path operation). The function returns a plain dict, and FastAPI converts it to JSON. To run it, we start uvicorn and tell it where the app object lives: <code>uvicorn hello:app --port 18302</code> means "import <code>hello.py</code>, use the variable <code>app</code>, listen on port 18302" (8000 is the usual default; any free port works). With the server running in one terminal, we send two requests from another using <code>curl</code>, a command-line tool that makes HTTP requests:</p>
  <div class="fx" data-lang="text">$ curl -s localhost:18302/v1/restaurants/10
{"id":10,"name":"Dosa Hut"}
$ curl -s -w ' [%{http_code}]\\n' localhost:18302/v1/restaurants/abc
{"detail":[{"type":"int_parsing","loc":["path","rid"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"abc"}]} [422]</div>
  <p>The first request returned the JSON for restaurant 10. The second asked for restaurant <code>abc</code>, and we wrote no checking code at all, yet FastAPI refused it with status 422 ("Unprocessable Content", the code for "I understood your request but the data in it is invalid"; status codes are covered in <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a>). The error says exactly where the problem is, <code>"loc":["path","rid"]</code>, what was wrong, and what the input was. That one type hint did the work of a hand-written check. This is the server's own log for the same run, which shows uvicorn starting, serving the two requests, and stopping when we pressed Ctrl+C:</p>
  <div class="fx" data-lang="text">INFO:     Started server process [3724]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:18302 (Press CTRL+C to quit)
INFO:     127.0.0.1:58800 - "GET /v1/restaurants/10 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58802 - "GET /v1/restaurants/abc HTTP/1.1" 422 Unprocessable Content
INFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [3724]</div>
  <p>One common misunderstanding is worth clearing up now. The "fast" in FastAPI refers mostly to how fast you can build an API, and to how efficiently it can handle many requests that are <em>waiting</em> on something (an email service, a database, another API). It does not make your own calculations faster: a model that takes 200 milliseconds to make a prediction takes 200 milliseconds in Flask, FastAPI or anything else.</p>

  <h2 id="fa-pyd"><span class="num">02</span>Type Hints and Pydantic Models</h2>
  <p>FastAPI's whole approach rests on type hints, so we need to understand exactly what a type hint is and what it is not. A <strong>type hint</strong> (also called an annotation) is a note written after a name that says what type of value it is supposed to hold: <code>price: int</code> for a parameter, <code>-&gt; int</code> for what a function returns. The surprising part is what Python itself does with them. Predict the second line of output before you read it:</p>
  <div class="fx" data-lang="py">def line_total(price: int, qty: int) -&gt; int:
    return price * qty

print(line_total(120, 2))          # what we meant
print(line_total("120", 2))        # Python ignores the hints: a string repeated twice
print(line_total.__annotations__)  # ...but it keeps them where a library can read them</div>
  <div class="fx" data-lang="text">240
120120
{'price': &lt;class 'int'&gt;, 'qty': &lt;class 'int'&gt;, 'return': &lt;class 'int'&gt;}</div>
  <p>Python ignored the hints completely. <code>"120" * 2</code> is string repetition, so the "total" became <code>'120120'</code>, exactly the kind of bug that would end up on Asha's bill. But the hints were not thrown away: the last line shows that Python stored them in the function's <code>__annotations__</code> as real Python objects. That is the door FastAPI uses. Python prints the labels on the form; it takes a separate program, reading those labels, to actually check the boxes. When you write <code>def get_restaurant(rid: int)</code>, FastAPI reads <code>rid: int</code> before calling your function, converts the text from the URL into an int, and refuses the request if it cannot. Inside your own plain helper functions, nothing changes: <code>"120"</code> still gets through.</p>
  <p>A hint like <code>qty: int</code> describes a single value. Asha's order is a whole nested JSON document: an object with a restaurant id, a list of items where each item has a name and a quantity, and an optional note. Each part has limits (1 to 10 of each dish, at most 20 lines, a note under 200 characters). We need a way to describe the whole shape, limits included, in one place. A description of the shape of some data is called a <strong>schema</strong>, and in Pydantic a schema is written as a class that inherits from <code>BaseModel</code>, with one type-hinted attribute per field. Such a class is called a <strong>Pydantic model</strong> (nothing to do with machine-learning models; it is a "model" of the data's shape).</p>
  <p>If you have read <a class="xref" data-note="py_classes">Classes &amp; Objects</a>, think of it as a class whose <code>__init__</code> is written for you: when you create an object from it, Pydantic checks every field against its type and limits, converts values where that is safe, and either gives you a fully valid object or raises one error describing <em>everything</em> that was wrong. <code>Field(...)</code> adds limits to a field, a model can contain lists of other models, and <code>@field_validator</code> lets you run your own function on a field:</p>
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
    def tidy(cls, v: str) -&gt; str:                 # your own rule for one field
        return v.strip()

# 1) Asha's order, sent with strings where numbers belong
o = OrderIn.model_validate({"restaurant_id": "10", "items": [{"name": "Masala Dosa", "qty": "2"}],
                            "note": "  extra chutney "})
print(repr(o))
print(o.items[0].qty + 1)                         # a real int now, so maths works
print(o.model_dump())

# 2) the order Flask reported one mistake at a time
try:
    OrderIn.model_validate({"restaurant_id": 10,
                            "items": [{"name": "Idli", "qty": "two"}, {"name": "Idli", "qty": 99}]})
except ValidationError as e:
    print(e.error_count(), "errors")
    for err in e.errors():
        print(" ", err["loc"], "-&gt;", err["msg"])</div>
  <div class="fx" data-lang="text">OrderIn(restaurant_id=10, items=[OrderItem(name='Masala Dosa', qty=2)], note='extra chutney')
3
{'restaurant_id': 10, 'items': [{'name': 'Masala Dosa', 'qty': 2}], 'note': 'extra chutney'}
2 errors
  ('items', 0, 'qty') -&gt; Input should be a valid integer, unable to parse string as an integer
  ('items', 1, 'qty') -&gt; Input should be less than or equal to 10</div>
  <p>Start with part 1. The app sent <code>"10"</code> and <code>"2"</code> as strings, and Pydantic turned them into the integers 10 and 2. This conversion is called <strong>coercion</strong>, and Pydantic only does it when the meaning is unambiguous: the string <code>"2"</code> clearly means the number 2, so it is accepted. The proof that <code>qty</code> is now a real int is the line that prints 3: <code>2 + 1</code> worked as arithmetic. The validator stripped the extra spaces from the note, and <code>model_dump()</code> turned the object back into a plain dict (there is also <code>model_dump_json()</code> for JSON text).</p>
  <p>Part 2 is the same broken order that Flask rejected one mistake at a time. Pydantic checked every field and reported both problems together. Each error carries a <code>loc</code>, short for location, which is a path into the document: <code>('items', 0, 'qty')</code> means "the <code>qty</code> of the first element of <code>items</code>" (lists count from 0). The first error says the string <code>"two"</code> could not be turned into an integer, so coercion refused it; the second says 99 broke the <code>le=10</code> limit ("less than or equal to 10").</p>
  <p>Notice what the schema cannot check. If Asha ordered "Pizza" from Dosa Hut, the shape would be perfect: a name that is a string and a quantity between 1 and 10. Whether Pizza is on Dosa Hut's menu is a fact about your data, not about the shape, so that rule stays in your own code (we write it in the next section). A schema is a bouncer with a checklist at the door: it can see that every guest is wearing shoes, but it cannot know who is on tonight's guest list unless you tell it.</p>
  <p>These are the schemas the real Biteful app uses. <code>OrderIn</code> is what a client may send; <code>OrderOut</code> is what a client may see; <code>StatusIn</code> is what restaurant staff send to change an order's status; <code>EtaIn</code> is the input to the delivery-time model. <code>Literal[...]</code> means "only one of these exact values".</p>
  <div class="fx" data-lang="py">class OrderItem(BaseModel):
    name: str
    qty: int = Field(ge=1, le=10)

class OrderIn(BaseModel):                          # what a client may SEND
    restaurant_id: int
    items: list[OrderItem] = Field(min_length=1, max_length=20)
    note: str = Field(default="", max_length=200)

class OrderOut(BaseModel):                         # what a client may SEE
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
  <p>The limits use short names you will see everywhere: <code>gt</code> and <code>ge</code> mean "greater than" and "greater than or equal to", <code>lt</code> and <code>le</code> mean "less than" and "less than or equal to", and <code>min_length</code>/<code>max_length</code> limit the length of strings and lists. If you meet older code, be aware that Pydantic version 1 used different method names (<code>parse_obj</code>, <code>.dict()</code>, <code>@validator</code>); version 2, used here, replaced them with <code>model_validate</code>, <code>model_dump</code> and <code>@field_validator</code>, and moved the checking core to Rust, which made it several times faster.</p>

  <h2 id="fa-params"><span class="num">03</span>Path, Query, Body and Header Parameters</h2>
  <p>A single request can carry input in four different places, and an endpoint often needs several of them at once. The <strong>path</strong> is the URL itself, such as the <code>10</code> in <code>/v1/restaurants/10</code>. The <strong>query string</strong> is the part after a <code>?</code>, made of <code>key=value</code> pairs joined by <code>&amp;</code>, such as <code>?city=Pune&amp;min_rating=4</code>; it is normally used for optional filters. The <strong>body</strong> is the JSON document sent with POST, PUT and PATCH requests. And <strong>headers</strong> are named lines of extra information sent before the body, such as <code>Content-Type: application/json</code> or, in our app, <code>X-Customer: asha</code>. In Flask you read each place yourself, with <code>request.args</code>, <code>request.get_json()</code> and so on. In FastAPI the endpoint is just a function with typed parameters, so the question is how FastAPI knows which parameter comes from where.</p>
  <p>The answer is a small set of rules based on each parameter's name and type, applied in this order:</p>
  <table class="tbl">
    <tr><th>The parameter…</th><th>is read from</th><th>Biteful example</th></tr>
    <tr><td>has a name that appears in the path template</td><td>the path</td><td><code>rid: int</code> with <code>"/v1/restaurants/{rid}"</code></td></tr>
    <tr><td>has a Pydantic model as its type</td><td>the JSON body</td><td><code>order: OrderIn</code></td></tr>
    <tr><td>is marked with <code>Header()</code></td><td>a header</td><td><code>x_customer</code> reads <code>X-Customer</code> (underscores become dashes)</td></tr>
    <tr><td>is any other simple type (int, float, str, bool)</td><td>the query string</td><td><code>min_rating: float = 0</code> reads <code>?min_rating=4</code></td></tr>
  </table>
  <p>Think of a parcel at a post office. The address on the outside says which building (the path), the stickers say how to handle it (the headers), the little form taped on top adds optional instructions (the query string), and the contents are inside the box (the body). The clerk knows where to look for each without being told, because each kind of information always lives in the same place. Here are the two restaurant endpoints of the Biteful app; the restaurant and menu data they use are plain dicts at the top of <code>main.py</code>, standing in for a database:</p>
  <div class="fx" data-lang="py">RESTAURANTS = {10: {"id": 10, "name": "Dosa Hut", "city": "Pune", "rating": 4.5},
               11: {"id": 11, "name": "Biryani Bros", "city": "Pune", "rating": 3.9},
               12: {"id": 12, "name": "Momo Corner", "city": "Mumbai", "rating": 4.2}}
MENUS = {10: {"Masala Dosa": 120, "Idli": 60}, 11: {"Chicken Biryani": 250}}
ORDERS: dict[int, dict] = {}
NEXT_ID = [101]</div>
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
  <p>In <code>list_restaurants</code>, neither <code>city</code> nor <code>min_rating</code> appears in the path, so both come from the query string. Giving a parameter a default value (<code>= None</code>, <code>= 0</code>) makes it optional; without a default it is required. <code>Annotated[float, Query(ge=0, le=5)]</code> reads as "a float, from the query string, between 0 and 5": <code>Annotated</code> is a standard Python way to attach extra information to a type hint, and FastAPI uses it to attach limits. In <code>get_restaurant</code>, <code>rid</code> appears in the path, so it is a path parameter, and <code>raise HTTPException(404, ...)</code> stops the request with "Not Found" (more on errors in section 10).</p>
  <p>The order endpoint is where all four sources meet. The body is an <code>OrderIn</code>, and the menu check, the business rule that a schema cannot know, is the only checking code left in the function. The parameters with <code>Depends</code> and <code>BackgroundTasks</code> are explained in sections 05 and 07; for now, read <code>customer</code> as "the name from the <code>X-Customer</code> header" and <code>db</code> as "the place orders are stored".</p>
  <div class="fx" data-lang="py">@app.post("/v1/orders", response_model=OrderOut, status_code=201)
def create_order(order: OrderIn, bg: BackgroundTasks,
                 customer: str = Depends(current_customer), db: dict = Depends(get_db)):
    menu = MENUS.get(order.restaurant_id)
    if menu is None:
        raise HTTPException(422, "restaurant has no menu")
    unknown = [it.name for it in order.items if it.name not in menu]
    if unknown:                                    # a business rule the schema can't know
        raise HTTPException(422, f"not on the menu: {unknown}")
    total = sum(menu[it.name] * it.qty for it in order.items)
    oid = NEXT_ID[0]; NEXT_ID[0] += 1
    db["orders"][oid] = {"order_id": oid, "customer": customer, "customer_phone": "98xxxx1234",
                         "restaurant_id": order.restaurant_id, "items": order.items,
                         "total": total, "status": "placed", "note": order.note}
    bg.add_task(send_receipt_email, customer, oid, total)   # runs AFTER the response is sent
    return db["orders"][oid]                                 # response_model filters the fields</div>
  <p>We start the full app with <code>uvicorn main:app --port 18300</code> and send it the same kinds of requests that the Flask version received:</p>
  <div class="fx" data-lang="text">$ curl -s 'localhost:18300/v1/restaurants?city=Pune&amp;min_rating=4'
{"items":[{"id":10,"name":"Dosa Hut","city":"Pune","rating":4.5}]}
$ curl -s -w ' [%{http_code}]\\n' 'localhost:18300/v1/restaurants?min_rating=high'
{"detail":[{"type":"float_parsing","loc":["query","min_rating"],"msg":"Input should be a valid number, unable to parse string as a number","input":"high"}]} [422]
$ curl -s -w ' [%{http_code}]\\n' localhost:18300/v1/restaurants/99
{"detail":"restaurant not found"} [404]

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:18300/v1/orders -H 'X-Customer: asha' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Idli", "qty": "two"}, {"name": "Idli", "qty": 99}]}'
{"detail":[{"type":"int_parsing","loc":["body","items",0,"qty"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"two"},{"type":"less_than_equal","loc":["body","items",1,"qty"],"msg":"Input should be less than or equal to 10","input":99,"ctx":{"le":10}}]} [422]
$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:18300/v1/orders -H 'X-Customer: asha' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Pizza", "qty": 1}]}'
{"detail":"not on the menu: ['Pizza']"} [422]</div>
  <p>Walk through the responses. Filtering by city and rating returned only Dosa Hut. <code>?min_rating=high</code> was rejected with 422 and <code>"loc":["query","min_rating"]</code>, so the client is told that the problem is in the query string; the Flask version silently fell back to a default and returned every restaurant, which is a much worse failure because nobody notices it. Restaurant 99 does not exist, so our own code returned 404. The broken order produced one 422 listing <em>both</em> quantity errors, now with <code>"body"</code> at the start of each location. Only when the shape was valid did our menu rule run, and it refused the Pizza with its own 422 message.</p>
  <p>The practical result is that <code>create_order</code> contains about five lines of checking, and all of them are genuine business rules (does this restaurant have a menu, is every dish on it). Everything about types, ranges and required fields moved into the schemas, where it is written once and reused by every endpoint that accepts an <code>OrderIn</code>. The same schema, as we will see, also produces the documentation, so the two can never disagree.</p>

  <h2 id="fa-resp"><span class="num">04</span>Response Models</h2>
  <p>Input is now checked at the door. The other direction is just as important. Biteful stores more about each order than a client should see: the customer's phone number, for the delivery rider, and a payment reference. The simplest way to write an endpoint is to look up the stored record and return it, and whatever an endpoint returns is sent. So a single careless <code>return row</code> leaks private data to anyone who can read the order, and it can happen on any of thirty endpoints.</p>
  <p>FastAPI's answer is the <strong>response model</strong>: a Pydantic model given to the decorator as <code>response_model=...</code>, which describes what the endpoint is allowed to send back. FastAPI takes whatever the function returns, validates it against that model and drops every field the model does not list. It works like a window envelope: whatever is printed on the letter inside, only the part behind the window is visible from outside. Here the same database row is returned from two endpoints, one without a response model and one with:</p>
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

client = TestClient(app)                               # calls the app directly, no server needed
print("leaky:", client.get("/leaky/orders/101").json())
print("safe :", client.get("/safe/orders/101").json())</div>
  <div class="fx" data-lang="text">leaky: {'order_id': 101, 'total': 240, 'status': 'placed', 'customer_phone': '98xxxx1234', 'payment_ref': 'pay_8f2k1'}
safe : {'order_id': 101, 'total': 240, 'status': 'placed'}</div>
  <p><code>TestClient</code>, used here, sends requests straight to the app object inside the same Python program, with no server and no network; we will use it a lot and study it properly in section 12. The two lines of output come from identical function bodies. Without a response model, the phone number and payment reference went out. With <code>response_model=OrderOut</code>, only the three fields <code>OrderOut</code> lists were sent. The function did not have to remember anything; the filter is attached to the endpoint.</p>
  <p>That is why the Biteful app has separate <code>OrderIn</code> and <code>OrderOut</code> models. <code>create_order</code> stores <code>customer</code>, <code>customer_phone</code> and <code>note</code> in the database row and returns that whole row, yet the client only receives <code>OrderOut</code>'s five fields (you will see the actual 201 response in section 07). Keeping two models also protects the input side: <code>OrderIn</code> has no <code>total</code> or <code>status</code> field, so a client cannot set its own price. Using one model for both directions is a classic mistake, demonstrated in Common Mistakes. Finally, <code>status_code=201</code> on the decorator sets the status for a successful call, 201 meaning "Created".</p>

  <h2 id="fa-di"><span class="num">05</span>Dependency Injection</h2>
  <p>Input and output are now safe, but look at what almost every endpoint has to do before its real work starts. It must find out who is calling (a customer? staff of which restaurant?), open a database session, and often load a record and check that it belongs to the caller. After the response, the database session must be closed, even if something went wrong. If every endpoint does this itself, the same lines get copied into every function, which is exactly how the Flask code grew, and changing how "who is calling" works means editing every endpoint.</p>
  <p>FastAPI's solution is <strong>dependency injection</strong>: an endpoint declares what it needs, and FastAPI prepares those things and hands them in, instead of the endpoint fetching them itself. Each piece of setup is written once as an ordinary function called a <strong>dependency</strong>, and an endpoint asks for its result with <code>Depends(that_function)</code> in its parameter list. Before calling the endpoint, FastAPI calls the dependency and passes its return value in. A dependency can itself have parameters (read from headers, the path or other dependencies), so dependencies can be built from other dependencies. And if a dependency uses <code>yield</code> instead of <code>return</code>, the code before <code>yield</code> runs before the endpoint and the code after it runs once the response is finished, like a <code>with</code> block wrapped around the request (see <a class="xref" data-note="py_context">Context Managers</a>).</p>
  <p>A hotel concierge is a good picture of this. A guest (the endpoint) leaves a note saying "I need a taxi and a newspaper at 8". The concierge arranges each item before the guest comes down and tidies up after checkout, and if no taxi can be found, the guest is told before leaving the room rather than finding out on the street. The guest never deals with taxi companies directly.</p>
  <p>The best way to understand the order in which things happen is to watch it. This small app prints a line from each step while handling a request where restaurant staff mark order 101 as delivered. It has three dependencies: <code>get_db</code> opens and closes a (pretend) database session, <code>current_staff</code> reads the <code>X-Staff-Of</code> header to learn which restaurant the caller works at, and <code>order_for_staff</code> uses both of those to load the order and check it belongs to that restaurant. We send three requests: from Dosa Hut staff (restaurant 10), from Biryani Bros staff (restaurant 11), and with no header at all.</p>
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

client = TestClient(app)
for headers in [{"X-Staff-Of": "10"}, {"X-Staff-Of": "11"}, {}]:
    print("PATCH /v1/orders/101/delivered", headers)
    r = client.patch("/v1/orders/101/delivered", headers=headers)
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
  <p>For the first request, FastAPI worked out that the endpoint needs <code>order_for_staff</code>, which in turn needs <code>current_staff</code> and <code>get_db</code>, so it ran those two first: the header was read (10), the session opened, then <code>order_for_staff</code> found the order, and only then did the endpoint run, receiving a ready-to-use order. After the response was built, the code after <code>yield</code> closed the session. The endpoint itself contains no lookups, no header reading and no cleanup.</p>
  <p>The second request shows why this structure is safe. Staff of restaurant 11 are not allowed to touch Dosa Hut's order, so <code>order_for_staff</code> raised a 404 and the endpoint <em>never ran</em>, yet "close session" still printed: cleanup after <code>yield</code> runs even when something fails. The third request failed even earlier: with no header, <code>current_staff</code> raised 401 ("Unauthorized", meaning "I don't know who you are"), so no session was opened at all. One more detail: if several things in the same request ask for the same dependency, FastAPI calls it once and shares the result.</p>
  <p>These are the real dependencies in <code>main.py</code>. <code>current_customer</code> and <code>current_staff</code> are deliberately naive, because anyone can type any header; the <a class="xref" data-note="api_auth">Authentication &amp; Security</a> note replaces their insides with real checks of keys and tokens, and because every endpoint only says <code>Depends(current_customer)</code>, not a single endpoint will need to change.</p>
  <div class="fx" data-lang="py">def get_db():
    db = {"orders": ORDERS}                        # stands in for a database session
    try:
        yield db                                   # handed to the endpoint
    finally:
        pass                                       # a real session would be closed here

def current_customer(x_customer: Annotated[str | None, Header()] = None) -&gt; str:
    if not x_customer:                             # naive on purpose: see the Auth note
        raise HTTPException(401, "send X-Customer")
    return x_customer

def current_staff(x_staff_of: Annotated[int | None, Header()] = None) -&gt; int:
    if x_staff_of is None:
        raise HTTPException(401, "staff only")
    return x_staff_of                              # the restaurant this staff member works at</div>
  <p>Here is <code>create_order</code>'s customer dependency at work on the running server, for an order sent without the header:</p>
  <div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:18300/v1/orders -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Idli", "qty": 1}]}'
{"detail":"send X-Customer"} [401]</div>
  <p>The same design also pays off in testing: because an endpoint only says "I need the current customer", a test can swap that one dependency for a fake, as section 12 shows. The thing to avoid is doing heavy work inside a dependency, such as loading a model file, because a dependency runs on every request that uses it; one-time work belongs in the lifespan (section 11).</p>

  <h2 id="fa-async"><span class="num">06</span>async Endpoints</h2>
  <p>The code is now short and well organised, but the second weakness from Flask is untouched. Sending a receipt email means waiting about a second for the email provider to answer. While the code waits, it is doing nothing useful, but in Flask's model it still occupies a <strong>thread</strong> (one line of execution inside a process; a process can have several) for that whole second. Ten customers ordering at once need ten threads to be served in one second, and threads are not free: each uses memory, and a server can only usefully run so many. The question is whether one thread can wait for many things at the same time.</p>
  <p>It can, using <strong>asynchronous</strong> code, covered in depth in <a class="xref" data-note="py_asyncio">asyncio</a>. A function defined with <code>async def</code> is allowed to pause itself at an <code>await</code>, which means "this will take a while; go and run something else, and come back to me when it's done". Something has to keep track of all the paused functions and resume each one when its wait is over; that something is the <strong>event loop</strong>, a single thread that runs a list of tasks, switching to whichever one is ready. A waiter in a restaurant works like this: they take an order at table one, hand it to the kitchen, and serve table two while the food cooks, rather than standing at the kitchen door. Here are three one-second receipt sends, first with <code>await</code>, then with an ordinary blocking wait:</p>
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
  <p><code>asyncio.gather</code> starts all three sends together. Each one reaches <code>await asyncio.sleep(1)</code>, pauses, and lets the loop start the next, so the three waits overlap and the whole thing takes about 1 second. The ordinary version calls <code>time.sleep(1)</code>, which simply stops the thread; nothing else can run, so three waits take about 3 seconds. (<code>asyncio.sleep</code> stands in for any slow operation that can be awaited, such as a request made with an async HTTP library.)</p>
  <p>FastAPI lets you write an endpoint either as <code>async def</code> or as plain <code>def</code>, and the choice matters a lot. To see how much, here are three endpoints that each wait one second for the "email provider" in a different way:</p>
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
    await asyncio.sleep(1)     # stands in for an awaitable call (httpx.AsyncClient, an async SDK):
    return {"order_id": 101}   # the loop serves other requests while this one waits

@app.post("/sync-def")
def fine():
    time.sleep(1)              # plain def: FastAPI runs it in a threadpool, the loop stays free
    return {"order_id": 101}</div>
  <p>We run this app with <code>uvicorn blocking:app --port 18301</code>, which gives one process with one event loop, and then use a small client that sends ten requests to each endpoint at the same moment and times how long all ten take:</p>
  <div class="fx" data-lang="py"># fire10.py: 10 customers place orders at the same moment, against each endpoint
import asyncio, time, httpx

async def burst(path):
    async with httpx.AsyncClient(base_url="http://127.0.0.1:18301", timeout=30) as client:
        t0 = time.perf_counter()
        rs = await asyncio.gather(*[client.post(path) for _ in range(10)])
        codes = {r.status_code for r in rs}
        print(f"{path:16} 10 at once -&gt; {codes} in {time.perf_counter() - t0:5.2f} s")

for p in ["/async-blocking", "/async-awaiting", "/sync-def"]:
    asyncio.run(burst(p))</div>
  <div class="fx" data-lang="text">$ python fire10.py
/async-blocking  10 at once -&gt; {200} in 10.05 s
/async-awaiting  10 at once -&gt; {200} in  1.01 s
/sync-def        10 at once -&gt; {200} in  1.04 s</div>
  <p>The timings are approximate and vary slightly from run to run, but the pattern is the point. The middle line is what async promises: ten requests, each waiting one second, all finished in about one second, because each paused at <code>await</code> and the loop moved on to the next. The first line is the trap. That endpoint is <code>async def</code>, so FastAPI runs it directly on the event loop, but <code>time.sleep</code> does not <code>await</code>; it freezes the loop's only thread for a full second, during which no other request can even start. The ten requests ran one after another and took about ten seconds. One wrong line made this server ten times slower than Flask with ten threads. The third line shows the safe default: when FastAPI sees a plain <code>def</code> endpoint, it runs it in a <strong>threadpool</strong>, a small set of spare threads kept ready for this purpose, so blocking inside it ties up one of those threads but leaves the event loop free. Ten requests again took about one second.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <text x="5" y="20" font-size="12">async + time.sleep</text>
    <rect x="150" y="8" width="42" height="16" class="fr"/><rect x="192" y="8" width="42" height="16" class="fr" opacity="0.8"/><rect x="234" y="8" width="42" height="16" class="fr" opacity="0.6"/><text x="285" y="21" font-size="12" class="tr">… one after another → about 10 s</text>
    <text x="5" y="62" font-size="12">async + await</text>
    <rect x="150" y="48" width="42" height="6" class="fg"/><rect x="150" y="56" width="42" height="6" class="fg"/><rect x="150" y="64" width="42" height="6" class="fg"/><text x="200" y="64" font-size="12" class="tg">all wait together on the loop → about 1 s</text>
    <text x="5" y="106" font-size="12">plain def (threadpool)</text>
    <rect x="150" y="92" width="42" height="6" class="fb"/><rect x="150" y="100" width="42" height="6" class="fb"/><rect x="150" y="108" width="42" height="6" class="fb"/><text x="200" y="108" font-size="12" class="tb">threads wait in parallel → about 1 s</text>
    <line x1="150" y1="135" x2="580" y2="135" stroke="currentColor"/>
    <text x="150" y="152" font-size="11" text-anchor="middle">0 s</text><text x="192" y="152" font-size="11" text-anchor="middle">1 s</text><text x="580" y="152" font-size="11" text-anchor="middle">10 s</text>
  </svg><figcaption>Each bar is one order's one-second wait, with time running left to right. Top: the blocking call holds the only loop thread, so the bars line up end to end. Middle and bottom: all the waits overlap.</figcaption></figure>
  <p>Read the picture from left to right as time. In the top row, each red bar can only start when the previous one has finished, because the loop is stuck inside <code>time.sleep</code>; ten bars end to end reach ten seconds. In the two lower rows, all the bars start at zero and end at one second, because nothing is stuck: in the middle row the loop juggles the paused requests, in the bottom row separate threads do the waiting.</p>
  <p>This gives a simple rule for choosing. If everything slow inside the endpoint can be awaited (an async HTTP client such as <code>httpx.AsyncClient</code>, an async database driver, an async LLM SDK), write <code>async def</code> and <code>await</code> each call. If the endpoint calls ordinary blocking libraries (<code>requests</code>, <code>psycopg2</code>, <code>smtplib</code>, <code>boto3</code>), write plain <code>def</code> and let the threadpool handle it. If the endpoint does heavy computation, such as a model prediction, also write <code>def</code>, and remember that async does nothing for computation: it only helps with waiting, and real extra CPU capacity comes from running several worker processes, covered in <a class="xref" data-note="api_production">Production Backend</a>. When unsure, plain <code>def</code> is the safe choice, which is why every Biteful endpoint in <code>main.py</code> is plain <code>def</code> except the WebSocket. If you need to call one blocking function from inside an <code>async def</code>, wrap it: <code>await run_in_threadpool(fn, ...)</code> from <code>fastapi.concurrency</code>.</p>

  <h2 id="fa-bg"><span class="num">07</span>Background Tasks</h2>
  <p>Async solves the server's problem (many customers' waits overlap), but not Asha's. Her request still includes a one-second wait for her own receipt email before she sees "Order placed", even though the order was saved after a few milliseconds and she does not care whether the email has been sent yet. What we want is to send the response first and do the slow, non-urgent work afterwards.</p>
  <p>FastAPI provides exactly this as a <strong>background task</strong>: a function you schedule during a request that runs in the same process <em>after</em> the response has been sent. You ask for it by adding a parameter of type <code>BackgroundTasks</code> to the endpoint (FastAPI fills it in, like a dependency) and calling <code>bg.add_task(function, arguments...)</code>. Think of a shop counter: the cashier hands you your token immediately and drops the printed bill in the outbox to be posted after you have left. In <code>create_order</code> the last lines are <code>bg.add_task(send_receipt_email, customer, oid, total)</code> followed by <code>return</code>, and the task itself is an ordinary blocking function, which FastAPI runs in the threadpool:</p>
  <div class="fx" data-lang="py">def send_receipt_email(customer: str, order_id: int, total: int):
    time.sleep(1)                                  # the email provider is slow
    with open("receipts.log", "a") as f:
        f.write(f"{time.strftime('%H:%M:%S')} receipt for order {order_id} -&gt; {customer}: Rs {total}\\n")</div>
  <p>Now Asha places her real order. <code>curl</code>'s <code>%{time_total}</code> prints how long the request took, and then we look at the receipts log immediately and again a little over a second later:</p>
  <div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}] in %{time_total}s\\n' -X POST localhost:18300/v1/orders -H 'X-Customer: asha' -H 'Content-Type: application/json' -d '{"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}], "note": "extra chutney"}'
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"placed"} [201] in 0.003510s
$ date +%H:%M:%S; cat receipts.log
07:30:39
cat: receipts.log: No such file or directory
$ sleep 1.2; date +%H:%M:%S; cat receipts.log
07:30:41
07:30:40 receipt for order 101 -&gt; asha: Rs 240</div>
  <p>The 201 Created response came back in a few milliseconds, containing only the five <code>OrderOut</code> fields (no phone number, as promised in section 04). Immediately afterwards <code>receipts.log</code> did not exist yet, because the email task was still in its one-second wait. A moment later the file held Asha's receipt, written by the task that ran after the response. Asha saw "Order placed" a full second sooner than in the Flask version.</p>
  <p>Background tasks have real limits, and interviewers often ask about them. The task lives inside the web server process, so if that process crashes or is restarted during a deploy before the task finishes, the email is silently lost; there are no retries and no way to ask "was it sent?". The task also uses the same machine's CPU and threads as your requests. That makes background tasks fine for small work you could afford to lose (writing a log line, warming a cache), but work that must happen, such as a receipt a customer is owed, belongs on a proper <strong>task queue</strong> like Celery, which stores jobs outside the web process and retries them; that is covered in <a class="xref" data-note="api_production">Production Backend</a>.</p>

  <h2 id="fa-ws"><span class="num">08</span>WebSockets</h2>
  <p>Ordinary HTTP is always "the client asks, the server answers". After placing her order, Asha's app wants to <em>be told</em> when Dosa Hut starts preparing it, when the rider leaves and when it is delivered. With plain HTTP the only option is <strong>polling</strong>: asking <code>GET /v1/orders/101</code> every few seconds. That wastes thousands of requests that return "no change", and every update still arrives up to a few seconds late.</p>
  <p>A <strong>WebSocket</strong> fixes this by keeping one connection open in both directions. It starts as a normal HTTP request that asks to "upgrade" the connection, and if the server agrees, the same underlying network connection (a TCP connection, the reliable byte stream that HTTP itself runs on) stays open, and from then on either side can send a message at any moment until one of them closes it. Plain HTTP is like sending letters, where every answer needs a question first; a WebSocket is like a phone call, where either person can speak whenever they have something to say. In FastAPI a WebSocket endpoint is declared with <code>@app.websocket</code> and receives a <code>WebSocket</code> object with methods such as <code>accept</code>, <code>send_json</code>, <code>receive_json</code> and <code>close</code>:</p>
  <div class="fx" data-lang="py">@app.websocket("/ws/orders/{oid}")
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
  <p>The endpoint accepts the connection and then loops. Each time round, it reads the order's current status; if it differs from the last one it sent, it pushes the new status to the app. When the status is final (delivered or cancelled) it stops and closes the connection. Between checks it calls <code>await asyncio.sleep(0.05)</code>, which pauses for 50 milliseconds while leaving the event loop free for other requests; this is one place where <code>async def</code> is required, because a WebSocket stays open for minutes and must never block the loop. To demonstrate it, Asha's app connects to the WebSocket while Dosa Hut's staff change the status through the normal PATCH endpoint. <code>TestClient</code> can drive WebSockets inside one program, so no server is needed:</p>
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
  <p>One connection carried four messages, each arriving right after the staff's PATCH, without the app ever asking. The first and last lines of output ("model loaded" and "model released") come from the app's startup and shutdown code, which section 11 explains.</p>
  <p>This simple version has a limitation you should know about. It works because the WebSocket and the PATCH run in the same process and see the same <code>ORDERS</code> dict. Real deployments run several copies of the server, so the staff's PATCH might reach copy A while Asha's WebSocket is connected to copy B, which never sees the change in its own memory. Real systems therefore publish status changes through a shared channel, such as Redis publish/subscribe, that every copy listens to. When the server only ever needs to push in one direction, Server-Sent Events (a simpler one-way stream over plain HTTP) are a lighter alternative, and for updates that are rare, polling is often good enough.</p>

  <h2 id="fa-docs"><span class="num">09</span>OpenAPI and Swagger Docs</h2>
  <p>Biteful now has eight HTTP endpoints and a WebSocket, and three other teams use them: the mobile app team, the team building the restaurant tablet app, and a partner company. They all need to know exactly what each endpoint accepts and returns. Hand-written documentation is almost always out of date, because someone changes a limit in the code and forgets the wiki. But every fact a client needs (paths, methods, field names, types, limits, error shapes) is already written in our type hints and models.</p>
  <p>FastAPI uses them to generate an <strong>OpenAPI</strong> document: OpenAPI is a standard, machine-readable JSON format for describing an HTTP API, and FastAPI serves its description of your app at <code>/openapi.json</code>. On top of that it serves two web pages built from the same document: <code>/docs</code>, which shows <strong>Swagger UI</strong>, an interactive page where you can expand any endpoint, see its schemas and click "Try it out" to send a real request, and <code>/redoc</code>, a more readable reference layout. The title comes from <code>FastAPI(title="Biteful Orders API", version="1.0")</code> in <code>main.py</code>:</p>
  <div class="fx" data-lang="text">$ curl -s localhost:18300/docs | grep -o '&lt;title&gt;.*&lt;/title&gt;'
&lt;title&gt;Biteful Orders API - Swagger UI&lt;/title&gt;</div>
  <p>The interactive page is meant for a browser, so here we read the raw <code>/openapi.json</code> with a few lines of Python and print a summary of what FastAPI wrote:</p>
  <div class="fx" data-lang="py"># docs_summary.py: read the spec FastAPI generated and summarise it
import httpx

spec = httpx.get("http://127.0.0.1:18300/openapi.json").json()
print(spec["openapi"], spec["info"])
for path, ops in spec["paths"].items():
    for method, op in ops.items():
        print(f"  {method.upper():6} {path:24} {op['summary']}")
schemas = spec["components"]["schemas"]
print("schemas:", sorted(schemas))
print("OrderItem.qty:", schemas["OrderItem"]["properties"]["qty"])</div>
  <div class="fx" data-lang="text">3.1.0 {'title': 'Biteful Orders API', 'version': '1.0'}
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
  <p>Every endpoint is listed with its method and a summary made from the function name (<code>create_order</code> became "Create Order"). Every schema is there, including two that FastAPI added itself, <code>HTTPValidationError</code> and <code>ValidationError</code>, which describe the shape of the 422 error body so clients know what to expect. And look at the last line: <code>OrderItem.qty</code> is documented as an integer with minimum 1 and maximum 10, taken directly from <code>Field(ge=1, le=10)</code>. If a developer changes that limit, the validation and the documentation change together, because they come from the same line. The same document can also be fed to tools that generate client code for the mobile apps, and to contract tests.</p>
  <p>Two cautions. A public documentation page also tells attackers every endpoint you have, so internal routes can be hidden with <code>include_in_schema=False</code>, and public production deployments sometimes turn the pages off with <code>FastAPI(docs_url=None, redoc_url=None)</code>. And errors you raise by hand, such as our 409 below, do not appear in the documentation unless you declare them with the decorator's <code>responses={409: {...}}</code> argument; FastAPI only knows what it can see in the signature.</p>

  <h2 id="fa-err"><span class="num">10</span>Error Handling and Middleware</h2>
  <p>Validation errors become 422 automatically, but many errors are business rules that only your code can detect. Dosa Hut's staff try to cancel order 101 after it was delivered. Biryani Bros' staff try to change Dosa Hut's order. Someone asks for an order that does not exist. Each needs the right status code and a consistent JSON body. Separately, some code should run around <em>every</em> request, such as timing how long each one takes. FastAPI has three tools for this, and they suit different situations.</p>
  <p>The first, which we have already used, is <code>raise HTTPException(status_code, detail)</code>. Raised anywhere in an endpoint or dependency, it stops the request and sends that status with the body <code>{"detail": ...}</code>. It is perfect for expected errors in HTTP code, such as 404 Not Found or 403 Forbidden ("I know who you are, but you may not do this").</p>
  <p>The second is the <strong>exception handler</strong>, a function that turns one of your own exception classes into a response. Its purpose is to keep HTTP out of your business logic: code that decides whether an order can change can simply <code>raise OrderConflict(...)</code>, an ordinary Python exception that knows nothing about status codes, and one handler, registered with <code>@app.exception_handler(OrderConflict)</code>, decides that it becomes a 409 Conflict with a particular JSON body. If the same rule is broken in ten places, the response is identical in all ten.</p>
  <p>The third is <strong>middleware</strong>: code that wraps every request and response, like a security desk that every visitor passes on the way in and on the way out. A middleware function receives the request and a function called <code>call_next</code>; calling <code>await call_next(request)</code> runs the rest of the app (routing, dependencies, the endpoint) and gives back the response, which the middleware can then modify before it leaves. It is the FastAPI equivalent of Flask's before- and after-request hooks combined into one function. Here are the middleware and handlers in <code>main.py</code>:</p>
  <div class="fx" data-lang="py">@app.middleware("http")
async def timing(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)            # run the rest of the app
    response.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - t0) * 1000:.1f}"
    return response</div>
  <div class="fx" data-lang="py">class OrderConflict(Exception):                    # a business rule, not an HTTP idea
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
  <p>The timing middleware notes the time, runs the request, and adds an <code>X-Process-Time-ms</code> header to every response. <code>OrderConflict</code> carries the order id and a message, and its handler builds a 409 response; <code>ModelNotReady</code> becomes 503 Service Unavailable, used in the next section. Now the endpoint that staff use to update an order, which uses all of these, and the read endpoint beside it:</p>
  <div class="fx" data-lang="py">@app.get("/v1/orders/{oid}", response_model=OrderOut)
def get_order(oid: int, db: dict = Depends(get_db)):
    if oid not in db["orders"]:
        raise HTTPException(404, "order not found")
    return db["orders"][oid]

@app.patch("/v1/orders/{oid}", response_model=OrderOut)
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
  <p>The endpoint reads like a list of rules: the order must exist (404), it must belong to the caller's restaurant (403), and a delivered order cannot change again (our domain exception). Order 101 was placed in section 07, so we can try each case against the running server. The last request uses <code>curl -i</code>, which prints the response's status line and headers as well as the body:</p>
  <div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}]\\n' -X PATCH localhost:18300/v1/orders/101 -H 'X-Staff-Of: 11' -H 'Content-Type: application/json' -d '{"status": "delivered"}'
{"detail":"not your restaurant's order"} [403]
$ curl -s -w ' [%{http_code}]\\n' -X PATCH localhost:18300/v1/orders/101 -H 'X-Staff-Of: 10' -H 'Content-Type: application/json' -d '{"status": "delivered"}'
{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"delivered"} [200]
$ curl -s -w ' [%{http_code}]\\n' -X PATCH localhost:18300/v1/orders/101 -H 'X-Staff-Of: 10' -H 'Content-Type: application/json' -d '{"status": "cancelled"}'
{"error":"conflict","order_id":101,"detail":"already delivered"} [409]
$ curl -s -w ' [%{http_code}]\\n' -X PATCH localhost:18300/v1/orders/101 -H 'X-Staff-Of: 10' -H 'Content-Type: application/json' -d '{"status": "eaten"}'
{"detail":[{"type":"literal_error","loc":["body","status"],"msg":"Input should be 'preparing', 'out_for_delivery', 'delivered' or 'cancelled'","input":"eaten","ctx":{"expected":"'preparing', 'out_for_delivery', 'delivered' or 'cancelled'"}}]} [422]
$ curl -s -i localhost:18300/v1/orders/101
HTTP/1.1 200 OK
date: Thu, 19 Nov 2026 07:30:43 GMT
server: uvicorn
content-length: 109
content-type: application/json
x-process-time-ms: 1.1

{"order_id":101,"restaurant_id":10,"items":[{"name":"Masala Dosa","qty":2}],"total":240,"status":"delivered"}</div>
  <p>Biryani Bros staff (11) received 403 from the <code>HTTPException</code>. Dosa Hut staff (10) marked the order delivered, and the 200 response again shows only <code>OrderOut</code>'s fields. Trying to cancel the delivered order raised <code>OrderConflict</code>, and the handler turned it into the 409 body we designed. The status <code>"eaten"</code> is not one of the <code>Literal</code> values in <code>StatusIn</code>, so validation rejected it with 422 before our function ran, and the error even lists the allowed values. Finally, the headers of the last response include <code>x-process-time-ms</code>, added by the middleware (header names are case-insensitive, and uvicorn sends them in lowercase).</p>
  <p>One rule of thumb completes the picture. Handle the errors you expect, explicitly, with the right status codes, but do not catch every exception and return 200 with an error message inside: monitoring tools would count those failures as successes. Unexpected errors should become 500 Internal Server Error responses, which FastAPI does by default, and be logged with enough detail to debug them, without sending internal details such as file paths to the client.</p>

  <h2 id="fa-ml"><span class="num">11</span>lifespan: Loading a Model Once</h2>
  <p>Biteful's <code>/v1/eta</code> endpoint predicts delivery time with a small linear-regression model trained in the Flask note (the model itself is explained in <a class="xref" data-note="ml_regression">Linear Regression</a>). It is trained offline and saved to a file with <code>joblib</code>, a library for saving Python objects to disk:</p>
  <div class="fx" data-lang="py"># train_eta.py: train Biteful's delivery-time model once, offline (same as the Flask note)
import joblib
from sklearn.linear_model import LinearRegression

#        distance_km, items   minutes   (six past Dosa Hut deliveries)
X = [[1.5, 1], [2.0, 2], [3.0, 2], [4.0, 3], [5.0, 2], [6.5, 4]]
y = [22, 27, 30, 38, 39, 51]
model = LinearRegression().fit(X, y)
print("minutes = %.2f + %.2f * km + %.2f * items" % (model.intercept_, *model.coef_))
joblib.dump({"model": model, "version": "eta-lr-1"}, "eta.joblib")
print("saved eta.joblib")</div>
  <div class="fx" data-lang="text">minutes = 12.68 + 4.03 * km + 3.02 * items
saved eta.joblib</div>
  <p>The question is where the loading code goes. Loading the model inside the endpoint would read the file on every request, which is wasteful for a small model and impossible for a 2 GB one. Loading it at the top of <code>main.py</code>, when the module is imported, works but makes the file load during every import, including in tests that never need it, and gives no clean place to release it. What we want is code that runs once when the server starts, before the first request, and once when it stops.</p>
  <p>FastAPI's place for this is the <strong>lifespan</strong> function. It is an async function containing a single <code>yield</code>: everything before the <code>yield</code> runs at startup, the server handles requests while the function is paused at the <code>yield</code>, and everything after it runs at shutdown. It is decorated with <code>@asynccontextmanager</code>, which turns it into a context manager (the same "setup, then cleanup" idea as a <code>with</code> block), and it is passed to the app as <code>FastAPI(lifespan=lifespan)</code>.</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <defs><marker id="fa-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <line x1="10" y1="55" x2="585" y2="55" stroke="currentColor" marker-end="url(#fa-ar2)"/>
    <rect x="15" y="30" width="130" height="50" rx="6" class="fv"/><text x="80" y="52" text-anchor="middle">startup</text><text x="80" y="69" text-anchor="middle" font-size="11">joblib.load once</text>
    <rect x="165" y="30" width="270" height="50" rx="6" class="fg sg"/><text x="300" y="52" text-anchor="middle">serve requests</text><text x="300" y="69" text-anchor="middle" font-size="11">/v1/orders  /v1/eta  /health  /ready</text>
    <rect x="455" y="30" width="125" height="50" rx="6" class="fs"/><text x="517" y="52" text-anchor="middle">shutdown</text><text x="517" y="69" text-anchor="middle" font-size="11">release</text>
    <text x="80" y="100" text-anchor="middle" font-size="11" class="tm">before yield</text><text x="517" y="100" text-anchor="middle" font-size="11" class="tm">after yield</text>
  </svg><figcaption>The life of one server process, left to right. The model is loaded once on the left, every request in the middle uses that same loaded copy, and it is released on the right.</figcaption></figure>
  <p>The picture is the whole idea: one load at the start of the process's life, many requests sharing it, one release at the end. In code, the model is stored in a module-level dict <code>ML</code> so the endpoints can reach it:</p>
  <div class="fx" data-lang="py">ML = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    ML["eta"] = joblib.load("eta.joblib")          # startup: runs once, before any request
    print("model loaded:", ML["eta"]["version"])
    yield                                          # the server handles requests here
    ML.clear()                                     # shutdown: runs once, at the end
    print("model released")

app = FastAPI(title="Biteful Orders API", version="1.0", lifespan=lifespan)</div>
  <p>The endpoints that use it check that the model is present and raise <code>ModelNotReady</code> (the 503 handler from the previous section) if it is not. Alongside the prediction endpoint are two small endpoints that every served model should have. <code>/health</code> answers "is the process alive?" and <code>/ready</code> answers "can it serve requests right now?", which is false until the model has loaded:</p>
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
        raise ModelNotReady()                      # readiness: 503 until the model is loaded
    return {"ready": True, "model": ML["eta"]["version"]}</div>
  <p>Against the running server:</p>
  <div class="fx" data-lang="text">$ curl -s -X POST localhost:18300/v1/eta -H 'Content-Type: application/json' -d '{"distance_km": 3.2, "items": 2}'
{"eta_minutes":31.6,"model":"eta-lr-1"}
$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:18300/v1/eta -H 'Content-Type: application/json' -d '{"distance_km": 0, "items": 2}'
{"detail":[{"type":"greater_than","loc":["body","distance_km"],"msg":"Input should be greater than 0","input":0,"ctx":{"gt":0.0}}]} [422]
$ curl -s localhost:18300/health
{"status":"ok"}
$ curl -s localhost:18300/ready
{"ready":true,"model":"eta-lr-1"}</div>
  <p>The prediction is 31.6 minutes, the same as the Flask version and the hand calculation (12.68 + 4.03 × 3.2 + 3.02 × 2). A distance of 0 was rejected by <code>EtaIn</code>'s <code>gt=0</code> limit with 422 before the model was touched, so bad input never reaches it. The response includes the model version, which makes every prediction traceable to the exact model that made it. And here is the full log of the Biteful server for every request on this page, which shows the lifespan bracketing the server's whole life:</p>
  <div class="fx" data-lang="text">INFO:     Started server process [3705]
INFO:     Waiting for application startup.
model loaded: eta-lr-1
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:18300 (Press CTRL+C to quit)
INFO:     127.0.0.1:55346 - "GET /v1/restaurants?city=Pune&amp;min_rating=4 HTTP/1.1" 200 OK
INFO:     127.0.0.1:55348 - "GET /v1/restaurants?min_rating=high HTTP/1.1" 422 Unprocessable Content
INFO:     127.0.0.1:55352 - "GET /v1/restaurants/99 HTTP/1.1" 404 Not Found
INFO:     127.0.0.1:55366 - "POST /v1/orders HTTP/1.1" 422 Unprocessable Content
INFO:     127.0.0.1:55370 - "POST /v1/orders HTTP/1.1" 422 Unprocessable Content
INFO:     127.0.0.1:48520 - "POST /v1/orders HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:60626 - "POST /v1/orders HTTP/1.1" 201 Created
INFO:     127.0.0.1:56638 - "GET /docs HTTP/1.1" 200 OK
INFO:     127.0.0.1:56648 - "GET /openapi.json HTTP/1.1" 200 OK
INFO:     127.0.0.1:56660 - "PATCH /v1/orders/101 HTTP/1.1" 403 Forbidden
INFO:     127.0.0.1:56668 - "PATCH /v1/orders/101 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56674 - "PATCH /v1/orders/101 HTTP/1.1" 409 Conflict
INFO:     127.0.0.1:56678 - "PATCH /v1/orders/101 HTTP/1.1" 422 Unprocessable Content
INFO:     127.0.0.1:56686 - "GET /v1/orders/101 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56700 - "POST /v1/eta HTTP/1.1" 200 OK
INFO:     127.0.0.1:56706 - "POST /v1/eta HTTP/1.1" 422 Unprocessable Content
INFO:     127.0.0.1:56718 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:56722 - "GET /ready HTTP/1.1" 200 OK
INFO:     Shutting down
INFO:     Waiting for application shutdown.
model released
INFO:     Application shutdown complete.
INFO:     Finished server process [3705]</div>
  <p>"model loaded" appears during startup, before uvicorn reports "Application startup complete" and before the first request; every request in this note was served by that one loaded copy; and "model released" appears during shutdown. The distinction between <code>/health</code> and <code>/ready</code> matters in production: a load balancer (the component that spreads traffic over several copies of a server) only sends traffic to copies that are ready, while an orchestrator such as Kubernetes restarts copies that are not alive. Mixing the two up causes a server with a slow-loading model to be restarted over and over before it ever finishes loading. Two more facts are worth remembering. Each worker process runs its own lifespan, so four uvicorn workers hold four copies of the model in memory. And older code uses <code>@app.on_event("startup")</code> and <code>@app.on_event("shutdown")</code> for this; those are deprecated in favour of lifespan.</p>

  <h2 id="fa-test"><span class="num">12</span>Testing with TestClient</h2>
  <p>We now want automatic tests for everything: Asha's order and its receipt, the 422 that lists every error, the staff rules (403, 200, 409), the 503 when the model is missing, the WebSocket pushes, and an order placed without a customer header by replacing the customer check. Starting uvicorn and sending real requests would work, but it is slow and fragile. <strong>TestClient</strong> solves this: it is a client object, built on the <code>httpx</code> library, that sends requests directly to the app object inside the test process, with no server, port or network involved, and gives back ordinary response objects with <code>.status_code</code> and <code>.json()</code>. It is the FastAPI equivalent of Flask's test client.</p>
  <p>Two FastAPI-specific details make it powerful. First, the lifespan only runs if the client is used in a <code>with</code> block: <code>with TestClient(app) as client:</code> runs startup on entry and shutdown on exit, while a bare <code>TestClient(app)</code> skips both. Second, every app has a dict called <code>app.dependency_overrides</code>; putting <code>app.dependency_overrides[real_dependency] = fake</code> in it makes FastAPI call the fake everywhere the real one was used. This is the testing payoff of dependency injection. The tests use <a class="xref" data-note="py_pytest">pytest</a>: each function starting with <code>test_</code> is a test, <code>assert</code> checks a condition, and a <strong>fixture</strong> marked <code>autouse=True</code> runs around every test, here to reset the stored orders and clear any overrides.</p>
  <div class="fx" data-lang="py"># test_main.py: run with  pytest -q test_main.py
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from main import app, ORDERS, NEXT_ID, current_customer

ASHA = {"X-Customer": "asha"}
DOSAS = {"restaurant_id": 10, "items": [{"name": "Masala Dosa", "qty": 2}]}

@pytest.fixture(autouse=True)
def fresh_orders():
    ORDERS.clear(); NEXT_ID[0] = 101           # every test starts with no orders
    yield
    app.dependency_overrides.clear()           # never leak a fake into the next test

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
    client = TestClient(app)                   # no 'with': the lifespan never ran, so no model
    assert client.post("/v1/eta", json={"distance_km": 3.2, "items": 2}).status_code == 503
    with TestClient(app) as client:
        assert client.post("/v1/eta", json={"distance_km": 3.2, "items": 2}).json()["eta_minutes"] == 31.6

def test_override_customer_dependency():
    app.dependency_overrides[current_customer] = lambda: "test-user"   # swap one dependency
    with TestClient(app) as client:
        assert client.post("/v1/orders", json=DOSAS).status_code == 201  # no header needed

def test_websocket_pushes_status():
    with TestClient(app) as client:
        client.post("/v1/orders", json=DOSAS, headers=ASHA)
        with client.websocket_connect("/ws/orders/101") as ws:
            assert ws.receive_json()["status"] == "placed"
            client.patch("/v1/orders/101", json={"status": "delivered"}, headers={"X-Staff-Of": "10"})
            assert ws.receive_json()["status"] == "delivered"</div>
  <p>Running them (the <code>-W</code> flag hides a deprecation notice printed by the testing library itself, not by our code):</p>
  <div class="fx" data-lang="text">$ pytest -q -W ignore::DeprecationWarning test_main.py
......                                                                   [100%]
6 passed in 5.20s</div>
  <p>Each dot is a passing test. A few of them are worth reading closely. <code>test_asha_order_and_receipt</code> checks that the response body is exactly the five <code>OrderOut</code> fields, so a leaked phone number would fail it; it can also check the receipt immediately, because TestClient runs background tasks before it returns the response. <code>test_eta_needs_lifespan</code> uses the <code>with</code> rule deliberately: without <code>with</code>, the lifespan never ran, no model was loaded, and the endpoint answered 503; with it, the prediction is 31.6. <code>test_override_customer_dependency</code> replaces <code>current_customer</code> with a function that always returns "test-user", so the order succeeds without any header; this is how you test endpoints protected by real authentication without real credentials. And <code>test_websocket_pushes_status</code> shows that WebSockets can be tested in the same way as everything else.</p>

  <h2 id="fa-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most damaging mistake is the one from section 06: calling something that blocks, such as <code>time.sleep</code>, <code>requests.get</code> or a slow <code>model.predict</code>, inside an <code>async def</code> endpoint. It freezes the event loop, and every request in that process waits, as the ten-second measurement showed. If an endpoint uses any blocking library, write it as plain <code>def</code>.</p>
  <p>The second is using one model for both input and output. It looks tidy, but every field in the model becomes something the client is allowed to send. Here a single <code>Order</code> model has <code>total</code> and <code>status</code> fields because the response needs them, and the server intends to calculate the total itself:</p>
  <div class="fx" data-lang="py">from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class Order(BaseModel):            # ONE model used for input and output
    restaurant_id: int
    qty: int
    total: int = 0
    status: str = "placed"

@app.post("/v1/orders")
def create_order(order: Order):
    if order.total == 0:
        order.total = order.qty * 120  # the server meant to compute this...
    return order

client = TestClient(app)
print(client.post("/v1/orders", json={"restaurant_id": 10, "qty": 2}).json())
print(client.post("/v1/orders", json={"restaurant_id": 10, "qty": 2,
                                      "total": 1, "status": "delivered"}).json())</div>
  <div class="fx" data-lang="text">{'restaurant_id': 10, 'qty': 2, 'total': 240, 'status': 'placed'}
{'restaurant_id': 10, 'qty': 2, 'total': 1, 'status': 'delivered'}</div>
  <p>The first request behaves as intended: the server computed 2 × 120 = 240. In the second, the client simply included <code>"total": 1</code> and <code>"status": "delivered"</code>, and the server accepted both, because the model said those fields exist. This is called <strong>mass assignment</strong>, and it is a real class of security bug. The fix is the pattern used throughout this note: an input model (<code>OrderIn</code>) that lists only what clients may set, and an output model (<code>OrderOut</code>) for what they may see, with the server computing everything else.</p>
  <p>The third is writing <code>Depends(get_db())</code>, with brackets, instead of <code>Depends(get_db)</code>. With the brackets, Python calls <code>get_db</code> immediately, once, when the module loads, and passes its result to <code>Depends</code> instead of the function itself. Because <code>get_db</code> uses <code>yield</code>, that result is a generator object, and FastAPI refuses it:</p>
  <div class="fx" data-lang="py">from fastapi import Depends, FastAPI

app = FastAPI()

def get_db():
    yield {"orders": {}}

try:
    @app.get("/wrong")
    def wrong(db=Depends(get_db())):   # called it: hands over a generator object, not the function
        return {}
except TypeError as e:
    print("TypeError:", e)

@app.get("/right")
def right(db=Depends(get_db)):         # pass the function itself; FastAPI calls it per request
    return {}
print("fixed route registered:", [r.path for r in app.routes][-1])</div>
  <div class="fx" data-lang="text">TypeError: &lt;generator object get_db at 0x7fb2bf8cfb60&gt; is not a callable object
fixed route registered: /right</div>
  <p><code>Depends</code> needs the function, so that FastAPI can call it afresh for every request; the fixed route registered without complaint.</p>
  <p>The fourth is forgetting a default on a query parameter. Without one, FastAPI treats the parameter as required, and every request that leaves it out is rejected:</p>
  <div class="fx" data-lang="py">from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/v1/restaurants")
def list_restaurants(city: str):                 # no default: city is now REQUIRED
    return {"city": city}

@app.get("/v2/restaurants")
def list_restaurants_fixed(city: str | None = None):   # default None: optional
    return {"city": city}

client = TestClient(app)
print(client.get("/v1/restaurants").json())
print(client.get("/v2/restaurants").json())</div>
  <div class="fx" data-lang="text">{'detail': [{'type': 'missing', 'loc': ['query', 'city'], 'msg': 'Field required', 'input': None}]}
{'city': None}</div>
  <p>The first endpoint rejected a perfectly reasonable request with "Field required" for <code>city</code>, while the second, with <code>= None</code>, treats a missing city as "no filter". A related surprise: a parameter whose type is a list or a Pydantic model is read from the body unless you mark it with <code>Query()</code>.</p>
  <p>Finally, three mistakes from the later sections. Using <code>BackgroundTasks</code> for work that must not be lost, such as receipts or payments, means losing it whenever the process restarts; use a task queue. Using <code>TestClient(app)</code> without <code>with</code> skips the lifespan, so tests fail mysteriously with a missing model. And forgetting to clear <code>app.dependency_overrides</code> after a test leaks a fake user into every test that runs afterwards.</p>

  <h2 id="fa-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>FastAPI</b>: a framework that builds a web API from typed Python functions; type hints drive validation, errors, output filtering and docs.</li>
    <li><b>ASGI</b>: the async server-to-app standard (successor of Flask's WSGI); lets one process keep many requests open.</li>
    <li><b>uvicorn</b>: the ASGI server that opens the port and runs the app. <b>Starlette</b>: routing, async, WebSockets underneath FastAPI. <b>Pydantic</b>: the validation library.</li>
    <li><b>Type hint</b>: <code>x: int</code>; ignored by Python, stored in <code>__annotations__</code>, read by FastAPI and Pydantic.</li>
    <li><b>Pydantic model</b>: a <code>BaseModel</code> class describing a data shape; checks and coerces on creation, reports every error.</li>
    <li><b>Coercion</b>: safe conversion such as <code>"2"</code> → 2; <code>"two"</code> is refused.</li>
    <li><b>422</b>: body <code>{"detail": [...]}</code>, one entry per error with <code>type</code>, <code>loc</code>, <code>msg</code>, <code>input</code>.</li>
    <li><b>response_model</b>: schema that validates, filters and documents the return value.</li>
    <li><b>Dependency</b>: a function given to <code>Depends()</code>; FastAPI calls it and injects the result. <code>yield</code> = setup, then cleanup.</li>
    <li><b>Event loop</b>: one thread switching between paused async tasks. <b>Threadpool</b>: spare threads that run plain <code>def</code> endpoints.</li>
    <li><b>Background task</b>: runs in the same process after the response is sent.</li>
    <li><b>WebSocket</b>: an upgraded HTTP connection that stays open; both sides can send any time.</li>
    <li><b>OpenAPI</b>: machine-readable API description at <code>/openapi.json</code>; <b>Swagger UI</b> at <code>/docs</code>, ReDoc at <code>/redoc</code>.</li>
    <li><b>Middleware</b>: wraps every request/response. <b>Exception handler</b>: maps an exception class to a response.</li>
    <li><b>lifespan</b>: code before <code>yield</code> runs at startup, after it at shutdown.</li>
    <li><b>TestClient</b>: in-process client; <code>with</code> runs the lifespan; <code>app.dependency_overrides</code> swaps dependencies.</li>
  </ul>
  <h3>Where parameters come from</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Source</th><th>Example</th></tr>
    <tr><td>name in the path template</td><td>path</td><td><code>rid: int</code> + <code>"/v1/restaurants/{rid}"</code></td></tr>
    <tr><td>Pydantic model type</td><td>JSON body</td><td><code>order: OrderIn</code></td></tr>
    <tr><td><code>Annotated[..., Header()]</code></td><td>header</td><td><code>x_customer</code> ← <code>X-Customer</code></td></tr>
    <tr><td>other simple type</td><td>query string</td><td><code>min_rating: float = 0</code></td></tr>
  </table>
  <h3>def or async def</h3>
  <table class="tbl">
    <tr><th>Endpoint does</th><th>Write</th><th>Why</th></tr>
    <tr><td>awaitable I/O (httpx.AsyncClient, async DB/LLM SDKs)</td><td><code>async def</code> + <code>await</code></td><td>waits overlap on the loop</td></tr>
    <tr><td>blocking I/O (requests, psycopg2, smtplib, boto3)</td><td><code>def</code></td><td>runs in the threadpool, loop stays free</td></tr>
    <tr><td>CPU work (model.predict)</td><td><code>def</code> + more worker processes</td><td>async does not speed up computation</td></tr>
    <tr><td>blocking call inside <code>async def</code></td><td>never (or <code>await run_in_threadpool(fn)</code>)</td><td>freezes every request (10 requests ≈ 10 s)</td></tr>
  </table>
  <h3>Error tools</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Use for</th><th>Biteful</th></tr>
    <tr><td>automatic 422</td><td>shape and limit errors</td><td><code>qty: 99</code>, <code>"eaten"</code></td></tr>
    <tr><td><code>raise HTTPException(code, detail)</code></td><td>expected errors in endpoints/dependencies</td><td>401, 403, 404</td></tr>
    <tr><td><code>@app.exception_handler(E)</code></td><td>domain exceptions → status + JSON</td><td><code>OrderConflict</code> → 409, <code>ModelNotReady</code> → 503</td></tr>
    <tr><td><code>@app.middleware("http")</code></td><td>code around every request</td><td><code>X-Process-Time-ms</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from contextlib import asynccontextmanager
from typing import Annotated
from fastapi import FastAPI, Depends, Header, Query, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

class ItemIn(BaseModel):                                   # body schema
    qty: int = Field(ge=1, le=10)

class ItemOut(BaseModel):                                  # response schema
    id: int
    qty: int

@asynccontextmanager
async def lifespan(app):                                   # startup / shutdown
    ...                                                    # load model
    yield
    ...                                                    # release

app = FastAPI(lifespan=lifespan)

def get_db():                                              # yield dependency
    db = open_session()
    try:
        yield db
    finally:
        db.close()

def current_user(x_user: Annotated[str | None, Header()] = None):
    if not x_user:
        raise HTTPException(401, "who are you?")
    return x_user

@app.post("/items/{shop_id}", response_model=ItemOut, status_code=201)
def create(shop_id: int,                                   # path
           item: ItemIn,                                   # body
           bg: BackgroundTasks,
           limit: Annotated[int, Query(ge=1)] = 10,        # query
           user: str = Depends(current_user),              # dependency
           db=Depends(get_db)):
    bg.add_task(send_email, user)                          # after the response
    return {"id": 1, "qty": item.qty, "secret": "dropped"} # filtered by ItemOut

@app.middleware("http")
async def mw(request, call_next):
    response = await call_next(request)
    response.headers["X-Example"] = "1"
    return response

# tests
# with TestClient(app) as c: ...                  (runs lifespan)
# app.dependency_overrides[current_user] = lambda: "test"</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Python ignores hints; only FastAPI, Pydantic and type checkers act on them.</li>
    <li>Schemas check shape and limits, not business rules (menu membership stays in code).</li>
    <li>No default on a query parameter → it is required.</li>
    <li>One model for input and output → mass assignment; use separate In/Out models.</li>
    <li><code>Depends(fn)</code>, never <code>Depends(fn())</code>.</li>
    <li>Blocking call in <code>async def</code> freezes the whole process.</li>
    <li>Background tasks die with the process; use a queue for must-run work.</li>
    <li>Each worker runs its own lifespan: N workers = N model copies.</li>
    <li><code>TestClient(app)</code> without <code>with</code> skips the lifespan; clear <code>dependency_overrides</code> after tests.</li>
  </ul>

  <h2 id="fa-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is FastAPI, and why would you choose it over Flask?</summary><div class="qa-body">FastAPI is a Python web framework that builds an API from type-hinted functions. The hints and Pydantic models give you input validation with detailed 422 errors, output filtering and OpenAPI documentation without writing that code yourself, and it supports <code>async</code> endpoints natively through ASGI. Flask is smaller and more flexible, and is fine for simple apps or server-rendered pages, but for JSON APIs and model serving FastAPI removes a lot of hand-written checking and keeps docs in sync with the code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are uvicorn, Starlette and Pydantic, and how do they relate to FastAPI?</summary><div class="qa-body">uvicorn is the ASGI server: it opens the port, speaks HTTP and hands requests to the app. Starlette is the lightweight ASGI framework FastAPI is built on; it provides routing, middleware, WebSockets and the test client. Pydantic does the data validation and serialization. FastAPI ties them together by reading your type hints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between WSGI and ASGI?</summary><div class="qa-body">WSGI is the older, synchronous standard used by Flask and Django: the server calls the app once per request and a worker thread is busy until the response is done. ASGI is the asynchronous successor: the app is an async callable, so one process can keep many connections open while they wait on I/O, and it also supports long-lived connections such as WebSockets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Python enforce type hints? How does FastAPI use them?</summary><div class="qa-body">No. Python ignores hints at runtime, so <code>line_total("120", 2)</code> happily returns <code>"120120"</code>. It does store them in <code>__annotations__</code>, and FastAPI reads them to decide where each parameter comes from, convert values to the right type, validate them, and describe them in the OpenAPI schema.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a Pydantic model, and what does a 422 response contain?</summary><div class="qa-body">A Pydantic model is a class inheriting from <code>BaseModel</code> whose typed fields describe a data shape; creating one validates and coerces the input and raises a <code>ValidationError</code> listing every failure. FastAPI turns that into a 422 response whose <code>detail</code> is a list with one entry per error, each having a <code>type</code>, a <code>loc</code> path such as <code>["body","items",1,"qty"]</code>, a human <code>msg</code>, the offending <code>input</code> and sometimes a <code>ctx</code> with the limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does FastAPI decide whether a parameter is a path, query, body or header parameter?</summary><div class="qa-body">If the name appears in the path template it is a path parameter. If its type is a Pydantic model it is read from the JSON body. If it is marked with <code>Header()</code> (or <code>Cookie()</code>) it comes from there. Any other simple type is a query parameter, which is required unless it has a default value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>response_model</code> do, and why use separate input and output models?</summary><div class="qa-body">It validates the endpoint's return value against a schema, drops any fields the schema does not list, and documents the response. Separate models protect both directions: the output model stops internal fields such as phone numbers leaking, and the input model lists only what clients may set, preventing mass assignment, where a client sends fields like <code>total</code> or <code>status</code> that the server should control.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dependency injection in FastAPI? Give some uses.</summary><div class="qa-body">An endpoint declares <code>param = Depends(fn)</code>, and FastAPI calls <code>fn</code> (resolving its own dependencies first) and passes the result in, instead of the endpoint doing the setup itself. Typical uses are a database session per request, the current user from a token, permission checks, settings, and shared pagination parameters. It removes duplicated code and makes testing easy, because a dependency can be swapped with <code>dependency_overrides</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens with a dependency that uses <code>yield</code>, if the endpoint raises an error?</summary><div class="qa-body">The code before <code>yield</code> runs before the endpoint and the yielded value is injected. The code after <code>yield</code>, normally in a <code>finally</code> block, still runs after the request ends, even if the endpoint or another dependency raised an exception. That makes it the right place to close database sessions or release locks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should an endpoint be <code>def</code> and when <code>async def</code>?</summary><div class="qa-body">Use <code>async def</code> only when every slow operation inside it is awaitable, such as <code>httpx.AsyncClient</code> or an async database driver. Use plain <code>def</code> when it calls blocking libraries like <code>requests</code> or <code>psycopg2</code>, or does CPU-heavy work like a model prediction; FastAPI runs <code>def</code> endpoints in a threadpool so they do not block the event loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ten requests arrive at once at an <code>async def</code> endpoint that calls <code>time.sleep(1)</code>, on one uvicorn worker. How long do they take, and why?</summary><div class="qa-body">About ten seconds. <code>time.sleep</code> blocks the single event-loop thread, so the requests are served one after another. With <code>await asyncio.sleep(1)</code>, or with the same code in a plain <code>def</code> endpoint (threadpool), all ten finish in about one second.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does async make a CPU-heavy model prediction faster?</summary><div class="qa-body">No. Async only helps while code is waiting on I/O, by letting other work run in the meantime. A prediction that keeps the CPU busy for 200 ms takes 200 ms either way, and inside <code>async def</code> it would also block every other request. Throughput for CPU work comes from multiple worker processes, batching or faster models.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>BackgroundTasks or Celery: how do you choose?</summary><div class="qa-body">BackgroundTasks run in the same process after the response is sent, with no persistence, retries or status, so they suit small work you could afford to lose, like a log entry. Celery (or another task queue) stores jobs in a broker such as Redis, runs them on separate workers and can retry them, so it suits work that must happen or takes long, such as receipts, payments or nightly re-scoring.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a WebSocket, and when would you use one instead of polling or Server-Sent Events?</summary><div class="qa-body">A WebSocket is an HTTP connection upgraded into a persistent, two-way channel where either side can send messages at any time. Use it for live two-way interaction such as chat, live order tracking or streaming tokens with user input. For one-way server-to-client updates, Server-Sent Events are simpler, and for rare updates polling may be enough. With several server copies you need a shared pub/sub channel so every copy sees each update.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are FastAPI's docs generated, and why do they stay accurate?</summary><div class="qa-body">FastAPI builds an OpenAPI document from the routes, type hints and Pydantic models and serves it at <code>/openapi.json</code>, with Swagger UI at <code>/docs</code> and ReDoc at <code>/redoc</code>. Because validation and documentation come from the same models, changing a limit like <code>Field(le=10)</code> changes both. Hand-raised errors need to be declared with <code>responses=</code> to appear.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>HTTPException</code>, an exception handler and middleware?</summary><div class="qa-body"><code>HTTPException</code> is raised inside an endpoint or dependency to return a specific status and detail. An exception handler maps your own exception class to a response, so business code can raise domain errors without knowing about HTTP. Middleware wraps every request and response, for cross-cutting work such as timing, request ids, logging or CORS headers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you serve a 2 GB model with FastAPI?</summary><div class="qa-body">Load it once in the <code>lifespan</code> function before <code>yield</code>, store it on <code>app.state</code> or a module-level dict, and release it after <code>yield</code>. Write the prediction endpoint as plain <code>def</code> (or use a threadpool) so it does not block the loop, validate input with a Pydantic model, return the model version, and add a <code>/ready</code> endpoint that returns 503 until loading finishes. Remember each worker process loads its own copy, which limits how many workers fit in memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a liveness check and a readiness check?</summary><div class="qa-body">Liveness (<code>/health</code>) answers "is the process alive?"; if it fails, the orchestrator restarts it. Readiness (<code>/ready</code>) answers "can it serve traffic right now?", for example whether the model is loaded and the database reachable; if it fails, the load balancer stops sending traffic but does not restart. Using one check for both can cause restart loops while a large model is still loading.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a FastAPI endpoint that requires authentication, without real credentials?</summary><div class="qa-body">Use <code>TestClient</code> and replace the authentication dependency: <code>app.dependency_overrides[current_user] = lambda: "test-user"</code>. Every endpoint that depends on <code>current_user</code> then receives the fake value. Clear the overrides afterwards, ideally in a fixture, and use <code>with TestClient(app)</code> if the test needs the lifespan to run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>TestClient(app)</code> without <code>with</code> sometimes fail with a missing model?</summary><div class="qa-body">The lifespan's startup and shutdown only run when the client is used as a context manager. Without <code>with</code>, nothing before <code>yield</code> runs, so anything loaded there, such as a model or connection pool, does not exist and endpoints that need it fail (in our app, with 503).</div></details>
</main>
`
});
