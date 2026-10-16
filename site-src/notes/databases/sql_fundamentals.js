// notes/databases/sql_fundamentals.js — Querying Basics
Object.assign(TOPIC_CONTENT, {
  "sql_fundamentals": `<main>
  <h1>Querying Basics</h1>
  <p class="lead">Reading, filtering, grouping and changing data with one table at a time. Most interview SQL is these pieces combined, plus the NULL and ordering rules that trip people up.</p>

  <h2 id="sf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Querying Basics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">SELECT &amp; expressions</div>
        <ul>
          <li><b>FROM</b> names the table; <b>SELECT</b> picks/computes columns</li>
          <li><b>Alias</b> — <code>price * 1.18 AS price_with_gst</code>; table alias <code>FROM customers c</code></li>
          <li><b>Cast</b> — <code>'42'::int</code> or <code>CAST(x AS int)</code></li>
          <li>⚠ <b>Integer division</b> — 3 / 5 = 0; use <code>::numeric</code> or <code>1.0 *</code></li>
          <li>⚠ avoid <code>SELECT *</code> in real code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">WHERE filters</div>
        <ul>
          <li><b>Keeps only TRUE</b> rows; AND / OR / NOT, bracket mixes</li>
          <li><b>IN</b> — many ORs · <b>BETWEEN</b> — inclusive both ends</li>
          <li><b>LIKE</b> — <code>%</code> any run, <code>_</code> one char · <b>ILIKE</b> case-insensitive (PG)</li>
          <li>⚠ <b>Timestamp BETWEEN</b> drops the last day → half-open <code>&gt;= start AND &lt; next</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logical order</div>
        <ul>
          <li><b>FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</b></li>
          <li>⚠ alias in WHERE fails (SELECT not run yet); fine in ORDER BY</li>
          <li>⚠ aggregates in WHERE fail → HAVING</li>
          <li><b>LIMIT last</b> — after sorting, so "top N" is defined</li>
          <li><b>Logical ≠ physical</b> — optimizer may reorder, result must match</li>
          <li>💡 cook: fetch, discard, bowl, drop small bowls, plate + name, arrange, serve</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">NULL &amp; 3-valued logic</div>
        <ul>
          <li><b>NULL</b> = unknown, not 0 or ''; comparisons → UNKNOWN; WHERE drops it</li>
          <li>⚠ <code>city = NULL</code> → 0 rows; <code>city &lt;&gt; 'Mumbai'</code> drops Dia</li>
          <li><b>IS NULL</b> only correct test · <b>COALESCE</b> default · <b>NULLIF(y,0)</b> avoid ÷0</li>
          <li><b>IS DISTINCT FROM</b> — NULL-safe ≠</li>
          <li><b>Truth</b> — FALSE AND U = F; TRUE OR U = T; else UNKNOWN</li>
          <li>⚠ NULL spreads: <code>'a' || NULL</code> = NULL; <code>CONCAT</code> skips NULLs</li>
          <li>💡 sealed envelope — only ask "is it sealed?"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sort, page, DISTINCT</div>
        <ul>
          <li><b>No ORDER BY = no guaranteed order</b></li>
          <li><b>NULLs</b> — last in ASC, first in DESC (PG); <code>NULLS LAST</code> to override</li>
          <li><b>LIMIT n OFFSET k</b>; ⚠ large OFFSET still reads skipped rows</li>
          <li>⚠ ties (Sara = Tom) → add tiebreaker or <code>DENSE_RANK</code></li>
          <li><b>DISTINCT</b> — whole row; NULLs count as one</li>
          <li>⚠ DISTINCT to hide duplicates usually masks a join fan-out</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Aggregates &amp; GROUP BY</div>
        <ul>
          <li><b>COUNT, SUM, AVG, MIN, MAX</b> — many rows → one value</li>
          <li><b>COUNT(*)</b> rows · <b>COUNT(col)</b> non-NULL · <b>COUNT(DISTINCT col)</b> unique (4 / 3 / 2)</li>
          <li><b>NULLs ignored</b> except COUNT(*); AVG divides by non-NULL count</li>
          <li>⚠ zero rows: COUNT = 0, SUM/AVG/MAX = NULL</li>
          <li><b>WHERE</b> rows before grouping · <b>HAVING</b> groups after</li>
          <li>⚠ every SELECT column must be a GROUP BY key or aggregate</li>
          <li>💡 receipts into piles, one summary line per pile</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CASE &amp; pivots</div>
        <ul>
          <li><b>CASE WHEN … THEN … ELSE … END</b> — first match wins; no ELSE → NULL</li>
          <li><b>Conditional aggregation</b> — <code>SUM(CASE WHEN s='delivered' THEN 1 ELSE 0 END)</code></li>
          <li><b>FILTER</b> — <code>COUNT(*) FILTER (WHERE status='cancelled')</code></li>
          <li><b>Rate</b> — <code>AVG(CASE WHEN cond THEN 1.0 ELSE 0 END)</code> + GROUP BY</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dates, strings, writes</div>
        <ul>
          <li><b>DATE_TRUNC('month', d)</b>, <b>EXTRACT(DOW …)</b> (0 = Sun), <code>+ INTERVAL '30 days'</code>, date − date = days</li>
          <li><b>||</b> concat, LOWER/UPPER/TRIM/LENGTH; <code>GROUP BY 1</code> = first column</li>
          <li>⚠ function on column in WHERE blocks index → use range</li>
          <li><b>INSERT / UPDATE / DELETE … RETURNING</b></li>
          <li><b>UPSERT</b> — <code>ON CONFLICT (id) DO UPDATE SET p = EXCLUDED.p</code> / DO NOTHING</li>
          <li>⚠ UPDATE without WHERE hits every row → SELECT first, BEGIN … ROLLBACK</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sf-select"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">SELECT &amp; Expressions</span><span class="rm-sub">Columns, aliases, casting</span></div></div>
      <div class="rm-item rm-done" data-target="sf-where"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Filtering with WHERE</span><span class="rm-sub">IN, BETWEEN, LIKE</span></div></div>
      <div class="rm-item rm-done" data-target="sf-exec"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Logical Execution Order</span><span class="rm-sub">Why aliases fail in WHERE</span></div></div>
      <div class="rm-item rm-done" data-target="sf-null"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">NULL &amp; Three-Valued Logic</span><span class="rm-sub">TRUE, FALSE, UNKNOWN</span></div></div>
      <div class="rm-item rm-done" data-target="sf-sort"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Sorting, Paging, DISTINCT</span><span class="rm-sub">ORDER BY, LIMIT, dedupe</span></div></div>
      <div class="rm-item rm-done" data-target="sf-agg"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Aggregates &amp; GROUP BY</span><span class="rm-sub">COUNT variants, HAVING</span></div></div>
      <div class="rm-item rm-done" data-target="sf-case"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">CASE &amp; Conditional Aggregation</span><span class="rm-sub">Pivot counts in one pass</span></div></div>
      <div class="rm-item rm-done" data-target="sf-func"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Dates &amp; Strings</span><span class="rm-sub">DATE_TRUNC, intervals, ||</span></div></div>
      <div class="rm-item rm-done" data-target="sf-write"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Writing Data</span><span class="rm-sub">INSERT, UPDATE, UPSERT</span></div></div>
      <div class="rm-item rm-done" data-target="sf-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Predict the output</span></div></div>
    </div>
  </div>

  <h2 id="sf-select"><span class="num">01</span>SELECT &amp; Expressions</h2>
  <p><code>FROM</code> names the table; <code>SELECT</code> picks or computes the columns you want back. Each output column can be any expression, renamed with <code>AS</code> (an <strong>alias</strong>).</p>
  <div class="fx" data-lang="sql">SELECT name, price, price * 1.18 AS price_with_gst
FROM products;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>price</th><th>price_with_gst</th></tr><tr><td>Laptop</td><td>800.00</td><td>944.0000</td></tr><tr><td>Phone</td><td>500.00</td><td>590.0000</td></tr><tr><td>Desk</td><td>150.00</td><td>177.0000</td></tr><tr><td>Lamp</td><td>40.00</td><td>47.2000</td></tr></table>
  <table class="tbl">
    <tr><td><strong>Table alias</strong></td><td><code>FROM customers AS c</code> → <code>c.city</code>; essential for joins</td></tr>
    <tr><td><strong>Cast</strong></td><td><code>'42'::int</code> (Postgres) or <code>CAST(price AS int)</code></td></tr>
    <tr><td><strong>Avoid <code>SELECT *</code></strong></td><td>Breaks when columns change; reads more than needed</td></tr>
  </table>
  <h3>The integer division trap</h3>
  <p>Integer ÷ integer gives an integer; the fraction is thrown away.</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*) AS wrong,
       COUNT(*) FILTER (WHERE status = 'delivered')::numeric / COUNT(*) AS right_rate
FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>wrong</th><th>right_rate</th></tr><tr><td>0</td><td>0.60000000000000000000</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>3 / 5 = 0, not 0.6. Every "rate" or "percentage" question is testing this. Cast one side (<code>::numeric</code>) or multiply by <code>1.0</code> first.</p>
  </div>

  <h2 id="sf-where"><span class="num">02</span>Filtering with WHERE</h2>
  <p><code>WHERE</code> keeps only rows whose condition is <strong>true</strong>. Combine conditions with <code>AND</code>, <code>OR</code>, <code>NOT</code>; use brackets when mixing them.</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Example</th><th>Meaning</th></tr>
    <tr><td><code>=</code>, <code>&lt;&gt;</code></td><td><code>price &lt;&gt; 40</code></td><td>Equal / not equal (<code>!=</code> also works)</td></tr>
    <tr><td><code>IN</code></td><td><code>status IN ('pending','cancelled')</code></td><td>Shorthand for several <code>OR</code>s</td></tr>
    <tr><td><code>BETWEEN</code></td><td><code>price BETWEEN 100 AND 500</code></td><td>Inclusive at <em>both</em> ends</td></tr>
    <tr><td><code>LIKE</code></td><td><code>name LIKE 'L%'</code></td><td>Pattern: <code>%</code> = any run of chars, <code>_</code> = exactly one</td></tr>
    <tr><td><code>ILIKE</code></td><td><code>name ILIKE '%a%'</code></td><td>Case-insensitive LIKE (Postgres only)</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT order_id, order_date
FROM orders
WHERE order_date BETWEEN '2024-05-01' AND '2024-06-02';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>order_date</th></tr><tr><td>100</td><td>2024-05-01</td></tr><tr><td>101</td><td>2024-05-20</td></tr><tr><td>102</td><td>2024-06-02</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>On a <em>timestamp</em> column, <code>BETWEEN '2024-06-01' AND '2024-06-30'</code> stops at midnight on the 30th. Use a half-open range.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <line x1="40" y1="50" x2="570" y2="50" stroke="currentColor"/>
    <g stroke="currentColor"><line x1="60" y1="44" x2="60" y2="56"/><line x1="440" y1="44" x2="440" y2="56"/><line x1="520" y1="44" x2="520" y2="56"/></g>
    <g font-size="10" text-anchor="middle" class="tm"><text x="60" y="38">Jun 1 00:00</text><text x="425" y="38">Jun 30 00:00</text><text x="530" y="38">Jul 1 00:00</text></g>
    <circle cx="475" cy="50" r="6" class="fr sr"/><text x="475" y="16" text-anchor="middle" font-size="10" class="tr">order at Jun 30 10:00</text>
    <rect x="60" y="66" width="380" height="24" rx="4" class="fr sr"/><text x="70" y="82" font-size="10">BETWEEN '2024-06-01' AND '2024-06-30'</text>
    <text x="450" y="82" font-size="10" class="tr">✗ misses it</text>
    <rect x="60" y="100" width="460" height="24" rx="4" class="fg sg"/><text x="70" y="116" font-size="10">ts &gt;= '2024-06-01' AND ts &lt; '2024-07-01'</text>
    <text x="528" y="116" font-size="10" class="tg">✓</text>
  </svg><figcaption>On timestamps, '2024-06-30' means midnight at the start of the 30th, so BETWEEN loses almost the whole last day.</figcaption></figure>

  <h2 id="sf-exec"><span class="num">03</span>Logical Execution Order</h2>
  <p>You <em>write</em> SELECT first, but the database <em>evaluates</em> clauses in this order:</p>
  <figure class="viz"><svg viewBox="0 0 600 205" width="600">
    <text x="38" y="20" text-anchor="middle" font-size="10" class="tm">1</text><rect x="5" y="26" width="66" height="34" rx="6" class="fb"/><text x="38" y="47" text-anchor="middle" font-size="10" font-weight="bold">FROM</text><line x1="71" y1="43" x2="79" y2="43" stroke="currentColor"/><text x="112" y="20" text-anchor="middle" font-size="10" class="tm">2</text><rect x="79" y="26" width="66" height="34" rx="6" class="fb"/><text x="112" y="47" text-anchor="middle" font-size="10" font-weight="bold">WHERE</text><line x1="145" y1="43" x2="153" y2="43" stroke="currentColor"/><text x="186" y="20" text-anchor="middle" font-size="10" class="tm">3</text><rect x="153" y="26" width="66" height="34" rx="6" class="ft"/><text x="186" y="47" text-anchor="middle" font-size="10" font-weight="bold">GROUP BY</text><line x1="219" y1="43" x2="227" y2="43" stroke="currentColor"/><text x="260" y="20" text-anchor="middle" font-size="10" class="tm">4</text><rect x="227" y="26" width="66" height="34" rx="6" class="ft"/><text x="260" y="47" text-anchor="middle" font-size="10" font-weight="bold">HAVING</text><line x1="293" y1="43" x2="301" y2="43" stroke="currentColor"/><text x="334" y="20" text-anchor="middle" font-size="10" class="tm">5</text><rect x="301" y="26" width="66" height="34" rx="6" class="fg"/><text x="334" y="47" text-anchor="middle" font-size="10" font-weight="bold">SELECT</text><line x1="367" y1="43" x2="375" y2="43" stroke="currentColor"/><text x="408" y="20" text-anchor="middle" font-size="10" class="tm">6</text><rect x="375" y="26" width="66" height="34" rx="6" class="fs"/><text x="408" y="47" text-anchor="middle" font-size="10" font-weight="bold">DISTINCT</text><line x1="441" y1="43" x2="449" y2="43" stroke="currentColor"/><text x="482" y="20" text-anchor="middle" font-size="10" class="tm">7</text><rect x="449" y="26" width="66" height="34" rx="6" class="fs"/><text x="482" y="47" text-anchor="middle" font-size="10" font-weight="bold">ORDER BY</text><line x1="515" y1="43" x2="523" y2="43" stroke="currentColor"/><text x="556" y="20" text-anchor="middle" font-size="10" class="tm">8</text><rect x="523" y="26" width="66" height="34" rx="6" class="fs"/><text x="556" y="47" text-anchor="middle" font-size="10" font-weight="bold">LIMIT</text>
    <rect x="5" y="80" width="140" height="24" rx="5" class="fb sb"/><text x="13" y="96" font-size="10">raw rows only</text>
    <rect x="153" y="112" width="436" height="24" rx="5" class="ft st"/><text x="161" y="128" font-size="10">groups + aggregates exist: HAVING, SELECT, ORDER BY can use them</text>
    <rect x="301" y="144" width="288" height="24" rx="5" class="fg sg"/><text x="309" y="160" font-size="10">SELECT aliases exist: ORDER BY can use</text>
    <text x="5" y="192" font-size="11" class="tr">✗ WHERE doubled &gt; 500 · ✗ WHERE COUNT(*) &gt; 1</text>
    <text x="589" y="192" font-size="11" text-anchor="end" class="tg">✓ ORDER BY doubled</text>
  </svg><figcaption>Each bar shows what exists from that step onward. WHERE runs at step 2, before groups or aliases are born.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cooking: fetch (FROM), discard bad (WHERE), sort into bowls (GROUP BY), drop small bowls (HAVING), plate and name (SELECT), arrange (ORDER BY), serve a few (LIMIT). You can't use a dish's name before it's plated.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT name, price * 2 AS doubled FROM products WHERE doubled &gt; 500;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>ERROR</th></tr><tr><td>column "doubled" does not exist</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name, price * 2 AS doubled FROM products ORDER BY doubled DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>doubled</th></tr><tr><td>Laptop</td><td>1600.00</td></tr><tr><td>Phone</td><td>1000.00</td></tr><tr><td>Desk</td><td>300.00</td></tr><tr><td>Lamp</td><td>80.00</td></tr></table>
  <div class="callout intu"><span class="label">Logical, not physical</span>
    <p>This is the order of <em>meaning</em>. The optimizer may physically push filters earlier or use an index, but the result must match this order. Postgres also allows an alias in GROUP BY as a convenience; HAVING still rejects it.</p>
  </div>

  <h2 id="sf-null"><span class="num">04</span>NULL &amp; Three-Valued Logic</h2>
  <p><strong>NULL</strong> means "unknown / missing", not zero or empty string. Any comparison with NULL gives <strong>UNKNOWN</strong>, and WHERE keeps only TRUE.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sealed envelope. Is Dia's city "Mumbai"? You can't say yes or no. Is it equal to another sealed envelope? Also unknown. You can only ask "is the envelope sealed?" (<code>IS NULL</code>).</p>
  </div>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city = NULL;     -- 0 rows, always
SELECT name FROM customers WHERE city &lt;&gt; 'Mumbai'; -- Dia missing!</div>
  <table class="tbl out"><caption>Result (second query)</caption><tr><th>name</th></tr><tr><td>Ben</td></tr></table>
  <p>Dia has a NULL city, so <code>NULL &lt;&gt; 'Mumbai'</code> is UNKNOWN and she's dropped. The fixes:</p>
  <table class="tbl">
    <tr><th>Tool</th><th>What it does</th><th>Example</th></tr>
    <tr><td><code>IS NULL</code> / <code>IS NOT NULL</code></td><td>The only correct NULL test</td><td><code>WHERE city IS NULL</code> → Dia</td></tr>
    <tr><td><code>COALESCE(a, b, …)</code></td><td>First non-NULL argument</td><td><code>COALESCE(city, 'Unknown')</code></td></tr>
    <tr><td><code>NULLIF(a, b)</code></td><td>NULL if a = b, else a</td><td><code>x / NULLIF(y, 0)</code> avoids divide-by-zero</td></tr>
    <tr><td><code>IS DISTINCT FROM</code></td><td>NULL-safe <code>&lt;&gt;</code>: treats NULL as a value</td><td>see below</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city IS DISTINCT FROM 'Mumbai';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Ben</td></tr><tr><td>Dia</td></tr></table>
  <h3>Truth table worth memorising</h3>
  <div class="fx" data-lang="sql">SELECT TRUE AND NULL AS t_and_n, FALSE AND NULL AS f_and_n,
       TRUE OR NULL AS t_or_n, NOT NULL::boolean AS not_n;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>t_and_n</th><th>f_and_n</th><th>t_or_n</th><th>not_n</th></tr><tr><td>NULL</td><td>f</td><td>t</td><td>NULL</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <text x="300" y="16" text-anchor="middle" font-size="11" class="tm">T = TRUE, F = FALSE, U = UNKNOWN (NULL)</text>
    <text x="37.0" y="51.0" text-anchor="middle" font-weight="bold">AND</text><text x="71.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">T</text><text x="37.0" y="85.0" text-anchor="middle" font-weight="bold" class="tm">T</text><text x="105.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">F</text><text x="37.0" y="119.0" text-anchor="middle" font-weight="bold" class="tm">F</text><text x="139.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">U</text><text x="37.0" y="153.0" text-anchor="middle" font-weight="bold" class="tm">U</text><rect x="55" y="65" width="32" height="32" rx="4" class="fg"/><text x="71.0" y="85.0" text-anchor="middle">T</text><rect x="89" y="65" width="32" height="32" rx="4" class="fr"/><text x="105.0" y="85.0" text-anchor="middle">F</text><rect x="123" y="65" width="32" height="32" rx="4" class="fs"/><text x="139.0" y="85.0" text-anchor="middle">U</text><rect x="55" y="99" width="32" height="32" rx="4" class="fr"/><text x="71.0" y="119.0" text-anchor="middle">F</text><rect x="89" y="99" width="32" height="32" rx="4" class="fr"/><text x="105.0" y="119.0" text-anchor="middle">F</text><rect x="123" y="99" width="32" height="32" rx="4" class="fr"/><text x="139.0" y="119.0" text-anchor="middle">F</text><rect x="55" y="133" width="32" height="32" rx="4" class="fs"/><text x="71.0" y="153.0" text-anchor="middle">U</text><rect x="89" y="133" width="32" height="32" rx="4" class="fr"/><text x="105.0" y="153.0" text-anchor="middle">F</text><rect x="123" y="133" width="32" height="32" rx="4" class="fs"/><text x="139.0" y="153.0" text-anchor="middle">U</text><text x="237.0" y="51.0" text-anchor="middle" font-weight="bold">OR</text><text x="271.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">T</text><text x="237.0" y="85.0" text-anchor="middle" font-weight="bold" class="tm">T</text><text x="305.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">F</text><text x="237.0" y="119.0" text-anchor="middle" font-weight="bold" class="tm">F</text><text x="339.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">U</text><text x="237.0" y="153.0" text-anchor="middle" font-weight="bold" class="tm">U</text><rect x="255" y="65" width="32" height="32" rx="4" class="fg"/><text x="271.0" y="85.0" text-anchor="middle">T</text><rect x="289" y="65" width="32" height="32" rx="4" class="fg"/><text x="305.0" y="85.0" text-anchor="middle">T</text><rect x="323" y="65" width="32" height="32" rx="4" class="fg"/><text x="339.0" y="85.0" text-anchor="middle">T</text><rect x="255" y="99" width="32" height="32" rx="4" class="fg"/><text x="271.0" y="119.0" text-anchor="middle">T</text><rect x="289" y="99" width="32" height="32" rx="4" class="fr"/><text x="305.0" y="119.0" text-anchor="middle">F</text><rect x="323" y="99" width="32" height="32" rx="4" class="fs"/><text x="339.0" y="119.0" text-anchor="middle">U</text><rect x="255" y="133" width="32" height="32" rx="4" class="fg"/><text x="271.0" y="153.0" text-anchor="middle">T</text><rect x="289" y="133" width="32" height="32" rx="4" class="fs"/><text x="305.0" y="153.0" text-anchor="middle">U</text><rect x="323" y="133" width="32" height="32" rx="4" class="fs"/><text x="339.0" y="153.0" text-anchor="middle">U</text><text x="457.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">x</text><text x="491.0" y="51.0" text-anchor="middle" font-weight="bold">NOT</text><text x="457.0" y="85.0" text-anchor="middle" font-weight="bold" class="tm">T</text><rect x="475" y="65" width="32" height="32" rx="4" class="fr"/><text x="491.0" y="85.0" text-anchor="middle">F</text><text x="457.0" y="119.0" text-anchor="middle" font-weight="bold" class="tm">F</text><rect x="475" y="99" width="32" height="32" rx="4" class="fg"/><text x="491.0" y="119.0" text-anchor="middle">T</text><text x="457.0" y="153.0" text-anchor="middle" font-weight="bold" class="tm">U</text><rect x="475" y="133" width="32" height="32" rx="4" class="fs"/><text x="491.0" y="153.0" text-anchor="middle">U</text>
  </svg><figcaption>Green = TRUE, red = FALSE, grey = UNKNOWN. Only a known side that already decides the answer escapes UNKNOWN.</figcaption></figure>
  <p>Rule: FALSE AND anything = FALSE; TRUE OR anything = TRUE; otherwise UNKNOWN.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>'Asha' || NULL</code> is NULL, and <code>price + NULL</code> is NULL. NULL spreads through expressions. Wrap nullable inputs in <code>COALESCE</code>, or use <code>CONCAT()</code>, which skips NULLs.</p>
  </div>

  <h2 id="sf-sort"><span class="num">05</span>Sorting, Paging, DISTINCT</h2>
  <p><code>ORDER BY</code> sorts the final rows. Without it, row order is <strong>not guaranteed</strong>, even if it looks stable.</p>
  <ul>
    <li>Postgres puts NULLs <strong>last in ASC</strong> and <strong>first in DESC</strong>. Override with <code>NULLS FIRST / NULLS LAST</code>.</li>
    <li>Sort by several keys: <code>ORDER BY n DESC, name</code>. The second key breaks ties.</li>
  </ul>
  <div class="fx" data-lang="sql">SELECT name, city FROM customers ORDER BY city DESC NULLS LAST;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>city</th></tr><tr><td>Asha</td><td>Mumbai</td></tr><tr><td>Chen</td><td>Mumbai</td></tr><tr><td>Ben</td><td>Delhi</td></tr><tr><td>Dia</td><td>NULL</td></tr></table>
  <p>Without <code>NULLS LAST</code>, Dia comes first in a DESC sort.</p>
  <h3>LIMIT / OFFSET</h3>
  <div class="fx" data-lang="sql">SELECT name, price FROM products ORDER BY price DESC LIMIT 2 OFFSET 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>price</th></tr><tr><td>Phone</td><td>500.00</td></tr><tr><td>Desk</td><td>150.00</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>ORDER BY salary DESC LIMIT 2</code> returns Ravi and <em>one of</em> Sara/Tom (they tie at 95000). Which one is arbitrary. Add a tiebreaker, or use <code>DENSE_RANK()</code> if ties must be kept. Large OFFSETs are also slow: the DB still reads and discards the skipped rows.</p>
  </div>
  <h3>DISTINCT</h3>
  <p>Removes duplicate rows from the result. It applies to the <em>whole row</em>, not one column. All NULLs count as one value here.</p>
  <div class="fx" data-lang="sql">SELECT DISTINCT city FROM customers ORDER BY city;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>city</th></tr><tr><td>Delhi</td></tr><tr><td>Mumbai</td></tr><tr><td>NULL</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for DISTINCT to "fix" duplicate rows usually hides a bad join (fan-out). Find why rows multiplied instead. See <em>JOINs</em>.</p>
  </div>

  <h2 id="sf-agg"><span class="num">06</span>Aggregates &amp; GROUP BY</h2>
  <p>An <strong>aggregate</strong> squashes many rows into one value: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>. <code>GROUP BY</code> makes one output row per distinct key.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sorting receipts into one pile per customer, then writing one summary line per pile. Anything on that line must be either the pile label (the GROUP BY key) or a summary (an aggregate).</p>
  </div>
  <h3>The three COUNTs</h3>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS all_rows, COUNT(city) AS with_city, COUNT(DISTINCT city) AS cities
FROM customers;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>all_rows</th><th>with_city</th><th>cities</th></tr><tr><td>4</td><td>3</td><td>2</td></tr></table>
  <ul>
    <li><code>COUNT(*)</code>: rows. <code>COUNT(col)</code>: non-NULL values (Dia skipped). <code>COUNT(DISTINCT col)</code>: unique non-NULL values.</li>
    <li>All aggregates except <code>COUNT(*)</code> <strong>ignore NULLs</strong>. <code>AVG</code> divides by the non-NULL count.</li>
    <li>On zero rows, <code>COUNT</code> returns 0 but <code>SUM/AVG/MAX</code> return NULL.</li>
  </ul>
  <h3>WHERE vs HAVING</h3>
  <p><code>WHERE</code> filters <strong>rows</strong> before grouping. <code>HAVING</code> filters <strong>groups</strong> after aggregation.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="sf-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="70" y="14" text-anchor="middle" font-weight="bold">orders</text>
    <rect x="15" y="22" width="110" height="22" rx="3" class="fb"/><text x="22" y="37">100 · c1 · deliv</text>
    <rect x="15" y="48" width="110" height="22" rx="3" class="fb"/><text x="22" y="63">101 · c1 · deliv</text>
    <rect x="15" y="74" width="110" height="22" rx="3" class="fr sr" stroke-dasharray="3 3"/><text x="22" y="89" class="tm">102 · c2 · cancel</text>
    <rect x="15" y="100" width="110" height="22" rx="3" class="fv"/><text x="22" y="115">103 · c3 · deliv</text>
    <rect x="15" y="126" width="110" height="22" rx="3" class="fv"/><text x="22" y="141">104 · c3 · pend</text>
    <text x="70" y="170" text-anchor="middle" class="tr">WHERE drops 102</text>
    <g stroke="currentColor" marker-end="url(#sf-ar1)"><line x1="130" y1="46" x2="208" y2="56"/><line x1="130" y1="124" x2="208" y2="116"/><line x1="340" y1="56" x2="418" y2="56"/><line x1="340" y1="116" x2="418" y2="116"/></g>
    <text x="275" y="14" text-anchor="middle" font-weight="bold">GROUP BY customer_id</text>
    <rect x="210" y="30" width="130" height="54" rx="6" class="fb sb"/><text x="275" y="52" text-anchor="middle">pile c1</text><text x="275" y="70" text-anchor="middle" class="tm">2 rows</text>
    <rect x="210" y="92" width="130" height="54" rx="6" class="fv"/><text x="275" y="114" text-anchor="middle">pile c3</text><text x="275" y="132" text-anchor="middle" class="tm">2 rows</text>
    <text x="500" y="14" text-anchor="middle" font-weight="bold">HAVING COUNT(*) &gt;= 2</text>
    <rect x="420" y="42" width="160" height="28" rx="4" class="fg sg"/><text x="500" y="60" text-anchor="middle">c1 → n_orders 2</text>
    <rect x="420" y="102" width="160" height="28" rx="4" class="fg sg"/><text x="500" y="120" text-anchor="middle">c3 → n_orders 2</text>
    <text x="500" y="170" text-anchor="middle" class="tm">one output row per pile</text>
    </g>
  </svg><figcaption>WHERE removes rows, GROUP BY makes piles, HAVING keeps or drops whole piles. This is the query below.</figcaption></figure>
  <div class="fx" data-lang="sql">SELECT customer_id, COUNT(*) AS n_orders
FROM orders
WHERE status &lt;&gt; 'cancelled'      -- row filter
GROUP BY customer_id
HAVING COUNT(*) &gt;= 2             -- group filter
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>n_orders</th></tr><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>2</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>SELECT name, category FROM products GROUP BY category</code> fails: "column products.name must appear in the GROUP BY clause or be used in an aggregate function". Each category has two names; SQL won't pick one for you. (MySQL's old loose mode did, silently.)</p>
  </div>

  <h2 id="sf-case"><span class="num">07</span>CASE &amp; Conditional Aggregation</h2>
  <p><code>CASE</code> is SQL's if/else. It returns the first matching branch; no match and no ELSE gives NULL.</p>
  <div class="fx" data-lang="sql">SELECT name, price,
  CASE WHEN price &gt;= 500 THEN 'high'
       WHEN price &gt;= 100 THEN 'mid'
       ELSE 'low' END AS band
FROM products;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>price</th><th>band</th></tr><tr><td>Laptop</td><td>800.00</td><td>high</td></tr><tr><td>Phone</td><td>500.00</td><td>high</td></tr><tr><td>Desk</td><td>150.00</td><td>mid</td></tr><tr><td>Lamp</td><td>40.00</td><td>low</td></tr></table>
  <p><strong>Conditional aggregation</strong> puts CASE inside an aggregate, so one scan produces several counts side by side. Postgres's <code>FILTER (WHERE …)</code> is a cleaner way to write the same thing.</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS total,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
  ROUND(AVG(CASE WHEN status = 'delivered' THEN 1.0 ELSE 0 END), 2) AS delivery_rate
FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>total</th><th>delivered</th><th>cancelled</th><th>delivery_rate</th></tr><tr><td>5</td><td>3</td><td>1</td><td>0.60</td></tr></table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p><code>AVG(CASE WHEN cond THEN 1.0 ELSE 0 END)</code> is a rate in one line. Add <code>GROUP BY</code> and you get the rate per group: the classic "pivot" interview pattern.</p>
  </div>

  <h2 id="sf-func"><span class="num">08</span>Dates &amp; Strings</h2>
  <table class="tbl">
    <tr><th>Function</th><th>Does</th><th>Example → result</th></tr>
    <tr><td><code>DATE_TRUNC('month', d)</code></td><td>Round down to period start</td><td>2024-05-20 → 2024-05-01</td></tr>
    <tr><td><code>EXTRACT(DOW FROM d)</code></td><td>Pull out one part (0 = Sunday)</td><td>2024-06-02 → 0</td></tr>
    <tr><td><code>d + INTERVAL '30 days'</code></td><td>Date arithmetic</td><td>2024-05-01 → 2024-05-31 00:00:00</td></tr>
    <tr><td><code>d2 - d1</code> (dates)</td><td>Days between, as integer</td><td>'2024-12-31' − Asha's signup → 361</td></tr>
    <tr><td><code>a || b</code></td><td>Concatenate (NULL if either is NULL)</td><td><code>name || ' (' || COALESCE(city,'?') || ')'</code> → Dia (?)</td></tr>
    <tr><td><code>LOWER</code>, <code>UPPER</code>, <code>TRIM</code>, <code>LENGTH</code></td><td>Clean and measure text</td><td><code>LOWER(TRIM('  MUMBAI '))</code> → mumbai</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT DATE_TRUNC('month', order_date)::date AS month, COUNT(*) AS orders
FROM orders
GROUP BY 1
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>orders</th></tr><tr><td>2024-05-01</td><td>2</td></tr><tr><td>2024-06-01</td><td>2</td></tr><tr><td>2024-07-01</td><td>1</td></tr></table>
  <p><code>GROUP BY 1</code> means "the first SELECT column". Handy, but fragile if columns are reordered.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>WHERE DATE_TRUNC('month', order_date) = '2024-06-01'</code> works, but wrapping the column in a function stops a normal index being used. Prefer the half-open range <code>order_date &gt;= '2024-06-01' AND order_date &lt; '2024-07-01'</code>.</p>
  </div>

  <h2 id="sf-write"><span class="num">09</span>Writing Data</h2>
  <table class="tbl">
    <tr><th>Statement</th><th>Does</th></tr>
    <tr><td><code>INSERT INTO t (cols) VALUES (…), (…)</code></td><td>Adds rows; name the columns explicitly</td></tr>
    <tr><td><code>UPDATE t SET col = expr WHERE …</code></td><td>Changes matching rows</td></tr>
    <tr><td><code>DELETE FROM t WHERE …</code></td><td>Removes matching rows</td></tr>
    <tr><td><code>… RETURNING cols</code></td><td>Postgres: send back the affected rows, no second SELECT needed</td></tr>
  </table>
  <div class="fx" data-lang="sql">UPDATE products SET price = price * 1.10
WHERE category = 'Furniture'
RETURNING product_id, name, price;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>product_id</th><th>name</th><th>price</th></tr><tr><td>12</td><td>Desk</td><td>165.00</td></tr><tr><td>13</td><td>Lamp</td><td>44.00</td></tr></table>
  <p>Deleting order 102 directly fails: <em>"violates foreign key constraint … Key (order_id)=(102) is still referenced from table order_items"</em>. Delete the child rows first (or define <code>ON DELETE CASCADE</code>).</p>
  <h3>UPSERT: insert, or update if it exists</h3>
  <p>A plain INSERT of an existing key fails with "duplicate key value violates unique constraint". <code>ON CONFLICT</code> says what to do instead. <code>EXCLUDED</code> is the row you tried to insert.</p>
  <div class="fx" data-lang="sql">INSERT INTO products (product_id, name, category, price)
VALUES (13, 'Lamp', 'Furniture', 45), (14, 'Chair', 'Furniture', 90)
ON CONFLICT (product_id) DO UPDATE SET price = EXCLUDED.price
RETURNING *;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>product_id</th><th>name</th><th>category</th><th>price</th></tr><tr><td>13</td><td>Lamp</td><td>Furniture</td><td>45.00</td></tr><tr><td>14</td><td>Chair</td><td>Furniture</td><td>90.00</td></tr></table>
  <p>Lamp (13) existed, so its price was updated. Chair (14) was new, so it was inserted. <code>ON CONFLICT DO NOTHING</code> skips duplicates instead.</p>
  <div class="callout trap"><span class="label">Trap: UPDATE without WHERE</span>
    <p><code>UPDATE customers SET city = 'Delhi'</code> ran and reported <code>UPDATE 4</code>: every customer now lives in Delhi. Write the WHERE first, test it as a SELECT, and run risky writes inside <code>BEGIN; … ROLLBACK;</code> until the row count looks right.</p>
  </div>
  <h2 id="sf-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT name FROM customers WHERE city = 'Mumbai' OR city &lt;&gt; 'Mumbai'</code> return?</summary><div class="qa-body">Asha, Ben, Chen. Not Dia: for her city is NULL, so both sides are UNKNOWN and <code>UNKNOWN OR UNKNOWN</code> is UNKNOWN. "Everything" in SQL never includes NULLs unless you add <code>OR city IS NULL</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT COUNT(*), COUNT(city), COUNT(DISTINCT city) FROM customers;</code></summary><div class="qa-body">4, 3, 2. Four rows; three non-NULL cities (Dia skipped); two unique values, Mumbai and Delhi.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>WHERE doubled &gt; 500</code> fail when <code>doubled</code> is a SELECT alias, but <code>ORDER BY doubled</code> works?</summary><div class="qa-body">WHERE is evaluated before SELECT, so the alias doesn't exist yet. ORDER BY runs after SELECT. Fix: repeat the expression (<code>WHERE price * 2 &gt; 500</code>) or wrap the query in a subquery/CTE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between WHERE and HAVING? Can HAVING replace WHERE?</summary><div class="qa-body">WHERE filters rows before grouping and can't use aggregates. HAVING filters groups after aggregation. HAVING on a plain column often works, but it groups rows you'll throw away, so it's slower and less clear. Use WHERE for row conditions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT 7 / 2, 7 / 2.0, NULL = NULL, 10 / NULLIF(0, 0);</code></summary><div class="qa-body"><code>3</code>, <code>3.5</code>, <code>NULL</code>, <code>NULL</code>. Integer division truncates; NULL = NULL is UNKNOWN; NULLIF turns 0 into NULL, and anything ÷ NULL is NULL instead of an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a query: delivery rate (as a decimal) per month.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT DATE_TRUNC('month', order_date)::date AS month,
       ROUND(AVG(CASE WHEN status = 'delivered' THEN 1.0 ELSE 0 END), 2) AS rate
FROM orders
GROUP BY 1
ORDER BY 1;</div>Gives 1.00 (May), 0.50 (June), 0.00 (July). The <code>1.0</code> avoids integer maths.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A colleague writes <code>WHERE city != 'Delhi'</code> to get "customers not in Delhi". What's missing and how do you fix it?</summary><div class="qa-body">Dia (NULL city) is dropped. Use <code>WHERE city IS DISTINCT FROM 'Delhi'</code> or <code>WHERE city &lt;&gt; 'Delhi' OR city IS NULL</code>. Whether unknown-city customers belong in the answer is a business question; ask it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 2</code> — is the answer deterministic?</summary><div class="qa-body">No. Ravi is first, but Sara and Tom tie at 95000, so the second row can be either. Add a tiebreaker (<code>ORDER BY salary DESC, emp_id</code>) or use <code>DENSE_RANK() &lt;= 2</code> to return both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT COUNT(*), SUM(salary) FROM employees WHERE dept = 'HR';</code></summary><div class="qa-body"><code>0</code> and <code>NULL</code>. No rows match. COUNT of nothing is 0, but SUM/AVG/MAX of nothing is NULL. Use <code>COALESCE(SUM(salary), 0)</code> if a report needs 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Count delivered, cancelled and pending orders as three columns in one row.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
       COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
       COUNT(*) FILTER (WHERE status = 'pending')   AS pending
FROM orders;</div>3, 1, 1. Portable version: <code>SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT name || ' - ' || city FROM customers</code> show for Dia?</summary><div class="qa-body">NULL. Concatenating with NULL gives NULL. Use <code>COALESCE(city, 'unknown')</code> or <code>CONCAT(name, ' - ', city)</code>, which treats NULL as empty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you insert a product, or update its price if the ID already exists, in one statement?</summary><div class="qa-body"><code>INSERT … ON CONFLICT (product_id) DO UPDATE SET price = EXCLUDED.price</code>. It needs a unique constraint or primary key on the conflict column. It's atomic, unlike "SELECT then INSERT or UPDATE", which races under concurrency.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You ran <code>UPDATE customers SET city = 'Delhi'</code> and forgot WHERE. What happened and how do you protect yourself next time?</summary><div class="qa-body">Every row was updated (<code>UPDATE 4</code>). If autocommit was on, only a backup or point-in-time restore helps. Protect yourself: run the WHERE as a SELECT first, wrap writes in <code>BEGIN … ROLLBACK/COMMIT</code>, check the row count, and use RETURNING to see what changed.</div></details>
</main>`
});
