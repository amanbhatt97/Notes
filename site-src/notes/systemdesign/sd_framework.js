// notes/systemdesign/sd_framework.js — How to Approach ML System Design
Object.assign(TOPIC_CONTENT, {
  "sd_framework": `<main>
  <h1>How to Approach ML System Design</h1>
  <p class="lead">A model in a notebook helps nobody. Someone has to feed it data, run it for millions of people in a fraction of a second, check it is still right next month, and improve it. Planning all of that is ML system design. This note gives you a fixed path to follow, so a vague question like "Design Swiggy's restaurant recommendations" becomes a calm, step-by-step answer. Builds on your ML and MLOps notes.</p>

  <h2 id="sf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML System Design Interview</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What it is</div>
        <ul>
          <li><b>ML system</b> — model + data + serving + checking + improving, working together</li>
          <li><b>Model is a small part</b> — most work is the plumbing around it</li>
          <li><b>Online part</b> — runs while the user waits (score, show)</li>
          <li><b>Offline part</b> — runs in background (log, retrain, test)</li>
          <li>💡 kitchen: recipe = model; shopping, counter, tasting = the system</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The framework</div>
        <ul>
          <li><b>Order</b> — goal → framing → metrics → data → features → model → train → serve → evaluate → monitor → iterate</li>
          <li><b>Why</b> — shows a plan; lets the interviewer steer you</li>
          <li>💡 architect: ask who lives there before choosing taps</li>
          <li><b>Skeleton first</b> — end-to-end pass, then deepen where asked</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Clarify &amp; frame</div>
        <ul>
          <li><b>Ask</b> — business goal, scale (users, items, QPS), latency, constraints</li>
          <li><b>Frame</b> — explicit input, output, label (e.g. rank by P(purchase))</li>
          <li><b>Label</b> — the right answer the model learns from (ordered: yes/no)</li>
          <li><b>Constraints</b> — privacy, fairness, cold start, cost</li>
          <li>⚠ <b>Proxy trap</b> — P(click) can reward clickbait; align label with goal</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Metrics</div>
        <ul>
          <li><b>Offline</b> — on old data, before launch: Recall@K, NDCG, log loss, PR-AUC</li>
          <li><b>Online</b> — on real users, decides A/B: orders/user, revenue, retention</li>
          <li><b>Guardrail</b> — must not get worse: p99 latency, complaints, diversity</li>
          <li><b>Cost of error</b> — fraud: precision at fixed recall, not accuracy</li>
          <li>Toy: "never flag fraud" = 99.8% accuracy, 0 of 2 frauds caught</li>
          <li>⚠ offline win ≠ online win: say how you'll check</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data → model</div>
        <ul>
          <li><b>Labels</b> — explicit (ratings) vs implicit (clicks); delay; noise; negatives</li>
          <li><b>Data risks</b> — logging bias, leakage, point-in-time joins</li>
          <li><b>Features</b> — user, item, context, cross; batch vs real-time</li>
          <li><b>Baseline first</b> — popularity / rules / LR: bar + fallback</li>
          <li><b>Model by data</b> — GBM tabular; two-tower + ranker recs; sequence for sessions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">System half</div>
        <ul>
          <li><b>Train</b> — scheduled, versioned, validated pipeline</li>
          <li><b>Serve</b> — batch vs real-time, latency budget, fallback</li>
          <li><b>Evaluate</b> — offline → shadow → canary → A/B</li>
          <li><b>Monitor</b> — system, data, model, business; retrain triggers</li>
          <li><b>Senior signal</b> — this half + trade-offs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scoring &amp; time</div>
        <ul>
          <li><b>Scored</b> — framing, metrics, data sense, trade-offs, production, communication</li>
          <li><b>45 min</b> — 5 clarify, 5 frame+metrics, 8 data, 8 model, 10 serving, 6 monitor, 3 wrap</li>
          <li>⚠ overspending on the model; never reaching serving</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Back-of-envelope</div>
        <ul>
          <li><b>QPS</b> — queries per second = DAU × requests / 86,400; peak = 2–5× avg</li>
          <li><b>1M req/day</b> ≈ 12 QPS</li>
          <li><b>Storage</b> — rows × features × 4 B (200M × 200 ≈ 160 GB)</li>
          <li><b>Latency</b> — Redis ~1 ms; cross-region 50–150 ms</li>
          <li><b>Use</b> — decides batch vs online, CPU vs GPU, need for retrieval stage</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mistakes</div>
        <ul>
          <li>No clarifying questions</li>
          <li>Model-first, no baseline</li>
          <li>Ignoring label delay / bias / skew</li>
          <li>No cold start, no rollout, vague "retrain sometimes"</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sf-start"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Is ML System Design?</span><span class="rm-sub">Behind the Swiggy home screen</span></div></div>
      <div class="rm-item rm-done" data-target="sf-flow"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Framework</span><span class="rm-sub">Eleven steps, one loop</span></div></div>
      <div class="rm-item rm-done" data-target="sf-frame"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Clarify &amp; Frame</span><span class="rm-sub">Business goal → ML task</span></div></div>
      <div class="rm-item rm-done" data-target="sf-metrics"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Metrics</span><span class="rm-sub">Offline, online, guardrail</span></div></div>
      <div class="rm-item rm-done" data-target="sf-data"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Data, Features, Model</span><span class="rm-sub">Baseline first, always</span></div></div>
      <div class="rm-item rm-done" data-target="sf-system"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The System Half</span><span class="rm-sub">Train, serve, test, watch</span></div></div>
      <div class="rm-item rm-done" data-target="sf-score"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">What Gets Scored</span><span class="rm-sub">And the 45-minute budget</span></div></div>
      <div class="rm-item rm-done" data-target="sf-est"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Back-of-Envelope</span><span class="rm-sub">QPS, storage, latency</span></div></div>
      <div class="rm-item rm-done" data-target="sf-mistakes"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What sinks candidates</span></div></div>
      <div class="rm-item rm-done" data-target="sf-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sf-start"><span class="num">01</span>What Is ML System Design?</h2>
  <p>Open Swiggy at 8 pm in Koramangala. In less than a second you see 20 restaurants, and they suit you: the biryani place you order from every Friday, a new South Indian place near your office. Nobody at Swiggy picked these by hand. A model did, for you alone, out of thousands of restaurants.</p>
  <p>But the model is only one piece. Think about everything else that had to happen:</p>
  <ul>
    <li>Someone had to <strong>record</strong> what you saw, tapped and ordered last month. That record is the data.</li>
    <li>Someone had to <strong>train</strong> the model on that data, and train it again when tastes change.</li>
    <li>Some computer had to <strong>run</strong> the model the moment you opened the app, and answer in a fraction of a second.</li>
    <li>Someone had to <strong>check</strong> the new model is really better before giving it to everyone.</li>
    <li>Someone has to <strong>watch</strong> it every day, because a model that was right in January can be wrong by June.</li>
  </ul>
  <p>Planning all these pieces and how they connect is called <strong>ML system design</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 740 224" width="740" role="img"><defs><marker id="sf-m0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="16" class="tb" font-weight="600">Online: happens while you wait (under 1 second)</text><rect x="10" y="26" width="160" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="45" text-anchor="middle" font-weight="600">1. You open app</text><text x="90" y="62" text-anchor="middle" class="tm">8 pm, Koramangala</text><rect x="196" y="26" width="160" height="46" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="45" text-anchor="middle" font-weight="600">2. Fetch facts</text><text x="276" y="62" text-anchor="middle" class="tm">your past orders</text><rect x="382" y="26" width="160" height="46" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="45" text-anchor="middle" font-weight="600">3. Model scores</text><text x="462" y="62" text-anchor="middle" class="tm">500 restaurants</text><rect x="568" y="26" width="160" height="46" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="45" text-anchor="middle" font-weight="600">4. Show top 20</text><text x="648" y="62" text-anchor="middle" class="tm">in ~0.2 s</text><line x1="172" y1="49" x2="193" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="358" y1="49" x2="379" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="544" y1="49" x2="565" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><rect x="568" y="146" width="160" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="165" text-anchor="middle" font-weight="600">5. Log what you did</text><text x="648" y="182" text-anchor="middle" class="tm">saw, tapped, ordered</text><rect x="382" y="146" width="160" height="46" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="165" text-anchor="middle" font-weight="600">6. Train new model</text><text x="462" y="182" text-anchor="middle" class="tm">nightly</text><rect x="196" y="146" width="160" height="46" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="165" text-anchor="middle" font-weight="600">7. Test on few users</text><text x="276" y="182" text-anchor="middle" class="tm">better? then ship</text><rect x="10" y="146" width="160" height="46" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="165" text-anchor="middle" font-weight="600">8. Watch daily</text><text x="90" y="182" text-anchor="middle" class="tm">still working?</text><line x1="648" y1="74" x2="648" y2="143" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="566" y1="169" x2="545" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="380" y1="169" x2="359" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="194" y1="169" x2="173" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="300" y1="144" x2="440" y2="76" class="sb" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sf-m0)"/><text x="384" y="112" text-anchor="start" class="tb">new model goes live</text><text x="10" y="214" class="tb" font-weight="600">Offline: happens in the background (hours, days)</text></svg><figcaption>Top row runs on every app open. Bottom row runs in the background and keeps the top row good.</figcaption></figure>
  <p>Look at the two rows. The top row must be fast, because a hungry user is waiting. The bottom row can be slow, but it decides whether the top row stays good. The model (box 3) is one box out of eight.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant. The recipe is the model. But the restaurant also needs vegetables bought each morning (data), a counter that serves fast (serving), a taster before a new dish goes on the menu (testing), and someone reading customer complaints (monitoring). A great recipe with no counter feeds nobody.</p>
  </div>
  <p><strong>Where you will meet this.</strong> In interviews as "Design a fraud detector for UPI" or "Design YouTube recommendations", usually a 45-minute round for ML engineer and senior data scientist roles. In a real job, every model you ship needs these same pieces, or it quietly breaks after launch.</p>

  <h2 id="sf-flow"><span class="num">02</span>The Framework</h2>
  <p>The interview question is always vague on purpose. "Design recommendations for Swiggy" has no data, no numbers, no rules. If you start talking about models straight away, you will miss half the problem. So you follow a fixed list of steps, the same list every time.</p>
  <figure class="viz"><svg viewBox="0 0 720 168" width="720" role="img"><defs><marker id="sf-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="12" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="62" y="33" text-anchor="middle" font-weight="600">Clarify</text><text x="62" y="47" text-anchor="middle" class="tm">goal</text><rect x="130" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="180" y="33" text-anchor="middle" font-weight="600">Frame as</text><text x="180" y="47" text-anchor="middle" class="tm">ML task</text><rect x="248" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="298" y="33" text-anchor="middle" font-weight="600">Metrics</text><text x="298" y="47" text-anchor="middle" class="tm">off + online</text><rect x="366" y="14" width="100" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="416" y="33" text-anchor="middle" font-weight="600">Data &amp;</text><text x="416" y="47" text-anchor="middle" class="tm">labels</text><rect x="484" y="14" width="100" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="534" y="40" text-anchor="middle" font-weight="600">Features</text><rect x="602" y="14" width="100" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="652" y="33" text-anchor="middle" font-weight="600">Model</text><text x="652" y="47" text-anchor="middle" class="tm">baseline 1st</text><line x1="114" y1="36" x2="127" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="232" y1="36" x2="245" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="350" y1="36" x2="363" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="468" y1="36" x2="481" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="586" y1="36" x2="599" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><rect x="602" y="112" width="100" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="652" y="131" text-anchor="middle" font-weight="600">Training</text><text x="652" y="145" text-anchor="middle" class="tm">pipeline</text><rect x="484" y="112" width="100" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="534" y="138" text-anchor="middle" font-weight="600">Serving</text><rect x="366" y="112" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="416" y="131" text-anchor="middle" font-weight="600">Offline</text><text x="416" y="145" text-anchor="middle" class="tm">eval</text><rect x="248" y="112" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="298" y="131" text-anchor="middle" font-weight="600">Online</text><text x="298" y="145" text-anchor="middle" class="tm">A/B test</text><rect x="130" y="112" width="100" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="180" y="138" text-anchor="middle" font-weight="600">Monitoring</text><rect x="12" y="112" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="62" y="138" text-anchor="middle" font-weight="600">Iterate</text><line x1="652" y1="60" x2="652" y2="109" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="600" y1="134" x2="587" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="482" y1="134" x2="469" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="364" y1="134" x2="351" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="246" y1="134" x2="233" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="128" y1="134" x2="115" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><path d="M62.0,110 V86 H416.0 V61" class="sb" fill="none" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sf-m1)"/><text x="239" y="81" text-anchor="middle" class="tb">loop back: new data, features, model</text></svg><figcaption>Problem first (blue), then data, model, system, and the loop that keeps it alive. Spend time in that order.</figcaption></figure>
  <p>Read the picture left to right on top, then right to left on the bottom. Blue boxes are about the problem. Teal is data. Violet is the model. The bottom row is the system that runs it, and the dashed arrow is the loop: what you learn from monitoring goes back into better data and models.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Question you ask</th><th>Swiggy answer (example)</th></tr>
    <tr><td>Clarify goal</td><td>What should improve for the business?</td><td>More orders from the home screen</td></tr>
    <tr><td>Frame as ML</td><td>What goes in, what comes out?</td><td>In: user + restaurant + time. Out: chance of ordering</td></tr>
    <tr><td>Metrics</td><td>How do we know it is good?</td><td>Orders per user (online), ranking quality on old data (offline)</td></tr>
    <tr><td>Data &amp; features</td><td>What facts do we have?</td><td>Past orders, cuisine, distance, rating, delivery time</td></tr>
    <tr><td>Model</td><td>Simplest thing first, then better</td><td>"Popular near you", then a trained ranker</td></tr>
    <tr><td>Train, serve</td><td>How does it run every day?</td><td>Retrain nightly; score in under 200 ms</td></tr>
    <tr><td>Evaluate, monitor</td><td>Is it safe? Is it still working?</td><td>Test on 5% of users; watch daily dashboards</td></tr>
  </table>
  <p>Say the steps out loud at the start. It shows the interviewer you have a plan, and lets them steer you to the part they care about.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An architect sketching a house. Ask who lives there and the budget first, then rooms, then plumbing. Nobody starts by picking the tap.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Going deep on one step too early. Do a quick pass over all steps first (the skeleton), then go deeper where the interviewer points.</p>
  </div>

  <h2 id="sf-frame"><span class="num">03</span>Clarify &amp; Frame</h2>
  <p>The interviewer says: "Design recommendations for Swiggy." Recommend what? Restaurants or dishes? For a home screen that loads in 0.2 s, or for a daily push notification? For one city or all of India? Each answer leads to a different system. So before designing anything, you ask questions. This is <strong>clarifying</strong>.</p>
  <div class="cards">
    <div><b>Goal</b><p>What business number should move?</p><small>"More orders", not "better recall"</small></div>
    <div><b>Users &amp; scale</b><p>How many users, items, requests?</p><small>Drives every estimate later</small></div>
    <div><b>Latency</b><p>How fast must the answer come? Real-time, near-real-time or batch?</p><small>50 ms vs nightly is a different system</small></div>
    <div><b>Constraints</b><p>Privacy, fairness, cold start (brand-new users or items with no history), budget.</p><small>Often the hidden twist</small></div>
  </div>
  <p>Next you turn the business goal into a task a model can learn. This is <strong>framing</strong>. You state three things clearly:</p>
  <ul>
    <li><strong>Input</strong> — what the model is given. For Swiggy: this user, this restaurant, this time of day.</li>
    <li><strong>Output</strong> — what it returns. A number from 0 to 1: the chance this user orders from this restaurant.</li>
    <li><strong>Label</strong> — the right answer it learns from in past data. Did the user actually order? Yes = 1, no = 0.</li>
  </ul>
  <p>Tiny example. Last Friday, Riya saw 3 restaurants and ordered from one:</p>
  <table class="tbl">
    <tr><th>User</th><th>Restaurant</th><th>Time</th><th>Label (ordered?)</th></tr>
    <tr><td>Riya</td><td>Meghana Biryani</td><td>Fri 8 pm</td><td>1</td></tr>
    <tr><td>Riya</td><td>Salad Days</td><td>Fri 8 pm</td><td>0</td></tr>
    <tr><td>Riya</td><td>Dosa Point</td><td>Fri 8 pm</td><td>0</td></tr>
  </table>
  <p>Millions of such rows teach the model. At serving time it gives each restaurant a score, and the app shows the highest scores first. In maths shorthand, the output is written <strong>P(order | user, restaurant)</strong>: "probability of order, given this user and this restaurant". The bar <code>|</code> is read as "given".</p>
  <p>Other common framings:</p>
  <table class="tbl">
    <tr><th>Business ask</th><th>ML framing</th><th>Label</th></tr>
    <tr><td>Increase purchases from the home feed</td><td>Rank items by P(purchase | user, item)</td><td>Bought within session</td></tr>
    <tr><td>Stop fraudulent payments</td><td>Binary classification (yes/no answer) per transaction</td><td>Chargeback (bank reverses the payment) / analyst verdict</td></tr>
    <tr><td>Avoid stock-outs</td><td>Forecast units per SKU (one product) × store × day</td><td>Actual sales (censored by stock-outs!)</td></tr>
    <tr><td>Show relevant search results</td><td>Learning-to-rank per query</td><td>Clicks, purchases, human ratings</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Optimising a proxy that diverges from the goal. A proxy is a stand-in number that is easier to measure. Ranking by P(click) can promote clickbait: a photo of a huge pizza gets taps but few orders. P(purchase) or long-term engagement may be the better target.</p>
  </div>

  <h2 id="sf-metrics"><span class="num">04</span>Metrics</h2>
  <p>You built a new Swiggy ranker. Is it better? You need a number to answer that. But you need it at three different moments, so you need three kinds of numbers.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new batsman. His score in net practice (offline) helps the selectors pick him. His runs in a real match (online) decide if he stays. And he must not get injured or break team rules (guardrail), however many runs he scores.</p>
  </div>
  <table class="tbl">
    <tr><th>Layer</th><th>Purpose</th><th>Recommendation example</th></tr>
    <tr><td><strong>Offline</strong></td><td>Pick models before shipping, using old logged data</td><td>Recall@100 (retrieval), NDCG@10 (ranking), log loss</td></tr>
    <tr><td><strong>Online (primary)</strong></td><td>Decide the A/B test (old vs new on real users)</td><td>Purchases per user, revenue per session</td></tr>
    <tr><td><strong>Guardrail</strong></td><td>Must not get worse</td><td>p99 latency, unsubscribe rate, catalogue coverage</td></tr>
  </table>
  <p>The offline names in plain words:</p>
  <ul>
    <li><strong>Recall@100</strong> — of the restaurants the user really ordered from, how many made it into our top 100?</li>
    <li><strong>NDCG@10</strong> — are the good ones near the top of the first 10? A hit at rank 1 counts more than a hit at rank 9.</li>
    <li><strong>Log loss</strong> — how close our probabilities are to what happened. Saying 0.9 for an order that happened is good; saying 0.1 is punished.</li>
    <li><strong>p99 latency</strong> — the time within which 99 out of 100 requests finish. The slowest 1% are what users complain about.</li>
  </ul>
  <p>Offline wins don't guarantee online wins. Name both, and say how you'll check they agree.</p>
  <p>The right metric depends on <strong>what a mistake costs</strong>. Take a bank checking UPI payments for fraud. Fraud is rare, so a lazy model that never flags anything looks great on accuracy:</p>
  <div class="fx" data-lang="py"># 1,000 UPI payments in a day; only 2 are fraud
labels = [1, 1] + [0] * 998          # 1 = fraud, 0 = genuine

# "Model" that never flags anything
preds = [0] * 1000
acc = sum(p == y for p, y in zip(preds, labels)) / len(labels)
caught = sum(p == 1 and y == 1 for p, y in zip(preds, labels))
print(f"accuracy     = {acc:.1%}")
print(f"frauds caught = {caught} of {sum(labels)}")</div>
  <div class="fx" data-lang="text">accuracy     = 99.8%
frauds caught = 0 of 2</div>
  <p>99.8% accurate and completely useless. So for fraud you talk about <strong>recall</strong> (share of frauds caught) and <strong>precision</strong> (share of flagged payments that were really fraud).</p>
  <div class="callout intu"><span class="label">Pick metrics by cost of error</span>
    <p>Fraud: a missed fraud costs money, a false block costs a customer. So state precision at a fixed recall, or expected cost, not plain accuracy.</p>
  </div>

  <h2 id="sf-data"><span class="num">05</span>Data, Features, Model</h2>
  <p>A model learns only from what you give it. So first ask: where do the facts come from, and what do they look like? A few words first:</p>
  <ul>
    <li><strong>Data</strong> — the raw records: every app open, tap, order, rating.</li>
    <li><strong>Feature</strong> — one useful fact turned into a number for the model. "Distance to restaurant = 2.3 km". "Riya ordered biryani 6 times this month".</li>
    <li><strong>Baseline</strong> — the simplest method that works at all, like "show the most popular restaurants nearby".</li>
  </ul>
  <div class="flow"><span>Sources</span><span>Labels</span><span>Features</span><span>Baseline</span><span>Better model</span></div>
  <p>One training row for Swiggy might look like this:</p>
  <table class="tbl">
    <tr><th>user's biryani orders (30 days)</th><th>distance km</th><th>rating</th><th>hour</th><th>is Friday</th><th>label</th></tr>
    <tr><td>6</td><td>2.3</td><td>4.4</td><td>20</td><td>1</td><td>1</td></tr>
  </table>
  <p>Features come in four families: about the <strong>user</strong> (order history), about the <strong>item</strong> (rating, price), about the <strong>context</strong> (time, weather, device), and <strong>cross</strong> features that mix two (how often this user orders this cuisine).</p>
  <p>Labels come in two kinds. <strong>Explicit</strong>: the user tells you (a 5-star rating). Rare but clear. <strong>Implicit</strong>: you infer it from behaviour (a tap, an order). Plenty but noisy: a tap might be a mistake.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Say this</th></tr>
    <tr><td>Data</td><td>Where it comes from, volume, freshness, bias (only logged what the old model showed).</td></tr>
    <tr><td>Labels</td><td>Explicit (ratings) vs implicit (clicks); delay (fraud labels come weeks later); noise; negative sampling (which "not ordered" rows to keep).</td></tr>
    <tr><td>Features</td><td>User, item, context, cross features. Which are batch (computed nightly) vs real-time (computed now). Leakage risks (using a fact you would not have at prediction time).</td></tr>
    <tr><td>Baseline</td><td>Popularity, rules or logistic regression. Gives a number to beat and a fallback.</td></tr>
    <tr><td>Model</td><td>GBM (many small decision trees, great on table data) for tabular; two-tower (two networks that turn users and items into lists of numbers) + ranker for recs; sequence models for sessions. Justify by data size and latency.</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Baseline, in daily life</span>
    <p>Before building a weather app, check how good "tomorrow = today" is. Often it is right most days. Your fancy model must beat that, or it is not worth running.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Jumping to "a transformer" before a baseline. Interviewers read it as not knowing what is good enough.</p>
  </div>

  <h2 id="sf-system"><span class="num">06</span>The System Half</h2>
  <p>Your model works in a notebook on last month's data. Now 5 crore people will use it, every day, for years. Four new jobs appear, one for each box in the bottom half of the first picture.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new dish at a restaurant chain. The recipe is written down so every branch cooks it the same (training pipeline). The kitchen must serve it in 10 minutes at dinner rush (serving). It goes on the menu at one branch first (evaluation). Then the manager reads reviews every week (monitoring).</p>
  </div>
  <div class="cards">
    <div><b>Training pipeline</b><p>Scheduled, versioned data + code + model; point-in-time features.</p><small>Next note: feature stores</small></div>
    <div><b>Serving</b><p>Batch vs real-time; latency budget; caching; fallback.</p><small>Feature Stores &amp; Serving</small></div>
    <div><b>Evaluation</b><p>Offline → shadow → canary → A/B.</p><small>Shadow, Canary &amp; A/B</small></div>
    <div><b>Monitoring</b><p>System, data, model, business; drift; retrain triggers.</p><small>Monitoring &amp; Drift</small></div>
  </div>
  <ul>
    <li><strong>Versioned</strong> — every model is saved with a number (v12, v13), so you can go back.</li>
    <li><strong>Fallback</strong> — a simple backup answer (popular restaurants) when the model is slow or down.</li>
    <li><strong>Shadow, canary, A/B</strong> — ways to try a new model on real traffic safely. Covered in the experiments note.</li>
    <li><strong>Drift</strong> — the world changing so the model's old lessons stop fitting. Covered in the monitoring note.</li>
  </ul>
  <p>This half separates senior from junior answers. A good model with no rollout or monitoring plan scores low.</p>

  <h2 id="sf-score"><span class="num">07</span>What Gets Scored</h2>
  <p>The interviewer is not checking whether you picked the "right" model. There is no single right answer. They are checking how you think. This table shows the gap between a weak and a strong answer for each thing they watch.</p>
  <table class="tbl">
    <tr><th>Signal</th><th>Weak answer</th><th>Strong answer</th></tr>
    <tr><td>Problem framing</td><td>Starts with a model</td><td>Asks about goal, scale, latency; states the label</td></tr>
    <tr><td>Metrics</td><td>"Accuracy"</td><td>Offline + online + guardrail, tied to cost of errors</td></tr>
    <tr><td>Data sense</td><td>Assumes clean labels</td><td>Discusses delay, bias, leakage, sampling</td></tr>
    <tr><td>Trade-offs</td><td>One option</td><td>Two options, picks one, says why and when it breaks</td></tr>
    <tr><td>Production</td><td>Stops at training</td><td>Serving, rollout, monitoring, retraining</td></tr>
    <tr><td>Communication</td><td>Silent detours</td><td>Signposts, checks in, keeps time</td></tr>
  </table>
  <p>A <strong>trade-off</strong> means every choice gains something and costs something. "Nightly batch is cheap but stale; real-time is fresh but costly. I pick real-time because the user's location changes." That one sentence scores well.</p>
  <figure class="viz"><svg viewBox="0 0 720 118" width="720" role="img"><defs><marker id="sf-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="18" text-anchor="middle" class="tm">0</text><rect x="10" y="26" width="77.7778" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="48.8889" y="48" text-anchor="middle" font-weight="600">5m</text><text x="87.7778" y="18" text-anchor="middle" class="tm">5</text><text x="48.8889" y="80" text-anchor="middle">Clarify</text><rect x="87.7778" y="26" width="77.7778" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="126.667" y="48" text-anchor="middle" font-weight="600">5m</text><text x="165.556" y="18" text-anchor="middle" class="tm">10</text><text x="126.667" y="98" text-anchor="middle">Frame+metrics</text><rect x="165.556" y="26" width="124.444" height="34" rx="2" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="227.778" y="48" text-anchor="middle" font-weight="600">8m</text><text x="290" y="18" text-anchor="middle" class="tm">18</text><text x="227.778" y="80" text-anchor="middle">Data+features</text><rect x="290" y="26" width="124.444" height="34" rx="2" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="352.222" y="48" text-anchor="middle" font-weight="600">8m</text><text x="414.444" y="18" text-anchor="middle" class="tm">26</text><text x="352.222" y="98" text-anchor="middle">Model</text><rect x="414.444" y="26" width="155.556" height="34" rx="2" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="492.222" y="48" text-anchor="middle" font-weight="600">10m</text><text x="570" y="18" text-anchor="middle" class="tm">36</text><text x="492.222" y="80" text-anchor="middle">Architecture+serving</text><rect x="570" y="26" width="93.3333" height="34" rx="2" class="fr" stroke="currentColor" stroke-opacity=".4"/><text x="616.667" y="48" text-anchor="middle" font-weight="600">6m</text><text x="663.333" y="18" text-anchor="middle" class="tm">42</text><text x="616.667" y="98" text-anchor="middle">Eval+monitoring</text><rect x="663.333" y="26" width="46.6667" height="34" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="686.667" y="48" text-anchor="middle" font-weight="600">3m</text><text x="710" y="18" text-anchor="middle" class="tm">45</text><text x="686.667" y="80" text-anchor="middle">Wrap-up</text></svg><figcaption>A 45-minute budget. Most candidates overspend on the model and never reach serving or monitoring.</figcaption></figure>
  <p>Each bar is minutes. Notice serving gets the biggest slice, and the model gets the same as data. Keep a watch on the clock.</p>

  <h2 id="sf-est"><span class="num">08</span>Back-of-Envelope</h2>
  <p>"Back-of-envelope" means rough maths you could do on the back of an envelope. The point is not the exact number. The point is the size: is it 10, 10,000 or 10 million? The size decides the design.</p>
  <p>The key unit is <strong>QPS</strong>: queries (requests) per second. A tiny worked example:</p>
  <ul>
    <li>A shop app gets 1 million requests a day.</li>
    <li>A day has 24 × 60 × 60 = 86,400 seconds.</li>
    <li>1,000,000 ÷ 86,400 ≈ 12 requests per second on average.</li>
    <li>But people order at lunch and dinner, not at 4 am. So the busiest moment (the <strong>peak</strong>) is about 2–5× the average: 25–60 QPS.</li>
  </ul>
  <p>12 QPS is easy for one server. 17,000 QPS is not. Same method at Flipkart scale:</p>
  <div class="fx" data-lang="py"># Back-of-envelope: home-feed recommendations
dau            = 50_000_000        # daily active users
req_per_user   = 10                # feed loads per user per day
avg_qps  = dau * req_per_user / 86_400
peak_qps = avg_qps * 3             # peak is ~2-5x average
print(f"avg QPS  ~ {avg_qps:,.0f}")
print(f"peak QPS ~ {peak_qps:,.0f}")

# Ranking cost: 500 candidates scored per request
cands = 500
print(f"model scores/sec at peak ~ {peak_qps*cands/1e6:,.1f} M")

# Online feature store size: 200 features x 4 bytes per user
users, feats, bytes_per = 200_000_000, 200, 4
print(f"user features ~ {users*feats*bytes_per/1e9:,.0f} GB")

# Event logs: 1 KB per impression, 20 items shown per request
log_tb_day = dau * req_per_user * 20 * 1_000 / 1e12
print(f"impression logs ~ {log_tb_day:,.0f} TB/day, {log_tb_day*365/1e3:,.1f} PB/year")

# Replicas: one GPU ranker scores ~200k items/sec; keep 50% headroom
per_gpu = 200_000
print(f"GPUs needed ~ {peak_qps*cands/per_gpu/0.5:,.0f}")</div>
  <div class="fx" data-lang="text">avg QPS  ~ 5,787
peak QPS ~ 17,361
model scores/sec at peak ~ 8.7 M
user features ~ 160 GB
impression logs ~ 10 TB/day, 3.6 PB/year
GPUs needed ~ 87</div>
  <p>Reading it: ~17k peak QPS × 500 candidates is too much for one heavy model, so you need a cheap retrieval stage first. 160 GB of features fits in a sharded in-memory store (data split across several machines, kept in RAM for speed).</p>
  <table class="tbl">
    <tr><th>Number to remember</th><th>Value</th></tr>
    <tr><td>Seconds per day</td><td>86,400 ≈ 10<sup>5</sup></td></tr>
    <tr><td>1M requests/day</td><td>≈ 12 QPS average</td></tr>
    <tr><td>Peak / average</td><td>2–5×</td></tr>
    <tr><td>Redis / in-memory lookup</td><td>~1 ms (same region)</td></tr>
    <tr><td>Cross-region round trip</td><td>~50–150 ms</td></tr>
    <tr><td>GBM inference (CPU, 100 trees)</td><td>~0.1–1 ms per row; batch scores many rows per call</td></tr>
    <tr><td>float32 feature</td><td>4 bytes; 1B rows × 100 features ≈ 400 GB</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Designing for average QPS. Capacity and autoscaling must handle the peak, plus headroom for a failed zone. IRCTC Tatkal at 10 am is the classic picture: the average day is calm, the peak minute is not.</p>
  </div>

  <h2 id="sf-mistakes"><span class="num">09</span>Common Mistakes</h2>
  <p>Almost every weak answer fails in one of these ways. Each fix is a sentence you can say out loud.</p>
  <table class="tbl">
    <tr><th>Mistake</th><th>Fix</th></tr>
    <tr><td>No clarifying questions</td><td>Spend the first 5 minutes on goal, scale, latency</td></tr>
    <tr><td>Model-first, no baseline</td><td>State a heuristic (simple rule) baseline, then improve</td></tr>
    <tr><td>Ignoring label delay and bias</td><td>Say when labels arrive and what the logging policy hides</td></tr>
    <tr><td>Training-serving skew (features computed differently in training and live)</td><td>Same feature code both paths; point-in-time joins</td></tr>
    <tr><td>No cold start story</td><td>Content features, popularity fallback, exploration</td></tr>
    <tr><td>Ships without online test</td><td>Shadow → canary → A/B with guardrails</td></tr>
    <tr><td>"Retrain sometimes"</td><td>Name the trigger: schedule, drift threshold, metric drop</td></tr>
  </table>

  <h2 id="sf-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line, what is ML system design and why is the model only a small part?</summary><div class="qa-body">Planning everything needed for a model to help real users: data logging, training, fast serving, safe testing, monitoring and retraining. Without those pieces even a perfect model never reaches users, or breaks silently after launch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"Design a recommendation system." What are your first three questions?</summary><div class="qa-body">(1) What business metric should move: clicks, purchases, watch time? (2) Scale: users, items, requests per day. (3) Latency and freshness: per request in &lt;200 ms, or a daily email? Bonus: cold start and any fairness or diversity constraints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why name offline, online and guardrail metrics separately?</summary><div class="qa-body">They answer different questions. Offline picks candidates cheaply; online decides what ships; guardrails stop a "win" that breaks latency, revenue or trust. Offline and online often disagree, so you need both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A fraud model has 99.8% accuracy. Is it good?</summary><div class="qa-body">You can't tell. If 0.2% of payments are fraud, a model that never flags anything also scores 99.8%. Ask for recall (frauds caught) and precision (flags that were real fraud), or the money saved.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>50M DAU, 10 feed loads each. Average and peak QPS?</summary><div class="qa-body">500M / 86,400 ≈ 5.8k QPS average. With a 3× peak factor, ≈ 17k QPS. Size servers for peak plus headroom.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why start with a baseline when you know a deep model will win?</summary><div class="qa-body">It sets the bar to beat, exposes data and pipeline bugs early, ships value fast, and becomes the fallback when the main model fails. Often the gain from the fancy model is smaller than expected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose batch prediction over real-time?</summary><div class="qa-body">When inputs change slowly and the set of entities is enumerable: daily emails, demand forecasts, churn scores. It is cheaper and simpler. Choose real-time when the request context (query, session, transaction) matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The interviewer says "assume infinite data and compute". What do you still discuss?</summary><div class="qa-body">Label quality and delay, the right objective, latency at serving, training-serving skew, rollout safety and monitoring. Compute doesn't fix a wrong label or a feedback loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle running out of time?</summary><div class="qa-body">Keep to the budget: skeleton end-to-end first, then deepen where the interviewer points. If short on time, summarise the remaining stages in one line each (serving, A/B, monitoring) rather than leaving them out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your offline NDCG improved 3% but the A/B test is flat. Name three causes.</summary><div class="qa-body">(1) Offline data is biased by the old model's exposure. (2) Training-serving skew: features differ online. (3) The metric doesn't track the business goal, or the effect is too small for the test's power. Also: latency increase hurting engagement.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Storage for 200M users × 200 float32 features?</summary><div class="qa-body">200M × 200 × 4 B = 160 GB. Fits a sharded in-memory store (Redis cluster, DynamoDB with DAX). Add replicas for availability.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes an answer "senior"?</summary><div class="qa-body">Explicit trade-offs, awareness of data problems (delay, bias, leakage), a production plan (rollout, monitoring, retraining, fallback), and cost thinking. Juniors describe a model; seniors describe a system that stays correct over time.</div></details>
</main>`
});
