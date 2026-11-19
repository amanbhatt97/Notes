// notes/dataanalysis/da_plotly_streamlit.js — Plotly & Streamlit
Object.assign(TOPIC_CONTENT, {
  "da_plotly_streamlit": `<main>
<h1>Plotly &amp; Streamlit</h1>
  <div class="where"><span>Data Analysis</span><span>Interactive</span><span>Plotly &amp; Streamlit</span></div>
  <p class="lead">A chart saved as a PNG is a photograph: nobody can hover over a point to read its exact value, zoom into one week, or switch to another city. This page covers the two Python tools that fix that. <strong>Plotly</strong> draws charts that carry their data into the browser, so the reader can explore them, and <strong>Streamlit</strong> turns an ordinary Python script into a small web app, so the reader can change inputs, upload data or ask a model for a prediction. Together they are how analysts and ML engineers turn a notebook into something a manager or a colleague can actually use. We start with why a static chart is not enough, build Plotly figures and export them, then build Streamlit apps one idea at a time, ending with a demo that predicts delivery times. The running example is the same food-delivery data as the rest of the track: eight hand-sized orders and the 1,000-order table from the <a class="xref" data-note="da_numpy">NumPy</a> note's <code>make_orders()</code>. Every Streamlit app on this page was executed with Streamlit's own test runner, so the outputs shown are what the apps really produced.</p>

  <h2 id="ds-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Plotly &amp; Streamlit</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Plotly</div>
        <ul>
          <li>A figure is data (traces) + layout, drawn in the browser by plotly.js</li>
          <li><b>px</b>: one call on a DataFrame; <code>color=</code> → one trace per group</li>
          <li><b>go</b>: build or adjust piece by piece; <code>make_subplots</code></li>
          <li>Export: <code>write_html</code> (interactive), <code>write_image</code> (static, needs Kaleido)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streamlit's rule</div>
        <ul>
          <li>The script is the app: <code>streamlit run app.py</code></li>
          <li>Every interaction reruns the whole script, top to bottom</li>
          <li>Widgets return their current value</li>
          <li>Forms batch inputs until Submit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Paying for reruns</div>
        <ul>
          <li><code>st.session_state</code>: per-user memory across reruns</li>
          <li><code>@st.cache_data</code>: data, a copy per caller</li>
          <li><code>@st.cache_resource</code>: models, connections, one shared object</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shipping it</div>
        <ul>
          <li>ML demo: train offline, load cached model, form, predict, show context</li>
          <li>Test with <code>AppTest</code></li>
          <li>Deploy: Community Cloud or Docker; pin versions; secrets out of Git</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ds-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Interactive Charts</span><span class="rm-sub">what a PNG cannot do</span></div></div>
      <div class="rm-item rm-done" data-target="ds-px"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Plotly Express</span><span class="rm-sub">a whole chart in one call</span></div></div>
      <div class="rm-item rm-done" data-target="ds-go"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Graph Objects</span><span class="rm-sub">what a figure is made of</span></div></div>
      <div class="rm-item rm-done" data-target="ds-export"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Exporting Plotly Figures</span><span class="rm-sub">HTML, PNG, SVG, JSON</span></div></div>
      <div class="rm-item rm-done" data-target="ds-app"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">From Script to App</span><span class="rm-sub">why dashboards need Streamlit</span></div></div>
      <div class="rm-item rm-done" data-target="ds-exec"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Rerun Model</span><span class="rm-sub">what runs when the user clicks</span></div></div>
      <div class="rm-item rm-done" data-target="ds-widgets"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Widgets and Forms</span><span class="rm-sub">reading input, batching it</span></div></div>
      <div class="rm-item rm-done" data-target="ds-state"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Session State</span><span class="rm-sub">remembering between reruns</span></div></div>
      <div class="rm-item rm-done" data-target="ds-cache"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Caching</span><span class="rm-sub">cache_data vs cache_resource</span></div></div>
      <div class="rm-item rm-done" data-target="ds-ml"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Building an ML Demo</span><span class="rm-sub">layout, model, prediction, tests</span></div></div>
      <div class="rm-item rm-done" data-target="ds-deploy"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Deployment</span><span class="rm-sub">putting the app on a server</span></div></div>
      <div class="rm-item rm-done" data-target="ds-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">reruns, caches, traces</span></div></div>
      <div class="rm-item rm-done" data-target="ds-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">APIs, rules, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="ds-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="ds-need"><span class="num">01</span>Why Interactive Charts</h2>
  <p>In <a class="xref" data-note="da_viz">Matplotlib &amp; Seaborn</a> we drew a daily revenue chart and sent it to the operations manager. Her replies are predictable: "what exactly was the peak?", "show me only Delhi", "can you zoom into the third week?". Each question means going back to the code, drawing a new image and sending it again. To see why the image cannot answer for itself, look at what each kind of chart file actually contains. First the data used throughout this page:</p>
  <div class="fx" data-lang="py">import numpy as np
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
  <p>Now the same daily revenue saved two ways: as a Matplotlib PNG, and as a Plotly HTML page. For each file we ask what is inside it.</p>
  <div class="fx" data-lang="py">import json, base64
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

daily = orders.set_index("order_time").amount.resample("D").sum()
fig, ax = plt.subplots(figsize=(8, 3))
ax.plot(daily.index, daily.values)
fig.savefig("daily.png", dpi=80)
plt.close(fig)
pixels = plt.imread("daily.png")                   # everything a PNG can give back
print("PNG :", pixels.shape, "= rows x columns x colour channels")

fig_i = px.line(daily.reset_index(), x="order_time", y="amount")
fig_i.write_html("daily.html", include_plotlyjs="cdn")
page = open("daily.html").read()
y = json.loads(fig_i.to_json())["data"][0]["y"]    # how the y values are stored in the page
values = np.frombuffer(base64.b64decode(y["bdata"]), dtype=y["dtype"])
print("HTML:", f"{len(page) / 1024:.1f} KB, holding {len(values)} numbers, max {values.max():,.0f}")
print("hover text:", fig_i.data[0].hovertemplate)</div>
  <div class="fx" data-lang="text">PNG : (240, 640, 4) = rows x columns x colour channels
HTML: 10.3 KB, holding 31 numbers, max 18,180
hover text: order_time=%{x}&lt;br&gt;amount=%{y}&lt;extra&gt;&lt;/extra&gt;</div>
  <p>Reading the PNG back gives a grid of 240 × 640 pixels with 4 colour values each, and nothing else. The 31 daily revenue figures were turned into coloured dots when the image was saved, and coloured dots cannot be hovered, filtered or re-scaled. The Plotly file is a small web page of about 10 KB that contains the 31 numbers themselves (stored compactly, base64-encoded, under the name <code>bdata</code>; decoded, the largest is ₹18,180, the 24 March peak) plus a <strong>hover template</strong>, the text shown when the mouse rests on a point. When the page opens, a JavaScript library called <strong>plotly.js</strong> draws the chart from that data inside the browser, so it can redraw it instantly when the reader hovers over a day, drags a box to zoom, double-clicks to reset, or clicks a legend entry to hide a series.</p>
  <p>That is the definition worth remembering: an <strong>interactive chart</strong> sends the data and a small drawing program to the viewer, so the viewer's actions are answered on their own device without asking the author. A printed railway timetable and a train app hold the same information, but only the app lets you tap a train to see its coaches or filter to your own station. Interactivity has a cost, though. The data travels with the chart, so anything in it, including anything you put in hover text, is visible to whoever receives the file, and a big dataset makes a big page. For a PDF report or a printed slide, a well-made static chart is still the right choice.</p>

  <h2 id="ds-px"><span class="num">02</span>Plotly Express</h2>
  <p>Plotly offers two ways to build a figure. <strong>Plotly Express</strong>, imported as <code>px</code>, makes a complete figure from a DataFrame in one function call, in much the same way Seaborn does for Matplotlib. Like Seaborn, it wants <strong>long (tidy)</strong> data: one row per point, and a column whose values name the group each point belongs to. To understand what it builds, it helps to know Plotly's vocabulary. A Plotly figure is drawn from a list of <strong>traces</strong>; a trace is one series of marks with its own colour and legend entry, such as one set of points, one line or one set of bars. When you pass <code>color="city"</code>, px splits the rows by city and makes one trace per city.</p>
  <p>On the eight orders that means three traces, which we can predict by hand. Pune has orders 1, 3 and 5, with amounts 450, 610, 150 and delivery times 32, 41, 18. Delhi has orders 2, 6 and 7; Mumbai has orders 4 and 8. Traces appear in the order the groups first appear in the data, so the expected order is Pune, Delhi, Mumbai. Let us build the scatter plot of amount against delivery time, with the order id and restaurant added to the hover text:</p>
  <div class="fx" data-lang="py">fig = px.scatter(orders8, x="amount", y="delivery_minutes", color="city",
                 hover_data=["order_id", "restaurant"],
                 title="Bigger orders take longer")
print(type(fig).__name__, len(fig.data), [t.name for t in fig.data])
print(fig.data[0].x, fig.data[0].y)
print(fig.data[0].hovertemplate)
print(fig.data[0].customdata.tolist())
fig.update_traces(marker_size=11)
fig.write_image("px_scatter.svg", width=700, height=360)    # a static copy for this page</div>
  <div class="fx" data-lang="text">Figure 3 ['Pune', 'Delhi', 'Mumbai']
[450 610 150] [32 41 18]
city=Pune&lt;br&gt;amount=%{x}&lt;br&gt;delivery_minutes=%{y}&lt;br&gt;order_id=%{customdata[0]}&lt;br&gt;restaurant=%{customdata[1]}&lt;extra&gt;&lt;/extra&gt;
[[1, 'Pizza Hub'], [3, 'Biryani Bros'], [5, 'Dosa Point']]</div>
  <figure class="viz"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 700 360" fill="currentColor" style="width:100%;max-width:875px;height:auto" role="img"><rect x="0" y="0" width="700" height="360" style="fill: currentColor; fill-opacity: 0;"/><defs><g class="clips"><clipPath id="plotly_streamlit-px_scatter-0" class="plotclip"><rect width="529" height="240"/></clipPath><clipPath class="axesclip"><rect x="60" y="0" width="529" height="360"/></clipPath><clipPath class="axesclip"><rect x="0" y="60" width="700" height="240"/></clipPath><clipPath class="axesclip"><rect x="60" y="60" width="529" height="240"/></clipPath></g><g class="gradients"/><g class="patterns"/></defs><g class="bglayer"><rect class="bg" x="60" y="60" width="529" height="240" style="fill: currentColor; fill-opacity: 0; stroke-width: 0;"/></g><g class="layer-below"><g class="imagelayer"/><g class="shapelayer"/></g><g class="cartesianlayer"><g class="subplot xy"><g class="layer-subplot"><g class="shapelayer"/><g class="imagelayer"/></g><g class="minor-gridlayer"><g class="x"/><g class="y"/></g><g class="gridlayer"><g class="x"/><g class="y"/></g><g class="zerolinelayer"/><g class="layer-between"><g class="shapelayer"/><g class="imagelayer"/></g><path class="xlines-below"/><path class="ylines-below"/><g class="overlines-below"/><g class="xaxislayer-below"/><g class="yaxislayer-below"/><g class="overaxes-below"/><g class="overplot"><g class="xy" transform="translate(60,60)" clip-path="url(#plotly_streamlit-px_scatter-0)"><g class="scatterlayer mlayer"><g class="trace scatter trace2fe86d" style="stroke-miterlimit: 2; opacity: 1;"><g class="fills"/><g class="errorbars"/><g class="lines"/><g class="points"><path class="point plotly-customdata" transform="translate(276.6,116.2)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point plotly-customdata" transform="translate(406.4,48.8)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point plotly-customdata" transform="translate(33.3,221.1)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/></g><g class="text"/></g><g class="trace scatter tracecb92f8" style="stroke-miterlimit: 2; opacity: 1;"><g class="fills"/><g class="errorbars"/><g class="lines"/><g class="points"><path class="point plotly-customdata" transform="translate(90.1,168.6)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;"/><path class="point plotly-customdata" transform="translate(495.6,18.8)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;"/><path class="point plotly-customdata" transform="translate(155,131.2)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;"/></g><g class="text"/></g><g class="trace scatter trace1f5496" style="stroke-miterlimit: 2; opacity: 1;"><g class="fills"/><g class="errorbars"/><g class="lines"/><g class="points"><path class="point plotly-customdata" transform="translate(219.8,146.2)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;"/><path class="point plotly-customdata" transform="translate(130.6,198.6)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;"/></g><g class="text"/></g></g></g></g><g class="zerolinelayer-above"/><path class="xlines-above crisp" d="M59,300.5H589" style="fill: none; stroke-width: 1px; stroke: currentColor; stroke-opacity: 1;"/><path class="ylines-above crisp" d="M59.5,60V300" style="fill: none; stroke-width: 1px; stroke: currentColor; stroke-opacity: 1;"/><g class="overlines-above"/><g class="xaxislayer-above"><path class="xtick ticks crisp" d="M0,301v5" transform="translate(133.8,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,301v5" transform="translate(215,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,301v5" transform="translate(296.1,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,301v5" transform="translate(377.2,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,301v5" transform="translate(458.3,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,301v5" transform="translate(539.4,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><g class="xtick"><text text-anchor="middle" x="0" y="320.4" transform="translate(133.8,0)" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">200</text></g><g class="xtick"><text text-anchor="middle" x="0" y="320.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(215,0)">300</text></g><g class="xtick"><text text-anchor="middle" x="0" y="320.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(296.1,0)">400</text></g><g class="xtick"><text text-anchor="middle" x="0" y="320.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(377.2,0)">500</text></g><g class="xtick"><text text-anchor="middle" x="0" y="320.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(458.3,0)">600</text></g><g class="xtick"><text text-anchor="middle" x="0" y="320.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(539.4,0)">700</text></g></g><g class="yaxislayer-above"><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,266.1)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,228.6)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,191.2)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,153.7)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,116.3)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,78.8)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" transform="translate(0,266.1)" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">20</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,228.6)">25</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,191.2)">30</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,153.7)">35</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,116.3)">40</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,78.8)">45</text></g></g><g class="overaxes-above"/></g></g><g class="polarlayer"/><g class="smithlayer"/><g class="ternarylayer"/><g class="geolayer"/><g class="funnelarealayer"/><g class="pielayer"/><g class="iciclelayer"/><g class="treemaplayer"/><g class="sunburstlayer"/><g class="glimages"/><defs><g class="clips"/><clipPath id="plotly_streamlit-px_scatter-1"><rect width="88" height="86" x="0" y="0"/></clipPath></defs><g class="layer-above"><g class="imagelayer"/><g class="shapelayer"/></g><g class="infolayer"><g class="legend" pointer-events="all" transform="translate(599.5,60)"><rect class="bg" shape-rendering="crispEdges" style="stroke: currentColor; stroke-opacity: 1; fill: currentColor; fill-opacity: 0; stroke-width: 0px;" width="88" height="86" x="0" y="0"/><g class="scrollbox" transform="" clip-path="url(#plotly_streamlit-px_scatter-1)"><text class="legendtitletext" text-anchor="start" x="2" y="18.2" style="font-family: sans-serif; font-size: 14px; fill: currentColor; fill-opacity: 1; white-space: pre; opacity: 1;">city</text><g class="groups" transform=""><g class="traces" transform="translate(0,32.7)" style="opacity: 1;"><text class="legendtext" text-anchor="start" x="40" y="4.6" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">Pune</text><g class="layers" style="opacity: 1;"><g class="legendfill"/><g class="legendlines"/><g class="legendsymbols"><g class="legendpoints"><path class="scatterpts" transform="translate(20,0)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/></g></g></g><rect class="legendtoggle" x="0" y="-9.5" width="82.6" height="19" style="fill: currentColor; fill-opacity: 0;"/></g></g><g class="groups" transform=""><g class="traces" transform="translate(0,51.7)" style="opacity: 1;"><text class="legendtext" text-anchor="start" x="40" y="4.6" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">Delhi</text><g class="layers" style="opacity: 1;"><g class="legendfill"/><g class="legendlines"/><g class="legendsymbols"><g class="legendpoints"><path class="scatterpts" transform="translate(20,0)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;"/></g></g></g><rect class="legendtoggle" x="0" y="-9.5" width="82.6" height="19" style="fill: currentColor; fill-opacity: 0;"/></g></g><g class="groups" transform=""><g class="traces" transform="translate(0,70.7)" style="opacity: 1;"><text class="legendtext" text-anchor="start" x="40" y="4.6" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">Mumbai</text><g class="layers" style="opacity: 1;"><g class="legendfill"/><g class="legendlines"/><g class="legendsymbols"><g class="legendpoints"><path class="scatterpts" transform="translate(20,0)" d="M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;"/></g></g></g><rect class="legendtoggle" x="0" y="-9.5" width="82.6" height="19" style="fill: currentColor; fill-opacity: 0;"/></g></g></g><rect class="scrollbar" rx="20" ry="3" width="0" height="0" style="fill: rgb(128, 139, 164); fill-opacity: 1;" x="0" y="0"/></g><g class="g-gtitle"><text class="gtitle" x="35" y="30" text-anchor="start" dy="0em" style="opacity: 1; font-family: sans-serif; font-size: 17px; fill: currentColor; fill-opacity: 1; white-space: pre;">Bigger orders take longer</text></g><g class="g-xtitle"><text class="xtitle" x="324.5" y="347.7" text-anchor="middle" style="opacity: 1; font-family: sans-serif; font-size: 14px; fill: currentColor; fill-opacity: 1; white-space: pre;">amount</text></g><g class="g-ytitle"><text class="ytitle" transform="rotate(-90,18.8,180)" x="18.8" y="180" text-anchor="middle" style="opacity: 1; font-family: sans-serif; font-size: 14px; fill: currentColor; fill-opacity: 1; white-space: pre;">delivery_minutes</text></g></g></svg><figcaption>A static SVG copy of the px figure, exported with <code>write_image</code>. In a notebook or browser the same figure is interactive: hovering a point shows its city, amount, minutes, order id and restaurant.</figcaption></figure>
  <p>The printed lines show the structure px built. <code>fig.data</code> is the list of traces: exactly three, named Pune, Delhi and Mumbai in that order, and Pune's trace holds x = [450 610 150] and y = [32 41 18], just as predicted. px also wrote the hover template for us: <code>%{x}</code> and <code>%{y}</code> are placeholders filled with each point's values, and <code>&lt;br&gt;</code> is a line break. The <code>hover_data</code> columns went into a field called <code>customdata</code>, one small list per point (<code>[1, 'Pizza Hub']</code> for order 1), and the template reads them back as <code>%{customdata[0]}</code> and <code>%{customdata[1]}</code>. In a notebook, <code>fig.show()</code> displays the interactive figure. (The figures on this page use Plotly's <code>simple_white</code> template with a transparent background so they read in both light and dark themes; Plotly's own default template has a light blue-grey background.)</p>
  <p>The real strength of px is that many powerful charts are just one more argument. On the 1,000 orders:</p>
  <div class="fx" data-lang="py">orders["week"] = (orders.order_time.dt.day - 1) // 7 + 1           # week 1..5 of March
weekly = orders.groupby(["week", "city"], as_index=False).amount.sum()
print(weekly.head(3).to_string(index=False))

fig = px.bar(weekly, x="city", y="amount", animation_frame="week",
             range_y=[0, weekly.amount.max() * 1.1])               # fixed axis: only the bars move
print("frames:", [f.name for f in fig.frames], "| slider steps:", len(fig.layout.sliders[0].steps))
print("week 1 bars:", fig.frames[0].data[0].y.tolist(), "| y range:", fig.layout.yaxis.range)

fig_f = px.histogram(orders, x="delivery_minutes", facet_col="city", nbins=20)
print("facets:", [a.text for a in fig_f.layout.annotations])

geo = (orders.groupby("city").agg(n=("order_id", "count"), minutes=("delivery_minutes", "mean"))
       .reset_index()
       .assign(lat=lambda d: d.city.map({"Pune": 18.52, "Delhi": 28.61, "Mumbai": 19.08}),
               lon=lambda d: d.city.map({"Pune": 73.86, "Delhi": 77.21, "Mumbai": 72.88})))
fig_map = px.scatter_map(geo, lat="lat", lon="lon", size="n", color="minutes",
                         hover_name="city", zoom=3.5, map_style="carto-positron")
print("map:", fig_map.data[0].type, "| sizes:", fig_map.data[0].marker.size.tolist(),
      "| minutes:", geo.minutes.round(1).tolist())</div>
  <div class="fx" data-lang="text"> week   city  amount
    1  Delhi 29940.0
    1 Mumbai 27430.0
    1   Pune 38180.0
frames: ['1', '2', '3', '4', '5'] | slider steps: 5
week 1 bars: [29940.0, 27430.0, 38180.0] | y range: (0, 45023.0)
facets: ['city=Delhi', 'city=Mumbai', 'city=Pune']
map: scattermap | sizes: [341, 257, 402] | minutes: [32.9, 31.0, 27.9]</div>
  <p>An <strong>animation</strong> is a sequence of <strong>frames</strong>, each one a complete state of the chart. <code>animation_frame="week"</code> made one frame per week, five in total, each holding that week's three city totals (week 1: Delhi ₹29,940, Mumbai ₹27,430, Pune ₹38,180), and added a play button and a slider with five steps. <code>range_y</code> fixed the y-axis from 0 to ₹45,023 for every frame. Without it the axis would rescale on each frame, and a bar could appear to shrink while its value actually grew. <code>facet_col="city"</code> drew one small histogram per city side by side, a technique called faceting or small multiples. And <code>scatter_map</code> places a bubble on each city's latitude and longitude, sized by the number of orders (Delhi 341, Mumbai 257, Pune 402) and coloured by average delivery time (Delhi slowest at 32.9 minutes); the <code>carto-positron</code> base map needs no API key. For coloured regions such as states, <code>px.choropleth</code> takes a GeoJSON file of boundaries instead. Other one-call charts you will meet are <code>px.line</code>, <code>px.bar</code>, <code>px.box</code>, <code>px.histogram(..., marginal="box")</code> and <code>px.treemap(path=["city", "restaurant"], values="amount")</code> for hierarchies.</p>
  <p>Think of px as a set menu at a restaurant: you name the dish and it arrives complete, with matching sides. It decides the structure for you, one trace per colour, its own axes and legend. When you need a combination it does not offer, you order à la carte, which is the next section.</p>

  <h2 id="ds-go"><span class="num">03</span>Graph Objects</h2>
  <p>Every Plotly figure, including every figure px returns, is an object from the module <code>plotly.graph_objects</code>, usually imported as <code>go</code>. A <code>go.Figure</code> has exactly two parts. The <strong>data</strong> is the list of traces, each one an object such as <code>go.Bar</code> or <code>go.Scatter</code>. The <strong>layout</strong> is everything that is not data: titles, axes, legend, the template, and <strong>shapes</strong> such as reference lines. Building with go means creating an empty figure and adding pieces yourself. Here is a bar chart of orders per day with a dotted average line:</p>
  <div class="fx" data-lang="py">by_day = orders.set_index("order_time").resample("D").agg(
    n_orders=("order_id", "count"), avg_minutes=("delivery_minutes", "mean")).reset_index()

fig = go.Figure()
fig.add_trace(go.Bar(x=by_day.order_time, y=by_day.n_orders, name="orders"))
fig.add_hline(y=by_day.n_orders.mean(), line_dash="dot",
              annotation_text=f"average {by_day.n_orders.mean():.1f}")
fig.update_layout(title="Orders per day, March")
d = fig.to_dict()
print(list(d), "| traces:", len(d["data"]), d["data"][0]["type"],
      "| shapes:", len(fig.layout.shapes), "| title:", fig.layout.title.text)</div>
  <div class="fx" data-lang="text">['data', 'layout'] | traces: 1 bar | shapes: 1 | title: Orders per day, March</div>
  <p>The figure is, quite literally, a dictionary with the two keys <code>data</code> and <code>layout</code>, and that dictionary written out as JSON is exactly what the HTML page from section 01 carried to the browser. <code>add_trace</code> appended one bar trace to the data. <code>add_hline</code> added one shape to the layout, the dotted average line with its label. <code>update_layout</code> set the title. The same three methods, together with <code>update_traces</code> for changing every trace at once, work on any figure.</p>
  <p>The most common reason to reach for go is a figure with several panels. In the Matplotlib note we saw that two series with different units, such as orders per day and average delivery minutes, should not share a chart with two y-axes, because the author's choice of scales decides whether the lines look related. The honest alternative is two panels stacked vertically that share one x-axis. <code>make_subplots</code> builds that layout, and <code>row=</code> and <code>col=</code> choose where each trace goes:</p>
  <div class="fx" data-lang="py">from plotly.subplots import make_subplots
by_day = orders.set_index("order_time").resample("D").agg(
    n_orders=("order_id", "count"), avg_minutes=("delivery_minutes", "mean")).reset_index()

fig = make_subplots(rows=2, cols=1, shared_xaxes=True,
                    subplot_titles=["Orders per day", "Average delivery minutes"])
fig.add_trace(go.Bar(x=by_day.order_time, y=by_day.n_orders, name="orders"), row=1, col=1)
fig.add_trace(go.Scatter(x=by_day.order_time, y=by_day.avg_minutes, name="minutes",
                         mode="lines"), row=2, col=1)
fig.update_layout(showlegend=False)
print([t.xaxis + "/" + t.yaxis for t in fig.data], "| top x-axis follows:", fig.layout.xaxis.matches)
fig.write_image("go_subplots.svg", width=700, height=420)

px_fig = px.line(by_day, x="order_time", y="avg_minutes")       # px returns a go.Figure...
px_fig.add_trace(go.Scatter(x=by_day.order_time, y=[30] * len(by_day),
                            mode="lines", name="target"))         # ...so go traces can be added
print(type(px_fig).__name__, [t.type for t in px_fig.data])</div>
  <div class="fx" data-lang="text">['x/y', 'x2/y2'] | top x-axis follows: x2
Figure ['scatter', 'scatter']</div>
  <figure class="viz"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 700 420" fill="currentColor" style="width:100%;max-width:875px;height:auto" role="img"><style>.plotly_streamlit-go_subplots-s0{vector-effect: none; opacity: 1; stroke-width: 0.5px; fill: rgb(31, 119, 180); fill-opacity: 1; stroke: rgb(255, 255, 255); stroke-opacity: 1;}.plotly_streamlit-go_subplots-s1{stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;}</style><rect x="0" y="0" width="700" height="420" style="fill: currentColor; fill-opacity: 0;"/><defs><g class="clips"><clipPath id="plotly_streamlit-go_subplots-1" class="plotclip"><rect width="620" height="116.2"/></clipPath><clipPath id="plotly_streamlit-go_subplots-0" class="plotclip"><rect width="620" height="116.2"/></clipPath><clipPath class="axesclip"><rect x="60" y="0" width="620" height="420"/></clipPath><clipPath class="axesclip"><rect x="0" y="60" width="700" height="116.2"/></clipPath><clipPath class="axesclip"><rect x="60" y="60" width="620" height="116.2"/></clipPath><clipPath class="axesclip"><rect x="0" y="253.7" width="700" height="116.2"/></clipPath><clipPath class="axesclip"><rect x="60" y="253.7" width="620" height="116.2"/></clipPath><clipPath class="axesclip"><rect x="60" y="0" width="620" height="420"/></clipPath><clipPath class="axesclip"><rect x="60" y="60" width="620" height="116.2"/></clipPath><clipPath class="axesclip"><rect x="60" y="253.7" width="620" height="116.2"/></clipPath></g><g class="gradients"/><g class="patterns"/></defs><g class="bglayer"><rect class="bg" x="60" y="60" width="620" height="116.2" style="fill: currentColor; fill-opacity: 0; stroke-width: 0;"/><rect class="bg" x="60" y="253.7" width="620" height="116.2" style="fill: currentColor; fill-opacity: 0; stroke-width: 0;"/></g><g class="layer-below"><g class="imagelayer"/><g class="shapelayer"/></g><g class="cartesianlayer"><g class="subplot xy"><g class="layer-subplot"><g class="shapelayer"/><g class="imagelayer"/></g><g class="minor-gridlayer"><g class="x"/><g class="y"/></g><g class="gridlayer"><g class="x"/><g class="y"/></g><g class="zerolinelayer"/><g class="layer-between"><g class="shapelayer"/><g class="imagelayer"/></g><path class="xlines-below"/><path class="ylines-below"/><g class="overlines-below"/><g class="xaxislayer-below"/><g class="yaxislayer-below"/><g class="overaxes-below"/><g class="overplot"><g class="xy" transform="translate(60,60)" clip-path="url(#plotly_streamlit-go_subplots-1)"><g class="barlayer mlayer"><g class="trace bars" style="opacity: 1;"><g class="points"><g class="point"><path d="M2,116.2V37.0H18V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M22,116.2V22.6H38V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M42,116.2V53.8H58V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M62,116.2V32.2H78V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M82,116.2V34.6H98V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M102,116.2V32.2H118V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M122,116.2V51.4H138V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M142,116.2V39.4H158V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M162,116.2V44.2H178V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M182,116.2V20.2H198V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M202,116.2V5.8H218V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M222,116.2V44.2H238V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M242,116.2V34.6H258V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M262,116.2V20.2H278V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M282,116.2V51.4H298V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M302,116.2V51.4H318V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M322,116.2V61.0H338V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M342,116.2V41.8H358V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M362,116.2V22.6H378V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M382,116.2V22.6H398V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M402,116.2V41.8H418V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M422,116.2V63.4H438V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M442,116.2V51.4H458V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M462,116.2V17.8H478V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M482,116.2V58.6H498V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M502,116.2V22.6H518V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M522,116.2V58.6H538V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M542,116.2V41.8H558V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M562,116.2V37.0H578V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M582,116.2V56.2H598V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g><g class="point"><path d="M602,116.2V29.8H618V116.2Z" class="plotly_streamlit-go_subplots-s0"/></g></g></g></g></g></g><g class="zerolinelayer-above"/><path class="xlines-above crisp" d="M59,176.7H680" style="fill: none; stroke-width: 1px; stroke: currentColor; stroke-opacity: 1;"/><path class="ylines-above crisp" d="M59.5,60V176.2" style="fill: none; stroke-width: 1px; stroke: currentColor; stroke-opacity: 1;"/><g class="overlines-above"/><g class="xaxislayer-above"><path class="xtick ticks crisp" d="M0,177.2v5" transform="translate(90,0)" class="plotly_streamlit-go_subplots-s1"/><path class="xtick ticks crisp" d="M0,177.2v5" transform="translate(230,0)" class="plotly_streamlit-go_subplots-s1"/><path class="xtick ticks crisp" d="M0,177.2v5" transform="translate(370,0)" class="plotly_streamlit-go_subplots-s1"/><path class="xtick ticks crisp" d="M0,177.2v5" transform="translate(510,0)" class="plotly_streamlit-go_subplots-s1"/><path class="xtick ticks crisp" d="M0,177.2v5" transform="translate(650,0)" class="plotly_streamlit-go_subplots-s1"/></g><g class="yaxislayer-above"><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,176.2)" class="plotly_streamlit-go_subplots-s1"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,152.2)" class="plotly_streamlit-go_subplots-s1"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,128.2)" class="plotly_streamlit-go_subplots-s1"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,104.2)" class="plotly_streamlit-go_subplots-s1"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,80.2)" class="plotly_streamlit-go_subplots-s1"/><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" transform="translate(0,176.2)" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">0</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,152.2)">10</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,128.2)">20</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,104.2)">30</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,80.2)">40</text></g></g><g class="overaxes-above"/></g><g class="subplot x2y2"><g class="layer-subplot"><g class="shapelayer"/><g class="imagelayer"/></g><g class="minor-gridlayer"><g class="x2"/><g class="y2"/></g><g class="gridlayer"><g class="x2"/><g class="y2"/></g><g class="zerolinelayer"/><g class="layer-between"><g class="shapelayer"/><g class="imagelayer"/></g><path class="xlines-below"/><path class="ylines-below"/><g class="overlines-below"/><g class="xaxislayer-below"/><g class="yaxislayer-below"/><g class="overaxes-below"/><g class="overplot"><g class="x2y2" transform="translate(60,253.7)" clip-path="url(#plotly_streamlit-go_subplots-0)"><g class="scatterlayer mlayer"><g class="trace scatter traceb2331b" style="stroke-miterlimit: 2; opacity: 1;"><g class="fills"/><g class="errorbars"/><g class="lines"><path class="js-line" d="M10,86.2L30,75.5L50,47.9L70,57.6L90,70.7L110,40.7L130,74.9L150,76.0L170,56.7L190,49.7L210,110.4L230,59.9L250,47.7L270,48.8L290,5.8L310,50.2L330,82.2L350,102.0L370,66.3L390,37.5L410,78.0L430,74.1L450,43.9L470,75.8L490,42.9L510,38.4L530,78.6L550,51.0L570,107.0L590,72.9L610,33.1" style="vector-effect: none; fill: none; stroke: rgb(255, 127, 14); stroke-opacity: 1; stroke-width: 2px; opacity: 1;"/></g><g class="points"/><g class="text"/></g></g></g></g><g class="zerolinelayer-above"/><path class="xlines-above crisp" d="M59,370.5H680" style="fill: none; stroke-width: 1px; stroke: currentColor; stroke-opacity: 1;"/><path class="ylines-above crisp" d="M59.5,253.7V370" style="fill: none; stroke-width: 1px; stroke: currentColor; stroke-opacity: 1;"/><g class="overlines-above"/><g class="xaxislayer-above"><path class="x2tick ticks crisp" d="M0,371v5" transform="translate(90,0)" class="plotly_streamlit-go_subplots-s1"/><path class="x2tick ticks crisp" d="M0,371v5" transform="translate(230,0)" class="plotly_streamlit-go_subplots-s1"/><path class="x2tick ticks crisp" d="M0,371v5" transform="translate(370,0)" class="plotly_streamlit-go_subplots-s1"/><path class="x2tick ticks crisp" d="M0,371v5" transform="translate(510,0)" class="plotly_streamlit-go_subplots-s1"/><path class="x2tick ticks crisp" d="M0,371v5" transform="translate(650,0)" class="plotly_streamlit-go_subplots-s1"/><g class="x2tick"><text text-anchor="middle" x="0" y="390.4" transform="translate(90,0)" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;"><tspan class="line" dy="0em" x="0" y="390.4">Mar 2</tspan><tspan class="line" dy="1.3em" x="0" y="390.4">2025</tspan></text></g><g class="x2tick"><text text-anchor="middle" x="0" y="390.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(230,0)">Mar 9</text></g><g class="x2tick"><text text-anchor="middle" x="0" y="390.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(370,0)">Mar 16</text></g><g class="x2tick"><text text-anchor="middle" x="0" y="390.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(510,0)">Mar 23</text></g><g class="x2tick"><text text-anchor="middle" x="0" y="390.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(650,0)">Mar 30</text></g></g><g class="yaxislayer-above"><path class="y2tick ticks crisp" d="M59,0h-5" transform="translate(0,362.5)" class="plotly_streamlit-go_subplots-s1"/><path class="y2tick ticks crisp" d="M59,0h-5" transform="translate(0,324.4)" class="plotly_streamlit-go_subplots-s1"/><path class="y2tick ticks crisp" d="M59,0h-5" transform="translate(0,286.3)" class="plotly_streamlit-go_subplots-s1"/><g class="y2tick"><text text-anchor="end" x="51.6" y="4.1" transform="translate(0,362.5)" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">28</text></g><g class="y2tick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,324.4)">30</text></g><g class="y2tick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,286.3)">32</text></g></g><g class="overaxes-above"/></g></g><g class="polarlayer"/><g class="smithlayer"/><g class="ternarylayer"/><g class="geolayer"/><g class="funnelarealayer"/><g class="pielayer"/><g class="iciclelayer"/><g class="treemaplayer"/><g class="sunburstlayer"/><g class="glimages"/><defs><g class="clips"/></defs><g class="layer-above"><g class="imagelayer"/><g class="shapelayer"/></g><g class="infolayer"><g class="g-gtitle"/><g class="g-xtitle"/><g class="g-x2title"/><g class="g-ytitle"/><g class="g-y2title"/><g class="annotation" data-index="0" style="opacity: 1;"><g class="annotation-text-g" transform="rotate(0,370,49)"><g class="cursor-pointer" transform="translate(315,38)"><rect class="bg" x="0.5" y="0.5" width="110" height="21" style="stroke-width: 1px; stroke: currentColor; stroke-opacity: 0; fill: currentColor; fill-opacity: 0;"/><text class="annotation-text" text-anchor="middle" x="55.3" y="16" style="font-family: sans-serif; font-size: 16px; fill: currentColor; fill-opacity: 1; white-space: pre;">Orders per day</text></g></g></g><g class="annotation" data-index="1" style="opacity: 1;"><g class="annotation-text-g" transform="rotate(0,370,242.7)"><g class="cursor-pointer" transform="translate(279,232)"><rect class="bg" x="0.5" y="0.5" width="182" height="21" style="stroke-width: 1px; stroke: currentColor; stroke-opacity: 0; fill: currentColor; fill-opacity: 0;"/><text class="annotation-text" text-anchor="middle" x="91.6" y="16" style="font-family: sans-serif; font-size: 16px; fill: currentColor; fill-opacity: 1; white-space: pre;">Average delivery minutes</text></g></g></g></g></svg><figcaption>Two panels sharing one x-axis: each series keeps its own y scale, and in the interactive version zooming either panel zooms both.</figcaption></figure>
  <p>The first trace uses the axis pair x/y and the second x2/y2, and the top x-axis has <code>matches="x2"</code>, which is what "shared" means in Plotly: zoom into one week on either panel and the other follows. The last lines show the everyday workflow. Because px returns a <code>go.Figure</code>, you can start with px and then use go to add what px cannot, here a flat 30-minute target line added with <code>add_trace</code>. A good rule of thumb: use px for most charts, and use go for mixed trace types, custom subplot layouts, or fine control over details px does not expose.</p>

  <h2 id="ds-export"><span class="num">04</span>Exporting Plotly Figures</h2>
  <p>A figure is only useful once it reaches someone, and Plotly can write the same figure out in several forms, each for a different purpose. An HTML file keeps it interactive. A PNG or SVG makes a static picture for a report or slide. And the figure's JSON lets another program, such as a web app or a test, rebuild the exact figure later. The static formats need an extra package, <strong>Kaleido</strong>, which drives a headless copy of the Chrome browser to draw the chart exactly as plotly.js would and then saves the result; Kaleido version 1 uses a Chrome installed on the machine (or one fetched with <code>plotly_get_chrome</code>). Here is one faceted histogram written in every format:</p>
  <div class="fx" data-lang="py">import os
fig = px.histogram(orders, x="delivery_minutes", facet_col="city", nbins=20)

fig.write_html("cdn.html", include_plotlyjs="cdn")     # page downloads plotly.js when opened
fig.write_html("full.html")                            # plotly.js copied into the file
fig.write_image("hist.png", width=900, height=300, scale=2)   # static image, via Kaleido + Chrome
fig.write_image("hist.svg", width=900, height=300)
fig.write_json("hist.json")                            # the figure itself, as data
for f in ["cdn.html", "full.html", "hist.png", "hist.svg", "hist.json"]:
    print(f"{f:10s} {os.path.getsize(f) / 1024:8.0f} KB")

for n in (1_000, 100_000):                             # the data travels inside the page
    big = pd.DataFrame(make_orders(n))
    px.scatter(big, x="amount", y="delivery_minutes").write_html("scale.html", include_plotlyjs="cdn")
    print(f"{n:&gt;7,} points -&gt; {os.path.getsize('scale.html') / 1024 / 1024:.2f} MB of HTML")</div>
  <div class="fx" data-lang="text">cdn.html         12 KB
full.html      4715 KB
hist.png         47 KB
hist.svg         22 KB
hist.json        11 KB
  1,000 points -&gt; 0.02 MB of HTML
100,000 points -&gt; 1.16 MB of HTML</div>
  <p>The two HTML files show the main trade-off. With <code>include_plotlyjs="cdn"</code> the file is only about 12 KB, because it contains a link that downloads plotly.js from a public server (a <strong>CDN</strong>, content delivery network) when it is opened; the reader needs an internet connection. The default embeds the whole 4.7 MB library, so the file works offline, for example as an email attachment. The PNG was drawn at twice the requested size (<code>scale=2</code>) so it stays sharp on high-resolution screens, and the SVG is a vector drawing that stays sharp at any size. The JSON file is the figure's data and layout and nothing else.</p>
  <p>The last two lines show a limit that matters for the rest of this page. An interactive HTML chart carries every point it shows, so 1,000 points make a 0.02 MB page but 100,000 points make a 1.16 MB page, and a year of a real company's orders would not fit in a browser tab at all. Interactive files are great for exploring a summary, but a real dashboard needs to keep the data somewhere else and send only what the user asks for. That needs a program running behind the page, which is what Streamlit provides.</p>

  <h2 id="ds-app"><span class="num">05</span>From Script to App</h2>
  <p>An exported chart can only show the data baked into it. It cannot run a new query when the manager picks a different date range, it cannot read a CSV she uploads, and it cannot ask a model for a prediction, because all of those need Python code to run in response to her actions. A program that waits for a user's input and responds with a new page is a <strong>web app</strong>, and a web app whose main job is showing data the user can filter is a <strong>dashboard</strong>. Building one normally means HTML, JavaScript, a server, and code that says "when this dropdown changes, call this function, then update that part of the page", which is days of work across several languages.</p>
  <p><strong>Streamlit</strong> removes almost all of that. It is an open-source Python framework in which you write a plain script, and Streamlit turns it into a web page with live controls. Calls such as <code>st.selectbox</code> draw an input and return what the user chose; calls such as <code>st.write</code>, <code>st.metric</code> and <code>st.plotly_chart</code> draw output. Here is a complete app:</p>
  <div class="fx" data-lang="py"># hello_app.py: a complete web app
import streamlit as st

st.title("Delivery dashboard")
city = st.selectbox("City", ["Pune", "Delhi", "Mumbai"])
st.write(f"You picked {city}.")</div>
  <p>In real use you start it from a terminal with <code>streamlit run hello_app.py</code>, which starts a small web server, usually at <code>http://localhost:8501</code>, and opens it in the browser. To show real results on this page without starting a server, every app is run with <strong>AppTest</strong>, Streamlit's testing tool in <code>streamlit.testing.v1</code>. AppTest runs the script exactly as the server would, lets Python code operate the widgets, and reads back what the page displays:</p>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest

at = AppTest.from_file("hello_app.py").run()          # first page load
print(at.title[0].value, "|", at.markdown[0].value)
at.selectbox[0].select("Delhi").run()                 # the user picks Delhi
print(at.title[0].value, "|", at.markdown[0].value)</div>
  <div class="fx" data-lang="text">Delivery dashboard | You picked Pune.
Delivery dashboard | You picked Delhi.</div>
  <p>On the first run the selectbox showed its first option, so the page said "You picked Pune". When the test picked Delhi and ran the app again, the text changed to "You picked Delhi". Notice what we did <em>not</em> write: nowhere does the app say "when the selectbox changes, update the text". If a chart file is a printed menu, a Streamlit app is the restaurant itself: you place an order, the kitchen (your Python code) cooks it, and the waiter brings exactly what you asked for. How the kitchen knows when to cook is the one idea everything else in Streamlit depends on.</p>

  <h2 id="ds-exec"><span class="num">06</span>The Rerun Model</h2>
  <p>Streamlit has one rule: <strong>every time the user changes anything, Streamlit runs your whole script again, from the first line to the last, and redraws the page from what that run produced</strong>. A widget call such as <code>st.slider(...)</code> draws the slider and returns its <em>current</em> value, so on each run the variable holds whatever the user last chose. There are no event handlers to connect, because the script itself is the description of the page.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="ds-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="110" height="44" class="ft st"/><text x="22" y="60">user moves</text><text x="22" y="76">a slider</text>
    <path d="M120 62 L170 62" stroke="currentColor" marker-end="url(#ds-ar)"/>
    <rect x="172" y="14" width="200" height="100" class="fb sb"/><text x="184" y="34">app.py runs again,</text><text x="184" y="52">line 1 → last line</text>
    <text x="184" y="76" class="tm">variables recreated</text><text x="184" y="94" class="tm">cached functions skipped</text>
    <path d="M372 62 L422 62" stroke="currentColor" marker-end="url(#ds-ar)"/>
    <rect x="424" y="40" width="160" height="44" class="fg sg"/><text x="436" y="60">browser shows</text><text x="436" y="76">the new page</text>
    <path d="M504 84 L504 134 L65 134 L65 86" stroke="currentColor" fill="none" marker-end="url(#ds-ar)"/><text x="200" y="128" class="tm">every interaction repeats the loop</text>
  </svg><figcaption>The rerun loop. An interaction triggers a complete run of the script; the run's output becomes the new page; the next interaction starts the loop again.</figcaption></figure>
  <p>A spreadsheet works the same way. When you change one cell, every formula recalculates, and you never write "when B2 changes, update C7". That is simple and always consistent, until one cell holds a calculation that takes ten seconds, at which point every edit makes you wait ten seconds. Keep that picture in mind, because both the strength and the costs of Streamlit come from it.</p>
  <p>We can watch the rule in action. The app below totals the first n of our eight orders, chosen with a slider, and appends a note to a log each time one of its lines runs. The log lives in a separate module, <code>calls.py</code>, because Streamlit reruns only the main script, not the modules it imports, so the list survives between runs:</p>
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
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest
import calls

at = AppTest.from_file("trace_app.py").run()
print("page:", at.markdown[0].value, "| lines run:", calls.log)
for v in (5, 8):
    calls.log.clear()
    at.slider[0].set_value(v).run()
    print("page:", at.markdown[0].value, "| lines run:", calls.log)</div>
  <div class="fx" data-lang="text">page: First 3 orders: ₹1280 | lines run: ['start', 'slider returned 3', 'wrote ₹1280']
page: First 5 orders: ₹1810 | lines run: ['start', 'slider returned 5', 'wrote ₹1810']
page: First 8 orders: ₹3100 | lines run: ['start', 'slider returned 8', 'wrote ₹3100']</div>
  <p>On every interaction the full sequence ran again: "start", then the slider returned its value, then the total was written. With the default of 3 the total is 450 + 220 + 610 = 1,280; moving the slider to 5 adds 380 and 150 to give 1,810; moving it to 8 gives the full 3,100. These are the same running totals we computed with <code>cumsum</code> in earlier notes, and none of them was stored anywhere: each run recomputed <code>total</code> from scratch.</p>
  <p>For <code>total</code> that is exactly right, since it should always reflect the current slider. But it has two consequences that the next three sections deal with. First, every variable is recreated on every run, so anything the app needs to <em>remember</em> between interactions, such as a click count or a history of predictions, is lost unless stored somewhere special (section 08). Second, every line runs on every interaction, so anything <em>slow</em>, such as loading a big CSV or a trained model, is repeated on every click unless it is cached (section 09). Before either of those, we need more ways for the user to give input.</p>

  <h2 id="ds-widgets"><span class="num">07</span>Widgets and Forms</h2>
  <p>A <strong>widget</strong> is an input element: a dropdown, a slider, a text box, a button. In Streamlit each widget is a single function call that draws the widget and returns its current value, so you use the result like any other variable. The ones you will use most are these:</p>
  <table class="tbl">
    <tr><th>Widget</th><th>Returns</th></tr>
    <tr><td><code>st.selectbox("City", ["Pune", "Delhi", "Mumbai"])</code></td><td>the chosen item</td></tr>
    <tr><td><code>st.slider("Orders", 1, 8, 3)</code></td><td>a number (min, max, default)</td></tr>
    <tr><td><code>st.number_input("Amount", 50, 5000, 400, step=50)</code></td><td>a number typed or stepped</td></tr>
    <tr><td><code>st.radio</code>, <code>st.multiselect</code>, <code>st.select_slider</code></td><td>an item, a list, an item</td></tr>
    <tr><td><code>st.text_input</code>, <code>st.date_input</code>, <code>st.checkbox</code></td><td>text, a date, True/False</td></tr>
    <tr><td><code>st.file_uploader("CSV", type="csv")</code></td><td>a file-like object, or None before upload</td></tr>
    <tr><td><code>st.button("Go")</code></td><td>True only on the rerun right after the click</td></tr>
  </table>
  <p>The rerun rule creates a problem when an action needs several inputs. Suppose a delivery-time estimate needs a city and an order amount. Every change to either input reruns the script, so choosing the city triggers an estimate with the old amount, and typing a new amount triggers another. For a quick calculation that is harmless; for a slow model or a database query it wastes work and shows half-finished results. A <strong>form</strong> solves it: widgets placed inside <code>with st.form(...)</code> do not trigger a rerun when they change, and the script reruns only when the form's submit button is pressed, receiving all the new values at once. It is like a paper order slip: you fill in every box and then hand it over once, instead of the kitchen starting to cook each time you write a letter.</p>
  <p>The estimate below uses the same rule the data generator used, 15 minutes plus amount / 40 plus a city traffic delay, so we can check it by hand:</p>
  <div class="fx" data-lang="py"># form_app.py
import streamlit as st

with st.form("estimate"):                         # widgets inside don't trigger reruns...
    city = st.selectbox("City", ["Pune", "Delhi", "Mumbai"])
    amount = st.number_input("Order amount (₹)", 50, 5000, 400, step=50)
    submitted = st.form_submit_button("Estimate")   # ...until this button is pressed

if submitted:
    extra = {"Pune": 0, "Delhi": 5, "Mumbai": 3}[city]
    st.write(f"{city}, ₹{amount}: about {15 + amount / 40 + extra:.0f} min")
else:
    st.write("Fill in the form and press Estimate.")</div>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest

at = AppTest.from_file("form_app.py").run()
print("first load    -&gt;", at.markdown[0].value)
at.selectbox[0].select("Delhi")                   # change inputs inside the form (no .run() yet)
at.number_input[0].set_value(800)
at.button[0].click().run()                        # press Estimate: one rerun with both values
print("after submit  -&gt;", at.markdown[0].value)
at.run()                                          # any later rerun without pressing the button
print("next rerun    -&gt;", at.markdown[0].value)</div>
  <div class="fx" data-lang="text">first load    -&gt; Fill in the form and press Estimate.
after submit  -&gt; Delhi, ₹800: about 40 min
next rerun    -&gt; Fill in the form and press Estimate.</div>
  <p>On the first load the button had not been pressed, so <code>submitted</code> was False and the page showed the instruction. The test then changed both inputs without running the app (a form holds the changes back), and pressed Estimate, which caused one rerun carrying both values: Delhi and ₹800 give 15 + 800 / 40 + 5 = 40 minutes. On the very next rerun, though, the estimate vanished. A submit button, like <code>st.button</code>, is True only during the single run its click caused; on any later run it is False again, and every variable, including the estimate, is recreated. To keep a result on screen after the moment of the click, the app has to remember it, which is the subject of the next section.</p>

  <h2 id="ds-state"><span class="num">08</span>Session State</h2>
  <p>Imagine the support team wants a button that counts late-order complaints. Each click should add one. With the rerun rule, an ordinary variable cannot do this, and it is worth seeing exactly why. The app below keeps the count in two places: a plain variable, and <strong><code>st.session_state</code></strong>, a dictionary-like store that Streamlit keeps for each user's browser session and that survives reruns. It also prints what the button returned on each run.</p>
  <div class="fx" data-lang="py"># counter_app.py
import streamlit as st

count = 0                                   # plain variable: recreated on every rerun
if "flagged" not in st.session_state:
    st.session_state.flagged = 0            # set once, on this user's first run

clicked = st.button("Flag a late order")    # True only on the rerun caused by the click
if clicked:
    count += 1
    st.session_state.flagged += 1
st.write(f"button: {clicked} | plain variable: {count} | session_state: {st.session_state.flagged}")</div>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest

at = AppTest.from_file("counter_app.py").run()
print("first load    -&gt;", at.markdown[0].value)
for i in range(1, 4):
    at.button[0].click().run()
    print(f"after click {i} -&gt;", at.markdown[0].value)
at.run()                                    # a rerun caused by something else
print("no click      -&gt;", at.markdown[0].value)</div>
  <div class="fx" data-lang="text">first load    -&gt; button: False | plain variable: 0 | session_state: 0
after click 1 -&gt; button: True | plain variable: 1 | session_state: 1
after click 2 -&gt; button: True | plain variable: 1 | session_state: 2
after click 3 -&gt; button: True | plain variable: 1 | session_state: 3
no click      -&gt; button: False | plain variable: 0 | session_state: 3</div>
  <p>Read it run by run. Every click reruns the script, so <code>count = 0</code> runs again before <code>count += 1</code>, and the plain variable is stuck at 1. The session-state value is set to 0 only when the key <code>"flagged"</code> does not exist yet, which is true on the very first run only, so after that each click increases it: 1, 2, 3. On the last run nobody clicked, so the button returned False, the plain variable fell back to 0, and session state still held 3.</p>
  <p>Think of a whiteboard that is wiped clean every time someone walks into the room (a rerun), with a personal locker beside it. Whatever is written on the board is lost; whatever is put in the locker stays, and each visitor has their own locker. A <strong>session</strong> is one browser tab's connection to the app, and each session has its own <code>st.session_state</code>: two managers using the app see two separate counts, and the state disappears when the tab is closed or the server restarts. It is per-user memory, not a shared database.</p>
  <p>Two features connect widgets to session state. Giving a widget a <code>key=</code> stores its value in <code>st.session_state</code> under that name, so other code can read or set it. And a <strong>callback</strong>, a function passed as <code>on_click=</code> or <code>on_change=</code>, runs before the next rerun, which makes it the right place to change state in response to a click:</p>
  <div class="fx" data-lang="py"># keys_app.py: widget keys and a callback
import streamlit as st

def reset():                                    # a callback runs BEFORE the next rerun
    st.session_state.min_amount = 100

st.slider("Minimum order (₹)", 100, 1000, step=50, key="min_amount")   # value stored under this key
st.button("Reset filter", on_click=reset)
st.write(f"filter value in session_state: {st.session_state.min_amount}")</div>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest

at = AppTest.from_file("keys_app.py").run()
at.slider[0].set_value(600).run()
print("after slider -&gt;", at.markdown[0].value, "| slider shows", at.slider[0].value)
at.button[0].click().run()
print("after reset  -&gt;", at.markdown[0].value, "| slider shows", at.slider[0].value)</div>
  <div class="fx" data-lang="text">after slider -&gt; filter value in session_state: 600 | slider shows 600
after reset  -&gt; filter value in session_state: 100 | slider shows 100</div>
  <p>Moving the slider to 600 stored 600 under <code>"min_amount"</code>. Clicking "Reset filter" ran <code>reset()</code> first, which set the stored value back to 100, and then the rerun drew the slider with that value, so both the text and the slider show 100. Because the callback ran before the script, the widget never displayed a stale value. The same pattern of "write the result into session state, then let the page read it" is how the ML demo in section 10 keeps a history of predictions.</p>

  <h2 id="ds-cache"><span class="num">09</span>Caching</h2>
  <p>The rerun rule has a second cost. A dashboard that queries the orders database at the top of the script (say one second) and loads a trained model (another second) makes the user wait two seconds after every click, because every click reruns those lines. <strong>Caching</strong> fixes this: you decorate the slow function, and Streamlit runs its body once for each distinct set of arguments, stores the result, and hands back the stored result on later calls, across reruns and across users. The <strong>cache key</strong>, the thing Streamlit checks to decide "have I seen this call before?", is the function's code plus the values of its arguments.</p>
  <p>Streamlit has two caches because there are two kinds of slow things. For <strong>data</strong>, such as DataFrames and query results, <code>@st.cache_data</code> stores the result in serialised form and gives every caller its own fresh copy, so one user modifying their DataFrame cannot change anyone else's. For <strong>resources</strong>, such as an ML model or a database connection, <code>@st.cache_resource</code> stores a single object and gives everyone that same object, because copying a large model on every call would be slow and a live connection cannot be copied at all. It is like an office with a master document and a printer: everyone who asks for the document gets a photocopy they can scribble on, but everyone shares the one printer, and if someone changes its settings, everyone gets those settings.</p>
  <p>The app below has one function of each kind. It logs whenever a function body really runs, times each page run, and checks whether two calls return the same object:</p>
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
    time.sleep(1)                                   # pretend: loading a large ML model
    return {"base": 15, "per_rupee": 1 / 40}

city = st.selectbox("City", ["Pune", "Delhi", "Mumbai"])
t0 = time.perf_counter()
df1, df2 = load_orders(city), load_orders(city)
m1, m2 = load_model(), load_model()
st.write(f"{city}: {len(df1)} orders in {time.perf_counter() - t0:.1f}s | "
         f"data same object? {df1 is df2} | model same object? {m1 is m2}")</div>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest
import calls

at = AppTest.from_file("cache_app.py", default_timeout=30).run()
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
  <p>The log proves that only three function bodies ever ran. On run 1 both caches were empty, so <code>load_orders("Pune")</code> and <code>load_model()</code> each ran once (the second call of each in the same run was already served from the cache), taking 1 + 1 = 2 seconds. Run 2 had the same argument, so both were cache hits and the page took about 0.0 seconds. Run 3 asked for Delhi, a new argument and therefore a new cache key, so <code>load_orders</code> ran again (1 second) while the model was still cached. Run 4 went back to Pune, which was still stored. The two identity checks show the difference between the caches: <code>df1 is df2</code> is always False, because <code>cache_data</code> hands out copies, while <code>m1 is m2</code> is always True, because <code>cache_resource</code> shares one object.</p>
  <table class="tbl">
    <tr><th></th><th><code>@st.cache_data</code></th><th><code>@st.cache_resource</code></th></tr>
    <tr><td>Use for</td><td>DataFrames, query results, API responses</td><td>ML models, database connections, API clients</td></tr>
    <tr><td>Returns</td><td>a fresh copy to each caller</td><td>the same object to everyone</td></tr>
    <tr><td>Safe to modify the result?</td><td>yes</td><td>no: a change is seen by every user</td></tr>
    <tr><td>Useful options</td><td colspan="2"><code>ttl="1h"</code> (recompute after a time), <code>max_entries</code>, <code>func.clear()</code>; an argument named with a leading underscore, such as <code>_conn</code>, is not hashed</td></tr>
  </table>
  <p>Two details round this out. Data that changes, such as today's orders, needs a <strong>time to live</strong> (TTL): <code>@st.cache_data(ttl="1h")</code> recomputes the result once it is an hour old, otherwise the app shows the first result forever. And cache arguments must be hashable so Streamlit can build the key; for something unhashable, like a connection object, prefix the parameter name with an underscore and Streamlit leaves it out of the key.</p>

  <h2 id="ds-ml"><span class="num">10</span>Building an ML Demo</h2>
  <p>The most common real request combines everything so far: "the delivery-time model works; let the operations team try it". A good demo has two parts. <strong>train.py</strong> runs once, offline: it fits the model and saves it to disk. <strong>app.py</strong> is the Streamlit app: it loads the saved model once, collects inputs, predicts, and shows the prediction next to real data so users can judge it. Training must never happen inside the app, because the rerun rule would retrain the model on every click. A restaurant cooks its gravy base in the morning and keeps it ready; each order only adds the final tempering. Cooking the base for every plate would make every customer wait an hour.</p>
  <p>train.py makes 5,000 orders with the same generator (a different seed), fits a scikit-learn <strong>Pipeline</strong>, which is one object that first one-hot encodes the text columns and then runs a random forest (see <a class="xref" data-note="ml_pipelines">Pipelines</a> and <a class="xref" data-note="ml_rf">Random Forest</a>), measures it on held-out orders, and saves it with <code>joblib</code>, a library for writing Python objects that contain large NumPy arrays to disk:</p>
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
print(f"rows {len(orders)} | test MAE {mean_absolute_error(y_te, pred):.2f} min | "
      f"baseline MAE {mean_absolute_error(y_te, [y_tr.mean()] * len(y_te)):.2f} min | "
      f"R2 {model.score(X_te, y_te):.3f}")
joblib.dump(model, "model.joblib")</div>
  <div class="fx" data-lang="text">rows 5000 | test MAE 3.32 min | baseline MAE 5.96 min | R2 0.698</div>
  <p>On orders the model never saw, its predictions are off by 3.32 minutes on average (the mean absolute error, MAE), against 5.96 minutes for a baseline that always predicts the average time, and it explains about 70% of the variation (R² 0.698). The rest is the random traffic noise the generator adds, which no input can predict. Saving the whole Pipeline rather than just the forest matters: the app can pass raw text like "Delhi", and the saved encoder turns it into the same columns the model was trained on.</p>
  <p>The app also needs a sensible <strong>layout</strong>, because a dozen elements in one long column mix inputs with results. Streamlit provides containers for this: <code>st.sidebar</code> is a panel on the left, usually for inputs; <code>st.columns([1, 2])</code> splits the page into side-by-side columns with relative widths (the second twice as wide as the first); <code>st.tabs</code> and <code>st.expander</code> hide detail until the user asks for it; and <code>st.metric</code> shows one big number with an optional coloured change ("delta"). Writing <code>with col1:</code> means "everything in this block goes into column 1". Here is the app:</p>
  <div class="fx" data-lang="py"># app.py: the ML demo
import joblib
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Delivery Time Predictor", layout="wide")   # first st call

@st.cache_resource                      # one shared model object for all users
def load_model():
    return joblib.load("model.joblib")

@st.cache_data                          # the table is loaded once; each caller gets a copy
def load_orders():
    return pd.read_csv("orders_demo.csv")

model, orders = load_model(), load_orders()
st.title("How long will this delivery take?")

with st.sidebar.form("inputs"):         # inputs live in the sidebar; rerun only on Predict
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

same = orders[(orders.city == city) &amp; (orders.restaurant == restaurant)]
col1, col2 = st.columns([1, 2])         # second column twice as wide
with col1:
    st.metric("Predicted delivery time", f"{pred:.0f} min",
              delta=f"{pred - same.delivery_minutes.median():+.0f} vs typical", delta_color="inverse")
    st.caption(f"Real median for {restaurant} in {city}: "
               f"{same.delivery_minutes.median():.0f} min ({len(same)} orders)")
with col2:
    fig = px.histogram(same, x="delivery_minutes", nbins=30,
                       title=f"{restaurant}, {city}: where the prediction falls")
    fig.add_vline(x=pred, line_dash="dash", annotation_text="prediction")
    st.plotly_chart(fig, width="stretch")

tab1, tab2 = st.tabs(["Prediction history", "Raw orders"])
with tab1:
    st.dataframe(pd.DataFrame(st.session_state.history))
with tab2:
    st.dataframe(same.head(50))</div>
  <p>Every idea from this page appears in it: <code>st.set_page_config</code> (which must be the first Streamlit call) sets the browser title and a wide layout; the model is cached with <code>cache_resource</code> and the table with <code>cache_data</code>; the inputs sit in a form in the sidebar; the history is kept in session state; the result is shown in columns with a metric; and a Plotly histogram of real deliveries is drawn with a dashed line at the prediction. The test opens the app with its default inputs, then predicts a ₹900 Biryani Bros order in Delhi at 8 pm:</p>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest

at = AppTest.from_file("app.py", default_timeout=60).run()
print("errors:", list(at.exception), "| columns:", len(at.columns), "| tabs:", [t.label for t in at.tabs])
print("metric:", at.metric[0].label, "=", at.metric[0].value, at.metric[0].delta)
print("caption:", at.caption[0].value)

at.sidebar.selectbox[0].select("Delhi")
at.sidebar.selectbox[1].select("Biryani Bros")
at.sidebar.slider[0].set_value(900)
at.sidebar.button[0].click().run()               # press Predict
print("metric:", at.metric[0].value, at.metric[0].delta)
print("caption:", at.caption[0].value)
print("history:", at.session_state.history)</div>
  <div class="fx" data-lang="text">errors: [] | columns: 2 | tabs: ['Prediction history', 'Raw orders']
metric: Predicted delivery time = 30 min -3 vs typical
caption: Real median for Biryani Bros in Pune: 33 min (496 orders)
metric: 46 min +8 vs typical
caption: Real median for Biryani Bros in Delhi: 38 min (448 orders)
history: [{'city': 'Delhi', 'restaurant': 'Biryani Bros', 'amount': 900, 'hour': 20, 'predicted_min': 45.9}]</div>
  <p>The app ran without errors and built two columns and two tabs. With the defaults (Pune, Biryani Bros, ₹400, 20:00) the model predicted 30 minutes, 3 below the real median of 33 for that restaurant and city. After the Delhi order was submitted it predicted 46 minutes (45.9 before rounding), 8 above the real median of 38 for Delhi Biryani Bros orders, which are usually smaller than ₹900. We can check the prediction against the rule the data was generated with: 15 + 900 / 40 + 5 for Delhi + 4 for dinner = 46.5 minutes, so the model learned the real pattern. <code>delta_color="inverse"</code> colours a positive delta red, because for a delivery time, higher is worse. The history now holds one row, and it will keep growing for this user across reruns.</p>
  <p>One design choice deserves a comment. This app predicts on every rerun, even when the form was not submitted, which is fine because a random forest predicts in milliseconds. For a slow model, compute the prediction only inside <code>if submitted:</code> and store it in session state, or cache the prediction function with <code>@st.cache_data</code> so identical inputs are answered from the cache. And a demo is not a monitoring system: if real delivery times drift, the app keeps showing confident, out-of-date predictions (see <a class="xref" data-note="sd_monitoring">Monitoring</a>). Finally, tests like the one above, written with AppTest and run in continuous integration, catch a broken app before anyone opens it: they can set widgets, press buttons and check <code>at.exception</code>, <code>at.metric</code> and <code>at.session_state</code>.</p>

  <h2 id="ds-deploy"><span class="num">11</span>Deployment</h2>
  <p>While it runs on your laptop, the app lives at <code>localhost:8501</code>, an address only your own computer can open. <strong>Deploying</strong> means running it on a server with an address other people can reach. Three things must travel with the code so it behaves the same there: the exact library versions, any files it loads (here <code>model.joblib</code> and the CSV), and its configuration. One thing must never travel with the code: <strong>secrets</strong>, such as API keys and database passwords, which must stay out of the Git repository. Moving house is a fair picture: you pack the furniture, write a list so nothing is forgotten, and hand the keys to the new owner privately rather than taping them to the front door.</p>
  <p>The library versions go in a <code>requirements.txt</code> file, and they should be <strong>pinned</strong> with <code>==</code> to the versions the model was trained and tested with (for example <code>scikit-learn==1.9.1</code>). This matters more for ML apps than for most software, because a model saved by one version of scikit-learn may fail to load, or worse, load and behave slightly differently, under another. Secrets are read through <code>st.secrets</code>: locally from a file <code>.streamlit/secrets.toml</code> that is listed in <code>.gitignore</code>, and on a hosting platform from its secret settings, so the code is the same in both places.</p>
  <p>There are two common ways to host the app. The quickest is <strong>Streamlit Community Cloud</strong>: you push the code and <code>requirements.txt</code> to a GitHub repository, choose "Create app" on the Streamlit website, and it builds and runs the app for you, with secrets entered in the app's settings. It is free and ideal for demos, but memory is limited and a public app is visible to anyone with the link, so it is no place for real customer data. The production route is a <strong>Docker</strong> image: a packaged Linux environment containing Python, the pinned libraries, the code and the model, which runs the same way on any cloud (see <a class="xref" data-note="se_docker">Docker Basics</a>). Its recipe, a Dockerfile, is short. The following one is the standard pattern; it is shown for reference and was not built for this page:</p>
  <div class="fx" data-lang="text">FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8501
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8501/_stcore/health')"
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0", "--server.headless=true"]</div>
  <p>Three lines in it are easy to get wrong. <code>--server.address=0.0.0.0</code> tells Streamlit to accept connections from outside the container; without it, the app listens only inside the container and nobody can reach it. <code>EXPOSE 8501</code>, together with <code>docker run -p 8501:8501</code>, connects the container's port to the host machine. And the <code>HEALTHCHECK</code> calls Streamlit's built-in health address, <code>/_stcore/health</code>, which answers "ok" while the app is alive, so Docker or the cloud platform can restart the container if it stops responding. When the app grows beyond a few users, login, scaling and monitoring become your responsibility, and when other programs rather than people need the predictions, the model belongs behind an API instead (see <a class="xref" data-note="api_fastapi">FastAPI</a> and <a class="xref" data-note="mlops_deploy">MLOps Deployment</a>).</p>

  <h2 id="ds-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The first mistake is a Plotly one that catches people who move from px to go. <code>px.scatter</code> draws markers, but a <code>go.Scatter</code> trace has no mode set, and plotly.js then joins the points with lines (lines with markers when there are fewer than 20 points), in the order the rows happen to be in:</p>
  <div class="fx" data-lang="py">raw = go.Figure(go.Scatter(x=orders8.amount, y=orders8.delivery_minutes))
print("go.Scatter mode:", raw.data[0].mode)
fixed = go.Figure(go.Scatter(x=orders8.amount, y=orders8.delivery_minutes, mode="markers"))
print("with mode='markers':", fixed.data[0].mode)
print("px.scatter sets it for you:", px.scatter(orders8, x="amount", y="delivery_minutes").data[0].mode)
raw.update_layout(title="go.Scatter with no mode: points joined in row order")
raw.write_image("m_mode.svg", width=560, height=280)</div>
  <div class="fx" data-lang="text">go.Scatter mode: None
with mode='markers': markers
px.scatter sets it for you: markers</div>
  <figure class="viz"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 560 280" fill="currentColor" style="width:100%;max-width:700px;height:auto" role="img"><rect x="0" y="0" width="560" height="280" style="fill: currentColor; fill-opacity: 0;"/><defs><g class="clips"><clipPath id="plotly_streamlit-m_mode-0" class="plotclip"><rect width="480" height="170"/></clipPath><clipPath class="axesclip"><rect x="60" y="0" width="480" height="280"/></clipPath><clipPath class="axesclip"><rect x="0" y="60" width="560" height="170"/></clipPath><clipPath class="axesclip"><rect x="60" y="60" width="480" height="170"/></clipPath></g><g class="gradients"/><g class="patterns"/></defs><g class="bglayer"><rect class="bg" x="60" y="60" width="480" height="170" style="fill: currentColor; fill-opacity: 0; stroke-width: 0;"/></g><g class="layer-below"><g class="imagelayer"/><g class="shapelayer"/></g><g class="cartesianlayer"><g class="subplot xy"><g class="layer-subplot"><g class="shapelayer"/><g class="imagelayer"/></g><g class="minor-gridlayer"><g class="x"/><g class="y"/></g><g class="gridlayer"><g class="x"/><g class="y"/></g><g class="zerolinelayer"/><g class="layer-between"><g class="shapelayer"/><g class="imagelayer"/></g><path class="xlines-below"/><path class="ylines-below"/><g class="overlines-below"/><g class="xaxislayer-below"/><g class="yaxislayer-below"/><g class="overaxes-below"/><g class="overplot"><g class="xy" transform="translate(60,60)" clip-path="url(#plotly_streamlit-m_mode-0)"><g class="scatterlayer mlayer"><g class="trace scatter trace5fbd7e" style="stroke-miterlimit: 2; opacity: 1;"><g class="fills"/><g class="errorbars"/><g class="lines"><path class="js-line" d="M251.1,82.3L79.8,120.0L370.3,33.8L199.0,103.8L27.7,157.7L452.2,12.2L139.4,93.0L117.1,141.5" style="vector-effect: none; fill: none; stroke: rgb(31, 119, 180); stroke-opacity: 1; stroke-width: 2px; opacity: 1;"/></g><g class="points"><path class="point" transform="translate(251.1,82.3)" d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point" transform="translate(79.8,120.0)" d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point" transform="translate(370.3,33.8)" d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point" transform="translate(199.0,103.8)" d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point" transform="translate(27.7,157.7)" d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point" transform="translate(452.2,12.2)" d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point" transform="translate(139.4,93.0)" d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/><path class="point" transform="translate(117.1,141.5)" d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z" style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;"/></g><g class="text"/></g></g></g></g><g class="zerolinelayer-above"/><path class="xlines-above crisp" d="M59,230.5H540" style="fill: none; stroke-width: 1px; stroke: currentColor; stroke-opacity: 1;"/><path class="ylines-above crisp" d="M59.5,60V230" style="fill: none; stroke-width: 1px; stroke: currentColor; stroke-opacity: 1;"/><g class="overlines-above"/><g class="xaxislayer-above"><path class="xtick ticks crisp" d="M0,231v5" transform="translate(124.9,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,231v5" transform="translate(199.4,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,231v5" transform="translate(273.9,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,231v5" transform="translate(348.4,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,231v5" transform="translate(422.8,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="xtick ticks crisp" d="M0,231v5" transform="translate(497.3,0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><g class="xtick"><text text-anchor="middle" x="0" y="250.4" transform="translate(124.9,0)" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">200</text></g><g class="xtick"><text text-anchor="middle" x="0" y="250.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(199.4,0)">300</text></g><g class="xtick"><text text-anchor="middle" x="0" y="250.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(273.9,0)">400</text></g><g class="xtick"><text text-anchor="middle" x="0" y="250.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(348.4,0)">500</text></g><g class="xtick"><text text-anchor="middle" x="0" y="250.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(422.8,0)">600</text></g><g class="xtick"><text text-anchor="middle" x="0" y="250.4" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(497.3,0)">700</text></g></g><g class="yaxislayer-above"><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,206.9)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,153.0)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><path class="ytick ticks crisp" d="M59,0h-5" transform="translate(0,99.1)" style="stroke: currentColor; stroke-opacity: 1; stroke-width: 1px;"/><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" transform="translate(0,206.9)" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;">20</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,153.0)">30</text></g><g class="ytick"><text text-anchor="end" x="51.6" y="4.1" style="font-family: sans-serif; font-size: 12px; fill: currentColor; fill-opacity: 1; white-space: pre;" transform="translate(0,99.1)">40</text></g></g><g class="overaxes-above"/></g></g><g class="polarlayer"/><g class="smithlayer"/><g class="ternarylayer"/><g class="geolayer"/><g class="funnelarealayer"/><g class="pielayer"/><g class="iciclelayer"/><g class="treemaplayer"/><g class="sunburstlayer"/><g class="glimages"/><defs><g class="clips"/></defs><g class="layer-above"><g class="imagelayer"/><g class="shapelayer"/></g><g class="infolayer"><g class="g-gtitle"><text class="gtitle" x="28" y="30" text-anchor="start" dy="0em" style="opacity: 1; font-family: sans-serif; font-size: 17px; fill: currentColor; fill-opacity: 1; white-space: pre;">go.Scatter with no mode: points joined in row order</text></g><g class="g-xtitle"/><g class="g-ytitle"/></g></svg><figcaption>The eight orders as a <code>go.Scatter</code> with no mode: a meaningless zigzag through the points in row order.</figcaption></figure>
  <p>The zigzag has no meaning; it only follows the row order. Passing <code>mode="markers"</code> gives a real scatter plot, which px sets for you. A related Plotly trap is the jumpy animation: unless <code>range_x</code> and <code>range_y</code> are fixed, each frame rescales its axes and bars appear to grow or shrink for no reason.</p>
  <p>In Streamlit, the classic first bug is storing state in a plain variable, which the counter app showed: the variable is recreated on every rerun and stuck at 1. The fix is <code>st.session_state</code>, initialised only when the key is missing. A close relative is writing <code>st.session_state.flagged = 0</code> unconditionally at the top of the script, which resets it on every run and recreates the same bug. Another is computing a result under <code>if st.button(...)</code> and expecting it to still be on the page later; the button is True for one run only, so store the result in session state.</p>
  <p>The most dangerous Streamlit mistake is caching data with the wrong cache, because it leaks one user's actions to every other user:</p>
  <div class="fx" data-lang="py"># mutate_app.py: a DataFrame cached with cache_resource
import pandas as pd
import streamlit as st

@st.cache_resource                       # wrong cache for data: one shared object
def load():
    return pd.DataFrame({"city": ["Pune", "Delhi"], "amount": [1210, 1240]})

df = load()
if st.checkbox("Show in thousands"):
    df["amount"] = df["amount"] / 1000   # edits the shared, cached object in place
st.write(f"Pune amount: {df.amount[0]}")</div>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest

user_a = AppTest.from_file("mutate_app.py").run()
user_a.checkbox[0].check().run()
print("user A, after ticking the box:", user_a.markdown[0].value)
user_b = AppTest.from_file("mutate_app.py").run()        # a different user opens the app
print("user B, box not ticked:       ", user_b.markdown[0].value)</div>
  <div class="fx" data-lang="text">user A, after ticking the box: Pune amount: 1.21
user B, box not ticked:        Pune amount: 1.21</div>
  <p>User A ticked the box, and the app divided the cached DataFrame's amounts by 1,000 in place. Because <code>cache_resource</code> returns the same object to everyone, user B, who never touched the checkbox, now also sees 1.21 instead of 1,210, and so will every later user until the server restarts. With <code>@st.cache_data</code>, each call would have returned a fresh copy and user B would have seen 1,210. The opposite swap is merely slow: a model cached with <code>cache_data</code> is copied (serialised and deserialised) on every call.</p>
  <p>The remaining mistakes are about speed and shipping. Loading data or a model at the top of the script without a cache repeats the work on every click (two seconds per click in the caching example). Training a model inside the app retrains it on every interaction; train offline and load the saved file. Putting heavy work inside a tab or expander does not skip it, because the code in every tab runs on every rerun even when the tab is hidden. Exporting a big interactive chart embeds every point (1.16 MB for 100,000 points); aggregate first or serve it from an app. And deploying with unpinned library versions, or with a secrets file committed to Git, causes the two most common production incidents for small Streamlit apps.</p>

  <h2 id="ds-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Interactive chart</b>: ships data + plotly.js to the browser; hover, zoom, pan, toggle happen on the viewer's device.</li>
    <li><b>Trace</b>: one series on a Plotly figure. <b>Figure</b> = data (traces) + layout (titles, axes, legend, shapes).</li>
    <li><b>px</b> (Plotly Express): whole figure in one call from long data. <b>go</b> (graph_objects): build or adjust piece by piece.</li>
    <li><b>Frame</b>: one state of an animated figure. <b>Facet</b>: one small panel per group.</li>
    <li><b>Kaleido</b>: draws static PNG/SVG/PDF exports using headless Chrome.</li>
    <li><b>Rerun</b>: Streamlit executing the whole script again after any interaction. <b>Session</b>: one browser tab's connection.</li>
    <li><b>Widget</b>: input whose call returns its current value. <b>Form</b>: batches widget changes until submit.</li>
    <li><b>session_state</b>: per-session dict that survives reruns. <b>Callback</b>: <code>on_click</code>/<code>on_change</code> function run before the next rerun.</li>
    <li><b>cache_data</b>: copy per caller, for data. <b>cache_resource</b>: one shared object, for models and connections. <b>Key</b> = function code + argument values.</li>
  </ul>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th></th><th>Option A</th><th>Option B</th></tr>
    <tr><td>Plotly vs Matplotlib</td><td>Plotly: exploration, dashboards, web apps</td><td>Matplotlib/Seaborn: static figures for reports, papers, PDFs</td></tr>
    <tr><td>px vs go</td><td>px: one call, common charts, long data</td><td>go: mixed traces, custom subplots, fine control (px returns a go.Figure)</td></tr>
    <tr><td>HTML export</td><td><code>include_plotlyjs="cdn"</code>: ~12 KB, needs internet</td><td>default: ~4.7 MB, works offline</td></tr>
    <tr><td>Static export</td><td><code>write_image("x.png", scale=2)</code></td><td><code>write_image("x.svg")</code> (vector)</td></tr>
    <tr><td>Remember vs skip work</td><td><code>st.session_state</code>: values to keep per user</td><td>caches: slow results to reuse across reruns and users</td></tr>
    <tr><td>cache_data vs cache_resource</td><td>data, copies, safe to mutate</td><td>models/connections, shared, never mutate</td></tr>
    <tr><td>Hosting</td><td>Community Cloud: free, quick demos, public link</td><td>Docker: production, any cloud, you own scaling and login</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import plotly.express as px, plotly.graph_objects as go
from plotly.subplots import make_subplots
fig = px.scatter(df, x="amount", y="delivery_minutes", color="city", hover_data=["order_id"])
fig.add_trace(go.Scatter(x=xs, y=ys, mode="lines", name="target"))
fig.add_hline(y=30, line_dash="dot"); fig.update_layout(title="...")
fig.write_html("chart.html", include_plotlyjs="cdn"); fig.write_image("chart.svg")

import streamlit as st
st.set_page_config(page_title="Demo", layout="wide")       # first st call
@st.cache_data(ttl="1h")
def load(city): ...
@st.cache_resource
def load_model(): ...
with st.sidebar.form("inputs"):
    city = st.selectbox("City", ["Pune", "Delhi", "Mumbai"])
    submitted = st.form_submit_button("Predict")
if "history" not in st.session_state:
    st.session_state.history = []
col1, col2 = st.columns([1, 2])
with col1:
    st.metric("Predicted", "46 min", delta="+8 vs typical", delta_color="inverse")

from streamlit.testing.v1 import AppTest
at = AppTest.from_file("app.py").run(); at.button[0].click().run(); assert not at.exception</div>
  <h3>Numbers from this page</h3>
  <ul>
    <li>PNG = 240 × 640 × 4 colour values; the Plotly page held the 31 daily numbers in ~10 KB.</li>
    <li><code>px.scatter(orders8, color="city")</code> → 3 traces: Pune, Delhi, Mumbai.</li>
    <li>Trace app: slider 3 → ₹1,280, 5 → ₹1,810, 8 → ₹3,100, all lines rerun each time.</li>
    <li>Counter: plain variable 1, 1, 1; session_state 1, 2, 3.</li>
    <li>Caching: 2.0 s → 0.0 s; new argument (Delhi) 1.0 s; only 3 bodies ran.</li>
    <li>ML demo: MAE 3.32 vs baseline 5.96; Delhi, Biryani Bros, ₹900, 8 pm → 46 min.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>go.Scatter</code> without <code>mode="markers"</code> draws lines.</li>
    <li>Fix <code>range_y</code> in animations.</li>
    <li>Plain variables reset every rerun; initialise session state only if the key is missing.</li>
    <li>Buttons are True for one run only.</li>
    <li>DataFrame in <code>cache_resource</code> leaks edits to all users; model in <code>cache_data</code> is slow.</li>
    <li>Code in hidden tabs still runs; never train inside the app.</li>
    <li>Pin versions; never commit <code>secrets.toml</code>; <code>--server.address=0.0.0.0</code> in Docker.</li>
  </ul>

  <h2 id="ds-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Plotly vs Matplotlib: when would you use each?</summary><div class="qa-body">Plotly when people need to explore the chart: hover for exact values, zoom, toggle series, or when the chart lives in a dashboard or web app. Matplotlib and Seaborn for static, publication-quality figures in reports, papers and PDFs, and for fine-grained styling. A Plotly HTML file carries its data and a JavaScript library; a Matplotlib PNG is only pixels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Plotly Express vs graph_objects?</summary><div class="qa-body">Plotly Express builds a complete figure from a tidy DataFrame in one call and is right for most charts. graph_objects builds figures from individual traces and layout settings, which you need for mixed trace types, custom subplot layouts or details px does not expose. px returns a <code>go.Figure</code>, so the usual workflow is to start with px and add go traces or <code>update_layout</code> calls.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a trace in Plotly, and how many does <code>px.scatter(df, color="city")</code> create?</summary><div class="qa-body">A trace is one series drawn on the figure, with its own colour and legend entry. px creates one trace per distinct value of the <code>color</code> column, in order of first appearance, so three cities give three traces. Facets multiply this further: one trace per colour per facet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you export a Plotly figure, and what are the trade-offs?</summary><div class="qa-body"><code>write_html</code> keeps it interactive; with <code>include_plotlyjs="cdn"</code> the file is tiny but needs internet, by default it embeds about 4.7 MB of plotly.js and works offline. <code>write_image</code> produces PNG, SVG or PDF through Kaleido, which needs a Chrome browser; use <code>scale</code> for sharp PNGs and SVG for vector output. <code>to_json</code>/<code>write_json</code> saves the figure as data so it can be rebuilt.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your animated Plotly chart looks jumpy. Why, and how do you fix it?</summary><div class="qa-body">Each frame autoscales its axes, so the scale changes between frames and bars seem to grow or shrink for no reason. Set <code>range_x</code>/<code>range_y</code> to fixed limits covering all frames, and make sure every frame contains every category so bars do not pop in and out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Streamlit's execution model.</summary><div class="qa-body">Every widget interaction reruns the entire script from top to bottom, and the page is redrawn from what that run outputs. Widget calls return their current values, so there are no callbacks to wire for basic apps. The consequences: variables are recreated on every run (use session state to remember things), slow work repeats (use caching), and buttons are True only on the run their click caused.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A counter in a normal variable never goes above 1. Why, and how do you fix it?</summary><div class="qa-body">The rerun sets the variable back to 0 before each click adds 1. Store it in <code>st.session_state</code>, initialised only when the key is missing (<code>if "count" not in st.session_state: st.session_state.count = 0</code>), and increment that.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>st.session_state</code>, and is it shared between users?</summary><div class="qa-body">It is a dictionary-like store kept for each browser session that survives reruns, used for counters, histories, login state and widget values (via <code>key=</code>). It is not shared: every session has its own, and it is lost when the tab closes or the server restarts. Shared or permanent data belongs in a database.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>st.form</code>?</summary><div class="qa-body">Widgets inside a form do not trigger reruns when they change; the script reruns only when the form's submit button is pressed, with all values together. That stops a slow step such as a prediction or a query from running on every half-finished input, and gives one clear "the user meant it" moment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>st.cache_data</code> vs <code>st.cache_resource</code>?</summary><div class="qa-body"><code>cache_data</code> serialises the return value and gives each caller a fresh copy, which is safe for DataFrames and query results. <code>cache_resource</code> returns one shared object to every session, which is right for ML models, database connections and clients that are expensive or impossible to copy; that object must not be mutated and should be thread-safe. Both key the cache on the function's code and argument values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you cache a DataFrame with <code>cache_resource</code> and modify it?</summary><div class="qa-body">Every user gets the same object, so an in-place change made for one user is seen by all users until the cache is cleared or the server restarts. On this page, one user converting amounts to thousands made another user see 1.21 instead of 1,210. Use <code>cache_data</code> for data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your app reloads a 500 MB model on every slider move. How do you fix it?</summary><div class="qa-body">Train offline and save the model (for example with <code>joblib.dump</code>), then load it in a function decorated with <code>@st.cache_resource</code> so it is loaded once per server process. Put the inputs in an <code>st.form</code> so the prediction runs only on submit, and cache predictions with <code>cache_data</code> if they are slow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you keep cached data fresh?</summary><div class="qa-body">Set a time to live, such as <code>@st.cache_data(ttl="1h")</code>, so results are recomputed after they expire; limit memory with <code>max_entries</code>; and call <code>load.clear()</code> (or <code>st.cache_data.clear()</code>) when you know the data changed, for example after an upload.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a Streamlit app?</summary><div class="qa-body">With <code>streamlit.testing.v1.AppTest</code>: load the script with <code>AppTest.from_file</code>, call <code>run()</code>, set widget values and click buttons, then assert on elements such as <code>at.metric</code>, <code>at.markdown</code>, <code>at.exception</code> and <code>at.session_state</code>. It runs without a browser or server, so it fits in CI; a smoke test against <code>/_stcore/health</code> checks the deployed container.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you structure an ML demo app?</summary><div class="qa-body">Train offline in a separate script and save the whole pipeline, including preprocessing. In the app, load the model with <code>cache_resource</code> and reference data with <code>cache_data</code>, collect inputs in a form (often in the sidebar), predict on submit, and show the prediction with context such as the real distribution for similar cases. Keep a history in session state and cover the app with AppTest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why save the whole scikit-learn Pipeline rather than just the model?</summary><div class="qa-body">The app receives raw inputs such as "Delhi". The model only understands the encoded columns created during training, in the same order. Saving the Pipeline saves the fitted encoder with the model, so serving applies exactly the training preprocessing and avoids train/serve skew.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle secrets in a deployed Streamlit app?</summary><div class="qa-body">Read them through <code>st.secrets</code>: locally from <code>.streamlit/secrets.toml</code>, which is git-ignored, and in production from the platform's secret settings or environment variables and a secret manager. Never hard-code them or commit them to the repository.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you deploy a Streamlit app with Docker? What usually goes wrong?</summary><div class="qa-body">A slim Python image, pinned <code>requirements.txt</code>, the code and model copied in, port 8501 exposed, and <code>streamlit run app.py --server.address=0.0.0.0 --server.headless=true</code> as the command, with a health check on <code>/_stcore/health</code>. Common problems: forgetting <code>0.0.0.0</code> so the app is unreachable from outside the container, unpinned versions that break the pickled model, and secrets baked into the image.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is Streamlit the wrong tool?</summary><div class="qa-body">For public products with many concurrent users, custom design and complex interactions, the rerun-everything model and limited layout control become a burden; a frontend framework such as React with an API backend fits better, and Dash suits callback-based Plotly apps. When other programs, not people, need predictions, the model should sit behind an API such as FastAPI.</div></details>
</main>
`
});
