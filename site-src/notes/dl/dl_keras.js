// dl/dl_keras.js — TensorFlow & Keras
Object.assign(TOPIC_CONTENT, {
  "dl_keras": `<main>
  <h1>TensorFlow &amp; Keras</h1>
  <p class="lead">The other big deep-learning stack. You'll meet it in existing production systems, TF Serving / TFLite deployments and many tutorials. This page maps it onto what you know from PyTorch and runs a real model end to end: build, train with callbacks, save, serve.</p>

  <h2 id="tk-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">TensorFlow &amp; Keras</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Where it fits</div>
        <ul>
          <li><b>TensorFlow</b> — engine: tensors, autodiff, graphs, devices, Serving/TFLite/TF.js</li>
          <li><b>Keras 3</b> — high-level API; backends TF, JAX or PyTorch (<code>import keras</code>)</li>
          <li><b>Meet it in</b> — legacy industry models, mobile/edge, TFX/Vertex pipelines</li>
          <li><b>PyTorch instead</b> — research, LLMs, Hugging Face</li>
          <li>⚠ Keras 2 tutorials: <code>tf.keras</code>, .h5, <code>save("dir")</code> — outdated</li>
          <li>💡 Keras = automatic gearbox; PyTorch = manual</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tensors</div>
        <ul>
          <li><b>tf.constant</b> — immutable n-d array; <code>.numpy()</code> converts back</li>
          <li><b>tf.Variable</b> — mutable; holds weights</li>
          <li><b>GradientTape</b> — records ops; <code>tape.gradient(loss, w)</code> ≈ <code>backward()</code></li>
          <li><b>@tf.function</b> — compiles Python to a fast graph</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training workflow</div>
        <ul>
          <li><b>Sequential</b> — plain stack, one in, one out</li>
          <li><b>compile</b> — optimizer, loss, metrics (no training)</li>
          <li><b>fit</b> — epochs, batch_size, validation_split / validation_data, callbacks → History</li>
          <li><b>evaluate</b> / <b>predict</b> — test metrics / outputs</li>
          <li><b>Loss pairing</b> — sigmoid + binary CE; softmax + sparse_ (int) or categorical (one-hot) CE</li>
          <li>⚠ No final activation → <code>from_logits=True</code></li>
          <li><b>Normalization layer</b> — <code>adapt(X_train)</code>; scaling ships inside the model</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Callbacks</div>
        <ul>
          <li><b>EarlyStopping</b> — stop after <code>patience</code> epochs without val improvement</li>
          <li>⚠ Set <code>restore_best_weights=True</code> or you keep the last (overfit) weights</li>
          <li><b>ModelCheckpoint</b> — save best/each epoch; survive crashes</li>
          <li><b>ReduceLROnPlateau</b> — multiply LR by factor on stall</li>
          <li>Demo: 200 asked → stopped 86, restored 76; LR 1e-3 → 1.25e-4</li>
          <li>⚠ <code>validation_split</code> takes the last rows, unshuffled</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Functional API</div>
        <ul>
          <li><b>How</b> — <code>keras.Input</code> → call layers on tensors → <code>keras.Model(inputs, outputs)</code></li>
          <li><b>Use for</b> — multi-input, multi-output, skip connections, shared layers</li>
          <li><b>Example</b> — numeric + store_id Embedding → Concat → Dense → buy</li>
          <li><b>Subclassing</b> — <code>call()</code> for dynamic logic; harder to serialize</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">tf.data</div>
        <ul>
          <li><b>Pipeline</b> — from_tensor_slices / TFRecord → map → shuffle → batch → prefetch(AUTOTUNE)</li>
          <li><b>Why</b> — stream larger-than-RAM data; overlap CPU prep with GPU training</li>
          <li><b>Multi-input</b> — dict keys match Input names</li>
          <li>⚠ Shuffle before batch; don't pass batch_size to fit with a Dataset</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Save &amp; serve</div>
        <ul>
          <li><b>.keras</b> — <code>model.save</code> / <code>load_model</code>; config + weights + optimizer</li>
          <li><b>Weights</b> — <code>save_weights("x.weights.h5")</code></li>
          <li><b>SavedModel</b> — <code>model.export("dir/1")</code>; graph for Serving/TFLite</li>
          <li><b>TF Serving</b> — Docker; REST :8501 <code>/v1/models/NAME:predict</code>, gRPC :8500</li>
          <li><b>Versions</b> — new numbered folder → hot-swap, no restart</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PyTorch ↔ Keras</div>
        <ul>
          <li><b>Linear</b> ↔ <b>Dense</b> (input size inferred); <b>Module.forward</b> ↔ <b>Model.call</b></li>
          <li><b>Manual loop</b> ↔ <b>fit()</b>; <b>backward()</b> ↔ <b>GradientTape</b></li>
          <li><b>DataLoader</b> ↔ <b>tf.data</b>; <b>state_dict</b> ↔ <b>.keras</b></li>
          <li>⚠ NCHW vs NHWC; CrossEntropyLoss takes logits; BN momentum 0.1 ≈ 0.9</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tk-where"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where TF/Keras Fits</span><span class="rm-sub">vs PyTorch, Keras 3</span></div></div>
      <div class="rm-item rm-done" data-target="tk-tensor"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Tensors in 60 Seconds</span><span class="rm-sub">constant, Variable, GradientTape</span></div></div>
      <div class="rm-item rm-done" data-target="tk-seq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Sequential API &amp; the Training Loop</span><span class="rm-sub">compile, fit, evaluate, predict</span></div></div>
      <div class="rm-item rm-done" data-target="tk-cb"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Callbacks</span><span class="rm-sub">Early stop, checkpoint, LR decay</span></div></div>
      <div class="rm-item rm-done" data-target="tk-func"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Functional API</span><span class="rm-sub">Multi-input models</span></div></div>
      <div class="rm-item rm-done" data-target="tk-data"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">tf.data Pipelines</span><span class="rm-sub">Shuffle, batch, prefetch</span></div></div>
      <div class="rm-item rm-done" data-target="tk-save"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Saving &amp; TF Serving</span><span class="rm-sub">.keras, SavedModel, REST</span></div></div>
      <div class="rm-item rm-done" data-target="tk-pt"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">PyTorch ↔ Keras Cheat Sheet</span><span class="rm-sub">Translate in both directions</span></div></div>
      <div class="rm-item rm-done" data-target="tk-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="tk-where"><span class="num">01</span>Where TF/Keras Fits</h2>
  <div class="cards">
    <div><b>TensorFlow</b><p>Google's engine: tensors, autodiff, graph compilation, devices.</p><small>Plus TF Serving, TFLite, TF.js</small></div>
    <div><b>Keras</b><p>The high-level API: layers, models, <code>fit()</code>.</p><small>Keras 3 runs on TF, JAX or PyTorch</small></div>
    <div><b>PyTorch</b><p>Meta's framework; dominant in research and LLMs.</p><small>Hugging Face, most new papers</small></div>
  </div>
  <table class="tbl">
    <tr><th>You'll likely meet TF/Keras when…</th><th>You'll likely meet PyTorch when…</th></tr>
    <tr><td>Maintaining models built 2017–2022 in industry</td><td>Fine-tuning LLMs / transformers</td></tr>
    <tr><td>Deploying to mobile/edge (TFLite) or browser (TF.js)</td><td>Reading or reproducing recent research</td></tr>
    <tr><td>The stack already runs TF Serving, TFX or Vertex AI pipelines</td><td>You need custom training loops quickly</td></tr>
    <tr><td>You want <code>fit()</code> in three lines for a tabular/vision baseline</td><td>Most new open-source model code</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Keras is an automatic car: <code>compile</code> + <code>fit</code> handle the gears. PyTorch is a manual: you write the loop, but you control every shift. Keras still lets you drop to manual (<code>GradientTape</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Keras 2 vs 3</span>
    <p>Old tutorials use <code>tf.keras</code>, <code>.h5</code> files and <code>model.save("dir")</code>. Keras 3 (TF ≥ 2.16) uses <code>import keras</code>, the <code>.keras</code> format, and <code>model.export()</code> for SavedModel.</p>
  </div>

  <h2 id="tk-tensor"><span class="num">02</span>Tensors in 60 Seconds</h2>
  <p>Same idea as NumPy arrays / torch tensors: typed n-d arrays that can live on a GPU and track gradients.</p>
  <div class="fx" data-lang="py">import tensorflow as tf, keras
print(tf.__version__, keras.__version__, keras.backend.backend())
x = tf.constant([[1., 2.], [3., 4.]])            # immutable tensor
print(x.shape, x.dtype)
print((x @ tf.transpose(x)).numpy())             # .numpy() back to NumPy
w = tf.Variable(3.0)                             # mutable: weights live here
with tf.GradientTape() as tape:                  # records ops for autodiff
    loss = (w * 2.0 - 4.0) ** 2
print("dloss/dw =", tape.gradient(loss, w).numpy())</div>
  <div class="fx" data-lang="text">2.21.0 3.15.1 tensorflow
(2, 2) &lt;dtype: 'float32'&gt;
[[ 5. 11.]
 [11. 25.]]
dloss/dw = 8.0</div>
  <p>Check: d/dw (2w − 4)² = 4(2w − 4) = 8 at w = 3. <code>GradientTape</code> ≈ PyTorch's <code>loss.backward()</code>; <code>@tf.function</code> compiles Python into a fast graph.</p>

  <h2 id="tk-seq"><span class="num">03</span>Sequential API &amp; the Training Loop</h2>
  <div class="flow"><span>Define layers</span><span>compile (optimizer, loss, metrics)</span><span>fit</span><span>evaluate</span><span>predict</span></div>
  <p>Sequential = a plain stack, one input, one output. Real data: scikit-learn's breast-cancer set (569 tumours, 30 features, malignant vs benign).</p>
  <div class="fx" data-lang="py">import numpy as np, keras
from keras import layers
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
keras.utils.set_random_seed(0)
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0, stratify=y)

norm = layers.Normalization()
norm.adapt(X_tr)                     # learns mean/std from TRAIN only; saved inside the model

model = keras.Sequential([
    keras.Input(shape=(30,)),
    norm,
    layers.Dense(16, activation="relu"),
    layers.Dropout(0.2),
    layers.Dense(1, activation="sigmoid"),
])
model.compile(optimizer=keras.optimizers.Adam(1e-3),
              loss="binary_crossentropy",
              metrics=["accuracy", keras.metrics.AUC(name="auc")])
model.summary()</div>
  <div class="fx" data-lang="text">┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┓
┃ Layer (type)                    ┃ Output Shape           ┃       Param # ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━┩
│ normalization (Normalization)   │ (None, 30)             │            61 │
│ dense (Dense)                   │ (None, 16)             │           496 │
│ dropout (Dropout)               │ (None, 16)             │             0 │
│ dense_1 (Dense)                 │ (None, 1)              │            17 │
└─────────────────────────────────┴────────────────────────┴───────────────┘
 Total params: 574 (2.25 KB)
 Trainable params: 513 (2.00 KB)
 Non-trainable params: 61 (248.00 B)</div>
  <ul>
    <li><code>None</code> = batch dimension, any size.</li>
    <li>Dense(16): 30 × 16 weights + 16 biases = 496. Normalization's 61 = 30 means + 30 variances + a count; not trainable.</li>
  </ul>
  <table class="tbl">
    <tr><th>Task</th><th>Last layer</th><th>Loss</th></tr>
    <tr><td>Binary</td><td>Dense(1, sigmoid)</td><td><code>binary_crossentropy</code></td></tr>
    <tr><td>Multi-class, int labels</td><td>Dense(C, softmax)</td><td><code>sparse_categorical_crossentropy</code></td></tr>
    <tr><td>Multi-class, one-hot</td><td>Dense(C, softmax)</td><td><code>categorical_crossentropy</code></td></tr>
    <tr><td>Regression</td><td>Dense(1), no activation</td><td><code>mse</code> / <code>mae</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Integer labels with <code>categorical_crossentropy</code> throws a shape error or trains wrong. Int labels → <code>sparse_</code>. If the last layer has no softmax, pass <code>from_logits=True</code>.</p>
  </div>

  <h2 id="tk-cb"><span class="num">04</span>Callbacks</h2>
  <p>Hooks <code>fit()</code> calls at the end of each epoch/batch. The three you'll use on every project:</p>
  <div class="fx" data-lang="py">callbacks = [
    keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True),
    keras.callbacks.ModelCheckpoint("best.keras", monitor="val_loss", save_best_only=True),
    keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4, min_lr=1e-5),
]
hist = model.fit(X_tr, y_tr, validation_split=0.2, epochs=200, batch_size=32,
                 callbacks=callbacks, verbose=0)
h = hist.history                                   # dict of per-epoch lists
print("epochs run:", len(h["loss"]), " best epoch:", int(np.argmin(h["val_loss"])) + 1)
print("final lr:", float(model.optimizer.learning_rate.numpy()))
print(model.evaluate(X_te, y_te, verbose=0, return_dict=True))
print(model.predict(X_te[:3], verbose=0).round(3).ravel(), y_te[:3])</div>
  <div class="fx" data-lang="text">epochs run: 86  best epoch: 76
final lr: 0.0001250000059371814
{'accuracy': 0.9736841917037964, 'auc': 0.989914059638977, 'loss': 0.10996349155902863}
[0.006 0.    0.   ] [0 0 0]</div>
  <figure class="viz"><svg viewBox="0 0 560 210" width="560">
<line x1="50" y1="170" x2="540" y2="170" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="170" stroke="currentColor"/>
<text x="44" y="24" text-anchor="end" class="tm">0.6</text><text x="44" y="174" text-anchor="end" class="tm">0</text>
<polyline points="50,25 56,58 62,82 67,95 73,106 79,112 85,119 90,119 96,124 102,120 108,130 113,132 119,133 125,136 131,138 136,137 142,141 148,139 154,142 160,142 165,144 171,145 177,144 183,146 188,146 194,147 200,149 206,148 211,146 217,150 223,149 229,150 234,148 240,151 246,152 252,154 258,153 263,152 269,152 275,154 281,154 286,153 292,154 298,153 304,154 309,157 315,153 321,154 327,154 332,155 338,157 344,156 350,156 356,156 361,156 367,157 373,157 379,155 384,156 390,158 396,158 402,158 407,158 413,156 419,157 425,158 430,158 436,158 442,159 448,156 454,160 459,159 465,157 471,156 477,160 482,159 488,159 494,159 500,159 505,160 511,158 517,159 523,158 528,160 534,159 540,157" fill="none" class="sb" stroke-width="2"/>
<polyline points="50,52 56,78 62,93 67,103 73,110 79,116 85,120 90,123 96,126 102,129 108,131 113,133 119,134 125,136 131,137 136,138 142,139 148,140 154,141 160,142 165,143 171,143 177,144 183,144 188,145 194,145 200,146 206,146 211,147 217,147 223,148 229,148 234,149 240,149 246,149 252,149 258,150 263,150 269,150 275,151 281,151 286,151 292,151 298,151 304,152 309,152 315,152 321,152 327,153 332,153 338,153 344,153 350,153 356,153 361,153 367,153 373,154 379,154 384,154 390,154 396,154 402,154 407,154 413,154 419,154 425,154 430,154 436,154 442,154 448,154 454,154 459,154 465,154 471,155 477,155 482,155 488,155 494,155 500,155 505,155 511,155 517,155 523,155 528,155 534,155 540,155" fill="none" class="sr" stroke-width="2"/>
<line x1="482" y1="20" x2="482" y2="170" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="478" y="30" text-anchor="end" class="tg">best val_loss (epoch 76) restored</text>
<text x="520" y="60" text-anchor="end" class="tm">stopped at 86 (patience 10)</text>
<text x="50" y="200" class="tm">epoch 1</text><text x="540" y="200" text-anchor="end" class="tm">epoch 86</text>
<text x="200" y="200" class="tb">— train loss</text><text x="320" y="200" class="tr">— val loss</text>
</svg><figcaption>Real history of this run. Asked for 200 epochs; stopped at 86 and rolled back to epoch 76's weights.</figcaption></figure>
  <div class="cards">
    <div><b>EarlyStopping</b><p>Stop when val metric stops improving for <code>patience</code> epochs.</p><small>Set <code>restore_best_weights=True</code></small></div>
    <div><b>ModelCheckpoint</b><p>Save the model (or best one) to disk during training.</p><small>Survives crashes and preemption</small></div>
    <div><b>ReduceLROnPlateau</b><p>Halve the learning rate when progress stalls.</p><small>Here 1e-3 → 1.25e-4 (3 halvings)</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>validation_split</code> takes the <em>last</em> 20% of rows without shuffling. If data is sorted (by label or time), validation is skewed. Shuffle first or pass <code>validation_data=</code>.</p>
  </div>

  <h2 id="tk-func"><span class="num">05</span>Functional API</h2>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
<defs><marker id="tk-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<rect x="5" y="20" width="120" height="36" class="fb sb"/><text x="65" y="43" text-anchor="middle">numeric (5)</text>
<rect x="5" y="104" width="120" height="36" class="fb sb"/><text x="65" y="127" text-anchor="middle">store_id (1)</text>
<rect x="150" y="104" width="110" height="36" class="fv"/><text x="205" y="127" text-anchor="middle">Embedding → 4</text>
<rect x="290" y="62" width="100" height="36" class="ft st"/><text x="340" y="85" text-anchor="middle">Concat (9)</text>
<rect x="415" y="62" width="70" height="36" class="fs" stroke="currentColor"/><text x="450" y="85" text-anchor="middle">Dense 16</text>
<rect x="505" y="62" width="50" height="36" class="fg sg"/><text x="530" y="85" text-anchor="middle">buy</text>
<path d="M127,38 L270,38 L288,70" fill="none" stroke="currentColor" marker-end="url(#tk-ar)"/>
<line x1="127" y1="122" x2="147" y2="122" stroke="currentColor" marker-end="url(#tk-ar)"/>
<path d="M262,122 L272,122 L288,92" fill="none" stroke="currentColor" marker-end="url(#tk-ar)"/>
<line x1="392" y1="80" x2="412" y2="80" stroke="currentColor" marker-end="url(#tk-ar)"/>
<line x1="487" y1="80" x2="502" y2="80" stroke="currentColor" marker-end="url(#tk-ar)"/>
<text x="5" y="165" class="tm">a graph: branches, merges, many inputs/outputs</text>
</svg><figcaption>Two inputs of different types, merged. Sequential can't express this.</figcaption></figure>
  <p>Call layers like functions on tensors, then wrap inputs and outputs in <code>keras.Model</code>. Toy task: will a user buy? 5 numeric features plus a store id (50 stores, each with a hidden effect).</p>
  <div class="fx" data-lang="py">num_in   = keras.Input(shape=(5,), name="numeric")
store_in = keras.Input(shape=(1,), dtype="int32", name="store_id")
s = layers.Embedding(input_dim=50, output_dim=4)(store_in)   # (None, 1, 4)
s = layers.Flatten()(s)                                       # (None, 4)
h = layers.Concatenate()([num_in, s])                         # (None, 9)
h = layers.Dense(16, activation="relu")(h)
out = layers.Dense(1, activation="sigmoid", name="buy")(h)
model = keras.Model(inputs=[num_in, store_in], outputs=out)
model.compile("adam", "binary_crossentropy", metrics=[keras.metrics.AUC(name="auc")])</div>
  <div class="fx" data-lang="text">Total params: 377 (1.47 KB)      # Embedding 50×4=200, Dense 9×16+16=160, buy 17</div>
  <div class="cards">
    <div><b>Sequential</b><p>Single stack.</p><small>MLPs, simple CNNs</small></div>
    <div><b>Functional</b><p>Any DAG of layers.</p><small>Multi-input, skip connections, multi-task heads</small></div>
    <div><b>Subclassing</b><p><code>class M(keras.Model)</code> with <code>call()</code>.</p><small>Dynamic logic; PyTorch-like; harder to inspect/serialize</small></div>
  </div>

  <h2 id="tk-data"><span class="num">06</span>tf.data Pipelines</h2>
  <div class="flow"><span>Source (arrays, files, TFRecord)</span><span>map (parse, augment)</span><span>shuffle</span><span>batch</span><span>prefetch</span><span>model.fit</span></div>
  <p>Streams data that doesn't fit in RAM, and prepares the next batch on CPU while the GPU trains on the current one.</p>
  <div class="fx" data-lang="py">import tensorflow as tf
ds = tf.data.Dataset.from_tensor_slices(
        ({"numeric": num, "store_id": store[:, None]}, y))   # keys = Input names
train_ds = ds.take(3200).shuffle(3200, seed=0).batch(64).prefetch(tf.data.AUTOTUNE)
val_ds   = ds.skip(3200).batch(256).prefetch(tf.data.AUTOTUNE)
hist = model.fit(train_ds, validation_data=val_ds, epochs=15, verbose=0)
print(f"val_auc after 1 epoch {hist.history['val_auc'][0]:.3f}, "
      f"after 15: {hist.history['val_auc'][-1]:.3f}")</div>
  <div class="fx" data-lang="text">val_auc after 1 epoch 0.572, after 15: 0.862
AUC using x0 - 0.5*x1 only: 0.676          # same val rows, numeric signal alone</div>
  <p>The store embedding learned the hidden per-store effect: 0.676 → 0.862.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shuffle <em>before</em> batch (else you shuffle whole batches), and give shuffle a buffer ≈ dataset size. With a Dataset, <code>fit(shuffle=True)</code> is ignored, and <code>batch_size</code> must not be passed.</p>
  </div>

  <h2 id="tk-save"><span class="num">07</span>Saving &amp; TF Serving</h2>
  <table class="tbl">
    <tr><th>Format</th><th>How</th><th>Use for</th></tr>
    <tr><td><strong>.keras</strong> (zip: config + weights)</td><td><code>model.save("m.keras")</code> / <code>keras.models.load_model</code></td><td>Resume training, share in Python</td></tr>
    <tr><td><strong>Weights only</strong></td><td><code>save_weights("m.weights.h5")</code></td><td>Same code rebuilds the architecture</td></tr>
    <tr><td><strong>SavedModel</strong> (graph + weights)</td><td><code>model.export("dir/1")</code></td><td>TF Serving, TFLite, other languages; no Python needed</td></tr>
    <tr><td>.h5 (legacy)</td><td>old <code>tf.keras</code></td><td>Reading old projects only</td></tr>
  </table>
  <div class="fx" data-lang="py">model.save("cancer.keras")
loaded = keras.models.load_model("cancer.keras")
print("same predictions:", np.allclose(loaded.predict(X_te, verbose=0),
                                       model.predict(X_te, verbose=0)))
model.export("export/cancer/1")      # version folder "1" is what TF Serving expects</div>
  <div class="fx" data-lang="text">same predictions: True
Saved artifact at 'export/cancer/1'. The following endpoints are available:
* Endpoint 'serve'
  args_0 (POSITIONAL_ONLY): TensorSpec(shape=(None, 30), dtype=tf.float32, name='keras_tensor')
Output Type:
  TensorSpec(shape=(None, 1), dtype=tf.float32, name=None)</div>
  <h3>TF Serving: a model server with no Python code</h3>
  <div class="flow"><span>export/cancer/1/</span><span>tensorflow/serving container</span><span>REST :8501 / gRPC :8500</span><span>Client POST JSON</span></div>
  <div class="fx" data-lang="text">docker run -d --rm -p 8501:8501 \\
  -v "$PWD/export/cancer:/models/cancer" -e MODEL_NAME=cancer tensorflow/serving

curl -s localhost:8501/v1/models/cancer                  # health / version status
curl -s -X POST localhost:8501/v1/models/cancer:predict \\
     -d @req.json                                        # {"instances": [[30 floats], ...]}</div>
  <div class="fx" data-lang="text">{"model_version_status": [{"version": "1", "state": "AVAILABLE", ...}]}
{
    "predictions": [[0.00606069528], [2.95291786e-12], [0.000421408302]
    ]
}</div>
  <p>Same three probabilities as <code>model.predict</code> above. Drop a folder <code>2/</code> next to <code>1/</code> and the server hot-swaps to the new version with no restart.</p>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>Preprocessing (the Normalization layer) lives inside the exported graph, so the server receives raw features. No training/serving skew from re-implementing scaling in the API.</p>
  </div>

  <h2 id="tk-pt"><span class="num">08</span>PyTorch ↔ Keras Cheat Sheet</h2>
  <table class="tbl">
    <tr><th>Concept</th><th>PyTorch</th><th>Keras 3 / TF</th></tr>
    <tr><td>Fully connected</td><td><code>nn.Linear(in, out)</code></td><td><code>layers.Dense(out)</code> (input size inferred)</td></tr>
    <tr><td>Conv / pooling</td><td><code>nn.Conv2d</code>, <code>nn.MaxPool2d</code></td><td><code>layers.Conv2D</code>, <code>layers.MaxPooling2D</code></td></tr>
    <tr><td>Image layout</td><td>NCHW (channels first)</td><td>NHWC (channels last)</td></tr>
    <tr><td>Embedding / dropout / BN</td><td><code>nn.Embedding</code>, <code>nn.Dropout</code>, <code>nn.BatchNorm1d</code></td><td><code>layers.Embedding</code>, <code>layers.Dropout</code>, <code>layers.BatchNormalization</code></td></tr>
    <tr><td>Model class</td><td><code>nn.Module</code> + <code>forward()</code></td><td><code>keras.Model</code> + <code>call()</code>, or Sequential/Functional</td></tr>
    <tr><td>Training loop</td><td>Write it: zero_grad, backward, step</td><td><code>model.fit()</code> (custom: <code>GradientTape</code>)</td></tr>
    <tr><td>Autodiff</td><td><code>loss.backward()</code></td><td><code>tape.gradient(loss, vars)</code></td></tr>
    <tr><td>Train / eval mode</td><td><code>model.train()</code> / <code>model.eval()</code></td><td>Automatic in fit/predict; <code>training=True</code> when calling manually</td></tr>
    <tr><td>Data</td><td><code>Dataset</code> + <code>DataLoader</code></td><td><code>tf.data.Dataset</code> (or a PyDataset)</td></tr>
    <tr><td>Loss with logits</td><td><code>nn.CrossEntropyLoss</code> (expects logits)</td><td><code>SparseCategoricalCrossentropy(from_logits=True)</code></td></tr>
    <tr><td>Save</td><td><code>torch.save(model.state_dict())</code></td><td><code>model.save("m.keras")</code></td></tr>
    <tr><td>Export / serve</td><td>TorchScript / ONNX → TorchServe, Triton</td><td>SavedModel → TF Serving; TFLite for mobile</td></tr>
    <tr><td>Device</td><td><code>.to("cuda")</code> explicit</td><td>Uses the GPU automatically if visible</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PyTorch's <code>CrossEntropyLoss</code> applies softmax itself; Keras losses expect probabilities unless <code>from_logits=True</code>. Porting a model and adding/removing a softmax silently breaks training.</p>
  </div>

  <h2 id="tk-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What's the relationship between TensorFlow and Keras today?</summary><div class="qa-body">TensorFlow is the low-level engine (tensors, autodiff, graphs, devices, serving). Keras is the high-level model API. Since Keras 3 it's a separate multi-backend library that can run on TensorFlow, JAX or PyTorch; <code>tf.keras</code> is the older bundled version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When must you use the Functional API instead of Sequential?</summary><div class="qa-body">Whenever the model isn't a single straight stack: multiple inputs (numeric + text + IDs), multiple outputs (multi-task heads), skip/residual connections, or shared layers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Labels are integers 0–9 and the last layer is Dense(10) with no activation. Which loss?</summary><div class="qa-body"><code>keras.losses.SparseCategoricalCrossentropy(from_logits=True)</code>. Sparse because labels are integers; from_logits because there's no softmax.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training ran 86 of 200 epochs with EarlyStopping(patience=10). Which weights does the model have?</summary><div class="qa-body">With <code>restore_best_weights=True</code>, the weights from the best val_loss epoch (76 here). Without it, the weights from the last epoch (86), which are slightly overfit. A common interview gotcha.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why would you add a Normalization layer inside the model instead of using StandardScaler?</summary><div class="qa-body">The fitted mean/std are saved with the model, so the exported SavedModel accepts raw features. Serving code can't forget or mis-implement the scaling, which prevents training/serving skew.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>.keras file vs SavedModel: which for what?</summary><div class="qa-body"><code>.keras</code>: the full Keras model (architecture, weights, optimizer state) to reload in Python and keep training. SavedModel via <code>model.export()</code>: a language-neutral graph for inference with TF Serving, TFLite conversion, or other runtimes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does TF Serving roll out a new model version?</summary><div class="qa-body">It watches the model base path. Exporting to a new numbered folder (e.g. <code>2/</code>) makes it load that version and switch traffic to it, by default serving the latest, with no restart. Clients can also request a specific version in the URL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You're porting a PyTorch CNN to Keras. Name two things that commonly break.</summary><div class="qa-body">(1) Tensor layout: PyTorch is NCHW, Keras defaults to NHWC, so reshape inputs and transpose conv weights. (2) Softmax/logits: PyTorch's CrossEntropyLoss takes logits; in Keras set <code>from_logits=True</code> or add softmax. Also BatchNorm momentum is defined differently (PyTorch 0.1 ≈ Keras 0.9).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you write a custom training loop with GradientTape instead of fit()?</summary><div class="qa-body">GANs (two optimizers alternating), unusual losses needing intermediate outputs, gradient manipulation (clipping per group, accumulation), or research ideas. Alternative: override <code>train_step</code> in a Model subclass and keep fit()'s callbacks and logging.</div></details>
</main>`
});
