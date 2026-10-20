// notes/apis/api_auth.js — Authentication & Security
Object.assign(TOPIC_CONTENT, {
  "api_auth": `<main>
  <h1>Authentication &amp; Security</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>Authentication &amp; Security</span></div>
  <p class="lead">At the end of the FastAPI note, Biteful's API trusted a header: send <code>X-Customer: asha</code> and you <em>are</em> Asha; send <code>X-Staff-Of: 10</code> and you can mark Dosa Hut's orders delivered. Anyone with curl could. This note answers, one need at a time, the two questions every request raises: <strong>who is calling</strong> and <strong>are they allowed to do this?</strong> It builds API keys for Dosa Hut's till, password hashing and sessions for Asha in a browser, JWTs (decoded and verified by hand), the traps attackers try on them, OAuth 2.0 for "Sign in with Google", HTTPS so none of it travels in clear text, CORS for Biteful's partner dashboard, rate limiting against password guessing, and the ownership check behind the most common real breach. Every block was run.</p>

  <h2 id="aa-fits" class="open"><span class="num">★</span>Where this fits</h2>
<figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="aa-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="69" y="42" text-anchor="middle" font-size="12">1 HTTP &amp; REST</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the conversation</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="42" text-anchor="middle" font-size="12">2 Flask</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">write the server</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="343" y="42" text-anchor="middle" font-size="12">3 FastAPI</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">validation, docs, async</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="480" y="42" text-anchor="middle" font-size="12" font-weight="700">4 Auth &amp; Security</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">who may call</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="614" y="42" text-anchor="middle" font-size="12">5 Production</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">many copies, watched</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#aa-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#aa-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#aa-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#aa-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: the Biteful orders API</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">GET /restaurants · POST /orders · customers vs restaurant staff · a slow receipt email on a queue</text>
  </svg><figcaption>The APIs &amp; Backend track in reading order. You are on the green note. Each note starts from a weakness the one before it leaves.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="api_fastapi">FastAPI</a> and <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a></b><span>You know 401 vs 403, headers and cookies, statelessness (a signed token worked on both server copies), and FastAPI's <code>Depends</code>, whose <code>current_customer</code> and <code>current_staff</code> were placeholders. This note fills those slots with real checks; endpoints don't change.</span></li>
    <li><b>This note adds: identity and permission</b><span>AuthN vs AuthZ, API keys, password hashing, sessions and cookie flags, JWTs, JWT traps, OAuth 2.0 + PKCE and client credentials, OIDC, HTTPS/TLS, CORS, login rate limiting, BOLA and the OWASP API risks.</span></li>
    <li><b>Leads to: <a class="xref" data-note="api_production">Production Backend</a></b><span>Sessions, rate-limit counters and refresh-token lists all live in Redis once Biteful runs many copies; TLS ends at nginx; rate limiting returns as general traffic control (token buckets).</span></li>
  </ol>

  <h2 id="aa-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Running example: Biteful's users are Asha and Ben (customers), Ravi (staff at Dosa Hut, restaurant 10) and Meera (admin); Dosa Hut's till is a program. Order 101 is Asha's (Dosa Hut, ₹240); order 102 is Ben's (Biryani Bros, ₹350).</p>
  <ol class="story">
    <li><b>AuthN vs AuthZ</b><span>Q: what must every request answer? → Who are you (else 401), and may you do this (else 403)? Asha may not mark orders; Ravi may not delete restaurants. But what proof does a caller show?</span></li>
    <li><b>API keys</b><span>Q: how does a program (Dosa Hut's till) prove itself? → A long random key in <code>X-API-Key</code>; store only its SHA-256. Fine for programs; humans remember passwords, not 40-character keys…</span></li>
    <li><b>Password hashing</b><span>Q: how do we check Asha's password without storing it? → bcrypt/argon2: salted and slow (SHA-256 22 µs vs bcrypt 278 ms). But she can't type it on every click…</span></li>
    <li><b>Sessions and cookies</b><span>Q: how does one login cover later requests? → A random session id in an <code>HttpOnly; Secure; SameSite</code> cookie; data stays server-side; logout deletes the row. Every request needs a lookup in a shared store…</span></li>
    <li><b>JWT</b><span>Q: can the token itself say who Asha is, unforgeably? → header.payload.signature; we built one by hand and it equals PyJWT's; verify = recompute HMAC; <code>exp</code> expired after 2 s. Signed, not encrypted. What do attackers try?</span></li>
    <li><b>JWT traps</b><span>Q: how do JWT checks fail? → Edited role → InvalidSignature; <code>alg: none</code> rejected only because we pinned <code>algorithms</code>; <code>verify_signature: False</code> accepts a forged admin. Next: Biteful wants "Sign in with Google" without ever seeing Google passwords…</span></li>
    <li><b>OAuth 2.0</b><span>Q: how does an app get limited access without the password? → Authorization code + PKCE (a stolen code is useless: invalid_grant), client credentials for machines, OIDC for "who is this". All these tokens and passwords cross the network…</span></li>
    <li><b>HTTPS / TLS</b><span>Q: who can read them on the way? → Without TLS, anyone on the path. With it: encryption, integrity, and server identity (curl refused our self-signed cert: exit 60). Browsers add one more rule for other websites' JavaScript…</span></li>
    <li><b>CORS</b><span>Q: may partners.biteful.in's JavaScript call our API? → Preflight allowed for that origin, rejected for evil.example; but curl from evil.example still got the data: CORS is not authentication. What about someone guessing Asha's password?</span></li>
    <li><b>Rate limiting</b><span>Q: how do we stop guessing? → 5 failures per minute, then 429 + Retry-After 60, even for the right password. All locks are on now; yet the #1 real breach needs none of them broken…</span></li>
    <li><b>BOLA and OWASP</b><span>Q: what if a logged-in user asks for someone else's object? → Ben read Asha's order and address via <code>/orders/101</code>; one ownership check → 404. The OWASP list names the rest.</span></li>
  </ol>

  <h2 id="aa-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">API Auth &amp; Security</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">AuthN vs AuthZ</div>
        <ul>
          <li><b>Authentication</b> — who are you? fails → <b>401</b></li>
          <li><b>Authorization</b> — may you? fails → <b>403</b> (or 404 to hide)</li>
          <li>Always AuthN first, then AuthZ, then the handler</li>
          <li><b>Roles</b> customer &lt; staff &lt; admin; <b>ownership</b> per object</li>
          <li>💡 society gate: ID check, then the flat list</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keys, passwords, sessions</div>
        <ul>
          <li><b>API key</b> — for programs; store SHA-256; <code>hmac.compare_digest</code></li>
          <li><b>Passwords</b> — bcrypt/argon2id: salted, slow (278 ms vs 22 µs)</li>
          <li><b>Session</b> — random id in a cookie, data server-side; logout = delete row</li>
          <li>Cookie flags: <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JWT</div>
        <ul>
          <li><code>base64url(header).base64url(payload).base64url(sig)</code></li>
          <li>sig = HMAC-SHA256(secret, part1.part2) — by hand = PyJWT</li>
          <li><b>Signed, not encrypted</b>; claims sub, exp, iat, iss, aud, jti</li>
          <li><b>HS256</b> shared secret · <b>RS256/ES256</b> private signs, public verifies</li>
          <li>Access ~15 min + rotating <b>refresh</b> token</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">JWT traps</div>
        <ul>
          <li>⚠ <b>alg none</b> — pin <code>algorithms=["HS256"]</code></li>
          <li>⚠ <b>verify_signature False</b> → forged admin accepted</li>
          <li>⚠ secrets/PII in payload — readable by anyone</li>
          <li>⚠ alg confusion; no <code>aud</code> check</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">OAuth &amp; TLS</div>
        <ul>
          <li><b>Auth code + PKCE</b> — redirect, login at Google, code, code + verifier → tokens</li>
          <li><b>Client credentials</b> — machine to machine</li>
          <li><b>OIDC</b> — ID token: who the user is</li>
          <li><b>TLS</b> — encryption + integrity + server identity (CA cert)</li>
          <li>⚠ never <code>verify=False</code> / <code>curl -k</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CORS, limits, OWASP</div>
        <ul>
          <li><b>CORS</b> — browser-only; preflight OPTIONS; not authentication</li>
          <li><b>Login limit</b> — 5 fails/min → 429 + Retry-After</li>
          <li><b>BOLA (#1)</b> — check ownership: <code>WHERE id = ? AND customer = ?</code></li>
          <li>Mass assignment, resource consumption, SSRF, injection</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="aa-nz"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">AuthN vs AuthZ</span><span class="rm-sub">Who are you? May you?</span></div></div>
      <div class="rm-item rm-done" data-target="aa-keys"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">API Keys</span><span class="rm-sub">A password for a program</span></div></div>
      <div class="rm-item rm-done" data-target="aa-hash"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Password Hashing</span><span class="rm-sub">bcrypt, argon2, never SHA</span></div></div>
      <div class="rm-item rm-done" data-target="aa-sess"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Sessions &amp; Cookies</span><span class="rm-sub">Log in once, carry a ticket</span></div></div>
      <div class="rm-item rm-done" data-target="aa-jwt"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">JWT</span><span class="rm-sub">Built and verified by hand</span></div></div>
      <div class="rm-item rm-done" data-target="aa-jwttrap"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">JWT Traps</span><span class="rm-sub">Forgery, alg none, skipped checks</span></div></div>
      <div class="rm-item rm-done" data-target="aa-oauth"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">OAuth 2.0</span><span class="rm-sub">Auth code + PKCE, client credentials</span></div></div>
      <div class="rm-item rm-done" data-target="aa-tls"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">HTTPS / TLS</span><span class="rm-sub">Encryption and identity</span></div></div>
      <div class="rm-item rm-done" data-target="aa-cors"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">CORS</span><span class="rm-sub">The browser's rule, not yours</span></div></div>
      <div class="rm-item rm-done" data-target="aa-rl"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Rate Limiting</span><span class="rm-sub">Stopping password guessing</span></div></div>
      <div class="rm-item rm-done" data-target="aa-owasp"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">BOLA &amp; OWASP Risks</span><span class="rm-sub">What attackers actually do</span></div></div>
      <div class="rm-item rm-done" data-target="aa-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Bugs behind real breaches</span></div></div>
      <div class="rm-item rm-done" data-target="aa-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One request through every lock</span></div></div>
      <div class="rm-item rm-done" data-target="aa-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="aa-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="aa-nz"><span class="num">01</span>AuthN vs AuthZ</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's API has three kinds of action: anyone signed in may list restaurants; only Dosa Hut's staff may mark Dosa Hut's orders; only an admin may delete a restaurant. Right now the API believes whatever header it is sent. Before choosing any technology: what exactly must the server decide for every request, and in what order?</p>
  </div>
  <p>Two different questions, which people mix up all the time. First <strong>"who are you?"</strong>: the caller shows proof (a password, a key, a token) and the server checks it. That is <strong>authentication</strong>, <strong>AuthN</strong>. Second <strong>"are you allowed to do this?"</strong>: knowing the caller is Asha doesn't mean Asha may mark orders delivered. That is <strong>authorization</strong>, <strong>AuthZ</strong>. AuthZ always comes second: you can't check permissions before you know who is asking.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A gated housing society. The guard checks your ID card and writes your name in the register: authentication. Then he looks at the list of who lives where: you may go to flat B-204, not B-305 or the society office: authorization. A valid ID card does not open every door.</p></div>
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
  <p><strong>Dry run first.</strong> Roles rank customer &lt; staff &lt; admin (each can do what the ones below can). Predict each result:</p>
  <table class="tbl"><caption>Which gate stops each request</caption>
    <tr><th>Request</th><th>Token</th><th>Gate 1: AuthN</th><th>Gate 2: AuthZ</th><th>Result</th></tr>
    <tr><td>GET /v1/restaurants</td><td>none</td><td>no proof → stop</td><td>–</td><td>401</td></tr>
    <tr><td>GET /v1/restaurants</td><td>fake</td><td>unknown → stop</td><td>–</td><td>401</td></tr>
    <tr><td>GET /v1/restaurants</td><td>Asha's</td><td>Asha</td><td>customer ≥ customer</td><td>200</td></tr>
    <tr><td>PATCH /v1/orders/101</td><td>Asha's</td><td>Asha</td><td>customer &lt; staff → stop</td><td>403</td></tr>
    <tr><td>PATCH /v1/orders/101</td><td>Ravi's</td><td>Ravi</td><td>staff ≥ staff</td><td>200</td></tr>
    <tr><td>DELETE /v1/restaurants/14</td><td>Ravi's</td><td>Ravi</td><td>staff &lt; admin → stop</td><td>403</td></tr>
    <tr><td>DELETE /v1/restaurants/14</td><td>Meera's</td><td>Meera</td><td>admin ≥ admin</td><td>200</td></tr>
  </table>
  <p>The same logic in plain Python, no framework yet:</p>
<div class="fx" data-lang="py"># Who may do what at Biteful
TOKENS = {"tok_asha": {"user": "asha", "role": "customer"},
          "tok_ravi": {"user": "ravi", "role": "staff", "restaurant": 10},     # works at Dosa Hut
          "tok_meera": {"user": "meera", "role": "admin"}}
NEEDS_ROLE = {("GET", "/v1/restaurants"): "customer",
              ("PATCH", "/v1/orders/101"): "staff",
              ("DELETE", "/v1/restaurants/14"): "admin"}
RANK = {"customer": 1, "staff": 2, "admin": 3}     # each role can do everything below it

def handle(method, path, token):
    who = TOKENS.get(token)                        # gate 1: authentication
    if who is None:
        return 401, "who are you?"
    needed = NEEDS_ROLE[(method, path)]            # gate 2: authorization
    if RANK[who["role"]] &lt; RANK[needed]:
        return 403, f"{who['user']} is {who['role']}, needs {needed}"
    return 200, f"ok, {who['user']}"               # the real work

for req in [("GET", "/v1/restaurants", None), ("GET", "/v1/restaurants", "tok_fake"),
            ("GET", "/v1/restaurants", "tok_asha"), ("PATCH", "/v1/orders/101", "tok_asha"),
            ("PATCH", "/v1/orders/101", "tok_ravi"), ("DELETE", "/v1/restaurants/14", "tok_ravi"),
            ("DELETE", "/v1/restaurants/14", "tok_meera")]:
    print(req, "-&gt;", handle(*req))</div>
<div class="fx" data-lang="text">('GET', '/v1/restaurants', None) -&gt; (401, 'who are you?')
('GET', '/v1/restaurants', 'tok_fake') -&gt; (401, 'who are you?')
('GET', '/v1/restaurants', 'tok_asha') -&gt; (200, 'ok, asha')
('PATCH', '/v1/orders/101', 'tok_asha') -&gt; (403, 'asha is customer, needs staff')
('PATCH', '/v1/orders/101', 'tok_ravi') -&gt; (200, 'ok, ravi')
('DELETE', '/v1/restaurants/14', 'tok_ravi') -&gt; (403, 'ravi is staff, needs admin')
('DELETE', '/v1/restaurants/14', 'tok_meera') -&gt; (200, 'ok, meera')</div>
  <p>The output matches the dry run row for row. Inside <code>handle</code>, the token lookup (AuthN) runs before <code>NEEDS_ROLE</code> is even read (AuthZ). <code>RANK</code> is a tiny form of <strong>role-based access control</strong> (RBAC): permissions attach to roles, users get roles. Notice what it can't express: Ravi is staff at <em>Dosa Hut</em>, yet the role check lets him patch <em>any</em> order. Per-object rules ("only your restaurant's orders", "only your own order") come back in sections 05 and 11.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Authentication</strong>: verifying the caller's identity. <strong>Authorization</strong>: deciding whether that identity may perform this action on this resource. <strong>Role</strong>: a named group of permissions (customer, staff, admin). <strong>Scope</strong>: a named permission inside a token (<code>orders:read</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>HTTP named 401 "Unauthorized", but it means <em>unauthenticated</em>: "I don't know who you are". 403 "Forbidden" means "I know you, and the answer is no". Sending 403 for a missing token, or 401 for a missing role, is a classic interview slip.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: API keys.</b> The gates assume the server can recognise a token. Where does a caller's proof come from? Start with the simplest caller: Dosa Hut's till, a program that pulls new orders every minute, all day, for months, with no human to type anything.</div>

  <h2 id="aa-keys"><span class="num">02</span>API Keys</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Dosa Hut's till calls <code>GET /v1/partner/orders</code> every minute. There is no person to log in. How does a program prove which customer account it belongs to, and what should Biteful store so that a leaked database doesn't hand out working keys?</p>
  </div>
  <p>The simplest proof is a long random string given to the program once and sent on every request in a header such as <code>X-API-Key</code>: an <strong>API key</strong>. It identifies a <em>program</em> or account, not a person. Stripe, OpenAI and Google Maps work this way.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A metro smart card. The gate doesn't know your name; it checks that the card is real and active. Whoever holds the card can travel, so a lost card must be blockable. API keys are the same: whoever holds the string <em>is</em> the caller.</p></div>
  <p>The safe recipe: (1) generate the key with a cryptographic random generator; (2) show it once; (3) store only a <strong>hash</strong> (a one-way function: easy to compute from the key, practically impossible to reverse); (4) on each request, hash what was sent and compare.</p>
<div class="fx" data-lang="py">import secrets, hashlib, hmac

# --- issuing a key (once, when Dosa Hut connects its till to Biteful) ---
raw_key = "bf_live_" + secrets.token_urlsafe(24)     # shown to Dosa Hut ONCE
stored = {                                           # what goes in Biteful's database
    "prefix": raw_key[:12],                          # lets the dashboard show "bf_live_ab12..."
    "sha256": hashlib.sha256(raw_key.encode()).hexdigest(),
    "owner": "dosa-hut-till",
}
print("give to Dosa Hut:", len(raw_key), "chars, starts", raw_key[:8])
print("store in DB     :", list(stored), "hash length", len(stored["sha256"]))

# --- checking a key (on every request) ---
def check_key(presented: str):
    digest = hashlib.sha256(presented.encode()).hexdigest()
    if hmac.compare_digest(digest, stored["sha256"]):   # constant-time compare
        return stored["owner"]
    return None

print("right key -&gt;", check_key(raw_key))
print("wrong key -&gt;", check_key("bf_live_guess"))</div>
<div class="fx" data-lang="text">give to Dosa Hut: 40 chars, starts bf_live_
store in DB     : ['prefix', 'sha256', 'owner'] hash length 64
right key -&gt; dosa-hut-till
wrong key -&gt; None</div>
  <p><code>secrets.token_urlsafe(24)</code> gives 24 random bytes (192 bits): unguessable. The database row holds only the hash. <code>hmac.compare_digest</code> takes the same time whether the first or last character is wrong; a plain <code>==</code> stops at the first mismatch, and over many requests that timing difference can leak how much of a guess is right (a <strong>timing attack</strong>). A fast hash like SHA-256 is fine here because the key is long and random; for human passwords it is not (next section).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>API key</strong>: a long random secret identifying a calling program or account, sent in a header, stored hashed, revocable and rotatable.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Keys in Git, in frontend JavaScript or mobile apps (anyone can extract them), or in URLs (<code>?api_key=</code> ends up in logs and browser history). Keep them in environment variables or a secrets manager, send them in headers.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: password hashing.</b> Keys suit programs. Asha is a person: she remembers a password, not 40 random characters. To check her password we must store <em>something</em>. If SHA-256 was fine for keys, why not for passwords?</div>

  <h2 id="aa-hash"><span class="num">03</span>Password Hashing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Databases leak: a public backup, an injection bug, a stolen laptop. Design for the day Biteful's <code>users</code> table is on a hacker forum. If it held Asha's password, or a value that reveals it quickly, her email and bank (she reuses passwords) are next. What should we store?</p>
  </div>
  <p>Never store the password. Store a hash; at login, hash what was typed and compare. But SHA-256 is designed to be <em>fast</em>, which here is a weakness: with leaked hashes, a GPU tries billions of guesses per second. And without a <strong>salt</strong> (random bytes mixed in per user), equal passwords give equal hashes, so precomputed tables (<strong>rainbow tables</strong>) crack common passwords instantly. Password hashing functions are salted and deliberately slow.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A lock that takes 3 seconds to open with the right key. For you, once a day, nothing. For a thief trying 10,000 keys, more than 8 hours on your doorstep.</p></div>
<div class="fx" data-lang="py">import hashlib, time, bcrypt
from argon2 import PasswordHasher

pw = b"asha@1997"                          # Asha's (weak) password
print("sha256 :", hashlib.sha256(pw).hexdigest()[:20], "... same every time")
print("sha256 :", hashlib.sha256(pw).hexdigest()[:20], "... same every time")

h1 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
h2 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
print("bcrypt 1:", h1.decode())
print("bcrypt 2:", h2.decode())            # different salt -&gt; different hash
print("check right:", bcrypt.checkpw(pw, h1), "| check wrong:", bcrypt.checkpw(b"asha@1998", h1))

t = time.perf_counter(); hashlib.sha256(pw).digest(); fast = time.perf_counter() - t
t = time.perf_counter(); bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12)); slow = time.perf_counter() - t
print(f"sha256: {fast*1e6:.1f} us   bcrypt(12): {slow*1e3:.0f} ms")

ph = PasswordHasher()                      # argon2id, memory-hard
h = ph.hash("asha@1997")
print("argon2:", h)
print("verify:", ph.verify(h, "asha@1997"))</div>
<div class="fx" data-lang="text">sha256 : 54193f69f8f56dc2c567 ... same every time
sha256 : 54193f69f8f56dc2c567 ... same every time
bcrypt 1: $2b$12$n5FH42dh.BNfaKX/3l.XLOLhovO5ClmsDW2AGLi/S3FrpIckvOwGi
bcrypt 2: $2b$12$YGEiXj/x4/4Oysvd2/RIsu2Bv8OTLFhom0GLeEh7xQb/Q5dXA.2fm
check right: True | check wrong: False
sha256: 22.3 us   bcrypt(12): 278 ms
argon2: $argon2id$v=19$m=65536,t=3,p=4$zfrqnO/hmXd7G2/Mu6q7yw$HodrOCDRzHTVJynB1gOsuWjXYhNvFyflC/hnZpnLxU8
verify: True</div>
  <p>SHA-256 printed the same value twice. The two bcrypt hashes of the <em>same</em> password differ, because <code>gensalt</code> picked a new salt each time. Read a bcrypt string: <code>$2b$</code> version, <code>12$</code> cost (2<sup>12</sup> rounds), the next 22 characters the salt, the rest the hash; the salt is stored inside, so <code>checkpw</code> can redo the work. Timing: 22 microseconds vs 278 milliseconds. The argon2 string records its settings: <code>m=65536</code> KB of memory, <code>t=3</code> passes, <code>p=4</code> lanes.</p>
  <table class="tbl"><caption>Rough attacker cost for a 10-billion-guess wordlist against one leaked hash</caption>
    <tr><th>Stored as</th><th>Guesses per second</th><th>Time to try all</th></tr>
    <tr><td>SHA-256 (one GPU)</td><td>~ 10<sup>10</sup></td><td>about 1 second</td></tr>
    <tr><td>bcrypt cost 12 (one CPU core, our 0.28 s)</td><td>~ 3.6</td><td>about 90 years</td></tr>
  </table>
  <p>Real attackers use many machines, but the gap of roughly nine zeros stays. <strong>argon2id</strong> is also <strong>memory-hard</strong>: each guess needs 64 MB of RAM, which GPUs cannot provide cheaply for thousands of parallel guesses. First choice for new systems; bcrypt is still fine.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Password hashing function</strong>: a deliberately slow, salted one-way function with tunable cost (bcrypt, scrypt, argon2id, PBKDF2). <strong>Salt</strong>: random bytes unique per password, stored with the hash. <strong>Cost factor</strong>: work per hash; raise it as hardware gets faster.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Encrypting" passwords (reversible: whoever has the key has every password), SHA-256/MD5, or one global salt. bcrypt uses only the first 72 bytes of a password. Use a library's <code>hash</code>/<code>verify</code>; never write your own.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: sessions and cookies.</b> We can check Asha's password at login, slowly, on purpose. We can't ask for it on every click, and we can't spend 0.28 s per request. How does one successful login cover all the requests after it?</div>

  <h2 id="aa-sess"><span class="num">04</span>Sessions &amp; Cookies</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha logs in on biteful.in once, then browses menus, orders, checks status: dozens of requests. HTTP is stateless (fundamentals section 10): each request must carry who she is. What does the browser carry, and how does logout work?</p>
  </div>
  <p>After the password check, the server creates a <strong>session</strong>: a row in a server-side store like <code>{"user": "asha"}</code>. The browser receives only a random <strong>session id</strong> in a <strong>cookie</strong>, which it sends back automatically on every later request to the site.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The shoe stand outside a temple. You hand over your shoes and get a numbered token. The token is worthless by itself; the shoes stay at the counter. If you lose the token, the counter refuses it. Session id = token, session row = shoes, logout = cancelling the number.</p></div>
<div class="fx" data-lang="py">import secrets, bcrypt
from fastapi import FastAPI, Cookie, Form, HTTPException, Response
from fastapi.testclient import TestClient

USERS = {"asha": bcrypt.hashpw(b"asha@1997", bcrypt.gensalt(rounds=12))}   # section 03
SESSIONS = {}                       # in prod: Redis, so every server copy sees the same rows
app = FastAPI()

@app.post("/v1/login")
def login(response: Response, username: str = Form(), password: str = Form()):
    hashed = USERS.get(username)
    if hashed is None or not bcrypt.checkpw(password.encode(), hashed):
        raise HTTPException(401, "wrong username or password")
    sid = secrets.token_urlsafe(32)                  # random, unguessable id
    SESSIONS[sid] = {"user": username}               # the real data stays on the server
    response.set_cookie("sid", sid, httponly=True, secure=True, samesite="lax")
    return {"ok": True}

@app.get("/v1/me")
def me(sid: str | None = Cookie(default=None)):
    if sid not in SESSIONS:
        raise HTTPException(401, "please log in")
    return SESSIONS[sid]

@app.post("/v1/logout")
def logout(sid: str | None = Cookie(default=None)):
    SESSIONS.pop(sid, None)                          # delete the row: logged out at once
    return {"ok": True}

c = TestClient(app, base_url="https://testserver")   # https, so the Secure cookie is sent back
print("wrong pw -&gt; ", c.post("/v1/login", data={"username": "asha", "password": "1234"}).status_code)
r = c.post("/v1/login", data={"username": "asha", "password": "asha@1997"})
print("Set-Cookie:", r.headers["set-cookie"][:12] + "...;", "; ".join(r.headers["set-cookie"].split("; ")[1:]))
print("/v1/me    -&gt;", c.get("/v1/me").status_code, c.get("/v1/me").json())
print("rows      -&gt;", len(SESSIONS))
c.post("/v1/logout")
print("/v1/me    -&gt;", c.get("/v1/me").status_code, c.get("/v1/me").json())</div>
<div class="fx" data-lang="text">wrong pw -&gt;  401
Set-Cookie: sid=kppKmTVt...; HttpOnly; Path=/; SameSite=lax; Secure
/v1/me    -&gt; 200 {'user': 'asha'}
rows      -&gt; 1
/v1/me    -&gt; 401 {'detail': 'please log in'}</div>
  <p>A wrong password gave 401 and no cookie. <code>TestClient</code> behaves like a browser: it kept the cookie from <code>/v1/login</code> and sent it to <code>/v1/me</code>. After <code>/v1/logout</code> deleted the row, the same cookie was useless at once: <strong>instant revocation</strong>, the big strength of sessions. The flags: <code>HttpOnly</code> hides the cookie from JavaScript (an injected script can't steal it), <code>Secure</code> sends it only over HTTPS, <code>SameSite=lax</code> stops other sites from sending it in background requests (a defence against <strong>CSRF</strong>, cross-site request forgery).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Session</strong>: server-side state for a logged-in user, found through a random <strong>session id</strong> carried in a cookie.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Sessions in a Python dict break the moment you run two server copies: the fundamentals note showed copy B answering 401 to copy A's session. Put them in Redis. And regenerate the session id at login, so an id planted before login (session fixation) is useless.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: JWT.</b> Every request now costs a lookup in a shared session store. Biteful has an orders service, a restaurants service and a payments service; all of them would hit that store on every call. Could the token itself say "this is Asha, a customer", in a way nobody can fake, so any service can check it alone?</div>

  <h2 id="aa-jwt"><span class="num">05</span>JWT</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want a token that carries Asha's identity and role inside it, that any Biteful service can check without asking a central store, and that she cannot edit into "admin". How can a piece of text be readable but unforgeable, and how does it stop working?</p>
  </div>
  <p>A <strong>JWT</strong> (JSON Web Token, said "jot") is three parts joined by dots: a <strong>header</strong> (which algorithm), a <strong>payload</strong> (the <strong>claims</strong>: who, role, expiry) and a <strong>signature</strong>: a short code computed from the first two parts and a secret key. Anyone holding the key can recompute the signature and see whether anything changed. The first two parts are only <strong>base64url</strong>-encoded: letters, digits, <code>-</code> and <code>_</code>, safe in URLs and headers, and reversible by anyone, like writing Hindi in Roman letters.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A festival wristband with a tamper-proof seal. Guards at every stage read it without phoning the office, and a broken seal means fake. But anyone can read what's printed on it, and a band already on a wrist can't be cancelled until the festival ends (expiry).</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <rect x="10" y="20" width="160" height="40" rx="6" class="fr sr"/><text x="90" y="45" text-anchor="middle">Header</text>
    <text x="180" y="45" font-size="22">.</text>
    <rect x="195" y="20" width="200" height="40" rx="6" class="fv sb"/><text x="295" y="45" text-anchor="middle">Payload (claims)</text>
    <text x="405" y="45" font-size="22">.</text>
    <rect x="420" y="20" width="170" height="40" rx="6" class="fb sb"/><text x="505" y="45" text-anchor="middle">Signature</text>
    <text x="90" y="82" text-anchor="middle" font-size="11" class="tm">{"alg":"HS256","typ":"JWT"}</text>
    <text x="295" y="82" text-anchor="middle" font-size="11" class="tm">{"sub":"asha","role":"customer","exp":…}</text>
    <text x="505" y="82" text-anchor="middle" font-size="11" class="tm">HMAC-SHA256(secret, part1.part2)</text>
    <text x="90" y="106" text-anchor="middle" font-size="12">base64url</text>
    <text x="295" y="106" text-anchor="middle" font-size="12">base64url, NOT encrypted</text>
    <text x="505" y="106" text-anchor="middle" font-size="12" class="tb">proves no tampering</text>
    <text x="300" y="138" text-anchor="middle" font-size="12" class="tr">Anyone can read it. Only the key holder can make a valid one.</text>
  </svg><figcaption>A JWT is three base64url pieces joined by dots.</figcaption></figure>
  <h3>Decode one by hand</h3>
  <p>Build Asha's token from scratch with only the standard library, then compare with the PyJWT library, read it without the key, and verify it by recomputing the signature:</p>
<div class="fx" data-lang="py">import base64, hashlib, hmac, json, jwt

SECRET = "change-me-to-32+-random-bytes-in-prod"

def b64url(raw: bytes) -&gt; str:                       # base64url, no '=' padding
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

# ---- build Asha's token BY HAND ----
header  = {"alg": "HS256", "typ": "JWT"}
payload = {"sub": "asha", "role": "customer", "exp": 1893456000}
part1 = b64url(json.dumps(header, separators=(",", ":")).encode())
part2 = b64url(json.dumps(payload, separators=(",", ":")).encode())
signing_input = f"{part1}.{part2}"
part3 = b64url(hmac.new(SECRET.encode(), signing_input.encode(), hashlib.sha256).digest())
by_hand = f"{part1}.{part2}.{part3}"
print("part1 (header) :", part1)
print("part2 (payload):", part2)
print("part3 (sig)    :", part3)

# ---- the library builds the same thing ----
lib = jwt.encode(payload, SECRET, algorithm="HS256")
print("PyJWT == by hand:", lib == by_hand)

# ---- anyone can READ it: no key needed ----
pad = lambda s: s + "=" * (-len(s) % 4)
print("decoded part2  :", json.loads(base64.urlsafe_b64decode(pad(part2))))

# ---- VERIFY = recompute the signature and compare, then check exp ----
def verify(token, secret):
    p1, p2, sig = token.split(".")
    expected = b64url(hmac.new(secret.encode(), f"{p1}.{p2}".encode(), hashlib.sha256).digest())
    return hmac.compare_digest(sig, expected)

print("verify, right secret:", verify(by_hand, SECRET))
print("verify, wrong secret:", verify(by_hand, "guess"))
print("PyJWT decode:", jwt.decode(by_hand, SECRET, algorithms=["HS256"]))</div>
<div class="fx" data-lang="text">part1 (header) : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
part2 (payload): eyJzdWIiOiJhc2hhIiwicm9sZSI6ImN1c3RvbWVyIiwiZXhwIjoxODkzNDU2MDAwfQ
part3 (sig)    : fBykxWiUTGDs71i-Bb8YxqhbcxBk9MmT-EuBmeGY3BM
PyJWT == by hand: True
decoded part2  : {'sub': 'asha', 'role': 'customer', 'exp': 1893456000}
verify, right secret: True
verify, wrong secret: False
PyJWT decode: {'sub': 'asha', 'role': 'customer', 'exp': 1893456000}</div>
  <table class="tbl"><caption>What each step did</caption>
    <tr><th>Step</th><th>Input</th><th>Output</th></tr>
    <tr><td>1 header</td><td><code>{"alg":"HS256","typ":"JWT"}</code></td><td>base64url → <code>eyJhbGciOi…</code> (every HS256 JWT starts like this)</td></tr>
    <tr><td>2 payload</td><td><code>{"sub":"asha","role":"customer","exp":1893456000}</code></td><td>base64url → <code>eyJzdWIiOi…</code></td></tr>
    <tr><td>3 signature</td><td>HMAC-SHA256(secret, "part1.part2")</td><td>32 bytes → base64url → <code>fBykxWiU…</code></td></tr>
    <tr><td>4 join</td><td>part1 . part2 . part3</td><td>identical to <code>jwt.encode</code>: <code>True</code></td></tr>
  </table>
  <p><strong>Verifying</strong> is step 3 again: recompute HMAC over the first two parts with the server's secret and compare with part 3 (constant-time). With the wrong secret the signatures differ. Change one letter of the payload and the recomputed signature no longer matches. <code>exp</code> 1893456000 is a Unix time (seconds since 1970) in 2030; decoding also checks it. Expiry, live:</p>
<div class="fx" data-lang="py">import time, jwt

SECRET = "change-me-to-32+-random-bytes-in-prod"
now = int(time.time())
token = jwt.encode({"sub": "asha", "iat": now, "exp": now + 2}, SECRET, algorithm="HS256")
print("seconds left:", jwt.decode(token, SECRET, algorithms=["HS256"])["exp"] - now)
time.sleep(3)                                            # the token is now 1 s past exp
try:
    jwt.decode(token, SECRET, algorithms=["HS256"])
except jwt.ExpiredSignatureError as e:
    print("after 3 s   :", type(e).__name__, "-", e)
print("leeway=5    :", jwt.decode(token, SECRET, algorithms=["HS256"], leeway=5)["sub"],
      "(tolerates small clock differences)")</div>
<div class="fx" data-lang="text">seconds left: 2
after 3 s   : ExpiredSignatureError - Signature has expired
leeway=5    : asha (tolerates small clock differences)</div>
  <p>A 2-second token decoded fine, then failed 3 seconds later with <code>ExpiredSignatureError</code>. <code>leeway</code> tolerates small clock differences between servers.</p>
  <h3>One secret, or a key pair?</h3>
  <p><strong>HS256</strong> uses one shared secret to sign and verify: fine when one service does both. If ten Biteful services verify, all ten hold the secret, and any of them could <em>issue</em> admin tokens. <strong>RS256</strong> (RSA) / <strong>ES256</strong> (elliptic curve) use a <strong>key pair</strong>: a private key that signs, kept by the auth service only, and a public key that only verifies, given to everyone. In PyJWT only the key changes: <code>jwt.encode(claims, private_key, algorithm="RS256")</code> and <code>jwt.decode(token, public_key, algorithms=["RS256"])</code>. Google publishes its public keys at a URL (a <strong>JWKS</strong>), so anyone can verify Google's tokens without Google's secret.</p>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Signs with</th><th>Verifies with</th><th>When</th></tr>
    <tr><td><code>HS256</code></td><td>shared secret</td><td>same secret</td><td>one service issues and checks</td></tr>
    <tr><td><code>RS256</code> / <code>ES256</code></td><td>private key</td><td>public key</td><td>many services verify; only the auth server issues</td></tr>
  </table>
  <h3>Claims, short expiry and refresh tokens</h3>
  <p>Standard claims: <code>sub</code> (subject: who), <code>exp</code> (expiry), <code>iat</code> (issued at), <code>iss</code> (issuer), <code>aud</code> (audience: which API), <code>jti</code> (unique token id). A JWT can't be cancelled once issued, so the <strong>access token</strong> lives briefly (about 15 minutes) and a longer-lived <strong>refresh token</strong> gets new ones; the server keeps the list of valid refresh-token ids, so logout can cancel those.</p>
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
  <p><code>refresh_access</code> removes the old id before issuing a new pair (<strong>rotation</strong>), so a stolen refresh token that is replayed is refused. After logout no new access tokens can be made; the current one works for at most 15 minutes.</p>
  <h3>JWT in Biteful's FastAPI app</h3>
  <p>Now the placeholders from the FastAPI note become real. One server with three kinds of caller: Dosa Hut's till (API key, stored hashed), people who log in with a password (bcrypt) and get a 15-minute JWT, and role plus ownership checks, all as dependencies. (bcrypt cost 4 keeps this demo's startup fast; use 12 in production.)</p>
<div class="fx" data-lang="py"># auth_app.py: Biteful's API with real identity, as FastAPI dependencies
import hashlib, hmac, time
import bcrypt, jwt
from fastapi import Depends, FastAPI, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

SECRET = "change-me-to-32+-random-bytes-in-prod"            # from a secrets manager in prod
API_KEYS = {hashlib.sha256(b"bf_live_9f2c7a").hexdigest(): "dosa-hut-till"}   # only hashes stored
USERS = {"asha":  {"pw": bcrypt.hashpw(b"asha@1997", bcrypt.gensalt(4)), "role": "customer"},
         "ben":   {"pw": bcrypt.hashpw(b"ben@2001", bcrypt.gensalt(4)), "role": "customer"},
         "ravi":  {"pw": bcrypt.hashpw(b"ravi@dosa", bcrypt.gensalt(4)), "role": "staff", "restaurant": 10},
         "meera": {"pw": bcrypt.hashpw(b"meera@hq", bcrypt.gensalt(4)), "role": "admin"}}
ORDERS = {101: {"order_id": 101, "customer": "asha", "restaurant_id": 10, "total": 240, "status": "placed"},
          102: {"order_id": 102, "customer": "ben", "restaurant_id": 11, "total": 350, "status": "placed"}}

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["https://partners.biteful.in"],
                   allow_methods=["GET", "PATCH"], allow_headers=["Authorization", "Content-Type"])

# ---------- gate 1: authentication ----------
def till_key(x_api_key: str = Header(default="")):
    owner = API_KEYS.get(hashlib.sha256(x_api_key.encode()).hexdigest())
    if owner is None:
        raise HTTPException(401, "invalid API key")
    return owner

def current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "missing bearer token", headers={"WWW-Authenticate": "Bearer"})
    try:
        return jwt.decode(authorization[7:], SECRET, algorithms=["HS256"])   # signature + exp
    except jwt.PyJWTError:
        raise HTTPException(401, "invalid or expired token")

# ---------- gate 2: authorization ----------
def require_role(role: str):
    def check(user=Depends(current_user)):            # AuthN runs first, inside AuthZ
        if user["role"] != role:
            raise HTTPException(403, "forbidden: needs role " + role)
        return user
    return check

@app.post("/v1/login")
def login(username: str = Form(), password: str = Form()):
    u = USERS.get(username)
    if u is None or not bcrypt.checkpw(password.encode(), u["pw"]):
        raise HTTPException(401, "wrong username or password")
    claims = {"sub": username, "role": u["role"], "exp": int(time.time()) + 900}
    if "restaurant" in u:
        claims["restaurant"] = u["restaurant"]
    return {"access_token": jwt.encode(claims, SECRET, "HS256"), "token_type": "bearer"}

@app.get("/v1/partner/orders")                        # Dosa Hut's till, a program: API key
def till_orders(owner=Depends(till_key)):
    return {"caller": owner, "orders": [o["order_id"] for o in ORDERS.values() if o["restaurant_id"] == 10]}

@app.get("/v1/orders/{oid}")                          # a customer reads THEIR order
def get_order(oid: int, user=Depends(current_user)):
    order = ORDERS.get(oid)
    if order is None or order["customer"] != user["sub"]:
        raise HTTPException(404, "order not found")   # ownership check (section 11)
    return order

@app.patch("/v1/orders/{oid}")                        # staff of THAT restaurant only
def mark(oid: int, status: str, user=Depends(require_role("staff"))):
    order = ORDERS.get(oid)
    if order is None or order["restaurant_id"] != user["restaurant"]:
        raise HTTPException(404, "order not found")
    order["status"] = status
    return order

@app.delete("/v1/restaurants/{rid}")
def delete_restaurant(rid: int, user=Depends(require_role("admin"))):
    return {"deleted": rid, "by": user["sub"]}</div>
  <p>Run with <code>uvicorn auth_app:app --port 8011</code>. Log in three people, then decode the payloads with plain <code>base64</code> (no key needed):</p>
<div class="fx" data-lang="text">$ ASHA=$(curl -s -X POST localhost:8011/v1/login -d "username=asha&amp;password=asha@1997" \\
         | python3 -c 'import sys, json; print(json.load(sys.stdin)["access_token"])')
$ BEN=...  RAVI=...      (same call with their passwords)
$ echo $ASHA | cut -d. -f2 | base64 -d 2&gt;/dev/null; echo
{"sub":"asha","role":"customer","exp":1792456843}

$ echo $RAVI | cut -d. -f2 | base64 -d 2&gt;/dev/null; echo
{"sub":"ravi","role":"staff","exp":1792456843,"restaurant":10}

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:8011/v1/login -d 'username=asha&amp;password=123456'
{"detail":"wrong username or password"} [401]</div>
<div class="fx" data-lang="text">$ curl -s -w ' [%{http_code}]\\n' localhost:8011/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'
{"caller":"dosa-hut-till","orders":[101]} [200]

$ curl -s -w ' [%{http_code}]\\n' localhost:8011/v1/partner/orders -H 'X-API-Key: guess'
{"detail":"invalid API key"} [401]

$ curl -s -w ' [%{http_code}]\\n' localhost:8011/v1/orders/101 -H "Authorization: Bearer $ASHA"
{"order_id":101,"customer":"asha","restaurant_id":10,"total":240,"status":"placed"} [200]

$ curl -s -w ' [%{http_code}]\\n' localhost:8011/v1/orders/101
{"detail":"missing bearer token"} [401]

$ curl -s -w ' [%{http_code}]\\n' localhost:8011/v1/orders/101 -H "Authorization: Bearer $BEN"
{"detail":"order not found"} [404]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH 'localhost:8011/v1/orders/101?status=preparing' -H "Authorization: Bearer $ASHA"
{"detail":"forbidden: needs role staff"} [403]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH 'localhost:8011/v1/orders/101?status=preparing' -H "Authorization: Bearer $RAVI"
{"order_id":101,"customer":"asha","restaurant_id":10,"total":240,"status":"preparing"} [200]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH 'localhost:8011/v1/orders/102?status=preparing' -H "Authorization: Bearer $RAVI"
{"detail":"order not found"} [404]

$ curl -s -w ' [%{http_code}]\\n' -X DELETE localhost:8011/v1/restaurants/14 -H "Authorization: Bearer $RAVI"
{"detail":"forbidden: needs role admin"} [403]

$ curl -s -w ' [%{http_code}]\\n' localhost:8011/v1/orders/101 -H 'Authorization: Bearer abc.def.ghi'
{"detail":"invalid or expired token"} [401]</div>
  <table class="tbl"><caption>Every call, explained</caption>
    <tr><th>Call</th><th>Gate that decided</th><th>Code</th></tr>
    <tr><td>till with the right key / a guess</td><td><code>till_key</code> (AuthN)</td><td>200 / 401</td></tr>
    <tr><td>Asha reads order 101</td><td><code>current_user</code> ok, ownership ok</td><td>200</td></tr>
    <tr><td>no token</td><td><code>current_user</code></td><td>401</td></tr>
    <tr><td>Ben reads order 101</td><td>AuthN ok, ownership fails</td><td>404 (hides that 101 exists)</td></tr>
    <tr><td>Asha patches 101</td><td><code>require_role("staff")</code></td><td>403</td></tr>
    <tr><td>Ravi patches 101 (Dosa Hut) / 102 (Biryani Bros)</td><td>role ok; restaurant check</td><td>200 / 404</td></tr>
    <tr><td>Ravi deletes restaurant 14</td><td><code>require_role("admin")</code></td><td>403</td></tr>
    <tr><td>garbage token</td><td><code>jwt.decode</code> raised</td><td>401, generic message</td></tr>
  </table>
  <p>Ravi's token carries <code>"restaurant": 10</code>, so the PATCH endpoint can check "your restaurant's order" without any lookup: the per-object rule section 01's role table couldn't express.</p>
  <table class="tbl">
    <tr><th></th><th>Server session</th><th>JWT</th></tr>
    <tr><td>State</td><td>server-side (Redis/DB)</td><td>inside the token</td></tr>
    <tr><td>Each request</td><td>lookup by session id</td><td>verify signature, no lookup</td></tr>
    <tr><td>Logout / revoke</td><td>delete the row: instant</td><td>hard: valid until <code>exp</code> (short expiry, refresh rotation, jti denylist)</td></tr>
    <tr><td>Many services / copies</td><td>shared store needed</td><td>any holder of the key verifies</td></tr>
    <tr><td>Best for</td><td>one web app in a browser</td><td>mobile apps, SPAs, many services</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>JWT</strong>: <code>base64url(header).base64url(payload).base64url(signature)</code>, where the signature proves header and payload were made by a key holder and unchanged. <strong>Claims</strong>: the payload's facts. <strong>Bearer token</strong>: sent as <code>Authorization: Bearer &lt;token&gt;</code>; whoever holds it is trusted. <strong>Refresh token</strong>: longer-lived, used only to get new access tokens.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"A JWT is encrypted" is the most common wrong answer: we just read Ravi's payload with <code>base64 -d</code>. It is <em>signed</em>: tamper-proof but readable. For hidden content use JWE or keep the data server-side.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: JWT traps.</b> The signature makes editing useless, if the server checks it properly. Attackers know the maths is solid and go after the checking code instead. What do they try, and which single argument stops most of it?</div>

  <h2 id="aa-jwttrap"><span class="num">06</span>JWT Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha decodes her own token, sees <code>"role":"customer"</code>, and wonders what happens if she changes it to admin. Others try old tokens, unsigned tokens, or hope a developer switched verification off. Which of these work against our server, and why?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Back to the wristband. Trick 1: cut the "VIP" print from another band and stick it on yours (the seal breaks). Trick 2: wear last year's band (expired). Trick 3: show a band printed "no seal needed" and hope the guard believes the band instead of the rulebook. Trick 4: find a guard who doesn't check seals at all.</p></div>
<div class="fx" data-lang="py">import jwt, base64, json, time

SECRET = "change-me-to-32+-random-bytes-in-prod"
token = jwt.encode({"sub": "asha", "role": "customer", "exp": 1893456000},
                   SECRET, algorithm="HS256")
header_b64, payload_b64, sig_b64 = token.split(".")

# 1) Tampering: Asha edits role to admin, keeps the old signature
evil_payload = base64.urlsafe_b64encode(json.dumps(
    {"sub": "asha", "role": "admin", "exp": 1893456000}).encode()).rstrip(b"=").decode()
forged = f"{header_b64}.{evil_payload}.{sig_b64}"
try:
    jwt.decode(forged, SECRET, algorithms=["HS256"])
except jwt.InvalidSignatureError as e:
    print("Forged:", type(e).__name__, "-", e)

# 2) Expired token replayed
old = jwt.encode({"sub": "asha", "exp": int(time.time()) - 10}, SECRET, algorithm="HS256")
try:
    jwt.decode(old, SECRET, algorithms=["HS256"])
except jwt.ExpiredSignatureError as e:
    print("Old:", type(e).__name__, "-", e)

# 3) The 'none' algorithm attack: an unsigned token claiming admin
none_tok = jwt.encode({"sub": "asha", "role": "admin"}, None, algorithm="none")
print(none_tok)
try:
    jwt.decode(none_tok, SECRET, algorithms=["HS256"])
except jwt.InvalidAlgorithmError as e:
    print("none alg:", type(e).__name__, "-", e)

# 4) The BUG that lets it through: skipping verification
print("UNSAFE:", jwt.decode(none_tok, options={"verify_signature": False}))</div>
<div class="fx" data-lang="text">Forged: InvalidSignatureError - Signature verification failed
Old: ExpiredSignatureError - Signature has expired
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhc2hhIiwicm9sZSI6ImFkbWluIn0.
none alg: InvalidAlgorithmError - The specified alg value is not allowed
UNSAFE: {'sub': 'asha', 'role': 'admin'}</div>
  <table class="tbl"><caption>What happened to each attack</caption>
    <tr><th>#</th><th>Attack</th><th>What changed</th><th>Why it failed (or not)</th></tr>
    <tr><td>1</td><td>Tamper</td><td><code>role</code> → admin, old signature kept</td><td>signature was computed over the old payload → mismatch</td></tr>
    <tr><td>2</td><td>Replay old token</td><td>nothing; <code>exp</code> past</td><td>PyJWT checks <code>exp</code> automatically</td></tr>
    <tr><td>3</td><td><code>alg: none</code></td><td>header says "no signature"; third part empty</td><td><code>algorithms=["HS256"]</code> rejects "none"</td></tr>
    <tr><td>4</td><td>Same token, lazy server</td><td>nothing</td><td><code>verify_signature: False</code> trusts anything → admin!</td></tr>
  </table>
  <p>Look at the <code>none</code> token: it ends with a dot and nothing after it. Old JWT libraries read <code>alg</code> from the token and obeyed it, so this passed. The defence is the <code>algorithms=[...]</code> argument: <em>you</em> decide which algorithm is acceptable, not the token. Case 4 is the same hole made by hand, often added "just to debug" and shipped.</p>
  <div class="callout trap"><span class="label">Trap: secrets in the payload</span><p>The payload is only encoded. A password, an API key, a phone number or any personal data in it is published to everyone who sees the token (logs, browser storage, proxies). Put only ids and roles there.</p></div>
  <div class="callout trap"><span class="label">Trap: algorithm confusion</span><p>Server uses RS256; its public key is public. An attacker makes a token with <code>"alg":"HS256"</code> and signs it with HMAC using the public key as the "secret". A server that reads <code>alg</code> from the token checks HMAC with the same public key, and it matches. Pinning <code>algorithms=["RS256"]</code> closes it.</p></div>
  <div class="callout trap"><span class="label">Trap: no audience check</span><p>A token issued for the orders API is accepted by the payments API because both trust the same issuer. Set <code>aud</code> when issuing and pass <code>audience=</code> when decoding.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Safe decode</strong>: <code>jwt.decode(token, key, algorithms=[exact_alg], audience=..., issuer=...)</code> inside a <code>try</code> that returns 401 on any <code>PyJWTError</code>, with a generic message.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: OAuth 2.0.</b> We issue our own tokens after checking our own passwords. Biteful also wants "Sign in with Google", and a partner app wants to read Asha's Biteful order history. Neither should ever see a password. How does an app get limited access on a user's behalf?</div>

  <h2 id="aa-oauth"><span class="num">07</span>OAuth 2.0</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha taps "Sign in with Google" in the Biteful app. Biteful must learn who she is without seeing her Google password, and must not be able to read her Gmail. Separately, Dosa Hut's accounting software (a machine) needs a token for Biteful's reports API. How are these tokens obtained, and why the extra steps?</p>
  </div>
  <p><strong>OAuth 2.0</strong> is the standard for this. The user types the password only on the identity provider's own page; the app gets a limited <strong>access token</strong> with <strong>scopes</strong> (permissions like <code>openid email</code>). Four parties: the <strong>user</strong> (Asha), the <strong>client</strong> (the Biteful app), the <strong>authorization server</strong> (Google's login and token service), and the <strong>resource server</strong> (the API that accepts the token).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hotel key card. Reception checks your passport once and issues a card that opens only your room and the gym (scopes), only until checkout (expiry). The room door never sees your passport, and reception can cancel the card any time.</p></div>
  <h3>Authorization code + PKCE (people, in apps and browsers)</h3>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
    <defs><marker id="aa-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="5" width="140" height="30" rx="6" class="fv sb"/><text x="75" y="25" text-anchor="middle" font-size="12">Asha's browser</text>
    <rect x="185" y="5" width="140" height="30" rx="6" class="fb sb"/><text x="255" y="25" text-anchor="middle" font-size="12">Biteful app/backend</text>
    <rect x="365" y="5" width="150" height="30" rx="6" class="ft st"/><text x="440" y="25" text-anchor="middle" font-size="12">Google auth server</text>
    <rect x="555" y="5" width="120" height="30" rx="6" class="fg sg"/><text x="615" y="25" text-anchor="middle" font-size="12">Resource API</text>
    <line x1="75" y1="35" x2="75" y2="325" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="255" y1="35" x2="255" y2="325" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="440" y1="35" x2="440" y2="325" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="615" y1="35" x2="615" y2="325" stroke="currentColor" stroke-dasharray="4 4"/>
    <line x1="253" y1="60" x2="77" y2="60" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="165" y="54" text-anchor="middle" font-size="10">1a redirect: go to Google</text>
    <line x1="75" y1="84" x2="438" y2="84" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="257" y="78" text-anchor="middle" font-size="10">1b GET /authorize?client_id, scope, redirect_uri, state, code_challenge</text>
    <line x1="75" y1="116" x2="438" y2="116" stroke="currentColor" stroke-dasharray="2 2" marker-end="url(#aa-ar)"/><text x="257" y="110" text-anchor="middle" font-size="10">2 Asha logs in + consents ON GOOGLE'S PAGE (password never leaves here)</text>
    <line x1="438" y1="148" x2="77" y2="148" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="257" y="142" text-anchor="middle" font-size="10">3a redirect to biteful.in/callback?code=…&amp;state=…</text>
    <line x1="75" y1="172" x2="253" y2="172" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="165" y="166" text-anchor="middle" font-size="10">3b browser delivers the code</text>
    <line x1="255" y1="210" x2="438" y2="210" stroke="currentColor" stroke-width="2" marker-end="url(#aa-ar)"/><text x="347" y="204" text-anchor="middle" font-size="10" class="tb">4 POST /token: code + code_verifier</text>
    <line x1="438" y1="240" x2="257" y2="240" stroke="currentColor" stroke-width="2" marker-end="url(#aa-ar)"/><text x="347" y="234" text-anchor="middle" font-size="10" class="tg">5 access token (+ id_token, refresh)</text>
    <line x1="255" y1="280" x2="613" y2="280" stroke="currentColor" marker-end="url(#aa-ar)"/><text x="435" y="274" text-anchor="middle" font-size="10">6 Authorization: Bearer access_token</text>
    <text x="165" y="318" text-anchor="middle" font-size="10" class="tm">front channel (via browser, URLs can leak)</text>
    <text x="440" y="318" text-anchor="middle" font-size="10" class="tm">back channel (direct, thick arrows)</text>
  </svg><figcaption>Thin arrows pass through the browser as redirects: the <em>front channel</em>, where URLs land in history and logs. Thick arrows go server-to-server: the <em>back channel</em>. The code crosses the front channel, so it alone must be worthless; tokens travel only on the back channel.</figcaption></figure>
  <ol>
    <li>Biteful redirects Asha's browser to Google's <code>/authorize</code> with its <code>client_id</code>, the scopes it wants, where to come back (<code>redirect_uri</code>), a random <code>state</code> (to reject forged callbacks), and a <code>code_challenge</code>.</li>
    <li>Asha logs in <em>on Google's page</em> and clicks Allow. Biteful never sees this.</li>
    <li>Google redirects the browser back to Biteful's callback with a one-time <strong>authorization code</strong> in the URL. A code is not a token; alone it opens nothing.</li>
    <li>Biteful's backend sends the code plus the <code>code_verifier</code> directly to Google's token endpoint.</li>
    <li>Google checks both and returns tokens: an access token, usually a refresh token, and with OpenID Connect an <strong>ID token</strong>.</li>
    <li>The access token is used as <code>Authorization: Bearer …</code> on the resource API.</li>
  </ol>
  <p><strong>Being honest about "Sign in with Google".</strong> For login, Biteful mostly needs step 5's ID token (a JWT signed by Google saying "this is asha@gmail.com"), verified with Google's public keys (JWKS). Biteful then issues <em>its own</em> session or JWT, as in sections 04–05. Step 6 matters only if Biteful wants Google data (it doesn't). That login layer is <strong>OpenID Connect</strong> (OIDC), built on top of OAuth.</p>
  <p><strong>PKCE</strong> (Proof Key for Code Exchange, "pixy") makes a stolen code worthless. The app invents a random secret, the <strong>verifier</strong>, and sends only its SHA-256 hash, the <strong>challenge</strong>, in step 1. In step 4 it sends the raw verifier; the server hashes it and compares. A thief who grabbed the code from the URL in step 3 never saw the verifier and can't derive it from the hash:</p>
<div class="fx" data-lang="py">import secrets, hashlib, base64

def s256(verifier: str) -&gt; str:
    digest = hashlib.sha256(verifier.encode()).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode()

# Step 1 (Biteful app): make a secret verifier, send only its hash to Google
verifier = secrets.token_urlsafe(48)                    # stays inside Asha's phone
challenge = s256(verifier)
print("code_verifier :", verifier[:20] + "...", len(verifier), "chars")
print("code_challenge:", challenge[:20] + "...", "(sent in step 1, method=S256)")

# Step 5 (Google's token endpoint): the code arrives with a verifier; hash it and compare
def redeem(code_verifier: str) -&gt; str:
    return "tokens issued" if s256(code_verifier) == challenge else "invalid_grant"

print("Biteful app:", redeem(verifier))
print("code thief :", redeem(secrets.token_urlsafe(48)))   # stole the code, not the verifier</div>
<div class="fx" data-lang="text">code_verifier : aK7k0VCiiGHG0f16161t... 64 chars
code_challenge: JQDm2PlfEK5K4x3dNn3R... (sent in step 1, method=S256)
Biteful app: tokens issued
code thief : invalid_grant</div>
  <p><code>s256</code> is exactly the transform the standard calls "S256": SHA-256, then base64url without padding. The random strings change every run; the last two lines don't.</p>
  <h3>Client credentials (machine to machine)</h3>
  <p>Dosa Hut's accounting software calls Biteful's reports API nightly. No human, no browser. It sends its own <code>client_id</code> and <code>client_secret</code> straight to the token endpoint and gets a short-lived token with narrow scopes. This is the shape the standard (RFC 6749) defines; Biteful has no OAuth server in our demos, so this block was <strong>not run</strong>:</p>
<div class="fx" data-lang="text">$ curl -X POST https://auth.biteful.in/oauth/token \\
    -d grant_type=client_credentials -d client_id=dosa-hut-accounts \\
    -d client_secret="$CLIENT_SECRET" -d scope=reports:read
# response shape defined by RFC 6749 (illustrative, not a captured run):
{"access_token":"eyJhbGciOiJSUzI1NiIs...","token_type":"Bearer","expires_in":3600,"scope":"reports:read"}</div>
  <p>Compared to a plain API key, the secret goes only to the auth server (not to every API), and the token that travels around expires in an hour.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>OAuth 2.0</strong>: a framework for a client to get limited, revocable access to a resource on behalf of a user (or itself) via tokens from an authorization server. <strong>Grant</strong>: one way of getting a token (authorization code + PKCE, client credentials, refresh token, device code). <strong>OIDC</strong>: identity layer adding the ID token.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>OAuth alone is about access, not login: use OIDC's ID token for "who is this". The <em>implicit</em> flow (token in the URL) and the <em>password</em> grant (app collects the user's password) are deprecated. Always check <code>state</code> and use PKCE, even for web apps.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: HTTPS / TLS.</b> Passwords, API keys, cookies, bearer tokens, OAuth codes: every scheme so far sends a secret over the network on every request. Asha orders from a café's free Wi-Fi. Who else can read those bytes?</div>

  <h2 id="aa-tls"><span class="num">08</span>HTTPS / TLS</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On plain HTTP every byte, including <code>Authorization: Bearer eyJ…</code> and <code>X-API-Key</code>, travels as readable text through the café router and every network on the way. Anyone there can copy the token and become Asha, or change the response. And how does Asha's app know it is really talking to Biteful, not an impostor?</p>
  </div>
  <p><strong>HTTPS</strong> is HTTP inside a <strong>TLS</strong> (Transport Layer Security) connection. TLS gives three things: <strong>encryption</strong> (eavesdroppers see gibberish), <strong>integrity</strong> (changed bytes are detected), and <strong>server authentication</strong> (you are really talking to <code>api.biteful.in</code>). The third comes from a <strong>certificate</strong>: a file saying "this public key belongs to api.biteful.in", signed by a <strong>Certificate Authority</strong> (CA) such as Let's Encrypt that your device already trusts.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>HTTP is a postcard: anyone handling it can read and edit it. HTTPS is a sealed, tamper-evident envelope, handed over only after you check the courier's ID badge, issued by an office you already trust (the CA).</p></div>
  <div class="flow"><span>Client hello</span><span>Server sends certificate</span><span>Client checks it against trusted CAs</span><span>Both derive a shared session key</span><span>Encrypted HTTP</span></div>
  <p>To see the "check the badge" step, we made a <strong>self-signed</strong> certificate (the server vouches for itself, no CA) and ran the section 05 app with TLS:</p>
<div class="fx" data-lang="text">$ openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 30 \\
    -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost"
$ uvicorn auth_app:app --port 8443 --ssl-keyfile key.pem --ssl-certfile cert.pem</div>
<div class="fx" data-lang="text">$ curl -s https://localhost:8443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'; echo "exit code $?"
exit code 60

$ curl -sS https://localhost:8443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'
curl: (60) SSL certificate problem: self-signed certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.

$ curl -s --cacert cert.pem https://localhost:8443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'
{"caller":"dosa-hut-till","orders":[101]}
$ curl -sv --cacert cert.pem https://localhost:8443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a' 2&gt;&amp;1 | grep -E 'SSL connection|subject:|issuer:|verify ok'
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / RSASSA-PSS
*  subject: CN=localhost
*  issuer: CN=localhost
*  SSL certificate verify ok.

$ curl -sS http://localhost:8443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'
curl: (52) Empty reply from server</div>
  <p>curl refused to talk (exit code 60): the certificate isn't signed by a CA it trusts, so the identity check failed, and no API key was sent. With <code>--cacert cert.pem</code> we told curl to trust this certificate, and the till's call worked over TLS 1.3. <code>subject</code> equals <code>issuer</code>: that is what self-signed means. The last call spoke plain HTTP to a TLS port and got nothing. In production a free Let's Encrypt certificate is used and no client flag is needed.</p>
  <p>Usually TLS ends at the load balancer or nginx (<strong>TLS termination</strong>, <a class="xref" data-note="api_production">Production</a>), which forwards plain HTTP inside a private network. Stricter setups re-encrypt inside, often with <strong>mTLS</strong> (mutual TLS: the client shows a certificate too).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>TLS</strong>: protocol giving confidentiality, integrity and server authentication. <strong>Certificate</strong>: a CA-signed binding of a domain name to a public key. <strong>HTTPS</strong>: HTTP over TLS, port 443.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Bearer tokens, API keys and cookies over plain HTTP are sent in clear text: HTTPS is mandatory. And never "fix" a certificate error with <code>requests.get(url, verify=False)</code> or <code>curl -k</code>: that switches off the identity check, so anyone in the middle can pretend to be the server.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: CORS.</b> The connection is now safe. But browsers add a rule of their own: Biteful's partner dashboard at <code>partners.biteful.in</code> calls <code>api.biteful.in</code> and gets a red "CORS error", while curl works fine. What is the browser protecting, and from whom?</div>

  <h2 id="aa-cors"><span class="num">09</span>CORS</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha is logged in to Biteful in one browser tab. In another she opens a random site. If that site's JavaScript could call Biteful's API with her cookies and read the answers, it could read her orders and address. Browsers prevent that. But then how does Biteful's own dashboard on a different domain get through, and does this protect the API itself?</p>
  </div>
  <p>Browsers enforce the <strong>same-origin policy</strong>: JavaScript from one <strong>origin</strong> (scheme + host + port, e.g. <code>https://partners.biteful.in</code>) may not read responses from another origin. <strong>CORS</strong> (Cross-Origin Resource Sharing) is how an API says "these specific origins are allowed". For non-simple requests (custom headers like <code>Authorization</code>, methods like PATCH) the browser first sends a <strong>preflight</strong>: an <code>OPTIONS</code> request asking permission. Our section 05 app allows only <code>https://partners.biteful.in</code>. Four real calls:</p>
<div class="fx" data-lang="text">$ curl -si -X OPTIONS localhost:8011/v1/orders/101 -H 'Origin: https://partners.biteful.in' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: Authorization' | grep -iE '^HTTP|^access-control|^vary'
HTTP/1.1 200 OK
vary: Origin
access-control-allow-methods: GET, PATCH
access-control-max-age: 600
access-control-allow-headers: Accept, Accept-Language, Authorization, Content-Language, Content-Type
access-control-allow-origin: https://partners.biteful.in

$ curl -si -X OPTIONS localhost:8011/v1/orders/101 -H 'Origin: https://evil.example' -H 'Access-Control-Request-Method: GET' | grep -iE '^HTTP|^access-control-allow-origin|^Disallowed'
HTTP/1.1 400 Bad Request
Disallowed CORS origin

$ curl -si localhost:8011/v1/orders/101 -H 'Origin: https://evil.example' -H "Authorization: Bearer $ASHA" | grep -iE '^HTTP|^access-control|^\\{'
HTTP/1.1 200 OK
{"order_id":101,"customer":"asha","restaurant_id":10,"total":240,"status":"preparing"}

$ curl -si localhost:8011/v1/orders/101 -H 'Origin: https://partners.biteful.in' -H "Authorization: Bearer $ASHA" | grep -iE '^HTTP|^access-control|^\\{'
HTTP/1.1 200 OK
access-control-allow-origin: https://partners.biteful.in
{"order_id":101,"customer":"asha","restaurant_id":10,"total":240,"status":"preparing"}</div>
  <ul>
    <li><strong>Call 1</strong>: the preflight a browser on the dashboard would send. The reply names the dashboard in <code>access-control-allow-origin</code>, so the browser proceeds (and caches the answer for <code>max-age</code> 600 s).</li>
    <li><strong>Call 2</strong>: preflight from an unknown site: 400, no allow-origin header. A browser would never send the real request.</li>
    <li><strong>Call 3, the lesson</strong>: the real GET "from evil.example" with Asha's valid token still returned 200 and her order. Only the missing allow-origin header would make a <em>browser</em> hide the answer from that page's JavaScript; curl ignores it.</li>
    <li><strong>Call 4</strong>: from the dashboard, the response carries the allow-origin header.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>The building watchman (the browser) phones the flat (the API) before letting a visitor up: "someone from partners.biteful.in is here". The flat says yes or no. A thief climbing the back wall (curl, a script) never meets the watchman. The watchman protects the residents' visitors, not the flat itself.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Origin</strong>: scheme + host + port. <strong>CORS</strong>: response headers (<code>Access-Control-Allow-Origin</code>, <code>-Methods</code>, <code>-Headers</code>, <code>-Credentials</code>) that relax the browser's same-origin policy for listed origins. <strong>Preflight</strong>: the browser's <code>OPTIONS</code> request before a non-simple cross-origin call.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>CORS is not authentication; your token check is what protected Asha's order. And <code>allow_origins=["*"]</code> with <code>allow_credentials=True</code> is a misconfiguration: the spec forbids it, and libraries that "fix" it by echoing any origin make every site trusted.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: rate limiting.</b> Every lock is in place, but a lock can be picked by trying keys. A bot can call <code>/v1/login</code> for Asha with the 10,000 most common passwords. Nothing so far stops it from trying.</div>

  <h2 id="aa-rl"><span class="num">10</span>Rate Limiting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha's password is weak (<code>asha@1997</code>). A bot tries common passwords against her account (<strong>brute force</strong>), or replays email/password pairs leaked from other sites (<strong>credential stuffing</strong>). Each try costs it nothing. How do we make guessing hopeless without locking Asha out forever?</p>
  </div>
  <p>Count failed attempts per account (and per IP) in a time window; above a threshold, answer <strong>429 Too Many Requests</strong> with a <code>Retry-After</code> header, <em>before</em> checking the password. Dry run: limit 5 failures per 60 s; guesses 1–5 are wrong (401 each, counter 1…5); guess 6 finds 5 recent failures → 429; guess 7 is the right password, still 429.</p>
<div class="fx" data-lang="py">import time
from collections import defaultdict
from fastapi import FastAPI, Form, HTTPException
from fastapi.testclient import TestClient

MAX_TRIES, WINDOW_S = 5, 60
failures = defaultdict(list)            # username -&gt; times of recent failed logins (Redis in prod)

app = FastAPI()

@app.post("/v1/login")
def login(username: str = Form(), password: str = Form()):
    now = time.time()
    recent = [t for t in failures[username] if now - t &lt; WINDOW_S]
    failures[username] = recent
    if len(recent) &gt;= MAX_TRIES:
        raise HTTPException(429, "too many attempts, try later",
                            headers={"Retry-After": str(int(WINDOW_S - (now - recent[0])) + 1)})
    if password != "asha@1997":         # stand-in for bcrypt.checkpw
        failures[username].append(now)
        raise HTTPException(401, "wrong username or password")
    failures.pop(username, None)
    return {"ok": True}

c = TestClient(app)
for guess in ["123456", "password", "qwerty", "asha123", "iloveyou", "letmein", "asha@1997"]:
    r = c.post("/v1/login", data={"username": "asha", "password": guess})
    print(f"{guess:10} -&gt; {r.status_code} {r.json()['detail'] if r.status_code != 200 else r.json()}",
          r.headers.get("retry-after", ""))</div>
<div class="fx" data-lang="text">123456     -&gt; 401 wrong username or password 
password   -&gt; 401 wrong username or password 
qwerty     -&gt; 401 wrong username or password 
asha123    -&gt; 401 wrong username or password 
iloveyou   -&gt; 401 wrong username or password 
letmein    -&gt; 429 too many attempts, try later 60
asha@1997  -&gt; 429 too many attempts, try later 60</div>
  <p>Exactly the dry run. Even the correct password waits 60 seconds, which is what makes guessing hopeless: at 5 guesses a minute, a 10,000-word list takes about 33 hours per account. The message "wrong username or password" is the same either way, so an attacker can't learn which usernames exist. The same idea per API key stops one client draining your capacity or copying a model by mass querying (<strong>model extraction</strong>).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Rate limit</strong>: a cap on requests (or failures) per client per time window, answered with 429 and <code>Retry-After</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>This counter lives in one process's memory: with 4 server copies the attacker gets 4× the tries. Keep counters in Redis. Token buckets, sliding windows and nginx limits are in <a class="xref" data-note="api_production">Production Backend</a>. Also watch for stuffing: many accounts, few tries each, from many IPs.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: BOLA and the OWASP risks.</b> Identity is proven, roles are checked, the line is encrypted, guessing is throttled. Yet the most common real API breach involves none of these failing. What do attackers actually do to a well-locked API?</div>

  <h2 id="aa-owasp"><span class="num">11</span>BOLA &amp; the OWASP API Risks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ben is a real, logged-in customer with a valid token. His order is 102. What happens if he simply asks for <code>/orders/101</code>? Every gate so far asks "who are you" and "what role", none asks "is <em>this</em> object yours".</p>
  </div>
  <p><strong>OWASP</strong> (Open Worldwide Application Security Project) publishes the "API Security Top 10". Its #1 is <strong>BOLA</strong>, Broken Object Level Authorization: the API checks you are logged in, not that the object you asked for is yours. Change the id, see a stranger's data. Many real leaks were exactly this, often by someone counting through ids.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A hotel where every valid key card opens any room. The front desk checked your ID perfectly. Nobody checked whether room 305 is yours.</p></div>
<div class="fx" data-lang="py">from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.testclient import TestClient

ORDERS = {101: {"customer": "asha", "restaurant": "Dosa Hut", "total": 240, "address": "Kothrud, Pune"},
          102: {"customer": "ben", "restaurant": "Biryani Bros", "total": 350, "address": "Bandra, Mumbai"}}
TOKENS = {"tok_asha": "asha", "tok_ben": "ben"}         # stand-in for JWT checking

def current_user(authorization: str = Header(default="")):
    user = TOKENS.get(authorization.removeprefix("Bearer "))
    if user is None:
        raise HTTPException(401, "not logged in")
    return user

app = FastAPI()

@app.get("/buggy/orders/{order_id}")                    # AuthN only
def get_order_buggy(order_id: int, user=Depends(current_user)):
    return ORDERS[order_id]

@app.get("/fixed/orders/{order_id}")                    # AuthN + ownership
def get_order_fixed(order_id: int, user=Depends(current_user)):
    order = ORDERS.get(order_id)
    if order is None or order["customer"] != user:
        raise HTTPException(404, "order not found")     # 404 hides that it exists
    return order

c = TestClient(app)
ben = {"Authorization": "Bearer tok_ben"}
for path in ["/buggy/orders/102", "/buggy/orders/101", "/fixed/orders/102", "/fixed/orders/101"]:
    r = c.get(path, headers=ben)
    print("ben GET", path, "-&gt;", r.status_code, r.json())</div>
<div class="fx" data-lang="text">ben GET /buggy/orders/102 -&gt; 200 {'customer': 'ben', 'restaurant': 'Biryani Bros', 'total': 350, 'address': 'Bandra, Mumbai'}
ben GET /buggy/orders/101 -&gt; 200 {'customer': 'asha', 'restaurant': 'Dosa Hut', 'total': 240, 'address': 'Kothrud, Pune'}
ben GET /fixed/orders/102 -&gt; 200 {'customer': 'ben', 'restaurant': 'Biryani Bros', 'total': 350, 'address': 'Bandra, Mumbai'}
ben GET /fixed/orders/101 -&gt; 404 {'detail': 'order not found'}</div>
  <p>Line 2 is the breach: Ben, properly logged in, read Asha's order and her home address. The fixed endpoint adds one condition, <code>order["customer"] != user</code>, and Ben gets 404 for 101. Returning 404 rather than 403 also hides that order 101 exists. In SQL the fix is the same idea: <code>WHERE order_id = :id AND customer_id = :user_id</code>. Our section 05 app already did this (Ben → 404, Ravi on 102 → 404). Random ids (UUIDs) make guessing harder but are <em>not</em> the fix; the ownership check is.</p>
  <table class="tbl">
    <tr><th>Risk</th><th>On Biteful</th><th>Fix</th></tr>
    <tr><td><strong>Broken object-level authorization</strong> (BOLA, #1)</td><td>Ben reads order 101</td><td>ownership check on every object access</td></tr>
    <tr><td>Broken authentication</td><td>no login limit, unverified JWTs, long-lived tokens</td><td>sections 03–06, 10</td></tr>
    <tr><td>Broken property-level authorization</td><td>response leaks <code>customer_phone</code>; client sends <code>"total": 1</code> (mass assignment)</td><td>separate In/Out schemas (FastAPI note)</td></tr>
    <tr><td>Unrestricted resource consumption</td><td>an order with 10,000 lines; huge uploads</td><td>size limits (<code>max_length=20</code>), rate limits, timeouts</td></tr>
    <tr><td>Broken function-level authorization</td><td>a customer calls <code>DELETE /v1/restaurants/14</code></td><td>role checks on admin routes</td></tr>
    <tr><td>Server-side request forgery (SSRF)</td><td>"import menu from URL" fetches <code>http://169.254.169.254/</code> (cloud credentials)</td><td>allow-list hosts, block internal IPs</td></tr>
    <tr><td>Injection</td><td>search text pasted into SQL</td><td>parameterized queries</td></tr>
  </table>
  <p><strong>ML-specific</strong>: model extraction (cloning the ETA model by querying it a lot: rate-limit, return less precision), oversized inputs, leaking personal data in responses, and <strong>prompt injection</strong> for LLM endpoints (user text that tells the model to ignore its instructions; never let model output trigger privileged actions unchecked).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>BOLA / IDOR</strong> (Insecure Direct Object Reference): an endpoint that takes an object id from the client and returns or changes that object without checking the caller may access it.</p></div>
  <div class="callout intu"><span class="label">Key insight</span><p>Most real breaches are authorization bugs, not broken crypto. The token was valid; nobody checked whether <em>this</em> user owns <em>this</em> row. Put the ownership filter in the data-access layer so no endpoint can forget it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> We have every lock. The next section collects the ways each one is commonly installed wrong.</div>

  <h2 id="aa-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section ended with a trap. Which mistakes actually cause breaches, in one list to check a real API against?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: 401 and 403 swapped</span><p>401 = "I don't know who you are". 403 = "I know you, and you may not". Use 404 when revealing existence is itself a leak.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting the JWT</span><p>Decoding without <code>algorithms=[...]</code> or with <code>verify_signature: False</code>; secrets or personal data in the payload; access tokens valid for 30 days. Pin the algorithm, check <code>aud</code>/<code>iss</code>, keep access tokens ~15 min with rotating refresh tokens.</p></div>
  <div class="callout trap"><span class="label">Trap: fast hashes for passwords</span><p>SHA-256, MD5 or reversible encryption. Use argon2id or bcrypt through a library.</p></div>
  <div class="callout trap"><span class="label">Trap: secrets in code and URLs</span><p>Keys in Git, frontend code or <code>?api_key=</code>. Use env vars or a secrets manager, headers, stored hashes; rotate any leaked key.</p></div>
  <div class="callout trap"><span class="label">Trap: thinking CORS protects the API</span><p>CORS only changes what a browser lets page JavaScript read. curl ignores it.</p></div>
  <div class="callout trap"><span class="label">Trap: checking login but not ownership</span><p>BOLA. Every query that takes an id from the client must also filter by the current user (or their restaurant).</p></div>
  <div class="callout trap"><span class="label">Trap: verify=False and chatty errors</span><p>Turning off certificate checks removes TLS's identity protection. "User not found" vs "wrong password" tells attackers what to try next: one generic message, details in logs.</p></div>
  <div class="callout trap"><span class="label">Trap: per-process security state</span><p>Sessions, login-failure counters and refresh-token lists in a Python dict stop working, or multiply limits, once there are several server copies. Use Redis.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> How do all these locks line up on one request?</div>

  <h2 id="aa-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Keys, hashes, sessions, JWTs, OAuth, TLS, CORS, limits, ownership: which protects what, which is built from which, and in what order does a request meet them?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 280" width="680">
    <defs><marker id="aa-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="10" width="660" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="31" text-anchor="middle" font-size="12">TLS: everything below travels encrypted, to a verified server</text>
    <rect x="10" y="56" width="200" height="40" rx="6" class="fv"/><text x="110" y="73" text-anchor="middle" font-size="11">browser: CORS preflight</text><text x="110" y="88" text-anchor="middle" font-size="10" class="tm">only for page JavaScript</text>
    <rect x="240" y="56" width="200" height="40" rx="6" class="fr sr"/><text x="340" y="73" text-anchor="middle" font-size="11">rate limit</text><text x="340" y="88" text-anchor="middle" font-size="10" class="tm">429 before any checking</text>
    <line x1="210" y1="76" x2="238" y2="76" stroke="currentColor" marker-end="url(#aa-c0)"/>
    <line x1="440" y1="76" x2="468" y2="76" stroke="currentColor" marker-end="url(#aa-c0)"/>
    <rect x="470" y="56" width="200" height="40" rx="6" class="fb sb"/><text x="570" y="73" text-anchor="middle" font-size="11">AuthN: who? → 401</text><text x="570" y="88" text-anchor="middle" font-size="10" class="tm">key / cookie / JWT</text>
    <line x1="570" y1="96" x2="570" y2="124" stroke="currentColor" marker-end="url(#aa-c0)"/>
    <rect x="470" y="126" width="200" height="40" rx="6" class="ft st"/><text x="570" y="143" text-anchor="middle" font-size="11">AuthZ: role → 403</text><text x="570" y="158" text-anchor="middle" font-size="10" class="tm">customer · staff · admin</text>
    <line x1="570" y1="166" x2="570" y2="194" stroke="currentColor" marker-end="url(#aa-c0)"/>
    <rect x="470" y="196" width="200" height="40" rx="6" class="ft st"/><text x="570" y="213" text-anchor="middle" font-size="11">ownership → 404</text><text x="570" y="228" text-anchor="middle" font-size="10" class="tm">BOLA check per object</text>
    <line x1="470" y1="216" x2="442" y2="216" stroke="currentColor" marker-end="url(#aa-c0)"/>
    <rect x="240" y="196" width="200" height="40" rx="6" class="fg sg"/><text x="340" y="220" text-anchor="middle" font-size="11">handler → response (Out schema)</text>
    <rect x="10" y="120" width="420" height="60" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
    <text x="220" y="138" text-anchor="middle" font-size="11">where the proof comes from</text>
    <text x="220" y="156" text-anchor="middle" font-size="10" class="tm">program → API key (hashed) · person → password (bcrypt) → session or JWT</text>
    <text x="220" y="172" text-anchor="middle" font-size="10" class="tm">other provider → OAuth code + PKCE → ID token → our own session/JWT</text>
    <line x1="430" y1="150" x2="468" y2="90" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#aa-c0)"/>
    <text x="340" y="268" text-anchor="middle" font-size="10" class="tm">JWT traps live inside the AuthN box: pin algorithms, check exp/aud, never skip the signature</text>
  </svg><figcaption>TLS wraps everything. A browser may preflight (CORS), then the request meets the rate limit, authentication (proof from one of the sources on the left), role authorization and the per-object ownership check, in that order.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On Biteful</th><th>When to use</th></tr>
    <tr><td>AuthN / AuthZ</td><td>two ordered checks</td><td>who? may they?</td><td>7 requests: 401, 401, 200, 403, 200, 403, 200</td><td>every request</td></tr>
    <tr><td>API key</td><td>CSPRNG + SHA-256 + compare_digest</td><td>which program?</td><td>till → dosa-hut-till; guess → 401</td><td>server-to-server, partners</td></tr>
    <tr><td>Password hash</td><td>salt + slow function</td><td>store passwords safely?</td><td>22 µs vs 278 ms; two bcrypt hashes differ</td><td>every password</td></tr>
    <tr><td>Session</td><td>random id + cookie + store</td><td>stay logged in?</td><td>/me 200 → logout → 401</td><td>browser apps</td></tr>
    <tr><td>JWT</td><td>base64url + HMAC/RSA + exp</td><td>self-proving identity?</td><td>by hand == PyJWT; expired after 2 s</td><td>APIs, mobile, many services</td></tr>
    <tr><td>JWT traps</td><td>bad decode calls</td><td>how do checks fail?</td><td>none token → admin when unverified</td><td>review every decode</td></tr>
    <tr><td>OAuth + PKCE</td><td>redirects + code + verifier hash</td><td>access without passwords?</td><td>thief → invalid_grant</td><td>third-party login and access</td></tr>
    <tr><td>TLS</td><td>certificates + encryption</td><td>who can read or fake it?</td><td>exit 60 untrusted; TLSv1.3 trusted</td><td>always</td></tr>
    <tr><td>CORS</td><td>browser policy + headers</td><td>may this site's JS read it?</td><td>dashboard allowed; evil 400 but curl 200</td><td>browser frontends</td></tr>
    <tr><td>Rate limit</td><td>counter per key/user/IP</td><td>stop guessing?</td><td>6th and 7th tries → 429, Retry-After 60</td><td>login, expensive endpoints</td></tr>
    <tr><td>Ownership (BOLA)</td><td>filter by current user</td><td>is this object yours?</td><td>Ben → 101: 200 buggy, 404 fixed</td><td>every id from a client</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Every request must prove who it is (authentication) using a secret that is stored hashed and carried over TLS, and then pass two separate permission checks: the role for the action, and ownership of the object.</strong> The famous breaches are usually the last check missing, not the cryptography failing.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> then <a class="xref" data-note="api_production">Production Backend</a>, where sessions and counters move to Redis and TLS ends at nginx.</div>

  <h2 id="aa-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Asha and Ben (customers), Ravi (staff, Dosa Hut 10), Meera (admin), Dosa Hut's till (program). Order 101 Asha/Dosa Hut ₹240; 102 Ben/Biryani Bros ₹350.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>AuthN/AuthZ</td><td>who? may they?</td><td>401 vs 403 table</td><td>where's the proof? → keys</td></tr>
    <tr><td>API keys</td><td>prove a program?</td><td>hashed key → dosa-hut-till</td><td>people use passwords → hashing</td></tr>
    <tr><td>Hashing</td><td>store passwords?</td><td>bcrypt 278 ms, salted</td><td>can't ask every click → sessions</td></tr>
    <tr><td>Sessions</td><td>one login, many requests?</td><td>cookie; logout instant</td><td>shared lookup everywhere → JWT</td></tr>
    <tr><td>JWT</td><td>self-proving token?</td><td>by hand = library; exp</td><td>checks can be wrong → traps</td></tr>
    <tr><td>JWT traps</td><td>how do checks fail?</td><td>tamper, expired, none, unverified</td><td>third-party login → OAuth</td></tr>
    <tr><td>OAuth 2.0</td><td>access without password?</td><td>PKCE: thief invalid_grant</td><td>secrets on the wire → TLS</td></tr>
    <tr><td>TLS</td><td>who can read/fake it?</td><td>curl exit 60 vs TLSv1.3</td><td>browser rule → CORS</td></tr>
    <tr><td>CORS</td><td>may this site's JS read?</td><td>preflight ok/400; curl 200 anyway</td><td>guessing → rate limit</td></tr>
    <tr><td>Rate limit</td><td>stop guessing?</td><td>429 after 5 fails</td><td>valid user, wrong object → BOLA</td></tr>
    <tr><td>BOLA/OWASP</td><td>is this object yours?</td><td>Ben → 101 fixed to 404</td><td>→ <a class="xref" data-note="api_production">Production</a></td></tr>
  </table>
  <h3>Formulas and formats</h3>
  <table class="tbl">
    <tr><th>Thing</th><th>Form</th><th>Symbols</th></tr>
    <tr><td>JWT</td><td><code>B(header) . B(payload) . B(HMAC_SHA256(secret, B(header) + "." + B(payload)))</code></td><td>B = base64url without padding; secret = server key</td></tr>
    <tr><td>Verify JWT</td><td>recompute the signature; <code>compare_digest</code>; check <code>exp &gt; now</code>, <code>aud</code>, <code>iss</code>; alg in allow-list</td><td>exp, now: Unix seconds</td></tr>
    <tr><td>PKCE</td><td><code>challenge = B(SHA256(verifier))</code></td><td>verifier: 43–128 random chars kept by the app</td></tr>
    <tr><td>bcrypt string</td><td><code>$2b$12$&lt;22-char salt&gt;&lt;31-char hash&gt;</code></td><td>12 = cost, 2<sup>12</sup> rounds</td></tr>
    <tr><td>Guessing time</td><td>wordlist size ÷ guesses per second</td><td>10<sup>10</sup> ÷ 10<sup>10</sup>/s = 1 s (SHA-256); ÷ 3.6/s ≈ 90 years (bcrypt)</td></tr>
    <tr><td>Login limit</td><td>failures in last W seconds ≥ N → 429, Retry-After = W − (now − oldest)</td><td>N = 5, W = 60</td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>API keys for programs (hashed); argon2id/bcrypt for passwords; sessions in Redis for one browser app; short JWTs + rotating refresh for APIs and many services; RS256 when many verify; OAuth code + PKCE and OIDC for third-party login; TLS everywhere; exact CORS origins; login limits; ownership filters.</p></div>
    <div><b>Avoid</b><p>Keys in URLs or frontends; SHA-256 for passwords; sessions in process memory; secrets in JWT payloads; decoding without <code>algorithms</code>; implicit/password grants; <code>verify=False</code>; <code>*</code> with credentials; ids from clients without an ownership check.</p></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>Ravi (staff) calls <code>DELETE /v1/restaurants/14</code>. Code? <em>403: authenticated, wrong role.</em></li>
    <li>Is a JWT's payload secret? <em>No: base64url, readable with <code>base64 -d</code>; only tamper-proof.</em></li>
    <li>What single argument stops the <code>alg: none</code> attack? <em><code>algorithms=["HS256"]</code> in <code>jwt.decode</code>.</em></li>
    <li>A browser blocks a cross-origin call; curl gets 200. Which is protecting the data? <em>Neither: the token and ownership checks do. CORS only limits browsers.</em></li>
    <li>Ben, logged in, requests order 101 on the fixed endpoint. Code and why? <em>404: ownership fails, and 404 hides that 101 exists.</em></li>
  </ol>

  <h2 id="aa-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Authentication vs authorization, and their status codes?</summary><div class="qa-body">AuthN checks who the caller is (password, key, token); failure → 401. AuthZ checks whether that identity may do this action on this resource (role, scope, ownership); failure → 403, or 404 if revealing existence is a leak. AuthN always runs first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should you store and check API keys?</summary><div class="qa-body">Generate with <code>secrets</code>, show once, store only a hash (SHA-256 is fine for long random keys) plus a display prefix, compare with <code>hmac.compare_digest</code>. Send in a header over HTTPS, never in URLs or Git; make keys revocable and rotatable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a JWT encrypted? Can a user change their role inside it?</summary><div class="qa-body">No, signed: the middle part is base64url and readable. A user can edit it, but the signature then fails (<code>InvalidSignatureError</code>), as our "customer → admin" forgery showed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through verifying an HS256 JWT by hand.</summary><div class="qa-body">Split on dots; base64url-decode header and payload; recompute HMAC-SHA256 with the server secret over <code>part1.part2</code>; base64url it; compare with part 3 in constant time; check the header's alg is the one you allow; check <code>exp</code> (and <code>aud</code>, <code>iss</code>). Our by-hand token was byte-identical to PyJWT's.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HS256 vs RS256?</summary><div class="qa-body">HS256: one shared secret signs and verifies; simple when one service does both. RS256/ES256: a private key signs, a public key verifies; use when many services verify so only the auth server can issue, and publish public keys (JWKS).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you log out a user who has a JWT?</summary><div class="qa-body">You can't un-issue it. Short access-token expiry (5–15 min) plus revocable rotating refresh tokens; a <code>jti</code> denylist in Redis until expiry; or rotate the signing key (logs out everyone).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which cookie flags should a session cookie have?</summary><div class="qa-body"><code>HttpOnly</code> (JS can't read it), <code>Secure</code> (HTTPS only), <code>SameSite=Lax</code>/<code>Strict</code> (limits CSRF). Plus a random id, server-side expiry, and a new id at login.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not store passwords as SHA-256?</summary><div class="qa-body">It is fast (we measured ~22 µs; GPUs do billions per second) and, unsalted, identical passwords share hashes so rainbow tables work. bcrypt/argon2id are salted and deliberately slow (~0.28 s), argon2id also memory-hard.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does PKCE solve?</summary><div class="qa-body">The authorization code travels through the browser (front channel) and can be intercepted. PKCE binds it to a random verifier only the original app holds; the server compares SHA-256(verifier) with the earlier challenge, so a stolen code gives <code>invalid_grant</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API works from curl but the React dashboard gets a CORS error. Why?</summary><div class="qa-body">The API doesn't list the dashboard's exact origin, or rejects the preflight (e.g. the <code>Authorization</code> header or PATCH isn't allowed). curl doesn't enforce CORS, browsers do. Add the origin and needed headers/methods; never <code>*</code> with credentials.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Spot the bug: <code>GET /orders/{id}</code> checks the JWT, then returns <code>db.get(Order, id)</code>.</summary><div class="qa-body">BOLA: any logged-in user reads any order by changing the id (Ben read Asha's address). Filter by owner (<code>WHERE id = ? AND customer_id = ?</code>) and return 404.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a password login need hashing, sessions or JWTs, and TLS all together?</summary><div class="qa-body">Hashing protects the stored password if the database leaks; sessions or JWTs avoid sending (and slowly re-checking) the password on every request; TLS protects the password at login and the cookie/token on every later request. Drop any one and a different attacker wins: the database thief, the 0.28 s-per-request bill, or the café eavesdropper.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why are JWTs a natural fit for the stateless APIs of the fundamentals note?</summary><div class="qa-body">Statelessness requires each request to carry what is needed; a JWT carries identity and role with a proof any copy can check using the key, no shared session lookup. The price is revocation, which brings back a little state (refresh-token ids, denylists) in Redis.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you have perfect JWT checks but skip the ownership check?</summary><div class="qa-body">BOLA: every authenticated user can read or change every object by id. AuthN and role checks answer "who" and "what kind of action", not "whose object". It is the #1 OWASP API risk precisely because the other locks all pass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do FastAPI dependencies make this note's checks safe to apply everywhere?</summary><div class="qa-body"><code>current_user</code>, <code>require_role("staff")</code> and <code>till_key</code> are written once and declared per endpoint; nesting puts AuthN inside AuthZ so the order can't be wrong; tests swap them with <code>dependency_overrides</code>. Copy-pasted checks are where one endpoint forgets one.</div></details>
</main>
`
});
