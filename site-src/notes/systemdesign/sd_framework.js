// notes/systemdesign/sd_framework.js — How to Approach ML System Design
Object.assign(TOPIC_CONTENT, {
  "sd_framework": `<main>
<h1>How to Approach ML System Design</h1>
  <div class="where"><span>ML System Design</span><span>How to Approach ML System Design</span></div>
  <p class="lead">A model in a notebook helps nobody. Before it can help real users, someone has to collect the data it learns from, run it for millions of people in a fraction of a second, check that it is still right next month, and keep improving it. Planning all of that as one working product is called <strong>ML system design</strong>, and it is also the name of a standard interview round for ML engineers and senior data scientists, where you get a one-line prompt such as "Design a food-delivery ETA system" and 45 minutes. This note teaches one repeatable path for answering such a prompt: clarify the requirements, define the metrics, work out the data and labels, choose features, pick a model, design serving, plan monitoring, and close the loop with iteration. We walk the whole path on one running example, <strong>Biteful's delivery-time (ETA) prediction</strong>, the "34 min" printed on every restaurant card in the Biteful food app, using eight real-looking orders (numbers 101 to 108) from one Tuesday in Pune, and every estimate and score is computed in real Python.</p>

  <h2 id="sf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML System Design</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The path</div>
        <ul>
          <li>Clarify → metrics → data → features → model → serving → monitoring → iterate</li>
          <li>Skeleton pass first, then go deep where the interviewer points</li>
          <li>The model is one box of many</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Problem half</div>
        <ul>
          <li><b>Framing</b>: input, output, label (delivered − placed)</li>
          <li><b>Metrics</b>: offline (MAE, late %), online (on-time rate), business, guardrails</li>
          <li><b>Estimates</b>: QPS = per day ÷ 86,400; size for the peak</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data half</div>
        <ul>
          <li><b>Leakage</b>: no column known only after the prediction moment</li>
          <li><b>Online vs offline features</b>, one feature store</li>
          <li><b>Point-in-time joins</b>: the value as it was then</li>
          <li>Baseline first; split by time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">System half</div>
        <ul>
          <li>ETA service + online store + stream job + nightly batch + registry</li>
          <li>Latency budget; fallback to the baseline rule</li>
          <li>Monitor system, data, model, business; retrain on triggers</li>
          <li>Shadow → canary → A/B</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sf-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What ML System Design Is</span><span class="rm-sub">everything a model needs to be useful</span></div></div>
      <div class="rm-item rm-done" data-target="sf-flow"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Framework</span><span class="rm-sub">one fixed path, and how it is scored</span></div></div>
      <div class="rm-item rm-done" data-target="sf-clarify"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Clarifying Requirements and Framing</span><span class="rm-sub">turning a vague ask into an ML task</span></div></div>
      <div class="rm-item rm-done" data-target="sf-metrics"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Metrics: Offline, Online, Business</span><span class="rm-sub">how we will know it works</span></div></div>
      <div class="rm-item rm-done" data-target="sf-est"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Back-of-Envelope Estimates</span><span class="rm-sub">QPS, storage and compute in numbers</span></div></div>
      <div class="rm-item rm-done" data-target="sf-data"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Data, Labels and Leakage</span><span class="rm-sub">where the right answers come from</span></div></div>
      <div class="rm-item rm-done" data-target="sf-feat"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Features and Point-in-Time Joins</span><span class="rm-sub">which facts, computed when</span></div></div>
      <div class="rm-item rm-done" data-target="sf-model"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing a Model: Baseline First</span><span class="rm-sub">the simplest thing, then better</span></div></div>
      <div class="rm-item rm-done" data-target="sf-eval"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Offline Evaluation</span><span class="rm-sub">honest scores on unseen orders</span></div></div>
      <div class="rm-item rm-done" data-target="sf-system"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Serving Architecture</span><span class="rm-sub">the boxes that answer in 60 ms</span></div></div>
      <div class="rm-item rm-done" data-target="sf-monitor"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Monitoring and Iteration</span><span class="rm-sub">noticing problems and getting better</span></div></div>
      <div class="rm-item rm-done" data-target="sf-mistakes"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">what sinks most answers</span></div></div>
      <div class="rm-item rm-done" data-target="sf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">the path, formulas and numbers</span></div></div>
      <div class="rm-item rm-done" data-target="sf-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">ML system design questions</span></div></div>
    </div>
  </div>

  <h2 id="sf-what"><span class="num">01</span>What ML System Design Is</h2>
  <p>Open Biteful at 8 p.m. in Kothrud, Pune. Twenty restaurant cards appear, and each one says something like "34 min". Asha taps Dosa Hut, sees "28 min" at checkout, and orders. If the food arrives in 28 minutes, she trusts the app. If it arrives in 50, she cancels next time, or calls support to ask where her order is. Nobody at Biteful typed those numbers. A model predicted them, for every card, for every user, in a fraction of a second.</p>
  <p>It is tempting to think the model is the whole story, but think about everything else that had to happen. Someone had to record every past order with the time it was placed and the time it was delivered, because "delivered minus placed" is the right answer the model learned from. Someone had to train the model on those records, and train it again when the monsoon arrived and every trip got slower. Some computer had to run the model the moment Asha opened the app, using fresh facts such as how busy Dosa Hut's kitchen is right now, and answer in under 60 milliseconds. Someone had to check that a new version was really better before giving it to everyone, and someone has to watch it every day, because a model that was right in March can be wrong in July. <strong>ML system design</strong> is the planning of all these pieces (data, training, serving, evaluation, monitoring and improvement) and how they connect, so that a model becomes a product that keeps working.</p>
  <p>The picture below shows those pieces for Biteful's ETA, split into two rows:</p>
  <figure class="viz"><svg viewBox="0 0 740 224" width="740" role="img"><defs><marker id="sf-m0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="16" class="tb" font-weight="600">Online: happens while you wait (under 1 second)</text><rect x="10" y="26" width="160" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="45" text-anchor="middle" font-weight="600">1. Asha opens app</text><text x="90" y="62" text-anchor="middle" class="tm">8 pm, Kothrud, Pune</text><rect x="196" y="26" width="160" height="46" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="45" text-anchor="middle" font-weight="600">2. Fetch facts</text><text x="276" y="62" text-anchor="middle" class="tm">queue, distance, rain</text><rect x="382" y="26" width="160" height="46" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="45" text-anchor="middle" font-weight="600">3. Model predicts</text><text x="462" y="62" text-anchor="middle" class="tm">minutes, 20 kitchens</text><rect x="568" y="26" width="160" height="46" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="45" text-anchor="middle" font-weight="600">4. Show “34 min”</text><text x="648" y="62" text-anchor="middle" class="tm">in ~0.2 s</text><line x1="172" y1="49" x2="193" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="358" y1="49" x2="379" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="544" y1="49" x2="565" y2="49" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><rect x="568" y="146" width="160" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="165" text-anchor="middle" font-weight="600">5. Log what you did</text><text x="648" y="182" text-anchor="middle" class="tm">ETA shown + delivered at</text><rect x="382" y="146" width="160" height="46" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="165" text-anchor="middle" font-weight="600">6. Train new model</text><text x="462" y="182" text-anchor="middle" class="tm">nightly</text><rect x="196" y="146" width="160" height="46" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="165" text-anchor="middle" font-weight="600">7. Test on few users</text><text x="276" y="182" text-anchor="middle" class="tm">better? then ship</text><rect x="10" y="146" width="160" height="46" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="165" text-anchor="middle" font-weight="600">8. Watch daily</text><text x="90" y="182" text-anchor="middle" class="tm">still working?</text><line x1="648" y1="74" x2="648" y2="143" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="566" y1="169" x2="545" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="380" y1="169" x2="359" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="194" y1="169" x2="173" y2="169" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m0)"/><line x1="300" y1="144" x2="440" y2="76" class="sb" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sf-m0)"/><text x="384" y="112" text-anchor="start" class="tb">new model goes live</text><text x="10" y="214" class="tb" font-weight="600">Offline: happens in the background (hours, days)</text></svg><figcaption>Top row runs on every app open. Bottom row runs in the background and keeps the top row good.</figcaption></figure>
  <p>Read the top row from left to right: Asha opens the app, the system fetches fresh facts (kitchen queue, distance, rain), the model predicts minutes for 20 kitchens, and the cards show "34 min", all in about 0.2 seconds. This is the <strong>online</strong> part, the work done while a user waits, so it must be fast. Then follow the arrow down and read the bottom row from right to left: every prediction is logged together with the delivery time that arrives later, a new model is trained from those logs, it is tested on a few users, and the whole thing is watched daily. This is the <strong>offline</strong> part, which runs in the background over hours or days. The dashed arrow is the moment a new model goes live and the bottom row improves the top row. Out of eight boxes, the model is box 3.</p>
  <p>A restaurant is a good way to picture it. The recipe is the model. But a restaurant also needs vegetables bought every morning (data), a counter that serves food quickly (serving), a taster before a new dish goes on the menu (testing), and someone reading customer complaints (monitoring). A great recipe with no counter feeds nobody. In interviews you will meet this as prompts like "Design an ETA system", "Design fraud detection for UPI payments" or "Design restaurant recommendations". In a real job, every model you ship needs these same pieces, or it quietly breaks after launch.</p>

  <h2 id="sf-flow"><span class="num">02</span>The Framework</h2>
  <p>The interview prompt is vague on purpose: one sentence, no data, no numbers. The interviewer wants to see whether you can turn it into a plan. If you start with whichever piece you find most interesting, usually the model, you will spend 25 minutes on it and run out of time before serving and monitoring, which are exactly the parts that separate a strong answer from a weak one. The cure is a <strong>framework</strong>: a fixed list of steps that you follow in the same order every time, and announce at the start so the interviewer knows where you are heading. Think of an architect designing a house: they ask who will live there and what the budget is, then plan the rooms, then the plumbing. Nobody starts by choosing the taps.</p>
  <figure class="viz"><svg viewBox="0 0 720 168" width="720" role="img"><defs><marker id="sf-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="12" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="62" y="33" text-anchor="middle" font-weight="600">Clarify</text><text x="62" y="47" text-anchor="middle" class="tm">goal</text><rect x="130" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="180" y="33" text-anchor="middle" font-weight="600">Frame as</text><text x="180" y="47" text-anchor="middle" class="tm">ML task</text><rect x="248" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="298" y="33" text-anchor="middle" font-weight="600">Metrics</text><text x="298" y="47" text-anchor="middle" class="tm">off + online</text><rect x="366" y="14" width="100" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="416" y="33" text-anchor="middle" font-weight="600">Data &amp;</text><text x="416" y="47" text-anchor="middle" class="tm">labels</text><rect x="484" y="14" width="100" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="534" y="40" text-anchor="middle" font-weight="600">Features</text><rect x="602" y="14" width="100" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="652" y="33" text-anchor="middle" font-weight="600">Model</text><text x="652" y="47" text-anchor="middle" class="tm">baseline 1st</text><line x1="114" y1="36" x2="127" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="232" y1="36" x2="245" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="350" y1="36" x2="363" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="468" y1="36" x2="481" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="586" y1="36" x2="599" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><rect x="602" y="112" width="100" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="652" y="131" text-anchor="middle" font-weight="600">Training</text><text x="652" y="145" text-anchor="middle" class="tm">pipeline</text><rect x="484" y="112" width="100" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="534" y="138" text-anchor="middle" font-weight="600">Serving</text><rect x="366" y="112" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="416" y="131" text-anchor="middle" font-weight="600">Offline</text><text x="416" y="145" text-anchor="middle" class="tm">eval</text><rect x="248" y="112" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="298" y="131" text-anchor="middle" font-weight="600">Online</text><text x="298" y="145" text-anchor="middle" class="tm">A/B test</text><rect x="130" y="112" width="100" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="180" y="138" text-anchor="middle" font-weight="600">Monitoring</text><rect x="12" y="112" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="62" y="138" text-anchor="middle" font-weight="600">Iterate</text><line x1="652" y1="60" x2="652" y2="109" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="600" y1="134" x2="587" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="482" y1="134" x2="469" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="364" y1="134" x2="351" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="246" y1="134" x2="233" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="128" y1="134" x2="115" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><path d="M62.0,110 V86 H416.0 V61" class="sb" fill="none" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sf-m1)"/><text x="239" y="81" text-anchor="middle" class="tb">loop back: new data, features, model</text></svg><figcaption>Problem first (blue), then data, model, system, and the loop that keeps it alive. Spend time in that order.</figcaption></figure>
  <p>Read the picture along the top from left to right, then along the bottom from right to left. The blue boxes are about the problem: clarify the goal, frame it as an ML task, and choose metrics. The teal boxes are the data: what records and labels exist, and which features can be built. The violet boxes are the model: a baseline first, then a training pipeline. The bottom row is the system that runs and protects it: serving, offline evaluation, online A/B testing and monitoring. The dashed arrow is what makes it a loop rather than a line: what you learn from monitoring goes back into better data, features and models. Each of the next nine sections of this note is one stretch of that path, in that order.</p>
  <p>Two habits make the framework work in a 45-minute interview. The first is a <strong>skeleton pass</strong>: go through every step quickly, two or three sentences each, so the interviewer sees a complete plan, and only then go deeper where they point. A thin but complete answer scores better than a beautiful model discussion that never reaches serving. The second is a time budget. One that works well is shown below:</p>
  <figure class="viz"><svg viewBox="0 0 720 118" width="720" role="img"><defs><marker id="sf-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="18" text-anchor="middle" class="tm">0</text><rect x="10" y="26" width="77.7778" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="48.8889" y="48" text-anchor="middle" font-weight="600">5m</text><text x="87.7778" y="18" text-anchor="middle" class="tm">5</text><text x="48.8889" y="80" text-anchor="middle">Clarify</text><rect x="87.7778" y="26" width="77.7778" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="126.667" y="48" text-anchor="middle" font-weight="600">5m</text><text x="165.556" y="18" text-anchor="middle" class="tm">10</text><text x="126.667" y="98" text-anchor="middle">Frame+metrics</text><rect x="165.556" y="26" width="124.444" height="34" rx="2" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="227.778" y="48" text-anchor="middle" font-weight="600">8m</text><text x="290" y="18" text-anchor="middle" class="tm">18</text><text x="227.778" y="80" text-anchor="middle">Data+features</text><rect x="290" y="26" width="124.444" height="34" rx="2" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="352.222" y="48" text-anchor="middle" font-weight="600">8m</text><text x="414.444" y="18" text-anchor="middle" class="tm">26</text><text x="352.222" y="98" text-anchor="middle">Model</text><rect x="414.444" y="26" width="155.556" height="34" rx="2" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="492.222" y="48" text-anchor="middle" font-weight="600">10m</text><text x="570" y="18" text-anchor="middle" class="tm">36</text><text x="492.222" y="80" text-anchor="middle">Architecture+serving</text><rect x="570" y="26" width="93.3333" height="34" rx="2" class="fr" stroke="currentColor" stroke-opacity=".4"/><text x="616.667" y="48" text-anchor="middle" font-weight="600">6m</text><text x="663.333" y="18" text-anchor="middle" class="tm">42</text><text x="616.667" y="98" text-anchor="middle">Eval+monitoring</text><rect x="663.333" y="26" width="46.6667" height="34" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="686.667" y="48" text-anchor="middle" font-weight="600">3m</text><text x="710" y="18" text-anchor="middle" class="tm">45</text><text x="686.667" y="80" text-anchor="middle">Wrap-up</text></svg><figcaption>A 45-minute budget. Most candidates overspend on the model and never reach serving or monitoring.</figcaption></figure>
  <p>Each bar is a number of minutes, and the small numbers on top are the running clock. Clarifying and framing with metrics take five minutes each, data and features take eight, the model takes eight, architecture and serving get the largest slice at ten, evaluation and monitoring get six, and three minutes are left to summarise. Notice that the model gets no more time than the data. That is deliberate: interviewers already assume you can train a model, and what they want to hear is everything around it.</p>
  <p>It also helps to know what is being scored. Interviewers usually listen for six things, and for each one there is a recognisably weak and a recognisably strong answer:</p>
  <table class="tbl">
    <tr><th>Signal</th><th>Weak answer</th><th>Strong answer</th></tr>
    <tr><td>Problem framing</td><td>Starts with "I'd use XGBoost"</td><td>Asks about the goal, scale and latency; states input, output and label</td></tr>
    <tr><td>Metrics</td><td>"Accuracy" or "RMSE"</td><td>Offline, online and guardrail metrics, tied to what a mistake costs</td></tr>
    <tr><td>Data sense</td><td>Assumes clean labels</td><td>Delayed and censored labels, leakage, point-in-time joins, logging bias</td></tr>
    <tr><td>Trade-offs</td><td>One option</td><td>Two options, picks one, says why and when it would break</td></tr>
    <tr><td>Production</td><td>Stops at training</td><td>Serving, fallback, rollout, monitoring, retraining</td></tr>
    <tr><td>Communication</td><td>Silent detours</td><td>Signposts, checks in, keeps time</td></tr>
  </table>

  <h2 id="sf-clarify"><span class="num">03</span>Clarifying Requirements and Framing</h2>
  <p>"Predict delivery time" sounds clear, but it is not. Better for whom? Shown where: on 20 cards in the feed, or once at checkout? How many users, and how fast must the answer come? Until those questions are answered, almost any model could be called "right". The first step is therefore <strong>clarifying requirements</strong>: asking questions until you know what the system must do and under what limits. Requirements come in two kinds. <strong>Functional requirements</strong> say what the system does ("show an ETA on every restaurant card and at checkout"). <strong>Non-functional requirements</strong> say how well it must do it: scale, speed, cost, privacy. In an interview you often have to propose reasonable assumptions yourself; the trick is to say them out loud so the interviewer can correct them.</p>
  <p>For Biteful, the clarified picture is this. The goal is fewer late orders, which means fewer cancellations and fewer "where is my order?" calls, and therefore more trust and more orders; notice that the goal is a business outcome, not "better RMSE". The scale is 3 million daily users in Pune and Mumbai, 20 cards per feed load and about 600,000 orders a day. The feed must load within 200 ms for 99% of requests, and the ETA service gets 60 ms of that. And there are constraints that often turn out to be the interviewer's hidden twist: new restaurants with no history (the <strong>cold-start</strong> problem), the monsoon, and riders' privacy.</p>
  <p>The next step is <strong>framing</strong>: turning the business goal into a task a model can learn, by stating three things. The <strong>input</strong> is what the model is given at the moment of prediction: this restaurant, this customer's address, the time, the weather, how busy the kitchen is. The <strong>output</strong> is what it returns: a number of minutes. Because the output is a number, this is a <strong>regression</strong> problem rather than classification. The <strong>label</strong> is the right answer in past data that the model learns from: delivered time minus placed time, in minutes. Saying these three sentences early is one of the clearest signals of a strong candidate, because every later decision depends on them.</p>
  <p>The same business area can be framed in very different ways, and recognising the common framings helps you answer unfamiliar prompts:</p>
  <table class="tbl">
    <tr><th>Business ask</th><th>ML framing</th><th>Label</th></tr>
    <tr><td>Show trustworthy delivery times</td><td>Regression: minutes per order</td><td>Delivered − placed</td></tr>
    <tr><td>More orders from the home feed</td><td>Ranking: order restaurants by P(order | user, restaurant)</td><td>Ordered within the session</td></tr>
    <tr><td>Stop fraudulent payments</td><td>Binary classification per payment</td><td>Chargeback or analyst verdict, weeks later</td></tr>
    <tr><td>Enough riders at 8 p.m.</td><td>Forecasting orders per zone per 30 minutes</td><td>Actual orders (but lower during outages)</td></tr>
  </table>
  <p>Notice how much the label column hides. The fraud label arrives weeks later, so the model learns from old data; the forecasting label is lower during outages, so the model would learn that outages mean low demand unless those periods are handled. Thinking about the label this early is what lets you spot such problems before they are built into the system.</p>

  <h2 id="sf-metrics"><span class="num">04</span>Metrics: Offline, Online, Business</h2>
  <p>Once the task is framed, you need to say how you will know it works. One number is never enough, because you need to judge the model at three different moments, and different numbers are available at each. Before shipping you only have old logged data, so you use an <strong>offline metric</strong>, computed by comparing predictions with known past answers; for the ETA that is MAE (mean absolute error: the average number of minutes the prediction is off), the <strong>late rate</strong> (the share of orders that arrive later than the ETA shown) and the P90 error (the error that 90% of orders stay within). Once a new model is shown to some real users in an A/B test (see <a class="xref" data-note="st_abtesting">A/B Testing</a>), you use an <strong>online metric</strong> measured on real behaviour, such as the on-time rate of the shown ETA. Above both sit the <strong>business metrics</strong> the company actually cares about: cancellations, support calls, orders per user. Finally, <strong>guardrail metrics</strong> are numbers that must not get worse, whatever happens to the main metric: p99 latency, and conversion, because an over-cautious ETA of "55 min" scares customers away.</p>
  <p>A cricket analogy captures the layers. A batsman's score in net practice (offline) helps the selectors pick him; his runs in real matches (online) decide whether he stays in the team; the team's wins (business) are what everybody really wants; and he must not get injured or break team rules (guardrails), however many runs he scores.</p>
  <p>Why so much care? Because <strong>the right metric depends on what a mistake costs</strong>, and a metric that ignores this can make a useless model look excellent. The extreme example is fraud, where fraud is rare:</p>
  <div class="fx" data-lang="py"># 1,000 Biteful card payments in a day; only 2 are fraud
labels = [1, 1] + [0] * 998          # 1 = fraud, 0 = genuine

preds = [0] * 1000                   # a "model" that never flags anything
acc = sum(p == y for p, y in zip(preds, labels)) / len(labels)
caught = sum(p == 1 and y == 1 for p, y in zip(preds, labels))
print(f"accuracy      = {acc:.1%}")
print(f"frauds caught = {caught} of {sum(labels)}   (recall = {caught / sum(labels):.0%})")</div>
  <div class="fx" data-lang="text">accuracy      = 99.8%
frauds caught = 0 of 2   (recall = 0%)</div>
  <p>A "model" that never flags anything is 99.8% accurate, because 998 of the 1,000 payments are genuine, and yet it catches zero frauds. For rare, costly events you use <strong>recall</strong> (the share of real frauds that were caught) and <strong>precision</strong> (the share of flags that were real frauds) instead, as explained in <a class="xref" data-note="ml_evaluation">Classification Metrics</a>. The ETA has a gentler version of the same problem. Being five minutes early is mildly pleasant; being five minutes late makes Asha angry. Plain MAE treats both the same, so you report MAE <em>and</em> the late rate, and section 09 shows they really do disagree.</p>
  <p>The underlying danger is called the <strong>proxy problem</strong>. A <strong>proxy</strong> is an easy-to-measure number that stands in for the real goal; MAE is a proxy for "promises kept". Proxies are necessary, because you cannot run an A/B test for every idea, but optimising a proxy too hard can move it away from the goal. A model with lower MAE can be late more often, and a shorter ETA can increase orders today while breaking promises and losing customers next month. So in an interview you name the real goal, name the proxy, and say how you will check one against the other.</p>

  <h2 id="sf-est"><span class="num">05</span>Back-of-Envelope Estimates</h2>
  <p>"It should be fast and scale well" is not a requirement anyone can design for. Is Biteful's ETA a job for one laptop, one server or a fleet? Does the training data fit in memory? Should features live in a database or in memory? None of these can be decided without sizes. A <strong>back-of-envelope estimate</strong> is rough arithmetic, simple enough to do on the back of an envelope, whose purpose is to find the order of magnitude: is it 10, 10,000 or 10 million? The exact number matters much less than its size, because the size decides the design, the same way a wedding caterer needs to know whether 50 or 5,000 guests are coming, and whether they all eat at once, before choosing a stove.</p>
  <p>The key unit is <strong>QPS</strong>, queries (requests) per second. To get it, divide requests per day by the number of seconds in a day, 86,400. Traffic is never spread evenly, though: people eat at lunch and dinner, not at 4 a.m. The ratio between the busiest period and the average is the <strong>peak factor</strong>, usually 2 to 5, and systems must be sized for the peak. Here is the whole estimate for Biteful in code, so each line can be checked:</p>
  <div class="fx" data-lang="py"># Back-of-envelope for Biteful's ETA system (Pune + Mumbai)
DAY = 86_400                    # seconds in a day
dau            = 3_000_000      # daily active users
loads_per_user = 4              # home-feed loads per user per day
etas_per_load  = 20             # restaurant cards on screen, each shows "34 min"
peak_factor    = 4              # 8-9 pm dinner rush vs the daily average

loads_day = dau * loads_per_user
avg_qps   = loads_day / DAY
peak_qps  = avg_qps * peak_factor
print(f"feed loads/day        {loads_day:,}")
print(f"feed QPS              avg {avg_qps:,.1f}   peak {peak_qps:,.1f}")
print(f"ETA predictions/s     peak {peak_qps * etas_per_load:,.0f}")

orders_day = 600_000            # ~5% of feed loads become an order
rows = orders_day * 180         # 180 days of delivered orders for training
print(f"training rows         {rows / 1e6:,.0f} M  -&gt;  {rows * 40 * 4 / 1e9:,.1f} GB at 40 float32 features")
print(f"online store          {20_000 * 30 * 4 / 1e6:,.1f} MB  (20,000 restaurants x 30 features)")
print(f"rider GPS writes/s    {50_000 / 5:,.0f}  (50,000 riders, one ping every 5 s)")

# Model cost: a 300-tree GBM scores one row in roughly 0.05 ms on one CPU core
cores = peak_qps * etas_per_load * 0.05 / 1000
print(f"CPU for the model     {cores:,.2f} cores at peak (x2 headroom -&gt; {2 * cores:,.1f})")</div>
  <div class="fx" data-lang="text">feed loads/day        12,000,000
feed QPS              avg 138.9   peak 555.6
ETA predictions/s     peak 11,111
training rows         108 M  -&gt;  17.3 GB at 40 float32 features
online store          2.4 MB  (20,000 restaurants x 30 features)
rider GPS writes/s    10,000  (50,000 riders, one ping every 5 s)
CPU for the model     0.56 cores at peak (x2 headroom -&gt; 1.1)</div>
  <p>Walk through the first lines by hand. 3,000,000 users × 4 feed loads a day = 12,000,000 loads. Divided by 86,400 seconds that is about 139 QPS on average, and with a peak factor of 4 for the dinner rush, about 556 QPS. Each feed load shows 20 cards, each needing its own ETA, so at peak the model must make about 11,111 predictions per second.</p>
  <p>Now read each line as a design decision. 11,111 predictions per second must be answered while users wait, so this is <strong>online (real-time) serving</strong>, not a nightly batch job. The model itself needs only about 0.56 CPU cores at peak, so the model is cheap; the hard part is getting fresh facts to it quickly, with 10,000 rider-location updates a second and kitchen queues changing every minute. That points to a streaming pipeline and an in-memory feature store (section 07). The restaurant features take 2.4 MB, which fits easily in an in-memory store such as Redis, and the 17.3 GB of training data fits on one large machine, so training does not need a cluster yet. A few reference numbers make these estimates quick:</p>
  <table class="tbl">
    <tr><th>Number to remember</th><th>Value</th></tr>
    <tr><td>Seconds per day</td><td>86,400 ≈ 10<sup>5</sup></td></tr>
    <tr><td>1 million requests per day</td><td>≈ 12 QPS on average</td></tr>
    <tr><td>Peak ÷ average</td><td>2–5×</td></tr>
    <tr><td>In-memory lookup (Redis, same region)</td><td>~1 ms</td></tr>
    <tr><td>Cross-region round trip</td><td>~50–150 ms</td></tr>
    <tr><td>Gradient-boosted trees on CPU</td><td>~0.05–1 ms per row; batching rows is cheaper</td></tr>
    <tr><td>float32 feature</td><td>4 bytes; 1 billion rows × 100 features ≈ 400 GB</td></tr>
  </table>

  <h2 id="sf-data"><span class="num">06</span>Data, Labels and Leakage</h2>
  <p>A model learns from past examples whose right answers are known, so the next question is where those examples come from. Three words are needed. <strong>Data</strong> is the raw records, here every order with its timestamps. A <strong>label</strong> is the right answer for one example. <strong>Leakage</strong> is using, during training, a piece of information that will not exist at the moment of prediction. Here are the eight orders of the running example. Each stores three timestamps, and the label is computed from two of them:</p>
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
  <p>Trace order 101 by hand: placed at 13:05, delivered at 13:33, so its label is 28 minutes. Order 104, 5 km away, with eight orders in the kitchen queue and rain, went from 21:00 to 21:58: 58 minutes. The mean of all eight labels is 288 ÷ 8 = 36.0 minutes.</p>
  <p>Now look at the <code>pickup_min</code> column, the minutes until a rider collected the food. It is a superb predictor: big pickup time, big total time. But Biteful shows the ETA while Asha is still looking at the menu, and at that moment nobody knows when the food will be picked up. A model trained with <code>pickup_min</code> would look brilliant offline and be impossible to run live. That is leakage. Think of a cricket commentator predicting the final score at the 10th over: he may use the score so far, the pitch and the weather, but not the scorecard from the 20th over. A commentator trained on old scorecards that included the final over would sound like a genius right up to the first live match. The protection is a single question asked of every column: at what moment does this value become known? If the answer is after the prediction moment, the column cannot be a feature.</p>
  <p>Labels have problems of their own, and naming them is what interviewers mean by "data sense". The ETA label arrives within an hour, which is quick; a fraud label can take weeks. It is <strong>censored</strong> when an order is cancelled: the true delivery time was never observed, and since long waits are cancelled more often, slow orders are under-represented. It is <strong>noisy</strong> when riders tap "delivered" too early or too late, so impossible values (two minutes across the city) must be removed. And the logs contain <strong>selection bias</strong>: they only include orders people actually placed, so the customers who saw "55 min" and left are missing. The records themselves come from several systems: the order service (placed and delivered), the restaurant app (food ready), the rider app (GPS pings), a weather API and a map engine, usually streamed through <a class="xref" data-note="de_kafka">Kafka &amp; Streaming</a> into a data warehouse by <a class="xref" data-note="de_etl">ETL &amp; Orchestration</a> jobs.</p>

  <h2 id="sf-feat"><span class="num">07</span>Features and Point-in-Time Joins</h2>
  <p>A <strong>feature</strong> is one useful fact turned into a number for the model. The tricky thing about Biteful's ETA features is that they change at very different speeds, which decides where each is computed:</p>
  <table class="tbl">
    <tr><th>Feature</th><th>Order 102</th><th>Changes</th><th>Computed</th></tr>
    <tr><td>km (route distance)</td><td>4.0</td><td>per request</td><td>online, at request time, by the route engine</td></tr>
    <tr><td>queue (orders to this kitchen in the last 15 min)</td><td>6</td><td>every minute</td><td>online, by a streaming job on order events</td></tr>
    <tr><td>rain</td><td>0</td><td>minutes</td><td>online, from a weather feed</td></tr>
    <tr><td>hour, day of week</td><td>20, Tue</td><td>per request</td><td>online, from the clock</td></tr>
    <tr><td>prep_7d (the kitchen's average prep time, last 7 days)</td><td>15.5</td><td>daily</td><td>offline, by a nightly batch job</td></tr>
  </table>
  <p>An <strong>online feature</strong> is computed or looked up at request time and is fresh to the second; an <strong>offline (batch) feature</strong> is precomputed on a schedule. Both kinds must reach two places that want them in very different shapes. Training wants millions of past rows, each with feature values as they were at that time; serving wants one row, now, in about a millisecond. A <strong>feature store</strong> solves this by keeping one definition of each feature and writing its values to two stores: an <strong>offline store</strong> with the full history and timestamps, for training, and an <strong>online store</strong> such as Redis with just the latest value per key, for serving. A school is a good picture: the office keeps every term's register with dates (offline store) for report cards, while the notice board shows only the latest results (online store).</p>
  <p>The dangerous part is time. Suppose Dosa Hut's <code>prep_7d</code> is recomputed every night at 02:00, and a cook left on 2 March, so it rose from 14.0 to 15.5 to 18.0. Training rows for orders 101, 102 and a late-night order 109 must each get the value that existed when that order was placed. If you ask the school office why Riya won a scholarship last June, you must look at last June's register, not today's notice board. Here is the naive join next to the correct one:</p>
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
  <p>The naive join gives every order today's latest value, 18.0. But order 101 (1 March, 13:05) really saw 14.0, the value written at 02:00 that morning, and order 102 (2 March, 20:10) saw 15.5. Order 109 (3 March, 01:30) is the subtle one: the 18.0 row is stamped 02:00 on 3 March, half an hour after the order, so order 109 must also get 15.5. <code>merge_asof(..., direction="backward")</code> does exactly this: for each order it takes the last feature row at or before the order's timestamp. Attaching to each label the feature value as of the label's own timestamp is called a <strong>point-in-time join</strong>.</p>
  <p>Why does it matter so much? With the naive join, the model learns that "prep time 18.0 goes with 28-minute deliveries", a relationship that never existed. It is leakage from the future, the same family as <code>pickup_min</code>, but hidden inside a join where nobody thinks to look. A related failure is <strong>training-serving skew</strong>: computing a feature one way for training (say, SQL over the warehouse) and another way for serving (say, Java over a live counter), so the numbers drift apart and the model is quietly wrong in production. The feature store's single definition is the main defence; <a class="xref" data-note="sd_serving">Serving: Features, Latency, Shadow &amp; Canary</a> builds one and reproduces the skew.</p>

  <h2 id="sf-model"><span class="num">08</span>Choosing a Model: Baseline First</h2>
  <p>With honest training rows in hand, many candidates reach straight for a deep network. The problem is that without a simple reference point you cannot tell whether five minutes of error is great or terrible, and you have nothing to fall back on when the clever model breaks. So you start with a <strong>baseline</strong>: the simplest reasonable predictor, used as the bar every model must beat and, later, as the fallback when the model fails. Before building a weather app, you would check how often "tomorrow will be like today" is right; it often is, and your fancy model must beat that or it is not worth running.</p>
  <p>For the ETA a sensible baseline is "15 minutes to cook plus 4 minutes per km": anyone can explain it, it needs no training, and it never crashes. The next step up is a learned linear model, <code>eta = b0 + b1·km + b2·queue + b3·rain</code>, where the b's are chosen to make the squared errors as small as possible (least squares, from <a class="xref" data-note="ml_regression">Linear Regression</a>). Both on the same eight orders:</p>
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
  <p>Trace the baseline on order 104: 15 + 4 × 5 = 35 minutes, but the food took 58, an error of 23, because the rule ignores the queue of eight and the rain. The eight absolute errors are 5, 10, 3, 23, 0, 13, 0 and 10, which sum to 64, so the baseline's MAE is 64 ÷ 8 = 8.0 minutes, and 6 of the 8 orders (75%) arrived later than promised.</p>
  <p>The learned model's coefficients are readable: each km adds 3.25 minutes, each order in the kitchen queue adds 2.42, and rain adds 8.71. For order 104: 13.87 + 3.25 × 5 + 2.42 × 8 + 8.71 × 1 ≈ 58.2, almost exactly right. Its MAE is 0.66 minutes, but that was measured on the same eight rows it learned from, which is like grading a student on the exact questions they practised. The next section asks the honest version of the question.</p>
  <p>In production the model choice for an ETA usually comes down to this ladder:</p>
  <table class="tbl">
    <tr><th>Model</th><th>When it fits the ETA</th></tr>
    <tr><td>Rule baseline (15 + 4 × km)</td><td>Day one; the fallback whenever the model or its features fail</td></tr>
    <tr><td>Linear regression</td><td>Few features, and each effect must be explainable</td></tr>
    <tr><td>Gradient-boosted trees (LightGBM, XGBoost)</td><td>The usual production choice for tabular data: learns interactions such as rain × distance, fast on CPU</td></tr>
    <tr><td>Deep or sequence models</td><td>The route as a sequence of road segments, or rider GPS traces; only when data and latency allow</td></tr>
  </table>
  <p>In an interview, the strong move is to name the baseline, name the model you would actually ship (here gradient-boosted trees, as in <a class="xref" data-note="ml_lightgbm">LightGBM</a>), and say what would make you move up the ladder. Jumping to "a transformer" before a baseline tells the interviewer you do not know what "good enough" looks like.</p>

  <h2 id="sf-eval"><span class="num">09</span>Offline Evaluation</h2>
  <p><strong>Offline evaluation</strong> means scoring a model on historical data it was not trained on, called <strong>held-out</strong> data, before any real user sees it. With only eight rows, the fairest way is <strong>leave-one-out</strong>: train on seven orders, predict the eighth, and repeat so that every order is predicted once by a model that never saw it. We then report several numbers, because each answers a different question:</p>
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
  <p>The held-out MAE is 1.25 minutes, about twice the 0.66 measured on training rows, which is the honest cost of predicting orders the model has not seen; it is still far better than the baseline's 8.0. The <strong>bias</strong> column is the average of (actual − ETA): the baseline's +8.00 means it is systematically optimistic, while the linear model's −0.16 is almost unbiased. And here is the surprise: the nearly unbiased model is late 50% of the time. That is exactly what "unbiased" means: it is above the truth half the time and below it half the time, so half of Biteful's customers would wait longer than promised. Good MAE, bad promise. Promising three minutes later than the estimate raises MAE to 3.16 but cuts late orders to 0%. That trade-off between accuracy and a kept promise is a product decision, and a more principled way to make it is to predict a high quantile, such as the 80th percentile of delivery time, instead of the average (<a class="xref" data-note="sd_cases">Case Studies</a> does this).</p>
  <p>Eight orders cannot show the other two big evaluation lessons, so here is the same idea at scale: 20,000 simulated orders over 60 days, with the monsoon arriving after day 40. We compare the rule, a linear model, LightGBM, and LightGBM given the leaky <code>pickup</code> column, each evaluated two ways: with a <strong>time-based split</strong> (train on days 1–45, test on days 46–60, the way the future really arrives) and with a random split:</p>
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
  <p>Three lessons are in that table. First, the model choice is worth it: on the honest time split, LightGBM is off by 2.52 minutes, the linear model by 3.07, and the rule by 9.18. Second, leakage flatters: adding <code>pickup</code> "improves" MAE to 1.65, a model that would fall apart live because pickup time does not exist when the ETA is shown. Third, random splits flatter: the rule and the linear model look better on the random split (8.27 and 2.90) than on the time split (9.18 and 3.07), because a random test set contains fewer monsoon days than the real future does. Only the time split admits that the future is rainier than the past, which is why time-ordered data must always be split by time (see <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>). Notice too that even the best model is late about 44% of the time, so the promise still needs a buffer or a quantile.</p>
  <p>Think of mock exams. Testing a student on the questions they practised (training rows) tells you nothing. A fresh paper set by someone else (held-out data) is fair. A paper from next term's syllabus (a time split) is the real test.</p>

  <h2 id="sf-system"><span class="num">10</span>Serving Architecture</h2>
  <p>Offline, we have a model that beats the baseline comfortably. But offline is a file on a laptop. The model needs km (computed now), the kitchen queue (changing every minute) and prep_7d (computed last night), all within 60 ms, for 20 cards at once, 11,111 times a second at peak. Which components produce those values, which component runs the model, and what happens when one of them is slow? This is the "system half" of the answer, and it is the half that most clearly separates senior from junior candidates. Here is Biteful's ETA system on one page:</p>
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
  <p>Follow one request along the top row. Asha's app asks the <strong>ETA service</strong> (the program that holds model v12 in memory) for 20 restaurants. The service makes one batched call to the online store, Redis, for the queue, prep_7d and rain of all 20 kitchens, asks the route engine for 20 distances, runs the model on a batch of 20 rows, and returns 20 numbers. If any call times out, the service returns the baseline rule, 15 + 4 × km, instead of a blank card; a simpler answer used when the main path fails or is too slow is called a <strong>fallback</strong>. The same rule that set the bar offline now protects the user experience.</p>
  <p>Now the bottom row, below the dashed line, which keeps the top row fed. Order events flow into a Kafka topic; a stream job turns them into live queue counts per kitchen; a nightly batch job computes prep_7d at 02:00; both write into the online store, which is what the blue dashed arrows going up show. The warehouse holds orders and served logs, the training pipeline builds point-in-time-correct rows and trains LightGBM, and the result is stored in a <strong>model registry</strong>, a versioned store of trained models with their status (such as staging or production), from which the ETA service loads the current champion, as in <a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a>. The green dotted arrow matters most and is the one candidates forget: every served ETA is logged together with the exact features used, and later joined with the actual delivery time, so tomorrow's training rows match what serving really saw. Without it there is no consistent retraining and no way to debug training-serving skew.</p>
  <p>The 60 ms is a <strong>latency budget</strong>: the maximum time a step may take, agreed in advance and usually stated for the 99th percentile (p99 means 99 of every 100 requests finish within it). Splitting it across the steps shows where the risk is:</p>
  <div class="fx" data-lang="py"># Splitting the ETA service's 60 ms (p99) budget for one feed load of 20 cards
budget_ms = 60
steps = {                                   # rough p99 costs, same region
    "network in/out + parse request": 8,
    "Redis: features for 20 kitchens (one batched call)": 4,
    "route engine: 20 distances": 25,
    "model: score 20 rows in one batch": 3,
    "build + log the response": 5,
}
used = 0
for name, ms in steps.items():
    used += ms
    print(f"{name:52s} {ms:3d} ms   running total {used:3d}")
print(f"headroom left: {budget_ms - used} ms of {budget_ms}")
print(f"if Redis were called once per card instead: {20 * 4} ms for features alone")</div>
  <div class="fx" data-lang="text">network in/out + parse request                         8 ms   running total   8
Redis: features for 20 kitchens (one batched call)     4 ms   running total  12
route engine: 20 distances                            25 ms   running total  37
model: score 20 rows in one batch                      3 ms   running total  40
build + log the response                               5 ms   running total  45
headroom left: 15 ms of 60
if Redis were called once per card instead: 80 ms for features alone</div>
  <p>With these rough figures the steps use 45 ms, leaving 15 ms of headroom. The route engine is the most expensive step at 25 ms, so it is the first thing to cache (distances between a restaurant and a neighbourhood change slowly). The model itself takes 3 ms because it scores all 20 rows in one batch. The last line shows why the features must be fetched in one batched call: 20 separate calls at 4 ms each would use 80 ms on their own and blow the whole budget. How the service is packaged, deployed and scaled is covered in <a class="xref" data-note="mlops_deploy">Deployment Patterns</a>, <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> and <a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a>.</p>
  <p>Finally, say why this is real-time at all. The ETA depends on this minute's kitchen queue and this customer's address, which cannot be known in advance, so it must be computed at request time. Slow-changing inputs like prep_7d can still be computed in batch. Being able to say which parts must be real-time and which can be batch, and why, is a trade-off sentence interviewers score highly.</p>

  <h2 id="sf-monitor"><span class="num">11</span>Monitoring and Iteration</h2>
  <p>A model can be up, fast and wrong. In July the monsoon arrives and every rainy trip gets slower; a pipeline bug fills the <code>rain</code> feature with zeros; the service keeps returning "200 OK" the whole time. <strong>Monitoring</strong> means continuously measuring the live system so such problems are noticed, and it works at four levels: the <em>system</em> (p99 latency, error and fallback rates), the <em>data</em> (are the inputs still sensible, for example the share of orders with rain), the <em>model</em> (late rate and MAE once the deliveries land, about an hour later) and the <em>business</em> (cancellations and support calls). The world changing so that the model's lessons stop fitting is called <strong>drift</strong>. Here is a simulation of 30 days of the live model, with the monsoon starting on day 18 and the pipeline bug on day 24:</p>
  <div class="fx" data-lang="py">import numpy as np

# 30 days of the live ETA model (the linear model + a 3-minute buffer), 2,000 orders a day.
# Day 18: the monsoon starts (more rain, flooded roads). Day 24: a pipeline bug sends rain = 0.
rng = np.random.default_rng(1)
def model(km, queue, rain):
    return 13.87 + 3.25 * km + 2.42 * queue + 8.71 * rain + 3

print("day  rain_in_features  late%   MAE   alerts")
streak = 0
for day in range(1, 31):
    n = 2000
    km, queue = rng.gamma(2.2, 1.4, n), rng.poisson(4, n)
    rain = (rng.random(n) &lt; (0.5 if day &gt;= 18 else 0.1)).astype(int)
    slow = 1.5 * km * rain if day &gt;= 18 else 0                    # flooded roads: +1.5 min per km
    actual = 13.87 + 3.25 * km + 2.42 * queue + 8.71 * rain + slow + rng.normal(0, 3, n)
    served_rain = np.zeros(n, int) if day &gt;= 24 else rain          # the bug
    eta = model(km, queue, served_rain)
    late = np.mean(actual &gt; eta)
    mae = np.mean(np.abs(actual - eta))
    alerts = []
    if served_rain.mean() &lt; 0.02:                                  # data check: rain never 0% in Pune
        alerts.append("DATA: rain share ~0%")
    streak = streak + 1 if late &gt; 0.25 else 0                      # model check, labels ~1 h later
    if streak &gt;= 3:
        alerts.append("MODEL: late &gt; 25% for 3 days -&gt; retrain")
    if day in (1, 10, 17, 18, 19, 20, 23, 24, 25):
        print(f"{day:3d}  {served_rain.mean():15.0%}  {late:5.0%}  {mae:5.2f}   {'; '.join(alerts)}")</div>
  <div class="fx" data-lang="text">day  rain_in_features  late%   MAE   alerts
  1              10%    15%   3.46   
 10              10%    17%   3.51   
 17              10%    16%   3.36   
 18              49%    38%   3.46   
 19              48%    38%   3.51   
 20              48%    39%   3.46   MODEL: late &gt; 25% for 3 days -&gt; retrain
 23              50%    39%   3.53   MODEL: late &gt; 25% for 3 days -&gt; retrain
 24               0%    60%   6.94   DATA: rain share ~0%; MODEL: late &gt; 25% for 3 days -&gt; retrain
 25               0%    59%   7.05   DATA: rain share ~0%; MODEL: late &gt; 25% for 3 days -&gt; retrain</div>
  <p>Days 1 to 17 are calm: about 16% of orders are late (the three-minute buffer keeps it low) and MAE is about 3.4. On day 18 the monsoon arrives and the late rate jumps from 16% to 38%, yet <strong>MAE barely moves</strong> (3.36 to 3.46), because on rainy trips the error changed direction rather than size: the old three-minute cushion turned into a shortfall of a few minutes, so the average size of the error stayed about the same while far more orders ended up late. A dashboard showing only MAE would have missed it. The model check fires on day 20, after three days in a row above 25%, and calls for a retrain. On day 24 the bug sets every rain value to 0; the data check fires immediately (Pune at 0% rain in the monsoon is impossible), the late rate jumps to 60% and MAE doubles. Data checks catch pipeline bugs on the same day, without waiting for labels.</p>
  <p>Monitoring only helps if it leads to action, so the plan must name three things. The <strong>retraining trigger</strong>: a weekly schedule plus alerts such as "late rate above 25% for three days" or a large shift in the distance distribution. The <strong>gate</strong>: the candidate model (the <strong>challenger</strong>) must beat the model in production (the <strong>champion</strong>) on the same recent orders. And the <strong>rollout</strong>: first <strong>shadow</strong> mode, where the challenger receives real requests but its answers are not shown; then a <strong>canary</strong>, where it serves a small slice such as 5% of users; then an A/B test on the on-time rate and conversion, with guardrails. These are covered in <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>, <a class="xref" data-note="sd_serving">Serving: Features, Latency, Shadow &amp; Canary</a> and <a class="xref" data-note="sd_experiments">Online Experiments &amp; A/B Infrastructure</a>.</p>
  <p><strong>Iteration</strong> is what turns the path into a loop. Error analysis by slice (rainy days, new restaurants, far addresses) shows where the model is weakest, and each weakness points back to an earlier step: a new feature such as rider supply, better labels, or a different model. A new dish at a restaurant chain goes the same way: it is tried at one branch first (canary), the manager reads reviews every week (monitoring), and the recipe is revised from the complaints (iteration). In an interview, "we'll retrain sometimes" is a weak answer; "weekly, plus a trigger on late rate, gated by champion versus challenger, rolled out shadow then canary then A/B" is a strong one.</p>

  <h2 id="sf-mistakes"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common mistake is not technical at all: starting with the model. "I'd use XGBoost" in the first minute leaves the interviewer nothing to score, because you never said what problem you are solving, how you would know it works, or how it would run. Spend the first five minutes on the goal, scale and latency, and state input, output and label before any model is named. The closely related mistake is skipping the baseline; the rule 15 + 4 × km gave an MAE of 8.0, which is both the bar to beat and the fallback.</p>
  <p>Leaky features are the classic data mistake, and the fix is mechanical enough to write down. List the events in an order's life, note the event at which each column becomes known, and drop anything known after the prediction moment:</p>
  <div class="fx" data-lang="py"># Mistake: a leaky feature. Fix: write down WHEN each column becomes known and filter.
# Order of events for one order (minutes after the customer opens the menu)
EVENT_TIME = {"menu_opened": 0, "order_placed": 3, "rider_assigned": 6,
              "picked_up": 20, "delivered": 38}
PREDICT_AT = "menu_opened"            # the feed ETA is shown before the order exists

columns = {                           # column -&gt; the event at which its value is known
    "km": "menu_opened", "queue": "menu_opened", "rain": "menu_opened", "prep_7d": "menu_opened",
    "rider_id": "rider_assigned", "rider_speed_today": "rider_assigned",
    "pickup_min": "picked_up", "actual_route_km": "delivered",
}
for col, known in columns.items():
    ok = EVENT_TIME[known] &lt;= EVENT_TIME[PREDICT_AT]
    print(f"{col:18s} known at {known:15s} {'ok' if ok else 'LEAK: drop it'}")</div>
  <div class="fx" data-lang="text">km                 known at menu_opened     ok
queue              known at menu_opened     ok
rain               known at menu_opened     ok
prep_7d            known at menu_opened     ok
rider_id           known at rider_assigned  LEAK: drop it
rider_speed_today  known at rider_assigned  LEAK: drop it
pickup_min         known at picked_up       LEAK: drop it
actual_route_km    known at delivered       LEAK: drop it</div>
  <p>The four honest columns are known when the menu opens. The rider's identity and speed look harmless, but no rider is assigned yet when the feed ETA is shown, so they leak just as surely as <code>pickup_min</code>. (A checkout ETA, predicted after the order is placed, has a later prediction moment and could use more columns; the moment, not the column, decides.) The join version of the same mistake is the naive "latest value" join from section 07, fixed with a point-in-time join, and the evaluation version is the random split on time-ordered data, fixed by training on the past and testing on the later period.</p>
  <p>A second family of mistakes is in the numbers. Sizing for the average is the usual one:</p>
  <div class="fx" data-lang="py"># Mistake: sizing for the average. One server handles ~150 feed loads per second (example).
import math
per_server, avg_qps = 150, 138.9
for label, qps in [("average", avg_qps), ("dinner peak (x4)", avg_qps * 4),
                   ("peak + one zone down (x1.5)", avg_qps * 4 * 1.5)]:
    print(f"{label:28s} {qps:7.1f} QPS -&gt; {math.ceil(qps / per_server)} server(s)")</div>
  <div class="fx" data-lang="text">average                        138.9 QPS -&gt; 1 server(s)
dinner peak (x4)               555.6 QPS -&gt; 4 server(s)
peak + one zone down (x1.5)    833.4 QPS -&gt; 6 server(s)</div>
  <p>Average traffic needs one server, but the dinner peak needs four, and a peak during which one zone's servers are down needs six. Designing for 139 QPS at 4 p.m. says nothing about 8:30 p.m. on a rainy Friday. Similar mistakes are reporting only MAE (add the late rate and P90 error, and a buffer or quantile for the promise) and quoting a training-set score such as the 0.66 as if it were evidence.</p>
  <p>The last family is about the system half: drawing only the request path, with no logging of served features and no registry, so there is no consistent retraining and no rollback; computing features differently in training and serving; having no cold-start story (for a new restaurant, use the average prep time of its category until it has seven days of data); shipping without an online test; and leaving retraining vague. Each of these has a one-sentence fix that is worth saying out loud, because saying it is most of what the interviewer is listening for.</p>

  <h2 id="sf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The path (say it out loud at the start)</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Biteful ETA</th></tr>
    <tr><td>Clarify and frame</td><td>What should improve? Input, output, label?</td><td>Fewer late orders; regression in minutes; label = delivered − placed</td></tr>
    <tr><td>Metrics</td><td>How will we know?</td><td>Offline MAE, late %, P90; online on-time rate; business cancellations; guardrails p99, conversion</td></tr>
    <tr><td>Estimates</td><td>How big, how fast?</td><td>139 avg / 556 peak QPS; 11,111 ETAs/s; 60 ms; 17.3 GB training data</td></tr>
    <tr><td>Data and labels</td><td>Right answers? Cheating columns?</td><td>Mean 36.0 min; pickup_min leaks; cancelled orders censored</td></tr>
    <tr><td>Features</td><td>Which facts, computed when?</td><td>km, queue, rain online; prep_7d nightly; point-in-time join</td></tr>
    <tr><td>Model</td><td>Simplest first, then better?</td><td>Rule MAE 8.0; linear 0.66 on training rows; GBM in production</td></tr>
    <tr><td>Offline evaluation</td><td>Good on unseen orders?</td><td>Held-out 1.25 but 50% late; GBM 2.52 vs rule 9.18 on a time split</td></tr>
    <tr><td>Serving</td><td>Answer live in time?</td><td>ETA service + Redis + route engine + stream + batch + registry; fallback rule</td></tr>
    <tr><td>Monitoring, iteration</td><td>Still right? Getting better?</td><td>System, data, model, business; trigger, gate, shadow → canary → A/B</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Biteful</th></tr>
    <tr><td>QPS = requests per day ÷ 86,400</td><td>12M ÷ 86,400 = 138.9</td></tr>
    <tr><td>peak QPS = QPS × peak factor (2–5)</td><td>138.9 × 4 = 555.6</td></tr>
    <tr><td>predictions/s = peak QPS × items per request</td><td>555.6 × 20 ≈ 11,111</td></tr>
    <tr><td>storage = rows × features × 4 bytes (float32)</td><td>108M × 40 × 4 = 17.3 GB</td></tr>
    <tr><td>MAE = mean |actual − predicted|</td><td>baseline 64 ÷ 8 = 8.0</td></tr>
    <tr><td>bias = mean (actual − predicted); + means late</td><td>baseline +8.00, linear −0.16</td></tr>
    <tr><td>late rate = share with actual &gt; shown ETA</td><td>75% rule, 50% linear, 0% with +3 min</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>ML system design</b>: planning data, training, serving, evaluation, monitoring and improvement as one product.</li>
    <li><b>Framing</b>: input, output and label that turn a business goal into a learnable task.</li>
    <li><b>Offline / online / business / guardrail metric</b>: scored on old data / measured on real users / what the company wants / must not get worse.</li>
    <li><b>Proxy</b>: an easy-to-measure stand-in for the goal (MAE for "promises kept").</li>
    <li><b>Leakage</b>: training on information not available at prediction time. <b>Censored label</b>: true value never observed.</li>
    <li><b>Online / offline feature</b>: computed at request time / precomputed on a schedule. <b>Feature store</b>: one definition, offline history + online latest.</li>
    <li><b>Point-in-time join</b>: the feature value as of the label's timestamp, never later. <b>Training-serving skew</b>: features computed differently in the two paths.</li>
    <li><b>Baseline / fallback</b>: the simplest predictor; the same rule served when the model fails.</li>
    <li><b>Champion / challenger</b>: the production model / the candidate that must beat it. <b>Shadow / canary</b>: hidden answers on real traffic / a small slice of real users.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Never start with the model; never skip the baseline.</li>
    <li>Size for the peak plus headroom, not the average.</li>
    <li>Ask "when is this value known?" of every column; the prediction moment decides.</li>
    <li>Time-ordered data: split by time; join point-in-time.</li>
    <li>MAE can stay flat while the late rate doubles; watch several metrics.</li>
    <li>Draw the logging arrow and the registry, not just the request path.</li>
    <li>Name the retrain trigger, the gate and the rollout.</li>
  </ul>

  <h2 id="sf-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is ML system design, and why is the model only a small part of it?</summary><div class="qa-body">It is planning everything needed for a model to help real users: data collection and labels, features, training, fast serving, safe rollout, monitoring and retraining. Without those pieces even a perfect model never reaches users, or breaks silently after launch. Most of the engineering effort, and most of the failures, are in the pieces around the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"Design a food-delivery ETA system." What are your first questions?</summary><div class="qa-body">What business outcome should improve (kept promises, fewer cancellations, conversion)? What is the scale (users, feed loads and orders per day, cities)? Where is the ETA shown and how fast must it come (20 cards in a 200 ms feed, or once at checkout)? I would also ask about new restaurants with no history and about weather, which are common hidden twists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What framework do you follow for an ML system design question?</summary><div class="qa-body">Clarify requirements and frame the task (input, output, label), define offline, online and business metrics, estimate scale, then data and labels, features, a baseline and model, offline evaluation, serving architecture, and monitoring with a retraining and rollout plan. I do a quick pass over every step first, then go deeper where the interviewer wants, keeping roughly to a time budget.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why name offline, online and guardrail metrics separately?</summary><div class="qa-body">They answer different questions at different moments. Offline metrics (MAE, late rate) cheaply compare candidates on old data; online metrics (on-time rate, cancellations) decide what ships based on real behaviour; guardrails (p99 latency, conversion) stop a "win" that breaks something else. Offline and online often disagree, so you need both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A fraud model has 99.8% accuracy. Is it good?</summary><div class="qa-body">You cannot tell. If 0.2% of payments are fraud, a model that never flags anything also scores 99.8% while catching nothing. For rare, costly events, ask for recall and precision at a chosen threshold, or for money saved.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>50 million daily users, 10 feed loads each. What are average and peak QPS?</summary><div class="qa-body">500 million ÷ 86,400 ≈ 5,800 QPS on average. With a peak factor of 3, about 17,000 QPS. Servers should be sized for the peak plus headroom for a failed zone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How much memory do 200 million users × 200 float32 features need?</summary><div class="qa-body">200M × 200 × 4 bytes = 160 GB. That is too much for one machine's memory comfortably but fine for a sharded in-memory store such as a Redis cluster, or a key-value database with a cache, with replicas for availability.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is leakage, and how do you spot it in an ETA problem?</summary><div class="qa-body">Leakage is training on information that will not exist at prediction time; it inflates offline scores and fails live. For each column, ask at which moment its value becomes known. For the feed ETA, pickup time, rider identity and the actual route are known only after the order, so they cannot be features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a point-in-time join, and what goes wrong without one?</summary><div class="qa-body">It attaches to each training example the feature values as they were at that example's timestamp, typically with an as-of join that takes the last value at or before it. Without it, old examples get today's values, the model learns relationships that never existed, offline scores look better than reality, and live performance drops with no code error to point at.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Online features vs offline features: how do you decide where a feature is computed?</summary><div class="qa-body">By how fast it changes and how fresh it must be. Values that depend on the request or change by the minute (distance, kitchen queue, rain) are computed online or by a stream job; slow aggregates (7-day prep time) are precomputed in batch. A feature store keeps one definition and serves the history for training and the latest value for serving.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why start with a baseline when you know a gradient-boosted model will win?</summary><div class="qa-body">It sets the bar (8.0 minutes for Biteful), exposes data and pipeline bugs early, ships value quickly and becomes the fallback when the model or feature store fails. It also tells you how much the complex model really adds, which is often less than expected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a time-based split instead of a random split for ETA data?</summary><div class="qa-body">Because the model will be used on future orders, and the future differs from the past (seasons, new restaurants, traffic). A random split lets the test set share the same period as training, so scores are too optimistic. Training on earlier days and testing on later ones reproduces how the model will really be used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your ETA model has MAE 1.25 and almost zero bias, yet customers complain. Why?</summary><div class="qa-body">An unbiased model is late about half the time, so half the customers wait longer than promised. MAE treats early and late errors equally, but customers do not. Add a buffer or predict a higher quantile such as the 80th percentile, and track the late rate alongside MAE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose batch prediction over real-time?</summary><div class="qa-body">When inputs change slowly and the entities can be listed in advance, such as daily recommendations emails, demand forecasts or churn scores. Choose real-time when the request context matters (this address, this minute's kitchen queue, this payment), as for the ETA. Many systems mix both: batch features feeding a real-time model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you design a fallback for the ETA service?</summary><div class="qa-body">Set timeouts on each dependency within the latency budget; if features or the model are slow or failing, return the baseline rule (15 + 4 × km), or a cached recent ETA per restaurant and zone, instead of a blank card. Monitor the fallback rate, because a rising rate is an early sign of trouble.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Offline MAE improved but the A/B test is flat. Name some causes.</summary><div class="qa-body">Training-serving skew, so the live features differ from those used offline; a proxy that does not track the goal, such as lower MAE with the same late rate; offline data that is biased by what was logged; added latency hurting conversion; or an effect too small for the test to detect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What would you monitor for the ETA system, and when would you retrain?</summary><div class="qa-body">System metrics (p99 latency, errors, fallback rate), data checks (null and range checks, the share of rainy orders, distance distribution), model metrics once deliveries land (late rate, MAE, P90 by slice) and business metrics (cancellations, support calls). Retrain weekly plus on triggers such as a late rate above a threshold for several days, and ship only if the challenger beats the champion on recent orders, via shadow, canary and A/B.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The interviewer says "assume infinite data and compute". What do you still discuss?</summary><div class="qa-body">Label quality (censoring, noisy delivery taps), the right objective (kept promises rather than MAE), latency at serving time, leakage and training-serving skew, rollout safety and monitoring. Compute does not fix a wrong label, a leaky feature or a feedback loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes an ML system design answer "senior"?</summary><div class="qa-body">Explicit trade-offs with reasons, awareness of data problems (delayed and censored labels, leakage, skew), a production plan (fallback, rollout, monitoring, retraining) and cost thinking. A junior answer describes a model; a senior answer describes a system that stays correct over time.</div></details>
</main>
`
});
