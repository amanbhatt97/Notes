// notes/dataanalysis/da_plotly_streamlit.js — Plotly & Streamlit
Object.assign(TOPIC_CONTENT, {
  "da_plotly_streamlit": `<main>
  <h1>Plotly &amp; Streamlit</h1>
  <p class="lead">A PNG chart is a photograph: nobody can hover over a point to read its exact value, zoom into March, or switch the city. Plotly makes charts people can hover, zoom and filter, and saves them as a web page. Streamlit turns a plain Python script into a web app with sliders and buttons in minutes. Together they are how a data scientist ships a dashboard or an ML demo without a frontend team. Small examples use a chai stall's sales; the demo app predicts order value from an orders table shaped like the one in the <a class="xref" data-note="da_pandas">Pandas</a> note. Tested on Plotly 7.1 and Streamlit 1.66, with every app checked by Streamlit's own test runner.</p>

  <h2 id="ds-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Plotly &amp; Streamlit</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Plotly</div>
        <ul>
          <li><b>px</b> — one call on long data: <code>px.line(df, x, y, color=)</code> → one trace per colour</li>
          <li><b>go</b> — <code>go.Figure().add_trace(go.Bar(...))</code>, full control</li>
          <li><b>px returns go.Figure</b> — tweak with <code>update_layout</code>, <code>add_hline</code></li>
          <li><b>Figure</b> = data (list of traces) + layout (titles, axes, shapes)</li>
          <li><b>Share</b> — <code>write_html(include_plotlyjs="cdn")</code>: 7.8 KB vs 4.6 MB</li>
          <li>⚠ <b>px wants long data</b> — <code>melt</code> wide tables first</li>
          <li>💡 px = ready thali; go = order each dish yourself</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interactive</div>
        <ul>
          <li><b>hover_data</b> — extra columns in the tooltip (via <code>customdata</code>)</li>
          <li><b>make_subplots(rows, cols, shared_xaxes=True)</b> + <code>row=, col=</code></li>
          <li><b>facet_col</b>, <b>marginal="box"</b>, <b>treemap(path=)</b></li>
          <li><b>animation_frame="month"</b> — one frame per value, play button + slider</li>
          <li>⚠ <b>Fix range_x/range_y</b> on animations</li>
          <li><b>Maps</b> — <code>scatter_map</code> (bubbles, lat/lon, no token), <code>choropleth</code> (regions + GeoJSON)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streamlit Model</div>
        <ul>
          <li><b>Rerun</b> — any interaction reruns the script top to bottom</li>
          <li><b>Consequence</b> — variables reset; cache heavy work; persist in session_state</li>
          <li><b>Run</b> — <code>streamlit run app.py</code> (port 8501)</li>
          <li>💡 like a spreadsheet recalculating after every edit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Widgets &amp; State</div>
        <ul>
          <li><b>Widgets return values</b> — selectbox, slider, radio, text_input, file_uploader</li>
          <li><b>st.button</b> — True only on the rerun caused by the click</li>
          <li><b>session_state</b> — per-user dict across reruns; init if key missing</li>
          <li><b>st.form</b> — batch inputs, rerun only on submit</li>
          <li>⚠ <b>Counter in a plain variable</b> — stuck at 1, back to 0 on the next rerun</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Caching</div>
        <ul>
          <li><b>cache_data</b> — DataFrames/API results; returns a copy; <code>ttl</code></li>
          <li><b>cache_resource</b> — models, DB connections; one shared object</li>
          <li><b>Key</b> — function code + argument values; new argument = new run; <code>.clear()</code></li>
          <li>⚠ <b>Swapped</b> — model in cache_data = slow copies; df in cache_resource = shared mutations</li>
          <li>💡 cache_data = photocopies; cache_resource = the one office printer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Layout &amp; App</div>
        <ul>
          <li><b>Layout</b> — <code>st.sidebar</code>, <code>columns([1,2])</code>, <code>tabs</code>, <code>expander</code>, <code>metric</code></li>
          <li><b>ML demo</b> — train.py (Pipeline + joblib) → app.py (cache_resource) → form → predict → chart</li>
          <li><b>Test</b> — <code>AppTest.from_file("app.py").run()</code>; health at <code>/_stcore/health</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Deploy</div>
        <ul>
          <li><b>Community Cloud</b> — GitHub repo + requirements.txt; free demos</li>
          <li><b>Docker</b> — python slim, pip install, <code>CMD streamlit run ... --server.address=0.0.0.0</code></li>
          <li><b>Secrets</b> — <code>st.secrets</code> / env vars; never commit secrets.toml</li>
          <li>⚠ <b>Pin versions</b> — pickled model needs the same scikit-learn</li>
          <li><b>vs Dash / React</b> — Streamlit fastest, least layout control</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ds-px"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Express vs graph_objects</span><span class="rm-sub">One line vs full control</span></div></div>
      <div class="rm-item rm-done" data-target="ds-inter"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Interactive Charts</span><span class="rm-sub">Hover, subplots, animation, maps</span></div></div>
      <div class="rm-item rm-done" data-target="ds-exec"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Streamlit's Execution Model</span><span class="rm-sub">Rerun top to bottom</span></div></div>
      <div class="rm-item rm-done" data-target="ds-widgets"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Widgets, Forms &amp; State</span><span class="rm-sub">Remember across reruns</span></div></div>
      <div class="rm-item rm-done" data-target="ds-cache"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Caching</span><span class="rm-sub">cache_data vs cache_resource</span></div></div>
      <div class="rm-item rm-done" data-target="ds-layout"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Layout</span><span class="rm-sub">Sidebar, columns, tabs</span></div></div>
      <div class="rm-item rm-done" data-target="ds-app"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Build It: ML Demo App</span><span class="rm-sub">Model → widgets → chart</span></div></div>
      <div class="rm-item rm-done" data-target="ds-deploy"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Deploying</span><span class="rm-sub">Community Cloud, Docker</span></div></div>
      <div class="rm-item rm-done" data-target="ds-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Reruns, caches, pickles</span></div></div>
      <div class="rm-item rm-done" data-target="ds-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ds-px"><span class="num">01</span>Plotly Express vs graph_objects</h2>
  <p>You email a Matplotlib PNG of daily sales to the stall owner. He replies: "what exactly was Wednesday's number?" and "can I see only Pune?". A picture can't answer; you send another picture. An interactive chart answers both by itself: hover over Wednesday to read 128, click "Delhi" in the legend to hide it.</p>
  <p><strong>Plotly</strong> draws such charts. Python builds a description of the chart (a <code>Figure</code>), and a JavaScript library, plotly.js, draws it in the browser, so it works in Jupyter, in a saved HTML file, and inside Streamlit. Plotly has two layers. <strong>Plotly Express</strong> (<code>px</code>) makes a whole chart from a DataFrame in one call. <strong>graph_objects</strong> (<code>go</code>) builds the figure piece by piece.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>At a restaurant, a thali (px) arrives complete: dal, rice, sabzi, roti, all matched. À la carte (go) means ordering each dish yourself: more control, more work. You can also take a thali and order one extra dish, which is the usual workflow: start with px, add to it with go.</p></div>
  <p><strong>Worked example.</strong> px needs <strong>long</strong> data: one row per point, with a column that says which series it belongs to. When you pass <code>color="stall"</code>, px splits the rows by stall and makes one <strong>trace</strong> (one line, with its own legend entry) per stall:</p>
  <table class="tbl out"><caption>6 rows → 2 traces</caption>
    <tr><th>rows</th><th>stall</th><th>becomes</th></tr>
    <tr><td>Mon 120, Tue 135, Wed 128</td><td>Pune</td><td>trace 0: x = [Mon, Tue, Wed], y = [120, 135, 128]</td></tr>
    <tr><td>Mon 90, Tue 80, Wed 110</td><td>Delhi</td><td>trace 1: x = [Mon, Tue, Wed], y = [90, 80, 110]</td></tr>
  </table>
  <p>The code makes that chart and prints what is inside the figure:</p>
  <div class="fx" data-lang="py">import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

sales = pd.DataFrame({
    "day":   ["Mon", "Tue", "Wed", "Mon", "Tue", "Wed"],
    "stall": ["Pune", "Pune", "Pune", "Delhi", "Delhi", "Delhi"],
    "cups":  [120, 135, 128, 90, 80, 110]})

fig = px.line(sales, x="day", y="cups", color="stall", markers=True,
              title="Pune sells more chai every day")
print(type(fig).__name__, len(fig.data), [t.name for t in fig.data])
print(fig.data[0].x, fig.data[0].y)
print(fig.data[0].hovertemplate)</div>
  <div class="fx" data-lang="text">Figure 2 ['Pune', 'Delhi']
['Mon' 'Tue' 'Wed'] [120 135 128]
stall=Pune&lt;br&gt;day=%{x}&lt;br&gt;cups=%{y}&lt;extra&gt;&lt;/extra&gt;</div>
  <p><code>fig.data</code> is the list of traces: exactly the two from the table. px also wrote a <strong>hover template</strong>, the text shown on hover: <code>%{x}</code> and <code>%{y}</code> are filled with the point's values, <code>&lt;br&gt;</code> is a line break. <code>fig.show()</code> would open it in a notebook or browser.</p>
  <p>The same kind of chart with <code>go</code>: a bar per day plus a dotted average line, then saved as HTML two ways.</p>
  <div class="fx" data-lang="py">import os

days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
cups = [120, 135, 128, 150, 170, 240, 260]
avg = sum(cups) / len(cups)

fig = go.Figure()
fig.add_trace(go.Bar(x=days, y=cups, name="cups"))
fig.add_hline(y=avg, line_dash="dot", annotation_text=f"avg {avg:.0f}")
fig.update_layout(title="Weekend beats the weekly average", template="plotly_white")
print(len(fig.data), fig.data[0].type, len(fig.layout.shapes), fig.layout.title.text)

fig.write_html("cdn.html", include_plotlyjs="cdn")     # page loads plotly.js from the internet
fig.write_html("full.html")                            # plotly.js copied into the file
print(f"cdn: {os.path.getsize('cdn.html')/1024:.1f} KB, full: {os.path.getsize('full.html')/1024/1024:.1f} MB")</div>
  <div class="fx" data-lang="text">1 bar 1 Weekend beats the weekly average
cdn: 7.8 KB, full: 4.6 MB</div>
  <p>A figure has two parts: <code>data</code> (here one bar trace) and <code>layout</code> (title, axes, and <strong>shapes</strong> such as the average line added by <code>add_hline</code>). <code>update_layout</code> changes layout settings on any figure, including one made by px. The file sizes show the sharing choice: <code>include_plotlyjs="cdn"</code> makes a tiny file that downloads plotly.js when opened (needs internet); the default embeds the 4.6 MB library so it works offline.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Trace</strong>: one series drawn on a Plotly figure (a line, a set of bars, a scatter). <strong>Layout</strong>: everything that is not data: titles, axes, legend, shapes, template. <strong>Long (tidy) data</strong>: one row per observation, a column naming the group. <strong>CDN</strong>: a public server that hosts libraries so pages can load them.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>px wants long data. A wide table (one column per stall) gives you one line with the wrong values or an error. <code>df.melt(id_vars="day", var_name="stall", value_name="cups")</code> first, then <code>color="stall"</code>.</p></div>

  <h2 id="ds-inter"><span class="num">02</span>Interactive Charts</h2>
  <p>Interactivity is useful only when it answers a question the reader will actually ask. Four common ones: "which bill is this dot?" (hover with extra columns), "do these two numbers move together over the week?" (stacked panels with a shared x-axis), "how did it change month by month?" (animation), and "where?" (a map). Each is one or two arguments in Plotly.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A printed railway timetable versus the train app. The app shows the same data, but you tap a train to see its coaches, scroll to tomorrow, and see the live position on a map. Each feature answers a question passengers really ask.</p></div>
  <p><strong>Hover and subplots.</strong> Six bills from two stalls. <code>hover_data</code> adds the bill id and payment method to each dot's tooltip. Then two panels, cups on top and revenue below, share one x-axis so zooming one zooms both:</p>
  <div class="fx" data-lang="py">from plotly.subplots import make_subplots

bills = pd.DataFrame({
    "bill_id": [101, 102, 103, 104, 105, 106],
    "items":   [1, 2, 4, 1, 3, 6],
    "amount":  [20, 45, 120, 30, 80, 250],
    "stall":   ["Pune", "Pune", "Pune", "Delhi", "Delhi", "Delhi"],
    "payment": ["cash", "UPI", "UPI", "cash", "UPI", "card"]})

fig = px.scatter(bills, x="items", y="amount", color="stall",
                 hover_data=["bill_id", "payment"])
print(fig.data[0].hovertemplate)
print(fig.data[0].customdata.tolist())

# two stacked panels sharing one x-axis
days = ["Mon", "Tue", "Wed", "Thu"]
fig2 = make_subplots(rows=2, cols=1, shared_xaxes=True,
                     subplot_titles=["Cups sold", "Revenue (₹)"])
fig2.add_trace(go.Scatter(x=days, y=[120, 135, 128, 150], name="cups"), row=1, col=1)
fig2.add_trace(go.Bar(x=days, y=[1800, 2025, 1920, 2250], name="revenue"), row=2, col=1)
print(len(fig2.data), [t.xaxis + "/" + t.yaxis for t in fig2.data])
print(fig2.layout.xaxis.matches, fig2.layout.xaxis2.matches)</div>
  <div class="fx" data-lang="text">stall=Pune&lt;br&gt;items=%{x}&lt;br&gt;amount=%{y}&lt;br&gt;bill_id=%{customdata[0]}&lt;br&gt;payment=%{customdata[1]}&lt;extra&gt;&lt;/extra&gt;
[[101, 'cash'], [102, 'UPI'], [103, 'UPI']]
2 ['x/y', 'x2/y2']
x2 None</div>
  <p>px stored the extra columns in <code>customdata</code>, one small list per point (Pune's three bills), and the template reads them as <code>%{customdata[0]}</code> and <code>%{customdata[1]}</code>. In the subplot figure, the first trace uses axes x/y and the second x2/y2. <code>shared_xaxes=True</code> set the top x-axis to <code>matches="x2"</code>: the two move together when you zoom or pan.</p>
  <p><strong>Animation and maps.</strong> Monthly cups per city, typed wide as people do in Excel, melted to long, then animated: px makes one <strong>frame</strong> per month and adds a play button and slider. Then a bubble map of the two cities.</p>
  <div class="fx" data-lang="py">wide = pd.DataFrame({"month": ["Jan", "Feb", "Mar"],
                     "Pune": [3100, 3500, 4200], "Delhi": [2600, 2400, 3900]})
long = wide.melt(id_vars="month", var_name="city", value_name="cups")
print(long.shape, long.columns.tolist())

fig = px.bar(long, x="city", y="cups", animation_frame="month",
             range_y=[0, 4500])                  # fixed axis: only bars move
print(len(fig.frames), [f.name for f in fig.frames])
print([f.data[0].y.tolist() for f in fig.frames])
print(fig.layout.yaxis.range, len(fig.layout.sliders[0].steps))

geo = pd.DataFrame({"city": ["Pune", "Delhi"], "lat": [18.52, 28.61], "lon": [73.86, 77.21],
                    "cups": [10800, 8900]})
fig_map = px.scatter_map(geo, lat="lat", lon="lon", size="cups", hover_name="city",
                         zoom=3.5, map_style="carto-positron")   # no API token needed
print(fig_map.data[0].type, fig_map.data[0].marker.size.tolist())</div>
  <div class="fx" data-lang="text">(6, 3) ['month', 'city', 'cups']
3 ['Jan', 'Feb', 'Mar']
[[3100, 2600], [3500, 2400], [4200, 3900]]
(0, 4500) 3
scattermap [10800, 8900]</div>
  <p>Three frames, each holding that month's two bar heights, and a slider with three steps. <code>range_y=[0, 4500]</code> fixed the y-axis; without it the axis would rescale every frame and a bar could look shorter while actually growing. The map trace is <code>scattermap</code>, with bubble sizes taken from <code>cups</code>; the carto-positron base map needs no API key.</p>
  <table class="tbl">
    <tr><th>Need</th><th>Code</th></tr>
    <tr><td>Rich hover</td><td><code>px.scatter(df, x=, y=, color=, hover_data=["id", "city"])</code></td></tr>
    <tr><td>Distribution + marginal</td><td><code>px.histogram(df, x="price", color="segment", marginal="box", log_x=True, barmode="overlay")</code></td></tr>
    <tr><td>Hierarchy</td><td><code>px.treemap(df, path=["category", "status"], values="revenue")</code></td></tr>
    <tr><td>Facets</td><td><code>px.scatter(..., facet_col="segment")</code></td></tr>
    <tr><td>Stacked panels</td><td><code>make_subplots(rows=2, cols=1, shared_xaxes=True)</code> + <code>add_trace(..., row=, col=)</code></td></tr>
    <tr><td>Regions on a map</td><td><code>px.choropleth(df, geojson=states, locations="state", color="sales")</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Fix <code>range_x</code>/<code>range_y</code> on animations, and make sure every frame has every category, or bars pop in and out. <code>scatter_mapbox</code> is the deprecated older name of <code>scatter_map</code>.</p></div>
  <p>Interviews ask "Plotly or Matplotlib?": Plotly for exploration, dashboards and web apps; Matplotlib for static figures in papers, PDFs and reports.</p>

  <h2 id="ds-exec"><span class="num">03</span>Streamlit's Execution Model</h2>
  <p>You built a model in a notebook. The business team wants to try it: pick a category, move a quantity slider, see a prediction. A normal web app needs HTML, JavaScript, an API server and code that says "when this slider changes, call this function, then update that div". That is a week of work in another language. Streamlit removes all of it with one unusual rule.</p>
  <p>The rule: <strong>every time the user changes anything, Streamlit runs your whole script again, from the first line to the last</strong>, and redraws the page from what the script outputs. A widget call like <code>st.slider(...)</code> simply returns its current value. There are no callbacks to wire: the script <em>is</em> the app.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A spreadsheet. Change one cell and every formula recalculates; you never write "when B2 changes, update C7". Fast and simple, until one cell is a 10-second calculation: then every edit waits 10 seconds. That slow cell is what caching is for.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="ds-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="110" height="44" class="ft st"/><text x="22" y="60">user moves</text><text x="22" y="76">a slider</text>
    <path d="M120 62 L170 62" stroke="currentColor" marker-end="url(#ds-ar)"/>
    <rect x="172" y="14" width="200" height="100" class="fb sb"/><text x="184" y="34">app.py runs again,</text><text x="184" y="52">line 1 → last line</text>
    <text x="184" y="76" class="tm">variables reset</text><text x="184" y="94" class="tm">cached fns skipped</text>
    <path d="M372 62 L422 62" stroke="currentColor" marker-end="url(#ds-ar)"/>
    <rect x="424" y="40" width="160" height="44" class="fg sg"/><text x="436" y="60">browser shows</text><text x="436" y="76">the new page</text>
    <path d="M504 84 L504 134 L65 134 L65 86" stroke="currentColor" fill="none" marker-end="url(#ds-ar)"/><text x="200" y="128" class="tm">every interaction repeats the loop</text>
  </svg><figcaption>No callbacks to wire: the script is the UI. The cost: everything reruns unless you cache it or store it in session_state.</figcaption></figure>
  <p><strong>Trace it.</strong> A 3-line app: <code>n = st.slider("Cups", 1, 10, 2)</code>, then <code>price = n * 15</code>, then <code>st.write(price)</code>.</p>
  <table class="tbl out"><caption>What happens on each run</caption>
    <tr><th>event</th><th>script runs?</th><th>n</th><th>price</th><th>page shows</th></tr>
    <tr><td>page opened</td><td>yes, top to bottom</td><td>2 (default)</td><td>30</td><td>30</td></tr>
    <tr><td>slider moved to 4</td><td>yes, top to bottom</td><td>4</td><td>60</td><td>60</td></tr>
    <tr><td>slider moved to 7</td><td>yes, top to bottom</td><td>7</td><td>105</td><td>105</td></tr>
  </table>
  <p>Every row is a full fresh run. Any variable you set is created again from scratch. That is perfect for <code>price</code>, which should be recomputed, and wrong for anything that should be remembered between runs (next section) or loaded only once (section 05).</p>
  <div class="fx" data-lang="text">pip install streamlit
streamlit run app.py          # dev server on http://localhost:8501, reruns on file save too</div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Rerun</strong>: Streamlit executing the script again after an interaction. <strong>Session</strong>: one browser tab's connection to the app; each user has their own. <strong>Callback</strong> (in other frameworks): a function you register to run when an event happens; Streamlit mostly replaces these with reruns.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Loading a CSV or model at the top of the script without caching means reloading it on every click. The app works on your laptop with a small file and crawls in production.</p></div>

  <h2 id="ds-widgets"><span class="num">04</span>Widgets, Forms &amp; State</h2>
  <p>Widgets are the inputs: dropdowns, sliders, text boxes, file uploads. Each is one function call that draws the widget and returns its current value, so you use it like any other variable. The rerun rule creates two needs: <strong>remembering</strong> things between runs (a click count, a login, a list of past predictions), and <strong>not rerunning</strong> on every tiny change when the user is filling in several inputs.</p>
  <table class="tbl">
    <tr><th>Widget</th><th>Returns</th></tr>
    <tr><td><code>st.selectbox("Category", options)</code></td><td>chosen item</td></tr>
    <tr><td><code>st.slider("Quantity", 1, 4, 2)</code></td><td>int (min, max, default)</td></tr>
    <tr><td><code>st.radio</code>, <code>st.multiselect</code>, <code>st.select_slider</code></td><td>item / list / item</td></tr>
    <tr><td><code>st.text_input</code>, <code>st.number_input</code>, <code>st.date_input</code></td><td>value</td></tr>
    <tr><td><code>st.file_uploader("CSV", type="csv")</code></td><td>file-like object or None</td></tr>
    <tr><td><code>st.button("Go")</code></td><td>True only on the rerun right after the click</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A whiteboard that is wiped clean every time someone enters the room (rerun). Anything written on it is lost. <code>st.session_state</code> is a personal locker next to the board: wiping the board doesn't touch the locker, and each visitor has their own locker.</p></div>
  <p>The counter app below keeps a count two ways: in a plain variable and in <code>st.session_state</code>. It also shows what <code>st.button</code> returned on that run.</p>
  <div class="fx" data-lang="py"># counter_app.py
import streamlit as st

count = 0                                   # plain variable: reset on every rerun
if "clicks" not in st.session_state:
    st.session_state.clicks = 0             # initialised once per browser session

clicked = st.button("+1")                   # True only on the rerun caused by the click
if clicked:
    count += 1
    st.session_state.clicks += 1
st.write(f"button: {clicked} | plain variable: {count} | session_state: {st.session_state.clicks}")</div>
  <p>Streamlit's <code>AppTest</code> runs an app without a browser, so we can click and read the page from Python:</p>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest
at = AppTest.from_file("counter_app.py").run()
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
  <p>Read it row by row. Each click reruns the script: <code>count = 0</code> runs again, then <code>+= 1</code>, so the plain variable is stuck at 1. The session-state value is only set to 0 when the key is missing (the very first run), so it counts 1, 2, 3. On the last rerun nobody clicked, so <code>st.button</code> returned False and the plain variable fell back to 0, while session state kept 3. Widgets created with <code>key="name"</code> also store their value in <code>st.session_state["name"]</code>.</p>
  <p><strong>Forms.</strong> Widgets inside <code>st.form</code> don't trigger a rerun when changed; the script reruns only when the form's submit button is pressed, with all the new values at once:</p>
  <div class="fx" data-lang="py"># form_app.py
import streamlit as st

with st.form("order"):                       # widgets inside don't trigger reruns...
    qty = st.slider("Cups", 1, 10, 2)
    sugar = st.radio("Sugar", ["less", "normal", "extra"], index=1)
    submitted = st.form_submit_button("Place order")   # ...until this is pressed

if submitted:
    st.session_state.last = f"{qty} cups, {sugar} sugar"
st.write("last order:", st.session_state.get("last", "none"))</div>
  <div class="fx" data-lang="py">at = AppTest.from_file("form_app.py").run()
print("start        -&gt;", at.markdown[0].value)
at.slider[0].set_value(5)                   # change inputs inside the form...
at.radio[0].set_value("extra")
at.button[0].click().run()                  # ...then press "Place order"
print("after submit -&gt;", at.markdown[0].value)</div>
  <div class="fx" data-lang="text">start        -&gt; last order: none
after submit -&gt; last order: 5 cups, extra sugar</div>
  <p>Both new values arrived together in one run, and <code>submitted</code> was True only in that run, which is why the result is copied into session state. Use a form whenever the work after the inputs is slow (a prediction, a database query).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>st.session_state</code></strong>: a dictionary-like object, one per user session, that survives reruns (lost when the tab is closed or the server restarts). <strong><code>st.form</code></strong>: a container that batches its widgets' changes until its submit button is pressed.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>st.button</code> is True for one rerun only. Anything that must persist after the click (a result, a "logged in" flag) belongs in <code>session_state</code>. And always initialise with <code>if key not in st.session_state</code>, or you reset it every run.</p></div>

  <h2 id="ds-cache"><span class="num">05</span>Caching</h2>
  <p>Because the script reruns on every click, a line like <code>df = pd.read_csv("big.csv")</code> (3 seconds) or <code>model = joblib.load("model.joblib")</code> (5 seconds) runs on every click too. The app feels broken. <strong>Caching</strong> fixes it: decorate the slow function, and Streamlit runs its body once per distinct set of arguments, stores the result, and returns the stored result on later calls.</p>
  <p>Streamlit has two caches because there are two kinds of slow things. <strong>Data</strong> (DataFrames, query results): each caller gets its own <em>copy</em>, so one user editing their DataFrame can't change anyone else's. <strong>Resources</strong> (an ML model, a database connection): one shared object for everyone, because copying a 500 MB model per call would be slow and a connection can't be copied at all.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>cache_data</code> is a master document kept at the office: everyone who asks gets a photocopy and can scribble on it freely. <code>cache_resource</code> is the one office printer: everybody uses the same machine; if someone changes its settings, everyone gets those settings.</p></div>
  <p>The app below counts how often each function body really runs (in a small module whose list survives reruns), times the calls, and checks whether two calls return the same object:</p>
  <div class="fx" data-lang="py"># cache_app.py   (calls.py contains just: log = [])
import time
import pandas as pd
import streamlit as st
import calls

@st.cache_data
def load_sales(city):
    calls.log.append(f"load_sales({city})")
    time.sleep(1)                                   # pretend: slow file or database read
    return pd.DataFrame({"city": [city], "cups": [120]})

@st.cache_resource
def load_model():
    calls.log.append("load_model()")
    return {"weights": [0.2, 0.8]}                  # pretend: a 500 MB ML model

city = st.selectbox("City", ["Pune", "Delhi"])
t0 = time.perf_counter()
df1, df2 = load_sales(city), load_sales(city)
m1, m2 = load_model(), load_model()
st.write(f"{city}: {time.perf_counter() - t0:.1f}s | data same object? {df1 is df2} "
         f"| model same object? {m1 is m2}")</div>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest
import calls
at = AppTest.from_file("cache_app.py", default_timeout=10).run()
print("run 1 (Pune)  -&gt;", at.markdown[0].value)
at.run()
print("run 2 (Pune)  -&gt;", at.markdown[0].value)
at.selectbox[0].select("Delhi").run()
print("run 3 (Delhi) -&gt;", at.markdown[0].value)
print("function bodies actually run:", calls.log)</div>
  <div class="fx" data-lang="text">run 1 (Pune)  -&gt; Pune: 1.0s | data same object? False | model same object? True
run 2 (Pune)  -&gt; Pune: 0.0s | data same object? False | model same object? True
run 3 (Delhi) -&gt; Delhi: 1.0s | data same object? False | model same object? True
function bodies actually run: ['load_sales(Pune)', 'load_model()', 'load_sales(Delhi)']</div>
  <p>Run 1 paid the 1-second load once (the second call in the same run was already cached). Run 2 took 0.0 s: nothing reloaded. Run 3 changed the argument to Delhi, a new cache key, so <code>load_sales</code> ran once more; <code>load_model</code> never ran again. <code>df1 is df2</code> is False every time (cache_data hands out copies) while <code>m1 is m2</code> is True (cache_resource shares one object).</p>
  <table class="tbl">
    <tr><th></th><th><code>@st.cache_data</code></th><th><code>@st.cache_resource</code></th></tr>
    <tr><td>For</td><td>Data: DataFrames, query results, API responses</td><td>Resources: ML models, DB connections, LLM clients</td></tr>
    <tr><td>Returns</td><td>A fresh <strong>copy</strong> each call (pickled)</td><td>The <strong>same object</strong> to every user</td></tr>
    <tr><td>Mutation safe?</td><td>Yes, callers can't corrupt the cache</td><td>No, a change is seen by everyone</td></tr>
    <tr><td>Key</td><td colspan="2">Function code + argument values. Options: <code>ttl="1h"</code> (expire), <code>max_entries</code>, <code>.clear()</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Cache key</strong>: what Streamlit uses to decide "have I seen this call before?" (the function's code plus its argument values). <strong>TTL</strong> (time to live): how long a cached value is kept before the function runs again, e.g. <code>@st.cache_data(ttl="1h")</code> for data that changes hourly.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Cache a model with <code>cache_data</code> and every rerun unpickles a copy (slow, memory-hungry). Cache a DataFrame with <code>cache_resource</code> and one user's in-place edit leaks to all users. Also: arguments must be hashable; prefix an argument with <code>_</code> (e.g. <code>_conn</code>) to tell Streamlit not to hash it.</p></div>

  <h2 id="ds-layout"><span class="num">06</span>Layout</h2>
  <p>By default Streamlit stacks everything in one column, top to bottom. That is fine for five elements and confusing for fifteen: inputs get mixed with results, and the chart the user cares about sits below a long table. Layout commands put inputs in a sidebar, results side by side, and detail behind tabs or an expander.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A newspaper front page: the headline and photo get the most space, smaller stories sit in narrow columns, and the full stock tables are on page 12. Same paper, organised so the important thing is seen first.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <rect x="10" y="10" width="580" height="132" class="fs" stroke="currentColor"/>
    <rect x="20" y="20" width="130" height="112" class="ft st"/><text x="30" y="40">st.sidebar</text><text x="30" y="60" class="tm">inputs, filters</text>
    <text x="165" y="36">st.title · st.tabs(["Chart", "Data"])</text>
    <rect x="165" y="46" width="140" height="86" class="fb sb"/><text x="175" y="66">col1</text><text x="175" y="86" class="tm">st.metric</text>
    <rect x="315" y="46" width="265" height="86" class="fb sb"/><text x="325" y="66">col2 (twice as wide)</text><text x="325" y="86" class="tm">st.plotly_chart</text>
    <text x="325" y="106" class="tm">st.columns([1, 2])</text>
  </svg><figcaption>Sidebar for inputs, columns for side-by-side output, tabs and expanders to hide detail.</figcaption></figure>
  <p>The dashboard below uses each piece once. <code>with col1:</code> means "everything in this block goes into column 1".</p>
  <div class="fx" data-lang="py"># layout_app.py
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Chai Dashboard", layout="wide")   # first st call
sales = pd.DataFrame({"day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                      "cups": [120, 135, 128, 150, 170, 240, 260]})

city = st.sidebar.selectbox("Stall", ["Pune", "Delhi"])          # inputs live in the sidebar
st.title(f"{city} stall")
col1, col2 = st.columns([1, 2])                                  # col2 is twice as wide
with col1:
    st.metric("Cups this week", f"{sales.cups.sum():,}", delta="+12%")
with col2:
    st.plotly_chart(px.bar(sales, x="day", y="cups"), width="stretch")
tab1, tab2 = st.tabs(["Chart", "Data"])
with tab2:
    st.dataframe(sales)
with st.expander("How is this calculated?"):
    st.write("Sum of cups sold Monday to Sunday.")</div>
  <div class="fx" data-lang="py">at = AppTest.from_file("layout_app.py").run()
print("exceptions:", list(at.exception))
print("title:", at.title[0].value, "| columns:", len(at.columns), "| tabs:", [t.label for t in at.tabs])
print("metric:", at.metric[0].label, at.metric[0].value, at.metric[0].delta)
at.sidebar.selectbox[0].select("Delhi").run()
print("title:", at.title[0].value)</div>
  <div class="fx" data-lang="text">exceptions: []
title: Pune stall | columns: 2 | tabs: ['Chart', 'Data']
metric: Cups this week 1,203 +12%
title: Delhi stall</div>
  <p>The app ran without errors, built two columns and two tabs, and the metric shows 1,203 (the week's total) with a +12% delta arrow. Choosing Delhi in the sidebar reran the script and the title followed. <code>st.set_page_config</code> must be the first Streamlit call; <code>layout="wide"</code> uses the full browser width. <code>width="stretch"</code> makes the chart fill its column. Other containers: <code>st.container()</code> groups elements, <code>st.empty()</code> is a placeholder you can overwrite later (e.g. a progress message).</p>
  <div class="callout trap"><span class="label">Trap</span><p>Tabs don't save work: code inside every tab runs on every rerun, even for hidden tabs. Put expensive work behind a cache, not just inside a tab.</p></div>

  <h2 id="ds-app"><span class="num">07</span>Build It: ML Demo App</h2>
  <p>The common real task: "the model is good; let the sales team try it". The standard shape has two files. <strong>train.py</strong> runs once offline: it fits the model and saves it to disk with <code>joblib</code>. <strong>app.py</strong> is the Streamlit app: it loads the saved model once (cache_resource), collects inputs in a sidebar form, predicts, and shows the prediction next to real data so users can judge it. Never train inside the app: it would retrain on every click.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant cooks the gravy base in the morning (train.py) and keeps it ready; each order only adds the final tadka (prediction). Cooking the base for every plate would make every customer wait an hour.</p></div>
  <div class="flow"><span>train.py: fit + joblib.dump</span><span>app.py: cache model</span><span>sidebar form</span><span>predict</span><span>metric + chart</span></div>
  <p>train.py builds a 1,000-row synthetic orders table shaped like the real one (so it runs anywhere), fits a <strong>Pipeline</strong> (one object that one-hot encodes the text columns, then runs a random forest), and saves it:</p>
  <div class="fx" data-lang="py"># train.py
import numpy as np, pandas as pd, joblib
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# a synthetic orders table shaped like the real one (swap in pd.read_csv("orders.csv"))
rng = np.random.default_rng(42)
n = 1000
base = {"Books": 400, "Beauty": 750, "Fashion": 1500, "Home": 2300, "Electronics": 9000}
o = pd.DataFrame({
    "category": rng.choice(list(base), n, p=[.25, .2, .25, .15, .15]),
    "segment": rng.choice(["new", "regular", "vip"], n, p=[.5, .4, .1]),
    "qty": rng.integers(1, 5, n),
    "discount_pct": rng.choice([0, 5, 10, 20], n)})
price = o.category.map(base) * rng.lognormal(0, 0.4, n)
o["revenue"] = (price * o.qty * (1 - o.discount_pct / 100)).round()
o.to_csv("orders_demo.csv", index=False)

X, y = o[["category", "segment", "qty", "discount_pct"]], o.revenue
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
model = Pipeline([
    ("prep", ColumnTransformer([("cat", OneHotEncoder(handle_unknown="ignore"),
                                 ["category", "segment"])], remainder="passthrough")),
    ("rf", RandomForestRegressor(n_estimators=200, min_samples_leaf=5, random_state=42)),
])
model.fit(X_tr, y_tr)
print(f"rows: {len(o)}, test R2 = {model.score(X_te, y_te):.3f}")
joblib.dump(model, "model.joblib")</div>
  <div class="fx" data-lang="text">rows: 1000, test R2 = 0.685</div>
  <p>R² of 0.685 on held-out rows means the model explains about two-thirds of the variation in order value; the rest is the random price spread within a category, which no input can predict. Saving the whole Pipeline (not just the forest) matters: the app can pass raw text like "Electronics" and the saved encoder handles it.</p>
  <div class="fx" data-lang="py"># app.py
import joblib
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Order Value Predictor", layout="wide")

@st.cache_resource                      # one shared model object per server process
def load_model():
    return joblib.load("model.joblib")

@st.cache_data                          # cached DataFrame; each caller gets a copy
def load_orders():
    return pd.read_csv("orders_demo.csv")

model, orders = load_model(), load_orders()
st.title("Order Value Predictor")

with st.sidebar.form("inputs"):         # form: rerun only when Predict is pressed
    category = st.selectbox("Category", sorted(orders.category.unique()))
    segment = st.radio("Customer segment", ["new", "regular", "vip"], horizontal=True)
    qty = st.slider("Quantity", 1, 4, 2)
    discount = st.select_slider("Discount %", [0, 5, 10, 20], value=0)
    submitted = st.form_submit_button("Predict")

if "history" not in st.session_state:  # survives reruns for this browser session
    st.session_state.history = []

X = pd.DataFrame([{"category": category, "segment": segment, "qty": qty, "discount_pct": discount}])
pred = float(model.predict(X)[0])
if submitted:
    st.session_state.history.append({**X.iloc[0].to_dict(), "predicted": round(pred)})

col1, col2 = st.columns([1, 2])
with col1:
    st.metric("Predicted order value", f"₹{pred:,.0f}")
    same = orders[(orders.category == category) &amp; (orders.qty == qty)]
    st.caption(f"Actual median for {category} × {qty}: ₹{same.revenue.median():,.0f} ({len(same)} orders)")
with col2:
    fig = px.histogram(orders[orders.category == category], x="revenue", nbins=30,
                       title=f"{category}: where your prediction falls")
    fig.add_vline(x=pred, line_dash="dash", annotation_text="prediction")
    st.plotly_chart(fig, width="stretch")

with st.expander("Prediction history"):
    st.dataframe(pd.DataFrame(st.session_state.history))</div>
  <p>Every idea from this note is in there: two caches of the right kind, a sidebar form, session state for history, columns, a metric, a Plotly chart with a line marking the prediction. The test opens the app, then picks Electronics, sets quantity 3 and presses Predict:</p>
  <div class="fx" data-lang="py">at = AppTest.from_file("app.py", default_timeout=60).run()
print("exceptions:", list(at.exception))
print("metric:", at.metric[0].label, "=", at.metric[0].value)
print("caption:", at.caption[0].value)
at.sidebar.selectbox[0].select("Electronics")
at.sidebar.slider[0].set_value(3)
at.sidebar.button[0].click().run()
print("metric:", at.metric[0].value, "| history rows:", len(at.session_state.history))
print("caption:", at.caption[0].value)</div>
  <div class="fx" data-lang="text">exceptions: []
metric: Predicted order value = ₹1,662
caption: Actual median for Beauty × 2: ₹1,522 (58 orders)
metric: ₹27,993 | history rows: 1
caption: Actual median for Electronics × 3: ₹23,930 (44 orders)</div>
  <p>On first load the defaults are Beauty (first alphabetically) and qty 2: prediction ₹1,662 against a real median of ₹1,522. After submitting, the prediction is ₹27,993 against a real median of ₹23,930, and the history has one row. Showing the real median next to the prediction lets users sanity-check the model themselves. Running <code>streamlit run app.py --server.headless true</code> also served it and <code>/_stcore/health</code> answered <code>ok</code>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Predicting on every rerun is fine for a fast model. For a slow one, compute the prediction only <code>if submitted:</code> and store it in session state, or cache the prediction function with <code>@st.cache_data</code> keyed on the inputs.</p></div>

  <h2 id="ds-deploy"><span class="num">08</span>Deploying</h2>
  <p>An app on <code>localhost:8501</code> is visible only on your laptop. Deploying means running it on a server with a public (or company-internal) address. Three things must travel with the code: the exact library versions, the model file, and any secrets (API keys, database passwords), which must never be committed to Git.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Moving house. You pack the furniture (code), write a list so nothing is forgotten (<code>requirements.txt</code>), and hand the house keys to the new owner privately, not taped to the front door (secrets).</p></div>
  <div class="cards">
    <div><b>Community Cloud</b><p>Push to a public GitHub repo with <code>requirements.txt</code>, then "New app" at share.streamlit.io. Secrets go in the app settings and appear as <code>st.secrets</code>.</p><small>Free, demos, ~1 GB RAM (not run here)</small></div>
    <div><b>Docker</b><p>Same image runs on Cloud Run, ECS, Azure, Kubernetes. You own scaling and auth.</p><small>Production / internal tools</small></div>
    <div><b>Others</b><p>Hugging Face Spaces (Streamlit SDK), Snowflake (Streamlit in Snowflake).</p><small>ML demos / data near the warehouse</small></div>
  </div>
  <p>A <strong>Docker image</strong> is a packaged Linux system with Python, your libraries and your code; a <strong>container</strong> is a running copy of it. The Dockerfile below is the standard recipe (not built here); the versions are the ones this note was tested with:</p>
  <div class="fx" data-lang="text"># Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8501
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8501/_stcore/health')"
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0", "--server.headless=true"]

# requirements.txt: pin the versions the model was trained with
streamlit==1.66.0
pandas==3.0.6
plotly==7.1.0
scikit-learn==1.9.1
joblib==1.6.0

docker build -t order-demo . &amp;&amp; docker run -p 8501:8501 order-demo
curl localhost:8501/_stcore/health          # ok</div>
  <p><code>--server.address=0.0.0.0</code> makes Streamlit accept connections from outside the container (the default listens only inside it). <code>EXPOSE</code> and <code>-p 8501:8501</code> connect the container's port to the host. The <code>HEALTHCHECK</code> lets Docker or the cloud platform restart the container if the app stops answering.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A model pickled with scikit-learn 1.9 may fail to load, or silently behave differently, under 1.7. Pin the training versions in <code>requirements.txt</code>. Never commit <code>.streamlit/secrets.toml</code>; add it to <code>.gitignore</code>.</p></div>

  <h2 id="ds-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: state in plain variables</span><p>Reset on every rerun. Use <code>st.session_state</code>, initialised only when the key is missing.</p></div>
  <div class="callout trap"><span class="label">Trap: acting on st.button later</span><p>The button is True for one rerun. Store what the click produced in session state.</p></div>
  <div class="callout trap"><span class="label">Trap: uncached loading</span><p>Reading a big CSV or loading a model at the top of the script runs on every click. Wrap it in a cached function.</p></div>
  <div class="callout trap"><span class="label">Trap: swapped caches</span><p>Model in <code>cache_data</code> = a slow copy every call; DataFrame in <code>cache_resource</code> = one user's edits leak to all.</p></div>
  <div class="callout trap"><span class="label">Trap: wide data into px</span><p><code>color=</code> needs a column naming the series. <code>melt</code> first.</p></div>
  <div class="callout trap"><span class="label">Trap: jumpy animations</span><p>Axes rescale per frame unless <code>range_x</code>/<code>range_y</code> are fixed.</p></div>
  <div class="callout trap"><span class="label">Trap: huge HTML files</span><p>The default <code>write_html</code> embeds 4.6 MB of plotly.js per file. Use <code>include_plotlyjs="cdn"</code> when readers are online.</p></div>
  <div class="callout trap"><span class="label">Trap: unpinned versions and committed secrets</span><p>Pin library versions to match the pickled model; keep secrets in <code>st.secrets</code> or environment variables.</p></div>

  <h2 id="ds-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose graph_objects over Plotly Express?</summary><div class="qa-body">When combining different trace types in custom ways (bars + lines + shapes), building subplots with mixed types, or controlling details px doesn't expose. Often you start with px and add go traces or <code>update_layout</code> to the returned figure, since px returns a <code>go.Figure</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Plotly vs Matplotlib: when each?</summary><div class="qa-body">Plotly for interactive exploration, dashboards and web apps (hover, zoom, legend toggling). Matplotlib/Seaborn for static, publication-quality figures, papers and PDFs, and fine-grained styling. Plotly HTML is heavier (KBs to MBs); Matplotlib PNGs are small.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Streamlit's execution model and its main consequence.</summary><div class="qa-body">Every widget interaction reruns the script from top to bottom, and the page is redrawn from what the script outputs. Consequences: expensive work (loading data, models) must be cached, and anything that must persist between interactions goes in <code>st.session_state</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>st.cache_data</code> vs <code>st.cache_resource</code>?</summary><div class="qa-body"><code>cache_data</code> serialises the return value and hands each caller a copy: right for DataFrames and API results (in the test, <code>df1 is df2</code> was False). <code>cache_resource</code> returns the same object to all sessions: right for models and DB connections, which can't or shouldn't be copied (<code>m1 is m2</code> was True). It must be thread-safe, since users share it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A counter stored in a normal variable never goes above 1. Why, and fix?</summary><div class="qa-body">The rerun sets the variable back to 0 before each click adds 1. Store it in <code>st.session_state</code>, initialised only if the key is missing. In the test, plain stayed at 1 while session_state counted 1, 2, 3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your app retrains or reloads a 500 MB model on every slider move. Fix?</summary><div class="qa-body">Train offline and save it (<code>joblib.dump</code>); load it in a function decorated with <code>@st.cache_resource</code>. Wrap inputs in <code>st.form</code> so predictions run only on Submit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>st.form</code>?</summary><div class="qa-body">Widgets inside a form don't trigger reruns until the submit button is pressed, so the user can set several inputs and the expensive step runs once, with all values together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a Streamlit app in CI?</summary><div class="qa-body"><code>streamlit.testing.v1.AppTest</code>: run the script headless, set widget values, click buttons, assert on <code>at.metric</code>, <code>at.exception</code> and <code>at.session_state</code>. Plus a smoke test hitting <code>/_stcore/health</code> on the running container.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle API keys in a deployed Streamlit app?</summary><div class="qa-body"><code>st.secrets</code>: local <code>.streamlit/secrets.toml</code> (git-ignored), the secrets box on Community Cloud, or environment variables / a secret manager in Docker. Never hard-code them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your animated Plotly chart looks jumpy. Why?</summary><div class="qa-body">Axis ranges autoscale per frame. Set <code>range_x</code>/<code>range_y</code> to the global min/max so only the data moves. Also check every frame has every category, or points pop in and out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>include_plotlyjs="cdn"</code> change?</summary><div class="qa-body">The HTML file links to plotly.js on a CDN instead of embedding it: 7.8 KB instead of 4.6 MB in the test. The reader needs internet access to see the chart.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Streamlit vs Dash vs a React frontend?</summary><div class="qa-body">Streamlit: fastest to build, script-style, good for demos and internal tools; less layout control and the rerun model limits complex apps. Dash: callback-based Plotly apps, finer control, more code. React + API: full product UI, needs frontend engineers.</div></details>
</main>
`
});
