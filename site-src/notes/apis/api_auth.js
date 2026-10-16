// notes/apis/api_auth.js — Authentication & Security
Object.assign(TOPIC_CONTENT, {
  "api_auth": `<main>
  <h1>Authentication &amp; Security</h1>
  <p class="lead">An ML endpoint on the internet will be called by people you didn't invite. This page covers proving who a caller is, deciding what they may do, and the classic holes (JWT tricks, plain-text passwords, open CORS) that interviewers love to probe. Builds on <em>HTTP &amp; REST Fundamentals</em>.</p>

  <h2 id="aa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">API Auth &amp; Security</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">AuthN vs AuthZ</div>
        <ul>
          <li><b>Authentication</b> — who are you? fails → <b>401</b></li>
          <li><b>Authorization</b> — may you do this? fails → <b>403</b></li>
          <li>💡 passport check vs boarding pass</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Schemes</div>
        <ul>
          <li><b>API key</b> — random string in <code>X-API-Key</code>; identifies a program</li>
          <li>⚠ compare with <code>hmac.compare_digest</code> (timing attack); store hashed</li>
          <li><b>Session</b> — server-side row + cookie id; instant revoke; needs shared store</li>
          <li><b>JWT</b> — signed claims; no lookup; hard to revoke</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JWT</div>
        <ul>
          <li><b>Structure</b> — <code>header.payload.signature</code>, base64url</li>
          <li><b>Signed, not encrypted</b> — anyone can read payload</li>
          <li><b>HS256</b> shared secret · <b>RS256/ES256</b> private signs, public verifies</li>
          <li><b>Claims</b> — sub, exp, iat, iss, aud</li>
          <li><b>Access</b> ~15 min + <b>refresh</b> token; revoke via short exp / jti denylist</li>
          <li>💡 tamper-sealed festival wristband</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JWT traps</div>
        <ul>
          <li>⚠ <b>alg: none</b> — unsigned token; fix: <code>algorithms=["HS256"]</code></li>
          <li>⚠ <b>verify_signature False</b> — accepts forged admin</li>
          <li>⚠ <b>Secrets/PII in payload</b> — readable by anyone</li>
          <li>⚠ <b>Alg confusion</b> — RS public key used as HS secret; pin alg</li>
          <li>Tampered payload → <code>InvalidSignatureError</code>; old → <code>ExpiredSignatureError</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">OAuth 2.0</div>
        <ul>
          <li><b>Purpose</b> — app acts for user without seeing password</li>
          <li><b>Auth code + PKCE</b> — redirect → login → code → code + verifier → tokens</li>
          <li><b>PKCE</b> — challenge = SHA256(verifier); stolen code useless</li>
          <li><b>Client credentials</b> — machine-to-machine, no user</li>
          <li><b>OIDC</b> — adds ID token (who the user is)</li>
          <li>⚠ implicit &amp; password grants deprecated</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">TLS &amp; passwords</div>
        <ul>
          <li><b>TLS</b> — encryption + integrity + server identity (CA-signed cert)</li>
          <li><b>Termination</b> at LB/nginx; mTLS inside if needed</li>
          <li><b>Passwords</b> — argon2id (memory-hard) or bcrypt; salted + slow</li>
          <li>⚠ SHA-256: fast, unsalted → GPU cracking, rainbow tables</li>
          <li>bcrypt cost 12 ≈ 0.7 s per hash, measured</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CORS &amp; limits</div>
        <ul>
          <li><b>CORS</b> — browser blocks cross-origin JS reads unless allowed</li>
          <li><b>Preflight</b> — OPTIONS + Origin → Access-Control-Allow-*</li>
          <li>⚠ Not security: curl ignores it; no <code>*</code> with credentials</li>
          <li><b>Rate limit</b> login (brute force), per key (cost, model extraction) → 429</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">OWASP API risks</div>
        <ul>
          <li><b>BOLA (#1)</b> — change id, see others' data; check ownership</li>
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
      <div class="rm-item rm-done" data-target="aa-jwttrap"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">JWT Traps</span><span class="rm-sub">alg none, secrets in payload</span></div></div>
      <div class="rm-item rm-done" data-target="aa-oauth"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">OAuth 2.0</span><span class="rm-sub">Auth code + PKCE, client credentials</span></div></div>
      <div class="rm-item rm-done" data-target="aa-tls"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">HTTPS / TLS</span><span class="rm-sub">Encryption in plain words</span></div></div>
      <div class="rm-item rm-done" data-target="aa-hash"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Password Hashing</span><span class="rm-sub">bcrypt, argon2, never SHA</span></div></div>
      <div class="rm-item rm-done" data-target="aa-cors"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">CORS &amp; Rate Limits</span><span class="rm-sub">Browser rules, abuse control</span></div></div>
      <div class="rm-item rm-done" data-target="aa-owasp"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">OWASP API Top Risks</span><span class="rm-sub">What attackers actually do</span></div></div>
      <div class="rm-item rm-done" data-target="aa-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="aa-nz"><span class="num">01</span>AuthN vs AuthZ</h2>
  <div class="flow"><span>Request arrives</span><span>Authentication: who are you?</span><span>Authorization: may you do this?</span><span>Handler runs</span></div>
  <table class="tbl">
    <tr><th></th><th>Authentication (AuthN)</th><th>Authorization (AuthZ)</th></tr>
    <tr><td>Question</td><td>Who are you?</td><td>Are you allowed to do <em>this</em>?</td></tr>
    <tr><td>Evidence</td><td>Password, API key, token, certificate</td><td>Roles, scopes, ownership of the resource</td></tr>
    <tr><td>Fails with</td><td><strong>401</strong> Unauthorized</td><td><strong>403</strong> Forbidden</td></tr>
    <tr><td>Order</td><td>Always first</td><td>Needs to know who you are</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>At an airport, the passport check is authentication. The boarding pass deciding which plane and seat is authorization. A valid passport does not get you into the cockpit.</p></div>

  <h2 id="aa-keys"><span class="num">02</span>API Keys &amp; Sessions</h2>
  <div class="cards">
    <div><b>API key</b><p>A long random string sent in a header (<code>X-API-Key</code>). Identifies a <em>program</em>, not a person.</p><small>Use: service-to-service, batch jobs, paid APIs</small></div>
    <div><b>Session</b><p>Login once; server stores a session row and gives a random id in a cookie.</p><small>Use: classic web apps with a browser</small></div>
    <div><b>Token (JWT)</b><p>Login once; server gives a signed token holding the claims. Nothing stored server-side.</p><small>Use: SPAs, mobile, microservices</small></div>
  </div>
  <p>A real FastAPI server enforcing all three checks (keys, JWT, roles). Run with <code>uvicorn app:app --port 8011</code>:</p>
  <div class="fx" data-lang="py">import hmac, time, jwt
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware

SECRET = "change-me-to-32+-random-bytes-in-prod"
API_KEYS = {"sk_live_9f2c7a": "batch-scoring-job"}   # in prod: store hashes in a DB

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
    except jwt.PyJWTError as e:
        raise HTTPException(401, f"invalid token: {e}")

def require_role(role: str):
    def check(user=Depends(current_user)):
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

@app.get("/batch/predictions")</div>
  <div class="fx" data-lang="text">$ curl localhost:8011/batch/predictions -H 'X-API-Key: sk_live_9f2c7a'   → 200 {"caller":"batch-scoring-job"}
$ curl localhost:8011/batch/predictions -H 'X-API-Key: guess'            → 401 {"detail":"invalid API key"}
$ curl localhost:8011/reports -H "Authorization: Bearer $TOKEN"           → 200 {"hello":"sara"}
$ curl localhost:8011/reports                                            → 401 {"detail":"missing bearer token"}
$ curl -X DELETE localhost:8011/models/churn_v3 -H "...Bearer $TOKEN"     → 403 {"detail":"forbidden: needs role admin"}
$ curl -X DELETE localhost:8011/models/churn_v3 -H "...Bearer $ADMIN"     → 200 {"deleted":"churn_v3","by":"ravi"}
$ curl localhost:8011/reports -H 'Authorization: Bearer abc.def.ghi'      → 401</div>
  <div class="callout trap"><span class="label">Trap</span><p>Comparing secrets with <code>==</code> stops at the first wrong character, so response time leaks how much of a guess is right (a <strong>timing attack</strong>). Use <code>hmac.compare_digest</code>. Store keys hashed, never in Git.</p></div>
  <table class="tbl">
    <tr><th></th><th>Server session</th><th>JWT</th></tr>
    <tr><td>State</td><td>Stored server-side (Redis/DB)</td><td>Inside the token</td></tr>
    <tr><td>Each request</td><td>Lookup by session id</td><td>Verify signature, no lookup</td></tr>
    <tr><td>Logout / revoke</td><td>Delete the row: instant</td><td>Hard: valid until <code>exp</code> (need short expiry or a denylist)</td></tr>
    <tr><td>Scaling</td><td>Shared session store needed</td><td>Any server with the key can verify</td></tr>
  </table>

  <h2 id="aa-jwt"><span class="num">03</span>JWT</h2>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <rect x="10" y="20" width="160" height="40" rx="6" class="fr sr"/><text x="90" y="45" text-anchor="middle">Header</text>
    <text x="180" y="45" font-size="22">.</text>
    <rect x="195" y="20" width="200" height="40" rx="6" class="fv"/><text x="295" y="45" text-anchor="middle">Payload (claims)</text>
    <text x="405" y="45" font-size="22">.</text>
    <rect x="420" y="20" width="170" height="40" rx="6" class="fb sb"/><text x="505" y="45" text-anchor="middle">Signature</text>
    <text x="90" y="82" text-anchor="middle" font-size="12" class="tm">{"alg":"HS256","typ":"JWT"}</text>
    <text x="295" y="82" text-anchor="middle" font-size="12" class="tm">{"sub":"user_42","role":…,"exp":…}</text>
    <text x="505" y="82" text-anchor="middle" font-size="12" class="tm">HMAC-SHA256(h.p, secret)</text>
    <text x="90" y="108" text-anchor="middle" font-size="12">base64url</text>
    <text x="295" y="108" text-anchor="middle" font-size="12">base64url, NOT encrypted</text>
    <text x="505" y="108" text-anchor="middle" font-size="12" class="tb">proves no tampering</text>
    <text x="300" y="140" text-anchor="middle" font-size="12" class="tr">Anyone can read it. Only the key holder can make a valid one.</text>
  </svg><figcaption>A JWT (JSON Web Token) is three base64url pieces joined by dots.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A festival wristband with a tamper-proof seal. Guards read it without calling the office (no DB lookup), and a broken seal means it's fake. You can't cancel one already on someone's wrist until it expires.</p></div>
  <div class="fx" data-lang="py">import jwt, base64, json, time

SECRET = "change-me-to-32+-random-bytes-in-prod"
token = jwt.encode({"sub": "user_42", "role": "analyst", "exp": int(time.time()) + 900},
                   SECRET, algorithm="HS256")
print(token)

# 1) Anyone can READ the payload: it is only base64url-encoded, not encrypted
header_b64, payload_b64, sig_b64 = token.split(".")
pad = lambda s: s + "=" * (-len(s) % 4)
print(json.loads(base64.urlsafe_b64decode(pad(header_b64))))
print(json.loads(base64.urlsafe_b64decode(pad(payload_b64))))

# 2) Verifying: signature + expiry checked, algorithm pinned
print(jwt.decode(token, SECRET, algorithms=["HS256"]))</div>
  <div class="fx" data-lang="text">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFuYWx5c3QiLCJleHAiOjE3OTIxMzMyNTV9.HRsASZq5XcY95a6qETLvfnrwdWczlH-4jslfMO1jKn0
{'alg': 'HS256', 'typ': 'JWT'}
{'sub': 'user_42', 'role': 'analyst', 'exp': 1792133255}
{'sub': 'user_42', 'role': 'analyst', 'exp': 1792133255}</div>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Signs with</th><th>Verifies with</th><th>When</th></tr>
    <tr><td><code>HS256</code></td><td>Shared secret</td><td>Same secret</td><td>One service issues and checks</td></tr>
    <tr><td><code>RS256</code> / <code>ES256</code></td><td>Private key</td><td>Public key</td><td>Many services verify; only the auth server can issue</td></tr>
  </table>
  <p>Standard claims: <code>sub</code> (who), <code>exp</code> (expiry), <code>iat</code> (issued at), <code>iss</code> (issuer), <code>aud</code> (intended audience). Pair a short-lived <strong>access token</strong> (~15 min) with a long-lived <strong>refresh token</strong> stored safely.</p>

  <h2 id="aa-jwttrap"><span class="num">04</span>JWT Traps</h2>
  <div class="fx" data-lang="py"># (same SECRET, token, header_b64, sig_b64 as above)
# 3) Tampering: change role to admin, keep old signature
evil_payload = base64.urlsafe_b64encode(json.dumps(
    {"sub": "user_42", "role": "admin", "exp": int(time.time()) + 900}).encode()).rstrip(b"=").decode()
forged = f"{header_b64}.{evil_payload}.{sig_b64}"
try:
    jwt.decode(forged, SECRET, algorithms=["HS256"])
except jwt.InvalidSignatureError as e:
    print("Forged:", type(e).__name__, "-", e)

# 4) Expired token
old = jwt.encode({"sub": "user_42", "exp": int(time.time()) - 10}, SECRET, algorithm="HS256")
try:
    jwt.decode(old, SECRET, algorithms=["HS256"])
except jwt.ExpiredSignatureError as e:
    print("Old:", type(e).__name__, "-", e)

# 5) The 'none' algorithm attack: unsigned token claiming admin
none_tok = jwt.encode({"sub": "user_42", "role": "admin"}, None, algorithm="none")
print(none_tok)
try:
    jwt.decode(none_tok, SECRET, algorithms=["HS256"])
except jwt.InvalidAlgorithmError as e:
    print("none alg:", type(e).__name__, "-", e)

# The BUG that lets it through: skipping verification
print("UNSAFE:", jwt.decode(none_tok, options={"verify_signature": False}))</div>
  <div class="fx" data-lang="text">Forged: InvalidSignatureError - Signature verification failed
Old: ExpiredSignatureError - Signature has expired
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIn0.
none alg: InvalidAlgorithmError - The specified alg value is not allowed
UNSAFE: {'sub': 'user_42', 'role': 'admin'}</div>
  <ul>
    <li><strong>Tampering</strong>: changing <code>role</code> breaks the signature. Rejected.</li>
    <li><strong><code>alg: none</code></strong>: an unsigned token. Safe only because we pinned <code>algorithms=["HS256"]</code>.</li>
    <li><strong>Skipping verification</strong>: <code>verify_signature: False</code> happily returns <code>role: admin</code>. Never in server code.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: secrets in the payload</span><p>The payload is only encoded. Putting a password, API key or PII in it publishes it to anyone holding the token. Put only ids and roles there.</p></div>
  <div class="callout trap"><span class="label">Trap: algorithm confusion</span><p>If a server reads <code>alg</code> from the token and verifies an <code>HS256</code> token using its RSA <em>public</em> key as the HMAC secret, attackers can forge tokens with that public key. Always pin the expected algorithm.</p></div>

  <h2 id="aa-oauth"><span class="num">05</span>OAuth 2.0</h2>
  <p><strong>OAuth 2.0</strong> lets an app act for a user without ever seeing their password. "Sign in with Google" uses it (plus OpenID Connect on top, which adds an <em>ID token</em> saying who the user is).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hotel key card. Reception (auth server) checks your ID once and issues a card that opens only your room, only until checkout. The room door (API) never sees your passport.</p></div>
  <h3>Authorization code + PKCE (users, apps, SPAs)</h3>
  <figure class="viz"><svg viewBox="0 0 600 260" width="600">
    <defs><marker id="aa-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="5" width="110" height="28" rx="6" class="fs"/><text x="60" y="24" text-anchor="middle">User</text>
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
  </svg><figcaption>The password only ever goes to the auth server. The app gets a code, then trades it for tokens.</figcaption></figure>
  <p><strong>PKCE</strong> (Proof Key for Code Exchange): the app makes a random <em>verifier</em>, sends its hash in step 1, and the raw value in step 4. A thief who intercepts the code in step 3 can't redeem it without the verifier.</p>
  <div class="fx" data-lang="py">import secrets, hashlib, base64
verifier = secrets.token_urlsafe(48)                    # kept secret by the app
challenge = base64.urlsafe_b64encode(
    hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
print("code_verifier :", verifier)
print("code_challenge:", challenge, "(sent in step 1, method=S256)")</div>
  <div class="fx" data-lang="text">code_verifier : dLv7javCCg1QfO723VgmlUR_NlKcNbGLvhAGD8vYp94h-NUeviTQq1ZoLM8mAEEb
code_challenge: KI7Qcwmu42xzi8czkSaur_qsiy1GirDlsqnBjnPnoEE (sent in step 1, method=S256)</div>
  <h3>Client credentials (machine to machine)</h3>
  <div class="flow"><span>Service sends client_id + client_secret</span><span>Auth server returns access token</span><span>Service calls API with Bearer token</span></div>
  <p>No user involved, e.g. a nightly retraining job calling a feature-store API.</p>
  <div class="callout trap"><span class="label">Trap</span><p>The old <em>implicit</em> flow (token returned in the URL) and the <em>password</em> grant are deprecated. Browser and mobile apps should use auth code + PKCE.</p></div>

  <h2 id="aa-tls"><span class="num">06</span>HTTPS / TLS</h2>
  <div class="flow"><span>Client hello</span><span>Server sends certificate</span><span>Client checks it against trusted CAs</span><span>Both derive a shared session key</span><span>Encrypted HTTP</span></div>
  <ul>
    <li><strong>Encryption</strong>: eavesdroppers on the Wi-Fi see gibberish, not your token.</li>
    <li><strong>Integrity</strong>: bytes can't be altered in transit.</li>
    <li><strong>Authentication</strong>: the certificate, signed by a Certificate Authority, proves you're talking to the real <code>api.shop.com</code>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A sealed, tamper-evident envelope, delivered by a courier whose ID badge was issued by a government office you trust.</p></div>
  <p>In production, TLS usually ends at the load balancer or nginx (<strong>TLS termination</strong>); traffic inside the private network may be plain HTTP or re-encrypted (mTLS).</p>
  <div class="callout trap"><span class="label">Trap</span><p>Bearer tokens, API keys and Basic auth over plain HTTP are sent in clear text. HTTPS is mandatory, not optional. And never ship <code>verify=False</code> in <code>requests</code>.</p></div>

  <h2 id="aa-hash"><span class="num">07</span>Password Hashing</h2>
  <div class="cards">
    <div><b>Plain text</b><p>One DB leak exposes every password.</p><small>Never</small></div>
    <div><b>SHA-256</b><p>Fast and unsalted: billions of guesses/sec on a GPU; same password → same hash.</p><small>Never for passwords</small></div>
    <div><b>bcrypt / argon2id</b><p>Deliberately slow, salted, tunable cost.</p><small>Always</small></div>
  </div>
  <div class="fx" data-lang="py">import hashlib, time, bcrypt
from argon2 import PasswordHasher

pw = b"hunter2"
print("sha256:", hashlib.sha256(pw).hexdigest()[:20], "...  same every time -&gt; rainbow tables")

h1, h2 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12)), bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
print("bcrypt 1:", h1.decode())
print("bcrypt 2:", h2.decode())          # different salt -&gt; different hash
print("check right:", bcrypt.checkpw(pw, h1), "| check wrong:", bcrypt.checkpw(b"hunter3", h1))

t = time.perf_counter(); hashlib.sha256(pw).digest(); fast = time.perf_counter() - t
t = time.perf_counter(); bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12)); slow = time.perf_counter() - t
print(f"sha256: {fast*1e6:.1f} µs   bcrypt(12): {slow*1e3:.0f} ms")

ph = PasswordHasher()                      # argon2id, memory-hard
h = ph.hash("hunter2")
print("argon2:", h)
print("verify:", ph.verify(h, "hunter2"))</div>
  <div class="fx" data-lang="text">sha256: f52fbd32b2b3b86ff88e ...  same every time -&gt; rainbow tables
bcrypt 1: $2b$12$k4xKBWw23mBDKEX5.t4pV.kmXhzMVNXZhb87yUCpfkD1Oh59vgCWG
bcrypt 2: $2b$12$oqIHhI3Tk.kpIE4kAB7zU.L/JyeYo64LKZIx/vnPio3TqnpTHivU.
check right: True | check wrong: False
sha256: 17.1 µs   bcrypt(12): 691 ms
argon2: $argon2id$v=19$m=65536,t=3,p=4$ueNA/JYnX90u7xbAtaaA7Q$DH9qFPVMpZ7ZHq2gzKJRQ31Ao1rTqEJIK5vnESLwG2Q
verify: True</div>
  <ul>
    <li><strong>Salt</strong>: random bytes stored inside the hash, so equal passwords get different hashes and precomputed (rainbow) tables are useless.</li>
    <li><strong>Cost</strong>: <code>$2b$12$</code> = 2<sup>12</sup> rounds. ~0.7 s for one login is fine; for an attacker trying billions, it's fatal.</li>
    <li><strong>argon2id</strong> is also <em>memory-hard</em> (<code>m=65536</code> KB), which defeats GPU farms. Preferred for new systems.</li>
  </ul>

  <h2 id="aa-cors"><span class="num">08</span>CORS &amp; Rate Limits</h2>
  <p><strong>CORS</strong> (Cross-Origin Resource Sharing): browsers block JavaScript on <code>site-a.com</code> from reading responses from <code>api-b.com</code> unless the API says that origin is allowed.</p>
  <div class="flow"><span>Browser JS on dashboard.shop.com</span><span>Preflight: OPTIONS + Origin</span><span>API replies Access-Control-Allow-Origin</span><span>Browser sends real request (or blocks)</span></div>
  <div class="fx" data-lang="text">$ curl -i -X OPTIONS localhost:8011/reports -H 'Origin: https://dashboard.shop.com' &#92;
       -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: Authorization'
HTTP/1.1 200 OK
vary: Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Request-Private-Network
access-control-allow-methods: GET, POST
access-control-max-age: 600
access-control-allow-headers: Accept, Accept-Language, Authorization, Content-Language, Content-Type
access-control-allow-origin: https://dashboard.shop.com

$ curl -i -X OPTIONS localhost:8011/reports -H 'Origin: https://evil.example' -H 'Access-Control-Request-Method: GET'
HTTP/1.1 400 Bad Request
Disallowed CORS origin</div>
  <div class="callout trap"><span class="label">Trap</span><p>CORS is enforced by <em>browsers</em> only. <code>curl</code>, Python and attackers' scripts ignore it, so it is not authentication. And <code>allow_origins=["*"]</code> with credentials is a misconfiguration (browsers refuse that combination).</p></div>
  <h3>Rate limiting for security</h3>
  <ul>
    <li>Throttle <code>/login</code> per IP and per account: stops password brute-forcing and credential stuffing.</li>
    <li>Throttle per API key: stops one client draining your GPU budget or scraping your model (model extraction).</li>
    <li>Reply <code>429</code> with <code>Retry-After</code>. Algorithms (token bucket, sliding window) are in <em>Production Backend</em>.</li>
  </ul>

  <h2 id="aa-owasp"><span class="num">09</span>OWASP API Top Risks</h2>
  <table class="tbl">
    <tr><th>Risk</th><th>What it looks like</th><th>Fix</th></tr>
    <tr><td><strong>Broken object-level authorization</strong> (BOLA, #1)</td><td><code>GET /orders/101</code> works for any logged-in user; change the id, see someone else's order</td><td>Check ownership on every object: <code>order.customer_id == user.id</code></td></tr>
    <tr><td>Broken authentication</td><td>No rate limit on login, weak tokens, unverified JWTs</td><td>Standard libraries, short expiry, throttling, MFA</td></tr>
    <tr><td>Broken property-level authorization</td><td>Response leaks <code>password_hash</code>; client can set <code>"role":"admin"</code> in a PATCH (mass assignment)</td><td>Explicit response and input schemas (Pydantic)</td></tr>
    <tr><td>Unrestricted resource consumption</td><td>Huge batches, giant uploads, no timeouts</td><td>Size limits, pagination caps, rate limits</td></tr>
    <tr><td>Broken function-level authorization</td><td>Normal user calls <code>DELETE /models/x</code></td><td>Role checks on admin routes</td></tr>
    <tr><td>Server-side request forgery (SSRF)</td><td>"Predict from image URL" fetches <code>http://169.254.169.254/</code> (cloud metadata)</td><td>Allow-list hosts; block internal IPs</td></tr>
    <tr><td>Injection</td><td>User text concatenated into SQL</td><td>Parameterized queries</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>Most real breaches are authorization bugs, not broken crypto. The token was valid; nobody checked whether <em>this</em> user owns <em>this</em> row.</p></div>

  <h2 id="aa-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Is a JWT encrypted? Can a user change their role inside it?</summary><div class="qa-body">No, it's signed, not encrypted: base64-decode the middle part and you read everything. A user can edit the payload, but the signature then fails verification (<code>InvalidSignatureError</code>), so the server rejects it. (JWE is the encrypted variant, rarely needed.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the "alg: none" attack and how do you prevent it?</summary><div class="qa-body">An attacker sends a token whose header says <code>"alg":"none"</code> with an empty signature. A naive server that trusts the header skips verification. Prevent it by passing an explicit allow-list: <code>jwt.decode(tok, key, algorithms=["HS256"])</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you log out a user who has a JWT?</summary><div class="qa-body">You can't un-issue it. Options: short access-token expiry (5–15 min) plus revocable refresh tokens; a denylist of token ids (<code>jti</code>) in Redis until expiry; or rotate the signing key (logs out everyone).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Sessions vs JWT: which for an internal ML dashboard?</summary><div class="qa-body">Sessions are simpler and instantly revocable; a shared Redis store solves scaling. JWT shines when many independent services must verify identity without a shared store. For one dashboard, sessions (or your company's SSO via OIDC) are fine.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not store passwords as SHA-256 hashes?</summary><div class="qa-body">SHA-256 is designed to be fast: a GPU tries billions per second, and without a salt, identical passwords share hashes and rainbow tables work. bcrypt/argon2id are salted and deliberately slow (argon2id also memory-hard).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does PKCE solve?</summary><div class="qa-body">Public clients (SPAs, mobile apps) can't keep a client secret, and the authorization code can be intercepted (e.g. by a malicious app registered for the same redirect URI). PKCE binds the code to a secret verifier only the original app holds, so a stolen code is useless.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A nightly training job must call your feature API. Which OAuth flow?</summary><div class="qa-body">Client credentials: the job authenticates as itself with client_id + secret (from a secrets manager) and gets a short-lived access token with narrow scopes. No user, no browser.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API returns data to curl but the React app gets a CORS error. What's wrong?</summary><div class="qa-body">The server doesn't list the React app's origin in <code>Access-Control-Allow-Origin</code> (or rejects the preflight, e.g. the <code>Authorization</code> header isn't allowed). curl doesn't enforce CORS, the browser does. Add the exact origin to the CORS config; don't use <code>*</code> with credentials.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Spot the bug: <code>GET /orders/{id}</code> checks the JWT, then returns <code>db.get(Order, id)</code>.</summary><div class="qa-body">BOLA: any authenticated user can read any order by changing the id. Add <code>WHERE customer_id = current_user.id</code> (or check ownership and return 404/403).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What security risks are specific to ML APIs?</summary><div class="qa-body">Model extraction (cloning by mass querying: rate-limit, return labels not full probabilities when possible), resource exhaustion (huge inputs/batches: cap sizes), SSRF via "fetch this URL" features, leaking training data or PII in responses, and prompt injection for LLM endpoints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does HTTPS protect, and what doesn't it?</summary><div class="qa-body">It protects data in transit: confidentiality, integrity, and the server's identity. It doesn't protect against a compromised server, bad authorization logic, injection, or a client that leaks its own token.</div></details>
</main>`
});
