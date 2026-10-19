// notes/systemdesign/sd_experiments.js — Shadow, Canary & A/B Infrastructure
Object.assign(TOPIC_CONTENT, {
  "sd_experiments": `<main>
  <h1>Shadow, Canary &amp; A/B Infrastructure</h1>
  <p class="lead">Your new model beat the old one on last month's data. Should you switch everyone to it tomorrow? No. This note shows the ladder a model climbs before it reaches all users: shadow, canary, blue-green, A/B tests, interleaving and bandits, plus the plumbing (hashing, logging, sample sizes, guardrails) that makes the numbers trustworthy. Every number is worked out. Builds on <a class="xref" data-note="st_abtesting">A/B Testing</a> and <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>.</p>

  <h2 id="se-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Online Evaluation &amp; Safe Rollout</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Offline vs online gap</div>
        <ul>
          <li><b>Offline</b> — score on old logged data; cheap, fast, no user risk; can't see reactions</li>
          <li><b>Why gap</b> — logging bias, proxy metric ≠ goal, skew, latency, novelty, feedback loops</li>
          <li><b>Rule</b> — offline picks candidates; only online proves impact</li>
          <li><b>Ladder</b> — offline → shadow → canary → A/B → ramp → 100%</li>
          <li>💡 Driving test: practice ground first, then quiet roads with an instructor, then traffic</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shadow deployment</div>
        <ul>
          <li><b>What</b> — copy live requests to the new model; its answers are logged, never shown</li>
          <li><b>Checks</b> — p99 latency, errors, score distribution, decision agreement with prod</li>
          <li><b>Read</b> — 96% agreement can still hide a 2.7× jump in block rate: compare rates by slice</li>
          <li><b>Cost</b> — double compute; can't measure user impact</li>
          <li>⚠ <b>Trap</b> — side effects (emails, DB writes, paid APIs) must be off in shadow</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Canary &amp; blue-green</div>
        <ul>
          <li><b>Canary</b> — 1–5% of traffic to v2; widen 5 → 25 → 50 → 100 if healthy</li>
          <li><b>Numbers</b> — 2,000 rps × 5% × 10 min = 60,000 requests; baseline 0.1% errors = 60 expected</li>
          <li><b>Auto check</b> — binomial test: 90 errors → p = 0.0002 → roll back; 70 → keep going</li>
          <li><b>Blue-green</b> — two full copies; flip the router; instant swap and rollback</li>
          <li><b>Canary ≠ A/B</b> — canary checks safety, A/B measures the effect</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">A/B infrastructure</div>
        <ul>
          <li><b>Pieces</b> — config → assignment → serve variant → exposure + event logs → metric pipeline → stats → decision</li>
          <li><b>Exposure</b> — log the moment a user actually saw the variant; analyse only exposed users</li>
          <li><b>Unit</b> — randomise by user, not request; by region/time when users affect each other</li>
          <li><b>Sample size</b> — n = (z<sub>α/2</sub>+z<sub>β</sub>)²·[p₁(1−p₁)+p₂(1−p₂)] / (p₂−p₁)²</li>
          <li><b>Worked</b> — 5% base, +2% relative lift → 752,700 per arm → 8 days at 50% of 400k/day</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hash bucketing</div>
        <ul>
          <li><b>Formula</b> — <code>md5(exp + ":" + user_id) % 1000</code> → bucket → variant</li>
          <li><b>Deterministic</b> — same user, same answer, any server, no lookup table</li>
          <li><b>Salt</b> — experiment name in the key → independent splits across tests</li>
          <li><b>Ramp</b> — 10% → 20% keeps all old treated users treated (buckets 0–99 ⊂ 0–199)</li>
          <li>⚠ <code>user_id % 2</code> — same split for every test, tied to signup order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Trusting the numbers</div>
        <ul>
          <li><b>SRM</b> — sample ratio mismatch; chi-square on user counts vs planned split</li>
          <li><b>Worked</b> — 1,008,000 vs 992,000 at 50/50 → χ² = 128, p ≈ 10<sup>−29</sup> → stop, find the bug</li>
          <li><b>Peeking</b> — checking daily and stopping at first p &lt; 0.05: 23% false positives instead of 5%</li>
          <li><b>Fix</b> — fix duration in advance, or use sequential tests built for peeking</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interleaving &amp; bandits</div>
        <ul>
          <li><b>Interleaving</b> — team-draft merge of two rankers into one list; credit clicks to the team</li>
          <li><b>Why</b> — each user compares both, so 10–100× fewer users; 560 vs 440 wins → p = 0.0002</li>
          <li><b>Limit</b> — tells preference, not revenue; follow with A/B</li>
          <li><b>Bandit</b> — shift traffic to the winner while testing (ε-greedy, UCB, Thompson)</li>
          <li><b>Worked</b> — 30k users, 3 headlines: regret 378 clicks (A/B) vs 30 (Thompson)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Guardrails &amp; rollback</div>
        <ul>
          <li><b>Guardrails</b> — latency, errors, revenue, unsubscribes, complaints, SRM</li>
          <li><b>Auto-rollback</b> — breach → flag routes traffic back to old model</li>
          <li><b>Keep</b> — old model warm, versioned, with its feature pipeline, one flag away</li>
          <li>⚠ <b>Trap</b> — rollback that needs a redeploy is too slow</li>
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
      <div class="rm-item rm-done" data-target="se-ab"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">A/B Infrastructure</span><span class="rm-sub">Assign, log, measure, size</span></div></div>
      <div class="rm-item rm-done" data-target="se-hash"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Hash Bucketing</span><span class="rm-sub">Deterministic assignment</span></div></div>
      <div class="rm-item rm-done" data-target="se-trust"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Trusting the Numbers</span><span class="rm-sub">SRM and peeking</span></div></div>
      <div class="rm-item rm-done" data-target="se-inter"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Interleaving</span><span class="rm-sub">Faster ranking tests</span></div></div>
      <div class="rm-item rm-done" data-target="se-bandit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Bandits</span><span class="rm-sub">Learn while serving</span></div></div>
      <div class="rm-item rm-done" data-target="se-guard"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Guardrails &amp; Rollback</span><span class="rm-sub">Fail safe</span></div></div>
      <div class="rm-item rm-done" data-target="se-mistakes"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What breaks experiments</span></div></div>
      <div class="rm-item rm-done" data-target="se-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="se-gap"><span class="num">01</span>Offline vs Online</h2>
  <p>You trained a new ranking model for a shopping app. On last month's data it scores better than the current model on every offline metric. Your manager asks: "Can we switch everyone to it on Monday?"</p>
  <p>The honest answer is "not yet". <strong>Offline evaluation</strong> means scoring the model on data that was already logged in the past. It is cheap, fast and nobody gets hurt. But it can only replay what already happened. It cannot show how real people will react to <em>new</em> results. <strong>Online evaluation</strong> means letting real users see the model and measuring what they do. That is the only proof, but it carries risk: a bad model now costs real orders.</p>
  <p>Why can an offline win turn into an online loss? Four common reasons:</p>
  <table class="tbl">
    <tr><th>Why offline ≠ online</th><th>Plain meaning</th><th>Example</th></tr>
    <tr><td>Logging bias</td><td>Old data only contains what the old model chose to show</td><td>Your test set has no clicks on items the old model never displayed, so a model that surfaces new items looks bad offline</td></tr>
    <tr><td>Proxy metric</td><td>The offline number is a stand-in for the real goal</td><td>NDCG (a ranking score) goes up, but users buy less</td></tr>
    <tr><td>Skew and latency</td><td>Live features or speed differ from training</td><td>A live feature arrives late; the model adds 40 ms and people leave</td></tr>
    <tr><td>User reaction</td><td>People change behaviour when the product changes</td><td>Novelty effect: clicks jump for a week, then fall back</td></tr>
  </table>
  <p>So teams use a <strong>rollout ladder</strong>. Each rung exposes more real users, and you only climb after the cheaper, safer rung passed.</p>
  <figure class="viz"><svg viewBox="0 0 720 172" width="720" role="img"><defs><marker id="se-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="12" y="128" width="126" height="12" rx="3" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="75" y="158" text-anchor="middle" font-weight="600">Offline eval</text><text x="75" y="118" text-anchor="middle" class="tm">0% users</text><rect x="154" y="110" width="126" height="30" rx="3" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="217" y="158" text-anchor="middle" font-weight="600">Shadow</text><text x="217" y="86" text-anchor="middle" class="tm">0% served</text><text x="217" y="100" text-anchor="middle" class="tm">100% mirrored</text><rect x="296" y="90" width="126" height="50" rx="3" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="359" y="158" text-anchor="middle" font-weight="600">Canary</text><text x="359" y="80" text-anchor="middle" class="tm">1-5%</text><rect x="438" y="60" width="126" height="80" rx="3" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="501" y="158" text-anchor="middle" font-weight="600">A/B test</text><text x="501" y="50" text-anchor="middle" class="tm">10-50%</text><rect x="580" y="24" width="126" height="116" rx="3" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="643" y="158" text-anchor="middle" font-weight="600">Ramp</text><text x="643" y="16" text-anchor="middle" class="tm">25→50→100%</text><path d="M12,140 H710" stroke="currentColor" fill="none" stroke-width="1.4"/></svg><figcaption>Each rung exposes more real users, only after the cheaper, safer rung passed.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Getting a driving licence in India. First you practise on an empty ground (offline). Then you sit beside your instructor while he drives and you watch (shadow). Then you drive on a quiet colony road with the instructor's brake under his foot (canary). Only after that do you take the RTO test on a real road (A/B), and only then drive alone in Bengaluru traffic (100%).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Online evaluation</strong>: measuring a model on live users. <strong>Rollout</strong>: the controlled process of moving traffic from the old model (the <strong>champion</strong>) to the new one (the <strong>challenger</strong>).</p>
  </div>
  <p><strong>Why it matters.</strong> Every ML system design interview ends with "how would you launch it?". The expected answer is this ladder, with what each rung checks. In real jobs, skipping rungs is how a model that looked great in a notebook takes down checkout on a Friday.</p>

  <h2 id="se-shadow"><span class="num">02</span>Shadow Deployment</h2>
  <p>The first worry with any new model is simple: <em>will it even run</em> on real traffic? Real requests have missing fields, odd values and spikes at 8 pm. A model that was fine on a clean test file can time out, crash, or output nonsense on these.</p>
  <p>The idea of <strong>shadow deployment</strong>: send a copy of every live request to the new model too. The old model still answers the user. The new model's answer is written to a log and thrown away. Users never see it, so there is zero user risk. But you get the new model's real latency, real errors and real outputs on real inputs.</p>
  <figure class="viz"><svg viewBox="0 0 720 160" width="720" role="img"><defs><marker id="se-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="50" width="110" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="65" y="76" text-anchor="middle" font-weight="600">Request</text><rect x="160" y="50" width="110" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="215" y="76" text-anchor="middle" font-weight="600">Router</text><rect x="320" y="10" width="160" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="400" y="36" text-anchor="middle" font-weight="600">Prod model v1</text><rect x="320" y="100" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="400" y="126" text-anchor="middle" font-weight="600">Shadow v2</text><rect x="540" y="10" width="170" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="625" y="36" text-anchor="middle" font-weight="600">Response to user</text><rect x="540" y="100" width="170" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="625" y="119" text-anchor="middle" font-weight="600">Log only</text><text x="625" y="133" text-anchor="middle" class="tm">compare later</text><line x1="122" y1="72" x2="157" y2="72" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="272" y1="66" x2="318" y2="34" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="272" y1="80" x2="318" y2="120" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#se-m2)"/><line x1="482" y1="32" x2="537" y2="32" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="482" y1="122" x2="537" y2="122" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><text x="250" y="128" text-anchor="middle" class="tm">copy</text></svg><figcaption>Shadow gets real traffic but its answers are thrown away: zero user risk, real latency and output checks.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new cashier at a kirana shop on day one. The owner bills every customer as usual. The new cashier also writes a bill for the same customer on a notepad, which nobody receives. In the evening the owner compares the two piles. Any mismatch is caught before the new cashier ever touches a real customer's money.</p>
  </div>
  <p><strong>Worked example.</strong> A fraud model blocks a payment when its score is above 0.5. We shadow a new version on 10,000 requests. The code below fakes the two models' scores, plants a bug (300 requests where the new model always outputs 0.99), and prints the four checks a shadow report usually shows.</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(0)
n = 10_000
prod = rng.beta(2, 8, n)                        # scores from the live model
shadow = np.clip(prod + rng.normal(0, 0.05, n), 0, 1)
shadow[:300] = 0.99                             # a bug: one slice gets max score

t = 0.5                                         # block above 0.5
agree = np.mean((prod &gt; t) == (shadow &gt; t))
print(f"decision agreement: {agree:.1%}")
print(f"block rate  prod={np.mean(prod &gt; t):.1%}  shadow={np.mean(shadow &gt; t):.1%}")
print(f"p99 score   prod={np.quantile(prod, .99):.2f}  shadow={np.quantile(shadow, .99):.2f}")
lat_prod = rng.gamma(4, 5, n); lat_shadow = rng.gamma(4, 9, n)
print(f"p99 latency prod={np.quantile(lat_prod, .99):.0f} ms  shadow={np.quantile(lat_shadow, .99):.0f} ms")</div>
  <div class="fx" data-lang="text">decision agreement: 95.8%
block rate  prod=1.9%  shadow=5.2%
p99 score   prod=0.54  shadow=0.99
p99 latency prod=50 ms  shadow=91 ms</div>
  <p>Read the output top to bottom. <code>agree</code> says the two models make the same decision 95.8% of the time, which <em>sounds</em> fine. But the <code>block rate</code> line shows the new model would block 5.2% of payments instead of 1.9%, about 2.7 times as many angry customers. The <code>p99 score</code> line (the score that 99% of requests stay below) jumps to 0.99, pointing straight at the bug. And the latency line shows the new model's slowest 1% of calls take 91 ms against 50 ms. Any one of these stops the rollout.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shadow deployment</strong> (also "dark launch" or "shadow mode"): mirroring live traffic to a candidate model whose outputs are logged but not served. <strong>p99 latency</strong>: the response time that 99% of requests beat.</p>
  </div>
  <ul>
    <li><strong>Proves</strong>: it runs at production load, within latency, with sane outputs.</li>
    <li><strong>Compare</strong>: agreement rate, score distributions, decision rates by slice (country, device, new users).</li>
    <li><strong>Cost</strong>: you pay for double the compute while the shadow runs.</li>
    <li><strong>Can't prove</strong>: user impact, because users never see it.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shadow calls with side effects: sending an SMS, writing to the orders table, or calling a paid API twice. The shadow path must be read-only, or "zero risk" becomes double-charged customers.</p>
  </div>

  <h2 id="se-canary"><span class="num">03</span>Canary &amp; Blue-Green</h2>
  <p>Shadow passed. Now real users must see the new model's answers. If it is broken in a way shadow did not catch, how many users get hurt? We want that number small. Two patterns limit the damage, which engineers call the <strong>blast radius</strong>.</p>
  <p><strong>Canary</strong>: send a small share of traffic, say 5%, to the new version (v2) and 95% to the old one (v1). Watch errors and latency. If healthy, widen to 25%, 50%, 100%. If not, shrink back to 0%. <strong>Blue-green</strong>: keep two full copies of the service. "Blue" serves everyone; "green" has the new version, warmed up and idle. Flip the router and all traffic moves at once. Flip back to roll back instantly.</p>
  <figure class="viz"><svg viewBox="0 0 720 160" width="720" role="img"><defs><marker id="se-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="170" y="16" text-anchor="middle" font-weight="600">Canary: split traffic</text><rect x="10" y="52" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="60" y="71" text-anchor="middle" font-weight="600">Load</text><text x="60" y="85" text-anchor="middle" class="tm">balancer</text><rect x="170" y="26" width="150" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="245" y="50" text-anchor="middle" font-weight="600">v1  95%</text><rect x="170" y="92" width="150" height="40" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="245" y="116" text-anchor="middle" font-weight="600">v2   5%</text><line x1="112" y1="68" x2="168" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="112" y1="80" x2="168" y2="112" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><text x="540" y="16" text-anchor="middle" font-weight="600">Blue-green: switch all at once</text><rect x="380" y="52" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="430" y="78" text-anchor="middle" font-weight="600">Router</text><rect x="560" y="26" width="150" height="40" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="635" y="50" text-anchor="middle" font-weight="600">Blue v1  live</text><rect x="560" y="92" width="150" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="635" y="116" text-anchor="middle" font-weight="600">Green v2  idle</text><line x1="482" y1="68" x2="558" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="482" y1="80" x2="558" y2="112" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#se-m3)"/><text x="545" y="152" text-anchor="middle" class="tm">flip pointer → instant swap / rollback</text></svg><figcaption>Canary limits blast radius by %, blue-green by having a warm copy to flip back to.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Canary: miners once carried a canary bird into coal mines. Bad gas hurt the small bird first, warning the miners in time. Blue-green: a wedding caterer keeps a second full kitchen ready. If the first kitchen's gas runs out, service switches to the second in a minute.</p>
  </div>
  <p><strong>Worked numbers: how long must a canary run?</strong> Long enough that a real problem shows up as more than noise. Our service gets 2,000 requests per second. The old version fails 0.1% of requests.</p>
  <ol>
    <li>Requests to the canary in 10 minutes = 2,000 × 0.05 × 60 × 10 = <strong>60,000</strong>.</li>
    <li>Errors expected if v2 is as good as v1 = 60,000 × 0.001 = <strong>60</strong>.</li>
    <li>Question: if we see 70, or 90, is that bad luck or a real problem? A <strong>binomial test</strong> answers it: "if the true error rate were still 0.1%, how likely is a count this high?"</li>
  </ol>
  <div class="fx" data-lang="py">from scipy.stats import binomtest

total_rps = 2_000          # requests per second on the service
canary_share = 0.05        # 5% go to the new version
minutes = 10
n = int(total_rps * canary_share * 60 * minutes)
base_err = 0.001           # old version fails 0.1% of requests
print("canary requests in", minutes, "min:", n, "| expected errors at baseline:", n * base_err)

for errors in [70, 90, 150]:
    p = binomtest(errors, n, base_err, alternative="greater").pvalue
    verdict = "ROLL BACK" if p &lt; 0.01 else "keep going"
    print(f"errors={errors:&gt;3}  rate={errors/n:.4%}  p={p:.4f}  {verdict}")</div>
  <div class="fx" data-lang="text">canary requests in 10 min: 60000 | expected errors at baseline: 60.0
errors= 70  rate=0.1167%  p=0.1117  keep going
errors= 90  rate=0.1500%  p=0.0002  ROLL BACK
errors=150  rate=0.2500%  p=0.0000  ROLL BACK</div>
  <p><code>binomtest(errors, n, base_err, alternative="greater")</code> gives the chance of seeing at least that many errors if nothing changed. 70 errors happens 11% of the time by luck, so we keep going. 90 errors happens only 0.02% of the time by luck, so the canary controller rolls back. Notice how small the jump is: 0.10% → 0.15%. Only the volume of 60,000 requests makes it visible. With 1% canary for 10 minutes (12,000 requests, 12 expected errors) the same jump would be hard to see. This is why canaries widen in steps and each step runs for a set time.</p>
  <table class="tbl">
    <tr><th></th><th>Canary</th><th>Blue-green</th><th>A/B test</th></tr>
    <tr><td>Goal</td><td>Catch breakage early</td><td>Zero-downtime swap</td><td>Measure causal effect</td></tr>
    <tr><td>Traffic</td><td>1–5%, then widen</td><td>0% → 100% at once</td><td>Fixed split for weeks</td></tr>
    <tr><td>Decided by</td><td>Errors, latency, guardrails</td><td>Smoke tests</td><td>Statistical test on primary metric</td></tr>
    <tr><td>Rollback</td><td>Shrink to 0%</td><td>Flip back</td><td>End experiment</td></tr>
    <tr><td>Cost</td><td>Little extra</td><td>Two full environments</td><td>Weeks of split traffic</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling a canary an A/B test. A canary is too small and too short to measure a 1% change in orders. It answers "is it broken?", not "is it better?".</p>
  </div>

  <h2 id="se-ab"><span class="num">04</span>A/B Infrastructure</h2>
  <p>The canary says v2 is safe. Is it <em>better</em>? Comparing "orders this week with v2" to "orders last week with v1" does not work: this week may have had a sale, a cricket final or a salary day. The fix is an <strong>A/B test</strong>: at the same time, randomly put some users on v1 (control) and some on v2 (treatment). Random assignment makes the two groups alike in every other way, so any difference in orders is caused by the model.</p>
  <p>The statistics are in <a class="xref" data-note="st_abtesting">A/B Testing</a>. Here we care about the <em>machinery</em> that runs hundreds of such tests at once.</p>
  <figure class="viz"><svg viewBox="0 0 730 186" width="730" role="img"><defs><marker id="se-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="8" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="25" text-anchor="middle" font-weight="600">Experiment</text><text x="85" y="39" text-anchor="middle" class="tm">config</text><rect x="10" y="80" width="150" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="106" text-anchor="middle" font-weight="600">User request</text><rect x="200" y="80" width="150" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="275" y="99" text-anchor="middle" font-weight="600">Assignment</text><text x="275" y="113" text-anchor="middle" class="tm">hash(user,exp)</text><rect x="390" y="80" width="150" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="99" text-anchor="middle" font-weight="600">App serves</text><text x="465" y="113" text-anchor="middle" class="tm">variant</text><rect x="580" y="80" width="140" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="650" y="99" text-anchor="middle" font-weight="600">Exposure +</text><text x="650" y="113" text-anchor="middle" class="tm">event logs</text><rect x="390" y="140" width="150" height="40" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="164" text-anchor="middle" font-weight="600">Metric pipeline</text><rect x="200" y="140" width="150" height="40" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="275" y="164" text-anchor="middle" font-weight="600">Stats + guardrails</text><rect x="10" y="140" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="164" text-anchor="middle" font-weight="600">Decision</text><line x1="162" y1="102" x2="197" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="352" y1="102" x2="387" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="542" y1="102" x2="577" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="162" y1="30" x2="240" y2="77" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><path d="M650,126 V160 H543" stroke="currentColor" fill="none" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="388" y1="160" x2="353" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="198" y1="160" x2="163" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/></svg><figcaption>Assignment must be deterministic, and every exposure must be logged, or the analysis is biased.</figcaption></figure>
  <div class="cards">
    <div><b>Assignment service</b><p>Config + hash → variant. Fast, stateless, same answer on every server.</p><small>Optimizely, Statsig, in-house</small></div>
    <div><b>Exposure logs</b><p>Who actually saw which variant, and when.</p><small>Analyse only exposed users</small></div>
    <div><b>Metric pipeline</b><p>Join exposures to events, build per-user totals.</p><small>Daily batch in the warehouse</small></div>
    <div><b>Stats engine</b><p>Confidence intervals, CUPED variance reduction, SRM check, guardrails.</p><small>Auto report per experiment</small></div>
  </div>
  <p>Two terms need care. An <strong>exposure</strong> is logged when the user actually reaches the screen that differs, not when they open the app. If only 30% of users ever scroll to the recommendations row, the other 70% add only noise. <strong>CUPED</strong> uses each user's metric from before the test to remove part of the natural user-to-user variation, so the same effect is visible with fewer users.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A medicine trial. Patients get a sealed envelope (assignment), the nurse records when the tablet was actually swallowed (exposure), lab results come in (events), and a statistician compares the groups (stats engine). A patient who never took the tablet should not count as "the tablet failed".</p>
  </div>
  <h3>How many users? The sample size formula, worked</h3>
  <p>Before starting, you must know how many users each group needs. Too few, and a real improvement is lost in the noise. For a conversion rate (did the user buy, yes/no), with p₁ the current rate and p₂ the rate you hope for:</p>
  <p><code>n per group = (z<sub>α/2</sub> + z<sub>β</sub>)² × [p₁(1−p₁) + p₂(1−p₂)] / (p₂ − p₁)²</code></p>
  <p>Here z<sub>α/2</sub> = 1.96 for a 5% false-alarm rate, and z<sub>β</sub> = 0.84 for 80% <strong>power</strong> (the chance of catching a real effect of that size). Trace it for a 5% buy rate and a hoped-for +2% relative lift (5% → 5.1%):</p>
  <table class="tbl">
    <tr><th>Step</th><th>Value</th></tr>
    <tr><td>(1.96 + 0.84)²</td><td>2.8016² = 7.849</td></tr>
    <tr><td>p₁(1−p₁) + p₂(1−p₂)</td><td>0.05×0.95 + 0.051×0.949 = 0.0475 + 0.0484 = 0.0959</td></tr>
    <tr><td>(p₂ − p₁)²</td><td>0.001² = 0.000001</td></tr>
    <tr><td>n</td><td>7.849 × 0.0959 / 0.000001 ≈ <strong>752,700 per group</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">from scipy.stats import norm
import math

def n_per_arm(p_base, rel_lift, alpha=0.05, power=0.8):
    p_new = p_base * (1 + rel_lift)
    z_a = norm.ppf(1 - alpha / 2)          # 1.96 for a two-sided 5% test
    z_b = norm.ppf(power)                  # 0.84 for 80% power
    var = p_base * (1 - p_base) + p_new * (1 - p_new)
    return math.ceil((z_a + z_b) ** 2 * var / (p_new - p_base) ** 2)

p = 0.05                                    # 5% of visitors buy today
for lift in [0.10, 0.05, 0.02]:
    n = n_per_arm(p, lift)
    print(f"lift {lift:&gt;4.0%}: {n:&gt;9,} users per arm")

daily_users = 400_000                       # users who reach the page per day
n = n_per_arm(p, 0.02)
for share in [0.10, 0.50]:
    per_arm_per_day = daily_users * share / 2
    print(f"{share:.0%} of traffic in the test -&gt; {math.ceil(n / per_arm_per_day)} days")</div>
  <div class="fx" data-lang="text">lift  10%:    31,231 users per arm
lift   5%:   122,121 users per arm
lift   2%:   752,700 users per arm
10% of traffic in the test -&gt; 38 days
50% of traffic in the test -&gt; 8 days</div>
  <p>The first three lines show the key rule: halve the effect you want to detect and you need about <strong>four times</strong> the users, because the difference is squared in the denominator. The last two lines turn users into calendar days: with 10% of 400,000 daily users, each group gets 20,000 a day and needs 38 days. With 50% it takes 8 days, which we round up to <strong>14</strong> so the test covers two full weeks (weekdays and weekends behave differently).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Unit of randomisation</strong>: the thing you flip a coin for. Usually the user, so one person always sees the same version. When users affect each other (riders and drivers, buyers and sellers), randomise by city or time slot instead, or the treatment "leaks" into control.</p>
  </div>

  <h2 id="se-hash"><span class="num">05</span>Hash Bucketing</h2>
  <p>A user opens the app 20 times a day, served by any of 200 servers. Every time, they must land in the same group. If we stored "user → group" in a database, every request would need a lookup, and every new experiment would need millions of rows written. Calling <code>random()</code> on each request is worse: the user would flip between versions.</p>
  <p>The trick: <strong>compute</strong> the group from the user ID. Feed the text <code>"experiment_name:user_id"</code> into a hash function. A hash turns any text into a big number that looks random but is always the same for the same text. Take that number modulo 1,000 to get a <strong>bucket</strong> from 0 to 999. Buckets 0–99 are treatment (10%), the rest control.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>School sections by roll number. The rule "roll numbers ending in 0 go to section B" needs no register: any teacher can work out your section from your roll number, any day. Hashing is the same rule, made random-looking so it does not follow alphabetical order or joining date.</p>
  </div>
  <div class="fx" data-lang="py">import hashlib
from collections import Counter

def bucket(user_id: str, experiment: str, n_buckets: int = 1000) -&gt; int:
    # salt with the experiment name -&gt; each experiment gets an independent split
    key = f"{experiment}:{user_id}".encode()
    return int(hashlib.md5(key).hexdigest()[:8], 16) % n_buckets

def assign(user_id, experiment, treatment_pct=10):
    return "treatment" if bucket(user_id, experiment) &lt; treatment_pct * 10 else "control"

for u in ["user_1", "user_2", "user_3"]:
    print(u, bucket(u, "new_ranker"), assign(u, "new_ranker"), assign(u, "new_ranker"), assign(u, "price_test"))

users = [f"user_{i}" for i in range(100_000)]
print(Counter(assign(u, "new_ranker") for u in users))

# ramp 10% -&gt; 20%: does anyone switch from treatment back to control?
was_t = {u for u in users if assign(u, "new_ranker", 10) == "treatment"}
now_t = {u for u in users if assign(u, "new_ranker", 20) == "treatment"}
print("still treatment after ramp:", len(was_t &amp; now_t), "of", len(was_t))
print("new treatment users:", len(now_t - was_t))

# independence across experiments
both = sum(1 for u in users if assign(u, "new_ranker") == "treatment" and assign(u, "price_test") == "treatment")
print("in treatment of both tests:", both, "(expected about", 100_000 * 0.1 * 0.1, ")")</div>
  <div class="fx" data-lang="text">user_1 947 control control control
user_2 56 treatment treatment control
user_3 608 control control control
Counter({'control': 89993, 'treatment': 10007})
still treatment after ramp: 10007 of 10007
new treatment users: 9948
in treatment of both tests: 1003 (expected about 1000.0 )</div>
  <p>Walk through it. In <code>bucket</code>, <code>hashlib.md5(key).hexdigest()[:8]</code> takes the first 8 hex digits of the hash, <code>int(..., 16)</code> turns them into a number, and <code>% n_buckets</code> folds it into 0–999. <code>user_2</code> lands in bucket 56, below 100, so treatment, and calling <code>assign</code> again gives the same answer. In <code>price_test</code> the key text is different, so the same user lands elsewhere and is control. Out of 100,000 users, 10,007 got treatment: close to 10%, as a fair split should be.</p>
  <p>The ramp lines matter in practice. Going from 10% to 20% means "buckets 0–199" instead of "0–99". Every user already treated stays treated (10,007 of 10,007), and 9,948 new users join. Nobody flips back, so nobody sees the product change twice. The last line shows the experiments are independent: about 10% × 10% = 1% of users are in both treatments, as chance predicts.</p>
  <figure class="viz"><svg viewBox="0 0 720 150" width="720" role="img"><text x="10" y="42" font-weight="600">Ramp 10%</text><rect x="120" y="20" width="58" height="34" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="149" y="42" text-anchor="middle" class="tm">0–99</text><rect x="178" y="20" width="522" height="34" rx="3" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="439" y="42" text-anchor="middle">buckets 100–999 → control</text><text x="10" y="102" font-weight="600">Ramp 20%</text><rect x="120" y="80" width="116" height="34" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="178" y="102" text-anchor="middle" class="tm">0–199 treated</text><rect x="236" y="80" width="464" height="34" rx="3" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="468" y="102" text-anchor="middle">buckets 200–999 → control</text><text x="360" y="140" text-anchor="middle" class="tm">Buckets 0–99 stay treated after the ramp; 100–199 join them. Nobody flips back.</text></svg><figcaption>Ramping by bucket range only ever adds users to treatment, so user experience stays consistent.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hash bucketing</strong>: deterministic assignment by <code>hash(salt + unit_id) mod B</code>. The <strong>salt</strong> is extra text (here the experiment name) mixed into the key so different experiments get different, uncorrelated splits.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using <code>user_id % 2</code>. Every experiment gets the exact same split, so the same half of users carries every risky change, and effects of overlapping tests mix. Sequential IDs also track signup date, so "even IDs" may be older, more loyal users.</p>
  </div>

  <h2 id="se-trust"><span class="num">06</span>Trusting the Numbers</h2>
  <p>The test ran for two weeks. The dashboard says treatment is +1.8%. Before celebrating, two checks decide whether the number can be trusted at all.</p>
  <h3>Check 1: sample ratio mismatch (SRM)</h3>
  <p>You planned 50/50. You should get <em>about</em> 50/50, give or take a little luck. If the split is off by more than luck allows, something in the pipeline is broken: a variant that crashes before logging, bots filtered in one arm only, a redirect that loses users. Then the two groups are no longer alike, and the +1.8% means nothing. The check is a <strong>chi-square test</strong>: it compares the counts you got to the counts you expected and says how likely such a gap is by chance.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school sends 1,000 students on a trip in two buses of 500. At the destination one bus has 470. You don't start the picnic; you first find out where 30 children got off. The missing children are not a random sample.</p>
  </div>
  <div class="fx" data-lang="py">from scipy.stats import chisquare

def srm_check(n_control, n_treatment, expected_share=0.5):
    total = n_control + n_treatment
    expected = [total * (1 - expected_share), total * expected_share]
    stat, p = chisquare([n_control, n_treatment], f_exp=expected)
    return stat, p

for c, t in [(500_400, 499_600), (1_008_000, 992_000), (50_800, 49_200)]:
    stat, p = srm_check(c, t)
    flag = "SRM! stop" if p &lt; 0.001 else "ok"
    print(f"{c:&gt;9,} vs {t:&gt;9,}  share={t/(c+t):.4f}  chi2={stat:7.1f}  p={p:.2e}  {flag}")</div>
  <div class="fx" data-lang="text">  500,400 vs   499,600  share=0.4996  chi2=    0.6  p=4.24e-01  ok
1,008,000 vs   992,000  share=0.4960  chi2=  128.0  p=1.12e-29  SRM! stop
   50,800 vs    49,200  share=0.4920  chi2=   25.6  p=4.20e-07  SRM! stop</div>
  <p>Trace the middle row by hand. Expected is 1,000,000 each. χ² = (8,000)²/1,000,000 + (8,000)²/1,000,000 = 64 + 64 = 128. A χ² of 128 with one degree of freedom has p ≈ 10<sup>−29</sup>: practically impossible by luck. A 49.6% share looks harmless to the eye, but with 2 million users it is a clear bug. The first row (49.96%) is normal noise. Teams use a strict cut-off like p &lt; 0.001 so they do not raise false SRM alarms across hundreds of tests.</p>
  <h3>Check 2: did someone peek?</h3>
  <p>A test is planned for 14 days. Someone checks the dashboard every morning and stops the first day p &lt; 0.05. That feels harmless but it is not. Each look is another chance for noise to cross the line. The simulation below runs 2,000 tests where A and B are <em>exactly the same</em>, so every "win" is a false positive.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.stats import norm

rng = np.random.default_rng(1)
n_tests, days, per_day, p = 2_000, 14, 2_000, 0.05   # A and B are IDENTICAL
fp_end = fp_peek = 0
for _ in range(n_tests):
    a = rng.binomial(per_day, p, days).cumsum()      # running conversions per arm
    b = rng.binomial(per_day, p, days).cumsum()
    n = per_day * np.arange(1, days + 1)
    pooled = (a + b) / (2 * n)
    z = (b / n - a / n) / np.sqrt(pooled * (1 - pooled) * 2 / n)
    pvals = 2 * (1 - norm.cdf(np.abs(z)))
    fp_end += pvals[-1] &lt; 0.05                     # look once, on day 14
    fp_peek += (pvals &lt; 0.05).any()                # look every day, stop at first p&lt;0.05
print(f"false positives, one look at the end: {fp_end / n_tests:.1%}")
print(f"false positives, peeking daily      : {fp_peek / n_tests:.1%}")</div>
  <div class="fx" data-lang="text">false positives, one look at the end: 5.8%
false positives, peeking daily      : 23.3%</div>
  <p><code>cumsum()</code> builds the running totals a person would see each morning, and <code>pvals</code> holds one p-value per day. Looking once gives about 5% false winners, as promised (5.8% here is simulation noise). Stopping at the first daily p &lt; 0.05 gives <strong>23%</strong>: nearly one in four "winning" launches did nothing.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SRM</strong>: the observed split differs from the designed split by more than chance. <strong>Peeking problem</strong>: repeated significance checks inflate the false positive rate. Fixes: decide the duration up front, or use <strong>sequential tests</strong> (e.g. always-valid p-values) designed for continuous monitoring.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The SRM is small, the effect is big, let's ship." An SRM means the groups differ in unknown ways; the size of the effect cannot be trusted at all until the cause is found and fixed.</p>
  </div>

  <h2 id="se-inter"><span class="num">07</span>Interleaving</h2>
  <p>Search and recommendation teams often have ten candidate rankers and want to know which is best. A full A/B test for each would need hundreds of thousands of users and weeks. The problem is noise between people: one user clicks everything, another clicks nothing, and that swamps a small difference between rankers.</p>
  <p>The idea of <strong>interleaving</strong>: show <em>each</em> user one list made by mixing both rankers' results. Every result remembers which ranker brought it. Then count whose results the user clicked. Each user becomes their own comparison, so the person-to-person noise cancels out.</p>
  <div class="flow"><span>Ranker A list</span><span>Ranker B list</span><span>Team-draft merge</span><span>One list shown</span><span>Credit clicks to A or B</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Picking teams for gully cricket. Two captains toss a coin, then take turns choosing their best remaining player. At the end you see whose picks scored the runs. Team-draft interleaving does exactly this with search results.</p>
  </div>
  <p>Team-draft, step by step: each round, flip a coin for who picks first; each ranker adds its highest item not yet in the list; repeat until the list has k items.</p>
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
  <p>Round 1: A picks first and takes its top item d1; B's top is d3, so it takes d3. Round 2: A's next unshown item is d2; B's d1 is already taken, so it takes d6. The <code>team</code> dict remembers who brought each item. The user clicked d3 and d6, both from B, so B wins this session 2–0.</p>
  <p>One session proves nothing; you aggregate many. Say 2,500 sessions: 560 won by B, 440 by A, 1,500 ties (no clicks or equal clicks). Drop ties and ask: if neither ranker were better, would a 560–440 split happen by luck? A binomial test against 50/50 gives p = 0.0002. B is preferred. Only 1,000 decided sessions were needed.</p>
  <div class="fx" data-lang="py">from scipy.stats import binomtest
wins_b, wins_a, ties = 560, 440, 1_500
p = binomtest(wins_b, wins_b + wins_a, 0.5).pvalue
print(f"B preferred in {wins_b/(wins_a+wins_b):.0%} of decided sessions, p={p:.4f}")</div>
  <div class="fx" data-lang="text">B preferred in 56% of decided sessions, p=0.0002</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Interleaving</strong>: an online comparison of two rankers where each user sees a merged list and clicks are credited to the ranker that contributed the item. Typically 10–100× more sensitive than A/B for ranking preference.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Interleaving tells you which ranker users prefer, not the revenue lift or long-term effect. Use it to screen many rankers quickly, then A/B test the winner on business metrics.</p>
  </div>

  <h2 id="se-bandit"><span class="num">08</span>Bandits</h2>
  <p>A news app has three headlines for the same story and wants the most clicks. A classic A/B/C test gives each headline one third of readers until the test ends. But the story is only hot for a day. While you are "testing", two thirds of readers see worse headlines. That lost value has a name: <strong>regret</strong>, the clicks you missed compared with always showing the best option.</p>
  <p>A <strong>multi-armed bandit</strong> learns and earns at the same time. It starts by trying all options, and as evidence builds it sends more and more traffic to the one that is winning. The name comes from slot machines ("one-armed bandits"): which arm should you pull next?</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new office worker trying the lunch places near the office. In week one she tries all three. By week three she goes to the good dosa place most days, but still tries the others now and then in case they improved. That balance of trying (explore) and using the best so far (exploit) is a bandit.</p>
  </div>
  <p><strong>Thompson sampling</strong> is the most used bandit. For each headline, keep a count of clicks (wins) and non-clicks (losses). For every new reader, draw one random "plausible CTR" for each headline from a Beta(wins, losses) distribution, and show the headline with the highest draw. A headline with little data gets wide, random draws, so it is still tried sometimes. A headline with lots of clicks gets high, confident draws, so it wins most rounds.</p>
  <div class="fx" data-lang="py">import numpy as np

true_ctr = [0.040, 0.050, 0.065]          # three headlines; nobody knows these
n_users = 30_000

def ab_test(rng):
    arms = rng.integers(0, 3, n_users)    # fixed equal split
    clicks = rng.random(n_users) &lt; np.take(true_ctr, arms)
    return clicks.sum(), np.bincount(arms, minlength=3)

def thompson(rng):
    wins = np.ones(3); losses = np.ones(3)     # Beta(1,1) prior per arm
    shown = np.zeros(3, int); total = 0
    for _ in range(n_users):
        arm = np.argmax(rng.beta(wins, losses))   # sample a plausible CTR per arm, pick the max
        click = rng.random() &lt; true_ctr[arm]
        wins[arm] += click; losses[arm] += 1 - click
        shown[arm] += 1; total += click
    return total, shown

rng = np.random.default_rng(42)
c_ab, s_ab = ab_test(rng)
c_ts, s_ts = thompson(rng)
best = n_users * max(true_ctr)
print("A/B      clicks:", c_ab, "shown per arm:", s_ab.tolist(), "regret:", round(best - c_ab))
print("Thompson clicks:", c_ts, "shown per arm:", s_ts.tolist(), "regret:", round(best - c_ts))</div>
  <div class="fx" data-lang="text">A/B      clicks: 1572 shown per arm: [10049, 10028, 9923] regret: 378
Thompson clicks: 1920 shown per arm: [338, 865, 28797] regret: 30</div>
  <p>The best possible is 30,000 × 6.5% = 1,950 clicks. The fixed split shows each headline to about 10,000 readers and loses 378 clicks. Thompson sampling quickly notices headline 3, shows it to 28,797 readers, and loses only 30. The line <code>arm = np.argmax(rng.beta(wins, losses))</code> is the whole algorithm; the next line updates the counts.</p>
  <table class="tbl">
    <tr><th></th><th>A/B test</th><th>Multi-armed bandit</th></tr>
    <tr><td>Traffic</td><td>Fixed split</td><td>Shifts toward the winner</td></tr>
    <tr><td>Goal</td><td>Clean causal estimate</td><td>Maximise reward while learning</td></tr>
    <tr><td>Regret (lost value)</td><td>Higher (378 above)</td><td>Lower (30 above)</td></tr>
    <tr><td>Best for</td><td>Launch decisions, long-term metrics</td><td>Headlines, creatives, short-lived options</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ε-greedy</strong>: show the best arm, but a random arm with probability ε (e.g. 10%). <strong>UCB</strong> (upper confidence bound): pick the arm with the highest "average + uncertainty bonus". <strong>Thompson sampling</strong>: sample from each arm's posterior and pick the highest sample.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using a bandit to decide a big launch. Because traffic is uneven and shifts over time, the effect size estimate is biased, and slow effects (retention after a month) never get measured. Use bandits to optimise, A/B tests to decide.</p>
  </div>

  <h2 id="se-guard"><span class="num">09</span>Guardrails &amp; Rollback</h2>
  <p>A new feed ranker raises clicks by 4%. Great? Not if it did so by showing more clickbait, so complaints doubled and users who unsubscribed will never come back. The <strong>primary metric</strong> (the one you are trying to move) is not the only thing that matters. <strong>Guardrail metrics</strong> are the things that must <em>not</em> get worse, whatever the primary metric does.</p>
  <div class="cards">
    <div><b>System</b><p>p99 latency, error and timeout rate</p></div>
    <div><b>Business</b><p>Revenue per user, orders, ad load</p></div>
    <div><b>Trust</b><p>Complaints, unsubscribes, policy violations</p></div>
    <div><b>Data quality</b><p>SRM, missing exposure logs</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The railings on a hill road. Your goal is to reach the top quickly (primary metric). The railing does not help you go faster, but if the car touches it, you stop and check before going on.</p>
  </div>
  <p>Each guardrail gets a threshold before the test starts, for example "p99 latency may not rise more than 10 ms" or "complaint rate may not rise more than 5% relative". A monitor compares treatment to control every hour. On a breach:</p>
  <div class="flow"><span>Guardrail breach</span><span>Alert</span><span>Flag flips traffic to old model</span><span>Investigate</span><span>Fix &amp; re-ramp</span></div>
  <p>Worked example: control's p99 latency is 120 ms, the limit is +10 ms. On day 2 treatment shows 138 ms for three hours in a row. That breaches 130 ms, so the controller sets the experiment's treatment share to 0% with a config change, not a code deploy. Users are back on v1 in about a minute. Engineers then find the cause (a new feature lookup with no cache), fix it, and restart the ramp from 5%.</p>
  <p>Rollback must be fast and complete. Fast means the old model stays loaded and "warm" (already in memory, caches filled), and the switch is a <strong>feature flag</strong>: a config value the service reads at runtime. Complete means rolling back everything the model depends on, especially the feature pipeline version, since an old model fed new features is a new, untested system.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Guardrail metric</strong>: a metric that blocks a launch if it degrades beyond a set threshold, regardless of the primary metric. <strong>Auto-rollback</strong>: an automated rule that returns traffic to the champion when a guardrail breaches.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Rollback that needs a redeploy. A build-and-deploy can take 30–60 minutes while users suffer. Keep the previous model loaded and switchable by config, and roll back the feature pipeline version with it.</p>
  </div>

  <h2 id="se-mistakes"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: shipping on offline wins</span>
    <p>Better NDCG on logged data is a reason to test, not to launch. Offline data only has feedback on what the old model showed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shadow with side effects</span>
    <p>The mirrored path sends real emails or writes real rows. Make the shadow path read-only and stub external calls.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: random assignment per request</span>
    <p>One user sees both versions, results mix, and the samples are no longer independent. Hash the user ID (or city for marketplaces).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: counting everyone, not exposed users</span>
    <p>Including users who never reached the changed screen dilutes the effect towards zero and wastes weeks of traffic.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no sample size plan</span>
    <p>A test with 10,000 users per arm cannot detect a 2% lift that needs 752,700. "No significant difference" then means "we could not tell", not "no effect".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ignoring SRM and peeking</span>
    <p>A broken split or daily stopping makes any result untrustworthy. Check SRM first; fix the duration up front.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: stopping before a full week</span>
    <p>Weekday and weekend users differ, and novelty fades. Run at least one, preferably two, full weekly cycles.</p>
  </div>

  <h2 id="se-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Shadow vs canary: what does each prove?</summary><div class="qa-body">Shadow proves the model runs correctly on real traffic (latency, errors, output sanity) with zero user exposure. Canary proves it is safe with a small share of real users. Neither measures the causal business effect; that's the A/B test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shadow shows 96% decision agreement with production. Ready to canary?</summary><div class="qa-body">Not on that number alone. Check decision rates (block rate 1.9% vs 5.2% in our example is a 2.7× change), score distributions, p99 latency, and agreement by slice. A small disagreement concentrated in one segment can be a serious bug.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>2,000 rps, 5% canary, 0.1% baseline errors. How many errors do you expect in 10 minutes, and when do you roll back?</summary><div class="qa-body">60,000 canary requests, 60 expected errors. Use a one-sided binomial test against 0.1%: 70 errors gives p ≈ 0.11 (keep going), 90 errors gives p ≈ 0.0002 (roll back).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a deterministic assignment function.</summary><div class="qa-body"><code>bucket = int(md5(f"{exp}:{user_id}").hexdigest()[:8], 16) % 1000</code>; treatment if <code>bucket &lt; pct*10</code>. Stable per user, salted per experiment, uniform, no storage, and ramping only adds users to treatment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why salt the hash with the experiment name?</summary><div class="qa-body">Without it, every experiment puts the same users in treatment. Effects of overlapping tests become confounded, and the same users carry all the risk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Base conversion 5%. How many users per arm to detect a 2% relative lift at α = 0.05, power 80%?</summary><div class="qa-body">(1.96 + 0.84)² × (0.05·0.95 + 0.051·0.949) / 0.001² ≈ 7.85 × 0.0959 / 10⁻⁶ ≈ 752,700 per arm. At 400k eligible users/day with 50% in the test that is 8 days; run 14 for full weeks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your 50/50 test shows 1,008,000 vs 992,000 users. Proceed?</summary><div class="qa-body">No. χ² = 8000²/10⁶ × 2 = 128, p ≈ 10<sup>−29</sup>: sample ratio mismatch. Look for bugs in assignment, bot filtering, exposure logging, or a variant that crashes before logging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A PM checks the dashboard daily and wants to stop when p &lt; 0.05. What do you say?</summary><div class="qa-body">That inflates false positives: in a simulation of identical A and B over 14 daily looks, 23% of tests "won" instead of 5%. Fix the duration in advance, or use a sequential testing method built for continuous monitoring.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use interleaving instead of A/B?</summary><div class="qa-body">For comparing ranking models in search/recs when you have many candidates and limited traffic. Each user sees both rankers, so far fewer users are needed. Confirm the winner with an A/B test on business metrics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bandit or A/B for choosing among 20 email subject lines for one campaign?</summary><div class="qa-body">Bandit. The options are short-lived and many, and the goal is maximising opens now, not a precise effect size. Thompson sampling shifts traffic to the best lines quickly (regret 30 vs 378 clicks in our 3-arm simulation).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What guardrails would you set for a new feed ranker?</summary><div class="qa-body">p99 latency and error rate; revenue per user; session length or retention; content diversity / creator coverage; complaint and hide rates; SRM. Breach of any → auto-rollback, even if the primary metric is up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why randomise by user rather than by request?</summary><div class="qa-body">Request-level randomisation shows one user both variants: inconsistent experience, contamination (learning from A affects B), and non-independent samples that break the variance estimate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Treatment is +3% on day 2 and +0.5% on day 14. What happened?</summary><div class="qa-body">Likely a novelty effect: users explore the change, then return to habits. Run tests for full weekly cycles, look at the effect over time, and compare new vs returning users.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Blue-green vs canary for a model with a new feature pipeline?</summary><div class="qa-body">Canary first: limited users, gradual widening, compare live metrics. Blue-green is a fast swap with fast rollback but exposes 100% at once, so it suits low-risk or already-validated changes.</div></details>
</main>`
});
