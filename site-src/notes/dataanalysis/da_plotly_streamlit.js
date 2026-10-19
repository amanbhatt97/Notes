// notes/dataanalysis/da_plotly_streamlit.js — Plotly & Streamlit
Object.assign(TOPIC_CONTENT, {
  "da_plotly_streamlit": `<main>
  <h1>Plotly &amp; Streamlit</h1>
  <div class="where"><span>Data Analysis</span><span>Interactive</span><span>Plotly &amp; Streamlit</span></div>
  <p class="lead">A PNG chart is a photograph: nobody can hover a point to read its exact value, zoom into one week, or switch the city. This note builds interactive data products as one chain of needs: static charts can't be explored, so Plotly Express makes charts people can hover, zoom and filter (with graph_objects for fine control); but a chart file can't take new input or run Python, so dashboards need an app; Streamlit turns a Python script into that app, and its one rule (rerun the whole script on every interaction, traced here line by line) creates the next needs in turn: widgets, session state, caching, layout, deployment, and finally an ML demo that predicts delivery time. The running example is the same food-delivery orders as the rest of the track: the 8 hand-sized orders and the 1,000-order table from the <a class="xref" data-note="da_numpy">NumPy</a> note's <code>make_orders()</code>. Plotly 7.1 and Streamlit 1.66; every app below was executed with Streamlit's own test runner, <code>AppTest</code>, which runs the script in-process exactly as a server would on each interaction (no browser or server was started for this note).</p>

  <h2 id="ds-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 210" width="640">
<defs><marker id="ds-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="120" y="6" width="400" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">NumPy arrays · Pandas tables · Matplotlib &amp; Seaborn charts</text>
<line x1="320" y1="42" x2="320" y2="64" stroke="currentColor" marker-end="url(#ds-ga)"/>
<rect x="20" y="66" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="90" y="85" text-anchor="middle" font-size="12">NumPy</text><text x="90" y="100" text-anchor="middle" class="tm" font-size="10">arrays</text>
<rect x="180" y="66" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="250" y="85" text-anchor="middle" font-size="12">Pandas</text><text x="250" y="100" text-anchor="middle" class="tm" font-size="10">labelled tables</text>
<rect x="340" y="66" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="410" y="85" text-anchor="middle" font-size="12">Matplotlib &amp; Seaborn</text><text x="410" y="100" text-anchor="middle" class="tm" font-size="10">static charts</text>
<rect x="500" y="66" width="130" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="565" y="85" text-anchor="middle" font-size="12" font-weight="700">Plotly &amp; Streamlit</text><text x="565" y="100" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="160" y1="88" x2="178" y2="88" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ds-ga)"/>
<line x1="320" y1="88" x2="338" y2="88" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ds-ga)"/>
<line x1="480" y1="88" x2="498" y2="88" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ds-ga)"/>
<line x1="565" y1="110" x2="565" y2="148" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#ds-ga)"/>
<rect x="60" y="150" width="570" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="345" y="167" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="345" y="185" text-anchor="middle" font-size="11">APIs &amp; backends (FastAPI) · Docker · MLOps model serving · ML demos for every model you train</text>
</svg><figcaption>The last note of the Data Analysis track: the same charts, now interactive, inside an app other people can use.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="da_viz">Matplotlib &amp; Seaborn</a></b><span>We can choose the right chart, draw it honestly and say the finding. But the result is a still image: every follow-up question ("which day was the peak, exactly?", "only Delhi please") means drawing and sending a new PNG. The data itself comes from <a class="xref" data-note="da_numpy">NumPy</a> arrays and <a class="xref" data-note="da_pandas">Pandas</a> tables (<a class="xref" data-note="da_pd_groupby">groupby</a>, <a class="xref" data-note="da_pd_time">resample</a>).</span></li>
    <li><b>This note adds: interactivity and apps</b><span>Plotly figures that carry their data into the browser (hover, zoom, legend filtering, animation, maps), and Streamlit apps that rerun Python on every input, with widgets, session state, caching, layout and deployment.</span></li>
    <li><b>Leads to: production</b><span>The app's model comes from the ML track (<a class="xref" data-note="ml_pipelines">Pipelines</a>, <a class="xref" data-note="ml_rf">Random Forest</a>); when a demo must become a service other programs call, it becomes an API (<a class="xref" data-note="api_fastapi">FastAPI</a>), packaged with <a class="xref" data-note="se_docker">Docker</a> and served as in <a class="xref" data-note="mlops_deploy">MLOps Deployment</a>.</span></li>
  </ol>

  <h2 id="ds-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Static charts can't be explored</b><span>Q: why isn't a PNG enough? → a PNG is only pixels (240 × 640 × 4 colour values): the 31 daily revenues are gone, so no hover, zoom or filter. We need a chart that carries its data.</span></li>
    <li><b>Plotly Express</b><span>Q: how do we make an explorable chart in one line? → <code>px.scatter(orders8, color="city", hover_data=[…])</code>: 8 rows → 3 traces with hover text; the HTML carries all 31 numbers (8.8 KB). Animation, facets, maps are one argument each. But px decides the structure; what if we need a custom combination?</span></li>
    <li><b>graph_objects (briefly)</b><span>Q: how do we build or adjust a figure piece by piece? → Figure = data (traces) + layout; <code>add_trace</code>, <code>add_hline</code>, <code>make_subplots(shared_xaxes=True)</code> (the honest replacement for dual axes). Still, the chart can only show data baked into it…</span></li>
    <li><b>Dashboards need an app</b><span>Q: how does a reader choose a city, upload a file or get a prediction? → that needs Python running behind the page. A 100,000-order chart is already a 1.16 MB page. Streamlit: the Python script <em>is</em> the app. How does a script react to clicks?</span></li>
    <li><b>The script model: rerun top to bottom</b><span>Q: what runs when the user moves a slider? → the whole script again, every line, traced: slider 3 → ₹1,280; 5 → ₹1,810; 8 → ₹3,100. How does the user give input?</span></li>
    <li><b>Widgets &amp; forms</b><span>Q: how do we read input? → each widget call returns its current value; a form batches inputs until Submit (Delhi, ₹800 → about 40 min). But reruns wipe every variable…</span></li>
    <li><b>Session state</b><span>Q: how do we remember between reruns? → <code>st.session_state</code>: the plain counter stuck at 1, session state counted 1, 2, 3. But reruns also redo slow work…</span></li>
    <li><b>Caching</b><span>Q: how do we avoid reloading data and models every click? → <code>@st.cache_data</code> (copies) and <code>@st.cache_resource</code> (shared): 2.0 s → 0.0 s; new argument = new run (Delhi 1.0 s). Now the page has many elements…</span></li>
    <li><b>Layout</b><span>Q: how do we organise inputs and results? → sidebar, columns, metrics, tabs, expander: Pune ₹162,890, median 27 min (−2 vs all). It works on our laptop; how do others reach it?</span></li>
    <li><b>Deployment</b><span>Q: how do we put it on a server? → Community Cloud or Docker; pin versions, keep secrets out of Git, health check. Finally, the most common real use…</span></li>
    <li><b>Building an ML demo</b><span>Q: how do we let people try a model? → train.py (Pipeline, MAE 3.32 vs 5.96 baseline) + app.py (cached model, form, prediction, history): Delhi, Biryani Bros, ₹900, 8 pm → 46 min.</span></li>
  </ol>

  <h2 id="ds-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Plotly &amp; Streamlit</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why interactive</div>
        <ul>
          <li><b>PNG</b> = pixels only; data, hover, zoom gone</li>
          <li><b>Plotly HTML</b> carries the data (base64 "bdata") + plotly.js draws it</li>
          <li>💡 printed timetable vs the train app</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Plotly Express</div>
        <ul>
          <li><b>px</b> — one call on long data; <code>color=</code> → one trace per group</li>
          <li><b>hover_data</b> → <code>customdata</code> + hovertemplate</li>
          <li><b>facet_col</b>, <b>animation_frame</b> (fix range_y), <b>scatter_map</b></li>
          <li><b>write_html</b> — cdn 11 KB vs full 4.6 MB</li>
          <li>⚠ px wants long data: <code>melt</code> first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">graph_objects</div>
        <ul>
          <li><b>Figure</b> = data (traces) + layout (titles, axes, shapes)</li>
          <li><b>add_trace</b>, <b>add_hline</b>, <b>update_layout</b>; px returns a go.Figure</li>
          <li><b>make_subplots(shared_xaxes=True)</b> instead of dual axes</li>
          <li>💡 px = ready thali; go = à la carte</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streamlit model</div>
        <ul>
          <li><b>Script = app</b>; <code>streamlit run app.py</code></li>
          <li><b>Every interaction reruns the whole script</b>, top to bottom</li>
          <li><b>Consequences</b> — variables reset; remember in session_state; cache slow work</li>
          <li>💡 a spreadsheet recalculating after every edit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Widgets, forms, state</div>
        <ul>
          <li><b>Widgets return values</b>: selectbox, slider, number_input, radio, file_uploader</li>
          <li><b>st.button</b> — True only on the click's rerun</li>
          <li><b>st.form</b> — rerun only on submit</li>
          <li><b>session_state</b> — per-user dict across reruns; init if key missing</li>
          <li>⚠ plain-variable counter stuck at 1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Caching</div>
        <ul>
          <li><b>cache_data</b> — data; returns a copy; <code>ttl</code></li>
          <li><b>cache_resource</b> — models, connections; one shared object</li>
          <li><b>Key</b> = function code + argument values</li>
          <li><b>Measured</b> — 2.0 s → 0.0 s; new city 1.0 s</li>
          <li>⚠ swapped caches: slow copies or shared mutations</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Layout, deploy, ML demo</div>
        <ul>
          <li><b>Layout</b> — sidebar, <code>columns([1,2])</code>, metric, tabs, expander</li>
          <li><b>Deploy</b> — Community Cloud; Docker <code>--server.address=0.0.0.0</code>; <code>/_stcore/health</code></li>
          <li>⚠ pin versions; never commit secrets.toml</li>
          <li><b>ML demo</b> — train.py → joblib → app.py (cache_resource, form, history)</li>
          <li><b>Test</b> — <code>AppTest.from_file(...).run()</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ds-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ds-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Static Charts Can't Be Explored</span><span class="rm-sub">PNG vs interactive</span></div></div>
      <div class="rm-item rm-done" data-target="ds-px"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Plotly Express</span><span class="rm-sub">Hover, facets, animation, maps</span></div></div>
      <div class="rm-item rm-done" data-target="ds-go"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">graph_objects</span><span class="rm-sub">Data + layout, subplots</span></div></div>
      <div class="rm-item rm-done" data-target="ds-appneed"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Dashboards Need an App</span><span class="rm-sub">Why Streamlit</span></div></div>
      <div class="rm-item rm-done" data-target="ds-exec"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Script Model</span><span class="rm-sub">Rerun top to bottom, traced</span></div></div>
      <div class="rm-item rm-done" data-target="ds-widgets"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Widgets &amp; Forms</span><span class="rm-sub">Reading input</span></div></div>
      <div class="rm-item rm-done" data-target="ds-state"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Session State</span><span class="rm-sub">Remember across reruns</span></div></div>
      <div class="rm-item rm-done" data-target="ds-cache"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Caching</span><span class="rm-sub">Why, and measured</span></div></div>
      <div class="rm-item rm-done" data-target="ds-layout"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Layout</span><span class="rm-sub">Sidebar, columns, tabs</span></div></div>
      <div class="rm-item rm-done" data-target="ds-deploy"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Deployment</span><span class="rm-sub">Cloud, Docker, secrets</span></div></div>
      <div class="rm-item rm-done" data-target="ds-ml"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Building an ML Demo</span><span class="rm-sub">Predict delivery time</span></div></div>
      <div class="rm-item rm-done" data-target="ds-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Reruns, caches, pickles</span></div></div>
      <div class="rm-item rm-done" data-target="ds-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="ds-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ds-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ds-need"><span class="num">01</span>Static Charts Can't Be Explored</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In <a class="xref" data-note="da_viz">Matplotlib &amp; Seaborn</a> we sent the operations manager a daily-revenue chart. She replies: "what exactly was the peak?", "show me only Delhi", "zoom into the third week". Can the PNG answer any of that?</p>
  </div>
  <p>Look at what each kind of chart file actually contains. First the setup used throughout the note: the 1,000 orders from the NumPy note's <code>make_orders()</code> (saved as a small module, <code>orders_data.py</code>) and the 8 hand-sized orders.</p>
  <div class="fx" data-lang="py">import os, time
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from orders_data import make_orders          # the NumPy note's generator, saved as a module

orders = pd.DataFrame(make_orders())          # 1,000 orders, seed 42
orders8 = pd.DataFrame({
    "order_id": range(1, 9),
    "restaurant": ["Pizza Hub", "Dosa Point", "Biryani Bros", "Pizza Hub",
                   "Dosa Point", "Biryani Bros", "Pizza Hub", "Dosa Point"],
    "city": ["Pune", "Delhi", "Pune", "Mumbai", "Pune", "Delhi", "Delhi", "Mumbai"],
    "amount": [450, 220, 610, 380, 150, 720, 300, 270],
    "delivery_minutes": [32, 25, 41, 28, 18, 45, 30, 21]})
print(orders.shape, orders8.shape)</div>
  <div class="fx" data-lang="text">(1000, 7) (8, 5)</div>
  <div class="fx" data-lang="py">import json, base64
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

daily = orders.set_index("order_time").amount.resample("D").sum()
fig, ax = plt.subplots(figsize=(8, 3))
ax.plot(daily.index, daily.values)
fig.savefig("daily.png", dpi=80); plt.close(fig)
pixels = plt.imread("daily.png")                  # all a PNG can give back
print("PNG :", pixels.shape, "= rows x columns x RGBA colour values, nothing else")

fig_i = px.line(daily.reset_index(), x="order_time", y="amount")
fig_i.write_html("daily.html", include_plotlyjs="cdn")
html = open("daily.html").read()
y = json.loads(fig_i.to_json())["data"][0]["y"]   # how the y values are written into the page
vals = np.frombuffer(base64.b64decode(y["bdata"]), dtype=y["dtype"])
print("HTML:", f"{len(html)/1024:.1f} KB | inside it:", len(vals), "numbers, max", vals.max(),
      "| hover text:", fig_i.data[0].hovertemplate, "| data in page?", y["bdata"] in html)</div>
  <div class="fx" data-lang="text">PNG : (240, 640, 4) = rows x columns x RGBA colour values, nothing else
HTML: 8.8 KB | inside it: 31 numbers, max 18180.0 | hover text: order_time=%{x}&lt;br&gt;amount=%{y}&lt;extra&gt;&lt;/extra&gt; | data in page? True</div>
  <p>Reading the PNG back gives a 240 × 640 grid of RGBA colours, nothing else: the 31 daily revenues were turned into coloured pixels, and pixels can't be hovered, filtered or re-scaled. The Plotly version is an HTML page (8.8 KB) that contains the 31 numbers themselves (encoded in base64 as "bdata"; decoded, the maximum is 18,180, the 24 March peak from the viz note) plus a hover template. A JavaScript library, plotly.js, draws the chart in the browser from that data, so the reader can hover any day, drag to zoom, double-click to reset, and click legend entries to hide series.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A printed railway timetable versus the train app. Same data, but in the app you tap a train to see its coaches, scroll to tomorrow, and filter to your station. The print can only be reprinted.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>interactive chart</strong> ships the data and a drawing program to the viewer, so the viewer's actions (hover, zoom, pan, toggle) are answered on their device without asking the author. <strong>Plotly</strong>: a Python library that builds such charts as a JSON description rendered by plotly.js.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Interactivity is not free: the data travels with the chart (privacy: never put customer phone numbers in hover text you email out), and huge datasets make huge pages (section 04). For a report or a PDF, a good static chart is still the right choice.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Plotly Express.</b> We need charts that carry their data. How do we make one from a DataFrame in a single call, and what does Plotly build inside it?</div>

  <h2 id="ds-px"><span class="num">02</span>Plotly Express</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want the amount-vs-minutes scatter of the 8 orders, one colour per city, with the order id and restaurant shown on hover. In Matplotlib that was a loop per city and no hover at all. Can one call do it, and how is the figure organised?</p>
  </div>
  <p><strong>Plotly Express</strong> (<code>px</code>) makes a whole figure from a DataFrame in one call. It needs <strong>long (tidy)</strong> data, the same rule as Seaborn: one row per point, a column that names the group. With <code>color="city"</code> px splits the rows by city and makes one <strong>trace</strong> per city: one set of points with its own colour and legend entry.</p>
  <table class="tbl out"><caption>Traced by hand: 8 rows → 3 traces</caption>
    <tr><th>rows (order_id)</th><th>city</th><th>becomes</th></tr>
    <tr><td>1, 3, 5</td><td>Pune</td><td>trace 0: x = [450, 610, 150], y = [32, 41, 18]</td></tr>
    <tr><td>2, 6, 7</td><td>Delhi</td><td>trace 1: x = [220, 720, 300], y = [25, 45, 30]</td></tr>
    <tr><td>4, 8</td><td>Mumbai</td><td>trace 2: x = [380, 270], y = [28, 21]</td></tr>
  </table>
  <div class="fx" data-lang="py">fig = px.scatter(orders8, x="amount", y="delivery_minutes", color="city",
                 hover_data=["order_id", "restaurant"],
                 title="Bigger orders take longer")
print(type(fig).__name__, len(fig.data), [t.name for t in fig.data])
print(fig.data[0].x, fig.data[0].y)
print(fig.data[0].hovertemplate)
print(fig.data[0].customdata.tolist())</div>
  <div class="fx" data-lang="text">Figure 3 ['Pune', 'Delhi', 'Mumbai']
[450 610 150] [32 41 18]
city=Pune&lt;br&gt;amount=%{x}&lt;br&gt;delivery_minutes=%{y}&lt;br&gt;order_id=%{customdata[0]}&lt;br&gt;restaurant=%{customdata[1]}&lt;extra&gt;&lt;/extra&gt;
[[1, 'Pizza Hub'], [3, 'Biryani Bros'], [5, 'Dosa Point']]</div>
  <p><code>fig.data</code> is the list of traces: exactly the three from the hand table, in order of first appearance. Pune's trace holds x = [450 610 150] and y = [32 41 18]. px also wrote a <strong>hover template</strong>, the text shown on hover: <code>%{x}</code> and <code>%{y}</code> are filled with the point's values, <code>&lt;br&gt;</code> is a line break. The <code>hover_data</code> columns went into <code>customdata</code>, one small list per point ([1, 'Pizza Hub'] for order 1), read as <code>%{customdata[0]}</code> and <code>%{customdata[1]}</code>. <code>fig.show()</code> opens it in a notebook or browser.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>At a restaurant, a thali (px) arrives complete: dal, rice, sabzi, roti, all matched. À la carte (graph_objects, next section) means ordering each dish yourself. The usual workflow: order the thali, then add one extra dish.</p></div>
  <h3>Animation, facets, maps and sharing on 1,000 orders</h3>
  <div class="fx" data-lang="py">orders["week"] = (orders.order_time.dt.day - 1) // 7 + 1          # week 1..5 of March
weekly = orders.groupby(["week", "city"], as_index=False).amount.sum()
print(weekly.head(3).to_string(index=False))

fig = px.bar(weekly, x="city", y="amount", animation_frame="week",
             range_y=[0, weekly.amount.max() * 1.1])           # fixed axis: only bars move
print(len(fig.frames), [f.name for f in fig.frames])
print([f.data[0].y.tolist() for f in fig.frames[:2]])
print(fig.layout.yaxis.range, len(fig.layout.sliders[0].steps))

fig_f = px.histogram(orders, x="delivery_minutes", facet_col="city", nbins=20)
print("facets:", len(fig_f.data), [a.text for a in fig_f.layout.annotations])

geo = (orders.groupby("city").agg(n=("order_id", "count"), minutes=("delivery_minutes", "mean"))
       .reset_index().assign(lat=lambda d: d.city.map({"Pune": 18.52, "Delhi": 28.61, "Mumbai": 19.08}),
                             lon=lambda d: d.city.map({"Pune": 73.86, "Delhi": 77.21, "Mumbai": 72.88})))
fig_map = px.scatter_map(geo, lat="lat", lon="lon", size="n", color="minutes", hover_name="city",
                         zoom=3.5, map_style="carto-positron")    # no API token needed
print(fig_map.data[0].type, fig_map.data[0].marker.size.tolist(), geo.minutes.round(1).tolist())

fig_f.write_html("cdn.html", include_plotlyjs="cdn")              # loads plotly.js from the internet
fig_f.write_html("full.html")                                     # plotly.js copied into the file
print(f"cdn: {os.path.getsize('cdn.html')/1024:.0f} KB, full: {os.path.getsize('full.html')/1024/1024:.1f} MB")</div>
  <div class="fx" data-lang="text"> week   city  amount
    1  Delhi 29940.0
    1 Mumbai 27430.0
    1   Pune 38180.0
5 ['1', '2', '3', '4', '5']
[[29940.0, 27430.0, 38180.0], [40620.0, 23860.0, 36660.0]]
(0, 45023.0) 5
facets: 3 ['city=Delhi', 'city=Mumbai', 'city=Pune']
scattermap [341, 257, 402] [32.9, 31.0, 27.9]
cdn: 11 KB, full: 4.6 MB</div>
  <ul>
    <li><strong>Animation</strong>: <code>animation_frame="week"</code> made one <strong>frame</strong> per week (5), each holding that week's three city totals (week 1: Delhi ₹29,940, Mumbai ₹27,430, Pune ₹38,180), plus a play button and a slider with 5 steps. <code>range_y</code> fixed the y-axis to [0, 45,023] (10% above the largest weekly total); without it the axis rescales every frame and a bar can look shorter while growing.</li>
    <li><strong>Facets</strong>: <code>facet_col="city"</code> drew one small histogram per city, side by side, with shared axes: three traces.</li>
    <li><strong>Maps</strong>: <code>scatter_map</code> puts a bubble on each city's latitude/longitude; size = number of orders (Delhi 341, Mumbai 257, Pune 402), colour = average minutes (Delhi slowest at 32.9). The carto-positron base map needs no API key. For regions (states, districts) use <code>px.choropleth</code> with a GeoJSON file of boundaries.</li>
    <li><strong>Sharing</strong>: <code>write_html(include_plotlyjs="cdn")</code> makes an 11 KB file that downloads plotly.js when opened (needs internet); the default embeds the 4.6 MB library so it works offline.</li>
  </ul>
  <table class="tbl">
    <tr><th>Need</th><th>Code</th></tr>
    <tr><td>Rich hover</td><td><code>px.scatter(df, x=, y=, color=, hover_data=["order_id", "restaurant"])</code></td></tr>
    <tr><td>Distribution + marginal</td><td><code>px.histogram(df, x="delivery_minutes", color="city", marginal="box", barmode="overlay")</code></td></tr>
    <tr><td>Hierarchy</td><td><code>px.treemap(df, path=["city", "restaurant"], values="amount")</code></td></tr>
    <tr><td>Small multiples</td><td><code>facet_col="city"</code>, <code>facet_row=</code></td></tr>
    <tr><td>Change over time</td><td><code>animation_frame="week"</code> + fixed <code>range_y</code></td></tr>
    <tr><td>Where</td><td><code>px.scatter_map(lat=, lon=, size=)</code>, <code>px.choropleth(geojson=, locations=)</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Trace</strong>: one series drawn on a Plotly figure (a set of points, a line, bars). <strong>Frame</strong>: one state of an animated figure. <strong>Long (tidy) data</strong>: one row per observation, a column naming the group. <strong>CDN</strong>: a public server that hosts libraries so pages can load them.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>px wants long data. A wide table (one column per city) gives one series with the wrong values or an error: <code>df.melt(id_vars="week", var_name="city", value_name="amount")</code> first. On animations, fix <code>range_x</code>/<code>range_y</code> and make sure every frame has every category, or bars pop in and out. <code>scatter_mapbox</code> is the deprecated older name of <code>scatter_map</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: graph_objects.</b> px decides the structure for us: one trace per colour, its own layout. In the viz note we learned to replace dual axes with two stacked panels sharing an x-axis, and to add reference lines. How do we build or change a Plotly figure piece by piece?</div>

  <h2 id="ds-go"><span class="num">03</span>graph_objects (briefly)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Orders per day and average delivery minutes: we want two stacked panels that zoom together, a dotted average line, and our own title. px makes single charts; what is a Plotly figure made of, so we can assemble one ourselves?</p>
  </div>
  <p>Every Plotly figure, including every px figure, is a <code>plotly.graph_objects.Figure</code> (imported as <code>go</code>) with two parts: <strong>data</strong>, a list of traces, and <strong>layout</strong>, everything that is not data (titles, axes, legend, shapes such as reference lines, template).</p>
  <div class="fx" data-lang="py">by_day = orders.set_index("order_time").resample("D").agg(
    n_orders=("order_id", "count"), avg_minutes=("delivery_minutes", "mean")).reset_index()

fig = go.Figure()
fig.add_trace(go.Bar(x=by_day.order_time, y=by_day.n_orders, name="orders"))
fig.add_hline(y=by_day.n_orders.mean(), line_dash="dot",
              annotation_text=f"avg {by_day.n_orders.mean():.1f}")
fig.update_layout(title="Orders per day, March", template="plotly_white")
d = fig.to_dict()
print(list(d), len(d["data"]), d["data"][0]["type"], len(fig.layout.shapes), fig.layout.title.text)</div>
  <div class="fx" data-lang="text">['data', 'layout'] 1 bar 1 Orders per day, March</div>
  <p>The figure is literally a dictionary with keys <code>data</code> and <code>layout</code>; that dictionary, as JSON, is what goes into the HTML. One bar trace, one <strong>shape</strong> (the dotted average line added by <code>add_hline</code>), and the title set by <code>update_layout</code>.</p>
  <h3>Stacked panels with a shared x-axis</h3>
  <div class="fx" data-lang="py">from plotly.subplots import make_subplots
fig2 = make_subplots(rows=2, cols=1, shared_xaxes=True,
                     subplot_titles=["Orders per day", "Average delivery minutes"])
fig2.add_trace(go.Bar(x=by_day.order_time, y=by_day.n_orders, name="orders"), row=1, col=1)
fig2.add_trace(go.Scatter(x=by_day.order_time, y=by_day.avg_minutes, name="minutes"), row=2, col=1)
print(len(fig2.data), [t.xaxis + "/" + t.yaxis for t in fig2.data])
print(fig2.layout.xaxis.matches, fig2.layout.xaxis2.matches)

px_fig = px.line(by_day, x="order_time", y="avg_minutes")         # px returns a go.Figure...
px_fig.add_trace(go.Scatter(x=by_day.order_time, y=[30] * len(by_day), name="target"))  # ...so go adds to it
print(type(px_fig).__name__, [t.type for t in px_fig.data])</div>
  <div class="fx" data-lang="text">2 ['x/y', 'x2/y2']
x2 None
Figure ['scatter', 'scatter']</div>
  <p><code>make_subplots(rows=2, cols=1, shared_xaxes=True)</code> creates two panels; <code>row=, col=</code> chooses where each trace goes. The first trace uses axes x/y, the second x2/y2, and the top x-axis has <code>matches="x2"</code>: zoom into one week on either panel and both follow. This is the honest replacement for the dual-axis chart from <a class="xref" data-note="da_viz">Matplotlib &amp; Seaborn</a> section 07: each series keeps its own y-scale, and nobody can fake an alignment. The last lines show the usual workflow: px returns a <code>go.Figure</code>, so you can <code>add_trace</code> a go trace (here a 30-minute target line) to a px chart.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Figure</strong> = <strong>data</strong> (list of traces such as <code>go.Bar</code>, <code>go.Scatter</code>) + <strong>layout</strong> (titles, axes, legend, shapes, annotations, template). <code>add_trace</code>, <code>add_hline/vline</code>, <code>update_layout</code>, <code>update_traces</code> modify any figure.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>go.Scatter</code> with default <code>mode</code> draws lines between points; for a scatter plot pass <code>mode="markers"</code>. px sets this for you, go does not.</p></div>
  <p>Interviews ask "Plotly or Matplotlib?": Plotly for exploration, dashboards and web apps; Matplotlib/Seaborn for static figures in papers, PDFs and reports.</p>
  <div class="bridge"><b>What this still can't tell us → next: Dashboards Need an App.</b> Every chart so far can only show the data baked into its file. The manager now wants to pick any city, upload this week's CSV, or type an order and get a predicted delivery time. Can an HTML chart do that?</div>

  <h2 id="ds-appneed"><span class="num">04</span>Dashboards Need an App</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A Plotly HTML file can hover and filter what is already inside it. It cannot run Python: no new query, no model prediction, no reading an uploaded file. And everything it shows must be shipped inside the page. Where does that break?</p>
  </div>
  <div class="fx" data-lang="py">for n in (1_000, 100_000):
    big = pd.DataFrame(make_orders(n))
    f = px.scatter(big, x="amount", y="delivery_minutes", color="city")
    f.write_html("scale.html", include_plotlyjs="cdn")
    print(f"{n:&gt;7,} orders -&gt; HTML {os.path.getsize('scale.html')/1024/1024:.2f} MB")</div>
  <div class="fx" data-lang="text">  1,000 orders -&gt; HTML 0.02 MB
100,000 orders -&gt; HTML 1.16 MB</div>
  <p>The page grows with the data: 1,000 orders make a 0.02 MB page, 100,000 orders a 1.16 MB page, and a year of a real company's orders would not fit in a browser tab. A real dashboard keeps the data on a server and sends only what the user asks for: "Delhi, last week, as a chart". That needs a program running behind the page that reacts to the user's inputs: a <strong>web app</strong>.</p>
  <table class="tbl">
    <tr><th>The user wants to…</th><th>Plotly HTML file</th><th>An app with Python behind it</th></tr>
    <tr><td>hover, zoom, hide a series</td><td>yes</td><td>yes</td></tr>
    <tr><td>choose any city / date range from all data</td><td>only if all data is in the page</td><td>yes, query on demand</td></tr>
    <tr><td>upload a CSV and see it charted</td><td>no</td><td>yes</td></tr>
    <tr><td>get a model's prediction for new inputs</td><td>no</td><td>yes</td></tr>
    <tr><td>see today's data, not the day you exported</td><td>no</td><td>yes</td></tr>
  </table>
  <p>A normal web app means HTML, JavaScript, an API server, and code that says "when this slider changes, call this function, then update that part of the page". That is a week of work in other languages. <strong>Streamlit</strong> removes all of it: you write a plain Python script with calls like <code>st.selectbox</code> and <code>st.write</code>, and Streamlit turns it into a web page with live widgets. A complete app:</p>
  <div class="fx" data-lang="py"># hello_app.py: a whole web app
import streamlit as st

st.title("Delivery dashboard")
city = st.selectbox("City", ["Pune", "Delhi", "Mumbai"])
st.write(f"You picked {city}.")</div>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest
at = AppTest.from_file("hello_app.py").run()
print(at.title[0].value, "|", at.markdown[0].value)
at.selectbox[0].select("Delhi").run()
print(at.title[0].value, "|", at.markdown[0].value)</div>
  <div class="fx" data-lang="text">Delivery dashboard | You picked Pune.
Delivery dashboard | You picked Delhi.</div>
  <p><code>AppTest</code> (Streamlit's testing tool) runs the script as the server would, lets us operate the widgets from Python, and reads back what the page shows. Picking Delhi changed the text. Nowhere did we write "when the selectbox changes, update the text". How did the text know? That is the next section.</p>
  <div class="fx" data-lang="text">pip install streamlit
streamlit run app.py          # dev server on http://localhost:8501; reruns on file save too</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A chart file is a printed menu: you can read it, but it can't cook. An app is the restaurant: you place an order (input), the kitchen (Python) cooks it, and the waiter brings exactly what you asked for.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Streamlit</strong>: an open-source Python framework that serves a script as an interactive web app; widget calls draw inputs and return their values, output calls (<code>st.write</code>, <code>st.metric</code>, <code>st.plotly_chart</code>) draw results. <strong>Dashboard</strong>: an app whose main job is showing data that the user can filter.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Streamlit is for internal tools, dashboards and demos. A public product with many users, custom design and complex interactions usually needs a real frontend with an API behind it (<a class="xref" data-note="api_fastapi">FastAPI</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Script Model.</b> The text followed the selectbox without any event-handling code. What exactly does Streamlit run when a widget changes?</div>

  <h2 id="ds-exec"><span class="num">05</span>The Script Model: Rerun Top to Bottom</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In a normal program a line runs once. In the hello app the <code>st.write</code> line produced new text after the user picked Delhi. Which lines run when the user moves a widget, and in what order?</p>
  </div>
  <p>The rule: <strong>every time the user changes anything, Streamlit runs your whole script again, from the first line to the last</strong>, and redraws the page from what that run produced. A widget call like <code>st.slider(...)</code> draws the slider and returns its <em>current</em> value. There are no callbacks to wire: the script is the app.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="ds-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="110" height="44" class="ft st"/><text x="22" y="60">user moves</text><text x="22" y="76">a slider</text>
    <path d="M120 62 L170 62" stroke="currentColor" marker-end="url(#ds-ar)"/>
    <rect x="172" y="14" width="200" height="100" class="fb sb"/><text x="184" y="34">app.py runs again,</text><text x="184" y="52">line 1 → last line</text>
    <text x="184" y="76" class="tm">variables reset</text><text x="184" y="94" class="tm">cached fns skipped</text>
    <path d="M372 62 L422 62" stroke="currentColor" marker-end="url(#ds-ar)"/>
    <rect x="424" y="40" width="160" height="44" class="fg sg"/><text x="436" y="60">browser shows</text><text x="436" y="76">the new page</text>
    <path d="M504 84 L504 134 L65 134 L65 86" stroke="currentColor" fill="none" marker-end="url(#ds-ar)"/><text x="200" y="128" class="tm">every interaction repeats the loop</text>
  </svg><figcaption>No callbacks: the script is the UI. The cost: everything reruns unless you cache it or store it in session_state.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A spreadsheet. Change one cell and every formula recalculates; you never write "when B2 changes, update C7". Simple and always consistent, until one cell is a 10-second calculation: then every edit waits 10 seconds.</p></div>
  <h3>Traced: which lines run</h3>
  <p>An app that totals the first n of our 8 orders, and appends to a log every time a line runs (the log lives in a separate module, which Streamlit does not rerun, so it survives):</p>
  <div class="fx" data-lang="py"># trace_app.py: record every line the script runs
import streamlit as st
import calls                                     # a module whose list survives reruns

AMOUNTS = [450, 220, 610, 380, 150, 720, 300, 270]
calls.log.append("start")
n = st.slider("Orders to include", 1, 8, 3)
calls.log.append(f"slider returned {n}")
total = sum(AMOUNTS[:n])
st.write(f"First {n} orders: ₹{total}")
calls.log.append(f"wrote ₹{total}")</div>
  <div class="fx" data-lang="py">import calls
calls.log.clear()
at = AppTest.from_file("trace_app.py").run()
print("page:", at.markdown[0].value, "| log:", calls.log)
for v in (5, 8):
    calls.log.clear()
    at.slider[0].set_value(v).run()
    print("page:", at.markdown[0].value, "| log:", calls.log)</div>
  <div class="fx" data-lang="text">page: First 3 orders: ₹1280 | log: ['start', 'slider returned 3', 'wrote ₹1280']
page: First 5 orders: ₹1810 | log: ['start', 'slider returned 5', 'wrote ₹1810']
page: First 8 orders: ₹3100 | log: ['start', 'slider returned 8', 'wrote ₹3100']</div>
  <table class="tbl out"><caption>What happens on each run</caption>
    <tr><th>event</th><th>lines run</th><th>n</th><th>total</th><th>page shows</th></tr>
    <tr><td>page opened</td><td>all, top to bottom</td><td>3 (default)</td><td>450 + 220 + 610 = 1280</td><td>₹1280</td></tr>
    <tr><td>slider moved to 5</td><td>all, top to bottom</td><td>5</td><td>1280 + 380 + 150 = 1810</td><td>₹1810</td></tr>
    <tr><td>slider moved to 8</td><td>all, top to bottom</td><td>8</td><td>1810 + 720 + 300 + 270 = 3100</td><td>₹3100</td></tr>
  </table>
  <p>Every interaction produced the full sequence "start → slider returned n → wrote ₹total". The totals are the running sums from the NumPy note (<code>np.add.accumulate</code>: 450, 670, 1280, 1660, 1810, …, 3100). Any variable is created again from scratch on each run. That is perfect for <code>total</code>, which should be recomputed, and wrong for two kinds of things: anything to <em>remember</em> between runs (section 07) and anything <em>slow</em> to compute (section 08).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Rerun</strong>: Streamlit executing the script again after an interaction. <strong>Session</strong>: one browser tab's connection to the app; each user has their own reruns and state. <strong>Callback</strong> (in other frameworks): a function registered to run on an event; Streamlit mostly replaces these with reruns.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Loading a CSV or model at the top of the script without caching means reloading it on every click. The app works on your laptop with a small file and crawls in production.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Widgets &amp; Forms.</b> The slider was our only input. Real apps need dropdowns, numbers, text, file uploads and buttons, and sometimes several inputs that should be sent together. Which widgets exist, and how do they behave under reruns?</div>

  <h2 id="ds-widgets"><span class="num">06</span>Widgets &amp; Forms</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To estimate a delivery time the user must give a city and an order amount. If each change reruns the whole script, typing ₹800 into a box triggers a run per keystroke-commit, and a slow estimate runs for every half-finished input. How do we read inputs, and how do we wait until the user is done?</p>
  </div>
  <p><strong>Widgets</strong> are the inputs. Each is one function call that draws the widget and returns its current value, so you use it like any other variable.</p>
  <table class="tbl">
    <tr><th>Widget</th><th>Returns</th></tr>
    <tr><td><code>st.selectbox("City", options)</code></td><td>chosen item</td></tr>
    <tr><td><code>st.slider("Orders", 1, 8, 3)</code></td><td>number (min, max, default)</td></tr>
    <tr><td><code>st.number_input("Amount", 50, 5000, 400, step=50)</code></td><td>number</td></tr>
    <tr><td><code>st.radio</code>, <code>st.multiselect</code>, <code>st.select_slider</code></td><td>item / list / item</td></tr>
    <tr><td><code>st.text_input</code>, <code>st.date_input</code></td><td>value</td></tr>
    <tr><td><code>st.file_uploader("CSV", type="csv")</code></td><td>file-like object or None</td></tr>
    <tr><td><code>st.button("Go")</code></td><td>True only on the rerun right after the click</td></tr>
  </table>
  <p><strong>Forms.</strong> Widgets inside <code>st.form</code> don't trigger a rerun when changed; the script reruns only when the form's submit button is pressed, with all the new values at once. The estimate uses the same rule the data generator used (15 + amount / 40 + city traffic):</p>
  <div class="fx" data-lang="py"># form_app.py
import streamlit as st

with st.form("estimate"):                     # widgets inside don't trigger reruns...
    city = st.selectbox("City", ["Pune", "Delhi", "Mumbai"])
    amount = st.number_input("Order amount (₹)", 50, 5000, 400, step=50)
    submitted = st.form_submit_button("Estimate")   # ...until this is pressed

if submitted:
    extra = {"Pune": 0, "Delhi": 5, "Mumbai": 3}[city]
    st.session_state.last = f"{city}, ₹{amount}: about {15 + amount / 40 + extra:.0f} min"
st.write("last estimate:", st.session_state.get("last", "none"))</div>
  <div class="fx" data-lang="py">calls.log.clear()
at = AppTest.from_file("form_app.py").run()
print("start        -&gt;", at.markdown[0].value)
at.selectbox[0].select("Delhi")              # change inputs inside the form...
at.number_input[0].set_value(800)
at.button[0].click().run()                   # ...then press "Estimate"
print("after submit -&gt;", at.markdown[0].value)</div>
  <div class="fx" data-lang="text">start        -&gt; last estimate: none
after submit -&gt; last estimate: Delhi, ₹800: about 40 min</div>
  <p>By hand: Delhi, ₹800 → 15 + 800 / 40 + 5 = 40 minutes. Both new values arrived together in one run, and <code>submitted</code> was True only in that run, which is why the result is copied into <code>st.session_state</code> (next section) before the page is drawn.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A form is a paper order slip: you fill in every box, then hand it over once. Without a form, the kitchen would start cooking every time you wrote one letter.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Widget</strong>: an input element whose current value is returned by its Streamlit call on every run. <strong><code>st.form</code></strong>: a container that batches its widgets' changes until its <code>form_submit_button</code> is pressed.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>st.button</code> and <code>form_submit_button</code> are True for one rerun only. Code like "if clicked: compute result" followed later by "show result" works once and the result vanishes on the next interaction.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Session State.</b> The estimate disappeared on the next rerun unless we stored it somewhere. Every variable is reset by the rerun rule. Where can an app keep things between runs: a count, a login, a history of predictions?</div>

  <h2 id="ds-state"><span class="num">07</span>Session State</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The support team clicks "Flag a late order" each time a customer complains. We want a running count. With the rerun rule, can an ordinary variable count clicks?</p>
  </div>
  <p>The app keeps the count two ways: a plain variable and <code>st.session_state</code>, and shows what <code>st.button</code> returned on each run.</p>
  <div class="fx" data-lang="py"># counter_app.py
import streamlit as st

count = 0                                   # plain variable: reset on every rerun
if "flagged" not in st.session_state:
    st.session_state.flagged = 0            # initialised once per browser session

clicked = st.button("Flag a late order")    # True only on the rerun caused by the click
if clicked:
    count += 1
    st.session_state.flagged += 1
st.write(f"button: {clicked} | plain variable: {count} | session_state: {st.session_state.flagged}")</div>
  <div class="fx" data-lang="py">at = AppTest.from_file("counter_app.py").run()
print("first load    -&gt;", at.markdown[0].value)
for i in range(1, 4):
    at.button[0].click().run()
    print(f"after click {i} -&gt;", at.markdown[0].value)
at.run()                                    # a rerun with no click (e.g. another widget moved)
print("no click      -&gt;", at.markdown[0].value)</div>
  <div class="fx" data-lang="text">first load    -&gt; button: False | plain variable: 0 | session_state: 0
after click 1 -&gt; button: True | plain variable: 1 | session_state: 1
after click 2 -&gt; button: True | plain variable: 1 | session_state: 2
after click 3 -&gt; button: True | plain variable: 1 | session_state: 3
no click      -&gt; button: False | plain variable: 0 | session_state: 3</div>
  <p>Read it row by row. Each click reruns the script: <code>count = 0</code> runs again, then <code>+= 1</code>, so the plain variable is stuck at 1. The session-state value is set to 0 only when the key is missing (the very first run), so it counts 1, 2, 3. On the last rerun nobody clicked, so <code>st.button</code> returned False and the plain variable fell back to 0, while session state kept 3. Widgets created with <code>key="name"</code> also store their value in <code>st.session_state["name"]</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A whiteboard wiped clean every time someone enters the room (rerun). Anything written on it is lost. <code>st.session_state</code> is a personal locker next to the board: wiping the board doesn't touch the locker, and each visitor has their own locker.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>st.session_state</code></strong>: a dictionary-like object, one per user session, that survives reruns (lost when the tab is closed or the server restarts). Read and write it like a dict or with attributes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Always initialise with <code>if key not in st.session_state:</code>. Writing <code>st.session_state.flagged = 0</code> unconditionally resets it every run, which is the plain-variable bug again. Session state is per user: it is not a shared database; two managers see two different counts.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Caching.</b> The rerun rule resets what we want to keep (fixed by session state) and also repeats what we don't want to repeat: loading the orders table and the model on every single click. How do we compute slow things once?</div>

  <h2 id="ds-cache"><span class="num">08</span>Caching</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A dashboard that queries the orders database (1 s) and loads a model (1 s) at the top of the script makes the user wait 2 s after every click, because every click reruns those lines. Can we run them once and reuse the result, and is that safe when many users share the app?</p>
  </div>
  <p><strong>Caching</strong> fixes it: decorate the slow function, and Streamlit runs its body once per distinct set of arguments, stores the result, and returns the stored result on later calls, across reruns and across users. There are two caches because there are two kinds of slow things. <strong>Data</strong> (DataFrames, query results): each caller gets its own <em>copy</em>, so one user editing their DataFrame can't change anyone else's. <strong>Resources</strong> (an ML model, a database connection): one shared object, because copying a 500 MB model per call would be slow and a connection can't be copied at all.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>cache_data</code> is a master document kept at the office: everyone who asks gets a photocopy and can scribble on it freely. <code>cache_resource</code> is the one office printer: everybody uses the same machine; if someone changes its settings, everyone gets those settings.</p></div>
  <p>The app below counts how often each function body really runs, times each run, and checks whether two calls return the same object:</p>
  <div class="fx" data-lang="py"># cache_app.py
import time
import pandas as pd
import streamlit as st
import calls
from orders_data import make_orders

@st.cache_data
def load_orders(city):
    calls.log.append(f"load_orders({city})")
    time.sleep(1)                                   # pretend: a slow database query
    df = pd.DataFrame(make_orders())
    return df[df.city == city]

@st.cache_resource
def load_model():
    calls.log.append("load_model()")
    time.sleep(1)                                   # pretend: a 500 MB ML model
    return {"base": 15, "per_rupee": 1 / 40}

city = st.selectbox("City", ["Pune", "Delhi", "Mumbai"])
t0 = time.perf_counter()
df1, df2 = load_orders(city), load_orders(city)
m1, m2 = load_model(), load_model()
st.write(f"{city}: {len(df1)} orders in {time.perf_counter() - t0:.1f}s | "
         f"data same object? {df1 is df2} | model same object? {m1 is m2}")</div>
  <div class="fx" data-lang="py">calls.log.clear()
at = AppTest.from_file("cache_app.py", default_timeout=20).run()
print("run 1 (Pune)  -&gt;", at.markdown[0].value)
at.run()
print("run 2 (Pune)  -&gt;", at.markdown[0].value)
at.selectbox[0].select("Delhi").run()
print("run 3 (Delhi) -&gt;", at.markdown[0].value)
at.selectbox[0].select("Pune").run()
print("run 4 (Pune)  -&gt;", at.markdown[0].value)
print("function bodies actually run:", calls.log)</div>
  <div class="fx" data-lang="text">run 1 (Pune)  -&gt; Pune: 402 orders in 2.0s | data same object? False | model same object? True
run 2 (Pune)  -&gt; Pune: 402 orders in 0.0s | data same object? False | model same object? True
run 3 (Delhi) -&gt; Delhi: 341 orders in 1.0s | data same object? False | model same object? True
run 4 (Pune)  -&gt; Pune: 402 orders in 0.0s | data same object? False | model same object? True
function bodies actually run: ['load_orders(Pune)', 'load_model()', 'load_orders(Delhi)']</div>
  <table class="tbl out"><caption>The four runs explained</caption>
    <tr><th>run</th><th>load_orders</th><th>load_model</th><th>time</th></tr>
    <tr><td>1 Pune</td><td>body runs once (miss), 2nd call hit</td><td>body runs once (miss)</td><td>1 + 1 = 2.0 s</td></tr>
    <tr><td>2 Pune</td><td>hit</td><td>hit</td><td>0.0 s</td></tr>
    <tr><td>3 Delhi</td><td>new argument = new key: body runs</td><td>hit</td><td>1.0 s</td></tr>
    <tr><td>4 Pune</td><td>hit (Pune is still stored)</td><td>hit</td><td>0.0 s</td></tr>
  </table>
  <p>The log confirms only three bodies ever ran. <code>df1 is df2</code> is False every time (cache_data hands out copies: each call gets its own 402 Pune orders) while <code>m1 is m2</code> is True (cache_resource shares one object).</p>
  <table class="tbl">
    <tr><th></th><th><code>@st.cache_data</code></th><th><code>@st.cache_resource</code></th></tr>
    <tr><td>For</td><td>Data: DataFrames, query results, API responses</td><td>Resources: ML models, DB connections, LLM clients</td></tr>
    <tr><td>Returns</td><td>A fresh <strong>copy</strong> each call (pickled)</td><td>The <strong>same object</strong> to every user</td></tr>
    <tr><td>Mutation safe?</td><td>Yes, callers can't corrupt the cache</td><td>No, a change is seen by everyone</td></tr>
    <tr><td>Key</td><td colspan="2">Function code + argument values. Options: <code>ttl="1h"</code> (expire), <code>max_entries</code>, <code>.clear()</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Cache key</strong>: what Streamlit uses to decide "have I seen this call before?" (the function's code plus its argument values). <strong>TTL</strong> (time to live): how long a cached value is kept before the function runs again, e.g. <code>@st.cache_data(ttl="1h")</code> for orders that change hourly.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Cache a model with <code>cache_data</code> and every rerun unpickles a copy (slow, memory-hungry). Cache a DataFrame with <code>cache_resource</code> and one user's in-place edit leaks to all users. Arguments must be hashable; prefix one with <code>_</code> (e.g. <code>_conn</code>) to tell Streamlit not to hash it. And a cache without <code>ttl</code> shows yesterday's orders forever.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Layout.</b> The app is now fast and remembers. With a filter, two metrics, a chart and two tables, the default single column stacks everything top to bottom and the user scrolls past inputs to find results. How do we arrange a page?</div>

  <h2 id="ds-layout"><span class="num">09</span>Layout</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Fifteen elements in one column mix inputs with results and bury the chart below a table. How do we put inputs aside, results side by side, and details out of the way?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A newspaper front page: the headline and photo get the most space, smaller stories sit in narrow columns, and the full stock tables are on page 12. Same paper, organised so the important thing is seen first.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <rect x="10" y="10" width="580" height="132" class="fs" stroke="currentColor"/>
    <rect x="20" y="20" width="130" height="112" class="ft st"/><text x="30" y="40">st.sidebar</text><text x="30" y="60" class="tm">city filter</text>
    <text x="165" y="36">st.title · st.tabs([...]) · st.expander</text>
    <rect x="165" y="46" width="140" height="86" class="fb sb"/><text x="175" y="66">col1</text><text x="175" y="86" class="tm">st.metric × 2</text>
    <rect x="315" y="46" width="265" height="86" class="fb sb"/><text x="325" y="66">col2 (twice as wide)</text><text x="325" y="86" class="tm">st.plotly_chart</text>
    <text x="325" y="106" class="tm">st.columns([1, 2])</text>
  </svg><figcaption>Sidebar for inputs, columns for side-by-side output, tabs and expanders to hide detail.</figcaption></figure>
  <p>A delivery dashboard that uses each piece once. <code>with col1:</code> means "everything in this block goes into column 1". It also uses a cached loader from section 08.</p>
  <div class="fx" data-lang="py"># layout_app.py
import pandas as pd
import plotly.express as px
import streamlit as st
from orders_data import make_orders

st.set_page_config(page_title="Delivery Dashboard", layout="wide")   # first st call

@st.cache_data
def load():
    return pd.DataFrame(make_orders())

orders = load()
city = st.sidebar.selectbox("City", ["Pune", "Delhi", "Mumbai"])       # inputs live in the sidebar
mine = orders[orders.city == city]
st.title(f"{city}: March deliveries")
col1, col2 = st.columns([1, 2])                                       # col2 is twice as wide
with col1:
    st.metric("Revenue", f"₹{mine.amount.sum():,.0f}")
    st.metric("Median delivery", f"{mine.delivery_minutes.median():.0f} min",
              delta=f"{mine.delivery_minutes.median() - orders.delivery_minutes.median():+.0f} vs all",
              delta_color="inverse")                                  # slower = red
with col2:
    st.plotly_chart(px.histogram(mine, x="delivery_minutes", nbins=25), width="stretch")
tab1, tab2 = st.tabs(["By restaurant", "Raw orders"])
with tab1:
    st.dataframe(mine.groupby("restaurant").amount.agg(["count", "sum"]))
with tab2:
    st.dataframe(mine.head(50))
with st.expander("How is this calculated?"):
    st.write("Sum of amount and median of delivery_minutes for the chosen city.")</div>
  <div class="fx" data-lang="py">at = AppTest.from_file("layout_app.py", default_timeout=30).run()
print("exceptions:", list(at.exception))
print("title:", at.title[0].value, "| columns:", len(at.columns), "| tabs:", [t.label for t in at.tabs])
print("metrics:", [(m.label, m.value, m.delta) for m in at.metric])
at.sidebar.selectbox[0].select("Delhi").run()
print("title:", at.title[0].value, "| metrics:", [(m.value, m.delta) for m in at.metric])</div>
  <div class="fx" data-lang="text">exceptions: []
title: Pune: March deliveries | columns: 2 | tabs: ['By restaurant', 'Raw orders']
metrics: [('Revenue', '₹162,890', ''), ('Median delivery', '27 min', '-2 vs all')]
title: Delhi: March deliveries | metrics: [('₹143,570', ''), ('32 min', '+3 vs all')]</div>
  <p>The app ran without errors and built two columns and two tabs. For Pune: revenue ₹162,890 (the same figure as the viz note's bar chart, ₹162.9k) and median delivery 27 minutes, shown with a delta of −2 against all cities (29 overall). Choosing Delhi in the sidebar reran the script: ₹143,570 and 32 minutes, +3. <code>delta_color="inverse"</code> colours a positive delta red, because for delivery time higher is worse. <code>st.set_page_config</code> must be the first Streamlit call; <code>layout="wide"</code> uses the full browser width; <code>width="stretch"</code> makes the chart fill its column.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Containers</strong>: <code>st.sidebar</code> (left panel), <code>st.columns(spec)</code> (side by side; spec = relative widths), <code>st.tabs(labels)</code>, <code>st.expander(label)</code> (collapsible), <code>st.container()</code> (grouping), <code>st.empty()</code> (a placeholder you can overwrite). <strong><code>st.metric</code></strong>: a big number with an optional delta arrow.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Tabs and expanders don't save work: the code inside every tab runs on every rerun, even for hidden tabs. Put expensive work behind a cache, not just inside a tab.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Deployment.</b> The dashboard runs at <code>localhost:8501</code>, which only our own laptop can open. How does the operations team reach it, with the right library versions and without leaking passwords?</div>

  <h2 id="ds-deploy"><span class="num">10</span>Deployment</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Deploying means running the app on a server with an address others can open. What must travel with the code so that it runs the same there, and what must never travel with it?</p>
  </div>
  <p>Three things must travel with the code: the exact library versions, the model file, and the configuration. One thing must not: secrets (API keys, database passwords), which must never be committed to Git.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Moving house. You pack the furniture (code), write a list so nothing is forgotten (<code>requirements.txt</code>), and hand the house keys to the new owner privately, not taped to the front door (secrets).</p></div>
  <div class="cards">
    <div><b>Community Cloud</b><p>Push to a GitHub repo with <code>requirements.txt</code>, then "Create app" at share.streamlit.io. Secrets go in the app settings and appear as <code>st.secrets</code>.</p><small>Free, demos, limited RAM</small></div>
    <div><b>Docker</b><p>One image runs on Cloud Run, ECS, Azure, Kubernetes. You own scaling and login.</p><small>Production and internal tools</small></div>
    <div><b>Others</b><p>Hugging Face Spaces (Streamlit SDK), Streamlit in Snowflake.</p><small>ML demos / data next to the warehouse</small></div>
  </div>
  <p>A <strong>Docker image</strong> is a packaged Linux system with Python, your libraries and your code; a <strong>container</strong> is a running copy of it (<a class="xref" data-note="se_docker">Docker Basics</a>). The standard recipe, with the versions this note was tested with (the Dockerfile was not built here):</p>
  <div class="fx" data-lang="text"># Dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8501
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8501/_stcore/health')"
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0", "--server.headless=true"]

# requirements.txt: pin the versions the model was trained and tested with
streamlit==1.66.0
pandas==3.0.6
numpy==2.5.4
plotly==7.1.0
scikit-learn==1.9.1
joblib==1.6.0

# build and run (shell)
docker build -t delivery-demo . &amp;&amp; docker run -p 8501:8501 delivery-demo
curl localhost:8501/_stcore/health          # expected reply: ok</div>
  <p><code>--server.address=0.0.0.0</code> makes Streamlit accept connections from outside the container (otherwise it listens only inside it). <code>EXPOSE</code> and <code>-p 8501:8501</code> connect the container's port to the host. The <code>HEALTHCHECK</code> calls Streamlit's built-in health endpoint, <code>/_stcore/health</code>, so Docker or the cloud platform can restart the container if the app stops answering.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Pinning</strong>: fixing exact versions (<code>==</code>) in requirements so every install is identical. <strong><code>st.secrets</code></strong>: Streamlit's secret store, read from <code>.streamlit/secrets.toml</code> locally (git-ignored) or from the platform's secret settings. <strong>Health check</strong>: a URL the platform polls to know the app is alive.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A model pickled with scikit-learn 1.9 may fail to load, or silently behave differently, under another version. Pin the training versions. Never commit <code>.streamlit/secrets.toml</code>; add it to <code>.gitignore</code>. A public Community Cloud app is visible to anyone with the link: don't put real customer data in it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Building an ML Demo.</b> We have every piece: charts, widgets, forms, state, caches, layout and a way to ship. The most common real request puts them all together: "the delivery-time model is good; let the operations team try it".</div>

  <h2 id="ds-ml"><span class="num">11</span>Building an ML Demo</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have a model that predicts delivery minutes from city, restaurant, amount and hour. The operations team wants to type in an order and see the prediction next to real deliveries. Where does training happen, where does the model live, and how does each piece of this note fit?</p>
  </div>
  <p>The standard shape has two files. <strong>train.py</strong> runs once, offline: it fits the model and saves it with <code>joblib</code>. <strong>app.py</strong> is the Streamlit app: it loads the saved model once (cache_resource), collects inputs in a sidebar form, predicts, and shows the prediction next to real data so users can judge it. Never train inside the app: it would retrain on every click.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant cooks the gravy base in the morning (train.py) and keeps it ready; each order only adds the final tadka (prediction). Cooking the base for every plate would make every customer wait an hour.</p></div>
  <div class="flow"><span>train.py: fit + joblib.dump</span><span>app.py: cache model</span><span>sidebar form</span><span>predict</span><span>metric + chart + history</span></div>
  <p>train.py makes 5,000 orders with the same generator (a different seed), fits a <strong>Pipeline</strong> (one object that one-hot encodes the text columns, then runs a random forest; see <a class="xref" data-note="ml_pipelines">Pipelines</a> and <a class="xref" data-note="ml_rf">Random Forest</a>), and saves it:</p>
  <div class="fx" data-lang="py"># train.py: run once, offline
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from orders_data import make_orders

orders = pd.DataFrame(make_orders(5000, seed=7))          # same generator, more rows
orders["hour"] = orders.order_time.dt.hour
orders.to_csv("orders_demo.csv", index=False)

X = orders[["city", "restaurant", "amount", "hour"]]
y = orders.delivery_minutes
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
model = Pipeline([
    ("prep", ColumnTransformer([("cat", OneHotEncoder(handle_unknown="ignore"),
                                 ["city", "restaurant"])], remainder="passthrough")),
    ("rf", RandomForestRegressor(n_estimators=200, min_samples_leaf=20,
                                 random_state=42, n_jobs=1)),
])
model.fit(X_tr, y_tr)
pred = model.predict(X_te)
print(f"rows {len(orders)} | test R2 {model.score(X_te, y_te):.3f} | "
      f"MAE {mean_absolute_error(y_te, pred):.2f} min | "
      f"baseline MAE {mean_absolute_error(y_te, [y_tr.mean()] * len(y_te)):.2f} min")
joblib.dump(model, "model.joblib")</div>
  <div class="fx" data-lang="py">import runpy
runpy.run_path("train.py")</div>
  <div class="fx" data-lang="text">rows 5000 | test R2 0.698 | MAE 3.32 min | baseline MAE 5.96 min</div>
  <p>On held-out orders the model is off by 3.32 minutes on average (MAE, mean absolute error), against 5.96 minutes for the baseline that always predicts the average; R² 0.698 means it explains about 70% of the variation. The rest is the random traffic noise the generator added, which no input can predict. Saving the whole Pipeline (not just the forest) matters: the app can pass raw text like "Delhi" and the saved encoder handles it.</p>
  <div class="fx" data-lang="py"># app.py: the ML demo
import joblib
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Delivery Time Predictor", layout="wide")

@st.cache_resource                      # one shared model object per server process
def load_model():
    return joblib.load("model.joblib")

@st.cache_data                          # cached DataFrame; each caller gets a copy
def load_orders():
    return pd.read_csv("orders_demo.csv")

model, orders = load_model(), load_orders()
st.title("How long will this delivery take?")

with st.sidebar.form("inputs"):         # form: rerun only when Predict is pressed
    city = st.selectbox("City", ["Pune", "Delhi", "Mumbai"])
    restaurant = st.selectbox("Restaurant", sorted(orders.restaurant.unique()))
    amount = st.slider("Order amount (₹)", 100, 2000, 400, step=50)
    hour = st.select_slider("Hour of day", list(range(11, 15)) + list(range(18, 23)), value=20)
    submitted = st.form_submit_button("Predict")

if "history" not in st.session_state:  # survives reruns for this browser session
    st.session_state.history = []

X = pd.DataFrame([{"city": city, "restaurant": restaurant, "amount": amount, "hour": hour}])
pred = float(model.predict(X)[0])
if submitted:
    st.session_state.history.append({**X.iloc[0].to_dict(), "predicted_min": round(pred, 1)})

col1, col2 = st.columns([1, 2])
with col1:
    st.metric("Predicted delivery time", f"{pred:.0f} min")
    same = orders[(orders.city == city) &amp; (orders.restaurant == restaurant)]
    st.caption(f"Real median for {restaurant} in {city}: {same.delivery_minutes.median():.0f} min "
               f"({len(same)} orders)")
with col2:
    fig = px.histogram(same, x="delivery_minutes", nbins=30,
                       title=f"{restaurant}, {city}: where your prediction falls")
    fig.add_vline(x=pred, line_dash="dash", annotation_text="prediction")
    st.plotly_chart(fig, width="stretch")

with st.expander("Prediction history"):
    st.dataframe(pd.DataFrame(st.session_state.history))</div>
  <p>Every idea from the note is in there: two caches of the right kind (section 08), a sidebar form (06, 09), session state for the history (07), columns and a metric (09), and a Plotly histogram of real deliveries with a dashed line at the prediction (02, 03). The test opens the app with its defaults, then predicts a ₹900 Biryani Bros order in Delhi at 8 pm:</p>
  <div class="fx" data-lang="py">at = AppTest.from_file("app.py", default_timeout=60).run()
print("exceptions:", list(at.exception))
print("metric:", at.metric[0].label, "=", at.metric[0].value)
print("caption:", at.caption[0].value)
at.sidebar.selectbox[0].select("Delhi")
at.sidebar.selectbox[1].select("Biryani Bros")
at.sidebar.slider[0].set_value(900)
at.sidebar.button[0].click().run()
print("metric:", at.metric[0].value, "| history rows:", len(at.session_state.history))
print("caption:", at.caption[0].value)
print("history:", at.session_state.history)</div>
  <div class="fx" data-lang="text">exceptions: []
metric: Predicted delivery time = 30 min
caption: Real median for Biryani Bros in Pune: 33 min (496 orders)
metric: 46 min | history rows: 1
caption: Real median for Biryani Bros in Delhi: 38 min (448 orders)
history: [{'city': 'Delhi', 'restaurant': 'Biryani Bros', 'amount': 900, 'hour': 20, 'predicted_min': 45.9}]</div>
  <p>Default inputs (Pune, Biryani Bros, ₹400, 20:00): prediction 30 minutes against a real median of 33 for that restaurant and city. After submitting the Delhi order: 46 minutes (45.9) against a real median of 38 for Delhi Biryani Bros orders, which are usually smaller than ₹900. Check against the rule the data was generated with: 15 + 900 / 40 + 5 (Delhi) + 4 (dinner) = 46.5, so the model learned the pattern. The history holds one row. Showing the real median next to the prediction lets users sanity-check the model themselves.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>ML demo app</strong>: a thin UI over a trained, saved model: load once, collect inputs, predict, show context. <strong>joblib</strong>: a library for saving Python objects (especially with big NumPy arrays) to disk and loading them back.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>This app predicts on every rerun, which is fine for a fast model. For a slow one, compute the prediction only <code>if submitted:</code> and store it in session state, or cache the prediction function with <code>@st.cache_data</code> keyed on the inputs. And a demo is not monitoring: if real delivery times drift, the app keeps showing confident, stale predictions (see <a class="xref" data-note="sd_monitoring">Monitoring</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The demo works because it dodges several silent traps. Collected in one place, what are they?</div>

  <h2 id="ds-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most Streamlit and Plotly bugs raise no error: the app is just slow, forgets things, or shows one user's change to another. Which mistakes recur, and what is the fix for each?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: state in plain variables</span><p>Reset on every rerun (counter stuck at 1). Use <code>st.session_state</code>, initialised only when the key is missing.</p></div>
  <div class="callout trap"><span class="label">Trap: acting on st.button later</span><p>The button is True for one rerun. Store what the click produced in session state.</p></div>
  <div class="callout trap"><span class="label">Trap: uncached loading</span><p>Reading data or loading a model at the top of the script runs on every click (2.0 s per click here). Wrap it in a cached function.</p></div>
  <div class="callout trap"><span class="label">Trap: swapped caches</span><p>Model in <code>cache_data</code> = a slow copy every call; DataFrame in <code>cache_resource</code> = one user's edits leak to all.</p></div>
  <div class="callout trap"><span class="label">Trap: training inside the app</span><p>Retrains on every interaction. Train offline, <code>joblib.dump</code>, load with <code>cache_resource</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: wide data into px</span><p><code>color=</code> needs a column naming the series. <code>melt</code> first.</p></div>
  <div class="callout trap"><span class="label">Trap: jumpy animations</span><p>Axes rescale per frame unless <code>range_x</code>/<code>range_y</code> are fixed.</p></div>
  <div class="callout trap"><span class="label">Trap: huge HTML files</span><p>The default <code>write_html</code> embeds 4.6 MB of plotly.js; the data itself grows with rows (1.16 MB for 100,000 points). Use <code>include_plotlyjs="cdn"</code>, aggregate before plotting, or serve from an app.</p></div>
  <div class="callout trap"><span class="label">Trap: unpinned versions and committed secrets</span><p>Pin library versions to match the pickled model; keep secrets in <code>st.secrets</code> or environment variables, never in Git.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture and one table to tie the chain together.</div>

  <h2 id="ds-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Plotly Express, graph_objects, the app idea, reruns, widgets, forms, session state, caches, layout, deployment and the ML demo: how does each one follow from the one before?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="ds-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">static PNG</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">pixels only</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#ds-a9)"/>
<rect x="240" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="335" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Plotly Express</text><text x="335" y="45" text-anchor="middle" class="tm" font-size="10">8 rows → 3 traces, hover</text>
<line x1="430" y1="32" x2="468" y2="32" stroke="currentColor" marker-end="url(#ds-a9)"/>
<rect x="470" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="560" y="29" text-anchor="middle" font-size="11.5" font-weight="700">graph_objects</text><text x="560" y="45" text-anchor="middle" class="tm" font-size="10">data + layout, subplots</text>
<line x1="560" y1="54" x2="560" y2="88" stroke="currentColor" marker-end="url(#ds-a9)"/>
<rect x="400" y="90" width="250" height="44" rx="7" class="ft st"/><text x="525" y="109" text-anchor="middle" font-size="11.5" font-weight="700">dashboards need an app</text><text x="525" y="125" text-anchor="middle" class="tm" font-size="10">input, Python, live data</text>
<line x1="400" y1="112" x2="342" y2="112" stroke="currentColor" marker-end="url(#ds-a9)"/>
<rect x="100" y="90" width="240" height="44" rx="7" class="ft st"/><text x="220" y="109" text-anchor="middle" font-size="11.5" font-weight="700">Streamlit: rerun all</text><text x="220" y="125" text-anchor="middle" class="tm" font-size="10">₹1280 → ₹1810 → ₹3100</text>
<line x1="140" y1="134" x2="85" y2="168" stroke="currentColor" marker-end="url(#ds-a9)"/><line x1="220" y1="134" x2="250" y2="168" stroke="currentColor" marker-end="url(#ds-a9)"/><line x1="300" y1="134" x2="420" y2="168" stroke="currentColor" marker-end="url(#ds-a9)"/>
<rect x="10" y="170" width="150" height="44" rx="7" class="fg sg"/><text x="85" y="189" text-anchor="middle" font-size="11.5" font-weight="700">widgets &amp; forms</text><text x="85" y="205" text-anchor="middle" class="tm" font-size="10">read input</text>
<rect x="175" y="170" width="150" height="44" rx="7" class="fg sg"/><text x="250" y="189" text-anchor="middle" font-size="11.5" font-weight="700">session_state</text><text x="250" y="205" text-anchor="middle" class="tm" font-size="10">remember: 1, 2, 3</text>
<rect x="340" y="170" width="160" height="44" rx="7" class="fg sg"/><text x="420" y="189" text-anchor="middle" font-size="11.5" font-weight="700">caching</text><text x="420" y="205" text-anchor="middle" class="tm" font-size="10">2.0 s → 0.0 s</text>
<rect x="515" y="170" width="135" height="44" rx="7" class="fg sg"/><text x="582" y="189" text-anchor="middle" font-size="11.5" font-weight="700">layout</text><text x="582" y="205" text-anchor="middle" class="tm" font-size="10">sidebar, columns</text>
<line x1="85" y1="214" x2="230" y2="248" stroke="currentColor" marker-end="url(#ds-a9)"/><line x1="250" y1="214" x2="280" y2="248" stroke="currentColor" marker-end="url(#ds-a9)"/><line x1="420" y1="214" x2="330" y2="248" stroke="currentColor" marker-end="url(#ds-a9)"/><line x1="582" y1="214" x2="380" y2="248" stroke="currentColor" marker-end="url(#ds-a9)"/>
<rect x="200" y="250" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="300" y="269" text-anchor="middle" font-size="11" font-weight="700">ML demo</text><text x="300" y="285" text-anchor="middle" class="tm" font-size="10">46 min for Delhi ₹900</text>
<line x1="400" y1="272" x2="458" y2="272" stroke="currentColor" marker-end="url(#ds-a9)"/>
<rect x="460" y="250" width="190" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="555" y="269" text-anchor="middle" font-size="11" font-weight="700">deployment</text><text x="555" y="285" text-anchor="middle" class="tm" font-size="10">pinned, secrets out, health</text>
</svg><figcaption>Pictures that carry their data (Plotly) answer hover and zoom; questions that need Python need an app; Streamlit's single rule (rerun everything) is simple, and its three costs are paid by widgets/forms (input), session state (memory) and caching (speed); layout organises it; the ML demo combines all of them; deployment ships it.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the delivery orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On our data</th><th>Use when</th></tr>
    <tr><td>Static limit</td><td>PNG = pixels</td><td>why not a PNG?</td><td>(240, 640, 4) colours; data gone</td><td>reports, PDFs</td></tr>
    <tr><td>Plotly Express</td><td>long data + plotly.js</td><td>explorable chart in one call</td><td>8 rows → 3 traces; 31 values in 8.8 KB</td><td>exploration, sharing</td></tr>
    <tr><td>graph_objects</td><td>Figure = data + layout</td><td>custom structure</td><td>stacked panels, shared x; avg line</td><td>mixed traces, fine control</td></tr>
    <tr><td>App need</td><td>limits of a file</td><td>input, Python, live data</td><td>100,000 points = 1.16 MB page</td><td>dashboards, demos</td></tr>
    <tr><td>Rerun model</td><td>script = UI</td><td>what runs on a click?</td><td>₹1280 → ₹1810 → ₹3100</td><td>always (it's the rule)</td></tr>
    <tr><td>Widgets &amp; forms</td><td>calls returning values</td><td>read input, batch it</td><td>Delhi ₹800 → 40 min</td><td>every input; forms for several</td></tr>
    <tr><td>Session state</td><td>per-user dict</td><td>remember across reruns</td><td>plain 1, 1, 1 vs state 1, 2, 3</td><td>counters, history, login</td></tr>
    <tr><td>Caching</td><td>key = code + args</td><td>don't redo slow work</td><td>2.0 s → 0.0 s; Delhi 1.0 s</td><td>data loads (data), models (resource)</td></tr>
    <tr><td>Layout</td><td>containers</td><td>organise the page</td><td>Pune ₹162,890, 27 min (−2)</td><td>more than ~5 elements</td></tr>
    <tr><td>Deployment</td><td>Docker / Cloud</td><td>let others open it</td><td>pinned versions, /_stcore/health</td><td>anything beyond your laptop</td></tr>
    <tr><td>ML demo</td><td>all of the above + Pipeline</td><td>let people try a model</td><td>MAE 3.32 vs 5.96; 46 min</td><td>stakeholder demos</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>Plotly lets a chart carry its data so the reader can explore it, and Streamlit lets a Python script become an app by rerunning it on every input; every Streamlit feature exists to pay for that rerun rule (widgets for input, forms to batch it, session state to remember, caches to skip slow work).</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, and beyond this track: when other programs (a mobile app, another service) must get predictions, a UI is the wrong shape; the model goes behind an API (<a class="xref" data-note="api_fastapi">FastAPI</a>) and is served and monitored as in <a class="xref" data-note="mlops_deploy">MLOps Deployment</a>.</div>

  <h2 id="ds-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: food-delivery orders. 8 orders (amounts 450, 220, 610, 380, 150, 720, 300, 270; cities Pune, Delhi, Pune, Mumbai, Pune, Delhi, Delhi, Mumbai; minutes 32, 25, 41, 28, 18, 45, 30, 21) and 1,000 orders from <code>make_orders(1000, seed=42)</code>; the ML demo trains on 5,000 (seed 7).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Static charts</td><td>can a PNG be explored?</td><td>pixels only</td><td>need data in the chart</td></tr>
    <tr><td>px</td><td>explorable chart, one call?</td><td>3 traces, hover with customdata</td><td>fixed structure</td></tr>
    <tr><td>go</td><td>custom figures?</td><td>data + layout; shared-x subplots</td><td>only baked-in data</td></tr>
    <tr><td>App need</td><td>input, prediction, live data?</td><td>1.16 MB for 100k points</td><td>how does a script react?</td></tr>
    <tr><td>Rerun</td><td>what runs on a click?</td><td>everything: ₹1280, ₹1810, ₹3100</td><td>how to read input?</td></tr>
    <tr><td>Widgets/forms</td><td>read and batch input?</td><td>Delhi ₹800 → 40 min</td><td>variables reset</td></tr>
    <tr><td>Session state</td><td>remember?</td><td>counter 1, 2, 3</td><td>slow work repeats</td></tr>
    <tr><td>Caching</td><td>skip slow work?</td><td>2.0 → 0.0 s; copies vs shared</td><td>messy page</td></tr>
    <tr><td>Layout</td><td>organise?</td><td>sidebar, columns, metric, tabs</td><td>only on localhost</td></tr>
    <tr><td>Deployment</td><td>share it?</td><td>Docker, pins, secrets, health</td><td>put it all together</td></tr>
    <tr><td>ML demo</td><td>let people try a model?</td><td>MAE 3.32; Delhi ₹900 8 pm → 46 min</td><td>→ APIs, MLOps</td></tr>
  </table>
  <h3>Rules and recipes</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Notes</th></tr>
    <tr><td>px traces</td><td>one trace per value of <code>color=</code> (and per facet)</td><td>needs long data; <code>melt</code> wide tables</td></tr>
    <tr><td>Hover</td><td><code>hover_data</code> → <code>customdata</code>; template <code>%{x}</code>, <code>%{customdata[0]}</code></td><td>data travels to the viewer</td></tr>
    <tr><td>Figure</td><td>data (traces) + layout (axes, titles, shapes)</td><td>px returns a go.Figure</td></tr>
    <tr><td>Shared axes</td><td><code>make_subplots(rows=2, cols=1, shared_xaxes=True)</code></td><td>instead of dual y-axes</td></tr>
    <tr><td>Share HTML</td><td><code>write_html(include_plotlyjs="cdn")</code></td><td>11 KB vs 4.6 MB</td></tr>
    <tr><td>Rerun rule</td><td>any interaction → whole script, top to bottom</td><td>variables reset each run</td></tr>
    <tr><td>Button</td><td>True only on the click's rerun</td><td>persist results in session_state</td></tr>
    <tr><td>State init</td><td><code>if "k" not in st.session_state: st.session_state.k = 0</code></td><td>per user, per tab</td></tr>
    <tr><td>Cache key</td><td>function code + argument values</td><td><code>ttl</code>, <code>max_entries</code>, <code>.clear()</code>, <code>_arg</code> not hashed</td></tr>
    <tr><td>Which cache</td><td>data → <code>cache_data</code> (copy); model/connection → <code>cache_resource</code> (shared)</td><td>swapping them is slow or unsafe</td></tr>
    <tr><td>Serve</td><td><code>streamlit run app.py --server.address=0.0.0.0</code></td><td>health: <code>/_stcore/health</code></td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Plotly</b><p>Exploration, sharing explorable charts, charts inside apps.</p><small>Not for PDFs/print or huge raw point clouds</small></div>
    <div><b>Streamlit</b><p>Internal dashboards, data tools, ML demos, fast prototypes in pure Python.</p><small>Not for complex public products (use an API + frontend)</small></div>
    <div><b>Form</b><p>Several inputs feeding one slow step (prediction, query).</p><small>Not needed for one quick filter</small></div>
    <div><b>Caches</b><p>Anything slow and repeatable: loads, queries, models.</p><small>Add <code>ttl</code> for data that changes</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Plain variables reset; button True once; uninitialised state reset every run; uncached loads on every click; model in cache_data / DataFrame in cache_resource; training inside the app; wide data into px; unfixed animation ranges; 4.6 MB HTML; unpinned versions; committed secrets; heavy code hidden in tabs still runs.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>px.scatter(orders8, color="city")</code>: how many traces?</td><td>3 (Pune, Delhi, Mumbai), in order of first appearance</td></tr>
    <tr><td>Slider set to 5 in the trace app: which lines run and what shows?</td><td>All lines; ₹1810 (450 + 220 + 610 + 380 + 150)</td></tr>
    <tr><td>Plain-variable counter after 3 clicks, then one rerun without a click?</td><td>1, 1, 1, then 0 (session state shows 3)</td></tr>
    <tr><td>cache_data function called with Pune, Pune, Delhi, Pune: how many body runs?</td><td>2 (Pune once, Delhi once)</td></tr>
    <tr><td>Why <code>--server.address=0.0.0.0</code> in Docker?</td><td>To accept connections from outside the container</td></tr>
  </table>

  <h2 id="ds-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose graph_objects over Plotly Express?</summary><div class="qa-body">When combining different trace types in custom ways (bars + lines + shapes), building subplots with mixed types, or controlling details px doesn't expose. Usually you start with px and add go traces or <code>update_layout</code> to the returned figure, since px returns a <code>go.Figure</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Plotly vs Matplotlib: when each?</summary><div class="qa-body">Plotly for interactive exploration, dashboards and web apps (hover, zoom, legend toggling). Matplotlib/Seaborn for static, publication-quality figures, papers and PDFs, and fine-grained styling. Plotly HTML carries its data and a JS library (KBs to MBs); a PNG is just pixels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Streamlit's execution model and its main consequences.</summary><div class="qa-body">Every widget interaction reruns the script from top to bottom, and the page is redrawn from what that run outputs. Consequences: variables reset (remember things in <code>st.session_state</code>), slow work repeats (cache it), and buttons are True for one run only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>st.cache_data</code> vs <code>st.cache_resource</code>?</summary><div class="qa-body"><code>cache_data</code> serialises the return value and hands each caller a copy: right for DataFrames and API results (<code>df1 is df2</code> was False). <code>cache_resource</code> returns the same object to all sessions: right for models and DB connections (<code>m1 is m2</code> was True). It must be thread-safe, since users share it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A counter stored in a normal variable never goes above 1. Why, and fix?</summary><div class="qa-body">The rerun sets the variable back to 0 before each click adds 1. Store it in <code>st.session_state</code>, initialised only if the key is missing. In the test: plain 1, 1, 1; session_state 1, 2, 3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your app reloads a 500 MB model on every slider move. Fix?</summary><div class="qa-body">Train offline and save it (<code>joblib.dump</code>); load it in a function decorated with <code>@st.cache_resource</code>. Wrap the inputs in <code>st.form</code> so predictions run only on submit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>st.form</code>?</summary><div class="qa-body">Widgets inside a form don't trigger reruns until the submit button is pressed, so the user can set several inputs and the expensive step runs once, with all values together (Delhi and ₹800 arrived in one run).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a Streamlit app in CI?</summary><div class="qa-body"><code>streamlit.testing.v1.AppTest</code>: run the script headless, set widget values, click buttons, assert on <code>at.metric</code>, <code>at.exception</code> and <code>at.session_state</code> (as every app in this note was tested). Plus a smoke test hitting <code>/_stcore/health</code> on the running container.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle API keys in a deployed Streamlit app?</summary><div class="qa-body"><code>st.secrets</code>: local <code>.streamlit/secrets.toml</code> (git-ignored), the secrets settings on Community Cloud, or environment variables / a secret manager in Docker. Never hard-code or commit them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your animated Plotly chart looks jumpy. Why?</summary><div class="qa-body">Axis ranges autoscale per frame. Set <code>range_x</code>/<code>range_y</code> to the global min/max (we used 0 to 45,023 for weekly totals) so only the data moves. Also check every frame has every category.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Streamlit vs Dash vs a React frontend?</summary><div class="qa-body">Streamlit: fastest to build, script-style, good for demos and internal tools; less layout control and the rerun model limits complex apps. Dash: callback-based Plotly apps, finer control, more code. React + API: full product UI, needs frontend engineers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the rerun model make session state and caching necessary?</summary><div class="qa-body">Because a rerun recreates every variable and re-executes every line. Things that should persist (a click count, a prediction history) are destroyed, so they need a store outside the run: session state. Things that are slow (loading 1,000 orders, a model) are redone, so they need a store keyed by inputs: the caches. Without the rerun rule neither would be needed; with it, an app without them is forgetful and slow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip forms in the ML demo?</summary><div class="qa-body">Each widget change triggers a rerun and a prediction with half-entered inputs: moving the amount slider from ₹400 to ₹900 can fire several predictions, and with a submit-based history you'd lose the "only when the user means it" moment. For a slow model the app becomes unusable. The form makes one complete set of inputs produce one prediction.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do the viz note's honesty rules carry over to Plotly dashboards?</summary><div class="qa-body">They all still apply, and interactivity adds new ones. Bars from 0, no dual axes (use <code>make_subplots(shared_xaxes=True)</code>), sequential/diverging colour scales, the finding in the title. Plus: fix animation ranges so bars don't appear to shrink, and remember zooming can truncate a bar axis, so set <code>fixedrange</code> or a range for bar charts that must stay honest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the demo save the whole Pipeline instead of just the random forest?</summary><div class="qa-body">The app receives raw inputs ("Delhi", "Biryani Bros"). The forest only understands the one-hot columns created during training, in the same order. Saving the Pipeline saves the fitted encoder with it, so the app can't drift from the training preprocessing (train/serve skew, see <a class="xref" data-note="ml_pipelines">Pipelines</a>).</div></details>
</main>
`
});
