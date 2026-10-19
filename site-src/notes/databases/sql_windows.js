// notes/databases/sql_windows.js — Window Functions
Object.assign(TOPIC_CONTENT, {
  "sql_windows": `<main>
  <h1>Window Functions</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Window Functions</span></div>
  <p class="lead">A window function looks at a group of related rows and writes an answer onto <em>each</em> row, without collapsing them: each order next to its customer's total, a rank among all orders, the time since the customer's previous order, a running total by day. They are the most tested SQL topic in data interviews; most "hard" SQL questions are one window function plus a CTE. This note builds each piece as the answer to a question the previous piece could not answer, all on ONE running example: <strong>Biteful</strong>'s 10 food-delivery orders (from <a class="xref" data-note="sql_joins">JOINs</a> and <a class="xref" data-note="sql_subqueries">Subqueries</a>), plus, for the last section, Biteful's app event log. Every result was produced by running the query in <strong>PostgreSQL 16</strong>; where another engine differs (QUALIFY), it was run there and labelled.</p>

  <h2 id="sw-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="sw-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="65" y="41" text-anchor="middle" font-size="12">GROUP BY</text><text x="65" y="58" text-anchor="middle" class="tm" font-size="10">collapses rows</text>
<line x1="120" y1="45" x2="138" y2="45" stroke="currentColor" marker-end="url(#sw-a0)"/>
<rect x="140" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="195" y="41" text-anchor="middle" font-size="12">JOINs</text><text x="195" y="58" text-anchor="middle" class="tm" font-size="10">tables side by side</text>
<line x1="250" y1="45" x2="268" y2="45" stroke="currentColor" marker-end="url(#sw-a0)"/>
<rect x="270" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="325" y="41" text-anchor="middle" font-size="12">Subqueries</text><text x="325" y="58" text-anchor="middle" class="tm" font-size="10">CTEs</text>
<line x1="380" y1="45" x2="398" y2="45" stroke="currentColor" marker-end="url(#sw-a0)"/>
<rect x="400" y="20" width="120" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="460" y="41" text-anchor="middle" font-size="12" font-weight="700">Windows</text><text x="460" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="520" y1="45" x2="538" y2="45" stroke="currentColor" marker-end="url(#sw-a0)"/>
<rect x="540" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="595" y="41" text-anchor="middle" font-size="12">Practice Q&amp;A</text><text x="595" y="58" text-anchor="middle" class="tm" font-size="10">streaks, cohorts</text>
<line x1="460" y1="70" x2="460" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sw-a0)"/>
<rect x="370" y="110" width="180" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="460" y="130" text-anchor="middle" font-size="12">pandas / Spark</text><text x="460" y="147" text-anchor="middle" class="tm" font-size="10">groupby().transform, shift</text>
<text x="20" y="130" class="tm" font-size="10.5">windows keep every row AND attach a group value;</text><text x="20" y="146" class="tm" font-size="10.5">they replace many join-back and self-join tricks</text>
</svg><figcaption>The SQL group. Windows come after GROUP BY, JOINs and CTEs because they combine all three ideas: a group value, attached to each row, usually wrapped in a CTE.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: GROUP BY, joins and CTEs</b><span><a class="xref" data-note="sql_fundamentals">GROUP BY</a> gives one row per group. To show a group value next to each detail row you had to join the grouped result back (<a class="xref" data-note="sql_joins">JOINs</a>) or write a correlated subquery (<a class="xref" data-note="sql_subqueries">Subqueries</a>). Both are two passes and easy to get wrong.</span></li>
    <li><b>This note adds: detail + aggregate in one pass</b><span>OVER(), PARTITION BY and ORDER BY inside the window; ROW_NUMBER, RANK, DENSE_RANK on ties; NTILE and percentiles; LAG/LEAD; running totals, moving averages and shares; frames (ROWS vs RANGE); top-N per group; gaps and islands; sessionization.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_interview">SQL Practice Q&amp;A</a></b><span>Retention, streaks, funnels, "Nth highest", year-over-year growth: almost every practice question is a window plus a CTE. The same ideas reappear as <code>groupby().transform</code>, <code>shift</code> and <code>rolling</code> in <a class="xref" data-note="da_pandas">Pandas</a>, and <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> explains the sort a window needs.</span></li>
  </ol>

  <h2 id="sw-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each piece answers the question above it, and its weakness raises the next question. All numbers are from Biteful's 10 orders (total 3510).</p>
  <ol class="story">
    <li><b>The problem</b><span>Q: show each order next to its customer's total → GROUP BY gives 6 rows and loses the orders; adding <code>order_id</code> is an error. Joining the totals back works but takes two passes…</span></li>
    <li><b>OVER ()</b><span>Q: attach an aggregate to every row without collapsing → <code>SUM(amount) OVER ()</code> puts 3510 on all 10 rows; share of total = amount / 3510. But that is the company total; we wanted each <em>customer's</em>…</span></li>
    <li><b>PARTITION BY</b><span>Q: a group value per row → <code>OVER (PARTITION BY customer_id)</code>: Asha's three orders all show 930. But the window sees the whole group at once; "Asha's spend <em>so far</em>" needs order…</span></li>
    <li><b>ORDER BY in the window</b><span>Q: cumulative values within the group → adding ORDER BY turns the total into a running total: 240, 620, 930. Order also makes positions meaningful. Who is first? What about ties?</span></li>
    <li><b>ROW_NUMBER / RANK / DENSE_RANK</b><span>Q: number the rows; how do ties count? → two orders at 310 and two at 260: ROW_NUMBER 5, 6; RANK 5, 5 then 7; DENSE_RANK 5, 5 then 6. A rank says "5th of 10"; is that the top half?</span></li>
    <li><b>NTILE &amp; distribution</b><span>Q: which bucket or percentile is a row in? → NTILE(4) quartiles, PERCENT_RANK, CUME_DIST; ties can be split across buckets. Positions compare a row with all others; often we need just the <em>previous</em> row…</span></li>
    <li><b>LAG / LEAD</b><span>Q: compare a row with its neighbour → time since the customer's previous order: Asha 1 day 01:05, then 5 days 07:35. Neighbours are one row; trends need many rows accumulated…</span></li>
    <li><b>Running totals, moving averages, shares</b><span>Q: cumulative and smoothed values over time → daily order value 1210, 690, 440, 860, 310 → running 1210 … 3510, 2-day moving average. But which rows exactly does "so far" include?</span></li>
    <li><b>Frames: ROWS vs RANGE</b><span>Q: what does the window see for each row? → the default RANGE frame includes all same-day peers (all three Mar 2 orders show 1210); ROWS goes row by row (240, 690, 1210); "last 3 rows" ≠ "last 3 days" across the Mar 6–7 gap. Now: keep only the best rows…</span></li>
    <li><b>Top-N per group (filtering on windows)</b><span>Q: each restaurant's best order → WHERE can't see windows (error); compute in a CTE, filter outside; QUALIFY in DuckDB. Ranks and row numbers also detect runs of consecutive days…</span></li>
    <li><b>Gaps &amp; islands</b><span>Q: streaks of consecutive order days → day − ROW_NUMBER is constant inside a streak: Pizza Point Mar 2–4 (3 days). That works for days; app events have no "next day", only time gaps…</span></li>
    <li><b>Sessionization</b><span>Q: group app events into visits split by 30 minutes of silence → LAG flags each new session, a running SUM of the flags numbers them: Asha 3 sessions, Ben 2.</span></li>
  </ol>

  <h2 id="sw-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Window Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Anatomy</div>
        <ul>
          <li><b>f(…) OVER (PARTITION BY … ORDER BY … frame)</b></li>
          <li><b>OVER ()</b> — whole result: 3510 on every row</li>
          <li><b>PARTITION BY</b> — per group: Asha 930</li>
          <li><b>ORDER BY</b> — running: 240, 620, 930</li>
          <li><b>Runs after</b> WHERE / GROUP BY / HAVING, before ORDER BY</li>
          <li>💡 marksheet with "class average" printed in the corner</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ranking</div>
        <ul>
          <li><b>ROW_NUMBER</b> — 1, 2, 3 always (ties broken arbitrarily)</li>
          <li><b>RANK</b> — 5, 5, 7 (gap after a tie)</li>
          <li><b>DENSE_RANK</b> — 5, 5, 6 (no gap)</li>
          <li><b>NTILE / PERCENT_RANK / CUME_DIST</b> — buckets, percentiles</li>
          <li>⚠ add a unique tie-breaker</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Neighbours &amp; totals</div>
        <ul>
          <li><b>LAG / LEAD</b> — previous / next row (NULL at the edges)</li>
          <li><b>Running total</b> — SUM … ORDER BY</li>
          <li><b>Moving average</b> — ROWS BETWEEN n PRECEDING AND CURRENT ROW</li>
          <li><b>Share</b> — x / SUM(x) OVER (…), use 100.0</li>
          <li>⚠ forgot PARTITION BY → compares different customers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Frames</div>
        <ul>
          <li><b>Default with ORDER BY</b> — RANGE UNBOUNDED PRECEDING → CURRENT ROW + peers</li>
          <li><b>ROWS</b> — physical rows; <b>RANGE</b> — values (peers together)</li>
          <li>⚠ LAST_VALUE = current row unless frame to UNBOUNDED FOLLOWING</li>
          <li>⚠ ROWS 2 PRECEDING ≠ 2 days when days are missing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Filtering</div>
        <ul>
          <li>⚠ not allowed in WHERE (windows don't exist yet)</li>
          <li><b>CTE + WHERE rn = 1</b> — top-N, dedupe, latest per key</li>
          <li><b>QUALIFY</b> — DuckDB, Snowflake, BigQuery; not PostgreSQL</li>
          <li>⚠ WHERE runs first and changes what LAG sees</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Gaps &amp; islands</b> — date − ROW_NUMBER = streak id</li>
          <li>⚠ duplicate days break it → DISTINCT or DENSE_RANK</li>
          <li><b>Sessionization</b> — LAG gap → new-session flag → running SUM</li>
          <li><b>Recipe</b> — "flag starts, running-sum the flags"</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sw-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sw-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">GROUP BY Collapses Rows</span><span class="rm-sub">Detail + aggregate needed</span></div></div>
      <div class="rm-item rm-done" data-target="sw-over"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">OVER ()</span><span class="rm-sub">One window: everything</span></div></div>
      <div class="rm-item rm-done" data-target="sw-part"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">PARTITION BY</span><span class="rm-sub">A window per group</span></div></div>
      <div class="rm-item rm-done" data-target="sw-order"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">ORDER BY in the Window</span><span class="rm-sub">Running values; when windows run</span></div></div>
      <div class="rm-item rm-done" data-target="sw-rank"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Ranking &amp; Ties</span><span class="rm-sub">ROW_NUMBER, RANK, DENSE_RANK</span></div></div>
      <div class="rm-item rm-done" data-target="sw-dist"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">NTILE &amp; Distribution</span><span class="rm-sub">Buckets and percentiles</span></div></div>
      <div class="rm-item rm-done" data-target="sw-lag"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">LAG &amp; LEAD</span><span class="rm-sub">Compare with neighbours</span></div></div>
      <div class="rm-item rm-done" data-target="sw-run"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Running Totals &amp; Shares</span><span class="rm-sub">Cumulative, moving, % of total</span></div></div>
      <div class="rm-item rm-done" data-target="sw-frame"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Frames: ROWS vs RANGE</span><span class="rm-sub">Traced; LAST_VALUE trap</span></div></div>
      <div class="rm-item rm-done" data-target="sw-topn"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Top-N per Group</span><span class="rm-sub">Filtering on a window</span></div></div>
      <div class="rm-item rm-done" data-target="sw-gaps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Gaps &amp; Islands</span><span class="rm-sub">Streaks of consecutive days</span></div></div>
      <div class="rm-item rm-done" data-target="sw-sess"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Sessionization</span><span class="rm-sub">Flag, then running sum</span></div></div>
      <div class="rm-item rm-done" data-target="sw-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Three switches, many functions</span></div></div>
      <div class="rm-item rm-done" data-target="sw-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Ties, frames, partitions</span></div></div>
      <div class="rm-item rm-done" data-target="sw-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sw-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Write-the-query and connection drills</span></div></div>
    </div>
  </div>

  <h2 id="sw-why"><span class="num">01</span>GROUP BY Collapses Rows, but We Need Detail + Aggregate</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's customer team asks for every order, with the customer's total spend printed next to it, so they can see which single order made up most of a customer's spend. GROUP BY computes totals, but it returns one row per group. The orders themselves are gone.</p>
  </div>
  <h3>The running example: Biteful's 10 orders</h3>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, restaurant_id,
       to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at, status, amount
FROM orders
ORDER BY ordered_at;</div>
  <table class="tbl out"><caption>orders (10 rows, in time order; times Asia/Kolkata). Customers: 1 Asha, 2 Ben, 3 Chen, 4 Dia, 5 Esha, 6 Farah. Restaurants: 10 Dosa Hut, 11 Biryani Bros, 12 Pizza Point, 13 Green Bowl.</caption><tr><th>order_id</th><th>customer_id</th><th>restaurant_id</th><th>ordered_at</th><th>status</th><th>amount</th></tr><tr><td>101</td><td>1</td><td>10</td><td>Mar 02 12:10</td><td>delivered</td><td>240.00</td></tr><tr><td>102</td><td>2</td><td>11</td><td>Mar 02 13:05</td><td>delivered</td><td>450.00</td></tr><tr><td>103</td><td>3</td><td>12</td><td>Mar 02 20:30</td><td>delivered</td><td>520.00</td></tr><tr><td>104</td><td>1</td><td>12</td><td>Mar 03 13:15</td><td>delivered</td><td>380.00</td></tr><tr><td>105</td><td>4</td><td>13</td><td>Mar 03 19:45</td><td>cancelled</td><td>310.00</td></tr><tr><td>106</td><td>2</td><td>11</td><td>Mar 04 12:40</td><td>delivered</td><td>180.00</td></tr><tr><td>107</td><td>5</td><td>12</td><td>Mar 04 21:10</td><td>cancelled</td><td>260.00</td></tr><tr><td>108</td><td>3</td><td>10</td><td>Mar 05 18:20</td><td>delivered</td><td>260.00</td></tr><tr><td>109</td><td>6</td><td>11</td><td>Mar 05 20:05</td><td>delivered</td><td>600.00</td></tr><tr><td>110</td><td>1</td><td>10</td><td>Mar 08 20:50</td><td>pending</td><td>310.00</td></tr></table>
  <p>Notice the details the note will use: Asha (1) has three orders, Ben and Chen two; amounts 310 and 260 each appear twice (ties); three orders fall on Mar 2 (same-day "peers"); nothing happened on Mar 6 and 7 (a gap).</p>
  <p>GROUP BY computes the totals but squashes each customer into one row:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, SUM(amount) AS customer_total
FROM orders
GROUP BY customer_id
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>customer_total</th></tr><tr><td>1</td><td>930.00</td></tr><tr><td>2</td><td>630.00</td></tr><tr><td>3</td><td>780.00</td></tr><tr><td>4</td><td>310.00</td></tr><tr><td>5</td><td>260.00</td></tr><tr><td>6</td><td>600.00</td></tr></table>
  <p>Asking for the order id as well is not allowed, because after grouping there is no single "order_id" for Asha's group:</p>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, amount, SUM(amount)
FROM orders
GROUP BY customer_id;</div>
  <div class="fx" data-lang="text">ERROR:  column "orders.order_id" must appear in the GROUP BY clause or be used in an aggregate function
LINE 1: SELECT order_id, customer_id, amount, SUM(amount)
               ^</div>
  <p>The workaround from <a class="xref" data-note="sql_subqueries">Subqueries</a>: compute the totals in a derived table, then join them back to every order. It works, but it is two passes over the table and a join, just to put one number on each row:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.customer_id, o.amount, t.customer_total
FROM orders o
JOIN (SELECT customer_id, SUM(amount) AS customer_total
      FROM orders GROUP BY customer_id) t ON t.customer_id = o.customer_id
ORDER BY o.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer_id</th><th>amount</th><th>customer_total</th></tr><tr><td>101</td><td>1</td><td>240.00</td><td>930.00</td></tr><tr><td>104</td><td>1</td><td>380.00</td><td>930.00</td></tr><tr><td>110</td><td>1</td><td>310.00</td><td>930.00</td></tr><tr><td>102</td><td>2</td><td>450.00</td><td>630.00</td></tr><tr><td>106</td><td>2</td><td>180.00</td><td>630.00</td></tr><tr><td>103</td><td>3</td><td>520.00</td><td>780.00</td></tr><tr><td>108</td><td>3</td><td>260.00</td><td>780.00</td></tr><tr><td>105</td><td>4</td><td>310.00</td><td>310.00</td></tr><tr><td>107</td><td>5</td><td>260.00</td><td>260.00</td></tr><tr><td>109</td><td>6</td><td>600.00</td><td>600.00</td></tr></table>
  <p>That result is exactly what we want: 10 rows, each with its group value. A <strong>window function</strong> produces it directly, in one pass, with no join. The next three sections build it piece by piece.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="sw-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="145" y="16" text-anchor="middle" font-weight="bold" font-size="12">GROUP BY customer_id</text>
    <rect x="10" y="30" width="130" height="22" rx="3" class="fb"/><text x="17" y="45">101 · Asha · 240</text><rect x="10" y="56" width="130" height="22" rx="3" class="fb"/><text x="17" y="71">104 · Asha · 380</text><rect x="10" y="82" width="130" height="22" rx="3" class="fb"/><text x="17" y="97">110 · Asha · 310</text><rect x="10" y="114" width="130" height="22" rx="3" class="fv"/><text x="17" y="129">102 · Ben · 450</text><rect x="10" y="140" width="130" height="22" rx="3" class="fv"/><text x="17" y="155">106 · Ben · 180</text>
    <g stroke="currentColor" marker-end="url(#sw-ar1)" opacity="0.7"><line x1="140" y1="41" x2="183" y2="64"/><line x1="140" y1="67" x2="183" y2="67"/><line x1="140" y1="93" x2="183" y2="70"/><line x1="140" y1="125" x2="183" y2="138"/><line x1="140" y1="151" x2="183" y2="142"/></g>
    <rect x="185" y="54" width="110" height="26" rx="4" class="fb sb"/><text x="240" y="71" text-anchor="middle">Asha 930</text>
    <rect x="185" y="127" width="110" height="26" rx="4" class="fv"/><text x="240" y="144" text-anchor="middle">Ben 630</text>
    <text x="145" y="186" text-anchor="middle" class="tm">5 rows → 2 rows: orders lost</text>
    <line x1="305" y1="10" x2="305" y2="190" stroke="currentColor" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="450" y="16" text-anchor="middle" font-weight="bold" font-size="12">SUM() OVER (PARTITION BY customer_id)</text>
    <rect x="320" y="30" width="130" height="22" rx="3" class="fb"/><text x="327" y="45">101 · Asha · 240</text><rect x="458" y="30" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="45" text-anchor="middle">total 930</text><rect x="320" y="56" width="130" height="22" rx="3" class="fb"/><text x="327" y="71">104 · Asha · 380</text><rect x="458" y="56" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="71" text-anchor="middle">total 930</text><rect x="320" y="82" width="130" height="22" rx="3" class="fb"/><text x="327" y="97">110 · Asha · 310</text><rect x="458" y="82" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="97" text-anchor="middle">total 930</text><rect x="320" y="114" width="130" height="22" rx="3" class="fv"/><text x="327" y="129">102 · Ben · 450</text><rect x="458" y="114" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="129" text-anchor="middle">total 630</text><rect x="320" y="140" width="130" height="22" rx="3" class="fv"/><text x="327" y="155">106 · Ben · 180</text><rect x="458" y="140" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="155" text-anchor="middle">total 630</text>
    <text x="450" y="186" text-anchor="middle" class="tm">5 rows → 5 rows + group value</text>
    </g>
  </svg><figcaption>Same groups, same totals. GROUP BY collapses them; a window writes the group value onto every row (Asha and Ben shown).</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Board exam results. The school notice board shows one line per class: "10-A average 72" (that is GROUP BY). Each student's own marksheet shows their marks <em>and</em> "class average: 72" printed in the corner (that is a window function). Nobody's marksheet is merged with anyone else's.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>window function</strong> is a function followed by <code>OVER (…)</code>. For each row it computes a result over a set of rows related to that row (its <strong>window</strong>), and returns one value per row. Unlike GROUP BY, the number of rows does not change.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The join-back workaround silently loses rows if the join key has NULLs or the derived table filters differently from the outer query. A window computes over the same rows the query already has, so the two cannot drift apart.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: OVER ().</b> We know what we want: an aggregate attached to every row. What is the smallest piece of syntax that does it?</div>

  <h2 id="sw-over"><span class="num">02</span>OVER (): One Window, the Whole Result</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Before per-customer totals, the simplest case: each order next to the company total, to show its share. How do we attach an aggregate to every row without collapsing them?</p>
  </div>
  <p>Add <code>OVER ()</code> after an aggregate. Empty brackets mean "the window for every row is the whole result". The aggregate is computed once over all 10 rows and written onto each:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
       SUM(amount)   OVER () AS total,
       COUNT(*)      OVER () AS n,
       ROUND(100.0 * amount / SUM(amount) OVER (), 1) AS pct_of_total
FROM orders
ORDER BY order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th><th>total</th><th>n</th><th>pct_of_total</th></tr><tr><td>101</td><td>240.00</td><td>3510.00</td><td>10</td><td>6.8</td></tr><tr><td>102</td><td>450.00</td><td>3510.00</td><td>10</td><td>12.8</td></tr><tr><td>103</td><td>520.00</td><td>3510.00</td><td>10</td><td>14.8</td></tr><tr><td>104</td><td>380.00</td><td>3510.00</td><td>10</td><td>10.8</td></tr><tr><td>105</td><td>310.00</td><td>3510.00</td><td>10</td><td>8.8</td></tr><tr><td>106</td><td>180.00</td><td>3510.00</td><td>10</td><td>5.1</td></tr><tr><td>107</td><td>260.00</td><td>3510.00</td><td>10</td><td>7.4</td></tr><tr><td>108</td><td>260.00</td><td>3510.00</td><td>10</td><td>7.4</td></tr><tr><td>109</td><td>600.00</td><td>3510.00</td><td>10</td><td>17.1</td></tr><tr><td>110</td><td>310.00</td><td>3510.00</td><td>10</td><td>8.8</td></tr></table>
  <p>Every row sees the same window, so <code>total</code> is 3510 and <code>n</code> is 10 everywhere. The share is then a plain division per row: order 109 is 100 × 600 / 3510 = 17.1% of all order value. Without OVER, <code>SUM(amount)</code> next to <code>order_id</code> would be the GROUP BY error from section 01.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A Mumbai local train. <code>OVER ()</code> is the whole train: every passenger is told the same number, "1,800 people on board".</p>
  </div>
  <p>The <code>100.0</code> matters. With integers only, SQL does integer division and throws away the fraction:</p>
  <div class="fx" data-lang="sql">SELECT 600 / 3510 AS int_division, ROUND(100.0 * 600 / 3510, 1) AS pct;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>int_division</th><th>pct</th></tr><tr><td>0</td><td>17.1</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>agg(x) OVER ()</code>: the aggregate over all rows of the result (after WHERE and GROUP BY), returned on every row. Any aggregate works (SUM, COUNT, AVG, MIN, MAX).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>OVER () sees the rows <em>after</em> WHERE. Add <code>WHERE status = 'delivered'</code> and the "total" becomes 2630, the delivered total, not 3510. That is often what you want, but say so in the column name.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: PARTITION BY.</b> Every row got the same company total. The customer team wanted each order next to <em>its customer's</em> total: one window per customer.</div>

  <h2 id="sw-part"><span class="num">03</span>PARTITION BY: A Window per Group</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We need GROUP BY's idea of groups, without its collapse: Asha's orders should see only Asha's orders.</p>
  </div>
  <p><code>PARTITION BY customer_id</code> inside OVER splits the rows into independent groups. Each row's window is its own partition:</p>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, amount,
       SUM(amount) OVER (PARTITION BY customer_id)            AS customer_total,
       COUNT(*)    OVER (PARTITION BY customer_id)            AS customer_orders,
       ROUND(AVG(amount) OVER (PARTITION BY customer_id), 2)  AS customer_avg,
       ROUND(100.0 * amount / SUM(amount) OVER (PARTITION BY customer_id), 1) AS pct_of_customer
FROM orders
ORDER BY customer_id, order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer_id</th><th>amount</th><th>customer_total</th><th>customer_orders</th><th>customer_avg</th><th>pct_of_customer</th></tr><tr><td>101</td><td>1</td><td>240.00</td><td>930.00</td><td>3</td><td>310.00</td><td>25.8</td></tr><tr><td>104</td><td>1</td><td>380.00</td><td>930.00</td><td>3</td><td>310.00</td><td>40.9</td></tr><tr><td>110</td><td>1</td><td>310.00</td><td>930.00</td><td>3</td><td>310.00</td><td>33.3</td></tr><tr><td>102</td><td>2</td><td>450.00</td><td>630.00</td><td>2</td><td>315.00</td><td>71.4</td></tr><tr><td>106</td><td>2</td><td>180.00</td><td>630.00</td><td>2</td><td>315.00</td><td>28.6</td></tr><tr><td>103</td><td>3</td><td>520.00</td><td>780.00</td><td>2</td><td>390.00</td><td>66.7</td></tr><tr><td>108</td><td>3</td><td>260.00</td><td>780.00</td><td>2</td><td>390.00</td><td>33.3</td></tr><tr><td>105</td><td>4</td><td>310.00</td><td>310.00</td><td>1</td><td>310.00</td><td>100.0</td></tr><tr><td>107</td><td>5</td><td>260.00</td><td>260.00</td><td>1</td><td>260.00</td><td>100.0</td></tr><tr><td>109</td><td>6</td><td>600.00</td><td>600.00</td><td>1</td><td>600.00</td><td>100.0</td></tr></table>
  <table class="tbl"><caption>Trace: each row's window</caption>
    <tr><th>row</th><th>partition (customer)</th><th>rows in its window</th><th>SUM</th></tr>
    <tr><td>101, 104, 110</td><td>1 (Asha)</td><td>240, 380, 310</td><td>930</td></tr>
    <tr><td>102, 106</td><td>2 (Ben)</td><td>450, 180</td><td>630</td></tr>
    <tr><td>103, 108</td><td>3 (Chen)</td><td>520, 260</td><td>780</td></tr>
    <tr><td>105 / 107 / 109</td><td>4 / 5 / 6</td><td>just itself</td><td>310 / 260 / 600</td></tr>
  </table>
  <p>Same numbers as the join-back in section 01, in one pass. Ben's 450 is 71.4% of his spend: one big order. The same idea answers "orders above their restaurant's average" from <a class="xref" data-note="sql_subqueries">Subqueries</a> with <code>AVG(amount) OVER (PARTITION BY restaurant_id)</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Back on the local train, <code>PARTITION BY</code> splits it into coaches: each passenger is told the head count of <em>their</em> coach only.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Partition</strong>: the rows sharing the PARTITION BY values. A window never crosses a partition boundary. PARTITION BY can take several columns or expressions (<code>PARTITION BY restaurant_id, ordered_at::date</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting PARTITION BY gives a valid query with company-wide numbers (3510 instead of 930). Ask "per what?" for every window.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ORDER BY inside the window.</b> Every row in a partition sees the whole partition, so Asha's first order already "knows" about her third. "How much had Asha spent <em>by the time</em> of each order?" needs the window to respect time.</div>

  <h2 id="sw-order"><span class="num">04</span>ORDER BY in the Window</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Asha's spend so far" at order 104 should be 240 + 380, not 930. The partition must be put in order, and each row should see only the rows up to itself.</p>
  </div>
  <p>Adding ORDER BY inside OVER changes an aggregate from "whole partition" to "from the start of the partition up to me". Here all three switches side by side, on the same rows:</p>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, amount,
  SUM(amount) OVER ()                                              AS all_rows,
  SUM(amount) OVER (PARTITION BY customer_id)                      AS per_customer,
  SUM(amount) OVER (PARTITION BY customer_id ORDER BY ordered_at)  AS running
FROM orders
WHERE customer_id IN (1, 2)
ORDER BY customer_id, ordered_at;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer_id</th><th>amount</th><th>all_rows</th><th>per_customer</th><th>running</th></tr><tr><td>101</td><td>1</td><td>240.00</td><td>1560.00</td><td>930.00</td><td>240.00</td></tr><tr><td>104</td><td>1</td><td>380.00</td><td>1560.00</td><td>930.00</td><td>620.00</td></tr><tr><td>110</td><td>1</td><td>310.00</td><td>1560.00</td><td>930.00</td><td>930.00</td></tr><tr><td>102</td><td>2</td><td>450.00</td><td>1560.00</td><td>630.00</td><td>450.00</td></tr><tr><td>106</td><td>2</td><td>180.00</td><td>1560.00</td><td>630.00</td><td>630.00</td></tr></table>
  <table class="tbl"><caption>Trace: what each row's window contains (Asha and Ben only, after WHERE)</caption>
    <tr><th>row</th><th>OVER ()</th><th>PARTITION BY customer</th><th>… ORDER BY ordered_at</th></tr>
    <tr><td>101 Asha</td><td>all 5 → 1560</td><td>101, 104, 110 → 930</td><td>101 → 240</td></tr>
    <tr><td>104 Asha</td><td>all 5 → 1560</td><td>101, 104, 110 → 930</td><td>101, 104 → 620</td></tr>
    <tr><td>110 Asha</td><td>all 5 → 1560</td><td>101, 104, 110 → 930</td><td>101, 104, 110 → 930</td></tr>
    <tr><td>102 Ben</td><td>all 5 → 1560</td><td>102, 106 → 630</td><td>102 → 450</td></tr>
    <tr><td>106 Ben</td><td>all 5 → 1560</td><td>102, 106 → 630</td><td>102, 106 → 630</td></tr>
  </table>
  <p><code>all_rows</code> is 1560, not 3510: the WHERE kept only Asha's and Ben's 5 orders, and windows see what WHERE left. <code>running</code> restarts for Ben because of the partition. The last row of each partition always equals the partition total.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>On the train, ORDER BY lines up the passengers in each coach by seat number, so "the person before me" and "everyone up to me" start to mean something.</p>
  </div>
  <h3>When do windows run?</h3>
  <div class="flow"><span>FROM / JOIN</span><span>WHERE</span><span>GROUP BY / HAVING</span><span>Window functions</span><span>SELECT list</span><span>ORDER BY / LIMIT</span></div>
  <p>Windows are computed <strong>after</strong> WHERE and GROUP BY. Two consequences. First, WHERE cannot use them (section 10). Second, a window can work on grouped results, so an aggregate can sit inside a window function:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id,
       SUM(amount)                                          AS restaurant_total,
       SUM(SUM(amount)) OVER ()                             AS company_total,
       ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 1) AS pct
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant_id</th><th>restaurant_total</th><th>company_total</th><th>pct</th></tr><tr><td>10</td><td>810.00</td><td>3510.00</td><td>23.1</td></tr><tr><td>11</td><td>1230.00</td><td>3510.00</td><td>35.0</td></tr><tr><td>12</td><td>1160.00</td><td>3510.00</td><td>33.0</td></tr><tr><td>13</td><td>310.00</td><td>3510.00</td><td>8.8</td></tr></table>
  <p>GROUP BY first produces 4 rows (Dosa Hut 810, Biryani Bros 1230, Pizza Point 1160, Green Bowl 310). Then <code>SUM(SUM(amount)) OVER ()</code> adds the four group totals across all rows: 3510. The inner SUM is the GROUP BY aggregate; the outer SUM … OVER () is the window.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Window ORDER BY</strong>: the order inside each partition, independent of the query's final ORDER BY. With it, aggregates become cumulative and positional functions (ROW_NUMBER, LAG) become possible. <code>WINDOW w AS (…)</code> names a window spec so several functions can reuse it (used in section 09).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The ORDER BY inside OVER does not sort the output. Rows can come back in any order unless the query also ends with its own ORDER BY.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ranking.</b> Once a partition is ordered, positions mean something: first, second, tenth. But two orders of 310 and two of 260 tie. Which is 5th and which 6th?</div>

  <h2 id="sw-rank"><span class="num">05</span>ROW_NUMBER, RANK, DENSE_RANK: Ties</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Rank orders by amount" sounds simple until two orders have the same amount. Orders 105 and 110 are both 310; 107 and 108 are both 260. Should they share a place? Should the next order be 7th or 6th?</p>
  </div>
  <p>SQL gives three ranking functions, and they differ <em>only</em> in how they treat ties.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school sports day. Two runners tie for 5th. <strong>RANK</strong>: both get 5th, and the next runner is 7th (no 6th). <strong>DENSE_RANK</strong>: both get 5th, the next gets 6th. <strong>ROW_NUMBER</strong>: the teacher tosses a coin so everyone gets a different place.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
  ROW_NUMBER() OVER (ORDER BY amount DESC, order_id) AS row_num,
  RANK()       OVER (ORDER BY amount DESC)           AS rnk,
  DENSE_RANK() OVER (ORDER BY amount DESC)           AS dense
FROM orders
ORDER BY amount DESC, order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th><th>row_num</th><th>rnk</th><th>dense</th></tr><tr><td>109</td><td>600.00</td><td>1</td><td>1</td><td>1</td></tr><tr><td>103</td><td>520.00</td><td>2</td><td>2</td><td>2</td></tr><tr><td>102</td><td>450.00</td><td>3</td><td>3</td><td>3</td></tr><tr><td>104</td><td>380.00</td><td>4</td><td>4</td><td>4</td></tr><tr><td>105</td><td>310.00</td><td>5</td><td>5</td><td>5</td></tr><tr><td>110</td><td>310.00</td><td>6</td><td>5</td><td>5</td></tr><tr><td>107</td><td>260.00</td><td>7</td><td>7</td><td>6</td></tr><tr><td>108</td><td>260.00</td><td>8</td><td>7</td><td>6</td></tr><tr><td>101</td><td>240.00</td><td>9</td><td>9</td><td>7</td></tr><tr><td>106</td><td>180.00</td><td>10</td><td>10</td><td>8</td></tr></table>
  <table class="tbl"><caption>Trace: walking down the amount list</caption>
    <tr><th>row</th><th>amount</th><th>ROW_NUMBER</th><th>RANK</th><th>DENSE_RANK</th></tr>
    <tr><td>109, 103, 102, 104</td><td>600, 520, 450, 380</td><td>1–4</td><td>1–4</td><td>1–4 (all new values)</td></tr>
    <tr><td>105</td><td>310</td><td>5</td><td>5</td><td>5 (new value)</td></tr>
    <tr><td>110</td><td>310</td><td>6 (always +1)</td><td>5 (tie: same)</td><td>5 (tie: same)</td></tr>
    <tr><td>107</td><td>260</td><td>7</td><td>7 (= 6 rows ahead + 1)</td><td>6 (next value)</td></tr>
    <tr><td>108</td><td>260</td><td>8</td><td>7 (tie)</td><td>6 (tie)</td></tr>
    <tr><td>101, 106</td><td>240, 180</td><td>9, 10</td><td>9, 10</td><td>7, 8</td></tr>
  </table>
  <p>Rule of thumb: RANK = 1 + number of rows strictly ahead of me. DENSE_RANK = 1 + number of distinct values ahead of me. ROW_NUMBER = my position in the list. The <code>, order_id</code> in ROW_NUMBER's ORDER BY is a <strong>tie-breaker</strong>: without it, which of 105 and 110 gets 5 is arbitrary and can change between runs.</p>
  <p>Ranking works per partition too: each customer's orders, largest first.</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, amount,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC, order_id) AS rn
FROM orders
WHERE customer_id IN (1, 2, 3)
ORDER BY customer_id, rn;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>amount</th><th>rn</th></tr><tr><td>1</td><td>104</td><td>380.00</td><td>1</td></tr><tr><td>1</td><td>110</td><td>310.00</td><td>2</td></tr><tr><td>1</td><td>101</td><td>240.00</td><td>3</td></tr><tr><td>2</td><td>102</td><td>450.00</td><td>1</td></tr><tr><td>2</td><td>106</td><td>180.00</td><td>2</td></tr><tr><td>3</td><td>103</td><td>520.00</td><td>1</td></tr><tr><td>3</td><td>108</td><td>260.00</td><td>2</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ROW_NUMBER</strong>: unique 1, 2, 3… <strong>RANK</strong>: ties share a number, then numbers skip (5, 5, 7). <strong>DENSE_RANK</strong>: ties share, no skip (5, 5, 6). All three need ORDER BY inside OVER and ignore frames.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>ROW_NUMBER on tied values is <strong>non-deterministic</strong>: a "top 5" report may swap 105 and 110 by itself. Always add a unique tie-breaker. And for "the Nth highest <em>value</em>", use DENSE_RANK: with RANK, "rank = 6" does not exist here.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: NTILE and distribution.</b> A rank says "order 105 is 5th of 10". Marketing asks a different question: is it in the top quarter? What percentile is it? Positions need to become buckets and fractions.</div>

  <h2 id="sw-dist"><span class="num">06</span>NTILE &amp; Distribution</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Marketing wants to split orders into 4 equal groups by amount (quartiles) and study the top group; finance asks "what percentile is a ₹310 order?" These are questions about where a row sits in the whole spread.</p>
  </div>
  <ul>
    <li><code>NTILE(n)</code> splits the ordered rows into <em>n</em> buckets of (nearly) equal size and returns the bucket number.</li>
    <li><code>PERCENT_RANK()</code> = (rank − 1) / (rows − 1): 0 for the lowest, 1 for the highest.</li>
    <li><code>CUME_DIST()</code> = (rows with value ≤ mine) / rows: the share of rows at or below me.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher seating 40 students in 4 rows by marks: top 10 in row 1, next 10 in row 2. That is NTILE(4). "You scored better than 80% of the class" is a percentile, like CUME_DIST.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
  NTILE(4) OVER (ORDER BY amount DESC, order_id)          AS quartile,
  RANK()   OVER (ORDER BY amount)                         AS rnk_asc,
  ROUND(PERCENT_RANK() OVER (ORDER BY amount)::numeric, 2) AS pct_rank,
  ROUND(CUME_DIST()    OVER (ORDER BY amount)::numeric, 2) AS cume_dist
FROM orders
ORDER BY amount DESC, order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th><th>quartile</th><th>rnk_asc</th><th>pct_rank</th><th>cume_dist</th></tr><tr><td>109</td><td>600.00</td><td>1</td><td>10</td><td>1.00</td><td>1.00</td></tr><tr><td>103</td><td>520.00</td><td>1</td><td>9</td><td>0.89</td><td>0.90</td></tr><tr><td>102</td><td>450.00</td><td>1</td><td>8</td><td>0.78</td><td>0.80</td></tr><tr><td>104</td><td>380.00</td><td>2</td><td>7</td><td>0.67</td><td>0.70</td></tr><tr><td>105</td><td>310.00</td><td>2</td><td>5</td><td>0.44</td><td>0.60</td></tr><tr><td>110</td><td>310.00</td><td>2</td><td>5</td><td>0.44</td><td>0.60</td></tr><tr><td>107</td><td>260.00</td><td>3</td><td>3</td><td>0.22</td><td>0.40</td></tr><tr><td>108</td><td>260.00</td><td>3</td><td>3</td><td>0.22</td><td>0.40</td></tr><tr><td>101</td><td>240.00</td><td>4</td><td>2</td><td>0.11</td><td>0.20</td></tr><tr><td>106</td><td>180.00</td><td>4</td><td>1</td><td>0.00</td><td>0.10</td></tr></table>
  <table class="tbl"><caption>Trace: the formulas for order 105 (310), 10 rows</caption>
    <tr><th>measure</th><th>working</th><th>value</th></tr>
    <tr><td>RANK ascending</td><td>180, 240, 260, 260 are below it</td><td>5</td></tr>
    <tr><td>PERCENT_RANK</td><td>(5 − 1) / (10 − 1)</td><td>0.44</td></tr>
    <tr><td>CUME_DIST</td><td>rows ≤ 310: 180, 240, 260, 260, 310, 310 = 6 of 10</td><td>0.60</td></tr>
    <tr><td>NTILE(4), amount DESC</td><td>10 rows into 4 buckets → sizes 3, 3, 2, 2; 105 is 5th</td><td>bucket 2</td></tr>
  </table>
  <p>NTILE fills buckets by <em>count</em>, and earlier buckets get the extra rows. With 4 buckets both ties happen to stay together (105 and 110 in bucket 2, 107 and 108 in bucket 3), but only because of where the bucket edges fall. With 3 buckets (sizes 4, 3, 3) the 260 pair is split:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount, NTILE(3) OVER (ORDER BY amount DESC, order_id) AS bucket
FROM orders
ORDER BY amount DESC, order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th><th>bucket</th></tr><tr><td>109</td><td>600.00</td><td>1</td></tr><tr><td>103</td><td>520.00</td><td>1</td></tr><tr><td>102</td><td>450.00</td><td>1</td></tr><tr><td>104</td><td>380.00</td><td>1</td></tr><tr><td>105</td><td>310.00</td><td>2</td></tr><tr><td>110</td><td>310.00</td><td>2</td></tr><tr><td>107</td><td>260.00</td><td>2</td></tr><tr><td>108</td><td>260.00</td><td>3</td></tr><tr><td>101</td><td>240.00</td><td>3</td></tr><tr><td>106</td><td>180.00</td><td>3</td></tr></table>
  <p>For the median, use the ordered-set aggregate <code>PERCENTILE_CONT</code>. It is an aggregate (one row per group), not a window function in PostgreSQL:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median_amount,
  ROUND(AVG(amount), 2) AS avg_amount
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant_id</th><th>median_amount</th><th>avg_amount</th></tr><tr><td>10</td><td>260</td><td>270.00</td></tr><tr><td>11</td><td>450</td><td>410.00</td></tr><tr><td>12</td><td>380</td><td>386.67</td></tr><tr><td>13</td><td>310</td><td>310.00</td></tr></table>
  <p>Biryani Bros' median is 450 (the middle of 180, 450, 600) while its mean is 410. For a per-row percentile <em>as a window</em>, PostgreSQL has none built in; compute the aggregate per group in a CTE and join, or use CUME_DIST.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>NTILE(n)</strong>: bucket number 1…n of equal-count buckets. <strong>PERCENT_RANK</strong>: relative rank from 0 to 1. <strong>CUME_DIST</strong>: cumulative distribution, from 1/n to 1. <strong>PERCENTILE_CONT(p)</strong>: interpolated value at fraction p (an aggregate).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>NTILE splits by row count, so equal values can land in different buckets (107 in 2, 108 in 3 above). If ties must stay together, bucket on PERCENT_RANK or CUME_DIST thresholds instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: LAG and LEAD.</b> Ranks and percentiles compare a row with all rows. Many questions only need the row <em>next door</em>: "how long since this customer's previous order?"</div>

  <h2 id="sw-lag"><span class="num">07</span>LAG &amp; LEAD: Compare with Neighbours</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"How much time passes between a customer's orders?" needs each row to see the <em>previous</em> row of the same customer. Plain SQL works row by row and cannot look sideways; the old trick was a self-join on "the latest earlier order", which is slow and fiddly.</p>
  </div>
  <p><code>LAG(col)</code> returns the value of <code>col</code> from the previous row in the window. <code>LEAD(col)</code> returns it from the next row. The window's ORDER BY defines "previous" and "next"; PARTITION BY keeps the lookup inside one customer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Reading your electricity bill: this month's units minus last month's units. LAG is "last month's reading" printed on the same line as this month's. LEAD would be next month's reading.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id,
  to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at,
  LAG(order_id)  OVER (PARTITION BY customer_id ORDER BY ordered_at) AS prev_order,
  LEAD(order_id) OVER (PARTITION BY customer_id ORDER BY ordered_at) AS next_order,
  ordered_at - LAG(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at) AS since_prev
FROM orders
WHERE customer_id IN (1, 2, 3)
ORDER BY customer_id, ordered_at;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>ordered_at</th><th>prev_order</th><th>next_order</th><th>since_prev</th></tr><tr><td>1</td><td>101</td><td>Mar 02 12:10</td><td>NULL</td><td>104</td><td>NULL</td></tr><tr><td>1</td><td>104</td><td>Mar 03 13:15</td><td>101</td><td>110</td><td>1 day 01:05:00</td></tr><tr><td>1</td><td>110</td><td>Mar 08 20:50</td><td>104</td><td>NULL</td><td>5 days 07:35:00</td></tr><tr><td>2</td><td>102</td><td>Mar 02 13:05</td><td>NULL</td><td>106</td><td>NULL</td></tr><tr><td>2</td><td>106</td><td>Mar 04 12:40</td><td>102</td><td>NULL</td><td>1 day 23:35:00</td></tr><tr><td>3</td><td>103</td><td>Mar 02 20:30</td><td>NULL</td><td>108</td><td>NULL</td></tr><tr><td>3</td><td>108</td><td>Mar 05 18:20</td><td>103</td><td>NULL</td><td>2 days 21:50:00</td></tr></table>
  <table class="tbl"><caption>Trace: LAG inside each customer's partition</caption>
    <tr><th>partition</th><th>rows in time order</th><th>LAG(order_id)</th><th>gap</th></tr>
    <tr><td>Asha (1)</td><td>101 Mar 2 12:10, 104 Mar 3 13:15, 110 Mar 8 20:50</td><td>NULL, 101, 104</td><td>—, 1 day 1 h 5 min, 5 days 7 h 35 min</td></tr>
    <tr><td>Ben (2)</td><td>102 Mar 2 13:05, 106 Mar 4 12:40</td><td>NULL, 102</td><td>—, 1 day 23 h 35 min</td></tr>
    <tr><td>Chen (3)</td><td>103 Mar 2 20:30, 108 Mar 5 18:20</td><td>NULL, 103</td><td>—, 2 days 21 h 50 min</td></tr>
  </table>
  <p>Subtracting two timestamps in PostgreSQL gives an <code>interval</code> like <code>1 day 01:05:00</code>. The first row of each partition has no previous row, so LAG returns NULL, and anything minus NULL is NULL. LEAD mirrors it: the last row of each partition has no next row. "Days between orders" is the classic churn feature in ML; this one line computes it.</p>
  <p>Now forget the PARTITION BY:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id,
  to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at,
  LAG(order_id) OVER (ORDER BY ordered_at) AS prev_order
FROM orders
ORDER BY ordered_at
LIMIT 5;</div>
  <table class="tbl out"><caption>Without PARTITION BY: wrong (first 5 rows)</caption><tr><th>customer_id</th><th>order_id</th><th>ordered_at</th><th>prev_order</th></tr><tr><td>1</td><td>101</td><td>Mar 02 12:10</td><td>NULL</td></tr><tr><td>2</td><td>102</td><td>Mar 02 13:05</td><td>101</td></tr><tr><td>3</td><td>103</td><td>Mar 02 20:30</td><td>102</td></tr><tr><td>1</td><td>104</td><td>Mar 03 13:15</td><td>103</td></tr><tr><td>4</td><td>105</td><td>Mar 03 19:45</td><td>104</td></tr></table>
  <p>Ben's order 102 is now "after" Asha's 101, and Chen's 103 after Ben's 102: meaningless, they are different customers. The query runs without error.</p>
  <p>LAG takes two optional arguments: how many rows back, and a default for "no such row":</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
  LAG(amount, 1, 0) OVER (ORDER BY ordered_at) AS prev_amount,
  LAG(amount, 2)    OVER (ORDER BY ordered_at) AS two_back,
  LEAD(order_id)    OVER (ORDER BY ordered_at) AS next_order
FROM orders
ORDER BY ordered_at
LIMIT 4;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th><th>prev_amount</th><th>two_back</th><th>next_order</th></tr><tr><td>101</td><td>240.00</td><td>0</td><td>NULL</td><td>102</td></tr><tr><td>102</td><td>450.00</td><td>240.00</td><td>NULL</td><td>103</td></tr><tr><td>103</td><td>520.00</td><td>450.00</td><td>240.00</td><td>104</td></tr><tr><td>104</td><td>380.00</td><td>520.00</td><td>450.00</td><td>105</td></tr></table>
  <p><code>LAG(amount, 1, 0)</code> gives 0 instead of NULL on the first row. <code>LAG(amount, 2)</code> looks two rows back. <code>LEAD(order_id)</code> shows which order comes next in time (company-wide here, which is fine for "the next order placed on the platform").</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>LAG(expr, offset = 1, default = NULL)</code>: value of <code>expr</code> <em>offset</em> rows before the current row in the window order. <code>LEAD</code>: <em>offset</em> rows after. They ignore any frame clause.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>PARTITION BY</code> compares rows from different entities. Also decide what the first row's NULL means: keep it, drop it, or <code>COALESCE</code> it, but do not let it silently fall out of an average (AVG ignores NULLs).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: running totals and moving averages.</b> LAG compares with one neighbour. A finance dashboard wants many rows at once: "order value so far this month" and "the average of the last 2 days".</div>

  <h2 id="sw-run"><span class="num">08</span>Running Totals, Moving Averages &amp; Shares</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The finance dashboard needs, for each day: the value of orders placed that day (GMV), the cumulative value so far, the change from the previous day, and a smoothed 2-day average. One daily table, several different windows.</p>
  </div>
  <p>First the daily order value, all statuses (placed, not necessarily delivered):</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, SUM(amount) AS gmv
FROM orders GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>daily: 5 days, nothing on Mar 6 and 7</caption><tr><th>day</th><th>gmv</th></tr><tr><td>2026-03-02</td><td>1210.00</td></tr><tr><td>2026-03-03</td><td>690.00</td></tr><tr><td>2026-03-04</td><td>440.00</td></tr><tr><td>2026-03-05</td><td>860.00</td></tr><tr><td>2026-03-08</td><td>310.00</td></tr></table>
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT ordered_at::date AS day, SUM(amount) AS gmv
  FROM orders GROUP BY 1
)
SELECT day, gmv,
  SUM(gmv) OVER (ORDER BY day)                                   AS running_total,
  gmv - LAG(gmv) OVER (ORDER BY day)                             AS change,
  ROUND(AVG(gmv) OVER (ORDER BY day
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2)            AS moving_avg_2,
  ROUND(100.0 * SUM(gmv) OVER (ORDER BY day) / SUM(gmv) OVER (), 1) AS cum_pct
FROM daily
ORDER BY day;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>gmv</th><th>running_total</th><th>change</th><th>moving_avg_2</th><th>cum_pct</th></tr><tr><td>2026-03-02</td><td>1210.00</td><td>1210.00</td><td>NULL</td><td>1210.00</td><td>34.5</td></tr><tr><td>2026-03-03</td><td>690.00</td><td>1900.00</td><td>-520.00</td><td>950.00</td><td>54.1</td></tr><tr><td>2026-03-04</td><td>440.00</td><td>2340.00</td><td>-250.00</td><td>565.00</td><td>66.7</td></tr><tr><td>2026-03-05</td><td>860.00</td><td>3200.00</td><td>420.00</td><td>650.00</td><td>91.2</td></tr><tr><td>2026-03-08</td><td>310.00</td><td>3510.00</td><td>-550.00</td><td>585.00</td><td>100.0</td></tr></table>
  <p>Four windows, one query. <code>SUM(gmv) OVER (ORDER BY day)</code> is a <strong>running total</strong>: with ORDER BY, each row's window is "from the first row up to me". <code>gmv - LAG(gmv)</code> is the day-on-day change. <code>AVG(…) ROWS BETWEEN 1 PRECEDING AND CURRENT ROW</code> is a <strong>moving average</strong> over the previous row and the current row. <code>cum_pct</code> divides the running total by the grand total: by Mar 4, 66.7% of the week's value had been placed.</p>
  <table class="tbl"><caption>Trace: how the windows move down the rows</caption>
    <tr><th>current row</th><th>running window</th><th>sum</th><th>moving window (1 preceding)</th><th>avg</th></tr>
    <tr><td>Mar 2</td><td>1210</td><td>1210</td><td>1210</td><td>1210</td></tr>
    <tr><td>Mar 3</td><td>1210, 690</td><td>1900</td><td>1210, 690</td><td>950</td></tr>
    <tr><td>Mar 4</td><td>1210, 690, 440</td><td>2340</td><td>690, 440</td><td>565</td></tr>
    <tr><td>Mar 5</td><td>… + 860</td><td>3200</td><td>440, 860</td><td>650</td></tr>
    <tr><td>Mar 8</td><td>… + 310</td><td>3510</td><td>860, 310</td><td>585</td></tr>
  </table>
  <p>The running window grows by one row each step; the moving window slides, always holding two rows (one on the first row, where nothing precedes it). Note the Mar 8 moving average mixes Mar 5 and Mar 8, three days apart: section 09 explains why and how to fix it.</p>
  <figure class="viz"><svg viewBox="0 0 600 185" width="600">
    <g font-size="10">
    <text x="402" y="18" text-anchor="middle" class="tg">current row</text>
    <text x="10" y="52" class="tm">daily GMV</text>
    <rect x="100" y="28" width="86" height="40" rx="5" class="fs"/><text x="143" y="44" text-anchor="middle">Mar 2</text><text x="143" y="60" text-anchor="middle" font-weight="bold">1210</text>
    <rect x="192" y="28" width="86" height="40" rx="5" class="fs"/><text x="235" y="44" text-anchor="middle">Mar 3</text><text x="235" y="60" text-anchor="middle" font-weight="bold">690</text>
    <rect x="284" y="28" width="86" height="40" rx="5" class="fs"/><text x="327" y="44" text-anchor="middle">Mar 4</text><text x="327" y="60" text-anchor="middle" font-weight="bold">440</text>
    <rect x="376" y="28" width="86" height="40" rx="5" class="fg sg" stroke-width="2"/><text x="419" y="44" text-anchor="middle">Mar 5</text><text x="419" y="60" text-anchor="middle" font-weight="bold">860</text>
    <rect x="468" y="28" width="86" height="40" rx="5" class="fs"/><text x="511" y="44" text-anchor="middle">Mar 8</text><text x="511" y="60" text-anchor="middle" font-weight="bold">310</text>
    <text x="10" y="99">OVER ()</text>
    <rect x="100" y="86" width="454" height="20" rx="4" class="fb sb"/><text x="327" y="100" text-anchor="middle">whole result → SUM = 3510</text>
    <text x="10" y="129">ORDER BY day</text>
    <rect x="100" y="116" width="362" height="20" rx="4" class="ft st"/><text x="281" y="130" text-anchor="middle">start … current → SUM = 3200</text>
    <text x="10" y="159">1 PRECEDING</text>
    <rect x="284" y="146" width="178" height="20" rx="4" class="fv"/><text x="373" y="160" text-anchor="middle">prev + current → AVG = 650</text>
    </g>
  </svg><figcaption>For the Mar 5 row: the frame decides which rows the aggregate sees. Values match the query above.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket scoreboard. The total after each over is a running total. "Run rate in the last 2 overs" is a moving average: the window slides forward one over at a time.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Running (cumulative) total</strong>: SUM over all rows from the partition start to the current row. <strong>Moving average</strong>: AVG over a fixed-size frame that slides with the current row. <strong>Share</strong>: x / SUM(x) OVER (…), multiplied by 100.0.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>We ran the running total on a <em>daily</em> table, one row per day. On the raw orders table, several orders share a day, and the default frame then treats them as one step. That is the subject of the next section.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: frames.</b> "From the start up to me" sounds precise. But what is "me" when three orders share Mar 2? And is "1 preceding" the previous <em>row</em> or the previous <em>day</em>?</div>

  <h2 id="sw-frame"><span class="num">09</span>Frames: ROWS vs RANGE, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Run the running total on the 10 raw orders ordered by day, and the three Mar 2 orders all show 1210. Run a "last 3 days" sum with ROWS and Mar 8 adds up Mar 4 and Mar 5. Which rows does a window really see?</p>
  </div>
  <p>A <strong>frame</strong> is the part of the partition an aggregate actually sees for the current row: <code>{ROWS | RANGE} BETWEEN start AND end</code>, where start and end are <code>UNBOUNDED PRECEDING</code>, <code>n PRECEDING</code>, <code>CURRENT ROW</code>, <code>n FOLLOWING</code> or <code>UNBOUNDED FOLLOWING</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank queue with token numbers. <strong>ROWS</strong>: "you and the 2 people physically ahead of you". <strong>RANGE</strong>: "everyone whose token time is within 2 minutes of yours", so everyone who arrived in the same minute as you comes along, however many there are.</p>
  </div>
  <table class="tbl">
    <tr><th>Window has…</th><th>Default frame</th></tr>
    <tr><td>No ORDER BY</td><td>Whole partition</td></tr>
    <tr><td>ORDER BY</td><td><code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>: start up to me <em>and my peers</em></td></tr>
  </table>
  <p><strong>Peers</strong> are rows with the same ORDER BY value. Order the 10 orders by day (not time), so same-day orders are peers:</p>
  <div class="fx" data-lang="sql">SELECT order_id, ordered_at::date AS day, amount,
  SUM(amount) OVER (ORDER BY ordered_at::date)               AS range_default,
  SUM(amount) OVER (ORDER BY ordered_at::date, order_id
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)     AS rows_running
FROM orders
ORDER BY day, order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>day</th><th>amount</th><th>range_default</th><th>rows_running</th></tr><tr><td>101</td><td>2026-03-02</td><td>240.00</td><td>1210.00</td><td>240.00</td></tr><tr><td>102</td><td>2026-03-02</td><td>450.00</td><td>1210.00</td><td>690.00</td></tr><tr><td>103</td><td>2026-03-02</td><td>520.00</td><td>1210.00</td><td>1210.00</td></tr><tr><td>104</td><td>2026-03-03</td><td>380.00</td><td>1900.00</td><td>1590.00</td></tr><tr><td>105</td><td>2026-03-03</td><td>310.00</td><td>1900.00</td><td>1900.00</td></tr><tr><td>106</td><td>2026-03-04</td><td>180.00</td><td>2340.00</td><td>2080.00</td></tr><tr><td>107</td><td>2026-03-04</td><td>260.00</td><td>2340.00</td><td>2340.00</td></tr><tr><td>108</td><td>2026-03-05</td><td>260.00</td><td>3200.00</td><td>2600.00</td></tr><tr><td>109</td><td>2026-03-05</td><td>600.00</td><td>3200.00</td><td>3200.00</td></tr><tr><td>110</td><td>2026-03-08</td><td>310.00</td><td>3510.00</td><td>3510.00</td></tr></table>
  <table class="tbl"><caption>Trace: the frame for order 102 (Mar 2, the second row)</caption>
    <tr><th>column</th><th>frame</th><th>sum</th></tr>
    <tr><td>range_default</td><td>all rows with day ≤ Mar 2: 101, 102 <strong>and 103</strong> (peers)</td><td>1210</td></tr>
    <tr><td>rows_running</td><td>physical rows up to 102: 101, 102</td><td>690</td></tr>
  </table>
  <p>The default RANGE frame treats a whole day as one step, so all three Mar 2 rows show the day's end total, 1210, and Mar 3's two rows both show 1900. That is right for "total as of end of day" and wrong for a row-by-row running balance. A row-by-row total needs ROWS, and ROWS is only repeatable with a unique tie-breaker in ORDER BY (<code>, order_id</code>); without it the three Mar 2 rows may come in any order.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <g font-size="10">
    <text x="235" y="18" text-anchor="middle" class="tg">current row</text><text x="327" y="18" text-anchor="middle" class="tm">peer</text>
    <text x="10" y="52" class="tm">ORDER BY day</text>
    <rect x="100" y="28" width="86" height="40" rx="5" class="fv"/><text x="143" y="44" text-anchor="middle">101 Mar 2</text><text x="143" y="60" text-anchor="middle" font-weight="bold">240</text>
    <rect x="192" y="28" width="86" height="40" rx="5" class="fg sg"/><text x="235" y="44" text-anchor="middle">102 Mar 2</text><text x="235" y="60" text-anchor="middle" font-weight="bold">450</text>
    <rect x="284" y="28" width="86" height="40" rx="5" class="fv"/><text x="327" y="44" text-anchor="middle">103 Mar 2</text><text x="327" y="60" text-anchor="middle" font-weight="bold">520</text>
    <rect x="376" y="28" width="86" height="40" rx="5" class="fs"/><text x="419" y="44" text-anchor="middle">104 Mar 3</text><text x="419" y="60" text-anchor="middle" font-weight="bold">380</text>
    <rect x="468" y="28" width="86" height="40" rx="5" class="fs"/><text x="511" y="44" text-anchor="middle">…</text><text x="511" y="60" text-anchor="middle" font-weight="bold">…</text>
    <text x="10" y="99">ROWS</text>
    <rect x="100" y="86" width="178" height="20" rx="4" class="ft st"/><text x="189" y="100" text-anchor="middle">up to this row → 690</text>
    <text x="10" y="129">RANGE (default)</text>
    <rect x="100" y="116" width="270" height="20" rx="4" class="fr sr"/><text x="235" y="130" text-anchor="middle">up to this value, incl. 103 → 1210</text>
    </g>
  </svg><figcaption>RANGE treats all orders of the same day as one step because their ORDER BY values tie.</figcaption></figure>
  <h3>RANGE with an interval: "last 3 days", not "last 3 rows"</h3>
  <p>Back to the daily table, which has no rows for Mar 6 and 7. A "3-day" sum written both ways:</p>
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT ordered_at::date AS day, SUM(amount) AS gmv FROM orders GROUP BY 1
)
SELECT day, gmv,
  SUM(gmv) OVER (ORDER BY day
       ROWS  BETWEEN 2 PRECEDING AND CURRENT ROW)                AS last_3_rows,
  SUM(gmv) OVER (ORDER BY day
       RANGE BETWEEN INTERVAL '2 days' PRECEDING AND CURRENT ROW) AS last_3_days
FROM daily
ORDER BY day;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>gmv</th><th>last_3_rows</th><th>last_3_days</th></tr><tr><td>2026-03-02</td><td>1210.00</td><td>1210.00</td><td>1210.00</td></tr><tr><td>2026-03-03</td><td>690.00</td><td>1900.00</td><td>1900.00</td></tr><tr><td>2026-03-04</td><td>440.00</td><td>2340.00</td><td>2340.00</td></tr><tr><td>2026-03-05</td><td>860.00</td><td>1990.00</td><td>1990.00</td></tr><tr><td>2026-03-08</td><td>310.00</td><td>1610.00</td><td>310.00</td></tr></table>
  <p>On Mar 8, <code>ROWS 2 PRECEDING</code> takes the two previous <em>rows</em>, Mar 4 and Mar 5, and reports 1610 for a "3-day" window that really spans 5 days. <code>RANGE INTERVAL '2 days' PRECEDING</code> takes rows whose <em>date</em> is within 2 days (Mar 6 to Mar 8), which is only Mar 8 itself: 310. On Mar 5 both agree (Mar 3, 4, 5 are consecutive rows <em>and</em> days).</p>
  <h3>The LAST_VALUE trap</h3>
  <p>"Show each order with the biggest and smallest order of the same customer." FIRST_VALUE works, but LAST_VALUE seems broken:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, amount,
  FIRST_VALUE(order_id) OVER w AS biggest,
  LAST_VALUE(order_id)  OVER w AS smallest_wrong,
  LAST_VALUE(order_id)  OVER (w ROWS BETWEEN UNBOUNDED PRECEDING
                                 AND UNBOUNDED FOLLOWING) AS smallest
FROM orders
WHERE customer_id IN (1, 2)
WINDOW w AS (PARTITION BY customer_id ORDER BY amount DESC, order_id)
ORDER BY customer_id, amount DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>amount</th><th>biggest</th><th>smallest_wrong</th><th>smallest</th></tr><tr><td>1</td><td>104</td><td>380.00</td><td>104</td><td>104</td><td>101</td></tr><tr><td>1</td><td>110</td><td>310.00</td><td>104</td><td>110</td><td>101</td></tr><tr><td>1</td><td>101</td><td>240.00</td><td>104</td><td>101</td><td>101</td></tr><tr><td>2</td><td>102</td><td>450.00</td><td>102</td><td>102</td><td>106</td></tr><tr><td>2</td><td>106</td><td>180.00</td><td>102</td><td>106</td><td>106</td></tr></table>
  <p>The default frame ends at the current row, so the "last" row of order 110's frame is 110 itself: LAST_VALUE means "last so far". Extending the frame to <code>UNBOUNDED FOLLOWING</code> makes it see the whole partition, and 101 (Asha's smallest, 240) appears on every Asha row. <code>WINDOW w AS (…)</code> at the bottom names the shared window once; <code>OVER (w ROWS …)</code> reuses it and adds a frame.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ROWS</strong> frame: bounds counted in physical rows. <strong>RANGE</strong> frame: bounds measured in ORDER BY values; peers are always included together (and <code>INTERVAL</code> offsets need a date/number ORDER BY). PostgreSQL also supports <strong>GROUPS</strong>: bounds counted in peer groups.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Any time you use SUM/AVG/LAST_VALUE with ORDER BY and no explicit frame, you are using RANGE … CURRENT ROW. With ties or with LAST_VALUE, that is usually not what you meant. Write the frame explicitly.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: top-N per group.</b> We can compute any window value. Now the most common request: keep only some rows by a window value, like each restaurant's best order. The obvious WHERE does not work.</div>

  <h2 id="sw-topn"><span class="num">10</span>Top-N per Group: Filtering on a Window</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Each restaurant's biggest order" and "the second-biggest order per restaurant" are the classic interview questions. We know how to rank within a restaurant. How do we keep only rank 1?</p>
  </div>
  <div class="fx" data-lang="sql">SELECT order_id, restaurant_id, amount
FROM orders
WHERE ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY amount DESC) = 1;</div>
  <div class="fx" data-lang="text">ERROR:  window functions are not allowed in WHERE
LINE 3: WHERE ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY...
              ^</div>
  <p>Using an alias does not help either:</p>
  <div class="fx" data-lang="sql">SELECT order_id, restaurant_id, amount,
       ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY amount DESC) AS rn
FROM orders
WHERE rn = 1;</div>
  <div class="fx" data-lang="text">ERROR:  column "rn" does not exist
LINE 4: WHERE rn = 1;
              ^</div>
  <p>Recall the order of work from section 04: FROM → WHERE → GROUP BY → HAVING → <strong>windows</strong> → SELECT. When WHERE runs, window values do not exist yet, and SELECT aliases are created even later.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A college cannot shortlist "the top rank holder" at the admission-form stage, because ranks are only published after the exam. First publish ranks (compute the window), then shortlist (filter).</p>
  </div>
  <p><strong>Fix</strong>: compute the window in a CTE (or subquery), then filter in the outer query, where it is just an ordinary column.</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT order_id, restaurant_id, amount,
         ROW_NUMBER() OVER (PARTITION BY restaurant_id
                            ORDER BY amount DESC, order_id) AS rn
  FROM orders
)
SELECT restaurant_id, order_id, amount
FROM ranked
WHERE rn = 1
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>Each restaurant's biggest order</caption><tr><th>restaurant_id</th><th>order_id</th><th>amount</th></tr><tr><td>10</td><td>110</td><td>310.00</td></tr><tr><td>11</td><td>109</td><td>600.00</td></tr><tr><td>12</td><td>103</td><td>520.00</td></tr><tr><td>13</td><td>105</td><td>310.00</td></tr></table>
  <p>"Second-highest order <em>value</em> per restaurant" uses DENSE_RANK, so a tie at the top would not hide the second value:</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT order_id, restaurant_id, amount,
         DENSE_RANK() OVER (PARTITION BY restaurant_id ORDER BY amount DESC) AS rnk
  FROM orders
)
SELECT restaurant_id, order_id, amount
FROM ranked
WHERE rnk = 2
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant_id</th><th>order_id</th><th>amount</th></tr><tr><td>10</td><td>108</td><td>260.00</td></tr><tr><td>11</td><td>102</td><td>450.00</td></tr><tr><td>12</td><td>104</td><td>380.00</td></tr></table>
  <p>Green Bowl (13) has only one order, so it has no second value and no row. Momo Magic never appears at all, because it has no orders to rank; if every restaurant must be listed, LEFT JOIN this result to <code>restaurants</code>.</p>
  <p>The same "ROW_NUMBER … = 1" pattern dedupes data: "keep each customer's latest order" (common when a table holds several versions of a record):</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, to_char(ordered_at, 'Mon DD HH24:MI') AS latest
FROM (SELECT o.*,
             ROW_NUMBER() OVER (PARTITION BY customer_id
                                ORDER BY ordered_at DESC, order_id DESC) AS rn
      FROM orders o) t
WHERE rn = 1
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>latest</th></tr><tr><td>1</td><td>110</td><td>Mar 08 20:50</td></tr><tr><td>2</td><td>106</td><td>Mar 04 12:40</td></tr><tr><td>3</td><td>108</td><td>Mar 05 18:20</td></tr><tr><td>4</td><td>105</td><td>Mar 03 19:45</td></tr><tr><td>5</td><td>107</td><td>Mar 04 21:10</td></tr><tr><td>6</td><td>109</td><td>Mar 05 20:05</td></tr></table>
  <h3>QUALIFY (not in PostgreSQL)</h3>
  <p>Snowflake, BigQuery, Databricks and DuckDB add a <code>QUALIFY</code> clause, a WHERE that runs after windows. PostgreSQL 16 does not have it:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, order_id, amount
FROM orders
QUALIFY ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY amount DESC, order_id) = 1
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text">ERROR:  syntax error at or near "ROW_NUMBER"
LINE 3: QUALIFY ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER ...
                ^</div>
  <div class="fx" data-lang="sql">SELECT restaurant_id, order_id, amount
FROM orders
QUALIFY ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY amount DESC, order_id) = 1
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>The same query in DuckDB 1.5 (same rows as the CTE version)</caption><tr><th>restaurant_id</th><th>order_id</th><th>amount</th></tr><tr><td>10</td><td>110</td><td>310.00</td></tr><tr><td>11</td><td>109</td><td>600.00</td></tr><tr><td>12</td><td>103</td><td>520.00</td></tr><tr><td>13</td><td>105</td><td>310.00</td></tr></table>
  <h3>WHERE changes what the window sees</h3>
  <p>Because WHERE runs first, it removes rows before the window looks at them. "Previous order on the platform" over all orders vs over delivered ones only:</p>
  <div class="fx" data-lang="sql">SELECT order_id, status,
  LAG(order_id) OVER (ORDER BY ordered_at) AS prev_order
FROM orders
ORDER BY ordered_at;</div>
  <table class="tbl out"><caption>All orders</caption><tr><th>order_id</th><th>status</th><th>prev_order</th></tr><tr><td>101</td><td>delivered</td><td>NULL</td></tr><tr><td>102</td><td>delivered</td><td>101</td></tr><tr><td>103</td><td>delivered</td><td>102</td></tr><tr><td>104</td><td>delivered</td><td>103</td></tr><tr><td>105</td><td>cancelled</td><td>104</td></tr><tr><td>106</td><td>delivered</td><td>105</td></tr><tr><td>107</td><td>cancelled</td><td>106</td></tr><tr><td>108</td><td>delivered</td><td>107</td></tr><tr><td>109</td><td>delivered</td><td>108</td></tr><tr><td>110</td><td>pending</td><td>109</td></tr></table>
  <div class="fx" data-lang="sql">SELECT order_id, status,
  LAG(order_id) OVER (ORDER BY ordered_at) AS prev_order
FROM orders
WHERE status = 'delivered'
ORDER BY ordered_at;</div>
  <table class="tbl out"><caption>WHERE status = 'delivered' first</caption><tr><th>order_id</th><th>status</th><th>prev_order</th></tr><tr><td>101</td><td>delivered</td><td>NULL</td></tr><tr><td>102</td><td>delivered</td><td>101</td></tr><tr><td>103</td><td>delivered</td><td>102</td></tr><tr><td>104</td><td>delivered</td><td>103</td></tr><tr><td>106</td><td>delivered</td><td>104</td></tr><tr><td>108</td><td>delivered</td><td>106</td></tr><tr><td>109</td><td>delivered</td><td>108</td></tr></table>
  <p>For order 106, the previous order is 105 in the first result but 104 in the second, because 105 (cancelled) was removed before LAG ran. Neither is wrong; they answer different questions ("previous order" vs "previous delivered order"). If you need "previous order" but only want to <em>show</em> delivered rows, compute LAG in a CTE over all rows, then filter outside.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Top-N per group</strong>: rank within a partition (ROW_NUMBER for exactly N rows, DENSE_RANK for the Nth value, RANK for "competition" places) in a CTE, then <code>WHERE rank_col &lt;= N</code> outside. <strong>QUALIFY</strong>: a post-window filter clause in some engines.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choose the function by the question: "top 2 orders" (ROW_NUMBER, exactly 2 rows), "orders with the top 2 values" (DENSE_RANK, may be more rows), "orders that finished in the top 2 places" (RANK). Say which one and why in an interview; that is what is being graded.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: gaps and islands.</b> Row numbers have one more clever use. "Which restaurants had orders on several consecutive days?" asks for runs of consecutive dates, and no single row says "this continues yesterday's run".</div>

  <h2 id="sw-gaps"><span class="num">11</span>Gaps &amp; Islands: Streaks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Operations wants each restaurant's streaks of consecutive days with at least one order. Each row is a separate day; LAG can tell us whether yesterday had an order, but we need to group whole runs and measure their length.</p>
  </div>
  <p>The trick: subtract the row number from the date. Within a streak, both go up by 1 each day, so the difference stays the same. A missing day makes the date jump by 2 while the row number goes up by 1, so the difference changes. That constant difference is a label for the streak (an "island"); the missing days are the "gaps".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two friends climbing stairs side by side, one step per day. While neither skips a day, the gap between them stays fixed. The day one skips, the gap changes, and a new "island" starts.</p>
  </div>
  <div class="fx" data-lang="sql">WITH days AS (
  SELECT DISTINCT restaurant_id, ordered_at::date AS day FROM orders
)
SELECT restaurant_id, day,
  ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY day) AS rn,
  day - ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY day)::int AS grp
FROM days
ORDER BY restaurant_id, day;</div>
  <table class="tbl out"><caption>Step 1: the island label</caption><tr><th>restaurant_id</th><th>day</th><th>rn</th><th>grp</th></tr><tr><td>10</td><td>2026-03-02</td><td>1</td><td>2026-03-01</td></tr><tr><td>10</td><td>2026-03-05</td><td>2</td><td>2026-03-03</td></tr><tr><td>10</td><td>2026-03-08</td><td>3</td><td>2026-03-05</td></tr><tr><td>11</td><td>2026-03-02</td><td>1</td><td>2026-03-01</td></tr><tr><td>11</td><td>2026-03-04</td><td>2</td><td>2026-03-02</td></tr><tr><td>11</td><td>2026-03-05</td><td>3</td><td>2026-03-02</td></tr><tr><td>12</td><td>2026-03-02</td><td>1</td><td>2026-03-01</td></tr><tr><td>12</td><td>2026-03-03</td><td>2</td><td>2026-03-01</td></tr><tr><td>12</td><td>2026-03-04</td><td>3</td><td>2026-03-01</td></tr><tr><td>13</td><td>2026-03-03</td><td>1</td><td>2026-03-02</td></tr></table>
  <table class="tbl"><caption>Trace: Biryani Bros (11) and Pizza Point (12)</caption>
    <tr><th>restaurant</th><th>day</th><th>rn</th><th>day − rn</th><th>island</th></tr>
    <tr><td>11</td><td>Mar 2</td><td>1</td><td>Mar 1</td><td>A</td></tr>
    <tr><td>11</td><td>Mar 4</td><td>2</td><td>Mar 2</td><td>B (Mar 3 missing: label changed)</td></tr>
    <tr><td>11</td><td>Mar 5</td><td>3</td><td>Mar 2</td><td>B (consecutive: same label)</td></tr>
    <tr><td>12</td><td>Mar 2, 3, 4</td><td>1, 2, 3</td><td>Mar 1, Mar 1, Mar 1</td><td>one 3-day island</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <g font-size="10">
    <text x="10" y="40" class="tm">Biryani Bros</text>
    <text x="10" y="76" class="tm">ROW_NUMBER</text>
    <text x="10" y="104" class="tm">day − rn</text>
    <rect x="130" y="22" width="68" height="28" rx="4" class="fb"/><text x="164" y="40" text-anchor="middle">Mar 2</text><text x="164" y="76" text-anchor="middle">1</text><text x="164" y="104" text-anchor="middle" font-weight="bold" class="tb">Mar 1</text>
    <rect x="205" y="22" width="68" height="28" rx="4" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="239" y="40" text-anchor="middle" class="tm">Mar 3</text><text x="239" y="76" text-anchor="middle" class="tr">gap</text>
    <rect x="280" y="22" width="68" height="28" rx="4" class="fv"/><text x="314" y="40" text-anchor="middle">Mar 4</text><text x="314" y="76" text-anchor="middle">2</text><text x="314" y="104" text-anchor="middle" font-weight="bold" class="tg">Mar 2</text>
    <rect x="355" y="22" width="68" height="28" rx="4" class="fv"/><text x="389" y="40" text-anchor="middle">Mar 5</text><text x="389" y="76" text-anchor="middle">3</text><text x="389" y="104" text-anchor="middle" font-weight="bold" class="tg">Mar 2</text>
    <path d="M130,118 L130,124 L198,124 L198,118" fill="none" class="sb" stroke-width="2"/>
    <text x="164" y="142" text-anchor="middle" class="tb">island: 1 day</text>
    <path d="M280,118 L280,124 L423,124 L423,118" fill="none" class="sg" stroke-width="2"/>
    <text x="351" y="142" text-anchor="middle" class="tg">island: 2 days</text>
    </g>
  </svg><figcaption>Day and row number both rise by 1 per consecutive day, so their difference stays constant until a gap shifts it.</figcaption></figure>
  <p><code>grp</code> is not a meaningful date; it is just a label shared by all days of one streak. Step 2 groups by it:</p>
  <div class="fx" data-lang="sql">WITH days AS (
  SELECT DISTINCT restaurant_id, ordered_at::date AS day FROM orders
),
g AS (
  SELECT restaurant_id, day,
         day - ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY day)::int AS grp
  FROM days
)
SELECT restaurant_id, MIN(day) AS streak_start, MAX(day) AS streak_end, COUNT(*) AS days
FROM g
GROUP BY restaurant_id, grp
ORDER BY restaurant_id, streak_start;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant_id</th><th>streak_start</th><th>streak_end</th><th>days</th></tr><tr><td>10</td><td>2026-03-02</td><td>2026-03-02</td><td>1</td></tr><tr><td>10</td><td>2026-03-05</td><td>2026-03-05</td><td>1</td></tr><tr><td>10</td><td>2026-03-08</td><td>2026-03-08</td><td>1</td></tr><tr><td>11</td><td>2026-03-02</td><td>2026-03-02</td><td>1</td></tr><tr><td>11</td><td>2026-03-04</td><td>2026-03-05</td><td>2</td></tr><tr><td>12</td><td>2026-03-02</td><td>2026-03-04</td><td>3</td></tr><tr><td>13</td><td>2026-03-03</td><td>2026-03-03</td><td>1</td></tr></table>
  <p>Pizza Point's Mar 2–4 is the longest streak (3 days). Dosa Hut (Mar 2, 5, 8) never has two days in a row.</p>
  <h3>Why the DISTINCT matters</h3>
  <p>Company-wide, several orders share a day (three on Mar 2). Skip the DISTINCT and number the raw orders:</p>
  <div class="fx" data-lang="sql">WITH g AS (
  SELECT ordered_at::date AS day,
         ordered_at::date - ROW_NUMBER() OVER (ORDER BY ordered_at)::int AS grp
  FROM orders
)
SELECT MIN(day) AS streak_start, MAX(day) AS streak_end, COUNT(*) AS rows
FROM g GROUP BY grp ORDER BY streak_start;</div>
  <table class="tbl out"><caption>Without DISTINCT: nonsense streaks</caption><tr><th>streak_start</th><th>streak_end</th><th>rows</th></tr><tr><td>2026-03-02</td><td>2026-03-02</td><td>1</td></tr><tr><td>2026-03-02</td><td>2026-03-03</td><td>2</td></tr><tr><td>2026-03-02</td><td>2026-03-02</td><td>1</td></tr><tr><td>2026-03-03</td><td>2026-03-08</td><td>3</td></tr><tr><td>2026-03-04</td><td>2026-03-05</td><td>2</td></tr><tr><td>2026-03-05</td><td>2026-03-05</td><td>1</td></tr></table>
  <p>The row number rises with every order while the date does not, so the label shifts inside a single day and the "streaks" are garbage. Deduplicate first, or use <code>DENSE_RANK()</code> (which gives same-day rows the same number):</p>
  <div class="fx" data-lang="sql">WITH g AS (
  SELECT ordered_at::date AS day,
         ordered_at::date - DENSE_RANK() OVER (ORDER BY ordered_at::date)::int AS grp
  FROM orders
)
SELECT MIN(day) AS streak_start, MAX(day) AS streak_end,
       COUNT(DISTINCT day) AS days, COUNT(*) AS orders
FROM g GROUP BY grp ORDER BY streak_start;</div>
  <table class="tbl out"><caption>With DENSE_RANK: correct</caption><tr><th>streak_start</th><th>streak_end</th><th>days</th><th>orders</th></tr><tr><td>2026-03-02</td><td>2026-03-05</td><td>4</td><td>9</td></tr><tr><td>2026-03-08</td><td>2026-03-08</td><td>1</td><td>1</td></tr></table>
  <p>Biteful had orders every day from Mar 2 to Mar 5 (4 days, 9 orders), then a 2-day gap, then Mar 8.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gaps and islands</strong>: finding runs of consecutive values (islands) separated by missing values (gaps). Recipe: <code>value − ROW_NUMBER() OVER (PARTITION BY entity ORDER BY value)</code> is constant within an island; GROUP BY it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Duplicates of the ordering value break the trick (several orders per day). DISTINCT first, or DENSE_RANK. And always PARTITION BY the entity, or one restaurant's days continue another's streak.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sessionization.</b> Islands work when "consecutive" has a fixed step (one day). App events have timestamps with no natural step: a session is "events with less than 30 minutes of silence between them".</div>

  <h2 id="sw-sess"><span class="num">12</span>Sessionization</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The product team wants app visits: group each customer's app events into sessions, where 30 minutes of inactivity starts a new session. There is no session id in the data and no fixed step like "next day".</p>
  </div>
  <p>Biteful's app writes an event log. Here is a small slice for Asha and Ben around their first orders (the checkouts at 12:09 and 13:04 created orders 101 and 102):</p>

  <div class="fx" data-lang="sql">SELECT customer_id, to_char(event_at, 'Mon DD HH24:MI') AS event_at, event
FROM app_events ORDER BY customer_id, event_at;</div>
  <table class="tbl out"><caption>app_events (10 rows)</caption><tr><th>customer_id</th><th>event_at</th><th>event</th></tr><tr><td>1</td><td>Mar 02 11:52</td><td>open</td></tr><tr><td>1</td><td>Mar 02 11:58</td><td>menu</td></tr><tr><td>1</td><td>Mar 02 12:09</td><td>checkout</td></tr><tr><td>1</td><td>Mar 02 19:40</td><td>open</td></tr><tr><td>1</td><td>Mar 02 19:47</td><td>menu</td></tr><tr><td>1</td><td>Mar 03 13:02</td><td>open</td></tr><tr><td>1</td><td>Mar 03 13:14</td><td>checkout</td></tr><tr><td>2</td><td>Mar 02 12:48</td><td>open</td></tr><tr><td>2</td><td>Mar 02 13:04</td><td>checkout</td></tr><tr><td>2</td><td>Mar 02 13:50</td><td>open</td></tr></table>
  <p>Two steps. <strong>Step 1</strong>: use LAG to get the gap since the customer's previous event, and flag 1 when a new session starts (first event, or a gap over 30 minutes). <strong>Step 2</strong>: a running SUM of the flags numbers the sessions, because the sum goes up by 1 exactly at each session start.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A librarian counting visits from the door log. Every time someone walks in after more than half an hour away, she draws a tick. The number of ticks so far is that person's visit number.</p>
  </div>
  <div class="fx" data-lang="sql">WITH flagged AS (
  SELECT customer_id, event_at, event,
    event_at - LAG(event_at) OVER (PARTITION BY customer_id ORDER BY event_at) AS gap,
    CASE WHEN event_at - LAG(event_at) OVER (PARTITION BY customer_id ORDER BY event_at)
              &lt;= INTERVAL '30 minutes' THEN 0 ELSE 1 END AS new_session
  FROM app_events
)
SELECT customer_id, to_char(event_at, 'Mon DD HH24:MI') AS event_at, event, gap, new_session,
  SUM(new_session) OVER (PARTITION BY customer_id ORDER BY event_at) AS session_id
FROM flagged
ORDER BY customer_id, event_at;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>event_at</th><th>event</th><th>gap</th><th>new_session</th><th>session_id</th></tr><tr><td>1</td><td>Mar 02 11:52</td><td>open</td><td>NULL</td><td>1</td><td>1</td></tr><tr><td>1</td><td>Mar 02 11:58</td><td>menu</td><td>00:06:00</td><td>0</td><td>1</td></tr><tr><td>1</td><td>Mar 02 12:09</td><td>checkout</td><td>00:11:00</td><td>0</td><td>1</td></tr><tr><td>1</td><td>Mar 02 19:40</td><td>open</td><td>07:31:00</td><td>1</td><td>2</td></tr><tr><td>1</td><td>Mar 02 19:47</td><td>menu</td><td>00:07:00</td><td>0</td><td>2</td></tr><tr><td>1</td><td>Mar 03 13:02</td><td>open</td><td>17:15:00</td><td>1</td><td>3</td></tr><tr><td>1</td><td>Mar 03 13:14</td><td>checkout</td><td>00:12:00</td><td>0</td><td>3</td></tr><tr><td>2</td><td>Mar 02 12:48</td><td>open</td><td>NULL</td><td>1</td><td>1</td></tr><tr><td>2</td><td>Mar 02 13:04</td><td>checkout</td><td>00:16:00</td><td>0</td><td>1</td></tr><tr><td>2</td><td>Mar 02 13:50</td><td>open</td><td>00:46:00</td><td>1</td><td>2</td></tr></table>
  <table class="tbl"><caption>Trace: Asha's events</caption>
    <tr><th>event</th><th>gap</th><th>CASE</th><th>new_session</th><th>running SUM</th></tr>
    <tr><td>11:52 open</td><td>NULL (first)</td><td>NULL ≤ 30 min is UNKNOWN → ELSE</td><td>1</td><td>1</td></tr>
    <tr><td>11:58 menu</td><td>6 min</td><td>≤ 30 min</td><td>0</td><td>1</td></tr>
    <tr><td>12:09 checkout</td><td>11 min</td><td>≤ 30 min</td><td>0</td><td>1</td></tr>
    <tr><td>19:40 open</td><td>7 h 31 min</td><td>&gt; 30 min</td><td>1</td><td>2</td></tr>
    <tr><td>19:47 menu</td><td>7 min</td><td>≤ 30 min</td><td>0</td><td>2</td></tr>
    <tr><td>Mar 3 13:02 open</td><td>17 h 15 min</td><td>&gt; 30 min</td><td>1</td><td>3</td></tr>
    <tr><td>13:14 checkout</td><td>12 min</td><td>≤ 30 min</td><td>0</td><td>3</td></tr>
  </table>
  <p>The first event's NULL gap falls through to ELSE and correctly starts session 1: the CASE was written so that UNKNOWN means "new session". Ben's 13:50 open comes 46 minutes after his checkout, so it starts his session 2. Now aggregate per session:</p>
  <div class="fx" data-lang="sql">WITH flagged AS (
  SELECT customer_id, event_at, event,
    CASE WHEN event_at - LAG(event_at) OVER (PARTITION BY customer_id ORDER BY event_at)
              &lt;= INTERVAL '30 minutes' THEN 0 ELSE 1 END AS new_session
  FROM app_events
), numbered AS (
  SELECT customer_id, event_at, event,
         SUM(new_session) OVER (PARTITION BY customer_id ORDER BY event_at) AS session_id
  FROM flagged
)
SELECT customer_id, session_id,
       to_char(MIN(event_at), 'Mon DD HH24:MI') AS started,
       MAX(event_at) - MIN(event_at) AS duration,
       COUNT(*) AS events,
       BOOL_OR(event = 'checkout') AS converted
FROM numbered
GROUP BY customer_id, session_id
ORDER BY customer_id, session_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>session_id</th><th>started</th><th>duration</th><th>events</th><th>converted</th></tr><tr><td>1</td><td>1</td><td>Mar 02 11:52</td><td>00:17:00</td><td>3</td><td>t</td></tr><tr><td>1</td><td>2</td><td>Mar 02 19:40</td><td>00:07:00</td><td>2</td><td>f</td></tr><tr><td>1</td><td>3</td><td>Mar 03 13:02</td><td>00:12:00</td><td>2</td><td>t</td></tr><tr><td>2</td><td>1</td><td>Mar 02 12:48</td><td>00:16:00</td><td>2</td><td>t</td></tr><tr><td>2</td><td>2</td><td>Mar 02 13:50</td><td>00:00:00</td><td>1</td><td>f</td></tr></table>
  <p>Five sessions, three of which ended in a checkout: a session-level conversion rate of 3 / 5 = 60%. <code>BOOL_OR</code> is TRUE if any event in the group is a checkout.</p>
  <div class="callout intu"><span class="label">The general recipe</span>
    <p>"Flag where a new group starts (LAG), then running-SUM the flags to get a group id" solves sessions, streaks with a tolerance ("no more than 1 day off"), status changes and most "consecutive" problems. "ROW_NUMBER … = 1" solves latest / first / dedupe.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sessionization</strong>: assigning a session id to time-ordered events, where a session ends after a chosen inactivity threshold. Built from LAG (gap), CASE (flag) and a running SUM (id), all partitioned by user.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Both patterns need PARTITION BY the entity (user) and a deterministic ORDER BY. Without the partition, one user's last event and the next user's first event are compared. And a running SUM over ties in the timestamp uses the RANGE default (section 09): add a tie-breaker column if two events can share a timestamp.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have built twelve pieces. Seen together, they are one syntax with three switches and a handful of function families.</div>

  <h2 id="sw-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>OVER, PARTITION BY, ORDER BY, frames, ranking, NTILE, LAG, running totals, top-N, islands, sessions: twelve topics, or one idea?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="sw-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="140" height="50" rx="8" class="fb sb"/><text x="80" y="40" text-anchor="middle" font-weight="700">OVER ()</text><text x="80" y="57" text-anchor="middle" class="tm">all rows: 3510</text>
<line x1="150" y1="45" x2="183" y2="45" stroke="currentColor" marker-end="url(#sw-a9)"/>
<rect x="185" y="20" width="150" height="50" rx="8" class="fb sb"/><text x="260" y="40" text-anchor="middle" font-weight="700">+ PARTITION BY</text><text x="260" y="57" text-anchor="middle" class="tm">per group: Asha 930</text>
<line x1="335" y1="45" x2="368" y2="45" stroke="currentColor" marker-end="url(#sw-a9)"/>
<rect x="370" y="20" width="150" height="50" rx="8" class="fg sg"/><text x="445" y="40" text-anchor="middle" font-weight="700">+ ORDER BY</text><text x="445" y="57" text-anchor="middle" class="tm">running: 240, 620, 930</text>
<line x1="520" y1="45" x2="553" y2="45" stroke="currentColor" marker-end="url(#sw-a9)"/>
<rect x="555" y="20" width="155" height="50" rx="8" class="fr sr"/><text x="632" y="40" text-anchor="middle" font-weight="700">+ frame</text><text x="632" y="57" text-anchor="middle" class="tm">ROWS 690 vs RANGE 1210</text>
<line x1="445" y1="70" x2="445" y2="100" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sw-a9)"/>
<rect x="250" y="102" width="150" height="44" rx="8" class="fg sg"/><text x="325" y="120" text-anchor="middle">positions</text><text x="325" y="136" text-anchor="middle" class="tm">ROW_NUMBER, RANK, NTILE</text>
<rect x="420" y="102" width="150" height="44" rx="8" class="fg sg"/><text x="495" y="120" text-anchor="middle">neighbours</text><text x="495" y="136" text-anchor="middle" class="tm">LAG, LEAD</text>
<rect x="590" y="102" width="120" height="44" rx="8" class="fr sr"/><text x="650" y="120" text-anchor="middle">aggregates</text><text x="650" y="136" text-anchor="middle" class="tm">running, moving</text>
<line x1="325" y1="146" x2="325" y2="183" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sw-a9)"/>
<line x1="495" y1="146" x2="495" y2="183" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sw-a9)"/>
<rect x="190" y="185" width="200" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="290" y="204" text-anchor="middle">CTE + WHERE rn = 1</text><text x="290" y="221" text-anchor="middle" class="tm">top-N, dedupe; date − rn: islands</text>
<rect x="420" y="185" width="290" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="565" y="204" text-anchor="middle">LAG gap → flag → running SUM</text><text x="565" y="221" text-anchor="middle" class="tm">sessions: Asha 3, Ben 2</text>
<text x="10" y="265" class="tm">Top row: the three switches inside OVER (…), each added to fix the previous one's limit. Middle: the three function families. Bottom: patterns = a window inside a CTE.</text>
<text x="10" y="283" class="tm">Everything runs after WHERE / GROUP BY and before the final ORDER BY, which is why filtering on a window needs an outer query.</text>
</g>
</svg><figcaption>One syntax, three switches (partition, order, frame), three families of functions (positions, neighbours, aggregates), and two patterns built by wrapping windows in CTEs.</figcaption></figure>
  <table class="tbl"><caption>Every piece on the same Biteful orders</caption>
    <tr><th>Piece</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>OVER ()</td><td>aggregate + empty window</td><td>attach a total to every row</td><td>3510; 109 is 17.1%</td><td>share of grand total</td></tr>
    <tr><td>PARTITION BY</td><td>OVER + groups</td><td>group value per row</td><td>Asha 930 on 3 rows</td><td>vs-group comparisons, features</td></tr>
    <tr><td>Window ORDER BY</td><td>partition + order</td><td>cumulative / positional</td><td>240, 620, 930</td><td>running values, rankings</td></tr>
    <tr><td>ROW_NUMBER / RANK / DENSE_RANK</td><td>ordered window</td><td>position; how ties count</td><td>310s: 5, 6 / 5, 5 / 5, 5</td><td>top-N, Nth value, dedupe</td></tr>
    <tr><td>NTILE / PERCENT_RANK / CUME_DIST</td><td>ordered window</td><td>bucket, percentile</td><td>105: bucket 2, 0.44, 0.60</td><td>segmentation</td></tr>
    <tr><td>LAG / LEAD</td><td>ordered partition</td><td>compare with neighbour</td><td>Asha: 1 day 01:05, 5 days 07:35</td><td>gaps, changes, churn features</td></tr>
    <tr><td>Running / moving / share</td><td>aggregate + order + frame</td><td>cumulative and smoothed</td><td>1210 … 3510; MA2 950, 565</td><td>dashboards, trends</td></tr>
    <tr><td>Frames ROWS vs RANGE</td><td>explicit frame</td><td>exactly which rows?</td><td>102: 690 vs 1210; Mar 8: 1610 vs 310</td><td>whenever ORDER BY has ties or gaps</td></tr>
    <tr><td>Top-N per group</td><td>ranking + CTE filter</td><td>best rows per group</td><td>biggest: 110, 109, 103, 105</td><td>leaderboards, latest record</td></tr>
    <tr><td>Gaps &amp; islands</td><td>date − ROW_NUMBER</td><td>runs of consecutive days</td><td>Pizza Point Mar 2–4</td><td>streaks, outages</td></tr>
    <tr><td>Sessionization</td><td>LAG + CASE + running SUM</td><td>group by inactivity</td><td>5 sessions, 3 converted</td><td>web/app analytics</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a window function computes over "the rows related to this row" and writes the answer on this row</strong>; PARTITION BY says which rows are related, ORDER BY gives them a sequence, and the frame says how far along that sequence to look. Positions, neighbours and aggregates are just different questions asked of that window. The hard patterns (top-N, islands, sessions) are a window inside a CTE, because windows are computed after WHERE.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Knowing the system, which slips still produce numbers that look right on a sample and are wrong on real data?</div>

  <h2 id="sw-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Window queries rarely error. Which mistakes should you check for before shipping?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: missing PARTITION BY</span>
    <p>LAG compares Ben's order with Asha's; totals become company-wide. Ask "per what?" for every window.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ties without a tie-breaker</span>
    <p>ROW_NUMBER and ROWS frames give different answers from run to run when ORDER BY values tie (105 vs 110 at 310). Add a unique column (<code>, order_id</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the default RANGE frame</span>
    <p>With ORDER BY and no frame, peers are included together: all three Mar 2 orders show 1210. Write <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> for row-by-row totals.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: LAST_VALUE without a full frame</span>
    <p>It returns the current row. Use <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, or FIRST_VALUE with the order reversed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ROWS n PRECEDING on data with gaps</span>
    <p>Rows are not days: Mar 8's "last 3 rows" reached back to Mar 4. Fill the calendar first, or use <code>RANGE BETWEEN INTERVAL 'n days' PRECEDING AND CURRENT ROW</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: filtering a window in WHERE</span>
    <p>Not allowed. Wrap in a CTE and filter outside (or QUALIFY where supported, not in PostgreSQL).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: RANK vs DENSE_RANK for "Nth highest"</span>
    <p>After a tie, RANK skips numbers, so "rank = 6" may not exist. For the Nth highest <em>value</em>, use DENSE_RANK.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: duplicates in gaps &amp; islands</span>
    <p>Several orders per day break <code>date − ROW_NUMBER</code>. DISTINCT first, or DENSE_RANK.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: integer division in percentages</span>
    <p><code>600 / 3510</code> is 0. Write <code>100.0 *</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="sw-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <strong>Biteful</strong>'s 10 orders. In time order: 101 Asha 240, 102 Ben 450, 103 Chen 520 (Mar 2); 104 Asha 380, 105 Dia 310 (Mar 3); 106 Ben 180, 107 Esha 260 (Mar 4); 108 Chen 260, 109 Farah 600 (Mar 5); 110 Asha 310 (Mar 8). Total 3510. Ties: 310 (105, 110), 260 (107, 108). Daily GMV 1210, 690, 440, 860, 310 (no rows Mar 6–7). App events: Asha 7, Ben 3.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Piece</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>GROUP BY problem</td><td>detail + aggregate?</td><td>6 rows, orders lost; join-back works</td><td>two passes → OVER</td></tr>
    <tr><td>OVER ()</td><td>total on every row</td><td>3510; share 17.1%</td><td>company-wide only → PARTITION BY</td></tr>
    <tr><td>PARTITION BY</td><td>group value per row</td><td>Asha 930 ×3</td><td>no "so far" → ORDER BY</td></tr>
    <tr><td>ORDER BY in window</td><td>cumulative / positions</td><td>240, 620, 930</td><td>ties → ranking functions</td></tr>
    <tr><td>Ranking</td><td>position with ties</td><td>RN 5, 6; RANK 5, 5, 7; DENSE 5, 5, 6</td><td>bucket/percentile? → NTILE</td></tr>
    <tr><td>NTILE, PERCENT_RANK, CUME_DIST</td><td>bucket, percentile</td><td>105: Q2, 0.44, 0.60</td><td>neighbour only → LAG</td></tr>
    <tr><td>LAG / LEAD</td><td>previous / next row</td><td>Asha gaps 1 day 01:05, 5 days 07:35</td><td>many rows → running totals</td></tr>
    <tr><td>Running / moving / share</td><td>cumulative, smoothed</td><td>1210, 1900, 2340, 3200, 3510</td><td>which rows exactly? → frames</td></tr>
    <tr><td>Frames</td><td>ROWS vs RANGE</td><td>102: 690 vs 1210; Mar 8: 1610 vs 310</td><td>filter by window → top-N</td></tr>
    <tr><td>Top-N per group</td><td>best rows per group</td><td>110, 109, 103, 105; WHERE errors</td><td>consecutive runs → islands</td></tr>
    <tr><td>Gaps &amp; islands</td><td>streaks</td><td>Pizza Point Mar 2–4; company Mar 2–5</td><td>no fixed step → sessions</td></tr>
    <tr><td>Sessionization</td><td>group by inactivity</td><td>Asha 3, Ben 2 sessions; 3 converted</td><td>→ <a class="xref" data-note="sql_interview">Practice Q&amp;A</a></td></tr>
  </table>
  <h3>Syntax and formulas</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Form</th><th>Meaning</th></tr>
    <tr><td>Window</td><td><code>f(x) OVER (PARTITION BY p ORDER BY o frame)</code></td><td>all parts optional</td></tr>
    <tr><td>Default frame</td><td>no ORDER BY: whole partition; with ORDER BY: <code>RANGE UNBOUNDED PRECEDING → CURRENT ROW</code></td><td>RANGE includes peers (equal o)</td></tr>
    <tr><td>RANK</td><td>1 + rows strictly ahead</td><td>gaps after ties</td></tr>
    <tr><td>DENSE_RANK</td><td>1 + distinct values ahead</td><td>no gaps</td></tr>
    <tr><td>PERCENT_RANK</td><td>(rank − 1) / (n − 1)</td><td>0 … 1</td></tr>
    <tr><td>CUME_DIST</td><td>(rows with value ≤ mine) / n</td><td>1/n … 1</td></tr>
    <tr><td>NTILE(k)</td><td>k buckets of size ⌊n/k⌋ or ⌈n/k⌉, bigger first</td><td>10 into 4 → 3, 3, 2, 2</td></tr>
    <tr><td>LAG / LEAD</td><td><code>LAG(x, offset = 1, default = NULL)</code></td><td>ignore frames</td></tr>
    <tr><td>Moving average</td><td><code>AVG(x) OVER (ORDER BY o ROWS BETWEEN k PRECEDING AND CURRENT ROW)</code></td><td>k + 1 rows</td></tr>
    <tr><td>Island label</td><td><code>day − ROW_NUMBER() OVER (PARTITION BY e ORDER BY day)</code></td><td>constant within a streak</td></tr>
    <tr><td>Session id</td><td><code>SUM(new_flag) OVER (PARTITION BY u ORDER BY t)</code></td><td>flag = gap &gt; threshold or first</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Window aggregate</b><p>Use to put a group or grand total next to each row (share, vs-average features).</p><small>GROUP BY if you really want one row per group</small></div>
    <div><b>ROW_NUMBER</b><p>Use for exactly N rows per group, dedupe, latest record; add a tie-breaker.</p><small>Not for "Nth value" with ties</small></div>
    <div><b>DENSE_RANK / RANK</b><p>DENSE_RANK for Nth highest value; RANK for competition places.</p><small>RANK skips numbers after ties</small></div>
    <div><b>LAG / LEAD</b><p>Use for gaps, changes, previous status; always PARTITION BY the entity.</p><small>Decide what the first row's NULL means</small></div>
    <div><b>Explicit frames</b><p>Use ROWS for row-by-row totals and moving averages; RANGE INTERVAL for calendar windows.</p><small>Never rely on the default with ties</small></div>
    <div><b>CTE + filter</b><p>Use for top-N, islands and sessions: compute the window, then filter or group outside.</p><small>WHERE can't see windows</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Missing PARTITION BY; no tie-breaker; default RANGE frame lumps peers (Mar 2 → 1210 ×3); LAST_VALUE returns the current row; ROWS n PRECEDING ≠ n days; window in WHERE → error; RANK vs DENSE_RANK for Nth highest; duplicate days break islands; integer division; WHERE changes what LAG sees.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Values 90, 80, 80, 70 (DESC): RANK and DENSE_RANK of 70?</td><td>RANK 4, DENSE_RANK 3</td></tr>
    <tr><td>Rows for Mar 2: 240, 450, 520. Default <code>SUM … OVER (ORDER BY day)</code> on the 450 row?</td><td>1210 (RANGE includes same-day peers)</td></tr>
    <tr><td>Why can't <code>WHERE ROW_NUMBER() OVER (…) = 1</code> work?</td><td>Windows run after WHERE; compute in a CTE, filter outside</td></tr>
    <tr><td>Days Jun 1, 2, 3, 5: island labels with day − rn?</td><td>May 31, May 31, May 31, Jun 1 → two islands (3 days, 1 day)</td></tr>
    <tr><td>Events at 09:00, 09:20, 10:00 with a 30-minute rule: session ids?</td><td>1, 1, 2</td></tr>
  </table>

  <h2 id="sw-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you write each pattern, and explain why each piece exists, out loud without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a window function and GROUP BY?</summary><div class="qa-body">GROUP BY collapses each group to one row. A window function computes over a group of related rows but returns a value on every input row, so row count is unchanged. <code>SUM(amount) OVER (PARTITION BY customer_id)</code> gives 10 rows; <code>GROUP BY customer_id</code> gives 6.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: ROW_NUMBER, RANK and DENSE_RANK (amount DESC) for order 108 (260).</summary><div class="qa-body">ROW_NUMBER 8 (with order_id as tie-breaker, 107 is 7), RANK 7 (six rows strictly ahead), DENSE_RANK 6 (five distinct values ahead: 600, 520, 450, 380, 310).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: second-highest order value per restaurant, handling ties.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH ranked AS (
  SELECT order_id, restaurant_id, amount,
         DENSE_RANK() OVER (PARTITION BY restaurant_id ORDER BY amount DESC) AS rnk
  FROM orders
)
SELECT restaurant_id, order_id, amount
FROM ranked
WHERE rnk = 2
ORDER BY restaurant_id;</div>Dosa Hut 108 (260), Biryani Bros 102 (450), Pizza Point 104 (380); Green Bowl has only one order. DENSE_RANK so the second distinct value is found even after a tie at the top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: time between each customer's consecutive orders.</summary><div class="qa-body"><code>ordered_at - LAG(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at)</code>. Asha: 1 day 01:05, then 5 days 07:35; Ben 1 day 23:35; Chen 2 days 21:50; first orders are NULL. Without PARTITION BY, Ben's order is compared with Asha's.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: day-over-day order value growth %.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH daily AS (
  SELECT ordered_at::date AS day, SUM(amount) AS gmv FROM orders GROUP BY 1
)
SELECT day, gmv,
  ROUND(100.0 * (gmv - LAG(gmv) OVER (ORDER BY day))
        / NULLIF(LAG(gmv) OVER (ORDER BY day), 0), 1) AS growth_pct
FROM daily
ORDER BY day;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>gmv</th><th>growth_pct</th></tr><tr><td>2026-03-02</td><td>1210.00</td><td>NULL</td></tr><tr><td>2026-03-03</td><td>690.00</td><td>-43.0</td></tr><tr><td>2026-03-04</td><td>440.00</td><td>-36.2</td></tr><tr><td>2026-03-05</td><td>860.00</td><td>95.5</td></tr><tr><td>2026-03-08</td><td>310.00</td><td>-64.0</td></tr></table>Mar 2 has no previous day (NULL). <code>NULLIF(…, 0)</code> turns a zero previous day into NULL instead of a division-by-zero error. Note Mar 8 is compared with Mar 5, because Mar 6–7 have no rows; fill the calendar first if "previous calendar day" is meant.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use a window function in WHERE, and how do you filter on one?</summary><div class="qa-body">Logical order: FROM → WHERE → GROUP BY → HAVING → windows → SELECT. Windows do not exist yet when WHERE runs. Compute the window in a CTE or subquery and filter in the outer query, or use QUALIFY in DuckDB/Snowflake/BigQuery/Databricks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does LAST_VALUE often return the current row's value? Fix it.</summary><div class="qa-body">With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, so the last row in the frame is the current row (or its last peer). Add <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, or use FIRST_VALUE with reversed order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: each restaurant's cumulative share of total order value (Pareto).</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH rev AS (
  SELECT r.name, SUM(o.amount) AS gmv
  FROM orders o JOIN restaurants r USING (restaurant_id)
  GROUP BY r.name
)
SELECT name, gmv,
  ROUND(100.0 * SUM(gmv) OVER (ORDER BY gmv DESC
                               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
        / SUM(gmv) OVER (), 1) AS cum_pct
FROM rev
ORDER BY gmv DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>gmv</th><th>cum_pct</th></tr><tr><td>Biryani Bros</td><td>1230.00</td><td>35.0</td></tr><tr><td>Pizza Point</td><td>1160.00</td><td>68.1</td></tr><tr><td>Dosa Hut</td><td>810.00</td><td>91.2</td></tr><tr><td>Green Bowl</td><td>310.00</td><td>100.0</td></tr></table>Biryani Bros and Pizza Point together already make two thirds of the value. ROWS makes the running sum row-by-row even if two restaurants tied.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A 7-day moving average uses <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> on daily data. What can go wrong?</summary><div class="qa-body">Days with no data have no row, so "6 rows back" may reach 10 days back, and missing days are not counted as zero (Biteful's Mar 8 "last 3 rows" reached Mar 4). Build a full calendar with <code>generate_series</code>, LEFT JOIN and <code>COALESCE(…, 0)</code>, or use <code>RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW</code> (which skips missing days rather than counting them as 0).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a running total need ORDER BY, and why does it then need an explicit frame?</summary><div class="qa-body">Without ORDER BY the window is the whole partition, so there is no "so far": every row gets the total (930). ORDER BY introduces a sequence, and the default frame becomes RANGE … CURRENT ROW, which includes all peers with the same ORDER BY value; on the raw orders by day, all three Mar 2 rows show 1210. ROWS plus a tie-breaker makes it truly row-by-row (240, 690, 1210).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in gaps &amp; islands if you skip ranking and just use LAG?</summary><div class="qa-body">LAG can flag where a streak starts (previous day ≠ day − 1), but a flag is not yet a group id. You then need a running SUM of the flags, which is the sessionization recipe. The <code>day − ROW_NUMBER()</code> trick produces the group id in one step, which is why ranking comes first in the ladder. Both rely on PARTITION BY and a deterministic ORDER BY.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is top-N per group related to the correlated subqueries and LATERAL of the previous note?</summary><div class="qa-body">All three answer "for each group, which rows?". A correlated subquery compares each row with a per-group value; LATERAL runs a per-group <code>ORDER BY … LIMIT N</code>; ROW_NUMBER numbers each group's rows in one pass and a CTE filter keeps rn ≤ N. LATERAL wins with an index and few groups; ROW_NUMBER wins when you read most rows anyway.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do sessions need both LAG and a running SUM?</summary><div class="qa-body">LAG answers a per-row question ("how long since my previous event?"), which yields a 0/1 flag. A session id is a group-level label that must stay constant across many rows and change only at flags; the running SUM turns "changes here" into "this is change number k". Without LAG there is no flag; without the running SUM, no id to GROUP BY.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>.</b> Every window needs its partition sorted by its ORDER BY. On 10 orders that is free; on 100 million it is the most expensive step of the query. Next: how indexes, sorts and plans decide whether these queries run in milliseconds or minutes.</div>
</main>
`
});
