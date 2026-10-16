// notes/dataanalysis/da_plotly_streamlit.js — Plotly & Streamlit
Object.assign(TOPIC_CONTENT, {
  "da_plotly_streamlit": `<main>
  <h1>Plotly &amp; Streamlit</h1>
  <p class="lead">Plotly makes charts people can hover, zoom and filter. Streamlit turns a Python script into a web app in minutes. Together they are how a data scientist ships a dashboard or an ML demo without a frontend team. Data: the same <code>orders</code> + <code>customers</code> tables.</p>

  <h2 id="ds-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Plotly &amp; Streamlit</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Plotly</div>
        <ul>
          <li><b>px</b> — one call on long data: <code>px.line(df, x, y, color=)</code></li>
          <li><b>go</b> — <code>go.Figure().add_trace(go.Bar(...))</code>, full control</li>
          <li><b>px returns go.Figure</b> — tweak with <code>update_layout</code>, <code>add_hline</code></li>
          <li><b>Subplots</b> — <code>make_subplots(rows, cols, shared_xaxes=True)</code></li>
          <li><b>Share</b> — <code>write_html(include_plotlyjs="cdn")</code>: 10.9 KB vs 4.8 MB</li>
          <li>⚠ <b>px wants long data</b> — <code>melt</code> wide tables first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interactive</div>
        <ul>
          <li><b>hover_data</b> — extra columns in tooltip</li>
          <li><b>facet_col</b>, <b>marginal="box"</b>, <b>treemap(path=)</b></li>
          <li><b>animation_frame="month"</b> — play button + slider</li>
          <li>⚠ <b>Fix range_x/range_y</b> on animations</li>
          <li><b>Maps</b> — <code>scatter_map</code> (bubbles, lat/lon), <code>choropleth</code> (regions + GeoJSON)</li>
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
          <li><b>st.button</b> — True for one rerun only</li>
          <li><b>session_state</b> — per-user dict across reruns; init if key missing</li>
          <li><b>st.form</b> — batch inputs, rerun only on submit</li>
          <li>⚠ <b>Counter in a plain variable</b> — stuck at 1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Caching</div>
        <ul>
          <li><b>cache_data</b> — DataFrames/API results; returns a copy; <code>ttl</code></li>
          <li><b>cache_resource</b> — models, DB connections; one shared object</li>
          <li><b>Key</b> — function code + argument values; <code>.clear()</code></li>
          <li>⚠ <b>Swapped</b> — model in cache_data = slow copies; df in cache_resource = shared mutations</li>
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
      <div class="rm-item rm-done" data-target="ds-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ds-px"><span class="num">01</span>Plotly Express vs graph_objects</h2>
  <div class="cards">
    <div><b>plotly.express (px)</b><p>One call from a tidy DataFrame: <code>px.line(df, x, y, color=)</code>. Facets, hover and legends for free.</p><small>Default for 90% of charts</small></div>
    <div><b>graph_objects (go)</b><p>Build a <code>go.Figure</code> trace by trace. Full control of every attribute.</p><small>Mixed chart types, custom layouts</small></div>
    <div><b>Both</b><p>px returns a <code>go.Figure</code>, so start with px and tweak with <code>update_layout</code>, <code>add_trace</code>.</p><small>The common workflow</small></div>
  </div>
  <div class="fx" data-lang="py">import pandas as pd, plotly.express as px, plotly.graph_objects as go
o = pd.read_csv("orders.csv", parse_dates=["order_date"])
o = o.merge(pd.read_csv("customers.csv"), on="customer_id")
o["month"] = o.order_date.dt.strftime("%Y-%m")
m = o.groupby(["month", "category"], as_index=False).revenue.sum()     # long format

fig = px.line(m, x="month", y="revenue", color="category", markers=True,
              title="Electronics drives every month's revenue")
print(type(fig).__name__, len(fig.data), [t.name for t in fig.data])</div>
  <div class="fx" data-lang="text">Figure 5 ['Beauty', 'Books', 'Electronics', 'Fashion', 'Home']</div>
  <p>One call made five traces (one per <code>color</code> value). Same thing in <code>go</code>:</p>
  <div class="fx" data-lang="py">monthly = m.groupby("month").revenue.sum()
fig3 = go.Figure()
fig3.add_trace(go.Bar(x=monthly.index, y=monthly.values, name="revenue"))
fig3.add_hline(y=monthly.mean(), line_dash="dot", annotation_text="avg")
fig3.update_layout(title="Monthly revenue vs average", template="plotly_white")
fig3.show()                                         # notebook / browser
fig3.write_html("chart.html", include_plotlyjs="cdn")   # 10.9 KB (vs 4.8 MB with JS embedded)</div>
  <div class="callout trap"><span class="label">Trap</span><p>px wants <strong>long</strong> data (one row per point, a column for the series). Wide data needs <code>melt</code> first, or you'll fight it.</p></div>

  <h2 id="ds-inter"><span class="num">02</span>Interactive Charts</h2>
  <table class="tbl">
    <tr><th>Need</th><th>Code</th></tr>
    <tr><td>Rich hover</td><td><code>px.scatter(o, x="unit_price", y="revenue", color="category", log_x=True, log_y=True, hover_data=["order_id", "qty", "city"])</code></td></tr>
    <tr><td>Distribution + marginal</td><td><code>px.histogram(o, x="unit_price", color="segment", marginal="box", log_x=True, barmode="overlay")</code></td></tr>
    <tr><td>Hierarchy</td><td><code>px.treemap(o, path=["category", "status"], values="revenue")</code></td></tr>
    <tr><td>Facets</td><td><code>px.scatter(..., facet_col="segment")</code></td></tr>
    <tr><td>Stacked panels</td><td><code>make_subplots(rows=2, cols=1, shared_xaxes=True)</code> + <code>add_trace(..., row=, col=)</code></td></tr>
  </table>
  <p>Generated hover template for the scatter (Plotly builds it from <code>hover_data</code>):</p>
  <div class="fx" data-lang="text">category=Fashion&lt;br&gt;unit_price=%{x}&lt;br&gt;revenue=%{y}&lt;br&gt;order_id=%{customdata[0]}&lt;br&gt;qty=%{customdata[1]}&lt;br&gt;city=%{customdata[2]}&lt;extra&gt;&lt;/extra&gt;</div>
  <h3>Animation and maps</h3>
  <div class="fx" data-lang="py">cm = o.groupby(["month", "category"], as_index=False).agg(
    orders=("order_id", "count"), revenue=("revenue", "sum"), avg_price=("unit_price", "mean"))
fig4 = px.scatter(cm, x="orders", y="revenue", size="avg_price", color="category",
                  animation_frame="month", range_x=[0, 40], range_y=[0, 7e5])
len(fig4.frames), fig4.frames[0].name          # (12, '2024-01')  play button + slider

geo = pd.DataFrame({"city": ["Mumbai", "Delhi", "Bengaluru", "Pune", "Chennai"],
                    "lat": [19.08, 28.61, 12.97, 18.52, 13.08],
                    "lon": [72.88, 77.21, 77.59, 73.86, 80.27]})
city = o.groupby("city", as_index=False).revenue.sum().merge(geo, on="city")
fig5 = px.scatter_map(city, lat="lat", lon="lon", size="revenue", hover_name="city",
                      zoom=3.5, map_style="carto-positron")   # bubble map, no API token
# Mumbai 2,302,120 is the biggest bubble; Chennai 763,030 the smallest</div>
  <div class="callout trap"><span class="label">Trap</span><p>Fix <code>range_x</code>/<code>range_y</code> on animations, or the axes rescale every frame and motion becomes meaningless. Region maps use <code>px.choropleth</code> with a GeoJSON; <code>scatter_mapbox</code> is the deprecated older name.</p></div>

  <h2 id="ds-exec"><span class="num">03</span>Streamlit's Execution Model</h2>
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
  <div class="callout anlg"><span class="label">Analogy</span><p>A spreadsheet recalculating after every edit. Fast and simple, until one cell is a 10-second model load; that cell needs caching.</p></div>
  <div class="fx" data-lang="text">streamlit run app.py          # dev server on :8501, reruns on file save too</div>

  <h2 id="ds-widgets"><span class="num">04</span>Widgets, Forms &amp; State</h2>
  <table class="tbl">
    <tr><th>Widget</th><th>Returns</th></tr>
    <tr><td><code>st.selectbox("Category", options)</code></td><td>chosen item</td></tr>
    <tr><td><code>st.slider("Quantity", 1, 4, 2)</code></td><td>int (min, max, default)</td></tr>
    <tr><td><code>st.radio</code>, <code>st.multiselect</code>, <code>st.select_slider</code></td><td>item / list / item</td></tr>
    <tr><td><code>st.text_input</code>, <code>st.number_input</code>, <code>st.date_input</code></td><td>value</td></tr>
    <tr><td><code>st.file_uploader("CSV", type="csv")</code></td><td>file-like or None</td></tr>
    <tr><td><code>st.button("Go")</code></td><td>True only on the rerun right after the click</td></tr>
  </table>
  <div class="fx" data-lang="py">import streamlit as st
count = 0                                   # plain variable: reset on every rerun
if "clicks" not in st.session_state:
    st.session_state.clicks = 0             # initialised once per browser session
if st.button("+1"):
    count += 1
    st.session_state.clicks += 1
st.write(f"plain variable: {count} | session_state: {st.session_state.clicks}")</div>
  <div class="fx" data-lang="text">after click 1 -&gt; plain variable: 1 | session_state: 1
after click 2 -&gt; plain variable: 1 | session_state: 2
after click 3 -&gt; plain variable: 1 | session_state: 3</div>
  <p><code>st.session_state</code> is a per-user dict that survives reruns. Widgets with <code>key="x"</code> also store their value there.</p>
  <div class="fx" data-lang="py">with st.form("inputs"):                     # widgets inside don't trigger reruns...
    qty = st.slider("Quantity", 1, 4, 2)
    seg = st.radio("Segment", ["new", "regular", "vip"])
    submitted = st.form_submit_button("Predict")   # ...until this is pressed</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>st.button</code> is True for one rerun only. Anything that must persist after the click (a result, a "logged in" flag) belongs in <code>session_state</code>.</p></div>

  <h2 id="ds-cache"><span class="num">05</span>Caching</h2>
  <table class="tbl">
    <tr><th></th><th><code>@st.cache_data</code></th><th><code>@st.cache_resource</code></th></tr>
    <tr><td>For</td><td>Data: DataFrames, query results, API responses</td><td>Resources: ML models, DB connections, LLM clients</td></tr>
    <tr><td>Returns</td><td>A fresh <strong>copy</strong> each call (pickled)</td><td>The <strong>same object</strong> to every user</td></tr>
    <tr><td>Mutation safe?</td><td>Yes, callers can't corrupt the cache</td><td>No, a change is seen by everyone</td></tr>
    <tr><td>Key</td><td colspan="2">Function code + argument values. Options: <code>ttl="1h"</code>, <code>max_entries</code>, <code>.clear()</code></td></tr>
  </table>
  <div class="fx" data-lang="py">@st.cache_resource
def load_model():
    return joblib.load("model.joblib")        # loaded once per server process

@st.cache_data(ttl="1h")
def load_orders(path):
    return pd.read_csv(path)                  # re-read at most hourly</div>
  <div class="callout trap"><span class="label">Trap</span><p>Cache a model with <code>cache_data</code> and every rerun unpickles a copy (slow, memory-hungry). Cache a DataFrame with <code>cache_resource</code> and one user's in-place edit leaks to all users.</p></div>

  <h2 id="ds-layout"><span class="num">06</span>Layout</h2>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <rect x="10" y="10" width="580" height="132" class="fs" stroke="currentColor"/>
    <rect x="20" y="20" width="130" height="112" class="ft st"/><text x="30" y="40">st.sidebar</text><text x="30" y="60" class="tm">inputs, filters</text>
    <text x="165" y="36">st.title · st.tabs(["Predict", "Data"])</text>
    <rect x="165" y="46" width="140" height="86" class="fb sb"/><text x="175" y="66">col1</text><text x="175" y="86" class="tm">st.metric</text>
    <rect x="315" y="46" width="265" height="86" class="fb sb"/><text x="325" y="66">col2 (twice as wide)</text><text x="325" y="86" class="tm">st.plotly_chart</text>
    <text x="325" y="106" class="tm">st.columns([1, 2])</text>
  </svg><figcaption>Sidebar for inputs, columns for side-by-side output, tabs and expanders to hide detail.</figcaption></figure>
  <div class="fx" data-lang="py">st.set_page_config(page_title="Orders", layout="wide")   # first st call
col1, col2 = st.columns([1, 2])
with col1: st.metric("Revenue", "₹77.1 lakh", delta="+4%")
with col2: st.plotly_chart(fig, width="stretch")
tab1, tab2 = st.tabs(["Predict", "Data"])
with st.expander("Details"): st.dataframe(df)
st.container(), st.empty()          # group elements / placeholder you overwrite later</div>

  <h2 id="ds-app"><span class="num">07</span>Build It: ML Demo App</h2>
  <div class="flow"><span>train.py: fit + joblib.dump</span><span>app.py: cache model</span><span>sidebar form</span><span>predict</span><span>metric + chart</span></div>
  <div class="fx" data-lang="py"># train.py
import pandas as pd, joblib
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

o = pd.read_csv("orders.csv").merge(pd.read_csv("customers.csv"), on="customer_id")
X, y = o[["category", "segment", "qty", "discount_pct"]].fillna({"discount_pct": 0}), o.revenue
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
model = Pipeline([
    ("prep", ColumnTransformer([("cat", OneHotEncoder(handle_unknown="ignore"), ["category", "segment"])],
                               remainder="passthrough")),
    ("rf", RandomForestRegressor(n_estimators=200, min_samples_leaf=5, random_state=42)),
])
model.fit(X_tr, y_tr)
print(f"test R2 = {model.score(X_te, y_te):.3f}")
joblib.dump(model, "model.joblib")</div>
  <div class="fx" data-lang="text">test R2 = 0.743</div>
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
    o = pd.read_csv("orders.csv", parse_dates=["order_date"])
    return o.merge(pd.read_csv("customers.csv"), on="customer_id")

model, orders = load_model(), load_orders()
st.title("Order Value Predictor")

with st.sidebar.form("inputs"):         # form: rerun only when Submit is pressed
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
  <p>Tested headlessly with Streamlit's <code>AppTest</code> (first run, then Electronics × 3 + Predict):</p>
  <div class="fx" data-lang="py">from streamlit.testing.v1 import AppTest
at = AppTest.from_file("app.py", default_timeout=60).run()
at.sidebar.selectbox[0].select("Electronics"); at.sidebar.slider[0].set_value(3)
at.sidebar.button[0].click(); at.run()</div>
  <div class="fx" data-lang="text">exceptions: []
metric: Predicted order value = ₹1,436
caption: Actual median for Beauty × 2: ₹1,260 (47 orders)
metric: ₹31,072 | history rows: 1
caption: Actual median for Electronics × 3: ₹27,690 (57 orders)</div>
  <p>The prediction sits next to the real median, so users can sanity-check the model. <code>streamlit run app.py --server.headless true</code> also served it and <code>/_stcore/health</code> returned <code>ok</code>.</p>

  <h2 id="ds-deploy"><span class="num">08</span>Deploying</h2>
  <div class="cards">
    <div><b>Community Cloud</b><p>Push to a public GitHub repo with <code>requirements.txt</code>, then "New app" at share.streamlit.io. Secrets go in the app settings and appear as <code>st.secrets</code>.</p><small>Free, demos, ~1 GB RAM (not run here)</small></div>
    <div><b>Docker</b><p>Same image runs on Cloud Run, ECS, Azure, Kubernetes. You own scaling and auth.</p><small>Production / internal tools</small></div>
    <div><b>Others</b><p>Hugging Face Spaces (Streamlit SDK), Snowflake (Streamlit in Snowflake).</p><small>ML demos / data near the warehouse</small></div>
  </div>
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
pandas==3.0.5
plotly==7.1.0
scikit-learn==1.9.1
joblib==1.6.0

docker build -t order-demo . &amp;&amp; docker run -p 8501:8501 order-demo
curl localhost:8501/_stcore/health          # ok</div>
  <div class="callout trap"><span class="label">Trap</span><p>A model pickled with scikit-learn 1.9 may fail to load under 1.7. Pin the training versions in <code>requirements.txt</code>. Never commit <code>.streamlit/secrets.toml</code>.</p></div>

  <h2 id="ds-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose graph_objects over Plotly Express?</summary><div class="qa-body">When combining different trace types in custom ways (bars + lines + shapes), building subplots with mixed types, or controlling details px doesn't expose. Often you start with px and add go traces to the returned figure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Plotly vs Matplotlib: when each?</summary><div class="qa-body">Plotly for interactive exploration, dashboards and web apps (hover, zoom). Matplotlib/Seaborn for static, publication-quality figures, papers and PDFs, and fine-grained styling. Plotly HTML is heavier; Matplotlib PNGs are tiny.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Streamlit's execution model and its main consequence.</summary><div class="qa-body">Every widget interaction reruns the script from top to bottom. Consequence: expensive work (loading data, models) must be cached, and anything that must persist between interactions goes in <code>st.session_state</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>st.cache_data</code> vs <code>st.cache_resource</code>?</summary><div class="qa-body"><code>cache_data</code> serialises the return value and hands each caller a copy: right for DataFrames and API results. <code>cache_resource</code> returns the same object to all sessions: right for models and DB connections, which can't or shouldn't be copied. Must be thread-safe.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A counter stored in a normal variable never goes above 1. Why, and fix?</summary><div class="qa-body">The rerun resets the variable to 0 before each click adds 1. Store it in <code>st.session_state</code>, initialised only if the key is missing (see the real output: plain stays 1, session_state counts 1, 2, 3).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your app retrains or reloads a 500 MB model on every slider move. Fix?</summary><div class="qa-body">Train offline and save it (<code>joblib.dump</code>); load in a function decorated with <code>@st.cache_resource</code>. Wrap inputs in <code>st.form</code> so predictions run only on Submit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>st.form</code>?</summary><div class="qa-body">Widgets inside a form don't trigger reruns until the submit button is pressed, so the user can set several inputs and the expensive step runs once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test a Streamlit app in CI?</summary><div class="qa-body"><code>streamlit.testing.v1.AppTest</code>: run the script headless, set widget values, click buttons, assert on <code>at.metric</code>, <code>at.exception</code> and <code>session_state</code>. Plus a smoke test hitting <code>/_stcore/health</code> on the running container.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle API keys in a deployed Streamlit app?</summary><div class="qa-body"><code>st.secrets</code>: local <code>.streamlit/secrets.toml</code> (git-ignored), the secrets box on Community Cloud, or environment variables / a secret manager in Docker. Never hard-code them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your animated Plotly chart looks jumpy. Why?</summary><div class="qa-body">Axis ranges autoscale per frame. Set <code>range_x</code>/<code>range_y</code> to the global min/max so only the data moves. Also check every frame has every category, or points pop in and out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Streamlit vs Dash vs a React frontend?</summary><div class="qa-body">Streamlit: fastest to build, script-style, good for demos and internal tools; less layout control and the rerun model limits complex apps. Dash: callback-based Plotly apps, finer control, more code. React + API: full product UI, needs frontend engineers.</div></details>
</main>`
});
