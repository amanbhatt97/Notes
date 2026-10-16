// notes/databases/sql_windows.js — Window Functions
Object.assign(TOPIC_CONTENT, {
  "sql_windows": `<main>
  <h1>Window Functions</h1>
  <p class="lead">Window functions compute across a group of rows without collapsing them: rankings, running totals, previous-row comparisons. They are the most interview-tested SQL topic; most "hard" SQL questions are a window function plus a CTE.</p>

  <h2 id="sw-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Window Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Window function</b> — value from related rows, attached to <em>each</em> row</li>
          <li><b>vs GROUP BY</b> — GROUP BY collapses (2 rows); window keeps all 5</li>
          <li><b>Example</b> — <code>AVG(salary) OVER (PARTITION BY dept)</code> next to each salary</li>
          <li>💡 report card with "class average" in the corner</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Anatomy</div>
        <ul>
          <li><b>Syntax</b> — <code>f() OVER (PARTITION BY … ORDER BY … frame)</code></li>
          <li><b>OVER ()</b> — whole result is the window</li>
          <li><b>PARTITION BY</b> — groups without collapsing</li>
          <li><b>ORDER BY</b> — needed for rank/LAG; makes SUM/AVG running</li>
          <li><b>Order</b> — after WHERE, GROUP BY, HAVING; before ORDER BY/LIMIT</li>
          <li><code>SUM(SUM(x)) OVER ()</code> is legal; <code>WINDOW w AS (…)</code> reuses a spec</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ranking &amp; top-N</div>
        <ul>
          <li><b>ROW_NUMBER</b> — 1,2,3,4 unique; "exactly N", dedupe</li>
          <li><b>RANK</b> — 1,2,2,4 skips after ties</li>
          <li><b>DENSE_RANK</b> — 1,2,2,3; "Nth highest value"</li>
          <li>⚠ ROW_NUMBER on ties is arbitrary → add tiebreaker (<code>, emp_id</code>)</li>
          <li><b>Top-N per group</b> — rank with PARTITION BY in CTE, filter <code>rnk &lt;= N</code></li>
          <li>💡 tie for silver: RANK → next is 4th, DENSE_RANK → bronze</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LAG / LEAD &amp; running</div>
        <ul>
          <li><b>LAG(col, n, default)</b> — n rows back · <b>LEAD</b> — n rows ahead</li>
          <li><b>Gap</b> — <code>d - LAG(d) OVER (PARTITION BY cust ORDER BY d)</code> (Asha 19 days)</li>
          <li>⚠ forget PARTITION BY → compares different customers; first row NULL</li>
          <li><b>Running total</b> — <code>SUM(x) OVER (ORDER BY d)</code></li>
          <li><b>Moving avg</b> — <code>ROWS BETWEEN 1 PRECEDING AND CURRENT ROW</code></li>
          <li><b>% of total</b> — <code>100.0 * x / SUM(x) OVER (PARTITION BY g)</code></li>
          <li><b>MoM growth</b> — <code>(rev - LAG(rev)) / NULLIF(LAG(rev), 0)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Frames</div>
        <ul>
          <li><b>Frame</b> — rows the aggregate sees: <code>ROWS|RANGE BETWEEN start AND end</code></li>
          <li><b>ROWS</b> — physical rows · <b>RANGE</b> — values; peers (ties) included together</li>
          <li><b>Default</b> — no ORDER BY: whole partition; with ORDER BY: <code>RANGE UNBOUNDED PRECEDING → CURRENT ROW</code></li>
          <li>⚠ Sara's running sum includes Tom (325000 not 230000) → ROWS + tiebreaker</li>
          <li>⚠ <b>LAST_VALUE</b> = "last so far" → frame to <code>UNBOUNDED FOLLOWING</code></li>
          <li>⚠ <code>ROWS 6 PRECEDING</code> ≠ 7 days when dates have gaps</li>
          <li>💡 queue: ROWS = 2 people ahead; RANGE = everyone who came that minute</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Distribution</div>
        <ul>
          <li><b>NTILE(n)</b> — n near-equal buckets; early buckets get extras</li>
          <li><b>PERCENT_RANK</b> — (rank − 1)/(n − 1), 0 → 1</li>
          <li><b>CUME_DIST</b> — fraction of rows ≤ value, 1/n → 1</li>
          <li>⚠ NTILE splits by count; ties can straddle buckets</li>
          <li><b>Median</b> — <code>PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x)</code> (aggregate)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Filtering on windows</div>
        <ul>
          <li>⚠ <b>Not in WHERE</b> — "window functions are not allowed in WHERE"</li>
          <li><b>Fix</b> — compute in CTE/subquery, filter outside</li>
          <li><b>QUALIFY</b> — Snowflake, BigQuery, Databricks, DuckDB (not Postgres)</li>
          <li>⚠ WHERE before LAG changes what LAG sees (previous delivered vs previous)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic patterns</div>
        <ul>
          <li><b>Gaps &amp; islands</b> — <code>date − ROW_NUMBER()</code> constant within a streak</li>
          <li>then <code>GROUP BY user, grp</code> → MIN, MAX, COUNT = streak</li>
          <li>⚠ duplicate days break it → <code>SELECT DISTINCT</code> first</li>
          <li><b>Sessions</b> — flag gap &gt; 30 min with LAG, running SUM of flags = session id</li>
          <li><b>Recipe</b> — "flag group starts, running-sum the flags"</li>
          <li><b>Dedupe / latest</b> — <code>ROW_NUMBER() … = 1</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sw-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Problem Windows Solve</span><span class="rm-sub">Keep rows, add group values</span></div></div>
      <div class="rm-item rm-done" data-target="sw-over"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">OVER, PARTITION BY, ORDER BY</span><span class="rm-sub">Anatomy of a window</span></div></div>
      <div class="rm-item rm-done" data-target="sw-rank"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Ranking &amp; Top-N</span><span class="rm-sub">ROW_NUMBER, RANK, DENSE_RANK</span></div></div>
      <div class="rm-item rm-done" data-target="sw-lag"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">LAG &amp; LEAD</span><span class="rm-sub">Compare with neighbours</span></div></div>
      <div class="rm-item rm-done" data-target="sw-run"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Running Totals &amp; Shares</span><span class="rm-sub">Cumulative, moving, % of total</span></div></div>
      <div class="rm-item rm-done" data-target="sw-frame"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Frames: ROWS vs RANGE</span><span class="rm-sub">The default and LAST_VALUE</span></div></div>
      <div class="rm-item rm-done" data-target="sw-dist"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">NTILE &amp; Distribution</span><span class="rm-sub">Buckets and percentiles</span></div></div>
      <div class="rm-item rm-done" data-target="sw-where"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Filtering on a Window</span><span class="rm-sub">Why not WHERE; QUALIFY</span></div></div>
      <div class="rm-item rm-done" data-target="sw-pat"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Classic Patterns</span><span class="rm-sub">Gaps &amp; islands, sessions</span></div></div>
      <div class="rm-item rm-done" data-target="sw-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Write-the-query drills</span></div></div>
    </div>
  </div>

  <h2 id="sw-why"><span class="num">01</span>The Problem Windows Solve</h2>
  <p>A <strong>window function</strong> computes a value from related rows (the "window") and attaches it to <em>each</em> row. GROUP BY would collapse the rows and need a join back.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="sw-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="145" y="16" text-anchor="middle" font-weight="bold" font-size="12">GROUP BY dept</text>
    <rect x="10" y="30" width="130" height="23" rx="3" class="fb"/><text x="17" y="46">Ravi · 120000</text><rect x="10" y="57" width="130" height="23" rx="3" class="fb"/><text x="17" y="73">Sara · 95000</text><rect x="10" y="84" width="130" height="23" rx="3" class="fb"/><text x="17" y="100">Tom · 95000</text><rect x="10" y="111" width="130" height="23" rx="3" class="fv"/><text x="17" y="127">Uma · 70000</text><rect x="10" y="138" width="130" height="23" rx="3" class="fv"/><text x="17" y="154">Vik · 65000</text>
    <g stroke="currentColor" marker-end="url(#sw-ar1)" opacity="0.7"><line x1="140" y1="41" x2="183" y2="66"/><line x1="140" y1="68" x2="183" y2="68"/><line x1="140" y1="95" x2="183" y2="70"/><line x1="140" y1="122" x2="183" y2="136"/><line x1="140" y1="149" x2="183" y2="140"/></g>
    <rect x="185" y="55" width="110" height="26" rx="4" class="fb sb"/><text x="240" y="72" text-anchor="middle">Eng 103333</text>
    <rect x="185" y="125" width="110" height="26" rx="4" class="fv"/><text x="240" y="142" text-anchor="middle">Sales 67500</text>
    <text x="145" y="182" text-anchor="middle" class="tm">5 rows → 2 rows: detail lost</text>
    <line x1="305" y1="10" x2="305" y2="185" stroke="currentColor" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="450" y="16" text-anchor="middle" font-weight="bold" font-size="12">AVG() OVER (PARTITION BY dept)</text>
    <rect x="320" y="30" width="130" height="23" rx="3" class="fb"/><text x="327" y="46">Ravi · 120000</text><rect x="458" y="30" width="120" height="23" rx="3" class="fg sg"/><text x="518" y="46" text-anchor="middle">avg 103333</text><rect x="320" y="57" width="130" height="23" rx="3" class="fb"/><text x="327" y="73">Sara · 95000</text><rect x="458" y="57" width="120" height="23" rx="3" class="fg sg"/><text x="518" y="73" text-anchor="middle">avg 103333</text><rect x="320" y="84" width="130" height="23" rx="3" class="fb"/><text x="327" y="100">Tom · 95000</text><rect x="458" y="84" width="120" height="23" rx="3" class="fg sg"/><text x="518" y="100" text-anchor="middle">avg 103333</text><rect x="320" y="111" width="130" height="23" rx="3" class="fv"/><text x="327" y="127">Uma · 70000</text><rect x="458" y="111" width="120" height="23" rx="3" class="fg sg"/><text x="518" y="127" text-anchor="middle">avg 67500</text><rect x="320" y="138" width="130" height="23" rx="3" class="fv"/><text x="327" y="154">Vik · 65000</text><rect x="458" y="138" width="120" height="23" rx="3" class="fg sg"/><text x="518" y="154" text-anchor="middle">avg 67500</text>
    <text x="450" y="182" text-anchor="middle" class="tm">5 rows → 5 rows + group value</text>
    </g>
  </svg><figcaption>Same groups, same average. GROUP BY collapses them; a window writes the group value onto every row.</figcaption></figure>
  <div class="fx" data-lang="sql">SELECT dept, AVG(salary)::int AS dept_avg
FROM employees GROUP BY dept;      -- 2 rows: Eng 103333, Sales 67500</div>
  <div class="fx" data-lang="sql">SELECT name, dept, salary,
       AVG(salary) OVER (PARTITION BY dept)::int AS dept_avg
FROM employees;</div>
  <table class="tbl out"><caption>Result: all 5 rows kept</caption><tr><th>name</th><th>dept</th><th>salary</th><th>dept_avg</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>103333</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>103333</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>103333</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>67500</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>67500</td></tr></table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class photo vs a report card. <code>GROUP BY</code> gives one summary line per class. A window keeps every student's own card and writes "class average: 72" in the corner of each.</p>
  </div>

  <h2 id="sw-over"><span class="num">02</span>OVER, PARTITION BY, ORDER BY</h2>
  <div class="fx" data-lang="sql">function_name(...) OVER (
  PARTITION BY dept        -- split rows into independent groups (optional)
  ORDER BY salary DESC     -- order inside each group (optional)
  ROWS BETWEEN ...         -- frame: which rows around me to use (optional)
)</div>
  <ul>
    <li><code>OVER ()</code> empty: the window is the whole result.</li>
    <li><strong>PARTITION BY</strong>: like GROUP BY without collapsing; each partition is computed separately.</li>
    <li><strong>ORDER BY</strong>: needed for ranking and LAG/LEAD; makes SUM/AVG <em>running</em>.</li>
  </ul>
  <div class="flow"><span>FROM / JOIN</span><span>WHERE</span><span>GROUP BY / HAVING</span><span>Window functions</span><span>SELECT list</span><span>ORDER BY / LIMIT</span></div>
  <p>Windows run <strong>after</strong> WHERE and GROUP BY (key to section 08), so <code>SUM(SUM(x)) OVER ()</code> is legal.</p>

  <h2 id="sw-rank"><span class="num">03</span>Ranking &amp; Top-N</h2>
  <p>The three ranking functions differ only in how they treat <strong>ties</strong>. Sara and Tom both earn 95,000.</p>
  <div class="fx" data-lang="sql">SELECT name, salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
  RANK()       OVER (ORDER BY salary DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense
FROM employees;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>row_num</th><th>rnk</th><th>dense</th></tr><tr><td>Ravi</td><td>120000</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Sara</td><td>95000</td><td>2</td><td>2</td><td>2</td></tr><tr><td>Tom</td><td>95000</td><td>3</td><td>2</td><td>2</td></tr><tr><td>Uma</td><td>70000</td><td>4</td><td>4</td><td>3</td></tr><tr><td>Vik</td><td>65000</td><td>5</td><td>5</td><td>4</td></tr></table>
  <table class="tbl">
    <tr><th>Function</th><th>Ties</th><th>After a tie</th><th>Use for</th></tr>
    <tr><td><code>ROW_NUMBER</code></td><td>Different numbers (arbitrary order)</td><td>—</td><td>Exactly N rows; dedup "keep one"</td></tr>
    <tr><td><code>RANK</code></td><td>Same number</td><td>Skips (1,2,2,<strong>4</strong>)</td><td>Competition ranking</td></tr>
    <tr><td><code>DENSE_RANK</code></td><td>Same number</td><td>No gap (1,2,2,<strong>3</strong>)</td><td>"Nth highest <em>value</em>"</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two runners tie for silver. RANK: the next runner is 4th (no bronze). DENSE_RANK: the next gets bronze. ROW_NUMBER: a coin flip gives everyone a unique place.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>ROW_NUMBER on ties is <strong>non-deterministic</strong>: Sara vs Tom may swap between runs. Add a tie-breaker: <code>ORDER BY salary DESC, emp_id</code>.</p>
  </div>
  <h3>Top-N per group</h3>
  <p>Rank inside each partition in a CTE, then filter. Second-highest salary per department, ties included:</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT name, dept, salary,
         DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT dept, name, salary FROM ranked WHERE rnk = 2;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>name</th><th>salary</th></tr><tr><td>Eng</td><td>Sara</td><td>95000</td></tr><tr><td>Eng</td><td>Tom</td><td>95000</td></tr><tr><td>Sales</td><td>Vik</td><td>65000</td></tr></table>
  <p><code>ROW_NUMBER() … rn &lt;= 2</code> gives exactly 2 per dept (Ravi + Sara <em>or</em> Tom). Pick the function by what "top 2" means for ties.</p>

  <h2 id="sw-lag"><span class="num">04</span>LAG &amp; LEAD</h2>
  <p><code>LAG(col, n, default)</code> reads the value <em>n</em> rows earlier in the window; <code>LEAD</code> reads <em>n</em> rows later. Default n is 1; out-of-range gives NULL (or the default).</p>
  
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date,
  LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date,
  order_date - LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS days_since_prev
FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th><th>prev_date</th><th>days_since_prev</th></tr><tr><td>1</td><td>100</td><td>2024-05-01</td><td></td><td></td></tr><tr><td>1</td><td>101</td><td>2024-05-20</td><td>2024-05-01</td><td>19</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td><td></td><td></td></tr><tr><td>3</td><td>103</td><td>2024-06-15</td><td></td><td></td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td><td>2024-06-15</td><td>16</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forget <code>PARTITION BY customer_id</code> and LAG compares Ben's order with Asha's. Each partition's first row is NULL: keep, drop or <code>COALESCE</code> it.</p>
  </div>

  <h2 id="sw-run"><span class="num">05</span>Running Totals &amp; Shares</h2>
  <p>Add <code>ORDER BY</code> to an aggregate window and it becomes cumulative. Add a frame and it becomes a moving window.</p>
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT o.order_date, SUM(oi.qty * oi.unit_price) AS revenue
  FROM orders o JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY o.order_date
)
SELECT order_date, revenue,
  SUM(revenue) OVER (ORDER BY order_date) AS running_total,
  revenue - LAG(revenue) OVER (ORDER BY order_date) AS change,
  ROUND(AVG(revenue) OVER (ORDER BY order_date
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) AS moving_avg_2
FROM daily;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_date</th><th>revenue</th><th>running_total</th><th>change</th><th>moving_avg_2</th></tr><tr><td>2024-05-01</td><td>880.00</td><td>880.00</td><td></td><td>880.00</td></tr><tr><td>2024-05-20</td><td>500.00</td><td>1380.00</td><td>-380.00</td><td>690.00</td></tr><tr><td>2024-06-15</td><td>1150.00</td><td>2530.00</td><td>650.00</td><td>825.00</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>2650.00</td><td>-1030.00</td><td>635.00</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 185" width="600">
    <g font-size="10">
    <text x="402" y="18" text-anchor="middle" class="tg">current row</text>
    <text x="10" y="52" class="tm">daily revenue</text>
    <rect x="120" y="28" width="105" height="40" rx="5" class="fs"/><text x="172" y="44" text-anchor="middle">05-01</text><text x="172" y="60" text-anchor="middle" font-weight="bold">880</text><rect x="235" y="28" width="105" height="40" rx="5" class="fs"/><text x="287" y="44" text-anchor="middle">05-20</text><text x="287" y="60" text-anchor="middle" font-weight="bold">500</text><rect x="350" y="28" width="105" height="40" rx="5" class="fg sg" stroke-width="2"/><text x="402" y="44" text-anchor="middle">06-15</text><text x="402" y="60" text-anchor="middle" font-weight="bold">1150</text><rect x="465" y="28" width="105" height="40" rx="5" class="fs"/><text x="517" y="44" text-anchor="middle">07-01</text><text x="517" y="60" text-anchor="middle" font-weight="bold">120</text>
    <text x="10" y="99">OVER ()</text>
    <rect x="120" y="86" width="450" height="20" rx="4" class="fb sb"/><text x="345" y="100" text-anchor="middle">whole partition → SUM = 2650</text>
    <text x="10" y="129">ORDER BY date</text>
    <rect x="120" y="116" width="335" height="20" rx="4" class="ft st"/><text x="287" y="130" text-anchor="middle">start … current → SUM = 2530</text>
    <text x="10" y="159">1 PRECEDING</text>
    <rect x="235" y="146" width="220" height="20" rx="4" class="fv"/><text x="345" y="160" text-anchor="middle">prev + current → AVG = 825</text>
    </g>
  </svg><figcaption>For the 06-15 row: the frame decides which rows the aggregate sees. Values match the query above.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>ROWS 6 PRECEDING</code> means 6 rows, not 6 days: missing days stretch the window (see the last Q&amp;A).</p>
  </div>
  <h3>Percent of total</h3>
  <p><code>SUM(x) OVER ()</code> puts the grand total on every row, so the share is one division.</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary,
  ROUND(100.0 * salary / SUM(salary) OVER (PARTITION BY dept), 1) AS pct_of_dept
FROM employees ORDER BY dept, salary DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th><th>pct_of_dept</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>38.7</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>30.6</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>30.6</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>51.9</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>48.1</td></tr></table>
  <p>Use <code>100.0</code>, not <code>100</code>, to avoid integer division.</p>

  <h2 id="sw-frame"><span class="num">06</span>Frames: ROWS vs RANGE</h2>
  <p>A <strong>frame</strong> is the subset of the partition an aggregate sees for the current row: <code>{ROWS | RANGE} BETWEEN start AND end</code>, using <code>UNBOUNDED PRECEDING</code>, <code>n PRECEDING</code>, <code>CURRENT ROW</code>, <code>n FOLLOWING</code>, <code>UNBOUNDED FOLLOWING</code>.</p>
  <table class="tbl">
    <tr><td><strong>ROWS</strong></td><td>Counts physical rows; ties are separate rows</td></tr>
    <tr><td><strong>RANGE</strong></td><td>Works on values; rows with the same ORDER BY value (<em>peers</em>) come together</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A queue. ROWS: "you and the 2 people ahead". RANGE: "everyone who arrived at your minute or earlier", so ties come along.</p>
  </div>
  <table class="tbl">
    <tr><th>Window has…</th><th>Default frame</th></tr>
    <tr><td>No ORDER BY</td><td>Whole partition</td></tr>
    <tr><td>ORDER BY</td><td><code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> (current row <em>plus its peers</em>)</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT name, salary,
  SUM(salary) OVER (ORDER BY salary) AS range_default,
  SUM(salary) OVER (ORDER BY salary
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rows_sum
FROM employees ORDER BY salary, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>range_default</th><th>rows_sum</th></tr><tr><td>Vik</td><td>65000</td><td>65000</td><td>65000</td></tr><tr><td>Uma</td><td>70000</td><td>135000</td><td>135000</td></tr><tr><td>Sara</td><td>95000</td><td><strong>325000</strong></td><td>230000</td></tr><tr><td>Tom</td><td>95000</td><td>325000</td><td>325000</td></tr><tr><td>Ravi</td><td>120000</td><td>445000</td><td>445000</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <g font-size="10">
    <text x="206" y="18" text-anchor="middle" class="tg">current row</text><text x="482" y="18" text-anchor="middle" class="tm">peer (same salary)</text>
    <text x="10" y="52" class="tm">ORDER BY salary</text>
    <rect x="120" y="28" width="86" height="40" rx="5" class="fs"/><text x="163" y="44" text-anchor="middle">Vik</text><text x="163" y="60" text-anchor="middle" font-weight="bold">65000</text><rect x="212" y="28" width="86" height="40" rx="5" class="fs"/><text x="255" y="44" text-anchor="middle">Uma</text><text x="255" y="60" text-anchor="middle" font-weight="bold">70000</text><rect x="304" y="28" width="86" height="40" rx="5" class="fg sg"/><text x="347" y="44" text-anchor="middle">Sara</text><text x="347" y="60" text-anchor="middle" font-weight="bold">95000</text><rect x="396" y="28" width="86" height="40" rx="5" class="fv"/><text x="439" y="44" text-anchor="middle">Tom</text><text x="439" y="60" text-anchor="middle" font-weight="bold">95000</text><rect x="488" y="28" width="86" height="40" rx="5" class="fs"/><text x="531" y="44" text-anchor="middle">Ravi</text><text x="531" y="60" text-anchor="middle" font-weight="bold">120000</text>
    <text x="10" y="99">ROWS</text>
    <rect x="120" y="86" width="270" height="20" rx="4" class="ft st"/><text x="255" y="100" text-anchor="middle">up to this row → 230000</text>
    <text x="10" y="129">RANGE (default)</text>
    <rect x="120" y="116" width="362" height="20" rx="4" class="fr sr"/><text x="301" y="130" text-anchor="middle">up to this value, incl. Tom → 325000</text>
    </g>
  </svg><figcaption>RANGE treats Sara and Tom as one step because their ORDER BY values tie.</figcaption></figure>
  <p>For a row-by-row total, use ROWS plus a unique tie-breaker.</p>
  <h3>The LAST_VALUE trap</h3>
  <div class="fx" data-lang="sql">SELECT name, dept, salary,
  FIRST_VALUE(name) OVER w AS top_paid,
  LAST_VALUE(name)  OVER w AS lowest_paid_wrong,
  LAST_VALUE(name)  OVER (w ROWS BETWEEN UNBOUNDED PRECEDING
                              AND UNBOUNDED FOLLOWING) AS lowest_paid
FROM employees
WINDOW w AS (PARTITION BY dept ORDER BY salary DESC);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th><th>top_paid</th><th>lowest_paid_wrong</th><th>lowest_paid</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>Ravi</td><td>Ravi</td><td>Tom</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>Ravi</td><td>Tom</td><td>Tom</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>Ravi</td><td>Tom</td><td>Tom</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>Uma</td><td>Uma</td><td>Vik</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>Uma</td><td>Vik</td><td>Vik</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The default frame ends at the current row (plus peers), so LAST_VALUE is "last so far". Extend to <code>UNBOUNDED FOLLOWING</code> or use FIRST_VALUE with reversed order. Sara's wrong value is Tom: RANGE pulled in her peer.</p>
  </div>

  <h2 id="sw-dist"><span class="num">07</span>NTILE &amp; Distribution</h2>
  <ul>
    <li><code>NTILE(n)</code>: splits ordered rows into <em>n</em> near-equal buckets (quartiles, deciles). Earlier buckets get the extra rows.</li>
    <li><code>PERCENT_RANK()</code>: <code>(rank − 1) / (rows − 1)</code>, from 0 to 1.</li>
    <li><code>CUME_DIST()</code>: fraction of rows ≤ the current value, from 1/n to 1.</li>
  </ul>
  <div class="fx" data-lang="sql">SELECT name, salary,
  NTILE(2) OVER (ORDER BY salary DESC) AS half,
  ROUND(PERCENT_RANK() OVER (ORDER BY salary)::numeric, 2) AS pct_rank,
  ROUND(CUME_DIST()    OVER (ORDER BY salary)::numeric, 2) AS cume_dist
FROM employees ORDER BY salary DESC, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>half</th><th>pct_rank</th><th>cume_dist</th></tr><tr><td>Ravi</td><td>120000</td><td>1</td><td>1.00</td><td>1.00</td></tr><tr><td>Sara</td><td>95000</td><td>1</td><td>0.50</td><td>0.80</td></tr><tr><td>Tom</td><td>95000</td><td>1</td><td>0.50</td><td>0.80</td></tr><tr><td>Uma</td><td>70000</td><td>2</td><td>0.25</td><td>0.40</td></tr><tr><td>Vik</td><td>65000</td><td>2</td><td>0.00</td><td>0.20</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>NTILE splits by <em>row count</em>, so ties can land in different buckets. For a median use <code>PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary)</code> (an aggregate, not a window).</p>
  </div>

  <h2 id="sw-where"><span class="num">08</span>Filtering on a Window</h2>
  <p>WHERE runs <em>before</em> windows are computed (see the flow in 02), so it can't see them. Neither can a SELECT alias.</p>
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE ROW_NUMBER() OVER (ORDER BY salary DESC) = 1;
-- ERROR:  window functions are not allowed in WHERE</div>
  <p><strong>Fix</strong>: compute in a CTE or subquery, filter outside. Employees above their department's average:</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary
FROM (SELECT e.*, AVG(salary) OVER (PARTITION BY dept) AS dept_avg
      FROM employees e) t
WHERE salary &gt; dept_avg;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td></tr></table>
  <p>Snowflake, BigQuery, Databricks and DuckDB add <code>QUALIFY</code>, a WHERE for windows (not in Postgres):</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary FROM employees
QUALIFY ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) = 1;</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Filtering in WHERE changes what the window sees. <code>WHERE status = 'delivered'</code> before <code>LAG</code> gives the previous <em>delivered</em> order, not the previous order. Decide which you mean.</p>
  </div>

  <h2 id="sw-pat"><span class="num">09</span>Classic Patterns</h2>
  <p>These need time-series data, so they use two small tables in a copy of the DB:</p>
  <div class="fx" data-lang="sql">CREATE TABLE logins (user_id int, login_date date);
INSERT INTO logins VALUES
 (1,'2024-06-01'),(1,'2024-06-02'),(1,'2024-06-03'),(1,'2024-06-05'),(1,'2024-06-06'),
 (2,'2024-06-01'),(2,'2024-06-03'),(2,'2024-06-04'),(2,'2024-06-05'),(2,'2024-06-06');

CREATE TABLE clicks (user_id int, ts timestamp);
INSERT INTO clicks VALUES
 (1,'2024-06-01 09:00'),(1,'2024-06-01 09:10'),(1,'2024-06-01 09:25'),
 (1,'2024-06-01 11:00'),(1,'2024-06-01 11:05'),(2,'2024-06-01 10:00');</div>
  <h3>Gaps and islands (consecutive days)</h3>
  <p>Goal: find streaks of consecutive login days. Trick: <strong>date − ROW_NUMBER</strong> is constant within a streak, because both rise by 1 each day. A gap breaks it.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <g font-size="10">
    <text x="10" y="40" class="tm">user 1 logins</text>
    <text x="10" y="76" class="tm">ROW_NUMBER</text>
    <text x="10" y="104" class="tm">date − rn</text>
    <rect x="130" y="22" width="68" height="28" rx="4" class="fb"/><text x="164" y="40" text-anchor="middle">Jun 1</text><text x="164" y="76" text-anchor="middle">1</text><text x="164" y="104" text-anchor="middle" font-weight="bold" class="tb">05-31</text><rect x="205" y="22" width="68" height="28" rx="4" class="fb"/><text x="239" y="40" text-anchor="middle">Jun 2</text><text x="239" y="76" text-anchor="middle">2</text><text x="239" y="104" text-anchor="middle" font-weight="bold" class="tb">05-31</text><rect x="280" y="22" width="68" height="28" rx="4" class="fb"/><text x="314" y="40" text-anchor="middle">Jun 3</text><text x="314" y="76" text-anchor="middle">3</text><text x="314" y="104" text-anchor="middle" font-weight="bold" class="tb">05-31</text><rect x="355" y="22" width="68" height="28" rx="4" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="389" y="40" text-anchor="middle" class="tm">Jun 4</text><text x="389" y="76" text-anchor="middle" class="tr">gap</text><rect x="430" y="22" width="68" height="28" rx="4" class="fv"/><text x="464" y="40" text-anchor="middle">Jun 5</text><text x="464" y="76" text-anchor="middle">4</text><text x="464" y="104" text-anchor="middle" font-weight="bold" class="tg">06-01</text><rect x="505" y="22" width="68" height="28" rx="4" class="fv"/><text x="539" y="40" text-anchor="middle">Jun 6</text><text x="539" y="76" text-anchor="middle">5</text><text x="539" y="104" text-anchor="middle" font-weight="bold" class="tg">06-01</text>
    <path d="M130,118 L130,124 L353,124 L353,118" fill="none" class="sb" stroke-width="2"/>
    <text x="241" y="142" text-anchor="middle" class="tb">island 1: 3 days</text>
    <path d="M430,118 L430,124 L573,124 L573,118" fill="none" class="sg" stroke-width="2"/>
    <text x="501" y="142" text-anchor="middle" class="tg">island 2: 2 days</text>
    </g>
  </svg><figcaption>Date and row number both rise by 1 per consecutive day, so their difference stays constant until a gap shifts it.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two people walking up stairs side by side, one step per day. While neither skips, the gap between them stays the same. When one skips a day, the gap changes: a new island.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT user_id, login_date,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS rn,
  login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date)::int AS grp
FROM logins WHERE user_id = 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>login_date</th><th>rn</th><th>grp</th></tr><tr><td>1</td><td>2024-06-01</td><td>1</td><td>2024-05-31</td></tr><tr><td>1</td><td>2024-06-02</td><td>2</td><td>2024-05-31</td></tr><tr><td>1</td><td>2024-06-03</td><td>3</td><td>2024-05-31</td></tr><tr><td>1</td><td>2024-06-05</td><td>4</td><td>2024-06-01</td></tr><tr><td>1</td><td>2024-06-06</td><td>5</td><td>2024-06-01</td></tr></table>
  <div class="fx" data-lang="sql">WITH g AS (
  SELECT user_id, login_date,
         login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date)::int AS grp
  FROM logins
)
SELECT user_id, MIN(login_date) AS streak_start, MAX(login_date) AS streak_end, COUNT(*) AS days
FROM g GROUP BY user_id, grp ORDER BY user_id, streak_start;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>streak_start</th><th>streak_end</th><th>days</th></tr><tr><td>1</td><td>2024-06-01</td><td>2024-06-03</td><td>3</td></tr><tr><td>1</td><td>2024-06-05</td><td>2024-06-06</td><td>2</td></tr><tr><td>2</td><td>2024-06-01</td><td>2024-06-01</td><td>1</td></tr><tr><td>2</td><td>2024-06-03</td><td>2024-06-06</td><td>4</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two logins on the same day break the trick (ROW_NUMBER rises, date doesn't). Deduplicate first: <code>FROM (SELECT DISTINCT user_id, login_date FROM logins)</code>, or use DENSE_RANK.</p>
  </div>
  <h3>Sessionization</h3>
  <p>Goal: group clicks into sessions, where 30+ minutes of inactivity starts a new one. Two steps: flag session starts with LAG, then a running SUM of the flags numbers the sessions.</p>
  <div class="fx" data-lang="sql">WITH flagged AS (
  SELECT user_id, ts,
    CASE WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts)
              &lt;= INTERVAL '30 minutes' THEN 0 ELSE 1 END AS new_session
  FROM clicks
)
SELECT user_id, ts, new_session,
  SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_id
FROM flagged;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>ts</th><th>new_session</th><th>session_id</th></tr><tr><td>1</td><td>2024-06-01 09:00:00</td><td>1</td><td>1</td></tr><tr><td>1</td><td>2024-06-01 09:10:00</td><td>0</td><td>1</td></tr><tr><td>1</td><td>2024-06-01 09:25:00</td><td>0</td><td>1</td></tr><tr><td>1</td><td>2024-06-01 11:00:00</td><td>1</td><td>2</td></tr><tr><td>1</td><td>2024-06-01 11:05:00</td><td>0</td><td>2</td></tr><tr><td>2</td><td>2024-06-01 10:00:00</td><td>1</td><td>1</td></tr></table>
  <p>The first click's LAG is NULL, so CASE falls to ELSE 1: a new session. Then <code>GROUP BY user_id, session_id</code> gives start, <code>MAX(ts) - MIN(ts)</code> duration and clicks (user 1: 25 min / 3 clicks, then 5 min / 2).</p>
  <div class="callout intu"><span class="label">The general recipe</span>
    <p>"Flag where a new group starts (LAG), then running-SUM the flags to get a group id" solves streaks, sessions, status changes and many "consecutive" problems.</p>
  </div>
  <h2 id="sw-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>

  <details class="qa"><summary><span class="qmark">Q</span>Predict the output: ROW_NUMBER, RANK and DENSE_RANK of salary DESC for Uma.</summary><div class="qa-body">ROW_NUMBER 4, RANK 4, DENSE_RANK 3. Sara and Tom tie at 95,000 for 2nd; RANK skips 3, DENSE_RANK doesn't.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: second-highest salary in each department, handling ties.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH r AS (
  SELECT name, dept, salary,
         DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
  FROM employees)
SELECT dept, name, salary FROM r WHERE rnk = 2;</div>Eng: Sara and Tom (95,000); Sales: Vik. DENSE_RANK so the second distinct value is found even after a tie at the top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: keep only each customer's most recent order (deduplication).</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date FROM (
  SELECT o.*, ROW_NUMBER() OVER (PARTITION BY customer_id
                                 ORDER BY order_date DESC, order_id DESC) AS rn
  FROM orders o) t
WHERE rn = 1;</div>Result: (1, 101), (2, 102), (3, 104). ROW_NUMBER guarantees exactly one row; the extra <code>order_id</code> breaks date ties deterministically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: days between each customer's consecutive orders.</summary><div class="qa-body"><code>order_date - LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)</code>. Asha: 19 days, Chen: 16 days; first orders are NULL. Without PARTITION BY you'd compare different customers' orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: month-over-month revenue growth %.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH monthly AS (
  SELECT date_trunc('month', o.order_date)::date AS month,
         SUM(oi.qty * oi.unit_price) AS revenue
  FROM orders o JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled' GROUP BY 1)
SELECT month, revenue,
  ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
        / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly;</div>May 1380 (NULL), June 1150 (−16.7), July 120 (−89.6). Use <code>NULLIF(LAG(...), 0)</code> to guard against division by zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use a window function in WHERE, and how do you filter on one?</summary><div class="qa-body">Logical order: FROM → WHERE → GROUP BY → HAVING → windows → SELECT. Windows don't exist yet when WHERE runs. Compute the window in a CTE or subquery and filter in the outer query, or use QUALIFY in Snowflake/BigQuery/Databricks/DuckDB.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does LAST_VALUE often return the current row's value? Fix it.</summary><div class="qa-body">With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, so the "last" row in the frame is the current row (or its last peer). Add <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, or use FIRST_VALUE with reversed order.</div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Write the query: each product's share of total revenue, and the cumulative share (Pareto).</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH rev AS (
  SELECT p.name, SUM(oi.qty * oi.unit_price) AS revenue
  FROM order_items oi JOIN products p USING (product_id) GROUP BY p.name)
SELECT name, revenue,
  ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC)
        / SUM(revenue) OVER (), 1) AS cum_pct
FROM rev ORDER BY revenue DESC;</div>Phone 53.6, Laptop 82.1, Desk 92.9, Lamp 100.0. Products up to the first row reaching 80% (Phone, Laptop) are the "top 80%".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: each user's longest streak of consecutive login days.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH g AS (
  SELECT user_id,
         login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date)::int AS grp
  FROM (SELECT DISTINCT user_id, login_date FROM logins) d),
s AS (SELECT user_id, COUNT(*) AS days FROM g GROUP BY user_id, grp)
SELECT user_id, MAX(days) AS longest_streak FROM s GROUP BY user_id;</div>User 1: 3, user 2: 4.</div></details>

  <details class="qa"><summary><span class="qmark">Q</span>A 7-day moving average uses <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> on daily data. What can go wrong?</summary><div class="qa-body">Days with no data have no row, so "6 rows back" may reach 10 days back, and missing days aren't counted as zero. Build a full calendar with <code>generate_series</code>, LEFT JOIN and <code>COALESCE(…, 0)</code>, or use a RANGE frame with <code>INTERVAL '6 days' PRECEDING</code>.</div></details>
</main>`
});
