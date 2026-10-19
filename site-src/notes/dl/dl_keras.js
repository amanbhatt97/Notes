// dl/dl_keras.js — TensorFlow & Keras
Object.assign(TOPIC_CONTENT, {
  "dl_keras": `<main>
  <h1>TensorFlow &amp; Keras</h1>
  <div class="where"><span>Deep Learning</span><span>TensorFlow &amp; Keras</span></div>
  <p class="lead">Keras is the high-level way to build and train neural networks on TensorFlow: layers stacked into a model, then <code>compile</code>, <code>fit</code>, <code>evaluate</code>, <code>predict</code>. This note teaches the same ideas you met in PyTorch, in Keras, on <strong>one running example</strong> from the same food-delivery app as the RNN and attention notes: <strong>"will this order arrive late?"</strong>, predicted from 5 numbers about the order and, later, which of 50 restaurants cooked it. Along the way: tensors and GradientTape (one gradient by hand), the Sequential API and the training loop, callbacks that decide when to stop, the Functional API for two inputs, tf.data pipelines, a hand-written training loop, saving and serving, and a PyTorch ↔ Keras translation that ends with the CNN note's pothole filter in Keras. Every code block ran here (TensorFlow 2.21, Keras 3.15, CPU, single thread).</p>

  <h2 id="tk-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 180" width="660">
<defs><marker id="tk-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="41" text-anchor="middle" font-size="12">Neurons · Backprop</text><text x="90" y="58" text-anchor="middle" class="tm" font-size="10">· Training (the ideas)</text>
<rect x="10" y="110" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="131" text-anchor="middle" font-size="12">PyTorch</text><text x="90" y="148" text-anchor="middle" class="tm" font-size="10">the same ideas, by hand</text>
<rect x="250" y="60" width="170" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="335" y="83" text-anchor="middle" font-size="13" font-weight="700">TensorFlow &amp; Keras</text><text x="335" y="102" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="500" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="41" text-anchor="middle" font-size="12">CNNs · RNNs · Attention</text><text x="575" y="58" text-anchor="middle" class="tm" font-size="10">architectures, any framework</text>
<rect x="500" y="110" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="131" text-anchor="middle" font-size="12">Serving &amp; MLOps</text><text x="575" y="148" text-anchor="middle" class="tm" font-size="10">SavedModel, TF Serving</text>
<line x1="170" y1="45" x2="248" y2="80" stroke="currentColor" marker-end="url(#tk-a0)"/><line x1="170" y1="135" x2="248" y2="98" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#tk-a0)"/>
<line x1="420" y1="80" x2="498" y2="45" stroke="currentColor" marker-end="url(#tk-a0)"/><line x1="420" y1="98" x2="498" y2="135" stroke="currentColor" marker-end="url(#tk-a0)"/>
</svg><figcaption>Keras is a second tool for the same ideas: learn the concepts once (foundations), then either framework is mostly new names.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="dl_neurons">Neurons &amp; MLPs</a>, <a class="xref" data-note="dl_backprop">Backpropagation</a>, <a class="xref" data-note="dl_training">Training</a>, <a class="xref" data-note="dl_pytorch">PyTorch</a></b><span>We know what a layer, a loss, a gradient and an optimizer are, and how to write the training loop by hand in PyTorch. Left open: a lot of industry code is in TensorFlow/Keras, and much of the loop we write by hand is the same boilerplate in every project.</span></li>
    <li><b>This note adds: the Keras way to do the same things</b><span>Sequential and Functional models, compile/fit/evaluate/predict, callbacks, tf.data, GradientTape for custom loops, .keras files and SavedModel for serving, and a translation table to and from PyTorch.</span></li>
    <li><b>Leads to: the architecture notes</b><span><a class="xref" data-note="dl_cnns">CNNs</a>, <a class="xref" data-note="dl_rnns">RNNs</a> and <a class="xref" data-note="dl_attention">Attention</a> are written in PyTorch but every layer has a Keras twin (Conv2D, LSTM, MultiHeadAttention); section 09 rebuilds the CNN note's pothole filter in Keras.</span></li>
  </ol>

  <h2 id="tk-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Every number is from our "late delivery" data.</p>
  <ol class="story">
    <li><b>Why TensorFlow/Keras at all</b><span>Q: we know PyTorch; why another framework? → Existing production models, mobile/browser deployment, and a <code>fit()</code> that removes boilerplate. But first: what are its basic objects?</span></li>
    <li><b>Tensors &amp; GradientTape</b><span>Q: where do weights live and how are gradients computed? → tf.Variable holds w; a tape records (2w − 4)² and gives dloss/dw = 8 at w = 3, so w → 2.2. Doing this for every weight by hand is tedious…</span></li>
    <li><b>Sequential + compile / fit / evaluate / predict</b><span>Q: how do we train a whole model in a few lines? → Stack layers, compile (optimizer, loss, metrics), fit: test AUC about 0.74 on 5 order features. But how many epochs?</span></li>
    <li><b>Callbacks</b><span>Q: when do we stop, and how do we keep the best model? → EarlyStopping, ModelCheckpoint, ReduceLROnPlateau watch val_loss each epoch. The model now matches the best any formula on these 5 numbers can do (0.74). The rest of the signal is in the restaurant ID, which a straight pipe can't take…</span></li>
    <li><b>Functional API</b><span>Q: how do we feed numbers <em>and</em> a restaurant ID? → Wire a graph: Embedding for the ID, Concatenate, Dense: test AUC rises to about 0.84. Real data is too big for RAM…</span></li>
    <li><b>tf.data</b><span>Q: how do we stream and batch data without starving the model? → Dataset → shuffle → batch → prefetch, fed straight into fit. But fit's loop is fixed…</span></li>
    <li><b>Custom training loop</b><span>Q: what if we need our own step (GANs, odd losses)? → GradientTape + apply_gradients, line for line the PyTorch loop. The trained model then lives only in RAM…</span></li>
    <li><b>Saving &amp; serving</b><span>Q: how do we keep it and put it behind an API? → .keras to continue in Python, SavedModel (export) for TF Serving with raw features in, P(late) out. Finally: when should we choose Keras over PyTorch?</span></li>
    <li><b>Keras ↔ PyTorch</b><span>Q: how do the two map, and which to pick? → Same concepts, different names and layouts (NHWC vs NCHW): the pothole edge filter gives the same 21 in both. Pick by ecosystem and deployment target.</span></li>
  </ol>

  <h2 id="tk-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">TF &amp; Keras</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Where it fits</div>
        <ul>
          <li><b>TensorFlow</b> — engine: tensors, autodiff, graphs, devices, serving</li>
          <li><b>Keras 3</b> — high-level API on TF, JAX or PyTorch backends</li>
          <li>Meet it in production code, mobile (TFLite), browser (TF.js), TF Serving</li>
          <li>💡 Keras = automatic car, PyTorch = manual</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tensors &amp; tape</div>
        <ul>
          <li><b>tf.constant</b> immutable · <b>tf.Variable</b> weights</li>
          <li><b>GradientTape</b> records, <code>tape.gradient(loss, w)</code> replays</li>
          <li>Delay = w · 2 km, actual 4 min: (2w − 4)² at w = 3 → grad 8 → w = 2.2</li>
          <li><code>@tf.function</code> compiles to a graph</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sequential + fit</div>
        <ul>
          <li>5 order features → Normalization → Dense(16) → Dropout → Dense(1, sigmoid)</li>
          <li>Params: 11 (non-trainable stats) + 96 + 17</li>
          <li><b>compile</b>(optimizer, loss, metrics) → <b>fit</b> → <b>evaluate</b> → <b>predict</b></li>
          <li>Binary → sigmoid + binary_crossentropy; int classes → sparse_</li>
          <li>None in shapes = batch size</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Callbacks</div>
        <ul>
          <li><b>EarlyStopping</b>(patience, restore_best_weights=True)</li>
          <li><b>ModelCheckpoint</b>(save_best_only) · <b>ReduceLROnPlateau</b></li>
          <li>Asked 200 epochs; stopped early, best epoch restored</li>
          <li>⚠ validation_split takes the LAST rows, unshuffled</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Functional API</div>
        <ul>
          <li>Inputs: numeric (5) + restaurant ID (1) → Embedding(50, 4)</li>
          <li>Concatenate (9) → Dense(16) → late</li>
          <li>Test AUC: Sequential ≈ 0.74 → Functional ≈ 0.84</li>
          <li>Any DAG: multi-input, multi-output, skips, shared layers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">tf.data &amp; custom loop</div>
        <ul>
          <li>from_tensor_slices → shuffle → batch → prefetch(AUTOTUNE)</li>
          <li>Dict inputs keyed by Input names</li>
          <li>Tape loop: forward + loss in tape → gradient → apply_gradients</li>
          <li><code>training=True</code> inside custom loops</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Save &amp; serve</div>
        <ul>
          <li><b>.keras</b> — architecture + weights + optimizer (Python)</li>
          <li><b>export</b> → SavedModel → TF Serving (REST 8501, gRPC 8500), TFLite</li>
          <li>Normalization inside the model → raw features in production</li>
          <li>New version folder 2/ → hot swap</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keras ↔ PyTorch</div>
        <ul>
          <li>Dense = Linear (kernel (in, out) vs (out, in))</li>
          <li>NHWC vs NCHW; Conv2D kernel (k, k, C<sub>in</sub>, C<sub>out</sub>)</li>
          <li>from_logits=True vs CrossEntropyLoss on logits</li>
          <li>Pothole edge map identical in both: peak 21</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tk-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="tk-where"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where TF/Keras Fits</span><span class="rm-sub">vs PyTorch, Keras 3</span></div></div>
      <div class="rm-item rm-done" data-target="tk-tensor"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Tensors &amp; GradientTape</span><span class="rm-sub">One delivery gradient by hand</span></div></div>
      <div class="rm-item rm-done" data-target="tk-seq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Sequential API &amp; the Training Loop</span><span class="rm-sub">compile, fit, evaluate, predict</span></div></div>
      <div class="rm-item rm-done" data-target="tk-cb"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Callbacks</span><span class="rm-sub">Early stop, checkpoint, LR decay</span></div></div>
      <div class="rm-item rm-done" data-target="tk-func"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Functional API</span><span class="rm-sub">Numbers + restaurant ID</span></div></div>
      <div class="rm-item rm-done" data-target="tk-data"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">tf.data Pipelines</span><span class="rm-sub">Shuffle, batch, prefetch</span></div></div>
      <div class="rm-item rm-done" data-target="tk-loop"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Custom Training Loop</span><span class="rm-sub">GradientTape by hand</span></div></div>
      <div class="rm-item rm-done" data-target="tk-save"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Saving &amp; TF Serving</span><span class="rm-sub">.keras, SavedModel, REST</span></div></div>
      <div class="rm-item rm-done" data-target="tk-pt"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Keras vs PyTorch</span><span class="rm-sub">Cheat sheet, layouts, which to pick</span></div></div>
      <div class="rm-item rm-done" data-target="tk-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loop, many conveniences</span></div></div>
      <div class="rm-item rm-done" data-target="tk-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Losses, splits, early stopping</span></div></div>
      <div class="rm-item rm-done" data-target="tk-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="tk-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="tk-where"><span class="num">01</span>Where TF/Keras Fits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can already build and train networks in PyTorch. Why learn a second framework, and what exactly are "TensorFlow" and "Keras": one thing or two?</p>
  </div>
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
  <h3>The running example</h3>
  <p>The food-delivery app from the RNN and attention notes wants to warn customers before an order runs late. For every past order it knows five numbers: <strong>distance</strong> (km), number of <strong>items</strong>, the restaurant's <strong>prep time</strong> (minutes), whether it was <strong>raining</strong> (0/1), and whether it was <strong>rush hour</strong> (0/1); plus <strong>which of 50 restaurants</strong> cooked it. Label: 1 if the order arrived late. We generate 4,000 such orders with a hidden rule we know (so we can check what the models learn): late is more likely for long distances, slow kitchens, big orders, rain and rush hour, and some restaurants are always slow. Every section of this note trains or serves a model on this table.</p>
  <div class="bridge"><b>What this still can't tell us → next: Tensors &amp; GradientTape.</b> Before any model: what are TensorFlow's basic objects, where do the weights live, and how does it compute a gradient?</div>

  <h2 id="tk-tensor"><span class="num">02</span>Tensors &amp; GradientTape</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>PyTorch had tensors with <code>requires_grad</code> and <code>loss.backward()</code>. What are TensorFlow's equivalents, and can we see one gradient-descent step on a delivery number, by hand and in code?</p>
  </div>
  <p>Like PyTorch, TensorFlow needs its own array type: one that can live on a GPU and that can report gradients. NumPy arrays can do neither. TensorFlow splits the job into two types. A <strong>tf.constant</strong> is a fixed array: inputs, intermediate results. A <strong>tf.Variable</strong> is a box whose value can change: that is where weights live, because training changes them.</p>
  <p>For gradients, TensorFlow does not attach history to every tensor (PyTorch's <code>requires_grad</code>). Instead you open a <strong>GradientTape</strong> block. Every operation inside the block is recorded, and afterwards <code>tape.gradient(loss, w)</code> plays the recording backwards to give dloss/dw.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket match on TV. Normal play is not saved, but while the third umpire's recorder (the tape) is running, every ball is recorded, and afterwards it can be replayed backwards to see exactly what caused the wicket. <code>tape.gradient</code> is that replay.</p>
  </div>
  <p>Worked example by hand, on the smallest possible delivery model: delay (minutes) = w × distance. One order was 2 km away and arrived 4 minutes late, so the prediction is 2w and the squared-error loss is (2w − 4)². Start at w = 3 minutes per km. Forward: 2·3 − 4 = 2, squared = 4. Derivative: 2·(2w − 4)·2 = 4(2w − 4) = 4·2 = 8. One gradient-descent step with learning rate 0.1: w = 3 − 0.1·8 = 2.2, which moves w toward the answer 2 minutes per km, where the loss is 0.</p>

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
  <div class="bridge"><b>What this still can't tell us → next: The Sequential API.</b> One weight, one tape, one step by hand works. Our real model has a hundred weights, thousands of orders, batches, epochs and metrics. Writing that loop every time is the boilerplate Keras removes.</div>

  <h2 id="tk-seq"><span class="num">03</span>Sequential API &amp; the Training Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we go from one hand-made gradient step to a full model on 4,000 orders (batches, epochs, a loss, accuracy and AUC) without writing the training loop ourselves?</p>
  </div>
  <p>In PyTorch you write the training loop yourself every time: zero grads, forward, loss, backward, step, plus batching, shuffling, validation and logging. For a standard model that is 30 lines of boilerplate that are the same in every project, and each line is a chance for a bug. Keras packs all of it into three calls.</p>
  <p>In plain words: <strong>build</strong> the model as a list of layers (<code>Sequential</code>), <strong>compile</strong> it (choose optimizer, loss and metrics; nothing trains yet), then <strong>fit</strong> (runs the loop for many epochs). Afterwards <code>evaluate</code> gives test metrics and <code>predict</code> gives outputs for new rows.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Ordering a thali at a restaurant. You choose the items (layers), tell the waiter your preferences (compile: spicy or not, which drink), and the kitchen does everything else (fit). PyTorch is cooking it yourself at home.</p></div>
  <div class="flow"><span>Define layers</span><span>compile (optimizer, loss, metrics)</span><span>fit</span><span>evaluate</span><span>predict</span></div>
  <p>First the data. The five features have very different scales (distance up to 10, prep time around 15, rain 0 or 1), and networks train badly on unscaled inputs, so the first layer of the model will be a <strong>Normalization</strong> layer that subtracts each feature's mean and divides by its standard deviation. <code>adapt(X_tr)</code> computes those from the training rows only. We keep the first 3,200 orders for training and the last 800 for testing.</p>
<div class="fx" data-lang="py">from keras import layers
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(0)
n = 4000
dist  = rng.uniform(0.5, 10, n).round(1)           # km from restaurant to customer
items = rng.integers(1, 9, n)                      # items in the order
prep  = rng.normal(15, 5, n).clip(3, 40).round()   # restaurant prep time, minutes
rain  = (rng.random(n) &lt; 0.2).astype(int)          # raining at order time?
rush  = (rng.random(n) &lt; 0.3).astype(int)          # lunch/dinner rush hour?
restaurant  = rng.integers(0, 50, n)               # which of 50 restaurants
rest_effect = rng.normal(0, 1.2, 50)               # hidden: some kitchens are always slow
numeric_rule = 0.35*(dist - 5) + 0.08*(prep - 15) + 0.15*(items - 4) + 1.0*rain + 0.8*rush
logit = -1.0 + numeric_rule + rest_effect[restaurant]
late = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype("float32")   # 1 = arrived late
X = np.column_stack([dist, items, prep, rain, rush]).astype("float32")
X_tr, X_te, y_tr, y_te = X[:3200], X[3200:], late[:3200], late[3200:]
r_tr, r_te = restaurant[:3200], restaurant[3200:]
print(X.shape, "late rate", late.mean().round(3))
print("order 0:", X[0], "late =", late[0])
print("train means", X_tr.mean(0).round(1), " stds", X_tr.std(0).round(1))</div>
  <div class="fx" data-lang="text">(4000, 5) late rate 0.416
order 0: [ 6.6  5.  12.   0.   1. ] late = 1.0
train means [ 5.2  4.5 15.2  0.2  0.3]  stds [2.7 2.3 5.  0.4 0.5]</div>
  <p>4,000 orders, 42% of them late. Order 0 was 6.6 km away, 5 items, 12 minutes of prep, no rain, at rush hour. The means and spreads differ a lot between columns, which is why we normalise. Shape trace for a batch of 32 orders through the model: (32, 5) → Normalization (32, 5) → Dense(16, ReLU) (32, 16) → Dropout (32, 16) → Dense(1, sigmoid) (32, 1): one probability of "late" per order. Params: Dense(16) has 5·16 weights + 16 biases = 96; Dense(1) has 16 + 1 = 17; Normalization stores 5 means + 5 variances + 1 count = 11.</p>
<div class="fx" data-lang="py">def make_seq():
    keras.utils.set_random_seed(0)
    norm = layers.Normalization()
    norm.adapt(X_tr)                     # learns mean/std from TRAIN only; saved inside the model
    m = keras.Sequential([
        keras.Input(shape=(5,)),         # one order = 5 numbers; batch size left open
        norm,
        layers.Dense(16, activation="relu"),
        layers.Dropout(0.2),
        layers.Dense(1, activation="sigmoid"),
    ])
    m.compile(optimizer=keras.optimizers.Adam(1e-3),
              loss="binary_crossentropy",
              metrics=["accuracy", keras.metrics.AUC(name="auc")])
    return m
model = make_seq()
print(model.layers[0](X_tr[:200]).numpy().mean(0).round(2))   # normalised means ~ 0
model.summary()
print(model(X_te[:4]).shape)</div>
  <div class="fx" data-lang="text">[ 0.15  0.    0.03  0.04 -0.13]
Model: "sequential"
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┓
┃ Layer (type)                    ┃ Output Shape           ┃       Param # ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━┩
│ normalization (Normalization)   │ (None, 5)              │            11 │
├─────────────────────────────────┼────────────────────────┼───────────────┤
│ dense (Dense)                   │ (None, 16)             │            96 │
├─────────────────────────────────┼────────────────────────┼───────────────┤
│ dropout (Dropout)               │ (None, 16)             │             0 │
├─────────────────────────────────┼────────────────────────┼───────────────┤
│ dense_1 (Dense)                 │ (None, 1)              │            17 │
└─────────────────────────────────┴────────────────────────┴───────────────┘
 Total params: 124 (500.00 B)
 Trainable params: 113 (452.00 B)
 Non-trainable params: 11 (48.00 B)
(4, 1)</div>
  <p>Reading the output: after the Normalization layer the feature means are near 0 (on a 200-row sample). In the summary, <strong>None</strong> is the batch dimension: the model accepts any number of orders, and calling it on 4 gave (4, 1). The 11 Normalization params were learned by <code>adapt</code>, not by training, so they are "non-trainable". Nothing has been trained yet: <code>compile</code> only attached the optimizer, the loss and the metrics. Now the three calls that do the work:</p>
<div class="fx" data-lang="py">hist = model.fit(X_tr, y_tr, validation_split=0.2, epochs=20, batch_size=32, verbose=0)
h = hist.history                                         # dict: one list per metric
print(sorted(h))
for ep in (1, 5, 20):
    print(f"epoch {ep:2d}  loss {h['loss'][ep-1]:.3f}  val_loss {h['val_loss'][ep-1]:.3f}  val_auc {h['val_auc'][ep-1]:.3f}")
print({k: round(v, 3) for k, v in model.evaluate(X_te, y_te, verbose=0, return_dict=True).items()})
p = model.predict(X_te[:3], verbose=0).ravel()
print("P(late) for 3 test orders:", p.round(3), " actual:", y_te[:3])</div>
  <div class="fx" data-lang="text">['accuracy', 'auc', 'loss', 'val_accuracy', 'val_auc', 'val_loss']
epoch  1  loss 0.819  val_loss 0.751  val_auc 0.411
epoch  5  loss 0.623  val_loss 0.595  val_auc 0.751
epoch 20  loss 0.591  val_loss 0.577  val_auc 0.758
{'accuracy': 0.696, 'auc': 0.739, 'loss': 0.589}
P(late) for 3 test orders: [0.264 0.568 0.359]  actual: [1. 0. 0.]</div>
  <p>What happened: <code>validation_split=0.2</code> held back the last 640 of the 3,200 training orders; each epoch went through the other 2,560 in batches of 32 (80 batches) and then scored the 640. <code>fit</code> returned a <strong>History</strong> whose <code>history</code> dict holds one list per metric, with <code>val_</code> versions for validation. <code>evaluate</code> scored the 800 unseen test orders, and <code>predict</code> returned probabilities of "late" for three new orders. That is the entire PyTorch loop of zero_grad, forward, loss, backward, step, batching and validation, in three calls.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Callbacks.</b> We guessed 20 epochs. Too few under-trains, too many overfits; and if the machine dies at epoch 19 we lose everything. How do we let training decide when to stop and keep the best model?</div>

  <h2 id="tk-cb"><span class="num">04</span>Callbacks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We picked 20 epochs by guessing. How do we stop exactly when validation loss stops improving, save the best version along the way, and slow the learning rate down when progress stalls, without babysitting the logs?</p>
  </div>
  <p>How many epochs should you train? Too few and the model is under-trained; too many and it starts memorising the training rows, so validation loss rises (overfitting). You cannot know the right number in advance. You also want to save the best model as you go, in case the machine dies, and to lower the learning rate when progress stalls. Doing this by hand means watching the logs for hours.</p>
  <p>A <strong>callback</strong> is a small object that <code>fit()</code> calls at fixed moments (end of each epoch or batch) so it can watch the numbers and act. You list them once, and they run automatically.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pressure cooker. You do not stand next to it counting minutes. The whistle (EarlyStopping) tells you when it is done, the safety valve (ReduceLROnPlateau) eases the pressure when needed, and you keep the best batch aside (ModelCheckpoint).</p></div>
  <p>The three you will use on every project, with the rule each one follows: <strong>EarlyStopping</strong>(patience 10): if val loss has not improved for 10 epochs in a row, stop, and roll back to the best epoch's weights. <strong>ModelCheckpoint</strong>: whenever val loss improves, write the model to <code>best.keras</code>. <strong>ReduceLROnPlateau</strong>(factor 0.5, patience 4): if val loss has not improved for 4 epochs, halve the learning rate.</p>
<div class="fx" data-lang="py">model = make_seq()                                         # fresh, untrained model
callbacks = [
    keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True),
    keras.callbacks.ModelCheckpoint("best.keras", monitor="val_loss", save_best_only=True),
    keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4, min_lr=1e-5),
]
hist = model.fit(X_tr, y_tr, validation_split=0.2, epochs=200, batch_size=32,
                 callbacks=callbacks, verbose=0)
h = hist.history
print("epochs run:", len(h["loss"]), " best epoch:", int(np.argmin(h["val_loss"])) + 1)
print("learning rate per epoch (changes only):",
      [(i + 1, float(lr)) for i, lr in enumerate(h["learning_rate"]) if i == 0 or lr != h["learning_rate"][i - 1]])
seq_res = model.evaluate(X_te, y_te, verbose=0, return_dict=True)
print({k: round(v, 3) for k, v in seq_res.items()})
print("AUC of the TRUE numeric rule on test:", round(roc_auc_score(y_te, numeric_rule[3200:]), 3))</div>
  <div class="fx" data-lang="text">epochs run: 38  best epoch: 28
learning rate per epoch (changes only): [(1, 0.0010000000474974513), (29, 0.0005000000237487257), (33, 0.0002500000118743628), (37, 0.0001250000059371814)]
{'accuracy': 0.702, 'auc': 0.738, 'loss': 0.589}
AUC of the TRUE numeric rule on test: 0.739</div>

  <p>What happened, step by step: we asked for 200 epochs. Each epoch ended with a validation loss; EarlyStopping remembered the best one and counted the epochs without improvement. After 10 non-improving epochs in a row it stopped and restored the best epoch's weights. Along the way ReduceLROnPlateau halved the learning rate whenever validation loss stalled for 4 epochs (the list shows each change), and ModelCheckpoint kept rewriting <code>best.keras</code>. On the 800 unseen test orders the model reaches the AUC printed above. Compare the last line: the AUC of the <em>true</em> rule we used to generate the data, using only the five numbers. The model is as good as any formula on those five numbers can be. Whatever is left is in the restaurant ID, which this model never sees.</p>
<figure class="viz"><svg viewBox="0 0 560 210" width="560">
<line x1="50" y1="170" x2="540" y2="170" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="170" stroke="currentColor"/>
<text x="44" y="24" text-anchor="end" class="tm">0.82</text><text x="44" y="174" text-anchor="end" class="tm">0.55</text>
<polyline points="50,20 63,70 76,98 90,116 103,128 116,134 129,135 143,138 156,140 169,138 182,139 196,145 209,142 222,143 235,143 249,142 262,141 275,143 288,144 302,146 315,147 328,144 341,146 355,146 368,146 381,146 394,147 408,147 421,144 434,144 447,149 461,149 474,148 487,146 500,146 514,147 527,146 540,147" fill="none" class="sb" stroke-width="2"/>
<polyline points="50,58 63,96 76,120 90,135 103,144 116,148 129,150 143,152 156,152 169,153 182,153 196,153 209,153 222,153 235,154 249,154 262,153 275,153 288,154 302,154 315,154 328,154 341,154 355,154 368,154 381,154 394,154 408,154 421,154 434,154 447,154 461,154 474,154 487,154 500,154 514,154 527,154 540,154" fill="none" class="sr" stroke-width="2"/>
<line x1="408" y1="20" x2="408" y2="170" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="404" y="34" text-anchor="end" class="tg">best val_loss (epoch 28) restored</text>
<text x="536" y="60" text-anchor="end" class="tm">stopped at 38 (patience 10)</text>
<text x="50" y="200" class="tm">epoch 1</text><text x="540" y="200" text-anchor="end" class="tm">epoch 38</text>
<text x="200" y="200" class="tb">— train loss</text><text x="320" y="200" class="tr">— val loss</text>
</svg><figcaption>Real loss history of this run (y axis zoomed to 0.55–0.82). Asked for 200 epochs; stopped at 38 and rolled back to epoch 28's weights.</figcaption></figure>
  <div class="cards">
    <div><b>EarlyStopping</b><p>Stop when val metric stops improving for <code>patience</code> epochs.</p><small>Set <code>restore_best_weights=True</code></small></div>
    <div><b>ModelCheckpoint</b><p>Save the model (or best one) to disk during training.</p><small>Survives crashes and preemption</small></div>
    <div><b>ReduceLROnPlateau</b><p>Halve the learning rate when progress stalls.</p><small>Smaller steps near the minimum</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Callback</strong>: an object with hooks like <code>on_epoch_end</code> that <code>fit()</code> calls during training. <strong>Patience</strong>: how many non-improving epochs to tolerate before acting. You can write your own by subclassing <code>keras.callbacks.Callback</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>validation_split</code> takes the <em>last</em> 20% of rows without shuffling. If data is sorted (by label or by time), validation is skewed. Shuffle first (our <code>train_test_split</code> already did) or pass <code>validation_data=</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Functional API.</b> The model has squeezed everything out of the five numbers (it matches the true numeric rule). The remaining signal is "which restaurant cooked it", a category with 50 values that needs its own branch. A Sequential model is one straight pipe with one input.</div>

  <h2 id="tk-func"><span class="num">05</span>Functional API</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Some kitchens are always slow. How do we give the model both the five order numbers and the restaurant ID, treat the ID differently (it is a name, not a quantity), and merge the two?</p>
  </div>
  <p>Sequential is a single straight pipe: one input, layers one after another, one output. Our problem is not: the five numbers go through normalisation, but restaurant 37 is not "bigger" than restaurant 2, so the ID needs different treatment, and then the two branches must merge.</p>
  <p>The <strong>Functional API</strong> lets you wire layers like a diagram. Create the inputs, call each layer on a tensor like a function to get a new tensor, and finally tell Keras which tensors are the inputs and which is the output.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A plumbing diagram instead of one straight pipe. Two water sources (inputs) run through different filters, join at a T-joint (Concatenate), then flow through the main pipe to one tap (output). You draw the diagram by connecting pieces.</p></div>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
<defs><marker id="tk-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<rect x="5" y="20" width="120" height="36" class="fb sb"/><text x="65" y="43" text-anchor="middle">numeric (5)</text>
<rect x="5" y="104" width="120" height="36" class="fb sb"/><text x="65" y="127" text-anchor="middle">restaurant (1)</text>
<rect x="150" y="104" width="110" height="36" class="fv"/><text x="205" y="127" text-anchor="middle">Embedding → 4</text>
<rect x="290" y="62" width="100" height="36" class="ft st"/><text x="340" y="85" text-anchor="middle">Concat (9)</text>
<rect x="415" y="62" width="70" height="36" class="fs" stroke="currentColor"/><text x="450" y="85" text-anchor="middle">Dense 16</text>
<rect x="505" y="62" width="50" height="36" class="fg sg"/><text x="530" y="85" text-anchor="middle">late</text>
<path d="M127,38 L270,38 L288,70" fill="none" stroke="currentColor" marker-end="url(#tk-ar)"/>
<line x1="127" y1="122" x2="147" y2="122" stroke="currentColor" marker-end="url(#tk-ar)"/>
<path d="M262,122 L272,122 L288,92" fill="none" stroke="currentColor" marker-end="url(#tk-ar)"/>
<line x1="392" y1="80" x2="412" y2="80" stroke="currentColor" marker-end="url(#tk-ar)"/>
<line x1="487" y1="80" x2="502" y2="80" stroke="currentColor" marker-end="url(#tk-ar)"/>
<text x="5" y="165" class="tm">a graph: branches, merges, many inputs/outputs</text>
</svg><figcaption>Two inputs of different types, merged. Sequential cannot express this.</figcaption></figure>
  <p>The restaurant branch uses an <strong>Embedding</strong>: a lookup table with one learned row of 4 numbers per restaurant. Restaurant 37 → row 37. Training moves each restaurant's row so that kitchens with similar lateness get similar vectors. Shape trace: restaurant (None, 1) → Embedding (None, 1, 4) → Flatten (None, 4) → Concatenate with the normalised numbers (None, 5) → (None, 9) → Dense (None, 16) → late (None, 1). Params: Normalization 11 (non-trainable), embedding 50·4 = 200, Dense 9·16 + 16 = 160, late 16 + 1 = 17: 377 trainable.</p>
<div class="fx" data-lang="py">keras.utils.set_random_seed(0)
num_in  = keras.Input(shape=(5,), name="numeric")
rest_in = keras.Input(shape=(1,), dtype="int32", name="restaurant")
norm2 = layers.Normalization(); norm2.adapt(X_tr)
x = norm2(num_in)                                            # numeric branch
r = layers.Embedding(input_dim=50, output_dim=4)(rest_in)    # restaurant branch
print(r.shape)
r = layers.Flatten()(r)
z = layers.Concatenate()([x, r])                             # merge
print(r.shape, z.shape)
z = layers.Dense(16, activation="relu")(z)
out = layers.Dense(1, activation="sigmoid", name="late")(z)
late_model = keras.Model(inputs=[num_in, rest_in], outputs=out)
late_model.compile("adam", "binary_crossentropy", metrics=[keras.metrics.AUC(name="auc")])
late_model.summary()</div>
  <div class="fx" data-lang="text">(None, 1, 4)
(None, 4) (None, 9)
Model: "functional_2"
┏━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┓
┃ Layer (type)        ┃ Output Shape      ┃    Param # ┃ Connected to      ┃
┡━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━┩
│ restaurant          │ (None, 1)         │          0 │ -                 │
│ (InputLayer)        │                   │            │                   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ numeric             │ (None, 5)         │          0 │ -                 │
│ (InputLayer)        │                   │            │                   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ embedding           │ (None, 1, 4)      │        200 │ restaurant[0][0]  │
│ (Embedding)         │                   │            │                   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ normalization_2     │ (None, 5)         │         11 │ numeric[0][0]     │
│ (Normalization)     │                   │            │                   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ flatten (Flatten)   │ (None, 4)         │          0 │ embedding[0][0]   │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ concatenate         │ (None, 9)         │          0 │ normalization_2[… │
│ (Concatenate)       │                   │            │ flatten[0][0]     │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ dense_4 (Dense)     │ (None, 16)        │        160 │ concatenate[0][0] │
├─────────────────────┼───────────────────┼────────────┼───────────────────┤
│ late (Dense)        │ (None, 1)         │         17 │ dense_4[0][0]     │
└─────────────────────┴───────────────────┴────────────┴───────────────────┘
 Total params: 388 (1.52 KB)
 Trainable params: 377 (1.47 KB)
 Non-trainable params: 11 (48.00 B)</div>
  <p>What happened: before any data flows, each layer call already returned a "symbolic" tensor with a known shape, which is how we could print (None, 1, 4) and (None, 9) while building. The summary's "Connected to" column shows the graph: <code>concatenate</code> takes two inputs, the normalised numbers and the flattened embedding. The parameter counts match the hand calculation. Training it is the next section, together with tf.data.</p>
  <div class="cards">
    <div><b>Sequential</b><p>Single stack.</p><small>MLPs, simple CNNs</small></div>
    <div><b>Functional</b><p>Any graph (DAG) of layers.</p><small>Multi-input, skip connections, multi-task heads</small></div>
    <div><b>Subclassing</b><p><code>class M(keras.Model)</code> with <code>call()</code>.</p><small>Dynamic logic; PyTorch-like; harder to inspect/serialize</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Functional API</strong>: build a model by calling layers on symbolic tensors from <code>keras.Input</code>, then <code>keras.Model(inputs, outputs)</code>. <strong>Embedding</strong>: a trainable lookup table mapping an integer ID to a dense vector; params = number of IDs × vector size.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Feeding a category ID as a plain number (restaurant 37 as the value 37.0 into a Dense layer) tells the model that restaurant 37 is "37 times" restaurant 1. Use an Embedding (many categories) or one-hot encoding (few categories).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: tf.data.</b> The model takes a dictionary of two inputs. Our 4,000 orders fit in RAM, but the app's real log has crores of orders on disk. How do we stream, shuffle and batch them, and feed two named inputs?</div>

  <h2 id="tk-data"><span class="num">06</span>tf.data Pipelines</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we feed a model from data that is too big for memory, keep the processor busy while the next batch is prepared, and deliver each batch as a dictionary matching the model's named inputs?</p>
  </div>
  <p>So far the data sat in NumPy arrays in RAM. Real image or log datasets are often 100 GB of files: they do not fit in memory, and reading and decoding them is slow. If the GPU has to wait for the CPU to prepare each batch, an expensive GPU sits idle half the time. <strong>tf.data</strong> builds a pipeline that streams data from disk and prepares the next batch while the current one trains (Keras's version of PyTorch's Dataset + DataLoader).</p>
  <p>In plain words: start from a source (arrays, files, TFRecord files), then chain steps: <code>map</code> (parse or augment each example), <code>shuffle</code>, <code>batch</code>, <code>prefetch</code> (get the next batch ready in the background). The result is a Dataset you pass straight to <code>fit</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A railway station canteen at lunch. One person cuts vegetables, one cooks, one packs, and while you eat thali number 1, thali number 2 is already being packed (prefetch). Nobody waits for the whole order to finish before starting the next.</p></div>
  <div class="flow"><span>Source (arrays, files, TFRecord)</span><span>map (parse, augment)</span><span>shuffle</span><span>batch</span><span>prefetch</span><span>model.fit</span></div>
  <p>For the two-input model, each example must be a pair (inputs, label) where inputs is a dict whose keys match the <code>Input</code> names. Shape trace: one example is {"numeric": (5,), "restaurant": (1,)} and a label (); after <code>batch(64)</code> a batch is {"numeric": (64, 5), "restaurant": (64, 1)} and (64,). 2,560 training orders / 64 = 40 batches. The other 640 training orders are validation; the 800 test orders stay untouched.</p>
<div class="fx" data-lang="py">ds = tf.data.Dataset.from_tensor_slices(
        ({"numeric": X_tr, "restaurant": r_tr[:, None].astype("int32")}, y_tr))   # keys = Input names
print(ds.element_spec)
train_ds = ds.take(2560).shuffle(2560, seed=0).batch(64).prefetch(tf.data.AUTOTUNE)
val_ds   = ds.skip(2560).batch(256).prefetch(tf.data.AUTOTUNE)
xb, yb = next(iter(train_ds))
print(xb["numeric"].shape, xb["restaurant"].shape, yb.shape, len(list(train_ds)))
hist2 = late_model.fit(train_ds, validation_data=val_ds, epochs=15, verbose=0)
print(f"val_auc after 1 epoch {hist2.history['val_auc'][0]:.3f}, after 15: {hist2.history['val_auc'][-1]:.3f}")
p_func = late_model.predict({"numeric": X_te, "restaurant": r_te[:, None]}, verbose=0).ravel()
print("test AUC  Sequential (numbers only):", round(seq_res["auc"], 3),
      "| Functional (+ restaurant):", round(roc_auc_score(y_te, p_func), 3))
print("true rule AUC  numbers only:", round(roc_auc_score(y_te, numeric_rule[3200:]), 3),
      "| numbers + restaurant effect:", round(roc_auc_score(y_te, (numeric_rule + rest_effect[restaurant])[3200:]), 3))</div>
  <div class="fx" data-lang="text">({'numeric': TensorSpec(shape=(5,), dtype=tf.float32, name=None), 'restaurant': TensorSpec(shape=(1,), dtype=tf.int32, name=None)}, TensorSpec(shape=(), dtype=tf.float32, name=None))
(64, 5) (64, 1) (64,) 40
val_auc after 1 epoch 0.676, after 15: 0.824
test AUC  Sequential (numbers only): 0.738 | Functional (+ restaurant): 0.837
true rule AUC  numbers only: 0.739 | numbers + restaurant effect: 0.846</div>
  <p>What happened: <code>from_tensor_slices</code> cut the arrays into 3,200 single examples; <code>element_spec</code> shows one example's shapes, matching the trace. <code>take(2560)</code>/<code>skip(2560)</code> split train and validation. The first batch has the expected shapes, and there are 40 batches. On the test orders the Functional model beats the Sequential one by a wide margin, and it gets close to the best possible score, the AUC of the true rule including each restaurant's hidden slowness. The Embedding learned "which kitchens are slow" from nothing but restaurant IDs.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>tf.data.Dataset</strong>: a lazy, streaming sequence of examples with chainable transformations. <strong>prefetch(AUTOTUNE)</strong>: prepare upcoming batches in the background, with TensorFlow choosing the buffer size. <strong>TFRecord</strong>: TensorFlow's binary file format for large datasets.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shuffle <em>before</em> batch (else you only shuffle the order of whole batches), and give shuffle a buffer about the size of the dataset (a buffer of 100 on 1M sorted rows barely shuffles). With a Dataset, <code>fit(shuffle=True)</code> is ignored and <code>batch_size</code> must not be passed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A custom training loop.</b> <code>fit</code> ran the whole loop for us. Some models need a training step that <code>fit</code> cannot express (two optimizers, extra losses, gradient tricks). Can we take the wheel?</div>

  <h2 id="tk-loop"><span class="num">07</span>Custom Training Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If <code>fit()</code>'s fixed loop doesn't fit the problem, how do we write the step ourselves in Keras, and how close is it to the PyTorch loop we already know?</p>
  </div>
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
  <p>Here the model ends in Dense(1) with no sigmoid, so it outputs logits and the loss uses <code>from_logits=True</code>. Shape trace per step: a batch of orders x (32, 5) → logits (32, 1); labels y (32,) are reshaped to (32, 1) with <code>yb[:, None]</code> so both shapes match. It is the gradient step of section 02, now for all weights at once.</p>
<div class="fx" data-lang="py">keras.utils.set_random_seed(0)
norm3 = layers.Normalization(); norm3.adapt(X_tr)
tape_model = keras.Sequential([keras.Input(shape=(5,)), norm3,
                               layers.Dense(16, activation="relu"), layers.Dense(1)])   # logits
loss_fn = keras.losses.BinaryCrossentropy(from_logits=True)
opt = keras.optimizers.Adam(1e-3)
ds = tf.data.Dataset.from_tensor_slices((X_tr, y_tr)).shuffle(len(X_tr), seed=0).batch(32)

@tf.function                                             # compile the step into a graph
def train_step(xb, yb):
    with tf.GradientTape() as tape:
        logits = tape_model(xb, training=True)           # (32, 1); training=True: dropout/BN on
        loss = loss_fn(yb[:, None], logits)
    grads = tape.gradient(loss, tape_model.trainable_variables)
    opt.apply_gradients(zip(grads, tape_model.trainable_variables))
    return loss

for epoch in range(1, 21):
    for xb, yb in ds:
        loss = train_step(xb, yb)
    if epoch in (1, 5, 20):
        p = tf.sigmoid(tape_model(X_te)).numpy().ravel()
        print(f"epoch {epoch:2d}  last batch loss {float(loss):.4f}  test acc {((p &gt; 0.5) == y_te).mean():.3f}"
              f"  test AUC {roc_auc_score(y_te, p):.3f}")
print(len(tape_model.trainable_variables), [tuple(v.shape) for v in tape_model.trainable_variables])</div>
  <div class="fx" data-lang="text">epoch  1  last batch loss 0.6437  test acc 0.627  test AUC 0.644
epoch  5  last batch loss 0.5449  test acc 0.689  test AUC 0.737
epoch 20  last batch loss 0.5102  test acc 0.704  test AUC 0.740
4 [(5, 16), (16,), (16, 1), (1,)]</div>
  <p>What happened: the hand-written loop trains the same kind of model as <code>fit()</code> did in section 03 and ends at a similar test AUC. <code>tape_model.trainable_variables</code> lists exactly four tensors: the Dense(16) kernel (5, 16) and bias (16,), and the Dense(1) kernel (16, 1) and bias (1,). The Normalization statistics are not in the list, so the optimizer never touches them. Note that Keras stores Dense weights as (in, out), the transpose of PyTorch's (out, in). <code>tf.sigmoid</code> converts logits to probabilities for the metrics.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Custom training loop</strong>: replacing <code>fit()</code> with your own iteration over batches using <code>GradientTape</code> and <code>optimizer.apply_gradients</code>. Middle ground: subclass <code>keras.Model</code> and override <code>train_step</code>, which keeps <code>fit()</code>'s callbacks and logging.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>training=True</code> when calling the model inside your loop: dropout and BatchNorm then behave as at prediction time, and the model trains differently from <code>fit()</code>. Also, Python side effects (print, list appends) inside a <code>@tf.function</code> run only once, at tracing time.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Saving &amp; serving.</b> All our models live in RAM and vanish when Python exits. How do we keep one, and how does the delivery app call it to show "your order may be late"?</div>

  <h2 id="tk-save"><span class="num">08</span>Saving &amp; TF Serving</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we save the trained late-order model so we can keep training it later, and separately package it so the app's backend can get P(late) for a new order without our Python training code?</p>
  </div>
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
  <p>Using the Sequential <code>model</code> trained with callbacks in section 04: save, reload, check predictions are identical, export, and then load the export <em>with plain TensorFlow</em>, without Keras, as a server would.</p>
<div class="fx" data-lang="py">model.save("late.keras")
loaded = keras.models.load_model("late.keras")
print("same predictions:", np.allclose(loaded.predict(X_te, verbose=0), model.predict(X_te, verbose=0)))
model.export("export/late/1", verbose=False)      # version folder "1" is what TF Serving expects
print(sorted(os.listdir("export/late/1")))
served = tf.saved_model.load("export/late/1")     # no Keras model code involved
sig = served.signatures["serving_default"]
print("input :", sig.structured_input_signature[1])
print("output:", sig.structured_outputs)
p_served = served.serve(X_te[:3]).numpy().ravel()
print(p_served.round(6), " same as predict:", np.allclose(p_served, model.predict(X_te[:3], verbose=0).ravel()))</div>
  <div class="fx" data-lang="text">same predictions: True
['assets', 'fingerprint.pb', 'saved_model.pb', 'variables']
input : {'keras_tensor_5': TensorSpec(shape=(None, 5), dtype=tf.float32, name='keras_tensor_5')}
output: {'output_0': TensorSpec(shape=(None, 1), dtype=tf.float32, name='output_0')}
[0.258185 0.527759 0.327697]  same as predict: True</div>

  <p>What happened: the reloaded model gives identical predictions. The exported <strong>signature</strong> says: input (None, 5) float32, i.e. any number of orders with 5 raw features each; output (None, 1). The folder holds the graph (<code>saved_model.pb</code>) and the weights (<code>variables/</code>). Loading it with <code>tf.saved_model.load</code> and calling <code>serve</code> gives the same probabilities as <code>predict</code>. Because the Normalization layer is inside the graph, the server receives <em>raw</em> features (km, items, minutes, 0/1, 0/1) and scales them itself.</p>
  <h3>TF Serving: a model server with no Python code</h3>
  <p>TF Serving is a ready-made C++ server, usually run as a Docker container. You point it at the export folder; it exposes a REST endpoint on port 8501 and gRPC on 8500. The commands below need Docker, which this sandbox does not have, so the responses are <strong>example output</strong>, written to match the predictions above.</p>
  <div class="flow"><span>export/late/1/</span><span>tensorflow/serving container</span><span>REST :8501 / gRPC :8500</span><span>Client POST JSON</span></div>
  <div class="fx" data-lang="text">docker run -d --rm -p 8501:8501 \\
  -v "$PWD/export/late:/models/late" -e MODEL_NAME=late tensorflow/serving

curl -s localhost:8501/v1/models/late                  # health / version status
curl -s -X POST localhost:8501/v1/models/late:predict \\
     -d @req.json                                        # {"instances": [[5 floats], ...]}</div>
  <div class="fx" data-lang="text">example output:
{"model_version_status": [{"version": "1", "state": "AVAILABLE", ...}]}
{
    "predictions": [[0.258185], [0.527759], [0.327697]]
}</div>
  <p>Drop a folder <code>2/</code> next to <code>1/</code> and the server loads it and switches to the new version with no restart (by default it serves the highest version number).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>SavedModel</strong>: TensorFlow's serialized graph + variables + signatures. <strong>Signature</strong>: the named entry point with fixed input/output shapes and dtypes. <strong>Training/serving skew</strong>: when the server preprocesses data differently from training, so the model sees different inputs in production.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Scaling features with scikit-learn's StandardScaler outside the model, then forgetting (or re-implementing slightly differently) the same scaling in the API code. Predictions silently go wrong. Putting the Normalization layer inside the model ships the scaling with the graph.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Keras vs PyTorch.</b> We have built, trained, saved and served a model in Keras. How does each piece map to PyTorch, where do the two disagree (layouts, logits), and which should you choose for a project?</div>

  <h2 id="tk-pt"><span class="num">09</span>Keras vs PyTorch: Cheat Sheet &amp; Which to Use</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Everything in this note has a PyTorch twin. What are the exact name and convention differences, do they really compute the same numbers, and when is each framework the better choice?</p>
  </div>
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
  <h3>The pothole filter, in both frameworks</h3>
  <p>The <a class="xref" data-note="dl_cnns">CNN note</a> slid an edge filter over a 5 × 5 road patch and got a peak of 21 at the pothole's left rim. The same two filters (vertical and horizontal edges) in a Keras <code>Conv2D</code> must give the same maps. Two conventions differ: the input is (batch, height, width, <em>channels</em>), so the patch becomes (1, 5, 5, 1); and the kernel is stored as (k, k, C<sub>in</sub>, C<sub>out</sub>) = (3, 3, 1, 2), where PyTorch uses (2, 1, 3, 3).</p>
<div class="fx" data-lang="py">patch = np.array([[8, 8, 8, 8, 8],
                  [8, 8, 2, 1, 8],
                  [8, 1, 0, 1, 8],
                  [8, 8, 1, 2, 8],
                  [8, 8, 8, 8, 8]], dtype="float32")        # the CNN note's road patch
K_edge = np.array([[1, 0, -1]] * 3, dtype="float32")       # left minus right
pothole = keras.Sequential([keras.Input(shape=(5, 5, 1)), layers.Conv2D(2, 3, use_bias=False)])
conv = pothole.layers[0]
print("Keras kernel shape", tuple(conv.kernel.shape), "(k, k, C_in, C_out)")
conv.kernel.assign(np.stack([K_edge, K_edge.T], axis=-1)[:, :, None, :])   # (3, 3, 1, 2)
x_nhwc = patch[None, :, :, None]                            # (1, 5, 5, 1): channels LAST
maps = pothole(x_nhwc).numpy()
print("input", x_nhwc.shape, "-&gt; output", maps.shape)
print("vertical-edge map\\n", maps[0, :, :, 0].astype(int))
print("horizontal-edge map\\n", maps[0, :, :, 1].astype(int))</div>
  <div class="fx" data-lang="text">Keras kernel shape (3, 3, 1, 2) (k, k, C_in, C_out)
input (1, 5, 5, 1) -&gt; output (1, 3, 3, 2)
vertical-edge map
 [[ 14   7 -14]
 [ 21  13 -21]
 [ 15   6 -15]]
horizontal-edge map
 [[ 15  22  15]
 [  1   0   0]
 [-15 -22 -15]]</div>
  <p>Both maps are exactly the CNN note's: [[14, 7, −14], [21, 13, −21], [15, 6, −15]] for vertical edges and the top/bottom rims for horizontal ones. Same maths, different layout: the channel axis is last in input and output, and the filters are indexed last in the kernel. Forgetting this when porting weights gives garbage without any error.</p>
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
  <p>Every shape and count matches the hand calculation, and a batch of 8 images gives (8, 10) logits. <code>padding="same"</code> is Keras's name for "pad so the size stays the same" (PyTorch: <code>padding=1</code> for a 3 × 3 kernel). The same network in PyTorch is in <a class="xref" data-note="dl_cnns">CNNs</a>, section 07.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>NCHW</strong>: (batch, channels, height, width), PyTorch's default. <strong>NHWC</strong>: (batch, height, width, channels), Keras/TensorFlow's default and how image files are stored.</p></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PyTorch's <code>CrossEntropyLoss</code> applies softmax itself; Keras losses expect probabilities unless <code>from_logits=True</code>. Porting a model and adding/removing a softmax silently breaks training. Also BatchNorm momentum is defined the other way round: PyTorch 0.1 ≈ Keras 0.9.</p>
  </div>
  <h3>Which one should you pick?</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Pick</th><th>Why</th></tr>
    <tr><td>Fine-tuning LLMs, Hugging Face, reproducing a recent paper</td><td>PyTorch</td><td>Most new model code and checkpoints are PyTorch first</td></tr>
    <tr><td>A standard model on tabular or image data, quickly</td><td>Keras</td><td><code>compile</code> + <code>fit</code> + callbacks in a few lines</td></tr>
    <tr><td>Phone, microcontroller or browser deployment</td><td>Keras/TF</td><td>TFLite and TF.js are mature (PyTorch has ExecuTorch/ONNX routes)</td></tr>
    <tr><td>The company already runs TF Serving, TFX or Vertex pipelines</td><td>Keras/TF</td><td>Fit the existing stack; SavedModel drops in</td></tr>
    <tr><td>Research with unusual training steps</td><td>PyTorch (or Keras custom loop)</td><td>Writing the loop is the default, not the exception</td></tr>
    <tr><td>Want both</td><td>Keras 3 on the PyTorch or JAX backend</td><td>Same Keras code, different engine</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have seen nine pieces of Keras. How do they line up with the training loop they all wrap?</div>

  <h2 id="tk-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Variables, tapes, Sequential, compile, fit, callbacks, Functional, tf.data, custom loops, export: a pile of APIs, or one loop seen from different sides?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="tk-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="44" rx="7" class="fb sb"/><text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">tf.Variable + GradientTape</text><text x="110" y="45" text-anchor="middle" class="tm" font-size="10">(2w − 4)²: grad 8, w → 2.2</text>
<line x1="210" y1="32" x2="248" y2="32" stroke="currentColor" marker-end="url(#tk-a9)"/>
<rect x="250" y="10" width="200" height="44" rx="7" class="fb sb"/><text x="350" y="29" text-anchor="middle" font-size="11.5" font-weight="700">one training step</text><text x="350" y="45" text-anchor="middle" class="tm" font-size="10">forward · loss · gradient · update</text>
<line x1="450" y1="32" x2="488" y2="32" stroke="currentColor" marker-end="url(#tk-a9)"/>
<rect x="490" y="10" width="180" height="44" rx="7" class="ft st"/><text x="580" y="29" text-anchor="middle" font-size="11.5" font-weight="700">custom loop</text><text x="580" y="45" text-anchor="middle" class="tm" font-size="10">you write the step</text>
<line x1="350" y1="54" x2="350" y2="84" stroke="currentColor" marker-end="url(#tk-a9)"/>
<rect x="230" y="86" width="240" height="44" rx="7" class="fg sg"/><text x="350" y="105" text-anchor="middle" font-size="11.5" font-weight="700">compile + fit</text><text x="350" y="121" text-anchor="middle" class="tm" font-size="10">Keras writes the loop for you</text>
<line x1="230" y1="108" x2="198" y2="108" stroke="currentColor" marker-end="url(#tk-a9)"/>
<rect x="10" y="86" width="186" height="44" rx="7" class="fb sb"/><text x="103" y="105" text-anchor="middle" font-size="11.5" font-weight="700">model to train</text><text x="103" y="121" text-anchor="middle" class="tm" font-size="10">Sequential or Functional</text>
<line x1="470" y1="108" x2="502" y2="108" stroke="currentColor" marker-end="url(#tk-a9)"/>
<rect x="504" y="86" width="166" height="44" rx="7" class="ft st"/><text x="587" y="105" text-anchor="middle" font-size="11.5" font-weight="700">callbacks</text><text x="587" y="121" text-anchor="middle" class="tm" font-size="10">hooks inside the loop</text>
<line x1="350" y1="130" x2="350" y2="160" stroke="currentColor" marker-end="url(#tk-a9)"/><line x1="103" y1="130" x2="103" y2="160" stroke="currentColor" marker-end="url(#tk-a9)"/>
<rect x="10" y="162" width="186" height="44" rx="7" class="fb sb"/><text x="103" y="181" text-anchor="middle" font-size="11.5" font-weight="700">Functional: 2 inputs</text><text x="103" y="197" text-anchor="middle" class="tm" font-size="10">AUC 0.74 → 0.84</text>
<rect x="230" y="162" width="240" height="44" rx="7" class="fb sb"/><text x="350" y="181" text-anchor="middle" font-size="11.5" font-weight="700">tf.data feeds the loop</text><text x="350" y="197" text-anchor="middle" class="tm" font-size="10">shuffle · batch · prefetch</text>
<line x1="350" y1="206" x2="350" y2="236" stroke="currentColor" marker-end="url(#tk-a9)"/>
<rect x="230" y="238" width="240" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="350" y="257" text-anchor="middle" font-size="11.5" font-weight="700">save / export → serve</text><text x="350" y="273" text-anchor="middle" class="tm" font-size="10">.keras · SavedModel · TF Serving</text>
<line x1="470" y1="260" x2="502" y2="260" stroke="currentColor" marker-end="url(#tk-a9)"/>
<rect x="504" y="238" width="166" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="587" y="257" text-anchor="middle" font-size="11.5" font-weight="700">PyTorch twin</text><text x="587" y="273" text-anchor="middle" class="tm" font-size="10">same step, other names</text>
</svg><figcaption>Every Keras feature is a view of one training step: the tape computes it, the custom loop spells it out, fit automates it, callbacks hook into it, tf.data feeds it, Sequential/Functional define what it trains, and export ships the result.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same late-delivery data</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On our data</th><th>When to use</th></tr>
    <tr><td>tf.Variable + GradientTape</td><td>recorded operations</td><td>how is a gradient computed?</td><td>(2w − 4)², w = 3 → grad 8, w = 2.2</td><td>custom steps, debugging</td></tr>
    <tr><td>Sequential</td><td>a list of layers</td><td>how to define a straight-pipe model?</td><td>5 → Norm → 16 → 1; 124 params (113 trainable)</td><td>one input, one output</td></tr>
    <tr><td>compile / fit / evaluate / predict</td><td>a built-in training loop</td><td>how to train without boilerplate?</td><td>test AUC ≈ 0.74</td><td>almost always</td></tr>
    <tr><td>Callbacks</td><td>hooks at epoch end</td><td>when to stop, what to keep?</td><td>early stop, best epoch restored, LR halved</td><td>every real fit</td></tr>
    <tr><td>Functional API</td><td>layers called on tensors</td><td>several inputs / branches?</td><td>+ restaurant Embedding: AUC ≈ 0.84</td><td>multi-input/output, skips</td></tr>
    <tr><td>Embedding</td><td>lookup table, rows learned</td><td>how to use an ID?</td><td>50 × 4 = 200 weights</td><td>categorical IDs with many values</td></tr>
    <tr><td>tf.data</td><td>lazy chained Dataset</td><td>how to stream and batch?</td><td>40 batches of 64, dict inputs</td><td>big or file-based data</td></tr>
    <tr><td>Custom loop</td><td>tape + apply_gradients</td><td>a step fit can't do?</td><td>20 epochs, same quality as fit</td><td>GANs, special losses</td></tr>
    <tr><td>.keras / SavedModel</td><td>save / export</td><td>keep it, serve it?</td><td>serve() = predict(); raw features in</td><td>continue training / production</td></tr>
    <tr><td>Keras ↔ PyTorch</td><td>same concepts, other names</td><td>port or choose?</td><td>pothole map peak 21 in both</td><td>by ecosystem and target</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>Keras wraps the same training step you write in PyTorch (forward, loss, gradient, update) and lets you choose how much of the loop it runs for you.</strong> fit runs all of it, callbacks hook into it, a custom loop hands it back to you; Sequential and Functional only change <em>what</em> is trained, tf.data <em>what is fed</em>, and export <em>where it runs</em>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The pieces fit together; now the traps that catch people in Keras code and interviews.</div>

  <h2 id="tk-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which Keras mistakes give no error at all, just a worse model, and how do you spot them?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mixing Keras 2 and Keras 3</span>
    <p><code>tf.keras</code> tutorials, <code>.h5</code> files and <code>model.save("dir")</code> are Keras 2. In Keras 3 use <code>import keras</code>, <code>.keras</code> files and <code>model.export()</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong loss for the labels</span>
    <p>Int labels → <code>sparse_categorical_crossentropy</code>; one-hot → <code>categorical_crossentropy</code>; no final activation → <code>from_logits=True</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: EarlyStopping without restore_best_weights</span>
    <p>Training stops <code>patience</code> epochs <em>after</em> the best epoch; without the flag you keep the last, slightly overfit weights, not the best ones.</p>
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
    <p>Restaurant ID 37 as the value 37.0 implies an order that does not exist. Use an Embedding or one-hot.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: NCHW vs NHWC when porting</span>
    <p>Keras expects (N, H, W, C). Feeding PyTorch-style (N, C, H, W) either errors or, for square inputs with 3 channels, silently treats rows as channels.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet,</b> and then the architecture notes, <a class="xref" data-note="dl_cnns">CNNs</a>, <a class="xref" data-note="dl_rnns">RNNs</a> and <a class="xref" data-note="dl_attention">Attention</a>, whose layers all have Keras twins.</div>

  <h2 id="tk-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: 4,000 delivery orders (first 3,200 train, last 800 test), 5 numeric features (distance km, items, prep minutes, rain 0/1, rush 0/1) plus restaurant ID (50 restaurants); label = arrived late (42% of orders).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>TF vs Keras</td><td>why another framework?</td><td>engine vs high-level API</td><td>what are its objects?</td></tr>
    <tr><td>Variable + tape</td><td>where do weights live, how are gradients made?</td><td>grad 8 at w = 3 → w = 2.2</td><td>one weight by hand is tedious</td></tr>
    <tr><td>Sequential + compile/fit</td><td>train a whole model in a few lines?</td><td>test AUC ≈ 0.74</td><td>how many epochs?</td></tr>
    <tr><td>Callbacks</td><td>when to stop, keep the best?</td><td>stopped early, best epoch restored</td><td>only 5 numbers fit the pipe</td></tr>
    <tr><td>Functional</td><td>two inputs, branches?</td><td>+ restaurant: AUC ≈ 0.84</td><td>data too big for RAM</td></tr>
    <tr><td>tf.data</td><td>stream and batch?</td><td>40 batches of 64, dict inputs</td><td>fit's loop is fixed</td></tr>
    <tr><td>Custom loop</td><td>our own step?</td><td>tape + apply_gradients</td><td>model only in RAM</td></tr>
    <tr><td>Save / export</td><td>keep and serve?</td><td>serve() = predict()</td><td>which framework?</td></tr>
    <tr><td>Keras ↔ PyTorch</td><td>port and choose?</td><td>pothole peak 21 in both</td><td>—</td></tr>
  </table>
  <h3>Formulas and facts</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula / rule</th><th>Meaning</th></tr>
    <tr><td>Gradient step</td><td>w ← w − lr · ∂L/∂w</td><td>(2w − 4)²: ∂L/∂w = 4(2w − 4) = 8 at w = 3; w = 3 − 0.1·8 = 2.2</td></tr>
    <tr><td>Dense params</td><td>n<sub>in</sub>·units + units</td><td>Dense(16) on 5 features = 96; Dense(1) on 16 = 17</td></tr>
    <tr><td>Normalization params</td><td>2·features + 1 (non-trainable)</td><td>5 means + 5 variances + count = 11</td></tr>
    <tr><td>Embedding params</td><td>vocabulary × dim</td><td>50 × 4 = 200</td></tr>
    <tr><td>Conv2D params</td><td>k·k·C<sub>in</sub>·C<sub>out</sub> + C<sub>out</sub></td><td>kernel shape (k, k, C<sub>in</sub>, C<sub>out</sub>)</td></tr>
    <tr><td>Batches per epoch</td><td>⌈rows / batch_size⌉</td><td>2,560 / 32 = 80; 2,560 / 64 = 40</td></tr>
    <tr><td>Loss choice</td><td>sigmoid + binary_crossentropy · softmax + (sparse_)categorical · none + from_logits=True</td><td>int labels → sparse_</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Sequential</b><p>One input, one output, layers in a line.</p><small>MLPs, simple CNNs</small></div>
    <div><b>Functional</b><p>Several inputs or outputs, branches, skips, shared layers.</p><small>Numbers + IDs, multi-task</small></div>
    <div><b>fit vs custom loop</b><p>fit + callbacks for almost everything; GradientTape loop (or overriding train_step) for unusual steps.</p><small>Keep fit's logging when you can</small></div>
    <div><b>Keras vs PyTorch</b><p>Keras for fast standard models, TF deployment stacks, mobile/web; PyTorch for research, LLMs, Hugging Face.</p><small>Keras 3 can run on either engine</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Keras 2 vs 3 APIs; wrong loss for the label format; missing from_logits; EarlyStopping without restore_best_weights; validation_split on sorted data; adapting the scaler on all data; shuffle after batch; IDs as numbers; NCHW vs NHWC; forgetting training=True in custom loops; a tape used twice.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Loss (2w − 4)² at w = 3, lr 0.1: gradient and new w?</td><td>8; 2.2</td></tr>
    <tr><td>Params of Dense(16) on 5 inputs, and Embedding(50, 4)?</td><td>96; 200</td></tr>
    <tr><td>Integer labels 0–9, last layer Dense(10) without activation: loss?</td><td>SparseCategoricalCrossentropy(from_logits=True)</td></tr>
    <tr><td>Which file to give TF Serving?</td><td>The SavedModel from <code>model.export("dir/1")</code>, not the .keras file</td></tr>
    <tr><td>Keras Conv2D kernel shape for 2 filters, 3×3, 1 input channel?</td><td>(3, 3, 1, 2); PyTorch (2, 1, 3, 3)</td></tr>
  </table>

  <h2 id="tk-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What's the relationship between TensorFlow and Keras today?</summary><div class="qa-body">TensorFlow is the low-level engine (tensors, autodiff, graphs, devices, serving). Keras is the high-level model API. Since Keras 3 it is a separate multi-backend library that can run on TensorFlow, JAX or PyTorch; <code>tf.keras</code> is the older bundled version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>None</code> mean in <code>(None, 16)</code> in a model summary?</summary><div class="qa-body">The batch dimension, left open so the model accepts any number of rows. 16 is the number of features (units) per row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters does <code>Dense(16)</code> have on a 30-feature input? And <code>Embedding(50, 4)</code>?</summary><div class="qa-body">Dense: 30·16 weights + 16 biases = 496. Embedding: 50 rows × 4 = 200 (no bias).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When must you use the Functional API instead of Sequential?</summary><div class="qa-body">Whenever the model is not a single straight stack: multiple inputs (numeric + text + IDs), multiple outputs (multi-task heads), skip/residual connections, or shared layers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Labels are integers 0–9 and the last layer is Dense(10) with no activation. Which loss?</summary><div class="qa-body"><code>keras.losses.SparseCategoricalCrossentropy(from_logits=True)</code>. Sparse because labels are integers; from_logits because there is no softmax.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EarlyStopping(patience=10) stopped at the last epoch. Which weights does the model have?</summary><div class="qa-body">With <code>restore_best_weights=True</code>, the weights from the best val_loss epoch (10 epochs earlier). Without it, the weights from the last epoch, which are slightly overfit. A common interview gotcha.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why would you add a Normalization layer inside the model instead of using StandardScaler?</summary><div class="qa-body">The fitted mean/std are saved with the model, so the exported SavedModel accepts raw features. Serving code cannot forget or mis-implement the scaling, which prevents training/serving skew.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>.keras file vs SavedModel: which for what?</summary><div class="qa-body"><code>.keras</code>: the full Keras model (architecture, weights, optimizer state) to reload in Python and keep training. SavedModel via <code>model.export()</code>: a language-neutral graph for inference with TF Serving, TFLite conversion, or other runtimes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does TF Serving roll out a new model version?</summary><div class="qa-body">It watches the model base path. Exporting to a new numbered folder (e.g. <code>2/</code>) makes it load that version and switch traffic to it, by default serving the latest, with no restart. Clients can also request a specific version in the URL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the four lines of a GradientTape training step.</summary><div class="qa-body"><code>with tf.GradientTape() as tape:</code> → <code>loss = loss_fn(y, model(x, training=True))</code> → <code>grads = tape.gradient(loss, model.trainable_variables)</code> → <code>opt.apply_gradients(zip(grads, model.trainable_variables))</code>. No zero_grad needed: each step uses a fresh tape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You're porting a PyTorch CNN to Keras. Name two things that commonly break.</summary><div class="qa-body">(1) Tensor layout: PyTorch is NCHW, Keras defaults to NHWC, so transpose inputs and conv weights. (2) Softmax/logits: PyTorch's CrossEntropyLoss takes logits; in Keras set <code>from_logits=True</code> or add softmax. Also Dense kernels are (in, out) vs Linear's (out, in), and BatchNorm momentum is defined differently (PyTorch 0.1 ≈ Keras 0.9).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you write a custom training loop with GradientTape instead of fit()?</summary><div class="qa-body">GANs (two optimizers alternating), unusual losses needing intermediate outputs, gradient manipulation (clipping per group, accumulation), or research ideas. Alternative: override <code>train_step</code> in a Model subclass and keep fit()'s callbacks and logging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did adding the restaurant ID need the Functional API rather than a bigger Sequential model?</summary><div class="qa-body">The ID is a category, not a quantity, so it must go through its own Embedding branch while the numbers go through Normalization, and the two must merge. Sequential can only express one straight pipe from one input. Making the Sequential model bigger cannot help: it had already reached the true numeric rule's AUC (≈ 0.74); the missing signal was in an input it never received.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does fit() do that the GradientTape loop has to do by hand, and what breaks if you forget one?</summary><div class="qa-body">Batching and shuffling (tf.data), calling the model with training=True (else dropout/BatchNorm act as at inference), computing the loss inside the tape (else gradients are None), applying gradients to trainable_variables, validation, metrics and callbacks. Forgetting training=True silently trains a different model; computing the loss outside the tape gives None gradients and no learning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does putting Normalization inside the model matter for serving?</summary><div class="qa-body">The SavedModel then contains the scaling, so the server receives raw features (km, items, minutes) and scales them exactly as in training. If you scale outside the model, the API code must re-implement the same scaling; any difference (a different mean, a forgotten column) is training/serving skew, and predictions go wrong with no error.</div></details>

</main>`
});
