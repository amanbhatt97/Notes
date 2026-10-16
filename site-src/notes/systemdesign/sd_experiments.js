// notes/systemdesign/sd_experiments.js — Shadow, Canary & A/B Infrastructure
Object.assign(TOPIC_CONTENT, {
  "sd_experiments": `<main>
  <h1>Shadow, Canary &amp; A/B Infrastructure</h1>
  <p class="lead">How a new model goes from "better offline" to "proven online" without hurting users: shadow, canary, blue-green, A/B tests, interleaving and bandits, plus the plumbing that makes the numbers trustworthy. Builds on your A/B testing stats notes.</p>

  <h2 id="se-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Online Evaluation &amp; Safe Rollout</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Offline vs online gap</div>
        <ul>
          <li><b>Offline</b> — historical data, cheap, fast; can't see user reaction</li>
          <li><b>Why gap</b> — logging bias, skew, proxy metric ≠ goal, latency, novelty</li>
          <li><b>Rule</b> — offline picks candidates; only online proves impact</li>
          <li><b>Ladder</b> — offline → shadow → canary → A/B → ramp → 100%</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shadow deployment</div>
        <ul>
          <li><b>What</b> — copy live traffic to new model; responses discarded</li>
          <li><b>Checks</b> — latency, errors, output distribution, agreement with prod</li>
          <li><b>Cost</b> — double compute; no user-impact measurement</li>
          <li>⚠ <b>Trap</b> — shadow must not cause side effects (emails, writes)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Canary &amp; blue-green</div>
        <ul>
          <li><b>Canary</b> — 1–5% traffic to new version; widen if healthy</li>
          <li><b>Blue-green</b> — two full environments; flip router; instant rollback</li>
          <li><b>Canary ≠ A/B</b> — canary checks safety, A/B measures effect</li>
          <li>💡 canary = the bird in the coal mine: small exposure warns early</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">A/B infrastructure</div>
        <ul>
          <li><b>Assignment</b> — <code>hash(exp + ":" + user_id) % 1000</code> → bucket → variant</li>
          <li><b>Deterministic</b> — same user, same variant; no lookup table</li>
          <li><b>Salt per experiment</b> — independent splits across experiments</li>
          <li><b>Exposure logging</b> — log when the user actually saw the variant</li>
          <li><b>Metric pipeline</b> — join exposures + events → per-user metrics → CI</li>
          <li>⚠ <b>SRM</b> — sample ratio mismatch (e.g. 52/48 at 50/50) = broken assignment/logging</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interleaving (ranking)</div>
        <ul>
          <li><b>What</b> — merge two rankers' lists for the same user; credit clicks</li>
          <li><b>Team-draft</b> — coin flip per round; each team adds its best unshown item</li>
          <li><b>Why</b> — 10–100× fewer users than A/B to detect a preference</li>
          <li><b>Limit</b> — says which ranks better, not revenue impact; follow with A/B</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bandits</div>
        <ul>
          <li><b>What</b> — shift traffic to the winning arm while testing</li>
          <li><b>Algos</b> — ε-greedy, UCB, Thompson sampling</li>
          <li><b>Use</b> — many short-lived arms (headlines, creatives), cost of regret high</li>
          <li><b>Not for</b> — long-term effects or clean causal estimates; use A/B</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Guardrails &amp; rollback</div>
        <ul>
          <li><b>Guardrails</b> — latency, errors, revenue, unsubscribes, complaints</li>
          <li><b>Auto-rollback</b> — guardrail breach → route back to old model</li>
          <li><b>Keep</b> — old model warm, versioned, one config flag away</li>
          <li>⚠ <b>Trap</b> — peeking daily and stopping at first p &lt; 0.05 inflates false positives</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="se-gap"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Offline vs Online</span><span class="rm-sub">Why offline wins lie</span></div></div>
      <div class="rm-item rm-done" data-target="se-shadow"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Shadow Deployment</span><span class="rm-sub">Real traffic, zero risk</span></div></div>
      <div class="rm-item rm-done" data-target="se-canary"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Canary &amp; Blue-Green</span><span class="rm-sub">Limit the blast radius</span></div></div>
      <div class="rm-item rm-done" data-target="se-ab"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">A/B Infrastructure</span><span class="rm-sub">Assign, log, measure</span></div></div>
      <div class="rm-item rm-done" data-target="se-hash"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Hash Bucketing</span><span class="rm-sub">Deterministic assignment</span></div></div>
      <div class="rm-item rm-done" data-target="se-inter"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Interleaving</span><span class="rm-sub">Faster ranking tests</span></div></div>
      <div class="rm-item rm-done" data-target="se-bandit"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Bandits</span><span class="rm-sub">Learn while serving</span></div></div>
      <div class="rm-item rm-done" data-target="se-guard"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Guardrails &amp; Rollback</span><span class="rm-sub">Fail safe</span></div></div>
      <div class="rm-item rm-done" data-target="se-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="se-gap"><span class="num">01</span>Offline vs Online</h2>
  <figure class="viz"><svg viewBox="0 0 720 172" width="720" role="img"><defs><marker id="se-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="12" y="128" width="126" height="12" rx="3" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="75" y="158" text-anchor="middle" font-weight="600">Offline eval</text><text x="75" y="106" text-anchor="middle" class="tm">0% users</text><rect x="154" y="110" width="126" height="30" rx="3" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="217" y="158" text-anchor="middle" font-weight="600">Shadow</text><text x="217" y="88" text-anchor="middle" class="tm">0% served</text><text x="217" y="101" text-anchor="middle" class="tm">100% mirrored</text><rect x="296" y="90" width="126" height="50" rx="3" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="359" y="158" text-anchor="middle" font-weight="600">Canary</text><text x="359" y="68" text-anchor="middle" class="tm">1-5%</text><rect x="438" y="60" width="126" height="80" rx="3" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="501" y="158" text-anchor="middle" font-weight="600">A/B test</text><text x="501" y="38" text-anchor="middle" class="tm">10-50%</text><rect x="580" y="20" width="126" height="120" rx="3" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="643" y="158" text-anchor="middle" font-weight="600">Ramp</text><text x="643" y="-2" text-anchor="middle" class="tm">25→50→100%</text><path d="M12,140 H710" stroke="currentColor" fill="none" stroke-width="1.4"/></svg><figcaption>Each rung exposes more real users, only after the cheaper, safer rung passed.</figcaption></figure>
  <table class="tbl">
    <tr><th>Why offline ≠ online</th><th>Example</th></tr>
    <tr><td>Logging bias</td><td>Test set only has items the old model showed</td></tr>
    <tr><td>Proxy metric</td><td>NDCG up, but users buy less</td></tr>
    <tr><td>Skew / latency</td><td>Features differ live; +40 ms costs engagement</td></tr>
    <tr><td>User reaction</td><td>Novelty effect, changed behaviour, feedback loops</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A flight simulator vs a real flight. The simulator (offline) filters bad pilots cheaply; only real flights (online) with an instructor (guardrails) prove readiness.</p>
  </div>

  <h2 id="se-shadow"><span class="num">02</span>Shadow Deployment</h2>
  <figure class="viz"><svg viewBox="0 0 720 160" width="720" role="img"><defs><marker id="se-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="50" width="110" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="65" y="76" text-anchor="middle" font-weight="600">Request</text><rect x="160" y="50" width="110" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="215" y="76" text-anchor="middle" font-weight="600">Router</text><rect x="320" y="10" width="160" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="400" y="36" text-anchor="middle" font-weight="600">Prod model v1</text><rect x="320" y="100" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="400" y="126" text-anchor="middle" font-weight="600">Shadow v2</text><rect x="540" y="10" width="170" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="625" y="36" text-anchor="middle" font-weight="600">Response to user</text><rect x="540" y="100" width="170" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="625" y="119" text-anchor="middle" font-weight="600">Log only</text><text x="625" y="133" text-anchor="middle" class="tm">compare later</text><line x1="122" y1="72" x2="157" y2="72" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="272" y1="66" x2="318" y2="34" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="272" y1="80" x2="318" y2="120" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#se-m2)"/><line x1="482" y1="32" x2="537" y2="32" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="482" y1="122" x2="537" y2="122" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><text x="250" y="128" text-anchor="middle" class="tm">copy</text></svg><figcaption>Shadow gets real traffic but its answers are thrown away: zero user risk, real latency and output checks.</figcaption></figure>
  <ul>
    <li><strong>Proves</strong>: it runs at production load, within latency, with sane outputs.</li>
    <li><strong>Compare</strong>: agreement rate with prod, score distributions, slices where they disagree.</li>
    <li><strong>Can't prove</strong>: user impact, because users never see it.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shadow calls with side effects: sending notifications, writing to the DB, or calling paid APIs twice. Mirror read-only.</p>
  </div>

  <h2 id="se-canary"><span class="num">03</span>Canary &amp; Blue-Green</h2>
  <figure class="viz"><svg viewBox="0 0 720 160" width="720" role="img"><defs><marker id="se-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="170" y="16" text-anchor="middle" font-weight="600">Canary: split traffic</text><rect x="10" y="52" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="60" y="71" text-anchor="middle" font-weight="600">Load</text><text x="60" y="85" text-anchor="middle" class="tm">balancer</text><rect x="170" y="26" width="150" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="245" y="50" text-anchor="middle" font-weight="600">v1  95%</text><rect x="170" y="92" width="150" height="40" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="245" y="116" text-anchor="middle" font-weight="600">v2   5%</text><line x1="112" y1="68" x2="168" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="112" y1="80" x2="168" y2="112" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><text x="540" y="16" text-anchor="middle" font-weight="600">Blue-green: switch all at once</text><rect x="380" y="52" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="430" y="78" text-anchor="middle" font-weight="600">Router</text><rect x="560" y="26" width="150" height="40" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="635" y="50" text-anchor="middle" font-weight="600">Blue v1  live</text><rect x="560" y="92" width="150" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="635" y="116" text-anchor="middle" font-weight="600">Green v2  idle</text><line x1="482" y1="68" x2="558" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="482" y1="80" x2="558" y2="112" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#se-m3)"/><text x="545" y="152" text-anchor="middle" class="tm">flip pointer → instant swap / rollback</text></svg><figcaption>Canary limits blast radius by %, blue-green by having a warm copy to flip back to.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Canary</th><th>Blue-green</th><th>A/B test</th></tr>
    <tr><td>Goal</td><td>Catch breakage early</td><td>Zero-downtime swap</td><td>Measure causal effect</td></tr>
    <tr><td>Traffic</td><td>1–5%, then widen</td><td>0% → 100% at once</td><td>Fixed split for weeks</td></tr>
    <tr><td>Decided by</td><td>Errors, latency, guardrails</td><td>Smoke tests</td><td>Statistical test on primary metric</td></tr>
    <tr><td>Rollback</td><td>Shrink to 0%</td><td>Flip back</td><td>End experiment</td></tr>
  </table>

  <h2 id="se-ab"><span class="num">04</span>A/B Infrastructure</h2>
  <figure class="viz"><svg viewBox="0 0 730 186" width="730" role="img"><defs><marker id="se-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="8" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="25" text-anchor="middle" font-weight="600">Experiment</text><text x="85" y="39" text-anchor="middle" class="tm">config</text><rect x="10" y="80" width="150" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="106" text-anchor="middle" font-weight="600">User request</text><rect x="200" y="80" width="150" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="275" y="99" text-anchor="middle" font-weight="600">Assignment</text><text x="275" y="113" text-anchor="middle" class="tm">hash(user,exp)</text><rect x="390" y="80" width="150" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="99" text-anchor="middle" font-weight="600">App serves</text><text x="465" y="113" text-anchor="middle" class="tm">variant</text><rect x="580" y="80" width="140" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="650" y="99" text-anchor="middle" font-weight="600">Exposure +</text><text x="650" y="113" text-anchor="middle" class="tm">event logs</text><rect x="390" y="140" width="150" height="40" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="164" text-anchor="middle" font-weight="600">Metric pipeline</text><rect x="200" y="140" width="150" height="40" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="275" y="164" text-anchor="middle" font-weight="600">Stats + guardrails</text><rect x="10" y="140" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="164" text-anchor="middle" font-weight="600">Decision</text><line x1="162" y1="102" x2="197" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="352" y1="102" x2="387" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="542" y1="102" x2="577" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="162" y1="30" x2="240" y2="77" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><path d="M650,126 V160 H543" stroke="currentColor" fill="none" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="388" y1="160" x2="353" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="198" y1="160" x2="163" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/></svg><figcaption>Assignment must be deterministic, and every exposure must be logged, or the analysis is biased.</figcaption></figure>
  <div class="cards">
    <div><b>Assignment service</b><p>Config + hash → variant. Fast, stateless, same answer everywhere.</p><small>Optimizely, Statsig, in-house</small></div>
    <div><b>Exposure logs</b><p>Who saw which variant, when.</p><small>Analyse only exposed users</small></div>
    <div><b>Metric pipeline</b><p>Join exposures to events, per-user aggregates.</p><small>Daily batch in the warehouse</small></div>
    <div><b>Stats engine</b><p>CIs, CUPED variance reduction, SRM check, guardrails.</p><small>Auto report per experiment</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sample ratio mismatch (SRM): a 50/50 test shows 50.8% vs 49.2% on 1M users. A chi-square test says it isn't chance; results are untrustworthy until fixed.</p>
  </div>
  <div class="callout intu"><span class="label">Unit of randomisation</span>
    <p>Randomise by user, not request, so one person doesn't see both rankers. For marketplaces with spillover (drivers, sellers), randomise by region or time.</p>
  </div>

  <h2 id="se-hash"><span class="num">05</span>Hash Bucketing</h2>
  <div class="fx" data-lang="py">import hashlib
from collections import Counter

def bucket(user_id: str, experiment: str, n_buckets: int = 1000) -&gt; int:
    # salt with the experiment name -&gt; each experiment gets an independent split
    key = f"{experiment}:{user_id}".encode()
    return int(hashlib.md5(key).hexdigest()[:8], 16) % n_buckets

def assign(user_id, experiment, treatment_pct=10):
    return "treatment" if bucket(user_id, experiment) &lt; treatment_pct * 10 else "control"

for u in ["user_1", "user_2", "user_3"]:
    print(u, assign(u, "new_ranker"), assign(u, "new_ranker"), assign(u, "price_test"))

users = [f"user_{i}" for i in range(100_000)]
print(Counter(assign(u, "new_ranker") for u in users))</div>
  <div class="fx" data-lang="text">user_1 control control control
user_2 treatment treatment control
user_3 control control control
Counter({'control': 89993, 'treatment': 10007})</div>
  <ul>
    <li>Same user → same variant on every call, every server, with no stored table.</li>
    <li>Salting with the experiment name makes <code>user_2</code> treatment in one test, control in another: tests don't correlate.</li>
    <li>1,000 buckets allow 0.1% steps when ramping 1% → 5% → 50%.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using <code>user_id % 2</code>: every experiment gets the same split, and sequential IDs can correlate with signup date.</p>
  </div>

  <h2 id="se-inter"><span class="num">06</span>Interleaving</h2>
  <div class="flow"><span>Ranker A list</span><span>Ranker B list</span><span>Team-draft merge</span><span>One list shown</span><span>Credit clicks to A or B</span></div>
  <div class="fx" data-lang="py">import random

def team_draft(a, b, k, seed):
    rng, shown, team = random.Random(seed), [], {}
    while len(shown) &lt; k:
        order = ["A", "B"] if rng.random() &lt; 0.5 else ["B", "A"]  # coin flip per round
        for t in order:
            ranking = a if t == "A" else b
            pick = next(d for d in ranking if d not in team)   # its best unshown item
            shown.append(pick); team[pick] = t
            if len(shown) == k: break
    return shown, team

ranker_a = ["d1", "d2", "d3", "d4", "d5"]
ranker_b = ["d3", "d1", "d6", "d7", "d2"]
shown, team = team_draft(ranker_a, ranker_b, k=4, seed=7)
print("shown :", [f"{d}({team[d]})" for d in shown])
clicks = ["d3", "d6"]
print("clicks credited to:", [team[d] for d in clicks])</div>
  <div class="fx" data-lang="text">shown : ['d1(A)', 'd3(B)', 'd2(A)', 'd6(B)']
clicks credited to: ['B', 'B']</div>
  <p>Each user compares both rankers directly, so user-to-user noise cancels. B wins this session 2–0.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Interleaving tells you which ranker users prefer, not the revenue lift. Use it to screen many rankers, then A/B the winner.</p>
  </div>

  <h2 id="se-bandit"><span class="num">07</span>Bandits</h2>
  <table class="tbl">
    <tr><th></th><th>A/B test</th><th>Multi-armed bandit</th></tr>
    <tr><td>Traffic</td><td>Fixed split</td><td>Shifts toward the winner</td></tr>
    <tr><td>Goal</td><td>Clean causal estimate</td><td>Maximise reward while learning</td></tr>
    <tr><td>Regret (lost value)</td><td>Higher</td><td>Lower</td></tr>
    <tr><td>Best for</td><td>Launch decisions, long-term metrics</td><td>Headlines, creatives, short-lived options</td></tr>
  </table>
  <p>Common algorithms: ε-greedy (explore ε% at random), UCB (optimism under uncertainty), Thompson sampling (sample from each arm's posterior).</p>

  <h2 id="se-guard"><span class="num">08</span>Guardrails &amp; Rollback</h2>
  <div class="cards">
    <div><b>System</b><p>p99 latency, error and timeout rate</p></div>
    <div><b>Business</b><p>Revenue per user, orders, ad load</p></div>
    <div><b>Trust</b><p>Complaints, unsubscribes, policy violations</p></div>
    <div><b>Data quality</b><p>SRM, missing exposure logs</p></div>
  </div>
  <div class="flow"><span>Guardrail breach</span><span>Alert</span><span>Flag flips traffic to old model</span><span>Investigate</span><span>Fix &amp; re-ramp</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Rollback that needs a redeploy. Keep the previous model loaded and switchable by config, and roll back the feature pipeline version with it.</p>
  </div>

  <h2 id="se-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Shadow vs canary: what does each prove?</summary><div class="qa-body">Shadow proves the model runs correctly on real traffic (latency, errors, output sanity) with zero user exposure. Canary proves it is safe with a small share of real users. Neither measures the causal business effect; that's the A/B test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a deterministic assignment function.</summary><div class="qa-body"><code>bucket = int(md5(f"{exp}:{user_id}").hexdigest()[:8], 16) % 1000</code>; treatment if <code>bucket &lt; pct*10</code>. Stable per user, salted per experiment, uniform, no storage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why salt the hash with the experiment name?</summary><div class="qa-body">Without it, every experiment puts the same users in treatment. Effects of overlapping tests become confounded, and the same users carry all the risk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your 50/50 test shows 1,008,000 vs 992,000 users. Proceed?</summary><div class="qa-body">No. A chi-square test gives p ≈ 10<sup>-29</sup>: sample ratio mismatch. Look for bugs in assignment, bot filtering, exposure logging, or a variant that crashes before logging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use interleaving instead of A/B?</summary><div class="qa-body">For comparing ranking models in search/recs when you have many candidates and limited traffic. It needs far fewer users because each user sees both. Confirm the winner with an A/B test on business metrics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bandit or A/B for choosing among 20 email subject lines for one campaign?</summary><div class="qa-body">Bandit. The options are short-lived, many, and the goal is maximising opens now, not a precise effect size. Thompson sampling shifts traffic to the best lines quickly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What guardrails would you set for a new feed ranker?</summary><div class="qa-body">p99 latency and error rate; revenue per user; session length or retention; content diversity / creator coverage; complaint and hide rates. Breach of any → auto-rollback, even if the primary metric is up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why randomise by user rather than by request?</summary><div class="qa-body">Request-level randomisation shows one user both variants: inconsistent experience, contamination (learning from A affects B), and non-independent samples that break the variance estimate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Treatment is +3% on day 2 and +0.5% on day 14. What happened?</summary><div class="qa-body">Likely a novelty effect: users explore the change, then return to habits. Run tests for full weekly cycles, look at the effect over time, and compare new vs returning users.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Blue-green vs canary for a model with a new feature pipeline?</summary><div class="qa-body">Canary first: limited users, gradual widening, compare live metrics. Blue-green is a fast swap with fast rollback but exposes 100% at once, so it suits low-risk or already-validated changes.</div></details>
</main>`
});
