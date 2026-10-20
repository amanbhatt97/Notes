// notes/systemdesign/sd_framework.js — How to Approach ML System Design
Object.assign(TOPIC_CONTENT, {
  "sd_framework": `<main>
<h1>How to Approach ML System Design</h1>
  <div class="where"><span>ML System Design</span><span>How to Approach ML System Design</span></div>
  <p class="lead">A model in a notebook helps nobody. Someone has to feed it data, run it for millions of people in a fraction of a second, check it is still right next month, and improve it. Planning all of that is ML system design. This note gives you one fixed path, and walks it on one running example: <strong>Biteful's delivery-time (ETA) prediction</strong>, the "34 min" printed on every restaurant card in the Biteful food app. Every step answers a question the step before it leaves open, and every number is computed on the same eight orders.</p>

  <h2 id="sf-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="sf-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="69" y="42" text-anchor="middle" font-size="12" font-weight="700">1 Framework</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the whole path once</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="42" text-anchor="middle" font-size="12">2 Serving</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">answer in 60 ms</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="343" y="42" text-anchor="middle" font-size="12">3 Monitoring</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">still right next month?</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="480" y="42" text-anchor="middle" font-size="12">4 Experiments</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">is v2 really better?</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="614" y="42" text-anchor="middle" font-size="12">5 Case studies</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">four full designs</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#sf-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#sf-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#sf-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#sf-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: Biteful's delivery-time (ETA) prediction</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">orders 101–108 in Pune · Dosa Hut, Biryani Bros, Pizza Point · "34 min" on every card</text>
  </svg><figcaption>The ML System Design track in reading order. You are on the green note. It walks the whole path once; each later note zooms into one stretch of it.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: models and backends</b><span><a class="xref" data-note="ml_evaluation">Model Evaluation</a> and <a class="xref" data-note="ml_calibration">Calibration</a> taught you to score a model on held-out data. <a class="xref" data-note="api_production">Production Backend</a> taught you to run a service for many users (workers, Redis, queues, health checks). <a class="xref" data-note="mlops_lifecycle">The ML lifecycle</a> named the stages. None of them says <em>how to plan a whole ML product from a one-line request</em>.</span></li>
    <li><b>This note adds: the path</b><span>Goal and success metric → requirements with numbers → data, labels and leakage → features (online vs offline, point-in-time joins) → baseline and model → offline evaluation → serving architecture → monitoring → iteration. Each step on Biteful's ETA.</span></li>
    <li><b>Leads to: one stretch per note</b><span><a class="xref" data-note="sd_serving">Serving</a> (how the ETA answers in 60 ms), <a class="xref" data-note="sd_monitoring">Monitoring</a> (how we notice it going wrong), <a class="xref" data-note="sd_experiments">Experiments</a> (how we prove v2 is better), and <a class="xref" data-note="sd_cases">Case Studies</a> (ETA end to end, plus restaurant recommendations, fraud and demand forecasting).</span></li>
  </ol>

  <h2 id="sf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. The running example: an interviewer (or your manager) says <em>"Design Biteful's delivery-time prediction."</em> We follow eight real orders, 101 to 108, placed in Pune one Tuesday at Dosa Hut, Biryani Bros and Pizza Point. Each answer leaves a gap; the gap is the next step.</p>
  <ol class="story">
    <li><b>The prompt</b><span>Q: "Design a food-delivery ETA system" — where do I even start? → Not with a model. With the fixed path, said out loud. But the path's first box is empty: what are we trying to improve?</span></li>
    <li><b>Goal &amp; success metric</b><span>Q: what should get better for the business? → Fewer late orders and cancellations: the shown ETA should be a promise kept. Success = on-time rate, and the ML task = predict minutes from "placed" to "delivered". But how big and how fast must this be?</span></li>
    <li><b>Requirements &amp; back-of-envelope</b><span>Q: how much traffic, how fast? → 12M feed loads/day = 139 QPS average, 556 at the dinner peak, ×20 cards = 11,111 ETAs per second, 60 ms budget. Now: what do we learn from?</span></li>
    <li><b>Data, labels, leakage</b><span>Q: where does the right answer come from? → label = delivered − placed (orders 101–108: 28, 41, 30, 58, 19, 52, 27, 33 min). Trap: "picked up at" is only known after the order — leakage. Which facts can we use, and when are they known?</span></li>
    <li><b>Features &amp; point-in-time joins</b><span>Q: which facts, computed when? → km and kitchen queue live (online), prep_7d nightly (offline); a feature store keeps both; a point-in-time join gave order 102 the prep time 15.5 it really had, not today's 18.0. Now: what model?</span></li>
    <li><b>Baseline, then model</b><span>Q: what is the simplest thing that works? → 15 + 4 × km: MAE 8.0 min, 75% late. A learned linear model: 0.66 min — on the rows it learned from. Is that number honest?</span></li>
    <li><b>Offline evaluation</b><span>Q: how good is it on orders it has never seen? → held-out MAE 1.25, but 50% late; adding a 3-minute buffer gives 0% late. At scale, LightGBM 2.52 vs rule 9.18 on a time split. But offline is old data. How does it run live?</span></li>
    <li><b>Serving architecture</b><span>Q: how does a prediction reach Asha's screen in time? → ETA service + online feature store + stream job for queues + nightly batch + model registry. Running is not the same as staying right…</span></li>
    <li><b>Monitoring &amp; iteration</b><span>Q: how do we know it still works in the monsoon, and how does it get better? → watch system, data, model and business numbers; retrain and test v2 safely; loop back to data. The path closes into a circle.</span></li>
  </ol>

  <h2 id="sf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML System Design: Biteful ETA</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What it is</div>
        <ul>
          <li><b>ML system</b> — model + data + serving + checking + improving, working together</li>
          <li><b>Model is a small part</b> — most work is the plumbing around it</li>
          <li><b>Online part</b> — runs while the user waits (fetch, predict, show)</li>
          <li><b>Offline part</b> — runs in background (log, retrain, test)</li>
          <li>💡 kitchen: recipe = model; shopping, counter, tasting = the system</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Goal &amp; framing</div>
        <ul>
          <li><b>Goal</b> — ETA promise kept → fewer cancellations, complaints</li>
          <li><b>Frame</b> — input (order context), output (minutes), label (delivered − placed)</li>
          <li><b>Success</b> — on-time rate online; MAE, late %, P90 error offline</li>
          <li><b>Guardrail</b> — p99 latency, conversion must not drop</li>
          <li>⚠ <b>Proxy trap</b> — lowest MAE ≠ best promise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Requirements</div>
        <ul>
          <li><b>QPS</b> = requests/day ÷ 86,400; peak = 2–5× avg</li>
          <li>12M loads/day → 139 avg, 556 peak QPS</li>
          <li>×20 cards → 11,111 ETAs/s</li>
          <li>108M training rows ≈ 17.3 GB</li>
          <li>Budget: 60 ms of a 200 ms feed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data &amp; features</div>
        <ul>
          <li><b>Label</b> — delivered − placed; censored if cancelled</li>
          <li><b>Leakage</b> — picked_up time not known at prediction</li>
          <li><b>Online</b> — km, kitchen queue, rain, rider supply</li>
          <li><b>Offline</b> — prep_7d, zone history (nightly)</li>
          <li><b>Point-in-time join</b> — value as it was then</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Model &amp; evaluation</div>
        <ul>
          <li><b>Baseline</b> — 15 + 4 × km: MAE 8.0, 75% late</li>
          <li><b>Linear</b> — held-out MAE 1.25</li>
          <li><b>GBM at scale</b> — 2.52 vs rule 9.18 (time split)</li>
          <li><b>Split by time</b>, never randomly, for time data</li>
          <li><b>Promise</b> — buffer or quantile cuts late %</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">System half</div>
        <ul>
          <li><b>Serve</b> — ETA service, online store, fallback</li>
          <li><b>Train</b> — scheduled, versioned, PIT joins</li>
          <li><b>Evaluate</b> — offline → shadow → canary → A/B</li>
          <li><b>Monitor</b> — system, data, model, business</li>
          <li><b>Iterate</b> — the loop back to data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interview</div>
        <ul>
          <li><b>Scored</b> — framing, metrics, data sense, trade-offs, production, communication</li>
          <li><b>45 min</b> — 5 clarify, 5 frame+metrics, 8 data, 8 model, 10 serving, 6 monitor, 3 wrap</li>
          <li>⚠ overspending on the model; never reaching serving</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sf-start"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where Do I Start?</span><span class="rm-sub">The prompt and the eight boxes</span></div></div>
      <div class="rm-item rm-done" data-target="sf-flow"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Framework</span><span class="rm-sub">One path, one loop</span></div></div>
      <div class="rm-item rm-done" data-target="sf-frame"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Goal &amp; Success Metric</span><span class="rm-sub">Business goal → ML task</span></div></div>
      <div class="rm-item rm-done" data-target="sf-est"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Requirements &amp; Numbers</span><span class="rm-sub">QPS, storage, latency computed</span></div></div>
      <div class="rm-item rm-done" data-target="sf-data"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Data, Labels, Leakage</span><span class="rm-sub">Where the right answer comes from</span></div></div>
      <div class="rm-item rm-done" data-target="sf-feat"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Features</span><span class="rm-sub">Online, offline, point-in-time</span></div></div>
      <div class="rm-item rm-done" data-target="sf-model"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Baseline &amp; Model</span><span class="rm-sub">Simplest first, then learned</span></div></div>
      <div class="rm-item rm-done" data-target="sf-eval"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Offline Evaluation</span><span class="rm-sub">Held-out, time split, late %</span></div></div>
      <div class="rm-item rm-done" data-target="sf-system"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Serving Architecture</span><span class="rm-sub">The boxes that run it</span></div></div>
      <div class="rm-item rm-done" data-target="sf-monitor"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Monitoring &amp; Iteration</span><span class="rm-sub">Closing the loop; what gets scored</span></div></div>
      <div class="rm-item rm-done" data-target="sf-mistakes"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What sinks candidates</span></div></div>
      <div class="rm-item rm-done" data-target="sf-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every step on orders 101–108</span></div></div>
      <div class="rm-item rm-done" data-target="sf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sf-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sf-start"><span class="num">01</span>Where Do I Start?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The interviewer says one sentence: <em>"Design a food-delivery ETA system."</em> No data, no numbers, no rules. You know how to train and evaluate a model. But where does a whole system even begin, and what pieces does it need besides the model?</p>
  </div>
  <p>Open Biteful at 8 pm in Kothrud, Pune. Twenty restaurant cards appear, and each says something like <strong>"34 min"</strong>. Asha taps Dosa Hut, sees "28 min" at checkout, and orders. If the food arrives in 28 minutes she trusts the app. If it arrives in 50, she cancels next time, or calls support asking "where is my order?". Nobody at Biteful typed those numbers. A model predicted them, for every card, for every user, in a fraction of a second.</p>
  <p>But the model is only one piece. Think about everything else that had to happen:</p>
  <ul>
    <li>Someone had to <strong>record</strong> every past order: when it was placed, when it was picked up, when it was delivered. That record is the data, and "delivered − placed" is the right answer the model learns from.</li>
    <li>Someone had to <strong>train</strong> the model on that data, and train it again when the monsoon starts and every trip gets slower.</li>
    <li>Some computer had to <strong>run</strong> the model the moment Asha opened the app, with fresh facts (how busy is Dosa Hut's kitchen right now?), in under 60 ms.</li>
    <li>Someone had to <strong>check</strong> a new model is really better before giving it to everyone.</li>
    <li>Someone has to <strong>watch</strong> it every day, because a model that was right in March can be wrong in July.</li>
  </ul>
  <p>Planning all these pieces and how they connect is called <strong>ML system design</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 740 224" width="740" role="img"><defs><marker id="sf-m0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="16" class="tb" font-weight="600">Online: happens while you wait (under 1 second)</text><rect x="10" y="26" width="160" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="45" text-anchor="middle" font-weight="600">1. Asha opens app</text><text x="90" y="62" text-anchor="middle" class="tm">8 pm, Kothrud, Pune</text><rect x="196" y="26" width="160" height="46" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="45" text-anchor="middle" font-weight="600">2. Fetch facts</text><text x="276" y="62" text-anchor="middle" class="tm">queue, distance, rain</text><rect x="382" y="26" width="160" height="46" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="45" text-anchor="middle" font-weight="600">3. Model predicts</text><text x="462" y="62" text-anchor="middle" class="tm">minutes, 20 kitchens</text><rect x="568" y="26" width="160" height="46" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="45" text-anchor="middle" font-weight="600">4. Show “34 min”</text><text x="648" y="62" text-anchor="middle" class="tm">in ~0.2 s</text><line x1="172" y1="49" x2="193" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="358" y1="49" x2="379" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="544" y1="49" x2="565" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><rect x="568" y="146" width="160" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="165" text-anchor="middle" font-weight="600">5. Log what you did</text><text x="648" y="182" text-anchor="middle" class="tm">ETA shown + delivered at</text><rect x="382" y="146" width="160" height="46" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="165" text-anchor="middle" font-weight="600">6. Train new model</text><text x="462" y="182" text-anchor="middle" class="tm">nightly</text><rect x="196" y="146" width="160" height="46" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="165" text-anchor="middle" font-weight="600">7. Test on few users</text><text x="276" y="182" text-anchor="middle" class="tm">better? then ship</text><rect x="10" y="146" width="160" height="46" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="165" text-anchor="middle" font-weight="600">8. Watch daily</text><text x="90" y="182" text-anchor="middle" class="tm">still working?</text><line x1="648" y1="74" x2="648" y2="143" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="566" y1="169" x2="545" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="380" y1="169" x2="359" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="194" y1="169" x2="173" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="300" y1="144" x2="440" y2="76" class="sb" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sf-m0)"/><text x="384" y="112" text-anchor="start" class="tb">new model goes live</text><text x="10" y="214" class="tb" font-weight="600">Offline: happens in the background (hours, days)</text></svg><figcaption>Top row runs on every app open. Bottom row runs in the background and keeps the top row good.</figcaption></figure>
  <p>Look at the two rows. The top row must be fast, because a hungry user is waiting. The bottom row can be slow, but it decides whether the top row stays good. The model (box 3) is one box out of eight.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant. The recipe is the model. But the restaurant also needs vegetables bought each morning (data), a counter that serves fast (serving), a taster before a new dish goes on the menu (testing), and someone reading customer complaints (monitoring). A great recipe with no counter feeds nobody.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ML system design</strong>: planning the data, training, serving, evaluation, monitoring and improvement of a model as one working product. <strong>ETA</strong> (estimated time of arrival): here, the predicted minutes from placing an order to receiving it.</p>
  </div>
  <p><strong>Where you will meet this.</strong> In interviews as "Design an ETA system", "Design fraud detection for UPI" or "Design restaurant recommendations", usually a 45-minute round for ML engineer and senior data scientist roles. In a real job, every model you ship needs these same pieces, or it quietly breaks after launch.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Answering the prompt with "I'd use XGBoost." The interviewer then has nothing to score: you never said what problem you solved, how you'd know it works, or how it would run.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the framework.</b> We know the eight boxes exist. But in what order do we talk about them, so a vague prompt becomes a calm, step-by-step answer?</div>

  <h2 id="sf-flow"><span class="num">02</span>The Framework</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Eight boxes, 45 minutes, one vague sentence. If we start with whichever box we like best (usually the model), we will run out of time before serving and monitoring. What fixed order covers everything?</p>
  </div>
  <p>The prompt is vague on purpose. So you follow a fixed list of steps, the same list every time, and say it out loud at the start.</p>
  <figure class="viz"><svg viewBox="0 0 720 168" width="720" role="img"><defs><marker id="sf-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="12" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="62" y="33" text-anchor="middle" font-weight="600">Clarify</text><text x="62" y="47" text-anchor="middle" class="tm">goal</text><rect x="130" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="180" y="33" text-anchor="middle" font-weight="600">Frame as</text><text x="180" y="47" text-anchor="middle" class="tm">ML task</text><rect x="248" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="298" y="33" text-anchor="middle" font-weight="600">Metrics</text><text x="298" y="47" text-anchor="middle" class="tm">off + online</text><rect x="366" y="14" width="100" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="416" y="33" text-anchor="middle" font-weight="600">Data &amp;</text><text x="416" y="47" text-anchor="middle" class="tm">labels</text><rect x="484" y="14" width="100" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="534" y="40" text-anchor="middle" font-weight="600">Features</text><rect x="602" y="14" width="100" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="652" y="33" text-anchor="middle" font-weight="600">Model</text><text x="652" y="47" text-anchor="middle" class="tm">baseline 1st</text><line x1="114" y1="36" x2="127" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="232" y1="36" x2="245" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="350" y1="36" x2="363" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="468" y1="36" x2="481" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="586" y1="36" x2="599" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><rect x="602" y="112" width="100" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="652" y="131" text-anchor="middle" font-weight="600">Training</text><text x="652" y="145" text-anchor="middle" class="tm">pipeline</text><rect x="484" y="112" width="100" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="534" y="138" text-anchor="middle" font-weight="600">Serving</text><rect x="366" y="112" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="416" y="131" text-anchor="middle" font-weight="600">Offline</text><text x="416" y="145" text-anchor="middle" class="tm">eval</text><rect x="248" y="112" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="298" y="131" text-anchor="middle" font-weight="600">Online</text><text x="298" y="145" text-anchor="middle" class="tm">A/B test</text><rect x="130" y="112" width="100" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="180" y="138" text-anchor="middle" font-weight="600">Monitoring</text><rect x="12" y="112" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="62" y="138" text-anchor="middle" font-weight="600">Iterate</text><line x1="652" y1="60" x2="652" y2="109" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="600" y1="134" x2="587" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="482" y1="134" x2="469" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="364" y1="134" x2="351" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="246" y1="134" x2="233" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="128" y1="134" x2="115" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><path d="M62.0,110 V86 H416.0 V61" class="sb" fill="none" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sf-m1)"/><text x="239" y="81" text-anchor="middle" class="tb">loop back: new data, features, model</text></svg><figcaption>Problem first (blue), then data, model, system, and the loop that keeps it alive. Spend time in that order.</figcaption></figure>
  <p>Read the picture left to right on top, then right to left on the bottom. Blue boxes are about the problem. Teal is data. Violet is the model. The bottom row is the system that runs it, and the dashed arrow is the loop: what you learn from monitoring goes back into better data and models.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Question you ask</th><th>Biteful ETA answer (this note's sections)</th></tr>
    <tr><td>Clarify goal, frame</td><td>What should improve? What goes in, what comes out?</td><td>Fewer late orders; predict minutes placed → delivered (03)</td></tr>
    <tr><td>Requirements</td><td>How much traffic, how fast?</td><td>556 peak QPS, 11,111 ETAs/s, 60 ms (04)</td></tr>
    <tr><td>Data &amp; labels</td><td>What facts and right answers do we have?</td><td>Order logs; label = delivered − placed (05)</td></tr>
    <tr><td>Features</td><td>Which facts, known when?</td><td>km, kitchen queue, rain, prep_7d (06)</td></tr>
    <tr><td>Model</td><td>Simplest thing first, then better</td><td>15 + 4 × km, then a learned model (07)</td></tr>
    <tr><td>Offline evaluation</td><td>Is it good on unseen orders?</td><td>MAE, late %, time split (08)</td></tr>
    <tr><td>Serving</td><td>How does it run every request?</td><td>ETA service + feature stores (09)</td></tr>
    <tr><td>Online test, monitor, iterate</td><td>Is it safe? Still working? Better next time?</td><td>Shadow, canary, A/B; drift checks; retrain (10)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An architect sketching a house. Ask who lives there and the budget first, then rooms, then plumbing. Nobody starts by picking the tap.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Skeleton first</strong>: one quick pass over every step (two sentences each), then go deeper where the interviewer points. It shows a plan and lets them steer you.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Going deep on one step too early. Do the skeleton pass first; a 20-minute model discussion that never reaches serving scores lower than a thin but complete answer.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the goal.</b> The first box says "clarify the goal". For Biteful's ETA, what exactly should get better, and how will we measure "better"?</div>

  <h2 id="sf-frame"><span class="num">03</span>Goal &amp; Success Metric</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Predict delivery time" sounds clear, but it isn't. Better for whom? Measured how? Shown where: on 20 cards in the feed, or once at checkout? Until we know what the business wants, any model could be "right".</p>
  </div>
  <p>Before designing anything, you ask questions. This is <strong>clarifying</strong>. For Biteful the answers (assumed, and said out loud so the interviewer can correct them):</p>
  <div class="cards">
    <div><b>Goal</b><p>Fewer late orders → fewer cancellations and "where is my order?" calls; more trust, more orders.</p><small>A business number, not "better RMSE"</small></div>
    <div><b>Users &amp; scale</b><p>3M daily users in Pune and Mumbai; 20 cards per feed load; 600k orders/day.</p><small>Drives every estimate in section 04</small></div>
    <div><b>Latency</b><p>The feed must load in 200 ms p99; the ETA call gets 60 ms of it.</p><small>Real-time, not nightly</small></div>
    <div><b>Constraints</b><p>New restaurants with no history (cold start); monsoon; riders' privacy.</p><small>Often the hidden twist</small></div>
  </div>
  <p>Next you turn the business goal into a task a model can learn. This is <strong>framing</strong>. Say three things clearly:</p>
  <ul>
    <li><strong>Input</strong> — what the model is given at the moment of prediction: this restaurant, this customer's address, the time, the weather, how busy the kitchen is.</li>
    <li><strong>Output</strong> — what it returns: a number of minutes. This is <strong>regression</strong> (predict a number), not classification.</li>
    <li><strong>Label</strong> — the right answer in past data: delivered time − placed time, in minutes.</li>
  </ul>
  <p>Then the <strong>success metric</strong>, at three levels, because you need a number at three different moments:</p>
  <table class="tbl">
    <tr><th>Layer</th><th>Purpose</th><th>Biteful ETA</th></tr>
    <tr><td><strong>Offline</strong></td><td>Pick models before shipping, using old logged orders</td><td>MAE (average minutes off), late % (actual &gt; shown), P90 error</td></tr>
    <tr><td><strong>Online (primary)</strong></td><td>Decide the A/B test on real users</td><td>On-time rate of the shown ETA, cancellation rate, orders per user</td></tr>
    <tr><td><strong>Guardrail</strong></td><td>Must not get worse</td><td>p99 latency, conversion (an over-cautious ETA scares people off), support calls</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new batsman. His score in net practice (offline) helps the selectors pick him. His runs in a real match (online) decide if he stays. And he must not get injured or break team rules (guardrail), however many runs he scores.</p>
  </div>
  <p>Why three, and why does the offline metric need care? Because <strong>the right metric depends on what a mistake costs</strong>. For ETA, being 5 minutes early is mildly nice; being 5 minutes late makes Asha angry. Plain MAE treats both the same. The extreme version of this lesson is fraud, where a lazy model looks perfect on accuracy:</p>
  <div class="fx" data-lang="py"># 1,000 Biteful card payments in a day; only 2 are fraud
labels = [1, 1] + [0] * 998          # 1 = fraud, 0 = genuine

# "Model" that never flags anything
preds = [0] * 1000
acc = sum(p == y for p, y in zip(preds, labels)) / len(labels)
caught = sum(p == 1 and y == 1 for p, y in zip(preds, labels))
print(f"accuracy      = {acc:.1%}")
print(f"frauds caught = {caught} of {sum(labels)}")</div>
<div class="fx" data-lang="text">accuracy      = 99.8%
frauds caught = 0 of 2</div>
  <p>99.8% accurate and completely useless: for rare, costly events you talk about <strong>recall</strong> (share of frauds caught) and <strong>precision</strong> (share of flags that were real), as in <a class="xref" data-note="ml_evaluation">Model Evaluation</a>. For the ETA, the same thinking says: report MAE <em>and</em> the late rate, because they disagree (you will see it in section 08).</p>
  <p>Other common framings, so you can recognise them:</p>
  <table class="tbl">
    <tr><th>Business ask</th><th>ML framing</th><th>Label</th></tr>
    <tr><td>Show trustworthy delivery times</td><td>Regression: minutes per order</td><td>Delivered − placed</td></tr>
    <tr><td>More orders from the home feed</td><td>Rank restaurants by P(order | user, restaurant)</td><td>Ordered within session</td></tr>
    <tr><td>Stop fraudulent payments</td><td>Binary classification per payment</td><td>Chargeback / analyst verdict</td></tr>
    <tr><td>Enough riders at 8 pm</td><td>Forecast orders per zone per 30 min</td><td>Actual orders (censored by outages!)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Framing</strong>: stating input, output and label so the business goal becomes a learnable task. <strong>Proxy</strong>: an easier-to-measure stand-in for the real goal. <strong>Guardrail metric</strong>: a number that must not get worse, whatever the primary metric does.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the proxy diverges from the goal</span>
    <p>Optimising MAE alone can make the ETA <em>less</em> useful: a model that is unbiased is late about half the time. And "shorter ETA" can raise orders today but break the promise. Name the goal (kept promises) and check the proxy against it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: requirements.</b> We know what to predict and how to judge it. But is this 10 predictions a second or 10,000? Does the model get 5 ms or 5 seconds? Those numbers decide the whole design.</div>

  <h2 id="sf-est"><span class="num">04</span>Requirements &amp; Back-of-Envelope Numbers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"It should be fast and scale" is not a requirement. Is Biteful's ETA a job for one laptop, one server, or a fleet? Does the training data fit in memory? We can't choose batch vs real-time, CPU vs GPU, or how features are stored until we know the sizes.</p>
  </div>
  <p>"Back-of-envelope" means rough maths you could do on the back of an envelope. The point is not the exact number but its size: 10, 10,000 or 10 million? The size decides the design. The key unit is <strong>QPS</strong>: queries (requests) per second.</p>
  <p>By hand first, for Biteful's home feed:</p>
  <ul>
    <li>3,000,000 users × 4 feed loads a day = 12,000,000 loads/day.</li>
    <li>A day has 24 × 60 × 60 = 86,400 seconds, so 12,000,000 ÷ 86,400 ≈ <strong>139 QPS</strong> on average.</li>
    <li>People eat at lunch and dinner, not at 4 am. The busiest hour (the <strong>peak</strong>) is about 2–5× the average; we take 4×: ≈ <strong>556 QPS</strong>.</li>
    <li>Each feed load shows 20 restaurant cards, each with its own ETA: 556 × 20 ≈ <strong>11,111 predictions per second</strong> at peak.</li>
  </ul>
  <p>The same arithmetic in code, plus storage and compute:</p>
  <div class="fx" data-lang="py"># Back-of-envelope for Biteful's ETA system (Pune + Mumbai)
DAY = 86_400
dau            = 3_000_000      # daily active users
loads_per_user = 4              # home-feed loads per user per day
etas_per_load  = 20             # restaurant cards on screen, each shows "34 min"
peak_factor    = 4              # 8-9 pm dinner rush vs the daily average

loads_day = dau * loads_per_user
avg_qps   = loads_day / DAY
peak_qps  = avg_qps * peak_factor
print(f"feed loads/day     {loads_day:,}")
print(f"feed QPS  avg {avg_qps:,.1f}   peak {peak_qps:,.1f}")
print(f"ETA predictions/s at peak  {peak_qps * etas_per_load:,.0f}")

orders_day = 600_000            # ~5% of feed loads become an order
print(f"orders/day {orders_day:,}  -&gt; checkout ETAs at peak {orders_day / DAY * peak_factor:,.1f}/s")

# Training data: 180 days of delivered orders, 40 float32 features
rows = orders_day * 180
print(f"training rows {rows/1e6:,.0f} M   size {rows * 40 * 4 / 1e9:,.1f} GB")

# Online features: 20,000 restaurants x 30 features x 4 bytes
print(f"restaurant online features {20_000 * 30 * 4 / 1e6:,.1f} MB")
# Rider GPS: 50,000 riders on shift, one ping every 5 s
print(f"rider location writes/s {50_000 / 5:,.0f}")

# Model cost: a 300-tree GBM scores one row in ~0.05 ms on one CPU core
core_ms_per_s = peak_qps * etas_per_load * 0.05
print(f"CPU needed at peak ~ {core_ms_per_s / 1000:,.2f} cores (x2 headroom -&gt; {2 * core_ms_per_s / 1000:,.1f})")</div>
<div class="fx" data-lang="text">feed loads/day     12,000,000
feed QPS  avg 138.9   peak 555.6
ETA predictions/s at peak  11,111
orders/day 600,000  -&gt; checkout ETAs at peak 27.8/s
training rows 108 M   size 17.3 GB
restaurant online features 2.4 MB
rider location writes/s 10,000
CPU needed at peak ~ 0.56 cores (x2 headroom -&gt; 1.1)</div>
  <p>Read each line as a design decision:</p>
  <ul>
    <li><strong>11,111 ETAs/s at peak</strong> must be answered while the user waits, so this is <strong>online (real-time) serving</strong>, not a nightly batch.</li>
    <li><strong>0.56 cores</strong> for the model itself: the model is cheap. The hard part is getting fresh facts to it fast: <strong>10,000 rider-location writes/s</strong> and live kitchen queues. That points to a streaming pipeline and an in-memory feature store (section 06).</li>
    <li><strong>2.4 MB</strong> of restaurant features fits in any Redis; <strong>17.3 GB</strong> of training data fits on one big machine, so training does not need a cluster yet.</li>
    <li><strong>Latency budget</strong>: the feed's 200 ms p99 is split among services; the ETA service gets 60 ms for all 20 cards. p99 means 99 of 100 requests finish within it.</li>
  </ul>
  <table class="tbl">
    <tr><th>Number to remember</th><th>Value</th></tr>
    <tr><td>Seconds per day</td><td>86,400 ≈ 10<sup>5</sup></td></tr>
    <tr><td>1M requests/day</td><td>≈ 12 QPS average</td></tr>
    <tr><td>Peak / average</td><td>2–5×</td></tr>
    <tr><td>Redis / in-memory lookup</td><td>~1 ms (same region)</td></tr>
    <tr><td>Cross-region round trip</td><td>~50–150 ms</td></tr>
    <tr><td>GBM inference (CPU, ~300 trees)</td><td>~0.05–1 ms per row; batching many rows per call is cheaper</td></tr>
    <tr><td>float32 feature</td><td>4 bytes; 1B rows × 100 features ≈ 400 GB</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Planning a wedding kitchen. You don't pick the stove before you know whether 50 or 5,000 guests are coming, and whether they all eat at once (peak) or over a day (average).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>QPS</strong> = requests per day ÷ 86,400. <strong>Peak factor</strong>: busiest-period QPS ÷ average QPS. <strong>Latency budget</strong>: the maximum time (usually p99) a step may take, agreed in advance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Designing for average QPS. Capacity must handle the peak plus headroom for a failed zone. 139 QPS at 4 pm says nothing about 8:30 pm on a rainy Friday.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: data and labels.</b> We know the size of the problem. But the model learns from examples. Where do the examples come from, what is the right answer for each, and which columns would secretly cheat?</div>

  <h2 id="sf-data"><span class="num">05</span>Data, Labels &amp; Leakage</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A model learns from past examples with known answers. For Biteful's ETA, what is one example, what is its answer, and which facts would be available at the moment we must predict — and which only appear later?</p>
  </div>
  <p>Three words first. <strong>Data</strong>: the raw records (every order, with its timestamps). <strong>Label</strong>: the right answer for one example. <strong>Leakage</strong>: using, in training, a fact that will not exist at prediction time.</p>
  <p>Here is the running example: eight real-looking orders from one Tuesday in Pune. Each row stores three timestamps. The label is computed from two of them.</p>
  <div class="fx" data-lang="py">import pandas as pd

# The running example: 8 Biteful orders in Pune, one Tuesday
orders = pd.DataFrame({
    "order":      [101, 102, 103, 104, 105, 106, 107, 108],
    "customer":   ["Asha", "Ben", "Chitra", "Dev", "Esha", "Farhan", "Gita", "Hari"],
    "restaurant": ["Dosa Hut", "Dosa Hut", "Biryani Bros", "Biryani Bros",
                   "Pizza Point", "Pizza Point", "Dosa Hut", "Biryani Bros"],
    "km":    [2.0, 4.0, 3.0, 5.0, 1.0, 6.0, 3.0, 2.0],   # road distance restaurant -&gt; customer
    "queue": [3, 6, 2, 8, 1, 4, 2, 5],                   # orders the kitchen got in the last 15 min
    "rain":  [0, 0, 0, 1, 0, 1, 0, 0],
    "placed":    ["13:05", "20:10", "20:12", "21:00", "14:20", "20:30", "15:00", "21:05"],
    "picked_up": ["13:19", "20:34", "20:27", "21:28", "14:29", "20:47", "15:12", "21:23"],
    "delivered": ["13:33", "20:51", "20:42", "21:58", "14:39", "21:22", "15:27", "21:38"],
})
t = lambda col: pd.to_datetime(orders[col], format="%H:%M")
orders["actual_min"] = (t("delivered") - t("placed")).dt.total_seconds() / 60   # the LABEL
orders["pickup_min"] = (t("picked_up") - t("placed")).dt.total_seconds() / 60   # known only AFTER the order
print(orders[["order", "restaurant", "km", "queue", "rain", "pickup_min", "actual_min"]].to_string(index=False))
print("mean delivery time:", orders["actual_min"].mean(), "min")</div>
<div class="fx" data-lang="text"> order   restaurant  km  queue  rain  pickup_min  actual_min
   101     Dosa Hut 2.0      3     0        14.0        28.0
   102     Dosa Hut 4.0      6     0        24.0        41.0
   103 Biryani Bros 3.0      2     0        15.0        30.0
   104 Biryani Bros 5.0      8     1        28.0        58.0
   105  Pizza Point 1.0      1     0         9.0        19.0
   106  Pizza Point 6.0      4     1        17.0        52.0
   107     Dosa Hut 3.0      2     0        12.0        27.0
   108 Biryani Bros 2.0      5     0        18.0        33.0
mean delivery time: 36.0 min</div>
  <p>Trace order 101 by hand: placed 13:05, delivered 13:33, so the label is 28 minutes. Order 104 (5 km, kitchen queue 8, raining): 21:00 → 21:58 = 58 minutes. The mean of all eight is (28 + 41 + 30 + 58 + 19 + 52 + 27 + 33) ÷ 8 = 288 ÷ 8 = <strong>36.0</strong> minutes.</p>
  <p>Now look at <code>pickup_min</code>, the minutes until the rider picked up the food. It is a <em>superb</em> predictor: big pickup, big total. But Biteful must show the ETA when Asha is still looking at the menu. At that moment nobody knows when the food will be picked up. A model trained with <code>pickup_min</code> would look brilliant offline and be impossible to run live. That is <strong>leakage</strong>, and section 08 measures how much it fools you at scale.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Say this (for ETA)</th></tr>
    <tr><td>Sources</td><td>Order service (placed, delivered), restaurant app (food ready), rider app (GPS pings), weather API, map/route engine. Logged via an event stream such as <a class="xref" data-note="de_kafka">Kafka</a> into a warehouse via <a class="xref" data-note="de_etl">ETL</a> jobs.</td></tr>
    <tr><td>Label</td><td>Delivered − placed. Short delay (known within the hour). <strong>Censored</strong> when an order is cancelled: we never see its true time, so long-wait orders are under-represented.</td></tr>
    <tr><td>Label noise</td><td>Riders sometimes tap "delivered" late or early; drop impossible values (2 min across the city).</td></tr>
    <tr><td>Leakage</td><td>Anything stamped after "placed": pickup time, rider id, actual route. At feed time even "which rider" is unknown.</td></tr>
    <tr><td>Bias</td><td>Logs only contain orders people placed; people who saw "55 min" and left are missing.</td></tr>
  </table>
  <p>The tables behind this are ordinary warehouse tables: an <code>orders</code> fact table keyed by order id with restaurant and customer dimension tables (the star schema of <a class="xref" data-note="sql_modeling">Data Modeling</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket commentator predicting the final score at the 10th over. He may use the score so far, the pitch, the weather. He may not peek at the scorecard from the 20th over — and a commentator who trained on old scorecards that included the final over would sound like a genius until the next live match.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Label</strong>: the target value for one training example (here, delivered − placed). <strong>Censored label</strong>: an example whose true value was never observed (cancelled orders). <strong>Leakage</strong>: training on information unavailable at prediction time; it inflates offline scores and fails live.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ask of every column: "at what timestamp was this value known?" If the answer is after the prediction moment, it cannot be a feature. Interviewers love asking this about ETA, because the post-order timestamps are so tempting.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: features.</b> We know the label and which columns are off limits. But the useful facts change at different speeds: distance is computed now, a kitchen's queue changes by the minute, its average prep time once a day. Where does each live, and how do we get the value it had at the right moment?</div>

  <h2 id="sf-feat"><span class="num">06</span>Features: Online, Offline, Point-in-Time</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We need facts for every prediction. Some are known only at request time, some are slow aggregates computed overnight. Training needs their values as they were in the past; serving needs them as they are now, in milliseconds. How do we provide both without mixing up the times?</p>
  </div>
  <p>A <strong>feature</strong> is one useful fact turned into a number. Biteful's ETA features fall into two groups by how fresh they must be:</p>
  <table class="tbl">
    <tr><th>Feature</th><th>Example (order 102)</th><th>Changes</th><th>Computed</th></tr>
    <tr><td>km (route distance)</td><td>4.0</td><td>per request</td><td>online, at request time (route engine)</td></tr>
    <tr><td>queue (orders to this kitchen, last 15 min)</td><td>6</td><td>every minute</td><td>online, streaming job on order events</td></tr>
    <tr><td>rain</td><td>0</td><td>minutes</td><td>online, weather feed</td></tr>
    <tr><td>hour, day of week</td><td>20, Tue</td><td>per request</td><td>online, from the clock</td></tr>
    <tr><td>prep_7d (kitchen's average prep time, last 7 days)</td><td>15.5</td><td>daily</td><td>offline, nightly batch job</td></tr>
  </table>
  <p>Both kinds must reach two places: the <strong>training</strong> job (millions of past rows, as they were then) and the <strong>serving</strong> path (one row, now, in ~1 ms). A <strong>feature store</strong> keeps one definition per feature and writes it to an <strong>offline store</strong> (full history with timestamps, for training) and an <strong>online store</strong> (latest value per key, e.g. Redis, for serving). <a class="xref" data-note="sd_serving">Serving</a> builds one.</p>
  <p>The dangerous part is time. Suppose Dosa Hut's <code>prep_7d</code> is recomputed every night at 02:00, and a cook left on 2 March, so it rises 14.0 → 15.5 → 18.0. Training rows for orders 101, 102 and a late-night order 109 must each get the value <em>that existed when the order was placed</em>.</p>
  <div class="fx" data-lang="py">import pandas as pd

# Feature: Dosa Hut's average prep time over the last 7 days.
# A batch job recomputes it every night at 02:00 and appends a row.
feats = pd.DataFrame({
    "restaurant": ["Dosa Hut"] * 3,
    "ts": pd.to_datetime(["2026-03-01 02:00", "2026-03-02 02:00", "2026-03-03 02:00"]),
    "prep_7d": [14.0, 15.5, 18.0]})          # a cook left on 2 March: prep slows down

# Orders we want training rows for (label = actual delivery minutes)
orders = pd.DataFrame({
    "order": [101, 102, 109],
    "restaurant": ["Dosa Hut"] * 3,
    "ts": pd.to_datetime(["2026-03-01 13:05", "2026-03-02 20:10", "2026-03-03 01:30"]),
    "actual_min": [28, 41, 35]})

# WRONG: attach today's (latest) value to every old order
latest = feats.sort_values("ts").groupby("restaurant").tail(1)[["restaurant", "prep_7d"]]
print(orders.merge(latest, on="restaurant")[["order", "ts", "prep_7d"]].to_string(index=False))
print()
# RIGHT: point-in-time join -&gt; the last value computed AT OR BEFORE each order
pit = pd.merge_asof(orders.sort_values("ts"), feats.sort_values("ts"),
                    on="ts", by="restaurant", direction="backward")
print(pit[["order", "ts", "prep_7d"]].to_string(index=False))</div>
<div class="fx" data-lang="text"> order                  ts  prep_7d
   101 2026-03-01 13:05:00     18.0
   102 2026-03-02 20:10:00     18.0
   109 2026-03-03 01:30:00     18.0

 order                  ts  prep_7d
   101 2026-03-01 13:05:00     14.0
   102 2026-03-02 20:10:00     15.5
   109 2026-03-03 01:30:00     15.5</div>
  <p>Trace it. The naive join gives every order today's 18.0. Order 101 (1 March, 13:05) really saw 14.0, the value written at 02:00 that morning. Order 102 (2 March, 20:10) saw 15.5. Order 109 (3 March, 01:30) is the subtle one: the 18.0 row is stamped 02:00 on 3 March, half an hour <em>after</em> the order, so it gets 15.5 too. <code>merge_asof(..., direction="backward")</code> does exactly this: for each order, take the last feature row at or before its timestamp. That is a <strong>point-in-time join</strong>.</p>
  <p>Why it matters: with the naive join the model learns "prep 18.0 goes with 28-minute deliveries" — a relationship that never existed. It is leakage of the future, the same family as <code>pickup_min</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school's marks. The office keeps every term's register with dates (offline store) for report cards. The notice board shows only the latest result (online store). When you ask "why did Riya get a scholarship last June?", you must look at last June's register, not today's notice board.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Online feature</strong>: computed or looked up at request time, fresh to seconds. <strong>Offline (batch) feature</strong>: precomputed on a schedule. <strong>Feature store</strong>: one place to define features and serve them to both training (history) and serving (latest). <strong>Point-in-time join</strong>: attach to each label the feature value as of the label's timestamp.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing a feature one way in training (SQL over the warehouse) and another way in serving (Java over a live counter). The numbers drift apart and the model is quietly wrong. That is <strong>training-serving skew</strong>; <a class="xref" data-note="sd_serving">Serving</a> reproduces it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the model.</b> We have clean rows: features as they were, and a label. Which model should learn from them — and how do we know a fancy one is worth it?</div>

  <h2 id="sf-model"><span class="num">07</span>Baseline, then Model</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We could reach straight for a deep network. But without a simple reference point we can't tell whether 5 minutes of error is great or terrible, and we have nothing to fall back on when the clever model breaks. What is the simplest thing that works, and how much better is a learned model?</p>
  </div>
  <p>A <strong>baseline</strong> is the simplest method that works at all. For ETA: "15 minutes to cook plus 4 minutes per km". Anyone can explain it, it needs no training, and it never crashes. Then we fit a learned model on the same eight orders: <code>eta = b0 + b1·km + b2·queue + b3·rain</code>, choosing the b's that make the squared errors smallest (least squares, from <a class="xref" data-note="ml_regression">Regression</a>).</p>
  <div class="fx" data-lang="py">import numpy as np

km     = np.array([2.0, 4.0, 3.0, 5.0, 1.0, 6.0, 3.0, 2.0])
queue  = np.array([3, 6, 2, 8, 1, 4, 2, 5])
rain   = np.array([0, 0, 0, 1, 0, 1, 0, 0])
actual = np.array([28, 41, 30, 58, 19, 52, 27, 33])     # orders 101..108

# Baseline: a rule anyone can explain. 15 min to cook + 4 min per km.
base = 15 + 4 * km
print("baseline ETA:", base.astype(int).tolist())
print("abs error   :", np.abs(actual - base).astype(int).tolist())
print(f"baseline MAE = {np.abs(actual - base).mean():.2f} min, late = {np.mean(actual &gt; base):.0%}")

# Learned model: fit  eta = b0 + b1*km + b2*queue + b3*rain  by least squares
X = np.column_stack([np.ones(8), km, queue, rain])
b, *_ = np.linalg.lstsq(X, actual, rcond=None)
print("coefficients b0, b1(km), b2(queue), b3(rain):", np.round(b, 2).tolist())
lin = X @ b
print("linear ETA  :", np.round(lin, 1).tolist())
print(f"linear MAE  = {np.abs(actual - lin).mean():.2f} min (on the same 8 rows it learned from)")</div>
<div class="fx" data-lang="text">baseline ETA: [23, 31, 27, 35, 19, 39, 27, 23]
abs error   : [5, 10, 3, 23, 0, 13, 0, 10]
baseline MAE = 8.00 min, late = 75%
coefficients b0, b1(km), b2(queue), b3(rain): [13.87, 3.25, 2.42, 8.71]
linear ETA  : [27.6, 41.4, 28.5, 58.2, 19.5, 51.8, 28.5, 32.5]
linear MAE  = 0.66 min (on the same 8 rows it learned from)</div>
  <p>Trace the baseline on order 104: 15 + 4 × 5 = 35 minutes; the food took 58, an error of 23. It ignores the queue of 8 and the rain. Across all eight the absolute errors are 5, 10, 3, 23, 0, 13, 0, 10, which sum to 64, so <strong>MAE = 64 ÷ 8 = 8.0 minutes</strong>, and 6 of 8 orders (75%) arrived later than promised.</p>
  <p>The learned model says each km adds 3.25 minutes, each order in the kitchen queue adds 2.42, and rain adds 8.71. For order 104: 13.87 + 3.25 × 5 + 2.42 × 8 + 8.71 × 1 ≈ 58.2. Its MAE is 0.66 minutes — but on the same eight rows it learned from, like grading a student on the exact questions they practised. Section 08 asks the honest version.</p>
  <table class="tbl">
    <tr><th>Model</th><th>When it fits ETA</th></tr>
    <tr><td>Rule baseline (15 + 4 × km)</td><td>Day one; fallback when the model or features fail</td></tr>
    <tr><td>Linear regression</td><td>Few features, need to explain each coefficient</td></tr>
    <tr><td>GBM (LightGBM, XGBoost)</td><td>The usual production choice for tabular data: handles interactions (rain × distance), fast on CPU</td></tr>
    <tr><td>Deep / sequence models</td><td>Using the route as a sequence of road segments, or rider GPS traces; only when data and latency allow</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Baseline, in daily life</span>
    <p>Before building a weather app, check how good "tomorrow = today" is. Often it is right most days. Your fancy model must beat that, or it is not worth running.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Baseline</strong>: the simplest reasonable predictor, used as the bar to beat and as the fallback. <strong>MAE</strong> (mean absolute error) = average of |actual − predicted|, in the label's units (minutes).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Jumping to "a transformer" before a baseline. Interviewers read it as not knowing what is good enough. Also: a score on the training rows (0.66) is not evidence of anything.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: offline evaluation.</b> The learned model fits our eight orders almost perfectly. Will it work on order 109, which it has never seen? And is MAE even the number Asha cares about?</div>

  <h2 id="sf-eval"><span class="num">08</span>Offline Evaluation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>0.66 minutes was measured on training rows. We need the error on orders the model has not seen, split the way the future will arrive, and we need to know whether low average error actually means kept promises.</p>
  </div>
  <p><strong>Offline evaluation</strong> scores a model on held-out historical data. With eight rows we use <strong>leave-one-out</strong>: fit on seven orders, predict the eighth, repeat for each order. Then we report several numbers, because each answers a different question.</p>
  <div class="fx" data-lang="py">import numpy as np

km     = np.array([2.0, 4.0, 3.0, 5.0, 1.0, 6.0, 3.0, 2.0])
queue  = np.array([3, 6, 2, 8, 1, 4, 2, 5])
rain   = np.array([0, 0, 0, 1, 0, 1, 0, 0])
actual = np.array([28, 41, 30, 58, 19, 52, 27, 33])
X = np.column_stack([np.ones(8), km, queue, rain])

# Honest test: leave-one-out. Fit on 7 orders, predict the 8th, repeat 8 times.
loo = np.empty(8)
for i in range(8):
    keep = np.arange(8) != i
    b, *_ = np.linalg.lstsq(X[keep], actual[keep], rcond=None)
    loo[i] = X[i] @ b
print("held-out ETA:", np.round(loo, 1).tolist())

def report(name, eta):
    err = actual - eta                      # positive = we were optimistic (late)
    print(f"{name:&lt;22} MAE={np.abs(err).mean():5.2f}  RMSE={np.sqrt((err**2).mean()):5.2f}  "
          f"bias={err.mean():+5.2f}  late={np.mean(err &gt; 0):4.0%}  within 5 min={np.mean(np.abs(err) &lt;= 5):4.0%}")

report("baseline 15+4*km", 15 + 4 * km)
report("linear, held-out", loo)
report("linear held-out +3", loo + 3)       # promise a little later than the estimate</div>
<div class="fx" data-lang="text">held-out ETA: [27.5, 42.3, 27.8, 58.9, 20.4, 51.1, 29.1, 32.1]
baseline 15+4*km       MAE= 8.00  RMSE=10.79  bias=+8.00  late= 75%  within 5 min= 50%
linear, held-out       MAE= 1.25  RMSE= 1.38  bias=-0.16  late= 50%  within 5 min=100%
linear held-out +3     MAE= 3.16  RMSE= 3.45  bias=-3.16  late=  0%  within 5 min= 88%</div>
  <p>Reading it line by line:</p>
  <ul>
    <li><strong>Held-out MAE 1.25</strong> vs 0.66 on training rows: the honest error is about twice as big. Still far better than the baseline's 8.0.</li>
    <li><strong>bias</strong> = mean of (actual − ETA). The baseline's +8.00 means it is systematically optimistic. The linear model's −0.16 is nearly unbiased.</li>
    <li><strong>late = 50%</strong>: an unbiased model is above the truth half the time and below it half the time. Half of Biteful's customers would wait longer than promised. Good MAE, bad promise.</li>
    <li><strong>+3 buffer</strong>: promising 3 minutes later than the estimate raises MAE to 3.16 but cuts late orders to 0%. That is the trade-off between accuracy and the promise, and a quantile model (predict the 80th percentile, see <a class="xref" data-note="sd_cases">Case Studies</a>) does it properly.</li>
  </ul>
  <p>The same idea at scale: 20,000 simulated orders over 60 days, the monsoon arriving after day 40. We compare the rule, a linear model, LightGBM, and LightGBM with the leaky <code>pickup</code> column; each with a <strong>time split</strong> (train days 1–45, test 46–60) and a random split.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from sklearn.linear_model import LinearRegression

# The same idea at scale: 20,000 simulated Biteful orders over 60 days
rng = np.random.default_rng(7)
n = 20_000
day = np.sort(rng.integers(1, 61, n))
rest = rng.integers(0, 50, n)
prep_base = rng.uniform(8, 18, 50)[rest]                  # each kitchen's true speed
hour = rng.choice([12, 13, 14, 19, 20, 21, 22], n)
rush = np.isin(hour, [20, 21]).astype(int)
km = np.clip(rng.gamma(2.2, 1.4, n), 0.3, 9)
queue = rng.poisson(2 + 4 * rush)
rain = (rng.random(n) &lt; np.where(day &gt; 40, 0.40, 0.10)).astype(int)   # monsoon after day 40
pickup = prep_base + 1.3 * queue + rng.gamma(2, 1.5, n)              # food handed to rider
actual = pickup + km * (3.0 + 2.0 * rain) + 4 * rush + rng.gamma(2, 1.5, n)
prep_7d = prep_base + rng.normal(0, 1, n)                 # batch feature: noisy estimate of speed

df = pd.DataFrame(dict(day=day, km=km, queue=queue, rain=rain, hour=hour,
                       prep_7d=prep_7d, pickup=pickup, actual=actual))
honest = ["km", "queue", "rain", "hour", "prep_7d"]

def fit_eval(train, test, cols, kind):
    if kind == "rule":
        pred = 15 + 4 * test["km"]
    elif kind == "linear":
        pred = LinearRegression().fit(train[cols], train["actual"]).predict(test[cols])
    else:
        m = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, num_leaves=31,
                              n_jobs=1, verbose=-1, random_state=0)
        pred = m.fit(train[cols], train["actual"]).predict(test[cols])
    err = test["actual"] - pred
    return np.abs(err).mean(), np.mean(err &gt; 0), np.quantile(np.abs(err), 0.9)

time_tr, time_te = df[df.day &lt;= 45], df[df.day &gt; 45]               # past -&gt; future
rnd = rng.permutation(n); rnd_tr, rnd_te = df.iloc[rnd[:15_000]], df.iloc[rnd[15_000:]]

print(f"{'model':&lt;26}{'split':&lt;8}{'MAE':&gt;6}{'late':&gt;7}{'P90 err':&gt;9}")
for name, cols, kind in [("baseline rule 15+4*km", None, "rule"),
                         ("linear (honest features)", honest, "linear"),
                         ("LightGBM (honest)", honest, "gbm"),
                         ("LightGBM + pickup (LEAK)", honest + ["pickup"], "gbm")]:
    for split, (tr, te) in [("time", (time_tr, time_te)), ("random", (rnd_tr, rnd_te))]:
        mae, late, p90 = fit_eval(tr, te, cols, kind)
        print(f"{name:&lt;26}{split:&lt;8}{mae:&gt;6.2f}{late:&gt;7.0%}{p90:&gt;9.1f}")</div>
<div class="fx" data-lang="text">model                     split      MAE   late  P90 err
baseline rule 15+4*km     time      9.18    88%     18.2
baseline rule 15+4*km     random    8.27    85%     17.1
linear (honest features)  time      3.07    46%      6.5
linear (honest features)  random    2.90    46%      6.0
LightGBM (honest)         time      2.52    44%      5.1
LightGBM (honest)         random    2.49    45%      5.0
LightGBM + pickup (LEAK)  time      1.65    41%      3.1
LightGBM + pickup (LEAK)  random    1.67    42%      3.2</div>
  <ul>
    <li><strong>Model choice is worth it</strong>: on the honest time split, LightGBM 2.52 vs linear 3.07 vs rule 9.18 minutes.</li>
    <li><strong>Leakage flatters</strong>: adding <code>pickup</code> "improves" MAE to 1.65. It would collapse live, because pickup time does not exist when the ETA is shown.</li>
    <li><strong>Random splits flatter</strong>: the rule and linear model look better on a random split (8.27, 2.90) than on the time split (9.18, 3.07), because the random test set has fewer monsoon days. The future is rainier than the past; only the time split admits it.</li>
    <li><strong>late ≈ 44%</strong> even for the best model: the promise needs a buffer or quantile, as above.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Mock exams. Testing a student on the questions they practised (training rows) tells you nothing. A fresh paper set by someone else (held-out) is fair. A paper from next term's syllabus (time split) is the real test.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Held-out evaluation</strong>: scoring on data not used for training. <strong>Time-based split</strong>: train on the past, test on the later period. <strong>Late rate</strong>: share of orders with actual &gt; shown ETA. <strong>P90 error</strong>: the error 90% of orders stay within.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random splits on time-ordered data. They let the model see the future's weather, menus and traffic, so offline numbers are too good. Split by time, as in <a class="xref" data-note="ml_ts_ml">ML for Time Series</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: serving architecture.</b> Offline we have a model that beats the baseline by 6.7 minutes. But offline is a file on a laptop. How does the model get fresh features and answer 11,111 times a second in 60 ms?</div>

  <h2 id="sf-system"><span class="num">09</span>Serving Architecture</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The model needs km (computed now), the kitchen queue (changing every minute) and prep_7d (computed last night), all within 60 ms, for 20 cards at once. Which boxes produce those values, which box runs the model, and what happens when one of them is slow?</p>
  </div>
  <p>This is the "system half" of the answer, and the half that separates senior from junior candidates. Here is Biteful's ETA system on one page:</p>
  <figure class="viz"><svg viewBox="0 0 700 330" width="700" role="img">
    <defs><marker id="sf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" font-weight="600" font-size="12">Online: while Asha waits (60 ms)</text>
    <rect x="10" y="28" width="110" height="46" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="65" y="47" text-anchor="middle" font-size="12" font-weight="600">Biteful app</text><text x="65" y="63" text-anchor="middle" font-size="10" class="tm">feed: 20 cards</text>
    <rect x="160" y="28" width="130" height="46" rx="6" class="fg" stroke="currentColor" stroke-opacity=".5"/><text x="225" y="47" text-anchor="middle" font-size="12" font-weight="600">ETA service</text><text x="225" y="63" text-anchor="middle" font-size="10" class="tm">model v12 in memory</text>
    <rect x="330" y="28" width="150" height="46" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="405" y="47" text-anchor="middle" font-size="12" font-weight="600">Online store (Redis)</text><text x="405" y="63" text-anchor="middle" font-size="10" class="tm">queue, prep_7d, rain</text>
    <rect x="520" y="28" width="170" height="46" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="605" y="47" text-anchor="middle" font-size="12" font-weight="600">Route engine</text><text x="605" y="63" text-anchor="middle" font-size="10" class="tm">km for 20 restaurants</text>
    <line x1="120" y1="51" x2="157" y2="51" stroke="currentColor" marker-end="url(#sf-a9)"/>
    <line x1="290" y1="51" x2="327" y2="51" stroke="currentColor" marker-end="url(#sf-a9)"/>
    <path d="M225,74 V92 H605 V77" fill="none" stroke="currentColor" marker-end="url(#sf-a9)"/>
    <text x="690" y="110" text-anchor="end" font-size="10" class="tm">timeout → fallback 15 + 4 × km</text>
    <line x1="10" y1="124" x2="690" y2="124" stroke="currentColor" stroke-dasharray="6 4" stroke-opacity=".5"/>
    <text x="10" y="148" font-weight="600" font-size="12">Offline / streaming</text>
    <rect x="10" y="158" width="130" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="75" y="177" text-anchor="middle" font-size="12" font-weight="600">Order events</text><text x="75" y="193" text-anchor="middle" font-size="10" class="tm">Kafka topic</text>
    <rect x="180" y="158" width="140" height="46" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="250" y="177" text-anchor="middle" font-size="12" font-weight="600">Stream job</text><text x="250" y="193" text-anchor="middle" font-size="10" class="tm">queue per kitchen, 15 min</text>
    <rect x="180" y="226" width="140" height="46" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="250" y="245" text-anchor="middle" font-size="12" font-weight="600">Nightly batch</text><text x="250" y="261" text-anchor="middle" font-size="10" class="tm">prep_7d at 02:00</text>
    <rect x="10" y="226" width="130" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="75" y="245" text-anchor="middle" font-size="12" font-weight="600">Warehouse</text><text x="75" y="261" text-anchor="middle" font-size="10" class="tm">orders + served logs</text>
    <rect x="370" y="226" width="150" height="46" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="445" y="245" text-anchor="middle" font-size="12" font-weight="600">Training pipeline</text><text x="445" y="261" text-anchor="middle" font-size="10" class="tm">PIT join → LightGBM</text>
    <rect x="560" y="226" width="130" height="46" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="625" y="245" text-anchor="middle" font-size="12" font-weight="600">Model registry</text><text x="625" y="261" text-anchor="middle" font-size="10" class="tm">v12 champion</text>
    <rect x="370" y="158" width="150" height="46" rx="6" class="fr" stroke="currentColor" stroke-opacity=".5"/><text x="445" y="177" text-anchor="middle" font-size="12" font-weight="600">Monitoring</text><text x="445" y="193" text-anchor="middle" font-size="10" class="tm">latency, drift, late %</text>
    <line x1="140" y1="181" x2="177" y2="181" stroke="currentColor" marker-end="url(#sf-a9)"/>
    <line x1="140" y1="249" x2="177" y2="249" stroke="currentColor" marker-end="url(#sf-a9)"/>
    <line x1="320" y1="249" x2="367" y2="249" stroke="currentColor" marker-end="url(#sf-a9)"/>
    <line x1="520" y1="249" x2="557" y2="249" stroke="currentColor" marker-end="url(#sf-a9)"/>
    <line x1="75" y1="204" x2="75" y2="223" stroke="currentColor" marker-end="url(#sf-a9)"/>
    <path d="M250,158 V132 H380 V76" fill="none" class="sb" stroke-dasharray="5 4" marker-end="url(#sf-a9)"/>
    <path d="M320,236 H345 V139 H420 V76" fill="none" class="sb" stroke-dasharray="5 4" marker-end="url(#sf-a9)"/>
    <path d="M625,226 V146 H260 V76" fill="none" class="sb" stroke-dasharray="5 4" marker-end="url(#sf-a9)"/>
    <path d="M160,74 V214 H110 V223" fill="none" class="sg" stroke-dasharray="3 3" marker-end="url(#sf-a9)"/>
    <text x="45" y="300" font-size="10" class="tm">green dotted: served ETAs + features are logged, joined with delivery times → training rows</text>
    <text x="45" y="316" font-size="10" class="tm">blue dashed: fresh features and new models flow up into the request path</text>
  </svg><figcaption>Biteful's ETA system. Top: the request path, budgeted in milliseconds. Bottom: the pipelines that keep its inputs fresh and its model current.</figcaption></figure>
  <p>Follow one request. Asha's app asks the ETA service for 20 restaurants. The service fetches queue, prep_7d and rain for all 20 in one call to Redis, asks the route engine for 20 distances, runs the model on a batch of 20 rows, and returns 20 numbers. If anything times out, it returns the baseline (15 + 4 × km) instead of a blank card. Underneath, a stream job turns order events into live queue counts, a nightly batch writes prep_7d, and the training pipeline (with point-in-time joins) produces new model versions in a registry (<a class="xref" data-note="mlops_mlflow">MLflow</a>). Every served ETA, with the exact features used, is logged, so tomorrow's training rows match what serving saw.</p>
  <div class="cards">
    <div><b>Batch vs real-time</b><p>ETA depends on this minute's queue and this address: real-time. prep_7d can be batch.</p><small><a class="xref" data-note="sd_serving">Serving</a> §01</small></div>
    <div><b>Latency budget</b><p>60 ms split across fetch, route, model, headroom.</p><small><a class="xref" data-note="sd_serving">Serving</a> §02</small></div>
    <div><b>Fallback</b><p>Baseline rule when the model or Redis is slow.</p><small>Never a blank card</small></div>
    <div><b>Deployment</b><p>Container, health checks, autoscaling.</p><small><a class="xref" data-note="mlops_deploy">Deployment</a>, <a class="xref" data-note="mlops_k8s">Kubernetes</a>, <a class="xref" data-note="mlops_cloud">cloud platforms</a></small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant chain. The counter (ETA service) must hand over food in minutes. Behind it, the prep kitchen chops vegetables overnight (batch features), a runner keeps the order board updated every minute (stream job), and head office tests and ships new recipes (training pipeline and registry).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Request path</strong>: all work done while the user waits. <strong>Model registry</strong>: a versioned store of trained models with their status (staging, production). <strong>Fallback</strong>: a simpler answer used when the main path fails or is too slow.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Drawing only the top row. Without the logging arrow (served features → training data) and the registry, there is no way to retrain consistently or roll back.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: monitoring and iteration.</b> The system runs and answers in time. In July the monsoon arrives, a new metro line closes roads, and a pipeline bug fills <code>rain</code> with zeros. The service still returns "200 OK". How would anyone know, and how does the system get better rather than worse?</div>

  <h2 id="sf-monitor"><span class="num">10</span>Monitoring &amp; Iteration</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A model can be up, fast and wrong. What do we watch so we notice, how do we decide to retrain, and how do we make sure version 13 is really better than version 12 before every customer sees it?</p>
  </div>
  <p>Three jobs close the loop. Each has its own note; here is the skeleton you say in an interview.</p>
  <table class="tbl">
    <tr><th>Job</th><th>For Biteful ETA</th><th>Detail in</th></tr>
    <tr><td>Monitor</td><td>System (p99 latency, fallback rate), data (null rate of rain, distance distribution), model (late rate and MAE as deliveries land, ~1 hour later), business (cancellations, support calls)</td><td><a class="xref" data-note="sd_monitoring">Monitoring</a></td></tr>
    <tr><td>Retrain</td><td>Weekly schedule plus triggers (late rate &gt; 25% for 3 hours; distance drift); challenger must beat champion on recent orders</td><td><a class="xref" data-note="sd_monitoring">Monitoring</a></td></tr>
    <tr><td>Test online</td><td>Shadow (same requests, answers not shown) → canary (5%) → A/B on on-time rate and conversion with guardrails</td><td><a class="xref" data-note="sd_serving">Serving</a>, <a class="xref" data-note="sd_experiments">Experiments</a></td></tr>
    <tr><td>Iterate</td><td>Error analysis by slice (rain, new restaurants, far addresses) → new features (rider supply), better labels, new model</td><td>back to section 05</td></tr>
  </table>
  <p>And because this is usually an interview, here is what the interviewer is scoring, and the 45-minute budget that gets you to this section in time:</p>
  <table class="tbl">
    <tr><th>Signal</th><th>Weak answer</th><th>Strong answer</th></tr>
    <tr><td>Problem framing</td><td>Starts with a model</td><td>Asks about goal, scale, latency; states the label</td></tr>
    <tr><td>Metrics</td><td>"Accuracy" / "RMSE"</td><td>Offline + online + guardrail, tied to cost of errors (late vs early)</td></tr>
    <tr><td>Data sense</td><td>Assumes clean labels</td><td>Censoring, leakage, point-in-time joins, logging bias</td></tr>
    <tr><td>Trade-offs</td><td>One option</td><td>Two options, picks one, says why and when it breaks</td></tr>
    <tr><td>Production</td><td>Stops at training</td><td>Serving, fallback, rollout, monitoring, retraining</td></tr>
    <tr><td>Communication</td><td>Silent detours</td><td>Signposts, checks in, keeps time</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 720 118" width="720" role="img"><defs><marker id="sf-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="18" text-anchor="middle" class="tm">0</text><rect x="10" y="26" width="77.7778" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="48.8889" y="48" text-anchor="middle" font-weight="600">5m</text><text x="87.7778" y="18" text-anchor="middle" class="tm">5</text><text x="48.8889" y="80" text-anchor="middle">Clarify</text><rect x="87.7778" y="26" width="77.7778" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="126.667" y="48" text-anchor="middle" font-weight="600">5m</text><text x="165.556" y="18" text-anchor="middle" class="tm">10</text><text x="126.667" y="98" text-anchor="middle">Frame+metrics</text><rect x="165.556" y="26" width="124.444" height="34" rx="2" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="227.778" y="48" text-anchor="middle" font-weight="600">8m</text><text x="290" y="18" text-anchor="middle" class="tm">18</text><text x="227.778" y="80" text-anchor="middle">Data+features</text><rect x="290" y="26" width="124.444" height="34" rx="2" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="352.222" y="48" text-anchor="middle" font-weight="600">8m</text><text x="414.444" y="18" text-anchor="middle" class="tm">26</text><text x="352.222" y="98" text-anchor="middle">Model</text><rect x="414.444" y="26" width="155.556" height="34" rx="2" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="492.222" y="48" text-anchor="middle" font-weight="600">10m</text><text x="570" y="18" text-anchor="middle" class="tm">36</text><text x="492.222" y="80" text-anchor="middle">Architecture+serving</text><rect x="570" y="26" width="93.3333" height="34" rx="2" class="fr" stroke="currentColor" stroke-opacity=".4"/><text x="616.667" y="48" text-anchor="middle" font-weight="600">6m</text><text x="663.333" y="18" text-anchor="middle" class="tm">42</text><text x="616.667" y="98" text-anchor="middle">Eval+monitoring</text><rect x="663.333" y="26" width="46.6667" height="34" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="686.667" y="48" text-anchor="middle" font-weight="600">3m</text><text x="710" y="18" text-anchor="middle" class="tm">45</text><text x="686.667" y="80" text-anchor="middle">Wrap-up</text></svg><figcaption>A 45-minute budget. Most candidates overspend on the model and never reach serving or monitoring.</figcaption></figure>
  <p>Each bar is minutes. Serving gets the biggest slice, and the model gets the same as data. A <strong>trade-off</strong> sentence scores well: "Nightly prep_7d is cheap but a day stale; a streaming prep time is fresh but costly. I start nightly because kitchens change slowly, and stream the queue because it changes by the minute."</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new dish at a restaurant chain. It goes on the menu at one branch first (canary), the manager reads reviews every week (monitoring), and the recipe is revised from the complaints (iteration).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Drift</strong>: the world changing so the model's lessons stop fitting. <strong>Champion / challenger</strong>: the model in production / the candidate that must beat it. <strong>Iteration loop</strong>: monitor → analyse errors → improve data, features or model → test → ship.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"We'll retrain sometimes." Name the trigger (schedule, drift threshold, metric drop), the gate (challenger beats champion on the same recent data) and the rollout (shadow → canary → A/B).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> The path is complete. Which wrong turns do most candidates take on it?</div>

  <h2 id="sf-mistakes"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have walked the path once. Where do real answers usually go wrong, and what one-sentence fix can you say out loud for each?</p>
  </div>
  <table class="tbl">
    <tr><th>Mistake</th><th>Fix (Biteful ETA)</th></tr>
    <tr><td>No clarifying questions</td><td>First 5 minutes: goal (kept promises), scale (556 peak QPS), latency (60 ms)</td></tr>
    <tr><td>Model-first, no baseline</td><td>15 + 4 × km first: MAE 8.0; it is also the fallback</td></tr>
    <tr><td>Leaky features</td><td>Ask "known at prediction time?" of every column; drop pickup_min</td></tr>
    <tr><td>Naive joins</td><td>Point-in-time join: order 102 gets prep_7d 15.5, not 18.0</td></tr>
    <tr><td>Random split on time data</td><td>Train on days 1–45, test on 46–60</td></tr>
    <tr><td>Only MAE</td><td>Also late rate and P90 error; buffer or quantile for the promise</td></tr>
    <tr><td>Training-serving skew</td><td>Same feature code both paths; log served features</td></tr>
    <tr><td>No cold-start story</td><td>New restaurant: category prior for prep time until 7 days of data</td></tr>
    <tr><td>Ships without online test</td><td>Shadow → canary → A/B with guardrails</td></tr>
    <tr><td>"Retrain sometimes"</td><td>Weekly + triggers; champion–challenger gate</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> All nine steps on one page, each with its number on orders 101–108.</div>

  <h2 id="sf-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which step needs which earlier step, which question does each answer, and what did each produce on our eight orders?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 250" width="700" role="img">
    <defs><marker id="sf-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="120" height="50" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="70" y="40" text-anchor="middle" font-size="12" font-weight="600">Goal &amp; metric</text><text x="70" y="57" text-anchor="middle" font-size="10" class="tm">kept promises</text>
    <rect x="150" y="20" width="120" height="50" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="210" y="40" text-anchor="middle" font-size="12" font-weight="600">Requirements</text><text x="210" y="57" text-anchor="middle" font-size="10" class="tm">11,111/s · 60 ms</text>
    <rect x="290" y="20" width="120" height="50" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="350" y="40" text-anchor="middle" font-size="12" font-weight="600">Data &amp; label</text><text x="350" y="57" text-anchor="middle" font-size="10" class="tm">mean 36.0 min</text>
    <rect x="430" y="20" width="120" height="50" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="490" y="40" text-anchor="middle" font-size="12" font-weight="600">Features</text><text x="490" y="57" text-anchor="middle" font-size="10" class="tm">102 → prep 15.5</text>
    <rect x="570" y="20" width="120" height="50" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="630" y="40" text-anchor="middle" font-size="12" font-weight="600">Baseline</text><text x="630" y="57" text-anchor="middle" font-size="10" class="tm">MAE 8.0</text>
    <rect x="570" y="120" width="120" height="50" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="630" y="140" text-anchor="middle" font-size="12" font-weight="600">Model</text><text x="630" y="157" text-anchor="middle" font-size="10" class="tm">fit MAE 0.66</text>
    <rect x="430" y="120" width="120" height="50" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="490" y="140" text-anchor="middle" font-size="12" font-weight="600">Offline eval</text><text x="490" y="157" text-anchor="middle" font-size="10" class="tm">1.25 held-out</text>
    <rect x="290" y="120" width="120" height="50" rx="6" class="fg" stroke="currentColor" stroke-opacity=".5"/><text x="350" y="140" text-anchor="middle" font-size="12" font-weight="600">Serving</text><text x="350" y="157" text-anchor="middle" font-size="10" class="tm">service + stores</text>
    <rect x="150" y="120" width="120" height="50" rx="6" class="fr" stroke="currentColor" stroke-opacity=".5"/><text x="210" y="140" text-anchor="middle" font-size="12" font-weight="600">Monitoring</text><text x="210" y="157" text-anchor="middle" font-size="10" class="tm">late %, drift</text>
    <rect x="10" y="120" width="120" height="50" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="70" y="140" text-anchor="middle" font-size="12" font-weight="600">Iterate</text><text x="70" y="157" text-anchor="middle" font-size="10" class="tm">new data, model</text>
    <line x1="130" y1="45" x2="147" y2="45" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <line x1="270" y1="45" x2="287" y2="45" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <line x1="410" y1="45" x2="427" y2="45" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <line x1="550" y1="45" x2="567" y2="45" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <line x1="630" y1="70" x2="630" y2="117" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <line x1="570" y1="145" x2="553" y2="145" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <line x1="430" y1="145" x2="413" y2="145" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <line x1="290" y1="145" x2="273" y2="145" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <line x1="150" y1="145" x2="133" y2="145" stroke="currentColor" marker-end="url(#sf-c0)"/>
    <path d="M70,120 V95 H350 V73" fill="none" class="sb" stroke-dasharray="5 4" marker-end="url(#sf-c0)"/>
    <text x="210" y="90" text-anchor="middle" font-size="10" class="tm">the loop: back to data</text>
    <text x="350" y="198" text-anchor="middle" font-size="11">Each box consumes the one before it: the metric defines the label,</text>
    <text x="350" y="215" text-anchor="middle" font-size="11">the numbers choose online features, the baseline is the bar and the fallback,</text>
    <text x="350" y="232" text-anchor="middle" font-size="11">and monitoring feeds the next round of data.</text>
  </svg><figcaption>The framework as one chain, with the value each step produced on orders 101–108.</figcaption></figure>
  <table class="tbl"><caption>Every step on Biteful's ETA</caption>
    <tr><th>Step</th><th>Built from</th><th>Answers which question</th><th>Value on orders 101–108</th><th>When to use</th></tr>
    <tr><td>Goal &amp; metric</td><td>business ask</td><td>what should improve, measured how?</td><td>on-time rate; MAE + late % offline</td><td>always first</td></tr>
    <tr><td>Requirements</td><td>goal + user counts</td><td>how big, how fast?</td><td>139 / 556 QPS; 11,111 ETAs/s; 60 ms; 17.3 GB</td><td>before any design choice</td></tr>
    <tr><td>Label</td><td>order timestamps</td><td>what is the right answer?</td><td>28, 41, 30, 58, 19, 52, 27, 33 (mean 36.0)</td><td>every supervised design</td></tr>
    <tr><td>Leakage check</td><td>label time vs feature time</td><td>which columns cheat?</td><td>pickup_min dropped; leaky GBM 1.65 vs honest 2.52</td><td>every feature</td></tr>
    <tr><td>Point-in-time join</td><td>feature history + label time</td><td>value as it was then?</td><td>101 → 14.0, 102 → 15.5, 109 → 15.5 (naive: 18.0)</td><td>any slow-changing feature</td></tr>
    <tr><td>Baseline</td><td>domain rule</td><td>bar to beat, fallback?</td><td>15 + 4 × km: MAE 8.0, 75% late</td><td>always</td></tr>
    <tr><td>Model</td><td>features + labels</td><td>can we do better?</td><td>3.25/km, 2.42/queue, 8.71 rain; fit MAE 0.66</td><td>once baseline exists</td></tr>
    <tr><td>Offline eval</td><td>held-out / time split</td><td>good on unseen orders?</td><td>held-out 1.25, 50% late; +3 → 0% late</td><td>before any launch</td></tr>
    <tr><td>Serving</td><td>model + features + budget</td><td>answer live in time?</td><td>ETA service, Redis, stream, batch, fallback</td><td>online products</td></tr>
    <tr><td>Monitoring &amp; iteration</td><td>logs + labels</td><td>still right; getting better?</td><td>late %, drift, champion–challenger</td><td>forever after launch</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Each step exists because the previous one left a gap: the goal defines the label, the numbers choose online vs offline, leakage and point-in-time rules make the training rows honest, the baseline sets the bar and the fallback, offline evaluation tells you if the model is worth serving, and monitoring tells you when to go round the loop again.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> After it, <a class="xref" data-note="sd_serving">Serving</a> zooms into section 09: how the 60 ms is actually spent.</div>

  <h2 id="sf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Biteful's ETA, the "34 min" on every restaurant card. Eight orders in Pune (101–108) at Dosa Hut, Biryani Bros and Pizza Point; features km, kitchen queue (last 15 min), rain; label = delivered − placed.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>The path</td><td>where do I start?</td><td>8 boxes, said out loud</td><td>first box empty → goal</td></tr>
    <tr><td>Goal &amp; metric</td><td>what should improve?</td><td>kept promises; regression in minutes</td><td>how big? → requirements</td></tr>
    <tr><td>Requirements</td><td>how much, how fast?</td><td>556 peak QPS, 11,111/s, 60 ms</td><td>learn from what? → data</td></tr>
    <tr><td>Data, labels</td><td>right answer? cheating columns?</td><td>mean 36.0; pickup_min leaks</td><td>facts at the right time? → features</td></tr>
    <tr><td>Features</td><td>which facts, when?</td><td>online km/queue/rain; nightly prep_7d; PIT 15.5</td><td>which model? → baseline</td></tr>
    <tr><td>Baseline, model</td><td>simplest, then better?</td><td>8.0 → 0.66 (fit)</td><td>honest? → offline eval</td></tr>
    <tr><td>Offline eval</td><td>unseen orders?</td><td>1.25 held-out, 50% late; GBM 2.52 at scale</td><td>live? → serving</td></tr>
    <tr><td>Serving</td><td>answer in time?</td><td>service + stores + fallback</td><td>still right? → monitoring</td></tr>
    <tr><td>Monitoring, iteration</td><td>still right, getting better?</td><td>late %, drift, champion–challenger</td><td>loop back to data</td></tr>
  </table>
  <h3>Formulas and numbers</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols</th><th>On Biteful</th></tr>
    <tr><td>QPS = requests per day ÷ 86,400</td><td>86,400 = seconds in a day</td><td>12M ÷ 86,400 = 138.9</td></tr>
    <tr><td>peak QPS = QPS × peak factor</td><td>peak factor 2–5</td><td>138.9 × 4 = 555.6</td></tr>
    <tr><td>predictions/s = peak QPS × items per request</td><td>20 cards per feed load</td><td>11,111</td></tr>
    <tr><td>storage = rows × features × 4 bytes</td><td>float32 = 4 bytes</td><td>108M × 40 × 4 = 17.3 GB</td></tr>
    <tr><td>label = delivered − placed</td><td>minutes</td><td>order 101: 13:33 − 13:05 = 28</td></tr>
    <tr><td>MAE = mean |y − ŷ|</td><td>y actual, ŷ predicted</td><td>baseline 64 ÷ 8 = 8.0</td></tr>
    <tr><td>bias = mean (y − ŷ)</td><td>+ = late on average</td><td>baseline +8.00, linear −0.16</td></tr>
    <tr><td>late rate = share with y &gt; ŷ</td><td>broken promises</td><td>75% baseline, 50% linear, 0% with +3</td></tr>
    <tr><td>ŷ = b0 + b1·km + b2·queue + b3·rain</td><td>b's by least squares</td><td>13.87, 3.25, 2.42, 8.71</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>ML system design</td><td>planning data, training, serving, evaluation, monitoring and improvement as one product</td></tr>
    <tr><td>Framing</td><td>input, output and label that turn a business goal into a learnable task</td></tr>
    <tr><td>Offline / online / guardrail metric</td><td>scored on old data / decides the A/B test / must not get worse</td></tr>
    <tr><td>Censored label</td><td>true value never observed (cancelled orders)</td></tr>
    <tr><td>Leakage</td><td>training on information not available at prediction time</td></tr>
    <tr><td>Online / offline feature</td><td>computed at request time / precomputed on a schedule</td></tr>
    <tr><td>Point-in-time join</td><td>feature value as of the label's timestamp, never later</td></tr>
    <tr><td>Baseline, fallback</td><td>simplest predictor; the same rule served when the model fails</td></tr>
    <tr><td>Time-based split</td><td>train on the past, test on a later period</td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>The fixed path said out loud; numbers before design; a baseline as bar and fallback; point-in-time joins; time splits; several metrics (MAE, late %, P90); a fallback on the request path; logged served features; a named retrain trigger and rollout plan.</p></div>
    <div><b>Avoid</b><p>Model-first answers; average-QPS sizing; columns stamped after the prediction moment; naive "latest value" joins; random splits on time data; judging a promise by MAE alone; drawing only the request path; "retrain sometimes".</p></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>3M users × 4 loads/day, 4× peak, 20 cards: ETAs per second at peak? <em>12M ÷ 86,400 = 138.9; × 4 = 555.6; × 20 ≈ 11,111.</em></li>
    <li>Why can't pickup time be a feature for the feed ETA? <em>It is only known after the order is placed; using it is leakage (offline 1.65 vs honest 2.52 MAE).</em></li>
    <li>prep_7d is written at 02:00 daily; an order at 01:30 on 3 March gets which value? <em>The 2 March value (15.5), the last one at or before 01:30.</em></li>
    <li>An unbiased model has MAE 1.25. Why might customers still be unhappy? <em>It is late about half the time (50%); add a buffer or predict a higher quantile.</em></li>
    <li>Which number makes ETA a real-time problem rather than batch? <em>The answer depends on this minute's kitchen queue and this address; 11,111 requests/s must be answered while users wait.</em></li>
  </ol>

  <h2 id="sf-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line, what is ML system design and why is the model only a small part?</summary><div class="qa-body">Planning everything needed for a model to help real users: data logging, training, fast serving, safe testing, monitoring and retraining. Without those pieces even a perfect model never reaches users, or breaks silently after launch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"Design a food-delivery ETA system." What are your first three questions?</summary><div class="qa-body">(1) What business number should move: on-time promises, cancellations, conversion? (2) Scale: users, feed loads, orders per day, cities. (3) Where is the ETA shown and how fast must it come: 20 cards in a 200 ms feed, or once at checkout? Bonus: new restaurants (cold start) and weather.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why name offline, online and guardrail metrics separately?</summary><div class="qa-body">They answer different questions. Offline (MAE, late %) picks candidates cheaply; online (on-time rate, cancellations) decides what ships; guardrails (p99 latency, conversion) stop a "win" that breaks something else. Offline and online often disagree, so you need both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A fraud model has 99.8% accuracy. Is it good?</summary><div class="qa-body">You can't tell. If 0.2% of payments are fraud, a model that never flags anything also scores 99.8%. Ask for recall, precision, or money saved.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>50M DAU, 10 feed loads each. Average and peak QPS?</summary><div class="qa-body">500M ÷ 86,400 ≈ 5.8k QPS average. With a 3× peak factor, ≈ 17k QPS. Size servers for peak plus headroom.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Storage for 200M users × 200 float32 features?</summary><div class="qa-body">200M × 200 × 4 B = 160 GB. Fits a sharded in-memory store (Redis cluster, DynamoDB with a cache) with replicas.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why start with a baseline when you know a GBM will win?</summary><div class="qa-body">It sets the bar (8.0 minutes for Biteful), exposes data and pipeline bugs early, ships value fast, and becomes the fallback when the model or feature store fails. Often the gain from the fancy model is smaller than expected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose batch prediction over real-time?</summary><div class="qa-body">When inputs change slowly and the entities can be listed in advance: daily emails, demand forecasts, churn scores. Choose real-time when the request context (this address, this minute's kitchen queue, this payment) matters, as for ETA.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The interviewer says "assume infinite data and compute". What do you still discuss?</summary><div class="qa-body">Label quality (censoring, noisy "delivered" taps), the right objective (promise vs MAE), latency at serving, leakage and training-serving skew, rollout safety and monitoring. Compute doesn't fix a wrong label or a feedback loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your offline MAE improved but the A/B test is flat. Name three causes.</summary><div class="qa-body">(1) Training-serving skew: features differ online. (2) The metric doesn't track the goal (lower MAE but the same late rate). (3) The effect is too small for the test's power, or the offline data is biased by what was logged. Also: added latency hurting conversion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle running out of time?</summary><div class="qa-body">Keep to the budget: skeleton end-to-end first, then deepen where the interviewer points. If short on time, summarise remaining stages in one line each (serving, A/B, monitoring) rather than leaving them out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes an answer "senior"?</summary><div class="qa-body">Explicit trade-offs, awareness of data problems (delay, censoring, leakage, skew), a production plan (fallback, rollout, monitoring, retraining) and cost thinking. Juniors describe a model; seniors describe a system that stays correct over time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the requirements step have to come before features?</summary><div class="qa-body">The numbers decide where each feature can live. 11,111 predictions/s in 60 ms means every feature must be a millisecond lookup or a cheap computation at request time, so slow aggregates like prep_7d must be precomputed in batch and fast-changing ones like the kitchen queue need a stream job. Without the numbers you can't tell which.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the point-in-time join but do everything else right?</summary><div class="qa-body">Training rows get feature values from after the order (order 101 gets prep_7d 18.0 instead of 14.0). The model learns relationships that never existed at prediction time, offline evaluation looks better than reality, and live performance drops with no code error to point at. It is leakage hiding inside a join.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is the baseline mentioned again in the serving architecture?</summary><div class="qa-body">The same simple rule (15 + 4 × km) that set the bar offline is the fallback on the request path: when the model or Redis times out, the card still shows a sensible ETA instead of a blank. One idea, two jobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does monitoring feed back into the data step?</summary><div class="qa-body">Logged served features plus delivered times become tomorrow's training rows; error analysis by slice (rain, new restaurants) suggests new features and label fixes; drift and late-rate triggers start a retrain whose challenger must beat the champion. The framework is a loop, not a line.</div></details>
</main>`
});
