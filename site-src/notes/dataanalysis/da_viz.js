// notes/dataanalysis/da_viz.js — Matplotlib & Seaborn
Object.assign(TOPIC_CONTENT, {
  "da_viz": `<main>
  <h1>Matplotlib &amp; Seaborn</h1>
  <p class="lead">Charts are how analysis reaches people. Learn which chart answers which question, Matplotlib's figure/axes model, Seaborn's one-line statistical plots, and how to make a chart that states its point. All plots use the same <code>orders</code> + <code>customers</code> data as the NumPy and Pandas notes.</p>

  <h2 id="dv-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Matplotlib &amp; Seaborn</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Choose the Chart</div>
        <ul>
          <li><b>Trend over time</b> — line</li>
          <li><b>Compare categories</b> — sorted bar (horizontal for long names)</li>
          <li><b>Distribution</b> — hist / KDE / ECDF; across groups — box / violin</li>
          <li><b>Relationship</b> — scatter (+ <code>regplot</code>); many pairs — heatmap / pairplot</li>
          <li><b>Part of whole</b> — stacked bar; <b>one number</b> — just the number</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Figure &amp; Axes</div>
        <ul>
          <li><b>Figure</b> — the canvas; <b>Axes</b> — one plot with its own axis, title, legend</li>
          <li><b>OO API</b> — <code>fig, ax = plt.subplots()</code>; then <code>ax.plot / ax.set_title</code></li>
          <li><b>pyplot</b> — <code>plt.plot</code> acts on the "current" Axes; breaks with many panels</li>
          <li>⚠ <b>Axes ≠ axis</b>; <code>subplots(2,2)</code> returns a 2-D array (<code>axes[0,1]</code>, <code>axes.flat</code>)</li>
          <li>💡 Figure = frame, Axes = photos inside it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matplotlib Basics</div>
        <ul>
          <li><b>Plots</b> — <code>plot, scatter, hist, bar/barh</code></li>
          <li><b>Customise</b> — <code>ax.set(title, xlabel, ylim)</code>, <code>set_xscale("log")</code>, <code>annotate</code>, <code>axhline</code></li>
          <li><b>Layout</b> — <code>layout="constrained"</code>, <code>sharey=True</code></li>
          <li><b>Save</b> — <code>fig.savefig(p, dpi=200, bbox_inches="tight")</code>; SVG/PDF for print</li>
          <li>⚠ <b>plt.close(fig)</b> in loops, or memory grows</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Seaborn</div>
        <ul>
          <li><b>Pattern</b> — <code>data=df, x="col", y="col", hue="group"</code></li>
          <li><b>Axes-level</b> — histplot, boxplot, heatmap, regplot (take <code>ax=</code>)</li>
          <li><b>Figure-level</b> — displot, catplot, relplot, lmplot, pairplot (facet with <code>col=</code>)</li>
          <li><b>heatmap</b> — <code>annot=True, cmap="RdBu_r", center=0, vmin=-1, vmax=1</code></li>
          <li><b>barplot</b> — mean ± 95% CI; <b>countplot</b> — counts</li>
          <li>⚠ <b>common_norm=False</b> when group sizes differ</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data Findings</div>
        <ul>
          <li><b>Revenue</b> — corr with price 0.87, with qty 0.30, discount ~0</li>
          <li><b>Price</b> — right-skewed: median ₹1,620, p90 ₹9,135 → log scale</li>
          <li><b>Electronics</b> — 64% of revenue</li>
          <li><b>Segments</b> — VIPs don't spend more per order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Communicate</div>
        <ul>
          <li><b>Title = the insight</b> — "Electronics = 64% of revenue"</li>
          <li><b>Emphasis</b> — one accent colour, grey the rest; label directly</li>
          <li><b>Bars start at 0</b>; lines may zoom</li>
          <li>⚠ <b>Pie</b> — only 2–3 very different parts; else sorted bar</li>
          <li>⚠ <b>Dual y-axes</b> — invented correlation; use stacked panels or index to 100</li>
          <li>⚠ <b>Rainbow/jet, 3-D</b> — use viridis (sequential), RdBu (diverging)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dv-choose"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Choosing the Chart</span><span class="rm-sub">Question → chart type</span></div></div>
      <div class="rm-item rm-done" data-target="dv-model"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Figure &amp; Axes Model</span><span class="rm-sub">Always use the OO API</span></div></div>
      <div class="rm-item rm-done" data-target="dv-basic"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Core Plots &amp; Subplots</span><span class="rm-sub">line, scatter, hist, bar</span></div></div>
      <div class="rm-item rm-done" data-target="dv-custom"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Customization</span><span class="rm-sub">Labels, scales, saving</span></div></div>
      <div class="rm-item rm-done" data-target="dv-sns"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Seaborn</span><span class="rm-sub">Heatmap, pairplot, dist, cat, reg</span></div></div>
      <div class="rm-item rm-done" data-target="dv-comm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Charts That Communicate</span><span class="rm-sub">Insight titles, no pies</span></div></div>
      <div class="rm-item rm-done" data-target="dv-build"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Hands-on</span><span class="rm-sub">One-page EDA figure</span></div></div>
      <div class="rm-item rm-done" data-target="dv-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dv-choose"><span class="num">01</span>Choosing the Chart</h2>
  <table class="tbl">
    <tr><th>Question you're answering</th><th>Chart</th><th>Seaborn / Matplotlib</th><th>Avoid</th></tr>
    <tr><td>How does it change over time?</td><td>Line</td><td><code>ax.plot</code>, <code>sns.lineplot</code></td><td>Bars for 50+ time points</td></tr>
    <tr><td>Compare categories</td><td>Bar (sorted, horizontal if long names)</td><td><code>ax.barh</code>, <code>sns.barplot</code></td><td>Pie, 3-D bars</td></tr>
    <tr><td>How is one variable distributed?</td><td>Histogram / KDE / ECDF</td><td><code>sns.histplot</code>, <code>kdeplot</code>, <code>ecdfplot</code></td><td>Mean alone</td></tr>
    <tr><td>Compare distributions across groups</td><td>Box / violin / strip</td><td><code>sns.boxplot</code>, <code>violinplot</code></td><td>Bar of means only</td></tr>
    <tr><td>Relationship of two numbers</td><td>Scatter (+ trend line)</td><td><code>ax.scatter</code>, <code>sns.regplot</code></td><td>Line chart of unordered x</td></tr>
    <tr><td>Many pairwise relationships</td><td>Correlation heatmap / pairplot</td><td><code>sns.heatmap</code>, <code>sns.pairplot</code></td><td>20 separate scatters</td></tr>
    <tr><td>Part of a whole</td><td>Stacked bar, or just the % in text</td><td><code>df.plot.bar(stacked=True)</code></td><td>Pie with 6+ slices</td></tr>
    <tr><td>One headline number</td><td>Big number, no chart</td><td>text</td><td>A one-bar chart</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>Start from the question, not the data type. "Which category earns most?" is a sorted bar; "is price skewed?" is a histogram.</p></div>

  <h2 id="dv-model"><span class="num">02</span>Figure &amp; Axes Model</h2>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <rect x="10" y="10" width="580" height="170" class="fs" stroke="currentColor"/><text x="20" y="28">Figure (the whole canvas, saved to PNG)</text>
    <rect x="30" y="40" width="260" height="128" class="fb sb"/><text x="40" y="58">Axes [0]  (one plot)</text>
    <rect x="310" y="40" width="260" height="128" class="ft st"/><text x="320" y="58">Axes [1]</text>
    <path d="M70 150 L270 150 M70 150 L70 70" stroke="currentColor" fill="none"/>
    <path d="M75 140 L120 110 L165 125 L210 90 L260 80" class="sb" stroke-width="2" fill="none"/>
    <text x="150" y="164" class="tm">xaxis</text><text x="36" y="110" class="tm">yaxis</text>
    <text x="330" y="84">ax.set_title(...)</text><text x="330" y="104">ax.set_xlabel(...)</text><text x="330" y="124">ax.legend()</text><text x="330" y="144" class="tm">Line2D, Text = Artists</text>
  </svg><figcaption>A Figure holds one or more Axes; each Axes is a plot with its own x/y axis, title and legend.</figcaption></figure>
  <div class="fx" data-lang="py">import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(8, 4))     # object-oriented (OO) API: explicit handles
ax.plot(monthly.index, monthly.values)
ax.set_title("..."); fig.savefig("chart.png", dpi=150, bbox_inches="tight")

plt.plot(x, y); plt.title("...")           # pyplot state machine: acts on the "current" axes</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Figure = the picture frame; Axes = each photo inside it. <code>plt.*</code> edits "whichever photo you touched last", which breaks once you have several.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Axes" (a plot) is not "axis" (the x or y line). Pandas <code>df.plot()</code> and every Seaborn axes-level function return an Axes and accept <code>ax=</code>.</p></div>

  <h2 id="dv-basic"><span class="num">03</span>Core Plots &amp; Subplots</h2>
  <div class="fx" data-lang="py">o = pd.read_csv("orders.csv", parse_dates=["order_date"])
monthly = o.set_index("order_date").revenue.resample("ME").sum() / 1e5   # ₹ lakh
bycat = o.groupby("category").revenue.sum().sort_values() / 1e5

fig, axes = plt.subplots(2, 2, figsize=(9, 6), layout="constrained")
ax = axes[0, 0]                                         # line: change over time
ax.plot(monthly.index, monthly.values, marker="o")
ax.set_title("Monthly revenue swings ₹4–8 lakh, no trend"); ax.set_ylabel("₹ lakh")
ax = axes[0, 1]                                         # scatter: relationship
ax.scatter(o.unit_price, o.revenue, s=8, alpha=0.4)
ax.set_xscale("log"); ax.set_yscale("log")
ax.set_title("Revenue = price × qty: one band per qty")
ax = axes[1, 0]                                         # histogram: distribution
ax.hist(o.unit_price, bins=40)
ax.set_title("Half of items cost under ₹1,620")
ax = axes[1, 1]                                         # bar: compare categories
ax.barh(bycat.index, bycat.values, color=["#b0b7c3"] * 4 + ["#2a6fdb"])
ax.set_title("Electronics = 64% of revenue")
for a in axes.flat:
    a.spines[["top", "right"]].set_visible(False)       # remove chart junk
fig.savefig("grid.png", dpi=72)</div>
  <figure class="viz"><img src="data:image/png;base64,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" alt="Four-panel figure: monthly revenue line, log-log scatter of price vs revenue with four bands, right-skewed price histogram, horizontal bar with Electronics highlighted" style="max-width:100%;height:auto;background:#fff;border-radius:6px"><figcaption>The real output. Each title states the finding; the bar chart greys out everything but the point.</figcaption></figure>
  <ul>
    <li><strong>Scatter</strong>: the four parallel bands are qty = 1, 2, 3, 4. Log scales turn the multiplication into straight lines.</li>
    <li><strong>Histogram</strong>: right-skewed. Median ₹1,620, but 90th percentile ₹9,135, so the mean misleads.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p><code>plt.subplots(2, 2)</code> returns a 2-D array of Axes: index with <code>axes[0, 1]</code>, loop with <code>axes.flat</code>. With <code>(1, 1)</code> you get a single Axes, not an array.</p></div>

  <h2 id="dv-custom"><span class="num">04</span>Customization</h2>
  <table class="tbl">
    <tr><th>Goal</th><th>Code</th></tr>
    <tr><td>Title, labels, limits</td><td><code>ax.set(title="...", xlabel="...", ylim=(0, None))</code></td></tr>
    <tr><td>Skewed data</td><td><code>ax.set_xscale("log")</code></td></tr>
    <tr><td>Readable numbers</td><td><code>ax.yaxis.set_major_formatter(mtick.StrMethodFormatter("₹{x:,.0f}"))</code></td></tr>
    <tr><td>Annotate the point</td><td><code>ax.annotate("May peak", xy=(x, y), xytext=(x2, y2), arrowprops=dict(arrowstyle="-&gt;"))</code></td></tr>
    <tr><td>Reference line / band</td><td><code>ax.axhline(target, ls="--")</code>, <code>ax.axvspan(d1, d2, alpha=.1)</code></td></tr>
    <tr><td>Legend outside</td><td><code>ax.legend(loc="upper left", bbox_to_anchor=(1, 1))</code></td></tr>
    <tr><td>Shared axes</td><td><code>plt.subplots(1, 3, sharey=True)</code></td></tr>
    <tr><td>No overlap</td><td><code>layout="constrained"</code> (or <code>fig.tight_layout()</code>)</td></tr>
    <tr><td>Global style</td><td><code>plt.style.use("seaborn-v0_8-whitegrid")</code>, <code>plt.rcParams["font.size"] = 11</code></td></tr>
    <tr><td>Export</td><td><code>fig.savefig("x.png", dpi=200, bbox_inches="tight")</code>; SVG/PDF for print</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>In scripts and loops, call <code>plt.close(fig)</code> after saving. Otherwise every figure stays in memory and Matplotlib warns after 20.</p></div>

  <h2 id="dv-sns"><span class="num">05</span>Seaborn</h2>
  <p>Seaborn = Matplotlib + tidy DataFrames + statistics. Pass <code>data=</code>, column names, and <code>hue</code> for colour by group.</p>
  <div class="cards">
    <div><b>Axes-level</b><p><code>histplot</code>, <code>boxplot</code>, <code>scatterplot</code>, <code>heatmap</code>, <code>regplot</code>. Draw on one <code>ax=</code>.</p><small>Fits in your subplot grid</small></div>
    <div><b>Figure-level</b><p><code>displot</code>, <code>catplot</code>, <code>relplot</code>, <code>lmplot</code>, <code>pairplot</code>. Own their figure; facet with <code>col=</code>/<code>row=</code>.</p><small>Returns a FacetGrid, not an Axes</small></div>
  </div>
  <h3>Heatmap</h3>
  <div class="fx" data-lang="py">import seaborn as sns
corr = o[["qty", "unit_price", "discount_pct", "revenue"]].corr().round(2)
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", vmin=-1, vmax=1, center=0)</div>
  <figure class="viz"><svg viewBox="0 0 380 180" width="380"><text x="102" y="42" text-anchor="end">qty</text><text x="141" y="172" text-anchor="middle">qty</text><rect x="110" y="20" width="60" height="32" class="fb sb"/><text x="140" y="41" text-anchor="middle">1.00</text><rect x="172" y="20" width="60" height="32" class="fs"/><text x="202" y="41" text-anchor="middle">-0.03</text><rect x="234" y="20" width="60" height="32" class="fs"/><text x="264" y="41" text-anchor="middle">0.03</text><rect x="296" y="20" width="60" height="32" class="fb"/><text x="326" y="41" text-anchor="middle">0.30</text><text x="102" y="76" text-anchor="end">price</text><text x="203" y="172" text-anchor="middle">price</text><rect x="110" y="54" width="60" height="32" class="fs"/><text x="140" y="75" text-anchor="middle">-0.03</text><rect x="172" y="54" width="60" height="32" class="fb sb"/><text x="202" y="75" text-anchor="middle">1.00</text><rect x="234" y="54" width="60" height="32" class="fs"/><text x="264" y="75" text-anchor="middle">0.04</text><rect x="296" y="54" width="60" height="32" class="fb sb"/><text x="326" y="75" text-anchor="middle">0.87</text><text x="102" y="110" text-anchor="end">discount</text><text x="265" y="172" text-anchor="middle">discount</text><rect x="110" y="88" width="60" height="32" class="fs"/><text x="140" y="109" text-anchor="middle">0.03</text><rect x="172" y="88" width="60" height="32" class="fs"/><text x="202" y="109" text-anchor="middle">0.04</text><rect x="234" y="88" width="60" height="32" class="fb sb"/><text x="264" y="109" text-anchor="middle">1.00</text><rect x="296" y="88" width="60" height="32" class="fs"/><text x="326" y="109" text-anchor="middle">0.02</text><text x="102" y="144" text-anchor="end">revenue</text><text x="327" y="172" text-anchor="middle">revenue</text><rect x="110" y="122" width="60" height="32" class="fb"/><text x="140" y="143" text-anchor="middle">0.30</text><rect x="172" y="122" width="60" height="32" class="fb sb"/><text x="202" y="143" text-anchor="middle">0.87</text><rect x="234" y="122" width="60" height="32" class="fs"/><text x="264" y="143" text-anchor="middle">0.02</text><rect x="296" y="122" width="60" height="32" class="fb sb"/><text x="326" y="143" text-anchor="middle">1.00</text></svg><figcaption>Real values. Revenue follows price (0.87), barely qty (0.30); discount is unrelated to anything.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap</span><p>Use a diverging map centred at 0 (<code>center=0</code>, fixed <code>vmin/vmax</code>) for correlations. A default sequential map makes -0.03 and 0.03 look meaningfully different.</p></div>
  <h3>Distribution, categorical, regression, pairplot</h3>
  <div class="fx" data-lang="py">c = pd.read_csv("customers.csv"); o = o.merge(c, on="customer_id")   # adds segment
sns.histplot(data=o, x="unit_price", hue="segment", log_scale=True,
             element="step", stat="density", common_norm=False)
sns.kdeplot(data=o, x="revenue", hue="segment", log_scale=True, common_norm=False)
sns.ecdfplot(data=o, x="revenue", hue="segment", log_scale=True)
sns.boxplot(data=o, x="category", y="unit_price", log_scale=True)
sns.violinplot(data=o, x="segment", y="revenue", log_scale=True)
sns.barplot(data=o, x="category", y="revenue", estimator="mean", errorbar=("ci", 95))
sns.countplot(data=o, x="status", hue="segment")
sns.regplot(data=o, x="unit_price", y="revenue", scatter_kws=dict(s=8, alpha=.3))
sns.lmplot(data=o, x="unit_price", y="revenue", col="segment", height=3)   # one panel per segment
sns.pairplot(o[["qty", "unit_price", "revenue", "category"]], hue="category", corner=True)</div>
  <table class="tbl"><caption>What those plots show (numbers from the data)</caption>
    <tr><th>Plot</th><th>What you see</th></tr>
    <tr><td>boxplot by category</td><td>Five non-overlapping boxes. Medians: Books ₹410, Beauty ₹740, Fashion ₹1,475, Home ₹2,330, Electronics ₹8,915.</td></tr>
    <tr><td>hist / kde / ecdf by segment</td><td>Curves nearly on top of each other: VIPs don't buy pricier items. Median revenue: new 3,440, regular 3,980, vip 3,670.</td></tr>
    <tr><td>barplot (mean ± 95% CI)</td><td>Electronics mean 22,859 towers over Books 1,084; CI bars show how sure each mean is.</td></tr>
    <tr><td>pairplot</td><td>Grid of scatters with histograms on the diagonal. Colour separates categories by price cleanly.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p><code>common_norm=False</code> matters when groups differ in size (489 new vs 108 VIP). Otherwise each curve is scaled by its group's share and small groups look flat.</p></div>

  <h2 id="dv-comm"><span class="num">06</span>Charts That Communicate</h2>
  <div class="flow"><span>Question</span><span>One finding</span><span>Title states it</span><span>Highlight it, grey the rest</span><span>Cut the junk</span></div>
  <table class="tbl">
    <tr><th>Weak</th><th>Strong</th></tr>
    <tr><td>"Revenue by category"</td><td>"Electronics = 64% of revenue"</td></tr>
    <tr><td>"Unit price histogram"</td><td>"Half of items cost under ₹1,620"</td></tr>
    <tr><td>Five bright colours</td><td>One accent colour on the bar that matters</td></tr>
    <tr><td>Legend far away</td><td>Label lines directly at their ends</td></tr>
    <tr><td>Truncated bar axis (starts at 90)</td><td>Bars start at 0 (lines may zoom in)</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <g transform="translate(10,0)"><path d="M90 75L90.0 15.0A60 60 0 1 1 45.0 114.7z" class="fb" stroke="currentColor"/><path d="M90 75L45.0 114.7A60 60 0 0 1 32.2 59.0z" class="ft" stroke="currentColor"/><path d="M90 75L32.2 59.0A60 60 0 0 1 67.6 19.4z" class="fg" stroke="currentColor"/><path d="M90 75L67.6 19.4A60 60 0 0 1 82.9 15.4z" class="fv" stroke="currentColor"/><path d="M90 75L82.9 15.4A60 60 0 0 1 90.4 15.0z" class="fr" stroke="currentColor"/></g>
    <text x="10" y="155" class="tr">Home vs Fashion: which is bigger?</text>
    <g transform="translate(290,10)">
      <text x="0" y="16">Electronics</text><rect x="94" y="4" width="170" height="16" class="fb sb"/><text x="270" y="17">64%</text>
      <text x="0" y="42">Home</text><rect x="94" y="30" width="42" height="16" class="fs" stroke="currentColor"/><text x="142" y="43">15.8%</text>
      <text x="0" y="68">Fashion</text><rect x="94" y="56" width="39" height="16" class="fs" stroke="currentColor"/><text x="139" y="69">14.6%</text>
      <text x="0" y="94">Beauty</text><rect x="94" y="82" width="11" height="16" class="fs" stroke="currentColor"/><text x="111" y="95">4.2%</text>
      <text x="0" y="120">Books</text><rect x="94" y="108" width="5" height="16" class="fs" stroke="currentColor"/><text x="105" y="121">2.0%</text>
      <text x="0" y="145" class="tg">Same data: ranking is instant</text>
    </g>
  </svg><figcaption>Eyes compare lengths on a common baseline far better than angles or areas.</figcaption></figure>
  <div class="cards">
    <div><b>Pie charts</b><p>Fine for 2–3 very different parts. Beyond that, close slices can't be ranked.</p><small>Use: sorted bar</small></div>
    <div><b>Dual y-axes</b><p>Two scales on one plot; their alignment is arbitrary, so any "correlation" is invented.</p><small>Use: two stacked panels, or index both to 100</small></div>
    <div><b>Rainbow colormaps</b><p>Jet has false edges and fails for colour-blind readers.</p><small>Use: viridis (sequential), RdBu (diverging)</small></div>
    <div><b>3-D effects</b><p>Perspective distorts bar heights and slice sizes.</p><small>Use: flat 2-D</small></div>
  </div>

  <h2 id="dv-build"><span class="num">07</span>Hands-on: One-page EDA Figure</h2>
  <div class="fx" data-lang="py">def eda_page(df, num, cat, path):
    """Distribution of num, num by cat, and correlations in one figure."""
    fig, axes = plt.subplots(1, 3, figsize=(14, 4), layout="constrained")
    sns.histplot(data=df, x=num, log_scale=True, ax=axes[0])
    order = df.groupby(cat)[num].median().sort_values().index      # sorted categories
    sns.boxplot(data=df, x=cat, y=num, order=order, log_scale=True, ax=axes[1])
    sns.heatmap(df.select_dtypes("number").corr(), annot=True, fmt=".2f",
                cmap="RdBu_r", center=0, vmin=-1, vmax=1, ax=axes[2])
    axes[0].set_title(f"{num}: median {df[num].median():,.0f}")
    fig.savefig(path, dpi=120); plt.close(fig)

eda_page(o, "unit_price", "category", "eda.png")</div>
  <p>Try: change the titles to state one finding each, then highlight the top category in the boxplot.</p>

  <h2 id="dv-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Difference between Figure and Axes? Why prefer the OO API?</summary><div class="qa-body">Figure is the whole canvas; Axes is one plot inside it. The OO API (<code>fig, ax = plt.subplots()</code>) gives explicit handles, so multi-panel figures and functions that take <code>ax=</code> behave predictably. pyplot calls act on an implicit "current" Axes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You want to show that unit price is right-skewed. Which plot and settings?</summary><div class="qa-body">Histogram or ECDF, ideally with a log x-axis (<code>sns.histplot(x="unit_price", log_scale=True)</code>). Report median and percentiles, not the mean: median ₹1,620 vs 90th percentile ₹9,135.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Box plot vs violin plot vs bar of means?</summary><div class="qa-body">Bar of means hides spread and outliers. Box shows median, IQR and outliers. Violin adds the density shape (e.g. bimodality) but is harder for non-technical readers. Use box by default; strip/swarm overlays when n is small.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is a pie chart acceptable?</summary><div class="qa-body">Two or three parts with clearly different sizes, when "part of a whole" is the message. Otherwise a sorted bar: lengths on a shared baseline are compared far more accurately than angles.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your manager wants revenue and order count on one chart with two y-axes. What do you propose?</summary><div class="qa-body">Two vertically stacked panels sharing the x-axis (<code>plt.subplots(2, 1, sharex=True)</code>), or index both series to 100 at the start and plot on one axis. Dual axes let the scale choice invent correlations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>sns.histplot</code> vs <code>sns.displot</code>?</summary><div class="qa-body"><code>histplot</code> is axes-level: draws on an <code>ax</code> you give it. <code>displot</code> is figure-level: creates its own FacetGrid and can facet with <code>col=</code>/<code>row=</code>, but can't go into an existing subplot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your saved PNG has cut-off labels. Fix?</summary><div class="qa-body"><code>fig.savefig(path, bbox_inches="tight")</code> and create the figure with <code>layout="constrained"</code> (or call <code>fig.tight_layout()</code>). Rotate long tick labels or switch to a horizontal bar.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A scatter of 1M points is a solid blob. Options?</summary><div class="qa-body">Smaller markers with low <code>alpha</code>; sample; <code>ax.hexbin</code> or <code>sns.histplot(x=, y=)</code> (2-D histogram); <code>kdeplot</code> contours; or Datashader for huge data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a chart title good?</summary><div class="qa-body">It states the takeaway the reader should leave with: "Electronics = 64% of revenue", not "Revenue by category". The axis labels already say what is plotted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which colormap for a correlation matrix, and which for a count heatmap?</summary><div class="qa-body">Correlation (has a meaningful zero, signed): diverging, e.g. <code>RdBu_r</code> with <code>center=0</code>. Counts (0 to max): sequential single-hue, e.g. <code>viridis</code> or <code>Blues</code>. Never jet/rainbow.</div></details>
</main>`
});
