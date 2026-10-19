// notes/databases/sql_windows.js — Window Functions
Object.assign(TOPIC_CONTENT, {
  "sql_windows": `<main>
  <h1>Window Functions</h1>
  <p class="lead">A window function looks at a group of related rows and writes an answer onto <em>each</em> row, without collapsing them: rank within a department, running total by date, gap since the previous order. They are the most tested SQL topic in data interviews; most "hard" SQL questions are one window function plus a CTE. Builds on <a class="xref" data-note="sql_fundamentals">GROUP BY</a> and <a class="xref" data-note="sql_subqueries">CTEs</a>.</p>

  <h2 id="sw-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Window Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Need</b> — row detail <em>and</em> a group value on the same line</li>
          <li><b>GROUP BY</b> collapses (5 → 2 rows); join-back works but is clumsy</li>
          <li><b>Window</b> — <code>AVG(salary) OVER (PARTITION BY dept)</code> keeps all 5</li>
          <li>💡 every report card shows "class average" in the corner</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Anatomy</div>
        <ul>
          <li><code>f() OVER (PARTITION BY … ORDER BY … frame)</code></li>
          <li><b>OVER ()</b> — whole result · <b>PARTITION BY</b> — groups, no collapse</li>
          <li><b>ORDER BY</b> — needed for rank/LAG; turns SUM/AVG into running</li>
          <li><b>Runs after</b> WHERE, GROUP BY, HAVING; before ORDER BY/LIMIT</li>
          <li><code>SUM(SUM(x)) OVER ()</code> is legal · <code>WINDOW w AS (…)</code> reuses a spec</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ranking &amp; top-N</div>
        <ul>
          <li><b>ROW_NUMBER</b> 1,2,3,4 · <b>RANK</b> 1,2,2,4 · <b>DENSE_RANK</b> 1,2,2,3</li>
          <li>⚠ ROW_NUMBER on ties is arbitrary → add tiebreaker (<code>, emp_id</code>)</li>
          <li><b>Top-N per group</b> — rank with PARTITION BY in a CTE, filter outside</li>
          <li><b>Nth highest value</b> → DENSE_RANK · <b>exactly N rows</b> → ROW_NUMBER</li>
          <li>💡 tie for silver: RANK → next is 4th; DENSE_RANK → bronze</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LAG / LEAD</div>
        <ul>
          <li><b>LAG(col, n, default)</b> — n rows back · <b>LEAD</b> — n rows ahead</li>
          <li><b>Gap</b> — <code>d - LAG(d) OVER (PARTITION BY cust ORDER BY d)</code> (Asha 19 days)</li>
          <li>⚠ forget PARTITION BY → Ben compared with Asha (13 days)</li>
          <li>first row → NULL (or the default)</li>
          <li><b>MoM growth</b> — <code>(rev - LAG(rev)) / NULLIF(LAG(rev), 0)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running &amp; shares</div>
        <ul>
          <li><b>Running total</b> — <code>SUM(x) OVER (ORDER BY d)</code>: 880, 1380, 2530, 2650</li>
          <li><b>Moving avg</b> — <code>ROWS BETWEEN 1 PRECEDING AND CURRENT ROW</code></li>
          <li><b>% of group</b> — <code>100.0 * x / SUM(x) OVER (PARTITION BY g)</code></li>
          <li>⚠ <code>100 * int / int</code> → integer division → 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Frames</div>
        <ul>
          <li><b>Frame</b> — rows the aggregate sees: <code>ROWS|RANGE BETWEEN start AND end</code></li>
          <li><b>ROWS</b> — physical rows · <b>RANGE</b> — by value; ties (peers) together</li>
          <li><b>Default</b> — no ORDER BY: whole partition; with ORDER BY: start → current row <em>+ peers</em></li>
          <li>⚠ Sara's running sum includes Tom (325000) → ROWS + tiebreaker</li>
          <li>⚠ <b>LAST_VALUE</b> = "last so far" → frame to <code>UNBOUNDED FOLLOWING</code></li>
          <li>⚠ <code>ROWS 2 PRECEDING</code> ≠ 3 days with gaps → <code>RANGE INTERVAL '2 days'</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Distribution &amp; filtering</div>
        <ul>
          <li><b>NTILE(n)</b> — n near-equal buckets by count; early buckets get extras</li>
          <li><b>PERCENT_RANK</b> (rank − 1)/(n − 1) · <b>CUME_DIST</b> share of rows ≤ value</li>
          <li><b>Median</b> — <code>PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x)</code></li>
          <li>⚠ <b>Not in WHERE</b> → compute in CTE/subquery, filter outside</li>
          <li><b>QUALIFY</b> — Snowflake, BigQuery, Databricks, DuckDB (not PostgreSQL)</li>
          <li>⚠ WHERE before LAG changes what LAG sees</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic patterns</div>
        <ul>
          <li><b>Gaps &amp; islands</b> — <code>date − ROW_NUMBER()</code> is constant within a streak</li>
          <li>then <code>GROUP BY user, grp</code> → MIN, MAX, COUNT</li>
          <li>⚠ duplicate days break it → <code>SELECT DISTINCT</code> first</li>
          <li><b>Sessions</b> — LAG gap &gt; 30 min → flag 1; running SUM of flags = session id</li>
          <li><b>Dedupe / latest per key</b> — <code>ROW_NUMBER() … = 1</code></li>
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
      <div class="rm-item rm-done" data-target="sw-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Ties, frames, missing partitions</span></div></div>
      <div class="rm-item rm-done" data-target="sw-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Write-the-query drills</span></div></div>
    </div>
  </div>

  <h2 id="sw-why"><span class="num">01</span>The Problem Windows Solve</h2>
  <p>HR asks for a list of every employee with their salary <em>and</em> their department's average salary next to it, so they can see who is above or below. All results on this page come from PostgreSQL on the <code>shop</code> data:</p>
  <table class="tbl"><caption>employees</caption><tr><th>emp_id</th><th>name</th><th>dept</th><th>salary</th><th>manager_id</th></tr><tr><td>1</td><td>Ravi</td><td>Eng</td><td>120000</td><td>NULL</td></tr><tr><td>2</td><td>Sara</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>3</td><td>Tom</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>4</td><td>Uma</td><td>Sales</td><td>70000</td><td>1</td></tr><tr><td>5</td><td>Vik</td><td>Sales</td><td>65000</td><td>4</td></tr></table>
  <p>GROUP BY can compute the averages, but it squashes each department into one row. The names are gone:</p>
  <div class="fx" data-lang="sql">SELECT dept, ROUND(AVG(salary)) AS dept_avg
FROM employees
GROUP BY dept
ORDER BY dept;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>dept_avg</th></tr><tr><td>Eng</td><td>103333</td></tr><tr><td>Sales</td><td>67500</td></tr></table>
  <p>Asking for names and averages together is not allowed, because after grouping there is no single "name" for the Eng group:</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary, AVG(salary)
FROM employees
GROUP BY dept;</div>
  <div class="fx" data-lang="text">ERROR:  column "employees.name" must appear in the GROUP BY clause or be used in an aggregate function</div>
  <p>The old workaround: compute the averages in a subquery, then join them back to every employee. It works, but it is two passes over the table and a join, just to put one number on each row:</p>
  <div class="fx" data-lang="sql">SELECT e.name, e.dept, e.salary, ROUND(d.dept_avg) AS dept_avg
FROM employees e
JOIN (SELECT dept, AVG(salary) AS dept_avg
      FROM employees GROUP BY dept) d ON d.dept = e.dept
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th><th>dept_avg</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>103333</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>103333</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>103333</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>67500</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>67500</td></tr></table>
  <p>A <strong>window function</strong> does this directly. It computes a value from a set of related rows (the "window") and attaches it to each row, keeping every row.</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary,
       ROUND(AVG(salary) OVER (PARTITION BY dept)) AS dept_avg
FROM employees
ORDER BY emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th><th>dept_avg</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>103333</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>103333</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>103333</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>67500</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>67500</td></tr></table>
  <p>The only new part is <code>OVER (PARTITION BY dept)</code>. <code>AVG(salary)</code> on its own would be a normal aggregate. Adding <code>OVER (…)</code> turns it into a window function: "for this row, average the salaries of the rows in the same dept". Ravi's window is {Ravi, Sara, Tom}: (120000 + 95000 + 95000) / 3 = 103333. Uma's window is {Uma, Vik}: 67500. Five rows in, five rows out.</p>
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
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Board exam results. The school notice board shows one line per class: "10-A average 72" (that is GROUP BY). Each student's own marksheet shows their marks <em>and</em> "class average: 72" printed in the corner (that is a window function). Nobody's marksheet is merged with anyone else's.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>window function</strong> is a function followed by <code>OVER (…)</code>. For each row it computes a result over a set of rows related to that row (its <strong>window</strong>), and returns one value per row. Unlike GROUP BY, the number of rows does not change.</p>
  </div>
  <p>Where it matters: ML feature engineering ("customer's spend vs their city's average", "days since last purchase"), finance reports (running balances), product analytics (retention streaks, sessions). In interviews, "top N per group", "second highest salary", "consecutive days" and "running total" are all window questions.</p>

  <h2 id="sw-over"><span class="num">02</span>OVER, PARTITION BY, ORDER BY</h2>
  <p>Everything inside the brackets after OVER describes the window. There are three optional parts, and each changes the answer in a predictable way:</p>
  <div class="fx" data-lang="sql">function_name(...) OVER (
  PARTITION BY dept        -- split rows into independent groups
  ORDER BY salary DESC     -- order rows inside each group
  ROWS BETWEEN ...         -- frame: which rows around me to use (section 06)
)</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A Mumbai local train. <code>OVER ()</code> is the whole train. <code>PARTITION BY</code> splits it into coaches: you only look at people in your coach. <code>ORDER BY</code> lines up the people in each coach by seat number, so "the person before me" and "everyone up to me" start to mean something.</p>
  </div>
  <p>Here all three are used side by side on the same rows, so you can compare:</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary,
  COUNT(*)    OVER ()                                     AS n_all,
  COUNT(*)    OVER (PARTITION BY dept)                    AS n_dept,
  SUM(salary) OVER (PARTITION BY dept ORDER BY salary DESC, emp_id) AS running_dept
FROM employees
ORDER BY dept, salary DESC, emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th><th>n_all</th><th>n_dept</th><th>running_dept</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>5</td><td>3</td><td>120000</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>5</td><td>3</td><td>215000</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>5</td><td>3</td><td>310000</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>5</td><td>2</td><td>70000</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>5</td><td>2</td><td>135000</td></tr></table>
  <table class="tbl"><caption>Trace: what each row's window contains</caption>
    <tr><th>row</th><th>OVER ()</th><th>PARTITION BY dept</th><th>PARTITION BY dept ORDER BY salary DESC</th></tr>
    <tr><td>Ravi</td><td>all 5 → 5</td><td>Ravi, Sara, Tom → 3</td><td>Ravi → 120000</td></tr>
    <tr><td>Sara</td><td>all 5 → 5</td><td>Ravi, Sara, Tom → 3</td><td>Ravi, Sara → 215000</td></tr>
    <tr><td>Tom</td><td>all 5 → 5</td><td>Ravi, Sara, Tom → 3</td><td>Ravi, Sara, Tom → 310000</td></tr>
    <tr><td>Uma</td><td>all 5 → 5</td><td>Uma, Vik → 2</td><td>Uma → 70000</td></tr>
    <tr><td>Vik</td><td>all 5 → 5</td><td>Uma, Vik → 2</td><td>Uma, Vik → 135000</td></tr>
  </table>
  <p><code>n_all</code>: empty OVER means the window is every row in the result, so each row shows 5. <code>n_dept</code>: PARTITION BY restarts the count per department. <code>running_dept</code>: adding ORDER BY changes SUM from "whole group" to "from the start of my group up to me", a running total. (The extra <code>emp_id</code> in ORDER BY breaks the Sara/Tom tie; section 06 explains why that matters.)</p>
  <h3>When do windows run?</h3>
  <div class="flow"><span>FROM / JOIN</span><span>WHERE</span><span>GROUP BY / HAVING</span><span>Window functions</span><span>SELECT list</span><span>ORDER BY / LIMIT</span></div>
  <p>Windows are computed <strong>after</strong> WHERE and GROUP BY. Two consequences. First, WHERE cannot use them (section 08). Second, a window can work on grouped results, so an aggregate can sit inside a window function:</p>
  <div class="fx" data-lang="sql">SELECT dept,
       SUM(salary)                                  AS dept_total,
       SUM(SUM(salary)) OVER ()                     AS company_total,
       ROUND(100.0 * SUM(salary) / SUM(SUM(salary)) OVER (), 1) AS pct
FROM employees
GROUP BY dept
ORDER BY dept;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>dept_total</th><th>company_total</th><th>pct</th></tr><tr><td>Eng</td><td>310000</td><td>445000</td><td>69.7</td></tr><tr><td>Sales</td><td>135000</td><td>445000</td><td>30.3</td></tr></table>
  <p>GROUP BY first produces 2 rows (Eng 310000, Sales 135000). Then <code>SUM(SUM(salary)) OVER ()</code> adds the two group totals across all rows: 445000. The inner SUM is the GROUP BY aggregate; the outer SUM … OVER () is the window.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Partition</strong>: a group of rows sharing the PARTITION BY values; windows never cross partitions. <strong>Window ORDER BY</strong>: the order inside a partition, independent of the query's final ORDER BY. <code>WINDOW w AS (…)</code> names a window spec so several functions can reuse it (used in section 06).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The ORDER BY inside OVER does not sort the output. Rows can come back in any order unless the query also ends with its own ORDER BY.</p>
  </div>

  <h2 id="sw-rank"><span class="num">03</span>Ranking &amp; Top-N</h2>
  <p>"Rank employees by salary" sounds simple until two people earn the same. Sara and Tom both earn 95,000. Should they share 2nd place? Should the next person be 3rd or 4th? SQL gives three ranking functions, and they differ <em>only</em> in how they treat ties.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school sports day. Two runners tie for silver. <strong>RANK</strong>: both get silver, and the next runner is 4th (no bronze). <strong>DENSE_RANK</strong>: both get silver, the next gets bronze. <strong>ROW_NUMBER</strong>: the teacher tosses a coin so everyone gets a different place.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT name, salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
  RANK()       OVER (ORDER BY salary DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense
FROM employees
ORDER BY salary DESC, emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>row_num</th><th>rnk</th><th>dense</th></tr><tr><td>Ravi</td><td>120000</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Sara</td><td>95000</td><td>2</td><td>2</td><td>2</td></tr><tr><td>Tom</td><td>95000</td><td>3</td><td>2</td><td>2</td></tr><tr><td>Uma</td><td>70000</td><td>4</td><td>4</td><td>3</td></tr><tr><td>Vik</td><td>65000</td><td>5</td><td>5</td><td>4</td></tr></table>
  <table class="tbl"><caption>Trace: walking down the salary list</caption>
    <tr><th>row</th><th>salary</th><th>ROW_NUMBER</th><th>RANK</th><th>DENSE_RANK</th></tr>
    <tr><td>Ravi</td><td>120000</td><td>1</td><td>1</td><td>1 (new value)</td></tr>
    <tr><td>Sara</td><td>95000</td><td>2</td><td>2</td><td>2 (new value)</td></tr>
    <tr><td>Tom</td><td>95000</td><td>3 (always +1)</td><td>2 (tie: same)</td><td>2 (tie: same)</td></tr>
    <tr><td>Uma</td><td>70000</td><td>4</td><td>4 (= rows before + 1)</td><td>3 (next value)</td></tr>
    <tr><td>Vik</td><td>65000</td><td>5</td><td>5</td><td>4</td></tr>
  </table>
  <p>Rule of thumb: RANK = 1 + number of rows strictly ahead of me. DENSE_RANK = 1 + number of distinct values ahead of me. ROW_NUMBER = my position in the list.</p>
  <h3>Top-N per group</h3>
  <p>"Second-highest salary in each department" is the classic interview question. Step 1, rank inside each department:</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary,
       DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
FROM employees
ORDER BY dept, rnk, name;</div>
  <table class="tbl out"><caption>Step 1: rank within dept</caption><tr><th>name</th><th>dept</th><th>salary</th><th>rnk</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>1</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>2</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>2</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>1</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>2</td></tr></table>
  <p>Step 2, keep rank 2. A window value cannot be filtered in the same SELECT's WHERE (section 08), so the ranking goes in a CTE and the filter outside:</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT name, dept, salary,
         DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT dept, name, salary
FROM ranked
WHERE rnk = 2
ORDER BY dept, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>name</th><th>salary</th></tr><tr><td>Eng</td><td>Sara</td><td>95000</td></tr><tr><td>Eng</td><td>Tom</td><td>95000</td></tr><tr><td>Sales</td><td>Vik</td><td>65000</td></tr></table>
  <p>DENSE_RANK returns both Sara and Tom, because both hold the second-highest <em>value</em>. If the question means "exactly 2 people per department", use ROW_NUMBER with a tie-breaker:</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT name, dept, salary,
         ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, emp_id) AS rn
  FROM employees
)
SELECT dept, name, salary, rn
FROM ranked
WHERE rn &lt;= 2
ORDER BY dept, rn;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>name</th><th>salary</th><th>rn</th></tr><tr><td>Eng</td><td>Ravi</td><td>120000</td><td>1</td></tr><tr><td>Eng</td><td>Sara</td><td>95000</td><td>2</td></tr><tr><td>Sales</td><td>Uma</td><td>70000</td><td>1</td></tr><tr><td>Sales</td><td>Vik</td><td>65000</td><td>2</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ROW_NUMBER</strong>: unique 1, 2, 3… <strong>RANK</strong>: ties share a number, then numbers skip (1, 2, 2, 4). <strong>DENSE_RANK</strong>: ties share, no skip (1, 2, 2, 3). All three need ORDER BY inside OVER.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>ROW_NUMBER on tied values is <strong>non-deterministic</strong>: Sara and Tom may swap between runs, so a "top 2" report may change by itself. Always add a unique tie-breaker: <code>ORDER BY salary DESC, emp_id</code>. Say which function you chose and why in an interview; that is what is being graded.</p>
  </div>

  <h2 id="sw-lag"><span class="num">04</span>LAG &amp; LEAD</h2>
  <p>"How many days passed between each customer's orders?" needs each row to see the <em>previous</em> row. Plain SQL works row by row and cannot look sideways; the old trick was a self-join on "the latest earlier date", which is slow and fiddly.</p>
  <p><code>LAG(col)</code> returns the value of <code>col</code> from the previous row in the window. <code>LEAD(col)</code> returns it from the next row. The window's ORDER BY defines "previous" and "next"; PARTITION BY keeps the lookup inside one customer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Reading your electricity bill: this month's units minus last month's units. LAG is "last month's reading" printed on the same line as this month's. LEAD would be next month's reading.</p>
  </div>
  <table class="tbl"><caption>orders</caption><tr><th>order_id</th><th>customer_id</th><th>order_date</th><th>status</th></tr><tr><td>100</td><td>1</td><td>2024-05-01</td><td>delivered</td></tr><tr><td>101</td><td>1</td><td>2024-05-20</td><td>delivered</td></tr><tr><td>102</td><td>2</td><td>2024-06-02</td><td>cancelled</td></tr><tr><td>103</td><td>3</td><td>2024-06-15</td><td>delivered</td></tr><tr><td>104</td><td>3</td><td>2024-07-01</td><td>pending</td></tr></table>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date,
  LAG(order_date)  OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date,
  LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS next_date,
  order_date - LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS days_since_prev
FROM orders
ORDER BY customer_id, order_date;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th><th>prev_date</th><th>next_date</th><th>days_since_prev</th></tr><tr><td>1</td><td>100</td><td>2024-05-01</td><td>NULL</td><td>2024-05-20</td><td>NULL</td></tr><tr><td>1</td><td>101</td><td>2024-05-20</td><td>2024-05-01</td><td>NULL</td><td>19</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td><td>NULL</td><td>NULL</td><td>NULL</td></tr><tr><td>3</td><td>103</td><td>2024-06-15</td><td>NULL</td><td>2024-07-01</td><td>NULL</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td><td>2024-06-15</td><td>NULL</td><td>16</td></tr></table>
  <table class="tbl"><caption>Trace: LAG inside each customer's partition</caption>
    <tr><th>partition</th><th>rows in date order</th><th>LAG for each</th></tr>
    <tr><td>customer 1</td><td>100 (05-01), 101 (05-20)</td><td>NULL (nothing before), 05-01</td></tr>
    <tr><td>customer 2</td><td>102 (06-02)</td><td>NULL</td></tr>
    <tr><td>customer 3</td><td>103 (06-15), 104 (07-01)</td><td>NULL, 06-15</td></tr>
  </table>
  <p>Subtracting two dates in PostgreSQL gives a number of days, so <code>days_since_prev</code> is 19 for Asha and 16 for Chen. The first row of each partition has no previous row, so LAG returns NULL, and NULL minus a date is NULL. LEAD mirrors it: the last row of each partition has no next row.</p>
  <p>Now forget the PARTITION BY:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date,
  order_date - LAG(order_date) OVER (ORDER BY order_date) AS days_since_prev
FROM orders
ORDER BY order_date;</div>
  <table class="tbl out"><caption>Without PARTITION BY: wrong</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th><th>days_since_prev</th></tr><tr><td>1</td><td>100</td><td>2024-05-01</td><td>NULL</td></tr><tr><td>1</td><td>101</td><td>2024-05-20</td><td>19</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td><td>13</td></tr><tr><td>3</td><td>103</td><td>2024-06-15</td><td>13</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td><td>16</td></tr></table>
  <p>Ben's order (102) is now compared with Asha's order 101: "13 days since previous" is meaningless, it is a different customer. The query runs without error.</p>
  <p>LAG takes two optional arguments: how many rows back, and a default for "no such row":</p>
  <div class="fx" data-lang="sql">SELECT name, salary,
  LAG(salary, 1, 0)  OVER (ORDER BY salary DESC, emp_id) AS prev_salary,
  LAG(salary, 2)     OVER (ORDER BY salary DESC, emp_id) AS two_back,
  LEAD(name)         OVER (ORDER BY salary DESC, emp_id) AS next_lower_paid
FROM employees
ORDER BY salary DESC, emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>prev_salary</th><th>two_back</th><th>next_lower_paid</th></tr><tr><td>Ravi</td><td>120000</td><td>0</td><td>NULL</td><td>Sara</td></tr><tr><td>Sara</td><td>95000</td><td>120000</td><td>NULL</td><td>Tom</td></tr><tr><td>Tom</td><td>95000</td><td>95000</td><td>120000</td><td>Uma</td></tr><tr><td>Uma</td><td>70000</td><td>95000</td><td>95000</td><td>Vik</td></tr><tr><td>Vik</td><td>65000</td><td>70000</td><td>95000</td><td>NULL</td></tr></table>
  <p><code>LAG(salary, 1, 0)</code> gives 0 instead of NULL on the first row. <code>LAG(salary, 2)</code> looks two rows back. <code>LEAD(name)</code> shows who comes next in the ordering.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>LAG(expr, offset = 1, default = NULL)</code>: value of <code>expr</code> <em>offset</em> rows before the current row in the window order. <code>LEAD</code>: <em>offset</em> rows after. They ignore any frame clause.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>PARTITION BY</code> compares rows from different entities. Also decide what the first row's NULL means: keep it, drop it, or <code>COALESCE</code> it, but do not let it silently fall out of an average.</p>
  </div>

  <h2 id="sw-run"><span class="num">05</span>Running Totals &amp; Shares</h2>
  <p>A finance dashboard needs "revenue so far this year" on each day, the change from the previous day, and a smoothed trend line. All three come from the same daily table with different windows. First the daily revenue (cancelled orders excluded):</p>
  <div class="fx" data-lang="sql">SELECT o.order_date, SUM(oi.qty * oi.unit_price) AS revenue
FROM orders o
JOIN order_items oi USING (order_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY o.order_date
ORDER BY o.order_date;</div>
  <table class="tbl out"><caption>daily</caption><tr><th>order_date</th><th>revenue</th></tr><tr><td>2024-05-01</td><td>880.00</td></tr><tr><td>2024-05-20</td><td>500.00</td></tr><tr><td>2024-06-15</td><td>1150.00</td></tr><tr><td>2024-07-01</td><td>120.00</td></tr></table>
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT o.order_date, SUM(oi.qty * oi.unit_price) AS revenue
  FROM orders o
  JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY o.order_date
)
SELECT order_date, revenue,
  SUM(revenue) OVER (ORDER BY order_date)            AS running_total,
  revenue - LAG(revenue) OVER (ORDER BY order_date)  AS change,
  ROUND(AVG(revenue) OVER (ORDER BY order_date
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) AS moving_avg_2
FROM daily
ORDER BY order_date;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_date</th><th>revenue</th><th>running_total</th><th>change</th><th>moving_avg_2</th></tr><tr><td>2024-05-01</td><td>880.00</td><td>880.00</td><td>NULL</td><td>880.00</td></tr><tr><td>2024-05-20</td><td>500.00</td><td>1380.00</td><td>-380.00</td><td>690.00</td></tr><tr><td>2024-06-15</td><td>1150.00</td><td>2530.00</td><td>650.00</td><td>825.00</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>2650.00</td><td>-1030.00</td><td>635.00</td></tr></table>
  <p>Three windows, one query. <code>SUM(revenue) OVER (ORDER BY order_date)</code> is a <strong>running total</strong>: with ORDER BY, each row's window is "from the first row up to me". <code>revenue - LAG(revenue)</code> is the day-on-day change. <code>AVG(…) ROWS BETWEEN 1 PRECEDING AND CURRENT ROW</code> is a <strong>moving average</strong> over the previous row and the current row.</p>
  <table class="tbl"><caption>Trace: how the window moves down the rows</caption>
    <tr><th>current row</th><th>running total window</th><th>sum</th><th>moving-avg window</th><th>avg</th></tr>
    <tr><td>05-01</td><td>880</td><td>880</td><td>880</td><td>880</td></tr>
    <tr><td>05-20</td><td>880, 500</td><td>1380</td><td>880, 500</td><td>690</td></tr>
    <tr><td>06-15</td><td>880, 500, 1150</td><td>2530</td><td>500, 1150</td><td>825</td></tr>
    <tr><td>07-01</td><td>880, 500, 1150, 120</td><td>2650</td><td>1150, 120</td><td>635</td></tr>
  </table>
  <p>The running window grows by one row each step; the moving window slides, always holding exactly two rows (one on the first row, where nothing precedes it).</p>
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
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket scoreboard. The total after each over is a running total. "Run rate in the last 2 overs" is a moving average: the window slides forward one over at a time.</p>
  </div>
  <h3>Percent of total</h3>
  <p>"What share of their department's salary bill does each person take?" <code>SUM(salary) OVER (PARTITION BY dept)</code> puts the department total on every row, so the share is a single division per row.</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary,
  SUM(salary) OVER (PARTITION BY dept) AS dept_total,
  ROUND(100.0 * salary / SUM(salary) OVER (PARTITION BY dept), 1) AS pct_of_dept
FROM employees
ORDER BY dept, salary DESC, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th><th>dept_total</th><th>pct_of_dept</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>310000</td><td>38.7</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>310000</td><td>30.6</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>310000</td><td>30.6</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>135000</td><td>51.9</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>135000</td><td>48.1</td></tr></table>
  <p>Ravi: 100 × 120000 / 310000 = 38.7. The <code>100.0</code> matters. With integers only, SQL does integer division and throws away the fraction:</p>
  <div class="fx" data-lang="sql">SELECT 95000 / 310000 AS int_division, ROUND(100.0 * 95000 / 310000, 1) AS pct;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>int_division</th><th>pct</th></tr><tr><td>0</td><td>30.6</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Running (cumulative) total</strong>: SUM over all rows from the partition start to the current row. <strong>Moving average</strong>: AVG over a fixed-size frame that slides with the current row.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> means 6 <em>rows</em>, not 6 <em>days</em>. Days with no sales have no row, so the window silently reaches further back in time. Section 06 shows the fix.</p>
  </div>

  <h2 id="sw-frame"><span class="num">06</span>Frames: ROWS vs RANGE</h2>
  <p>Section 05 used a frame to say "previous row and current row". Frames also explain two famous surprises: running totals that jump on ties, and LAST_VALUE that returns the current row. To understand them, you need to know what frame you get when you do not write one.</p>
  <p>A <strong>frame</strong> is the part of the partition an aggregate actually sees for the current row: <code>{ROWS | RANGE} BETWEEN start AND end</code>, where start and end are <code>UNBOUNDED PRECEDING</code>, <code>n PRECEDING</code>, <code>CURRENT ROW</code>, <code>n FOLLOWING</code> or <code>UNBOUNDED FOLLOWING</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank queue with token numbers. <strong>ROWS</strong>: "you and the 2 people physically ahead of you". <strong>RANGE</strong>: "everyone whose token time is within 2 minutes of yours", so everyone who arrived in the same minute as you comes along, however many there are.</p>
  </div>
  <table class="tbl">
    <tr><th>Window has…</th><th>Default frame</th></tr>
    <tr><td>No ORDER BY</td><td>Whole partition</td></tr>
    <tr><td>ORDER BY</td><td><code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>: start up to me <em>and my peers</em></td></tr>
  </table>
  <p><strong>Peers</strong> are rows with the same ORDER BY value. Watch the default on Sara and Tom, who tie on salary:</p>
  <div class="fx" data-lang="sql">SELECT name, salary,
  SUM(salary) OVER (ORDER BY salary) AS range_default,
  SUM(salary) OVER (ORDER BY salary
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rows_sum,
  SUM(salary) OVER (ORDER BY salary, emp_id
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rows_tiebreak
FROM employees
ORDER BY salary, emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>range_default</th><th>rows_sum</th><th>rows_tiebreak</th></tr><tr><td>Vik</td><td>65000</td><td>65000</td><td>65000</td><td>65000</td></tr><tr><td>Uma</td><td>70000</td><td>135000</td><td>135000</td><td>135000</td></tr><tr><td>Sara</td><td>95000</td><td>325000</td><td>230000</td><td>230000</td></tr><tr><td>Tom</td><td>95000</td><td>325000</td><td>325000</td><td>325000</td></tr><tr><td>Ravi</td><td>120000</td><td>445000</td><td>445000</td><td>445000</td></tr></table>
  <table class="tbl"><caption>Trace: the frame for Sara's row</caption>
    <tr><th>column</th><th>frame</th><th>sum</th></tr>
    <tr><td>range_default</td><td>all rows with salary ≤ 95000: Vik, Uma, Sara <strong>and Tom</strong></td><td>325000</td></tr>
    <tr><td>rows_sum</td><td>physical rows up to Sara: Vik, Uma, Sara</td><td>230000</td></tr>
    <tr><td>rows_tiebreak</td><td>same, but Sara-before-Tom is now guaranteed by emp_id</td><td>230000</td></tr>
  </table>
  <p>The default RANGE frame treats Sara and Tom as one step, so both show 325000. A row-by-row running total needs ROWS, and ROWS is only repeatable if the ORDER BY has a unique tie-breaker (without it, Sara and Tom may come in either order).</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <g font-size="10">
    <text x="347" y="18" text-anchor="middle" class="tg">current row</text><text x="439" y="18" text-anchor="middle" class="tm">peer</text>
    <text x="10" y="52" class="tm">ORDER BY salary</text>
    <rect x="120" y="28" width="86" height="40" rx="5" class="fs"/><text x="163" y="44" text-anchor="middle">Vik</text><text x="163" y="60" text-anchor="middle" font-weight="bold">65000</text><rect x="212" y="28" width="86" height="40" rx="5" class="fs"/><text x="255" y="44" text-anchor="middle">Uma</text><text x="255" y="60" text-anchor="middle" font-weight="bold">70000</text><rect x="304" y="28" width="86" height="40" rx="5" class="fg sg"/><text x="347" y="44" text-anchor="middle">Sara</text><text x="347" y="60" text-anchor="middle" font-weight="bold">95000</text><rect x="396" y="28" width="86" height="40" rx="5" class="fv"/><text x="439" y="44" text-anchor="middle">Tom</text><text x="439" y="60" text-anchor="middle" font-weight="bold">95000</text><rect x="488" y="28" width="86" height="40" rx="5" class="fs"/><text x="531" y="44" text-anchor="middle">Ravi</text><text x="531" y="60" text-anchor="middle" font-weight="bold">120000</text>
    <text x="10" y="99">ROWS</text>
    <rect x="120" y="86" width="270" height="20" rx="4" class="ft st"/><text x="255" y="100" text-anchor="middle">up to this row → 230000</text>
    <text x="10" y="129">RANGE (default)</text>
    <rect x="120" y="116" width="362" height="20" rx="4" class="fr sr"/><text x="301" y="130" text-anchor="middle">up to this value, incl. Tom → 325000</text>
    </g>
  </svg><figcaption>RANGE treats Sara and Tom as one step because their ORDER BY values tie.</figcaption></figure>
  <h3>RANGE with an interval: "last 3 days", not "last 3 rows"</h3>
  <p>A fitness app stores daily step counts, but the user skipped 3rd and 4th June:</p>
  <table class="tbl"><caption>steps</caption><tr><th>day</th><th>steps</th></tr><tr><td>2024-06-01</td><td>1000</td></tr><tr><td>2024-06-02</td><td>2000</td></tr><tr><td>2024-06-05</td><td>3000</td></tr><tr><td>2024-06-06</td><td>4000</td></tr></table>
  <div class="fx" data-lang="sql">SELECT day, steps,
  SUM(steps) OVER (ORDER BY day
       ROWS  BETWEEN 2 PRECEDING AND CURRENT ROW)                AS last_3_rows,
  SUM(steps) OVER (ORDER BY day
       RANGE BETWEEN INTERVAL '2 days' PRECEDING AND CURRENT ROW) AS last_3_days
FROM steps
ORDER BY day;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>steps</th><th>last_3_rows</th><th>last_3_days</th></tr><tr><td>2024-06-01</td><td>1000</td><td>1000</td><td>1000</td></tr><tr><td>2024-06-02</td><td>2000</td><td>3000</td><td>3000</td></tr><tr><td>2024-06-05</td><td>3000</td><td>6000</td><td>3000</td></tr><tr><td>2024-06-06</td><td>4000</td><td>9000</td><td>7000</td></tr></table>
  <p>On 06-05, <code>ROWS 2 PRECEDING</code> takes the two previous <em>rows</em>, 06-01 and 06-02, and reports 6000 for a "3-day" window that really spans 5 days. <code>RANGE INTERVAL '2 days' PRECEDING</code> takes rows whose <em>date</em> is within 2 days (06-03 to 06-05), which is only 06-05 itself: 3000. On 06-06 it holds 06-05 and 06-06: 7000.</p>
  <h3>The LAST_VALUE trap</h3>
  <p>"Show each employee with the top-paid and lowest-paid person in their department." FIRST_VALUE works, but LAST_VALUE seems broken:</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary,
  FIRST_VALUE(name) OVER w AS top_paid,
  LAST_VALUE(name)  OVER w AS lowest_paid_wrong,
  LAST_VALUE(name)  OVER (w ROWS BETWEEN UNBOUNDED PRECEDING
                              AND UNBOUNDED FOLLOWING) AS lowest_paid
FROM employees
WINDOW w AS (PARTITION BY dept ORDER BY salary DESC, emp_id)
ORDER BY dept, salary DESC, emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th><th>top_paid</th><th>lowest_paid_wrong</th><th>lowest_paid</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>Ravi</td><td>Ravi</td><td>Tom</td></tr><tr><td>Sara</td><td>Eng</td><td>95000</td><td>Ravi</td><td>Sara</td><td>Tom</td></tr><tr><td>Tom</td><td>Eng</td><td>95000</td><td>Ravi</td><td>Tom</td><td>Tom</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>Uma</td><td>Uma</td><td>Vik</td></tr><tr><td>Vik</td><td>Sales</td><td>65000</td><td>Uma</td><td>Vik</td><td>Vik</td></tr></table>
  <p>The default frame ends at the current row, so the "last" row of Sara's frame is Sara herself: LAST_VALUE means "last so far". Extending the frame to <code>UNBOUNDED FOLLOWING</code> makes it see the whole partition, and Tom (lowest in Eng) appears on every Eng row. <code>WINDOW w AS (…)</code> at the bottom names the shared window once; <code>OVER (w ROWS …)</code> reuses it and adds a frame.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ROWS</strong> frame: bounds counted in physical rows. <strong>RANGE</strong> frame: bounds measured in ORDER BY values; peers are always included together. PostgreSQL also supports <strong>GROUPS</strong>: bounds counted in peer groups.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Any time you use SUM/AVG/LAST_VALUE with ORDER BY and no explicit frame, you are using RANGE … CURRENT ROW. With ties or with LAST_VALUE, that is usually not what you meant. Write the frame explicitly.</p>
  </div>

  <h2 id="sw-dist"><span class="num">07</span>NTILE &amp; Distribution</h2>
  <p>Marketing wants to split customers into 4 equal groups by spend (quartiles) and target the top group. Analysts want to know "what percentile is this salary?" These are distribution questions: where does a row sit within the whole spread?</p>
  <ul>
    <li><code>NTILE(n)</code> splits the ordered rows into <em>n</em> buckets of (nearly) equal size and returns the bucket number.</li>
    <li><code>PERCENT_RANK()</code> = (rank − 1) / (rows − 1): 0 for the lowest, 1 for the highest.</li>
    <li><code>CUME_DIST()</code> = (rows with value ≤ mine) / rows: the share of rows at or below me.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher seating 30 students in 3 rows by marks: top 10 in row 1, next 10 in row 2. That is NTILE(3). "You scored better than 80% of the class" is a percentile, like CUME_DIST.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT name, salary,
  NTILE(2) OVER (ORDER BY salary DESC) AS half,
  RANK()   OVER (ORDER BY salary)      AS rnk_asc,
  ROUND(PERCENT_RANK() OVER (ORDER BY salary)::numeric, 2) AS pct_rank,
  ROUND(CUME_DIST()    OVER (ORDER BY salary)::numeric, 2) AS cume_dist
FROM employees
ORDER BY salary DESC, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>half</th><th>rnk_asc</th><th>pct_rank</th><th>cume_dist</th></tr><tr><td>Ravi</td><td>120000</td><td>1</td><td>5</td><td>1.00</td><td>1.00</td></tr><tr><td>Sara</td><td>95000</td><td>1</td><td>3</td><td>0.50</td><td>0.80</td></tr><tr><td>Tom</td><td>95000</td><td>1</td><td>3</td><td>0.50</td><td>0.80</td></tr><tr><td>Uma</td><td>70000</td><td>2</td><td>2</td><td>0.25</td><td>0.40</td></tr><tr><td>Vik</td><td>65000</td><td>2</td><td>1</td><td>0.00</td><td>0.20</td></tr></table>
  <table class="tbl"><caption>Trace: the formulas for Sara (5 rows, ascending ranks)</caption>
    <tr><th>measure</th><th>working</th><th>value</th></tr>
    <tr><td>RANK ascending</td><td>Vik, Uma below her</td><td>3</td></tr>
    <tr><td>PERCENT_RANK</td><td>(3 − 1) / (5 − 1)</td><td>0.50</td></tr>
    <tr><td>CUME_DIST</td><td>rows ≤ 95000: Vik, Uma, Sara, Tom = 4 of 5</td><td>0.80</td></tr>
    <tr><td>NTILE(2) by salary DESC</td><td>5 rows into 2 buckets → sizes 3, 2</td><td>bucket 1</td></tr>
  </table>
  <p>NTILE fills buckets by <em>count</em>, and earlier buckets get the extra rows. With 3 buckets the sizes are 2, 2, 1, and the tie between Sara and Tom is split:</p>
  <div class="fx" data-lang="sql">SELECT name, salary, NTILE(3) OVER (ORDER BY salary DESC, emp_id) AS bucket
FROM employees
ORDER BY salary DESC, emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>bucket</th></tr><tr><td>Ravi</td><td>120000</td><td>1</td></tr><tr><td>Sara</td><td>95000</td><td>1</td></tr><tr><td>Tom</td><td>95000</td><td>2</td></tr><tr><td>Uma</td><td>70000</td><td>2</td></tr><tr><td>Vik</td><td>65000</td><td>3</td></tr></table>
  <p>For the median, use the ordered-set aggregate <code>PERCENTILE_CONT</code>. It is an aggregate (one row per group), not a window function in PostgreSQL:</p>
  <div class="fx" data-lang="sql">SELECT dept,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary,
  ROUND(AVG(salary)) AS avg_salary
FROM employees
GROUP BY dept
ORDER BY dept;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>median_salary</th><th>avg_salary</th></tr><tr><td>Eng</td><td>95000</td><td>103333</td></tr><tr><td>Sales</td><td>67500</td><td>67500</td></tr></table>
  <p>Eng's median is 95000 (the middle of 95000, 95000, 120000) while its mean is 103333, pulled up by Ravi. Sales has two values, so <code>PERCENTILE_CONT</code> interpolates: (65000 + 70000) / 2 = 67500.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>NTILE(n)</strong>: bucket number 1…n of equal-count buckets. <strong>PERCENT_RANK</strong>: relative rank from 0 to 1. <strong>CUME_DIST</strong>: cumulative distribution, from 1/n to 1. <strong>PERCENTILE_CONT(p)</strong>: interpolated value at fraction p.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>NTILE splits by row count, so equal values can land in different buckets (Sara in 1, Tom in 2 above). If ties must stay together, bucket on PERCENT_RANK or CUME_DIST thresholds instead.</p>
  </div>

  <h2 id="sw-where"><span class="num">08</span>Filtering on a Window</h2>
  <p>You have ranked employees; now you want only the top one. The natural move is to filter in WHERE. It fails:</p>
  <div class="fx" data-lang="sql">SELECT name, salary
FROM employees
WHERE ROW_NUMBER() OVER (ORDER BY salary DESC) = 1;</div>
  <div class="fx" data-lang="text">ERROR:  window functions are not allowed in WHERE</div>
  <p>Using the alias does not help either:</p>
  <div class="fx" data-lang="sql">SELECT name, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn
FROM employees
WHERE rn = 1;</div>
  <div class="fx" data-lang="text">ERROR:  column "rn" does not exist</div>
  <p>Recall the order of work from section 02: FROM → WHERE → GROUP BY → HAVING → <strong>windows</strong> → SELECT. When WHERE runs, window values do not exist yet, and SELECT aliases are created even later.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A college cannot shortlist "the top rank holder" at the admission-form stage, because ranks are only published after the exam. First publish ranks (compute the window), then shortlist (filter).</p>
  </div>
  <p><strong>Fix</strong>: compute the window in a subquery or CTE, then filter in the outer query, where it is just an ordinary column. Employees above their department's average:</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary, ROUND(dept_avg) AS dept_avg
FROM (SELECT e.*,
             AVG(salary) OVER (PARTITION BY dept) AS dept_avg
      FROM employees e) AS t
WHERE salary &gt; dept_avg
ORDER BY emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th><th>dept_avg</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td><td>103333</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td><td>67500</td></tr></table>
  <p>The inner query adds <code>dept_avg</code> to every row; the outer WHERE compares two plain columns. Snowflake, BigQuery, Databricks and DuckDB add a <code>QUALIFY</code> clause, a WHERE that runs after windows. PostgreSQL does not have it. Tested in DuckDB:</p>
  <div class="fx" data-lang="sql">SELECT name, dept, salary
FROM employees
QUALIFY ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) = 1
ORDER BY dept;</div>
  <table class="tbl out"><caption>Result (DuckDB)</caption><tr><th>name</th><th>dept</th><th>salary</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td></tr></table>
  <h3>WHERE changes what the window sees</h3>
  <p>Because WHERE runs first, it removes rows before the window looks at them. Compare "previous order" over all orders with the same window after filtering to delivered ones:</p>
  <div class="fx" data-lang="sql">SELECT order_id, order_date, status,
  LAG(order_id) OVER (ORDER BY order_date) AS prev_order
FROM orders
ORDER BY order_date;</div>
  <table class="tbl out"><caption>All orders</caption><tr><th>order_id</th><th>order_date</th><th>status</th><th>prev_order</th></tr><tr><td>100</td><td>2024-05-01</td><td>delivered</td><td>NULL</td></tr><tr><td>101</td><td>2024-05-20</td><td>delivered</td><td>100</td></tr><tr><td>102</td><td>2024-06-02</td><td>cancelled</td><td>101</td></tr><tr><td>103</td><td>2024-06-15</td><td>delivered</td><td>102</td></tr><tr><td>104</td><td>2024-07-01</td><td>pending</td><td>103</td></tr></table>
  <div class="fx" data-lang="sql">SELECT order_id, order_date, status,
  LAG(order_id) OVER (ORDER BY order_date) AS prev_order
FROM orders
WHERE status = 'delivered'
ORDER BY order_date;</div>
  <table class="tbl out"><caption>WHERE status = 'delivered' first</caption><tr><th>order_id</th><th>order_date</th><th>status</th><th>prev_order</th></tr><tr><td>100</td><td>2024-05-01</td><td>delivered</td><td>NULL</td></tr><tr><td>101</td><td>2024-05-20</td><td>delivered</td><td>100</td></tr><tr><td>103</td><td>2024-06-15</td><td>delivered</td><td>101</td></tr></table>
  <p>For order 103, the previous order is 102 in the first result but 101 in the second, because 102 (cancelled) was removed before LAG ran. Neither is wrong; they answer different questions ("previous order" vs "previous delivered order"). Decide which one you mean.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If you need "previous order" but only want to <em>show</em> delivered rows, compute LAG in a CTE over all rows, then filter on status outside.</p>
  </div>

  <h2 id="sw-pat"><span class="num">09</span>Classic Patterns</h2>
  <p>A handful of patterns cover most interview questions on windows. These use two small time-series tables, created in a copy of the database:</p>
  <div class="fx" data-lang="sql">CREATE TABLE logins (user_id int, login_date date);
INSERT INTO logins VALUES
 (1,'2024-06-01'),(1,'2024-06-02'),(1,'2024-06-03'),(1,'2024-06-05'),(1,'2024-06-06'),
 (2,'2024-06-01'),(2,'2024-06-03'),(2,'2024-06-04'),(2,'2024-06-05'),(2,'2024-06-06');</div>
  <div class="fx" data-lang="sql">CREATE TABLE clicks (user_id int, ts timestamp);
INSERT INTO clicks VALUES
 (1,'2024-06-01 09:00'),(1,'2024-06-01 09:10'),(1,'2024-06-01 09:25'),
 (1,'2024-06-01 11:00'),(1,'2024-06-01 11:05'),(2,'2024-06-01 10:00');</div>
  <h3>Gaps and islands: streaks of consecutive days</h3>
  <p>"Find each user's streaks of consecutive login days." Rows are separate days; nothing in a single row says "this continues yesterday's streak". The trick: subtract the row number from the date. Within a streak, both go up by 1 each day, so the difference stays the same. A missing day makes the date jump by 2 while the row number goes up by 1, so the difference changes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two friends climbing stairs side by side, one step per day. While neither skips a day, the gap between them stays fixed. The day one skips, the gap changes, and a new "island" starts.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT user_id, login_date,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS rn,
  login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date)::int AS grp
FROM logins
WHERE user_id = 1
ORDER BY login_date;</div>
  <table class="tbl out"><caption>Step 1 for user 1</caption><tr><th>user_id</th><th>login_date</th><th>rn</th><th>grp</th></tr><tr><td>1</td><td>2024-06-01</td><td>1</td><td>2024-05-31</td></tr><tr><td>1</td><td>2024-06-02</td><td>2</td><td>2024-05-31</td></tr><tr><td>1</td><td>2024-06-03</td><td>3</td><td>2024-05-31</td></tr><tr><td>1</td><td>2024-06-05</td><td>4</td><td>2024-06-01</td></tr><tr><td>1</td><td>2024-06-06</td><td>5</td><td>2024-06-01</td></tr></table>
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
  <p><code>grp</code> is not a meaningful date; it is just a label shared by all days of one streak. Step 2 groups by it:</p>
  <div class="fx" data-lang="sql">WITH g AS (
  SELECT user_id, login_date,
         login_date - ROW_NUMBER() OVER (PARTITION BY user_id
                                         ORDER BY login_date)::int AS grp
  FROM logins
)
SELECT user_id,
       MIN(login_date) AS streak_start,
       MAX(login_date) AS streak_end,
       COUNT(*)        AS days
FROM g
GROUP BY user_id, grp
ORDER BY user_id, streak_start;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>streak_start</th><th>streak_end</th><th>days</th></tr><tr><td>1</td><td>2024-06-01</td><td>2024-06-03</td><td>3</td></tr><tr><td>1</td><td>2024-06-05</td><td>2024-06-06</td><td>2</td></tr><tr><td>2</td><td>2024-06-01</td><td>2024-06-01</td><td>1</td></tr><tr><td>2</td><td>2024-06-03</td><td>2024-06-06</td><td>4</td></tr></table>
  <p>A duplicate login on the same day breaks the trick, because the row number rises while the date does not. Add a second 06-02 login for user 1 and rerun:</p>
  <div class="fx" data-lang="sql">INSERT INTO logins VALUES (1, '2024-06-02');</div>
  <table class="tbl out"><caption>Result with a duplicate day: wrong streaks</caption><tr><th>user_id</th><th>streak_start</th><th>streak_end</th><th>days</th></tr><tr><td>1</td><td>2024-06-01</td><td>2024-06-06</td><td>4</td></tr><tr><td>1</td><td>2024-06-02</td><td>2024-06-03</td><td>2</td></tr></table>
  <p>Fix: deduplicate first with <code>SELECT DISTINCT user_id, login_date</code>, or use DENSE_RANK instead of ROW_NUMBER.</p>
  <h3>Sessionization</h3>
  <p>"Group clicks into sessions, where 30 minutes of inactivity starts a new session." Two steps. Step 1: use LAG to get the gap since the previous click and flag 1 when a new session starts (first click, or a gap over 30 minutes). Step 2: a running SUM of the flags numbers the sessions, because the sum goes up by 1 exactly at each session start.</p>
  <div class="fx" data-lang="sql">WITH flagged AS (
  SELECT user_id, ts,
    ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) AS gap,
    CASE WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts)
              &lt;= INTERVAL '30 minutes' THEN 0 ELSE 1 END AS new_session
  FROM clicks
)
SELECT user_id, ts, gap, new_session,
  SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_id
FROM flagged
ORDER BY user_id, ts;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>ts</th><th>gap</th><th>new_session</th><th>session_id</th></tr><tr><td>1</td><td>2024-06-01 09:00:00</td><td>NULL</td><td>1</td><td>1</td></tr><tr><td>1</td><td>2024-06-01 09:10:00</td><td>00:10:00</td><td>0</td><td>1</td></tr><tr><td>1</td><td>2024-06-01 09:25:00</td><td>00:15:00</td><td>0</td><td>1</td></tr><tr><td>1</td><td>2024-06-01 11:00:00</td><td>01:35:00</td><td>1</td><td>2</td></tr><tr><td>1</td><td>2024-06-01 11:05:00</td><td>00:05:00</td><td>0</td><td>2</td></tr><tr><td>2</td><td>2024-06-01 10:00:00</td><td>NULL</td><td>1</td><td>1</td></tr></table>
  <p>Trace user 1: 09:00 has no previous click, LAG is NULL, the CASE condition is UNKNOWN so ELSE gives 1. 09:10 and 09:25 have gaps of 10 and 15 minutes: 0. 11:00 has a 1 h 35 min gap: 1. Running sum: 1, 1, 1, 2, 2. Now aggregate per session:</p>
  <div class="fx" data-lang="sql">WITH flagged AS (
  SELECT user_id, ts,
    CASE WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts)
              &lt;= INTERVAL '30 minutes' THEN 0 ELSE 1 END AS new_session
  FROM clicks
), numbered AS (
  SELECT user_id, ts,
         SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_id
  FROM flagged
)
SELECT user_id, session_id,
       MIN(ts) AS started, MAX(ts) - MIN(ts) AS duration, COUNT(*) AS clicks
FROM numbered
GROUP BY user_id, session_id
ORDER BY user_id, session_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>session_id</th><th>started</th><th>duration</th><th>clicks</th></tr><tr><td>1</td><td>1</td><td>2024-06-01 09:00:00</td><td>00:25:00</td><td>3</td></tr><tr><td>1</td><td>2</td><td>2024-06-01 11:00:00</td><td>00:05:00</td><td>2</td></tr><tr><td>2</td><td>1</td><td>2024-06-01 10:00:00</td><td>00:00:00</td><td>1</td></tr></table>
  <h3>Dedupe: latest row per key</h3>
  <p>"Keep only each customer's most recent order" (common when a table has several versions of a record). ROW_NUMBER newest-first, keep row 1:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date
FROM (SELECT o.*,
             ROW_NUMBER() OVER (PARTITION BY customer_id
                                ORDER BY order_date DESC, order_id DESC) AS rn
      FROM orders o) t
WHERE rn = 1
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th></tr><tr><td>1</td><td>101</td><td>2024-05-20</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td></tr></table>
  <div class="callout intu"><span class="label">The general recipe</span>
    <p>"Flag where a new group starts (LAG), then running-SUM the flags to get a group id" solves streaks, sessions, status changes and most "consecutive" problems. "ROW_NUMBER … = 1" solves latest / first / dedupe.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Both patterns need PARTITION BY the entity (user) and a deterministic ORDER BY. Without the partition, one user's last click and the next user's first click are compared.</p>
  </div>

  <h2 id="sw-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>Window queries rarely error. They return numbers that look right on a small sample and are wrong on real data. Check these before shipping.</p>
  <div class="callout trap"><span class="label">Trap: missing PARTITION BY</span>
    <p>LAG compares Ben's order with Asha's; running totals run across customers. Ask "per what?" for every window.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ties without a tie-breaker</span>
    <p>ROW_NUMBER and ROWS frames give different answers from run to run when ORDER BY values tie. Add a unique column (<code>, emp_id</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the default RANGE frame</span>
    <p>With ORDER BY and no frame, peers are included together: Sara's running sum includes Tom. Write <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> for row-by-row totals.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: LAST_VALUE without a full frame</span>
    <p>It returns the current row. Use <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, or FIRST_VALUE with the order reversed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ROWS n PRECEDING on data with gaps</span>
    <p>Rows are not days. Fill the calendar first, or use <code>RANGE BETWEEN INTERVAL 'n days' PRECEDING AND CURRENT ROW</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: filtering a window in WHERE</span>
    <p>Not allowed. Wrap in a CTE and filter outside (or QUALIFY where supported).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: RANK vs DENSE_RANK for "Nth highest"</span>
    <p>After a tie, RANK skips numbers, so "rank = 3" may not exist. For the Nth highest <em>value</em>, use DENSE_RANK.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: integer division in percentages</span>
    <p><code>100 * 95000 / 310000</code> is integer maths. Write <code>100.0</code>.</p>
  </div>

  <h2 id="sw-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a window function and GROUP BY?</summary><div class="qa-body">GROUP BY collapses each group to one row. A window function computes over a group of related rows but returns a value on every input row, so row count is unchanged. <code>AVG(salary) OVER (PARTITION BY dept)</code> gives 5 rows; <code>GROUP BY dept</code> gives 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: ROW_NUMBER, RANK and DENSE_RANK of salary DESC for Uma.</summary><div class="qa-body">ROW_NUMBER 4, RANK 4, DENSE_RANK 3. Sara and Tom tie at 95,000 for 2nd; RANK skips 3, DENSE_RANK does not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: second-highest salary in each department, handling ties.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH ranked AS (
  SELECT name, dept, salary,
         DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT dept, name, salary
FROM ranked
WHERE rnk = 2
ORDER BY dept, name;</div>Eng: Sara and Tom (95,000); Sales: Vik. DENSE_RANK so the second distinct value is found even after a tie at the top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: keep only each customer's most recent order.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date
FROM (SELECT o.*,
             ROW_NUMBER() OVER (PARTITION BY customer_id
                                ORDER BY order_date DESC, order_id DESC) AS rn
      FROM orders o) t
WHERE rn = 1
ORDER BY customer_id;</div>Result: (1, 101), (2, 102), (3, 104). ROW_NUMBER guarantees exactly one row; <code>order_id DESC</code> breaks date ties deterministically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: days between each customer's consecutive orders.</summary><div class="qa-body"><code>order_date - LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)</code>. Asha: 19 days, Chen: 16 days; first orders are NULL. Without PARTITION BY, Ben's order is compared with Asha's (13 days).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: month-over-month revenue growth %.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH monthly AS (
  SELECT DATE_TRUNC('month', o.order_date)::date AS month,
         SUM(oi.qty * oi.unit_price) AS revenue
  FROM orders o
  JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY 1
)
SELECT month, revenue,
  ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
        / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS growth_pct
FROM monthly
ORDER BY month;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>growth_pct</th></tr><tr><td>2024-05-01</td><td>1380.00</td><td>NULL</td></tr><tr><td>2024-06-01</td><td>1150.00</td><td>-16.7</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>-89.6</td></tr></table>May has no previous month (NULL). <code>NULLIF(…, 0)</code> turns a zero previous month into NULL instead of a division-by-zero error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use a window function in WHERE, and how do you filter on one?</summary><div class="qa-body">Logical order: FROM → WHERE → GROUP BY → HAVING → windows → SELECT. Windows do not exist yet when WHERE runs. Compute the window in a CTE or subquery and filter in the outer query, or use QUALIFY in Snowflake/BigQuery/Databricks/DuckDB.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does LAST_VALUE often return the current row's value? Fix it.</summary><div class="qa-body">With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, so the last row in the frame is the current row (or its last peer). Add <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, or use FIRST_VALUE with reversed order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A running total by salary shows the same value for Sara and Tom. Why?</summary><div class="qa-body">The default frame is RANGE, which includes all peers (rows with the same ORDER BY value). Both rows' frames end after Tom, so both show 325000. Use <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> and a tie-breaker in ORDER BY.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: each product's cumulative share of total revenue (Pareto).</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH rev AS (
  SELECT p.name, SUM(oi.qty * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN products p USING (product_id)
  GROUP BY p.name
)
SELECT name, revenue,
  ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC)
        / SUM(revenue) OVER (), 1) AS cum_pct
FROM rev
ORDER BY revenue DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>revenue</th><th>cum_pct</th></tr><tr><td>Phone</td><td>1500.00</td><td>53.6</td></tr><tr><td>Laptop</td><td>800.00</td><td>82.1</td></tr><tr><td>Desk</td><td>300.00</td><td>92.9</td></tr><tr><td>Lamp</td><td>200.00</td><td>100.0</td></tr></table>Phone and Laptop together reach 82.1%: the "vital few" products.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: each user's longest streak of consecutive login days.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH g AS (
  SELECT user_id,
         login_date - ROW_NUMBER() OVER (PARTITION BY user_id
                                         ORDER BY login_date)::int AS grp
  FROM (SELECT DISTINCT user_id, login_date FROM logins) d
),
s AS (
  SELECT user_id, COUNT(*) AS days
  FROM g
  GROUP BY user_id, grp
)
SELECT user_id, MAX(days) AS longest_streak
FROM s
GROUP BY user_id
ORDER BY user_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>longest_streak</th></tr><tr><td>1</td><td>3</td></tr><tr><td>2</td><td>4</td></tr></table>DISTINCT first protects against two logins on one day.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A 7-day moving average uses <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> on daily data. What can go wrong?</summary><div class="qa-body">Days with no data have no row, so "6 rows back" may reach 10 days back, and missing days are not counted as zero. Build a full calendar with <code>generate_series</code>, LEFT JOIN and <code>COALESCE(…, 0)</code>, or use <code>RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW</code> (which skips missing days rather than counting them as 0).</div></details>
</main>
`
});
