// notes/databases/sql_interview.js — SQL Interview Practice
Object.assign(TOPIC_CONTENT, {
  "sql_interview": `<main>
  <h1>SQL Interview Practice</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Interview Practice</span></div>
  <p class="lead">The classic SQL interview problems (Nth highest, top-N per group, date spines, pivots, year-over-year, funnels, retention cohorts, streaks) solved as a <em>chain of patterns</em>, each reusing the ones before it and the earlier notes of this track. Every problem follows the same recipe: the question, which earlier concept it needs (linked), the approach in plain words, a hand trace on the data, the query, the real result, and the wrong answers people actually give (also run, so you see them fail). One running example throughout: <strong>Biteful</strong> (7 customers, 5 restaurants, 10 orders, 15 order lines from <a class="xref" data-note="sql_joins">JOINs</a>), plus two small tables for time-based questions: <code>events</code> (what customers did in the app, 1–8 March 2026) and <code>monthly_revenue</code> (the finance team's monthly totals). All results are real PostgreSQL 16 output.</p>

  <h2 id="si-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="si-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="100" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="60" y="41" text-anchor="middle" font-size="12">Fundamentals</text><text x="60" y="58" text-anchor="middle" class="tm" font-size="10">GROUP BY, NULL</text>
<line x1="110" y1="45" x2="126" y2="45" stroke="currentColor" marker-end="url(#si-a0)"/>
<rect x="128" y="20" width="90" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="173" y="41" text-anchor="middle" font-size="12">JOINs</text><text x="173" y="58" text-anchor="middle" class="tm" font-size="10">fan-out</text>
<line x1="218" y1="45" x2="234" y2="45" stroke="currentColor" marker-end="url(#si-a0)"/>
<rect x="236" y="20" width="100" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="286" y="41" text-anchor="middle" font-size="12">Subqueries</text><text x="286" y="58" text-anchor="middle" class="tm" font-size="10">CTEs</text>
<line x1="336" y1="45" x2="352" y2="45" stroke="currentColor" marker-end="url(#si-a0)"/>
<rect x="354" y="20" width="90" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="399" y="41" text-anchor="middle" font-size="12">Windows</text><text x="399" y="58" text-anchor="middle" class="tm" font-size="10">rank, lag</text>
<line x1="444" y1="45" x2="460" y2="45" stroke="currentColor" marker-end="url(#si-a0)"/>
<rect x="462" y="20" width="90" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="507" y="41" text-anchor="middle" font-size="12">Modeling</text><text x="507" y="58" text-anchor="middle" class="tm" font-size="10">grain</text>
<line x1="552" y1="45" x2="568" y2="45" stroke="currentColor" marker-end="url(#si-a0)"/>
<rect x="570" y="20" width="80" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="610" y="41" text-anchor="middle" font-size="12" font-weight="700">Interview</text><text x="610" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<text x="10" y="105" class="tm" font-size="10.5">Nothing new in syntax: every problem here is a combination of tools from the earlier notes.</text>
<text x="10" y="123" class="tm" font-size="10.5">What is new is recognising which pattern a question is, and the traps each pattern hides.</text>
</svg><figcaption>The last note of the SQL group: practice that reuses everything.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: every SQL note</b><span><a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a> (GROUP BY, HAVING, NULL logic), <a class="xref" data-note="sql_joins">JOINs</a> (LEFT JOIN, anti-joins, fan-out), <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a> (step-by-step queries, recursion), <a class="xref" data-note="sql_windows">Window Functions</a> (ranking, LAG, running totals), <a class="xref" data-note="sql_modeling">Data Modeling</a> (grain).</span></li>
    <li><b>This note adds: patterns</b><span>Eight problem patterns that make up most interview rounds and most real analytics work, each built from the previous one, plus a bank of shorter practice questions and conceptual rapid-fire.</span></li>
    <li><b>Leads to: real work</b><span>The same patterns run on millions of rows; <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> is how they stay fast, and the analytics notes (<a class="xref" data-note="da_pandas">pandas</a>, <a class="xref" data-note="st_abtesting">A/B testing</a>) consume their output.</span></li>
  </ol>

  <h2 id="si-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain: each pattern answers a question the previous pattern could not, and reuses its tools.</p>
  <ol class="story">
    <li><b>Approach</b><span>Q: how do I start any problem? → fix the grain, find the tables, build in CTE steps, check edges. But the simplest ranking question already has a trap…</span></li>
    <li><b>Nth highest</b><span>Q: what is the 6th highest order amount? → DENSE_RANK over the whole table (ties count once): 260. But "highest" usually means highest <em>within each group</em>…</span></li>
    <li><b>Top-N per group</b><span>Q: the best-selling dish at each restaurant? → aggregate, then RANK with PARTITION BY, keep rank 1: Biryani Bros has a tie. Rankings and counts per day, though, silently drop days with no rows…</span></li>
    <li><b>Date spine</b><span>Q: orders per day including days with none? → generate every day, LEFT JOIN the facts: 6 and 7 March show 0. Reports also want categories as columns, not rows…</span></li>
    <li><b>Pivoting</b><span>Q: one row per restaurant, one column per status? → conditional aggregation (FILTER), with the spine idea for Momo Magic's zeros. Comparing columns across years is the next step…</span></li>
    <li><b>Year-over-year</b><span>Q: each month vs the same month last year? → join the table to itself on month − 1 year (LAG(12) breaks on the missing June). Comparing whole periods is easy; following each <em>user</em> through steps is harder…</span></li>
    <li><b>Funnels</b><span>Q: how many sessions go open → menu → cart → checkout? → one row per session, earliest time per step, steps must happen in order: 26 → 16 → 12 → 10. A funnel looks within a session; retention looks across days…</span></li>
    <li><b>Retention and cohorts</b><span>Q: what share of users come back within 3 days of their first visit, by first-visit day? → first event per user (the cohort), then "any later event within the window". Coming back once is not the same as coming back every day…</span></li>
    <li><b>Streaks</b><span>Q: longest run of consecutive days each customer opened the app? → gaps and islands: day − row_number is constant inside a run: Farah 7, Asha 4.</span></li>
  </ol>

  <h2 id="si-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">SQL Interview Patterns</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Approach</div>
      <ul>
        <li><b>Grain</b> — what is one output row?</li>
        <li><b>CTE steps</b> — filter → aggregate → rank → pick</li>
        <li><b>Edges</b> — ties, NULLs, empty groups, dates</li>
        <li>💡 cook in separate bowls, then layer</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Ranking</div>
      <ul>
        <li><b>Nth highest</b> — DENSE_RANK; ⚠ OFFSET counts ties twice</li>
        <li><b>Top-N per group</b> — RANK() OVER (PARTITION BY …); filter outside</li>
        <li>⚠ ROW_NUMBER drops ties</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Shaping</div>
      <ul>
        <li><b>Date spine</b> — generate_series + LEFT JOIN; COUNT(right col)</li>
        <li><b>Pivot</b> — count(*) FILTER (WHERE …) per column</li>
        <li>⚠ COUNT(CASE … ELSE 0) counts everything</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Time comparisons</div>
      <ul>
        <li><b>YoY</b> — self-join on month − 1 year</li>
        <li>⚠ LAG(12) with a missing month</li>
        <li>⚠ partial month vs full month</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">User journeys</div>
      <ul>
        <li><b>Funnel</b> — per session, min time per step, in order</li>
        <li><b>Retention</b> — cohort = first event; return within window</li>
        <li><b>Streak</b> — day − row_number = island id</li>
        <li>⚠ count events vs sessions vs users</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="si-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">Patterns as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="si-how"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How to Approach</span><span class="rm-sub">Grain, steps, edges</span></div></div>
      <div class="rm-item rm-done" data-target="si-nth"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Nth Highest</span><span class="rm-sub">Ties count once</span></div></div>
      <div class="rm-item rm-done" data-target="si-topn"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Top-N per Group</span><span class="rm-sub">PARTITION BY + rank</span></div></div>
      <div class="rm-item rm-done" data-target="si-spine"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Date Spines</span><span class="rm-sub">Days with zero</span></div></div>
      <div class="rm-item rm-done" data-target="si-pivot"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Pivoting</span><span class="rm-sub">Rows to columns</span></div></div>
      <div class="rm-item rm-done" data-target="si-yoy"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Year-over-Year</span><span class="rm-sub">Self-join on shifted month</span></div></div>
      <div class="rm-item rm-done" data-target="si-funnel"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Funnels</span><span class="rm-sub">Steps in order</span></div></div>
      <div class="rm-item rm-done" data-target="si-ret"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Retention &amp; Cohorts</span><span class="rm-sub">Did they come back?</span></div></div>
      <div class="rm-item rm-done" data-target="si-streak"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Streaks</span><span class="rm-sub">Gaps and islands</span></div></div>
      <div class="rm-item rm-done" data-target="si-more"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">More Practice</span><span class="rm-sub">15 shorter problems</span></div></div>
      <div class="rm-item rm-done" data-target="si-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The usual suspects</span></div></div>
      <div class="rm-item rm-done" data-target="si-rapid"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Conceptual Rapid-Fire</span><span class="rm-sub">Explain the difference</span></div></div>
      <div class="rm-item rm-done" data-target="si-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Patterns from tools</span></div></div>
      <div class="rm-item rm-done" data-target="si-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Every pattern in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="si-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Connection questions</span></div></div>
    </div>
  </div>

  <h2 id="si-how"><span class="num">01</span>How to Approach a Question</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know every SQL tool from the earlier notes, but an interviewer's question arrives as an English sentence and a blank editor, with ten minutes on the clock. How do we turn the sentence into a query without a join doubling rows or a filter silently dropping someone?</p>
  </div>
  <p>Most people try to write the whole query in one go. Then a join doubles some rows, a filter drops a customer, and they can't see why, because they never looked at the rows in between. The fix: never write the full query first. Turn the sentence into small steps, run step 1 alone, look at its rows, and only then add step 2.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Making biryani. You marinate the chicken in one bowl, half-boil the rice in another, fry the onions in a third, then layer them. If the dish tastes wrong, you taste each bowl. A <strong>CTE</strong> (<code>WITH name AS (…)</code>, from <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>) is one labelled bowl.</p>
  </div>
  <div class="flow"><span>1 · Clarify the grain</span><span>2 · Find the tables</span><span>3 · Build step by step (CTEs)</span><span>4 · Check edge cases</span></div>
  <div class="cards">
    <div><b>1 · Grain</b><p>What does one output row stand for: a customer? a day? a session? Should customers with zero orders appear? Do cancelled orders count? Ask before writing.</p></div>
    <div><b>2 · Tables</b><p>Which tables hold the facts, and what is each one's grain and key? Joining orders (one row per order) to order_items (one per line) repeats orders (<a class="xref" data-note="sql_joins">JOINs</a> §08).</p></div>
    <div><b>3 · Steps</b><p>One idea per CTE: filter → aggregate → rank → pick. Run each step and look at its rows.</p></div>
    <div><b>4 · Edges</b><p>Ties, NULLs, duplicates, empty groups, division by zero, date boundaries, incomplete periods.</p></div>
  </div>
  <h3>The running example</h3>
  <p>The four Biteful tables from the earlier notes (customers, restaurants, orders, order_items; Gita and Momo Magic have no orders, Esha's city is NULL, orders 105 and 107 are cancelled, 110 is pending). The orders, the one table most problems start from:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, r.name AS restaurant,
       to_char(o.ordered_at, 'Mon DD HH24:MI') AS ordered_at, o.status, o.amount
FROM orders o JOIN customers c USING (customer_id) JOIN restaurants r USING (restaurant_id)
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>orders (10 rows, times in Asia/Kolkata)</caption><tr><th>order_id</th><th>customer</th><th>restaurant</th><th>ordered_at</th><th>status</th><th>amount</th></tr><tr><td>101</td><td>Asha</td><td>Dosa Hut</td><td>Mar 02 12:10</td><td>delivered</td><td>240.00</td></tr><tr><td>102</td><td>Ben</td><td>Biryani Bros</td><td>Mar 02 13:05</td><td>delivered</td><td>450.00</td></tr><tr><td>103</td><td>Chen</td><td>Pizza Point</td><td>Mar 02 20:30</td><td>delivered</td><td>520.00</td></tr><tr><td>104</td><td>Asha</td><td>Pizza Point</td><td>Mar 03 13:15</td><td>delivered</td><td>380.00</td></tr><tr><td>105</td><td>Dia</td><td>Green Bowl</td><td>Mar 03 19:45</td><td>cancelled</td><td>310.00</td></tr><tr><td>106</td><td>Ben</td><td>Biryani Bros</td><td>Mar 04 12:40</td><td>delivered</td><td>180.00</td></tr><tr><td>107</td><td>Esha</td><td>Pizza Point</td><td>Mar 04 21:10</td><td>cancelled</td><td>260.00</td></tr><tr><td>108</td><td>Chen</td><td>Dosa Hut</td><td>Mar 05 18:20</td><td>delivered</td><td>260.00</td></tr><tr><td>109</td><td>Farah</td><td>Biryani Bros</td><td>Mar 05 20:05</td><td>delivered</td><td>600.00</td></tr><tr><td>110</td><td>Asha</td><td>Dosa Hut</td><td>Mar 08 20:50</td><td>pending</td><td>310.00</td></tr></table>
  <p>Two extra tables for the time-based patterns. <code>events</code> logs what each customer did in the app: one <code>app_open</code> per day they opened it, then <code>view_menu</code>, one <code>add_to_cart</code> per item and <code>checkout</code> when they ordered (the 10 checkouts are exactly the 10 orders above). <code>monthly_revenue</code> holds the finance team's monthly totals since launch: no row for June 2025 (deliveries were paused), and March 2026 is month-to-date (1–8 March).</p>
  <div class="fx" data-lang="sql">SELECT event, count(*) AS events, count(DISTINCT customer_id) AS customers FROM events GROUP BY event ORDER BY events DESC;
SELECT c.name, string_agg(extract(day FROM e.event_at)::text, ', ' ORDER BY e.event_at) AS march_days
FROM events e JOIN customers c USING (customer_id) WHERE e.event = 'app_open'
GROUP BY c.customer_id, c.name ORDER BY c.customer_id;
SELECT to_char(month, 'YYYY-MM') AS month, revenue FROM monthly_revenue ORDER BY month;</div>
  <table class="tbl out"><caption>events: 69 rows; counts by type</caption><tr><th>event</th><th>events</th><th>customers</th></tr><tr><td>app_open</td><td>26</td><td>7</td></tr><tr><td>add_to_cart</td><td>17</td><td>7</td></tr><tr><td>view_menu</td><td>16</td><td>7</td></tr><tr><td>checkout</td><td>10</td><td>6</td></tr></table>
  <table class="tbl out"><caption>Which days each customer opened the app</caption><tr><th>name</th><th>march_days</th></tr><tr><td>Asha</td><td>1, 2, 3, 4, 6, 7, 8</td></tr><tr><td>Ben</td><td>2, 3, 4, 6, 7</td></tr><tr><td>Chen</td><td>2, 5</td></tr><tr><td>Dia</td><td>3, 5</td></tr><tr><td>Esha</td><td>4</td></tr><tr><td>Farah</td><td>2, 3, 4, 5, 6, 7, 8</td></tr><tr><td>Gita</td><td>4, 5</td></tr></table>
  <table class="tbl out"><caption>monthly_revenue (14 rows)</caption><tr><th>month</th><th>revenue</th></tr><tr><td>2025-01</td><td>31000.00</td></tr><tr><td>2025-02</td><td>29500.00</td></tr><tr><td>2025-03</td><td>34000.00</td></tr><tr><td>2025-04</td><td>36500.00</td></tr><tr><td>2025-05</td><td>38000.00</td></tr><tr><td>2025-07</td><td>41000.00</td></tr><tr><td>2025-08</td><td>43500.00</td></tr><tr><td>2025-09</td><td>42000.00</td></tr><tr><td>2025-10</td><td>47000.00</td></tr><tr><td>2025-11</td><td>49500.00</td></tr><tr><td>2025-12</td><td>52000.00</td></tr><tr><td>2026-01</td><td>40300.00</td></tr><tr><td>2026-02</td><td>41300.00</td></tr><tr><td>2026-03</td><td>2630.00</td></tr></table>
  <h3>A CTE in one minute</h3>
  <p>Delivered orders above ₹400, names only:</p>
  <div class="fx" data-lang="sql">WITH big_delivered AS (                         -- step 1: a named bowl of rows
  SELECT * FROM orders WHERE status = 'delivered' AND amount &gt; 400)
SELECT order_id, amount FROM big_delivered ORDER BY amount DESC;   -- step 2: use it like a table</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th></tr><tr><td>109</td><td>600.00</td></tr><tr><td>103</td><td>520.00</td></tr><tr><td>102</td><td>450.00</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Grain</strong>: what one row of a table or result represents. <strong>CTE</strong>: a named result defined with <code>WITH</code>, visible only inside that statement. In this note "revenue" means <code>orders.amount</code> of non-cancelled orders unless a question says otherwise; saying such assumptions out loud is part of the answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Starting to type before agreeing the grain. "Orders per day" could mean placed orders or delivered ones, by order time or delivery time, in which time zone. Two minutes of questions save ten minutes of rewriting.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Nth highest.</b> We have a method. The simplest classic question, "the Nth highest value", already tests whether you think about ties.</div>

  <h2 id="si-nth"><span class="num">02</span>Nth Highest</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>MAX gives the highest. "Second highest" can be done with a subquery trick. But "the 6th highest" needs a general way to number values, and the numbering must decide what happens when two orders have the same amount.</p>
  </div>
  <p><b>The question.</b> What is the 6th highest order amount (counting equal amounts once), and which orders have it?</p>
  <p><b>Needs.</b> Window ranking functions (<a class="xref" data-note="sql_windows">Window Functions</a>: ROW_NUMBER, RANK, DENSE_RANK) and a CTE to filter on the rank (<a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>).</p>
  <p><b>Approach in plain words.</b> Sort amounts from high to low and give each <em>distinct</em> amount a number 1, 2, 3, … with equal amounts sharing a number (that is DENSE_RANK). Keep the rows numbered 6.</p>
  <p><b>Trace.</b> Amounts high to low: 600 (109), 520 (103), 450 (102), 380 (104), 310 (105, 110), 260 (107, 108), 240 (101), 180 (106). Distinct ranks: 600→1, 520→2, 450→3, 380→4, 310→5, 260→6. Answer: 260, orders 107 and 108.</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT order_id, amount, dense_rank() OVER (ORDER BY amount DESC) AS rnk
  FROM orders)
SELECT order_id, amount FROM ranked WHERE rnk = 6 ORDER BY order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th></tr><tr><td>107</td><td>260.00</td></tr><tr><td>108</td><td>260.00</td></tr></table>
  <p>Why each numbering differs, side by side:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
       row_number() OVER w AS row_number, rank() OVER w AS rank, dense_rank() OVER w AS dense_rank
FROM orders WINDOW w AS (ORDER BY amount DESC) ORDER BY amount DESC, order_id;</div>
  <table class="tbl out"><caption>ROW_NUMBER vs RANK vs DENSE_RANK on the same amounts</caption><tr><th>order_id</th><th>amount</th><th>row_number</th><th>rank</th><th>dense_rank</th></tr><tr><td>109</td><td>600.00</td><td>1</td><td>1</td><td>1</td></tr><tr><td>103</td><td>520.00</td><td>2</td><td>2</td><td>2</td></tr><tr><td>102</td><td>450.00</td><td>3</td><td>3</td><td>3</td></tr><tr><td>104</td><td>380.00</td><td>4</td><td>4</td><td>4</td></tr><tr><td>105</td><td>310.00</td><td>5</td><td>5</td><td>5</td></tr><tr><td>110</td><td>310.00</td><td>6</td><td>5</td><td>5</td></tr><tr><td>107</td><td>260.00</td><td>7</td><td>7</td><td>6</td></tr><tr><td>108</td><td>260.00</td><td>8</td><td>7</td><td>6</td></tr><tr><td>101</td><td>240.00</td><td>9</td><td>9</td><td>7</td></tr><tr><td>106</td><td>180.00</td><td>10</td><td>10</td><td>8</td></tr></table>
  <p>On the two ₹310 orders: ROW_NUMBER gives 5 and 6 (which one gets 5 is arbitrary), RANK gives both 5 and then jumps to 7, DENSE_RANK gives both 5 and continues with 6. Only DENSE_RANK numbers <em>distinct amounts</em>.</p>
  <div class="callout trap"><span class="label">Wrong answer 1: LIMIT/OFFSET</span>
    <p><code>ORDER BY amount DESC LIMIT 1 OFFSET 5</code> takes the 6th <em>row</em>, and the two ₹310 orders occupy rows 5 and 6:</p>
  </div>
  <div class="fx" data-lang="sql">SELECT amount FROM orders ORDER BY amount DESC LIMIT 1 OFFSET 5;</div>
  <table class="tbl out"><caption>Says 310: wrong</caption><tr><th>amount</th></tr><tr><td>310.00</td></tr></table>
  <div class="callout trap"><span class="label">Wrong answer 2: RANK instead of DENSE_RANK</span>
    <p>RANK leaves gaps after ties (1, 2, 3, 4, 5, 5, 7…), so "rank = 6" matches nothing at all:</p>
  </div>
  <div class="fx" data-lang="sql">SELECT order_id, amount FROM (SELECT order_id, amount, rank() OVER (ORDER BY amount DESC) AS rnk FROM orders) r WHERE rnk = 6;</div>
  <table class="tbl out"><caption>No rows: wrong</caption><tr><th>order_id</th><th>amount</th></tr></table>
  <p>Other edges to mention: if N is larger than the number of distinct amounts the query returns no rows (say whether NULL is wanted instead); NULL amounts sort first in DESC order in PostgreSQL unless you write <code>NULLS LAST</code>.</p>
  <div class="callout def"><span class="label">Pattern</span>
    <p><strong>Nth highest</strong> = <code>dense_rank() OVER (ORDER BY x DESC)</code> in a CTE, then <code>WHERE rnk = N</code>. Use RANK if ties should consume positions ("6th place in a race"), ROW_NUMBER only when exactly one row is wanted and ties may be broken arbitrarily.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: top-N per group.</b> This ranked the whole table at once. Most real questions rank <em>within</em> each group: the top dish at each restaurant, the latest order of each customer.</div>

  <h2 id="si-topn"><span class="num">03</span>Top-N per Group</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>DENSE_RANK over the whole table finds the overall best. How do we restart the numbering for each restaurant, and what happens when two dishes tie for first?</p>
  </div>
  <p><b>The question.</b> For each restaurant, its best-selling dish by quantity (not counting cancelled orders), keeping ties.</p>
  <p><b>Needs.</b> Join + GROUP BY (<a class="xref" data-note="sql_joins">JOINs</a>, <a class="xref" data-note="sql_fundamentals">Fundamentals</a>), then <code>rank() OVER (PARTITION BY …)</code> (<a class="xref" data-note="sql_windows">Window Functions</a>), filtered in an outer query because window functions can't go in WHERE.</p>
  <p><b>Approach in plain words.</b> Step 1: quantity per (restaurant, dish). Step 2: inside each restaurant, rank dishes by quantity, ties sharing a rank. Step 3: keep rank 1.</p>
  <p><b>Trace.</b> Non-cancelled lines per restaurant: Dosa Hut: Masala Dosa 2 + 1 + 2 = 5, Filter Coffee 2 + 1 = 3. Biryani Bros: Chicken Biryani 1 + 1 = 2, Raita 2, Veg Biryani 1, Mutton Kebab 1. Pizza Point: Farmhouse Pizza 2 (order 107's 1 is cancelled), Garlic Bread 1, Margherita 1. Green Bowl: its only order (105) is cancelled. Top: Masala Dosa; Chicken Biryani <em>and</em> Raita (tie at 2); Farmhouse Pizza.</p>
  <div class="fx" data-lang="sql">SELECT r.name AS restaurant, oi.item, sum(oi.qty) AS qty
FROM orders o JOIN order_items oi USING (order_id) JOIN restaurants r USING (restaurant_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY r.name, oi.item ORDER BY r.name, qty DESC, oi.item;</div>
  <table class="tbl out"><caption>Step 1: quantity per restaurant and dish</caption><tr><th>restaurant</th><th>item</th><th>qty</th></tr><tr><td>Biryani Bros</td><td>Chicken Biryani</td><td>2</td></tr><tr><td>Biryani Bros</td><td>Raita</td><td>2</td></tr><tr><td>Biryani Bros</td><td>Mutton Kebab</td><td>1</td></tr><tr><td>Biryani Bros</td><td>Veg Biryani</td><td>1</td></tr><tr><td>Dosa Hut</td><td>Masala Dosa</td><td>5</td></tr><tr><td>Dosa Hut</td><td>Filter Coffee</td><td>3</td></tr><tr><td>Pizza Point</td><td>Farmhouse Pizza</td><td>2</td></tr><tr><td>Pizza Point</td><td>Garlic Bread</td><td>1</td></tr><tr><td>Pizza Point</td><td>Margherita</td><td>1</td></tr></table>
  <div class="fx" data-lang="sql">WITH dish_qty AS (
  SELECT r.name AS restaurant, oi.item, sum(oi.qty) AS qty
  FROM orders o JOIN order_items oi USING (order_id) JOIN restaurants r USING (restaurant_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY r.name, oi.item),
ranked AS (
  SELECT *, rank() OVER (PARTITION BY restaurant ORDER BY qty DESC) AS rnk FROM dish_qty)
SELECT restaurant, item, qty FROM ranked WHERE rnk = 1 ORDER BY restaurant, item;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant</th><th>item</th><th>qty</th></tr><tr><td>Biryani Bros</td><td>Chicken Biryani</td><td>2</td></tr><tr><td>Biryani Bros</td><td>Raita</td><td>2</td></tr><tr><td>Dosa Hut</td><td>Masala Dosa</td><td>5</td></tr><tr><td>Pizza Point</td><td>Farmhouse Pizza</td><td>2</td></tr></table>
  <div class="callout trap"><span class="label">Wrong answer 1: ROW_NUMBER</span>
    <p>It gives exactly one row per restaurant and silently drops one of the tied Biryani Bros dishes (which one depends on the plan):</p>
  </div>
  <div class="fx" data-lang="sql">WITH dish_qty AS (
  SELECT r.name AS restaurant, oi.item, sum(oi.qty) AS qty
  FROM orders o JOIN order_items oi USING (order_id) JOIN restaurants r USING (restaurant_id)
  WHERE o.status &lt;&gt; 'cancelled' GROUP BY r.name, oi.item)
SELECT restaurant, item, qty FROM (
  SELECT *, row_number() OVER (PARTITION BY restaurant ORDER BY qty DESC) AS rn FROM dish_qty) x
WHERE rn = 1 ORDER BY restaurant;</div>
  <table class="tbl out"><caption>One Biryani Bros dish vanished</caption><tr><th>restaurant</th><th>item</th><th>qty</th></tr><tr><td>Biryani Bros</td><td>Raita</td><td>2</td></tr><tr><td>Dosa Hut</td><td>Masala Dosa</td><td>5</td></tr><tr><td>Pizza Point</td><td>Farmhouse Pizza</td><td>2</td></tr></table>
  <div class="callout trap"><span class="label">Wrong answer 2: GROUP BY with MAX</span>
    <p><code>SELECT restaurant, max(qty) … GROUP BY restaurant</code> returns the top quantity but not the dish, and adding <code>item</code> to the SELECT is an error (or, in MySQL with ONLY_FULL_GROUP_BY off, an arbitrary dish). Wrong answer 3: putting <code>rank() OVER (…) = 1</code> in WHERE: windows are computed after WHERE, so it is an error.</p>
  </div>
  <p>Green Bowl and Momo Magic sold nothing, so they are absent. If the question says "each restaurant", ask whether they should appear with NULL: that needs a LEFT JOIN from restaurants, which is exactly the next pattern's idea.</p>
  <div class="callout def"><span class="label">Pattern</span>
    <p><strong>Top-N per group</strong>: aggregate in a CTE → <code>rank() OVER (PARTITION BY group ORDER BY measure DESC)</code> → outer <code>WHERE rnk &lt;= N</code>. RANK keeps ties; ROW_NUMBER doesn't. PostgreSQL's <code>DISTINCT ON (group)</code> is a shortcut for N = 1 without ties.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: date spines.</b> Rankings and GROUP BY only see rows that exist. A restaurant with no sales vanished above; in a daily report, a day with no orders vanishes the same way, and the chart's x-axis silently skips it.</div>

  <h2 id="si-spine"><span class="num">04</span>Date Spines: Days With Zero</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>GROUP BY makes one row per value that appears. How do we get a row for a day on which <em>nothing</em> happened?</p>
  </div>
  <p><b>The question.</b> Number of orders and revenue (non-cancelled) for every day from 2 to 8 March 2026, showing 0 on days without orders.</p>
  <p><b>Needs.</b> <code>generate_series</code> to create rows that exist in no table (the CROSS JOIN grid idea from <a class="xref" data-note="sql_joins">JOINs</a> §04), LEFT JOIN with the filter in ON (§07), counting a right-table column (§02), COALESCE for NULL sums (<a class="xref" data-note="sql_fundamentals">Fundamentals</a>).</p>
  <p><b>Approach in plain words.</b> Build a "spine": one row per calendar day. Attach the orders of that day with a LEFT JOIN so days with no orders survive with NULLs. Count order ids (NULL doesn't count) and turn NULL sums into 0.</p>
  <p><b>Trace.</b> Orders by day: 2 Mar: 101, 102, 103 (3; ₹1,210); 3 Mar: 104, 105 (105 cancelled → 1; ₹380); 4 Mar: 106, 107 (107 cancelled → 1; ₹180); 5 Mar: 108, 109 (2; ₹860); 6 and 7 Mar: none; 8 Mar: 110 (1; ₹310).</p>
  <div class="fx" data-lang="sql">WITH spine AS (
  SELECT d::date AS day FROM generate_series(date '2026-03-02', date '2026-03-08', interval '1 day') d)
SELECT s.day, to_char(s.day, 'Dy') AS weekday,
       count(o.order_id) AS orders, coalesce(sum(o.amount), 0) AS revenue
FROM spine s
LEFT JOIN orders o ON o.ordered_at &gt;= s.day AND o.ordered_at &lt; s.day + 1
                  AND o.status &lt;&gt; 'cancelled'
GROUP BY s.day ORDER BY s.day;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>weekday</th><th>orders</th><th>revenue</th></tr><tr><td>2026-03-02</td><td>Mon</td><td>3</td><td>1210.00</td></tr><tr><td>2026-03-03</td><td>Tue</td><td>1</td><td>380.00</td></tr><tr><td>2026-03-04</td><td>Wed</td><td>1</td><td>180.00</td></tr><tr><td>2026-03-05</td><td>Thu</td><td>2</td><td>860.00</td></tr><tr><td>2026-03-06</td><td>Fri</td><td>0</td><td>0</td></tr><tr><td>2026-03-07</td><td>Sat</td><td>0</td><td>0</td></tr><tr><td>2026-03-08</td><td>Sun</td><td>1</td><td>310.00</td></tr></table>
  <p>The join condition is a half-open range on the timestamp (<code>&gt;= day AND &lt; day + 1</code>), so the index on ordered_at stays usable (<a class="xref" data-note="sql_optimization">sargability</a>) and order 110 at 20:50 on 8 March is not lost.</p>
  <div class="callout trap"><span class="label">Wrong answer 1: GROUP BY the order date</span>
    <p>Only days that have orders appear; 6 and 7 March are simply missing (5 rows, not 7):</p>
  </div>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, count(*) AS orders FROM orders WHERE status &lt;&gt; 'cancelled' GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>5 rows</caption><tr><th>day</th><th>orders</th></tr><tr><td>2026-03-02</td><td>3</td></tr><tr><td>2026-03-03</td><td>1</td></tr><tr><td>2026-03-04</td><td>1</td></tr><tr><td>2026-03-05</td><td>2</td></tr><tr><td>2026-03-08</td><td>1</td></tr></table>
  <div class="callout trap"><span class="label">Wrong answer 2: count(*) and status in WHERE</span>
    <p>count(*) counts the NULL-padded row as 1 on empty days, and the status filter in WHERE drops those padded rows altogether:</p>
  </div>
  <div class="fx" data-lang="sql">WITH spine AS (SELECT d::date AS day FROM generate_series(date '2026-03-02', date '2026-03-08', interval '1 day') d)
SELECT s.day, count(*) AS orders
FROM spine s LEFT JOIN orders o ON o.ordered_at &gt;= s.day AND o.ordered_at &lt; s.day + 1
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY s.day ORDER BY s.day;</div>
  <table class="tbl out"><caption>Empty days vanish again</caption><tr><th>day</th><th>orders</th></tr><tr><td>2026-03-02</td><td>3</td></tr><tr><td>2026-03-03</td><td>1</td></tr><tr><td>2026-03-04</td><td>1</td></tr><tr><td>2026-03-05</td><td>2</td></tr><tr><td>2026-03-08</td><td>1</td></tr></table>
  <div class="callout def"><span class="label">Pattern</span>
    <p><strong>Date spine</strong>: <code>generate_series(start, end, interval)</code> → LEFT JOIN facts with all fact filters in ON → <code>count(fact.pk)</code>, <code>coalesce(sum(…), 0)</code>. In warehouses a permanent <code>dim_date</code> table plays the spine's role (<a class="xref" data-note="sql_modeling">Data Modeling</a> §09).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: pivoting.</b> The spine gives one row per day. Reports often want a second dimension spread across <em>columns</em>: one row per restaurant, one column per status.</div>

  <h2 id="si-pivot"><span class="num">05</span>Pivoting: Rows into Columns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>GROUP BY restaurant, status gives one row per combination: long and hard to read. How do we turn the status values into columns, with 0 where a restaurant had none?</p>
  </div>
  <p><b>The question.</b> One row per restaurant (all five), with columns delivered, pending, cancelled (order counts) and delivered revenue.</p>
  <p><b>Needs.</b> LEFT JOIN from restaurants (<a class="xref" data-note="sql_joins">JOINs</a>), conditional aggregation: an aggregate with <code>FILTER (WHERE …)</code> or a CASE inside (<a class="xref" data-note="sql_fundamentals">Fundamentals</a>).</p>
  <p><b>Approach in plain words.</b> One group per restaurant. For each output column, count only the rows that match that column's condition. A LEFT JOIN keeps Momo Magic, whose counts are then 0.</p>
  <p><b>Trace.</b> Dosa Hut: 101, 108 delivered, 110 pending. Biryani Bros: 102, 106, 109 delivered (₹1,230). Pizza Point: 103, 104 delivered (₹900), 107 cancelled. Green Bowl: 105 cancelled. Momo Magic: nothing.</p>
  <div class="fx" data-lang="sql">SELECT r.name AS restaurant,
       count(*) FILTER (WHERE o.status = 'delivered') AS delivered,
       count(*) FILTER (WHERE o.status = 'pending')   AS pending,
       count(*) FILTER (WHERE o.status = 'cancelled') AS cancelled,
       coalesce(sum(o.amount) FILTER (WHERE o.status = 'delivered'), 0) AS delivered_revenue
FROM restaurants r LEFT JOIN orders o USING (restaurant_id)
GROUP BY r.restaurant_id, r.name ORDER BY r.restaurant_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant</th><th>delivered</th><th>pending</th><th>cancelled</th><th>delivered_revenue</th></tr><tr><td>Dosa Hut</td><td>2</td><td>1</td><td>0</td><td>500.00</td></tr><tr><td>Biryani Bros</td><td>3</td><td>0</td><td>0</td><td>1230.00</td></tr><tr><td>Pizza Point</td><td>2</td><td>0</td><td>1</td><td>900.00</td></tr><tr><td>Green Bowl</td><td>0</td><td>0</td><td>1</td><td>0</td></tr><tr><td>Momo Magic</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></table>
  <p><code>count(*) FILTER (WHERE …)</code> counts only rows meeting the condition; for Momo Magic's padded row the status is NULL, so every FILTER is false and it gets 0s. The portable spelling (MySQL, SQL Server) is <code>sum(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END)</code>.</p>
  <div class="callout trap"><span class="label">Wrong answer: COUNT(CASE … ELSE 0 END)</span>
    <p>COUNT counts every non-NULL value, and 0 is not NULL, so each "status" column counts all orders:</p>
  </div>
  <div class="fx" data-lang="sql">SELECT r.name AS restaurant,
       count(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       count(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM restaurants r LEFT JOIN orders o USING (restaurant_id)
GROUP BY r.restaurant_id, r.name ORDER BY r.restaurant_id;</div>
  <table class="tbl out"><caption>Every column is the same: wrong</caption><tr><th>restaurant</th><th>delivered</th><th>cancelled</th></tr><tr><td>Dosa Hut</td><td>3</td><td>3</td></tr><tr><td>Biryani Bros</td><td>3</td><td>3</td></tr><tr><td>Pizza Point</td><td>3</td><td>3</td></tr><tr><td>Green Bowl</td><td>1</td><td>1</td></tr><tr><td>Momo Magic</td><td>1</td><td>1</td></tr></table>
  <p>Fix: <code>sum(… THEN 1 ELSE 0 END)</code> or <code>count(CASE … THEN 1 END)</code> (no ELSE, so non-matches are NULL). Notice Momo Magic shows 1 in the wrong version: its padded row counts too.</p>
  <div class="callout def"><span class="label">Pattern</span>
    <p><strong>Pivot</strong> = GROUP BY the row label + one conditional aggregate per column. The column list must be known when writing the query (dynamic pivots need generated SQL or a tool; PostgreSQL's <code>crosstab()</code> from the tablefunc extension is another option, not used here).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: year-over-year.</b> A pivot puts categories side by side. The most-asked business comparison puts <em>time periods</em> side by side: this month vs the same month last year.</div>

  <h2 id="si-yoy"><span class="num">06</span>Year-over-Year</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pivoting compared categories within one period. "Are we growing?" compares a period with the <em>same</em> period a year earlier, which lives in a different row of the same table. How do we put the two rows side by side, and what if a month is missing?</p>
  </div>
  <p><b>The question.</b> For each month of 2026, revenue, revenue in the same month of 2025, and growth %.</p>
  <p><b>Needs.</b> A self join (<a class="xref" data-note="sql_joins">JOINs</a> §05) on a computed key, LEFT JOIN so months with no previous-year row survive; or LAG (<a class="xref" data-note="sql_windows">Window Functions</a>) and why it is fragile here; date arithmetic with intervals.</p>
  <p><b>Approach in plain words.</b> Match each month's row with the row whose month is exactly one year earlier (<code>month - interval '1 year'</code>), then growth = (this − last) / last × 100.</p>
  <p><b>Trace.</b> Jan 2026: 40,300 vs Jan 2025: 31,000 → (40,300 − 31,000) / 31,000 = +30.0%. Feb: 41,300 vs 29,500 → +40.0%. Mar: 2,630 vs 34,000 → −92.3%, but March 2026 only covers 1–8 March (see the trap).</p>
  <div class="fx" data-lang="sql">SELECT to_char(cur.month, 'YYYY-MM') AS month, cur.revenue,
       prev.revenue AS revenue_last_year,
       round(100.0 * (cur.revenue - prev.revenue) / prev.revenue, 1) AS yoy_pct
FROM monthly_revenue cur
LEFT JOIN monthly_revenue prev ON prev.month = cur.month - interval '1 year'
WHERE cur.month &gt;= '2026-01-01'
ORDER BY cur.month;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>revenue_last_year</th><th>yoy_pct</th></tr><tr><td>2026-01</td><td>40300.00</td><td>31000.00</td><td>30.0</td></tr><tr><td>2026-02</td><td>41300.00</td><td>29500.00</td><td>40.0</td></tr><tr><td>2026-03</td><td>2630.00</td><td>34000.00</td><td>-92.3</td></tr></table>
  <div class="callout trap"><span class="label">Wrong answer 1: LAG(revenue, 12)</span>
    <p>LAG counts <em>rows</em>, not months. With June 2025 missing, "12 rows back" is not "12 months back":</p>
  </div>
  <div class="fx" data-lang="sql">SELECT to_char(month, 'YYYY-MM') AS month, revenue,
       to_char(lag(month, 12) OVER (ORDER BY month), 'YYYY-MM') AS compared_with,
       lag(revenue, 12) OVER (ORDER BY month) AS lag12_revenue
FROM monthly_revenue ORDER BY month DESC LIMIT 3;</div>
  <table class="tbl out"><caption>Compared with the wrong month</caption><tr><th>month</th><th>revenue</th><th>compared_with</th><th>lag12_revenue</th></tr><tr><td>2026-03</td><td>2630.00</td><td>2025-02</td><td>29500.00</td></tr><tr><td>2026-02</td><td>41300.00</td><td>2025-01</td><td>31000.00</td></tr><tr><td>2026-01</td><td>40300.00</td><td>NULL</td><td>NULL</td></tr></table>
  <p>February 2026 is compared with January 2025 and March with February 2025, and January 2026 gets nothing. LAG is fine only when every period is guaranteed present (build a spine first, as in section 04).</p>
  <div class="callout trap"><span class="label">Wrong answer 2: comparing a partial period</span>
    <p>−92.3% for March is not a collapse: 8 days of 2026 against 31 days of 2025. Compare like with like: wait for month end, or compare month-to-date with the same days last year (which needs daily data), and say so in the answer.</p>
  </div>
  <p>Integer division is the third classic: if revenue were an integer column, <code>(cur - prev) / prev</code> would be 0. Multiply by <code>100.0</code> first, as above.</p>
  <div class="callout def"><span class="label">Pattern</span>
    <p><strong>Period-over-period</strong>: self-join on the shifted key (<code>prev.month = cur.month - interval '1 year'</code>), LEFT JOIN, growth = (cur − prev) / prev. LAG(…, k) only after guaranteeing one row per period. Flag incomplete periods.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: funnels.</b> YoY compares totals of whole periods. Product questions follow each <em>user</em> through ordered steps: how many who opened the app went on to checkout?</div>

  <h2 id="si-funnel"><span class="num">07</span>Funnels</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Counting events by type is a GROUP BY. But a funnel asks how many <em>sessions</em> reached each step after the previous one: steps must be counted once per session and in the right order. Which grain, and how do we enforce order?</p>
  </div>
  <p><b>The question.</b> A session is one customer on one day. How many sessions reached each step: app_open → view_menu → add_to_cart → checkout, and the conversion from each step to the next?</p>
  <p><b>Needs.</b> Grain (<a class="xref" data-note="sql_modeling">Data Modeling</a> §10), GROUP BY with conditional aggregates (section 05's FILTER), CTEs.</p>
  <p><b>Approach in plain words.</b> Step 1: collapse events to one row per session with the <em>earliest</em> time of each step. Step 2: a session reaches a step if it has that step and all earlier steps, each no earlier than the one before. Step 3: count per step.</p>
  <p><b>Trace.</b> 26 sessions (one per app_open day). Menus were viewed in all 10 ordering sessions plus 6 browsing sessions (Asha 6 Mar, Ben 6 Mar, Farah 3 and 4 Mar, Gita 4 Mar, Dia 5 Mar) = 16. Carts: the 10 ordering sessions plus Farah's and Gita's abandoned carts on 4 Mar = 12. Checkouts: 10. Farah's 5 March session as one row: open 19:55, menu 19:57, cart 19:59 (two items, two events, earliest kept), checkout 20:05: reaches all four.</p>
  <div class="fx" data-lang="sql">SELECT customer_id, event_at::date AS day,
       to_char(min(event_at) FILTER (WHERE event = 'app_open'), 'HH24:MI')    AS t_open,
       to_char(min(event_at) FILTER (WHERE event = 'view_menu'), 'HH24:MI')   AS t_menu,
       to_char(min(event_at) FILTER (WHERE event = 'add_to_cart'), 'HH24:MI') AS t_cart,
       to_char(min(event_at) FILTER (WHERE event = 'checkout'), 'HH24:MI')    AS t_checkout
FROM events GROUP BY customer_id, event_at::date ORDER BY day, customer_id LIMIT 6;</div>
  <table class="tbl out"><caption>Step 1 (first 6 sessions): one row per session, earliest time per step</caption><tr><th>customer_id</th><th>day</th><th>t_open</th><th>t_menu</th><th>t_cart</th><th>t_checkout</th></tr><tr><td>1</td><td>2026-03-01</td><td>19:00</td><td>NULL</td><td>NULL</td><td>NULL</td></tr><tr><td>1</td><td>2026-03-02</td><td>12:00</td><td>12:02</td><td>12:04</td><td>12:10</td></tr><tr><td>2</td><td>2026-03-02</td><td>12:55</td><td>12:57</td><td>12:59</td><td>13:05</td></tr><tr><td>3</td><td>2026-03-02</td><td>20:20</td><td>20:22</td><td>20:24</td><td>20:30</td></tr><tr><td>6</td><td>2026-03-02</td><td>19:00</td><td>NULL</td><td>NULL</td><td>NULL</td></tr><tr><td>1</td><td>2026-03-03</td><td>13:05</td><td>13:07</td><td>13:09</td><td>13:15</td></tr></table>
  <div class="fx" data-lang="sql">WITH s AS (
  SELECT customer_id, event_at::date AS day,
         min(event_at) FILTER (WHERE event = 'app_open')    AS t_open,
         min(event_at) FILTER (WHERE event = 'view_menu')   AS t_menu,
         min(event_at) FILTER (WHERE event = 'add_to_cart') AS t_cart,
         min(event_at) FILTER (WHERE event = 'checkout')    AS t_checkout
  FROM events GROUP BY customer_id, event_at::date),
steps AS (
  SELECT count(*) FILTER (WHERE t_open IS NOT NULL) AS s1_open,
         count(*) FILTER (WHERE t_menu &gt;= t_open) AS s2_menu,
         count(*) FILTER (WHERE t_cart &gt;= t_menu AND t_menu &gt;= t_open) AS s3_cart,
         count(*) FILTER (WHERE t_checkout &gt;= t_cart AND t_cart &gt;= t_menu AND t_menu &gt;= t_open) AS s4_checkout
  FROM s)
SELECT *, round(100.0 * s2_menu / s1_open, 1) AS open_to_menu_pct,
          round(100.0 * s3_cart / s2_menu, 1) AS menu_to_cart_pct,
          round(100.0 * s4_checkout / s3_cart, 1) AS cart_to_checkout_pct,
          round(100.0 * s4_checkout / s1_open, 1) AS overall_pct
FROM steps;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>s1_open</th><th>s2_menu</th><th>s3_cart</th><th>s4_checkout</th><th>open_to_menu_pct</th><th>menu_to_cart_pct</th><th>cart_to_checkout_pct</th><th>overall_pct</th></tr><tr><td>26</td><td>16</td><td>12</td><td>10</td><td>61.5</td><td>75.0</td><td>83.3</td><td>38.5</td></tr></table>
  <p>(A comparison with a NULL time is UNKNOWN, so a session missing a step can never pass the later steps' conditions: NULL logic from <a class="xref" data-note="sql_fundamentals">Fundamentals</a> doing useful work.)</p>
  <div class="callout trap"><span class="label">Wrong answer 1: count events</span>
    <p>One add_to_cart per item means a 2-item order adds 2 events. More carts than menus is a sign of the wrong grain:</p>
  </div>
  <div class="fx" data-lang="sql">SELECT event, count(*) AS events FROM events GROUP BY event ORDER BY count(*) DESC;</div>
  <table class="tbl out"><caption>add_to_cart 17 > view_menu 16: impossible as a funnel</caption><tr><th>event</th><th>events</th></tr><tr><td>app_open</td><td>26</td></tr><tr><td>add_to_cart</td><td>17</td></tr><tr><td>view_menu</td><td>16</td></tr><tr><td>checkout</td><td>10</td></tr></table>
  <div class="callout trap"><span class="label">Wrong answer 2: distinct customers without order or session</span>
    <p><code>count(DISTINCT customer_id)</code> per event type gives 7, 7, 7, 6: a different question (did each <em>customer</em> ever do the step, in any order, on any day). Gita's view on 4 March and a checkout on another day would count as a conversion. Agree the grain (session or user) and the time window first.</p>
  </div>
  <div class="callout def"><span class="label">Pattern</span>
    <p><strong>Funnel</strong>: one row per unit (session/user) with <code>min(time) FILTER (WHERE step = …)</code> per step → step k counted if steps 1..k exist in non-decreasing time → conversion = step(k+1) / step(k).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: retention and cohorts.</b> A funnel follows a user within one session. The health of an app is whether users come <em>back</em> on later days, measured from when each user started.</div>

  <h2 id="si-ret"><span class="num">08</span>Retention and Cohorts</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"How many users came back?" depends on when each one started: a user who arrived yesterday has had no chance to return. How do we line users up by their own start date and measure returns within a fair window?</p>
  </div>
  <p><b>The question.</b> Group customers by the day they first opened the app (their <strong>cohort</strong>). For each cohort: how many opened it again within 3 days after that first day (day 1 to day 3), and what %?</p>
  <p><b>Needs.</b> MIN per group, EXISTS (a semi-join, <a class="xref" data-note="sql_joins">JOINs</a> §06), date arithmetic, CTEs.</p>
  <p><b>Approach in plain words.</b> Step 1: distinct (customer, day) of app opens. Step 2: each customer's first day = cohort. Step 3: did they open on any day from cohort + 1 to cohort + 3? Step 4: count per cohort.</p>
  <p><b>Trace.</b> First days: Asha 1 Mar; Ben, Chen, Farah 2 Mar; Dia 3 Mar; Esha, Gita 4 Mar. Returns within 3 days: Asha (2 Mar) yes; Ben (3) yes; Chen (5 is day 3) yes; Farah (3) yes; Dia (5) yes; Esha (only 4 Mar) no; Gita (5) yes. Cohorts: 1 Mar 1/1, 2 Mar 3/3, 3 Mar 1/1, 4 Mar 1/2. Every cohort's window ends by 7 March and our data runs to 8 March, so all windows are complete.</p>
  <div class="fx" data-lang="sql">WITH opens AS (
  SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open'),
cohorts AS (
  SELECT customer_id, min(day) AS cohort_day FROM opens GROUP BY customer_id),
flags AS (
  SELECT c.customer_id, c.cohort_day,
         EXISTS (SELECT 1 FROM opens o WHERE o.customer_id = c.customer_id
                   AND o.day BETWEEN c.cohort_day + 1 AND c.cohort_day + 3) AS returned
  FROM cohorts c
  WHERE c.cohort_day + 3 &lt;= date '2026-03-08')          -- only cohorts with a complete window
SELECT cohort_day, count(*) AS users, count(*) FILTER (WHERE returned) AS returned,
       round(100.0 * count(*) FILTER (WHERE returned) / count(*), 1) AS retention_pct
FROM flags GROUP BY cohort_day ORDER BY cohort_day;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>cohort_day</th><th>users</th><th>returned</th><th>retention_pct</th></tr><tr><td>2026-03-01</td><td>1</td><td>1</td><td>100.0</td></tr><tr><td>2026-03-02</td><td>3</td><td>3</td><td>100.0</td></tr><tr><td>2026-03-03</td><td>1</td><td>1</td><td>100.0</td></tr><tr><td>2026-03-04</td><td>2</td><td>1</td><td>50.0</td></tr></table>
  <p>Here <code>BETWEEN</code> is safe because <code>day</code> is a <code>date</code>, not a timestamp (the timestamp version of BETWEEN is a trap: section 10).</p>
  <div class="callout trap"><span class="label">Wrong answer 1: counting day 0</span>
    <p>Using <code>o.day &gt;= c.cohort_day</code> lets the first visit itself count as a return: everyone is retained.</p>
  </div>
  <div class="fx" data-lang="sql">WITH opens AS (SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open'),
cohorts AS (SELECT customer_id, min(day) AS cohort_day FROM opens GROUP BY customer_id)
SELECT c.cohort_day, count(*) AS users,
       count(*) FILTER (WHERE EXISTS (SELECT 1 FROM opens o WHERE o.customer_id = c.customer_id
                                        AND o.day &gt;= c.cohort_day AND o.day &lt;= c.cohort_day + 3)) AS returned
FROM cohorts c GROUP BY c.cohort_day ORDER BY c.cohort_day;</div>
  <table class="tbl out"><caption>100% everywhere: wrong</caption><tr><th>cohort_day</th><th>users</th><th>returned</th></tr><tr><td>2026-03-01</td><td>1</td><td>1</td></tr><tr><td>2026-03-02</td><td>3</td><td>3</td></tr><tr><td>2026-03-03</td><td>1</td><td>1</td></tr><tr><td>2026-03-04</td><td>2</td><td>2</td></tr></table>
  <div class="callout trap"><span class="label">Wrong answer 2: incomplete windows</span>
    <p>A cohort that started on 7 March would have only 1 of its 3 days observed; including it drags retention down for a reason that is about the calendar, not the users. Keep only cohorts whose window has fully passed (the WHERE line above), or show them greyed out.</p>
  </div>
  <div class="callout def"><span class="label">Pattern</span>
    <p><strong>Cohort retention</strong>: distinct activity per (user, period) → cohort = first period per user → flag activity in the window [cohort + 1, cohort + N] (EXISTS or a join) → aggregate per cohort, only for complete windows. A cohort table (one column per day/week since start) is this plus a pivot (section 05).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: streaks.</b> Retention asks "did they come back at least once?". Engagement features (Duolingo-style streaks) ask "for how many days <em>in a row</em>?", which needs to recognise unbroken runs of consecutive days.</div>

  <h2 id="si-streak"><span class="num">09</span>Streaks: Gaps and Islands</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each row is one day a customer opened the app. A streak is a run of consecutive days, and SQL has no "consecutive" keyword. How do we give every day in the same run the same label so we can GROUP BY it?</p>
  </div>
  <p><b>The question.</b> Each customer's longest streak of consecutive days with an app open, with its start and end.</p>
  <p><b>Needs.</b> DISTINCT, <code>row_number() OVER (PARTITION BY … ORDER BY …)</code> (<a class="xref" data-note="sql_windows">Window Functions</a>), date − integer arithmetic, GROUP BY, then section 03's top-1-per-group.</p>
  <p><b>Approach in plain words.</b> Number each customer's days 1, 2, 3, … in date order. Inside a run of consecutive days, the date goes up by 1 exactly when the number goes up by 1, so <em>date − number</em> stays the same; a gap makes it jump. That constant is the run's label ("island"). Group by it, count days, keep each customer's longest.</p>
  <p><b>Trace (Asha).</b> Days 1, 2, 3, 4, 6, 7, 8 March get numbers 1–7. date − number: 1−1, 2−2, 3−3, 4−4 → all "28 Feb"; 6−5, 7−6, 8−7 → all "1 Mar". Two islands: 1–4 March (4 days) and 6–8 March (3 days). Longest: 4.</p>
  <div class="fx" data-lang="sql">WITH days AS (SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open')
SELECT day, row_number() OVER (ORDER BY day) AS n,
       day - (row_number() OVER (ORDER BY day))::int AS island
FROM days WHERE customer_id = 1 ORDER BY day;</div>
  <table class="tbl out"><caption>Islands for Asha</caption><tr><th>day</th><th>n</th><th>island</th></tr><tr><td>2026-03-01</td><td>1</td><td>2026-02-28</td></tr><tr><td>2026-03-02</td><td>2</td><td>2026-02-28</td></tr><tr><td>2026-03-03</td><td>3</td><td>2026-02-28</td></tr><tr><td>2026-03-04</td><td>4</td><td>2026-02-28</td></tr><tr><td>2026-03-06</td><td>5</td><td>2026-03-01</td></tr><tr><td>2026-03-07</td><td>6</td><td>2026-03-01</td></tr><tr><td>2026-03-08</td><td>7</td><td>2026-03-01</td></tr></table>
  <div class="fx" data-lang="sql">WITH days AS (
  SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open'),
islands AS (
  SELECT customer_id, day,
         day - (row_number() OVER (PARTITION BY customer_id ORDER BY day))::int AS island
  FROM days),
runs AS (
  SELECT customer_id, island, count(*) AS days, min(day) AS start_day, max(day) AS end_day
  FROM islands GROUP BY customer_id, island)
SELECT DISTINCT ON (r.customer_id) c.name, r.days AS longest_streak, r.start_day, r.end_day
FROM runs r JOIN customers c USING (customer_id)
ORDER BY r.customer_id, r.days DESC, r.start_day;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>longest_streak</th><th>start_day</th><th>end_day</th></tr><tr><td>Asha</td><td>4</td><td>2026-03-01</td><td>2026-03-04</td></tr><tr><td>Ben</td><td>3</td><td>2026-03-02</td><td>2026-03-04</td></tr><tr><td>Chen</td><td>1</td><td>2026-03-02</td><td>2026-03-02</td></tr><tr><td>Dia</td><td>1</td><td>2026-03-03</td><td>2026-03-03</td></tr><tr><td>Esha</td><td>1</td><td>2026-03-04</td><td>2026-03-04</td></tr><tr><td>Farah</td><td>7</td><td>2026-03-02</td><td>2026-03-08</td></tr><tr><td>Gita</td><td>2</td><td>2026-03-04</td><td>2026-03-05</td></tr></table>
  <p>Farah opened the app every day from 2 to 8 March: 7. <code>DISTINCT ON (customer_id)</code> with <code>ORDER BY customer_id, days DESC</code> keeps the first (longest) run per customer; on a tie it keeps the earliest because of <code>start_day</code>.</p>
  <div class="callout trap"><span class="label">Wrong answer 1: counting consecutive pairs</span>
    <p>"Count days where day − previous day = 1" (with LAG) counts <em>pairs</em> across all runs, not the length of one run:</p>
  </div>
  <div class="fx" data-lang="sql">WITH days AS (SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open')
SELECT customer_id, count(*) FILTER (WHERE day - prev = 1) AS consecutive_pairs
FROM (SELECT customer_id, day, lag(day) OVER (PARTITION BY customer_id ORDER BY day) AS prev FROM days) x
WHERE customer_id = 1 GROUP BY customer_id;</div>
  <table class="tbl out"><caption>Asha: 5 consecutive pairs, but her longest streak is 4</caption><tr><th>customer_id</th><th>consecutive_pairs</th></tr><tr><td>1</td><td>5</td></tr></table>
  <div class="callout trap"><span class="label">Wrong answer 2: skipping DISTINCT</span>
    <p>If a customer opens the app twice on one day, row_number advances twice while the date doesn't, splitting the island. Reduce to one row per (customer, day) first (the <code>days</code> CTE).</p>
  </div>
  <div class="callout def"><span class="label">Pattern</span>
    <p><strong>Gaps and islands</strong>: distinct (entity, day) → <code>day − row_number() OVER (PARTITION BY entity ORDER BY day)</code> = island id → GROUP BY entity, island → length, start, end. The same trick finds consecutive IDs, sessions split by inactivity gaps (with LAG and a running sum), and date ranges to merge.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: more practice.</b> These eight patterns cover the long questions. Interviews also ask many short ones that test single tools and NULL traps; here they are, all on Biteful.</div>

  <h2 id="si-more"><span class="num">10</span>More Practice: Shorter Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you do the quick ones fast, and spot the trap each one hides? Try each before revealing; every answer was run.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Which customers placed more than one order? (needs GROUP BY + HAVING)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name, count(*) AS orders
FROM orders o JOIN customers c USING (customer_id)
GROUP BY c.customer_id, c.name HAVING count(*) &gt; 1 ORDER BY orders DESC, c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>orders</th></tr><tr><td>Asha</td><td>3</td></tr><tr><td>Ben</td><td>2</td></tr><tr><td>Chen</td><td>2</td></tr></table>
  A filter on an aggregate goes in HAVING; <code>WHERE count(*) &gt; 1</code> is an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Customers who never ordered. Give a safe way and say why NOT IN can be dangerous. (anti-join)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);
SELECT name FROM customers WHERE customer_id NOT IN (SELECT referred_by FROM customers);</div>
  <table class="tbl out"><caption>NOT EXISTS: Gita</caption><tr><th>name</th></tr><tr><td>Gita</td></tr></table>
  <table class="tbl out"><caption>NOT IN against a nullable column: nobody</caption><tr><th>name</th></tr></table>
  The second query asks "who referred nobody" and returns 0 rows because <code>referred_by</code> contains NULLs: <code>x NOT IN (…, NULL)</code> is never TRUE. NOT EXISTS is NULL-safe.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Revenue per customer, including customers with zero. (LEFT JOIN + COALESCE)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name, count(o.order_id) AS orders, coalesce(sum(o.amount), 0) AS revenue
FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status &lt;&gt; 'cancelled'
GROUP BY c.customer_id, c.name ORDER BY revenue DESC, c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>orders</th><th>revenue</th></tr><tr><td>Asha</td><td>3</td><td>930.00</td></tr><tr><td>Chen</td><td>2</td><td>780.00</td></tr><tr><td>Ben</td><td>2</td><td>630.00</td></tr><tr><td>Farah</td><td>1</td><td>600.00</td></tr><tr><td>Dia</td><td>0</td><td>0</td></tr><tr><td>Esha</td><td>0</td><td>0</td></tr><tr><td>Gita</td><td>0</td><td>0</td></tr></table>
  The status test sits in ON, so Dia and Esha (only cancelled orders) and Gita (none) keep a row with 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Per customer: orders and items. Why does the obvious query overcount? (fan-out)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name, count(*) AS orders_wrong, sum(o.amount) AS spend_wrong
FROM customers c JOIN orders o USING (customer_id) JOIN order_items oi USING (order_id)
WHERE c.name = 'Asha' GROUP BY c.name;
SELECT c.name, count(DISTINCT o.order_id) AS orders, sum(oi.qty) AS items,
       (SELECT sum(amount) FROM orders WHERE customer_id = c.customer_id) AS spend
FROM customers c JOIN orders o USING (customer_id) JOIN order_items oi USING (order_id)
WHERE c.name = 'Asha' GROUP BY c.customer_id, c.name;</div>
  <table class="tbl out"><caption>Wrong: orders counted once per line</caption><tr><th>name</th><th>orders_wrong</th><th>spend_wrong</th></tr><tr><td>Asha</td><td>5</td><td>1620.00</td></tr></table>
  <table class="tbl out"><caption>Right: count distinct orders, sum line quantities</caption><tr><th>name</th><th>orders</th><th>items</th><th>spend</th></tr><tr><td>Asha</td><td>3</td><td>7</td><td>930.00</td></tr></table>
  Asha's orders 104 and 110 have two lines each, so the join repeats them: 5 rows, spend 1,620 instead of 930 (<a class="xref" data-note="sql_joins">JOINs</a> §08).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pairs of customers in the same city, each pair once. (self join)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT a.name AS customer_a, b.name AS customer_b, a.city
FROM customers a JOIN customers b ON b.city = a.city AND a.customer_id &lt; b.customer_id
ORDER BY a.city, a.name, b.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_a</th><th>customer_b</th><th>city</th></tr><tr><td>Ben</td><td>Dia</td><td>Mumbai</td></tr><tr><td>Ben</td><td>Farah</td><td>Mumbai</td></tr><tr><td>Dia</td><td>Farah</td><td>Mumbai</td></tr><tr><td>Asha</td><td>Chen</td><td>Pune</td></tr><tr><td>Asha</td><td>Gita</td><td>Pune</td></tr><tr><td>Chen</td><td>Gita</td><td>Pune</td></tr></table>
  <code>&lt;</code> (not <code>&lt;&gt;</code>) removes mirrored duplicates; Esha (NULL city) pairs with nobody.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Orders above their own restaurant's average amount. (correlated subquery)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT o.order_id, o.restaurant_id, o.amount,
       round((SELECT avg(amount) FROM orders o2 WHERE o2.restaurant_id = o.restaurant_id), 2) AS restaurant_avg
FROM orders o
WHERE o.amount &gt; (SELECT avg(amount) FROM orders o2 WHERE o2.restaurant_id = o.restaurant_id)
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>restaurant_id</th><th>amount</th><th>restaurant_avg</th></tr><tr><td>102</td><td>11</td><td>450.00</td><td>410.00</td></tr><tr><td>103</td><td>12</td><td>520.00</td><td>386.67</td></tr><tr><td>109</td><td>11</td><td>600.00</td><td>410.00</td></tr><tr><td>110</td><td>10</td><td>310.00</td><td>270.00</td></tr></table>
  The inner query is re-evaluated per outer row's restaurant. A window version: <code>avg(amount) OVER (PARTITION BY restaurant_id)</code> in a CTE, then filter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Customers who ordered both South Indian and Pizza. (GROUP BY + HAVING count DISTINCT)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name
FROM orders o JOIN customers c USING (customer_id) JOIN restaurants r USING (restaurant_id)
WHERE r.cuisine IN ('South Indian', 'Pizza')
GROUP BY c.customer_id, c.name HAVING count(DISTINCT r.cuisine) = 2 ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
  <code>WHERE cuisine = 'South Indian' AND cuisine = 'Pizza'</code> is the classic wrong answer: one row can't have two cuisines, so it returns nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show the referral chain from Asha downwards. (recursive CTE)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT customer_id, name, 0 AS depth, name::text AS path FROM customers WHERE name = 'Asha'
  UNION ALL
  SELECT c.customer_id, c.name, ch.depth + 1, ch.path || ' → ' || c.name
  FROM customers c JOIN chain ch ON c.referred_by = ch.customer_id)
SELECT depth, name, path FROM chain ORDER BY depth, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>depth</th><th>name</th><th>path</th></tr><tr><td>0</td><td>Asha</td><td>Asha</td></tr><tr><td>1</td><td>Ben</td><td>Asha → Ben</td></tr><tr><td>1</td><td>Chen</td><td>Asha → Chen</td></tr><tr><td>2</td><td>Farah</td><td>Asha → Ben → Farah</td></tr></table>
  The anchor row is Asha; each recursive step adds the people referred by the previous level (<a class="xref" data-note="sql_subqueries">Subqueries</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Each customer's latest order. (top-1 per group)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT DISTINCT ON (customer_id) customer_id, order_id, to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at, amount
FROM orders ORDER BY customer_id, ordered_at DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>ordered_at</th><th>amount</th></tr><tr><td>1</td><td>110</td><td>Mar 08 20:50</td><td>310.00</td></tr><tr><td>2</td><td>106</td><td>Mar 04 12:40</td><td>180.00</td></tr><tr><td>3</td><td>108</td><td>Mar 05 18:20</td><td>260.00</td></tr><tr><td>4</td><td>105</td><td>Mar 03 19:45</td><td>310.00</td></tr><tr><td>5</td><td>107</td><td>Mar 04 21:10</td><td>260.00</td></tr><tr><td>6</td><td>109</td><td>Mar 05 20:05</td><td>600.00</td></tr></table>
  Portable version: <code>row_number() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC) = 1</code> in an outer query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Running total of delivered revenue by day. (window SUM)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, sum(amount) AS revenue,
       sum(sum(amount)) OVER (ORDER BY ordered_at::date) AS running_total
FROM orders WHERE status = 'delivered' GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>revenue</th><th>running_total</th></tr><tr><td>2026-03-02</td><td>1210.00</td><td>1210.00</td></tr><tr><td>2026-03-03</td><td>380.00</td><td>1590.00</td></tr><tr><td>2026-03-04</td><td>180.00</td><td>1770.00</td></tr><tr><td>2026-03-05</td><td>860.00</td><td>2630.00</td></tr></table>
  <code>sum(sum(amount)) OVER (…)</code>: the inner SUM is the GROUP BY aggregate per day, the outer SUM is a window over those daily rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hours between each order and the same customer's previous order. (LAG)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT customer_id, order_id,
       round(extract(epoch FROM ordered_at - lag(ordered_at) OVER w) / 3600, 1) AS hours_since_prev
FROM orders WHERE customer_id IN (1, 2, 3)
WINDOW w AS (PARTITION BY customer_id ORDER BY ordered_at)
ORDER BY customer_id, ordered_at;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>hours_since_prev</th></tr><tr><td>1</td><td>101</td><td>NULL</td></tr><tr><td>1</td><td>104</td><td>25.1</td></tr><tr><td>1</td><td>110</td><td>127.6</td></tr><tr><td>2</td><td>102</td><td>NULL</td></tr><tr><td>2</td><td>106</td><td>47.6</td></tr><tr><td>3</td><td>103</td><td>NULL</td></tr><tr><td>3</td><td>108</td><td>69.8</td></tr></table>
  Each customer's first order has no previous one: NULL, not 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Median order amount. (ordered-set aggregate)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) AS median, round(avg(amount), 2) AS mean FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>median</th><th>mean</th></tr><tr><td>310</td><td>351.00</td></tr></table>
  Sorted: 180, 240, 260, 260, 310, 310, 380, 450, 520, 600; the middle two are 310 and 310. <code>percentile_disc</code> would return an actual value from the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What fraction of orders were cancelled? Why might the first attempt say 0?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT count(*) FILTER (WHERE status = 'cancelled') / count(*) AS fraction FROM orders;
SELECT round(100.0 * count(*) FILTER (WHERE status = 'cancelled') / count(*), 1) AS cancelled_pct FROM orders;</div>
  <table class="tbl out"><caption>Integer division</caption><tr><th>fraction</th></tr><tr><td>0</td></tr></table>
  <table class="tbl out"><caption>Fixed</caption><tr><th>cancelled_pct</th></tr><tr><td>20.0</td></tr></table>
  2 / 10 between integers is 0. Multiply by 100.0 (or cast) before dividing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>"Customers not in Pune": why is Esha missing? (three-valued logic)</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city &lt;&gt; 'Pune' ORDER BY name;
SELECT name FROM customers WHERE city IS DISTINCT FROM 'Pune' ORDER BY name;</div>
  <table class="tbl out"><caption>&lt;&gt; drops NULL</caption><tr><th>name</th></tr><tr><td>Ben</td></tr><tr><td>Dia</td></tr><tr><td>Farah</td></tr></table>
  <table class="tbl out"><caption>IS DISTINCT FROM keeps it</caption><tr><th>name</th></tr><tr><td>Ben</td></tr><tr><td>Dia</td></tr><tr><td>Esha</td></tr><tr><td>Farah</td></tr></table>
  <code>NULL &lt;&gt; 'Pune'</code> is UNKNOWN and WHERE keeps only TRUE. Decide with the interviewer whether an unknown city counts as "not Pune".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Orders "between 2 March and 8 March": why is order 110 missing?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT count(*) FROM orders WHERE ordered_at BETWEEN '2026-03-02' AND '2026-03-08';
SELECT count(*) FROM orders WHERE ordered_at &gt;= '2026-03-02' AND ordered_at &lt; '2026-03-09';</div>
  <table class="tbl out"><caption>BETWEEN on a timestamp</caption><tr><th>count</th></tr><tr><td>9</td></tr></table>
  <table class="tbl out"><caption>Half-open range</caption><tr><th>count</th></tr><tr><td>10</td></tr></table>
  '2026-03-08' means midnight at the start of 8 March; order 110 was at 20:50 that day. Use <code>&gt;= start AND &lt; end + 1 day</code>.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Fifteen problems, and the same few bugs kept appearing. Collected in one place, they become a checklist.</div>

  <h2 id="si-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most wrong answers above come from the same dozen bugs. Can you recognise them on sight?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: aggregate in WHERE</span><p><code>WHERE count(*) &gt; 1</code> is an error. Aggregate filters go in HAVING; plain-column filters in WHERE.</p></div>
  <div class="callout trap"><span class="label">Trap: window function in WHERE</span><p>Windows are computed at the SELECT stage, after WHERE. Rank in a CTE, filter outside.</p></div>
  <div class="callout trap"><span class="label">Trap: LIMIT/OFFSET or RANK for "Nth highest"</span><p>OFFSET counted the two ₹310 orders separately (said 310 for the 6th); RANK = 6 matched nothing. Use DENSE_RANK.</p></div>
  <div class="callout trap"><span class="label">Trap: ROW_NUMBER when ties matter</span><p>Dropped one of Biryani Bros' tied dishes. Use RANK.</p></div>
  <div class="callout trap"><span class="label">Trap: fan-out</span><p>Asha's spend 930 became 1,620 after joining lines. Aggregate each table at its grain first.</p></div>
  <div class="callout trap"><span class="label">Trap: right-table filter in WHERE after a LEFT JOIN, and count(*)</span><p>Empty spine days vanished. Put filters in ON and count a right-table column.</p></div>
  <div class="callout trap"><span class="label">Trap: COUNT(CASE … ELSE 0 END)</span><p>Counts every row. Use SUM, or COUNT without ELSE, or FILTER.</p></div>
  <div class="callout trap"><span class="label">Trap: LAG(k) for "same period last year"</span><p>Wrong month when a period is missing (June 2025). Self-join on the shifted key.</p></div>
  <div class="callout trap"><span class="label">Trap: partial or incomplete periods</span><p>March MTD vs full March (−92%); cohorts with unfinished windows.</p></div>
  <div class="callout trap"><span class="label">Trap: wrong grain in funnels</span><p>Counting events (17 carts) instead of sessions (12).</p></div>
  <div class="callout trap"><span class="label">Trap: NOT IN with NULL, &lt;&gt; with NULL</span><p>Zero rows; Esha dropped. Use NOT EXISTS / IS DISTINCT FROM.</p></div>
  <div class="callout trap"><span class="label">Trap: integer division and BETWEEN on timestamps</span><p>2/10 = 0; order 110 lost on its last day.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: conceptual rapid-fire.</b> Between coding problems, interviewers ask "explain the difference" questions. Short, exact answers with one example each.</div>

  <h2 id="si-rapid"><span class="num">12</span>Conceptual Rapid-Fire</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain the classic "X vs Y" pairs in two or three sentences, with an example from Biteful?</p>
  </div>
  <details class="qa"><summary><span class="qmark">Q</span>WHERE vs HAVING?</summary><div class="qa-body"><code>WHERE</code> filters rows before grouping and can't use aggregates; <code>HAVING</code> filters groups after aggregation. <code>WHERE status &lt;&gt; 'cancelled'</code> drops rows first; <code>HAVING count(*) &gt; 1</code> drops whole customers after counting. Non-aggregate filters belong in WHERE: fewer rows reach the grouping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>DELETE vs TRUNCATE vs DROP?</summary><div class="qa-body">
  <table class="tbl"><tr><th></th><th>Removes</th><th>WHERE?</th><th>Speed</th><th>Triggers</th></tr>
  <tr><td><code>DELETE</code></td><td>Chosen rows</td><td>Yes</td><td>Slow (row by row, logged)</td><td>Fire</td></tr>
  <tr><td><code>TRUNCATE</code></td><td>All rows, keeps table</td><td>No</td><td>Fast (drops data files)</td><td>Row triggers don't fire</td></tr>
  <tr><td><code>DROP</code></td><td>Table + structure</td><td>No</td><td>Fast</td><td>n/a</td></tr></table>
  In PostgreSQL all three can be rolled back inside a transaction (<a class="xref" data-note="sql_transactions">Transactions</a>); MySQL's documentation says TRUNCATE and DROP commit implicitly (not run here).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>UNION vs UNION ALL?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT (SELECT count(*) FROM (SELECT city FROM customers UNION     SELECT city FROM restaurants) t) AS union_rows,
       (SELECT count(*) FROM (SELECT city FROM customers UNION ALL SELECT city FROM restaurants) t) AS union_all_rows;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>union_rows</th><th>union_all_rows</th></tr><tr><td>3</td><td>12</td></tr></table>
  7 customer cities + 5 restaurant cities = 12 rows with UNION ALL. UNION removes duplicates: Pune, Mumbai and NULL (Esha) = 3; NULLs count as equal here. UNION needs a sort or hash, so default to UNION ALL unless you need de-duplication.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RANK vs DENSE_RANK vs ROW_NUMBER?</summary><div class="qa-body">On ties: ROW_NUMBER breaks them arbitrarily, RANK shares and leaves a gap, DENSE_RANK shares with no gap. On Biteful's amounts the two ₹310 orders get row numbers 5 and 6, ranks 5 and 5 (next is 7), dense ranks 5 and 5 (next is 6): section 02's table.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT count(*) AS all_rows, count(city) AS non_null, count(DISTINCT city) AS distinct_cities FROM customers;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>all_rows</th><th>non_null</th><th>distinct_cities</th></tr><tr><td>7</td><td>6</td><td>2</td></tr></table>
  COUNT(*) counts rows (7); COUNT(city) skips Esha's NULL (6); COUNT(DISTINCT city) also merges repeats (Pune, Mumbai = 2).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CHAR vs VARCHAR vs TEXT?</summary><div class="qa-body"><code>CHAR(n)</code> is fixed length, padded with spaces; <code>VARCHAR(n)</code> stores what you give up to n. In PostgreSQL, <code>text</code> and <code>varchar</code> perform the same and CHAR is never faster; use CHAR only for truly fixed codes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Clustered vs non-clustered index?</summary><div class="qa-body">A <strong>clustered</strong> index <em>is</em> the table: rows stored in key order, one per table (SQL Server; MySQL InnoDB's primary key). A <strong>non-clustered</strong> index is a separate sorted structure pointing to rows; you can have many. PostgreSQL tables are heaps, so every index is non-clustered (<a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> §02); <code>CLUSTER</code> reorders once and is not maintained.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key vs unique key?</summary><div class="qa-body">Both enforce uniqueness with an index. A primary key is one per table, implies NOT NULL and is what foreign keys point to. A table can have several unique keys, and they allow NULLs (in PostgreSQL, multiple NULLs by default, since NULL ≠ NULL).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order does SQL evaluate a query? Can you use a SELECT alias in WHERE?</summary><div class="qa-body"><div class="flow"><span>FROM / JOIN</span><span>WHERE</span><span>GROUP BY</span><span>HAVING</span><span>SELECT (windows here)</span><span>DISTINCT</span><span>ORDER BY</span><span>LIMIT</span></div>A SELECT alias doesn't exist yet in WHERE (error) but works in ORDER BY. Window functions run at the SELECT stage, which is why you filter them in an outer query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>IN vs EXISTS vs JOIN for "customers who ordered"?</summary><div class="qa-body">All three find Asha, Ben, Chen, Dia, Esha, Farah, and modern planners often produce the same semi-join plan. EXISTS stops at the first match and its negation is NULL-safe. A plain JOIN returns a customer once <em>per order</em> (Asha 3 times), so it needs DISTINCT: a classic duplicate bug.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> Eight patterns and a dozen short ones: which earlier tools does each one combine?</div>

  <h2 id="si-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Are the patterns separate tricks to memorise, or combinations of a few tools you already know?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 260" width="720">
<defs><marker id="si-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="15" width="120" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="40" text-anchor="middle">GROUP BY / FILTER</text>
<rect x="10" y="70" width="120" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="95" text-anchor="middle">LEFT JOIN / self join</text>
<rect x="10" y="125" width="120" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="150" text-anchor="middle">window rank / LAG</text>
<rect x="10" y="180" width="120" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="205" text-anchor="middle">generate_series</text>
<rect x="250" y="15" width="130" height="34" rx="8" class="fb sb"/><text x="315" y="37" text-anchor="middle">Nth highest</text>
<rect x="250" y="55" width="130" height="34" rx="8" class="fb sb"/><text x="315" y="77" text-anchor="middle">Top-N per group</text>
<rect x="250" y="95" width="130" height="34" rx="8" class="fb sb"/><text x="315" y="117" text-anchor="middle">Date spine</text>
<rect x="250" y="135" width="130" height="34" rx="8" class="fb sb"/><text x="315" y="157" text-anchor="middle">Pivot</text>
<rect x="250" y="175" width="130" height="34" rx="8" class="fb sb"/><text x="315" y="197" text-anchor="middle">YoY</text>
<rect x="470" y="35" width="130" height="34" rx="8" class="fg sg"/><text x="535" y="57" text-anchor="middle">Funnel</text>
<rect x="470" y="95" width="130" height="34" rx="8" class="fg sg"/><text x="535" y="117" text-anchor="middle">Retention cohorts</text>
<rect x="470" y="155" width="130" height="34" rx="8" class="fg sg"/><text x="535" y="177" text-anchor="middle">Streaks</text>
<g stroke="currentColor" stroke-opacity="0.5">
<line x1="130" y1="145" x2="248" y2="32" marker-end="url(#si-a9)"/><line x1="130" y1="145" x2="248" y2="72" marker-end="url(#si-a9)"/>
<line x1="130" y1="35" x2="248" y2="72" marker-end="url(#si-a9)"/><line x1="130" y1="200" x2="248" y2="112" marker-end="url(#si-a9)"/>
<line x1="130" y1="90" x2="248" y2="112" marker-end="url(#si-a9)"/><line x1="130" y1="35" x2="248" y2="152" marker-end="url(#si-a9)"/>
<line x1="130" y1="90" x2="248" y2="192" marker-end="url(#si-a9)"/>
<line x1="380" y1="152" x2="468" y2="52" marker-end="url(#si-a9)"/><line x1="380" y1="112" x2="468" y2="112" marker-end="url(#si-a9)"/>
<line x1="380" y1="72" x2="468" y2="172" marker-end="url(#si-a9)"/>
</g>
<text x="10" y="248" class="tm">Left: tools from earlier notes. Middle: patterns over whole tables or periods. Right: patterns that follow individual users over time.</text>
</g>
</svg><figcaption>Every pattern is a short pipeline of familiar tools; the user-journey patterns reuse the earlier patterns (FILTER pivots, spines, top-1 per group).</figcaption></figure>
  <table class="tbl"><caption>Every pattern on the same running example</caption>
    <tr><th>Pattern</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Signature trap</th></tr>
    <tr><td>Nth highest</td><td>DENSE_RANK + CTE</td><td>Nth distinct value?</td><td>6th highest = 260 (107, 108)</td><td>OFFSET says 310</td></tr>
    <tr><td>Top-N per group</td><td>aggregate + RANK PARTITION BY</td><td>best per group?</td><td>Biryani Bros tie: Chicken Biryani, Raita</td><td>ROW_NUMBER drops a tie</td></tr>
    <tr><td>Date spine</td><td>generate_series + LEFT JOIN</td><td>every period, even empty?</td><td>6 and 7 March: 0</td><td>GROUP BY shows 5 days</td></tr>
    <tr><td>Pivot</td><td>GROUP BY + FILTER</td><td>categories as columns?</td><td>Pizza Point 2 / 0 / 1</td><td>COUNT(… ELSE 0)</td></tr>
    <tr><td>YoY</td><td>self join on month − 1 year</td><td>vs same period last year?</td><td>Jan +30.0%, Feb +40.0%</td><td>LAG(12) with missing June; partial March</td></tr>
    <tr><td>Funnel</td><td>per-session min time per step</td><td>how far do sessions get?</td><td>26 → 16 → 12 → 10</td><td>counting events (17 carts)</td></tr>
    <tr><td>Retention</td><td>cohort = first day + EXISTS in window</td><td>do users come back?</td><td>6 of 7 within 3 days; 4 Mar cohort 50%</td><td>counting day 0; incomplete windows</td></tr>
    <tr><td>Streaks</td><td>day − row_number islands</td><td>longest consecutive run?</td><td>Farah 7, Asha 4</td><td>counting pairs (Asha 5)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence: <strong>every interview problem is "choose the grain, build it in steps, then rank, fill, spread or compare"; and every classic wrong answer is a grain error (fan-out, events vs sessions), a missing-row error (no spine, WHERE after LEFT JOIN), a tie error, or a NULL/boundary error.</strong> When stuck, write the grain of each CTE as a comment.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Every pattern on one page.</div>

  <h2 id="si-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>All patterns on one sheet. Running example: Biteful (orders 101–110: amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310; 105 and 107 cancelled, 110 pending; Gita and Momo Magic have none), <code>events</code> (26 app-open sessions, 1–8 March) and <code>monthly_revenue</code> (Jan 2025 – Mar 2026, no June 2025, March 2026 partial).</p>
  <h3>The pattern ladder</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Recipe in one line</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Approach</td><td>grain → tables → CTE steps → edges</td><td>revenue = non-cancelled amount</td><td>ties → Nth highest</td></tr>
    <tr><td>Nth highest</td><td>dense_rank() OVER (ORDER BY x DESC) = N</td><td>6th = 260</td><td>whole table only → per group</td></tr>
    <tr><td>Top-N per group</td><td>aggregate → rank() OVER (PARTITION BY g ORDER BY m DESC) ≤ N</td><td>Biryani tie kept</td><td>missing rows → spine</td></tr>
    <tr><td>Date spine</td><td>generate_series LEFT JOIN facts (filters in ON), count(fact.pk)</td><td>6, 7 Mar = 0</td><td>columns wanted → pivot</td></tr>
    <tr><td>Pivot</td><td>GROUP BY label, count(*) FILTER (WHERE …) per column</td><td>Momo Magic all 0</td><td>across years → YoY</td></tr>
    <tr><td>YoY</td><td>self join prev.month = cur.month − 1 year</td><td>+30.0%, +40.0%</td><td>per-user steps → funnel</td></tr>
    <tr><td>Funnel</td><td>per session min(t) FILTER per step; steps in time order</td><td>26 → 16 → 12 → 10</td><td>across days → retention</td></tr>
    <tr><td>Retention</td><td>cohort = min(day); EXISTS activity in [c+1, c+N]; complete windows only</td><td>4 Mar cohort 1/2</td><td>consecutive → streaks</td></tr>
    <tr><td>Streaks</td><td>day − row_number() = island; group; max length</td><td>Farah 7, Asha 4</td><td>—</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Formula</th></tr>
    <tr><td>Growth %</td><td>(current − previous) ÷ previous × 100, with 100.0 to avoid integer division</td></tr>
    <tr><td>Step conversion</td><td>sessions reaching step k+1 ÷ sessions reaching step k</td></tr>
    <tr><td>Retention %</td><td>users in cohort active in the window ÷ users in cohort</td></tr>
    <tr><td>Island id</td><td>date − row_number() within the entity, ordered by date</td></tr>
    <tr><td>Median</td><td>percentile_cont(0.5) WITHIN GROUP (ORDER BY x)</td></tr>
  </table>
  <h3>When to use what</h3>
  <div class="cards">
    <div><b>DENSE_RANK</b><p>Nth distinct value; ties share.</p><small>RANK for competition ranking; ROW_NUMBER for exactly one</small></div>
    <div><b>Spine + LEFT JOIN</b><p>Any report over periods or categories that must show zeros.</p><small>Filters in ON, count a right column</small></div>
    <div><b>FILTER / CASE</b><p>Pivots, funnels, conditional counts.</p><small>Never COUNT(… ELSE 0)</small></div>
    <div><b>Self join on shifted key</b><p>Period-over-period when periods can be missing.</p><small>LAG only on a complete series</small></div>
    <div><b>EXISTS</b><p>"Did they ever / within the window?"</p><small>Not JOIN (duplicates) or NOT IN (NULLs)</small></div>
    <div><b>Gaps and islands</b><p>Streaks, consecutive ids, merging ranges.</p><small>DISTINCT per day first</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>OFFSET or RANK for Nth highest; ROW_NUMBER dropping ties; window function in WHERE; GROUP BY without a spine; WHERE after LEFT JOIN; count(*) on padded rows; COUNT(CASE … ELSE 0); LAG(12) with a missing month; partial periods; events vs sessions vs users; counting day 0 as a return; incomplete cohort windows; fan-out; NOT IN with NULL; integer division; BETWEEN on timestamps.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Amounts 600, 520, 520, 400: 2nd highest with DENSE_RANK? with OFFSET 1?</td><td>520 both; 3rd: DENSE_RANK 400, OFFSET 2 gives 520</td></tr>
    <tr><td>Window function in WHERE: allowed?</td><td>No; compute in a CTE, filter outside</td></tr>
    <tr><td>Daily counts with zero days: which join and which count?</td><td>spine LEFT JOIN facts; count(fact.pk)</td></tr>
    <tr><td><code>count(CASE WHEN ok THEN 1 ELSE 0 END)</code> on 10 rows with 3 ok?</td><td>10</td></tr>
    <tr><td>Asha opened on 1, 2, 3, 4, 6, 7, 8 March: island ids?</td><td>28 Feb for 1–4 March, 1 March for 6–8 March</td></tr>
  </table>

  <h2 id="si-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain why each pattern is built the way it is, and what breaks if a step is skipped?</p>
  </div>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through how you would answer "top 3 restaurants by delivered revenue in each city" in an interview.</summary><div class="qa-body">Grain: one row per (city, restaurant) in the output, top 3 per city. Tables: restaurants (city) and orders (amount, status). Steps: CTE 1 sums delivered amount per restaurant (LEFT JOIN if zero-revenue restaurants should compete); CTE 2 ranks with <code>rank() OVER (PARTITION BY city ORDER BY revenue DESC)</code>; outer query keeps rank ≤ 3. Edges: ties (RANK may return more than 3; say so), NULL cities, cancelled orders excluded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does top-N per group need a CTE or subquery at all?</summary><div class="qa-body">Because of evaluation order: WHERE runs before the SELECT stage where window functions are computed, so <code>WHERE rank() OVER (…) = 1</code> is an error. The rank must be materialised as a column in an inner step, then filtered in an outer one (<a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a> + <a class="xref" data-note="sql_windows">Window Functions</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a date spine need a LEFT JOIN and not an INNER JOIN?</summary><div class="qa-body">The spine exists to keep days with no orders. An INNER JOIN keeps only days that match an order: exactly the 5 days GROUP BY already gave. LEFT JOIN keeps all 7, with NULL order columns that count(o.order_id) turns into 0 (<a class="xref" data-note="sql_joins">JOINs</a> §02 and §04).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what do the funnel's "17 carts" and JOINs' fan-out have in common?</summary><div class="qa-body">Both are grain errors: a value is counted at a finer grain (one event per item, one row per order line) than the question's grain (one session, one order). Fix both the same way: collapse to the question's grain first (min time per session; sum per order), then count.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip DISTINCT in the streak query?</summary><div class="qa-body">Two app opens on one day give two rows with the same date; row_number still advances, so date − row_number changes inside a real streak and splits one island into two. Gaps and islands assumes one row per (entity, day).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is LAG(12) fine for a complete monthly series but wrong on monthly_revenue?</summary><div class="qa-body">LAG moves by rows. With every month present, 12 rows = 12 months. With June 2025 missing, row positions after June shift by one, so February 2026 is compared with January 2025. A spine (section 04) or a self join on the date key makes the comparison about time, not position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: retention uses EXISTS. Why not a JOIN to the later visits?</summary><div class="qa-body">A JOIN returns one row per matching later visit (Farah has six), so counting returned users would overcount unless you add DISTINCT. EXISTS is a semi-join: one yes/no per user, which is exactly the question.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An interviewer asks for "7-day retention" but your data ends 3 days after the latest signups. What do you say?</summary><div class="qa-body">Those cohorts haven't had 7 days to return, so their retention is not yet known (it would be understated). Report only cohorts whose window has closed, or show the open ones separately as incomplete.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: back to <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>.</b> Every pattern here ran instantly on 10 orders. On a million orders the same queries need the right indexes (ordered_at for spines and YoY, customer_id for funnels and retention) and sargable date ranges.</div>
</main>`
});
