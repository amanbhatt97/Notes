// notes/systemdesign/sd_experiments.js — Online Experiments & A/B Infrastructure
Object.assign(TOPIC_CONTENT, {
  "sd_experiments": `<main>
<h1>Online Experiments &amp; A/B Infrastructure</h1>
  <div class="where"><span>ML System Design</span><span>Experiments</span></div>
  <p class="lead">An online experiment is how a team finds out whether a new model actually makes things better for real users, rather than only scoring better on old data. It matters because offline metrics routinely disagree with what customers do: a model can win every offline test and still lose money once people react to it. This note builds the machinery a company uses to answer that question safely: how users are split into groups, how many users a test needs, the checks that tell you whether a result can be trusted, the metrics that decide a launch, and the faster or smarter alternatives (interleaving and bandits) used when a plain A/B test is too slow or too wasteful. The running example is the one used across this track: Biteful, a food-delivery app, wants to replace its delivery-time estimate (ETA) model v1 with a new model v2, and its users Asha, Ben and Chitra (plus a few hundred thousand more) will be our test subjects. The statistics underneath are taught in <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> and <a class="xref" data-note="st_abtesting">A/B Testing</a>; here we focus on the system around them.</p>

  <h2 id="se-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Online Experiments</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why test online</div>
        <ul>
          <li>Offline data cannot show how people react</li>
          <li>v2: MAE 1.27 vs 3.15, but late 50% vs 0%</li>
          <li>Ladder: offline → shadow → canary → A/B → ramp</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running an A/B test</div>
        <ul>
          <li><b>Assignment</b>: md5(experiment:user) mod 1000</li>
          <li><b>Exposure</b>: analyse users who actually saw it</li>
          <li><b>Sample size</b>: 2% lift on 5% needs 752,700 per arm</li>
          <li><b>CUPED</b>: pre-test data cuts variance</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Trusting a result</div>
        <ul>
          <li><b>SRM</b>: χ² on group sizes, p &lt; 0.001 means stop</li>
          <li><b>Peeking</b>: 5.8% false winners become 23.3%</li>
          <li><b>Novelty</b>: run full weeks, compare week 1 vs 2</li>
          <li><b>Guardrails</b> block a launch even if the primary wins</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Beyond A/B</div>
        <ul>
          <li><b>Interleaving</b>: one merged list, far fewer users</li>
          <li><b>Feedback loops</b>: labels only for what was shown</li>
          <li><b>Bandits</b>: shift traffic to the winner while learning</li>
          <li>Bandits optimise; A/B tests decide</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="se-gap"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Offline Wins Are Not Enough</span><span class="rm-sub">what old data cannot tell you, and the rollout ladder</span></div></div>
      <div class="rm-item rm-done" data-target="se-ab"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The A/B Test and Its Machinery</span><span class="rm-sub">control, treatment, exposure and the pieces of the platform</span></div></div>
      <div class="rm-item rm-done" data-target="se-hash"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Assignment by Hashing</span><span class="rm-sub">the same group every time, with no database</span></div></div>
      <div class="rm-item rm-done" data-target="se-power"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Sample Size, Power and CUPED</span><span class="rm-sub">how many users a test needs, and how to need fewer</span></div></div>
      <div class="rm-item rm-done" data-target="se-srm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Sample Ratio Mismatch</span><span class="rm-sub">checking that the split itself is healthy</span></div></div>
      <div class="rm-item rm-done" data-target="se-peek"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Peeking and Novelty Effects</span><span class="rm-sub">when to look, when to stop, and early excitement</span></div></div>
      <div class="rm-item rm-done" data-target="se-metrics"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Primary Metrics and Guardrails</span><span class="rm-sub">which number decides, and fast rollback</span></div></div>
      <div class="rm-item rm-done" data-target="se-inter"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Interleaving</span><span class="rm-sub">comparing two rankers inside one list</span></div></div>
      <div class="rm-item rm-done" data-target="se-loops"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Feedback Loops and Exploration</span><span class="rm-sub">when the model writes its own training data</span></div></div>
      <div class="rm-item rm-done" data-target="se-bandit"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Multi-Armed Bandits</span><span class="rm-sub">learning and earning at the same time</span></div></div>
      <div class="rm-item rm-done" data-target="se-mistakes"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">id % 2, unexposed users, twenty metrics</span></div></div>
      <div class="rm-item rm-done" data-target="se-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, definitions, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="se-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about experimentation</span></div></div>
    </div>
  </div>

  <h2 id="se-gap"><span class="num">01</span>Why Offline Wins Are Not Enough</h2>
  <p>Biteful's data science team has a new ETA model. Today's model, v1, is a reasonable estimate with a 3-minute safety buffer added on top, so it rarely promises a time it cannot keep. The new model, v2, is the same estimate without the buffer. On every offline error metric v2 looks better, and the product manager asks the natural question: can we switch everyone over on Monday? Let us look at what the team's offline evaluation actually tells us, using eight delivered orders (numbered 101 to 108) and the ETAs each model would have shown for them.</p>
  <div class="fx" data-lang="py">import numpy as np

actual = np.array([28, 41, 30, 58, 19, 52, 27, 33])                 # orders 101-108, minutes
v2 = np.array([27.5, 42.3, 27.8, 58.9, 20.4, 51.1, 29.1, 32.1])    # new model: unbiased ETA
v1 = v2 + 3                                                         # today's model: same, plus a 3-min buffer

for name, eta in [("v1 (buffered)", v1), ("v2 (unbiased)", v2)]:
    err = actual - eta
    print(f"{name:&lt;14} MAE {np.abs(err).mean():4.2f}   late {np.mean(err &gt; 0):4.0%}   "
          f"average ETA shown {eta.mean():4.1f} min")</div>
  <div class="fx" data-lang="text">v1 (buffered)  MAE 3.15   late   0%   average ETA shown 39.1 min
v2 (unbiased)  MAE 1.27   late  50%   average ETA shown 36.1 min</div>
  <p><strong>Offline evaluation</strong> means scoring a model on data that was logged in the past: it is cheap, fast and nobody is affected. By that standard v2 wins clearly, with a mean absolute error (MAE, the average number of minutes the estimate is off by) of 1.27 against 3.15. But look at the other two columns. v2 is late on half of the orders, while v1 was never late, and v2 shows ETAs three minutes shorter on average. Shorter ETAs might persuade more people to order. Late food might make more people cancel or stop using the app. Which effect wins is a question about how <em>people</em> will behave, and the log of past orders cannot answer it, because those orders were placed by people who saw v1's numbers.</p>
  <p>This gap between offline and online results shows up in every ML product, for a handful of recurring reasons. People react to the product, so changing what they see changes what they do. The offline metric is usually a <strong>proxy</strong>, a stand-in number for the real goal (here, MAE stands in for "customers trust our promises"), and the two can move in opposite directions. Old logs only contain what the old system caused, so there is no record of the orders people <em>would</em> have placed with a shorter ETA. Live features or latency can differ from training. And the model's outputs can change its own future data, a problem we return to later in this note.</p>
  <p>So the answer is to measure the model on real users, which is called <strong>online evaluation</strong>. Because real users can be hurt, teams climb a <strong>rollout ladder</strong>: each rung exposes more people, and you only climb after the cheaper, safer rung has passed.</p>
  <figure class="viz"><svg viewBox="0 0 720 172" width="720" role="img"><rect x="12" y="128" width="126" height="12" rx="3" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="75" y="158" text-anchor="middle" font-weight="600">Offline eval</text><text x="75" y="118" text-anchor="middle" class="tm">0% users</text><rect x="154" y="110" width="126" height="30" rx="3" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="217" y="158" text-anchor="middle" font-weight="600">Shadow</text><text x="217" y="86" text-anchor="middle" class="tm">0% served</text><text x="217" y="100" text-anchor="middle" class="tm">100% mirrored</text><rect x="296" y="90" width="126" height="50" rx="3" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="359" y="158" text-anchor="middle" font-weight="600">Canary</text><text x="359" y="80" text-anchor="middle" class="tm">1-5%</text><rect x="438" y="60" width="126" height="80" rx="3" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="501" y="158" text-anchor="middle" font-weight="600">A/B test</text><text x="501" y="50" text-anchor="middle" class="tm">10-50%</text><rect x="580" y="24" width="126" height="116" rx="3" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="643" y="158" text-anchor="middle" font-weight="600">Ramp</text><text x="643" y="16" text-anchor="middle" class="tm">25→50→100%</text><path d="M12,140 H710" stroke="currentColor" fill="none" stroke-width="1.4"/></svg><figcaption>Each rung exposes more real users, and you only climb after the cheaper, safer rung has passed.</figcaption></figure>
  <p>Read the figure from left to right; the height of each bar is the share of users exposed. Offline evaluation touches nobody. A <strong>shadow deployment</strong> sends a copy of real requests to the new model but throws its answers away, so it proves the model runs correctly on live traffic without anyone seeing it. A <strong>canary</strong> serves the new model to 1–5% of users to catch crashes and obvious damage. Both are covered in <a class="xref" data-note="sd_serving">Serving</a>, and both only answer "does it work, and is it broken?". The <strong>A/B test</strong> is the rung that answers "is it better?", and it is the subject of the rest of this note. Only after it passes do we <strong>ramp</strong> to 25%, 50% and then everyone. Getting a driving licence works the same way: you practise on an empty ground, then watch the instructor drive, then drive a quiet road with his foot near the brake, then take the real test, and only then drive alone in city traffic. In the vocabulary you will hear in interviews, the current model is the <strong>champion</strong> and the new one is the <strong>challenger</strong>.</p>

  <h2 id="se-ab"><span class="num">02</span>The A/B Test and Its Machinery</h2>
  <p>The obvious way to test v2 is to switch it on for everyone this week and compare with last week. The trouble is that this week is not like last week: there might be a cricket final, a sale, a heatwave or a public holiday, and any of these moves orders far more than an ETA model does. You would have no way to separate the model's effect from everything else that changed.</p>
  <p>An <strong>A/B test</strong> fixes this by running both versions at the same time on two randomly chosen groups of users. The group that keeps the old version (v1) is called <strong>control</strong>, and the group that gets the new version (v2) is called <strong>treatment</strong>. Because users are assigned at random, the two groups are alike in every way on average (same mix of cities, habits, phones, weather), and they live through the same cricket final. So if the treatment group behaves differently, the only explanation left, apart from chance, is the model. This is what makes an A/B test a <strong>causal</strong> measurement rather than a correlation. A medicine trial is the familiar analogy: patients are given a sealed envelope that decides whether they receive the new tablet or the old one, and the two groups are compared at the end.</p>
  <p>Running one A/B test by hand is easy; running hundreds at once across a company needs a small platform. The figure shows its pieces and how a request flows through them.</p>
  <figure class="viz"><svg viewBox="0 0 730 186" width="730" role="img"><defs><marker id="se-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="8" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="25" text-anchor="middle" font-weight="600">Experiment</text><text x="85" y="39" text-anchor="middle" class="tm">config</text><rect x="10" y="80" width="150" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="106" text-anchor="middle" font-weight="600">User request</text><rect x="200" y="80" width="150" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="275" y="99" text-anchor="middle" font-weight="600">Assignment</text><text x="275" y="113" text-anchor="middle" class="tm">hash(user,exp)</text><rect x="390" y="80" width="150" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="99" text-anchor="middle" font-weight="600">App serves</text><text x="465" y="113" text-anchor="middle" class="tm">variant</text><rect x="580" y="80" width="140" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="650" y="99" text-anchor="middle" font-weight="600">Exposure +</text><text x="650" y="113" text-anchor="middle" class="tm">event logs</text><rect x="390" y="140" width="150" height="40" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="164" text-anchor="middle" font-weight="600">Metric pipeline</text><rect x="200" y="140" width="150" height="40" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="275" y="164" text-anchor="middle" font-weight="600">Stats + guardrails</text><rect x="10" y="140" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="164" text-anchor="middle" font-weight="600">Decision</text><line x1="162" y1="102" x2="197" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="352" y1="102" x2="387" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="542" y1="102" x2="577" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="162" y1="30" x2="240" y2="77" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><path d="M650,126 V160 H543" stroke="currentColor" fill="none" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="388" y1="160" x2="353" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="198" y1="160" x2="163" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/></svg><figcaption>The top row runs on every request; the bottom row runs in the data warehouse, usually once a day.</figcaption></figure>
  <p>Follow one request along the top row. The <strong>experiment config</strong> says which experiments are running, on what share of traffic and with which variants. When Asha opens the app, the <strong>assignment service</strong> works out which group she is in (the next section shows how it does this without a database). The app then serves her the right variant, and logs an <strong>exposure</strong> event: a record that this user actually saw this variant at this time. Exposure is logged at the moment the changed thing appears on screen, here when an ETA is shown on a restaurant card, not when the app opens. Users who open the app and leave before seeing any ETA could not have been affected by the model, and counting them only adds noise (the Common Mistakes section shows how much).</p>
  <p>The bottom row runs later, in the data warehouse. The <strong>metric pipeline</strong> joins exposures to what users did afterwards (orders, cancellations, delivery times) and produces per-user totals for each group. The <strong>stats engine</strong> computes the difference between groups with a confidence interval, runs the health checks we meet below (sample ratio mismatch, guardrails) and produces a report that a person turns into a decision. Commercial tools such as Optimizely, Statsig or Eppo package these pieces; large companies usually build their own.</p>
  <p>One design decision comes before everything else: what exactly do we flip the coin for? This is the <strong>unit of randomisation</strong>. Usually it is the user, so that one person always sees the same version; randomising each request would show Asha v1 at lunch and v2 at dinner, which is confusing for her and statistically messy. Sometimes users affect each other, and then the user is the wrong unit. Biteful's ETA is an example: the ETA influences which rider gets which order, and the same riders serve both groups, so a change for treatment users leaks into control users' deliveries. This leak is called <strong>interference</strong>. The fix is to randomise bigger units that do not share riders, such as whole city zones, or to alternate the whole zone between v1 and v2 in time slots (say, every hour), which is called a <strong>switchback</strong> test. Marketplaces like ride-hailing and delivery apps use switchbacks heavily.</p>

  <h2 id="se-hash"><span class="num">03</span>Assignment by Hashing</h2>
  <p>The assignment service has a demanding job. Asha might open Biteful twenty times a day, and each request can land on any of two hundred servers. Every time, she must get the same group, and the answer must come back in well under a millisecond because it sits on the path that serves her screen. The first idea most people have is to flip a coin per request:</p>
  <div class="fx" data-lang="py">import random

def assign_randomly():                       # the naive idea: flip a coin on every request
    return "treatment" if random.random() &lt; 0.5 else "control"

random.seed(3)
asha_requests = [assign_randomly() for _ in range(8)]   # Asha opens the app 8 times today
print(asha_requests)
print("Asha saw both versions:", len(set(asha_requests)) == 2)</div>
  <div class="fx" data-lang="text">['treatment', 'control', 'treatment', 'control', 'control', 'treatment', 'treatment', 'control']
Asha saw both versions: True</div>
  <p>In eight visits Asha saw v1 four times and v2 four times. She would be confused by ETAs jumping around, and her behaviour would be a mixture of both versions, so she belongs to neither group. The second idea is to flip the coin once per user and store the result in a database table of "user → group". That works, but now every request needs a database lookup, every new experiment writes millions of rows, and if the table and a server disagree for a moment the user flips anyway.</p>
  <p>The standard solution is to <em>compute</em> the group instead of storing it. A <strong>hash function</strong> takes any piece of text and turns it into a large number. The number looks random, but it is completely determined by the text: the same text always gives the same number, on any machine, forever. So we hash the text <code>"experiment:user_id"</code>, take the remainder after dividing by 1,000 to get a <strong>bucket</strong> between 0 and 999, and declare that buckets 0–99 are treatment (10% of users) and the rest are control. This is called <strong>hash bucketing</strong>. Think of a school that assigns sections by roll number, "roll numbers ending in 0 go to section B": no register is needed, because any teacher can work out your section from your number on any day. Hashing is the same rule, scrambled so that it does not follow alphabetical order or sign-up date.</p>
  <div class="fx" data-lang="py">import hashlib

def bucket(user_id: str, experiment: str, n_buckets: int = 1000) -&gt; int:
    key = f"{experiment}:{user_id}".encode()             # salt the id with the experiment name
    return int(hashlib.md5(key).hexdigest()[:8], 16) % n_buckets

def assign(user_id, experiment, treatment_pct=10):
    return "treatment" if bucket(user_id, experiment) &lt; treatment_pct * 10 else "control"

# Trace one user by hand
h = hashlib.md5("eta_v2:asha".encode()).hexdigest()
print("md5 hex  :", h)
print("first 8  :", h[:8], "-&gt; int", int(h[:8], 16))
print("mod 1000 :", int(h[:8], 16) % 1000, "-&gt;", assign("asha", "eta_v2"))
print()
for u in ["asha", "ben", "chitra"]:
    print(f"{u:&lt;7} bucket {bucket(u, 'eta_v2'):&gt;3}  eta_v2: {assign(u, 'eta_v2'):&lt;9} "
          f"again: {assign(u, 'eta_v2'):&lt;9} promo_banner: {assign(u, 'promo_banner')}")</div>
  <div class="fx" data-lang="text">md5 hex  : 9bbb30aa4069c4df71238495c9cc6e3e
first 8  : 9bbb30aa -&gt; int 2612736170
mod 1000 : 170 -&gt; control

asha    bucket 170  eta_v2: control   again: control   promo_banner: control
ben     bucket 563  eta_v2: control   again: control   promo_banner: treatment
chitra  bucket  81  eta_v2: treatment again: treatment promo_banner: control</div>
  <p>Trace Asha by hand using the first three lines of output. The text being hashed is <code>eta_v2:asha</code>. MD5, a common hash function, turns it into 32 hexadecimal digits beginning <code>9bbb30aa</code>. We keep the first eight digits and read them as a base-16 number: 2,612,736,170. Dividing by 1,000 leaves a remainder of 170. Since 170 is not below 100, Asha is in control, and she will be in control on every server, every time, for as long as this experiment runs. Chitra's bucket is 81, so she is in treatment, and asking again gives the same answer.</p>
  <p>The last column shows why the experiment name is part of the hashed text. That extra text is called a <strong>salt</strong>. Because <code>promo_banner:ben</code> is different text from <code>eta_v2:ben</code>, Ben gets a fresh, unrelated bucket in the banner experiment and lands in treatment there, while Chitra lands in control. Without the salt, every experiment would treat exactly the same users. Now let us check the properties we need across many users:</p>
  <div class="fx" data-lang="py">from collections import Counter

users = [f"user_{i}" for i in range(100_000)]
print(Counter(assign(u, "eta_v2") for u in users))

# Ramp 10% -&gt; 20%: does anyone switch from treatment back to control?
was_t = {u for u in users if assign(u, "eta_v2", 10) == "treatment"}
now_t = {u for u in users if assign(u, "eta_v2", 20) == "treatment"}
print("still treatment after ramp:", len(was_t &amp; now_t), "of", len(was_t))
print("new treatment users       :", len(now_t - was_t))

# Two experiments running at once: are their splits independent?
both = sum(assign(u, "eta_v2") == "treatment" and assign(u, "promo_banner") == "treatment" for u in users)
print("in treatment of both tests:", both, "(independence predicts", int(100_000 * 0.1 * 0.1), ")")</div>
  <div class="fx" data-lang="text">Counter({'control': 90051, 'treatment': 9949})
still treatment after ramp: 9949 of 9949
new treatment users       : 9986
in treatment of both tests: 1021 (independence predicts 1000 )</div>
  <p>Out of 100,000 users, 9,949 landed in treatment, very close to the 10% we asked for, which shows the hash spreads users evenly. The ramp lines show the second useful property. Ramping from 10% to 20% simply means "buckets 0–199 are treatment" instead of "0–99": all 9,949 users who were already treated stay treated, 9,986 new users join, and nobody is switched back to control, so nobody's experience flips. Finally, 1,021 users are in treatment for both experiments, close to the 10% × 10% = 1,000 that we would expect if the two splits were independent. That independence is what lets a company run many experiments on the same users at once without one experiment's effect leaking into another's results.</p>
  <figure class="viz"><svg viewBox="0 0 720 150" width="720" role="img"><text x="10" y="42" font-weight="600">Ramp 10%</text><rect x="120" y="20" width="58" height="34" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="149" y="42" text-anchor="middle" class="tm">0–99</text><rect x="178" y="20" width="522" height="34" rx="3" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="439" y="42" text-anchor="middle">buckets 100–999 → control</text><text x="10" y="102" font-weight="600">Ramp 20%</text><rect x="120" y="80" width="116" height="34" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="178" y="102" text-anchor="middle" class="tm">0–199 treated</text><rect x="236" y="80" width="464" height="34" rx="3" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="468" y="102" text-anchor="middle">buckets 200–999 → control</text><text x="360" y="140" text-anchor="middle" class="tm">Buckets 0–99 stay treated after the ramp; 100–199 join them. Nobody flips back.</text></svg><figcaption>Ramping by bucket range only ever adds users to treatment.</figcaption></figure>
  <p>Real platforms add one more layer on top of this. When two experiments must not overlap (for example, two different ETA models that would conflict), they are placed in the same <strong>layer</strong>, which divides one set of buckets between them so each user is in at most one. Experiments that can safely overlap go in different layers, each with its own salt. The hashing itself is the same in both cases.</p>

  <h2 id="se-power"><span class="num">04</span>Sample Size, Power and CUPED</h2>
  <p>Suppose Biteful runs the ETA test on 10,000 users per group for a week and sees no significant difference. Does that mean v2 has no effect? Usually it means nothing of the kind: the test was simply too small to notice an effect of the size that matters. Orders vary a lot from person to person, and a small real improvement is easily hidden by that natural variation. So before starting any test, you work out how many users it needs.</p>
  <p>Two error rates drive the calculation. The <strong>significance level</strong> α (alpha) is the false-alarm rate you accept, the chance of declaring a winner when there is really no difference; 5% is the usual choice. The <strong>power</strong> is the chance that the test detects a real effect of a given size; 80% is the usual choice. The smallest effect you care about detecting is called the <strong>minimum detectable effect</strong> (MDE). For a conversion rate, the share of restaurant-page visits that turn into an order, with p₁ the current rate and p₂ the rate you hope for, the number of users needed in each group is:</p>
  <p><code>n per group = (z<sub>α/2</sub> + z<sub>β</sub>)² × [p₁(1 − p₁) + p₂(1 − p₂)] / (p₂ − p₁)²</code></p>
  <p>It helps to read the formula in three parts. The bracket is the noise: p(1 − p) is the variance of a yes/no outcome, one term per group. The denominator is the signal, the difference you want to see, squared. The first factor converts your two error rates into a multiplier: z<sub>α/2</sub> ≈ 1.96 is how many standard errors a difference must be to count as significant at 5%, and z<sub>β</sub> ≈ 0.84 is the extra margin needed so that a real effect clears that bar 80% of the time. Biteful's conversion is 5%, and the team wants to detect a 2% relative lift, from 5% to 5.1%. By hand: (1.96 + 0.84)² ≈ 7.85; the noise is 0.05 × 0.95 + 0.051 × 0.949 ≈ 0.0959; the signal is 0.001² = 0.000001; so n ≈ 7.85 × 0.0959 / 0.000001 ≈ 752,700 users per group. The code does the same calculation exactly and turns users into days:</p>
  <div class="fx" data-lang="py">import math
from scipy.stats import norm

def n_per_arm(p_base, rel_lift, alpha=0.05, power=0.8):
    p_new = p_base * (1 + rel_lift)
    z_a = norm.ppf(1 - alpha / 2)          # 1.96 for a two-sided 5% test
    z_b = norm.ppf(power)                  # 0.84 for 80% power
    var = p_base * (1 - p_base) + p_new * (1 - p_new)
    return math.ceil((z_a + z_b) ** 2 * var / (p_new - p_base) ** 2)

print(f"z_alpha/2 = {norm.ppf(0.975):.3f}   z_beta = {norm.ppf(0.8):.3f}")
p = 0.05                                    # 5% of restaurant-page visits become an order
for lift in [0.10, 0.05, 0.02]:
    print(f"lift {lift:&gt;4.0%}: {n_per_arm(p, lift):&gt;9,} users per arm")

daily_users = 400_000                       # users who open a restaurant page per day
n = n_per_arm(p, 0.02)
for share in [0.10, 0.50]:
    per_arm_per_day = daily_users * share / 2
    print(f"{share:.0%} of traffic in the test -&gt; {math.ceil(n / per_arm_per_day)} days")</div>
  <div class="fx" data-lang="text">z_alpha/2 = 1.960   z_beta = 0.842
lift  10%:    31,231 users per arm
lift   5%:   122,121 users per arm
lift   2%:   752,700 users per arm
10% of traffic in the test -&gt; 38 days
50% of traffic in the test -&gt; 8 days</div>
  <p>The three "lift" lines show the most important rule in experiment design: halve the effect you want to detect and you need about <strong>four times</strong> as many users, because the difference is squared in the denominator. Detecting a 10% lift needs 31,231 users per group; a 2% lift needs 752,700. The last two lines turn that into calendar time. Biteful has about 400,000 users a day who open a restaurant page. If only 10% of them are in the test, each group gets 20,000 new users a day and needs 38 days. With 50% of traffic in the test it takes 8 days, which the team rounds up to 14 so the test covers two full weeks, because people order differently on weekdays and weekends.</p>
  <p>It is worth convincing yourself that "80% power" is a real promise and not just a formula. The next block simulates thousands of experiments in which v2 truly does raise conversion from 5.0% to 5.1%, and counts how often a standard significance test notices:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.stats import norm

rng = np.random.default_rng(0)
p_c, p_t = 0.050, 0.051                     # the 2% lift is REAL in every simulated test

def detection_rate(n, runs=4_000):
    x_c = rng.binomial(n, p_c, runs)        # orders in control, one number per simulated test
    x_t = rng.binomial(n, p_t, runs)
    pooled = (x_c + x_t) / (2 * n)
    z = (x_t - x_c) / n / np.sqrt(pooled * (1 - pooled) * 2 / n)
    return np.mean(2 * (1 - norm.cdf(np.abs(z))) &lt; 0.05)

for n in [100_000, 300_000, 752_700]:
    print(f"{n:&gt;8,} users per arm: real lift detected in {detection_rate(n):.0%} of tests")</div>
  <div class="fx" data-lang="text"> 100,000 users per arm: real lift detected in 18% of tests
 300,000 users per arm: real lift detected in 42% of tests
 752,700 users per arm: real lift detected in 81% of tests</div>
  <p>With 752,700 users per group, the test catches the real lift in 81% of simulated experiments, matching the 80% the formula promised. With 100,000 users per group, a real improvement is missed in more than four tests out of five. That is why "not significant" from an underpowered test means "we couldn't tell", not "it didn't work".</p>
  <p>Since sample size is so expensive, teams look for ways to reduce the noise instead of adding users. The most widely used is <strong>CUPED</strong> (Controlled-experiment Using Pre-Experiment Data). Much of the variation between users is just habit: someone who ordered ten times last month will probably order a lot this month too, whichever ETA they see. If we know each user's behaviour from before the test started, we can subtract the part of their in-test behaviour that habit predicts, and what remains is much less noisy. Think of judging a fertiliser by plant height: comparing the growth of each plant since you started is far more precise than comparing final heights, because some plants were simply bigger to begin with. The adjustment is <code>adjusted = during − θ × (pre − mean(pre))</code>, where θ (theta) measures how strongly in-test behaviour follows pre-test behaviour.</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(5)
n = 200_000
habit = rng.gamma(1.5, 1.0, n)                      # how much each user likes ordering
pre = rng.poisson(habit * 2)                        # orders in the 4 weeks BEFORE the test
during = rng.poisson(habit * 2)                     # orders during the test (no effect, A/A)

theta = np.cov(pre, during)[0, 1] / pre.var()      # how much 'during' moves with 'pre'
adjusted = during - theta * (pre - pre.mean())     # CUPED-adjusted metric

print(f"theta = {theta:.2f}   correlation(pre, during) = {np.corrcoef(pre, during)[0, 1]:.2f}")
print(f"variance raw {during.var():.2f}  -&gt;  CUPED {adjusted.var():.2f}  "
      f"({1 - adjusted.var() / during.var():.0%} less)")
print(f"mean raw {during.mean():.3f}  -&gt;  CUPED {adjusted.mean():.3f}  (unchanged)")
print(f"users needed for the same power: {adjusted.var() / during.var():.0%} of before")</div>
  <div class="fx" data-lang="text">theta = 0.66   correlation(pre, during) = 0.67
variance raw 8.95  -&gt;  CUPED 4.98  (44% less)
mean raw 2.998  -&gt;  CUPED 2.998  (unchanged)
users needed for the same power: 56% of before</div>
  <p>Here pre-test and in-test orders have a correlation of 0.67, and θ comes out at 0.66. The adjusted metric has the same mean (2.998 orders) but 44% less variance, so the same test now needs only about 56% of the users, or equivalently finishes in about half the time. The saving depends on that correlation: the variance shrinks by a factor of (1 − correlation²), so it works best for metrics where users are consistent, and does nothing for brand-new users with no history. Because the pre-test data was recorded before anyone was assigned, it cannot be affected by the treatment, which is why the adjustment does not bias the result.</p>

  <h2 id="se-srm"><span class="num">05</span>Sample Ratio Mismatch</h2>
  <p>Two weeks later the ETA test's dashboard is ready. Before reading a single business metric, an experienced analyst looks at one boring number: how many users ended up in each group. The test was designed as 50/50, so the groups should be <em>about</em> equal. If they are off by more than chance allows, something in the pipeline is broken, and the result cannot be trusted no matter how good it looks.</p>
  <p>This problem is called a <strong>sample ratio mismatch</strong> (SRM): the observed split differs from the designed split by more than random variation can explain. Typical causes are a treatment version that crashes for some users before it logs an exposure, a bot filter that removes users from one group only, a redirect that loses slow phones, or a bug in the assignment code. In every case, the users who went missing are not a random sample, so the two groups are no longer alike, and the core promise of the A/B test (the groups differ only in the model) is broken. Picture a school trip of 1,000 students in two buses of 500. At the destination one bus has 470. You do not start the picnic; you first find out where those 30 children got off, because they did not vanish at random.</p>
  <p>To decide whether a difference in group sizes is "more than chance", we use a <strong>chi-square (χ²) test</strong>, which compares observed counts with expected counts: χ² = Σ (observed − expected)² / expected. A large χ² means the observed counts are far from what we expected, and the test turns it into a p-value.</p>
  <div class="fx" data-lang="py">from scipy.stats import chisquare

def srm_check(n_control, n_treatment, expected_share=0.5):
    total = n_control + n_treatment
    expected = [total * (1 - expected_share), total * expected_share]
    return chisquare([n_control, n_treatment], f_exp=expected)

for c, t in [(500_400, 499_600), (1_008_000, 992_000), (50_800, 49_200)]:
    stat, p = srm_check(c, t)
    flag = "SRM! stop" if p &lt; 0.001 else "ok"
    print(f"{c:&gt;9,} vs {t:&gt;9,}  share={t/(c+t):.4f}  chi2={stat:6.1f}  p={p:.2e}  {flag}")</div>
  <div class="fx" data-lang="text">  500,400 vs   499,600  share=0.4996  chi2=   0.6  p=4.24e-01  ok
1,008,000 vs   992,000  share=0.4960  chi2= 128.0  p=1.12e-29  SRM! stop
   50,800 vs    49,200  share=0.4920  chi2=  25.6  p=4.20e-07  SRM! stop</div>
  <p>Trace the middle row by hand. With 2,000,000 users the expected split is 1,000,000 each. Control is 8,000 over and treatment 8,000 under, so χ² = 8,000²/1,000,000 + 8,000²/1,000,000 = 64 + 64 = 128. A χ² of 128 has a p-value of about 10<sup>−29</sup>, which means it is practically impossible by luck. A 49.6% share sounds harmless, but with two million users it is a clear sign of a bug. The first row, 49.96%, is ordinary noise, and the third row shows that even a smaller test (100,000 users) flags a 49.2% share. Platforms use a strict cut-off, typically p &lt; 0.001, because they check hundreds of experiments and do not want false SRM alarms every week. When SRM fires, the rule is simple: do not read the results, find the cause, fix it and restart. A large effect does not excuse an SRM; it may even be caused by it.</p>

  <h2 id="se-peek"><span class="num">06</span>Peeking and Novelty Effects</h2>
  <p>The split is healthy. The next danger comes from people, not code. The test was planned for 14 days, but the dashboard updates every morning, and someone looks every day and stops the test the first time the p-value drops below 0.05. It feels harmless, since each look uses a valid test, but it is not. Every look is another chance for random noise to cross the significance line, and stopping at the first crossing means you keep the lucky moments and ignore the rest. This is the <strong>peeking problem</strong>. The simulation below runs 2,000 experiments in which A and B are <em>exactly the same</em>, so every declared winner is a false positive:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.stats import norm

rng = np.random.default_rng(1)
n_tests, days, per_day, p = 2_000, 14, 2_000, 0.05   # A and B are IDENTICAL
fp_end = fp_peek = 0
for _ in range(n_tests):
    a = rng.binomial(per_day, p, days).cumsum()      # running orders per arm
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
  <p>In the code, <code>cumsum()</code> builds the running totals a person would see each morning, and <code>pvals</code> holds one p-value per day. Looking once at the end gives about 5% false winners, as promised (5.8% is simulation noise). Stopping at the first daily p &lt; 0.05 gives 23.3%: nearly one in four "winning" launches would be changes that did nothing. There are two standard fixes. The simple one is to fix the sample size and duration in advance, as the previous section did, and only read the decision metric at the end. The other is to use a <strong>sequential test</strong>, a method designed for continuous monitoring (for example, always-valid p-values or group-sequential boundaries), which raises the bar for early looks so the overall false-positive rate stays at 5%. Many platforms show sequential results on their dashboards precisely so that looking every day is safe.</p>
  <p>A related reason not to stop early is the <strong>novelty effect</strong>: users react to something simply because it is new. When v2 starts showing shorter ETAs, some customers notice and order out of curiosity; after a week the change is familiar and the extra excitement fades. The opposite, a <strong>primacy effect</strong>, happens when users initially resist a change because they are used to the old version, and warm to it later. Either way the effect in the first days is not the effect you will live with. The simulation gives the treatment a lasting lift of 0.10 points plus a curiosity boost that fades over a few days:</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(11)
visits, base = 400_000, 0.050                  # visits per arm per day; control conversion
lasting = 0.0010                               # the effect that stays: +0.10 points
daily = []
for day in range(1, 15):
    novelty = 0.0040 * np.exp(-(day - 1) / 2.5)          # curiosity boost that fades
    c = rng.binomial(visits, base)
    t = rng.binomial(visits, base + lasting + novelty)
    daily.append((t - c) / visits)
daily = np.array(daily)
for day in (1, 2, 3, 5, 7, 10, 14):
    print(f"day {day:&gt;2}: daily lift {daily[day-1]:+.2%}   running average {daily[:day].mean():+.2%}")
print(f"week 1 average {daily[:7].mean():+.2%}   week 2 average {daily[7:].mean():+.2%}")</div>
  <div class="fx" data-lang="text">day  1: daily lift +0.58%   running average +0.58%
day  2: daily lift +0.42%   running average +0.50%
day  3: daily lift +0.33%   running average +0.44%
day  5: daily lift +0.31%   running average +0.39%
day  7: daily lift +0.18%   running average +0.32%
day 10: daily lift +0.06%   running average +0.25%
day 14: daily lift +0.05%   running average +0.21%
week 1 average +0.32%   week 2 average +0.10%</div>
  <p>On day 1 the daily lift is +0.58 points, almost six times the lasting effect, and by day 14 it has settled to about +0.05 to +0.10. A team that stopped after three days would report +0.44 points; even the full 14-day average (+0.21) still carries some of the early excitement. The week-2 average, +0.10, is the honest estimate of what v2 will do long-term. In practice teams run full weeks, plot the effect day by day to see whether it is decaying, compare new users (for whom nothing is "new") with returning users, and for big changes keep a small <strong>holdout</strong> group on the old version for weeks or months after launch to measure the long-run effect.</p>

  <h2 id="se-metrics"><span class="num">07</span>Primary Metrics and Guardrails</h2>
  <p>An experiment platform measures dozens of numbers for every test, and some will go up while others go down. If the team only decides afterwards which number matters, every result can be argued either way: "conversion is up, ship it" or "cancellations are up, kill it". The defence is to write down, <em>before</em> the test starts, a <strong>metrics hierarchy</strong>: which metric decides, which ones explain, and which ones are not allowed to get worse.</p>
  <table class="tbl">
    <tr><th>Level</th><th>Role</th><th>Biteful ETA test</th></tr>
    <tr><td>North star</td><td>the long-term goal; too slow to move in two weeks</td><td>retained, satisfied customers (orders per customer per month)</td></tr>
    <tr><td>Primary</td><td>the one metric that decides the test</td><td>conversion (visits that become orders)</td></tr>
    <tr><td>Secondary</td><td>explains why the primary moved</td><td>late rate, average ETA shown, MAE</td></tr>
    <tr><td>Guardrails</td><td>must not get worse, whatever the primary does</td><td>cancellations (at most +0.25 points), p99 latency, support contacts</td></tr>
  </table>
  <p>The <strong>primary metric</strong> is the single number the test is designed and sized for. The <strong>guardrail metrics</strong> protect the business and the user from damage that the primary metric cannot see: a model that raises conversion by breaking promises, or one that slows the app down. Think of the railings on a mountain road: they do not help you get to the top faster, but if the car touches one you stop and check before going on. Here is the readout of the ETA test, 400,000 visits per group over two weeks. The counts are the experiment's inputs; the code computes each difference with a 95% confidence interval using a two-proportion z-test (explained in <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>) and applies the pre-registered decision rule:</p>
  <div class="fx" data-lang="py">import math
from scipy.stats import norm

def compare(name, x_c, n_c, x_t, n_t):
    # two-proportion z-test and a 95% confidence interval for the difference
    pc, pt = x_c / n_c, x_t / n_t
    pooled = (x_c + x_t) / (n_c + n_t)
    z = (pt - pc) / math.sqrt(pooled * (1 - pooled) * (1 / n_c + 1 / n_t))
    se = math.sqrt(pc * (1 - pc) / n_c + pt * (1 - pt) / n_t)
    lo, hi = (pt - pc) - 1.96 * se, (pt - pc) + 1.96 * se
    p = 2 * (1 - norm.cdf(abs(z)))
    print(f"{name:&lt;22} control {pc:6.2%}  treatment {pt:6.2%}  diff {pt-pc:+.2%} "
          f"[{lo:+.2%}, {hi:+.2%}]  p={p:.3g}")
    return pt - pc, lo, hi

# Two weeks of ETA v2 (no buffer) vs v1 (buffered); counts from the metric pipeline
conv = compare("conversion (primary)", 20_000, 400_000, 20_560, 400_000)
late = compare("late orders", 4_200, 20_000, 9_250, 20_560)
canc = compare("cancellations (guard)", 400, 20_000, 640, 20_560)

GUARD_CANCEL = 0.0025      # cancellations may rise by at most 0.25 percentage points
ship = conv[1] &gt; 0 and canc[2] &lt;= GUARD_CANCEL
print("primary significant and positive:", conv[1] &gt; 0)
print("guardrail safe (CI upper end &lt;= +0.25 pts):", canc[2] &lt;= GUARD_CANCEL)
print("decision:", "SHIP" if ship else "DO NOT SHIP")</div>
  <div class="fx" data-lang="text">conversion (primary)   control  5.00%  treatment  5.14%  diff +0.14% [+0.04%, +0.24%]  p=0.00432
late orders            control 21.00%  treatment 44.99%  diff +23.99% [+23.11%, +24.87%]  p=0
cancellations (guard)  control  2.00%  treatment  3.11%  diff +1.11% [+0.81%, +1.42%]  p=1.35e-12
primary significant and positive: True
guardrail safe (CI upper end &lt;= +0.25 pts): False
decision: DO NOT SHIP</div>
  <p>Read the output in the order of the hierarchy. The primary metric, conversion, rose from 5.00% to 5.14%, with a confidence interval of +0.04 to +0.24 points that does not include zero: shorter ETAs genuinely attract more orders. The secondary metric explains the cost: late orders jumped from 21% to 45%. The guardrail then decides the outcome. Cancellations rose from 2.00% to 3.11%, and even the low end of the interval (+0.81 points) is far above the +0.25 limit. The decision rule requires the whole interval to stay inside the guardrail, so the answer is <strong>do not ship</strong>, even though the primary metric won. The secondary metrics also point to a better design: keep v2's accuracy but promise a higher <em>quantile</em> of delivery time rather than the middle, which is exactly what the ETA case in <a class="xref" data-note="sd_cases">Case Studies</a> does before testing again.</p>
  <p>When a guardrail is breached in the middle of a test, the rollback must be fast and complete. Fast means the old model is still loaded and warm, and switching traffic back is a <strong>feature flag</strong> change (a configuration value the servers read at runtime) that takes effect in seconds, not a 45-minute rebuild and redeploy. Many platforms wire this up as an <strong>auto-rollback</strong>: a rule that sets treatment traffic to 0% automatically when a guardrail crosses its threshold, then alerts a person. Complete means rolling back everything that changed together; if v2 came with a new version of the feature pipeline, an old model fed new features is a third, untested system.</p>

  <h2 id="se-inter"><span class="num">08</span>Interleaving</h2>
  <p>The ETA test needed 400,000 visits per group for two weeks. Biteful's "fastest delivery" row on the home screen is a <em>ranking</em> of restaurants, and the team has ten candidate ranking models. Ten A/B tests of that size would take most of a year. The root of the problem is noise between people: one user orders every day and another never orders, so a small difference between two rankers is buried under huge person-to-person variation.</p>
  <p><strong>Interleaving</strong> removes that variation by letting each user compare the two rankers themselves. Instead of showing half the users ranker A's list and the other half ranker B's, every user sees <em>one</em> list made by merging both rankers' results. Each item remembers which ranker contributed it, and when the user orders from an item, that ranker gets the credit. Because the same person is judging both rankers at the same moment, their personal habits cancel out. The most common merging method is <strong>team-draft interleaving</strong>, and it works exactly like picking teams for a game of street cricket: two captains toss a coin to see who picks first, then take turns choosing their best remaining player, and at the end you see whose picks scored the runs. In each round we flip a coin for who picks first, and each ranker adds its highest-ranked restaurant that is not already in the list, until the list is full. Below, ranker A sorts the row by v1 ETA and ranker B by v2 ETA blended with rating:</p>
  <div class="fx" data-lang="py">import random
from scipy.stats import binomtest

def team_draft(a, b, k, seed):
    rng, shown, team = random.Random(seed), [], {}
    while len(shown) &lt; k:
        order = ["A", "B"] if rng.random() &lt; 0.5 else ["B", "A"]  # coin flip per round
        for t in order:
            ranking = a if t == "A" else b
            pick = next(d for d in ranking if d not in team)   # its best item not yet shown
            shown.append(pick); team[pick] = t
            if len(shown) == k: break
    return shown, team

# "Fast delivery" row: A sorts by v1 ETA, B by v2 ETA blended with rating
ranker_a = ["Dosa Hut", "Idli House", "Biryani Bros", "Pizza Point", "Chai Corner"]
ranker_b = ["Biryani Bros", "Dosa Hut", "Thali Bar", "Momo Stop", "Idli House"]
shown, team = team_draft(ranker_a, ranker_b, k=4, seed=7)
print("shown :", [f"{d}({team[d]})" for d in shown])
orders = ["Biryani Bros", "Thali Bar"]
print("orders credited to:", [team[d] for d in orders])

# Many sessions: drop ties, test B's share of decided sessions against 50/50
wins_b, wins_a, ties = 560, 440, 1_500
p = binomtest(wins_b, wins_b + wins_a, 0.5).pvalue
print(f"B preferred in {wins_b/(wins_a+wins_b):.0%} of decided sessions, p={p:.4f}")</div>
  <div class="fx" data-lang="text">shown : ['Dosa Hut(A)', 'Biryani Bros(B)', 'Idli House(A)', 'Thali Bar(B)']
orders credited to: ['B', 'B']
B preferred in 56% of decided sessions, p=0.0002</div>
  <p>Trace the merge. In round 1, A picks first and takes its top choice, Dosa Hut; B's top choice, Biryani Bros, is still free, so B takes it. In round 2, A's next unused restaurant is Idli House; B's next is Dosa Hut, already taken, so B takes Thali Bar. The user ordered from Biryani Bros and Thali Bar, both contributed by B, so B wins this session. Over many sessions we count who won each one and ignore ties (sessions with no orders, or equal credit). Here B won 560 decided sessions and A won 440, and a binomial test against an even 50/50 split gives p = 0.0002: a clear preference from only 1,000 decided sessions. Published comparisons from search and streaming companies report interleaving to be roughly 10 to 100 times more sensitive than an A/B test for detecting which ranker users prefer.</p>
  <p>The limitation is that interleaving tells you which ranker users <em>prefer</em>, not how much revenue or retention a full switch would bring, and it only works for things that produce a list. So the usual workflow is to screen many candidate rankers quickly with interleaving, then confirm the winner with a normal A/B test on business metrics and guardrails. More on ranking evaluation is in <a class="xref" data-note="ml_rs_ranking">Ranking &amp; Evaluation</a>.</p>

  <h2 id="se-loops"><span class="num">09</span>Feedback Loops and Exploration</h2>
  <p>Everything so far assumed the logged data is a fair record of the world. But the logs of an ML product are a record of what <em>the model chose to show</em>, and tomorrow's model is trained on them. Consider Biteful's Kothrud neighbourhood row, which shows the top 3 of 10 restaurants. Customers can only order from restaurants they are shown, so only those three earn labels. Restaurant #9 opened last week: it has no history, so its estimated order rate is 0, so it never reaches the top 3, so it never earns an order, so its estimate stays 0. Yet it is actually the best restaurant in the area, with a true order rate of 12%. The simulation runs 20,000 sessions twice, once with no exploration and once where, 10% of the time, the third slot shows a randomly chosen other restaurant:</p>
  <div class="fx" data-lang="py">import numpy as np

# 10 restaurants in Kothrud; true chance a customer orders when it is shown in the top 3
true = np.array([.10, .09, .08, .07, .07, .06, .06, .05, .05, .12])   # #9 is new AND the best
hist_shown = np.array([500] * 9 + [0])                                 # #9 has no history
hist_orders = np.round(true * hist_shown); hist_orders[:9] += [5, 4, 2, 0, 1, 0, 2, 0, 1]

def run(eps, sessions=20_000, seed=0):
    rng = np.random.default_rng(seed)
    shown, orders = hist_shown.astype(float).copy(), hist_orders.astype(float).copy()
    for _ in range(sessions):
        est = np.where(shown &gt; 0, orders / np.maximum(shown, 1), 0.0)   # never shown -&gt; estimate 0
        top = list(np.argsort(-est)[:3])
        if rng.random() &lt; eps:                                          # exploration slot
            top[2] = rng.choice([r for r in range(10) if r not in top[:2]])
        for r in top:
            shown[r] += 1
            orders[r] += rng.random() &lt; true[r]     # labels exist ONLY for what we showed
    est = orders / np.maximum(shown, 1)
    return shown, est, orders.sum() - hist_orders.sum()

for eps in [0.0, 0.1]:
    shown, est, gained = run(eps)
    print(f"explore {eps:.0%}: #9 shown {int(shown[9]):&gt;6,} times, estimate {est[9]:.3f} "
          f"(true 0.120), top 3 now {np.argsort(-est)[:3].tolist()}, orders {int(gained):,}")</div>
  <div class="fx" data-lang="text">explore 0%: #9 shown      0 times, estimate 0.000 (true 0.120), top 3 now [0, 1, 2], orders 5,392
explore 10%: #9 shown 14,889 times, estimate 0.119 (true 0.120), top 3 now [9, 0, 1], orders 6,008</div>
  <p>Without exploration, restaurant #9 is shown <strong>zero</strong> times in 20,000 sessions. Its estimate stays at 0, and the model grows more and more confident in restaurants 0, 1 and 2, because they are the only ones generating data. With 10% exploration, #9 gets a chance, its estimated rate climbs to 0.119 (true value 0.120), it becomes the number-one restaurant, and total orders rise from 5,392 to 6,008, about 11% more. Spending a few slots on "unproven" restaurants paid for itself many times over.</p>
  <figure class="viz"><svg viewBox="0 0 640 196" width="640" role="img"><defs><marker id="se-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="30" y="20" width="180" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="120" y="46" text-anchor="middle" font-weight="600">Model ranks items</text><rect x="430" y="20" width="180" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="520" y="46" text-anchor="middle" font-weight="600">Users see top items</text><rect x="430" y="130" width="180" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="520" y="149" text-anchor="middle" font-weight="600">Clicks logged</text><text x="520" y="163" text-anchor="middle" class="tm">only on shown items</text><rect x="30" y="130" width="180" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="120" y="156" text-anchor="middle" font-weight="600">Training data</text><line x1="212" y1="42" x2="427" y2="42" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="520" y1="66" x2="520" y2="127" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="428" y1="152" x2="213" y2="152" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="120" y1="128" x2="120" y2="67" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><text x="320" y="96" text-anchor="middle" class="tr" font-weight="600">degenerate loop:</text><text x="320" y="112" text-anchor="middle" class="tr">unshown items never earn data</text></svg><figcaption>The model creates its own training data. Without exploration it keeps confirming its past choices.</figcaption></figure>
  <p>Follow the arrows around the figure. The model ranks restaurants, users see only the top ones, clicks and orders are logged only for what was shown, and that log becomes the next training set. This cycle is a <strong>feedback loop</strong>, and when it reinforces its own mistakes, as with restaurant #9, it is called a <strong>degenerate feedback loop</strong>. Picture a cricket selector who only watches the players he already picked: he never sees anyone else play, so he keeps picking the same team and feels more confident every season. The remedy is <strong>exploration</strong>: deliberately showing options the model is unsure about, to collect labels for them. Note the trap in "the model is getting more confident": in the 0% run confidence grew every day while the best restaurant stayed invisible.</p>
  <p>Feedback loops are not only a recommendation problem. Biteful's ETA has two: customers who see "55 minutes" and leave never create a label, so long-wait situations are under-represented in training; and riders who see a tight promise hurry, making the ETA partly self-fulfilling. Fraud detection has the nastiest version, because a blocked payment never completes, so you never learn whether blocking it was right. The usual mitigations are to log what was shown (and its predicted score) alongside the outcome, to reserve a small randomised slice of traffic for exploration or for letting borderline cases through, and to reweight training examples by how likely they were to be shown, which is called <strong>inverse propensity weighting</strong>.</p>

  <h2 id="se-bandit"><span class="num">10</span>Multi-Armed Bandits</h2>
  <p>A 10% random exploration slot worked, but it is blunt: it keeps spending slots on restaurants we already know are poor. A plain A/B test has the same waste on a larger scale. Suppose marketing wants to choose between three promotional banners. An A/B/C test gives each banner a third of the traffic until the end, so two-thirds of customers see a worse banner for the whole test. The opposite extreme, always showing whichever banner currently looks best, may lock onto a lucky early leader and never discover the real winner. The value lost by not always showing the best option has a name, <strong>regret</strong>: the clicks you missed compared with an oracle that knew the best banner from the start.</p>
  <p>A <strong>multi-armed bandit</strong> is an algorithm that balances these two needs, learning which option is best (exploration) while mostly using the best option found so far (exploitation). It starts by trying every option and shifts traffic toward the winner as evidence builds up. The name comes from slot machines, nicknamed "one-armed bandits": facing a row of machines with unknown payouts, which arm should you pull next? It is how a new office worker chooses lunch places: in the first week she tries all three, by the third week she goes to the good one most days, but she still tries the others occasionally in case they improved.</p>
  <p>The most popular bandit algorithm is <strong>Thompson sampling</strong>. For each banner we keep a count of clicks (wins) and non-clicks (losses). For every visitor, we draw one plausible click rate for each banner from a Beta(wins, losses) distribution, a probability distribution that describes what we believe a rate could be given those counts, and show the banner with the highest draw. With little data the distribution is wide, so a banner sometimes draws high and still gets tried; with lots of data it is narrow, so a banner that is truly good draws high almost every time and wins most visitors. Exploration therefore happens automatically where the uncertainty is, and fades as the uncertainty disappears.</p>
  <div class="fx" data-lang="py">import numpy as np

true_ctr = [0.040, 0.050, 0.065]          # three promo banners; nobody knows these
n_users = 30_000

def ab_test(rng):
    arms = rng.integers(0, 3, n_users)    # fixed equal split
    clicks = rng.random(n_users) &lt; np.take(true_ctr, arms)
    return clicks.sum(), np.bincount(arms, minlength=3)

def thompson(rng):
    wins = np.ones(3); losses = np.ones(3)     # Beta(1,1) prior per banner
    shown = np.zeros(3, int); total = 0
    for _ in range(n_users):
        arm = np.argmax(rng.beta(wins, losses))   # draw a plausible CTR per banner, pick the max
        click = rng.random() &lt; true_ctr[arm]
        wins[arm] += click; losses[arm] += 1 - click
        shown[arm] += 1; total += click
    return total, shown

rng = np.random.default_rng(42)
c_ab, s_ab = ab_test(rng)
c_ts, s_ts = thompson(rng)
best = n_users * max(true_ctr)
print("A/B      clicks:", c_ab, " shown per banner:", s_ab.tolist(), " regret:", round(best - c_ab))
print("Thompson clicks:", c_ts, " shown per banner:", s_ts.tolist(), " regret:", round(best - c_ts))</div>
  <div class="fx" data-lang="text">A/B      clicks: 1572  shown per banner: [10049, 10028, 9923]  regret: 378
Thompson clicks: 1920  shown per banner: [338, 865, 28797]  regret: 30</div>
  <p>The best possible result is 30,000 visitors × 6.5% = 1,950 clicks. The fixed three-way split shows each banner to about 10,000 people and loses 378 clicks. Thompson sampling notices quickly that banner 3 is best, shows it 28,797 times, and loses only 30. The single line <code>arm = np.argmax(rng.beta(wins, losses))</code> is the whole algorithm; the line after it updates the counts. Two simpler bandits are worth naming. <strong>ε-greedy</strong> (epsilon-greedy) shows the current best option, except that with probability ε it shows a random one, which is exactly the 10% exploration slot of the previous section. <strong>UCB</strong> (upper confidence bound) picks the option with the highest "average plus an uncertainty bonus", so rarely tried options get a boost.</p>
  <table class="tbl">
    <tr><th></th><th>A/B test</th><th>Multi-armed bandit</th></tr>
    <tr><td>Traffic</td><td>fixed split until the end</td><td>shifts toward the winner</td></tr>
    <tr><td>Goal</td><td>a clean, unbiased estimate of the effect</td><td>maximise reward while learning</td></tr>
    <tr><td>Regret</td><td>higher (378 above)</td><td>lower (30 above)</td></tr>
    <tr><td>Best for</td><td>launch decisions, slow metrics (the ETA model)</td><td>banners, headlines, exploration slots, short-lived options</td></tr>
  </table>
  <p>The table explains why bandits do not replace A/B tests. Because a bandit's traffic is uneven and changes over time, its estimate of how much better the winner is comes out biased, and it optimises a quick reward (clicks) without ever measuring slow outcomes like cancellations or retention next month. So the rule of thumb is: bandits <em>optimise</em> among many short-lived options; A/B tests <em>decide</em> whether a change ships. When the best option depends on who the user is (a banner that works for students but not for families), the extension is a <strong>contextual bandit</strong>, which feeds user features into the choice.</p>

  <h2 id="se-mistakes"><span class="num">11</span>Common Mistakes</h2>
  <p>A very common shortcut is to assign groups with <code>user_id % 2</code>: odd ids get treatment, even ids get control. It looks random, but it is the same rule for every experiment, so the same half of the users receives every risky change, and the effects of overlapping experiments pile on top of each other. Sequential ids also track sign-up date, so one half might be systematically older, more loyal users. Compare it with the salted hash from earlier:</p>
  <div class="fx" data-lang="py">users = range(100_000)

# Mistake: user_id % 2 for every experiment -&gt; the SAME half is treated everywhere
both_mod = sum(u % 2 == 1 and u % 2 == 1 for u in users)        # exp A and exp B use the same rule
both_hash = sum(assign(str(u), "eta_v2", 50) == "treatment" and
                assign(str(u), "promo_banner", 50) == "treatment" for u in users)
print(f"treated in both tests with id % 2 : {both_mod:,}  (every treated user)")
print(f"treated in both tests with salted hash: {both_hash:,}  (about a quarter)")</div>
  <div class="fx" data-lang="text">treated in both tests with id % 2 : 50,000  (every treated user)
treated in both tests with salted hash: 24,887  (about a quarter)</div>
  <p>With <code>% 2</code>, all 50,000 treated users in one experiment are also treated in the other, so neither experiment can separate its effect from the other's. With the salted hash, about a quarter of users are in both treatments, exactly what independent splits should give.</p>
  <p>The second mistake is analysing every assigned user instead of the users who were actually exposed. If only 20% of assigned users ever reach a screen that shows an ETA, the other 80% add pure noise and pull the measured effect toward zero:</p>
  <div class="fx" data-lang="py">import math
import numpy as np

rng = np.random.default_rng(2)
n = 1_000_000                                   # users assigned per arm
exposed = rng.random((2, n)) &lt; 0.20             # only 20% ever reach a restaurant card
base, lift = 0.05, 0.004                        # +0.4 pts, but ONLY for exposed treatment users
conv_c = rng.random(n) &lt; base
conv_t = rng.random(n) &lt; base + lift * exposed[1]

def z(a, b):
    pa, pb = a.mean(), b.mean(); p = (a.sum() + b.sum()) / (len(a) + len(b))
    return (pb - pa) / math.sqrt(p * (1 - p) * (1 / len(a) + 1 / len(b)))

print(f"all assigned users : diff {conv_t.mean() - conv_c.mean():+.3%}  z = {z(conv_c, conv_t):.1f}")
ec, et = conv_c[exposed[0]], conv_t[exposed[1]]
print(f"exposed users only : diff {et.mean() - ec.mean():+.3%}  z = {z(ec, et):.1f}")</div>
  <div class="fx" data-lang="text">all assigned users : diff +0.040%  z = 1.3
exposed users only : diff +0.352%  z = 5.1</div>
  <p>The real effect among exposed users is about +0.35 points and is clearly significant (z = 5.1). Measured over everyone assigned, the same experiment shows +0.04 points with z = 1.3, which is not significant, so the team would wrongly conclude the model does nothing. Log exposure at the moment the change is visible, and analyse exposed users (taking care to log exposure the same way in both groups, so the comparison stays fair).</p>
  <p>The third mistake is checking many metrics and celebrating whichever one turned out significant. Each metric tested at 5% has a 5% chance of a false alarm, and those chances add up:</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(4)
tests, metrics = 2_000, 20                  # A/A tests: nothing really changed
p = rng.random((tests, metrics))            # under no effect, each p-value is uniform on [0, 1]
print(f"A/A tests with at least one 'significant' metric out of 20: {np.mean((p &lt; 0.05).any(axis=1)):.0%}")
print(f"theory: 1 - 0.95**20 = {1 - 0.95**20:.0%}")</div>
  <div class="fx" data-lang="text">A/A tests with at least one 'significant' metric out of 20: 64%
theory: 1 - 0.95**20 = 64%</div>
  <p>In A/A tests, where nothing changed at all, 64% show at least one "significant" metric out of twenty. This is why the primary metric is chosen before the test, and why secondary metrics are used to explain the result rather than to rescue it. If several metrics must count, correct for it (for example, by dividing α by the number of metrics, the Bonferroni correction).</p>
  <p>Beyond these, the mistakes covered earlier in the note come up constantly: shipping on an offline win (v2's better MAE hid a 50% late rate), assigning per request instead of per user, launching a test with no sample-size plan, ignoring a sample ratio mismatch, stopping on the first significant day, ignoring interference when users share riders or inventory, and using a bandit to make a launch decision it cannot measure properly.</p>

  <h2 id="se-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why test online</h3>
  <ul>
    <li><b>Offline evaluation</b>: scoring on logged past data. Cheap and safe, but cannot show how people react.</li>
    <li>Biteful: v2 MAE 1.27 vs v1 3.15, but v2 late 50% vs 0% and shows ETAs 3 minutes shorter.</li>
    <li><b>Rollout ladder</b>: offline → shadow (0% served) → canary (1–5%) → A/B (10–50%) → ramp (25 → 50 → 100%).</li>
    <li><b>Champion</b> = current model; <b>challenger</b> = new model.</li>
  </ul>
  <h3>A/B machinery</h3>
  <ul>
    <li><b>Control</b> = old version; <b>treatment</b> = new version; random assignment makes the difference causal.</li>
    <li><b>Exposure</b>: logged when the user actually sees the change; analyse exposed users.</li>
    <li><b>Unit of randomisation</b>: usually the user; zone or time slot (<b>switchback</b>) when users interfere with each other.</li>
    <li><b>Hash bucketing</b>: <code>int(md5(f"{exp}:{user}")[:8], 16) % 1000</code>; treatment if bucket &lt; pct × 10. Salted per experiment; ramping only adds users.</li>
    <li><b>Layers</b>: mutually exclusive experiments share one layer's buckets; independent ones use separate salts.</li>
  </ul>
  <h3>Formulas and numbers</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Biteful value</th></tr>
    <tr><td>n = (z<sub>α/2</sub> + z<sub>β</sub>)² [p₁(1−p₁) + p₂(1−p₂)] / (p₂ − p₁)²</td><td>5% → 5.1%: 752,700 per arm; 8 days at 50% traffic, run 14</td></tr>
    <tr><td>halve the MDE → ×4 users</td><td>10% lift 31,231; 5% 122,121; 2% 752,700</td></tr>
    <tr><td>CUPED: y − θ(x − x̄), θ = cov(x, y)/var(x)</td><td>variance −44% (correlation 0.67)</td></tr>
    <tr><td>SRM: χ² = Σ (obs − exp)² / exp, stop if p &lt; 0.001</td><td>1,008,000 vs 992,000: 64 + 64 = 128</td></tr>
    <tr><td>peeking daily for 14 days</td><td>5.8% → 23.3% false winners</td></tr>
    <tr><td>diff ± 1.96 × √(p<sub>c</sub>(1−p<sub>c</sub>)/n<sub>c</sub> + p<sub>t</sub>(1−p<sub>t</sub>)/n<sub>t</sub>)</td><td>conversion +0.14 [+0.04, +0.24]; cancellations +1.11 [+0.81, +1.42]</td></tr>
    <tr><td>regret = best possible − achieved</td><td>A/B 378, Thompson 30</td></tr>
  </table>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Answers</th><th>Use when</th></tr>
    <tr><td>Shadow / canary</td><td>does it run? is it broken?</td><td>before any A/B</td></tr>
    <tr><td>A/B test</td><td>does it cause a better outcome?</td><td>launch decisions</td></tr>
    <tr><td>Switchback</td><td>same, with interference</td><td>marketplaces, shared riders</td></tr>
    <tr><td>Interleaving</td><td>which ranker do users prefer?</td><td>screening many rankers fast</td></tr>
    <tr><td>Bandit</td><td>which option earns most, while learning?</td><td>many short-lived options</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>"Not significant" from an underpowered test means "couldn't tell" (100k per arm catches the 2% lift only 18% of the time).</li>
    <li>SRM first; never read results from a broken split.</li>
    <li>Fix the duration or use sequential tests; run full weeks; watch for novelty (day 1 +0.58 vs lasting +0.10).</li>
    <li>Pre-register primary and guardrails; whole guardrail CI must stay inside the limit; rollback by feature flag.</li>
    <li>Interleaving measures preference, not revenue; confirm with A/B.</li>
    <li>Without exploration the best new restaurant was shown 0 times; bandits optimise, A/B tests decide.</li>
  </ul>

  <h2 id="se-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Your new model beats the old one offline. Why not just ship it?</summary><div class="qa-body">Offline data was generated by the old system and cannot show how users react to the new one. The offline metric is a proxy and can move against the real goal: Biteful's v2 had better MAE but was late on half the orders. Offline wins decide what is worth testing; an online A/B test decides what ships.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shadow vs canary vs A/B: what does each prove?</summary><div class="qa-body">A shadow deployment runs the model on mirrored live traffic without serving its answers, proving it works and is fast enough with zero user impact. A canary serves it to a small share of users to catch crashes and obvious damage. Only the A/B test, with a properly sized random control group, measures whether it causes a better business outcome.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you assign users to experiment groups?</summary><div class="qa-body">Hash the user id salted with the experiment name, take it modulo a number of buckets (say 1,000), and map bucket ranges to variants. It is deterministic, needs no storage, is the same on every server, spreads users evenly, gives independent splits across experiments, and ramping just widens the bucket range so nobody flips back.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why salt the hash with the experiment name?</summary><div class="qa-body">Without a salt every experiment would put the same users in treatment. The same people would carry every risky change, and the effects of overlapping experiments would be confounded. With a salt, being in treatment in one experiment tells you nothing about another.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is the user the wrong unit of randomisation?</summary><div class="qa-body">When users affect each other (interference). In a delivery marketplace, an ETA or pricing change for treatment users changes how riders are dispatched, and the same riders serve control users. Randomise whole zones, or alternate a zone between versions in time slots (a switchback test). Social features and shared inventory have the same issue.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Base conversion is 5%. How many users per arm to detect a 2% relative lift?</summary><div class="qa-body">n = (1.96 + 0.84)² × (0.05·0.95 + 0.051·0.949) / 0.001² ≈ 752,700 per arm at 5% significance and 80% power. With 400,000 eligible users a day and half of them in the test, that is 8 days; run 14 to cover two full weeks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to sample size if you want to detect half the effect?</summary><div class="qa-body">It roughly quadruples, because the effect size is squared in the denominator of the formula. That is why picking a realistic minimum detectable effect is one of the most important decisions in experiment design.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is CUPED and why does it help?</summary><div class="qa-body">CUPED adjusts each user's in-test metric using their pre-experiment value: y − θ(x − mean(x)), with θ = cov(x, y)/var(x). It removes variation explained by habit, reducing variance by a factor of about (1 − correlation²), so the same test needs fewer users or less time. Since the pre-period happened before assignment, it does not bias the estimate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a sample ratio mismatch and what do you do when you see one?</summary><div class="qa-body">The observed split differs from the designed one by more than chance, detected with a chi-square test (typically flagged at p &lt; 0.001). It means users went missing non-randomly, for example from crashes, bot filters or logging bugs, so the groups are no longer comparable. Do not interpret the results; find the cause, fix it and rerun.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A PM checks the dashboard daily and wants to stop as soon as p &lt; 0.05. What do you say?</summary><div class="qa-body">Repeated looks inflate false positives: in a simulation with identical A and B and 14 daily looks, 23% of tests "won" instead of 5%. Either fix the duration in advance and decide only at the end, or use a sequential testing method built for continuous monitoring.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Treatment is +3% on day 2 and +0.5% on day 14. What is happening?</summary><div class="qa-body">Most likely a novelty effect: users engage with something because it is new, and the extra engagement fades. Run full weekly cycles, plot the effect by day, compare new and returning users, and trust the later, stable period. For big launches keep a long-term holdout to measure the lasting effect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Conversion is significantly up but cancellations are up too. Do you ship?</summary><div class="qa-body">Not if cancellations breach the pre-registered guardrail. In Biteful's test conversion rose 0.14 points but cancellations rose 1.11 points against a 0.25-point limit, so the answer was no. The secondary metrics (late rate) pointed to the fix: promise a higher quantile, then test again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What guardrails would you set for a new ETA model?</summary><div class="qa-body">Cancellation rate, late-order rate, "where is my order?" support contacts, p99 latency and error rate of the ETA service, rider idle time or overtime, and SRM. A breach triggers automatic rollback through a feature flag, even if conversion is up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is interleaving, and when would you use it instead of A/B?</summary><div class="qa-body">Each user sees one list that merges two rankers' results (for example by team draft), and engagement is credited to the ranker that contributed each item. Because each user compares both rankers, person-to-person noise cancels and far fewer users are needed. Use it to screen many ranking models, then confirm the winner with an A/B test on business metrics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a degenerate feedback loop? Give an example and a fix.</summary><div class="qa-body">The model's outputs decide what data it gets, so its biases reinforce themselves. A recommender only gets labels for items it shows, so a new restaurant with no history is never shown and never gets labels (shown 0 times in 20,000 sessions in our simulation). Fixes: exploration slots or bandits, logging propensities and inverse propensity weighting, and small randomised holdouts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bandit or A/B test for choosing among 20 banners for a weekend sale?</summary><div class="qa-body">A bandit. There are many short-lived options and the goal is to maximise clicks now, not to measure a precise effect; a bandit moves traffic to the winners while learning (regret 30 vs 378 in the three-banner simulation). For a lasting product change like a new ETA model, use an A/B test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Thompson sampling in a few sentences.</summary><div class="qa-body">Keep a posterior distribution for each option's reward rate, for clicks a Beta(wins, losses). For each visitor, draw one sample from each option's posterior and show the option with the highest draw, then update its counts with the outcome. Uncertain options sometimes draw high and get explored; clearly good options win most draws.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design an experimentation platform for a company running hundreds of tests.</summary><div class="qa-body">A config service defining experiments, layers and traffic; an SDK doing salted hash assignment locally; exposure and event logging to a stream; a daily metric pipeline in the warehouse joining exposures to outcomes; a stats engine with CUPED, confidence intervals, sequential tests, SRM and guardrail checks; feature-flag kill switches with auto-rollback; and a pre-registration form for primary metric, guardrails and sample size.</div></details>
</main>
`
});
