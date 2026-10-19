// notes/apis/api_auth.js — Authentication & Security
Object.assign(TOPIC_CONTENT, {
  "api_auth": `<main>
  <h1>Authentication &amp; Security</h1>
  <p class="lead">The day you put a <code>/predict</code> endpoint on the internet, strangers will call it: bots, scrapers, curious students, and people who want your data or your GPU time for free. This note teaches, from zero, how an API proves <em>who</em> is calling (API keys, sessions, JWTs, OAuth), decides <em>what</em> they may do, keeps passwords and traffic safe (hashing, HTTPS), and avoids the classic holes interviewers love to probe. Every code block was run. Builds on <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a> and <a class="xref" data-note="api_fastapi">FastAPI</a>.</p>

  <h2 id="aa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">API Auth &amp; Security</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">AuthN vs AuthZ</div>
        <ul>
          <li><b>Authentication</b> — who are you? fails → <b>401</b></li>
          <li><b>Authorization</b> — may you do this? fails → <b>403</b> (or 404 to hide)</li>
          <li><b>Order</b> — always AuthN first, then AuthZ, then the handler</li>
          <li>💡 society gate: guard checks your ID; the flat list decides which door</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">API keys &amp; sessions</div>
        <ul>
          <li><b>API key</b> — long random string in <code>X-API-Key</code>; identifies a <em>program</em></li>
          <li>Show once, store only its SHA-256, compare with <code>hmac.compare_digest</code></li>
          <li><b>Session</b> — random id in a cookie; the data stays in a server-side row</li>
          <li>Cookie flags: <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code></li>
          <li>Logout = delete the row → instant; needs a shared store (Redis)</li>
          <li>💡 temple shoe-stand token</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JWT</div>
        <ul>
          <li><b>Shape</b> — <code>header.payload.signature</code>, each base64url</li>
          <li><b>Signed, not encrypted</b> — anyone can read the payload</li>
          <li><b>HS256</b> one shared secret · <b>RS256/ES256</b> private signs, public verifies</li>
          <li><b>Claims</b> — sub, exp, iat, iss, aud, jti</li>
          <li><b>Access</b> ~15 min + <b>refresh</b> token (rotated, revocable by jti)</li>
          <li>💡 tamper-sealed festival wristband</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JWT traps</div>
        <ul>
          <li>⚠ <b>alg: none</b> — unsigned token; fix: <code>algorithms=["HS256"]</code></li>
          <li>⚠ <b>verify_signature False</b> — accepts a forged admin</li>
          <li>⚠ <b>Secrets/PII in payload</b> — readable by anyone</li>
          <li>⚠ <b>Alg confusion</b> — RSA public key used as HMAC secret; pin alg</li>
          <li>Tampered → <code>InvalidSignatureError</code>; old → <code>ExpiredSignatureError</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">OAuth 2.0</div>
        <ul>
          <li><b>Purpose</b> — an app acts for a user without seeing the password</li>
          <li><b>Roles</b> — user, client app, auth server, resource API</li>
          <li><b>Auth code + PKCE</b> — redirect → login → code → code + verifier → tokens</li>
          <li><b>PKCE</b> — challenge = SHA256(verifier); a stolen code is useless</li>
          <li><b>Client credentials</b> — machine to machine, no user</li>
          <li><b>OIDC</b> — adds an ID token: who the user is</li>
          <li>⚠ implicit &amp; password grants are deprecated</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">TLS &amp; passwords</div>
        <ul>
          <li><b>TLS</b> — encryption + integrity + server identity (CA-signed cert)</li>
          <li>curl rejects a self-signed cert (exit 60) unless you trust it</li>
          <li><b>Termination</b> at LB/nginx; mTLS inside if needed</li>
          <li><b>Passwords</b> — argon2id (memory-hard) or bcrypt; salted + slow</li>
          <li>⚠ SHA-256 for passwords: fast + unsalted → GPU cracking, rainbow tables</li>
          <li>Measured: SHA-256 ≈ 20 µs, bcrypt cost 12 ≈ 0.3 s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CORS &amp; limits</div>
        <ul>
          <li><b>Same-origin policy</b> — browser blocks JS reading another origin</li>
          <li><b>CORS</b> — the API lists origins the browser may let through</li>
          <li><b>Preflight</b> — OPTIONS + Origin → <code>Access-Control-Allow-*</code></li>
          <li>⚠ Not security: curl ignores it; no <code>*</code> with credentials</li>
          <li><b>Rate limit</b> login (brute force) and per key (cost, model extraction) → <b>429</b> + Retry-After</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">OWASP API risks</div>
        <ul>
          <li><b>BOLA (#1)</b> — change the id, see others' data; check ownership</li>
          <li><b>Broken auth</b>, <b>function-level authz</b> (admin routes)</li>
          <li><b>Property-level</b> — leaked fields, mass assignment → schemas</li>
          <li><b>Resource consumption</b>, <b>SSRF</b>, <b>injection</b></li>
          <li>ML: model extraction, huge inputs, prompt injection</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="aa-nz"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">AuthN vs AuthZ</span><span class="rm-sub">Who are you? What may you do?</span></div></div>
      <div class="rm-item rm-done" data-target="aa-keys"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">API Keys &amp; Sessions</span><span class="rm-sub">The two simplest schemes</span></div></div>
      <div class="rm-item rm-done" data-target="aa-jwt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">JWT</span><span class="rm-sub">Signed, readable, self-contained</span></div></div>
      <div class="rm-item rm-done" data-target="aa-jwttrap"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">JWT Traps</span><span class="rm-sub">Forgery, alg none, secrets in payload</span></div></div>
      <div class="rm-item rm-done" data-target="aa-oauth"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">OAuth 2.0</span><span class="rm-sub">Auth code + PKCE, client credentials</span></div></div>
      <div class="rm-item rm-done" data-target="aa-tls"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">HTTPS / TLS</span><span class="rm-sub">Encryption in plain words</span></div></div>
      <div class="rm-item rm-done" data-target="aa-hash"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Password Hashing</span><span class="rm-sub">bcrypt, argon2, never SHA</span></div></div>
      <div class="rm-item rm-done" data-target="aa-cors"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">CORS &amp; Rate Limits</span><span class="rm-sub">Browser rules, abuse control</span></div></div>
      <div class="rm-item rm-done" data-target="aa-owasp"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">OWASP API Top Risks</span><span class="rm-sub">What attackers actually do</span></div></div>
      <div class="rm-item rm-done" data-target="aa-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The bugs that cause real breaches</span></div></div>
      <div class="rm-item rm-done" data-target="aa-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <div class="callout intu"><span class="label">Why this note</span><p>An ML model behind an API is a product that costs money every time it runs. Without auth, anyone can drain your GPU budget, read other customers' predictions, or copy your model by calling it a million times. Data scientists who ship models are expected to know the basics here, and backend interviews almost always ask "401 vs 403?", "is a JWT encrypted?", "how do you store passwords?" and "what is CORS?". Each section uses only what came before it.</p></div>

  <h2 id="aa-nz"><span class="num">01</span>AuthN vs AuthZ</h2>
  <p>Start with the problem. You built a churn model and exposed two endpoints: <code>GET /reports</code> (read predictions) and <code>DELETE /models/churn_v3</code> (remove a model). Right now, anyone who knows the URL can call both. You need to answer two different questions for every request, and people mix them up all the time.</p>
  <p>The first question is <strong>"who are you?"</strong>. The caller must show some proof: a password, a key, a token. Checking that proof is called <strong>authentication</strong>, often shortened to <strong>AuthN</strong>. The second question is <strong>"are you allowed to do this?"</strong>. Knowing that the caller is Sara does not mean Sara may delete models. Checking permission is called <strong>authorization</strong>, or <strong>AuthZ</strong>. AuthZ always comes second, because you cannot check someone's permissions before you know who they are.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A gated housing society in Pune. The security guard at the gate checks your ID card and writes your name in the register: that is authentication. Then the guard looks at the list of who lives in which flat: you may go to flat B-204, but not to B-305 or the society office. That is authorization. A valid ID card does not open every door.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="aa-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="100" height="44" rx="6" class="fv sb"/><text x="60" y="57" text-anchor="middle">Request</text>
    <rect x="150" y="30" width="140" height="44" rx="6" class="fb sb"/><text x="220" y="50" text-anchor="middle">AuthN</text><text x="220" y="66" text-anchor="middle" class="tm" font-size="11">who are you?</text>
    <rect x="330" y="30" width="140" height="44" rx="6" class="ft st"/><text x="400" y="50" text-anchor="middle">AuthZ</text><text x="400" y="66" text-anchor="middle" class="tm" font-size="11">may you do this?</text>
    <rect x="510" y="30" width="80" height="44" rx="6" class="fg sg"/><text x="550" y="57" text-anchor="middle">Handler</text>
    <line x1="110" y1="52" x2="148" y2="52" stroke="currentColor" marker-end="url(#aa-a0)"/>
    <line x1="290" y1="52" x2="328" y2="52" stroke="currentColor" marker-end="url(#aa-a0)"/>
    <line x1="470" y1="52" x2="508" y2="52" stroke="currentColor" marker-end="url(#aa-a0)"/>
    <line x1="220" y1="74" x2="220" y2="108" stroke="currentColor" marker-end="url(#aa-a0)"/>
    <line x1="400" y1="74" x2="400" y2="108" stroke="currentColor" marker-end="url(#aa-a0)"/>
    <rect x="160" y="110" width="120" height="34" rx="6" class="fr sr"/><text x="220" y="132" text-anchor="middle">401</text>
    <rect x="340" y="110" width="120" height="34" rx="6" class="fr sr"/><text x="400" y="132" text-anchor="middle">403</text>
  </svg><figcaption>Every request passes two gates in this order. Failing the first gives 401, failing the second gives 403.</figcaption></figure>
  <p>Let us trace five requests through the two gates. Sara is an analyst; Ravi is an admin. Reading reports needs "analyst"; deleting a model needs "admin".</p>
  <table class="tbl out"><caption>Dry run: which gate stops each request</caption>
    <tr><th>Request</th><th>Token</th><th>Gate 1: AuthN</th><th>Gate 2: AuthZ</th><th>Result</th></tr>
    <tr><td>GET /reports</td><td>none</td><td>no proof → stop</td><td>–</td><td>401</td></tr>
    <tr><td>GET /reports</td><td>fake</td><td>unknown token → stop</td><td>–</td><td>401</td></tr>
    <tr><td>GET /reports</td><td>Sara's</td><td>it is Sara</td><td>analyst ≥ analyst</td><td>200</td></tr>
    <tr><td>DELETE /models/churn_v3</td><td>Sara's</td><td>it is Sara</td><td>analyst &lt; admin → stop</td><td>403</td></tr>
    <tr><td>DELETE /models/churn_v3</td><td>Ravi's</td><td>it is Ravi</td><td>admin ≥ admin</td><td>200</td></tr>
  </table>
  <p>The code below is the same logic in plain Python, no web framework yet. <code>handle</code> takes a method, a path and a token, and returns a status code with a message.</p>
  <div class="fx" data-lang="py">TOKENS = {"tok_sara": {"user": "sara", "role": "analyst"},
          "tok_ravi": {"user": "ravi", "role": "admin"}}
NEEDS_ROLE = {("GET", "/reports"): "analyst", ("DELETE", "/models/churn_v3"): "admin"}
RANK = {"analyst": 1, "admin": 2}                 # admin can do everything an analyst can

def handle(method, path, token):
    who = TOKENS.get(token)                       # step 1: authentication
    if who is None:
        return 401, "who are you?"
    needed = NEEDS_ROLE[(method, path)]           # step 2: authorization
    if RANK[who["role"]] &lt; RANK[needed]:
        return 403, f"{who['user']} is {who['role']}, needs {needed}"
    return 200, f"ok, {who['user']}"              # step 3: the real work

for req in [("GET", "/reports", None), ("GET", "/reports", "tok_fake"),
            ("GET", "/reports", "tok_sara"), ("DELETE", "/models/churn_v3", "tok_sara"),
            ("DELETE", "/models/churn_v3", "tok_ravi")]:
    print(req, "-&gt;", handle(*req))</div>
  <div class="fx" data-lang="text">('GET', '/reports', None) -&gt; (401, 'who are you?')
('GET', '/reports', 'tok_fake') -&gt; (401, 'who are you?')
('GET', '/reports', 'tok_sara') -&gt; (200, 'ok, sara')
('DELETE', '/models/churn_v3', 'tok_sara') -&gt; (403, 'sara is analyst, needs admin')
('DELETE', '/models/churn_v3', 'tok_ravi') -&gt; (200, 'ok, ravi')</div>
  <p>The output matches the dry-run table row for row. Look at the order inside <code>handle</code>: the <code>TOKENS.get</code> lookup (authentication) runs before <code>NEEDS_ROLE</code> is even read (authorization). <code>RANK</code> is a tiny form of <strong>role-based access control</strong> (RBAC): permissions are attached to roles, and users get roles. In section 02 the same two gates become FastAPI dependencies.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Authentication</strong>: verifying the identity of the caller. <strong>Authorization</strong>: deciding whether that identity may perform this action on this resource. A <strong>role</strong> is a named group of permissions (analyst, admin); a <strong>scope</strong> is a named permission inside a token (<code>reports:read</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>HTTP named 401 "Unauthorized", but it really means <em>unauthenticated</em>: "I don't know who you are". 403 "Forbidden" means "I know who you are, and the answer is no". Sending 403 for a missing token, or 401 for a missing role, is a classic interview slip.</p></div>

  <h2 id="aa-keys"><span class="num">02</span>API Keys &amp; Sessions</h2>
  <h3>API keys: a password for a program</h3>
  <p>Your nightly batch job needs to call <code>/batch/predictions</code>. There is no human to type a password, and the job runs every night for months. The simplest proof is a long random string that you give the job once, and the job sends on every request in a header such as <code>X-API-Key</code>. That string is an <strong>API key</strong>. It identifies a <em>program</em> or a customer account, not a person. OpenAI, Stripe and Google Maps all work this way.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A Delhi Metro smart card. The gate doesn't know your name; it only checks that the card is real and active. Lose the card and anyone can use it, so you block that card and get a new one. API keys work the same way: whoever holds the string <em>is</em> the caller, so they must be revocable.</p></div>
  <p>The safe recipe, step by step: (1) generate the key with a cryptographic random generator; (2) show it to the customer once; (3) store only a <strong>hash</strong> of it, so a database leak does not leak working keys; (4) on each request, hash what was sent and compare. A <strong>hash</strong> is a one-way function: easy to compute from the key, practically impossible to reverse.</p>
  <div class="fx" data-lang="py">import secrets, hashlib, hmac

# --- issuing a key (done once, when a customer clicks "create key") ---
raw_key = "sk_live_" + secrets.token_urlsafe(24)     # shown to the customer ONCE
stored = {                                           # what goes in your database
    "prefix": raw_key[:12],                          # lets you show "sk_live_ab12..." in the UI
    "sha256": hashlib.sha256(raw_key.encode()).hexdigest(),
    "owner": "batch-scoring-job",
}
print("give to customer:", len(raw_key), "chars, starts", raw_key[:8])
print("store in DB     :", list(stored), "hash length", len(stored["sha256"]))

# --- checking a key (done on every request) ---
def check_key(presented: str):
    digest = hashlib.sha256(presented.encode()).hexdigest()
    if hmac.compare_digest(digest, stored["sha256"]):   # constant-time compare
        return stored["owner"]
    return None

print("right key -&gt;", check_key(raw_key))
print("wrong key -&gt;", check_key("sk_live_guess"))</div>
  <div class="fx" data-lang="text">give to customer: 40 chars, starts sk_live_
store in DB     : ['prefix', 'sha256', 'owner'] hash length 64
right key -&gt; batch-scoring-job
wrong key -&gt; None</div>
  <p><code>secrets.token_urlsafe(24)</code> gives 24 random bytes (192 bits), far too many to guess. The database row holds only <code>sha256</code>, never <code>raw_key</code>. <code>check_key</code> hashes the presented key and compares with <code>hmac.compare_digest</code>, which takes the same time whether the first or last character is wrong. A plain <code>==</code> stops at the first mismatch, and over many requests that tiny time difference can leak how much of a guess is right (a <strong>timing attack</strong>). A fast hash like SHA-256 is fine here because the key is long and random; for human passwords it is not (section 07).</p>

  <h3>Sessions: log in once, carry a ticket</h3>
  <p>For humans in a browser, asking for the password on every click is impossible. Instead the user logs in once, the server creates a <strong>session</strong> (a row in a server-side store such as <code>{"user": "asha"}</code>), and gives the browser only a random <strong>session id</strong> inside a <strong>cookie</strong>. A cookie is a small value the browser stores and sends back automatically on every request to the same site.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The shoe stand outside a temple. You hand over your shoes and get a numbered metal token. The token itself is worthless; the shoes stay at the counter. When you lose the token, the counter can simply refuse it. Session id = token, session row = your shoes, logout = the counter giving the shoes back and cancelling the number.</p></div>
  <div class="fx" data-lang="py">import secrets
from fastapi import FastAPI, Cookie, HTTPException, Response
from fastapi.testclient import TestClient

SESSIONS = {}                       # in prod: Redis, so every server sees the same rows
app = FastAPI()

@app.post("/login")
def login(username: str, response: Response):
    sid = secrets.token_urlsafe(32)                  # random, unguessable id
    SESSIONS[sid] = {"user": username}               # the real data stays on the server
    response.set_cookie("sid", sid, httponly=True, secure=True, samesite="lax")
    return {"ok": True}

@app.get("/me")
def me(sid: str | None = Cookie(default=None)):
    if sid not in SESSIONS:
        raise HTTPException(401, "please log in")
    return SESSIONS[sid]

@app.post("/logout")
def logout(sid: str | None = Cookie(default=None)):
    SESSIONS.pop(sid, None)                          # delete the row: instantly logged out
    return {"ok": True}

c = TestClient(app, base_url="https://testserver")   # https so the secure cookie is sent
r = c.post("/login", params={"username": "asha"})
print("Set-Cookie:", r.headers["set-cookie"][:12] + "...;", "; ".join(r.headers["set-cookie"].split("; ")[1:]))
print("/me      -&gt;", c.get("/me").status_code, c.get("/me").json())
print("rows     -&gt;", len(SESSIONS))
c.post("/logout")
print("/me      -&gt;", c.get("/me").status_code, c.get("/me").json())</div>
  <div class="fx" data-lang="text">Set-Cookie: sid=t86bdqu6...; HttpOnly; Path=/; SameSite=lax; Secure
/me      -&gt; 200 {'user': 'asha'}
rows     -&gt; 1
/me      -&gt; 401 {'detail': 'please log in'}</div>
  <p><code>TestClient</code> acts like a browser: it stores the cookie from <code>/login</code> and sends it back to <code>/me</code>. After <code>/logout</code> deletes the row, the same cookie is useless at once. That instant revocation is the big strength of sessions. The cookie flags matter: <code>HttpOnly</code> hides the cookie from JavaScript (so an injected script cannot steal it), <code>Secure</code> sends it only over HTTPS, and <code>SameSite=lax</code> stops other sites from silently sending it in background requests (a defence against <strong>CSRF</strong>, cross-site request forgery).</p>

  <h3>All three schemes in one FastAPI server</h3>
  <p>Now a real server that uses an API key for the batch route, a bearer token (a JWT, explained fully in section 03) for humans, and a role check for the admin route. Each check is a FastAPI <strong>dependency</strong>: a function that runs before the handler and either returns the caller or raises an <code>HTTPException</code>. Run with <code>uvicorn app:app --port 8011</code>.</p>
  <div class="fx" data-lang="py">import hmac, time, jwt
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware

SECRET = "change-me-to-32+-random-bytes-in-prod"
API_KEYS = {"sk_live_9f2c7a": "batch-scoring-job"}   # demo; in prod store hashes in a DB

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["https://dashboard.shop.com"],
                   allow_methods=["GET", "POST"], allow_headers=["Authorization", "Content-Type"])

def api_key_auth(x_api_key: str = Header(default="")):
    for key, owner in API_KEYS.items():
        if hmac.compare_digest(x_api_key, key):      # constant-time compare
            return owner
    raise HTTPException(401, "invalid API key")

def current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "missing bearer token", headers={"WWW-Authenticate": "Bearer"})
    try:
        return jwt.decode(authorization[7:], SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:                            # bad signature, expired, garbage...
        raise HTTPException(401, "invalid or expired token")

def require_role(role: str):
    def check(user=Depends(current_user)):           # AuthN runs first, inside AuthZ
        if user.get("role") != role:
            raise HTTPException(403, "forbidden: needs role " + role)
        return user
    return check

@app.post("/login")
def login(username: str, password: str):          # demo only: check a bcrypt hash in real life
    role = "admin" if username == "ravi" else "analyst"
    exp = int(time.time()) + 900
    return {"access_token": jwt.encode({"sub": username, "role": role, "exp": exp}, SECRET, "HS256"),
            "token_type": "bearer"}

@app.get("/batch/predictions")
def batch(caller=Depends(api_key_auth)):
    return {"caller": caller}

@app.get("/reports")
def reports(user=Depends(current_user)):
    return {"hello": user["sub"]}

@app.delete("/models/{name}")
def delete_model(name: str, user=Depends(require_role("admin"))):
    return {"deleted": name, "by": user["sub"]}</div>
  <div class="fx" data-lang="text">$ curl localhost:8011/batch/predictions -H 'X-API-Key: sk_live_9f2c7a'   → 200 {"caller":"batch-scoring-job"}
$ curl localhost:8011/batch/predictions -H 'X-API-Key: guess'            → 401 {"detail":"invalid API key"}
$ TOKEN=... (POST /login?username=sara)   ADMIN=... (POST /login?username=ravi)
$ curl localhost:8011/reports -H "Authorization: Bearer $TOKEN"           → 200 {"hello":"sara"}
$ curl localhost:8011/reports                                            → 401 {"detail":"missing bearer token"}
$ curl -X DELETE localhost:8011/models/churn_v3 -H "...Bearer $TOKEN"     → 403 {"detail":"forbidden: needs role admin"}
$ curl -X DELETE localhost:8011/models/churn_v3 -H "...Bearer $ADMIN"     → 200 {"deleted":"churn_v3","by":"ravi"}
$ curl localhost:8011/reports -H 'Authorization: Bearer abc.def.ghi'      → 401 {"detail":"invalid or expired token"}</div>
  <p>Each line is a real call. <code>api_key_auth</code> guards the batch route; <code>current_user</code> turns a missing or broken token into 401; <code>require_role("admin")</code> wraps <code>current_user</code>, so Sara gets through gate 1 but stops at gate 2 with 403, exactly as in the section 01 table. The generic message "invalid or expired token" is deliberate: telling an attacker <em>why</em> a token failed helps them.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>API key</strong>: a long random secret that identifies a calling program. <strong>Session</strong>: server-side state for a logged-in user, found through a random <strong>session id</strong> stored in a cookie. <strong>Bearer token</strong>: any token sent as <code>Authorization: Bearer &lt;token&gt;</code>; "bearer" means whoever holds it is trusted.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Keys in Git, in frontend JavaScript, or in URLs (<code>?api_key=...</code> ends up in server logs and browser history). Keep keys in environment variables or a secrets manager, send them in headers, and store only hashes. Sessions kept in a Python dict break the moment you run two servers: the second one does not know the session (see Production Backend).</p></div>

  <h2 id="aa-jwt"><span class="num">03</span>JWT</h2>
  <p>Sessions need a lookup on every request: "which user owns session id t86b...?". With one server and Redis, that is cheap. Now picture ten microservices (predictions, reports, billing, feature store). Each would have to call the same session store on every request, and that store becomes a bottleneck and a single point of failure. It would be nicer if the token itself said who the user is, in a way nobody could fake.</p>
  <p>That is a <strong>JWT</strong> (JSON Web Token, said "jot"). The server writes the user's details into a small JSON object, then attaches a <strong>signature</strong>: a short code computed from the JSON and a secret key. Any service holding the key can recompute the signature and check that nothing was changed. No database lookup needed. The catch: the JSON is only encoded, not hidden. Anyone can read it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A festival wristband at Sunburn with a tamper-proof seal. Guards at every stage read it without calling the office (no lookup), and a broken seal means it is fake. But anyone can read what is printed on it, and you cannot cancel a band already on someone's wrist until the festival ends (expiry).</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <rect x="10" y="20" width="160" height="40" rx="6" class="fr sr"/><text x="90" y="45" text-anchor="middle">Header</text>
    <text x="180" y="45" font-size="22">.</text>
    <rect x="195" y="20" width="200" height="40" rx="6" class="fv sb"/><text x="295" y="45" text-anchor="middle">Payload (claims)</text>
    <text x="405" y="45" font-size="22">.</text>
    <rect x="420" y="20" width="170" height="40" rx="6" class="fb sb"/><text x="505" y="45" text-anchor="middle">Signature</text>
    <text x="90" y="82" text-anchor="middle" font-size="11" class="tm">{"alg":"HS256","typ":"JWT"}</text>
    <text x="295" y="82" text-anchor="middle" font-size="11" class="tm">{"sub":"user_42","exp":…}</text>
    <text x="505" y="82" text-anchor="middle" font-size="11" class="tm">HMAC-SHA256(h.p, secret)</text>
    <text x="90" y="106" text-anchor="middle" font-size="12">base64url</text>
    <text x="295" y="106" text-anchor="middle" font-size="12">base64url, NOT encrypted</text>
    <text x="505" y="106" text-anchor="middle" font-size="12" class="tb">proves no tampering</text>
    <text x="300" y="138" text-anchor="middle" font-size="12" class="tr">Anyone can read it. Only the key holder can make a valid one.</text>
  </svg><figcaption>A JWT is three base64url pieces joined by dots.</figcaption></figure>
  <p>How a token is built, step by step. <strong>base64url</strong> is a way to write any bytes using only letters, digits, <code>-</code> and <code>_</code>, so the result is safe inside URLs and headers. It is an encoding, like writing Hindi in Roman letters; anyone can convert it back.</p>
  <table class="tbl out"><caption>Building a JWT</caption>
    <tr><th>Step</th><th>Input</th><th>Output</th></tr>
    <tr><td>1</td><td><code>{"alg":"HS256","typ":"JWT"}</code></td><td>base64url → <code>eyJhbGciOi...</code></td></tr>
    <tr><td>2</td><td><code>{"sub":"user_42","role":"analyst","exp":1893456000}</code></td><td>base64url → <code>eyJzdWIiOi...</code></td></tr>
    <tr><td>3</td><td>"part1.part2" + secret key</td><td>HMAC-SHA256 → 32 bytes → base64url → <code>fGOZPucd...</code></td></tr>
    <tr><td>4</td><td>join with dots</td><td><code>part1.part2.part3</code></td></tr>
  </table>
  <p>The code builds a token with PyJWT, reads it <em>without</em> the key to prove it is not secret, then verifies it properly.</p>
  <div class="fx" data-lang="py">import jwt, base64, json, time

SECRET = "change-me-to-32+-random-bytes-in-prod"
token = jwt.encode({"sub": "user_42", "role": "analyst", "exp": 1893456000},
                   SECRET, algorithm="HS256")
print(token)

# 1) Anyone can READ the payload: it is only base64url-encoded, not encrypted
header_b64, payload_b64, sig_b64 = token.split(".")
pad = lambda s: s + "=" * (-len(s) % 4)          # base64 wants length % 4 == 0
print(json.loads(base64.urlsafe_b64decode(pad(header_b64))))
print(json.loads(base64.urlsafe_b64decode(pad(payload_b64))))

# 2) Verifying: signature + expiry checked, algorithm pinned
print(jwt.decode(token, SECRET, algorithms=["HS256"]))</div>
  <div class="fx" data-lang="text">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFuYWx5c3QiLCJleHAiOjE4OTM0NTYwMDB9.fGOZPucdzc9ZpGt6vcPrpNxkgq-9tmaGodE856ErayA
{'alg': 'HS256', 'typ': 'JWT'}
{'sub': 'user_42', 'role': 'analyst', 'exp': 1893456000}
{'sub': 'user_42', 'role': 'analyst', 'exp': 1893456000}</div>
  <p>The first line is the whole token: three parts separated by dots. Lines 2 and 3 were decoded with plain <code>base64</code>, no key at all, so treat the payload as public. <code>jwt.decode</code> did three checks: the signature matches, <code>exp</code> (expiry, in Unix seconds) is in the future, and the algorithm is one we allow.</p>
  <h3>One secret, or a key pair?</h3>
  <p><strong>HS256</strong> uses one shared secret to both sign and verify. Fine when one service does both. But if ten services must verify, all ten hold the secret, and any of them could also <em>issue</em> tokens. <strong>RS256</strong> (RSA) and <strong>ES256</strong> (elliptic curve) use a <strong>key pair</strong>: a private key that signs, kept only by the auth server, and a public key that only verifies, handed to everyone.</p>
  <p>In PyJWT the only change is the key: <code>jwt.encode(claims, private_key, algorithm="RS256")</code> on the auth server, and <code>jwt.decode(token, public_key_pem, algorithms=["RS256"])</code> everywhere else. A public key cannot sign, so a service that is hacked can still verify but cannot mint admin tokens. This is how "Sign in with Google" works: Google publishes its public keys at a URL (a <strong>JWKS</strong>, JSON Web Key Set), and your API verifies Google's tokens without ever holding Google's secret.</p>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Signs with</th><th>Verifies with</th><th>When</th></tr>
    <tr><td><code>HS256</code></td><td>Shared secret</td><td>Same secret</td><td>One service issues and checks</td></tr>
    <tr><td><code>RS256</code> / <code>ES256</code></td><td>Private key</td><td>Public key</td><td>Many services verify; only the auth server can issue</td></tr>
  </table>
  <h3>Claims, and why tokens expire fast</h3>
  <p>The fields in the payload are called <strong>claims</strong>. Standard ones: <code>sub</code> (subject: who), <code>exp</code> (expiry), <code>iat</code> (issued at), <code>iss</code> (issuer: who made it), <code>aud</code> (audience: which API it is for), <code>jti</code> (a unique token id). Because a JWT cannot be cancelled once issued, the access token lives briefly (about 15 minutes) and a longer-lived <strong>refresh token</strong> is used to get new ones. The server keeps a list of refresh token ids, so logout can cancel those.</p>
  <div class="fx" data-lang="py">import time, uuid, jwt

SECRET = "change-me-to-32+-random-bytes-in-prod"
VALID_REFRESH = set()                  # jti of refresh tokens still allowed (Redis/DB in prod)

def issue(user: str):
    now = int(time.time())
    jti = uuid.uuid4().hex             # unique id for this refresh token
    VALID_REFRESH.add(jti)
    access = jwt.encode({"sub": user, "type": "access", "exp": now + 15 * 60}, SECRET, "HS256")
    refresh = jwt.encode({"sub": user, "type": "refresh", "jti": jti, "exp": now + 7 * 86400},
                         SECRET, "HS256")
    return access, refresh

def refresh_access(refresh_token: str):
    claims = jwt.decode(refresh_token, SECRET, algorithms=["HS256"])
    if claims["type"] != "refresh" or claims["jti"] not in VALID_REFRESH:
        raise PermissionError("refresh token revoked")
    VALID_REFRESH.discard(claims["jti"])          # rotate: each refresh token works once
    return issue(claims["sub"])

def logout(refresh_token: str):
    claims = jwt.decode(refresh_token, SECRET, algorithms=["HS256"])
    VALID_REFRESH.discard(claims["jti"])

access, refresh = issue("asha")
print("access lives :", jwt.decode(access, SECRET, algorithms=["HS256"])["exp"] - int(time.time()), "s")
access2, refresh2 = refresh_access(refresh)
print("refreshed    : new pair issued, valid refresh ids =", len(VALID_REFRESH))
try:
    refresh_access(refresh)                       # replaying the old one
except PermissionError as e:
    print("old refresh  :", e)
logout(refresh2)
try:
    refresh_access(refresh2)
except PermissionError as e:
    print("after logout :", e)</div>
  <div class="fx" data-lang="text">access lives : 900 s
refreshed    : new pair issued, valid refresh ids = 1
old refresh  : refresh token revoked
after logout : refresh token revoked</div>
  <p><code>issue</code> makes a 900-second access token and a 7-day refresh token whose <code>jti</code> goes into <code>VALID_REFRESH</code>. <code>refresh_access</code> removes the old id before issuing a new pair (<strong>rotation</strong>), so a stolen refresh token that is replayed gets refused. <code>logout</code> removes the id, so the user can get no new access tokens; the current access token still works for at most 15 minutes.</p>
  <table class="tbl">
    <tr><th></th><th>Server session</th><th>JWT</th></tr>
    <tr><td>State</td><td>Stored server-side (Redis/DB)</td><td>Inside the token</td></tr>
    <tr><td>Each request</td><td>Lookup by session id</td><td>Verify signature, no lookup</td></tr>
    <tr><td>Logout / revoke</td><td>Delete the row: instant</td><td>Hard: valid until <code>exp</code> (short expiry, refresh rotation, jti denylist)</td></tr>
    <tr><td>Scaling</td><td>Shared session store needed</td><td>Any server with the key can verify</td></tr>
    <tr><td>Best for</td><td>One web app with a browser</td><td>Mobile apps, SPAs, many microservices</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>JWT</strong>: a compact token of the form <code>base64url(header).base64url(payload).base64url(signature)</code>, where the signature proves the header and payload were made by a key holder and not changed. <strong>Claims</strong>: the key-value facts inside the payload. <strong>Refresh token</strong>: a longer-lived token used only to obtain new access tokens.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"JWT is encrypted" is the most common wrong answer. It is <em>signed</em>: tamper-proof but readable. If you need the content hidden, use JWE (encrypted JWT) or keep the data server-side.</p></div>

  <h2 id="aa-jwttrap"><span class="num">04</span>JWT Traps</h2>
  <p>A JWT is only as safe as the code that checks it. The library does the hard maths; the bugs come from how people call it. Attackers know this, so they try a small set of tricks on every JWT-based API. Here is each trick against PyJWT, using the token from section 03. Read the output first, then the code.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Back to the festival wristband. Trick 1: cut out the "VIP" printing from another band and stick it on yours (tampering: the seal breaks). Trick 2: wear last year's band (expiry). Trick 3: show a band that says "no seal needed" and hope the guard believes the band instead of the rulebook (the <code>alg: none</code> attack). Trick 4: find a guard who doesn't check seals at all (skipping verification).</p></div>
  <div class="fx" data-lang="py">import jwt, base64, json, time

SECRET = "change-me-to-32+-random-bytes-in-prod"
token = jwt.encode({"sub": "user_42", "role": "analyst", "exp": 1893456000},
                   SECRET, algorithm="HS256")
header_b64, payload_b64, sig_b64 = token.split(".")

# 1) Tampering: change role to admin, keep the old signature
evil_payload = base64.urlsafe_b64encode(json.dumps(
    {"sub": "user_42", "role": "admin", "exp": 1893456000}).encode()).rstrip(b"=").decode()
forged = f"{header_b64}.{evil_payload}.{sig_b64}"
try:
    jwt.decode(forged, SECRET, algorithms=["HS256"])
except jwt.InvalidSignatureError as e:
    print("Forged:", type(e).__name__, "-", e)

# 2) Expired token
old = jwt.encode({"sub": "user_42", "exp": int(time.time()) - 10}, SECRET, algorithm="HS256")
try:
    jwt.decode(old, SECRET, algorithms=["HS256"])
except jwt.ExpiredSignatureError as e:
    print("Old:", type(e).__name__, "-", e)

# 3) The 'none' algorithm attack: unsigned token claiming admin
none_tok = jwt.encode({"sub": "user_42", "role": "admin"}, None, algorithm="none")
print(none_tok)
try:
    jwt.decode(none_tok, SECRET, algorithms=["HS256"])
except jwt.InvalidAlgorithmError as e:
    print("none alg:", type(e).__name__, "-", e)

# 4) The BUG that lets it through: skipping verification
print("UNSAFE:", jwt.decode(none_tok, options={"verify_signature": False}))</div>
  <div class="fx" data-lang="text">Forged: InvalidSignatureError - Signature verification failed
Old: ExpiredSignatureError - Signature has expired
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIn0.
none alg: InvalidAlgorithmError - The specified alg value is not allowed
UNSAFE: {'sub': 'user_42', 'role': 'admin'}</div>
  <table class="tbl out"><caption>What happened to each attack</caption>
    <tr><th>#</th><th>Attack</th><th>What the attacker changed</th><th>Why it failed (or not)</th></tr>
    <tr><td>1</td><td>Tamper</td><td><code>role</code> → admin, old signature kept</td><td>Signature was computed over the old payload → mismatch</td></tr>
    <tr><td>2</td><td>Replay old token</td><td>nothing; <code>exp</code> is in the past</td><td>PyJWT checks <code>exp</code> automatically</td></tr>
    <tr><td>3</td><td><code>alg: none</code></td><td>header says "no signature"; third part empty</td><td><code>algorithms=["HS256"]</code> rejects "none"</td></tr>
    <tr><td>4</td><td>Same token, lazy server</td><td>nothing</td><td><code>verify_signature: False</code> trusts anything → admin!</td></tr>
  </table>
  <p>Look at line 3 of the output: the <code>none</code> token ends in a dot with nothing after it, because there is no signature. Old JWT libraries read the <code>alg</code> field from the token header and obeyed it, so this token passed. The defence is the <code>algorithms=[...]</code> argument: <em>you</em> decide which algorithm is acceptable, not the token. Case 4 is the same hole made by hand. Developers sometimes add <code>verify_signature: False</code> "just to debug" and ship it.</p>
  <div class="callout trap"><span class="label">Trap: secrets in the payload</span><p>The payload is only encoded. Putting a password, an API key, an Aadhaar number or any PII in it publishes that data to anyone who sees the token (logs, browser storage, proxies). Put only ids and roles there.</p></div>
  <div class="callout trap"><span class="label">Trap: algorithm confusion</span><p>Server uses RS256. Its public key is, well, public. An attacker makes a token with header <code>"alg":"HS256"</code> and signs it with HMAC using that public key as the "secret". A server that reads <code>alg</code> from the token and calls <code>verify(token, public_key)</code> will check HMAC with the same public key, and it matches. Pinning <code>algorithms=["RS256"]</code> closes this. Modern PyJWT also refuses to use a PEM public key as an HMAC secret.</p></div>
  <div class="callout trap"><span class="label">Trap: no audience check</span><p>A token issued for your reports API is accepted by your billing API because both trust the same issuer. Set <code>aud</code> when issuing and pass <code>audience="billing"</code> when decoding, so a token only works where it was meant to.</p></div>
  <p>Interviewers often hand you a decode line and ask what is wrong. The safe pattern is always: <code>jwt.decode(token, key, algorithms=[exact_alg], audience=..., issuer=...)</code>, inside a <code>try</code> that returns 401 on any <code>PyJWTError</code>.</p>

  <h2 id="aa-oauth"><span class="num">05</span>OAuth 2.0</h2>
  <p>A familiar situation: a resume-builder website offers "Import your files from Google Drive". In the bad old days, the site would ask for your Gmail password. Then it could read your email, change your password, and you could never take that power back without changing your password everywhere. You want something narrower: "this site may <em>read</em> Drive files, for a while, and I can cancel it anytime".</p>
  <p><strong>OAuth 2.0</strong> is the standard for exactly that. You type your password only on Google's own page. Google then gives the website a limited <strong>access token</strong> with specific <strong>scopes</strong> (permissions such as <code>drive.readonly</code>). The website never sees your password. Four parties take part: the <strong>user</strong> (resource owner), the <strong>client</strong> (the website or app), the <strong>authorization server</strong> (Google's login service, which issues tokens), and the <strong>resource server</strong> (the Drive API, which accepts tokens).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hotel key card. Reception (authorization server) checks your passport once and issues a card that opens only your room and the gym (scopes), only until checkout (expiry). The room door (resource server) never sees your passport, and reception can cancel the card any time.</p></div>
  <h3>Authorization code + PKCE (users, web apps, SPAs, mobile)</h3>
  <figure class="viz"><svg viewBox="0 0 600 260" width="600">
    <defs><marker id="aa-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="5" width="110" height="28" rx="6" class="fv sb"/><text x="60" y="24" text-anchor="middle">User</text>
    <rect x="160" y="5" width="110" height="28" rx="6" class="fb sb"/><text x="215" y="24" text-anchor="middle">Your app</text>
    <rect x="315" y="5" width="130" height="28" rx="6" class="ft st"/><text x="380" y="24" text-anchor="middle">Auth server</text>
    <rect x="490" y="5" width="105" height="28" rx="6" class="fg sg"/><text x="542" y="24" text-anchor="middle">API</text>
    <line x1="60" y1="33" x2="60" y2="255" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="215" y1="33" x2="215" y2="255" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="380" y1="33" x2="380" y2="255" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="542" y1="33" x2="542" y2="255" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="215" y1="60" x2="378" y2="60" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="297" y="54" text-anchor="middle" font-size="11">1 redirect + code_challenge</text>
    <line x1="60" y1="95" x2="378" y2="95" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="220" y="89" text-anchor="middle" font-size="11">2 user logs in &amp; consents (on auth server)</text>
    <line x1="380" y1="130" x2="217" y2="130" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="297" y="124" text-anchor="middle" font-size="11">3 one-time code</text>
    <line x1="215" y1="165" x2="378" y2="165" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="297" y="159" text-anchor="middle" font-size="11" class="tb">4 code + code_verifier</text>
    <line x1="380" y1="200" x2="217" y2="200" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="297" y="194" text-anchor="middle" font-size="11" class="tg">5 access + refresh token</text>
    <line x1="215" y1="240" x2="540" y2="240" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="378" y="234" text-anchor="middle" font-size="11">6 Authorization: Bearer token</text>
  </svg><figcaption>The password only ever goes to the auth server. The app gets a short-lived code, then trades it for tokens.</figcaption></figure>
  <ol>
    <li>Your app redirects the browser to Google's login page, saying which scopes it wants and including a <code>code_challenge</code> (explained below).</li>
    <li>The user logs in <em>on Google's page</em> and clicks "Allow".</li>
    <li>Google redirects back to your app with a one-time <strong>authorization code</strong> in the URL. A code is not a token; alone it opens nothing.</li>
    <li>Your app's backend sends the code plus the <code>code_verifier</code> directly to Google.</li>
    <li>Google checks them and returns an access token (and usually a refresh token).</li>
    <li>Your app calls the Drive API with <code>Authorization: Bearer &lt;token&gt;</code>.</li>
  </ol>
  <p>Why the extra step with a code? URLs leak (browser history, logs, malicious apps on a phone that register the same redirect link). <strong>PKCE</strong> (Proof Key for Code Exchange, said "pixy") makes a stolen code worthless. The app invents a random secret, the <strong>verifier</strong>, and sends only its SHA-256 hash, the <strong>challenge</strong>, in step 1. In step 4 it sends the raw verifier. The server hashes it and compares. A thief who grabbed the code in step 3 never saw the verifier, and cannot work it out from the hash.</p>
  <div class="fx" data-lang="py">import secrets, hashlib, base64

def s256(verifier: str) -&gt; str:
    digest = hashlib.sha256(verifier.encode()).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode()

# Step 1 (app): make a secret verifier, send only its hash
verifier = secrets.token_urlsafe(48)                    # kept inside the app
challenge = s256(verifier)
print("code_verifier :", verifier[:20] + "...", len(verifier), "chars")
print("code_challenge:", challenge[:20] + "...", "(sent in step 1, method=S256)")

# Step 4 (auth server): the code arrives with a verifier; hash it and compare
def redeem(code_verifier: str) -&gt; str:
    return "tokens issued" if s256(code_verifier) == challenge else "invalid_grant"

print("real app  :", redeem(verifier))
print("code thief:", redeem(secrets.token_urlsafe(48)))   # has the code, not the verifier</div>
  <div class="fx" data-lang="text">code_verifier : D7khpo1nAPm0v761cGH0... 64 chars
code_challenge: mcFV34Oi7jT39J8PYiqb... (sent in step 1, method=S256)
real app  : tokens issued
code thief: invalid_grant</div>
  <p><code>s256</code> is exactly the transform the standard names "S256": SHA-256, then base64url without padding. <code>redeem</code> plays the auth server: only the holder of the original <code>verifier</code> gets tokens. The random strings change on every run; the two last lines do not.</p>
  <h3>Client credentials (machine to machine)</h3>
  <p>A nightly retraining job calls your feature-store API. No human, no browser. The job sends its own <code>client_id</code> and <code>client_secret</code> straight to the token endpoint and gets back a short-lived access token with narrow scopes.</p>
  <div class="fx" data-lang="text">$ curl -X POST https://auth.shop.com/oauth/token &#92;
    -d grant_type=client_credentials -d client_id=retrain-job &#92;
    -d client_secret="$CLIENT_SECRET" -d scope=features:read
# example output (shape defined by RFC 6749):
{"access_token":"eyJhbGciOiJSUzI1NiIs...","token_type":"Bearer","expires_in":3600,"scope":"features:read"}</div>
  <p>Compared to a plain API key, the secret is sent only to the auth server (not to every API), and the token that travels around expires in an hour.</p>
  <p><strong>OpenID Connect</strong> (OIDC) is a thin layer on top of OAuth. OAuth answers "may this app access the API?"; OIDC adds an <strong>ID token</strong> (a JWT) that says who the user is: name, email, a stable user id. "Sign in with Google" is OIDC.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>OAuth 2.0</strong>: a framework that lets a client get limited, revocable access to a resource on behalf of a user (or itself), via tokens issued by an authorization server. A <strong>grant</strong> (flow) is one way of getting a token: authorization code (+PKCE), client credentials, refresh token, device code.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>OAuth is about <em>authorization</em> (access), not login; use OIDC for login. The old <em>implicit</em> flow (token returned in the URL) and the <em>password</em> grant (app collects the user's password) are deprecated. Browser and mobile apps should use auth code + PKCE.</p></div>

  <h2 id="aa-tls"><span class="num">06</span>HTTPS / TLS</h2>
  <p>Everything so far sends secrets over the network: API keys, cookies, bearer tokens, passwords. Now imagine calling your API from the free Wi-Fi at a railway station. On plain HTTP, every byte travels as readable text, and anyone on the same network (or any router on the path) can copy your token and become you. They can even change the response.</p>
  <p><strong>HTTPS</strong> is HTTP sent inside a <strong>TLS</strong> (Transport Layer Security) connection. TLS gives three things. <strong>Encryption</strong>: eavesdroppers see gibberish. <strong>Integrity</strong>: any changed byte is detected. <strong>Server authentication</strong>: you are really talking to <code>api.shop.com</code>, not an impostor. The third one comes from a <strong>certificate</strong>: a file that says "this public key belongs to api.shop.com", signed by a <strong>Certificate Authority</strong> (CA) such as Let's Encrypt, which your OS and browser already trust.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Sending cash through a courier. HTTP is a postcard: anyone handling it can read and edit it. HTTPS is a sealed, tamper-evident envelope, handed over only after you check the courier's ID badge, and the badge was issued by a government office you already trust (the CA).</p></div>
  <div class="flow"><span>Client hello</span><span>Server sends certificate</span><span>Client checks it against trusted CAs</span><span>Both derive a shared session key</span><span>Encrypted HTTP</span></div>
  <p>To see the "check the badge" step, we made our own certificate with <code>openssl</code> (a <strong>self-signed</strong> certificate: the server vouches for itself, no CA) and ran the FastAPI app with TLS.</p>
  <div class="fx" data-lang="text">$ openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 30 &#92;
    -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost"
$ uvicorn hello:app --port 8443 --ssl-keyfile key.pem --ssl-certfile cert.pem

$ curl https://localhost:8443/ping
curl: (60) SSL certificate problem: self-signed certificate

$ curl --cacert cert.pem https://localhost:8443/ping
{"pong":true}

$ curl -v --cacert cert.pem https://localhost:8443/ping 2&gt;&amp;1 | grep -E "SSL connection|subject|issuer|verify ok"
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / RSASSA-PSS
*  subject: CN=localhost
*  issuer: CN=localhost
*  SSL certificate verify ok.

$ curl http://localhost:8443/ping
curl: (52) Empty reply from server</div>
  <p>The first curl refused to talk: the certificate was not signed by any CA it trusts, so the identity check failed (exit code 60). With <code>--cacert cert.pem</code> we told curl to trust our certificate, and the call worked. The verbose line shows TLS 1.3 and the cipher. <code>subject</code> equals <code>issuer</code>, which is what "self-signed" means. The last call spoke plain HTTP to a TLS port and got nothing back. In production you would use a free Let's Encrypt certificate instead, and no client flag is needed.</p>
  <p>In real deployments, TLS usually ends at the load balancer or nginx (<strong>TLS termination</strong>): it decrypts, then forwards plain HTTP to the app inside a private network. Strict setups re-encrypt inside too, often with <strong>mTLS</strong> (mutual TLS), where the client also shows a certificate, so services prove identity to each other.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>TLS</strong>: the protocol that gives a connection confidentiality, integrity and server authentication. <strong>Certificate</strong>: a CA-signed statement binding a domain name to a public key. <strong>HTTPS</strong>: HTTP over TLS, port 443 by default.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Bearer tokens, API keys and Basic auth over plain HTTP are sent in clear text: HTTPS is mandatory, not optional. And never ship <code>requests.get(url, verify=False)</code> or <code>curl -k</code> to "fix" a certificate error. That turns off the identity check, so anyone in the middle can pretend to be the server.</p></div>

  <h2 id="aa-hash"><span class="num">07</span>Password Hashing</h2>
  <p>Databases leak. It happens to large companies every year, through a backup left public, a SQL injection, or a stolen laptop. So design for the day your <code>users</code> table is on a hacker forum. If passwords are stored as plain text, every account is gone, and because people reuse passwords, their email and bank accounts are at risk too.</p>
  <p>The fix is to never store the password at all. Store a <strong>hash</strong>, the output of a one-way function. At login, hash what the user typed and compare. But not every hash is fit for this. SHA-256 is designed to be <em>fast</em>, which here is a weakness: an attacker with the leaked hashes can try billions of guesses per second on a GPU. And without a <strong>salt</strong> (random bytes mixed in per user), the same password always gives the same hash, so precomputed lookup tables (<strong>rainbow tables</strong>) crack common passwords instantly.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A lock on your house that takes 3 seconds to open with the right key. For you, 3 seconds once a day is nothing. For a thief trying 10,000 keys, it is more than 8 hours on your doorstep. Password hashing algorithms are deliberately slow locks.</p></div>
  <div class="fx" data-lang="py">import hashlib, time, bcrypt
from argon2 import PasswordHasher

pw = b"hunter2"
print("sha256 :", hashlib.sha256(pw).hexdigest()[:20], "... same every time")
print("sha256 :", hashlib.sha256(pw).hexdigest()[:20], "... same every time")

h1 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
h2 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
print("bcrypt 1:", h1.decode())
print("bcrypt 2:", h2.decode())          # different salt -&gt; different hash
print("check right:", bcrypt.checkpw(pw, h1), "| check wrong:", bcrypt.checkpw(b"hunter3", h1))

t = time.perf_counter(); hashlib.sha256(pw).digest(); fast = time.perf_counter() - t
t = time.perf_counter(); bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12)); slow = time.perf_counter() - t
print(f"sha256: {fast*1e6:.1f} us   bcrypt(12): {slow*1e3:.0f} ms")

ph = PasswordHasher()                      # argon2id, memory-hard
h = ph.hash("hunter2")
print("argon2:", h)
print("verify:", ph.verify(h, "hunter2"))</div>
  <div class="fx" data-lang="text">sha256 : f52fbd32b2b3b86ff88e ... same every time
sha256 : f52fbd32b2b3b86ff88e ... same every time
bcrypt 1: $2b$12$8EwfUYDGQ.4DM1zxo1bqTeqcii3dyUlZISg.90ekBDPpz1D6fyune
bcrypt 2: $2b$12$5.DXwqu6KTERoiBArB6/6eVen35dOxH5jRLbZ9wNvd9KcujJExfEO
check right: True | check wrong: False
sha256: 19.8 us   bcrypt(12): 327 ms
argon2: $argon2id$v=19$m=65536,t=3,p=4$euvZV6aIgEvarffvo+suKw$2sPhU3or4cpypuq5V6BCOMDLR1gojtMl3mkXowS1gCk
verify: True</div>
  <p>SHA-256 printed the same value twice: identical passwords give identical hashes. The two bcrypt hashes of the <em>same</em> password differ, because <code>gensalt</code> picked a new salt each time. Read a bcrypt string like this: <code>$2b$</code> is the version, <code>12$</code> is the cost (2<sup>12</sup> rounds), the next 22 characters are the salt, the rest is the hash. The salt is stored inside, so <code>checkpw</code> can redo the work. The timing line is the point: about 20 microseconds versus about a third of a second. The argon2 string records its own settings too: <code>m=65536</code> KB of memory, <code>t=3</code> passes, <code>p=4</code> threads.</p>
  <table class="tbl out"><caption>Rough attacker cost for a 10-billion-guess wordlist against one leaked hash</caption>
    <tr><th>Stored as</th><th>Guesses per second</th><th>Time to try all</th></tr>
    <tr><td>SHA-256 (one GPU)</td><td>~ 10<sup>10</sup></td><td>about 1 second</td></tr>
    <tr><td>bcrypt cost 12 (one CPU core, our 0.33 s)</td><td>~ 3</td><td>about 100 years</td></tr>
  </table>
  <p>Real attackers use many machines, but the gap of roughly nine zeros stays. That is why a slow, salted hash turns a leak from "everyone exposed today" into "only the weakest passwords, slowly". <strong>argon2id</strong> is also <strong>memory-hard</strong>: each guess needs 64 MB of RAM, which GPUs and custom chips cannot provide cheaply for thousands of parallel guesses. It is the first choice for new systems; bcrypt is still fine.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Password hashing function</strong>: a deliberately slow, salted one-way function (bcrypt, scrypt, argon2id, PBKDF2) with a tunable cost. <strong>Salt</strong>: random bytes, unique per password, stored with the hash. <strong>Cost factor</strong>: how much work each hash takes; raise it as hardware gets faster.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Encrypting" passwords (reversible, so whoever has the key has every password), hashing with SHA-256 or MD5, or adding one global salt for everyone. Also: bcrypt only uses the first 72 bytes of a password. Use a library's <code>hash</code>/<code>verify</code> pair and never write your own.</p></div>

  <h2 id="aa-cors"><span class="num">08</span>CORS &amp; Rate Limits</h2>
  <h3>CORS: the browser's rule, not yours</h3>
  <p>Your React dashboard at <code>https://dashboard.shop.com</code> calls your API at <code>https://api.shop.com</code>. It fails in the browser with a red "CORS error", while the same URL works fine in curl. Confusing, until you know why browsers block it.</p>
  <p>You are logged in to your bank in one tab. In another tab you open a random site. If that site's JavaScript could call your bank's API and read the answer, using your logged-in cookies, it could read your balance. So browsers enforce the <strong>same-origin policy</strong>: JavaScript from one <strong>origin</strong> (scheme + host + port, e.g. <code>https://dashboard.shop.com</code>) may not read responses from another origin. <strong>CORS</strong> (Cross-Origin Resource Sharing) is how an API says "these specific other origins are allowed". For anything other than simple requests, the browser first sends a <strong>preflight</strong>: an <code>OPTIONS</code> request asking "may this origin use this method and these headers?".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The watchman of an apartment building (the browser) calls the flat (the API) before letting a visitor up: "Someone from dashboard.shop.com is here, shall I send them?". The flat answers yes or no. But a thief who climbs the back wall (curl, a Python script) never meets the watchman. So the watchman protects the residents' guests, not the flat itself.</p></div>
  <p>Our section 02 server allows only <code>https://dashboard.shop.com</code>. Three real calls:</p>
  <div class="fx" data-lang="text">$ curl -i -X OPTIONS localhost:8011/reports -H 'Origin: https://dashboard.shop.com' &#92;
       -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: Authorization'
HTTP/1.1 200 OK
vary: Origin
access-control-allow-methods: GET, POST
access-control-max-age: 600
access-control-allow-headers: Accept, Accept-Language, Authorization, Content-Language, Content-Type
access-control-allow-origin: https://dashboard.shop.com

$ curl -i -X OPTIONS localhost:8011/reports -H 'Origin: https://evil.example' -H 'Access-Control-Request-Method: GET'
HTTP/1.1 400 Bad Request
Disallowed CORS origin

$ curl -i localhost:8011/reports -H 'Origin: https://evil.example' -H "Authorization: Bearer $TOKEN"
HTTP/1.1 200 OK
{"hello":"sara"}</div>
  <p>Call 1 is the preflight a browser would send for the dashboard: the answer carries <code>access-control-allow-origin</code> naming the dashboard, so the browser goes ahead (and caches the answer for <code>max-age</code> 600 s). Call 2 is the preflight from an unknown site: rejected, so a browser would never send the real request. Call 3 is the lesson: the actual GET from "evil.example" with a valid token still returns 200 and the data. Only the missing <code>access-control-allow-origin</code> header would make a <em>browser</em> hide the answer from the page's JavaScript. Your token check is what protects the data.</p>
  <h3>Rate limiting for security</h3>
  <p>A login form with no limit lets a bot try the 10,000 most common passwords against every account (<strong>brute force</strong>), or replay email/password pairs leaked from other sites (<strong>credential stuffing</strong>). The fix: count failed attempts per account (and per IP) in a time window, and answer <strong>429 Too Many Requests</strong> with a <code>Retry-After</code> header once the count is too high.</p>
  <div class="fx" data-lang="py">import time
from collections import defaultdict
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

MAX_TRIES, WINDOW_S = 5, 60
failures = defaultdict(list)            # username -&gt; times of recent failed logins (Redis in prod)

app = FastAPI()

@app.post("/login")
def login(username: str, password: str):
    now = time.time()
    recent = [t for t in failures[username] if now - t &lt; WINDOW_S]
    failures[username] = recent
    if len(recent) &gt;= MAX_TRIES:
        raise HTTPException(429, "too many attempts, try later",
                            headers={"Retry-After": str(int(WINDOW_S - (now - recent[0])) + 1)})
    if password != "correct-horse":     # stand-in for bcrypt.checkpw
        failures[username].append(now)
        raise HTTPException(401, "wrong username or password")
    failures.pop(username, None)
    return {"ok": True}

c = TestClient(app)
for guess in ["123456", "password", "qwerty", "asha@123", "iloveyou", "letmein", "correct-horse"]:
    r = c.post("/login", params={"username": "asha", "password": guess})
    print(f"{guess:14} -&gt; {r.status_code} {r.json()['detail'] if r.status_code != 200 else r.json()}",
          r.headers.get("retry-after", ""))</div>
  <div class="fx" data-lang="text">123456         -&gt; 401 wrong username or password
password       -&gt; 401 wrong username or password
qwerty         -&gt; 401 wrong username or password
asha@123       -&gt; 401 wrong username or password
iloveyou       -&gt; 401 wrong username or password
letmein        -&gt; 429 too many attempts, try later 60
correct-horse  -&gt; 429 too many attempts, try later 60</div>
  <p>The first five wrong guesses each add a timestamp to <code>failures["asha"]</code>. The sixth request finds five recent failures and is refused <em>before</em> the password is even checked, so even the correct password waits 60 seconds. That is what makes guessing hopeless. The message "wrong username or password" is the same either way, so an attacker cannot learn which usernames exist. For API keys, the same idea per key stops one client draining your GPU budget or cloning your model by mass querying (<strong>model extraction</strong>). Token bucket and sliding window algorithms, and why the counter must live in Redis, are in <a class="xref" data-note="api_production">Production Backend</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Origin</strong>: scheme + host + port. <strong>CORS</strong>: response headers (<code>Access-Control-Allow-Origin</code>, <code>-Methods</code>, <code>-Headers</code>, <code>-Credentials</code>) that relax the browser's same-origin policy for listed origins. <strong>Rate limit</strong>: a cap on requests per client per time window, answered with 429.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>CORS is enforced by <em>browsers</em> only. It is not authentication. And <code>allow_origins=["*"]</code> together with <code>allow_credentials=True</code> is a misconfiguration: the spec forbids a wildcard with credentials, and libraries that "fix" it by echoing back any origin make every site trusted.</p></div>

  <h2 id="aa-owasp"><span class="num">09</span>OWASP API Top Risks</h2>
  <p>So far we added locks. Now think like the person trying the doors. <strong>OWASP</strong> (Open Worldwide Application Security Project) is a non-profit that publishes the "API Security Top 10", a ranked list of the mistakes that cause real API breaches. Interviewers use it as a checklist, and the top entry surprises people: it is not broken crypto, it is a missing <code>if</code>.</p>
  <p>The #1 risk is <strong>BOLA</strong>, Broken Object Level Authorization. The API checks that you are logged in (AuthN), but not that the specific object you asked for is yours (AuthZ on the object). Change <code>/orders/101</code> to <code>/orders/102</code> and you see a stranger's order. Many real leaks of customer data happened exactly like this, often by someone just counting through ids.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hotel where every key card opens any room, as long as the card is valid. The front desk checked your ID perfectly. Nobody checked whether room 305 is yours.</p></div>
  <div class="fx" data-lang="py">from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.testclient import TestClient

ORDERS = {101: {"customer": "asha", "item": "laptop", "total": 54000},
          102: {"customer": "ravi", "item": "phone", "total": 18000}}
TOKENS = {"tok_asha": "asha", "tok_ravi": "ravi"}       # stand-in for JWT checking

def current_user(authorization: str = Header(default="")):
    user = TOKENS.get(authorization.removeprefix("Bearer "))
    if user is None:
        raise HTTPException(401, "not logged in")
    return user

app = FastAPI()

@app.get("/v1/orders/{order_id}")                       # BUGGY: authN only
def get_order_v1(order_id: int, user=Depends(current_user)):
    return ORDERS[order_id]

@app.get("/v2/orders/{order_id}")                       # FIXED: authN + ownership
def get_order_v2(order_id: int, user=Depends(current_user)):
    order = ORDERS.get(order_id)
    if order is None or order["customer"] != user:
        raise HTTPException(404, "order not found")     # 404 hides that it exists
    return order

c = TestClient(app)
asha = {"Authorization": "Bearer tok_asha"}
for path in ["/v1/orders/101", "/v1/orders/102", "/v2/orders/101", "/v2/orders/102"]:
    r = c.get(path, headers=asha)
    print("asha GET", path, "-&gt;", r.status_code, r.json())</div>
  <div class="fx" data-lang="text">asha GET /v1/orders/101 -&gt; 200 {'customer': 'asha', 'item': 'laptop', 'total': 54000}
asha GET /v1/orders/102 -&gt; 200 {'customer': 'ravi', 'item': 'phone', 'total': 18000}
asha GET /v2/orders/101 -&gt; 200 {'customer': 'asha', 'item': 'laptop', 'total': 54000}
asha GET /v2/orders/102 -&gt; 404 {'detail': 'order not found'}</div>
  <p>Line 2 is the breach: Asha is properly logged in, and <code>get_order_v1</code> happily returns Ravi's phone order. <code>get_order_v2</code> adds one line, <code>order["customer"] != user</code>, and Asha gets 404 for Ravi's order. Returning 404 instead of 403 also hides that order 102 exists. In SQL the fix is the same idea: <code>WHERE id = :id AND customer_id = :user_id</code>. Random ids (UUIDs) make guessing harder but are <em>not</em> a fix; the ownership check is.</p>
  <table class="tbl">
    <tr><th>Risk</th><th>What it looks like</th><th>Fix</th></tr>
    <tr><td><strong>Broken object-level authorization</strong> (BOLA, #1)</td><td><code>GET /orders/102</code> works for any logged-in user</td><td>Check ownership on every object access</td></tr>
    <tr><td>Broken authentication</td><td>No rate limit on login, weak tokens, unverified JWTs</td><td>Standard libraries, short expiry, throttling, MFA</td></tr>
    <tr><td>Broken property-level authorization</td><td>Response leaks <code>password_hash</code>; client sets <code>"role":"admin"</code> in a PATCH (mass assignment)</td><td>Explicit response and input schemas (Pydantic)</td></tr>
    <tr><td>Unrestricted resource consumption</td><td>Huge batches, giant uploads, no timeouts</td><td>Size limits, pagination caps, rate limits</td></tr>
    <tr><td>Broken function-level authorization</td><td>Normal user calls <code>DELETE /models/x</code></td><td>Role checks on admin routes</td></tr>
    <tr><td>Server-side request forgery (SSRF)</td><td>"Predict from image URL" fetches <code>http://169.254.169.254/</code> (cloud metadata with credentials)</td><td>Allow-list hosts; block internal IPs</td></tr>
    <tr><td>Injection</td><td>User text concatenated into SQL</td><td>Parameterized queries</td></tr>
  </table>
  <p><strong>ML-specific risks</strong>: model extraction (cloning your model by querying it a lot; rate-limit and return labels instead of full probabilities when you can), resource exhaustion (one request with a 50,000-row batch or a 200 MB image; cap sizes), leaking training data or PII in responses, and <strong>prompt injection</strong> for LLM endpoints (user text that tells the model to ignore its instructions; never let model output trigger privileged actions unchecked).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>BOLA / IDOR</strong> (Insecure Direct Object Reference): an endpoint that takes an object id from the client and returns or changes that object without checking that the caller may access it.</p></div>
  <div class="callout intu"><span class="label">Key insight</span><p>Most real breaches are authorization bugs, not broken crypto. The token was valid; nobody checked whether <em>this</em> user owns <em>this</em> row. Write the ownership check in the data access layer so no endpoint can forget it.</p></div>

  <h2 id="aa-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: 401 and 403 swapped</span><p>401 = "I don't know who you are". 403 = "I know you, and you may not". Use 404 when even revealing that a resource exists is a leak.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting the JWT</span><p>Decoding without <code>algorithms=[...]</code> or with <code>verify_signature: False</code>; putting secrets or PII in the readable payload; access tokens valid for 30 days. Pin the algorithm, check <code>aud</code>/<code>iss</code>, keep access tokens ~15 min with rotating refresh tokens.</p></div>
  <div class="callout trap"><span class="label">Trap: fast hashes for passwords</span><p>SHA-256, MD5 or reversible "encryption". Use argon2id or bcrypt through a library's <code>hash</code>/<code>verify</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: secrets in code and URLs</span><p>Keys in Git, in frontend JavaScript, or in <code>?api_key=</code> (logs, history). Use env vars or a secrets manager, headers, stored hashes, and rotate any leaked key.</p></div>
  <div class="callout trap"><span class="label">Trap: thinking CORS protects the API</span><p>CORS only changes what a browser lets page JavaScript read. curl ignores it. AuthN and AuthZ must run on every request.</p></div>
  <div class="callout trap"><span class="label">Trap: checking login but not ownership</span><p>The BOLA bug. Every query that takes an id from the client must also filter by the current user.</p></div>
  <div class="callout trap"><span class="label">Trap: verify=False and chatty errors</span><p>Turning off certificate checks removes TLS's identity protection. And "user not found" vs "wrong password" tells attackers what to try next: return one generic message, log the detail.</p></div>

  <h2 id="aa-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between authentication and authorization? Which status codes go with each?</summary><div class="qa-body">Authentication checks who the caller is (password, key, token); failure → 401. Authorization checks whether that identity may do this action on this resource (role, scope, ownership); failure → 403, or 404 if revealing existence is itself a leak. AuthN always runs first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should you store and check API keys?</summary><div class="qa-body">Generate them with a CSPRNG (<code>secrets</code>), show the raw key once, store only its hash (SHA-256 is fine because keys are long and random) plus a short prefix for display, and compare with <code>hmac.compare_digest</code>. Send them in a header over HTTPS, never in URLs or Git, and make them revocable and rotatable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a JWT encrypted? Can a user change their role inside it?</summary><div class="qa-body">No, it is signed, not encrypted: base64-decode the middle part and you read everything. A user can edit the payload, but the signature then fails (<code>InvalidSignatureError</code>), so the server rejects it. (JWE is the encrypted variant, rarely needed.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the "alg: none" attack and how do you prevent it?</summary><div class="qa-body">An attacker sends a token whose header says <code>"alg":"none"</code> with an empty signature. A naive server that trusts the header skips verification. Prevent it by passing an explicit allow-list: <code>jwt.decode(tok, key, algorithms=["HS256"])</code>, and never <code>verify_signature: False</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HS256 vs RS256: when would you choose each?</summary><div class="qa-body">HS256 uses one shared secret for signing and verifying: simple when a single service issues and checks tokens. RS256/ES256 use a private key to sign and a public key to verify: use them when many services verify, so only the auth server can issue tokens, and public keys can be published (JWKS).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you log out a user who has a JWT?</summary><div class="qa-body">You can't un-issue it. Options: short access-token expiry (5–15 min) plus revocable, rotating refresh tokens; a denylist of token ids (<code>jti</code>) in Redis until expiry; or rotate the signing key (logs out everyone).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Sessions vs JWT: which for an internal ML dashboard?</summary><div class="qa-body">Sessions are simpler and instantly revocable; a shared Redis store solves scaling. JWT shines when many independent services must verify identity without a shared store. For one dashboard, sessions (or your company's SSO via OIDC) are fine.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which cookie flags should a session cookie have, and why?</summary><div class="qa-body"><code>HttpOnly</code> (JavaScript can't read it, so XSS can't steal it), <code>Secure</code> (only sent over HTTPS), <code>SameSite=Lax</code> or <code>Strict</code> (not sent on cross-site background requests, which blocks most CSRF).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not store passwords as SHA-256 hashes?</summary><div class="qa-body">SHA-256 is designed to be fast: a GPU tries billions per second, and without a salt, identical passwords share hashes and rainbow tables work. bcrypt/argon2id are salted and deliberately slow (we measured ~20 µs vs ~0.33 s), and argon2id is also memory-hard.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does PKCE solve?</summary><div class="qa-body">Public clients (SPAs, mobile apps) can't keep a client secret, and the authorization code can be intercepted (URL logs, a malicious app registered for the same redirect URI). PKCE binds the code to a random verifier only the original app holds; the server compares SHA-256(verifier) with the challenge sent earlier, so a stolen code is useless.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A nightly training job must call your feature API. Which OAuth flow?</summary><div class="qa-body">Client credentials: the job authenticates as itself with client_id + secret (from a secrets manager) and gets a short-lived access token with narrow scopes. No user, no browser.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API returns data to curl but the React app gets a CORS error. What's wrong?</summary><div class="qa-body">The server doesn't list the React app's origin in <code>Access-Control-Allow-Origin</code>, or rejects the preflight (e.g. the <code>Authorization</code> header isn't allowed). curl doesn't enforce CORS, the browser does. Add the exact origin to the CORS config; don't use <code>*</code> with credentials.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Spot the bug: <code>GET /orders/{id}</code> checks the JWT, then returns <code>db.get(Order, id)</code>.</summary><div class="qa-body">BOLA: any authenticated user can read any order by changing the id. Add <code>WHERE customer_id = current_user.id</code> (or check ownership and return 404/403).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What security risks are specific to ML APIs?</summary><div class="qa-body">Model extraction (cloning by mass querying: rate-limit, return labels not full probabilities when possible), resource exhaustion (huge inputs/batches: cap sizes), SSRF via "fetch this URL" features, leaking training data or PII in responses, and prompt injection for LLM endpoints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop brute-force attacks on a login endpoint?</summary><div class="qa-body">Count failed attempts per account and per IP in a shared store (Redis), return 429 with Retry-After after a threshold, use one generic error message, hash passwords with a slow algorithm, and add MFA. Watch for credential stuffing: many accounts, few tries each, from many IPs.</div></details>
</main>
`
});
