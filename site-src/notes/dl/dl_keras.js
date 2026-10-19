// dl/dl_keras.js — TensorFlow & Keras
Object.assign(TOPIC_CONTENT, {
  "dl_keras": `<main>
  <h1>TensorFlow &amp; Keras</h1>
  <p class="lead">The other big deep-learning stack. You will meet it in existing production systems, TF Serving / TFLite deployments and many tutorials. This page explains each piece from scratch, maps it onto <a class="xref" data-note="dl_pytorch">PyTorch</a>, and runs real models end to end: tensors, build, train with callbacks, multi-input models, data pipelines, a hand-written training loop, save and serve. Shapes are traced at each step. All output is from a real run (TensorFlow 2.21, Keras 3.15, CPU) unless marked "example output".</p>

  <h2 id="tk-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">TensorFlow &amp; Keras</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Where it fits</div>
        <ul>
          <li><b>TensorFlow</b> — engine: tensors, autodiff, graphs, devices, Serving/TFLite/TF.js</li>
          <li><b>Keras 3</b> — high-level API; backends TF, JAX or PyTorch (<code>import keras</code>)</li>
          <li><b>Meet it in</b> — industry models from 2017–2022, mobile/edge, TFX/Vertex pipelines</li>
          <li><b>PyTorch instead</b> — research, LLMs, Hugging Face</li>
          <li>⚠ Keras 2 tutorials: <code>tf.keras</code>, .h5, <code>save("dir")</code> — outdated</li>
          <li>💡 Keras = automatic gearbox; PyTorch = manual</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tensors</div>
        <ul>
          <li><b>tf.constant</b> — immutable n-d array; <code>.numpy()</code> converts back</li>
          <li><b>tf.Variable</b> — mutable; holds weights; <code>assign_sub</code> updates</li>
          <li><b>GradientTape</b> — records ops; <code>tape.gradient(loss, w)</code> ≈ <code>backward()</code></li>
          <li>(2w − 4)² at w = 3 → loss 4, grad 8; step lr 0.1 → w = 2.2</li>
          <li><b>@tf.function</b> — compiles Python to a fast graph</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sequential workflow</div>
        <ul>
          <li><b>Sequential</b> — plain stack, one in, one out</li>
          <li><b>compile</b> — optimizer, loss, metrics (no training yet)</li>
          <li><b>fit</b> → History; <b>evaluate</b> → metrics; <b>predict</b> → outputs</li>
          <li><b>None</b> in shapes = batch size, any value</li>
          <li><b>Dense(16) on 30 inputs</b> — 30·16 + 16 = 496 params</li>
          <li><b>Normalization</b> — <code>adapt(X_train)</code>; scaling ships inside the model</li>
          <li><b>Loss pairing</b> — sigmoid + binary CE; softmax + sparse_ (int) or categorical (one-hot) CE</li>
          <li>⚠ No final activation → <code>from_logits=True</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Callbacks</div>
        <ul>
          <li><b>EarlyStopping</b> — stop after <code>patience</code> epochs without val improvement</li>
          <li>⚠ <code>restore_best_weights=True</code> or you keep the last (overfit) weights</li>
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
          <li><b>Example</b> — numeric (5) + store_id → Embedding (1, 4) → Flatten (4) → Concat (9) → Dense → buy</li>
          <li>val AUC 0.676 (numeric only) → 0.863 with the store embedding</li>
          <li><b>Subclassing</b> — <code>call()</code> for dynamic logic; harder to serialize</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">tf.data &amp; custom loops</div>
        <ul>
          <li><b>Pipeline</b> — from_tensor_slices / TFRecord → map → shuffle → batch → prefetch</li>
          <li><b>Why</b> — stream larger-than-RAM data; prepare next batch while GPU trains</li>
          <li><b>Multi-input</b> — dict keys match Input names</li>
          <li>⚠ Shuffle before batch; no <code>batch_size</code> in fit with a Dataset</li>
          <li><b>GradientTape loop</b> — forward in tape → gradient → <code>apply_gradients</code></li>
          <li>Use for GANs, odd losses; or override <code>train_step</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Save &amp; serve</div>
        <ul>
          <li><b>.keras</b> — <code>model.save</code> / <code>load_model</code>; config + weights + optimizer</li>
          <li><b>Weights</b> — <code>save_weights("x.weights.h5")</code></li>
          <li><b>SavedModel</b> — <code>model.export("dir/1")</code>; graph for Serving/TFLite, no Keras needed</li>
          <li><b>TF Serving</b> — Docker; REST :8501 <code>/v1/models/NAME:predict</code>, gRPC :8500</li>
          <li><b>Versions</b> — new numbered folder → hot-swap, no restart</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PyTorch ↔ Keras</div>
        <ul>
          <li><b>Linear</b> ↔ <b>Dense</b> (input size inferred); <b>forward</b> ↔ <b>call</b></li>
          <li><b>Manual loop</b> ↔ <b>fit()</b>; <b>backward()</b> ↔ <b>GradientTape</b></li>
          <li><b>DataLoader</b> ↔ <b>tf.data</b>; <b>state_dict</b> ↔ <b>.keras</b></li>
          <li>⚠ NCHW (PyTorch) vs NHWC (Keras): (None, 28, 28, 32)</li>
          <li>⚠ CrossEntropyLoss takes logits; BN momentum 0.1 ≈ 0.9</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tk-where"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where TF/Keras Fits</span><span class="rm-sub">vs PyTorch, Keras 3</span></div></div>
      <div class="rm-item rm-done" data-target="tk-tensor"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Tensors &amp; GradientTape</span><span class="rm-sub">constant, Variable, gradients</span></div></div>
      <div class="rm-item rm-done" data-target="tk-seq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Sequential API &amp; the Training Loop</span><span class="rm-sub">compile, fit, evaluate, predict</span></div></div>
      <div class="rm-item rm-done" data-target="tk-cb"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Callbacks</span><span class="rm-sub">Early stop, checkpoint, LR decay</span></div></div>
      <div class="rm-item rm-done" data-target="tk-func"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Functional API</span><span class="rm-sub">Multi-input models</span></div></div>
      <div class="rm-item rm-done" data-target="tk-data"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">tf.data Pipelines</span><span class="rm-sub">Shuffle, batch, prefetch</span></div></div>
      <div class="rm-item rm-done" data-target="tk-loop"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Custom Training Loop</span><span class="rm-sub">GradientTape by hand</span></div></div>
      <div class="rm-item rm-done" data-target="tk-save"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Saving &amp; TF Serving</span><span class="rm-sub">.keras, SavedModel, REST</span></div></div>
      <div class="rm-item rm-done" data-target="tk-pt"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">PyTorch ↔ Keras Cheat Sheet</span><span class="rm-sub">Translate in both directions</span></div></div>
      <div class="rm-item rm-done" data-target="tk-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Losses, splits, early stopping</span></div></div>
      <div class="rm-item rm-done" data-target="tk-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="tk-where"><span class="num">01</span>Where TF/Keras Fits</h2>
  <p>If you learned PyTorch first, you may ask why another framework. The practical reason: a lot of industry code was written between 2017 and 2022 in TensorFlow, and it still runs in production. A bank's fraud model, a phone app's on-device image model, a recommendation pipeline on Google Cloud: you may be asked to retrain, debug or deploy one. Job descriptions often list "TensorFlow/Keras" next to PyTorch, and interviews ask how the two compare.</p>
  <p>In plain words, there are two layers. <strong>TensorFlow</strong> (by Google) is the engine: tensors, automatic gradients, compiling Python into fast graphs, running on CPU/GPU/TPU, and deployment tools (TF Serving for servers, TFLite for phones, TF.js for browsers). <strong>Keras</strong> is the friendly front panel on top: layers, models, and a <code>fit()</code> method that runs the whole training loop for you. Since Keras 3, Keras is its own library that can run on TensorFlow, JAX or even PyTorch underneath.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Keras is an automatic car: <code>compile</code> + <code>fit</code> handle the gears, and you just steer. PyTorch is a manual: you write the loop and control every shift. Keras still lets you drop to manual when you need to (<code>GradientTape</code>, section 07), and TensorFlow is the engine under the bonnet either way.</p>
  </div>
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
  <p>The good news: the concepts are identical. A Dense layer is a Linear layer, a loss is a loss, backprop is backprop. Once you can trace shapes and write a training loop in one framework, the other is mostly new names, and section 09 is a translation table.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Backend</strong>: the engine Keras uses to do the actual maths (TensorFlow by default; set with the <code>KERAS_BACKEND</code> environment variable). <strong>High-level API</strong>: code where one call (<code>fit</code>) stands for many low-level steps.</p></div>
  <div class="callout trap"><span class="label">Trap: Keras 2 vs 3</span>
    <p>Old tutorials use <code>from tensorflow import keras</code> / <code>tf.keras</code>, <code>.h5</code> files and <code>model.save("dir")</code> for SavedModel. Keras 3 (TF ≥ 2.16) uses <code>import keras</code>, the <code>.keras</code> format, and <code>model.export()</code> for SavedModel. Mixing the two gives confusing errors; check the version first.</p>
  </div>

  <h2 id="tk-tensor"><span class="num">02</span>Tensors &amp; GradientTape</h2>
  <p>Like PyTorch, TensorFlow needs its own array type: one that can live on a GPU and that can report gradients. NumPy arrays can do neither. TensorFlow splits the job into two types. A <strong>tf.constant</strong> is a fixed array: inputs, intermediate results. A <strong>tf.Variable</strong> is a box whose value can change: that is where weights live, because training changes them.</p>
  <p>For gradients, TensorFlow does not attach history to every tensor (PyTorch's <code>requires_grad</code>). Instead you open a <strong>GradientTape</strong> block. Every operation inside the block is recorded, and afterwards <code>tape.gradient(loss, w)</code> plays the recording backwards to give dloss/dw.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket match on TV. Normal play is not saved, but while the third umpire's recorder (the tape) is running, every ball is recorded, and afterwards it can be replayed backwards to see exactly what caused the wicket. <code>tape.gradient</code> is that replay.</p>
  </div>
  <p>Worked example by hand: loss = (2w − 4)² at w = 3. Forward: 2·3 − 4 = 2, squared = 4. Derivative: 2·(2w − 4)·2 = 4(2w − 4) = 4·2 = 8. One gradient-descent step with learning rate 0.1: w = 3 − 0.1·8 = 2.2, which moves w toward the answer 2 where the loss is 0.</p>
  <div class="fx" data-lang="py">import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"          # hide TF's start-up log lines
import tensorflow as tf, keras, numpy as np
print(tf.__version__, keras.__version__, keras.backend.backend())
x = tf.constant([[1., 2.], [3., 4.]])            # immutable tensor, shape (2, 2)
print(x.shape, x.dtype)
print((x @ tf.transpose(x)).numpy())             # (2,2) @ (2,2) -&gt; (2,2); .numpy() back to NumPy
print(tf.reshape(x, (4,)).numpy(), tf.expand_dims(x, 0).shape)
try:
    x[0, 0] = 5.
except TypeError as e:
    print("TypeError:", e)
w = tf.Variable(3.0)                             # mutable: weights live here
with tf.GradientTape() as tape:                  # records ops for autodiff
    loss = (w * 2.0 - 4.0) ** 2
g = tape.gradient(loss, w)
print("loss =", loss.numpy(), " dloss/dw =", g.numpy())
w.assign_sub(0.1 * g)                            # w = w - lr * grad
print("w after one step:", w.numpy())
print(tf.constant(np.array([1.5])).dtype)</div>
  <div class="fx" data-lang="text">2.21.0 3.15.1 tensorflow
(2, 2) &lt;dtype: 'float32'&gt;
[[ 5. 11.]
 [11. 25.]]
[1. 2. 3. 4.] (1, 2, 2)
TypeError: 'tensorflow.python.framework.ops.EagerTensor' object does not support item assignment
loss = 4.0  dloss/dw = 8.0
w after one step: 2.2
&lt;dtype: 'float64'&gt;</div>
  <p>What happened: the version line confirms Keras 3 running on the TensorFlow backend. <code>x @ tf.transpose(x)</code> is matrix multiply: top-left cell 1·1 + 2·2 = 5. <code>tf.reshape</code> and <code>tf.expand_dims</code> are TensorFlow's <code>reshape</code> and <code>unsqueeze</code>. Trying to change a constant fails: constants are immutable. The tape gave loss 4 and gradient 8, matching the hand calculation, and <code>assign_sub</code> did the update in place: 2.2. Last line: as in PyTorch, a NumPy array keeps float64, while Keras layers use float32 (Keras converts NumPy inputs for you inside <code>fit</code>/<code>predict</code>).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>tf.constant</strong>: immutable tensor. <strong>tf.Variable</strong>: mutable tensor, tracked as a trainable weight. <strong>GradientTape</strong>: context manager that records operations on watched variables so <code>tape.gradient</code> can compute derivatives. <strong>@tf.function</strong>: decorator that traces a Python function once into a graph for speed.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A tape is used up after one <code>gradient()</code> call; calling it twice errors unless you create it with <code>persistent=True</code>. And only operations <em>inside</em> the <code>with</code> block are recorded: computing the loss after the block gives a gradient of <code>None</code>.</p></div>

  <h2 id="tk-seq"><span class="num">03</span>Sequential API &amp; the Training Loop</h2>
  <p>In PyTorch you write the training loop yourself every time: zero grads, forward, loss, backward, step, plus batching, shuffling, validation and logging. For a standard model that is 30 lines of boilerplate that are the same in every project, and each line is a chance for a bug. Keras packs all of it into three calls.</p>
  <p>In plain words: <strong>build</strong> the model as a list of layers (<code>Sequential</code>), <strong>compile</strong> it (choose optimizer, loss and metrics; nothing trains yet), then <strong>fit</strong> (runs the loop for many epochs). Afterwards <code>evaluate</code> gives test metrics and <code>predict</code> gives outputs for new rows.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Ordering a thali at a restaurant. You choose the items (layers), tell the waiter your preferences (compile: spicy or not, which drink), and the kitchen does everything else (fit). PyTorch is cooking it yourself at home.</p></div>
  <div class="flow"><span>Define layers</span><span>compile (optimizer, loss, metrics)</span><span>fit</span><span>evaluate</span><span>predict</span></div>
  <p>Real data: scikit-learn's breast-cancer set, 569 tumours, 30 measurements each (radius, texture, …), label 1 = benign, 0 = malignant. The features have very different scales (radius ≈ 14, area ≈ 650), and networks train badly on unscaled inputs, so the first layer is a <strong>Normalization</strong> layer that subtracts each feature's mean and divides by its standard deviation. <code>adapt(X_tr)</code> computes those from the training rows only.</p>
  <p>Shape trace for a batch of 32 rows: (32, 30) → Normalization (32, 30) → Dense(16, ReLU) (32, 16) → Dropout (32, 16) → Dense(1, sigmoid) (32, 1): one probability per row. Params: Dense(16) has 30·16 weights + 16 biases = 496; Dense(1) has 16 + 1 = 17.</p>
  <div class="fx" data-lang="py">from keras import layers
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
keras.utils.set_random_seed(0)
X, y = load_breast_cancer(return_X_y=True)
print(X.shape, y.shape, y.mean().round(3))
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0, stratify=y)
print(X_tr.shape, X_te.shape)
print(X_tr[:, :3].mean(0).round(1), X_tr[:, :3].std(0).round(1))

norm = layers.Normalization()
norm.adapt(X_tr)                     # learns mean/std from TRAIN only; saved inside the model
print(norm(X_tr[:200]).numpy()[:, :3].mean(0).round(2))

model = keras.Sequential([
    keras.Input(shape=(30,)),        # one row = 30 numbers; batch size left open
    norm,
    layers.Dense(16, activation="relu"),
    layers.Dropout(0.2),
    layers.Dense(1, activation="sigmoid"),
])
model.compile(optimizer=keras.optimizers.Adam(1e-3),
              loss="binary_crossentropy",
              metrics=["accuracy", keras.metrics.AUC(name="auc")])
model.summary()
print(model(X_te[:4]).shape)</div>
  <div class="fx" data-lang="text">(569, 30) (569,) 0.627
(455, 30) (114, 30)
[14.1 19.2 92. ] [ 3.6  4.4 24.8]
[-0.06  0.06 -0.07]
Model: "sequential"
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┓
┃ Layer (type)                    ┃ Output Shape           ┃       Param # ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━┩
│ normalization (Normalization)   │ (None, 30)             │            61 │
├─────────────────────────────────┼────────────────────────┼───────────────┤
│ dense (Dense)                   │ (None, 16)             │           496 │
├─────────────────────────────────┼────────────────────────┼───────────────┤
│ dropout (Dropout)               │ (None, 16)             │             0 │
├─────────────────────────────────┼────────────────────────┼───────────────┤
│ dense_1 (Dense)                 │ (None, 1)              │            17 │
└─────────────────────────────────┴────────────────────────┴───────────────┘
 Total params: 574 (2.25 KB)
 Trainable params: 513 (2.00 KB)
 Non-trainable params: 61 (248.00 B)
(4, 1)</div>
  <p>Reading the output: 63% of tumours are benign; 455 rows to train, 114 to test, with <code>stratify=y</code> keeping that 63% in both. The first three features have means 14, 19 and 92: very different scales. After the Normalization layer the means are near 0 (on a 200-row sample). In the summary, <strong>None</strong> is the batch dimension: the model accepts any number of rows, and calling it on 4 rows gave (4, 1). The 61 Normalization params are 30 means + 30 variances + 1 count, learned by <code>adapt</code>, not by training, so they are "non-trainable".</p>
  <table class="tbl">
    <tr><th>Task</th><th>Last layer</th><th>Loss</th></tr>
    <tr><td>Binary</td><td>Dense(1, sigmoid)</td><td><code>binary_crossentropy</code></td></tr>
    <tr><td>Multi-class, int labels</td><td>Dense(C, softmax)</td><td><code>sparse_categorical_crossentropy</code></td></tr>
    <tr><td>Multi-class, one-hot</td><td>Dense(C, softmax)</td><td><code>categorical_crossentropy</code></td></tr>
    <tr><td>Regression</td><td>Dense(1), no activation</td><td><code>mse</code> / <code>mae</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Dense</strong>: a fully connected layer (PyTorch's <code>Linear</code>), but you give only the output size; the input size is inferred. <strong>compile</strong>: attaches optimizer, loss and metrics. <strong>fit</strong>: runs the training loop and returns a <strong>History</strong> object with per-epoch metrics.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Integer labels with <code>categorical_crossentropy</code> throws a shape error or trains wrong. Int labels → <code>sparse_</code>. If the last layer has no softmax/sigmoid, pass <code>from_logits=True</code>, or the loss treats raw scores as probabilities.</p>
  </div>

  <h2 id="tk-cb"><span class="num">04</span>Callbacks</h2>
  <p>How many epochs should you train? Too few and the model is under-trained; too many and it starts memorising the training rows, so validation loss rises (overfitting). You cannot know the right number in advance. You also want to save the best model as you go, in case the machine dies, and to lower the learning rate when progress stalls. Doing this by hand means watching the logs for hours.</p>
  <p>A <strong>callback</strong> is a small object that <code>fit()</code> calls at fixed moments (end of each epoch or batch) so it can watch the numbers and act. You list them once, and they run automatically.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pressure cooker. You do not stand next to it counting minutes. The whistle (EarlyStopping) tells you when it is done, the safety valve (ReduceLROnPlateau) eases the pressure when needed, and you keep the best batch aside (ModelCheckpoint).</p></div>
  <p>The three you will use on every project, with the rule each one follows: <strong>EarlyStopping</strong>(patience 10): if val loss has not improved for 10 epochs in a row, stop, and roll back to the best epoch's weights. <strong>ModelCheckpoint</strong>: whenever val loss improves, write the model to <code>best.keras</code>. <strong>ReduceLROnPlateau</strong>(factor 0.5, patience 4): if val loss has not improved for 4 epochs, halve the learning rate.</p>
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
print(model.predict(X_te[:3], verbose=0).round(3).ravel(), y_te[:3])
print(sorted(h.keys()))
print([round(v, 3) for v in h["loss"][:3]], [round(v, 3) for v in h["val_loss"][:3]])</div>
  <div class="fx" data-lang="text">epochs run: 86  best epoch: 76
final lr: 0.0001250000059371814
{'accuracy': 0.9736841917037964, 'auc': 0.989914059638977, 'loss': 0.10996349155902863}
[0.006 0.    0.   ] [0 0 0]
['accuracy', 'auc', 'learning_rate', 'loss', 'val_accuracy', 'val_auc', 'val_loss']
[0.578, 0.447, 0.353] [0.471, 0.369, 0.307]</div>
  <p>What happened, step by step: <code>validation_split=0.2</code> held back 20% of the 455 training rows (91 rows) for validation. Each epoch went through the other 364 rows in batches of 32, i.e. 12 batches (the last has 12 rows). We asked for 200 epochs. The best val loss came at epoch 76; epochs 77–86 did not beat it, so after 10 non-improving epochs EarlyStopping stopped at 86 and restored epoch 76's weights. Along the way ReduceLROnPlateau halved the learning rate three times: 1e-3 → 5e-4 → 2.5e-4 → 1.25e-4. On the 114 unseen test rows: 97.4% accuracy, AUC 0.99. <code>predict</code> returns probabilities: the first three tumours get ≈ 0, i.e. malignant, which matches their labels 0. <code>hist.history</code> holds one list per metric, with <code>val_</code> versions for validation.</p>
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
</svg><figcaption>Real history of this run. Asked for 200 epochs; stopped at 86 and rolled back to epoch 76's weights. Both curves flatten long before epoch 200, so the remaining 114 epochs would only have wasted time.</figcaption></figure>
  <div class="cards">
    <div><b>EarlyStopping</b><p>Stop when val metric stops improving for <code>patience</code> epochs.</p><small>Set <code>restore_best_weights=True</code></small></div>
    <div><b>ModelCheckpoint</b><p>Save the model (or best one) to disk during training.</p><small>Survives crashes and preemption</small></div>
    <div><b>ReduceLROnPlateau</b><p>Halve the learning rate when progress stalls.</p><small>Here 1e-3 → 1.25e-4 (3 halvings)</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Callback</strong>: an object with hooks like <code>on_epoch_end</code> that <code>fit()</code> calls during training. <strong>Patience</strong>: how many non-improving epochs to tolerate before acting. You can write your own by subclassing <code>keras.callbacks.Callback</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>validation_split</code> takes the <em>last</em> 20% of rows without shuffling. If data is sorted (by label or by time), validation is skewed. Shuffle first (our <code>train_test_split</code> already did) or pass <code>validation_data=</code>.</p>
  </div>

  <h2 id="tk-func"><span class="num">05</span>Functional API</h2>
  <p>Sequential is a single straight pipe: one input, layers one after another, one output. Real problems often are not. Example: an e-commerce site wants to predict "will this user buy?" from 5 numbers (price, discount, time on page, …) <em>and</em> the store ID (one of 50 stores). A store ID is a category, not a quantity: store 37 is not "bigger" than store 2. So it needs different treatment from the numbers, then the two branches must merge. A straight pipe cannot express that.</p>
  <p>The <strong>Functional API</strong> lets you wire layers like a diagram. Create the inputs, call each layer on a tensor like a function to get a new tensor, and finally tell Keras which tensors are the inputs and which is the output.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A plumbing diagram instead of one straight pipe. Two water sources (inputs) run through different filters, join at a T-joint (Concatenate), then flow through the main pipe to one tap (output). You draw the diagram by connecting pieces.</p></div>
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
</svg><figcaption>Two inputs of different types, merged. Sequential cannot express this.</figcaption></figure>
  <p>The store branch uses an <strong>Embedding</strong>: a lookup table with one learned row of 4 numbers per store. Store 37 → row 37. Training moves each store's row so that stores with similar buying behaviour get similar vectors. Shape trace: store_id (None, 1) → Embedding (None, 1, 4) → Flatten (None, 4) → Concatenate with numeric (None, 5) → (None, 9) → Dense (None, 16) → buy (None, 1). Params: embedding 50·4 = 200, Dense 9·16 + 16 = 160, buy 16 + 1 = 17, total 377.</p>
  <p>The toy data below has a hidden truth we built in: buying depends on x0 − 0.5·x1 plus a secret per-store effect. A good model must learn that effect from the store ID.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import roc_auc_score
keras.utils.set_random_seed(0)
rng = np.random.default_rng(0)
n = 4000
num = rng.normal(size=(n, 5)).astype("float32")             # 5 numeric features
store = rng.integers(0, 50, size=n).astype("int32")          # which of 50 stores
store_effect = rng.normal(scale=1.5, size=50)                # hidden per-store effect
logit = num[:, 0] - 0.5 * num[:, 1] + store_effect[store]
y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype("float32")
print(num.shape, store.shape, y.shape, y.mean().round(3))

num_in   = keras.Input(shape=(5,), name="numeric")
store_in = keras.Input(shape=(1,), dtype="int32", name="store_id")
s = layers.Embedding(input_dim=50, output_dim=4)(store_in)
print(s.shape)
s = layers.Flatten()(s)
h = layers.Concatenate()([num_in, s])
print(s.shape, h.shape)
h = layers.Dense(16, activation="relu")(h)
out = layers.Dense(1, activation="sigmoid", name="buy")(h)
buy_model = keras.Model(inputs=[num_in, store_in], outputs=out)
buy_model.compile("adam", "binary_crossentropy", metrics=[keras.metrics.AUC(name="auc")])
buy_model.summary()</div>
  <div class="fx" data-lang="text">(4000, 5) (4000,) (4000,) 0.544
(None, 1, 4)
(None, 4) (None, 9)
Model: "functional_1"
┏━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┓
┃ Layer (type)        ┃ Output Shape      ┃    Param # ┃ Connected to      ┃
┡━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━┩
│ store_id            │ (None, 1)         │          0 │ -                 │
│ (InputLayer)        │                   │            │                   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ embedding           │ (None, 1, 4)      │        200 │ store_id[0][0]    │
│ (Embedding)         │                   │            │                   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ numeric             │ (None, 5)         │          0 │ -                 │
│ (InputLayer)        │                   │            │                   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ flatten (Flatten)   │ (None, 4)         │          0 │ embedding[0][0]   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ concatenate         │ (None, 9)         │          0 │ numeric[0][0],    │
│ (Concatenate)       │                   │            │ flatten[0][0]     │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ dense_2 (Dense)     │ (None, 16)        │        160 │ concatenate[0][0] │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ buy (Dense)         │ (None, 1)         │         17 │ dense_2[0][0]     │
└─────────────────────┴───────────────────┴────────────┴───────────────────┘
 Total params: 377 (1.47 KB)
 Trainable params: 377 (1.47 KB)
 Non-trainable params: 0 (0.00 B)</div>
  <p>What happened: before any data flows, each layer call already returned a "symbolic" tensor with a known shape, which is how we could print (None, 1, 4) and (None, 9) while building. (Keras numbers auto-named layers per session, hence <code>functional_1</code> and <code>dense_2</code>: two Dense layers were already built in section 03.) The summary's "Connected to" column shows the graph: <code>concatenate</code> takes two inputs, <code>numeric</code> and <code>flatten</code>. The parameter counts match the hand calculation. Training this model is in the next section, together with tf.data.</p>
  <div class="cards">
    <div><b>Sequential</b><p>Single stack.</p><small>MLPs, simple CNNs</small></div>
    <div><b>Functional</b><p>Any graph (DAG) of layers.</p><small>Multi-input, skip connections, multi-task heads</small></div>
    <div><b>Subclassing</b><p><code>class M(keras.Model)</code> with <code>call()</code>.</p><small>Dynamic logic; PyTorch-like; harder to inspect/serialize</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Functional API</strong>: build a model by calling layers on symbolic tensors from <code>keras.Input</code>, then <code>keras.Model(inputs, outputs)</code>. <strong>Embedding</strong>: a trainable lookup table mapping an integer ID to a dense vector; params = number of IDs × vector size.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Feeding a category ID as a plain number (store 37 as the value 37.0 into a Dense layer) tells the model that store 37 is "37 times" store 1. Use an Embedding (many categories) or one-hot encoding (few categories).</p></div>

  <h2 id="tk-data"><span class="num">06</span>tf.data Pipelines</h2>
  <p>So far the data sat in NumPy arrays in RAM. Real image or log datasets are often 100 GB of files: they do not fit in memory, and reading and decoding them is slow. If the GPU has to wait for the CPU to prepare each batch, an expensive GPU sits idle half the time. <strong>tf.data</strong> builds a pipeline that streams data from disk and prepares the next batch while the current one trains (Keras's version of PyTorch's Dataset + DataLoader).</p>
  <p>In plain words: start from a source (arrays, files, TFRecord files), then chain steps: <code>map</code> (parse or augment each example), <code>shuffle</code>, <code>batch</code>, <code>prefetch</code> (get the next batch ready in the background). The result is a Dataset you pass straight to <code>fit</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A railway station canteen at lunch. One person cuts vegetables, one cooks, one packs, and while you eat thali number 1, thali number 2 is already being packed (prefetch). Nobody waits for the whole order to finish before starting the next.</p></div>
  <div class="flow"><span>Source (arrays, files, TFRecord)</span><span>map (parse, augment)</span><span>shuffle</span><span>batch</span><span>prefetch</span><span>model.fit</span></div>
  <p>For the two-input model, each example must be a pair (inputs, label) where inputs is a dict whose keys match the <code>Input</code> names. Shape trace: one example is {"numeric": (5,), "store_id": (1,)} and a label (); after <code>batch(64)</code> a batch is {"numeric": (64, 5), "store_id": (64, 1)} and (64,). 3,200 training rows / 64 = 50 batches. The rest (800 rows) is validation.</p>
  <div class="fx" data-lang="py">import tensorflow as tf
ds = tf.data.Dataset.from_tensor_slices(
        ({"numeric": num, "store_id": store[:, None]}, y))   # keys = Input names
print(ds.element_spec)
train_ds = ds.take(3200).shuffle(3200, seed=0).batch(64).prefetch(tf.data.AUTOTUNE)
val_ds   = ds.skip(3200).batch(256).prefetch(tf.data.AUTOTUNE)
xb, yb = next(iter(train_ds))
print(xb["numeric"].shape, xb["store_id"].shape, yb.shape, len(list(train_ds)))
hist = buy_model.fit(train_ds, validation_data=val_ds, epochs=15, verbose=0)
print(f"val_auc after 1 epoch {hist.history['val_auc'][0]:.3f}, "
      f"after 15: {hist.history['val_auc'][-1]:.3f}")
print("AUC using x0 - 0.5*x1 only:", round(roc_auc_score(y[3200:], num[3200:, 0] - 0.5 * num[3200:, 1]), 3))</div>
  <div class="fx" data-lang="text">({'numeric': TensorSpec(shape=(5,), dtype=tf.float32, name=None), 'store_id': TensorSpec(shape=(1,), dtype=tf.int32, name=None)}, TensorSpec(shape=(), dtype=tf.float32, name=None))
(64, 5) (64, 1) (64,) 50
val_auc after 1 epoch 0.573, after 15: 0.863
AUC using x0 - 0.5*x1 only: 0.676</div>
  <p>What happened: <code>from_tensor_slices</code> cut the arrays into 4,000 single examples; <code>element_spec</code> shows one example's shapes, matching the trace. <code>take(3200)</code>/<code>skip(3200)</code> split train and validation. The first batch has the expected shapes, and there are 50 batches. After 15 epochs the model reaches validation AUC 0.863. For comparison, the best possible score using only the numeric signal (x0 − 0.5·x1, which we know is the true numeric rule) is 0.676. The gap from 0.676 to 0.863 is the store effect, learned by the Embedding from nothing but store IDs.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>tf.data.Dataset</strong>: a lazy, streaming sequence of examples with chainable transformations. <strong>prefetch(AUTOTUNE)</strong>: prepare upcoming batches in the background, with TensorFlow choosing the buffer size. <strong>TFRecord</strong>: TensorFlow's binary file format for large datasets.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shuffle <em>before</em> batch (else you only shuffle the order of whole batches), and give shuffle a buffer about the size of the dataset (a buffer of 100 on 1M sorted rows barely shuffles). With a Dataset, <code>fit(shuffle=True)</code> is ignored and <code>batch_size</code> must not be passed.</p>
  </div>

  <h2 id="tk-loop"><span class="num">07</span>Custom Training Loop</h2>
  <p><code>fit()</code> covers 90% of cases. The other 10%: a GAN, where two models train against each other with two optimizers; a loss that needs intermediate outputs; per-layer gradient tricks; research ideas. There, the automatic gearbox gets in the way. Keras lets you take manual control with the same <code>GradientTape</code> from section 02, and this loop is line-for-line the PyTorch loop.</p>
  <p>In plain words, one training step: open a tape, run the model forward and compute the loss inside it, ask the tape for the gradient of the loss with respect to every trainable weight, and hand the (gradient, weight) pairs to the optimizer. No zeroing needed: a fresh tape is opened every step, so nothing accumulates.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Switching an automatic car to manual mode on a steep ghat road. Same engine, same car, but now you choose each gear yourself because the situation needs it.</p></div>
  <table class="tbl">
    <tr><th>Step</th><th>PyTorch</th><th>TF / Keras</th></tr>
    <tr><td>Clear old gradients</td><td><code>opt.zero_grad()</code></td><td>not needed (new tape each step)</td></tr>
    <tr><td>Forward + loss</td><td><code>loss = loss_fn(model(x), y)</code></td><td>inside <code>with tf.GradientTape() as tape:</code></td></tr>
    <tr><td>Gradients</td><td><code>loss.backward()</code></td><td><code>grads = tape.gradient(loss, model.trainable_variables)</code></td></tr>
    <tr><td>Update</td><td><code>opt.step()</code></td><td><code>opt.apply_gradients(zip(grads, vars))</code></td></tr>
  </table>
  <p>Here the model ends in Dense(1) with no sigmoid, so it outputs logits and the loss uses <code>from_logits=True</code>. Shape trace per step: x (32, 30) → logits (32, 1); labels y (32,) are reshaped to (32, 1) with <code>yb[:, None]</code> so both shapes match.</p>
  <div class="fx" data-lang="py">keras.utils.set_random_seed(0)
norm = layers.Normalization(); norm.adapt(X_tr)                  # same breast-cancer split as section 03
tape_model = keras.Sequential([keras.Input(shape=(30,)), norm,
                               layers.Dense(16, activation="relu"), layers.Dense(1)])   # logits
loss_fn = keras.losses.BinaryCrossentropy(from_logits=True)
opt = keras.optimizers.Adam(1e-3)
ds = tf.data.Dataset.from_tensor_slices((X_tr.astype("float32"), y_tr.astype("float32")))
ds = ds.shuffle(len(X_tr), seed=0).batch(32)

@tf.function                                             # compile the step into a graph
def train_step(xb, yb):
    with tf.GradientTape() as tape:
        logits = tape_model(xb, training=True)           # (32, 1); training=True: dropout/BN on
        loss = loss_fn(yb[:, None], logits)
    grads = tape.gradient(loss, tape_model.trainable_variables)
    opt.apply_gradients(zip(grads, tape_model.trainable_variables))
    return loss

for epoch in range(1, 31):
    for xb, yb in ds:
        loss = train_step(xb, yb)
    if epoch in (1, 10, 30):
        p = tf.sigmoid(tape_model(X_te.astype("float32"))).numpy().ravel()
        print(f"epoch {epoch:2d}  last batch loss {float(loss):.4f}  test acc {((p &gt; 0.5) == y_te).mean():.3f}")
print(len(tape_model.trainable_variables), [tuple(v.shape) for v in tape_model.trainable_variables])</div>
  <div class="fx" data-lang="text">epoch  1  last batch loss 1.0178  test acc 0.404
epoch 10  last batch loss 0.2341  test acc 0.930
epoch 30  last batch loss 0.0842  test acc 0.965
4 [(30, 16), (16,), (16, 1), (1,)]</div>
  <p>What happened: after one epoch the model is still poor (40% accuracy; a random start can be worse than guessing). By epoch 30 it reaches 96.5% on the test set, close to <code>fit()</code>'s 97.4%. <code>tape_model.trainable_variables</code> lists exactly four tensors: the Dense(16) kernel (30, 16) and bias (16,), and the Dense(1) kernel (16, 1) and bias (1,). The Normalization stats are not in the list, so they are never updated by the optimizer. Note that Keras stores Dense weights as (in, out), the transpose of PyTorch's (out, in). <code>tf.sigmoid</code> converts logits to probabilities for the accuracy check.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Custom training loop</strong>: replacing <code>fit()</code> with your own iteration over batches using <code>GradientTape</code> and <code>optimizer.apply_gradients</code>. Middle ground: subclass <code>keras.Model</code> and override <code>train_step</code>, which keeps <code>fit()</code>'s callbacks and logging.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>training=True</code> when calling the model inside your loop: dropout and BatchNorm then behave as at prediction time, and the model trains differently from <code>fit()</code>. Also, Python side effects (print, list appends) inside a <code>@tf.function</code> run only once, at tracing time.</p></div>

  <h2 id="tk-save"><span class="num">08</span>Saving &amp; TF Serving</h2>
  <p>A trained model lives in RAM and is gone when the Python process ends. You need two different kinds of saved file. One to continue working in Python (reload, evaluate, train more). Another to put behind an API so an app can send features and get predictions, ideally without shipping your Python training code to the server at all.</p>
  <p>Keras gives both. <code>model.save("m.keras")</code> writes a zip with the architecture, weights and optimizer state. <code>model.export("dir/1")</code> writes a <strong>SavedModel</strong>: the computation graph plus weights in a language-neutral format that TF Serving, TFLite (phones) or a Java/C++ program can run.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A recipe notebook vs a packed tiffin. The <code>.keras</code> file is your notebook: you can read it, change it, cook again (continue training). The SavedModel is a sealed tiffin handed to the delivery service (TF Serving): they cannot change the recipe, they just deliver the same food to every customer.</p></div>
  <table class="tbl">
    <tr><th>Format</th><th>How</th><th>Use for</th></tr>
    <tr><td><strong>.keras</strong> (zip: config + weights)</td><td><code>model.save("m.keras")</code> / <code>keras.models.load_model</code></td><td>Resume training, share in Python</td></tr>
    <tr><td><strong>Weights only</strong></td><td><code>save_weights("m.weights.h5")</code></td><td>Same code rebuilds the architecture</td></tr>
    <tr><td><strong>SavedModel</strong> (graph + weights)</td><td><code>model.export("dir/1")</code></td><td>TF Serving, TFLite, other languages; no Python model code needed</td></tr>
    <tr><td>.h5 (legacy)</td><td>old <code>tf.keras</code></td><td>Reading old projects only</td></tr>
  </table>
  <p>Using the breast-cancer <code>model</code> trained in section 04 (the functional and tape models have their own names, so <code>model</code> is still that one): save, reload, check predictions are identical, export, and then load the export <em>with plain TensorFlow</em>, without Keras, as a server would.</p>
  <div class="fx" data-lang="py">model.save("cancer.keras")
loaded = keras.models.load_model("cancer.keras")
print("same predictions:", np.allclose(loaded.predict(X_te, verbose=0),
                                       model.predict(X_te, verbose=0)))
model.export("export/cancer/1")      # version folder "1" is what TF Serving expects
print(sorted(os.listdir("export/cancer/1")))
served = tf.saved_model.load("export/cancer/1")            # no Keras model code involved
print(served.serve(X_te[:3].astype("float32")).numpy().round(6).ravel())</div>
  <div class="fx" data-lang="text">same predictions: True
Saved artifact at 'export/cancer/1'. The following endpoints are available:

* Endpoint 'serve'
  args_0 (POSITIONAL_ONLY): TensorSpec(shape=(None, 30), dtype=tf.float32, name='keras_tensor')
Output Type:
  TensorSpec(shape=(None, 1), dtype=tf.float32, name=None)
Captures:
  ... (6 internal variable ids, trimmed)
['assets', 'fingerprint.pb', 'saved_model.pb', 'variables']
[0.006033 0.       0.000421]</div>
  <p>What happened: the reloaded model gives identical predictions. <code>export</code> printed the serving <strong>signature</strong>: input (None, 30) float32, i.e. any number of rows of 30 raw features; output (None, 1). The folder holds the graph (<code>saved_model.pb</code>) and the weights (<code>variables/</code>). Loading it with <code>tf.saved_model.load</code> and calling <code>serve</code> gives the same three probabilities as <code>predict</code> in section 04 (rounded there to 0.006, 0, 0). Because the Normalization layer is inside the graph, the server receives <em>raw</em> features and scales them itself.</p>
  <h3>TF Serving: a model server with no Python code</h3>
  <p>TF Serving is a ready-made C++ server, usually run as a Docker container. You point it at the export folder; it exposes a REST endpoint on port 8501 and gRPC on 8500. The commands below need Docker, which this sandbox does not have, so the responses are <strong>example output</strong>, written to match the predictions above.</p>
  <div class="flow"><span>export/cancer/1/</span><span>tensorflow/serving container</span><span>REST :8501 / gRPC :8500</span><span>Client POST JSON</span></div>
  <div class="fx" data-lang="text">docker run -d --rm -p 8501:8501 \\
  -v "$PWD/export/cancer:/models/cancer" -e MODEL_NAME=cancer tensorflow/serving

curl -s localhost:8501/v1/models/cancer                  # health / version status
curl -s -X POST localhost:8501/v1/models/cancer:predict \\
     -d @req.json                                        # {"instances": [[30 floats], ...]}</div>
  <div class="fx" data-lang="text">example output:
{"model_version_status": [{"version": "1", "state": "AVAILABLE", ...}]}
{
    "predictions": [[0.006033], [0.0], [0.000421]]
}</div>
  <p>Drop a folder <code>2/</code> next to <code>1/</code> and the server loads it and switches to the new version with no restart (by default it serves the highest version number).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>SavedModel</strong>: TensorFlow's serialized graph + variables + signatures. <strong>Signature</strong>: the named entry point with fixed input/output shapes and dtypes. <strong>Training/serving skew</strong>: when the server preprocesses data differently from training, so the model sees different inputs in production.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Scaling features with scikit-learn's StandardScaler outside the model, then forgetting (or re-implementing slightly differently) the same scaling in the API code. Predictions silently go wrong. Putting the Normalization layer inside the model ships the scaling with the graph.</p>
  </div>

  <h2 id="tk-pt"><span class="num">09</span>PyTorch ↔ Keras Cheat Sheet</h2>
  <p>You will often read a model in one framework and need it in the other, or answer "how would you do X in PyTorch?" in an interview. The concepts map one to one; the names and two conventions differ. The table translates the common pieces; the code after it shows the biggest convention difference, image layout.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Hindi and Urdu in everyday speech: the grammar and most words are shared, a few words and the script differ. Learn the handful of differences and you can switch.</p></div>
  <table class="tbl">
    <tr><th>Concept</th><th>PyTorch</th><th>Keras 3 / TF</th></tr>
    <tr><td>Fully connected</td><td><code>nn.Linear(in, out)</code>, weight (out, in)</td><td><code>layers.Dense(out)</code> (input size inferred), kernel (in, out)</td></tr>
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
  <p>Shape trace of a small Keras CNN on 28 × 28 grey images. Note the channels sit <em>last</em>: an input is (28, 28, 1), and the first conv outputs (None, 28, 28, 32). In PyTorch the same tensor would be (N, 32, 28, 28). Param check: Conv2D(32, 3) on 1 channel = 3·3·1·32 + 32 = 320; Conv2D(64, 3) on 32 channels = 3·3·32·64 + 64 = 18,496; Dense(10) on 64 = 650.</p>
  <div class="fx" data-lang="py">cnn = keras.Sequential([
    keras.Input(shape=(28, 28, 1)),                     # H, W, C  (channels last)
    layers.Conv2D(32, 3, padding="same", activation="relu"),
    layers.MaxPooling2D(2),
    layers.Conv2D(64, 3, padding="same", activation="relu"),
    layers.GlobalAveragePooling2D(),
    layers.Dense(10),
])
for l in cnn.layers:
    print(f"{l.__class__.__name__:24s} {str(l.output.shape):20s} {l.count_params()}")
print(cnn(np.zeros((8, 28, 28, 1), "float32")).shape)</div>
  <div class="fx" data-lang="text">Conv2D                   (None, 28, 28, 32)   320
MaxPooling2D             (None, 14, 14, 32)   0
Conv2D                   (None, 14, 14, 64)   18496
GlobalAveragePooling2D   (None, 64)           0
Dense                    (None, 10)           650
(8, 10)</div>
  <p>Every shape and count matches the hand calculation, and a batch of 8 images gives (8, 10) logits. <code>padding="same"</code> is Keras's name for "pad so the size stays the same" (PyTorch: <code>padding=1</code> for a 3 × 3 kernel). The same network in PyTorch is in <a class="xref" data-note="dl_cnns">CNNs</a>, section 06.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>NCHW</strong>: (batch, channels, height, width), PyTorch's default. <strong>NHWC</strong>: (batch, height, width, channels), Keras/TensorFlow's default and how image files are stored.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PyTorch's <code>CrossEntropyLoss</code> applies softmax itself; Keras losses expect probabilities unless <code>from_logits=True</code>. Porting a model and adding/removing a softmax silently breaks training. Also BatchNorm momentum is defined the other way round: PyTorch 0.1 ≈ Keras 0.9.</p>
  </div>

  <h2 id="tk-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: mixing Keras 2 and Keras 3</span>
    <p><code>tf.keras</code> tutorials, <code>.h5</code> files and <code>model.save("dir")</code> are Keras 2. In Keras 3 use <code>import keras</code>, <code>.keras</code> files and <code>model.export()</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong loss for the labels</span>
    <p>Int labels → <code>sparse_categorical_crossentropy</code>; one-hot → <code>categorical_crossentropy</code>; no final activation → <code>from_logits=True</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: EarlyStopping without restore_best_weights</span>
    <p>Our run stopped at epoch 86; without the flag you keep epoch 86's weights, not the best (76).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: validation_split on sorted data</span>
    <p>It takes the last rows, unshuffled. Shuffle first or pass <code>validation_data</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fitting the scaler on all data</span>
    <p><code>norm.adapt(X)</code> on train + test leaks test statistics into training. Adapt on training rows only.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shuffle after batch, tiny shuffle buffer</span>
    <p>In tf.data, <code>shuffle</code> must come before <code>batch</code>, with a buffer close to the dataset size.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: category IDs as numbers</span>
    <p>Store ID 37 as the value 37.0 implies an order that does not exist. Use an Embedding or one-hot.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: NCHW vs NHWC when porting</span>
    <p>Keras expects (N, H, W, C). Feeding PyTorch-style (N, C, H, W) either errors or, for square inputs with 3 channels, silently treats rows as channels.</p>
  </div>

  <h2 id="tk-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What's the relationship between TensorFlow and Keras today?</summary><div class="qa-body">TensorFlow is the low-level engine (tensors, autodiff, graphs, devices, serving). Keras is the high-level model API. Since Keras 3 it is a separate multi-backend library that can run on TensorFlow, JAX or PyTorch; <code>tf.keras</code> is the older bundled version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>None</code> mean in <code>(None, 16)</code> in a model summary?</summary><div class="qa-body">The batch dimension, left open so the model accepts any number of rows. 16 is the number of features (units) per row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters does <code>Dense(16)</code> have on a 30-feature input? And <code>Embedding(50, 4)</code>?</summary><div class="qa-body">Dense: 30·16 weights + 16 biases = 496. Embedding: 50 rows × 4 = 200 (no bias).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When must you use the Functional API instead of Sequential?</summary><div class="qa-body">Whenever the model is not a single straight stack: multiple inputs (numeric + text + IDs), multiple outputs (multi-task heads), skip/residual connections, or shared layers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Labels are integers 0–9 and the last layer is Dense(10) with no activation. Which loss?</summary><div class="qa-body"><code>keras.losses.SparseCategoricalCrossentropy(from_logits=True)</code>. Sparse because labels are integers; from_logits because there is no softmax.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training ran 86 of 200 epochs with EarlyStopping(patience=10). Which weights does the model have?</summary><div class="qa-body">With <code>restore_best_weights=True</code>, the weights from the best val_loss epoch (76 here). Without it, the weights from the last epoch (86), which are slightly overfit. A common interview gotcha.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why would you add a Normalization layer inside the model instead of using StandardScaler?</summary><div class="qa-body">The fitted mean/std are saved with the model, so the exported SavedModel accepts raw features. Serving code cannot forget or mis-implement the scaling, which prevents training/serving skew.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>.keras file vs SavedModel: which for what?</summary><div class="qa-body"><code>.keras</code>: the full Keras model (architecture, weights, optimizer state) to reload in Python and keep training. SavedModel via <code>model.export()</code>: a language-neutral graph for inference with TF Serving, TFLite conversion, or other runtimes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does TF Serving roll out a new model version?</summary><div class="qa-body">It watches the model base path. Exporting to a new numbered folder (e.g. <code>2/</code>) makes it load that version and switch traffic to it, by default serving the latest, with no restart. Clients can also request a specific version in the URL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the four lines of a GradientTape training step.</summary><div class="qa-body"><code>with tf.GradientTape() as tape:</code> → <code>loss = loss_fn(y, model(x, training=True))</code> → <code>grads = tape.gradient(loss, model.trainable_variables)</code> → <code>opt.apply_gradients(zip(grads, model.trainable_variables))</code>. No zero_grad needed: each step uses a fresh tape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You're porting a PyTorch CNN to Keras. Name two things that commonly break.</summary><div class="qa-body">(1) Tensor layout: PyTorch is NCHW, Keras defaults to NHWC, so transpose inputs and conv weights. (2) Softmax/logits: PyTorch's CrossEntropyLoss takes logits; in Keras set <code>from_logits=True</code> or add softmax. Also Dense kernels are (in, out) vs Linear's (out, in), and BatchNorm momentum is defined differently (PyTorch 0.1 ≈ Keras 0.9).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you write a custom training loop with GradientTape instead of fit()?</summary><div class="qa-body">GANs (two optimizers alternating), unusual losses needing intermediate outputs, gradient manipulation (clipping per group, accumulation), or research ideas. Alternative: override <code>train_step</code> in a Model subclass and keep fit()'s callbacks and logging.</div></details>
</main>`
});
