// notes/mathstats/m_linalg.js — Linear Algebra
Object.assign(TOPIC_CONTENT, {
  "m_linalg": `<main>
  <h1>Linear Algebra</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Math for ML</span><span>Linear Algebra</span></div>
  <p class="lead">Linear algebra is the maths of lists of numbers, called vectors, and tables of numbers, called matrices. It matters for ML because almost everything a model touches is one of these: a customer is a row of numbers, a dataset is a table, a word embedding is a list of 768 numbers, and a neural-network layer is one table multiplied by another. When you call <code>LinearRegression().fit</code>, search a vector database or run PCA, the library is doing the handful of operations explained on this page, and knowing them is what lets you read shape errors, choose between cosine and Euclidean distance, or explain why duplicate features break a regression. One small running example is used everywhere: three houses described by their size and number of rooms, with a price for each. Every idea is worked out by hand on those three houses first and then checked with NumPy, and the same houses return in <a class="xref" data-note="m_calculus">Calculus</a> and <a class="xref" data-note="m_optimization">Optimization</a>.</p>

  <h2 id="mla-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linear Algebra</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Vectors</div>
        <ul>
          <li><b>Vector</b>: one row of data, or an arrow; B = [2, 3]</li>
          <li><b>L2 norm</b>: straight-line length, √(Σx²); <b>L1</b>: Σ|x|</li>
          <li><b>Distance</b>: ‖a − b‖; scale features first</li>
          <li><b>Dot product</b>: Σaᵢbᵢ; <b>cosine</b>: angle only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrices</div>
        <ul>
          <li><b>Xw</b>: one prediction per row</li>
          <li>A matrix moves points; its columns are where the axes land</li>
          <li>(n×k)(k×m) → (n×m); AB ≠ BA</li>
          <li><b>XᵀX</b>: every feature dotted with every feature</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Solving</div>
        <ul>
          <li><b>Inverse</b> undoes a matrix; needs det ≠ 0</li>
          <li><b>Normal equations</b>: XᵀX w = Xᵀy</li>
          <li><b>Rank</b> drops with duplicate columns → ridge</li>
          <li>Use <code>solve</code> / <code>lstsq</code>, not <code>inv</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Natural directions</div>
        <ul>
          <li><b>Eigenvector</b>: Av = λv, a direction only stretched</li>
          <li><b>SVD</b>: any matrix = rotate · stretch · rotate</li>
          <li><b>PCA</b>: centre → covariance → eigenvectors → project</li>
          <li>σ² of X = eigenvalues of XᵀX</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mla-vec"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Vectors</span><span class="rm-sub">one house as a list of numbers, and the whole table</span></div></div>
      <div class="rm-item rm-done" data-target="mla-norm"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Norms and Distance</span><span class="rm-sub">how big a vector is, how far apart two are</span></div></div>
      <div class="rm-item rm-done" data-target="mla-dot"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Dot Product and Cosine Similarity</span><span class="rm-sub">do two vectors point the same way?</span></div></div>
      <div class="rm-item rm-done" data-target="mla-mat"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Matrix × Vector</span><span class="rm-sub">pricing every house at once; a matrix moves points</span></div></div>
      <div class="rm-item rm-done" data-target="mla-mul"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Matrix × Matrix and Transpose</span><span class="rm-sub">shape rules, order, XᵀX, neural layers</span></div></div>
      <div class="rm-item rm-done" data-target="mla-inv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Matrix Inverse, Rank and the Normal Equations</span><span class="rm-sub">solving for the best weights, and when you can't</span></div></div>
      <div class="rm-item rm-done" data-target="mla-eig"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Eigenvectors and Eigenvalues</span><span class="rm-sub">directions a matrix only stretches</span></div></div>
      <div class="rm-item rm-done" data-target="mla-svd"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Singular Value Decomposition</span><span class="rm-sub">any table as rotate, stretch, rotate</span></div></div>
      <div class="rm-item rm-done" data-target="mla-pca"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Principal Component Analysis</span><span class="rm-sub">replacing many columns with a few</span></div></div>
      <div class="rm-item rm-done" data-target="mla-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">* vs @, inv, unscaled PCA, signs</span></div></div>
      <div class="rm-item rm-done" data-target="mla-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, code, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="mla-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the linear-algebra questions DS/ML interviews ask</span></div></div>
    </div>
  </div>

  <h2 id="mla-vec"><span class="num">01</span>Vectors</h2>
  <p>A computer cannot look at a house, a photo or a sentence. It can only do arithmetic. So before any model can compare houses or predict their prices, each house has to be written down as numbers, and written down the same way every time. The simplest way is to pick a few measurements, fix their order, and record each house as a short list. Here are the three houses used throughout this page, with size in thousands of square feet and price in ₹ crore:</p>
  <table class="tbl">
    <tr><th>House</th><th>Size (1000 sq ft)</th><th>Rooms</th><th>Price (₹ crore)</th></tr>
    <tr><td>A</td><td>1</td><td>1</td><td>2</td></tr>
    <tr><td>B</td><td>2</td><td>3</td><td>4</td></tr>
    <tr><td>C</td><td>3</td><td>2</td><td>6</td></tr>
  </table>
  <p>House C is a large open-plan flat: the biggest of the three, but with fewer rooms than B. Notice that every price is exactly 2 × size; the rooms seem not to matter. Keep that in mind, because section 06 will discover it from the numbers alone.</p>
  <p>Writing house B as <code>[2, 3]</code> makes it a <strong>vector</strong>, which is simply an ordered list of numbers. Each number is called an <strong>entry</strong> (or component), and how many entries there are is the vector's <strong>dimension</strong>; our houses are 2-dimensional. A single number on its own, like B's price of 4, is called a <strong>scalar</strong>. Stack the three house vectors on top of each other and you get a <strong>matrix</strong>, a rectangular table of numbers, usually named with a capital letter such as X. Its <strong>shape</strong> is written rows × columns: our X has one row per house and one column per measurement, so it is 3 × 2. In ML language, the rows are <em>samples</em> and the columns are <em>features</em>, and the prices we want to predict form a separate vector y.</p>
  <p>Think of a property website where every listing card has the same fields in the same order. One card is a vector; the whole page of cards is a matrix. The order is what gives the numbers meaning: <code>[2, 3]</code> means "size 2, rooms 3" only because every row uses that order, and swapping the two numbers would describe a different house.</p>
  <p>A vector also has a picture. Draw two axes, size across and rooms up, and house B becomes the point (2, 3), or equally an arrow from the origin (0, 0) to that point. The point picture is how we think of a data row; the arrow picture is how we will think about lengths and angles in the next two sections.</p>
  <figure class="viz"><svg viewBox="0 0 340.823547 260.271219" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:560px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="hsfigure_1">
  <g id="hspatch_1">
   <path d="M 0 260.271219 
L 340.823547 260.271219 
L 340.823547 0 
L 0 0 
L 0 260.271219 
z
" style="fill: none"/>
  </g>
  <g id="hsaxes_1">
   <g id="hspatch_2">
    <path d="M 45.335547 217.872 
L 333.623547 217.872 
L 333.623547 7.2 
L 45.335547 7.2 
L 45.335547 217.872 
z
" style="fill: none"/>
   </g>
   <g id="hsmatplotlib.axis_1">
    <g id="hsxtick_1">
     <g id="hsline2d_1">
      <defs>
       <path id="hsm09e2f903c0" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#hsm09e2f903c0" x="45.335547" y="217.872" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="45.335547" y="234.5595" transform="rotate(-0 45.335547 234.5595)">0</text>
     </g>
    </g>
    <g id="hsxtick_2">
     <g id="hsline2d_2">
      <g>
       <use xlink:href="#hsm09e2f903c0" x="100.775547" y="217.872" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="100.775547" y="234.5595" transform="rotate(-0 100.775547 234.5595)">1</text>
     </g>
    </g>
    <g id="hsxtick_3">
     <g id="hsline2d_3">
      <g>
       <use xlink:href="#hsm09e2f903c0" x="156.215547" y="217.872" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="156.215547" y="234.5595" transform="rotate(-0 156.215547 234.5595)">2</text>
     </g>
    </g>
    <g id="hsxtick_4">
     <g id="hsline2d_4">
      <g>
       <use xlink:href="#hsm09e2f903c0" x="211.655547" y="217.872" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="211.655547" y="234.5595" transform="rotate(-0 211.655547 234.5595)">3</text>
     </g>
    </g>
    <g id="hsxtick_5">
     <g id="hsline2d_5">
      <g>
       <use xlink:href="#hsm09e2f903c0" x="267.095547" y="217.872" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="267.095547" y="234.5595" transform="rotate(-0 267.095547 234.5595)">4</text>
     </g>
    </g>
    <g id="hsxtick_6">
     <g id="hsline2d_6">
      <g>
       <use xlink:href="#hsm09e2f903c0" x="322.535547" y="217.872" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_6">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="322.535547" y="234.5595" transform="rotate(-0 322.535547 234.5595)">5</text>
     </g>
    </g>
    <g id="hstext_7">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="189.479547" y="250.659109" transform="rotate(-0 189.479547 250.659109)">size (1000 sq ft)</text>
    </g>
   </g>
   <g id="hsmatplotlib.axis_2">
    <g id="hsytick_1">
     <g id="hsline2d_7">
      <defs>
       <path id="hsma2058d5495" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#hsma2058d5495" x="45.335547" y="217.872" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.335547" y="222.71575" transform="rotate(-0 38.335547 222.71575)">0.0</text>
     </g>
    </g>
    <g id="hsytick_2">
     <g id="hsline2d_8">
      <g>
       <use xlink:href="#hsma2058d5495" x="45.335547" y="190.152" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.335547" y="194.99575" transform="rotate(-0 38.335547 194.99575)">0.5</text>
     </g>
    </g>
    <g id="hsytick_3">
     <g id="hsline2d_9">
      <g>
       <use xlink:href="#hsma2058d5495" x="45.335547" y="162.432" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_10">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.335547" y="167.27575" transform="rotate(-0 38.335547 167.27575)">1.0</text>
     </g>
    </g>
    <g id="hsytick_4">
     <g id="hsline2d_10">
      <g>
       <use xlink:href="#hsma2058d5495" x="45.335547" y="134.712" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_11">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.335547" y="139.55575" transform="rotate(-0 38.335547 139.55575)">1.5</text>
     </g>
    </g>
    <g id="hsytick_5">
     <g id="hsline2d_11">
      <g>
       <use xlink:href="#hsma2058d5495" x="45.335547" y="106.992" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_12">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.335547" y="111.83575" transform="rotate(-0 38.335547 111.83575)">2.0</text>
     </g>
    </g>
    <g id="hsytick_6">
     <g id="hsline2d_12">
      <g>
       <use xlink:href="#hsma2058d5495" x="45.335547" y="79.272" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_13">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.335547" y="84.11575" transform="rotate(-0 38.335547 84.11575)">2.5</text>
     </g>
    </g>
    <g id="hsytick_7">
     <g id="hsline2d_13">
      <g>
       <use xlink:href="#hsma2058d5495" x="45.335547" y="51.552" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_14">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.335547" y="56.39575" transform="rotate(-0 38.335547 56.39575)">3.0</text>
     </g>
    </g>
    <g id="hsytick_8">
     <g id="hsline2d_14">
      <g>
       <use xlink:href="#hsma2058d5495" x="45.335547" y="23.832" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="hstext_15">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.335547" y="28.67575" transform="rotate(-0 38.335547 28.67575)">3.5</text>
     </g>
    </g>
    <g id="hstext_16">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="16.8875" y="112.536" transform="rotate(-90 16.8875 112.536)">rooms</text>
    </g>
   </g>
   <g id="hsline2d_15">
    <defs>
     <path id="hsmfd903e4c69" d="M 0 3 
C 0.795609 3 1.55874 2.683901 2.12132 2.12132 
C 2.683901 1.55874 3 0.795609 3 0 
C 3 -0.795609 2.683901 -1.55874 2.12132 -2.12132 
C 1.55874 -2.683901 0.795609 -3 0 -3 
C -0.795609 -3 -1.55874 -2.683901 -2.12132 -2.12132 
C -2.683901 -1.55874 -3 -0.795609 -3 0 
C -3 0.795609 -2.683901 1.55874 -2.12132 2.12132 
C -1.55874 2.683901 -0.795609 3 0 3 
z
" style="stroke: #9aa5b1"/>
    </defs>
    <g clip-path="url(#hspb4bc634acc)">
     <use xlink:href="#hsmfd903e4c69" x="100.775547" y="162.432" style="fill: #9aa5b1; stroke: #9aa5b1"/>
    </g>
   </g>
   <g id="hsline2d_16">
    <defs>
     <path id="hsmd1faf0f1cc" d="M 0 3 
C 0.795609 3 1.55874 2.683901 2.12132 2.12132 
C 2.683901 1.55874 3 0.795609 3 0 
C 3 -0.795609 2.683901 -1.55874 2.12132 -2.12132 
C 1.55874 -2.683901 0.795609 -3 0 -3 
C -0.795609 -3 -1.55874 -2.683901 -2.12132 -2.12132 
C -2.683901 -1.55874 -3 -0.795609 -3 0 
C -3 0.795609 -2.683901 1.55874 -2.12132 2.12132 
C -1.55874 2.683901 -0.795609 3 0 3 
z
" style="stroke: #2a78d6"/>
    </defs>
    <g clip-path="url(#hspb4bc634acc)">
     <use xlink:href="#hsmd1faf0f1cc" x="156.215547" y="51.552" style="fill: #2a78d6; stroke: #2a78d6"/>
    </g>
   </g>
   <g id="hsline2d_17">
    <defs>
     <path id="hsm40f4b78d45" d="M 0 3 
C 0.795609 3 1.55874 2.683901 2.12132 2.12132 
C 2.683901 1.55874 3 0.795609 3 0 
C 3 -0.795609 2.683901 -1.55874 2.12132 -2.12132 
C 1.55874 -2.683901 0.795609 -3 0 -3 
C -0.795609 -3 -1.55874 -2.683901 -2.12132 -2.12132 
C -2.683901 -1.55874 -3 -0.795609 -3 0 
C -3 0.795609 -2.683901 1.55874 -2.12132 2.12132 
C -1.55874 2.683901 -0.795609 3 0 3 
z
" style="stroke: #e8743b"/>
    </defs>
    <g clip-path="url(#hspb4bc634acc)">
     <use xlink:href="#hsm40f4b78d45" x="211.655547" y="106.992" style="fill: #e8743b; stroke: #e8743b"/>
    </g>
   </g>
   <g id="hsline2d_18">
    <path d="M 156.215547 51.552 
L 211.655547 106.992 
" clip-path="url(#hspb4bc634acc)" style="fill: none; stroke-dasharray: 6.66,2.88; stroke-dashoffset: 0; stroke: #2e9e5b; stroke-width: 1.8"/>
   </g>
   <g id="hsline2d_19">
    <path d="M 100.775547 162.432 
L 156.215547 51.552 
" clip-path="url(#hspb4bc634acc)" style="fill: none; stroke-dasharray: 1.5,2.475; stroke-dashoffset: 0; stroke: #2e9e5b; stroke-width: 1.5"/>
   </g>
   <g id="hsline2d_20">
    <path d="M 151.431944 147.141069 
L 150.459248 145.703325 
L 149.46707 144.278957 
L 148.455594 142.868227 
L 147.425007 141.471397 
L 146.375501 140.088725 
L 145.30727 138.720469 
L 144.220511 137.366882 
L 143.115427 136.028214 
L 141.992221 134.704714 
L 140.851103 133.396627 
L 139.692283 132.104195 
L 138.515977 130.827658 
L 137.322403 129.567252 
L 136.111781 128.323211 
L 134.884335 127.095766 
L 133.640295 125.885144 
L 132.379889 124.691569 
L 131.103352 123.515263 
L 129.81092 122.356444 
L 128.502833 121.215326 
L 127.179333 120.09212 
L 125.840665 118.987036 
L 124.487077 117.900277 
L 123.118821 116.832046 
L 121.73615 115.782539 
L 120.33932 114.751953 
L 118.92859 113.740477 
L 117.504222 112.748299 
L 116.066478 111.775603 
" clip-path="url(#hspb4bc634acc)" style="fill: none; stroke: currentColor; stroke-linecap: square"/>
   </g>
   <g id="hspatch_3">
    <path d="M 45.335547 217.872 
L 45.335547 7.2 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="hspatch_4">
    <path d="M 45.335547 217.872 
L 333.623547 217.872 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="hspatch_5">
    <path d="M 46.746587 216.46096 
Q 73.053718 190.153829 97.779709 165.427838 
" style="fill: none; stroke: #9aa5b1; stroke-width: 2; stroke-linecap: round"/>
    <path d="M 93.537069 166.842051 
L 97.779709 165.427838 
L 96.365496 169.670478 
z
" style="fill: #9aa5b1; stroke: #9aa5b1; stroke-width: 2; stroke-linecap: round"/>
   </g>
   <g id="hspatch_6">
    <path d="M 46.443738 216.209714 
Q 100.774385 134.713743 153.864685 55.078293 
" style="fill: none; stroke: #2a78d6; stroke-width: 2; stroke-linecap: round"/>
    <path d="M 149.981783 57.297094 
L 153.864685 55.078293 
L 153.309984 59.515895 
z
" style="fill: #2a78d6; stroke: #2a78d6; stroke-width: 2; stroke-linecap: round"/>
   </g>
   <g id="hspatch_7">
    <path d="M 46.997833 216.763809 
Q 128.493804 162.433162 208.129253 109.342862 
" style="fill: none; stroke: #e8743b; stroke-width: 2; stroke-linecap: round"/>
    <path d="M 203.691652 109.897563 
L 208.129253 109.342862 
L 205.910453 113.225764 
z
" style="fill: #e8743b; stroke: #e8743b; stroke-width: 2; stroke-linecap: round"/>
   </g>
   <g id="hstext_17">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="107.428347" y="177.9552" transform="rotate(-0 107.428347 177.9552)">A = [1, 1]</text>
   </g>
   <g id="hstext_18">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="131.267547" y="44.8992" transform="rotate(-0 131.267547 44.8992)">B = [2, 3]</text>
   </g>
   <g id="hstext_19">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="216.090747" y="113.6448" transform="rotate(-0 216.090747 113.6448)">C = [3, 2]</text>
   </g>
   <g id="hstext_20">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #2e9e5b" transform="translate(190.588347 59.511952)">distance B–C</text>
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #2e9e5b" transform="translate(190.588347 70.4016)">= √2 = 1.41</text>
   </g>
   <g id="hstext_21">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #2e9e5b" transform="translate(56.423547 79.470352)">distance A–B</text>
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #2e9e5b" transform="translate(56.423547 90.36)">= √5 = 2.24</text>
   </g>
   <g id="hstext_22">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit" transform="translate(175.619547 165.402352)">angle between</text>
    <text fill="currentColor" style="font-size: 9px; font-family: inherit" transform="translate(175.619547 176.292)">B and C: cos = 0.92</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="hspb4bc634acc">
   <rect x="45.335547" y="7.2" width="288.288" height="210.672"/>
  </clipPath>
 </defs>
</svg><figcaption>The three houses as arrows from the origin. The dashed green lines are the distances worked out in section 02 (B and C are closest), and the arc marks the angle between B and C used for cosine similarity in section 03.</figcaption></figure>
  <p>In NumPy a vector is a 1-D array and a matrix is a 2-D array. The code below builds the running example; every later code block on this page uses these same <code>X</code>, <code>y</code>, <code>A</code>, <code>B</code> and <code>C</code>.</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)

# columns: [size in 1000 sq ft, rooms]
X = np.array([[1., 1.],     # house A
              [2., 3.],     # house B
              [3., 2.]])    # house C
y = np.array([2., 4., 6.])  # price of each house, Rs crore

A, B, C = X                 # each row is one house vector
print("house B:", B, "  shape:", B.shape)
print("size column:", X[:, 0])
print("table:", X.shape, "  prices:", y.shape)
print(B + C, 2 * B)         # vectors add and scale entry by entry</div>
  <div class="fx" data-lang="text">house B: [2. 3.]   shape: (2,)
size column: [1. 2. 3.]
table: (3, 2)   prices: (3,)
[5. 5.] [4. 6.]</div>
  <p><code>A, B, C = X</code> unpacks the three rows into three vectors. B has shape <code>(2,)</code>, meaning a 1-D array of two numbers, while the table has shape <code>(3, 2)</code> and the prices <code>(3,)</code>. <code>X[:, 0]</code> reads down the first column, the sizes of all three houses. The last line shows the two basic things you can do with vectors: add them entry by entry (B + C = [2 + 3, 3 + 2] = [5, 5]) and multiply by a scalar, which multiplies every entry (2 × B = [4, 6]). In the arrow picture, adding places one arrow on the tip of the other, and scaling makes an arrow longer or shorter without changing its direction. Everything else on this page is built from these two operations plus "multiply matching entries and add".</p>
  <p>This is exactly how real data looks to a model. A customer with eight attributes is a vector of dimension 8, and 1,000 such customers form a 1000 × 8 matrix. A 28 × 28 greyscale image is flattened into a vector of 784 pixel values. A word in a language model is an <strong>embedding</strong>, a vector of a few hundred numbers chosen so that words with similar meanings get similar vectors. Training is mostly multiplying such tables together, millions of times, which is why GPUs, chips built to multiply tables fast, became the hardware of ML.</p>

  <h2 id="mla-norm"><span class="num">02</span>Norms and Distance</h2>
  <p>Now that houses are vectors, the first useful question is "which house is most like B?". Methods such as k-nearest neighbours (kNN) and k-means clustering run entirely on the answer to that kind of question. To answer it we need two numbers: how big a single vector is, and how far apart two vectors are.</p>
  <p>The size of a vector is called its <strong>norm</strong>, written ‖v‖ and read "the length of v". The usual one is the <strong>L2 norm</strong>, the straight-line length of the arrow. Think of an auto-rickshaw trip that goes 3 km east and then 4 km north. A drone flying straight from start to end covers √(3² + 4²) = √25 = 5 km: that is Pythagoras' theorem, and it is the L2 norm of [3, 4]. The auto's meter, which can only follow the roads, reads 3 + 4 = 7 km: that is the <strong>L1 norm</strong>, the sum of the sizes of the entries, sometimes called the taxicab or Manhattan length. A third one, the <strong>L∞ norm</strong> (L-infinity), is just the largest entry in absolute value, 4 here.</p>
  <p>In symbols, for a vector x with entries x₁, x₂, … , x<sub>d</sub>: the L2 norm is <code>‖x‖₂ = √(x₁² + x₂² + … + x<sub>d</sub>²)</code>, the L1 norm is <code>‖x‖₁ = |x₁| + |x₂| + … + |x<sub>d</sub>|</code>, and the L∞ norm is <code>max |xᵢ|</code>. Here Σ, which you will see in the compact versions <code>√(Σxᵢ²)</code> and <code>Σ|xᵢ|</code>, means "add up over every entry i", and |x| means "x without its minus sign". The L2 norm squares the entries first, so it punishes one big entry more than several small ones; the L1 norm treats every unit the same wherever it is. That difference is why the L2 penalty in ridge regression shrinks all weights a little, while the L1 penalty in lasso pushes some weights to exactly zero (see <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>).</p>
  <p>The <strong>distance</strong> between two vectors is the norm of their difference, <code>‖a − b‖</code>: subtract entry by entry to get the arrow from one point to the other, then measure that arrow. Worked on our houses: ‖B‖ = √(2² + 3²) = √13 ≈ 3.606. From A to B the difference is B − A = [1, 2], so the distance is √(1 + 4) = √5 ≈ 2.236. From B to C it is C − B = [1, −1], distance √2 ≈ 1.414, and from A to C it is [2, 1], again √5. So B's nearest neighbour is C. Dividing a vector by its own length gives a <strong>unit vector</strong>, which keeps the direction and has length exactly 1: B / 3.606 = [0.555, 0.832]. Unit vectors are like compass needles, all direction and no size, and they become important in the next section.</p>
  <div class="fx" data-lang="py">print(np.linalg.norm(B))                   # L2 length: sqrt(2² + 3²)
print(np.abs(B).sum(), np.abs(B).max())    # L1 and L-infinity lengths
print(B / np.linalg.norm(B))               # unit vector: direction only
print(round(np.linalg.norm(B - A), 3),     # distance A to B
      round(np.linalg.norm(C - B), 3),     # distance B to C
      round(np.linalg.norm(C - A), 3))     # distance A to C</div>
  <div class="fx" data-lang="text">3.605551275463989
5.0 3.0
[0.555 0.832]
2.236 1.414 2.236</div>
  <p><code>np.linalg.norm</code> computes the L2 norm by default, and NumPy agrees with the hand calculation: 3.606 for B. The L1 and L∞ lengths are 5 and 3. Dividing by the norm gives the unit vector [0.555, 0.832] (you can check 0.555² + 0.832² ≈ 1). The three distances, 2.236, 1.414 and 2.236, confirm that B and C are the closest pair.</p>
  <p>Distances have one serious weakness: they add up raw differences, so they depend completely on the units you happen to use. Watch what happens when size is recorded in plain square feet (1000, 2000, 3000) instead of thousands:</p>
  <div class="fx" data-lang="py">Xft = X * np.array([1000, 1])              # size in plain square feet
Aft, Bft, Cft = Xft
print(Xft)
print(round(np.linalg.norm(Bft - Aft), 3), round(np.linalg.norm(Cft - Bft), 3))

Z = (Xft - Xft.mean(axis=0)) / Xft.std(axis=0)   # standardise each column
print(Z)
print(round(np.linalg.norm(Z[1] - Z[0]), 3), round(np.linalg.norm(Z[2] - Z[1]), 3))</div>
  <div class="fx" data-lang="text">[[1000.    1.]
 [2000.    3.]
 [3000.    2.]]
1000.002 1000.0
[[-1.225 -1.225]
 [ 0.     1.225]
 [ 1.225  0.   ]]
2.739 1.732</div>
  <p>Both distances jump to about 1000. The room differences, 2 rooms between A and B and 1 between B and C, have vanished, because a difference of 1000 square feet swamps a difference of 2 rooms once both are squared and added. Nothing about the houses changed, only a unit, and yet the notion of "nearest" is now decided by size alone. The standard fix is to <strong>standardise</strong> each column before computing distances: subtract the column's mean and divide by its standard deviation (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>), so that every feature is measured in "standard deviations from average" and has an equal say. After standardising, the distances are 2.739 and 1.732, and the room differences count again. Any method built on distances, including kNN, k-means, SVMs with an RBF kernel and PCA, needs this step whenever features have different units.</p>

  <h2 id="mla-dot"><span class="num">03</span>Dot Product and Cosine Similarity</h2>
  <p>Distance says B is closest to C. But look at A = [1, 1] and B = [2, 3] in the figure: their arrows point in almost the same direction. A is a small house and B a bigger one with a similar mix of floor area and rooms. Distance cannot see this, because it mixes two questions, "how big?" and "what kind?". Many real problems only care about the second. Two documents about cricket should count as similar even if one is ten times longer, and two users with the same tastes should match even if one rates far more films. We need a number that compares direction and ignores length.</p>
  <p>The tool for this is the <strong>dot product</strong>: multiply two vectors entry by entry and add the results. For A and B that is 1×2 + 1×3 = 5; for B and C it is 2×3 + 3×2 = 12; for A and C, 1×3 + 1×2 = 5. In symbols, <code>a·b = a₁b₁ + a₂b₂ + … + a<sub>d</sub>b<sub>d</sub> = Σ aᵢbᵢ</code>. The result is a single scalar, and it measures how much the two vectors "agree": it is large and positive when both are big in the same positions, zero when they share nothing, and negative when one is big where the other is negative.</p>
  <p>The dot product has a second, geometric formula that explains what it measures: <code>a·b = ‖a‖ × ‖b‖ × cos θ</code>, where θ (theta) is the angle between the two arrows and cos θ is its cosine, which is 1 when the arrows point the same way, 0 when they are at a right angle, and −1 when they point in opposite directions. So the dot product is "length times length times how aligned they are". Rearranging gives <strong>cosine similarity</strong>, <code>cos θ = a·b / (‖a‖ × ‖b‖)</code>: divide the dot product by both lengths, and only the alignment is left, a number between −1 and 1. Think of two people walking in a park. Cosine asks only "are they facing the same way?", never "who is walking faster?"; a slow walker and a fast walker both heading north have cosine 1.</p>
  <p>Worked on the houses: ‖A‖ = √2 ≈ 1.414 and ‖B‖ = ‖C‖ = √13 ≈ 3.606. Then cos(B, C) = 12 / (3.606 × 3.606) = 12 / 13 ≈ 0.923, and cos(A, B) = 5 / (1.414 × 3.606) = 5 / 5.099 ≈ 0.981. By distance, B's nearest neighbour is C; by direction, B is more like little house A. Both answers are correct; they answer different questions. One more special case is worth remembering: when the dot product is exactly 0, cos θ = 0 and the arrows are at a right angle. Such vectors are called <strong>perpendicular</strong> or <strong>orthogonal</strong>, and section 06 relies on this fact.</p>
  <div class="fx" data-lang="py">print(A @ B, B @ C, A @ C)                 # dot products: multiply matching parts, add

def cos(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))

print(round(cos(A, B), 3), round(cos(B, C), 3), round(cos(A, C), 3))
print(B @ (10 * B), round(cos(B, 10 * B), 3))   # 10x bigger house, same mix
print(np.array([1, 0]) @ np.array([0, 1]))      # perpendicular arrows: dot = 0</div>
  <div class="fx" data-lang="text">5.0 12.0 5.0
0.981 0.923 0.981
130.0 1.0
0</div>
  <p>In NumPy, <code>@</code> between two 1-D arrays is the dot product, and the three values 5, 12 and 5 match the hand sums. The cosine function reproduces 0.981, 0.923 and 0.981. The third line scales B by 10: the dot product of B with 10B grows to 130 (ten times B·B = 13), but the cosine stays exactly 1.0, because a longer arrow in the same direction is still the same direction. The last line confirms that the x-axis arrow [1, 0] and the y-axis arrow [0, 1] have dot product 0: they are perpendicular.</p>
  <p>This is precisely how semantic search works. An embedding model turns each word or document into a vector so that similar meanings point in similar directions. With toy three-number embeddings:</p>
  <div class="fx" data-lang="py">def cos(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))

cat    = np.array([0.9, 0.8, 0.1])         # toy 3-number word embeddings
kitten = np.array([0.8, 0.9, 0.2])
car    = np.array([0.1, 0.2, 0.9])
print(round(cat @ kitten, 3), round(cat @ car, 3))
print(round(cos(cat, kitten), 3), round(cos(cat, car), 3))</div>
  <div class="fx" data-lang="text">1.46 0.34
0.99 0.303</div>
  <p>The raw dot products are 1.46 for cat–kitten and 0.34 for cat–car, and the cosines are 0.99 and 0.303: "cat" and "kitten" point almost the same way, "car" points elsewhere. Retrieval in a RAG system, "users like you" recommendations and duplicate detection all rank candidates by this number. The same operation sits at the heart of transformers: an attention score is the dot product of a query vector with a key vector (see <a class="xref" data-note="dl_attention">Attention Mechanisms</a>).</p>
  <p>Which number to use depends on whether size carries meaning. The raw dot product rewards long vectors: B·C = 12 beats A·B = 5 only because B and C are bigger houses, and in a recommender a very popular item with a large embedding would "match" everything. When only direction matters, use cosine, or normalise every vector to length 1 first, after which the plain dot product <em>is</em> the cosine. When magnitude matters, as with physical measurements on a shared scale, Euclidean distance is the better choice. For unit vectors the two agree anyway: ‖a − b‖² = 2 − 2 cos θ, so ranking by smallest distance and by largest cosine give the same order.</p>

  <h2 id="mla-mat"><span class="num">04</span>Matrix × Vector</h2>
  <p>A linear pricing model says "price = w₁ × size + w₂ × rooms" for some weights w₁ and w₂. For a single house that is a dot product between the house vector and the weight vector w = [w₁, w₂]. With three houses we could compute three dot products, and with a million houses we could loop a million times, but that is slow and clumsy. What we want is one operation that applies the same weights to every row of the table at once.</p>
  <p>That operation is <strong>matrix × vector</strong>, written Xw: take the dot product of each row of X with w, and stack the answers into a new vector, one entry per row. If X has shape n × d and w has d entries, Xw has n entries; entry i is <code>X[i]·w = Σⱼ X[i, j] wⱼ</code>, where j runs over the columns. Think of a shop till. Each customer's basket is a row (how many of each item they bought), the price list is the vector, and the till multiplies each basket by the price list and adds it up, printing one bill per customer. Xw is the till run on every basket at once. In linear regression, the vector of predictions is exactly <code>ŷ = Xw</code>, where ŷ ("y hat") is the usual name for predictions.</p>
  <p>Try a first guess of w = [1, 1], meaning ₹1 crore per 1000 sq ft plus ₹1 crore per room. House A: 1×1 + 1×1 = 2 (true price 2, error 0). House B: 2×1 + 3×1 = 5 (true 4, error +1). House C: 3×1 + 2×1 = 5 (true 6, error −1). A second guess, w = [2, 0], gives 2, 4 and 6, a perfect fit.</p>
  <div class="fx" data-lang="py">w = np.array([1., 1.])            # guess: Rs 1 crore per 1000 sq ft + Rs 1 crore per room
print(X @ w)                      # one prediction per house
print(X @ w - y)                  # errors: prediction - true price
print(np.array([row @ w for row in X]))     # row view: one dot product per house
print(X[:, 0] * w[0] + X[:, 1] * w[1])      # column view: a weighted sum of the columns
w2 = np.array([2., 0.])           # second guess: Rs 2 crore per 1000 sq ft, rooms ignored
print(X @ w2, X @ w2 - y)</div>
  <div class="fx" data-lang="text">[2. 5. 5.]
[ 0.  1. -1.]
[2. 5. 5.]
[2. 5. 5.]
[2. 4. 6.] [0. 0. 0.]</div>
  <p><code>X @ w</code> returns the three predictions [2, 5, 5], and subtracting y gives the errors [0, 1, −1]. The next two lines compute the same thing in two different ways, and both views are worth keeping. The <em>row view</em> is one dot product per house, which is how we defined it. The <em>column view</em> says that Xw is a weighted sum of the columns of X: w₁ × (the size column) + w₂ × (the rooms column) = 1 × [1, 2, 3] + 1 × [1, 3, 2] = [2, 5, 5]. The column view matters later, because it means every possible prediction vector is some mix of the feature columns; when no mix of the columns can produce y exactly, regression has to settle for the closest one. The second guess [2, 0] gives errors of exactly zero.</p>
  <p>The same operation also performs semantic search over a whole collection. Stack the document embeddings as the rows of a matrix, scale every row to length 1, and one matrix × vector with the (unit-length) query gives the cosine with every document in a single step:</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)
docs = ["cat care tips", "kitten food guide", "car insurance"]
E = np.array([[0.9, 0.8, 0.1],          # one embedding per document (one row each)
              [0.8, 0.9, 0.2],
              [0.1, 0.2, 0.9]])
query = np.array([0.7, 0.9, 0.1])       # embedding of "what should my kitten eat?"

En = E / np.linalg.norm(E, axis=1, keepdims=True)   # every row scaled to length 1
qn = query / np.linalg.norm(query)
scores = En @ qn                        # one matrix x vector = every cosine at once
print(scores)
print([docs[i] for i in np.argsort(scores)[::-1]])</div>
  <div class="fx" data-lang="text">[0.983 0.995 0.32 ]
['kitten food guide', 'cat care tips', 'car insurance']</div>
  <p>The scores are 0.983, 0.995 and 0.320, so "kitten food guide" ranks first for the kitten question and "car insurance" last. Vector databases do exactly this, plus clever indexing so they do not have to score every one of millions of rows (see <a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>).</p>
  <p>There is a second, geometric way to read a matrix, and it is the key to the rest of this page: a matrix is a <strong>transformation</strong>, a machine that moves every point of space by the same rule. Feed in a vector and you get a new vector out. The simplest way to see what a 2 × 2 matrix does is to feed in the two axis arrows, (1, 0) and (0, 1). By the column view, M × (1, 0) is just the first column of M and M × (0, 1) is the second column. So <em>the columns of a matrix are where the axis arrows land</em>, and every other point follows along, because any point is a mix of the two axis arrows. Here is the "shear" matrix [[1, 1], [0, 1]] (written row by row):</p>
  <div class="fx" data-lang="py">Sh = np.array([[1., 1.],
               [0., 1.]])                # a "shear" matrix
print(Sh @ np.array([1., 0.]), Sh @ np.array([0., 1.]))   # where the axis arrows land
print(Sh @ np.array([1., 1.]), Sh @ B)                    # any other point follows</div>
  <div class="fx" data-lang="text">[1. 0.] [1. 1.]
[2. 1.] [5. 3.]</div>
  <p>The x-axis arrow (1, 0) stays where it is, which is the first column, and the y-axis arrow (0, 1) lands on (1, 1), the second column. Every other point follows the same rule: (1, 1) moves to (2, 1), and house B at (2, 3) moves to (5, 3). The figure shows the whole grid being pushed sideways.</p>
  <figure class="viz"><svg viewBox="0 0 583.198125 176.255642" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:560px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="shfigure_1">
  <g id="shpatch_1">
   <path d="M 0 176.255642 
L 583.198125 176.255642 
L 583.198125 0 
L 0 0 
L 0 176.255642 
z
" style="fill: none"/>
  </g>
  <g id="shaxes_1">
   <g id="shpatch_2">
    <path d="M 20.509375 149.956033 
L 286.198125 149.956033 
L 286.198125 22.8875 
L 20.509375 22.8875 
L 20.509375 149.956033 
z
" style="fill: none"/>
   </g>
   <g id="shmatplotlib.axis_1">
    <g id="shxtick_1">
     <g id="shline2d_1">
      <defs>
       <path id="shm09e2f903c0" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#shm09e2f903c0" x="60.940272" y="149.956033" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="60.940272" y="166.643533" transform="rotate(-0 60.940272 166.643533)">0</text>
     </g>
    </g>
    <g id="shxtick_2">
     <g id="shline2d_2">
      <g>
       <use xlink:href="#shm09e2f903c0" x="118.698696" y="149.956033" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="118.698696" y="166.643533" transform="rotate(-0 118.698696 166.643533)">2</text>
     </g>
    </g>
    <g id="shxtick_3">
     <g id="shline2d_3">
      <g>
       <use xlink:href="#shm09e2f903c0" x="176.45712" y="149.956033" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="176.45712" y="166.643533" transform="rotate(-0 176.45712 166.643533)">4</text>
     </g>
    </g>
    <g id="shxtick_4">
     <g id="shline2d_4">
      <g>
       <use xlink:href="#shm09e2f903c0" x="234.215543" y="149.956033" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="234.215543" y="166.643533" transform="rotate(-0 234.215543 166.643533)">6</text>
     </g>
    </g>
   </g>
   <g id="shmatplotlib.axis_2">
    <g id="shytick_1">
     <g id="shline2d_5">
      <defs>
       <path id="shma2058d5495" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#shma2058d5495" x="20.509375" y="132.628505" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="13.509375" y="137.472255" transform="rotate(-0 13.509375 137.472255)">0</text>
     </g>
    </g>
    <g id="shytick_2">
     <g id="shline2d_6">
      <g>
       <use xlink:href="#shma2058d5495" x="20.509375" y="103.749293" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_6">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="13.509375" y="108.593043" transform="rotate(-0 13.509375 108.593043)">1</text>
     </g>
    </g>
    <g id="shytick_3">
     <g id="shline2d_7">
      <g>
       <use xlink:href="#shma2058d5495" x="20.509375" y="74.870082" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_7">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="13.509375" y="79.713832" transform="rotate(-0 13.509375 79.713832)">2</text>
     </g>
    </g>
    <g id="shytick_4">
     <g id="shline2d_8">
      <g>
       <use xlink:href="#shma2058d5495" x="20.509375" y="45.99087" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="13.509375" y="50.83462" transform="rotate(-0 13.509375 50.83462)">3</text>
     </g>
    </g>
   </g>
   <g id="shline2d_9">
    <path d="M 60.940272 132.628505 
L 60.940272 45.99087 
" clip-path="url(#shpc3a1ebc1f7)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_10">
    <path d="M 60.940272 132.628505 
L 147.577908 132.628505 
" clip-path="url(#shpc3a1ebc1f7)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_11">
    <path d="M 89.819484 132.628505 
L 89.819484 45.99087 
" clip-path="url(#shpc3a1ebc1f7)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_12">
    <path d="M 60.940272 103.749293 
L 147.577908 103.749293 
" clip-path="url(#shpc3a1ebc1f7)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_13">
    <path d="M 118.698696 132.628505 
L 118.698696 45.99087 
" clip-path="url(#shpc3a1ebc1f7)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_14">
    <path d="M 60.940272 74.870082 
L 147.577908 74.870082 
" clip-path="url(#shpc3a1ebc1f7)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_15">
    <path d="M 147.577908 132.628505 
L 147.577908 45.99087 
" clip-path="url(#shpc3a1ebc1f7)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_16">
    <path d="M 60.940272 45.99087 
L 147.577908 45.99087 
" clip-path="url(#shpc3a1ebc1f7)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_17">
    <defs>
     <path id="shme7480f0e88" d="M 0 3.5 
C 0.928211 3.5 1.81853 3.131218 2.474874 2.474874 
C 3.131218 1.81853 3.5 0.928211 3.5 0 
C 3.5 -0.928211 3.131218 -1.81853 2.474874 -2.474874 
C 1.81853 -3.131218 0.928211 -3.5 0 -3.5 
C -0.928211 -3.5 -1.81853 -3.131218 -2.474874 -2.474874 
C -3.131218 -1.81853 -3.5 -0.928211 -3.5 0 
C -3.5 0.928211 -3.131218 1.81853 -2.474874 2.474874 
C -1.81853 3.131218 -0.928211 3.5 0 3.5 
z
" style="stroke: #e8743b"/>
    </defs>
    <g clip-path="url(#shpc3a1ebc1f7)">
     <use xlink:href="#shme7480f0e88" x="118.698696" y="45.99087" style="fill: #e8743b; stroke: #e8743b"/>
    </g>
   </g>
   <g id="shpatch_3">
    <path d="M 20.509375 149.956033 
L 20.509375 22.8875 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="shpatch_4">
    <path d="M 20.509375 149.956033 
L 286.198125 149.956033 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="shpatch_5">
    <path d="M 62.939114 132.628505 
Q 75.380144 132.628505 85.3615 132.628505 
" style="fill: none; stroke: #d64545; stroke-width: 2.2; stroke-linecap: round"/>
    <path d="M 81.3615 130.628505 
L 85.3615 132.628505 
L 81.3615 134.628505 
z
" style="fill: #d64545; stroke: #d64545; stroke-width: 2.2; stroke-linecap: round"/>
   </g>
   <g id="shpatch_6">
    <path d="M 60.940272 130.629663 
Q 60.940272 118.188633 60.940272 108.207277 
" style="fill: none; stroke: #2a78d6; stroke-width: 2.2; stroke-linecap: round"/>
    <path d="M 58.940272 112.207277 
L 60.940272 108.207277 
L 62.940272 112.207277 
z
" style="fill: #2a78d6; stroke: #2a78d6; stroke-width: 2.2; stroke-linecap: round"/>
   </g>
   <g id="shtext_9">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; text-anchor: start" x="122.164201" y="42.525364" transform="rotate(-0 122.164201 42.525364)">B = (2, 3)</text>
   </g>
   <g id="shtext_10">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; text-anchor: start; fill: #d64545" x="86.931563" y="145.624151" transform="rotate(-0 86.931563 145.624151)">(1, 0)</text>
   </g>
   <g id="shtext_11">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; text-anchor: start; fill: #2a78d6" x="39.280863" y="100.861372" transform="rotate(-0 39.280863 100.861372)">(0, 1)</text>
   </g>
   <g id="shtext_12">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="153.35375" y="16.8875" transform="rotate(-0 153.35375 16.8875)">before</text>
   </g>
  </g>
  <g id="shaxes_2">
   <g id="shpatch_7">
    <path d="M 310.309375 149.956033 
L 575.998125 149.956033 
L 575.998125 22.8875 
L 310.309375 22.8875 
L 310.309375 149.956033 
z
" style="fill: none"/>
   </g>
   <g id="shmatplotlib.axis_3">
    <g id="shxtick_5">
     <g id="shline2d_18">
      <g>
       <use xlink:href="#shm09e2f903c0" x="350.740272" y="149.956033" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_13">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="350.740272" y="166.643533" transform="rotate(-0 350.740272 166.643533)">0</text>
     </g>
    </g>
    <g id="shxtick_6">
     <g id="shline2d_19">
      <g>
       <use xlink:href="#shm09e2f903c0" x="408.498696" y="149.956033" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_14">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="408.498696" y="166.643533" transform="rotate(-0 408.498696 166.643533)">2</text>
     </g>
    </g>
    <g id="shxtick_7">
     <g id="shline2d_20">
      <g>
       <use xlink:href="#shm09e2f903c0" x="466.25712" y="149.956033" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_15">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="466.25712" y="166.643533" transform="rotate(-0 466.25712 166.643533)">4</text>
     </g>
    </g>
    <g id="shxtick_8">
     <g id="shline2d_21">
      <g>
       <use xlink:href="#shm09e2f903c0" x="524.015543" y="149.956033" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_16">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="524.015543" y="166.643533" transform="rotate(-0 524.015543 166.643533)">6</text>
     </g>
    </g>
   </g>
   <g id="shmatplotlib.axis_4">
    <g id="shytick_5">
     <g id="shline2d_22">
      <g>
       <use xlink:href="#shma2058d5495" x="310.309375" y="132.628505" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_17">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="303.309375" y="137.472255" transform="rotate(-0 303.309375 137.472255)">0</text>
     </g>
    </g>
    <g id="shytick_6">
     <g id="shline2d_23">
      <g>
       <use xlink:href="#shma2058d5495" x="310.309375" y="103.749293" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_18">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="303.309375" y="108.593043" transform="rotate(-0 303.309375 108.593043)">1</text>
     </g>
    </g>
    <g id="shytick_7">
     <g id="shline2d_24">
      <g>
       <use xlink:href="#shma2058d5495" x="310.309375" y="74.870082" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_19">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="303.309375" y="79.713832" transform="rotate(-0 303.309375 79.713832)">2</text>
     </g>
    </g>
    <g id="shytick_8">
     <g id="shline2d_25">
      <g>
       <use xlink:href="#shma2058d5495" x="310.309375" y="45.99087" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="shtext_20">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="303.309375" y="50.83462" transform="rotate(-0 303.309375 50.83462)">3</text>
     </g>
    </g>
   </g>
   <g id="shline2d_26">
    <path d="M 350.740272 132.628505 
L 437.377908 45.99087 
" clip-path="url(#shp92e3cfc008)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_27">
    <path d="M 350.740272 132.628505 
L 437.377908 132.628505 
" clip-path="url(#shp92e3cfc008)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_28">
    <path d="M 379.619484 132.628505 
L 466.25712 45.99087 
" clip-path="url(#shp92e3cfc008)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_29">
    <path d="M 379.619484 103.749293 
L 466.25712 103.749293 
" clip-path="url(#shp92e3cfc008)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_30">
    <path d="M 408.498696 132.628505 
L 495.136332 45.99087 
" clip-path="url(#shp92e3cfc008)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_31">
    <path d="M 408.498696 74.870082 
L 495.136332 74.870082 
" clip-path="url(#shp92e3cfc008)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_32">
    <path d="M 437.377908 132.628505 
L 524.015543 45.99087 
" clip-path="url(#shp92e3cfc008)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_33">
    <path d="M 437.377908 45.99087 
L 524.015543 45.99087 
" clip-path="url(#shp92e3cfc008)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="shline2d_34">
    <g clip-path="url(#shp92e3cfc008)">
     <use xlink:href="#shme7480f0e88" x="495.136332" y="45.99087" style="fill: #e8743b; stroke: #e8743b"/>
    </g>
   </g>
   <g id="shpatch_8">
    <path d="M 310.309375 149.956033 
L 310.309375 22.8875 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="shpatch_9">
    <path d="M 310.309375 149.956033 
L 575.998125 149.956033 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="shpatch_10">
    <path d="M 352.739114 132.628505 
Q 365.180144 132.628505 375.1615 132.628505 
" style="fill: none; stroke: #d64545; stroke-width: 2.2; stroke-linecap: round"/>
    <path d="M 371.1615 130.628505 
L 375.1615 132.628505 
L 371.1615 134.628505 
z
" style="fill: #d64545; stroke: #d64545; stroke-width: 2.2; stroke-linecap: round"/>
   </g>
   <g id="shpatch_11">
    <path d="M 352.153915 131.214862 
Q 365.180949 118.187828 376.468731 106.900046 
" style="fill: none; stroke: #2a78d6; stroke-width: 2.2; stroke-linecap: round"/>
    <path d="M 372.226091 108.314259 
L 376.468731 106.900046 
L 375.054518 111.142686 
z
" style="fill: #2a78d6; stroke: #2a78d6; stroke-width: 2.2; stroke-linecap: round"/>
   </g>
   <g id="shtext_21">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; text-anchor: start" x="498.601837" y="42.525364" transform="rotate(-0 498.601837 42.525364)">B → (5, 3)</text>
   </g>
   <g id="shtext_22">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; text-anchor: start; fill: #d64545" x="376.731563" y="145.624151" transform="rotate(-0 376.731563 145.624151)">(1, 0)</text>
   </g>
   <g id="shtext_23">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; text-anchor: start; fill: #2a78d6" x="357.960075" y="100.861372" transform="rotate(-0 357.960075 100.861372)">(1, 1)</text>
   </g>
   <g id="shtext_24">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="443.15375" y="16.8875" transform="rotate(-0 443.15375 16.8875)">after  [[1, 1], [0, 1]]</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="shpc3a1ebc1f7">
   <rect x="20.509375" y="22.8875" width="265.68875" height="127.068533"/>
  </clipPath>
  <clipPath id="shp92e3cfc008">
   <rect x="310.309375" y="22.8875" width="265.68875" height="127.068533"/>
  </clipPath>
 </defs>
</svg><figcaption>The shear [[1, 1], [0, 1]] applied to a grid. The red x-arrow stays at (1, 0), the blue y-arrow lands on (1, 1), and every square becomes a slanted box that follows them; B moves from (2, 3) to (5, 3).</figcaption></figure>
  <p>Our data matrix X can be read the same way, as a machine that takes a 2-number weight vector and returns 3 predictions. Its first column [1, 2, 3] is what w = (1, 0) produces and its second column [1, 3, 2] is what w = (0, 1) produces. The transformation view explains what "rank", "inverse" and "eigenvector" mean in the sections ahead: they are all questions about what the machine does to space.</p>

  <h2 id="mla-mul"><span class="num">05</span>Matrix × Matrix and Transpose</h2>
  <p>Matrix × vector applies one rule to every row. Often we need many rules at once: compare several candidate weight vectors, run a neural-network layer that has 128 output units (128 weight vectors), or apply one transformation after another. All of these are <strong>matrix × matrix</strong>.</p>
  <p>The idea is simple: put the weight vectors side by side as the columns of a matrix W, and compute X times each column, laying the answers side by side. So each cell of the result is one row of the left matrix dotted with one column of the right matrix: <code>(AB)[i, j] = row i of A · column j of B</code>. Imagine two estate agents with different pricing rules. Run the till from section 04 once per agent and put their price lists next to each other, and you get a table of houses × agents. That table is XW. For row and column to be dotted they must have the same length, which gives the <strong>shape rule</strong>: <code>(n × k) @ (k × m) → (n × m)</code>. The inner numbers (k) must match and disappear; the outer numbers give the shape of the answer.</p>
  <div class="fx" data-lang="py">W = np.column_stack([[1., 1.], [2., 0.]])   # two pricing rules, one per column
print(W)
print(X @ W)                    # column j = every house priced by rule j
print(X.shape, "@", W.shape, "-&gt;", (X @ W).shape)</div>
  <div class="fx" data-lang="text">[[1. 2.]
 [1. 0.]]
[[2. 2.]
 [5. 4.]
 [5. 6.]]
(3, 2) @ (2, 2) -&gt; (3, 2)</div>
  <p>The two columns of W are the rules [1, 1] and [2, 0]. In the result, the first column [2, 5, 5] is every house priced by rule 1 and the second column [2, 4, 6] is every house priced by rule 2; for instance, the middle-left cell is row B · column 1 = 2 + 3 = 5. The shapes follow the rule: (3, 2) @ (2, 2) → (3, 2).</p>
  <p>With ordinary numbers, 3 × 5 = 5 × 3. With matrices the order matters, and the transformation view shows why. Applying matrix S and then matrix R to a point p is written R(Sp), or (RS)p: the matrix nearest the vector acts first, so you read right to left. Let S stretch the x-direction by 2 and R rotate everything by 90° anticlockwise, and send the point p = (1, 1) through them in both orders:</p>
  <div class="fx" data-lang="py">p = np.array([1., 1.])
S = np.array([[2., 0.], [0., 1.]])      # stretch x by 2
R = np.array([[0., -1.], [1., 0.]])     # rotate 90 degrees anticlockwise
print(R @ (S @ p), (R @ S) @ p)         # stretch first, then rotate
print(S @ (R @ p))                      # rotate first, then stretch
print(R @ S)
print(S @ R)</div>
  <div class="fx" data-lang="text">[-1.  2.] [-1.  2.]
[-2.  1.]
[[ 0. -1.]
 [ 2.  0.]]
[[ 0. -2.]
 [ 1.  0.]]</div>
  <p>Stretch-then-rotate sends (1, 1) to (2, 1) and then to (−1, 2). Rotate-then-stretch sends it to (−1, 1) and then to (−2, 1), a different place. The products RS and SR are different matrices. It is like putting on socks then shoes versus shoes then socks: the same two actions, a different result. So matrix multiplication is <strong>not commutative</strong> (AB ≠ BA in general, and often BA is not even a legal shape). It is, however, <strong>associative</strong>: (AB)C = A(BC), which is why the first line printed the same answer for R(Sp) and (RS)p, and why a chain of transformations can be combined into a single matrix.</p>
  <p>The <strong>transpose</strong> of a matrix, written Xᵀ, flips it over its diagonal: row i becomes column i. Our 3 × 2 X becomes a 2 × 3 Xᵀ with one row per feature. Transposes appear constantly because they let us dot <em>columns</em> with each other. The product <strong>XᵀX</strong> has shape (2 × 3) @ (3 × 2) = (2 × 2), and its cells are every feature column dotted with every feature column. By hand: size · size = 1×1 + 2×2 + 3×3 = 14; size · rooms = 1×1 + 2×3 + 3×2 = 13; rooms · rooms = 1×1 + 3×3 + 2×2 = 14. Likewise Xᵀy dots each feature column with the prices: size · price = 2 + 8 + 18 = 28 and rooms · price = 2 + 12 + 12 = 26.</p>
  <div class="fx" data-lang="py">print(X.T)                      # transpose: rows become columns
G = X.T @ X                     # (2x3) @ (3x2) -&gt; (2x2): every feature . every feature
print(G)
print(X.T @ y)                  # every feature . prices
print(np.array_equal((X @ W).T, W.T @ X.T))   # (XW)ᵀ = WᵀXᵀ</div>
  <div class="fx" data-lang="text">[[1. 2. 3.]
 [1. 3. 2.]]
[[14. 13.]
 [13. 14.]]
[28. 26.]
True</div>
  <p>NumPy reproduces Xᵀ, XᵀX = [[14, 13], [13, 14]] and Xᵀy = [28, 26]. XᵀX is always square and <strong>symmetric</strong> (equal to its own transpose: the 13 appears in both off-diagonal corners, because size · rooms = rooms · size). The large off-diagonal 13, almost as big as the 14s, says that size and rooms move together in this data; that overlap will matter in sections 06 and 07. If the columns are centred first and the result divided by n − 1, XᵀX becomes the <strong>covariance matrix</strong> used in PCA. The last line checks the rule for transposing a product, <code>(XW)ᵀ = WᵀXᵀ</code>: transpose each and reverse the order, for the same socks-and-shoes reason.</p>
  <p>The same shape rule runs every dense neural-network layer. A batch of 32 images with 784 pixels each is a 32 × 784 matrix; a layer with 128 units stores a 784 × 128 weight matrix; their product is 32 × 128, one row of 128 outputs per image. A layer also adds a bias vector and then applies a <strong>nonlinearity</strong>, a function that bends the output, such as ReLU, which replaces negative numbers with 0. The code shows why that bend is essential:</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
batch = rng.normal(size=(32, 784))      # 32 images, 784 pixels each
W1 = rng.normal(size=(784, 128))        # layer 1: 784 inputs -&gt; 128 units
W2 = rng.normal(size=(128, 10))         # layer 2: 128 units -&gt; 10 classes
print((batch @ W1).shape, (batch @ W1 @ W2).shape)

relu = lambda z: np.maximum(0, z)       # the bend: negatives become 0
print(np.allclose((batch @ W1) @ W2, batch @ (W1 @ W2)))        # two linear layers = one matrix
print(np.allclose(relu(batch @ W1) @ W2, batch @ (W1 @ W2)))    # with ReLU: not any more
try:
    W1 @ batch
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">(32, 128) (32, 10)
True
False
ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)-&gt;(n?,m?) (size 32 is different from 128)</div>
  <p>The shapes come out as (32, 128) after one layer and (32, 10) after two. The next line shows that two layers without a nonlinearity equal a single matrix: (batch W1) W2 = batch (W1 W2), and W1 W2 is just another 784 × 10 matrix, so stacking ten linear layers is no more powerful than one. With ReLU in between, the equality breaks, and that is what lets deep networks learn curved relationships (see <a class="xref" data-note="dl_foundations">Neural Network Foundations</a>). The last line is the error you will meet most often in ML code: <code>W1 @ batch</code> asks for (784 × 128) @ (32 × 784), the inner sizes 128 and 32 do not match, and NumPy refuses. Writing the shapes down before multiplying is the quickest way to debug it.</p>

  <h2 id="mla-inv"><span class="num">06</span>Matrix Inverse, Rank and the Normal Equations</h2>
  <p>So far we have guessed weights and checked them. We guessed [2, 0] and it fitted perfectly, but with real data nobody can guess. We want to <em>solve</em> for the best weights directly. With plain numbers, 2w = 6 is solved by dividing both sides by 2. Matrices have no division, so we need an equivalent, and we need to deal with a second problem: X is 3 × 2, which means three equations (one per house) and only two unknowns. With real, noisy prices no w satisfies all three equations at once.</p>
  <p>The matrix version of division is the <strong>inverse</strong>. For a square matrix A, its inverse A⁻¹ is the matrix that undoes whatever A does: if A moves a point somewhere, A⁻¹ moves it back. Doing A and then undoing it leaves every point where it started, and the matrix that "does nothing" is called the <strong>identity</strong>, I, with 1s on the diagonal and 0s everywhere else, so that Ix = x. The defining property is <code>A⁻¹A = AA⁻¹ = I</code>. Think of a photo filter that stretches a picture sideways; its inverse is the filter that squeezes it back. In the stretch matrix S = [[2, 0], [0, 1]], the inverse simply halves the x-direction.</p>
  <p>Not every matrix can be undone, and the number that tells you is the <strong>determinant</strong>. Geometrically, the determinant is the factor by which a matrix scales areas: the unit square of the grid becomes a shape whose area is |det|. For a 2 × 2 matrix [[a, b], [c, d]] it is <code>det = ad − bc</code>, and the inverse is <code>(1 / det) × [[d, −b], [−c, a]]</code>: swap the diagonal entries, flip the signs of the other two, and divide by the determinant. If the determinant is 0, the matrix squashes the plane flat onto a line (or a point), information is lost, and no inverse exists, which is why the formula would divide by zero. For XᵀX = [[14, 13], [13, 14]], the determinant is 14×14 − 13×13 = 196 − 169 = 27, and the inverse is (1/27) × [[14, −13], [−13, 14]] ≈ [[0.519, −0.481], [−0.481, 0.519]].</p>
  <div class="fx" data-lang="py">S = np.array([[2., 0.], [0., 1.]])      # stretch x by 2
S_inv = np.linalg.inv(S)
print(S_inv)                            # shrink x by 2
print(S_inv @ (S @ B))                  # stretch, then undo: B comes back
print(S_inv @ S)                        # the identity matrix I

G = X.T @ X
print(round(np.linalg.det(G), 3))       # 14*14 - 13*13
print(np.array([[14., -13.], [-13., 14.]]) / 27)   # the 2x2 formula by hand
print(np.linalg.inv(G))</div>
  <div class="fx" data-lang="text">[[0.5 0. ]
 [0.  1. ]]
[2. 3.]
[[1. 0.]
 [0. 1.]]
27.0
[[ 0.519 -0.481]
 [-0.481  0.519]]
[[ 0.519 -0.481]
 [-0.481  0.519]]</div>
  <p>The inverse of the stretch is [[0.5, 0], [0, 1]]; stretching B and then applying the inverse returns [2, 3], and S⁻¹S is the identity. For XᵀX, NumPy's determinant (27.0) and inverse match the hand formula.</p>
  <p>Now the main question: which w is best when no w fits every house? "Best" in regression means the one whose predictions are closest to y, measured by the L2 norm of the errors; minimising ‖y − Xw‖² is called <strong>least squares</strong>. The geometry gives a clean answer. By the column view, Xw is always a mix of the feature columns, so the possible prediction vectors form a flat surface (a plane, here, inside 3-D space, since there are 3 houses). The target y usually sticks out of that plane. The closest point on a flat surface to a point outside it is the one straight "below" it, the foot of the perpendicular. Picture your shadow at noon: the point on the floor closest to your head is directly underneath it, and the line from your head to that point is at a right angle to the floor. So at the best w, the leftover error vector y − Xw must be perpendicular to every feature column.</p>
  <p>Perpendicular means a dot product of zero (section 03), and "dot every column with the error" is exactly what multiplying by Xᵀ does (section 05). So the condition is <code>Xᵀ(y − Xw) = 0</code>. Multiplying out and moving one term across gives the <strong>normal equations</strong>:</p>
  <div class="fx" data-lang="text">Xᵀ(y − Xw) = 0
Xᵀy − XᵀX w = 0
XᵀX w = Xᵀy            ← a small square system: d equations, d unknowns
w = (XᵀX)⁻¹ Xᵀy        ← when XᵀX can be inverted</div>
  <p>Here X is the n × d data table, y the n true prices, w the d weights. The word "normal" is an old name for "perpendicular". The clever part is that multiplying by Xᵀ turned an impossible 3 × 2 system into a solvable 2 × 2 one, whose answer is the best compromise. For our houses: XᵀX = [[14, 13], [13, 14]] and Xᵀy = [28, 26], so w = (1/27) × [[14, −13], [−13, 14]] × [28, 26]. The first weight is (14×28 − 13×26)/27 = (392 − 338)/27 = 54/27 = 2, and the second is (−13×28 + 14×26)/27 = (−364 + 364)/27 = 0. The data says ₹2 crore per 1000 sq ft, and rooms add nothing once size is known, which is exactly how the prices were made. To see the compromise in action, suppose house A had sold slightly high, for 2.5 instead of 2. Then no w fits all three houses, and the normal equations find the closest fit:</p>
  <div class="fx" data-lang="py">y2 = np.array([2.5, 4., 6.])            # house A sold a little high: no exact fit exists
G, r = X.T @ X, X.T @ y2                # normal equations: G w = r
w = np.linalg.solve(G, r)               # solve, don't invert
print(r, w)
print(X @ w, y2 - X @ w)                # predictions and leftover errors
print(np.round(X.T @ (y2 - X @ w), 9) + 0.0)  # error . every column = 0 (perpendicular)
print(np.linalg.lstsq(X, y2, rcond=None)[0])   # same answer, never forms XᵀX
print(np.linalg.solve(X.T @ X, X.T @ y))       # the original prices: exactly [2, 0]</div>
  <div class="fx" data-lang="text">[28.5 26.5] [2.019 0.019]
[2.037 4.093 6.093] [ 0.463 -0.093 -0.093]
[0. 0.]
[2.019 0.019]
[2. 0.]</div>
  <p>With the new prices, Xᵀy is [28.5, 26.5] and the best weights are [2.019, 0.019]. The predictions are 2.037, 4.093 and 6.093, leaving errors of 0.463, −0.093 and −0.093: the fit is pulled up a little towards house A but cannot match it. The third line is the perpendicular check: the error dotted with each feature column is 0 (to rounding). <code>np.linalg.solve</code> found w from the square system without ever forming an inverse, and <code>np.linalg.lstsq</code> found the same answer working directly on X, without even forming XᵀX. The last line confirms that the original prices give exactly [2, 0].</p>
  <p>In practice you almost never compute an inverse. <code>solve</code> factorises the matrix into two triangle-shaped pieces (an LU factorisation) and back-substitutes, which takes about a third of the work and produces less rounding error than computing A⁻¹ and then multiplying. You need A⁻¹b, not A⁻¹ itself. <code>lstsq</code> goes further and uses a QR or SVD factorisation of X, which avoids squaring the numbers in XᵀX and is the most accurate choice on messy data. Here is the same normal-equation solve on 100 noisy rows, with a column of 1s added so the model can learn a constant term (the intercept), compared with scikit-learn:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
np.set_printoptions(precision=3, suppress=True)
rng = np.random.default_rng(0)
Xr = rng.normal(size=(100, 2))                     # 100 houses, 2 features
yr = 1.5 + Xr @ np.array([2.0, -3.0]) + rng.normal(0, 0.1, 100)   # true rule + noise
Xb = np.column_stack([np.ones(100), Xr])           # a column of 1s for the intercept
print(np.linalg.solve(Xb.T @ Xb, Xb.T @ yr))       # (XᵀX) w = Xᵀy
m = LinearRegression().fit(Xr, yr)
print(round(m.intercept_, 3), m.coef_)</div>
  <div class="fx" data-lang="text">[ 1.484  1.989 -2.983]
1.484 [ 1.989 -2.983]</div>
  <p>The true rule was 1.5 + 2 × feature₁ − 3 × feature₂ plus noise, and both the hand-written solve and <code>LinearRegression</code> recover [1.484, 1.989, −2.983]. Solving costs roughly n·d² + d³ operations, which is fine for thousands of features but not for millions, and it only works because the model is linear. Beyond that, models are trained by gradient descent instead, which is where <a class="xref" data-note="m_calculus">Calculus</a> and <a class="xref" data-note="m_optimization">Optimization</a> take over (see also <a class="xref" data-note="ml_regression">Linear Regression</a>).</p>
  <p>The normal equations need XᵀX to be invertible, and that fails in a way every data scientist meets. Suppose someone adds size a second time as a third column, this time in hundreds of square feet (10, 20, 30). The new column is just 10 × the size column and brings no new information. Now infinitely many weight combinations give identical predictions: put more weight on one copy of size and less on the other, and nothing changes. The concept that captures this is <strong>rank</strong>: the number of genuinely independent columns of a matrix, meaning columns that cannot be built as mixes of the others. Columns that can be built from others are called <strong>linearly dependent</strong>. In the transformation picture, rank is the number of dimensions that survive: a 2 × 2 matrix of rank 1 squashes the whole plane onto a line. A square matrix whose rank is less than its size is called <strong>singular</strong>; its determinant is 0 and it has no inverse.</p>
  <div class="fx" data-lang="py">L = np.array([[1., 2.], [2., 4.]])           # 2nd column = 2 x 1st
print(L @ np.array([1., 0.]), L @ np.array([3., -1.]))   # two inputs, one output
print(np.linalg.matrix_rank(L), round(np.linalg.det(L), 3))

X3 = np.column_stack([X, X[:, 0] * 10])      # add size again, in hundreds of sq ft
print(X3)
G3 = X3.T @ X3
print(np.linalg.matrix_rank(X3), np.linalg.matrix_rank(G3), f"{np.linalg.cond(G3):.1e}")
w3 = np.linalg.solve(G3 + 0.1 * np.eye(3), X3.T @ y)   # ridge: add 0.1 on the diagonal
print(np.linalg.matrix_rank(G3 + 0.1 * np.eye(3)), np.round(w3, 3), np.round(X3 @ w3, 3))</div>
  <div class="fx" data-lang="text">[1. 2.] [1. 2.]
1 0.0
[[ 1.  1. 10.]
 [ 2.  3. 20.]
 [ 3.  2. 30.]]
2 2 3.4e+16
3 [0.02  0.001 0.198] [2.    4.001 5.999]</div>
  <p>The small matrix L = [[1, 2], [2, 4]] has a second column that is twice the first. It sends two different inputs, (1, 0) and (3, −1), to the same output (1, 2), so there is no way to tell which input you started from: no inverse, rank 1, determinant 0. The housing table with size added twice has 3 columns but rank 2, and its 3 × 3 XᵀX also has rank 2, so it is singular. The <strong>condition number</strong>, which measures how much a matrix magnifies small rounding errors (1 is perfect; above about 10¹⁰ is trouble), is 3.4 × 10¹⁶, effectively infinite. The fix in the last line is <strong>ridge regression</strong>: add a small number λ (here 0.1) to the diagonal of XᵀX before solving. The matrix becomes full rank again and there is one sensible answer: 0.02 per 1000 sq ft plus 0.198 per 100 sq ft, which adds up to 0.02 + 10 × 0.198 = 2.0 per 1000 sq ft, the same total effect shared between the two copies. The predictions stay at 2, 4 and 6.</p>
  <p>This is the linear-algebra face of <strong>multicollinearity</strong> (see <a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a>). Exact duplicates, such as one-hot columns for every category plus an intercept (the "dummy variable trap"), make XᵀX singular and the regression has no unique answer. Near-duplicates make it nearly singular: the solve succeeds, but the weights become huge, unstable and meaningless, flipping sign when a single row changes. Drop one of the duplicate columns, or use ridge, which adds λI and makes XᵀX + λI invertible for every λ &gt; 0 (see <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>). The next section explains why adding λ works.</p>

  <h2 id="mla-eig"><span class="num">07</span>Eigenvectors and Eigenvalues</h2>
  <p>We solved the regression with XᵀX = [[14, 13], [13, 14]], but those four numbers do not tell us much by looking at them. Why did the 13 make the ridge example fragile? What does this matrix actually do to a weight vector? Most matrices both turn and stretch most arrows, which makes their behaviour hard to picture. The way to understand a matrix is to look for special directions where it does something simple.</p>
  <p>An <strong>eigenvector</strong> of a square matrix A is a direction that A does not turn: it only stretches it, shrinks it, or flips it round. The stretch factor is the matching <strong>eigenvalue</strong>, written λ (lambda). In symbols, <code>Av = λv</code>: "A times v gives back v, just scaled by λ". ("Eigen" is German for "own": these are the matrix's own directions.) An eigenvalue bigger than 1 stretches, between 0 and 1 shrinks, a negative one flips the arrow round, and 0 squashes that direction to nothing. Picture pulling a rubber sheet along one diagonal. Lines drawn on the sheet at most angles get twisted towards the pull. A line drawn exactly along the pull only gets longer, and a line exactly across it stays put; those two lines are the eigenvectors.</p>
  <p>Test some directions on XᵀX, remembering that each output entry is a row dotted with the input. (1, 0) goes to (14, 13): a different direction, so it was turned, and (1, 0) is not an eigenvector. (1, 1) goes to (14 + 13, 13 + 14) = (27, 27), which is 27 × (1, 1): same direction, 27 times longer, so (1, 1) is an eigenvector with eigenvalue 27. (1, −1) goes to (14 − 13, 13 − 14) = (1, −1), exactly itself: an eigenvector with eigenvalue 1.</p>
  <div class="fx" data-lang="py">G = X.T @ X
for v in ([1., 0.], [1., 1.], [1., -1.]):
    print(v, "-&gt;", G @ np.array(v))
vals, vecs = np.linalg.eigh(G)          # eigh: for symmetric matrices
print(vals)
print(vecs)                             # columns are the eigenvectors, length 1
print(X @ np.array([1., 1.]), X @ np.array([1., -1.]))   # effect on predictions</div>
  <div class="fx" data-lang="text">[1.0, 0.0] -&gt; [14. 13.]
[1.0, 1.0] -&gt; [27. 27.]
[1.0, -1.0] -&gt; [ 1. -1.]
[ 1. 27.]
[[-0.707  0.707]
 [ 0.707  0.707]]
[2. 5. 5.] [ 0. -1.  1.]</div>
  <p>The loop confirms the hand work. <code>np.linalg.eigh</code>, the version for symmetric matrices, returns the eigenvalues smallest first, [1, 27], and the eigenvectors as the <em>columns</em> of a matrix, scaled to length 1: (−0.707, 0.707) for eigenvalue 1, which is the (1, −1) direction with its sign flipped, and (0.707, 0.707) = (1, 1)/√2 for eigenvalue 27. The sign and length of an eigenvector are arbitrary, because if v is an eigenvector so is −v or 5v; only the direction is meaningful.</p>
  <p>The figure shows the same idea on a gentler matrix with the same pattern, [[2, 1], [1, 2]], whose eigenvectors are also (1, 1) and (1, −1), with eigenvalues 3 and 1. Arrows on the unit circle (grey) are sent to the blue arrows, and the circle becomes an ellipse. Most arrows are turned towards the long diagonal. The two red arrows are not turned: the one along (1, 1) is stretched three times and the one along (1, −1) keeps its length. The eigenvectors are exactly the axes of the ellipse, and the eigenvalues are how long those axes are.</p>
  <figure class="viz"><svg viewBox="0 0 374.111687 288.523609" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:560px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="egfigure_1">
  <g id="egpatch_1">
   <path d="M 0 288.523609 
L 374.111687 288.523609 
L 374.111687 0 
L 0 0 
L 0 288.523609 
z
" style="fill: none"/>
  </g>
  <g id="egaxes_1">
   <g id="egpatch_2">
    <path d="M 26.879687 262.224 
L 366.911687 262.224 
L 366.911687 7.2 
L 26.879687 7.2 
L 26.879687 262.224 
z
" style="fill: none"/>
   </g>
   <g id="egmatplotlib.axis_1">
    <g id="egxtick_1">
     <g id="egline2d_1">
      <defs>
       <path id="egm09e2f903c0" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#egm09e2f903c0" x="34.607687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="34.607687" y="278.9115" transform="rotate(-0 34.607687 278.9115)">−3</text>
     </g>
    </g>
    <g id="egxtick_2">
     <g id="egline2d_2">
      <g>
       <use xlink:href="#egm09e2f903c0" x="73.247687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="73.247687" y="278.9115" transform="rotate(-0 73.247687 278.9115)">−2</text>
     </g>
    </g>
    <g id="egxtick_3">
     <g id="egline2d_3">
      <g>
       <use xlink:href="#egm09e2f903c0" x="111.887687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="111.887687" y="278.9115" transform="rotate(-0 111.887687 278.9115)">−1</text>
     </g>
    </g>
    <g id="egxtick_4">
     <g id="egline2d_4">
      <g>
       <use xlink:href="#egm09e2f903c0" x="150.527687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="150.527687" y="278.9115" transform="rotate(-0 150.527687 278.9115)">0</text>
     </g>
    </g>
    <g id="egxtick_5">
     <g id="egline2d_5">
      <g>
       <use xlink:href="#egm09e2f903c0" x="189.167687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="189.167687" y="278.9115" transform="rotate(-0 189.167687 278.9115)">1</text>
     </g>
    </g>
    <g id="egxtick_6">
     <g id="egline2d_6">
      <g>
       <use xlink:href="#egm09e2f903c0" x="227.807687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_6">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="227.807687" y="278.9115" transform="rotate(-0 227.807687 278.9115)">2</text>
     </g>
    </g>
    <g id="egxtick_7">
     <g id="egline2d_7">
      <g>
       <use xlink:href="#egm09e2f903c0" x="266.447687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_7">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="266.447687" y="278.9115" transform="rotate(-0 266.447687 278.9115)">3</text>
     </g>
    </g>
    <g id="egxtick_8">
     <g id="egline2d_8">
      <g>
       <use xlink:href="#egm09e2f903c0" x="305.087687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="305.087687" y="278.9115" transform="rotate(-0 305.087687 278.9115)">4</text>
     </g>
    </g>
    <g id="egxtick_9">
     <g id="egline2d_9">
      <g>
       <use xlink:href="#egm09e2f903c0" x="343.727687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="343.727687" y="278.9115" transform="rotate(-0 343.727687 278.9115)">5</text>
     </g>
    </g>
   </g>
   <g id="egmatplotlib.axis_2">
    <g id="egytick_1">
     <g id="egline2d_10">
      <defs>
       <path id="egma2058d5495" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#egma2058d5495" x="26.879687" y="262.224" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_10">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="19.879687" y="267.06775" transform="rotate(-0 19.879687 267.06775)">−3</text>
     </g>
    </g>
    <g id="egytick_2">
     <g id="egline2d_11">
      <g>
       <use xlink:href="#egma2058d5495" x="26.879687" y="223.584" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_11">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="19.879687" y="228.42775" transform="rotate(-0 19.879687 228.42775)">−2</text>
     </g>
    </g>
    <g id="egytick_3">
     <g id="egline2d_12">
      <g>
       <use xlink:href="#egma2058d5495" x="26.879687" y="184.944" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_12">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="19.879687" y="189.78775" transform="rotate(-0 19.879687 189.78775)">−1</text>
     </g>
    </g>
    <g id="egytick_4">
     <g id="egline2d_13">
      <g>
       <use xlink:href="#egma2058d5495" x="26.879687" y="146.304" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_13">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="19.879687" y="151.14775" transform="rotate(-0 19.879687 151.14775)">0</text>
     </g>
    </g>
    <g id="egytick_5">
     <g id="egline2d_14">
      <g>
       <use xlink:href="#egma2058d5495" x="26.879687" y="107.664" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_14">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="19.879687" y="112.50775" transform="rotate(-0 19.879687 112.50775)">1</text>
     </g>
    </g>
    <g id="egytick_6">
     <g id="egline2d_15">
      <g>
       <use xlink:href="#egma2058d5495" x="26.879687" y="69.024" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_15">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="19.879687" y="73.86775" transform="rotate(-0 19.879687 73.86775)">2</text>
     </g>
    </g>
    <g id="egytick_7">
     <g id="egline2d_16">
      <g>
       <use xlink:href="#egma2058d5495" x="26.879687" y="30.384" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="egtext_16">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="19.879687" y="35.22775" transform="rotate(-0 19.879687 35.22775)">3</text>
     </g>
    </g>
   </g>
   <g id="egline2d_17">
    <path d="M 189.167687 146.304 
L 189.090672 143.865598 
L 188.859934 141.436917 
L 188.476392 139.027637 
L 187.941575 136.647363 
L 187.257615 134.305583 
L 186.427239 132.011633 
L 185.453758 129.774655 
L 184.34105 127.603569 
L 183.093553 125.507028 
L 181.716238 123.49339 
L 180.214597 121.570682 
L 178.594615 119.746568 
L 176.86275 118.02832 
L 175.025905 116.422786 
L 173.091404 114.936369 
L 171.066957 113.574991 
L 168.960634 112.344081 
L 166.780833 111.248546 
L 164.536241 110.292751 
L 162.235808 109.480509 
L 159.888702 108.815055 
L 157.504281 108.299043 
L 155.092048 107.93453 
L 152.661621 107.722969 
L 150.222688 107.665204 
L 147.78497 107.761464 
L 145.358186 108.011366 
L 142.952008 108.413913 
L 140.57603 108.967502 
L 138.239722 109.669924 
L 135.952397 110.518381 
L 133.723174 111.50949 
L 131.560938 112.6393 
L 129.474309 113.903308 
L 127.471606 115.296474 
L 125.56081 116.813245 
L 123.74954 118.447575 
L 122.045016 120.192949 
L 120.454031 122.042409 
L 118.98293 123.988583 
L 117.637574 126.023712 
L 116.423329 128.139685 
L 115.345033 130.328067 
L 114.406986 132.580133 
L 113.612927 134.886906 
L 112.96602 137.239191 
L 112.468846 139.627611 
L 112.123385 142.042646 
L 111.931015 144.474667 
L 111.892502 146.91398 
L 112.008001 149.350862 
L 112.277051 151.775599 
L 112.698579 154.178524 
L 113.270904 156.550058 
L 113.991747 158.880749 
L 114.858232 161.161305 
L 115.866906 163.382636 
L 117.013748 165.535886 
L 118.294187 167.612473 
L 119.703117 169.604117 
L 121.234924 171.502881 
L 122.8835 173.301194 
L 124.642274 174.991889 
L 126.504234 176.568225 
L 128.46196 178.023919 
L 130.507645 179.353168 
L 132.633137 180.550674 
L 134.829961 181.611662 
L 137.089362 182.531904 
L 139.402331 183.30773 
L 141.759649 183.936049 
L 144.151919 184.414355 
L 146.569605 184.740743 
L 149.003069 184.91391 
L 151.442611 184.933167 
L 153.878505 184.798436 
L 156.301042 184.510256 
L 158.700565 184.069774 
L 161.067508 183.478747 
L 163.392436 182.73953 
L 165.666082 181.85507 
L 167.879382 180.828894 
L 170.023513 179.665091 
L 172.089927 178.368301 
L 174.070389 176.943694 
L 175.957002 175.396947 
L 177.742246 173.734228 
L 179.419005 171.962163 
L 180.980595 170.087818 
L 182.420791 168.118663 
L 183.733852 166.062549 
L 184.914543 163.927672 
L 185.958157 161.722541 
L 186.860536 159.455947 
L 187.618081 157.136926 
L 188.227773 154.774722 
L 188.687182 152.378751 
L 188.994475 149.958564 
L 189.148429 147.523809 
L 189.167687 146.304 
L 189.167687 146.304 
" clip-path="url(#egp67af746be1)" style="fill: none; stroke-dasharray: 3.7,1.6; stroke-dashoffset: 0; stroke: #9aa5b1"/>
   </g>
   <g id="egline2d_18">
    <path d="M 227.807687 107.664 
L 230.092059 102.864212 
L 232.059263 98.237588 
L 233.701459 93.80257 
L 235.012099 89.576839 
L 235.98596 85.577239 
L 236.619159 81.819713 
L 236.909172 78.319241 
L 236.854843 75.089776 
L 236.456389 72.144192 
L 235.715398 69.49423 
L 234.634824 67.150455 
L 233.968487 66.096355 
L 233.218974 65.122209 
L 232.387033 64.228986 
L 231.473492 63.417577 
L 230.479263 62.688791 
L 229.405337 62.043355 
L 227.022752 61.005021 
L 224.335235 60.306713 
L 221.3535 59.951216 
L 218.089432 59.939946 
L 214.556044 60.272949 
L 210.767419 60.948897 
L 206.738662 61.965095 
L 202.485831 63.317493 
L 198.025879 65.0007 
L 193.376586 67.008005 
L 188.556484 69.331407 
L 183.584789 71.961645 
L 178.481318 74.888233 
L 173.266416 78.099505 
L 167.960871 81.582661 
L 162.585832 85.323814 
L 157.162725 89.308053 
L 151.71317 93.519494 
L 146.258888 97.94135 
L 140.821624 102.555993 
L 135.42305 107.345029 
L 130.084688 112.289367 
L 124.827818 117.369297 
L 119.673395 122.564569 
L 114.641967 127.854473 
L 109.753589 133.217923 
L 105.027749 138.633538 
L 100.483285 144.079729 
L 96.138313 149.534787 
L 92.010152 154.976966 
L 88.11526 160.384573 
L 84.469162 165.736049 
L 81.086393 171.010064 
L 77.980437 176.185594 
L 75.163675 181.242006 
L 72.647337 186.159146 
L 70.441453 190.917411 
L 68.554815 195.497834 
L 66.994946 199.882156 
L 65.768063 204.0529 
L 64.879056 207.993439 
L 64.331471 211.688067 
L 64.127488 215.122054 
L 64.267922 218.281712 
L 64.752213 221.154447 
L 65.57843 223.728805 
L 66.743279 225.994525 
L 67.451292 227.008775 
L 68.242118 227.942576 
L 69.114968 228.794998 
L 70.068971 229.565191 
L 71.103178 230.252388 
L 72.216557 230.855903 
L 74.676313 231.809566 
L 77.438435 232.422378 
L 80.491913 232.691898 
L 83.824573 232.61705 
L 87.423132 232.198133 
L 91.273244 231.436817 
L 95.359562 230.336136 
L 99.665796 228.900479 
L 104.17478 227.135568 
L 108.868541 225.048438 
L 113.728367 222.64741 
L 118.734886 219.942055 
L 123.868141 216.943157 
L 129.107668 213.662671 
L 134.432582 210.113673 
L 139.821656 206.310311 
L 145.253407 202.267746 
L 150.706182 198.002093 
L 156.158247 193.530357 
L 161.587866 188.870363 
L 166.973396 184.040686 
L 172.293369 179.06058 
L 177.526577 173.949897 
L 182.65216 168.729009 
L 187.649685 163.418728 
L 192.499231 158.040223 
L 197.181467 152.614934 
L 201.677726 147.164488 
L 205.970087 141.710612 
L 210.041437 136.275046 
L 213.875549 130.879458 
L 217.457137 125.545358 
L 220.771925 120.294007 
L 223.806699 115.14634 
L 226.549362 110.122876 
L 227.807687 107.664 
L 227.807687 107.664 
" clip-path="url(#egp67af746be1)" style="fill: none; stroke: #2a78d6; stroke-opacity: 0.7; stroke-width: 1.2; stroke-linecap: square"/>
   </g>
   <g id="egline2d_19">
    <path d="M 189.167687 146.304 
L 227.807687 107.664 
" clip-path="url(#egp67af746be1)" style="fill: none; stroke-dasharray: 0.6,0.99; stroke-dashoffset: 0; stroke: #9aa5b1; stroke-width: 0.6"/>
   </g>
   <g id="egline2d_20">
    <path d="M 150.527687 107.664 
L 189.167687 69.024 
" clip-path="url(#egp67af746be1)" style="fill: none; stroke-dasharray: 0.6,0.99; stroke-dashoffset: 0; stroke: #9aa5b1; stroke-width: 0.6"/>
   </g>
   <g id="egline2d_21">
    <path d="M 131.207687 112.840778 
L 145.350909 98.697557 
" clip-path="url(#egp67af746be1)" style="fill: none; stroke-dasharray: 0.6,0.99; stroke-dashoffset: 0; stroke: #9aa5b1; stroke-width: 0.6"/>
   </g>
   <g id="egline2d_22">
    <path d="M 114.217965 133.088342 
L 91.1239 156.182406 
" clip-path="url(#egp67af746be1)" style="fill: none; stroke-dasharray: 0.6,0.99; stroke-dashoffset: 0; stroke: #9aa5b1; stroke-width: 0.6"/>
   </g>
   <g id="egline2d_23">
    <path d="M 26.879687 146.304 
L 366.911687 146.304 
" clip-path="url(#egp67af746be1)" style="fill: none; stroke: currentColor; stroke-width: 0.5; stroke-linecap: square"/>
   </g>
   <g id="egline2d_24">
    <path d="M 150.527687 262.224 
L 150.527687 7.2 
" clip-path="url(#egp67af746be1)" style="fill: none; stroke: currentColor; stroke-width: 0.5; stroke-linecap: square"/>
   </g>
   <g id="egpatch_3">
    <path d="M 26.879687 262.224 
L 26.879687 7.2 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="egpatch_4">
    <path d="M 26.879688 262.224 
L 366.911687 262.224 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="egpatch_5">
    <path d="M 152.532326 146.304 
Q 169.850495 146.304 185.827022 146.304 
" style="fill: none; stroke: #9aa5b1; stroke-width: 1.2; stroke-linecap: round"/>
    <path d="M 181.827022 144.304 
L 185.827022 146.304 
L 181.827022 148.304 
z
" style="fill: #9aa5b1; stroke: #9aa5b1; stroke-width: 1.2; stroke-linecap: round"/>
   </g>
   <g id="egpatch_6">
    <path d="M 152.317712 145.408988 
Q 189.167685 126.984001 224.817657 109.159015 
" style="fill: none; opacity: 0.8; stroke: #2a78d6; stroke-width: 1.2; stroke-linecap: round"/>
    <path d="M 220.345521 109.159015 
L 224.817657 109.159015 
L 222.134376 112.736724 
z
" style="fill: #2a78d6; opacity: 0.8; stroke: #2a78d6; stroke-width: 1.2; stroke-linecap: round"/>
   </g>
   <g id="egpatch_7">
    <path d="M 150.527687 144.299361 
Q 150.527687 126.981193 150.527687 111.004665 
" style="fill: none; stroke: #9aa5b1; stroke-width: 1.2; stroke-linecap: round"/>
    <path d="M 148.527687 115.004665 
L 150.527687 111.004665 
L 152.527687 115.004665 
z
" style="fill: #9aa5b1; stroke: #9aa5b1; stroke-width: 1.2; stroke-linecap: round"/>
   </g>
   <g id="egpatch_8">
    <path d="M 151.4227 144.513976 
Q 169.847686 107.664003 187.672672 72.01403 
" style="fill: none; opacity: 0.8; stroke: #2a78d6; stroke-width: 1.2; stroke-linecap: round"/>
    <path d="M 184.094964 74.697312 
L 187.672672 72.01403 
L 187.672672 76.486166 
z
" style="fill: #2a78d6; opacity: 0.8; stroke: #2a78d6; stroke-width: 1.2; stroke-linecap: round"/>
   </g>
   <g id="egpatch_9">
    <path d="M 149.525368 144.567932 
Q 140.866284 129.569958 132.87802 115.733879 
" style="fill: none; stroke: #9aa5b1; stroke-width: 1.2; stroke-linecap: round"/>
    <path d="M 133.145969 120.197981 
L 132.87802 115.733879 
L 136.610071 118.197981 
z
" style="fill: #9aa5b1; stroke: #9aa5b1; stroke-width: 1.2; stroke-linecap: round"/>
   </g>
   <g id="egpatch_10">
    <path d="M 150.311251 144.313618 
Q 147.939315 122.500933 145.712416 102.022026 
" style="fill: none; opacity: 0.8; stroke: #2a78d6; stroke-width: 1.2; stroke-linecap: round"/>
    <path d="M 144.156552 106.214792 
L 145.712416 102.022026 
L 148.13311 105.782377 
z
" style="fill: #2a78d6; opacity: 0.8; stroke: #2a78d6; stroke-width: 1.2; stroke-linecap: round"/>
   </g>
   <g id="egpatch_11">
    <path d="M 148.643943 145.618373 
Q 132.370188 139.695211 117.357163 134.230916 
" style="fill: none; stroke: #9aa5b1; stroke-width: 1.2; stroke-linecap: round"/>
    <path d="M 120.431893 137.478382 
L 117.357163 134.230916 
L 121.799974 133.719612 
z
" style="fill: #9aa5b1; stroke: #9aa5b1; stroke-width: 1.2; stroke-linecap: round"/>
   </g>
   <g id="egpatch_12">
    <path d="M 148.55167 146.632597 
Q 120.824475 151.243422 94.420745 155.634165 
" style="fill: none; opacity: 0.8; stroke: #2a78d6; stroke-width: 1.2; stroke-linecap: round"/>
    <path d="M 98.69464 156.950913 
L 94.420745 155.634165 
L 98.03848 153.005099 
z
" style="fill: #2a78d6; opacity: 0.8; stroke: #2a78d6; stroke-width: 1.2; stroke-linecap: round"/>
   </g>
   <g id="egpatch_13">
    <path d="M 151.941012 144.890676 
Q 191.511489 105.320198 229.026486 67.805201 
" style="fill: none; stroke: #d64545; stroke-width: 2.6; stroke-linecap: round"/>
    <path d="M 224.783846 69.219415 
L 229.026486 67.805201 
L 227.612273 72.047842 
z
" style="fill: #d64545; stroke: #d64545; stroke-width: 2.6; stroke-linecap: round"/>
   </g>
   <g id="egpatch_14">
    <path d="M 151.945181 147.721494 
Q 164.190976 159.967288 174.381289 170.157602 
" style="fill: none; stroke: #d64545; stroke-width: 2.6; stroke-linecap: round"/>
    <path d="M 172.967076 165.914961 
L 174.381289 170.157602 
L 170.138649 168.743388 
z
" style="fill: #d64545; stroke: #d64545; stroke-width: 2.6; stroke-linecap: round"/>
   </g>
   <g id="egtext_17">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #d64545" transform="translate(235.535687 48.474352)">(1, 1) direction:</text>
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #d64545" transform="translate(235.535687 59.364)">stretched ×3</text>
   </g>
   <g id="egtext_18">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #d64545" transform="translate(183.371687 172.122352)">(1, −1) direction:</text>
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #d64545" transform="translate(183.371687 183.012)">kept ×1</text>
   </g>
   <g id="egtext_19">
    <text fill="currentColor" style="font-size: 8.5px; font-family: inherit" transform="translate(30.743688 29.759332)">grey: inputs</text>
    <text fill="currentColor" style="font-size: 8.5px; font-family: inherit" transform="translate(30.743688 40.044)">blue: outputs</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="egp67af746be1">
   <rect x="26.879687" y="7.2" width="340.032" height="255.024"/>
  </clipPath>
 </defs>
</svg><figcaption>A symmetric matrix turns the unit circle into an ellipse. Ordinary arrows are turned and stretched (grey → blue); the eigenvectors (red) lie along the ellipse's axes and are only stretched, by their eigenvalues 3 and 1. XᵀX does the same with eigenvalues 27 and 1, an ellipse too thin to draw clearly.</figcaption></figure>
  <p>Back to the houses, this says something concrete. Moving the weights along (1, 1), raising both the size weight and the room weight, changes the predictions a lot: X(1, 1) = [2, 5, 5]. Moving them along (1, −1), raising one and lowering the other, barely changes them: X(1, −1) = [0, −1, 1]. Because size and rooms overlap so much (the 13), trading one weight for the other is almost invisible in the predictions. The 27 : 1 ratio of eigenvalues measures that, and it has two consequences. The loss surface for this regression is a long, narrow valley, steep along (1, 1) and nearly flat along (1, −1), which is why plain gradient descent zig-zags on it (see <a class="xref" data-note="m_calculus">Calculus</a> and <a class="xref" data-note="m_optimization">Optimization</a>). And the ratio of largest to smallest eigenvalue is exactly the condition number of a symmetric matrix like XᵀX, so a duplicate feature, which creates a direction that changes nothing at all, shows up as an eigenvalue of 0.</p>
  <p>Symmetric matrices such as XᵀX, covariance matrices and the Hessians of loss functions always behave nicely: their eigenvalues are real numbers, their eigenvectors are perpendicular to each other, and for XᵀX and covariance matrices the eigenvalues are never negative (such matrices are called positive semi-definite). Three more facts are useful and easy to check:</p>
  <div class="fx" data-lang="py">G = X.T @ X
vals = np.linalg.eigvalsh(G)
print(vals.sum(), np.trace(G), vals.prod(), round(np.linalg.det(G), 3))
print(np.linalg.eigvalsh(G + 0.1 * np.eye(2)))     # ridge lifts every eigenvalue by 0.1

v = np.array([1., 0.])                  # multiply by G again and again
for step in range(4):
    v = G @ v
    print(step + 1, v / np.linalg.norm(v), round(np.linalg.norm(v), 1))</div>
  <div class="fx" data-lang="text">28.0 28.0 27.0 27.0
[ 1.1 27.1]
1 [0.733 0.68 ] 19.1
2 [0.708 0.706] 515.5
3 [0.707 0.707] 13918.0
4 [0.707 0.707] 375785.5</div>
  <p>The eigenvalues add up to the <strong>trace</strong>, the sum of the diagonal (1 + 27 = 28 = 14 + 14), and multiply to the determinant (1 × 27 = 27). That gives another view of singularity: the determinant is 0 exactly when some eigenvalue is 0. The second line shows why ridge works: adding 0.1 × I to the matrix adds 0.1 to every eigenvalue, [1.1, 27.1], so an eigenvalue of 0 becomes 0.1 and the matrix can be inverted. The loop multiplies a starting vector (1, 0) by XᵀX again and again. Its direction quickly swings round to (0.707, 0.707), the top eigenvector, while its length grows by about 27 each time: repeated multiplication by a matrix amplifies the top eigen-direction and lets the rest fade. This is the <strong>power method</strong>, the basis of Google's original PageRank, and it is also why recurrent neural networks suffer from exploding or vanishing gradients: multiplying by the same weight matrix at every time step blows up directions with |λ| &gt; 1 and kills those with |λ| &lt; 1 (see <a class="xref" data-note="dl_rnns">RNNs &amp; Sequential</a>).</p>
  <p>Not every matrix has real eigenvectors. A 90° rotation turns <em>every</em> direction, so it has none (its eigenvalues are complex numbers), and eigenvectors only make sense for square matrices, which map a space to itself. Our data table X is 3 × 2: it maps 2 weights to 3 predictions, so "a direction it does not turn" means nothing for it. That limitation is what the next section removes.</p>

  <h2 id="mla-svd"><span class="num">08</span>Singular Value Decomposition</h2>
  <p>Real data tables are tall and thin, with many rows and fewer columns, never square. We still want to find their natural directions and how important each one is, so we can compress the table, remove noise or find hidden patterns such as "users who like action films". Eigenvectors cannot be applied to X directly, but there is a decomposition that works for a matrix of any shape.</p>
  <p>The <strong>singular value decomposition</strong> (SVD) says that any matrix M, of any shape, can be written as a product of three simple pieces, <code>M = UΣVᵀ</code>, which act from right to left: Vᵀ rotates the input, Σ (capital sigma) stretches along the axes, and U rotates the result into the output space. The columns of V are the <strong>right singular vectors</strong>, the natural input directions (patterns across the columns of the table). Σ is a diagonal matrix holding the <strong>singular values</strong> σ₁ ≥ σ₂ ≥ … ≥ 0, sorted largest first, which say how strongly each pattern is present. The columns of U are the <strong>left singular vectors</strong>, saying how much of each pattern every row contains. Think of a tea stall where every cup is a blend of a few base flavours such as ginger, cardamom and sugar. SVD finds the base flavours (V), how strong each one is across all cups (Σ), and each cup's recipe (U). Drop the weakest flavours and the tea tastes almost the same.</p>
  <p>The connection with the previous section is direct. The input directions of X's SVD are the eigenvectors of XᵀX, and the singular values are the square roots of its eigenvalues. The reason is a one-line calculation: if X = UΣVᵀ then XᵀX = VΣUᵀUΣVᵀ = VΣ²Vᵀ, because UᵀU = I (U's columns are perpendicular unit vectors), and VΣ²Vᵀ is exactly an eigen-decomposition with eigenvectors V and eigenvalues σ². So for our houses, v₁ = (1, 1)/√2 with σ₁ = √27 ≈ 5.196, and v₂ = (1, −1)/√2 with σ₂ = √1 = 1. The output directions follow from u = Xv / σ: X v₁ = [2, 5, 5]/√2, which has length √(4 + 25 + 25)/√2 = √27, so u₁ = [2, 5, 5]/√54 ≈ [0.272, 0.680, 0.680]; and u₂ = [0, −1, 1]/√2 ≈ [0, −0.707, 0.707].</p>
  <p>Each pattern carries a share of the table's total "energy" (the sum of all squared entries), equal to σᵢ² divided by the sum of all σ². Here that is 27/28 = 96.4% for the first pattern and 1/28 = 3.6% for the second. Keeping only the first pattern gives the rank-1 approximation σ₁u₁v₁ᵀ, in which every house becomes "overall bigness" with an equal mix of size and rooms.</p>
  <div class="fx" data-lang="py">U, s, Vt = np.linalg.svd(X, full_matrices=False)
sg = np.sign(Vt[:, 0]); U, Vt = U * sg, Vt * sg[:, None]   # signs are arbitrary: make them readable
print(U.shape, s.shape, Vt.shape)
print(s, s**2)                          # singular values; squared = eigenvalues of XᵀX
print(Vt)                               # rows = input directions (right singular vectors)
print(np.round(U, 3) + 0.0)             # columns = output directions; + 0.0 tidies -0.0
print(np.allclose(U @ np.diag(s) @ Vt, X))
X1 = s[0] * np.outer(U[:, 0], Vt[0])    # keep only the top pattern (rank 1)
print(X1)
print(np.round(s**2 / (s**2).sum(), 3)) # share of "energy" per pattern</div>
  <div class="fx" data-lang="text">(3, 2) (2,) (2, 2)
[5.196 1.   ] [27.  1.]
[[ 0.707  0.707]
 [ 0.707 -0.707]]
[[ 0.272  0.   ]
 [ 0.68  -0.707]
 [ 0.68   0.707]]
True
[[1.  1. ]
 [2.5 2.5]
 [2.5 2.5]]
[0.964 0.036]</div>
  <p>NumPy returns U (3 × 2), the two singular values and Vᵀ (2 × 2). The singular values are 5.196 and 1, and their squares, 27 and 1, are exactly the eigenvalues of XᵀX. The rows of Vᵀ are the directions (1, 1)/√2 and (1, −1)/√2, and U matches the hand calculation. The signs of singular vectors are arbitrary, like those of eigenvectors, so the second line flips them to read positively; flipping a pair together does not change the product. <code>allclose</code> confirms that UΣVᵀ rebuilds X exactly. The rank-1 copy turns A into [1, 1] and both B and C into [2.5, 2.5]: B and C differ only in the weak second pattern, the trade-off between more rooms and more floor area.</p>
  <p>Truncating an SVD like this, keeping the top k singular values and dropping the rest, gives the best possible rank-k approximation of a matrix, in the sense of the smallest total squared error (a result known as the Eckart–Young theorem). That is the basis of compression and of classic recommender systems. Here is a small ratings table, 4 users × 3 films, kept to its top 2 patterns:</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)
M = np.array([[5., 5., 1.],             # 4 users x 3 movies (two action films, one romance)
              [4., 5., 1.],             # users 1-2: action fans
              [1., 1., 5.],             # users 3-4: romance fans
              [1., 2., 4.]])
Um, sm, Vtm = np.linalg.svd(M, full_matrices=False)
print(sm)
M2 = Um[:, :2] @ np.diag(sm[:2]) @ Vtm[:2]     # keep the top 2 patterns only
print(np.round(M2, 1))
print(round(np.linalg.norm(M - M2) / np.linalg.norm(M), 3))
print(np.round(sm**2 / (sm**2).sum(), 3))</div>
  <div class="fx" data-lang="text">[10.491  5.514  0.733]
[[4.7 5.3 1. ]
 [4.3 4.8 1. ]
 [0.8 1.2 5. ]
 [1.3 1.7 4. ]]
0.062
[0.781 0.216 0.004]</div>
  <p>The singular values are 10.491, 5.514 and 0.733, so the first two patterns, roughly "likes action" and "likes romance", hold 78.1% + 21.6% = 99.6% of the energy. The rank-2 copy rebuilds the ratings with about 6% relative error, using two "taste" numbers per user instead of three ratings. In a real recommender the table is mostly empty, and the low-rank structure is what lets the model fill in the missing ratings (see <a class="xref" data-note="ml_mf">Matrix Factorization</a>). The same idea appears as latent semantic analysis for text, as compression of large weight matrices, and in LoRA fine-tuning, which learns a low-rank update to a model's weights (see <a class="xref" data-note="finetuning">Fine-Tuning</a>). The number of non-zero singular values is the rank of the matrix, and <code>lstsq</code> and scikit-learn's PCA both run on SVD internally.</p>
  <p>One caution before the next section. The SVD above found that one pattern holds 96% of X's energy, but energy includes the plain distance of every house from the origin (0, 0), and all our houses are positive numbers far from it. What we usually want is the direction in which the houses <em>differ</em> from each other most, and that requires the table to be centred first.</p>

  <h2 id="mla-pca"><span class="num">09</span>Principal Component Analysis</h2>
  <p>Size and rooms move together in our table (the 13 in XᵀX). Real datasets are full of such overlap: hundreds of columns, many of them saying nearly the same thing. Too many columns slow models down, make distances less meaningful and are impossible to plot. Can we replace several columns with fewer new ones while losing as little information as possible?</p>
  <p><strong>Principal component analysis</strong> (PCA) does this by finding the direction along which the data is most spread out and describing each row by its position along that direction. That best direction is the first <strong>principal component</strong>, PC1. The second, PC2, is the direction of most remaining spread at a right angle to PC1, and so on. Keeping only the first few components keeps most of the differences between rows in far fewer numbers. Think of photographing a cricket bat. From the side the photo shows its full length; end-on it looks like a small rectangle and you can hardly tell what it is. PCA picks the camera angle that shows the most spread, so the flat picture loses the least.</p>
  <p>Two ideas from statistics make this precise (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> and <a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a>). <strong>Variance</strong> measures how much a column varies around its average. <strong>Covariance</strong> measures whether two columns rise and fall together (positive), move in opposite directions (negative) or are unrelated (near 0). The <strong>covariance matrix</strong> holds the variances on its diagonal and the covariances off it, and it is computed with the tools we already have: centre each column by subtracting its mean, then take <code>C = X<sub>c</sub>ᵀX<sub>c</sub> / (n − 1)</code>, where X<sub>c</sub> is the centred table and n the number of rows. The spread of the data along any unit direction v is then vᵀCv, and the direction that makes this largest is the top eigenvector of C, with the eigenvalue equal to the variance along it. So PCA is: centre, compute the covariance matrix, find its eigenvectors, sort them by eigenvalue, and project.</p>
  <p>Worked on the houses. The column means are size 2 and rooms 2, so centring gives A → (−1, −1), B → (0, 1), C → (1, 0). The variance of size is ((−1)² + 0² + 1²)/(3 − 1) = 2/2 = 1, the variance of rooms is ((−1)² + 1² + 0²)/2 = 1, and their covariance is ((−1)(−1) + 0×1 + 1×0)/2 = 0.5, so C = [[1, 0.5], [0.5, 1]]. This has the same pattern as XᵀX, so its eigenvectors are again (1, 1) and (1, −1): (1, 1) → (1.5, 1.5), eigenvalue 1.5, and (1, −1) → (0.5, −0.5), eigenvalue 0.5. The share of the spread along PC1, the <strong>explained variance ratio</strong>, is 1.5 / (1.5 + 0.5) = 75%. PC1 as a unit vector is (0.707, 0.707), and each house's single new number, its <strong>score</strong>, is its centred row dotted with PC1: A = (−1 − 1) × 0.707 = −1.414, B = (0 + 1) × 0.707 = 0.707, C = (1 + 0) × 0.707 = 0.707.</p>
  <div class="fx" data-lang="py">from sklearn.decomposition import PCA
Xc = X - X.mean(axis=0)            # 1. centre: subtract column means (2, 2)
Cv = Xc.T @ Xc / (len(X) - 1)      # 2. covariance matrix
lam, V = np.linalg.eigh(Cv)        # 3. eigen-decompose
order = np.argsort(lam)[::-1]      # 4. sort big -&gt; small
lam, V = lam[order], V[:, order]
pc1 = V[:, 0] * np.sign(V[0, 0])   #    (fix the sign so PC1 points "bigger")
print(Xc)
print(Cv)
print(lam, lam / lam.sum())
print(pc1, Xc @ pc1)               # 5. project: one number per house

pca = PCA(n_components=1).fit(X)
print(pca.components_, pca.explained_variance_, pca.explained_variance_ratio_)
print(pca.transform(X).ravel())</div>
  <div class="fx" data-lang="text">[[-1. -1.]
 [ 0.  1.]
 [ 1.  0.]]
[[1.  0.5]
 [0.5 1. ]]
[1.5 0.5] [0.75 0.25]
[0.707 0.707] [-1.414  0.707  0.707]
[[0.707 0.707]] [1.5] [0.75]
[-1.414  0.707  0.707]</div>
  <p>The five steps by hand reproduce the centred table, the covariance matrix [[1, 0.5], [0.5, 1]], the eigenvalues 1.5 and 0.5 (75% and 25%) and the scores −1.414, 0.707 and 0.707. scikit-learn's <code>PCA</code>, which centres internally, gives the same component, variance and scores. PC1 means "overall bigness": A is small, while B and C are equally big and differ only along PC2 (more rooms versus more floor area), which carries the remaining 25%. Compare this with the SVD of the uncentred X in section 08, which put 96% on its top pattern: that number described distance from zero, not spread between houses. Centring is what turns SVD into PCA.</p>
  <p>Three houses are too few to see the picture, so here are the height and weight of 200 generated people, where weight tracks height plus some noise:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.decomposition import PCA
np.set_printoptions(precision=3, suppress=True)
rng = np.random.default_rng(0)
h = rng.normal(170, 10, 200)                  # height (cm) of 200 people
wt = 0.9 * h - 90 + rng.normal(0, 4, 200)     # weight (kg) tracks height
P = np.column_stack([h, wt])
Pc = P - P.mean(axis=0)
lam, V = np.linalg.eigh(Pc.T @ Pc / (len(P) - 1))
lam, V = lam[::-1], V[:, ::-1]
print(lam, lam / lam.sum())
pp = PCA(n_components=2).fit(P)
print(pp.explained_variance_, pp.explained_variance_ratio_)
print(pp.components_)

U, s, Vt = np.linalg.svd(Pc, full_matrices=False)   # PCA via SVD of the centred table
print(s**2 / (len(P) - 1))</div>
  <div class="fx" data-lang="text">[171.206   9.129] [0.949 0.051]
[171.206   9.129] [0.949 0.051]
[[ 0.719  0.695]
 [-0.695  0.719]]
[171.206   9.129]</div>
  <p>The hand-written eigen-decomposition and scikit-learn agree: variances 171.2 and 9.1, a 95% / 5% split. PC1 is about (0.72, 0.70), a mix of height and weight that might be called "overall body size", and one number per person along it keeps 95% of the spread. Note that NumPy returns eigenvectors as columns, while scikit-learn's <code>components_</code> are rows. The last line computes the same variances from the SVD of the centred table, σ²/(n − 1), which is how scikit-learn actually does it, because SVD is more accurate than forming the covariance matrix.</p>
  <figure class="viz"><svg viewBox="0 0 396.732344 293.535219" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:560px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="pcfigure_1">
  <g id="pcpatch_1">
   <path d="M -0 293.535219 
L 396.732344 293.535219 
L 396.732344 0 
L -0 0 
L -0 293.535219 
z
" style="fill: none"/>
  </g>
  <g id="pcaxes_1">
   <g id="pcpatch_2">
    <path d="M 43.068359 251.136 
L 388.709491 251.136 
L 388.709491 7.2 
L 43.068359 7.2 
L 43.068359 251.136 
z
" style="fill: none"/>
   </g>
   <g id="pcPathCollection_1">
    <defs>
     <path id="pcm45dbc6febc" d="M 0 1.732051 
C 0.459345 1.732051 0.899939 1.549551 1.224745 1.224745 
C 1.549551 0.899939 1.732051 0.459345 1.732051 0 
C 1.732051 -0.459345 1.549551 -0.899939 1.224745 -1.224745 
C 0.899939 -1.549551 0.459345 -1.732051 0 -1.732051 
C -0.459345 -1.732051 -0.899939 -1.549551 -1.224745 -1.224745 
C -1.549551 -0.899939 -1.732051 -0.459345 -1.732051 0 
C -1.732051 0.459345 -1.549551 0.899939 -1.224745 1.224745 
C -0.899939 1.549551 -0.459345 1.732051 0 1.732051 
z
"/>
    </defs>
    <g clip-path="url(#pcpf48c209c63)">
     <use xlink:href="#pcm45dbc6febc" x="174.822131" y="142.105883" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="163.954032" y="151.042166" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="196.517116" y="138.456524" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="173.944114" y="119.411308" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="146.943241" y="142.417374" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="184.764154" y="130.00247" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="224.487804" y="83.465214" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="209.44318" y="121.554091" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="139.859036" y="170.340131" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="116.183199" y="160.460357" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="143.250567" y="157.044233" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="171.264378" y="95.166315" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="71.519228" y="237.163429" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="160.300066" y="134.204268" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="117.005594" y="186.249537" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="138.656369" y="153.92751" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="146.581177" y="156.456766" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="156.189951" y="157.149387" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="186.873218" y="134.700832" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="213.465785" y="44.443987" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="164.104521" y="141.868248" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="227.120722" y="117.851582" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="141.483573" y="171.85878" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="184.339058" y="110.920967" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="207.604926" y="109.844218" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="173.485178" y="109.183716" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="138.182929" y="146.992622" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="130.670456" y="173.223339" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="150.228667" y="161.014255" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="178.803955" y="144.276169" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="126.965655" y="185.790964" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="160.705397" y="168.461372" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="162.810881" y="121.421669" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="192.319807" y="88.350332" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="178.570605" y="148.723863" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="184.501874" y="142.130368" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="141.962668" y="190.309906" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="164.059041" y="156.856206" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="202.568062" y="158.321507" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="232.472582" y="98.292358" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="116.45111" y="161.58554" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="233.336374" y="84.083728" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="226.252908" y="70.221866" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="202.455768" y="114.292331" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="180.669596" y="95.969795" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="156.290159" y="144.238171" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="230.979983" y="86.817019" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="252.149981" y="18.288" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="245.463787" y="72.811601" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="224.955841" y="106.38847" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="184.586501" y="118.726074" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="118.590161" y="182.181872" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="169.334684" y="117.878211" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="197.193741" y="126.323119" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="115.216247" y="170.995651" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="186.177363" y="106.320809" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="187.64177" y="130.638215" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="198.861577" y="106.530435" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="119.610252" y="194.61594" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="141.63077" y="121.238947" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="151.126094" y="164.116929" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="120.213693" y="187.704995" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="242.839149" y="87.673611" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="148.619121" y="160.336821" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="183.388948" y="123.307257" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="158.623248" y="132.551973" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="236.267963" y="85.910207" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="225.17744" y="88.730792" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="196.219105" y="135.543823" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="76.641499" y="233.231339" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="171.715524" y="87.249855" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="198.340733" y="92.195653" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="211.840775" y="110.776774" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="143.476811" y="181.678351" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="246.322684" y="83.016678" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="113.864474" y="186.145931" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="141.638128" y="160.198393" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="208.936058" y="112.766109" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="171.59015" y="155.519447" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="253.925997" y="35.742766" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="177.468772" y="120.920681" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="142.832441" y="166.024461" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="153.607617" y="153.73185" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="123.529142" y="186.010181" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="115.666478" y="233.661728" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="196.095132" y="109.822498" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="194.01936" y="131.690774" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="224.089843" y="103.48318" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="137.714773" y="175.110114" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="240.720604" y="59.26269" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="157.40865" y="166.326238" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="235.885878" y="100.143712" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="151.279921" y="141.318056" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="138.520813" y="150.870437" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="180.051224" y="142.380279" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="212.999579" y="87.076286" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="176.309204" y="134.497035" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="144.841597" y="152.820851" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="112.9882" y="207.829333" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="110.446452" y="174.813378" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="190.711196" y="96.330562" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="211.24018" y="87.400675" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="162.597192" y="132.50685" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="124.236495" y="240.048" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="206.322344" y="98.173769" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="115.552089" y="184.69038" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="139.465644" y="165.218426" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="195.699177" y="122.760865" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="74.675927" y="220.11642" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="185.808435" y="114.082123" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="145.005481" y="162.200916" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="174.128719" y="139.354287" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="166.33151" y="117.825562" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="178.041828" y="146.657682" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="198.782721" y="91.984813" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="137.556117" y="161.476578" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="229.418753" y="95.34239" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="200.128271" y="113.032046" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="205.086909" y="119.191611" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="218.62303" y="80.115557" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="202.720344" y="99.944115" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="205.101494" y="113.054779" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="172.708805" y="151.404312" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="109.381977" y="184.727361" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="163.830097" y="124.669109" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="137.086345" y="166.79987" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="109.551935" y="182.607846" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="180.416568" y="132.223349" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="145.5573" y="156.117414" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="126.114777" y="179.666127" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="125.55852" y="170.297859" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="180.836576" y="150.960904" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="184.640941" y="111.219989" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="225.265809" y="89.395796" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="168.93591" y="130.169592" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="213.437392" y="101.902399" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="228.629798" y="77.089956" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="218.003475" y="110.139102" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="69.821661" y="205.368953" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="221.313118" y="117.799118" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="183.837876" y="140.32628" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="187.38497" y="115.638307" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="185.170171" y="96.940768" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="185.656166" y="116.478328" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="182.986175" y="127.750552" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="154.393749" y="173.331658" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="89.365923" y="211.053936" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="164.931528" y="140.155" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="135.644043" y="137.674693" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="215.052786" y="84.221361" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="157.350532" y="172.424095" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="173.041031" y="98.348713" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="133.710387" y="174.57897" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="147.999002" y="169.887305" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="169.036298" y="111.259259" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="106.911851" y="192.876481" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="182.196718" y="130.475799" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="165.051342" y="136.023179" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="119.542732" y="166.424495" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="68.433661" y="209.919755" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="191.148276" y="139.411449" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="156.978861" y="113.28178" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="147.181858" y="139.829965" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="159.568194" y="151.040399" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="246.089358" y="80.580865" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="167.423253" y="153.915385" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="173.173551" y="130.321814" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="106.840292" y="203.027882" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="238.96001" y="86.090419" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="208.195796" y="87.203832" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="214.495185" y="89.065768" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="171.531902" y="140.532211" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="208.160675" y="88.533817" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="185.158344" y="98.560982" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="195.369184" y="130.879774" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="163.107292" y="151.633504" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="107.396054" y="175.708673" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="212.890039" y="84.535474" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="87.961256" y="205.270841" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="159.408775" y="125.191287" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="160.901531" y="161.7947" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="125.564461" y="200.18929" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="195.366404" y="127.038258" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="161.078263" y="141.221641" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="151.107839" y="165.683638" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="191.434466" y="124.181981" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="149.433978" y="170.206689" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="228.069823" y="93.456169" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="184.33674" y="139.29643" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="149.528652" y="147.486771" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="87.569024" y="196.043821" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="114.398859" y="193.399844" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="215.333825" y="97.952409" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="167.389402" y="147.404301" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="157.588326" y="137.47156" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="238.787718" y="71.847758" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="115.457025" y="157.468564" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="144.83616" y="176.375947" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="149.60222" y="147.504251" style="fill: #2a78d6; fill-opacity: 0.55"/>
     <use xlink:href="#pcm45dbc6febc" x="194.237344" y="105.958692" style="fill: #2a78d6; fill-opacity: 0.55"/>
    </g>
   </g>
   <g id="pcmatplotlib.axis_1">
    <g id="pcxtick_1">
     <g id="pcline2d_1">
      <defs>
       <path id="pcm09e2f903c0" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#pcm09e2f903c0" x="43.068359" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="43.068359" y="267.8235" transform="rotate(-0 43.068359 267.8235)">140</text>
     </g>
    </g>
    <g id="pcxtick_2">
     <g id="pcline2d_2">
      <g>
       <use xlink:href="#pcm09e2f903c0" x="85.219717" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="85.219717" y="267.8235" transform="rotate(-0 85.219717 267.8235)">150</text>
     </g>
    </g>
    <g id="pcxtick_3">
     <g id="pcline2d_3">
      <g>
       <use xlink:href="#pcm09e2f903c0" x="127.371074" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="127.371074" y="267.8235" transform="rotate(-0 127.371074 267.8235)">160</text>
     </g>
    </g>
    <g id="pcxtick_4">
     <g id="pcline2d_4">
      <g>
       <use xlink:href="#pcm09e2f903c0" x="169.522432" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="169.522432" y="267.8235" transform="rotate(-0 169.522432 267.8235)">170</text>
     </g>
    </g>
    <g id="pcxtick_5">
     <g id="pcline2d_5">
      <g>
       <use xlink:href="#pcm09e2f903c0" x="211.673789" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="211.673789" y="267.8235" transform="rotate(-0 211.673789 267.8235)">180</text>
     </g>
    </g>
    <g id="pcxtick_6">
     <g id="pcline2d_6">
      <g>
       <use xlink:href="#pcm09e2f903c0" x="253.825147" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_6">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="253.825147" y="267.8235" transform="rotate(-0 253.825147 267.8235)">190</text>
     </g>
    </g>
    <g id="pcxtick_7">
     <g id="pcline2d_7">
      <g>
       <use xlink:href="#pcm09e2f903c0" x="295.976504" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_7">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="295.976504" y="267.8235" transform="rotate(-0 295.976504 267.8235)">200</text>
     </g>
    </g>
    <g id="pcxtick_8">
     <g id="pcline2d_8">
      <g>
       <use xlink:href="#pcm09e2f903c0" x="338.127862" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="338.127862" y="267.8235" transform="rotate(-0 338.127862 267.8235)">210</text>
     </g>
    </g>
    <g id="pcxtick_9">
     <g id="pcline2d_9">
      <g>
       <use xlink:href="#pcm09e2f903c0" x="380.279219" y="251.136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="380.279219" y="267.8235" transform="rotate(-0 380.279219 267.8235)">220</text>
     </g>
    </g>
    <g id="pctext_10">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="215.888925" y="283.923109" transform="rotate(-0 215.888925 283.923109)">height (cm)</text>
    </g>
   </g>
   <g id="pcmatplotlib.axis_2">
    <g id="pcytick_1">
     <g id="pcline2d_10">
      <defs>
       <path id="pcma2058d5495" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#pcma2058d5495" x="43.068359" y="232.636171" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_11">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="237.479921" transform="rotate(-0 36.068359 237.479921)">40</text>
     </g>
    </g>
    <g id="pcytick_2">
     <g id="pcline2d_11">
      <g>
       <use xlink:href="#pcma2058d5495" x="43.068359" y="190.484814" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_12">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="195.328564" transform="rotate(-0 36.068359 195.328564)">50</text>
     </g>
    </g>
    <g id="pcytick_3">
     <g id="pcline2d_12">
      <g>
       <use xlink:href="#pcma2058d5495" x="43.068359" y="148.333456" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_13">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="153.177206" transform="rotate(-0 36.068359 153.177206)">60</text>
     </g>
    </g>
    <g id="pcytick_4">
     <g id="pcline2d_13">
      <g>
       <use xlink:href="#pcma2058d5495" x="43.068359" y="106.182099" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_14">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="111.025849" transform="rotate(-0 36.068359 111.025849)">70</text>
     </g>
    </g>
    <g id="pcytick_5">
     <g id="pcline2d_14">
      <g>
       <use xlink:href="#pcma2058d5495" x="43.068359" y="64.030741" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_15">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="68.874491" transform="rotate(-0 36.068359 68.874491)">80</text>
     </g>
    </g>
    <g id="pcytick_6">
     <g id="pcline2d_15">
      <g>
       <use xlink:href="#pcma2058d5495" x="43.068359" y="21.879384" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="pctext_16">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="26.723134" transform="rotate(-0 36.068359 26.723134)">90</text>
     </g>
    </g>
    <g id="pctext_17">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="16.8875" y="129.168" transform="rotate(-90 16.8875 129.168)">weight (kg)</text>
    </g>
   </g>
   <g id="pcline2d_16">
    <path d="M 174.822131 142.105883 
L 169.820232 136.935537 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_17">
    <path d="M 71.519228 237.163429 
L 68.955894 234.513771 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_18">
    <path d="M 207.604926 109.844218 
L 202.876335 104.956384 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_19">
    <path d="M 141.962668 190.309906 
L 128.757718 176.660258 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_20">
    <path d="M 245.463787 72.811601 
L 240.938673 68.134096 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_21">
    <path d="M 151.126094 164.116929 
L 146.580438 159.418191 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_22">
    <path d="M 211.840775 110.776774 
L 204.598361 103.29046 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_23">
    <path d="M 115.666478 233.661728 
L 93.510265 210.759368 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_24">
    <path d="M 176.309204 134.497035 
L 174.390725 132.513948 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_25">
    <path d="M 74.675927 220.11642 
L 79.105334 224.694994 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_26">
    <path d="M 202.720344 99.944115 
L 205.300518 102.61118 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_27">
    <path d="M 184.640941 111.219989 
L 190.326667 117.09719 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_28">
    <path d="M 182.986175 127.750552 
L 181.211139 125.915739 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_29">
    <path d="M 182.196718 130.475799 
L 179.441465 127.627759 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_30">
    <path d="M 238.96001 86.090419 
L 230.943345 77.803781 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_31">
    <path d="M 160.901531 161.7947 
L 152.790467 153.410482 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcline2d_32">
    <path d="M 215.333825 97.952409 
L 212.81138 95.345017 
" clip-path="url(#pcpf48c209c63)" style="fill: none; stroke: #9aa5b1; stroke-width: 0.8; stroke-linecap: square"/>
   </g>
   <g id="pcpatch_3">
    <path d="M 43.068359 251.136 
L 43.068359 7.2 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="pcpatch_4">
    <path d="M 43.068359 251.136 
L 388.709491 251.136 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="pcPathCollection_2">
    <defs>
     <path id="pcm2143f4415d" d="M 0 1.870829 
C 0.49615 1.870829 0.972045 1.673706 1.322876 1.322876 
C 1.673706 0.972045 1.870829 0.49615 1.870829 0 
C 1.870829 -0.49615 1.673706 -0.972045 1.322876 -1.322876 
C 0.972045 -1.673706 0.49615 -1.870829 0 -1.870829 
C -0.49615 -1.870829 -0.972045 -1.673706 -1.322876 -1.322876 
C -1.673706 -0.972045 -1.870829 -0.49615 -1.870829 0 
C -1.870829 0.49615 -1.673706 0.972045 -1.322876 1.322876 
C -0.972045 1.673706 -0.49615 1.870829 0 1.870829 
z
" style="stroke: #e8743b"/>
    </defs>
    <g clip-path="url(#pcpf48c209c63)">
     <use xlink:href="#pcm2143f4415d" x="169.820232" y="136.935537" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="68.955894" y="234.513771" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="202.876335" y="104.956384" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="128.757718" y="176.660258" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="240.938673" y="68.134096" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="146.580438" y="159.418191" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="204.598361" y="103.29046" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="93.510265" y="210.759368" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="174.390725" y="132.513948" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="79.105334" y="224.694994" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="205.300518" y="102.61118" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="190.326667" y="117.09719" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="181.211139" y="125.915739" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="179.441465" y="127.627759" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="230.943345" y="77.803781" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="152.790467" y="153.410482" style="fill: #e8743b; stroke: #e8743b"/>
     <use xlink:href="#pcm2143f4415d" x="212.81138" y="95.345017" style="fill: #e8743b; stroke: #e8743b"/>
    </g>
   </g>
   <g id="pcpatch_5">
    <path d="M 171.605343 135.208584 
Q 209.806614 98.251889 245.918653 63.31636 
" style="fill: none; stroke: #d64545; stroke-width: 2.6; stroke-linecap: round"/>
    <path d="M 241.653179 64.660134 
L 245.918653 63.31636 
L 244.434387 67.535004 
z
" style="fill: #d64545; stroke: #d64545; stroke-width: 2.6; stroke-linecap: round"/>
   </g>
   <g id="pcpatch_6">
    <path d="M 168.775695 135.164321 
Q 161.311897 127.449168 155.558317 121.501826 
" style="fill: none; stroke: #d64545; stroke-width: 2.2; stroke-linecap: round"/>
    <path d="M 156.90209 125.767301 
L 155.558317 121.501826 
L 159.77696 122.986092 
z
" style="fill: #d64545; stroke: #d64545; stroke-width: 2.2; stroke-linecap: round"/>
   </g>
   <g id="pctext_18">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #d64545" transform="translate(253.660186 61.66061)">PC1: 95%</text>
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; fill: #d64545" transform="translate(253.660186 72.550259)">of the spread</text>
   </g>
   <g id="pctext_19">
    <text fill="currentColor" style="font-size: 9px; font-family: inherit; text-anchor: start; fill: #d64545" x="89.228512" y="114.079431" transform="rotate(-0 89.228512 114.079431)">PC2: 5%</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="pcpf48c209c63">
   <rect x="43.068359" y="7.2" width="345.641131" height="243.936"/>
  </clipPath>
 </defs>
</svg><figcaption>The 200 people (blue) with their principal axes drawn from the mean (red, each 2 standard deviations long). PC1 runs along the length of the cloud, PC2 across it. Projecting a point onto PC1 (grey lines to the orange dots) replaces two numbers with one while keeping 95% of the spread.</figcaption></figure>
  <p>In practice PCA is used to compress correlated features before a model, to plot high-dimensional data in 2-D, to remove noise by dropping the smallest components, and to speed up distance-based methods. The number of components k is usually chosen by looking at the cumulative explained variance ratio, for example keeping enough components for 90–95%, or by looking for the "elbow" where extra components add little. Its limits are just as important. PCA only finds straight-line (linear) structure, so curved patterns need methods like t-SNE or UMAP. It is unsupervised: it keeps the directions of greatest spread, which are not necessarily the ones that predict your target. The components are mixes of all the original features, so they are hard to explain to stakeholders. And because it is built on variance, it must be run on standardised data whenever features have different units, as section 10 shows. The full treatment is in <a class="xref" data-note="ml_pca">PCA</a> and <a class="xref" data-note="ml_dimred">Dimensionality Reduction</a>.</p>

  <h2 id="mla-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most frequent bug in NumPy linear algebra is using <code>*</code> where <code>@</code> was meant. <code>*</code> multiplies element by element and uses broadcasting to stretch shapes so they fit, so it rarely raises an error; it just returns the wrong thing. A related surprise is that <code>.T</code> does nothing to a 1-D array, because a 1-D array has no rows or columns to swap:</p>
  <div class="fx" data-lang="py">w = np.array([2., 0.])
print(X * w)                      # element-wise: a 3x2 table, no adding across rows
print(X @ w)                      # matrix x vector: 3 predictions
v = np.array([1., 2., 3.])
print(v.shape, v.T.shape)         # .T does nothing to a 1-D array
print(v.reshape(-1, 1).shape)     # make an explicit column if you need one</div>
  <div class="fx" data-lang="text">[[2. 0.]
 [4. 0.]
 [6. 0.]]
[2. 4. 6.]
(3,) (3,)
(3, 1)</div>
  <p><code>X * w</code> multiplied the size column by 2 and the rooms column by 0 and returned a 3 × 2 table, while <code>X @ w</code> returned the three predictions. And <code>v.T</code> has the same shape <code>(3,)</code> as <code>v</code>; if you genuinely need a column vector, reshape it to <code>(3, 1)</code>. Writing down the expected shape of every result is the cheapest defence against both.</p>
  <p>The second mistake is computing an inverse in order to solve a system, <code>np.linalg.inv(A) @ b</code>, instead of <code>np.linalg.solve(A, b)</code>. On friendly matrices both work, but on ill-conditioned ones the inverse loses far more accuracy:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.linalg import hilbert
A = hilbert(12)                           # a famously ill-conditioned matrix
x_true = np.ones(12)
b = A @ x_true
x_inv = np.linalg.inv(A) @ b
x_solve = np.linalg.solve(A, b)
print(f"{np.linalg.cond(A):.1e}")
print(f"{np.linalg.norm(A @ x_inv - b):.1e}", f"{np.linalg.norm(A @ x_solve - b):.1e}")</div>
  <div class="fx" data-lang="text">1.6e+16
2.4e-01 6.0e-16</div>
  <p>The 12 × 12 Hilbert matrix has a condition number of about 10¹⁶. The solution found through the inverse leaves a residual (how far A x is from b) of 0.24, while <code>solve</code> leaves 6 × 10⁻¹⁶, essentially perfect. Use <code>solve</code> for square systems and <code>lstsq</code> for least squares, and do not form XᵀX at all when accuracy matters.</p>
  <p>The third mistake is running PCA, or any distance-based method, on features with different units:</p>
  <div class="fx" data-lang="py">from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
Xft = X * np.array([1000, 1])                    # size in plain square feet
print(PCA(1).fit(Xft).components_, PCA(1).fit(Xft).explained_variance_ratio_)
Z = StandardScaler().fit_transform(Xft)          # every column: mean 0, std 1
print(PCA(1).fit(Z).components_, PCA(1).fit(Z).explained_variance_ratio_)</div>
  <div class="fx" data-lang="text">[[1.    0.001]] [1.]
[[0.707 0.707]] [0.75]</div>
  <p>With size in square feet, PC1 is (1, 0.001), simply "size", and it claims 100% of the variance, because the size column's variance is about a million times larger than the rooms column's. After standardising each column, PC1 is the balanced (0.707, 0.707) with 75%, the answer we found by hand. Always standardise first unless the features genuinely share a unit.</p>
  <p>A few more mistakes come up regularly. Comparing eigenvectors or PCA components across libraries or runs without allowing for a sign flip: v and −v are the same direction, so a component that "changed sign" is not a bug. Forgetting to centre before an SVD and calling it PCA, which finds the direction of the mean rather than the direction of spread. Fitting PCA or a scaler on the whole dataset before splitting into train and test, which leaks test information into training; fit on the training data and only transform the test data. Reading matrix chains left to right: in <code>R @ S @ p</code>, S acts first. And trying to eigen-decompose a non-square matrix such as a 1000 × 50 data table, where the right tool is SVD (eigen-decomposing the 50 × 50 XᵀX also works but squares the condition number and loses accuracy).</p>

  <h2 id="mla-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>X = [[1, 1], [2, 3], [3, 2]] (size in 1000 sq ft, rooms) for houses A, B, C; prices y = [2, 4, 6] (₹ crore).</p>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value on the houses</th></tr>
    <tr><td>‖B‖ (L2), L1, L∞</td><td>√13 = 3.606, 5, 3</td></tr>
    <tr><td>Distances A–B, B–C, A–C</td><td>2.236, 1.414, 2.236</td></tr>
    <tr><td>A·B, B·C; cos(A, B), cos(B, C)</td><td>5, 12; 0.981, 0.923</td></tr>
    <tr><td>X·[1, 1]; errors</td><td>[2, 5, 5]; [0, 1, −1]</td></tr>
    <tr><td>XᵀX; Xᵀy; det(XᵀX)</td><td>[[14, 13], [13, 14]]; [28, 26]; 27</td></tr>
    <tr><td>Normal equations</td><td>w = [2, 0]</td></tr>
    <tr><td>Eigen of XᵀX</td><td>27 along (1, 1), 1 along (1, −1)</td></tr>
    <tr><td>SVD of X</td><td>σ = 5.196, 1; energy 96.4%, 3.6%</td></tr>
    <tr><td>PCA</td><td>C = [[1, 0.5], [0.5, 1]]; PC1 (0.707, 0.707), 75%; scores −1.414, 0.707, 0.707</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>Vector</b>: an ordered list of numbers; one row of data, or an arrow. <b>Matrix</b>: a table; shape rows × columns.</li>
    <li><b>Norm</b>: a vector's length. L2 = √(Σxᵢ²), L1 = Σ|xᵢ|, L∞ = max|xᵢ|. <b>Distance</b> = ‖a − b‖. <b>Unit vector</b> = v / ‖v‖.</li>
    <li><b>Dot product</b>: a·b = Σaᵢbᵢ = ‖a‖‖b‖cos θ. <b>Cosine similarity</b> = a·b / (‖a‖‖b‖), from −1 to 1. <b>Orthogonal</b>: a·b = 0.</li>
    <li><b>Transpose</b> Aᵀ: rows ↔ columns; (AB)ᵀ = BᵀAᵀ. <b>Symmetric</b>: A = Aᵀ.</li>
    <li><b>Identity</b> I: Ix = x. <b>Inverse</b>: A⁻¹A = I; exists only for square A with det ≠ 0.</li>
    <li><b>Determinant</b>: area scale factor; 2×2: ad − bc; = product of eigenvalues.</li>
    <li><b>Rank</b>: number of independent columns. <b>Singular</b>: square, rank &lt; size, det = 0.</li>
    <li><b>Condition number</b>: how much a matrix amplifies errors; λmax/λmin for symmetric positive matrices.</li>
    <li><b>Eigenvector / eigenvalue</b>: Av = λv; a direction only stretched, by λ. Trace = Σλ.</li>
    <li><b>SVD</b>: M = UΣVᵀ for any shape; σᵢ² = eigenvalues of MᵀM; top-k = best rank-k approximation.</li>
    <li><b>PCA</b>: eigenvectors of the covariance matrix of centred data; explained variance ratio = λᵢ / Σλ.</li>
  </ul>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th>Choice</th><th>Use the first when</th><th>Use the second when</th></tr>
    <tr><td>Euclidean vs cosine</td><td>magnitude matters and features share a scale</td><td>only direction / mix matters (text, embeddings)</td></tr>
    <tr><td>L2 vs L1 penalty</td><td>shrink all weights smoothly (ridge)</td><td>want exact zeros / feature selection (lasso)</td></tr>
    <tr><td><code>solve</code> vs <code>lstsq</code></td><td>square system A x = b</td><td>least squares straight from X; most stable</td></tr>
    <tr><td>Eigen vs SVD</td><td>square (ideally symmetric) matrix: <code>eigh</code></td><td>any shape; data tables; more accurate PCA</td></tr>
    <tr><td>Normal equations vs gradient descent</td><td>linear model, d up to thousands</td><td>huge d or n, or non-linear models</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">np.linalg.norm(v)                      # L2 length; ord=1 for L1, ord=np.inf for L-infinity
a @ b                                  # dot product (1-D) or matrix product (2-D)
a @ b / (np.linalg.norm(a) * np.linalg.norm(b))   # cosine similarity
X.T                                    # transpose
np.linalg.det(A); np.linalg.inv(A)     # determinant, inverse (rarely needed)
np.linalg.solve(X.T @ X, X.T @ y)      # normal equations
np.linalg.lstsq(X, y, rcond=None)[0]   # least squares, more stable
np.linalg.matrix_rank(X); np.linalg.cond(A)
vals, vecs = np.linalg.eigh(S)         # symmetric: ascending values, vectors as COLUMNS
U, s, Vt = np.linalg.svd(X, full_matrices=False)
PCA(n_components=k).fit(StandardScaler().fit_transform(X))   # components_ are ROWS</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>*</code> is element-wise; <code>@</code> is matrix multiplication. <code>.T</code> does nothing to a 1-D array.</li>
    <li>Shape rule: (n×k)(k×m) → (n×m). AB ≠ BA. In <code>R @ S @ p</code>, S acts first.</li>
    <li>Scale features before distances, kNN, k-means and PCA.</li>
    <li>Raw dot products favour long vectors; normalise when only direction matters.</li>
    <li>Duplicate or collinear columns make XᵀX singular; drop one or use ridge (+λI lifts every eigenvalue by λ).</li>
    <li>Use <code>solve</code> / <code>lstsq</code>, not <code>inv</code>.</li>
    <li>Eigenvector and singular-vector signs are arbitrary.</li>
    <li>Centre before SVD if you want PCA; fit PCA and scalers on training data only.</li>
    <li>Without a nonlinearity, stacked layers collapse into one matrix.</li>
  </ul>

  <h2 id="mla-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are vectors and matrices in an ML context?</summary><div class="qa-body">A vector is an ordered list of numbers; in ML it is usually one data point (a row of features), a weight vector or an embedding. A matrix is a table of numbers: a whole dataset (samples × features), a batch, or a layer's weights. A matrix can also be read as a transformation that maps input vectors to output vectors, which is how a linear model or a neural layer works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between the L1 and L2 norms, and why does the L1 penalty give sparse models?</summary><div class="qa-body">L2 is the straight-line length √(Σxᵢ²); L1 is the sum of absolute values Σ|xᵢ|. L2 squares entries, so it punishes big weights heavily but barely cares about tiny ones, and ridge shrinks all weights smoothly without reaching zero. L1 charges the same per unit at every size, so pushing a small weight all the way to zero still saves as much as shrinking a large one; geometrically its constraint region has corners on the axes, where the optimum tends to land. That is why lasso sets some weights exactly to zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the dot product measure geometrically?</summary><div class="qa-body">a·b = ‖a‖‖b‖cos θ: the lengths of the two vectors times the cosine of the angle between them. It is large when they point the same way, 0 when they are perpendicular and negative when they point in opposite directions. It is also the length of a's projection onto b's direction, times ‖b‖, which is why it appears in projections, attention scores and predictions (w·x).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use cosine similarity instead of Euclidean distance?</summary><div class="qa-body">When only the direction or mix of a vector matters, not its size: text embeddings, TF-IDF vectors, user taste profiles. A long and a short document on the same topic have a large Euclidean distance but a cosine near 1. Use Euclidean distance when magnitude carries meaning and features share a scale. For unit-normalised vectors the two give the same ranking, since ‖a − b‖² = 2 − 2 cos θ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A is 64 × 10 and B is 10 × 3. What are the shapes of AB, BA and AᵀA?</summary><div class="qa-body">AB is 64 × 3 (the inner 10s match). BA is not defined, because the inner sizes 3 and 64 differ. AᵀA is (10 × 64)(64 × 10) = 10 × 10, square and symmetric: every column of A dotted with every other column.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is matrix multiplication commutative? Why not?</summary><div class="qa-body">No. Each matrix is a transformation, and applying transformations in a different order gives a different result: stretching then rotating the point (1, 1) gives (−1, 2), rotating then stretching gives (−2, 1). Often BA is not even a valid shape. Matrix multiplication is associative, (AB)C = A(BC), and the transpose of a product reverses the order: (AB)ᵀ = BᵀAᵀ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>a = np.array([1, 2]); print(a @ a, a * a, a.T.shape)</code></summary><div class="qa-body"><code>5 [1 4] (2,)</code>. <code>a @ a</code> is the dot product 1 + 4 = 5; <code>a * a</code> is element-wise; and transposing a 1-D array changes nothing, so its shape stays <code>(2,)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a matrix inverse, and when does it not exist?</summary><div class="qa-body">The inverse A⁻¹ undoes A, so A⁻¹A = I. It exists only for square matrices with a non-zero determinant, that is, full rank. If a matrix squashes space onto a lower dimension (columns are linearly dependent, det = 0, an eigenvalue is 0), different inputs land on the same output and there is no way to undo it; such a matrix is called singular.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the determinant tell you?</summary><div class="qa-body">It is the factor by which the matrix scales areas (volumes in higher dimensions), with a negative sign if it flips orientation. A determinant of 0 means space is squashed flat, so the matrix is singular and has no inverse. It equals the product of the eigenvalues. For a 2 × 2 matrix [[a, b], [c, d]] it is ad − bc. A tiny but non-zero determinant does not by itself mean ill-conditioning; the condition number is the right measure for that.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the rank of a matrix, and what does a rank-deficient feature matrix mean for regression?</summary><div class="qa-body">Rank is the number of linearly independent columns (equivalently rows), the number of dimensions that survive the transformation. If a feature matrix has rank less than its number of columns, some feature is an exact combination of others (size in two units, all one-hot columns plus an intercept). Then XᵀX is singular and infinitely many weight vectors fit equally well. Drop the redundant column or add ridge regularisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the normal equations for linear regression.</summary><div class="qa-body">We minimise ‖y − Xw‖². The predictions Xw are combinations of X's columns, and the closest one to y leaves an error perpendicular to every column, so Xᵀ(y − Xw) = 0. (Equivalently, the gradient −2Xᵀ(y − Xw) is set to zero.) Rearranging gives XᵀX w = Xᵀy, and w = (XᵀX)⁻¹Xᵀy when XᵀX is invertible. In code, use <code>solve(X.T @ X, X.T @ y)</code> or <code>lstsq(X, y)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>np.linalg.solve</code> instead of <code>inv(A) @ b</code>, and when would you not use the normal equations at all?</summary><div class="qa-body">Solve factorises A once and back-substitutes: about a third of the work and much less rounding error, especially on ill-conditioned matrices, and you never needed A⁻¹ itself. The normal equations cost about n·d² + d³ and square the condition number, so for very many features, data that does not fit in memory, near-collinear features, or non-linear models, you use gradient descent or a QR/SVD-based solver such as <code>lstsq</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does multicollinearity show up in linear algebra, and how does ridge fix it?</summary><div class="qa-body">Highly correlated features make XᵀX nearly singular: one eigenvalue is close to 0, the condition number is huge, and the solved weights become large and unstable, often with opposite signs on the correlated features. Ridge solves (XᵀX + λI)w = Xᵀy instead. Adding λI adds λ to every eigenvalue, so the smallest one is at least λ, the matrix becomes well conditioned, and the weight is shared sensibly across the correlated features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are eigenvectors and eigenvalues, intuitively?</summary><div class="qa-body">An eigenvector of a square matrix is a direction the matrix does not turn, only stretches, shrinks or flips: Av = λv. The eigenvalue λ is the stretch factor. Along its eigenvectors a complicated matrix acts like simple multiplication by a number. For a covariance matrix, eigenvectors are the directions of spread in the data and eigenvalues are the variances along them; for a Hessian, they are the directions and amounts of curvature of the loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are the eigenvectors of a covariance matrix perpendicular, and its eigenvalues non-negative?</summary><div class="qa-body">A covariance matrix is symmetric, and symmetric matrices always have real eigenvalues and can be given perpendicular eigenvectors (the spectral theorem). It is also positive semi-definite: the variance along any direction v is vᵀCv, which can never be negative, and for a unit eigenvector that variance equals its eigenvalue. That is why PCA components are uncorrelated, perpendicular axes with non-negative variances.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is SVD, and how are singular values related to eigenvalues?</summary><div class="qa-body">Any matrix can be written M = UΣVᵀ: a rotation, a stretch along the axes by the singular values, and another rotation. Unlike eigen-decomposition it works for any shape. Since MᵀM = VΣ²Vᵀ, the right singular vectors are the eigenvectors of MᵀM and the singular values are the square roots of its eigenvalues. Keeping the top k singular values gives the best rank-k approximation, which is used in compression, recommenders and LoRA.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the steps of PCA.</summary><div class="qa-body">Standardise (or at least centre) each feature. Compute the covariance matrix C = XᵀX/(n − 1) of the centred data. Find its eigenvectors and eigenvalues and sort them by eigenvalue, largest first. Choose k, for example enough components to explain 90–95% of the variance. Project the centred data onto the top k eigenvectors to get the scores. Libraries do the same thing through the SVD of the centred data, where the components are V and the variances are σ²/(n − 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you standardise before PCA, and what are PCA's main limitations?</summary><div class="qa-body">PCA maximises variance, and variance depends on units, so a feature measured in large units dominates PC1 regardless of its importance: size in square feet takes 100% of the variance from rooms. Standardising gives every feature an equal starting weight. Limitations: it finds only linear structure, it is unsupervised so the top components may not predict the target, components are hard to interpret, it is sensitive to outliers, and it must be fitted on training data only to avoid leakage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your PCA components from two libraries have opposite signs. Is that a bug?</summary><div class="qa-body">No. If v is an eigenvector or singular vector, so is −v; both describe the same axis with the same variance, and the scores simply flip sign. Compare components up to sign (for example with absolute values or by checking that the dot product is ±1), and if you need stable signs, fix a convention such as making the largest entry positive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dense neural-network layer in linear-algebra terms, and why is the activation function necessary?</summary><div class="qa-body">A dense layer computes f(XW + b): X is the batch (batch × inputs), W the weight matrix (inputs × outputs), b a bias vector broadcast over rows, and f a nonlinearity such as ReLU. Without f, two layers give (XW₁)W₂ = X(W₁W₂), which is just one matrix, so any depth collapses to a single linear model. The nonlinearity is what lets stacked layers represent curved functions.</div></details>
</main>
`
});
