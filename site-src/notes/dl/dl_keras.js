// dl/dl_keras.js — TensorFlow & Keras
Object.assign(TOPIC_CONTENT, {
  "dl_keras": `<main>
<h1>TensorFlow &amp; Keras</h1>
  <div class="where"><span>Deep Learning</span><span>TensorFlow &amp; Keras</span></div>
  <p class="lead">TensorFlow is Google's deep-learning engine, and Keras is the friendly layer on top of it that lets you build a network from ready-made layers and train it with a single call to <code>fit()</code>. You already know how to write a training loop by hand in <a class="xref" data-note="dl_pytorch">PyTorch</a>; Keras does the same work, but writes most of that loop for you. It matters in real work because a large share of production models, phone apps and cloud pipelines were built with TensorFlow, and job descriptions and interviews ask for both frameworks. Throughout this page we use one problem from the same food-delivery app as the RNN and attention notes: <strong>will this order arrive late?</strong>, predicted first from five numbers about the order and later also from which of 50 restaurants cooked it. Every idea is added to the same data and the same models, and every code block on the page was run for real (TensorFlow 2.21, Keras 3.15, on a CPU).</p>

  <h2 id="tk-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">TF &amp; Keras</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The pieces</div>
        <ul>
          <li><b>TensorFlow</b>: engine (tensors, gradients, graphs, serving)</li>
          <li><b>Keras 3</b>: high-level API on TF, JAX or PyTorch</li>
          <li><code>tf.Variable</code> holds weights; <code>GradientTape</code> records and gives gradients</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Building and training</div>
        <ul>
          <li><b>Sequential</b>: one straight stack of layers</li>
          <li><b>Functional</b>: any graph (two inputs, branches, merges)</li>
          <li><b>compile</b> → <b>fit</b> → <b>evaluate</b> → <b>predict</b></li>
          <li><b>Callbacks</b>: EarlyStopping, ModelCheckpoint, ReduceLROnPlateau</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data and control</div>
        <ul>
          <li><b>tf.data</b>: from_tensor_slices → shuffle → batch → prefetch</li>
          <li>Custom loop: tape → gradient → <code>apply_gradients</code></li>
          <li><code>@tf.function</code> turns a Python step into a fast graph</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shipping and porting</div>
        <ul>
          <li><b>.keras</b> to keep working; <b>SavedModel</b> (<code>export</code>) to serve</li>
          <li>Normalization inside the model → raw features in production</li>
          <li>Keras is channels-last (NHWC); PyTorch channels-first (NCHW)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tk-where"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">TensorFlow, Keras and PyTorch</span><span class="rm-sub">what each one is and why learn a second framework</span></div></div>
      <div class="rm-item rm-done" data-target="tk-tensor"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Tensors and GradientTape</span><span class="rm-sub">where weights live and how gradients are computed</span></div></div>
      <div class="rm-item rm-done" data-target="tk-seq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Sequential API: compile, fit, predict</span><span class="rm-sub">a whole training loop in three calls</span></div></div>
      <div class="rm-item rm-done" data-target="tk-cb"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Callbacks</span><span class="rm-sub">letting training decide when to stop</span></div></div>
      <div class="rm-item rm-done" data-target="tk-func"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Functional API</span><span class="rm-sub">two inputs: order numbers and restaurant ID</span></div></div>
      <div class="rm-item rm-done" data-target="tk-data"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">tf.data Pipelines</span><span class="rm-sub">streaming, shuffling and batching data</span></div></div>
      <div class="rm-item rm-done" data-target="tk-loop"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Custom Training Loops</span><span class="rm-sub">writing the training step yourself</span></div></div>
      <div class="rm-item rm-done" data-target="tk-save"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Saving and Serving</span><span class="rm-sub">.keras files, SavedModel, TF Serving</span></div></div>
      <div class="rm-item rm-done" data-target="tk-pt"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Keras and PyTorch Side by Side</span><span class="rm-sub">the same maths with different names and layouts</span></div></div>
      <div class="rm-item rm-done" data-target="tk-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">wrong losses, logits, splits and layouts</span></div></div>
      <div class="rm-item rm-done" data-target="tk-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, syntax, tables, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="tk-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about TF and Keras</span></div></div>
    </div>
  </div>

  <h2 id="tk-where"><span class="num">01</span>TensorFlow, Keras and PyTorch</h2>
  <p>If you learned PyTorch first, the obvious question is why you should learn another framework at all. The practical answer is that a great deal of industry code was written in TensorFlow between roughly 2016 and 2022, and it still runs: a bank's fraud model, the image model inside a phone app, a recommendation pipeline on Google Cloud. At some point you are likely to be asked to retrain, debug or deploy one of these. TensorFlow also has the most mature tools for running models on phones and in web browsers. And for a standard model, Keras lets you go from data to a trained network in a dozen lines, which is useful even when you know PyTorch well.</p>
  <p>The names cause confusion, so it helps to separate them clearly. <strong>TensorFlow</strong> is the engine: it stores numbers in tensors, computes gradients automatically, can compile Python code into a fast "graph", runs on CPUs, GPUs and Google's TPUs, and comes with deployment tools (TF Serving for servers, TFLite for phones, TF.js for browsers). <strong>Keras</strong> is a high-level API, meaning a set of building blocks where one call stands for many low-level steps: you describe a model as layers, and a single <code>fit()</code> call runs the entire training loop. Since Keras 3, Keras is its own library that can run on top of three different engines, called <strong>backends</strong>: TensorFlow (the default), JAX or even PyTorch. The same Keras code works on all three.</p>
  <p>Think of driving. Keras is an automatic car: <code>compile</code> and <code>fit</code> change the gears for you and you only steer. PyTorch is a manual car: you write the loop and control every gear change yourself. Keras still has a manual mode for when you need it (section 07), and TensorFlow is the engine under the bonnet either way. The important thing to take away is that the ideas are identical. A Dense layer in Keras is a Linear layer in PyTorch, a loss is a loss, and backpropagation is backpropagation. Once you can follow shapes and write a training loop in one framework, the other is mostly new names.</p>
  <p>One warning before any code. Older tutorials write <code>from tensorflow import keras</code> or <code>tf.keras</code>, save models as <code>.h5</code> files, and call <code>model.save("folder")</code> to export for serving. That is Keras 2. Keras 3 (installed with TensorFlow 2.16 and later) uses <code>import keras</code>, the <code>.keras</code> file format, and <code>model.export()</code> for serving. Mixing the two produces confusing errors, so check which version a project uses first.</p>
  <p>Now the running example. The food-delivery app wants to warn a customer before an order runs late. For every past order it knows five numbers: the <strong>distance</strong> in km, the number of <strong>items</strong>, the restaurant's <strong>prep time</strong> in minutes, whether it was <strong>raining</strong> (0 or 1), and whether it was <strong>rush hour</strong> (0 or 1). It also knows <strong>which of 50 restaurants</strong> cooked the order. The label is 1 if the order arrived late. We will generate 4,000 such orders from a hidden rule that we write ourselves (long distances, slow kitchens, big orders, rain and rush hour all make lateness more likely, and some restaurants are always slow), so that we can check how close each model gets to the truth.</p>

  <h2 id="tk-tensor"><span class="num">02</span>Tensors and GradientTape</h2>
  <p>Every framework needs its own array type, because a NumPy array cannot live on a GPU and cannot tell you gradients. In TensorFlow that type is the <strong>tensor</strong>, a grid of numbers with a shape and a data type, just like a NumPy array. TensorFlow has two kinds. A <strong>tf.constant</strong> is a tensor whose values can never change; inputs and intermediate results are constants. A <strong>tf.Variable</strong> is a tensor whose values can be changed in place, and that is where a model's weights live, because training must keep changing them.</p>
    <div class="fx" data-lang="py">import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"           # hide TF's start-up log lines
import numpy as np, tensorflow as tf, keras
print(tf.__version__, keras.__version__, keras.backend.backend())

x = tf.constant([[1., 2.], [3., 4.]])             # a fixed tensor, shape (2, 2)
print(x.shape, x.dtype)
print((x @ tf.transpose(x)).numpy())              # matrix multiply, then back to NumPy
print(tf.reshape(x, (4,)).numpy(), tf.expand_dims(x, 0).shape)
try:
    x[0, 0] = 5.
except TypeError as e:
    print("TypeError:", e)

w = tf.Variable(3.0)                              # a changeable tensor: weights live here
w.assign(2.5); print(w.numpy())</div>
  <div class="fx" data-lang="text">2.21.0 3.15.1 tensorflow
(2, 2) &lt;dtype: 'float32'&gt;
[[ 5. 11.]
 [11. 25.]]
[1. 2. 3. 4.] (1, 2, 2)
TypeError: 'tensorflow.python.framework.ops.EagerTensor' object does not support item assignment
2.5</div>
  <p>The first line confirms Keras 3.15 running on the TensorFlow backend. <code>x @ tf.transpose(x)</code> is matrix multiplication (the top-left cell is 1·1 + 2·2 = 5), and <code>.numpy()</code> turns a tensor back into a NumPy array. <code>tf.reshape</code> and <code>tf.expand_dims</code> are TensorFlow's versions of reshape and PyTorch's <code>unsqueeze</code>: the second adds a new axis of size 1 at the front, giving shape (1, 2, 2). Trying to change one cell of the constant fails, because constants are immutable. The variable, on the other hand, accepted a new value with <code>assign</code>.</p>
  <p>Now gradients. In PyTorch every tensor can carry a <code>requires_grad</code> flag and remembers how it was made. TensorFlow does it differently: you open a block called a <strong>GradientTape</strong>, and every operation on variables inside that block is recorded. Afterwards <code>tape.gradient(loss, w)</code> plays the recording backwards and returns the derivative of the loss with respect to <code>w</code>. Think of the third umpire's recorder in cricket. Normal play is not saved, but while the recorder is running every ball is captured, and afterwards it can be replayed to see exactly what caused the wicket. Anything that happened while the recorder was off cannot be replayed.</p>
  <p>Let us work out one gradient step by hand on the smallest possible delivery model: predicted delay in minutes = w × distance. One order was 2 km away and arrived 4 minutes late, so the prediction is 2w and the squared-error loss is (2w − 4)². We start with a guess of w = 3 minutes per km.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Calculation</th><th>Value</th></tr>
    <tr><td>Prediction</td><td>2 × 3</td><td>6</td></tr>
    <tr><td>Error</td><td>6 − 4</td><td>2</td></tr>
    <tr><td>Loss</td><td>2²</td><td>4</td></tr>
    <tr><td>Gradient</td><td>d/dw (2w − 4)² = 2·(2w − 4)·2 = 4·2</td><td>8</td></tr>
    <tr><td>Update (learning rate 0.1)</td><td>3 − 0.1 × 8</td><td>2.2</td></tr>
  </table>
  <p>The gradient is positive, which says "increasing w increases the loss", so we step w down, from 3 to 2.2, closer to the true answer of 2 minutes per km. Here is the same step done by TensorFlow:</p>
    <div class="fx" data-lang="py">with tf.GradientTape() as tape:                   # start recording
    loss = (w * 2.0 - 4.0) ** 2                   # predicted delay 2w, actual delay 4
g = tape.gradient(loss, w)                        # replay backwards: dloss/dw
print("loss =", loss.numpy(), " dloss/dw =", g.numpy())
w.assign_sub(0.1 * g)                             # w = w - learning_rate * gradient
print("w after one step:", w.numpy())

loss_outside = (w * 2.0 - 4.0) ** 2               # computed with no tape running
with tf.GradientTape() as tape2:
    pass
print("gradient when the loss was not recorded:", tape2.gradient(loss_outside, w))</div>
  <div class="fx" data-lang="text">loss = 4.0  dloss/dw = 8.0
w after one step: 2.2
gradient when the loss was not recorded: None</div>
  <p>The tape gives a loss of 4 and a gradient of 8, exactly as in the table, and <code>assign_sub</code> subtracts the step from the variable in place, leaving 2.2. The last three lines show the most common tape mistake: the loss was computed <em>before</em> the tape started, so nothing was recorded and the gradient comes back as <code>None</code> instead of an error. Two more rules are worth remembering. A tape can be asked for gradients only once, unless you create it with <code>GradientTape(persistent=True)</code>. And trainable Keras weights are variables, so the tape watches them automatically.</p>
  <p>Doing this by hand for one weight is fine. A real model has hundreds or millions of weights, thousands of training rows, batches, epochs and metrics, and writing all of that every time is exactly the boilerplate that Keras removes.</p>

  <h2 id="tk-seq"><span class="num">03</span>The Sequential API: compile, fit, predict</h2>
  <p>In PyTorch you write the training loop yourself: split the data into batches, shuffle it, and for every batch clear the old gradients, run the model, compute the loss, back-propagate and update the weights, then measure validation results and print progress. For a standard model these 30 or so lines are almost the same in every project, and every one of them is a chance for a bug. Keras packages all of it into a fixed recipe of four steps. You <strong>build</strong> the model from layers; you <strong>compile</strong> it, which means choosing the optimizer, the loss and the metrics to report (nothing is trained yet); you <strong>fit</strong> it, which runs the whole training loop for a number of epochs; and then you <strong>evaluate</strong> it on test data and <strong>predict</strong> on new rows.</p>
  <p>It is like ordering a thali in a restaurant. You choose the items (the layers), tell the waiter how you want it (compile: how spicy, which drink), and the kitchen does all the work (fit). Writing the loop in PyTorch is cooking the same meal at home.</p>
  <p>First we need the data. The code below generates the 4,000 orders from the hidden rule described in section 01, keeps the first 3,200 for training and the last 800 for testing, and defines one helper. To judge a model that outputs a probability of "late", we use <strong>AUC</strong> (area under the ROC curve). It has a simple meaning: pick one late order and one on-time order at random; AUC is the chance that the model gives the late one the higher score. An AUC of 0.5 is guessing, 1.0 is perfect. Our helper computes exactly that, by comparing every late order with every on-time one.</p>
    <div class="fx" data-lang="py">from keras import layers
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

def auc(y, score):            # chance that a random late order scores above a random on-time one
    pos, neg = score[y == 1], score[y == 0]
    return float((pos[:, None] &gt; neg[None, :]).mean() + 0.5 * (pos[:, None] == neg[None, :]).mean())

print(X.shape, "late rate", late.mean().round(3))
print("order 0:", X[0], "late =", late[0])
print("train means", X_tr.mean(0).round(1), " stds", X_tr.std(0).round(1))</div>
  <div class="fx" data-lang="text">(4000, 5) late rate 0.416
order 0: [ 6.6  5.  12.   0.   1. ] late = 1.0
train means [ 5.2  4.5 15.2  0.2  0.3]  stds [2.7 2.3 5.  0.4 0.5]</div>
  <p>About 42% of orders are late. Order 0 was 6.6 km away, had 5 items and 12 minutes of prep, no rain, at rush hour, and it was late. Notice how different the columns' scales are: distance averages about 5 with a spread of 2.7, prep time averages 15, while rain is 0 or 1. Networks train badly when inputs have very different scales, because one large-valued feature dominates the weighted sums at the start. So the first layer of our model will be a <strong>Normalization</strong> layer, which subtracts each feature's mean and divides by its standard deviation. Its <code>adapt()</code> method computes those statistics from the training rows only, and they are then stored inside the model.</p>
  <p>The model is a <strong>Sequential</strong> model, which is simply a list of layers applied one after another. A <strong>Dense</strong> layer is a fully connected layer, the same as PyTorch's <code>nn.Linear</code>, except that you give only the number of outputs and Keras works out the number of inputs. <strong>Dropout</strong> randomly switches off 20% of the hidden values during training to reduce overfitting. The last layer has one output with a sigmoid, so it produces a probability of "late". Before running anything, let us trace the shapes and count the parameters by hand for a batch of 32 orders. The input is (32, 5). Normalization keeps it (32, 5) and stores 5 means, 5 variances and a count, 11 numbers. Dense(16) gives (32, 16) and has 5 × 16 weights + 16 biases = 96 parameters. Dropout keeps (32, 16) and has no parameters. Dense(1) gives (32, 1) with 16 + 1 = 17 parameters.</p>
    <div class="fx" data-lang="py">def make_seq():
    keras.utils.set_random_seed(0)
    norm = layers.Normalization()
    norm.adapt(X_tr)                     # learn mean/std from TRAIN rows only; stored in the model
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
print(model.layers[0](X_tr[:200]).numpy().mean(0).round(2))   # after Normalization: means near 0
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
  <p>The first line shows that after the Normalization layer the feature means of a 200-row sample are close to 0, as intended. In the summary, the parameter counts match our hand calculation: 11, 96, 0 and 17. The 11 Normalization numbers are listed as <strong>non-trainable</strong> because they were set by <code>adapt</code>, not learned by gradient descent. The shapes are written as <code>(None, 16)</code>: <code>None</code> is the batch dimension, left open so that the model accepts any number of orders, which is why calling it on 4 orders gave (4, 1). Nothing has been trained yet; <code>compile</code> only attached the optimizer (Adam with learning rate 0.001), the loss and the metrics.</p>
  <p>The loss must match the last layer and the label format. For a yes/no question with a sigmoid output we use <strong>binary cross-entropy</strong>. The common combinations are worth memorising, because choosing the wrong one is the most frequent Keras bug:</p>
  <table class="tbl">
    <tr><th>Task</th><th>Last layer</th><th>Loss</th></tr>
    <tr><td>Yes / no</td><td>Dense(1, sigmoid)</td><td><code>binary_crossentropy</code></td></tr>
    <tr><td>Several classes, labels are integers 0..C−1</td><td>Dense(C, softmax)</td><td><code>sparse_categorical_crossentropy</code></td></tr>
    <tr><td>Several classes, labels are one-hot vectors</td><td>Dense(C, softmax)</td><td><code>categorical_crossentropy</code></td></tr>
    <tr><td>A number (regression)</td><td>Dense(1), no activation</td><td><code>mse</code> or <code>mae</code></td></tr>
  </table>
  <p>If the last layer has no activation at all (it outputs raw scores, called <strong>logits</strong>), the loss must be told with <code>from_logits=True</code>. Now the three calls that do the work:</p>
    <div class="fx" data-lang="py">hist = model.fit(X_tr, y_tr, validation_split=0.2, epochs=20, batch_size=32, verbose=0)
h = hist.history                                         # one list per metric
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
  <p>Here is what <code>fit</code> did. <code>validation_split=0.2</code> held back the last 20% of the 3,200 training orders (640 orders) for validation. In each epoch it went through the other 2,560 orders in batches of 32, which is 80 batches, doing the full forward, loss, backward and update step for each batch, and then scored the 640 validation orders without training on them. It returned a <strong>History</strong> object whose <code>history</code> dictionary holds one list per metric, with <code>val_</code> versions for the validation data. The validation AUC climbed from 0.41 after the first epoch to about 0.76 by epoch 20. <code>evaluate</code> then scored the 800 test orders the model had never seen, giving an AUC of 0.739, and <code>predict</code> returned a probability of "late" for three new orders. Everything that took a hand-written loop in PyTorch happened in three calls.</p>
  <p>We picked 20 epochs by guessing, though. Was that too few or too many?</p>

  <h2 id="tk-cb"><span class="num">04</span>Callbacks</h2>
  <p>Choosing the number of epochs is a real problem. Train too few and the model is under-trained. Train too many and it starts memorising the training rows, so the validation loss stops falling and begins to rise, which is <strong>overfitting</strong>. You cannot know the right number in advance. You would also like to save the best version of the model as you go, in case the machine crashes, and to lower the learning rate when progress stalls, because smaller steps help near the bottom of the loss. Doing all of that by hand means watching the logs for hours.</p>
  <p>A <strong>callback</strong> is a small object that <code>fit()</code> calls at fixed moments during training, such as the end of every epoch, so that it can look at the latest numbers and act on them. You give <code>fit</code> a list of callbacks once, and they run automatically. Think of a pressure cooker: you do not stand beside it counting minutes, because the whistle tells you when it is done and the safety valve releases pressure when needed.</p>
  <p>Three callbacks are used in almost every real project. <strong>EarlyStopping</strong> watches the validation loss; if it has not improved for <code>patience</code> epochs in a row, training stops, and with <code>restore_best_weights=True</code> the model goes back to the weights from its best epoch. <strong>ModelCheckpoint</strong> writes the model to a file whenever the validation loss improves. <strong>ReduceLROnPlateau</strong> multiplies the learning rate by a factor (here 0.5) when the validation loss has not improved for a few epochs. We start a fresh model and ask for 200 epochs, far more than needed, and let the callbacks decide:</p>
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
lrs = h["learning_rate"]
print("learning rate changes:", [(i + 1, round(float(lr), 6)) for i, lr in enumerate(lrs) if i == 0 or lr != lrs[i - 1]])
seq_res = model.evaluate(X_te, y_te, verbose=0, return_dict=True)
print({k: round(v, 3) for k, v in seq_res.items()})
seq_auc = auc(y_te, model.predict(X_te, verbose=0).ravel())
print("test AUC of this model:", round(seq_auc, 3),
      "| AUC of the TRUE numeric rule:", round(auc(y_te, numeric_rule[3200:]), 3))</div>
  <div class="fx" data-lang="text">epochs run: 38  best epoch: 28
learning rate changes: [(1, 0.001), (29, 0.0005), (33, 0.00025), (37, 0.000125)]
{'accuracy': 0.702, 'auc': 0.738, 'loss': 0.589}
test AUC of this model: 0.738 | AUC of the TRUE numeric rule: 0.739</div>
  <p>Training stopped long before 200 epochs. Each epoch ended with a validation loss; EarlyStopping remembered the best one and counted how many epochs had passed without beating it, and after 10 such epochs it stopped and restored the best epoch's weights. Meanwhile ReduceLROnPlateau halved the learning rate each time the validation loss stalled for 4 epochs; the list shows each change. ModelCheckpoint kept rewriting <code>best.keras</code> on disk. The chart below draws the actual loss history of this run:</p>
  <figure class="viz"><svg viewBox="0 0 560 215" width="560">
<line x1="50" y1="170" x2="540" y2="170" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="170" stroke="currentColor"/>
<text x="44" y="24" text-anchor="end" class="tm">0.82</text><text x="44" y="174" text-anchor="end" class="tm">0.58</text>
<polyline points="50,20 63,76 76,107 90,128 103,141 116,148 129,149 143,152 156,154 169,152 182,153 196,160 209,157 222,158 235,157 249,157 262,155 275,158 288,159 302,161 315,162 328,159 341,161 355,161 368,160 381,161 394,162 408,162 421,159 434,159 447,165 461,164 474,163 487,161 500,161 514,162 527,161 540,162" fill="none" class="sb" stroke-width="2"/>
<polyline points="50,62 63,105 76,132 90,148 103,158 116,163 129,166 143,167 156,168 169,169 182,169 196,169 209,169 222,169 235,169 249,169 262,169 275,169 288,169 302,170 315,170 328,170 341,170 355,170 368,170 381,170 394,170 408,170 421,170 434,170 447,170 461,170 474,170 487,170 500,170 514,170 527,170 540,170" fill="none" class="sr" stroke-width="2"/>
<line x1="408" y1="20" x2="408" y2="170" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="404" y="40" text-anchor="end" class="tg">best val_loss: epoch 28 (weights restored)</text>
<text x="536" y="70" text-anchor="end" class="tm">stopped at 38</text>
<text x="50" y="190" class="tm">epoch 1</text><text x="540" y="190" text-anchor="end" class="tm">epoch 38</text>
<text x="200" y="208" class="tb">— training loss</text><text x="330" y="208" class="tr">— validation loss</text>
</svg><figcaption>The real loss history of this run (y axis zoomed to 0.58–0.82). We asked for 200 epochs; EarlyStopping stopped at epoch 38 and rolled back to epoch 28.</figcaption></figure>
  <p>Both curves fall quickly in the first few epochs and then flatten. The validation loss reaches its lowest point at the dashed line; after that it no longer improves, and ten epochs later training stops and the weights from the dashed line are put back.</p>
  <p>The last line of the output is the interesting one. Because we generated the data ourselves, we can compute the AUC of the <em>true</em> rule that uses only the five numbers. The model's test AUC is essentially equal to it. In other words, no formula built from these five numbers can do much better, and making this model bigger or training it longer would not help. The rest of the information about lateness is in the restaurant ID, which this model never sees.</p>

  <h2 id="tk-func"><span class="num">05</span>The Functional API</h2>
  <p>A Sequential model is one straight pipe: a single input goes through one layer after another to a single output. Our next model does not fit that shape. The five numbers should go through normalisation as before, but the restaurant ID is a different kind of input. Restaurant 37 is not "bigger" than restaurant 2; the ID is a name, not a quantity, so it needs its own treatment before the two kinds of information are combined.</p>
  <p>The <strong>Functional API</strong> lets you wire layers together like a diagram. You create one <code>keras.Input</code> for each input, then call each layer on a tensor as if it were a function, which returns a new tensor, and at the end you tell <code>keras.Model</code> which tensors are the inputs and which is the output. Keras follows the connections and builds the model as a graph. It is like plumbing: two water sources run through different filters, meet at a T-joint, and then flow through one main pipe to a single tap.</p>
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
<text x="5" y="165" class="tm">the numbers are normalised (inside "numeric"); the ID goes through its own Embedding</text>
</svg><figcaption>Two inputs of different kinds, processed separately and then merged. A Sequential model cannot express this shape.</figcaption></figure>
  <p>Read the figure from left to right. The five numbers form one input and are normalised. The restaurant ID forms the second input and goes through an <strong>Embedding</strong> layer, which is a lookup table with one learned row of numbers per restaurant: restaurant 37 simply looks up row 37. We give each restaurant 4 numbers. At the start these rows are random; during training, backpropagation adjusts each restaurant's row so that it carries whatever is useful for predicting lateness, so kitchens that are often late end up with similar rows. The two branches are joined by <strong>Concatenate</strong>, which places the 5 normalised numbers and the 4 embedding numbers side by side into 9 numbers, and the rest is the familiar Dense layers.</p>
  <p>Shape trace before the code: the restaurant input is (None, 1); the Embedding turns each ID into 4 numbers, giving (None, 1, 4); Flatten removes the middle axis, giving (None, 4); Concatenate with the (None, 5) numbers gives (None, 9); Dense(16) gives (None, 16); and the output is (None, 1). Parameters: the embedding table has 50 rows × 4 = 200 weights, Dense(16) on 9 inputs has 9 × 16 + 16 = 160, the output layer 17, so 377 trainable, plus the 11 non-trainable Normalization numbers.</p>
    <div class="fx" data-lang="py">keras.utils.set_random_seed(0)
num_in  = keras.Input(shape=(5,), name="numeric")
rest_in = keras.Input(shape=(1,), dtype="int32", name="restaurant")
norm2 = layers.Normalization(); norm2.adapt(X_tr)
x = norm2(num_in)                                            # numeric branch
r = layers.Embedding(input_dim=50, output_dim=4)(rest_in)    # restaurant branch: ID -&gt; 4 numbers
print(r.shape)
r = layers.Flatten()(r)
z = layers.Concatenate()([x, r])                             # merge the two branches
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
  <p>Notice that we could print shapes such as (None, 1, 4) and (None, 9) while building, before any data existed. In the Functional API each layer call returns a <em>symbolic</em> tensor, a placeholder that knows its shape but holds no values yet. The summary has a new column, "Connected to", which shows the graph: <code>concatenate</code> receives two tensors, the normalised numbers and the flattened embedding. The parameter counts match the hand calculation.</p>
  <p>Keras actually offers three ways to define a model. <strong>Sequential</strong> is for a single straight stack. <strong>Functional</strong> handles any graph of layers without loops: several inputs, several outputs, branches, skip connections and shared layers, and it can still draw and save the whole structure. <strong>Subclassing</strong>, writing <code>class MyModel(keras.Model)</code> with a <code>call()</code> method, works like PyTorch's <code>nn.Module</code> and allows any Python logic, at the cost of being harder to inspect and save. Most real Keras code uses Functional.</p>
  <p>We have built the two-input model but not trained it. Its training data is now a pair of inputs, and the next section shows the proper way to feed it.</p>

  <h2 id="tk-data"><span class="num">06</span>tf.data Pipelines</h2>
  <p>So far our data has been sitting in NumPy arrays in memory. Real datasets are often far bigger than memory, perhaps a hundred gigabytes of images or a delivery log with crores of rows, and reading and decoding them takes time. If the model has to wait while the processor prepares each batch, an expensive GPU sits idle much of the time. <strong>tf.data</strong> is TensorFlow's tool for building an input pipeline: a <strong>Dataset</strong> is a lazy sequence of examples, meaning it produces examples only when asked, and you chain steps onto it. <code>map</code> transforms each example (decode a file, augment an image), <code>shuffle</code> mixes the order, <code>batch</code> groups examples into batches, and <code>prefetch</code> prepares the next batch in the background while the current one is training. It plays the role of PyTorch's Dataset and DataLoader.</p>
  <p>Picture a railway canteen at lunchtime. One person cuts vegetables, one cooks, one packs, and while you eat thali number one, thali number two is already being packed. Nobody waits for the previous order to be finished before starting on the next. Prefetch is the packing of the next thali.</p>
  <p>For our two-input model, each example must be a pair: the inputs, as a dictionary whose keys match the names we gave the <code>Input</code> layers ("numeric" and "restaurant"), and the label. One example is therefore {"numeric": shape (5,), "restaurant": shape (1,)} with a label of shape (). After <code>batch(64)</code> a batch is {"numeric": (64, 5), "restaurant": (64, 1)} with labels (64,). We use the first 2,560 training orders for training (2,560 / 64 = 40 batches) and the next 640 for validation; the 800 test orders stay untouched.</p>
    <div class="fx" data-lang="py">ds = tf.data.Dataset.from_tensor_slices(
        ({"numeric": X_tr, "restaurant": r_tr[:, None].astype("int32")}, y_tr))   # keys = Input names
print(ds.element_spec)
train_ds = ds.take(2560).shuffle(2560, seed=0).batch(64).prefetch(tf.data.AUTOTUNE)
val_ds   = ds.skip(2560).batch(256).prefetch(tf.data.AUTOTUNE)
xb, yb = next(iter(train_ds))
print(xb["numeric"].shape, xb["restaurant"].shape, yb.shape, "batches:", len(list(train_ds)))

hist2 = late_model.fit(train_ds, validation_data=val_ds, epochs=15, verbose=0)
p_func = late_model.predict({"numeric": X_te, "restaurant": r_te[:, None]}, verbose=0).ravel()
print("test AUC  Sequential (numbers only):", round(seq_auc, 3),
      "| Functional (+ restaurant):", round(auc(y_te, p_func), 3))
print("true rule AUC  numbers only:", round(auc(y_te, numeric_rule[3200:]), 3),
      "| numbers + restaurant effect:", round(auc(y_te, (numeric_rule + rest_effect[restaurant])[3200:]), 3))</div>
  <div class="fx" data-lang="text">({'numeric': TensorSpec(shape=(5,), dtype=tf.float32, name=None), 'restaurant': TensorSpec(shape=(1,), dtype=tf.int32, name=None)}, TensorSpec(shape=(), dtype=tf.float32, name=None))
(64, 5) (64, 1) (64,) batches: 40
test AUC  Sequential (numbers only): 0.738 | Functional (+ restaurant): 0.837
true rule AUC  numbers only: 0.739 | numbers + restaurant effect: 0.846</div>
  <p><code>from_tensor_slices</code> cut the arrays into 3,200 single examples, and <code>element_spec</code> describes one of them, matching our trace. <code>take</code> and <code>skip</code> split it into training and validation parts. The first training batch has exactly the shapes we predicted, and there are 40 batches per epoch. A Dataset is passed straight to <code>fit</code>, which then takes its batch size and shuffling from the pipeline.</p>
  <p>The comparison at the bottom is the payoff of the last two sections. On the same 800 test orders, the Functional model that also sees the restaurant ID reaches an AUC of about 0.84, against 0.74 for the numbers-only model. The best that is possible, the AUC of the true rule including each restaurant's hidden slowness, is 0.846. The Embedding learned which kitchens are slow from nothing but restaurant IDs and late labels.</p>
  <p>Two details of the pipeline matter. <code>shuffle</code> must come before <code>batch</code>; otherwise you only shuffle the order of whole batches. And the shuffle buffer should be close to the dataset size: a buffer of 100 on a million rows sorted by date barely shuffles anything, because each example can only move about 100 places.</p>

  <h2 id="tk-loop"><span class="num">07</span>Custom Training Loops</h2>
  <p><code>fit()</code> covers most needs, but some training steps do not fit its fixed shape. A GAN trains two models against each other with two optimizers. Some losses need intermediate outputs of the model. Research ideas often change how gradients are combined or clipped. In these cases the automatic gearbox gets in the way, and Keras lets you switch to manual: you write the training step yourself with the same <code>GradientTape</code> from section 02. A <strong>custom training loop</strong> is simply your own loop over batches that performs this step.</p>
  <p>One training step in plain words: open a tape; inside it, run the model forward and compute the loss; ask the tape for the gradient of the loss with respect to every trainable weight; and hand the pairs (gradient, weight) to the optimizer, which updates the weights. You never need to clear old gradients as in PyTorch, because a fresh tape is opened for every step and nothing accumulates. The table puts the two frameworks next to each other:</p>
  <table class="tbl">
    <tr><th>Step</th><th>PyTorch</th><th>TensorFlow / Keras</th></tr>
    <tr><td>Clear old gradients</td><td><code>opt.zero_grad()</code></td><td>not needed (new tape each step)</td></tr>
    <tr><td>Forward and loss</td><td><code>loss = loss_fn(model(x), y)</code></td><td>the same, inside <code>with tf.GradientTape() as tape:</code></td></tr>
    <tr><td>Gradients</td><td><code>loss.backward()</code></td><td><code>grads = tape.gradient(loss, model.trainable_variables)</code></td></tr>
    <tr><td>Update</td><td><code>opt.step()</code></td><td><code>opt.apply_gradients(zip(grads, model.trainable_variables))</code></td></tr>
  </table>
  <p>In the code below the model ends in Dense(1) with no sigmoid, so it outputs logits, and the loss is created with <code>from_logits=True</code>. The labels arrive with shape (32,) and the logits with (32, 1), so <code>yb[:, None]</code> adds an axis to make them match. Two new things appear. The argument <code>training=True</code> tells layers such as Dropout and BatchNorm to behave in training mode (inside <code>fit</code> Keras sets this for you). And <code>@tf.function</code> is a decorator that traces the Python function once and compiles it into a TensorFlow <strong>graph</strong>, a fixed description of the computation that runs much faster than executing Python line by line for every batch.</p>
    <div class="fx" data-lang="py">keras.utils.set_random_seed(0)
norm3 = layers.Normalization(); norm3.adapt(X_tr)
tape_model = keras.Sequential([keras.Input(shape=(5,)), norm3,
                               layers.Dense(16, activation="relu"), layers.Dense(1)])   # outputs logits
loss_fn = keras.losses.BinaryCrossentropy(from_logits=True)
opt = keras.optimizers.Adam(1e-3)
ds = tf.data.Dataset.from_tensor_slices((X_tr, y_tr)).shuffle(len(X_tr), seed=0).batch(32)

@tf.function                                             # trace once into a fast graph
def train_step(xb, yb):
    with tf.GradientTape() as tape:
        logits = tape_model(xb, training=True)           # (32, 1)
        loss = loss_fn(yb[:, None], logits)
    grads = tape.gradient(loss, tape_model.trainable_variables)
    opt.apply_gradients(zip(grads, tape_model.trainable_variables))
    return loss

for epoch in range(1, 21):
    for xb, yb in ds:
        loss = train_step(xb, yb)
    if epoch in (1, 5, 20):
        p = tf.sigmoid(tape_model(X_te)).numpy().ravel()
        print(f"epoch {epoch:2d}  last batch loss {float(loss):.4f}  test AUC {auc(y_te, p):.3f}")
print([tuple(v.shape) for v in tape_model.trainable_variables])</div>
  <div class="fx" data-lang="text">epoch  1  last batch loss 0.6437  test AUC 0.644
epoch  5  last batch loss 0.5449  test AUC 0.737
epoch 20  last batch loss 0.5102  test AUC 0.740
[(5, 16), (16,), (16, 1), (1,)]</div>
  <p>The hand-written loop trains the same kind of model that <code>fit</code> trained in section 03 and reaches the same test AUC, about 0.74. The last line lists the trainable variables the tape differentiated: the Dense(16) kernel (5, 16) and bias (16,), and the Dense(1) kernel (16, 1) and bias (1,). The Normalization statistics are not in the list, so the optimizer never touches them. Notice also that Keras stores a Dense kernel as (inputs, outputs), the transpose of PyTorch's (outputs, inputs).</p>
  <p>There is a middle way between <code>fit</code> and a fully manual loop: subclass <code>keras.Model</code> and override only its <code>train_step</code> method. You write the step, and <code>fit</code> still handles the epochs, callbacks, validation and progress bar. One trap with <code>@tf.function</code>: ordinary Python side effects inside it, such as <code>print</code> or appending to a list, run only once, when the function is traced, not on every call.</p>

  <h2 id="tk-save"><span class="num">08</span>Saving and Serving</h2>
  <p>A trained model lives in memory and disappears when the Python process ends. In practice you need two different kinds of saved model. One is for continuing to work in Python: reload the model, evaluate it, train it some more. The other is for production: putting the model behind an API so that the delivery app can send an order's features and receive the probability of lateness, ideally without copying your Python training code to the server at all.</p>
  <p>Keras provides both. <code>model.save("late.keras")</code> writes a single <code>.keras</code> file, a zip archive containing the model's architecture, its weights and the optimizer's state, and <code>keras.models.load_model</code> brings it back. <code>model.export("folder")</code> writes a <strong>SavedModel</strong>: the computation graph plus the weights in a language-neutral format that TF Serving, TFLite on phones, or a Java or C++ program can run without any Keras code. Think of a recipe notebook and a sealed tiffin. The <code>.keras</code> file is your notebook: you can read it, change it and cook again. The SavedModel is a sealed tiffin handed to the delivery service, which cannot change the recipe and simply delivers the same meal to every customer.</p>
  <p>We take the Sequential model trained with callbacks in section 04, save and reload it, export it, and then load the export with plain TensorFlow, the way a server would:</p>
    <div class="fx" data-lang="py">model.save("late.keras")
loaded = keras.models.load_model("late.keras")
print("same predictions:", np.allclose(loaded.predict(X_te, verbose=0), model.predict(X_te, verbose=0)))

model.export("export/late/1", verbose=False)       # folder "1" = model version 1
print(sorted(os.listdir("export/late/1")))
served = tf.saved_model.load("export/late/1")      # plain TensorFlow, no Keras model code
sig = served.signatures["serving_default"]
print("input :", sig.structured_input_signature[1])
print("output:", sig.structured_outputs)
p_served = served.serve(X_te[:3]).numpy().ravel()
print(p_served.round(4), " same as predict:", np.allclose(p_served, model.predict(X_te[:3], verbose=0).ravel()))</div>
  <div class="fx" data-lang="text">same predictions: True
['assets', 'fingerprint.pb', 'saved_model.pb', 'variables']
input : {'keras_tensor_5': TensorSpec(shape=(None, 5), dtype=tf.float32, name='keras_tensor_5')}
output: {'output_0': TensorSpec(shape=(None, 1), dtype=tf.float32, name='output_0')}
[0.2582 0.5278 0.3277]  same as predict: True</div>
  <p>The reloaded model gives identical predictions. The export folder contains the graph (<code>saved_model.pb</code>) and the weights (<code>variables/</code>). The exported <strong>signature</strong>, the named entry point that fixes the input and output shapes and types, says: input of shape (None, 5) in float32, meaning any number of orders with 5 features each, and output (None, 1). Calling <code>serve</code> on the loaded export returns the same probabilities as <code>predict</code>.</p>
  <p>Look closely at what goes in: <em>raw</em> features, kilometres and minutes, not normalised values. That works because the Normalization layer is part of the model, so the scaling travels with the graph. If you had scaled the features outside the model, for example with scikit-learn's StandardScaler, the server code would have to repeat exactly the same scaling, and any small difference, such as a different mean or a forgotten column, would make predictions silently wrong. That mismatch between how data is prepared in training and in production is called <strong>training/serving skew</strong>, and keeping preprocessing inside the model is the simplest way to avoid it.</p>
  <p><strong>TF Serving</strong> is a ready-made model server written in C++, usually run as a Docker container. You point it at the export folder, and it offers a REST endpoint on port 8501 and a gRPC endpoint on port 8500. A client sends JSON with a list called <code>instances</code>, one entry per order:</p>
    <div class="fx" data-lang="py">import json
body = json.dumps({"instances": np.round(X_te[:2].astype(float), 2).tolist()})     # raw features, 2 orders
print(body)</div>
  <div class="fx" data-lang="text">{"instances": [[5.4, 2.0, 14.0, 0.0, 0.0], [5.8, 5.0, 29.0, 0.0, 0.0]]}</div>
  <p>The server would be started and called with the commands below. They need Docker, which is not available where this page was built, so they are shown without output. The server replies with a JSON object whose <code>predictions</code> list holds one probability per order, the same numbers <code>serve()</code> returned above.</p>
  <div class="fx" data-lang="text">docker run -d --rm -p 8501:8501 \\
  -v "$PWD/export/late:/models/late" -e MODEL_NAME=late tensorflow/serving

curl -s -X POST localhost:8501/v1/models/late:predict -d @request.json</div>
  <p>The folder name <code>1</code> in <code>export/late/1</code> is a version number. If you export a better model to <code>export/late/2</code>, TF Serving notices the new folder, loads it and switches traffic to it without a restart, because by default it serves the highest version. The table summarises the formats:</p>
  <table class="tbl">
    <tr><th>Format</th><th>How</th><th>Use it for</th></tr>
    <tr><td><code>.keras</code> (architecture + weights + optimizer)</td><td><code>model.save("m.keras")</code>, <code>keras.models.load_model</code></td><td>continuing in Python, sharing with Keras users</td></tr>
    <tr><td>Weights only</td><td><code>model.save_weights("m.weights.h5")</code></td><td>when the same code rebuilds the architecture</td></tr>
    <tr><td>SavedModel (graph + weights + signature)</td><td><code>model.export("dir/1")</code></td><td>TF Serving, TFLite, other languages</td></tr>
    <tr><td><code>.h5</code> full model (legacy)</td><td>old <code>tf.keras</code></td><td>reading old projects only</td></tr>
  </table>

  <h2 id="tk-pt"><span class="num">09</span>Keras and PyTorch Side by Side</h2>
  <p>You will often read a model written in one framework and need it in the other, and interviewers like to ask "how would you do this in PyTorch?". The concepts map one to one; what differs is names and a few conventions. Like two languages that share grammar and most words but differ in script, once you learn the handful of differences you can move between them. Here is the translation table:</p>
  <table class="tbl">
    <tr><th>Concept</th><th>PyTorch</th><th>Keras 3 / TensorFlow</th></tr>
    <tr><td>Fully connected layer</td><td><code>nn.Linear(in, out)</code>, weight (out, in)</td><td><code>layers.Dense(out)</code>, kernel (in, out)</td></tr>
    <tr><td>Convolution, pooling</td><td><code>nn.Conv2d</code>, <code>nn.MaxPool2d</code></td><td><code>layers.Conv2D</code>, <code>layers.MaxPooling2D</code></td></tr>
    <tr><td>Image layout</td><td>NCHW (channels first)</td><td>NHWC (channels last)</td></tr>
    <tr><td>Embedding, dropout, batch norm</td><td><code>nn.Embedding</code>, <code>nn.Dropout</code>, <code>nn.BatchNorm2d</code></td><td><code>layers.Embedding</code>, <code>layers.Dropout</code>, <code>layers.BatchNormalization</code></td></tr>
    <tr><td>Custom model</td><td><code>nn.Module</code> with <code>forward()</code></td><td><code>keras.Model</code> with <code>call()</code>, or Sequential / Functional</td></tr>
    <tr><td>Training loop</td><td>written by hand</td><td><code>model.fit()</code>; custom loop with <code>GradientTape</code></td></tr>
    <tr><td>Gradients</td><td><code>loss.backward()</code></td><td><code>tape.gradient(loss, variables)</code></td></tr>
    <tr><td>Train / inference mode</td><td><code>model.train()</code>, <code>model.eval()</code></td><td>automatic in fit / predict; <code>training=True</code> in custom loops</td></tr>
    <tr><td>Input pipeline</td><td><code>Dataset</code> + <code>DataLoader</code></td><td><code>tf.data.Dataset</code></td></tr>
    <tr><td>Classification loss on logits</td><td><code>nn.CrossEntropyLoss()</code> (always logits)</td><td><code>SparseCategoricalCrossentropy(from_logits=True)</code></td></tr>
    <tr><td>Saving</td><td><code>torch.save(model.state_dict(), ...)</code></td><td><code>model.save("m.keras")</code></td></tr>
    <tr><td>Deployment</td><td>TorchScript / ONNX → TorchServe, Triton</td><td>SavedModel → TF Serving; TFLite, TF.js</td></tr>
    <tr><td>Device</td><td>explicit <code>.to("cuda")</code></td><td>uses a visible GPU automatically</td></tr>
  </table>
  <p>The convention that causes the most trouble is the image layout. An image batch is a 4-D tensor with a batch size N, a number of channels C (1 for grey, 3 for colour), a height H and a width W. PyTorch orders these as <strong>NCHW</strong> (channels first). Keras and TensorFlow use <strong>NHWC</strong> (channels last), which is also how image files store pixels. The convolution kernels differ the same way: PyTorch stores a conv weight as (C<sub>out</sub>, C<sub>in</sub>, k, k), Keras as (k, k, C<sub>in</sub>, C<sub>out</sub>).</p>
  <p>To see that the maths is truly the same, take the 5 × 5 road patch from the <a class="xref" data-note="dl_cnns">CNNs</a> note, where a vertical-edge filter (left column minus right column) found the left rim of a pothole with a peak value of 21. We load the same two filters, vertical and horizontal edges, into a Keras <code>Conv2D</code> and into PyTorch's <code>F.conv2d</code>, each with its own layout, and compare:</p>
    <div class="fx" data-lang="py">import torch, torch.nn.functional as F
patch = np.array([[8, 8, 8, 8, 8],
                  [8, 8, 2, 1, 8],
                  [8, 1, 0, 1, 8],
                  [8, 8, 1, 2, 8],
                  [8, 8, 8, 8, 8]], dtype="float32")        # the CNN note's road patch
K_edge = np.array([[1, 0, -1]] * 3, dtype="float32")       # vertical edges: left minus right

conv = layers.Conv2D(filters=2, kernel_size=3, use_bias=False)
conv.build((None, 5, 5, 1))
print("Keras kernel  ", tuple(conv.kernel.shape), "= (k, k, C_in, C_out)")
conv.kernel.assign(np.stack([K_edge, K_edge.T], axis=-1)[:, :, None, :])
k_out = conv(patch[None, :, :, None]).numpy()               # input (1, 5, 5, 1): channels LAST
print("Keras  in (1, 5, 5, 1) -&gt; out", k_out.shape)

w_t = torch.tensor(np.stack([K_edge, K_edge.T]))[:, None]   # (2, 1, 3, 3) = (C_out, C_in, k, k)
t_out = F.conv2d(torch.tensor(patch)[None, None], w_t).numpy()   # input (1, 1, 5, 5): channels FIRST
print("PyTorch in (1, 1, 5, 5) -&gt; out", t_out.shape, " weight", tuple(w_t.shape))
print("vertical-edge map (Keras)\\n", k_out[0, :, :, 0].astype(int))
print("same numbers in both:", np.allclose(k_out.transpose(0, 3, 1, 2), t_out))</div>
  <div class="fx" data-lang="text">Keras kernel   (3, 3, 1, 2) = (k, k, C_in, C_out)
Keras  in (1, 5, 5, 1) -&gt; out (1, 3, 3, 2)
PyTorch in (1, 1, 5, 5) -&gt; out (1, 2, 3, 3)  weight (2, 1, 3, 3)
vertical-edge map (Keras)
 [[ 14   7 -14]
 [ 21  13 -21]
 [ 15   6 -15]]
same numbers in both: True</div>
  <p>The Keras kernel has shape (3, 3, 1, 2) and the PyTorch weight (2, 1, 3, 3), holding the same 18 numbers. Keras takes the patch as (1, 5, 5, 1) and returns (1, 3, 3, 2), with the two maps in the last axis; PyTorch takes (1, 1, 5, 5) and returns (1, 2, 3, 3). The vertical-edge map is exactly the CNN note's [[14, 7, −14], [21, 13, −21], [15, 6, −15]], and after moving the channel axis of the Keras output to the front, all numbers agree. When you port weights between frameworks, getting these transposes wrong produces garbage with no error message.</p>
  <p>A small Keras CNN for 28 × 28 grey images shows the same layout in the shapes. Predict them first: with <code>padding="same"</code> (Keras's name for padding that keeps the size, PyTorch's <code>padding=1</code> for a 3 × 3 kernel) the first conv gives (None, 28, 28, 32) with 3·3·1·32 + 32 = 320 parameters; pooling halves it to 14 × 14; the second conv gives (None, 14, 14, 64) with 3·3·32·64 + 64 = 18,496; global average pooling leaves (None, 64); and Dense(10) has 64·10 + 10 = 650.</p>
    <div class="fx" data-lang="py">cnn = keras.Sequential([
    keras.Input(shape=(28, 28, 1)),                     # H, W, C  (channels last)
    layers.Conv2D(32, 3, padding="same", activation="relu"),
    layers.MaxPooling2D(2),
    layers.Conv2D(64, 3, padding="same", activation="relu"),
    layers.GlobalAveragePooling2D(),
    layers.Dense(10),
])
for l in cnn.layers:
    print(f"{l.__class__.__name__:24s} {str(l.output.shape):20s} {l.count_params()}")</div>
  <div class="fx" data-lang="text">Conv2D                   (None, 28, 28, 32)   320
MaxPooling2D             (None, 14, 14, 32)   0
Conv2D                   (None, 14, 14, 64)   18496
GlobalAveragePooling2D   (None, 64)           0
Dense                    (None, 10)           650</div>
  <p>Every shape and count matches, and the channels are always last. In PyTorch the first conv's output would be (N, 32, 28, 28). The same network is built in PyTorch in the <a class="xref" data-note="dl_cnns">CNNs</a> note.</p>
  <p>Which framework should you pick for a project? Mostly it depends on the ecosystem around the work rather than on the maths. If you are fine-tuning large language models, using Hugging Face, or reproducing a recent paper, PyTorch is the natural choice, because most new model code and pretrained checkpoints appear there first. If you want a standard model on tabular or image data quickly, Keras's <code>compile</code>, <code>fit</code> and callbacks get you there in a few lines. If the model must run on a phone, a microcontroller or in a browser, or the company already runs TF Serving or TFX pipelines, TensorFlow's deployment tools fit in directly. And since Keras 3 can run on the PyTorch or JAX backend, you can also write Keras code and run it on a different engine.</p>

  <h2 id="tk-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most frequent Keras bug is choosing a loss that does not match the labels. <code>categorical_crossentropy</code> expects one-hot labels, one vector per example; give it plain integer class labels and it fails with a shape error, or worse, with some shapes it trains on nonsense. Integer labels need the <code>sparse_</code> version:</p>
    <div class="fx" data-lang="py">labels = np.array([0, 2, 1])                                    # integer class labels
scores = np.array([[.7, .2, .1], [.1, .1, .8], [.2, .6, .2]])  # softmax outputs, 3 classes
try:
    keras.losses.CategoricalCrossentropy()(labels, scores)      # expects one-hot labels
except Exception as e:
    print(type(e).__name__, str(e).splitlines()[0][:150])
print("sparse_categorical_crossentropy:", round(float(keras.losses.SparseCategoricalCrossentropy()(labels, scores)), 4))</div>
  <div class="fx" data-lang="text">ValueError Arguments &#96;target&#96; and &#96;output&#96; must have the same rank (ndim). Received: target.shape=(3,), output.shape=(3, 3)
sparse_categorical_crossentropy: 0.3635</div>
  <p>The error says the labels have shape (3,) while the predictions have shape (3, 3). The sparse loss accepts the integers directly.</p>
  <p>A quieter mistake is a model whose last layer has no activation (it outputs logits) combined with a loss that expects probabilities. Keras then clips the raw scores into the range 0 to 1 and treats them as probabilities. Here three logits for orders labelled late, on-time, late are scored both ways:</p>
    <div class="fx" data-lang="py">logits = np.array([[2.0], [-1.0], [3.0]], dtype="float32")     # raw scores, no sigmoid applied
y = np.array([[1.], [0.], [1.]], dtype="float32")
print("treated as probabilities:", round(float(keras.losses.BinaryCrossentropy()(y, logits)), 4))
print("from_logits=True        :", round(float(keras.losses.BinaryCrossentropy(from_logits=True)(y, logits)), 4))</div>
  <div class="fx" data-lang="text">treated as probabilities: 0.0
from_logits=True        : 0.1629</div>
  <p>Treated as probabilities, the scores 2.0 and 3.0 are clipped to almost exactly 1 and −1.0 to almost 0, so the loss claims the predictions are perfect, 0.0, and the gradients are zero, so nothing would be learned. The correct loss with <code>from_logits=True</code> is 0.163. Whenever a model ends without sigmoid or softmax, pass <code>from_logits=True</code>.</p>
  <p><code>validation_split</code> takes the <em>last</em> fraction of the rows, without shuffling. If the data is sorted, for example by label or by date, the validation set is not representative at all:</p>
    <div class="fx" data-lang="py">order = np.argsort(y_tr)                       # rows sorted: all on-time orders first, late last
y_sorted = y_tr[order]
val_part = y_sorted[-640:]                     # what validation_split=0.2 would hold out
print("late rate  overall:", y_sorted.mean().round(3), " in the validation slice:", val_part.mean())</div>
  <div class="fx" data-lang="text">late rate  overall: 0.417  in the validation slice: 1.0</div>
  <p>About 42% of the orders are late, but if the rows were sorted by label, the 640 rows that <code>validation_split=0.2</code> would hold out are all late. Shuffle the data first, or pass an explicit <code>validation_data=</code>. Our data was generated in random order, so the split earlier was fine.</p>
  <p>Porting from PyTorch, people often feed a channels-first image into a Keras layer. Keras then reads the last axis as the channels. Our edge-filter layer expects 1 channel in the last axis, so a (1, 1, 5, 5) input fails loudly:</p>
    <div class="fx" data-lang="py">try:
    conv(np.zeros((1, 1, 5, 5), "float32"))   # PyTorch layout (N, C, H, W) into a Keras conv
except Exception as e:
    print(type(e).__name__, str(e).splitlines()[0][:170])</div>
  <div class="fx" data-lang="text">ValueError Input 0 with name 'None' of layer 'conv2d' is incompatible with the layer: expected axis -1 of input shape to have value 1, but received input with shape (1, 1, 5, 5)</div>
  <p>The error is the lucky case. A colour image of shape (N, 3, 32, 32) given to a layer built for 32 input channels would run without complaint and treat image rows as channels. Convert with a transpose to (N, H, W, C) first.</p>
  <p>Three more mistakes produce no error at all, only a worse model. Using EarlyStopping without <code>restore_best_weights=True</code> leaves you with the weights from the last epoch, which is <code>patience</code> epochs after the best one and slightly overfit. Calling <code>norm.adapt()</code> on all of the data, including the test rows, leaks test statistics into training; adapt on training rows only. And feeding a category such as a restaurant ID into a Dense layer as a plain number tells the model that restaurant 37 is "37 times" restaurant 1; use an Embedding, or one-hot encoding when there are only a few categories.</p>

  <h2 id="tk-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>TensorFlow</b>: Google's engine for tensors, automatic gradients, graph compilation, devices and deployment.</li>
    <li><b>Keras 3</b>: high-level model API; runs on TensorFlow, JAX or PyTorch backends. <code>import keras</code>.</li>
    <li><b>tf.constant</b>: immutable tensor. <b>tf.Variable</b>: mutable tensor; weights live here.</li>
    <li><b>GradientTape</b>: records operations inside its block; <code>tape.gradient(loss, vars)</code> returns derivatives.</li>
    <li><b>@tf.function</b>: traces a Python function once into a fast graph.</li>
    <li><b>Sequential</b>: one straight stack. <b>Functional</b>: any graph of layers. <b>Subclassing</b>: <code>keras.Model</code> + <code>call()</code>.</li>
    <li><b>compile</b>: attach optimizer, loss, metrics. <b>fit</b>: run the training loop, returns <b>History</b>.</li>
    <li><b>Callback</b>: object called by fit at fixed moments (e.g. each epoch end). <b>Patience</b>: epochs without improvement tolerated.</li>
    <li><b>Embedding</b>: trainable lookup table, ID → vector; params = number of IDs × vector size.</li>
    <li><b>tf.data.Dataset</b>: lazy pipeline; <b>prefetch</b> prepares the next batch in the background.</li>
    <li><b>SavedModel</b>: graph + weights + <b>signature</b> (fixed input/output spec) for serving.</li>
    <li><b>Training/serving skew</b>: production preprocesses data differently from training.</li>
    <li><b>NHWC</b> (Keras) vs <b>NCHW</b> (PyTorch) image layout.</li>
  </ul>
  <h3>Our running example in numbers</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Result</th></tr>
    <tr><td>One tape step on (2w − 4)², w = 3, lr 0.1</td><td>loss 4, gradient 8, new w 2.2</td></tr>
    <tr><td>Sequential: 5 → Normalization → Dense(16) → Dropout → Dense(1)</td><td>124 params (113 trainable, 11 non-trainable); test AUC ≈ 0.74 = true numeric rule</td></tr>
    <tr><td>Callbacks, 200 epochs requested</td><td>stopped early, best epoch restored, LR halved several times</td></tr>
    <tr><td>Functional + Embedding(50, 4) for restaurant</td><td>377 trainable params; test AUC ≈ 0.84 (best possible 0.846)</td></tr>
    <tr><td>tf.data, batch 64</td><td>2,560 rows → 40 batches</td></tr>
    <tr><td>Exported SavedModel</td><td>raw (None, 5) in → (None, 1) out; serve() = predict()</td></tr>
  </table>
  <h3>Parameter counts</h3>
  <table class="tbl">
    <tr><th>Layer</th><th>Formula</th><th>Example</th></tr>
    <tr><td>Dense(units) on n inputs</td><td>n·units + units</td><td>Dense(16) on 5 → 96</td></tr>
    <tr><td>Normalization on f features</td><td>2f + 1 (non-trainable)</td><td>5 features → 11</td></tr>
    <tr><td>Embedding(V, d)</td><td>V·d</td><td>50 × 4 → 200</td></tr>
    <tr><td>Conv2D(C<sub>out</sub>, k) on C<sub>in</sub></td><td>k·k·C<sub>in</sub>·C<sub>out</sub> + C<sub>out</sub></td><td>Conv2D(32, 3) on 1 → 320</td></tr>
  </table>
  <h3>Choosing the loss</h3>
  <table class="tbl">
    <tr><th>Labels</th><th>Last layer</th><th>Loss</th></tr>
    <tr><td>0 / 1</td><td>Dense(1, sigmoid)</td><td><code>binary_crossentropy</code></td></tr>
    <tr><td>integers 0..C−1</td><td>Dense(C, softmax)</td><td><code>sparse_categorical_crossentropy</code></td></tr>
    <tr><td>one-hot</td><td>Dense(C, softmax)</td><td><code>categorical_crossentropy</code></td></tr>
    <tr><td>any of the above, no final activation</td><td>Dense(…)</td><td>same loss with <code>from_logits=True</code></td></tr>
    <tr><td>number</td><td>Dense(1)</td><td><code>mse</code> / <code>mae</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import keras
from keras import layers

num_in  = keras.Input(shape=(5,), name="numeric")
rest_in = keras.Input(shape=(1,), dtype="int32", name="restaurant")
norm = layers.Normalization(); norm.adapt(X_train)          # train rows only
r = layers.Flatten()(layers.Embedding(50, 4)(rest_in))
z = layers.Dense(16, activation="relu")(layers.Concatenate()([norm(num_in), r]))
model = keras.Model([num_in, rest_in], layers.Dense(1, activation="sigmoid")(z))

model.compile("adam", "binary_crossentropy", metrics=[keras.metrics.AUC()])
cb = [keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True)]
model.fit(train_ds, validation_data=val_ds, epochs=200, callbacks=cb)
model.save("late.keras")          # keep working in Python
model.export("export/late/1")     # SavedModel for TF Serving

# custom step
with tf.GradientTape() as tape:
    loss = loss_fn(y, model(x, training=True))
grads = tape.gradient(loss, model.trainable_variables)
opt.apply_gradients(zip(grads, model.trainable_variables))</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Keras 2 (<code>tf.keras</code>, <code>.h5</code>, <code>save("dir")</code>) vs Keras 3 (<code>import keras</code>, <code>.keras</code>, <code>export()</code>).</li>
    <li>Integer labels → <code>sparse_</code> loss; no final activation → <code>from_logits=True</code>.</li>
    <li>EarlyStopping needs <code>restore_best_weights=True</code> to keep the best weights.</li>
    <li><code>validation_split</code> takes the last rows unshuffled.</li>
    <li>Adapt Normalization on training rows only; keep it inside the model for serving.</li>
    <li>tf.data: shuffle before batch, with a large buffer.</li>
    <li>Loss computed outside the tape → gradient <code>None</code>; tape usable once unless persistent.</li>
    <li><code>training=True</code> in custom loops; Python side effects in <code>@tf.function</code> run only at tracing.</li>
    <li>Keras is NHWC with kernels (k, k, C<sub>in</sub>, C<sub>out</sub>); PyTorch NCHW with (C<sub>out</sub>, C<sub>in</sub>, k, k).</li>
  </ul>

  <h2 id="tk-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the relationship between TensorFlow and Keras today?</summary><div class="qa-body">TensorFlow is the low-level engine: tensors, automatic differentiation, graph compilation, devices and deployment tools. Keras is the high-level API for building and training models. Since Keras 3 it is a separate multi-backend library that can run on TensorFlow, JAX or PyTorch; <code>tf.keras</code> is the older version bundled inside TensorFlow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>tf.constant</code> and <code>tf.Variable</code>?</summary><div class="qa-body">A constant is an immutable tensor; its values can never change. A Variable holds values that can be updated in place with <code>assign</code> or <code>assign_sub</code>, which is why model weights are Variables. Trainable Variables are also watched automatically by a GradientTape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>GradientTape</code> work, and what happens if you compute the loss outside it?</summary><div class="qa-body">Operations executed inside the <code>with tf.GradientTape()</code> block are recorded; <code>tape.gradient(loss, vars)</code> then applies the chain rule backwards over that record. If the loss is computed outside the block, nothing links it to the variables, so the gradient is <code>None</code> and the model does not learn. A tape can be used once unless created with <code>persistent=True</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>compile</code>, <code>fit</code>, <code>evaluate</code> and <code>predict</code> each do?</summary><div class="qa-body"><code>compile</code> attaches the optimizer, loss and metrics without training anything. <code>fit</code> runs the training loop over epochs and batches, optionally with validation and callbacks, and returns a History of per-epoch metrics. <code>evaluate</code> computes loss and metrics on given data, and <code>predict</code> returns model outputs for new inputs in inference mode.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>None</code> mean in an output shape like <code>(None, 16)</code>?</summary><div class="qa-body">It is the batch dimension, left unspecified so the model accepts any number of examples. The 16 is the number of features per example, here the units of a Dense layer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many parameters does <code>Dense(16)</code> have on 30 inputs? And <code>Embedding(50, 4)</code>?</summary><div class="qa-body">Dense: 30 × 16 weights plus 16 biases = 496. Embedding: one 4-number row per ID, 50 × 4 = 200, with no bias.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Labels are integers 0–9 and the last layer is <code>Dense(10)</code> with no activation. Which loss?</summary><div class="qa-body"><code>SparseCategoricalCrossentropy(from_logits=True)</code>. "Sparse" because the labels are integers rather than one-hot vectors, and <code>from_logits=True</code> because the layer outputs raw scores, not softmax probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When must you use the Functional API instead of Sequential?</summary><div class="qa-body">Whenever the model is not one straight stack: several inputs (numbers plus IDs plus text), several outputs (multi-task heads), branches that merge, skip or residual connections, or layers shared between branches. Sequential can only express one input flowing through layers in a line to one output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use an Embedding for a category such as a restaurant ID instead of feeding the number?</summary><div class="qa-body">An ID is a name, not a quantity: restaurant 37 is not 37 times restaurant 1, but a Dense layer would treat it that way. An Embedding gives each ID its own learned vector, so similar categories can end up with similar vectors. With only a few categories, one-hot encoding also works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EarlyStopping with <code>patience=10</code> stopped training. Which weights does the model have?</summary><div class="qa-body">With <code>restore_best_weights=True</code>, the weights from the epoch with the best monitored value, ten epochs before the stop. Without it, the weights from the final epoch, which are slightly worse because they come from ten epochs without improvement.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>prefetch</code> do in a tf.data pipeline, and why must <code>shuffle</code> come before <code>batch</code>?</summary><div class="qa-body"><code>prefetch</code> prepares upcoming batches in the background while the model trains on the current one, so the accelerator does not wait for input. Shuffling before batching mixes individual examples; shuffling after batching only reorders whole batches, so each batch keeps the same examples every epoch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the four lines of a GradientTape training step. Why is there no <code>zero_grad</code>?</summary><div class="qa-body"><code>with tf.GradientTape() as tape:</code>, then <code>loss = loss_fn(y, model(x, training=True))</code>, then <code>grads = tape.gradient(loss, model.trainable_variables)</code>, then <code>opt.apply_gradients(zip(grads, model.trainable_variables))</code>. TensorFlow returns gradients as new tensors from a fresh tape each step instead of accumulating them on the weights, so there is nothing to clear.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>@tf.function</code> do, and what is a common surprise with it?</summary><div class="qa-body">It traces the Python function once into a TensorFlow graph, which then runs much faster and can be exported. The surprise is that Python side effects such as <code>print</code> or appending to a list happen only during tracing, not on every call; use <code>tf.print</code> for printing inside the graph. Calling it with new input shapes or Python values can also trigger retracing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you write a custom training loop instead of using <code>fit()</code>?</summary><div class="qa-body">When the training step is unusual: GANs with two optimizers, losses that need intermediate outputs, gradient manipulation such as per-group clipping or accumulation, or research ideas. If you only need a custom step, override <code>train_step</code> in a <code>keras.Model</code> subclass so you keep fit's callbacks, validation and logging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>.keras file vs SavedModel: which is for what?</summary><div class="qa-body">A <code>.keras</code> file holds the full Keras model (architecture, weights, optimizer state) for reloading in Python and continuing to train. A SavedModel from <code>model.export()</code> is a language-neutral graph with signatures for inference, used by TF Serving, TFLite conversion and non-Python runtimes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is training/serving skew and how do you prevent it in Keras?</summary><div class="qa-body">It is when production prepares inputs differently from training, for example scaling with a different mean or forgetting a column, so the model receives inputs it was not trained on and predictions go wrong silently. Putting preprocessing such as a Normalization layer inside the model ships it with the exported graph, so the server sends raw features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does TF Serving roll out a new model version?</summary><div class="qa-body">It watches the model's base folder. Exporting to a new numbered subfolder such as <code>2/</code> makes it load that version and, by default, switch traffic to the highest version without a restart. Clients can also request a specific version in the URL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You are porting a PyTorch CNN to Keras. What commonly breaks?</summary><div class="qa-body">The layout: PyTorch is NCHW and Keras NHWC, so inputs must be transposed and conv weights rearranged from (C<sub>out</sub>, C<sub>in</sub>, k, k) to (k, k, C<sub>in</sub>, C<sub>out</sub>); Dense kernels are (in, out) versus Linear's (out, in). Logits: PyTorch's CrossEntropyLoss always takes logits, so in Keras you need <code>from_logits=True</code>. BatchNorm momentum is also defined the other way round (PyTorch 0.1 corresponds to Keras 0.9).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose Keras/TensorFlow over PyTorch, and the reverse?</summary><div class="qa-body">Keras/TensorFlow suits fast standard models with fit and callbacks, existing TF Serving or TFX infrastructure, and deployment to phones (TFLite) or browsers (TF.js). PyTorch suits research, LLM fine-tuning and the Hugging Face ecosystem, where most new code and checkpoints appear first. Keras 3 can also run on the PyTorch or JAX backend, which blurs the choice.</div></details>
</main>`
});
