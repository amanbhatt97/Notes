// notes/apis/api_auth.js — Authentication & Security
Object.assign(TOPIC_CONTENT, {
  "api_auth": `<main>
  <h1>Authentication &amp; Security</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>Authentication &amp; Security</span></div>
  <p class="lead">Every request that reaches an API raises two questions: <strong>who is calling</strong>, and <strong>are they allowed to do this?</strong> Answering them is called authentication and authorization, and getting them wrong is how most real data leaks happen. It is rarely clever code-breaking; usually an API simply forgot to ask one of the two questions. At the end of the <a class="xref" data-note="api_fastapi">FastAPI</a> note, the Biteful food-ordering API still trusted whatever a request said about itself, so anyone could claim to be anyone. This note fixes that one idea at a time, using the same cast throughout: Asha and Ben are customers, Ravi works at the restaurant Dosa Hut (restaurant 10), Meera is a Biteful admin, and Dosa Hut's till is a program that pulls new orders all day. Order 101 is Asha's (Dosa Hut, ₹240) and order 102 is Ben's (Biryani Bros, ₹350). Along the way we cover API keys, password hashing, sessions and cookies, JWTs and their traps, OAuth 2.0, HTTPS, CORS, rate limiting and the OWASP list of the most common API attacks, and every code block was run (FastAPI 0.165, PyJWT 2.15, bcrypt 5.0).</p>

  <h2 id="aa-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">API Auth &amp; Security</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Two questions</div>
        <ul>
          <li><b>Authentication</b>: who are you? fails → <b>401</b></li>
          <li><b>Authorization</b>: may you? fails → <b>403</b> (or 404 to hide)</li>
          <li>Authorization = role for the action + ownership of the object</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Proving identity</div>
        <ul>
          <li><b>API key</b> for programs; store only its hash</li>
          <li><b>Passwords</b>: bcrypt / argon2id, salted and slow</li>
          <li><b>Session</b>: random id in a cookie, data on the server</li>
          <li><b>JWT</b>: signed (not encrypted) token; pin <code>algorithms</code></li>
          <li><b>OAuth 2.0 + PKCE</b>: tokens without sharing passwords</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Protecting the path</div>
        <ul>
          <li><b>TLS</b>: encryption, integrity, server identity</li>
          <li><b>CORS</b>: a browser rule, not authentication</li>
          <li><b>Rate limiting</b>: 429 + Retry-After stops guessing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What attackers do</div>
        <ul>
          <li><b>BOLA</b> (#1): change the id, read someone else's data</li>
          <li>Mass assignment, missing role checks, SSRF, injection</li>
          <li>Fix: ownership filter on every object access</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="aa-nz"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Authentication vs Authorization</span><span class="rm-sub">who are you, and may you do this?</span></div></div>
      <div class="rm-item rm-done" data-target="aa-keys"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">API Keys</span><span class="rm-sub">how a program proves who it is</span></div></div>
      <div class="rm-item rm-done" data-target="aa-hash"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Password Hashing</span><span class="rm-sub">checking a password without storing it</span></div></div>
      <div class="rm-item rm-done" data-target="aa-sess"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Sessions &amp; Cookies</span><span class="rm-sub">log in once, stay logged in</span></div></div>
      <div class="rm-item rm-done" data-target="aa-jwt"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">JWT</span><span class="rm-sub">a token that proves itself, built by hand</span></div></div>
      <div class="rm-item rm-done" data-target="aa-jwttrap"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">JWT Traps</span><span class="rm-sub">how token checks get fooled</span></div></div>
      <div class="rm-item rm-done" data-target="aa-app"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Auth as FastAPI Dependencies</span><span class="rm-sub">all the checks in one real server</span></div></div>
      <div class="rm-item rm-done" data-target="aa-oauth"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">OAuth 2.0 &amp; OpenID Connect</span><span class="rm-sub">"Sign in with Google", PKCE, machine tokens</span></div></div>
      <div class="rm-item rm-done" data-target="aa-tls"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">HTTPS &amp; TLS</span><span class="rm-sub">keeping secrets secret on the network</span></div></div>
      <div class="rm-item rm-done" data-target="aa-cors"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">CORS</span><span class="rm-sub">the browser's rule about other websites</span></div></div>
      <div class="rm-item rm-done" data-target="aa-rl"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Rate Limiting</span><span class="rm-sub">making password guessing hopeless</span></div></div>
      <div class="rm-item rm-done" data-target="aa-owasp"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">BOLA &amp; the OWASP API Top 10</span><span class="rm-sub">what attackers actually do</span></div></div>
      <div class="rm-item rm-done" data-target="aa-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the bugs behind real breaches</span></div></div>
      <div class="rm-item rm-done" data-target="aa-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formats, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="aa-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the auth questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="aa-nz"><span class="num">01</span>Authentication vs Authorization</h2>
  <p>Start with the problem. A request arriving at a server is just text: a method and a path, a few <strong>headers</strong> (labelled lines of extra information, such as <code>Content-Type: application/json</code>), and sometimes a body. The server has no way of seeing who typed it. In the FastAPI note, Biteful's "my orders" endpoint found out who was calling by reading a header called <code>X-Customer</code>. Here is why that is not good enough:</p>
  <div class="fx" data-lang="py">from fastapi import FastAPI, Header
from fastapi.testclient import TestClient

ORDERS = {101: {"customer": "asha", "restaurant": "Dosa Hut", "total": 240, "address": "Kothrud, Pune"},
          102: {"customer": "ben", "restaurant": "Biryani Bros", "total": 350, "address": "Bandra, Mumbai"}}
app = FastAPI()

@app.get("/v1/my-orders")
def my_orders(x_customer: str = Header()):        # "who are you?" answered by... believing the header
    return [o for o in ORDERS.values() if o["customer"] == x_customer]

c = TestClient(app)
print("Asha's phone:", c.get("/v1/my-orders", headers={"X-Customer": "asha"}).json())
print("Ben's laptop:", c.get("/v1/my-orders", headers={"X-Customer": "asha"}).json())</div>
  <div class="fx" data-lang="text">Asha's phone: [{'customer': 'asha', 'restaurant': 'Dosa Hut', 'total': 240, 'address': 'Kothrud, Pune'}]
Ben's laptop: [{'customer': 'asha', 'restaurant': 'Dosa Hut', 'total': 240, 'address': 'Kothrud, Pune'}]</div>
  <p>Both requests got Asha's order and her home address. The second one came from Ben, who simply typed <code>asha</code> into the header. From the server's side the two requests are identical, because the header is a claim, not a proof. Anyone with a terminal can send any header they like. Before the server can make a single decision it needs something the caller can show that only the real Asha could have, and then it needs rules about what Asha may do.</p>
  <p>Those are two different questions, and people mix them up all the time. The first is "who are you?". The caller presents some proof, such as a password, a secret key or a token, and the server checks it. That is <strong>authentication</strong>, often shortened to <strong>AuthN</strong>: verifying the caller's identity. The second is "are you allowed to do this?". Knowing that the caller really is Asha does not mean Asha may mark orders as delivered or delete a restaurant. That is <strong>authorization</strong>, or <strong>AuthZ</strong>: deciding whether a known identity may perform this action on this particular thing. Authorization always comes second, because you cannot check someone's permissions before you know who they are.</p>
  <p>Think of the security guard at a gated housing society. First he checks your ID card and writes your name in the register: that is authentication. Then he looks at his list of who lives where and tells you that you may go to flat B-204, but not to B-305 or the society office: that is authorization. A perfectly valid ID card does not open every door.</p>
  <p>HTTP has a status code for each failure. <strong>401</strong> means "I don't know who you are": the proof was missing or wrong. <strong>403</strong> means "I know exactly who you are, and the answer is no". The names are confusing for historical reasons, because 401 is officially called "Unauthorized" even though it really means <em>unauthenticated</em>, and mixing the two up is a classic interview slip.</p>
  <p>The simplest way to express permissions is with <strong>roles</strong>, named groups of permissions. Biteful has three: customer, staff and admin, ranked so that each can do everything the ones below it can. Attaching permissions to roles and roles to users is called <strong>role-based access control</strong> (RBAC). Below, the two gates are written in plain Python with no web framework, so you can see the order of the checks. The tokens are fake strings for now; where real proofs come from is the subject of the next few sections.</p>
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
  <p>Read the output against the code. A request with no token, or a made-up one, never gets past the first gate (<code>TOKENS.get</code> returns <code>None</code>), so it gets 401 before the server even looks at what was asked for. Asha's token passes the first gate on every request, but she gets 403 for trying to patch an order, because a customer ranks below staff. Ravi can patch order 101 but gets 403 for deleting a restaurant, and only Meera, the admin, can do that.</p>
  <p>Notice what roles cannot express. Ravi works at <em>Dosa Hut</em>, yet the role check would let him patch <em>any</em> restaurant's order, and nothing here stops Ben from reading Asha's order, because both are customers. Those are rules about a particular object ("only your restaurant's orders", "only your own order"), not about a kind of action. They are called <strong>object-level</strong> or ownership checks, and forgetting them is the most common serious API bug in the world; we will build them in section 07 and study the bug itself in section 12. One more word you will meet: a <strong>scope</strong> is a named permission written inside a token, such as <code>orders:read</code>. Scopes are the same idea as roles, but finer grained and attached to a particular token rather than to a user.</p>

  <h2 id="aa-keys"><span class="num">02</span>API Keys</h2>
  <p>The simplest caller to give an identity to is not a person but a program. Dosa Hut's till calls <code>GET /v1/partner/orders</code> every minute, all day, for months. There is no human sitting at it to type a password. It needs a proof it can send automatically with every request.</p>
  <p>The usual answer is an <strong>API key</strong>: a long random string that Biteful generates once, gives to Dosa Hut, and that the till then sends on every request in a header such as <code>X-API-Key</code>. An API key identifies a program or an account, not a person. Stripe, OpenAI and Google Maps all work this way. It is like a metro smart card: the ticket gate does not know your name, it only checks that the card is genuine and still active, and whoever holds the card can travel. That last point matters. Whoever holds the string <em>is</em> the caller, so a key must be hard to guess, easy to cancel, and never written anywhere public.</p>
  <p>What should Biteful store in its database to check the key later? If it stores the key itself, then anyone who gets a copy of the database (a leaked backup, a stolen laptop) gets every partner's working key. Instead we store a <strong>hash</strong> of the key. A hash function turns any input into a fixed-length fingerprint, and it only works in one direction: computing the fingerprint from the key takes microseconds, but getting the key back from the fingerprint is practically impossible. On each request the server hashes whatever key was sent and compares fingerprints.</p>
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
  <p>The key is 40 characters long: a readable prefix <code>bf_live_</code> plus 24 random bytes from Python's <code>secrets</code> module, which uses the operating system's cryptographically secure random source. 24 bytes is 192 bits of randomness, far too many to ever guess. The database row holds only a 64-character SHA-256 hash, a short prefix so a dashboard can show "bf_live_ab12..." and the owner. The right key is recognised as <code>dosa-hut-till</code>; a guess returns <code>None</code>, which the API turns into 401.</p>
  <p>One detail in <code>check_key</code> deserves explaining. A normal <code>==</code> comparison of two strings stops at the first character that differs, so comparing a guess that is wrong in the first character is slightly faster than comparing one that is wrong in the last. Over thousands of requests an attacker can measure that difference and learn, piece by piece, how much of a guess is right. This is called a <strong>timing attack</strong>. <code>hmac.compare_digest</code> always takes the same time, whatever the inputs, so it leaks nothing.</p>
  <p>Using a fast hash like SHA-256 is fine here only because the key is long and random: there is nothing for an attacker to guess. That will not be true for passwords that people choose, which is the next problem. Finally, keys leak in boring ways: committed to Git, pasted into frontend JavaScript or a mobile app (where anyone can extract them), or put in a URL like <code>?api_key=...</code>, where they end up in server logs and browser history. Keep keys in environment variables or a secrets manager, send them only in headers, and make every key easy to revoke and replace (<strong>rotation</strong>).</p>

  <h2 id="aa-hash"><span class="num">03</span>Password Hashing</h2>
  <p>Asha is a person, not a program. She will remember a password, not 40 random characters, and to check that password at login Biteful must store <em>something</em>. The right way to think about this is to plan for the day Biteful's users table appears on a hacker forum, because databases do leak. If the table holds Asha's password, the attacker now has it, and since most people reuse passwords, her email and bank are next. So we never store the password itself. We store a hash and, at login, hash what she typed and compare, exactly as with API keys.</p>
  <p>But which hash? SHA-256 worked for keys, so let us see what happens if Biteful uses it for passwords. Below, three users' passwords have leaked as plain SHA-256 fingerprints, and an attacker tries 1.2 million guesses built from common words and numbers:</p>
  <div class="fx" data-lang="py">import hashlib, time

# Biteful's users table as it appears on a hacker forum: passwords stored as plain SHA-256
leaked = {"asha": hashlib.sha256(b"asha@1997").hexdigest(),
          "ben":  hashlib.sha256(b"biryani_2001").hexdigest(),
          "chen": hashlib.sha256(b"biryani_2001").hexdigest()}
print("ben's hash == chen's hash:", leaked["ben"] == leaked["chen"])

# The attacker's guesses: common words + a separator + a number (1.2 million guesses)
words = ["asha", "ben", "chen", "ravi", "meera", "password", "india", "mumbai", "pune", "dosa",
         "biryani", "chai", "cricket", "love", "admin", "qwerty", "welcome", "dragon", "sunshine", "monkey",
         "football", "secret", "summer", "winter", "tiger", "rahul", "priya", "amit", "neha", "biteful"]
guesses = [f"{w}{sep}{n}" for w in words for sep in ("", "@", "_", "#") for n in range(10000)]
wanted = {h: user for user, h in leaked.items()}

start = time.perf_counter()
for g in guesses:
    h = hashlib.sha256(g.encode()).hexdigest()
    if h in wanted:
        print(f"cracked: {g!r} (users with this hash: {[u for u, x in leaked.items() if x == h]})")
secs = time.perf_counter() - start
print(f"{len(guesses):,} guesses in {secs:.2f} s = {len(guesses)/secs:,.0f} per second, one CPU core, plain Python")</div>
  <div class="fx" data-lang="text">ben's hash == chen's hash: True
cracked: 'asha@1997' (users with this hash: ['asha'])
cracked: 'biryani_2001' (users with this hash: ['ben', 'chen'])
1,200,000 guesses in 0.61 s = 1,978,614 per second, one CPU core, plain Python</div>
  <p>Two things went wrong. First, Ben and Chen happened to choose the same password, and their hashes are identical, so the attacker can see that at a glance and cracks both at once. Precomputed tables of hash-to-password pairs, called <strong>rainbow tables</strong>, exploit exactly this: hash the ten million most common passwords once, then look up every leaked hash instantly. Second, SHA-256 is designed to be fast, and here speed is the enemy. Plain Python on one CPU core tried nearly two million guesses per second (approximate; it varies by machine) and found both passwords in well under a second. A single gaming graphics card does roughly ten <em>billion</em> SHA-256 guesses per second.</p>
  <p>Password hashing functions fix both problems. A <strong>salt</strong> is a random value generated separately for each password and mixed in before hashing, so two people with the same password get completely different hashes and a precomputed table is useless. And the function is deliberately <strong>slow</strong>, with a tunable <strong>cost factor</strong> that sets how much work each hash takes. Think of a lock that takes a third of a second to open even with the right key. For Asha, logging in once a day, that is nothing. For a thief trying a million keys, it is days of work per account. The common choices are <strong>bcrypt</strong> and <strong>argon2id</strong>:</p>
  <div class="fx" data-lang="py">import time, bcrypt
from argon2 import PasswordHasher

pw = b"asha@1997"                          # Asha's (weak) password
h1 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
h2 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
print("bcrypt 1:", h1.decode())
print("bcrypt 2:", h2.decode())            # same password, different salt -&gt; different hash
print("check right:", bcrypt.checkpw(pw, h1), "| check wrong:", bcrypt.checkpw(b"asha@1998", h1))

t = time.perf_counter(); bcrypt.checkpw(pw, h1); slow = time.perf_counter() - t
print(f"one bcrypt(12) check: {slow*1e3:.0f} ms -&gt; about {1/slow:.1f} guesses per second per core")

ph = PasswordHasher()                      # argon2id, memory-hard
h = ph.hash("asha@1997")
print("argon2:", h)
print("verify:", ph.verify(h, "asha@1997"))</div>
  <div class="fx" data-lang="text">bcrypt 1: $2b$12$c80qciejncqI2bFfC3SQveSgG9Pi9W7Qx2p3lKFd1XC/t7vTS.H8u
bcrypt 2: $2b$12$jCuC8QKNHszoLX3WYcHcnu5SdzYnmi12ouiqyR.r1J/RpGyb0pSie
check right: True | check wrong: False
one bcrypt(12) check: 315 ms -&gt; about 3.2 guesses per second per core
argon2: $argon2id$v=19$m=65536,t=3,p=4$UcvnfctWb+F0lJAXg63n0g$8Dbo35S8qpkcFHSu963cYzekqep4QCj+w01dPEv6RBg
verify: True</div>
  <p>The two bcrypt hashes of the <em>same</em> password are completely different, because <code>gensalt</code> picked a new salt each time. Yet <code>checkpw</code> still works, because the salt is stored inside the hash string itself. Read the string from the left: <code>$2b$</code> is the bcrypt version, <code>12$</code> is the cost (2<sup>12</sup> = 4096 rounds of internal work), the next 22 characters are the salt and the rest is the hash. When Asha logs in, <code>checkpw</code> reads the salt and cost out of the stored string, repeats the work on what she typed, and compares.</p>
  <p>Now compare speeds. One bcrypt check took about 0.3 seconds (approximate), which means one CPU core can try only about three guesses per second against one leaked hash, against roughly two million per second for SHA-256 even in slow Python. Scale that up to a ten-billion-guess wordlist: against SHA-256 a single graphics card gets through it in about a second, while against bcrypt at cost 12 one CPU core would need roughly 90 years, and even a room full of graphics cards still needs months for each account. These are rough, order-of-magnitude figures, but the gap of many zeros is the whole point.</p>
  <p>The argon2 string records its own settings in the same way: <code>m=65536</code> means each hash needs 64 MB of memory, <code>t=3</code> passes over that memory and <code>p=4</code> parallel lanes. Requiring lots of memory is the point. Graphics cards have thousands of small cores but not much memory per core, so a <strong>memory-hard</strong> function like argon2id stops them from running thousands of guesses in parallel. It is the first choice for new systems; bcrypt remains perfectly acceptable. Never "encrypt" passwords instead (encryption is reversible, so whoever gets the encryption key gets every password), never use one global salt, and never write your own scheme: call the library's <code>hash</code> and <code>verify</code>. One quirk worth knowing: bcrypt only looks at the first 72 bytes of a password.</p>

  <h2 id="aa-sess"><span class="num">04</span>Sessions &amp; Cookies</h2>
  <p>We can now check Asha's password at login, slowly and on purpose. But after logging in she browses menus, places an order and checks its status: dozens of requests. HTTP is <strong>stateless</strong>, meaning the server remembers nothing between requests (see <a class="xref" data-note="api_fundamentals">HTTP &amp; REST Fundamentals</a>), so each request must carry some proof of who she is. We cannot ask for her password on every click, and we certainly cannot spend 0.3 seconds of bcrypt per request. One successful login needs to cover all the requests after it.</p>
  <p>The classic answer is a <strong>session</strong>: after the password check, the server creates a small record in its own storage, such as <code>{"user": "asha"}</code>, and gives the browser only a long random <strong>session id</strong> that points to it. The id travels in a <strong>cookie</strong>, a small named value that the server asks the browser to store (with a <code>Set-Cookie</code> response header) and that the browser then sends back automatically on every later request to the same site. Think of the shoe stand outside a temple. You hand over your shoes and get a numbered token. The token is worthless on its own; the shoes stay at the counter, and when you leave, the number is cancelled. The session id is the token and the session record is the shoes.</p>
  <div class="fx" data-lang="py">import secrets, bcrypt
from fastapi import FastAPI, Cookie, Form, HTTPException, Response
from fastapi.testclient import TestClient

USERS = {"asha": bcrypt.hashpw(b"asha@1997", bcrypt.gensalt(rounds=12))}   # hashed, as above
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
print("wrong pw  -&gt;", c.post("/v1/login", data={"username": "asha", "password": "1234"}).status_code)
r = c.post("/v1/login", data={"username": "asha", "password": "asha@1997"})
print("Set-Cookie:", r.headers["set-cookie"][:12] + "...;", "; ".join(r.headers["set-cookie"].split("; ")[1:]))
print("/v1/me    -&gt;", c.get("/v1/me").status_code, c.get("/v1/me").json())
print("server rows -&gt;", len(SESSIONS), list(SESSIONS.values()))
c.post("/v1/logout")
print("/v1/me    -&gt;", c.get("/v1/me").status_code, c.get("/v1/me").json())</div>
  <div class="fx" data-lang="text">wrong pw  -&gt; 401
Set-Cookie: sid=JbsiDqC7...; HttpOnly; Path=/; SameSite=lax; Secure
/v1/me    -&gt; 200 {'user': 'asha'}
server rows -&gt; 1 [{'user': 'asha'}]
/v1/me    -&gt; 401 {'detail': 'please log in'}</div>
  <p>A wrong password got 401 and no cookie. The right one got a <code>Set-Cookie</code> header carrying a random <code>sid</code>. <code>TestClient</code> behaves like a browser: it stored the cookie and sent it back on <code>/v1/me</code>, which looked the id up and found <code>{'user': 'asha'}</code>. The server held exactly one session row. After <code>/v1/logout</code> deleted that row, the very same cookie produced 401 immediately. That is the great strength of sessions: logging someone out, or kicking out a stolen session, takes effect instantly, because the truth lives on the server.</p>
  <p>The words after the cookie value are <strong>cookie flags</strong>, and each one blocks a specific attack. <code>HttpOnly</code> hides the cookie from JavaScript running in the page, so if an attacker manages to inject a script into Biteful's site (an attack called cross-site scripting, or XSS), the script still cannot read the session id. <code>Secure</code> tells the browser to send the cookie only over HTTPS, never over plain HTTP where it could be read in transit (section 09). <code>SameSite=lax</code> stops the browser from attaching the cookie to background requests started by <em>other</em> websites. Without it, a malicious page could make Asha's browser submit a hidden form to Biteful, and the browser would helpfully attach her session cookie. That attack is called <strong>CSRF</strong>, cross-site request forgery.</p>
  <p>Sessions have one cost: every request needs a lookup in the session store. Here the store is a Python dictionary, which only exists inside one running copy of the program (one <strong>process</strong>, in operating-system terms; see <a class="xref" data-note="cf_os">Operating Systems</a>). Real APIs run several copies behind a load balancer, and a session created on copy A would be unknown to copy B, so production systems keep sessions in a shared store such as Redis (<a class="xref" data-note="api_production">Production Backend</a>). Also generate a fresh session id at login, so an attacker who planted a known id in Asha's browser beforehand (<strong>session fixation</strong>) gains nothing.</p>

  <h2 id="aa-jwt"><span class="num">05</span>JWT</h2>
  <p>Biteful is growing. It now has an orders service, a restaurants service and a payments service, each a separate program. With sessions, every one of them must ask the shared session store "who is sid=pLFt...?" on every single request. It would be simpler if the token itself said "this is Asha, a customer, valid until 9 pm", in a way that nobody could fake, so that any service could check it on its own without asking anyone.</p>
  <p>That is a <strong>JWT</strong>, a JSON Web Token (pronounced "jot"). It is three pieces of text joined by dots. The <strong>header</strong> says which signing algorithm was used. The <strong>payload</strong> holds the <strong>claims</strong>, the facts the token asserts: who the user is, their role, when the token expires. The <strong>signature</strong> is a short code computed from the header, the payload and a secret key that only the server knows. Anyone holding the key can recompute the signature and see whether a single character of the first two parts has changed. The first two parts are not encrypted; they are only <strong>base64url</strong>-encoded, which means rewritten using letters, digits, <code>-</code> and <code>_</code> so they are safe inside URLs and headers. Anyone can reverse that, the way anyone can read Hindi written in Roman letters.</p>
  <p>Think of a festival wristband with a tamper-proof seal. Guards at every stage can read it and let you in without phoning the main office, and a broken seal means it is fake. But anyone can read what is printed on it, and once a band is on your wrist it cannot be cancelled until the festival ends. Keep that last point in mind; it turns out to be the main weakness of JWTs.</p>
  <p>The best way to understand a JWT is to build one by hand using only Python's standard library, check that it matches what the PyJWT library produces, read it without the key, and then verify it by recomputing the signature. The signature here is an <strong>HMAC</strong> (hash-based message authentication code): a hash computed over a message together with a secret key, so that only someone who knows the key can produce the right value. The algorithm name <code>HS256</code> means "HMAC with SHA-256".</p>
  <div class="fx" data-lang="py">import base64, hashlib, hmac, json, jwt

SECRET = "change-me-to-32+-random-bytes-in-prod"

def b64url(raw: bytes) -&gt; str:                       # base64url, no '=' padding
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

# ---- build Asha's token BY HAND ----
header  = {"alg": "HS256", "typ": "JWT"}
payload = {"sub": "asha", "role": "customer", "exp": 1893456000}
part1 = b64url(json.dumps(header, separators=(",", ":")).encode())
part2 = b64url(json.dumps(payload, separators=(",", ":")).encode())
part3 = b64url(hmac.new(SECRET.encode(), f"{part1}.{part2}".encode(), hashlib.sha256).digest())
by_hand = f"{part1}.{part2}.{part3}"
print("part1 (header) :", part1)
print("part2 (payload):", part2)
print("part3 (sig)    :", part3)

# ---- the library builds exactly the same thing ----
print("PyJWT == by hand:", jwt.encode(payload, SECRET, algorithm="HS256") == by_hand)

# ---- anyone can READ it: no key needed ----
pad = lambda s: s + "=" * (-len(s) % 4)
print("decoded part2  :", json.loads(base64.urlsafe_b64decode(pad(part2))))

# ---- VERIFY = recompute the signature and compare ----
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
  <p>Walk through the output. <code>part1</code> is the header <code>{"alg":"HS256","typ":"JWT"}</code> in base64url, which is why every HS256 token you will ever see starts with <code>eyJhbGciOi</code>. <code>part2</code> is the payload. <code>part3</code> is the HMAC-SHA256 of the string <code>part1.part2</code> using the secret, also base64url-encoded. Joined with dots, our hand-made token is byte-for-byte identical to the one PyJWT builds, so there is no magic in the library. The "decoded part2" line shows the payload read back with no key at all: <strong>a JWT is signed, not encrypted</strong>. Verifying is simply step 3 again: recompute the HMAC over the first two parts with the server's secret and compare it, in constant time, with part 3. With the right secret they match; with a wrong secret they do not; and if anyone changes even one letter of the payload, the recomputed signature will no longer match either.</p>
  <p>The <code>exp</code> claim, 1893456000, is a <strong>Unix timestamp</strong>, the number of seconds since 1 January 1970, here a date in 2030. Every JWT library checks it automatically when decoding. Here is a token that lives for only two seconds:</p>
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
print("leeway=5    :", jwt.decode(token, SECRET, algorithms=["HS256"], leeway=5)["sub"])</div>
  <div class="fx" data-lang="text">seconds left: 2
after 3 s   : ExpiredSignatureError - Signature has expired
leeway=5    : asha</div>
  <p>The token decoded fine with two seconds left. After sleeping three seconds, decoding raised <code>ExpiredSignatureError</code>. The <code>leeway=5</code> argument tolerates a few seconds of difference between servers' clocks, which is why the last line still accepted it.</p>
  <p>So far one secret both signs and verifies tokens. That is fine when a single service does both, but if ten Biteful services must verify tokens, all ten need the secret, and then any of them, including a buggy or compromised one, could also <em>issue</em> admin tokens. The alternative is a <strong>key pair</strong>, from public-key cryptography: a <strong>private key</strong> that can sign, kept only by the login service, and a matching <strong>public key</strong> that can only verify, which can be handed to everyone. <strong>RS256</strong> (RSA signatures) and <strong>ES256</strong> (elliptic-curve signatures) work this way:</p>
  <div class="fx" data-lang="py">import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

# The auth service creates a key pair once. The private key never leaves it.
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_pem = private_key.public_key().public_bytes(
    serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)
print(public_pem.decode().splitlines()[0], "... (safe to publish)")

token = jwt.encode({"sub": "asha", "role": "customer"}, private_key, algorithm="RS256")
print("header        :", jwt.get_unverified_header(token))
print("orders service:", jwt.decode(token, public_pem, algorithms=["RS256"]))   # verifies with PUBLIC key

public_key = private_key.public_key()
print("private key can sign:", hasattr(private_key, "sign"), "| public key can sign:", hasattr(public_key, "sign"))
try:                                                  # a service holding only the public key...
    jwt.encode({"sub": "asha", "role": "admin"}, public_pem, algorithm="RS256")
except AttributeError as e:                           # ...cannot mint tokens
    print("minting an admin token with the public key:", type(e).__name__)</div>
  <div class="fx" data-lang="text">-----BEGIN PUBLIC KEY----- ... (safe to publish)
header        : {'alg': 'RS256', 'typ': 'JWT'}
orders service: {'sub': 'asha', 'role': 'customer'}
private key can sign: True | public key can sign: False
minting an admin token with the public key: AttributeError</div>
  <p>The orders service decoded and trusted Asha's token using only the public key. The next line shows why that is safe: the private key object has a <code>sign</code> operation and the public key simply does not, so when a service holding only the public key tries to mint an "admin" token, the library fails. This is how "Sign in with Google" can work: Google publishes its public keys at a well-known URL, called a <strong>JWKS</strong> (JSON Web Key Set), so any app can verify Google's tokens without ever having Google's secret.</p>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Signs with</th><th>Verifies with</th><th>Use when</th></tr>
    <tr><td><code>HS256</code></td><td>shared secret</td><td>the same secret</td><td>one service issues and checks tokens</td></tr>
    <tr><td><code>RS256</code> / <code>ES256</code></td><td>private key</td><td>public key</td><td>many services verify; only the auth service may issue</td></tr>
  </table>
  <p>Besides <code>sub</code> (the subject, meaning who the token is about) and <code>exp</code>, the standard claims are <code>iat</code> (issued at), <code>iss</code> (issuer: who made it), <code>aud</code> (audience: which API it is meant for) and <code>jti</code> (a unique id for this token). Now back to the wristband problem. Because any service can verify a JWT on its own, there is no central record to delete when Asha logs out or her phone is stolen: the token stays valid until <code>exp</code>. The standard compromise is to use two tokens. A short-lived <strong>access token</strong> (about 15 minutes) is sent on every request. A longer-lived <strong>refresh token</strong> (days) is used only to get new access tokens, and the server keeps a list of refresh tokens that are still allowed, so those <em>can</em> be cancelled:</p>
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
  <p>The access token lives 900 seconds, which is 15 minutes. Using the refresh token produced a new pair and, importantly, removed the old refresh token's id from the allowed list, so each refresh token works exactly once. This is called <strong>rotation</strong>, and it means a stolen refresh token that is replayed is refused, as the third line shows. After logout, no new access tokens can be minted; the one already issued keeps working for at most 15 minutes. Notice that a little server-side state has crept back in (the set of allowed refresh ids). That is the honest trade-off: JWTs remove the lookup from every request, and pay for it with harder revocation.</p>
  <table class="tbl">
    <tr><th></th><th>Server session</th><th>JWT</th></tr>
    <tr><td>Where the state lives</td><td>on the server (Redis, database)</td><td>inside the token</td></tr>
    <tr><td>Per request</td><td>look up the session id</td><td>verify the signature, no lookup</td></tr>
    <tr><td>Logout / revoke</td><td>delete the row: instant</td><td>hard: valid until <code>exp</code> (short expiry, refresh rotation, a <code>jti</code> denylist)</td></tr>
    <tr><td>Many services or copies</td><td>all need the shared store</td><td>anyone with the key verifies</td></tr>
    <tr><td>Typical fit</td><td>one web app in a browser</td><td>mobile apps, single-page apps, many services</td></tr>
  </table>

  <h2 id="aa-jwttrap"><span class="num">06</span>JWT Traps</h2>
  <p>The maths behind a JWT signature is solid; nobody breaks HMAC or RSA. So attackers go after the code that <em>checks</em> the token instead. Asha decodes her own token, sees <code>"role":"customer"</code>, and wonders what happens if she changes it to <code>admin</code>. Others replay old tokens, send tokens that claim to need no signature, or hope a developer switched verification off "just for debugging". Here are the four classic attempts against PyJWT:</p>
  <div class="fx" data-lang="py">import jwt, base64, json, time

SECRET = "change-me-to-32+-random-bytes-in-prod"
token = jwt.encode({"sub": "asha", "role": "customer", "exp": 1893456000}, SECRET, algorithm="HS256")
header_b64, payload_b64, sig_b64 = token.split(".")

# 1) Tampering: Asha edits role to admin, keeps the old signature
evil_payload = base64.urlsafe_b64encode(json.dumps(
    {"sub": "asha", "role": "admin", "exp": 1893456000}).encode()).rstrip(b"=").decode()
forged = f"{header_b64}.{evil_payload}.{sig_b64}"
try:
    jwt.decode(forged, SECRET, algorithms=["HS256"])
except jwt.InvalidSignatureError as e:
    print("1 forged :", type(e).__name__, "-", e)

# 2) Expired token replayed
old = jwt.encode({"sub": "asha", "exp": int(time.time()) - 10}, SECRET, algorithm="HS256")
try:
    jwt.decode(old, SECRET, algorithms=["HS256"])
except jwt.ExpiredSignatureError as e:
    print("2 old    :", type(e).__name__, "-", e)

# 3) The 'none' algorithm attack: an unsigned token claiming admin
none_tok = jwt.encode({"sub": "asha", "role": "admin"}, None, algorithm="none")
print("3 token  :", none_tok)
try:
    jwt.decode(none_tok, SECRET, algorithms=["HS256"])
except jwt.InvalidAlgorithmError as e:
    print("3 none   :", type(e).__name__, "-", e)

# 4) The BUG that lets it through: skipping verification
print("4 UNSAFE :", jwt.decode(none_tok, options={"verify_signature": False}))</div>
  <div class="fx" data-lang="text">1 forged : InvalidSignatureError - Signature verification failed
2 old    : ExpiredSignatureError - Signature has expired
3 token  : eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhc2hhIiwicm9sZSI6ImFkbWluIn0.
3 none   : InvalidAlgorithmError - The specified alg value is not allowed
4 UNSAFE : {'sub': 'asha', 'role': 'admin'}</div>
  <p>Attack 1 edited the payload to say <code>admin</code> but kept the old signature. The signature was computed over the old payload, so the server's recomputed signature no longer matches and PyJWT raises <code>InvalidSignatureError</code>. Attack 2 replayed a token whose <code>exp</code> was in the past and was rejected automatically. Attack 3 is the famous <strong><code>alg: none</code></strong> attack. The JWT standard includes an algorithm called "none" meaning "this token is not signed"; look at the token printed on line 3, which ends with a dot and nothing after it. Early JWT libraries read the <code>alg</code> field from the token and obeyed it, so an attacker could simply declare that no signature was needed. Our server rejected it with <code>InvalidAlgorithmError</code> for one reason only: we passed <code>algorithms=["HS256"]</code>. That argument means <em>the server</em> decides which algorithm is acceptable, not the token. It is like a guard who checks seals according to the rulebook rather than believing a wristband printed "no seal needed".</p>
  <p>Attack 4 is the same unsigned admin token sent to a server that decodes with <code>verify_signature: False</code>. It is accepted, and Asha is now an admin. This line usually appears during debugging and gets shipped by accident; it turns the whole JWT scheme into a header that says whatever the caller wants, which is exactly where section 01 started.</p>
  <p>Two subtler traps need a little more set-up. The first is a missing <strong>audience</strong> check. If Biteful's orders API and payments API both trust tokens from the same login service, a token issued for the orders API would also be accepted by the payments API unless each checks the <code>aud</code> claim. The second is <strong>algorithm confusion</strong>. Suppose a server uses RS256, so its public key is, by design, public. An attacker builds a token whose header says <code>HS256</code> and signs it with HMAC, using the public key's text as the "secret". A careless server that reads <code>alg</code> from the token would then check the HMAC with that same public key text, and it would match.</p>
  <div class="fx" data-lang="py">import base64, hashlib, hmac, json, time, jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

b64url = lambda b: base64.urlsafe_b64encode(b).rstrip(b"=").decode()

# Trap: no audience check. A token minted for the orders API...
SECRET = "change-me-to-32+-random-bytes-in-prod"
tok = jwt.encode({"sub": "asha", "aud": "orders-api", "exp": int(time.time()) + 900}, SECRET, "HS256")
try:                                   # ...is shown to the payments API, which checks aud
    jwt.decode(tok, SECRET, algorithms=["HS256"], audience="payments-api")
except jwt.InvalidAudienceError as e:
    print("aud check  :", type(e).__name__, "-", e)

# Trap: algorithm confusion. The server uses RS256; its public key is public.
priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_pem = priv.public_key().public_bytes(serialization.Encoding.PEM,
                                            serialization.PublicFormat.SubjectPublicKeyInfo)
# The attacker signs an admin token with HMAC, using the PUBLIC key as the "secret"
p1 = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
p2 = b64url(json.dumps({"sub": "asha", "role": "admin"}).encode())
sig = b64url(hmac.new(public_pem, f"{p1}.{p2}".encode(), hashlib.sha256).digest())
evil = f"{p1}.{p2}.{sig}"
try:
    jwt.decode(evil, public_pem, algorithms=["RS256"])          # pinned: RS256 only
except jwt.InvalidAlgorithmError as e:
    print("pinned     :", type(e).__name__, "-", e)
try:
    jwt.decode(evil, public_pem, algorithms=["RS256", "HS256"])  # lazy allow-list
except jwt.PyJWTError as e:
    print("both algs  :", type(e).__name__, "-", e)</div>
  <div class="fx" data-lang="text">aud check  : InvalidAudienceError - Audience doesn't match
pinned     : InvalidAlgorithmError - The specified alg value is not allowed
both algs  : InvalidKeyError - The specified key is an asymmetric key or x509 certificate and should not be used as an HMAC secret.</div>
  <p>The audience check caught a token minted for <code>orders-api</code> being shown to the payments API. The algorithm-confusion token was rejected by the server that pinned <code>algorithms=["RS256"]</code>, because the token claims HS256. The last line shows that a lazy allow-list containing both algorithms was saved only by a safety check inside PyJWT, which refuses to use a public key as an HMAC secret. Do not rely on that; pin the one algorithm you actually use.</p>
  <p>The final trap is not an attack but a misunderstanding. Because the payload is only encoded, anything placed in it is readable by everyone who sees the token: browser storage, logs, proxies. Put user ids and roles in a JWT, never passwords, API keys, phone numbers or other personal data. Put together, a safe decode looks like <code>jwt.decode(token, key, algorithms=["HS256"], audience="orders-api", issuer="auth.biteful.in")</code>, wrapped in a <code>try</code> that turns any <code>jwt.PyJWTError</code> into a 401 with a generic message.</p>

  <h2 id="aa-app"><span class="num">07</span>Auth as FastAPI Dependencies</h2>
  <p>We now have all the pieces for a real server: API keys for Dosa Hut's till, bcrypt for passwords, short-lived JWTs after login, role checks and ownership checks. The remaining question is how to apply them to every endpoint without copy-pasting the same ten lines into each one, because copy-pasted security checks are exactly where one endpoint ends up forgetting one. FastAPI's <strong>dependencies</strong> (covered in the <a class="xref" data-note="api_fastapi">FastAPI</a> note) are the answer: a check is written once as a function, and an endpoint declares that it needs it with <code>Depends(...)</code>. FastAPI runs the dependency before the endpoint, and if the dependency raises an <code>HTTPException</code>, the endpoint never runs at all.</p>
  <p>In the file below, <code>till_key</code> and <code>current_user</code> are the authentication gate (one for programs, one for people), and <code>require_role</code> is the authorization gate. Notice that <code>require_role</code>'s inner <code>check</code> itself depends on <code>current_user</code>, so authentication is guaranteed to run before authorization; the order of the gates cannot be got wrong. The ownership checks live inside the endpoints that touch a specific order. (bcrypt cost 4 keeps this demo quick to start; use 12 in production. The CORS lines are explained in section 10.)</p>
  <div class="fx" data-lang="py"># auth_app.py: Biteful's API with real identity, as FastAPI dependencies
import hashlib, time
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
app.add_middleware(CORSMiddleware, allow_origins=["https://partners.biteful.in"],   # used in the CORS section
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
        raise HTTPException(404, "order not found")   # ownership check (BOLA section)
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
  <p>To try it against a real server, we start it with <code>uvicorn auth_app:app --port 18411</code>. A <strong>port</strong> is a numbered door on a machine that a program listens on, so several servers can share one computer, and <code>localhost</code> means "this same machine" (see <a class="xref" data-note="cf_networking">Networking</a>). Then we log in three people with <code>curl</code>, decode Ravi's payload with the ordinary <code>base64</code> tool to prove again that it is readable, and make a series of calls. The <code>-w ' [%{http_code}]'</code> option makes curl print the status code after each response body.</p>
  <div class="fx" data-lang="text">$ ASHA=$(curl -s -X POST localhost:18411/v1/login -d "username=asha&amp;password=asha@1997" | jq -r .access_token)
$ BEN=$(curl -s -X POST localhost:18411/v1/login -d "username=ben&amp;password=ben@2001" | jq -r .access_token)
$ RAVI=$(curl -s -X POST localhost:18411/v1/login -d "username=ravi&amp;password=ravi@dosa" | jq -r .access_token)

$ echo $RAVI | cut -d. -f2 | base64 -d 2&gt;/dev/null; echo
{"sub":"ravi","role":"staff","exp":1795074453,"restaurant":10}

$ curl -s -w ' [%{http_code}]\\n' -X POST localhost:18411/v1/login -d 'username=asha&amp;password=123456'
{"detail":"wrong username or password"} [401]

$ curl -s -w ' [%{http_code}]\\n' localhost:18411/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'
{"caller":"dosa-hut-till","orders":[101]} [200]

$ curl -s -w ' [%{http_code}]\\n' localhost:18411/v1/partner/orders -H 'X-API-Key: guess'
{"detail":"invalid API key"} [401]

$ curl -s -w ' [%{http_code}]\\n' localhost:18411/v1/orders/101 -H "Authorization: Bearer $ASHA"
{"order_id":101,"customer":"asha","restaurant_id":10,"total":240,"status":"placed"} [200]

$ curl -s -w ' [%{http_code}]\\n' localhost:18411/v1/orders/101
{"detail":"missing bearer token"} [401]

$ curl -s -w ' [%{http_code}]\\n' localhost:18411/v1/orders/101 -H 'Authorization: Bearer abc.def.ghi'
{"detail":"invalid or expired token"} [401]

$ curl -s -w ' [%{http_code}]\\n' localhost:18411/v1/orders/101 -H "Authorization: Bearer $BEN"
{"detail":"order not found"} [404]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH 'localhost:18411/v1/orders/101?status=preparing' -H "Authorization: Bearer $ASHA"
{"detail":"forbidden: needs role staff"} [403]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH 'localhost:18411/v1/orders/101?status=preparing' -H "Authorization: Bearer $RAVI"
{"order_id":101,"customer":"asha","restaurant_id":10,"total":240,"status":"preparing"} [200]

$ curl -s -w ' [%{http_code}]\\n' -X PATCH 'localhost:18411/v1/orders/102?status=preparing' -H "Authorization: Bearer $RAVI"
{"detail":"order not found"} [404]

$ curl -s -w ' [%{http_code}]\\n' -X DELETE localhost:18411/v1/restaurants/14 -H "Authorization: Bearer $RAVI"
{"detail":"forbidden: needs role admin"} [403]</div>
  <p>Every call was decided by a different gate. The decoded payload shows Ravi's token carries <code>"restaurant":10</code>, which is what lets the PATCH endpoint check "your restaurant's order" without a database lookup. A wrong password got 401 with a deliberately vague message. Dosa Hut's till was recognised by its key; a guessed key got 401. Asha read her own order with her token. With no token, or a garbage one, <code>current_user</code> stopped the request with 401. Ben, perfectly logged in, asked for Asha's order 101 and got <strong>404</strong>: authentication passed, but the ownership check in <code>get_order</code> failed, and answering "not found" rather than 403 avoids even confirming that order 101 exists. Asha trying to change an order's status got 403 from <code>require_role("staff")</code>. Ravi could set his own restaurant's order 101 to "preparing", but got 404 for Biryani Bros' order 102, and 403 when trying to delete a restaurant, which needs an admin.</p>
  <p>Putting the checks in dependencies has a further benefit: in tests you can swap them out with <code>app.dependency_overrides</code>, so you can test the business logic as "Ravi" without generating real tokens.</p>

  <h2 id="aa-oauth"><span class="num">08</span>OAuth 2.0 &amp; OpenID Connect</h2>
  <p>So far Biteful checks its own passwords and issues its own tokens. Now it wants a "Sign in with Google" button. Biteful must learn who Asha is without ever seeing her Google password, and must not gain the ability to read her Gmail. Separately, Dosa Hut's accounting software, another program, needs a token to call Biteful's reports API every night. Handing passwords from one company to another is exactly what we want to avoid, so how does an app get limited access on someone's behalf?</p>
  <p>The standard for this is <strong>OAuth 2.0</strong>: a framework in which an app obtains a limited, expiring <strong>access token</strong> from a trusted login service, instead of the user's password. Four parties take part. The <strong>user</strong> (Asha) owns the account. The <strong>client</strong> is the app asking for access (Biteful). The <strong>authorization server</strong> is the service that checks the user's password and hands out tokens (Google's login service). The <strong>resource server</strong> is the API that accepts the token. The token carries <strong>scopes</strong>, the specific permissions granted, such as <code>openid email</code> ("tell me who this is and their email") rather than "everything". Think of a hotel key card. Reception checks your passport once and issues a card that opens only your room and the gym, only until checkout. The room door never sees your passport, and reception can cancel the card at any time.</p>
  <p>Each way of obtaining a token in OAuth is called a <strong>grant</strong> (or flow). For a person using an app or a browser, the recommended one is the <strong>authorization code flow with PKCE</strong>. The diagram shows its steps; the thin arrows pass through Asha's browser as redirects, and the thick ones go directly from server to server.</p>
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
  </svg><figcaption>The authorization code flow with PKCE. The code crosses the front channel (the browser), so on its own it must be worthless; tokens travel only on the back channel.</figcaption></figure>
  <p>Follow the diagram from the top. In step 1, Biteful redirects Asha's browser to Google's <code>/authorize</code> page, saying which app is asking (<code>client_id</code>), what it wants (<code>scope</code>), where to send her back (<code>redirect_uri</code>, which must match one registered in advance), a random <code>state</code> value, and a <code>code_challenge</code> that we will come to in a moment. In step 2, Asha types her password <em>on Google's own page</em> and clicks Allow; Biteful never sees this. In step 3, Google redirects the browser back to Biteful's callback URL with a one-time <strong>authorization code</strong> and the same <code>state</code>. Biteful checks that <code>state</code> matches what it sent, which proves the callback is the answer to its own request and not a forged link someone tricked Asha into clicking. In step 4, Biteful's backend sends the code directly to Google's <code>/token</code> endpoint, and in step 5 receives the tokens. In step 6 the access token is sent as <code>Authorization: Bearer ...</code> to whichever API it was issued for. A <strong>bearer token</strong> is simply one where whoever holds it is trusted, like cash.</p>
  <p>Why the detour through a code, instead of Google putting the token straight into the redirect? Because everything in steps 1 and 3 travels through the browser as URLs, the <strong>front channel</strong>, and URLs leak: into browser history, server logs, and on phones, into other apps that register for the same link. A code that leaks is useless unless it can be exchanged, and the exchange in step 4 happens on the <strong>back channel</strong>, directly between servers. But a mobile or single-page app cannot keep a client secret (anyone can unpack the app), so what stops a thief who grabbed the code in step 3 from doing step 4 themselves?</p>
  <p>That is the job of <strong>PKCE</strong> (Proof Key for Code Exchange, pronounced "pixy"). Before step 1, the app invents a fresh random secret called the <strong>code verifier</strong> and keeps it to itself. It sends only the SHA-256 hash of the verifier, the <strong>code challenge</strong>, in step 1. In step 4 it sends the raw verifier along with the code; the authorization server hashes it and compares with the challenge it stored. A thief who copied the code from the URL never saw the verifier and cannot work it out from the hash, which is one-way. To see every step really happen, below is a toy authorization server playing Google's part, followed by both flows run against it:</p>
  <div class="fx" data-lang="py">import base64, hashlib, secrets
from urllib.parse import urlparse, parse_qs
from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.testclient import TestClient

def s256(v: str) -&gt; str:                                 # PKCE "S256": SHA-256, then base64url
    return base64.urlsafe_b64encode(hashlib.sha256(v.encode()).digest()).rstrip(b"=").decode()

def oauth_error(code, status=400):                       # OAuth's standard error shape
    return JSONResponse({"error": code}, status_code=status)

# ---------- a toy authorization server, playing Google's part ----------
CLIENTS = {"biteful-app": {"redirect_uri": "https://biteful.in/callback"},
           "dosa-hut-accounts": {"secret_sha256": hashlib.sha256(b"cs_8d1e5b").hexdigest(),
                                 "allowed": {"reports:read"}}}
CODES = {}                                               # code -&gt; details; each code works once
auth = FastAPI()

@auth.get("/authorize")
def authorize(client_id: str, redirect_uri: str, scope: str, state: str, code_challenge: str):
    if CLIENTS.get(client_id, {}).get("redirect_uri") != redirect_uri:
        return oauth_error("invalid_request")
    # (the real server shows its login + consent page here; pretend Asha logged in and clicked Allow)
    code = secrets.token_urlsafe(16)
    CODES[code] = {"user": "asha@gmail.com", "client": client_id, "scope": scope, "challenge": code_challenge}
    return RedirectResponse(f"{redirect_uri}?code={code}&amp;state={state}", status_code=302)

@auth.post("/token")
def token(grant_type: str = Form(), client_id: str = Form(), code: str = Form(""),
          code_verifier: str = Form(""), client_secret: str = Form(""), scope: str = Form("")):
    if grant_type == "authorization_code":
        entry = CODES.pop(code, None)                    # pop: a used code is gone
        if entry is None or entry["client"] != client_id or s256(code_verifier) != entry["challenge"]:
            return oauth_error("invalid_grant")
        return {"access_token": "at_" + secrets.token_hex(4), "token_type": "Bearer", "expires_in": 3600,
                "scope": entry["scope"], "id_token": f"(a JWT signed by the server: sub={entry['user']})"}
    if grant_type == "client_credentials":
        c = CLIENTS.get(client_id, {})
        if hashlib.sha256(client_secret.encode()).hexdigest() != c.get("secret_sha256"):
            return oauth_error("invalid_client", 401)
        if not set(scope.split()) &lt;= c["allowed"]:
            return oauth_error("invalid_scope")
        return {"access_token": "at_" + secrets.token_hex(4), "token_type": "Bearer", "expires_in": 3600, "scope": scope}
    return oauth_error("unsupported_grant_type")

google = TestClient(auth, follow_redirects=False)

# ---------- Flow 1: authorization code + PKCE (Asha, "Sign in with Google") ----------
verifier, state = secrets.token_urlsafe(48), secrets.token_urlsafe(8)     # stay inside the Biteful app
r = google.get("/authorize", params={"client_id": "biteful-app", "redirect_uri": "https://biteful.in/callback",
                                     "scope": "openid email", "state": state, "code_challenge": s256(verifier)})
print("step 3:", r.status_code, "Location:", r.headers["location"].split("?")[0] + "?code=...&amp;state=...")
back = parse_qs(urlparse(r.headers["location"]).query)
print("state matches what we sent:", back["state"][0] == state)
code = back["code"][0]
r = google.post("/token", data={"grant_type": "authorization_code", "client_id": "biteful-app",
                                "code": code, "code_verifier": verifier})
print("step 5:", r.status_code, r.json())
r = google.post("/token", data={"grant_type": "authorization_code", "client_id": "biteful-app",
                                "code": code, "code_verifier": verifier})
print("same code again:", r.status_code, r.json())

# a thief copies a fresh code from the URL, but never saw the verifier
r = google.get("/authorize", params={"client_id": "biteful-app", "redirect_uri": "https://biteful.in/callback",
                                     "scope": "openid email", "state": state, "code_challenge": s256(verifier)})
stolen = parse_qs(urlparse(r.headers["location"]).query)["code"][0]
r = google.post("/token", data={"grant_type": "authorization_code", "client_id": "biteful-app",
                                "code": stolen, "code_verifier": secrets.token_urlsafe(48)})
print("thief  :", r.status_code, r.json())

# ---------- Flow 2: client credentials (Dosa Hut's accounting software, no human) ----------
for secret, scope in [("cs_8d1e5b", "reports:read"), ("cs_8d1e5b", "orders:write"), ("guess", "reports:read")]:
    r = google.post("/token", data={"grant_type": "client_credentials", "client_id": "dosa-hut-accounts",
                                    "client_secret": secret, "scope": scope})
    print(f"machine ({secret}, {scope}):", r.status_code, r.json())</div>
  <div class="fx" data-lang="text">step 3: 302 Location: https://biteful.in/callback?code=...&amp;state=...
state matches what we sent: True
step 5: 200 {'access_token': 'at_e9a5061b', 'token_type': 'Bearer', 'expires_in': 3600, 'scope': 'openid email', 'id_token': '(a JWT signed by the server: sub=asha@gmail.com)'}
same code again: 400 {'error': 'invalid_grant'}
thief  : 400 {'error': 'invalid_grant'}
machine (cs_8d1e5b, reports:read): 200 {'access_token': 'at_0003c204', 'token_type': 'Bearer', 'expires_in': 3600, 'scope': 'reports:read'}
machine (cs_8d1e5b, orders:write): 400 {'error': 'invalid_scope'}
machine (guess, reports:read): 401 {'error': 'invalid_client'}</div>
  <p>Read the output from the top. Step 3 is a <code>302</code> redirect back to <code>biteful.in/callback</code> carrying the code, and the returned <code>state</code> matched. Exchanging the code with the right verifier returned an access token, its scopes and an <code>id_token</code> (more on that below). Trying the same code a second time failed with <code>invalid_grant</code>, because codes are single-use. Most importantly, the thief who intercepted a fresh code but had to guess the verifier also got <code>invalid_grant</code>: PKCE made the stolen code worthless.</p>
  <p>The second flow is for machines. Dosa Hut's accounting software has no user and no browser, so it uses the <strong>client credentials</strong> grant: it sends its own <code>client_id</code> and <code>client_secret</code> directly to the token endpoint and receives a short-lived token. With the right secret and an allowed scope it got a token for <code>reports:read</code>. Asking for <code>orders:write</code>, a scope it was never granted, gave <code>invalid_scope</code>, and a wrong secret gave <code>invalid_client</code> with 401. Compared with handing out a long-lived API key, the secret is only ever sent to the authorization server, and the token that travels to the APIs expires within the hour.</p>
  <p>One honest clarification about "Sign in with Google". OAuth on its own is about <em>access</em> ("this app may read your email address"), not <em>identity</em> ("this person is asha@gmail.com"). The identity layer built on top of it is <strong>OpenID Connect</strong> (OIDC). Requesting the <code>openid</code> scope makes the authorization server also return an <strong>ID token</strong>: a JWT signed by Google that says who the user is. For login, that ID token is what Biteful really needs. It verifies the signature with Google's public keys (the JWKS from section 05), checks that <code>aud</code> is Biteful's own client id, and then issues <em>its own</em> session or JWT exactly as in sections 04 and 05. Two older flows should not be used any more: the <em>implicit</em> flow, which put the token directly in the redirect URL, and the <em>password</em> grant, in which the app collected the user's password itself.</p>

  <h2 id="aa-tls"><span class="num">09</span>HTTPS &amp; TLS</h2>
  <p>Look back at everything so far: passwords at login, API keys, session cookies, bearer tokens, OAuth codes. Every scheme sends a secret over the network, and most send one on every request. Asha orders lunch on a café's free Wi-Fi. Between her phone and Biteful's server sit the café's router, its internet provider and several other networks, and on plain HTTP every one of them sees the request as readable text. Here is what such a machine sees; the "eavesdropper" below is just a program that prints the raw bytes it receives:</p>
  <div class="fx" data-lang="py">import socket, threading, requests

# Pretend to be any machine between Asha and Biteful: just print the raw bytes that pass through
listener = socket.create_server(("127.0.0.1", 18421))
def eavesdrop():
    conn, _ = listener.accept()
    print(conn.recv(4096).decode())                       # exactly what travels on the wire
    conn.sendall(b"HTTP/1.1 200 OK\\r\\nContent-Length: 2\\r\\nConnection: close\\r\\n\\r\\nok")
    conn.close()
threading.Thread(target=eavesdrop).start()

requests.get("http://127.0.0.1:18421/v1/orders/101",
             headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhc2hhIn0.Xq3...",
                      "X-API-Key": "bf_live_9f2c7a"})</div>
  <div class="fx" data-lang="text">GET /v1/orders/101 HTTP/1.1
Host: 127.0.0.1:18421
User-Agent: python-requests/2.34.2
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhc2hhIn0.Xq3...
X-API-Key: bf_live_9f2c7a</div>
  <p>The bearer token and the API key are right there in plain text. Anyone on the path could copy the token and become Asha until it expires, or quietly change the response on its way back. And there is a second problem hidden here: how does Asha's app even know it is talking to the real Biteful, and not to a café router pretending to be it?</p>
  <p><strong>HTTPS</strong> is ordinary HTTP sent inside a <strong>TLS</strong> (Transport Layer Security) connection, and TLS solves both problems at once. It provides <strong>encryption</strong>, so eavesdroppers see only gibberish; <strong>integrity</strong>, so any change to the bytes in transit is detected; and <strong>server authentication</strong>, so the client knows it really is talking to <code>api.biteful.in</code>. Think of the difference between a postcard, which every postal worker can read and alter, and a sealed, tamper-evident envelope that is only handed over after you have checked the courier's ID badge, issued by an office you already trust.</p>
  <p>That ID badge is a <strong>certificate</strong>: a small file saying "this public key belongs to api.biteful.in", signed by a <strong>Certificate Authority</strong> (CA) such as Let's Encrypt. Every operating system and browser ships with a list of CAs it trusts. When a connection starts, the client says hello, the server sends its certificate, and the client checks that it was signed by a trusted CA, has not expired, and names the host it meant to reach. Then the two sides use public-key cryptography to agree on a fresh shared key that no eavesdropper can work out, and everything afterwards, including all the HTTP headers, is encrypted with it. This opening exchange is the <strong>TLS handshake</strong> (more on the underlying connection in <a class="xref" data-note="cf_networking">Networking</a>).</p>
  <p>To watch the certificate check in action, we create a <strong>self-signed</strong> certificate, one that vouches for itself with no CA involved, and run the section 07 server with TLS on port 18443:</p>
  <div class="fx" data-lang="text">$ openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 30 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost" 2&gt;/dev/null
$ uvicorn auth_app:app --port 18443 --ssl-keyfile key.pem --ssl-certfile cert.pem &amp;

$ curl -sS https://localhost:18443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'; echo "exit code $?"
curl: (60) SSL certificate problem: self-signed certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
exit code 60

$ curl -s --cacert cert.pem https://localhost:18443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'; echo
{"caller":"dosa-hut-till","orders":[101]}

$ curl -sv --cacert cert.pem https://localhost:18443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a' 2&gt;&amp;1 | grep -E 'SSL connection|subject:|issuer:|verify ok'
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / RSASSA-PSS
*  subject: CN=localhost
*  issuer: CN=localhost
*  SSL certificate verify ok.

$ curl -sS http://localhost:18443/v1/partner/orders -H 'X-API-Key: bf_live_9f2c7a'
curl: (52) Empty reply from server</div>
  <p>The first curl refused to proceed, with exit code 60: the certificate is not signed by any CA it trusts, so the identity check failed and the API key was never sent. That refusal is TLS doing its job; a real impostor would look exactly like this. With <code>--cacert cert.pem</code> we told curl to trust this one certificate, and the till's request succeeded over TLS 1.3. The verbose output shows <code>subject</code> and <code>issuer</code> are both <code>CN=localhost</code>, which is what self-signed means. The last call spoke plain HTTP to the TLS port and got nothing back. In production, a free Let's Encrypt certificate is signed by a CA everyone already trusts, so no client flag is needed.</p>
  <p>The tempting "fix" for a certificate error, <code>requests.get(url, verify=False)</code> or <code>curl -k</code>, switches off the identity check entirely, so anyone in the middle can pretend to be the server and read everything; never ship it. In larger systems TLS usually ends at a load balancer or nginx in front of the app, which then forwards plain HTTP over a private network (<strong>TLS termination</strong>, covered in <a class="xref" data-note="api_production">Production Backend</a>). Stricter setups encrypt inside too, often with <strong>mTLS</strong> (mutual TLS), where the client also presents a certificate, a common way for internal services to authenticate each other.</p>

  <h2 id="aa-cors"><span class="num">10</span>CORS</h2>
  <p>Browsers add one more rule of their own, and it causes more confusion than anything else in this note. Suppose Asha is logged in to Biteful in one tab and opens a random website in another. If that site's JavaScript could call Biteful's API using Asha's cookies and read the answers, it could read her orders and address. Browsers prevent this with the <strong>same-origin policy</strong>: JavaScript loaded from one <strong>origin</strong> may not read responses from a different origin. An origin is the combination of scheme, host and port, so <code>https://partners.biteful.in</code> and <code>https://api.biteful.in</code> are different origins even though both belong to Biteful.</p>
  <p>That raises a real problem: Biteful's own partner dashboard at <code>partners.biteful.in</code> needs to call <code>api.biteful.in</code>. <strong>CORS</strong> (Cross-Origin Resource Sharing) is how an API tells browsers which other origins are allowed to read its responses. It is done entirely with response headers, chiefly <code>Access-Control-Allow-Origin</code>. For requests that are not "simple", such as those with an <code>Authorization</code> header or a method like PATCH, the browser first sends a <strong>preflight</strong>: an <code>OPTIONS</code> request asking "may a page from this origin send this kind of request?", and only sends the real request if the answer is yes. The section 07 server allows exactly one origin, <code>https://partners.biteful.in</code>. Here are four real calls, each pretending to come from a page on a given origin:</p>
  <div class="fx" data-lang="text">$ curl -si -X OPTIONS localhost:18411/v1/orders/101 -H 'Origin: https://partners.biteful.in' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: Authorization' | grep -iE '^HTTP|^access-control|^vary'
HTTP/1.1 200 OK
vary: Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Request-Private-Network
access-control-allow-methods: GET, PATCH
access-control-max-age: 600
access-control-allow-headers: Accept, Accept-Language, Authorization, Content-Language, Content-Type
access-control-allow-origin: https://partners.biteful.in

$ curl -si -X OPTIONS localhost:18411/v1/orders/101 -H 'Origin: https://evil.example' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: Authorization' | grep -iE '^HTTP|^access-control-allow-origin|^Disallowed'
HTTP/1.1 400 Bad Request
Disallowed CORS origin

$ curl -si localhost:18411/v1/orders/101 -H 'Origin: https://partners.biteful.in' -H "Authorization: Bearer $ASHA" | grep -iE '^HTTP|^access-control|^\\{'
HTTP/1.1 200 OK
access-control-allow-origin: https://partners.biteful.in
{"order_id":101,"customer":"asha","restaurant_id":10,"total":240,"status":"placed"}

$ curl -si localhost:18411/v1/orders/101 -H 'Origin: https://evil.example' -H "Authorization: Bearer $ASHA" | grep -iE '^HTTP|^access-control|^\\{'
HTTP/1.1 200 OK
{"order_id":101,"customer":"asha","restaurant_id":10,"total":240,"status":"placed"}</div>
  <p>Call 1 is the preflight a browser on the partner dashboard would send. The reply names the dashboard in <code>access-control-allow-origin</code>, lists the allowed methods and headers, and says the browser may cache this answer for 600 seconds (<code>max-age</code>). Call 2 is the same preflight from <code>evil.example</code>: 400 and no allow-origin header, so a browser would never send the real request. Call 3 is the real GET from the dashboard, and the response carries the allow-origin header, so the browser lets the dashboard's JavaScript read it.</p>
  <p>Call 4 is the lesson. The real GET "from <code>evil.example</code>", carrying Asha's valid token, still returned 200 and her full order. The only difference is the missing <code>access-control-allow-origin</code> header, which would make a <em>browser</em> hide the response from that page's JavaScript; curl simply ignores it. Think of a building watchman who phones a flat before letting a visitor up. He protects residents from strangers walking in through the front door, but a thief climbing the back wall never meets him. CORS protects <em>users</em> from malicious websites running in their own browser; it does not protect your API from anyone. What actually protected Asha's order in call 4 is that the request needed her token, and the ownership check. The commonest CORS mistakes are covered in section 13.</p>

  <h2 id="aa-rl"><span class="num">11</span>Rate Limiting</h2>
  <p>Every lock is now in place, but any lock can be picked by trying enough keys. Asha's password, <code>asha@1997</code>, is weak. A bot can call <code>/v1/login</code> for her account with thousands of common passwords (<strong>brute force</strong>), or replay email-and-password pairs leaked from other websites, betting that people reuse them (<strong>credential stuffing</strong>). Each attempt costs the attacker almost nothing, and so far nothing stops it from trying forever.</p>
  <p><strong>Rate limiting</strong> caps how many requests, or here how many failed logins, a client may make in a window of time. Think of a phone that locks for a minute after five wrong PINs: it does not make the PIN any stronger, it makes guessing too slow to be worth it. Above the limit the server answers <strong>429 Too Many Requests</strong>, with a <code>Retry-After</code> header saying how many seconds to wait. The important design choice is to check the limit <em>before</em> checking the password, so that once the limit is hit, even the right password is refused until the window passes; otherwise the attacker would learn which guess was correct. With a limit of 5 failures in 60 seconds, predict the result of each of these seven guesses before reading the output:</p>
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
    recent = [t for t in failures[username] if now - t &lt; WINDOW_S]   # forget old failures
    failures[username] = recent
    if len(recent) &gt;= MAX_TRIES:                                      # checked BEFORE the password
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
    print(f"{guess:10} -&gt; {r.status_code} {r.json()['detail']:28} Retry-After: {r.headers.get('retry-after', '-')}")</div>
  <div class="fx" data-lang="text">123456     -&gt; 401 wrong username or password   Retry-After: -
password   -&gt; 401 wrong username or password   Retry-After: -
qwerty     -&gt; 401 wrong username or password   Retry-After: -
asha123    -&gt; 401 wrong username or password   Retry-After: -
iloveyou   -&gt; 401 wrong username or password   Retry-After: -
letmein    -&gt; 429 too many attempts, try later Retry-After: 60
asha@1997  -&gt; 429 too many attempts, try later Retry-After: 60</div>
  <p>The first five wrong guesses each got 401 and were recorded. The sixth found five recent failures and was refused with 429 and <code>Retry-After: 60</code> without the password even being looked at, and so was the seventh, even though it was Asha's real password. At five guesses a minute, a 10,000-word list takes about 33 hours for one account, and real systems add longer lockouts and alerts. Notice also that the 401 message is the same whether the username exists or not, so an attacker cannot use the login form to discover which accounts exist.</p>
  <p>Two cautions. This counter lives in one process's memory, so with four copies of the server behind a load balancer the attacker gets four times the attempts; production systems keep counters in Redis so all copies share them. And credential stuffing often tries <em>many</em> accounts with one or two passwords each from many different IP addresses, so limits are usually applied per account, per IP address and per API key together. The same idea per API key also stops one client from using up all your capacity, or from copying an ML model by sending it huge numbers of queries (<strong>model extraction</strong>). The algorithms used for general traffic limits (fixed window, sliding window, token bucket) are covered in <a class="xref" data-note="api_production">Production Backend</a>.</p>

  <h2 id="aa-owasp"><span class="num">12</span>BOLA &amp; the OWASP API Top 10</h2>
  <p>Identity is proven, roles are checked, the connection is encrypted and guessing is throttled. Yet the most common real API breach involves none of those failing. Ben is a genuine, logged-in customer with a perfectly valid token, and his order is 102. What happens if he simply asks for <code>/orders/101</code>? Every gate so far asks "who are you?" and "what kind of user are you?". None asks "is <em>this particular object</em> yours?".</p>
  <p><strong>OWASP</strong> (the Open Worldwide Application Security Project) is a non-profit that publishes widely used lists of the most common security risks, including an "API Security Top 10". Its number one entry is <strong>BOLA</strong>, Broken Object Level Authorization: an endpoint takes an object's id from the client and returns or changes that object without checking that the caller is allowed to access it. The older name is <strong>IDOR</strong>, Insecure Direct Object Reference. Picture a hotel where every valid key card opens every room: the front desk checked your passport perfectly, but nobody checked whether room 305 is yours. Many real leaks were exactly this, often found by someone simply counting through ids.</p>
  <div class="fx" data-lang="py">from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.testclient import TestClient

ORDERS = {101: {"customer": "asha", "restaurant": "Dosa Hut", "total": 240, "address": "Kothrud, Pune"},
          102: {"customer": "ben", "restaurant": "Biryani Bros", "total": 350, "address": "Bandra, Mumbai"}}
TOKENS = {"tok_asha": "asha", "tok_ben": "ben"}         # stand-in for the JWT check

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
  <p>The second line is the breach. Ben, properly authenticated, read Asha's order, including her home address, just by changing 102 to 101 in the URL. The fixed endpoint adds a single condition, <code>order["customer"] != user</code>, and now Ben gets 404 for order 101 while still reading his own order 102 normally. Returning 404 rather than 403 also avoids confirming that order 101 exists. In SQL the fix is the same idea written into the query: <code>WHERE order_id = :id AND customer_id = :current_user</code>. The section 07 server already did this, which is why Ben got 404 there too. Switching to random ids such as UUIDs makes ids harder to guess, but it is <em>not</em> the fix; ids leak through links, logs and shared screenshots. The ownership check is the fix, and the safest place for it is the data-access layer, so no individual endpoint can forget it.</p>
  <p>A close cousin is <strong>mass assignment</strong>, part of OWASP's "broken object property level authorization". It happens when an endpoint copies every field the client sent onto a stored object. Asha is allowed to add a note to her order, but watch what happens when her client also sends a total and a status:</p>
  <div class="fx" data-lang="py">from pydantic import BaseModel

order = {"order_id": 101, "customer": "asha", "total": 240, "status": "placed", "note": ""}
body = {"note": "extra chutney", "total": 1, "status": "delivered"}    # what Asha's client sent

buggy = {**order, **body}                    # copy every field the client sent onto the order
print("buggy:", buggy)

class OrderNoteIn(BaseModel):                # the ONLY field a customer may change
    note: str

fixed = {**order, **OrderNoteIn(**body).model_dump()}
print("fixed:", fixed)</div>
  <div class="fx" data-lang="text">buggy: {'order_id': 101, 'customer': 'asha', 'total': 1, 'status': 'delivered', 'note': 'extra chutney'}
fixed: {'order_id': 101, 'customer': 'asha', 'total': 240, 'status': 'placed', 'note': 'extra chutney'}</div>
  <p>The buggy version accepted the note, but also changed the total to ₹1 and marked the order delivered, because it trusted every field in the request body. The fixed version passes the body through a Pydantic model that declares the only field a customer may change, so the extra fields are simply dropped and the total stays ₹240. This is why the FastAPI note used separate input and output schemas for each endpoint. The other OWASP API risks map onto Biteful like this:</p>
  <table class="tbl">
    <tr><th>Risk</th><th>What it looks like on Biteful</th><th>Fix</th></tr>
    <tr><td>Broken object level authorization (BOLA, #1)</td><td>Ben reads order 101</td><td>ownership check on every object access</td></tr>
    <tr><td>Broken authentication</td><td>no login limit, unverified JWTs, tokens valid for 30 days</td><td>sections 03 to 06 and 11</td></tr>
    <tr><td>Broken object property level authorization</td><td>responses leak <code>customer_phone</code>; client sets <code>"total": 1</code></td><td>separate input and output schemas</td></tr>
    <tr><td>Unrestricted resource consumption</td><td>an order with 10,000 lines; huge uploads</td><td>size limits, rate limits, timeouts</td></tr>
    <tr><td>Broken function level authorization</td><td>a customer calls <code>DELETE /v1/restaurants/14</code></td><td>role checks on every admin route</td></tr>
    <tr><td>Server-side request forgery (SSRF)</td><td>"import menu from URL" is pointed at <code>http://169.254.169.254/</code>, the cloud's internal credentials address</td><td>allow-list hosts, block internal addresses</td></tr>
    <tr><td>Injection</td><td>search text pasted straight into SQL</td><td>parameterized queries</td></tr>
  </table>
  <p>APIs that serve ML models add a few risks of their own: model extraction (cloning, say, the delivery-time model by querying it many times, countered with rate limits and less precise outputs), oversized inputs, personal data leaking through responses, and for LLM endpoints <strong>prompt injection</strong>, where user-supplied text instructs the model to ignore its rules. The defence there follows the same theme as this whole note: never let model output trigger a privileged action without the normal authorization checks. The big lesson of the OWASP list is that most real breaches are authorization bugs, not broken cryptography. The token was valid; nobody checked whether this user owns this row.</p>

  <h2 id="aa-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The first mistake is swapping 401 and 403. Return 401 when the caller has not proved who they are (missing, invalid or expired credentials), and 403 when you know who they are and they are not allowed. When even admitting that an object exists would leak information, as with Ben and order 101, return 404.</p>
  <p>The second is calling <code>jwt.decode</code> without saying which algorithm to accept. Older libraries accepted whatever the token's header said, which is how the <code>alg: none</code> and algorithm-confusion attacks worked. PyJWT 2 now refuses outright, which turns the mistake into a crash rather than a hole:</p>
  <div class="fx" data-lang="py">import jwt

SECRET = "change-me-to-32+-random-bytes-in-prod"
token = jwt.encode({"sub": "asha"}, SECRET, algorithm="HS256")
try:
    jwt.decode(token, SECRET)                                  # no algorithms= argument
except jwt.DecodeError as e:
    print("DecodeError:", e)
print(jwt.decode(token, SECRET, algorithms=["HS256"]))       # the fix: say which algorithm you accept</div>
  <div class="fx" data-lang="text">DecodeError: It is required that you pass in a value for the "algorithms" argument when calling decode().
{'sub': 'asha'}</div>
  <p>The fix is the single argument <code>algorithms=["HS256"]</code> (or the one algorithm you actually use), plus <code>audience=</code> and <code>issuer=</code> when your tokens carry them, and never <code>verify_signature: False</code> outside a throwaway script.</p>
  <p>The third is "fixing" a CORS error by allowing every origin. When the partner dashboard shows a red CORS error, it is tempting to write <code>allow_origins=["*"]</code> together with <code>allow_credentials=True</code> so that cookies are sent too. The CORS standard forbids that combination, so some libraries quietly work around it by echoing back whatever origin the request came from:</p>
  <div class="fx" data-lang="py">from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True)   # "just make the error go away"

@app.get("/v1/me")
def me():
    return {"user": "asha", "address": "Kothrud, Pune"}

r = TestClient(app).get("/v1/me", headers={"Origin": "https://evil.example"})
print({k: v for k, v in r.headers.items() if k.startswith("access-control")})</div>
  <div class="fx" data-lang="text">{'access-control-allow-origin': 'https://evil.example', 'access-control-allow-credentials': 'true'}</div>
  <p>A request from <code>evil.example</code> was told "yes, you specifically may read this, with credentials". Every website on the internet can now read logged-in users' data through their browsers, which is precisely what the same-origin policy existed to prevent. List the exact origins you trust instead.</p>
  <p>Several other mistakes appeared earlier and are worth gathering in one place. Storing passwords with SHA-256, MD5 or reversible encryption instead of bcrypt or argon2id. Putting API keys in Git, frontend code or URLs. Putting secrets or personal data in a JWT payload, which anyone can read. Making access tokens valid for days instead of minutes. Checking that the user is logged in but not that the object belongs to them (BOLA). Copying request bodies straight onto database rows (mass assignment). Turning off certificate checks with <code>verify=False</code>. Giving different error messages for "no such user" and "wrong password", which tells attackers which usernames to target. And keeping sessions, login-failure counters or refresh-token lists in a Python dictionary, which silently breaks, or multiplies the limits, as soon as there is more than one server process.</p>

  <h2 id="aa-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The two questions</h3>
  <ul>
    <li><b>Authentication (AuthN)</b>: verifying who the caller is. Fails → <b>401</b> ("I don't know you").</li>
    <li><b>Authorization (AuthZ)</b>: deciding whether that identity may do this action on this object. Fails → <b>403</b> ("I know you, no"), or <b>404</b> to hide that the object exists.</li>
    <li>Order: AuthN → role check (function level) → ownership check (object level) → handler.</li>
    <li><b>Role / RBAC</b>: permissions attached to roles (customer, staff, admin). <b>Scope</b>: a named permission inside a token (<code>orders:read</code>).</li>
  </ul>
  <h3>Proving identity</h3>
  <table class="tbl">
    <tr><th>Mechanism</th><th>Who uses it</th><th>What the server stores</th><th>Key facts</th></tr>
    <tr><td>API key</td><td>programs, partners</td><td>SHA-256 of the key + prefix</td><td><code>secrets</code> to generate, header not URL, <code>hmac.compare_digest</code>, rotate</td></tr>
    <tr><td>Password</td><td>people, at login</td><td>bcrypt / argon2id hash (salt inside)</td><td>salted + slow; SHA-256 ≈ millions/s, bcrypt(12) ≈ 3/s per core</td></tr>
    <tr><td>Session</td><td>browser apps</td><td>session row in Redis/DB</td><td>random id in a cookie; <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code>; instant logout</td></tr>
    <tr><td>JWT</td><td>APIs, mobile, many services</td><td>nothing (or refresh-token ids)</td><td>signed not encrypted; short <code>exp</code> + rotating refresh token</td></tr>
    <tr><td>OAuth 2.0</td><td>third-party apps, machines</td><td>(at the authorization server)</td><td>auth code + PKCE for people; client credentials for machines</td></tr>
  </table>
  <h3>JWT</h3>
  <ul>
    <li>Format: <code>base64url(header) . base64url(payload) . base64url(signature)</code>.</li>
    <li>HS256 signature = HMAC-SHA256(secret, <code>part1.part2</code>). Verify = recompute and compare.</li>
    <li>Claims: <code>sub</code> who, <code>exp</code> expiry, <code>iat</code> issued at, <code>iss</code> issuer, <code>aud</code> audience, <code>jti</code> token id.</li>
    <li><b>HS256</b>: one shared secret. <b>RS256/ES256</b>: private key signs, public key verifies (JWKS).</li>
    <li>Access token ~15 min; refresh token days, single-use (rotation), revocable.</li>
  </ul>
  <h3>OAuth 2.0 &amp; OIDC</h3>
  <ul>
    <li>Parties: user, client (app), authorization server, resource server.</li>
    <li>Auth code + PKCE: redirect to /authorize (with <code>state</code>, <code>code_challenge</code>) → user logs in there → code back in URL → app POSTs code + <code>code_verifier</code> to /token → tokens.</li>
    <li>PKCE: <code>code_challenge = base64url(SHA256(code_verifier))</code>; a stolen code → <code>invalid_grant</code>.</li>
    <li><code>state</code> rejects forged callbacks. Client credentials = machine to machine.</li>
    <li><b>OIDC</b> adds the <b>ID token</b> (a JWT saying who the user is). Implicit and password grants are deprecated.</li>
  </ul>
  <h3>Protecting the path</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Protects against</th><th>Does NOT protect against</th></tr>
    <tr><td>TLS / HTTPS</td><td>eavesdropping, tampering, impostor servers</td><td>a valid but malicious caller</td></tr>
    <tr><td>CORS</td><td>other websites' JavaScript reading responses in a user's browser</td><td>curl, scripts, any non-browser caller</td></tr>
    <tr><td>Rate limiting</td><td>brute force, credential stuffing, one client hogging capacity</td><td>a single well-chosen request (BOLA)</td></tr>
    <tr><td>Ownership check</td><td>BOLA / IDOR</td><td>(this is the one that stops the #1 breach)</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import secrets, hashlib, hmac, bcrypt, jwt

key = "bf_live_" + secrets.token_urlsafe(24)                 # API key
stored = hashlib.sha256(key.encode()).hexdigest()
hmac.compare_digest(hashlib.sha256(sent.encode()).hexdigest(), stored)

h = bcrypt.hashpw(pw.encode(), bcrypt.gensalt(rounds=12))    # password
bcrypt.checkpw(pw.encode(), h)

response.set_cookie("sid", secrets.token_urlsafe(32),        # session cookie
                    httponly=True, secure=True, samesite="lax")

token = jwt.encode({"sub": "asha", "exp": now + 900}, SECRET, algorithm="HS256")
claims = jwt.decode(token, SECRET, algorithms=["HS256"],     # ALWAYS pin algorithms
                    audience="orders-api")

def current_user(authorization: str = Header(default="")):   # FastAPI dependency
    ...                                                      # 401 on any jwt.PyJWTError

order = db.get(oid)                                          # ownership (BOLA fix)
if order is None or order.customer != user: raise HTTPException(404)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>401 = unauthenticated, 403 = forbidden; 404 when existence is itself a secret.</li>
    <li>A JWT payload is readable by anyone: no secrets or personal data in it.</li>
    <li><code>jwt.decode</code> without <code>algorithms=[...]</code>, or with <code>verify_signature: False</code>, is a hole.</li>
    <li>SHA-256 is fine for long random API keys, wrong for passwords.</li>
    <li>CORS is not authentication; <code>*</code> + credentials is a misconfiguration.</li>
    <li>Never <code>verify=False</code> / <code>curl -k</code>.</li>
    <li>Sessions, rate-limit counters and refresh-token lists belong in Redis, not process memory.</li>
    <li>UUIDs are not an ownership check.</li>
  </ul>

  <h2 id="aa-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between authentication and authorization?</summary><div class="qa-body">Authentication verifies who the caller is, using a password, key or token. Authorization decides whether that verified identity may perform a particular action on a particular resource, using roles, scopes and ownership. Authentication always comes first, because you cannot check permissions for an unknown caller.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you return 401 and when 403? When would you return 404 instead?</summary><div class="qa-body">401 when the caller has not authenticated: no credentials, or invalid or expired ones. 403 when the caller is known but not permitted, such as a customer calling an admin route. 404 when revealing that the object exists is itself a leak, for example a user asking for another user's order by id.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should an API store and check API keys?</summary><div class="qa-body">Generate them with a cryptographically secure random source, show the key once, and store only its hash (SHA-256 is fine because the key is long and random) plus a short display prefix. On each request, hash the presented key and compare with <code>hmac.compare_digest</code> to avoid timing attacks. Send keys in headers over HTTPS, never in URLs or source code, and make them revocable and rotatable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't you store passwords with SHA-256? What should you use?</summary><div class="qa-body">SHA-256 is designed to be fast, so an attacker with a leaked hash can try billions of guesses per second on a GPU, and without a salt identical passwords share a hash, so rainbow tables work. Use a password hashing function such as argon2id or bcrypt: each password gets its own random salt and the function is deliberately slow with a tunable cost. argon2id is also memory-hard, which blunts GPU attacks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a salt, and where is it stored?</summary><div class="qa-body">A salt is a random value generated separately for each password and mixed in before hashing, so two users with the same password get different hashes and precomputed tables are useless. It is not secret: it is stored alongside the hash, and in bcrypt and argon2 it is embedded in the hash string itself, which is how the verify function can redo the computation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Sessions vs JWTs: what are the trade-offs?</summary><div class="qa-body">A session keeps state on the server and gives the client only a random id, so every request needs a lookup, but logout and revocation are instant. A JWT carries the claims inside a signed token, so any service holding the key can verify it with no lookup, which suits mobile apps and many services, but it cannot be revoked before it expires. JWT systems compensate with short-lived access tokens, rotating refresh tokens and sometimes a denylist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a JWT encrypted? Can a user change their role inside it?</summary><div class="qa-body">No, a standard JWT is signed, not encrypted: the header and payload are only base64url-encoded and anyone can read them. A user can edit the payload, but the signature was computed over the original, so verification fails with an invalid-signature error. If content must be hidden, use JWE (encrypted JWTs) or keep that data on the server.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through how a server verifies an HS256 JWT.</summary><div class="qa-body">Split the token on the dots; check the header's algorithm is the one the server allows (never trust the token's choice); recompute HMAC-SHA256 over <code>header.payload</code> with the server's secret, base64url-encode it, and compare it with the third part in constant time. Then check the claims: <code>exp</code> in the future (with a little leeway), and <code>aud</code> and <code>iss</code> if used. Any failure returns 401.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HS256 vs RS256: when would you choose each?</summary><div class="qa-body">HS256 uses one shared secret to sign and verify, which is simple when one service issues and checks tokens. RS256 (or ES256) uses a key pair: only the auth service holds the private key and can issue tokens, while every other service verifies with the public key, often published as a JWKS. Choose RS256 when many services or third parties verify, so a compromised verifier cannot mint tokens.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the "alg: none" attack, and what is algorithm confusion?</summary><div class="qa-body">In the <code>alg: none</code> attack the token's header claims it is unsigned, and a library that obeys the header accepts it without checking any signature. In algorithm confusion, a server using RS256 is sent a token marked HS256 that was HMAC-signed with the server's public key as the secret; a server that follows the header verifies it with that same public key and it matches. Both are prevented by pinning the accepted algorithm on the server, e.g. <code>algorithms=["RS256"]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you "log out" a user who holds a JWT?</summary><div class="qa-body">You cannot un-issue a JWT, so you limit the damage: keep access tokens short (5 to 15 minutes) and delete or revoke the refresh token so no new access tokens can be minted. Refresh tokens should rotate (single use) so a replayed one is detected. For immediate revocation you can keep a denylist of <code>jti</code> values in Redis until they expire, or rotate the signing key to log out everyone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which flags should a session cookie have, and what does each prevent?</summary><div class="qa-body"><code>HttpOnly</code> stops JavaScript from reading the cookie, so an XSS-injected script cannot steal it. <code>Secure</code> means it is only sent over HTTPS, so it cannot be sniffed. <code>SameSite=Lax</code> or <code>Strict</code> stops the browser attaching it to requests started by other sites, which defends against CSRF. Also use a long random id, a server-side expiry, and a new id at login to prevent session fixation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the OAuth 2.0 authorization code flow. Why is there a code at all?</summary><div class="qa-body">The app redirects the user to the authorization server with its client id, scopes, redirect URI and a random state; the user logs in and consents there; the server redirects back with a one-time code; the app's backend exchanges the code for tokens at the token endpoint. The code exists because the redirect travels through the browser, where URLs leak into history and logs, so only a short-lived, single-use code goes there, while tokens are delivered on the direct server-to-server channel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does PKCE solve, and how?</summary><div class="qa-body">Mobile and single-page apps cannot keep a client secret, so someone who intercepts the authorization code could redeem it themselves. With PKCE the app creates a random code verifier, sends only its SHA-256 hash (the challenge) in the authorization request, and sends the raw verifier when exchanging the code. The server hashes the verifier and compares; an attacker with only the code gets <code>invalid_grant</code>. It is now recommended for all clients, including server-side web apps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>OAuth 2.0 vs OpenID Connect? Which grant would you use machine to machine?</summary><div class="qa-body">OAuth 2.0 is about delegated access: getting a token that lets an app call an API with certain scopes. OpenID Connect is an identity layer on top of it that adds an ID token, a signed JWT stating who the user is, which is what "Sign in with Google" actually relies on. For machine-to-machine calls with no user, use the client credentials grant: the service authenticates with its own client id and secret and receives a short-lived token.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does TLS give you, and how does a client know it is talking to the real server?</summary><div class="qa-body">TLS gives confidentiality (encryption), integrity (tampering is detected) and server authentication. The server presents a certificate binding its domain name to a public key, signed by a Certificate Authority the client already trusts; the client checks the signature, expiry and hostname before sending anything. Disabling verification (<code>verify=False</code>, <code>curl -k</code>) removes the authentication and allows man-in-the-middle attacks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API works from curl and Postman, but the React app gets a CORS error. Why, and does CORS protect your API?</summary><div class="qa-body">Browsers enforce the same-origin policy and require the API to list the page's origin in <code>Access-Control-Allow-Origin</code>, and for non-simple requests to approve a preflight <code>OPTIONS</code> request including methods and headers like <code>Authorization</code>; curl does not enforce any of this. Fix it by allowing the exact frontend origin, methods and headers. CORS does not protect the API at all: it protects users' browsers from other websites, and non-browser clients ignore it, so authentication and authorization still do the protecting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you protect a login endpoint from brute force and credential stuffing?</summary><div class="qa-body">Count failed attempts per account, per IP and per client in a sliding window stored in Redis, and above a threshold return 429 with <code>Retry-After</code>, checking the limit before the password so even a correct guess is refused while locked. Use a slow password hash, identical error messages for unknown user and wrong password, and add MFA, breached-password checks and alerts. For general API traffic, token-bucket or sliding-window limits per API key do the same job.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Spot the bug: <code>GET /orders/{id}</code> verifies the JWT and then returns <code>db.get(Order, id)</code>.</summary><div class="qa-body">That is BOLA (IDOR), the number one OWASP API risk: any logged-in user can read any order by changing the id. Fix it with an ownership filter, such as <code>WHERE id = :id AND customer_id = :current_user</code>, returning 404 when it does not match, ideally enforced in the data-access layer so no endpoint can forget it. Random UUIDs make guessing harder but are not a fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is mass assignment and how do you prevent it?</summary><div class="qa-body">Mass assignment is when an endpoint copies every field from the request body onto a stored object, so a client can set fields it should not control, such as <code>total</code>, <code>status</code> or <code>is_admin</code>. Prevent it with explicit input schemas (for example a Pydantic model per endpoint) that list only the fields the caller may change, and separate output schemas so internal fields are never returned.</div></details>
</main>
`
});
